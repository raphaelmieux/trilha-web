import { describe, it, expect } from 'vitest';
import { contrastRatio } from '../lib/imageTools';
import {
  aplicarLayout, compactarImagem, desalinhoDasCaixas, limparFormatacaoDireta,
  maisPalavrasNumSlide, palavrasDoSlide, pesoEmMegabytes, resolucaoDaImagem,
  slidesComFormatacaoDireta, textoDaApresentacao,
  type Apresentacao, type Slide,
} from './apresentacao';
import {
  APRESENTACAO_DO_ACAMPAMENTO, CONTRASTE_MINIMO, CUSTOS_DE_HOJE,
  IDEIAS_ESSENCIAIS, OURO_LEGIVEL, PLANILHA_DOS_CUSTOS, VERDE_LEGIVEL,
  umaImagemDoClube,
} from './apresentacaoDoAcampamento';
import {
  ERROS_FREQUENTES, METADE_DOS_SLIDES, METAS_DA_LICAO, NOTAS_MINIMAS,
  OPCOES_DE_EFEITO, OPCOES_DE_ERRO, PARTIDA_DA_LICAO, SLIDES_DOS_ERROS,
  TETO_DE_MEGABYTES, TETO_DE_PALAVRAS_NO_SLIDE, TETO_DE_PALAVRAS_NO_TOPICO,
  TETO_DE_SLIDES, TETO_DE_TOPICOS,
  CHAVE_DA_SALA_CLARA, CHAVE_DO_APRESENTADOR, CHAVE_DO_GRAFICO, CHAVE_DO_PESO,
  CHAVE_DO_PULO, CHAVE_DO_ROTEIRO,
  ideiasPerdidas, minutosDeFala,
  type ContextoDaApresentacao, type LicaoDaCcEs011,
} from './metasDaCcEs011';

/*
  As dez lições da CC-ES011, conferidas sem montar tela.

  A trava de sempre, com duas contas: nenhuma meta abre verde, e existe um
  estado que fecha todas. A primeira pega a tarefa que nasce cumprida, que
  ensina a não ler a lista; a segunda pega a lição impossível de vencer, que é
  pior — um abre com tarefa verde de graça, o outro deixa quem fez tudo certo
  olhando uma lista vermelha sem nada na tela que explique.

  E, antes das duas, as **premissas**: a apresentação precisa de fato chegar
  com cada defeito que as lições mandam consertar. Uma premissa que se perdesse
  — o título que não pula, a foto que já é leve — deixaria a lição dela sobre
  nada, com as duas contas continuando verdes.
*/

const LICOES: LicaoDaCcEs011[] = [
  'mestre', 'layout', 'hierarquia', 'contraste', 'erros',
  'imagens', 'grafico', 'notas', 'corte', 'cinco-minutos',
];

const mapear = (a: Apresentacao, f: (s: Slide, i: number) => Slide): Apresentacao =>
  ({ ...a, slides: a.slides.map(f) });

const topicoMaisLongo = (a: Apresentacao) => a.slides
  .flatMap(s => s.topicos)
  .reduce((m, t) => Math.max(m, t.trim().split(/\s+/).filter(Boolean).length), 0);

describe('a apresentação do clube chega com cada defeito', () => {
  it('com o título de todo slide formatado à mão', () => {
    const sujos = slidesComFormatacaoDireta(APRESENTACAO_DO_ACAMPAMENTO);
    expect(sujos.length, 'nenhum slide tem formatação direta: o módulo 1 não tem o que limpar')
      .toBeGreaterThanOrEqual(10);
  });

  /*
    O título precisa **pular**, senão o módulo 2 é sobre nada.

    É a premissa do requisito 4.2, e ela é da mesma natureza da foto de papel
    que pesa mais que a página digitada na CC-ES004: igualados os dois lados, a
    lição continua clicável e deixa de ensinar.
  */
  it('com seis títulos em caixa solta, cada um numa altura', () => {
    const inicial = PARTIDA_DA_LICAO.layout().ap;
    const comCaixa = inicial.slides.filter(s => s.caixas.length > 0);
    expect(comCaixa.length, 'o módulo 2 não tem caixa à mão para tirar').toBeGreaterThanOrEqual(6);
    expect(desalinhoDasCaixas(inicial, 'titulo'), 'os títulos à mão caem todos na mesma altura')
      .toBeGreaterThan(2);
  });

  it('com tópicos que são frases inteiras', () => {
    expect(topicoMaisLongo(PARTIDA_DA_LICAO.hierarquia().ap))
      .toBeGreaterThan(TETO_DE_PALAVRAS_NO_TOPICO * 2);
  });

  it('com as cores do clube reprovando as duas', () => {
    const { mestre } = PARTIDA_DA_LICAO.contraste().ap;
    expect(contrastRatio(mestre.corDoTitulo, mestre.corDoFundo)).toBeLessThan(CONTRASTE_MINIMO);
    expect(contrastRatio(mestre.corDoCorpo, mestre.corDoFundo)).toBeLessThan(CONTRASTE_MINIMO);
  });

  it('com o logo esticado e o arquivo pesado', () => {
    const ap = PARTIDA_DA_LICAO.imagens().ap;
    const imagens = ap.slides.flatMap(s => s.imagens);
    expect(imagens.filter(i => resolucaoDaImagem(i) === 'baixa').length,
      'nenhuma imagem está esticada: o módulo 6 não tem o que consertar')
      .toBeGreaterThanOrEqual(1);
    expect(pesoEmMegabytes(ap)).toBeGreaterThan(TETO_DE_MEGABYTES);
  });

  /*
    E os números digitados precisam discordar da planilha.

    Iguais, o requisito 4.4 viraria "cole um gráfico porque a tarefa mandou": o
    slide estaria certo, e trocar a representação não mudaria número nenhum.
  */
  it('com os custos digitados discordando da planilha', () => {
    const ap = PARTIDA_DA_LICAO.grafico().ap;
    const slide = ap.slides.find(s => s.topicos.some(t => /R\$ ?\d/.test(t)));
    expect(slide, 'não há tabela digitada de custos em lugar nenhum').toBeTruthy();
    const escrito = slide!.topicos.join(' ');
    const divergem = CUSTOS_DE_HOJE.filter(c => !escrito.includes(`R$ ${c.valor},00`));
    expect(divergem.length, 'o slide digitado concorda com a planilha').toBeGreaterThanOrEqual(1);
  });

  it('e sem nota do apresentador em slide nenhum', () => {
    expect(PARTIDA_DA_LICAO.notas().ap.slides.every(s => s.notas.trim() === '')).toBe(true);
  });

  it('com dezesseis slides, que é o dobro do que o corte pede', () => {
    expect(PARTIDA_DA_LICAO.corte().ap.slides.length).toBe(METADE_DOS_SLIDES * 2);
  });

  /*
    E o corte **não** resolve o orçamento de palavras, de propósito.

    Cortar slide e cortar palavra são duas coisas: se o corte já deixasse todo
    slide com vinte palavras, o módulo 10 abriria com a meta dele verde.
  */
  it('e o corte entrega slides acima do orçamento de palavras', () => {
    const ap = PARTIDA_DA_LICAO['cinco-minutos']().ap;
    expect(ap.slides.length).toBeLessThanOrEqual(TETO_DE_SLIDES);
    expect(maisPalavrasNumSlide(ap), 'o corte já resolveu o módulo 10')
      .toBeGreaterThan(TETO_DE_PALAVRAS_NO_SLIDE);
  });

  /* As dez informações essenciais existem na apresentação que chega. */
  it('e carrega as dez informações essenciais desde o começo', () => {
    expect(IDEIAS_ESSENCIAIS.length).toBe(10);
    for (const estado of LICOES.map(l => PARTIDA_DA_LICAO[l]().ap)) {
      const perdidas = ideiasPerdidas(estado).map(i => i.id);
      expect(perdidas, `${perdidas.join(', ')} não está em nenhum estado de partida`).toEqual([]);
    }
  });
});

/* ── As soluções de referência ────────────────────────────────────────────── */

/*
  Elas moram no teste, e não no currículo: gabarito no currículo fica a um
  import de distância da tela, que é a decisão de `laboratoriosDePython.test.ts`
  escrita lá.

  E elas fazem o **caminho**, e não só o fim. A lição de assinar da CC-ES004
  era impossível de vencer e a solução de referência passava, porque ela
  carimbava as duas descobertas à mão em vez de assinar, mexer e assinar de
  novo. Aqui cada descoberta sai do gesto que a produz.
*/

const comDescoberta = (c: ContextoDaApresentacao, chave: string): ContextoDaApresentacao =>
  ({ ...c, descobertas: [...c.descobertas, chave] });

const SOLUCOES: Record<LicaoDaCcEs011, (c: ContextoDaApresentacao) => ContextoDaApresentacao> = {
  'mestre': c => ({
    ...c,
    ap: mapear({
      ...c.ap,
      mestre: {
        ...c.ap.mestre,
        fonteDoTitulo: 'Georgia', fonteDoCorpo: 'Calibri',
        corDoTitulo: '#C9A227', logo: true, numeroNoPe: true,
      },
    }, limparFormatacaoDireta),
  }),

  'layout': c => comDescoberta({
    ...c,
    ap: mapear(c.ap, s => {
      if (s.caixas.length === 0) return s;
      if (s.id === 's1') return aplicarLayout(s, 'titulo');
      return aplicarLayout(s, s.caixas.some(x => x.papel === 'corpo') ? 'titulo-conteudo' : 'so-titulo');
    }),
  }, CHAVE_DO_PULO),

  /*
    Aqui a solução é o **estado de partida do módulo 4**, e é de propósito.

    Nas outras lições a solução de referência é derivada por outro caminho que
    o da tela, e duas contas independentes concordando é uma trava melhor. Nesta
    a resposta é o texto, e de texto só existe uma fonte: reescrevê-lo no teste
    seria uma segunda cópia da mesma prosa, que divergiria no primeiro ajuste.
    Usar o estado seguinte confere, de lambuja, que a corrente fecha — que o
    módulo 4 parte de onde o módulo 3 acaba.

    Truncar cada frase nas oito primeiras palavras *parece* resolver, e foi o
    que eu escrevi primeiro: ele deixa as três metas verdes e leva embora o
    "dezenove horas" da saída do ônibus.
  */
  'hierarquia': c => ({
    ...c,
    ap: {
      ...PARTIDA_DA_LICAO.contraste().ap,
      mestre: { ...c.ap.mestre, tamanhoDoTitulo: 40, tamanhoDoCorpo: 24 },
    },
  }),

  'contraste': c => comDescoberta({
    ...c,
    ap: { ...c.ap, mestre: { ...c.ap.mestre, corDoTitulo: OURO_LEGIVEL, corDoCorpo: VERDE_LEGIVEL } },
  }, CHAVE_DA_SALA_CLARA),

  'erros': c => ({
    ...c,
    caderno: {
      ...c.caderno,
      erros: Object.fromEntries(ERROS_FREQUENTES.map(e => [e.id, { erro: e.erro, efeito: e.efeito }])),
      emVezDisso: Object.fromEntries(ERROS_FREQUENTES.map(e => [
        e.id, 'Eu deixaria no slide só o que a família precisa anotar, e falaria o resto.',
      ])),
    },
  }),

  'imagens': c => comDescoberta({
    ...c,
    ap: mapear(c.ap, s => ({
      ...s,
      imagens: s.imagens.map(img => (
        img.legenda === 'logo-clube.png'
          ? umaImagemDoClube(img.id, 'logo-clube-grande.png', img.largura)
          : compactarImagem(img, 150)
      )),
    })),
  }, CHAVE_DO_PESO),

  'grafico': c => comDescoberta({
    ...c,
    ap: mapear(c.ap, s => (
      !s.topicos.some(t => /R\$ ?\d/.test(t)) ? s : {
        ...s,
        topicos: [],
        grafico: {
          id: `${s.id}-g`, como: 'incorporado', planilha: PLANILHA_DOS_CUSTOS,
          retrato: CUSTOS_DE_HOJE.map(x => ({ ...x })),
        },
      }
    )),
  }, CHAVE_DO_GRAFICO),

  /*
    A nota não pode ecoar o slide, e a minha primeira versão ecoava: ela era
    montada a partir do título, e no slide de abertura o título **contém** o
    tópico — então a nota passou a conter o tópico, e a trava a reprovou com
    razão. Nota que repete o projetado faz quem fala ler em voz alta o que a
    plateia acabou de ler.
  */
  'notas': c => comDescoberta({
    ...c,
    ap: mapear(c.ap, s => ({
      ...s,
      notas: 'Contar aqui o caso do ano passado, que explica por que esta parte existe.',
    })),
  }, CHAVE_DO_APRESENTADOR),

  'corte': c => {
    /* Juntar de verdade: o conteúdo de dois slides consolidado num, e o outro
       excluído — e o título reescrito para cobrir os dois. */
    const pares: [string, string][] = [
      ['s2', 's3'], ['s4', 's5'], ['s6', 's7'], ['s9', 's10'], ['s12', 's13'], ['s15', 's16'],
    ];
    const absorvidos = new Set(pares.map(([, b]) => b));
    const porId = new Map(c.ap.slides.map(s => [s.id, s]));
    const juntados = c.ap.slides
      .filter(s => !absorvidos.has(s.id))
      .map(s => {
        const par = pares.find(([a]) => a === s.id);
        if (!par) return s;
        const outro = porId.get(par[1]);
        if (!outro) return s;
        return {
          ...s,
          titulo: `${s.titulo.replace(/ — parte \d/i, '')} e mais`,
          topicos: [...s.topicos, ...outro.topicos].slice(0, TETO_DE_TOPICOS),
          imagens: [...s.imagens, ...outro.imagens],
          grafico: s.grafico ?? outro.grafico,
          notas: [s.notas, outro.notas].filter(n => n.trim()).join(' '),
        };
      });
    /* E o 's8' e o 's14' saem, para fechar em oito. */
    const slides = juntados.filter(s => s.id !== 's8' && s.id !== 's14');
    const saidos = c.ap.slides.filter(s => !slides.some(x => x.id === s.id)).map(s => s.id);
    return {
      ...c,
      ap: { ...c.ap, slides },
      caderno: {
        ...c.caderno,
        cortes: saidos.map(slide => ({
          slide, porque: 'O conteúdo dele foi para o slide anterior, que agora cobre os dois.',
        })),
      },
    };
  },

  /*
    Aqui o texto final está escrito, e não derivado — e a primeira versão,
    derivada, estava errada de um jeito instrutivo.

    Ela ia tirando tópicos de cada slide até o slide caber em vinte palavras, o
    que é o que se faz sem pensar: ela levou embora a "Chácara Recanto Verde" e
    o "Pix", e a trava reprovou por ideia essencial perdida. Cortar palavra não
    é tirar linha — é **reescrever a linha mais curta**, e a informação que não
    pode sair fica. É por isso que o slide de quando-e-onde carrega as três
    marcas em dezenove palavras.
  */
  'cinco-minutos': c => {
    const enxutos: Record<string, { titulo: string; topicos: string[] }> = {
      's1': { titulo: 'Acampamento de Inverno 2026', topicos: ['Clube de Desbravadores Pioneiros'] },
      's2': { titulo: 'O clube e o acampamento', topicos: [
        'Desde 1998, seis unidades', 'A maior atividade do ano',
        'Dez anos ou mais, com autorização'] },
      's4': { titulo: 'Quando, onde e como chegar', topicos: [
        '13 a 15 de junho', 'Chácara Recanto Verde, km 12', 'Ônibus: sexta, dezenove horas'] },
      's6': { titulo: 'O que levar', topicos: [
        'Saco de dormir e isolante', 'Lanterna e pilha de reserva',
        'Agasalho, touca e luva', 'Remédio: na enfermaria'] },
      's9': { titulo: 'Programação', topicos: [
        'Sexta, 19h: saída', 'Sábado: culto, classes, campo', 'Domingo, 11h: volta'] },
      's12': { titulo: 'Custos e pagamento', topicos: [
        'À vista até 30 de maio', 'Ou duas parcelas',
        'Pix: tesouraria', 'Precisa de ajuda? Fale conosco'] },
      's14': { titulo: 'O ano passado', topicos: [] },
      's15': { titulo: 'Regras e dúvidas', topicos: [
        'Silêncio é para todos', 'Ninguém sai da área sozinho', 'Dúvidas: a sua liderança'] },
    };
    const enxuto = mapear(c.ap, s => (
      enxutos[s.id] ? { ...s, ...enxutos[s.id] } : s
    ));
    return comDescoberta({
      ...c,
      ap: { ...enxuto, pdf: enxuto.slides.map(s => s.id) },
      caderno: { ...c.caderno, abertura: 'Boa noite, obrigado por vir — em cinco minutos vocês saem com tudo.' },
    }, CHAVE_DO_ROTEIRO);
  },
};

describe('nenhuma meta da CC-ES011 abre verde', () => {
  for (const licao of LICOES) {
    it(`${licao}: abre com as ${METAS_DA_LICAO[licao].length} por fazer`, () => {
      const c = PARTIDA_DA_LICAO[licao]();
      const verdes = METAS_DA_LICAO[licao].filter(m => m.feita(c)).map(m => m.id);
      expect(verdes, `${verdes.join(', ')} abriu cumprida`).toEqual([]);
    });
  }
});

describe('e existe um estado que fecha todas', () => {
  for (const licao of LICOES) {
    it(`${licao}: a solução de referência fecha as ${METAS_DA_LICAO[licao].length}`, () => {
      const feito = SOLUCOES[licao](PARTIDA_DA_LICAO[licao]());
      const abertas = METAS_DA_LICAO[licao].filter(m => !m.feita(feito)).map(m => m.id);
      expect(abertas, `${abertas.join(', ')} continuam vermelhas`).toEqual([]);
    });
  }
});

/* ── Os caminhos errados, que são o que distingue cada conta ──────────────── */

/*
  Seis mutações sobreviveram à primeira passada destas metas, e nas seis o que
  faltava era isto: o caminho errado que chega perto. Uma trava que só vê a
  solução certa aprova qualquer afrouxamento dela — e é indistinguível de estar
  certa, que é a pior forma de uma trava falhar.
*/

const abertas = (licao: LicaoDaCcEs011, c: ContextoDaApresentacao) =>
  METAS_DA_LICAO[licao].filter(m => !m.feita(c)).map(m => m.id);

describe('os caminhos errados continuam vermelhos', () => {
  /*
    Redigitar o título é o atalho mais rápido e mais errado que existe.

    Ele deixa o mestre valendo — porque o que ele apaga é a formatação direta
    junto com o texto —, e num documento de verdade é como se perde um
    parágrafo inteiro sem perceber. É a condição da CC-ES002, aqui.
  */
  it('o módulo 1 não aceita o título redigitado', () => {
    const certo = SOLUCOES.mestre(PARTIDA_DA_LICAO.mestre());
    expect(abertas('mestre', certo)).toEqual([]);
    const redigitado: ContextoDaApresentacao = {
      ...certo,
      ap: mapear(certo.ap, s => (
        s.id === 's2' ? { ...s, titulo: 'Quem somos nós' } : s
      )),
    };
    expect(abertas('mestre', redigitado), 'redigitar o título passou')
      .toEqual(METAS_DA_LICAO.mestre.map(m => m.id));
  });

  /*
    Pintar o título de preto resolve a conta do contraste e joga a identidade
    fora — e é o que um verificador de contraste sozinho recomendaria.
  */
  it('o módulo 4 não aceita preto no lugar da cor do clube', () => {
    const c = PARTIDA_DA_LICAO.contraste();
    const preto: ContextoDaApresentacao = {
      ...c,
      descobertas: [CHAVE_DA_SALA_CLARA],
      ap: { ...c.ap, mestre: { ...c.ap.mestre, corDoTitulo: '#000000', corDoCorpo: VERDE_LEGIVEL } },
    };
    expect(contrastRatio('#000000', c.ap.mestre.corDoFundo)).toBeGreaterThan(CONTRASTE_MINIMO);
    expect(abertas('contraste', preto), 'o preto passou pela meta do título')
      .toContain('titulo-se-le');
  });

  /* E o cinza-claro também não: ele é a outra ponta do mesmo erro. */
  it('o módulo 4 não aceita um verde que continua não se lendo', () => {
    const c = PARTIDA_DA_LICAO.contraste();
    const claro: ContextoDaApresentacao = {
      ...c,
      descobertas: [CHAVE_DA_SALA_CLARA],
      ap: { ...c.ap, mestre: { ...c.ap.mestre, corDoTitulo: OURO_LEGIVEL, corDoCorpo: '#4ECB71' } },
    };
    expect(claro.ap.mestre.corDoCorpo, 'o caso tem de continuar verde, senão ele prova outra coisa')
      .toBe('#4ECB71');
    expect(abertas('contraste', claro)).toContain('corpo-se-le');
  });

  /*
    E desistir do verde no corpo também não.

    É o outro lado do preto no título, e precisa de caso próprio: trocar o
    verde por um cinza-escuro **passa** na conta do contraste. Sem este caso, a
    condição de continuar verde no corpo é código que nenhuma trava exercita.
  */
  it('o módulo 4 não aceita cinza-escuro no lugar do verde do clube', () => {
    const c = PARTIDA_DA_LICAO.contraste();
    const cinza: ContextoDaApresentacao = {
      ...c,
      descobertas: [CHAVE_DA_SALA_CLARA],
      ap: { ...c.ap, mestre: { ...c.ap.mestre, corDoTitulo: OURO_LEGIVEL, corDoCorpo: '#333333' } },
    };
    expect(contrastRatio('#333333', c.ap.mestre.corDoFundo)).toBeGreaterThan(CONTRASTE_MINIMO);
    expect(abertas('contraste', cinza), 'o cinza passou pela meta do corpo')
      .toEqual(['corpo-se-le']);
  });

  /*
    Classificar um dos três e parar é o caminho de quem leu a lista e respondeu
    o primeiro. Por conjunto completo, e não por "algum certo".
  */
  it('o módulo 5 não fecha com um dos três classificado', () => {
    const c = PARTIDA_DA_LICAO.erros();
    const um = ERROS_FREQUENTES[0];
    const soUm: ContextoDaApresentacao = {
      ...c,
      caderno: {
        ...c.caderno,
        erros: { [um.id]: { erro: um.erro, efeito: um.efeito } },
        emVezDisso: { [um.id]: 'Eu deixaria no slide só o que a família precisa anotar.' },
      },
    };
    expect(abertas('erros', soUm)).toEqual(METAS_DA_LICAO.erros.map(m => m.id));
  });

  /* E marcar todos os cinco também não: é o "denuncie tudo" da CC-ES005. */
  it('o módulo 5 não fecha marcando todas as opções', () => {
    const c = PARTIDA_DA_LICAO.erros();
    const todos: ContextoDaApresentacao = {
      ...c,
      caderno: {
        ...c.caderno,
        erros: Object.fromEntries(ERROS_FREQUENTES.map(e => [e.id, {
          erro: OPCOES_DE_ERRO.map(o => o.diz).join(' / '),
          efeito: OPCOES_DE_EFEITO.map(o => o.diz).join(' / '),
        }])),
        emVezDisso: Object.fromEntries(ERROS_FREQUENTES.map(e => [e.id, 'Eu faria diferente disso aí tudo.'])),
      },
    };
    expect(abertas('erros', todos)).toContain('nomeou-os-erros');
    expect(abertas('erros', todos)).toContain('nomeou-os-efeitos');
  });

  /*
    Colar o gráfico como imagem resolve a tarefa de tirar a tabela digitada, e
    congela os números — que é o defeito que ela existe para desfazer. Ele é o
    irmão do vídeo vinculado da AP044: a diferença aparece longe de casa.
  */
  it('o módulo 7 não aceita o gráfico colado como imagem', () => {
    const c = PARTIDA_DA_LICAO.grafico();
    const comoImagem: ContextoDaApresentacao = {
      ...c,
      descobertas: [CHAVE_DO_GRAFICO],
      ap: mapear(c.ap, s => (
        !s.topicos.some(t => /R\$ ?\d/.test(t)) ? s : {
          ...s,
          topicos: [],
          grafico: {
            id: `${s.id}-g`, como: 'imagem' as const, planilha: PLANILHA_DOS_CUSTOS,
            retrato: CUSTOS_DE_HOJE.map(x => ({ ...x })),
          },
        }
      )),
    };
    expect(abertas('grafico', comoImagem), 'a imagem fechou a meta de acompanhar')
      .toEqual(['grafico-acompanha']);
  });

  /*
    Copiar o tópico para a nota preenche o painel e não serve a ninguém: a
    plateia já leu aquilo, e quem fala passa a ler em voz alta o projetado.
  */
  it('o módulo 8 não aceita nota que copia o tópico', () => {
    const c = PARTIDA_DA_LICAO.notas();
    const copiada: ContextoDaApresentacao = {
      ...c,
      descobertas: [CHAVE_DO_APRESENTADOR],
      ap: mapear(c.ap, s => ({ ...s, notas: s.topicos.join(' ') || 'Falar deste slide com calma.' })),
    };
    expect(abertas('notas', copiada), 'a nota copiada fechou a meta')
      .toEqual(['nota-nao-repete']);
  });

  /*
    Chegar a oito excluindo slides é o caminho de quem leu "metade" e não leu
    "sem perda de conteúdo essencial" — e é o mais rápido de todos.
  */
  it('o módulo 9 não aceita chegar a oito excluindo', () => {
    const c = PARTIDA_DA_LICAO.corte();
    const ficam = c.ap.slides.slice(0, METADE_DOS_SLIDES);
    const saidos = c.ap.slides.slice(METADE_DOS_SLIDES);
    const excluindo: ContextoDaApresentacao = {
      ...c,
      ap: { ...c.ap, slides: ficam },
      caderno: {
        ...c.caderno,
        cortes: saidos.map(s => ({ slide: s.id, porque: 'Não ia dar tempo de falar deste slide.' })),
      },
    };
    expect(excluindo.ap.slides.length).toBe(METADE_DOS_SLIDES);
    expect(ideiasPerdidas(excluindo.ap).length, 'excluir oito slides não perdeu ideia nenhuma')
      .toBeGreaterThan(0);
    expect(abertas('corte', excluindo)).toContain('metade-dos-slides');
  });

  /*
    E perder **uma** ideia que é texto também não.

    Este caso existe porque o anterior não o cobria: excluindo os oito últimos
    slides, o que se perde primeiro é o gráfico dos custos, e aí a conta do
    texto nunca é exercitada. Tirar só o slide do local deixa o gráfico onde
    ele está e perde a Chácara Recanto Verde — que é exatamente o tipo de
    informação que sai de um corte apressado. Ele leva as outras duas marcas do
    mesmo slide junto, e é assim mesmo: depois de juntar, data, local e hora da
    saída moram no mesmo slide, e um corte apressado leva os três de uma vez.
  */
  it('o módulo 9 não aceita perder o local, com tudo o mais no lugar', () => {
    const certo = SOLUCOES.corte(PARTIDA_DA_LICAO.corte());
    expect(abertas('corte', certo)).toEqual([]);
    const doLocal = certo.ap.slides.find(s => !s.grafico
      && textoDaApresentacao({ ...certo.ap, slides: [s] }).includes('Recanto Verde'))!;
    expect(doLocal, 'ninguém carrega o local sem o gráfico na solução certa').toBeTruthy();
    const semLocal: ContextoDaApresentacao = {
      ...certo,
      ap: { ...certo.ap, slides: certo.ap.slides.filter(s => s.id !== doLocal.id) },
      caderno: {
        ...certo.caderno,
        cortes: [...certo.caderno.cortes,
          { slide: doLocal.id, porque: 'Todo mundo já sabe onde é, é a mesma chácara do ano passado.' }],
      },
    };
    const perdidas = ideiasPerdidas(semLocal.ap);
    expect(perdidas.map(i => i.id)).toContain('onde');
    /* E nenhuma delas pelo gráfico: é isso que faz este caso exercitar a conta
       do **texto**, que é a que o caso anterior deixava passar. */
    expect(perdidas.every(i => !i.peloGrafico),
      'o gráfico dos custos saiu junto: o caso não isola a conta do texto').toBe(true);
    expect(abertas('corte', semLocal), 'perder o local passou').toContain('metade-dos-slides');
  });

  /* E empilhar os tópicos de dois slides num também não. */
  it('o módulo 9 não aceita empilhar os tópicos', () => {
    const c = PARTIDA_DA_LICAO.corte();
    const pares: [string, string][] = [
      ['s2', 's3'], ['s4', 's5'], ['s6', 's7'], ['s9', 's10'], ['s12', 's13'], ['s15', 's16'],
    ];
    const absorvidos = new Set(pares.map(([, b]) => b));
    const porId = new Map(c.ap.slides.map(s => [s.id, s]));
    const empilhado = c.ap.slides
      .filter(s => !absorvidos.has(s.id) && s.id !== 's8' && s.id !== 's14')
      .map(s => {
        const par = pares.find(([a]) => a === s.id);
        const outro = par ? porId.get(par[1]) : undefined;
        return outro ? { ...s, topicos: [...s.topicos, ...outro.topicos] } : s;
      });
    const ctx: ContextoDaApresentacao = {
      ...c,
      ap: { ...c.ap, slides: empilhado },
      caderno: {
        ...c.caderno,
        cortes: c.ap.slides.filter(s => !empilhado.some(x => x.id === s.id))
          .map(s => ({ slide: s.id, porque: 'O conteúdo foi para o slide de cima, sem mexer em nada.' })),
      },
    };
    expect(abertas('corte', ctx), 'empilhar nove tópicos num slide passou')
      .toContain('metade-dos-slides');
  });

  /*
    Exportar e continuar mexendo é o que se faz sem pensar, e o PDF entregue
    sai sem o que veio depois. É o retrato que congela, da CC-ES004 e da AP044.
  */
  it('o módulo 10 não aceita o PDF exportado antes do fim', () => {
    const feito = SOLUCOES['cinco-minutos'](PARTIDA_DA_LICAO['cinco-minutos']());
    expect(abertas('cinco-minutos', feito)).toEqual([]);
    const mexeuDepois: ContextoDaApresentacao = {
      ...feito,
      ap: { ...feito.ap, slides: feito.ap.slides.slice(0, -1) },
    };
    expect(abertas('cinco-minutos', mexeuDepois), 'o PDF de antes continuou valendo')
      .toContain('pdf-por-ultimo');
  });
});

/*
  A segunda passada de mutação pediu mais cinco casos, e todos são afrouxamentos
  que **parecem** resolver: a fonte trocada sem a cor, a caixa solta que sobra
  depois do layout, uma nota escrita em vez de seis, a fala colada no slide, e o
  gráfico excluído sem ninguém reclamar do custo.
*/
describe('e os afrouxamentos que parecem resolver', () => {
  it('trocar só a fonte não põe a identidade no mestre', () => {
    const c = PARTIDA_DA_LICAO.mestre();
    const soFonte: ContextoDaApresentacao = {
      ...c,
      ap: mapear({
        ...c.ap,
        mestre: { ...c.ap.mestre, fonteDoTitulo: 'Georgia', fonteDoCorpo: 'Calibri', logo: true, numeroNoPe: true },
      }, limparFormatacaoDireta),
    };
    expect(abertas('mestre', soFonte), 'a fonte sozinha fechou a identidade')
      .toEqual(['identidade-no-mestre']);
  });

  /* E ligar o logo sem o número do slide é metade da tarefa. */
  it('o logo sem o número do slide não fecha a meta', () => {
    const certo = SOLUCOES.mestre(PARTIDA_DA_LICAO.mestre());
    const semNumero: ContextoDaApresentacao = {
      ...certo,
      ap: { ...certo.ap, mestre: { ...certo.ap.mestre, numeroNoPe: false } },
    };
    expect(abertas('mestre', semNumero)).toEqual(['logo-e-numero']);
  });

  /*
    Escolher o layout não apaga a caixa de texto solta — no PowerPoint ela
    continua lá, por cima do espaço reservado, e o texto aparece duas vezes.
  */
  it('escolher o layout da abertura e deixar a caixa não resolve', () => {
    const c = PARTIDA_DA_LICAO.layout();
    const comSobra: ContextoDaApresentacao = {
      ...c,
      descobertas: [CHAVE_DO_PULO],
      ap: mapear(c.ap, s => (s.id === 's1' ? { ...s, layout: 'titulo' as const } : s)),
    };
    expect(comSobra.ap.slides[0].caixas.length).toBeGreaterThan(0);
    expect(abertas('layout', comSobra)).toContain('abertura-com-layout-de-titulo');
  });

  it('e o título com "parte 1" denuncia que o corte foi empilhamento', () => {
    const certo = SOLUCOES.corte(PARTIDA_DA_LICAO.corte());
    const comParte: ContextoDaApresentacao = {
      ...certo,
      ap: mapear(certo.ap, s => (
        s.titulo.startsWith('O que levar') ? { ...s, titulo: 'O que levar — parte 1' } : s
      )),
    };
    expect(comParte.ap.slides.some(s => /parte 1/.test(s.titulo))).toBe(true);
    expect(abertas('corte', comParte)).toEqual(['titulo-cobre-os-dois']);
  });

  it('uma nota escrita não vale por seis', () => {
    const c = PARTIDA_DA_LICAO.notas();
    const umaSo: ContextoDaApresentacao = {
      ...c,
      descobertas: [CHAVE_DO_APRESENTADOR],
      ap: mapear(c.ap, s => (
        s.id === 's3' ? { ...s, notas: 'Contar aqui o caso do ano passado, com calma.' } : s
      )),
    };
    expect(abertas('notas', umaSo)).toEqual(['notas-escritas', 'nota-nao-repete']);
  });

  /*
    Colar a fala no slide e escrever a nota também é o caminho de quem leu a
    tarefa e não leu o assunto dela: o painel fica cheio, o slide fica cheio, e
    a plateia volta a ler em vez de ouvir.
  */
  it('colar a fala no slide reabre a meta das notas', () => {
    const c = PARTIDA_DA_LICAO.notas();
    const noTelao: ContextoDaApresentacao = {
      ...c,
      descobertas: [CHAVE_DO_APRESENTADOR],
      ap: mapear(c.ap, s => ({
        ...s,
        notas: 'Contar aqui o caso do ano passado, que explica por que esta parte existe.',
        topicos: [...s.topicos,
          'E aqui eu conto com todas as letras o caso do ano passado, porque é ele que explica a regra'],
      })),
    };
    expect(maisPalavrasNumSlide(noTelao.ap))
      .toBeGreaterThan(maisPalavrasNumSlide(PARTIDA_DA_LICAO.notas().ap));
    expect(abertas('notas', noTelao)).toContain('notas-escritas');
  });

  /*
    E excluir o slide do gráfico perde o custo — que é a ideia essencial que
    **não** é texto. Sem este caso, a segunda maneira de carregar uma ideia é
    código que nenhuma trava exercita, e um `ideiasPerdidas` que nunca a
    procurasse passaria calado.
  */
  it('excluir o slide do gráfico perde o custo', () => {
    const certo = SOLUCOES.corte(PARTIDA_DA_LICAO.corte());
    const doGrafico = certo.ap.slides.find(s => s.grafico)!;
    expect(doGrafico, 'a solução do corte perdeu o gráfico').toBeTruthy();
    const semGrafico: ContextoDaApresentacao = {
      ...certo,
      ap: { ...certo.ap, slides: certo.ap.slides.filter(s => s.id !== doGrafico.id) },
    };
    /* O slide dos custos carrega o prazo e o Pix junto, porque o corte os
       juntou — o que importa aqui é que o **custo** entra na lista, e ele é a
       única ideia que não é texto. */
    expect(ideiasPerdidas(semGrafico.ap).map(i => i.id)).toContain('custo');
    expect(abertas('corte', semGrafico)).toContain('metade-dos-slides');
  });
});

/* ── O que o lint apontou que a trava não estava olhando ──────────────────── */

/*
  Quatro importações sem uso, e nenhuma delas era importação sobrando: eram
  quatro coisas que a vereda publica e que nenhuma conta aqui exercitava.
  Apagar o import teria deixado a build limpa e as quatro sem trava.
*/
describe('os três slides dos erros, e a conta dos cinco minutos', () => {
  it('cada erro tem um slide do clube que o mostra', () => {
    for (const e of ERROS_FREQUENTES) {
      const { slide } = SLIDES_DOS_ERROS[e.id];
      expect(slide, `o erro ${e.id} não tem slide`).toBeTruthy();
      expect(slide.id).toBe(e.slide);
    }
  });

  /*
    E o slide de cada um carrega o defeito dele, medido.

    Um exemplo que não tivesse o defeito deixaria a lição pedindo para
    classificar um slide perfeito — e a classificação certa continuaria sendo a
    que o caderno guarda, com a trava das metas verde.
  */
  it('e o slide carrega o defeito que o erro nomeia', () => {
    const texto = SLIDES_DOS_ERROS.texto;
    expect(palavrasDoSlide(texto.slide),
      'o slide do texto demais não tem texto demais').toBeGreaterThan(TETO_DE_PALAVRAS_NO_SLIDE);

    const contraste = SLIDES_DOS_ERROS.contraste;
    expect(contrastRatio(contraste.ap.mestre.corDoTitulo, contraste.ap.mestre.corDoFundo),
      'o slide do contraste se lê perfeitamente').toBeLessThan(CONTRASTE_MINIMO);

    const hierarquia = SLIDES_DOS_ERROS.hierarquia;
    const linhas = hierarquia.slide.topicos;
    expect(linhas.length, 'o slide da hierarquia não tem lista nenhuma').toBeGreaterThanOrEqual(4);
    expect(linhas.filter(t => /R\$ ?\d/.test(t)).length,
      'o slide da hierarquia não tem o número que decide no meio dos outros')
      .toBeGreaterThanOrEqual(linhas.length - 1);
  });

  /*
    E a apresentação que chega não cabe em cinco minutos — senão o requisito 6
    seria um número que já está certo.
  */
  it('a apresentação de dezesseis slides não cabe em cinco minutos', () => {
    expect(minutosDeFala(PARTIDA_DA_LICAO.mestre().ap)).toBeGreaterThan(5);
  });

  /*
    E a cortada cabe — com as notas, que é o que de fato leva tempo.

    A conta soma a nota e o que projeta, porque é a **fala** que gasta os cinco
    minutos: medir só o slide diria que uma apresentação de oito slides enxutos
    leva um minuto, e quem a usasse descobriria o contrário na frente do
    examinador.
  */
  it('e a cortada, com as notas escritas, cabe', () => {
    const feito = SOLUCOES['cinco-minutos'](PARTIDA_DA_LICAO['cinco-minutos']());
    expect(minutosDeFala(feito.ap)).toBeLessThanOrEqual(5);
    expect(minutosDeFala(feito.ap), 'a conta não está contando a fala')
      .toBeGreaterThan(minutosDeFala({ ...feito.ap, slides: feito.ap.slides.map(s => ({ ...s, notas: '' })) }));
  });

  it('e seis é o número de notas que a lição cobra', () => {
    expect(NOTAS_MINIMAS).toBe(6);
    const c = PARTIDA_DA_LICAO.notas();
    const cinco: ContextoDaApresentacao = {
      ...c,
      descobertas: [CHAVE_DO_APRESENTADOR],
      ap: mapear(c.ap, (s, i) => (
        i < NOTAS_MINIMAS - 1
          ? { ...s, notas: 'Contar aqui o caso do ano passado, com calma.' }
          : s
      )),
    };
    expect(abertas('notas', cinco), 'cinco notas fecharam a meta de seis')
      .toContain('notas-escritas');
  });
});
