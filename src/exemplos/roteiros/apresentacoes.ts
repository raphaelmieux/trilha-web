import type { Acao, Roteiro } from '../roteiros';

/*
 * CC-ES011 Apresentações, no PowerPoint do laboratório, com a apresentação da
 * Dia de Portas Abertas — e não a do acampamento que as lições consertam.
 * O motivo está em `diaDePortasAbertas.ts`.
 */

const V = 'CC-ES011';
const L = 1280;
const A = 800;

const r = (topico: string, estado: string, acoes: Acao[]): Roteiro =>
  ({ vereda: V, topico, cena: `portas-${estado}`, largura: L, altura: A, acoes });

const guia = (nome: string) => `.pp-guia:text-is("${nome}")`;
const botao = (dica: string) => `.pp-bt[title="${dica}"]`;
/* Pela posição, e não pelo título: o slide de caixas à mão não tem título reservado. */
const noSlide = (n: number) => `.pp-tira-item >> nth=${n - 1}`;
const PALCO = '.pp-palco .pp-slide';
const TIRA = '.pp-tira';
const STATUS = '.pp-status .of-status-esquerda';
const TELAO = '.pp-telao';
const item = (texto: string) => `.pp-menu-item:has-text("${texto}")`;
const dialogo = (titulo: string) => `.pp-dialogo[aria-label="${titulo}"]`;
const painel = (titulo: string) => `.pp-painel[aria-label="${titulo}"]`;
const cor = (nome: string) => `.pp-cor[title="${nome}"]`;
const TITULO_DO_MESTRE = '[aria-label="Tamanho do título"]';
const CORPO_DO_MESTRE = '[aria-label="Tamanho do corpo"]';

const abrirMestre: Acao[] = [{ clicar: guia('Exibir') }, { clicar: botao('Slide Mestre') }];
const fecharMestre: Acao = { clicar: botao('Fechar Modo de Exibição Mestre') };
const trocarNumero = (campo: string, valor: string): Acao[] =>
  [{ clicar: campo, duplo: true }, { tecla: 'Control+a' }, { digitar: valor }, { tecla: 'Tab' }];

export const ROTEIROS_DAS_APRESENTACOES: Roteiro[] = [
  /* ── Módulo 1 — o slide mestre ── */
  r('o-que-e-slide-mestre', 'com-mestre', [
    ...abrirMestre,
    { foto: true, destaque: ['.pp-mestre-aviso', '.pp-faixa'] },
    ...trocarNumero(TITULO_DO_MESTRE, '44'),
    fecharMestre,
    { clicar: noSlide(2) },
    { foto: true, destaque: [TIRA, PALCO] },
  ]),
  r('a-direta-vence-o-mestre', 'como-chega', [
    { clicar: noSlide(5) },
    ...abrirMestre,
    ...trocarNumero(TITULO_DO_MESTRE, '44'),
    { clicar: cor('Laranja do cartaz') },
    fecharMestre,
    { foto: true, destaque: [[noSlide(5), noSlide(6)], '[aria-label="Título do slide 5"]'] },
    { clicar: guia('Página Inicial') },
    { clicar: botao('Limpar Formatação') },
    { foto: true, destaque: [botao('Limpar Formatação'), [noSlide(5), noSlide(6)], '[aria-label="Título do slide 5"]'] },
  ]),
  r('o-que-se-repete-vai-no-mestre', 'como-chega', [
    ...abrirMestre,
    { clicar: botao('Logo do clube') },
    { clicar: botao('Número do Slide') },
    { foto: true, destaque: [[botao('Logo do clube'), botao('Número do Slide')], '.pp-palco .pp-logo'] },
    fecharMestre,
    { clicar: noSlide(3) },
    { foto: true, destaque: [[noSlide(2), noSlide(4)], '.pp-palco .pp-logo'] },
  ]),

  /* ── Módulo 2 — o layout ── */
  r('o-que-e-layout', 'com-mestre', [
    { clicar: noSlide(4) },
    { clicar: botao('Layout') },
    { foto: true, destaque: ['.pp-menu'] },
    { clicar: item('Título e Conteúdo') },
    { foto: true, destaque: [PALCO] },
  ]),
  r('o-defeito-so-existe-na-sequencia', 'com-mestre', [
    { clicar: noSlide(3) },
    { clicar: guia('Apresentação de Slides') }, { clicar: botao('Do Começo (F5)') },
    { tecla: 'ArrowRight' }, { tecla: 'ArrowRight' },
    { foto: true, destaque: [`${TELAO} .pp-caixa >> nth=0`] },
    { tecla: 'ArrowRight' },
    { foto: true, destaque: [`${TELAO} .pp-caixa >> nth=0`] },
  ]),

  /* ── Módulo 3 — a hierarquia ── */
  r('o-que-e-hierarquia-visual', 'com-layout', [
    { clicar: noSlide(2) },
    { foto: true, destaque: [PALCO] },
    ...abrirMestre,
    ...trocarNumero(TITULO_DO_MESTRE, '40'),
    ...trocarNumero(CORPO_DO_MESTRE, '24'),
    fecharMestre,
    { foto: true, destaque: [PALCO] },
  ]),
  r('topico-nao-e-frase', 'com-layout', [
    { clicar: noSlide(4) },
    { foto: true, destaque: [PALCO, STATUS] },
    { clicar: '[aria-label="Tópicos do slide 4"]' },
    { tecla: 'Control+a' },
    { digitar: 'Barracas: das 9h ao meio-dia' }, { tecla: 'Enter' },
    { digitar: 'Passaporte na entrada' }, { tecla: 'Enter' },
    { digitar: 'Um carimbo por barraca' },
    { clicar: '[aria-label="Notas do apresentador"]' },
    { clicar: '[aria-label="Notas do slide 4"]' },
    { digitar: 'Contar que o passaporte completo concorre a um prêmio.' },
    { foto: true, destaque: [PALCO, '.pp-notas', STATUS] },
  ]),

  /* ── Módulo 4 — o contraste ── */
  r('o-que-e-contraste', 'enxuta', [
    { clicar: noSlide(2) },
    { clicar: guia('Revisão') }, { clicar: botao('Verificar Acessibilidade') },
    { foto: true, destaque: [painel('Acessibilidade')] },
  ]),
  r('escurecer-nao-e-desistir', 'enxuta', [
    { clicar: noSlide(2) },
    ...abrirMestre,
    { foto: true, destaque: ['[aria-label="Cor do título"]', '[aria-label="Cor do corpo"]'] },
    { clicar: cor('Laranja do cartaz, 50% mais escuro') },
    { clicar: cor('Azul do cartaz, 50% mais escuro') },
    fecharMestre,
    { clicar: guia('Revisão') }, { clicar: botao('Verificar Acessibilidade') },
    { foto: true, destaque: [PALCO, painel('Acessibilidade')] },
  ]),

  /* ── Módulo 5 — os três erros ── */
  r('o-efeito-sobre-quem-assiste', 'com-layout', [
    { clicar: guia('Apresentação de Slides') }, { clicar: botao('Do Começo (F5)') },
    { tecla: 'ArrowRight' },
    { foto: true, destaque: [`${TELAO} .pp-slide`] },
  ]),
  r('ver-como-a-sala-ve', 'com-layout', [
    { clicar: guia('Apresentação de Slides') }, { clicar: botao('Do Começo (F5)') },
    { tecla: 'ArrowRight' }, { tecla: 'ArrowRight' }, { tecla: 'ArrowRight' },
    { foto: true, destaque: [`${TELAO} .pp-slide ul`] },
    ...Array.from({ length: 5 }, (): Acao => ({ tecla: 'ArrowRight' })),
    { foto: true },
  ]),

  /* ── Módulo 6 — a imagem ── */
  r('resolucao-e-para-a-projecao', 'legivel', [
    { clicar: noSlide(9) },
    { clicar: guia('Design') }, { clicar: botao('Abrir o painel Formatar Imagem') },
    { foto: true, destaque: [painel('Formatar Imagem')] },
    { clicar: `${painel('Formatar Imagem')} button:has-text("Alterar Imagem")` },
    { foto: true, destaque: [dialogo('Alterar Imagem')] },
    { clicar: `${dialogo('Alterar Imagem')} button:has-text("portas-abertas-2025-original.jpg")` },
    { foto: true, destaque: [painel('Formatar Imagem')] },
  ]),
  r('compactar-e-destrutivo', 'legivel', [
    { clicar: noSlide(9) },
    { clicar: guia('Design') }, { clicar: botao('Abrir o painel Formatar Imagem') },
    { clicar: `${painel('Formatar Imagem')} button:has-text("Alterar Imagem")` },
    { clicar: `${dialogo('Alterar Imagem')} button:has-text("portas-abertas-2025-original.jpg")` },
    { foto: true, destaque: [STATUS] },
    { clicar: botao('Compactar Imagens') },
    { clicar: '[aria-label="150 ppi"]' },
    { foto: true, destaque: [dialogo('Compactar Imagens')] },
    { clicar: `${dialogo('Compactar Imagens')} button:has-text("OK")` },
    { foto: true, destaque: [painel('Formatar Imagem'), STATUS] },
  ]),

  /* ── Módulo 7 — o gráfico ── */
  r('o-grafico-vem-da-planilha', 'com-imagens', [
    { clicar: noSlide(7) },
    { foto: true, destaque: [PALCO] },
    { clicar: guia('Exibir') }, { clicar: botao('Planilha de custos') },
    { foto: true },
  ]),
  r('as-tres-colagens', 'com-imagens', [
    { clicar: noSlide(7) },
    { clicar: '[aria-label="Tópicos do slide 7"]' }, { tecla: 'Control+a' }, { tecla: 'Delete' },
    { clicar: guia('Inserir') }, { clicar: botao('Gráfico') },
    { foto: true, destaque: ['.pp-menu'] },
    { clicar: item('Colar Mantendo a Formatação') },
    { foto: true, destaque: [PALCO] },
  ]),

  /* ── Módulo 8 — as notas ── */
  r('o-que-sao-notas-do-apresentador', 'com-grafico', [
    { clicar: noSlide(3) },
    { clicar: '[aria-label="Notas do apresentador"]' },
    { clicar: '[aria-label="Notas do slide 3"]' },
    { digitar: 'Avisar que a entrada da frente fica fechada no domingo, e que o portão é o da rua de trás.' },
    { foto: true, destaque: ['.pp-notas'] },
    { clicar: guia('Apresentação de Slides') }, { clicar: botao('Modo de Exibição do Apresentador') },
    { foto: true, destaque: ['.pp-apresentador-nota'] },
  ]),
  r('nota-nao-repete-o-slide', 'com-notas', [
    { clicar: noSlide(4) },
    { clicar: '[aria-label="Notas do apresentador"]' },
    { foto: true, destaque: [PALCO, '.pp-notas'] },
  ]),

  /* ── Módulo 9 — cortar ── */
  r('cortar-nao-e-apagar', 'com-notas', [
    { clicar: noSlide(5) },
    { foto: true, destaque: [[noSlide(5), noSlide(6)]] },
    { clicar: '[aria-label="Título do slide 5"]' }, { tecla: 'Control+a' }, { digitar: 'As barracas' },
    { clicar: '[aria-label="Tópicos do slide 5"]' }, { tecla: 'Control+End' }, { tecla: 'Enter' },
    { digitar: 'Jaguar: primeiros socorros' }, { tecla: 'Enter' },
    { digitar: 'Onça: culinária no fogareiro' }, { tecla: 'Enter' },
    { digitar: 'Falcão: aves pelo canto' },
    { clicar: noSlide(6) },
    { clicar: guia('Página Inicial') }, { clicar: botao('Excluir Slide') },
    { clicar: noSlide(5) },
    { foto: true, destaque: [PALCO, noSlide(5)] },
  ]),

  /* ── Módulo 10 — cinco minutos ── */
  r('o-orcamento-de-cinco-minutos', 'cortada', [
    { clicar: noSlide(3) },
    { foto: true, destaque: [STATUS] },
    { clicar: guia('Apresentação de Slides') }, { clicar: botao('Modo de Exibição do Apresentador') },
    { foto: true, destaque: ['.pp-apresentador-nota'] },
  ]),
  r('o-pdf-congela', 'cortada', [
    { clicar: '.pp-guias button:has-text("Arquivo")' },
    { clicar: '.pp-bast-corpo button:has-text("Criar Documento PDF")' },
    { clicar: noSlide(8) },
    { clicar: guia('Página Inicial') }, { clicar: botao('Excluir Slide') },
    { clicar: '.pp-guias button:has-text("Arquivo")' },
    { foto: true, destaque: ['.pp-bast-corpo dl'] },
  ]),
];
