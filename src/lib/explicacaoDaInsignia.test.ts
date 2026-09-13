import { describe, it, expect } from 'vitest';
import {
  explicarInsignia, explicacaoEmUmaLinha, dataPorExtenso, nomeDoPercurso,
} from './explicacaoDaInsignia';
import { ESCADAS } from './escadasDeInsignia';
import { getOpenSpecialties } from '../curriculum';
import { veredasAbertas } from '../curriculum/veredas';
import type { InsigniaConquistada } from './conquista';

/*
  As três frases que explicam uma insígnia.

  A estante mostrava o desenho e o nome: "Coruja", com uma coruja dentro. Quem
  ganhou sabia que ganhou e não sabia por quê — e recompensa que não se liga a
  um feito não recompensa feito nenhum, vira enfeite.

  O risco de consertar isso é inventar. Duas das três frases dependem de dados
  que **podem não existir**: o percurso só passou a ser gravado agora, e toda
  insígnia já conquistada tem contexto vazio. Preencher o buraco com um palpite
  seria afirmar o que não foi conferido, que é o oposto da assimetria que o
  `umDe` estabeleceu.
*/

const insignia = (mudancas: Partial<InsigniaConquistada> = {}): InsigniaConquistada => ({
  id: 'x', code: 'coruja', name: 'Coruja',
  description: 'Estudou entre a meia-noite e as cinco da manhã.',
  icon: 'clock', tier: 'companheiro',
  ...mudancas,
});

describe('o feito', () => {
  /* Sempre existe: sai da descrição do catálogo, que toda insígnia tem. */
  it('diz o que foi preciso fazer, mesmo sem contexto nenhum', () => {
    expect(explicarInsignia(insignia()).feito)
      .toBe('Estudou entre a meia-noite e as cinco da manhã.');
  });

  it('nomeia a família nas de escada, e cala nas de identidade', () => {
    const degrau = ESCADAS[0].degraus[0];
    expect(explicarInsignia(insignia({ code: degrau.code })).familia).toBe(ESCADAS[0].familia);
    expect(explicarInsignia(insignia({ code: 'lab_planilha' })).familia).toBeUndefined();
  });
});

describe('onde — e o que fazer quando não se sabe', () => {
  it('nomeia a trilha pelo código gravado', () => {
    const trilha = getOpenSpecialties()[0];
    const e = explicarInsignia(insignia({ contexto: { percurso: trilha.code } }));
    expect(e.onde).toContain(trilha.code);
    expect(e.onde).toContain(trilha.name);
  });

  it('nomeia a vereda também, pelo mesmo caminho', () => {
    const vereda = veredasAbertas()[0];
    expect(explicarInsignia(insignia({ contexto: { percurso: vereda.code } })).onde)
      .toContain(vereda.name);
  });

  /*
    Toda insígnia já conquistada tem `context` vazio — foi assim desde a
    migration original, e é assim na estante de todo mundo hoje. A frase
    some; ela não vira "em AP034" nem "em algum lugar".
  */
  it('cala quando o contexto está vazio, em vez de inventar', () => {
    expect(explicarInsignia(insignia()).onde).toBeUndefined();
    expect(explicarInsignia(insignia({ contexto: {} })).onde).toBeUndefined();
  });

  /* E cala também quando o código gravado não corresponde a percurso nenhum:
     um dump antigo, um percurso renomeado. Sigla solta na tela não explica. */
  it('cala quando o código gravado não existe no currículo', () => {
    expect(explicarInsignia(insignia({ contexto: { percurso: 'ZZ999' } })).onde)
      .toBeUndefined();
    expect(nomeDoPercurso('ZZ999')).toBeUndefined();
  });
});

describe('quando', () => {
  /*
    A data é de Brasília, e o fuso se diz pelo nome.

    Sem `timeZone`, `toLocaleDateString` usa o do aparelho — o mesmo erro que a
    ofensiva já custou: quem estuda às 22h, que é quando o clube se reúne,
    veria a conquista datada do dia seguinte.
  */
  it('usa Brasília, e não o fuso do aparelho', () => {
    /* 2026-03-02T01:30:00Z é ainda 1º de março às 22h30 em Brasília. */
    expect(dataPorExtenso('2026-03-02T01:30:00Z')).toContain('01 de março');
  });

  it('formata por extenso, em português', () => {
    expect(dataPorExtenso('2026-09-13T15:00:00Z')).toBe('13 de setembro de 2026');
  });

  it('cala diante de uma data ilegível, em vez de escrever "Invalid Date"', () => {
    expect(dataPorExtenso('nem data')).toBeUndefined();
    expect(explicarInsignia(insignia({ conquistadaEm: 'nem data' })).quando).toBeUndefined();
  });

  it('cala quando a linha não trouxe data', () => {
    expect(explicarInsignia(insignia()).quando).toBeUndefined();
  });
});

describe('a frase única do aviso', () => {
  /*
    O aviso tem três elementos e aparece por segundos: uma lista de três itens
    ali obrigaria a ler correndo o que não dá tempo de ler.
  */
  it('junta o feito e o percurso numa linha', () => {
    const trilha = getOpenSpecialties()[0];
    const linha = explicacaoEmUmaLinha(insignia({ contexto: { percurso: trilha.code } }));
    expect(linha).toContain('Estudou entre a meia-noite');
    expect(linha).toContain(trilha.name);
  });

  it('sem percurso, é só o feito — e nunca um travessão solto', () => {
    expect(explicacaoEmUmaLinha(insignia()))
      .toBe('Estudou entre a meia-noite e as cinco da manhã.');
  });
});
