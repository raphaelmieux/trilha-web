import type { NoDoEsboco } from './pythonAnalise';

/**
 * O roteiro da apresentação, escrito a partir do programa que a pessoa fez.
 *
 * ── Por que isto existe ──────────────────────────────────────────────────
 * O requisito 7 da CC002 pede um programa livre de pelo menos quarenta linhas
 * **e** apresentá-lo explicando o que cada parte faz. É o mesmo requisito
 * difícil da vereda de blocos, e pela mesma razão: escrever copiando é
 * possível, explicar copiando não é.
 *
 * A apresentação acontece fora do aplicativo, e a plataforma não tem como
 * conferi-la. O que ela pode fazer é preparar: ler a estrutura do programa e
 * dizer, em português, o que cada pedaço faz — para a pessoa treinar com o
 * **próprio** programa na frente, e não com um exemplo de outra pessoa.
 *
 * ── A estrutura vem do Python; as palavras, daqui ────────────────────────
 * Quem lê o programa é o `ast`, dentro do Pyodide, e o que ele devolve é
 * estrutura. Procurar `while` no texto acharia o `while` de dentro de uma
 * string e de um comentário — a mesma lição do validador. As frases moram
 * neste arquivo porque aqui se testam sem subir doze megabytes de Pyodide, e
 * porque é aqui que vivem as outras palavras que a plataforma diz.
 *
 * ── Ele descreve, e não julga ────────────────────────────────────────────
 * Nada aqui diz se o programa está bom. Quem faz isso é a lista de tarefas do
 * laboratório, que já cobra as estruturas e a saída. Se este texto também
 * opinasse, diria duas vezes a mesma coisa — e diria em voz de professor no
 * momento em que a pessoa acabou de vencer.
 *
 * ── Primeira pessoa, porque é para falar ─────────────────────────────────
 * "Este laço soma as notas" se lê; "eu somo as notas" se fala. O roteiro é
 * para ser dito em voz alta na frente de alguém, e é por isso que ele é
 * escrito na voz de quem vai dizê-lo.
 */

export interface TrechoDoRoteiro {
  /** O nome da parte: a função, ou o corpo do programa. */
  titulo: string;
  /**
   * Quando ela roda, como frase inteira.
   *
   * Inteira, e não um complemento: a parte que nunca roda não cabe em
   * "roda ___", e forçá-la ali sairia "roda nunca". Cada uma diz a sua.
   */
  quando: string;
  /** O que ela faz, uma frase por ideia, com dois espaços por nível. */
  faz: string[];
}

const aspas = (t: string) => `“${t}”`;

/** O nome de um módulo importado, para a frase não repetir a linha inteira. */
const nomeDoModulo = (valor: string) =>
  valor.replace(/^from\s+/, '').replace(/^import\s+/, '').split(/[\s,]/)[0] || valor;

/*
  A conversão que envolve o `input()` decide o tipo do que foi lido — e é a
  primeira armadilha de todo mundo: `input()` devolve texto, sempre, e somar
  dois textos junta em vez de somar. A frase diz isso onde acontece.
*/
const CONVERSAO: Record<string, string> = {
  int: 'como número inteiro',
  float: 'como número com casas decimais',
  str: 'como texto',
};

const ACUMULA: Record<string, (nome: string, valor: string) => string> = {
  Add: (n, v) => `somo ${v} em ${n}`,
  Sub: (n, v) => `tiro ${v} de ${n}`,
  Mult: (n, v) => `multiplico ${n} por ${v}`,
  Div: (n, v) => `divido ${n} por ${v}`,
  FloorDiv: (n, v) => `divido ${n} por ${v} e fico só com a parte inteira`,
  Mod: (n, v) => `troco ${n} pelo resto da divisão dele por ${v}`,
  Pow: (n, v) => `elevo ${n} à potência ${v}`,
};

/** A frase de um pedaço do programa, na voz de quem vai apresentá-lo. */
function frase(no: NoDoEsboco): string {
  const nome = no.nome ?? '';
  const valor = no.valor ?? '';
  switch (no.tipo) {
    case 'importa':
      return `uso um módulo pronto, o ${nomeDoModulo(valor)}, em vez de escrever aquilo de novo`;

    case 'atribuicao':
      /* Lista e dicionário vazios não são "um valor guardado": são um lugar
         aberto para pôr coisa depois, e é assim que se explicam. */
      if (valor === '[]') return `crio a lista ${nome}, ainda vazia, para ir enchendo depois`;
      if (valor === '{}') return `crio o dicionário ${nome}, ainda vazio`;
      return `guardo ${valor} em ${nome}`;

    case 'entrada': {
      const como = CONVERSAO[no.converte ?? ''] ?? '';
      const guardo = como
        ? `guardo a resposta em ${nome} ${como}`
        : `guardo a resposta em ${nome} — e ela chega como texto, porque input() sempre devolve texto`;
      return no.pergunta
        ? `pergunto ${aspas(no.pergunta.trim())} e ${guardo}`
        : `leio uma linha do que foi digitado e ${guardo}`;
    }

    case 'acumula':
      return (ACUMULA[no.op ?? ''] ?? ((n: string, v: string) => `mudo ${n} usando ${v}`))(nome, valor);

    case 'saida':
      return valor ? `mostro na tela: ${valor}` : 'pulo uma linha na tela';

    case 'chamada':
      return `chamo ${valor}`;

    case 'se':
      return `pergunto se ${no.condicao}, e só faço o que está aqui dentro quando a resposta é sim`;

    case 'para':
      return typeof no.vezes === 'number'
        ? `repito ${no.vezes} ${no.vezes === 1 ? 'vez' : 'vezes'} o que está aqui dentro`
        : `percorro ${no.sobre} um item por vez, e a cada volta ${no.alvo} é o item da vez`;

    case 'enquanto':
      return `fico repetindo enquanto ${no.condicao} for verdade — e alguma coisa aqui dentro precisa fazer isso virar falso, senão o programa não para`;

    case 'funcao':
      return `defino a função ${chamadaDa(no)}, que é um pedaço de programa com nome: ela fica guardada e só roda quando eu a chamo`;

    case 'retorno':
      return valor ? `devolvo ${valor} para quem me chamou` : 'saio da função sem devolver nada';

    case 'sai':
      return 'saio do laço na hora, sem esperar a próxima volta';

    case 'pula':
      return 'pulo para a próxima volta do laço, sem fazer o resto desta';

    case 'nada':
      return 'deixo este lugar vazio de propósito, só para o Python aceitar o bloco';

    case 'fundo':
      return '(daqui para dentro há mais programa — explique esta parte olhando o código)';

    default:
      return valor ? `faço ${valor}` : '';
  }
}

/** `media(notas)`, como se escreve ao chamar. */
const chamadaDa = (no: NoDoEsboco) => `${no.nome}(${(no.parametros ?? []).join(', ')})`;

/*
  Um nível de recuo por profundidade.

  O que está dentro de um laço é dito depois dele e recuado, porque é assim que
  se explica: "fico repetindo — e o que eu repito é isto". Sem o recuo, a lista
  vira uma sequência de passos iguais, e a pessoa diria em voz alta a coisa
  errada sobre o próprio programa.
*/
function descer(nos: NoDoEsboco[], nivel = 0): string[] {
  const saida: string[] = [];
  const recuo = (n: number) => '  '.repeat(n);

  for (const no of nos) {
    const f = frase(no);
    if (f) saida.push(recuo(nivel) + f);

    if (no.corpo) {
      saida.push(...(no.corpo.length > 0
        ? descer(no.corpo, nivel + 1)
        : [`${recuo(nivel + 1)}(ainda não há nada aqui dentro)`]));
    }

    /*
      O `elif` é um `if` dentro do `else` do anterior, e a árvore o mostra
      encaixado. Falado, ele não é encaixado: é a próxima pergunta da mesma
      série. Recuar cada `elif` um nível a mais faria uma escada de quatro
      degraus onde a pessoa vê três perguntas lado a lado.
    */
    const senao = no.senao ?? [];
    if (senao.length === 1 && senao[0].tipo === 'se') {
      const [proximo] = senao;
      saida.push(`${recuo(nivel)}senão, ${frase(proximo)}`);
      saida.push(...(proximo.corpo && proximo.corpo.length > 0
        ? descer(proximo.corpo, nivel + 1)
        : [`${recuo(nivel + 1)}(ainda não há nada aqui dentro)`]));
      /* A cauda do elif continua a mesma série, e por isso volta ao mesmo
         nível — `caudaDoSenao` cuida de quantos vierem. */
      saida.push(...caudaDoSenao(proximo, nivel));
    } else if (senao.length > 0) {
      saida.push(`${recuo(nivel)}e quando a resposta é não, faço isto:`);
      saida.push(...descer(senao, nivel + 1));
    }
  }
  return saida;
}

/** Os `elif` e o `else` que vêm depois de um `elif`, no mesmo nível. */
function caudaDoSenao(no: NoDoEsboco, nivel: number): string[] {
  const senao = no.senao ?? [];
  const recuo = '  '.repeat(nivel);
  if (senao.length === 1 && senao[0].tipo === 'se') {
    const [proximo] = senao;
    return [
      `${recuo}senão, ${frase(proximo)}`,
      ...(proximo.corpo && proximo.corpo.length > 0
        ? descer(proximo.corpo, nivel + 1)
        : [`${'  '.repeat(nivel + 1)}(ainda não há nada aqui dentro)`]),
      ...caudaDoSenao(proximo, nivel),
    ];
  }
  if (senao.length > 0) {
    return [`${recuo}e quando nenhuma das respostas é sim, faço isto:`, ...descer(senao, nivel + 1)];
  }
  return [];
}

/**
 * O roteiro inteiro: uma parte por função, e uma para o corpo do programa.
 *
 * A divisão é a que a pessoa vai usar ao apresentar — "primeiro eu defino as
 * funções, depois o programa corre de cima para baixo" —, e é a única divisão
 * que um programa em Python tem de graça. Na vereda de blocos o recorte é a
 * pilha, porque lá cada pilha tem o seu chapéu dizendo quando roda.
 */
export function roteiroDePython(esboco: NoDoEsboco[], chamadas: string[] = []): TrechoDoRoteiro[] {
  const funcoes = esboco.filter(n => n.tipo === 'funcao');
  const corpo = esboco.filter(n => n.tipo !== 'funcao');

  const trechos: TrechoDoRoteiro[] = funcoes.map(f => ({
    titulo: `A função ${chamadaDa(f)}`,
    /* Função escrita e nunca chamada não roda. Dizer isso agora evita que a
       pessoa a explique como se rodasse, na frente do examinador — é a mesma
       verdade da pilha sem chapéu, do outro lado da estante. */
    quando: chamadas.includes(f.nome ?? '')
      ? `Roda quando o programa chama ${chamadaDa(f)}.`
      : 'Nunca roda: está escrita, e nenhuma parte do programa a chama.',
    faz: descer(f.corpo ?? []),
  }));

  /* Programa sem corpo é programa que só define funções e não faz nada. Uma
     parte vazia rotulada "o programa" prometeria um trecho que não existe. */
  if (corpo.length > 0) {
    trechos.push({
      titulo: 'O programa, de cima para baixo',
      quando: 'Roda assim que eu mando executar.',
      faz: descer(corpo),
    });
  }

  return trechos;
}

/** Quantas funções estão escritas e nunca são chamadas. */
export const funcoesQueNaoRodam = (esboco: NoDoEsboco[], chamadas: string[] = []): number =>
  esboco.filter(n => n.tipo === 'funcao' && !chamadas.includes(n.nome ?? '')).length;
