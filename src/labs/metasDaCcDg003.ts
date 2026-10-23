import {
  achatar, adicionarMascara, ajustar, apagarSelecao, carimbar, caixaNaImagem, camadaAtiva, documentoDe,
  duplicarCamada, fracaoTransparente, imagemDo, inclinacao, girarDocumento, naCamadaAtiva, recortarDocumento,
  redimensionar, redimensionarDocumento, selecionarPorCor, semelhanca, somarMascaras, tonsDe, comPpi,
  inverterMascara, tamanhoDo,
  type Ajuste, type Documento, type Imagem, type Retangulo,
} from './raster';
import {
  BARRACA, CEU, GARRAFA, GRAMA, INCLINACAO_DA_CAMERA, PLACA, LARGURA_DA_FOTO, ALTURA_DA_FOTO,
  dentroDoEscudo, naBordaDoEscudo, fotoDoAcampamento, fotoDoLenco,
} from './fotosDoClube';
import { exportar, type ArquivoDeImagem, type Formato } from './formatosDeImagem';

/*
 * As dez lições da CC-DG003 Imagem Digital.
 *
 * ── Uma foto, dez estados dela ───────────────────────────────────────────
 * A foto do acampamento chega torta, escura e fria, com uma garrafa no chão.
 * Cada lição parte do estado que a anterior deixa — a de ajustar recebe a foto
 * já nivelada —, que é o arranjo do `cadernoDoClube()` da CC-ES003 pelo motivo
 * escrito lá: começar a lição seguinte mandando refazer a anterior ensinaria
 * que o trabalho de antes não conta. A décima volta à foto crua, porque o
 * requisito 7 pede uma edição completa, do começo.
 *
 * ── O que se mede é o pixel, e quem acha a placa é o mapa ────────────────
 * Cada meta lê os pontos da imagem — a placa branca voltou a ser branca? a
 * grama onde estava a garrafa tem textura de grama? — e acha a placa e a
 * garrafa pelo `mapa` que a imagem carrega, que acompanha todo recorte e todo
 * giro. Por isso recortar de outro jeito, ou um pouco mais apertado, não
 * desorienta a meta seguinte.
 */

export type LicaoDaCcDg003 =
  | 'pixels' | 'recortar' | 'ajustes' | 'remover' | 'camadas'
  | 'transparencia' | 'tamanhos' | 'formatos' | 'direitos' | 'completa';

export type ProgramaDaLicao = 'foto' | 'plataforma';

/** Um arquivo na pasta do laboratório. O de partida é o "original". */
export interface ArquivoNaPasta extends ArquivoDeImagem { original: boolean }

/* ── O caderno ───────────────────────────────────────────────────────────── */

export type UsoDeFormato = 'site' | 'emblema' | 'grafica' | 'captura';
export const USOS_DE_FORMATO: { id: UsoDeFormato; texto: string; certos: Formato[] }[] = [
  { id: 'site', texto: 'A foto do acampamento na página do clube, que precisa abrir rápido no celular', certos: ['jpg', 'webp'] },
  { id: 'emblema', texto: 'O emblema recortado, com o fundo transparente, para pôr por cima de fotos', certos: ['png', 'webp'] },
  { id: 'grafica', texto: 'A foto que vai para a gráfica imprimir a faixa, sem perder nada', certos: ['tiff'] },
  { id: 'captura', texto: 'A captura de tela de um aviso, com letras pequenas que precisam continuar nítidas', certos: ['png'] },
];

export type Licenca = 'propria' | 'livre' | 'protegida';
export const IMAGENS_DO_REQUISITO_6: { id: string; texto: string; certa: Licenca }[] = [
  { id: 'fogueira', texto: 'A foto da fogueira que você mesmo tirou no acampamento', certa: 'propria' },
  { id: 'tucano', texto: 'Foto de um tucano no Wikimedia Commons, marcada CC BY 4.0, autora Ana Lima', certa: 'livre' },
  { id: 'barraca-cc0', texto: 'Ilustração de barraca no Openverse, marcada CC0, domínio público', certa: 'livre' },
  { id: 'mapa', texto: 'Um mapa achado na busca de imagens, sem nenhuma licença escrita', certa: 'protegida' },
  { id: 'logo-de-outro', texto: 'O logotipo de outro clube, copiado do perfil dele numa rede social', certa: 'protegida' },
  { id: 'desenho-colega', texto: 'Um desenho que um colega da unidade fez e mandou para você ver', certa: 'protegida' },
];

export const FONTES_DE_IMAGEM: { id: string; texto: string; confiavel: boolean }[] = [
  { id: 'commons', texto: 'Wikimedia Commons', confiavel: true },
  { id: 'busca', texto: 'A busca de imagens de um buscador', confiavel: false },
  { id: 'openverse', texto: 'Openverse', confiavel: true },
  { id: 'pinterest', texto: 'Um painel de imagens salvas por outras pessoas', confiavel: false },
  { id: 'papel-de-parede', texto: 'Um site de papéis de parede "grátis" que não diz a licença', confiavel: false },
  { id: 'perfil', texto: 'O perfil de um fotógrafo numa rede social', confiavel: false },
];

export interface CadernoDaFoto {
  porQueBorra: string;
  telaEPapel: string;
  formatos: Partial<Record<UsoDeFormato, Formato>>;
  licencas: Record<string, Licenca | undefined>;
  fontes: string[];
  credito: string;
}

export const CADERNO_VAZIO: CadernoDaFoto = { porQueBorra: '', telaEPapel: '', formatos: {}, licencas: {}, fontes: [], credito: '' };

export interface ContextoDaFoto {
  documento: Documento | null;
  pasta: ArquivoNaPasta[];
  /** O que a pessoa viu: o zoom de perto, o conta-gotas, o antes e depois. */
  descobertas: string[];
  caderno: CadernoDaFoto;
}

/** As chaves que a janela avisa. */
export const VIU_OS_PIXELS = 'zoom:1600';
export const LEU_UM_PIXEL = 'conta-gotas';
export const VIU_ANTES_E_DEPOIS = 'antes-e-depois';

/* ── As fotos de partida ─────────────────────────────────────────────────── */

export const NOME_DA_FOTO = 'IMG_0412.jpg';
export const NOME_DO_LENCO = 'lenco-do-clube.jpg';
export const NOME_DA_MINIATURA = 'lenco-miniatura.jpg';
export const NOME_DA_EDITADA = 'acampamento.jpg';

/** O recorte que tira os quatro cantos vazios depois de nivelar. */
export const RECORTE_DE_REFERENCIA: Retangulo = { x: 80, y: 60, l: 1640, a: 1080 };
/** O ajuste que devolve a placa ao branco e a foto à luz da tarde. */
export const AJUSTE_DE_REFERENCIA: Ajuste = { exposicao: 0.7, contraste: 30, temperatura: 40 };
/** O carimbo da referência: três toques na garrafa, copiando a grama à direita. */
export const RAIO_DO_CARIMBO = 26;
export const ORIGEM_DO_CARIMBO = { dx: 70, dy: 0 };

const nivelar = (d: Documento) => recortarDocumento(girarDocumento(d, -INCLINACAO_DA_CAMERA), RECORTE_DE_REFERENCIA);

/** Os pontos em que a referência toca o carimbo, na imagem já nivelada. */
export function toquesNaGarrafa(img: Imagem): { x: number; y: number }[] {
  const g = caixaNaImagem(img, GARRAFA);
  const cx = g.x + g.l / 2;
  return [g.y + 14, g.y + 44, g.y + 74].map(y => ({ x: cx, y }));
}

const removerGarrafa = (d: Documento) => naCamadaAtiva(d, img =>
  toquesNaGarrafa(img).reduce((im, c) => carimbar(im, c, ORIGEM_DO_CARIMBO, RAIO_DO_CARIMBO), img));

let cache: Partial<Record<'crua' | 'nivelada' | 'ajustada' | 'limpa', Documento>> = {};
const memo = (k: keyof typeof cache, f: () => Documento) => (cache[k] ??= f());
/** Para os testes que precisam de memória limpa entre si. */
export const esquecerFotos = () => { cache = {}; };

export const fotoCrua = () => memo('crua', () => documentoDe(NOME_DA_FOTO, fotoDoAcampamento()));
export const fotoNivelada = () => memo('nivelada', () => nivelar(fotoCrua()));
export const fotoAjustada = () => memo('ajustada', () => naCamadaAtiva(fotoNivelada(), img => ajustar(img, AJUSTE_DE_REFERENCIA)));
export const fotoLimpa = () => memo('limpa', () => removerGarrafa(fotoAjustada()));

/** O arquivo que a câmera gravou: um JPG de qualidade alta. */
export const arquivoOriginal = (nome: string, img: Imagem, qualidade = 95): ArquivoNaPasta =>
  ({ ...exportar(img, 'jpg', nome, qualidade), original: true });

const miniatura = () => redimensionar(fotoDoLenco(), 200, 160);

/* ── Medidas ─────────────────────────────────────────────────────────────── */

const miolo = (r: Retangulo, m = 0.2): Retangulo => ({ x: r.x + r.l * m, y: r.y + r.a * m, l: r.l * (1 - 2 * m), a: r.a * (1 - 2 * m) });
const palavras = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const LIMIAR_DE_NIVEL = 0.5;
export const nivelada = (img: Imagem) => Math.abs(inclinacao(img)) <= LIMIAR_DE_NIVEL;
export const semCantosVazios = (img: Imagem) => fracaoTransparente(img) <= 0.0005;
export const foiRecortada = (img: Imagem) => img.largura < LARGURA_DA_FOTO || img.altura < ALTURA_DA_FOTO;
/** A barraca inteira dentro do quadro, com folga de 20 pixels. */
export function barracaInteira(img: Imagem): boolean {
  const b = caixaNaImagem(img, BARRACA);
  return b.x >= 20 && b.y >= 20 && b.x + b.l <= img.largura - 20 && b.y + b.a <= img.altura - 20;
}

/*
 * A luz tem piso e não tem teto, e é de propósito: o teto é o estouro. Medido
 * na foto do acampamento, nenhuma combinação de exposição e contraste passa
 * de 0,72 de média sem estourar mais de 1% dos pixels — um teto de luz ao
 * lado da conta de estouro seria uma segunda conta que nunca decide nada.
 */
export const LUZ_MINIMA = 0.52;
export const DESVIO_MINIMO = 0.13;
export const ESTOURO_MAXIMO = 0.01;
export const NEUTRO = 8;

export const tonsDaFoto = (img: Imagem) => tonsDe(img);
export const tonsDaPlaca = (img: Imagem) => tonsDe(img, miolo(caixaNaImagem(img, PLACA)));
export const placaNeutra = (img: Imagem) => {
  const p = tonsDaPlaca(img);
  return Math.abs(p.r - p.b) <= NEUTRO && Math.abs(p.g - (p.r + p.b) / 2) <= NEUTRO && Math.max(p.r, p.g, p.b) < 253;
};
export const luzCerta = (img: Imagem) => { const t = tonsDaFoto(img); return t.media >= LUZ_MINIMA && t.estourados <= ESTOURO_MAXIMO; };
export const contrasteCerto = (img: Imagem) => { const t = tonsDaFoto(img); return t.desvio >= DESVIO_MINIMO && t.estourados <= ESTOURO_MAXIMO; };

/** Quanto da caixa da garrafa ainda é azul: o azul que a grama não tem. */
export function azulDaGarrafa(img: Imagem): number {
  const g = caixaNaImagem(img, GARRAFA);
  let azuis = 0; let n = 0;
  for (let y = Math.max(0, Math.floor(g.y - 3)); y < Math.min(img.altura, Math.ceil(g.y + g.a + 3)); y++) {
    for (let x = Math.max(0, Math.floor(g.x - 3)); x < Math.min(img.largura, Math.ceil(g.x + g.l + 3)); x++) {
      const i = (y * img.largura + x) * 4; n++;
      if (img.px[i + 2] > img.px[i + 1] + 12) azuis++;
    }
  }
  return n ? azuis / n : 1;
}
export const garrafaSumiu = (img: Imagem) => azulDaGarrafa(img) <= 0.01;
/**
 * O remendo chapado: pintar a garrafa de verde tampa o azul e deixa uma mancha
 * lisa no meio da grama. A grama tem textura, e o que a mede é quanto cada
 * pixel difere do vizinho — e não o desvio da caixa inteira, que a borda macia
 * do pincel, misturando verde chapado com grama de verdade, já enche sozinha.
 * Por isso a conta olha só o miolo da caixa, onde o pincel pintou por inteiro.
 */
export function aspereza(img: Imagem, r: Retangulo): number {
  let soma = 0; let n = 0;
  for (let y = Math.max(0, Math.floor(r.y)); y < Math.min(img.altura, Math.ceil(r.y + r.a)); y++) {
    for (let x = Math.max(0, Math.floor(r.x)); x < Math.min(img.largura - 1, Math.ceil(r.x + r.l)); x++) {
      const i = (y * img.largura + x) * 4;
      soma += Math.abs(img.px[i + 1] - img.px[i + 5]); n++;
    }
  }
  return n ? soma / n : 0;
}
export const comTexturaDeGrama = (img: Imagem) =>
  aspereza(img, miolo(caixaNaImagem(img, GARRAFA), 0.25)) >= aspereza(img, caixaNaImagem(img, GRAMA)) * 0.5;

/**
 * O resto da foto igual ao de antes, fora de uma folga em volta da garrafa. A
 * conta é de pixels mudados, e não de média: um carimbo enorme estraga um anel
 * inteiro em volta da garrafa, e esse anel diluído na foto toda daria uma
 * média de quase nada.
 */
export const MUDADOS_FORA = 200;
export function restoIntacto(img: Imagem, antes: Imagem, folga = 90): boolean {
  if (img.largura !== antes.largura || img.altura !== antes.altura) return false;
  const g = caixaNaImagem(img, GARRAFA);
  let mudados = 0;
  for (let y = 0; y < img.altura; y++) {
    for (let x = 0; x < img.largura; x++) {
      if (x > g.x - folga && x < g.x + g.l + folga && y > g.y - folga && y < g.y + g.a + folga) continue;
      const i = (y * img.largura + x) * 4;
      if (Math.abs(img.px[i] - antes.px[i]) + Math.abs(img.px[i + 1] - antes.px[i + 1]) + Math.abs(img.px[i + 2] - antes.px[i + 2]) > 12) mudados++;
    }
  }
  return mudados <= MUDADOS_FORA;
}

const mesmaImagem = (a: Imagem, b: Imagem) =>
  a.largura === b.largura && a.altura === b.altura && a.px.length === b.px.length && a.px.every((v, i) => v === b.px[i]);

/* Transparência do lenço. */
export function escudoRecortado(img: Imagem): { fundo: number; escudo: number } {
  let fundoT = 0; let fundoN = 0; let escudoO = 0; let escudoN = 0;
  for (let y = 0; y < img.altura; y += 2) {
    for (let x = 0; x < img.largura; x += 2) {
      if (naBordaDoEscudo(x, y, 6)) continue;
      const a = img.px[(y * img.largura + x) * 4 + 3];
      if (dentroDoEscudo(x, y)) { escudoN++; if (a >= 245) escudoO++; } else { fundoN++; if (a <= 10) fundoT++; }
    }
  }
  return { fundo: fundoN ? fundoT / fundoN : 0, escudo: escudoN ? escudoO / escudoN : 0 };
}
export const fundoTransparente = (img: Imagem) => escudoRecortado(img).fundo >= 0.97;
export const escudoInteiro = (img: Imagem) => escudoRecortado(img).escudo >= 0.99;

/* Compressão. */
export const FRACAO_MAXIMA = 0.4;
export const LIMIAR_DE_PERDA = 0.99;
export const LARGURA_MINIMA_NA_WEB = 800;
export function semPerdaPerceptivel(arquivo: ArquivoDeImagem, original: ArquivoDeImagem): boolean {
  const o = original.imagem;
  const ref = arquivo.imagem.largura === o.largura && arquivo.imagem.altura === o.altura
    ? o : redimensionar(o, arquivo.imagem.largura, arquivo.imagem.altura);
  return semelhanca(ref, arquivo.imagem) >= LIMIAR_DE_PERDA;
}

/* ── As metas ────────────────────────────────────────────────────────────── */

export interface MetaDaFoto {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDaFoto) => boolean;
}

const imagem = (c: ContextoDaFoto) => (c.documento ? imagemDo(c.documento) : null);
const exportados = (c: ContextoDaFoto) => c.pasta.filter(a => !a.original);
const originalIntacto = (c: ContextoDaFoto, partida: ArquivoNaPasta) =>
  c.pasta.some(a => a.original && a.nome === partida.nome && a.bytes === partida.bytes);

/* Módulo 1 — pixel e resolução */

export const PALAVRAS_DO_PORQUE = 15;
const METAS_DOS_PIXELS: MetaDaFoto[] = [
  {
    id: 'viu-os-pixels', titulo: 'Ampliar até ver os quadradinhos',
    detalhe: 'Com 1600% de zoom, cada pixel vira um quadrado de cor só.',
    onde: 'Exibir → Zoom', passos: ['Abra o menu Exibir.', 'Escolha 1600%.'],
    feita: c => c.descobertas.includes(VIU_OS_PIXELS),
  },
  {
    id: 'leu-um-pixel', titulo: 'Ler a cor de um pixel',
    detalhe: 'O conta-gotas mostra os três números de um pixel: vermelho, verde e azul.',
    onde: 'Ferramenta Conta-gotas', passos: ['Escolha o Conta-gotas na barra da esquerda.', 'Clique na foto.', 'Leia R, G e B no painel Info.'],
    feita: c => c.descobertas.includes(LEU_UM_PIXEL),
  },
  {
    id: 'ampliou-a-foto', titulo: 'Aumentar a foto para três vezes o tamanho',
    detalhe: 'Pelo menos 600 pixels de largura, a partir de 200. Veja o que acontece com a borda do escudo.',
    onde: 'Imagem → Tamanho da imagem',
    passos: ['Abra Imagem → Tamanho da imagem.', 'Deixe Reamostrar marcado.', 'Ponha 600 na largura e confirme.'],
    feita: c => { const i = imagem(c); return !!i && i.largura >= 600; },
  },
  {
    id: 'explicou-por-que-borra', titulo: 'Explicar por que a foto ampliada borra e o desenho vetorial não',
    detalhe: `Pelo menos ${PALAVRAS_DO_PORQUE} palavras, falando de pixel e de vetor.`,
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: ['Abra o caderno.', 'Escreva o que a foto guarda, o que o vetor guarda, e o que acontece com cada um ao ampliar.'],
    feita: c => palavras(c.caderno.porQueBorra).length >= PALAVRAS_DO_PORQUE
      && sem(c.caderno.porQueBorra).includes('pixel') && sem(c.caderno.porQueBorra).includes('vetor'),
  },
];

/* Módulo 2 — recortar e nivelar */

const METAS_DO_RECORTE: MetaDaFoto[] = [
  {
    id: 'nivelou', titulo: 'Deixar o horizonte reto',
    detalhe: 'A linha onde a grama encontra a serra, sem subir nem descer de um lado.',
    onde: 'Ferramenta Recortar → Endireitar',
    passos: ['Escolha a ferramenta Recortar.', 'No painel, gire a foto até o horizonte acompanhar a grade.', 'O sinal importa: a foto saiu inclinada para um lado, e gira-se para o outro.'],
    feita: c => { const i = imagem(c); return !!i && nivelada(i); },
  },
  {
    id: 'recortou-os-cantos', titulo: 'Recortar sem deixar canto vazio',
    detalhe: 'Girar abre quatro triângulos sem foto nos cantos. O recorte tira os quatro.',
    onde: 'Ferramenta Recortar → Aplicar',
    passos: ['Com a foto já reta, ajuste X, Y, largura e altura do recorte.', 'Deixe os triângulos dos cantos de fora.', 'Clique em Aplicar.'],
    feita: c => { const i = imagem(c); return !!i && nivelada(i) && foiRecortada(i) && semCantosVazios(i); },
  },
  {
    id: 'barraca-inteira', titulo: 'Manter a barraca inteira no quadro',
    detalhe: 'O assunto da foto não pode ser cortado pelo recorte.',
    onde: 'Ferramenta Recortar',
    passos: ['Confira se a ponta e a base da barraca ficaram dentro do recorte.', 'Se cortou, desfaça (Ctrl+Z) e recorte de novo.'],
    feita: c => { const i = imagem(c); return !!i && foiRecortada(i) && barracaInteira(i); },
  },
];

/* Módulo 3 — exposição, contraste e temperatura */

const METAS_DOS_AJUSTES: MetaDaFoto[] = [
  {
    id: 'exposicao', titulo: 'Clarear a foto até a luz da tarde',
    detalhe: 'O histograma sai do canto escuro, sem encostar na parede da direita.',
    onde: 'Painel Ajustes → Exposição', passos: ['Abra o painel Ajustes.', 'Suba a exposição de pouco em pouco, olhando o histograma.', 'Clique em Aplicar.'],
    feita: c => { const i = imagem(c); return !!i && luzCerta(i); },
  },
  {
    id: 'contraste', titulo: 'Devolver o contraste',
    detalhe: 'A foto chegou acinzentada: o histograma é um morrinho estreito no meio.',
    onde: 'Painel Ajustes → Contraste', passos: ['Suba o contraste até o histograma se espalhar.', 'Pare antes de estourar o branco da placa.'],
    feita: c => { const i = imagem(c); return !!i && contrasteCerto(i); },
  },
  {
    id: 'temperatura', titulo: 'Fazer a placa branca voltar a ser branca',
    detalhe: 'A foto saiu fria, azulada. Na placa, vermelho, verde e azul precisam ficar parecidos.',
    onde: 'Painel Ajustes → Temperatura',
    passos: ['Use o Conta-gotas na placa branca e leia R, G e B no painel Info.', 'Suba a temperatura até os três ficarem parecidos.', 'Aplique e confira de novo.'],
    feita: c => { const i = imagem(c); return !!i && placaNeutra(i); },
  },
];

/* Módulo 4 — remover a garrafa */

const METAS_DA_REMOCAO: MetaDaFoto[] = [
  {
    id: 'garrafa-sumiu', titulo: 'Tirar a garrafa do chão',
    detalhe: 'Onde ela estava, nenhum azul.',
    onde: 'Ferramenta Carimbo',
    passos: ['Escolha o Carimbo.', 'Clique em Definir origem e depois na grama ao lado da garrafa.', 'Passe o carimbo por cima da garrafa.'],
    feita: c => { const i = imagem(c); return !!i && garrafaSumiu(i); },
  },
  {
    id: 'sem-remendo', titulo: 'Sem deixar remendo liso',
    detalhe: 'Pintar de verde tampa a garrafa e deixa uma mancha sem textura. Grama copiada tem textura de grama.',
    onde: 'Ferramenta Carimbo',
    passos: ['Se pintou com o Pincel, desfaça (Ctrl+Z).', 'Use o Carimbo, copiando grama de verdade.'],
    feita: c => { const i = imagem(c); return !!i && garrafaSumiu(i) && comTexturaDeGrama(i); },
  },
  {
    id: 'resto-intacto', titulo: 'Sem mexer no resto da foto',
    detalhe: 'Só a garrafa sai. A barraca, a placa e o céu ficam como estavam.',
    onde: 'Ferramenta Carimbo',
    passos: ['Use um pincel do tamanho da garrafa, e não maior.', 'Se o carimbo pegou em outra coisa, desfaça e recomece.'],
    feita: c => { const i = imagem(c); return !!i && garrafaSumiu(i) && restoIntacto(i, imagemDo(fotoAjustada())); },
  },
];

/* Módulo 5 — camadas e máscara */

export const CLAREOU = 0.06;
const METAS_DAS_CAMADAS: MetaDaFoto[] = [
  {
    id: 'duas-camadas', titulo: 'Trabalhar numa cópia da camada',
    detalhe: 'A camada de baixo fica como chegou: é ela que salva você se a de cima der errado.',
    onde: 'Camada → Duplicar camada', passos: ['Abra o menu Camada.', 'Clique em Duplicar camada.'],
    feita: c => !!c.documento && c.documento.camadas.length >= 2 && baseIntacta(c),
  },
  {
    id: 'barraca-mais-clara', titulo: 'Clarear só a barraca',
    detalhe: 'A barraca sai da sombra; o céu e a grama ficam como estavam.',
    onde: 'Painel Ajustes, na camada de cima',
    passos: ['Na camada de cima, suba a exposição.', 'A foto inteira clareia — é a máscara que vai dizer onde vale.'],
    feita: c => barracaClareou(c) && baseIntacta(c),
  },
  {
    id: 'mascara-no-ceu', titulo: 'Usar uma máscara para esconder o resto',
    detalhe: 'A máscara diz onde a camada de cima aparece. Preto esconde, branco mostra.',
    onde: 'Camada → Adicionar máscara',
    passos: ['Com a Varinha, escolha a barraca.', 'Em Camada, clique em Adicionar máscara: ela nasce da seleção.', 'Confira que o céu voltou ao que era.'],
    feita: c => barracaClareou(c) && baseIntacta(c) && ceuIgual(c) && !!c.documento?.camadas.some(x => x.mascara),
  },
];

function baseIntacta(c: ContextoDaFoto): boolean {
  const base = c.documento?.camadas[0];
  return !!base && mesmaImagem(base.imagem, imagemDo(fotoLimpa()));
}
function barracaClareou(c: ContextoDaFoto): boolean {
  if (!c.documento) return false;
  const agora = imagemDo(c.documento); const antes = imagemDo(fotoLimpa());
  return tonsDe(agora, miolo(caixaNaImagem(agora, BARRACA), 0.3)).media - tonsDe(antes, miolo(caixaNaImagem(antes, BARRACA), 0.3)).media >= CLAREOU;
}
function ceuIgual(c: ContextoDaFoto): boolean {
  if (!c.documento) return false;
  const agora = imagemDo(c.documento); const antes = imagemDo(fotoLimpa());
  return Math.abs(tonsDe(agora, caixaNaImagem(agora, CEU)).media - tonsDe(antes, caixaNaImagem(antes, CEU)).media) <= 0.01;
}

/* Módulo 6 — o fundo transparente */

const METAS_DA_TRANSPARENCIA: MetaDaFoto[] = [
  {
    id: 'fundo-transparente', titulo: 'Apagar a mesa em volta do escudo',
    detalhe: 'O fundo vira transparente — o xadrez cinza é como o programa mostra o nada.',
    onde: 'Ferramenta Varinha → Editar → Excluir',
    passos: ['Escolha a Varinha.', 'Clique na madeira. Shift + clique soma outros pedaços dela.', 'Em Editar, clique em Excluir.'],
    feita: c => { const i = imagem(c); return !!i && fundoTransparente(i); },
  },
  {
    id: 'escudo-inteiro', titulo: 'Sem morder o escudo',
    detalhe: 'Tolerância alta demais escolhe também o amarelo da borda, e ele some junto com a mesa.',
    onde: 'Ferramenta Varinha → Tolerância',
    passos: ['Se a borda sumiu, desfaça.', 'Baixe a tolerância e escolha a mesa em mais cliques.'],
    feita: c => { const i = imagem(c); return !!i && fundoTransparente(i) && escudoInteiro(i); },
  },
  {
    id: 'exportou-com-transparencia', titulo: 'Exportar num formato que guarda a transparência',
    detalhe: 'O JPG não tem canal de transparência: o fundo volta, branco.',
    onde: 'Arquivo → Exportar como',
    passos: ['Abra Arquivo → Exportar como.', 'Escolha um formato com canal de transparência.', 'Exporte com outro nome.'],
    feita: c => exportados(c).some(a => fundoTransparente(a.imagem) && escudoInteiro(a.imagem)),
  },
];

/* Módulo 7 — tela e papel */

export const LARGURA_DA_EDITADA = RECORTE_DE_REFERENCIA.l;
export const ALTURA_DA_EDITADA = RECORTE_DE_REFERENCIA.a;
export const PPI_DE_IMPRESSAO = 240;
const METAS_DOS_TAMANHOS: MetaDaFoto[] = [
  {
    id: 'arquivo-de-tela', titulo: 'Exportar uma versão para a tela',
    detalhe: 'Entre 800 e 1280 pixels de largura: o tamanho em que ela vai ser vista no celular e no site.',
    onde: 'Imagem → Tamanho da imagem, e Arquivo → Exportar como',
    passos: ['Em Tamanho da imagem, com Reamostrar marcado, ponha 1080 na largura.', 'Exporte com um nome que diga "tela".', 'Desfaça (Ctrl+Z) para voltar ao tamanho cheio.'],
    feita: c => exportados(c).some(a => a.imagem.largura >= 800 && a.imagem.largura <= 1280),
  },
  {
    id: 'arquivo-de-impressao', titulo: 'Exportar uma versão para imprimir',
    detalhe: `Os mesmos pixels da original, e pelo menos ${PPI_DE_IMPRESSAO} pontos por polegada. Nenhum pixel inventado.`,
    onde: 'Imagem → Tamanho da imagem, com Reamostrar desmarcado',
    passos: ['Abra Tamanho da imagem.', 'Desmarque Reamostrar.', 'Ponha 300 em pontos por polegada: os centímetros mudam, os pixels não.', 'Exporte com um nome que diga "impressão".'],
    feita: c => exportados(c).some(a => a.imagem.ppi >= PPI_DE_IMPRESSAO
      && a.imagem.largura === LARGURA_DA_EDITADA && a.imagem.altura === ALTURA_DA_EDITADA),
  },
  {
    id: 'explicou-tela-e-papel', titulo: 'Explicar a diferença entre os dois arquivos',
    detalhe: `Pelo menos ${PALAVRAS_DO_PORQUE} palavras, falando de pixel e de pontos por polegada.`,
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: ['Abra o caderno.', 'Escreva quantos pixels cada um tem, para que serve o ppi e por que a tela o ignora.'],
    feita: c => palavras(c.caderno.telaEPapel).length >= PALAVRAS_DO_PORQUE && sem(c.caderno.telaEPapel).includes('pixel')
      && (sem(c.caderno.telaEPapel).includes('ppi') || sem(c.caderno.telaEPapel).includes('por polegada')),
  },
];

/* Módulo 8 — compressão e formatos */

const otimizado = (c: ContextoDaFoto, original: ArquivoNaPasta) => exportados(c).filter(a =>
  a.bytes <= original.bytes * FRACAO_MAXIMA && a.imagem.largura >= LARGURA_MINIMA_NA_WEB);

const METAS_DOS_FORMATOS = (original: ArquivoNaPasta): MetaDaFoto[] => [
  {
    id: 'reduziu-sessenta', titulo: 'Reduzir o arquivo em pelo menos 60%',
    detalhe: 'Para a página do clube, com pelo menos 800 pixels de largura.',
    onde: 'Arquivo → Exportar como',
    passos: ['Abra Exportar como.', 'Escolha um formato com perda.', 'Baixe a qualidade olhando o tamanho que o programa calcula.', 'Exporte com outro nome.'],
    feita: c => otimizado(c, original).length > 0,
  },
  {
    id: 'sem-perda-perceptivel', titulo: 'Sem perda que se perceba',
    detalhe: 'Na divisória de antes e depois, as duas metades precisam parecer a mesma foto.',
    onde: 'Exportar como → antes e depois',
    passos: ['Arraste a divisória da prévia e olhe o céu e a borda da barraca.', 'Se aparecerem quadradinhos, suba a qualidade ou reduza a largura.'],
    feita: c => otimizado(c, original).some(a => semPerdaPerceptivel(a, original)),
  },
  {
    id: 'original-guardado', titulo: 'Guardar os dois arquivos',
    detalhe: 'O examinador quer ver o de antes e o de depois. Exportar com o mesmo nome escreve por cima do original.',
    onde: 'Arquivo → Exportar como → Nome',
    passos: ['Exporte com um nome diferente do original.'],
    feita: c => otimizado(c, original).length > 0 && originalIntacto(c, original),
  },
  {
    id: 'escolheu-os-formatos', titulo: 'Escolher o formato de cada arquivo do clube',
    detalhe: 'Quatro usos, quatro escolhas.',
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: ['Abra o caderno.', 'Para cada uso, escolha o formato.'],
    feita: c => USOS_DE_FORMATO.every(u => { const f = c.caderno.formatos[u.id]; return !!f && u.certos.includes(f); }),
  },
];

/* Módulo 9 — direitos */

const METAS_DOS_DIREITOS: MetaDaFoto[] = [
  {
    id: 'classificou-as-imagens', titulo: 'Dizer de quem é cada imagem',
    detalhe: 'Sua, de licença livre, ou protegida.', onde: 'Caderno → De quem é',
    passos: ['Leia de onde veio cada imagem.', 'Escolha a categoria de cada uma.'],
    feita: c => IMAGENS_DO_REQUISITO_6.every(i => c.caderno.licencas[i.id] === i.certa),
  },
  {
    id: 'indicou-duas-fontes', titulo: 'Indicar duas fontes confiáveis de imagens de uso permitido',
    detalhe: 'Fontes que dizem a licença de cada imagem.', onde: 'Caderno → Fontes',
    passos: ['Marque as fontes em que cada imagem traz a licença escrita.', 'Deixe desmarcadas as que não dizem nada.'],
    feita: c => {
      const certas = FONTES_DE_IMAGEM.filter(f => f.confiavel).map(f => f.id).sort();
      return [...c.caderno.fontes].sort().join() === certas.join();
    },
  },
  {
    id: 'escreveu-o-credito', titulo: 'Escrever o crédito da foto do tucano',
    detalhe: 'A licença CC BY permite usar, e pede o nome de quem fez.', onde: 'Caderno → Crédito',
    passos: ['Escreva quem fez a foto, a licença e de onde ela veio.'],
    feita: c => { const t = sem(c.caderno.credito); return t.includes('ana lima') && t.includes('cc by') && t.includes('wikimedia'); },
  },
];

/* Módulo 10 — a edição completa */

export const fotoEditada = (img: Imagem) => nivelada(img) && foiRecortada(img) && semCantosVazios(img) && barracaInteira(img)
  && luzCerta(img) && contrasteCerto(img) && placaNeutra(img) && garrafaSumiu(img) && comTexturaDeGrama(img);

const METAS_DA_EDICAO = (original: ArquivoNaPasta): MetaDaFoto[] => [
  {
    id: 'editou-tudo', titulo: 'Fazer a edição inteira',
    detalhe: 'Reta e recortada, com a luz, o contraste e a placa certos, e sem a garrafa.',
    onde: 'Os módulos 2, 3 e 4',
    passos: ['Endireite e recorte.', 'Ajuste exposição, contraste e temperatura.', 'Tire a garrafa com o carimbo.'],
    feita: c => { const i = imagem(c); return !!i && fotoEditada(i); },
  },
  {
    id: 'viu-antes-e-depois', titulo: 'Comparar o antes e o depois',
    detalhe: 'É o que se mostra ao examinador.', onde: 'Exibir → Antes e depois',
    passos: ['Abra o menu Exibir.', 'Clique em Antes e depois.'],
    feita: c => c.descobertas.includes(VIU_ANTES_E_DEPOIS) && !!imagem(c) && fotoEditada(imagem(c)!),
  },
  {
    id: 'exportou-sem-apagar', titulo: 'Exportar a editada sem apagar a original',
    detalhe: 'Sem o arquivo de antes, não há antes para mostrar.', onde: 'Arquivo → Exportar como',
    passos: ['Exporte com um nome novo, e não com o nome da foto da câmera.'],
    feita: c => exportados(c).some(a => fotoEditada(a.imagem)) && originalIntacto(c, original),
  },
];

/* ── As lições ───────────────────────────────────────────────────────────── */

export interface LicaoDeFoto {
  programa: ProgramaDaLicao;
  caderno: boolean;
  contexto: () => ContextoDaFoto;
  metas: MetaDaFoto[];
}

const partida = (documento: Documento | null, pasta: ArquivoNaPasta[]): ContextoDaFoto =>
  ({ documento, pasta, descobertas: [], caderno: CADERNO_VAZIO });

let originais: { editada?: ArquivoNaPasta; crua?: ArquivoNaPasta; miniatura?: ArquivoNaPasta; lenco?: ArquivoNaPasta } = {};
export const arquivoDaEditada = () => (originais.editada ??= arquivoOriginal(NOME_DA_EDITADA, imagemDo(fotoLimpa())));
export const arquivoDaCrua = () => (originais.crua ??= arquivoOriginal(NOME_DA_FOTO, imagemDo(fotoCrua())));
const arquivoDaMiniatura = () => (originais.miniatura ??= arquivoOriginal(NOME_DA_MINIATURA, miniatura(), 90));
const arquivoDoLenco = () => (originais.lenco ??= arquivoOriginal(NOME_DO_LENCO, fotoDoLenco(), 92));

/** O documento aberto a partir de um arquivo é o que o arquivo guarda, e não a cena. */
const abrir = (a: ArquivoNaPasta) => documentoDe(a.nome, { ...a.imagem, px: new Uint8ClampedArray(a.imagem.px) });

export const LICOES_DA_CC_DG003: Record<LicaoDaCcDg003, LicaoDeFoto> = {
  pixels: { programa: 'foto', caderno: true, contexto: () => partida(abrir(arquivoDaMiniatura()), [arquivoDaMiniatura()]), metas: METAS_DOS_PIXELS },
  recortar: { programa: 'foto', caderno: false, contexto: () => partida(fotoCrua(), []), metas: METAS_DO_RECORTE },
  ajustes: { programa: 'foto', caderno: false, contexto: () => partida(fotoNivelada(), []), metas: METAS_DOS_AJUSTES },
  remover: { programa: 'foto', caderno: false, contexto: () => partida(fotoAjustada(), []), metas: METAS_DA_REMOCAO },
  camadas: { programa: 'foto', caderno: false, contexto: () => partida(fotoLimpa(), []), metas: METAS_DAS_CAMADAS },
  transparencia: { programa: 'foto', caderno: false, contexto: () => partida(abrir(arquivoDoLenco()), [arquivoDoLenco()]), metas: METAS_DA_TRANSPARENCIA },
  tamanhos: { programa: 'foto', caderno: true, contexto: () => partida(abrir(arquivoDaEditada()), [arquivoDaEditada()]), metas: METAS_DOS_TAMANHOS },
  get formatos() { return { programa: 'foto' as const, caderno: true, contexto: () => partida(abrir(arquivoDaEditada()), [arquivoDaEditada()]), metas: METAS_DOS_FORMATOS(arquivoDaEditada()) }; },
  direitos: { programa: 'plataforma', caderno: true, contexto: () => partida(null, []), metas: METAS_DOS_DIREITOS },
  get completa() { return { programa: 'foto' as const, caderno: false, contexto: () => partida(abrir(arquivoDaCrua()), [arquivoDaCrua()]), metas: METAS_DA_EDICAO(arquivoDaCrua()) }; },
};

export const metasDa = (licao: LicaoDaCcDg003) => LICOES_DA_CC_DG003[licao].metas;

/* ── A solução de referência de cada lição ───────────────────────────────── */

export const PORQUE_ESCRITO =
  'A foto guarda a cor de cada pixel, e ampliar só deixa cada pixel maior ou inventa os do meio; o vetor guarda a receita da forma e se redesenha liso.';
export const TELA_E_PAPEL_ESCRITO =
  'Os dois têm os mesmos pixels por centímetro na tela, que ignora o ppi; o de imprimir guarda todos os pixels a 300 ppi, e o de tela tem menos pixels e pesa menos.';

const exportado = (img: Imagem, formato: Formato, nome: string, qualidade = 85): ArquivoNaPasta =>
  ({ ...exportar(img, formato, nome, qualidade), original: false });

/** O caminho que a pessoa faria, operação por operação, partindo do estado da lição. */
export function estadoDepois(licao: LicaoDaCcDg003): ContextoDaFoto {
  const c = LICOES_DA_CC_DG003[licao].contexto();
  const d = c.documento!;
  switch (licao) {
    case 'pixels': {
      const img = imagemDo(d);
      return {
        ...c, documento: redimensionarDocumento(d, img.largura * 3, img.altura * 3),
        descobertas: [VIU_OS_PIXELS, LEU_UM_PIXEL], caderno: { ...c.caderno, porQueBorra: PORQUE_ESCRITO },
      };
    }
    case 'recortar': return { ...c, documento: nivelar(d) };
    case 'ajustes': return { ...c, documento: naCamadaAtiva(d, img => ajustar(img, AJUSTE_DE_REFERENCIA)) };
    case 'remover': return { ...c, documento: removerGarrafa(d) };
    case 'camadas': {
      const copia = duplicarCamada(d, 'copia');
      const clara = naCamadaAtiva(copia, img => ajustar(img, { exposicao: 0.8, contraste: 0, temperatura: 0 }));
      const b = caixaNaImagem(imagemDo(d), BARRACA);
      const selecao = selecionarPorCor(imagemDo(d), b.x + b.l * 0.35, b.y + b.a * 0.75, 40);
      return { ...c, documento: adicionarMascara({ ...clara, selecao }) };
    }
    case 'transparencia': {
      const img = imagemDo(d);
      // A mesa é um degradê: um clique não alcança as duas pontas, e cada
      // Shift + clique soma um pedaço.
      const sementes = [[20, 20], [980, 20], [20, 780], [980, 780], [500, 760]];
      const selecao = sementes.map(([x, y]) => selecionarPorCor(img, x, y, 36)).reduce(somarMascaras);
      const recortado = naCamadaAtiva({ ...d, selecao }, im => apagarSelecao(im, selecao));
      return { ...c, documento: recortado, pasta: [...c.pasta, exportado(imagemDo(recortado), 'png', 'escudo-recortado.png')] };
    }
    case 'tamanhos': {
      const img = imagemDo(d);
      const tela = redimensionar(img, 1080, Math.round(1080 * img.altura / img.largura));
      const impressao = imagemDo(comPpi(d, 300));
      return {
        ...c, pasta: [...c.pasta, exportado(tela, 'jpg', 'acampamento-tela.jpg', 85), exportado(impressao, 'tiff', 'acampamento-impressao.tif')],
        caderno: { ...c.caderno, telaEPapel: TELA_E_PAPEL_ESCRITO },
      };
    }
    case 'formatos': {
      const img = imagemDo(d);
      const web = redimensionar(img, 1200, Math.round(1200 * img.altura / img.largura));
      return {
        ...c, pasta: [...c.pasta, exportado(web, 'jpg', 'acampamento-web.jpg', 75)],
        caderno: { ...c.caderno, formatos: { site: 'jpg', emblema: 'png', grafica: 'tiff', captura: 'png' } },
      };
    }
    case 'direitos':
      return {
        ...c, caderno: {
          ...c.caderno,
          licencas: Object.fromEntries(IMAGENS_DO_REQUISITO_6.map(i => [i.id, i.certa])),
          fontes: ['commons', 'openverse'],
          credito: 'Foto: Ana Lima, CC BY 4.0, via Wikimedia Commons',
        },
      };
    case 'completa': {
      const feito = removerGarrafa(naCamadaAtiva(nivelar(d), img => ajustar(img, AJUSTE_DE_REFERENCIA)));
      return {
        ...c, documento: feito, descobertas: [VIU_ANTES_E_DEPOIS],
        pasta: [...c.pasta, exportado(imagemDo(feito), 'jpg', 'acampamento-editada.jpg', 90)],
      };
    }
    default: { const nunca: never = licao; return nunca; }
  }
}

/* Usados pela janela e pela trava; reexportados para não haver dois caminhos até eles. */
export { camadaAtiva, inverterMascara, achatar, tamanhoDo };
