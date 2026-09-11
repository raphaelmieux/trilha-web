import { describe, it, expect } from 'vitest';
import {
  DOC_INICIAL, METAS_DOS_ESTILOS, TEXTO_DO_SITE,
  aplicarCaixa, sumarioAtualizado, titulosDoDoc, textoDoBloco,
  type Doc, type Bloco, type Trecho,
} from './metasDaAp044';

/*
  O laboratório de estilos da AP044 abre com tudo por fazer.

  A trava é a mesma de `metasDaAp043.test.ts`, e existe pela mesma razão: das
  três vezes em que um laboratório desta plataforma abriu resolvido, o erro foi
  invisível de dentro — o painel mostra tarefas concluídas, que é exatamente o
  que se espera de um laboratório funcionando.

  Aqui o risco é maior do que o de costume, e é preciso dizer por quê. Este
  documento **chega escrito por inteiro**: título, três seções, oito itens de
  lista, versículo. Na tela ele parece um manual pronto, e é fácil escrever a
  meta olhando para o texto em vez de olhar para o estilo dele. O que falta não
  se vê: nenhum parágrafo é Título coisa nenhuma, e é por isso que o sumário sai
  vazio.
*/

describe('nenhuma tarefa do laboratório de estilos nasce verde', () => {
  it('o manual abre com as nove por fazer', () => {
    const verdes = METAS_DOS_ESTILOS.filter(m => m.feita(DOC_INICIAL)).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já estão cumpridas no documento inicial`).toEqual([]);
  });

  it('e o sumário do documento inicial sairia vazio, que é a lição', () => {
    expect(titulosDoDoc(DOC_INICIAL)).toEqual([]);
  });

  it('toda meta tem passo a passo, para quem travar', () => {
    const sem = METAS_DOS_ESTILOS.filter(m => m.passos.length < 2).map(m => m.id);
    expect(sem, `${sem.join(', ')} não oferecem caminho a quem travar`).toEqual([]);
  });

  /* Nove itens no requisito, nove tarefas. Uma meta a menos é um item que
     ninguém demonstra, e ninguém repara: o painel fecha verde igual. */
  it('há uma tarefa para cada um dos nove itens do requisito 7', () => {
    expect(METAS_DOS_ESTILOS).toHaveLength(9);
    expect(new Set(METAS_DOS_ESTILOS.map(m => m.id)).size).toBe(9);
  });
});

/* ── O manual pronto ───────────────────────────────────────────────────────── */

const mudarBloco = (d: Doc, id: string, mudanca: Partial<Bloco>): Doc =>
  ({ ...d, blocos: d.blocos.map(b => (b.id === id ? { ...b, ...mudanca } : b)) });

const mudarTrecho = (d: Doc, id: string, mudanca: Partial<Trecho>): Doc => ({
  ...d,
  blocos: d.blocos.map(b => ({
    ...b,
    trechos: b.trechos.map(x => (x.id === id ? { ...x, ...mudanca } : x)),
  })),
});

const colar = (d: Doc, id: string, secao: Bloco['secao'], deFora: boolean): Doc => ({
  ...d,
  blocos: [...d.blocos, {
    id, secao, estilo: 'Normal' as const,
    trechos: [{ id: `${id}-a`, texto: TEXTO_DO_SITE, posicao: 'normal' as const, realce: 'nenhum' as const, enfase: false, deFora }],
  }],
});

/** O manual como ele fica quando o desbravador faz tudo o que o painel pede. */
function manualPronto(): Doc {
  let d: Doc = DOC_INICIAL;
  d = mudarBloco(d, 'titulo', { estilo: 'Título 1' });
  for (const h of ['h-levar', 'h-prog', 'h-culto']) d = mudarBloco(d, h, { estilo: 'Título 2' });
  d = mudarBloco(d, 'citacao', { estilo: 'Citação' });
  d = mudarTrecho(d, 'prazo-b', { enfase: true, realce: 'amarelo' });
  d = mudarBloco(d, 'titulo', {
    trechos: [{ ...d.blocos.find(b => b.id === 'titulo')!.trechos[0], texto: aplicarCaixa('MANUAL DO ACAMPAMENTO DE INVERNO', 'frase') }],
  });
  d = colar(d, 'colado-site', 'programacao', true);
  d = colar(d, 'colado-doc', 'fim', false);
  d = mudarTrecho(d, 'lev-7-b', { posicao: 'sobrescrito' });
  d = mudarTrecho(d, 'lev-2-b', { posicao: 'subscrito' });
  d = { ...d, colunas: { ...d.colunas, levar: 2 } };
  d = mudarBloco(d, 'lev-1', { nota: 'Espuma fina que fica entre o saco de dormir e o chão.' });
  return { ...d, sumario: titulosDoDoc(d) };
}

describe('toda tarefa do laboratório de estilos tem como ser vencida', () => {
  it('o manual pronto fecha as nove', () => {
    const abertas = METAS_DOS_ESTILOS.filter(m => !m.feita(manualPronto())).map(m => m.id);
    expect(abertas, `${abertas.join(', ')} continuam abertas num manual pronto`).toEqual([]);
  });

  it('e o título consertado é exatamente o que a tarefa pede', () => {
    const b = manualPronto().blocos.find(x => x.id === 'titulo')!;
    expect(textoDoBloco(b)).toBe('Manual do acampamento de inverno');
  });
});

/*
  O sumário guarda o que leu, e é essa a metade da lição que ninguém conta.

  No Word ele não se refaz sozinho: trocar um título depois de gerar deixa o
  sumário mostrando o texto velho, e nada na tela avisa. Se a meta apenas
  conferisse "existe sumário", o desbravador entregaria um manual cujo sumário
  diz MANUAL DO ACAMPAMENTO DE INVERNO em caixa alta, e a plataforma daria por
  bom.
*/
describe('o sumário envelhece quando um título muda', () => {
  it('gerar antes de consertar o título deixa o sumário desatualizado', () => {
    let d: Doc = DOC_INICIAL;
    d = mudarBloco(d, 'titulo', { estilo: 'Título 1' });
    for (const h of ['h-levar', 'h-prog', 'h-culto']) d = mudarBloco(d, h, { estilo: 'Título 2' });
    d = { ...d, sumario: titulosDoDoc(d) };
    expect(sumarioAtualizado(d)).toBe(true);

    /* Agora o Caps Lock é consertado — e o sumário não fica sabendo. */
    d = mudarBloco(d, 'titulo', {
      trechos: [{ ...d.blocos.find(b => b.id === 'titulo')!.trechos[0], texto: 'Manual do acampamento de inverno' }],
    });
    expect(sumarioAtualizado(d)).toBe(false);
    expect(METAS_DOS_ESTILOS.find(m => m.id === 'sumario')!.feita(d)).toBe(false);

    /* Atualizar é o que o alcança. */
    d = { ...d, sumario: titulosDoDoc(d) };
    expect(METAS_DOS_ESTILOS.find(m => m.id === 'sumario')!.feita(d)).toBe(true);
  });

  it('sumário gerado sem estilo nenhum sai vazio, e vazio não vale', () => {
    const d: Doc = { ...DOC_INICIAL, sumario: titulosDoDoc(DOC_INICIAL) };
    expect(d.sumario).toEqual([]);
    expect(METAS_DOS_ESTILOS.find(m => m.id === 'sumario')!.feita(d)).toBe(false);
  });
});

/*
  Os cinco modos do botão Aa.

  Escrevê-los de cabeça erra por pouco e com frequência — e quem confere o
  próprio título contra um exemplo errado conclui que o **seu** documento é que
  está errado. Cada modo aqui é o que o Word produz.
*/
describe('o botão Aa faz o que o Word faz', () => {
  const T = 'MANUAL DO ACAMPAMENTO DE INVERNO';

  it('primeira letra da frase em maiúscula', () => {
    expect(aplicarCaixa(T, 'frase')).toBe('Manual do acampamento de inverno');
  });

  it('e recomeça depois de cada ponto final', () => {
    expect(aplicarCaixa('LEIA TUDO. ASSINE DEPOIS.', 'frase')).toBe('Leia tudo. Assine depois.');
  });

  it('minúsculas e MAIÚSCULAS', () => {
    expect(aplicarCaixa(T, 'minusculas')).toBe('manual do acampamento de inverno');
    expect(aplicarCaixa('manual do acampamento', 'maiusculas')).toBe('MANUAL DO ACAMPAMENTO');
  });

  it('cada palavra em maiúscula, inclusive as pequenas — como o Word faz', () => {
    expect(aplicarCaixa(T, 'palavras')).toBe('Manual Do Acampamento De Inverno');
  });

  it('alternar troca cada letra de lado', () => {
    expect(aplicarCaixa('Manual', 'alternar')).toBe('mANUAL');
  });

  /* Acento não é caso à parte, e é onde um toLowerCase() ingênuo tropeça. */
  it('acento sobrevive aos cinco modos', () => {
    expect(aplicarCaixa('ÁGUIA REAL', 'frase')).toBe('Águia real');
    expect(aplicarCaixa('águia real', 'palavras')).toBe('Águia Real');
  });
});

/* ══ O laboratório de banco de dados ═══════════════════════════════════════ */

import {
  AGENDA_INICIAL, METAS_DA_AGENDA, LISTA_DO_CLUBE, CAMPOS_PEDIDOS, REGRA_DE_EMAIL,
  COLUNAS_DA_LISTA, CAMPO_DA_COLUNA,
  bairroDe, registrosNaTela, temArroba,
  type Agenda, type Registro,
} from './metasDaAp044';

/** Uma ficha da lista do clube, lida pelos nomes das colunas dela. */
const daLista = (linha: string[], campo: string) =>
  linha[COLUNAS_DA_LISTA.findIndex(c => CAMPO_DA_COLUNA[c] === campo)];

/** A agenda como ela fica quando o desbravador faz tudo o que o painel pede. */
function agendaPronta(): Agenda {
  const registros: Registro[] = LISTA_DO_CLUBE.map((linha, i) => ({
    id: `r${i}`,
    valores: Object.fromEntries(CAMPOS_PEDIDOS.map(p => {
      const bruto = daLista(linha, p.nome);
      /* A ficha recusada entra depois de corrigida, que é a tarefa 4. */
      return [p.nome, p.nome === 'E-mail' && !temArroba(bruto) ? `${bruto}@exemplo.com` : bruto];
    })),
  }));
  return {
    campos: CAMPOS_PEDIDOS.map((p, i) => ({
      id: `c${i}`, nome: p.nome, tipo: p.tipo,
      regra: p.nome === 'E-mail' ? REGRA_DE_EMAIL : undefined,
    })),
    registros,
    ordem: { campo: 'Nome', crescente: true },
    filtroDeBairro: 'Centro',
    relatorio: CAMPOS_PEDIDOS.map(p => p.nome),
  };
}

describe('nenhuma tarefa do laboratório de banco de dados nasce verde', () => {
  it('a agenda abre com as sete por fazer', () => {
    const verdes = METAS_DA_AGENDA.filter(m => m.feita(AGENDA_INICIAL)).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já estão cumpridas na agenda inicial`).toEqual([]);
  });

  it('e abre sem tabela nenhuma, que é de onde se parte', () => {
    expect(AGENDA_INICIAL.campos).toEqual([]);
    expect(AGENDA_INICIAL.registros).toEqual([]);
  });

  it('toda meta tem passo a passo', () => {
    const sem = METAS_DA_AGENDA.filter(m => m.passos.length < 2).map(m => m.id);
    expect(sem, `${sem.join(', ')} não oferecem caminho a quem travar`).toEqual([]);
  });
});

describe('toda tarefa do laboratório de banco de dados tem como ser vencida', () => {
  it('a agenda pronta fecha as sete', () => {
    const abertas = METAS_DA_AGENDA.filter(m => !m.feita(agendaPronta())).map(m => m.id);
    expect(abertas, `${abertas.join(', ')} continuam abertas numa agenda pronta`).toEqual([]);
  });
});

/*
  O requisito nomeia um número, e o número tem de estar lá.

  "No mínimo, 25 pessoas" é o que o documento oficial pede, e uma lista de
  origem com vinte e quatro deixaria a tarefa impossível de vencer sem que nada
  na tela explicasse por quê.
*/
describe('a lista do clube atende ao que o requisito pede', () => {
  it('tem as vinte e cinco pessoas', () => {
    expect(LISTA_DO_CLUBE.length).toBeGreaterThanOrEqual(25);
  });

  it('toda linha traz os quatro campos preenchidos', () => {
    const furadas = LISTA_DO_CLUBE.filter(l => l.length !== COLUNAS_DA_LISTA.length || l.some(c => !c.trim()));
    expect(furadas).toEqual([]);
  });

  /*
    O assistente erra por posição, e a lista precisa dar-lhe motivo.

    Se as colunas do clube já viessem na ordem dos campos da agenda, o palpite
    por posição acertaria as quatro e a tarefa de mapear seria confirmar um
    acerto — que é o mesmo que abrir resolvida.
  */
  it('a ordem das colunas da lista não é a dos campos da agenda', () => {
    const porPosicao = COLUNAS_DA_LISTA.map((c, i) => CAMPO_DA_COLUNA[c] === CAMPOS_PEDIDOS[i].nome);
    expect(porPosicao.filter(x => !x).length,
      'o palpite por posição acertaria tudo, e não haveria o que mapear')
      .toBeGreaterThanOrEqual(2);
  });

  it('e todo campo pedido tem uma coluna de origem', () => {
    const orfaos = CAMPOS_PEDIDOS.map(p => p.nome)
      .filter(n => !COLUNAS_DA_LISTA.some(c => CAMPO_DA_COLUNA[c] === n));
    expect(orfaos).toEqual([]);
  });

  /* Uma, e só uma. Duas fariam a tarefa de consertar virar duas tarefas
     escondidas dentro de uma; nenhuma deixaria a regra de validação sem nada
     para recusar, e declarar a regra seria um clique que não muda a tela. */
  it('exatamente uma ficha tem e-mail sem arroba, para a regra ter o que recusar', () => {
    const sem = LISTA_DO_CLUBE.filter(l => !temArroba(daLista(l, 'E-mail')));
    expect(sem, `${sem.map(l => l[0]).join(', ')}`).toHaveLength(1);
  });

  it('e mais de um bairro, senão filtrar não mostraria nada de diferente', () => {
    const bairros = new Set(LISTA_DO_CLUBE.map(l => bairroDe(daLista(l, 'Endereço'))));
    expect(bairros.size).toBeGreaterThanOrEqual(2);
  });

  /* Telefone é texto, e a lista precisa mostrar por quê: parêntese e traço não
     sobrevivem a um campo de número. */
  it('todo telefone traz parêntese e traço, que é o que o tipo número perderia', () => {
    const crus = LISTA_DO_CLUBE.filter(l => !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(daLista(l, 'Telefone')));
    expect(crus.map(l => l[0])).toEqual([]);
  });
});

describe('filtrar esconde e ordenar não redigita', () => {
  it('o filtro por bairro mostra menos do que existe, e não apaga nada', () => {
    const a = agendaPronta();
    expect(registrosNaTela(a).length).toBeLessThan(a.registros.length);
    expect(registrosNaTela(a).length).toBeGreaterThan(0);
    expect(a.registros.length).toBe(LISTA_DO_CLUBE.length);
  });

  it('a ordenação é alfabética de verdade, com acento no lugar', () => {
    const a: Agenda = { ...agendaPronta(), filtroDeBairro: '', ordem: { campo: 'Nome', crescente: true } };
    const nomes = registrosNaTela(a).map(r => r.valores['Nome']);
    expect(nomes).toEqual([...nomes].sort((p, q) => p.localeCompare(q, 'pt-BR')));
  });

  /* Sem ordem declarada a tela mostra a ordem em que as fichas entraram — e é
     isso que a tarefa de ordenar tem de mudar. Se `registrosNaTela` já
     devolvesse tudo ordenado, a tarefa estaria cumprida antes do clique. */
  it('sem ordem declarada, a tela devolve as fichas na ordem em que entraram', () => {
    const a: Agenda = { ...agendaPronta(), filtroDeBairro: '', ordem: null };
    expect(registrosNaTela(a).map(r => r.id)).toEqual(a.registros.map(r => r.id));
  });
});

describe('a regra de validação recusa o que precisa recusar', () => {
  it('reprova endereço sem arroba, sem ponto e com espaço', () => {
    for (const ruim of ['elisa.nogueira', 'elisa@exemplo', 'eli sa@exemplo.com', '@exemplo.com', '']) {
      expect(temArroba(ruim), `"${ruim}" passou pela regra`).toBe(false);
    }
  });

  it('aprova o que é endereço mesmo', () => {
    expect(temArroba('ana.rocha@exemplo.com')).toBe(true);
  });
});

/* Relatório de uma coluna só sai sem erro nenhum e não serve para nada — é a
   armadilha do "zero link não é zero link quebrado" aplicada ao papel que o
   clube arquiva. O requisito nomeia os quatro campos. */
describe('o relatório precisa dos quatro campos', () => {
  it('um relatório só com o nome não fecha a tarefa', () => {
    const a: Agenda = { ...agendaPronta(), relatorio: ['Nome'] };
    expect(METAS_DA_AGENDA.find(m => m.id === 'relatorio')!.feita(a)).toBe(false);
  });

  it('e nem os quatro campos numa agenda vazia', () => {
    const a: Agenda = { ...agendaPronta(), registros: [] };
    expect(METAS_DA_AGENDA.find(m => m.id === 'relatorio')!.feita(a)).toBe(false);
  });
});

/* O telefone declarado como número é o erro que o assistente induz. A tarefa
   dos campos precisa reprovar isso — senão a armadilha inteira da lição passa
   sem que nada na tela diga que passou. */
describe('telefone declarado como número reprova', () => {
  it('a tarefa dos campos não fecha com Telefone em número', () => {
    const a = agendaPronta();
    const comNumero: Agenda = {
      ...a,
      campos: a.campos.map(c => (c.nome === 'Telefone' ? { ...c, tipo: 'numero' as const } : c)),
    };
    expect(METAS_DA_AGENDA.find(m => m.id === 'campos')!.feita(comNumero)).toBe(false);
  });
});
