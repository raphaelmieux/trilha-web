import { describe, it, expect } from 'vitest';
import {
  type ContextoDaNuvem, type LicaoDaCcEs006,
  LICOES_DA_CC_ES006, contextoInicial,
} from './metasDaCcEs006';
import {
  type Nuvem, type Pessoa, type Papel,
  compartilhar, conflitoDeSincronizacao, gravarVersao, mandarParaALixeira,
  mandarPorAnexo, mover, mudarAcessoGeral, restaurarVersao, transferirPropriedade,
  versaoAtual,
} from './arquivoCompartilhado';
import {
  type Doc, type Paragrafo, type Trecho,
  acrescentarComentario, aceitarRevisao, blocoDe, linhaDe, rejeitarRevisao,
  resolverComentario, responderComentario, trechoDe,
} from './documento';
import {
  COMBINADO_DE_TRABALHO, ESCALA, LINHA_DA_MARTA, LISTA_DE_MATERIAIS,
  PERGUNTAS_DO_COMBINADO, RESPOSTA_DE,
} from './documentosDaNuvem';

/*
  O que as nove lições da CC-ES006 cobram.

  ── As duas contas que esta trava faz ────────────────────────────────────
  Nenhuma meta abre verde, e uma solução de referência fecha cada lista
  inteira. As duas são necessárias e nenhuma substitui a outra: lista que
  abre com item marcado ensina a não ler a lista, e lista que não fecha
  deixa quem fez tudo certo olhando uma tarefa vermelha sem nada na tela
  que explique — que é pior, e foi o que a CC-ES004 teve na lição de
  assinar.

  ── E os caminhos rápidos e errados ──────────────────────────────────────
  Três gestos resolvem depressa e ensinam o contrário do requisito: abrir o
  link para qualquer pessoa em vez de dar três níveis, fechar a pasta
  inteira em vez de tirar a ficha de dentro dela, e apagar a cópia em
  conflito sem juntar o que ela tinha. Os três são exercitados, e os três
  deixam a meta certa vermelha.
*/

/* ── Ferramentas para montar as soluções ───────────────────────────────────── */

const comLinha = (d: Doc<string>, id: string, texto: string): Doc<string> =>
  ({ ...d, blocos: [...d.blocos, linhaDe(id, 'corpo', texto)] });

const respondendo = (d: Doc<string>, id: string, texto: string): Doc<string> => ({
  ...d,
  blocos: d.blocos.map(b => (b.id === id && b.tipo === 'paragrafo'
    ? { ...b, trechos: [trechoDe(`${id}-a`, texto)] } : b)),
});

/** Um trecho proposto em modo de Sugestão: ele entra marcado, e não como texto. */
const sugerido = (id: string, texto: string): Trecho =>
  ({ ...trechoDe(id, texto), revisao: { autor: 'voce', tipo: 'inserido' } });

const comSugestoes = (d: Doc<string>): Doc<string> => ({
  ...d,
  blocos: [
    ...d.blocos,
    blocoDe('lm-s1', 'corpo', [sugerido('lm-s1-a', 'Galão de água: 2 de vinte litros.')]),
    blocoDe('lm-s2', 'corpo', [sugerido('lm-s2-a', 'Rádio comunicador: 3.')]),
  ] as Paragrafo<string>[],
});

const escalaDoVoce = () =>
  comLinha(ESCALA(), 'es-7', 'Sábado, 16h — Lanche da tarde: unidade Águia.');

const escalaDosDois = () =>
  ({ ...escalaDoVoce(), blocos: [...escalaDoVoce().blocos, LINHA_DA_MARTA()] });

const O_QUE_A_MARTA_ESCREVEU = 'A Águia troca com a Onça no almoço de sábado.';

const gravar = (c: ContextoDaNuvem, id: string, quem: Pessoa[], doc: Doc<string>) =>
  ({ ...c, nuvem: gravarVersao(c.nuvem, id, 'agora', quem, doc) });

const mexer = (c: ContextoDaNuvem, f: (n: Nuvem) => Nuvem) => ({ ...c, nuvem: f(c.nuvem) });

const vendo = (c: ContextoDaNuvem, ...o: string[]) =>
  ({ ...c, descobertas: [...c.descobertas, ...o] });

const docDe = (n: Nuvem, id: string) =>
  versaoAtual(n.arquivos.find(a => a.id === id)!)!.doc!;

/* ── As nove soluções de referência ────────────────────────────────────────── */

const SOLUCOES: Record<LicaoDaCcEs006, (c: ContextoDaNuvem) => ContextoDaNuvem> = {
  anexo: c => {
    let d = mexer(c, n => mandarPorAnexo(n, 'materiais', 'cleide', 'hoje'));
    d = gravar(d, 'materiais', ['voce'],
      comLinha(LISTA_DE_MATERIAIS(), 'lm-5', 'Galão de água: 2 de vinte litros.'));
    d = vendo(d, 'a-copia-nao-acompanha');
    return mexer(d, n => compartilhar(n, 'materiais', 'ronaldo', 'editor'));
  },

  niveis: c => {
    const papeis: [Pessoa, Papel][] =
      [['marta', 'editor'], ['ronaldo', 'comentarista'], ['cleide', 'leitor']];
    const d = papeis.reduce(
      (acc, [quem, papel]) => mexer(acc, n => compartilhar(n, 'materiais', quem, papel)), c);
    return vendo(d, 'leu-os-tres-limites');
  },

  pasta: c => {
    let d = mexer(c, n => compartilhar(n, 'pasta-acampamento', 'cleide', 'leitor'));
    d = vendo(d, 'a-pasta-alcanca', 'contou-quem-entrava');
    return mexer(d, n => mover(n, 'fichas', undefined));
  },

  juntos: c => {
    let d = gravar(c, 'escala', ['voce'], escalaDoVoce());
    d = gravar(d, 'escala', ['voce', 'marta'], escalaDosDois());
    return vendo(d, 'viu-as-bolhas');
  },

  comentarios: c => {
    let doc = docDe(c.nuvem, 'escala');
    doc = responderComentario(doc, 'c-marta-1',
      { id: 'r1', autor: 'voce', texto: 'Dá sim: a Falcão ajuda a servir.' });
    doc = resolverComentario(doc, 'c-marta-1');
    doc = acrescentarComentario(doc, {
      id: 'c-voce-1', trecho: 'es-5-a', autor: 'voce',
      texto: 'A desmontagem precisa começar às 13h, senão não dá tempo.',
      respostas: [], resolvido: false,
    });
    return gravar(c, 'escala', ['voce'], doc);
  },

  sugestao: c => {
    let d = vendo(c, 'comentarista-so-sugere', 'escreveu-em-modo-sugestao');
    d = { ...gravar(d, 'materiais', ['voce'], comSugestoes(LISTA_DE_MATERIAIS())), modo: 'sugestao' };
    /* Aceitar deixa o texto; rejeitar faz o outro nunca ter existido. */
    let doc = aceitarRevisao(docDe(d.nuvem, 'materiais'), 'lm-s1-a');
    doc = rejeitarRevisao(doc, 'lm-s2-a');
    d = { ...gravar(d, 'materiais', ['voce'], doc), modo: 'edicao' };
    return vendo(d, 'aceitou-uma-sugestao', 'rejeitou-uma-sugestao');
  },

  historico: c => {
    let d = vendo(c, 'achou-a-versao-boa');
    d = mexer(d, n => restaurarVersao(n, 'ata', 'ata-v2', 'voce', 'agora'));
    return vendo(d, 'leu-quem-escreveu');
  },

  conflito: c => {
    let d = gravar(c, 'escala', ['voce'], escalaDoVoce());
    d = mexer(d, n => conflitoDeSincronizacao(
      n, 'escala', 'marta', comLinha(ESCALA(), 'es-8', O_QUE_A_MARTA_ESCREVEU), 'hoje'));
    d = vendo(d, 'abriu-a-copia-em-conflito');
    d = gravar(d, 'escala', ['voce'],
      comLinha(escalaDoVoce(), 'es-8', O_QUE_A_MARTA_ESCREVEU));
    return mexer(d, n => mandarParaALixeira(n, 'escala-conflito-marta'));
  },

  combinado: c => {
    const respostas: Record<string, string> = {
      onde: 'Na pasta Clube Pioneiros, dentro da pasta do ano.',
      nomes: 'ano-mes-dia-assunto-versao, com a data primeiro para ordenar sozinho.',
      quem: 'A diretoria edita, os conselheiros comentam, as famílias leem.',
      saida: 'A propriedade passa para quem fica, antes de a conta ser desligada.',
    };
    let doc = COMBINADO_DE_TRABALHO() as Doc<string>;
    for (const p of PERGUNTAS_DO_COMBINADO) {
      doc = respondendo(doc, RESPOSTA_DE(p.id), respostas[p.id]);
    }
    let d = gravar(c, 'acordo', ['voce'], doc);
    d = gravar(d, 'acordo', ['marta'], doc);
    d = gravar(d, 'acordo', ['ronaldo'], doc);
    d = mexer(d, n => mover(n, 'acordo', 'pasta-clube'));
    return mexer(d, n => transferirPropriedade(n, 'acordo', 'ronaldo'));
  },
};

const IDS = Object.keys(LICOES_DA_CC_ES006) as LicaoDaCcEs006[];

/* ── As duas contas ────────────────────────────────────────────────────────── */

describe('nenhuma meta da CC-ES006 abre verde', () => {
  it('não há lição sem meta, que aprovaria tudo calado', () => {
    expect(IDS.length).toBe(9);
    for (const id of IDS) {
      expect(LICOES_DA_CC_ES006[id].metas.length, id).toBeGreaterThan(2);
    }
  });

  it.each(IDS)('%s abre com a lista inteira por fazer', id => {
    /*
      Lista com item já marcado no segundo zero ensina a não ler a lista. É a
      armadilha das metas de **preservação** — "sem abrir o link", "sem fechar
      a pasta do clube", "sem cópia solta na mão dele" —, que são verdadeiras
      antes de alguém fazer qualquer coisa. Elas viajam como conjunção da meta
      que de fato pede um gesto, e não como item próprio.
    */
    const c = contextoInicial(id);
    for (const m of LICOES_DA_CC_ES006[id].metas) {
      expect(m.feita(c), `${id} › ${m.id} já nasceu cumprida`).toBe(false);
    }
  });
});

describe('e uma solução de referência fecha cada lista inteira', () => {
  it.each(IDS)('%s fecha com os gestos que o desbravador faria', id => {
    /*
      A solução faz o caminho, e não carimba o fim: a da CC-ES004 pulava o
      meio e deixou passar uma lição impossível de vencer. Aqui ela manda o
      anexo antes de comparar, assina as três versões antes de conferir o
      histórico, e provoca o conflito antes de resolvê-lo.
    */
    const c = SOLUCOES[id](contextoInicial(id));
    for (const m of LICOES_DA_CC_ES006[id].metas) {
      expect(m.feita(c), `${id} › ${m.id} não fecha nem com tudo feito`).toBe(true);
    }
  });
});

/* ── Os três caminhos rápidos e errados ────────────────────────────────────── */

describe('abrir o link para qualquer pessoa não é dar três níveis', () => {
  it('com o link aberto para editar, os três papéis certos não fecham nada', () => {
    /*
      É o caminho de dois cliques, e a caixa continua mostrando os três nomes
      com os três papéis escritos ao lado, certinhos, do jeito que a pessoa os
      deixou. O que mudou é que não vale nada: quem tiver o endereço entra e
      escreve, sem estar em lista nenhuma.
    */
    const feito = SOLUCOES.niveis(contextoInicial('niveis'));
    const aberto = mexer(feito, n => mudarAcessoGeral(n, 'materiais', 'editor'));
    for (const m of LICOES_DA_CC_ES006.niveis.metas.filter(x => x.id !== 'viu-o-que-nao-deixa')) {
      expect(m.feita(aberto), `${m.id} continuou verde com o link aberto`).toBe(false);
    }
  });
});

describe('fechar a pasta inteira não é tirar a ficha de dentro dela', () => {
  it('fechar a pasta esconde a ficha e tira do clube o que ele usa', () => {
    /*
      É o conserto rápido e é o errado: a ficha para de ser alcançada, e a
      pasta do acampamento — que é onde o clube inteiro trabalha — fecha
      junto. Por isso "sem fechar a pasta" é **condição** da meta de tirar a
      ficha, e não uma terceira tarefa que a pessoa leria como detalhe.
    */
    let c = contextoInicial('pasta');
    c = mexer(c, n => compartilhar(n, 'pasta-acampamento', 'cleide', 'leitor'));
    c = vendo(c, 'a-pasta-alcanca', 'contou-quem-entrava');
    /* O gesto rápido: tirar todo mundo da pasta de cima. */
    c = mexer(c, n => ({
      arquivos: n.arquivos.map(a => (a.id === 'pasta-clube' ? { ...a, acessos: [] } : a)),
    }));
    c = mexer(c, n => ({
      arquivos: n.arquivos.map(a => (a.id === 'pasta-acampamento' ? { ...a, acessos: [] } : a)),
    }));

    const meta = LICOES_DA_CC_ES006.pasta.metas.find(m => m.id === 'tirou-a-ficha-de-la')!;
    expect(meta.feita(c), 'fechar a pasta do clube fechou a lição').toBe(false);
  });
});

describe('apagar a cópia em conflito sem juntar joga fora o que a outra escreveu', () => {
  it('a lição não fecha com a cópia na lixeira e o texto dela perdido', () => {
    let c = contextoInicial('conflito');
    c = gravar(c, 'escala', ['voce'], escalaDoVoce());
    c = mexer(c, n => conflitoDeSincronizacao(
      n, 'escala', 'marta', comLinha(ESCALA(), 'es-8', O_QUE_A_MARTA_ESCREVEU), 'hoje'));
    c = vendo(c, 'abriu-a-copia-em-conflito');
    /* O gesto rápido: mandar a cópia para a lixeira e seguir a vida. */
    c = mexer(c, n => mandarParaALixeira(n, 'escala-conflito-marta'));

    const juntou = LICOES_DA_CC_ES006.conflito.metas.find(m => m.id === 'juntou')!;
    expect(juntou.feita(c), 'apagar sem juntar fechou a lição').toBe(false);
  });

  it('e nem com o texto junto e a cópia ainda na pasta', () => {
    /* A outra metade: juntar sem tirar a cópia deixa na pasta um arquivo
       quase igual, que alguém abre por engano no mês que vem. */
    let c = contextoInicial('conflito');
    c = gravar(c, 'escala', ['voce'], escalaDoVoce());
    c = mexer(c, n => conflitoDeSincronizacao(
      n, 'escala', 'marta', comLinha(ESCALA(), 'es-8', O_QUE_A_MARTA_ESCREVEU), 'hoje'));
    c = gravar(c, 'escala', ['voce'], comLinha(escalaDoVoce(), 'es-8', O_QUE_A_MARTA_ESCREVEU));

    const tirou = LICOES_DA_CC_ES006.conflito.metas.find(m => m.id === 'tirou-a-copia')!;
    expect(tirou.feita(c)).toBe(false);
  });
});

describe('resolver o comentário de alguém sem responder não fecha nada', () => {
  it('a pergunta da Marta precisa de resposta, e não de um clique', () => {
    /*
      Resolver é um clique e responder não. Fechar o assunto sem dizer nada a
      quem perguntou é "zero link não é zero link quebrado" aplicado a uma
      conversa — e quem perguntou fica achando que ninguém leu.
    */
    const c = contextoInicial('comentarios');
    const doc = resolverComentario(docDe(c.nuvem, 'escala'), 'c-marta-1');
    const depois = gravar(c, 'escala', ['voce'], doc);

    const meta = LICOES_DA_CC_ES006.comentarios.metas.find(m => m.id === 'resolveu-o-dela')!;
    expect(meta.feita(depois), 'resolver em silêncio fechou a tarefa').toBe(false);
  });
});

describe('e mandar o vínculo não é mandar mais uma cópia', () => {
  it('o Ronaldo com o vínculo e uma cópia solta não fecha a meta', () => {
    let c = SOLUCOES.anexo(contextoInicial('anexo'));
    c = mexer(c, n => mandarPorAnexo(n, 'materiais', 'ronaldo', 'hoje'));

    const meta = LICOES_DA_CC_ES006.anexo.metas.find(m => m.id === 'vinculo-para-ronaldo')!;
    expect(meta.feita(c), 'a cópia solta na mão dele passou batida').toBe(false);
  });
});

/* ── O que toda meta precisa ter ───────────────────────────────────────────── */

describe('toda meta diz onde o gesto acontece e como se faz', () => {
  it.each(IDS)('%s tem passo a passo em cada meta, e id sem repetir', id => {
    const metas = LICOES_DA_CC_ES006[id].metas;
    expect(new Set(metas.map(m => m.id)).size, 'meta com id repetido').toBe(metas.length);
    for (const m of metas) {
      expect(m.passos.length, `${id} › ${m.id} sem passo a passo`).toBeGreaterThan(1);
      expect(m.onde.length, `${id} › ${m.id} sem onde`).toBeGreaterThan(10);
      expect(m.detalhe.length, `${id} › ${m.id} sem detalhe`).toBeGreaterThan(40);
    }
  });

  it('e o arquivo que cada lição abre existe na nuvem dela', () => {
    /* Um `abre` apontando para arquivo que não existe deixaria a lição
       começando na tela da nuvem, calada, e o desbravador procurando o
       documento de que a tarefa fala. */
    for (const id of IDS) {
      const { inicial, abre } = LICOES_DA_CC_ES006[id];
      if (!abre) continue;
      expect(inicial().arquivos.some(a => a.id === abre), `${id} abre "${abre}"`).toBe(true);
    }
  });
});
