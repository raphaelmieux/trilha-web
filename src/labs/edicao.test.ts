import { describe, it, expect } from 'vitest';
import {
  type Doc, type Paragrafo, blocoDe, campoDe, linhaDe, trechoDe, textoDoDoc, textoVisivel,
  comFormatacaoDireta, paragrafos, marcadorDaLista,
} from './documento';
import {
  type Selecao, cursorEm, inserirTexto, apagar, quebrarParagrafo, quebraDeLinha, quebraDePagina,
  alternarMarca, aplicarEstilo, formatoDaSelecao, palavraEmVolta, selecaoValida, selecionarTudo,
  textoDaSelecao, tamanhoDoParagrafo, isolarSelecao, limparFormatacao, definirTamanho, apagarSelecao,
  alternarLista, alinhar, tabular, limparTudo, fragmentoDaSelecao, colarFragmento, formatoDoParagrafoDaSelecao,
} from './edicao';

/*
  O motor de edição dos laboratórios de Word.

  Cada caso aqui é um gesto que o desbravador faz com o teclado, e que antes
  só existia como botão da faixa — ou não existia. O que as travas conferem é
  o que o Word faz com o mesmo gesto, e, junto, que os ids que as metas seguem
  ficam onde estavam.
*/

type S = 'corpo';
const doc = (...blocos: Paragrafo<S>[]): Doc<S> => ({ blocos, colunas: { corpo: 1 }, sumario: null });
const sel = (b1: string, o1: number, b2 = b1, o2 = o1): Selecao =>
  ({ ancora: { bloco: b1, offset: o1 }, foco: { bloco: b2, offset: o2 } });
const texto = (d: Doc<S>, id: string) =>
  paragrafos(d).find(b => b.id === id)!.trechos.map(x => (x.quebra ? '↵' : '') + x.texto).join('');
const ids = (d: Doc<S>) => d.blocos.map(b => b.id);

const base = () => doc(
  linhaDe('p1', 'corpo', 'Acampamento de inverno'),
  linhaDe('p2', 'corpo', 'Saída às sete'),
);

describe('digitar', () => {
  it('o caractere entra onde está o cursor, e o cursor anda junto', () => {
    const r = inserirTexto(base(), cursorEm('p1', 11), ' anual');
    expect(texto(r.doc, 'p1')).toBe('Acampamento anual de inverno');
    expect(r.selecao).toEqual(cursorEm('p1', 17));
  });

  it('digitar com seleção troca a seleção pelo texto', () => {
    const r = inserirTexto(base(), sel('p1', 15, 'p1', 22), 'verão');
    expect(texto(r.doc, 'p1')).toBe('Acampamento de verão');
  });

  it('o caractere herda a formatação de quem vem antes dele', () => {
    const d = doc(blocoDe('p1', 'corpo', [
      { ...trechoDe('a', 'Negrito'), direta: { negrito: true } },
      trechoDe('b', ' comum'),
    ]));
    const r = inserirTexto(d, cursorEm('p1', 7), '!');
    expect(r.doc.blocos[0].tipo === 'paragrafo' && r.doc.blocos[0].trechos[0].texto).toBe('Negrito!');
  });

  it('o negrito pendente vale só para o que é digitado', () => {
    const r = inserirTexto(base(), cursorEm('p2', 13), ' em ponto', undefined, { negrito: true });
    const p2 = r.doc.blocos[1] as Paragrafo<S>;
    expect(p2.trechos.map(x => [x.texto, !!x.direta?.negrito])).toEqual([['Saída às sete', false], [' em ponto', true]]);
  });

  it('texto colado com Enter vira parágrafos', () => {
    const r = inserirTexto(base(), cursorEm('p2', 13), '\nLinha nova\nOutra');
    expect(paragrafos(r.doc).map(b => texto(r.doc, b.id))).toEqual(
      ['Acampamento de inverno', 'Saída às sete', 'Linha nova', 'Outra']);
  });

  it('com o controle de alterações ligado, o digitado entra marcado', () => {
    const d = { ...base(), controlarAlteracoes: true };
    const r = inserirTexto(d, cursorEm('p1', 11), ' anual', { autor: 'voce' });
    const p1 = r.doc.blocos[0] as Paragrafo<S>;
    expect(p1.trechos.find(x => x.texto === ' anual')?.revisao).toEqual({ autor: 'voce', tipo: 'inserido' });
    expect(p1.trechos[0].id).toBe('p1-a');
  });
});

describe('apagar', () => {
  it('Backspace apaga o caractere de antes; Delete, o de depois', () => {
    const tras = apagar(base(), cursorEm('p1', 11), 'tras');
    expect(texto(tras.doc, 'p1')).toBe('Acampament de inverno');
    expect(tras.selecao).toEqual(cursorEm('p1', 10));
    const frente = apagar(base(), cursorEm('p1', 11), 'frente');
    expect(texto(frente.doc, 'p1')).toBe('Acampamentode inverno');
  });

  it('Ctrl+Backspace apaga a palavra inteira', () => {
    const r = apagar(base(), cursorEm('p1', 22), 'tras', undefined, true);
    expect(texto(r.doc, 'p1')).toBe('Acampamento de ');
  });

  it('Backspace no começo junta com o de cima, que fica com o id e o estilo', () => {
    const d = aplicarEstilo(base(), cursorEm('p1', 0), 'Título 1').doc;
    const r = apagar(d, cursorEm('p2', 0), 'tras');
    expect(ids(r.doc)).toEqual(['p1']);
    expect(texto(r.doc, 'p1')).toBe('Acampamento de invernoSaída às sete');
    expect((r.doc.blocos[0] as Paragrafo<S>).estilo).toBe('Título 1');
    expect(r.selecao).toEqual(cursorEm('p1', 22));
  });

  it('Backspace num parágrafo vazio de cima tira ele, e o de baixo continua com o id', () => {
    const d = doc(linhaDe('v', 'corpo', ''), linhaDe('p2', 'corpo', 'Assinatura'));
    const r = apagar(d, cursorEm('p2', 0), 'tras');
    expect(ids(r.doc)).toEqual(['p2']);
  });

  it('Backspace no começo de uma folha nova tira a quebra de página antes de juntar', () => {
    const d = doc(linhaDe('p1', 'corpo', 'a'), { ...linhaDe('p2', 'corpo', 'b'), quebraDePagina: true });
    const r = apagar(d, cursorEm('p2', 0), 'tras');
    expect(ids(r.doc)).toEqual(['p1', 'p2']);
    expect(r.doc.blocos[1].quebraDePagina).toBeUndefined();
  });

  it('seleção que atravessa parágrafos costura o começo com o fim', () => {
    const d = doc(linhaDe('p1', 'corpo', 'abc'), linhaDe('p2', 'corpo', 'meio'), linhaDe('p3', 'corpo', 'xyz'));
    const r = apagarSelecao(d, sel('p1', 1, 'p3', 2));
    expect(ids(r.doc)).toEqual(['p1']);
    expect(texto(r.doc, 'p1')).toBe('az');
  });

  it('com o controle ligado, apagar risca e não tira; e o que eu mesmo inseri sai de verdade', () => {
    const d = { ...base(), controlarAlteracoes: true };
    const r = apagar(d, cursorEm('p1', 11), 'tras', { autor: 'voce' });
    expect(textoDoDoc(r.doc)).toBe(textoDoDoc(d));
    expect(textoVisivel(r.doc).split('\n')[0]).toBe('Acampament de inverno');
    const inserido = inserirTexto(d, cursorEm('p2', 13), '!', { autor: 'voce' });
    const desfeito = apagar(inserido.doc, inserido.selecao, 'tras', { autor: 'voce' });
    expect(textoDoDoc(desfeito.doc)).toBe(textoDoDoc(d));
    expect((desfeito.doc.blocos[1] as Paragrafo<S>).trechos.some(x => x.revisao)).toBe(false);
  });

  it('o campo sai inteiro com uma tecla, e não letra por letra', () => {
    const d = doc(blocoDe('p1', 'corpo', [trechoDe('a', 'Figura '), campoDe('f', 'figura'), trechoDe('b', ' — o fogo')]));
    expect(tamanhoDoParagrafo(d.blocos[0] as Paragrafo<S>)).toBe(7 + 1 + 9);
    const r = apagar(d, cursorEm('p1', 8), 'tras');
    expect((r.doc.blocos[0] as Paragrafo<S>).trechos.some(x => x.campo)).toBe(false);
    expect(texto(r.doc, 'p1')).toBe('Figura  — o fogo');
  });

  it('apagar todo o texto de um comentário apaga o balão', () => {
    const d: Doc<S> = {
      ...doc(blocoDe('p1', 'corpo', [trechoDe('a', 'antes '), trechoDe('c', 'marcado'), trechoDe('b', ' depois')])),
      comentarios: [{ id: 'k', trecho: 'c', autor: 'lideranca', texto: '?', respostas: [], resolvido: false }],
    };
    const r = apagarSelecao(d, sel('p1', 6, 'p1', 13));
    expect(r.doc.comentarios).toEqual([]);
  });
});

describe('Enter, Shift+Enter e Ctrl+Enter', () => {
  it('Enter no meio parte o parágrafo, e o de cima fica com o id', () => {
    const r = quebrarParagrafo(base(), cursorEm('p1', 11));
    expect(paragrafos(r.doc).map(b => texto(r.doc, b.id))).toEqual(['Acampamento', ' de inverno', 'Saída às sete']);
    expect(r.doc.blocos[0].id).toBe('p1');
    expect(r.selecao.foco).toEqual({ bloco: r.doc.blocos[1].id, offset: 0 });
  });

  it('Enter no começo abre o vazio acima, e o texto continua com o id que tinha', () => {
    const r = quebrarParagrafo(base(), cursorEm('p2', 0));
    expect(ids(r.doc)[2]).toBe('p2');
    expect(texto(r.doc, ids(r.doc)[1])).toBe('');
    expect(r.selecao).toEqual(cursorEm('p2', 0));
  });

  it('Enter no fim de um título abre um parágrafo Normal', () => {
    const d = aplicarEstilo(base(), cursorEm('p1', 3), 'Título 1').doc;
    const r = quebrarParagrafo(d, cursorEm('p1', 22));
    expect((r.doc.blocos[1] as Paragrafo<S>).estilo).toBe('Normal');
  });

  it('Enter num parágrafo vazio abre outro embaixo, sem repetir id', () => {
    const d = doc(linhaDe('v', 'corpo', ''));
    const r = quebrarParagrafo(d, cursorEm('v', 0));
    const todos = r.doc.blocos.flatMap(b => [b.id, ...(b as Paragrafo<S>).trechos.map(x => x.id)]);
    expect(new Set(todos).size).toBe(todos.length);
    expect(r.doc.blocos).toHaveLength(2);
  });

  it('Shift+Enter desce a linha sem fechar o parágrafo', () => {
    const r = quebraDeLinha(base(), cursorEm('p1', 11));
    expect(ids(r.doc)).toEqual(['p1', 'p2']);
    expect(texto(r.doc, 'p1')).toBe('Acampamento↵ de inverno');
    expect(r.selecao).toEqual(cursorEm('p1', 12));
    /* E é uma unidade: o Backspace logo depois a desfaz. */
    const desfeita = apagar(r.doc, r.selecao, 'tras');
    expect(texto(desfeita.doc, 'p1')).toBe('Acampamento de inverno');
  });

  it('Backspace + Shift+Enter junta duas linhas de endereço num parágrafo só', () => {
    const d = doc(linhaDe('r1', 'corpo', 'Rua das Acácias, 120'), linhaDe('r2', 'corpo', 'Sobradinho — DF'));
    const juntas = apagar(d, cursorEm('r2', 0), 'tras');
    const r = quebraDeLinha(juntas.doc, juntas.selecao);
    expect(ids(r.doc)).toEqual(['r1']);
    expect(texto(r.doc, 'r1')).toBe('Rua das Acácias, 120↵Sobradinho — DF');
  });

  it('Ctrl+Enter no meio parte e o de baixo abre a folha; no começo, quem abre é o próprio', () => {
    const meio = quebraDePagina(base(), cursorEm('p1', 11));
    expect(meio.doc.blocos[1].quebraDePagina).toBe(true);
    expect(meio.doc.blocos[0].quebraDePagina).toBeUndefined();
    const comeco = quebraDePagina(base(), cursorEm('p2', 0));
    expect(ids(comeco.doc)).toEqual(['p1', 'p2']);
    expect(comeco.doc.blocos[1].quebraDePagina).toBe(true);
  });
});

describe('formatar', () => {
  it('negrito vale para a seleção, e só para ela', () => {
    const r = alternarMarca(base(), sel('p1', 15, 'p1', 22), 'negrito');
    const p1 = r.doc.blocos[0] as Paragrafo<S>;
    expect(p1.trechos.map(x => [x.texto, !!x.direta?.negrito])).toEqual([['Acampamento de ', false], ['inverno', true]]);
    expect(p1.trechos[0].id).toBe('p1-a');
  });

  it('apertar de novo desliga, e não deixa formatação direta para trás', () => {
    const ligado = alternarMarca(base(), sel('p1', 15, 'p1', 22), 'negrito');
    const desligado = alternarMarca(ligado.doc, ligado.selecao, 'negrito');
    expect(comFormatacaoDireta(desligado.doc)).toEqual([]);
  });

  it('seleção mista liga para todos', () => {
    const ligado = alternarMarca(base(), sel('p1', 15, 'p1', 22), 'negrito');
    const tudo = alternarMarca(ligado.doc, sel('p1', 0, 'p1', 22), 'negrito');
    expect(formatoDaSelecao(tudo.doc, sel('p1', 0, 'p1', 22)).negrito).toBe(true);
  });

  it('o estilo de parágrafo vale para todo parágrafo que a seleção toca', () => {
    const r = aplicarEstilo(base(), sel('p1', 20, 'p2', 1), 'Título 2');
    expect(r.doc.blocos.map(b => (b as Paragrafo<S>).estilo)).toEqual(['Título 2', 'Título 2']);
  });

  it('limpar formatação tira a direta e deixa o estilo', () => {
    const d = definirTamanho(aplicarEstilo(base(), cursorEm('p1', 0), 'Título 1').doc, sel('p1', 0, 'p1', 22), 20).doc;
    expect(comFormatacaoDireta(d)).toHaveLength(1);
    const r = limparFormatacao(d, sel('p1', 0, 'p1', 22));
    expect(comFormatacaoDireta(r.doc)).toEqual([]);
    expect((r.doc.blocos[0] as Paragrafo<S>).estilo).toBe('Título 1');
  });

  it('o tamanho mostra em branco quando a seleção mistura dois', () => {
    const d = definirTamanho(base(), sel('p1', 0, 'p1', 5), 16).doc;
    expect(formatoDaSelecao(d, sel('p1', 0, 'p1', 22)).tamanho).toBeNull();
    expect(formatoDaSelecao(d, sel('p1', 0, 'p1', 5)).tamanho).toBe(16);
  });

  it('o cursor dentro de uma palavra acha a palavra; num espaço, não acha nada', () => {
    expect(palavraEmVolta(base(), { bloco: 'p1', offset: 4 })).toEqual(sel('p1', 0, 'p1', 11));
    expect(palavraEmVolta(base(), { bloco: 'p1', offset: 11 })).toBeNull();
  });
});

describe('a seleção', () => {
  it('cai para dentro do documento quando ele muda por baixo dela', () => {
    expect(selecaoValida(base(), sel('p1', 99))).toEqual(sel('p1', 22));
    expect(selecaoValida(base(), sel('sumiu', 0))).toBeNull();
  });

  it('Ctrl+A vai do começo do primeiro ao fim do último', () => {
    const s = selecionarTudo(base())!;
    expect(textoDaSelecao(base(), s)).toBe('Acampamento de inverno\nSaída às sete');
  });

  it('isolar a seleção devolve um trecho só com o texto dela, para o comentário', () => {
    const r = isolarSelecao(base(), sel('p1', 15, 'p1', 22));
    const p1 = r.doc.blocos[0] as Paragrafo<S>;
    expect(p1.trechos.find(x => x.id === r.trecho)?.texto).toBe('inverno');
  });
});

describe('parágrafo: alinhamento e listas', () => {
  const lista = () => doc(
    linhaDe('a', 'corpo', 'Saco de dormir'),
    linhaDe('b', 'corpo', 'Lanterna'),
    linhaDe('c', 'corpo', 'Caneca'),
  );
  const tudo = sel('a', 0, 'c', 6);

  it('alinhar vale para o parágrafo inteiro, com o cursor parado no meio', () => {
    const d = alinhar(lista(), cursorEm('b', 3), 'centro').doc;
    expect(paragrafos(d).map(b => b.formato?.alinhamento ?? 'esquerda')).toEqual(['esquerda', 'centro', 'esquerda']);
    expect(formatoDoParagrafoDaSelecao(d, tudo).alinhamento).toBeNull();
  });

  /* Três cliques no navegador selecionam o parágrafo com o fim já no começo
     do seguinte. Centralizar não pode levar o de baixo junto. */
  it('seleção que acaba no começo de um parágrafo não o alcança', () => {
    const d = alinhar(lista(), sel('a', 0, 'b', 0), 'centro').doc;
    expect(paragrafos(d).map(b => b.formato?.alinhamento ?? 'esquerda')).toEqual(['centro', 'esquerda', 'esquerda']);
    const estilo = aplicarEstilo(lista(), sel('a', 0, 'b', 0), 'Título 1').doc;
    expect(paragrafos(estilo).map(b => b.estilo)).toEqual(['Título 1', 'Normal', 'Normal']);
  });

  it('a lista é um interruptor, e a numeração é calculada', () => {
    const d = alternarLista(lista(), tudo, 'numeracao').doc;
    expect(['a', 'b', 'c'].map(id => marcadorDaLista(d, id))).toEqual(['1.', '2.', '3.']);
    expect(paragrafos(alternarLista(d, tudo, 'numeracao').doc).every(b => !b.formato)).toBe(true);
  });

  it('Enter num item continua a lista, e Enter num item vazio a fecha', () => {
    const d = alternarLista(lista(), tudo, 'marcadores').doc;
    const r = quebrarParagrafo(d, cursorEm('c', 6));
    const novo = paragrafos(r.doc).find(b => b.id === r.selecao.foco.bloco)!;
    expect(novo.formato?.lista).toBe('marcadores');
    const fechou = quebrarParagrafo(r.doc, r.selecao);
    expect(paragrafos(fechou.doc).find(b => b.id === novo.id)!.formato?.lista).toBeUndefined();
    expect(fechou.doc.blocos).toHaveLength(r.doc.blocos.length);
  });

  it('Backspace no começo do item tira o marcador sem juntar com o de cima', () => {
    const d = alternarLista(lista(), tudo, 'marcadores').doc;
    const r = apagar(d, cursorEm('b', 0), 'tras');
    expect(r.doc.blocos).toHaveLength(3);
    expect(paragrafos(r.doc)[1].formato?.lista).toBeUndefined();
  });

  it('Tab no começo do item desce um nível; no meio do texto é tabulação', () => {
    const d = alternarLista(lista(), tudo, 'numeracao').doc;
    const r = tabular(d, cursorEm('b', 0), false);
    expect(paragrafos(r.doc)[1].formato?.recuo).toBe(1);
    expect(marcadorDaLista(r.doc, 'b')).toBe('a.');
    expect(marcadorDaLista(r.doc, 'c')).toBe('2.');
    const meio = tabular(d, cursorEm('b', 3), false);
    expect(texto(meio.doc, 'b')).toBe('Lan\tterna');
  });

  it('Limpar Toda a Formatação tira a de parágrafo também', () => {
    const d = alinhar(alternarLista(lista(), tudo, 'marcadores').doc, tudo, 'direita').doc;
    expect(paragrafos(limparTudo(d, tudo).doc).every(b => !b.formato)).toBe(true);
  });
});

describe('copiar e colar com a formatação', () => {
  it('cola o pedaço com o negrito de origem, e com marca se o controle estiver ligado', () => {
    const d0 = base();
    const negrito = alternarMarca(d0, sel('p1', 0, 'p1', 11), 'negrito').doc;
    const frag = fragmentoDaSelecao(negrito, sel('p1', 0, 'p1', 11));
    const r = colarFragmento(negrito, cursorEm('p2', 0), frag);
    const colado = paragrafos(r.doc).find(b => b.id === 'p2')!.trechos[0];
    expect(colado.texto).toBe('Acampamento');
    expect(colado.direta?.negrito).toBe(true);
    expect(r.selecao.foco.offset).toBe(11);
    const marcado = colarFragmento({ ...negrito, controlarAlteracoes: true }, cursorEm('p2', 0), frag);
    expect(paragrafos(marcado.doc).find(b => b.id === 'p2')!.trechos[0].revisao?.tipo).toBe('inserido');
  });

  it('o que está riscado não vai para a área de transferência', () => {
    const d = { ...base(), controlarAlteracoes: true };
    const riscado = apagar(d, cursorEm('p1', 11), 'tras', { autor: 'voce' }).doc;
    const semMarca = { ...riscado, controlarAlteracoes: false };
    const frag = fragmentoDaSelecao(semMarca, sel('p1', 0, 'p1', 22));
    expect(frag[0].map(x => x.texto).join('')).toBe('Acampament de inverno');
  });
});
