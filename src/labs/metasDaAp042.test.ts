import { describe, it, expect } from 'vitest';
import {
  DOC_DA_FORMATACAO, METAS_DA_FORMATACAO, NOME_DO_CLUBE, NOME_DO_LIVRO, acharParagrafo,
  type ContextoDaFormatacao, type Doc,
} from './metasDaAp042';
import {
  alinhar, alternarLista, alternarMarca, colarFragmento, cursorEm, definirEntrelinha, definirFonte,
  definirTamanho, fragmentoDaSelecao, inserirTexto, quebrarParagrafo, tamanhoDoParagrafo,
  type Selecao,
} from './edicao';
import { marcadorDaLista, textoDoBloco } from './documento';

/*
  As tarefas do laboratório de formatação da AP042.

  A solução de referência é feita com as mesmas chamadas do motor que as
  teclas fazem — selecionar, apertar, colar —, e não montando o documento
  final à mão: um documento montado à mão provaria que a meta aceita um
  documento, e não que dá para chegar nele.
*/

const feitas = (c: ContextoDaFormatacao) => METAS_DA_FORMATACAO.filter(m => m.feita(c)).map(m => m.id);

const id = (d: Doc, frase: string) => acharParagrafo(d, frase)!.id;
const inteiro = (d: Doc, frase: string): Selecao => {
  const b = acharParagrafo(d, frase)!;
  return { ancora: { bloco: b.id, offset: 0 }, foco: { bloco: b.id, offset: tamanhoDoParagrafo(b) } };
};
const doPrimeiroAoUltimo = (d: Doc, de: string, ate: string): Selecao => {
  const b = acharParagrafo(d, ate)!;
  return { ancora: { bloco: id(d, de), offset: 0 }, foco: { bloco: b.id, offset: tamanhoDoParagrafo(b) } };
};
const pedaco = (d: Doc, frase: string): Selecao => {
  const b = acharParagrafo(d, frase)!;
  const k = textoDoBloco(b).indexOf(frase);
  return { ancora: { bloco: b.id, offset: k }, foco: { bloco: b.id, offset: k + frase.length } };
};

function resolver(): ContextoDaFormatacao {
  let d: Doc = { ...DOC_DA_FORMATACAO, pagina: { papel: 'A4', orientacao: 'retrato', margens: 'normal' } };
  /* Copiar a primeira linha e colar numa linha nova depois da data. */
  const copiado = fragmentoDaSelecao(d, inteiro(d, NOME_DO_CLUBE));
  const data = acharParagrafo(d, 'Curitiba')!;
  const enter = quebrarParagrafo(d, cursorEm(data.id, tamanhoDoParagrafo(data)));
  d = colarFragmento(enter.doc, enter.selecao, copiado).doc;

  d = definirFonte(d, inteiro(d, 'Relatório do acampamento'), 'Georgia').doc;
  d = definirTamanho(d, inteiro(d, 'Relatório do acampamento'), 20).doc;
  d = alternarMarca(d, inteiro(d, 'Relatório do acampamento'), 'negrito').doc;
  d = alternarMarca(d, pedaco(d, NOME_DO_LIVRO), 'italico').doc;
  d = alternarMarca(d, inteiro(d, 'Curitiba'), 'sublinhado').doc;

  d = alinhar(d, cursorEm(id(d, 'Relatório do acampamento'), 3), 'centro').doc;
  d = alinhar(d, doPrimeiroAoUltimo(d, 'A nossa unidade', 'Nas noites'), 'justificado').doc;
  d = alinhar(d, cursorEm(id(d, 'Curitiba'), 0), 'direita').doc;
  d = definirEntrelinha(d, doPrimeiroAoUltimo(d, 'A nossa unidade', 'Nas noites'), 1.5).doc;

  d = alternarLista(d, doPrimeiroAoUltimo(d, 'Saco de dormir', 'Prato, caneca'), 'marcadores').doc;
  d = alternarLista(d, doPrimeiroAoUltimo(d, 'Escolher o terreno', 'Levantar as varetas'), 'numeracao').doc;
  return { doc: d, colou: true };
}

describe('as tarefas da formatação', () => {
  it('nenhuma abre cumprida', () => {
    expect(feitas({ doc: DOC_DA_FORMATACAO, colou: false })).toEqual([]);
  });

  it('a solução de referência fecha todas', () => {
    expect(feitas(resolver())).toEqual(METAS_DA_FORMATACAO.map(m => m.id));
  });

  /* Escrever o nome do clube de novo deixa o documento igual ao de quem
     colou, e não é o que o requisito 3.2 pede. */
  it('digitar o nome do clube não vale por copiar e colar', () => {
    let d = DOC_DA_FORMATACAO;
    const data = acharParagrafo(d, 'Curitiba')!;
    const enter = quebrarParagrafo(d, cursorEm(data.id, tamanhoDoParagrafo(data)));
    d = inserirTexto(enter.doc, enter.selecao, NOME_DO_CLUBE).doc;
    expect(feitas({ doc: d, colou: false })).not.toContain('copiar');
    expect(feitas({ doc: d, colou: true })).toContain('copiar');
  });

  it('itálico no parágrafo inteiro não é o nome do livro em itálico', () => {
    const r = resolver();
    /* O nome já está em itálico e o resto não: alternar o parágrafo inteiro
       liga o itálico no resto, que é o que a tarefa não pede. */
    const paragrafoTodo = alternarMarca(r.doc, inteiro(r.doc, 'Nas noites'), 'italico').doc;
    expect(feitas({ doc: paragrafoTodo, colou: true })).not.toContain('destaque');
  });

  it('a numeração é do programa, e se refaz quando um item sai do meio', () => {
    const { doc } = resolver();
    const passos = ['Escolher o terreno', 'Estender a lona', 'Levantar as varetas'].map(f => id(doc, f));
    expect(passos.map(p => marcadorDaLista(doc, p))).toEqual(['1.', '2.', '3.']);
    const semOMeio = { ...doc, blocos: doc.blocos.filter(b => b.id !== passos[1]) };
    expect(marcadorDaLista(semOMeio, passos[2])).toBe('2.');
  });
});
