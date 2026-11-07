import { describe, expect, it } from 'vitest';
import { MODULOS_DO_PROJETO_DE_DADOS } from './projetoDeDados';
import { QUESTOES_DO_PROJETO_DE_DADOS } from './questoesDoProjetoDeDados';
import type { TopicoDeVereda } from './veredas';
import {
  CORRELACAO_ESPERADA, LICOES_DA_CC_ES013, MEDIDAS, esperadoDaMedida, esperadoDoGrupo,
} from '../labs/metasDaCcEs013';
import {
  MEMBROS, type Modo,
} from '../labs/chamadaDoClube';
import { abaTratada, linhasDa, MINIMO_DE_REGISTROS } from '../labs/projetoDeDados';
import { mostrar, mostrarNumero, numeroDoTexto } from '../labs/formulas';
import { contaDaSelecao, planilhaPorNome, valorCalculado, type Caderno } from '../labs/planilha';
import {
  DEFEITOS_DO_SONO, GRUPOS, RESPONDENTES, cadernoDoSono, linhasBrutasDoSono, type EstadoDoSono,
} from '../exemplos/telaESono';

/*
  Os números que a teoria e as questões da CC-ES013 citam, conferidos contra a
  base de onde eles saem.

  As **questões** falam da chamada do semestre, que é a base do laboratório, e
  são conferidas contra ela. A **teoria** fala da base do tempo de tela e do
  sono (`src/exemplos/telaESono.ts`), que é a que as telas fotografam: os
  números da chamada são as respostas das lições, e a teoria que os citasse
  entregaria o gabarito. A última parte reprova se a teoria voltar a citá-los.

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
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

/** Tudo o que uma questão escreve: enunciado, alternativas, os porquês e a explicação. */
function textoDaQuestao(id: string): string {
  for (const qs of Object.values(QUESTOES_DO_PROJETO_DE_DADOS)) {
    const q = qs.find(x => x.id === id);
    if (q) return [q.prompt, ...(q.data.options ?? []).flatMap(o => [o.text, o.porque ?? '']), q.explanation ?? ''].join('\n');
  }
  throw new Error(`A questão ${id} sumiu da vereda.`);
}

const tela = (n: number) => mostrarNumero(n);
const grupo = (m: Modo) => esperadoDoGrupo(m);
const daMedida = (i: number) => tela(esperadoDaMedida(MEDIDAS[i]));

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
  /* As medidas. */
  { onde: 'ES13-M5-Q4', texto: () => textoDaQuestao('ES13-M5-Q4'), deve: () => `${daMedida(3)} km e a mediana é ${daMedida(4)} km` },
  { onde: 'ES13-M5-Q5', texto: () => textoDaQuestao('ES13-M5-Q5'), deve: () => `média ${daMedida(0)} e a mediana ${daMedida(1)}` },
  { onde: 'ES13-M5-Q2', texto: () => textoDaQuestao('ES13-M5-Q2'), deve: () => `${daMedida(1)} na tratada` },

  /* Os grupos. */
  ...(['Carona', 'Ônibus'] as Modo[]).flatMap(m => [
    { onde: `ES13-M6-Q2 (${m})`, texto: () => textoDaQuestao('ES13-M6-Q2'), deve: () => tela(grupo(m).presencas) },
    { onde: `ES13-M6-Q2 (${m}, km)`, texto: () => textoDaQuestao('ES13-M6-Q2'), deve: () => tela(grupo(m).distancia) },
    { onde: `ES13-M6-Q7 (${m})`, texto: () => textoDaQuestao('ES13-M6-Q7'), deve: () => tela(grupo(m).presencas) },
  ]),
  { onde: 'ES13-M6-Q4', texto: () => textoDaQuestao('ES13-M6-Q4'), deve: () => `somam ${comQuestionario} pessoas, e o clube tem ${MEMBROS.length}` },
  { onde: 'ES13-M9-Q4 (ônibus)', texto: () => textoDaQuestao('ES13-M9-Q4'), deve: () => (grupo('Ônibus').quantos === 20 ? 'vinte' : '?') },
  { onde: 'ES13-M9-Q3', texto: () => textoDaQuestao('ES13-M9-Q3'), deve: () => `${tela(grupo('Ônibus').presencas)} de 20` },

  /* A correlação. */
  { onde: 'ES13-M7-Q3', texto: () => textoDaQuestao('ES13-M7-Q3'), deve: () => tela(CORRELACAO_ESPERADA()) },
  { onde: 'ES13-M9-Q4 (r)', texto: () => textoDaQuestao('ES13-M9-Q4'), deve: () => tela(CORRELACAO_ESPERADA()) },
  { onde: 'ES13-M7-Q2', texto: () => textoDaQuestao('ES13-M7-Q2'), deve: () => `${MEMBROS.length} pessoas, e a dispersão mostra ${comQuestionario} pontos` },

  /* O tamanho da base, e o que excluir faria com ela. */
  { onde: 'ES13-M4-Q5', texto: () => textoDaQuestao('ES13-M4-Q5'), deve: () => `${MEMBROS.length - semQuestionario}, abaixo de ${MINIMO_DE_REGISTROS}` },

  /* A régua do Excel na lição 4. */
  { onde: 'ES13-M4-Q2', texto: () => textoDaQuestao('ES13-M4-Q2'), deve: () => `Contagem ${distanciaNaLicao4().preenchidas}, e a Média leva só ${distanciaNaLicao4().numeros}` },
];

describe('os números das questões da CC-ES013 saem da chamada do laboratório', () => {
  it('a tabela de afirmações tem o tamanho que cobre as questões', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(15);
  });

  it.each(AFIRMACOES.map((a, i) => [i, a.onde, a] as const))('%i: %s', (_i, onde, a) => {
    expect(a.texto(), `${onde} devia dizer "${a.deve()}"`).toContain(a.deve());
  });
});

/* ── A teoria: a base do tempo de tela e do sono ─────────────────────────── */

const naAba = (cad: Caderno, nome: string) => planilhaPorNome(cad, nome)!;
/** Escreve as fórmulas na aba e devolve o que cada célula mostra. */
const conta = (cad: Caderno, aba: string, formulas: [number, number, string][]) => {
  let p = naAba(cad, aba);
  for (const [l, c, f] of formulas) {
    p = { ...p, celulas: p.celulas.map((linha, i) => (i === l ? linha.map((x, j) => (j === c ? { ...x, texto: f } : x)) : linha)) };
  }
  const k = { ...cad, planilhas: cad.planilhas.map(q => (q.nome === aba ? p : q)) };
  return (l: number, c: number) => mostrar(valorCalculado(p, l, c, k));
};
const FX = (c: string, abs = false) => (abs ? `Tratada!$${c}$2:$${c}$63` : `Tratada!${c}2:${c}63`);
const caderno = (estado: EstadoDoSono) => cadernoDoSono(estado);

describe('as telas da CC-ES013 contam a base do sono que fotografam', () => {
  it('onze tópicos ensinam um gesto, e os da proposta, da conclusão e da apresentação ficam em prosa', () => {
    expect(topicos().filter(t => t.telas?.length)).toHaveLength(11);
    for (const id of ['a-pergunta-antes-do-dado', 'origem-e-data', 'tres-partes-duas-paginas', 'dez-minutos-para-quem-decide']) {
      expect(topicos().find(t => t.id === id)?.telas).toBeUndefined();
    }
    expect(topicos().some(t => t.exemplo)).toBe(false);
  });

  it('as seis medidas da tratada', () => {
    const v = conta(caderno('calculos'), 'Cálculos', [
      [1, 1, `=MÉDIA(${FX('E')})`], [2, 1, `=MED(${FX('E')})`], [3, 1, `=DESVPADP(${FX('E')})`],
      [4, 1, `=MÉDIA(${FX('F')})`], [5, 1, `=MED(${FX('F')})`], [6, 1, `=DESVPADP(${FX('F')})`],
    ]);
    expect([1, 2, 3, 4, 5, 6].map(l => v(l, 1))).toEqual(['3,87', '3,50', '1,84', '8,41', '8,50', '0,89']);
    expect(textoDoTopico('medidas-sobre-a-tratada')).toMatch(/\*\*8,41\*\*[\s\S]*\*\*8,5\*\*[\s\S]*\*\*0,89\*\*/);
    expect(textoDoTopico('medidas-sobre-a-tratada')).toMatch(/3,87, mediana 3,50 e desvio 1,84; o sono, 8,41, 8,50 e 0,89/);
    expect(textoDoTopico('media-ou-mediana')).toMatch(/\*\*3,87 horas\*\*[\s\S]*\*\*3,5 horas\*\*/);
  });

  it('os três grupos, e os 59 que responderam', () => {
    const v = conta(caderno('grupos'), 'Grupos', [1, 2, 3].flatMap(l => [
      [l, 1, `=CONT.SE(${FX('D', true)};A${l + 1})`],
      [l, 2, `=SOMASE(${FX('D', true)};A${l + 1};${FX('E', true)})/B${l + 1}`],
      [l, 3, `=SOMASE(${FX('D', true)};A${l + 1};${FX('F', true)})/B${l + 1}`],
    ] as [number, number, string][]));
    expect([1, 2, 3].map(l => [v(l, 1), v(l, 2), v(l, 3)]))
      .toEqual([['28', '4,29', '7,75'], ['27', '3,87', '8,91'], ['4', '1', '9,63']]);
    expect(GRUPOS.reduce((t, g) => t + RESPONDENTES.filter(r => r.celular === g).length, 0)).toBe(59);
    const texto = textoDoTopico('a-media-de-cada-grupo');
    expect(texto).toMatch(/28, com 4,29 h de tela e 7,75 h de sono; fora do quarto, 27, com 3,87 e 8,91; sem celular, 4, com 1 e 9,63/);
    expect(texto).toContain('somam 59');
    expect(textoDoTopico('o-que-a-comparacao-mostra')).toMatch(/\*\*4,29 horas\*\*[\s\S]*\*\*3,87\*\*[\s\S]*\*\*7,75\*\*[\s\S]*\*\*8,91\*\*/);
  });

  it('a correlação é -0,71, com 59 pontos', () => {
    const v = conta(caderno('calculos'), 'Cálculos', [[1, 1, `=CORREL(${FX('E')};${FX('F')})`]]);
    expect(v(1, 1)).toBe('-0,71');
    for (const id of ['a-dispersao-da-base-inteira', 'o-que-a-relacao-nao-prova']) expect(textoDoTopico(id)).toContain('-0,71');
    expect(textoDoTopico('a-dispersao-da-base-inteira')).toContain('59 pontos');
  });

  it('a régua da coluna da tela: 60, 250 e 4,46 antes; 264 e 4,40 depois', () => {
    const antesDoConserto = naAba(caderno('grafia'), 'Tratada');
    const antes = contaDaSelecao(antesDoConserto, { l1: 1, c1: 4, l2: 63, c2: 4 })!;
    expect([antes.contagem, mostrarNumero(antes.soma), mostrarNumero(antes.soma / antes.numeros)]).toEqual([60, '250', '4,46']);
    expect(textoDoTopico('numero-guardado-como-texto'))
      .toMatch(/Média 4,46, Contagem 60 e Soma 250[\s\S]*Média 4,40, Contagem 60 e Soma 264/);
    const consertada = {
      ...antesDoConserto,
      celulas: antesDoConserto.celulas.map(l => l.map((x, j) =>
        (j === 4 ? { ...x, texto: x.texto.replace(' h', '').replace('h', '').replace('.', ',') } : x))),
    };
    const depois = contaDaSelecao(consertada, { l1: 1, c1: 4, l2: 63, c2: 4 })!;
    expect([depois.contagem, mostrarNumero(depois.soma), mostrarNumero(depois.soma / depois.numeros)]).toEqual([60, '264', '4,40']);
  });

  it('a base tem 62, a bruta tem a repetida, e excluir as três sem resposta dá 59', () => {
    expect(RESPONDENTES).toHaveLength(62);
    expect(linhasBrutasDoSono()).toHaveLength(63);
    expect(RESPONDENTES.filter(r => r.celular === null)).toHaveLength(3);
    expect(textoDoTopico('a-ausencia')).toContain('de 62 para 59');
    expect(textoDoTopico('a-linha-repetida')).toContain('62 valores exclusivos');
    expect(RESPONDENTES.filter(r => r.nome === 'João Victor Alves').map(r => r.unidade)).toEqual(['Jaguar', 'Falcão']);
  });

  it('os dois impossíveis: o 35 da tela, com evidência, e o 21 da idade, sem', () => {
    const d = (escrito: string) => DEFEITOS_DO_SONO.find(x => x.escrito === escrito)!;
    expect([d('35').certo, d('21').certo]).toEqual(['3,5', '']);
    expect(textoDoTopico('valor-impossivel')).toMatch(/35 horas[\s\S]*\*\*3,5\*\*[\s\S]*\*\*21 anos\*\*/);
  });
});

describe('a base do sono não é a chamada do laboratório', () => {
  it('nenhuma pessoa coincide', () => {
    const doLab = new Set(MEMBROS.map(m => m.nome));
    expect(RESPONDENTES.length).toBeGreaterThan(60);
    expect(RESPONDENTES.filter(r => doLab.has(r.nome)).map(r => r.nome)).toEqual([]);
  });

  it('a teoria não cita os números nem as pessoas da chamada', () => {
    const teoria = topicos().map(t => textoDoTopico(t.id)).join('\n');
    const proibidos = ['15,39', '6,43', '8,37', '9,05', '17,37', '11,35', '-0,70', '3,67', '1.250', 'Carla', 'Isabela',
      'Ana Clara', 'Pedro Aguiar', 'carona', 'ônibus', ' km', 'presença', 'aguia, AGUIA'];
    expect(proibidos.filter(p => teoria.includes(p))).toEqual([]);
  });
});
