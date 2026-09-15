import { describe, it, expect } from 'vitest';
import {
  RELATORIO_INICIAL, METAS_DO_RELATORIO, COLUNAS_DA_LISTA, COLUNA_A_TIRAR,
  INSCRITOS_NA_LISTA, INSCRITA_QUE_FALTA, FOTO_DA_FOGUEIRA, LEGENDA_DIGITADA,
  tabelaDaLista, linhasNaTabulacao, fotoDaFogueira, legendasDoDoc, legendaEhCampo,
  legendaDeFigura, metaDaVez,
  type Doc, type Secao,
} from './relatorioDoAcampamento';
import {
  paragrafos, ehParagrafo, textoDoBloco, textoDoTrecho, numeroDoCampo,
  larguraDaTabela, tabelaRetangular, ESTILO_PADRAO_DE_TABELA,
} from './documento';

/*
  O relatório do módulo 3, e as seis metas que o completam.

  ── O que muda em relação aos dois primeiros ─────────────────────────────
  Nos módulos 1 e 2 o documento chega errado e se conserta. Aqui ele chega
  **incompleto**, e o que se faz é acrescentar — tabela, imagem, legenda. Por
  isso a pergunta de sempre ("dá para vencer?") ganha uma irmã: **dá para
  vencer digitando?** Se a legenda pudesse ser um parágrafo escrito à mão
  dizendo "Figura 2", a tarefa mediria ter digitado duas palavras e entregaria
  ao clube um documento que erra na primeira revisão.

  A trava que responde isso é a de baixo, "a legenda digitada não conta" — e
  ela é o motivo de o campo existir no modelo.
*/

/* ── A solução de referência ──────────────────────────────────────────────── */

/** Converte a lista alinhada com Tab numa tabela, como o Word converteria. */
const converterEmTabela = (d: Doc): Doc => {
  const daLista = paragrafos(d).filter(b => b.secao === 'lista');
  if (daLista.length === 0) return d;
  const onde = d.blocos.findIndex(b => b.id === daLista[0].id);
  const tabela = {
    tipo: 'tabela' as const,
    id: 'tab-inscritos',
    secao: 'lista' as Secao,
    linhas: daLista.map(b => textoDoBloco(b).split('\t')),
    cabecalho: false,
    estilo: ESTILO_PADRAO_DE_TABELA,
  };
  const resto = d.blocos.filter(b => b.secao !== 'lista');
  return { ...d, blocos: [...resto.slice(0, onde), tabela, ...resto.slice(onde)] };
};

const formatarTabela = (d: Doc): Doc => ({
  ...d,
  blocos: d.blocos.map(b => (b.tipo === 'tabela'
    ? { ...b, cabecalho: true, estilo: 'Tabela de Grade 4 — Ênfase 1' as const }
    : b)),
});

const mexerNasLinhas = (d: Doc): Doc => ({
  ...d,
  blocos: d.blocos.map((b) => {
    if (b.tipo !== 'tabela') return b;
    const coluna = b.linhas[0].indexOf(COLUNA_A_TIRAR);
    const semColuna = b.linhas.map(l => l.filter((_, i) => i !== coluna));
    return { ...b, linhas: [...semColuna, [...INSCRITA_QUE_FALTA]] };
  }),
});

const inserirFoto = (d: Doc): Doc => {
  const onde = d.blocos.findIndex(b => b.id === 'noite-1');
  const foto = {
    tipo: 'imagem' as const,
    id: 'img-fogueira',
    secao: FOTO_DA_FOGUEIRA.secao,
    arquivo: FOTO_DA_FOGUEIRA.arquivo,
    descricao: FOTO_DA_FOGUEIRA.descricao,
    /* Nasce alinhada com o texto, que é como o Word a insere — e é o que faz
       a meta seguinte ter o que consertar. */
    disposicao: 'alinhada' as const,
  };
  return { ...d, blocos: [...d.blocos.slice(0, onde + 1), foto, ...d.blocos.slice(onde + 1)] };
};

const dispor = (d: Doc): Doc => ({
  ...d,
  blocos: d.blocos.map(b => (b.tipo === 'imagem' && b.id === 'img-fogueira'
    ? { ...b, disposicao: 'quadrada' as const } : b)),
});

/** Legenda a foto nova por campo, e refaz a digitada pelo mesmo caminho. */
const legendar = (d: Doc): Doc => {
  const onde = d.blocos.findIndex(b => b.id === 'img-fogueira');
  const nova = legendaDeFigura('leg-fogueira', FOTO_DA_FOGUEIRA.secao, FOTO_DA_FOGUEIRA.descricao);
  const comNova = [...d.blocos.slice(0, onde + 1), nova, ...d.blocos.slice(onde + 1)];
  return {
    ...d,
    blocos: comNova.map(b => (b.id === LEGENDA_DIGITADA
      ? legendaDeFigura(LEGENDA_DIGITADA, 'encerramento', 'A bandeira da Unidade Falcão no mastro')
      : b)),
  };
};

function resolvido(): Doc {
  let d: Doc = RELATORIO_INICIAL;
  d = converterEmTabela(d);
  d = formatarTabela(d);
  d = mexerNasLinhas(d);
  d = inserirFoto(d);
  d = dispor(d);
  d = legendar(d);
  return d;
}

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('o relatório abre por completar', () => {
  it('nenhuma das seis metas está cumprida no primeiro segundo', () => {
    const verdes = METAS_DO_RELATORIO.filter(m => m.feita(RELATORIO_INICIAL)).map(m => m.id);
    expect(verdes,
      'estas metas abrem verdes — lista com item já marcado ensina a não ler a lista')
      .toEqual([]);
  });

  it('a lista chega alinhada com tabulação, e não como tabela', () => {
    /*
      A guarda contra o vazio deste módulo: sem a lista torta não há o que
      converter, e a primeira meta ficaria conferindo um documento que já
      nasceu certo.
    */
    expect(tabelaDaLista(RELATORIO_INICIAL)).toBeNull();
    expect(linhasNaTabulacao(RELATORIO_INICIAL)).toHaveLength(INSCRITOS_NA_LISTA.length + 1);
  });

  it('há um nome comprido o bastante para a tabulação desalinhar', () => {
    /*
      Sem ele o defeito não apareceria na tela, e a lição viraria "converta
      porque a tarefa mandou". O número é frouxo de propósito: o que importa é
      existir alguém bem mais comprido que os outros, e não um tamanho exato.
    */
    const nomes = INSCRITOS_NA_LISTA.map(l => l[0]);
    const maior = Math.max(...nomes.map(n => n.length));
    const menor = Math.min(...nomes.map(n => n.length));
    expect(maior - menor,
      'todos os nomes têm quase o mesmo tamanho: a tabulação ficaria reta e não haveria defeito')
      .toBeGreaterThanOrEqual(5);
  });

  it('a foto da fogueira ainda não está no documento', () => {
    expect(fotoDaFogueira(RELATORIO_INICIAL)).toBeNull();
  });

  it('a única legenda que existe foi digitada, e diz Figura 1', () => {
    const legendas = legendasDoDoc(RELATORIO_INICIAL);
    expect(legendas).toHaveLength(1);
    expect(legendaEhCampo(legendas[0]),
      'a legenda chegou como campo — não haveria o que a lição mostrar').toBe(false);
    expect(textoDoBloco(legendas[0])).toContain('Figura 1');
  });
});

describe('o relatório pode ser vencido', () => {
  it('a solução de referência deixa a lista inteira verde', () => {
    const d = resolvido();
    const vermelhas = METAS_DO_RELATORIO.filter(m => !m.feita(d)).map(m => m.id);
    expect(vermelhas,
      'laboratório impossível de vencer é pior do que um que abre resolvido')
      .toEqual([]);
  });

  it('cada meta é a primeira da vez em algum momento do caminho', () => {
    let d: Doc = RELATORIO_INICIAL;
    const vistas: string[] = [];
    const passos: ((x: Doc) => Doc)[] = [
      converterEmTabela, formatarTabela, mexerNasLinhas, inserirFoto, dispor, legendar,
    ];
    for (const passo of passos) {
      vistas.push(metaDaVez(d)!.id);
      d = passo(d);
    }
    expect(vistas).toEqual(METAS_DO_RELATORIO.map(m => m.id));
    expect(metaDaVez(d), 'sobrou meta depois do último passo').toBeNull();
  });

  it('a tabela pronta é retangular, e não perdeu ninguém no caminho', () => {
    /* Linha curta desenha tabela com buraco, e nada estoura. */
    const t = tabelaDaLista(resolvido())!;
    expect(tabelaRetangular(t), 'a tabela ficou com linha de tamanho diferente').toBe(true);
    expect(larguraDaTabela(t)).toBe(COLUNAS_DA_LISTA.length - 1);
    expect(t.linhas).toHaveLength(INSCRITOS_NA_LISTA.length + 2);
  });
});

describe('a legenda é campo, e o número sai da posição', () => {
  it('a legenda digitada não conta, mesmo dizendo exatamente o texto certo', () => {
    /*
      A trava que dá razão de existir ao campo no modelo. Aqui o desbravador
      faz tudo e, na última tarefa, digita "Figura 2 — ..." à mão: na tela
      fica idêntico ao certo. Se isto passasse, o laboratório mediria ter
      digitado duas palavras e o relatório entregue erraria na primeira
      revisão, sem nada avisar.
    */
    let d = resolvido();
    d = {
      ...d,
      blocos: d.blocos.map(b => (b.id === LEGENDA_DIGITADA && ehParagrafo(b)
        ? { ...b, trechos: [{ ...b.trechos[0], campo: undefined, texto: 'Figura 2 — A bandeira da Unidade Falcão no mastro.' }] }
        : b)),
    };
    const meta = METAS_DO_RELATORIO.find(m => m.id === 'legendas')!;
    expect(meta.feita(d),
      'uma legenda digitada passou por legenda de verdade').toBe(false);
  });

  it('documento sem legenda nenhuma não conta como legendado', () => {
    /*
      A guarda contra o vazio desta meta, e ela não é hipótese: o passo a passo
      manda **apagar** a legenda digitada antes de refazê-la pelo caminho
      certo. Quem apagasse as duas e parasse ali teria "todas as legendas são
      campo" verdadeiro por não haver nenhuma — a armadilha do "zero link não é
      zero link quebrado", na tarefa que fecha o módulo.
    */
    const d = resolvido();
    const semNenhuma: Doc = {
      ...d,
      blocos: d.blocos.filter(b => !(ehParagrafo(b) && b.estilo === 'Legenda')),
    };
    expect(legendasDoDoc(semNenhuma)).toHaveLength(0);
    const meta = METAS_DO_RELATORIO.find(m => m.id === 'legendas')!;
    expect(meta.feita(semNenhuma),
      'um documento sem legenda nenhuma passou por legendado').toBe(false);
  });

  it('entrar uma figura no meio renumera as de baixo sozinho', () => {
    /*
      O requisito 4.3 inteiro, medido. A legenda do mastro é escrita uma vez e
      nunca mais tocada: o número dela muda porque a posição dela mudou.
    */
    let d: Doc = RELATORIO_INICIAL;
    d = {
      ...d,
      blocos: d.blocos.map(b => (b.id === LEGENDA_DIGITADA
        ? legendaDeFigura(LEGENDA_DIGITADA, 'encerramento', 'A bandeira da Unidade Falcão no mastro')
        : b)),
    };
    const soDoMastro = legendasDoDoc(d)[0];
    expect(numeroDoCampo(d, soDoMastro.trechos[0].id),
      'sozinha, ela é a Figura 1').toBe(1);

    /* Agora entra a fogueira, antes dela, com a legenda dela. */
    d = legendar(dispor(inserirFoto(d)));
    const [primeira, segunda] = legendasDoDoc(d);
    expect(textoDoTrecho(d, primeira.trechos[0])).toBe('Figura 1');
    expect(textoDoTrecho(d, segunda.trechos[0]),
      'a legenda do mastro não andou: é ela que, digitada, mentiria').toBe('Figura 2');
  });

  it('o campo não guarda o número, e é por isso que ele anda', () => {
    /* Um campo que gravasse "Figura 1" seria texto digitado com outro nome. */
    const leg = legendaDeFigura('x', 'noite', 'A fogueira');
    const campo = leg.trechos.find(t => t.campo)!;
    expect(campo.texto, 'o campo chegou com número gravado dentro').toBe('');
    expect(textoDoBloco(leg),
      'o texto digitado da legenda não pode conter o número').not.toMatch(/Figura\s*\d/);
  });
});

describe('converter é tirar a lista de lá, e não só pôr uma tabela', () => {
  it('uma tabela em branco ao lado da lista torta não conta', () => {
    /*
      O Word tem os dois comandos, e é assim que tem de ser: um programa não
      esconde botão conforme o exercício. Mas inserir uma grade vazia e deixar
      a lista alinhada com Tab logo abaixo resolve zero — o documento fica com
      as duas coisas. A meta exige que a tabulação tenha **sumido**, que é o
      que "converter" quer dizer.
    */
    const d = RELATORIO_INICIAL;
    const comGradeVazia: Doc = {
      ...d,
      blocos: [...d.blocos, {
        tipo: 'tabela' as const, id: 'tab-vazia', secao: 'lista' as Secao,
        linhas: [['', '', ''], ['', '', '']],
        cabecalho: false, estilo: ESTILO_PADRAO_DE_TABELA,
      }],
    };
    const meta = METAS_DO_RELATORIO.find(m => m.id === 'tabela')!;
    expect(meta.feita(comGradeVazia),
      'uma grade vazia passou por lista convertida').toBe(false);
    expect(linhasNaTabulacao(comGradeVazia),
      'a lista continua alinhada com Tab, que é o ponto').toHaveLength(
      INSCRITOS_NA_LISTA.length + 1);
  });
});

describe('formatar a tabela são as duas metades', () => {
  const meta = METAS_DO_RELATORIO.find(m => m.id === 'formatar')!;

  it('marcar o cabeçalho sem escolher estilo não basta', () => {
    const d = { ...converterEmTabela(RELATORIO_INICIAL) };
    const so: Doc = {
      ...d,
      blocos: d.blocos.map(b => (b.tipo === 'tabela' ? { ...b, cabecalho: true } : b)),
    };
    expect(meta.feita(so)).toBe(false);
  });

  it('escolher o estilo sem marcar o cabeçalho também não', () => {
    const d = converterEmTabela(RELATORIO_INICIAL);
    const so: Doc = {
      ...d,
      blocos: d.blocos.map(b => (b.tipo === 'tabela'
        ? { ...b, estilo: 'Tabela de Lista 3' as const } : b)),
    };
    expect(meta.feita(so)).toBe(false);
  });

  it('a grade crua com que a tabela nasce não conta como estilo escolhido', () => {
    const d = converterEmTabela(RELATORIO_INICIAL);
    const so: Doc = {
      ...d,
      blocos: d.blocos.map(b => (b.tipo === 'tabela'
        ? { ...b, cabecalho: true, estilo: ESTILO_PADRAO_DE_TABELA } : b)),
    };
    expect(meta.feita(so),
      'ficar com o estilo que veio sozinho passou por escolher na galeria').toBe(false);
  });
});

describe('linha e coluna são gestos diferentes', () => {
  const meta = METAS_DO_RELATORIO.find(m => m.id === 'linhas-e-colunas')!;

  it('esvaziar as células da coluna não é remover a coluna', () => {
    /*
      A confusão que a teoria nomeia: Delete esvazia e deixa a coluna lá,
      ocupando espaço. Se a meta lesse "nenhuma célula de pagamento tem texto",
      ela premiaria exatamente o gesto errado.
    */
    const d = mexerNasLinhas(converterEmTabela(RELATORIO_INICIAL));
    const t = tabelaDaLista(d)!;
    const comColunaVazia: Doc = {
      ...d,
      blocos: d.blocos.map(b => (b.tipo === 'tabela'
        ? { ...b, linhas: b.linhas.map((l, i) => [...l, i === 0 ? COLUNA_A_TIRAR : '']) }
        : b)),
    };
    expect(larguraDaTabela(tabelaDaLista(comColunaVazia)!)).toBe(larguraDaTabela(t) + 1);
    expect(meta.feita(comColunaVazia),
      'a coluna esvaziada e mantida passou por coluna removida').toBe(false);
  });

  it('tirar a coluna sem acrescentar a linha não basta', () => {
    const d = converterEmTabela(RELATORIO_INICIAL);
    const so: Doc = {
      ...d,
      blocos: d.blocos.map((b) => {
        if (b.tipo !== 'tabela') return b;
        const i = b.linhas[0].indexOf(COLUNA_A_TIRAR);
        return { ...b, linhas: b.linhas.map(l => l.filter((_, j) => j !== i)) };
      }),
    };
    expect(meta.feita(so)).toBe(false);
  });
});

describe('a foto entra onde o texto fala dela', () => {
  it('a fogueira no fim do relatório não conta', () => {
    /*
      Imagem longe do parágrafo que a explica obriga quem lê a adivinhar de
      qual das coisas ela é — e num relatório de clube é o defeito mais comum
      depois da foto esticada. A tarefa diz onde, e mede onde.
    */
    const d = inserirFoto(RELATORIO_INICIAL);
    const noLugarErrado: Doc = {
      ...d,
      blocos: d.blocos.map(b => (b.tipo === 'imagem' && b.id === 'img-fogueira'
        ? { ...b, secao: 'encerramento' as Secao } : b)),
    };
    const meta = METAS_DO_RELATORIO.find(m => m.id === 'imagem')!;
    expect(meta.feita(noLugarErrado),
      'a foto da fogueira passou valendo na seção do encerramento').toBe(false);
    expect(meta.feita(d), 'e na seção certa ela vale').toBe(true);
  });
});

describe('ajustar ao texto não é qualquer disposição', () => {
  const meta = METAS_DO_RELATORIO.find(m => m.id === 'disposicao')!;
  const comDisposicao = (qual: 'alinhada' | 'atras' | 'frente' | 'quadrada' | 'acima-e-abaixo'): Doc => {
    const d = inserirFoto(RELATORIO_INICIAL);
    return {
      ...d,
      blocos: d.blocos.map(b => (b.tipo === 'imagem' && b.id === 'img-fogueira'
        ? { ...b, disposicao: qual } : b)),
    };
  };

  it('alinhada com o texto é como ela nasce, e não conta', () => {
    expect(meta.feita(comDisposicao('alinhada'))).toBe(false);
  });

  it('atrás e à frente fazem o texto ignorar a imagem, e não contam', () => {
    /*
      Elas tiram a imagem da linha, o que parece resolver — e é justamente o
      que não é "ajustá-la ao texto": o texto passa por cima dela. É a família
      do "abrir com" que não é "definir padrão".
    */
    expect(meta.feita(comDisposicao('atras'))).toBe(false);
    expect(meta.feita(comDisposicao('frente'))).toBe(false);
  });

  it('as que arrumam o texto em volta contam', () => {
    expect(meta.feita(comDisposicao('quadrada'))).toBe(true);
    expect(meta.feita(comDisposicao('acima-e-abaixo'))).toBe(true);
  });
});

describe('cada meta diz onde e como', () => {
  it('nenhuma fica sem passo a passo nem sem lugar', () => {
    for (const m of METAS_DO_RELATORIO) {
      expect(m.passos.length, `"${m.id}" não tem passo a passo`).toBeGreaterThanOrEqual(3);
      expect(m.onde.length, `"${m.id}" não diz onde isso se resolve`).toBeGreaterThan(4);
      expect(m.detalhe.length, `"${m.id}" não explica o que se pede`).toBeGreaterThan(40);
    }
  });
});
