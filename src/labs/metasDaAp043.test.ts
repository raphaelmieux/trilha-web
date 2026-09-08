import { describe, it, expect } from 'vitest';
import {
  DOC_INICIAL, PLANILHA_INICIAL, ESTADO_INICIAL,
  METAS_DA_INSERCAO, METAS_DA_PLANILHA, METAS_DA_AREA,
  valorDe, refazerMesclagens, vazia,
} from './metasDaAp043';

/*
  Os três laboratórios da AP043 abrem com tudo por fazer.

  ── Por que esta trava existe ────────────────────────────────────────────
  "Laboratório que abre resolvido não ensina nada", e já aconteceu três vezes
  nesta plataforma. Das três, o erro é invisível de dentro: o painel mostra
  tarefas concluídas, que é exatamente o que se espera de um laboratório
  funcionando. Quem abre para conferir vê a coisa certa e vai embora.

  O de desenhar imagens nascia com cinco rótulos preenchidos; o da tabela abria
  com oito das doze verificações verdes; o do site de quatro páginas, com vinte
  e duas das vinte e seis. É por isso que o modelo e o critério moram fora do
  componente: para que este arquivo os alcance sem montar tela nenhuma.

  ── E a metade que faltava ───────────────────────────────────────────────
  Laboratório impossível de vencer é pior do que um que abre resolvido: um dá
  tarefa verde de graça, o outro deixa quem fez tudo certo olhando uma lista
  vermelha sem nada na tela que explique. Um enunciado que manda excluir uma
  coluna que não existe é exatamente isso, e foi encontrado assim — a planilha
  não tinha coluna vazia nenhuma.

  Então cada meta também é conferida pelo lado de lá: existe um estado que a
  satisfaz, e ele é o que o enunciado descreve.
*/

describe('nenhuma tarefa da AP043 nasce verde', () => {
  it('o documento de inserção abre com as quatro por fazer', () => {
    const verdes = METAS_DA_INSERCAO.filter(m => m.feita(DOC_INICIAL)).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já estão cumpridas no documento inicial`).toEqual([]);
  });

  it('a planilha abre com as seis por fazer', () => {
    const verdes = METAS_DA_PLANILHA.filter(m => m.feita(PLANILHA_INICIAL)).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já estão cumpridas na planilha inicial`).toEqual([]);
  });

  it('a área de trabalho abre com as cinco por fazer', () => {
    const verdes = METAS_DA_AREA.filter(m => m.feita(ESTADO_INICIAL)).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já estão cumpridas na máquina inicial`).toEqual([]);
  });
});

describe('toda tarefa da AP043 tem como ser vencida', () => {
  /*
    O documento entregue: tabela de quatro linhas e duas colunas, toda
    preenchida e com estilo; foto com quebra ajustada; cabeçalho e rodapé
    escritos; numeração ligada.
  */
  it('o documento de inserção fecha as quatro', () => {
    const pronto = {
      tabela: {
        linhas: [['Unidade', 'Inscritos'], ['Falcão', '12'], ['Águia', '9'], ['Tucano', '11']],
        estilo: 'grade' as const,
      },
      imagem: { presente: true, quebra: 'quadrada' as const },
      cabecalho: 'Clube Falcão Peregrino',
      rodape: 'Unidade Falcão',
      numeracao: true,
    };
    const abertas = METAS_DA_INSERCAO.filter(m => !m.feita(pronto)).map(m => m.id);
    expect(abertas, `${abertas.join(', ')} continuam abertas num documento pronto`).toEqual([]);
  });

  it('a planilha fecha as seis', () => {
    /* Parte do estado inicial e faz, uma a uma, o que os enunciados mandam. */
    let p = { ...PLANILHA_INICIAL, celulas: PLANILHA_INICIAL.celulas.map(l => l.map(c => ({ ...c }))) };

    // tamanho: alargar a coluna A e subir a altura da linha 1
    p = { ...p, larguras: p.larguras.map((w, i) => (i === 0 ? w + 80 : w)) };
    p = { ...p, alturas: p.alturas.map((h, i) => (i === 0 ? h + 30 : h)) };

    // linhas e colunas: a linha da Arara, e fora a coluna vazia
    const arara = p.celulas[0].map(() => vazia());
    arara[0] = vazia('Arara'); arara[1] = vazia('8'); arara[2] = vazia('3');
    p = { ...p, celulas: [...p.celulas.slice(0, 5), arara, ...p.celulas.slice(5)] };
    p = {
      ...p,
      celulas: refazerMesclagens(p.celulas.map(l => l.filter((_, i) => i !== 4))),
      larguras: p.larguras.filter((_, i) => i !== 4),
    };

    // alinhar e mesclar o título
    p = {
      ...p,
      celulas: p.celulas.map((l, i) => (i !== 0 ? l : l.map((c, j) => (j === 0
        ? { ...c, h: 'centro' as const, v: 'meio' as const, span: l.length }
        : { ...c, coberta: true, texto: '' })))),
    };

    // layout e fórmulas
    p = { ...p, layout: 'automatico' };
    p = {
      ...p,
      celulas: p.celulas.map((l, i) => (i !== 7 ? l : l.map((c, j) => {
        if (j === 1) return { ...c, texto: '=SOMA(B3:B6)' };
        if (j === 3) return { ...c, texto: '=MÉDIA(D3:D5)' };
        return c;
      }))),
    };

    const abertas = METAS_DA_PLANILHA.filter(m => !m.feita(p)).map(m => m.id);
    expect(abertas, `${abertas.join(', ')} continuam abertas numa planilha pronta`).toEqual([]);
  });

  it('a área de trabalho fecha as cinco', () => {
    const pronto = {
      ...ESTADO_INICIAL,
      itensNaArea: [{ id: 'at-1', nome: 'Clube', tipo: 'atalho' as const }],
      prints: ['Captura 1.png'],
      viuAsInformacoes: true,
      viuDetalhesDe: 'a1',
      relogioAutomatico: false,
      relogioAjustado: true,
    };
    const abertas = METAS_DA_AREA.filter(m => !m.feita(pronto)).map(m => m.id);
    expect(abertas, `${abertas.join(', ')} continuam abertas numa máquina pronta`).toEqual([]);
  });
});

/*
  O enunciado promete uma coluna vazia para excluir, e é preciso que ela exista.

  Foi assim que o defeito apareceu: a tarefa mandava tirar "a coluna vazia
  depois de Total", e a planilha tinha quatro colunas, todas usadas. A pessoa
  procurava, não achava, e a lista continuava vermelha sem nada explicando.

  Montar o estado vencedor à mão não pega isso — o teste acima filtra a coluna 4
  e, se ela não existir, o filtro simplesmente não faz nada e a meta passa. Quem
  precisa ser conferida é a premissa do enunciado.
*/
describe('o enunciado da planilha descreve a planilha que existe', () => {
  const colunas = PLANILHA_INICIAL.celulas[0].length;

  it('há exatamente uma coluna inteiramente vazia, e ela é a última', () => {
    const vazias = Array.from({ length: colunas }, (_, c) => c)
      .filter(c => PLANILHA_INICIAL.celulas.every(l => l[c].texto.trim() === ''));
    expect(vazias, 'a tarefa manda excluir a coluna vazia').toEqual([colunas - 1]);
  });

  /* E a meta cobra o resultado da exclusão: sem isso, o enunciado pediria uma
     coisa e a verificação aceitaria outra. */
  it('a meta só fecha depois que essa coluna sai', () => {
    const arara = PLANILHA_INICIAL.celulas[0].map(() => vazia());
    arara[0] = vazia('Arara'); arara[1] = vazia('8'); arara[2] = vazia('3');
    const comArara = {
      ...PLANILHA_INICIAL,
      celulas: [...PLANILHA_INICIAL.celulas.slice(0, 5), arara, ...PLANILHA_INICIAL.celulas.slice(5)],
    };
    const meta = METAS_DA_PLANILHA.find(m => m.id === 'linhas')!;
    expect(meta.feita(comArara), 'a linha nova sozinha não basta').toBe(false);

    const semAVazia = {
      ...comArara,
      celulas: comArara.celulas.map(l => l.filter((_, i) => i !== colunas - 1)),
      larguras: comArara.larguras.filter((_, i) => i !== colunas - 1),
    };
    expect(meta.feita(semAVazia)).toBe(true);
  });
});

describe('a planilha calcula de verdade', () => {
  /* A fórmula guarda a conta, e não o resultado — é essa a lição do módulo, e
     ela só é verdade se o valor se refizer quando a célula muda. */
  const com = (texto: string, l: number, c: number) => ({
    ...PLANILHA_INICIAL,
    celulas: PLANILHA_INICIAL.celulas.map((linha, i) =>
      linha.map((cel, j) => (i === l && j === c ? { ...cel, texto } : { ...cel }))),
  });

  it('soma o intervalo, ignorando texto e célula vazia', () => {
    /* B3:B5 são 12, 9 e 11; B2 é o cabeçalho "Inscritos", e não entra. */
    expect(valorDe(com('=SOMA(B2:B5)', 5, 1), 5, 1)).toBe('32');
  });

  it('a média divide pela quantidade de números, e não pela de células', () => {
    expect(valorDe(com('=MÉDIA(B2:B5)', 5, 1), 5, 1)).toBe('10.67'.replace('.', ','));
  });

  it('o resultado muda quando a célula de origem muda', () => {
    const antes = com('=SOMA(B3:B5)', 5, 1);
    expect(valorDe(antes, 5, 1)).toBe('32');
    const depois = {
      ...antes,
      celulas: antes.celulas.map((l, i) => l.map((c, j) => (i === 2 && j === 1 ? { ...c, texto: '2' } : c))),
    };
    expect(valorDe(depois, 5, 1)).toBe('22');
  });

  /* Nome de função errado não estoura: a planilha devolve um erro visível, e é
     isso que se vê na tela de verdade. Silêncio aqui ensinaria que a fórmula
     funcionou. */
  it('função desconhecida vira erro à vista, e não zero', () => {
    expect(valorDe(com('=SOMATORIO(B3:B5)', 5, 1), 5, 1)).toBe('#NOME?');
  });
});
