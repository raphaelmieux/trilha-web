import { describe, expect, it } from 'vitest';
import {
  type Evento,
  CALENDARIO_DO_CLUBE, CONVIDADOS_DA_REUNIAO, DIAS_DE_UM_MES_PLANEJADO, DIA_DA_REUNIAO,
  FUSO_DE_BRASILIA, FUSO_DO_ACRE, GRADE, JULHO, MARCIO_SO_DEPOIS_DE, NIVEIS,
  OQUE_O_NIVEL_NAO_DEIXA,
  agendaDoClube, apagarEvento, cancelarOcorrencia, compartilharCalendario, criarEvento,
  diaEm, diasPlanejados, estadoEm, eventoDe, horaEm, horaPara, instanteDe, janelasLivres,
  mudarDaquiEmDiante, mudarEvento, naoChegaram, nivelDe, ocorrencias, oQuePublicoMostra,
  podeAlterar, podeGerenciar, podeVerDetalhes, publicarCalendario, quemPodeApagar,
  responder, responderam, semAgendaCompartilhada, serieTemFim, temDescricao, temLocal,
  trocarConvidado,
} from './agenda';

const evento = (p: Partial<Evento>): Evento => ({
  id: 'e', titulo: 'Reunião', local: 'Sala da secretaria',
  descricao: 'Reunião mensal do conselho para fechar as contas do acampamento e a escala.',
  dia: '2026-07-08', inicio: '15:00', fim: '16:30',
  fuso: FUSO_DE_BRASILIA, convidados: [], calendario: CALENDARIO_DO_CLUBE,
  ...p,
});

describe('o fuso se diz pelo nome', () => {
  it('o mesmo instante mostra horas diferentes em fusos diferentes', () => {
    const i = instanteDe('2026-07-08', '15:00', FUSO_DE_BRASILIA);
    expect(horaEm(i, FUSO_DE_BRASILIA)).toBe('15:00');
    expect(horaEm(i, FUSO_DO_ACRE)).toBe('13:00');
    expect(diaEm(i, FUSO_DE_BRASILIA)).toBe('2026-07-08');
  });

  it('combinar 15h com quem está no Acre e criar em Brasília o põe às 13h', () => {
    /*
      É o requisito 2.5 inteiro, e não estoura em lugar nenhum: as duas agendas
      concordam, os dois convites estão certos, e a pessoa entra na reunião
      duas horas antes de ela existir.
    */
    const errado = evento({ fuso: FUSO_DE_BRASILIA });
    expect(horaPara(errado, FUSO_DO_ACRE)).toBe('13:00');

    const certo = evento({ fuso: FUSO_DO_ACRE });
    expect(horaPara(certo, FUSO_DO_ACRE)).toBe('15:00');
    expect(horaPara(certo, FUSO_DE_BRASILIA)).toBe('17:00');
  });

  it('escrever o fuso na descrição não muda o horário de ninguém', () => {
    /*
      A descrição fica certa, o campo fica errado, e quem lê confia no
      calendário — que é o que o calendário existe para ser. É o "Figura 1"
      digitado da CC-ES002, com outro assunto.
    */
    const so_na_descricao = evento({
      fuso: FUSO_DE_BRASILIA,
      descricao: 'Reunião regional às 15h, horário do Acre. Levar o relatório do semestre.',
    });
    expect(so_na_descricao.descricao).toContain('Acre');
    expect(horaPara(so_na_descricao, FUSO_DO_ACRE)).toBe('13:00');
  });

  it('a virada do dia também muda de fuso', () => {
    const tarde = evento({ dia: '2026-07-08', inicio: '23:30', fuso: FUSO_DO_ACRE });
    expect(diaEm(instanteDe(tarde.dia, tarde.inicio, tarde.fuso), FUSO_DE_BRASILIA))
      .toBe('2026-07-09');
  });
});

describe('o evento diz onde e o quê', () => {
  it('sem local não estoura, e é por isso que a conta existe', () => {
    expect(temLocal(evento({ local: '' }))).toBe(false);
    expect(temLocal(evento({ local: '  ' }))).toBe(false);
    expect(temLocal(evento({}))).toBe(true);
  });

  it('descrição de uma palavra não é descrição', () => {
    expect(temDescricao(evento({ descricao: 'reunião' }))).toBe(false);
    expect(temDescricao(evento({ descricao: '' }))).toBe(false);
    expect(temDescricao(evento({}))).toBe(true);
  });
});

describe('o que se repete', () => {
  const semanal = evento({
    id: 'sabado', dia: '2026-06-27', inicio: '14:00', fim: '17:00',
    repete: { cada: 'semana', ate: '2026-08-29', pulados: [] },
  });

  it('a série semanal cai nos sábados seguintes', () => {
    expect(ocorrencias(semanal, '2026-06-27', '2026-07-31'))
      .toEqual(['2026-06-27', '2026-07-04', '2026-07-11', '2026-07-18', '2026-07-25']);
  });

  it('cancelar uma ocorrência deixa a série de pé', () => {
    /*
      A caixa do calendário oferece três opções em letra miúda, e "todos os
      eventos" apaga o ano inteiro para desmarcar um sábado. Não pergunta de
      novo, e o que sumiu sumiu da agenda de todo mundo ao mesmo tempo.
    */
    const a = criarEvento(agendaDoClube(), semanal);
    const depois = cancelarOcorrencia(a, 'sabado', '2026-07-04');
    const serie = eventoDe(depois, 'sabado');
    expect(serie).toBeDefined();
    expect(ocorrencias(serie as Evento, '2026-06-27', '2026-07-31'))
      .not.toContain('2026-07-04');
    expect(ocorrencias(serie as Evento, '2026-06-27', '2026-07-31')).toHaveLength(4);
  });

  it('e apagar a série leva os cinco sábados junto', () => {
    const a = criarEvento(agendaDoClube(), semanal);
    expect(eventoDe(apagarEvento(a, 'sabado'), 'sabado')).toBeUndefined();
  });

  it('"este e os seguintes" não reescreve o que já aconteceu', () => {
    const a = criarEvento(agendaDoClube(), semanal);
    const depois = mudarDaquiEmDiante(a, 'sabado', '2026-07-18', { inicio: '15:00' });
    const velha = eventoDe(depois, 'sabado') as Evento;
    const nova = depois.eventos.find(e => e.id !== 'sabado' && e.inicio === '15:00') as Evento;

    expect(velha.inicio).toBe('14:00');
    expect(ocorrencias(velha, '2026-06-27', '2026-08-29'))
      .toEqual(['2026-06-27', '2026-07-04', '2026-07-11']);
    expect(ocorrencias(nova, '2026-06-27', '2026-08-29'))
      .toEqual(['2026-07-18', '2026-07-25', '2026-08-01', '2026-08-08', '2026-08-15',
        '2026-08-22', '2026-08-29']);
  });

  it('série sem fim declarado é infinita de verdade', () => {
    const paraSempre = evento({
      dia: '2026-06-27', repete: { cada: 'semana', ate: '', pulados: [] },
    });
    expect(serieTemFim(paraSempre)).toBe(false);
    expect(ocorrencias(paraSempre, '2075-01-01', '2075-02-01').length).toBeGreaterThan(0);
    expect(serieTemFim(semanal)).toBe(true);
    expect(serieTemFim(evento({}))).toBe(true);
  });

  it('a série mensal anda de mês e não de trinta dias', () => {
    const mensal = evento({
      dia: '2026-01-31', repete: { cada: 'mes', ate: '2026-05-31', pulados: [] },
    });
    /* Fevereiro não tem 31: o passo cai no dia seguinte, e o que não pode é o
       laço andar para trás ou parar. */
    const dias = ocorrencias(mensal, '2026-01-01', '2026-05-31');
    expect(dias[0]).toBe('2026-01-31');
    expect(dias.length).toBeGreaterThanOrEqual(4);
    expect([...dias].sort()).toEqual(dias);
  });
});

describe('os níveis do calendário', () => {
  const clube = () => agendaDoClube().calendarios[0];

  it('cada nível tem escrito o que ele não deixa fazer', () => {
    /* Um nível sem esse lado seria a plataforma recomendando dentro do
       programa imitado, e a escolha do requisito 5.4 deixaria de ser da
       pessoa. É a decisão dos métodos de duas etapas da CC-ES005. */
    expect(NIVEIS.length).toBe(4);
    for (const n of NIVEIS) expect(OQUE_O_NIVEL_NAO_DEIXA[n].length).toBeGreaterThan(20);
  });

  it('ver detalhes não deixa alterar, e alterar não deixa dar acesso', () => {
    const a = compartilharCalendario(agendaDoClube(), CALENDARIO_DO_CLUBE,
      'aguia@clubepioneiros.org.br', 'ver-detalhes');
    const b = compartilharCalendario(a, CALENDARIO_DO_CLUBE,
      'diretor@clubepioneiros.org.br', 'alterar');
    const cal = b.calendarios[0];

    expect(podeVerDetalhes(cal, 'aguia@clubepioneiros.org.br')).toBe(true);
    expect(podeAlterar(cal, 'aguia@clubepioneiros.org.br')).toBe(false);
    expect(podeAlterar(cal, 'diretor@clubepioneiros.org.br')).toBe(true);
    expect(podeGerenciar(cal, 'diretor@clubepioneiros.org.br')).toBe(false);
    expect(podeGerenciar(cal, 'voce')).toBe(true);
  });

  it('quem só vê livre/ocupado não vê nem os detalhes', () => {
    const a = compartilharCalendario(agendaDoClube(), CALENDARIO_DO_CLUBE,
      'familia01@exemplo.com', 'livre-ocupado');
    expect(nivelDe(a.calendarios[0], 'familia01@exemplo.com')).toBe('livre-ocupado');
    expect(podeVerDetalhes(a.calendarios[0], 'familia01@exemplo.com')).toBe(false);
  });

  it('dar "fazer alterações" a todo mundo põe o acampamento ao alcance de todo mundo', () => {
    let a = agendaDoClube();
    for (const q of ['aguia', 'falcao', 'tucano', 'arara'])
      a = compartilharCalendario(a, CALENDARIO_DO_CLUBE, q, 'alterar');
    expect(quemPodeApagar(a.calendarios[0]).length).toBe(5);

    let b = agendaDoClube();
    for (const q of ['aguia', 'falcao', 'tucano', 'arara'])
      b = compartilharCalendario(b, CALENDARIO_DO_CLUBE, q, 'ver-detalhes');
    expect(quemPodeApagar(b.calendarios[0])).toEqual(['voce']);
  });

  it('o calendário público leva a descrição de cada evento junto', () => {
    /* É o que ninguém espera de "publicar os horários": a descrição é onde se
       escreve o telefone de quem abre o salão, e ela vai inteira. */
    const fechado = agendaDoClube();
    expect(oQuePublicoMostra(fechado.eventos, clube())).toEqual([]);

    const aberto = publicarCalendario(fechado, CALENDARIO_DO_CLUBE, true);
    const expostas = oQuePublicoMostra(aberto.eventos, aberto.calendarios[0]);
    expect(expostas.length).toBeGreaterThan(0);
    expect(expostas.join(' ')).toContain('autorização assinada');
  });
});

describe('a disponibilidade responde sobre o que ela consultou', () => {
  const dia = DIA_DA_REUNIAO;

  it('quem não compartilhou aparece sem informação, e não livre', () => {
    /*
      Livre e desconhecido cabem no mesmo espaço em branco, e é aí que o
      requisito 5.5 acontece. Devolver 'livre' aqui seria o programa afirmando
      uma coisa que ele não tem como saber.
    */
    const marcio = CONVIDADOS_DA_REUNIAO.find(p => !p.compartilha);
    expect(marcio).toBeDefined();
    expect(estadoEm(marcio as never, dia, '12:00', '13:30')).toBe('sem-acesso');
    expect(semAgendaCompartilhada(CONVIDADOS_DA_REUNIAO).map(p => p.nome))
      .toEqual(['Tio Márcio (Arara)']);
  });

  it('quem compartilhou aparece livre ou ocupado', () => {
    const samuel = CONVIDADOS_DA_REUNIAO[0];
    expect(estadoEm(samuel, dia, '14:00', '15:00')).toBe('ocupado');
    expect(estadoEm(samuel, dia, '15:30', '16:00')).toBe('livre');
    /* O encosto não é choque: quem termina às 15:30 está livre às 15:30. */
    expect(estadoEm(samuel, dia, '10:00', '11:00')).toBe('livre');
  });

  it('a grade acha as janelas em que ninguém visível está ocupado', () => {
    const j = janelasLivres(CONVIDADOS_DA_REUNIAO, dia, GRADE.de, GRADE.ate, GRADE.duracao);
    expect(j.length).toBeGreaterThan(0);
    expect(j.map(x => x.inicio)).toContain('12:00');
    expect(j.map(x => x.inicio)).toContain('18:00');
    expect(j.map(x => x.inicio)).not.toContain('14:00');
    expect(j.map(x => x.inicio)).not.toContain('09:00');
  });

  it('e quem não compartilhou não apaga as janelas dos outros', () => {
    /*
      Tratar "sem acesso" como ocupado deixaria a grade vazia e ensinaria que
      não dá para marcar nada — que é o contrário do que o requisito pede.
      A janela existe; o que ela não diz é se o Márcio pode.
    */
    const so_os_tres = CONVIDADOS_DA_REUNIAO.filter(p => p.compartilha);
    expect(janelasLivres(CONVIDADOS_DA_REUNIAO, dia, GRADE.de, GRADE.ate, GRADE.duracao))
      .toEqual(janelasLivres(so_os_tres, dia, GRADE.de, GRADE.ate, GRADE.duracao));
  });

  it('a janela que a grade oferece primeiro é justamente a que ele não pode', () => {
    /* Sem isto a lição seria "clique na primeira janela": a armadilha é que
       a grade parece completa, e a pessoa que falta é a que ela não viu. */
    const j = janelasLivres(CONVIDADOS_DA_REUNIAO, dia, GRADE.de, GRADE.ate, GRADE.duracao);
    expect(j[0].inicio < MARCIO_SO_DEPOIS_DE).toBe(true);
    expect(j.some(x => x.inicio >= MARCIO_SO_DEPOIS_DE)).toBe(true);
  });
});

describe('os convites', () => {
  const comConvidados = evento({
    convidados: [
      { endereco: 'a@exemplo.com', resposta: 'sim' },
      { endereco: 'b@exemplo.com', resposta: 'nao' },
      { endereco: 'c@exemplo.com', resposta: 'talvez' },
      { endereco: 'd@exemplo.com', resposta: 'aguardando' },
      { endereco: 'tio.samuel@exmplo.com', resposta: 'aguardando', naoChegou: true },
    ],
  });

  it('"aguardando" cobre duas situações diferentes, e uma delas nunca muda', () => {
    expect(responderam(comConvidados, 'aguardando')).toHaveLength(2);
    expect(naoChegaram(comConvidados).map(c => c.endereco)).toEqual(['tio.samuel@exmplo.com']);
  });

  it('e quem nunca recebeu não consegue responder', () => {
    const a = criarEvento(agendaDoClube(), comConvidados);
    const depois = responder(a, 'e', 'tio.samuel@exmplo.com', 'sim');
    const perdido = (eventoDe(depois, 'e') as Evento).convidados.find(c => c.naoChegou);
    expect(perdido?.resposta).toBe('aguardando');
  });

  it('quem recebeu responde', () => {
    const a = criarEvento(agendaDoClube(), comConvidados);
    const depois = responder(a, 'e', 'd@exemplo.com', 'sim');
    expect(responderam(eventoDe(depois, 'e') as Evento, 'sim')).toHaveLength(2);
  });
});

describe('o mês planejado', () => {
  it('a agenda de partida não tem mês planejado nenhum', () => {
    /* Se tivesse, a meta do requisito 8 abriria verde. */
    const dias = diasPlanejados(agendaDoClube(), CALENDARIO_DO_CLUBE, JULHO.de, JULHO.ate);
    expect(dias.length).toBeLessThan(DIAS_DE_UM_MES_PLANEJADO);
  });

  it('os quatro sábados, a saída e o conselho do mês fecham a conta', () => {
    /*
      Quatro sábados e a saída dão cinco: o mês planejado pede que alguém tenha
      posto também o que é daquele mês. Julho tem quatro sábados, e o número
      não pode ser alcançável só pela série — se fosse, criar a recorrência no
      módulo 9 já deixaria a meta do requisito 8 verde dois módulos antes.
    */
    const comSerie = criarEvento(agendaDoClube(), evento({
      id: 'sabado', dia: '2026-07-04', inicio: '14:00', fim: '17:00',
      repete: { cada: 'semana', ate: '2026-12-19', pulados: [] },
    }));
    expect(diasPlanejados(comSerie, CALENDARIO_DO_CLUBE, JULHO.de, JULHO.ate).length)
      .toBeLessThan(DIAS_DE_UM_MES_PLANEJADO);

    const completo = criarEvento(comSerie, evento({
      id: 'conselho-julho', dia: '2026-07-28', inicio: '19:30', fim: '21:00',
    }));
    expect(diasPlanejados(completo, CALENDARIO_DO_CLUBE, JULHO.de, JULHO.ate).length)
      .toBeGreaterThanOrEqual(DIAS_DE_UM_MES_PLANEJADO);
  });

  it('e o que está na minha agenda não conta como mês do clube', () => {
    const a = mudarEvento(agendaDoClube(), 'dentista', { dia: '2026-07-10' });
    expect(diasPlanejados(a, CALENDARIO_DO_CLUBE, JULHO.de, JULHO.ate))
      .not.toContain('2026-07-10');
  });
});

describe('consertar o endereço do convite', () => {
  const comErro = {
    id: 'reg', titulo: 'Reunião regional', local: 'Sala 2',
    descricao: 'Fechamento do semestre com os clubes da região e o calendário de 2027.',
    dia: '2026-07-08', inicio: '15:00', fim: '16:30',
    fuso: FUSO_DE_BRASILIA, calendario: CALENDARIO_DO_CLUBE,
    convidados: [
      { endereco: 'tio.samuel@exmplo.com', resposta: 'aguardando' as const, naoChegou: true },
      { endereco: 'aguia@clubepioneiros.org.br', resposta: 'sim' as const },
    ],
  };

  it('o convidado novo entra aguardando, e não confirmado', () => {
    /* Quem acabou de receber ainda não respondeu. Dar por respondido seria a
       plataforma decidindo por ele — e apagaria o gesto de acompanhar, que é
       o que o requisito 5.2 pede. */
    const a = criarEvento(agendaDoClube(), comErro);
    const depois = trocarConvidado(a, 'reg', 'tio.samuel@exmplo.com',
      'falcao@clubepioneiros.org.br');
    const e = eventoDe(depois, 'reg') as Evento;
    expect(naoChegaram(e)).toEqual([]);
    expect(e.convidados.map(c => c.endereco)).toContain('falcao@clubepioneiros.org.br');
    expect(responderam(e, 'aguardando')).toHaveLength(1);
    /* E quem já tinha respondido não é mexido. */
    expect(responderam(e, 'sim')).toHaveLength(1);
  });
});
