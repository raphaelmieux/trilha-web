import { describe, expect, it } from 'vitest';
import { MODULOS_DO_PROJETO_DE_DESIGN } from './projetoDeDesign';
import { QUESTOES_DO_PROJETO_DE_DESIGN } from './questoesDoProjetoDeDesign';
import type { TopicoDeVereda } from './veredas';
import {
  CREDITO_DA_FOGUEIRA, IMAGENS_DO_PROJETO, NOMES_DOS_FINAIS, ONDE_NO_CONVITE, RESPONDENTES,
  arteDePartida, conviteArrumado, conviteComoChegou, pastaComoChegou, postAdaptado, postEncolhido,
  simboloDeReferencia,
} from '../labs/acampamentoDasFamilias';
import {
  CORPO_MINIMO_NO_CELULAR, MINUTOS_DA_APRESENTACAO, PALAVRAS_DO_POST, PARTES_DA_FALA, PROPORCOES_DIGITAIS,
  LADO_PEQUENO, minutosDo,
} from '../labs/projetoDeDesign';
import { ROTEIRO_DE_REFERENCIA, postComAHora } from '../labs/metasDaCcDg006';
import { textos, umaPrancha } from '../labs/design';

/*
  Os números que a teoria e as questões da CC-DG006 citam, conferidos contra o
  motor que confere as lições.

  É a trava de `exemplosDaDiagramacao.test.ts`, pelo motivo escrito lá: a
  **conta** se declara aqui, e a **afirmação** se lê da lição. Aqui o que
  pesa são as proporções do post, a conta da letra no celular, o símbolo que
  some pequeno e as frases do convite que a teoria copia — escritas de
  cabeça, elas divergiriam do convite que a lição de fato abre.
*/

const topicos = (): TopicoDeVereda[] =>
  MODULOS_DO_PROJETO_DE_DESIGN.flatMap(m => m.licoes.flatMap(l => (l.tipo === 'teoria' ? l.topicos : [])));

function textoDoTopico(id: string): string {
  const t = topicos().find(x => x.id === id);
  if (!t) throw new Error(`O tópico ${id} sumiu da vereda.`);
  return [t.resumo, ...t.explicacao, t.exemplo, t.atencao ?? ''].join('\n');
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
const encolhido = postEncolhido();
const adaptado = postAdaptado();
const menorCorpo = (corpos: number[]) => Math.min(...corpos);
const simbolo = simboloDeReferencia();
const tentativa = umaPrancha(arteDePartida(), 'simbolo-tentativa')!.objetos[0];
const espessuraDaTentativa = tentativa.tipo === 'grupo'
  ? Math.max(...tentativa.filhos.map(o => (o.tipo === 'caminho' && o.traco ? o.traco.espessura : 0))) : 0;
const chao = simbolo.filhos.find(o => o.nome === 'Chão')!;
const fotoDoConvite = conviteArrumado().imagens.find(q => q.imagem === 'tratada')!;
const dataDoConvite = conviteComoChegou().historia.find(p => p.id === 'c-data')!.texto.replace(/\.$/, '');
const dataComAHora = textos(postComAHora()).find(t => t.id === 'pa-data')!.texto;

interface Afirmacao { onde: string; texto: () => string; numero: () => string }

const AFIRMACOES: Afirmacao[] = [
  /* As proporções do meio. */
  { onde: 'proporcao (encolhido)', texto: () => textoDoTopico('proporcao-do-meio'), numero: () => tamanho(encolhido.largura, encolhido.altura) },
  { onde: 'proporcao (adaptado)', texto: () => textoDoTopico('proporcao-do-meio'), numero: () => tamanho(adaptado.largura, adaptado.altura) },
  ...PROPORCOES_DIGITAIS.map(p => ({
    onde: `proporcao (${p.nome})`, texto: () => textoDoTopico('proporcao-do-meio'), numero: () => tamanho(p.largura, p.altura),
  })),
  { onde: 'DG6-M5-Q2', texto: () => textoDaQuestao('DG6-M5-Q2'), numero: () => `${encolhido.largura} por ${encolhido.altura}` },
  { onde: 'DG6-M5-Q2 (retrato)', texto: () => textoDaQuestao('DG6-M5-Q2'), numero: () => `${adaptado.largura} por ${adaptado.altura}` },
  /* A letra no celular. */
  { onde: 'letra (mínimo)', texto: () => textoDoTopico('letra-do-celular'), numero: () => `letra de ${CORPO_MINIMO_NO_CELULAR} chega a uns ${Math.round(CORPO_MINIMO_NO_CELULAR * NO_CELULAR)}` },
  { onde: 'letra (convite)', texto: () => textoDoTopico('letra-do-celular'), numero: () => {
    const c = menorCorpo(textos(encolhido).filter(t => t.nome === 'Convite').map(t => t.corpo));
    return `A de ${c}, que no convite impresso estava ótima, chega a ${Math.round(c * NO_CELULAR)}`;
  } },
  { onde: 'letra (palavras)', texto: () => textoDoTopico('letra-do-celular'), numero: () => `umas ${PALAVRAS_DO_POST} palavras` },
  { onde: 'DG6-M5-Q3', texto: () => textoDaQuestao('DG6-M5-Q3'), numero: () => `uns ${Math.round(22 * NO_CELULAR)} pixels` },
  { onde: 'DG6-M5-Q5', texto: () => textoDaQuestao('DG6-M5-Q5'), numero: () => `Umas ${PALAVRAS_DO_POST} palavras` },
  /* O símbolo pequeno. */
  { onde: 'simbolo (traço)', texto: () => textoDoTopico('simbolo-pequeno'), numero: () => `traço de ${espessuraDaTentativa} pixels numa barraca de ${simbolo.largura}` },
  { onde: 'simbolo (conta)', texto: () => textoDoTopico('simbolo-pequeno'), numero: () => `${espessuraDaTentativa} × ${LADO_PEQUENO} ÷ ${simbolo.largura}` },
  { onde: 'simbolo (chão)', texto: () => textoDoTopico('simbolo-pequeno'), numero: () => `Chão de ${chao.tipo === 'retangulo' ? chao.altura : 0} px` },
  { onde: 'DG6-M2-Q3', texto: () => textoDaQuestao('DG6-M2-Q3'), numero: () => `Traço de ${espessuraDaTentativa} pixels numa barraca de ${simbolo.largura}` },
  /* O convite. */
  { onde: 'convite (sangria)', texto: () => textoDoTopico('convite-para-a-grafica'), numero: () => `X ${fotoDoConvite.x}, Y ${fotoDoConvite.y}, largura ${fotoDoConvite.largura} mm` },
  { onde: 'convite (data)', texto: () => textoDoTopico('o-que-quando-onde'), numero: () => dataDoConvite },
  { onde: 'convite (onde)', texto: () => textoDoTopico('o-que-quando-onde'), numero: () => ONDE_NO_CONVITE },
  { onde: 'DG6-M4-Q3', texto: () => textoDaQuestao('DG6-M4-Q3'), numero: () => `X ${fotoDoConvite.x}, Y ${fotoDoConvite.y} e ${fotoDoConvite.largura} mm` },
  /* O retorno e a mudança. */
  { onde: 'mudar (data)', texto: () => textoDoTopico('mudar-ou-manter'), numero: () => dataComAHora },
  { onde: 'mudar (comentário)', texto: () => textoDoTopico('mudar-ou-manter'), numero: () => RESPONDENTES.find(r => r.id === 'lucia')!.comentario.split('.')[0].replace('Achei bonito, mas n', 'n') },
  /* Os nomes da entrega. */
  ...['f-convite-pdf', 'f-post-png', 'f-simbolo-png'].map(id => ({
    onde: `nomes (${id})`, texto: () => textoDoTopico('nomes-e-pastas'), numero: () => NOMES_DOS_FINAIS[id],
  })),
  { onde: 'DG6-M7-Q4', texto: () => textoDaQuestao('DG6-M7-Q4'), numero: () => NOMES_DOS_FINAIS['f-convite-pdf'] },
];

describe('os números que a CC-DG006 cita', () => {
  it('a tabela tem as afirmações declaradas', () => {
    expect(AFIRMACOES.length).toBeGreaterThanOrEqual(25);
  });

  it.each(AFIRMACOES.map(a => [a.onde, a] as const))('%s', (_onde, a) => {
    expect(a.texto(), `a lição não diz "${a.numero()}"`).toContain(a.numero());
  });

  it('a conta do símbolo pequeno dá um terço de pixel, e a do chão quase três', () => {
    const traco = espessuraDaTentativa * LADO_PEQUENO / simbolo.largura;
    expect(traco).toBeGreaterThan(0.3);
    expect(traco).toBeLessThan(0.37);
    const doChao = (chao.tipo === 'retangulo' ? chao.altura : 0) * LADO_PEQUENO / simbolo.largura;
    expect(doChao).toBeGreaterThan(2.5);
    expect(doChao).toBeLessThan(3);
  });

  it('o roteiro da teoria é o de referência, e soma quinze', () => {
    const texto = textoDoTopico('quinze-minutos');
    /* O rótulo da teoria é mais curto que o da tela, que cabe numa linha de
       roteiro escrita à mão; declarado aqui, e não adivinhado. */
    const ROTULO: Record<string, string> = {
      demanda: 'A demanda e o público', proposta: 'A proposta aprovada', pecas: 'As peças',
      processo: 'Rascunhos e versões', retorno: 'O retorno e o que mudou', perguntas: 'Perguntas',
    };
    for (const p of PARTES_DA_FALA) {
      const linha = texto.split('\n').find(l => l.trim().startsWith(ROTULO[p.id]));
      expect(linha, `o roteiro da teoria não tem ${p.nome}`).toBeTruthy();
      expect(linha!.trim().endsWith(String(ROTEIRO_DE_REFERENCIA[p.id])), linha).toBe(true);
    }
    expect(minutosDo(ROTEIRO_DE_REFERENCIA)).toBe(MINUTOS_DA_APRESENTACAO);
    expect(texto).toContain(`${MINUTOS_DA_APRESENTACAO}`);
  });

  it('as imagens e os arquivos que a teoria nomeia existem no projeto', () => {
    const origem = textoDoTopico('origem-declarada');
    for (const i of IMAGENS_DO_PROJETO) expect(origem).toContain(i.nome.replace(/\.jpg$/, '').split('.')[0]);
    expect(origem).toContain('Ana Souza');
    expect(CREDITO_DA_FOGUEIRA).toContain('Ana Souza');
    const nomes = pastaComoChegou().arquivos.map(a => a.nome);
    const entrega = textoDoTopico('editavel-e-final');
    for (const n of ['simbolo.svg', 'convite.sla', 'post.svg', 'acampamento-tratada.xcf', 'simbolo.png', 'convite.pdf', 'post.png', 'acampamento-tratada.jpg']) {
      expect(nomes, n).toContain(n);
      expect(entrega, n).toContain(n);
    }
  });

  it('os sete do retorno da teoria são os do laboratório, com o mesmo lado', () => {
    const texto = textoDoTopico('cinco-do-publico');
    for (const r of RESPONDENTES) {
      const linha = texto.split('\n').find(l => l.trim().startsWith(r.nome));
      expect(linha, `a teoria não lista ${r.nome}`).toBeTruthy();
      expect(linha!.includes('não é do público'), linha).toBe(!r.doPublico);
    }
  });
});
