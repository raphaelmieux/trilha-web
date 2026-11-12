// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHunspellFromStrings } from 'hunspell-wasm';
import { PALAVRAS_DO_CLUBE, errosDoParagrafo, palavraNaPosicao, palavrasDoTexto, textoConferivel } from './ortografia';
import { ehParagrafo, type Paragrafo } from './documento';

/*
  O corretor de verdade roda aqui: o Hunspell em WebAssembly, lendo o mesmo
  dicionário que a página baixa. Ambiente node, porque no jsdom o WebAssembly
  procuraria o arquivo pela rede.
*/
let hunspell: Awaited<ReturnType<typeof createHunspellFromStrings>>;
const confere = (w: string) => hunspell.testSpelling(w);

beforeAll(async () => {
  const d = 'node_modules/dictionary-pt/';
  hunspell = await createHunspellFromStrings(readFileSync(d + 'index.aff', 'utf8'), readFileSync(d + 'index.dic', 'utf8'));
  /* O mesmo dicionário do clube que a página acrescenta ao carregar. */
  for (const p of PALAVRAS_DO_CLUBE) hunspell.addWord(p);
}, 60000);

const paragrafo = (trechos: Paragrafo<string>['trechos']): Paragrafo<string> =>
  ({ tipo: 'paragrafo', id: 'p', estilo: 'normal', trechos } as unknown as Paragrafo<string>);

describe('as palavras que se conferem', () => {
  it('hífen e apóstrofo entre letras fazem uma palavra só, e pontuação na ponta não entra', () => {
    expect(palavrasDoTexto('Vou mandá-lo amanhã, guarda-chuva e copo d’água.').map(p => p.palavra))
      .toEqual(['Vou', 'mandá-lo', 'amanhã', 'guarda-chuva', 'e', 'copo', 'd’água']);
  });

  /* As três caixas que o Word traz marcadas: maiúsculas, número e endereço. */
  it('sigla, palavra com número e endereço ficam de fora, e o ponto final não conta como endereço', () => {
    const lidas = palavrasDoTexto('Pague pelo PIX até o 2º dia, escreva para secretaria@clube.org ou veja www.clube.org.br no acampamento.')
      .map(p => p.palavra);
    expect(lidas).not.toContain('PIX');
    expect(lidas).not.toContain('º');
    expect(lidas).not.toContain('secretaria');
    expect(lidas).not.toContain('clube');
    expect(lidas).not.toContain('www');
    expect(lidas).toContain('acampamento');
  });

  it('o texto riscado e o campo viram separador, e as posições continuam as do modelo', () => {
    const p = paragrafo([
      { id: 'a', texto: 'Ola ' },
      { id: 'b', texto: 'acampamneto', revisao: { autor: 'voce', tipo: 'excluido' } },
      { id: 'c', texto: 'acampamento ' },
      { id: 'd', texto: '', campo: 'figura' },
      { id: 'e', texto: 'fim' },
    ] as never);
    const texto = textoConferivel(p);
    expect(texto.length).toBe('Ola '.length + 'acampamneto'.length + 'acampamento '.length + 1 + 'fim'.length);
    expect(palavrasDoTexto(texto).map(x => x.palavra)).toEqual(['Ola', 'acampamento', 'fim']);
  });

  it('a palavra na posição vale nas duas pontas e no meio, e nada no espaço entre duas', () => {
    const p = paragrafo([{ id: 'a', texto: 'um acampamneto bom' }] as never);
    expect(palavraNaPosicao(p, 3)?.palavra).toBe('acampamneto');
    expect(palavraNaPosicao(p, 8)?.palavra).toBe('acampamneto');
    expect(palavraNaPosicao(p, 14)?.palavra).toBe('acampamneto');
    expect(palavraNaPosicao(p, 2)?.palavra).toBe('um');
  });
});

describe('o dicionário do Brasil', () => {
  /* Palavra do clube que o VERO já conhecesse estaria ali à toa, e a lista
     cresceria sem ninguém saber por quê. */
  it('o dicionário do clube só traz o que o do LibreOffice não conhece', async () => {
    const d = 'node_modules/dictionary-pt/';
    const puro = await createHunspellFromStrings(readFileSync(d + 'index.aff', 'utf8'), readFileSync(d + 'index.dic', 'utf8'));
    expect(PALAVRAS_DO_CLUBE.filter(p => puro.testSpelling(p))).toEqual([]);
    expect(confere('Raphael')).toBe(true);
    puro.dispose();
  }, 60000);

  it('conhece o vocabulário do clube, conjugação e pronome inclusive', () => {
    for (const w of ['desbravadores', 'acampamento', 'inscrições', 'estudamos', 'mandá-lo', 'reunião', 'Brasília', 'exceção'])
      expect(confere(w), w).toBe(true);
  });

  it('sublinha o erro, e sugere a palavra certa', () => {
    expect(confere('acampamneto')).toBe(false);
    expect(hunspell.getSpellingSuggestions('acampamneto')).toContain('acampamento');
    expect(confere('onibus')).toBe(false);
    expect(hunspell.getSpellingSuggestions('onibus')).toContain('ônibus');
    expect(confere('excessão')).toBe(false);
    expect(hunspell.getSpellingSuggestions('excessão')).toContain('exceção');
  });

  /*
    O plural de "desbravador" que o Substituir Tudo sem "palavras inteiras"
    produz na CC-ES002 é exatamente o que o vermelho existe para mostrar.
  */
  it('sublinha o "desbravadors" que o Substituir Tudo descuidado deixa', () => {
    const p = paragrafo([{ id: 'a', texto: 'Os desbravadors chegaram cedo.' }] as never);
    expect(errosDoParagrafo(p, { confere }).map(e => e.palavra)).toEqual(['desbravadors']);
  });
});

/*
  Documento de laboratório que chega com palavra sublinhada é erro de
  digitação no conteúdo — ou um nome que o dicionário não conhece, e aí o
  vermelho tira a atenção do que a lição pede. A trava lê todo documento
  exportado pelos módulos dos laboratórios de texto.
*/
const MODULOS = import.meta.glob([
  './circularDoClube.ts', './diaDoDesbravador.ts', './entregaDoRelatorio.ts', './metasDaAp042.ts',
  './metasDaAp043.ts', './metasDaAp044.ts', './metasDaCcEs006.ts', './metasDaCcEs012.ts',
  './metasDaCcEs013.ts', './oficioDoClube.ts', './projetoDaFeira.ts', './relatorioAnual.ts',
  './relatorioDoAcampamento.ts', '../exemplos/*.ts',
], { eager: true });

describe('os documentos dos laboratórios', () => {
  it('chegam sem palavra sublinhada', () => {
    const erros: string[] = [];
    let documentos = 0;
    const visto = new Set<unknown>();
    const andar = (v: unknown, prof: number, onde: string) => {
      if (!v || typeof v !== 'object' || visto.has(v) || prof > 4) return;
      visto.add(v);
      const blocos = (v as { blocos?: unknown }).blocos;
      if (Array.isArray(blocos)) {
        documentos++;
        for (const b of blocos) {
          if (!ehParagrafo(b)) continue;
          for (const e of errosDoParagrafo(b, { confere })) erros.push(`${onde}: ${e.palavra}`);
        }
        return;
      }
      for (const x of Object.values(v)) andar(x, prof + 1, onde);
    };
    for (const [arquivo, m] of Object.entries(MODULOS)) {
      for (const [nome, x] of Object.entries(m as Record<string, unknown>)) {
        let valor = x;
        if (typeof x === 'function' && x.length === 0) {
          try { valor = (x as () => unknown)(); } catch { valor = null; }
        }
        andar(valor, 0, `${arquivo} › ${nome}`);
      }
    }
    /* Guarda contra o vazio: um glob que não achasse nada deixaria isto verde. */
    expect(documentos).toBeGreaterThanOrEqual(15);
    expect([...new Set(erros)]).toEqual([]);
  }, 60000);
});
