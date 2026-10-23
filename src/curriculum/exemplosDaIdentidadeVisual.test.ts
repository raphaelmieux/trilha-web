import { describe, expect, it } from 'vitest';
import { MODULOS_DA_IDENTIDADE_VISUAL } from './identidadeVisual';
import { QUESTOES_DA_IDENTIDADE_VISUAL } from './questoesDaIdentidadeVisual';
import type { TopicoDeVereda } from './veredas';
import { contrastRatio } from '../lib/imageTools';
import { LETRA_MINIMA, larguraMinimaMedida, logotipoDe, simboloDe } from '../labs/identidade';
import { CREME, MARROM, NOME_DA_MARCA, PALETA_DA_IPE, ROXO, TINTA, VERDE, assinaturaDaIpe, pranchaDaCamiseta } from '../labs/identidadeDoClube';
import { caixaDe } from '../labs/design';
import { MINIMO_DECLARADO, PROTECAO_DECLARADA } from '../labs/metasDaCcDg004';

/*
  Os números que a teoria e as questões da CC-DG004 citam, conferidos contra o
  motor que confere as lições.

  É a trava de `exemplosDoDesenhoVetorial.test.ts`, pelo motivo escrito lá: a
  **conta** se declara aqui, e a **afirmação** se lê da lição. Aqui o que
  pesa são os contrastes — a razão de a marca da Ipê ser roxa, e não amarela,
  e de a negativa existir — e o tamanho mínimo, que a lição ensina a medir.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DA_IDENTIDADE_VISUAL.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo, t.atencao ?? ''].join('\n');
}

function textoDaQuestao(id: string): string {
  for (const qs of Object.values(QUESTOES_DA_IDENTIDADE_VISUAL)) {
    const q = qs.find(x => x.id === id);
    if (q) return [q.prompt, ...(q.data.options ?? []).flatMap(o => [o.text, o.porque ?? '']), q.explanation ?? ''].join('\n');
  }
  throw new Error(`A questão ${id} sumiu da vereda.`);
}

const razao = (a: string, b: string) => `${contrastRatio(a, b).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}:1`;
const AMARELO_DO_IPE = '#F2B705';
const CAMISETA = pranchaDaCamiseta().fundo;
const mestre = assinaturaDaIpe();
const alturaDoSimbolo = () => {
  const cs = simboloDe(mestre).map(caixaDe);
  return Math.max(...cs.map(c => c.y + c.altura)) - Math.min(...cs.map(c => c.y));
};

interface Afirmacao { onde: string; texto: () => string; numero: () => string }

const AFIRMACOES: Afirmacao[] = [
  /* Os contrastes que decidem a cor da copa e a existência da negativa. */
  { onde: 'colorida-mono-negativa (roxo)', texto: () => textoDoTopico('colorida-mono-negativa'), numero: () => razao(ROXO, CAMISETA) },
  { onde: 'colorida-mono-negativa (branco)', texto: () => textoDoTopico('colorida-mono-negativa'), numero: () => razao('#FFFFFF', CAMISETA) },
  { onde: 'DG4-M4-Q3 (roxo)', texto: () => textoDaQuestao('DG4-M4-Q3'), numero: () => razao(ROXO, CAMISETA) },
  { onde: 'DG4-M4-Q3 (branco)', texto: () => textoDaQuestao('DG4-M4-Q3'), numero: () => razao('#FFFFFF', CAMISETA) },
  { onde: 'uma-cor-e-pequena (amarelo)', texto: () => textoDoTopico('uma-cor-e-pequena'), numero: () => razao(AMARELO_DO_IPE, '#FFFFFF') },
  { onde: 'uma-cor-e-pequena (roxo)', texto: () => textoDoTopico('uma-cor-e-pequena'), numero: () => razao(ROXO, '#FFFFFF') },
  { onde: 'DG4-M4-Q7', texto: () => textoDaQuestao('DG4-M4-Q7'), numero: () => razao(AMARELO_DO_IPE, '#FFFFFF') },
  /* A paleta escrita na teoria é a do arquivo. */
  ...[CREME, TINTA, ROXO, VERDE, MARROM].map(cor => ({
    onde: `a-paleta (${cor})`, texto: () => textoDoTopico('a-paleta'), numero: () => cor,
  })),
  /* O símbolo, a proteção e o mínimo. */
  { onde: 'do-papel-ao-vetor (copa)', texto: () => textoDoTopico('do-papel-ao-vetor'), numero: () => { const c = simboloDe(mestre)[0]; return `elipse, ${c.largura} × ${caixaDe(c).altura}`; } },
  { onde: 'do-papel-ao-vetor (tronco)', texto: () => textoDoTopico('do-papel-ao-vetor'), numero: () => { const c = simboloDe(mestre)[1]; return `retângulo, ${c.largura} × ${caixaDe(c).altura}`; } },
  { onde: 'area-de-protecao (altura)', texto: () => textoDoTopico('area-de-protecao'), numero: () => `Símbolo: ${alturaDoSimbolo()} de altura` },
  { onde: 'area-de-protecao (margem)', texto: () => textoDoTopico('area-de-protecao'), numero: () => `meia altura = ${alturaDoSimbolo() * PROTECAO_DECLARADA} em volta` },
  { onde: 'tamanho-minimo (corpo)', texto: () => textoDoTopico('tamanho-minimo'), numero: () => `corpo ${logotipoDe(mestre, NOME_DA_MARCA)!.corpo} numa largura de ${mestre.largura}` },
  { onde: 'tamanho-minimo (medido)', texto: () => textoDoTopico('tamanho-minimo'), numero: () => `Tamanho mínimo medido: ${larguraMinimaMedida(mestre, NOME_DA_MARCA)} pixels` },
  { onde: 'tamanho-minimo (letra)', texto: () => textoDoTopico('tamanho-minimo'), numero: () => `Letra a ${LETRA_MINIMA} pixels` },
  { onde: 'DG4-M6-Q5', texto: () => textoDaQuestao('DG4-M6-Q5'), numero: () => `O mínimo medido é ${larguraMinimaMedida(mestre, NOME_DA_MARCA)} pixels` },
  { onde: 'conferir-a-peca', texto: () => textoDoTopico('conferir-a-peca'), numero: () => `mínimo ${MINIMO_DECLARADO}` },
];

describe('os números que a CC-DG004 cita', () => {
  it('a tabela tem as afirmações declaradas', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(15);
  });

  it.each(AFIRMACOES.map(a => [a.onde, a] as const))('%s', (_onde, a) => {
    expect(a.texto(), `a lição não diz "${a.numero()}"`).toContain(a.numero());
  });

  it('a paleta da teoria é a paleta inteira do arquivo', () => {
    expect(Object.values(PALETA_DA_IPE).sort()).toEqual([CREME, TINTA, ROXO, VERDE, MARROM].sort());
  });

  it('o mínimo declarado das lições fica entre o medido e o dobro dele', () => {
    const medido = larguraMinimaMedida(mestre, NOME_DA_MARCA);
    expect(MINIMO_DECLARADO).toBeGreaterThanOrEqual(medido);
    expect(MINIMO_DECLARADO).toBeLessThanOrEqual(medido * 2);
  });
});
