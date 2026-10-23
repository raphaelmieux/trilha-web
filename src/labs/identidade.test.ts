import { describe, expect, it } from 'vitest';
import {
  CONTRASTE_DA_MARCA, contrasteDaMarca, defeitosDe, ehColorida, ehMarca, ehMonocromatica, ehNegativa,
  invasoes, larguraMinimaMedida, marcasNa, minimoHonesto, proporcaoDoSimbolo, tintasForaDaPaleta,
} from './identidade';
import {
  NOME_DA_MARCA, PALETA_DA_IPE, arteDasAplicacoes, assinaturaDaIpe, pranchaDaCamiseta, pranchaDoCracha, pranchaDoPost,
} from './identidadeDoClube';
import {
  copiasParaColar, escalarPorIgual, mudarObjetos, recolorir, redimensionar, tintasDe,
  type Grupo, type Objeto, type Prancha,
} from './design';

/*
  As premissas da CC-DG004, medidas no motor: o que torna uma aplicação da
  marca certa ou errada. As metas da vereda dependem de cada uma delas, e uma
  premissa que mudasse calada — a colorida passando a se ler na camiseta, por
  exemplo — tiraria a razão de existir da versão negativa.
*/

const mestre = () => assinaturaDaIpe();
const branca = (objetos: Objeto[] = []): Prancha => ({ id: 'p', nome: 'P', largura: 500, altura: 400, fundo: '#FFFFFF', objetos });
const com = (p: Prancha, g: Grupo): Prancha => ({ ...p, objetos: [...p.objetos, g] });
function moverPara(g: Grupo, x: number, y: number): Grupo {
  const dx = x - g.x; const dy = y - g.y;
  const mover = (o: Objeto): Objeto => (o.tipo === 'grupo'
    ? { ...o, x: o.x + dx, y: o.y + dy, filhos: o.filhos.map(mover) }
    : { ...o, x: o.x + dx, y: o.y + dy });
  return mover(g) as Grupo;
}

describe('a marca se acha pelo nome', () => {
  it('a assinatura é uma marca, e o logotipo sozinho não é', () => {
    expect(ehMarca(mestre(), NOME_DA_MARCA)).toBe(true);
    const soLetra = { ...mestre(), filhos: mestre().filhos.filter(f => f.tipo === 'texto') };
    expect(ehMarca(soLetra, NOME_DA_MARCA)).toBe(false);
  });

  it('a cópia colada continua sendo a marca, com ids novos', () => {
    const [copia] = copiasParaColar(arteDasAplicacoes(), [mestre()]);
    expect(copia.id).not.toBe(mestre().id);
    expect(marcasNa(com(branca(), copia as Grupo), NOME_DA_MARCA)).toHaveLength(1);
  });

  it('a marca agrupada com o título de um cartaz ainda é achada', () => {
    const cartaz: Grupo = { id: 'cartaz', nome: 'Cartaz', tipo: 'grupo', x: 0, y: 0, largura: 400, altura: 400, filhos: [mestre()] };
    expect(marcasNa(branca([cartaz]), NOME_DA_MARCA).map(g => g.id)).toEqual([mestre().id]);
  });
});

describe('as versões', () => {
  it('a colorida se lê no papel branco, e não na camiseta verde', () => {
    expect(ehColorida(com(branca(), mestre()), mestre())).toBe(true);
    const naCamiseta = moverPara(mestre(), 100, 100);
    expect(contrasteDaMarca(com(pranchaDaCamiseta(), naCamiseta), naCamiseta)).toBeLessThan(CONTRASTE_DA_MARCA);
  });

  it('a negativa é clara sobre escuro, e a mesma tinta sobre o branco não é negativa', () => {
    const negativa = recolorir(moverPara(mestre(), 100, 100), '#FFFFFF') as Grupo;
    expect(ehNegativa(com(pranchaDaCamiseta(), negativa), negativa)).toBe(true);
    const preta = recolorir(mestre(), '#000000') as Grupo;
    expect(ehNegativa(com(branca(), preta), preta)).toBe(false);
    expect(ehMonocromatica(com(branca(), preta), preta)).toBe(true);
  });

  it('a de uma cor só precisa ser de uma cor só', () => {
    const quase = mudarObjetos(branca([recolorir(mestre(), '#000000')]), [mestre().filhos[1].id], o => recolorir(o, '#6B4226')).objetos[0] as Grupo;
    expect(tintasDe(quase)).toHaveLength(2);
    expect(ehMonocromatica(branca([quase]), quase)).toBe(false);
  });

  it('a colorida não se lê sobre a foto do post, e a negativa sim', () => {
    const naFoto = moverPara(mestre(), 40, 40);
    expect(contrasteDaMarca(com(pranchaDoPost(), naFoto), naFoto)).toBeLessThan(CONTRASTE_DA_MARCA);
    const negativa = recolorir(naFoto, '#FFFFFF') as Grupo;
    expect(ehNegativa(com(pranchaDoPost(), negativa), negativa)).toBe(true);
  });
});

describe('a paleta', () => {
  it('a assinatura de referência usa só cores da paleta', () => {
    expect(tintasForaDaPaleta(arteDasAplicacoes(), mestre())).toEqual([]);
  });

  it('preto e branco valem sempre; um laranja qualquer não', () => {
    const arte = arteDasAplicacoes();
    expect(tintasForaDaPaleta(arte, recolorir(mestre(), '#000000') as Grupo)).toEqual([]);
    expect(tintasForaDaPaleta(arte, recolorir(mestre(), '#E67E22') as Grupo)).toEqual(['#e67e22']);
  });

  it('a paleta da Ipê tem texto que se lê sobre o fundo dela', () => {
    expect(PALETA_DA_IPE.fundo).toBeTruthy();
    expect(PALETA_DA_IPE.texto).toBeTruthy();
  });
});

describe('proporção, proteção e tamanho mínimo', () => {
  it('escalar por igual não distorce; esticar o símbolo distorce', () => {
    const menor = escalarPorIgual(mestre(), 0.4) as Grupo;
    expect(proporcaoDoSimbolo(menor)).toBeCloseTo(proporcaoDoSimbolo(mestre()), 5);
    const copa = mestre().filhos[0];
    const esticada = { ...mestre(), filhos: [redimensionar(copa, copa.largura * 1.5, undefined), ...mestre().filhos.slice(1)] } as Grupo;
    expect(defeitosDe(arteDasAplicacoes(), com(branca(), esticada), esticada, { nome: NOME_DA_MARCA, mestre: mestre(), protecao: 0.5 }))
      .toContain('distorcida');
  });

  it('a letra escala junto com o grupo', () => {
    const menor = escalarPorIgual(mestre(), 0.5) as Grupo;
    const letra = menor.filhos.find(f => f.tipo === 'texto');
    expect(letra && letra.tipo === 'texto' && letra.corpo).toBe(28);
  });

  it('o tamanho mínimo medido sai da letra, que some antes do tronco', () => {
    // 7 px de letra num logotipo de 56 numa assinatura de 300 de largura.
    expect(mestre().largura).toBe(300);
    expect(larguraMinimaMedida(mestre(), NOME_DA_MARCA)).toBe(38);
    expect(larguraMinimaMedida(escalarPorIgual(mestre(), 0.5) as Grupo, NOME_DA_MARCA)).toBe(38);
  });

  it('o mínimo declarado não pode ficar abaixo do medido, nem passar do dobro', () => {
    expect(minimoHonesto(38, 38)).toBe(true);
    expect(minimoHonesto(30, 38)).toBe(false);
    expect(minimoHonesto(80, 38)).toBe(false);
  });

  it('o fundo que cobre a área inteira não invade; o vizinho encostado invade', () => {
    // 35% cabe no crachá com folga: 105 de largura, e a área até a foto.
    const g = moverPara(escalarPorIgual(mestre(), 0.35) as Grupo, 67, 26);
    expect(invasoes(com(pranchaDoCracha(), g), g, 0.5)).toEqual([]);
    const baixo = moverPara(g, 67, 60);
    expect(invasoes(com(pranchaDoCracha(), baixo), baixo, 0.5)).toContain('cracha-foto');
  });

  it('encostar na borda da peça também invade', () => {
    const g = moverPara(escalarPorIgual(mestre(), 0.35) as Grupo, 2, 26);
    expect(invasoes(com(pranchaDoCracha(), g), g, 0.5)).toContain('borda');
  });
});

describe('os usos incorretos se distinguem pelo que fazem', () => {
  const regras = { nome: NOME_DA_MARCA, mestre: mestre(), protecao: 0.5 };
  const arte = arteDasAplicacoes();

  it('a assinatura intacta, no papel branco e com folga, não tem defeito', () => {
    expect(defeitosDe(arte, com(branca(), mestre()), mestre(), regras)).toEqual([]);
  });

  it('cada estrago acusa o seu, e só o seu', () => {
    // Um vermelho escuro, que se lê no branco: o defeito é só a cor ser de fora.
    const vermelho = recolorir(mestre(), '#B03A2E') as Grupo;
    expect(defeitosDe(arte, com(branca(), vermelho), vermelho, regras)).toEqual(['cor-fora']);

    const outraLetra = { ...mestre(), filhos: mestre().filhos.map(f => (f.tipo === 'texto' ? { ...f, familia: 'Comic Sans MS' as const } : f)) } as Grupo;
    expect(defeitosDe(arte, com(branca(), outraLetra), outraLetra, regras)).toEqual(['fonte-trocada']);

    const escura: Prancha = { ...branca(), fundo: '#2B2B2B' };
    expect(defeitosDe(arte, com(escura, mestre()), mestre(), regras)).toEqual(['sem-contraste']);

    const vizinho: Objeto = { id: 'v', nome: 'Vizinho', tipo: 'retangulo', x: 405, y: 140, largura: 40, altura: 40, preenchimento: '#1F2A24' };
    expect(defeitosDe(arte, com(branca([vizinho]), mestre()), mestre(), regras)).toEqual(['sem-protecao']);
  });
});
