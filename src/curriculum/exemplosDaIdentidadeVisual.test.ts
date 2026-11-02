import { describe, expect, it } from 'vitest';
import { MODULOS_DA_IDENTIDADE_VISUAL } from './identidadeVisual';
import { QUESTOES_DA_IDENTIDADE_VISUAL } from './questoesDaIdentidadeVisual';
import type { TopicoDeVereda } from './veredas';
import { contrastRatio } from '../lib/imageTools';
import { LETRA_MINIMA, larguraMinimaMedida, simboloDe } from '../labs/identidade';
import { NOME_DA_MARCA, PALETA_DA_IPE, ROXO, assinaturaDaIpe, pranchaDaCamiseta } from '../labs/identidadeDoClube';
import {
  ALTURA_DO_SIMBOLO, CORPO_DO_LOGOTIPO, LARANJA_DO_FRUTO, MARINHO, NOME_DO_BURITI, PALETA_DO_BURITI, PROTECAO_DO_BURITI,
  VERDE_DO_LEQUE, arteDaProtecao, assinaturaDoBuriti,
} from '../exemplos/marcaDoBuriti';
import { caixaDe } from '../labs/design';
import { MINIMO_DECLARADO } from '../labs/metasDaCcDg004';

/*
  Os números que a teoria e as questões da CC-DG004 citam, conferidos contra o
  motor que confere as lições.

  É a trava de `exemplosDoDesenhoVetorial.test.ts`, pelo motivo escrito lá: a
  **conta** se declara aqui, e a **afirmação** se lê da lição. Aqui o que
  pesa são os contrastes — a razão de a cor da marca ser a que é, e de a
  negativa existir — e o tamanho mínimo, que a lição ensina a medir.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DA_IDENTIDADE_VISUAL.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo ?? '', t.atencao ?? '', ...(t.telas ?? []).flatMap(x => [x.legenda, x.descricao])].join('\n');
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

interface Afirmacao { onde: string; texto: () => string; numero: () => string }

const buriti = assinaturaDoBuriti();
const simboloDoBuriti = () => simboloDe(buriti).map(caixaDe);
const minimoDoBuriti = () => larguraMinimaMedida(buriti, NOME_DO_BURITI);
const decimal = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/*
  A teoria fala da marca da Buriti, a das telas; as questões continuam falando
  da Ipê, que é a do laboratório. Os dois lados se conferem aqui.
*/
const AFIRMACOES: Afirmacao[] = [
  /* Os contrastes que decidem a cor do leque e a existência da negativa. */
  { onde: 'colorida-mono-negativa (verde)', texto: () => textoDoTopico('colorida-mono-negativa'), numero: () => razao(VERDE_DO_LEQUE, MARINHO) },
  { onde: 'colorida-mono-negativa (branco)', texto: () => textoDoTopico('colorida-mono-negativa'), numero: () => razao('#FFFFFF', MARINHO) },
  { onde: 'conferir-a-peca (branco)', texto: () => textoDoTopico('conferir-a-peca'), numero: () => razao('#FFFFFF', MARINHO).replace(':1', '') },
  { onde: 'uma-cor-e-pequena (laranja)', texto: () => textoDoTopico('uma-cor-e-pequena'), numero: () => razao(LARANJA_DO_FRUTO, '#FFFFFF') },
  { onde: 'uma-cor-e-pequena (verde)', texto: () => textoDoTopico('uma-cor-e-pequena'), numero: () => razao(VERDE_DO_LEQUE, '#FFFFFF') },
  { onde: 'DG4-M4-Q3 (roxo)', texto: () => textoDaQuestao('DG4-M4-Q3'), numero: () => razao(ROXO, CAMISETA) },
  { onde: 'DG4-M4-Q3 (branco)', texto: () => textoDaQuestao('DG4-M4-Q3'), numero: () => razao('#FFFFFF', CAMISETA) },
  { onde: 'DG4-M4-Q7', texto: () => textoDaQuestao('DG4-M4-Q7'), numero: () => razao(AMARELO_DO_IPE, '#FFFFFF') },
  /* A paleta escrita na teoria é a do arquivo das telas, e a conta da aba Cores. */
  ...Object.values(PALETA_DO_BURITI).map(cor => ({
    onde: `a-paleta (${cor})`, texto: () => textoDoTopico('a-paleta'), numero: () => cor!,
  })),
  { onde: 'a-paleta (texto sobre fundo)', texto: () => textoDoTopico('a-paleta'), numero: () => `Sobre o fundo: ${contrastRatio(PALETA_DO_BURITI.texto!, PALETA_DO_BURITI.fundo!).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}:1` },
  /* O símbolo, a proteção e o mínimo. */
  { onde: 'do-papel-ao-vetor (leque)', texto: () => textoDoTopico('do-papel-ao-vetor'), numero: () => { const c = simboloDoBuriti()[0]; return `**${c.largura} × ${c.altura}**`; } },
  { onde: 'do-papel-ao-vetor (tronco)', texto: () => textoDoTopico('do-papel-ao-vetor'), numero: () => { const c = simboloDoBuriti()[1]; return `retângulo, ${c.largura} × ${c.altura}`; } },
  {
    onde: 'area-de-protecao (altura)', texto: () => textoDoTopico('area-de-protecao'),
    numero: () => { const cs = simboloDoBuriti(); return `**${Math.max(...cs.map(c => c.y + c.altura)) - Math.min(...cs.map(c => c.y))} de altura**`; },
  },
  { onde: 'area-de-protecao (margem)', texto: () => textoDoTopico('area-de-protecao'), numero: () => `**${ALTURA_DO_SIMBOLO * PROTECAO_DO_BURITI} em volta**` },
  {
    onde: 'area-de-protecao (retângulo)', texto: () => textoDoTopico('area-de-protecao'),
    numero: () => {
      const r = arteDaProtecao().pranchas[0].objetos.find(o => o.id === 'protecao-area')!;
      return `X ${r.x}, Y ${r.y}, L ${r.largura} e A ${caixaDe(r).altura}`;
    },
  },
  { onde: 'tamanho-minimo (corpo)', texto: () => textoDoTopico('tamanho-minimo'), numero: () => `corpo ${CORPO_DO_LOGOTIPO} numa largura de ${buriti.largura}` },
  { onde: 'tamanho-minimo (conta)', texto: () => textoDoTopico('tamanho-minimo'), numero: () => `dá ${decimal((LETRA_MINIMA / CORPO_DO_LOGOTIPO) * buriti.largura)}` },
  { onde: 'tamanho-minimo (medido)', texto: () => textoDoTopico('tamanho-minimo'), numero: () => `tamanho mínimo medido é ${minimoDoBuriti()} pixels` },
  { onde: 'tamanho-minimo (letra)', texto: () => textoDoTopico('tamanho-minimo'), numero: () => `**${LETRA_MINIMA} pixels**` },
  { onde: 'conferir-a-peca (mínimo)', texto: () => textoDoTopico('conferir-a-peca'), numero: () => `mínimo de ${minimoDoBuriti()}` },
  { onde: 'DG4-M6-Q5', texto: () => textoDaQuestao('DG4-M6-Q5'), numero: () => `O mínimo medido é ${larguraMinimaMedida(mestre, NOME_DA_MARCA)} pixels` },
];

describe('os números que a CC-DG004 cita', () => {
  it('a tabela tem as afirmações declaradas', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(15);
  });

  it.each(AFIRMACOES.map(a => [a.onde, a] as const))('%s', (_onde, a) => {
    expect(a.texto(), `a lição não diz "${a.numero()}"`).toContain(a.numero());
  });

  it('a marca das telas não é a do laboratório', () => {
    /* Mostrar a paleta ou o mínimo da Ipê na teoria seria escrever a resposta da lição. */
    expect(Object.values(PALETA_DO_BURITI).filter(c => Object.values(PALETA_DA_IPE).includes(c))).toEqual([]);
    expect(larguraMinimaMedida(buriti, NOME_DO_BURITI)).not.toBe(larguraMinimaMedida(mestre, NOME_DA_MARCA));
    expect(MINIMO_DECLARADO).not.toBe(minimoDoBuriti());
  });

  it('o mínimo do Buriti sai da letra, como a teoria explica', () => {
    expect(minimoDoBuriti()).toBe(Math.ceil((LETRA_MINIMA / CORPO_DO_LOGOTIPO) * buriti.largura));
  });

  it('o mínimo declarado das lições fica entre o medido e o dobro dele', () => {
    const medido = larguraMinimaMedida(mestre, NOME_DA_MARCA);
    expect(MINIMO_DECLARADO).toBeGreaterThanOrEqual(medido);
    expect(MINIMO_DECLARADO).toBeLessThanOrEqual(medido * 2);
  });
});
