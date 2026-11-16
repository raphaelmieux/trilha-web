import { describe, it, expect } from 'vitest';
import { readdirSync, openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { CURIOSIDADES } from './catalogoDeCuriosidades';

/*
  A arte dos pins de curiosidade é achada pelo código, e o código é o nome do
  arquivo.

  Não há lista ligando um ao outro, pela regra das pastas de arte: basta pôr
  `public/assets/pins/<code>.png` e o pin acende com o desenho. O outro lado
  dessa regra é que um nome errado não estoura nada. A primeira leva chegou
  com `arquivo-escondido.png`, com hífen, e o código é `arquivo_escondido`: a
  Faixa pediria o arquivo com sublinhado, não acharia, e desenharia o pin
  provisório com a arte parada na pasta, sem ninguém saber por quê.

  E a arte desenhada fora do quadrado tem o tamanho escrito no catálogo,
  porque o empacotamento reserva o lugar antes de a imagem carregar. O número
  escrito precisa ser o do arquivo: arte trocada por outra de outro tamanho
  deixaria o desenho espremido no lugar antigo, ou um vão sobrando ao lado
  dele. E a conta é a da escala sobre a tela regular de 641 pontos, com o
  padrão de chão: a arte maior que a tela sai maior que o pin-padrão, e a
  menor cresce até ele — nenhuma fica menor do que as outras.
*/

const PASTA = join(__dirname, '../../public/assets/pins');

function tamanhoDoPng(caminho: string): { largura: number; altura: number } {
  const cabecalho = Buffer.alloc(24);
  const arquivo = openSync(caminho, 'r');
  try {
    readSync(arquivo, cabecalho, 0, 24, 0);
  } finally {
    closeSync(arquivo);
  }
  return { largura: cabecalho.readUInt32BE(16), altura: cabecalho.readUInt32BE(20) };
}

const arquivos = readdirSync(PASTA).filter(f => f.endsWith('.png'));
const codigos = new Set(CURIOSIDADES.map(c => c.code));

describe('a arte dos pins de curiosidade', () => {
  /* Pasta vazia deixaria as duas travas abaixo verdes por não ter conferido
     nada. */
  it('existe arte na pasta', () => {
    expect(arquivos.length).toBeGreaterThan(0);
  });

  it.each(arquivos)('%s tem o nome de uma curiosidade', arquivo => {
    expect(codigos.has(arquivo.replace(/\.png$/, '')),
      `${arquivo} não é o código de nenhuma curiosidade — a Faixa nunca vai pedi-lo`).toBe(true);
  });

  it('todo segredo tem arte', () => {
    const semArte = CURIOSIDADES
      .filter(c => c.tema === 'segredo' && !arquivos.includes(`${c.code}.png`))
      .map(c => c.code);
    expect(semArte).toEqual([]);
  });

  /* A tela em que a arte regular é desenhada. */
  const TELA = 641;
  const foraDoQuadrado = CURIOSIDADES.filter(c => c.tamanho);

  /* Arte maior que a tela regular sem o tamanho declarado é espremida no
     quadrado: sai encolhida ao lado das outras, e os contornos de duas artes
     vizinhas deixam de ter a espessura que têm uma em relação à outra. Era
     assim com nove pins, de 641 a 701 pontos, e nenhum teste via — a trava
     antiga conferia uma lista escrita à mão, e não os arquivos. */
  it.each(arquivos)('%s, maior que a tela regular, declara o tamanho', arquivo => {
    const { largura, altura } = tamanhoDoPng(join(PASTA, arquivo));
    if (Math.max(largura, altura) <= TELA) return;
    const c = CURIOSIDADES.find(x => `${x.code}.png` === arquivo);
    expect(c?.tamanho, `${arquivo} tem ${largura} × ${altura} e sairia encolhido no quadrado`).toBeDefined();
  });

  it.each(foraDoQuadrado)('$code tem no catálogo o tamanho do arquivo, e nunca menor que o padrão', c => {
    const { largura, altura } = tamanhoDoPng(join(PASTA, `${c.code}.png`));
    const escala = Math.min(TELA, Math.max(largura, altura));
    const [lw, la] = c.tamanho!;
    expect(Math.abs(lw - largura / escala)).toBeLessThan(0.02);
    expect(Math.abs(la - altura / escala)).toBeLessThan(0.02);
    expect(Math.max(lw, la)).toBeGreaterThanOrEqual(1);
  });

  /* O destaque é decisão, e não medida: a lista fechada é o que impede um
     pin de crescer sem ninguém ter decidido. */
  it('o destaque é só o que foi pedido', () => {
    expect(CURIOSIDADES.filter(c => c.destaque).map(c => [c.code, c.destaque])).toEqual([['zen_do_python', 2], ['gato_pintado', 2]]);
  });
});
