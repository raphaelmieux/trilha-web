import { useState } from 'react';
import { FileText, Sheet } from 'lucide-react';

/*
 * O Bloco de Notas, e a barra de tarefas que o põe ao lado da planilha.
 *
 * ── Por que ele é arquivo à parte ────────────────────────────────────────
 * Pela razão do `digitalizador.tsx`, e não porque uma cópia esteja a caminho:
 * a arquitetura da casa separa o **programa** do **exercício**, e escrever um
 * editor de texto dentro do componente da lição faria daquele componente duas
 * coisas. O que é do programa mora aqui — a barra de menus, a régua de status,
 * a caixa de abrir —; o que é do exercício mora no laboratório.
 *
 * ── E por que há barra de tarefas ────────────────────────────────────────
 * O módulo 6 da CC-ES008 tem **dois** programas abertos ao mesmo tempo: a
 * planilha que exporta e o editor que mostra o que saiu. Empilhá-los em
 * cartões faria um acordeão que não existe em computador nenhum; existe área
 * de trabalho com janelas por cima e barra de tarefas embaixo. É a decisão do
 * laboratório de compactar da AP041, e está escrita lá.
 *
 * Ela é uma barra, e não uma área de trabalho inteira: não há ícone solto, não
 * há papel de parede e não há janela arrastável, porque a lição não pede nada
 * disso. O que ela precisa é do caminho de um programa ao outro, e é isso que
 * a barra de tarefas é.
 *
 * ── O arquivo abre só de leitura, e é decisão ────────────────────────────
 * O CSV é o **retrato** que saiu da planilha: a partir da exportação ele é
 * outra coisa, que não se refaz quando a planilha muda. Consertar dentro dele
 * é o que a CC-ES004 já nomeia no PDF — acaba-se com dois arquivos diferentes,
 * e o editável, que é o que vai ser usado no ano que vem, fica sendo o errado.
 * O conserto é na origem, e exportar de novo.
 *
 * E há o outro lado, que é do exercício: a lição do módulo 6 manda **provocar**
 * a aspa escrevendo um ponto e vírgula dentro de uma resposta. Num editor que
 * aceitasse digitação, digitar a aspa à mão fecharia a tarefa sem nada ter sido
 * provocado — é a família do "Figura 1" digitado da CC-ES002.
 */

export const CSS_DO_BLOCO_DE_NOTAS = `
.bn-area {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  background: #1F1D1B;
}
.bn-palco { flex: 1; min-height: 0; display: flex; }

.bn-janela {
  flex: 1; min-width: 0; display: flex; flex-direction: column;
  background: #FFFFFF; color: #1B1B1B;
  font-family: "Segoe UI", system-ui, sans-serif; font-size: 13px;
}
.bn-titulo {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; background: #F3F3F3; border-bottom: 1px solid #E1DFDD;
  font-size: 12px; color: #1B1B1B;
}
.bn-menus { display: flex; gap: 2px; padding: 2px 6px; border-bottom: 1px solid #E1DFDD; }
.bn-menu {
  padding: 3px 10px; border-radius: 3px; font-size: 12.5px;
  background: transparent; border: 1px solid transparent; color: #1B1B1B;
}
.bn-menu:hover { background: #EDEBE9; }
.bn-menu[aria-expanded="true"] { background: #E1DFDD; border-color: #C8C6C4; }
.bn-lista {
  position: absolute; z-index: 5; min-width: 200px;
  background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 4px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.18); padding: 4px; display: flex; flex-direction: column;
}
.bn-item {
  text-align: left; padding: 6px 10px; border-radius: 3px; font-size: 12.5px;
  background: transparent; border: none; color: #1B1B1B; width: 100%;
}
.bn-item:hover { background: #EDEBE9; }
.bn-item:disabled { color: #A19F9D; }

/* O texto do arquivo. Monoespaçado porque é assim que um editor de texto
   simples mostra: é a fonte que deixa o ponto e vírgula e a aspa na mesma
   largura de tudo o mais, e é por elas que a lição pergunta. */
.bn-texto {
  flex: 1; min-height: 0; overflow: auto; margin: 0; padding: 10px 12px;
  font-family: Consolas, "Courier New", monospace; font-size: 12.5px; line-height: 1.55;
  white-space: pre; color: #1B1B1B; background: #FFFFFF;
}
.bn-vazio { color: #605E5C; font-style: italic; }

.bn-status {
  display: flex; align-items: center; gap: 14px;
  padding: 4px 12px; border-top: 1px solid #E1DFDD; background: #F3F3F3;
  /* 5,08:1 sobre #F3F3F3 — o cinza do Windows mede 2,6:1 e some numa régua de
     11px, que é o defeito do contador de folhas da CC-ES002. */
  color: #706E6C; font-size: 11px;
}

/* A barra de tarefas. Ela é do sistema, e não da janela: fica embaixo de tudo,
   atravessa a largura inteira, e é por ela que se troca de programa. */
.bn-tarefas {
  flex: none; display: flex; align-items: center; gap: 4px;
  height: 30px; padding: 0 6px; background: #1F1D1B; border-top: 1px solid #3B3835;
}
.bn-tarefa {
  display: flex; align-items: center; gap: 6px;
  height: 24px; padding: 0 10px; border-radius: 3px; font-size: 11.5px;
  background: transparent; border: 1px solid transparent; color: #E6E4E1;
}
.bn-tarefa:hover { background: #33302D; }
.bn-tarefa[aria-current="true"] { background: #3B3835; border-color: #55514D; }
`;

/* ── A barra de tarefas ───────────────────────────────────────────────────── */

export type ProgramaAberto = 'planilha' | 'texto';

export function BarraDeTarefas({ atual, aoTrocar }: {
  atual: ProgramaAberto;
  aoTrocar: (p: ProgramaAberto) => void;
}) {
  return (
    <div className="bn-tarefas" role="toolbar" aria-label="Barra de tarefas">
      <button
        type="button" className="bn-tarefa" aria-current={atual === 'planilha'}
        onClick={() => aoTrocar('planilha')}
      >
        <Sheet size={15} aria-hidden /> Excel
      </button>
      <button
        type="button" className="bn-tarefa" aria-current={atual === 'texto'}
        onClick={() => aoTrocar('texto')}
      >
        <FileText size={15} aria-hidden /> Bloco de Notas
      </button>
    </div>
  );
}

/* ── A janela ─────────────────────────────────────────────────────────────── */

export interface ArquivoDeTexto {
  nome: string;
  conteudo: string;
}

export function BlocoDeNotas({ aberto, naPasta, aoAbrir }: {
  /** O arquivo aberto, ou `null` para a janela sem título, que é como ele abre. */
  aberto: ArquivoDeTexto | null;
  /** O que existe na pasta de downloads. Vazia, a caixa de abrir diz isso. */
  naPasta: ArquivoDeTexto[];
  aoAbrir: (nome: string) => void;
}) {
  const [menu, setMenu] = useState<string | null>(null);
  const [caixa, setCaixa] = useState(false);

  const linhas = aberto ? aberto.conteudo.replace(/\n$/, '').split('\n') : [];

  return (
    <div className="bn-janela">
      <div className="bn-titulo">
        <FileText size={15} aria-hidden />
        {/* O nome do arquivo no alto, como o programa de verdade mostra — e
            "Sem título" quando nada foi aberto, que é o que ele escreve. */}
        <span>{aberto ? aberto.nome : 'Sem título'} — Bloco de Notas</span>
      </div>

      <div className="bn-menus" style={{ position: 'relative' }}>
        <button
          type="button" className="bn-menu" aria-expanded={menu === 'arquivo'} aria-haspopup="menu"
          onClick={() => setMenu(m => (m === 'arquivo' ? null : 'arquivo'))}
        >
          Arquivo
        </button>
        {menu === 'arquivo' && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 4 }}
              onPointerDown={() => setMenu(null)}
            />
            <div className="bn-lista" role="menu" style={{ left: 6, top: 28 }}>
              <button
                type="button" className="bn-item" role="menuitem"
                onClick={() => { setMenu(null); setCaixa(true); }}
              >
                Abrir…
              </button>
            </div>
          </>
        )}
      </div>

      {aberto
        ? (
          <pre className="bn-texto" aria-label={`Conteúdo de ${aberto.nome}`}>
            {aberto.conteudo}
          </pre>
        )
        : (
          <div className="bn-texto bn-vazio">
            Nenhum arquivo aberto. Use Arquivo → Abrir.
          </div>
        )}

      <div className="bn-status">
        <span>{aberto ? `${linhas.length} ${linhas.length === 1 ? 'linha' : 'linhas'}` : 'Ln 1, Col 1'}</span>
        <span>UTF-8</span>
        {/* Só de leitura, e a régua diz isso: o arquivo é o retrato que saiu da
            planilha, e consertar dentro dele deixaria a planilha e o arquivo
            discordando — é o PDF que congela, da CC-ES004. */}
        {aberto && <span style={{ marginLeft: 'auto' }}>Somente leitura</span>}
      </div>

      {caixa && (
        <>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 6 }}
            onPointerDown={() => setCaixa(false)}
          />
          <div
            role="dialog" aria-modal="true" aria-label="Abrir"
            style={{
              position: 'absolute', zIndex: 7, left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)', width: 'min(380px, 88%)',
              background: '#FFFFFF', border: '1px solid #C8C6C4', borderRadius: 6,
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)', padding: 14,
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: '#1B1B1B' }}>Abrir</h3>
            <p style={{ fontSize: 12, color: '#605E5C', marginBottom: 10 }}>Downloads</p>
            {naPasta.length === 0
              ? (
                <p style={{ fontSize: 12.5, color: '#605E5C' }}>
                  A pasta está vazia. Exporte a planilha antes.
                </p>
              )
              : naPasta.map(a => (
                <button
                  key={a.nome} type="button" className="bn-item"
                  onClick={() => { aoAbrir(a.nome); setCaixa(false); }}
                >
                  <FileText size={14} aria-hidden style={{ display: 'inline', marginRight: 6 }} />
                  {a.nome}
                </button>
              ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="button" className="bn-item" style={{ width: 'auto' }}
                onClick={() => setCaixa(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
