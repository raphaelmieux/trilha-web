import { describe, it, expect } from 'vitest';
import {
  DOC_INICIAL, PLANILHA_INICIAL, ESTADO_INICIAL,
  METAS_DA_INSERCAO, METAS_DA_PLANILHA, METAS_DA_AREA,
  valorDe, refazerMesclagens, vazia, alinhamentoDe, larguraDaTabela,
  excluirColunaDe, inserirColunaEm, nomeDaFaixa, naFaixa,
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

    // linhas e colunas: a linha da Arara, e fora a coluna vazia do meio
    const arara = p.celulas[0].map(() => vazia());
    arara[0] = vazia('Arara'); arara[1] = vazia('8'); arara[2] = vazia('3'); arara[4] = vazia('1080');
    p = { ...p, celulas: [...p.celulas.slice(0, 5), arara, ...p.celulas.slice(5)] };
    p = {
      ...p,
      celulas: excluirColunaDe(p.celulas, 3),
      larguras: p.larguras.filter((_, i) => i !== 3),
    };

    // alinhar e mesclar o título por cima da tabela, que agora tem quatro colunas
    p = {
      ...p,
      celulas: refazerMesclagens(p.celulas.map((l, i) => (i !== 0 ? l : l.map((c, j) => (j === 0
        ? { ...c, h: 'centro' as const, v: 'meio' as const, span: larguraDaTabela(p) }
        : { ...c, coberta: j <= 3, texto: j <= 3 ? '' : c.texto })))))
    };

    // layout e fórmulas
    p = { ...p, layout: 'automatico' };
    p = {
      ...p,
      celulas: p.celulas.map((l, i) => (i !== 7 ? l : l.map((c, j) => {
        if (j === 1) return { ...c, texto: '=SOMA(B3:B6)' };
        if (j === 3) return { ...c, texto: '=MÉDIA(D3:D6)' };
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
  O enunciado promete uma coluna vazia para excluir, e é preciso que ela exista
  — e que seja *uma* só dentro da tabela.

  Foi assim que o defeito apareceu da primeira vez: a tarefa mandava tirar "a
  coluna vazia depois de Total", e a planilha tinha quatro colunas, todas
  usadas. A pessoa procurava, não achava, e a lista continuava vermelha sem nada
  explicando.

  Da segunda vez o defeito seria o contrário: a grade cresceu para o tamanho de
  uma planilha de verdade, e "a coluna vazia depois de Total" passou a nomear
  sete colunas ao mesmo tempo. Por isso a coluna vazia mudou de lugar e foi para
  o meio da tabela, onde volta a ser única — e é este teste que garante que ela
  continua sendo.

  Montar o estado vencedor à mão não pega nada disso: quem monta já sabe qual
  coluna tirar. Quem precisa ser conferida é a premissa do enunciado.
*/
describe('o enunciado da planilha descreve a planilha que existe', () => {
  const dentroDaTabela = Array.from(
    { length: larguraDaTabela(PLANILHA_INICIAL) }, (_, c) => c);

  it('há exatamente uma coluna vazia dentro da tabela, e ela está no meio', () => {
    const vazias = dentroDaTabela
      .filter(c => PLANILHA_INICIAL.celulas.every(l => l[c].texto.trim() === ''));
    expect(vazias, 'a tarefa manda excluir a coluna vazia do meio da tabela').toHaveLength(1);
    const unica = vazias[0];
    expect(unica, 'a coluna vazia não pode ser a primeira nem a última da tabela')
      .toBeGreaterThan(0);
    expect(unica).toBeLessThan(dentroDaTabela.length - 1);
  });

  it('ela separa Diárias de Total, que é o que o enunciado diz', () => {
    const cabecalho = PLANILHA_INICIAL.celulas[1].map(c => c.texto.trim());
    const diarias = cabecalho.indexOf('Diárias');
    const total = cabecalho.indexOf('Total');
    expect(total, 'Total não está logo depois da coluna vazia').toBe(diarias + 2);
    expect(cabecalho[diarias + 1], 'a coluna do meio não está vazia').toBe('');
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
      celulas: excluirColunaDe(comArara.celulas, 3),
      larguras: comArara.larguras.filter((_, i) => i !== 3),
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


/*
  A faixa, a mesclagem e o alinhamento padrão.

  Os três nasceram do mesmo buraco: a planilha não tinha seleção de faixa. Sem
  ela, mesclar só sabia ir "daqui até o fim da linha" — e o enunciado, que
  manda mesclar de A1 até a última coluna da tabela, pedia uma coisa que a tela
  não fazia. Excluir uma coluna de dentro de um título mesclado é o caso que
  não se vê clicando, e é o que o exercício pede na ordem em que pede.
*/
describe('a faixa de células', () => {
  it('sabe dizer o próprio nome, de uma célula ou de um retângulo', () => {
    expect(nomeDaFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 })).toBe('A1');
    expect(nomeDaFaixa({ l1: 0, c1: 0, l2: 0, c2: 3 })).toBe('A1:D1');
    /* Arrastar da direita para a esquerda dá o mesmo retângulo: quem seleciona
       de trás para a frente não pode ver um nome invertido. */
    expect(nomeDaFaixa({ l1: 2, c1: 3, l2: 0, c2: 0 })).toBe('A1:D3');
  });

  it('sabe quem está dentro dela', () => {
    const f = { l1: 0, c1: 0, l2: 0, c2: 3 };
    expect(naFaixa(f, 0, 2)).toBe(true);
    expect(naFaixa(f, 0, 4)).toBe(false);
    expect(naFaixa(f, 1, 2)).toBe(false);
  });
});

describe('a mesclagem tem o tamanho que foi pedido', () => {
  const linhaDe = (n: number) => Array.from({ length: n }, () => vazia());

  it('refazer preserva o span, e não estica até o fim da linha', () => {
    /* Era isto que acontecia antes: qualquer mesclagem virava "até o fim", e
       por isso a única mesclagem possível era essa. */
    const linha = linhaDe(8);
    linha[0] = { ...linha[0], span: 4 };
    const [refeita] = refazerMesclagens([linha]);
    expect(refeita[0].span, 'a mesclagem esticou sozinha').toBe(4);
    expect(refeita.slice(1, 4).every(c => c.coberta)).toBe(true);
    expect(refeita[4].coberta, 'cobriu uma célula fora da mesclagem').toBe(false);
  });

  it('apara a mesclagem que não cabe mais na linha', () => {
    const linha = linhaDe(3);
    linha[1] = { ...linha[1], span: 9 };
    const [refeita] = refazerMesclagens([linha]);
    expect(refeita[1].span).toBe(2);
  });

  it('excluir uma coluna de dentro do título encolhe o título em um', () => {
    const linha = linhaDe(6);
    linha[0] = { ...linha[0], texto: 'Orçamento', span: 5 };
    const [depois] = excluirColunaDe(refazerMesclagens([linha]), 3);
    expect(depois[0].span, 'o título ficou grande demais para a tabela').toBe(4);
    expect(depois).toHaveLength(5);
  });

  it('inserir uma coluna dentro do título aumenta o título em um', () => {
    const linha = linhaDe(6);
    linha[0] = { ...linha[0], texto: 'Orçamento', span: 4 };
    const [depois] = inserirColunaEm(refazerMesclagens([linha]), 2);
    expect(depois[0].span).toBe(5);
    expect(depois).toHaveLength(7);
  });

  it('coluna excluída fora do título não mexe nele', () => {
    const linha = linhaDe(8);
    linha[0] = { ...linha[0], span: 3 };
    const [depois] = excluirColunaDe(refazerMesclagens([linha]), 6);
    expect(depois[0].span).toBe(3);
  });
});

describe('número vai para a direita e texto para a esquerda', () => {
  /*
    É a diferença que diz que a planilha entendeu o que foi digitado, e é como
    se descobre número guardado como texto — o defeito mais comum de planilha.
    Tudo nascia à esquerda, e essa informação não chegava a existir.
  */
  it('sem ninguém escolher, o padrão segue o conteúdo', () => {
    expect(alinhamentoDe(vazia('Falcão'), 'Falcão')).toBe('esquerda');
    expect(alinhamentoDe(vazia('12'), '12')).toBe('direita');
    expect(alinhamentoDe(vazia('1.620,50'), '1620,50')).toBe('direita');
    expect(alinhamentoDe(vazia(''), '')).toBe('esquerda');
  });

  it('a fórmula segue o resultado, e não o que está escrito', () => {
    /* =SOMA(...) começa por "=" e não é número; o que se vê é o total, e é
       ele que decide o lado — como na planilha de verdade. */
    expect(alinhamentoDe(vazia('=SOMA(B3:B6)'), '40')).toBe('direita');
    expect(alinhamentoDe(vazia('=SOMA(B3:B6)'), '#NOME?')).toBe('esquerda');
  });

  it('quem escolhe o alinhamento ganha do padrão', () => {
    expect(alinhamentoDe({ ...vazia('12'), h: 'centro' }, '12')).toBe('centro');
    expect(alinhamentoDe({ ...vazia('Falcão'), h: 'direita' }, 'Falcão')).toBe('direita');
  });
});

describe('a grade é maior do que a tabela', () => {
  /*
    A grade tinha o tamanho exato dos dados, e na tela aparecia uma tabelinha
    solta num vazio branco. Planilha de verdade tem grade até a borda da
    janela — e é por isso que "a tabela" passou a ser uma medida à parte.
  */
  it('sobra grade à direita e embaixo da tabela', () => {
    expect(PLANILHA_INICIAL.celulas[0].length)
      .toBeGreaterThan(larguraDaTabela(PLANILHA_INICIAL) + 2);
    expect(PLANILHA_INICIAL.celulas.length).toBeGreaterThan(12);
  });

  it('a largura da tabela ignora a grade vazia em volta', () => {
    expect(larguraDaTabela(PLANILHA_INICIAL)).toBe(5);
  });
});
