/**
 * O que as dez lições da CC-ES012 cobram.
 *
 * Duas travas carregam o arquivo, e nenhuma substitui a outra:
 *
 * - **nenhuma meta abre verde.** Tarefa cumprida no segundo zero ensina a não
 *   ler a lista, e é o defeito que esta casa mais repetiu — o dossiê da
 *   CC-ES004 abria com os cinco documentos que a meta mandava reunir;
 * - **a solução de referência fecha a lista.** Laboratório impossível de
 *   vencer é pior do que um que abre resolvido: um dá uma tarefa de graça, o
 *   outro deixa quem fez tudo certo olhando uma lista vermelha sem nada na
 *   tela explicando.
 *
 * Para os módulos 2 a 9 a solução de referência é o **estado de partida da
 * lição seguinte**, e não uma segunda escrita do mesmo gesto. Assim as duas
 * coisas se conferem de uma vez: se a derivação não fechasse a lista, a lição
 * seguinte partiria de um conjunto pela metade — e é esse o encaixe que
 * quebraria calado.
 */

import { describe, expect, it } from 'vitest';
import {
  CHAVE_DA_PROPAGACAO, CHAVE_DO_DOSSIE_VELHO, DOSSIE_DAS_DUAS,
  INSTRUCOES_ESCRITAS, LICOES_DA_CC_ES012, ULTIMA_LINHA_DAS_RESPOSTAS,
  comAcessoPorFuncao, comConjuntoNaContaDoClube, comFormularioArrumado,
  comGraficoVinculado, comIdentidadeNoMestre, comMapaDasPecas,
  comPastasNoPadrao, comTotalEmFormula, contextoDe, metasDa,
  origensDoDossie, pdfDoControle,
  type ContextoDoProjeto, type LicaoDaCcEs012,
} from './metasDaCcEs012';
import {
  CAMPO_QUANTOS, GRAFICO_DA_FEIRA, INSCRICOES_DA_FEIRA, LINHA_DAS_UNIDADES,
  LINHA_DO_TOTAL, PASTA_DA_TESOURARIA, RESPOSTAS_DA_FEIRA,
} from './projetoDaFeira';
import {
  NOME_DA_ABA_DE_RESPOSTAS, type ProjetoDocumental,
  importarRespostas, textoComoSeLe, vincular,
} from './projetoDocumental';
import { juntar } from './documentoPdf';
import { planilhaPorNome } from './planilha';
import { titulosDoDoc } from './documento';

const ORDEM: LicaoDaCcEs012[] = [
  'proposta', 'documento', 'planilha', 'formulario', 'importar',
  'apresentacao', 'dossie', 'repositorio', 'instrucoes', 'quinze-minutos',
];

const ctx = (licao: LicaoDaCcEs012) => contextoDe(LICOES_DA_CC_ES012[licao].projeto);

/* ── Nenhuma meta abre verde ───────────────────────────────────────────────── */

describe('nenhuma meta abre verde', () => {
  it.each(ORDEM)('%s', licao => {
    const c = ctx(licao);
    const jaVerdes = metasDa(licao).filter(m => m.feita(c)).map(m => m.id);
    expect(jaVerdes).toEqual([]);
  });

  it('as dez lições estão no registro, e todas têm meta', () => {
    expect(Object.keys(LICOES_DA_CC_ES012).sort()).toEqual([...ORDEM].sort());
    for (const licao of ORDEM) expect(metasDa(licao).length, licao).toBeGreaterThan(0);
  });

  /* A guarda contra o vazio: lista de metas que esvaziasse deixaria a trava
     acima verde por não ter conferido nada. */
  it('são pelo menos vinte e cinco metas no total', () => {
    const todas = ORDEM.flatMap(metasDa);
    expect(todas.length).toBeGreaterThanOrEqual(25);
    expect(new Set(todas.map(m => m.id)).size).toBe(todas.length);
  });

  it('toda meta tem detalhe, lugar e passo a passo', () => {
    for (const m of ORDEM.flatMap(metasDa)) {
      expect(m.detalhe.length, m.id).toBeGreaterThan(40);
      expect(m.onde.trim(), m.id).not.toBe('');
      expect(m.passos.length, m.id).toBeGreaterThan(0);
    }
  });
});

/* ── A solução de referência fecha a lista ─────────────────────────────────── */

/**
 * O que a pessoa faz no módulo 1: escreve, envia, e espera a resposta antes de
 * mexer em qualquer peça.
 */
const RESOLVIDA_A_PROPOSTA: ContextoDoProjeto = contextoDe(LICOES_DA_CC_ES012.documento.projeto);

/** O módulo 10, que não tem lição seguinte de onde derivar. */
function resolverOsQuinzeMinutos(): ContextoDoProjeto {
  const base = LICOES_DA_CC_ES012['quinze-minutos'].projeto;
  /* Os dois números do regulamento passam a ler a planilha. */
  const vinculado = base.numeros
    .filter(n => n.peca === 'documento')
    .reduce((p, n) => vincular(p, n.id), base);
  /* Uma inscrição nova chega pelo formulário, e a importação a leva à aba. */
  const comNova: ProjetoDocumental = importarRespostas({
    ...vinculado,
    formulario: {
      ...vinculado.formulario,
      respostas: [...vinculado.formulario.respostas, {
        id: 'r7', em: '2026-07-29T20:40',
        valores: {
          unidade: 'Gavião', especialidade: 'Fotografia',
          [CAMPO_QUANTOS]: '5', responsavel: 'Tia Sônia',
        },
      }],
    },
  });
  /* E o dossiê se refaz depois da mudança, porque o PDF congela. */
  return {
    p: { ...comNova, dossie: DOSSIE_DAS_DUAS(comNova), minutosDaDemonstracao: 12 },
    comecouAntes: false,
    descobertas: [CHAVE_DA_PROPAGACAO, CHAVE_DO_DOSSIE_VELHO],
  };
}

const RESOLVIDAS: Record<LicaoDaCcEs012, ContextoDoProjeto> = {
  proposta: RESOLVIDA_A_PROPOSTA,
  documento: contextoDe(LICOES_DA_CC_ES012.planilha.projeto),
  planilha: contextoDe(LICOES_DA_CC_ES012.formulario.projeto),
  formulario: contextoDe(LICOES_DA_CC_ES012.importar.projeto),
  importar: contextoDe(LICOES_DA_CC_ES012.apresentacao.projeto),
  apresentacao: contextoDe(LICOES_DA_CC_ES012.dossie.projeto),
  dossie: contextoDe(LICOES_DA_CC_ES012.repositorio.projeto),
  repositorio: contextoDe(LICOES_DA_CC_ES012.instrucoes.projeto),
  instrucoes: contextoDe(LICOES_DA_CC_ES012['quinze-minutos'].projeto),
  'quinze-minutos': resolverOsQuinzeMinutos(),
};

describe('a solução de referência fecha a lista', () => {
  it.each(ORDEM)('%s', licao => {
    const c = RESOLVIDAS[licao];
    const vermelhas = metasDa(licao).filter(m => !m.feita(c)).map(m => m.id);
    expect(vermelhas).toEqual([]);
  });
});

/* ── Os caminhos errados, um por conta ─────────────────────────────────────── */

describe('a proposta aprovada depois de começar não vale', () => {
  /* Sem este caso, a meta leria só "está aprovada?" e construir tudo antes e
     pedir aprovação depois fecharia a lição — que é o que o requisito 2 diz,
     com todas as letras, que não pode. */
  it('quem começou antes não fecha a meta, mesmo com a aprovação', () => {
    const c = { ...RESOLVIDA_A_PROPOSTA, comecouAntes: true };
    const meta = metasDa('proposta').find(m => m.id === 'proposta-aprovada-antes')!;
    expect(meta.feita(c)).toBe(false);
  });

  it('prometer quatro peças não fecha a meta das cinco', () => {
    const c: ContextoDoProjeto = {
      ...RESOLVIDA_A_PROPOSTA,
      p: {
        ...RESOLVIDA_A_PROPOSTA.p,
        proposta: {
          ...RESOLVIDA_A_PROPOSTA.p.proposta,
          pecas: ['documento', 'planilha', 'formulario', 'apresentacao'],
        },
      },
    };
    expect(metasDa('proposta').find(m => m.id === 'proposta-cinco-pecas')!.feita(c)).toBe(false);
  });
});

describe('o documento', () => {
  const partida = LICOES_DA_CC_ES012.documento.projeto;

  /* Acrescentar a seção sem atualizar o sumário deixa o sumário apontando
     para as folhas de antes — e é o defeito que a CC-ES002 nomeia. */
  it('a seção nova sem atualizar o sumário não fecha', () => {
    const d = partida.documento;
    const comSecao = {
      ...d,
      blocos: [...d.blocos, ...comMapaDasPecas(d).blocos.slice(d.blocos.length)],
    };
    const c = contextoDe({ ...partida, documento: comSecao });
    expect(metasDa('documento').find(m => m.id === 'doc-aponta-as-pecas')!.feita(c)).toBe(false);
  });

  /* E apagar seções para "arrumar" o sumário não vale: a conjunção de
     preservação viaja com a meta, e não como item da lista. */
  it('apagar as seções para o sumário bater não fecha', () => {
    const comMapa = comMapaDasPecas(partida.documento);
    const podado = { ...comMapa, blocos: comMapa.blocos.slice(-2) };
    /* O sumário fica **em dia** com o que sobrou: sem isto o caso reprovaria
       pela conta do sumário, e a conjunção de preservação continuaria sem
       nenhum teste a exercitar. Foi um mutante sobrevivente que mostrou. */
    const c = contextoDe({
      ...partida,
      documento: { ...podado, sumario: titulosDoDoc(podado) },
    });
    expect(metasDa('documento').find(m => m.id === 'doc-aponta-as-pecas')!.feita(c)).toBe(false);
  });

  it('só a cor, sem a fonte, não veste o documento', () => {
    const comCor = {
      ...partida.documento,
      estilos: { 'Título 1': { cor: '#0E5C2C' } },
    };
    const c = contextoDe({ ...partida, documento: comCor });
    expect(metasDa('documento').find(m => m.id === 'doc-identidade')!.feita(c)).toBe(false);
  });
});

describe('a planilha', () => {
  const partida = LICOES_DA_CC_ES012.planilha.projeto;

  /* O caminho errado que distingue a conta: um total que começa por igual e
     não acompanha nada. É a família do `=820+910+1180` da CC-ES003. */
  it('o total escrito como `=240` não fecha', () => {
    const cad = comTotalEmFormula(partida.controle);
    const falso = {
      ...cad,
      planilhas: cad.planilhas.map(pl => (pl.nome === 'Controle'
        ? {
          ...pl,
          celulas: pl.celulas.map((l, i) => (i === LINHA_DO_TOTAL
            ? l.map((cel, j) => (j === 1 ? { ...cel, texto: '=240' } : cel)) : l)),
        }
        : pl)),
    };
    const c = contextoDe({ ...partida, controle: falso });
    expect(metasDa('planilha').find(m => m.id === 'total-em-formula')!.feita(c)).toBe(false);
  });

  it('a cor em outra célula que não a do título não veste a planilha', () => {
    const cad = comTotalEmFormula(partida.controle);
    const noLugarErrado = {
      ...cad,
      planilhas: cad.planilhas.map(pl => (pl.nome === 'Controle'
        ? {
          ...pl,
          celulas: pl.celulas.map((l, i) => (i === LINHA_DAS_UNIDADES
            ? l.map((cel, j) => (j === 0 ? { ...cel, cor: '#0E5C2C' } : cel)) : l)),
        }
        : pl)),
    };
    const c = contextoDe({ ...partida, controle: noLugarErrado });
    expect(metasDa('planilha').find(m => m.id === 'planilha-identidade')!.feita(c)).toBe(false);
  });
});

describe('o formulário', () => {
  const partida = LICOES_DA_CC_ES012.formulario.projeto;

  /* Separar os campos e tirar o do responsável "porque é dado pessoal" quebra
     o conjunto: é o conselheiro que o clube procura quando o estande não
     aparece. A conta exige os três. */
  it('separar os campos tirando o do responsável não fecha', () => {
    const f = comFormularioArrumado(partida.formulario);
    const c = contextoDe({
      ...partida,
      formulario: { ...f, campos: f.campos.filter(x => x.id !== 'responsavel') },
    });
    expect(metasDa('formulario').find(m => m.id === 'form-separa-os-campos')!.feita(c)).toBe(false);
  });

  it('a quantidade em texto curto não fecha a meta do número', () => {
    const f = comFormularioArrumado(partida.formulario);
    const c = contextoDe({
      ...partida,
      formulario: {
        ...f,
        campos: f.campos.map(x => (x.id === CAMPO_QUANTOS ? { ...x, tipo: 'texto-curto' as const } : x)),
      },
    });
    expect(metasDa('formulario').find(m => m.id === 'form-quantidade-numero')!.feita(c)).toBe(false);
  });
});

describe('a importação', () => {
  const partida = LICOES_DA_CC_ES012.importar.projeto;

  /* O caminho errado inteiro do requisito 4: digitar os mesmos nomes à mão dá
     uma aba com as mesmas linhas, e nenhuma resposta importada. */
  it('as respostas digitadas à mão não fecham a importação', () => {
    const aba = planilhaPorNome(partida.controle, NOME_DA_ABA_DE_RESPOSTAS)!;
    const digitada = {
      ...aba,
      celulas: aba.celulas.map((l, i) => (i >= 1 && i <= INSCRICOES_DA_FEIRA.length
        ? l.map((cel, j) => (j === 1
          ? { ...cel, texto: INSCRICOES_DA_FEIRA[i - 1].unidade } : cel)) : l)),
    };
    const c = contextoDe({
      ...partida,
      controle: {
        ...partida.controle,
        planilhas: partida.controle.planilhas.map(pl =>
          (pl.nome === NOME_DA_ABA_DE_RESPOSTAS ? digitada : pl)),
      },
    });
    expect(metasDa('importar').find(m => m.id === 'importou-sem-redigitar')!.feita(c)).toBe(false);
  });

  /* A contagem escrita sobre a própria aba de controle é fórmula, devolve o
     número certo de hoje, e não cresce com a aba de respostas. */
  it('a contagem que não cita a aba de respostas não fecha', () => {
    const importado = importarRespostas(partida);
    const cad = importado.controle;
    const local = {
      ...cad,
      planilhas: cad.planilhas.map(pl => (pl.nome === 'Controle'
        ? {
          ...pl,
          celulas: pl.celulas.map((l, i) => (i === LINHA_DAS_UNIDADES
            ? l.map((cel, j) => (j === 1 ? { ...cel, texto: '=4+2' } : cel)) : l)),
        }
        : pl)),
    };
    const c = contextoDe({ ...importado, controle: local });
    expect(metasDa('importar').find(m => m.id === 'contagem-vem-das-respostas')!.feita(c))
      .toBe(false);
  });

  /* E a importação não pode custar a fórmula do módulo 3: a meta da soma
     carrega essa conjunção, senão arrumar a aba desfaria o total que já
     acompanhava e nada reprovaria. */
  it('a soma certa com o total de volta a digitado não fecha', () => {
    const feito = LICOES_DA_CC_ES012.apresentacao.projeto;
    const cad = feito.controle;
    const semFormula = {
      ...cad,
      planilhas: cad.planilhas.map(pl => (pl.nome === 'Controle'
        ? {
          ...pl,
          celulas: pl.celulas.map((l, i) => (i === LINHA_DO_TOTAL
            ? l.map((cel, j) => (j === 1 ? { ...cel, texto: '420' } : cel)) : l)),
        }
        : pl)),
    };
    const c = contextoDe({ ...feito, controle: semFormula });
    expect(metasDa('importar').find(m => m.id === 'soma-vem-das-respostas')!.feita(c)).toBe(false);
  });

  it('a faixa das respostas vai além da última resposta de hoje', () => {
    expect(ULTIMA_LINHA_DAS_RESPOSTAS).toBeGreaterThan(RESPOSTAS_DA_FEIRA.length + 1);
  });
});

describe('a apresentação', () => {
  const partida = LICOES_DA_CC_ES012.apresentacao.projeto;

  /* Vincular e deixar o retrato velho mostraria as quatro unidades num gráfico
     que diz ler a planilha — o pior dos dois mundos, porque agora nada avisa. */
  it('vinculado com o retrato velho não fecha', () => {
    const ap = comIdentidadeNoMestre(partida.apresentacao);
    const meio: typeof ap = {
      ...ap,
      slides: ap.slides.map(s => (s.grafico?.id === GRAFICO_DA_FEIRA
        ? { ...s, grafico: { ...s.grafico, como: 'vinculado' as const } } : s)),
    };
    const c = contextoDe({ ...partida, apresentacao: meio });
    expect(metasDa('apresentacao').find(m => m.id === 'ap-grafico-acompanha')!.feita(c))
      .toBe(false);
  });

  /* E `incorporado` é o caminho errado que a CC-ES011 ensinou como certo: ele
     leva uma cópia da planilha dentro, e a cópia é uma segunda fonte. */
  it('o gráfico incorporado não fecha a meta de acompanhar', () => {
    const ap = comGraficoVinculado(comIdentidadeNoMestre(partida.apresentacao));
    const incorporado: typeof ap = {
      ...ap,
      slides: ap.slides.map(s => (s.grafico?.id === GRAFICO_DA_FEIRA
        ? { ...s, grafico: { ...s.grafico, como: 'incorporado' as const } } : s)),
    };
    const c = contextoDe({ ...partida, apresentacao: incorporado });
    expect(metasDa('apresentacao').find(m => m.id === 'ap-grafico-acompanha')!.feita(c))
      .toBe(false);
  });
});

describe('o dossiê', () => {
  const partida = LICOES_DA_CC_ES012.dossie.projeto;

  /* O caminho errado que o requisito pede para não tomar: juntar tudo o que
     se tem. A planilha de controle leva o que o clube gasta e o nome de cada
     conselheiro, e ela nunca foi para as famílias. */
  it('juntar a planilha de controle no dossiê não fecha', () => {
    const comTudo = juntar(
      [...DOSSIE_DAS_DUAS(partida).paginas.map(pg => ({
        nome: pg.origem, paginas: [pg], campos: [], anotacoes: [],
      })), pdfDoControle(partida.controle)],
      'dossie-da-feira-2026-07-20-v01',
    );
    const c = contextoDe({ ...partida, dossie: comTudo });
    const meta = metasDa('dossie').find(m => m.id === 'dossie-reune-as-de-distribuicao')!;
    expect(meta.feita(c)).toBe(false);
    expect(origensDoDossie(comTudo)).toContain('controle');
  });

  /* E o mesmo documento juntado duas vezes dá o número certo de páginas e não
     reuniu nada: é a conta por origem, e não por página. */
  it('o regulamento juntado duas vezes não vale por dois reunidos', () => {
    const umDossie = DOSSIE_DAS_DUAS(partida);
    const soRegulamento = umDossie.paginas.filter(pg => pg.origem === 'regulamento');
    const dobrado = juntar([
      { nome: 'a', paginas: soRegulamento, campos: [], anotacoes: [] },
      { nome: 'b', paginas: soRegulamento, campos: [], anotacoes: [] },
    ], 'dossie-da-feira-2026-07-20-v01');
    const c = contextoDe({ ...partida, dossie: dobrado });
    expect(metasDa('dossie').find(m => m.id === 'dossie-reune-as-de-distribuicao')!.feita(c))
      .toBe(false);
  });

  it('o dossiê digitalizado do papel não é pesquisável', () => {
    const d = DOSSIE_DAS_DUAS(partida);
    const fotografado = {
      ...d,
      paginas: d.paginas.map(pg => ({ ...pg, texto: undefined })),
    };
    const c = contextoDe({ ...partida, dossie: fotografado });
    expect(metasDa('dossie').find(m => m.id === 'dossie-pesquisavel')!.feita(c)).toBe(false);
  });
});

describe('o repositório', () => {
  const partida = LICOES_DA_CC_ES012.repositorio.projeto;

  /* E deixar o acesso que sobrou de março também não fecha — é a outra
     direção da conta, e ela não substitui a primeira. */
  it('o acesso que sobrou numa pasta não fecha', () => {
    const n = comAcessoPorFuncao(comPastasNoPadrao(partida.nuvem));
    const comIntruso = {
      ...n,
      arquivos: n.arquivos.map(a => (a.id === PASTA_DA_TESOURARIA
        ? { ...a, acessos: [...a.acessos, { quem: 'ronaldo' as const, papel: 'editor' as const }] }
        : a)),
    };
    const c = contextoDe({ ...partida, nuvem: comIntruso });
    expect(metasDa('repositorio').find(m => m.id === 'acesso-por-funcao')!.feita(c)).toBe(false);
  });

  it('uma pasta renomeada e as outras não, não fecha', () => {
    const n = comPastasNoPadrao(partida.nuvem);
    const meio = {
      ...n,
      arquivos: n.arquivos.map(a => (a.id === PASTA_DA_TESOURARIA
        ? { ...a, nome: 'CONTAS DA FEIRA 2026' } : a)),
    };
    const c = contextoDe({ ...partida, nuvem: meio });
    expect(metasDa('repositorio').find(m => m.id === 'pastas-no-padrao')!.feita(c)).toBe(false);
  });

  /* Dar acesso de editor e ninguém escrever não comprova colaboração: ler não
     é participar, e é o que o histórico mede. */
  it('acesso de editor sem escrever não comprova colaboração', () => {
    const n = comAcessoPorFuncao(comPastasNoPadrao(partida.nuvem));
    const c = contextoDe({ ...partida, nuvem: n });
    expect(metasDa('repositorio').find(m => m.id === 'colaboracao-no-historico')!.feita(c))
      .toBe(false);
  });
});

describe('as instruções', () => {
  const partida = LICOES_DA_CC_ES012.instrucoes.projeto;

  /* Transferir a propriedade e sair da lista de acesso: o conjunto vira do
     clube e quem o fez não entra mais nele. Transferir não é perder. */
  it('transferir e perder o próprio acesso não fecha', () => {
    const n = comConjuntoNaContaDoClube(partida.nuvem);
    const semVoce = {
      ...n,
      arquivos: n.arquivos.map(a => (a.tipo === 'pasta'
        ? a : { ...a, acessos: a.acessos.filter(ac => ac.quem !== 'voce') })),
    };
    const c = contextoDe({ ...partida, instrucoes: INSTRUCOES_ESCRITAS, nuvem: semVoce });
    expect(metasDa('instrucoes').find(m => m.id === 'conjunto-na-conta-do-clube')!.feita(c))
      .toBe(false);
  });

  it('transferir duas peças e deixar a terceira não fecha', () => {
    const n = comConjuntoNaContaDoClube(partida.nuvem);
    const umaSua = {
      ...n,
      arquivos: n.arquivos.map((a, i) => (a.tipo !== 'pasta' && i === n.arquivos.length - 1
        ? { ...a, dono: 'voce' as const } : a)),
    };
    const c = contextoDe({ ...partida, instrucoes: INSTRUCOES_ESCRITAS, nuvem: umaSua });
    expect(metasDa('instrucoes').find(m => m.id === 'conjunto-na-conta-do-clube')!.feita(c))
      .toBe(false);
  });

  it('as instruções sem o que não mexer não fecham', () => {
    const c = contextoDe({
      ...partida,
      instrucoes: { ...INSTRUCOES_ESCRITAS, oQueNaoMexer: '' },
      nuvem: comConjuntoNaContaDoClube(partida.nuvem),
    });
    expect(metasDa('instrucoes').find(m => m.id === 'instrucoes-completas')!.feita(c)).toBe(false);
  });
});

describe('os quinze minutos', () => {
  const resolvido = RESOLVIDAS['quinze-minutos'];

  /* O dado de fato chegou nas outras peças: o regulamento diz o número novo
     sem ninguém o ter aberto. É o requisito 8 medido no texto que a folha
     mostra, e não no que foi digitado. */
  it('o regulamento passa a citar o número de agora', () => {
    const lido = textoComoSeLe(resolvido.p).join('\n');
    expect(lido).toContain(String(INSCRICOES_DA_FEIRA.length + 1));
  });

  /* Sem a descoberta, vincular tudo fecharia a meta sem ninguém ter visto a
     propagação acontecer — premiaria o clique e não a observação. */
  it('vincular sem ver a propagação não fecha', () => {
    const c = { ...resolvido, descobertas: [CHAVE_DO_DOSSIE_VELHO] };
    expect(metasDa('quinze-minutos').find(m => m.id === 'viu-o-dado-propagar')!.feita(c))
      .toBe(false);
  });

  /* E o dossiê de antes da mudança não vale: o PDF congela, e entregar o
     dossiê antigo é entregar o número de antes com todo o resto certo. */
  it('o dossiê gerado antes da mudança não fecha', () => {
    const velho = LICOES_DA_CC_ES012['quinze-minutos'].projeto.dossie;
    const c = { ...resolvido, p: { ...resolvido.p, dossie: velho } };
    expect(metasDa('quinze-minutos').find(m => m.id === 'dossie-refeito')!.feita(c)).toBe(false);
  });

  it('dezesseis minutos não fecham', () => {
    const c = { ...resolvido, p: { ...resolvido.p, minutosDaDemonstracao: 16 } };
    expect(metasDa('quinze-minutos').find(m => m.id === 'dentro-dos-quinze')!.feita(c)).toBe(false);
  });

  /* Um número do regulamento vinculado e o outro digitado deixa o conjunto
     contando dois números para a mesma feira. */
  it('vincular só um dos dois números não fecha', () => {
    const base = LICOES_DA_CC_ES012['quinze-minutos'].projeto;
    const meio = vincular(base, base.numeros.find(n => n.peca === 'documento')!.id);
    const c = contextoDe(meio);
    expect(metasDa('quinze-minutos').find(m => m.id === 'numeros-do-regulamento-vinculados')!
      .feita(c)).toBe(false);
  });
});
