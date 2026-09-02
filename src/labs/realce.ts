/*
 * O realce de sintaxe do editor de código.
 *
 * Mora aqui, em regra pura, por dois motivos. O primeiro é o de sempre: dá
 * para testar sem montar tela. O segundo é mais sério — o resultado desta
 * função vai para a página como HTML, por cima do que o desbravador digitou.
 * Se um `<` escapar sem virar `&lt;`, o que ele escreveu deixa de ser texto e
 * passa a ser marcação da plataforma.
 *
 * Daí a forma do código abaixo: **nada** é copiado direto para a saída. Todo
 * pedaço de texto passa por `escapar` antes de ser emitido, sem exceção, e as
 * únicas tags que saem daqui são os `<span>` que este arquivo escreve.
 */

/** As cores do editor, uma classe por tipo de coisa. */
export type Cor = 'tag' | 'attr' | 'val' | 'com' | 'pon' | 'txt';

const ESCAPES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

export const escapar = (t: string) => t.replace(/[&<>"']/g, c => ESCAPES[c]);

/*
 * Um pedaço colorido — e um `<span>` por linha, nunca um atravessando duas.
 *
 * A quebra importa porque quem monta a tela precisa de cada linha como um
 * texto fechado em si: é assim que a régua da esquerda consegue ter uma faixa
 * por linha lógica. Como a saída é uma sequência plana de `<span>` — nenhum
 * dentro de outro —, cortar nos `\n` devolve HTML equilibrado em cada pedaço.
 * Os `\n` ficam de fora dos spans, no nível de cima, que é onde o corte é
 * seguro.
 */
const pinta = (cor: Cor, texto: string) => texto
  ? texto
    .split('\n')
    .map(t => (t ? `<span class="ide-${cor}">${escapar(t)}</span>` : ''))
    .join('\n')
  : '';

/**
 * Divide o miolo de uma tag em nome, atributos e valores.
 *
 * Aceita atributo sem valor (`<input required>`), valor entre aspas simples ou
 * duplas, e valor sem aspas — as três formas que aparecem em HTML escrito à
 * mão, que é o que este editor recebe.
 */
function pintarMiolo(miolo: string): string {
  let saida = '';
  let i = 0;

  /* O nome da tag: tudo até o primeiro espaço. */
  const nome = /^\/?[A-Za-z][\w:-]*/.exec(miolo);
  if (nome) {
    saida += pinta('tag', nome[0]);
    i = nome[0].length;
  }

  while (i < miolo.length) {
    const resto = miolo.slice(i);

    const branco = /^\s+/.exec(resto);
    if (branco) { saida += escapar(branco[0]); i += branco[0].length; continue; }

    const atributo = /^[\w:@.-]+/.exec(resto);
    if (atributo) {
      saida += pinta('attr', atributo[0]);
      i += atributo[0].length;
      continue;
    }

    if (resto[0] === '=') {
      saida += pinta('pon', '=');
      i += 1;
      const depois = miolo.slice(i);
      const valor = /^\s*("[^"]*"?|'[^']*'?|[^\s>]+)/.exec(depois);
      if (valor) {
        const espaco = /^\s*/.exec(valor[0])![0];
        saida += escapar(espaco) + pinta('val', valor[0].slice(espaco.length));
        i += valor[0].length;
      }
      continue;
    }

    /* Qualquer outra coisa — uma barra de fechamento, um caractere solto. */
    saida += pinta('pon', resto[0]);
    i += 1;
  }

  return saida;
}

/**
 * Devolve o código com `<span>` de cor em volta de cada pedaço, **uma entrada
 * por linha do original**.
 *
 * O que entra é texto puro; o que sai é HTML seguro para pôr na página. O
 * vetor tem exatamente `contarLinhas(codigo)` posições, e a de índice `i` é a
 * linha `i + 1` — é essa correspondência que segura o número da régua ao lado
 * do código certo, mesmo quando a linha quebra em três na tela do celular.
 */
export function realcarLinhas(codigo: string): string[] {
  let saida = '';
  let i = 0;

  while (i < codigo.length) {
    const abre = codigo.indexOf('<', i);

    if (abre === -1) { saida += pinta('txt', codigo.slice(i)); break; }
    if (abre > i) saida += pinta('txt', codigo.slice(i, abre));

    /* Comentário: vai inteiro, verde, até o fecha — ou até o fim do arquivo,
       porque comentário aberto e não fechado é exatamente o que se está
       escrevendo enquanto se digita. */
    if (codigo.startsWith('<!--', abre)) {
      const fim = codigo.indexOf('-->', abre + 4);
      const ate = fim === -1 ? codigo.length : fim + 3;
      saida += pinta('com', codigo.slice(abre, ate));
      i = ate;
      continue;
    }

    const fecha = codigo.indexOf('>', abre);
    if (fecha === -1) {
      /* Tag ainda sendo digitada: pinta o que já existe e para. */
      saida += pinta('pon', '<') + pintarMiolo(codigo.slice(abre + 1));
      break;
    }

    saida += pinta('pon', '<') + pintarMiolo(codigo.slice(abre + 1, fecha)) + pinta('pon', '>');
    i = fecha + 1;
  }

  return saida.split('\n');
}

/** Quantas linhas o código tem — a régua da esquerda vem daqui. */
export const contarLinhas = (codigo: string) => codigo.split('\n').length;

/**
 * O mesmo realce, para uma folha de estilo.
 *
 * O editor é o mesmo dos laboratórios de HTML — o arranjo se repete, e é ele
 * que se reconhece num editor de verdade. O que não se pode repetir é a
 * coloração: pintar CSS com as regras do HTML deixa o arquivo inteiro de uma
 * cor só, e a cor é justamente o que ensina a distinguir seletor de
 * propriedade enquanto se digita.
 *
 * Reaproveita `pinta`, então vale aqui a mesma garantia: nenhum `<span>`
 * atravessa duas linhas, e a régua continua alinhada.
 *
 * As cores seguem o sentido que já existe: `com` para comentário, `tag` para o
 * seletor, `attr` para a propriedade, `val` para o valor, `pon` para a
 * pontuação. Não há vocabulário novo a aprender.
 */
export function realcarLinhasCss(codigo: string): string[] {
  let saida = '';
  let i = 0;
  /* Dentro das chaves lê-se propriedade e valor; fora delas, seletor. É a
     única distinção que o realce precisa fazer. */
  let dentro = false;

  while (i < codigo.length) {
    const resto = codigo.slice(i);

    /* Comentário primeiro, e antes de tudo: ele pode conter chave, dois-pontos
       e ponto e vírgula, e nada disso vale enquanto ele não fechar. */
    if (resto.startsWith('/*')) {
      const fim = codigo.indexOf('*/', i + 2);
      const ate = fim === -1 ? codigo.length : fim + 2;
      saida += pinta('com', codigo.slice(i, ate));
      i = ate;
      continue;
    }

    const c = resto[0];

    if (c === '{') { saida += pinta('pon', '{'); dentro = true; i += 1; continue; }
    if (c === '}') { saida += pinta('pon', '}'); dentro = false; i += 1; continue; }

    if (!dentro) {
      /* O seletor vai até a chave, o comentário ou o fim. */
      const ate = Math.min(
        ...[codigo.indexOf('{', i), codigo.indexOf('/*', i)]
          .filter(n => n !== -1)
          .concat(codigo.length),
      );
      saida += pinta('tag', codigo.slice(i, ate));
      i = ate;
      continue;
    }

    /* Dentro: nome da propriedade até os dois-pontos, valor até o ponto e
       vírgula ou a chave de fechar. */
    const prop = /^[\s]*[-\w]+(?=\s*:)/.exec(resto);
    if (prop) { saida += pinta('attr', prop[0]); i += prop[0].length; continue; }

    if (c === ':') {
      saida += pinta('pon', ':');
      i += 1;
      const valor = /^[^;}]*/.exec(codigo.slice(i));
      if (valor && valor[0]) { saida += pinta('val', valor[0]); i += valor[0].length; }
      continue;
    }

    saida += pinta('pon', c);
    i += 1;
  }

  return saida.split('\n');
}
