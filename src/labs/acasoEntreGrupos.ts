/**
 * Por que uma diferença entre dois grupos pode ser efeito do acaso.
 *
 * É o módulo 9 da CC-ES010, e ele cobre o requisito 8 inteiro: explicar por
 * que a diferença observada pode ser do acaso, e descrever — **sem cálculo
 * formal** — três providências que aumentariam a confiança na conclusão.
 *
 * ── Sem cálculo formal, e isso é o enunciado e não uma concessão ─────────
 * Não há teste de hipótese aqui, e não vai haver. O que a pessoa faz é
 * embaralhar quem é de qual unidade e olhar uma diferença tão grande quanto a
 * real aparecer **sem que um único dado tenha mudado**. Quem viu isso
 * acontecer não precisa de valor-p para desconfiar de uma diferença entre dois
 * grupos de sete pessoas; quem só leu a definição, precisa.
 *
 * ── E por que isto não acontece na planilha ──────────────────────────────
 * Embaralhar rótulos deixando as medidas onde estão é, numa planilha,
 * **ordenar só a coluna da chave** — que é exatamente o gesto que a CC-ES003
 * existe para proibir, e que `ordenar` recusa de propósito, levando sempre a
 * linha inteira. A lição teria de ensinar o gesto errado para mostrar a coisa
 * certa. Então ela é tela da plataforma, como o módulo 1: não há botão de
 * planilha nenhuma que faça isto, e desenhar um dentro da faixa poria coisa
 * nossa dentro do programa imitado.
 */

import { CAMPO_ACAMPAMENTOS } from './baseDoAcampamento';
import { CAMPO_UNIDADE } from './formulario';

/* ── Os dois grupos, e o que se mede neles ────────────────────────────────── */

/**
 * As duas unidades que a lição compara, e a medida.
 *
 * São a Arara e a Águia porque elas têm a maior diferença de média da base — a
 * que alguém de fato levaria para a reunião — e porque têm sete e oito
 * inscritos: a diferença entre dois grupos desse tamanho é justamente a que o
 * acaso alcança sem esforço. Com duas unidades de trinta, o embaralho quase
 * nunca chegaria lá, e a lição mostraria o contrário do que ensina.
 */
export const GRUPO_A = 'Arara';
export const GRUPO_B = 'Águia';
export const CAMPO_DO_GRUPO = CAMPO_UNIDADE;
export const CAMPO_DA_MEDIDA = CAMPO_ACAMPAMENTOS;

/**
 * Quantos embaralhos um clique faz, e quantos a meta cobra.
 *
 * Um sorteio por clique ensinaria a coisa errada: ver **um** embaralho chegar
 * na diferença real diz tanto quanto ver um não chegar. O que a lição mostra é
 * uma frequência, e frequência precisa de muitos — então o clique faz uma
 * leva, e a meta pede duas levas. Uma leva só deixaria alguém ler "aconteceu"
 * ou "não aconteceu" onde o que há é "uma vez em sete".
 */
export const SORTEIOS_POR_VEZ = 25;
export const SORTEIOS_MINIMOS = 50;

/* ── O que o embaralho diz, e as três leituras erradas ────────────────────── */

export interface LeituraDoAcaso {
  id: string;
  frase: string;
  /**
   * Por que ela está certa, ou o que ela confundiu.
   *
   * `LEITURAS_DE_R`, do módulo 2, não tem este campo e não precisa: lá as
   * erradas trocam o sinal ou o tamanho de um número, e o erro se vê assim que
   * se lê a certa. Aqui não — as três erradas são frases que gente formada diz
   * sobre este tipo de número, e a pessoa que escolheu uma delas precisa saber
   * **o que** ela confundiu, e não só que errou.
   */
  porque: string;
  certa?: true;
}

export const LEITURAS_DO_ACASO: LeituraDoAcaso[] = [
  {
    id: 'o-acaso-alcanca',
    frase:
      'Uma diferença deste tamanho aparece só por sorteio, em cerca de uma vez '
      + 'em sete.',
    porque:
      'É o que o embaralho mostrou, e é só isso que ele mostra: o acaso '
      + 'alcança uma diferença assim com facilidade. Por isso esta diferença '
      + 'não serve para concluir nada sobre as duas unidades.',
    certa: true,
  },
  {
    id: 'o-acaso-explica',
    frase:
      'Então o embaralho mostrou que foi o acaso que produziu a diferença '
      + 'entre as duas unidades.',
    porque:
      'O embaralho mostra que o acaso **consegue** produzir uma diferença '
      + 'assim, e não que foi ele. Pode ter sido, pode não ter sido — o que se '
      + 'perdeu foi o direito de afirmar, e não a diferença.',
  },
  {
    id: 'chance-da-arara',
    frase: 'Então há cerca de 14% de chance de a Arara ser melhor que a Águia.',
    porque:
      'O número responde a outra pergunta. Ele é a frequência com que o '
      + '**sorteio** chega a uma diferença deste tamanho, e não a chance de '
      + 'uma unidade ser melhor que a outra. É o erro mais comum que existe '
      + 'com este tipo de número, e quem o comete fica mais confiante do que '
      + 'estava antes de calcular.',
  },
  {
    id: 'diferenca-falsa',
    frase:
      'Então o sorteio mostrou que a diferença de 2,59 acampamentos não '
      + 'existe.',
    porque:
      'Ela existe: está na base e foi medida. O que o embaralho diz é que ela '
      + 'não distingue as duas unidades — e negar o número medido é o oposto '
      + 'de desconfiar da conclusão tirada dele.',
  },
];

export const leituraDoAcasoCerta = () => LEITURAS_DO_ACASO.find(l => l.certa)!.id;

/* ── As providências ─────────────────────────────────────────────────────── */

export interface Providencia {
  id: string;
  frase: string;
  /** Por que ela aumenta a confiança, ou por que ela só parece aumentar. */
  porque: string;
  /** Exatamente três aumentam. */
  aumenta?: true;
}

/**
 * Sete providências, três que aumentam a confiança e quatro que não.
 *
 * O requisito pede **três**, então três é o que a lista tem de certo: com
 * quatro, "escolha três" passaria a ter mais de uma resposta certa e a meta
 * mediria qual trinca a pessoa adivinhou. E as quatro erradas são mais do que
 * as certas de propósito, pelo motivo das coletas do módulo 1: com metade e
 * metade, "marque todas" acerta tanto quanto "marque nenhuma".
 *
 * As erradas não são bobagens. Todas as quatro são coisas que se fazem de boa
 * fé achando que ajudam — e uma delas é o próprio módulo 8 desta vereda, que é
 * o lugar onde "tirar quem está fora da conta" aparece deixando o ajuste mais
 * bonito sem deixar a conclusão mais certa.
 */
export const PROVIDENCIAS: Providencia[] = [
  {
    id: 'mais-gente',
    frase: 'Coletar de mais gente em cada uma das duas unidades.',
    porque:
      'A diferença entre dois grupos de sete pessoas é quase toda sorteio: '
      + 'trocar duas pessoas de lado já muda a média. Entre dois grupos de '
      + 'trinta, o embaralho quase nunca alcança a diferença real — e foi '
      + 'exatamente isso que você acabou de ver acontecer.',
    aumenta: true,
  },
  {
    id: 'repetir-a-coleta',
    frase: 'Repetir a coleta noutra ocasião e ver se a diferença aparece de novo.',
    porque:
      'O acaso não repete o mesmo resultado de propósito. Uma diferença que '
      + 'reaparece numa segunda coleta é uma diferença que não era do dia.',
    aumenta: true,
  },
  {
    id: 'decidir-antes',
    frase: 'Decidir qual comparação fazer **antes** de olhar os dados.',
    porque:
      'Escolher o par depois de ver qual deu a maior diferença é achar o acaso '
      + 'de propósito: entre oito unidades há vinte e oito pares, e alguma '
      + 'dupla vai ter uma diferença grande por sorteio. Quem decide antes '
      + 'responde à pergunta que tinha, e não à que os dados ofereceram.',
    aumenta: true,
  },
  {
    id: 'tirar-os-de-fora',
    frase: 'Tirar da conta quem está muito fora dela.',
    porque:
      'É o módulo 8 desta vereda: tirar o valor atípico deixou o r² subir de '
      + '0,83 para 0,94 sem mudar o que a reta afirma. Excluir faz a conclusão '
      + 'parecer mais certa, e não ficar mais certa — aqui ela faria a '
      + 'diferença entre as unidades parecer mais limpa pelo mesmo motivo.',
  },
  {
    id: 'comparar-mais-pares',
    frase: 'Comparar mais unidades, até uma diferença ficar bem clara.',
    porque:
      'Procurar até achar é a forma mais rápida de achar acaso. Quanto mais '
      + 'pares você olha, maior a chance de um deles mostrar uma diferença '
      + 'grande sem que nada a explique — e é o contrário de decidir antes o '
      + 'que comparar.',
  },
  {
    id: 'refazer-a-conta',
    frase: 'Refazer a conta na planilha para conferir se dá o mesmo número.',
    porque:
      'Conferir a aritmética é certo e não é isto: ela já estava certa. O que '
      + 'está em dúvida não é se a média é 4,71 — é se 4,71 contra 2,13 diz '
      + 'algo sobre as duas unidades. Refazer a conta responde a pergunta que '
      + 'não foi feita, e sai de lá com a sensação de ter conferido.',
  },
  {
    id: 'mais-casas',
    frase: 'Escrever o resultado com mais casas decimais.',
    porque:
      'Precisão do número não é confiança na conclusão. Escrever 2,5893 em vez '
      + 'de 2,59 não acrescenta um único dado — só faz a diferença parecer '
      + 'medida com mais cuidado do que foi.',
  },
];

export const providenciasQueAumentam = () => PROVIDENCIAS.filter(p => p.aumenta).map(p => p.id);

export const providenciaDe = (id: string) => PROVIDENCIAS.find(p => p.id === id);
