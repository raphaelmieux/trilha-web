import { feriadosDoAno } from './brasilApiGuardada';
import type { Passo } from './paginaViva';
import {
  analise, comAviso, componente, igual, ler, motivoComum, motivoDosProblemas, rodou, semProblemas, AVISO_DE_CHAVE,
  type ContextoDoReact, type DefinicaoDaLicaoDeReact,
} from './metasDaCcFe006';
import {
  AGENDA_COM_API, AGENDA_COM_COMPONENTES, AGENDA_COM_TELAS, AGENDA_NO_COMECO, COMPONENTE_EM_BRANCO,
  EVENTOS_DA_AGENDA, EVENTOS_NA_VARIANTE, dadosDaAgenda,
} from './agendaDoClube';
import { colunasDoGrid, regrasDoCss, valorNaLargura } from './cssSimples';

/**
 * Os quatro laboratórios de React da CC-FE007: as telas, os componentes, a
 * API e o celular da agenda do clube.
 *
 * São o mesmo laboratório da CC-FE006 — o projeto do Vite, a página viva, as
 * tarefas que rodam a página —, e por isso são lições do mesmo tipo, num
 * registro que soma os dois (`licoesDeReact.ts`). O que muda é que aqui a
 * aplicação é uma só, e cada lição parte de onde a anterior chegou
 * (`agendaDoClube.ts`).
 */

export type LicaoReactDaCcFe007 = 'agenda-telas' | 'agenda-componentes' | 'agenda-api' | 'agenda-responsivo';

const OUTRA_AGENDA = dadosDaAgenda(EVENTOS_NA_VARIANTE, 2025);
const TITULOS = EVENTOS_DA_AGENDA.map(e => e.titulo);
const TITULOS_NA_VARIANTE = EVENTOS_NA_VARIANTE.map(e => e.titulo);

/* ── As leituras das três telas, que as duas primeiras lições conferem ─── */

const LER_INICIO: Passo[] = [
  { acao: 'esperar' },
  { acao: 'ler', chave: 'cartoes', seletor: '.cartao h3', como: 'textos' },
  { acao: 'ler', chave: 'links', seletor: '.cartao h3 a', como: 'contagem' },
  { acao: 'ler', chave: 'menu', seletor: '.cabecalho nav a', como: 'textos' },
];

const CENARIOS_DAS_TELAS = [
  { id: 'inicio', passos: LER_INICIO },
  {
    id: 'evento',
    passos: [
      { acao: 'esperar' },
      { acao: 'clicar', seletor: '.cartao:nth-child(2) h3 a' },
      { acao: 'esperar' },
      { acao: 'ler', chave: 'endereco', seletor: 'body', como: 'endereco' },
      { acao: 'ler', chave: 'titulo', seletor: 'h2', como: 'texto' },
      { acao: 'ler', chave: 'descricao', seletor: '.descricao', como: 'texto' },
    ] as Passo[],
  },
  {
    id: 'direto',
    passos: [
      { acao: 'endereco', texto: '#/evento/investidura' },
      { acao: 'esperar' },
      { acao: 'ler', chave: 'titulo', seletor: 'h2', como: 'texto' },
      { acao: 'ler', chave: 'outros', seletor: '.cartao h3', como: 'textos' },
      { acao: 'clicar', seletor: 'a.voltar' },
      { acao: 'esperar' },
      { acao: 'ler', chave: 'voltou', seletor: '.cartao h3', como: 'textos' },
    ] as Passo[],
  },
  {
    id: 'feriados',
    passos: [
      { acao: 'esperar' },
      { acao: 'clicar', seletor: '.cabecalho nav a:nth-child(2)' },
      { acao: 'esperar' },
      { acao: 'ler', chave: 'endereco', seletor: 'body', como: 'endereco' },
      { acao: 'ler', chave: 'titulo', seletor: 'h2', como: 'texto' },
    ] as Passo[],
  },
  {
    id: 'perdido',
    passos: [
      { acao: 'endereco', texto: '#/qualquer-coisa' },
      { acao: 'esperar' },
      { acao: 'ler', chave: 'pagina', seletor: '.erro', como: 'texto' },
      { acao: 'endereco', texto: '#/evento/nao-existe' },
      { acao: 'esperar' },
      { acao: 'ler', chave: 'evento', seletor: '.erro', como: 'texto' },
    ] as Passo[],
  },
  {
    id: 'outra',
    dados: OUTRA_AGENDA,
    passos: [
      ...LER_INICIO,
      { acao: 'clicar', seletor: '.cartao:nth-child(1) h3 a' },
      { acao: 'esperar' },
      { acao: 'ler', chave: 'titulo', seletor: 'h2', como: 'texto' },
      { acao: 'endereco', texto: '#/feriados' },
      { acao: 'esperar' },
      { acao: 'ler', chave: 'feriados', seletor: 'h2', como: 'texto' },
    ] as Passo[],
  },
];

const TODOS = CENARIOS_DAS_TELAS.map(c => c.id);

const inicioCerto = (ctx: ContextoDoReact) =>
  igual(ler(ctx, 'inicio', 'cartoes'), TITULOS) && ler(ctx, 'inicio', 'links') === TITULOS.length
  && igual(ler(ctx, 'outra', 'cartoes'), TITULOS_NA_VARIANTE) && ler(ctx, 'outra', 'links') === TITULOS_NA_VARIANTE.length;

const eventoCerto = (ctx: ContextoDoReact) =>
  ler(ctx, 'evento', 'endereco') === '#/evento/campori' && ler(ctx, 'evento', 'titulo') === 'Campori regional'
  && ler(ctx, 'evento', 'descricao') === EVENTOS_DA_AGENDA[1].descricao
  && ler(ctx, 'direto', 'titulo') === 'Investidura'
  && igual(ler(ctx, 'direto', 'outros'), TITULOS.filter(t => t !== 'Investidura'))
  && igual(ler(ctx, 'direto', 'voltou'), TITULOS)
  && ler(ctx, 'outra', 'titulo') === TITULOS_NA_VARIANTE[0];

const feriadosCerto = (ctx: ContextoDoReact) =>
  igual(ler(ctx, 'inicio', 'menu'), ['Eventos', 'Feriados'])
  && ler(ctx, 'feriados', 'endereco') === '#/feriados' && ler(ctx, 'feriados', 'titulo') === 'Feriados de 2026'
  && ler(ctx, 'outra', 'feriados') === 'Feriados de 2025';

const perdidoCerto = (ctx: ContextoDoReact) =>
  ler(ctx, 'perdido', 'pagina') === 'Página não encontrada.' && ler(ctx, 'perdido', 'evento') === 'Evento não encontrado.';

/* ── As contas de componente: todos os arquivos juntos ─────────────────── */

const fontesDoProjeto = (ctx: ContextoDoReact) => Object.keys(ctx.analise ?? {}).filter(n => n.endsWith('.tsx'));

/** Quantas vezes o componente aparece no JSX do projeto inteiro. */
export const usosNoProjeto = (ctx: ContextoDoReact, nome: string) =>
  fontesDoProjeto(ctx).reduce((s, n) => s + (analise(ctx, n)?.usosDeComponente[nome] ?? 0), 0);

/** O elemento do HTML escrito fora do arquivo do componente que existe para ele. */
const elementoForaDe = (ctx: ContextoDoReact, elemento: string, dono: string) =>
  fontesDoProjeto(ctx).filter(n => n !== dono).reduce((s, n) => s + (analise(ctx, n)?.usosDeElemento[elemento] ?? 0), 0);

/** `any` escrito no código de quem estuda — o compilador estrito aceita, e o tipo deixa de conferir. */
export const anyNoProjeto = (ctx: ContextoDoReact) => fontesDoProjeto(ctx)
  .some(n => /(:\s*any\b|\bas\s+any\b|<any>|any\[\])/.test((ctx.arquivos[n] ?? '').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')));

export const COMPONENTES_REUSADOS = [
  { nome: 'Secao', arquivo: 'Secao.tsx', elemento: 'section', oQue: 'a caixa de cada tela, com o título dela' },
  { nome: 'CartaoDeEvento', arquivo: 'CartaoDeEvento.tsx', elemento: 'article', oQue: 'o cartão de um evento, com o link para a tela dele' },
  { nome: 'MensagemDeErro', arquivo: 'MensagemDeErro.tsx', elemento: null, oQue: 'a mensagem de erro que aparece na tela' },
] as const;

/* ── Módulo 2 · As três telas ────────────────────────────────────────────── */

const TELAS: DefinicaoDaLicaoDeReact = {
  projeto: 'agenda-do-clube',
  arquivos: AGENDA_NO_COMECO,
  editaveis: ['App.tsx', 'Inicio.tsx', 'Evento.tsx', 'Feriados.tsx'],
  abre: 'App.tsx',
  cenarios: CENARIOS_DAS_TELAS,
  metas: [
    {
      id: 'inicio-com-links',
      titulo: 'A tela de início, com um link para cada evento',
      passos: [
        'Leve a lista do App para o Inicio.tsx, e no título de cada cartão ponha um link: <Link to={`/evento/${e.id}`}>{e.titulo}</Link>.',
        'No App, a tela de início entra numa rota: <Routes><Route path="/" element={<Inicio />} /></Routes>.',
      ],
      feita: ctx => rodou(ctx, ['inicio', 'outra']) && inicioCerto(ctx),
      motivo: ctx => motivoComum(ctx, ['inicio', 'outra'])
        ?? (ler(ctx, 'inicio', 'links') !== TITULOS.length ? 'Os títulos dos cartões ainda não são links.' : 'Com outra agenda no dados.ts, a lista não acompanhou.'),
    },
    {
      id: 'tela-do-evento',
      titulo: 'Cada evento tem a sua tela, lida do endereço',
      passos: [
        'Rota nova no App: <Route path="/evento/:id" element={<Evento />} />.',
        'No Evento.tsx, ache o evento com useParams e EVENTOS.find, e desenhe o título num <h2>, a data e o local, e a descrição num <p className="descricao">.',
        'Embaixo, os outros eventos em cartões, e um <Link to="/" className="voltar">Voltar</Link>.',
      ],
      feita: ctx => rodou(ctx, ['evento', 'direto', 'outra']) && eventoCerto(ctx),
      motivo: ctx => motivoComum(ctx, ['evento', 'direto', 'outra'])
        ?? (ler(ctx, 'evento', 'endereco') !== '#/evento/campori' ? `Clicar no Campori levou a "${String(ler(ctx, 'evento', 'endereco') ?? '')}", e não a #/evento/campori.` : undefined)
        ?? (ler(ctx, 'direto', 'titulo') !== 'Investidura' ? 'Abrindo #/evento/investidura direto, a tela não mostra a Investidura.' : undefined)
        ?? (!igual(ler(ctx, 'direto', 'voltou'), TITULOS) ? 'O link .voltar não levou de volta à lista.' : 'A tela do evento não mostra o título, a descrição ou os outros eventos.'),
    },
    {
      id: 'feriados-e-menu',
      titulo: 'A tela dos feriados, e um menu que leva às telas',
      passos: [
        'Rota nova: <Route path="/feriados" element={<Feriados />} />, e no Feriados.tsx um <h2>Feriados de {ANO}</h2>.',
        'No cabeçalho, um <nav> com dois links: <NavLink to="/">Eventos</NavLink> e <NavLink to="/feriados">Feriados</NavLink>.',
        'O NavLink é o Link que sabe quando está na tela dele — a folha pinta o da tela atual.',
      ],
      feita: ctx => rodou(ctx, ['inicio', 'feriados', 'outra']) && feriadosCerto(ctx),
      motivo: ctx => motivoComum(ctx, ['inicio', 'feriados', 'outra'])
        ?? (!igual(ler(ctx, 'inicio', 'menu'), ['Eventos', 'Feriados']) ? 'O cabeçalho não tem os dois links, Eventos e Feriados, num <nav>.' : 'O segundo link do menu não leva à tela Feriados de 2026.'),
    },
    {
      id: 'endereco-perdido',
      titulo: 'Endereço que não existe, e evento que não existe, têm resposta',
      passos: [
        'A última rota: <Route path="*" element={<p className="erro">Página não encontrada.</p>} />.',
        'No Evento.tsx, quando o find não achar: return <p className="erro">Evento não encontrado.</p>.',
      ],
      feita: ctx => rodou(ctx, ['perdido']) && perdidoCerto(ctx),
      motivo: ctx => motivoComum(ctx, ['perdido'])
        ?? (ler(ctx, 'perdido', 'pagina') !== 'Página não encontrada.' ? 'Em #/qualquer-coisa, nenhum .erro diz Página não encontrada.' : 'Em #/evento/nao-existe, nenhum .erro diz Evento não encontrado.'),
    },
  ],
};

/* ── Módulo 3 · Três componentes, cada um usado mais de uma vez ─────────── */

const COMPONENTES: DefinicaoDaLicaoDeReact = {
  projeto: 'agenda-do-clube',
  arquivos: {
    ...AGENDA_COM_TELAS,
    'Secao.tsx': COMPONENTE_EM_BRANCO('Secao', 'A caixa de cada tela: recebe o titulo e os children, e desenha <section className="secao"><h2>{titulo}</h2>{children}</section>.'),
    'CartaoDeEvento.tsx': COMPONENTE_EM_BRANCO('CartaoDeEvento', 'O cartão de um evento: recebe o evento, e desenha o <article className="cartao"> que hoje está escrito duas vezes.'),
    'MensagemDeErro.tsx': COMPONENTE_EM_BRANCO('MensagemDeErro', 'A mensagem de erro: recebe o texto, e desenha <p className="erro" role="alert">{texto}</p>.'),
  },
  editaveis: ['App.tsx', 'Inicio.tsx', 'Evento.tsx', 'Feriados.tsx', 'Secao.tsx', 'CartaoDeEvento.tsx', 'MensagemDeErro.tsx'],
  abre: 'CartaoDeEvento.tsx',
  cenarios: CENARIOS_DAS_TELAS,
  metas: [
    {
      id: 'tres-componentes',
      titulo: 'Três componentes, com as propriedades tipadas e sem any',
      passos: [
        'Escreva os três: Secao, CartaoDeEvento e MensagemDeErro, cada um no seu arquivo.',
        'Cada um declara as propriedades numa interface — o evento é do tipo Evento, que o dados.ts exporta.',
        'Nenhum any: com ele o compilador para de conferir, e o painel de Problemas fica vazio sem estar certo.',
      ],
      feita: ctx => COMPONENTES_REUSADOS.every(c => {
        const k = componente(ctx, c.arquivo, c.nome);
        return !!k && k.parametros >= 1 && k.propriedadesTipadas;
      }) && semProblemas(ctx) && !anyNoProjeto(ctx),
      motivo: ctx => {
        for (const c of COMPONENTES_REUSADOS) {
          const k = componente(ctx, c.arquivo, c.nome);
          if (!k || k.parametros === 0) return `O ${c.nome} ainda não recebe propriedade nenhuma.`;
          if (!k.propriedadesTipadas) return `As propriedades do ${c.nome} chegam sem tipo.`;
        }
        if (anyNoProjeto(ctx)) return 'Há um any escrito no projeto. Troque pelo tipo de verdade.';
        return motivoDosProblemas(ctx);
      },
    },
    {
      id: 'reusados',
      titulo: 'Cada um usado em mais de um lugar, e nada escrito duas vezes',
      passos: [
        'A Secao vira a caixa das três telas: <Secao titulo="Próximos eventos">…</Secao>.',
        'O CartaoDeEvento desenha os cartões do início e os outros eventos da tela de um evento.',
        'A MensagemDeErro mostra o "Página não encontrada." do App e o "Evento não encontrado." do Evento.',
        'Fora do arquivo de cada um, não sobra nenhum <section> nem <article> escrito à mão.',
      ],
      feita: ctx => COMPONENTES_REUSADOS.every(c => usosNoProjeto(ctx, c.nome) >= 2
        && (c.elemento === null || elementoForaDe(ctx, c.elemento, c.arquivo) === 0)),
      motivo: ctx => {
        for (const c of COMPONENTES_REUSADOS) {
          const n = usosNoProjeto(ctx, c.nome);
          if (n < 2) return `O ${c.nome} aparece ${n === 0 ? 'em lugar nenhum' : 'num lugar só'} — reaproveitar é usar em mais de um.`;
          if (c.elemento && elementoForaDe(ctx, c.elemento, c.arquivo) > 0) return `Ainda há <${c.elemento}> escrito à mão fora do ${c.arquivo}.`;
        }
        return undefined;
      },
    },
    {
      id: 'mesmas-telas',
      titulo: 'E as telas continuam mostrando o mesmo',
      passos: [
        'Trocar o que está escrito por um componente não muda a tela: os mesmos cartões, os mesmos links, as mesmas mensagens.',
        'Clique em Conferir: as três telas são rodadas de novo.',
      ],
      feita: ctx => rodou(ctx, TODOS) && inicioCerto(ctx) && eventoCerto(ctx) && feriadosCerto(ctx) && perdidoCerto(ctx)
        && COMPONENTES_REUSADOS.every(c => usosNoProjeto(ctx, c.nome) >= 2),
      motivo: ctx => motivoComum(ctx, TODOS)
        ?? (!COMPONENTES_REUSADOS.every(c => usosNoProjeto(ctx, c.nome) >= 2) ? 'Primeiro os três componentes precisam estar em uso.' : undefined)
        ?? (!inicioCerto(ctx) ? 'A tela de início mudou: os cartões ou os links não são mais os mesmos.'
          : !eventoCerto(ctx) ? 'A tela do evento mudou: confira o título, a descrição, os outros eventos e o Voltar.'
            : !feriadosCerto(ctx) ? 'A tela dos feriados ou o menu mudaram.' : 'As mensagens de erro mudaram de texto.'),
    },
  ],
};

/* ── Módulo 4 · A API, com o erro à vista ───────────────────────────────── */

const LER_FERIADOS = (sufixo: string): Passo[] => [
  { acao: 'ler', chave: `quantos${sufixo}`, seletor: '.feriados li', como: 'contagem' },
  { acao: 'ler', chave: `carregando${sufixo}`, seletor: '.carregando', como: 'existe' },
  { acao: 'ler', chave: `erro${sufixo}`, seletor: '.erro', como: 'existe' },
];
const IR_AOS_FERIADOS: Passo[] = [{ acao: 'endereco', texto: '#/feriados' }, { acao: 'pausa', ms: 40 }];
const ANO_FORA = dadosDaAgenda(EVENTOS_DA_AGENDA, 1850);

const API: DefinicaoDaLicaoDeReact = {
  projeto: 'agenda-do-clube',
  arquivos: AGENDA_COM_COMPONENTES,
  editaveis: ['App.tsx', 'Inicio.tsx', 'Evento.tsx', 'Feriados.tsx', 'Secao.tsx', 'CartaoDeEvento.tsx', 'MensagemDeErro.tsx'],
  abre: 'Feriados.tsx',
  cenarios: [
    { id: 'normal', passos: [...IR_AOS_FERIADOS, ...LER_FERIADOS('Antes'), { acao: 'esperar' }, ...LER_FERIADOS('')] },
    { id: 'outro', dados: OUTRA_AGENDA, passos: [...IR_AOS_FERIADOS, { acao: 'esperar' }, ...LER_FERIADOS('')] },
    { id: 'sem-rede', offline: true, passos: [...IR_AOS_FERIADOS, { acao: 'esperar' }, ...LER_FERIADOS(''), { acao: 'ler', chave: 'alerta', seletor: '[role="alert"]', como: 'existe' }] },
    { id: 'fora', dados: ANO_FORA, passos: [...IR_AOS_FERIADOS, { acao: 'esperar' }, ...LER_FERIADOS('')] },
    {
      id: 'de-novo',
      offline: true,
      passos: [
        ...IR_AOS_FERIADOS,
        { acao: 'esperar' },
        { acao: 'rede', online: true },
        { acao: 'clicar', seletor: '.erro button' },
        { acao: 'esperar' },
        ...LER_FERIADOS(''),
      ],
    },
    { id: 'inicio', passos: LER_INICIO },
  ],
  metas: [
    {
      id: 'carregando-e-lista',
      titulo: 'Os feriados chegam da API, com o Carregando enquanto esperam',
      passos: [
        'No Feriados.tsx, três estados: os feriados, o carregando e o erro.',
        'Num useEffect com a lista vazia, busque https://brasilapi.com.br/api/feriados/v1/ e o ANO, e guarde a resposta.',
        'Desenhe {carregando && <p className="carregando">Carregando…</p>} e a lista num <ul className="feriados">.',
      ],
      feita: ctx => rodou(ctx, ['normal', 'outro'])
        && ler(ctx, 'normal', 'carregandoAntes') === true && ler(ctx, 'normal', 'carregando') === false
        && ler(ctx, 'normal', 'quantos') === feriadosDoAno(2026).length && ler(ctx, 'outro', 'quantos') === feriadosDoAno(2025).length,
      motivo: ctx => motivoComum(ctx, ['normal', 'outro'])
        ?? (ler(ctx, 'normal', 'carregandoAntes') !== true ? 'Logo que a tela abre, não há nenhum .carregando.' : undefined)
        ?? (ler(ctx, 'normal', 'quantos') !== feriadosDoAno(2026).length ? `A lista .feriados tem ${String(ler(ctx, 'normal', 'quantos') ?? 0)} itens, e a API devolveu ${feriadosDoAno(2026).length}.` : 'Com o ano 2025 no dados.ts, a lista não acompanhou.'),
    },
    {
      id: 'erro-visivel',
      titulo: 'Quando falha, o erro aparece na tela — pela MensagemDeErro',
      passos: [
        'Sem rede o fetch rejeita: um .catch guarda a mensagem no estado do erro.',
        'Com o ano fora do que a API conhece, a resposta chega com status 404: confira resposta.ok e lance um erro.',
        'Mostre o erro com o componente que já existe: {erro && <MensagemDeErro texto={erro} />}.',
      ],
      feita: ctx => rodou(ctx, ['sem-rede', 'fora', 'normal'])
        && ler(ctx, 'sem-rede', 'erro') === true && ler(ctx, 'sem-rede', 'alerta') === true && ler(ctx, 'sem-rede', 'carregando') === false
        && ler(ctx, 'fora', 'erro') === true && ler(ctx, 'normal', 'erro') === false
        && (analise(ctx, 'Feriados.tsx')?.usosDeComponente.MensagemDeErro ?? 0) >= 1,
      motivo: ctx => motivoComum(ctx, ['sem-rede', 'fora', 'normal'])
        ?? (ler(ctx, 'sem-rede', 'erro') !== true ? 'Sem rede, a tela dos feriados não mostra nenhum .erro.' : undefined)
        ?? (ler(ctx, 'fora', 'erro') !== true ? 'Com o ano 1850 a API responde 404, e a tela não mostra o erro — o resposta.ok não é conferido.' : undefined)
        ?? ((analise(ctx, 'Feriados.tsx')?.usosDeComponente.MensagemDeErro ?? 0) < 1 ? 'O erro aparece, mas escrito à mão: use a MensagemDeErro, que já mostra os outros erros da agenda.' : 'Sem rede, o Carregando… fica na tela ao lado do erro.'),
    },
    {
      id: 'tentar-de-novo',
      titulo: 'E dá para tentar de novo quando a rede volta',
      passos: [
        'Leve o fetch para uma função buscar(), chamada pelo efeito.',
        'A MensagemDeErro ganha uma propriedade opcional, aoTentarDeNovo, e desenha o botão só quando ela vier.',
        'Passe a buscar: <MensagemDeErro texto={erro} aoTentarDeNovo={buscar} />.',
      ],
      feita: ctx => rodou(ctx, ['de-novo', 'inicio', 'normal'])
        && ler(ctx, 'de-novo', 'quantos') === feriadosDoAno(2026).length && ler(ctx, 'de-novo', 'erro') === false
        && (ctx.cenarios?.normal?.requisicoes.length ?? 99) <= 2
        && igual(ler(ctx, 'inicio', 'cartoes'), TITULOS) && !comAviso(ctx, ['inicio', 'normal'], AVISO_DE_CHAVE),
      motivo: ctx => motivoComum(ctx, ['de-novo', 'inicio', 'normal'])
        ?? ((ctx.cenarios?.normal?.requisicoes.length ?? 0) > 2 ? 'A tela pediu os feriados mais de duas vezes — o efeito precisa da lista de dependências vazia.' : undefined)
        ?? (!igual(ler(ctx, 'inicio', 'cartoes'), TITULOS) ? 'A tela de início deixou de mostrar os eventos.' : 'Com a rede de volta, o botão do .erro não trouxe os feriados.'),
    },
  ],
};

/* ── Módulo 5 · O celular ───────────────────────────────────────────────── */

/** A largura de um celular comum, e a de um computador. */
export const LARGURA_DO_CELULAR = 375;
export const LARGURA_DO_COMPUTADOR = 1280;

export const temViewport = (html: string) => {
  const m = /<meta\b[^>]*name\s*=\s*["']viewport["'][^>]*>/i.exec(html);
  return !!m && /width\s*=\s*device-width/i.test(m[0]);
};

/** As larguras fixas maiores que um celular, fora de qualquer `@media`: é o que faz a página passar da tela. */
export function largurasFixas(css: string): string[] {
  return regrasDoCss(css).filter(r => r.midia === null).flatMap(r => ['width', 'min-width']
    .filter(p => {
      const m = /^(\d+(?:\.\d+)?)px$/.exec(r.propriedades[p] ?? '');
      return !!m && Number(m[1]) > LARGURA_DO_CELULAR;
    })
    .map(p => `${r.seletores.join(', ')} { ${p}: ${r.propriedades[p]} }`));
}

/**
 * Quantas colunas a lista faz numa largura. `auto-fit` com um mínimo largo
 * se ajusta sozinho, e no celular cabe um cartão por linha — é resposta tão
 * certa quanto o `@media`, e a lição diz isso.
 */
export function colunasDaLista(css: string, largura: number): number {
  const regras = regrasDoCss(css);
  const valor = valorNaLargura(regras, largura, '.lista', 'grid-template-columns');
  const display = valorNaLargura(regras, largura, '.lista', 'display');
  if (display && display !== 'grid') return display === 'flex' ? 0 : 1;
  const n = colunasDoGrid(valor);
  if (n === 0) {
    const minimo = /minmax\(\s*(\d+)px/i.exec(valor ?? '');
    return minimo ? Math.max(1, Math.floor((largura - 40) / Number(minimo[1]))) : 0;
  }
  return n;
}

export const menuQueCabe = (css: string, largura: number) => {
  const regras = regrasDoCss(css);
  const direcao = valorNaLargura(regras, largura, '.cabecalho', 'flex-direction');
  const quebra = valorNaLargura(regras, largura, '.cabecalho', 'flex-wrap');
  return direcao === 'column' || quebra === 'wrap';
};

const RESPONSIVO: DefinicaoDaLicaoDeReact = {
  projeto: 'agenda-do-clube',
  arquivos: AGENDA_COM_API,
  editaveis: ['index.html', 'estilo.css'],
  abre: 'estilo.css',
  cenarios: [{ id: 'pagina', passos: [{ acao: 'esperar' }, { acao: 'ler', chave: 'cartoes', seletor: '.cartao', como: 'contagem' }] }],
  metas: [
    {
      id: 'viewport',
      titulo: 'O celular sabe a largura dele',
      passos: [
        'Sem a etiqueta de viewport, o navegador do celular finge ter 980 pontos de largura e encolhe a página inteira: tudo fica minúsculo.',
        'No <head> do index.html: <meta name="viewport" content="width=device-width, initial-scale=1.0" />.',
      ],
      feita: ctx => temViewport(ctx.arquivos['index.html'] ?? '') && rodou(ctx, ['pagina']) && ler(ctx, 'pagina', 'cartoes') === 4,
      motivo: ctx => (!temViewport(ctx.arquivos['index.html'] ?? '') ? 'O index.html não tem a <meta name="viewport"> com width=device-width.' : motivoComum(ctx, ['pagina']) ?? 'A página parou de mostrar os quatro cartões.'),
    },
    {
      id: 'largura-que-cabe',
      titulo: 'Nenhuma largura fixa maior que a tela',
      passos: [
        'O main tem width: 960px — num celular de 375, a página passa da tela e aparece a barra de rolagem de lado.',
        'Troque por max-width: 960px: até 960 no computador, e a largura da tela onde ela for menor.',
      ],
      feita: ctx => largurasFixas(ctx.arquivos['estilo.css'] ?? '').length === 0,
      motivo: ctx => `Ainda há largura fixa maior que um celular: ${largurasFixas(ctx.arquivos['estilo.css'] ?? '')[0]}.`,
    },
    {
      id: 'uma-coluna',
      titulo: 'No celular, um cartão por linha; no computador, três',
      passos: [
        'Três colunas numa tela de 375 pontos dão cartões de cem pontos, onde o título não cabe.',
        'No fim da folha: @media (max-width: 700px) { .lista { grid-template-columns: 1fr; } }.',
        'Ou, de outro jeito: grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) — a grade decide quantas cabem.',
      ],
      feita: ctx => {
        const css = ctx.arquivos['estilo.css'] ?? '';
        return colunasDaLista(css, LARGURA_DO_CELULAR) === 1 && colunasDaLista(css, LARGURA_DO_COMPUTADOR) >= 3;
      },
      motivo: ctx => {
        const css = ctx.arquivos['estilo.css'] ?? '';
        const celular = colunasDaLista(css, LARGURA_DO_CELULAR);
        return celular !== 1 ? `Numa tela de ${LARGURA_DO_CELULAR} pontos a .lista faz ${celular} colunas.` : 'No computador a .lista ficou com menos de três colunas.';
      },
    },
    {
      id: 'menu-no-celular',
      titulo: 'O cabeçalho não espreme o menu no celular',
      passos: [
        'O título e o menu lado a lado não cabem em 375 pontos.',
        'Na mesma @media, mude o .cabecalho para flex-direction: column — ou dê a ele flex-wrap: wrap, para o menu descer quando faltar espaço.',
      ],
      feita: ctx => menuQueCabe(ctx.arquivos['estilo.css'] ?? '', LARGURA_DO_CELULAR)
        && !menuEmColunaNoComputador(ctx.arquivos['estilo.css'] ?? ''),
      motivo: ctx => (menuEmColunaNoComputador(ctx.arquivos['estilo.css'] ?? '')
        ? 'O cabeçalho ficou em coluna também no computador — a mudança vale só dentro da @media.'
        : `Numa tela de ${LARGURA_DO_CELULAR} pontos, o .cabecalho continua em linha e sem quebrar.`),
    },
  ],
};

const menuEmColunaNoComputador = (css: string) =>
  valorNaLargura(regrasDoCss(css), LARGURA_DO_COMPUTADOR, '.cabecalho', 'flex-direction') === 'column';

export const LICOES_REACT_DA_CC_FE007: Record<LicaoReactDaCcFe007, DefinicaoDaLicaoDeReact> = {
  'agenda-telas': TELAS,
  'agenda-componentes': COMPONENTES,
  'agenda-api': API,
  'agenda-responsivo': RESPONSIVO,
};

