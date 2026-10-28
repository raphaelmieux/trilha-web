import { describe, it, expect } from 'vitest';
import { PLANILHA_INICIAL, vazia, nomeDaFaixa, type Planilha } from './metasDaAp043';
import {
  mover, proxima, escrever, limpar, copiar, colar,
  inserirLinha, excluirLinha, inserirColuna, excluirColuna,
  mesclar, desmesclar, mesclagemApaga,
  historicoDe, registrar, desfazer, refazer, PASSOS_GUARDADOS,
  linhaEscondida, estiloCondicional, ordenar, preencherAbaixo, preencherADireita,
  valorDaGrade, planilhaAtiva, trocarAtiva, planilhaPorNome,
  moverOuCopiar, renomearAba, substituir, removerDuplicatas, planilhaDe,
  pontosDoGrafico, pontosDaDispersao, valorDe,
} from './planilha';
import { mostrar } from './formulas';

/*
  O teclado e a área de transferência da planilha.

  Existem porque o defeito que os trouxe não aparecia em teste nenhum: escrever
  na barra de fórmulas aceitava um caractere e perdia o foco, e a suíte inteira
  passava — nenhum teste digitava. Estas travas digitam.
*/

const p0 = PLANILHA_INICIAL;
const cel = (p: Planilha, l: number, c: number) => p.celulas[l][c].texto;
const uma = (l: number, c: number) => ({ l1: l, c1: c, l2: l, c2: c });

describe('andar pela grade', () => {
  it('a seta move o cursor e recolhe a faixa', () => {
    expect(nomeDaFaixa(mover(p0, uma(2, 2), 'baixo'))).toBe('C4');
    expect(nomeDaFaixa(mover(p0, { l1: 0, c1: 0, l2: 3, c2: 3 }, 'baixo'))).toBe('A2');
  });

  it('shift+seta estende a partir da âncora, e não da última visitada', () => {
    let f = uma(0, 0);
    f = mover(p0, f, 'direita', true);
    f = mover(p0, f, 'direita', true);
    f = mover(p0, f, 'direita', true);
    expect(nomeDaFaixa(f)).toBe('A1:D1');
    /* Voltando, a faixa encolhe — o que só acontece se a âncora ficou parada. */
    f = mover(p0, f, 'esquerda', true);
    expect(nomeDaFaixa(f)).toBe('A1:C1');
  });

  it('não sai da grade pelas bordas', () => {
    expect(nomeDaFaixa(mover(p0, uma(0, 0), 'cima'))).toBe('A1');
    expect(nomeDaFaixa(mover(p0, uma(0, 0), 'esquerda'))).toBe('A1');
    const ultima = uma(p0.celulas.length - 1, p0.celulas[0].length - 1);
    expect(mover(p0, ultima, 'baixo')).toEqual(ultima);
    expect(mover(p0, ultima, 'direita')).toEqual(ultima);
  });

  it('Enter e Tab andam a partir da âncora, mesmo com faixa aberta', () => {
    /* No Excel, Enter com faixa selecionada não desce a partir do canto de
       baixo: ele anda dentro da seleção a partir de onde o cursor está. */
    const f = { l1: 1, c1: 1, l2: 4, c2: 3 };
    expect(nomeDaFaixa(proxima(p0, f, 'baixo'))).toBe('B3');
    expect(nomeDaFaixa(proxima(p0, f, 'direita'))).toBe('C2');
  });
});

describe('escrever e limpar', () => {
  it('escreve a palavra inteira, e não uma letra', () => {
    const p = escrever(p0, 6, 0, 'Arara');
    expect(cel(p, 6, 0)).toBe('Arara');
  });

  it('Delete limpa o conteúdo da faixa e deixa a formatação', () => {
    let p = escrever(p0, 2, 0, 'Falcão');
    p = { ...p, celulas: p.celulas.map((l, i) => (i !== 2 ? l : l.map(c => ({ ...c, negrito: true })))) };
    const limpa = limpar(p, { l1: 2, c1: 0, l2: 2, c2: 2 });
    expect(cel(limpa, 2, 0)).toBe('');
    expect(cel(limpa, 2, 4)).toBe('1620');
    expect(limpa.celulas[2][0].negrito, 'Delete levou o negrito junto').toBe(true);
  });
});

describe('copiar e colar', () => {
  it('cola o recorte inteiro a partir do canto da faixa', () => {
    const recorte = copiar(p0, { l1: 2, c1: 0, l2: 2, c2: 2 });
    const p = colar(p0, uma(10, 0), recorte);
    expect([cel(p, 10, 0), cel(p, 10, 1), cel(p, 10, 2)]).toEqual(['Falcão', '12', '3']);
  });

  it('o que não cabe na grade é descartado, sem estourar', () => {
    const recorte = copiar(p0, { l1: 2, c1: 0, l2: 4, c2: 2 });
    const ultima = p0.celulas.length - 1;
    const p = colar(p0, uma(ultima, 0), recorte);
    expect(cel(p, ultima, 0)).toBe('Falcão');
    expect(p.celulas).toHaveLength(p0.celulas.length);
  });

  it('copiar não muda a planilha de origem', () => {
    copiar(p0, { l1: 2, c1: 0, l2: 2, c2: 2 });
    expect(cel(p0, 2, 0)).toBe('Falcão');
  });
});

describe('linhas e colunas', () => {
  it('inserir linha empurra o resto para baixo', () => {
    const p = inserirLinha(p0, 3);
    expect(cel(p, 3, 0)).toBe('');
    expect(cel(p, 4, 0)).toBe('Águia');
    expect(p.alturas).toHaveLength(p0.alturas.length + 1);
  });

  it('excluir linha tira a linha e a altura dela', () => {
    const p = excluirLinha(p0, 2)!;
    expect(cel(p, 2, 0)).toBe('Águia');
    expect(p.alturas).toHaveLength(p0.alturas.length - 1);
  });

  it('recusa esvaziar a grade', () => {
    const mini: Planilha = { ...p0, celulas: [[vazia()], [vazia()]], alturas: [24, 24], larguras: [92] };
    expect(excluirLinha(mini, 0), 'deixou a grade sem linha').toBeNull();
    expect(excluirColuna(mini, 0), 'deixou a grade sem coluna').toBeNull();
  });

  it('inserir e excluir coluna levam a largura junto', () => {
    const p = inserirColuna(p0, 2);
    expect(p.larguras).toHaveLength(p0.larguras.length + 1);
    const q = excluirColuna(p, 2)!;
    expect(q.larguras).toHaveLength(p0.larguras.length);
    expect(q.celulas[1].map(c => c.texto).slice(0, 5))
      .toEqual(['Unidade', 'Inscritos', 'Diárias', '', 'Total']);
  });
});

describe('mesclar', () => {
  it('recusa mesclar uma célula sozinha', () => {
    expect(mesclar(p0, uma(0, 0)), 'mesclou uma célula com ela mesma').toBeNull();
  });

  it('mescla a faixa que recebeu, e não até o fim da linha', () => {
    const p = mesclar(p0, { l1: 0, c1: 0, l2: 0, c2: 3 })!;
    expect(p.celulas[0][0].span).toBe(4);
    expect(p.celulas[0][4].coberta, 'passou da faixa').toBe(false);
  });

  it('avisa quando a mesclagem vai apagar alguma coisa', () => {
    expect(mesclagemApaga(p0, { l1: 1, c1: 0, l2: 1, c2: 4 })).toBe(true);
    expect(mesclagemApaga(p0, { l1: 0, c1: 0, l2: 0, c2: 3 })).toBe(false);
  });

  it('desmesclar devolve as células, vazias', () => {
    const p = desmesclar(mesclar(p0, { l1: 1, c1: 0, l2: 1, c2: 4 })!, { l1: 1, c1: 0, l2: 1, c2: 4 });
    expect(p.celulas[1].map(c => c.span).slice(0, 5)).toEqual([1, 1, 1, 1, 1]);
    expect(cel(p, 1, 1), 'o que a mesclagem apagou não volta').toBe('');
  });
});

describe('desfazer e refazer', () => {
  it('desfaz o último passo e refaz de volta', () => {
    let h = historicoDe(p0);
    h = registrar(h, escrever(h.presente, 6, 0, 'Arara'));
    expect(cel(h.presente, 6, 0)).toBe('Arara');
    h = desfazer(h);
    expect(cel(h.presente, 6, 0)).toBe('');
    h = refazer(h);
    expect(cel(h.presente, 6, 0)).toBe('Arara');
  });

  it('fazer algo novo depois de desfazer descarta o que havia à frente', () => {
    let h = historicoDe(p0);
    h = registrar(h, escrever(h.presente, 6, 0, 'Arara'));
    h = desfazer(h);
    h = registrar(h, escrever(h.presente, 6, 0, 'Tuiuiú'));
    expect(h.futuro, 'refazer devolveria um estado que não existe mais').toEqual([]);
    expect(refazer(h).presente).toBe(h.presente);
  });

  it('desfazer no começo e refazer no fim não fazem nada', () => {
    const h = historicoDe(p0);
    expect(desfazer(h)).toBe(h);
    expect(refazer(h)).toBe(h);
  });

  it('o histórico tem fundo', () => {
    let h = historicoDe(p0);
    for (let i = 0; i < PASSOS_GUARDADOS + 15; i++) {
      h = registrar(h, escrever(h.presente, 6, 0, String(i)));
    }
    expect(h.passado).toHaveLength(PASSOS_GUARDADOS);
  });
});

/*
  O que a CC-ES003 acrescentou ao modelo: filtro, formatação condicional,
  ordenação e a alça de preenchimento.

  As quatro erram calado se escritas do jeito óbvio, e as quatro são o assunto
  de uma lição inteira — é por isso que elas são funções puras e não um `if`
  dentro de um `onClick`.
*/

const comTabela = (linhas: string[][], tabela = { l1: 0, c1: 0, l2: linhas.length - 1, c2: 3 }): Planilha => ({
  ...p0,
  celulas: p0.celulas.map((linha, l) => linha.map((_, j) => vazia(linhas[l]?.[j] ?? ''))),
  tabela,
});

const UNIDADES = [
  ['Unidade', 'Inscritos', 'Diárias', 'Total'],
  ['Tucano', '11', '3', '=B2*C2*45'],
  ['Falcão', '12', '3', '=B3*C3*45'],
  ['Águia', '9', '3', '=B4*C4*45'],
];

describe('o filtro esconde linha, e nunca apaga nenhuma', () => {
  const p = { ...comTabela(UNIDADES), filtro: { coluna: 0, valor: 'Falcão' } };

  it('esconde o que não casa e deixa o que casa', () => {
    expect(linhaEscondida(p, 1)).toBe(true);
    expect(linhaEscondida(p, 2)).toBe(false);
    expect(linhaEscondida(p, 3)).toBe(true);
  });

  /*
    O cabeçalho nunca some. Sem ele não haveria onde clicar para tirar o
    filtro, e a tabela ficaria escondida para sempre — o desbravador veria a
    planilha vazia e concluiria que apagou tudo.
  */
  it('mas o cabeçalho fica, senão não há como desfazer o filtro', () => {
    expect(linhaEscondida(p, 0)).toBe(false);
  });

  it('e a linha escondida continua na conta, que é a lição inteira', () => {
    expect(mostrar(valorDaGrade(p, 1, 3))).toBe('1485');
    expect(valorDaGrade(p, 2, 3)).toEqual({ tipo: 'numero', n: 1620 });
  });

  it('fora da tabela e sem filtro, nada se esconde', () => {
    expect(linhaEscondida({ ...p, filtro: { coluna: 0, valor: '' } }, 1)).toBe(false);
    expect(linhaEscondida({ ...p, tabela: null }, 1)).toBe(false);
    expect(linhaEscondida(p, 9)).toBe(false);
  });
});

describe('a formatação condicional pinta o que a regra diz', () => {
  const comRegra = (quando: 'maiorQue' | 'menorQue' | 'igualA' | 'contemTexto', valor: string, estilo = 'vermelho' as const) => ({
    ...comTabela(UNIDADES),
    regras: [{ id: 'r1', faixa: { l1: 1, c1: 1, l2: 3, c2: 1 }, quando, valor, estilo }],
  });

  it('pinta pelo valor, e só dentro da faixa da regra', () => {
    const p = comRegra('maiorQue', '10');
    expect(estiloCondicional(p, 1, 1)).toBe('vermelho');
    expect(estiloCondicional(p, 3, 1)).toBeNull();
    expect(estiloCondicional(p, 1, 3)).toBeNull();
  });

  it('e lê o resultado da fórmula, e não o texto dela', () => {
    const p = {
      ...comTabela(UNIDADES),
      regras: [{ id: 'r1', faixa: { l1: 1, c1: 3, l2: 3, c2: 3 }, quando: 'maiorQue' as const, valor: '1500', estilo: 'vermelho' as const }],
    };
    /* Tucano 1485, Falcão 1620, Águia 1215 — e a regra é "maior que 1500".
       Quem lesse o texto da fórmula não acharia número nenhum e não pintaria
       nada; quem lesse o texto como se fosse valor pintaria as três iguais. */
    expect(estiloCondicional(p, 2, 3)).toBe('vermelho');
    expect(estiloCondicional(p, 1, 3)).toBeNull();
    expect(estiloCondicional(p, 3, 3)).toBeNull();
  });

  /*
    A célula vazia vale **zero** na comparação numérica, e isso é o Excel — uma
    das reclamações mais antigas que a formatação condicional tem: "menor que
    10" pinta a metade em branco da coluna.

    A primeira versão daqui a excluía, e estava errada nos dois sentidos. Era
    código morto, porque a guarda de valor em branco já cobria tudo o que ela
    alcançava — a mutação que a apagou não derrubou teste nenhum, que é como
    ela foi descoberta. E era mentira sobre o programa: o desbravador aplicaria
    a mesma regra no computador do clube e veria a coluna acender inteira, sem
    nada aqui tendo avisado.
  */
  it('a célula vazia vale zero, e "menor que" pinta a coluna em branco', () => {
    const p = {
      ...comTabela(UNIDADES),
      regras: [{ id: 'r1', faixa: { l1: 1, c1: 1, l2: 9, c2: 1 }, quando: 'menorQue' as const, valor: '10', estilo: 'vermelho' as const }],
    };
    expect(estiloCondicional(p, 3, 1)).toBe('vermelho');
    expect(estiloCondicional(p, 6, 1)).toBe('vermelho');
    /* E "maior que 0" não a pega, porque zero não é maior que zero. */
    const maior = {
      ...p,
      regras: [{ id: 'r1', faixa: { l1: 1, c1: 1, l2: 9, c2: 1 }, quando: 'maiorQue' as const, valor: '0', estilo: 'vermelho' as const }],
    };
    expect(estiloCondicional(maior, 6, 1)).toBeNull();
  });

  /*
    Célula com erro fica de fora: uma regra sobre texto não é sobre `#DIV/0!`.
    Sem isto, quem escreveu "contém DIV" para achar "Divisão de tarefas" veria
    pintada uma célula que não tem essa palavra em lugar nenhum.
  */
  it('e a célula com erro não casa com regra de texto', () => {
    const comErro = comTabela([...UNIDADES, ['Arara', '=1/0', '3', '']]);
    const p = {
      ...comErro,
      regras: [{ id: 'r1', faixa: { l1: 1, c1: 1, l2: 4, c2: 1 }, quando: 'contemTexto' as const, valor: 'DIV', estilo: 'amarelo' as const }],
    };
    expect(estiloCondicional(p, 4, 1)).toBeNull();
  });

  /*
    Regra sem valor de comparação não casa com nada, e é a armadilha do vazio
    outra vez: `Number('')` é **zero**, e não NaN. Uma regra "maior que" com o
    campo em branco pintaria toda célula positiva da faixa; uma "igual a" em
    branco pintaria todas as vazias. Nos dois casos a planilha fica colorida e
    a regra parece ter funcionado.
  */
  it('e regra com o campo de comparação em branco não pinta nada', () => {
    const faixa = { l1: 1, c1: 1, l2: 9, c2: 1 };
    const semValor = (quando: 'maiorQue' | 'igualA') => estiloCondicional({
      ...comTabela(UNIDADES),
      regras: [{ id: 'r1', faixa, quando, valor: '', estilo: 'vermelho' as const }],
    }, quando === 'igualA' ? 6 : 1, 1);
    expect(semValor('maiorQue')).toBeNull();
    expect(semValor('igualA')).toBeNull();
  });

  /*
    A última regra que casa é a que vale, como no Excel. Devolver a primeira
    faria a regra recém-criada não pintar nada, e quem acabou de criá-la
    concluiria que ela não funciona.
  */
  it('quando duas regras casam, vale a de baixo', () => {
    const p = {
      ...comTabela(UNIDADES),
      regras: [
        { id: 'r1', faixa: { l1: 1, c1: 1, l2: 3, c2: 1 }, quando: 'maiorQue' as const, valor: '5', estilo: 'verde' as const },
        { id: 'r2', faixa: { l1: 1, c1: 1, l2: 3, c2: 1 }, quando: 'maiorQue' as const, valor: '10', estilo: 'vermelho' as const },
      ],
    };
    expect(estiloCondicional(p, 1, 1)).toBe('vermelho');
    expect(estiloCondicional(p, 3, 1)).toBe('verde');
  });

  it('e "contém texto" não casa com regra de texto vazio', () => {
    const p = {
      ...comTabela(UNIDADES),
      regras: [{ id: 'r1', faixa: { l1: 1, c1: 0, l2: 3, c2: 0 }, quando: 'contemTexto' as const, valor: '', estilo: 'amarelo' as const }],
    };
    expect(estiloCondicional(p, 1, 0)).toBeNull();
  });
});

describe('ordenar mexe nos dados, e leva a linha inteira', () => {
  /*
    Ordenar só a coluna escolhida embaralha o cadastro: o nome de uma unidade
    passa a ficar ao lado do número de inscritos de outra, sem erro nenhum e
    sem volta. É o estrago mais caro que uma planilha sofre.
  */
  it('a linha viaja junto com a chave', () => {
    const p = ordenar(comTabela(UNIDADES), 1, true);
    expect(p.celulas.slice(1, 4).map(l => [l[0].texto, l[1].texto]))
      .toEqual([['Águia', '9'], ['Tucano', '11'], ['Falcão', '12']]);
  });

  it('o cabeçalho fica onde está', () => {
    expect(ordenar(comTabela(UNIDADES), 0, true).celulas[0][0].texto).toBe('Unidade');
  });

  it('ordena texto pela ordem do português, e número por tamanho', () => {
    const porNome = ordenar(comTabela(UNIDADES), 0, true);
    expect(porNome.celulas.slice(1, 4).map(l => l[0].texto)).toEqual(['Águia', 'Falcão', 'Tucano']);
    const decrescente = ordenar(comTabela(UNIDADES), 1, false);
    expect(decrescente.celulas[1][1].texto).toBe('12');
  });

  it('e guarda qual coluna, que é de onde sai a setinha do cabeçalho', () => {
    expect(ordenar(comTabela(UNIDADES), 1, false).ordenacao).toEqual({ coluna: 1, crescente: false });
  });

  it('sem tabela declarada, não ordena nada', () => {
    const p = { ...comTabela(UNIDADES), tabela: null };
    expect(ordenar(p, 1, true).celulas[1][0].texto).toBe('Tucano');
  });
});

describe('a alça de preenchimento anda com a fórmula', () => {
  /*
    É o requisito 4.3 virando gesto: a relativa anda junto, a travada fica.
    Uma alça que copiasse o texto sem transpor faria todas as linhas mostrarem
    o resultado da primeira — três totais iguais, plausíveis, e errados.
  */
  it('a referência relativa anda linha a linha', () => {
    const p = preencherAbaixo(comTabela(UNIDADES), { l: 1, c: 3 }, 3);
    expect(p.celulas[2][3].texto).toBe('=B3*C3*45');
    expect(p.celulas[3][3].texto).toBe('=B4*C4*45');
  });

  it('e a travada com cifrão fica onde está', () => {
    const base = comTabela([
      ['Diária', '45'],
      ['Unidade', 'Inscritos', 'Diárias', 'Total'],
      ['Tucano', '11', '3', '=B3*C3*$B$1'],
      ['Falcão', '12', '3', ''],
    ]);
    const p = preencherAbaixo(base, { l: 2, c: 3 }, 3);
    expect(p.celulas[3][3].texto).toBe('=B4*C4*$B$1');
    expect(mostrar(valorDaGrade(p, 3, 3))).toBe('1620');
  });

  it('o que não é fórmula se copia como está', () => {
    const p = preencherAbaixo(comTabela(UNIDADES), { l: 1, c: 2 }, 3);
    expect(p.celulas[3][2].texto).toBe('3');
  });

  it('e preencher para cima ou para lugar nenhum não muda nada', () => {
    const base = comTabela(UNIDADES);
    expect(preencherAbaixo(base, { l: 3, c: 3 }, 1)).toBe(base);
  });
});

describe('a pasta de trabalho tem várias planilhas', () => {
  const cad = {
    planilhas: [
      { ...p0, nome: 'Inscrições' },
      { ...p0, nome: 'Orçamento' },
    ],
    ativa: 1,
  };

  it('a ativa é a da aba escolhida, e trocar só mexe nela', () => {
    expect(planilhaAtiva(cad).nome).toBe('Orçamento');
    const depois = trocarAtiva(cad, escrever(planilhaAtiva(cad), 0, 0, 'oi'));
    expect(depois.planilhas[1].celulas[0][0].texto).toBe('oi');
    expect(depois.planilhas[0].celulas[0][0].texto).toBe(cad.planilhas[0].celulas[0][0].texto);
  });

  it('e a planilha se acha pelo nome', () => {
    expect(planilhaPorNome(cad, 'Inscrições')?.nome).toBe('Inscrições');
    expect(planilhaPorNome(cad, 'Planilha9')).toBeNull();
  });
});

describe('a alça também anda para o lado', () => {
  /*
    Arrastar só para baixo ensinaria que a alça tem uma direção só, e é
    arrastando para o lado que o outro cifrão passa a importar: descendo,
    trava-se a linha; indo para o lado, trava-se a coluna.
  */
  it('a referência anda de coluna, e a travada fica', () => {
    const base = comTabela([
      ['', 'Março', 'Abril', 'Maio'],
      ['Gasto', '10', '20', '30'],
      ['Dobro', '=B2*2'],
    ]);
    const p = preencherADireita(base, { l: 2, c: 1 }, 3);
    expect(p.celulas[2][2].texto).toBe('=C2*2');
    expect(p.celulas[2][3].texto).toBe('=D2*2');
    expect(mostrar(valorDaGrade(p, 2, 3))).toBe('60');
  });

  it('com a coluna travada, ela não anda', () => {
    const base = comTabela([['5', '', '', ''], ['', '=$A$1*2']]);
    expect(preencherADireita(base, { l: 1, c: 1 }, 3).celulas[1][3].texto).toBe('=$A$1*2');
  });

  it('e para a esquerda ou para lugar nenhum não muda nada', () => {
    const base = comTabela([['1', '2']]);
    expect(preencherADireita(base, { l: 0, c: 1 }, 0)).toBe(base);
  });
});

/*
  Os comandos de pasta e de limpeza da CC-ES013.

  Cada um tem um caminho errado que o Excel de verdade tem, e a trava confere
  que ele continua existindo: uma simulação que só soubesse fazer o certo
  ensinaria que o programa protege de um erro que ele não protege.
*/
describe('mover ou copiar uma aba', () => {
  const pasta = () => ({
    planilhas: [planilhaDe('Bruta', [['x']]), planilhaDe('Notas', [['y']])],
    ativa: 0,
  });

  it('com a caixa marcada, nasce uma cópia ao lado, com outro nome, e ela fica ativa', () => {
    const cad = moverOuCopiar(pasta(), 0, 1, true);
    expect(cad.planilhas.map(p => p.nome)).toEqual(['Bruta', 'Bruta (2)', 'Notas']);
    expect(cad.ativa).toBe(1);
    expect(moverOuCopiar(cad, 0, 1, true).planilhas.map(p => p.nome))
      .toEqual(['Bruta', 'Bruta (3)', 'Bruta (2)', 'Notas']);
  });

  it('a cópia não divide célula com a original: escrever numa não muda a outra', () => {
    const cad = moverOuCopiar(pasta(), 0, 1, true);
    const mexida = trocarAtiva(cad, escrever(planilhaAtiva(cad), 0, 0, 'mudou'));
    expect(cel(planilhaPorNome(mexida, 'Bruta')!, 0, 0)).toBe('x');
  });

  it('com a caixa desmarcada, ela só troca de lugar — e nenhuma cópia existe', () => {
    const cad = moverOuCopiar(pasta(), 0, 2, false);
    expect(cad.planilhas.map(p => p.nome)).toEqual(['Notas', 'Bruta']);
    expect(planilhaAtiva(cad).nome).toBe('Bruta');
  });
});

describe('renomear uma aba', () => {
  const pasta = { planilhas: [planilhaDe('Bruta', []), planilhaDe('Bruta (2)', [])], ativa: 1 };

  it('troca o nome', () => {
    const cad = renomearAba(pasta, 1, '  Tratada ');
    expect(typeof cad === 'string' ? cad : cad.planilhas[1].nome).toBe('Tratada');
  });

  it('recusa com uma frase, e cada recusa diz o seu porquê', () => {
    const vazio = renomearAba(pasta, 1, '   ');
    const repetido = renomearAba(pasta, 1, 'bruta');
    const proibido = renomearAba(pasta, 1, 'Dados/2026');
    const longo = renomearAba(pasta, 1, 'x'.repeat(32));
    for (const r of [vazio, repetido, proibido, longo]) expect(typeof r).toBe('string');
    expect(new Set([vazio, repetido, proibido, longo]).size).toBe(4);
  });
});

describe('localizar e substituir', () => {
  const base = () => planilhaDe('T', [
    ['Nome', 'Unidade'],
    ['Gabriela Souza', 'aguia'],
    ['Alice Rangel', 'AGUIA'],
    ['Carla Menezes', 'Águia'],
    ['Pedro Aguiar', 'Falcão'],
  ]);
  const sem = { maiusculas: false, inteira: false };

  it('sem maiúsculas acha AGUIA e aguia, e não acha Águia: acento é outra letra', () => {
    const { planilha, trocas } = substituir(base(), 'aguia', 'Águia', { maiusculas: false, inteira: true });
    expect(trocas).toBe(2);
    expect([1, 2, 3].map(l => cel(planilha, l, 1))).toEqual(['Águia', 'Águia', 'Águia']);
  });

  it('com maiúsculas, só o que está escrito igualzinho', () => {
    expect(substituir(base(), 'aguia', 'Águia', { maiusculas: true, inteira: true }).trocas).toBe(1);
  });

  it('sem célula inteira e na planilha toda, o Pedro Aguiar vira Águiar — sem aviso', () => {
    const { planilha } = substituir(base(), 'aguia', 'Águia', sem);
    expect(cel(planilha, 4, 0)).toBe('Pedro Águiar');
  });

  it('com a coluna selecionada, o alcance é a seleção, e o nome fica de pé', () => {
    const { planilha } = substituir(base(), 'aguia', 'Águia', sem, { l1: 1, c1: 1, l2: 4, c2: 1 });
    expect(cel(planilha, 4, 0)).toBe('Pedro Aguiar');
    expect(cel(planilha, 1, 1)).toBe('Águia');
  });

  it('uma célula só selecionada quer dizer a planilha inteira, como no Excel', () => {
    const { planilha } = substituir(base(), 'aguia', 'Águia', sem, { l1: 1, c1: 1, l2: 1, c2: 1 });
    expect(cel(planilha, 4, 0)).toBe('Pedro Águiar');
  });

  it('$& no campo de substituir é texto, e não padrão', () => {
    const { planilha } = substituir(base(), 'Falcão', 'R$&', { maiusculas: true, inteira: true });
    expect(cel(planilha, 4, 1)).toBe('R$&');
  });

  it('procurar o vazio não troca nada', () => {
    expect(substituir(base(), '', 'x', sem).trocas).toBe(0);
  });
});

describe('remover duplicatas', () => {
  const comTabela = (linhas: string[][]) => planilhaDe('T', linhas, {
    tabela: { l1: 0, c1: 0, l2: linhas.length - 1, c2: linhas[0].length - 1 },
  });
  const tudo = [0, 1, 2];

  it('antes de padronizar a grafia, não acha a linha repetida', () => {
    const p = comTabela([
      ['Nome', 'Unidade', 'Idade'],
      ['Carla Menezes', 'Águia', '14'],
      ['Carla Menezes', 'aguia', '14'],
    ]);
    expect(removerDuplicatas(p, tudo).removidas).toBe(0);
  });

  it('maiúscula não separa duas linhas; a de cima fica, a de baixo sai, e a tabela encolhe', () => {
    const p = comTabela([
      ['Nome', 'Unidade', 'Idade'],
      ['Carla Menezes', 'Águia', '14'],
      ['Bruno Costa', 'Falcão', '12'],
      ['carla menezes', 'ÁGUIA', '14'],
      ['Lara Cunha', 'Águia', '13'],
    ]);
    const { planilha, removidas } = removerDuplicatas(p, tudo);
    expect(removidas).toBe(1);
    expect([1, 2, 3].map(l => cel(planilha, l, 0))).toEqual(['Carla Menezes', 'Bruno Costa', 'Lara Cunha']);
    expect(cel(planilha, 4, 0)).toBe('');
    expect(planilha.tabela?.l2).toBe(3);
  });

  it('desmarcar tudo menos o nome apaga a homônima, que é outra pessoa', () => {
    const p = comTabela([
      ['Nome', 'Unidade', 'Idade'],
      ['Ana Clara Ribeiro', 'Tucano', ''],
      ['Ana Clara Ribeiro', 'Arara', '10'],
    ]);
    expect(removerDuplicatas(p, tudo).removidas).toBe(0);
    expect(removerDuplicatas(p, [0]).removidas).toBe(1);
  });
});

describe('o gráfico lê a conta que atravessa a aba', () => {
  /*
    A tabela de resumo mora numa aba e lê a base de outra: é o arranjo de toda
    vereda de análise. O desenho lia cada célula como se a pasta tivesse uma aba
    só, e `Base!B2` virava a B2 da própria aba de resumo — um número plausível
    e errado no gráfico, ao lado de uma célula que mostrava o certo.
  */
  const base = planilhaDe('Base', [['Modo', 'Presenças'], ['Carona', '17'], ['Ônibus', '10'], ['Carona', '15']]);
  const resumo = planilhaDe('Resumo', [
    ['Modo', 'Quantos'],
    ['Carona', '=CONT.SE(Base!A2:A4;A2)'],
    ['Ônibus', '=CONT.SE(Base!A2:A4;A3)'],
  ], { grafico: { tipo: 'colunas', titulo: 't', eixoX: 'x', eixoY: 'y', faixa: { l1: 1, c1: 0, l2: 2, c2: 1 } } });
  const cad = { planilhas: [base, resumo], ativa: 1 };

  it('com a pasta, desenha o que a célula mostra', () => {
    expect(pontosDoGrafico(resumo, cad)).toEqual([
      { rotulo: 'Carona', valor: 2 }, { rotulo: 'Ônibus', valor: 1 },
    ]);
  });

  it('a dispersão também', () => {
    const pares = planilhaDe('Pares', [['=Base!B2', '1'], ['=Base!B3', '2']], {
      grafico: { tipo: 'dispersao', titulo: 't', eixoX: 'x', eixoY: 'y', faixa: { l1: 0, c1: 0, l2: 1, c2: 1 } },
    });
    expect(pontosDaDispersao(pares, { planilhas: [base, pares], ativa: 1 }))
      .toEqual([{ x: 17, y: 1 }, { x: 10, y: 2 }]);
  });
});

describe('SUBTOTAL respeita o filtro, e a SOMA não', () => {
  const p = planilhaDe('Inscritos', [
    ['Unidade', 'Valor'],
    ['Falcão', '10'],
    ['Águia', '20'],
    ['Falcão', '30'],
    ['', ''],
    ['=SOMA(B2:B4)', '=SUBTOTAL(109;B2:B4)'],
  ], { tabela: { l1: 0, c1: 0, l2: 3, c2: 1 } });

  it('sem filtro, as duas dão o mesmo', () => {
    expect(valorDe(p, 5, 0)).toBe('60');
    expect(valorDe(p, 5, 1)).toBe('60');
  });

  it('com filtro, só o SUBTOTAL fica com o que está à vista', () => {
    const f = { ...p, filtro: { coluna: 0, valor: 'Falcão' } };
    expect(valorDe(f, 5, 0), 'a SOMA ignora o filtro, que é a lição').toBe('60');
    expect(valorDe(f, 5, 1)).toBe('40');
    const contagem = { ...f, celulas: f.celulas.map((l, i) => (i === 6 ? l.map((c, j) => (j === 0 ? { ...c, texto: '=SUBTOTAL(2;B2:B4)' } : c)) : l)) };
    expect(valorDe(contagem, 6, 0)).toBe('2');
  });

  it('não conta outro SUBTOTAL que caia dentro da faixa', () => {
    const q = planilhaDe('X', [['1'], ['2'], ['=SUBTOTAL(9;A1:A2)'], ['=SUBTOTAL(9;A1:A3)']]);
    expect(valorDe(q, 3, 0)).toBe('3');
  });
});
