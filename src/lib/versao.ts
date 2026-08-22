/*
 * Descobrir que existe uma versão nova publicada.
 *
 * O aplicativo se atualizava sozinho só em um caso: quando o próprio
 * `sw.js` mudava, o worker novo assumia e a página recarregava. Mas um deploy
 * comum não mexe no worker — mexe no código —, e então uma aba aberta continua
 * rodando o pacote que baixou no dia em que foi aberta. Foi assim que uma
 * correção publicada e verificada em produção continuou invisível para quem
 * estava com o aplicativo aberto: do lado de dentro, parecia que nada tinha
 * sido feito.
 *
 * A identidade de um build é o nome do pacote principal, que o Vite gera com um
 * hash do conteúdo: `index-ypQDjAst.js`. Se o `index.html` do servidor aponta
 * para um nome diferente do que esta página carregou, há versão nova. Não é
 * preciso número de versão nem endpoint próprio — a resposta já está publicada.
 */

/** O pacote que esta página carregou, pelo `<script type="module">` do HTML. */
function pacoteDaPagina(): string | null {
  const script = document.querySelector<HTMLScriptElement>('script[type="module"][src]');
  return script ? new URL(script.src, location.href).pathname : null;
}

/** O pacote que o servidor está entregando agora. */
async function pacotePublicado(base: string): Promise<string | null> {
  /* `no-store` porque o HTML do GitHub Pages vem com dez minutos de validade, e
     perguntar ao cache é perguntar exatamente a quem já está desatualizado. */
  const resposta = await fetch(`${base}index.html`, { cache: 'no-store' });
  if (!resposta.ok) return null;

  const html = await resposta.text();
  const achado = html.match(/<script[^>]*\stype="module"[^>]*\ssrc="([^"]+)"/)
    ?? html.match(/<script[^>]*\ssrc="([^"]+)"[^>]*\stype="module"/);
  return achado ? new URL(achado[1], location.href).pathname : null;
}

/**
 * Há um build novo publicado?
 *
 * Falso diante de qualquer dúvida — sem rede, HTML inesperado, página servida
 * de um jeito que não deixa ver o próprio pacote. Um aviso de atualização que
 * aparece sem haver atualização é pior do que nenhum: ensina a ignorá-lo.
 */
export async function haVersaoNova(base = import.meta.env.BASE_URL): Promise<boolean> {
  try {
    const daPagina = pacoteDaPagina();
    if (!daPagina) return false;

    const doServidor = await pacotePublicado(base);
    if (!doServidor) return false;

    return doServidor !== daPagina;
  } catch {
    return false;
  }
}
