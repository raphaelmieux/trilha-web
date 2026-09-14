import type React from 'react';
import {
  Folder, FolderOpen, File as FileIcon, Link2, Trash2, Monitor,
  ChevronRight, ChevronDown, ArrowLeft, ArrowRight, ArrowUp, RotateCw,
  Search, Grid2x2, HardDrive, Usb, ArrowUpNarrowWide, ArrowDownWideNarrow,
} from 'lucide-react';
import {
  AREA, DOCUMENTOS, LIXEIRA, ehRaiz, podeSoltarEm, filhosDe,
  formatarData, formatarTamanho, rotuloDoTipo,
  type No, type Coluna,
} from './arquivos';

/*
 * A janela do Explorador de Arquivos, em peças.
 *
 * ── Por que ela saiu do laboratório ──────────────────────────────────────
 * Ela morava dentro de `FileManagerLab.tsx`, e saiu no dia em que a CC-ES001
 * precisou de um segundo laboratório de Explorador — antes de a cópia existir,
 * e não depois. É a mesma decisão de `word.tsx` e `excel.tsx`, e o motivo está
 * escrito nos dois: duas cópias divergem no primeiro ajuste, e a plataforma
 * passa a mostrar dois "Explorador" diferentes para o mesmo programa.
 *
 * O desbravador da CC-ES001 já percorreu a AP043 na maioria dos casos — a
 * vereda sai dela —, e o que ele precisa reencontrar é a janela que aprendeu:
 * a árvore à esquerda, o caminho em cima, as colunas que ordenam quando
 * clicadas, o menu que abre com o botão direito.
 *
 * ── O que fica aqui e o que fica em cada laboratório ─────────────────────
 * Aqui fica o que é do **programa**: como uma linha se desenha, o que a barra
 * de endereço tem, o que o painel de navegação mostra. Lá fica o que é do
 * **exercício**: que comandos a barra oferece, que tarefas se cobram, e de que
 * disco se parte.
 *
 * Por isso nenhuma peça daqui guarda estado. Quem guarda é o laboratório, que
 * é quem precisa responder à verificação — uma janela com estado próprio
 * obrigaria os dois lados a concordar sobre a mesma árvore, que é a forma mais
 * rápida de mostrarem coisas diferentes.
 *
 * As cores são as do Explorer, e não as da plataforma. Dentro de uma janela
 * clara, um ícone com a cor da plataforma seria a única peça fora do lugar.
 */

/** As colunas, na ordem em que o Explorer as oferece no menu Classificar. */
const ORDENS_DO_EXPLORADOR: [Coluna, string][] = [
  ['nome', 'Nome'],
  ['modificado', 'Data de modificação'],
  ['tipo', 'Tipo'],
  ['tamanho', 'Tamanho'],
];

type Icone = typeof Monitor;

/**
 * O ícone de cada raiz conhecida.
 *
 * As três primeiras são as de todo Windows. As duas últimas só existem na
 * CC-ES001 — e estão aqui, e não lá, porque quem desenha a árvore é este
 * arquivo: um mapa por laboratório faria o pen drive aparecer como pasta
 * amarela no dia em que alguém esquecesse de passá-lo.
 */
const ICONE_DA_RAIZ: Record<string, Icone> = {
  [AREA]: Monitor,
  [DOCUMENTOS]: FolderOpen,
  [LIXEIRA]: Trash2,
  pendrive: Usb,
  backup: HardDrive,
};

export function IconeDoNo({ n, arvore, tamanho = 'w-4 h-4' }: {
  n: No; arvore: No[]; tamanho?: string;
}) {
  if (ehRaiz(arvore, n.id)) {
    const Ico = ICONE_DA_RAIZ[n.id] ?? HardDrive;
    return <Ico className={tamanho} style={{ color: '#5B5B5B' }} />;
  }
  if (n.tipo === 'pasta') return <Folder className={tamanho} style={{ color: '#E6B14C' }} />;
  if (n.tipo === 'atalho') return <Link2 className={tamanho} style={{ color: '#0F6CBD' }} />;
  return <FileIcon className={tamanho} style={{ color: '#6E6E6E' }} />;
}

/* ── O painel de navegação ──────────────────────────────────────────────────
 *
 * Estes componentes vivem no topo do módulo, e não dentro do laboratório, por
 * um motivo que só aparece ao arrastar: um componente declarado no corpo de
 * outro é uma função nova a cada render, e para o React função nova é *tipo*
 * novo — ele desmonta a subárvore inteira e monta outra no lugar.
 *
 * Quem arrasta paga a conta. O nó sobre o qual se está soltando é substituído
 * no meio do gesto, e o soltar acontece sobre um elemento que já saiu da
 * página: nada se move, e não há erro nenhum para explicar por quê.
 */

interface GalhoProps {
  n: No;
  nivel: number;
  arvore: No[];
  expandidas: Set<string>;
  pastaAtual: string;
  alvoSolto: string | null;
  arrastando: string | null;
  aoIr: (id: string) => void;
  aoAlternar: (id: string) => void;
  aoPassarArrastando: (id: string | null) => void;
  aoSoltar: (id: string, copiando: boolean) => void;
}

/** Um galho da árvore, com os filhos abaixo quando aberto. */
function Galho(p: GalhoProps) {
  const { n, nivel, arvore, expandidas, pastaAtual, alvoSolto, arrastando } = p;
  const subpastas = filhosDe(arvore, n.id).filter(f => f.tipo === 'pasta');
  const aberta = expandidas.has(n.id);
  const aqui = pastaAtual === n.id;
  const recebendo = alvoSolto === n.id;

  return (
    <div>
      <div
        className="flex items-center gap-1 px-1 py-1 rounded cursor-pointer text-sm"
        style={{
          paddingLeft: 4 + nivel * 14,
          backgroundColor: recebendo ? '#E3F0FB' : aqui ? '#EAEAEA' : 'transparent',
          outline: recebendo ? '1px dashed #0F6CBD' : 'none',
          color: '#1B1B1B', fontSize: 12.5,
        }}
        onClick={() => p.aoIr(n.id)}
        onDragOver={e => {
          if (arrastando && podeSoltarEm(arvore, arrastando, n.id)) { e.preventDefault(); p.aoPassarArrastando(n.id); }
        }}
        onDragLeave={() => p.aoPassarArrastando(null)}
        onDrop={e => { e.preventDefault(); p.aoSoltar(n.id, e.ctrlKey || e.metaKey); }}
      >
        <button
          onClick={e => { e.stopPropagation(); p.aoAlternar(n.id); }}
          className="flex-shrink-0"
          style={{ visibility: subpastas.length ? 'visible' : 'hidden' }}
          aria-label={aberta ? 'Recolher' : 'Expandir'}
        >
          {aberta ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        <IconeDoNo n={n} arvore={arvore} />
        <span className="truncate">{n.nome}</span>
      </div>
      {aberta && subpastas.map(f => <Galho key={f.id} {...p} n={f} nivel={nivel + 1} />)}
    </div>
  );
}

/**
 * A lateral com as raízes e as pastas abaixo delas.
 *
 * Só pastas descem por aqui, como no Explorer: a lateral é para navegar, e uma
 * árvore que mostrasse arquivo repetiria a lista da direita sem acrescentar
 * nada.
 */
export function PainelDeNavegacao(p: Omit<GalhoProps, 'n' | 'nivel'>) {
  return (
    <div className="win-painel">
      {p.arvore.filter(n => n.paiId === null).map(r => (
        <Galho key={r.id} {...p} n={r} nivel={0} />
      ))}
    </div>
  );
}

/* ── A barra de endereço ────────────────────────────────────────────────── */

/**
 * Voltar, avançar, acima, atualizar, o caminho e a caixa de pesquisa.
 *
 * A pesquisa é opcional porque nem todo laboratório a usa: na AP043 ela é
 * enfeite — a janela sem ela não seria a janela —, e na CC-ES001 é o exercício
 * inteiro do módulo 4. Passar `aoBuscar` a torna um botão de verdade; sem ele,
 * ela continua sendo o texto acinzentado que o Explorer mostra antes do
 * primeiro clique.
 */
export function BarraDeEndereco({
  caminho, podeVoltar, podeAvancar, paiId,
  aoVoltar, aoAvancar, aoIr, aoAvisar, aoBuscar, termoDaBusca,
}: {
  caminho: No[];
  podeVoltar: boolean;
  podeAvancar: boolean;
  paiId: string | null | undefined;
  aoVoltar: () => void;
  aoAvancar: () => void;
  aoIr: (id: string) => void;
  aoAvisar: (recurso: string) => void;
  aoBuscar?: () => void;
  termoDaBusca?: string;
}) {
  const atual = caminho[caminho.length - 1];
  return (
    <div className="win-endereco">
      <button className="win-nav" aria-label="Voltar" disabled={!podeVoltar} onClick={aoVoltar}>
        <ArrowLeft className="w-4 h-4" />
      </button>
      <button className="win-nav" aria-label="Avançar" disabled={!podeAvancar} onClick={aoAvancar}>
        <ArrowRight className="w-4 h-4" />
      </button>
      <button className="win-nav" aria-label="Acima" disabled={!paiId}
        onClick={() => paiId && aoIr(paiId)}>
        <ArrowUp className="w-4 h-4" />
      </button>
      <button className="win-nav" aria-label="Atualizar" onClick={() => aoAvisar('Atualizar')}>
        <RotateCw className="w-4 h-4" />
      </button>

      <div className="win-caminho">
        {caminho.map((n, i) => (
          <span key={n.id} className="flex items-center flex-shrink-0">
            {i > 0 && <ChevronRight className="w-3 h-3" style={{ color: '#767676' }} />}
            <button onClick={() => aoIr(n.id)}>{n.nome}</button>
          </span>
        ))}
      </div>

      {aoBuscar ? (
        <button className="win-busca" onClick={aoBuscar} title="Pesquisar"
          style={{ cursor: 'pointer', color: termoDaBusca ? '#1B1B1B' : undefined }}>
          <Search className="w-3.5 h-3.5" />
          <span className="truncate">
            {termoDaBusca || `Pesquisar em ${atual?.nome ?? ''}`}
          </span>
        </button>
      ) : (
        <div className="win-busca">
          <Search className="w-3.5 h-3.5" />
          <span className="truncate">Pesquisar em {atual?.nome ?? ''}</span>
        </div>
      )}
    </div>
  );
}

/* ── A lista ────────────────────────────────────────────────────────────── */

export function CabecalhoDaColuna({ c, rotulo, classe, coluna, crescente, aoOrdenar }: {
  c: Coluna; rotulo: string; classe: string;
  coluna: Coluna; crescente: boolean; aoOrdenar: (c: Coluna) => void;
}) {
  return (
    <button
      onClick={() => aoOrdenar(c)}
      className={classe}
      style={{ color: coluna === c ? '#0F6CBD' : '#444' }}
      title={`Ordenar por ${rotulo.toLowerCase()}`}
    >
      {rotulo}
      {coluna === c && (crescente
        ? <ArrowUpNarrowWide className="w-3 h-3" />
        : <ArrowDownWideNarrow className="w-3 h-3" />)}
    </button>
  );
}

/** A fileira de cabeçalhos, com as quatro colunas do Explorer. */
export function CabecalhosDaLista({ coluna, crescente, aoOrdenar }: {
  coluna: Coluna; crescente: boolean; aoOrdenar: (c: Coluna) => void;
}) {
  return (
    <div className="win-cabecalhos">
      <CabecalhoDaColuna c="nome" rotulo="Nome" classe="win-c-nome"
        coluna={coluna} crescente={crescente} aoOrdenar={aoOrdenar} />
      <CabecalhoDaColuna c="modificado" rotulo="Data de modificação" classe="win-c-data"
        coluna={coluna} crescente={crescente} aoOrdenar={aoOrdenar} />
      <CabecalhoDaColuna c="tipo" rotulo="Tipo" classe="win-c-tipo"
        coluna={coluna} crescente={crescente} aoOrdenar={aoOrdenar} />
      <CabecalhoDaColuna c="tamanho" rotulo="Tamanho" classe="win-c-tam"
        coluna={coluna} crescente={crescente} aoOrdenar={aoOrdenar} />
    </div>
  );
}

export interface LinhaProps {
  n: No;
  arvore: No[];
  escolhido: boolean;
  recebendo: boolean;
  arrastando: string | null;
  /** Quando este nó está sendo renomeado, o rascunho e o que fazer com ele. */
  renomeando?: { rascunho: string; aoMudar: (v: string) => void; aoConfirmar: () => void; aoDesistir: () => void };
  aoSelecionar: () => void;
  aoAbrir: () => void;
  aoMenu: (e: React.MouseEvent) => void;
  aoArrastar: (id: string | null) => void;
  aoPassarArrastando: (id: string | null) => void;
  aoSoltar: (id: string, copiando: boolean) => void;
  /** O que a coluna Nome mostra à direita do nome. A CC-ES001 põe o rótulo da
      versão ali; a AP043 não põe nada. */
  complemento?: React.ReactNode;
}

/** Uma linha da lista: ícone, nome, data, tipo e tamanho. */
export function LinhaDeArquivo(p: LinhaProps) {
  const { n, arvore, escolhido, recebendo, arrastando, renomeando } = p;
  return (
    <div
      className={`win-linha${escolhido ? ' escolhida' : ''}${recebendo ? ' recebendo' : ''}`}
      draggable={!ehRaiz(arvore, n.id) && !renomeando}
      onDragStart={() => { p.aoArrastar(n.id); p.aoSelecionar(); }}
      onDragEnd={() => { p.aoArrastar(null); p.aoPassarArrastando(null); }}
      onDragOver={e => { if (arrastando && podeSoltarEm(arvore, arrastando, n.id)) { e.preventDefault(); p.aoPassarArrastando(n.id); } }}
      onDragLeave={() => p.aoPassarArrastando(null)}
      onDrop={e => { e.preventDefault(); p.aoSoltar(n.id, e.ctrlKey || e.metaKey); }}
      onClick={p.aoSelecionar}
      onDoubleClick={p.aoAbrir}
      onContextMenu={p.aoMenu}
    >
      <div className="win-c-nome flex items-center gap-2 px-2">
        <IconeDoNo n={n} arvore={arvore} />
        {renomeando ? (
          <input
            autoFocus
            value={renomeando.rascunho}
            onChange={e => renomeando.aoMudar(e.target.value)}
            onBlur={renomeando.aoConfirmar}
            onKeyDown={e => {
              if (e.key === 'Enter') renomeando.aoConfirmar();
              if (e.key === 'Escape') renomeando.aoDesistir();
            }}
            aria-label="Novo nome"
            style={{
              font: 'inherit', padding: '1px 4px', width: '100%',
              background: '#FFFFFF', border: '1px solid #0F6CBD', color: '#1B1B1B',
            }}
          />
        ) : (
          <>
            <span className="truncate">{n.nome}</span>
            {p.complemento}
          </>
        )}
      </div>
      <span className="win-c-data px-2 truncate" style={{ color: '#5B5B5B' }}>
        {formatarData(n.modificadoEm)}
      </span>
      <span className="win-c-tipo px-2 truncate" style={{ color: '#5B5B5B' }}>
        {rotuloDoTipo(n)}
      </span>
      <span className="win-c-tam px-2" style={{ color: '#5B5B5B' }}>
        {formatarTamanho(n)}
      </span>
    </div>
  );
}

/* ── Menus ──────────────────────────────────────────────────────────────── */

/**
 * A casca dos dois menus do Explorer — o de contexto e o Classificar.
 *
 * Ela existe por causa do clique: o mesmo clique que abre um menu sobe até o
 * `window` e cai no ouvinte que fecha menu, então o menu abriria e sumiria no
 * mesmo gesto. `stopPropagation` fica aqui para nenhum dos dois lados ter de
 * lembrar dele.
 */
export function MenuFlutuante({ x, y, altura = 280, children }: {
  x: number; y: number; altura?: number; children: React.ReactNode;
}) {
  return (
    <div
      className="win-menu"
      style={{
        left: Math.min(x, window.innerWidth - 220),
        top: Math.min(y, window.innerHeight - altura),
      }}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

/** O menu Classificar, o mesmo do Explorer. */
export function MenuClassificar({ x, y, coluna, crescente, aoOrdenar, aoSentido, aoFechar }: {
  x: number; y: number; coluna: Coluna; crescente: boolean;
  aoOrdenar: (c: Coluna) => void;
  aoSentido: (crescente: boolean) => void;
  aoFechar: () => void;
}) {
  return (
    <MenuFlutuante x={x} y={y} altura={0}>
      {ORDENS_DO_EXPLORADOR.map(([c, rotulo]) => (
        <button key={c} onClick={() => { aoOrdenar(c); aoFechar(); }}>
          <span style={{ width: 14, flex: 'none' }}>{coluna === c ? '•' : ''}</span> {rotulo}
        </button>
      ))}
      <div style={{ height: 1, background: '#E0E0E0', margin: '4px 6px' }} />
      <button onClick={() => { aoSentido(true); aoFechar(); }}>
        <span style={{ width: 14, flex: 'none' }}>{crescente ? '•' : ''}</span> Crescente
      </button>
      <button onClick={() => { aoSentido(false); aoFechar(); }}>
        <span style={{ width: 14, flex: 'none' }}>{crescente ? '' : '•'}</span> Decrescente
      </button>
    </MenuFlutuante>
  );
}

/* ── A barra de tarefas ─────────────────────────────────────────────────── */

/**
 * A barra do pé da tela, com Iniciar, o Explorador e o que estiver aberto.
 *
 * Ela é a razão de a moldura da plataforma subir 46 px: `rodape={46}` no
 * laboratório é a altura dela, e a cápsula de tarefas sobe para não tapá-la.
 */
export function BarraDeTarefasDoWindows({ aoAvisar, aoMinimizarTudo, children }: {
  aoAvisar: (recurso: string) => void;
  aoMinimizarTudo: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="win-tarefas">
      <button aria-label="Iniciar" title="Iniciar" onClick={() => aoAvisar('O menu Iniciar')}>
        <Grid2x2 className="w-5 h-5" style={{ color: '#0F6CBD' }} />
      </button>
      <button aria-label="Explorador de Arquivos" title="Explorador de Arquivos" className="aberta"
        onClick={aoMinimizarTudo}>
        <Folder className="w-5 h-5" style={{ color: '#E6B14C' }} />
      </button>
      {children}
    </div>
  );
}
