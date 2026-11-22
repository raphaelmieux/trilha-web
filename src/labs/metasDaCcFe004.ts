import { parse } from 'acorn';
import { visitar } from './esm';
import { feriadosDoAno, UFS } from './brasilApiGuardada';
import type { Arquivos, DetalhesDoElemento, Parada, Passo, ResultadoDoCenario } from './paginaViva';

/**
 * Os nove laboratórios da CC-FE004.
 *
 * ── Um laboratório, três arquivos ────────────────────────────────────────
 * Todos abrem a mesma janela: o editor com `index.html`, `estilo.css` e
 * `script.js`, a página ao lado e as ferramentas do navegador embaixo dela. O
 * que muda é de onde se parte e o que se cobra, e é isso que este registro
 * guarda — a décima lição não compila até dizer as duas coisas.
 *
 * Só o primeiro deixa mexer nos três. Do segundo em diante a página e a folha
 * chegam prontas e só o script se escreve, porque o assunto é o script, e uma
 * página editável deixaria fechar a tarefa de "criar um item para cada tarefa"
 * escrevendo os itens à mão no HTML.
 *
 * ── A tarefa se confere rodando a página ─────────────────────────────────
 * Cada meta lê o resultado de cenários: a página montada de novo, num
 * `iframe` escondido, com cliques e digitação que o bastidor faz e leituras
 * do que ficou. O que se confere é o que aparece, e não como foi escrito —
 * há muitos scripts certos para a mesma tela.
 *
 * O que separa o certo do decorado é a **variante**: o mesmo cenário, com a
 * página ou as constantes mudadas antes de rodar. Quem escreveu `5` no
 * contador acerta a página de cinco avisos e erra a de seis; quem escreveu os
 * catorze feriados à mão acerta 2026 e erra 2025. É a conta simulada da
 * CC-ES003 — mudar o dado dentro da conferência e ver se o resultado anda.
 */

export type LicaoDaCcFe004 =
  | 'juntos' | 'achar' | 'mudar' | 'criar-e-remover' | 'eventos'
  | 'formulario' | 'api' | 'ferramentas' | 'pagina';

export interface Cenario {
  id: string;
  /** A rede começa desligada. */
  offline?: boolean;
  /** Os arquivos mudados antes de rodar. Sem ela, os da pessoa como estão. */
  variante?: (a: Arquivos) => Arquivos;
  passos: Passo[];
}

/** O que a pessoa viu nas ferramentas do navegador — gesto, e não estado. */
export interface DescobertasDoDom {
  /** Os elementos escolhidos no painel Elementos, ou com a setinha. */
  inspecionados: DetalhesDoElemento[];
  /** Cada passagem por uma parada, com as variáveis daquele instante. */
  paradas: Parada[];
}

export interface ContextoDoDom {
  arquivos: Arquivos;
  /** A última conferência, por cenário. `null` quando não houve, ou ficou velha. */
  cenarios: Record<string, ResultadoDoCenario> | null;
  descobertas: DescobertasDoDom;
}

export interface MetaDoDom {
  id: string;
  titulo: string;
  passos: string[];
  feita: (ctx: ContextoDoDom) => boolean;
  /** O porquê, quando não fechou — dito como quem vê a tela veria. */
  motivo?: (ctx: ContextoDoDom) => string | undefined;
}

export interface DefinicaoDaLicaoDeDom {
  /** A pasta, como aparece na lateral do editor. */
  projeto: string;
  arquivos: Arquivos;
  /** O que se pode escrever. O resto abre só de leitura. */
  editaveis: string[];
  /** O arquivo que abre primeiro. */
  abre: string;
  cenarios: Cenario[];
  metas: MetaDoDom[];
}

/* ────────────────────────────────────────────────────────────────────────
   Ferramentas das metas
   ──────────────────────────────────────────────────────────────────────── */

const leitura = (ctx: ContextoDoDom, cenario: string, chave: string): unknown =>
  ctx.cenarios?.[cenario]?.leituras[chave];

/** Os erros que escaparam em qualquer cenário da lição. */
const errosDe = (ctx: ContextoDoDom, ...cenarios: string[]) =>
  cenarios.flatMap(c => ctx.cenarios?.[c]?.erros ?? []);

const semErros = (ctx: ContextoDoDom, ...cenarios: string[]) =>
  !!ctx.cenarios && cenarios.every(c => ctx.cenarios?.[c]) && errosDe(ctx, ...cenarios).length === 0;

const naoRecarregou = (ctx: ContextoDoDom, ...cenarios: string[]) =>
  !!ctx.cenarios && cenarios.every(c => ctx.cenarios?.[c] && !ctx.cenarios[c].recarregou);

/* O primeiro motivo que vale, na ordem em que a pessoa precisa saber. */
function motivoComum(ctx: ContextoDoDom, cenarios: string[]): string | undefined {
  if (!ctx.cenarios) return 'Clique em Conferir para a página rodar com os testes.';
  const erro = errosDe(ctx, ...cenarios)[0];
  if (erro) return `A página parou num erro${erro.linha ? ` na linha ${erro.linha}` : ''}: ${erro.texto}`;
  if (cenarios.some(c => ctx.cenarios?.[c]?.recarregou)) {
    return 'A página recarregou ao enviar o formulário, e o que estava digitado sumiu.';
  }
  return undefined;
}

function lerScript(codigo: string) {
  for (const sourceType of ['script', 'module'] as const) {
    try { return parse(codigo, { ecmaVersion: 'latest', sourceType }); } catch { /* tenta o outro */ }
  }
  return null;
}

/** Os nomes de função e de método que o script chama de fato. */
export function chamadasDoScript(codigo: string): Set<string> {
  const nomes = new Set<string>();
  const arvore = lerScript(codigo);
  if (!arvore) return nomes;
  visitar(arvore as never, raw => {
    const n = raw as unknown as Record<string, unknown> & { type: string };
    if (n.type !== 'CallExpression') return;
    const c = n.callee as Record<string, unknown> & { type: string };
    if (c.type === 'Identifier') nomes.add(String(c.name));
    if (c.type === 'MemberExpression') {
      const p = c.property as Record<string, unknown> & { type: string };
      if (!c.computed && p.type === 'Identifier') nomes.add(String(p.name));
    }
  });
  return nomes;
}

const script = (ctx: ContextoDoDom) => ctx.arquivos['script.js'] ?? '';

/**
 * O script está no `<head>` sem `defer`?
 *
 * É o primeiro erro de DOM de todo mundo, e a conta é estática de propósito:
 * no navegador ele vira "Cannot read properties of null", que a conferência
 * já pega; no jsdom das travas o script externo não segura a leitura da
 * página e a busca acharia o elemento — a trava aprovaria o que o navegador
 * reprova. Ler a posição da tag dá a mesma resposta nos dois.
 */
export function scriptAntesDoCorpo(html: string, arquivo = 'script.js'): boolean {
  const corpo = /<body\b/i.exec(html)?.index ?? Infinity;
  for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
    const src = /\bsrc\s*=\s*["']?([^"'\s>]+)/i.exec(m[1])?.[1]?.replace(/^\.\//, '');
    if (src !== arquivo) continue;
    const espera = /\b(defer|async)\b/i.test(m[1]) || /\btype\s*=\s*["']?module/i.test(m[1]);
    if ((m.index ?? 0) < corpo && !espera) return true;
  }
  return false;
}

const ligaScript = (html: string, arquivo = 'script.js') =>
  [...html.matchAll(/<script\b([^>]*)>/gi)].some(m =>
    /\bsrc\s*=\s*["']?([^"'\s>]+)/i.exec(m[1])?.[1]?.replace(/^\.\//, '') === arquivo);

/** Troca um trecho que tem de existir — se não existir, a variante é um engano nosso, e a trava diz. */
const trocar = (texto: string, de: string | RegExp, para: string) => texto.replace(de, para);

const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/* ────────────────────────────────────────────────────────────────────────
   Uma página de clube, que as oito lições vestem
   ──────────────────────────────────────────────────────────────────────── */

const FOLHA_DO_CLUBE = `body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background-color: #F4F1E8;
  color: #1F2A24;
}

header {
  padding: 16px 20px;
  background-color: #23402F;
  color: #FFFFFF;
}

h1 {
  margin: 0;
  font-size: 22px;
}

main {
  padding: 16px 20px;
}

li {
  padding: 4px 0;
}
`;

/* ── Módulo 1 ─────────────────────────────────────────────────────────── */

const MURAL_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Mural da Unidade Jatobá</title>
  <!-- A folha de estilo e o script estão na pasta, mas a página ainda não os chama. -->
</head>
<body>
  <header>
    <h1>Mural da Unidade Jatobá</h1>
    <p id="saudacao">Carregando a saudação…</p>
  </header>
  <main>
    <h2>Avisos</h2>
    <p id="contador">Contando os avisos…</p>
    <ul id="avisos">
      <li>Reunião no sábado, às 9h</li>
      <li>Trazer o lenço para a inspeção</li>
      <li>Ensaio da fanfarra na quarta</li>
      <li>Campori: inscrições até dia 20</li>
      <li>Levar uma fruta para o lanche</li>
    </ul>
  </main>
</body>
</html>
`;

const MURAL_SCRIPT = `// Este script troca a saudação e conta os avisos.
// Ele só funciona depois que a página existe.

const saudacao = document.querySelector('#saudacao');
saudacao.textContent = 'Bem-vindos ao mural da Jatobá!';

// Falta: escrever no #contador quantos avisos a lista tem.
// O número tem de sair da página — se alguém puser um aviso a mais,
// o contador precisa acompanhar sem ninguém mexer no script.
`;

const UM_AVISO_A_MAIS = (a: Arquivos): Arquivos => ({
  ...a,
  'index.html': trocar(a['index.html'] ?? '', /(<ul id="avisos">)/, '$1\n      <li>Aviso de conferência</li>'),
});

const numeroNoTexto = (texto: unknown, n: number) =>
  typeof texto === 'string' && new RegExp(`(^|\\D)${n}(\\D|$)`).test(texto);

const JUNTOS: DefinicaoDaLicaoDeDom = {
  projeto: 'mural',
  abre: 'index.html',
  editaveis: ['index.html', 'estilo.css', 'script.js'],
  arquivos: { 'index.html': MURAL_HTML, 'estilo.css': FOLHA_DO_CLUBE, 'script.js': MURAL_SCRIPT },
  cenarios: [
    {
      id: 'abre',
      passos: [
        { acao: 'ler', chave: 'fundo', seletor: 'body', como: 'estilo', propriedade: 'background-color' },
        { acao: 'ler', chave: 'saudacao', seletor: '#saudacao', como: 'texto' },
        { acao: 'ler', chave: 'contador', seletor: '#contador', como: 'texto' },
      ],
    },
    {
      id: 'aviso-a-mais',
      variante: UM_AVISO_A_MAIS,
      passos: [{ acao: 'ler', chave: 'contador', seletor: '#contador', como: 'texto' }],
    },
  ],
  metas: [
    {
      id: 'estilo-ligado',
      titulo: 'Ligar a folha de estilo à página',
      passos: [
        'Abra o index.html.',
        'Dentro do <head>, escreva <link rel="stylesheet" href="estilo.css">.',
        'Olhe a prévia: o fundo fica creme e o cabeçalho, verde-escuro.',
        'Clique em Conferir.',
      ],
      feita: ctx => leitura(ctx, 'abre', 'fundo') === 'rgb(244, 241, 232)',
      motivo: ctx => (ctx.cenarios ? 'O fundo da página continua branco: a folha estilo.css não está ligada.' : motivoComum(ctx, ['abre'])),
    },
    {
      id: 'script-ligado',
      titulo: 'Ligar o script, num lugar em que ele ache a página',
      passos: [
        'No index.html, escreva <script src="script.js"></script> logo antes do </body>.',
        'Ou no <head>, com defer: <script src="script.js" defer></script>.',
        'A saudação troca de texto na prévia.',
        'No painel Console, não pode haver erro em vermelho.',
      ],
      feita: ctx => !scriptAntesDoCorpo(ctx.arquivos['index.html'] ?? '')
        && ligaScript(ctx.arquivos['index.html'] ?? '')
        && leitura(ctx, 'abre', 'saudacao') === 'Bem-vindos ao mural da Jatobá!'
        && semErros(ctx, 'abre'),
      motivo: ctx => {
        const html = ctx.arquivos['index.html'] ?? '';
        if (scriptAntesDoCorpo(html)) {
          return 'O script está no <head> sem defer: ele roda antes de o <body> existir, e o querySelector não acha a saudação.';
        }
        if (!ligaScript(html)) return 'A página ainda não chama o script.js.';
        return motivoComum(ctx, ['abre']) ?? 'A saudação não trocou de texto.';
      },
    },
    {
      id: 'conta-avisos',
      titulo: 'Escrever no contador quantos avisos a lista tem',
      passos: [
        'No script.js, ache os avisos com document.querySelectorAll(\'#avisos li\').',
        'O que volta tem .length — é a quantidade.',
        'Escreva no #contador com textContent, por exemplo: avisos.length + \' avisos\'.',
        'Não escreva o número à mão: a conferência acrescenta um aviso e olha se o contador acompanha.',
      ],
      feita: ctx => numeroNoTexto(leitura(ctx, 'abre', 'contador'), 5)
        && numeroNoTexto(leitura(ctx, 'aviso-a-mais', 'contador'), 6)
        && semErros(ctx, 'abre', 'aviso-a-mais'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['abre', 'aviso-a-mais']);
        if (comum) return comum;
        if (numeroNoTexto(leitura(ctx, 'abre', 'contador'), 5) && !numeroNoTexto(leitura(ctx, 'aviso-a-mais', 'contador'), 6)) {
          return 'Com um aviso a mais na página, o contador continuou dizendo 5: o número foi escrito à mão.';
        }
        return 'O #contador não diz que são 5 avisos.';
      },
    },
  ],
};

/* ── Módulo 2 ─────────────────────────────────────────────────────────── */

/*
  Achar sem mudar nada, e por isso a resposta vai para o console. É onde se
  confere uma seleção na vida — antes de mexer no elemento, olha-se se o
  seletor pegou o que se queria —, e o painel Console está bem embaixo da
  prévia.
*/
const QUEM_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Quem é quem</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <header>
    <h1 id="titulo">Unidade Ipê</h1>
  </header>
  <main>
    <section id="diretoria">
      <h2>Diretoria</h2>
      <ul>
        <li class="pessoa" data-cargo="conselheira">Tia Rute</li>
        <li class="pessoa" data-cargo="capitão">Davi</li>
        <li class="pessoa" data-cargo="secretária">Helena</li>
      </ul>
    </section>
    <section id="membros">
      <h2>Membros</h2>
      <ul>
        <li class="pessoa">Ana Clara</li>
        <li class="pessoa">Bruno</li>
        <li class="pessoa">Isabela</li>
        <li class="pessoa">João Victor</li>
        <li class="pessoa">Mariana</li>
        <li class="pessoa novato">Samuel</li>
        <li class="pessoa novato">Lívia</li>
      </ul>
    </section>
  </main>
  <script src="script.js"></script>
</body>
</html>
`;

const QUEM_SCRIPT = `// Quem é quem na Unidade Ipê. Nada aqui muda a página:
// cada resposta vai para o painel Console, embaixo da prévia.

// 1. Ache o título pelo id e escreva o elemento no console.
// 2. Escreva no console quantas pessoas a página tem (classe "pessoa").
// 3. Escreva no console o nome de quem tem data-cargo="conselheira".
// 4. Escreva no console quantos itens há dentro da seção #membros — só ali.
`;

/* Uma pessoa a mais em cada seção, e outra conselheira: quem escreveu o
   número ou o nome à mão acerta a página e erra a variante. */
const OUTRA_UNIDADE = (a: Arquivos): Arquivos => ({
  ...a,
  'index.html': trocar(trocar(trocar(a['index.html'] ?? '',
    '<li class="pessoa" data-cargo="conselheira">Tia Rute</li>',
    '<li class="pessoa" data-cargo="conselheira">Tia Lúcia</li>'),
  '<li class="pessoa" data-cargo="secretária">Helena</li>',
  '<li class="pessoa" data-cargo="secretária">Helena</li>\n        <li class="pessoa" data-cargo="tesoureiro">Otávio</li>'),
  '<li class="pessoa">Ana Clara</li>',
  '<li class="pessoa">Ana Clara</li>\n        <li class="pessoa">Caio</li>'),
});

/* O que o console escreveu de propósito — erro escapado não conta como resposta. */
const logs = (ctx: ContextoDoDom, cenario: string) =>
  (ctx.cenarios?.[cenario]?.console ?? []).filter(e => e.nivel === 'log' || e.nivel === 'info').map(e => e.texto);
const algumLog = (ctx: ContextoDoDom, cenario: string, teste: (t: string) => boolean) => logs(ctx, cenario).some(teste);

function motivoDoConsole(ctx: ContextoDoDom, naPagina: boolean, naVariante: boolean, oQue: string): string | undefined {
  const comum = motivoComum(ctx, ['quem', 'outra']);
  if (comum) return comum;
  if (naPagina && !naVariante) {
    return `Com outra gente na página, o console continuou dizendo o mesmo ${oQue}: a resposta foi escrita à mão, e não achada.`;
  }
  return undefined;
}

const ACHAR: DefinicaoDaLicaoDeDom = {
  projeto: 'unidade',
  abre: 'script.js',
  editaveis: ['script.js'],
  arquivos: { 'index.html': QUEM_HTML, 'estilo.css': FOLHA_DO_CLUBE, 'script.js': QUEM_SCRIPT },
  cenarios: [
    { id: 'quem', passos: [] },
    { id: 'outra', variante: OUTRA_UNIDADE, passos: [] },
  ],
  metas: [
    {
      id: 'pelo-id',
      titulo: 'Achar o título pelo id',
      passos: [
        'Escreva: const titulo = document.querySelector(\'#titulo\').',
        'O # diz "o id é". Também vale document.getElementById(\'titulo\').',
        'Depois: console.log(titulo). O painel Console mostra <h1#titulo>.',
      ],
      feita: ctx => algumLog(ctx, 'quem', t => t.includes('<h1#titulo>')) && semErros(ctx, 'quem'),
      motivo: ctx => motivoComum(ctx, ['quem']) ?? 'O console não mostrou o elemento <h1#titulo>.',
    },
    {
      id: 'pela-classe',
      titulo: 'Contar as pessoas pela classe',
      passos: [
        'Escreva: const pessoas = document.querySelectorAll(\'.pessoa\').',
        'O ponto diz "a classe é". querySelectorAll devolve todos, e não só o primeiro.',
        'Depois: console.log(pessoas.length).',
      ],
      feita: ctx => algumLog(ctx, 'quem', t => numeroNoTexto(t, 10)) && algumLog(ctx, 'outra', t => numeroNoTexto(t, 12))
        && semErros(ctx, 'quem', 'outra'),
      motivo: ctx => motivoDoConsole(ctx, algumLog(ctx, 'quem', t => numeroNoTexto(t, 10)),
        algumLog(ctx, 'outra', t => numeroNoTexto(t, 12)), 'número') ?? 'O console não disse que a página tem 10 pessoas.',
    },
    {
      id: 'pelo-atributo',
      titulo: 'Achar a conselheira pelo atributo',
      passos: [
        'Atributo vai entre colchetes: document.querySelector(\'[data-cargo="conselheira"]\').',
        'O nome está no texto do elemento: .textContent.',
        'console.log do texto, e não do elemento.',
      ],
      feita: ctx => algumLog(ctx, 'quem', t => t.includes('Tia Rute')) && algumLog(ctx, 'outra', t => t.includes('Tia Lúcia'))
        && semErros(ctx, 'quem', 'outra'),
      motivo: ctx => motivoDoConsole(ctx, algumLog(ctx, 'quem', t => t.includes('Tia Rute')),
        algumLog(ctx, 'outra', t => t.includes('Tia Lúcia')), 'nome') ?? 'O console não escreveu o nome da conselheira.',
    },
    {
      id: 'dentro-da-secao',
      titulo: 'Contar só os itens de dentro da seção de membros',
      passos: [
        'Um espaço entre dois seletores quer dizer "dentro de": \'#membros li\'.',
        'document.querySelectorAll(\'#membros li\').length — a diretoria fica de fora.',
        'Escreva no console.',
      ],
      feita: ctx => algumLog(ctx, 'quem', t => numeroNoTexto(t, 7)) && algumLog(ctx, 'outra', t => numeroNoTexto(t, 8))
        && semErros(ctx, 'quem', 'outra'),
      motivo: ctx => motivoDoConsole(ctx, algumLog(ctx, 'quem', t => numeroNoTexto(t, 7)),
        algumLog(ctx, 'outra', t => numeroNoTexto(t, 8)), 'número') ?? 'O console não disse que a seção de membros tem 7 itens.',
    },
  ],
};

/* ── Módulo 3 ─────────────────────────────────────────────────────────── */

const FICHA_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Ficha da unidade</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <header id="faixa">
    <h1 id="titulo">Unidade</h1>
    <p class="lema">Sempre alerta</p>
  </header>
  <main>
    <h2>Membros</h2>
    <ul id="membros">
      <li class="membro" data-pontos="72">Ana Clara</li>
      <li class="membro" data-pontos="38">Bruno</li>
      <li class="membro" data-pontos="55">Davi</li>
      <li class="membro" data-pontos="41">Helena</li>
      <li class="membro" data-pontos="90">Isabela</li>
      <li class="membro" data-pontos="63">João Victor</li>
    </ul>
    <p>Pontos da unidade: <strong id="total">?</strong></p>
  </main>
  <script src="script.js"></script>
</body>
</html>
`;

const FICHA_CSS = `${FOLHA_DO_CLUBE}
.membro.abaixo {
  color: #9A3B2F;
  font-weight: bold;
}
`;

const FICHA_SCRIPT = `// A ficha chega com o nome errado e sem as contas.
const unidade = 'Jatobá';
const corDaUnidade = '#2E7D32';
const minimo = 50;

// 1. Troque o texto do #titulo para "Unidade Jatobá", usando a constante unidade.
// 2. Pinte o fundo da #faixa com a corDaUnidade.
// 3. Ponha a classe "abaixo" em quem tem menos pontos que o mínimo.
//    Os pontos de cada um estão no atributo data-pontos do <li>.
// 4. Escreva no #total a soma dos pontos de todos.
`;

/* A variante muda as constantes e os pontos, e a conta esperada sai dela. */
const PONTOS = [72, 38, 55, 41, 90, 63];
const PONTOS_NA_VARIANTE = [72, 58, 45, 41, 90, 63];
const FICHA_VARIANTE = (a: Arquivos): Arquivos => ({
  ...a,
  'index.html': trocar(trocar(a['index.html'] ?? '', 'data-pontos="38"', 'data-pontos="58"'), 'data-pontos="55"', 'data-pontos="45"'),
  'script.js': trocar(trocar(trocar(a['script.js'] ?? '',
    /const unidade = (['"`])Jatobá\1/, "const unidade = 'Ipê'"),
  /const corDaUnidade = (['"`])#2E7D32\1/i, "const corDaUnidade = '#1565C0'"),
  /const minimo = 50\b/, 'const minimo = 60'),
});

const classesEsperadas = (pontos: number[], minimo: number) => pontos.map(p => (p < minimo ? ['membro', 'abaixo'] : ['membro']));
const mesmasClasses = (lido: unknown, esperado: string[][]) =>
  Array.isArray(lido) && lido.length === esperado.length
  && lido.every((c, i) => Array.isArray(c) && [...c].sort().join(' ') === [...esperado[i]].sort().join(' '));

const LER_FICHA: Passo[] = [
  { acao: 'ler', chave: 'titulo', seletor: '#titulo', como: 'texto' },
  { acao: 'ler', chave: 'faixa', seletor: '#faixa', como: 'estilo', propriedade: 'background-color' },
  { acao: 'ler', chave: 'classes', seletor: '.membro', como: 'classesDeTodos' },
  { acao: 'ler', chave: 'total', seletor: '#total', como: 'texto' },
];

const soma = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function motivoDaVariante(ctx: ContextoDoDom, certoNaFicha: boolean, certoNaVariante: boolean, oQue: string): string | undefined {
  const comum = motivoComum(ctx, ['ficha', 'outra-unidade']);
  if (comum) return comum;
  if (certoNaFicha && !certoNaVariante) {
    return `Com outra unidade e outros pontos, ${oQue} não acompanhou: o valor foi escrito à mão em vez de sair das constantes e da página.`;
  }
  return undefined;
}

const MUDAR: DefinicaoDaLicaoDeDom = {
  projeto: 'ficha',
  abre: 'script.js',
  editaveis: ['script.js'],
  arquivos: { 'index.html': FICHA_HTML, 'estilo.css': FICHA_CSS, 'script.js': FICHA_SCRIPT },
  cenarios: [
    { id: 'ficha', passos: LER_FICHA },
    { id: 'outra-unidade', variante: FICHA_VARIANTE, passos: LER_FICHA },
  ],
  metas: [
    {
      id: 'titulo',
      titulo: 'Escrever o nome da unidade no título',
      passos: [
        'Ache o título: document.querySelector(\'#titulo\').',
        'Troque o texto: titulo.textContent = \'Unidade \' + unidade.',
        'Use a constante, e não o nome escrito de novo.',
      ],
      feita: ctx => leitura(ctx, 'ficha', 'titulo') === 'Unidade Jatobá'
        && leitura(ctx, 'outra-unidade', 'titulo') === 'Unidade Ipê' && semErros(ctx, 'ficha', 'outra-unidade'),
      motivo: ctx => motivoDaVariante(ctx, leitura(ctx, 'ficha', 'titulo') === 'Unidade Jatobá',
        leitura(ctx, 'outra-unidade', 'titulo') === 'Unidade Ipê', 'o título') ?? 'O #titulo não diz "Unidade Jatobá".',
    },
    {
      id: 'faixa',
      titulo: 'Pintar a faixa com a cor da unidade',
      passos: [
        'Ache a faixa: document.querySelector(\'#faixa\').',
        'Mude o estilo: faixa.style.backgroundColor = corDaUnidade.',
        'No CSS a propriedade é background-color; no JavaScript, sem hífen: backgroundColor.',
      ],
      feita: ctx => leitura(ctx, 'ficha', 'faixa') === 'rgb(46, 125, 50)'
        && leitura(ctx, 'outra-unidade', 'faixa') === 'rgb(21, 101, 192)' && semErros(ctx, 'ficha', 'outra-unidade'),
      motivo: ctx => motivoDaVariante(ctx, leitura(ctx, 'ficha', 'faixa') === 'rgb(46, 125, 50)',
        leitura(ctx, 'outra-unidade', 'faixa') === 'rgb(21, 101, 192)', 'a cor da faixa') ?? 'A #faixa não está com a cor da unidade.',
    },
    {
      id: 'abaixo',
      titulo: 'Marcar com a classe "abaixo" quem tem menos pontos que o mínimo',
      passos: [
        'Ache todos: document.querySelectorAll(\'.membro\').',
        'Percorra com for...of. Os pontos de cada um: Number(membro.dataset.pontos).',
        'Se for menor que minimo, membro.classList.add(\'abaixo\').',
        'A folha já pinta .abaixo de vermelho — olhe a prévia.',
      ],
      feita: ctx => mesmasClasses(leitura(ctx, 'ficha', 'classes'), classesEsperadas(PONTOS, 50))
        && mesmasClasses(leitura(ctx, 'outra-unidade', 'classes'), classesEsperadas(PONTOS_NA_VARIANTE, 60))
        && semErros(ctx, 'ficha', 'outra-unidade'),
      motivo: ctx => motivoDaVariante(ctx,
        mesmasClasses(leitura(ctx, 'ficha', 'classes'), classesEsperadas(PONTOS, 50)),
        mesmasClasses(leitura(ctx, 'outra-unidade', 'classes'), classesEsperadas(PONTOS_NA_VARIANTE, 60)),
        'a marcação') ?? 'Bruno e Helena, com menos de 50 pontos, deviam ter a classe "abaixo" — e só eles.',
    },
    {
      id: 'total',
      titulo: 'Escrever no total a soma dos pontos',
      passos: [
        'Comece uma variável: let soma = 0.',
        'No mesmo laço dos membros, some Number(membro.dataset.pontos).',
        'Sem o Number, o + junta texto: "72" + "38" vira "7238".',
        'Depois do laço, escreva a soma no #total.',
      ],
      feita: ctx => leitura(ctx, 'ficha', 'total') === String(soma(PONTOS))
        && leitura(ctx, 'outra-unidade', 'total') === String(soma(PONTOS_NA_VARIANTE)) && semErros(ctx, 'ficha', 'outra-unidade'),
      motivo: ctx => {
        const t = leitura(ctx, 'ficha', 'total');
        if (typeof t === 'string' && t.startsWith('07238')) return 'O total saiu "07238…": os pontos foram juntados como texto. Use Number().';
        return motivoDaVariante(ctx, t === String(soma(PONTOS)),
          leitura(ctx, 'outra-unidade', 'total') === String(soma(PONTOS_NA_VARIANTE)), 'o total')
          ?? `O #total devia dizer ${soma(PONTOS)}.`;
      },
    },
  ],
};

/* ── Módulo 4 ─────────────────────────────────────────────────────────── */

const TAREFAS_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Tarefas do acampamento</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <header>
    <h1>Tarefas do acampamento</h1>
  </header>
  <main>
    <ul id="tarefas">
      <li id="carregando">Carregando as tarefas…</li>
    </ul>
    <p id="vazio" hidden>Nenhuma tarefa por enquanto.</p>
  </main>
  <script src="script.js"></script>
</body>
</html>
`;

const TAREFAS_CSS = `${FOLHA_DO_CLUBE}
.feita {
  color: #6B7A70;
  text-decoration: line-through;
}
`;

const TAREFAS_SCRIPT = `// As tarefas moram neste arranjo. A página ainda não mostra nenhuma.
const tarefas = [
  { texto: 'Montar a barraca', feita: true },
  { texto: 'Recolher lenha seca', feita: false },
  { texto: 'Encher os galões de água', feita: false },
  { texto: 'Cavar a vala em volta da barraca', feita: true },
];

const lista = document.querySelector('#tarefas');

// 1. Para cada tarefa, crie um <li> com o texto dela e ponha na lista.
//    As feitas ganham a classe "feita".
// 2. Tire da página o item "Carregando as tarefas…".
// 3. Se o arranjo estiver vazio, mostre o #vazio (ele está com hidden).
`;

const TAREFAS_DE_TESTE = [
  { texto: 'Tarefa de conferência', feita: false },
];
const COM_UMA_A_MAIS = (a: Arquivos): Arquivos => ({
  ...a,
  'script.js': trocar(a['script.js'] ?? '', /const tarefas = \[/, `const tarefas = [\n  ${TAREFAS_DE_TESTE.map(t => `{ texto: '${t.texto}', feita: ${t.feita} },`).join('')}`),
});
const SEM_TAREFAS = (a: Arquivos): Arquivos => ({
  ...a,
  'script.js': trocar(a['script.js'] ?? '', /const tarefas = \[[\s\S]*?\n\];/, 'const tarefas = [];'),
});

const TAREFAS = ['Montar a barraca', 'Recolher lenha seca', 'Encher os galões de água', 'Cavar a vala em volta da barraca'];
const FEITAS = [true, false, false, true];

const LER_TAREFAS: Passo[] = [
  { acao: 'ler', chave: 'itens', seletor: '#tarefas li', como: 'textos' },
  { acao: 'ler', chave: 'classes', seletor: '#tarefas li', como: 'classesDeTodos' },
  { acao: 'ler', chave: 'carregando', seletor: '#carregando', como: 'existe' },
  { acao: 'ler', chave: 'vazio', seletor: '#vazio', como: 'visivel' },
];

const CRIAR_E_REMOVER: DefinicaoDaLicaoDeDom = {
  projeto: 'acampamento',
  abre: 'script.js',
  editaveis: ['script.js'],
  arquivos: { 'index.html': TAREFAS_HTML, 'estilo.css': TAREFAS_CSS, 'script.js': TAREFAS_SCRIPT },
  cenarios: [
    { id: 'lista', passos: LER_TAREFAS },
    { id: 'uma-a-mais', variante: COM_UMA_A_MAIS, passos: LER_TAREFAS },
    { id: 'vazia', variante: SEM_TAREFAS, passos: LER_TAREFAS },
  ],
  metas: [
    {
      id: 'um-item-por-tarefa',
      titulo: 'Criar um item da lista para cada tarefa, com as feitas marcadas',
      passos: [
        'Percorra o arranjo: for (const tarefa of tarefas).',
        'Crie o item: const item = document.createElement(\'li\').',
        'Ponha o texto: item.textContent = tarefa.texto.',
        'Se tarefa.feita, item.classList.add(\'feita\').',
        'Pendure na lista: lista.append(item).',
      ],
      feita: ctx => {
        const itens = (leitura(ctx, 'lista', 'itens') as string[] | undefined)?.filter(t => t !== 'Carregando as tarefas…');
        const classes = (leitura(ctx, 'lista', 'classes') as string[][] | undefined) ?? [];
        const daLista = classes.slice(classes.length - TAREFAS.length);
        const outra = (leitura(ctx, 'uma-a-mais', 'itens') as string[] | undefined)?.filter(t => t !== 'Carregando as tarefas…');
        return igual(itens, TAREFAS)
          && daLista.every((c, i) => c.includes('feita') === FEITAS[i])
          && igual(outra, [TAREFAS_DE_TESTE[0].texto, ...TAREFAS])
          && chamadasDoScript(script(ctx)).has('createElement')
          && semErros(ctx, 'lista', 'uma-a-mais');
      },
      motivo: ctx => {
        const comum = motivoComum(ctx, ['lista', 'uma-a-mais']);
        if (comum) return comum;
        if (!chamadasDoScript(script(ctx)).has('createElement')) return 'O script não cria elemento nenhum: use document.createElement(\'li\').';
        const outra = (leitura(ctx, 'uma-a-mais', 'itens') as string[] | undefined) ?? [];
        if (!outra.includes(TAREFAS_DE_TESTE[0].texto)) return 'Com uma tarefa a mais no arranjo, a lista não mostrou: os itens não saem do arranjo.';
        return 'A lista não mostra as quatro tarefas, na ordem, com as feitas riscadas.';
      },
    },
    {
      id: 'tira-o-carregando',
      titulo: 'Tirar da página o "Carregando as tarefas…"',
      passos: [
        'Ache o item: document.querySelector(\'#carregando\').',
        'Tire da página com .remove().',
        'Esconder com hidden não vale: o item continua na lista, e a conta de itens erra.',
      ],
      feita: ctx => leitura(ctx, 'lista', 'carregando') === false && semErros(ctx, 'lista'),
      motivo: ctx => motivoComum(ctx, ['lista']) ?? 'O item #carregando continua na página.',
    },
    {
      id: 'aviso-de-vazio',
      titulo: 'Mostrar o aviso quando não houver tarefa nenhuma',
      passos: [
        'Depois do laço, pergunte: if (tarefas.length === 0).',
        'Mostre o aviso tirando o hidden: document.querySelector(\'#vazio\').hidden = false.',
        'A conferência roda a página com o arranjo vazio para ver.',
      ],
      feita: ctx => leitura(ctx, 'vazia', 'vazio') === true && leitura(ctx, 'lista', 'vazio') === false
        && leitura(ctx, 'vazia', 'carregando') === false && semErros(ctx, 'lista', 'vazia'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['lista', 'vazia']);
        if (comum) return comum;
        if (leitura(ctx, 'lista', 'vazio') === true) return 'O aviso de vazio aparece mesmo com quatro tarefas na lista.';
        return 'Com o arranjo vazio, o #vazio não apareceu.';
      },
    },
  ],
};

/* ── Módulo 5 ─────────────────────────────────────────────────────────── */

const CHAMADA_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Chamada da reunião</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <header>
    <h1>Chamada da reunião</h1>
  </header>
  <main>
    <p>Presentes: <strong id="presentes">0</strong></p>
    <button id="marcar">Marcar presença</button>
    <button id="desfazer">Desfazer</button>

    <h2>Membros</h2>
    <label>Procurar: <input id="busca" type="search"></label>
    <ul id="membros">
      <li>Ana Clara</li>
      <li>Bruno</li>
      <li>Davi</li>
      <li>Helena</li>
      <li>Isabela</li>
      <li>João Victor</li>
      <li>Mariana</li>
      <li>Samuel</li>
    </ul>

    <button id="ajuda-botao">Como funciona?</button>
    <div id="ajuda" hidden>
      <p>Cada clique em "Marcar presença" conta uma pessoa. Errou? Desfaça.</p>
    </div>
  </main>
  <script src="script.js"></script>
</body>
</html>
`;

const CHAMADA_CSS = `${FOLHA_DO_CLUBE}
.escondido {
  display: none;
}

button {
  margin-right: 6px;
}
`;

const CHAMADA_SCRIPT = `// A chamada da reunião. Os botões ainda não fazem nada.
let presentes = 0;
const contador = document.querySelector('#presentes');

// 1. "Marcar presença" soma 1 e mostra no #presentes.
// 2. "Desfazer" tira 1 — mas nunca deixa abaixo de zero.
// 3. Ao digitar na #busca, só ficam à vista os membros cujo nome tem o
//    que se digitou, sem diferença entre maiúscula e minúscula.
//    A folha já tem a classe "escondido".
// 4. "Como funciona?" mostra a #ajuda; outro clique esconde.
`;

const MEMBROS_DA_CHAMADA = ['Ana Clara', 'Bruno', 'Davi', 'Helena', 'Isabela', 'João Victor', 'Mariana', 'Samuel'];
const comTrecho = (trecho: string) => MEMBROS_DA_CHAMADA.filter(n => n.toLowerCase().includes(trecho.toLowerCase()));

const EVENTOS: DefinicaoDaLicaoDeDom = {
  projeto: 'chamada',
  abre: 'script.js',
  editaveis: ['script.js'],
  arquivos: { 'index.html': CHAMADA_HTML, 'estilo.css': CHAMADA_CSS, 'script.js': CHAMADA_SCRIPT },
  cenarios: [
    {
      id: 'contar',
      passos: [
        { acao: 'clicar', seletor: '#marcar' },
        { acao: 'clicar', seletor: '#marcar' },
        { acao: 'clicar', seletor: '#marcar' },
        { acao: 'ler', chave: 'tres', seletor: '#presentes', como: 'texto' },
        { acao: 'clicar', seletor: '#desfazer' },
        { acao: 'ler', chave: 'dois', seletor: '#presentes', como: 'texto' },
        { acao: 'clicar', seletor: '#desfazer' },
        { acao: 'clicar', seletor: '#desfazer' },
        { acao: 'clicar', seletor: '#desfazer' },
        { acao: 'ler', chave: 'zero', seletor: '#presentes', como: 'texto' },
      ],
    },
    {
      id: 'procurar',
      passos: [
        { acao: 'ler', chave: 'antes', seletor: '#membros li', como: 'visiveis' },
        { acao: 'digitar', seletor: '#busca', texto: 'an' },
        { acao: 'ler', chave: 'an', seletor: '#membros li', como: 'visiveis' },
        { acao: 'limpar', seletor: '#busca' },
        { acao: 'digitar', seletor: '#busca', texto: 'SA' },
        { acao: 'ler', chave: 'sa', seletor: '#membros li', como: 'visiveis' },
        { acao: 'limpar', seletor: '#busca' },
        { acao: 'ler', chave: 'depois', seletor: '#membros li', como: 'visiveis' },
      ],
    },
    {
      id: 'ajuda',
      passos: [
        { acao: 'ler', chave: 'antes', seletor: '#ajuda', como: 'visivel' },
        { acao: 'clicar', seletor: '#ajuda-botao' },
        { acao: 'ler', chave: 'aberta', seletor: '#ajuda', como: 'visivel' },
        { acao: 'clicar', seletor: '#ajuda-botao' },
        { acao: 'ler', chave: 'fechada', seletor: '#ajuda', como: 'visivel' },
      ],
    },
  ],
  metas: [
    {
      id: 'marcar',
      titulo: 'Somar um a cada clique em "Marcar presença"',
      passos: [
        'Ache o botão: document.querySelector(\'#marcar\').',
        'Ponha um ouvinte: botao.addEventListener(\'click\', function () { ... }).',
        'Dentro dele: presentes = presentes + 1; contador.textContent = presentes.',
      ],
      feita: ctx => leitura(ctx, 'contar', 'tres') === '3' && semErros(ctx, 'contar'),
      motivo: ctx => motivoComum(ctx, ['contar']) ?? 'Três cliques em "Marcar presença" deviam mostrar 3.',
    },
    {
      id: 'desfazer',
      titulo: 'Tirar um no "Desfazer", sem passar de zero',
      passos: [
        'Outro ouvinte, no #desfazer.',
        'Só subtraia se presentes > 0.',
        'Depois de mudar, escreva no contador de novo.',
      ],
      feita: ctx => leitura(ctx, 'contar', 'dois') === '2' && leitura(ctx, 'contar', 'zero') === '0' && semErros(ctx, 'contar'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['contar']);
        if (comum) return comum;
        if (leitura(ctx, 'contar', 'dois') === '2' && leitura(ctx, 'contar', 'zero') !== '0') return 'Depois de desfazer além do zero, o contador ficou negativo.';
        return 'Marcar três e desfazer uma devia mostrar 2.';
      },
    },
    {
      id: 'procurar',
      titulo: 'Filtrar os membros enquanto se digita na busca',
      passos: [
        'Ouça a digitação: busca.addEventListener(\'input\', ...).',
        'Leia o que foi digitado em busca.value, e passe para minúsculas com toLowerCase().',
        'Para cada <li>, se o nome em minúsculas inclui o texto, tire a classe "escondido"; se não, ponha.',
        'Com a busca vazia, todo mundo volta.',
      ],
      feita: ctx => igual(leitura(ctx, 'procurar', 'antes'), MEMBROS_DA_CHAMADA)
        && igual(leitura(ctx, 'procurar', 'an'), comTrecho('an'))
        && igual(leitura(ctx, 'procurar', 'sa'), comTrecho('sa'))
        && igual(leitura(ctx, 'procurar', 'depois'), MEMBROS_DA_CHAMADA)
        && semErros(ctx, 'procurar'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['procurar']);
        if (comum) return comum;
        if (igual(leitura(ctx, 'procurar', 'an'), comTrecho('an')) && !igual(leitura(ctx, 'procurar', 'sa'), comTrecho('sa'))) {
          return 'Digitando "SA", em maiúsculas, Samuel e Isabela sumiram: a busca diferencia maiúscula de minúscula.';
        }
        if (!igual(leitura(ctx, 'procurar', 'depois'), MEMBROS_DA_CHAMADA)) return 'Com a busca apagada, nem todo mundo voltou.';
        return `Digitando "an", deviam ficar só ${comTrecho('an').join(', ')}.`;
      },
    },
    {
      id: 'ajuda',
      titulo: 'Abrir e fechar a ajuda no mesmo botão',
      passos: [
        'Ouvinte de clique no #ajuda-botao.',
        'Inverta o hidden: ajuda.hidden = !ajuda.hidden.',
      ],
      feita: ctx => leitura(ctx, 'ajuda', 'antes') === false && leitura(ctx, 'ajuda', 'aberta') === true
        && leitura(ctx, 'ajuda', 'fechada') === false && semErros(ctx, 'ajuda'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['ajuda']);
        if (comum) return comum;
        if (leitura(ctx, 'ajuda', 'aberta') === true) return 'A ajuda abre, mas o segundo clique não a fecha.';
        return 'Um clique em "Como funciona?" devia mostrar a #ajuda.';
      },
    },
  ],
};

/* ── Módulo 6 ─────────────────────────────────────────────────────────── */

const INSCRICAO_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Inscrição no campori</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <header>
    <h1>Inscrição no campori</h1>
  </header>
  <main>
    <form id="inscricao" novalidate>
      <label>Nome <input id="nome" name="nome"></label>
      <p class="erro" id="erro-nome"></p>

      <label>Idade <input id="idade" name="idade" type="number"></label>
      <p class="erro" id="erro-idade"></p>

      <label>Unidade
        <select id="unidade" name="unidade">
          <option value="">Escolha…</option>
          <option>Jatobá</option>
          <option>Ipê</option>
          <option>Buriti</option>
        </select>
      </label>
      <p class="erro" id="erro-unidade"></p>

      <button type="submit">Inscrever</button>
    </form>

    <h2>Inscritos</h2>
    <ul id="inscritos"></ul>
  </main>
  <script src="script.js"></script>
</body>
</html>
`;

const INSCRICAO_CSS = `${FOLHA_DO_CLUBE}
label {
  display: block;
  margin-top: 10px;
}

.erro {
  margin: 2px 0 0;
  color: #9A3B2F;
  font-size: 14px;
}
`;

const INSCRICAO_SCRIPT = `// A inscrição no campori. Hoje, enviar recarrega a página e apaga tudo.
const formulario = document.querySelector('#inscricao');
const inscritos = document.querySelector('#inscritos');

// Ao enviar o formulário:
// 1. Não deixe a página recarregar.
// 2. Confira os campos. Para cada problema, escreva no <p class="erro">
//    logo abaixo do campo:
//    - nome vazio;
//    - idade fora de 10 a 15 anos (desbravador);
//    - unidade não escolhida.
// 3. Se estiver tudo certo: limpe as mensagens de erro, ponha
//    "Nome — Unidade" na lista de inscritos e esvazie o formulário.
`;

const preencher = (nome: string, idade: string, unidade: string): Passo[] => [
  { acao: 'limpar', seletor: '#nome' },
  ...(nome ? [{ acao: 'digitar', seletor: '#nome', texto: nome } as Passo] : []),
  { acao: 'limpar', seletor: '#idade' },
  ...(idade ? [{ acao: 'digitar', seletor: '#idade', texto: idade } as Passo] : []),
  { acao: 'escolher', seletor: '#unidade', texto: unidade },
];

const LER_ERROS = (prefixo: string): Passo[] => [
  { acao: 'ler', chave: `${prefixo}-nome`, seletor: '#erro-nome', como: 'texto' },
  { acao: 'ler', chave: `${prefixo}-idade`, seletor: '#erro-idade', como: 'texto' },
  { acao: 'ler', chave: `${prefixo}-unidade`, seletor: '#erro-unidade', como: 'texto' },
  { acao: 'ler', chave: `${prefixo}-inscritos`, seletor: '#inscritos li', como: 'textos' },
];

const temTexto = (x: unknown) => typeof x === 'string' && x.trim().length > 0;
const vazio = (x: unknown) => x === '';

const FORMULARIO: DefinicaoDaLicaoDeDom = {
  projeto: 'campori',
  abre: 'script.js',
  editaveis: ['script.js'],
  arquivos: { 'index.html': INSCRICAO_HTML, 'estilo.css': INSCRICAO_CSS, 'script.js': INSCRICAO_SCRIPT },
  cenarios: [
    {
      id: 'vazio',
      passos: [{ acao: 'enviar', seletor: '#inscricao' }, ...LER_ERROS('vazio')],
    },
    {
      id: 'idades',
      passos: [
        ...preencher('Davi', '9', 'Ipê'), { acao: 'enviar', seletor: '#inscricao' }, ...LER_ERROS('nove'),
        ...preencher('Davi', '16', 'Ipê'), { acao: 'enviar', seletor: '#inscricao' }, ...LER_ERROS('dezesseis'),
      ],
    },
    {
      id: 'certo',
      passos: [
        { acao: 'enviar', seletor: '#inscricao' },
        ...preencher('Helena', '12', 'Buriti'), { acao: 'enviar', seletor: '#inscricao' }, ...LER_ERROS('certo'),
        { acao: 'ler', chave: 'nome-depois', seletor: '#nome', como: 'valor' },
        ...preencher('Samuel', '15', 'Jatobá'), { acao: 'enviar', seletor: '#inscricao' },
        { acao: 'ler', chave: 'dois', seletor: '#inscritos li', como: 'textos' },
      ],
    },
  ],
  metas: [
    {
      id: 'sem-recarregar',
      titulo: 'Enviar sem recarregar, e avisar o que falta em cada campo',
      passos: [
        'Ouça o envio: formulario.addEventListener(\'submit\', function (evento) { ... }).',
        'A primeira linha dentro dele: evento.preventDefault().',
        'Leia os campos com .value e confira um por um.',
        'Com o nome vazio, escreva no #erro-nome; com a unidade vazia, no #erro-unidade.',
      ],
      feita: ctx => naoRecarregou(ctx, 'vazio') && temTexto(leitura(ctx, 'vazio', 'vazio-nome'))
        && temTexto(leitura(ctx, 'vazio', 'vazio-idade')) && temTexto(leitura(ctx, 'vazio', 'vazio-unidade'))
        && igual(leitura(ctx, 'vazio', 'vazio-inscritos'), []) && semErros(ctx, 'vazio'),
      motivo: ctx => motivoComum(ctx, ['vazio'])
        ?? (igual(leitura(ctx, 'vazio', 'vazio-inscritos'), []) ? 'Com tudo vazio, os três campos deviam ter aviso de erro.' : 'O formulário vazio entrou na lista de inscritos.'),
    },
    {
      id: 'idade',
      titulo: 'Recusar idade fora de 10 a 15 anos',
      passos: [
        'A idade chega como texto: Number(campo.value).',
        'Recuse se for menor que 10 ou maior que 15.',
        'Com 9 e com 16, o #erro-idade diz o problema, e ninguém entra na lista.',
      ],
      feita: ctx => naoRecarregou(ctx, 'idades')
        && temTexto(leitura(ctx, 'idades', 'nove-idade')) && temTexto(leitura(ctx, 'idades', 'dezesseis-idade'))
        && vazio(leitura(ctx, 'idades', 'nove-nome'))
        && igual(leitura(ctx, 'idades', 'dezesseis-inscritos'), []) && semErros(ctx, 'idades'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['idades']);
        if (comum) return comum;
        if (temTexto(leitura(ctx, 'idades', 'nove-idade')) && !temTexto(leitura(ctx, 'idades', 'dezesseis-idade'))) {
          return 'Com 16 anos o formulário aceitou: falta o limite de cima.';
        }
        if (!vazio(leitura(ctx, 'idades', 'nove-nome'))) return 'O nome estava preenchido e o aviso de nome continuou lá.';
        return 'Com 9 anos, o #erro-idade devia dizer o problema.';
      },
    },
    {
      id: 'inscreve',
      titulo: 'Inscrever quem está certo e limpar o formulário',
      passos: [
        'Se nenhum campo deu problema, crie um <li> com nome + \' — \' + unidade e ponha em #inscritos.',
        'Limpe as mensagens de erro: textContent = \'\'.',
        'Esvazie o formulário: formulario.reset().',
        'A conferência envia vazio, depois certo, e então outra pessoa.',
      ],
      feita: ctx => naoRecarregou(ctx, 'certo')
        && igual(leitura(ctx, 'certo', 'certo-inscritos'), ['Helena — Buriti'])
        && vazio(leitura(ctx, 'certo', 'certo-nome')) && vazio(leitura(ctx, 'certo', 'certo-idade'))
        && vazio(leitura(ctx, 'certo', 'certo-unidade'))
        && leitura(ctx, 'certo', 'nome-depois') === ''
        && igual(leitura(ctx, 'certo', 'dois'), ['Helena — Buriti', 'Samuel — Jatobá']) && semErros(ctx, 'certo'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['certo']);
        if (comum) return comum;
        const lista = leitura(ctx, 'certo', 'certo-inscritos');
        if (!igual(lista, ['Helena — Buriti'])) return `Depois de inscrever a Helena, a lista devia ter "Helena — Buriti", e tem ${JSON.stringify(lista)}.`;
        if (!vazio(leitura(ctx, 'certo', 'certo-nome'))) return 'A Helena entrou, e o aviso de nome vazio, do envio anterior, continuou na tela.';
        if (leitura(ctx, 'certo', 'nome-depois') !== '') return 'Depois de inscrever, o campo do nome continuou preenchido.';
        return 'A segunda inscrição não entrou na lista.';
      },
    },
  ],
};

/* ── Módulo 8 ─────────────────────────────────────────────────────────── */

const PLACAR_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Placar da gincana</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <header>
    <h1>Placar da gincana</h1>
  </header>
  <main>
    <p>Total da Jatobá: <strong id="total">0</strong></p>
    <label>Pontos da prova <input id="pontos" type="number"></label>
    <button id="somar">Somar</button>
    <p id="recorde" class="recorde">Recorde batido: passou de 100!</p>
  </main>
  <script src="script.js"></script>
</body>
</html>
`;

const PLACAR_CSS = `${FOLHA_DO_CLUBE}
#total {
  font-size: 28px;
}

.recorde {
  display: none;
  color: #23402F;
  font-weight: bold;
}

.recorde.ativo {
  display: block;
}
`;

/* O defeito é o de sempre: o valor de um campo é texto, e o `+` junta texto.
   Ele não estoura nada — o placar mostra um número plausível e errado. */
const PLACAR_SCRIPT = `// O placar da gincana. A Tia Rute diz que ele "soma errado".
let total = 0;
const campo = document.querySelector('#pontos');
const placar = document.querySelector('#total');
const recorde = document.querySelector('#recorde');

document.querySelector('#somar').addEventListener('click', function () {
  const pontos = campo.value;
  total = total + pontos;
  placar.textContent = total;
  if (total > 100) {
    recorde.classList.add('ativo');
  }
  campo.value = '';
});
`;

const FERRAMENTAS: DefinicaoDaLicaoDeDom = {
  projeto: 'gincana',
  abre: 'script.js',
  editaveis: ['script.js'],
  arquivos: { 'index.html': PLACAR_HTML, 'estilo.css': PLACAR_CSS, 'script.js': PLACAR_SCRIPT },
  cenarios: [
    {
      id: 'somar',
      passos: [
        { acao: 'digitar', seletor: '#pontos', texto: '10' },
        { acao: 'clicar', seletor: '#somar' },
        { acao: 'digitar', seletor: '#pontos', texto: '5' },
        { acao: 'clicar', seletor: '#somar' },
        { acao: 'ler', chave: 'quinze', seletor: '#total', como: 'texto' },
        { acao: 'ler', chave: 'sem-recorde', seletor: '#recorde', como: 'visivel' },
        { acao: 'digitar', seletor: '#pontos', texto: '90' },
        { acao: 'clicar', seletor: '#somar' },
        { acao: 'ler', chave: 'cento-e-cinco', seletor: '#total', como: 'texto' },
        { acao: 'ler', chave: 'recorde', seletor: '#recorde', como: 'visivel' },
      ],
    },
  ],
  metas: [
    {
      id: 'inspecionou',
      titulo: 'Inspecionar o placar no painel Elementos',
      passos: [
        'Embaixo da prévia, abra o painel Elementos.',
        'Ache o <strong id="total"> na árvore e clique nele — ou use a setinha e clique no número da prévia.',
        'Olhe o tamanho e os estilos que o painel mostra.',
      ],
      feita: ctx => ctx.descobertas.inspecionados.some(d => d.idDoElemento === 'total'),
      motivo: () => 'Escolha o <strong id="total"> no painel Elementos.',
    },
    {
      id: 'parou',
      titulo: 'Pôr uma parada dentro do ouvinte e ver o valor de pontos',
      passos: [
        'Abra o painel Fontes, com o script.js.',
        'Clique no número da linha "total = total + pontos;" — aparece a marca da parada.',
        'Na prévia, digite 10 no campo e clique em Somar.',
        'O painel mostra as variáveis naquele instante. Repare nas aspas em volta do valor de pontos.',
      ],
      feita: ctx => ctx.descobertas.paradas.some(p => p.variaveis.some(v => v.nome === 'pontos' && v.tipo !== 'tdz')),
      motivo: () => 'Ponha a parada numa linha de dentro do ouvinte do botão Somar e clique em Somar na prévia.',
    },
    {
      id: 'conserto',
      titulo: 'Consertar a soma: 10 e depois 5 têm de dar 15',
      passos: [
        'O valor de um campo chega como texto, mesmo num campo de número.',
        'Converta antes de somar: const pontos = Number(campo.value).',
        'Na prévia: 10, Somar, 5, Somar — o placar mostra 15.',
        'Com mais 90, o placar passa de 100 e o aviso de recorde aparece.',
      ],
      feita: ctx => leitura(ctx, 'somar', 'quinze') === '15' && leitura(ctx, 'somar', 'sem-recorde') === false
        && leitura(ctx, 'somar', 'cento-e-cinco') === '105' && leitura(ctx, 'somar', 'recorde') === true
        && semErros(ctx, 'somar'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['somar']);
        if (comum) return comum;
        const q = leitura(ctx, 'somar', 'quinze');
        if (q === '0105') return 'O placar mostra 0105: os pontos ainda estão sendo juntados como texto.';
        if (q === '15' && leitura(ctx, 'somar', 'recorde') !== true) return 'A soma está certa, mas com 105 pontos o aviso de recorde não apareceu.';
        return `Somando 10 e 5, o placar mostra ${JSON.stringify(q)}, e devia mostrar 15.`;
      },
    },
  ],
};

/* ── Módulo 7 ─────────────────────────────────────────────────────────── */

const FERIADOS_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Feriados nacionais</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <header>
    <h1>Feriados nacionais</h1>
  </header>
  <main>
    <label>Ano
      <select id="ano">
        <option>2025</option>
        <option selected>2026</option>
        <option>2027</option>
      </select>
    </label>
    <p id="carregando" hidden>Carregando…</p>
    <p id="erro" class="erro" hidden></p>
    <ul id="feriados"></ul>
  </main>
  <script src="script.js"></script>
</body>
</html>
`;

const FERIADOS_CSS = `${FOLHA_DO_CLUBE}
.erro {
  color: #9A3B2F;
}
`;

const FERIADOS_SCRIPT = `// Os feriados nacionais do ano, pedidos à BrasilAPI.
// O endereço dos feriados de um ano é:
// https://brasilapi.com.br/api/feriados/v1/2026

const lista = document.querySelector('#feriados');
const escolhaDoAno = document.querySelector('#ano');
const carregando = document.querySelector('#carregando');
const erro = document.querySelector('#erro');

async function buscarFeriados(ano) {
  // 1. Mostre o #carregando enquanto espera.
  // 2. Peça com fetch e leia a resposta como JSON.
  // 3. Para cada feriado, um <li> com o dia/mês e o nome: "01/01 — Confraternização mundial".
  //    A data chega como "2026-01-01".
  // 4. Se a rede falhar, escreva no #erro o que aconteceu, e mostre-o.
  // 5. No fim, dando certo ou errado, esconda o #carregando.
}

// Ao trocar o ano, a lista tem de mostrar os feriados do ano novo.

buscarFeriados(escolhaDoAno.value);
`;

const comoNaLista = (ano: number) =>
  feriadosDoAno(ano).map(f => ({ data: `${f.date.slice(8, 10)}/${f.date.slice(5, 7)}`, nome: f.name }));

const listaDoAno = (lido: unknown, ano: number) => {
  const esperado = comoNaLista(ano);
  return Array.isArray(lido) && lido.length === esperado.length
    && lido.every((t, i) => typeof t === 'string' && t.includes(esperado[i].data) && t.includes(esperado[i].nome));
};

const API: DefinicaoDaLicaoDeDom = {
  projeto: 'feriados',
  abre: 'script.js',
  editaveis: ['script.js'],
  arquivos: { 'index.html': FERIADOS_HTML, 'estilo.css': FERIADOS_CSS, 'script.js': FERIADOS_SCRIPT },
  cenarios: [
    {
      id: 'abre',
      passos: [
        { acao: 'ler', chave: 'esperando', seletor: '#carregando', como: 'visivel' },
        { acao: 'esperar' },
        { acao: 'ler', chave: 'esperou', seletor: '#carregando', como: 'visivel' },
        { acao: 'ler', chave: 'lista', seletor: '#feriados li', como: 'textos' },
        { acao: 'ler', chave: 'erro', seletor: '#erro', como: 'visivel' },
      ],
    },
    {
      id: 'outro-ano',
      passos: [
        { acao: 'esperar' },
        { acao: 'escolher', seletor: '#ano', texto: '2025' },
        { acao: 'esperar' },
        { acao: 'ler', chave: 'lista', seletor: '#feriados li', como: 'textos' },
      ],
    },
    {
      id: 'sem-rede',
      offline: true,
      passos: [
        { acao: 'esperar' },
        { acao: 'ler', chave: 'erro', seletor: '#erro', como: 'visivel' },
        { acao: 'ler', chave: 'texto', seletor: '#erro', como: 'texto' },
        { acao: 'ler', chave: 'carregando', seletor: '#carregando', como: 'visivel' },
      ],
    },
  ],
  metas: [
    {
      id: 'mostra-feriados',
      titulo: 'Mostrar os feriados de 2026 que a API devolve',
      passos: [
        'Dentro de buscarFeriados: const resposta = await fetch(\'https://brasilapi.com.br/api/feriados/v1/\' + ano).',
        'Depois: const feriados = await resposta.json().',
        'Para cada feriado, a data chega como "2026-01-01": data.slice(8, 10) é o dia e data.slice(5, 7) é o mês.',
        'Crie o <li> com dia/mês — nome e ponha na lista.',
        'O painel Rede mostra o pedido e a resposta.',
      ],
      feita: ctx => listaDoAno(leitura(ctx, 'abre', 'lista'), 2026) && chamadasDoScript(script(ctx)).has('fetch') && semErros(ctx, 'abre'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['abre']);
        if (comum) return comum;
        if (!chamadasDoScript(script(ctx)).has('fetch')) return 'O script não pede nada à API: use fetch.';
        const n = (leitura(ctx, 'abre', 'lista') as unknown[] | undefined)?.length ?? 0;
        if (n !== 14) return `A lista tem ${n} itens, e 2026 tem 14 feriados nacionais.`;
        return 'Cada item precisa da data como dia/mês — 01/01 — e do nome do feriado.';
      },
    },
    {
      id: 'troca-de-ano',
      titulo: 'Buscar de novo quando o ano muda',
      passos: [
        'Ouça a troca: escolhaDoAno.addEventListener(\'change\', ...).',
        'Dentro: buscarFeriados(escolhaDoAno.value).',
        'Antes de pôr os novos, esvazie a lista: lista.textContent = \'\'. Sem isso, 2025 entra embaixo de 2026.',
      ],
      feita: ctx => listaDoAno(leitura(ctx, 'outro-ano', 'lista'), 2025) && semErros(ctx, 'outro-ano'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['outro-ano']);
        if (comum) return comum;
        const n = (leitura(ctx, 'outro-ano', 'lista') as unknown[] | undefined)?.length ?? 0;
        if (n === 28) return 'Escolhendo 2025, a lista ficou com 28 itens: os de 2026 não saíram antes de os novos entrarem.';
        if (listaDoAno(leitura(ctx, 'outro-ano', 'lista'), 2026)) return 'Escolher 2025 não mudou nada: ninguém ouve a troca do ano.';
        return 'Escolhendo 2025, a lista devia mostrar os 14 feriados de 2025 — o Carnaval cai em 03/03.';
      },
    },
    {
      id: 'mostra-espera',
      titulo: 'Mostrar o "Carregando…" enquanto a resposta não chega',
      passos: [
        'No começo de buscarFeriados: carregando.hidden = false.',
        'Depois de pôr a lista: carregando.hidden = true.',
        'Ponha o esconder num finally, para valer também quando a rede falha.',
      ],
      feita: ctx => leitura(ctx, 'abre', 'esperando') === true && leitura(ctx, 'abre', 'esperou') === false
        && leitura(ctx, 'sem-rede', 'carregando') === false && semErros(ctx, 'abre', 'sem-rede'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['abre', 'sem-rede']);
        if (comum) return comum;
        if (leitura(ctx, 'abre', 'esperando') !== true) return 'Logo depois de abrir, enquanto a API não respondeu, o #carregando não aparece.';
        if (leitura(ctx, 'abre', 'esperou') !== false) return 'A resposta chegou e o #carregando continuou na tela.';
        return 'Com a rede caída, o #carregando ficou na tela para sempre: esconda-o num finally.';
      },
    },
    {
      id: 'avisa-falha',
      titulo: 'Avisar na página quando a rede falha',
      passos: [
        'Envolva o pedido em try { ... } catch (e) { ... }.',
        'No catch: erro.textContent = \'Não foi possível buscar os feriados. Confira a conexão.\'; erro.hidden = false.',
        'Para testar, marque "Sem conexão" no painel Rede: a prévia recarrega sem internet.',
      ],
      feita: ctx => leitura(ctx, 'sem-rede', 'erro') === true && temTexto(leitura(ctx, 'sem-rede', 'texto'))
        && semErros(ctx, 'sem-rede') && leitura(ctx, 'abre', 'erro') === false,
      motivo: ctx => {
        if (!ctx.cenarios) return motivoComum(ctx, []);
        if (errosDe(ctx, 'sem-rede').some(e => e.texto.includes('in promise'))) {
          return 'Sem rede, o erro escapou para o console — "Uncaught (in promise)": ninguém tratou a falha do fetch.';
        }
        if (leitura(ctx, 'abre', 'erro') === true) return 'O #erro aparece mesmo quando a rede está boa.';
        return motivoComum(ctx, ['sem-rede']) ?? 'Sem rede, a página não diz nada: o #erro continua escondido ou vazio.';
      },
    },
  ],
};

/* ── Módulo 9 ─────────────────────────────────────────────────────────── */

const ESTADOS_HTML = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Estados do Brasil</title>
  <link rel="stylesheet" href="estilo.css">
</head>
<body>
  <header>
    <h1>Estados do Brasil</h1>
  </header>
  <main>
    <div class="controles">
      <label>Região
        <select id="regiao">
          <option value="">Todas</option>
          <option>Norte</option>
          <option>Nordeste</option>
          <option>Sudeste</option>
          <option>Sul</option>
          <option>Centro-Oeste</option>
        </select>
      </label>
      <label>Procurar <input id="busca" type="search"></label>
      <label>Ordem
        <select id="ordem">
          <option value="nome">Nome</option>
          <option value="sigla">Sigla</option>
        </select>
      </label>
    </div>
    <p id="contagem"></p>
    <p id="carregando" hidden>Carregando…</p>
    <p id="erro" class="erro" hidden></p>
    <table>
      <thead>
        <tr><th>Sigla</th><th>Estado</th><th>Capital</th><th>Região</th></tr>
      </thead>
      <tbody id="estados"></tbody>
    </table>
  </main>
  <script src="script.js"></script>
</body>
</html>
`;

const ESTADOS_CSS = `${FOLHA_DO_CLUBE}
.controles {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

table {
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  padding: 4px 10px;
  border-bottom: 1px solid #D5D0C2;
  text-align: left;
}

.erro {
  color: #9A3B2F;
}
`;

const ESTADOS_SCRIPT = `// Os 27 estados, pedidos à BrasilAPI:
// https://brasilapi.com.br/api/ibge/uf/v1
// Cada estado chega assim:
// { sigla: 'DF', nome: 'Distrito Federal', capital: 'Brasília', regiao: { nome: 'Centro-Oeste' } }

const corpo = document.querySelector('#estados');
let estados = [];

// 1. Peça os estados uma vez só, guarde em estados e desenhe a tabela.
//    Uma linha por estado: sigla, nome, capital e região.
// 2. A #contagem diz quantos estão à vista: "27 estados".
// 3. A região, a busca e a ordem mudam o que se vê — sem pedir à API de novo.
// 4. Se a rede falhar, o #erro diz o que aconteceu.
`;

const normal = (s: string) => s.toLowerCase();
const porNome = [...UFS].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
const visiveisEsperados = (regiao: string, busca: string, ordem: 'nome' | 'sigla') =>
  [...UFS]
    .filter(u => !regiao || u.regiao.nome === regiao)
    .filter(u => normal(u.nome).includes(normal(busca)))
    .sort((a, b) => (ordem === 'nome' ? a.nome.localeCompare(b.nome, 'pt-BR') : a.sigla.localeCompare(b.sigla)))
    .map(u => u.sigla);

/* As siglas na ordem em que as linhas aparecem: a primeira célula de cada uma. */
const siglasDe = (lido: unknown) => (Array.isArray(lido) ? lido.map(t => String(t)) : []);

const LER_TABELA = (chave: string): Passo[] => [
  { acao: 'ler', chave, seletor: '#estados tr td:first-child', como: 'visiveis' },
  { acao: 'ler', chave: `${chave}-contagem`, seletor: '#contagem', como: 'texto' },
];

const PAGINA: DefinicaoDaLicaoDeDom = {
  projeto: 'estados',
  abre: 'script.js',
  editaveis: ['script.js'],
  arquivos: { 'index.html': ESTADOS_HTML, 'estilo.css': ESTADOS_CSS, 'script.js': ESTADOS_SCRIPT },
  cenarios: [
    {
      id: 'abre',
      passos: [{ acao: 'esperar' }, ...LER_TABELA('todos')],
    },
    {
      id: 'filtros',
      passos: [
        { acao: 'esperar' },
        { acao: 'escolher', seletor: '#regiao', texto: 'Nordeste' },
        ...LER_TABELA('nordeste'),
        { acao: 'escolher', seletor: '#regiao', texto: '' },
        { acao: 'digitar', seletor: '#busca', texto: 'rio' },
        ...LER_TABELA('rio'),
        { acao: 'escolher', seletor: '#regiao', texto: 'Sul' },
        ...LER_TABELA('rio-no-sul'),
        { acao: 'escolher', seletor: '#regiao', texto: '' },
        { acao: 'limpar', seletor: '#busca' },
        ...LER_TABELA('limpo'),
      ],
    },
    {
      id: 'ordem',
      passos: [
        { acao: 'esperar' },
        { acao: 'escolher', seletor: '#ordem', texto: 'sigla' },
        ...LER_TABELA('por-sigla'),
        { acao: 'escolher', seletor: '#ordem', texto: 'nome' },
        ...LER_TABELA('por-nome'),
      ],
    },
    {
      id: 'sem-rede',
      offline: true,
      passos: [
        { acao: 'esperar' },
        { acao: 'ler', chave: 'erro', seletor: '#erro', como: 'visivel' },
        { acao: 'ler', chave: 'texto', seletor: '#erro', como: 'texto' },
      ],
    },
  ],
  metas: [
    {
      id: 'tabela',
      titulo: 'Mostrar os 27 estados, um por linha, em ordem de nome',
      passos: [
        'Numa função async: const resposta = await fetch(\'https://brasilapi.com.br/api/ibge/uf/v1\'); estados = await resposta.json().',
        'Escreva uma função desenhar() que esvazia o corpo da tabela e cria um <tr> por estado, com quatro <td>.',
        'A ordem começa por nome: estados.sort((a, b) => a.nome.localeCompare(b.nome)).',
        'Na #contagem: lista.length + \' estados\'.',
      ],
      feita: ctx => igual(siglasDe(leitura(ctx, 'abre', 'todos')), porNome.map(u => u.sigla))
        && numeroNoTexto(leitura(ctx, 'abre', 'todos-contagem'), 27)
        && chamadasDoScript(script(ctx)).has('fetch') && semErros(ctx, 'abre'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['abre']);
        if (comum) return comum;
        if (!chamadasDoScript(script(ctx)).has('fetch')) return 'O script não pede nada à API: use fetch.';
        const siglas = siglasDe(leitura(ctx, 'abre', 'todos'));
        if (siglas.length !== 27) return `A tabela mostra ${siglas.length} estados, e são 27.`;
        if (igual(siglas, UFS.map(u => u.sigla))) return 'A tabela está na ordem em que a API manda, que é a do código do IBGE — ordene por nome.';
        const ipa = siglas.indexOf('PA'), ipb = siglas.indexOf('PB');
        if (ipb >= 0 && ipa > ipb) {
          return 'Paraíba aparece antes do Pará: a comparação com < olha o código de cada letra, e o á vem depois do z. Use localeCompare.';
        }
        if (!numeroNoTexto(leitura(ctx, 'abre', 'todos-contagem'), 27)) return 'A #contagem não diz que são 27.';
        return 'A tabela não está em ordem de nome.';
      },
    },
    {
      id: 'regiao',
      titulo: 'Filtrar pela região escolhida',
      passos: [
        'Ouça a troca da #regiao com \'change\' e chame desenhar() de novo.',
        'Em desenhar, antes de criar as linhas: estados.filter(e => regiao === \'\' || e.regiao.nome === regiao).',
        'Filtre uma cópia — o arranjo estados guarda os 27 e não muda.',
        'Nordeste mostra 9; Todas volta aos 27.',
      ],
      feita: ctx => igual(siglasDe(leitura(ctx, 'filtros', 'nordeste')), visiveisEsperados('Nordeste', '', 'nome'))
        && numeroNoTexto(leitura(ctx, 'filtros', 'nordeste-contagem'), 9)
        && igual(siglasDe(leitura(ctx, 'filtros', 'limpo')), visiveisEsperados('', '', 'nome'))
        && semErros(ctx, 'filtros'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['filtros']);
        if (comum) return comum;
        if (igual(siglasDe(leitura(ctx, 'filtros', 'nordeste')), visiveisEsperados('Nordeste', '', 'nome'))
          && !igual(siglasDe(leitura(ctx, 'filtros', 'limpo')), visiveisEsperados('', '', 'nome'))) {
          return 'Voltando para Todas, os 27 não voltaram: o filtro apagou estados do arranjo em vez de filtrar uma cópia.';
        }
        if (!numeroNoTexto(leitura(ctx, 'filtros', 'nordeste-contagem'), 9) && siglasDe(leitura(ctx, 'filtros', 'nordeste')).length === 9) {
          return 'A tabela mostra os 9 do Nordeste, e a #contagem não acompanhou.';
        }
        return 'Escolhendo Nordeste, a tabela devia mostrar só os 9 estados do Nordeste, em ordem de nome.';
      },
    },
    {
      id: 'busca',
      titulo: 'Procurar pelo nome, junto com a região',
      passos: [
        'Ouça a #busca com \'input\' e chame desenhar().',
        'No filtro: e.nome.toLowerCase().includes(busca.value.toLowerCase()).',
        'Os dois filtros valem juntos: "rio" mostra 3 estados; "rio" no Sul mostra só o Rio Grande do Sul.',
      ],
      feita: ctx => igual(siglasDe(leitura(ctx, 'filtros', 'rio')), visiveisEsperados('', 'rio', 'nome'))
        && igual(siglasDe(leitura(ctx, 'filtros', 'rio-no-sul')), visiveisEsperados('Sul', 'rio', 'nome'))
        && semErros(ctx, 'filtros'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['filtros']);
        if (comum) return comum;
        if (siglasDe(leitura(ctx, 'filtros', 'rio')).length === 0) return 'Procurando "rio", não sobrou ninguém: a busca diferencia maiúscula de minúscula, e os nomes começam com R.';
        if (igual(siglasDe(leitura(ctx, 'filtros', 'rio')), visiveisEsperados('', 'rio', 'nome'))) return 'Com "rio" e a região Sul juntos, a tabela devia mostrar só o Rio Grande do Sul.';
        return 'Procurando "rio", deviam ficar Rio de Janeiro, Rio Grande do Norte e Rio Grande do Sul.';
      },
    },
    {
      id: 'ordem',
      titulo: 'Reordenar pela sigla e pelo nome',
      passos: [
        'Ouça a #ordem com \'change\' e chame desenhar().',
        'Em desenhar: se a ordem é sigla, ordene por a.sigla.localeCompare(b.sigla); se é nome, por a.nome.localeCompare(b.nome).',
        'Ordene a lista já filtrada, e não peça à API de novo.',
      ],
      feita: ctx => igual(siglasDe(leitura(ctx, 'ordem', 'por-sigla')), visiveisEsperados('', '', 'sigla'))
        && igual(siglasDe(leitura(ctx, 'ordem', 'por-nome')), visiveisEsperados('', '', 'nome'))
        && (ctx.cenarios?.ordem?.requisicoes.length ?? 0) === 1 && semErros(ctx, 'ordem'),
      motivo: ctx => {
        const comum = motivoComum(ctx, ['ordem']);
        if (comum) return comum;
        if ((ctx.cenarios?.ordem?.requisicoes.length ?? 0) > 1) return 'Cada troca de ordem pediu os estados de novo à API: ordene o que já está guardado.';
        return 'Escolhendo Sigla, a tabela devia começar por AC, AL, AM, AP.';
      },
    },
    {
      id: 'falha',
      titulo: 'Avisar na página quando a rede falha',
      passos: [
        'Envolva o pedido em try { ... } catch.',
        'No catch, escreva no #erro e tire o hidden dele.',
        'Teste marcando "Sem conexão" no painel Rede.',
      ],
      feita: ctx => leitura(ctx, 'sem-rede', 'erro') === true && temTexto(leitura(ctx, 'sem-rede', 'texto')) && semErros(ctx, 'sem-rede'),
      motivo: ctx => {
        if (!ctx.cenarios) return motivoComum(ctx, []);
        if (errosDe(ctx, 'sem-rede').some(e => e.texto.includes('in promise'))) {
          return 'Sem rede, o erro escapou para o console — "Uncaught (in promise)": ninguém tratou a falha do fetch.';
        }
        return motivoComum(ctx, ['sem-rede']) ?? 'Sem rede, a página não diz nada: o #erro continua escondido ou vazio.';
      },
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────
   O registro
   ──────────────────────────────────────────────────────────────────────── */

export const LICOES_DA_CC_FE004: Record<LicaoDaCcFe004, DefinicaoDaLicaoDeDom> = {
  juntos: JUNTOS,
  achar: ACHAR,
  mudar: MUDAR,
  'criar-e-remover': CRIAR_E_REMOVER,
  eventos: EVENTOS,
  formulario: FORMULARIO,
  api: API,
  ferramentas: FERRAMENTAS,
  pagina: PAGINA,
};

export const metasDaCcFe004 = (licao: LicaoDaCcFe004): MetaDoDom[] => LICOES_DA_CC_FE004[licao].metas;

/** Os arquivos com que um cenário roda: os da pessoa, mudados pela variante. */
export const arquivosDoCenario = (c: Cenario, arquivos: Arquivos): Arquivos => (c.variante ? c.variante(arquivos) : arquivos);

/** O contexto sem conferência nenhuma — o de quem acabou de abrir. */
export const contextoVazio = (arquivos: Arquivos): ContextoDoDom => ({
  arquivos,
  cenarios: null,
  descobertas: { inspecionados: [], paradas: [] },
});
