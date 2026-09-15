import { describe, it, expect } from 'vitest';
import {
  SEM_SELECAO, apenas, aoClicar, aoAbrirMenu, aoComecarArrasto, aoMarcarCaixa,
  intervalo, podar, todos, semMouse,
} from './selecao';

/*
  As regras da seleção múltipla do Explorador.

  Elas moram fora dos dois laboratórios porque duas seleções ligeiramente
  diferentes seriam dois Windows — a mesma razão que tirou a janela de dentro de
  `FileManagerLab` e fez `explorer.tsx`. E são conferidas aqui, sem React, porque
  o que erra nelas erra calado: uma faixa de arquivos escolhida a mais ou a
  menos não estoura nada, ela só faz o comando seguinte agir sobre o conjunto
  errado.
*/

/** Cinco linhas, na ordem em que a tela as mostra. */
const TELA = ['a', 'b', 'c', 'd', 'e'];

const sem = { ctrl: false, shift: false };
const comCtrl = { ctrl: true, shift: false };
const comShift = { ctrl: false, shift: true };
const comAmbos = { ctrl: true, shift: true };

describe('o clique sem tecla nenhuma', () => {
  it('passa a valer só a linha clicada', () => {
    const antes = { ids: ['a', 'b', 'c'], ancora: 'a' };
    expect(aoClicar(antes, 'e', TELA, sem)).toEqual({ ids: ['e'], ancora: 'e' });
  });
});

describe('o Ctrl alterna uma linha de cada vez', () => {
  it('acrescenta a que estava fora', () => {
    const depois = aoClicar(apenas('a'), 'c', TELA, comCtrl);
    expect(depois.ids).toEqual(['a', 'c']);
  });

  it('tira a que já estava dentro, sem mexer nas outras', () => {
    const antes = { ids: ['a', 'b', 'c'], ancora: 'a' };
    expect(aoClicar(antes, 'b', TELA, comCtrl).ids).toEqual(['a', 'c']);
  });

  it('leva a âncora junto, mesmo quando tira', () => {
    // O Shift seguinte mede da última linha clicada, tenha ela entrado ou saído.
    expect(aoClicar({ ids: ['a', 'b'], ancora: 'a' }, 'b', TELA, comCtrl).ancora).toBe('b');
  });
});

describe('o Shift escolhe a faixa entre a âncora e o clique', () => {
  it('pega tudo o que está entre as duas, nos dois sentidos', () => {
    expect(aoClicar(apenas('b'), 'd', TELA, comShift).ids).toEqual(['b', 'c', 'd']);
    expect(aoClicar(apenas('d'), 'b', TELA, comShift).ids).toEqual(['b', 'c', 'd']);
  });

  it('deixa a âncora onde está, para a faixa poder encolher', () => {
    /*
      É esta a propriedade que a âncora existe para dar. Se ela andasse a cada
      Shift, a faixa caminharia pela lista em vez de crescer e encolher a partir
      de um ponto — e clicar mais perto do início nunca devolveria uma seleção
      menor, que é metade do uso do Shift.
    */
    const primeiro = aoClicar(apenas('a'), 'e', TELA, comShift);
    expect(primeiro.ids).toEqual(TELA);
    const segundo = aoClicar(primeiro, 'c', TELA, comShift);
    expect(segundo.ids).toEqual(['a', 'b', 'c']);
    expect(segundo.ancora).toBe('a');
  });

  it('corre a ordem da TELA, e não a ordem em que os ids chegaram', () => {
    /*
      Depois de classificar por data, a ordem da tela não é mais a da árvore.
      Medir a faixa na ordem errada escolheria linhas que não estão entre as
      duas em que a pessoa clicou — e ela veria uma seleção que não pediu, sem
      nada explicando de onde saiu.
    */
    const ordenada = ['e', 'd', 'c', 'b', 'a'];
    expect(aoClicar(apenas('e'), 'c', ordenada, comShift).ids).toEqual(['e', 'd', 'c']);
  });

  it('sem âncora, vale como um clique comum', () => {
    expect(aoClicar(SEM_SELECAO, 'c', TELA, comShift)).toEqual({ ids: ['c'], ancora: 'c' });
  });

  it('com a âncora fora da tela, vale como um clique comum', () => {
    // A âncora ficou numa pasta que já não é esta, ou num resultado de busca
    // que saiu de cena: medir a partir dela devolveria vazio.
    expect(aoClicar({ ids: ['z'], ancora: 'z' }, 'c', TELA, comShift))
      .toEqual({ ids: ['c'], ancora: 'c' });
  });
});

describe('Ctrl+Shift acrescenta uma segunda faixa', () => {
  it('soma a faixa nova ao que já havia, sem repetir', () => {
    const primeira = aoClicar(apenas('a'), 'b', TELA, comShift);
    const comAncoraNova = aoClicar(primeira, 'd', TELA, comCtrl);
    const segunda = aoClicar(comAncoraNova, 'e', TELA, comAmbos);
    expect(segunda.ids).toEqual(['a', 'b', 'd', 'e']);
  });
});

describe('o botão direito e o arrasto preservam a seleção', () => {
  it('numa linha já selecionada, nada muda', () => {
    /*
      É o detalhe sem o qual a seleção múltipla não serve para nada: escolher
      cinco arquivos, clicar com o direito num deles e mandar compactar
      encolheria para um no caminho. O pacote sairia com um arquivo só, e a
      tarefa diria "o pacote tem menos de três itens" — acusando a pessoa de um
      erro que a tela cometeu.
    */
    const cinco = { ids: TELA, ancora: 'a' };
    expect(aoAbrirMenu(cinco, 'c')).toBe(cinco);
    expect(aoComecarArrasto(cinco, 'c')).toBe(cinco);
  });

  it('numa linha de fora, a seleção passa a ser só ela', () => {
    const antes = { ids: ['a', 'b'], ancora: 'a' };
    expect(aoAbrirMenu(antes, 'e')).toEqual({ ids: ['e'], ancora: 'e' });
    expect(aoComecarArrasto(antes, 'e')).toEqual({ ids: ['e'], ancora: 'e' });
  });
});

describe('a caixa de seleção de item', () => {
  it('alterna, sempre — é para isso que ela existe', () => {
    const marcada = aoMarcarCaixa(apenas('a'), 'c');
    expect(marcada.ids).toEqual(['a', 'c']);
    expect(aoMarcarCaixa(marcada, 'a').ids).toEqual(['c']);
  });
});

describe('a poda tira da seleção o que saiu da tela', () => {
  it('derruba os ids que não estão mais à vista', () => {
    expect(podar({ ids: ['a', 'z', 'c'], ancora: 'a' }, TELA).ids).toEqual(['a', 'c']);
  });

  it('derruba a âncora invisível, para o Shift não medir do que ninguém vê', () => {
    expect(podar({ ids: ['a'], ancora: 'z' }, TELA).ancora).toBeNull();
  });

  it('devolve o mesmo objeto quando não há o que podar', () => {
    // Identidade preservada porque o resultado alimenta um `useMemo`: um objeto
    // novo a cada render faria a lista inteira redesenhar sem nada ter mudado.
    const intacta = { ids: ['a', 'b'], ancora: 'a' };
    expect(podar(intacta, TELA)).toBe(intacta);
  });
});

describe('selecionar tudo', () => {
  it('pega a tela inteira e ancora na primeira', () => {
    expect(todos(TELA)).toEqual({ ids: TELA, ancora: 'a' });
  });

  it('numa pasta vazia não inventa âncora', () => {
    expect(todos([])).toEqual({ ids: [], ancora: null });
  });
});

describe('o intervalo', () => {
  it('inclui os dois extremos', () => {
    expect(intervalo(TELA, 'b', 'b')).toEqual(['b']);
  });

  it('é vazio quando um extremo não está na tela', () => {
    expect(intervalo(TELA, 'a', 'z')).toEqual([]);
  });
});

describe('as caixas nascem ligadas em quem não tem mouse', () => {
  it('sem `matchMedia`, responde não', () => {
    /*
      O jsdom não tem `matchMedia`, e o instante antes de a tela existir também
      não. O padrão cai para o lado que não muda o desenho de quem já tinha
      teclado — e as caixas continuam a um clique no menu Exibir.
    */
    expect(semMouse()).toBe(false);
  });
});
