import { useRef } from 'react';
import {
  Files, Search, GitBranch, Blocks, Play, RotateCw, Lock,
  FileCode, ChevronDown, CircleAlert, TriangleAlert, Code2, Eye,
} from 'lucide-react';
import { realcarHtml, contarLinhas } from './realce';

/*
 * A moldura do editor de código, compartilhada pelos laboratórios de HTML.
 *
 * Antes eram dois cartões da plataforma lado a lado: um com um campo de texto,
 * outro com um iframe. Praticavam o HTML e não se pareciam com nada — quem
 * escreve HTML de verdade escreve num editor de código, e é esse editor que o
 * desbravador vai abrir depois: barra lateral com os arquivos, guias em cima,
 * números de linha, cores por tipo de coisa, prévia ao lado e uma régua de
 * status embaixo dizendo quantos problemas existem.
 *
 * É de propósito que não imita marca nenhuma. Word e Explorador são *aquele*
 * programa; editor de código não é — o desbravador pode encontrar o VS Code,
 * o Notepad++ ou o editor do celular, e o que se repete entre os três é este
 * arranjo. Imitar um deles ensinaria a reconhecer o logotipo errado.
 *
 * A paleta é escura porque editor de código é escuro, e porque aqui não há o
 * risco do CLAUDE.md: nada herda cor da plataforma, cada peça declara a sua.
 */

export const CSS_IDE = `
  .ide {
    flex: 1; min-height: 0; display: flex; flex-direction: column;
    background: #1E1E1E; color: #D4D4D4;
    font-family: 'Segoe UI', system-ui, Roboto, sans-serif;
  }
  .ide-titulo {
    flex: none; height: 34px; display: flex; align-items: center; gap: 8px;
    padding: 0 10px; background: #3C3C3C; font-size: 12.5px; color: #CCCCCC;
  }
  .ide-menus {
    flex: none; display: flex; gap: 2px; padding: 2px 6px; background: #3C3C3C;
    font-size: 12.5px; overflow-x: auto;
  }
  .ide-menus button {
    padding: 3px 8px; background: none; border: none; color: #CCCCCC;
    cursor: pointer; border-radius: 3px; white-space: nowrap;
  }
  .ide-menus button:hover { background: #505050; }

  .ide-corpo { flex: 1; min-height: 0; display: flex; }
  .ide-atividade {
    width: 48px; flex: none; background: #333333; display: flex; flex-direction: column;
    align-items: center; padding-top: 6px; gap: 2px;
  }
  .ide-atividade button {
    width: 44px; height: 42px; display: grid; place-items: center;
    background: none; border: none; color: #858585; cursor: pointer;
    border-left: 2px solid transparent;
  }
  .ide-atividade button:hover { color: #FFFFFF; }
  .ide-atividade button[aria-current="true"] { color: #FFFFFF; border-left-color: #007ACC; }

  .ide-lateral {
    width: 180px; flex: none; background: #252526; overflow-y: auto;
    border-right: 1px solid #1B1B1B;
  }
  .ide-lateral-nome {
    padding: 8px 12px 6px; font-size: 10.5px; letter-spacing: .08em;
    text-transform: uppercase; color: #BBBBBB;
  }
  .ide-arquivo {
    display: flex; align-items: center; gap: 6px; width: 100%; text-align: left;
    padding: 4px 10px 4px 16px; font-size: 12.5px; color: #CCCCCC;
    background: none; border: none; cursor: pointer;
  }
  .ide-arquivo:hover { background: #2A2D2E; }
  .ide-arquivo[aria-current="true"] { background: #37373D; color: #FFFFFF; }

  .ide-painel { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .ide-guias { flex: none; display: flex; background: #252526; overflow-x: auto; }
  .ide-guia {
    display: flex; align-items: center; gap: 6px; padding: 7px 12px;
    font-size: 12.5px; color: #969696; background: #2D2D2D; border: none;
    border-right: 1px solid #1B1B1B; cursor: pointer; white-space: nowrap;
  }
  .ide-guia[aria-current="true"] {
    background: #1E1E1E; color: #FFFFFF; border-top: 1px solid #007ACC; padding-top: 6px;
  }

  /* ── O editor: régua, realce e campo, os três no mesmo lugar ──
     O campo de texto fica por cima, transparente, e o realce por baixo. Os
     dois precisam da mesma fonte, do mesmo tamanho e do mesmo recuo, ou a
     letra que se digita não cai em cima da letra colorida. */
  .ide-codigo { flex: 1; min-height: 0; display: flex; background: #1E1E1E; overflow: hidden; }
  .ide-regua {
    flex: none; width: 46px; overflow: hidden; text-align: right;
    padding: 10px 8px 10px 0; color: #6E7681; user-select: none;
  }
  .ide-caixa { flex: 1; min-width: 0; position: relative; }
  .ide-regua, .ide-realce, .ide-texto {
    font-family: 'Cascadia Code', Consolas, 'Courier New', monospace;
    font-size: 12.5px; line-height: 19px; tab-size: 2;
  }
  .ide-realce, .ide-texto {
    position: absolute; inset: 0; margin: 0; padding: 10px 12px;
    white-space: pre; overflow: auto; border: none;
  }
  .ide-realce { pointer-events: none; color: #D4D4D4; }
  .ide-texto {
    background: transparent; color: transparent; caret-color: #FFFFFF; resize: none;
  }
  .ide-texto:focus { outline: none; }
  .ide-texto::selection { background: #264F78; color: transparent; }

  .ide-tag  { color: #569CD6; }
  .ide-attr { color: #9CDCFE; }
  .ide-val  { color: #CE9178; }
  .ide-com  { color: #6A9955; }
  .ide-pon  { color: #808080; }
  .ide-txt  { color: #D4D4D4; }

  /* ── A prévia: um navegadorzinho ao lado ── */
  .ide-lado-codigo { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .ide-lado-previa { width: 44%; flex: none; display: flex; min-width: 0; }
  .ide-previa { flex: 1; min-width: 0; display: flex; flex-direction: column; border-left: 1px solid #1B1B1B; }
  .ide-previa-barra {
    flex: none; display: flex; align-items: center; gap: 7px; padding: 5px 8px;
    background: #2D2D2D; font-size: 11.5px; color: #CCCCCC;
  }
  .ide-previa-url {
    flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px;
    height: 22px; padding: 0 8px; border-radius: 11px; background: #1E1E1E; color: #A0A0A0;
  }
  .ide-previa iframe { flex: 1; min-height: 0; width: 100%; border: none; background: #FFFFFF; }

  .ide-status {
    flex: none; display: flex; align-items: center; gap: 14px; padding: 3px 10px;
    background: #007ACC; color: #FFFFFF; font-size: 11.5px;
  }
  .ide-status button {
    display: flex; align-items: center; gap: 5px; background: none; border: none;
    color: #FFFFFF; cursor: pointer; padding: 0 4px; border-radius: 2px;
  }
  .ide-status button:hover { background: rgba(255,255,255,.16); }

  /* Alternador de código e prévia, só quando não cabem lado a lado. Acima
     dessa largura os dois ficam visíveis e a classe escondido não vale nada — é o
     CSS que decide, e não o JavaScript, para não haver descompasso entre o que
     o estado acha e o que a tela mostra. */
  .ide-alternador { display: none; }
  @media (max-width: 1023px) {
    .ide-lado-codigo.escondido, .ide-lado-previa.escondido { display: none; }
    .ide-lado-previa { width: auto; flex: 1; }
    .ide-lateral { width: 148px; }
    .ide-previa { border-left: none; }
    .ide-alternador { display: flex; }
    .ide-alternador button {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 7px; font-size: 12.5px; background: #2D2D2D; color: #969696;
      border: none; border-bottom: 1px solid #1B1B1B; cursor: pointer;
    }
    .ide-alternador button[aria-current="true"] { background: #1E1E1E; color: #FFFFFF; }
  }
  @media (max-width: 767px) {
    .ide-atividade { display: none; }
    .ide-lateral { width: 124px; }
    .ide-regua { width: 34px; }
  }
`;

/* ── Peças ─────────────────────────────────────────────────────────────────── */

export interface ArquivoDoProjeto {
  nome: string;
  /** Quantos problemas o arquivo tem — a bolinha ao lado do nome vem daqui. */
  problemas: number;
}

/** A barra de título e a de menus, iguais em qualquer editor. */
export function CabecalhoDaIde({ arquivo, projeto, aoAvisar }: {
  arquivo: string; projeto: string; aoAvisar: (o: string) => void;
}) {
  return (
    <>
      <div className="ide-titulo">
        <Code2 className="w-4 h-4" style={{ color: '#519ABA' }} />
        <span className="truncate">{arquivo} — {projeto} — Editor de Código</span>
      </div>
      <div className="ide-menus">
        {['Arquivo', 'Editar', 'Selecionar', 'Exibir', 'Ir', 'Executar', 'Ajuda'].map(m => (
          <button key={m} onClick={() => aoAvisar(`O menu ${m}`)}>{m}</button>
        ))}
      </div>
    </>
  );
}

/** A barra de ícones e a lista de arquivos do projeto. */
export function LateralDaIde({ projeto, arquivos, atual, aoAbrir, aoAvisar }: {
  projeto: string;
  arquivos: ArquivoDoProjeto[];
  atual: string;
  aoAbrir: (nome: string) => void;
  aoAvisar: (o: string) => void;
}) {
  return (
    <>
      <div className="ide-atividade">
        <button aria-current="true" title="Explorador" aria-label="Explorador">
          <Files className="w-5 h-5" />
        </button>
        <button title="Pesquisar" aria-label="Pesquisar" onClick={() => aoAvisar('A pesquisa')}>
          <Search className="w-5 h-5" />
        </button>
        <button title="Controle de versão" aria-label="Controle de versão" onClick={() => aoAvisar('O controle de versão')}>
          <GitBranch className="w-5 h-5" />
        </button>
        <button title="Extensões" aria-label="Extensões" onClick={() => aoAvisar('As extensões')}>
          <Blocks className="w-5 h-5" />
        </button>
      </div>

      <div className="ide-lateral">
        <p className="ide-lateral-nome">Explorador</p>
        <div className="flex items-center gap-1 px-2" style={{ fontSize: 11.5, color: '#CCCCCC' }}>
          <ChevronDown className="w-3.5 h-3.5" />
          <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{projeto}</span>
        </div>
        {arquivos.map(a => (
          <button key={a.nome} className="ide-arquivo" aria-current={a.nome === atual}
            onClick={() => aoAbrir(a.nome)}>
            <FileCode className="w-4 h-4 flex-none" style={{ color: '#E37933' }} />
            <span className="truncate" style={{ flex: 1 }}>{a.nome}</span>
            {a.problemas > 0 && (
              <span style={{ fontSize: 10.5, color: '#F48771' }}>{a.problemas}</span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

/**
 * O editor: régua de linhas, realce por baixo e campo de texto por cima.
 *
 * O campo rola, e a régua e o realce acompanham — sem isso, passar da
 * trigésima linha desalinha tudo.
 */
export function EditorDeCodigo({ codigo, aoMudar, rotulo }: {
  codigo: string; aoMudar: (c: string) => void; rotulo: string;
}) {
  const regua = useRef<HTMLDivElement>(null);
  const realce = useRef<HTMLPreElement>(null);

  const linhas = contarLinhas(codigo);

  const acompanhar = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const alvo = e.currentTarget;
    if (regua.current) regua.current.scrollTop = alvo.scrollTop;
    if (realce.current) {
      realce.current.scrollTop = alvo.scrollTop;
      realce.current.scrollLeft = alvo.scrollLeft;
    }
  };

  return (
    <div className="ide-codigo">
      <div className="ide-regua" ref={regua} aria-hidden="true">
        {Array.from({ length: linhas }, (_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <div className="ide-caixa">
        {/* O realce é decoração: quem lê a tela lê o campo de texto. */}
        <pre className="ide-realce" ref={realce} aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: realcarHtml(codigo) }} />
        <textarea
          className="ide-texto"
          value={codigo}
          onChange={e => aoMudar(e.target.value)}
          onScroll={acompanhar}
          spellCheck={false}
          aria-label={rotulo}
        />
      </div>
    </div>
  );
}

/** A prévia ao lado, com casca de navegador para deixar claro o que é. */
export function PreviaDaIde({ html, arquivo, aoAvisar }: {
  html: string; arquivo: string; aoAvisar: (o: string) => void;
}) {
  return (
    <div className="ide-previa">
      <div className="ide-previa-barra">
        <Play className="w-3.5 h-3.5" style={{ color: '#89D185' }} />
        <span>Prévia ao vivo</span>
        <div className="ide-previa-url">
          <Lock className="w-3 h-3 flex-none" />
          <span className="truncate">localhost:5500/{arquivo}</span>
        </div>
        <button aria-label="Recarregar a prévia" onClick={() => aoAvisar('Recarregar')}
          style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}>
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Sem allow-scripts: a marcação do desbravador aparece, e não roda
          JavaScript nem alcança a página que a contém. */}
      <iframe srcDoc={html} sandbox="" title={`Prévia de ${arquivo}`} />
    </div>
  );
}

/** A régua de status, com a contagem de problemas à esquerda. */
export function StatusDaIde({ problemas, linhas, aoAvisar }: {
  problemas: number; linhas: number; aoAvisar: (o: string) => void;
}) {
  return (
    <div className="ide-status">
      <button onClick={() => aoAvisar('O painel de Problemas')} aria-label="Problemas">
        <CircleAlert className="w-3.5 h-3.5" /> {problemas}
        <TriangleAlert className="w-3.5 h-3.5" style={{ marginLeft: 8 }} /> 0
      </button>
      <span style={{ marginLeft: 'auto' }}>{linhas} linhas</span>
      <span>UTF-8</span>
      <span>HTML</span>
    </div>
  );
}

/** O alternador entre código e prévia, que só aparece quando não cabem juntos. */
export function AlternadorDaIde({ vendo, aoTrocar }: {
  vendo: 'codigo' | 'previa'; aoTrocar: (v: 'codigo' | 'previa') => void;
}) {
  return (
    <div className="ide-alternador">
      <button aria-current={vendo === 'codigo'} onClick={() => aoTrocar('codigo')}>
        <FileCode className="w-4 h-4" /> Código
      </button>
      <button aria-current={vendo === 'previa'} onClick={() => aoTrocar('previa')}>
        <Eye className="w-4 h-4" /> Prévia
      </button>
    </div>
  );
}
