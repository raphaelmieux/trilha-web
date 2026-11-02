import { describe, expect, it } from 'vitest';
import { MODULOS_DO_DESENHO_VETORIAL } from './desenhoVetorial';
import { QUESTOES_DO_DESENHO_VETORIAL } from './questoesDoDesenhoVetorial';
import type { TopicoDeVereda } from './veredas';
import { K_DO_CIRCULO } from '../labs/vetor';
import { UM_PIXEL_EM_16 } from '../labs/metasDaCcDg002';
import { LADO_DO_ICONE } from '../labs/arteVetorial';

/*
  Os números que a teoria e as questões da CC-DG002 citam, conferidos contra o
  motor que desenha.

  É a trava de `exemplosDosFundamentos.test.ts`, pelo motivo escrito lá: a
  **conta** se declara aqui, e a **afirmação** se lê da lição. O caso mais
  caro seria o do SVG: a lição mostra o arquivo que o editor exporta, e se os
  dois divergissem, quem procurasse no próprio arquivo a linha da lição não a
  acharia.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DO_DESENHO_VETORIAL.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? ''].join('\n');
}

function textoDaQuestao(id: string): string {
  for (const qs of Object.values(QUESTOES_DO_DESENHO_VETORIAL)) {
    const q = qs.find(x => x.id === id);
    if (q) return [q.prompt, ...(q.data.options ?? []).flatMap(o => [o.text, o.porque ?? '']), q.explanation ?? ''].join('\n');
  }
  throw new Error(`A questão ${id} sumiu da vereda.`);
}

const decimal = (x: number) => x.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Afirmacao { onde: string; texto: () => string; numero: () => string }

const AFIRMACOES: Afirmacao[] = [
  /* A alça do círculo, que a teoria do módulo 3 cita em fração do raio. */
  { onde: 'a-curva-de-bezier', texto: () => textoDoTopico('a-curva-de-bezier'), numero: () => `${decimal(K_DO_CIRCULO)} do raio` },
  /* O pixel em 16, na teoria e na questão do módulo 8. */
  { onde: 'o-icone-pequeno', texto: () => textoDoTopico('o-icone-pequeno'), numero: () => `${UM_PIXEL_EM_16} unidades da prancha de ${LADO_DO_ICONE}` },
  { onde: 'DG2-M8-Q2', texto: () => textoDaQuestao('DG2-M8-Q2'), numero: () => `${UM_PIXEL_EM_16} unidades.` },
];

describe('os números que a CC-DG002 cita', () => {
  it('a tabela tem as afirmações declaradas', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(3);
  });

  it.each(AFIRMACOES.map(a => [a.onde, a] as const))('%s', (_onde, a) => {
    expect(a.texto(), `a lição não diz "${a.numero()}"`).toContain(a.numero());
  });
});
