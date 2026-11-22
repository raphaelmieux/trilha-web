import { JSDOM, VirtualConsole } from 'jsdom';
import { montarPagina, type Arquivos, type ConfiguracaoDaPagina, type Passo, type ResultadoDoCenario } from './paginaViva';
import { respostaDaBrasilApi } from './brasilApiGuardada';

/**
 * A página viva rodando no jsdom, para as travas.
 *
 * É a mesma página que a prévia monta, com o mesmo bastidor dentro: o cenário
 * que a tela roda num `iframe` escondido roda aqui do mesmo jeito, e é por
 * isso que uma tarefa verde na trava é verde na tela. A diferença é o
 * anfitrião — lá ele responde por mensagem, aqui a resposta guardada é posta
 * na janela antes de a página começar.
 *
 * Só as travas importam este arquivo: o jsdom não vai para o pacote servido.
 */
export async function rodarNoJsdom(
  arquivos: Arquivos,
  passos: Passo[],
  config: ConfiguracaoDaPagina = {},
): Promise<ResultadoDoCenario> {
  return rodarPaginaNoJsdom(montarPagina(arquivos, config), passos);
}

/** A página já montada — é o que a tela entrega à conferência. */
export async function rodarPaginaNoJsdom(html: string, passos: Passo[]): Promise<ResultadoDoCenario> {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    /* Calado: o erro do script de quem estuda é assunto da página, e o
       bastidor já o anotou — impresso no terminal do teste, seria ruído. */
    virtualConsole: new VirtualConsole(),
    url: 'https://pagina.local/index.html',
    beforeParse(janela) {
      (janela as unknown as { __trilhaAnfitriao: (u: string) => unknown }).__trilhaAnfitriao = u => respostaDaBrasilApi(u);
    },
  });
  const janela = dom.window as unknown as Window & {
    __trilha?: { rodar: (p: Passo[]) => Promise<ResultadoDoCenario> };
    __trilhaRejeicao?: (r: unknown) => void;
  };
  /* O jsdom não dispara `unhandledrejection` na janela: a promessa rejeitada
     sem ninguém tratando chega ao processo. Enquanto a página roda, ela é
     devolvida ao bastidor, que a anota como o navegador anotaria. */
  const aoRejeitar = (motivo: unknown) => { janela.__trilhaRejeicao?.(motivo); };
  const antes = process.listeners('unhandledRejection');
  process.removeAllListeners('unhandledRejection');
  process.on('unhandledRejection', aoRejeitar);
  try {
    await new Promise<void>(resolve => {
      if (dom.window.document.readyState === 'complete') resolve();
      else dom.window.addEventListener('load', () => resolve());
    });
    if (!janela.__trilha) throw new Error('o bastidor não carregou');
    return await janela.__trilha.rodar(passos);
  } finally {
    /* As rejeições que ainda estiverem a caminho chegam depois de um tique. */
    await new Promise(r => setTimeout(r, 0));
    process.off('unhandledRejection', aoRejeitar);
    for (const h of antes) process.on('unhandledRejection', h as (...a: unknown[]) => void);
    dom.window.close();
  }
}
