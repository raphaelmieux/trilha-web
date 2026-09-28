import { describe, it, expect } from 'vitest';
import {
  DIAGRAMA_INICIAL, METAS_DO_DIAGRAMA, PALETA, PAPEL,
  assinatura, bitsComoTexto, comSimulacao, letraDoCodigo, problemaDaSeta,
  roteiroDoDiagrama, simular, valorDosBits,
  type Diagrama, type Seta,
} from './diagramaDoComputador';

/*
  O diagrama do requisito 5 da AP045.

  As travas de sempre dos laboratórios: nenhuma meta abre verde, a solução de
  referência fecha todas, e cada caminho errado deixa vermelha a meta que ele
  engana. A solução mora aqui, e não no módulo: gabarito no módulo fica a um
  import de distância da tela.
*/

const C = [false, true, false, false, false, false, true, true];

/** O que um desbravador entregaria depois de fazer tudo. */
function resolvido(): Diagrama {
  const d: Diagrama = {
    ...DIAGRAMA_INICIAL,
    pecas: [
      ...DIAGRAMA_INICIAL.pecas,
      { id: 'p-ram', tipo: 'ram', x: 400, y: 400 },
    ],
    setas: [
      { id: 's-1', de: 'p-teclado', para: 'p-cpu', rotulo: '0100 0011' },
      { id: 's-2', de: 'p-cpu', para: 'p-monitor', rotulo: 'os pixels da letra C' },
      { id: 's-3', de: 'p-cpu', para: 'p-ram', rotulo: 'a letra C, para guardar' },
    ],
    bits: C,
  };
  const simulado = comSimulacao(d);
  return { ...simulado, exportado: assinatura(simulado) };
}

const meta = (id: string) => METAS_DO_DIAGRAMA.find(m => m.id === id)!;
const feitas = (d: Diagrama) => METAS_DO_DIAGRAMA.filter(m => m.feita(d)).map(m => m.id);

describe('o rascunho de partida', () => {
  it('nenhuma meta abre verde', () => {
    expect(feitas(DIAGRAMA_INICIAL)).toEqual([]);
  });

  it('chega com uma seta ao contrário, e ela não leva a letra', () => {
    const r = simular(DIAGRAMA_INICIAL);
    expect(r.chegou).toBe(false);
    expect(r.problemas.map(p => p.setaId)).toEqual(['s-2']);
    expect(r.motivo).toMatch(/CPU e pararam/);
  });

  /* Tela vazia também não pode passar em nada: "zero seta errada" num
     diagrama sem seta é a armadilha de sempre. */
  it('um diagrama vazio não fecha meta nenhuma', () => {
    expect(feitas({ ...DIAGRAMA_INICIAL, pecas: [], setas: [] })).toEqual([]);
  });
});

describe('a solução de referência', () => {
  it('fecha todas as metas', () => {
    expect(feitas(resolvido())).toEqual(METAS_DO_DIAGRAMA.map(m => m.id));
  });

  it('acende a letra C passando pela memória', () => {
    const r = simular(resolvido());
    expect(r.chegou).toBe(true);
    expect(r.letra).toBe('C');
    expect(r.passos.map(p => `${p.de}>${p.para}`)).toEqual(['teclado>cpu', 'cpu>ram', 'cpu>monitor']);
  });
});

describe('as setas', () => {
  const d = resolvido();
  const seta = (de: string, para: string): Seta => ({ id: 'x', de, para, rotulo: 'algo' });
  const com = (p: Diagrama['pecas']) => ({ ...d, pecas: [...d.pecas, ...p] });

  it('o monitor só recebe', () => {
    expect(problemaDaSeta(d, seta('p-monitor', 'p-cpu'))).toMatch(/só recebe/);
  });

  it('nada chega ao teclado', () => {
    expect(problemaDaSeta(d, seta('p-cpu', 'p-teclado'))).toMatch(/entra/);
  });

  it('o teclado não fala direto com o monitor', () => {
    expect(problemaDaSeta(d, seta('p-teclado', 'p-monitor'))).toMatch(/CPU/);
  });

  it('memória conversa com a CPU nos dois sentidos, e só com ela', () => {
    expect(problemaDaSeta(d, seta('p-ram', 'p-cpu'))).toBeNull();
    expect(problemaDaSeta(d, seta('p-cpu', 'p-ram'))).toBeNull();
    expect(problemaDaSeta(d, seta('p-ram', 'p-monitor'))).not.toBeNull();
  });

  /* Placa de vídeo integrada existe, e é o que a maioria dos notebooks tem. */
  it('aceita a CPU direto no monitor, e também pela placa de vídeo', () => {
    const v = com([{ id: 'p-video', tipo: 'video', x: 0, y: 0 }]);
    expect(problemaDaSeta(v, seta('p-cpu', 'p-monitor'))).toBeNull();
    expect(problemaDaSeta(v, seta('p-cpu', 'p-video'))).toBeNull();
    expect(problemaDaSeta(v, seta('p-video', 'p-monitor'))).toBeNull();
    expect(problemaDaSeta(v, seta('p-video', 'p-cpu'))).not.toBeNull();
  });

  it('a paleta não agrupa por papel: vem na ordem do nome', () => {
    const papeis = PALETA.map(t => PAPEL[t]);
    const agrupado = [...papeis].sort();
    expect(papeis).not.toEqual(agrupado);
  });
});

describe('o código', () => {
  it('67 é 01000011', () => {
    expect(bitsComoTexto(C)).toBe('01000011');
    expect(valorDosBits(C)).toBe(67);
  });

  it('o monitor acende a letra do código, e não a da história', () => {
    expect(letraDoCodigo(65)).toBe('A');
    expect(letraDoCodigo(3)).toBe('?');
  });
});

describe('cada caminho errado deixa a meta dele vermelha', () => {
  it('seta ao contrário deixa "setas" vermelha, mesmo com outro caminho chegando', () => {
    const d = resolvido();
    const errado = { ...d, setas: [...d.setas, { id: 's-9', de: 'p-monitor', para: 'p-cpu', rotulo: 'volta' }] };
    expect(simular(errado).chegou).toBe(true);
    expect(meta('setas').feita(errado)).toBe(false);
  });

  it('apagar todas as setas não deixa "setas" verde', () => {
    expect(meta('setas').feita({ ...resolvido(), setas: [] })).toBe(false);
  });

  it('sem a memória ligada, "setas" fica vermelha', () => {
    const d = resolvido();
    expect(meta('setas').feita({ ...d, setas: d.setas.filter(s => s.id !== 's-3') })).toBe(false);
  });

  it('código de outra letra deixa "codigo" e "simulacao" vermelhas', () => {
    const d = { ...resolvido(), bits: [false, true, false, false, false, false, false, true] };
    const s = comSimulacao(d);
    expect(meta('codigo').feita(s)).toBe(false);
    expect(s.simulacao?.letra).toBe('A');
    expect(meta('simulacao').feita(s)).toBe(false);
  });

  it('a seta do teclado precisa levar o código, e não uma palavra', () => {
    const d = resolvido();
    const semCodigo = { ...d, setas: d.setas.map(s => (s.id === 's-1' ? { ...s, rotulo: 'a tecla' } : s)) };
    expect(meta('rotulos').feita(semCodigo)).toBe(false);
  });

  it('uma seta sem rótulo deixa "rotulos" vermelha', () => {
    const d = resolvido();
    const semUm = { ...d, setas: d.setas.map(s => (s.id === 's-3' ? { ...s, rotulo: '' } : s)) };
    expect(meta('rotulos').feita(semUm)).toBe(false);
  });

  it('mexer depois de simular invalida a simulação e a exportação', () => {
    const d = resolvido();
    const mexido = { ...d, setas: d.setas.map(s => (s.id === 's-2' ? { ...s, rotulo: 'outra coisa' } : s)) };
    expect(meta('simulacao').feita(mexido)).toBe(false);
    expect(meta('exportar').feita(mexido)).toBe(false);
  });

  /* Arrastar uma caixa para arrumar o desenho não muda o caminho. */
  it('mover uma peça não invalida nada', () => {
    const d = resolvido();
    const movido = { ...d, pecas: d.pecas.map(p => (p.id === 'p-ram' ? { ...p, x: 200 } : p)) };
    expect(feitas(movido)).toEqual(METAS_DO_DIAGRAMA.map(m => m.id));
  });
});

describe('o roteiro da explicação', () => {
  it('fala em primeira pessoa e usa os rótulos escritos', () => {
    const r = roteiroDoDiagrama(resolvido());
    expect(r[0]).toMatch(/^Eu aperto a tecla C/);
    expect(r[0]).toContain('64 + 2 + 1 = 67');
    expect(r.join(' ')).toContain('os pixels da letra C');
    expect(r[r.length - 1]).toContain('letra C na tela');
  });

  it('não escreve roteiro para diagrama que não chega', () => {
    expect(roteiroDoDiagrama(DIAGRAMA_INICIAL)).toEqual([]);
  });

  /* Descreve e não julga: quem avalia é o examinador. */
  it('não julga o desenho', () => {
    const texto = roteiroDoDiagrama(resolvido()).join(' ').toLowerCase();
    for (const palavra of ['certo', 'errado', 'correto', 'parabéns', 'ótimo']) {
      expect(texto).not.toContain(palavra);
    }
  });
});
