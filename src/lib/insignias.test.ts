import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { INSIGNIAS, insigniasConquistadas, codigoDaInsigniaDaTrilha, type ResumoDoDesbravador } from './insignias';
import { getOpenSpecialties } from '../curriculum';
import { veredasAbertas, codigoDaInsigniaDaVereda } from '../curriculum/veredas';
import { hasIcon } from './badgeIcons';
import { laboratorioDoEvento, LABORATORIO_DO_EVENTO } from './atividade';

/* O evento que cada laboratório grava ao concluir, invertido do mapa. */
const EVENTO_DA_LICAO: Record<string, string> = Object.fromEntries(
  Object.entries(LABORATORIO_DO_EVENTO).map(([evento, lab]) => [lab, evento]),
);

/*
  Toda migration que semeia insígnia, e não só o catálogo original.

  Apontava para um arquivo só, o 20260822030000. Mas a insígnia da AP041 já
  nascia noutro arquivo, e cada trilha nova traz as suas do mesmo jeito — o
  catálogo deixou de ser um arquivo e passou a ser o conjunto deles. Manter o
  teste preso ao primeiro exigiria editar uma migration já aplicada a cada
  trilha, que é justamente o que este repositório proíbe.
*/
const DIR_MIGRATIONS = 'supabase/migrations';

function insigniasSemeadas(): Set<string> {
  const codigos = new Set<string>();
  for (const arquivo of readdirSync(DIR_MIGRATIONS).filter(f => f.endsWith('.sql'))) {
    const sql = readFileSync(join(DIR_MIGRATIONS, arquivo), 'utf8');
    /* Só o bloco de VALUES de cada INSERT em badges: um arquivo pode ter outras
       tuplas indentadas, e elas não são códigos de insígnia. */
    for (const bloco of sql.split(/INSERT INTO badges/i).slice(1)) {
      const valores = bloco.split(';')[0];
      for (const m of valores.matchAll(/^ {2}\('([a-z0-9_]+)'/gm)) codigos.add(m[1]);
    }
  }
  return codigos;
}

/** Um percurso vazio: nada feito, nenhuma insígnia. */
const zerado = (): ResumoDoDesbravador => ({
  requisitos: 0, licoes: 0, licoesPerfeitas: 0, modulos: 0, trilhas: [],
  laboratorios: new Set(), provas: 0, provasPerfeitas: 0, melhorSequencia: 0,
  diasAtivos: 0, horas: new Set(), diasDaSemana: new Set(), xp: 0, certificados: [],
  veredas: [],
});

const com = (mudancas: Partial<ResumoDoDesbravador>): ResumoDoDesbravador => ({ ...zerado(), ...mudancas });

describe('o catálogo', () => {
  it('não repete código', () => {
    const codigos = INSIGNIAS.map(i => i.code);
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  /*
    Ícone que não existe no mapa não quebra nada: as duas pontas caem no
    troféu genérico. É esse o problema — cinquenta insígnias iguais, e nenhum
    sinal de que alguma coisa deu errado.
  */
  it('só usa ícones que a tela e o PDF sabem desenhar', () => {
    const naTela = readFileSync('src/components/ui/BadgeIcon.tsx', 'utf8');
    for (const i of INSIGNIAS) {
      expect(hasIcon(i.icone), `${i.code} no PDF`).toBe(true);
      expect(naTela, `${i.code} na tela`).toContain(`  ${i.icone}: `);
    }
  });

  /*
    Insígnia sem linha na tabela é ignorada sem erro e sem prêmio — de fora,
    parece que a pessoa simplesmente não conquistou nada. Só um teste vê.
  */
  it('tem todas as insígnias semeadas na migration', () => {
    const semeados = insigniasSemeadas();

    for (const i of INSIGNIAS) expect(semeados, i.code).toContain(i.code);
    /* Inclusive a de cada trilha aberta: trilha nova sem linha aqui é uma
       especialidade que se conclui e não dá nada. */
    for (const e of getOpenSpecialties()) {
      expect(semeados, e.code).toContain(codigoDaInsigniaDaTrilha(e.code));
    }
  });
});

describe('quem não fez nada', () => {
  it('não conquista nenhuma', () => {
    expect(insigniasConquistadas(zerado())).toEqual([]);
  });
});

describe('os marcos', () => {
  it('dão a de baixo junto com a de cima', () => {
    const conquistadas = insigniasConquistadas(com({ licoes: 25 }));
    expect(conquistadas).toContain('licoes_25');
    expect(conquistadas).toContain('licoes_10');
    expect(conquistadas).toContain('primeira_licao');
    expect(conquistadas).not.toContain('licoes_50');
  });

  it('valem no número exato, e não só acima dele', () => {
    expect(insigniasConquistadas(com({ melhorSequencia: 7 }))).toContain('streak_7');
    expect(insigniasConquistadas(com({ melhorSequencia: 6 }))).not.toContain('streak_7');
  });
});

/*
  A regra que não pode ser quebrada por engano: os critérios olham só para
  marcas acumuladas. Uma insígnia que sumisse porque a sequência foi
  interrompida puniria justamente quem voltou depois de faltar.
*/
describe('insígnia não se perde', () => {
  it('continua conquistada quando o resumo cresce', () => {
    const antes = insigniasConquistadas(com({
      licoes: 12, requisitos: 30, melhorSequencia: 8, diasAtivos: 20,
      laboratorios: new Set(['web_lab']), xp: 600, trilhas: ['AP034'],
    }));
    const depois = insigniasConquistadas(com({
      licoes: 40, requisitos: 60, melhorSequencia: 31, diasAtivos: 45,
      laboratorios: new Set(['web_lab', 'mail_lab']), xp: 1500, trilhas: ['AP034', 'AP041'],
    }));
    for (const codigo of antes) expect(depois, codigo).toContain(codigo);
    expect(depois.length).toBeGreaterThan(antes.length);
  });
});

describe('os laboratórios', () => {
  it('dão a marca do laboratório que foi feito, e não a dos outros', () => {
    const conquistadas = insigniasConquistadas(com({ laboratorios: new Set(['computer_care']) }));
    expect(conquistadas).toContain('lab_computer_care');
    expect(conquistadas).toContain('primeiro_laboratorio');
    expect(conquistadas).not.toContain('lab_file_manager');
  });
});

describe('as trilhas', () => {
  it('dão a insígnia da trilha concluída, pelo código dela', () => {
    expect(insigniasConquistadas(com({ trilhas: ['AP041'] }))).toContain('ap041_complete');
  });

  /* Sem lista escrita à mão: a trilha que ainda vai existir já entra aqui. */
  it('valem para uma trilha que o catálogo não conhece', () => {
    expect(insigniasConquistadas(com({ trilhas: ['AP099'] }))).toContain('ap099_complete');
  });
});

describe('a hora do estudo', () => {
  it('separa a madrugada do amanhecer', () => {
    expect(insigniasConquistadas(com({ horas: new Set([2]) }))).toContain('coruja');
    expect(insigniasConquistadas(com({ horas: new Set([2]) }))).not.toContain('madrugador');
    expect(insigniasConquistadas(com({ horas: new Set([6]) }))).toContain('madrugador');
    expect(insigniasConquistadas(com({ horas: new Set([14]) }))).toEqual([]);
  });

  it('pede os sete dias para a semana inteira', () => {
    expect(insigniasConquistadas(com({ diasDaSemana: new Set([0, 1, 2, 3, 4, 5] ) }))).not.toContain('semana_inteira');
    expect(insigniasConquistadas(com({ diasDaSemana: new Set([0, 1, 2, 3, 4, 5, 6]) }))).toContain('semana_inteira');
  });
});

/*
  Insígnia de laboratório que nenhum evento consegue disparar.

  Pior que a insígnia sem linha na tabela, porque aqui a linha existe: o
  catálogo está certo, o banco está semeado, a tela desenharia o ícone — e o
  critério espera um laboratório que o motor nunca nomeia. `lab_text_editor`,
  `lab_redacao_guiada` e `lab_table_challenge` ficaram assim desde que foram
  escritas, e ninguém percebeu porque concluir o laboratório simplesmente não
  dava nada, sem erro em lugar nenhum.

  Este teste percorre o caminho inteiro ao contrário: para cada insígnia de
  laboratório, monta o evento que aquela lição gravaria e confere que ele
  chega ao laboratório certo.
*/
describe('toda insígnia de laboratório é alcançável', () => {
  it('cada laboratório do currículo é reconhecido a partir do evento da lição', () => {
    const inalcancaveis: string[] = [];

    for (const e of getOpenSpecialties()) {
      for (const m of e.modules) {
        for (const l of m.lessons) {
          if (!l.labType || l.labType === 'final_exam') continue;
          if (!INSIGNIAS.some(i => i.code === `lab_${l.labType}`)) continue;

          /* O evento que essa lição grava ao concluir: os laboratórios que
             registram a lição são a maioria, e é por ela que o tipo se resolve. */
          const evento = {
            event_type: EVENTO_DA_LICAO[l.labType] ?? 'text_submitted',
            metadata: { specialtyCode: e.code, lessonCode: l.code },
          };
          if (laboratorioDoEvento(evento) !== l.labType) {
            inalcancaveis.push(`${e.code}/${l.code} (${l.labType})`);
          }
        }
      }
    }

    expect(inalcancaveis, inalcancaveis.join(' | ')).toEqual([]);
  });
});

/*
  As veredas seguem a mesma regra das trilhas: o critério nasce do currículo,
  e a linha do catálogo é à mão. Sem a linha, a insígnia é ignorada
  sem erro e sem prêmio — que é exatamente o tipo de falha que não aparece em
  tela nenhuma.
*/
describe('as insígnias das veredas', () => {
  /* Só as abertas: a vereda anunciada ainda não tem conteúdo, e semear a
     insígnia dela agora seria prometer prêmio por percurso que não existe. É
     a mesma regra das trilhas, que usam `getOpenSpecialties`. */
  it('toda vereda aberta tem a linha dela semeada', () => {
    const semeadas = insigniasSemeadas();
    const faltando = veredasAbertas()
      .map(v => codigoDaInsigniaDaVereda(v.id))
      .filter(codigo => !semeadas.has(codigo));
    expect(faltando).toEqual([]);
  });

  it('é conquistada por quem percorreu a vereda inteira, e só por essa pessoa', () => {
    const id = veredasAbertas()[0].id;
    expect(insigniasConquistadas(zerado())).not.toContain(codigoDaInsigniaDaVereda(id));
    expect(insigniasConquistadas({ ...zerado(), veredas: [id] }))
      .toContain(codigoDaInsigniaDaVereda(id));
  });
});
