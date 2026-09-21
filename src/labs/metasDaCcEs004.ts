/**
 * O que cada uma das sete lições da CC-ES004 cobra.
 *
 * Num arquivo só, como `metasDaAp043.ts` e `metasDaAp044.ts`: o **estado** de
 * partida de cada lição mora em `dossieDoClube.ts`, e o que sobra aqui é a
 * conta. Sete arquivos de metas curtas separariam o que se lê junto.
 */

import {
  type DocumentoPdf,
  pesoKb, procurar, ehPesquisavel, estadoDaAssinatura, camposPorPreencher,
} from './documentoPdf';
import { moldeDoNome, nomeTemDataEVersao } from '../lib/exploradorValidator';
import {
  type MetaDoPdf, type PastaDoClube,
  RECIBO,
} from './dossieDoClube';

/* ── Auxiliares ───────────────────────────────────────────────────────────── */

const todosOsPdfs = (p: PastaDoClube) => p.pdfs;

/** Um PDF que veio de determinado programa. O requisito 4.1 pede os três. */
const geradoDe = (p: PastaDoClube, programa: string): DocumentoPdf | undefined =>
  p.pdfs.find(d => d.geradoDe === programa);

/** Quantas páginas há na pasta inteira, para a soma da divisão fechar. */
const totalDePaginas = (p: PastaDoClube) =>
  p.pdfs.reduce((t, d) => t + d.paginas.length, 0);

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 1 — Gerar PDF dos três programas (requisitos 4.1 e 3)
   ──────────────────────────────────────────────────────────────────────── */

/*
  O caminho é **Imprimir → Salvar como PDF**, e não três janelas de Office.

  É o caminho universal, é o que de fato se usa no clube, e a caixa de
  impressão é a mesma nos três programas. Reconstruir Word, Excel e PowerPoint
  aqui seria reconstruir o que a AP043 e a AP044 já ensinam, e ainda faria a
  lição ser sobre eles em vez de ser sobre o PDF.
*/
export const METAS_DE_GERAR: MetaDoPdf[] = [
  {
    id: 'pdf-do-texto',
    titulo: 'Gerar o PDF da ata',
    detalhe: 'A ata está em .docx, que só abre em quem tem o programa e muda de aparência de '
      + 'um computador para outro. O PDF leva as fontes e o desenho da página dentro dele.',
    onde: 'Abra a ata e use Imprimir › Salvar como PDF',
    passos: [
      'Clique na ata para abri-la.',
      'Vá em Imprimir.',
      'Na lista de impressoras, escolha Salvar como PDF.',
      'Confirme o nome e salve.',
    ],
    feita: p => !!geradoDe(p, 'texto'),
  },
  {
    id: 'pdf-da-planilha',
    titulo: 'Gerar o PDF do orçamento',
    detalhe: 'A planilha é o segundo dos três programas que o requisito nomeia. O caminho é o '
      + 'mesmo, e é por isso que ele vale a pena: aprende-se uma vez e serve para tudo.',
    onde: 'Abra o orçamento e use Imprimir › Salvar como PDF',
    passos: ['Clique no orçamento.', 'Imprimir.', 'Salvar como PDF.'],
    feita: p => !!geradoDe(p, 'planilha'),
  },
  {
    id: 'pdf-da-apresentacao',
    titulo: 'Gerar o PDF da apresentação',
    detalhe: 'O terceiro. Uma apresentação em PDF abre em qualquer aparelho e não pede o '
      + 'programa que a fez — que é o que se quer de um arquivo que vai circular.',
    onde: 'Abra a apresentação e use Imprimir › Salvar como PDF',
    passos: ['Clique na apresentação.', 'Imprimir.', 'Salvar como PDF.'],
    feita: p => !!geradoDe(p, 'apresentacao'),
  },
  {
    id: 'o-pdf-congela',
    titulo: 'Ver o PDF ficar para trás',
    detalhe: 'Mude uma linha da ata depois de ter gerado o PDF, e olhe o PDF: ele continua '
      + 'mostrando o texto de antes. O PDF guarda um retrato, e não um vínculo — é essa a '
      + 'razão de ele ser ótimo para distribuir e péssimo para escrever junto.',
    onde: 'Abra a ata, mude uma linha e olhe o PDF ao lado',
    passos: [
      'Gere o PDF da ata primeiro.',
      'Abra a ata de novo e mude alguma coisa no texto.',
      'Olhe o PDF: ele não acompanhou.',
    ],
    /*
      A conta é a **divergência**, e não "editou". Um documento que voltasse ao
      texto original depois da edição deixaria a tarefa verde sem nada a ver:
      o que a lição mostra é o PDF e a origem dizendo coisas diferentes.
    */
    feita: p => {
      const origem = p.origens.find(a => a.programa === 'texto');
      const doc = geradoDe(p, 'texto');
      if (!origem || !doc) return false;
      return origem.linhas.join('\n') !== (doc.paginas[0]?.texto ?? '');
    },
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 2 — Juntar, extrair e dividir (requisitos 4.2 e 4.3)
   ──────────────────────────────────────────────────────────────────────── */

export const METAS_DE_JUNTAR: MetaDoPdf[] = [
  {
    id: 'juntou',
    titulo: 'Reunir os três num documento só',
    detalhe: 'Três anexos num e-mail é o que faz alguém abrir dois e esquecer o terceiro. '
      + 'Um documento com as três partes na ordem chega inteiro.',
    onde: 'Combinar, na barra do leitor',
    passos: [
      'Clique em Combinar.',
      'Marque os três PDFs.',
      'Confirme a ordem e combine.',
    ],
    /*
      Três páginas **e** vindas de origens diferentes. Contar só páginas
      deixaria passar o mesmo documento combinado consigo mesmo três vezes,
      que é um arquivo de três páginas sem nada reunido.
    */
    feita: p => p.pdfs.some(d => {
      const origens = new Set(d.paginas.map(pg => pg.origem));
      return d.paginas.length >= 3 && origens.size >= 3;
    }),
  },
  {
    id: 'extraiu',
    titulo: 'Tirar uma página para um arquivo próprio',
    detalhe: 'A secretaria precisa só da página do orçamento. Extrair tira uma cópia e deixa '
      + 'o documento inteiro de pé — não é recortar, é copiar para fora.',
    onde: 'Extrair páginas, com a página marcada no painel da esquerda',
    passos: [
      'Marque a página no painel de miniaturas.',
      'Clique em Extrair páginas.',
      'Dê um nome ao arquivo novo.',
    ],
    feita: p => p.pdfs.some(d => d.paginas.length === 1)
      && p.pdfs.some(d => d.paginas.length >= 3),
  },
  {
    id: 'dividiu',
    titulo: 'Partir o documento em dois',
    detalhe: 'Dividir é diferente de extrair: não sobra o inteiro. Serve quando o documento '
      + 'era grande demais para anexar, ou quando metade dele é de outra pessoa.',
    onde: 'Dividir, escolhendo a partir de que página cortar',
    passos: [
      'Abra o documento combinado.',
      'Clique em Dividir.',
      'Escolha a página em que o segundo arquivo começa.',
    ],
    /*
      Nenhuma página some no caminho. Sem esta conta, dividir podia jogar
      metade fora e a tarefa ficaria verde — e o desbravador entregaria um
      dossiê sem o orçamento dentro.
    */
    feita: p => p.pdfs.filter(d => d.paginas.length >= 1).length >= 4
      && totalDePaginas(p) >= 6,
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 3 — O peso, e o que se perde (requisitos 2.5 e 4.4)
   ──────────────────────────────────────────────────────────────────────── */

export const METAS_DE_REDUZIR: MetaDoPdf[] = [
  {
    id: 'reconheceu-antes',
    titulo: 'Reconhecer o texto das fichas',
    detalhe: 'As fichas são foto de papel: não têm uma palavra dentro. Reconhecer o texto põe '
      + 'uma camada de letras por baixo da imagem, e é ela que faz a procura funcionar.',
    onde: 'Reconhecer texto, na barra do leitor',
    passos: ['Abra as fichas.', 'Clique em Reconhecer texto.', 'Espere terminar.'],
    feita: p => p.pdfs.some(d => d.paginas.length >= 5 && ehPesquisavel(d)),
  },
  {
    id: 'reduziu',
    titulo: 'Reduzir o tamanho do arquivo',
    detalhe: 'Cinco páginas fotografadas passam de 9 MB, e caixa de e-mail nenhuma aceita '
      + 'isso. O que a redução joga fora é qualidade de imagem — num documento digitado não '
      + 'haveria o que jogar fora, e o arquivo quase não mudaria de tamanho.',
    onde: 'Reduzir tamanho, na barra do leitor',
    passos: [
      'Com as fichas abertas, clique em Reduzir tamanho.',
      'Escolha o nível.',
      'Confira o peso na barra de baixo.',
    ],
    feita: p => p.pdfs.some(d => d.paginas.length >= 5 && pesoKb(d) < 3000),
  },
  {
    id: 'ainda-acha',
    titulo: 'Procurar uma palavra depois de reduzir',
    detalhe: 'Reduzir depois de reconhecer mantém o arquivo pesquisável: o texto é leve e já '
      + 'está gravado. Reduzir **antes** deixa o reconhecimento com menos do que ler, e o '
      + 'texto sai errado — nos dois casos o arquivo encolhe igual, e nada avisa.',
    onde: 'A caixa de procurar, no canto direito da barra',
    passos: [
      'Escreva "Ficha" na caixa de procurar.',
      'Veja quantas páginas ela achou.',
      'Se não achar nenhuma, recomece: reconheça primeiro, reduza depois.',
    ],
    feita: p => p.pdfs.some(d =>
      d.paginas.length >= 5 && pesoKb(d) < 3000 && procurar(d, 'ficha').length >= 5),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 4 — Digitalizar e reconhecer (requisitos 2.2, 2.3 e 5)
   ──────────────────────────────────────────────────────────────────────── */

const oRecibo = (p: PastaDoClube) => p.pdfs.find(d => d.paginas[0]?.linhas === RECIBO)
  ?? p.pdfs.find(d => d.paginas.some(pg => pg.linhas.join(' ').includes('Recibo')));

export const METAS_DE_DIGITALIZAR: MetaDoPdf[] = [
  {
    id: 'enquadrou',
    titulo: 'Enquadrar o papel',
    detalhe: 'A foto saiu com meia mesa em volta. Tirar o que não é papel não é capricho: é o '
      + 'que faz o reconhecimento olhar para a letra em vez de olhar para a madeira.',
    onde: 'Os quatro cantos azuis, na tela de recorte',
    passos: [
      'Aperte cada canto para encaixá-lo na folha.',
      'Ou arraste a régua Enquadrar até o zero.',
    ],
    feita: p => {
      const c = oRecibo(p)?.paginas[0]?.captura;
      return !!c && c.margem <= 12;
    },
  },
  {
    id: 'endireitou',
    titulo: 'Endireitar a página',
    detalhe: 'Papel fotografado sai torto quase sempre. Poucos graus bastam para o '
      + 'reconhecimento trocar letra por letra parecida.',
    onde: 'A régua Endireitar',
    passos: ['Arraste a régua Endireitar até o número chegar a zero.'],
    feita: p => {
      const c = oRecibo(p)?.paginas[0]?.captura;
      return !!c && Math.abs(c.inclinacao) <= 3;
    },
  },
  {
    id: 'contraste',
    titulo: 'Firmar o contraste',
    detalhe: 'A foto cai em Original, que guarda a cor e deixa a letra acinzentada. Para texto, '
      + 'o filtro que serve é o que joga fora tudo o que não é quase-preto.',
    onde: 'A fileira de filtros, embaixo da foto',
    passos: [
      'Toque em Preto e branco.',
      'Olhe o aviso de qualidade acima das réguas.',
    ],
    feita: p => {
      const c = oRecibo(p)?.paginas[0]?.captura;
      return !!c && c.contraste >= 70;
    },
  },
  {
    id: 'comprovou',
    titulo: 'Achar uma palavra dentro do arquivo',
    detalhe: 'É a prova que o requisito pede, e é ela porque olhar não prova nada: um '
      + 'documento em imagem e um pesquisável abrem iguais. Procure "Chácara" — se o '
      + 'reconhecimento leu direito, ela aparece.',
    onde: 'A caixa de procurar, no leitor',
    passos: [
      'Salve a digitalização como PDF.',
      'Abra o arquivo no leitor.',
      'Procure por Chácara.',
      'Se der nenhum resultado, a foto estava ruim: refaça o enquadramento e o filtro.',
    ],
    feita: p => {
      const d = oRecibo(p);
      return !!d && procurar(d, 'chácara').length >= 1;
    },
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 5 — Formulário e comentário (requisitos 4.5 e 4.6)
   ──────────────────────────────────────────────────────────────────────── */

const aAutorizacao = (p: PastaDoClube) => p.pdfs.find(d => d.campos.length > 0);
const aCircular = (p: PastaDoClube) =>
  p.pdfs.find(d => d.paginas.some(pg => pg.linhas.join(' ').includes('Circular')));

export const METAS_DE_FORMULARIO: MetaDoPdf[] = [
  {
    id: 'preencheu',
    titulo: 'Preencher a autorização',
    detalhe: 'Formulário em PDF se preenche na tela, e não imprimindo, escrevendo à mão e '
      + 'fotografando de volta — que é o caminho que faz o documento chegar ilegível.',
    onde: 'Os campos azuis, sobre a folha',
    passos: [
      'Clique em cada campo e escreva.',
      'Os obrigatórios ficam com a borda vermelha enquanto estiverem vazios.',
    ],
    feita: p => {
      const d = aAutorizacao(p);
      return !!d && d.campos.length > 0 && camposPorPreencher(d).length === 0;
    },
  },
  {
    id: 'respondeu',
    titulo: 'Responder ao comentário da liderança',
    detalhe: 'A circular chegou com uma pergunta na margem. Resolver sem responder fecha o '
      + 'assunto sem dizer nada a quem perguntou — e quem perguntou fica achando que você '
      + 'não viu.',
    onde: 'Comentário, na barra, com a margem aberta à direita',
    passos: [
      'Leia o balão que já está na margem.',
      'Clique em Comentário.',
      'Escreva a resposta.',
    ],
    /*
      Um comentário **seu**, além do que já veio. Contar balões deixaria a
      tarefa verde com o da liderança sozinho, que é "zero link não é zero
      link quebrado" aplicado a uma conversa.
    */
    feita: p => {
      const d = aCircular(p);
      return !!d && d.anotacoes.some(a => a.por !== 'Tia Rute');
    },
  },
  {
    id: 'destacou',
    titulo: 'Marcar a data no texto',
    detalhe: 'Marcação e comentário são coisas diferentes: uma aponta onde, o outro diz o quê. '
      + 'Num documento que volta para outra pessoa, os dois juntos poupam um telefonema.',
    onde: 'Destacar, na barra',
    passos: ['Clique em Destacar.', 'Escolha o trecho da data.'],
    feita: p => {
      const d = aCircular(p);
      return !!d && d.anotacoes.some(a => a.tipo === 'destaque');
    },
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 6 — O que parece garantia e não é (requisitos 2.4, 6 e 7)
   ──────────────────────────────────────────────────────────────────────── */

export const METAS_DE_ASSINAR: MetaDoPdf[] = [
  {
    id: 'assinou',
    titulo: 'Assinar com assinatura verificável',
    detalhe: 'Colar a imagem de uma assinatura desenha o rabisco e não prova nada: qualquer '
      + 'pessoa que já viu o documento pode recortá-la e colar noutro. A verificável guarda '
      + 'quem assinou, quando, e o documento daquele instante.',
    onde: 'Assinar, na barra do leitor',
    passos: [
      'Clique em Assinar.',
      'Escolha assinatura verificável, e não a imagem.',
      'Confirme.',
    ],
    feita: p => p.pdfs.some(d => estadoDaAssinatura(d) === 'valida'),
  },
  {
    id: 'viu-quebrar',
    titulo: 'Ver a assinatura deixar de conferir',
    detalhe: 'Mexa em alguma coisa depois de assinar e olhe o selo na barra de baixo: ele '
      + 'passa a dizer que não confere. É isso que a assinatura verificável garante — não que '
      + 'ninguém mexa, mas que mexer apareça. A imagem colada sobrevive a qualquer mudança.',
    onde: 'O selo da assinatura, na barra de baixo',
    passos: [
      'Assine o documento.',
      'Mude alguma coisa: um campo do formulário serve.',
      'Olhe o selo na barra de baixo.',
    ],
    feita: p => p.descobertas.includes('assinatura-quebra'),
  },
  {
    id: 'protegeu',
    titulo: 'Pôr senha no documento',
    detalhe: 'Senha de abertura existe e tem seu uso. O que ela faz é pedir a senha para '
      + 'abrir — e é só isso que ela faz.',
    onde: 'Proteger, na barra do leitor',
    passos: ['Clique em Proteger.', 'Escreva uma senha.', 'Marque "não permitir copiar".'],
    feita: p => p.pdfs.some(d => !!d.protecao),
  },
  {
    id: 'senha-nao-protege',
    titulo: 'Copiar o texto mesmo com a cópia proibida',
    detalhe: 'Com "não permitir copiar" ligado, mande copiar o texto. Ele vem. A restrição é '
      + 'um pedido gravado no arquivo, que o leitor obedece porque quer — outro leitor não '
      + 'obedece, e o arquivo é o mesmo. É por isso que senha não é documento seguro.',
    onde: 'Copiar texto, na barra do leitor',
    passos: [
      'Proteja o documento com senha e marque "não permitir copiar".',
      'Clique em Copiar texto.',
      'Leia o que veio.',
    ],
    feita: p => p.descobertas.includes('senha-nao-protege'),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 7 — O dossiê (requisito 8)
   ──────────────────────────────────────────────────────────────────────── */

/*
  O padrão de nome é o da CC-ES001, e a conferência é a de lá.

  O requisito 8 manda nomear "conforme o padrão adotado na vereda CC-ES001", e
  lá o padrão é **próprio** — a trava não dita um, reduz cada nome a um molde e
  cobra que os nomes caiam no mesmo. `moldeDoNome` e `nomeTemDataEVersao` são
  as funções de lá, importadas e não reescritas: a lição diz com todas as
  letras que este é "o padrão que você escolheu na CC-ES001", e duas
  definições divergiriam — escritas aqui, elas já tinham divergido, aceitando
  `v 2` e `14-03-2026`, que a trava de lá recusa. O desbravador levaria bronca
  num nome que a outra vereda aprovou, ou o contrário.
*/
const semExtensao = (nome: string) => nome.replace(/\.[^.]+$/, '');

export const METAS_DO_DOSSIE: MetaDoPdf[] = [
  {
    id: 'cinco',
    titulo: 'Reunir cinco documentos',
    detalhe: 'O requisito pede no mínimo cinco. O dossiê é o que fica arquivado da atividade: '
      + 'quem abrir daqui a dois anos tem de achar tudo o que aconteceu.',
    onde: 'A lista de arquivos da pasta',
    passos: ['Confira que os cinco documentos da atividade estão na pasta.'],
    feita: p => todosOsPdfs(p).length >= 5,
  },
  {
    id: 'todos-pesquisaveis',
    titulo: 'Deixar os cinco pesquisáveis',
    detalhe: 'Um deles é foto e não tem uma palavra dentro. Num dossiê, isso é o documento que '
      + 'ninguém acha quando precisa — e nada na tela diz qual é: os cinco abrem iguais.',
    onde: 'O aviso amarelo no alto do leitor, e Reconhecer texto',
    passos: [
      'Abra um por um.',
      'O que tiver o aviso amarelo é o que falta.',
      'Reconheça o texto dele.',
      'Procure uma palavra para conferir.',
    ],
    /*
      Cinco **e** todos pesquisáveis. `every` sobre lista vazia é verdadeiro,
      então sem a contagem uma pasta vazia passaria — "zero de zero é tudo".
    */
    feita: p => todosOsPdfs(p).length >= 5 && todosOsPdfs(p).every(ehPesquisavel),
  },
  {
    id: 'nomeados',
    titulo: 'Nomear os cinco no mesmo padrão',
    detalhe: 'Os nomes vieram cada um de um jeito, e um deles é o que a câmera pôs. Um padrão '
      + 'com data e versão faz a pasta se ordenar sozinha e diz qual é a mais recente sem '
      + 'ninguém abrir nada — é o padrão que você escolheu na CC-ES001.',
    onde: 'Renomear, na lista de arquivos',
    passos: [
      'Escolha um padrão: assunto, data e versão.',
      'Renomeie os cinco no mesmo molde.',
      'Confira que os cinco trazem data e versão.',
    ],
    feita: p => {
      const nomes = todosOsPdfs(p).map(d => semExtensao(d.nome));
      if (nomes.length < 5) return false;
      /* As duas contas são necessárias e não se substituem, como na CC-ES001:
         o molde apaga a diferença entre uma data e um número qualquer, e cinco
         datados em cinco moldes não ordenam. */
      const moldes = new Set(nomes.map(moldeDoNome));
      return moldes.size === 1 && nomes.every(nomeTemDataEVersao);
    },
  },
];

/* ── O mapa das lições ────────────────────────────────────────────────────── */

export type LicaoDaCcEs004 =
  | 'gerar' | 'juntar' | 'reduzir' | 'digitalizar'
  | 'formulario' | 'assinar' | 'dossie';

/**
 * De que estado cada lição parte e o que ela cobra.
 *
 * `Record` sobre a união, e não escada de `if`: com sete lições o `else` vira
 * "todo o resto", e a oitava cairia calada na primeira — o desbravador abriria
 * a lição certa e encontraria a pasta errada. Assim ela **não compila** até
 * dizer de onde parte.
 *
 * E o mapa mora fora do teste, como o da CC-ES003: quem o lê é a tela, que
 * monta a lição, **e** a trava, que confere que nenhuma meta abre verde.
 */
export const METAS_DA_LICAO: Record<LicaoDaCcEs004, MetaDoPdf[]> = {
  gerar: METAS_DE_GERAR,
  juntar: METAS_DE_JUNTAR,
  reduzir: METAS_DE_REDUZIR,
  digitalizar: METAS_DE_DIGITALIZAR,
  formulario: METAS_DE_FORMULARIO,
  assinar: METAS_DE_ASSINAR,
  dossie: METAS_DO_DOSSIE,
};

/** O texto que o módulo 3 manda procurar, e o que o módulo 4 manda procurar. */
export const PALAVRA_DAS_FICHAS = 'ficha';
export const PALAVRA_DO_RECIBO = 'chácara';
