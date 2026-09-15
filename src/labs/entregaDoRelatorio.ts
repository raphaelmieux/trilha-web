import {
  linhaDe, trechoDe, campoDe, textoDoDoc, textoVisivel, paragrafos,
  titulosDoDoc, sumarioAtualizado, quantasPaginas, revisoesPendentes,
  comentariosDoDoc, ehTabela, ehImagem, ehTitulo, faixaTemCampoDePagina,
  type Doc as DocDoWord, type Bloco as BlocoDoWord,
  type Paragrafo as ParagrafoDoWord, type Trecho, type ItemDeSumario,
} from './documento';

/*
  A entrega: o relatório pronto, e o que ainda não foi feito com ele.

  ── O que este módulo mede, e o que ele de propósito não mede ────────────
  Os requisitos 2.5, 4.6 e 7. O relatório **chega com as quatro peças que o
  requisito 7 nomeia** — sumário, cabeçalho, imagem legendada e tabela —,
  porque construí-las é o que os módulos 3 e 4 já cobraram, e repetir a mesma
  tarefa aqui mediria de novo o que já foi medido. Quem garante que elas estão
  lá é a trava do repositório, e não uma tarefa da lista: tarefa que abre verde
  ensina a não ler a lista.

  O que sobra, e que é só deste módulo, é a **entrega** — e ela tem ordem.

  ── O documento chega no meio do caminho, de propósito ───────────────────
  Duas coisas ficaram para trás, e as duas são o rastro do que veio antes: uma
  marca de revisão que ninguém resolveu, e o sumário, que foi gerado quando o
  relatório tinha três folhas e não sabe da quarta. Nenhuma das duas se vê sem
  procurar, e é aí que está a armadilha: exportar agora é o gesto que se faz
  sem pensar, e o PDF entregue sai com a marca dentro e o sumário errado.

  A ordem que a teoria escreve é essa, e é ela que a lista de tarefas repete:
  terminar, aceitar as marcas, atualizar o sumário, e **só então** exportar.

  ── O PDF congela, e é isso que a tarefa mede ────────────────────────────
  Ele guarda um retrato do documento no instante da exportação, como o sumário
  guarda o que leu e como o PDF do laboratório de apresentações da AP044 já
  faz. Exportar cedo e continuar mexendo deixa o arquivo entregue sem o que
  veio depois — e nada na tela diz isso, porque do lado de fora um PDF velho e
  um novo são o mesmo ícone.

  ── E a entrega é dupla ──────────────────────────────────────────────────
  O requisito 7 pede PDF **e** formato editável, e não é redundância: o PDF é o
  que se lê e se arquiva, o editável é o que a próxima diretoria abre para
  fazer o relatório do ano seguinte. Os dois saem com o mesmo nome, no padrão
  da CC-ES001 — um par com nomes diferentes vira, seis meses depois, duas
  coisas que ninguém sabe se são a mesma.
*/

export type Secao = 'abertura' | 'atividades' | 'numeros' | 'fecho';

export type Doc = DocDoWord<Secao>;
export type Bloco = BlocoDoWord<Secao>;
export type Paragrafo = ParagrafoDoWord<Secao>;

const linha = (id: string, secao: Secao, texto: string): Paragrafo =>
  linhaDe(id, secao, texto);

const titulo = (
  id: string, secao: Secao, texto: string, nivel: 'Título 1' | 'Título 2',
): Paragrafo => ({ ...linhaDe(id, secao, texto), estilo: nivel });

const novaFolha = <B extends Bloco>(b: B): B => ({ ...b, quebraDePagina: true });

/** A legenda: campo mais texto, como o módulo 3 ensinou. */
const legenda = (id: string, secao: Secao, campo: 'figura' | 'tabela', texto: string): Paragrafo => ({
  ...linhaDe(id, secao, ''),
  estilo: 'Legenda',
  trechos: [campoDe(`${id}-n`, campo), trechoDe(`${id}-t`, texto)],
});

/** O que a liderança riscou, e que ninguém resolveu. */
const riscado = (id: string, texto: string): Trecho =>
  ({ ...trechoDe(id, texto), revisao: { autor: 'lideranca', tipo: 'excluido' } });

const inserido = (id: string, texto: string): Trecho =>
  ({ ...trechoDe(id, texto), revisao: { autor: 'lideranca', tipo: 'inserido' } });

/* ── O nome do arquivo ────────────────────────────────────────────────────── */

/**
 * O nome com que o relatório chega, e que é o nome de verdade que se encontra
 * na pasta de todo clube.
 *
 * "final FINAL (2)" não é piada: é o que sobra de três pessoas salvando por
 * cima num sábado. A CC-ES001 ensinou o padrão; aqui ele se aplica à entrega,
 * que é onde o par de arquivos precisa poder ser reencontrado junto.
 */
export const NOME_INICIAL = 'relatorio final FINAL (2)';

/**
 * O padrão que a entrega exige: nome, data e versão.
 *
 * Ele é mais frouxo do que a trava da CC-ES001 de propósito. Lá o requisito
 * pede padrão **próprio**, e a conferência reduz dez nomes a um molde comum;
 * aqui o que a teoria escreve é outra coisa e é só isto — "mesmo nome, mesma
 * data, mesma versão" —, e cobrar o molde de um nome só não mediria nada: um
 * nome sozinho sempre tem o próprio molde.
 */
export const temPadrao = (nome: string): boolean => {
  const limpo = nome.trim();
  if (limpo === '') return false;
  /* Data e versão são duas contas separadas, e não uma expressão só: um nome
     com data e sem versão e outro com versão e sem data são erros diferentes,
     e uma expressão única não teria como dizer qual dos dois faltou. */
  const temData = /\d{4}-\d{2}-\d{2}/.test(limpo);
  const temVersao = /v\d{2,}/i.test(limpo);
  /* Espaço e parênteses são o que o nome de partida tem de sobra, e o que faz
     o par se perder entre sistemas que os escrevem de jeitos diferentes. */
  const semSujeira = !/[\s()]/.test(limpo);
  return temData && temVersao && semSujeira;
};

/* ── O documento ──────────────────────────────────────────────────────────── */

export const CABECALHO_DO_RELATORIO = 'Clube de Desbravadores Pioneiros — Relatório de Atividades 2026';

/**
 * O relatório de quatro folhas, com as quatro peças do requisito 7 e duas
 * coisas por terminar.
 *
 * A marca pendente está no fecho, e o sumário foi gerado quando o documento
 * tinha três folhas: ele não sabe da seção de encerramento, e as folhas que
 * ele cita são as de antes.
 */
export const RELATORIO_DA_ENTREGA_INICIAL: Doc = {
  blocos: [
    titulo('titulo', 'abertura', 'Relatório de Atividades do Clube — 2026', 'Título 1'),
    linha('clube', 'abertura', 'Clube de Desbravadores Pioneiros — Regional Centro'),
    linha('entrega', 'abertura', 'Entregue à liderança da igreja em 14 de março de 2026.'),

    novaFolha(titulo('h-atividades', 'atividades', 'As atividades do ano', 'Título 1')),
    titulo('h-acampamento', 'atividades', 'O acampamento de inverno', 'Título 2'),
    linha('at-1', 'atividades', 'Ocupou o fim de semana de 20 a 22 de junho, no sítio da regional, com barracas por unidade e programação de sexta à noite a domingo de manhã.'),
    {
      tipo: 'imagem', id: 'foto', secao: 'atividades',
      arquivo: 'mastro.jpg', descricao: 'O mastro montado na manhã de sábado',
      disposicao: 'acima-e-abaixo',
    },
    legenda('leg-foto', 'atividades', 'figura', ' — O mastro montado na manhã de sábado.'),
    linha('at-2', 'atividades', 'A campanha de alimentos aconteceu em duas sextas de maio, com recolhimento na igreja e entrega no bairro vizinho na semana seguinte.'),

    novaFolha(titulo('h-numeros', 'numeros', 'Os números', 'Título 1')),
    linha('nu-1', 'numeros', 'O clube fechou o ano com sessenta e dois desbravadores matriculados, contra cinquenta e quatro no ano anterior.'),
    legenda('leg-tab', 'numeros', 'tabela', ' — Presença por unidade, em média, ao longo do ano.'),
    {
      tipo: 'tabela', id: 'tabela', secao: 'numeros',
      linhas: [
        ['Unidade', 'Matriculados', 'Presença média'],
        ['Falcão', '14', '11'],
        ['Tigre', '13', '10'],
        ['Águia', '12', '9'],
        ['Pantera', '12', '10'],
        ['Jaguar', '11', '8'],
      ],
      cabecalho: true, estilo: 'Tabela com Grade',
    },

    novaFolha(titulo('h-fecho', 'fecho', 'O que fica para o ano que vem', 'Título 1')),
    {
      tipo: 'paragrafo', id: 'fe-1', secao: 'fecho', estilo: 'Normal',
      trechos: [
        trechoDe('fe1-a', 'Ficam a investidura das duas classes, a prestação de contas do acampamento e a troca do fogão de campanha, que não passou na '),
        riscado('fe1-b', 'última revisão'),
        inserido('fe1-c', 'revisão de dezembro'),
        trechoDe('fe1-d', '.'),
      ],
    },
    linha('fe-2', 'fecho', 'A secretaria fica de reunir as notas fiscais do transporte até a primeira reunião de fevereiro.'),
  ],
  cabecalho: { trechos: [trechoDe('cab-a', CABECALHO_DO_RELATORIO)] },
  rodape: { trechos: [trechoDe('rod-t', 'Página '), campoDe('rod-n', 'pagina')] },
  primeiraPaginaDiferente: true,
  colunas: { abertura: 1, atividades: 1, numeros: 1, fecho: 1 },
  /*
    O sumário como ele foi gerado: três folhas atrás, sem a seção de
    encerramento. Ele é escrito à mão aqui e não derivado do documento de
    propósito — derivá-lo o deixaria em dia no segundo zero, e a lição some.
  */
  sumario: [
    { texto: 'Relatório de Atividades do Clube — 2026', nivel: 1, pagina: 1 },
    { texto: 'As atividades do ano', nivel: 1, pagina: 2 },
    { texto: 'O acampamento de inverno', nivel: 2, pagina: 2 },
    { texto: 'Os números', nivel: 1, pagina: 3 },
  ],
  controlarAlteracoes: false,
  comentarios: [],
};

export const TEXTO_ORIGINAL = textoDoDoc(RELATORIO_DA_ENTREGA_INICIAL);

/* ── A entrega ────────────────────────────────────────────────────────────── */

/**
 * Um arquivo gravado em disco, com o **retrato** do documento na hora.
 *
 * É o retrato que faz a lição existir: do lado de fora um PDF velho e um novo
 * são o mesmo ícone, e a única maneira de a tarefa saber que o entregue ficou
 * para trás é ter guardado o que ele congelou.
 */
/**
 * Os formatos que a caixa Salvar como oferece.
 *
 * Os quatro, e não só os dois da entrega: um programa tem todas as opções, e
 * salvar em .odt é legítimo — apenas não é o que o requisito 7 pede. Recusar
 * os outros dois viraria muro no primeiro desvio, que é o que a simulação
 * existe para não fazer.
 */
export type FormatoDeArquivo = 'docx' | 'odt' | 'txt' | 'pdf';

export interface ArquivoEntregue {
  nome: string;
  formato: FormatoDeArquivo;
  retrato: string;
}

export interface Entrega {
  /** O nome do arquivo na caixa Salvar como, sem extensão. */
  nome: string;
  arquivos: ArquivoEntregue[];
}

export const ENTREGA_INICIAL: Entrega = { nome: NOME_INICIAL, arquivos: [] };

/**
 * O retrato do documento: tudo o que, mudando, faz o arquivo entregue
 * envelhecer.
 *
 * O texto visível, o sumário como ele está gravado e as marcas pendentes. As
 * três porque as três aparecem no papel: uma marca não resolvida sai impressa,
 * e um sumário velho manda o leitor para a folha errada.
 */
export const retratoDoDoc = (d: Doc): string => JSON.stringify({
  texto: textoVisivel(d),
  sumario: d.sumario,
  marcas: revisoesPendentes(d).map(r => `${r.trecho.id}:${r.trecho.revisao.tipo}`),
  cabecalho: (d.cabecalho?.trechos ?? []).map(x => x.texto).join(''),
});

export const arquivoDe = (e: Entrega, formato: FormatoDeArquivo) =>
  e.arquivos.find(a => a.formato === formato);

/** O arquivo entregue ainda é o documento de agora? */
export const emDia = (e: Entrega, d: Doc, formato: FormatoDeArquivo): boolean => {
  const a = arquivoDe(e, formato);
  return !!a && a.retrato === retratoDoDoc(d);
};

/* ── O que o requisito 7 pede que o relatório tenha ───────────────────────── */

export const temSumario = (d: Doc) => (d.sumario?.length ?? 0) > 0;
export const temCabecalho = (d: Doc) =>
  (d.cabecalho?.trechos ?? []).map(x => x.texto).join('').trim() !== '';
export const temTabela = (d: Doc) => d.blocos.some(ehTabela);
export const temImagemLegendada = (d: Doc) => {
  const i = d.blocos.findIndex(ehImagem);
  if (i < 0) return false;
  const seguinte = d.blocos[i + 1];
  return !!seguinte && seguinte.tipo === 'paragrafo' && seguinte.estilo === 'Legenda'
    && seguinte.trechos.some(x => x.campo === 'figura');
};

/** As quatro peças do requisito 7, numa lista só. */
export const PECAS_DO_REQUISITO_7: { id: string; nome: string; tem: (d: Doc) => boolean }[] = [
  { id: 'sumario', nome: 'sumário', tem: temSumario },
  { id: 'cabecalho', nome: 'cabeçalho', tem: temCabecalho },
  { id: 'imagem', nome: 'imagem legendada', tem: temImagemLegendada },
  { id: 'tabela', nome: 'tabela', tem: temTabela },
];

/* ── As metas ─────────────────────────────────────────────────────────────── */

export interface ContextoDaEntrega {
  doc: Doc;
  entrega: Entrega;
}

export interface MetaDaEntrega {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDaEntrega) => boolean;
}

export const METAS_DA_ENTREGA: MetaDaEntrega[] = [
  {
    id: 'terminar',
    titulo: 'Terminar o documento antes de exportar',
    detalhe: 'Sobrou uma alteração marcada, que sai impressa como está, e o sumário foi gerado '
      + 'quando o relatório tinha três folhas — ele não sabe da última seção, e as folhas que ele '
      + 'cita são as de antes. Nenhuma das duas se vê sem procurar, e as duas viajam para dentro '
      + 'do PDF.',
    onde: 'Revisão › Aceitar, e Referências › Atualizar Sumário',
    passos: [
      'Na guia Revisão, percorra a marca que sobrou e aceite ou rejeite.',
      'Na guia Referências, clique em Atualizar Sumário.',
      'Confira a folha 1: a seção de encerramento tem de aparecer na lista.',
    ],
    feita: c => revisoesPendentes(c.doc).length === 0 && sumarioAtualizado(c.doc),
  },
  {
    id: 'nomear',
    titulo: 'Dar ao arquivo um nome que se reencontre',
    detalhe: `Ele se chama "${NOME_INICIAL}", que é o que sobra de três pessoas salvando por cima `
      + 'num sábado. O padrão da CC-ES001 vale aqui: nome, data e versão, sem espaço e sem '
      + 'parênteses — é isso que faz o par de arquivos ficar junto na pasta seis meses depois.',
    onde: 'Arquivo › Salvar como › Nome do arquivo',
    passos: [
      'Abra Arquivo e clique em Salvar como.',
      'Troque o nome por algo como relatorio-atividades-2026-03-14-v01.',
      'Sem espaço e sem parênteses: eles se escrevem de jeitos diferentes em cada sistema.',
    ],
    feita: c => temPadrao(c.entrega.nome),
  },
  {
    id: 'exportar',
    titulo: 'Exportar o relatório em PDF',
    detalhe: 'O PDF é o que se lê, se imprime e se arquiva: ele carrega dentro as fontes, as '
      + 'imagens e as medidas, e abre igual em qualquer máquina. É o formato de entrega, e não o '
      + 'de trabalho.',
    onde: 'Arquivo › Exportar › Criar PDF',
    passos: [
      'Abra Arquivo e clique em Exportar.',
      'Clique em Criar PDF.',
    ],
    feita: c => !!arquivoDe(c.entrega, 'pdf'),
  },
  {
    id: 'pdf-em-dia',
    titulo: 'Entregar o PDF do documento de agora',
    detalhe: 'O PDF congela o que existir no instante da exportação, exatamente como o sumário '
      + 'guarda o que leu. Exportar cedo e continuar mexendo é o que se faz sem pensar, e o '
      + 'arquivo entregue fica sem o que veio depois — sem nada na tela dizendo isso, porque do '
      + 'lado de fora um PDF velho e um novo são o mesmo ícone. O jeito de consertar é exportar '
      + 'de novo: quem conserta dentro do PDF acaba com dois documentos diferentes.',
    onde: 'Arquivo › Exportar › Criar PDF, depois de terminar',
    passos: [
      'Termine o documento primeiro: marcas resolvidas e sumário em dia.',
      'Só então exporte — ou exporte de novo, se já tinha exportado antes.',
    ],
    feita: c => emDia(c.entrega, c.doc, 'pdf'),
  },
  {
    id: 'entrega-dupla',
    titulo: 'Guardar o editável junto, com o mesmo nome',
    detalhe: 'O requisito 7 pede os dois, e não é redundância: o PDF é o documento como ele '
      + 'ficou, e o editável é o que a próxima diretoria abre para fazer o relatório do ano que '
      + 'vem. Sem ele, o clube tem um retrato bonito de um trabalho que vai ter de ser refeito do '
      + 'zero. Mesmo nome, mesma data, mesma versão — um par com nomes diferentes vira, seis '
      + 'meses depois, duas coisas que ninguém sabe se são a mesma.',
    onde: 'Arquivo › Salvar como, com o tipo .docx',
    passos: [
      'Em Salvar como, deixe o tipo em Documento do Word (*.docx).',
      'Use o mesmo nome do PDF.',
      'Salve. Os dois arquivos ficam lado a lado, com o mesmo nome e extensões diferentes.',
    ],
    /*
      O par precisa de três coisas, e nenhuma se substitui: os dois arquivos
      existirem, terem o mesmo nome, e o editável estar em dia como o PDF. Um
      .docx salvo antes de terminar, ao lado de um PDF novo, é o pior dos dois
      mundos — a próxima diretoria abriria o editável e não acharia o que o
      papel mostra.
    */
    feita: (c) => {
      const pdf = arquivoDe(c.entrega, 'pdf');
      const docx = arquivoDe(c.entrega, 'docx');
      if (!pdf || !docx) return false;
      const semExtensao = (n: string) => n.replace(/\.[^.]+$/, '');
      return semExtensao(pdf.nome) === semExtensao(docx.nome)
        && emDia(c.entrega, c.doc, 'docx');
    },
  },
];

export const metaDaVez = (c: ContextoDaEntrega) =>
  METAS_DA_ENTREGA.find(m => !m.feita(c)) ?? null;

export {
  textoDoDoc, textoVisivel, paragrafos, titulosDoDoc, sumarioAtualizado,
  quantasPaginas, revisoesPendentes, comentariosDoDoc, ehTitulo,
  faixaTemCampoDePagina, type ItemDeSumario,
};
