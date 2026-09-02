/**
 * O projeto de onde o laboratório do Scratch parte.
 *
 * ── Ele abre com tudo por fazer ──────────────────────────────────────────
 * Palco, dois personagens, e **nenhum bloco**. É a regra da casa: laboratório
 * que abre resolvido não ensina nada, e o erro é invisível de dentro, porque o
 * painel mostra tarefa concluída — exatamente o que se espera de um laboratório
 * funcionando. Já aconteceu três vezes neste projeto.
 *
 * O elenco vem montado de propósito, e isso não é adiantar trabalho: escolher
 * personagem é o que se faz antes de programar, e o requisito 5 pede dois que
 * interajam. O que se cobra é a lógica, e ela está toda por escrever.
 *
 * ── A arte é nossa ───────────────────────────────────────────────────────
 * O acervo do Scratch mora no CDN do MIT, e computador de clube costuma estar
 * atrás de filtro. Com arte nossa, servida por nós, o laboratório abre inteiro
 * sem rede nenhuma para fora — ver `armazenamento.ts`.
 *
 * ── Os dois na mesma altura ──────────────────────────────────────────────
 * Já custou caro no editor anterior: em alturas diferentes, um jogo montado
 * certo nunca marcava ponto, porque a seta muda só o x e "tocando" pede as duas
 * distâncias pequenas. O sintoma era o pior possível — programa correto,
 * verificação verde, placar parado em zero.
 */

const GATO = 'b479b8371696ef4c15810166151bc8ce';
const MACA = '892d5c591b3caf519d51c872ced2f463';
const PALCO = '8f3a3d76a661ed41bd9617333214bbb5';

const fantasia = (nome: string, id: string, cx: number, cy: number) => ({
  name: nome, assetId: id, md5ext: `${id}.svg`, dataFormat: 'svg',
  bitmapResolution: 1, rotationCenterX: cx, rotationCenterY: cy,
});

const personagem = (nome: string, id: string, x: number, cx: number, cy: number, ordem: number) => ({
  isStage: false, name: nome,
  variables: {}, lists: {}, broadcasts: {}, blocks: {}, comments: {},
  currentCostume: 0, costumes: [fantasia(nome, id, cx, cy)], sounds: [],
  volume: 100, layerOrder: ordem, visible: true,
  x, y: 0, size: 100, direction: 90, draggable: false, rotationStyle: 'all around',
});

export const PROJETO_INICIAL = JSON.stringify({
  targets: [
    {
      /*
        `Stage`, em inglês, e não "Palco".

        O esquema do sb3 tem um enum com esse único valor para o nome do palco.
        Traduzido, o projeto é recusado pela validação — e o erro que chega não
        diz isso: o `loadProject` cai no farejador de arquivos `.sb1`, que
        tropeça no primeiro acento e responde "Non-ascii character in
        FixedAsciiString". Levou uma boa meia hora até eu pedir a mensagem
        verdadeira ao `scratch-parser`.

        O que a pessoa vê na tela é a tradução do editor, e não este campo.
      */
      isStage: true, name: 'Stage',
      variables: {}, lists: {}, broadcasts: {}, blocks: {}, comments: {},
      currentCostume: 0, costumes: [fantasia('cenário', PALCO, 240, 180)], sounds: [],
      volume: 100, layerOrder: 0, tempo: 60,
      videoTransparency: 50, videoState: 'off', textToSpeechLanguage: null,
    },
    personagem('Gato', GATO, -120, 48, 50, 1),
    personagem('Maca', MACA, 120, 40, 46, 2),
  ],
  monitors: [],
  extensions: [],
  meta: { semver: '3.0.0', vm: '5.0.0', agent: 'Trilha.Web()' },
});
