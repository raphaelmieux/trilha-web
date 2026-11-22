import RUNTIME from './paginaDeReact.runtime.js?raw';
import { PARA_BASE64, comBastidor, embutirFolhas, escaparAtributo, nomeLocal, type Arquivos } from './paginaViva';
import type { ResultadoDoReact } from './compiladorReact';
import { linhaOriginal } from './mapaDeFontes';
import type { Diagnostico } from './compiladorTs';

/**
 * A página viva da CC-FE006: a mesma da CC-FE004, com o React dentro.
 *
 * O `index.html` é o do Vite — uma `<div id="root">` e um
 * `<script type="module" src="./main.tsx">` —, e é esse script que se troca:
 * no lugar dele entram o React de navegador, o carregador de módulos
 * (`paginaDeReact.runtime.js`) e cada `.tsx` já compilado, embrulhado e
 * registrado pelo nome. A página continua sendo a mesma página viva — o
 * mesmo bastidor, o mesmo console, a mesma BrasilAPI guardada, os mesmos
 * cenários —, e é por isso que o painel e as tarefas da CC-FE004 servem
 * aqui sem mudar.
 *
 * ── O React é o de desenvolvimento ───────────────────────────────────────
 * Ele é dez vezes maior que o de produção, e é o que o `npm run dev` serve:
 * é o que avisa da lista sem chave, do campo que deixa de ser controlado e da
 * propriedade `class` no lugar de `className`. Duas tarefas leem esses
 * avisos. Quem diz de onde ele vem é quem chama: a tela passa o endereço do
 * arquivo servido, e as travas o próprio texto, como `data:`.
 *
 * ── Erro de sintaxe é a tela vermelha ────────────────────────────────────
 * Arquivo que não se lê não roda — no Vite ele vira a tela de erro por cima
 * da página, com o arquivo, a linha e a mensagem. É o que se desenha aqui, e
 * nada do projeto roda até ele se ler de novo.
 */

export interface Biblioteca {
  /** O nome que o console mostra, como `react-dom.development.js`. */
  nome: string;
  /** O endereço do arquivo servido pela plataforma. */
  src?: string;
  /**
   * O texto do arquivo, posto dentro da página — é como as travas o
   * entregam: o jsdom decodifica um `data:` de um megabyte devagar demais
   * para rodar centenas de páginas.
   */
  codigo?: string;
}

export interface ConfiguracaoDaPaginaDeReact {
  offline?: boolean;
  bibliotecas: Biblioteca[];
}

/** O arquivo de entrada: o que o `index.html` chama. Sem ele, `main.tsx`. */
export function entradaDoProjeto(html: string): string {
  for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
    const src = /\bsrc\s*=\s*["']?([^"'\s>]+)/i.exec(m[1])?.[1];
    if (src && /\.(tsx?|jsx?)$/.test(src)) return nomeLocal(src.replace(/^\//, ''));
  }
  return 'main.tsx';
}

const escaparHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A tela vermelha do Vite, com o primeiro erro de sintaxe. */
function telaDeErro(erro: Diagnostico): string {
  const onde = `${erro.arquivo}:${erro.linha}:${erro.coluna}`;
  return `<div data-trilha-interno style="position:fixed;inset:0;z-index:2147483646;background:rgba(0,0,0,.66);display:flex;align-items:flex-start;justify-content:center;padding:32px 12px;font:14px/1.5 ui-monospace,Menlo,Consolas,monospace;overflow:auto">
<div style="max-width:760px;width:100%;background:#181818;color:#D8D8D8;border-top:8px solid #FF5555;border-radius:6px;padding:20px 24px;box-shadow:0 12px 40px rgba(0,0,0,.5)">
<div style="color:#FF5555;font-weight:bold;margin-bottom:8px">[plugin:vite:esbuild] Transform failed with 1 error:</div>
<div style="white-space:pre-wrap;color:#FFE0E0">${escaparHtml(`${onde}: ERROR: ${erro.mensagem}`)}</div>
<div style="margin-top:14px;color:#9A9A9A">${escaparHtml(erro.arquivo ?? '')}</div>
<div style="margin-top:16px;color:#9A9A9A;font-size:12px">Conserte o código e salve para fechar esta tela.</div>
</div></div>
<script data-trilha-interno>console.error(${JSON.stringify(`[vite] ${onde}: ${erro.mensagem}`).replace(/</g, '\\u003c')});</script>`;
}

/** Monta a página que a prévia desenha, com o projeto já compilado. */
export function montarPaginaDeReact(arquivos: Arquivos, compilado: ResultadoDoReact, config: ConfiguracaoDaPaginaDeReact): string {
  const html = arquivos['index.html'] ?? '';
  const entrada = entradaDoProjeto(html);
  const fontes = Object.keys(compilado.modulos);
  let corpo = embutirFolhas(html, arquivos);

  const programa = () => {
    if (compilado.sintaxe.length > 0) return telaDeErro(compilado.sintaxe[0]);
    const libs = config.bibliotecas.map(b => (b.codigo !== undefined
      ? `<script data-trilha-interno>${b.codigo.replace(/<\/script/gi, '<\\/script')}</script>`
      : `<script data-trilha-interno src="${escaparAtributo(b.src ?? '')}"></script>`)).join('');
    const definir = (nome: string, visivel: boolean) => {
      const codigo = `__trilhaDefinir(${JSON.stringify(nome)},function(require,module,exports){${compilado.modulos[nome].codigo}\n});\n//# sourceURL=${nome}`;
      const endereco = `data:text/javascript;name=${encodeURIComponent(nome)};base64,${PARA_BASE64(codigo)}`;
      return visivel
        ? `<script data-trilha-arquivo="${escaparAtributo(nome)}" data-trilha-tipo="module" src="${endereco}"></script>`
        : `<script data-trilha-interno src="${endereco}"></script>`;
    };
    const outros = fontes.filter(f => f !== entrada).map(f => definir(f, false)).join('');
    const principal = fontes.includes(entrada) ? definir(entrada, true) : '';
    return `${libs}<script data-trilha-interno>${RUNTIME}</script>${outros}${principal}`
      + `<script data-trilha-interno>__trilhaIniciar(${JSON.stringify(entrada)});</script>`;
  };

  let trocou = false;
  corpo = corpo.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (tag, atributos: string) => {
    const src = /\bsrc\s*=\s*["']?([^"'\s>]+)/i.exec(atributos)?.[1];
    if (trocou || !src || nomeLocal(src.replace(/^\//, '')) !== entrada) return tag;
    trocou = true;
    return programa();
  });
  if (!trocou) corpo = corpo.replace(/<\/body>/i, `${programa()}</body>`);

  /* O documento de um `iframe` com `srcdoc` herda o endereço de base de
     quem o abriu, e um `history.pushState('#/rota')` resolvido contra ele
     aponta para fora da origem opaca da prévia — o navegador recusa, e o
     `<Link>` do roteador cai num `location.assign` que sai da página. Com a
     base no próprio `about:srcdoc`, a rota fica no mesmo documento, que é o
     que o `HashRouter` espera. */
  const head = /<head\b[^>]*>/i.exec(corpo);
  if (head) corpo = `${corpo.slice(0, head.index + head[0].length)}<base data-trilha-interno href="about:srcdoc">${corpo.slice(head.index + head[0].length)}`;

  return comBastidor(corpo, {
    offline: !!config.offline,
    arquivos: Object.keys(arquivos).filter(n => /\.(tsx?|jsx?)$/.test(n)),
    bibliotecas: Object.fromEntries(config.bibliotecas.filter(b => b.src).map(b => [b.src, b.nome])),
    esperaInicial: 40,
  });
}

/**
 * A linha do `.tsx` de uma linha que a página relatou.
 *
 * O bastidor relata a linha do JavaScript gerado; o console do navegador de
 * verdade mostra a do arquivo escrito, porque o Vite serve o mapa de fontes.
 * Arquivo que não é do projeto, ou sem mapa, fica como veio.
 */
export function linhaNoArquivo(compilado: ResultadoDoReact | null, arquivo: string | null | undefined, linha: number | null | undefined): number | null {
  if (linha === null || linha === undefined) return null;
  const m = arquivo && compilado ? compilado.modulos[arquivo] : undefined;
  return m ? linhaOriginal(m.mapa, linha) : linha;
}
