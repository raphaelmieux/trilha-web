import type { Roteiro } from '../roteiros';

/* CC-ES002 Editor de Texto. */

const V = 'CC-ES002';
const guia = (nome: string) => `.wd-guia:text-is("${nome}")`;
const estilo = (nome: string) => `.wr-estilo[title^="${nome} —"]`;
const item = (nome: string) => `.wd-menu-item:has-text("${nome}")`;
const bloco = (id: string) => `[data-bloco="${id}"]`;
const folha = (n: number) => `[data-pagina="${n}"]`;
const faixaDaFolha = (onde: 'cabecalho' | 'rodape', n: number) => `${folha(n)} [data-faixa="${onde}"]`;
/** Cinco cliques no menos do zoom: 50%, para duas folhas caberem na tela. */
const AFASTAR = Array.from({ length: 5 }, () => ({ clicar: 'button[aria-label="Reduzir o zoom"]' }));

export const ROTEIROS_DO_EDITOR: Roteiro[] = [
  {
    vereda: V, topico: 'formatacao-direta', cena: 'word-programa-a-mao',
    acoes: [
      { clicar: bloco('sabado') },
      { foto: true, destaque: [bloco('sabado'), estilo('Normal')] },
    ],
  },
  {
    vereda: V, topico: 'estilo', cena: 'word-programa-com-estilo',
    acoes: [
      { clicar: bloco('sabado') },
      { foto: true, destaque: [bloco('sabado'), estilo('Título 2')] },
      { clicar: estilo('Título 2'), direito: true },
      { foto: true, destaque: item('Modificar') },
      { clicar: item('Modificar') },
      { escolher: '#wr-cor', valor: '#7F2C1E' },
      { escolher: '#wr-tamanho', valor: '16' },
      { foto: true, destaque: '.wr-caixa' },
      { clicar: '.wr-caixa button:text-is("OK")' },
      { foto: true, destaque: [bloco('sexta'), bloco('sabado'), bloco('domingo')] },
    ],
  },
  {
    vereda: V, topico: 'dois-problemas', cena: 'word-programa-a-mao',
    acoes: [
      { clicar: guia('Referências') },
      { clicar: 'button[title="Sumário"]' },
      { foto: true, destaque: item('Sumário Automático 1') },
      { clicar: item('Sumário Automático 1') },
      { foto: true, destaque: '.wd-sumario' },
    ],
  },
  {
    vereda: V, topico: 'paragrafo', cena: 'word-convite', altura: 900,
    acoes: [
      { foto: true, destaque: bloco('assina') },
      { clicar: 'button[title^="Mostrar Tudo"]' },
      { foto: true, destaque: ['button[title^="Mostrar Tudo"]', [bloco('v1'), bloco('v4')]] },
    ],
  },
  {
    vereda: V, topico: 'quebra-de-linha', cena: 'word-convite', altura: 800,
    acoes: [
      { clicar: 'button[title^="Mostrar Tudo"]' },
      { foto: true, destaque: [[bloco('e1'), bloco('e3')]] },
      { clicar: bloco('e1') },
      { tecla: 'End' },
      { tecla: 'Delete' },
      { tecla: 'Shift+Enter' },
      { tecla: 'End' },
      { tecla: 'Delete' },
      { tecla: 'Shift+Enter' },
      { foto: true, destaque: bloco('e1') },
    ],
  },
  {
    vereda: V, topico: 'serifa', cena: 'word-convite', altura: 800,
    acoes: [
      { clicar: bloco('c1') },
      { tecla: 'Control+a' },
      { clicar: 'button[title="Fonte"]' },
      { foto: true, destaque: '.wd-lista-item:text-is("Georgia")' },
      { clicar: '.wd-lista-item:text-is("Georgia")' },
      { clicar: bloco('c2') },
      { foto: true, destaque: [bloco('c1'), 'button[title="Fonte"]'] },
    ],
  },
  {
    vereda: V, topico: 'tabela', cena: 'word-cantina-tabulacao', largura: 1440,
    acoes: [
      { clicar: guia('Início') },
      { clicar: 'button[title^="Mostrar Tudo"]' },
      { foto: true, destaque: [[bloco('v0'), bloco('v4')]] },
      { selecionarBlocos: [bloco('v0'), bloco('v4')] },
      { clicar: guia('Inserir') },
      { clicar: 'button[title="Tabela"]' },
      { foto: true, destaque: item('Converter Texto em Tabela') },
      { clicar: item('Converter Texto em Tabela') },
      { foto: true, destaque: '[data-bloco="tab-inscritos"]' },
    ],
  },
  {
    vereda: V, topico: 'linha-e-coluna', cena: 'word-cantina-tabela', largura: 1440,
    acoes: [
      { clicar: '[data-celula="5-0"]' },
      { foto: true, destaque: [[guia('Design da Tabela'), guia('Layout da Tabela')]] },
      { clicar: guia('Layout da Tabela') },
      { clicar: 'button[title="Excluir"]' },
      { foto: true, destaque: item('Excluir Linhas') },
      { clicar: item('Excluir Linhas') },
      { foto: true, destaque: '[data-bloco="tab-vendas"]' },
    ],
  },
  {
    vereda: V, topico: 'imagem-no-texto', cena: 'word-cantina-foto', altura: 860,
    acoes: [
      { foto: true, destaque: [[bloco('n1'), bloco('n2')]] },
      { clicar: bloco('img-fila') },
      { clicar: guia('Formato da Imagem') },
      { clicar: 'button[title="Dispor Texto"]' },
      { foto: true, destaque: item('Quadrada') },
      { clicar: item('Quadrada') },
      { clicar: bloco('n3') },
      { foto: true, destaque: [[bloco('img-fila'), bloco('n2')]] },
    ],
  },
  {
    vereda: V, topico: 'legenda', cena: 'word-cantina-duas-fotos', altura: 1120,
    acoes: [
      { foto: true, destaque: bloco('leg-img-caixa') },
      { clicar: bloco('img-fila') },
      { clicar: guia('Referências') },
      { foto: true, destaque: 'button[title="Inserir Legenda"]' },
      { clicar: 'button[title="Inserir Legenda"]' },
      { foto: true, destaque: [bloco('leg-img-fila'), bloco('leg-img-caixa')] },
    ],
  },
  {
    vereda: V, topico: 'cabecalho-rodape', cena: 'word-manual', altura: 860,
    acoes: [
      { clicar: guia('Inserir') },
      { foto: true, destaque: 'button[title="Cabeçalho"]' },
      { clicar: 'button[title="Cabeçalho"]' },
      { clicar: `${faixaDaFolha('cabecalho', 1)} input` },
      { digitar: 'Unidade Falcão — Manual de Acampamento 2026' },
      ...AFASTAR,
      { rolarAte: folha(2) },
      { foto: true, destaque: [faixaDaFolha('cabecalho', 2), faixaDaFolha('cabecalho', 3)] },
    ],
  },
  {
    vereda: V, topico: 'numeracao', cena: 'word-manual-numero-digitado', altura: 860,
    acoes: [
      ...AFASTAR,
      { rolarAte: folha(2) },
      { foto: true, destaque: faixaDaFolha('rodape', 2) },
      { clicar: guia('Inserir') },
      { clicar: 'button[title="Número de Página"]' },
      { foto: true, destaque: ['button[title="Número de Página"]', faixaDaFolha('rodape', 2)] },
    ],
  },
  {
    vereda: V, topico: 'sumario', cena: 'word-manual', altura: 860,
    acoes: [
      { clicar: guia('Referências') },
      { clicar: 'button[title="Sumário"]' },
      { foto: true, destaque: '.wd-sumario' },
      { clicar: bloco('h-fogo') },
      { tecla: 'Home' },
      { clicar: guia('Inserir') },
      { clicar: 'button[title^="Quebra de Página"]' },
      { rolarAte: folha(1) },
      { foto: true, destaque: '.wd-sumario-linha:has-text("O fogo")' },
      { clicar: guia('Referências') },
      { clicar: 'button[title="Atualizar Sumário"]' },
      { foto: true, destaque: ['button[title="Atualizar Sumário"]', '.wd-sumario-linha:has-text("O fogo")'] },
    ],
  },
  {
    vereda: V, topico: 'controle-de-alteracoes', cena: 'word-ata',
    acoes: [
      { foto: true, destaque: 'button[title="Controlar Alterações"]' },
      { clicar: 'button[title="Controlar Alterações"]' },
      { selecionar: bloco('d1'), texto: '18h' },
      { digitar: '19h' },
      { foto: true, destaque: bloco('d1') },
      { clicar: 'button[title="Próxima"]' },
      { clicar: 'button[title="Aceitar"]' },
      { clicar: 'button[title="Próxima"]' },
      { clicar: 'button[title="Aceitar"]' },
      { foto: true, destaque: bloco('d1') },
    ],
  },
  {
    vereda: V, topico: 'comentario', cena: 'word-ata-comentada',
    acoes: [
      { foto: true, destaque: ['.wd-balao', bloco('d2')] },
      { clicar: '.wd-balao textarea' },
      { digitar: 'Fica com o Tiago, que já passou na loja e reservou dois botijões.' },
      { clicar: '.wd-balao button:text-is("Responder")' },
      { foto: true, destaque: '.wd-balao' },
      { clicar: '.wd-balao button:text-is("Resolver")' },
      { foto: true, destaque: '.wd-balao' },
    ],
  },
  {
    vereda: V, topico: 'substituicao', cena: 'word-escala',
    acoes: [
      { clicar: guia('Início') },
      { clicar: 'button[title^="Substituir"]' },
      { clicar: '[aria-label="Localizar"]' },
      { digitar: 'ana' },
      { clicar: '[aria-label="Substituir por"]' },
      { digitar: 'Ana' },
      { foto: true, destaque: '[role="dialog"][aria-label="Localizar e Substituir"]' },
      { clicar: 'button:text-is("Substituir Tudo")' },
      { foto: true, destaque: [[bloco('e1'), bloco('e2')]] },
      { tecla: 'Control+z' },
      { clicar: '#wd-op-maiusculas' },
      { clicar: '#wd-op-inteiras' },
      { foto: true, destaque: [['#wd-op-maiusculas', 'label[for="wd-op-inteiras"]', '[data-achados]']] },
      { clicar: 'button:text-is("Substituir Tudo")' },
      { foto: true, destaque: [[bloco('e1'), bloco('e2')]] },
    ],
  },
  {
    vereda: V, topico: 'exportar', cena: 'word-manual-entrega',
    acoes: [
      { foto: true, destaque: 'button[title="Exportar em PDF"]' },
      { clicar: 'button[title="Exportar em PDF"]' },
      { foto: true, destaque: 'button:has-text("Criar PDF/XPS")' },
      { clicar: 'button:has-text("Criar PDF/XPS")' },
      { foto: true, destaque: '[data-arquivos]' },
    ],
  },
  {
    vereda: V, topico: 'editavel-e-pdf', cena: 'word-manual-entrega',
    acoes: [
      { clicar: guia('Arquivo') },
      { clicar: '[aria-label="Nome do arquivo"]' },
      { tecla: 'Control+a' },
      { digitar: 'manual-falcao-2026-03-14-v01' },
      { escolher: '[aria-label="Tipo"]', valor: 'docx' },
      { foto: true, destaque: [['[aria-label="Nome do arquivo"]', '[aria-label="Tipo"]']] },
      { clicar: '.wd-imprimir-bt' },
      { clicar: 'button[title="Exportar em PDF"]' },
      { clicar: 'button:has-text("Criar PDF/XPS")' },
      { foto: true, destaque: '[data-arquivos]' },
    ],
  },
];
