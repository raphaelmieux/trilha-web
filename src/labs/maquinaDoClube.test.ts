import { describe, it, expect } from 'vitest';
import {
  MAQUINA_INICIAL, METAS_DA_MAQUINA, IMPRESSORAS, ARQUIVOS, PROGRAMAS_POR_TIPO,
  type Maquina,
} from './maquinaDoClube';

/*
  O laboratório de Configurações abre com tudo por fazer.

  A máquina do clube chega funcionando — dois discos, uma impressora escolhida,
  um usuário —, e é assim que uma tarefa nasce verde sem ninguém reparar: nada
  está quebrado. O que falta é o que só se descobre usando: 12 GB de lixo no
  disco, a impressora padrão errada, e um computador de todo mundo com uma conta
  só.
*/

describe('nenhuma tarefa do laboratório de Configurações nasce verde', () => {
  it('a máquina abre com as seis por fazer', () => {
    const verdes = METAS_DA_MAQUINA.filter(m => m.feita(MAQUINA_INICIAL)).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já estão cumpridas na máquina inicial`).toEqual([]);
  });

  it('toda meta tem passo a passo', () => {
    const sem = METAS_DA_MAQUINA.filter(m => m.passos.length < 2).map(m => m.id);
    expect(sem).toEqual([]);
  });

  it('há uma tarefa para cada um dos cinco itens do requisito 13', () => {
    /* Seis tarefas para cinco itens: o item a) pede limpeza **e**
       desfragmentação, que são duas coisas diferentes e uma delas é a lição do
       SSD. Juntá-las esconderia essa metade atrás de um único visto. */
    expect(METAS_DA_MAQUINA).toHaveLength(6);
    expect(new Set(METAS_DA_MAQUINA.map(m => m.id)).size).toBe(6);
  });
});

/*
  E a máquina precisa ter os defeitos que as tarefas consertam.

  Cada um destes é a razão de existir de uma tarefa. Se a impressora padrão já
  fosse a da secretaria, a tarefa seria vencida por um clique que ninguém
  precisou dar.
*/
describe('a máquina inicial tem o que as tarefas consertam', () => {
  it('os dois discos estão sujos e sem otimizar', () => {
    expect(MAQUINA_INICIAL.discos.every(d => !d.limpo && !d.otimizado)).toBe(true);
    expect(MAQUINA_INICIAL.discos.find(d => d.id === 'c')!.lixoEmGb).toBeGreaterThan(0);
  });

  /* Um SSD e um HD: sem os dois tipos, a diferença entre desfragmentar e
     otimizar não teria onde aparecer, e a lição do item a) sumiria. */
  it('há um disco de cada tipo, que é o que faz a lição existir', () => {
    expect(new Set(MAQUINA_INICIAL.discos.map(d => d.tipo))).toEqual(new Set(['ssd', 'hd']));
  });

  it('a impressora padrão não é a da secretaria', () => {
    expect(MAQUINA_INICIAL.impressoraPadrao).not.toBe('sec');
    expect(IMPRESSORAS.length, 'com uma impressora só não há o que escolher').toBeGreaterThanOrEqual(2);
  });

  it('e há um usuário só, administrador', () => {
    expect(MAQUINA_INICIAL.usuarios).toHaveLength(1);
    expect(MAQUINA_INICIAL.usuarios[0].administrador).toBe(true);
  });

  it('todo tipo de arquivo tem mais de um programa para escolher', () => {
    for (const a of ARQUIVOS) {
      expect(PROGRAMAS_POR_TIPO[a.tipo]?.length, `${a.tipo} não tem escolha`).toBeGreaterThanOrEqual(2);
    }
  });
});

/* ── A máquina depois de tudo feito ────────────────────────────────────────── */

const pronta = (): Maquina => ({
  discos: MAQUINA_INICIAL.discos.map(d => ({ ...d, limpo: true, otimizado: true })),
  padroes: { ...MAQUINA_INICIAL.padroes, txt: 'VS Code' },
  aberturasAvulsas: [{ arquivo: 'foto-do-acampamento.jpg', programa: 'GIMP' }],
  impressoraPadrao: 'sec',
  usuarios: [...MAQUINA_INICIAL.usuarios, { nome: 'Ana', administrador: false }],
});

describe('toda tarefa do laboratório de Configurações tem como ser vencida', () => {
  it('a máquina pronta fecha as seis', () => {
    const abertas = METAS_DA_MAQUINA.filter(m => !m.feita(pronta())).map(m => m.id);
    expect(abertas, `${abertas.join(', ')} continuam abertas numa máquina pronta`).toEqual([]);
  });
});

/*
  "Abrir com" não é "definir padrão".

  Um vale para aquele arquivo, desta vez; o outro muda a regra para todos os
  arquivos daquele tipo. Confundir os dois é o motivo de alguém abrir uma foto
  no editor de imagens uma vez e passar a abrir todas ali — e é por isso que a
  tarefa exige que o padrão **não** tenha mudado.
*/
describe('abrir com não pode ter mudado o padrão', () => {
  const meta = METAS_DA_MAQUINA.find(m => m.id === 'abrir-com')!;

  it('abrir avulso sem mexer no padrão fecha', () => {
    expect(meta.feita(pronta())).toBe(true);
  });

  it('mas se o padrão mudou junto, a tarefa não fecha', () => {
    const m: Maquina = { ...pronta(), padroes: { ...pronta().padroes, jpg: 'GIMP' } };
    expect(meta.feita(m)).toBe(false);
  });

  it('e abrir no próprio programa padrão não demonstra nada', () => {
    const m: Maquina = {
      ...pronta(),
      aberturasAvulsas: [{ arquivo: 'foto-do-acampamento.jpg', programa: MAQUINA_INICIAL.padroes['jpg'] }],
    };
    expect(meta.feita(m)).toBe(false);
  });
});

/*
  Otimizar exige os dois discos.

  A lição do item a) é a diferença entre desfragmentar e otimizar, e ela só
  aparece quando se passa pelo HD e pelo SSD. Um disco só fecharia a tarefa sem
  que a diferença fosse vista.
*/
describe('a diferença entre os discos precisa ser vista', () => {
  const meta = METAS_DA_MAQUINA.find(m => m.id === 'otimizar')!;

  it('otimizar só o SSD não fecha', () => {
    const m: Maquina = {
      ...pronta(),
      discos: pronta().discos.map(d => ({ ...d, otimizado: d.tipo === 'ssd' })),
    };
    expect(meta.feita(m)).toBe(false);
  });

  it('otimizar só o HD também não', () => {
    const m: Maquina = {
      ...pronta(),
      discos: pronta().discos.map(d => ({ ...d, otimizado: d.tipo === 'hd' })),
    };
    expect(meta.feita(m)).toBe(false);
  });
});

/*
  Um segundo administrador não é separar usuários.

  Criar outra conta com poder de mexer em tudo é o contrário do que a separação
  serve para fazer. A tarefa cobra a conta comum.
*/
describe('o usuário novo é conta padrão', () => {
  const meta = METAS_DA_MAQUINA.find(m => m.id === 'usuario')!;

  it('um segundo administrador não fecha', () => {
    const m: Maquina = {
      ...pronta(),
      usuarios: [...MAQUINA_INICIAL.usuarios, { nome: 'Ana', administrador: true }],
    };
    expect(meta.feita(m)).toBe(false);
  });

  it('e a conta padrão fecha', () => {
    expect(meta.feita(pronta())).toBe(true);
  });
});
