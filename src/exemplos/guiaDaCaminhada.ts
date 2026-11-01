/**
 * O guia da caminhada ecológica: o documento que as telas da CC-DG005 diagramam.
 *
 * ── Por que outro documento ──────────────────────────────────────────────
 * O laboratório monta o boletim de inverno, e cada número dele é resposta de
 * alguma lição: as margens de 15, 18, 16 e 13, as duas colunas de 57 mm, a
 * capa em X −3, a foto da unidade a 137 e a 285 ppi, as cinco cores da faixa.
 * Fotografar o gesto no boletim seria pôr o gabarito na teoria — a decisão do
 * lago da CC-DG003 e da marca do Buriti da CC-DG004.
 *
 * Então o guia tem outra malha (três colunas de 36 mm), outros estilos, outras
 * fotos com outros ppi e outras cores, e `exemplosDaDiagramacao.test.ts`
 * reprova se algum desses números coincidir com o do boletim.
 *
 * ── Ele chega com os defeitos que as telas consertam ─────────────────────
 * Um título que é corpo engordado à mão, um parágrafo colado de um e-mail em
 * outra letra, a capa parando na borda e os números digitados no pé. Cada
 * cena escolhe de que estado parte, como cada lição do laboratório.
 */

import type {
  Documento, EstiloDeParagrafo, Imagem, Malha, Paragrafo, QuadroDeImagem, QuadroDeTexto, TextoSolto,
} from '../labs/diagramacao';

const A5 = { largura: 148, altura: 210 };

export const ESTILOS_DO_GUIA: EstiloDeParagrafo[] = [
  { id: 'titulo', nome: 'Título', familia: 'Verdana', corpo: 13, entrelinha: 16, peso: 700, espacoAntes: 4 },
  { id: 'corpo', nome: 'Corpo', familia: 'Times New Roman', corpo: 10, entrelinha: 13.5, peso: 400, espacoAntes: 1.5 },
  { id: 'legenda', nome: 'Legenda', familia: 'Arial', corpo: 7.5, entrelinha: 9.5, peso: 400, espacoAntes: 1 },
];

const T = (id: string, texto: string, extra: Partial<Paragrafo> = {}): Paragrafo =>
  ({ id, papel: 'titulo', estilo: 'titulo', texto, ...extra });
const C = (id: string, texto: string, extra: Partial<Paragrafo> = {}): Paragrafo =>
  ({ id, papel: 'corpo', estilo: 'corpo', texto, ...extra });

/**
 * O texto do guia, com dois defeitos de estilo: o título do segundo trecho é
 * corpo engordado à mão, e o parágrafo do lanche veio colado de um e-mail,
 * em Arial 12.
 */
export const TEXTO_DO_GUIA: Paragrafo[] = [
  T('g1', 'Antes de sair'),
  C('g1a', 'A caminhada começa às sete da manhã, no portão do parque, e tem nove quilômetros de trilha. Cada desbravador leva dois litros de água, boné, protetor solar e um lanche que não derrete no sol.'),
  C('g1b', 'O tênis precisa estar amaciado. Calçado novo em trilha longa vira bolha no terceiro quilômetro, e bolha não tem conserto no meio do cerrado.'),
  C('g1c', 'A mochila vai leve: a água, o lanche, uma blusa fina para o vento do mirante, o caderno de campo e um lápis. Caneta seca no calor e não escreve em papel úmido, e o lápis escreve até molhado.'),
  C('g1d', 'Quem toma remédio de uso contínuo entrega ao conselheiro da unidade, com o nome escrito na caixa, antes de entrar no ônibus. A ficha médica de cada um viaja na pasta da secretaria.'),
  C('g2', 'O que observar no caminho', { papel: 'titulo', direta: { corpo: 13, peso: 700 } }),
  C('g2a', 'Nas primeiras duas horas a trilha atravessa o cerrado aberto. Repare nas árvores de casca grossa e tronco torto: a casca protege do fogo, e o tronco torto é o jeito que a planta achou de crescer depois de cada queimada.'),
  C('g2d', 'No meio da manhã o sol aperta e a trilha fica sem sombra por quase uma hora. É a hora de beber água antes de sentir sede: quem espera a sede já está desidratado e só vai perceber na subida.'),
  C('g2b', 'Perto do córrego a mata fica fechada e úmida. É ali que aparecem as pegadas do lobo-guará, maiores que as de um cachorro grande, e as tocas de tatu na barranca.'),
  C('g2e', 'As pegadas se fotografam com alguma coisa ao lado para dar o tamanho, uma tampa de cantil ou a sola do próprio tênis. Sem isso, na foto, a pegada de um lobo e a de um gato ficam do mesmo tamanho.'),
  C('g2c', 'Não arranque flor nem folha para levar. Fotografe e anote no caderno de campo o nome que o guia do parque disser.', { direta: { familia: 'Arial', corpo: 12 } }),
  T('g3', 'Regras da trilha'),
  C('g3a', 'Ninguém anda sozinho e ninguém passa o conselheiro da frente. O último da fila é sempre um conselheiro, e a contagem se faz a cada parada.'),
  C('g3c', 'Se alguém se perder do grupo, para onde está e assobia três vezes. Quem anda procurando se afasta mais, e o grupo volta pelo caminho que fez até ouvir o apito.'),
  C('g3d', 'Bicho silvestre não se toca nem se alimenta, por mais manso que pareça. O macaco que aprende a pegar comida da mão de gente passa a esperar por ela na beira da trilha, e acaba atropelado na estrada do parque.'),
  C('g3b', 'Lixo volta na mochila, inclusive casca de fruta. O que cai no chão do parque leva meses para sumir e atrai bicho para perto da trilha.'),
  T('g4', 'O lanche e a volta'),
  C('g4a', 'A parada do lanche é no mirante, no quilômetro cinco, com quarenta minutos de descanso. Dali se vê a cidade inteira e, em dia limpo, a serra do outro lado do lago.'),
  C('g4c', 'No mirante cada unidade escreve no caderno de campo três coisas que viu e não conhecia. As anotações vão para o mural da sede na reunião seguinte, junto com as melhores fotos.'),
  C('g4b', 'A volta é pelo mesmo caminho, e o ônibus sai do portão às duas da tarde. Quem chegar com bolha, tontura ou dor de cabeça avisa o conselheiro da unidade antes de subir no ônibus.'),
  C('g4d', 'Em casa, lave o cantil e deixe a mochila aberta para secar. Na próxima reunião, traga o caderno de campo: é dele que sai a página do clube sobre a caminhada, no boletim da primavera.'),
];

/** O texto com os estilos certos e nada aplicado à mão. */
export const TEXTO_ARRUMADO: Paragrafo[] = TEXTO_DO_GUIA.map(p => ({
  id: p.id, papel: p.papel, texto: p.texto, estilo: p.papel === 'titulo' ? 'titulo' : 'corpo',
}));

export const FOTOS_DO_GUIA: Imagem[] = [
  { id: 'trilha', nome: 'capa-trilha.jpg', largura: 2600, altura: 3600, modo: 'rgb' },
  { id: 'ipe', nome: 'ipe-amarelo.jpg', largura: 1500, altura: 1000, modo: 'rgb' },
  { id: 'lobo', nome: 'lobo-guara-celular.jpg', largura: 900, altura: 600, modo: 'rgb' },
  { id: 'mapa', nome: 'mapa-da-trilha.svg', largura: 1200, altura: 1500, modo: 'vetor' },
];

/** Duas cores que a tinta não alcança — o âmbar e o verde vivo — e três que alcança. */
export const CORES_DO_GUIA = ['#2E7D32', '#6D4C41', '#FFB300', '#00C853', '#263238'];

export const MALHA_SEM_COLUNAS: Malha = { margens: { topo: 8, base: 8, interna: 8, externa: 8 }, colunas: 1, medianiz: 0 };
export const MALHA_DO_GUIA: Malha = { margens: { topo: 14, base: 16, interna: 17, externa: 11 }, colunas: 3, medianiz: 6 };

/** A altura que o alto da coluna reserva para o cabeçalho corrente. */
const RESERVA = 8;

/**
 * Os quadros das três colunas, nas páginas 2 e 3 — a 4 é a do mapa. Sem o
 * último, falta a coluna da direita da página 3, e é dela que o texto
 * excedente sente falta.
 */
export function quadrosDoGuia(semOUltimo = true): QuadroDeTexto[] {
  const m = MALHA_DO_GUIA.margens;
  const coluna = (A5.largura - m.interna - m.externa - MALHA_DO_GUIA.medianiz * 2) / 3;
  const quadros: QuadroDeTexto[] = [];
  let ordem = 1;
  for (const pagina of [1, 2]) {
    const impar = (pagina + 1) % 2 === 1;
    const esquerda = impar ? m.interna : m.externa;
    for (const c of [0, 1, 2]) {
      if (semOUltimo && pagina === 2 && c === 2) continue;
      quadros.push({
        id: `g${pagina}-${c}`, pagina, ordem: ordem++,
        x: esquerda + c * (coluna + MALHA_DO_GUIA.medianiz), y: m.topo + RESERVA,
        largura: coluna, altura: A5.altura - m.topo - m.base - RESERVA,
      });
    }
  }
  return quadros;
}

const NOME_NA_CAPA: TextoSolto = {
  id: 'guia-titulo', pagina: 0, texto: 'Guia da Caminhada', x: 12, y: 160, largura: 124, altura: 14, corpo: 22, peso: 700, cor: '#FFFFFF',
};

/** Os números que alguém digitou no pé, um por página. */
export const NUMEROS_DO_GUIA: TextoSolto[] = [1, 2, 3].map(i => ({
  id: `pe-${i + 1}`, pagina: i, texto: String(i + 1), x: 72, y: 199, largura: 8, altura: 5, corpo: 8, peso: 400, cor: '#263238',
}));

/** A capa parando na borda do papel, sem sangrar. */
export const CAPA_NA_BORDA: QuadroDeImagem = { id: 'img-trilha', pagina: 0, imagem: 'trilha', x: 0, y: 0, largura: 148, altura: 210 };
export const CAPA_SANGRANDO: QuadroDeImagem = { ...CAPA_NA_BORDA, x: -3, y: -3, largura: 154, altura: 216 };

/** O mapa da trilha, que veio do editor de design em SVG e ocupa a página 4. */
export const MAPA_NA_PAGINA_4: QuadroDeImagem = { id: 'img-mapa', pagina: 3, imagem: 'mapa', x: 11, y: 22, largura: 120, altura: 150 };

/**
 * O ipê nas duas primeiras colunas da página 2: é onde a tela de "imagem na
 * malha" o põe, e de onde sobram as linhas que o quadro novo recebe.
 */
export const IPE_NAS_DUAS: QuadroDeImagem = { id: 'imagem-1', pagina: 1, imagem: 'ipe', x: 11, y: 110, largura: 78, altura: 52 };

/** O lobo-guará posto nas três colunas da página 3: grande demais para a foto que é. */
export const LOBO_NAS_TRES: QuadroDeImagem = { id: 'img-lobo', pagina: 2, imagem: 'lobo', x: 17, y: 110, largura: 120, altura: 80 };
/** O mesmo lobo-guará em duas colunas. */
export const LOBO_NAS_DUAS: QuadroDeImagem = { ...LOBO_NAS_TRES, largura: 78, altura: 52 };

export function guia(parcial: Partial<Documento> = {}): Documento {
  return {
    nome: 'Guia da Caminhada',
    formato: A5,
    malha: MALHA_DO_GUIA,
    sangria: 3,
    estilos: ESTILOS_DO_GUIA,
    historia: TEXTO_ARRUMADO,
    quadros: quadrosDoGuia(false),
    imagens: [CAPA_SANGRANDO, MAPA_NA_PAGINA_4],
    soltos: [NOME_NA_CAPA],
    biblioteca: FOTOS_DO_GUIA,
    paginas: [0, 1, 2, 3].map(i => ({ id: `p${i + 1}`, mestre: i === 0 ? 'nenhuma' as const : 'A' as const })),
    mestre: { numero: true, cabecalho: 'Guia da Caminhada' },
    cores: CORES_DO_GUIA,
    ...parcial,
  };
}

/* ── Os estados de que cada cena parte ────────────────────────────────────── */

/** Antes da malha: uma coluna só, nenhum quadro, nada de sangria. */
export const guiaSemMalha = () => guia({
  malha: MALHA_SEM_COLUNAS, sangria: 0, quadros: [], imagens: [CAPA_NA_BORDA],
  mestre: { numero: false, cabecalho: '' }, paginas: [0, 1, 2, 3].map(i => ({ id: `p${i + 1}`, mestre: 'A' as const })),
});

/** A malha pronta e a capa parando na borda, sem sangria reservada. */
export const guiaSemSangria = () => guia({ sangria: 0, imagens: [CAPA_NA_BORDA, MAPA_NA_PAGINA_4] });

/** O texto como chegou, com o "+" em dois parágrafos. */
export const guiaComTextoColado = () => guia({ historia: TEXTO_DO_GUIA });

/** Todas as colunas menos a última da página 3, e nenhuma foto no meio do texto. */
export const guiaSemFotos = () => guia({ quadros: quadrosDoGuia(true) });

/** O lobo-guará posto grande demais. */
export const guiaComLoboGrande = () => guia({ imagens: [CAPA_SANGRANDO, MAPA_NA_PAGINA_4, LOBO_NAS_TRES] });

/** Os números digitados no pé, e a mestre ainda vazia. */
export const guiaComNumerosDigitados = () => guia({
  soltos: [NOME_NA_CAPA, ...NUMEROS_DO_GUIA],
  mestre: { numero: false, cabecalho: '' },
  paginas: [0, 1, 2, 3].map(i => ({ id: `p${i + 1}`, mestre: 'A' as const })),
});
