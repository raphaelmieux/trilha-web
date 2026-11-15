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

  E o pin largo tem a proporção escrita no catálogo, porque o empacotamento
  reserva o lugar antes de a imagem carregar. O número escrito precisa ser o
  do arquivo: arte trocada por outra de outra largura deixaria o desenho
  espremido no lugar antigo, ou um vão sobrando ao lado dele.
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

  const largos = CURIOSIDADES.filter(c => c.proporcao);
  it('o pin largo existe, e é o que deve se destacar', () => {
    expect(largos.map(c => c.code)).toEqual(['fim_da_planilha']);
  });

  it.each(largos)('$code tem no catálogo a proporção do arquivo', c => {
    const { largura, altura } = tamanhoDoPng(join(PASTA, `${c.code}.png`));
    expect(c.proporcao).toBeGreaterThan(1);
    expect(Math.abs(c.proporcao! - largura / altura) / (largura / altura)).toBeLessThan(0.02);
  });
});
