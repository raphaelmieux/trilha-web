import type { LogoShape, Simbolo, FonteDeDesenho } from '../lib/imageTools';

/*
 * O modelo com que o laboratório de desenhar as imagens do site abre, e os
 * limites que ele tem de vencer.
 *
 * ── Por que mora fora do componente ──────────────────────────────────────
 * O laboratório já abriu com um modelo aprovado — sigla de três letras, fundo
 * transparente, contraste bom, cinco rótulos preenchidos. O desbravador
 * clicava em Baixar três vezes e concluía a lição sem ter decidido nada. O
 * erro não aparece em tela nenhuma: tudo fica verde, que é o que se espera de
 * um laboratório funcionando.
 *
 * Então o modelo saiu para cá, onde `modeloInicial.test.ts` confere item por
 * item que ele continua reprovando em tudo. Uma cor trocada sem querer devolve
 * o laboratório ao estado antigo, e em silêncio; o teste é quem percebe.
 *
 * ── Nada aqui é sabotagem ────────────────────────────────────────────────
 * É o que sai de quem abre um editor e aceita o que veio na frente: o nome
 * inteiro do clube dentro do emblema, o maior tamanho que o controle oferece,
 * o fundo branco que o programa já traz, dois botões, um banner quase
 * quadrado. Sair daí é o trabalho da lição.
 */

/** "menos de 15 KB", do requisito AP035-5.2. */
export const ORCAMENTO = 15 * 1024;
/** O dedo erra abaixo disso; é o piso que Apple e Google publicam. */
export const ALVO_DE_TOQUE = 44;
/** "pelo menos, cinco botões de navegação gráfica" — o mínimo é do requisito. */
export const MINIMO_DE_BOTOES = 5;
/** Teto nosso: acima disso a fila de botões não cabe na prancheta. */
export const MAXIMO_DE_BOTOES = 8;
/** WCAG AA para texto normal. */
export const CONTRASTE_MINIMO = 4.5;
/** Abaixo de três vezes a altura, o header empurra o conteúdo para fora da tela. */
export const PROPORCAO_MINIMA = 3;
/** Sigla maior que isso vira borrão quando o logo encolhe. */
export const MAXIMO_DE_LETRAS = 6;
/** O maior lado que o controle de tamanho oferece. */
export const MAIOR_LADO_DO_LOGO = 1024;

export const LOGO_INICIAL = {
  /** Vinte e duas letras, e cabem seis. */
  texto: 'Clube de Desbravadores',
  forma: 'quadrado' as LogoShape,
  figura: 'nenhum' as Simbolo,
  fonte: 'sem-serifa' as FonteDeDesenho,
  /** No máximo do controle: medido, dá 42 KB, quase três vezes o orçamento. */
  tamanho: MAIOR_LADO_DO_LOGO,
  /** Fundo chapado: o arquivo sai sem um pixel transparente sequer. */
  fundoBranco: true,
  fundo: '#FFD54F',
  /** Branco sobre amarelo claro: 1,4:1. */
  frente: '#FFFFFF',
};

export const BOTOES_INICIAIS = {
  /** Dois, e o requisito pede cinco. */
  rotulos: ['Página inicial', 'Contato'],
  altura: 30,
  /** Canto reto não recorta nada, e aí nem transparência o PNG tem. */
  raio: 0,
  fonte: 'sem-serifa' as FonteDeDesenho,
  /** Fora da paleta segura da web, e 1,7:1 um contra o outro. */
  fundo: '#DD4444',
  frente: '#EE8888',
};

export const HEADER_INICIAL = {
  titulo: '',
  subtitulo: '',
  figura: 'nenhum' as Simbolo,
  fonte: 'sem-serifa' as FonteDeDesenho,
  largura: 800,
  /** 1,9× — quase quadrado, longe das três vezes que um banner pede. */
  altura: 420,
  de: '#FFE082',
  ate: '#FFF8E1',
  /** Branco em cima de creme: sumido nas duas pontas do degradê. */
  frente: '#FFFFFF',
};
