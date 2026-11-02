// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { VEREDAS, type TopicoDeVereda } from './veredas';
import { ROTEIROS, imagensDoRoteiro } from '../exemplos/roteiros';
import { CENAS } from '../exemplos/cenas';

/*
  As telas que as lições mostram, conferidas contra os roteiros e o disco.

  Imagem que a lição cita e o repositório não tem sai como um quadro quebrado no
  meio da teoria, e nada no CI acusaria: o Pages serve o que existe. Imagem que
  existe e ninguém cita é peso morto no download de todo mundo. E imagem sem
  roteiro é a que ninguém sabe refazer — no dia em que a janela mudar, ela fica
  mostrando o programa de antes, e a lição passa a apontar para um botão que a
  pessoa não encontra.
*/

const PASTA = join(__dirname, '..', '..', 'public', 'assets', 'exemplos');

const topicos = (): [string, TopicoDeVereda][] =>
  VEREDAS.flatMap(v => v.modulos.flatMap(m => m.licoes)
    .flatMap(l => (l.tipo === 'teoria' ? l.topicos.map(t => [v.code, t] as [string, TopicoDeVereda]) : [])));

const comTelas = () => topicos().filter(([, t]) => (t.telas ?? []).length > 0);

function larguraDoPng(caminho: string): number {
  const cabecalho = Buffer.alloc(24);
  const arquivo = openSync(caminho, 'r');
  try { readSync(arquivo, cabecalho, 0, 24, 0); } finally { closeSync(arquivo); }
  return cabecalho.readUInt32BE(16);
}

describe('as telas das lições de teoria', () => {
  it('toda tela citada existe, e tem o nome que o roteiro dá a ela', () => {
    const problemas: string[] = [];
    for (const [code, t] of comTelas()) {
      t.telas!.forEach((tela, i) => {
        const esperado = `${code}/${t.id}-${i + 1}.png`;
        if (tela.imagem !== esperado) problemas.push(`${code} ${t.id}: ${tela.imagem} devia ser ${esperado}`);
        if (!existsSync(join(PASTA, tela.imagem))) problemas.push(`${code} ${t.id}: falta ${tela.imagem}`);
      });
    }
    expect(problemas).toEqual([]);
  });

  it('o roteiro de cada tópico produz exatamente as telas que ele declara', () => {
    const problemas: string[] = [];
    for (const [code, t] of comTelas()) {
      const roteiros = ROTEIROS.filter(r => r.vereda === code && r.topico === t.id);
      if (roteiros.length !== 1) {
        problemas.push(`${code} ${t.id}: ${roteiros.length} roteiros`);
        continue;
      }
      const produz = imagensDoRoteiro(roteiros[0]);
      const declara = t.telas!.map(x => x.imagem);
      if (produz.join() !== declara.join()) problemas.push(`${code} ${t.id}: roteiro dá ${produz.length}, lição cita ${declara.length}`);
    }
    expect(problemas).toEqual([]);
  });

  /* Roteiro sem tópico é foto que ninguém mostra, refeita a cada captura. */
  it('todo roteiro serve a um tópico, e toda cena que ele abre existe', () => {
    const chaves = new Set(comTelas().map(([c, t]) => `${c}/${t.id}`));
    const orfaos = ROTEIROS.filter(r => !chaves.has(`${r.vereda}/${r.topico}`)).map(r => `${r.vereda}/${r.topico}`);
    const semCena = ROTEIROS.filter(r => !CENAS[r.cena]).map(r => `${r.topico}: ${r.cena}`);
    expect(orfaos).toEqual([]);
    expect(semCena).toEqual([]);
  });

  it('nenhuma imagem sobra na pasta sem lição que a cite', () => {
    const citadas = new Set(comTelas().flatMap(([, t]) => t.telas!.map(x => x.imagem)));
    const sobras = !existsSync(PASTA) ? [] : readdirSync(PASTA).flatMap(v =>
      readdirSync(join(PASTA, v)).map(f => `${v}/${f}`)).filter(f => !citadas.has(f));
    expect(sobras).toEqual([]);
  });

  /* A descrição é o que o leitor de tela lê no lugar da imagem. Igual à
     legenda, ela faria quem não vê ouvir a mesma frase duas vezes e nunca
     saber o que a tela mostra. */
  it('toda tela tem legenda e descrição, e as duas dizem coisas diferentes', () => {
    const problemas = comTelas().flatMap(([code, t]) => t.telas!
      .filter(x => x.legenda.trim().length < 12 || x.descricao.trim().length < 20 || x.legenda === x.descricao)
      .map(x => `${code} ${x.imagem}`));
    expect(problemas).toEqual([]);
  });

  /* Uma tela estreita demais fica ilegível quando a lição a estica para a
     largura da coluna. */
  it('as telas foram tiradas numa janela de computador', () => {
    const estreitas = comTelas().flatMap(([, t]) => t.telas!)
      .filter(x => existsSync(join(PASTA, x.imagem)) && larguraDoPng(join(PASTA, x.imagem)) < 800)
      .map(x => x.imagem);
    expect(estreitas).toEqual([]);
  });
});
