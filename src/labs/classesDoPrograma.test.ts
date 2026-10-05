/**
 * Classe de programa imitado usada na tela e definida em folha nenhuma.
 *
 * `.btn-ghost` é o caso que esta casa já pagou: três laboratórios o usavam e
 * ele **não existia em folha nenhuma** — saía como texto solto, sem área de
 * clique, sem erro no console e sem nada na tela dizendo que aquilo devia ser
 * um botão. `painelDoLaboratorio.test.ts` passou a cobrar as classes que a
 * moldura desenha; as dos programas imitados continuaram soltas.
 *
 * E não é defeito de uma vez: escrevendo a CC-ES012 eu inventei `fb-barra-lab`,
 * `fb-bt-lab`, `fb-tabela-respostas`, `fb-recado`, `fb-tipo-fixo`, `pp-mini`,
 * `pp-mini-numero` e `pp-regua` — oito nomes plausíveis, nenhum existindo, e o
 * `tsc` e o lint passando nos oito. No navegador o resultado é uma tela que
 * desenha quase certo: a barra sem fundo, a tabela sem borda, o aviso sem
 * recuo. Ninguém estranha, porque ninguém sabe como devia ser.
 *
 * ── Por que só as de programa, e por que o prefixo sai do repositório ────
 * As classes do Tailwind são geradas e são milhares; cobrá-las aqui seria
 * reimplementar o Tailwind. As dos programas imitados são escritas à mão, num
 * template de CSS dentro do próprio módulo da janela, e é por isso que elas
 * erram calado. A lista de prefixos **sai das folhas**: todo prefixo que
 * aparece numa classe definida passa a ser cobrado. Prefixo escrito à mão
 * deixaria de conferir a janela nova no dia em que ela nascesse, que é a
 * armadilha do `describe.each` com quatro trilhas.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** Todo arquivo de `src/` que não é teste. */
function fontes(): { caminho: string; texto: string }[] {
  const achados: { caminho: string; texto: string }[] = [];
  const varrer = (pasta: string, prefixo: string) => {
    for (const item of readdirSync(join('src', pasta), { withFileTypes: true })) {
      const relativo = prefixo ? `${prefixo}/${item.name}` : item.name;
      if (item.isDirectory()) { varrer(join(pasta, item.name), relativo); continue; }
      if (!/\.(tsx?|css)$/.test(item.name) || item.name.includes('.test.')) continue;
      achados.push({ caminho: relativo, texto: readFileSync(join('src', pasta, item.name), 'utf8') });
    }
  };
  varrer('.', '');
  return achados;
}

const ARQUIVOS = fontes();

/**
 * As classes que alguma folha define.
 *
 * Procura seletor de classe em qualquer lugar — `.pl-bt {`, `.pl-bt:hover`,
 * `.pl-bt[data-x]`, `.a .b`, `.a, .b`. É de propósito mais larga do que um
 * analisador de CSS: o que ela precisa responder é "este nome existe em algum
 * lugar da folha", e não "onde".
 */
const DEFINIDAS = new Set(
  ARQUIVOS.flatMap(a => [...a.texto.matchAll(/\.([a-z][a-z0-9]*(?:-[a-z0-9]+)+)(?=[\s,:.{[>+~)])/g)]
    .map(m => m[1])),
);

/**
 * Os prefixos cobrados: os que aparecem em classe definida.
 *
 * Um prefixo com uma definição só não entra. É a guarda contra o acaso: a
 * palavra antes do primeiro hífen de uma classe do Tailwind — `text`, `bg`,
 * `max` — pode coincidir com um seletor escrito à mão, e um prefixo inteiro
 * do Tailwind entrando aqui encheria a trava de acusações a código certo,
 * que é a trava que se aprende a ignorar.
 */
const PREFIXOS = (() => {
  const conta = new Map<string, number>();
  for (const classe of DEFINIDAS) {
    const p = classe.split('-')[0];
    conta.set(p, (conta.get(p) ?? 0) + 1);
  }
  /*
    Os prefixos do Tailwind que também aparecem como seletor próprio ficam de
    fora por nome: são utilitários gerados, e não classes de janela. A lista é
    curta e cada entrada é um prefixo que de fato colide.
  */
  const DO_TAILWIND = new Set([
    'text', 'bg', 'border', 'max', 'min', 'flex', 'grid', 'w', 'h', 'p', 'm',
    'gap', 'rounded', 'items', 'justify', 'font', 'overflow', 'col', 'row',
    'btn', 'card', 'input', 'animate', 'shadow', 'opacity', 'space', 'sr',
  ]);
  return new Set([...conta].filter(([p, n]) => n >= 4 && !DO_TAILWIND.has(p)).map(([p]) => p));
})();

/** As classes que o JSX escreve, por arquivo. */
function usadas(texto: string): string[] {
  const fora: string[] = [];
  for (const m of texto.matchAll(/className=(?:"([^"]*)"|\{`([^`$]*)`\})/g)) {
    for (const classe of (m[1] ?? m[2] ?? '').split(/\s+/)) {
      if (classe !== '') fora.push(classe);
    }
  }
  return fora;
}

describe('classe de programa imitado existe em folha', () => {
  /* A guarda contra o vazio, duas vezes: sem prefixo nenhum ou sem classe
     definida nenhuma a trava ficaria verde por não ter conferido nada. */
  it('a varredura achou folhas e prefixos', () => {
    expect(DEFINIDAS.size, 'nenhuma classe definida').toBeGreaterThan(200);
    expect(PREFIXOS.size, 'nenhum prefixo de programa').toBeGreaterThanOrEqual(5);
  });

  it('nenhuma classe de programa é usada sem existir', () => {
    const faltando: string[] = [];
    for (const { caminho, texto } of ARQUIVOS) {
      if (caminho.endsWith('.css')) continue;
      for (const classe of new Set(usadas(texto))) {
        if (!classe.includes('-')) continue;
        /*
          Utilitário do Tailwind com o mesmo prefixo de uma janela fica de
          fora, e é preciso: o prefixo da planilha é `pl-`, que é também o
          `padding-left` do Tailwind — `pl-4` e `pl-bt` dividem o prefixo e
          só um dos dois mora numa folha escrita à mão. O que os separa é o
          sufixo: o do Tailwind é um número, com ou sem casa.
        */
        if (/^[a-z]+-[0-9]+(\.[0-9]+)?$/.test(classe)) continue;
        if (!PREFIXOS.has(classe.split('-')[0])) continue;
        if (DEFINIDAS.has(classe)) continue;
        faltando.push(`${caminho}: ${classe}`);
      }
    }
    /* A mensagem nomeia arquivo e classe: "alguma classe não existe" não diz
       onde procurar, e é o que faz alguém contornar a trava em vez de lê-la. */
    expect(faltando).toEqual([]);
  });
});
