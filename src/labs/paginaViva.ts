import { parse } from 'acorn';
import BASTIDOR from './paginaViva.harness.js?raw';

/**
 * A página viva: os três arquivos da lição montados numa página só, que a
 * prévia desenha e a conferência percorre.
 *
 * ── Por que a página é remontada, e não servida ──────────────────────────
 * O `index.html` de quem estuda diz `<link href="estilo.css">` e
 * `<script src="script.js">`, e a prévia é um `iframe` sem servidor por trás:
 * não há de onde baixar os dois. Então cada um entra no lugar onde a pessoa o
 * pôs — a folha como `<style>`, o script como um endereço `data:` com o texto
 * dentro. O lugar importa, e é por isso que eles não são simplesmente
 * acrescentados no fim: o script posto no `<head>` sem `defer` roda antes de
 * o `<body>` existir e não acha nada, e é esse o primeiro erro de DOM de todo
 * mundo. Um `<script>` embutido perderia o `defer`; o `data:` o mantém, que é
 * o que o navegador faria com o arquivo de verdade.
 *
 * O painel Elementos mostra as duas tags como a pessoa as escreveu — o
 * bastidor lê `data-trilha-arquivo` e desenha o `<link>` e o `src` originais.
 *
 * ── A prévia não fala com a plataforma ───────────────────────────────────
 * O `iframe` tem `sandbox="allow-scripts allow-forms allow-modals"`, e não
 * `allow-same-origin`: o script de quem estuda roda numa origem opaca e não
 * alcança a sessão de ninguém, nem o armazenamento da plataforma. Tudo o que
 * atravessa vai por `postMessage`, e a plataforma só ouve mensagens que vêm
 * daquele `iframe`.
 */

export type Arquivos = Record<string, string>;

export interface ConfiguracaoDaPagina {
  /** A rede começa desligada — a falha que o módulo 7 manda tratar. */
  offline?: boolean;
  /** As linhas do script.js em que se pôs uma parada. */
  paradas?: number[];
  /** O arquivo do script em que as paradas valem. */
  arquivoDasParadas?: string;
}

export const PARA_BASE64 = (texto: string): string => {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
};

export const escaparAtributo = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* O nome do arquivo de um `href` ou `src`, como o navegador o resolveria a
   partir da própria pasta: `./script.js` e `script.js` são o mesmo. */
export const nomeLocal = (endereco: string) => endereco.trim().replace(/^\.\//, '');

/** Cada `<link rel="stylesheet">` que aponta um arquivo da pasta vira um `<style>` com o arquivo dentro, no mesmo lugar. */
export function embutirFolhas(html: string, arquivos: Arquivos): string {
  return html.replace(/<link\b[^>]*>/gi, tag => {
    const href = /\bhref\s*=\s*["']?([^"'\s>]+)/i.exec(tag)?.[1];
    const rel = /\brel\s*=\s*["']?([^"'\s>]+)/i.exec(tag)?.[1];
    if (!href || (rel ?? '').toLowerCase() !== 'stylesheet') return tag;
    const nome = nomeLocal(href);
    if (!(nome in arquivos)) return tag;
    /* `</style` dentro da folha fecharia a tag no meio. Ninguém escreve isso
       numa folha de estilo, e se escrever o efeito é o mesmo do navegador:
       a regra seguinte não vale. */
    return `<style data-trilha-arquivo="${escaparAtributo(nome)}">${arquivos[nome].replace(/<\/style/gi, '<\\/style')}</style>`;
  });
}

/**
 * Monta a página que a prévia desenha.
 *
 * O bastidor entra antes de tudo o que a pessoa escreveu, logo depois do
 * `<head>` — antes do doctype ele faria o navegador desenhar em modo de
 * compatibilidade, e depois do script dela chegaria tarde para anotar o
 * primeiro erro.
 */
export function montarPagina(arquivos: Arquivos, config: ConfiguracaoDaPagina = {}): string {
  const html = arquivos['index.html'] ?? '';

  let corpo = embutirFolhas(html, arquivos);

  corpo = corpo.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (tag, atributos: string) => {
    const m = /\bsrc\s*=\s*["']?([^"'\s>]+)["']?/i.exec(atributos);
    if (!m) return tag;
    const nome = nomeLocal(m[1]);
    if (!(nome in arquivos)) return tag;
    let codigo = arquivos[nome];
    if (config.paradas?.length && (config.arquivoDasParadas ?? 'script.js') === nome) {
      codigo = instrumentar(codigo, config.paradas).codigo;
    }
    const endereco = `data:text/javascript;name=${encodeURIComponent(nome)};base64,${PARA_BASE64(`${codigo}\n//# sourceURL=${nome}`)}`;
    const resto = atributos.replace(m[0], '');
    return `<script data-trilha-arquivo="${escaparAtributo(nome)}" src="${endereco}"${resto}></script>`;
  });

  return comBastidor(corpo, { offline: !!config.offline });
}

/** O que o bastidor lê de `window.__TRILHA_CONFIG__`. */
export interface ConfiguracaoDoBastidor {
  offline: boolean;
  /** Os arquivos da pessoa, para a linha de cada `console.log`. Sem ela, os `script*.js`. */
  arquivos?: string[];
  /** Nome de cada biblioteca carregada de fora, pelo endereço. */
  bibliotecas?: Record<string, string>;
  /** Milissegundos antes do primeiro passo de um cenário. */
  esperaInicial?: number;
}

/**
 * Põe o bastidor na página, antes de tudo o que a pessoa escreveu e logo
 * depois do `<head>` — antes do doctype ele faria o navegador desenhar em
 * modo de compatibilidade, e depois do script dela chegaria tarde para
 * anotar o primeiro erro.
 */
export function comBastidor(corpo: string, config: ConfiguracaoDoBastidor): string {
  const bastidor = `<script data-trilha-interno>window.__TRILHA_CONFIG__=${JSON.stringify(config).replace(/</g, '\\u003c')};</script>`
    + `<script data-trilha-interno>${BASTIDOR}</script>`;

  const head = /<head\b[^>]*>/i.exec(corpo);
  if (head) return corpo.slice(0, head.index + head[0].length) + bastidor + corpo.slice(head.index + head[0].length);
  const htmlTag = /<html\b[^>]*>/i.exec(corpo);
  if (htmlTag) return corpo.slice(0, htmlTag.index + htmlTag[0].length) + bastidor + corpo.slice(htmlTag.index + htmlTag[0].length);
  const doctype = /<!doctype[^>]*>/i.exec(corpo);
  if (doctype) return corpo.slice(0, doctype.index + doctype[0].length) + bastidor + corpo.slice(doctype.index + doctype[0].length);
  return bastidor + corpo;
}

/**
 * Os arquivos de um exemplo da teoria: a marcação do tópico e o script dele.
 *
 * O exemplo roda na mesma página viva do laboratório — com o mesmo bastidor,
 * a mesma BrasilAPI guardada e o mesmo console —, e é a trava
 * `exemplosDeDom.test.ts` que a monta do mesmo jeito para conferir. O script
 * vai no fim do `<body>`, que é onde a lição ensina a pô-lo.
 */
export function arquivosDoExemplo(marcacao: string, script: string): Arquivos {
  return {
    'index.html': `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<style>body { font: 15px/1.5 system-ui, sans-serif; color: #201F1E; margin: 12px; background: #FFFFFF; }
input, button, select { font: inherit; padding: 3px 7px; } .escondido { display: none; } .destaque { color: #9A3B2F; font-weight: bold; }</style>
</head>
<body>
${marcacao}
<script src="script.js"></script>
</body>
</html>
`,
    'script.js': script,
  };
}

/* ────────────────────────────────────────────────────────────────────────
   As paradas
   ──────────────────────────────────────────────────────────────────────── */

type No = Record<string, unknown> & { type: string; start: number; end: number; loc: { start: { line: number }; end: { line: number } } };

function ler(fonte: string): No | null {
  for (const sourceType of ['script', 'module'] as const) {
    try {
      return parse(fonte, { ecmaVersion: 'latest', sourceType, locations: true }) as unknown as No;
    } catch { /* tenta o outro */ }
  }
  return null;
}

const CORPOS = new Set(['Program', 'BlockStatement', 'StaticBlock']);

/** Onde uma instrução começa: são as únicas linhas em que uma parada pode ficar. */
interface Lugar { linha: number; inicio: number; nomes: string[] }

/*
  Os nomes que se enxergam numa instrução: os parâmetros e as declarações de
  toda função e todo bloco que a envolvem, e os do programa. Os declarados
  mais abaixo no mesmo bloco entram também — com `let` e `const` eles existem
  e ainda não valem, e o painel diz isso, que é o que o navegador diz.
*/
function lugaresDe(arvore: No): Lugar[] {
  const lugares: Lugar[] = [];
  const nomesDoPadrao = (p: unknown, nomes: string[]) => {
    const n = p as No | null;
    if (!n) return;
    if (n.type === 'Identifier') nomes.push(String(n.name));
    else if (n.type === 'ObjectPattern') for (const pr of n.properties as No[]) nomesDoPadrao(pr.type === 'RestElement' ? pr.argument : pr.value, nomes);
    else if (n.type === 'ArrayPattern') for (const el of n.elements as No[]) nomesDoPadrao(el, nomes);
    else if (n.type === 'RestElement') nomesDoPadrao(n.argument, nomes);
    else if (n.type === 'AssignmentPattern') nomesDoPadrao(n.left, nomes);
  };
  const declaradosNo = (corpo: No[]): string[] => {
    const nomes: string[] = [];
    for (const s of corpo) {
      if (s.type === 'VariableDeclaration') for (const d of s.declarations as No[]) nomesDoPadrao(d.id, nomes);
      else if ((s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration') && s.id) nomes.push(String((s.id as No).name));
      else if (s.type === 'ExportNamedDeclaration' && s.declaration) {
        const d = s.declaration as No;
        if (d.type === 'VariableDeclaration') for (const x of d.declarations as No[]) nomesDoPadrao(x.id, nomes);
        else if (d.id) nomes.push(String((d.id as No).name));
      }
    }
    return nomes;
  };

  const andar = (n: No, visiveis: string[]) => {
    if (!n || typeof n !== 'object') return;
    let aqui = visiveis;
    if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') {
      const params: string[] = [];
      for (const p of n.params as No[]) nomesDoPadrao(p, params);
      aqui = [...visiveis, ...params];
    }
    if (n.type === 'ForStatement' || n.type === 'ForOfStatement' || n.type === 'ForInStatement') {
      const ini = (n.init ?? n.left) as No | null;
      if (ini?.type === 'VariableDeclaration') {
        const nomes: string[] = [];
        for (const d of ini.declarations as No[]) nomesDoPadrao(d.id, nomes);
        aqui = [...aqui, ...nomes];
      }
    }
    if (n.type === 'CatchClause' && n.param) {
      const nomes: string[] = [];
      nomesDoPadrao(n.param, nomes);
      aqui = [...aqui, ...nomes];
    }
    if (CORPOS.has(n.type)) {
      const corpo = n.body as No[];
      const comBloco = [...aqui, ...declaradosNo(corpo)];
      for (const s of corpo) {
        if (s.type !== 'FunctionDeclaration' && s.type !== 'ClassDeclaration' && !s.type.startsWith('Import') && !s.type.startsWith('Export')) {
          lugares.push({ linha: s.loc.start.line, inicio: s.start, nomes: comBloco });
        }
        andar(s, comBloco);
      }
      return;
    }
    if (n.type === 'SwitchCase') {
      for (const s of n.consequent as No[]) {
        lugares.push({ linha: s.loc.start.line, inicio: s.start, nomes: aqui });
        andar(s, aqui);
      }
      if (n.test) andar(n.test as No, aqui);
      return;
    }
    for (const k of Object.keys(n)) {
      if (k === 'loc') continue;
      const v = n[k];
      if (Array.isArray(v)) for (const x of v) { if (x && typeof x === 'object' && 'type' in x) andar(x as No, aqui); }
      else if (v && typeof v === 'object' && 'type' in (v as object)) andar(v as No, aqui);
    }
  };
  andar(arvore, []);

  /* Uma por linha: a primeira instrução que começa nela. */
  const porLinha = new Map<number, Lugar>();
  for (const l of lugares.sort((a, b) => a.inicio - b.inicio)) if (!porLinha.has(l.linha)) porLinha.set(l.linha, l);
  return [...porLinha.values()].sort((a, b) => a.linha - b.linha);
}

/** As linhas em que uma parada pode ficar, em ordem. Vazio quando o arquivo não se lê. */
export function linhasComParada(codigo: string): number[] {
  const a = ler(codigo);
  return a ? lugaresDe(a).map(l => l.linha) : [];
}

/**
 * A linha em que a parada fica de fato. Clicar numa linha que não começa
 * instrução — um `}` sozinho, uma linha em branco, o meio de um objeto —
 * escorrega a parada para a primeira linha de instrução logo abaixo, que é o
 * que o navegador faz.
 */
export function linhaDaParada(codigo: string, pedida: number): number | null {
  const linhas = linhasComParada(codigo);
  return linhas.find(l => l >= pedida) ?? null;
}

/**
 * Põe uma chamada ao bastidor no começo de cada linha com parada.
 *
 * ── A parada não para ────────────────────────────────────────────────────
 * O depurador de verdade suspende o programa naquela linha. Isso não se faz
 * de fora de um `iframe`: o script dele roda inteiro de uma vez, e só um
 * protocolo de depuração que a página não tem conseguiria segurá-lo. O que a
 * chamada faz é anotar, naquele instante, o valor de cada variável que se
 * enxerga dali — que é exatamente o que o painel de escopo do navegador
 * mostraria se tivesse parado — e o programa segue. O painel Fontes mostra
 * cada passagem, com Anterior e Próxima, e diz que o programa já seguiu.
 *
 * A chamada entra **na mesma linha**, antes da instrução, e é por isso que o
 * número da linha de qualquer erro continua batendo com o que a pessoa vê.
 * Cada variável se lê dentro de um `try`, porque um `let` declarado mais
 * abaixo existe e ainda não vale, e ler direto lançaria o erro de antes da
 * declaração no programa de alguém que só queria olhar.
 */
export function instrumentar(codigo: string, paradas: number[]): { codigo: string; efetivas: number[] } {
  const a = ler(codigo);
  if (!a) return { codigo, efetivas: [] };
  const lugares = lugaresDe(a);
  const efetivas = [...new Set(paradas.map(p => lugares.find(l => l.linha >= p)?.linha).filter((x): x is number => x !== undefined))];
  const escolhidos = lugares.filter(l => efetivas.includes(l.linha)).sort((x, y) => y.inicio - x.inicio);
  let saida = codigo;
  for (const l of escolhidos) {
    const nomes = [...new Set(l.nomes)].filter(n => /^[A-Za-z_$][\w$]*$/.test(n));
    const leitura = nomes.map(n => `${JSON.stringify(n)}:(()=>{try{return ${n}}catch(e){return window.__trilhaNaoIniciada}})()`).join(',');
    saida = `${saida.slice(0, l.inicio)}window.__trilhaParada(${l.linha},()=>({${leitura}}));${saida.slice(l.inicio)}`;
  }
  return { codigo: saida, efetivas: efetivas.sort((x, y) => x - y) };
}

/* ────────────────────────────────────────────────────────────────────────
   O que a página diz ao anfitrião
   ──────────────────────────────────────────────────────────────────────── */

export interface EntradaDoConsole {
  /** `eco` é o que se digitou no console, e `resultado`, o que ele respondeu. */
  nivel: 'log' | 'info' | 'warn' | 'error' | 'eco' | 'resultado';
  texto: string;
  arquivo?: string | null;
  linha?: number | null;
  /** Erro que escapou, e não um `console.error` escrito de propósito. */
  erro?: boolean;
}

export interface RequisicaoDaPagina {
  id: number;
  url: string;
  metodo: string;
  estado: 'pendente' | 'pronta' | 'falha';
  status: number | null;
  /** `cache` é a resposta guardada; `rede`, a que foi de fato à internet. */
  origem: '' | 'cache' | 'rede';
  erro?: string;
}

export interface NoDaArvore {
  id: number;
  tag?: string;
  atributos?: [string, string][];
  filhos?: NoDaArvore[];
  texto?: string;
}

export interface DetalhesDoElemento {
  id: number;
  tag: string;
  idDoElemento: string;
  classes: string[];
  nome: string;
  largura: number;
  altura: number;
  estilos: Record<string, string>;
  texto: string;
}

export interface VariavelNaParada { nome: string; valor: string; tipo: string }
export interface Parada { linha: number; variaveis: VariavelNaParada[]; vez: number }

export type Passo =
  | { acao: 'clicar' | 'limpar' | 'enviar'; seletor: string }
  | { acao: 'digitar' | 'escolher'; seletor: string; texto: string }
  | { acao: 'esperar' }
  /** Vai a um endereço, como quem digita na barra: `#/unidade/ipe`. */
  | { acao: 'endereco'; texto: string }
  /** Liga ou desliga a rede no meio do cenário. */
  | { acao: 'rede'; online: boolean }
  | {
    acao: 'ler';
    chave: string;
    seletor: string;
    como: 'existe' | 'contagem' | 'texto' | 'textos' | 'valor' | 'classes' | 'classesDeTodos'
      | 'estilo' | 'visivel' | 'visiveis' | 'atributo' | 'titulo' | 'endereco';
    propriedade?: string;
  };

export interface ResultadoDoCenario {
  leituras: Record<string, unknown>;
  falhas: string[];
  recarregou: boolean;
  erros: EntradaDoConsole[];
  console: EntradaDoConsole[];
  requisicoes: { url: string; estado: string; status: number | null }[];
  /** As passagens pelas paradas, quando a página foi montada com alguma. */
  paradas: Parada[];
}

export type MensagemDaPagina =
  | { tipo: 'pronta'; arvore: NoDaArvore | null }
  | { tipo: 'console'; entrada: EntradaDoConsole }
  | { tipo: 'rede'; req: RequisicaoDaPagina }
  | { tipo: 'pedido'; id: number; url: string }
  | { tipo: 'recarga' }
  | { tipo: 'arvore'; arvore: NoDaArvore | null }
  | { tipo: 'detalhes'; detalhes: DetalhesDoElemento | null }
  | { tipo: 'escolhido'; id: number; arvore: NoDaArvore | null; detalhes: DetalhesDoElemento | null }
  | { tipo: 'parada'; parada: Parada }
  | { tipo: 'endereco'; hash: string }
  | { tipo: 'resultado'; vez: number; resultado: ResultadoDoCenario };

export const FONTE_DA_PAGINA = 'trilha-dom';

/** A mensagem veio do bastidor? Qualquer outra coisa que chegue é ignorada. */
export const ehDaPagina = (dado: unknown): dado is MensagemDaPagina & { fonte: string } =>
  !!dado && typeof dado === 'object' && (dado as { fonte?: unknown }).fonte === FONTE_DA_PAGINA;
