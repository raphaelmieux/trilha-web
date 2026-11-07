import type { Acao, Roteiro } from '../roteiros';

/*
 * CC-ES012 Projeto Documental, nas mesmas janelas do laboratório, com o
 * conjunto do Dia de Portas Abertas — e não o da feira que as lições montam.
 * O motivo está em `conjuntoDasPortas.ts`.
 */

const V = 'CC-ES012';
const L = 1280;
const A = 800;

const r = (topico: string, estado: string, acoes: Acao[]): Roteiro =>
  ({ vereda: V, topico, cena: `conjunto-${estado}`, largura: L, altura: A, acoes });

/* ── O Word ── */
const guiaDoWord = (nome: string) => `.wd-guia:text-is("${nome}")`;
const botaoDoWord = (dica: string) => `.wd-bt[title="${dica}"]`;
const bloco = (id: string) => `[data-bloco="${id}"]`;
const SUMARIO = '.wd-sumario';

/* ── O Excel ── */
const cel = (nome: string) => `[data-celula="${nome}"]`;
const BARRA = '[aria-label="Barra de fórmulas"]';
const aba = (nome: string) => `.pl-aba:text-is("${nome}")`;
const GRADE = '.pl-grade';
const escrever = (onde: string, texto: string): Acao[] =>
  [{ clicar: cel(onde) }, { digitar: texto }, { tecla: 'Enter' }];

/* ── O construtor de formulários ── */
const cartao = (rotulo: string) => `.fb-cartao:has(.fb-rotulo:text-is("${rotulo}"))`;
const tipoDe = (rotulo: string) => `${cartao(rotulo)} .fb-tipo`;
const itemDoTipo = (texto: string) => `.fb-menu .fb-item:has-text("${texto}")`;
const botaoDoFormulario = (texto: string) => `.fb-bt:has-text("${texto}")`;
const TABELA = '.fb-tabela';
const AVISO = '.fb-aviso';
const tarefa = (nome: string) => `.bn-tarefa:has-text("${nome}")`;

/* ── O PowerPoint ── */
const guiaDoPowerPoint = (nome: string) => `.pp-guia:text-is("${nome}")`;
const botaoDoPowerPoint = (dica: string) => `.pp-bt[title="${dica}"]`;
const noSlide = (n: number) => `.pp-tira-item >> nth=${n - 1}`;
const PALCO = '.pp-palco .pp-slide';
const TIRA = '.pp-tira';
const STATUS_DO_SLIDE = '.pp-status';

/* ── O leitor de PDF ── */
const peca = (nome: string) => `.pdf-linha:has-text("${nome}") input`;
const LISTA_DE_PECAS = '.pdf-lista';
const COMBINAR = '.pdf-bt[title="Combinar"]';
const MINIATURAS = '[aria-label="Páginas"]';
const REGUA = '.pdf-status';
const PROCURAR = '[aria-label="Procurar no documento"]';
const ACHADOS = '.pdf-achados';
const FOLHA_DO_PDF = '.pdf-folha';

/* ── A nuvem ── */
const linha = (nome: string) => `.nv-linha:has-text("${nome}")`;
const mais = (nome: string) => `[aria-label="Mais ações de ${nome}"]`;
const item = (texto: string) => `.nv-item:has-text("${texto}")`;
const CAIXA = '.nv-caixa';
const pessoa = (nome: string) => `${CAIXA} .nv-pessoa:has-text("${nome}")`;
const FECHAR_CAIXA: Acao = { ponto: '.nv-fundo', em: [0.02, 0.5] };
const LISTA = '.nv-lista';
const PAINEL = '.nv-extra';
const botaoDaNuvem = (texto: string) => `.nv-btn:has-text("${texto}")`;
const compartilhar = (nome: string): Acao[] =>
  [{ clicar: mais(nome) }, { clicar: item('Compartilhar') }];
const abrirOArquivoDoRegulamento: Acao[] = [
  { clicar: linha('textos portas'), duplo: true },
  { clicar: linha('regulamento-portas-abertas'), duplo: true },
];

export const ROTEIROS_DO_PROJETO_DOCUMENTAL: Roteiro[] = [
  /* ── Módulo 2 — o regulamento ── */
  r('o-conjunto-tem-uma-cara', 'regulamento', [
    { foto: true, destaque: [botaoDoWord('Modificar Título 1: cor da fonte'), bloco('b-titulo'), bloco('b-h1')] },
    { clicar: botaoDoWord('Modificar Título 1: cor da fonte') },
    { foto: true, destaque: [bloco('b-titulo'), bloco('b-h1'), bloco('b-h2')] },
  ]),
  r('a-peca-que-se-encontra-primeiro', 'regulamento', [
    { clicar: guiaDoWord('Inserir') },
    { clicar: botaoDoWord('Escrever a seção que aponta para as outras peças') },
    { rolarAte: bloco('b-mapa') },
    { foto: true, destaque: [botaoDoWord('Escrever a seção que aponta para as outras peças'), [bloco('b-h-mapa'), bloco('b-mapa')]] },
    { rolarAte: SUMARIO },
    { foto: true, destaque: [SUMARIO] },
    { clicar: guiaDoWord('Referências') },
    { clicar: botaoDoWord('Atualizar Sumário') },
    { rolarAte: SUMARIO },
    { foto: true, destaque: [botaoDoWord('Atualizar Sumário'), SUMARIO] },
  ]),

  /* ── Módulo 3 — a planilha de controle ── */
  r('numero-guardado-nao-responde-por-hoje', 'controle', [
    { clicar: cel('B6') },
    { foto: true, destaque: [cel('B6'), BARRA] },
    ...escrever('B6', '=B3*B5'),
    { clicar: cel('B6') },
    { foto: true, destaque: [cel('B6'), BARRA] },
  ]),

  /* ── Módulo 4 — o formulário ── */
  r('o-formulario-se-desenha-de-tras-para-frente', 'formulario', [
    { foto: true, destaque: [cartao('Unidade e barraca')] },
    { clicar: botaoDoFormulario('Separar a pergunta em duas') },
    { foto: true, destaque: [botaoDoFormulario('Separar a pergunta em duas'), [cartao('Unidade'), cartao('Barraca')]] },
  ]),
  r('o-tipo-do-campo-impede-a-resposta-errada', 'formulario', [
    { clicar: tipoDe('Quantos voluntários ficam na barraca') },
    { foto: true, destaque: ['.fb-menu'] },
    { clicar: itemDoTipo('Número') },
    { foto: true, destaque: [cartao('Quantos voluntários ficam na barraca')] },
  ]),

  /* ── Módulo 5 — do formulário para a planilha ── */
  r('redigitar-e-perder-duas-vezes', 'importar', [
    { foto: true, destaque: [TABELA, AVISO] },
    { clicar: botaoDoFormulario('Importar para a planilha') },
    { foto: true, destaque: [botaoDoFormulario('Importar para a planilha'), AVISO] },
    { clicar: tarefa('Excel') },
    { clicar: aba('Respostas') },
    { foto: true, destaque: [GRADE, tarefa('Excel')] },
  ]),
  r('a-formula-faz-a-importacao-valer', 'importar', [
    { clicar: botaoDoFormulario('Importar para a planilha') },
    { clicar: tarefa('Excel') },
    ...escrever('B3', '=CONT.VALORES(Respostas!B2:B20)'),
    ...escrever('B4', '=SOMA(Respostas!D2:D20)'),
    { clicar: cel('B3') },
    { foto: true, destaque: [[cel('B3'), cel('B4')], BARRA] },
    { clicar: cel('B6') },
    { foto: true, destaque: [cel('B6'), BARRA] },
  ]),

  /* ── Módulo 6 — a apresentação ── */
  r('as-quatro-maneiras-de-um-numero-chegar', 'divulgacao', [
    { clicar: noSlide(3) },
    { foto: true, destaque: [PALCO, STATUS_DO_SLIDE] },
    { clicar: guiaDoPowerPoint('Inserir') },
    { clicar: botaoDoPowerPoint('Gráfico com vínculo para a planilha de controle') },
    { foto: true, destaque: [botaoDoPowerPoint('Gráfico com vínculo para a planilha de controle'), PALCO, STATUS_DO_SLIDE] },
  ]),
  r('uma-fonte-da-verdade', 'divulgacao', [
    { clicar: guiaDoPowerPoint('Exibir') },
    { clicar: botaoDoPowerPoint('Slide Mestre') },
    { foto: true, destaque: [botaoDoPowerPoint('Fontes e cor do conjunto'), TIRA] },
    { clicar: botaoDoPowerPoint('Fontes e cor do conjunto') },
    { foto: true, destaque: [TIRA, PALCO] },
  ]),

  /* ── Módulo 7 — o dossiê ── */
  r('o-dossie-e-o-que-sai-do-clube', 'dossie', [
    { clicar: peca('Documento') },
    { clicar: peca('Apresentação') },
    { foto: true, destaque: [LISTA_DE_PECAS] },
    { clicar: COMBINAR },
    { foto: true, destaque: [COMBINAR, MINIATURAS, REGUA] },
  ]),
  r('pesquisavel-se-nasce-do-programa', 'dossie', [
    { clicar: peca('Documento') },
    { clicar: peca('Apresentação') },
    { clicar: COMBINAR },
    { clicar: PROCURAR },
    { digitar: 'Monteiro Lobato' },
    { foto: true, destaque: [[PROCURAR, ACHADOS], FOLHA_DO_PDF] },
  ]),

  /* ── Módulo 8 — o repositório ── */
  r('pasta-com-nome-que-ordena', 'repositorio', [
    { foto: true, destaque: [LISTA] },
    { clicar: botaoDaNuvem('Renomear no padrão') },
    { foto: true, destaque: [botaoDaNuvem('Renomear no padrão'), LISTA] },
  ]),
  r('permissao-por-funcao-sobrevive-a-pessoa', 'repositorio', [
    ...compartilhar('GASTOS PORTAS ABERTAS'),
    { foto: true, destaque: [pessoa('Cleide')] },
    { escolher: `${pessoa('Cleide')} select`, valor: 'sair' },
    { foto: true, destaque: [CAIXA] },
  ]),
  r('o-historico-e-quem-prova', 'repositorio', [
    ...abrirOArquivoDoRegulamento,
    { foto: true, destaque: [`${CAIXA} .nv-titulo-secao:text-is("Quem escreveu") + p`] },
    FECHAR_CAIXA,
    { clicar: botaoDaNuvem('Convidar quem escreve com você') },
    { clicar: linha('regulamento-portas-abertas'), duplo: true },
    { foto: true, destaque: [pessoa('Cleide'), `${CAIXA} .nv-titulo-secao:text-is("Quem escreveu") + p`] },
  ]),
  r('dar-acesso-nao-e-dar-a-conta', 'repositorio', [
    ...abrirOArquivoDoRegulamento,
    { escolher: '[aria-label="Pessoa a adicionar"]', valor: 'lideranca' },
    { clicar: `${CAIXA} .nv-btn:has-text("Dar acesso de editor")` },
    { foto: true, destaque: [pessoa('Liderança')] },
    { escolher: `${pessoa('Liderança')} select`, valor: 'transferir' },
    { foto: true, destaque: [[pessoa('Liderança'), pessoa('Você')]] },
  ]),

  /* ── Módulo 9 — as instruções ── */
  r('o-conjunto-do-ano-que-vem', 'instrucoes', [
    { clicar: `${PAINEL} label:has-text("O que não se mexe") textarea` },
    { digitar: 'A aba Respostas e as células de fórmula da aba Controle. É delas que o regulamento e o gráfico tiram quantas barracas há, e um número digitado por cima para tudo sem avisar.' },
    { foto: true, destaque: [`${PAINEL} label:has-text("O que não se mexe")`] },
  ]),
];
