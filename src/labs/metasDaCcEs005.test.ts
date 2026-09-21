import { describe, it, expect } from 'vitest';
import {
  type ContextoDoCofre, type ContextoDaConta, type ContextoDoCorreio,
  LICOES_DA_CC_ES005, senhasQueEssaPessoaSabia,
} from './metasDaCcEs005';
import {
  type Cofre,
  trocarSenha, darAcesso, tirarAcesso, passarParaOClube, gerarSenha, COMO_GERAR_PADRAO,
} from './cofreDeSenhas';
import {
  type ContaOnline,
  trocarSenhaDaConta, encerrarOutrasSessoes, trocarRecuperacao, tirarEncaminhamento,
  revogarAplicativo, ligarDuasEtapas, guardarCodigos, gerarCodigosDeReserva, ajustar,
} from './contaOnline';
import { type AnaliseDaMensagem, apontar, denunciar } from './golpesDoClube';

/*
  As oito lições da CC-ES005.

  ── As duas travas que toda lista de metas precisa ───────────────────────
  Nenhuma meta abre verde — lista com item marcado no segundo zero ensina a
  não ler a lista —, e uma solução de referência fecha a lista inteira. A
  segunda é a que pega o laboratório impossível de vencer, que é pior do que
  um que abre resolvido: um abre com tarefa verde de graça, o outro deixa quem
  fez tudo certo olhando uma lista vermelha sem nada na tela que explique.

  A solução de referência **não pula o meio do caminho**. A da CC-ES004 pulava
  — assinava, protegia e carimbava as descobertas à mão —, e com isso provava
  o fim sem provar o caminho: a lição do módulo 6 era impossível de vencer
  clicando e a trava passava.
*/

const NOVA = () => gerarSenha(COMO_GERAR_PADRAO, (() => {
  let i = 0; return () => { i += 1; return (i * 0.37) % 1; };
})());

/* ── Nenhuma meta abre verde ───────────────────────────────────────────────── */

describe('nenhuma das oito lições abre com tarefa cumprida', () => {
  const ids = Object.keys(LICOES_DA_CC_ES005) as (keyof typeof LICOES_DA_CC_ES005)[];

  it('as oito estão registradas', () => {
    /* A guarda contra o vazio: um registro que esvaziasse deixaria toda trava
       deste arquivo verde por não ter conferido nada. */
    expect(ids).toHaveLength(8);
  });

  for (const id of Object.keys(LICOES_DA_CC_ES005) as (keyof typeof LICOES_DA_CC_ES005)[]) {
    it(`${id}: toda meta começa por fazer`, () => {
      const l = LICOES_DA_CC_ES005[id];
      expect(l.metas.length, `${id} não cobra nada`).toBeGreaterThan(1);

      const verdes = l.programa === 'cofre'
        ? l.metas.filter(m => m.feita({ cofre: l.inicial(), inicial: l.inicial() }))
        : l.programa === 'conta'
          ? l.metas.filter(m => m.feita({ conta: l.inicial(), inicial: l.inicial(), consultados: [] }))
          : l.metas.filter(m => m.feita({ caixa: l.caixa(), analises: [] }));

      expect(verdes.map(m => m.id), `${id} abre com meta já cumprida`).toEqual([]);
    });

    it(`${id}: toda meta diz onde e como`, () => {
      /* Modelo vazio pede `passos` completos, e o teste cobra os dois juntos:
         tirar o andaime só é honesto se o caminho ficar. */
      for (const m of LICOES_DA_CC_ES005[id].metas) {
        expect(m.onde.length, `${id}/${m.id}`).toBeGreaterThan(5);
        expect(m.detalhe.length, `${id}/${m.id}`).toBeGreaterThan(40);
        expect(m.passos.length, `${id}/${m.id} não tem passo a passo`).toBeGreaterThan(1);
      }
    });
  }

  it('e nenhum id de meta se repete dentro de uma lição', () => {
    for (const id of ids) {
      const metas = LICOES_DA_CC_ES005[id].metas.map(m => m.id);
      expect(new Set(metas).size, `${id} repete id de meta`).toBe(metas.length);
    }
  });
});

/* ── Módulo 1: senhas ──────────────────────────────────────────────────────── */

describe('a solução de referência fecha cada lição', () => {
  const doCofre = (id: 'senhas' | 'plano') => {
    const l = LICOES_DA_CC_ES005[id];
    if (l.programa !== 'cofre') throw new Error('lição não é de cofre');
    return l;
  };
  const daConta = (id: 'duas-etapas' | 'aplicativos' | 'vazamento' | 'privacidade' | 'invasao') => {
    const l = LICOES_DA_CC_ES005[id];
    if (l.programa !== 'conta') throw new Error('lição não é de conta');
    return l;
  };
  const faltam = <C, >(metas: { id: string; feita: (c: C) => boolean }[], c: C) =>
    metas.filter(m => !m.feita(c)).map(m => m.id);

  it('senhas: gerar uma para cada conta desfaz o reuso e tira a da lista', () => {
    const l = doCofre('senhas');
    const inicial = l.inicial();
    let cofre: Cofre = inicial;
    /* Uma senha diferente por conta, que é o que o gerador faz e o que a lição
       manda fazer: seis trocas, e é esse trabalho que o requisito 3 mede. */
    for (const e of inicial.entradas) cofre = trocarSenha(cofre, e.id, `${NOVA()}-${e.id}`);
    expect(faltam(l.metas, { cofre, inicial })).toEqual([]);
  });

  it('duas-etapas: ativar, guardar os códigos e arrumar a recuperação', () => {
    const l = daConta('duas-etapas');
    const inicial = l.inicial();
    let conta: ContaOnline = ligarDuasEtapas(inicial, 'aplicativo', gerarCodigosDeReserva(() => 0.5));
    conta = guardarCodigos(conta);
    conta = trocarRecuperacao(conta, { email: 'diretoria@clubepioneiros.org' });
    expect(faltam(l.metas, { conta, inicial, consultados: [] })).toEqual([]);
  });

  it('aplicativos: tirar os dois abandonados e deixar o que o clube usa', () => {
    const l = daConta('aplicativos');
    const inicial = l.inicial();
    const conta = revogarAplicativo(revogarAplicativo(inicial, 'fotomagica'), 'sorteador');
    expect(faltam(l.metas, { conta, inicial, consultados: [] })).toEqual([]);
  });

  it('e revogar todos NÃO fecha a lição dos aplicativos', () => {
    /*
      É a trava da decisão. Remover os três é mais rápido e quebra a inscrição
      do acampamento, que passa pelo aplicativo dos formulários — e quem o
      desligou não vai desconfiar dele quando os formulários pararem de chegar.
      É a família do Aceitar Todas que não fecha a tarefa.
    */
    const l = daConta('aplicativos');
    const inicial = l.inicial();
    let conta = inicial;
    for (const a of inicial.aplicativos) conta = revogarAplicativo(conta, a.id);
    /* As duas metas ficam vermelhas, e não uma terceira: "sem tirar o que o
       clube usa" é condição de cada uma, e não item próprio da lista. */
    expect(faltam(l.metas, { conta, inicial, consultados: [] }))
      .toEqual(['foto-fora', 'sorteador-fora']);
  });

  it('vazamento: consultar os dois endereços e trocar a senha que vazou', () => {
    const l = daConta('vazamento');
    const inicial = l.inicial();
    const conta = trocarSenhaDaConta(inicial, NOVA(), '2026-09');
    const consultados = [inicial.endereco, 'marta.oliveira@gmail.com'];
    expect(faltam(l.metas, { conta, inicial, consultados })).toEqual([]);
  });

  it('e trocar a senha sem consultar nada NÃO fecha a lição do vazamento', () => {
    /* Consultar não deixa marca na conta — é o desbravador olhando, e o
       requisito 4.4 é sobre isso. Sem a lista de consultados, a lição premiaria
       quem trocou a senha por acaso. */
    const l = daConta('vazamento');
    const inicial = l.inicial();
    const conta = trocarSenhaDaConta(inicial, NOVA(), '2026-09');
    expect(faltam(l.metas, { conta, inicial, consultados: [] }))
      .toEqual(['consultou-clube', 'consultou-pessoal']);
  });

  it('privacidade: fechar o que é de gente e deixar o clube achável', () => {
    const l = daConta('privacidade');
    const inicial = l.inicial();
    let conta = ajustar(inicial, 'membros', 'só a diretoria');
    conta = ajustar(conta, 'telefones', 'só a diretoria');
    conta = ajustar(conta, 'local', 'não');
    expect(faltam(l.metas, { conta, inicial, consultados: [] })).toEqual([]);
  });

  it('e "deixar tudo privado" NÃO fecha a lição da privacidade', () => {
    /* Fechado tudo, os dados ficam guardados e nenhuma família acha o clube.
       Ajustar é decidir um por um. */
    const l = daConta('privacidade');
    const inicial = l.inicial();
    let conta = inicial;
    for (const a of inicial.privacidade) conta = ajustar(conta, a.id, a.fechado);
    expect(faltam(l.metas, { conta, inicial, consultados: [] }))
      .toEqual(['dados-fechados', 'local-fora']);
  });

  it('golpes: apontar os indícios certos e poupar as verdadeiras', () => {
    const l = LICOES_DA_CC_ES005.golpes;
    if (l.programa !== 'correio') throw new Error('lição não é de correio');
    const caixa = l.caixa();
    let analises: AnaliseDaMensagem[] = [];
    for (const m of caixa) {
      for (const i of m.indicios) analises = apontar(analises, m.id, i);
      analises = denunciar(analises, m.id, m.indicios.length > 0);
    }
    expect(faltam(l.metas, { caixa, analises } as ContextoDoCorreio)).toEqual([]);
  });

  it('e denunciar tudo NÃO fecha a lição dos golpes', () => {
    const l = LICOES_DA_CC_ES005.golpes;
    if (l.programa !== 'correio') throw new Error('lição não é de correio');
    const caixa = l.caixa();
    let analises: AnaliseDaMensagem[] = [];
    for (const m of caixa) analises = denunciar(analises, m.id, true);
    expect(faltam(l.metas, { caixa, analises } as ContextoDoCorreio))
      .toContain('poupou-as-verdadeiras');
  });

  it('invasao: a ordem inteira, e na ordem', () => {
    /*
      A solução de referência **faz o caminho**, e não carimba o fim: ela troca
      a senha primeiro, e é por isso que encerrar as sessões depois funciona.
      Na ordem contrária o intruso volta, que é a lição do requisito 6.
    */
    const l = daConta('invasao');
    const inicial = l.inicial();
    let conta = trocarSenhaDaConta(inicial, NOVA(), '2026-09');
    conta = encerrarOutrasSessoes(conta, inicial.senha);
    conta = trocarRecuperacao(conta, { email: 'diretoria@clubepioneiros.org' });
    conta = revogarAplicativo(conta, 'acesso-remoto');
    conta = tirarEncaminhamento(conta, 'copia');
    conta = guardarCodigos(ligarDuasEtapas(conta, 'aplicativo', gerarCodigosDeReserva(() => 0.5)));
    expect(faltam(l.metas, { conta, inicial, consultados: [] })).toEqual([]);
  });

  it('e encerrar as sessões ANTES de trocar a senha deixa a lição aberta', () => {
    /* Não é castigo nosso: ele tem a senha, e entrar de novo é digitar. A
       simulação deixa isso acontecer porque uma que o mantivesse fora depois de
       um clique ensinaria que a ordem dá na mesma. */
    const l = daConta('invasao');
    const inicial = l.inicial();
    const conta = encerrarOutrasSessoes(inicial, inicial.senha);
    expect(faltam(l.metas, { conta, inicial, consultados: [] })).toContain('sessoes-encerradas');
  });

  it('plano: passar para o clube, trocar as senhas dela, e só então tirá-la', () => {
    const l = doCofre('plano');
    const inicial = l.inicial();
    let cofre = passarParaOClube(inicial, 'formulario', 'inscricoes@clubepioneiros.org');
    for (const e of senhasQueEssaPessoaSabia(inicial, 'Marta')) {
      cofre = trocarSenha(cofre, e.id, `${NOVA()}-${e.id}`);
    }
    for (const e of inicial.entradas) {
      cofre = tirarAcesso(cofre, e.id, 'Marta');
      cofre = darAcesso(darAcesso(cofre, e.id, 'Ronaldo'), e.id, 'Cleide');
    }
    expect(faltam(l.metas, { cofre, inicial })).toEqual([]);
  });

  it('e tirar o acesso dela sem trocar as senhas NÃO fecha o plano', () => {
    /*
      A meta silenciosa do módulo 8. Tirar o nome de alguém da lista não faz
      essa pessoa esquecer o que digitou por três anos: o cofre passa a dizer
      que ela não tem acesso, e ela continua entrando em tudo.
    */
    const l = doCofre('plano');
    const inicial = l.inicial();
    let cofre = passarParaOClube(inicial, 'formulario', 'inscricoes@clubepioneiros.org');
    for (const e of inicial.entradas) {
      cofre = tirarAcesso(cofre, e.id, 'Marta');
      cofre = darAcesso(darAcesso(cofre, e.id, 'Ronaldo'), e.id, 'Cleide');
    }
    expect(faltam(l.metas, { cofre, inicial })).toEqual(['senhas-que-ela-sabia']);
  });
});

/* ── O contexto inicial é o de quando a lição abriu ────────────────────────── */

describe('o cofre de quando a lição abriu é lido, e não o de agora', () => {
  it('as senhas que a Marta sabia saem do inicial, e não do cofre de hoje', () => {
    /*
      Lido do cofre de agora, o cálculo giraria em falso: depois de tirar o
      acesso dela, "as contas que a Marta abria" seria a lista vazia, e a meta
      fecharia sozinha sem uma senha ter mudado. É a mesma razão de a CC-ES001
      carregar o disco de agora **e** o de quando a lição abriu.
    */
    const l = LICOES_DA_CC_ES005.plano;
    if (l.programa !== 'cofre') throw new Error('lição não é de cofre');
    const inicial = l.inicial();
    expect(senhasQueEssaPessoaSabia(inicial, 'Marta').length).toBeGreaterThan(3);

    let cofre = inicial;
    for (const e of inicial.entradas) cofre = tirarAcesso(cofre, e.id, 'Marta');
    expect(senhasQueEssaPessoaSabia(cofre, 'Marta')).toEqual([]);
  });
});

/* ── Os tipos batem ────────────────────────────────────────────────────────── */

describe('cada lição diz em qual dos três programas ela acontece', () => {
  it('e o contexto que ela recebe é o daquele programa', () => {
    /*
      Se a união deixasse de discriminar, uma meta de cofre poderia ser lida com
      o contexto da conta e nada compilaria errado — e a lição abriria com a
      lista inteira vermelha sem nada explicando.
    */
    for (const [id, l] of Object.entries(LICOES_DA_CC_ES005)) {
      switch (l.programa) {
        case 'cofre': {
          const c: ContextoDoCofre = { cofre: l.inicial(), inicial: l.inicial() };
          expect(l.metas.every(m => typeof m.feita(c) === 'boolean'), id).toBe(true);
          break;
        }
        case 'conta': {
          const c: ContextoDaConta = { conta: l.inicial(), inicial: l.inicial(), consultados: [] };
          expect(l.metas.every(m => typeof m.feita(c) === 'boolean'), id).toBe(true);
          break;
        }
        case 'correio': {
          const c: ContextoDoCorreio = { caixa: l.caixa(), analises: [] };
          expect(l.metas.every(m => typeof m.feita(c) === 'boolean'), id).toBe(true);
          break;
        }
        default: {
          const nunca: never = l;
          throw new Error(`programa sem caso: ${JSON.stringify(nunca)}`);
        }
      }
    }
  });
});
