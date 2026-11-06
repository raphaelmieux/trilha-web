import type { Acao, Roteiro } from '../roteiros';

/*
 * CC-ES008 Dados e Formulários, no construtor de formulários, no Excel e no
 * Bloco de Notas do laboratório, com a encomenda da camiseta — e não a
 * inscrição do acampamento que as lições arrumam. O motivo está em
 * `camisetaDoClube.ts`.
 */

const V = 'CC-ES008';
const L = 1280;
const A = 800;

const r = (topico: string, estado: string, acoes: Acao[]): Roteiro =>
  ({ vereda: V, topico, cena: `camiseta-${estado}`, largura: L, altura: A, acoes });

/* ── O construtor ── */
const cartao = (rotulo: string) => `.fb-cartao:has(.fb-rotulo:text-is("${rotulo}"))`;
const tipoDe = (rotulo: string) => `${cartao(rotulo)} .fb-tipo`;
const itemDoMenu = (texto: string) => `.fb-menu .fb-item:has-text("${texto}")`;
const ABA_RESPOSTAS = '.fb-aba:has-text("Respostas")';
const ABA_PERGUNTAS = '.fb-aba:has-text("Perguntas")';
const VISUALIZAR = '.fb-topo button:has-text("Visualizar")';
const ENVIAR = '.fb-previa button:has-text("Enviar")';
const naPrevia = (rotulo: string) => `.fb-previa [aria-label="${rotulo}"]`;
const recusaDe = (rotulo: string) => `.fb-previa .fb-cartao:has-text("${rotulo}") .fb-recusa`;
const DIALOGO = '.fb-dialogo';
const campoDoDialogo = (rotulo: string) => `${DIALOGO} .fb-campo:has(span:text-is("${rotulo}")) input`;
/** Uma coluna inteira da tabela de respostas, do cabeçalho à última linha. */
const colunaDasRespostas = (n: number) =>
  [`.fb-tabela th:nth-child(${n})`, `.fb-tabela tbody tr:last-child td:nth-child(${n})`];
const linhaDasRespostas = (n: number) => `.fb-tabela tbody tr:nth-child(${n})`;
const celulaDasRespostas = (linha: number, coluna: number) =>
  `.fb-tabela tbody tr:nth-child(${linha}) td:nth-child(${coluna})`;

const abrirValidacao = (rotulo: string, tipo: string): Acao[] => [
  { clicar: cartao(rotulo) },
  { clicar: `${cartao(rotulo)} [aria-label="Mais opções"]` },
  { clicar: itemDoMenu('Validação de resposta') },
  { escolher: `${DIALOGO} select`, valor: tipo },
];
const escreverNoDialogo = (rotulo: string, texto: string): Acao[] =>
  [{ clicar: campoDoDialogo(rotulo) }, { digitar: texto }];

/* ── O Excel ── */
const cel = (nome: string) => `[data-celula="${nome}"]`;
const faixa = (de: string, ate: string) => [cel(de), cel(ate)];
const guia = (nome: string) => `.pl-guia:text-is("${nome}")`;
const botao = (dica: string) => `.pl-bt[title="${dica}"]`;
const aba = (nome: string) => `.pl-aba:text-is("${nome}")`;
const STATUS = '.pl-status';
const escrever = (onde: string, texto: string): Acao[] =>
  [{ clicar: cel(onde) }, { digitar: texto }, { tecla: 'Enter' }];

const criarResumo: Acao[] = [
  { clicar: cel('A1') },
  { clicar: guia('Inserir') },
  { clicar: botao('Tabela dinâmica') },
];

/* ── O CSV, da planilha ao Bloco de Notas ── */
const exportarEAbrir: Acao[] = [
  { clicar: '.pl-guia-arquivo' },
  { escolher: '[aria-label="Salvar como"] select', valor: 'csv' },
  { clicar: '[aria-label="Salvar como"] button:has-text("Salvar")' },
  { clicar: '.bn-tarefa:has-text("Bloco de Notas")' },
  { clicar: '.bn-menu:has-text("Arquivo")' },
  { clicar: '.bn-item:has-text("Abrir")' },
  { clicar: '[aria-label="Abrir"] .bn-item:has-text(".csv")' },
];
const TEXTO_DO_CSV = '.bn-texto';

/* ── A agenda, copiada para a aba do relatório e ordenada ── */
const relatorioOrdenado: Acao[] = [
  { clicar: cel('A1') }, { clicar: cel('D9'), com: 'Shift' },
  { tecla: 'Control+c' },
  { clicar: aba('Agenda em ordem') },
  { clicar: cel('A1') }, { tecla: 'Control+v' },
  { clicar: cel('A1') }, { clicar: cel('D9'), com: 'Shift' },
  { clicar: guia('Inserir') }, { clicar: botao('Formatar como Tabela') },
  { clicar: cel('A2') },
  { clicar: guia('Dados') }, { clicar: botao('Classificar de A a Z') },
];

export const ROTEIROS_DOS_DADOS: Roteiro[] = [
  /* ── Módulo 1 — registro, campo e tipo ── */
  r('registro-e-campo', 'campos', [
    { foto: true, destaque: [[cartao('Nome do desbravador'), cartao('Valor pago (R$)')]] },
    { clicar: ABA_RESPOSTAS },
    { foto: true, destaque: [linhaDasRespostas(3), colunaDasRespostas(3)] },
  ]),
  r('tipo-de-dado', 'campos', [
    { rolarAte: cartao('Telefone do responsável') },
    { clicar: cartao('Valor pago (R$)') },
    { clicar: tipoDe('Valor pago (R$)') },
    { foto: true, destaque: ['.fb-menu'] },
    { clicar: itemDoMenu('Número') },
    { foto: true, destaque: [tipoDe('Valor pago (R$)')] },
  ]),
  r('telefone-parece-numero', 'validacao', [
    { rolarAte: cartao('Telefone do responsável') },
    { foto: true, destaque: [tipoDe('Telefone do responsável'), tipoDe('Valor pago (R$)')] },
    ...abrirValidacao('Telefone do responsável', 'telefone'),
    { clicar: `${DIALOGO} button:has-text("Salvar")` },
    { clicar: VISUALIZAR },
    { clicar: naPrevia('Telefone do responsável') }, { digitar: '61981234599' },
    { clicar: ENVIAR },
    { rolarAte: `.fb-previa .fb-cartao:has-text("Unidade")` },
    { foto: true, destaque: [[naPrevia('Telefone do responsável'), recusaDe('Telefone do responsável')]] },
  ]),
  r('lista-em-vez-de-texto', 'campos', [
    { clicar: ABA_RESPOSTAS },
    { foto: true, destaque: [colunaDasRespostas(3)] },
    { clicar: ABA_PERGUNTAS },
    { clicar: cartao('Unidade') },
    { clicar: tipoDe('Unidade') },
    { foto: true, destaque: [itemDoMenu('Lista suspensa')] },
  ]),

  /* ── Módulo 2 — obrigatório e validação ── */
  r('campo-obrigatorio', 'validacao', [
    { clicar: cartao('Telefone do responsável') },
    { clicar: `${cartao('Telefone do responsável')} [aria-label="Obrigatório"]` },
    { foto: true, destaque: [`${cartao('Telefone do responsável')} [aria-label="Obrigatório"]`] },
    { clicar: VISUALIZAR },
    { clicar: naPrevia('Nome do desbravador') }, { digitar: 'Natan Pires' },
    { clicar: ENVIAR },
    { rolarAte: `.fb-previa .fb-cartao:has-text("Unidade")` },
    { foto: true, destaque: [[naPrevia('Telefone do responsável'), recusaDe('Telefone do responsável')]] },
    { clicar: '.fb-previa button:has-text("Fechar a visualização")' },
    { clicar: ABA_RESPOSTAS },
    { foto: true, destaque: [celulaDasRespostas(13, 4)] },
  ]),
  r('o-que-e-validacao', 'validacao', [
    ...abrirValidacao('Valor pago (R$)', 'numero-entre'),
    ...escreverNoDialogo('De', '30'),
    ...escreverNoDialogo('Até', '120'),
    { foto: true, destaque: [DIALOGO] },
    { clicar: `${DIALOGO} button:has-text("Salvar")` },
    { clicar: VISUALIZAR },
    { clicar: naPrevia('Valor pago (R$)') }, { digitar: '375' },
    { clicar: ENVIAR },
    { rolarAte: `.fb-previa .fb-cartao:has-text("Telefone do responsável")` },
    { foto: true, destaque: [[naPrevia('Valor pago (R$)'), recusaDe('Valor pago (R$)')]] },
  ]),
  r('regra-sem-numero', 'validacao', [
    ...abrirValidacao('Valor pago (R$)', 'numero-entre'),
    { foto: true, destaque: [`${DIALOGO} .fb-aviso`] },
    ...escreverNoDialogo('De', '30'),
    { foto: true, destaque: [`${DIALOGO} .fb-aviso`] },
    ...escreverNoDialogo('Até', '120'),
    { foto: true, destaque: [`${DIALOGO} .fb-dois`] },
  ]),

  /* ── Módulo 3 — base e relatório ── */
  r('base-e-relatorio', 'base', [
    { foto: true, destaque: [cel('A1'), faixa('A18', 'E18')] },
    { clicar: cel('A1') }, { clicar: botao('Excluir Linhas da Planilha') },
    { clicar: cel('A17') }, { clicar: botao('Excluir Linhas da Planilha') },
    { clicar: cel('A1') },
    { foto: true, destaque: [faixa('A1', 'F1')] },
  ]),
  r('chave', 'resumo', [
    { foto: true, destaque: [faixa('B12', 'B13'), faixa('A12', 'A13'), faixa('C12', 'C13')] },
  ]),
  r('importar', 'base', [
    { foto: true, destaque: [cel('C4'), cel('E8'), cel('C10')] },
  ]),

  /* ── Módulo 4 — a tabela dinâmica ── */
  r('o-que-e-tabela-dinamica', 'resumo', [
    ...criarResumo,
    { foto: true, destaque: ['[aria-label="Criar tabela dinâmica"]'] },
    { clicar: '[aria-label="Criar tabela dinâmica"] button:has-text("Criar")' },
    { foto: true, destaque: [faixa('A4', 'B15')] },
  ]),
  r('agrupa-pelo-escrito', 'resumo', [
    ...criarResumo,
    { clicar: '[aria-label="Criar tabela dinâmica"] button:has-text("Criar")' },
    { foto: true, destaque: [cel('A6'), cel('A8'), cel('A10'), cel('A12'), cel('A15')] },
  ]),
  r('guarda-o-que-leu', 'conserto', [
    ...escrever('C3', 'Tucano'),
    { clicar: aba('Relatório') },
    { foto: true, destaque: [cel('A5'), cel('A6')] },
    { clicar: guia('Dados') }, { clicar: botao('Atualizar Tudo') },
    { foto: true, destaque: [botao('Atualizar Tudo'), cel('A5')] },
  ]),

  /* ── Módulo 5 — o conserto ── */
  r('mesma-coisa-escrita-diferente', 'conserto', [
    { clicar: cel('C14') },
    { foto: true, destaque: [cel('C3'), cel('C5'), cel('C7'), cel('C14'), '[aria-label="Barra de fórmulas"]'] },
    { clicar: aba('Relatório') },
    { foto: true, destaque: [faixa('A13', 'B13'), faixa('A15', 'B15')] },
  ]),
  r('arrumar-nao-e-apagar', 'conserto', [
    { foto: true, destaque: [faixa('A9', 'F9')] },
    ...escrever('C9', 'Arara'),
    { clicar: cel('C9') },
    { foto: true, destaque: [cel('C9')] },
  ]),
  r('numero-que-e-texto', 'conserto', [
    { clicar: cel('E2') }, { clicar: cel('E15'), com: 'Shift' },
    { foto: true, destaque: [cel('E7'), STATUS] },
    ...escrever('E7', '37,5'),
    { clicar: cel('E2') }, { clicar: cel('E15'), com: 'Shift' },
    { foto: true, destaque: [cel('E7'), STATUS] },
  ]),

  /* ── Módulo 6 — CSV ── */
  r('o-que-e-csv', 'csv', [
    { clicar: '.pl-guia-arquivo' },
    { escolher: '[aria-label="Salvar como"] select', valor: 'csv' },
    { foto: true, destaque: ['[aria-label="Salvar como"]'] },
    { clicar: '[aria-label="Salvar como"] button:has-text("Salvar")' },
    { clicar: '.bn-tarefa:has-text("Bloco de Notas")' },
    { clicar: '.bn-menu:has-text("Arquivo")' },
    { clicar: '.bn-item:has-text("Abrir")' },
    { clicar: '[aria-label="Abrir"] .bn-item:has-text(".csv")' },
    { foto: true, destaque: [TEXTO_DO_CSV] },
  ]),
  r('o-separador', 'csv', [
    { foto: true, destaque: [faixa('A2', 'F2')] },
    ...exportarEAbrir,
    { foto: true, destaque: [TEXTO_DO_CSV] },
  ]),
  r('as-aspas', 'csv', [
    { foto: true, destaque: [cel('F10')] },
    ...exportarEAbrir,
    { foto: true, destaque: [TEXTO_DO_CSV] },
  ]),

  /* ── Módulo 7 — a agenda ── */
  r('ordem-de-entrada', 'agenda', [
    { foto: true, destaque: [faixa('A2', 'A9')] },
    ...relatorioOrdenado,
    { foto: true, destaque: [faixa('A2', 'A9'), aba('Agenda em ordem')] },
  ]),
  r('linha-inteira', 'agenda', [
    ...relatorioOrdenado,
    { foto: true, destaque: [faixa('A2', 'D2')] },
    { clicar: aba('Agenda') },
    { foto: true, destaque: [faixa('A6', 'D6')] },
  ]),
  r('quatro-campos', 'agenda', [
    { foto: true, destaque: [faixa('A1', 'D1')] },
  ]),
];
