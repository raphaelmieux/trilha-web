import { describe, it, expect } from 'vitest';
import { gruposDaFaixa } from './catalogoDaFaixa';
import { empacotarFaixa, FOLGA, ALTURA_DA_FAIXA } from './empacotarFaixa';
import { getAllSpecialties } from '../../curriculum';
import { VEREDAS, codigoDaInsigniaDaVereda } from '../../curriculum/veredas';
import { codigoDaInsigniaDaTrilha, insigniasDosLaboratoriosDeVereda } from '../insignias';
import { ESCADAS, EDICAO_ANTIGA } from '../escadasDeInsignia';
import { CURIOSIDADES } from '../catalogoDeCuriosidades';
import { mestrados } from '../mestrados';
import { tiposDeLaboratorioDaTrilha, laboratoriosDaTrilha, laboratoriosDaVereda } from '../../curriculum/laboratoriosPrevistos';
import { fileirasDaEstante } from '../estante';

/*
  A Faixa precisa de três promessas, e cada uma falha calada se quebrar.

  Nenhuma peça toca outra: um pin em cima de um patch não estoura nada, só
  esconde a conquista de alguém debaixo de outra. Toda peça tem um lugar só:
  uma escada a menos, ou uma curiosidade em dobro, deixaria a Faixa com cara de
  certa e a conta de "peças" mentindo. E o desenho é o mesmo a cada vez: se
  mudasse, a peça de alguém trocaria de lugar no dia em que outra fosse
  conquistada.
*/

const faixa = empacotarFaixa(gruposDaFaixa());

describe('o empacotador da Faixa', () => {
  it('não deixa peça de uma unidade tocar peça de outra', () => {
    const p = faixa.pecas;
    const toques: string[] = [];
    for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) {
      const a = p[i], b = p[j];
      if (a.unidade === b.unidade) continue;
      const sx = a.w / 2 + b.w / 2 + FOLGA - 0.5, sy = a.h / 2 + b.h / 2 + FOLGA - 0.5;
      const dx = a.x - b.x, dy = a.y - b.y;
      if (Math.abs(dx) >= sx || Math.abs(dy) >= sy) continue;
      if ((dx * dx) / (sx * sx) + (dy * dy) / (sy * sy) < 1) toques.push(`${a.id} × ${b.id}`);
    }
    expect(toques).toEqual([]);
  });

  /* Dentro de um cacho de curiosidades a regra é a caixa inteira, girada: a
     arte dos pins é deitada, em pé ou larga, e a espiral medida para o pin
     redondo pôs os desenhos dos segredos uns por cima dos outros. */
  it('não deixa um pin de curiosidade encostar no vizinho do mesmo cacho', () => {
    const meia = (w: number, h: number, giro: number) => {
      const r = (Math.abs(giro) * Math.PI) / 180;
      return [(w * Math.cos(r) + h * Math.sin(r)) / 2, (w * Math.sin(r) + h * Math.cos(r)) / 2];
    };
    const pins = faixa.pecas.filter(p => p.material === 'pin-curioso');
    expect(pins.length).toBe(CURIOSIDADES.length);
    const toques: string[] = [];
    for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) {
      const a = pins[i], b = pins[j];
      if (a.unidade !== b.unidade) continue;
      const [aw, ah] = meia(a.w, a.h, a.giro), [bw, bh] = meia(b.w, b.h, b.giro);
      if (Math.abs(a.x - b.x) < aw + bw && Math.abs(a.y - b.y) < ah + bh) toques.push(`${a.id} × ${b.id}`);
    }
    expect(toques).toEqual([]);
  });

  it('põe toda peça dentro da altura da Faixa', () => {
    const fora = faixa.pecas.filter(p => p.y - p.h / 2 < 0 || p.y + p.h / 2 > ALTURA_DA_FAIXA || p.x - p.w / 2 < 0 || p.x + p.w / 2 > faixa.largura);
    expect(fora.map(p => p.id)).toEqual([]);
  });

  it('é o mesmo desenho a cada vez', () => {
    const outra = empacotarFaixa(gruposDaFaixa());
    expect(outra.largura).toBe(faixa.largura);
    expect(outra.pecas.map(p => `${p.id}@${p.x.toFixed(1)},${p.y.toFixed(1)}`))
      .toEqual(faixa.pecas.map(p => `${p.id}@${p.x.toFixed(1)},${p.y.toFixed(1)}`));
  });

  /* A edição antiga só aparece para quem tem algum dos topos de antes, e vai no
     fim: quem a tem não pode ver a Faixa inteira trocar de lugar por causa dela. */
  it('a edição antiga não move nenhuma outra peça', () => {
    const comAntiga = empacotarFaixa(gruposDaFaixa({ comEdicaoAntiga: true }));
    const antes = new Map(faixa.pecas.map(p => [p.id, `${p.x},${p.y}`]));
    for (const p of comAntiga.pecas) if (antes.has(p.id)) expect(`${p.x},${p.y}`, p.id).toBe(antes.get(p.id));
    expect(comAntiga.pecas.filter(p => p.zona === 'antiga').map(p => p.id).sort())
      .toEqual(EDICAO_ANTIGA.map(x => x.code).sort());
  });

  it('lê da esquerda para a direita: trilhas, escadas, curiosidades e veredas', () => {
    const zonas = faixa.trechos.map(t => t.zona).filter((z, i, l) => z !== l[i - 1]);
    expect(zonas).toEqual(['trilhas', 'escadas', 'curiosidades', 'veredas']);
  });
});

describe('o catálogo da Faixa', () => {
  const ids = faixa.pecas.map(p => p.id);

  it('não repete peça', () => {
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('tem toda trilha e toda vereda, com os laboratórios de cada uma', () => {
    for (const t of getAllSpecialties()) {
      expect(ids, t.code).toContain(codigoDaInsigniaDaTrilha(t.code));
      const satelites = faixa.pecas.filter(p => p.unidade === t.code && p.material === 'pin');
      expect(satelites.length, t.code).toBe(laboratoriosDaTrilha(t));
      if (!t.emConstrucao) for (const tipo of tiposDeLaboratorioDaTrilha(t)) expect(ids).toContain(`lab_${tipo}`);
    }
    for (const v of VEREDAS) {
      expect(ids, v.code).toContain(codigoDaInsigniaDaVereda(v.id));
      const satelites = faixa.pecas.filter(p => p.unidade === v.code && p.material === 'pin');
      expect(satelites.length, v.code).toBe(laboratoriosDaVereda(v));
    }
    for (const l of insigniasDosLaboratoriosDeVereda()) expect(ids).toContain(l.code);
  });

  it('tem todo degrau, toda curiosidade e todo Mestrado', () => {
    for (const e of ESCADAS) for (const d of e.degraus) expect(ids).toContain(d.code);
    for (const c of CURIOSIDADES) expect(ids).toContain(c.code);
    for (const m of mestrados()) expect(ids).toContain(m.code);
  });

  /* A Faixa e a estante desenham o mesmo catálogo: toda insígnia que a estante
     tem lugar para receber tem lugar na Faixa também — senão uma conquista
     ganha numa sumiria na outra. */
  it('tem lugar para toda insígnia que a estante tem', () => {
    const naFaixa = new Set(faixa.pecas.map(p => p.insignia).filter(Boolean));
    const daEstante = fileirasDaEstante().filter(f => !f.soConquistadas).flatMap(f => f.lugares.map(l => l.code));
    expect(daEstante.length).toBeGreaterThan(200);
    expect(daEstante.filter(c => !naFaixa.has(c))).toEqual([]);
  });
});
