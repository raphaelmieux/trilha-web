import { describe, it, expect } from 'vitest';
import {
  APARENCIA_DO_ESTILO, NIVEL_DO_TITULO, ehTitulo,
  trechoDe, blocoDe, linhaDe, textoDoBloco, titulosDoDoc, sumarioAtualizado,
  aplicarCaixa, NOMES_DA_CAIXA, paragrafos, paragrafosVazios, ehParagrafo,
  campoDe, numeroDoCampo, textoDoTrecho, blocoAntesDoSumario,
  type Doc, type Estilo, type ModoDeCaixa,
} from './documento';
import { DOC_INICIAL, METAS_DOS_ESTILOS } from './metasDaAp044';
import { OFICIO_INICIAL } from './oficioDoClube';
import { RELATORIO_ANUAL_INICIAL } from './relatorioAnual';

/*
  O modelo de documento, depois de ele sair do arquivo de metas da AP044.

  ── O que esta trava existe para pegar ──────────────────────────────────
  Um recorte erra de um jeito só: uma peça deixa de ser desenhada, ou muda de
  significado, e nada estoura. Aqui a peça mais fácil de perder é a mais
  importante — o sumário guarda o que leu. Trocá-lo por uma conta feita na
  hora deixa todos os testes da AP044 passando e apaga a metade da lição que
  ninguém conta: um sumário que se atualiza sozinho nunca fica velho, e o
  laboratório passaria a premiar um cuidado que ele não teve como cobrar.

  A segunda é a aparência. Ela e a lista de estilos moram no mesmo arquivo de
  propósito: um estilo é o nome mais o que ele faz, e acrescentar um sem
  aparência é acrescentar um nome que se desenha como texto comum.
*/

const AGORA: Doc<'unica'> = {
  blocos: [
    { ...linhaDe('h1', 'unica', 'Antes do acampamento'), estilo: 'Título 1' },
    linhaDe('p1', 'unica', 'Leia com quem vai assinar.'),
    { ...linhaDe('h2', 'unica', 'A lista de inscritos'), estilo: 'Título 2' },
    { ...linhaDe('h3', 'unica', 'Quem falta pagar'), estilo: 'Título 3' },
    { ...linhaDe('leg', 'unica', 'Figura 1 — a fogueira'), estilo: 'Legenda' },
  ],
  colunas: { unica: 1 },
  sumario: null,
};

describe('o modelo de documento', () => {
  it('todo estilo tem aparência, e nenhuma aparência sobra', () => {
    /* Um estilo sem aparência se desenha como texto comum, e um estilo na
       aparência que não existe na lista é uma regra que ninguém aplica. */
    const estilos = Object.keys(NIVEL_DO_TITULO) as Estilo[];
    for (const e of estilos) {
      expect(APARENCIA_DO_ESTILO[e], `${e} não tem aparência`).toBeTruthy();
    }
    expect(Object.keys(APARENCIA_DO_ESTILO).length).toBeGreaterThanOrEqual(estilos.length);
    for (const e of Object.keys(APARENCIA_DO_ESTILO)) {
      expect(APARENCIA_DO_ESTILO[e as Estilo].fontSize, `${e} sem tamanho`).toBeTruthy();
    }
  });

  it('nenhuma aparência usa a forma curta de margem', () => {
    /* Misturar `margin` com `marginLeft` no mesmo objeto faz o React reclamar
       e deixa a ordem de aplicação decidir quem vence. */
    for (const [nome, css] of Object.entries(APARENCIA_DO_ESTILO)) {
      expect(css, `${nome} usa a forma curta`).not.toHaveProperty('margin');
      expect(css, `${nome} não diz a margem de cima`).toHaveProperty('marginTop');
    }
  });

  it('só os três Títulos rendem entrada de sumário', () => {
    expect(ehTitulo('Título 1')).toBe(true);
    expect(ehTitulo('Título 3')).toBe(true);
    /* Legenda e Citação são estilos de parágrafo e não são estrutura: um
       sumário que os lesse listaria as fotos entre as seções. */
    expect(ehTitulo('Legenda')).toBe(false);
    expect(ehTitulo('Citação')).toBe(false);
    expect(ehTitulo('Normal')).toBe(false);
  });

  it('os títulos saem na ordem do documento, com o nível e a folha de cada um', () => {
    /* A folha entra porque o sumário a grava: é ela que envelhece primeiro
       num documento de verdade, quando uma seção nova empurra as seguintes.
       Aqui não há quebra de página, então todos estão na folha 1. */
    expect(titulosDoDoc(AGORA)).toEqual([
      { texto: 'Antes do acampamento', nivel: 1, pagina: 1 },
      { texto: 'A lista de inscritos', nivel: 2, pagina: 1 },
      { texto: 'Quem falta pagar', nivel: 3, pagina: 1 },
    ]);
  });

  it('o título que a quebra de página empurra muda de folha', () => {
    /*
      A conta que o sumário grava. Sem ela, um documento de quatro folhas teria
      um sumário mandando todo mundo para a folha 1 — e o número ali é a única
      coisa que o sumário existe para dizer.
    */
    const comQuebra: Doc<'unica'> = {
      ...AGORA,
      blocos: AGORA.blocos.map(b => (b.id === 'h2' ? { ...b, quebraDePagina: true } : b)),
    };
    expect(titulosDoDoc(comQuebra).map(t => t.pagina)).toEqual([1, 2, 2]);
  });

  it('o sumário guarda o que leu, e envelhece calado', () => {
    /*
      É a peça que o recorte poderia ter perdido, e a única cuja perda deixaria
      todos os outros testes verdes. Um modelo que recalculasse o sumário a
      cada leitura nunca ficaria velho — e a lição do Atualizar Sumário
      deixaria de existir sem que nada reprovasse.
    */
    const gerado: Doc<'unica'> = { ...AGORA, sumario: titulosDoDoc(AGORA) };
    expect(sumarioAtualizado(gerado)).toBe(true);

    const corrigido: Doc<'unica'> = {
      ...gerado,
      blocos: gerado.blocos.map(b => (b.id === 'h1'
        ? { ...b, trechos: [trechoDe('h1-a', 'Antes de sair de casa')] }
        : b)),
    };
    expect(titulosDoDoc(corrigido)[0].texto).toBe('Antes de sair de casa');
    expect(corrigido.sumario![0].texto, 'o sumário se atualizou sozinho').toBe('Antes do acampamento');
    expect(sumarioAtualizado(corrigido)).toBe(false);
  });

  it('sem sumário gerado, ele não conta como em dia', () => {
    expect(sumarioAtualizado(AGORA)).toBe(false);
  });

  it('o texto do bloco junta os trechos na ordem', () => {
    const b = blocoDe('x', 'unica', [
      trechoDe('x-a', 'Garrafa com 2 litros de H'),
      trechoDe('x-b', '2'),
      trechoDe('x-c', 'O'),
    ]);
    expect(textoDoBloco(b)).toBe('Garrafa com 2 litros de H2O');
  });

  it('o botão Aa faz os cinco modos, e cada um tem o nome do Word', () => {
    const modos: ModoDeCaixa[] = ['frase', 'minusculas', 'maiusculas', 'palavras', 'alternar'];
    for (const m of modos) expect(NOMES_DA_CAIXA[m], `${m} sem nome`).toBeTruthy();

    expect(aplicarCaixa('MANUAL DO ACAMPAMENTO', 'frase')).toBe('Manual do acampamento');
    expect(aplicarCaixa('Manual', 'maiusculas')).toBe('MANUAL');
    expect(aplicarCaixa('MANUAL', 'minusculas')).toBe('manual');
    expect(aplicarCaixa('manual do acampamento', 'palavras')).toBe('Manual Do Acampamento');
    expect(aplicarCaixa('Manual', 'alternar')).toBe('mANUAL');
  });

  it('o acento sobrevive à troca de caixa', () => {
    /* `toUpperCase` sem locale erra em turco e tropeça em acento composto: a
       trilha inteira é em português, e o nome do clube tem acento. */
    expect(aplicarCaixa('programação', 'maiusculas')).toBe('PROGRAMAÇÃO');
    expect(aplicarCaixa('ÊNFASE E ÁGUA', 'frase')).toBe('Ênfase e água');
  });
});

describe('o documento da AP044 continua o que era', () => {
  /*
    O recorte não pode ter mexido no exercício que já foi entregue e fechado
    por gente. Estas três linhas são o contrato: ele abre sem estilo nenhum,
    sem sumário, e com as nove metas que ele sempre teve.
  */
  it('abre sem um estilo sequer', () => {
    const comEstilo = paragrafos(DOC_INICIAL).filter(b => b.estilo !== 'Normal');
    expect(comEstilo).toEqual([]);
    expect(DOC_INICIAL.blocos.length).toBeGreaterThan(10);
  });

  it('abre sem sumário', () => {
    expect(DOC_INICIAL.sumario).toBeNull();
    expect(titulosDoDoc(DOC_INICIAL)).toEqual([]);
  });

  it('continua cobrando as mesmas nove metas', () => {
    expect(METAS_DOS_ESTILOS).toHaveLength(9);
    expect(METAS_DOS_ESTILOS.every(m => m.passos.length > 0)).toBe(true);
  });
});

describe('os blocos que não são parágrafo', () => {
  /*
    Tabela e imagem entraram no modelo pela CC-ES002, e as duas leituras que
    elas quebram quebram **caladas**: uma conta a mais num filtro, um número
    que anda uma casa. Nenhuma das duas estoura, e as duas chegam à tela como
    um documento plausível.
  */
  const comImagemETabela: Doc<'unica'> = {
    blocos: [
      linhaDe('p1', 'unica', 'A fogueira foi acesa às 19h.'),
      {
        tipo: 'imagem', id: 'img', secao: 'unica',
        arquivo: 'fogueira.jpg', descricao: 'A fogueira', disposicao: 'quadrada',
      },
      {
        ...linhaDe('leg-fig', 'unica', ''), estilo: 'Legenda',
        trechos: [campoDe('leg-fig-n', 'figura'), trechoDe('leg-fig-t', ' — A fogueira.')],
      },
      linhaDe('vazio', 'unica', ''),
      {
        ...linhaDe('leg-tab', 'unica', ''), estilo: 'Legenda',
        trechos: [campoDe('leg-tab-n', 'tabela'), trechoDe('leg-tab-t', ' — Os inscritos.')],
      },
      {
        tipo: 'tabela', id: 'tab', secao: 'unica',
        linhas: [['Nome', 'Unidade'], ['Rute', 'Tigre']],
        cabecalho: true, estilo: 'Tabela de Lista 3',
      },
    ],
    colunas: { unica: 1 },
    sumario: null,
  };

  it('imagem não é parágrafo vazio', () => {
    /*
      Imagem não tem texto nenhum, então um filtro que olhasse para todo bloco
      sem texto a contaria — e a meta do módulo 2, que pede zero parágrafos
      vazios, passaria a exigir que se apagasse a foto para ficar verde.
    */
    const vazios = paragrafosVazios(comImagemETabela).map(b => b.id);
    expect(vazios, 'um bloco que não é parágrafo entrou na conta dos vazios')
      .toEqual(['vazio']);
  });

  it('figura e tabela numeram em séries separadas', () => {
    /*
      No Word a Figura 1 e a Tabela 1 convivem: uma série não empurra a outra.
      Contar todos os campos juntos daria "Tabela 2" à primeira tabela do
      documento, que é um número plausível apontando para nada.
    */
    expect(numeroDoCampo(comImagemETabela, 'leg-fig-n')).toBe(1);
    expect(numeroDoCampo(comImagemETabela, 'leg-tab-n'),
      'a legenda da tabela foi empurrada pela figura que veio antes').toBe(1);
    expect(textoDoTrecho(comImagemETabela, comImagemETabela.blocos
      .filter(ehParagrafo).find(b => b.id === 'leg-tab')!.trechos[0])).toBe('Tabela 1');
  });

  it('campo que não está no documento não recebe número', () => {
    /* Zero, e não 1: não há posição para contar, e devolver 1 afirmaria uma
       posição que não existe. */
    expect(numeroDoCampo(comImagemETabela, 'nao-existe')).toBe(0);
  });
});

describe('onde o sumário pousa', () => {
  /*
    Ele abria a folha, acima do nome do documento: o leitor via a lista das
    seções antes de saber de que documento elas eram. Agora fecha a abertura —
    embaixo do título e das linhas que viajam com ele.

    As duas travas daqui são o mesmo defeito por dois lados. Uma regra que
    procurasse parágrafo com estilo de título acertaria o relatório anual e
    erraria calada no ofício, que chega com os cinco títulos em negrito à mão e
    nenhum com estilo — o sumário vazio iria para o pé da última folha, que é
    onde ninguém lê a mensagem que a lição do módulo 1 existe para mostrar.
  */

  it('fecha a abertura do relatório anual, e não abre a folha', () => {
    /* A folha 1 é título, clube e entrega, todos na seção de abertura: o
       sumário vem depois dos três. */
    expect(blocoAntesDoSumario(RELATORIO_ANUAL_INICIAL),
      'o sumário não está embaixo do título do relatório').toBe('entrega');
  });

  it('acha a abertura do ofício mesmo sem um título com estilo', () => {
    /* Nenhum parágrafo do ofício tem estilo de título — é o defeito do módulo
       1. A resposta tem de sair mesmo assim, e sair antes da primeira seção. */
    const semEstiloDeTitulo = paragrafos(OFICIO_INICIAL).every(b => !ehTitulo(b.estilo));
    expect(semEstiloDeTitulo,
      'o ofício ganhou estilo de título e esta trava parou de medir o caso sem título').toBe(true);

    expect(blocoAntesDoSumario(OFICIO_INICIAL),
      'o sumário do ofício saiu de baixo do título').toBe('periodo');
  });

  it('a abertura é o começo da folha, e não toda ocorrência da seção nela', () => {
    /*
      Seção que volta mais adiante: o sumário tem de parar na primeira mudança.
      Um filtro pela seção inteira o empurraria para o meio do conteúdo, entre
      dois parágrafos que não têm nada a ver com ele, e nada acusaria.
    */
    const comSecaoQueVolta: Doc<'capa' | 'corpo'> = {
      blocos: [
        linhaDe('t', 'capa', 'Relatório'),
        linhaDe('c1', 'corpo', 'O acampamento foi em junho.'),
        linhaDe('t2', 'capa', 'Uma linha de capa perdida no meio.'),
      ],
      colunas: { capa: 1, corpo: 1 },
      sumario: null,
    };
    expect(blocoAntesDoSumario(comSecaoQueVolta)).toBe('t');
  });

  it('folha sem bloco nenhum não tem abertura para fechar', () => {
    /* `null` é o topo, e é o que sobra: sem bloco não há o que ficar embaixo. */
    expect(blocoAntesDoSumario({ blocos: [], colunas: { unica: 1 }, sumario: null } as Doc<'unica'>))
      .toBe(null);
  });
});
