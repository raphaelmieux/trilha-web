import type { Paragrafo } from './documento';
import {
  acrescentarAoDicionario, ouvirDicionario, palavrasDoDicionario,
} from '../lib/dicionarioPessoal';

/*
  O sublinhado vermelho do Word: as palavras que o dicionário não conhece.

  ── O dicionário é o do LibreOffice, e o motor é o Hunspell ────────────────
  É o VERO, o verificador do português do Brasil que o LibreOffice usa
  (`dictionary-pt`, LGPL-3.0 ou MPL-2.0), lido pelo próprio Hunspell compilado
  para o navegador (`hunspell-wasm`). Um dicionário menor, de lista de
  palavras, sublinharia "desbravadores" e "inscrevê-lo"; um maior, de frequência
  tirada da internet, deixaria passar "pra" e "excessão". E as duas outras
  formas de ler o VERO não cabem: o nspell, em JavaScript, não termina de
  carregá-lo em três minutos, e expandi-lo numa lista dá 83 milhões de formas.
  O Hunspell o carrega em um terço de segundo.

  ── Quem decide o que se confere é o modelo, e não a tela ──────────────────
  As palavras saem do parágrafo do documento, e não do texto da página: o campo
  ("Figura 1") é um objeto e não palavra, e o texto riscado de uma revisão já
  saiu do documento — sublinhar o que ninguém vai entregar seria reclamar do que
  já foi resolvido. A tela só recebe as posições.

  ── O que o Word não confere, este também não ──────────────────────────────
  Palavra em MAIÚSCULAS, palavra com número e endereço de internet ficam de
  fora, que são as três caixas que o Word traz marcadas de fábrica em Opções ›
  Revisão de Texto. Sublinhar "PIX" ou "2º" ensinaria a ignorar o vermelho.
*/

/**
 * As palavras que o dicionário do LibreOffice não traz e que a plataforma
 * escreve de propósito: o dicionário personalizado do computador do clube.
 *
 * Mora aqui, e não em cada aparelho, porque são palavras dos documentos que a
 * plataforma entrega — "Raphael" é a grafia do nome de quem fez a plataforma,
 * e o VERO só conhece "Rafael". Sublinhá-la ensinaria a corrigir um nome que
 * está certo. Palavra nova entra aqui quando um documento de laboratório a
 * usa, e a trava de `ortografia.test.ts` diz qual.
 */
export const PALAVRAS_DO_CLUBE: readonly string[] = ['Raphael'];

/** Uma palavra do parágrafo, com as posições dela em unidades do modelo. */
export interface PalavraNoTexto {
  palavra: string;
  ini: number;
  fim: number;
}

/** O que o corretor sabe responder: se a palavra existe, e o que pôr no lugar. */
export interface Corretor {
  confere: (palavra: string) => boolean;
  sugere: (palavra: string) => string[];
  /**
   * Adicionar ao Dicionário. No corretor de verdade é `acrescentarAoDicionario`:
   * a palavra entra no dicionário pessoal, que vale em toda simulação.
   */
  acrescentar: (palavra: string) => void;
}

/*
  Letras, com hífen ou apóstrofo **entre** letras: "mandá-lo", "guarda-chuva" e
  "d'água" são uma palavra só para o dicionário, como são para o Word. Hífen na
  ponta é pontuação.
*/
const PALAVRA = /\p{L}+(?:[-'’]\p{L}+)*/gu;

/** Caractere que, colado na palavra, faz dela pedaço de endereço ou de número. */
const VIZINHO_QUE_ANULA = /[\p{N}@/\\_.:]/u;

/**
 * As palavras de uma linha de texto que o corretor deve conferir.
 *
 * O ponto conta como vizinho que anula só quando vem colado dos dois lados de
 * alguma coisa — "clube.org" —, e não no fim de uma frase: "acampamento." é a
 * palavra "acampamento" seguida de ponto final.
 */
export function palavrasDoTexto(texto: string): PalavraNoTexto[] {
  const saida: PalavraNoTexto[] = [];
  for (const m of texto.matchAll(PALAVRA)) {
    const ini = m.index ?? 0;
    const fim = ini + m[0].length;
    const antes = texto[ini - 1];
    const depois = texto[fim];
    const depoisDoDepois = texto[fim + 1];
    const colado = (c: string | undefined) => !!c && VIZINHO_QUE_ANULA.test(c);
    /* "www.clube" e "clube.org": ponto com letra do outro lado é endereço. */
    const pontoQueEndereca = (depois === '.' && !!depoisDoDepois && /[\p{L}\p{N}]/u.test(depoisDoDepois))
      || (antes === '.' && ini >= 2 && /[\p{L}\p{N}]/u.test(texto[ini - 2]));
    if ((colado(antes) && antes !== '.') || (colado(depois) && depois !== '.') || pontoQueEndereca) continue;
    if (!deveConferir(m[0])) continue;
    saida.push({ palavra: m[0], ini, fim });
  }
  return saida;
}

/** Palavra em maiúsculas não se confere: é sigla, e o Word pula as siglas. */
export function deveConferir(palavra: string): boolean {
  const letras = palavra.replace(/[-'’]/g, '');
  if (letras.length > 1 && letras === letras.toLocaleUpperCase('pt-BR') && letras !== letras.toLocaleLowerCase('pt-BR')) return false;
  return true;
}

/**
 * O parágrafo como o corretor o lê: texto riscado, quebra de linha e campo
 * viram separador, e o resto fica no lugar — as posições continuam sendo as do
 * modelo, que é o que a tela e o menu precisam.
 */
export function textoConferivel(b: Paragrafo<string>): string {
  return b.trechos.map(x => {
    const quebra = x.quebra ? ' ' : '';
    if (x.campo) return quebra + ' ';
    if (x.revisao?.tipo === 'excluido') return quebra + ' '.repeat(x.texto.length);
    return quebra + x.texto;
  }).join('');
}

/** As palavras do parágrafo que o dicionário não conhece. */
export function errosDoParagrafo(b: Paragrafo<string>, c: Pick<Corretor, 'confere'>, ignoradas?: ReadonlySet<string>): PalavraNoTexto[] {
  return palavrasDoTexto(textoConferivel(b))
    .filter(p => !ignoradas?.has(p.palavra) && !c.confere(p.palavra));
}

/** A palavra do parágrafo em que a posição cai — no meio dela ou numa das pontas. */
export function palavraNaPosicao(b: Paragrafo<string>, offset: number): PalavraNoTexto | null {
  return palavrasDoTexto(textoConferivel(b)).find(p => p.ini <= offset && offset <= p.fim) ?? null;
}

/* ── O corretor de verdade, carregado uma vez ─────────────────────────────── */

let carregado: Corretor | null = null;
let carregando: Promise<Corretor | null> | null = null;

/** O corretor, se já estiver carregado. */
export const corretorPronto = (): Corretor | null => carregado;

/**
 * Instala um corretor sem carregar o Hunspell. É a porta das travas: no jsdom
 * não há WebAssembly servido pelo Vite, e o que se confere lá é o que a tela
 * faz com a resposta, e não o dicionário.
 */
export function instalarCorretor(c: Corretor | null) {
  carregado = c;
  carregando = null;
}

/**
 * Carrega o Hunspell e o dicionário, uma vez por página. Falhar não estoura
 * nada: sem dicionário a folha fica sem sublinhado, que é o que acontece com o
 * Word sem o pacote de revisão do idioma.
 */
export function carregarCorretor(): Promise<Corretor | null> {
  if (carregado) return Promise.resolve(carregado);
  if (carregando) return carregando;
  carregando = (async () => {
    try {
      const [{ createHunspellFromStrings }, aff, dic] = await Promise.all([
        import('hunspell-wasm'),
        import('../../node_modules/dictionary-pt/index.aff?url').then(m => fetch(m.default)).then(r => r.text()),
        import('../../node_modules/dictionary-pt/index.dic?url').then(m => fetch(m.default)).then(r => r.text()),
      ]);
      const h = await createHunspellFromStrings(aff, dic);
      const memoria = new Map<string, boolean>();
      for (const p of PALAVRAS_DO_CLUBE) h.addWord(p);
      /*
        O dicionário pessoal entra no Hunspell, e não numa lista consultada ao
        lado: é o Hunspell que sabe que "Brasilândia" no começo da frase e
        "brasilândia" são a mesma palavra. E ele é ouvido, porque a palavra
        acrescentada em outra simulação — ou chegada da conta depois de a
        página abrir — precisa valer aqui sem recarregar.
      */
      let pessoais = new Set(palavrasDoDicionario());
      for (const p of pessoais) h.addWord(p);
      ouvirDicionario(agora => {
        for (const p of agora) if (!pessoais.has(p)) h.addWord(p);
        for (const p of pessoais) if (!agora.has(p) && !PALAVRAS_DO_CLUBE.includes(p)) h.removeWord(p);
        pessoais = new Set(agora);
        memoria.clear();
      });
      const c: Corretor = {
        confere: palavra => {
          let r = memoria.get(palavra);
          if (r === undefined) { r = h.testSpelling(palavra); memoria.set(palavra, r); }
          return r;
        },
        sugere: palavra => h.getSpellingSuggestions(palavra).slice(0, 5),
        acrescentar: acrescentarAoDicionario,
      };
      carregado = c;
      return c;
    } catch {
      carregando = null;
      return null;
    }
  })();
  return carregando;
}
