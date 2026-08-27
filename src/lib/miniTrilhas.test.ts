import { describe, it, expect } from 'vitest';
import { MINI_TRILHAS, topicosDaMiniTrilha } from '../curriculum/miniTrilhas';
import {
  EVENTO_TOPICO, leituraDosEventos, miniTrilhasConcluidas, progressoDasMiniTrilhas,
} from './miniTrilhas';
import type { EventoDeAtividade } from './atividade';

const trilha = MINI_TRILHAS[0];
const topicos = topicosDaMiniTrilha(trilha).map(t => t.id);

const lido = (topico: string, qual = trilha.id): EventoDeAtividade =>
  ({ event_type: EVENTO_TOPICO, metadata: { trilha: qual, topico } });

describe('o que conta como mini-trilha lida', () => {
  it('agrupa os tópicos por mini-trilha', () => {
    const mapa = leituraDosEventos([lido(topicos[0]), lido(topicos[1]), lido('x', 'outra')]);
    expect(mapa[trilha.id]).toEqual(new Set([topicos[0], topicos[1]]));
    expect(mapa.outra).toEqual(new Set(['x']));
  });

  /* Reabrir um tópico grava de novo se a tela tiver perdido o que já sabia —
     e aí a contagem viraria número de cliques, não de tópicos. */
  it('não conta o mesmo tópico duas vezes', () => {
    const mapa = leituraDosEventos([lido(topicos[0]), lido(topicos[0]), lido(topicos[0])]);
    expect(mapa[trilha.id].size).toBe(1);
  });

  it('só está concluída quando todos os tópicos apareceram', () => {
    const quaseTodos = topicos.slice(0, -1).map(t => lido(t));
    expect(miniTrilhasConcluidas(quaseTodos)).toEqual([]);
    expect(miniTrilhasConcluidas([...quaseTodos, lido(topicos[topicos.length - 1])])).toEqual([trilha.id]);
  });

  it('conta quanto falta, para a barra do painel', () => {
    expect(progressoDasMiniTrilhas([lido(topicos[0]), lido(topicos[1])])[trilha.id]).toBe(2);
    expect(progressoDasMiniTrilhas([])[trilha.id]).toBe(0);
  });

  /*
    A coluna é jsonb, e jsonb aceita lista e escalar. Um evento antigo, ou de
    outra versão do aplicativo, não pode derrubar a contagem de quem leu.
  */
  it('ignora evento com metadata que não é do formato esperado', () => {
    const torto: EventoDeAtividade[] = [
      { event_type: EVENTO_TOPICO, metadata: null },
      { event_type: EVENTO_TOPICO, metadata: [1, 2] },
      { event_type: EVENTO_TOPICO, metadata: { trilha: trilha.id } },
      { event_type: EVENTO_TOPICO, metadata: { topico: topicos[0] } },
      { event_type: 'outra_coisa', metadata: { trilha: trilha.id, topico: topicos[0] } },
    ];
    expect(leituraDosEventos(torto)).toEqual({});
    expect(miniTrilhasConcluidas(torto)).toEqual([]);
  });
});
