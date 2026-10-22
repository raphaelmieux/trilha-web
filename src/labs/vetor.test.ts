import { describe, expect, it } from 'vitest';
import {
  K_DO_CIRCULO, achatar, areaPintada, booleana, caixaDosContornos, contornoDaElipse,
  contornoDoRetangulo, contornosDoD, dDoContorno, dDosContornos, escalar, moverAlca,
  moverNo, pontoNaBezier, semPontosNaReta, transladar, trocarTipo,
  type Contorno,
} from './vetor';

const perto = (a: number, b: number, tol = 0.5) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

describe('a curva', () => {
  it('passa pelas pontas e não pelas alças', () => {
    const [p0, c1, c2, p3] = [{ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 }];
    expect(pontoNaBezier(p0, c1, c2, p3, 0)).toEqual(p0);
    expect(pontoNaBezier(p0, c1, c2, p3, 1)).toEqual(p3);
    /* No meio ela chega a três quartos da altura das alças, e não a elas. */
    expect(pontoNaBezier(p0, c1, c2, p3, 0.5)).toEqual({ x: 50, y: 75 });
  });

  it('quatro curvas com a constante desenham um círculo de área certa', () => {
    expect(K_DO_CIRCULO).toBeCloseTo(0.5523, 4);
    const area = areaPintada([contornoDaElipse(0, 0, 200, 200)]);
    perto(area / (Math.PI * 100 * 100), 1, 0.005);
  });

  it('o retângulo sai com a área dele', () => {
    perto(areaPintada([contornoDoRetangulo(10, 10, 100, 50)]), 5000, 0.01);
  });

  it('a caixa do círculo é a do quadrado em volta', () => {
    const c = caixaDosContornos([contornoDaElipse(20, 30, 100, 60)]);
    perto(c.x, 20); perto(c.y, 30); perto(c.largura, 100); perto(c.altura, 60);
  });

  it('contorno aberto não pinta área', () => {
    const aberto: Contorno = { ...contornoDoRetangulo(0, 0, 10, 10), fechado: false };
    expect(areaPintada([aberto])).toBe(0);
  });

  it('o furo de dentro desconta da área', () => {
    const fora = contornoDoRetangulo(0, 0, 100, 100);
    const furo = contornoDoRetangulo(25, 25, 50, 50);
    perto(areaPintada([fora, furo]), 7500, 0.5);
  });
});

describe('as booleanas', () => {
  const quadrado = [contornoDoRetangulo(0, 0, 100, 100)];
  const vizinho = [contornoDoRetangulo(50, 0, 100, 100)];

  it('união soma sem contar duas vezes o que se sobrepõe', () => {
    perto(areaPintada(booleana(quadrado, vizinho, 'uniao')), 15000, 1);
  });

  it('subtração tira o segundo do primeiro, e a ordem importa', () => {
    const r = booleana(quadrado, vizinho, 'subtracao');
    perto(areaPintada(r), 5000, 1);
    const c = caixaDosContornos(r);
    perto(c.x, 0); perto(c.largura, 50);
    const inverso = caixaDosContornos(booleana(vizinho, quadrado, 'subtracao'));
    perto(inverso.x, 100);
  });

  it('interseção fica só com o que é dos dois', () => {
    perto(areaPintada(booleana(quadrado, vizinho, 'intersecao')), 5000, 1);
  });

  it('o resultado de retas não traz nós no meio da reta', () => {
    const r = booleana(quadrado, vizinho, 'subtracao');
    expect(r).toHaveLength(1);
    expect(r[0].nos).toHaveLength(4);
  });

  it('a lua: um círculo menos outro deslocado', () => {
    const lua = booleana([contornoDaElipse(0, 0, 100, 100)], [contornoDaElipse(30, -10, 100, 100)], 'subtracao');
    const area = areaPintada(lua);
    expect(area).toBeGreaterThan(1000);
    expect(area).toBeLessThan(Math.PI * 50 * 50);
  });

  it('tirar um quadrado do meio deixa um furo', () => {
    const moldura = booleana(quadrado, [contornoDoRetangulo(25, 25, 50, 50)], 'subtracao');
    expect(moldura).toHaveLength(2);
    perto(areaPintada(moldura), 7500, 1);
  });

  it('semPontosNaReta não achata curva de verdade', () => {
    const circulo = achatar(contornoDaElipse(0, 0, 100, 100));
    expect(semPontosNaReta(circulo).length).toBe(circulo.length);
  });
});

describe('os nós', () => {
  it('mover o nó leva as alças junto', () => {
    const c = contornoDaElipse(0, 0, 100, 100);
    const m = moverNo(c, 0, c.nos[0].x + 10, c.nos[0].y + 5);
    expect(m.nos[0].saida!.x - c.nos[0].saida!.x).toBe(10);
    expect(m.nos[0].entrada!.y - c.nos[0].entrada!.y).toBe(5);
  });

  it('no nó suave a alça oposta gira junto e guarda o comprimento', () => {
    const c = contornoDaElipse(0, 0, 100, 100);
    const n = c.nos[0];
    const antes = Math.hypot(n.entrada!.x - n.x, n.entrada!.y - n.y);
    const m = moverAlca(c, 0, 'saida', n.x + 10, n.y + 20);
    const novo = m.nos[0];
    const depois = Math.hypot(novo.entrada!.x - novo.x, novo.entrada!.y - novo.y);
    perto(antes, depois, 1e-6);
    /* As duas alças continuam na mesma reta, dos lados opostos do nó. */
    const cruz = (novo.saida!.x - novo.x) * (novo.entrada!.y - novo.y) - (novo.saida!.y - novo.y) * (novo.entrada!.x - novo.x);
    perto(cruz, 0, 1e-6);
  });

  it('no nó de canto cada alça é solta', () => {
    const c = trocarTipo(trocarTipo(contornoDaElipse(0, 0, 100, 100), 0, 'canto'), 0, 'suave');
    const comCanto = { ...c, nos: c.nos.map((n, i) => (i === 0 ? { ...n, tipo: 'canto' as const } : n)) };
    const antes = comCanto.nos[0].entrada;
    const m = moverAlca(comCanto, 0, 'saida', 0, 0);
    expect(m.nos[0].entrada).toEqual(antes);
  });

  it('canto vira suave com alças, e suave vira canto sem elas', () => {
    const r = contornoDoRetangulo(0, 0, 100, 100);
    const s = trocarTipo(r, 1, 'suave');
    expect(s.nos[1].entrada).not.toBeNull();
    expect(s.nos[1].saida).not.toBeNull();
    expect(trocarTipo(s, 1, 'canto').nos[1]).toEqual({ ...r.nos[1] });
  });

  it('transladar e escalar mexem nas alças também', () => {
    const c = [contornoDaElipse(0, 0, 100, 100)];
    const t = transladar(c, 10, 20)[0];
    expect(t.nos[0].saida!.x - c[0].nos[0].saida!.x).toBe(10);
    const e = escalar(c, { x: 0, y: 0 }, 2, 2);
    perto(caixaDosContornos(e).largura, 200);
  });
});

describe('o SVG', () => {
  it('escreve absoluto, com M, L, C e Z', () => {
    expect(dDoContorno(contornoDoRetangulo(10, 20, 30, 40))).toBe('M 10 20 L 40 20 L 40 60 L 10 60 Z');
    expect(dDoContorno(contornoDaElipse(0, 0, 100, 100))).toMatch(/^M 50 0 C .* Z$/);
  });

  it('vai e volta sem perder nada', () => {
    for (const c of [contornoDoRetangulo(10, 20, 30, 40), contornoDaElipse(5, 5, 90, 60)]) {
      const lido = contornosDoD(dDoContorno(c))!;
      expect(dDosContornos(lido)).toBe(dDoContorno(c));
    }
  });

  it('entende relativo, H e V, que alguém pode escrever à mão', () => {
    const lido = contornosDoD('m 10 10 h 20 v 20 H 10 z')!;
    expect(dDosContornos(lido)).toBe('M 10 10 L 30 10 L 30 30 L 10 30 Z');
  });

  it('recusa o que não entende, em vez de abrir vazio', () => {
    expect(contornosDoD('A 10 10 0 0 1 20 20')).toBeNull();
    expect(contornosDoD('10 10')).toBeNull();
    expect(contornosDoD('M 10 abc')).toBeNull();
  });

  it('mudar um número do arquivo move só aquele nó', () => {
    const d = dDoContorno(contornoDoRetangulo(10, 20, 30, 40)).replace('L 40 60', 'L 80 60');
    const lido = contornosDoD(d)!;
    expect(lido[0].nos.map(n => n.x)).toEqual([10, 40, 80, 10]);
  });
});
