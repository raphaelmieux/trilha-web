import { describe, it, expect } from 'vitest';
import {
  CABECALHO, COLUNAS, DEFEITOS, DUPLICATA, INDICE, MEMBROS, MODOS, NOME_DA_BRUTA,
  abaBruta, chaveDoMembro, conteudoDaBruta, linhaCerta, linhasBrutas, type TipoDeProblema,
} from './chamadaDoClube';
import { ELENCO, baseDoAcampamento } from './baseDoAcampamento';
import { CAMPO_IDADE } from './baseDoAcampamento';
import { CAMPO_NOME, CAMPO_UNIDADE, valorDa } from './formulario';
import { numeroDoTexto } from './formulas';
import {
  MINIMO_DE_CAMPOS, MINIMO_DE_REGISTROS, ausenciasDePe, brutaIntacta, chaveDaLinha,
  colunaCerta, linhasDa, modosPadronizados, semRepetida, todoMundoNaBase,
  unidadesPadronizadas,
} from './projetoDeDados';
import {
  escrever, planilhaDe, removerDuplicatas, substituir, trocarAtiva,
} from './planilha';

/*
  As premissas da base da CC-ES013.

  Cada uma delas é o que faz uma lição existir. Uma base sem o 1.250 não teria
  o valor impossível que a planilha aceita como número; uma sem a homônima não
  teria o que Remover Duplicatas apagar errado; uma com folga larga acima de
  sessenta deixaria excluir as quatro linhas sem questionário sem nada mudar.
  Consertar uma delas por engano apagaria a lição daquele módulo sem reprovar
  nada — por isso cada uma tem trava própria.
*/

const tratadaCerta = () => planilhaDe('Tratada', [
  COLUNAS.map(c => CABECALHO[c]),
  ...MEMBROS.map(linhaCerta),
], { tabela: { l1: 0, c1: 0, l2: MEMBROS.length, c2: COLUNAS.length - 1 } });

describe('é o clube da CC-ES009', () => {
  it('sessenta e um membros, unidade por unidade como o elenco do clube', () => {
    expect(MEMBROS).toHaveLength(ELENCO.reduce((s, u) => s + u.membros, 0));
    for (const u of ELENCO) {
      expect(MEMBROS.filter(m => m.unidade === u.nome), u.nome).toHaveLength(u.membros);
    }
  });

  it('quem se inscreveu no acampamento tem aqui o nome, a unidade e a idade de lá', () => {
    const base = baseDoAcampamento();
    expect(base.respostas.length).toBeGreaterThan(40);
    for (const r of base.respostas) {
      const nome = valorDa(r, CAMPO_NOME);
      const unidade = valorDa(r, CAMPO_UNIDADE);
      const m = MEMBROS.find(x => x.nome === nome && x.unidade === unidade);
      expect(m, nome).toBeDefined();
      expect(String(m!.idade), nome).toBe(valorDa(r, CAMPO_IDADE));
    }
  });

  it('cada pessoa é uma só: nome e unidade não se repetem', () => {
    expect(new Set(MEMBROS.map(chaveDoMembro)).size).toBe(MEMBROS.length);
  });
});

describe('o tamanho é o do requisito 3, com folga de um', () => {
  it('a bruta tem sessenta e duas linhas e seis campos, e a tratada fica com sessenta e uma', () => {
    expect(linhasBrutas()).toHaveLength(MEMBROS.length + 1);
    expect(COLUNAS.length).toBeGreaterThanOrEqual(MINIMO_DE_CAMPOS);
    expect(MEMBROS.length).toBeGreaterThanOrEqual(MINIMO_DE_REGISTROS);
  });

  it('excluir as linhas de quem não respondeu ao questionário derruba a base abaixo de sessenta', () => {
    const sem = MEMBROS.filter(m => m.modo === null);
    expect(sem.length).toBeGreaterThan(MEMBROS.length - MINIMO_DE_REGISTROS);
    expect(MEMBROS.length - sem.length).toBeLessThan(MINIMO_DE_REGISTROS);
  });
});

describe('a bruta traz um defeito de cada família', () => {
  it('as cinco famílias estão lá', () => {
    const tipos = new Set<TipoDeProblema>(DEFEITOS.map(d => d.tipo));
    tipos.add('duplicata');
    if (MEMBROS.some(m => m.modo === null)) tipos.add('ausencia');
    expect([...tipos].sort()).toEqual(
      ['ausencia', 'duplicata', 'grafia', 'numero-como-texto', 'valor-impossivel'],
    );
  });

  it('todo defeito é diferente do certo, e de uma pessoa que existe', () => {
    for (const d of DEFEITOS) {
      const m = MEMBROS.find(x => chaveDoMembro(x) === d.chave);
      expect(m, d.chave).toBeDefined();
      expect(linhaCerta(m!)[INDICE[d.coluna]], d.chave).not.toBe(d.bruto);
    }
  });

  it('o número guardado como texto é texto para a planilha', () => {
    for (const d of DEFEITOS.filter(x => x.tipo === 'numero-como-texto')) {
      expect(numeroDoTexto(d.bruto), d.bruto).toBeNull();
    }
  });

  it('o 1.250 é o único que a planilha aceita como número — mil duzentos e cinquenta', () => {
    const impossiveis = DEFEITOS.filter(d => d.tipo === 'valor-impossivel');
    expect(impossiveis.map(d => numeroDoTexto(d.bruto))).toEqual([1250, 41]);
  });

  it('um impossível tem conserto, o outro vira ausência', () => {
    const [comEvidencia, semEvidencia] = DEFEITOS.filter(d => d.tipo === 'valor-impossivel');
    const m1 = MEMBROS.find(x => chaveDoMembro(x) === comEvidencia.chave)!;
    const m2 = MEMBROS.find(x => chaveDoMembro(x) === semEvidencia.chave)!;
    expect(m1.distancia).toBe(1.25);
    expect(m1.modo).toBe('A pé');
    expect(m2.idade).toBeNull();
  });

  it('o 1.250 puxa a média da distância de seis para mais de vinte e cinco quilômetros', () => {
    const certas = MEMBROS.flatMap(m => (m.distancia === null ? [] : [m.distancia]));
    const lidas = linhasBrutas().flatMap(l => {
      const n = numeroDoTexto(l[INDICE.distancia]);
      return n === null ? [] : [n];
    });
    const media = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
    expect(media(certas)).toBeGreaterThan(5);
    expect(media(certas)).toBeLessThan(8);
    expect(media(lidas)).toBeGreaterThan(25);
  });

  it('quem não respondeu ao questionário perde as duas colunas juntas, e mais nada', () => {
    for (const m of MEMBROS.filter(x => x.modo === null || x.distancia === null)) {
      expect(m.modo, m.nome).toBeNull();
      expect(m.distancia, m.nome).toBeNull();
      expect(m.presencas, m.nome).toBeGreaterThan(0);
    }
  });

  it('o transporte certo é sempre um dos quatro do questionário', () => {
    for (const m of MEMBROS) if (m.modo) expect(MODOS).toContain(m.modo);
  });
});

describe('a linha repetida e a homônima', () => {
  it('a repetida difere só na grafia, e Remover Duplicatas não a acha antes de padronizar', () => {
    const bruta = abaBruta();
    expect(removerDuplicatas(bruta, [0, 1, 2, 3, 4, 5]).removidas).toBe(0);
    const linhas = linhasDa(bruta).filter(v => chaveDaLinha(v) === DUPLICATA.chave);
    expect(linhas).toHaveLength(2);
    const diferentes = COLUNAS.filter(c => linhas[0][c] !== linhas[1][c]);
    expect(diferentes.sort()).toEqual(Object.keys(DUPLICATA.diferencas).sort());
  });

  it('depois de padronizar a grafia, ela é achada — e a homônima continua', () => {
    let p = abaBruta();
    p = substituir(p, 'aguia', 'Águia', { maiusculas: false, inteira: true }).planilha;
    p = substituir(p, 'onibus', 'Ônibus', { maiusculas: false, inteira: true }).planilha;
    const { planilha, removidas } = removerDuplicatas(p, [0, 1, 2, 3, 4, 5]);
    expect(removidas).toBe(1);
    expect(linhasDa(planilha).filter(v => v.nome === 'Ana Clara Ribeiro')).toHaveLength(2);
  });

  it('remover duplicatas olhando só o nome apaga uma das Anas', () => {
    const { planilha } = removerDuplicatas(tratadaCerta(), [0]);
    expect(semRepetida(linhasDa(planilha))).toBe(false);
    expect(todoMundoNaBase(linhasDa(planilha))).toBe(false);
  });
});

describe('o Pedro Aguiar', () => {
  it('substituir "aguia" sem célula inteira e na planilha toda muda o nome dele', () => {
    const { planilha } = substituir(abaBruta(), 'aguia', 'Águia', { maiusculas: false, inteira: false });
    expect(linhasDa(planilha).some(v => v.nome === 'Pedro Águiar')).toBe(true);
    expect(colunaCerta(linhasDa(planilha), 'nome')).toBe(false);
  });
});

describe('as conferências da base tratada', () => {
  it('na base certa, todas passam', () => {
    const linhas = linhasDa(tratadaCerta());
    expect(linhas).toHaveLength(MEMBROS.length);
    expect(unidadesPadronizadas(linhas)).toBe(true);
    expect(modosPadronizados(linhas)).toBe(true);
    expect(semRepetida(linhas)).toBe(true);
    expect(ausenciasDePe(linhas)).toBe(true);
    for (const c of COLUNAS) expect(colunaCerta(linhas, c), c).toBe(true);
  });

  it('na bruta, as de grafia, de repetida e de número falham', () => {
    const linhas = linhasDa(abaBruta());
    expect(unidadesPadronizadas(linhas)).toBe(false);
    expect(modosPadronizados(linhas)).toBe(false);
    expect(semRepetida(linhas)).toBe(false);
    expect(colunaCerta(linhas, 'distancia')).toBe(false);
    expect(colunaCerta(linhas, 'idade')).toBe(false);
  });

  it('preencher a ausência com a média faz a coluna errar e as ausências caírem', () => {
    let p = tratadaCerta();
    MEMBROS.forEach((m, i) => { if (m.distancia === null) p = escrever(p, i + 1, INDICE.distancia, '6,4'); });
    const linhas = linhasDa(p);
    expect(ausenciasDePe(linhas)).toBe(false);
    expect(colunaCerta(linhas, 'distancia')).toBe(false);
  });

  it('a ordem não importa: a tratada classificada continua certa', () => {
    const certa = tratadaCerta();
    const invertida = { ...certa, celulas: [certa.celulas[0], ...certa.celulas.slice(1, MEMBROS.length + 1).reverse(), ...certa.celulas.slice(MEMBROS.length + 1)] };
    const linhas = linhasDa(invertida);
    for (const c of COLUNAS) expect(colunaCerta(linhas, c), c).toBe(true);
    expect(semRepetida(linhas)).toBe(true);
  });
});

describe('a bruta continua bruta', () => {
  const pasta = () => ({ planilhas: [abaBruta()], ativa: 0 });

  it('como chegou, ela está intacta', () => {
    expect(brutaIntacta(pasta())).toBe(true);
    expect(abaBruta().nome).toBe(NOME_DA_BRUTA);
    expect(conteudoDaBruta()[0]).toEqual(COLUNAS.map(c => CABECALHO[c]));
  });

  it('qualquer escrita a deixa de ser bruta — inclusive uma conta ao lado da tabela', () => {
    const cad = pasta();
    expect(brutaIntacta(trocarAtiva(cad, escrever(abaBruta(), 1, 1, 'Falcão!')))).toBe(false);
    expect(brutaIntacta(trocarAtiva(cad, escrever(abaBruta(), 2, 9, '=CONT.VALORES(A2:A63)')))).toBe(false);
  });

  it('sem a aba, não há bruta nenhuma para entregar', () => {
    expect(brutaIntacta({ planilhas: [], ativa: 0 })).toBe(false);
  });
});
