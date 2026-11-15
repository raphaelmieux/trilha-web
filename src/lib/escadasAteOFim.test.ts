import { describe, it, expect } from 'vitest';
import { ESCADAS, alcancou } from './escadasDeInsignia';
import { catalogoSemeado } from '../../supabase/migrations/catalogoSemeado';
import { INSIGNIAS, insigniasConquistadas, type ResumoDoDesbravador } from './insignias';
import { nadaAnunciado, TOTAIS } from './totaisDaPlataforma';

/*
  O sétimo degrau das escadas de conteúdo é "tudo", e só vale quando a
  plataforma inteira estiver escrita.

  As duas formas de errar são caladas: o "tudo" valer com o total de hoje dá o
  topo a quem fez só o que estava aberto, e o topo para de dizer "tudo"; e o
  topo de antes, que saiu da escada, ser concedido de novo poria na estante
  uma insígnia de uma escada que não existe mais.
*/

const enorme = (): ResumoDoDesbravador => ({
  requisitos: 1e9, licoes: 1e9, licoesPerfeitas: 1e9, modulos: 1e9, trilhas: [],
  laboratorios: new Set(Array.from({ length: 1000 }, (_, i) => `l${i}`)) as ResumoDoDesbravador['laboratorios'], provas: 1e9, provasPerfeitas: 1e9, melhorSequencia: 1e9,
  diasAtivos: 1e9, horas: new Set(), diasDaSemana: new Set(), xp: 1e9, certificados: Array.from({ length: 1000 }, (_, i) => `c${i}`),
  veredas: [], laboratoriosDeVereda: [], curiosidades: new Map(),
});

const CHAVES_COM_TUDO = ['requisitos', 'licoes', 'modulos', 'laboratorios', 'semerro', 'tokens', 'xp'] as const;

describe('as escadas fecham no fim', () => {
  it('as sete escadas de conteúdo terminam em "tudo", com o total da plataforma', () => {
    for (const chave of CHAVES_COM_TUDO) {
      const escada = ESCADAS.find(e => e.chave === chave)!;
      const topo = escada.degraus[6];
      expect(topo.todos, chave).toBe(true);
      expect(topo.alvo, chave).toBe(TOTAIS[chave]());
      expect(topo.classe).toBe('lider');
    }
  });

  it('o alvo do "tudo" fica acima do degrau de baixo', () => {
    for (const chave of CHAVES_COM_TUDO) {
      const d = ESCADAS.find(e => e.chave === chave)!.degraus;
      expect(d[6].alvo, chave).toBeGreaterThan(d[5].alvo);
    }
  });

  it('com trilha ou vereda anunciada, ninguém alcança o "tudo"', () => {
    expect(nadaAnunciado(), 'a plataforma toda escrita: esta trava passa a não conferir nada').toBe(false);
    for (const chave of CHAVES_COM_TUDO) {
      const escada = ESCADAS.find(e => e.chave === chave)!;
      expect(alcancou(escada, escada.degraus[6], enorme()), chave).toBe(false);
      expect(alcancou(escada, escada.degraus[5], enorme()), chave).toBe(true);
    }
  });

  /* Os topos de antes se aposentaram com as conquistas, por decisão do dono
     da plataforma. Nenhum volta: nem ao código, nem às escadas, nem ao banco. */
  it('o topo de antes não existe mais em lugar nenhum', () => {
    const codigos = ['requisitos_192', 'licoes_110', 'modulos_45', 'laboratorios_28', 'semerro_90', 'tokens_40', 'xp_12000'];
    const banco = catalogoSemeado();
    for (const c of codigos) {
      expect(INSIGNIAS.some(i => i.code === c), c).toBe(false);
      expect(ESCADAS.some(e => e.degraus.some(d => d.code === c)), c).toBe(false);
      expect(banco.has(c), c).toBe(false);
    }
    expect(insigniasConquistadas(enorme()).filter(c => codigos.includes(c))).toEqual([]);
  });
});
