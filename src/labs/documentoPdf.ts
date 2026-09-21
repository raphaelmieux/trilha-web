/**
 * O documento PDF: o modelo e o que se faz com ele, sem tela nenhuma.
 *
 * ── Por que ele é um motor, e não um punhado de sinalizadores ─────────────
 * A CC-ES004 cobra coisas que só significam alguma coisa se acontecerem de
 * verdade. O requisito 5 manda digitalizar um papel, reconhecer o texto e
 * **comprovar o resultado localizando uma palavra dentro do arquivo** — e isso
 * é enunciado vazio se a procura achar a palavra de qualquer jeito. O 4.4
 * manda reduzir o tamanho *explicando o que se perde*, o que não se explica
 * sem haver perda. O 6 manda distinguir a assinatura colada da verificável, e
 * as duas desenham o mesmo rabisco na mesma página.
 *
 * Então o documento calcula: a procura lê a camada de texto que existir, a
 * compressão tira nitidez de quem é imagem, o reconhecimento erra quando a
 * captura está ruim, e a assinatura verificável guarda o documento de quando
 * foi assinada.
 *
 * ── O que carrega esta vereda é a diferença que não se vê ─────────────────
 * Um PDF pesquisável e um PDF em imagem abrem iguais, rolam iguais e imprimem
 * iguais. Um assinado com uma imagem colada e um assinado de verdade mostram
 * o mesmo rabisco. Um protegido por senha parece um cofre. Nos três casos o
 * que separa não está na tela, e é por isso que o requisito manda **comprovar**
 * em vez de olhar.
 *
 * É a mesma família do número guardado como texto da CC-ES003 e da ofensiva
 * parada em dois dias: o documento mostra o que se espera de um documento
 * funcionando.
 */

/* ── A página ─────────────────────────────────────────────────────────────── */

/**
 * O estado de uma foto de papel.
 *
 * Os três são o que o requisito 5 manda corrigir — e não são enfeite: é deles
 * que sai a qualidade do reconhecimento. Digitalizar torto, no escuro, e
 * mandar reconhecer devolve texto quase certo, que é a pior espécie.
 */
export interface Captura {
  /** Graus fora do esquadro. Zero é reto. */
  inclinacao: number;
  /** Quanto de mesa e sombra sobrou em volta do papel, de 0 a 100. */
  margem: number;
  /** De 0 a 100. Baixo é a foto acinzentada em que a letra quase some. */
  contraste: number;
  /**
   * De 0 a 100, e ela só desce: comprimir tira nitidez e não devolve.
   *
   * É o que faz a **ordem** importar entre comprimir e reconhecer, e é a
   * armadilha do módulo 3.
   */
  nitidez: number;
}

export interface Pagina {
  id: string;
  /**
   * O que a página desenha. Existe sempre — é a tinta.
   *
   * Repare que ela existe igual na página em imagem: é justamente por as duas
   * desenharem a mesma coisa que a diferença entre elas não se vê.
   */
  linhas: string[];
  /**
   * O texto pesquisável, por baixo do desenho.
   *
   * `undefined` é **documento em imagem**: a página desenha igualzinho e não
   * tem uma palavra dentro. É a distinção do requisito 2.2, e é por ela que o
   * requisito 5 pede prova em vez de olhada.
   *
   * Na página gerada por um programa ele nasce junto, porque ali o texto é o
   * próprio conteúdo. Na digitalizada, só depois do reconhecimento — e com os
   * erros que o reconhecimento cometeu.
   */
  texto?: string;
  /** Só na página que veio de papel. */
  captura?: Captura;
  /** De onde a página veio, para o documento juntado saber dizer. */
  origem: string;
}

/** A captura perfeita: reta, enquadrada, contrastada e nítida. */
export const CAPTURA_BOA: Captura = {
  inclinacao: 0, margem: 0, contraste: 90, nitidez: 100,
};

/* ── O documento ──────────────────────────────────────────────────────────── */

/**
 * Como a assinatura foi posta no documento.
 *
 * A distinção é o requisito 6 inteiro, e ela não é de aparência: as duas
 * desenham o mesmo rabisco no mesmo lugar. O que muda é o que acontece
 * **depois** — e é isso que uma delas prova e a outra não.
 */
export type Assinatura =
  | {
    /**
     * Um desenho colado na página, como qualquer outra imagem.
     *
     * Ela não diz quem assinou nem quando, sobrevive a qualquer edição do
     * documento, e qualquer pessoa que já tenha visto o documento pode
     * recortá-la e colar noutro. É um desenho de uma assinatura, e não uma
     * assinatura.
     */
    tipo: 'imagem';
  }
  | {
    tipo: 'verificavel';
    por: string;
    em: number;
    /**
     * O documento no instante em que foi assinado.
     *
     * É ele que faz a assinatura valer alguma coisa: mexer no documento
     * depois de assinar deixa os dois diferentes, e a assinatura passa a
     * acusar. A colada não tem o que comparar, então nunca acusa nada — que
     * é exatamente por que ela não prova.
     */
    impressao: string;
  };

/**
 * A senha de abertura, e as restrições que o leitor honra por educação.
 *
 * O nome do campo é escolhido: `pedeAoLeitor`, e não `impede`. O requisito 7
 * manda explicar por que senha não é segurança, e metade da resposta está
 * aqui — "não permitir copiar" é um pedido gravado no arquivo, que o leitor
 * de PDF obedece porque quer. Outro leitor não obedece, e o arquivo é o
 * mesmo.
 */
export interface Protecao {
  senha: string;
  pedeAoLeitor: { naoCopiar: boolean; naoImprimir: boolean };
}

/** Um campo de formulário. O requisito 4.5. */
export interface CampoDeFormulario {
  id: string;
  rotulo: string;
  /** Vazio é campo por preencher. */
  valor: string;
  obrigatorio: boolean;
}

/** Um comentário ou marcação posto por quem recebeu. O requisito 4.6. */
export interface Anotacao {
  id: string;
  paginaId: string;
  /** 'comentario' é o balão; 'destaque' é a marca-texto. */
  tipo: 'comentario' | 'destaque';
  texto: string;
  por: string;
}

export interface DocumentoPdf {
  nome: string;
  paginas: Pagina[];
  campos: CampoDeFormulario[];
  anotacoes: Anotacao[];
  assinatura?: Assinatura;
  protecao?: Protecao;
  /**
   * De que programa este PDF saiu, quando saiu de um.
   *
   * O requisito 4.1 pede gerar PDF de texto, de planilha e de apresentação, e
   * a tarefa precisa saber que os três aconteceram — contar três PDFs não
   * serve, porque três exportações do mesmo documento também dariam três.
   */
  geradoDe?: ProgramaDeOrigem;
}

export type ProgramaDeOrigem = 'texto' | 'planilha' | 'apresentacao';

export const NOME_DO_PROGRAMA: Record<ProgramaDeOrigem, string> = {
  texto: 'editor de texto',
  planilha: 'planilha',
  apresentacao: 'apresentação',
};

/* ── Peso ─────────────────────────────────────────────────────────────────── */

/*
  Uma página de texto pesa quase nada; uma foto de papel pesa quase tudo.

  Esta assimetria não é detalhe de simulação: é a razão pela qual comprimir um
  documento digitado não adianta e comprimir um digitalizado adianta muito. Sem
  ela, o requisito 4.4 viraria um botão que mexe num número.
*/
export const PESO_DA_PAGINA_DIGITAL = 38;
export const PESO_DA_PAGINA_DIGITALIZADA = 1850;

/** O peso de uma página, em KB, com a nitidez que ela tem hoje. */
export function pesoDaPagina(p: Pagina): number {
  if (!p.captura) return PESO_DA_PAGINA_DIGITAL;
  /* A imagem é quase todo o peso, e ele acompanha a nitidez; o texto
     reconhecido entra por cima e é desprezível ao lado dela. */
  const imagem = Math.round(PESO_DA_PAGINA_DIGITALIZADA * (p.captura.nitidez / 100));
  return imagem + (p.texto ? 6 : 0);
}

export const pesoKb = (d: DocumentoPdf): number =>
  d.paginas.reduce((t, p) => t + pesoDaPagina(p), 0);

/** O peso escrito como o gerenciador de arquivos escreve. */
export function pesoEscrito(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1).replace('.', ',')} MB`;
}

/* ── Procurar ─────────────────────────────────────────────────────────────── */

/**
 * Onde a palavra aparece — e a resposta sai da camada de texto, nunca do
 * desenho.
 *
 * É esta função que faz o requisito 5 ter o que comprovar. Procurar no que a
 * página **desenha** acharia a palavra em qualquer documento, inclusive na
 * foto de papel que não tem uma letra dentro, e a comprovação passaria a
 * comprovar nada.
 */
export function procurar(d: DocumentoPdf, palavra: string): Pagina[] {
  const alvo = normalizar(palavra);
  if (!alvo) return [];
  return d.paginas.filter(p => p.texto && normalizar(p.texto).includes(alvo));
}

/*
  Sem acento e em minúscula, dos dois lados.

  Quem procura "acampamento" numa página que diz "Acampamento" tem de achar —
  é o que qualquer leitor de PDF faz. O que a normalização **não** conserta é
  o erro de reconhecimento, e é de propósito: "Acarnpamento" continua não
  sendo "Acampamento" depois de tirar o acento, que é justamente a lição.
*/
const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Um documento é pesquisável quando **toda** página tem texto por baixo. */
export const ehPesquisavel = (d: DocumentoPdf): boolean =>
  d.paginas.length > 0 && d.paginas.every(p => !!p.texto);

/**
 * As páginas que não têm texto.
 *
 * Existe separada de `ehPesquisavel` porque o requisito 8 precisa dizer
 * **quais** faltam: num dossiê de cinco documentos, "não está pesquisável"
 * manda procurar nos cinco.
 */
export const paginasSemTexto = (d: DocumentoPdf): Pagina[] =>
  d.paginas.filter(p => !p.texto);

/* ── Juntar, extrair, dividir ─────────────────────────────────────────────── */

/**
 * Reúne vários PDFs num só. O requisito 4.2.
 *
 * Os campos de formulário e as anotações viajam junto, na ordem dos
 * documentos, porque é o que o programa de verdade faz — e porque perdê-los
 * calado seria uma armadilha que o requisito não pediu.
 *
 * O que **não** viaja é a assinatura, e isso não é escolha nossa: assinatura
 * verificável vale para o documento que foi assinado, e o juntado é outro
 * documento. Uma assinatura que sobrevivesse à junção estaria afirmando sobre
 * páginas que ela nunca viu.
 */
export function juntar(docs: DocumentoPdf[], nome: string): DocumentoPdf {
  return {
    nome,
    paginas: docs.flatMap(d => d.paginas),
    campos: docs.flatMap(d => d.campos),
    anotacoes: docs.flatMap(d => d.anotacoes),
  };
}

/**
 * Tira as páginas pedidas para um documento novo, sem mexer no original.
 * O requisito 4.3.
 */
export function extrair(d: DocumentoPdf, ids: string[], nome: string): DocumentoPdf {
  const pedidas = new Set(ids);
  const paginas = d.paginas.filter(p => pedidas.has(p.id));
  const delas = new Set(paginas.map(p => p.id));
  return {
    nome,
    paginas,
    /* O campo e a anotação acompanham a página em que moram; os que ficaram
       para trás não vêm junto, senão o extraído carregaria comentário
       apontando para uma página que não está nele. */
    campos: d.campos,
    anotacoes: d.anotacoes.filter(a => delas.has(a.paginaId)),
  };
}

/**
 * Parte o documento em dois, antes da página dada. O requisito 4.3.
 *
 * Devolve os dois lados porque dividir é isso: não existe "a metade que
 * importa". Quem chamou decide o que fazer com cada uma.
 */
export function dividir(
  d: DocumentoPdf, antesDaPagina: string, nomes: [string, string],
): [DocumentoPdf, DocumentoPdf] {
  const corte = d.paginas.findIndex(p => p.id === antesDaPagina);
  const em = corte < 0 ? d.paginas.length : corte;
  const ids = (ps: Pagina[]) => ps.map(p => p.id);
  const primeiras = d.paginas.slice(0, em);
  const ultimas = d.paginas.slice(em);
  return [
    extrair(d, ids(primeiras), nomes[0]),
    extrair(d, ids(ultimas), nomes[1]),
  ];
}

/* ── Comprimir ────────────────────────────────────────────────────────────── */

export type NivelDeCompressao = 'leve' | 'forte';

/* Quanto da nitidez sobra depois de comprimir. */
const NITIDEZ_RESTANTE: Record<NivelDeCompressao, number> = {
  leve: 0.62,
  forte: 0.22,
};

/**
 * Reduz o tamanho. O requisito 4.4 — que pede explicar **o que se perde**.
 *
 * O que se perde é nitidez de imagem, e só de imagem: numa página digitada
 * não há o que jogar fora, e comprimir um documento de texto não muda
 * praticamente nada. Essa assimetria é a resposta do requisito, e é preciso
 * que ela aconteça de verdade para poder ser observada.
 *
 * ── E a ordem importa, sem nada avisar ────────────────────────────────────
 * A nitidez só desce. Comprimir **antes** de reconhecer o texto deixa o
 * reconhecimento com menos do que ler, e o texto sai pior — às vezes
 * impossível. Comprimir **depois** não mexe no texto, que é leve e já está
 * gravado: o arquivo continua pesquisável e só a foto fica feia.
 *
 * Nada na tela diz isso. O arquivo encolhe nos dois casos, e quem comprimiu
 * na ordem errada descobre quando procura uma palavra e não acha — que é a
 * mesma família do sumário que guarda o que leu e do PDF que congela.
 */
export function comprimir(d: DocumentoPdf, nivel: NivelDeCompressao): DocumentoPdf {
  return {
    ...d,
    paginas: d.paginas.map(p => (p.captura
      ? { ...p, captura: { ...p.captura, nitidez: Math.round(p.captura.nitidez * NITIDEZ_RESTANTE[nivel]) } }
      : p)),
  };
}

/* ── Reconhecer o texto ───────────────────────────────────────────────────── */

/*
  O que o reconhecimento precisa para acertar.

  Os três números não saem de lugar nenhum: são o que a lição manda corrigir —
  contraste e enquadramento no requisito 5 — mais a nitidez, que é o que a
  compressão gasta. Com a captura boa o texto sai inteiro; com ela ruim, sai
  quase certo.
*/
const CONTRASTE_BOM = 70;
const INCLINACAO_TOLERADA = 3;
const MARGEM_TOLERADA = 12;
const NITIDEZ_BOA = 60;

/**
 * Quanto o reconhecimento vai acertar nesta página, de 0 a 1.
 *
 * Existe exposta porque a tela precisa dizer, **antes** de reconhecer, que a
 * captura está ruim — deixar reconhecer em silêncio e entregar texto furado
 * seria a simulação escondendo o que o programa de verdade mostra na prévia.
 */
export function qualidadeDaCaptura(c: Captura): number {
  const contraste = Math.min(1, c.contraste / CONTRASTE_BOM);
  const nitidez = Math.min(1, c.nitidez / NITIDEZ_BOA);
  const reto = c.inclinacao <= INCLINACAO_TOLERADA ? 1
    : Math.max(0, 1 - (c.inclinacao - INCLINACAO_TOLERADA) / 12);
  const enquadrado = c.margem <= MARGEM_TOLERADA ? 1
    : Math.max(0, 1 - (c.margem - MARGEM_TOLERADA) / 45);
  return Math.max(0, Math.min(1, contraste * nitidez * reto * enquadrado));
}

/*
  As trocas que o reconhecimento comete de verdade.

  Elas não foram inventadas: são as clássicas, as que qualquer pessoa que já
  reconheceu texto de um papel torto reconhece de olhar. O "m" que vira "rn" é
  a mais famosa, e é a mais cruel, porque "Acarnpamento" lido rápido é
  "Acampamento" — e é ela que faz a procura falhar sem ninguém entender por
  quê.

  Reconhecer errado é muito mais honesto do que reconhecer menos: texto que
  **falta** se percebe olhando o tamanho, texto que está **quase certo** não
  se percebe de jeito nenhum. E as duas falham na procura exatamente igual.

  ── E a lista precisa cobrir a língua ────────────────────────────────────
  Ela começou com quatro trocas — m, l, 0 e ç — e tinha um buraco que não se
  via: palavra sem nenhuma dessas letras saía **intacta** de um
  reconhecimento péssimo. Cinco de oito palavras portuguesas comuns passavam
  ilesas, e entre elas estavam "Ficha", "Recibo" e "Chácara" — que são
  exatamente as que as lições mandam procurar. A página ficava mal lida e
  perfeitamente pesquisável, que é o contrário da lição.

  Hoje são doze, todas confusões que o reconhecimento comete de verdade, e a
  cobertura é conferida: `documentoPdf.test.ts` cobra que palavra portuguesa
  comum não escape.
*/
const TROCAS_DO_OCR: [RegExp, string][] = [
  [/m/g, 'rn'],
  [/h/g, 'li'],
  [/d/g, 'cl'],
  [/l/g, 'I'],
  [/ç/g, 'c'],
  [/0/g, 'O'],
  [/e/g, 'c'],
  [/a/g, 'o'],
  [/n/g, 'ri'],
  [/u/g, 'ii'],
  [/i/g, 'l'],
  [/s/g, '5'],
];

/**
 * Reconhece o texto das páginas de imagem. O requisito 2.3.
 *
 * A página que já tem texto não é tocada: reconhecer de novo sobre um
 * documento digital seria trocar texto certo por texto adivinhado, que é o
 * contrário do que a ferramenta faz.
 */
export function reconhecerTexto(d: DocumentoPdf): DocumentoPdf {
  return {
    ...d,
    paginas: d.paginas.map(p => {
      if (!p.captura || p.texto) return p;
      return { ...p, texto: lerComoOcr(p.linhas.join('\n'), qualidadeDaCaptura(p.captura)) };
    }),
  };
}

/**
 * O texto como o reconhecimento o leu, com os erros que a qualidade permitiu.
 *
 * A conta é determinística de propósito — sorteio aqui faria a mesma
 * digitalização dar resultados diferentes em duas execuções, e a trava não
 * teria o que afirmar. Quanto pior a captura, mais palavras erradas, e elas
 * são escolhidas espaçadamente para o estrago não ficar todo num canto.
 */
export function lerComoOcr(texto: string, qualidade: number): string {
  if (qualidade >= 1) return texto;

  const palavras = texto.split(/(\s+)/);
  /* Só o que é palavra conta para a conta de quantas errar — os separadores
     estão no array por causa do `split` com captura, que é o que preserva as
     quebras de linha. */
  const indices = palavras.map((p, i) => [p, i] as const).filter(([p]) => /\S/.test(p));
  const aErrar = Math.round(indices.length * (1 - qualidade));
  if (aErrar <= 0) return texto;

  const passo = indices.length / aErrar;
  const erradas = new Set<number>();
  for (let k = 0; k < aErrar; k++) erradas.add(indices[Math.floor(k * passo)][1]);

  return palavras.map((p, i) => (erradas.has(i) ? trocar(p) : p)).join('');
}

/* Uma troca por palavra: a primeira da lista que casa. Aplicar todas de uma
   vez daria uma palavra irreconhecível, e reconhecimento ruim não produz
   garrancho — produz palavra parecida, que é o que engana. */
function trocar(palavra: string): string {
  for (const [de, para] of TROCAS_DO_OCR) {
    de.lastIndex = 0;
    if (de.test(palavra)) return palavra.replace(de, para);
  }
  return palavra;
}

/* ── Formulário ───────────────────────────────────────────────────────────── */

export function preencher(d: DocumentoPdf, campoId: string, valor: string): DocumentoPdf {
  return { ...d, campos: d.campos.map(c => (c.id === campoId ? { ...c, valor } : c)) };
}

export const camposPorPreencher = (d: DocumentoPdf): CampoDeFormulario[] =>
  d.campos.filter(c => c.obrigatorio && !c.valor.trim());

/* ── Anotar ───────────────────────────────────────────────────────────────── */

export function anotar(d: DocumentoPdf, a: Anotacao): DocumentoPdf {
  return { ...d, anotacoes: [...d.anotacoes, a] };
}

/* ── Assinar ──────────────────────────────────────────────────────────────── */

/**
 * O documento reduzido a uma linha, para a assinatura ter o que comparar.
 *
 * Não é criptografia e não finge ser: é um resumo do que o documento dizia no
 * instante da assinatura. O que ele precisa é mudar quando o documento muda,
 * e isso basta para a lição do requisito 6 acontecer.
 *
 * Ele lê o **texto** das páginas, e não o desenho, porque é o conteúdo que a
 * assinatura afirma. Preencher um campo de formulário depois de assinar
 * também conta como mexer: o documento assinado dizia outra coisa.
 */
export function impressaoDoDocumento(d: DocumentoPdf): string {
  const corpo = [
    ...d.paginas.map(p => `${p.id}:${p.texto ?? p.linhas.join(' ')}`),
    ...d.campos.map(c => `${c.id}=${c.valor}`),
  ].join('|');

  let h = 0;
  for (let i = 0; i < corpo.length; i++) h = (Math.imul(h, 31) + corpo.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function assinarComImagem(d: DocumentoPdf): DocumentoPdf {
  return { ...d, assinatura: { tipo: 'imagem' } };
}

export function assinarVerificavel(d: DocumentoPdf, por: string, em: number): DocumentoPdf {
  return { ...d, assinatura: { tipo: 'verificavel', por, em, impressao: impressaoDoDocumento(d) } };
}

/** Como está a assinatura deste documento, agora. */
export type EstadoDaAssinatura = 'nenhuma' | 'imagem' | 'valida' | 'quebrada';

/**
 * A conta que faz o requisito 6 existir.
 *
 * A colada devolve `'imagem'` e nunca mais muda, aconteça o que acontecer com
 * o documento — é um desenho, e desenho não confere nada. A verificável
 * compara o documento de agora com o de quando foi assinada, e quebra se
 * alguém mexeu.
 *
 * É por isso que a diferença entre as duas só aparece **depois**: no dia da
 * assinatura as duas mostram o mesmo rabisco e dizem a mesma coisa. Quem
 * escolhe pela tela escolhe no escuro.
 */
export function estadoDaAssinatura(d: DocumentoPdf): EstadoDaAssinatura {
  if (!d.assinatura) return 'nenhuma';
  if (d.assinatura.tipo === 'imagem') return 'imagem';
  return d.assinatura.impressao === impressaoDoDocumento(d) ? 'valida' : 'quebrada';
}

/* ── Proteger ─────────────────────────────────────────────────────────────── */

export function proteger(d: DocumentoPdf, p: Protecao): DocumentoPdf {
  return { ...d, protecao: p };
}

/**
 * Tira a senha de um documento — sabendo a senha.
 *
 * Existe porque o requisito 7 pede explicar por que senha não é segurança, e
 * metade da explicação é esta: quem consegue abrir consegue salvar sem senha,
 * e a partir daí o arquivo circula aberto. A ferramenta que faz isso não é
 * de invasor, é o próprio programa.
 */
export function removerSenha(d: DocumentoPdf, senha: string): DocumentoPdf | null {
  if (!d.protecao || d.protecao.senha !== senha) return null;
  const aberto = { ...d };
  delete aberto.protecao;
  return aberto;
}

/**
 * O que dá para tirar de dentro do documento uma vez aberto.
 *
 * Devolve o texto **apesar** de `naoCopiar`, e é de propósito: a restrição é
 * um pedido gravado no arquivo, que o leitor obedece porque quer. Fazer a
 * simulação obedecer ensinaria que o pedido é uma trava, que é exatamente a
 * crença que o requisito 7 existe para desfazer — e ensinaria pela via pior,
 * a de quem confiou e mandou o documento adiante.
 */
export function copiarTexto(d: DocumentoPdf): string {
  return d.paginas.map(p => p.texto ?? p.linhas.join('\n')).join('\n\n');
}
