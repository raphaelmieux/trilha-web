/**
 * Lê um exemplo escrito em blocos e diz que forma e que cor cada linha tem.
 *
 * ── Por que isto existe ──────────────────────────────────────────────────
 * Os exemplos da CC001 nunca foram HTML. Uns são algoritmos em português —
 * trocar o pneu da bicicleta, em seis passos —, e vários são pilhas de blocos,
 * escritas assim:
 *
 *     [quando a bandeira verde for clicada]
 *       [vá para x: -120 y: 0]
 *       [diga "vamos!"]
 *
 * Tudo isso passava pelo realce de HTML, que não acha tag nenhuma e não pinta
 * nada, e ia parar num quadro rotulado "o navegador mostra", que exibia o texto
 * como parágrafo. Duas mentiras na mesma tela: um realce que não significa
 * nada, e um navegador que não existe nesta história.
 *
 * ── A cor não é enfeite ──────────────────────────────────────────────────
 * No Scratch, a cor **é** a categoria: quem procura o bloco de mover procura o
 * azul, e quem procura o de repetir procura o laranja. Um exemplo pintado de
 * outra cor ensinaria a procurar na gaveta errada, e a pessoa perderia o tempo
 * dela na paleta de verdade. Por isso as cores aqui são as do Scratch, e por
 * isso o bloco que não se reconhece sai cinza em vez de sair de qualquer cor:
 * cinza diz "não sei", e uma cor errada diz uma coisa falsa.
 */

/** As categorias do Scratch que aparecem nesta vereda. */
export type Categoria =
  | 'eventos' | 'movimento' | 'aparencia' | 'som'
  | 'controle' | 'sensores' | 'operadores' | 'variaveis' | 'desconhecida';

/** As cores da paleta do Scratch, como elas são lá. */
export const COR_DA_CATEGORIA: Record<Categoria, string> = {
  eventos: '#FFBF00',
  movimento: '#4C97FF',
  aparencia: '#9966FF',
  som: '#CF63CF',
  controle: '#FFAB19',
  sensores: '#5CB1D6',
  operadores: '#59C059',
  variaveis: '#FF8C1A',
  /* Cinza é resposta, e não descuido: ver o cabeçalho. */
  desconhecida: '#7A7A85',
};

/*
  De que categoria é um bloco, pelo que ele diz.

  A ordem importa: "mude x para 0" é Movimento e "mude placar para 0" é
  Variáveis, e as duas começam igual. Por isso o que é específico vem antes do
  que é genérico, e a lista é de começos de frase, e não de palavras soltas —
  procurar a palavra "som" acharia "sonho".
*/
const INICIOS: [Categoria, string[]][] = [
  ['eventos', ['quando ']],
  ['controle', ['sempre', 'repita', 'se ', 'senão', 'espere', 'pare ', 'crie clone', 'apague este clone']],
  ['sensores', ['tocando', 'pergunte', 'resposta', 'tecla ', 'distancia', 'distância']],
  ['operadores', ['junte', 'letra ', 'tamanho de', 'contém', 'resto', 'arredonde', 'sorteie']],
  ['movimento', [
    'mova ', 'vá para', 'gire ', 'deslize', 'aponte', 'se tocar na borda',
    'mude x', 'mude y', 'adicione * a x', 'adicione * a y', 'defina o estilo de rotação',
    'posição x', 'posição y', 'direção',
  ]],
  ['aparencia', [
    'diga', 'pense', 'próxima fantasia', 'mude para a fantasia', 'próximo cenário',
    'mude para o cenário', 'mostre', 'esconda', 'mude o tamanho', 'defina o tamanho',
    'mude o efeito', 'remova os efeitos', 'vá para a camada',
  ]],
  ['som', ['toque o som', 'toque até o fim', 'pare todos os sons', 'mude o volume', 'defina o volume']],
  ['variaveis', ['mude ', 'defina ', 'adicione ', 'some ', 'placar', 'crie uma variável']],
];

/** Normaliza para comparar: sem acento, minúsculo, espaços colapsados. */
const chave = (t: string) => t
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

/*
  `adicione 10 a x` e `adicione 1 a placar` são categorias diferentes, e o que
  as separa é o que vem depois do número. O `*` nos começos acima é o buraco
  onde o número cabe.
*/
const comeca = (texto: string, inicio: string): boolean => {
  const t = chave(texto);
  const i = chave(inicio);
  if (!i.includes('*')) return t.startsWith(i);
  const [antes, depois] = i.split('*');
  return t.startsWith(antes.trim()) && t.includes(depois.trim());
};

export function categoriaDoBloco(texto: string): Categoria {
  for (const [categoria, inicios] of INICIOS) {
    if (inicios.some(i => comeca(texto, i))) return categoria;
  }
  return 'desconhecida';
}

/** Um chapéu abre a pilha, e no Scratch tem o topo arredondado. */
export const ehChapeu = (texto: string) => chave(texto).startsWith('quando ');

/** Uma linha do exemplo: ou um bloco, ou uma linha de texto entre eles. */
export type LinhaDoExemplo =
  | { tipo: 'bloco'; texto: string; recuo: number; categoria: Categoria; chapeu: boolean }
  | { tipo: 'texto'; texto: string }
  | { tipo: 'vazia' };

/**
 * Lê o exemplo linha a linha.
 *
 * Linha entre colchetes é bloco; o recuo dela diz o aninhamento, como no
 * próprio código-fonte da lição. Qualquer outra linha é texto — os exemplos
 * misturam as duas coisas de propósito, porque vários deles comparam ("no Logo,
 * digitado: … / em blocos, encaixado: …") e a comparação é a lição.
 */
export function lerExemploDeBlocos(exemplo: string): LinhaDoExemplo[] {
  return exemplo.replace(/\r/g, '').split('\n').map(linha => {
    if (linha.trim() === '') return { tipo: 'vazia' as const };
    /* Sem colchete dentro: uma linha com duas pilhas lado a lado casava do
       primeiro `[` ao último `]` e virava um bloco só, com o texto das duas
       misturado. Agora ela não casa, cai como texto, e a trava abaixo a
       encontra em vez de deixá-la passar desenhada errado. */
    const bloco = linha.match(/^(\s*)\[([^[\]]+)\]\s*$/);
    if (!bloco) return { tipo: 'texto' as const, texto: linha.trim() };
    const texto = bloco[2].trim();
    return {
      tipo: 'bloco' as const,
      texto,
      /* Dois espaços por nível, que é como as lições estão escritas. */
      recuo: Math.floor(bloco[1].replace(/\t/g, '  ').length / 2),
      categoria: categoriaDoBloco(texto),
      chapeu: ehChapeu(texto),
    };
  });
}

/** O exemplo tem ao menos um bloco? É o que decide se ele se desenha assim. */
export const temBloco = (exemplo: string) =>
  lerExemploDeBlocos(exemplo).some(l => l.tipo === 'bloco');
