import { feriadosDoAno } from './brasilApiGuardada';
import type { Arquivos, EntradaDoConsole, Passo, ResultadoDoCenario } from './paginaViva';
import type { ResultadoDoReact } from './compiladorReact';
import type { AnaliseDeReact } from './analiseReact';
import { linhaNoArquivo } from './paginaDeReact';

/**
 * Os nove laboratórios da CC-FE006.
 *
 * ── Um projeto do Vite, de verdade ───────────────────────────────────────
 * Todos abrem o mesmo arranjo que o `npm create vite` deixa: um `index.html`
 * com a `<div id="root">`, um `main.tsx` que monta o `App`, a folha de estilo
 * e os componentes em `.tsx`. O `index.html`, o `main.tsx` e a folha chegam
 * prontos e só de leitura — a lição é o componente, e não a moldura. Os
 * dados moram num `dados.ts` também só de leitura, e é por ele que a
 * conferência troca o que a página mostra.
 *
 * ── A tarefa se confere rodando a página ─────────────────────────────────
 * É a regra da CC-FE004: cada meta lê cenários — a página montada de novo,
 * com cliques e digitação, e leituras do que ficou. Há muitos componentes
 * certos para a mesma tela, e o que se confere é a tela.
 *
 * A **variante** troca o `dados.ts` antes de rodar: quem escreveu "Ipê" no
 * cartão acerta a unidade da lição e erra a outra; quem escreveu os quatro
 * itens da lista à mão erra a lista de cinco.
 *
 * ── E três perguntas que a tela não responde ─────────────────────────────
 * A lista aparece igual descrita em JSX ou montada com `document`; o cartão
 * desenha certo recebendo propriedades ou importando os dados sozinho; o
 * título muda certo num efeito ou no meio do corpo. Para essas a meta lê a
 * árvore (`analiseReact.ts`), além da página.
 */

export type LicaoDaCcFe006 =
  | 'declarar' | 'propriedades' | 'reaproveitar' | 'estado' | 'listas'
  | 'formulario' | 'efeito' | 'navegacao' | 'api';

export interface CenarioDeReact {
  id: string;
  offline?: boolean;
  /** O `dados.ts` trocado antes de rodar. Sem ela, os arquivos como estão. */
  dados?: string;
  passos: Passo[];
}

export interface ContextoDoReact {
  arquivos: Arquivos;
  /** A compilação dos arquivos de agora. `null` enquanto o compilador não respondeu. */
  compilacao: ResultadoDoReact | null;
  analise: Record<string, AnaliseDeReact> | null;
  /** A última conferência, por cenário. `null` quando não houve, ou ficou velha. */
  cenarios: Record<string, ResultadoDoCenario> | null;
}

export interface MetaDeReact {
  id: string;
  titulo: string;
  passos: string[];
  feita: (ctx: ContextoDoReact) => boolean;
  motivo?: (ctx: ContextoDoReact) => string | undefined;
}

export interface DefinicaoDaLicaoDeReact {
  projeto: string;
  arquivos: Arquivos;
  editaveis: string[];
  abre: string;
  cenarios: CenarioDeReact[];
  metas: MetaDeReact[];
}

/** Os arquivos de um cenário: os da pessoa, com o `dados.ts` da variante quando houver. */
export const arquivosDoCenario = (c: CenarioDeReact, a: Arquivos): Arquivos =>
  (c.dados === undefined ? a : { ...a, 'dados.ts': c.dados });

/* ────────────────────────────────────────────────────────────────────────
   Ferramentas das metas
   ──────────────────────────────────────────────────────────────────────── */

export const ler = (ctx: ContextoDoReact, cenario: string, chave: string): unknown =>
  ctx.cenarios?.[cenario]?.leituras[chave];

export const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export const errosDe = (ctx: ContextoDoReact, cenarios: string[]) =>
  cenarios.flatMap(c => ctx.cenarios?.[c]?.erros ?? []);

export const consoleDe = (ctx: ContextoDoReact, cenarios: string[]): EntradaDoConsole[] =>
  cenarios.flatMap(c => ctx.cenarios?.[c]?.console ?? []);

/** Rodou, nos cenários todos, sem erro escapando e sem recarregar? */
export const rodou = (ctx: ContextoDoReact, cenarios: string[]) =>
  !!ctx.cenarios && cenarios.every(c => ctx.cenarios?.[c] && !ctx.cenarios[c].recarregou)
  && errosDe(ctx, cenarios).length === 0;

export const AVISO_DE_CHAVE = /Each child in a list should have a unique "key" prop/;
export const AVISO_DE_CONTROLE = /changing an? (un)?controlled input to be (un)?controlled|provided a `value` prop to a form field without an `onChange` handler|provided a `checked` prop to a form field without an `onChange` handler/;

export const comAviso = (ctx: ContextoDoReact, cenarios: string[], aviso: RegExp) =>
  consoleDe(ctx, cenarios).some(e => e.nivel === 'error' && aviso.test(e.texto));

export const analise = (ctx: ContextoDoReact, arquivo: string): AnaliseDeReact | undefined => ctx.analise?.[arquivo];

export const semProblemas = (ctx: ContextoDoReact) => !!ctx.compilacao && ctx.compilacao.diagnosticos.length === 0;

/* O primeiro motivo que vale, na ordem em que a pessoa precisa saber. */
export function motivoComum(ctx: ContextoDoReact, cenarios: string[]): string | undefined {
  const sintaxe = ctx.compilacao?.sintaxe[0];
  if (sintaxe) return `${sintaxe.arquivo} não se lê, na linha ${sintaxe.linha}: ${sintaxe.mensagem} Enquanto isso a página nem roda.`;
  if (!ctx.cenarios) return 'Clique em Conferir para a página rodar com os testes.';
  const erro = errosDe(ctx, cenarios)[0];
  if (erro) {
    const linha = linhaNoArquivo(ctx.compilacao, erro.arquivo, erro.linha);
    const onde = erro.arquivo && erro.arquivo !== 'index.html' && linha ? ` em ${erro.arquivo}, linha ${linha}` : '';
    return `A página parou num erro${onde}: ${erro.texto}`;
  }
  if (cenarios.some(c => ctx.cenarios?.[c]?.recarregou)) {
    return 'A página recarregou ao enviar o formulário, e o que estava digitado sumiu.';
  }
  return undefined;
}

export const motivoDosProblemas = (ctx: ContextoDoReact): string | undefined => {
  if (!ctx.compilacao) return 'O compilador ainda está lendo o projeto.';
  const d = ctx.compilacao.diagnosticos[0];
  return d ? `O painel de Problemas ainda aponta ${ctx.compilacao.diagnosticos.length === 1 ? 'um erro' : `${ctx.compilacao.diagnosticos.length} erros`} — o primeiro em ${d.arquivo}, linha ${d.linha}: ${d.mensagem}` : undefined;
};

/* ────────────────────────────────────────────────────────────────────────
   A moldura do Vite, igual nas nove
   ──────────────────────────────────────────────────────────────────────── */

const index = (titulo: string) => `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="estilo.css" />
    <title>${titulo}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
`;

export const MAIN_DO_VITE = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

const MAIN_COM_ROTAS = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';

// O HashRouter guarda a tela no pedaço do endereço depois do #. É o que
// funciona num site sem servidor que saiba responder cada caminho — e é o
// que a própria Trilha.Web() usa no GitHub Pages.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </HashRouter>
  </StrictMode>,
);
`;

const FOLHA = `body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background-color: #F4F1E8;
  color: #1F2A24;
}

main {
  max-width: 640px;
  margin: 0 auto;
  padding: 16px 20px;
}

h1 {
  margin: 0 0 12px;
  font-size: 24px;
  color: #23402F;
}

li {
  padding: 4px 0;
}

button {
  font: inherit;
  cursor: pointer;
}
`;

/** Os arquivos de uma lição: a moldura pronta mais os da própria lição. */
const projeto = (titulo: string, folhaExtra: string, proprios: Arquivos, main = MAIN_DO_VITE): Arquivos => ({
  'index.html': index(titulo),
  'main.tsx': main,
  'estilo.css': `${FOLHA}${folhaExtra}`,
  ...proprios,
});

/* ── Módulo 1 · Do DOM à descrição ─────────────────────────────────────── */

const avisosEmTs = (avisos: { id: number; texto: string }[]) => `export interface Aviso {
  id: number;
  texto: string;
}

export const avisos: Aviso[] = [
${avisos.map(a => `  { id: ${a.id}, texto: ${JSON.stringify(a.texto).replace(/"/g, "'")} },`).join('\n')}
];
`;

export const AVISOS = [
  { id: 1, texto: 'Reunião no sábado às 9h' },
  { id: 2, texto: 'Trazer o lenço da unidade' },
  { id: 3, texto: 'Inscrições do campori até dia 20' },
];
const AVISOS_NA_VARIANTE = [
  { id: 7, texto: 'Mutirão de limpeza no domingo' },
  { id: 8, texto: 'Ensaio da fanfarra às 16h' },
  { id: 9, texto: 'Levar uma lata de alimento' },
  { id: 12, texto: 'Fotos do acampamento no mural' },
];

const MURAL_APP = `import { useEffect } from 'react';
import { avisos } from './dados';

// Este componente funciona — mas do jeito da CC-FE004. Ele desenha uma
// lista vazia e, depois de desenhar, vai até ela com o document e a enche
// à mão. Reescreva para o JSX descrever a tela inteira: a lista, o total e
// o título, sem nenhum document neste arquivo.
export default function App() {
  useEffect(() => {
    const lista = document.querySelector('#avisos')!;
    lista.innerHTML = '';
    for (const aviso of avisos) {
      const li = document.createElement('li');
      li.textContent = aviso.texto;
      lista.appendChild(li);
    }
    document.querySelector('#total')!.textContent = avisos.length + ' avisos';
  }, []);

  return (
    <main>
      <h1 class="titulo">Mural da Unidade Ipê</h1>
      <p id="total"></p>
      <ul id="avisos"></ul>
    </main>
  );
}
`;

const LER_MURAL: Passo[] = [
  { acao: 'esperar' },
  { acao: 'ler', chave: 'avisos', seletor: '#avisos li', como: 'textos' },
  { acao: 'ler', chave: 'total', seletor: '#total', como: 'texto' },
  { acao: 'ler', chave: 'classes', seletor: 'h1', como: 'classes' },
];

const semDocumento = (ctx: ContextoDoReact) => (analise(ctx, 'App.tsx')?.usosDoDocumento ?? 1) === 0;

const DECLARAR: DefinicaoDaLicaoDeReact = {
  projeto: 'mural-da-ipe',
  arquivos: projeto('Mural da Ipê', `
.titulo {
  border-bottom: 3px solid #C8A13A;
  padding-bottom: 6px;
}

#total {
  color: #5B6B61;
  font-size: 14px;
}
`, { 'App.tsx': MURAL_APP, 'dados.ts': avisosEmTs(AVISOS) }),
  editaveis: ['App.tsx'],
  abre: 'App.tsx',
  cenarios: [
    { id: 'mural', passos: LER_MURAL },
    { id: 'outro', dados: avisosEmTs(AVISOS_NA_VARIANTE), passos: LER_MURAL },
  ],
  metas: [
    {
      id: 'lista-no-jsx',
      titulo: 'A lista de avisos sai do JSX, com uma chave em cada item',
      passos: [
        'Apague o useEffect inteiro — e o import dele.',
        'Dentro do <ul id="avisos">, escreva {avisos.map(aviso => <li key={aviso.id}>{aviso.texto}</li>)}.',
        'A chave é o id do aviso: é por ela que o React reconhece cada item quando a lista muda.',
        'Clique em Conferir.',
      ],
      feita: ctx => rodou(ctx, ['mural', 'outro']) && semDocumento(ctx)
        && igual(ler(ctx, 'mural', 'avisos'), AVISOS.map(a => a.texto))
        && igual(ler(ctx, 'outro', 'avisos'), AVISOS_NA_VARIANTE.map(a => a.texto))
        && !comAviso(ctx, ['mural', 'outro'], AVISO_DE_CHAVE),
      motivo: ctx => motivoComum(ctx, ['mural', 'outro'])
        ?? (!semDocumento(ctx) ? 'O App.tsx ainda fala com o document — a lista ainda é montada à mão depois de desenhar.' : undefined)
        ?? (comAviso(ctx, ['mural', 'outro'], AVISO_DE_CHAVE) ? 'O console avisa que falta a chave (key) em cada item da lista.' : undefined)
        ?? (igual(ler(ctx, 'mural', 'avisos'), AVISOS.map(a => a.texto)) ? 'Com outros avisos no dados.ts, a lista não mudou junto — ela está escrita à mão?' : 'A lista não mostra os avisos do dados.ts.'),
    },
    {
      id: 'total-no-jsx',
      titulo: 'O total também é descrito: "3 avisos", contado da lista',
      passos: [
        'No <p id="total">, escreva {avisos.length} avisos.',
        'O número sai do tamanho da lista, e não de um 3 escrito à mão.',
      ],
      feita: ctx => rodou(ctx, ['mural', 'outro']) && semDocumento(ctx)
        && ler(ctx, 'mural', 'total') === `${AVISOS.length} avisos`
        && ler(ctx, 'outro', 'total') === `${AVISOS_NA_VARIANTE.length} avisos`,
      motivo: ctx => motivoComum(ctx, ['mural', 'outro'])
        ?? (!semDocumento(ctx) ? 'O App.tsx ainda fala com o document.' : undefined)
        ?? (ler(ctx, 'mural', 'total') === `${AVISOS.length} avisos` ? 'Com quatro avisos no dados.ts, o total continuou dizendo 3.' : `O total diz "${String(ler(ctx, 'mural', 'total') ?? '')}", e deveria dizer "${AVISOS.length} avisos".`),
    },
    {
      id: 'classname',
      titulo: 'O título com className, e nenhum problema no painel',
      passos: [
        'No JSX a classe se escreve className, e não class — class é palavra reservada do JavaScript.',
        'Troque class="titulo" por className="titulo" no <h1>.',
        'O painel de Problemas, embaixo do editor, fica vazio.',
      ],
      feita: ctx => semProblemas(ctx) && rodou(ctx, ['mural'])
        && Array.isArray(ler(ctx, 'mural', 'classes')) && (ler(ctx, 'mural', 'classes') as string[]).includes('titulo'),
      motivo: ctx => motivoDosProblemas(ctx) ?? motivoComum(ctx, ['mural'])
        ?? 'O <h1> não tem a classe titulo.',
    },
  ],
};

/* ── Módulo 2 · Propriedades ────────────────────────────────────────────── */

interface Unidade { id: string; nome: string; lema: string; membros: number }

const unidadeEmTs = (u: Unidade) => `export interface Unidade {
  id: string;
  nome: string;
  lema: string;
  membros: number;
}

export const ipe: Unidade = {
  id: '${u.id}',
  nome: '${u.nome}',
  lema: '${u.lema}',
  membros: ${u.membros},
};
`;

export const IPE: Unidade = { id: 'ipe', nome: 'Ipê', lema: 'Firmes como a raiz', membros: 8 };
const JATOBA: Unidade = { id: 'jatoba', nome: 'Jatobá', lema: 'Sombra para quem chega', membros: 12 };
const BURITI: Unidade = { id: 'buriti', nome: 'Buriti', lema: 'Água boa nasce no cerrado', membros: 1 };

const CARTAO_INICIAL = `// O cartão de uma unidade. Ele recebe três propriedades:
//   nome (texto), lema (texto) e membros (número)
// e desenha:
//   <article className="cartao">
//     <h2>{nome}</h2>
//     <p className="lema">{lema}</p>
//     <p className="membros">8 membros</p>
//   </article>
// Uma unidade de um membro só escreve "1 membro", e não "1 membros".
export default function CartaoDaUnidade() {
  return <article className="cartao"></article>;
}
`;

const CARTAO_APP = `import CartaoDaUnidade from './CartaoDaUnidade';
import { ipe } from './dados';

export default function App() {
  return (
    <main>
      <h1>Unidades do Clube Pioneiros</h1>
      {/* Passe ao cartão o nome, o lema e os membros da unidade ipe. */}
      <CartaoDaUnidade />
    </main>
  );
}
`;

const LER_CARTAO: Passo[] = [
  { acao: 'esperar' },
  { acao: 'ler', chave: 'nome', seletor: '.cartao h2', como: 'texto' },
  { acao: 'ler', chave: 'lema', seletor: '.cartao .lema', como: 'texto' },
  { acao: 'ler', chave: 'membros', seletor: '.cartao .membros', como: 'texto' },
];

export const membros = (n: number) => `${n} ${n === 1 ? 'membro' : 'membros'}`;

const cartaoCerto = (ctx: ContextoDoReact, cenario: string, u: Unidade) =>
  ler(ctx, cenario, 'nome') === u.nome && ler(ctx, cenario, 'lema') === u.lema;

export const componente = (ctx: ContextoDoReact, arquivo: string, nome: string) =>
  analise(ctx, arquivo)?.componentes.find(c => c.nome === nome);

const PROPRIEDADES: DefinicaoDaLicaoDeReact = {
  projeto: 'cartao-da-unidade',
  arquivos: projeto('Unidades', `
.cartao {
  background-color: #FFFFFF;
  border-left: 6px solid #2E7D32;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.cartao h2 {
  margin: 0 0 4px;
}

.lema {
  font-style: italic;
  margin: 0 0 8px;
}

.membros {
  margin: 0;
  color: #5B6B61;
}
`, { 'App.tsx': CARTAO_APP, 'CartaoDaUnidade.tsx': CARTAO_INICIAL, 'dados.ts': unidadeEmTs(IPE) }),
  editaveis: ['App.tsx', 'CartaoDaUnidade.tsx'],
  abre: 'CartaoDaUnidade.tsx',
  cenarios: [
    { id: 'cartao', passos: LER_CARTAO },
    { id: 'outra', dados: unidadeEmTs(JATOBA), passos: LER_CARTAO },
    { id: 'um', dados: unidadeEmTs(BURITI), passos: LER_CARTAO },
  ],
  metas: [
    {
      id: 'tipadas',
      titulo: 'O cartão declara as propriedades que recebe, com tipo',
      passos: [
        'No CartaoDaUnidade.tsx, escreva antes do componente: interface Props { nome: string; lema: string; membros: number }',
        'Receba as propriedades já desmontadas: function CartaoDaUnidade({ nome, lema, membros }: Props).',
        'O painel de Problemas fica vazio quando o App passa as três com o tipo certo.',
      ],
      feita: ctx => {
        const c = componente(ctx, 'CartaoDaUnidade.tsx', 'CartaoDaUnidade');
        return !!c && c.parametros >= 1 && c.propriedadesTipadas && semProblemas(ctx);
      },
      motivo: ctx => {
        const c = componente(ctx, 'CartaoDaUnidade.tsx', 'CartaoDaUnidade');
        if (!c || c.parametros === 0) return 'O CartaoDaUnidade ainda não recebe parâmetro nenhum.';
        if (!c.propriedadesTipadas) return 'As propriedades do cartão chegam sem tipo — escreva a interface e diga que elas são do tipo dela.';
        return motivoDosProblemas(ctx);
      },
    },
    {
      id: 'desenha',
      titulo: 'E desenha o que recebeu, e não o que foi buscar',
      passos: [
        'No App, passe as três: <CartaoDaUnidade nome={ipe.nome} lema={ipe.lema} membros={ipe.membros} />.',
        'No cartão, use {nome}, {lema} e {membros} no lugar de cada texto.',
        'O cartão não importa o dados.ts: quem decide qual unidade ele mostra é quem o usa.',
      ],
      feita: ctx => rodou(ctx, ['cartao', 'outra'])
        && cartaoCerto(ctx, 'cartao', IPE) && cartaoCerto(ctx, 'outra', JATOBA)
        && ler(ctx, 'cartao', 'membros') === membros(IPE.membros) && ler(ctx, 'outra', 'membros') === membros(JATOBA.membros)
        && !(analise(ctx, 'CartaoDaUnidade.tsx')?.importa ?? []).some(m => /dados/.test(m)),
      motivo: ctx => motivoComum(ctx, ['cartao', 'outra'])
        ?? ((analise(ctx, 'CartaoDaUnidade.tsx')?.importa ?? []).some(m => /dados/.test(m))
          ? 'O cartão importa o dados.ts sozinho. Ele precisa receber a unidade de quem o usa, pelas propriedades.' : undefined)
        ?? (cartaoCerto(ctx, 'cartao', IPE) ? 'Com outra unidade no dados.ts, o cartão continuou mostrando a Ipê — os textos estão escritos à mão?'
          : 'O cartão não mostra o nome e o lema da Ipê em .cartao h2 e .cartao .lema.'),
    },
    {
      id: 'um-membro',
      titulo: '1 membro, e não 1 membros',
      passos: [
        'Em .membros, escolha a palavra pelo número: {membros} {membros === 1 ? \'membro\' : \'membros\'}.',
        'É uma renderização condicional pequena: a tela muda conforme o dado.',
      ],
      feita: ctx => rodou(ctx, ['cartao', 'um'])
        && ler(ctx, 'um', 'membros') === membros(1) && ler(ctx, 'cartao', 'membros') === membros(IPE.membros),
      motivo: ctx => motivoComum(ctx, ['cartao', 'um'])
        ?? `Com uma unidade de um membro só, o cartão escreve "${String(ler(ctx, 'um', 'membros') ?? '')}".`,
    },
  ],
};

/* ── Módulo 3 · O mesmo componente, de jeitos diferentes ────────────────── */

const ESTILO_EM_LINHA = "{ color: 'white', border: 0, borderRadius: 6, padding: '8px 14px', fontWeight: 'bold'";
const PLACAR_APP = `import { useState } from 'react';

// Três botões quase iguais, escritos três vezes. Troque os três pelo mesmo
// componente Botao, passando a cor, o que fazer no clique e o texto.
export default function App() {
  const [pontos, setPontos] = useState(0);

  return (
    <main>
      <h1>Placar da gincana</h1>
      <p className="placar">{pontos} pontos</p>
      <div className="botoes">
        <button style={${ESTILO_EM_LINHA}, background: '#2E7D32' }} onClick={() => setPontos(pontos + 1)}>
          +1 ponto
        </button>
        <button style={${ESTILO_EM_LINHA}, background: '#1565C0' }} onClick={() => setPontos(pontos + 5)}>
          +5 pontos
        </button>
        <button style={${ESTILO_EM_LINHA}, background: '#C62828' }} onClick={() => setPontos(0)}>
          Zerar
        </button>
      </div>
    </main>
  );
}
`;

const BOTAO_INICIAL = `// O botão do placar, escrito uma vez só. Ele recebe três propriedades:
//   cor: 'verde', 'azul' ou 'vermelho' — vira a classe botao-verde, botao-azul ou botao-vermelho
//   aoClicar: a função que roda no clique
//   children: o que vai escrito dentro do botão
// e desenha <button className="botao botao-verde">…</button>.
export default function Botao() {
  return <button className="botao">Botão</button>;
}
`;

const LER_PLACAR: Passo[] = [
  { acao: 'esperar' },
  { acao: 'ler', chave: 'textos', seletor: '.botoes button', como: 'textos' },
  { acao: 'ler', chave: 'classes', seletor: '.botoes button', como: 'classesDeTodos' },
  { acao: 'clicar', seletor: 'button.botao-azul' },
  { acao: 'clicar', seletor: 'button.botao-verde' },
  { acao: 'ler', chave: 'depois', seletor: '.placar', como: 'texto' },
  { acao: 'clicar', seletor: 'button.botao-vermelho' },
  { acao: 'ler', chave: 'zerado', seletor: '.placar', como: 'texto' },
];

const ROTULOS = ['+1 ponto', '+5 pontos', 'Zerar'];
const CORES = ['botao-verde', 'botao-azul', 'botao-vermelho'];

const tresBotoes = (ctx: ContextoDoReact) => {
  const a = analise(ctx, 'App.tsx');
  return !!a && (a.usosDeComponente.Botao ?? 0) >= 3 && !a.usosDeElemento.button
    && igual(ler(ctx, 'placar', 'textos'), ROTULOS);
};

const coresCertas = (ctx: ContextoDoReact) => {
  const textos = ler(ctx, 'placar', 'textos') as string[] | undefined;
  const classes = ler(ctx, 'placar', 'classes') as string[][] | undefined;
  if (!textos || !classes) return false;
  return ROTULOS.every((r, i) => {
    const k = textos.indexOf(r);
    return k >= 0 && classes[k].includes('botao') && classes[k].includes(CORES[i]);
  });
};

const REAPROVEITAR: DefinicaoDaLicaoDeReact = {
  projeto: 'placar-da-gincana',
  arquivos: projeto('Placar', `
.placar {
  font-size: 32px;
  font-weight: bold;
  margin: 8px 0 16px;
}

.botoes {
  display: flex;
  gap: 8px;
}

.botao {
  border: 0;
  border-radius: 6px;
  padding: 8px 14px;
  color: #FFFFFF;
  font-weight: bold;
}

.botao-verde {
  background-color: #2E7D32;
}

.botao-azul {
  background-color: #1565C0;
}

.botao-vermelho {
  background-color: #C62828;
}
`, { 'App.tsx': PLACAR_APP, 'Botao.tsx': BOTAO_INICIAL }),
  editaveis: ['App.tsx', 'Botao.tsx'],
  abre: 'Botao.tsx',
  cenarios: [{ id: 'placar', passos: LER_PLACAR }],
  metas: [
    {
      id: 'componente',
      titulo: 'Um componente Botao, com as propriedades tipadas',
      passos: [
        'No Botao.tsx, declare: interface Props { cor: \'verde\' | \'azul\' | \'vermelho\'; aoClicar: () => void; children: ReactNode }',
        'O ReactNode vem do React: import type { ReactNode } from \'react\'.',
        'Receba ({ cor, aoClicar, children }: Props) e desenhe <button className={`botao botao-${cor}`} onClick={aoClicar}>{children}</button>.',
      ],
      feita: ctx => {
        const c = componente(ctx, 'Botao.tsx', 'Botao');
        return !!c && c.propriedadesTipadas && c.usaChildren && semProblemas(ctx);
      },
      motivo: ctx => {
        const c = componente(ctx, 'Botao.tsx', 'Botao');
        if (!c || c.parametros === 0) return 'O Botao ainda não recebe propriedade nenhuma.';
        if (!c.propriedadesTipadas) return 'As propriedades do Botao chegam sem tipo.';
        if (!c.usaChildren) return 'O texto de dentro do botão chega em children, e o Botao ainda não usa children.';
        return motivoDosProblemas(ctx);
      },
    },
    {
      id: 'tres-usos',
      titulo: 'Os três botões do placar são o mesmo Botao',
      passos: [
        'No App, importe o Botao: import Botao from \'./Botao\'.',
        'Troque cada <button style=…> por <Botao cor="verde" aoClicar={() => setPontos(pontos + 1)}>+1 ponto</Botao>, e assim nos outros dois.',
        'No fim, o App não escreve nenhum <button> — quem escreve é o Botao.',
      ],
      feita: ctx => rodou(ctx, ['placar']) && tresBotoes(ctx),
      motivo: ctx => motivoComum(ctx, ['placar'])
        ?? ((analise(ctx, 'App.tsx')?.usosDeElemento.button ?? 0) > 0 ? 'O App ainda escreve <button> por conta própria.' : undefined)
        ?? ((analise(ctx, 'App.tsx')?.usosDeComponente.Botao ?? 0) < 3 ? 'O App ainda não usa o Botao três vezes.' : 'Os três botões não mostram +1 ponto, +5 pontos e Zerar, nessa ordem.'),
    },
    {
      id: 'cores',
      titulo: 'Cada um com a sua cor',
      passos: [
        'O verde é o +1, o azul é o +5 e o vermelho é o Zerar.',
        'A cor chega como propriedade e vira a classe: botao-verde, botao-azul, botao-vermelho — a folha já pinta as três.',
      ],
      feita: ctx => rodou(ctx, ['placar']) && coresCertas(ctx),
      motivo: ctx => motivoComum(ctx, ['placar']) ?? 'Os botões não têm as classes botao e botao-verde, botao-azul ou botao-vermelho.',
    },
    {
      id: 'contas',
      titulo: 'E cada um fazendo a sua conta',
      passos: [
        'O aoClicar de cada Botao chama o setPontos com a conta dele: +1, +5 e zerar.',
        'O Botao não sabe de pontos — ele só chama a função que recebeu.',
      ],
      feita: ctx => rodou(ctx, ['placar']) && tresBotoes(ctx)
        && ler(ctx, 'placar', 'depois') === '6 pontos' && ler(ctx, 'placar', 'zerado') === '0 pontos',
      motivo: ctx => motivoComum(ctx, ['placar'])
        ?? (!tresBotoes(ctx) ? 'Primeiro os três botões precisam ser o mesmo Botao.' : undefined)
        ?? `Depois de +5 e +1 o placar diz "${String(ler(ctx, 'placar', 'depois') ?? '')}", e deveria dizer 6 pontos.`,
    },
  ],
};

/* ── Módulo 4 · Estado e o que aparece conforme ele ─────────────────────── */

const quorumEmTs = (q: number) => `// Quantos precisam estar presentes para a reunião valer.
export const QUORUM = ${q};
`;

const CHAMADA_APP = `import { QUORUM } from './dados';

// O botão Chegou mais um conta — olhe o console. Mas o número na tela não
// muda. E o aviso de quórum aparece desde o começo, com ninguém na sala.
export default function App() {
  let presentes = 0;

  function chegou() {
    presentes = presentes + 1;
    console.log('presentes agora:', presentes);
  }

  return (
    <main>
      <h1>Chamada da Unidade Ipê</h1>
      <p>
        Presentes: <strong id="presentes">{presentes}</strong> (quórum: {QUORUM})
      </p>
      <button id="chegou" onClick={chegou}>Chegou mais um</button>
      <button id="saiu">Saiu um</button>
      <p className="quorum">Temos quórum para a reunião!</p>
    </main>
  );
}
`;

const vezes = (n: number, passo: Passo): Passo[] => Array.from({ length: n }, () => passo);
const CHEGOU: Passo = { acao: 'clicar', seletor: '#chegou' };
const SAIU: Passo = { acao: 'clicar', seletor: '#saiu' };
const lerPresentes = (chave: string): Passo => ({ acao: 'ler', chave, seletor: '#presentes', como: 'texto' });
const lerQuorum = (chave: string): Passo => ({ acao: 'ler', chave, seletor: '.quorum', como: 'existe' });

const ESTADO: DefinicaoDaLicaoDeReact = {
  projeto: 'chamada-da-ipe',
  arquivos: projeto('Chamada', `
#presentes {
  font-size: 22px;
}

button {
  margin-right: 8px;
  padding: 6px 12px;
}

.quorum {
  background-color: #E3F1E4;
  border: 1px solid #2E7D32;
  border-radius: 6px;
  padding: 8px 12px;
}
`, { 'App.tsx': CHAMADA_APP, 'dados.ts': quorumEmTs(5) }),
  editaveis: ['App.tsx'],
  abre: 'App.tsx',
  cenarios: [
    { id: 'contar', passos: [{ acao: 'esperar' }, lerPresentes('p0'), ...vezes(3, CHEGOU), lerPresentes('p3'), lerQuorum('q3'), ...vezes(2, CHEGOU), lerPresentes('p5'), lerQuorum('q5')] },
    { id: 'saiu', passos: [{ acao: 'esperar' }, SAIU, lerPresentes('zero'), CHEGOU, CHEGOU, SAIU, lerPresentes('um')] },
    { id: 'quorum3', dados: quorumEmTs(3), passos: [{ acao: 'esperar' }, ...vezes(2, CHEGOU), lerQuorum('q2'), CHEGOU, lerQuorum('q3')] },
  ],
  metas: [
    {
      id: 'muda',
      titulo: 'O número muda na tela a cada clique',
      passos: [
        'Uma variável comum muda e o React nem fica sabendo: ninguém pede para desenhar de novo.',
        'Troque o let por estado: const [presentes, setPresentes] = useState(0); — e importe o useState do react.',
        'No chegou, chame setPresentes(presentes + 1).',
      ],
      feita: ctx => rodou(ctx, ['contar']) && semDocumento(ctx)
        && ler(ctx, 'contar', 'p0') === '0' && ler(ctx, 'contar', 'p3') === '3' && ler(ctx, 'contar', 'p5') === '5',
      motivo: ctx => motivoComum(ctx, ['contar'])
        ?? (!semDocumento(ctx) ? 'O App.tsx escreve o número com o document. Quem muda a tela aqui é o estado.' : undefined)
        ?? `Depois de três cliques, a tela mostra ${String(ler(ctx, 'contar', 'p3') ?? 'nada')} presentes.`,
    },
    {
      id: 'zero',
      titulo: 'Saiu um tira um — e nunca abaixo de zero',
      passos: [
        'Escreva a função saiu e ligue no onClick do botão Saiu um.',
        'Só tire um quando houver alguém: if (presentes > 0) setPresentes(presentes - 1).',
      ],
      feita: ctx => rodou(ctx, ['saiu']) && ler(ctx, 'saiu', 'zero') === '0' && ler(ctx, 'saiu', 'um') === '1',
      motivo: ctx => motivoComum(ctx, ['saiu'])
        ?? (ler(ctx, 'saiu', 'zero') !== '0' ? `Com a sala vazia, Saiu um deixou ${String(ler(ctx, 'saiu', 'zero'))} presentes.` : 'Depois de dois chegando e um saindo, a tela não mostra 1.'),
    },
    {
      id: 'quorum',
      titulo: 'O aviso de quórum só existe quando há quórum',
      passos: [
        'Escreva o aviso dentro de uma condição: {presentes >= QUORUM && <p className="quorum">Temos quórum para a reunião!</p>}.',
        'Abaixo do quórum o parágrafo nem existe na página — não está escondido, não está lá.',
      ],
      feita: ctx => rodou(ctx, ['contar', 'quorum3'])
        && ler(ctx, 'contar', 'q3') === false && ler(ctx, 'contar', 'q5') === true
        && ler(ctx, 'quorum3', 'q2') === false && ler(ctx, 'quorum3', 'q3') === true,
      motivo: ctx => motivoComum(ctx, ['contar', 'quorum3'])
        ?? (ler(ctx, 'contar', 'q3') !== false ? 'Com 3 presentes e quórum de 5, o aviso de quórum está na página.'
          : ler(ctx, 'contar', 'q5') !== true ? 'Com 5 presentes, o aviso de quórum não apareceu.'
            : 'Com quórum de 3 no dados.ts, o aviso não acompanhou — o 5 está escrito à mão?'),
    },
  ],
};

/* ── Módulo 5 · Listas e chaves ─────────────────────────────────────────── */

interface Tarefa { id: number; texto: string }

const tarefasEmTs = (ts: Tarefa[]) => `export interface Tarefa {
  id: number;
  texto: string;
}

export const TAREFAS: Tarefa[] = [
${ts.map(t => `  { id: ${t.id}, texto: '${t.texto}' },`).join('\n')}
];
`;

export const TAREFAS: Tarefa[] = [
  { id: 1, texto: 'Montar a barraca' },
  { id: 2, texto: 'Recolher lenha seca' },
  { id: 3, texto: 'Encher os galões de água' },
  { id: 4, texto: 'Cavar a vala em volta da barraca' },
];
const TAREFAS_NA_VARIANTE: Tarefa[] = [
  { id: 21, texto: 'Lavar as panelas' },
  { id: 17, texto: 'Apagar a fogueira com água' },
  { id: 30, texto: 'Recolher o lixo da trilha' },
  { id: 12, texto: 'Dobrar as lonas' },
  { id: 25, texto: 'Conferir os cantis' },
];

const ITEM_DA_TAREFA = `import { useState } from 'react';

interface Props {
  texto: string;
  aoRemover: () => void;
}

// Cada item guarda a própria marca de feito, no estado dele.
// Este arquivo chega pronto.
export default function ItemDaTarefa({ texto, aoRemover }: Props) {
  const [feita, setFeita] = useState(false);

  return (
    <li className={feita ? 'feita' : undefined}>
      <label>
        <input type="checkbox" checked={feita} onChange={e => setFeita(e.target.checked)} />
        {texto}
      </label>
      <button className="remover" onClick={aoRemover} aria-label={\`Remover \${texto}\`}>
        ×
      </button>
    </li>
  );
}
`;

const TAREFAS_APP = `import { useState } from 'react';
import ItemDaTarefa from './ItemDaTarefa';
import { TAREFAS } from './dados';

export default function App() {
  const [tarefas, setTarefas] = useState(TAREFAS);

  function remover(id: number) {
    setTarefas(tarefas.filter(t => t.id !== id));
  }

  return (
    <main>
      <h1>Tarefas do acampamento</h1>
      <p>{tarefas.length} tarefas</p>
      <ul id="tarefas">
        {/* Desenhe aqui um <ItemDaTarefa> para cada tarefa. */}
      </ul>
    </main>
  );
}
`;

const LER_ROTULOS = (chave: string, seletor = '#tarefas li label'): Passo => ({ acao: 'ler', chave, seletor, como: 'textos' });

const LISTAS: DefinicaoDaLicaoDeReact = {
  projeto: 'tarefas-do-acampamento',
  arquivos: projeto('Tarefas', `
#tarefas {
  list-style: none;
  padding: 0;
}

#tarefas li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #DCD6C6;
}

.feita label {
  text-decoration: line-through;
  color: #7A867E;
}

.remover {
  border: 0;
  background: none;
  font-size: 20px;
  color: #9A3B2F;
}
`, { 'App.tsx': TAREFAS_APP, 'ItemDaTarefa.tsx': ITEM_DA_TAREFA, 'dados.ts': tarefasEmTs(TAREFAS) }),
  editaveis: ['App.tsx'],
  abre: 'App.tsx',
  cenarios: [
    { id: 'lista', passos: [{ acao: 'esperar' }, LER_ROTULOS('rotulos')] },
    { id: 'outra', dados: tarefasEmTs(TAREFAS_NA_VARIANTE), passos: [{ acao: 'esperar' }, LER_ROTULOS('rotulos')] },
    { id: 'remover', passos: [{ acao: 'esperar' }, { acao: 'clicar', seletor: '#tarefas li:nth-child(2) .remover' }, LER_ROTULOS('rotulos')] },
    {
      id: 'marca',
      passos: [
        { acao: 'esperar' },
        { acao: 'clicar', seletor: '#tarefas li:nth-child(3) input' },
        { acao: 'clicar', seletor: '#tarefas li:nth-child(1) .remover' },
        LER_ROTULOS('feitas', '#tarefas li.feita label'),
        LER_ROTULOS('rotulos'),
      ],
    },
  ],
  metas: [
    {
      id: 'cada',
      titulo: 'Um <ItemDaTarefa> para cada tarefa da lista',
      passos: [
        'Dentro do <ul>, percorra o estado: {tarefas.map(t => <ItemDaTarefa … />)}.',
        'Passe o texto e o que fazer ao remover: texto={t.texto} aoRemover={() => remover(t.id)}.',
      ],
      feita: ctx => rodou(ctx, ['lista', 'outra'])
        && igual(ler(ctx, 'lista', 'rotulos'), TAREFAS.map(t => t.texto))
        && igual(ler(ctx, 'outra', 'rotulos'), TAREFAS_NA_VARIANTE.map(t => t.texto)),
      motivo: ctx => motivoComum(ctx, ['lista', 'outra'])
        ?? (igual(ler(ctx, 'lista', 'rotulos'), TAREFAS.map(t => t.texto)) ? 'Com outra lista no dados.ts, a página não mudou junto.' : 'A lista não mostra as quatro tarefas do dados.ts.'),
    },
    {
      id: 'chave',
      titulo: 'Sem o aviso de chave no console',
      passos: [
        'Todo item de uma lista feita com map precisa de uma key, única entre os irmãos.',
        'Use o id da tarefa: <ItemDaTarefa key={t.id} … />.',
      ],
      feita: ctx => rodou(ctx, ['lista', 'outra', 'remover', 'marca'])
        && igual(ler(ctx, 'lista', 'rotulos'), TAREFAS.map(t => t.texto))
        && !comAviso(ctx, ['lista', 'outra', 'remover', 'marca'], AVISO_DE_CHAVE),
      motivo: ctx => motivoComum(ctx, ['lista', 'outra', 'remover', 'marca'])
        ?? (comAviso(ctx, ['lista', 'outra', 'remover', 'marca'], AVISO_DE_CHAVE) ? 'O console avisa: Each child in a list should have a unique "key" prop.' : 'Primeiro a lista precisa aparecer.'),
    },
    {
      id: 'remove',
      titulo: 'O × tira a tarefa certa',
      passos: ['O aoRemover de cada item chama remover com o id daquela tarefa.'],
      feita: ctx => rodou(ctx, ['remover']) && igual(ler(ctx, 'remover', 'rotulos'), TAREFAS.filter((_, i) => i !== 1).map(t => t.texto)),
      motivo: ctx => motivoComum(ctx, ['remover']) ?? 'Clicar no × da segunda tarefa não tirou a Recolher lenha seca da lista.',
    },
    {
      id: 'marca',
      titulo: 'E a marca de feito fica com a tarefa, quando outra sai',
      passos: [
        'Marque uma tarefa e remova outra acima dela: a marca precisa continuar na mesma tarefa.',
        'Se a marca pulou para a vizinha, a chave é a posição na lista (o índice do map). A posição muda quando alguém sai; o id não.',
        'Use key={t.id}, e não key={indice}.',
      ],
      feita: ctx => rodou(ctx, ['marca'])
        && igual(ler(ctx, 'marca', 'feitas'), [TAREFAS[2].texto])
        && igual(ler(ctx, 'marca', 'rotulos'), TAREFAS.slice(1).map(t => t.texto)),
      motivo: ctx => motivoComum(ctx, ['marca'])
        ?? (igual(ler(ctx, 'marca', 'feitas'), [TAREFAS[3].texto])
          ? 'A marca de feito pulou para a Cavar a vala quando a primeira tarefa saiu — a chave é a posição, e não o id.'
          : 'Marcar a terceira tarefa e remover a primeira não deixou só a Encher os galões de água marcada.'),
    },
  ],
};

/* ── Módulo 6 · Formulário controlado ───────────────────────────────────── */

const unidadesEmTs = (us: string[]) => `export const UNIDADES = [${us.map(u => `'${u}'`).join(', ')}];
`;
export const UNIDADES = ['Ipê', 'Jatobá', 'Buriti', 'Aroeira'];
const UNIDADES_NA_VARIANTE = ['Tucano', 'Arara', 'Onça'];

const INSCRICAO_APP = `import { useState } from 'react';
import { UNIDADES } from './dados';

interface Inscricao {
  id: number;
  nome: string;
  unidade: string;
  idade: number;
}

// Os campos ainda são do navegador, e não do React: ninguém guarda o que se
// digita, e enviar recarrega a página e apaga tudo.
export default function App() {
  const [inscritos, setInscritos] = useState<Inscricao[]>([]);

  return (
    <main>
      <h1>Inscrição no campori</h1>
      <form id="inscricao">
        <label>
          Nome <input id="nome" />
        </label>
        <label>
          Unidade
          <select id="unidade">
            {UNIDADES.map(u => <option key={u}>{u}</option>)}
          </select>
        </label>
        <label>
          Idade <input id="idade" type="number" />
        </label>
        <button type="submit">Inscrever</button>
      </form>
      <p className="previa">Inscrevendo: </p>
      <ul id="inscritos">
        {inscritos.map(i => (
          <li key={i.id}>
            {i.nome} — {i.unidade}, {i.idade} anos
          </li>
        ))}
      </ul>
    </main>
  );
}
`;

const PREENCHER = (nome: string, unidade: string, idade: string): Passo[] => [
  ...(nome ? [{ acao: 'digitar', seletor: '#nome', texto: nome } as Passo] : []),
  { acao: 'escolher', seletor: '#unidade', texto: unidade },
  { acao: 'digitar', seletor: '#idade', texto: idade },
  { acao: 'enviar', seletor: '#inscricao' },
];

const FORMULARIO: DefinicaoDaLicaoDeReact = {
  projeto: 'inscricao-no-campori',
  arquivos: projeto('Inscrição', `
form {
  display: grid;
  gap: 10px;
  max-width: 320px;
}

label {
  display: grid;
  gap: 2px;
  font-size: 14px;
}

input, select {
  font: inherit;
  padding: 4px 6px;
}

.previa {
  color: #5B6B61;
}

.erro {
  color: #9A3B2F;
  font-weight: bold;
}
`, { 'App.tsx': INSCRICAO_APP, 'dados.ts': unidadesEmTs(UNIDADES) }),
  editaveis: ['App.tsx'],
  abre: 'App.tsx',
  cenarios: [
    {
      id: 'digitar',
      passos: [
        { acao: 'esperar' },
        { acao: 'digitar', seletor: '#nome', texto: 'ana' },
        { acao: 'ler', chave: 'valor', seletor: '#nome', como: 'valor' },
        { acao: 'ler', chave: 'previa', seletor: '.previa', como: 'texto' },
      ],
    },
    {
      id: 'enviar',
      passos: [
        { acao: 'esperar' },
        ...PREENCHER('ana clara', 'Jatobá', '12'),
        { acao: 'ler', chave: 'inscritos', seletor: '#inscritos li', como: 'textos' },
        { acao: 'ler', chave: 'nome', seletor: '#nome', como: 'valor' },
        { acao: 'ler', chave: 'idade', seletor: '#idade', como: 'valor' },
        { acao: 'ler', chave: 'unidade', seletor: '#unidade', como: 'valor' },
        { acao: 'ler', chave: 'erro', seletor: '.erro', como: 'existe' },
      ],
    },
    {
      id: 'vazio',
      passos: [
        { acao: 'esperar' },
        ...PREENCHER('', 'Buriti', '11'),
        { acao: 'ler', chave: 'erro', seletor: '.erro', como: 'texto' },
        { acao: 'ler', chave: 'quantos', seletor: '#inscritos li', como: 'contagem' },
      ],
    },
    {
      id: 'outra',
      dados: unidadesEmTs(UNIDADES_NA_VARIANTE),
      passos: [
        { acao: 'esperar' },
        { acao: 'ler', chave: 'opcoes', seletor: '#unidade option', como: 'textos' },
        ...PREENCHER('bia', 'Arara', '10'),
        { acao: 'ler', chave: 'inscritos', seletor: '#inscritos li', como: 'textos' },
        { acao: 'ler', chave: 'unidade', seletor: '#unidade', como: 'valor' },
      ],
    },
  ],
  metas: [
    {
      id: 'controlado',
      titulo: 'O campo mostra o que o estado guarda — em maiúsculas',
      passos: [
        'Guarde o nome no estado: const [nome, setNome] = useState(\'\').',
        'Ligue os dois lados do campo: <input id="nome" value={nome} onChange={e => setNome(e.target.value.toUpperCase())} />.',
        'Mostre a prévia com o estado: <p className="previa">Inscrevendo: {nome}</p>.',
        'Faça o mesmo com a unidade e a idade — o console não pode avisar de campo descontrolado.',
      ],
      feita: ctx => rodou(ctx, ['digitar', 'enviar', 'vazio', 'outra'])
        && ler(ctx, 'digitar', 'valor') === 'ANA' && String(ler(ctx, 'digitar', 'previa') ?? '').includes('ANA')
        && !comAviso(ctx, ['digitar', 'enviar', 'vazio', 'outra'], AVISO_DE_CONTROLE),
      motivo: ctx => motivoComum(ctx, ['digitar', 'enviar', 'vazio', 'outra'])
        ?? (comAviso(ctx, ['digitar', 'enviar', 'vazio', 'outra'], AVISO_DE_CONTROLE) ? 'O console avisa de um campo com value e sem onChange, ou que deixou de ser controlado.' : undefined)
        ?? (ler(ctx, 'digitar', 'valor') !== 'ANA' ? `Digitando "ana", o campo mostra "${String(ler(ctx, 'digitar', 'valor') ?? '')}" — o que ele mostra ainda não sai do estado.` : 'A prévia não mostra o nome que está sendo digitado.'),
    },
    {
      id: 'envia',
      titulo: 'Enviar não recarrega, e a inscrição entra na lista',
      passos: [
        'Escreva a função enviar(e: FormEvent<HTMLFormElement>) e comece com e.preventDefault() — é ela que impede o recarregamento.',
        'Ligue no formulário: <form id="inscricao" onSubmit={enviar}>.',
        'Acrescente ao estado uma lista nova, com a inscrição no fim: setInscritos([...inscritos, { id: Date.now(), nome, unidade, idade: Number(idade) }]).',
        'As opções da unidade continuam saindo do dados.ts.',
      ],
      feita: ctx => rodou(ctx, ['enviar', 'outra'])
        && igual(ler(ctx, 'enviar', 'inscritos'), ['ANA CLARA — Jatobá, 12 anos'])
        && igual(ler(ctx, 'outra', 'opcoes'), UNIDADES_NA_VARIANTE)
        && igual(ler(ctx, 'outra', 'inscritos'), ['BIA — Arara, 10 anos']),
      motivo: ctx => motivoComum(ctx, ['enviar', 'outra'])
        ?? `Depois de enviar, a lista mostra ${JSON.stringify(ler(ctx, 'enviar', 'inscritos') ?? [])}, e deveria mostrar ["ANA CLARA — Jatobá, 12 anos"].`,
    },
    {
      id: 'limpa',
      titulo: 'Depois de enviar, os campos voltam ao começo',
      passos: [
        'No fim do enviar, devolva cada estado ao valor inicial: setNome(\'\'), setIdade(\'\'), setUnidade(UNIDADES[0]).',
        'Como o campo mostra o estado, limpar o estado limpa o campo — sem tocar no campo.',
      ],
      feita: ctx => rodou(ctx, ['enviar', 'outra'])
        && igual(ler(ctx, 'enviar', 'inscritos'), ['ANA CLARA — Jatobá, 12 anos'])
        && ler(ctx, 'enviar', 'nome') === '' && ler(ctx, 'enviar', 'idade') === ''
        && ler(ctx, 'enviar', 'unidade') === UNIDADES[0] && ler(ctx, 'outra', 'unidade') === UNIDADES_NA_VARIANTE[0],
      motivo: ctx => motivoComum(ctx, ['enviar', 'outra'])
        ?? (!igual(ler(ctx, 'enviar', 'inscritos'), ['ANA CLARA — Jatobá, 12 anos']) ? 'Primeiro a inscrição precisa entrar na lista.' : undefined)
        ?? 'Depois de enviar, algum campo continua com o que estava digitado — ou a unidade não voltou para a primeira.',
    },
    {
      id: 'vazio',
      titulo: 'Sem nome, nada entra — e a página diz por quê',
      passos: [
        'No começo do enviar, depois do preventDefault: se nome.trim() estiver vazio, guarde um erro no estado e pare com return.',
        'Desenhe o erro só quando houver: {erro && <p className="erro">{erro}</p>}, com o texto Escreva o nome.',
        'Uma inscrição que deu certo apaga o erro.',
      ],
      feita: ctx => rodou(ctx, ['vazio', 'enviar'])
        && ler(ctx, 'vazio', 'erro') === 'Escreva o nome.' && ler(ctx, 'vazio', 'quantos') === 0
        && ler(ctx, 'enviar', 'erro') === false,
      motivo: ctx => motivoComum(ctx, ['vazio', 'enviar'])
        ?? (ler(ctx, 'vazio', 'quantos') !== 0 ? 'Uma inscrição sem nome entrou na lista.' : undefined)
        ?? (ler(ctx, 'vazio', 'erro') !== 'Escreva o nome.' ? 'Enviando sem nome, a página não mostra "Escreva o nome." num .erro.' : 'Com uma inscrição certa, o .erro continua na página.'),
    },
  ],
};

/* ── Módulo 7 · Efeito depois de desenhar ───────────────────────────────── */

const chamadaEmTs = (unidade: string) => `export const UNIDADE = '${unidade}';

export const MEMBROS = ['Ana Clara', 'Bruno', 'Daniel', 'Helena', 'Isabela', 'Mariana', 'Samuel'];
`;
export const MEMBROS = ['Ana Clara', 'Bruno', 'Daniel', 'Helena', 'Isabela', 'Mariana', 'Samuel'];

const EFEITO_APP = `import { useState } from 'react';
import { MEMBROS, UNIDADE } from './dados';

export default function App() {
  const [presentes, setPresentes] = useState<string[]>([]);
  const [busca, setBusca] = useState('');

  function alternar(nome: string) {
    setPresentes(presentes.includes(nome) ? presentes.filter(n => n !== nome) : [...presentes, nome]);
  }

  // A aba do navegador deveria mostrar quantos chegaram, e a chamada
  // deveria ser salva cada vez que muda. Por enquanto, nada disso acontece.

  const visiveis = MEMBROS.filter(m => m.toLowerCase().includes(busca.toLowerCase()));

  return (
    <main>
      <h1>Chamada da Unidade {UNIDADE}</h1>
      <input id="busca" placeholder="Procurar" value={busca} onChange={e => setBusca(e.target.value)} />
      <ul id="membros">
        {visiveis.map(m => (
          <li key={m}>
            <label>
              <input type="checkbox" checked={presentes.includes(m)} onChange={() => alternar(m)} /> {m}
            </label>
          </li>
        ))}
      </ul>
      <p id="contagem">{presentes.length} presentes</p>
    </main>
  );
}
`;

const salvamentos = (ctx: ContextoDoReact, cenario: string) =>
  (ctx.cenarios?.[cenario]?.console ?? []).filter(e => e.nivel === 'log' && /^Salvando a chamada:/.test(e.texto)).map(e => e.texto);
const SALVA = (n: number) => `Salvando a chamada: ${n} de ${MEMBROS.length}`;
const titulo = (n: number, unidade = 'Ipê') => `(${n}) Chamada da ${unidade}`;

const EFEITO: DefinicaoDaLicaoDeReact = {
  projeto: 'chamada-com-efeito',
  arquivos: projeto('Chamada', `
#busca {
  font: inherit;
  padding: 4px 8px;
  width: 220px;
}

#membros {
  list-style: none;
  padding: 0;
}
`, { 'App.tsx': EFEITO_APP, 'dados.ts': chamadaEmTs('Ipê') }),
  editaveis: ['App.tsx'],
  abre: 'App.tsx',
  cenarios: [
    {
      id: 'chamada',
      passos: [
        { acao: 'esperar' },
        { acao: 'ler', chave: 't0', seletor: 'body', como: 'titulo' },
        { acao: 'clicar', seletor: '#membros li:nth-child(1) input' },
        { acao: 'clicar', seletor: '#membros li:nth-child(3) input' },
        { acao: 'esperar' },
        { acao: 'ler', chave: 't2', seletor: 'body', como: 'titulo' },
      ],
    },
    {
      id: 'busca',
      passos: [
        { acao: 'esperar' },
        { acao: 'clicar', seletor: '#membros li:nth-child(1) input' },
        { acao: 'esperar' },
        { acao: 'digitar', seletor: '#busca', texto: 'an' },
        { acao: 'esperar' },
        { acao: 'ler', chave: 'visiveis', seletor: '#membros li', como: 'textos' },
      ],
    },
    { id: 'outra', dados: chamadaEmTs('Jatobá'), passos: [{ acao: 'esperar' }, { acao: 'ler', chave: 't0', seletor: 'body', como: 'titulo' }] },
  ],
  metas: [
    {
      id: 'titulo',
      titulo: 'A aba do navegador mostra quantos chegaram',
      passos: [
        'Mudar o título da aba não é desenhar: é um efeito colateral, e o lugar dele é um useEffect.',
        'useEffect(() => { document.title = `(${presentes.length}) Chamada da ${UNIDADE}`; }, [presentes]); — e importe o useEffect.',
        'A atribuição fica dentro do efeito, e não solta no corpo do componente.',
      ],
      feita: ctx => {
        const a = analise(ctx, 'App.tsx');
        return rodou(ctx, ['chamada', 'outra']) && !!a && a.tituloForaDeEfeito === 0 && a.efeitos.some(e => e.mudaOTitulo)
          && ler(ctx, 'chamada', 't0') === titulo(0) && ler(ctx, 'chamada', 't2') === titulo(2)
          && ler(ctx, 'outra', 't0') === titulo(0, 'Jatobá');
      },
      motivo: ctx => {
        const a = analise(ctx, 'App.tsx');
        return motivoComum(ctx, ['chamada', 'outra'])
          ?? (a && a.tituloForaDeEfeito > 0 ? 'O document.title é escrito no corpo do componente, a cada desenho. Leve-o para dentro de um useEffect.' : undefined)
          ?? (a && !a.efeitos.some(e => e.mudaOTitulo) ? 'Nenhum useEffect muda o document.title.' : undefined)
          ?? `Com dois presentes, a aba diz "${String(ler(ctx, 'chamada', 't2') ?? '')}", e deveria dizer "${titulo(2)}".`;
      },
    },
    {
      id: 'salva',
      titulo: 'A chamada é salva cada vez que muda',
      passos: [
        'Num efeito, escreva no console: console.log(`Salvando a chamada: ${presentes.length} de ${MEMBROS.length}`).',
        'Ele roda depois de cada desenho em que a chamada mudou.',
      ],
      feita: ctx => rodou(ctx, ['chamada'])
        && salvamentos(ctx, 'chamada').filter(t => t === SALVA(1)).length === 1
        && salvamentos(ctx, 'chamada').filter(t => t === SALVA(2)).length === 1,
      motivo: ctx => motivoComum(ctx, ['chamada'])
        ?? (salvamentos(ctx, 'chamada').length === 0 ? `O console não mostra nenhum "${SALVA(0)}".` : `Marcando dois membros, o console mostra ${JSON.stringify(salvamentos(ctx, 'chamada'))}.`),
    },
    {
      id: 'so-quando-muda',
      titulo: 'E só quando ela muda — procurar alguém não salva nada',
      passos: [
        'Sem a lista de dependências, o efeito roda depois de **todo** desenho — e digitar na busca desenha de novo a cada letra.',
        'Diga do que o efeito depende: o segundo argumento do useEffect é [presentes].',
        'No modo de desenvolvimento o React monta tudo duas vezes, de propósito, e o primeiro salvamento aparece em dobro. É normal.',
      ],
      feita: ctx => {
        const s = salvamentos(ctx, 'busca');
        const k = s.indexOf(SALVA(1));
        return rodou(ctx, ['busca']) && k >= 0 && s.slice(k + 1).length === 0
          && igual(ler(ctx, 'busca', 'visiveis'), MEMBROS.filter(m => m.toLowerCase().includes('an')));
      },
      motivo: ctx => {
        const s = salvamentos(ctx, 'busca');
        const k = s.indexOf(SALVA(1));
        return motivoComum(ctx, ['busca'])
          ?? (k < 0 ? 'Primeiro a chamada precisa ser salva quando muda.' : `Digitar na busca salvou a chamada mais ${s.length - k - 1} vezes — o efeito roda a cada desenho.`);
      },
    },
  ],
};

/* ── Módulo 8 · Navegação entre telas ───────────────────────────────────── */

const unidadesCompletasEmTs = (us: Unidade[]) => `export interface Unidade {
  id: string;
  nome: string;
  lema: string;
  membros: number;
}

export const UNIDADES_DO_CLUBE: Unidade[] = [
${us.map(u => `  { id: '${u.id}', nome: '${u.nome}', lema: '${u.lema}', membros: ${u.membros} },`).join('\n')}
];
`;

export const UNIDADES_DO_CLUBE: Unidade[] = [
  IPE,
  JATOBA,
  { id: 'aroeira', nome: 'Aroeira', lema: 'Pequena e resistente', membros: 6 },
  { id: 'buriti', nome: 'Buriti', lema: 'Água boa nasce no cerrado', membros: 9 },
];
const UNIDADES_DO_CLUBE_NA_VARIANTE: Unidade[] = [
  { id: 'tucano', nome: 'Tucano', lema: 'Bico atento', membros: 7 },
  { id: 'arara', nome: 'Arara', lema: 'Cor que se vê de longe', membros: 10 },
  { id: 'onca', nome: 'Onça', lema: 'Passo firme no escuro', membros: 5 },
];

const ROTAS_APP = `import { Link, Route, Routes, useParams } from 'react-router-dom';
import { UNIDADES_DO_CLUBE } from './dados';

// A tela de início: a lista das unidades. Cada nome deveria levar à tela
// daquela unidade.
function ListaDeUnidades() {
  return (
    <section>
      <h2>Unidades</h2>
      <ul id="unidades">
        {UNIDADES_DO_CLUBE.map(u => <li key={u.id}>{u.nome}</li>)}
      </ul>
    </section>
  );
}

// A tela de uma unidade: o nome, o lema, os membros e um link de volta.
function DetalheDaUnidade() {
  return (
    <section>
      <h2>Uma unidade</h2>
    </section>
  );
}

export default function App() {
  return (
    <main>
      <h1>Clube Pioneiros</h1>
      <ListaDeUnidades />
    </main>
  );
}
`;

const LER_TELA = (prefixo: string): Passo[] => [
  { acao: 'ler', chave: `${prefixo}-h2`, seletor: 'h2', como: 'texto' },
  { acao: 'ler', chave: `${prefixo}-endereco`, seletor: 'body', como: 'endereco' },
];

const NAVEGACAO: DefinicaoDaLicaoDeReact = {
  projeto: 'unidades-do-clube',
  arquivos: projeto('Clube Pioneiros', `
#unidades a {
  color: #23402F;
  font-weight: bold;
}

.lema {
  font-style: italic;
}

.voltar {
  display: inline-block;
  margin-top: 12px;
  color: #1565C0;
}
`, { 'App.tsx': ROTAS_APP, 'dados.ts': unidadesCompletasEmTs(UNIDADES_DO_CLUBE) }, MAIN_COM_ROTAS),
  editaveis: ['App.tsx'],
  abre: 'App.tsx',
  cenarios: [
    {
      id: 'inicio',
      passos: [
        { acao: 'esperar' },
        { acao: 'ler', chave: 'nomes', seletor: '#unidades li', como: 'textos' },
        { acao: 'ler', chave: 'links', seletor: '#unidades li a', como: 'contagem' },
      ],
    },
    {
      id: 'link',
      passos: [
        { acao: 'esperar' },
        { acao: 'clicar', seletor: '#unidades li:nth-child(2) a' },
        { acao: 'esperar' },
        ...LER_TELA('detalhe'),
        { acao: 'ler', chave: 'lema', seletor: '.lema', como: 'texto' },
      ],
    },
    {
      id: 'direto',
      passos: [
        { acao: 'endereco', texto: '#/unidade/aroeira' },
        { acao: 'esperar' },
        ...LER_TELA('detalhe'),
        { acao: 'ler', chave: 'membros', seletor: '.membros', como: 'texto' },
      ],
    },
    {
      id: 'voltar',
      passos: [
        { acao: 'endereco', texto: '#/unidade/ipe' },
        { acao: 'esperar' },
        { acao: 'clicar', seletor: 'a.voltar' },
        { acao: 'esperar' },
        { acao: 'ler', chave: 'nomes', seletor: '#unidades li', como: 'textos' },
        { acao: 'ler', chave: 'endereco', seletor: 'body', como: 'endereco' },
      ],
    },
    {
      id: 'perdido',
      passos: [
        { acao: 'endereco', texto: '#/qualquer-coisa' },
        { acao: 'esperar' },
        ...LER_TELA('perdido'),
        { acao: 'endereco', texto: '#/unidade/nao-existe' },
        { acao: 'esperar' },
        ...LER_TELA('sem-unidade'),
      ],
    },
    {
      id: 'outra',
      dados: unidadesCompletasEmTs(UNIDADES_DO_CLUBE_NA_VARIANTE),
      passos: [
        { acao: 'esperar' },
        { acao: 'ler', chave: 'nomes', seletor: '#unidades li', como: 'textos' },
        { acao: 'clicar', seletor: '#unidades li:nth-child(3) a' },
        { acao: 'esperar' },
        ...LER_TELA('detalhe'),
      ],
    },
  ],
  metas: [
    {
      id: 'lista',
      titulo: 'A tela de início lista as unidades, com um link para cada',
      passos: [
        'No App, troque o <ListaDeUnidades /> solto por rotas: <Routes><Route path="/" element={<ListaDeUnidades />} /></Routes>.',
        'Em cada item da lista, o nome vira um link: <Link to={`/unidade/${u.id}`}>{u.nome}</Link>.',
        'O Link troca de tela sem recarregar a página.',
      ],
      feita: ctx => rodou(ctx, ['inicio', 'outra'])
        && igual(ler(ctx, 'inicio', 'nomes'), UNIDADES_DO_CLUBE.map(u => u.nome))
        && ler(ctx, 'inicio', 'links') === UNIDADES_DO_CLUBE.length
        && igual(ler(ctx, 'outra', 'nomes'), UNIDADES_DO_CLUBE_NA_VARIANTE.map(u => u.nome)),
      motivo: ctx => motivoComum(ctx, ['inicio', 'outra'])
        ?? (ler(ctx, 'inicio', 'links') !== UNIDADES_DO_CLUBE.length ? 'Os nomes da lista ainda não são links.' : 'A lista não mostra as unidades do dados.ts.'),
    },
    {
      id: 'detalhe',
      titulo: 'Cada unidade tem a sua tela, lida do endereço',
      passos: [
        'Acrescente a rota da unidade: <Route path="/unidade/:id" element={<DetalheDaUnidade />} />.',
        'No DetalheDaUnidade, leia o pedaço do endereço: const { id } = useParams(); e ache a unidade com UNIDADES_DO_CLUBE.find(u => u.id === id).',
        'Desenhe <h2>{unidade.nome}</h2>, <p className="lema">{unidade.lema}</p> e <p className="membros">{unidade.membros} membros</p>.',
        'Quem chega digitando o endereço tem de ver a mesma tela de quem clicou.',
      ],
      feita: ctx => rodou(ctx, ['link', 'direto', 'outra'])
        && ler(ctx, 'link', 'detalhe-endereco') === '#/unidade/jatoba' && ler(ctx, 'link', 'detalhe-h2') === 'Jatobá'
        && ler(ctx, 'link', 'lema') === JATOBA.lema
        && ler(ctx, 'direto', 'detalhe-h2') === 'Aroeira' && ler(ctx, 'direto', 'membros') === '6 membros'
        && ler(ctx, 'outra', 'detalhe-h2') === 'Onça' && ler(ctx, 'outra', 'detalhe-endereco') === '#/unidade/onca',
      motivo: ctx => motivoComum(ctx, ['link', 'direto', 'outra'])
        ?? (ler(ctx, 'link', 'detalhe-endereco') !== '#/unidade/jatoba' ? `Clicar na Jatobá levou ao endereço "${String(ler(ctx, 'link', 'detalhe-endereco') ?? '')}", e não a #/unidade/jatoba.` : undefined)
        ?? (ler(ctx, 'link', 'detalhe-h2') !== 'Jatobá' ? 'Na tela da Jatobá, o <h2> não diz Jatobá.' : undefined)
        ?? (ler(ctx, 'direto', 'detalhe-h2') !== 'Aroeira' ? 'Indo direto a #/unidade/aroeira, a tela não mostra a Aroeira — ela lê o endereço com useParams?' : undefined)
        ?? 'Com outras unidades no dados.ts, a tela da unidade não acompanhou.',
    },
    {
      id: 'voltar',
      titulo: 'Da tela da unidade, um link leva de volta ao início',
      passos: ['No DetalheDaUnidade, escreva <Link to="/" className="voltar">Voltar</Link>.'],
      feita: ctx => rodou(ctx, ['voltar'])
        && igual(ler(ctx, 'voltar', 'nomes'), UNIDADES_DO_CLUBE.map(u => u.nome)) && ler(ctx, 'voltar', 'endereco') === '#/',
      motivo: ctx => motivoComum(ctx, ['voltar']) ?? 'Na tela da Ipê, o link .voltar não levou de volta à lista.',
    },
    {
      id: 'perdido',
      titulo: 'Endereço que não existe tem resposta',
      passos: [
        'A última rota pega qualquer endereço que nenhuma outra pegou: <Route path="*" element={<h2>Página não encontrada</h2>} />.',
        'E uma unidade que não existe também: se o find não achar ninguém, o DetalheDaUnidade devolve <h2>Unidade não encontrada</h2>.',
        'O TypeScript já avisava: o find pode devolver undefined.',
      ],
      feita: ctx => rodou(ctx, ['perdido'])
        && ler(ctx, 'perdido', 'perdido-h2') === 'Página não encontrada' && ler(ctx, 'perdido', 'sem-unidade-h2') === 'Unidade não encontrada',
      motivo: ctx => motivoComum(ctx, ['perdido'])
        ?? (ler(ctx, 'perdido', 'perdido-h2') !== 'Página não encontrada' ? 'Em #/qualquer-coisa, o <h2> não diz Página não encontrada.' : 'Em #/unidade/nao-existe, o <h2> não diz Unidade não encontrada.'),
    },
  ],
};

/* ── Módulo 9 · Os três estados de uma API ──────────────────────────────── */

const anoEmTs = (ano: number) => `// O ano dos feriados que a página mostra.
export const ANO = ${ano};
`;

const API_APP = `import { useEffect, useState } from 'react';
import { ANO } from './dados';

interface Feriado {
  date: string;
  name: string;
  type: string;
}

// A resposta chega — olhe o console. Mas a tela continua vazia, não diz
// que está esperando, e sem internet não diz nada.
export default function App() {
  const [feriados, setFeriados] = useState<Feriado[]>([]);

  useEffect(() => {
    fetch(\`https://brasilapi.com.br/api/feriados/v1/\${ANO}\`)
      .then(resposta => resposta.json())
      .then(dados => console.log(dados));
  }, []);

  return (
    <main>
      <h1>Feriados de {ANO}</h1>
      <ul id="feriados">
        {feriados.map(f => (
          <li key={f.date}>
            {f.date.split('-').reverse().join('/')} — {f.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
`;

const LER_FERIADOS = (sufixo: string): Passo[] => [
  { acao: 'ler', chave: `quantos${sufixo}`, seletor: '#feriados li', como: 'contagem' },
  { acao: 'ler', chave: `carregando${sufixo}`, seletor: '.carregando', como: 'existe' },
  { acao: 'ler', chave: `erro${sufixo}`, seletor: '.erro', como: 'existe' },
];

const requisicoes = (ctx: ContextoDoReact, cenario: string) => ctx.cenarios?.[cenario]?.requisicoes.length ?? 0;

const API: DefinicaoDaLicaoDeReact = {
  projeto: 'feriados-do-ano',
  arquivos: projeto('Feriados', `
.carregando {
  color: #5B6B61;
}

.erro {
  background-color: #FBE9E7;
  border: 1px solid #9A3B2F;
  border-radius: 6px;
  padding: 8px 12px;
}

.erro button {
  margin-left: 8px;
}
`, { 'App.tsx': API_APP, 'dados.ts': anoEmTs(2026) }),
  editaveis: ['App.tsx'],
  abre: 'App.tsx',
  cenarios: [
    { id: 'normal', passos: [...LER_FERIADOS('Antes'), { acao: 'esperar' }, ...LER_FERIADOS('')] },
    { id: 'outro', dados: anoEmTs(2025), passos: [{ acao: 'esperar' }, ...LER_FERIADOS('')] },
    { id: 'sem-rede', offline: true, passos: [{ acao: 'esperar' }, ...LER_FERIADOS('')] },
    { id: 'fora', dados: anoEmTs(1850), passos: [{ acao: 'esperar' }, ...LER_FERIADOS('')] },
    {
      id: 'de-novo',
      offline: true,
      passos: [
        { acao: 'esperar' },
        { acao: 'rede', online: true },
        { acao: 'clicar', seletor: '.erro button' },
        { acao: 'esperar' },
        ...LER_FERIADOS(''),
      ],
    },
  ],
  metas: [
    {
      id: 'carregando',
      titulo: 'Enquanto a resposta não chega, a página diz que está carregando',
      passos: [
        'Guarde no estado se está carregando: const [carregando, setCarregando] = useState(true).',
        'Desenhe {carregando && <p className="carregando">Carregando…</p>}.',
        'Quando a resposta chegar — boa ou ruim —, setCarregando(false).',
      ],
      feita: ctx => rodou(ctx, ['normal']) && ler(ctx, 'normal', 'carregandoAntes') === true && ler(ctx, 'normal', 'carregando') === false,
      motivo: ctx => motivoComum(ctx, ['normal'])
        ?? (ler(ctx, 'normal', 'carregandoAntes') !== true ? 'Logo que a página abre, não há nenhum .carregando.' : 'Depois que a resposta chegou, o .carregando continua lá.'),
    },
    {
      id: 'sucesso',
      titulo: 'Quando chega, os feriados do ano aparecem na lista',
      passos: [
        'No lugar do console.log, guarde a resposta: .then(dados => setFeriados(dados)).',
        'A lista já sabe desenhar cada feriado.',
      ],
      feita: ctx => rodou(ctx, ['normal', 'outro'])
        && ler(ctx, 'normal', 'quantos') === feriadosDoAno(2026).length && ler(ctx, 'outro', 'quantos') === feriadosDoAno(2025).length,
      motivo: ctx => motivoComum(ctx, ['normal', 'outro'])
        ?? `A lista tem ${String(ler(ctx, 'normal', 'quantos') ?? 0)} feriados, e a BrasilAPI devolveu ${feriadosDoAno(2026).length}.`,
    },
    {
      id: 'erro',
      titulo: 'Sem rede, ou com o pedido recusado, a falha aparece na página',
      passos: [
        'Guarde o erro no estado e desenhe {erro && <p className="erro">{erro}</p>}.',
        'Sem internet o fetch rejeita: um .catch(() => setErro(\'Não deu para buscar os feriados.\')) trata isso — e o console para de dizer Uncaught (in promise).',
        'Com o ano fora do que a API conhece, o fetch não rejeita: a resposta chega com status 404. Confira resposta.ok antes do .json(), e lance um erro se não estiver ok.',
      ],
      feita: ctx => rodou(ctx, ['sem-rede', 'fora', 'normal'])
        && ler(ctx, 'sem-rede', 'erro') === true && ler(ctx, 'sem-rede', 'quantos') === 0 && ler(ctx, 'sem-rede', 'carregando') === false
        && ler(ctx, 'fora', 'erro') === true && ler(ctx, 'fora', 'carregando') === false
        && ler(ctx, 'normal', 'erro') === false,
      motivo: ctx => motivoComum(ctx, ['sem-rede', 'fora', 'normal'])
        ?? (ler(ctx, 'sem-rede', 'erro') !== true ? 'Sem rede, a página não mostra nenhum .erro.' : undefined)
        ?? (ler(ctx, 'sem-rede', 'carregando') !== false ? 'Sem rede, o Carregando… fica na tela para sempre.' : undefined)
        ?? (ler(ctx, 'fora', 'erro') !== true ? 'Com o ano 1850 a API responde 404, e a página não mostra o erro — o resposta.ok não é conferido.' : 'Quando tudo dá certo, o .erro aparece mesmo assim.'),
    },
    {
      id: 'de-novo',
      titulo: 'Tentar de novo, quando a rede volta',
      passos: [
        'Leve o fetch para uma função buscar(), que liga o carregando e apaga o erro antes de pedir.',
        'O efeito chama buscar() — e só ao montar: a lista de dependências é [].',
        'No .erro, um botão: <button onClick={buscar}>Tentar de novo</button>.',
      ],
      feita: ctx => rodou(ctx, ['de-novo', 'normal'])
        && ler(ctx, 'de-novo', 'quantos') === feriadosDoAno(2026).length && ler(ctx, 'de-novo', 'erro') === false
        && requisicoes(ctx, 'normal') <= 2,
      motivo: ctx => motivoComum(ctx, ['de-novo', 'normal'])
        ?? (requisicoes(ctx, 'normal') > 2 ? `A página pediu os feriados ${requisicoes(ctx, 'normal')} vezes — o efeito roda a cada desenho. A lista de dependências é [].` : undefined)
        ?? 'Com a rede de volta, clicar no botão do .erro não trouxe os feriados.',
    },
  ],
};

export const LICOES_DA_CC_FE006: Record<LicaoDaCcFe006, DefinicaoDaLicaoDeReact> = {
  declarar: DECLARAR,
  propriedades: PROPRIEDADES,
  reaproveitar: REAPROVEITAR,
  estado: ESTADO,
  listas: LISTAS,
  formulario: FORMULARIO,
  efeito: EFEITO,
  navegacao: NAVEGACAO,
  api: API,
};
