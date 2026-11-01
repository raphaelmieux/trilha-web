/**
 * O mutirão do córrego: o projeto que as telas da CC-DG006 percorrem.
 *
 * ── Por que outro projeto ────────────────────────────────────────────────
 * O laboratório percorre o convite do Acampamento das Famílias, e quase tudo
 * dele é resposta de alguma lição: as três ideias de rascunho, o motivo de
 * cada descarte, a hora que o público pede, os nomes com data e versão, a
 * origem de cada imagem. Fotografar o gesto ali seria pôr o gabarito na
 * teoria — a decisão do guia da caminhada da CC-DG005 e da marca do Buriti
 * da CC-DG004.
 *
 * O mutirão é a limpeza do córrego atrás da sede, que está na agenda do
 * boletim: outra demanda (faltam voluntários, e não convidados), outro
 * público (os vizinhos do bairro), outro símbolo (a gota e a folha), outro
 * post e outra pasta. `exemplosDoProjetoDeDesign.test.ts` reprova se os dois
 * projetos passarem a dividir um nome de arquivo, uma cor ou uma proporção
 * de post.
 */

import {
  comCaixaRefeita, type Arte, type Caminho, type Foto, type Grupo, type Objeto, type Prancha, type Texto,
} from '../labs/design';
import { contornoDoPoligono } from '../labs/vetor';
import { arquivoDe, type Nuvem } from '../labs/arquivoCompartilhado';

export const AZUL = '#1E5A8C';
export const FOLHA = '#3E7D3A';
export const AREIA = '#F4EEDC';
export const TINTA_DO_MUTIRAO = '#1C2630';
const BRANCO = '#FFFFFF';

/* ── O símbolo ────────────────────────────────────────────────────────────── */

const caminho = (id: string, nome: string, pts: [number, number][], preenchimento: string | null, traco: Caminho['traco'] = null): Caminho =>
  comCaixaRefeita({
    id, nome, tipo: 'caminho', x: 0, y: 0, largura: 0, altura: 0,
    contornos: [contornoDoPoligono(pts.map(([x, y]) => ({ x, y })))], preenchimento, traco,
  });
const grupo = (id: string, nome: string, filhos: Objeto[]): Grupo =>
  comCaixaRefeita({ id, nome, tipo: 'grupo', x: 0, y: 0, largura: 0, altura: 0, filhos });

/** A gota, aproximada por um polígono de ponta para cima. */
function pontosDaGota(cx: number, topo: number, raio: number): [number, number][] {
  const centro = topo + raio * 2.2;
  const pts: [number, number][] = [[cx, topo]];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * (-0.15 + (1.3 * i) / 16);
    pts.push([Math.round(cx + raio * Math.cos(a)), Math.round(centro + raio * Math.sin(a))]);
  }
  return pts;
}

/** As três peças do símbolo, ainda soltas: é assim que saem da caneta. */
export const pecasDoSimbolo = (): Objeto[] => [
  caminho('m-gota', 'Gota', pontosDaGota(200, 30, 100), AZUL),
  caminho('m-folha', 'Folha', [[200, 310], [160, 250], [200, 190], [240, 250]], FOLHA),
  caminho('m-margem', 'Margem', [[80, 370], [320, 370], [320, 392], [80, 392]], FOLHA),
];

/** O símbolo agrupado, que é o que vai para o post e para o cartaz. */
export const simboloDoMutirao = (): Grupo => grupo('m-simbolo', 'Símbolo', pecasDoSimbolo());

/** A espessura do traço da primeira ideia, que some quando o símbolo fica pequeno. */
export const TRACO_DA_PRIMEIRA_IDEIA = 2;

/**
 * A primeira ideia: a mesma gota, desenhada só com o contorno. Grande, é
 * elegante; com 32 pixels, um traço de 2 numa prancha de 400 vira um sexto
 * de pixel, e o desenho some.
 */
export const primeiraIdeia = (): Grupo => grupo('m-tentativa', 'Símbolo (primeira ideia)', [
  caminho('m-t-gota', 'Gota', pontosDaGota(200, 30, 100), null, { cor: AZUL, espessura: TRACO_DA_PRIMEIRA_IDEIA, extremidade: 'redonda' }),
  caminho('m-t-folha', 'Folha', [[200, 310], [160, 250], [200, 190], [240, 250]], null, { cor: FOLHA, espessura: TRACO_DA_PRIMEIRA_IDEIA, extremidade: 'redonda' }),
]);

/* ── O post ───────────────────────────────────────────────────────────────── */

const texto = (id: string, nome: string, t: string, x: number, y: number, largura: number, extra: Partial<Texto> = {}): Texto => ({
  id, nome, tipo: 'texto', texto: t, x, y, largura, familia: 'Verdana', peso: 400, corpo: 40, entrelinha: 1.2,
  cor: TINTA_DO_MUTIRAO, alinhamento: 'esquerda', ...extra,
});

const fotoDoCorrego = (id: string, altura: number): Foto => ({
  id, nome: 'corrego-tratada.jpg', tipo: 'foto', x: 0, y: 0, largura: 1080, altura,
  motivo: 'trilha', tons: ['#2F5D4A', '#CFE3EA'],
});

/** O cartaz encolhido até a largura do feed: proporção de folha, letra de papel. */
export const LARGURA_DO_ENCOLHIDO = 1080;
export const ALTURA_DO_ENCOLHIDO = Math.round(LARGURA_DO_ENCOLHIDO * 210 / 148);

export function postDoCartazEncolhido(): Prancha {
  return {
    id: 'post', nome: 'Post', largura: LARGURA_DO_ENCOLHIDO, altura: ALTURA_DO_ENCOLHIDO, fundo: AREIA,
    objetos: [
      fotoDoCorrego('mp-foto', 620),
      texto('mp-titulo', 'Título', 'Mutirão do Córrego', 60, 660, 960, { corpo: 70, peso: 700, cor: AZUL }),
      texto('mp-data', 'Data', 'Domingo, 19 de outubro, das 7h às 11h', 60, 820, 960, { corpo: 30, peso: 700 }),
      texto('mp-lugar', 'Lugar', 'Encontro no portão da sede, ao lado da quadra', 60, 870, 960, { corpo: 26 }),
      texto('mp-corpo', 'Chamada', 'O córrego atrás da sede está cheio de garrafa e saco plástico. Venha ajudar o clube a limpar: luvas, sacos e água ficam por nossa conta. Traga boné e use calçado fechado. Menores de doze anos com um responsável.',
        60, 940, 960, { corpo: 22, entrelinha: 1.4 }),
      texto('mp-assinatura', 'Assinatura', 'Clube de Desbravadores do bairro', 60, 1440, 700, { corpo: 16 }),
    ],
  };
}

/* ── O arquivo de design ──────────────────────────────────────────────────── */

const pranchaDoSimbolo = (objetos: Objeto[]): Prancha =>
  ({ id: 'simbolo', nome: 'Símbolo', largura: 400, altura: 420, fundo: BRANCO, objetos });

const PALETA = { fundo: AREIA, texto: TINTA_DO_MUTIRAO, destaque: AZUL, apoio: FOLHA, neutro: null };

/** As peças do símbolo ainda soltas, que é como elas saem da caneta. */
export const arteComPecasSoltas = (): Arte => ({ pranchas: [pranchaDoSimbolo(pecasDoSimbolo())], paleta: PALETA });

/** O símbolo pronto e a primeira ideia guardada numa prancha ao lado. */
export const arteComAsDuasIdeias = (): Arte => ({
  pranchas: [
    pranchaDoSimbolo([simboloDoMutirao()]),
    { id: 'simbolo-tentativa', nome: 'Símbolo — primeira ideia', largura: 400, altura: 420, fundo: BRANCO, objetos: [primeiraIdeia()] },
  ],
  paleta: PALETA,
});

/** O arquivo com o post ainda encolhido. */
export const arteComOPostEncolhido = (): Arte => ({
  pranchas: [pranchaDoSimbolo([simboloDoMutirao()]), postDoCartazEncolhido()],
  paleta: PALETA,
});

/* ── A pasta do projeto ───────────────────────────────────────────────────── */

export const PASTA_DO_MUTIRAO = 'mutirao';

/** Os nomes que os finais ganham na tela de nomes: data com o ano primeiro, e a versão. */
export const FINAIS_DO_MUTIRAO = {
  cartaz: 'cartaz-2026-10-05-v02.pdf',
  post: 'post-2026-10-05-v03.png',
  simbolo: 'simbolo-2026-10-05-v01.png',
};

/**
 * A pasta como fica quando cada programa exporta para o mesmo lugar: tudo
 * solto, o editável ao lado do final, e os nomes que cada programa sugeriu.
 */
export function pastaDoMutirao(): Nuvem {
  const em = { pasta: PASTA_DO_MUTIRAO };
  return {
    arquivos: [
      arquivoDe(PASTA_DO_MUTIRAO, 'Mutirão do Córrego', 'pasta', 'voce'),
      arquivoDe('m-simbolo-svg', 'simbolo.svg', 'imagem', 'voce', em),
      arquivoDe('m-simbolo-png', 'simbolo.png', 'imagem', 'voce', em),
      arquivoDe('m-cartaz-sla', 'cartaz.sla', 'documento', 'voce', em),
      arquivoDe('m-cartaz-pdf', 'cartaz-final-FINAL2.pdf', 'pdf', 'voce', em),
      arquivoDe('m-post-svg', 'post.svg', 'imagem', 'voce', em),
      arquivoDe('m-post-png', 'post (1).png', 'imagem', 'voce', em),
      arquivoDe('m-foto-crua', 'IMG_2231.jpg', 'imagem', 'voce', em),
      arquivoDe('m-foto-jpg', 'corrego-tratada.jpg', 'imagem', 'voce', em),
    ],
  };
}

/** A mesma pasta já separada em Editáveis e Finais, com os finais por renomear. */
export function pastaDoMutiraoSeparada(): Nuvem {
  const editaveis = { pasta: 'm-editaveis' };
  const finais = { pasta: 'm-finais' };
  const originais = { pasta: 'm-originais' };
  const em = { pasta: PASTA_DO_MUTIRAO };
  return {
    arquivos: [
      arquivoDe(PASTA_DO_MUTIRAO, 'Mutirão do Córrego', 'pasta', 'voce'),
      arquivoDe('m-editaveis', 'Editáveis', 'pasta', 'voce', em),
      arquivoDe('m-finais', 'Finais', 'pasta', 'voce', em),
      arquivoDe('m-originais', 'Originais e versões', 'pasta', 'voce', em),
      arquivoDe('m-simbolo-svg', 'simbolo.svg', 'imagem', 'voce', editaveis),
      arquivoDe('m-cartaz-sla', 'cartaz.sla', 'documento', 'voce', editaveis),
      arquivoDe('m-post-svg', 'post.svg', 'imagem', 'voce', editaveis),
      arquivoDe('m-simbolo-png', FINAIS_DO_MUTIRAO.simbolo, 'imagem', 'voce', finais),
      arquivoDe('m-cartaz-pdf', 'cartaz-final-FINAL2.pdf', 'pdf', 'voce', finais),
      arquivoDe('m-post-png', FINAIS_DO_MUTIRAO.post, 'imagem', 'voce', finais),
      arquivoDe('m-foto-jpg', 'corrego-tratada.jpg', 'imagem', 'voce', finais),
      arquivoDe('m-foto-crua', 'IMG_2231.jpg', 'imagem', 'voce', originais),
    ],
  };
}
