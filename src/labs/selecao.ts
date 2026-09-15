import { useEffect, useRef } from 'react';

/*
  Como a lista do Explorador responde ao mouse e ao teclado.

  Estas regras são puras e moram fora dos dois laboratórios de propósito. Ter
  duas seleções múltiplas ligeiramente diferentes é a mesma armadilha que fez a
  janela do Explorador virar `explorer.tsx`: duas cópias divergem no primeiro
  ajuste, e a plataforma passa a ensinar dois Windows.

  Quatro delas erram calado, e é por isso que cada uma está escrita aqui em vez
  de nascer de um `if` dentro de um `onClick`:

  - o intervalo do Shift corre a ordem **da tela**, e não a da árvore. Depois de
    classificar por data, a ordem da árvore não é mais a que se vê: o intervalo
    sairia pegando linhas que não estão entre as duas em que a pessoa clicou, e
    a tela mostraria uma seleção que ninguém pediu;
  - o botão direito numa linha **já selecionada** preserva a seleção. É o que o
    Windows faz, e sem isso "escolher cinco, clicar com o direito, Compactar"
    encolhe para um no caminho — o pacote sai com um arquivo só e a tarefa acusa
    a pessoa de um erro que a tela cometeu;
  - arrastar uma linha já selecionada arrasta a seleção inteira, pelo mesmo
    motivo;
  - a âncora fica onde está enquanto se usa Shift. Movê-la a cada clique faria o
    intervalo caminhar, e encolher a faixa passaria a ser impossível.
*/

/**
 * A seleção da lista: o que está escolhido, e de onde o Shift mede.
 *
 * A âncora é a última linha clicada **sem** Shift. É dela que o intervalo parte,
 * e é por isso que ela não pode ser deduzida de `ids` — numa seleção de três
 * linhas não há como saber em qual delas a pessoa clicou primeiro.
 */
export interface Selecao {
  ids: string[];
  ancora: string | null;
}

export const SEM_SELECAO: Selecao = { ids: [], ancora: null };

/** As teclas que estavam pressionadas no clique. */
export interface Modificadores {
  ctrl: boolean;
  shift: boolean;
}

/** Uma seleção de um item só, que é o caso de quase toda operação. */
export const apenas = (id: string): Selecao => ({ ids: [id], ancora: id });

/**
 * Os ids entre dois, na ordem da tela, inclusive os dois.
 *
 * Devolve vazio quando um dos extremos não está à vista — o que acontece quando
 * a âncora ficou numa pasta que já não é esta, ou num resultado de busca que
 * saiu de cena.
 */
export function intervalo(visiveis: string[], de: string, ate: string): string[] {
  const i = visiveis.indexOf(de);
  const j = visiveis.indexOf(ate);
  if (i < 0 || j < 0) return [];
  return visiveis.slice(Math.min(i, j), Math.max(i, j) + 1);
}

/** Junta preservando a ordem de quem já estava, e sem repetir. */
const unir = (a: string[], b: string[]): string[] => [...new Set([...a, ...b])];

/**
 * O clique numa linha, com as teclas que o acompanharam.
 *
 * - sem tecla: passa a valer só esta linha;
 * - Ctrl: alterna esta linha, deixando o resto como está;
 * - Shift: substitui a seleção pelo intervalo da âncora até aqui;
 * - Ctrl+Shift: **acrescenta** o intervalo ao que já havia, que é como se
 *   escolhem duas faixas separadas.
 */
export function aoClicar(
  atual: Selecao,
  id: string,
  visiveis: string[],
  mod: Modificadores,
): Selecao {
  if (mod.shift && atual.ancora) {
    const faixa = intervalo(visiveis, atual.ancora, id);
    if (!faixa.length) return apenas(id);
    /* A âncora não se move: é o que deixa encolher a faixa clicando mais perto
       dela, que é metade do uso do Shift. */
    return { ids: mod.ctrl ? unir(atual.ids, faixa) : faixa, ancora: atual.ancora };
  }

  if (mod.ctrl) {
    const tinha = atual.ids.includes(id);
    return {
      ids: tinha ? atual.ids.filter(x => x !== id) : [...atual.ids, id],
      /* A âncora acompanha o Ctrl mesmo quando ele **tira** a linha: no Windows
         o Shift seguinte mede a partir da última linha em que se clicou, tenha
         ela entrado ou saído. */
      ancora: id,
    };
  }

  return apenas(id);
}

/**
 * O botão direito numa linha.
 *
 * Numa linha que já está na seleção, nada muda — o menu vale para todas. Numa
 * linha de fora, a seleção passa a ser só ela, que é o que o Windows faz e o
 * que evita um comando agir sobre o que não está debaixo do cursor.
 */
export function aoAbrirMenu(atual: Selecao, id: string): Selecao {
  return atual.ids.includes(id) ? atual : apenas(id);
}

/** Arrastar segue a mesma regra do botão direito, e pelo mesmo motivo. */
export const aoComecarArrasto = aoAbrirMenu;

/** A caixa de seleção de item alterna, sempre — ela existe para isso. */
export function aoMarcarCaixa(atual: Selecao, id: string): Selecao {
  const tinha = atual.ids.includes(id);
  return {
    ids: tinha ? atual.ids.filter(x => x !== id) : [...atual.ids, id],
    ancora: id,
  };
}

/** Tudo o que está à vista. */
export const todos = (visiveis: string[]): Selecao => ({
  ids: [...visiveis],
  ancora: visiveis[0] ?? null,
});

/**
 * Tira da seleção o que saiu da tela.
 *
 * Sem isto, o id de um arquivo excluído — ou de uma pasta que ficou para trás
 * na navegação — continuaria na seleção, e o comando seguinte agiria sobre algo
 * que ninguém vê. A âncora cai junto, senão o Shift mediria a partir do
 * invisível.
 */
export function podar(atual: Selecao, visiveis: string[]): Selecao {
  const ids = atual.ids.filter(id => visiveis.includes(id));
  if (ids.length === atual.ids.length
    && (atual.ancora === null || visiveis.includes(atual.ancora))) return atual;
  return { ids, ancora: atual.ancora && visiveis.includes(atual.ancora) ? atual.ancora : null };
}

/**
 * Se a máquina não tem mouse, as caixas de seleção nascem ligadas.
 *
 * A pergunta é essa, e não a largura da tela: o que falta num celular não é
 * espaço, é o `Ctrl` e o `Shift` — e um tablet de dez polegadas tem a largura de
 * um computador e o mesmo problema. `(pointer: coarse)` é a pergunta escrita
 * como o CSS a faz.
 *
 * Num ambiente sem `matchMedia` — jsdom, e o instante antes de a tela existir —
 * a resposta é não, que é o lado que não muda o desenho de quem já tinha teclado.
 */
export function semMouse(): boolean {
  try {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}

/* ── O teclado ───────────────────────────────────────────────────────────── */

/** O que cada atalho do Explorador faz. Quem não passa um, não ganha a tecla. */
export interface AtalhosDoExplorador {
  copiar?: () => void;
  recortar?: () => void;
  colar?: () => void;
  excluir?: () => void;
  renomear?: () => void;
  selecionarTudo?: () => void;
}

/**
 * Liga as teclas que as dicas dos botões já prometiam.
 *
 * Elas estavam escritas nos botões — "Copiar (Ctrl+C)", "Renomear (F2)",
 * "Excluir (Del)" — e nenhuma fazia nada: não havia ouvinte de teclado em lugar
 * nenhum dos dois laboratórios. Dica que nomeia um gesto que o programa não tem
 * é pior do que dica nenhuma: o desbravador aperta, não acontece nada, e conclui
 * que **ele** errou. Ctrl+A entrou junto porque sem ele não há seleção múltipla
 * possível em quem só tem teclado.
 *
 * O ouvinte ignora o que vem de um campo de texto. Sem isso o Ctrl+A de dentro
 * do campo de renomear deixaria de selecionar o texto e passaria a selecionar a
 * pasta inteira, e o Del apagaria o arquivo em vez da letra.
 */
export function useAtalhosDoExplorador(atalhos: AtalhosDoExplorador, ativo = true) {
  /* Os atalhos chegam num literal novo a cada render. Guardá-los num ref e
     assinar uma vez só evita tirar e repor o ouvinte a cada tecla digitada em
     qualquer lugar da tela — e, mais importante, evita que a assinatura dependa
     de identidade de objeto, que é a forma mais silenciosa de um efeito passar a
     rodar sempre. */
  const atual = useRef(atalhos);
  atual.current = atalhos;

  useEffect(() => {
    if (!ativo) return;

    const ouvir = (e: KeyboardEvent) => {
      const atalhos = atual.current;
      const alvo = e.target as HTMLElement | null;
      const escrevendo = !!alvo && (
        alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.isContentEditable);
      if (escrevendo) return;

      const cmd = e.ctrlKey || e.metaKey;
      const chamar = (f?: () => void) => {
        if (!f) return;
        e.preventDefault();
        f();
      };

      if (cmd && e.key.toLowerCase() === 'a') return chamar(atalhos.selecionarTudo);
      if (cmd && e.key.toLowerCase() === 'c') return chamar(atalhos.copiar);
      if (cmd && e.key.toLowerCase() === 'x') return chamar(atalhos.recortar);
      if (cmd && e.key.toLowerCase() === 'v') return chamar(atalhos.colar);
      if (!cmd && e.key === 'Delete') return chamar(atalhos.excluir);
      if (!cmd && e.key === 'F2') return chamar(atalhos.renomear);
    };

    window.addEventListener('keydown', ouvir);
    return () => window.removeEventListener('keydown', ouvir);
  }, [ativo]);
}
