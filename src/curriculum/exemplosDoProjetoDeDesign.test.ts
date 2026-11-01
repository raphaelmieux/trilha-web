import { describe, expect, it } from 'vitest';
import { MODULOS_DO_PROJETO_DE_DESIGN } from './projetoDeDesign';
import { QUESTOES_DO_PROJETO_DE_DESIGN } from './questoesDoProjetoDeDesign';
import type { TopicoDeVereda } from './veredas';
import {
  BRANCO, CREME, MARROM, NOMES_DOS_FINAIS, TINTA, VERDE, arteDePartida, conviteArrumado, pastaComoChegou, postAdaptado,
  postEncolhido, simboloDeReferencia,
} from '../labs/acampamentoDasFamilias';
import {
  CORPO_MINIMO_NO_CELULAR, MINUTOS_DA_APRESENTACAO, PALAVRAS_DO_POST, PROPORCOES_DIGITAIS, LADO_PEQUENO,
} from '../labs/projetoDeDesign';
import { ROTEIRO_DE_REFERENCIA } from '../labs/metasDaCcDg006';
import { umaPrancha } from '../labs/design';
import {
  ALTURA_DO_ENCOLHIDO, AREIA, AZUL, FINAIS_DO_MUTIRAO, FOLHA, LARGURA_DO_ENCOLHIDO, TINTA_DO_MUTIRAO,
  TRACO_DA_PRIMEIRA_IDEIA, arteComAsDuasIdeias, pastaDoMutirao, pastaDoMutiraoSeparada, postDoCartazEncolhido,
  simboloDoMutirao,
} from '../exemplos/mutiraoDoCorrego';

/*
  Os números que a teoria e as questões da CC-DG006 citam, conferidos contra o
  motor que confere as lições.

  É a trava de `exemplosDaDiagramacao.test.ts`, pelo motivo escrito lá: a
  **conta** se declara aqui, e a **afirmação** se lê da lição.

  São dois projetos, de propósito. A teoria fala do mutirão do córrego,
  porque o convite do Acampamento das Famílias é o que o laboratório percorre
  e os rascunhos, os descartes, a hora pedida e os nomes dos finais dele são
  respostas; as questões continuam falando do convite, e são conferidas
  contra ele. A última trava reprova se os dois passarem a dividir um nome de
  arquivo, uma cor ou o tamanho do post.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DO_PROJETO_DE_DESIGN.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

/** O que a lição diz: a prosa e o que as telas dizem em legenda e descrição. */
function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
}

function textoDaQuestao(id: string): string {
  for (const qs of Object.values(QUESTOES_DO_PROJETO_DE_DESIGN)) {
    const q = qs.find(x => x.id === id);
    if (q) return [q.prompt, ...(q.data.options ?? []).flatMap(o => [o.text, o.porque ?? '']), q.explanation ?? ''].join('\n');
  }
  throw new Error(`A questão ${id} sumiu da vereda.`);
}

/** O celular mostra o post com um terço da largura. */
const NO_CELULAR = 1 / 3;
const tamanho = (l: number, a: number) => `${l} × ${a}`;

/* ── O convite, que as questões citam ── */

const encolhido = postEncolhido();
const adaptado = postAdaptado();
const simbolo = simboloDeReferencia();
const tentativa = umaPrancha(arteDePartida(), 'simbolo-tentativa')!.objetos[0];
const espessuraDaTentativa = tentativa.tipo === 'grupo'
  ? Math.max(...tentativa.filhos.map(o => (o.tipo === 'caminho' && o.traco ? o.traco.espessura : 0))) : 0;
const fotoDoConvite = conviteArrumado().imagens.find(q => q.imagem === 'tratada')!;

/* ── O mutirão, que a teoria mostra ── */

const PRANCHA_DO_SIMBOLO = umaPrancha(arteComAsDuasIdeias(), 'simbolo')!;
const pecaMargem = simboloDoMutirao().filhos.find(o => o.nome === 'Margem')!;
/* A margem é um caminho, e o texto não tem altura: a conta lê a caixa dela. */
const margem = { altura: pecaMargem.tipo === 'texto' ? 0 : pecaMargem.altura };
const postDoMutirao = postDoCartazEncolhido();
const retrato = PROPORCOES_DIGITAIS.find(p => p.altura === 1350)!;
const textoDe = (id: string) => {
  const o = postDoMutirao.objetos.find(x => x.id === id);
  return o && o.tipo === 'texto' ? o.texto : '';
};
const POR_EXTENSO: Record<number, string> = { 5: 'cinco', 15: 'quinze' };
const minutosDasPecas = ROTEIRO_DE_REFERENCIA.pecas ?? 0;

interface Afirmacao { onde: string; texto: () => string; numero: () => string }

const AFIRMACOES: Afirmacao[] = [
  /* As questões, sobre o convite. */
  { onde: 'DG6-M5-Q2', texto: () => textoDaQuestao('DG6-M5-Q2'), numero: () => `${encolhido.largura} por ${encolhido.altura}` },
  { onde: 'DG6-M5-Q2 (retrato)', texto: () => textoDaQuestao('DG6-M5-Q2'), numero: () => `${adaptado.largura} por ${adaptado.altura}` },
  { onde: 'DG6-M5-Q3', texto: () => textoDaQuestao('DG6-M5-Q3'), numero: () => `uns ${Math.round(22 * NO_CELULAR)} pixels` },
  { onde: 'DG6-M5-Q5', texto: () => textoDaQuestao('DG6-M5-Q5'), numero: () => `Umas ${PALAVRAS_DO_POST} palavras` },
  { onde: 'DG6-M2-Q3', texto: () => textoDaQuestao('DG6-M2-Q3'), numero: () => `Traço de ${espessuraDaTentativa} pixels numa barraca de ${simbolo.largura}` },
  { onde: 'DG6-M4-Q3', texto: () => textoDaQuestao('DG6-M4-Q3'), numero: () => `X ${fotoDoConvite.x}, Y ${fotoDoConvite.y} e ${fotoDoConvite.largura} mm` },
  { onde: 'DG6-M7-Q4', texto: () => textoDaQuestao('DG6-M7-Q4'), numero: () => NOMES_DOS_FINAIS['f-convite-pdf'] },

  /* A teoria, sobre o mutirão. */
  ...PROPORCOES_DIGITAIS.map(p => ({
    onde: `proporcao (${p.nome})`, texto: () => textoDoTopico('proporcao-do-meio'), numero: () => tamanho(p.largura, p.altura),
  })),
  { onde: 'proporcao (encolhido)', texto: () => textoDoTopico('proporcao-do-meio'), numero: () => tamanho(postDoMutirao.largura, postDoMutirao.altura) },
  { onde: 'proporcao (retrato na tela)', texto: () => textoDoTopico('proporcao-do-meio'), numero: () => `Post retrato, ${tamanho(retrato.largura, retrato.altura)}` },
  { onde: 'letra (mínimo)', texto: () => textoDoTopico('letra-do-celular'), numero: () => `letra de ${CORPO_MINIMO_NO_CELULAR} chega a uns ${Math.round(CORPO_MINIMO_NO_CELULAR * NO_CELULAR)}` },
  { onde: 'letra (papel)', texto: () => {
    const c = postDoMutirao.objetos.find(o => o.id === 'mp-corpo');
    return c && c.tipo === 'texto' ? textoDoTopico('letra-do-celular') : '';
  }, numero: () => {
    const c = postDoMutirao.objetos.find(o => o.id === 'mp-corpo')!;
    const corpo = c.tipo === 'texto' ? c.corpo : 0;
    return `A de ${corpo}, que no papel estava ótima, chega a ${Math.round(corpo * NO_CELULAR)}`;
  } },
  { onde: 'letra (palavras)', texto: () => textoDoTopico('letra-do-celular'), numero: () => `umas ${PALAVRAS_DO_POST} palavras` },
  { onde: 'simbolo (traço)', texto: () => textoDoTopico('simbolo-pequeno'), numero: () => `traço de ${TRACO_DA_PRIMEIRA_IDEIA} pixels numa prancha de ${PRANCHA_DO_SIMBOLO.largura}` },
  { onde: 'simbolo (conta)', texto: () => textoDoTopico('simbolo-pequeno'), numero: () => `${TRACO_DA_PRIMEIRA_IDEIA} × ${LADO_PEQUENO} ÷ ${PRANCHA_DO_SIMBOLO.largura}` },
  { onde: 'simbolo (margem)', texto: () => textoDoTopico('simbolo-pequeno'), numero: () => `margem de ${margem.altura} pixels` },
  { onde: 'simbolo (margem, conta)', texto: () => textoDoTopico('simbolo-pequeno'), numero: () => `${margem.altura} × ${LADO_PEQUENO} ÷ ${PRANCHA_DO_SIMBOLO.largura}` },
  { onde: 'quando', texto: () => textoDoTopico('o-que-quando-onde'), numero: () => textoDe('mp-data').toLowerCase() },
  { onde: 'onde', texto: () => textoDoTopico('o-que-quando-onde'), numero: () => textoDe('mp-lugar').toLowerCase() },
  { onde: 'o quê', texto: () => textoDoTopico('o-que-quando-onde'), numero: () => textoDe('mp-titulo') },
  ...Object.values(FINAIS_DO_MUTIRAO).map(nome => ({
    onde: `nomes (${nome})`, texto: () => textoDoTopico('nomes-e-pastas'), numero: () => nome,
  })),
  { onde: 'quinze (peças)', texto: () => textoDoTopico('quinze-minutos'), numero: () => `${POR_EXTENSO[minutosDasPecas]} minutos de ${POR_EXTENSO[MINUTOS_DA_APRESENTACAO]}` },
];

describe('os números que a CC-DG006 cita', () => {
  it('a tabela tem as afirmações declaradas', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(25);
  });

  it.each(AFIRMACOES.map(a => [a.onde, a] as const))('%s', (_onde, a) => {
    expect(a.texto(), `a lição não diz "${a.numero()}"`).toContain(a.numero());
  });

  it('a gota de contorno some em 32 pixels, e a margem do símbolo cheio não', () => {
    const traco = TRACO_DA_PRIMEIRA_IDEIA * LADO_PEQUENO / PRANCHA_DO_SIMBOLO.largura;
    expect(traco).toBeLessThan(1 / 5);
    expect(textoDoTopico('simbolo-pequeno')).toContain('um sexto de pixel');
    const daMargem = margem.altura * LADO_PEQUENO / PRANCHA_DO_SIMBOLO.largura;
    expect(daMargem).toBeGreaterThan(1.5);
    expect(daMargem).toBeLessThan(2);
  });

  it('o post encolhido tem a proporção da folha A5, que nenhum feed usa', () => {
    expect(postDoMutirao.largura).toBe(LARGURA_DO_ENCOLHIDO);
    expect(postDoMutirao.altura).toBe(ALTURA_DO_ENCOLHIDO);
    expect(ALTURA_DO_ENCOLHIDO / LARGURA_DO_ENCOLHIDO).toBeCloseTo(210 / 148, 2);
    for (const p of PROPORCOES_DIGITAIS) expect(postDoMutirao.altura, p.nome).not.toBe(p.altura);
  });

  it('os arquivos que a teoria nomeia estão na pasta do mutirão', () => {
    const nomes = [...pastaDoMutirao().arquivos, ...pastaDoMutiraoSeparada().arquivos].map(a => a.nome);
    const entrega = textoDoTopico('editavel-e-final') + textoDoTopico('nomes-e-pastas');
    /* O cartaz renomeado só existe na tela, que é onde a renomeação acontece. */
    for (const n of ['simbolo.svg', 'post (1).png', 'cartaz-final-FINAL2.pdf', FINAIS_DO_MUTIRAO.post, FINAIS_DO_MUTIRAO.simbolo]) {
      expect(nomes, n).toContain(n);
      expect(entrega, n).toContain(n);
    }
  });
});

describe('o mutirão das telas não é o convite do laboratório', () => {
  it('nenhum nome de arquivo em comum, fora os genéricos que todo projeto tem', () => {
    /* simbolo.svg e post.png são o nome que todo programa sugere; o que seria
       resposta é o nome com data e versão, a foto e o que veio de fora. */
    const generico = (n: string) => /^(simbolo|post|convite|cartaz)\.(svg|png|sla|pdf)$/.test(n);
    const doConvite = new Set([...pastaComoChegou().arquivos.map(a => a.nome), ...Object.values(NOMES_DOS_FINAIS)].filter(n => !generico(n)));
    const doMutirao = [...pastaDoMutirao().arquivos, ...pastaDoMutiraoSeparada().arquivos].map(a => a.nome).filter(n => !generico(n));
    expect(doMutirao.filter(n => doConvite.has(n))).toEqual([]);
  });

  it('nenhuma cor em comum, e outro tamanho de post', () => {
    const doConvite = [VERDE, CREME, TINTA, MARROM].map(c => c.toUpperCase());
    for (const c of [AZUL, FOLHA, AREIA, TINTA_DO_MUTIRAO]) expect(doConvite, c).not.toContain(c.toUpperCase());
    expect(BRANCO).toBe('#FFFFFF');
    expect(postDoMutirao.altura).not.toBe(encolhido.altura);
  });

  it('a teoria não cita o que o laboratório pede como resposta', () => {
    const tudo = topicos().map(t => textoDoTopico(t.id)).join('\n');
    for (const resposta of ['14 de setembro', 'Chácara Recanto Verde', 'Lúcia', 'IMG_0412', 'Ana Souza', ...Object.values(NOMES_DOS_FINAIS)]) {
      expect(tudo, resposta).not.toContain(resposta);
    }
  });
});
