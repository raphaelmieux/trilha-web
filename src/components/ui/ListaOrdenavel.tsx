import { useState, type ReactNode } from 'react';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

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
 * Arrastar é o gesto que a pessoa já conhece de outras listas, e é o principal
 * no computador. As setas existem porque o evento de arrastar do HTML não existe
 * em tela de toque, e boa parte dos desbravadores abre a trilha pelo celular.
 * Nenhuma tarefa pode depender de só um dos dois.
 */

export interface ItemOrdenavel {
  id: string;
  /** O que aparece na linha. Texto simples ou algo montado por quem chama. */
  conteudo: ReactNode;
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
    Reordena enquanto o item passa por cima, e não só ao soltar.
    A lista acompanha o gesto, então dá para ver onde a peça vai cair antes de
    largá-la — soltar às cegas e conferir depois é o que torna arrastar ruim.
  */
  const passarSobre = (idAlvo: string) => {
    if (travada || !arrastando || arrastando === idAlvo) return;
    const arr = [...ordem];
    const de = arr.indexOf(arrastando);
    const para = arr.indexOf(idAlvo);
    if (de < 0 || para < 0) return;
    arr.splice(para, 0, ...arr.splice(de, 1));
    aoReordenar(arr);
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
              draggable={!travada}
              onDragStart={() => setArrastando(id)}
              onDragEnd={() => setArrastando(null)}
              onDragOver={e => { e.preventDefault(); passarSobre(id); }}
              onDrop={e => { e.preventDefault(); setArrastando(null); }}
              className="flex items-center gap-2 p-3 rounded-lg transition"
              style={{
                backgroundColor: 'var(--color-bg-input)',
                border: '1px solid var(--color-border)',
                ...estiloDaLinha?.(id, idx),
                opacity: arrastando === id ? 0.5 : 1,
                cursor: travada ? 'default' : 'grab',
              }}
            >
              {!travada && (
                <GripVertical className="w-4 h-4 flex-shrink-0"
                  style={{ color: 'var(--color-text-faint)' }} aria-hidden="true" />
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
          Arraste para trocar de lugar, ou use as setas.
        </p>
      )}
    </div>
  );
}
