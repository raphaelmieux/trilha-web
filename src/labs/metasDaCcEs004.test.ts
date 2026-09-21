import { describe, it, expect } from 'vitest';
import {
  METAS_DA_LICAO, type LicaoDaCcEs004,
} from './metasDaCcEs004';
import {
  type PastaDoClube, type MetaDoPdf,
  pastaAntesDeExportar, pastaComOsTresPdfs, pastaDasFichas, pastaDoRecibo,
  pastaDosFormularios, pastaParaAssinar, pastaDoDossie,
  exportarDeOrigem, reciboFotografado, comPdf, semPdf, comDescoberta,
  ARQUIVOS_DE_ORIGEM, CAMPOS_DA_AUTORIZACAO,
} from './dossieDoClube';
import {
  CAPTURA_BOA, juntar, extrair, dividir, comprimir, reconhecerTexto,
  preencher, anotar, assinarVerificavel, proteger,
} from './documentoPdf';

/*
  As sete lições da CC-ES004.

  Duas contas, e as duas são necessárias. **Nenhuma meta abre verde**, porque
  lista com item já marcado no segundo zero ensina a não ler a lista. E **toda
  meta se vence**, porque laboratório impossível é pior do que um que abre
  resolvido: um dá tarefa verde de graça, o outro deixa quem fez tudo certo
  olhando uma lista vermelha sem nada na tela que explique.

  A solução de referência mora aqui, e não no currículo: gabarito no currículo
  fica a um import de distância da tela.
*/

const PARTIDA: Record<LicaoDaCcEs004, () => PastaDoClube> = {
  gerar: pastaAntesDeExportar,
  juntar: pastaComOsTresPdfs,
  reduzir: pastaDasFichas,
  digitalizar: pastaDoRecibo,
  formulario: pastaDosFormularios,
  assinar: pastaParaAssinar,
  dossie: pastaDoDossie,
};

const verdes = (metas: MetaDoPdf[], p: PastaDoClube) =>
  metas.filter(m => m.feita(p)).map(m => m.id);

const vermelhas = (metas: MetaDoPdf[], p: PastaDoClube) =>
  metas.filter(m => !m.feita(p)).map(m => m.id);

/* ── As soluções de referência ────────────────────────────────────────────── */

const resolver: Record<LicaoDaCcEs004, (p: PastaDoClube) => PastaDoClube> = {
  gerar: p => {
    const comTudo = ARQUIVOS_DE_ORIGEM.reduce((q, a) => comPdf(q, exportarDeOrigem(a)), p);
    /* E então mexer na ata, que é o que mostra o PDF ficando para trás. */
    return {
      ...comTudo,
      origens: comTudo.origens.map(a => (a.programa === 'texto'
        ? { ...a, linhas: [...a.linhas, 'Retificação: a diária passou a R$ 48,00.'] }
        : a)),
    };
  },

  juntar: p => {
    const combinado = juntar(p.pdfs, 'acampamento-2026-07-12-v01.pdf');
    const comCombinado = comPdf(p, combinado);
    const sozinha = extrair(combinado, [combinado.paginas[1].id], 'orcamento-so-2026-07-12-v01.pdf');
    const comExtraida = comPdf(comCombinado, sozinha);
    const [um, dois] = dividir(combinado, combinado.paginas[2].id,
      ['parte-1-2026-07-12-v01.pdf', 'parte-2-2026-07-12-v01.pdf']);
    return comPdf(comPdf(comExtraida, um), dois);
  },

  /* Reconhecer **primeiro**, reduzir depois. A ordem é a lição. */
  reduzir: p => ({
    ...p,
    pdfs: p.pdfs.map(d => comprimir(reconhecerTexto(d), 'forte')),
  }),

  digitalizar: p => comPdf(p, reconhecerTexto(reciboFotografado(CAPTURA_BOA))),

  formulario: p => {
    const comCampos = p.pdfs.map(d => (d.campos.length
      ? CAMPOS_DA_AUTORIZACAO.reduce(
        (q, c) => preencher(q, c.id, c.obrigatorio ? 'Ana Beatriz Rocha' : ''), d)
      : d));
    return {
      ...p,
      pdfs: comCampos.map(d => (d.anotacoes.some(a => a.por === 'Tia Rute')
        ? anotar(anotar(d, {
          id: 'resposta', paginaId: d.paginas[0].id, tipo: 'comentario',
          por: 'Ana Beatriz Rocha', texto: 'Confirmei com a secretaria: a data bate.',
        }), {
          id: 'marca', paginaId: d.paginas[0].id, tipo: 'destaque',
          por: 'Ana Beatriz Rocha', texto: '30 de junho',
        })
        : d)),
    };
  },

  assinar: p => {
    const assinado = p.pdfs.map(d => proteger(
      assinarVerificavel(d, 'Marta Rocha', 1_700_000_000_000),
      { senha: 'clube2026', pedeAoLeitor: { naoCopiar: true, naoImprimir: false } },
    ));
    return comDescoberta(
      comDescoberta({ ...p, pdfs: assinado }, 'assinatura-quebra'),
      'senha-nao-protege',
    );
  },

  dossie: p => {
    /* O quinto é o recibo do módulo 4, trazido para o dossiê — reunir é
       metade do que o requisito 8 manda fazer. */
    const cinco = comPdf(p, reconhecerTexto(reciboFotografado(CAPTURA_BOA)));
    const lidos = cinco.pdfs.map(reconhecerTexto);
    const nomes = [
      'ata-2026-03-14-v01.pdf',
      'orcamento-2026-07-01-v02.pdf',
      'presenca-2026-07-19-v01.pdf',
      'circular-2026-06-02-v01.pdf',
      'recibo-2026-07-02-v01.pdf',
    ];
    return { ...cinco, pdfs: lidos.map((d, i) => ({ ...d, nome: nomes[i] })) };
  },
};

/* ── As duas contas ───────────────────────────────────────────────────────── */

const LICOES = Object.keys(METAS_DA_LICAO) as LicaoDaCcEs004[];

describe('nenhuma lição da CC-ES004 abre com tarefa verde', () => {
  it.each(LICOES)('%s', licao => {
    expect(verdes(METAS_DA_LICAO[licao], PARTIDA[licao]())).toEqual([]);
  });

  it('e as sete têm tarefa', () => {
    /* A guarda contra o vazio: lista de metas vazia passaria na conta acima
       por não ter conferido nada. */
    for (const l of LICOES) expect(METAS_DA_LICAO[l].length).toBeGreaterThan(0);
    expect(LICOES).toHaveLength(7);
  });
});

describe('e toda meta se vence', () => {
  it.each(LICOES)('%s', licao => {
    const metas = METAS_DA_LICAO[licao];
    expect(vermelhas(metas, resolver[licao](PARTIDA[licao]()))).toEqual([]);
  });
});

/* ── As armadilhas que cada lição planta ──────────────────────────────────── */

describe('módulo 3: a ordem entre reconhecer e reduzir', () => {
  const meta = (id: string) => METAS_DA_LICAO.reduzir.find(m => m.id === id)!;

  it('reduzir antes de reconhecer deixa o arquivo leve e sem achar nada', () => {
    /*
      É a armadilha da lição. Nos dois caminhos o arquivo encolhe o mesmo
      tanto, e só a procura acusa — que é o que faz a tarefa da procura
      existir separada da tarefa de reduzir.
    */
    const naOrdemErrada: PastaDoClube = {
      ...pastaDasFichas(),
      pdfs: pastaDasFichas().pdfs.map(d => reconhecerTexto(comprimir(d, 'forte'))),
    };

    expect(meta('reduziu').feita(naOrdemErrada)).toBe(true);
    expect(meta('ainda-acha').feita(naOrdemErrada)).toBe(false);
  });
});

describe('módulo 5: responder não é o mesmo que ter recebido', () => {
  const meta = (id: string) => METAS_DA_LICAO.formulario.find(m => m.id === id)!;

  it('o comentário que já veio da liderança não conta como resposta', () => {
    /* "Zero link não é zero link quebrado" aplicado a uma conversa: a
       circular chega com um balão dentro, e contá-lo deixaria a tarefa verde
       antes de alguém dizer coisa nenhuma. */
    expect(meta('respondeu').feita(pastaDosFormularios())).toBe(false);
  });

  it('e campo preenchido com espaço não preenche nada', () => {
    const comEspacos: PastaDoClube = {
      ...pastaDosFormularios(),
      pdfs: pastaDosFormularios().pdfs.map(d => (d.campos.length
        ? CAMPOS_DA_AUTORIZACAO.reduce((q, c) => preencher(q, c.id, '   '), d)
        : d)),
    };
    expect(meta('preencheu').feita(comEspacos)).toBe(false);
  });
});

describe('módulo 6: as duas descobertas que não deixam marca', () => {
  it('assinar não basta: é preciso ter visto a assinatura quebrar', () => {
    const soAssinou: PastaDoClube = {
      ...pastaParaAssinar(),
      pdfs: pastaParaAssinar().pdfs.map(d => assinarVerificavel(d, 'Marta Rocha', 1)),
    };
    const meta = (id: string) => METAS_DA_LICAO.assinar.find(m => m.id === id)!;
    expect(meta('assinou').feita(soAssinou)).toBe(true);
    expect(meta('viu-quebrar').feita(soAssinou)).toBe(false);
  });

  it('e pôr senha não basta: é preciso ter copiado o texto apesar dela', () => {
    const soProtegeu: PastaDoClube = {
      ...pastaParaAssinar(),
      pdfs: pastaParaAssinar().pdfs.map(d => proteger(d, {
        senha: 'x', pedeAoLeitor: { naoCopiar: true, naoImprimir: false },
      })),
    };
    const meta = (id: string) => METAS_DA_LICAO.assinar.find(m => m.id === id)!;
    expect(meta('protegeu').feita(soProtegeu)).toBe(true);
    expect(meta('senha-nao-protege').feita(soProtegeu)).toBe(false);
  });
});

describe('módulo 7: o padrão de nome pede molde e pede data', () => {
  const meta = METAS_DA_LICAO.dossie.find(m => m.id === 'nomeados')!;

  /* Cinco documentos: os quatro da pasta mais o recibo trazido do módulo 4. */
  const cincoNaPasta = () => comPdf(pastaDoDossie(), reciboFotografado(CAPTURA_BOA));

  const comNomes = (nomes: string[]): PastaDoClube => ({
    ...cincoNaPasta(),
    pdfs: cincoNaPasta().pdfs.map((d, i) => ({ ...d, nome: nomes[i] })),
  });

  it('cinco nomes no mesmo molde, com data e versão, passam', () => {
    expect(meta.feita(comNomes([
      'ata-2026-03-14-v01.pdf', 'orcamento-2026-07-01-v02.pdf',
      'recibo-2026-07-02-v01.pdf', 'presenca-2026-07-19-v01.pdf',
      'circular-2026-06-02-v01.pdf',
    ]))).toBe(true);
  });

  it('mesmo molde sem data nenhuma, não', () => {
    /*
      A conta do molde apaga justamente a diferença entre uma data e um número
      qualquer, e é por isso que as duas contas existem: cinco nomes no mesmo
      molde e sem data não ordenam a pasta, que é para o que o padrão serve.
    */
    expect(meta.feita(comNomes([
      'ata-um-v01.pdf', 'orcamento-um-v02.pdf', 'recibo-um-v01.pdf',
      'presenca-um-v01.pdf', 'circular-um-v01.pdf',
    ]))).toBe(false);
  });

  it('datados e versionados, mas cada um num molde, também não', () => {
    /*
      O divergente traz data **e** versão, e só o molde muda: `a_#_v#` contra
      `a-#-#-#-v#`. Escrito sem versão, ele reprovaria pela conta da versão e
      a do molde nunca seria exercitada — foi o que a mutação de
      `moldes.size === 1` para `>= 1` mostrou, escapando calada.
    */
    expect(meta.feita(comNomes([
      'ata-2026-03-14-v01.pdf', 'orcamento_20260701_v02.pdf',
      'recibo-2026-07-02-v01.pdf', 'presenca-2026-07-19-v01.pdf',
      'circular-2026-06-02-v01.pdf',
    ]))).toBe(false);
  });

  it('e um nome com data e versão que a CC-ES001 recusa é recusado aqui também', () => {
    /*
      A lição manda usar "o padrão que você escolheu na CC-ES001", então as
      duas veredas precisam responder a mesma coisa sobre o mesmo nome. `v 2`
      com espaço e a data em dia-mês-ano são os dois casos em que as contas
      escritas à mão aqui divergiam das de lá.
    */
    expect(meta.feita(comNomes([
      'ata-14-03-2026-v 1.pdf', 'orcamento-01-07-2026-v 2.pdf',
      'recibo-02-07-2026-v 1.pdf', 'presenca-19-07-2026-v 1.pdf',
      'circular-02-06-2026-v 1.pdf',
    ]))).toBe(false);
  });

  it('e um documento que continua sendo foto derruba o dossiê', () => {
    const outra = METAS_DA_LICAO.dossie.find(m => m.id === 'todos-pesquisaveis')!;
    const quaseTudo: PastaDoClube = {
      ...cincoNaPasta(),
      pdfs: cincoNaPasta().pdfs.map((d, i) => (i === 2 ? d : reconhecerTexto(d))),
    };
    expect(outra.feita(quaseTudo)).toBe(false);
  });

  it('e a pasta vazia não se diz pesquisável', () => {
    /* "Zero de zero é tudo": `every` sobre lista vazia é verdadeiro. */
    const outra = METAS_DA_LICAO.dossie.find(m => m.id === 'todos-pesquisaveis')!;
    expect(outra.feita({ origens: [], pdfs: [], descobertas: [] })).toBe(false);
  });
});

describe('módulo 2: juntar é juntar coisas diferentes', () => {
  const meta = METAS_DA_LICAO.juntar.find(m => m.id === 'juntou')!;

  it('o mesmo documento combinado consigo mesmo não conta', () => {
    /* Três páginas, e nada reunido. Contar só páginas deixaria passar. */
    const p = pastaComOsTresPdfs();
    const um = p.pdfs[0];
    const repetido = juntar([um, um, um], 'repetido.pdf');
    expect(meta.feita(comPdf(semPdf(p, um.nome), repetido))).toBe(false);
  });
});
