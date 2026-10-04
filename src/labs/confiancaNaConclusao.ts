/**
 * Quanta confiança a conclusão merece, dito por quem a tirou.
 *
 * É o módulo 10 da CC-ES010, e o requisito 9: apresentar a análise completa ao
 * examinador **declarando expressamente o grau de confiança** que se deposita
 * na conclusão, e as razões dessa avaliação.
 *
 * ── Não é a defesa da CC-ES009, e a diferença é o assunto ────────────────
 * Lá o examinador contesta e a pessoa defende com os dados ou reconhece o
 * limite. Aqui ninguém contestou ainda: o que se cobra é dizer de quanto se
 * confia **antes** de alguém perguntar, que é a coisa que não se faz. Toda
 * apresentação de dados do mundo abre com o que sustenta a conclusão e deixa
 * os limites para a pergunta que talvez não venha.
 *
 * ── O achado difícil é o do módulo 8 ────────────────────────────────────
 * Dos oito achados desta vereda, sete se classificam na primeira olhada. O
 * oitavo é "excluir o valor atípico levou o r² de 0,83 para 0,94", e a leitura
 * natural dele é que a análise ficou **melhor** — o ajuste subiu, afinal.
 * Ele limita: o que subiu foi a confiança aparente, e não o acerto. Quem
 * classificar esse certo entendeu a vereda inteira.
 *
 * ── E a plataforma não confere a apresentação ───────────────────────────
 * Ela acontece fora do aplicativo, como a da CC002 e a da AP045. O que a
 * plataforma faz é preparar: reunir os achados, cobrar a classificação de cada
 * um, e guardar o grau declarado com as razões — para a pessoa treinar com a
 * **própria** análise na frente.
 */

/* ── O grau declarado ─────────────────────────────────────────────────────── */

export type GrauDeConfianca = 'alta' | 'media' | 'baixa' | 'nenhuma';

export interface Grau {
  id: GrauDeConfianca;
  rotulo: string;
  /**
   * A que declarar este grau compromete quem o declara.
   *
   * É a decisão dos quatro níveis de calendário da CC-ES007 e dos três métodos
   * de duas etapas da CC-ES005: cada um traz escrito o que ele **não** cobre.
   * Sem esse lado, a fileira é quatro palavras parecidas e a escolha vira
   * clicar na primeira.
   */
  compromisso: string;
}

export const GRAUS: Grau[] = [
  {
    id: 'alta',
    rotulo: 'Alta',
    compromisso:
      'Você está dizendo que o clube pode decidir com base nisto sem olhar '
      + 'mais nada. Para sustentar, nenhum dos seus achados poderia estar '
      + 'limitando a conclusão.',
  },
  {
    id: 'media',
    rotulo: 'Média',
    compromisso:
      'Você está dizendo que a conclusão vale, e que ela tem limites que você '
      + 'sabe nomear. É o grau que obriga a apresentar os dois lados.',
  },
  {
    id: 'baixa',
    rotulo: 'Baixa',
    compromisso:
      'Você está dizendo que isto serve para levantar a pergunta, e não para '
      + 'decidir. Quem ouvir deve esperar mais dados antes de agir.',
  },
  {
    id: 'nenhuma',
    rotulo: 'Nenhuma',
    compromisso:
      'Você está dizendo que a análise não mostra nada. Para sustentar, '
      + 'nenhum dos seus achados poderia estar sustentando a conclusão — e '
      + 'nesse caso não haveria o que apresentar.',
  },
];

export const grauDe = (id: string) => GRAUS.find(g => g.id === id);

/* ── Os achados que a análise produziu ───────────────────────────────────── */

/** Se o achado sustenta a conclusão ou se ele a limita. */
export type PesoDoAchado = 'sustenta' | 'limita';

export interface Achado {
  id: string;
  /** O achado, escrito como quem o apresentaria. */
  frase: string;
  /** De que módulo desta vereda ele saiu, para a tela dizer. */
  deOnde: string;
  peso: PesoDoAchado;
  /** Por que ele pesa para aquele lado. Lido **depois** da classificação. */
  porque: string;
}

/**
 * Os oito achados, três que sustentam e cinco que limitam.
 *
 * Eles não são inventados para esta lição: cada um é o resultado de um módulo
 * que a pessoa percorreu, com o número que ela mesma calculou. Um achado novo
 * aqui seria a plataforma trazendo conclusão de fora na hora de avaliar a
 * confiança — e aí a avaliação seria sobre uma análise que não é a dela.
 *
 * E os que limitam são mais do que os que sustentam porque esta base é assim:
 * uma coleta enviesada, uma correlação que não é causa e uma diferença de
 * grupo que o acaso alcança. Inventar sustentos para equilibrar a lista seria
 * inventar confiança.
 */
export const ACHADOS: Achado[] = [
  {
    id: 'relacao-forte',
    frase:
      'O r entre idade e altura é 0,91, e o r² é 0,83: a reta explica a maior '
      + 'parte da variação da altura.',
    deOnde: 'Módulos 2 e 6',
    peso: 'sustenta',
    porque:
      'É uma relação forte medida em quarenta e oito pessoas, e ela é o que a '
      + 'conclusão afirma. Sustento é isto: o número que você tem a favor.',
  },
  {
    id: 'relacao-sobrevive',
    frase:
      'Tirar o valor atípico não mudou o que a reta afirma: 8,4 contra 8,0 '
      + 'centímetros por ano de idade.',
    deOnde: 'Módulo 8',
    peso: 'sustenta',
    porque:
      'Uma conclusão que não depende de uma única pessoa é mais firme do que '
      + 'uma que depende. Isto é o lado bom do módulo 8 — e ele tem dois.',
  },
  {
    id: 'direcao-clara',
    frase:
      'Entre idade e altura a direção é clara: a idade explica a altura, e não '
      + 'o contrário.',
    deOnde: 'Módulo 4',
    peso: 'sustenta',
    porque:
      'Saber qual variável explica qual é o que permite escrever a reta na '
      + 'ordem certa. Na maioria dos pares desta base isso não se sabe, e '
      + 'neste se sabe.',
  },
  {
    id: 'amostra-enviesada',
    frase:
      'A base veio de um formulário divulgado no grupo de WhatsApp do clube: '
      + 'quem não estava lá não respondeu "não", nunca foi perguntado.',
    deOnde: 'Módulo 1',
    peso: 'limita',
    porque:
      'A conclusão vai ser usada sobre o clube, e a amostra não é o clube — é '
      + 'quem o formulário alcançou. Nenhum número da análise corrige isso.',
  },
  {
    id: 'nao-e-causa',
    frase:
      'Altura e número de acampamentos andam juntos (r = 0,62), e quem explica '
      + 'os dois é a idade.',
    deOnde: 'Módulo 3',
    peso: 'limita',
    porque:
      'É a correlação espúria da base: duas colunas que sobem juntas sem que '
      + 'uma mexa na outra. Apresentada sem este aviso, ela sugere uma causa '
      + 'que não existe.',
  },
  {
    id: 'extrapolar-mente',
    frase:
      'A reta prevê 2,58 m de altura para alguém de 25 anos — e prevê isso com '
      + 'a mesma cara de certeza com que acerta aos 13.',
    deOnde: 'Módulo 5',
    peso: 'limita',
    porque:
      'Fora do intervalo observado a reta continua respondendo e deixa de '
      + 'valer. Quem usar a conclusão para prever fora da faixa dos dados vai '
      + 'errar sem receber aviso nenhum.',
  },
  {
    id: 'r2-inflado',
    frase:
      'Excluir o valor atípico levou o r² de 0,83 para 0,94.',
    deOnde: 'Módulo 8',
    peso: 'limita',
    /*
      O difícil, e o único em que a leitura natural é a errada: o ajuste
      subiu, então parece que a análise melhorou. Ele limita, e é o mesmo
      achado que `relacao-sobrevive` olha pelo outro lado — de propósito, para
      que a pessoa veja que um resultado tem os dois.
    */
    porque:
      'O que subiu foi a confiança aparente, e não o acerto: a reta afirma '
      + 'quase a mesma coisa. Um r² mais alto conseguido excluindo gente é '
      + 'um motivo para desconfiar do r², e não para confiar na reta.',
  },
  {
    id: 'diferenca-pode-ser-acaso',
    frase:
      'A diferença entre Arara e Águia (4,71 contra 2,13 acampamentos) aparece '
      + 'só por sorteio em cerca de uma vez em sete.',
    deOnde: 'Módulo 9',
    peso: 'limita',
    porque:
      'Dois grupos de sete e oito pessoas produzem diferenças deste tamanho '
      + 'sem que nada as explique. A diferença existe e não distingue as '
      + 'unidades.',
  },
];

export const achadoDe = (id: string) => ACHADOS.find(a => a.id === id);

export const achadosQueLimitam = () => ACHADOS.filter(a => a.peso === 'limita').map(a => a.id);

/**
 * O grau que os achados sustentam.
 *
 * A conta sai da **lista**, e não de dois ids escritos à mão: achado novo
 * entra sozinho na conta, e a lista que perdesse todos os limites passaria a
 * aceitar "alta" — que é o certo, porque aí não haveria limite a declarar.
 *
 * `media` e `baixa` são as duas que uma análise com os dois lados sustenta, e
 * escolher entre elas é julgamento de quem analisou: a plataforma não tem como
 * dizer qual das duas, e fingir que tem seria a tela respondendo o requisito.
 */
export function grauCoerente(grau: GrauDeConfianca): boolean {
  const temLimite = ACHADOS.some(a => a.peso === 'limita');
  const temSustento = ACHADOS.some(a => a.peso === 'sustenta');
  if (grau === 'alta') return !temLimite;
  if (grau === 'nenhuma') return !temSustento;
  return true;
}

export const grausCoerentes = () => GRAUS.filter(g => grauCoerente(g.id)).map(g => g.id);
