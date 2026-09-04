import { describe, it, expect } from 'vitest';
import { Palco, QUADROS_POR_SEGUNDO } from './blocosRuntime';
import type { Bloco, Ator, Projeto } from './blocos';

/*
  O motor roda sem tela.

  Nada aqui depende de DOM, de relógio nem de aleatório: o palco é função do
  estado e do número do quadro. É por isso que dá para afirmar "depois de trinta
  quadros o gato está em x=300" — e é o que permitirá, no laboratório, dizer a
  quem travou exatamente o que o programa dele fez.
*/

let n = 0;
const b = <T extends Bloco['tipo']>(tipo: T, resto: object = {}): Bloco =>
  ({ id: `t${(n += 1)}`, tipo, ...resto } as Bloco);

const ator = (id: string, blocos: Bloco[][], x = 0, y = 0): Ator => ({
  id, nome: id, fantasias: ['🐱', '🐈'], x, y,
  pilhas: blocos.map((bs, i) => ({ id: `${id}-p${i}`, blocos: bs })),
});

const projeto = (atores: Ator[], variaveis: Projeto['variaveis'] = []): Projeto =>
  ({ atores, variaveis });

describe('a bandeira verde', () => {
  it('só roda as pilhas que começam com o chapéu dela', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoBandeira'), b('mover', { passos: 10 })],
      [b('quandoTecla', { tecla: 'direita' }), b('mover', { passos: 100 })],
    ])]));
    p.bandeira();
    p.rodar(3);
    expect(p.estado.atores[0].x).toBe(10);
  });

  it('reinicia o palco: posição e variáveis voltam ao começo', () => {
    const p = new Palco(projeto(
      [ator('gato', [[b('quandoBandeira'), b('mover', { passos: 50 })]])],
      [{ nome: 'placar', valor: 0 }],
    ));
    p.bandeira();
    p.rodar(3);
    p.estado.variaveis.placar = 99;
    expect(p.estado.atores[0].x).toBe(50);

    p.bandeira();
    expect(p.estado.atores[0].x).toBe(0);
    expect(p.estado.variaveis.placar).toBe(0);
  });
});

describe('a tecla', () => {
  it('dispara a pilha enquanto está pressionada', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoTecla', { tecla: 'direita' }), b('mover', { passos: 10 })],
    ])]));
    p.bandeira();
    p.rodar(1, { teclas: new Set(['direita']) });
    expect(p.estado.atores[0].x).toBe(10);
  });

  it('não dispara a pilha de outra tecla', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoTecla', { tecla: 'direita' }), b('mover', { passos: 10 })],
    ])]));
    p.bandeira();
    p.rodar(5, { teclas: new Set(['esquerda']) });
    expect(p.estado.atores[0].x).toBe(0);
  });
});

describe('a repetição', () => {
  it('anda uma vez por quadro, e não tudo de uma vez', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoBandeira'), b('repita', { vezes: 5, corpo: [b('mover', { passos: 10 })] })],
    ])]));
    p.bandeira();
    p.rodar(1);
    /* Um quadro, um passo: o `mova` da primeira volta. Se andasse 50 de uma
       vez, o desbravador não veria o ator se mexer — veria ele aparecer
       do outro lado, e a repetição deixaria de ensinar o que ensina. */
    expect(p.estado.atores[0].x).toBe(10);
    p.rodar(20);
    expect(p.estado.atores[0].x).toBe(50);
  });

  it('repita 0 vezes não executa o corpo', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoBandeira'), b('repita', { vezes: 0, corpo: [b('mover', { passos: 10 })] })],
    ])]));
    p.bandeira();
    p.rodar(10);
    expect(p.estado.atores[0].x).toBe(0);
  });
});

describe('o sempre', () => {
  /*
    O corpo vazio é o caso que trava a aba, e por isso ele é testado.
    Se o `yield` do fim da volta sumir, este teste não falha: ele nunca termina.
  */
  it('com o corpo vazio não trava o quadro', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoBandeira'), b('sempre', { corpo: [] })],
    ])]));
    p.bandeira();
    p.rodar(50);
    expect(p.estado.quadro).toBe(50);
  });

  it('continua rodando quadro após quadro', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoBandeira'), b('sempre', { corpo: [b('mover', { passos: 1 })] })],
    ])]));
    p.bandeira();
    p.rodar(10);
    expect(p.estado.atores[0].x).toBeGreaterThan(0);
    expect(p.estado.rodando).toBe(true);
  });
});

describe('a condição', () => {
  it('vê um ator tocando o outro', () => {
    const p = new Palco(projeto(
      [
        ator('gato', [[
          b('quandoBandeira'),
          b('sempre', { corpo: [
            b('se', { condicao: { tipo: 'tocando', quem: 'maca' }, corpo: [b('mudeVariavel', { nome: 'placar', por: 1 })] }),
          ]}),
        ]], 0, 0),
        ator('maca', [], 10, 0),
      ],
      [{ nome: 'placar', valor: 0 }],
    ));
    p.bandeira();
    p.rodar(6);
    expect(p.estado.variaveis.placar).toBeGreaterThan(0);
  });

  it('não conta quando estão longe', () => {
    const p = new Palco(projeto(
      [
        ator('gato', [[
          b('quandoBandeira'),
          b('sempre', { corpo: [
            b('se', { condicao: { tipo: 'tocando', quem: 'maca' }, corpo: [b('mudeVariavel', { nome: 'placar', por: 1 })] }),
          ]}),
        ]], -200, 0),
        ator('maca', [], 200, 0),
      ],
      [{ nome: 'placar', valor: 0 }],
    ));
    p.bandeira();
    p.rodar(10);
    expect(p.estado.variaveis.placar).toBe(0);
  });

  it('compara uma variável com um número', () => {
    const p = new Palco(projeto(
      [ator('gato', [[
        b('quandoBandeira'),
        b('se', { condicao: { tipo: 'variavelMaiorQue', nome: 'placar', valor: 2 }, corpo: [b('diga', { texto: 'ganhei' })] }),
      ]])],
      [{ nome: 'placar', valor: 5 }],
    ));
    p.bandeira();
    p.rodar(5);
    expect(p.estado.atores[0].fala).toBe('ganhei');
  });
});

describe('as variáveis', () => {
  it('mude soma, defina troca', () => {
    const p = new Palco(projeto(
      [ator('gato', [[
        b('quandoBandeira'),
        b('mudeVariavel', { nome: 'placar', por: 3 }),
        b('mudeVariavel', { nome: 'placar', por: 4 }),
        b('definaVariavel', { nome: 'placar', valor: 1 }),
      ]])],
      [{ nome: 'placar', valor: 0 }],
    ));
    p.bandeira();
    p.rodar(1); expect(p.estado.variaveis.placar).toBe(3);
    p.rodar(1); expect(p.estado.variaveis.placar).toBe(7);
    p.rodar(1); expect(p.estado.variaveis.placar).toBe(1);
  });
});

describe('o palco tem beirada', () => {
  it('o ator não sai da tela', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoBandeira'), b('sempre', { corpo: [b('mover', { passos: 50 })] })],
    ])]));
    p.bandeira();
    p.rodar(60);
    expect(p.estado.atores[0].x).toBe(240);
  });

  it('tocando na borda é verdade quando encosta nela', () => {
    const p = new Palco(projeto(
      [ator('gato', [[
        b('quandoBandeira'),
        b('sempre', { corpo: [
          b('mover', { passos: 30 }),
          b('se', { condicao: { tipo: 'tocando', quem: 'borda' }, corpo: [b('diga', { texto: 'cheguei' })] }),
        ]}),
      ]])],
    ));
    p.bandeira();
    p.rodar(60);
    expect(p.estado.atores[0].fala).toBe('cheguei');
  });
});

describe('esperar e parar', () => {
  it('espere 1 segundo segura a pilha por trinta quadros', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoBandeira'), b('espere', { segundos: 1 }), b('mover', { passos: 10 })],
    ])]));
    p.bandeira();
    p.rodar(QUADROS_POR_SEGUNDO - 2);
    expect(p.estado.atores[0].x).toBe(0);
    p.rodar(4);
    expect(p.estado.atores[0].x).toBe(10);
  });

  it('pare tudo encerra o palco', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoBandeira'), b('mover', { passos: 10 }), b('pareTudo'), b('mover', { passos: 100 })],
    ])]));
    p.bandeira();
    p.rodar(10);
    expect(p.estado.rodando).toBe(false);
    expect(p.estado.atores[0].x).toBe(10);
  });
});

describe('dois atores', () => {
  it('andam ao mesmo tempo, e não um depois do outro', () => {
    const p = new Palco(projeto([
      ator('gato', [[b('quandoBandeira'), b('sempre', { corpo: [b('mover', { passos: 5 })] })]], -100, 0),
      ator('cao', [[b('quandoBandeira'), b('sempre', { corpo: [b('mover', { passos: 5 })] })]], -100, 50),
    ]));
    p.bandeira();
    p.rodar(5);
    const [gato, cao] = p.estado.atores;
    expect(gato.x).toBe(cao.x);
    expect(gato.x).toBeGreaterThan(-100);
  });
});

describe('o fantasia e o som', () => {
  it('o próximo fantasia dá a volta na lista', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoBandeira'), b('proximaFantasia'), b('proximaFantasia')],
    ])]));
    p.bandeira();
    p.rodar(1); expect(p.estado.atores[0].fantasia).toBe(1);
    p.rodar(1); expect(p.estado.atores[0].fantasia).toBe(0);
  });

  it('o som é contado, e não emitido', () => {
    const p = new Palco(projeto([ator('gato', [
      [b('quandoBandeira'), b('toqueSom')],
    ])]));
    p.bandeira();
    p.rodar(2);
    expect(p.estado.sons).toBe(1);
  });
});
