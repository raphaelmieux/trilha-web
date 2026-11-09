import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { posicaoAoArrastar } from '../../lib/ordenar';

/*
 * Pôr coisas em ordem — a única forma de fazer isso na plataforma.
 *
 * Havia duas: as questões de ordenar do currículo tinham a sua, e o laboratório
 * de cuidados com o computador tinha outra, escrita à mão, só com as setinhas.
 * Quem arrastava numa e não conseguia na outra concluía, com razão, que a
 * segunda estava quebrada.
 *
 * Então isto aqui não é uma conveniência: é o lugar onde a forma de ordenar é
 * decidida uma vez. Qualquer tela nova que precise pôr passos, etapas ou eventos
 * em ordem usa este componente — e ganha os dois caminhos de graça.
 *
 * ── Por que dois caminhos ────────────────────────────────────────────────
 * Arrastar é o gesto que a pessoa já conhece de outras listas. As setas são o
 * caminho de quem usa teclado ou leitor de tela, e de quem não acerta o gesto.
 * Nenhuma tarefa pode depender de só um dos dois.
 *
 * ── Por que ponteiro, e não o arrastar do HTML ───────────────────────────
 * O arrastar nativo (`draggable`, `dragstart`, `dragover`) era o que estava
 * aqui, e ele funciona no Chrome e em mais nenhum lugar com certeza: o Firefox
 * só começa o gesto se o `dragstart` gravar alguma coisa em `dataTransfer`, e
 * em tela de toque o evento simplesmente não existe. A lista parecia pronta —
 * alça desenhada, cursor de mão, "arraste para trocar de lugar" escrito embaixo
 * — e não respondia, sem erro nenhum no console. É o pior jeito de falhar: a
 * pessoa conclui que não entendeu o gesto.
 *
 * Os eventos de ponteiro são os mesmos para mouse, caneta e dedo, em todo
 * navegador. Três decisões erram calado se invertidas:
 *
 * - **o movimento é ouvido na janela, e não na linha.** A linha que está sendo
 *   arrastada muda de lugar no DOM a cada troca, e o navegador pode soltar a
 *   captura do ponteiro de um nó que saiu e voltou; a janela não sai de lugar;
 * - **no dedo, só a alça arrasta.** Encostar no resto da linha precisa continuar
 *   rolando a página, senão uma lista de cinco linhas prende a tela inteira do
 *   celular. A alça tem `touch-action: none`, e é por ela que o gesto começa;
 * - **quatro pixels antes de virar arrasto.** Um clique para ler a linha não
 *   pode trocar nada de lugar.
 */

export interface ItemOrdenavel {
  id: string;
  /** O que aparece na linha. Texto simples ou algo montado por quem chama. */
  conteudo: ReactNode;
}

/** Quanto o ponteiro anda antes de o aperto virar arrasto. */
const FOLGA_DO_CLIQUE = 4;

interface Gesto {
  id: string;
  pointerId: number;
  x0: number;
  y0: number;
  ativo: boolean;
  soltar: () => void;
}

export default function ListaOrdenavel({
  itens,
  ordem,
  aoReordenar,
  travada = false,
  estiloDaLinha,
  numerar = true,
}: {
  itens: ItemOrdenavel[];
  /** Os ids na ordem atual. Quem chama é dono do estado. */
  ordem: string[];
  aoReordenar: (nova: string[]) => void;
  /** Depois de confirmado, ninguém mexe mais. */
  travada?: boolean;
  /** Cor de fundo e borda de cada linha, decididas por quem chama. */
  estiloDaLinha?: (id: string, posicao: number) => React.CSSProperties;
  numerar?: boolean;
}) {
  const [arrastando, setArrastando] = useState<string | null>(null);
  const linhas = useRef(new Map<string, HTMLLIElement>());
  const gesto = useRef<Gesto | null>(null);

  /* Os ouvintes da janela vivem entre renderizações; sem os refs eles leriam a
     ordem de quando o gesto começou, e cada troca desfaria a anterior. */
  const ordemAtual = useRef(ordem);
  ordemAtual.current = ordem;
  const reordenar = useRef(aoReordenar);
  reordenar.current = aoReordenar;

  /* Desmontar no meio do gesto não pode deixar ouvinte pendurado na janela. */
  useEffect(() => () => gesto.current?.soltar(), []);

  const trocar = (id: string, dir: -1 | 1) => {
    if (travada) return;
    const arr = [...ordem];
    const i = arr.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    aoReordenar(arr);
  };

  /*
    Reordena enquanto a peça passa, e não só ao soltar.
    A lista acompanha o gesto, então dá para ver onde a peça vai cair antes de
    largá-la — soltar às cegas e conferir depois é o que torna arrastar ruim.
  */
  const mover = (id: string, y: number) => {
    const atual = ordemAtual.current;
    const outros = atual.filter(i => i !== id);
    const centros = outros.map(i => {
      const r = linhas.current.get(i)?.getBoundingClientRect();
      return r ? r.top + r.height / 2 : 0;
    });
    const nova = [...outros];
    nova.splice(posicaoAoArrastar(centros, y), 0, id);
    if (nova.some((v, k) => v !== atual[k])) reordenar.current(nova);
  };

  const apertar = (id: string, e: React.PointerEvent<HTMLLIElement>) => {
    if (travada || gesto.current || e.button !== 0) return;
    const alvo = e.target as Element;
    if (alvo.closest('button, a, input, select, textarea')) return;
    if (e.pointerType !== 'mouse' && !alvo.closest('[data-alca]')) return;

    const aoMover = (ev: PointerEvent) => {
      const g = gesto.current;
      if (!g || ev.pointerId !== g.pointerId) return;
      if (!g.ativo) {
        if (Math.hypot(ev.clientX - g.x0, ev.clientY - g.y0) < FOLGA_DO_CLIQUE) return;
        g.ativo = true;
        setArrastando(g.id);
      }
      ev.preventDefault();
      mover(g.id, ev.clientY);
    };
    const aoSoltar = (ev: PointerEvent) => {
      if (gesto.current && ev.pointerId === gesto.current.pointerId) gesto.current.soltar();
    };
    const soltar = () => {
      window.removeEventListener('pointermove', aoMover);
      window.removeEventListener('pointerup', aoSoltar);
      window.removeEventListener('pointercancel', aoSoltar);
      gesto.current = null;
      setArrastando(null);
    };

    gesto.current = { id, pointerId: e.pointerId, x0: e.clientX, y0: e.clientY, ativo: false, soltar };
    window.addEventListener('pointermove', aoMover);
    window.addEventListener('pointerup', aoSoltar);
    window.addEventListener('pointercancel', aoSoltar);
  };

  return (
    <div>
      <ol className="space-y-2">
        {ordem.map((id, idx) => {
          const item = itens.find(i => i.id === id);
          if (!item) return null;
          return (
            <li
              key={id}
              ref={el => { if (el) linhas.current.set(id, el); else linhas.current.delete(id); }}
              data-ordenavel={travada ? undefined : 'true'}
              onPointerDown={e => apertar(id, e)}
              className="flex items-center gap-2 p-3 rounded-lg transition"
              style={{
                backgroundColor: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                ...estiloDaLinha?.(id, idx),
                opacity: arrastando === id ? 0.5 : 1,
                cursor: travada ? 'default' : arrastando === id ? 'grabbing' : 'grab',
                /* Sem isso, arrastar com o mouse pinta de azul o texto das
                   linhas por onde ele passa. */
                userSelect: travada ? undefined : 'none',
              }}
            >
              {!travada && (
                <span data-alca className="flex-shrink-0 -m-2 p-2" style={{ touchAction: 'none' }}>
                  <GripVertical className="w-4 h-4"
                    style={{ color: 'var(--color-text-faint)' }} aria-hidden="true" />
                </span>
              )}
              {numerar && (
                <span className="w-6 text-center text-sm font-bold"
                  style={{ color: 'var(--color-secondary)' }}>{idx + 1}</span>
              )}
              <span className="flex-1 text-sm" style={{ color: 'var(--color-text)' }}>{item.conteudo}</span>
              <button onClick={() => trocar(id, -1)} disabled={idx === 0 || travada}
                className="btn-secondary text-xs py-1 px-2" aria-label="Subir um lugar">
                <ArrowUp className="w-3 h-3" />
              </button>
              <button onClick={() => trocar(id, 1)} disabled={idx === ordem.length - 1 || travada}
                className="btn-secondary text-xs py-1 px-2" aria-label="Descer um lugar">
                <ArrowDown className="w-3 h-3" />
              </button>
            </li>
          );
        })}
      </ol>
      {!travada && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-faint)' }}>
          Arraste para trocar de lugar, ou use as setas. No celular, arraste pelos pontinhos.
        </p>
      )}
    </div>
  );
}
