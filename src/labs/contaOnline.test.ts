import { describe, it, expect } from 'vitest';
import {
  type ContaOnline,
  METODOS_DE_DUAS_ETAPAS, ESCOPOS, VAZAMENTOS_CONHECIDOS, ENDERECO_DO_INTRUSO,
  contaDoClube, contaInvadida, gerarCodigosDeReserva,
  ligarDuasEtapas, guardarCodigos, revogarAplicativo, ajustar, fecharTudo,
  trocarSenhaDaConta, encerrarOutrasSessoes, trocarRecuperacao, tirarEncaminhamento,
  vazamentosDe, vazamentosQueAindaValem, portasAbertas,
} from './contaOnline';

/*
  A conta online da CC-ES005.

  ── O que este motor tem de carregar ─────────────────────────────────────
  Cinco demonstrações do requisito 4 e a ordem do requisito 6. Todas viram
  enunciado vazio se a simulação for um punhado de interruptores: ligar duas
  etapas seria um clique, revogar todos os aplicativos fecharia a tarefa,
  consultar vazamento não levaria a lugar nenhum, "tudo privado" passaria, e
  trocar a senha bastaria.

  O que cada trava daqui defende é justamente o contrário de cada uma dessas.
*/

const NOVA = 'frase longa e única do clube';

/* ── Duas etapas: o requisito 4.2 ──────────────────────────────────────────── */

describe('ligar as duas etapas não é o mesmo que estar protegido', () => {
  it('ligar deixa os códigos de reserva por guardar', () => {
    /*
      A armadilha inteira do requisito 4.2. A tela diz "ativada", tudo parece
      certo, e o dia em que o telefone cair no rio a conta vai junto — sem erro
      nenhum e com o desbravador tendo feito o que a tarefa pedia. É "zero link
      não é zero link quebrado" aplicado à caixa de duas etapas.
    */
    const c = ligarDuasEtapas(contaDoClube(), 'aplicativo', gerarCodigosDeReserva(() => 0.5));
    expect(c.duasEtapas.ativa).toBe(true);
    expect(c.duasEtapas.codigosGuardados).toBe(false);
    expect(guardarCodigos(c).duasEtapas.codigosGuardados).toBe(true);
  });

  it('e os códigos existem, porque uma caixa vazia não se guarda', () => {
    const codigos = gerarCodigosDeReserva(() => 0.5);
    expect(codigos.length).toBeGreaterThanOrEqual(8);
    for (const x of codigos) expect(x).toMatch(/^\d{8}$/);
  });

  it('os três métodos existem, e nenhum deles vem sem o lado ruim', () => {
    /*
      O programa relata, e não dá veredito — é a régua de status do Word e o
      painel de Problemas do Python. Um método sem `naoProtege` seria a
      plataforma recomendando dentro do programa imitado, e a escolha do
      requisito 4.2 deixaria de ser da pessoa.

      E os três existem porque um programa tem todos os comandos: no computador
      do clube o SMS vai estar lá, oferecido primeiro.
    */
    const metodos = Object.values(METODOS_DE_DUAS_ETAPAS);
    expect(metodos).toHaveLength(3);
    for (const m of metodos) {
      expect(m.protege.length, m.nome).toBeGreaterThan(20);
      expect(m.naoProtege.length, m.nome).toBeGreaterThan(20);
    }
  });

  it('e o SMS está entre eles, com o que ele não cobre escrito', () => {
    expect(METODOS_DE_DUAS_ETAPAS.sms.naoProtege).toMatch(/chip|operadora/i);
  });
});

/* ── Aplicativos: o requisito 4.3 ──────────────────────────────────────────── */

describe('revisar é decidir um por um, e revogar todos não é revisar', () => {
  const c = contaDoClube();

  it('a conta chega com três autorizados, e o que se lê deles é o último uso', () => {
    /*
      `ultimoUso` é o dado que uma página de verdade mostra. Um campo
      `emUso: boolean` seria a resposta escrita na tela: o desbravador leria
      "em uso" e revogaria o resto sem ter olhado nada.
    */
    expect(c.aplicativos).toHaveLength(3);
    for (const a of c.aplicativos) expect(a.ultimoUso, a.nome).toBeTruthy();
  });

  it('dois deles ninguém abre há mais de ano, e um foi usado ontem', () => {
    const porNome = Object.fromEntries(c.aplicativos.map(a => [a.id, a.ultimoUso]));
    expect(porNome.formularios).toBe('ontem');
    expect(porNome.fotomagica).toMatch(/ano/);
    expect(porNome.sorteador).toMatch(/ano/);
  });

  it('e um deles pede muito mais do que o serviço dele precisa', () => {
    /* Um aplicativo de filtro de fotos que lê todas as mensagens e a lista de
       contatos. Sem isso, revisar seria só olhar data. */
    const foto = c.aplicativos.find(a => a.id === 'fotomagica')!;
    expect(foto.escopos).toContain('ler-email');
    expect(foto.escopos).toContain('ver-contatos');
  });

  it('toda permissão tem uma frase que diz o que ela deixa fazer', () => {
    /* Uma lista de escopos crus — `ler-email` — não se revisa: o desbravador
       não tem como decidir sobre o que não entende. */
    for (const a of c.aplicativos) {
      for (const e of a.escopos) expect(ESCOPOS[e], `${a.nome} · ${e}`).toBeTruthy();
    }
  });

  it('revogar tira um, e só um', () => {
    const d = revogarAplicativo(c, 'fotomagica');
    expect(d.aplicativos.map(a => a.id)).toEqual(['formularios', 'sorteador']);
  });
});

/* ── Vazamento: o requisito 4.4 ────────────────────────────────────────────── */

describe('consultar vazamento só responde sobre as listas que ele consultou', () => {
  it('o endereço do clube consta num vazamento de abril, com a senha dentro', () => {
    const v = vazamentosDe('clubepioneiros@gmail.com');
    expect(v).toHaveLength(1);
    expect(v[0].oQueVazou).toContain('senha');
  });

  it('e um endereço que não está em lista nenhuma devolve lista vazia', () => {
    /*
      **E lista vazia não é "está seguro".** É o erro mais fácil de ensinar
      aqui: quem consulta e recebe "nada encontrado" lê um atestado, e o que
      houve foi só nenhuma lista pública ter aquele endereço. O motor não
      inventa veredito nenhum — quem diz o resto é a lição.
    */
    expect(vazamentosDe('ninguem@exemplo.org')).toEqual([]);
  });

  it('a consulta não distingue maiúscula de minúscula, como nenhuma consulta dessas distingue', () => {
    expect(vazamentosDe('ClubePioneiros@Gmail.com')).toHaveLength(1);
  });

  it('o endereço pessoal da secretária consta em dois, do mais novo ao mais velho', () => {
    /* É o requisito 7 aparecendo aqui: a recuperação da conta do clube vai
       para um endereço que já está em duas listas públicas. */
    const v = vazamentosDe('marta.oliveira@gmail.com');
    expect(v.map(x => x.quando)).toEqual(['2023-11', '2022-08']);
  });

  it('e o que ainda vale é o vazamento cuja senha continua sendo a de hoje', () => {
    /*
      É o que separa o 4.4 de uma consulta que não leva a lugar nenhum. Um
      vazamento de 2022 cuja senha já foi trocada é história; um de abril cuja
      senha nunca mudou é a conta aberta, agora, para quem baixou a lista.
    */
    const c = contaDoClube();
    expect(vazamentosQueAindaValem(c).map(v => v.servico)).toEqual(['Loja de Camisetas Online']);

    const depois = trocarSenhaDaConta(c, NOVA, '2026-09');
    expect(vazamentosQueAindaValem(depois)).toEqual([]);
  });

  it('e vazamento sem senha dentro nunca "ainda vale", por mais novo que seja', () => {
    /* Vazou o endereço e mais nada: é spam, e não conta aberta. Contá-lo
       mandaria trocar uma senha que ninguém tem, e a próxima vez que a lição
       mandasse trocar seria a vez em que ninguém troca. */
    const so = [{
      servico: 'Cadastro de Newsletter', quando: '2026-08',
      oQueVazou: ['endereço de e-mail'], enderecos: ['clubepioneiros@gmail.com'],
    }];
    expect(vazamentosDe('clubepioneiros@gmail.com', so)).toHaveLength(1);
    expect(vazamentosQueAindaValem(contaDoClube(), so)).toEqual([]);
  });

  it('e a lista conhecida não chega vazia, que aprovaria tudo calado', () => {
    expect(VAZAMENTOS_CONHECIDOS.length).toBeGreaterThanOrEqual(3);
  });
});

/* ── Privacidade: o requisito 4.5 ──────────────────────────────────────────── */

describe('ajustar privacidade é decidir um por um, e não fechar tudo', () => {
  const c = contaDoClube();

  it('a conta chega com tudo aberto, inclusive a localização das fotos', () => {
    const aberto = Object.fromEntries(c.privacidade.map(a => [a.id, a.valor]));
    expect(aberto.membros).toBe('qualquer pessoa');
    expect(aberto.telefones).toBe('qualquer pessoa');
    expect(aberto.local).toBe('sim');
    expect(aberto.anuncios).toBe('sim');
  });

  it('e com a página do clube achável, que é como as famílias chegam', () => {
    expect(c.privacidade.find(a => a.id === 'busca')!.valor).toBe('sim');
  });

  it('"deixar tudo privado" tira o clube da busca junto', () => {
    /*
      O botão existe porque um programa tem todos os comandos — e é ele que
      mostra que privacidade não é um interruptor. Fechado tudo, os dados dos
      desbravadores ficam guardados **e** nenhuma família acha o clube. É a
      família do Aceitar Todas que não fecha a tarefa.
    */
    const d = fecharTudo(c);
    expect(d.privacidade.find(a => a.id === 'busca')!.valor).toBe('não');
    expect(d.privacidade.find(a => a.id === 'telefones')!.valor).toBe('só a diretoria');
  });

  it('e cada ajuste diz o que decide, em vez de só ter um nome', () => {
    /* Sem a frase, "Quem pode ver os telefones cadastrados" não diz que são os
       telefones dos pais — e a decisão passa a ser sobre uma palavra. */
    for (const a of c.privacidade) {
      expect(a.explica.length, a.nome).toBeGreaterThan(20);
      expect(a.opcoes, a.nome).toContain(a.valor);
      expect(a.opcoes, a.nome).toContain(a.fechado);
    }
  });

  it('ajustar um não mexe nos outros', () => {
    const d = ajustar(c, 'telefones', 'só a diretoria');
    expect(d.privacidade.find(a => a.id === 'telefones')!.valor).toBe('só a diretoria');
    expect(d.privacidade.find(a => a.id === 'busca')!.valor).toBe('sim');
  });

  it('e a lista não chega vazia', () => {
    expect(c.privacidade.length).toBeGreaterThanOrEqual(5);
  });
});

/* ── A ordem das providências: o requisito 6 ───────────────────────────────── */

describe('a conta invadida, e por que a ordem custa', () => {
  it('ela chega com as três portas abertas, e mais o encaminhamento', () => {
    /*
      Nada disso se vê olhando a caixa de entrada, que é o que faz o requisito
      6 existir: o intruso trocou a recuperação, deixou uma regra copiando tudo
      e autorizou um aplicativo — um crachá separado da senha.
    */
    const portas = portasAbertas(contaInvadida(), ENDERECO_DO_INTRUSO);
    expect(portas.map(p => p.id))
      .toEqual(['recuperacao', 'sessao', 'aplicativo', 'encaminhamento']);
  });

  it('encerrar as sessões antes de trocar a senha traz o intruso de volta', () => {
    /*
      É a conta inteira da ordem, e ela não é castigo nosso: ele tem a senha, e
      entrar de novo é digitar. Uma simulação que o deixasse fora depois de um
      clique ensinaria que a ordem dá na mesma — que é exatamente o que o
      requisito 6 existe para desmentir.
    */
    const c = encerrarOutrasSessoes(contaInvadida(), 'Pioneiros2026');
    expect(c.sessoes.some(s => s.intruso), 'o intruso ficou fora sem a senha ter mudado').toBe(true);
    expect(c.sessoes.find(s => s.intruso)!.quando).toBe('agora mesmo');
  });

  it('e depois de trocar a senha ele não volta', () => {
    const c = trocarSenhaDaConta(contaInvadida(), NOVA, '2026-09');
    expect(c.sessoes.map(s => s.id)).toEqual(['aqui']);
    expect(encerrarOutrasSessoes(c, 'Pioneiros2026').sessoes.map(s => s.id)).toEqual(['aqui']);
  });

  it('mas trocar a senha sozinho deixa três portas de pé', () => {
    /*
      A que mais custa é a recuperação: com ela, "esqueci minha senha" devolve
      a conta ao intruso em dois minutos, por mais forte que seja a senha nova.
      E a tela, nesse meio-tempo, não tem nada de errado para mostrar.
    */
    const c = trocarSenhaDaConta(contaInvadida(), NOVA, '2026-09');
    expect(portasAbertas(c, ENDERECO_DO_INTRUSO).map(p => p.id))
      .toEqual(['recuperacao', 'aplicativo', 'encaminhamento']);
  });

  it('e cada porta sobrevive ao fechamento das outras', () => {
    /*
      A trava do conjunto: elas são quatro coisas diferentes, em quatro telas
      diferentes, e fechar uma não fecha nenhuma outra. Uma lição que medisse
      só a senha premiaria uma conta que continua sendo lida.
    */
    const c = contaInvadida();
    const so = (f: (x: ContaOnline) => ContaOnline) =>
      portasAbertas(f(c), ENDERECO_DO_INTRUSO).map(p => p.id);

    expect(so(x => trocarRecuperacao(x, { email: 'diretoria@clubepioneiros.org' })))
      .toEqual(['sessao', 'aplicativo', 'encaminhamento']);
    expect(so(x => revogarAplicativo(x, 'acesso-remoto')))
      .toEqual(['recuperacao', 'sessao', 'encaminhamento']);
    expect(so(x => tirarEncaminhamento(x, 'copia')))
      .toEqual(['recuperacao', 'sessao', 'aplicativo']);
  });

  it('e fechadas as quatro não sobra nenhuma', () => {
    let c = trocarSenhaDaConta(contaInvadida(), NOVA, '2026-09');
    c = trocarRecuperacao(c, { email: 'diretoria@clubepioneiros.org' });
    c = revogarAplicativo(c, 'acesso-remoto');
    c = tirarEncaminhamento(c, 'copia');
    expect(portasAbertas(c, ENDERECO_DO_INTRUSO)).toEqual([]);
  });

  it('o encaminhamento não traz o intruso de volta, e é o pior de esquecer', () => {
    /* Ele não precisa entrar: a conta manda tudo para ele sozinha, todo dia,
       sem nada acontecer na tela de quem recuperou. */
    const c = contaInvadida();
    expect(c.encaminhamentos.find(e => e.doIntruso)!.para).toBe(ENDERECO_DO_INTRUSO);
  });

  it('e a conta antes da invasão não tem porta aberta nenhuma', () => {
    /* A guarda contra a trava que aprova tudo: se `portasAbertas` devolvesse
       lista vazia sempre, todas as asserções de cima que esperam vazio
       passariam. */
    expect(portasAbertas(contaDoClube(), ENDERECO_DO_INTRUSO)).toEqual([]);
  });
});

/* ── A conta de partida não abre com nada feito ────────────────────────────── */

describe('a conta do clube não abre com tarefa nenhuma cumprida', () => {
  const c = contaDoClube();

  it('as duas etapas chegam desligadas', () => {
    expect(c.duasEtapas.ativa).toBe(false);
    expect(c.duasEtapas.codigosGuardados).toBe(false);
  });

  it('a recuperação chega na caixa pessoal da secretária', () => {
    /* É o requisito 7 dentro da conta, e o endereço dela já consta em dois
       vazamentos públicos — quem entra na caixa pessoal dela recupera a conta
       do clube inteira. */
    expect(c.recuperacao.email).toBe('marta.oliveira@gmail.com');
    expect(vazamentosDe(c.recuperacao.email!).length).toBeGreaterThan(0);
  });

  it('e a senha da conta é a mesma que o cofre repete em quatro serviços', () => {
    /* É o que amarra o requisito 4.4 de volta no 3: trocar a senha aqui não
       fecha as outras três contas que a repetem. */
    expect(c.senha).toBe('Pioneiros2026');
  });
});
