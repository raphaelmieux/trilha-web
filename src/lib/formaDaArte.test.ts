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

  Com quarenta e três desenhos no repositório e mais por vir, conferir isso a
  olho é conferir a primeira leva e confiar no resto.

  A trava lê só o que já chegou: a arte é condição para **abrir**, e não para
  anunciar — percurso anunciado sem desenho continua caindo no espaço reservado
  do `Emblema`, que é o comportamento certo. Quem cobra a existência do arquivo
  é `index.test.ts`, para as trilhas, e `veredas.test.ts`, para as veredas.
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

const TRILHAS = comArte(getAllSpecialties().map(s => s.code));
const VEREDAS_COM_ARTE = comArte(VEREDAS.map(v => v.code));

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
