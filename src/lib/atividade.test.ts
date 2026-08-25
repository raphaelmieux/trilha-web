import { describe, it, expect } from 'vitest';
import { descreverAtividade, trilhaDoEvento, laboratorioDoEvento } from './atividade';

/*
  O painel de atividade mostrava o tipo do evento cru: "lesson completed",
  "certification issued", "file manager completed". Em inglês, e sem dizer de
  qual trilha nem de qual lição — sobrava a data, que sozinha não conta nada.

  O que se vigia aqui: que a trilha seja encontrada em qualquer um dos formatos
  em que os eventos foram gravados ao longo do tempo, e que a lição seja nomeada
  pelo título que a pessoa viu na tela.
*/

describe('achar a trilha do evento', () => {
  it('pelo campo direto', () => {
    expect(trilhaDoEvento({ event_type: 'x', metadata: { specialtyCode: 'AP041' } })).toBe('AP041');
  });

  /* A página de lição grava o código da trilha na coluna de versão do
     currículo — é onde ele coube quando a função foi escrita. */
  it('pela coluna de versão do currículo', () => {
    expect(trilhaDoEvento({ event_type: 'x', curriculum_version: 'AP035' })).toBe('AP035');
  });

  it('pelo prefixo do código da lição', () => {
    expect(trilhaDoEvento({ event_type: 'x', metadata: { lessonCode: 'AP041.5-L1' } })).toBe('AP041');
  });

  it('pelo prefixo do código do requisito', () => {
    expect(trilhaDoEvento({ event_type: 'x', metadata: { requirementCode: 'AP034-6.1' } })).toBe('AP034');
  });

  it('não inventa trilha quando não há de onde tirar', () => {
    expect(trilhaDoEvento({ event_type: 'x' })).toBeUndefined();
    expect(trilhaDoEvento({ event_type: 'x', curriculum_version: '1.0' })).toBeUndefined();
  });
});

describe('descrever o que a pessoa fez', () => {
  it('nomeia a lição concluída pelo título que ela viu', () => {
    const d = descreverAtividade({
      event_type: 'lesson_completed',
      metadata: { lessonCode: 'AP041.3-L1', score: 5, total: 5 },
      curriculum_version: 'AP041',
    });
    expect(d.trilha).toBe('AP041');
    expect(d.texto).toBe('Lição concluída: Levar para dentro: teclado, mouse e scanner');
    expect(d.detalhe).toBe('5 de 5');
  });

  /*
    Os eventos gravados antes de os laboratórios registrarem a lição.

    Eles trazem só o próprio nome no tipo do evento. Como cada trilha usa um
    laboratório uma vez só — há teste garantindo isso —, o tipo do laboratório
    ainda basta para achar a lição, e o histórico continua legível.
  */
  it('acha a lição do laboratório pelo tipo do evento', () => {
    const d = descreverAtividade({
      event_type: 'file_manager_completed',
      metadata: { specialtyCode: 'AP041' },
    });
    expect(d.texto).toBe('Laboratório concluído: Mexendo em pastas e arquivos');
  });

  it('descreve o certificado com o código dele', () => {
    const d = descreverAtividade({
      event_type: 'certification_issued',
      metadata: { specialtyCode: 'AP034', certCode: 'TW-AAAA-BBBB' },
    });
    expect(d.trilha).toBe('AP034');
    expect(d.texto).toBe('Certificado emitido');
    expect(d.detalhe).toBe('TW-AAAA-BBBB');
  });

  it('descreve a avaliação final com a nota', () => {
    const d = descreverAtividade({
      event_type: 'final_exam_completed',
      metadata: { specialtyCode: 'AP035', score: 18, total: 22 },
    });
    expect(d.texto).toBe('Avaliação final concluída');
    expect(d.detalhe).toBe('18 de 22');
  });

  it('nomeia o relatório enviado pela lição de redação da trilha', () => {
    const d = descreverAtividade({
      event_type: 'text_submitted',
      metadata: { specialtyCode: 'AP041' },
    });
    expect(d.texto).toBe('Relatório enviado: Escrevendo sobre a história dos computadores');
  });

  it('descreve os passos de dentro dos laboratórios', () => {
    expect(descreverAtividade({ event_type: 'mail_sent' }).texto).toBe('E-mail enviado no laboratório');
    expect(descreverAtividade({ event_type: 'text_saved' }).texto).toBe('Rascunho do texto salvo');
  });

  it('nomeia o laboratório pelo código da lição quando ele foi gravado', () => {
    const d = descreverAtividade({
      event_type: 'web_lab_completed',
      metadata: { specialtyCode: 'AP034', lessonCode: 'AP034.6-L1' },
    });
    expect(d.texto).toBe('Laboratório concluído: Navegando e pesquisando com cuidado');
  });

  /* Do laboratório de pré-requisito, aposentado; os eventos dele continuam no
     banco e continuam legíveis. */
  it('ainda descreve o que o laboratório aposentado gravou', () => {
    expect(descreverAtividade({ event_type: 'prerequisite_verified' }).texto).toBe('Pré-requisito conferido');
  });

  /*
    O histórico de quem usou a plataforma antes de os laboratórios gravarem a
    trilha: do evento vem só o tipo. Como cada laboratório é usado uma vez em
    todo o currículo, o tipo devolve a lição e, por ela, a trilha.
  */
  it('recupera trilha e lição de um evento que não guardou nada', () => {
    const d = descreverAtividade({ event_type: 'file_manager_completed' });
    expect(d.trilha).toBe('AP041');
    expect(d.texto).toBe('Laboratório concluído: Mexendo em pastas e arquivos');
  });

  /* Evento novo não some da lista: aparece legível o bastante para alguém
     perceber que falta descrevê-lo. */
  it('não engole um tipo que ainda não tem frase', () => {
    const d = descreverAtividade({ event_type: 'algo_novo_aconteceu' });
    expect(d.texto).toBe('Algo novo aconteceu');
  });

  it('descreve mesmo sem saber a trilha', () => {
    const d = descreverAtividade({ event_type: 'lesson_completed', metadata: {} });
    expect(d.trilha).toBeUndefined();
    expect(d.texto).toBe('Lição concluída');
  });

  it('não quebra com metadata ausente', () => {
    expect(() => descreverAtividade({ event_type: 'lesson_completed', metadata: null })).not.toThrow();
  });
});

/*
  De qual laboratório o evento fala.

  Três insígnias de laboratório não podiam ser conquistadas por ninguém:
  `lab_text_editor`, `lab_redacao_guiada` e `lab_table_challenge`. A linha
  existia na tabela e o critério estava escrito, mas o motor procurava o
  laboratório num mapa de tipo de evento — e esses três não têm evento próprio.
  Os dois de escrita gravam `text_submitted`, e o de tabela é o CodeLab noutra
  variante, gravando `code_lab_completed` igual à lição de HTML.

  Nada disso aparecia na tela: a pessoa concluía o laboratório e simplesmente
  não ganhava nada, sem erro em lugar nenhum.
*/
describe('o laboratório de que o evento fala', () => {
  it('sai do mapa, quando o tipo do evento basta', () => {
    expect(laboratorioDoEvento({ event_type: 'file_manager_completed' })).toBe('file_manager');
    expect(laboratorioDoEvento({ event_type: 'web_lab_completed' })).toBe('web_lab');
  });

  /* As duas mecânicas de escrita gravam o mesmo evento; quem desempata é a
     lição, que sabe qual delas usa. */
  it('distingue a redação guiada do editor de texto pela lição', () => {
    expect(laboratorioDoEvento({
      event_type: 'text_submitted',
      metadata: { specialtyCode: 'AP041', lessonCode: 'AP041.1-L2' },
    })).toBe('redacao_guiada');
  });

  /* O desafio da tabela e a lição de HTML convivem na AP035 e gravam o mesmo
     evento — sem a lição, não haveria como saber qual foi. */
  it('distingue o desafio da tabela da lição de HTML', () => {
    expect(laboratorioDoEvento({
      event_type: 'code_lab_completed',
      metadata: { specialtyCode: 'AP035', lessonCode: 'AP035.3-L1' },
    })).toBe('table_challenge');
  });

  /* Evento antigo do editor de texto, gravado sem a lição: dentro de uma
     trilha, a lição de escrita é uma só. */
  it('resolve a entrega antiga pela trilha, sem a lição', () => {
    expect(laboratorioDoEvento({
      event_type: 'text_submitted',
      metadata: { specialtyCode: 'AP034' },
    })).toBe('redacao_guiada');
  });

  it('não chuta quando não há como saber', () => {
    expect(laboratorioDoEvento({ event_type: 'text_submitted' })).toBeUndefined();
    expect(laboratorioDoEvento({ event_type: 'coisa_que_nao_existe' })).toBeUndefined();
  });
});
