import { describe, expect, it } from 'vitest';
import { MODULOS_DOS_FUNDAMENTOS } from './fundamentosVisuais';
import { QUESTOES_DOS_FUNDAMENTOS } from './questoesDosFundamentos';
import type { TopicoDeVereda } from './veredas';
import { contrastRatio, hexToRgb } from '../lib/imageTools';
import { PALETA_COMPOSTA, comBatismoRefeito, versoesDoBatismo } from '../labs/metasDaCcDg001';
import {
  ARTE_INICIAL, BATISMO_PECA, CAMPORI_PECA, COR_DA_SITUACAO, TINTA,
} from '../labs/arteDoClube';
import { cmykDe, contrasteDoTexto, hslDe, textos, umaPrancha } from '../labs/design';

/*
  Os números que a teoria e as questões da CC-DG001 citam, conferidos contra o
  motor que mede a peça.

  É a trava de `exemplosDaAnalise.test.ts`, pelo motivo escrito lá: escrever de
  cabeça o que uma conta devolve erra por pouco e com frequência, nada estoura,
  e quem confere a própria peça contra uma lição errada conclui que a peça dele
  é que está errada. Aqui o erro seria pior do que de costume: o medidor do
  editor diz "3,95:1" do mesmo cinza que a lição chamaria de outra coisa.

  A **conta** se declara aqui, e a **afirmação** se lê da lição.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DOS_FUNDAMENTOS.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? ''].join('\n');
}

function textoDaQuestao(id: string): string {
  for (const qs of Object.values(QUESTOES_DOS_FUNDAMENTOS)) {
    const q = qs.find(x => x.id === id);
    if (q) return [q.prompt, ...(q.data.options ?? []).flatMap(o => [o.text, o.porque ?? '']), q.explanation ?? ''].join('\n');
  }
  throw new Error(`A questão ${id} sumiu da vereda.`);
}

/** A razão como o medidor do editor a escreve: duas casas, vírgula. */
const razao = (a: string, b: string) =>
  `${contrastRatio(a, b).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}:1`;

const pct = (x: number) => `${Math.round(x * 100)}%`;
const graus = (x: number) => `${Math.round(x)}°`;

interface Afirmacao { onde: string; texto: () => string; numero: () => string }

/** Como a teoria escreve os três números de uma cor, no texto corrido. */
const hslEscrito = (hex: string) => {
  const { h, s, l } = hslDe(hex);
  return `matiz ${graus(h)}, saturação ${pct(s)} e luminosidade ${pct(l)}`;
};
const DESTAQUE_DA_TELA = '#2E7D4F';
const APOIO_DA_TELA = '#76B290';
const NEUTRO_DA_TELA = '#8A938E';

const tituloDoCampori = () => textos(CAMPORI_PECA).find(t => t.id === 'titulo')!;
const [escuroDaFogueira, claroDaFogueira] = (() => {
  const foto = CAMPORI_PECA.objetos.find(o => o.tipo === 'foto');
  if (!foto || foto.tipo !== 'foto') throw new Error('A foto do campori sumiu.');
  return foto.tons;
})();

const AFIRMACOES: Afirmacao[] = [
  /* A paleta do cartaz da unidade Jatobá, que as telas do módulo 4 mostram. É
     outra que a do laboratório, de propósito: a do laboratório é a resposta
     dele. */
  { onde: 'uma-paleta-de-cinco', texto: () => textoDoTopico('uma-paleta-de-cinco'), numero: () => razao(TINTA, '#FFFFFF') },
  { onde: 'matiz · destaque', texto: () => textoDoTopico('matiz-saturacao-luminosidade'), numero: () => hslEscrito(DESTAQUE_DA_TELA) },
  { onde: 'matiz · apoio', texto: () => textoDoTopico('matiz-saturacao-luminosidade'), numero: () => hslEscrito(APOIO_DA_TELA) },
  { onde: 'matiz · neutro', texto: () => textoDoTopico('matiz-saturacao-luminosidade'), numero: () => hslEscrito(NEUTRO_DA_TELA) },
  { onde: 'luz-e-tinta · vermelho do clube', texto: () => textoDoTopico('luz-e-tinta'), numero: () => `CMYK ${cmykDe(PALETA_COMPOSTA.destaque!).join(', ')}` },
  { onde: 'luz-e-tinta · rgb do clube', texto: () => textoDoTopico('luz-e-tinta'), numero: () => `RGB ${Object.values(hexToRgb(PALETA_COMPOSTA.destaque!)!).join(', ')}` },
  { onde: 'luz-e-tinta · vermelho puro', texto: () => textoDoTopico('luz-e-tinta'), numero: () => `CMYK ${cmykDe('#FF0000').join(', ')}` },

  /* O convite do batismo, como chegou. */
  { onde: 'diferente-de-verdade · título', texto: () => textoDoTopico('diferente-de-verdade'), numero: () => razao(textos(BATISMO_PECA).find(t => t.id === 'titulo')!.cor, '#FFFFFF') },
  { onde: 'diferente-de-verdade · hora', texto: () => textoDoTopico('diferente-de-verdade'), numero: () => razao(textos(BATISMO_PECA).find(t => t.id === 'hora')!.cor, '#FFFFFF') },
  { onde: 'DG1-M6-Q2', texto: () => textoDaQuestao('DG1-M6-Q2'), numero: () => razao(textos(BATISMO_PECA).find(t => t.id === 'titulo')!.cor, '#FFFFFF') },
  { onde: 'refazer · hora', texto: () => textoDoTopico('refazer-sem-perder'), numero: () => razao(textos(BATISMO_PECA).find(t => t.id === 'hora')!.cor, '#FFFFFF') },
  { onde: 'diferente-de-verdade · #333333', texto: () => textoDoTopico('diferente-de-verdade'), numero: () => razao('#333333', '#FFFFFF') },
  { onde: 'diferente-de-verdade · preto', texto: () => textoDoTopico('diferente-de-verdade'), numero: () => '21:1' },

  /* A régua do módulo 8. */
  { onde: 'medir · #767676', texto: () => textoDoTopico('medir-e-nao-achar'), numero: () => razao('#767676', '#FFFFFF') },
  { onde: 'medir · #808080', texto: () => textoDoTopico('medir-e-nao-achar'), numero: () => razao('#808080', '#FFFFFF') },
  { onde: 'medir · #555555', texto: () => textoDoTopico('medir-e-nao-achar'), numero: () => razao('#555555', '#FFFFFF') },
  { onde: 'medir · tinta', texto: () => textoDoTopico('medir-e-nao-achar'), numero: () => razao(PALETA_COMPOSTA.texto!, '#FFFFFF') },
  { onde: 'medir · #999999', texto: () => textoDoTopico('medir-e-nao-achar'), numero: () => razao('#999999', '#FFFFFF') },
  { onde: 'DG1-M8-Q2 · #767676', texto: () => textoDaQuestao('DG1-M8-Q2'), numero: () => razao('#767676', '#FFFFFF') },
  { onde: 'DG1-M8-Q2 · #808080', texto: () => textoDaQuestao('DG1-M8-Q2'), numero: () => razao('#808080', '#FFFFFF') },

  /* O título do campori, nos dois tons da fogueira. */
  { onde: 'medir · campori escuro', texto: () => textoDoTopico('medir-e-nao-achar'), numero: () => razao(tituloDoCampori().cor, escuroDaFogueira) },
  { onde: 'medir · campori claro', texto: () => textoDoTopico('medir-e-nao-achar'), numero: () => razao(tituloDoCampori().cor, claroDaFogueira) },
  { onde: 'DG1-M8-Q3 · escuro', texto: () => textoDaQuestao('DG1-M8-Q3'), numero: () => razao(tituloDoCampori().cor, escuroDaFogueira) },
  { onde: 'DG1-M8-Q3 · claro', texto: () => textoDaQuestao('DG1-M8-Q3'), numero: () => razao(tituloDoCampori().cor, claroDaFogueira) },

  /* O verde e o vermelho da escala, um contra o outro. */
  { onde: 'a-cor-nao-carrega-sozinha', texto: () => textoDoTopico('a-cor-nao-carrega-sozinha'), numero: () => razao(COR_DA_SITUACAO.confirmado, COR_DA_SITUACAO.cancelado) },
  { onde: 'DG1-M8-Q6', texto: () => textoDaQuestao('DG1-M8-Q6'), numero: () => razao(COR_DA_SITUACAO.confirmado, COR_DA_SITUACAO.cancelado) },
];

describe('os números da CC-DG001', () => {
  it('a tabela não está vazia, e cobre teoria e questões', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(20);
    expect(AFIRMACOES.some(a => a.onde.startsWith('DG1-'))).toBe(true);
  });

  for (const a of AFIRMACOES) {
    it(`${a.onde}: ${a.numero()}`, () => {
      expect(a.texto()).toContain(a.numero());
    });
  }

  it('o medidor do editor dá ao título do campori o pior dos dois tons', () => {
    const p = umaPrancha(ARTE_INICIAL, CAMPORI_PECA.id)!;
    expect(contrasteDoTexto(p, tituloDoCampori())).toBe(contrastRatio(tituloDoCampori().cor, claroDaFogueira));
  });

  it('o antes e depois do módulo 7 diz o que a solução de referência faz', () => {
    const { depois } = versoesDoBatismo(comBatismoRefeito(ARTE_INICIAL));
    const titulo = textos(depois!).find(t => t.texto === 'Batismo na Primavera')!;
    const data = textos(depois!).find(t => t.texto === 'Domingo, 21 de setembro')!;
    const hora = textos(depois!).find(t => t.texto.startsWith('Às 9h'))!;
    const texto = textoDoTopico('refazer-sem-perder');
    expect(texto).toContain(`título ${titulo.familia} negrito, ${titulo.corpo}`);
    expect(texto).toContain(`data ${data.corpo} negrito, o resto ${hora.corpo}`);
    expect(texto).toContain(`hora em ${hora.cor}`);
  });
});
