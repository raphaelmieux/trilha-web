import {
  Keyboard, Mouse, ScanLine, Mic, Cpu, MemoryStick, HardDrive, CircuitBoard,
  Monitor, Printer, Speaker, type LucideIcon,
} from 'lucide-react';
import type { Peca, TipoDePeca } from './diagramaDoComputador';

/*
 * Como uma peça do editor de diagramas se desenha — o ícone, o tamanho da
 * caixa e onde a seta encosta nela.
 *
 * Fora de `editorDeDiagrama.tsx` porque a paleta do laboratório também lê o
 * ícone, e arquivo de componente que exporta constante perde o recarregamento
 * rápido: o lint aponta, e é a mesma divisão de `iconesDeLicao.ts`.
 */

export const ICONE_DA_PECA: Record<TipoDePeca, LucideIcon> = {
  teclado: Keyboard,
  mouse: Mouse,
  scanner: ScanLine,
  microfone: Mic,
  cpu: Cpu,
  ram: MemoryStick,
  disco: HardDrive,
  video: CircuitBoard,
  monitor: Monitor,
  impressora: Printer,
  'caixa-de-som': Speaker,
};

/** O tamanho da caixa de uma peça, no espaço lógico da prancheta. */
export const CAIXA = { largura: 118, altura: 70 };

/**
 * Onde a seta encosta na borda da caixa, e não no centro dela.
 *
 * Seta que termina no centro some debaixo da peça, e a ponta — que é a única
 * coisa que diz o sentido — fica escondida. Justamente o que o requisito pede
 * para mostrar.
 */
export function pontaNaBorda(de: Peca, para: Peca): { x: number; y: number } {
  const dx = de.x - para.x;
  const dy = de.y - para.y;
  if (dx === 0 && dy === 0) return { x: para.x, y: para.y };
  const meiaL = CAIXA.largura / 2 + 4;
  const meiaA = CAIXA.altura / 2 + 4;
  const escala = Math.min(
    dx === 0 ? Infinity : meiaL / Math.abs(dx),
    dy === 0 ? Infinity : meiaA / Math.abs(dy),
  );
  return { x: para.x + dx * escala, y: para.y + dy * escala };
}

