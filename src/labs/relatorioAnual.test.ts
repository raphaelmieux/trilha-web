import { describe, it, expect } from 'vitest';
import {
  RELATORIO_ANUAL_INICIAL, METAS_DO_RELATORIO_ANUAL, TEXTO_DO_CABECALHO,
  SECAO_QUE_FALTA, RODAPE_DIGITADO, rodapeDeCampo,
  cabecalhoEscrito, temASecaoQueFaltava, metaDaVez,
  type Doc,
} from './relatorioAnual';
import {
  linhaDe, trechoDe, titulosDoDoc, sumarioAtualizado, quantasPaginas,
  paginasDoDoc, textoDaFaixa, faixaTemCampoDePagina,
} from './documento';

/*
  O relatório anual do módulo 4, e as cinco metas que o fecham.

  ── A pergunta deste módulo ──────────────────────────────────────────────
  Nos anteriores foi "dá para vencer?" e "dá para vencer digitando?". Aqui é a
  segunda de novo, com o outro campo: **o número de página pode ser digitado?**
  Se pudesse, a tarefa mediria ter escrito dois caracteres, e o relatório
  entregue diria "Página 2" nas quatro folhas — que é exatamente como ele
  chega, e o defeito que a lição existe para nomear.

  E uma nova: **o sumário pode ficar velho e passar?** Ele guarda o que leu, e
  o documento cresce enquanto se trabalha nele.
*/

/* ── A solução de referência ──────────────────────────────────────────────── */

const comCabecalho = (d: Doc): Doc =>
  ({ ...d, cabecalho: { trechos: [trechoDe('cab-a', TEXTO_DO_CABECALHO)] } });

const comNumeracao = (d: Doc): Doc => ({ ...d, rodape: rodapeDeCampo() });

const comPrimeiraDiferente = (d: Doc): Doc => ({ ...d, primeiraPaginaDiferente: true });

const comASecao = (d: Doc): Doc => ({
  ...d,
  blocos: [
    ...d.blocos,
    {
      ...linhaDe(SECAO_QUE_FALTA.tituloId, SECAO_QUE_FALTA.secao, SECAO_QUE_FALTA.titulo),
      estilo: 'Título 1' as const,
      quebraDePagina: true,
    },
    linhaDe(SECAO_QUE_FALTA.corpoId, SECAO_QUE_FALTA.secao, SECAO_QUE_FALTA.corpo),
  ],
});

const gerarSumario = (d: Doc): Doc => ({ ...d, sumario: titulosDoDoc(d) });

function resolvido(): Doc {
  let d: Doc = RELATORIO_ANUAL_INICIAL;
  d = comCabecalho(d);
  d = comNumeracao(d);
  d = comPrimeiraDiferente(d);
  d = comASecao(d);
  d = gerarSumario(d);
  return d;
}

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('o relatório anual abre por arrumar', () => {
  it('nenhuma das cinco metas está cumprida no primeiro segundo', () => {
    const verdes = METAS_DO_RELATORIO_ANUAL
      .filter(m => m.feita(RELATORIO_ANUAL_INICIAL)).map(m => m.id);
    expect(verdes,
      'estas metas abrem verdes — lista com item já marcado ensina a não ler a lista')
      .toEqual([]);
  });

  it('tem folha bastante para o cabeçalho e o número fazerem sentido', () => {
    /*
      A guarda contra o vazio deste módulo. Cabeçalho que se repete numa folha
      só não se repete, e número de página que nunca muda não mostra a
      diferença entre o campo e o número digitado — que é a lição inteira. Num
      documento de uma folha as duas tarefas ficariam sem o que ensinar, e
      ainda assim dariam verde.
    */
    expect(quantasPaginas(RELATORIO_ANUAL_INICIAL),
      'o relatório encolheu para menos de três folhas').toBeGreaterThanOrEqual(3);
  });

  it('o rodapé chega com um número digitado, e o mesmo em toda folha', () => {
    const d = RELATORIO_ANUAL_INICIAL;
    expect(faixaTemCampoDePagina(d.rodape),
      'o rodapé já chega como campo — não haveria defeito nenhum').toBe(false);

    const emCadaFolha = paginasDoDoc(d)
      .map((_, i) => textoDaFaixa(d, RODAPE_DIGITADO, i + 1));
    expect(new Set(emCadaFolha).size,
      'o rodapé digitado mudaria de folha para folha, o que ele não faz').toBe(1);
    expect(emCadaFolha[0]).toContain('2');
  });

  it('não chega com cabeçalho, nem com sumário, nem com a seção que falta', () => {
    expect(cabecalhoEscrito(RELATORIO_ANUAL_INICIAL)).toBe(false);
    expect(RELATORIO_ANUAL_INICIAL.sumario).toBeNull();
    expect(temASecaoQueFaltava(RELATORIO_ANUAL_INICIAL)).toBe(false);
    expect(RELATORIO_ANUAL_INICIAL.primeiraPaginaDiferente).toBe(false);
  });

  it('os títulos já estão com estilo, para o sumário ter o que ler', () => {
    /* Quem cobra aplicar estilo é o módulo 1. Aqui eles precisam estar certos,
       senão o sumário sairia vazio por outro motivo e a lição seria a de lá. */
    expect(titulosDoDoc(RELATORIO_ANUAL_INICIAL).length).toBeGreaterThanOrEqual(4);
  });
});

describe('o relatório anual pode ser vencido', () => {
  it('a solução de referência deixa a lista inteira verde', () => {
    const d = resolvido();
    const vermelhas = METAS_DO_RELATORIO_ANUAL.filter(m => !m.feita(d)).map(m => m.id);
    expect(vermelhas,
      'laboratório impossível de vencer é pior do que um que abre resolvido')
      .toEqual([]);
  });

  it('cada meta é a primeira da vez em algum momento do caminho', () => {
    let d: Doc = RELATORIO_ANUAL_INICIAL;
    const vistas: string[] = [];
    const passos: ((x: Doc) => Doc)[] = [
      comCabecalho, comNumeracao, comPrimeiraDiferente, comASecao, gerarSumario,
    ];
    for (const passo of passos) {
      vistas.push(metaDaVez(d)!.id);
      d = passo(d);
    }
    expect(vistas).toEqual(METAS_DO_RELATORIO_ANUAL.map(m => m.id));
    expect(metaDaVez(d), 'sobrou meta depois do último passo').toBeNull();
  });
});

describe('a faixa inserida e nunca escrita não conta', () => {
  it('abrir o cabeçalho sem escrever nada não cumpre a tarefa', () => {
    /*
      "Zero link não é zero link quebrado", aplicado à faixa: abrir o cabeçalho
      é um clique, e um cabeçalho vazio se repete em toda folha dizendo nada. A
      tarefa pede o nome do clube em toda página, e uma faixa em branco não põe
      nome nenhum em lugar nenhum.
    */
    const aberto: Doc = { ...RELATORIO_ANUAL_INICIAL, cabecalho: { trechos: [] } };
    const soEspaco: Doc = {
      ...RELATORIO_ANUAL_INICIAL,
      cabecalho: { trechos: [trechoDe('cab-a', '   ')] },
    };
    const meta = METAS_DO_RELATORIO_ANUAL.find(m => m.id === 'cabecalho')!;
    expect(meta.feita(aberto), 'um cabeçalho vazio contou como escrito').toBe(false);
    expect(meta.feita(soEspaco), 'um cabeçalho com espaços contou como escrito').toBe(false);
    expect(cabecalhoEscrito({
      ...RELATORIO_ANUAL_INICIAL,
      cabecalho: { trechos: [trechoDe('cab-a', TEXTO_DO_CABECALHO)] },
    }), 'e o escrito de verdade conta').toBe(true);
  });
});

describe('o número de página é campo, e muda de folha', () => {
  it('o campo diz a folha em que está sendo desenhado', () => {
    const d = comNumeracao(RELATORIO_ANUAL_INICIAL);
    const lidos = paginasDoDoc(d).map((_, i) => textoDaFaixa(d, d.rodape!, i + 1));
    expect(lidos[0]).toBe('Página 1');
    expect(lidos[1]).toBe('Página 2');
    expect(new Set(lidos).size,
      'o campo mostrou o mesmo número em todas as folhas').toBe(lidos.length);
  });

  it('um número digitado com o texto certo não conta', () => {
    /*
      A trava que dá razão de existir ao campo. Aqui alguém digita "Página 1"
      no rodapé: na folha 1 fica idêntico ao certo. Se isto passasse, o
      laboratório mediria ter escrito duas palavras, e as folhas 2, 3 e 4 do
      relatório entregue diriam todas "Página 1".
    */
    const enganoso: Doc = {
      ...RELATORIO_ANUAL_INICIAL,
      rodape: { trechos: [trechoDe('rod-a', 'Página 1')] },
    };
    const meta = METAS_DO_RELATORIO_ANUAL.find(m => m.id === 'numeracao')!;
    expect(meta.feita(enganoso), 'um número digitado passou por numeração').toBe(false);
  });
});

describe('o sumário guarda o que leu, e o documento cresce', () => {
  const meta = METAS_DO_RELATORIO_ANUAL.find(m => m.id === 'sumario')!;

  it('gerar antes de acrescentar a seção deixa o sumário velho', () => {
    /*
      A ordem natural — o sumário é a tarefa que se vê primeiro —, e é ela que
      produz a lição. Depois de acrescentar a seção, o sumário continua
      mostrando o documento de antes: sem a seção nova, e com as folhas de
      antes. Nada na tela avisa.
    */
    const geradoCedo = gerarSumario(RELATORIO_ANUAL_INICIAL);
    expect(meta.feita(geradoCedo), 'antes da seção, ele está em dia consigo mesmo').toBe(true);

    const depois = comASecao(geradoCedo);
    expect(meta.feita(depois), 'o sumário velho passou por em dia').toBe(false);
    expect(depois.sumario!.some(i => i.texto === SECAO_QUE_FALTA.titulo),
      'o sumário se atualizou sozinho').toBe(false);

    expect(sumarioAtualizado(gerarSumario(depois)),
      'atualizar não alcançou o sumário').toBe(true);
  });

  it('o sumário guarda a folha de cada título, e a folha anda', () => {
    /*
      O número ali é a única coisa que o sumário existe para dizer. Acrescentar
      uma seção em folha própria empurra o que vier depois — e um sumário que
      não guardasse a folha nunca ficaria velho por esse lado, que é o lado que
      mais envelhece num documento de verdade.
    */
    const pronto = resolvido();
    const folhas = pronto.sumario!.map(i => i.pagina);
    expect(new Set(folhas).size, 'todos os títulos caíram na mesma folha').toBeGreaterThan(1);
    expect(folhas, 'as folhas do sumário saíram fora de ordem')
      .toEqual([...folhas].sort((a, b) => a - b));
  });

  it('empurrar um título de folha envelhece o sumário, sem mudar uma palavra', () => {
    /*
      O lado que mais envelhece num documento de verdade, e o único que um
      sumário sem folha gravada não teria como perceber: ninguém mexeu em
      título nenhum — os textos e os níveis estão idênticos —, e mesmo assim o
      sumário passou a mandar quem lê para a folha errada.
    */
    const pronto = resolvido();
    expect(sumarioAtualizado(pronto)).toBe(true);

    /* Uma folha a mais no meio, sem tocar em título nenhum. */
    const empurrado: Doc = {
      ...pronto,
      blocos: pronto.blocos.map(b => (b.id === 'ap-2'
        ? { ...b, quebraDePagina: true } : b)),
    };
    expect(titulosDoDoc(empurrado).map(t => t.texto),
      'algum título mudou de texto — a prova tem de ser só de folha')
      .toEqual(pronto.sumario!.map(t => t.texto));
    expect(meta.feita(empurrado),
      'o sumário continuou em dia com as folhas de antes').toBe(false);
  });

  it('sumário nenhum não conta como em dia', () => {
    expect(meta.feita(RELATORIO_ANUAL_INICIAL)).toBe(false);
  });
});

describe('cada meta diz onde e como', () => {
  it('nenhuma fica sem passo a passo nem sem lugar', () => {
    for (const m of METAS_DO_RELATORIO_ANUAL) {
      expect(m.passos.length, `"${m.id}" não tem passo a passo`).toBeGreaterThanOrEqual(2);
      expect(m.onde.length, `"${m.id}" não diz onde isso se resolve`).toBeGreaterThan(4);
      expect(m.detalhe.length, `"${m.id}" não explica o que se pede`).toBeGreaterThan(40);
    }
  });
});
