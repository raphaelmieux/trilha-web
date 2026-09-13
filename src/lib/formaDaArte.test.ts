import { describe, it, expect } from 'vitest';
import { existsSync, openSync, readSync, closeSync } from 'node:fs';
import { getAllSpecialties } from '../curriculum';
import { VEREDAS } from '../curriculum/veredas';

/*
  Emblema de trilha é elipse deitada; o de vereda é círculo.

  Não é enfeite, e não é uma escolha de CSS: o `Emblema` tira a proporção da
  **própria imagem**, no `onLoad`, e a moldura toma a forma dela — 50% de raio
  numa caixa 1.27:1 é elipse, numa caixa 1:1 é círculo. Foi assim justamente
  para que arte nova, em qualquer proporção, chegasse certa sem ninguém
  atualizar uma lista de códigos.

  O outro lado dessa decisão é que a forma passou a ser responsabilidade do
  arquivo. Um emblema de trilha entregue quadrado não estoura nada: ele é
  desenhado como um círculo perfeito, e o que o desbravador lê no painel é
  "isto aqui é uma vereda". O contrário também — uma vereda deitada vira
  elipse e se disfarça de especialidade. Os dois erros são invisíveis de
  dentro, que é a definição do que precisa de trava aqui.

  São sessenta e quatro desenhos — treze trilhas e cinquenta e uma veredas —, e
  conferir isso a olho é conferir a primeira leva e confiar no resto.

  Quem cobra que o arquivo **exista** é `index.test.ts`, para as trilhas, e
  `veredas.test.ts`, para as veredas; aqui se cobra a forma dele. A divisão
  importa: enquanto faltava arte, esta trava lia só o que já tinha chegado, e
  essa tolerância virou um buraco no dia em que as duas outras passaram a
  cobrar de todo mundo — arte que sumisse encolheria a lista daqui em silêncio.
  Por isso a lista é conferida contra o registro inteiro antes de qualquer
  medida ser tomada.
*/

/** Largura e altura de um PNG, lidas do cabeçalho IHDR. */
function tamanhoDoPng(caminho: string): { largura: number; altura: number } {
  const cabecalho = Buffer.alloc(24);
  const arquivo = openSync(caminho, 'r');
  try {
    readSync(arquivo, cabecalho, 0, 24, 0);
  } finally {
    closeSync(arquivo);
  }
  /* Assinatura (8) + comprimento do bloco (4) + "IHDR" (4) = 16, e aí os dois
     inteiros de 32 bits. Se o arquivo não for PNG, isto devolve lixo — e é por
     isso que o teste confere a assinatura antes de acreditar no número. */
  expect(cabecalho.subarray(1, 4).toString('ascii'), `${caminho} não é um PNG`).toBe('PNG');
  return { largura: cabecalho.readUInt32BE(16), altura: cabecalho.readUInt32BE(20) };
}

const emblemaDe = (code: string) => `public/assets/specialties/${code}.png`;

/** Os percursos registrados que já têm desenho, de cada tipo. */
const comArte = (codigos: string[]) => codigos.filter(c => existsSync(emblemaDe(c)));

const TODAS_AS_TRILHAS = getAllSpecialties().map(s => s.code);
const TODAS_AS_VEREDAS = VEREDAS.map(v => v.code);
const TRILHAS = comArte(TODAS_AS_TRILHAS);
const VEREDAS_COM_ARTE = comArte(TODAS_AS_VEREDAS);

describe('a forma do emblema diz de que tipo é o percurso', () => {
  /*
    Filtro que esvaziasse as listas deixaria a build verde por não ter conferido
    nada — a armadilha do "zero link não é zero link quebrado" aplicada à
    própria trava. E precisa haver os **dois** tipos: uma lista cheia de
    trilhas e vazia de veredas aprovaria metade da regra calada.
  */
  it('há arte das duas espécies para a trava conferir', () => {
    expect(TRILHAS.length, 'nenhuma trilha com emblema no repositório').toBeGreaterThan(0);
    expect(VEREDAS_COM_ARTE.length, 'nenhuma vereda com emblema no repositório').toBeGreaterThan(0);
  });

  /*
    E o filtro não descarta ninguém.

    Ele existia para a época em que faltava arte: conferia a forma do que já
    tinha chegado e deixava o resto passar. Hoje as sessenta e quatro têm
    desenho, e `index.test.ts` e `veredas.test.ts` cobram a existência de cada
    uma — então um percurso caindo fora daqui só pode significar que a arte
    dele sumiu, e a trava de forma passaria a examinar uma lista menor sem
    dizer nada. É o filtro que esvazia, aplicado a um percurso de cada vez.
  */
  it('nenhum percurso registrado fica de fora por falta de arte', () => {
    expect(TRILHAS).toEqual(TODAS_AS_TRILHAS);
    expect(VEREDAS_COM_ARTE).toEqual(TODAS_AS_VEREDAS);
  });

  /* A arte da especialidade é o patch que se costura na faixa: 710×558
     deitado, 1.27:1. A margem é larga de propósito — o que a trava recusa é a
     arte quadrada, e não um desenho alguns pixels fora da medida. */
  it.each(TRILHAS)('%s é uma elipse deitada, como o patch da faixa', code => {
    const { largura, altura } = tamanhoDoPng(emblemaDe(code));
    expect(largura / altura,
      `${code} é uma trilha, e o emblema dela mede ${largura}×${altura}. `
      + 'Quadrado, o `Emblema` desenha um círculo perfeito — que é a forma da '
      + 'vereda, e é o que o desbravador vai ler no painel.',
    ).toBeGreaterThan(1.15);
  });

  /* A da vereda é um disco de 592×592. */
  it.each(VEREDAS_COM_ARTE)('%s é um círculo, como o disco da vereda', code => {
    const { largura, altura } = tamanhoDoPng(emblemaDe(code));
    expect(largura / altura,
      `${code} é uma vereda, e o emblema dela mede ${largura}×${altura}. `
      + 'Deitado, o `Emblema` desenha uma elipse — que é a forma da trilha, e a '
      + 'vereda passa a se anunciar como especialidade.',
    ).toBeCloseTo(1, 1);
  });

  /*
    E as duas formas são mesmo diferentes.

    As duas asserções acima passariam num repositório onde tudo fosse quadrado
    se as margens fossem generosas demais — cada uma olha um lado só. Esta
    compara os dois lados, que é o que a regra de fato diz.
  */
  it('a trilha é visivelmente mais larga do que a vereda', () => {
    const proporcao = (code: string) => {
      const { largura, altura } = tamanhoDoPng(emblemaDe(code));
      return largura / altura;
    };
    const trilha = Math.min(...TRILHAS.map(proporcao));
    const vereda = Math.max(...VEREDAS_COM_ARTE.map(proporcao));
    expect(trilha).toBeGreaterThan(vereda + 0.15);
  });
});
