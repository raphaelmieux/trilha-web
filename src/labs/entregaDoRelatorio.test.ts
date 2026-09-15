import { describe, it, expect } from 'vitest';
import {
  RELATORIO_DA_ENTREGA_INICIAL, ENTREGA_INICIAL, METAS_DA_ENTREGA,
  PECAS_DO_REQUISITO_7, NOME_INICIAL, temPadrao, retratoDoDoc,
  quantasPaginas, revisoesPendentes, sumarioAtualizado, titulosDoDoc, metaDaVez,
  type Doc, type Entrega, type ContextoDaEntrega,
} from './entregaDoRelatorio';
import { aceitarRevisao } from './documento';

/*
  A entrega do módulo 6, e as três maneiras de ela não ensinar nada.

  1. **Abrir com meta verde**, ou ser impossível de vencer — as de sempre.
  2. **O PDF não congelar.** Se ele lesse o documento de agora, exportar cedo e
     continuar mexendo daria um arquivo sempre certo, e a lição inteira do
     requisito 4.6 sumiria sem nada acusar — a tela mostraria um PDF
     plausível, que é o que se espera de um PDF funcionando.
  3. **O relatório não ter as quatro peças do requisito 7.** Elas não são
     tarefa daqui, e é decisão: construí-las é o que os módulos 3 e 4 já
     cobraram. Quem garante que elas estão no documento é esta trava, e não a
     lista de tarefas — tarefa que abre verde ensina a não ler a lista.
*/

const doc = () => RELATORIO_DA_ENTREGA_INICIAL;
const ctx = (d: Doc = doc(), e: Entrega = ENTREGA_INICIAL): ContextoDaEntrega =>
  ({ doc: d, entrega: e });

const meta = (id: string) => {
  const m = METAS_DA_ENTREGA.find(x => x.id === id);
  if (!m) throw new Error(`meta ${id} não existe`);
  return m;
};

const NOME_BOM = 'relatorio-atividades-2026-03-14-v01';

/** Gravar um arquivo como o laboratório grava: com o retrato de agora. */
const salvar = (e: Entrega, d: Doc, formato: 'docx' | 'pdf'): Entrega => ({
  ...e,
  arquivos: [
    ...e.arquivos.filter(a => a.formato !== formato),
    { nome: `${e.nome}.${formato}`, formato, retrato: retratoDoDoc(d) },
  ],
});

/** Terminar o documento: resolver a marca e pôr o sumário em dia. */
const terminar = (partida: Doc = doc()): Doc => {
  let d = partida;
  for (const r of revisoesPendentes(d)) d = aceitarRevisao(d, r.trecho.id);
  return { ...d, sumario: titulosDoDoc(d) };
};

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('o relatório chega pronto e a entrega não', () => {
  it('nenhuma meta abre verde', () => {
    const verdes = METAS_DA_ENTREGA.filter(m => m.feita(ctx())).map(m => m.id);
    expect(verdes, 'o laboratório abre com tarefa já concluída').toEqual([]);
  });

  it('o relatório tem as quatro peças do requisito 7, e quatro folhas', () => {
    /*
      Elas chegam prontas de propósito: construí-las é o que os módulos 3 e 4
      cobraram, e repetir a tarefa aqui mediria de novo o que já foi medido.
      Quem cobra que elas existem é esta trava — sem ela, alguém poderia tirar
      a tabela do documento um dia e o requisito 7 deixaria de ser coberto sem
      nada reprovar.
    */
    for (const p of PECAS_DO_REQUISITO_7) {
      expect(p.tem(doc()), `o relatório entregue não tem ${p.nome}`).toBe(true);
    }
    expect(quantasPaginas(doc()), 'o requisito 7 pede no mínimo quatro páginas')
      .toBeGreaterThanOrEqual(4);
  });

  it('chega com uma marca pendente e o sumário velho, e nenhuma das duas se vê', () => {
    expect(revisoesPendentes(doc()).length,
      'sem marca pendente, metade da armadilha da ordem de entrega some')
      .toBeGreaterThan(0);
    expect(sumarioAtualizado(doc()),
      'o sumário chega em dia, e a outra metade da armadilha some').toBe(false);
  });

  it('terminar são duas metades, e nenhuma fecha sozinha', () => {
    /*
      Resolver a marca e atualizar o sumário são duas coisas, e as duas saem no
      papel: a marca sai impressa, e o sumário velho manda o leitor para a
      folha errada. Uma meta que cobrasse só uma deixaria a outra entrar no PDF
      com a lista verde — e o desbravador não teria como saber qual das duas
      faltou, porque nenhuma se vê sem procurar.
    */
    const d = doc();

    const soAMarca = revisoesPendentes(d).reduce(
      (acc, r) => aceitarRevisao(acc, r.trecho.id), d);
    expect(meta('terminar').feita(ctx(soAMarca)),
      'resolver a marca fechou a tarefa com o sumário ainda velho').toBe(false);

    const soOSumario: Doc = { ...d, sumario: titulosDoDoc(d) };
    expect(meta('terminar').feita(ctx(soOSumario)),
      'atualizar o sumário fechou a tarefa com a marca ainda pendente').toBe(false);

    expect(meta('terminar').feita(ctx(terminar()))).toBe(true);
  });

  it('o sumário velho não sabe da última seção', () => {
    /* É o que faz dele um sumário velho, e não um sumário errado por acaso:
       ele foi gerado quando o documento tinha três folhas. */
    const gravado = doc().sumario ?? [];
    const agora = titulosDoDoc(doc());
    expect(agora.length).toBeGreaterThan(gravado.length);
    expect(gravado.some(i => i.texto.includes('O que fica'))).toBe(false);
  });

  it('todas as metas podem ficar verdes', () => {
    const d = terminar();
    let e: Entrega = { ...ENTREGA_INICIAL, nome: NOME_BOM };
    e = salvar(e, d, 'pdf');
    e = salvar(e, d, 'docx');
    const vermelhas = METAS_DA_ENTREGA.filter(m => !m.feita(ctx(d, e))).map(m => m.id);
    expect(vermelhas, 'o laboratório é impossível de vencer').toEqual([]);
    expect(metaDaVez(ctx(d, e))).toBe(null);
  });
});

describe('o PDF congela o que existir na hora', () => {
  it('exportar antes de terminar deixa o PDF para trás', () => {
    /*
      É o gesto que se faz sem pensar, e é a lição inteira do requisito 4.6.
      Se o PDF lesse o documento de agora, exportar cedo daria um arquivo
      sempre certo e a tarefa mediria ter clicado em Exportar.
    */
    const cedo = salvar({ ...ENTREGA_INICIAL, nome: NOME_BOM }, doc(), 'pdf');
    expect(meta('exportar').feita(ctx(doc(), cedo)),
      'o PDF não foi gravado').toBe(true);

    const depois = terminar();
    expect(meta('pdf-em-dia').feita(ctx(depois, cedo)),
      'o PDF exportado antes de terminar passou por atual').toBe(false);
  });

  it('e exportar de novo conserta', () => {
    const cedo = salvar({ ...ENTREGA_INICIAL, nome: NOME_BOM }, doc(), 'pdf');
    const depois = terminar();
    const outraVez = salvar(cedo, depois, 'pdf');
    expect(meta('pdf-em-dia').feita(ctx(depois, outraVez))).toBe(true);
  });

  it('o retrato inclui as marcas e o sumário, e não só o texto', () => {
    /*
      As três coisas aparecem no papel: uma marca não resolvida sai impressa, e
      um sumário velho manda o leitor para a folha errada. Um retrato só de
      texto deixaria os dois passarem, e o PDF entregue sairia errado com a
      tarefa verde.
    */
    const d = doc();
    const semMarca = revisoesPendentes(d).reduce(
      (acc, r) => aceitarRevisao(acc, r.trecho.id), d);
    expect(retratoDoDoc(semMarca), 'resolver a marca não mudou o retrato')
      .not.toBe(retratoDoDoc(d));

    const comSumario: Doc = { ...d, sumario: titulosDoDoc(d) };
    expect(retratoDoDoc(comSumario), 'atualizar o sumário não mudou o retrato')
      .not.toBe(retratoDoDoc(d));
  });
});

describe('o nome do arquivo e a entrega dupla', () => {
  it('o nome de partida não passa no padrão', () => {
    expect(temPadrao(NOME_INICIAL), 'o nome de partida já está no padrão').toBe(false);
  });

  it('o padrão pede data e versão, e recusa espaço e parêntese', () => {
    expect(temPadrao(NOME_BOM)).toBe(true);
    expect(temPadrao('relatorio-2026-03-14'), 'passou sem versão').toBe(false);
    expect(temPadrao('relatorio-v01'), 'passou sem data').toBe(false);
    expect(temPadrao('relatorio 2026-03-14 v01'), 'passou com espaço').toBe(false);
    expect(temPadrao('relatorio-2026-03-14-v01(2)'), 'passou com parêntese').toBe(false);
    expect(temPadrao(''), 'o nome vazio passou').toBe(false);
  });

  it('um PDF sozinho não é entrega', () => {
    const d = terminar();
    const so = salvar({ ...ENTREGA_INICIAL, nome: NOME_BOM }, d, 'pdf');
    expect(meta('entrega-dupla').feita(ctx(d, so)),
      'entregar só o PDF fechou a tarefa da entrega dupla').toBe(false);
  });

  it('os dois com nomes diferentes não são um par', () => {
    const d = terminar();
    let e = salvar({ ...ENTREGA_INICIAL, nome: NOME_BOM }, d, 'pdf');
    e = salvar({ ...e, nome: 'relatorio-atividades-2026-03-14-v02' }, d, 'docx');
    expect(meta('entrega-dupla').feita(ctx(d, e)),
      'um par com nomes diferentes passou por par').toBe(false);
  });

  it('o editável salvo antes de terminar não vale, mesmo com o PDF novo', () => {
    /*
      É o pior dos dois mundos: o papel mostra o relatório pronto e o arquivo
      que a próxima diretoria vai abrir é o de antes. Nada na tela diz isso —
      os dois estão na pasta, com o mesmo nome.
    */
    const d = terminar();
    let e = salvar({ ...ENTREGA_INICIAL, nome: NOME_BOM }, doc(), 'docx');
    e = salvar(e, d, 'pdf');
    expect(meta('entrega-dupla').feita(ctx(d, e)),
      'um editável velho ao lado de um PDF novo passou por entrega').toBe(false);
  });
});

describe('o texto das metas', () => {
  it('toda meta traz passo a passo e diz onde', () => {
    for (const m of METAS_DA_ENTREGA) {
      expect(m.passos.length, `a meta ${m.id} não tem passo a passo`).toBeGreaterThan(1);
      expect(m.onde.trim(), `a meta ${m.id} não diz onde`).not.toBe('');
    }
  });
});
