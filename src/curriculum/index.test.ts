import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { ap034, ap035, ap041, ap042, getAllSpecialties } from './index';
import { getFinalExamQuestions } from './finalExams';

describe('AP034 curriculum', () => {
  it('has the 35 requirements of the official AP034 sheet', () => {
    expect(ap034.requirements).toHaveLength(35);
  });

  it('has 9 modules', () => {
    expect(ap034.modules).toHaveLength(9);
  });

  it('has a final exam module', () => {
    const finalMod = ap034.modules.find(m => m.code === 'AP034.F');
    expect(finalMod).toBeDefined();
    expect(finalMod!.lessons[0].labType).toBe('final_exam');
  });

  it('all theory lessons have questions', () => {
    for (const module of ap034.modules) {
      for (const lesson of module.lessons) {
        if (lesson.type === 'theory') {
          expect(lesson.questions).toBeDefined();
          expect(lesson.questions!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('all multiple choice questions have exactly one correct answer', () => {
    for (const module of ap034.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.questions) continue;
        for (const q of lesson.questions) {
          if (q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'scenario') {
            const opts = q.data.options || q.data.scenarios || [];
            const correctCount = opts.filter(o => o.correct).length;
            expect(correctCount).toBe(1);
          }
        }
      }
    }
  });
});

describe('AP035 curriculum', () => {
  it('has the 31 requirements of the official AP035 sheet', () => {
    expect(ap035.requirements).toHaveLength(31);
  });

  /* Eram nove: o nono era um módulo só para conferir a especialidade
     anterior. O bloqueio da trilha faz isso sozinho. */
  it('has 8 modules, with no gate module', () => {
    expect(ap035.modules).toHaveLength(8);
  });

  it('keeps no lesson pointing at the retired prerequisite lab', () => {
    const labs = ap035.modules.flatMap(m => m.lessons).map(l => l.labType);
    expect(labs).not.toContain('prerequisite');
  });
});

describe('AP041 curriculum', () => {
  it('has the 26 requirements of the official AP041 sheet', () => {
    expect(ap041.requirements).toHaveLength(26);
  });

  it('has 5 content modules plus the final exam', () => {
    expect(ap041.modules).toHaveLength(6);
  });

  it('is open, not under construction', () => {
    expect(ap041.emConstrucao).toBeFalsy();
  });

  /* Uma trilha aberta com módulo vazio é pior do que uma trilha anunciada:
     o desbravador entra, não encontra nada e não sabe se é erro dele. */
  it('leaves no module without lessons', () => {
    const vazios = ap041.modules.filter(m => m.lessons.length === 0).map(m => m.code);
    expect(vazios).toEqual([]);
  });

  it('gives every theory lesson its questions', () => {
    for (const m of ap041.modules) {
      for (const l of m.lessons) {
        if (l.type !== 'theory') continue;
        expect(l.questions, l.code).toBeDefined();
        expect(l.questions!.length, l.code).toBeGreaterThan(0);
      }
    }
  });
});

describe('AP042 curriculum', () => {
  it('has the 24 requirements of the official AP042 sheet', () => {
    expect(ap042.requirements).toHaveLength(24);
  });

  it('has 5 content modules plus the final exam', () => {
    expect(ap042.modules).toHaveLength(6);
  });

  it('is open, not under construction', () => {
    expect(ap042.emConstrucao).toBeFalsy();
  });

  /* O requisito 1 é "ter a especialidade de Computação 1", e quem o cumpre é o
     bloqueio da trilha. Se o pré-requisito sumir, ele vira um requisito que
     ninguém consegue cumprir — e nenhuma lição o cobre. */
  it('is gated by AP041, which is what fulfils its first requirement', () => {
    expect(ap042.preRequisito).toBe('AP041');
    expect(ap042.requirements.find(r => r.code === 'AP042-1.1')?.peloPreRequisito).toBe(true);
  });

  it('leaves no module without lessons', () => {
    const vazios = ap042.modules.filter(m => m.lessons.length === 0).map(m => m.code);
    expect(vazios).toEqual([]);
  });

  it('gives every theory lesson its questions', () => {
    for (const m of ap042.modules) {
      for (const l of m.lessons) {
        if (l.type !== 'theory') continue;
        expect(l.questions, l.code).toBeDefined();
        expect(l.questions!.length, l.code).toBeGreaterThan(0);
      }
    }
  });

  /* Os dois laboratórios novos nasceram com esta trilha. Uma lição apontando
     para um tipo que a tela não desenha é uma tela em branco no meio da
     trilha — e o `labType` errado não quebra compilação nenhuma. */
  it('uses the two labs written for it', () => {
    const labs = ap042.modules.flatMap(m => m.lessons).map(l => l.labType).filter(Boolean);
    expect(labs).toContain('formatacao_texto');
    expect(labs).toContain('operacoes_arquivo');
  });
});

describe('laboratórios', () => {
  /*
    Um laboratório pode servir a mais de uma trilha — mas nunca duas vezes na
    mesma.

    A regra era mais dura: um laboratório, uma lição em toda a plataforma. Ela
    existia por causa do painel de atividade, que recuperava a lição a partir do
    tipo do laboratório e nomearia a errada se houvesse duas.

    A redação guiada furou essa regra pelo motivo certo: a mecânica nasceu na
    AP041 e passou a montar também o relatório da AP034, porque as duas pedem o
    mesmo tipo de texto e a caixa vazia falhava igual nas duas. Reescrever o
    laboratório com outro nome só para satisfazer a regra seria duplicar código
    para agradar um teste.

    Quem mudou foi a busca: `acharLicaoPorLaboratorio` agora recebe a trilha, e
    sem ela só responde quando não há ambiguidade (ver lib/atividade.ts).

    Dentro de uma trilha a proibição continua, e essa é real: ali nem a trilha
    do evento desempata, e nada distinguiria as duas lições.
  */
  it('nunca usa o mesmo laboratório duas vezes na mesma trilha', () => {
    const repetidos: string[] = [];
    for (const s of getAllSpecialties()) {
      const usos = new Map<string, string[]>();
      for (const m of s.modules) {
        for (const l of m.lessons) {
          if (!l.labType || l.labType === 'final_exam') continue;
          usos.set(l.labType, [...(usos.get(l.labType) ?? []), l.code]);
        }
      }
      for (const [lab, codes] of usos) {
        if (codes.length > 1) repetidos.push(`${s.code}/${lab}: ${codes.join(', ')}`);
      }
    }
    expect(repetidos, repetidos.join(' | ')).toEqual([]);
  });
});

describe('Final exam questions', () => {
  it('AP034 final has at least 15 questions', () => {
    const qs = getFinalExamQuestions('AP034');
    expect(qs.length).toBeGreaterThanOrEqual(15);
  });

  it('AP035 final has at least 12 questions', () => {
    const qs = getFinalExamQuestions('AP035');
    expect(qs.length).toBeGreaterThanOrEqual(12);
  });

  it('AP034 final has diverse question types', () => {
    const qs = getFinalExamQuestions('AP034');
    const types = new Set(qs.map(q => q.type));
    expect(types.has('multiple_choice')).toBe(true);
    expect(types.has('true_false')).toBe(true);
    expect(types.has('ordering')).toBe(true);
    expect(types.has('matching')).toBe(true);
    expect(types.has('fill_blank')).toBe(true);
    expect(types.has('scenario')).toBe(true);
  });

  it('AP035 final has diverse question types', () => {
    const qs = getFinalExamQuestions('AP035');
    const types = new Set(qs.map(q => q.type));
    expect(types.has('multiple_choice')).toBe(true);
    expect(types.has('ordering')).toBe(true);
    expect(types.has('matching')).toBe(true);
    expect(types.has('fill_blank')).toBe(true);
    expect(types.has('scenario')).toBe(true);
  });

  it('AP041 final has at least 15 questions', () => {
    expect(getFinalExamQuestions('AP041').length).toBeGreaterThanOrEqual(15);
  });

  it('AP041 final has diverse question types', () => {
    const types = new Set(getFinalExamQuestions('AP041').map(q => q.type));
    for (const t of ['multiple_choice', 'true_false', 'ordering', 'matching', 'fill_blank', 'scenario']) {
      expect(types.has(t as never), t).toBe(true);
    }
  });

  /*
    A trava do despacho da prova.

    getFinalExamQuestions era um ternário: AP034 recebia a dela e qualquer
    outro código recebia a da AP035 — uma trilha sem prova aplicaria a prova
    de outra especialidade, calada. Aqui a pergunta é feita ao contrário:
    toda trilha que tem módulo de avaliação final precisa ter questões.
  */
  it('AP042 final has at least 15 questions', () => {
    expect(getFinalExamQuestions('AP042').length).toBeGreaterThanOrEqual(15);
  });

  it('AP042 final has diverse question types', () => {
    const types = new Set(getFinalExamQuestions('AP042').map(q => q.type));
    for (const t of ['multiple_choice', 'true_false', 'ordering', 'matching', 'fill_blank', 'scenario']) {
      expect(types.has(t as never), t).toBe(true);
    }
  });

  it('gives every trail with a final module its own exam', () => {
    const semProva = getAllSpecialties()
      .filter(s => s.modules.some(m => m.lessons.some(l => l.labType === 'final_exam')))
      .filter(s => getFinalExamQuestions(s.code).length === 0)
      .map(s => s.code);
    expect(semProva).toEqual([]);
  });

  /* Duas trilhas não podem compartilhar a mesma prova: foi o que o ternário
     fazia, e nada no sistema de tipos denunciava. */
  it('never hands two trails the same questions', () => {
    const ids = ['AP034', 'AP035', 'AP041', 'AP042']
      .map(c => getFinalExamQuestions(c).map(q => q.id).sort().join('|'));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all final exam questions have explanations', () => {
    const qs034 = getFinalExamQuestions('AP034');
    for (const q of qs034) {
      expect(q.explanation).toBeDefined();
      expect(q.explanation!.length).toBeGreaterThan(10);
    }
    const qs035 = getFinalExamQuestions('AP035');
    for (const q of qs035) {
      expect(q.explanation).toBeDefined();
      expect(q.explanation!.length).toBeGreaterThan(10);
    }
  });
});

/**
 * Structural invariants, checked for both specialties.
 *
 * These exist because two separate lessons were found pointing at the same lab
 * component: AP034's "Laboratório de Cenários de Segurança" rendered the pact
 * builder, and AP035's table challenge rendered the element-by-element CodeLab.
 * In both cases a student met an identical screen twice and the second visit
 * assessed nothing, while a requirement went uncovered in practice. Nothing in
 * the type system prevents that — it is a data mistake — so it is checked here.
 */
describe.each([
  ['AP034', ap034],
  ['AP035', ap035],
  ['AP041', ap041],
  ['AP042', ap042],
])('%s structure', (code, specialty) => {
  const lessons = specialty.modules.flatMap(m => m.lessons);

  it('gives every lesson a unique code', () => {
    const codes = lessons.map(l => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('gives every module a unique code', () => {
    const codes = specialty.modules.map(m => m.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('never cites a requirement that does not exist', () => {
    const known = new Set(specialty.requirements.map(r => r.code));
    const unknown = lessons.flatMap(l => l.requirementCodes ?? []).filter(rc => !known.has(rc));
    expect(unknown).toEqual([]);
  });

  /*
    Todo requisito precisa de uma lição — menos os que o próprio bloqueio da
    trilha cumpre. "Ter concluído a especialidade anterior" não é matéria a
    estudar: é uma condição que a plataforma confere sozinha, e que só deixa
    entrar quem já a satisfez.
  */
  it('covers every requirement with at least one lesson', () => {
    const covered = new Set(lessons.flatMap(l => l.requirementCodes ?? []));
    const orphans = specialty.requirements
      .filter(r => !r.peloPreRequisito)
      .map(r => r.code)
      .filter(rc => !covered.has(rc));
    expect(orphans).toEqual([]);
  });

  /* Requisito cumprido pelo bloqueio só faz sentido onde há bloqueio. */
  it('only lets the gate fulfil a requirement when there is a gate', () => {
    const pelaPorta = specialty.requirements.filter(r => r.peloPreRequisito);
    if (pelaPorta.length > 0) expect(specialty.preRequisito).toBeTruthy();
  });

  it('gives every lab lesson a labType', () => {
    const missing = lessons.filter(l => l.type === 'lab' && !l.labType).map(l => l.code);
    expect(missing).toEqual([]);
  });

  it('never points two lessons at the same lab', () => {
    const byLab = new Map<string, string[]>();
    for (const l of lessons) {
      if (!l.labType) continue;
      byLab.set(l.labType, [...(byLab.get(l.labType) ?? []), l.code]);
    }
    const shared = [...byLab.entries()]
      .filter(([, ls]) => ls.length > 1)
      .map(([lab, ls]) => `${lab}: ${ls.join(', ')}`);
    expect(shared).toEqual([]);
  });

  it(`names the specialty ${code}`, () => {
    expect(specialty.code).toBe(code);
  });
});

/*
  Toda trilha tem emblema e fundo de certificado no repositório.

  A vereda já tinha essa trava; a trilha, não — e foi por isso que os cinco
  certificados de Sistemas ficaram com o nome errado até alguém abrir a pasta e
  comparar. Um código sem arte não quebra nada: o `Emblema` esconde a imagem e o
  cartão segue de pé, com um buraco onde deveria estar a insígnia que a pessoa
  vai costurar na faixa.

  Vale para as em construção também. A arte chega antes do conteúdo justamente
  para que o cartão anunciado mostre o que vem.
*/
describe('a arte de cada trilha', () => {
  for (const s of getAllSpecialties()) {
    it(`${s.code} tem emblema e certificado no repositório`, () => {
      expect(existsSync(`public/assets/specialties/${s.code}.png`), 'emblema').toBe(true);
      expect(existsSync(`public/assets/certificates/${s.code}.png`), 'certificado').toBe(true);
    });
  }
});
