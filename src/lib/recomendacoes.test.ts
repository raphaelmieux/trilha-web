import { describe, it, expect } from 'vitest';
import { VEREDAS_RECOMENDADAS } from '../curriculum/recomendacoes';
import { recomendacoesDaTrilha, veredasQueFaltam, trilhaTravada } from './recomendacoes';
import { VEREDAS, veredasAbertas } from '../curriculum/veredas';
import { getAllSpecialties, getOpenSpecialties } from '../curriculum';

const idsDeVeredas = new Set(VEREDAS.map(v => v.id));
const idsAbertas = new Set(veredasAbertas().map(v => v.id));
const todas = Object.entries(VEREDAS_RECOMENDADAS);

describe('a tabela aponta para coisas que existem', () => {
  it('toda vereda recomendada existe no registro', () => {
    const perdidas = todas.flatMap(([trilha, rs]) =>
      rs.filter(r => !idsDeVeredas.has(r.vereda)).map(r => `${trilha} → ${r.vereda}`));
    expect(perdidas).toEqual([]);
  });

  it('toda trilha citada existe, aberta ou anunciada', () => {
    const conhecidas = new Set(getAllSpecialties().map(s => s.code));
    const perdidas = todas.map(([t]) => t).filter(t => !conhecidas.has(t));
    expect(perdidas).toEqual([]);
  });

  it('nenhuma recomendação se repete dentro da mesma trilha', () => {
    for (const [trilha, rs] of todas) {
      expect(new Set(rs.map(r => r.vereda)).size, trilha).toBe(rs.length);
    }
  });

  it('toda recomendação diz por que existe', () => {
    for (const [trilha, rs] of todas) {
      for (const r of rs) expect(r.porque.length, `${trilha} → ${r.vereda}`).toBeGreaterThan(40);
    }
  });
});

/*
  A trava permanente é o defeito a evitar aqui.

  Vereda em construção tem zero lições, e "concluída" nunca fica verdadeiro para
  ela. Uma trava apontando para uma dessas fecharia a trilha para sempre, sem
  que nada na tela explicasse o motivo — a mesma família do "zero de zero é
  tudo" que já enganou o percentual das veredas.
*/
describe('a trava nunca é permanente', () => {
  it('as essenciais só apontam para vereda aberta', () => {
    const presas = todas.flatMap(([trilha, rs]) =>
      rs.filter(r => r.essencial && !idsAbertas.has(r.vereda))
        .map(r => `${trilha} → ${r.vereda}`));
    expect(presas).toEqual([]);
  });

  it('recomendação de vereda ainda fechada não chega à tela', () => {
    const fechada = VEREDAS.find(v => v.emConstrucao);
    expect(fechada, 'era esperado haver vereda em construção').toBeDefined();
    for (const [trilha] of todas) {
      for (const r of recomendacoesDaTrilha(trilha)) {
        expect(idsAbertas.has(r.vereda), `${trilha} → ${r.vereda}`).toBe(true);
      }
    }
  });
});

describe('o que segura a trilha', () => {
  /*
    A AP035 é o contra-exemplo que a tabela guarda de propósito: ela ensina o
    HTML dos requisitos 3.1 a 3.14, e a vereda de HTML saiu dela. Travá-la
    exigiria um curso opcional que repete o conteúdo da própria trilha.
  */
  it('a AP035 recomenda HTML e não trava atrás dela', () => {
    const rs = recomendacoesDaTrilha('AP035');
    expect(rs.map(r => r.vereda)).toContain('html');
    expect(rs.find(r => r.vereda === 'html')?.essencial).toBeUndefined();
    expect(trilhaTravada('AP035', [])).toBe(false);
  });

  /* Nenhuma trilha aberta hoje é impraticável sem vereda: as que ensinam o
     assunto ensinam-no, e as que supõem programação ainda não têm conteúdo. */
  it('nenhuma trilha aberta hoje está travada para quem não fez vereda nenhuma', () => {
    for (const t of getOpenSpecialties()) {
      expect(trilhaTravada(t.code, []), t.code).toBe(false);
    }
  });

  it('a vereda concluída destrava', () => {
    /* AP063 só abre com HTML e CSS feitas — é o caso para o qual a trava
       existe. */
    expect(veredasQueFaltam('AP063', []).map(r => r.vereda)).toEqual(['html', 'css']);
    expect(veredasQueFaltam('AP063', ['html']).map(r => r.vereda)).toEqual(['css']);
    expect(trilhaTravada('AP063', ['html', 'css'])).toBe(false);
  });

  it('trilha sem recomendação nenhuma nunca trava', () => {
    expect(recomendacoesDaTrilha('AP034')).toEqual([]);
    expect(trilhaTravada('AP034', [])).toBe(false);
  });
});
