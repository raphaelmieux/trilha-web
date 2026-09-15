import { describe, it, expect } from 'vitest';
import {
  OFICIO_INICIAL, TEXTO_ORIGINAL, METAS_DO_OFICIO, ESTILO_ESPERADO,
  textoIntacto, metaDaVez, type Doc,
} from './oficioDoClube';
import {
  aparenciaDe, aparenciaDoTrecho, comFormatacaoDireta, textoDoDoc, titulosDoDoc,
  paragrafos, ehParagrafo,
  type Estilo,
} from './documento';

/*
  O relatório mal formatado da CC-ES002, e as cinco metas que o consertam.

  Duas perguntas, e as duas já custaram caro noutros laboratórios:

  - **ele abre resolvido?** Um laboratório que nasce com tarefa verde dá nota
    de graça, e o erro é invisível de dentro — o painel mostra o que se espera
    de um laboratório funcionando;
  - **ele pode ser vencido?** É o outro lado, e é pior: quem fez tudo certo
    fica olhando uma lista vermelha sem nada na tela que explique. Por isso há
    uma solução de referência aqui, e ela precisa deixar a lista inteira verde.

  A terceira pergunta é só desta vereda. O requisito 6 diz "sem alterar uma
  palavra do texto", e uma trava que não medisse isso deixaria passar a solução
  mais rápida e mais errada que existe: apagar o parágrafo feio e redigitá-lo.
*/

/* ── A solução de referência ──────────────────────────────────────────────── */

const comEstilo = (d: Doc, id: string, estilo: Estilo): Doc => ({
  ...d,
  blocos: d.blocos.map(b => (b.id === id && ehParagrafo(b) ? { ...b, estilo } : b)),
});

const semDireta = (d: Doc): Doc => ({
  ...d,
  blocos: d.blocos.map(b => (ehParagrafo(b)
    ? { ...b, trechos: b.trechos.map(({ direta, ...x }) => { void direta; return x; }) }
    : b)),
});

const modificando = (d: Doc, estilo: Estilo, ajuste: { tamanho?: number; cor?: string }): Doc =>
  ({ ...d, estilos: { ...d.estilos, [estilo]: { ...d.estilos?.[estilo], ...ajuste } } });

const gerandoSumario = (d: Doc): Doc => ({ ...d, sumario: titulosDoDoc(d) });

/** O documento como quem faz tudo certo o deixa. */
function resolvido(): Doc {
  let d: Doc = OFICIO_INICIAL;
  for (const [id, estilo] of Object.entries(ESTILO_ESPERADO)) d = comEstilo(d, id, estilo);
  d = semDireta(d);
  d = modificando(d, 'Título 2', { cor: '#7F2C1E' });
  return gerandoSumario(d);
}

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('o relatório abre por fazer', () => {
  it('nenhuma das cinco metas está cumprida no primeiro segundo', () => {
    const verdes = METAS_DO_OFICIO.filter(m => m.feita(OFICIO_INICIAL)).map(m => m.id);
    expect(verdes,
      'estas metas abrem verdes. Tarefa que nasce cumprida ensina a não ler a lista, '
      + 'e o painel fica igualzinho ao de um laboratório funcionando.').toEqual([]);
  });

  it('todo título chega como parágrafo comum, e é isso que engana', () => {
    /*
      Eles *parecem* títulos — negrito, tamanho e cor postos à mão. O documento
      passa por bem feito, e o único sinal está no que ele não faz.
    */
    for (const id of Object.keys(ESTILO_ESPERADO)) {
      const b = paragrafos(OFICIO_INICIAL).find(x => x.id === id);
      expect(b, `o bloco "${id}" sumiu do documento`).toBeTruthy();
      expect(b!.estilo, `"${id}" já chega com estilo — não haveria o que consertar`).toBe('Normal');
      expect(b!.trechos.some(x => x.direta),
        `"${id}" chega sem formatação direta nenhuma, então ele não parece um título `
        + 'e o documento não engana ninguém').toBe(true);
    }
  });

  it('o sumário sairia vazio, que é o defeito que ninguém vê', () => {
    expect(titulosDoDoc(OFICIO_INICIAL),
      'o sumário acharia títulos no documento de partida. O sumário lê estilo, e '
      + 'não negrito — é esse o buraco que a lição existe para mostrar.').toEqual([]);
  });
});

describe('o relatório pode ser vencido', () => {
  it('a solução de referência deixa a lista inteira verde', () => {
    const d = resolvido();
    const vermelhas = METAS_DO_OFICIO.filter(m => !m.feita(d)).map(m => m.id);
    expect(vermelhas,
      'estas metas continuam vermelhas depois de a solução de referência fazer tudo. '
      + 'Laboratório impossível de vencer é pior do que um que abre resolvido.').toEqual([]);
  });

  it('cada meta é a primeira da vez em algum momento do caminho', () => {
    /*
      Sem isto, uma meta que nenhuma ordem de trabalho alcança ficaria fora do
      passo a passo para sempre: quem travasse nela receberia a ajuda de outra.
    */
    let d: Doc = OFICIO_INICIAL;
    const vistas: string[] = [];
    const passos: ((x: Doc) => Doc)[] = [
      x => Object.entries(ESTILO_ESPERADO)
        .filter(([, e]) => e === 'Título 1' || e === 'Título 2')
        .reduce((acc, [id, e]) => comEstilo(acc, id, e), x),
      x => Object.entries(ESTILO_ESPERADO)
        .filter(([, e]) => e === 'Citação' || e === 'Legenda')
        .reduce((acc, [id, e]) => comEstilo(acc, id, e), x),
      semDireta,
      x => modificando(x, 'Título 2', { cor: '#7F2C1E' }),
      gerandoSumario,
    ];
    for (const passo of passos) {
      vistas.push(metaDaVez(d)!.id);
      d = passo(d);
    }
    expect(vistas).toEqual(METAS_DO_OFICIO.map(m => m.id));
    expect(metaDaVez(d), 'sobrou meta depois do último passo').toBeNull();
  });
});

describe('o texto não muda — são as palavras do requisito 6', () => {
  it('trocar uma única palavra reprova as metas que mexem em parágrafo', () => {
    /*
      Redigitar o título é o atalho mais rápido e o mais errado: num documento
      de verdade é assim que se perde um parágrafo inteiro sem perceber. Sem
      esta conta, ele passaria — e a plataforma estaria premiando o gesto que o
      requisito existe para proibir.
    */
    let d = resolvido();
    d = {
      ...d,
      blocos: d.blocos.map(b => (b.id === 'titulo' && ehParagrafo(b)
        ? { ...b, trechos: [{ ...b.trechos[0], texto: 'Relatório de Atividades — 1º Semestre' }] }
        : b)),
    };

    expect(textoIntacto(d)).toBe(false);
    const quebradas = METAS_DO_OFICIO.filter(m => !m.feita(d)).map(m => m.id);
    expect(quebradas,
      'mudar uma palavra passou despercebido').toContain('titulos');
  });

  it('a comparação é com o documento de partida, e não com o de agora', () => {
    // Apagar um parágrafo e reescrevê-lo idêntico continua valendo; apagar e
    // não repor, não. O congelamento é o que enxerga a segunda.
    const semUm: Doc = {
      ...OFICIO_INICIAL,
      blocos: OFICIO_INICIAL.blocos.filter(b => b.id !== 'ab-2'),
    };
    expect(textoIntacto(semUm)).toBe(false);
    expect(textoDoDoc(OFICIO_INICIAL)).toBe(TEXTO_ORIGINAL);
  });
});

describe('a formatação direta vence o estilo, e é por isso que ela tem de sair', () => {
  it('com a direta em cima, mudar o estilo não muda o que se vê', () => {
    /*
      Esta é a lição inteira da vereda, medida. Um documento com os estilos
      aplicados **e** o negrito ainda por cima responde a "modifiquei o estilo?"
      com sim e à pessoa que olha a tela com nada.
    */
    let d: Doc = OFICIO_INICIAL;
    for (const [id, estilo] of Object.entries(ESTILO_ESPERADO)) d = comEstilo(d, id, estilo);
    const comDireta = modificando(d, 'Título 2', { tamanho: 24 });
    const cabecalho = paragrafos(comDireta).find(b => b.id === 'h-abertura')!;

    expect(aparenciaDe(comDireta, 'Título 2').fontSize,
      'a redefinição do estilo não pegou').toBe(24);
    expect(aparenciaDoTrecho(comDireta, cabecalho, cabecalho.trechos[0]).fontSize,
      'o trecho seguiu o estilo mesmo com formatação direta em cima — no Word a '
      + 'direta vence, e é essa precedência que faz a meta "limpar" existir').toBe(13);

    const limpo = semDireta(comDireta);
    const dela = paragrafos(limpo).find(b => b.id === 'h-abertura')!;
    expect(aparenciaDoTrecho(limpo, dela, dela.trechos[0]).fontSize,
      'depois de limpar, o trecho precisa seguir o estilo').toBe(24);
  });

  it('modificar um estilo alcança as quatro seções de uma vez', () => {
    // O requisito 8, medido: uma mexida, quatro parágrafos.
    const d = modificando(semDireta(resolvido()), 'Título 2', { cor: '#7F2C1E' });
    const seguem = ['h-abertura', 'h-atividades', 'h-numeros', 'h-fecho'].map(id => {
      const b = paragrafos(d).find(x => x.id === id)!;
      return aparenciaDoTrecho(d, b, b.trechos[0]).color;
    });
    expect(seguem).toEqual(['#7F2C1E', '#7F2C1E', '#7F2C1E', '#7F2C1E']);
  });

  it('o documento de partida tem formatação direta para limpar', () => {
    // A guarda contra o vazio: sem nenhuma, a meta "limpar" abriria verde e
    // este arquivo inteiro estaria conferindo um exercício que não existe.
    expect(comFormatacaoDireta(OFICIO_INICIAL).length).toBeGreaterThanOrEqual(7);
  });
});

describe('cada meta diz onde e como', () => {
  it('nenhuma fica sem passo a passo nem sem lugar na faixa', () => {
    for (const m of METAS_DO_OFICIO) {
      expect(m.passos.length, `"${m.id}" não tem passo a passo`).toBeGreaterThanOrEqual(2);
      expect(m.onde, `"${m.id}" não diz onde isso se resolve`).toMatch(/›/);
      expect(m.detalhe.length, `"${m.id}" não explica o que se pede`).toBeGreaterThan(40);
    }
  });
});
