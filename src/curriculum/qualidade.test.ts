import { describe, it, expect } from 'vitest';
import { getAllSpecialties } from './index';
import { getFinalExamQuestions } from './finalExams';
import { veredasComConteudo, questoesDaVereda } from './veredas';
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
    return o.length > 1 && o.some(x => x.correct);
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
    const o = alternativas(q);
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
    const o = alternativas(q);
    const certa = o.find(x => x.correct)!;
    const outras = o.filter(x => x !== certa);
    const media = outras.reduce((s, x) => s + x.text.length, 0) / outras.length;
    return certa.text.length - media;
  });
  return difs.reduce((a, b) => a + b, 0) / difs.length;
}

/*
  As questões das veredas entram junto com as das lições.

  Uma vereda não é especialidade e não sai de `getAllSpecialties()` — mas
  cobra questão do mesmo desbravador, e por isso responde ao mesmo padrão. A
  trava que nasceu de um erro numa prova vale para toda pergunta que a
  plataforma faz.
*/
const licoes = [
  ...getAllSpecialties().flatMap(s =>
    s.modules.flatMap(m => m.lessons.flatMap(l => l.questions ?? []))),
  ...veredasComConteudo().flatMap(questoesDaVereda),
];
/*
  As provas saem do currículo, e não de uma lista escrita à mão.

  Estavam fixas em AP034 e AP035. A prova da AP041 nasceu fora dessa lista e,
  por isso, fora de todas as travas deste arquivo — questões novas sem motivo
  na alternativa errada, ou com a correta sempre mais comprida, passariam
  direto. Derivar da trilha faz a próxima prova entrar sozinha.
*/
const provas = getAllSpecialties()
  .filter(s => s.modules.some(m => m.lessons.some(l => l.labType === 'final_exam')))
  .flatMap(s => getFinalExamQuestions(s.code));

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
        const o = alternativas(q);
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

  /*
    `order` passou a carregar peso.

    Durante muito tempo ninguém leu esse campo: a correção deduzia o certo pela
    posição no array, e os itens chegavam à tela na ordem em que foram escritos
    — ou seja, resolvidos. Agora os itens são embaralhados e `order` é a única
    fonte da resposta, então um número repetido ou fora da faixa deixa de ser
    detalhe e passa a ser uma questão sem gabarito, que reprova quem acertar.
  */
  it('toda questão de ordenar numera os itens de 1 a n, sem repetir', () => {
    const quebradas: string[] = [];
    for (const q of [...licoes, ...provas].filter(q => q.type === 'ordering')) {
      const orders = (q.data.items ?? []).map(i => i.order);
      const esperado = orders.map((_, i) => i + 1).join();
      if ([...orders].sort((a, b) => a - b).join() !== esperado) {
        quebradas.push(`${q.id}: [${orders.join(', ')}]`);
      }
    }
    expect(quebradas, quebradas.join(' | ')).toEqual([]);
  });
});

describe('verdadeiro/falso não tem resposta previsível', () => {
  it('nem sempre a afirmação é verdadeira', () => {
    const vf = [...licoes, ...provas].filter(q => q.type === 'true_false');
    const verdadeiras = vf.filter(q =>
      (q.data.options ?? []).find(o => o.correct)?.text.toLowerCase().startsWith('verdadeiro'));
    const taxa = verdadeiras.length / vf.length;
    /* Sempre responder "Verdadeiro" não pode ser estratégia melhor que o acaso. */
    expect(taxa, `${verdadeiras.length} de ${vf.length} afirmações são verdadeiras`)
      .toBeGreaterThanOrEqual(0.3);
    expect(taxa).toBeLessThanOrEqual(0.7);
  });
});

describe('toda alternativa errada diz o que foi confundido', () => {
  /*
    A explicação da questão conta por que a resposta certa é certa — que não é o
    que precisa quem marcou outra coisa. Essa pessoa precisa saber o que
    confundiu. Uma questão nova sem esses motivos deixa quem erra sem retorno,
    então a build não deixa passar.
  */
  it('nenhuma alternativa incorreta fica sem motivo', () => {
    const semMotivo: string[] = [];
    for (const q of [...licoes, ...provas]) {
      const o = alternativas(q);
      if (!o.length || !o.some(x => x.correct)) continue;
      for (const x of o) {
        if (!x.correct && !x.porque) semMotivo.push(`${q.id}: "${x.text.slice(0, 40)}"`);
      }
    }
    expect(semMotivo, semMotivo.slice(0, 6).join(' | ')).toEqual([]);
  });

  it('a alternativa certa não carrega motivo de erro', () => {
    const indevidos = [...licoes, ...provas]
      .flatMap(q => alternativas(q).map(x => ({ q, x })))
      .filter(({ x }) => x.correct && x.porque)
      .map(({ q }) => q.id);
    expect(indevidos, 'motivo em alternativa correta confunde quem acertou').toEqual([]);
  });
});

/*
  Trava contra a mesma questão duas vezes.

  A prova da AP035 perguntava "O que é Inteligência Artificial generativa?" e,
  sete questões depois, "O que é IA generativa?" — mesmas alternativas, mesma
  explicação, mesma resposta certa. Quem fazia a prova acertava duas por saber
  uma, e a nota deixava de dizer o que dizia.

  Não dá para comparar enunciado só por igualdade de texto: as duas trocavam
  "Inteligência Artificial" por "IA" e escapavam. Então compara-se o que
  sobra depois de normalizar as siglas e tirar as palavras de ligação — e,
  separadamente, a alternativa correta, que é o que a repetição de fato
  entrega.
*/
const SINONIMOS: [RegExp, string][] = [
  [/inteligencia artificial/g, 'ia'],
  [/world wide web/g, 'web'],
  [/correio eletronico/g, 'email'],
  [/e mail/g, 'email'],
];
const LIGACAO = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e', 'em',
  'no', 'na', 'nos', 'nas', 'que', 'qual', 'quais', 'e', 'para', 'por', 'com',
  'ao', 'aos', 'se', 'sua', 'seu', 'sobre', 'the',
]);

function essencia(texto: string): Set<string> {
  let t = texto.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  for (const [de, para] of SINONIMOS) t = t.replace(de, para);
  return new Set(
    t.replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(p => p && !LIGACAO.has(p)),
  );
}

/** Quanto duas frases têm em comum, de 0 a 1. */
function parecenca(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  const juntos = new Set([...a, ...b]);
  let comuns = 0;
  for (const p of a) if (b.has(p)) comuns += 1;
  return comuns / juntos.size;
}

/*
  Acima disso, são a mesma pergunta escrita de dois jeitos.

  "O que é ia generativa" contra "o que é ia generativa" dá 1,0; as duas
  questões de HTTP e HTTPS da AP035, que são perguntas diferentes, ficam bem
  abaixo. Setenta por cento passa entre as duas sem apertar nenhuma.
*/
const PARECENCA_DEMAIS = 0.7;

describe('nenhuma prova cobra a mesma coisa duas vezes', () => {
  const provasPorTrilha = [
    ...getAllSpecialties()
      .filter(s => s.modules.some(m => m.lessons.some(l => l.labType === 'final_exam')))
      .map(s => [s.code, getFinalExamQuestions(s.code)] as const),
    /* A vereda inteira é um conjunto só: repetir a pergunta entre dois módulos
       dela é o mesmo defeito que repeti-la dentro de uma prova. */
    ...veredasComConteudo().map(v => [v.code, questoesDaVereda(v)] as const),
  ];

  it('nenhum par de enunciados diz a mesma coisa', () => {
    const repetidos: string[] = [];
    for (const [trilha, qs] of provasPorTrilha) {
      const essencias = qs.map(q => ({ id: q.id, palavras: essencia(q.prompt) }));
      for (let i = 0; i < essencias.length; i++) {
        for (let j = i + 1; j < essencias.length; j++) {
          const p = parecenca(essencias[i].palavras, essencias[j].palavras);
          if (p >= PARECENCA_DEMAIS) {
            repetidos.push(`${trilha}: ${essencias[i].id} e ${essencias[j].id} (${p.toFixed(2)})`);
          }
        }
      }
    }
    expect(repetidos).toEqual([]);
  });

  it('nenhuma resposta certa aparece em duas questões', () => {
    const repetidas: string[] = [];
    for (const [trilha, qs] of provasPorTrilha) {
      const vistas = new Map<string, string>();
      for (const q of qs) {
        const certa = alternativas(q).find(o => o.correct);
        /* Verdadeiro/falso fica de fora: "Verdadeiro" é a resposta certa de
           metade delas, e isso é a natureza do tipo, não repetição. */
        if (!certa || q.type === 'true_false') continue;
        const chave = [...essencia(certa.text)].sort().join(' ');
        const antes = vistas.get(chave);
        if (antes) repetidas.push(`${trilha}: ${antes} e ${q.id} — "${certa.text.slice(0, 60)}…"`);
        else vistas.set(chave, q.id);
      }
    }
    expect(repetidas).toEqual([]);
  });
});
