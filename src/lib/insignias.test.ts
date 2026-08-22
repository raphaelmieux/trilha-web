import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { INSIGNIAS, insigniasConquistadas, codigoDaInsigniaDaTrilha, type ResumoDoDesbravador } from './insignias';
import { getOpenSpecialties } from '../curriculum';
import { hasIcon } from './badgeIcons';

const CATALOGO = 'supabase/migrations/20260822030000_catalogo_de_insignias.sql';

/** Um percurso vazio: nada feito, nenhuma insígnia. */
const zerado = (): ResumoDoDesbravador => ({
  requisitos: 0, licoes: 0, licoesPerfeitas: 0, modulos: 0, trilhas: [],
  laboratorios: new Set(), provas: 0, provasPerfeitas: 0, melhorSequencia: 0,
  diasAtivos: 0, horas: new Set(), diasDaSemana: new Set(), xp: 0, certificados: [],
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
    const sql = readFileSync(CATALOGO, 'utf8');
    const semeados = new Set([...sql.matchAll(/^ {2}\('([a-z0-9_]+)'/gm)].map(m => m[1]));

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
