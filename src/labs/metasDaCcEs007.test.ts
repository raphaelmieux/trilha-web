import { describe, expect, it } from 'vitest';
import {
  type ContextoDaComunicacao, type LicaoDaCcEs007, type Meta,
  ACHOU_NA_BUSCA, CHEGARAM_DEPOIS, CONSELHO_DE_JULHO, DECISOES_MINIMAS_DA_ATA,
  ENDERECO_ERRADO, EVENTO_REGIONAL, FOTOS, HORA_COMBINADA, ITENS_MINIMOS_DA_PAUTA,
  LICOES_DA_CC_ES007, NAO_PEDEM_NADA, NAO_PEDEM_NADA_DEPOIS, OLHOU_A_GRADE,
  PALAVRAS_DO_ASSUNTO, PEDEM_ACAO, PEDEM_ACAO_DEPOIS, PERGUNTOU_A_QUEM_NAO_COMPARTILHA,
  RASCUNHO_DO_ONIBUS, REUNIAO_DOS_CONSELHEIROS, SABADO_DO_ACAMPAMENTO,
  VIU_O_ANEXO_VOLTAR, VIU_O_MICROFONE_FECHADO, VIU_O_VAZAMENTO,
  VIU_QUE_AGUARDANDO_NAO_E_SIM, contextoInicial,
} from './metasDaCcEs007';
import {
  type Caixa, type Rascunho,
  AGUIA, CONSELHEIROS_DO_CLUBE, DIRECAO, FALCAO, FALCAO_HOJE, FAMILIAS, HOJE,
  arquivar, criarLista, enviar, mudarMembros, naPasta, paraALixeira, rascunhoVazio,
} from './correspondencia';
import {
  type Evento,
  CALENDARIO_DO_CLUBE, DIA_DA_REUNIAO, FUSO_DE_BRASILIA, FUSO_DO_ACRE,
  compartilharCalendario, criarEvento, mudarEvento, trocarConvidado,
} from './agenda';
import {
  PLANILHA, VIDEO, abrirMicrofone, admitir, compartilhar, entrar, falar,
} from './reuniaoRemota';

const TODAS = Object.keys(LICOES_DA_CC_ES007) as LicaoDaCcEs007[];

const com = (c: ContextoDaComunicacao, p: Partial<ContextoDaComunicacao>) => ({ ...c, ...p });
const anotou = (c: ContextoDaComunicacao, o: string) =>
  com(c, { descobertas: [...c.descobertas, o] });
const mandar = (c: ContextoDaComunicacao, r: Partial<Rascunho>) =>
  com(c, { caixa: enviar(c.caixa, { ...rascunhoVazio(), ...r }, HOJE) });

const faltam = (metas: Meta[], c: ContextoDaComunicacao) =>
  metas.filter(m => !m.feita(c)).map(m => m.id);

/* ────────────────────────────────────────────────────────────────────────────
   As soluções de referência
   ──────────────────────────────────────────────────────────────────────── */

const MENSAGEM_ARRUMADA = {
  para: RASCUNHO_DO_ONIBUS.para,
  assunto: 'Confirmação do ônibus do acampamento',
  corpo: 'Prezados conselheiros,\n\n'
    + 'A gente precisa fechar o número de quem vai no ônibus do acampamento. '
    + 'A saída é dia 3 de julho às 6h da Igreja Central.\n\n'
    + 'Peço que me confirmem o número da unidade de vocês até quarta.',
};

const evtRegional = (): Evento => ({
  id: EVENTO_REGIONAL,
  titulo: 'Reunião regional dos clubes',
  local: 'Sede da região — sala 2',
  descricao: 'Fechamento do semestre com os clubes da região. Levar o relatório '
    + 'das especialidades e o número de inscritos do acampamento.',
  dia: '2026-07-08', inicio: HORA_COMBINADA, fim: '16:30',
  fuso: FUSO_DO_ACRE, calendario: CALENDARIO_DO_CLUBE, convidados: [],
});

const SOLUCOES: Record<LicaoDaCcEs007, (c: ContextoDaComunicacao) => ContextoDaComunicacao> = {
  cco: c => {
    const viu = anotou(c, VIU_O_VAZAMENTO);
    const oculta = mandar(viu, {
      cco: FAMILIAS.map(f => f.endereco),
      assunto: 'Acampamento de Inverno — o que levar',
      corpo: 'Saída dia 3 de julho às 6h.',
    });
    return mandar(oculta, {
      para: DIRECAO.map(d => d.endereco),
      assunto: 'Ônibus do acampamento',
      corpo: 'Podemos fechar com a Viação Planalto?',
    });
  },
  mensagem: c => mandar(
    com(c, { caixa: { ...c.caixa, assinatura: 'Marina Duarte — Secretaria do Clube Pioneiros' } }),
    MENSAGEM_ARRUMADA),
  pesado: c => mandar(anotou(c, VIU_O_ANEXO_VOLTAR), {
    cco: FAMILIAS.map(f => f.endereco),
    assunto: 'Fotos do acampamento',
    corpo: 'Estão aqui, no vínculo abaixo.',
    vinculos: [{ ...FOTOS, quemAbre: 'qualquer-um-com-o-link' }],
  }),
  caixa: c => {
    let caixa: Caixa = c.caixa;
    for (const id of NAO_PEDEM_NADA) caixa = arquivar(caixa, id);
    return anotou(com(c, { caixa }), ACHOU_NA_BUSCA);
  },
  lista: c => {
    let caixa = mudarMembros(c.caixa, 'falcao', [...FALCAO_HOJE]);
    caixa = criarLista(caixa, {
      id: 'aguia', nome: 'Unidade Águia',
      endereco: 'unidade.aguia@clubepioneiros.org.br',
      membros: AGUIA.map(a => a.id),
    });
    return mandar(com(c, { caixa }), {
      para: [caixa.listas[0].endereco],
      assunto: 'Escala de cozinha da Falcão',
      corpo: 'A Falcão cozinha no sábado de manhã.',
    });
  },
  ausencia: c => com(c, {
    caixa: {
      ...c.caixa,
      ausencia: {
        ligada: true, de: '2026-07-10', ate: '2026-07-25',
        texto: 'Estou fora da secretaria até 25 de julho. Para o acampamento, '
          + 'fale com a tesouraria: tesouraria@clubepioneiros.org.br.',
        soParaContatos: true,
      },
    },
  }),
  evento: c => com(c, { agenda: criarEvento(c.agenda, evtRegional()) }),
  convites: c => {
    const viu = anotou(c, VIU_QUE_AGUARDANDO_NAO_E_SIM);
    const certo = com(viu, {
      agenda: trocarConvidado(viu.agenda, CONSELHO_DE_JULHO, ENDERECO_ERRADO,
        'falcao@clubepioneiros.org.br'),
    });
    return mandar(certo, {
      para: ['tucano@clubepioneiros.org.br', 'falcao@clubepioneiros.org.br'],
      assunto: 'Reunião do conselho, dia 28',
      corpo: 'Você consegue vir?',
    });
  },
  recorrente: c => {
    let agenda = criarEvento(c.agenda, {
      id: 'sabado', titulo: 'Reunião do clube', local: 'Igreja Central — salão',
      descricao: 'Reunião semanal: unidades, especialidades e ordem unida. Levar o lenço.',
      dia: '2026-06-27', inicio: '14:00', fim: '17:00',
      fuso: FUSO_DE_BRASILIA, calendario: CALENDARIO_DO_CLUBE, convidados: [],
      repete: { cada: 'semana', ate: '2026-12-19', pulados: [SABADO_DO_ACAMPAMENTO] },
    });
    agenda = criarEvento(agenda, {
      id: 'volta', titulo: 'Volta do acampamento', local: 'Igreja Central — estacionamento',
      descricao: 'Chegada prevista para as 17h. As famílias buscam no estacionamento.',
      dia: '2026-07-05', inicio: '17:00', fim: '18:00',
      fuso: FUSO_DE_BRASILIA, calendario: CALENDARIO_DO_CLUBE, convidados: [],
    });
    agenda = criarEvento(agenda, {
      id: 'conselho-julho', titulo: 'Reunião do conselho — julho',
      local: 'Sala da secretaria',
      descricao: 'Fechamento do acampamento e escala do segundo semestre.',
      dia: '2026-07-28', inicio: '19:30', fim: '21:00',
      fuso: FUSO_DE_BRASILIA, calendario: CALENDARIO_DO_CLUBE, convidados: [],
    });
    return com(c, { agenda });
  },
  calendario: c => {
    let agenda = c.agenda;
    for (const d of DIRECAO.slice(0, 2))
      agenda = compartilharCalendario(agenda, CALENDARIO_DO_CLUBE, d.endereco, 'alterar');
    for (const x of CONSELHEIROS_DO_CLUBE)
      agenda = compartilharCalendario(agenda, CALENDARIO_DO_CLUBE, x.endereco, 'ver-detalhes');
    agenda = criarEvento(agenda, {
      id: REUNIAO_DOS_CONSELHEIROS, titulo: 'Reunião dos conselheiros',
      local: 'Sala da secretaria',
      descricao: 'Escala de cozinha do acampamento e divisão das unidades por barraca.',
      dia: DIA_DA_REUNIAO, inicio: '18:00', fim: '19:30',
      fuso: FUSO_DE_BRASILIA, calendario: CALENDARIO_DO_CLUBE, convidados: [],
    });
    return anotou(anotou(com(c, { agenda }), OLHOU_A_GRADE), PERGUNTOU_A_QUEM_NAO_COMPARTILHA);
  },
  reuniao: c => {
    const agenda = mudarEvento(c.agenda, CONSELHO_DE_JULHO, {
      linkDaReuniao: 'https://reuniao.exemplo.com/clube-pioneiros-conselho',
    });
    let sala = entrar(c.reuniao);
    sala = falar(sala, 'Bom dia a todos, vamos começar.');
    sala = abrirMicrofone(sala, true);
    sala = admitir(sala, 'tucano@clubepioneiros.org.br');
    sala = compartilhar(sala, { oQue: 'janela', alvo: PLANILHA, comSom: false });
    sala = compartilhar(sala, { oQue: 'guia', alvo: VIDEO, comSom: true });
    return anotou(com(c, { agenda, reuniao: sala }), VIU_O_MICROFONE_FECHADO);
  },
  pauta: c => {
    let caixa = c.caixa;
    for (const id of NAO_PEDEM_NADA_DEPOIS) caixa = arquivar(caixa, id);
    const arrumada = com(c, { caixa });
    const comPauta = mandar(arrumada, {
      para: DIRECAO.slice(0, 3).map(d => d.endereco),
      assunto: 'Pauta da reunião do conselho de 28 de julho',
      corpo: 'Prezados,\n\nSegue a pauta:\n'
        + '1. Prestação de contas do acampamento\n'
        + '2. Escala do segundo semestre\n'
        + '3. Compra do material da ordem unida\n',
    });
    return mandar(comPauta, {
      para: DIRECAO.slice(0, 3).map(d => d.endereco),
      assunto: 'Ata da reunião do conselho de 28 de julho',
      corpo: 'Decisões:\n'
        + '- Nelson fecha a prestação de contas até dia 5\n'
        + '- Cláudia monta a escala do semestre até sexta\n',
    });
  },
};

/* ────────────────────────────────────────────────────────────────────────────
   Nenhuma meta abre verde
   ──────────────────────────────────────────────────────────────────────── */

describe('nenhuma meta da CC-ES007 abre verde', () => {
  it('o registro tem as doze lições, e nenhuma delas sem meta', () => {
    /* Guarda contra o vazio: um registro que esvaziasse deixaria toda conta
       abaixo verdadeira por não ter conferido nada. */
    expect(TODAS).toHaveLength(12);
    for (const l of TODAS) expect(LICOES_DA_CC_ES007[l].metas.length).toBeGreaterThanOrEqual(2);
  });

  it.each(TODAS)('%s abre com a lista inteira por fazer', l => {
    /*
      Tarefa que abre verde ensina a não ler a lista. As metas de preservação —
      a caixa que continua arrumada, a série que continua de pé, quem continua
      sem poder apagar o acampamento — são verdadeiras no segundo zero, e por
      isso viajam como conjunção de quem pede o gesto, e não como item próprio.
      É a decisão do "sem alterar uma palavra do texto" da CC-ES002.
    */
    const c = contextoInicial(l);
    for (const m of LICOES_DA_CC_ES007[l].metas) {
      expect(m.feita(c), `${l}/${m.id} já abre cumprida`).toBe(false);
    }
  });

  it.each(TODAS)('%s tem passos e lugar em toda meta', l => {
    /* Modelo vazio pede passos completos: o laboratório que mais dá trabalho
       não pode ser o único em que a moldura não tem o que oferecer a quem
       travar. */
    for (const m of LICOES_DA_CC_ES007[l].metas) {
      expect(m.passos.length, `${l}/${m.id} sem passo a passo`).toBeGreaterThanOrEqual(2);
      expect(m.onde.length, `${l}/${m.id} sem lugar`).toBeGreaterThan(8);
      expect(m.detalhe.length, `${l}/${m.id} sem detalhe`).toBeGreaterThan(40);
    }
  });

  it('e nenhum id de meta se repete dentro da mesma lição', () => {
    for (const l of TODAS) {
      const ids = LICOES_DA_CC_ES007[l].metas.map(m => m.id);
      expect(new Set(ids).size, `${l} tem meta repetida`).toBe(ids.length);
    }
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   A solução de referência fecha cada lista
   ──────────────────────────────────────────────────────────────────────── */

describe('a solução de referência fecha a lista inteira', () => {
  it.each(TODAS)('%s se fecha por inteiro', l => {
    /*
      Laboratório que ninguém consegue vencer é pior do que um que abre
      resolvido: um dá tarefa verde de graça, o outro deixa quem fez tudo certo
      olhando uma lista vermelha sem nada na tela que explique. Esta trava é a
      que pega duas metas que se excluem — o defeito que a lição de assinar da
      CC-ES004 teve.
    */
    const c = SOLUCOES[l](contextoInicial(l));
    expect(faltam(LICOES_DA_CC_ES007[l].metas, c), `${l} não fecha`).toEqual([]);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   Os caminhos rápidos e errados
   ──────────────────────────────────────────────────────────────────────── */

describe('o caminho rápido e errado deixa vermelha a meta que pede o gesto', () => {
  it('mandar o aviso em cópia aberta não fecha a meta do Cco', () => {
    /* O campo preenchido não é a conta: o que se mede é o vazamento não ter
       acontecido. */
    const c = mandar(anotou(contextoInicial('cco'), VIU_O_VAZAMENTO), {
      para: FAMILIAS.map(f => f.endereco),
      assunto: 'Acampamento de Inverno',
      corpo: 'Saída dia 3.',
    });
    expect(faltam(LICOES_DA_CC_ES007.cco.metas, c)).toContain('aviso-sem-vazar');
  });

  it('e uma família no Cco com as outras 51 no Para é o campo preenchido e tudo vazado', () => {
    /*
      É a conta que separa "o Cco tem alguém" de "ninguém viu ninguém". Esta
      mensagem tem o campo preenchido, e entregou cinquenta e um endereços a
      cinquenta e uma pessoas — e é o caso que a mutação achou: sem ele, medir
      o vazamento pelo campo preenchido passaria calado.
    */
    const [primeira, ...resto] = FAMILIAS;
    const c = mandar(anotou(contextoInicial('cco'), VIU_O_VAZAMENTO), {
      cco: [primeira.endereco],
      para: resto.map(f => f.endereco),
      assunto: 'Acampamento de Inverno',
      corpo: 'Saída dia 3.',
    });
    expect(faltam(LICOES_DA_CC_ES007.cco.metas, c)).toContain('aviso-sem-vazar');
  });

  it('e esconder a direção no Cco não fecha a meta da conversa', () => {
    /* Aqui o Cco é o erro: ninguém alcança quem não aparece. */
    const c = mandar(contextoInicial('cco'), {
      cco: DIRECAO.map(d => d.endereco), assunto: 'Ônibus', corpo: 'Podemos fechar?',
    });
    expect(faltam(LICOES_DA_CC_ES007.cco.metas, c)).toContain('conversa-em-copia-aberta');
  });

  it('apagar o texto e escrever de novo perde os fatos, e não fecha nada', () => {
    /*
      É o atalho mais rápido da lição: quatro linhas novas, bonitas, com
      saudação, pedido e prazo — e sem a data da saída, sem a hora e sem o
      lugar. Num clube de verdade é assim que a única mensagem que tinha a
      informação deixa de tê-la.
    */
    const c = mandar(
      com(contextoInicial('mensagem'), {
        caixa: {
          ...contextoInicial('mensagem').caixa,
          assinatura: 'Marina Duarte — Secretaria do Clube Pioneiros',
        },
      }),
      {
        para: RASCUNHO_DO_ONIBUS.para,
        assunto: 'Confirmação do ônibus do acampamento',
        corpo: 'Prezados,\n\nPeço que confirmem o número da unidade até quarta.',
      });
    expect(faltam(LICOES_DA_CC_ES007.mensagem.metas, c)).toHaveLength(4);
  });

  it('a data da viagem não vale como prazo do pedido', () => {
    /* Separadas, as duas contas se enganam: a mensagem cita "dia 3 de julho" e
       não pede nada a ninguém com prazo. */
    const c = mandar(contextoInicial('mensagem'), {
      para: RASCUNHO_DO_ONIBUS.para,
      assunto: `Ônibus do acampamento — ${PALAVRAS_DO_ASSUNTO[0]}`,
      corpo: `Prezados,\n\n${RASCUNHO_DO_ONIBUS.corpo}`,
    });
    expect(faltam(LICOES_DA_CC_ES007.mensagem.metas, c)).toContain('pedido-com-prazo');
  });

  it('mandar o vínculo fechado não fecha a meta de quem abre', () => {
    const c = mandar(anotou(contextoInicial('pesado'), VIU_O_ANEXO_VOLTAR), {
      cco: FAMILIAS.map(f => f.endereco),
      assunto: 'Fotos', corpo: 'Aqui.',
      vinculos: [{ ...FOTOS, quemAbre: 'so-voce' }],
    });
    expect(faltam(LICOES_DA_CC_ES007.pesado.metas, c)).toEqual(['o-vinculo-abre']);
  });

  it('esvaziar a caixa de entrada não é arrumá-la', () => {
    /*
      É o atalho que mais parece resolvido: a entrada fica limpa, e o que
      precisava de você saiu junto. É "zero link não é zero link quebrado"
      aplicado a uma arrumação.
    */
    let caixa = contextoInicial('caixa').caixa;
    for (const m of naPasta(caixa, 'entrada')) caixa = arquivar(caixa, m.id);
    const c = anotou(com(contextoInicial('caixa'), { caixa }), ACHOU_NA_BUSCA);
    expect(faltam(LICOES_DA_CC_ES007.caixa.metas, c))
      .toContain('arquivou-o-que-nao-pede-nada');
  });

  it('e mandar para a lixeira não é arquivar', () => {
    /* A busca não lê a lixeira: o que foi excluído não se acha mais, e é essa
       assimetria que separa as duas. */
    let caixa = contextoInicial('caixa').caixa;
    for (const id of NAO_PEDEM_NADA) caixa = paraALixeira(caixa, id);
    const c = anotou(com(contextoInicial('caixa'), { caixa }), ACHOU_NA_BUSCA);
    expect(faltam(LICOES_DA_CC_ES007.caixa.metas, c))
      .toContain('arquivou-o-que-nao-pede-nada');
  });

  it('tirar quem saiu não é pôr quem entrou, e vice-versa', () => {
    /* Esquecer de tirar manda a conversa interna a quem não está mais na
       unidade; esquecer de pôr deixa alguém de fora de tudo. Os dois erros
       existem separados porque um não é o outro. */
    const base = contextoInicial('lista');
    const soTirou = com(base, {
      caixa: mudarMembros(base.caixa, 'falcao', FALCAO_HOJE.filter(x => x !== 'helena')),
    });
    expect(faltam(LICOES_DA_CC_ES007.lista.metas, soTirou)).toContain('pos-quem-entrou');
    expect(faltam(LICOES_DA_CC_ES007.lista.metas, soTirou)).not.toContain('tirou-quem-saiu');

    const soPos = com(base, {
      caixa: mudarMembros(base.caixa, 'falcao', [...base.caixa.listas[0].membros, 'helena']),
    });
    expect(faltam(LICOES_DA_CC_ES007.lista.metas, soPos)).toContain('tirou-quem-saiu');
    expect(faltam(LICOES_DA_CC_ES007.lista.metas, soPos)).not.toContain('pos-quem-entrou');
  });

  it('mandar aos cinco endereços à mão não é mandar pela lista', () => {
    const base = contextoInicial('lista');
    const c = mandar(base, {
      para: FALCAO.filter(f => FALCAO_HOJE.includes(f.id)).map(f => f.endereco),
      assunto: 'Escala', corpo: 'Sábado de manhã.',
    });
    expect(faltam(LICOES_DA_CC_ES007.lista.metas, c)).toContain('mandou-pela-lista');
  });

  it('a resposta de ausência que conta que a casa está vazia não fecha', () => {
    /* É o requisito 4.5 encostando na CC-ES005: a resposta automática é a
       única mensagem que você escreve para quem quer que escreva. */
    const base = contextoInicial('ausencia');
    const c = com(base, {
      caixa: {
        ...base.caixa,
        ausencia: {
          ligada: true, de: '2026-07-10', ate: '2026-07-25',
          texto: 'Estamos viajando com a família até 25 de julho. '
            + 'Qualquer coisa, tesouraria@clubepioneiros.org.br.',
          soParaContatos: true,
        },
      },
    });
    expect(faltam(LICOES_DA_CC_ES007.ausencia.metas, c)).toEqual(['ligou-com-fim']);
  });

  it('e a que não tem data de fim também não', () => {
    const base = contextoInicial('ausencia');
    const c = com(base, {
      caixa: {
        ...base.caixa,
        ausencia: {
          ligada: true, de: '2026-07-10', ate: '',
          texto: 'Estou fora. Fale com tesouraria@clubepioneiros.org.br.',
          soParaContatos: true,
        },
      },
    });
    expect(faltam(LICOES_DA_CC_ES007.ausencia.metas, c)).toEqual(['ligou-com-fim']);
  });

  it('escrever o fuso na descrição não fecha a meta do fuso', () => {
    /*
      A descrição fica certa, o campo fica errado, e quem lê confia no
      calendário. É o "Figura 1" digitado da CC-ES002, com outro assunto.
    */
    const base = contextoInicial('evento');
    const c = com(base, {
      agenda: criarEvento(base.agenda, {
        ...evtRegional(),
        fuso: FUSO_DE_BRASILIA,
        descricao: 'Reunião regional às 15h, horário do Acre. '
          + 'Levar o relatório das especialidades e o número de inscritos.',
      }),
    });
    expect(faltam(LICOES_DA_CC_ES007.evento.metas, c)).toEqual(['no-fuso-de-quem-combinou']);
  });

  it('reenviar o convite para o mesmo endereço errado não conserta nada', () => {
    const base = contextoInicial('convites');
    const c = mandar(anotou(base, VIU_QUE_AGUARDANDO_NAO_E_SIM), {
      para: [ENDERECO_ERRADO, 'tucano@clubepioneiros.org.br'],
      assunto: 'Reunião do conselho', corpo: 'Você vem?',
    });
    expect(faltam(LICOES_DA_CC_ES007.convites.metas, c))
      .toContain('consertou-o-endereco-errado');
  });

  it('apagar a série inteira para desmarcar um sábado não fecha a lição', () => {
    /* "Todos os eventos" apaga o ano e não pergunta de novo. */
    const base = contextoInicial('recorrente');
    const c = SOLUCOES.recorrente(base);
    const semSerie = com(c, { agenda: { ...c.agenda, eventos: c.agenda.eventos.filter(e => !e.repete) } });
    const vermelhas = faltam(LICOES_DA_CC_ES007.recorrente.metas, semSerie);
    expect(vermelhas).toContain('criou-a-serie-com-fim');
    expect(vermelhas).toContain('desmarcou-so-o-sabado-do-acampamento');
  });

  it('e a série "para sempre" não fecha a meta do fim declarado', () => {
    const base = contextoInicial('recorrente');
    const c = SOLUCOES.recorrente(base);
    const semFim = com(c, {
      agenda: mudarEvento(c.agenda, 'sabado', {
        repete: { cada: 'semana', ate: '', pulados: [SABADO_DO_ACAMPAMENTO] },
      }),
    });
    expect(faltam(LICOES_DA_CC_ES007.recorrente.metas, semFim)).toEqual(['criou-a-serie-com-fim']);
  });

  it('dar "fazer alterações" a todo mundo põe o acampamento ao alcance de todo mundo', () => {
    const base = contextoInicial('calendario');
    let agenda = base.agenda;
    for (const q of [...DIRECAO, ...CONSELHEIROS_DO_CLUBE])
      agenda = compartilharCalendario(agenda, CALENDARIO_DO_CLUBE, q.endereco, 'alterar');
    const c = anotou(anotou(com(base, { agenda }), OLHOU_A_GRADE),
      PERGUNTOU_A_QUEM_NAO_COMPARTILHA);
    expect(faltam(LICOES_DA_CC_ES007.calendario.metas, c))
      .toContain('cada-um-no-nivel-do-trabalho-dele');
  });

  it('um nível a mais de "fazer alterações" põe o acampamento ao alcance de mais um', () => {
    /*
      Este é o caso que a mutação achou, e é o pedido mais natural que existe:
      a Tia Rute pede para poder marcar as coisas da unidade dela, e recebe
      "fazer alterações". A direção continua certa, os conselheiros continuam
      certos, e agora quatro pessoas conseguem apagar o acampamento — de um
      arrasto, sem querer, e da agenda de todo mundo ao mesmo tempo.

      Sem ele, a conta de quem pode apagar seria código que nenhum teste
      exercita, e apagá-la não derrubaria nada. E quem recebe o acesso a mais
      tem de estar **fora** dos dois grupos que a meta já confere — dar
      "alterar" a um conselheiro derruba a conta dos conselheiros junto, e aí
      a meta fica vermelha pelo outro motivo, que é a primeira versão desta
      trava passando por acaso.
    */
    const c = SOLUCOES.calendario(contextoInicial('calendario'));
    const maisUm = com(c, {
      agenda: compartilharCalendario(c.agenda, CALENDARIO_DO_CLUBE,
        FAMILIAS[0].endereco, 'alterar'),
    });
    expect(faltam(LICOES_DA_CC_ES007.calendario.metas, maisUm))
      .toEqual(['cada-um-no-nivel-do-trabalho-dele']);
  });

  it('marcar na primeira janela da grade deixa de fora quem ela não viu', () => {
    /*
      A grade parece completa, e a pessoa que falta é a que ela não conseguiu
      consultar. É a mesma decisão da consulta de vazamento da CC-ES005, que
      responde sobre as listas que consultou.
    */
    const c = SOLUCOES.calendario(contextoInicial('calendario'));
    const cedo = com(c, {
      agenda: mudarEvento(c.agenda, REUNIAO_DOS_CONSELHEIROS,
        { inicio: '12:00', fim: '13:30' }),
    });
    expect(faltam(LICOES_DA_CC_ES007.calendario.metas, cedo))
      .toEqual(['marcou-quando-todos-podem']);
  });

  it('e marcar por cima do compromisso de alguém que a grade mostra também não', () => {
    /*
      São duas contas e não uma: servir a quem a grade não vê, e não atropelar
      quem ela vê. Este horário serve ao Tio Márcio e cai em cima da Tia Rute,
      que está ocupada das 16h às 18h — e sem ele a segunda conta seria código
      que nenhum teste exercita, que foi o que a mutação apontou.
    */
    const c = SOLUCOES.calendario(contextoInicial('calendario'));
    const porCima = com(c, {
      agenda: mudarEvento(c.agenda, REUNIAO_DOS_CONSELHEIROS,
        { inicio: '16:00', fim: '17:30' }),
    });
    expect(faltam(LICOES_DA_CC_ES007.calendario.metas, porCima))
      .toEqual(['marcou-quando-todos-podem']);
  });

  it('apresentar pela tela inteira não fecha a meta, por mais vezes que se repita', () => {
    /*
      O que vazou vazou. A lista não trava por causa disso — travar deixaria a
      lição impossível de fechar —, mas a escolha fica registrada, e a meta
      mede a escolha.
    */
    const c = SOLUCOES.reuniao(contextoInicial('reuniao'));
    const vazou = com(c, {
      reuniao: compartilhar(c.reuniao, { oQue: 'tela-inteira', alvo: '', comSom: false }),
    });
    expect(faltam(LICOES_DA_CC_ES007.reuniao.metas, vazou)).toEqual(['apresentou-sem-vazar']);
  });

  it('e mostrar o vídeo pela janela do navegador entrega a imagem e o silêncio', () => {
    const base = contextoInicial('reuniao');
    let sala = entrar(base.reuniao);
    sala = compartilhar(sala, { oQue: 'janela', alvo: VIDEO, comSom: true });
    const c = com(base, { reuniao: sala });
    expect(faltam(LICOES_DA_CC_ES007.reuniao.metas, c)).toContain('mostrou-o-video-com-som');
  });

  it('a ata sem dono e sem prazo não fecha, por mais decisões que tenha', () => {
    /* "Ficou combinado que alguém vai ver o som" registrou que a reunião
       aconteceu e mais nada. */
    const c = SOLUCOES.pauta(contextoInicial('pauta'));
    const semDono = mandar(com(c, {
      caixa: {
        ...c.caixa,
        mensagens: c.caixa.mensagens.filter(m => !m.assunto.startsWith('Ata')),
      },
    }), {
      para: DIRECAO.slice(0, 3).map(d => d.endereco),
      assunto: 'Ata da reunião do conselho',
      corpo: 'Decisões:\n'
        + '- Ficou combinado que alguém vai ver o material da ordem unida\n'
        + '- A prestação de contas vai ser feita\n',
    });
    expect(faltam(LICOES_DA_CC_ES007.pauta.metas, semDono))
      .toContain('mandou-a-ata-com-dono-e-prazo');
  });

  it('a pauta em parágrafo não é pauta', () => {
    const c = contextoInicial('pauta');
    const corrido = mandar(c, {
      para: DIRECAO.slice(0, 3).map(d => d.endereco),
      assunto: 'Pauta da reunião',
      corpo: 'Vamos falar do acampamento, da escala e de mais umas coisas.',
    });
    expect(faltam(LICOES_DA_CC_ES007.pauta.metas, corrido)).toContain('mandou-a-pauta-antes');
  });

  it('e mandar a pauta com a caixa bagunçada deixa as duas vermelhas', () => {
    /* A caixa arrumada é **condição**, e não item da lista: verdadeira quase
       no segundo zero, ela ensinaria a não ler a lista. */
    const c = contextoInicial('pauta');
    const so_mandou = SOLUCOES.pauta({ ...c, caixa: c.caixa });
    const bagunçada = com(so_mandou, {
      caixa: { ...so_mandou.caixa,
        mensagens: so_mandou.caixa.mensagens.map(m => (m.id === 'onibus-confirmado'
          ? { ...m, pasta: 'entrada' as const } : m)) },
    });
    expect(faltam(LICOES_DA_CC_ES007.pauta.metas, bagunçada)).toHaveLength(2);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   A classificação cobre a caixa inteira
   ──────────────────────────────────────────────────────────────────────── */

describe('toda mensagem da caixa está classificada', () => {
  it('as duas listas juntas cobrem a caixa de entrada inteira, sem sobrar nem repetir', () => {
    /*
      Mensagem nova sem classificação reprova aqui, do jeito que
      `ofensiva.test.ts` cobra que todo evento esteja de um dos dois lados. Sem
      isto, acrescentar uma mensagem ao fixture a deixaria de fora das duas
      contas em silêncio: a meta continuaria fechando, e a caixa ficaria com
      uma mensagem que ninguém precisa decidir.
    */
    const naEntrada = naPasta(contextoInicial('caixa').caixa, 'entrada').map(m => m.id);
    const classificadas = [...PEDEM_ACAO, ...NAO_PEDEM_NADA];
    expect([...naEntrada].sort()).toEqual([...classificadas].sort());
  });

  it('e as do módulo 12 também', () => {
    const chegaram = CHEGARAM_DEPOIS.map(m => m.id);
    const classificadas = [...PEDEM_ACAO_DEPOIS, ...NAO_PEDEM_NADA_DEPOIS];
    expect([...chegaram].sort()).toEqual([...classificadas].sort());
  });

  it('o módulo 12 parte da caixa já arrumada pelo módulo 4', () => {
    /* Começar mandando refazer a lição anterior ensinaria que o trabalho de
       antes não conta. É o campo `documento` da CC-ES002 outra vez. */
    const c = contextoInicial('pauta');
    for (const id of NAO_PEDEM_NADA)
      expect(naPasta(c.caixa, 'arquivadas').some(m => m.id === id), id).toBe(true);
    expect(naPasta(c.caixa, 'entrada').map(m => m.id).sort())
      .toEqual([...PEDEM_ACAO, ...CHEGARAM_DEPOIS.map(m => m.id)].sort());
  });
});

/* ── O rascunho de partida ─────────────────────────────────────────────────── */

describe('o rascunho do módulo 2 chega errado nas quatro coisas', () => {
  it('assunto vago, sem saudação, sem pedido com prazo e sem assinatura', () => {
    /* Se ele chegasse certo em alguma delas, aquela meta abriria verde — e a
       trava de cima já reprovaria. Esta nomeia **qual** das quatro, que é o
       que "alguma meta abriu verde" não diz. */
    const c = mandar(contextoInicial('mensagem'), RASCUNHO_DO_ONIBUS);
    expect(faltam(LICOES_DA_CC_ES007.mensagem.metas, c)).toHaveLength(4);
  });

  it('e o rascunho carrega os três fatos que a reescrita não pode perder', () => {
    for (const f of ['3 de julho', '6h', 'Igreja Central']) {
      expect(RASCUNHO_DO_ONIBUS.corpo, f).toContain(f);
    }
  });
});

/* ── Os números que as metas citam ─────────────────────────────────────────── */

describe('os números que as metas citam são os que elas conferem', () => {
  it('a pauta e a ata pedem o que os passos dizem', () => {
    expect(ITENS_MINIMOS_DA_PAUTA).toBeGreaterThanOrEqual(3);
    expect(DECISOES_MINIMAS_DA_ATA).toBeGreaterThanOrEqual(2);
    const passos = LICOES_DA_CC_ES007.pauta.metas.flatMap(m => m.passos).join(' ');
    expect(passos).toContain(String(ITENS_MINIMOS_DA_PAUTA));
    expect(passos).toContain(String(DECISOES_MINIMAS_DA_ATA));
  });

  it('e o limite do anexo aparece escrito para quem travar', () => {
    const passos = LICOES_DA_CC_ES007.pesado.metas.flatMap(m => [m.detalhe, ...m.passos]).join(' ');
    expect(passos).toContain('180');
  });
});

/* ── Quem é o dono de cada lição ───────────────────────────────────────────── */

describe('cada lição diz em qual dos três programas ela acontece', () => {
  it('as doze declaram um programa que existe', () => {
    /*
      O campo é `programa` porque o que muda entre as lições não é o que elas
      **são** — é em qual janela abrem. A tela despacha por `switch` exaustivo
      com `never` no `default`: a décima terceira não compila até alguém dizer
      onde ela acontece.
    */
    const contagem = { correio: 0, calendario: 0, sala: 0 };
    for (const l of TODAS) contagem[LICOES_DA_CC_ES007[l].programa] += 1;
    expect(contagem.correio).toBe(7);
    expect(contagem.calendario).toBe(4);
    expect(contagem.sala).toBe(1);
  });

  it('e só a do módulo 2 abre com um rascunho pronto', () => {
    const comRascunho = TODAS.filter(l => LICOES_DA_CC_ES007[l].rascunho);
    expect(comRascunho).toEqual(['mensagem']);
  });
});
