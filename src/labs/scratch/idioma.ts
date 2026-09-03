/**
 * Faz o editor do Scratch abrir em português.
 *
 * ── Por que isto não é uma prop ──────────────────────────────────────────
 * O `scratch-gui` não aceita o idioma por propriedade. Ele o escolhe uma única
 * vez, quando o pacote carrega: pega `navigator.language`, e deixa trocar por
 * `?locale=` na consulta da URL. Depois disso o valor já entrou no store dele,
 * e não há por onde mexer.
 *
 * ── Por que mexer, se o navegador brasileiro já diz pt-BR ────────────────
 * Porque o computador do clube costuma não ser de ninguém. Um Chromebook
 * doado, um laboratório de escola com o sistema em inglês, um navegador que
 * veio como veio — e o desbravador de dez anos encontra "Motion", "Looks" e
 * "Operators" no meio de uma lição escrita em português. Idioma de tela aqui
 * não é preferência do aparelho: é a matéria.
 *
 * Como o valor é lido na carga do módulo, isto **precisa** rodar antes do
 * `import('scratch-gui')` — quem chama depois não muda nada.
 */

const IDIOMA = 'pt-br';

export function pedirOEditorEmPortugues(): void {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('locale') === IDIOMA) return;
    url.searchParams.set('locale', IDIOMA);
    /* `replaceState` e não `assign`: recarregar a página no meio de um
       laboratório jogaria fora o que a pessoa já montou. O parâmetro fica na
       URL, e ficar é o certo — ele diz em que idioma o editor abriu. */
    window.history.replaceState(null, '', url);
  } catch { /* URL que não se analisa: o editor cai no idioma do navegador */ }
}
