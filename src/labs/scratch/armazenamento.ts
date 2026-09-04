/**
 * De onde o Scratch busca fantasias, cenários e sons — e o conserto que faz
 * isso funcionar fora da raiz do domínio.
 *
 * ── O que descobri, e que muda o desenho ─────────────────────────────────
 * Copiar o pacote do `scratch-gui` para o nosso domínio traz a interface, os
 * blocos e os ícones — mas **não** a biblioteca de fantasias e sons. Aquilo o
 * editor busca em `cdn.assets.scratch.mit.edu`, e o endereço vem embutido no
 * pacote. Num computador de clube atrás de filtro, o editor abre e funciona, e
 * todo desenho aparece quebrado.
 *
 * Resolver inteiro exigiria re-hospedar a arte do MIT, o que a nota de marca
 * registrada do próprio pacote desaconselha — o Gato do Scratch é uma das
 * marcas que ela nomeia.
 *
 * ── O que dá para resolver, e está resolvido ─────────────────────────────
 * A arte que a **lição** usa é nossa, desenhada aqui, e servida por nós. O
 * laboratório abre inteiro sem rede nenhuma para fora: o palco tem cenário e os
 * atores têm corpo. O acervo do MIT continua alcançável para quem quiser
 * trocar de ator e tiver rede.
 *
 * Mas não basta acrescentar a nossa fonte à lista: ela entra no fim, e o
 * armazenamento tenta as anteriores primeiro. Medindo, os três desenhos da
 * lição saíam pedidos ao `assets.scratch.mit.edu` **antes** de virem do nosso
 * domínio — exatamente o CDN que não queremos no caminho, e atrás de um filtro
 * de rede a espera acontece antes de cada tentativa nossa. Por isso a arte da
 * lição entra por `guardarNossaArte`, que a põe no cache que o armazenamento
 * consulta antes de qualquer fonte: zero pedido para fora, e ordem garantida.
 *
 * ── E acrescentamos ao armazenamento do editor, não construímos outro ────
 * O `scratch-gui` cria um `ScratchStorage` e o liga ao VM dele no momento em
 * que o pacote carrega — o mesmo VM que o laboratório pega em
 * `guiInitialState.vm`. Construir um segundo seria disputar a posse com quem
 * já a tem, e foi o que a primeira versão fez.
 */

const NOSSA_ARTE = `${import.meta.env.BASE_URL}scratch-arte/`;

interface Asset { assetId: string; dataFormat: string }

/** Só o que tocamos do `ScratchStorage`. Ver os passos abaixo. */
interface Armazenamento {
  addWebStore?: (tipos: unknown[], url: (a: Asset) => string) => void;
  /** Põe o asset no cache local, de onde ele é achado antes de qualquer fonte.
      É o mesmo mecanismo com que o `scratch-gui` guarda o projeto padrão. */
  cache?: (tipo: unknown, formato: unknown, dados: Uint8Array, id: string) => string;
  AssetType?: Record<string, unknown>;
  DataFormat?: Record<string, unknown>;
  /* As duas ferramentas de busca do `WebHelper`: a de asset usa um worker, a
     de projeto usa `fetch` puro. Ver `evitarOWorkerQuebrado`. */
  webHelper?: { assetTool?: unknown; projectTool?: unknown };
}

function armazenamentoDe(vm: unknown): Armazenamento | undefined {
  return (vm as { runtime?: { storage?: Armazenamento } })?.runtime?.storage;
}

/**
 * Tira do caminho o worker que o `scratch-storage` não consegue carregar aqui.
 *
 * ── O defeito, que custou horas ──────────────────────────────────────────
 * O `scratch-storage` busca asset num *web worker*, e o endereço dele foi
 * gravado pelo webpack como `/chunks/fetch-worker.<hash>.js` — caminho absoluto
 * da **raiz do domínio**, fixo no pacote. O nosso site vive em `/trilha-web/`,
 * então o worker dá 404.
 *
 * E aí vem a parte cara: `new Worker(url)` não estoura quando a URL não existe.
 * A falha chega como evento `error` no worker, e o `FetchWorkerTool` não escuta
 * esse evento — cada pedido é postado para o vazio e a promessa **nunca se
 * resolve nem rejeita**. O `ProxyTool` só troca de ferramenta quando a primeira
 * rejeita, então ele também espera para sempre. O sintoma na tela é o pior que
 * existe: o editor abre inteiro, sem um erro no console, e o projeto da lição
 * simplesmente nunca aparece.
 *
 * ── O conserto ──────────────────────────────────────────────────────────
 * O `WebHelper` já tem a ferramenta boa: `projectTool` busca por `fetch` puro,
 * sem worker, e é com ela que ele carrega projeto. Apontar `assetTool` para a
 * mesma ferramenta põe fantasia e som pelo mesmo caminho que já funciona. O que
 * se perde é a busca fora da linha principal — irrelevante para três desenhos
 * nossos ou uma fantasia por vez do acervo.
 *
 * Devolve `false` se não achou onde mexer: aí o defeito volta, e é por isso que
 * o laboratório põe um teto no `loadProject` em vez de esperar para sempre.
 */
export function evitarOWorkerQuebrado(vm: unknown): boolean {
  const web = armazenamentoDe(vm)?.webHelper;
  if (!web?.projectTool || !web.assetTool) return false;
  web.assetTool = web.projectTool;
  return true;
}

/**
 * Acrescenta a arte da lição ao armazenamento que o `scratch-gui` já ligou.
 *
 * Devolve `false` quando não achou onde acrescentar — a lição segue, e o que
 * falha é a arte nossa, não o editor.
 */
export function acrescentarNossaArte(vm: unknown): boolean {
  const storage = armazenamentoDe(vm);
  if (!storage?.addWebStore) return false;

  const tipos = storage.AssetType
    ? [storage.AssetType.ImageVector, storage.AssetType.ImageBitmap, storage.AssetType.Sound]
      .filter(Boolean)
    : [];
  if (tipos.length === 0) return false;

  storage.addWebStore(tipos, (asset: Asset) => `${NOSSA_ARTE}${asset.assetId}.${asset.dataFormat}`);
  return true;
}

/* O tipo de asset que cada formato de arquivo pede. Fora daqui, o desenho vem
   do acervo do MIT pelo caminho normal, e é onde ele deve mesmo vir. */
const TIPO_DO_FORMATO: Record<string, string> = {
  svg: 'ImageVector', png: 'ImageBitmap', jpg: 'ImageBitmap',
  wav: 'Sound', mp3: 'Sound',
};

/** Cada fantasia e cada som que o projeto nomeia. */
function artePedidaPor(projetoSb3: string): Asset[] {
  try {
    const p = JSON.parse(projetoSb3) as {
      targets?: { costumes?: Asset[]; sounds?: Asset[] }[];
    };
    return (p.targets ?? []).flatMap(t => [...(t.costumes ?? []), ...(t.sounds ?? [])])
      .filter(a => a?.assetId && a?.dataFormat);
  } catch { return []; }
}

/**
 * Põe a arte da lição no cache do armazenamento, antes de abrir o projeto.
 *
 * Só entra o que existe na nossa pasta; o que não existe cai fora em silêncio e
 * segue pelo caminho normal — é assim que uma fantasia do acervo do MIT, posta
 * pelo desbravador, continua funcionando.
 *
 * Devolve quantos guardou. Zero não é erro: quer dizer que o projeto só usa
 * arte que não é nossa.
 */
export async function guardarNossaArte(vm: unknown, projetoSb3: string): Promise<number> {
  const storage = armazenamentoDe(vm);
  if (!storage?.cache || !storage.AssetType || !storage.DataFormat) return 0;

  const guardados = await Promise.all(artePedidaPor(projetoSb3).map(async a => {
    const tipo = storage.AssetType?.[TIPO_DO_FORMATO[a.dataFormat] ?? ''];
    const formato = storage.DataFormat?.[a.dataFormat.toUpperCase()];
    if (!tipo || !formato) return 0;
    try {
      const resposta = await fetch(`${NOSSA_ARTE}${a.assetId}.${a.dataFormat}`);
      if (!resposta.ok) return 0;
      storage.cache?.(tipo, formato, new Uint8Array(await resposta.arrayBuffer()), a.assetId);
      return 1;
    } catch { return 0; }
  }));
  return guardados.reduce<number>((t, n) => t + n, 0);
}
