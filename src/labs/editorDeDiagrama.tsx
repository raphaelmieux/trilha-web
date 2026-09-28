import type { KeyboardEvent, PointerEvent } from 'react';
import { CAIXA, ICONE_DA_PECA, pontaNaBorda } from './pecasDoDiagrama';
import {
  ALTURA, LARGURA, NOME_DA_PECA,
  type Diagrama, type Peca, type Seta,
} from './diagramaDoComputador';

/*
 * A prancheta do editor de diagramas: as peças e as setas, desenhadas.
 *
 * Mora fora do laboratório pela divisão de sempre: o que é do **programa** —
 * como uma peça se desenha, onde a seta encosta na caixa, o que a seleção
 * mostra — fica aqui; o que é do **exercício** — que peças a lição cobra, o
 * que a simulação conta — fica no laboratório e no modelo. E ela não guarda
 * estado nenhum: seleção, arrasto e modo vêm de quem a desenha, que é quem
 * responde à verificação.
 *
 * Não imita marca nenhuma. O arranjo — paleta à esquerda, prancheta no meio,
 * propriedades à direita — é o que os editores de diagrama têm em comum, como
 * o do editor de código em `ide.tsx`.
 */

interface Props {
  diagrama: Diagrama;
  selecionada: string | null;
  /** A peça de onde a próxima seta vai sair, no modo Conectar. */
  origem: string | null;
  /** As setas por onde a simulação passou, para pintar o caminho. */
  caminho: string[];
  /** As setas no sentido errado, desde a última simulação. */
  erradas: string[];
  /** A letra que o monitor acende, quando a simulação chegou nele. */
  letra: string | null;
  aoApertarPeca: (id: string, e: PointerEvent<SVGGElement>) => void;
  aoTeclarPeca: (id: string, e: KeyboardEvent<SVGGElement>) => void;
  aoEscolherSeta: (id: string) => void;
  aoApertarFundo: () => void;
  aoMover: (e: PointerEvent<SVGSVGElement>) => void;
  aoSoltar: (e: PointerEvent<SVGSVGElement>) => void;
  /** Sem ele a prancheta é só imagem — é a prévia da exportação. */
  interativa?: boolean;
}

export default function Prancheta({
  diagrama, selecionada, origem, caminho, erradas, letra,
  aoApertarPeca, aoTeclarPeca, aoEscolherSeta, aoApertarFundo, aoMover, aoSoltar,
  interativa = true,
}: Props) {
  const pecaDe = (id: string) => diagrama.pecas.find(p => p.id === id);

  const desenharSeta = (s: Seta) => {
    const de = pecaDe(s.de);
    const para = pecaDe(s.para);
    if (!de || !para) return null;
    const fim = pontaNaBorda(de, para);
    const inicio = pontaNaBorda(para, de);
    const meio = { x: (inicio.x + fim.x) / 2, y: (inicio.y + fim.y) / 2 };
    const noCaminho = caminho.includes(s.id);
    const errada = erradas.includes(s.id);
    const escolhida = selecionada === s.id;
    const cor = errada ? '#B42318' : noCaminho ? '#067647' : '#344054';
    const marcador = errada ? 'dg-ponta-erro' : noCaminho ? 'dg-ponta-ok' : 'dg-ponta';
    const nomeDe = NOME_DA_PECA[de.tipo];
    const nomePara = NOME_DA_PECA[para.tipo];
    return (
      <g key={s.id} className="dg-seta"
        {...(interativa ? {
          role: 'button', tabIndex: 0,
          'aria-label': `Seta de ${nomeDe} para ${nomePara}${s.rotulo.trim() ? `: ${s.rotulo.trim()}` : ', sem rótulo'}`,
          'aria-pressed': escolhida,
          onClick: (e: React.MouseEvent) => { e.stopPropagation(); aoEscolherSeta(s.id); },
          onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
          onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); aoEscolherSeta(s.id); } },
        } : {})}>
        {/* A linha larga e invisível é a área de clique: uma linha de 2px
            é impossível de acertar com o dedo. */}
        <line x1={inicio.x} y1={inicio.y} x2={fim.x} y2={fim.y} stroke="transparent" strokeWidth={22} />
        <line x1={inicio.x} y1={inicio.y} x2={fim.x} y2={fim.y}
          stroke={escolhida ? '#1570EF' : cor} strokeWidth={escolhida ? 3.5 : 2.5}
          strokeDasharray={noCaminho ? '8 5' : undefined}
          className={noCaminho ? 'dg-bits' : undefined}
          markerEnd={`url(#${escolhida ? 'dg-ponta-sel' : marcador})`} />
        {s.rotulo.trim() && (
          <g>
            <rect x={meio.x - rotuloLargura(s.rotulo) / 2} y={meio.y - 11} width={rotuloLargura(s.rotulo)} height={20}
              rx={4} fill="#FFFFFF" stroke="#D0D5DD" />
            <text x={meio.x} y={meio.y + 3.5} textAnchor="middle" fontSize={11.5} fill="#101828"
              fontFamily="ui-monospace, 'Cascadia Mono', Consolas, monospace">{s.rotulo.trim()}</text>
          </g>
        )}
      </g>
    );
  };

  const desenharPeca = (p: Peca) => {
    const Icone = ICONE_DA_PECA[p.tipo];
    const escolhida = selecionada === p.id;
    const eOrigem = origem === p.id;
    const x = p.x - CAIXA.largura / 2;
    const y = p.y - CAIXA.altura / 2;
    return (
      <g key={p.id} className="dg-peca"
        {...(interativa ? {
          role: 'button', tabIndex: 0,
          'aria-label': NOME_DA_PECA[p.tipo],
          'aria-pressed': escolhida || eOrigem,
          onPointerDown: (e: PointerEvent<SVGGElement>) => aoApertarPeca(p.id, e),
          onKeyDown: (e: KeyboardEvent<SVGGElement>) => aoTeclarPeca(p.id, e),
        } : {})}>
        <rect x={x} y={y} width={CAIXA.largura} height={CAIXA.altura} rx={10}
          fill={eOrigem ? '#EFF8FF' : '#FFFFFF'}
          stroke={escolhida || eOrigem ? '#1570EF' : '#98A2B3'}
          strokeWidth={escolhida || eOrigem ? 2.5 : 1.5}
          strokeDasharray={eOrigem ? '5 3' : undefined} />
        <Icone x={p.x - 13} y={y + 9} width={26} height={26} color="#344054" aria-hidden />
        <text x={p.x} y={y + CAIXA.altura - 13} textAnchor="middle" fontSize={12.5} fill="#101828" fontWeight={600}>
          {NOME_DA_PECA[p.tipo]}
        </text>
        {p.tipo === 'monitor' && letra && (
          <text x={p.x + 34} y={y + 32} textAnchor="middle" fontSize={24} fontWeight={700} fill="#067647"
            aria-label={`O monitor mostra a letra ${letra}`}>{letra}</text>
        )}
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="dg-prancheta" role="img"
      aria-label="Prancheta do diagrama"
      onPointerDown={interativa ? aoApertarFundo : undefined}
      onPointerMove={interativa ? aoMover : undefined}
      onPointerUp={interativa ? aoSoltar : undefined}>
      <defs>
        <pattern id="dg-grade" width={20} height={20} patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#EAECF0" strokeWidth={1} />
        </pattern>
        {[['dg-ponta', '#344054'], ['dg-ponta-ok', '#067647'], ['dg-ponta-erro', '#B42318'], ['dg-ponta-sel', '#1570EF']].map(([id, cor]) => (
          <marker key={id} id={id} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={cor} />
          </marker>
        ))}
      </defs>
      <rect width={LARGURA} height={ALTURA} fill="url(#dg-grade)" />
      {diagrama.setas.map(desenharSeta)}
      {diagrama.pecas.map(desenharPeca)}
    </svg>
  );
}

/** Largura aproximada do rótulo: monoespaçada, então a conta é por caractere. */
const rotuloLargura = (r: string) => Math.max(40, r.trim().length * 7 + 14);
