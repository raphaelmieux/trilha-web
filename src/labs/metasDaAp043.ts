/**
 * O que cada laboratório da AP043 cobra, e de onde ele parte.
 *
 * ── Por que isto não mora dentro do componente ───────────────────────────
 * "Laboratório que abre resolvido não ensina nada", e o defeito já aconteceu
 * três vezes nesta plataforma. Das três, o erro é invisível de dentro: o painel
 * mostra tarefas concluídas, que é exatamente o que se espera de um laboratório
 * funcionando. Quem abre para conferir vê a coisa certa.
 *
 * A resposta da casa é a mesma de `modeloInicial.ts` e `desafioDeHtml.ts`: o
 * modelo e o critério saem de dentro do componente, para que um teste os
 * alcance sem montar tela nenhuma. `metasDaAp043.test.ts` confere item por
 * item que nenhuma tarefa nasce verde — e que nenhuma delas é impossível.
 *
 * O que fica aqui é só o que o teste precisa: o estado de partida, o critério
 * de cada tarefa, e o passo a passo que a moldura oferece a quem trava. O
 * desenho continua no componente.
 */

/* ── O documento ───────────────────────────────────────────────────────────── */

export type Quebra = 'linha' | 'quadrada' | 'atras';
export type EstiloDaTabela = 'nenhum' | 'grade' | 'listrada';

export interface Tabela {
  linhas: string[][];
  estilo: EstiloDaTabela;
}

export interface Doc {
  tabela: Tabela | null;
  imagem: { presente: boolean; quebra: Quebra };
  cabecalho: string;
  rodape: string;
  numeracao: boolean;
}

export const TABELA_INICIAL: string[][] = [
  ['Unidade', 'Inscritos'],
  ['Falcão', '12'],
  ['Águia', '9'],
];

export const DOC_INICIAL: Doc = {
  tabela: null,
  imagem: { presente: false, quebra: 'linha' },
  cabecalho: '',
  rodape: '',
  numeracao: false,
};

/* ── As metas ──────────────────────────────────────────────────────────────── */

export interface MetaDeInsercao {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (d: Doc) => boolean;
}

/*
  Nenhuma delas está cumprida no documento inicial, e isso é conferido por
  teste: um laboratório que abre com tarefa verde não ensina nada, e o defeito
  é invisível de dentro — o painel mostra exatamente o que se espera de um
  laboratório funcionando.
*/
export const METAS_DA_INSERCAO: MetaDeInsercao[] = [
  {
    id: 'tabela',
    titulo: 'Inserir e mexer numa tabela',
    detalhe: 'O relatório precisa de uma tabela com as unidades. Insira uma, acrescente a unidade que falta numa linha nova, tire a coluna que sobrou e escolha um estilo para ela.',
    onde: 'Inserir › Tabela — e depois na guia Layout da Tabela, que só aparece com o cursor dentro dela',
    passos: [
      'Na guia Inserir, clique em Tabela e escolha o tamanho 3 por 3.',
      'Clique dentro da tabela: repare que duas guias novas apareceram no alto.',
      'Em Layout da Tabela, use Inserir Abaixo para ganhar uma linha, e escreva a unidade que falta.',
      'Ainda em Layout da Tabela, ponha o cursor na coluna vazia e use Excluir Coluna.',
      'Em Design da Tabela, escolha um estilo — com grade ou listrado.',
    ],
    feita: d => !!d.tabela
      && d.tabela.linhas.length >= 4
      && d.tabela.linhas[0].length === 2
      && d.tabela.estilo !== 'nenhum'
      && d.tabela.linhas.every(l => l.every(c => c.trim() !== '')),
  },
  {
    id: 'imagem',
    titulo: 'Inserir a foto e ajustá-la ao texto',
    detalhe: 'Insira a foto do acampamento. Ela vai entrar empurrando o parágrafo para baixo — ajuste a quebra de texto para que o texto passe ao lado dela.',
    onde: 'Inserir › Imagens, e depois Formatar Imagem › Quebra de Texto',
    passos: [
      'Na guia Inserir, clique em Imagens e escolha a foto do acampamento.',
      'Repare que ela entrou como se fosse uma letra gigante, empurrando o texto.',
      'Clique na imagem: aparece a guia Formatar Imagem.',
      'Em Quebra de Texto, escolha Quadrada — o texto passa a contornar a foto.',
    ],
    feita: d => d.imagem.presente && d.imagem.quebra !== 'linha',
  },
  {
    id: 'cabecalho',
    titulo: 'Inserir e escrever o cabeçalho e o rodapé',
    detalhe: 'Ponha o nome do clube no cabeçalho e o nome da unidade no rodapé. Repare que os dois se repetem sozinhos na segunda página.',
    onde: 'Inserir › Cabeçalho e Rodapé',
    passos: [
      'Na guia Inserir, clique em Cabeçalho. A área do cabeçalho abre e o resto do texto fica apagado.',
      'Escreva o nome do clube.',
      'Desça até o rodapé, na mesma área aberta, e escreva o nome da unidade.',
      'Clique em Fechar Cabeçalho e Rodapé para voltar ao documento.',
    ],
    feita: d => d.cabecalho.trim() !== '' && d.rodape.trim() !== '',
  },
  {
    id: 'numeracao',
    titulo: 'Inserir a numeração de páginas',
    detalhe: 'Ligue a numeração de páginas. Ela não é um número digitado: é um campo que se recalcula sozinho, e por isso a segunda página mostra 2 sem ninguém escrever nada lá.',
    onde: 'Inserir › Número de Página',
    passos: [
      'Na guia Inserir, clique em Número de Página.',
      'Escolha Fim da Página, no canto direito.',
      'Confira na segunda página: o número mudou sozinho.',
    ],
    feita: d => d.numeracao,
  },
];

/* ── A planilha ────────────────────────────────────────────────────────────── */

export type AlinhaH = 'esquerda' | 'centro' | 'direita';
export type AlinhaV = 'acima' | 'meio' | 'abaixo';
export type Layout = 'nenhum' | 'automatico' | 'manual';

export interface Celula {
  /** O que está escrito — pode ser texto, número ou fórmula começando por =. */
  texto: string;
  h: AlinhaH;
  v: AlinhaV;
  /** Quantas colunas esta célula ocupa depois de mesclada. 1 é o normal. */
  span: number;
  /** Coberta por uma mesclagem à esquerda: não se desenha. */
  coberta: boolean;
  negrito: boolean;
}

export interface Planilha {
  celulas: Celula[][];
  larguras: number[];
  alturas: number[];
  layout: Layout;
}

export const vazia = (texto = ''): Celula => ({
  texto, h: 'esquerda', v: 'abaixo', span: 1, coberta: false, negrito: false,
});

/*
  A quinta coluna nasce vazia de propósito: é ela que a tarefa manda excluir.
  Sem ela, o enunciado pediria para tirar uma coluna que não existe — e o
  laboratório seria impossível de vencer sem nada na tela explicando por quê.
*/
const CONTEUDO_INICIAL: string[][] = [
  ['Orçamento do acampamento', '', '', '', ''],
  ['Unidade', 'Inscritos', 'Diárias', 'Total', ''],
  ['Falcão', '12', '3', '1620', ''],
  ['Águia', '9', '3', '1215', ''],
  ['Tucano', '11', '3', '1485', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
];

export const LARGURA_PADRAO = 92;
export const ALTURA_PADRAO = 24;

export const PLANILHA_INICIAL: Planilha = {
  celulas: CONTEUDO_INICIAL.map(linha => linha.map(t => vazia(t))),
  larguras: new Array(5).fill(LARGURA_PADRAO),
  alturas: new Array(7).fill(ALTURA_PADRAO),
  layout: 'nenhum',
};

/** A1, B3 — o nome que a caixa de nome mostra e que a fórmula usa. */
export const nomeDaCelula = (l: number, c: number) => `${String.fromCharCode(65 + c)}${l + 1}`;

/**
 * Resolve o que a célula mostra.
 *
 * Fórmula é o coração do requisito, e por isso ela é calculada de verdade em
 * cima dos valores da grade — e não guardada como número. É essa diferença que
 * a tarefa da soma cobra: mudar um inscrito muda o total sozinho.
 */
export function valorDe(p: Planilha, l: number, c: number): string {
  const bruto = p.celulas[l]?.[c]?.texto ?? '';
  if (!bruto.startsWith('=')) return bruto;

  const m = /^=(SOMA|M[ÉE]DIA)\(([A-Z])(\d+):([A-Z])(\d+)\)$/i.exec(bruto.trim());
  if (!m) return '#NOME?';

  const [, funcao, colA, linA, colB, linB] = m;
  const c1 = colA.toUpperCase().charCodeAt(0) - 65;
  const c2 = colB.toUpperCase().charCodeAt(0) - 65;
  const l1 = Number(linA) - 1;
  const l2 = Number(linB) - 1;

  const numeros: number[] = [];
  for (let li = Math.min(l1, l2); li <= Math.max(l1, l2); li++) {
    for (let ci = Math.min(c1, c2); ci <= Math.max(c1, c2); ci++) {
      const t = p.celulas[li]?.[ci]?.texto ?? '';
      /* Célula com texto não entra na conta, como na planilha de verdade: ela
         é ignorada, e não vira zero. Virar zero puxaria a média para baixo sem
         ninguém entender por quê. */
      if (t === '' || t.startsWith('=')) continue;
      const n = Number(t.replace(',', '.'));
      if (!Number.isNaN(n)) numeros.push(n);
    }
  }
  if (numeros.length === 0) return '0';

  const soma = numeros.reduce((s, n) => s + n, 0);
  const r = /^m/i.test(funcao) ? soma / numeros.length : soma;
  return Number.isInteger(r) ? String(r) : r.toFixed(2).replace('.', ',');
}

/*
  Uma mesclagem aqui vai sempre da célula escolhida até o fim da linha, e por
  isso ela precisa ser refeita quando a linha muda de largura: excluir uma
  coluna deixaria o `span` maior do que a linha, e o navegador desenharia uma
  célula estourando a tabela. Refazer é ler o mesmo que já estava dito — "daqui
  até o fim" —, agora com o fim no lugar novo.
*/
export function refazerMesclagens(celulas: Celula[][]): Celula[][] {
  return celulas.map(linha => {
    const inicio = linha.findIndex(c => c.span > 1);
    if (inicio < 0) return linha.map(c => ({ ...c, span: 1, coberta: false }));
    return linha.map((c, i) => ({
      ...c,
      span: i === inicio ? linha.length - inicio : 1,
      coberta: i > inicio,
    }));
  });
}

/* ── As metas ──────────────────────────────────────────────────────────────── */

export interface MetaDePlanilha {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (p: Planilha) => boolean;
}

export const METAS_DA_PLANILHA: MetaDePlanilha[] = [
  {
    id: 'tamanho',
    titulo: 'Ajustar o tamanho de uma linha e de uma coluna',
    detalhe: 'O título não cabe na coluna A, e a linha do título está apertada. Alargue a coluna A e aumente a altura da linha 1.',
    onde: 'Arrastando a borda do cabeçalho da coluna ou da linha',
    passos: [
      'Leve o ponteiro até a borda direita do cabeçalho "A", entre A e B.',
      'Arraste para a direita até o título caber.',
      'Faça o mesmo na borda de baixo do cabeçalho "1", arrastando para baixo.',
      'Dois cliques na borda também servem: a coluna se ajusta ao conteúdo sozinha.',
    ],
    feita: p => p.larguras[0] > LARGURA_PADRAO + 20 && p.alturas[0] > ALTURA_PADRAO + 10,
  },
  {
    id: 'alinhar',
    titulo: 'Alinhar o texto dentro da célula',
    detalhe: 'Centralize o título na horizontal e no meio na vertical. O alinhamento vertical só aparece porque você já deixou a linha alta.',
    onde: 'Início › Alinhamento',
    passos: [
      'Clique na célula A1, a do título.',
      'Nos botões de alinhamento, escolha Centralizar.',
      'Ao lado deles estão os três de cima para baixo: escolha Alinhar no Meio.',
      'Se nada parecer mudar na vertical, aumente mais a altura da linha 1.',
    ],
    feita: p => p.celulas[0][0].h === 'centro' && p.celulas[0][0].v === 'meio',
  },
  {
    id: 'mesclar',
    titulo: 'Mesclar células e desfazer a mesclagem',
    detalhe: 'O título deve ocupar a largura da tabela inteira. Mescle de A1 até D1 — e depois experimente desfazer, para ver o que a mesclagem faz.',
    onde: 'Início › Mesclar e Centralizar',
    passos: [
      'Clique na célula A1.',
      'Clique em Mesclar — a célula passa a ocupar a linha inteira.',
      'Clique em Desfazer Mesclagem para ver as quatro células de volta.',
      'Mescle de novo: a tarefa pede a planilha entregue com o título mesclado.',
    ],
    feita: p => p.celulas[0][0].span === p.celulas[0].length && p.celulas[0].length >= 3,
  },
  {
    id: 'linhas',
    titulo: 'Inserir e excluir linha e coluna',
    detalhe: 'Falta a unidade Arara na tabela: insira uma linha para ela e preencha inscritos e diárias. E a coluna vazia depois de Total precisa sair.',
    onde: 'Início › Células',
    passos: [
      'Clique numa célula da linha 5, a da unidade Tucano.',
      'Clique em Inserir Linha: uma linha vazia aparece abaixo.',
      'Escreva Arara, o número de inscritos e as diárias.',
      'Para a coluna: clique numa célula da coluna vazia e use Excluir Coluna.',
    ],
    feita: p => p.celulas[0].length === 4
      && p.celulas.some(l => l[0].texto.trim().toLowerCase() === 'arara'
        && Number(l[1].texto) > 0 && Number(l[2].texto) > 0),
  },
  {
    id: 'layout',
    titulo: 'Formatar o layout da tabela',
    detalhe: 'Dê aparência à tabela — pelo estilo pronto ou escolhendo borda e cor você mesmo. O documento pede as duas formas: experimente as duas e deixe a que preferir.',
    onde: 'Início › Estilos',
    passos: [
      'Clique em Formatar como Tabela para a forma automática: o estilo vem pronto.',
      'Clique em Bordas e Preenchimento para a forma manual: você escolhe as linhas e a cor.',
      'Compare as duas. A automática é mais rápida; a manual é a que se ajusta ao que você quer.',
    ],
    feita: p => p.layout !== 'nenhum',
  },
  {
    id: 'funcoes',
    titulo: 'Usar as funções soma e média',
    detalhe: 'Na primeira linha vazia embaixo da tabela, escreva =SOMA dos inscritos e =MÉDIA dos totais. Depois mude o número de inscritos de uma unidade e repare no que acontece.',
    onde: 'Digitando na célula, ou em Fórmulas › Soma',
    passos: [
      'Clique na célula da coluna Inscritos, na primeira linha vazia embaixo da tabela.',
      'Escreva =SOMA(B3:B5) e aperte Enter — ajuste as linhas se a sua tabela cresceu.',
      'Na coluna Total, na mesma linha, escreva =MÉDIA(D3:D5).',
      'Agora mude o número de inscritos de uma unidade: o resultado se refaz sozinho.',
    ],
    feita: p => {
      const textos = p.celulas.flat().map(c => c.texto.toUpperCase().replace(/\s/g, ''));
      const temSoma = textos.some(t => /^=SOMA\([A-Z]\d+:[A-Z]\d+\)$/.test(t));
      const temMedia = textos.some(t => /^=M[ÉE]DIA\([A-Z]\d+:[A-Z]\d+\)$/.test(t));
      return temSoma && temMedia;
    },
  },
];

/* ── O que existe na máquina simulada ──────────────────────────────────────── */

export interface Arquivo {
  id: string;
  nome: string;
  especie: 'jpg' | 'docx' | 'pdf' | 'png';
  bytes: number;
  criado: string;
  modificado: string;
}

export const ARQUIVOS: Arquivo[] = [
  { id: 'a1', nome: 'lista-de-presenca.docx', especie: 'docx', bytes: 184320, criado: '11/08/2026 20:03', modificado: '18/08/2026 21:40' },
  { id: 'a2', nome: 'acampamento-01.jpg', especie: 'jpg', bytes: 3564134, criado: '09/08/2026 14:12', modificado: '09/08/2026 14:12' },
  { id: 'a3', nome: 'relatorio-da-unidade.pdf', especie: 'pdf', bytes: 296755, criado: '18/08/2026 21:55', modificado: '18/08/2026 21:55' },
];

export const FICHA_DA_MAQUINA = {
  processador: 'Intel Core i5-10400 2.90 GHz',
  memoria: '8,00 GB (7,84 GB utilizável)',
  armazenamento: 'SSD de 480 GB',
  sistema: 'Windows 11 Home, versão 24H2',
  arquitetura: 'Sistema operacional de 64 bits, processador baseado em x64',
  nome: 'PC-SECRETARIA',
};

/** Bytes como o Windows os escreve nas propriedades: KB com separador. */
export const emKB = (bytes: number) => `${Math.ceil(bytes / 1024).toLocaleString('pt-BR')} KB`;
export const emMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2).replace('.', ',')} MB`;

export const TIPO: Record<Arquivo['especie'], string> = {
  docx: 'Documento do Word (.docx)',
  pdf: 'Documento PDF (.pdf)',
  jpg: 'Imagem JPEG (.jpg)',
  png: 'Imagem PNG (.png)',
};

/* ── O estado da máquina ───────────────────────────────────────────────────── */

export interface Estado {
  /** O que o desbravador acrescentou na área de trabalho. */
  itensNaArea: { id: string; nome: string; tipo: 'atalho' | 'pasta' }[];
  /** Prints salvos na pasta Capturas de Tela. */
  prints: string[];
  /** Já abriu Sistema › Sobre? */
  viuAsInformacoes: boolean;
  /** De qual arquivo já abriu as propriedades. */
  viuDetalhesDe: string | null;
  relogioAutomatico: boolean;
  data: string;
  hora: string;
  /** O relógio foi mesmo ajustado à mão? */
  relogioAjustado: boolean;
  /** O arquivo foi movido em vez de virar atalho — o engano que a tarefa mostra. */
  arquivoMovido: boolean;
}

export const ESTADO_INICIAL: Estado = {
  itensNaArea: [],
  prints: [],
  viuAsInformacoes: false,
  viuDetalhesDe: null,
  relogioAutomatico: true,
  data: '08/09/2026',
  hora: '13:45',
  relogioAjustado: false,
  arquivoMovido: false,
};

/* ── As metas ──────────────────────────────────────────────────────────────── */

export interface MetaDaArea {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (e: Estado) => boolean;
}

export const METAS_DA_AREA: MetaDaArea[] = [
  {
    id: 'tecnicas',
    titulo: 'Consultar as informações técnicas do computador',
    detalhe: 'Descubra quanta memória, qual processador, quanto armazenamento e qual versão do sistema esta máquina tem.',
    onde: 'Configurações › Sistema › Sobre',
    passos: [
      'Clique no botão Iniciar, na barra de tarefas, e abra Configurações.',
      'Na lista da esquerda, escolha Sistema.',
      'Desça até o fim e clique em Sobre.',
      'É aqui que estão processador, memória instalada e versão do Windows.',
    ],
    feita: e => e.viuAsInformacoes,
  },
  {
    id: 'detalhes',
    titulo: 'Consultar os detalhes de um arquivo',
    detalhe: 'Abra as propriedades de um dos arquivos da pasta Clube e veja o tamanho, o tipo, o local e as datas.',
    onde: 'Explorador › botão direito no arquivo › Propriedades',
    passos: [
      'Abra o Explorador de Arquivos na barra de tarefas.',
      'Clique com o botão direito num arquivo da pasta Clube.',
      'Escolha Propriedades, no fim do menu.',
      'Repare que o tamanho aparece em KB e em bytes — a lista só mostrava um deles.',
    ],
    feita: e => e.viuDetalhesDe !== null,
  },
  {
    id: 'atalho',
    titulo: 'Acrescentar um item na área de trabalho',
    detalhe: 'Ponha um atalho para a pasta do clube na área de trabalho. Atenção: arrastar o arquivo para lá não cria atalho — move o arquivo.',
    onde: 'Botão direito no arquivo › Enviar para, ou botão direito na área de trabalho › Novo',
    passos: [
      'No Explorador, clique com o botão direito num arquivo.',
      'Escolha Enviar para › Área de Trabalho (criar atalho).',
      'Outro caminho: clique com o botão direito na área de trabalho e escolha Novo › Atalho.',
      'O ícone com a setinha no canto é atalho: o arquivo continua onde estava.',
    ],
    feita: e => e.itensNaArea.length > 0,
  },
  {
    id: 'print',
    titulo: 'Fazer um print da tela',
    detalhe: 'Capture a tela e salve a imagem. No Windows 11 a tecla Print Screen abre a Ferramenta de Captura — ela também está no menu Iniciar.',
    onde: 'Tecla Print Screen, ou Iniciar › Ferramenta de Captura',
    passos: [
      'Abra a Ferramenta de Captura pelo menu Iniciar.',
      'Clique em Nova captura.',
      'Clique em Salvar: o arquivo vai para a pasta Capturas de Tela.',
      'Se o seu teclado tiver a tecla Print Screen, ela faz a mesma coisa.',
    ],
    feita: e => e.prints.length > 0,
  },
  {
    id: 'relogio',
    titulo: 'Ajustar a data e a hora',
    detalhe: 'Mude a data ou a hora do computador. Elas vêm em "definir automaticamente", e é preciso desligar isso antes de conseguir mexer.',
    onde: 'Configurações › Hora e idioma › Data e hora',
    passos: [
      'Em Configurações, escolha Hora e idioma.',
      'Repare que os campos estão apagados: a chave "Definir horário automaticamente" está ligada.',
      'Desligue a chave.',
      'Agora mude a data ou a hora e clique em Alterar.',
    ],
    feita: e => e.relogioAjustado,
  },
];
