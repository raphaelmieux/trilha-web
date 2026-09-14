import type { jsPDF } from 'jspdf';
import { partirNaMarca, VERMELHO_DA_MARCA } from './marca';

/**
 * Como as marcas se escrevem no papel.
 *
 * `marca.ts` diz o que elas são — o nome, o miolo, os parênteses vermelhos — e
 * é TypeScript puro justamente porque as duas telas que as desenham não se
 * parecem em nada: na tela quem veste é o CSS, no PDF quem desenha é o jsPDF,
 * que não lê folha de estilo. Este arquivo é o lado do papel.
 *
 * ── A fonte vai junto agora, e antes não ia ───────────────────────────────
 * A decisão anterior era "a cor vem, a fonte não": o jsPDF desenha em
 * Helvetica, uma das catorze do padrão PDF, e embutir a Space Mono parecia
 * caro — um TTF dentro do pacote de todo visitante para servir a três rodapés.
 *
 * O custo era real e a conta mudou: a marca não aparece em três rodapés, ela
 * abre a capa do relatório que o clube arquiva, e é ali que ela mais é vista
 * fora da tela. Uma marca escrita em Helvetica no documento impresso e em
 * Space Mono na tela são duas marcas, e quem recebe o papel não sabe que é a
 * mesma plataforma.
 *
 * E o custo se resolveu: o arquivo **não** entra no pacote. Ele já está em
 * `public/assets/fonts/`, de onde a folha de estilo carrega a versão woff2, e
 * daqui ele é buscado na hora de gerar o PDF — o mesmo caminho pelo qual a arte
 * dos certificados já é buscada. Quem nunca gera um PDF nunca baixa a fonte.
 *
 * ── E se ela não chegar ───────────────────────────────────────────────────
 * O documento sai assim mesmo, em Helvetica, com a cor certa. Derrubar a
 * emissão de um certificado porque uma fonte não carregou seria trocar um
 * defeito de estilo por um defeito de função — e a hora em que isso
 * aconteceria é justamente a hora da vitória de alguém.
 */

/** O nome do arquivo dentro do PDF. Só precisa ser estável. */
const ARQUIVO_DA_FONTE = 'SpaceMono-Bold.ttf';
/** Como a família passa a se chamar para o `setFont`. */
export const FAMILIA_DA_MARCA = 'SpaceMono';

/*
  A mesma face que a tela usa, em TTF.

  A folha de estilo carrega o woff2, que é o formato que o navegador quer e
  que o jsPDF não lê. O TTF ao lado é o mesmo desenho descomprimido — duas
  faces diferentes aqui dariam uma marca na tela e outra no papel, que é
  exatamente o que este arquivo existe para impedir.
*/
const CAMINHO = 'assets/fonts/space-mono-700.ttf';

/** Uma leitura por sessão, mesmo que se gere um PDF atrás do outro. */
let emCache: Promise<string | null> | undefined;

function paraBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binario = '';
  /* Em pedaços: `String.fromCharCode(...bytes)` com quarenta mil argumentos
     estoura a pilha de chamada, e a fonte tem quarenta e um mil bytes. */
  const PEDACO = 0x8000;
  for (let i = 0; i < bytes.length; i += PEDACO) {
    binario += String.fromCharCode(...bytes.subarray(i, i + PEDACO));
  }
  return btoa(binario);
}

function carregarFonte(): Promise<string | null> {
  emCache ??= fetch(`${import.meta.env.BASE_URL}${CAMINHO}`)
    .then(resposta => {
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      return resposta.arrayBuffer();
    })
    .then(paraBase64)
    .catch(erro => {
      console.error('A fonte da marca não carregou; o PDF sai em Helvetica.', erro);
      return null;
    });
  return emCache;
}

/**
 * Ensina a fonte da marca a um documento. Chame uma vez, antes de desenhar.
 *
 * Devolve se deu certo, mas quem desenha não precisa saber: `linhaComMarca`
 * pergunta ao próprio documento se ele tem a face, e cai em Helvetica quando
 * não tem.
 */
export async function vestirAMarca(doc: jsPDF): Promise<boolean> {
  const base64 = await carregarFonte();
  if (!base64) return false;
  doc.addFileToVFS(ARQUIVO_DA_FONTE, base64);
  doc.addFont(ARQUIVO_DA_FONTE, FAMILIA_DA_MARCA, 'bold');
  return true;
}

const temAFonte = (doc: jsPDF) => FAMILIA_DA_MARCA in doc.getFontList();

/**
 * Desenha um pedaço com a roupa que ele pede, e devolve a largura escrita.
 *
 * `medir` é o mesmo caminho sem tinta: a largura de uma frase com marca não é
 * a largura dela em Helvetica, porque a Space Mono é monoespaçada e mais
 * larga. Centralizar pela medida errada tira a linha do meio da página, e é
 * um erro que só se vê imprimindo.
 */
function percorrer(
  doc: jsPDF,
  texto: string,
  x: number,
  y: number,
  corDoTexto: [number, number, number],
  medir: boolean,
): number {
  const { fontName, fontStyle } = doc.getFont();
  const vestida = temAFonte(doc);
  let cursor = x;

  for (const pedaco of partirNaMarca(texto)) {
    if (vestida) {
      if (pedaco.parte === 'fora') doc.setFont(fontName, fontStyle);
      else doc.setFont(FAMILIA_DA_MARCA, 'bold');
    }
    const largura = doc.getTextWidth(pedaco.texto);
    if (!medir) {
      const [r, g, b] = pedaco.parte === 'parenteses' ? VERMELHO_DA_MARCA : corDoTexto;
      doc.setTextColor(r, g, b);
      doc.text(pedaco.texto, cursor, y);
    }
    cursor += largura;
  }

  /* Devolve a fonte e a cor de quem chamou: as linhas seguintes contam com as
     duas, e uma delas a mais ficaria em Space Mono sem ninguém pedir. */
  doc.setFont(fontName, fontStyle);
  if (!medir) doc.setTextColor(corDoTexto[0], corDoTexto[1], corDoTexto[2]);
  return cursor - x;
}

/** A largura que a frase vai ocupar, com a marca vestida. */
export function larguraComMarca(doc: jsPDF, texto: string): number {
  return percorrer(doc, texto, 0, 0, [0, 0, 0], true);
}

/** Escreve a frase a partir de `x`, com a marca vestida. */
export function linhaComMarca(
  doc: jsPDF,
  texto: string,
  x: number,
  y: number,
  corDoTexto: [number, number, number],
): void {
  percorrer(doc, texto, x, y, corDoTexto, false);
}

/**
 * Escreve a frase centrada em `centroX`.
 *
 * Centralizar obriga a desenhar à mão: `align: 'center'` centraliza cada
 * chamada de `text` separadamente, então os pedaços de cores e fontes
 * diferentes sairiam empilhados no mesmo ponto. Mede-se a linha inteira,
 * começa-se na metade dela à esquerda do centro, e cada pedaço anda a própria
 * largura.
 */
export function linhaCentralizadaComMarca(
  doc: jsPDF,
  texto: string,
  centroX: number,
  y: number,
  corDoTexto: [number, number, number],
): void {
  linhaComMarca(doc, texto, centroX - larguraComMarca(doc, texto) / 2, y, corDoTexto);
}
