import { describe, it, expect } from 'vitest';
import { PLANILHA_INICIAL, vazia, nomeDaFaixa, type Planilha } from './metasDaAp043';
import {
  mover, proxima, escrever, limpar, copiar, colar,
  inserirLinha, excluirLinha, inserirColuna, excluirColuna,
  mesclar, desmesclar, mesclagemApaga,
  historicoDe, registrar, desfazer, refazer, PASSOS_GUARDADOS,
} from './planilha';

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
