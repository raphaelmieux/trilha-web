/**
 * A identidade da unidade Ipê: o arquivo que a CC-DG004 abre.
 *
 * ── Uma unidade, uma marca, nove lições ──────────────────────────────────
 * O requisito 4 manda criar a identidade de uma unidade, projeto ou evento do
 * clube, e a vereda inteira constrói **uma**: a da unidade Ipê. O conceito, os
 * rascunhos, o símbolo, as versões, a paleta, as aplicações e o manual são da
 * mesma marca, e cada lição parte de onde a anterior chegou — é o arranjo do
 * `discoDoClube()` da CC-ES001 e do caderno da CC-ES003. Sete marcas
 * diferentes ensinariam que cada etapa é um exercício solto, e o que o
 * requisito pede é o contrário: que elas sejam a mesma coisa vista de sete
 * lados.
 *
 * A marca que a pessoa defende diante do examinador é a dela, e ela a faz no
 * papel e no programa que tiver. O que esta vereda ensina é o caminho.
 *
 * ── O símbolo da referência ──────────────────────────────────────────────
 * Copa e tronco: duas formas, que é o que um símbolo de unidade precisa ter
 * para sobreviver ao bordado da faixa e ao carimbo. O tronco é a parte fina,
 * e é ele que decide o tamanho mínimo junto com a letra.
 *
 * A copa é roxa, e não amarela. O ipê-amarelo seria o mais famoso, e amarelo
 * sobre papel branco não chega a 2:1: a versão colorida da marca não se leria
 * no crachá, e a lição de versões teria de começar pedindo outra cor. O roxo
 * é o ipê que floresce primeiro no inverno do cerrado.
 */

import {
  comCaixaRefeita,
  type Arte, type Forma, type Foto, type Grupo, type Objeto, type Paleta, type Prancha, type Texto,
} from './design';

export const NOME_DA_MARCA = 'Ipê';

export const ROXO = '#7B3F98';
export const VERDE = '#1B4D3E';
export const MARROM = '#6B4226';
export const CREME = '#FFF8E7';
export const TINTA = '#1F2A24';

/** A paleta que a lição de cores constrói, e que as seguintes recebem pronta. */
export const PALETA_DA_IPE: Paleta = { fundo: CREME, texto: TINTA, destaque: ROXO, apoio: VERDE, neutro: MARROM };
const PALETA_VAZIA: Paleta = { fundo: null, texto: null, destaque: null, apoio: null, neutro: null };

const prancha = (id: string, nome: string, objetos: Objeto[], largura = 400, altura = 400, fundo = '#FFFFFF'): Prancha =>
  ({ id, nome, largura, altura, fundo, objetos });

const elipse = (id: string, nome: string, x: number, y: number, l: number, a: number, preenchimento: string): Forma =>
  ({ id, nome, tipo: 'elipse', x, y, largura: l, altura: a, preenchimento });
const retangulo = (id: string, nome: string, x: number, y: number, l: number, a: number, preenchimento: string): Forma =>
  ({ id, nome, tipo: 'retangulo', x, y, largura: l, altura: a, preenchimento });
const texto = (id: string, nome: string, t: string, x: number, y: number, largura: number, extra: Partial<Texto> = {}): Texto => ({
  id, nome, tipo: 'texto', texto: t, x, y, largura, familia: 'Trebuchet MS', peso: 400, corpo: 16, entrelinha: 1.3,
  cor: TINTA, alinhamento: 'esquerda', ...extra,
});

/**
 * A assinatura de referência: símbolo à esquerda, logotipo à direita.
 *
 * `prefixo` dá ids próprios a cada cópia, como o colar daria — duas peças
 * com a mesma assinatura não podem dividir ids.
 */
export function assinaturaDaIpe(prefixo = 'ipe', x = 100, y = 130): Grupo {
  return comCaixaRefeita<Grupo>({
    id: `${prefixo}-assinatura`, nome: 'Assinatura', tipo: 'grupo', x: 0, y: 0, largura: 0, altura: 0,
    filhos: [
      elipse(`${prefixo}-copa`, 'Copa', x, y, 120, 100, ROXO),
      retangulo(`${prefixo}-tronco`, 'Tronco', x + 52, y + 90, 16, 50, MARROM),
      texto(`${prefixo}-logotipo`, 'Logotipo', NOME_DA_MARCA, x + 140, y + 30, 160,
        { corpo: 56, peso: 700, cor: VERDE, entrelinha: 1.1 }),
    ],
  });
}

/* ── As pranchas ──────────────────────────────────────────────────────────── */

export const SIMBOLO = 'simbolo';
export const ASSINATURA = 'assinatura';
export const TIPOGRAFIA = 'tipografia';
export const TAMANHO_MINIMO = 'tamanho-minimo';
export const CAMISETA = 'camiseta';
export const CRACHA = 'cracha';
export const POST = 'post';
export const MANUAL = 'manual';

/** A camiseta da unidade: verde-escura, que é onde a versão colorida se perde. */
export const pranchaDaCamiseta = (): Prancha => prancha(CAMISETA, 'Camiseta', [
  texto('camiseta-legenda', 'Legenda', 'Estampa no peito, à esquerda', 24, 640, 300, { cor: '#D7E4DC', corpo: 14 }),
], 600, 700, '#123A2E');

/** O crachá do acampamento: pequeno, com foto e nome, e pouco espaço sobrando. */
export const pranchaDoCracha = (): Prancha => prancha(CRACHA, 'Crachá', [
  { id: 'cracha-foto', nome: 'Foto 3×4', tipo: 'foto', motivo: 'barracas', x: 70, y: 110, largura: 100, altura: 130, tons: ['#4A5A50', '#C9D3CC'] } satisfies Foto,
  texto('cracha-nome', 'Nome', 'Marina Alves', 20, 260, 200, { corpo: 20, peso: 700, alinhamento: 'centro' }),
  texto('cracha-funcao', 'Função', 'Desbravadora', 20, 290, 200, { corpo: 14, alinhamento: 'centro' }),
], 240, 340);

/** O post da rede social do clube: a foto do acampamento ocupando tudo. */
export const pranchaDoPost = (): Prancha => prancha(POST, 'Post', [
  { id: 'post-foto', nome: 'Foto do acampamento', tipo: 'foto', motivo: 'fogueira', x: 0, y: 0, largura: 540, altura: 540, tons: ['#2A1C14', '#5B3A24'] } satisfies Foto,
  texto('post-chamada', 'Chamada', 'Inscrições abertas para o acampamento de inverno', 40, 400, 460, { corpo: 28, peso: 700, cor: '#FFFFFF' }),
], 540, 540, '#000000');

/* Larga o bastante para a área de proteção caber inteira: a prancha de
   referência é a primeira coisa que o manual mostra, e ela não pode ser o
   primeiro uso incorreto. */
const pranchaDaAssinatura = (): Prancha => prancha(ASSINATURA, 'Assinatura', [assinaturaDaIpe()], 500, 400);

export interface EstadoDaIdentidade {
  arte: Arte;
}

/** O arquivo vazio do módulo 3: uma prancha em branco para o símbolo. */
export const arteDoSimbolo = (): Arte => ({
  pranchas: [prancha(SIMBOLO, 'Símbolo', [])],
  paleta: PALETA_VAZIA,
});

/** O arquivo das versões: a assinatura colorida, e mais nada. */
export const arteDasVersoes = (): Arte => ({ pranchas: [pranchaDaAssinatura()], paleta: PALETA_VAZIA });

/** O da paleta: a assinatura, e uma prancha para a tipografia. */
export const arteDaPaleta = (): Arte => ({
  pranchas: [pranchaDaAssinatura(), prancha(TIPOGRAFIA, 'Tipografia', [])],
  paleta: PALETA_VAZIA,
});

/** O do tamanho mínimo: a paleta definida, e uma prancha para a prova. */
export const arteDoMinimo = (): Arte => ({
  pranchas: [pranchaDaAssinatura(), prancha(TAMANHO_MINIMO, 'Tamanho mínimo', [])],
  paleta: PALETA_DA_IPE,
});

/** O das aplicações: a assinatura e as três peças, sem marca nenhuma nelas. */
export const arteDasAplicacoes = (): Arte => ({
  pranchas: [pranchaDaAssinatura(), pranchaDaCamiseta(), pranchaDoCracha(), pranchaDoPost()],
  paleta: PALETA_DA_IPE,
});

/** O do manual: a assinatura e a primeira página, em branco. */
export const arteDoManual = (): Arte => ({
  pranchas: [pranchaDaAssinatura(), prancha(MANUAL, 'Manual — 1', [], 420, 594)],
  paleta: PALETA_DA_IPE,
});
