import { describe, it, expect } from 'vitest';
import { validarBlocos, IDS_DE_BLOCOS } from './blocosValidator';
import type { Bloco, Ator, Projeto } from '../labs/blocos';

let n = 0;
const b = (tipo: Bloco['tipo'], resto: object = {}): Bloco =>
  ({ id: `t${(n += 1)}`, tipo, ...resto } as Bloco);

const ator = (id: string, blocos: Bloco[][]): Ator => ({
  id, nome: id, fantasias: ['🐱'], x: 0, y: 0,
  pilhas: blocos.map((bs, i) => ({ id: `${id}-p${i}`, blocos: bs })),
});

const proj = (atores: Ator[], variaveis: Projeto['variaveis'] = []): Projeto =>
  ({ atores, variaveis });

const um = (p: Projeto, id: string) => validarBlocos(p, [id])[0];

describe('a pilha precisa rodar', () => {
  /*
    Blocos soltos, sem chapéu, nunca executam. Uma verificação que os contasse
    aprovaria um projeto que não faz nada ao clicar na bandeira — e o
    desbravador levaria isso ao examinador.
  */
  it('ignora blocos numa pilha sem chapéu', () => {
    const p = proj([ator('gato', [[b('mover', { passos: 10 })]])]);
    expect(um(p, 'bandeira').passed).toBe(false);
    expect(um(p, 'laco').passed).toBe(false);
  });

  it('o chapéu sozinho não conta', () => {
    const p = proj([ator('gato', [[b('quandoBandeira')]])]);
    const r = um(p, 'bandeira');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('sozinho');
  });

  it('aceita o chapéu com um bloco embaixo', () => {
    const p = proj([ator('gato', [[b('quandoBandeira'), b('mover', { passos: 10 })]])]);
    expect(um(p, 'bandeira').passed).toBe(true);
  });
});

describe('o laço e o condicional só valem cheios', () => {
  /* Arrastar o bloco é a parte fácil. O que se cobra é o que ele faz. */
  it('repita vazio reprova, e diz por quê', () => {
    const p = proj([ator('gato', [[b('quandoBandeira'), b('repita', { vezes: 5, corpo: [] })]])]);
    const r = um(p, 'laco');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('repete o nada');
  });

  it('repita com um bloco dentro passa', () => {
    const p = proj([ator('gato', [[
      b('quandoBandeira'), b('repita', { vezes: 5, corpo: [b('mover', { passos: 1 })] }),
    ]])]);
    expect(um(p, 'laco').passed).toBe(true);
  });

  it('sempre também conta como laço', () => {
    const p = proj([ator('gato', [[
      b('quandoBandeira'), b('sempre', { corpo: [b('mover', { passos: 1 })] }),
    ]])]);
    expect(um(p, 'laco').passed).toBe(true);
  });

  it('se vazio reprova', () => {
    const p = proj([ator('gato', [[
      b('quandoBandeira'),
      b('se', { condicao: { tipo: 'tocando', quem: 'borda' }, corpo: [] }),
    ]])]);
    expect(um(p, 'condicional').passed).toBe(false);
  });
});

describe('a variável', () => {
  it('criada e nunca alterada não demonstra variável', () => {
    const p = proj(
      [ator('gato', [[b('quandoBandeira'), b('mover', { passos: 1 })]])],
      [{ nome: 'placar', valor: 0 }],
    );
    const r = um(p, 'variavel');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('não basta criá-la');
  });

  it('alterada numa pilha que roda passa', () => {
    const p = proj(
      [ator('gato', [[b('quandoBandeira'), b('mudeVariavel', { nome: 'placar', por: 1 })]])],
      [{ nome: 'placar', valor: 0 }],
    );
    expect(um(p, 'variavel').passed).toBe(true);
  });

  it('alterada só numa pilha sem chapéu não conta', () => {
    const p = proj(
      [ator('gato', [[b('mudeVariavel', { nome: 'placar', por: 1 })]])],
      [{ nome: 'placar', valor: 0 }],
    );
    expect(um(p, 'variavel').passed).toBe(false);
  });
});

describe('o movimento pelo teclado', () => {
  it('exige que a tecla dispare algo que move', () => {
    const semMover = proj([ator('gato', [[
      b('quandoTecla', { tecla: 'direita' }), b('diga', { texto: 'oi' }),
    ]])]);
    const r = um(semMover, 'moverPorTecla');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('nada nela move');

    const comMover = proj([ator('gato', [[
      b('quandoTecla', { tecla: 'direita' }), b('mover', { passos: 10 }),
    ]])]);
    expect(um(comMover, 'moverPorTecla').passed).toBe(true);
  });
});

describe('os dois atores', () => {
  it('um só, com programa, não basta', () => {
    const p = proj([
      ator('gato', [[b('quandoBandeira'), b('mover', { passos: 1 })]]),
      ator('maca', []),
    ]);
    expect(um(p, 'doisPersonagens').passed).toBe(false);
  });

  it('os dois com pilha que roda passam', () => {
    const p = proj([
      ator('gato', [[b('quandoBandeira'), b('mover', { passos: 1 })]]),
      ator('maca', [[b('quandoBandeira'), b('diga', { texto: 'oi' })]]),
    ]);
    expect(um(p, 'doisPersonagens').passed).toBe(true);
  });

  /* Tocar a borda é tocar o palco, e não o outro ator. */
  it('tocando na borda não é interação entre eles', () => {
    const p = proj([
      ator('gato', [[
        b('quandoBandeira'),
        b('se', { condicao: { tipo: 'tocando', quem: 'borda' }, corpo: [b('diga', { texto: 'ai' })] }),
      ]]),
      ator('maca', [[b('quandoBandeira'), b('diga', { texto: 'oi' })]]),
    ]);
    const r = um(p, 'interacao');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('borda do palco');
  });

  it('tocando no outro ator passa', () => {
    const p = proj([
      ator('gato', [[
        b('quandoBandeira'),
        b('se', { condicao: { tipo: 'tocando', quem: 'maca' }, corpo: [b('diga', { texto: 'peguei' })] }),
      ]]),
      ator('maca', [[b('quandoBandeira'), b('diga', { texto: 'oi' })]]),
    ]);
    expect(um(p, 'interacao').passed).toBe(true);
  });
});

describe('o placar e o fim de jogo', () => {
  /*
    Um "mude o placar" solto sobe a cada quadro: não marca ponto por nada, marca
    ponto por existir. O que faz dele placar é estar dentro de um "se".
  */
  it('mudar a variável fora de um se não é placar', () => {
    const p = proj(
      [ator('gato', [[
        b('quandoBandeira'), b('sempre', { corpo: [b('mudeVariavel', { nome: 'placar', por: 1 })] }),
      ]])],
      [{ nome: 'placar', valor: 0 }],
    );
    const r = um(p, 'placar');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('sobe o tempo todo');
  });

  it('dentro de um se, é placar', () => {
    const p = proj(
      [ator('gato', [[
        b('quandoBandeira'),
        b('sempre', { corpo: [
          b('se', { condicao: { tipo: 'tocando', quem: 'maca' }, corpo: [b('mudeVariavel', { nome: 'placar', por: 1 })] }),
        ]}),
      ]])],
      [{ nome: 'placar', valor: 0 }],
    );
    expect(um(p, 'placar').passed).toBe(true);
  });

  it('o fim de jogo é a comparação da variável com um número', () => {
    const sem = proj([ator('gato', [[
      b('quandoBandeira'),
      b('se', { condicao: { tipo: 'tocando', quem: 'borda' }, corpo: [b('diga', { texto: 'oi' })] }),
    ]])]);
    expect(um(sem, 'fimDeJogo').passed).toBe(false);

    const com = proj(
      [ator('gato', [[
        b('quandoBandeira'),
        b('se', { condicao: { tipo: 'variavelMaiorQue', nome: 'placar', valor: 5 }, corpo: [b('diga', { texto: 'ganhou' })] }),
      ]])],
      [{ nome: 'placar', valor: 0 }],
    );
    expect(um(com, 'fimDeJogo').passed).toBe(true);
  });
});

describe('a lista de verificações', () => {
  it('id desconhecido reprova com o motivo escrito', () => {
    const r = validarBlocos(proj([]), ['naoExiste'])[0];
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('desconhecida');
  });

  it('o projeto vazio reprova em tudo', () => {
    const r = validarBlocos(proj([ator('gato', [])]), IDS_DE_BLOCOS);
    expect(r.every(x => !x.passed)).toBe(true);
    expect(r).toHaveLength(IDS_DE_BLOCOS.length);
  });

  it('toda verificação tem rótulo e dica', () => {
    for (const r of validarBlocos(proj([]), IDS_DE_BLOCOS)) {
      expect(r.label.length, r.id).toBeGreaterThan(0);
      expect(r.hint.length, r.id).toBeGreaterThan(0);
    }
  });
});
