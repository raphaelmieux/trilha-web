import { describe, expect, it } from 'vitest';
import {
  alinhar, alinhamentoFunciona, alturaDoTexto, cmykDe, colarEstilo, comoDeuteranope,
  contrasteDoTexto, contrasteFunciona, copiarEstilo, distanciaDeMatiz, distribuir,
  duplicarPrancha, ehDeLeitura, ehTextoGrande, foraDaGama, fundosDoTexto, hexDeHsl,
  hierarquiaFunciona, hslDe, linhasDoTexto, margemMinima, maiorVaoInterno, mesmaForma,
  mesmaPeca, mesmoEstilo, mesmoTexto, niveisDe, nivelDoCorpo, provaDeImpressao,
  proximidadeFunciona, quemEstragaAHierarquia, sangra, textosSobrepostos, textosSoltos,
  umObjeto, umaPrancha, combinar, agrupar, desagrupar, mudarObjetos, moverObjeto, excluir, textos,
  emCaminho, redimensionar, alturaDe,
  type Arte, type Forma, type Foto, type Prancha, type Texto,
} from './design';
import { hexToRgb } from '../lib/imageTools';

const tx = (id: string, y: number, extra: Partial<Texto> = {}): Texto => ({
  id, nome: id, tipo: 'texto', texto: 'Texto de exemplo', familia: 'Arial', peso: 400,
  corpo: 16, entrelinha: 1.4, cor: '#222222', alinhamento: 'esquerda',
  x: 40, y, largura: 400, ...extra,
});

const ret = (id: string, extra: Partial<Forma> = {}): Forma => ({
  id, nome: id, tipo: 'retangulo', x: 0, y: 0, largura: 100, altura: 100, preenchimento: '#FFFFFF', ...extra,
});

const prancha = (objetos: Prancha['objetos'], extra: Partial<Prancha> = {}): Prancha => ({
  id: 'p', nome: 'Peça', largura: 480, altura: 680, fundo: '#FFFFFF', objetos, ...extra,
});

describe('o texto quebra pelo modelo', () => {
  it('a mesma frase ocupa mais linhas numa família mais larga', () => {
    const frase = 'Três dias de trilha, fogueira e especialidades no acampamento de inverno do clube.';
    const times = tx('a', 0, { texto: frase, familia: 'Times New Roman', largura: 200 });
    const verdana = tx('b', 0, { texto: frase, familia: 'Verdana', largura: 200 });
    expect(linhasDoTexto(verdana).length).toBeGreaterThan(linhasDoTexto(times).length);
    expect(alturaDoTexto(verdana)).toBeGreaterThan(alturaDoTexto(times));
  });

  it('a altura acompanha a entrelinha', () => {
    const a = tx('a', 0, { entrelinha: 1 });
    const b = tx('b', 0, { entrelinha: 1.5 });
    expect(alturaDoTexto(b)).toBe(Math.round(alturaDoTexto(a) * 1.5));
  });

  it('respeita a quebra escrita, e palavra maior que a linha não some', () => {
    expect(linhasDoTexto(tx('a', 0, { texto: 'um\ndois' }))).toEqual(['um', 'dois']);
    expect(linhasDoTexto(tx('a', 0, { texto: 'otorrinolaringologista', largura: 20 })))
      .toEqual(['otorrinolaringologista']);
  });
});

describe('contraste', () => {
  it('lê a cor que está atrás do centro do texto, e não a da prancha', () => {
    const faixa = ret('faixa', { x: 0, y: 0, largura: 480, altura: 120, preenchimento: '#1B4D3E' });
    const t = tx('t', 40, { cor: '#FFFFFF' });
    const p = prancha([faixa, t]);
    expect(fundosDoTexto(p, t)).toEqual(['#1B4D3E']);
    expect(contrasteFunciona(p)).toBe(true);
  });

  it('a forma que está **acima** do texto não conta como fundo dele', () => {
    const t = tx('t', 40, { cor: '#FFFFFF' });
    const faixa = ret('faixa', { x: 0, y: 0, largura: 480, altura: 120, preenchimento: '#1B4D3E' });
    expect(fundosDoTexto(prancha([t, faixa]), t)).toEqual(['#FFFFFF']);
  });

  it('sobre foto vale o pior dos tons', () => {
    const foto: Foto = {
      id: 'f', nome: 'f', tipo: 'foto', motivo: 'fogueira', x: 0, y: 0, largura: 480, altura: 300,
      tons: ['#1A1A1A', '#F0E0C0'],
    };
    const t = tx('t', 100, { cor: '#FFFFFF' });
    const p = prancha([foto, t]);
    expect(contrasteDoTexto(p, t)).toBeLessThan(1.4);
  });

  it('texto grande pede menos: 24 pixels, ou 18,66 em negrito', () => {
    expect(ehTextoGrande(tx('a', 0, { corpo: 24 }))).toBe(true);
    expect(ehTextoGrande(tx('a', 0, { corpo: 19, peso: 700 }))).toBe(true);
    expect(ehTextoGrande(tx('a', 0, { corpo: 19 }))).toBe(false);
    /* 3,5:1 passa no grande e reprova no normal. */
    const cinza = '#888888';
    const grande = tx('g', 0, { corpo: 28, cor: cinza });
    const normal = tx('n', 100, { corpo: 16, cor: cinza });
    expect(contrasteFunciona(prancha([grande]))).toBe(true);
    expect(contrasteFunciona(prancha([normal]))).toBe(false);
  });
});

describe('hierarquia', () => {
  const base = () => prancha([
    tx('titulo', 40, { corpo: 40, peso: 700 }),
    tx('data', 120, { corpo: 22 }),
    tx('c1', 180), tx('c2', 220), tx('c3', 260),
  ]);

  it('funciona com o título sozinho no topo e bem maior que o corpo', () => {
    expect(nivelDoCorpo(base())).toBe(16);
    expect(niveisDe(base())).toHaveLength(3);
    expect(hierarquiaFunciona(base(), 'titulo')).toBe(true);
  });

  it('dois títulos são nenhum', () => {
    const p = { ...base(), objetos: base().objetos.map(o => (o.id === 'data' ? { ...o, corpo: 40, peso: 700 as const } : o)) };
    expect(hierarquiaFunciona(p, 'titulo')).toBe(false);
    expect(quemEstragaAHierarquia(p, 'titulo')).toEqual(['titulo', 'data']);
  });

  it('título pouco maior que o corpo não é título', () => {
    const p = { ...base(), objetos: base().objetos.map(o => (o.id === 'titulo' ? { ...o, corpo: 24 } : o)) };
    expect(hierarquiaFunciona(p, 'titulo')).toBe(false);
  });

  it('seis tamanhos não são seis degraus', () => {
    const p = prancha([
      tx('titulo', 0, { corpo: 48 }), tx('a', 60, { corpo: 30 }), tx('b', 110, { corpo: 24 }),
      tx('c', 150, { corpo: 20 }), tx('d', 190, { corpo: 13 }), tx('e', 220, { corpo: 13 }),
      tx('f', 250, { corpo: 13 }),
    ]);
    expect(niveisDe(p).length).toBeGreaterThan(4);
    expect(hierarquiaFunciona(p, 'titulo')).toBe(false);
  });

  it('negrito sobe um degrau sem virar título', () => {
    const p = prancha([tx('a', 0, { peso: 700 }), tx('b', 40)]);
    expect(niveisDe(p)).toHaveLength(2);
  });
});

describe('alinhamento', () => {
  it('um bloco a 47 quando os outros estão a 40 está solto', () => {
    const p = prancha([tx('a', 0), tx('b', 40), tx('c', 80, { x: 47 })]);
    expect(textosSoltos(p).map(t => t.id)).toEqual(['c']);
    expect(alinhamentoFunciona(p)).toBe(false);
  });

  it('centrado vale pelo centro, e o centro da prancha conta', () => {
    const t = tx('a', 0, { alinhamento: 'centro', x: 40, largura: 400 });
    expect(alinhamentoFunciona(prancha([t]))).toBe(true);
    expect(alinhamentoFunciona(prancha([{ ...t, x: 52 }]))).toBe(false);
  });

  it('prancha sem texto nenhum não tem alinhamento a elogiar', () => {
    expect(alinhamentoFunciona(prancha([ret('r')]))).toBe(false);
  });

  it('alinhar à esquerda põe todos na borda do mais à esquerda', () => {
    const p = prancha([tx('a', 0, { x: 52 }), tx('b', 40, { x: 40 }), tx('c', 80, { x: 61 })]);
    const q = alinhar(p, ['a', 'b', 'c'], 'esquerda');
    expect(q.objetos.map(o => o.x)).toEqual([40, 40, 40]);
  });

  it('um objeto só se alinha à prancha', () => {
    const p = prancha([tx('a', 0, { x: 10, largura: 200 })]);
    expect(alinhar(p, ['a'], 'centro-h').objetos[0].x).toBe(140);
  });
});

describe('proximidade', () => {
  it('vão entre grupos ao menos o dobro do vão de dentro', () => {
    const p = prancha([
      tx('a1', 100), tx('a2', 130), tx('b1', 200), tx('b2', 230),
    ]);
    /* Cada bloco tem 22 de altura: dentro, vão de 8; entre, vão de 48. */
    expect(maiorVaoInterno(p, ['a1', 'a2'])).toBe(8);
    expect(proximidadeFunciona(p, [['a1', 'a2'], ['b1', 'b2']])).toBe(true);
  });

  it('espaçamento igual em toda a página não agrupa nada', () => {
    const p = prancha([tx('a1', 100), tx('a2', 140), tx('b1', 180), tx('b2', 220)]);
    expect(proximidadeFunciona(p, [['a1', 'a2'], ['b1', 'b2']])).toBe(false);
  });

  it('distribuir iguala o vão, e não a distância entre os topos', () => {
    const p = prancha([tx('a', 0), tx('b', 30, { texto: 'um\ndois\ntrês' }), tx('c', 200)]);
    const q = distribuir(p, ['a', 'b', 'c'], 'vertical');
    const [a, b, c] = ['a', 'b', 'c'].map(id => umObjeto(q, id)! as Texto);
    const vao1 = b.y - (a.y + alturaDoTexto(a));
    const vao2 = c.y - (b.y + alturaDoTexto(b));
    expect(Math.abs(vao1 - vao2)).toBeLessThanOrEqual(1);
  });
});

describe('espaço negativo', () => {
  it('a faixa que vai de borda a borda sangra, e não conta na margem', () => {
    const faixa = ret('faixa', { x: 0, y: 0, largura: 480, altura: 100 });
    const p = prancha([faixa, tx('t', 40)]);
    expect(sangra(p, faixa)).toBe(true);
    expect(margemMinima(p)).toBe(40);
  });

  it('texto nunca sangra', () => {
    const t = tx('t', 0, { x: 0, largura: 480 });
    const p = prancha([t]);
    expect(sangra(p, t)).toBe(false);
    expect(margemMinima(p)).toBe(0);
  });

  it('acha dois textos um em cima do outro', () => {
    expect(textosSobrepostos(prancha([tx('a', 0), tx('b', 10)]))).toEqual([['a', 'b']]);
  });
});

describe('repetição', () => {
  it('mesmo estilo é família, peso, corpo, cor e entrelinha juntos', () => {
    const p = prancha([tx('a', 0), tx('b', 40), tx('c', 80, { cor: '#222223' })]);
    expect(mesmoEstilo(p, ['a', 'b'])).toBe(true);
    expect(mesmoEstilo(p, ['a', 'b', 'c'])).toBe(false);
  });

  it('um objeto só não é repetição', () => {
    expect(mesmoEstilo(prancha([tx('a', 0)]), ['a'])).toBe(false);
    expect(mesmaForma(prancha([ret('a')]), ['a'])).toBe(false);
  });

  it('colar estilo de texto em texto, e não em forma', () => {
    const p = prancha([tx('a', 0, { familia: 'Georgia', corpo: 20 }), tx('b', 40), ret('r')]);
    const e = copiarEstilo(umObjeto(p, 'a')!);
    const q = colarEstilo(p, ['b', 'r'], e);
    expect(mesmoEstilo(q, ['a', 'b'])).toBe(true);
    expect(umObjeto(q, 'r')).toEqual(umObjeto(p, 'r'));
  });
});

describe('cor', () => {
  it('HSL vai e volta', () => {
    for (const hex of ['#1B4D3E', '#C13516', '#F2C14E', '#808080', '#FFFFFF', '#000000']) {
      expect(hexDeHsl(hslDe(hex))).toBe(hex);
    }
  });

  it('matiz é um círculo', () => {
    expect(distanciaDeMatiz(350, 10)).toBe(20);
  });

  it('o preto puro é só a tinta preta', () => {
    expect(cmykDe('#000000')).toEqual([0, 0, 0, 100]);
    expect(cmykDe('#FF0000')).toEqual([0, 100, 100, 0]);
  });

  it('o verde-limão não sai no papel, e o vinho sai', () => {
    expect(foraDaGama('#39FF14')).toBe(true);
    expect(foraDaGama('#1E90FF')).toBe(true);
    expect(foraDaGama('#7A1F2B')).toBe(false);
    expect(foraDaGama('#808080')).toBe(false);
    expect(provaDeImpressao('#7A1F2B')).toBe('#7A1F2B');
    const prova = provaDeImpressao('#39FF14');
    expect(hslDe(prova).s).toBeLessThan(hslDe('#39FF14').s);
    expect(foraDaGama(prova)).toBe(false);
  });

  it('na deuteranopia o verde e o vermelho de mesma luminosidade viram a mesma cor', () => {
    const distancia = (a: string, b: string) => {
      const [x, y] = [hexToRgb(a)!, hexToRgb(b)!];
      return Math.max(Math.abs(x.r - y.r), Math.abs(x.g - y.g), Math.abs(x.b - y.b));
    };
    expect(distancia('#3F8F3F', '#C0503A')).toBeGreaterThan(100);
    expect(distancia(comoDeuteranope('#3F8F3F'), comoDeuteranope('#C0503A'))).toBeLessThan(20);
    /* E o que não tem vermelho nem verde para confundir fica como está. */
    expect(comoDeuteranope('#FFFFFF')).toBe('#FFFFFF');
    expect(comoDeuteranope('#000000')).toBe('#000000');
  });

  it('serifada e sem serifa leem; monoespaçada e decorativa não', () => {
    expect(ehDeLeitura('Georgia')).toBe(true);
    expect(ehDeLeitura('Verdana')).toBe(true);
    expect(ehDeLeitura('Courier New')).toBe(false);
    expect(ehDeLeitura('Brush Script MT')).toBe(false);
  });
});

describe('duplicar a prancha', () => {
  const arte: Arte = {
    pranchas: [prancha([tx('t', 0)])],
    paleta: { fundo: null, texto: null, destaque: null, apoio: null, neutro: null },
  };

  it('a cópia tem ids próprios, e mexer nela não mexe na original', () => {
    const a = duplicarPrancha(arte, 'p');
    expect(a.pranchas).toHaveLength(2);
    const copia = a.pranchas[1];
    expect(copia.objetos[0].id).not.toBe('t');
    expect(mesmaPeca(copia, umaPrancha(a, 'p')!)).toBe(true);
    expect(mesmoTexto(copia, umaPrancha(a, 'p')!)).toBe(true);
  });

  it('duas cópias não colidem', () => {
    const a = duplicarPrancha(duplicarPrancha(arte, 'p'), 'p');
    expect(new Set(a.pranchas.map(p => p.id)).size).toBe(3);
  });
});

describe('caminhos, grupos e booleanas', () => {
  const quadrado = (id: string, x: number): Forma => ret(id, { x, y: 0, largura: 100, altura: 100, preenchimento: '#C13516' });

  it('combinar une na ordem da pilha, e o resultado herda o de baixo', () => {
    const p = prancha([quadrado('a', 0), { ...quadrado('b', 50), preenchimento: '#000000' }]);
    const q = combinar(p, ['a', 'b'], 'uniao');
    expect(q.objetos).toHaveLength(1);
    const r = q.objetos[0];
    expect(r.tipo).toBe('caminho');
    expect(r.id).toBe('a');
    expect(r.tipo === 'caminho' && r.preenchimento).toBe('#C13516');
    expect(r.largura).toBe(150);
  });

  it('subtrair tira de cima o que está embaixo, e não o contrário', () => {
    const p = prancha([quadrado('a', 0), quadrado('b', 50)]);
    const r = combinar(p, ['a', 'b'], 'subtracao').objetos[0];
    expect(r.x).toBe(0);
    expect(r.largura).toBe(50);
  });

  it('a seleção na ordem do clique não muda quem é a base', () => {
    const p = prancha([quadrado('a', 0), quadrado('b', 50)]);
    expect(combinar(p, ['b', 'a'], 'subtracao').objetos[0].x).toBe(0);
  });

  it('texto não entra em booleana', () => {
    const p = prancha([quadrado('a', 0), tx('t', 0)]);
    expect(combinar(p, ['a', 't'], 'uniao')).toBe(p);
  });

  it('agrupar põe o grupo onde estava o de cima, e desagrupar devolve na ordem', () => {
    const p = prancha([quadrado('a', 0), tx('t', 300), quadrado('b', 200)]);
    const g = agrupar(p, ['a', 'b'], 'g', 'Os dois');
    expect(g.objetos.map(o => o.id)).toEqual(['t', 'g']);
    const grupo = g.objetos[1];
    expect(grupo.tipo === 'grupo' && grupo.filhos.map(f => f.id)).toEqual(['a', 'b']);
    expect(grupo.largura).toBe(300);
    expect(desagrupar(g, 'g').objetos.map(o => o.id)).toEqual(['t', 'a', 'b']);
  });

  it('mover o grupo leva os filhos, e mexer num filho refaz a caixa do grupo', () => {
    const g = agrupar(prancha([quadrado('a', 0), quadrado('b', 200)]), ['a', 'b'], 'g');
    const movido = mudarObjetos(g, ['g'], o => moverObjeto(o, 10, 5));
    expect(umObjeto(movido, 'a')!.x).toBe(10);
    const filhoMovido = mudarObjetos(g, ['b'], o => moverObjeto(o, 100, 0));
    expect(umObjeto(filhoMovido, 'g')!.largura).toBe(400);
  });

  it('excluir o último filho leva o grupo junto', () => {
    const g = agrupar(prancha([quadrado('a', 0), quadrado('b', 200)]), ['a', 'b'], 'g');
    expect(excluir(g, ['a', 'b']).objetos).toEqual([]);
  });

  it('os textos de dentro do grupo continuam sendo textos da peça', () => {
    const g = agrupar(prancha([tx('t1', 0), tx('t2', 40)]), ['t1', 't2'], 'g');
    expect(textos(g).map(t => t.id)).toEqual(['t1', 't2']);
  });

  it('redimensionar um caminho escala os nós, a partir do canto', () => {
    const c = emCaminho(quadrado('a', 20))!;
    const r = redimensionar(c, 50, undefined);
    expect(r.x).toBe(20);
    expect(r.largura).toBe(50);
    expect(alturaDe(r)).toBe(100);
  });

  it('duplicar a prancha renomeia os filhos de grupo também', () => {
    const g = agrupar(prancha([quadrado('a', 0), quadrado('b', 200)]), ['a', 'b'], 'g');
    const arte: Arte = { pranchas: [g], paleta: { fundo: null, texto: null, destaque: null, apoio: null, neutro: null } };
    const d = duplicarPrancha(arte, 'p');
    const copia = d.pranchas[1];
    expect(umObjeto(copia, 'a')).toBeUndefined();
    expect(mesmaPeca(copia, g)).toBe(true);
  });
});
