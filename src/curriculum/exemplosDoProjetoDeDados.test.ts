import { describe, expect, it } from 'vitest';
import { MODULOS_DO_PROJETO_DE_DADOS } from './projetoDeDados';
import { QUESTOES_DO_PROJETO_DE_DADOS } from './questoesDoProjetoDeDados';
import type { TopicoDeVereda } from './veredas';
import {
  CORRELACAO_ESPERADA, LICOES_DA_CC_ES013, MEDIDAS, esperadoDaMedida, esperadoDoGrupo,
} from '../labs/metasDaCcEs013';
import {
  INDICE, MEMBROS, MODOS, linhasBrutas, type Modo,
} from '../labs/chamadaDoClube';
import { abaTratada, linhasDa, MINIMO_DE_REGISTROS } from '../labs/projetoDeDados';
import { mostrarNumero, numeroDoTexto } from '../labs/formulas';

/*
  Os números que a teoria e as questões da CC-ES013 citam, conferidos contra a
  base.

  É a trava de `exemplosDaAnalise.test.ts`, pelo motivo escrito lá: escrever
  de cabeça o que uma conta devolve erra por pouco e com frequência, nada
  estoura, e quem confere a própria planilha contra uma lição errada conclui
  que a planilha dele é que está errada. A **conta** se declara aqui, e a
  **afirmação** se lê da lição — o número que o desbravador lê nunca é o que o
  teste escreveu.

  E as duas formas de número continuam as de lá: onde o número é resultado que
  se compara com a tela, a forma é a da plataforma, `mostrarNumero`; onde ele
  só se lê na prosa, é a da prosa.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DO_PROJETO_DE_DADOS.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo, t.atencao ?? ''].join('\n');
}

/** Tudo o que uma questão escreve: enunciado, alternativas, os porquês e a explicação. */
function textoDaQuestao(id: string): string {
  for (const qs of Object.values(QUESTOES_DO_PROJETO_DE_DADOS)) {
    const q = qs.find(x => x.id === id);
    if (q) return [q.prompt, ...(q.data.options ?? []).flatMap(o => [o.text, o.porque ?? '']), q.explanation ?? ''].join('\n');
  }
  throw new Error(`A questão ${id} sumiu da vereda.`);
}

/*
  Só a prosa do tópico, sem o exemplo. O mesmo número costuma aparecer nos
  dois — no parágrafo e na tabela embaixo —, e a busca no texto inteiro
  aprovaria o parágrafo errado enquanto a tabela estivesse certa.
*/
function prosaDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return t.explicacao.join('\n');
}

const tela = (n: number) => mostrarNumero(n);
const grupo = (m: Modo) => esperadoDoGrupo(m);
const daMedida = (i: number) => tela(esperadoDaMedida(MEDIDAS[i]));

/** A média da distância que a bruta dá, com o 1.250 dentro e o texto de fora. */
const mediaDaBruta = () => {
  const lidas = linhasBrutas().flatMap(l => {
    const n = numeroDoTexto(l[INDICE.distancia]);
    return n === null ? [] : [n];
  });
  return lidas.reduce((s, x) => s + x, 0) / lidas.length;
};

/** A coluna da distância da tratada como a lição 4 a recebe: preenchidas e números. */
const distanciaNaLicao4 = () => {
  const t = abaTratada(LICOES_DA_CC_ES013.numeros.projeto.caderno)!;
  const preenchidas = linhasDa(t).map(v => v.distancia).filter(x => x !== '');
  return { preenchidas: preenchidas.length, numeros: preenchidas.filter(x => numeroDoTexto(x) !== null).length };
};

const comQuestionario = MEMBROS.filter(m => m.modo !== null).length;
const semQuestionario = MEMBROS.length - comQuestionario;

/*
  Cada afirmação: onde ela mora, e o texto que precisa aparecer lá — escrito a
  partir da conta, e nunca à mão.
*/
const AFIRMACOES: { onde: string; texto: () => string; deve: () => string }[] = [
  /* As medidas, no tópico e nas questões que as citam. */
  ...[0, 1, 2, 3, 4].map(i => ({ onde: 'medidas-sobre-a-tratada', texto: () => textoDoTopico('medidas-sobre-a-tratada'), deve: () => daMedida(i) })),
  { onde: 'media-ou-mediana', texto: () => textoDoTopico('media-ou-mediana'), deve: () => `${daMedida(3)} km` },
  { onde: 'media-ou-mediana', texto: () => textoDoTopico('media-ou-mediana'), deve: () => `${daMedida(4)} km` },
  { onde: 'media-ou-mediana (prosa)', texto: () => prosaDoTopico('media-ou-mediana'), deve: () => `distância média é **${daMedida(3)} km**, e a mediana é **${daMedida(4)} km**` },
  { onde: 'media-ou-mediana (presença)', texto: () => textoDoTopico('media-ou-mediana'), deve: () => `${daMedida(0)} e ${daMedida(1)}` },
  { onde: 'ES13-M5-Q4', texto: () => textoDaQuestao('ES13-M5-Q4'), deve: () => `${daMedida(3)} km e a mediana é ${daMedida(4)} km` },
  { onde: 'ES13-M5-Q5', texto: () => textoDaQuestao('ES13-M5-Q5'), deve: () => `média ${daMedida(0)} e a mediana ${daMedida(1)}` },
  { onde: 'ES13-M5-Q2', texto: () => textoDaQuestao('ES13-M5-Q2'), deve: () => `${daMedida(1)} na tratada` },

  /* Os grupos: a tabela inteira do tópico, linha por linha. */
  ...MODOS.map(m => ({
    onde: `a-media-de-cada-grupo (${m})`,
    texto: () => textoDoTopico('a-media-de-cada-grupo'),
    deve: () => `${String(grupo(m).quantos).padStart(2, ' ')}`,
  })),
  ...MODOS.flatMap(m => [
    { onde: `a-media-de-cada-grupo (${m}, presença)`, texto: () => textoDoTopico('a-media-de-cada-grupo'), deve: () => tela(grupo(m).presencas) },
    { onde: `a-media-de-cada-grupo (${m}, distância)`, texto: () => textoDoTopico('a-media-de-cada-grupo'), deve: () => tela(grupo(m).distancia) },
  ]),
  { onde: 'a-media-de-cada-grupo (soma)', texto: () => textoDoTopico('a-media-de-cada-grupo'), deve: () => `somam ${comQuestionario}` },
  ...(['Carona', 'Ônibus'] as Modo[]).flatMap(m => [
    { onde: `o-que-a-comparacao-mostra (${m})`, texto: () => textoDoTopico('o-que-a-comparacao-mostra'), deve: () => `${tela(grupo(m).distancia)} km` },
    { onde: `o-que-a-comparacao-mostra (${m})`, texto: () => textoDoTopico('o-que-a-comparacao-mostra'), deve: () => tela(grupo(m).presencas) },
    { onde: `ES13-M6-Q2 (${m})`, texto: () => textoDaQuestao('ES13-M6-Q2'), deve: () => tela(grupo(m).presencas) },
    { onde: `ES13-M6-Q2 (${m}, km)`, texto: () => textoDaQuestao('ES13-M6-Q2'), deve: () => tela(grupo(m).distancia) },
    { onde: `ES13-M6-Q7 (${m})`, texto: () => textoDaQuestao('ES13-M6-Q7'), deve: () => tela(grupo(m).presencas) },
  ]),
  ...(['Carona', 'Ônibus'] as Modo[]).flatMap(m => [
    { onde: `o-que-a-comparacao-mostra (prosa, ${m})`, texto: () => prosaDoTopico('o-que-a-comparacao-mostra'), deve: () => `**${tela(grupo(m).distancia)} km**` },
    { onde: `o-que-a-comparacao-mostra (prosa, ${m})`, texto: () => prosaDoTopico('o-que-a-comparacao-mostra'), deve: () => `**${tela(grupo(m).presencas)}**` },
  ]),
  { onde: 'medidas-sobre-a-tratada (prosa)', texto: () => prosaDoTopico('medidas-sobre-a-tratada'), deve: () => `**${daMedida(0)}** reuniões de 20, a mediana é **${daMedida(1)}**, e o desvio padrão é **${daMedida(2)}**` },
  { onde: 'o-que-a-comparacao-mostra (bicicleta)', texto: () => textoDoTopico('o-que-a-comparacao-mostra'), deve: () => (grupo('Bicicleta').quantos === 4 ? 'quatro pessoas' : '?') },
  { onde: 'ES13-M6-Q4', texto: () => textoDaQuestao('ES13-M6-Q4'), deve: () => `somam ${comQuestionario} pessoas, e o clube tem ${MEMBROS.length}` },
  { onde: 'ES13-M9-Q4 (ônibus)', texto: () => textoDaQuestao('ES13-M9-Q4'), deve: () => (grupo('Ônibus').quantos === 20 ? 'vinte' : '?') },
  { onde: 'ES13-M9-Q3', texto: () => textoDaQuestao('ES13-M9-Q3'), deve: () => `${tela(grupo('Ônibus').presencas)} de 20` },

  /* A correlação. */
  ...['a-dispersao-da-base-inteira', 'o-que-a-relacao-nao-prova'].map(id => ({
    onde: id, texto: () => textoDoTopico(id), deve: () => tela(CORRELACAO_ESPERADA()),
  })),
  { onde: 'ES13-M7-Q3', texto: () => textoDaQuestao('ES13-M7-Q3'), deve: () => tela(CORRELACAO_ESPERADA()) },
  { onde: 'ES13-M9-Q4 (r)', texto: () => textoDaQuestao('ES13-M9-Q4'), deve: () => tela(CORRELACAO_ESPERADA()) },
  { onde: 'a-dispersao-da-base-inteira (pontos)', texto: () => textoDoTopico('a-dispersao-da-base-inteira'), deve: () => `${comQuestionario} pontos` },
  { onde: 'ES13-M7-Q2', texto: () => textoDaQuestao('ES13-M7-Q2'), deve: () => `${MEMBROS.length} pessoas, e a dispersão mostra ${comQuestionario} pontos` },

  /* O tamanho da base, e o que excluir faria com ela. */
  { onde: 'a-ausencia', texto: () => textoDoTopico('a-ausencia'), deve: () => `de ${MEMBROS.length} para ${MEMBROS.length - semQuestionario}` },
  { onde: 'ES13-M4-Q5', texto: () => textoDaQuestao('ES13-M4-Q5'), deve: () => `${MEMBROS.length - semQuestionario}, abaixo de ${MINIMO_DE_REGISTROS}` },
  { onde: 'a-base-que-responde', texto: () => textoDoTopico('a-base-que-responde'), deve: () => `${linhasBrutas().length} registros, 6 campos` },
  { onde: 'a-linha-repetida', texto: () => textoDoTopico('a-linha-repetida'), deve: () => `${MEMBROS.length} valores exclusivos` },

  /* O 1.250, e a régua do Excel na lição 4. */
  { onde: 'valor-impossivel', texto: () => textoDoTopico('valor-impossivel'), deve: () => `perto de ${Math.round(mediaDaBruta())}` },
  { onde: 'medidas-sobre-a-tratada (bruta)', texto: () => textoDoTopico('medidas-sobre-a-tratada'), deve: () => `perto de ${Math.round(mediaDaBruta())}` },
  { onde: 'ES13-M4-Q2', texto: () => textoDaQuestao('ES13-M4-Q2'), deve: () => `Contagem ${distanciaNaLicao4().preenchidas}, e a Média leva só ${distanciaNaLicao4().numeros}` },
];

describe('os números da CC-ES013 saem da base', () => {
  it('a tabela de afirmações tem o tamanho que cobre a vereda', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(40);
  });

  it.each(AFIRMACOES.map((a, i) => [i, a.onde, a] as const))('%i: %s', (_i, onde, a) => {
    expect(a.texto(), `${onde} devia dizer "${a.deve()}"`).toContain(a.deve());
  });
});
