import { describe, it, expect } from 'vitest';
import { getAllSpecialties } from './index';
import { getFinalExamQuestions } from './finalExams';
import type { Question } from '../types';

/*
  Trava contra questões que se acertam sem saber a matéria.

  A auditoria de 21/08/2026 encontrou a alternativa correta sendo a mais longa
  em 86% das questões de lição e ~82% das de prova — o acaso seria 25%. Quem
  marcasse sempre a maior acertava 83% da prova final, acima dos 75% de
  aprovação: dava para se certificar sem ter estudado.

  As alternativas são embaralhadas antes de aparecer, então a posição não vaza.
  O comprimento sobrevive ao embaralhamento, e é o que estes testes vigiam.
*/

function alternativas(q: Question) {
  return q.data.options ?? q.data.scenarios ?? [];
}

function comAlternativas(qs: Question[]) {
  return qs.filter(q => {
    const o = alternativas(q);
    /* Verdadeiro/falso fica de fora: "Verdadeiro" é inevitavelmente mais longo
       que "Falso", e com duas opções escolher a maior é escolher sempre
       "Verdadeiro" — o que esse tipo tem de vazar está no teste abaixo. */
    if (q.type === 'true_false') return false;
    return o.length > 1 && o.some((x: any) => x.correct);
  });
}

/*
  Conta só a vantagem que dá para enxergar de relance.

  Numa questão de siglas — SMTP, HTTP, POP3, FTP — a "maior" ganha por um
  caractere, e emparelhar isso seria inventar texto sem ganho nenhum. O que
  denuncia a resposta é a correta ser visivelmente mais longa que todas as
  outras, não ganhar por pouco.
*/
const VANTAGEM_VISIVEL = 12;

function proporcaoMaiorEhCorreta(qs: Question[]): { taxa: number; total: number; casos: string[] } {
  const casos: string[] = [];
  const alvo = comAlternativas(qs);
  for (const q of alvo) {
    const o = alternativas(q) as any[];
    const certa = o.find(x => x.correct)!;
    const maiorErrada = o.filter(x => x !== certa)
      .reduce((a, b) => (b.text.length > a.text.length ? b : a));
    if (certa.text.length - maiorErrada.text.length >= VANTAGEM_VISIVEL) casos.push(q.id);
  }
  return { taxa: casos.length / alvo.length, total: alvo.length, casos };
}

/** Quantos caracteres a correta tem a mais que a média das erradas. */
function vantagemMedia(qs: Question[]): number {
  const difs = comAlternativas(qs).map(q => {
    const o = alternativas(q) as any[];
    const certa = o.find(x => x.correct)!;
    const outras = o.filter(x => x !== certa);
    const media = outras.reduce((s, x) => s + x.text.length, 0) / outras.length;
    return certa.text.length - media;
  });
  return difs.reduce((a, b) => a + b, 0) / difs.length;
}

const licoes = getAllSpecialties().flatMap(s =>
  s.modules.flatMap(m => m.lessons.flatMap(l => l.questions ?? [])));
const provas = [...getFinalExamQuestions('AP034'), ...getFinalExamQuestions('AP035')];

describe('as alternativas não entregam a resposta pelo tamanho', () => {
  /* Alguma variação de redação é inevitável; o que não pode é "marque a mais
     comprida" ser uma estratégia melhor do que estudar. */
  const TETO = 0.35;

  it('nas lições', () => {
    const { taxa, total, casos } = proporcaoMaiorEhCorreta(licoes);
    expect(taxa, `${casos.length} de ${total} questões: ${casos.slice(0, 8).join(', ')}`)
      .toBeLessThanOrEqual(TETO);
  });

  it('nas provas finais, que decidem o certificado', () => {
    const { taxa, total, casos } = proporcaoMaiorEhCorreta(provas);
    expect(taxa, `${casos.length} de ${total} questões: ${casos.slice(0, 8).join(', ')}`)
      .toBeLessThanOrEqual(TETO);
  });

  it('a correta não é sistematicamente mais comprida', () => {
    /* Poucos caracteres de diferença é ruído de redação; dezenas são um sinal. */
    expect(Math.abs(vantagemMedia(licoes))).toBeLessThanOrEqual(10);
    expect(Math.abs(vantagemMedia(provas))).toBeLessThanOrEqual(10);
  });

  /*
    A medida solta, para além da vantagem visível: com que frequência a correta
    é simplesmente a linha mais comprida da questão? Hoje está em 17% nas lições
    e 7% nas provas — abaixo dos 25% do acaso, ou seja, olhar o tamanho rende
    menos que chutar. O teto deixa margem para redação futura sem permitir que o
    padrão volte.
  */
  it('marcar a mais comprida não rende mais que o acaso', () => {
    const ehAMaior = (qs: Question[]) => {
      const alvo = comAlternativas(qs);
      const n = alvo.filter(q => {
        const o = alternativas(q) as any[];
        return o.reduce((a, b) => (b.text.length > a.text.length ? b : a)) === o.find(x => x.correct);
      }).length;
      return n / alvo.length;
    };
    expect(ehAMaior(licoes), 'lições').toBeLessThanOrEqual(0.35);
    expect(ehAMaior(provas), 'provas').toBeLessThanOrEqual(0.35);
  });
});

describe('as questões de ordenar não trazem a resposta no enunciado', () => {
  it('nenhum item exibe o ano do próprio evento', () => {
    const comData = [...licoes, ...provas]
      .filter(q => q.type === 'ordering')
      .filter(q => (q.data.items ?? []).some(i => /\b(19|20)\d{2}\b/.test(i.text)))
      .map(q => q.id);
    expect(comData, 'ordenar por data escrita na tela não mede conhecimento').toEqual([]);
  });
});

describe('verdadeiro/falso não tem resposta previsível', () => {
  it('nem sempre a afirmação é verdadeira', () => {
    const vf = [...licoes, ...provas].filter(q => q.type === 'true_false');
    const verdadeiras = vf.filter(q =>
      (q.data.options ?? []).find((o: any) => o.correct)?.text.toLowerCase().startsWith('verdadeiro'));
    const taxa = verdadeiras.length / vf.length;
    /* Sempre responder "Verdadeiro" não pode ser estratégia melhor que o acaso. */
    expect(taxa, `${verdadeiras.length} de ${vf.length} afirmações são verdadeiras`)
      .toBeGreaterThanOrEqual(0.3);
    expect(taxa).toBeLessThanOrEqual(0.7);
  });
});
