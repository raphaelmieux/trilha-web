/**
 * Segurar o dedo é o botão direito da tela de toque.
 *
 * É assim no Windows com tela de toque, no Excel e no PowerPoint do tablet, e
 * no Drive: o toque longo abre o mesmo menu que o botão direito abre. Os
 * laboratórios têm esses menus — o da célula, o da miniatura, o da linha do
 * Explorador —, e no celular nenhum abria. O Safari do iPhone nunca dispara
 * `contextmenu` num toque longo, e o Chrome do Android dispara só às vezes,
 * conforme o que está debaixo do dedo. Quem estuda pelo celular, que é quase
 * todo mundo, ficava sem o primeiro lugar onde se procura Copiar.
 *
 * O detector mora na moldura, e não em cada menu: ele dispara um `contextmenu`
 * de verdade no ponto do dedo, e todo `onContextMenu` que já existe recebe o
 * evento como receberia do mouse. Menu novo funciona no celular no dia em que
 * nasce, sem ninguém lembrar disto.
 *
 * Três decisões erram calado se invertidas:
 *
 *   · **texto editável fica de fora.** Na folha do Word, num campo ou numa
 *     célula em edição, segurar o dedo é selecionar a palavra, com as alças e a
 *     barra do próprio celular — que é o que todo editor de texto faz no
 *     toque. Abrir o nosso menu por cima disputaria o gesto com o sistema.
 *     E não basta o detector não disparar: o Chrome do Android dispara o
 *     `contextmenu` dele ali, e a folha do Word o recebia como botão direito —
 *     chamava `preventDefault`, abria o menu dela, e o sistema desistia de
 *     selecionar. Sem seleção não há Recortar, e mover um parágrafo pelo
 *     celular ficava impossível. O evento nativo que nasce de um toque em
 *     texto editável é parado aqui, antes de chegar a quem quer que o escute,
 *     e o padrão dele — selecionar e mostrar a barra — segue intacto;
 *   · **depois do menu, o clique é engolido.** Soltar o dedo produz um
 *     `click` no mesmo ponto, e ele cairia no item do menu que acabou de abrir
 *     debaixo do dedo — ou no fundo que o fecha. O menu piscaria e sumiria;
 *   · **se o próprio navegador já disparou o `contextmenu`, o nosso não
 *     dispara.** O Chrome do Android às vezes dispara, e dois eventos abririam
 *     o menu e o reabririam em outro ponto, ou o fechariam pelo véu.
 *
 * E só conta o toque: o mouse tem botão direito de verdade, e a caneta do
 * tablet o tem no corpo dela.
 */

/** Quanto tempo o dedo fica parado até virar botão direito. O do Android. */
export const ESPERA_DO_TOQUE_LONGO = 500;

/** Quanto o dedo pode andar e continuar sendo um toque parado. */
const FOLGA_EM_PIXELS = 10;

/** Onde segurar o dedo é selecionar texto, e é do sistema. */
const CAMPO = 'input, textarea, select';

/*
  O texto editável se lê pelo `contenteditable` mais próximo, e não por um
  seletor que o procure em qualquer ancestral: a folha do Word é editável e
  tem ilhas que não são — o cabeçalho, a tabela —, marcadas com `false`. E o
  corpo do slide é `plaintext-only`, que também é editável.
*/
function ehEditavel(el: Element | null): boolean {
  if (!el) return false;
  if (el.closest(CAMPO)) return true;
  const ce = el.closest('[contenteditable]');
  return !!ce && ce.getAttribute('contenteditable') !== 'false';
}

const NOSSO = new WeakSet<Event>();

export function instalarToqueLongo(raiz: HTMLElement): () => void {
  let prazo: ReturnType<typeof setTimeout> | null = null;
  let toque: { x: number; y: number; alvo: Element } | null = null;
  /* Ligado depois que um menu abriu pelo toque: engole o clique e o
     contextmenu do próprio navegador que vierem com o mesmo dedo. */
  let engolir = false;
  let soltarEngolir: ReturnType<typeof setTimeout> | null = null;
  /* O último dedo pousou em texto editável: o contextmenu do navegador que
     vier dele é do sistema. */
  let dedoNoTexto = false;

  const esquecer = () => {
    if (prazo) clearTimeout(prazo);
    prazo = null;
    toque = null;
  };

  const aoApertar = (e: PointerEvent) => {
    dedoNoTexto = false;
    if (e.pointerType !== 'touch') return;
    esquecer();
    engolir = false;
    const alvo = e.target as Element | null;
    if (!alvo) return;
    if (ehEditavel(alvo)) { dedoNoTexto = true; return; }
    toque = { x: e.clientX, y: e.clientY, alvo };
    prazo = setTimeout(() => {
      const t = toque;
      esquecer();
      if (!t || !t.alvo.isConnected) return;
      const ev = new MouseEvent('contextmenu', {
        bubbles: true, cancelable: true, clientX: t.x, clientY: t.y, button: 2, buttons: 2,
      });
      NOSSO.add(ev);
      t.alvo.dispatchEvent(ev);
      /* Engole sempre, e não só quando alguém chamou preventDefault: há menu
         que abre sem chamá-lo, e em sistema nenhum soltar o dedo depois de um
         toque longo é um clique. */
      engolir = true;
      /* O Android pode ter começado a selecionar a palavra debaixo do dedo:
         com o menu aberto, a faixa azul e as alças ficariam por cima dele. */
      const s = document.getSelection();
      const no = s?.anchorNode;
      const el = no instanceof Element ? no : no?.parentElement;
      if (s && s.rangeCount && !ehEditavel(el ?? null)) s.removeAllRanges();
    }, ESPERA_DO_TOQUE_LONGO);
  };

  const aoMover = (e: PointerEvent) => {
    if (!toque || e.pointerType !== 'touch') return;
    if (Math.hypot(e.clientX - toque.x, e.clientY - toque.y) > FOLGA_EM_PIXELS) esquecer();
  };

  const aoSoltar = () => {
    esquecer();
    if (!engolir) return;
    /* O clique vem logo depois do pointerup; se não vier — o navegador às
       vezes não o manda depois de um toque longo —, a trava não pode ficar
       armada até o próximo toque, que seria um toque comum engolido. */
    if (soltarEngolir) clearTimeout(soltarEngolir);
    soltarEngolir = setTimeout(() => { engolir = false; }, 400);
  };

  const aoMenuNativo = (e: Event) => {
    if (NOSSO.has(e)) return;
    if (dedoNoTexto && ehEditavel(e.target as Element | null)) {
      /* Só a propagação: o padrão do evento é o sistema selecionar a palavra. */
      e.stopPropagation();
      return;
    }
    if (engolir) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    /* O navegador chegou primeiro: o menu abre pelo evento dele, e o nosso
       não dispara. O clique que vier com o mesmo dedo é engolido do mesmo
       jeito — depois de um toque longo ninguém quis clicar. */
    if (toque) {
      esquecer();
      engolir = true;
    }
  };

  const aoClicar = (e: MouseEvent) => {
    if (!engolir) return;
    engolir = false;
    e.preventDefault();
    e.stopPropagation();
  };

  raiz.addEventListener('pointerdown', aoApertar, true);
  raiz.addEventListener('pointermove', aoMover, true);
  raiz.addEventListener('pointerup', aoSoltar, true);
  raiz.addEventListener('pointercancel', esquecer, true);
  /* O engolir escuta o documento, e não a raiz: há menu que se desenha no
     `body`, fora da moldura, e o clique de soltar o dedo cai nele. */
  const doc = raiz.ownerDocument;
  doc.addEventListener('contextmenu', aoMenuNativo, true);
  doc.addEventListener('click', aoClicar, true);
  return () => {
    esquecer();
    if (soltarEngolir) clearTimeout(soltarEngolir);
    raiz.removeEventListener('pointerdown', aoApertar, true);
    raiz.removeEventListener('pointermove', aoMover, true);
    raiz.removeEventListener('pointerup', aoSoltar, true);
    raiz.removeEventListener('pointercancel', esquecer, true);
    doc.removeEventListener('contextmenu', aoMenuNativo, true);
    doc.removeEventListener('click', aoClicar, true);
  };
}
