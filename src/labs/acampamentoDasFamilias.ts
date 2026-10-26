/**
 * O projeto da CC-DG006: o convite do Acampamento das Famílias.
 *
 * ── A demanda ────────────────────────────────────────────────────────────
 * Todo ano o clube abre um sábado do acampamento para as famílias dos
 * desbravadores que entraram naquele ano, e todo ano metade delas fica
 * sabendo na sexta-feira, por um áudio no grupo. É uma demanda de
 * comunicação de verdade, com um público que não é o de sempre — pais e
 * avós, e não desbravadores —, e é ela que faz a peça digital precisar ser
 * outra peça: o pai lê no celular, na fila do mercado.
 *
 * ── Um projeto, nove lições ──────────────────────────────────────────────
 * Cada lição parte de onde a anterior chegou, como o boletim da CC-DG005 e
 * a marca da CC-DG004. O projeto que a pessoa apresenta ao examinador é o
 * dela, sobre uma demanda que ela escolhe; o que esta vereda ensina é o
 * caminho, em cima de um projeto que já tem os defeitos que todo projeto tem
 * na primeira vez.
 *
 * ── Os defeitos de partida ───────────────────────────────────────────────
 * Todos são de quem faz o projeto pela primeira vez, e nenhum dá erro: o
 * símbolo é um clipart baixado de um site de ícones grátis; a foto é a do
 * celular, torta e escura; o convite usa a foto crua parando na borda do
 * papel e a fogueira de outra pessoa sem crédito; e o post é o convite
 * encolhido, com letra que no celular tem sete pixels.
 */

import {
  comCaixaRefeita, escalarPorIgual, posicionar,
  type Arte, type Caminho, type Forma, type Foto, type Grupo, type Objeto, type Prancha, type Texto,
} from './design';
import { contornoDoPoligono } from './vetor';
import type { Documento as Diagramacao, Imagem as ImagemDaDiagramacao } from './diagramacao';
import { ESTILOS } from './boletimDoClube';
import { arquivoDe, type Nuvem } from './arquivoCompartilhado';
import { RECORTE_DE_REFERENCIA } from './metasDaCcDg003';
import { LARGURA_DA_FOTO, ALTURA_DA_FOTO } from './fotosDoClube';
import {
  PRANCHA_DO_POST, PRANCHA_DO_SIMBOLO,
  type ArquivoDaEntrega, type ImagemDoProjeto, type Respondente,
} from './projetoDeDesign';

/* ── As cores ─────────────────────────────────────────────────────────────── */

export const VERDE = '#1B4D3E';
export const CREME = '#FFF8E7';
export const TINTA = '#1F2A24';
export const MARROM = '#6B4226';
export const BRANCO = '#FFFFFF';

/** O dia em que o examinador responde a uma proposta completa. */
export const HOJE = '2026-08-10';

/* ── As imagens ───────────────────────────────────────────────────────────── */

export const NOME_DA_CRUA = 'IMG_0412.jpg';
export const NOME_DA_TRATADA = 'acampamento-tratada.jpg';
export const NOME_DA_FOGUEIRA = 'fogueira-ana-souza.jpg';
export const NOME_DO_CLIPART = 'barraca-clipart.png';
export const NOME_DO_SIMBOLO = 'simbolo.svg';

/**
 * As três imagens que o projeto encontra, uma de cada licença.
 *
 * A foto do acampamento é do clube — tirada pela secretária, com a
 * autorização dela; a fogueira é de uma fotógrafa que a publicou com licença
 * CC BY, que deixa usar e pede o nome; e o clipart veio de um site de "ícones
 * grátis" que não diz licença nenhuma. É a lição de direitos da CC-DG003, e a
 * conta é a de lá: grátis para baixar não é livre para usar.
 */
export const IMAGENS_DO_PROJETO: ImagemDoProjeto[] = [
  { id: 'acampamento', nome: NOME_DA_CRUA, licenca: 'propria', autor: 'Célia Moura', fonte: 'Celular da secretária do clube, no acampamento de julho' },
  { id: 'fogueira', nome: NOME_DA_FOGUEIRA, licenca: 'livre', autor: 'Ana Souza', fonte: 'Wikimedia Commons, licença CC BY 4.0' },
  { id: 'clipart', nome: NOME_DO_CLIPART, licenca: 'protegida', autor: '', fonte: 'Um site de "ícones grátis" que não diz a licença' },
];

export const imagemDoProjeto = (id: string) => IMAGENS_DO_PROJETO.find(i => i.id === id)!;

/* ── O símbolo ────────────────────────────────────────────────────────────── */

const caminho = (id: string, nome: string, pts: [number, number][], preenchimento: string | null, traco: Caminho['traco'] = null): Caminho =>
  comCaixaRefeita({
    id, nome, tipo: 'caminho', x: 0, y: 0, largura: 0, altura: 0,
    contornos: [contornoDoPoligono(pts.map(([x, y]) => ({ x, y })))], preenchimento, traco,
  });
const retangulo = (id: string, nome: string, x: number, y: number, l: number, a: number, preenchimento: string): Forma =>
  ({ id, nome, tipo: 'retangulo', x, y, largura: l, altura: a, preenchimento });
const grupo = (id: string, nome: string, filhos: Objeto[]): Grupo =>
  comCaixaRefeita({ id, nome, tipo: 'grupo', x: 0, y: 0, largura: 0, altura: 0, filhos });

/**
 * O símbolo da referência: a barraca, a porta e o chão.
 *
 * Três formas, e nenhuma fina. É o que um símbolo precisa ter para aparecer
 * com 32 pixels no canto de um post e no carimbo do convite — é a régua do
 * ícone de 16 da CC-DG002, no tamanho em que este vai ser visto.
 */
export function simboloDeReferencia(prefixo = 's'): Grupo {
  return grupo(`${prefixo}-simbolo`, 'Símbolo', [
    caminho(`${prefixo}-barraca`, 'Barraca', [[80, 300], [200, 90], [320, 300]], VERDE),
    caminho(`${prefixo}-porta`, 'Porta', [[175, 300], [200, 220], [225, 300]], CREME),
    retangulo(`${prefixo}-chao`, 'Chão', 60, 300, 280, 24, MARROM),
  ]);
}

/**
 * A primeira tentativa, que fica no arquivo como versão descartada.
 *
 * Bonita grande, e feita de traço de 3 pixels: com 32 de lado, cada traço tem
 * um terço de pixel e o desenho some. É o defeito que a CC-DG002 ensina a
 * medir, e é a razão de descarte que se mostra ao examinador.
 */
const tentativa = (): Grupo => grupo('t-simbolo', 'Símbolo (primeira ideia)', [
  caminho('t-lona', 'Lona', [[80, 300], [200, 90], [320, 300]], null, { cor: VERDE, espessura: 3, extremidade: 'redonda' }),
  caminho('t-mastro', 'Mastro', [[198, 90], [202, 90], [202, 300], [198, 300]], null, { cor: MARROM, espessura: 3, extremidade: 'redonda' }),
  caminho('t-estaca-1', 'Estaca', [[80, 300], [60, 320], [62, 322]], null, { cor: MARROM, espessura: 3, extremidade: 'redonda' }),
  caminho('t-estaca-2', 'Estaca', [[320, 300], [340, 320], [338, 322]], null, { cor: MARROM, espessura: 3, extremidade: 'redonda' }),
]);

/** O clipart que estava no símbolo: uma imagem de pontos de 64 pixels, baixada. */
const clipart = (id: string, x: number, y: number, lado: number): Foto => ({
  id, nome: NOME_DO_CLIPART, tipo: 'foto', x, y, largura: lado, altura: lado,
  motivo: 'barracas', tons: ['#2E7D32', '#FFFFFF'], resolucao: 64,
});

/* ── O post ───────────────────────────────────────────────────────────────── */

const texto = (id: string, nome: string, t: string, x: number, y: number, largura: number, extra: Partial<Texto> = {}): Texto => ({
  id, nome, tipo: 'texto', texto: t, x, y, largura, familia: 'Trebuchet MS', peso: 400, corpo: 40, entrelinha: 1.2,
  cor: TINTA, alinhamento: 'esquerda', ...extra,
});

/* Sem `resolucao`: ela é para a imagem de poucos pontos, que o editor desenha
   ponto a ponto para mostrar o serrilhado. A foto tratada tem pontos de sobra
   para o post, e desenhá-la ponto a ponto seriam dois milhões de quadrados. */
const fotoDoPost = (id: string, altura: number, largura = 1080): Foto => ({
  id, nome: NOME_DA_TRATADA, tipo: 'foto', x: 0, y: 0, largura, altura,
  motivo: 'barracas', tons: ['#24412F', '#DCE6D2'],
});

/**
 * O post como chegou: o convite encolhido para a largura do feed.
 *
 * Tem a proporção da folha A5, que nenhum feed usa; a letra do convite, que
 * no papel é de ler parado e no celular chega a sete pixels; o parágrafo
 * inteiro do convite; e o clipart, porque foi feito antes de o símbolo
 * existir. Ninguém o fez errado de propósito: é o que sai de "manda o convite
 * no grupo também".
 */
export function postEncolhido(): Prancha {
  return {
    id: PRANCHA_DO_POST, nome: 'Post', largura: 1080, altura: 1528, fundo: CREME,
    objetos: [
      fotoDoPost('pe-foto', 640),
      texto('pe-titulo', 'Título', 'Acampamento das Famílias', 60, 680, 960, { corpo: 64, peso: 700, cor: VERDE }),
      texto('pe-data', 'Data', 'Sábado, 14 de setembro, das 8h às 17h', 60, 850, 960, { corpo: 30, peso: 700 }),
      texto('pe-lugar', 'Lugar', 'Chácara Recanto Verde — saída da igreja às 7h30', 60, 900, 960, { corpo: 26 }),
      texto('pe-corpo', 'Convite', 'Venha passar o dia com a gente e conhecer o clube de perto: trilha curta, almoço na fogueira, oficina de nós e a cerimônia do fim da tarde. Traga roupa confortável, chapéu e garrafa de água. As crianças pequenas também são bem-vindas.',
        60, 960, 960, { corpo: 22, entrelinha: 1.4 }),
      texto('pe-credito', 'Crédito', 'Clube de Desbravadores Pioneiros', 60, 1440, 600, { corpo: 16 }),
      clipart('pe-clipart', 900, 1380, 120),
    ],
  };
}

/**
 * O post de referência: adaptado ao meio, e não encolhido.
 *
 * Retrato de 1080 por 1350, que é o que o feed mostra inteiro; quatro linhas
 * curtas, com a menor a 44; e o símbolo no canto. Ele perdeu a hora no corte
 * — é o que acontece quando se corta palavra com pressa, e é o que o público
 * vai apontar no módulo 8.
 */
export function postAdaptado(): Prancha {
  const s = simboloDeReferencia('ps');
  const escala = 140 / s.largura;
  const pequeno = posicionar(escalarPorIgual(s, escala), 880, 1150);
  return {
    id: PRANCHA_DO_POST, nome: 'Post', largura: 1080, altura: 1350, fundo: CREME,
    objetos: [
      fotoDoPost('pa-foto', 680),
      retangulo('pa-painel', 'Painel', 0, 680, 1080, 670, CREME),
      texto('pa-titulo', 'Título', 'Acampamento das Famílias', 70, 720, 940, { corpo: 92, peso: 700, cor: VERDE }),
      texto('pa-data', 'Data', 'Sábado, 14 de setembro', 70, 960, 940, { corpo: 56, peso: 700 }),
      texto('pa-lugar', 'Lugar', 'Chácara Recanto Verde', 70, 1040, 940, { corpo: 48 }),
      texto('pa-convite', 'Convite', 'Venha conhecer o clube', 70, 1110, 700, { corpo: 44 }),
      pequeno,
    ],
  };
}

/* ── O arquivo de design ──────────────────────────────────────────────────── */

const pranchaDoSimbolo = (objetos: Objeto[]): Prancha =>
  ({ id: PRANCHA_DO_SIMBOLO, nome: 'Símbolo', largura: 400, altura: 400, fundo: BRANCO, objetos });

const pranchaDaTentativa = (): Prancha =>
  ({ id: 'simbolo-tentativa', nome: 'Símbolo — primeira ideia', largura: 400, altura: 400, fundo: BRANCO, objetos: [tentativa()] });

const PALETA = { fundo: CREME, texto: TINTA, destaque: VERDE, apoio: MARROM, neutro: null };

/**
 * O arquivo como chega à lição do símbolo: a prancha do símbolo com o
 * clipart, e a primeira ideia numa prancha ao lado — que fica, porque
 * versão descartada é processo, e o requisito 4 pede para mostrá-la.
 */
export function arteDePartida(): Arte {
  return {
    pranchas: [pranchaDoSimbolo([clipart('c-clipart', 100, 100, 200)]), pranchaDaTentativa(), postEncolhido()],
    paleta: PALETA,
  };
}

/** O arquivo depois do símbolo: o clipart fora, o símbolo dentro. */
export function arteComSimbolo(): Arte {
  const a = arteDePartida();
  return { ...a, pranchas: a.pranchas.map(p => (p.id === PRANCHA_DO_SIMBOLO ? pranchaDoSimbolo([simboloDeReferencia()]) : p)) };
}

/** O arquivo depois do post: a versão encolhida guardada ao lado, e a adaptada no lugar. */
export function arteComPost(): Arte {
  const a = arteComSimbolo();
  const guardada: Prancha = { ...postEncolhido(), id: 'post-encolhido', nome: 'Post — convite encolhido' };
  return {
    ...a,
    pranchas: [...a.pranchas.filter(p => p.id !== PRANCHA_DO_POST), guardada, postAdaptado()],
  };
}

/* ── O convite ────────────────────────────────────────────────────────────── */

const A5 = { largura: 148, altura: 210 };

/**
 * As imagens que o programa de diagramação enxerga. A tratada e o símbolo
 * estão lá desde o começo do módulo 4, porque o módulo 3 e o módulo 2 os
 * exportaram; a crua, a fogueira e o clipart estão lá porque estavam na pasta.
 */
export const BIBLIOTECA_DO_CONVITE: ImagemDaDiagramacao[] = [
  { id: 'acampamento', nome: NOME_DA_CRUA, largura: LARGURA_DA_FOTO, altura: ALTURA_DA_FOTO, modo: 'rgb' },
  { id: 'tratada', nome: NOME_DA_TRATADA, largura: RECORTE_DE_REFERENCIA.l, altura: RECORTE_DE_REFERENCIA.a, modo: 'rgb' },
  { id: 'fogueira', nome: NOME_DA_FOGUEIRA, largura: 2000, altura: 1333, modo: 'rgb' },
  { id: 'clipart', nome: NOME_DO_CLIPART, largura: 64, altura: 64, modo: 'rgb' },
  { id: 'simbolo', nome: NOME_DO_SIMBOLO, largura: 280, altura: 234, modo: 'vetor' },
];

/** A licença de cada imagem da biblioteca. A tratada é a foto do clube; o símbolo é seu. */
export const ORIGEM_NA_BIBLIOTECA: Record<string, string> = {
  acampamento: 'acampamento', tratada: 'acampamento', fogueira: 'fogueira', clipart: 'clipart',
};

/**
 * O convite como chegou: a foto crua parando na borda de cima, a fogueira
 * sem crédito, o clipart no canto, e o texto sem dizer onde.
 *
 * "Onde" é a informação que mais falta em convite de clube: quem escreve
 * sabe de cor que o acampamento é na chácara, e quem lê não sabe.
 */
export function conviteComoChegou(): Diagramacao {
  return {
    nome: 'Convite',
    formato: A5,
    malha: { margens: { topo: 10, base: 10, interna: 10, externa: 10 }, colunas: 1, medianiz: 0 },
    sangria: 3,
    estilos: ESTILOS,
    historia: [
      { id: 'c-titulo', papel: 'titulo', estilo: 'titulo', texto: 'Acampamento das Famílias' },
      { id: 'c-data', papel: 'corpo', estilo: 'corpo', texto: 'Sábado, 14 de setembro, das 8h às 17h.' },
      { id: 'c-convite', papel: 'corpo', estilo: 'corpo', texto: 'Venha passar o dia com a gente e conhecer o clube de perto: trilha curta, almoço na fogueira, oficina de nós e a cerimônia do fim da tarde. As crianças pequenas também são bem-vindas.' },
    ],
    quadros: [{ id: 'quadro-1', pagina: 0, ordem: 1, x: 10, y: 98, largura: 128, altura: 60 }],
    imagens: [
      { id: 'img-foto', pagina: 0, imagem: 'acampamento', x: 0, y: 0, largura: 148, altura: 92 },
      { id: 'img-fogueira', pagina: 0, imagem: 'fogueira', x: 10, y: 162, largura: 50, altura: 33.3 },
      { id: 'img-clipart', pagina: 0, imagem: 'clipart', x: 118, y: 176, largura: 20, altura: 20 },
    ],
    soltos: [],
    biblioteca: BIBLIOTECA_DO_CONVITE,
    paginas: [{ id: 'p1', mestre: 'nenhuma' }],
    mestre: { numero: false, cabecalho: '' },
    cores: [VERDE, CREME, TINTA, MARROM],
  };
}

/** O crédito que a referência escreve debaixo da fogueira. */
export const CREDITO_DA_FOGUEIRA = 'Foto da fogueira: Ana Souza, CC BY 4.0, Wikimedia Commons.';
export const ONDE_NO_CONVITE = 'Na Chácara Recanto Verde. O ônibus sai da igreja às 7h30.';

/** O convite pronto: a foto tratada sangrando, o símbolo no canto, o crédito e o lugar. */
export function conviteArrumado(): Diagramacao {
  const c = conviteComoChegou();
  return {
    ...c,
    historia: [
      ...c.historia,
      { id: 'novo-1', papel: 'corpo', estilo: 'corpo', texto: ONDE_NO_CONVITE },
      { id: 'novo-2', papel: 'legenda', estilo: 'legenda', texto: CREDITO_DA_FOGUEIRA },
    ],
    imagens: [
      { id: 'img-foto', pagina: 0, imagem: 'tratada', x: -3, y: -3, largura: 154, altura: 95 },
      { id: 'img-fogueira', pagina: 0, imagem: 'fogueira', x: 10, y: 162, largura: 50, altura: 33.3 },
      { id: 'img-simbolo', pagina: 0, imagem: 'simbolo', x: 118, y: 176, largura: 20, altura: 16.7 },
    ],
  };
}

/* ── O retorno ────────────────────────────────────────────────────────────── */

const temHora = (p: Prancha) => /\b\d{1,2}h/.test(p.objetos.filter((o): o is Texto => o.tipo === 'texto').map(t => t.texto).join(' '));
const temCriancas = (p: Prancha) => /(crian[cç]as|irm[aã]os|toda a fam[ií]lia|todas as idades)/i
  .test(p.objetos.filter((o): o is Texto => o.tipo === 'texto').map(t => t.texto).join(' '));

/**
 * Sete pessoas responderam, e cinco são do público.
 *
 * Os dois de fora estão aqui porque é assim que o retorno chega: o
 * conselheiro e o colega da unidade são os primeiros a dar opinião, e as
 * opiniões deles são sobre outra coisa — o versículo, o meme. O requisito
 * pede cinco pessoas **do público-alvo**, e o público é quem a peça precisa
 * alcançar.
 *
 * Entre as cinco, duas pedem mudança e três falam de gosto. Seguir todo
 * comentário é tão errado quanto não seguir nenhum: mais cor, para a
 * Renata, mudaria a peça para agradar uma pessoa sem resolver nada da
 * demanda. A hora e as crianças pequenas resolvem — é o que faltava para
 * alguém decidir ir.
 */
export const RESPONDENTES: Respondente[] = [
  { id: 'lucia', nome: 'Lúcia', quem: 'mãe da Bia, que entrou em março', doPublico: true,
    comentario: 'Achei bonito, mas não diz que horas começa nem que horas acaba. Eu trabalho até meio-dia no sábado.',
    leitura: 'mudar', atendido: temHora },
  { id: 'jorge', nome: 'Jorge', quem: 'pai do Davi, que entrou em abril', doPublico: true,
    comentario: 'Gostei da foto, dá vontade de ir.', leitura: 'manter' },
  { id: 'claudia', nome: 'Cláudia', quem: 'mãe do Pedro, que entrou em fevereiro', doPublico: true,
    comentario: 'Posso levar o irmão menor dele, de quatro anos? Pelo post não deu para saber.',
    leitura: 'mudar', atendido: temCriancas },
  { id: 'antonio', nome: 'Antônio', quem: 'avô da Lara, que entrou em maio', doPublico: true,
    comentario: 'Consegui ler sem os óculos, a letra está boa.', leitura: 'manter' },
  { id: 'renata', nome: 'Renata', quem: 'mãe do Caio, que entrou em março', doPublico: true,
    comentario: 'Eu poria mais cores, achei meio sério.', leitura: 'manter' },
  { id: 'marcio', nome: 'Tio Márcio', quem: 'conselheiro da unidade Ipê', doPublico: false,
    comentario: 'Faltou o versículo do mês embaixo.', leitura: 'manter' },
  { id: 'lucas', nome: 'Lucas', quem: 'desbravador da unidade, 12 anos', doPublico: false,
    comentario: 'Põe um meme que fica mais engraçado.', leitura: 'manter' },
];

export const respondente = (id: string) => RESPONDENTES.find(r => r.id === id);

/* ── A pasta da entrega ───────────────────────────────────────────────────── */

export const PASTA_DO_PROJETO = 'projeto';

/**
 * O que cada arquivo da pasta é. A proposta é final sem ser peça; a crua e a
 * fogueira são originais, que se guardam mas não se entregam como peça; e o
 * clipart é o que não pode ir junto — entregar o que não é seu dentro da
 * pasta do projeto é distribuir o que a licença não deixa.
 */
export const MAPA_DA_ENTREGA: Record<string, ArquivoDaEntrega> = {
  'f-proposta': { peca: null, papel: 'final' },
  'f-simbolo-svg': { peca: 'simbolo', papel: 'editavel' },
  'f-simbolo-png': { peca: 'simbolo', papel: 'final' },
  'f-convite-sla': { peca: 'impressa', papel: 'editavel' },
  'f-convite-pdf': { peca: 'impressa', papel: 'final' },
  'f-post-svg': { peca: 'digital', papel: 'editavel' },
  'f-post-png': { peca: 'digital', papel: 'final' },
  'f-foto-xcf': { peca: 'imagens', papel: 'editavel' },
  'f-foto-jpg': { peca: 'imagens', papel: 'final' },
  'f-foto-crua': { peca: 'imagens', papel: 'original' },
  'f-fogueira': { peca: 'imagens', papel: 'terceiro' },
  'f-clipart': { peca: null, papel: 'clipart' },
  'f-post-v1': { peca: 'digital', papel: 'versao' },
};

/**
 * A pasta do projeto como fica quando cada peça é exportada para o mesmo
 * lugar: tudo solto, uma pasta só, com o editável ao lado do final.
 *
 * As extensões são as dos programas livres — `.sla` do Scribus, `.svg` do
 * Inkscape, `.xcf` do GIMP —, que é o editável de cada peça; quem tiver outro
 * programa tem outra extensão, e a divisão é a mesma.
 */
export function pastaComoChegou(): Nuvem {
  const em = { pasta: PASTA_DO_PROJETO };
  return {
    arquivos: [
      arquivoDe(PASTA_DO_PROJETO, 'Acampamento das Famílias', 'pasta', 'voce'),
      arquivoDe('f-proposta', 'proposta-aprovada.pdf', 'pdf', 'voce', em),
      arquivoDe('f-simbolo-svg', 'simbolo.svg', 'imagem', 'voce', em),
      arquivoDe('f-simbolo-png', 'simbolo.png', 'imagem', 'voce', em),
      arquivoDe('f-convite-sla', 'convite.sla', 'documento', 'voce', em),
      arquivoDe('f-convite-pdf', 'convite.pdf', 'pdf', 'voce', em),
      arquivoDe('f-post-svg', 'post.svg', 'imagem', 'voce', em),
      arquivoDe('f-post-png', 'post.png', 'imagem', 'voce', em),
      arquivoDe('f-foto-xcf', 'acampamento-tratada.xcf', 'imagem', 'voce', em),
      arquivoDe('f-foto-jpg', 'acampamento-tratada.jpg', 'imagem', 'voce', em),
      arquivoDe('f-foto-crua', NOME_DA_CRUA, 'imagem', 'voce', em),
      arquivoDe('f-fogueira', NOME_DA_FOGUEIRA, 'imagem', 'voce', em),
      arquivoDe('f-clipart', NOME_DO_CLIPART, 'imagem', 'voce', em),
      arquivoDe('f-post-v1', 'post-convite-encolhido.png', 'imagem', 'voce', em),
    ],
  };
}

/** Os nomes que a referência dá aos finais: data e versão, no mesmo molde. */
export const NOMES_DOS_FINAIS: Record<string, string> = {
  'f-proposta': 'proposta-2026-08-10-v01.pdf',
  'f-simbolo-png': 'simbolo-2026-09-01-v02.png',
  'f-convite-pdf': 'convite-2026-09-01-v03.pdf',
  'f-post-png': 'post-2026-09-01-v02.png',
  'f-foto-jpg': 'acampamento-2026-09-01-v01.jpg',
};
