import { describe, it, expect } from 'vitest';
import { slideNovo, mestreDoModelo, type Apresentacao, type Slide } from './apresentacao';
import { PALAVRAS_POR_MINUTO, roteiroDaApresentacao, tempoEscrito } from './roteiroDaApresentacao';

/*
  O roteiro da fala, conferido sobre uma apresentação neutra.

  ── Por que ela é neutra ─────────────────────────────────────────────────
  A trava mede **a palavra da plataforma**, e não a do conteúdo: o roteiro cita
  o título e o tópico de quem escreveu, então uma apresentação cujo texto
  dissesse "longo demais" faria a conta do "descreve, e não julga" acusar a
  plataforma de uma palavra que ela não disse. É a decisão escrita em
  `roteiroDePython.test.ts`, e aqui os títulos não dizem nada.
*/

const comSlides = (slides: Slide[]): Apresentacao =>
  ({ modelo: 'branco', mestre: mestreDoModelo('branco'), slides, pdf: null });

const slide = (id: string, titulo: string, topicos: string[] = [], extra: Partial<Slide> = {}): Slide =>
  ({ ...slideNovo(id, 'titulo-conteudo'), titulo, topicos, ...extra });

const TRES = comSlides([
  slide('a', 'Primeiro assunto', ['Ponto um']),
  slide('b', 'Segundo assunto', ['Ponto dois', 'Ponto três', 'Ponto quatro']),
  slide('c', 'Terceiro assunto'),
]);

const frases = (a: Apresentacao) => roteiroDaApresentacao(a).map(f => f.frase);

describe('o roteiro fala de cada slide, em primeira pessoa', () => {
  it('escreve uma fala por slide, na ordem', () => {
    const roteiro = roteiroDaApresentacao(TRES);
    expect(roteiro.map(f => f.slide)).toEqual(['a', 'b', 'c']);
    expect(roteiro.map(f => f.numero)).toEqual([1, 2, 3]);
  });

  /*
    Primeira pessoa, porque é para falar.

    "Este slide traz a data" se lê; "eu digo a data" se fala. É a distinção do
    roteiro de Python, e é ela que faz o roteiro servir de ensaio em vez de
    servir de descrição.
  */
  it('fala em primeira pessoa, e não descreve o slide de fora', () => {
    for (const f of frases(TRES)) {
      expect(f, `"${f}" não está em primeira pessoa`).toMatch(/^(Abro|Falo|Fecho)/);
      expect(f, `"${f}" descreve o slide de fora`).not.toMatch(/\beste slide\b/i);
    }
  });

  /*
    A abertura e o fecho são as duas partes que se ensaiam separadas, e por
    isso elas têm frase própria. Sem isso, o roteiro de oito slides sairia com
    oito frases iguais, que é o que faz alguém parar de ler.
  */
  it('a abertura abre e o fecho fecha', () => {
    const [primeira, , ultima] = frases(TRES);
    expect(primeira).toMatch(/^Abro/);
    expect(ultima).toMatch(/^Fecho/);
    expect(frases(TRES)[1]).toMatch(/^Falo/);
  });

  it('um tópico é "uma coisa só", e vários são contados', () => {
    const [um, varios] = frases(TRES);
    expect(um).toContain('uma coisa só');
    expect(varios).toContain('3 pontos');
    expect(varios, 'o roteiro não cita o primeiro ponto, que é por onde se começa')
      .toContain('Ponto dois');
  });

  it('e o slide sem tópico nenhum não inventa ponto', () => {
    const semNada = frases(TRES)[2];
    expect(semNada).not.toMatch(/pontos?/);
  });

  /*
    E os títulos aqui também não dizem nada, pela mesma razão.

    A primeira versão deste caso chamava os slides de "Com foto" e "Com
    gráfico" — e aí a asserção passava pelo **título**, e não pela frase que a
    plataforma escreve: a mutação que tirou o gráfico da fala sobreviveu.
    Medir a palavra da plataforma exige que o conteúdo não a diga.
  */
  it('a foto e o gráfico entram na fala', () => {
    const comArte = comSlides([
      slide('a', 'Primeiro assunto'),
      slide('b', 'Segundo assunto', [], {
        imagens: [{ id: 'i', legenda: 'f.jpg', largura: 40, pixelsLargura: 800, pixelsAltura: 600 }],
      }),
      slide('c', 'Terceiro assunto', [], {
        grafico: { id: 'g', como: 'incorporado', planilha: 'p.xlsx', retrato: [{ rotulo: 'A', valor: 1 }] },
      }),
    ]);
    expect(frases(comArte)[1]).toContain('foto');
    expect(frases(comArte)[2]).toContain('gráfico');
    /* E o slide sem nenhum dos dois não fala de nenhum dos dois. */
    expect(frases(comArte)[0]).not.toMatch(/foto|gráfico/);
  });

  /*
    A nota entra como **lembrete**, e não transcrita.

    Ela é o que se fala a mais, e um roteiro que a copiasse inteira viraria o
    teleprompter que a nota existe para dispensar — e quem lê roteiro para de
    olhar para a sala.
  */
  it('a nota entra como lembrete, e não transcrita', () => {
    const comNota = comSlides([
      slide('a', 'Abertura', [], {
        notas: 'Contar o caso do ano passado, que explica a regra, e emendar com o aviso do portão.',
      }),
      slide('b', 'Fecho'),
    ]);
    const fala = frases(comNota)[0];
    expect(fala).toContain('a nota me lembra de');
    expect(fala).toContain('contar o caso do ano passado');
    expect(fala, 'a nota saiu transcrita inteira')
      .not.toContain('emendar com o aviso do portão');
  });

  it('e o slide sem nota não fala de nota nenhuma', () => {
    expect(frases(TRES)[0]).not.toContain('nota');
  });

  /*
    Ele descreve, e não julga.

    É a trava do roteiro de Python e da régua de status do Word: um roteiro que
    opinasse poria na nossa tela a resposta que o módulo 10 existe para a
    pessoa descobrir no ensaio.
  */
  it('não julga a apresentação', () => {
    const julgamentos = [
      'demais', 'pouco', 'errado', 'ruim', 'confuso', 'deveria', 'melhor',
      'pesado', 'cheio', 'exagerad', 'evite', 'cuidado', 'problema',
    ];
    const carregado = comSlides([
      slide('a', 'Abertura', ['Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete']),
      slide('b', 'Fecho', ['Oito']),
    ]);
    for (const f of [...frases(TRES), ...frases(carregado)]) {
      for (const palavra of julgamentos) {
        expect(f.toLowerCase(), `o roteiro julgou: "${f}"`).not.toContain(palavra);
      }
    }
  });
});

describe('o tempo que o roteiro estima', () => {
  /*
    O que gasta tempo é a fala, e a nota é onde ela está escrita.

    Contar só o que projeta diria que oito slides enxutos levam um minuto, e
    quem confiasse nessa conta descobriria o contrário na frente do examinador.
  */
  it('conta a nota, e não só o que projeta', () => {
    const comNota = comSlides([slide('a', 'Abertura', ['Um'], {
      notas: 'Uma frase de dez palavras aqui dentro para a conta subir um pouco.',
    })]);
    const sem = comSlides([slide('a', 'Abertura', ['Um'])]);
    expect(roteiroDaApresentacao(comNota)[0].segundos)
      .toBeGreaterThan(roteiroDaApresentacao(sem)[0].segundos);
  });

  it('e o ritmo é o de quem explica, e não o de quem conversa', () => {
    /* Cento e trinta por minuto: a leitura em voz alta pausada. Acima de cento
       e sessenta é conversa, e abaixo de cem é ditado. */
    expect(PALAVRAS_POR_MINUTO).toBeGreaterThanOrEqual(100);
    expect(PALAVRAS_POR_MINUTO).toBeLessThanOrEqual(160);
  });

  it('o tempo se escreve como alguém o leria', () => {
    expect(tempoEscrito(45)).toBe('45s');
    expect(tempoEscrito(60)).toBe('1min');
    expect(tempoEscrito(95)).toBe('1min 35s');
  });
});
