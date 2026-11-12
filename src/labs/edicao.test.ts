import { describe, it, expect } from 'vitest';
import {
  type Doc, type Paragrafo, blocoDe, campoDe, linhaDe, trechoDe, textoDoDoc, textoVisivel,
  comFormatacaoDireta, paragrafos, marcadorDaLista,
  revisoesPendentes, aceitarRevisao, rejeitarRevisao, aceitarTodasAsRevisoes, rejeitarTodasAsRevisoes,
  idDaQuebra, rotuloDaRevisao, idDoFormato, idDoFormatoDoParagrafo, descricaoDaMarca,
} from './documento';
import {
  type Selecao, cursorEm, inserirTexto, apagar, quebrarParagrafo, quebraDeLinha, quebraDePagina,
  alternarMarca, aplicarEstilo, formatoDaSelecao, palavraEmVolta, selecaoValida, selecionarTudo,
  textoDaSelecao, tamanhoDoParagrafo, isolarSelecao, limparFormatacao, definirTamanho, apagarSelecao,
  alternarLista, alinhar, tabular, limparTudo, fragmentoDaSelecao, colarFragmento, formatoDoParagrafoDaSelecao,
  mudarTamanhoEmUmPonto, moverSelecao, recortarSelecao, colarSemGrudar, marcaEmVolta,
  comFormatacaoMarcada, selecaoDoTrecho, sugestaoDoTrecho, pegarFormato, aplicarFormato, contagemDePalavras,
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

  it('Ctrl+] sobe um ponto, e não o degrau seguinte da escada de tamanhos', () => {
    /* O Ctrl+Shift+> pula de 11 para 12, de 12 para 14; o Ctrl+] vai de um em
       um. Voltar ao tamanho do estilo apaga a direta, como tirar o negrito. */
    const doze = mudarTamanhoEmUmPonto(base(), sel('p1', 0, 'p1', 11), true);
    expect(formatoDaSelecao(doze.doc, sel('p1', 0, 'p1', 11)).tamanho).toBe(12);
    const treze = mudarTamanhoEmUmPonto(doze.doc, doze.selecao, true);
    expect(formatoDaSelecao(treze.doc, sel('p1', 0, 'p1', 11)).tamanho).toBe(13);
    const volta = mudarTamanhoEmUmPonto(mudarTamanhoEmUmPonto(treze.doc, treze.selecao, false).doc, treze.selecao, false);
    expect(comFormatacaoDireta(volta.doc), 'voltar ao 11 do estilo deixou formatação direta').toEqual([]);
  });

  it('o Ctrl+[ não desce abaixo de um ponto', () => {
    let r = definirTamanho(base(), sel('p1', 0, 'p1', 11), 1);
    r = mudarTamanhoEmUmPonto(r.doc, sel('p1', 0, 'p1', 11), false);
    expect(formatoDaSelecao(r.doc, sel('p1', 0, 'p1', 11)).tamanho).toBe(1);
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

describe('recortar e colar sem grudar', () => {
  /*
    O recortar e colar inteligente do Word vale para os três gestos de levar
    uma palavra: arrastar, recortar e colar. No celular só há os dois últimos
    — o toque longo pega a palavra sem o espaço, e a barra do sistema oferece
    Recortar e Colar —, e sem o ajuste a frase saía "Saída  sete" num lugar e
    "àsAcampamento" no outro.
  */
  it('recortar a palavra leva o espaço que sobraria', () => {
    expect(texto(recortarSelecao(base(), sel('p2', 6, 'p2', 8)).doc, 'p2')).toBe('Saída sete');
    expect(texto(recortarSelecao(base(), sel('p2', 9, 'p2', 13)).doc, 'p2'), 'a última palavra leva o espaço de antes').toBe('Saída às');
    expect(texto(recortarSelecao(base(), sel('p2', 0, 'p2', 5)).doc, 'p2'), 'a primeira leva o de depois').toBe('às sete');
  });

  it('colar entre duas palavras põe o espaço que falta, e o cursor fica no fim do que entrou', () => {
    const d = base();
    const frag = fragmentoDaSelecao(d, sel('p2', 6, 'p2', 8));
    const r = colarSemGrudar(d, cursorEm('p1', 0), frag);
    expect(texto(r.doc, 'p1')).toBe('às Acampamento de inverno');
    expect(r.selecao.foco).toEqual({ bloco: 'p1', offset: 2 });
    expect(texto(colarSemGrudar(d, cursorEm('p1', 22), frag).doc, 'p1')).toBe('Acampamento de inverno às');
    expect(texto(colarSemGrudar(d, cursorEm('p1', 11), frag).doc, 'p1'), 'ao lado de um espaço não põe outro').toBe('Acampamento às de inverno');
  });

  it('com o controle de alterações nada se ajusta, porque cada espaço seria uma marca', () => {
    const d = { ...base(), controlarAlteracoes: true };
    expect(textoVisivel(recortarSelecao(d, sel('p2', 6, 'p2', 8)).doc)).toContain('Saída  sete');
    const frag = fragmentoDaSelecao(base(), sel('p2', 6, 'p2', 8));
    expect(textoVisivel(colarSemGrudar(d, cursorEm('p1', 0), frag).doc)).toContain('àsAcampamento');
  });
});

describe('arrastar a seleção', () => {
  it('soltar depois, no mesmo parágrafo, move a palavra para onde se soltou', () => {
    // "Acampamento de inverno": arrasta " de" (11..14) para o fim (22)
    const d = base();
    const r = moverSelecao(d, sel('p1', 11, 'p1', 14), { bloco: 'p1', offset: 22 }, false);
    expect(texto(r.doc, 'p1')).toBe('Acampamento inverno de');
    expect(textoDaSelecao(r.doc, r.selecao), 'o texto que chegou fica selecionado').toBe(' de');
  });

  it('soltar antes move sem empurrar o destino', () => {
    const r = moverSelecao(base(), sel('p1', 15, 'p1', 22), { bloco: 'p1', offset: 0 }, false);
    expect(texto(r.doc, 'p1')).toBe('inverno Acampamento de');
  });

  it('com Ctrl copia, e a origem fica', () => {
    const r = moverSelecao(base(), sel('p1', 0, 'p1', 11), { bloco: 'p2', offset: 0 }, true);
    expect(texto(r.doc, 'p1')).toBe('Acampamento de inverno');
    expect(texto(r.doc, 'p2')).toBe('Acampamento Saída às sete');
  });

  it('para outro parágrafo, a origem sai e o resto não muda de id', () => {
    const r = moverSelecao(base(), sel('p1', 11, 'p1', 22), { bloco: 'p2', offset: 13 }, false);
    expect(texto(r.doc, 'p1')).toBe('Acampamento');
    expect(texto(r.doc, 'p2')).toBe('Saída às sete de inverno');
    expect(ids(r.doc)).toEqual(['p1', 'p2']);
  });

  it('seleção que atravessa parágrafos cai no ponto certo depois da junção', () => {
    // apaga "inverno|Saída" e solta no fim do segundo: a cauda " às sete" fica antes
    const r = moverSelecao(base(), sel('p1', 15, 'p2', 5), { bloco: 'p2', offset: 13 }, false);
    expect(texto(r.doc, 'p1')).toBe('Acampamento de  às seteinverno');
    expect(ids(r.doc)).toContain('p1');
    expect(textoDaSelecao(r.doc, r.selecao)).toBe('inverno\nSaída');
  });

  it('a palavra do clique duplo não deixa dois espaços para trás nem gruda onde chega', () => {
    // "Saída às sete": arrasta "às" (6..8) para logo depois de "sete"
    const r = moverSelecao(base(), sel('p2', 6, 'p2', 8), { bloco: 'p2', offset: 13 }, false);
    expect(texto(r.doc, 'p2')).toBe('Saída sete às');
    expect(textoDaSelecao(r.doc, r.selecao)).toBe('às');
    // e para o meio de uma palavra vizinha, com espaço dos dois lados
    const r2 = moverSelecao(base(), sel('p2', 0, 'p2', 5), { bloco: 'p1', offset: 11 }, true);
    expect(texto(r2.doc, 'p1')).toBe('Acampamento Saída de inverno');
  });

  it('soltar dentro da própria seleção, ou na beirada dela, não faz nada', () => {
    const d = base();
    expect(moverSelecao(d, sel('p1', 0, 'p1', 11), { bloco: 'p1', offset: 5 }, false).doc).toBe(d);
    expect(moverSelecao(d, sel('p1', 0, 'p1', 11), { bloco: 'p1', offset: 11 }, false).doc).toBe(d);
  });

  it('com o controle de alterações, a origem sai riscada e o destino não escorrega', () => {
    const d = { ...base(), controlarAlteracoes: true };
    const r = moverSelecao(d, sel('p1', 12, 'p1', 15), { bloco: 'p1', offset: 22 }, false);
    // o riscado continua no documento, e o que chegou entra no fim
    expect(texto(r.doc, 'p1')).toBe('Acampamento de invernode ');
    expect(textoVisivel(r.doc)).toContain('Acampamento inverno');
  });
});

describe('o controle de alterações', () => {
  /*
    O que o Word faz com o controle ligado, e o motor não fazia: cada tecla
    apagada virava uma marca, o Enter partia o parágrafo sem marca nenhuma, o
    Backspace no começo de um parágrafo não fazia nada, e apagar a sugestão de
    outra pessoa a transformava em texto comum riscado.
  */
  const controlado = () => ({ ...base(), controlarAlteracoes: true });
  const pendentes = (d: Doc<S>) => revisoesPendentes(d).map(r => `${r.trecho.revisao.tipo[0]}:${r.trecho.texto}`);
  const teclar = (d: Doc<S>, s0: Selecao, n: number, direcao: 'tras' | 'frente') => {
    let r = { doc: d, selecao: s0 };
    for (let i = 0; i < n; i++) r = apagar(r.doc, r.selecao, direcao);
    return r;
  };

  it('três Backspaces seguidos são uma marca só, e Aceitar resolve as três letras de uma vez', () => {
    const r = teclar(controlado(), cursorEm('p1', 22), 3, 'tras');
    expect(pendentes(r.doc)).toEqual(['e:rno']);
    expect(r.selecao.foco.offset, 'o cursor anda para trás por cima do riscado').toBe(19);
    const aceita = aceitarRevisao(r.doc, revisoesPendentes(r.doc)[0].trecho.id);
    expect(texto(aceita, 'p1')).toBe('Acampamento de inve');
  });

  it('Delete adiante também funde, e sobre a própria inserção não pula a letra seguinte', () => {
    const r = teclar(controlado(), cursorEm('p1', 0), 4, 'frente');
    expect(pendentes(r.doc)).toEqual(['e:Acam']);
    const digitado = inserirTexto(controlado(), cursorEm('p1', 0), 'XY');
    const r2 = teclar(digitado.doc, cursorEm('p1', 0), 2, 'frente');
    expect(texto(r2.doc, 'p1'), 'a inserção própria sai de verdade').toBe('Acampamento de inverno');
    expect(r2.selecao.foco.offset, 'o Delete não andou por cima do A').toBe(0);
  });

  it('a fusão não some com um trecho comentado, e não junta marcas que já chegaram vizinhas', () => {
    const d0 = controlado();
    const r1 = apagar(d0, cursorEm('p1', 22), 'tras');
    const marcado = revisoesPendentes(r1.doc)[0].trecho.id;
    const comComentario: Doc<S> = { ...r1.doc, comentarios: [{ id: 'c', trecho: marcado, autor: 'lideranca', texto: '?', respostas: [], resolvido: false }] };
    const r2 = apagar(comComentario, r1.selecao, 'tras');
    expect(revisoesPendentes(r2.doc).map(x => x.trecho.id), 'o trecho comentado continua lá').toContain(marcado);
    expect(r2.doc.comentarios).toHaveLength(1);

    const vizinhas = doc({
      ...linhaDe('p1', 'corpo', ''),
      trechos: [
        { ...trechoDe('a', 'Pio'), revisao: { autor: 'lideranca', tipo: 'inserido' } },
        { ...trechoDe('b', 'neiros'), revisao: { autor: 'lideranca', tipo: 'inserido' } },
        trechoDe('c', ' clube'),
      ],
    });
    const r3 = apagar({ ...vizinhas, controlarAlteracoes: true }, cursorEm('p1', 15), 'tras');
    expect(paragrafos(r3.doc)[0].trechos.map(x => x.id).slice(0, 2), 'as duas da liderança continuam duas').toEqual(['a', 'b']);
  });

  it('apagar a sugestão de outra pessoa guarda de quem ela era, e rejeitar devolve a sugestão', () => {
    const d = doc({
      ...linhaDe('p1', 'corpo', ''),
      trechos: [trechoDe('a', 'Clube '), { ...trechoDe('b', 'Pioneiros'), revisao: { autor: 'lideranca', tipo: 'inserido' } }],
    });
    const r = apagarSelecao({ ...d, controlarAlteracoes: true }, sel('p1', 9, 'p1', 11));
    const minha = revisoesPendentes(r.doc).find(x => x.trecho.revisao.autor === 'voce')!.trecho;
    expect(minha.revisao).toEqual({ autor: 'voce', tipo: 'excluido', sobre: 'lideranca' });
    expect(rotuloDaRevisao(minha.revisao!)).toBe('Excluído por Você (inserido por Liderança)');
    const rejeitada = rejeitarRevisao(r.doc, minha.id);
    expect(paragrafos(rejeitada)[0].trechos.every(x => x.texto === 'Clube ' || x.revisao?.autor === 'lideranca'),
      'o pedaço voltou a ser sugestão da liderança').toBe(true);
    expect(texto(rejeitarTodasAsRevisoes(r.doc), 'p1'), 'rejeitar tudo leva também a sugestão dela').toBe('Clube ');
  });

  it('Enter fica marcado: rejeitar junta os dois de volta, com o id de antes', () => {
    const r = quebrarParagrafo(controlado(), cursorEm('p1', 11));
    expect(ids(r.doc)).toHaveLength(3);
    expect(revisoesPendentes(r.doc).map(x => x.trecho.id)).toEqual([idDaQuebra('p1')]);
    const rejeitada = rejeitarRevisao(r.doc, idDaQuebra('p1'));
    expect(ids(rejeitada)).toEqual(['p1', 'p2']);
    expect(texto(rejeitada, 'p1')).toBe('Acampamento de inverno');
    const aceita = aceitarRevisao(r.doc, idDaQuebra('p1'));
    expect(ids(aceita)).toHaveLength(3);
    expect(revisoesPendentes(aceita)).toEqual([]);
  });

  it('Backspace no começo marca a quebra que sai; aceitar junta, e Enter seguido de Backspace não deixa rastro', () => {
    const r = apagar(controlado(), cursorEm('p2', 0), 'tras');
    expect(ids(r.doc), 'os dois continuam separados até alguém aceitar').toEqual(['p1', 'p2']);
    expect(pendentes(r.doc)).toEqual(['e:¶']);
    expect(r.selecao.foco).toEqual({ bloco: 'p1', offset: 22 });
    const aceita = aceitarRevisao(r.doc, idDaQuebra('p1'));
    expect(ids(aceita)).toEqual(['p1']);
    expect(texto(aceita, 'p1')).toBe('Acampamento de invernoSaída às sete');

    const enter = quebrarParagrafo(controlado(), cursorEm('p1', 11));
    const volta = apagar(enter.doc, enter.selecao, 'tras');
    expect(ids(volta.doc)).toEqual(['p1', 'p2']);
    expect(revisoesPendentes(volta.doc)).toEqual([]);
  });

  it('apagar de um parágrafo até o seguinte marca a quebra do meio', () => {
    const r = apagarSelecao(controlado(), sel('p1', 15, 'p2', 5));
    expect(pendentes(r.doc)).toEqual(['e:inverno', 'e:¶', 'e:Saída']);
    expect(texto(aceitarTodasAsRevisoes(r.doc), 'p1')).toBe('Acampamento de  às sete');
  });

  it('Rejeitar Todas desfaz dois Enters seguidos, embora o segundo mude de parágrafo ao primeiro ser rejeitado', () => {
    const a = quebrarParagrafo(controlado(), cursorEm('p1', 11));
    const b = quebrarParagrafo(a.doc, cursorEm(a.selecao.foco.bloco, 3));
    expect(revisoesPendentes(b.doc)).toHaveLength(2);
    const rejeitada = rejeitarTodasAsRevisoes(b.doc);
    expect(ids(rejeitada)).toEqual(['p1', 'p2']);
    expect(texto(rejeitada, 'p1')).toBe('Acampamento de inverno');
  });

  it('a marca em volta do cursor: a da seleção que Próxima deixa, e a quebra no fim do parágrafo', () => {
    const r = apagar(controlado(), cursorEm('p2', 0), 'tras');
    expect(marcaEmVolta(r.doc, cursorEm('p1', 22))).toBe(idDaQuebra('p1'));
    const riscado = apagar(controlado(), cursorEm('p1', 22), 'tras');
    const id = revisoesPendentes(riscado.doc)[0].trecho.id;
    expect(marcaEmVolta(riscado.doc, sel('p1', 21, 'p1', 22))).toBe(id);
    expect(marcaEmVolta(riscado.doc, cursorEm('p1', 0))).toBeNull();
  });
});

describe('a marca de formatação', () => {
  /*
    O negrito aplicado com o controle ligado entrava calado: nenhuma marca
    contava, Rejeitar Todas não o desfazia, e quem revisava recebia outro
    documento sem nada dizendo onde. O Word escreve "Formatado: Negrito" na
    margem, e é isso que estas travas cobram.
  */
  const controlado = () => ({ ...base(), controlarAlteracoes: true });
  const formatado = (d: Doc<S>, f: (d: Doc<S>) => Doc<S>) => comFormatacaoMarcada(d, f(d));
  const marcas = (d: Doc<S>) => revisoesPendentes(d).map(r => `${r.trecho.revisao.tipo}:${r.trecho.texto}:${r.trecho.revisao.mudou ?? ''}`);

  it('negrito com o controle ligado vira uma marca, e rejeitar devolve a aparência de antes', () => {
    const d = formatado(controlado(), x => alternarMarca(x, sel('p1', 0, 'p1', 11), 'negrito').doc);
    expect(marcas(d)).toEqual(['formatado:Acampamento:Negrito']);
    expect(textoDoDoc(d), 'formatar não muda uma letra').toBe(textoDoDoc(base()));
    const id = revisoesPendentes(d)[0].trecho.id;
    expect(id.startsWith('ƒ:'), 'a marca tem id próprio, que não colide com o do trecho').toBe(true);
    const rejeitado = rejeitarRevisao(d, id);
    expect(comFormatacaoDireta(rejeitado)).toHaveLength(0);
    expect(revisoesPendentes(rejeitado)).toHaveLength(0);
    const aceito = aceitarRevisao(d, id);
    expect(paragrafos(aceito)[0].trechos[0].direta?.negrito, 'aceitar deixa o negrito').toBe(true);
    expect(revisoesPendentes(aceito)).toHaveLength(0);
  });

  it('sem o controle, formatar não deixa marca nenhuma', () => {
    const d = formatado(base(), x => alternarMarca(x, sel('p1', 0, 'p1', 11), 'negrito').doc);
    expect(revisoesPendentes(d)).toHaveLength(0);
  });

  it('o modo Sugestão marca mesmo com o controle do documento desligado, e com o autor dele', () => {
    const d0 = base();
    const d = comFormatacaoMarcada(d0, alternarMarca(d0, sel('p1', 0, 'p1', 11), 'italico').doc, { autor: 'marta', marcar: true });
    expect(revisoesPendentes(d)[0].trecho.revisao).toMatchObject({ autor: 'marta', tipo: 'formatado', mudou: 'Itálico' });
  });

  it('a marca guarda a aparência de antes da primeira mudança, e voltar a ela não deixa rastro', () => {
    const d0 = controlado();
    const d1 = formatado(d0, x => definirTamanho(x, sel('p1', 0, 'p1', 11), 14).doc);
    const d2 = formatado(d1, x => alternarMarca(x, sel('p1', 0, 'p1', 11), 'negrito').doc);
    expect(marcas(d2), 'uma marca só, com as duas mudanças').toEqual(['formatado:Acampamento:Negrito, 14 pt']);
    const rejeitado = rejeitarRevisao(d2, revisoesPendentes(d2)[0].trecho.id);
    expect(comFormatacaoDireta(rejeitado), 'rejeitar tira as duas').toHaveLength(0);
    const d3 = formatado(d2, x => alternarMarca(x, sel('p1', 0, 'p1', 11), 'negrito').doc);
    const d4 = formatado(d3, x => definirTamanho(x, sel('p1', 0, 'p1', 11), 11).doc);
    expect(revisoesPendentes(d4), 'negrito e depois tirar o negrito não é mudança').toHaveLength(0);
  });

  it('rejeitar devolve a formatação direta que o trecho já tinha, e não "sem negrito"', () => {
    const d0 = doc({ ...linhaDe('p1', 'corpo', ''), trechos: [{ ...trechoDe('a', 'Pioneiros'), direta: { tamanho: 16, cor: '#C00000' } }] });
    const d = formatado({ ...d0, controlarAlteracoes: true }, x => alternarMarca(x, sel('p1', 0, 'p1', 9), 'negrito').doc);
    const rejeitado = rejeitarRevisao(d, revisoesPendentes(d)[0].trecho.id);
    expect(paragrafos(rejeitado)[0].trechos[0].direta).toEqual({ tamanho: 16, cor: '#C00000' });
  });

  it('uma seleção que atravessa três trechos iguais dá uma marca, e não três', () => {
    const d0 = doc({ ...linhaDe('p1', 'corpo', ''), trechos: [trechoDe('a', 'Clube '), trechoDe('b', 'dos '), trechoDe('c', 'Pioneiros')] });
    const d = formatado({ ...d0, controlarAlteracoes: true }, x => alternarMarca(x, sel('p1', 0, 'p1', 19), 'negrito').doc);
    expect(marcas(d)).toEqual(['formatado:Clube dos Pioneiros:Negrito']);
    expect(paragrafos(d)[0].trechos[0].id, 'fica o id que já existia').toBe('a');
  });

  it('o que a própria pessoa acabou de inserir não ganha marca de formatação', () => {
    const digitado = inserirTexto(controlado(), cursorEm('p1', 0), 'Grande ');
    const d = formatado(digitado.doc, x => alternarMarca(x, sel('p1', 0, 'p1', 7), 'negrito').doc);
    expect(revisoesPendentes(d).map(r => r.trecho.revisao.tipo)).toEqual(['inserido']);
  });

  it('a sugestão de outra pessoa formatada tem duas marcas, e cada uma se resolve sozinha', () => {
    const d0 = doc({
      ...linhaDe('p1', 'corpo', ''),
      trechos: [trechoDe('a', 'Clube '), { ...trechoDe('b', 'Pioneiros'), revisao: { autor: 'lideranca', tipo: 'inserido' } }],
    });
    const d = formatado({ ...d0, controlarAlteracoes: true }, x => alternarMarca(x, sel('p1', 6, 'p1', 15), 'negrito').doc);
    expect(revisoesPendentes(d).map(r => r.trecho.id)).toEqual(['b', idDoFormato('b')]);
    const soAFormatacao = rejeitarRevisao(d, idDoFormato('b'));
    expect(revisoesPendentes(soAFormatacao).map(r => r.trecho.id), 'a inserção continua esperando').toEqual(['b']);
    expect(paragrafos(soAFormatacao)[0].trechos[1].direta).toBeUndefined();
    expect(sugestaoDoTrecho(d, idDoFormato('b')), 'na nuvem, a formatação é uma sugestão à parte').toEqual([idDoFormato('b')]);
  });

  it('o mesmo texto com duas marcas: a escolhida por Próxima vale enquanto a seleção for a dela', () => {
    const d0 = doc({
      ...linhaDe('p1', 'corpo', ''),
      trechos: [trechoDe('a', 'Clube '), { ...trechoDe('b', 'Pioneiros'), revisao: { autor: 'lideranca', tipo: 'inserido' } }],
    });
    const d = formatado({ ...d0, controlarAlteracoes: true }, x => alternarMarca(x, sel('p1', 6, 'p1', 15), 'negrito').doc);
    const s = selecaoDoTrecho(d, idDoFormato('b'))!;
    expect(s).toEqual(selecaoDoTrecho(d, 'b'));
    expect(marcaEmVolta(d, s), 'sem preferência, a de inserção vem primeiro').toBe('b');
    expect(marcaEmVolta(d, s, idDoFormato('b'))).toBe(idDoFormato('b'));
    expect(marcaEmVolta(d, cursorEm('p1', 2), idDoFormato('b')), 'o cursor andou: a preferência acabou').toBeNull();
  });

  it('formatação de parágrafo é marca do parágrafo, e rejeitar devolve estilo e alinhamento', () => {
    const d0 = controlado();
    const d1 = formatado(d0, x => alinhar(x, cursorEm('p1', 3), 'centro').doc);
    const d2 = formatado(d1, x => aplicarEstilo(x, cursorEm('p1', 3), 'Título 1').doc);
    expect(marcas(d2)).toEqual(['formatado:Acampamento de inverno:Estilo: Título 1, Centralizado']);
    const id = revisoesPendentes(d2)[0].trecho.id;
    expect(id).toBe(idDoFormatoDoParagrafo('p1'));
    expect(marcaEmVolta(d2, cursorEm('p1', 3)), 'o cursor em qualquer ponto do parágrafo acha a marca dele').toBe(id);
    expect(descricaoDaMarca(revisoesPendentes(d2)[0].trecho)).toBe('Marca de Você: o parágrafo mudou de formatação — Estilo: Título 1, Centralizado.');
    const rejeitado = rejeitarRevisao(d2, id);
    expect(paragrafos(rejeitado)[0].estilo).toBe('Normal');
    expect(paragrafos(rejeitado)[0].formato).toBeUndefined();
  });

  it('o rótulo da dica é o do Word, e Rejeitar Todas desfaz texto e formatação juntos', () => {
    const d1 = formatado(controlado(), x => alternarMarca(x, sel('p2', 0, 'p2', 5), 'sublinhado').doc);
    const d2 = inserirTexto(d1, cursorEm('p1', 0), 'Novo ').doc;
    const d3 = formatado(d2, x => alternarLista(x, cursorEm('p2', 1), 'marcadores').doc);
    expect(rotuloDaRevisao(revisoesPendentes(d3).find(r => r.trecho.revisao.tipo === 'formatado' && r.trecho.texto === 'Saída')!.trecho.revisao))
      .toBe('Formatado por Você: Sublinhado');
    const limpo = rejeitarTodasAsRevisoes(d3);
    expect(revisoesPendentes(limpo)).toHaveLength(0);
    expect(textoDoDoc(limpo)).toBe(textoDoDoc(base()));
    expect(comFormatacaoDireta(limpo)).toHaveLength(0);
    expect(paragrafos(limpo)[1].formato).toBeUndefined();
  });

  it('o Tab que recua ganha marca, e o que escreve uma tabulação não', () => {
    const lista = formatado(base(), x => alternarLista(x, cursorEm('p2', 0), 'numeracao').doc);
    const d0 = { ...lista, controlarAlteracoes: true };
    const recuado = formatado(d0, x => tabular(x, cursorEm('p2', 0), false).doc);
    expect(marcas(recuado)).toEqual(['formatado:Saída às sete:Recuo à esquerda: 1,25 cm']);
    const escrito = formatado(d0, x => tabular(x, cursorEm('p1', 3), false).doc);
    expect(revisoesPendentes(escrito).map(r => r.trecho.revisao.tipo)).toEqual(['inserido']);
  });

  it('copiar texto formatado não leva a marca junto', () => {
    const d = formatado(controlado(), x => alternarMarca(x, sel('p1', 0, 'p1', 11), 'negrito').doc);
    const fragmento = fragmentoDaSelecao(d, sel('p1', 0, 'p1', 11));
    expect(fragmento.flat().some(x => x.formatacao)).toBe(false);
  });
});

describe('o Pincel de Formatação', () => {
  /* O botão estava na faixa e só avisava que não fazia parte do exercício. */
  const trechos = (d: Doc<S>, id: string) => paragrafos(d).find(b => b.id === id)!.trechos;

  it('leva a aparência como ela se vê: o negrito do título vem mesmo sem formatação direta', () => {
    /* Título 2 é negrito pelo estilo; o Título 1 do Word moderno não é. */
    const d0 = aplicarEstilo(base(), cursorEm('p1', 0), 'Título 2').doc;
    const molde = pegarFormato(d0, cursorEm('p1', 3))!;
    expect(molde.efetiva.negrito).toBe(true);
    expect(molde.efetiva.tamanho, 'e o tamanho do estilo, e não o do Normal').toBe(13);
    expect(molde.paragrafo?.estilo, 'com o cursor parado, o parágrafo vai junto').toBe('Título 2');
    const pintado = aplicarFormato(d0, sel('p2', 0, 'p2', 5), { ...molde, paragrafo: undefined }).doc;
    expect(trechos(pintado, 'p2')[0].direta, 'o Normal ganha o negrito, o tamanho e a cor diretos')
      .toEqual({ negrito: true, tamanho: 13, cor: '#2F5496' });
    expect(paragrafos(pintado)[1].estilo, 'meia frase pintada não leva o estilo').toBe('Normal');
  });

  it('só grava como direta o que difere do estilo de destino, e o texto não muda', () => {
    const d0 = doc(
      { ...linhaDe('p1', 'corpo', ''), trechos: [{ ...trechoDe('a', 'Pioneiros'), direta: { tamanho: 16, cor: '#C00000' } }] },
      linhaDe('p2', 'corpo', 'Saída às sete'),
    );
    const molde = pegarFormato(d0, sel('p1', 0, 'p1', 4))!;
    expect(molde.paragrafo, 'seleção dentro do parágrafo leva só a letra').toBeUndefined();
    const pintado = aplicarFormato(d0, sel('p2', 0, 'p2', 5), molde).doc;
    expect(trechos(pintado, 'p2')[0].direta).toEqual({ tamanho: 16, cor: '#C00000' });
    expect(textoDoDoc(pintado)).toBe(textoDoDoc(d0));
    const devolta = aplicarFormato(pintado, sel('p2', 0, 'p2', 5), pegarFormato(pintado, sel('p2', 6, 'p2', 9))!).doc;
    expect(trechos(devolta, 'p2')[0].direta, 'pintar com a cara do Normal tira a direta, e não grava "falso"').toBeUndefined();
  });

  it('a seleção do parágrafo inteiro leva o alinhamento e o estilo', () => {
    const d0 = alinhar(aplicarEstilo(base(), cursorEm('p1', 0), 'Citação').doc, cursorEm('p1', 0), 'centro').doc;
    const molde = pegarFormato(d0, sel('p1', 0, 'p1', tamanhoDoParagrafo(paragrafos(d0)[0])))!;
    const pintado = aplicarFormato(d0, cursorEm('p2', 2), molde).doc;
    expect(paragrafos(pintado)[1].estilo).toBe('Citação');
    expect(paragrafos(pintado)[1].formato?.alinhamento).toBe('centro');
  });

  it('com o controle ligado, a pintura sai marcada como formatação', () => {
    const d0 = { ...alternarMarca(base(), sel('p1', 0, 'p1', 11), 'negrito').doc, controlarAlteracoes: true };
    const molde = pegarFormato(d0, sel('p1', 0, 'p1', 4))!;
    const pintado = comFormatacaoMarcada(d0, aplicarFormato(d0, sel('p2', 0, 'p2', 5), molde).doc);
    expect(revisoesPendentes(pintado).map(r => r.trecho.revisao.mudou)).toEqual(['Negrito']);
  });
});

describe('a contagem de palavras', () => {
  it('conta o documento, e com seleção diz quantas de quantas', () => {
    expect(contagemDePalavras(base(), null)).toEqual({ total: 6, selecionadas: null });
    expect(contagemDePalavras(base(), cursorEm('p1', 3)).selecionadas, 'cursor parado não é seleção').toBeNull();
    expect(contagemDePalavras(base(), sel('p1', 0, 'p2', 5))).toEqual({ total: 6, selecionadas: 4 });
  });

  it('o texto riscado de uma revisão não conta', () => {
    const riscado = apagarSelecao({ ...base(), controlarAlteracoes: true }, sel('p1', 11, 'p1', 22)).doc;
    expect(contagemDePalavras(riscado, null).total).toBe(4);
  });
});
