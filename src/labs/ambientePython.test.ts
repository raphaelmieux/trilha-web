import { describe, it, expect } from 'vitest';
import {
  estadoInicial, rodarComando, validarAmbiente, IDS_DO_AMBIENTE,
  PASTA_DOCUMENTOS, PASTA_INICIAL, NAO_RECONHECIDO, VERSAO,
  type EstadoDoAmbiente,
} from './ambientePython';

/*
  O que este arquivo cobra é uma coisa só: que a simulação não minta.

  Ela é verdadeira quando o caminho previsto é seguido — e o que a torna útil é
  ser verdadeira também quando ele não é. Cada erro aqui é um erro que o
  desbravador vai reencontrar no computador do clube, com a mesma frase.
*/

const instalado = (e: EstadoDoAmbiente, noPath: boolean, comLancador = true) =>
  ({ ...e, instalado: { noPath, comLancador } });

const comArquivo = (e: EstadoDoAmbiente, nome: string) =>
  ({ ...e, documentos: { ...e.documentos, [nome]: 'print("oi")' } });

const emDocumentos = (e: EstadoDoAmbiente) => ({ ...e, pasta: PASTA_DOCUMENTOS });

describe('o laboratório abre com tudo por fazer', () => {
  it('nenhuma verificação vem verde', () => {
    for (const r of validarAmbiente(estadoInicial(), IDS_DO_AMBIENTE)) {
      expect(r.passed, `"${r.label}" já vem satisfeita`).toBe(false);
    }
  });

  it('nada baixado, nada instalado, Documentos vazio', () => {
    const e = estadoInicial();
    expect(e.baixadoDe).toBeNull();
    expect(e.instalado).toBeNull();
    expect(Object.keys(e.documentos)).toHaveLength(0);
  });
});

describe('o prompt sem Python instalado', () => {
  it('responde exatamente o que o Windows responde', () => {
    const { saida } = rodarComando('python programa.py', estadoInicial());
    expect(saida).toEqual([`'python' ${NAO_RECONHECIDO}`]);
  });
});

describe('a caixa do PATH decide o que o prompt entende', () => {
  /*
    É o coração da lição. Instalado sem PATH, o Python existe no computador e
    mesmo assim `python` não é reconhecido — a frase não diz "não instalado",
    diz "não reconhecido", e essa diferença é o que confunde toda gente.
  */
  it('sem PATH, `python` continua não sendo reconhecido', () => {
    const e = instalado(estadoInicial(), false);
    expect(rodarComando('python --version', e).saida).toEqual([`'python' ${NAO_RECONHECIDO}`]);
  });

  it('com PATH, `python` responde a versão', () => {
    const e = instalado(estadoInicial(), true);
    expect(rodarComando('python --version', e).saida).toEqual([`Python ${VERSAO}`]);
  });

  /* O `py` vive na pasta do sistema, que já está no PATH desde sempre. Não é
     concessão nossa: é a saída que o Windows de verdade oferece. */
  it('sem PATH, o `py` ainda funciona — e é a outra saída verdadeira', () => {
    const e = instalado(estadoInicial(), false, true);
    expect(rodarComando('py --version', e).saida).toEqual([`Python ${VERSAO}`]);
  });

  it('sem o lançador, nem o `py` responde', () => {
    const e = instalado(estadoInicial(), false, false);
    expect(rodarComando('py --version', e).saida).toEqual([`'py' ${NAO_RECONHECIDO}`]);
  });
});

describe('executar a partir do arquivo', () => {
  const pronto = () => emDocumentos(comArquivo(instalado(estadoInicial(), true), 'programa.py'));

  it('roda e imprime o que o programa imprime', () => {
    const { saida, estado } = rodarComando('python programa.py', pronto());
    expect(estado.rodou).toBe(true);
    expect(saida.join('\n')).toContain('Boa noite');
  });

  /* A pasta faz parte da lição: o arquivo está em Documentos, e o prompt abre
     na pasta do usuário. Sem o `cd`, o Python não acha nada. */
  it('na pasta errada, o Python não acha o arquivo', () => {
    const e = comArquivo(instalado(estadoInicial(), true), 'programa.py');
    expect(e.pasta).toBe(PASTA_INICIAL);
    const { saida, estado } = rodarComando('python programa.py', e);
    expect(estado.rodou).toBe(false);
    expect(saida[0]).toContain('No such file or directory');
    expect(saida[0]).toContain(PASTA_INICIAL);
  });

  it('o `cd Documents` leva para a pasta certa', () => {
    const { estado } = rodarComando('cd Documents', instalado(estadoInicial(), true));
    expect(estado.pasta).toBe(PASTA_DOCUMENTOS);
  });

  /*
    A armadilha do Bloco de Notas. O arquivo existe, o nome parece certo na
    tela, e o Python diz que não achou — porque o que está no disco é
    `programa.py.txt`.
  */
  it('o arquivo salvo como .py.txt não é achado por programa.py', () => {
    const e = emDocumentos(comArquivo(instalado(estadoInicial(), true), 'programa.py.txt'));
    const { saida, estado } = rodarComando('python programa.py', e);
    expect(estado.rodou).toBe(false);
    expect(saida[0]).toContain('No such file or directory');
  });

  it('e o dir mostra o nome de verdade, que é como se descobre', () => {
    const e = emDocumentos(comArquivo(instalado(estadoInicial(), true), 'programa.py.txt'));
    expect(rodarComando('dir', e).saida.join('\n')).toContain('programa.py.txt');
  });
});

describe('o prompt aguenta o que a lição não pediu', () => {
  it('comando inventado responde como o Windows responde', () => {
    const { saida } = rodarComando('abracadabra', estadoInicial());
    expect(saida).toEqual([`'abracadabra' ${NAO_RECONHECIDO}`]);
  });

  it('linha vazia não faz nada', () => {
    expect(rodarComando('   ', estadoInicial()).saida).toEqual([]);
  });

  it('cd .. sobe uma pasta, e não passa da raiz', () => {
    const e = { ...estadoInicial(), pasta: 'C:\\' };
    expect(rodarComando('cd ..', e).estado.pasta).toBe('C:\\');
  });

  it('cd para pasta que não existe responde o erro do Windows', () => {
    const { saida } = rodarComando('cd Musicas', estadoInicial());
    expect(saida).toEqual(['O sistema não pode encontrar o caminho especificado.']);
  });

  it('cls limpa o histórico', () => {
    const e = { ...estadoInicial(), historico: ['linha velha'] };
    expect(rodarComando('cls', e).estado.historico).toEqual([]);
  });
});

describe('as verificações medem o que aconteceu, e não o que se clicou', () => {
  it('baixar do agregador não conta, e diz por quê', () => {
    const e = { ...estadoInicial(), baixadoDe: 'agregador' as const };
    const r = validarAmbiente(e, ['baixouDoSiteOficial'])[0];
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('junta programas');
  });

  it('o .py.txt reprova com o nome que foi salvo de verdade', () => {
    const e = comArquivo(estadoInicial(), 'programa.py.txt');
    const r = validarAmbiente(e, ['salvouOArquivoPy'])[0];
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('programa.py.txt');
    expect(r.detail).toContain('Todos os arquivos');
  });

  /*
    Marcar a caixa do PATH não é tarefa, de propósito: o que se cobra é o
    programa ter rodado. Quem instalou sem PATH e chamou pelo `py` resolveu de
    um jeito que o mundo real aceita, e a lista fica verde.
  */
  it('sem PATH, pelo `py`, o requisito é cumprido do mesmo jeito', () => {
    let e = emDocumentos(comArquivo(instalado(estadoInicial(), false, true), 'programa.py'));
    e = rodarComando('py programa.py', e).estado;
    expect(validarAmbiente(e, ['rodouNoPrompt'])[0].passed).toBe(true);
  });

  it('id que o verificador não conhece nunca passa, e explica', () => {
    const r = validarAmbiente(estadoInicial(), ['inventado'])[0];
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('não existe');
  });
});

describe('o caminho inteiro, do zero ao verde', () => {
  it('baixar, instalar, salvar e rodar deixa as quatro verdes', () => {
    let e = estadoInicial();
    e = { ...e, baixadoDe: 'oficial' };
    e = { ...e, instalado: { noPath: true, comLancador: true } };
    e = { ...e, documentos: { 'programa.py': 'print("oi")' } };
    e = rodarComando('cd Documents', e).estado;
    e = rodarComando('python programa.py', e).estado;

    const reprovadas = validarAmbiente(e, IDS_DO_AMBIENTE).filter(r => !r.passed);
    expect(reprovadas.map(r => r.id)).toEqual([]);
  });
});
