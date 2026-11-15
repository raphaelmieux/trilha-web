/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { conectarCuriosidades, registrarCuriosidade, acharSegredo } from './registroDeCuriosidades';
import { NOMES_DOS_EVENTOS_DAS_CURIOSIDADES } from './eventosDasCuriosidades';
import { EVENTOS_DA_OFENSIVA } from './ofensiva';
import { EVENTOS_COM_XP } from './xp';
import { nomeDoAtalho, ouvirCuriosidadesDaMoldura } from '../labs/curiosidadesDaMoldura';

function gravadorDeTeste(falhar = false) {
  const gravados: [string, Record<string, string>][] = [];
  const avaliar = vi.fn();
  return {
    gravados, avaliar,
    g: {
      gravar: async (tipo: string, metadata: Record<string, string>) => {
        if (falhar) throw new Error('sem rede');
        gravados.push([tipo, metadata]);
      },
      avaliar,
    },
  };
}

const esperar = () => new Promise(r => setTimeout(r, 0));

beforeEach(() => {
  localStorage.clear();
  conectarCuriosidades(null, null);
});

describe('o registro das curiosidades', () => {
  it('sem ninguém entrado, não grava nada', async () => {
    registrarCuriosidade('menu');
    const t = gravadorDeTeste();
    conectarCuriosidades('ana', t.g);
    await esperar();
    /* E o que aconteceu antes de entrar não entra na conta de quem entra. */
    expect(t.gravados).toEqual([]);
  });

  it('grava uma vez por conteúdo, e lembra depois de recarregar', async () => {
    const t = gravadorDeTeste();
    conectarCuriosidades('ana', t.g);
    registrarCuriosidade('menu');
    registrarCuriosidade('menu');
    registrarCuriosidade('atalho', { atalho: 'Ctrl+C' });
    registrarCuriosidade('atalho', { atalho: 'Ctrl+V' });
    registrarCuriosidade('atalho', { atalho: 'Ctrl+C' });
    await esperar();
    expect(t.gravados.map(([tipo, m]) => `${tipo} ${m.atalho ?? ''}`.trim())).toEqual([
      'menu_de_contexto_aberto', 'atalho_usado Ctrl+C', 'atalho_usado Ctrl+V',
    ]);

    const depois = gravadorDeTeste();
    conectarCuriosidades('ana', depois.g);
    registrarCuriosidade('menu');
    await esperar();
    expect(depois.gravados).toEqual([]);
  });

  /* O computador do clube é de todo mundo: a lembrança é da conta. */
  it('a lembrança de uma conta não vale para a seguinte', async () => {
    conectarCuriosidades('ana', gravadorDeTeste().g);
    registrarCuriosidade('menu');
    const bia = gravadorDeTeste();
    conectarCuriosidades('bia', bia.g);
    registrarCuriosidade('menu');
    await esperar();
    expect(bia.gravados.map(([tipo]) => tipo)).toEqual(['menu_de_contexto_aberto']);
  });

  it('o que não gravou tenta de novo na próxima vez', async () => {
    conectarCuriosidades('ana', gravadorDeTeste(true).g);
    registrarCuriosidade('menu');
    await esperar();
    const t = gravadorDeTeste();
    conectarCuriosidades('ana', t.g);
    registrarCuriosidade('menu');
    await esperar();
    expect(t.gravados).toHaveLength(1);
  });

  it('o segredo grava o código dele', async () => {
    const t = gravadorDeTeste();
    conectarCuriosidades('ana', t.g);
    acharSegredo('quem_sou_eu');
    await esperar();
    expect(t.gravados).toEqual([['segredo_achado', { segredo: 'quem_sou_eu' }]]);
  });

  /* Cinco atalhos em dois segundos são uma avaliação, e não cinco. */
  it('avalia as insígnias uma vez depois do que chegou junto', async () => {
    vi.useFakeTimers();
    try {
      const t = gravadorDeTeste();
      conectarCuriosidades('ana', t.g);
      for (const a of ['Ctrl+C', 'Ctrl+V', 'Ctrl+X']) registrarCuriosidade('atalho', { atalho: a });
      await vi.advanceTimersByTimeAsync(5000);
      expect(t.avaliar).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('os eventos das curiosidades', () => {
  /* Não são módulo vencido: um menu aberto não faz a ofensiva andar nem rende XP. */
  it('ficam fora da ofensiva e do XP', () => {
    expect(NOMES_DOS_EVENTOS_DAS_CURIOSIDADES.length).toBe(8);
    for (const e of NOMES_DOS_EVENTOS_DAS_CURIOSIDADES) {
      expect(EVENTOS_DA_OFENSIVA, e).not.toContain(e);
      expect(EVENTOS_COM_XP, e).not.toContain(e);
    }
  });

  /* O mural mostra os últimos dez eventos; sem o filtro na consulta, dez
     atalhos o encheriam de "Atalho usado". */
  it('ficam fora do mural de Atividade Recente', () => {
    const fonte = readFileSync('src/pages/DashboardPage.tsx', 'utf8');
    const consulta = fonte.slice(fonte.indexOf("from('activity_events').select('*')"));
    expect(consulta.slice(0, 400)).toContain(".not('event_type', 'in', `(${NOMES_DOS_EVENTOS_DAS_CURIOSIDADES.join(',')})`)");
  });
});

describe('o atalho e o menu da moldura', () => {
  it('nomeia o atalho como a dica da faixa', () => {
    const t = (key: string, m: Partial<Record<'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey', boolean>> = {}) =>
      nomeDoAtalho({ key, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...m });
    expect(t('c', { ctrlKey: true })).toBe('Ctrl+C');
    expect(t('N', { ctrlKey: true, shiftKey: true })).toBe('Ctrl+Shift+N');
    expect(t('c', { metaKey: true })).toBe('Ctrl+C');
    expect(t('F5')).toBe('F5');
    expect(t('a')).toBeUndefined();
    expect(t('ArrowDown')).toBeUndefined();
    expect(t('Control', { ctrlKey: true })).toBeUndefined();
  });

  it('só conta o que o programa atendeu', async () => {
    const t = gravadorDeTeste();
    conectarCuriosidades('ana', t.g);
    const parar = ouvirCuriosidadesDaMoldura(window);
    try {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true, cancelable: true }));
      const atendido = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, cancelable: true });
      atendido.preventDefault();
      window.dispatchEvent(atendido);
      window.dispatchEvent(new MouseEvent('contextmenu', { cancelable: true }));
      await esperar();
      await esperar();
      expect(t.gravados).toEqual([['atalho_usado', { atalho: 'Ctrl+Z' }]]);

      /* Um laboratório que ouve na janela e se inscreveu depois da moldura
         também conta: a pergunta é feita depois de todos responderem. */
      const tarde = (e: Event) => e.preventDefault();
      window.addEventListener('contextmenu', tarde);
      window.dispatchEvent(new MouseEvent('contextmenu', { cancelable: true }));
      window.removeEventListener('contextmenu', tarde);
      await esperar();
      await esperar();
      expect(t.gravados.map(([tipo]) => tipo)).toContain('menu_de_contexto_aberto');
    } finally {
      parar();
    }
  });
});
