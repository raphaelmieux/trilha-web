/**
 * O que o modelo do conjunto promete, medido com peças neutras.
 *
 * As peças daqui não dizem nada — "Aba", "A", "b1" —, de propósito: o que se
 * mede é o **modelo**, e não o conteúdo do projeto do clube. Um teste que
 * usasse o projeto de verdade passaria por uma palavra escrita nele, que é o
 * defeito que o roteiro da apresentação da CC-ES011 teve: a asserção acertava
 * pelo título do slide, e a mutação que tirava o gráfico sobrevivia. Quem
 * confere o projeto de verdade é `metasDaCcEs012.test.ts`.
 */

import { describe, expect, it } from 'vitest';
import { mestreDoModelo, type Apresentacao } from './apresentacao';
import { type Nuvem, type Pessoa } from './arquivoCompartilhado';
import { type Doc } from './documento';
import { type Formulario } from './formulario';
import { planilhaDe, type Caderno } from './planilha';
import {
  INSTRUCOES_EM_BRANCO, MINUTOS_DA_APRESENTACAO,
  NOME_DA_ABA_DE_CONTROLE, NOME_DA_ABA_DE_RESPOSTAS, O_QUE_CADA_UM_FAZ,
  PROPOSTA_EM_BRANCO,
  acessosForaDaFuncao, acompanhaAFonte, aparenciaDe, dentroDoTempo,
  escreverNumero, importarRespostas, instrucoesCompletas,
  numerosDesatualizados, numerosQueNaoAcompanham, pastasForaDoPadrao,
  pecasComColaboracao, pecasForaDaIdentidade, propostaCompleta,
  respostasQueFaltam, valorMostrado, valorNaFonte, vincular,
  type ComoChegou, type IdentidadeDoProjeto, type ProjetoDocumental,
} from './projetoDocumental';

/* ── Peças neutras ────────────────────────────────────────────────────────── */

const IDENTIDADE: IdentidadeDoProjeto = {
  fonteDosTitulos: 'Georgia', fonteDoCorpo: 'Calibri', cor: '#114433',
};

const docNeutro = (): Doc<string> => ({ blocos: [], colunas: { a: 1 }, sumario: null });

const apNeutra = (): Apresentacao =>
  ({ modelo: 'branco', mestre: mestreDoModelo('branco'), slides: [], pdf: null });

const formNeutro = (respostas: Formulario['respostas'] = []): Formulario => ({
  titulo: 'F', descricao: '', aceitandoRespostas: true, respostas,
  campos: [
    { id: 'a', rotulo: 'A', tipo: 'texto-curto', obrigatorio: true, pessoal: false },
    { id: 'b', rotulo: 'B', tipo: 'numero', obrigatorio: false, pessoal: false },
  ],
});

/** Duas abas: a de respostas, vazia, e a de controle com uma soma. */
const cadernoNeutro = (): Caderno => ({
  ativa: 0,
  planilhas: [
    planilhaDe(NOME_DA_ABA_DE_RESPOSTAS, []),
    planilhaDe(NOME_DA_ABA_DE_CONTROLE, [['10'], ['20'], ['=SOMA(A1:A2)']]),
  ],
});

const nuvemNeutra = (): Nuvem => ({ arquivos: [] });

const projetoNeutro = (ajuste: Partial<ProjetoDocumental> = {}): ProjetoDocumental => ({
  proposta: PROPOSTA_EM_BRANCO,
  identidade: IDENTIDADE,
  documento: docNeutro(),
  controle: cadernoNeutro(),
  formulario: formNeutro(),
  apresentacao: apNeutra(),
  dossie: null,
  numeros: [],
  nuvem: nuvemNeutra(),
  equipe: [],
  pastas: [],
  instrucoes: INSTRUCOES_EM_BRANCO,
  minutosDaDemonstracao: null,
  ...ajuste,
});

/** A célula da soma na aba de controle: linha 2, coluna 0, valendo 30. */
const FONTE = { planilha: NOME_DA_ABA_DE_CONTROLE, linha: 2, coluna: 0 };

const numero = (como: ComoChegou, retrato: number) => ({
  id: 'n1' as const, peca: 'documento' as const, alvo: 'b1', como, de: FONTE, retrato,
});

/* ── A proposta, que é o requisito 2 ──────────────────────────────────────── */

describe('a proposta responde às quatro perguntas', () => {
  const cheia = {
    necessidade: 'n', paraQuem: 'q', pecas: ['documento' as const], pronto: 'p',
    aprovadaEm: null,
  };

  it('completa quando as quatro estão escritas', () => {
    expect(propostaCompleta(cheia)).toBe(true);
  });

  it('em branco não está completa', () => {
    expect(propostaCompleta(PROPOSTA_EM_BRANCO)).toBe(false);
  });

  /* O campo que ninguém escreve, e o único que dá ao examinador como dizer
     que o conjunto acabou. Sem este caso, tirar `pronto` da conta sobrevive. */
  it('sem o que conta como pronto, não está completa', () => {
    expect(propostaCompleta({ ...cheia, pronto: '   ' })).toBe(false);
  });

  it('sem peça nenhuma, não está completa', () => {
    expect(propostaCompleta({ ...cheia, pecas: [] })).toBe(false);
  });

  it('sem para quem, não está completa', () => {
    expect(propostaCompleta({ ...cheia, paraQuem: '' })).toBe(false);
  });
});

/* ── Como o número chega ──────────────────────────────────────────────────── */

describe('só o vinculado acompanha a fonte', () => {
  it('vinculado acompanha', () => {
    expect(acompanhaAFonte('vinculado')).toBe(true);
  });

  /* O incorporado é o caso inteiro: a CC-ES011 o ensinou como "a única que
     acompanha", e aqui ele não alcança a planilha de controle — o que ele
     acompanha é a cópia dentro dele, que é uma segunda fonte. */
  it('incorporado não acompanha a planilha de controle', () => {
    expect(acompanhaAFonte('incorporado')).toBe(false);
  });

  it('imagem e digitado não acompanham', () => {
    expect(acompanhaAFonte('imagem')).toBe(false);
    expect(acompanhaAFonte('digitado')).toBe(false);
  });

  it('cada maneira diz também o que ela não faz', () => {
    const vazios = Object.entries(O_QUE_CADA_UM_FAZ)
      .filter(([, o]) => o.faz.trim() === '' || o.naoFaz.trim() === '')
      .map(([k]) => k);
    expect(vazios).toEqual([]);
    expect(Object.keys(O_QUE_CADA_UM_FAZ)).toHaveLength(4);
  });
});

describe('o que a peça mostra, e o que a fonte diz', () => {
  it('a fonte devolve o valor calculado de agora', () => {
    expect(valorNaFonte(projetoNeutro(), FONTE)).toBe(30);
  });

  /* Zero aqui seria o número plausível e errado: um conjunto cuja fonte sumiu
     não tem valor zero, tem valor nenhum. */
  it('aba que não existe não vale zero', () => {
    expect(valorNaFonte(projetoNeutro(), { ...FONTE, planilha: 'Outra' })).toBeUndefined();
  });

  it('célula de texto não vale zero', () => {
    const p = projetoNeutro({
      controle: {
        ativa: 0,
        planilhas: [
          planilhaDe(NOME_DA_ABA_DE_RESPOSTAS, []),
          planilhaDe(NOME_DA_ABA_DE_CONTROLE, [['a'], ['b'], ['c']]),
        ],
      },
    });
    expect(valorNaFonte(p, FONTE)).toBeUndefined();
  });

  it('o vinculado mostra o de agora, e os outros três o retrato', () => {
    const p = projetoNeutro();
    expect(valorMostrado(p, numero('vinculado', 7))).toBe(30);
    expect(valorMostrado(p, numero('incorporado', 7))).toBe(7);
    expect(valorMostrado(p, numero('imagem', 7))).toBe(7);
    expect(valorMostrado(p, numero('digitado', 7))).toBe(7);
  });

  it('o vinculado cai no retrato quando a fonte sumiu', () => {
    const n = { ...numero('vinculado', 7), de: { ...FONTE, planilha: 'Outra' } };
    expect(valorMostrado(projetoNeutro(), n)).toBe(7);
  });
});

describe('quais números já não são os da fonte', () => {
  it('o digitado com outro valor está desatualizado', () => {
    const p = projetoNeutro({ numeros: [numero('digitado', 7)] });
    expect(numerosDesatualizados(p).map(n => n.id)).toEqual(['n1']);
  });

  /* Um retrato que por acaso é igual ao de agora não está divergindo hoje, e
     acusá-lo faria a conta reprovar um conjunto certo. */
  it('o digitado que por acaso bate não está desatualizado', () => {
    const p = projetoNeutro({ numeros: [numero('digitado', 30)] });
    expect(numerosDesatualizados(p)).toEqual([]);
  });

  it('o vinculado nunca está desatualizado', () => {
    const p = projetoNeutro({ numeros: [numero('vinculado', 7)] });
    expect(numerosDesatualizados(p)).toEqual([]);
  });

  /* Vínculo pendurado em aba que não existe não é número desatualizado: é
     vínculo quebrado. Sem a guarda, ele apareceria como "conserte este
     número" — e o conserto é a fonte, que alguém apagou. */
  it('número cuja fonte sumiu não está desatualizado', () => {
    const n = { ...numero('digitado', 7), de: { ...FONTE, planilha: 'Outra' } };
    expect(numerosDesatualizados(projetoNeutro({ numeros: [n] }))).toEqual([]);
  });

  /* As duas contas são diferentes: este não acompanha e ainda assim não
     diverge hoje. Uma conta só deixaria metade do requisito 8 sem medida. */
  it('não acompanhar e estar desatualizado são contas diferentes', () => {
    const p = projetoNeutro({ numeros: [numero('incorporado', 30)] });
    expect(numerosDesatualizados(p)).toEqual([]);
    expect(numerosQueNaoAcompanham(p).map(n => n.id)).toEqual(['n1']);
  });
});

describe('vincular refaz o retrato', () => {
  it('passa a vinculado e mostra o de agora', () => {
    const p = vincular(projetoNeutro({ numeros: [numero('digitado', 7)] }), 'n1');
    expect(p.numeros[0].como).toBe('vinculado');
    expect(valorMostrado(p, p.numeros[0])).toBe(30);
  });

  /* Sem refazer o retrato, a peça continuaria mostrando o número de ontem
     **depois** de a pessoa ter feito exatamente o que a lição pediu — e a
     lista ficaria vermelha com o trabalho certo na tela. */
  it('o retrato guardado passa a ser o de agora', () => {
    const p = vincular(projetoNeutro({ numeros: [numero('digitado', 7)] }), 'n1');
    expect(p.numeros[0].retrato).toBe(30);
  });

  it('não mexe nos outros números', () => {
    const p = projetoNeutro({
      numeros: [numero('digitado', 7), { ...numero('digitado', 9), id: 'n2' }],
    });
    expect(vincular(p, 'n1').numeros[1].como).toBe('digitado');
  });
});

/* ── A identidade, que é o requisito 3.6 ──────────────────────────────────── */

describe('as peças fora da identidade', () => {
  it('as quatro chegam fora dela', () => {
    expect(pecasForaDaIdentidade(projetoNeutro()).sort())
      .toEqual(['apresentacao', 'documento', 'formulario', 'planilha']);
  });

  /* O dossiê é montado a partir das outras: dar a ele um campo de aparência
     seria dar um campo que ninguém consegue errar. */
  it('o dossiê nunca entra na conta', () => {
    expect(pecasForaDaIdentidade(projetoNeutro())).not.toContain('dossie');
    expect(aparenciaDe(projetoNeutro(), 'dossie')).toEqual({});
  });

  it('a apresentação sai da conta com o mestre vestido', () => {
    const p = projetoNeutro();
    const vestida: ProjetoDocumental = {
      ...p,
      apresentacao: {
        ...p.apresentacao,
        mestre: {
          ...p.apresentacao.mestre,
          fonteDoTitulo: IDENTIDADE.fonteDosTitulos,
          fonteDoCorpo: IDENTIDADE.fonteDoCorpo,
          corDoTitulo: IDENTIDADE.cor,
        },
      },
    };
    expect(pecasForaDaIdentidade(vestida)).not.toContain('apresentacao');
  });

  /* Cor ausente conta como divergente: é assim que as cinco chegam, e tratar
     ausente como "não diverge" deixaria o 3.6 verde no segundo zero. */
  it('a fonte certa com a cor ausente ainda diverge', () => {
    const p = projetoNeutro();
    const meioVestida: ProjetoDocumental = {
      ...p,
      apresentacao: {
        ...p.apresentacao,
        mestre: {
          ...p.apresentacao.mestre,
          fonteDoTitulo: IDENTIDADE.fonteDosTitulos,
          fonteDoCorpo: IDENTIDADE.fonteDoCorpo,
          corDoTitulo: '#000000',
        },
      },
    };
    expect(pecasForaDaIdentidade(meioVestida)).toContain('apresentacao');
  });

  it('o documento sai da conta com estilo e família certos', () => {
    const p = projetoNeutro({
      documento: {
        ...docNeutro(),
        fonte: 'sem-serifa',
        estilos: { 'Título 1': { cor: IDENTIDADE.cor } },
      },
    });
    expect(pecasForaDaIdentidade(p)).not.toContain('documento');
  });

  it('a planilha sai da conta com a cor na célula do alto', () => {
    const p = projetoNeutro();
    const controle = p.controle.planilhas[1];
    const comCor = {
      ...controle,
      celulas: controle.celulas.map((l, i) => (i === 0
        ? l.map((c, j) => (j === 0 ? { ...c, cor: IDENTIDADE.cor } : c)) : l)),
    };
    const vestida: ProjetoDocumental = {
      ...p,
      controle: { ...p.controle, planilhas: [p.controle.planilhas[0], comCor] },
    };
    expect(pecasForaDaIdentidade(vestida)).not.toContain('planilha');
  });

  it('o formulário sai da conta com o tema escolhido', () => {
    const p = projetoNeutro({
      formulario: {
        ...formNeutro(),
        aparencia: { fonte: IDENTIDADE.fonteDosTitulos, cor: IDENTIDADE.cor },
      },
    });
    expect(pecasForaDaIdentidade(p)).not.toContain('formulario');
  });
});

/* ── Do formulário para a planilha, que é o requisito 4 ───────────────────── */

const RESPOSTAS = [
  { id: 'r1', em: '2026-03-01T10:00', valores: { a: 'Ana', b: '2' } },
  { id: 'r2', em: '2026-03-02T11:00', valores: { a: 'Bia', b: '3' } },
];

describe('importar as respostas', () => {
  const comRespostas = () => projetoNeutro({ formulario: formNeutro(RESPOSTAS) });

  it('escreve o cabeçalho e uma linha por envio', () => {
    const p = importarRespostas(comRespostas());
    const aba = p.controle.planilhas[0];
    expect(aba.celulas[0][0].texto).not.toBe('');
    expect(aba.celulas[1][1].texto).toBe('Ana');
    expect(aba.celulas[2][1].texto).toBe('Bia');
  });

  /* Refeita, e não acrescentada: importar de novo deixaria as antigas
     duplicadas, e a planilha somaria duas diárias com um total plausível. */
  it('importar duas vezes não duplica nada', () => {
    const uma = importarRespostas(comRespostas());
    const duas = importarRespostas(uma);
    expect(duas.controle.planilhas[0].celulas.map(l => l[1].texto))
      .toEqual(uma.controle.planilhas[0].celulas.map(l => l[1].texto));
    expect(respostasQueFaltam(duas)).toBe(0);
  });

  it('não mexe na aba de controle', () => {
    const p = importarRespostas(comRespostas());
    expect(p.controle.planilhas[1]).toEqual(cadernoNeutro().planilhas[1]);
  });

  it('apaga o que sobrou de uma importação maior', () => {
    const cheio = importarRespostas(comRespostas());
    const magro = importarRespostas({ ...cheio, formulario: formNeutro([RESPOSTAS[0]]) });
    expect(magro.controle.planilhas[0].celulas[2][1].texto).toBe('');
  });
});

describe('as respostas que faltam', () => {
  it('todas faltam antes de importar', () => {
    expect(respostasQueFaltam(projetoNeutro({ formulario: formNeutro(RESPOSTAS) }))).toBe(2);
  });

  it('nenhuma falta depois de importar', () => {
    expect(respostasQueFaltam(importarRespostas(
      projetoNeutro({ formulario: formNeutro(RESPOSTAS) }),
    ))).toBe(0);
  });

  /* O caminho errado que distingue a conta: doze nomes digitados à mão dão
     doze linhas e nenhuma resposta importada. Contar linhas preenchidas daria
     a tarefa por cumprida a quem redigitou — o gesto que o requisito 4 proíbe. */
  it('nomes digitados à mão não contam como importados', () => {
    const p = projetoNeutro({ formulario: formNeutro(RESPOSTAS) });
    const aba = p.controle.planilhas[0];
    const digitada = {
      ...aba,
      celulas: aba.celulas.map((l, i) => (i >= 1 && i <= 2
        ? l.map((c, j) => (j === 1 ? { ...c, texto: i === 1 ? 'Ana' : 'Bia' } : c)) : l)),
    };
    const mao: ProjetoDocumental = {
      ...p,
      controle: { ...p.controle, planilhas: [digitada, p.controle.planilhas[1]] },
    };
    expect(respostasQueFaltam(mao)).toBe(2);
  });
});

/* ── O repositório, que é o requisito 5 ───────────────────────────────────── */

const pasta = (id: string, nome: string, acessos: { quem: Pessoa; papel: 'leitor' | 'comentarista' | 'editor' }[] = []) => ({
  id, nome, tipo: 'pasta' as const, dono: 'voce' as Pessoa, acessos, versoes: [],
});

describe('as pastas fora do padrão da CC-ES001', () => {
  const comPastas = (nomes: [string, string][]) => projetoNeutro({
    nuvem: { arquivos: nomes.map(([id, nome]) => pasta(id, nome)) },
    pastas: nomes.map(([id]) => ({ id, funcao: 'secretaria' as const, minimo: 'editor' as const })),
  });

  it('dois moldes diferentes reprovam os dois nomes', () => {
    const fora = pastasForaDoPadrao(comPastas([
      ['p1', 'acampamento-2026-03-14-v01'],
      ['p2', 'ACAMP 2026 03 14 versao 1'],
    ]));
    expect(fora).toHaveLength(2);
  });

  it('um molde só, com data e versão, passa', () => {
    expect(pastasForaDoPadrao(comPastas([
      ['p1', 'acampamento-2026-03-14-v01'],
      ['p2', 'inscricoes-2026-03-20-v02'],
    ]))).toEqual([]);
  });

  /* A segunda conta, que o molde não substitui: dez nomes no mesmo molde e
     sem data nenhuma não ordenam. Está escrito na CC-ES001 e vale igual aqui. */
  it('mesmo molde sem data nem versão reprova', () => {
    expect(pastasForaDoPadrao(comPastas([
      ['p1', 'acampamento-geral'],
      ['p2', 'inscricoes-gerais'],
    ]))).toHaveLength(2);
  });

  /* A guarda contra o vazio: sem pasta nenhuma não há o que conferir, e
     devolver lista vazia aqui é dizer "nada reprovou", não "está certo". */
  it('sem pasta nenhuma, não reprova nada', () => {
    expect(pastasForaDoPadrao(projetoNeutro())).toEqual([]);
  });

  /* O que a CC-ES001 recusa é recusado aqui: as funções são importadas de lá,
     e não reescritas. Foi o que divergiu na CC-ES004. */
  it('o espaço na versão, que a CC-ES001 recusa, reprova aqui', () => {
    expect(pastasForaDoPadrao(comPastas([['p1', 'acampamento-2026-03-14-v 1']])))
      .toHaveLength(1);
  });
});

describe('os acessos fora da função', () => {
  const EQUIPE = [
    { quem: 'voce' as Pessoa, funcao: 'secretaria' as const },
    { quem: 'marta' as Pessoa, funcao: 'tesouraria' as const },
  ];

  const comAcessos = (acessos: { quem: Pessoa; papel: 'editor' }[]) => projetoNeutro({
    equipe: EQUIPE,
    nuvem: { arquivos: [{ ...pasta('t1', 'tesouraria-2026-03-14-v01', acessos), dono: 'cleide' }] },
    pastas: [{ id: 't1', funcao: 'tesouraria', minimo: 'editor' }],
  });

  it('a função certa e só ela não aparece', () => {
    expect(acessosForaDaFuncao(comAcessos([{ quem: 'marta', papel: 'editor' }]))).toEqual([]);
  });

  it('quem exerce a função e não tem acesso aparece como faltando', () => {
    const fora = acessosForaDaFuncao(comAcessos([]));
    expect(fora[0].faltando).toEqual(['marta']);
    expect(fora[0].sobrando).toEqual([]);
  });

  /* A outra direção, e ela não substitui a primeira: acesso a mais é a ficha
     da tesouraria aberta para quem não é da tesouraria. */
  it('quem não exerce a função e tem acesso aparece como sobrando', () => {
    const fora = acessosForaDaFuncao(comAcessos([
      { quem: 'marta', papel: 'editor' }, { quem: 'voce', papel: 'editor' },
    ]));
    expect(fora[0].sobrando).toEqual(['voce']);
    expect(fora[0].faltando).toEqual([]);
  });
});

/* ── A colaboração, que é o requisito 6 ───────────────────────────────────── */

describe('as peças com colaboração no histórico', () => {
  const arquivo = (id: string, porQuem: Pessoa[][]) => ({
    id, nome: `${id}-2026-03-14-v01`, tipo: 'documento' as const, dono: 'voce' as Pessoa,
    acessos: [], versoes: porQuem.map((q, i) => ({ id: `v${i}`, quando: '2026-03-14', porQuem: q })),
  });

  it('você e mais alguém conta', () => {
    const p = projetoNeutro({ nuvem: { arquivos: [arquivo('a1', [['voce'], ['marta']])] } });
    expect(pecasComColaboracao(p)).toEqual(['a1']);
  });

  it('você sozinho não conta', () => {
    const p = projetoNeutro({ nuvem: { arquivos: [arquivo('a1', [['voce'], ['voce']])] } });
    expect(pecasComColaboracao(p)).toEqual([]);
  });

  /* Dois nomes sem o seu são duas pessoas e um conjunto que não é seu: o
     requisito pede "em conjunto com, no mínimo, uma outra pessoa". */
  it('duas outras pessoas sem você não conta', () => {
    const p = projetoNeutro({ nuvem: { arquivos: [arquivo('a1', [['marta'], ['ronaldo']])] } });
    expect(pecasComColaboracao(p)).toEqual([]);
  });

  it('o que está na lixeira não conta', () => {
    const p = projetoNeutro({
      nuvem: { arquivos: [{ ...arquivo('a1', [['voce'], ['marta']]), naLixeira: true }] },
    });
    expect(pecasComColaboracao(p)).toEqual([]);
  });
});

/* ── As instruções e os quinze minutos ────────────────────────────────────── */

describe('as instruções do requisito 7', () => {
  const cheias = {
    porOndeComecar: 'a', oQueTrocarNoAno: 'b', oQueNaoMexer: 'c', comoTransferirAcesso: 'd',
  };

  it('as quatro escritas, completas', () => {
    expect(instrucoesCompletas(cheias)).toBe(true);
  });

  it('em branco, não', () => {
    expect(instrucoesCompletas(INSTRUCOES_EM_BRANCO)).toBe(false);
  });

  /* A transferência de acesso é exigência escrita do requisito, e o "o que não
     mexer" é o campo que ninguém escreve — os dois têm caso próprio. */
  it('sem a transferência de acesso, não', () => {
    expect(instrucoesCompletas({ ...cheias, comoTransferirAcesso: ' ' })).toBe(false);
  });

  it('sem o que não mexer, não', () => {
    expect(instrucoesCompletas({ ...cheias, oQueNaoMexer: '' })).toBe(false);
  });
});

describe('os quinze minutos', () => {
  it('quinze cabem', () => {
    expect(dentroDoTempo(projetoNeutro({ minutosDaDemonstracao: MINUTOS_DA_APRESENTACAO })))
      .toBe(true);
  });

  it('dezesseis não cabem', () => {
    expect(dentroDoTempo(projetoNeutro({ minutosDaDemonstracao: 16 }))).toBe(false);
  });

  /* Não ter apresentado não é ter apresentado em zero minuto. */
  it('não ter apresentado não está dentro do tempo', () => {
    expect(dentroDoTempo(projetoNeutro())).toBe(false);
  });
});

describe('o número se escreve como a plataforma escreve', () => {
  it('sem formato, com as casas da plataforma', () => {
    expect(escreverNumero(1620)).toBe('1620');
  });

  it('com formato, pelo formatador da planilha', () => {
    expect(escreverNumero(1620, 'moeda')).toContain('1.620');
  });
});
