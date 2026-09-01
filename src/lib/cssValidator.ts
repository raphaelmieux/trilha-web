/**
 * Verificação estrutural do CSS que o desbravador escreve.
 *
 * ── Por que não é busca de texto ─────────────────────────────────────────
 * O validador de HTML nasceu de um defeito conhecido: `code.includes('<img')`
 * passava num comentário. Em CSS a armadilha é a mesma e pior, porque o
 * navegador **descarta em silêncio** o que não entende — `colr: red` não é
 * erro, é uma linha que some. Uma busca por "display: flex" no texto aprovaria
 * a folha inteira estando ela quebrada duas linhas acima.
 *
 * Então aqui a folha é analisada: o texto vira um `<style>`, o navegador monta
 * o CSSOM, e as verificações interrogam as regras — o seletor, as declarações,
 * o que sobreviveu. O que o navegador jogou fora não conta, que é exatamente
 * o que se quer ensinar.
 *
 * ── E o seletor precisa acertar alguém ───────────────────────────────────
 * Toda verificação de seletor recebe também a marcação a que a folha se
 * aplica, e só passa se o seletor casar com algum elemento dela. Escrever
 * `.cartaz { color: red }` numa página sem `cartaz` nenhum é CSS que não
 * pinta nada — é a mesma armadilha do "zero link não é zero link quebrado".
 *
 * ── Alinhar é mais do que declarar ───────────────────────────────────────
 * `display: flex` sozinho não demonstra alinhamento, e o requisito pede
 * alinhamento. Por isso `flex` e `grid` cobram a declaração **e** uma
 * propriedade que de fato disponha as peças.
 */

export interface CheckResult {
  id: string;
  label: string;
  hint: string;
  passed: boolean;
  /** Mostrado quando falha, dizendo exatamente o que falta. */
  detail?: string;
}

export interface CssCheckSpec {
  id: string;
  label: string;
  hint: string;
  run: (ctx: Contexto) => { passed: boolean; detail?: string };
}

/** Uma regra de estilo já achatada, com a consulta de mídia que a envolve. */
export interface RegraLida {
  seletor: string;
  /** Nome da propriedade → valor, só o que o navegador aceitou. */
  declaracoes: Record<string, string>;
  /** A condição da `@media` em volta, quando há uma. */
  midia?: string;
}

interface Contexto {
  regras: RegraLida[];
  /** A marcação a que esta folha se aplica, já analisada. */
  pagina: Document;
  fonte: string;
}

/**
 * O texto vira regras pelo próprio analisador do navegador.
 *
 * Um `<style>` fora do documento não monta `sheet` em navegador nenhum, então
 * ele entra no `<head>` e sai logo depois. É feio e é o único caminho: não há
 * API de análise de CSS sem um documento por trás.
 */
export function lerFolha(css: string): RegraLida[] {
  if (typeof document === 'undefined') return [];
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
  try {
    const folha = el.sheet;
    if (!folha) return [];
    const lidas: RegraLida[] = [];

    const declaracoesDe = (style: CSSStyleDeclaration): Record<string, string> => {
      const d: Record<string, string> = {};
      for (let i = 0; i < style.length; i++) {
        const nome = style.item(i);
        d[nome] = style.getPropertyValue(nome).trim();
      }
      return d;
    };

    const percorrer = (regras: CSSRuleList, midia?: string) => {
      for (let i = 0; i < regras.length; i++) {
        const r = regras[i] as CSSRule & {
          selectorText?: string;
          style?: CSSStyleDeclaration;
          cssRules?: CSSRuleList;
          conditionText?: string;
          media?: { mediaText: string };
        };
        if (r.cssRules && !r.selectorText) {
          /* `@media` e afins: a condição desce para as regras de dentro. */
          const condicao = r.media?.mediaText ?? r.conditionText ?? '';
          percorrer(r.cssRules, condicao || midia);
        } else if (r.selectorText && r.style) {
          lidas.push({
            seletor: r.selectorText.trim(),
            declaracoes: declaracoesDe(r.style),
            ...(midia ? { midia } : {}),
          });
        }
      }
    };

    percorrer(folha.cssRules);
    return lidas;
  } finally {
    el.remove();
  }
}

/* ────────────────────────────────────────────────────────────────────────
   As verificações
   ──────────────────────────────────────────────────────────────────────── */

/** Alguma declaração desta regra usa a propriedade, com valor? */
const declara = (r: RegraLida, ...props: string[]) =>
  props.some(p => (r.declaracoes[p] ?? '').length > 0);

/** O seletor acerta algum elemento da página a que a folha se aplica? */
function acertaAlguem(seletor: string, pagina: Document): boolean {
  /* Vírgula separa seletores independentes: basta um deles pegar. */
  return seletor.split(',').some(parte => {
    const s = parte.trim();
    if (!s) return false;
    try { return pagina.querySelector(s) !== null; } catch { return false; }
  });
}

/** As regras que pintam alguém de verdade: casam com a página e declaram algo. */
const efetivas = (ctx: Contexto) =>
  ctx.regras.filter(r => Object.keys(r.declaracoes).length > 0 && acertaAlguem(r.seletor, ctx.pagina));

/**
 * Um seletor da forma pedida, entre as que pintam alguém.
 *
 * `tipo` olha só a última parte do seletor — `.cartao p` é um seletor de
 * elemento tanto quanto `p`, e recusá-lo ensinaria uma regra que não existe.
 */
function temSeletor(ctx: Contexto, tipo: 'elemento' | 'classe' | 'id'): RegraLida | undefined {
  return efetivas(ctx).find(r => r.seletor.split(',').some(parte => {
    const ultima = parte.trim().split(/[\s>+~]+/).filter(Boolean).pop() ?? '';
    if (!ultima) return false;
    if (tipo === 'classe') return /\.[A-Za-z_-][\w-]*/.test(ultima);
    if (tipo === 'id') return /#[A-Za-z_-][\w-]*/.test(ultima);
    return /^[a-zA-Z][\w-]*$/.test(ultima);
  }));
}

/** Alguma regra efetiva declara qualquer uma destas propriedades? */
const alguemDeclara = (ctx: Contexto, ...props: string[]) =>
  efetivas(ctx).some(r => declara(r, ...props));

const SPECS: CssCheckSpec[] = [
  {
    id: 'seletorElemento',
    label: 'Um seletor de elemento',
    hint: 'Escreva o nome da tag e as chaves: p { ... }',
    run: ctx => temSeletor(ctx, 'elemento')
      ? { passed: true }
      : { passed: false, detail: 'Nenhuma regra começa pelo nome de uma tag que existe na página — como body, h1 ou p — com alguma propriedade dentro.' },
  },
  {
    id: 'seletorClasse',
    label: 'Um seletor de classe',
    hint: 'Ponto e o nome da classe: .destaque { ... }',
    run: ctx => temSeletor(ctx, 'classe')
      ? { passed: true }
      : { passed: false, detail: 'Falta uma regra .classe que acerte um elemento da página. Classe inventada não pinta nada: confira o class= na marcação, ao lado.' },
  },
  {
    id: 'seletorId',
    label: 'Um seletor de identificador',
    hint: 'Cerquilha e o nome do id: #topo { ... }',
    run: ctx => temSeletor(ctx, 'id')
      ? { passed: true }
      : { passed: false, detail: 'Falta uma regra #identificador que acerte um elemento da página. Confira o id= na marcação, ao lado.' },
  },
  {
    id: 'cor',
    label: 'A cor do texto',
    hint: 'color: dentro de alguma regra.',
    run: ctx => alguemDeclara(ctx, 'color')
      ? { passed: true }
      : { passed: false, detail: 'Nenhuma regra define color. Se você escreveu e não valeu, confira a grafia: colr ou collor somem sem avisar.' },
  },
  {
    id: 'corDeFundo',
    label: 'A cor de fundo',
    hint: 'background-color: dentro de alguma regra.',
    run: ctx => alguemDeclara(ctx, 'background-color', 'background')
      ? { passed: true }
      : { passed: false, detail: 'Nenhuma regra define background-color. É ela que pinta a caixa atrás do texto.' },
  },
  {
    id: 'tipografia',
    label: 'A fonte do texto',
    hint: 'font-family: com uma alternativa depois da vírgula.',
    run: ctx => alguemDeclara(ctx, 'font-family')
      ? { passed: true }
      : { passed: false, detail: 'Nenhuma regra define font-family. Escreva a fonte desejada e, depois da vírgula, uma de reserva — sans-serif ou serif.' },
  },
  {
    id: 'tamanhoDeTexto',
    label: 'O tamanho do texto',
    hint: 'font-size: em px, rem ou em.',
    run: ctx => alguemDeclara(ctx, 'font-size')
      ? { passed: true }
      : { passed: false, detail: 'Nenhuma regra define font-size.' },
  },
  {
    id: 'unidadeRelativa',
    label: 'Uma medida que acompanha a tela',
    hint: 'Use rem, em ou % em alguma medida — não só px.',
    run: ctx => {
      const achou = efetivas(ctx).some(r =>
        Object.values(r.declaracoes).some(v => /(^|[\s(])[\d.]+(rem|em)\b|[\d.]+%/.test(v)));
      return achou
        ? { passed: true }
        : { passed: false, detail: 'Todas as medidas estão em px. px é fixo: não cresce quando quem lê aumenta a letra do navegador. Troque ao menos uma por rem, em ou %.' };
    },
  },
  {
    id: 'margem',
    label: 'Margem por fora',
    hint: 'margin: — o espaço entre a caixa e as vizinhas.',
    run: ctx => alguemDeclara(ctx, 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left')
      ? { passed: true }
      : { passed: false, detail: 'Nenhuma regra define margin. É o espaço de fora da caixa, o que a afasta das outras.' },
  },
  {
    id: 'espacamento',
    label: 'Espaçamento por dentro',
    hint: 'padding: — o espaço entre a borda e o conteúdo.',
    run: ctx => alguemDeclara(ctx, 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left')
      ? { passed: true }
      : { passed: false, detail: 'Nenhuma regra define padding. É o espaço de dentro, entre a borda da caixa e o texto.' },
  },
  {
    id: 'borda',
    label: 'A borda da caixa',
    hint: 'border: espessura, estilo e cor.',
    run: ctx => alguemDeclara(ctx, 'border', 'border-width', 'border-style', 'border-color', 'border-radius')
      ? { passed: true }
      : { passed: false, detail: 'Nenhuma regra define border. Sem o estilo — solid, dashed — a borda não aparece nem tendo espessura.' },
  },
  {
    id: 'flex',
    label: 'Alinhamento com Flexbox',
    hint: 'display: flex e uma propriedade que disponha as peças.',
    run: ctx => {
      const caixa = efetivas(ctx).find(r => r.declaracoes.display === 'flex');
      if (!caixa) {
        return { passed: false, detail: 'Nenhuma regra tem display: flex numa caixa que exista na página.' };
      }
      return declara(caixa, 'justify-content', 'align-items', 'flex-direction', 'gap', 'flex-wrap')
        ? { passed: true }
        : { passed: false, detail: 'A caixa é flex, mas nada alinha nada ainda. display: flex só liga o modo; quem dispõe é justify-content, align-items, gap ou flex-direction.' };
    },
  },
  {
    id: 'grid',
    label: 'Alinhamento com Grid',
    hint: 'display: grid e as colunas da grade.',
    run: ctx => {
      const caixa = efetivas(ctx).find(r => r.declaracoes.display === 'grid');
      if (!caixa) {
        return { passed: false, detail: 'Nenhuma regra tem display: grid numa caixa que exista na página.' };
      }
      return declara(caixa, 'grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-template')
        ? { passed: true }
        : { passed: false, detail: 'A caixa é grid, mas a grade não tem colunas. Diga quantas e de que tamanho em grid-template-columns.' };
    },
  },
  {
    id: 'consultaDeMidia',
    label: 'Um ajuste para tela pequena',
    hint: '@media (max-width: ...) com regras dentro.',
    run: ctx => {
      const dentro = ctx.regras.filter(r => r.midia && Object.keys(r.declaracoes).length > 0);
      if (dentro.length === 0) {
        return { passed: false, detail: 'Não há @media com regra dentro. Uma consulta de mídia vazia não muda nada — o que conta é o que ela contém.' };
      }
      return dentro.some(r => /max-width|min-width/.test(r.midia ?? ''))
        ? { passed: true }
        : { passed: false, detail: 'A consulta de mídia existe, mas não fala de largura. Para tela pequena, a condição é (max-width: ...).' };
    },
  },
];

const POR_ID = new Map(SPECS.map(s => [s.id, s]));

/** Todos os ids que existem — é contra esta lista que o currículo é conferido. */
export const IDS_DE_CSS = SPECS.map(s => s.id);

/**
 * Roda as verificações pedidas contra a folha e a marcação a que ela se aplica.
 *
 * Um id desconhecido não é ignorado em silêncio: vira uma verificação que
 * nunca passa, com o motivo escrito. Ignorar produziria um laboratório com
 * menos tarefas do que a lição prometeu, e ninguém veria.
 */
export function validateCss(css: string, markup: string, ids: string[]): CheckResult[] {
  const pagina = new DOMParser().parseFromString(markup, 'text/html');
  const ctx: Contexto = { regras: lerFolha(css), pagina, fonte: css };
  return ids.map(id => {
    const spec = POR_ID.get(id);
    if (!spec) {
      return { id, label: id, hint: '', passed: false, detail: `Verificação desconhecida: ${id}.` };
    }
    const r = spec.run(ctx);
    return { id, label: spec.label, hint: spec.hint, passed: r.passed, detail: r.detail };
  });
}
