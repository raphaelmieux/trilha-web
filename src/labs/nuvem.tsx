import type React from 'react';
import {
  HardDrive, Users, Trash2, Search, ChevronRight, ChevronDown,
  FileText, Table2, Folder, Image, FileType, MoreVertical, type LucideIcon,
} from 'lucide-react';
import {
  type ArquivoDaNuvem, type Nuvem, type Papel, type Pessoa, type TipoDeArquivo,
  PAPEIS, NOME_DO_PAPEL, O_QUE_O_PAPEL_DEIXA, papelDe, pastasAcima,
} from './arquivoCompartilhado';
import { NOME_DO_AUTOR } from './documento';

/*
 * A janela da nuvem de arquivos, em peças.
 *
 * ── Por que ela nasce separada, e não dentro do laboratório ──────────────
 * É a decisão de `word.tsx`, `excel.tsx`, `explorer.tsx`, `leitorDePdf.tsx` e
 * `correio.tsx`, pelo motivo escrito nos cinco: a janela sai **antes** de a
 * cópia existir. A CC-ES006 abre esta nuvem em cinco das nove lições, e a
 * CC-ES012, que é projeto documental, vai abrir de novo.
 *
 * ── Ela não imita marca, e isso é o de sempre ────────────────────────────
 * Google Drive, OneDrive e Dropbox não se parecem — e compartilham um
 * **arranjo**: lateral com os lugares, caminho em migalhas no alto, lista com
 * nome, dono e data, menu de três pontos em cada linha, e uma caixa de
 * compartilhar que é onde tudo acontece. É esse arranjo que está aqui, do
 * jeito que `ide.tsx` faz com o editor de código.
 *
 * ── E o conflito aparece aqui, e não numa janela de Explorador ───────────
 * O requisito 6 fala de arquivo **sincronizado**, e a cópia em conflito nasce
 * na pasta do computador. Desenhá-la no Explorador seria a terceira cópia de
 * um programa que esta vereda não ensina — é a mesma decisão da tela inicial
 * do leitor de PDF, e o motivo está escrito lá. Ela aparece nesta lista, que
 * é onde o Drive e o Dropbox de verdade também a mostram.
 *
 * ── O que fica aqui e o que fica em cada laboratório ─────────────────────
 * Aqui fica o que é do **programa**: como uma linha se desenha, o que a caixa
 * de compartilhar tem, onde mora "Transferir propriedade". Lá fica o que é do
 * **exercício**: que arquivos existem, que tarefas se cobram, o que cada gesto
 * faz com eles.
 *
 * Nenhuma peça guarda estado. Quem guarda pasta aberta, arquivo escolhido e
 * caixa aberta é o laboratório, que é quem responde à verificação — uma janela
 * com estado próprio obrigaria os dois lados a concordar sobre o mesmo
 * arquivo, que é a forma mais rápida de mostrarem coisas diferentes.
 *
 * ── E a peça aparece pela presença do setter ─────────────────────────────
 * É a regra do `aoBuscar` do Explorador e do `aoPreencher` da grade do Excel:
 * a caixa de pesquisa só existe quando o laboratório entrega `aoBuscar`, e
 * "Transferir propriedade" só aparece no menu de papel quando ele entrega
 * `aoTransferir`. Prometer um gesto que a lição não faz é o que ensina a
 * desconfiar do programa.
 */

/* As cores são as da nuvem, e não as da plataforma: dentro de uma janela
   clara, um botão com o vermelho da plataforma seria a única peça fora do
   lugar. E a superfície clara diz a própria cor, senão os títulos da
   plataforma — que são quase brancos — somem em cima do papel. */
export const CSS_DA_NUVEM = `
.nv-janela {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  background: #FFFFFF; color: #1F1F1F;
  font-family: system-ui, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13.5px;
}
.nv-janela h1, .nv-janela h2, .nv-janela h3, .nv-janela h4 { color: #1F1F1F; }
.nv-topo {
  display: flex; align-items: center; gap: 14px; padding: 9px 16px;
  border-bottom: 1px solid #E3E3E3; background: #F8FAFD;
}
.nv-marca { display: flex; align-items: center; gap: 9px; font-size: 16px; color: #444746; }
.nv-busca {
  flex: 1; max-width: 640px; background: #EDF2FC; border: 1px solid transparent;
  border-radius: 10px; padding: 8px 13px; font-size: 13.5px; color: #1F1F1F;
  display: flex; gap: 9px; align-items: center;
}
.nv-busca input {
  flex: 1; border: none; background: none; outline: none; font: inherit; color: inherit;
}
.nv-busca:focus-within { background: #FFFFFF; border-color: #C7D6F0; }
.nv-eu {
  width: 30px; height: 30px; border-radius: 50%; flex: none; display: grid;
  place-items: center; background: #0B57D0; color: #FFFFFF; font-size: 13px; font-weight: 700;
}
.nv-corpo { flex: 1; min-height: 0; display: flex; }

.nv-lado { width: 200px; flex: none; padding: 12px 8px; border-right: 1px solid #E3E3E3; }
.nv-lugar {
  display: flex; align-items: center; gap: 13px; width: 100%; text-align: left;
  padding: 8px 15px; border: none; background: none; cursor: pointer;
  border-radius: 0 999px 999px 0; color: #1F1F1F; font-size: 13.5px;
}
.nv-lugar:hover { background: #EDEDED; }
.nv-lugar[aria-current="true"] { background: #C2E7FF; font-weight: 700; }
.nv-espaco { margin: 18px 15px 0; color: #5E5E5E; font-size: 12px; }
.nv-barra-espaco {
  height: 4px; border-radius: 999px; background: #E3E3E3; margin: 7px 0 5px; overflow: hidden;
}
.nv-barra-espaco > i { display: block; height: 100%; background: #0B57D0; }

.nv-painel { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.nv-caminho {
  display: flex; align-items: center; gap: 2px; padding: 12px 18px 10px; flex-wrap: wrap;
}
.nv-migalha {
  border: none; background: none; cursor: pointer; color: #1F1F1F;
  font-size: 19px; padding: 3px 7px; border-radius: 7px;
}
.nv-migalha:hover { background: #EDEDED; }
.nv-migalha[aria-current="page"] { cursor: default; }
.nv-migalha[aria-current="page"]:hover { background: none; }

.nv-lista { flex: 1; min-height: 0; overflow: auto; padding: 0 12px 12px; }
.nv-cabecalho, .nv-linha {
  display: grid; grid-template-columns: 1fr 130px 130px 40px; gap: 12px;
  align-items: center; padding: 9px 14px;
}
.nv-cabecalho { color: #444746; font-size: 12px; border-bottom: 1px solid #E3E3E3; }
.nv-linha {
  width: 100%; text-align: left; border: none; background: none; cursor: pointer;
  color: #1F1F1F; border-radius: 10px; font-size: 13.5px;
}
.nv-linha:hover { background: #F0F4F9; }
.nv-linha[aria-selected="true"] { background: #C2E7FF; }
.nv-nome { display: flex; align-items: center; gap: 11px; min-width: 0; }
.nv-nome > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nv-fraco { color: #5E5E5E; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nv-selo {
  display: inline-flex; align-items: center; gap: 5px; flex: none;
  font-size: 11px; padding: 2px 8px; border-radius: 999px;
  background: #E7F0FE; color: #0B4E9E;
}
.nv-pontos {
  border: none; background: none; cursor: pointer; color: #444746;
  border-radius: 50%; width: 30px; height: 30px; display: grid; place-items: center;
}
.nv-pontos:hover { background: #E3E3E3; }

.nv-menu {
  position: absolute; z-index: 40; min-width: 232px; padding: 7px 0;
  background: #FFFFFF; border-radius: 9px; box-shadow: 0 2px 12px rgba(0,0,0,.28);
}
.nv-item {
  display: flex; align-items: center; gap: 13px; width: 100%; text-align: left;
  padding: 8px 17px; border: none; background: none; cursor: pointer;
  color: #1F1F1F; font-size: 13.5px;
}
.nv-item:hover { background: #F0F4F9; }
.nv-item:disabled { color: #9AA0A6; cursor: default; background: none; }
.nv-risco { height: 1px; background: #E3E3E3; margin: 6px 0; }

.nv-fundo {
  position: absolute; inset: 0; z-index: 50; background: rgba(32,33,36,.5);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.nv-caixa {
  width: min(520px, 100%); max-height: 100%; overflow: auto; background: #FFFFFF;
  border-radius: 16px; padding: 22px 6px 14px; color: #1F1F1F;
}
.nv-caixa h3 { margin: 0 20px 16px; font-size: 19px; font-weight: 400; }
.nv-secao-caixa { padding: 4px 24px; }
.nv-titulo-secao { font-size: 13.5px; font-weight: 700; margin: 16px 0 8px; }
.nv-campo {
  width: 100%; padding: 11px 14px; border: 1px solid #C4C7C5; border-radius: 6px;
  font: inherit; color: #1F1F1F; background: #FFFFFF;
}
.nv-pessoa {
  display: flex; align-items: center; gap: 13px; padding: 7px 0;
}
.nv-bolha {
  width: 32px; height: 32px; border-radius: 50%; flex: none; display: grid;
  place-items: center; color: #FFFFFF; font-size: 13px; font-weight: 700;
}
.nv-quem { flex: 1; min-width: 0; }
.nv-quem b { display: block; font-weight: 700; font-size: 13.5px; }
.nv-quem span { display: block; color: #5E5E5E; font-size: 12px; }
.nv-papel {
  border: 1px solid transparent; background: none; cursor: pointer; font: inherit;
  color: #1F1F1F; padding: 6px 10px; border-radius: 6px; display: flex;
  align-items: center; gap: 5px;
}
.nv-papel:hover { background: #F0F4F9; border-color: #C4C7C5; }
.nv-papel:disabled { cursor: default; color: #5E5E5E; }
.nv-papel:disabled:hover { background: none; border-color: transparent; }

.nv-herdado {
  margin: 8px 0 0; border-top: 1px solid #E3E3E3; padding-top: 10px;
}
.nv-revelar {
  display: flex; align-items: center; gap: 9px; width: 100%; text-align: left;
  border: none; background: none; cursor: pointer; color: #0B57D0;
  font: inherit; padding: 6px 0;
}
.nv-revelar:hover { text-decoration: underline; }

.nv-oque {
  margin: 10px 0 0; background: #F0F4F9; border-radius: 9px; padding: 11px 14px;
  font-size: 12.5px; color: #3C4043;
}
.nv-oque b { color: #1F1F1F; }
.nv-oque p { margin: 0 0 6px; }
.nv-oque p:last-child { margin: 0; }

.nv-acesso-geral {
  display: flex; align-items: center; gap: 13px; padding: 7px 0;
}
.nv-rodape-caixa {
  display: flex; justify-content: space-between; align-items: center; gap: 10px;
  padding: 16px 24px 4px;
}
.nv-btn {
  border: 1px solid #C4C7C5; background: #FFFFFF; color: #0B57D0; cursor: pointer;
  border-radius: 999px; padding: 9px 20px; font: inherit;
}
.nv-btn:hover { background: #F0F4F9; }
/* A regra do desligado vem **depois** da do principal, e não antes. As duas
   têm a mesma especificidade, então escrita primeiro ela perde: o botão sai
   azul e branco, com cara de clicável, e clicar não faz nada — que é o que
   ensina a desconfiar do programa. É o mesmo conserto da CC-ES001, da
   CC-ES004 e da CC-ES005, e errá-lo não estoura coisa nenhuma. */
.nv-btn[data-principal="sim"] { background: #0B57D0; color: #FFFFFF; border-color: #0B57D0; }
.nv-btn[data-principal="sim"]:hover { background: #0A47AB; }
.nv-btn:disabled { background: #E8EAED; color: #9AA0A6; border-color: #E8EAED; cursor: default; }
.nv-btn:disabled:hover { background: #E8EAED; }

@media (max-width: 760px) {
  /* A lateral deita, e nenhum lugar some: reduzir a tela nunca reduz o que dá
     para fazer nela. */
  .nv-corpo { flex-direction: column; }
  .nv-lado {
    width: auto; display: flex; gap: 4px; overflow-x: auto; padding: 6px;
    border-right: none; border-bottom: 1px solid #E3E3E3;
  }
  .nv-lugar { width: auto; flex: none; border-radius: 999px; padding: 7px 13px; }
  .nv-espaco { display: none; }
  .nv-cabecalho, .nv-linha { grid-template-columns: 1fr 40px; }
  .nv-cabecalho > :nth-child(2), .nv-cabecalho > :nth-child(3),
  .nv-linha > [data-coluna="dono"], .nv-linha > [data-coluna="quando"] { display: none; }
}
`;

/* ── O alto e a lateral ────────────────────────────────────────────────────── */

export function TopoDaNuvem({ busca, aoBuscar, quem }: {
  busca?: string;
  /** Sem ele não há caixa de pesquisa: a peça aparece pela presença do setter. */
  aoBuscar?: (t: string) => void;
  quem: Pessoa;
}) {
  return (
    <div className="nv-topo">
      <span className="nv-marca"><HardDrive size={21} aria-hidden /> Nuvem do Clube</span>
      {aoBuscar && (
        <label className="nv-busca">
          <Search size={17} aria-hidden />
          <input value={busca ?? ''} onChange={e => aoBuscar(e.target.value)}
            placeholder="Pesquisar na nuvem" aria-label="Pesquisar na nuvem" />
        </label>
      )}
      <span className="nv-eu" title={NOME_DO_AUTOR[quem]} aria-hidden>
        {NOME_DO_AUTOR[quem].slice(0, 1)}
      </span>
    </div>
  );
}

/**
 * Os lugares da lateral.
 *
 * São do **programa**, e por isso ficam aqui e não no laboratório: a nuvem
 * tem os três o tempo todo, como um programa tem todos os comandos. Uma que
 * só mostrasse "Compartilhados comigo" na lição de compartilhar ensinaria a
 * procurar o botão que a tarefa quer, e não a procurar no programa.
 */
export type LugarDaNuvem = 'meu' | 'comigo' | 'lixeira';

const LUGARES: { id: LugarDaNuvem; nome: string; icone: LucideIcon }[] = [
  { id: 'meu', nome: 'Meu Drive', icone: HardDrive },
  { id: 'comigo', nome: 'Compartilhados comigo', icone: Users },
  { id: 'lixeira', nome: 'Lixeira', icone: Trash2 },
];

export function LateralDaNuvem({ lugar, aoIr, usado }: {
  lugar: LugarDaNuvem;
  aoIr: (l: LugarDaNuvem) => void;
  /** Quanto do espaço já foi usado, de 0 a 1. */
  usado: number;
}) {
  return (
    <nav className="nv-lado" aria-label="Lugares da nuvem">
      {LUGARES.map(l => (
        <button key={l.id} type="button" className="nv-lugar"
          aria-current={l.id === lugar} onClick={() => aoIr(l.id)}>
          <l.icone size={18} aria-hidden /> {l.nome}
        </button>
      ))}
      <div className="nv-espaco">
        <div className="nv-barra-espaco"><i style={{ width: `${Math.round(usado * 100)}%` }} /></div>
        {(usado * 15).toFixed(1)} GB de 15 GB usados
      </div>
    </nav>
  );
}

export function CaminhoDaNuvem({ trilha, aoIr }: {
  /** Da raiz até onde se está. O último é onde se está. */
  trilha: { id: string | null; nome: string }[];
  aoIr: (id: string | null) => void;
}) {
  return (
    <nav className="nv-caminho" aria-label="Caminho">
      {trilha.map((p, i) => {
        const ultimo = i === trilha.length - 1;
        return (
          <span key={p.id ?? 'raiz'} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <ChevronRight size={17} aria-hidden style={{ color: '#5E5E5E' }} />}
            <button type="button" className="nv-migalha"
              aria-current={ultimo ? 'page' : undefined}
              onClick={ultimo ? undefined : () => aoIr(p.id)}>
              {p.nome}
            </button>
          </span>
        );
      })}
    </nav>
  );
}

/* ── A lista ───────────────────────────────────────────────────────────────── */

const ICONE_DO_TIPO: Record<TipoDeArquivo, LucideIcon> = {
  documento: FileText, planilha: Table2, pasta: Folder, imagem: Image, pdf: FileType,
};

const COR_DO_TIPO: Record<TipoDeArquivo, string> = {
  documento: '#1A73E8', planilha: '#188038', pasta: '#5F6368',
  imagem: '#C5221F', pdf: '#B31412',
};

export function CabecalhoDaLista() {
  return (
    <div className="nv-cabecalho">
      <span>Nome</span>
      <span>Proprietário</span>
      <span>Última alteração</span>
      <span />
    </div>
  );
}

export function LinhaDaNuvem({ arquivo, escolhido, aoEscolher, aoAbrir, aoMenu }: {
  arquivo: ArquivoDaNuvem;
  escolhido: boolean;
  aoEscolher: () => void;
  aoAbrir: () => void;
  aoMenu?: (e: React.MouseEvent) => void;
}) {
  const Icone = ICONE_DO_TIPO[arquivo.tipo];
  const ultima = arquivo.versoes[arquivo.versoes.length - 1];
  /* O selo diz que o arquivo sai do alcance de quem é dono — é a informação
     que a lista de verdade dá, e a única que se lê sem abrir a caixa. Quem
     alcança **pela pasta** não entra aqui de propósito: é justamente o que
     não aparece em lista nenhuma, e é o requisito 5. */
  const compartilhado = arquivo.acessos.length > 0;

  return (
    <div
      role="row"
      className="nv-linha"
      aria-selected={escolhido}
      tabIndex={0}
      onClick={aoEscolher}
      onDoubleClick={aoAbrir}
      onContextMenu={aoMenu}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); aoAbrir(); }
        if (e.key === ' ') { e.preventDefault(); aoEscolher(); }
      }}
    >
      <span className="nv-nome">
        <Icone size={19} aria-hidden style={{ color: COR_DO_TIPO[arquivo.tipo], flex: 'none' }} />
        <span>{arquivo.nome}</span>
        {compartilhado && (
          <span className="nv-selo"><Users size={12} aria-hidden /> Compartilhado</span>
        )}
      </span>
      <span className="nv-fraco" data-coluna="dono">
        {arquivo.dono === 'voce' ? 'eu' : NOME_DO_AUTOR[arquivo.dono]}
      </span>
      <span className="nv-fraco" data-coluna="quando">{ultima?.quando ?? '—'}</span>
      {aoMenu ? (
        <button type="button" className="nv-pontos" title="Mais ações"
          aria-label={`Mais ações de ${arquivo.nome}`}
          onClick={e => { e.stopPropagation(); aoEscolher(); aoMenu(e); }}>
          <MoreVertical size={17} aria-hidden />
        </button>
      ) : <span />}
    </div>
  );
}

/* ── O menu de três pontos ─────────────────────────────────────────────────── */

export function MenuDoArquivo({ onde, aoFechar, children }: {
  onde: { x: number; y: number };
  aoFechar: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, zIndex: 39 }} onClick={aoFechar} />
      <div className="nv-menu" role="menu" style={{ left: onde.x, top: onde.y }}>
        {children}
      </div>
    </>
  );
}

export function ItemDoMenu({ icone: Icone, children, aoClicar, desligado }: {
  icone: LucideIcon;
  children: React.ReactNode;
  aoClicar?: () => void;
  desligado?: boolean;
}) {
  return (
    <button type="button" className="nv-item" role="menuitem"
      disabled={desligado} onClick={aoClicar}>
      <Icone size={17} aria-hidden /> {children}
    </button>
  );
}


/* ── A caixa de compartilhar: é aqui que a vereda acontece ─────────────────── */

const COR_DA_BOLHA: Record<Pessoa, string> = {
  voce: '#0B57D0', marta: '#B14A00', ronaldo: '#146B4F',
  cleide: '#6B2FA8', lideranca: '#A4262C',
};

function Bolha({ quem }: { quem: Pessoa }) {
  return (
    <span className="nv-bolha" style={{ background: COR_DA_BOLHA[quem] }} aria-hidden>
      {NOME_DO_AUTOR[quem].slice(0, 1)}
    </span>
  );
}

const ENDERECO: Record<Pessoa, string> = {
  voce: 'voce@pioneiros.org.br',
  marta: 'marta.oliveira@gmail.com',
  ronaldo: 'ronaldo.paiva@gmail.com',
  cleide: 'cleide.santos@gmail.com',
  lideranca: 'direcao@pioneiros.org.br',
};

/**
 * O seletor de papel de uma pessoa.
 *
 * **"Transferir propriedade" mora aqui dentro**, e não num botão à parte — é
 * onde a nuvem de verdade o esconde, e é por isso que o requisito 4.6 existe
 * como demonstração: quem nunca o procurou não sabe que ele existe. Pô-lo
 * como botão na caixa seria a plataforma facilitando o gesto que a lição
 * manda achar.
 */
export function SeletorDePapel({ papel, dono, aoMudar, aoTirar, aoTransferir }: {
  papel: Papel | 'dono';
  dono?: boolean;
  aoMudar?: (p: Papel) => void;
  /** Sem ele não há "Remover acesso": opção que não faz nada é gesto sem efeito. */
  aoTirar?: () => void;
  /** Sem ele o item de transferir não existe: a peça vem pelo setter. */
  aoTransferir?: () => void;
}) {
  if (dono) {
    return <button type="button" className="nv-papel" disabled>Proprietário</button>;
  }
  return (
    <select
      className="nv-papel"
      aria-label="Permissão"
      value={papel}
      onChange={e => {
        if (e.target.value === 'transferir') aoTransferir?.();
        else if (e.target.value === 'sair') aoTirar?.();
        else aoMudar?.(e.target.value as Papel);
      }}
    >
      {PAPEIS.map(p => <option key={p} value={p}>{NOME_DO_PAPEL[p]}</option>)}
      {aoTirar && <option value="sair">Remover acesso</option>}
      {aoTransferir && <option value="transferir">Transferir propriedade</option>}
    </select>
  );
}

/**
 * Quem alcança o arquivo **pela pasta**, recolhido.
 *
 * A nuvem de verdade mostra isto, e mostra recolhido: uma linha dizendo
 * quantas pessoas entram por uma pasta, com uma seta para abrir. Ninguém abre,
 * e é por isso que o arquivo fica aberto sem ninguém saber. Desenhá-lo já
 * expandido poria na nossa tela a resposta que o requisito 5 manda o
 * desbravador ir buscar; escondê-lo de todo faria o programa mentir.
 */
export function AcessoPelaPasta({ nuvem, arquivo, aberto, aoAbrir }: {
  nuvem: Nuvem;
  arquivo: ArquivoDaNuvem;
  aberto: boolean;
  aoAbrir: () => void;
}) {
  const pastas = pastasAcima(nuvem, arquivo.id);
  const gente = [...new Set(pastas.flatMap(p => [p.dono, ...p.acessos.map(a => a.quem)]))]
    .filter(q => q !== arquivo.dono && !arquivo.acessos.some(a => a.quem === q));
  if (gente.length === 0) return null;

  return (
    <div className="nv-herdado">
      <button type="button" className="nv-revelar" aria-expanded={aberto} onClick={aoAbrir}>
        {aberto ? <ChevronDown size={17} aria-hidden /> : <ChevronRight size={17} aria-hidden />}
        {gente.length === 1 ? '1 pessoa tem' : `${gente.length} pessoas têm`} acesso
        {' '}pela pasta {pastas[pastas.length - 1].nome}
      </button>
      {aberto && gente.map(q => (
        <div className="nv-pessoa" key={q}>
          <Bolha quem={q} />
          <span className="nv-quem"><b>{NOME_DO_AUTOR[q]}</b><span>{ENDERECO[q]}</span></span>
          <span className="nv-fraco">
            {NOME_DO_PAPEL[papelDe(nuvem, arquivo.id, q) as Papel]} pela pasta
          </span>
        </div>
      ))}
    </div>
  );
}

/** O que o papel escolhido deixa e não deixa fazer, como a caixa de verdade diz. */
export function OQuePapelDeixa({ papel }: { papel: Papel }) {
  return (
    <div className="nv-oque">
      <p><b>{NOME_DO_PAPEL[papel]} pode:</b> {O_QUE_O_PAPEL_DEIXA[papel].pode}</p>
      <p><b>Não pode:</b> {O_QUE_O_PAPEL_DEIXA[papel].naoPode}</p>
    </div>
  );
}

export function CaixaDeCompartilhar({ arquivo, aoFechar, children }: {
  arquivo: ArquivoDaNuvem;
  aoFechar: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="nv-fundo" onClick={aoFechar} role="presentation">
      <div className="nv-caixa" role="dialog" aria-modal="true"
        aria-label={`Compartilhar ${arquivo.nome}`}
        onClick={e => e.stopPropagation()}>
        <h3>Compartilhar «{arquivo.nome}»</h3>
        {children}
      </div>
    </div>
  );
}

export function PessoaDaCaixa({ quem, dono, children }: {
  quem: Pessoa;
  dono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="nv-pessoa">
      <Bolha quem={quem} />
      <span className="nv-quem">
        <b>{NOME_DO_AUTOR[quem]}{quem === 'voce' ? ' (você)' : ''}</b>
        <span>{ENDERECO[quem]}</span>
      </span>
      {dono ? <SeletorDePapel papel="dono" dono /> : children}
    </div>
  );
}

export function SecaoDaCaixa({ titulo, children }: {
  titulo?: string; children: React.ReactNode;
}) {
  return (
    <div className="nv-secao-caixa">
      {titulo && <h4 className="nv-titulo-secao">{titulo}</h4>}
      {children}
    </div>
  );
}

export function RodapeDaCaixa({ children }: { children: React.ReactNode }) {
  return <div className="nv-rodape-caixa">{children}</div>;
}

export function BotaoDaNuvem({ principal, desligado, aoClicar, children, titulo }: {
  principal?: boolean;
  desligado?: boolean;
  aoClicar?: () => void;
  children: React.ReactNode;
  titulo?: string;
}) {
  return (
    <button type="button" className="nv-btn" title={titulo}
      data-principal={principal ? 'sim' : undefined}
      disabled={desligado} onClick={aoClicar}>
      {children}
    </button>
  );
}
