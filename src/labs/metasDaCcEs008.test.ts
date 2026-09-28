import { describe, expect, it } from 'vitest';
import {
  type Caderno, type TabelaDinamica,
  atualizarResumo, resumir,
} from './planilha';
import { abaDe, comAba, escritoEm, planilhaDe } from './cadernoDoClube';
import {
  type Campo, type Formulario,
  CAMPO_DIARIAS, CAMPO_EMAIL, CAMPO_NOME, CAMPO_UNIDADE, UNIDADES,
  cabecalhoDe, comCampo, enviar, linhasDe, paraComparar, respostasReais, valorDa,
} from './formulario';
import {
  type ContextoDeDados, type LicaoDaCcEs008,
  ABA_AGENDA, ABA_AGENDA_ORDENADA, ABA_RELATORIO, ABA_RESPOSTAS, ABRIU_O_CSV,
  AGENDA_DO_CLUBE, CABECALHO_DA_AGENDA,
  LICOES_DA_CC_ES008, VIU_AS_ASPAS, VIU_A_RECUSA, VIU_GRUPOS_DEMAIS, VIU_O_GRUPO_VAZIO,
  CUIDADOS, CUIDADOS_CERTOS,
  baseConsertada, contextoDa, csvDaBase,
} from './metasDaCcEs008';

/*
  As metas da CC-ES008.

  Três contas, e as três se multiplicam:

  - **nenhuma meta abre verde**, porque lista com item já marcado no segundo zero
    ensina a não ler a lista;
  - **uma solução de referência fecha cada lista**, porque laboratório que ninguém
    consegue vencer é pior do que um que abre resolvido — o outro deixa quem fez
    tudo certo olhando vermelho sem nada na tela explicando;
  - **cada caminho rápido e errado deixa vermelha a meta certa**, e não outra: uma
    conta que reprova pelo motivo errado é uma conta que não confere o que diz.
*/

const LICOES = Object.keys(LICOES_DA_CC_ES008) as LicaoDaCcEs008[];

const feitas = (c: ContextoDeDados, l: LicaoDaCcEs008) =>
  LICOES_DA_CC_ES008[l].metas.filter(m => m.feita(c)).map(m => m.id);

const vermelhas = (c: ContextoDeDados, l: LicaoDaCcEs008) =>
  LICOES_DA_CC_ES008[l].metas.filter(m => !m.feita(c)).map(m => m.id);

/* ── Soluções de referência ──────────────────────────────────────────────── */

const comUnidadeEmLista = (f: Formulario): Formulario =>
  comCampo(f, CAMPO_UNIDADE, c => ({ ...c, tipo: 'lista', opcoes: [...UNIDADES] }));

const comDiariasEmNumero = (f: Formulario): Formulario =>
  comCampo(f, CAMPO_DIARIAS, c => ({ ...c, tipo: 'numero' }));

/** Módulo 1: dá à unidade uma lista fechada e às diárias o tipo número. */
function resolveCampos(c: ContextoDeDados): ContextoDeDados {
  return { ...c, formulario: comDiariasEmNumero(comUnidadeEmLista(c.formulario)) };
}

/** Módulo 2: obrigatório, validação que recusa, a recusa vista, e um envio bom. */
function resolveValidacao(c: ContextoDeDados): ContextoDeDados {
  let f = comCampo(c.formulario, CAMPO_EMAIL,
    (campo): Campo => ({ ...campo, obrigatorio: true, validacao: { tipo: 'email' } }));
  const depois = enviar(f, {
    [CAMPO_NOME]: 'Sara Vieira',
    [CAMPO_UNIDADE]: 'Onça',
    [CAMPO_EMAIL]: 'vieira.sara@exemplo.com',
    [CAMPO_DIARIAS]: '3',
  });
  expect(depois).not.toBeNull();
  f = depois!;
  return { ...c, formulario: f, descobertas: [...c.descobertas, VIU_A_RECUSA] };
}

/** Módulo 3: tira o título, tira o TOTAL, e põe a soma na aba Relatório. */
function resolveBase(c: ContextoDeDados): ContextoDeDados {
  const cabecalho = cabecalhoDe(c.formulario);
  const linhas = linhasDe(c.formulario);
  const respostas = planilhaDe(ABA_RESPOSTAS, [cabecalho, ...linhas], {
    tabela: { l1: 0, c1: 0, l2: linhas.length, c2: cabecalho.length - 1 },
  });
  const relatorio = planilhaDe(ABA_RELATORIO, [
    ['Diárias somadas', `=SOMA(${ABA_RESPOSTAS}!E2:E${linhas.length + 1})`],
  ]);
  return { ...c, caderno: { planilhas: [respostas, relatorio], ativa: 0 } };
}

/** Módulo 4: monta o resumo sobre a base e lê as duas coisas que ele relata. */
function resolveResumo(c: ContextoDeDados): ContextoDeDados {
  const base = abaDe(c.caderno, ABA_RESPOSTAS);
  const cabecalho = cabecalhoDe(c.formulario);
  const t: TabelaDinamica = {
    em: { l: 3, c: 0 },
    origem: {
      planilha: ABA_RESPOSTAS,
      faixa: { l1: 0, c1: 0, l2: respostasReais(c.formulario).length, c2: cabecalho.length - 1 },
    },
    linha: 2,
    valor: { coluna: 4, como: 'contagem' },
    retrato: [],
  };
  const comRetrato = { ...t, retrato: resumir(base, t) };
  const relatorio = { ...abaDe(c.caderno, ABA_RELATORIO), resumo: comRetrato };
  return {
    ...c,
    caderno: comAba(c.caderno, relatorio),
    descobertas: [...c.descobertas, VIU_GRUPOS_DEMAIS, VIU_O_GRUPO_VAZIO],
  };
}

/** Módulo 5: uma grafia por unidade, ninguém em branco, vírgula, e Atualizar. */
function resolveConserto(c: ContextoDeDados): ContextoDeDados {
  return { ...c, caderno: baseConsertada(c) };
}

/** Módulo 6: escreve um ponto e vírgula numa observação, exporta, e lê o arquivo. */
function resolveCsv(c: ContextoDeDados): ContextoDeDados {
  const base = abaDe(c.caderno, ABA_RESPOSTAS);
  const comPontoEVirgula = planilhaDe(ABA_RESPOSTAS,
    base.celulas.map((linha, l) => linha.map((cel, col) =>
      (l === 1 && col === 5 ? 'Vegetariana; sem lactose' : cel.texto))),
    { tabela: base.tabela });
  const comTexto = { ...c, caderno: comAba(c.caderno, comPontoEVirgula) };
  return {
    ...comTexto,
    csv: csvDaBase(comTexto),
    descobertas: [...c.descobertas, ABRIU_O_CSV, VIU_AS_ASPAS],
  };
}

/** Módulo 7: o relatório ordenado por nome, com a agenda intocada. */
function resolveAgenda(c: ContextoDeDados): ContextoDeDados {
  const ordenadas = [...AGENDA_DO_CLUBE()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  return {
    ...c,
    caderno: comAba(c.caderno,
      planilhaDe(ABA_AGENDA_ORDENADA, [[...CABECALHO_DA_AGENDA], ...ordenadas])),
  };
}

/** Módulo 8: classifica, escolhe os três cuidados, e descarta a cópia. */
function resolveEntrega(c: ContextoDeDados): ContextoDeDados {
  return {
    ...c,
    pessoaisMarcados: c.formulario.campos.filter(x => x.pessoal).map(x => x.id),
    cuidadosEscolhidos: [...CUIDADOS_CERTOS],
    csv: null,
  };
}

const RESOLVE: Record<LicaoDaCcEs008, (c: ContextoDeDados) => ContextoDeDados> = {
  campos: resolveCampos,
  validacao: resolveValidacao,
  base: resolveBase,
  resumo: resolveResumo,
  conserto: resolveConserto,
  csv: resolveCsv,
  agenda: resolveAgenda,
  entrega: resolveEntrega,
};

/* ── As três contas ──────────────────────────────────────────────────────── */

describe('nenhuma meta abre verde', () => {
  it.each(LICOES)('%s', (l) => {
    const c = contextoDa(l);
    // Guarda contra o vazio: uma lição sem meta nenhuma passaria por não ter
    // conferido nada.
    expect(LICOES_DA_CC_ES008[l].metas.length).toBeGreaterThan(0);
    expect(feitas(c, l)).toEqual([]);
  });
});

describe('a solução de referência fecha a lista inteira', () => {
  it.each(LICOES)('%s', (l) => {
    const c = RESOLVE[l](contextoDa(l));
    expect(vermelhas(c, l)).toEqual([]);
  });
});

describe('cada meta tem detalhe, lugar e passo a passo', () => {
  it.each(LICOES)('%s', (l) => {
    for (const m of LICOES_DA_CC_ES008[l].metas) {
      expect(m.titulo.length).toBeGreaterThan(8);
      expect(m.detalhe.length).toBeGreaterThan(20);
      expect(m.onde.length).toBeGreaterThan(8);
      // Verificação sem passo a passo é o defeito que `veredas.test.ts` já
      // reprova: quem trava fica sem saída.
      expect(m.passos.length).toBeGreaterThanOrEqual(2);
      for (const p of m.passos) expect(p.length).toBeGreaterThan(10);
    }
  });
});

describe('os ids não repetem dentro de uma lição', () => {
  it.each(LICOES)('%s', (l) => {
    const ids = LICOES_DA_CC_ES008[l].metas.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

/* ── Os caminhos rápidos e errados ───────────────────────────────────────── */

describe('apagar o que incomoda não arruma o formulário', () => {
  /** O caminho de quem "limpa" o formulário jogando fora as respostas feias. */
  const semAsFeias = (f: Formulario): Formulario => ({
    ...f,
    respostas: f.respostas.filter(r =>
      paraComparar(valorDa(r, CAMPO_UNIDADE)) !== 'falcao' || valorDa(r, CAMPO_UNIDADE) === 'Falcão'),
  });

  it('no módulo 1, as três metas ficam vermelhas', () => {
    const c = contextoDa('campos');
    const rapido = resolveCampos({ ...c, formulario: semAsFeias(c.formulario) });
    // Os tipos estão certos e a unidade é lista: sem a condição conjugada, as
    // três metas ficariam verdes num formulário com três respostas a menos.
    expect(respostasReais(rapido.formulario).length)
      .toBeLessThan(respostasReais(c.formulario).length);
    expect(feitas(rapido, 'campos')).toEqual([]);
  });

  it('e no módulo 2, também', () => {
    const c = contextoDa('validacao');
    const rapido = resolveValidacao({ ...c, formulario: semAsFeias(c.formulario) });
    expect(vermelhas(rapido, 'validacao')).toContain('um-obrigatorio');
    expect(vermelhas(rapido, 'validacao')).toContain('uma-resposta-nova');
  });
});

describe('lista com metade das unidades não fecha a meta', () => {
  it('as três que alguém lembrou de cor deixam a meta vermelha', () => {
    // É o caminho mais natural que existe: escrever as unidades de memória e
    // parar nas que vieram à cabeça. A unidade que faltar na lista volta a ser
    // digitada à mão por quem a tem — e a grafia se divide de novo, agora com o
    // formulário parecendo consertado.
    const c = contextoDa('campos');
    const meia = comCampo(c.formulario, CAMPO_UNIDADE,
      (campo): Campo => ({ ...campo, tipo: 'lista', opcoes: UNIDADES.slice(0, 3) }));
    const rapido = { ...c, formulario: comDiariasEmNumero(meia) };
    expect(vermelhas(rapido, 'campos')).toEqual(['unidade-em-lista']);
  });
});

describe('validação sem parâmetro não fecha a meta', () => {
  it('mesmo com a regra escrita no campo', () => {
    // `Number('')` é zero: "entre 0 e 0" é uma regra que a tela desenha ao lado
    // do campo e que não recusa o que a lição quer que ela recuse.
    const c = contextoDa('validacao');
    const comRegraVazia = comCampo(c.formulario, CAMPO_DIARIAS,
      (campo): Campo => ({ ...campo, validacao: { tipo: 'numero-entre' } }));
    const quase = resolveValidacao({ ...c, formulario: comRegraVazia });
    const semAValida = comCampo(quase.formulario, CAMPO_EMAIL,
      (campo): Campo => ({ ...campo, validacao: undefined }));
    const rapido = { ...quase, formulario: semAValida };
    expect(vermelhas(rapido, 'validacao')).toEqual(['uma-validacao']);
  });
});

describe('ligar obrigatório sem ver a recusa não fecha a lição', () => {
  it('o interruptor que ninguém viu agir fica vermelho', () => {
    const c = contextoDa('validacao');
    const semDescoberta = { ...resolveValidacao(c), descobertas: [] };
    expect(vermelhas(semDescoberta, 'validacao')).toEqual(['viu-a-recusa']);
  });
});

describe('apagar a base não é separar a base do relatório', () => {
  it('a aba esvaziada deixa três metas vermelhas', () => {
    const c = contextoDa('base');
    const vazia: Caderno = comAba(c.caderno, planilhaDe(ABA_RESPOSTAS, []));
    const rapido = { ...c, caderno: vazia };
    // Sem título solto e sem TOTAL: as duas primeiras metas passariam a valer
    // numa planilha em que ninguém consegue achar uma resposta.
    expect(escritoEm(abaDe(vazia, ABA_RESPOSTAS), 0, 0)).toBe('');
    const falta = vermelhas(rapido, 'base');
    expect(falta).toContain('base-abre-no-cabecalho');
    expect(falta).toContain('base-sem-total');
    expect(falta).toContain('faixa-da-tabela');
  });

  it('e o total copiado para o relatório sem sair da base não fecha as duas', () => {
    const c = contextoDa('base');
    const comCopia = comAba(c.caderno, planilhaDe(ABA_RELATORIO, [
      ['Diárias somadas', `=SOMA(${ABA_RESPOSTAS}!E3:E18)`],
    ]));
    const rapido = { ...c, caderno: comCopia };
    expect(feitas(rapido, 'base')).toEqual(['total-no-relatorio']);
  });
});

describe('consertar a grafia antes de olhar o resumo apaga o que ele mostra', () => {
  it('as três metas do módulo 4 ficam vermelhas', () => {
    const c = contextoDa('resumo');
    const base = abaDe(c.caderno, ABA_RESPOSTAS);
    const certa = (v: string) => UNIDADES.find(u => paraComparar(u) === paraComparar(v)) ?? v;
    const arrumada = planilhaDe(ABA_RESPOSTAS,
      base.celulas.map((linha, l) => linha.map((cel, col) =>
        (l > 0 && col === 2 ? certa(cel.texto) : cel.texto))),
      { tabela: base.tabela });
    const rapido = resolveResumo({ ...c, caderno: comAba(c.caderno, arrumada) });
    expect(vermelhas(rapido, 'resumo')).toEqual(
      ['criou-o-resumo', 'viu-grupos-demais', 'viu-o-grupo-vazio']);
  });

  it('e o resumo sobre a própria aba do relatório não conta', () => {
    // Uma tabela dinâmica que lê a aba onde ela mesma está não resume nada, e
    // abriria vazia sem erro nenhum.
    const c = contextoDa('resumo');
    const pronto = resolveResumo(c);
    const relatorio = abaDe(pronto.caderno, ABA_RELATORIO);
    const trocado = {
      ...relatorio,
      resumo: { ...relatorio.resumo!, origem: { ...relatorio.resumo!.origem, planilha: ABA_RELATORIO } },
    };
    const rapido = { ...pronto, caderno: comAba(pronto.caderno, trocado) };
    expect(vermelhas(rapido, 'resumo')).toEqual(['criou-o-resumo']);
  });
});

describe('consertar pela metade não fecha o módulo 5', () => {
  it('consertar sem atualizar deixa o resumo relatando o erro', () => {
    const c = contextoDa('conserto');
    const relatorio = abaDe(c.caderno, ABA_RELATORIO);
    const semAtualizar = resolveConserto(c);
    const voltaOResumoVelho = {
      ...semAtualizar,
      caderno: comAba(semAtualizar.caderno,
        { ...abaDe(semAtualizar.caderno, ABA_RELATORIO), resumo: relatorio.resumo }),
    };
    expect(vermelhas(voltaOResumoVelho, 'conserto'))
      .toEqual(['resumo-com-uma-linha-por-unidade']);
  });

  it('e atualizar sem consertar continua dando dez unidades', () => {
    const c = contextoDa('conserto');
    const relatorio = abaDe(c.caderno, ABA_RELATORIO);
    const soAtualizado = {
      ...c,
      caderno: comAba(c.caderno, {
        ...relatorio,
        resumo: atualizarResumo(c.caderno, relatorio.resumo!),
      }),
    };
    const falta = vermelhas(soAtualizado, 'conserto');
    expect(falta).toContain('resumo-com-uma-linha-por-unidade');
    expect(falta).toContain('uma-grafia-por-unidade');
  });

  it('e unir a grafia escrevendo sem acento deixa seis linhas erradas', () => {
    /*
      O caso que a conta dos rótulos existe para pegar, e sem ele ela passava por
      só contar quantas linhas há: junta-se o Falcão num só, junta-se a Águia num
      só **escrevendo "aguia"**, preenche-se a unidade em branco — e o resumo
      relata exatamente seis linhas, que é o número certo, com uma unidade que o
      clube não tem.

      Contar linhas aprovaria isto. É o número plausível e errado de sempre.
    */
    const c = contextoDa('conserto');
    const base = abaDe(c.caderno, ABA_RESPOSTAS);
    const semAcento = (v: string) => {
      const chave = paraComparar(v);
      return chave === 'falcao' ? 'Falcão' : (chave || 'tucano');
    };
    const meioArrumada = planilhaDe(ABA_RESPOSTAS,
      base.celulas.map((linha, l) => linha.map((cel, col) =>
        (l > 0 && l <= 16 && col === 2 ? semAcento(cel.texto) : cel.texto))),
      { tabela: base.tabela });
    const comBase = comAba(c.caderno, meioArrumada);
    const relatorio = abaDe(comBase, ABA_RELATORIO);
    const rapido = {
      ...c,
      caderno: comAba(comBase, {
        ...relatorio,
        resumo: atualizarResumo(comBase, relatorio.resumo!),
      }),
    };

    const rotulos = abaDe(rapido.caderno, ABA_RELATORIO).resumo!.retrato.map(l => l.rotulo);
    expect(rotulos.length).toBe(UNIDADES.length);
    expect(rotulos).toContain('aguia');
    // A diária com ponto continua lá — este caminho só mexeu na grafia —, então
    // são três vermelhas. O que a conta dos rótulos carrega é a terceira: sem
    // ela, o resumo de seis linhas erradas passaria por resumo certo.
    expect(vermelhas(rapido, 'conserto')).toEqual([
      'uma-grafia-por-unidade', 'diarias-sao-numero', 'resumo-com-uma-linha-por-unidade',
    ]);
  });

  it('e apagar as linhas esquisitas deixa as quatro metas vermelhas', () => {
    // O caminho rápido de toda inconsistência: apagar a linha. A coluna fica
    // impecável e o clube fica com doze inscritos.
    const c = contextoDa('conserto');
    const base = abaDe(c.caderno, ABA_RESPOSTAS);
    const semAsFeias = base.celulas.map(linha => linha.map(cel => cel.texto))
      .filter((linha, l) => l === 0 || !['falcao', 'FALCÃO', 'Falcao ', ''].includes(linha[2]));
    const rapido = {
      ...c,
      caderno: comAba(c.caderno, planilhaDe(ABA_RESPOSTAS, semAsFeias, { tabela: base.tabela })),
    };
    expect(feitas(rapido, 'conserto')).toEqual([]);
  });
});

describe('exportar sem o ponto e vírgula não mostra a aspa', () => {
  it('a meta fica vermelha com o arquivo exportado', () => {
    const c = contextoDa('csv');
    const exportado = {
      ...c,
      csv: csvDaBase(c),
      descobertas: [ABRIU_O_CSV, VIU_AS_ASPAS],
    };
    // Sem nenhuma célula contendo o separador, o escritor não tem por que citar
    // nada — e a lição mandaria ver aspas que não existem.
    expect(exportado.csv).not.toContain('"');
    expect(vermelhas(exportado, 'csv')).toEqual(['fez-a-aspa-aparecer']);
  });
});

describe('ordenar a própria agenda não é gerar relatório', () => {
  it('as duas metas ficam vermelhas', () => {
    // Sai em ordem alfabética, parece resolvido, e o que se perdeu foi a ordem
    // de entrada — que não tem cópia em lugar nenhum e não volta.
    const c = contextoDa('agenda');
    const ordenadas = [...AGENDA_DO_CLUBE()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
    const rapido = {
      ...c,
      caderno: comAba(c.caderno,
        planilhaDe(ABA_AGENDA, [[...CABECALHO_DA_AGENDA], ...ordenadas])),
    };
    expect(feitas(rapido, 'agenda')).toEqual([]);
  });

  it('nem ordenar a agenda e depois copiá-la para o relatório', () => {
    /*
      Este é o caminho que isola a condição, e sem ele ela passava por não ter
      caso: o relatório sai certo — vinte e cinco linhas, em ordem, cada pessoa
      com o telefone dela —, e a agenda perdeu a ordem de entrada no caminho. As
      duas primeiras contas ficam verdes e é só a condição que reprova, que é o
      que ela existe para fazer.
    */
    const c = contextoDa('agenda');
    const ordenadas = [...AGENDA_DO_CLUBE()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
    const rapido = {
      ...c,
      caderno: comAba(
        comAba(c.caderno, planilhaDe(ABA_AGENDA, [[...CABECALHO_DA_AGENDA], ...ordenadas])),
        planilhaDe(ABA_AGENDA_ORDENADA, [[...CABECALHO_DA_AGENDA], ...ordenadas]),
      ),
    };
    expect(feitas(rapido, 'agenda')).toEqual([]);
  });

  it('e copiar sem ordenar deixa só a primeira meta vermelha', () => {
    // O outro caso que faltava: as vinte e cinco estão lá, cada uma inteira, e
    // na ordem de entrada. Sem este caminho, a conta de "está em ordem" passava
    // por nunca ter sido exercitada.
    const c = contextoDa('agenda');
    const rapido = {
      ...c,
      caderno: comAba(c.caderno,
        planilhaDe(ABA_AGENDA_ORDENADA, [[...CABECALHO_DA_AGENDA], ...AGENDA_DO_CLUBE()])),
    };
    expect(vermelhas(rapido, 'agenda')).toEqual(['relatorio-ordenado']);
  });

  it('e ordenar só a coluna do nome embaralha o cadastro', () => {
    const c = contextoDa('agenda');
    const original = AGENDA_DO_CLUBE();
    const nomes = original.map(l => l[0]).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    // Os nomes em ordem, e o resto de cada linha onde estava: vinte e cinco
    // pessoas, vinte e cinco telefones, e cada um ao lado de outra pessoa.
    const embaralhado = original.map((l, i) => [nomes[i], l[1], l[2], l[3]]);
    const rapido = {
      ...c,
      caderno: comAba(c.caderno,
        planilhaDe(ABA_AGENDA_ORDENADA, [[...CABECALHO_DA_AGENDA], ...embaralhado])),
    };
    expect(feitas(rapido, 'agenda')).toEqual(['relatorio-ordenado']);
  });
});

describe('o resumo do módulo 4 relata o que a lição manda ver', () => {
  it('mais grupos do que o clube tem unidades, e um deles sem nome', () => {
    // Se a base de partida não tivesse a grafia dividida nem o campo em branco,
    // as duas descobertas do módulo 4 seriam sobre coisas que não estão na
    // tela: a lição mandaria ver o que não há.
    const c = resolveResumo(contextoDa('resumo'));
    const rotulos = abaDe(c.caderno, ABA_RELATORIO).resumo!.retrato.map(l => l.rotulo);
    expect(rotulos.length).toBeGreaterThan(UNIDADES.length);
    expect(rotulos).toContain('(vazio)');
  });
});

describe('o módulo 8 compara conjunto igual, e não conjunto que contém', () => {
  it('marcar todas as perguntas como pessoais não passa', () => {
    // Exigir só que as verdadeiras estejam marcadas deixaria "marque todas"
    // passar com louvor, e aí a pessoa não classificou: só marcou. É a decisão
    // dos indícios da CC-ES005.
    const c = resolveEntrega(contextoDa('entrega'));
    const todas = { ...c, pessoaisMarcados: c.formulario.campos.map(x => x.id) };
    expect(vermelhas(todas, 'entrega')).toEqual(['classificou-os-pessoais']);
  });

  it('e escolher os seis cuidados também não', () => {
    const c = resolveEntrega(contextoDa('entrega'));
    const todos = { ...c, cuidadosEscolhidos: CUIDADOS.map(x => x.id) };
    expect(vermelhas(todos, 'entrega')).toEqual(['tres-cuidados']);
  });

  it('nem três, sendo um deles o que soa prudente e não é', () => {
    const c = resolveEntrega(contextoDa('entrega'));
    const errado = CUIDADOS.find(x => !x.certo)!;
    const quase = {
      ...c,
      cuidadosEscolhidos: [...CUIDADOS_CERTOS.slice(0, 2), errado.id],
    };
    expect(quase.cuidadosEscolhidos.length).toBe(3);
    expect(vermelhas(quase, 'entrega')).toEqual(['tres-cuidados']);
  });
});

describe('os cuidados errados dizem por que são errados', () => {
  it('e os certos não carregam porquê', () => {
    // É a regra do `porque` das alternativas das provas, aplicada a uma escolha
    // de laboratório: quem erra recebe o motivo, e quem acerta não recebe o
    // gabarito de graça.
    for (const x of CUIDADOS) {
      if (x.certo) expect(x.porque).toBeUndefined();
      else expect((x.porque ?? '').length).toBeGreaterThan(30);
    }
  });

  it('e há errados o bastante para escolher três não ser sorte', () => {
    const errados = CUIDADOS.filter(x => !x.certo);
    expect(CUIDADOS_CERTOS.length).toBe(3);
    expect(errados.length).toBeGreaterThanOrEqual(3);
  });
});

describe('descartar a cópia não é apagar a entrega', () => {
  it('apagar a planilha junto deixa as três metas vermelhas', () => {
    /*
      O caminho rápido do descarte: apagar tudo. O dado tem prazo, e o prazo não
      é hoje — o relatório ainda vai ser entregue ao examinador. Sem a condição
      conjugada, as três metas ficariam verdes numa pasta vazia.
    */
    const c = resolveEntrega(contextoDa('entrega'));
    const apagou = {
      ...c,
      caderno: comAba(comAba(c.caderno, planilhaDe(ABA_RESPOSTAS, [])),
        planilhaDe(ABA_AGENDA_ORDENADA, [])),
    };
    expect(feitas(apagou, 'entrega')).toEqual([]);
  });
});

describe('cada lição parte de um estado da anterior', () => {
  it('o módulo 2 recebe os tipos que o módulo 1 arrumou', () => {
    const c = contextoDa('validacao');
    expect(c.formulario.campos.find(x => x.id === CAMPO_UNIDADE)?.tipo).toBe('lista');
    expect(c.formulario.campos.find(x => x.id === CAMPO_DIARIAS)?.tipo).toBe('numero');
  });

  it('e o módulo 4 recebe a base que o módulo 3 limpou', () => {
    const c = contextoDa('resumo');
    // Começar mandando refazer o módulo 3 ensinaria que o trabalho anterior não
    // conta, e as metas dele apareceriam cumpridas ou não ao acaso.
    expect(escritoEm(abaDe(c.caderno, ABA_RESPOSTAS), 0, 0)).toBe('Enviado em');
    expect(feitas(c, 'base')).toEqual(LICOES_DA_CC_ES008.base.metas.map(m => m.id));
  });

  it('e o módulo 3 recebe a pasta misturada, que é o que ele conserta', () => {
    const c = contextoDa('base');
    const base = abaDe(c.caderno, ABA_RESPOSTAS);
    expect(escritoEm(base, 0, 0)).not.toBe('Enviado em');
    expect(base.celulas.some(l => l.some(cel => cel.texto.startsWith('TOTAL')))).toBe(true);
  });
});
