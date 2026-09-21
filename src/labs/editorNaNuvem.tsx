import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  Pencil, MessageSquare, Eye, History, Share2, X, RotateCcw, type LucideIcon,
} from 'lucide-react';
import {
  type ModoDeTrabalho, type Pessoa, type Versao, MODOS_DE_TRABALHO,
} from './arquivoCompartilhado';
import { NOME_DO_AUTOR, COR_DO_AUTOR } from './documento';

/*
 * A janela do editor de documento **no navegador**, em peças.
 *
 * ── Ela não redesenha o papel, e isso é a decisão ────────────────────────
 * O documento é o mesmo `Doc` da CC-ES002, e quem o desenha é `FolhaDoWord`,
 * de `word.tsx` — o papel, os parágrafos, as marcas de revisão por autor e os
 * balões da margem. Escrever um segundo desenho de folha aqui seria a
 * plataforma com dois "Word" outra vez, com a divergência aparecendo como
 * texto plausível.
 *
 * O que muda entre os dois programas não é o papel: é a **casca**. O Word tem
 * barra de título, faixa de opções e guias; o editor de navegador tem o nome
 * do arquivo em cima, um menu de palavras, uma barra fina, as bolhas de quem
 * está junto e o botão Compartilhar. É essa casca que está aqui.
 *
 * ── E ela não imita marca ────────────────────────────────────────────────
 * Google Docs, Word na web e o editor do Nextcloud não se parecem, e
 * compartilham esse arranjo. É o que `ide.tsx` faz com o editor de código.
 *
 * ── Nenhuma peça guarda estado do exercício ──────────────────────────────
 * Quem guarda documento, modo, comentário aberto e versão escolhida é o
 * laboratório, que é quem responde à verificação. `CursorDeOutro` mede a
 * posição de um parágrafo na tela, que é conta de desenho e não de exercício —
 * é a mesma categoria do `Emblema`, que lê a proporção da arte no `onLoad`.
 */

export const CSS_DO_EDITOR_NA_NUVEM = `
.ed-janela {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  background: #FFFFFF; color: #1F1F1F;
  font-family: system-ui, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13.5px;
}
.ed-janela h1, .ed-janela h2, .ed-janela h3, .ed-janela h4 { color: #1F1F1F; }
.ed-topo { display: flex; align-items: flex-start; gap: 14px; padding: 8px 14px 0; }
.ed-identidade { flex: 1; min-width: 0; }
.ed-nome {
  border: 1px solid transparent; background: none; font-size: 17px; color: #1F1F1F;
  padding: 3px 7px; border-radius: 5px; font-family: inherit; max-width: 100%;
}
.ed-nome:hover { border-color: #C4C7C5; }
.ed-nome:focus { border-color: #0B57D0; outline: none; background: #FFFFFF; }
.ed-nome:read-only { border-color: transparent; cursor: default; }
.ed-nome:read-only:hover { border-color: transparent; }
.ed-menus { display: flex; gap: 1px; margin-top: 1px; flex-wrap: wrap; }
.ed-menu {
  border: none; background: none; cursor: pointer; color: #1F1F1F;
  font: inherit; font-size: 12.5px; padding: 4px 9px; border-radius: 5px;
}
.ed-menu:hover, .ed-menu[aria-expanded="true"] { background: #E8EAED; }
.ed-gaveta {
  position: absolute; z-index: 40; min-width: 240px; padding: 7px 0;
  background: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,.28);
}
.ed-gaveta-item {
  display: flex; align-items: center; gap: 13px; width: 100%; text-align: left;
  padding: 8px 17px; border: none; background: none; cursor: pointer;
  color: #1F1F1F; font-size: 13.5px;
}
.ed-gaveta-item:hover { background: #F0F4F9; }
.ed-gaveta-item:disabled { color: #9AA0A6; cursor: default; background: none; }

.ed-presenca { display: flex; align-items: center; gap: 12px; padding-top: 6px; }
.ed-bolhas { display: flex; }
.ed-bolha {
  width: 29px; height: 29px; border-radius: 50%; display: grid; place-items: center;
  color: #FFFFFF; font-size: 12px; font-weight: 700; border: 2px solid #FFFFFF;
  margin-left: -7px;
}
.ed-bolha:first-child { margin-left: 0; }
.ed-compartilhar {
  display: inline-flex; align-items: center; gap: 9px; border: none; cursor: pointer;
  background: #C2E7FF; color: #001D35; border-radius: 999px; padding: 9px 19px;
  font: inherit; font-size: 13.5px;
}
.ed-compartilhar:hover { background: #A8DBFF; }

.ed-barra {
  display: flex; align-items: center; gap: 3px; margin: 8px 14px 0;
  padding: 4px 9px; background: #EDF2FA; border-radius: 999px; flex-wrap: wrap;
}
.ed-ferramenta {
  border: none; background: none; cursor: pointer; color: #1F1F1F;
  width: 30px; height: 30px; border-radius: 6px; display: grid; place-items: center;
}
.ed-ferramenta:hover { background: #DCE3ED; }
.ed-ferramenta[aria-pressed="true"] { background: #D3E3FD; }
.ed-ferramenta:disabled { color: #9AA0A6; cursor: default; background: none; }
.ed-separador { width: 1px; height: 20px; background: #C4C7C5; margin: 0 5px; }
.ed-modo {
  margin-left: auto; display: inline-flex; align-items: center; gap: 7px;
  border: none; background: #DCE3ED; color: #1F1F1F; cursor: pointer;
  border-radius: 999px; padding: 6px 13px; font: inherit; font-size: 12.5px;
}
.ed-modo:hover { background: #CBD5E3; }

.ed-palco {
  position: relative; flex: 1; min-height: 0; display: flex; overflow: hidden;
}
.ed-rolagem { flex: 1; min-width: 0; overflow: auto; position: relative; }

/* A bandeirinha de quem está escrevendo junto. Ela fica **fora** do papel, no
   palco, para não empurrar o texto — no editor de verdade o cursor do outro
   também não muda o que está escrito. */
.ed-cursor {
  position: absolute; pointer-events: none; z-index: 5;
  border-left: 2px solid currentColor; padding-left: 0;
}
.ed-cursor > span {
  position: absolute; top: -18px; left: -2px; white-space: nowrap;
  font-size: 11px; color: #FFFFFF; background: currentColor;
  padding: 1px 6px; border-radius: 4px 4px 4px 0;
}
.ed-cursor > span > b { color: #FFFFFF; font-weight: 700; }

.ed-aviso {
  position: absolute; left: 50%; transform: translateX(-50%); bottom: 16px; z-index: 30;
  background: #202124; color: #FFFFFF; border-radius: 6px; padding: 10px 16px;
  font-size: 13px; display: flex; align-items: center; gap: 14px; max-width: 92%;
}
.ed-aviso button {
  border: none; background: none; color: #8AB4F8; cursor: pointer; font: inherit;
}

.ed-historico {
  width: 300px; flex: none; border-left: 1px solid #E3E3E3; background: #FFFFFF;
  display: flex; flex-direction: column; min-height: 0;
}
.ed-historico-topo {
  display: flex; align-items: center; gap: 10px; padding: 14px 16px;
  border-bottom: 1px solid #E3E3E3;
}
.ed-historico-topo h4 { margin: 0; flex: 1; font-size: 15px; font-weight: 400; }
.ed-versoes { flex: 1; min-height: 0; overflow: auto; padding: 8px; }
.ed-versao {
  width: 100%; text-align: left; border: none; background: none; cursor: pointer;
  padding: 10px 12px; border-radius: 8px; color: #1F1F1F; font: inherit;
  border-left: 3px solid transparent;
}
.ed-versao:hover { background: #F0F4F9; }
.ed-versao[aria-current="true"] { background: #E8F0FE; border-left-color: #0B57D0; }
.ed-versao b { display: block; font-weight: 700; font-size: 13.5px; }
.ed-quem-escreveu {
  display: flex; align-items: center; gap: 7px; margin-top: 5px;
  color: #5E5E5E; font-size: 12px; flex-wrap: wrap;
}
.ed-ponto { width: 9px; height: 9px; border-radius: 50%; flex: none; }
.ed-restaurar { padding: 12px 16px; border-top: 1px solid #E3E3E3; }
.ed-restaurar p { margin: 0 0 10px; color: #5E5E5E; font-size: 12px; }
.ed-btn {
  border: 1px solid #C4C7C5; background: #FFFFFF; color: #0B57D0; cursor: pointer;
  border-radius: 999px; padding: 9px 20px; font: inherit;
}
.ed-btn:hover { background: #F0F4F9; }
/* A regra do desligado vem **depois** da do principal, pelo motivo escrito em
   nuvem.tsx: mesma especificidade, e escrita antes ela perde calada. */
.ed-btn[data-principal="sim"] { background: #0B57D0; color: #FFFFFF; border-color: #0B57D0; }
.ed-btn[data-principal="sim"]:hover { background: #0A47AB; }
.ed-btn:disabled { background: #E8EAED; color: #9AA0A6; border-color: #E8EAED; cursor: default; }
.ed-btn:disabled:hover { background: #E8EAED; }

@media (max-width: 760px) {
  /* O painel de histórico deita embaixo do papel, inteiro: esconder as versões
     tiraria o único caminho até o requisito 4.5, e reduzir a tela nunca reduz
     o que dá para fazer nela. */
  .ed-palco { flex-direction: column; }
  .ed-historico {
    width: auto; max-height: 45%; border-left: none; border-top: 1px solid #E3E3E3;
  }
  .ed-topo { flex-direction: column; gap: 6px; }
  .ed-presenca { padding-top: 0; }
}
`;

/* ── Os três modos: é aqui que o requisito 4.4 acontece ────────────────────── */

/* O desenho de cada modo, e só ele: o nome e o que cada um faz são conteúdo e
   moram em `arquivoCompartilhado.ts`. Exportar este mapa seria oferecer
   segunda fonte para a mesma coisa. */
const ICONE_DO_MODO: Record<ModoDeTrabalho, LucideIcon> = {
  edicao: Pencil, sugestao: MessageSquare, visualizacao: Eye,
};

/* ── O alto ────────────────────────────────────────────────────────────────── */

export function TopoDoEditor({ nome, aoMudarNome, menus, direita }: {
  nome: string;
  /** Sem ele o nome não se digita: a peça vem pela presença do setter. */
  aoMudarNome?: (n: string) => void;
  menus: ReactNode;
  direita: ReactNode;
}) {
  return (
    <div className="ed-topo">
      <div className="ed-identidade">
        <input
          className="ed-nome"
          value={nome}
          readOnly={!aoMudarNome}
          aria-label="Nome do documento"
          size={Math.max(nome.length, 8)}
          onChange={e => aoMudarNome?.(e.target.value)}
        />
        <div className="ed-menus">{menus}</div>
      </div>
      <div className="ed-presenca">{direita}</div>
    </div>
  );
}

export function MenuDoEditor({ nome, aberto, aoAbrir, children }: {
  nome: string;
  aberto: boolean;
  aoAbrir: () => void;
  children?: ReactNode;
}) {
  return (
    <span style={{ position: 'relative' }}>
      <button type="button" className="ed-menu" aria-expanded={aberto}
        aria-haspopup="menu" onClick={aoAbrir}>
        {nome}
      </button>
      {aberto && children && (
        <div className="ed-gaveta" role="menu" style={{ top: '100%', left: 0 }}>
          {children}
        </div>
      )}
    </span>
  );
}

export function ItemDaGaveta({ icone: Icone, children, aoClicar, desligado }: {
  icone?: LucideIcon;
  children: ReactNode;
  aoClicar?: () => void;
  desligado?: boolean;
}) {
  return (
    <button type="button" className="ed-gaveta-item" role="menuitem"
      disabled={desligado} onClick={aoClicar}>
      {Icone ? <Icone size={17} aria-hidden /> : <span style={{ width: 17 }} />}
      {children}
    </button>
  );
}

/**
 * As bolhas de quem está com o documento aberto agora.
 *
 * É o que responde ao requisito 2.1 sem uma palavra escrita: duas pessoas
 * dentro do mesmo arquivo, ao mesmo tempo, e nenhuma esperando a outra sair.
 */
export function PresencaNoEditor({ quem }: { quem: Pessoa[] }) {
  return (
    <span className="ed-bolhas" aria-label={`No documento agora: ${quem.map(q => NOME_DO_AUTOR[q]).join(', ')}`}>
      {quem.map(q => (
        <span key={q} className="ed-bolha" title={NOME_DO_AUTOR[q]}
          style={{ background: COR_DO_AUTOR[q] }} aria-hidden>
          {NOME_DO_AUTOR[q].slice(0, 1)}
        </span>
      ))}
    </span>
  );
}

export function BotaoCompartilharNoEditor({ aoClicar }: { aoClicar: () => void }) {
  return (
    <button type="button" className="ed-compartilhar" onClick={aoClicar}>
      <Share2 size={17} aria-hidden /> Compartilhar
    </button>
  );
}

/* ── A barra fina ──────────────────────────────────────────────────────────── */

export function BarraDoEditor({ children }: { children: ReactNode }) {
  return <div className="ed-barra">{children}</div>;
}

export function FerramentaDoEditor({ icone: Icone, dica, ativa, desligada, aoClicar }: {
  icone: LucideIcon;
  dica: string;
  ativa?: boolean;
  desligada?: boolean;
  aoClicar?: () => void;
}) {
  return (
    <button type="button" className="ed-ferramenta" title={dica} aria-label={dica}
      aria-pressed={ativa} disabled={desligada} onClick={aoClicar}>
      <Icone size={17} aria-hidden />
    </button>
  );
}

export function SeparadorDaBarra() {
  return <span className="ed-separador" aria-hidden />;
}

/**
 * O seletor de modo, no canto direito da barra.
 *
 * É onde o editor de verdade o põe, e é por isso que quase ninguém sabe que
 * ele existe — o requisito 4.4 manda demonstrar justamente o modo que está
 * escondido atrás deste lápis. Pô-lo como botão grande na barra seria a
 * plataforma facilitando o gesto que a lição manda achar.
 */
export function SeletorDeModo({ modo, aoTrocar }: {
  modo: ModoDeTrabalho;
  aoTrocar: (m: ModoDeTrabalho) => void;
}) {
  const Icone = ICONE_DO_MODO[modo];
  return (
    <span className="ed-modo">
      <Icone size={15} aria-hidden />
      <select
        aria-label="Modo de edição"
        value={modo}
        onChange={e => aoTrocar(e.target.value as ModoDeTrabalho)}
        style={{ border: 'none', background: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer' }}
      >
        {(Object.keys(MODOS_DE_TRABALHO) as ModoDeTrabalho[]).map(m => (
          <option key={m} value={m}>{MODOS_DE_TRABALHO[m].nome}</option>
        ))}
      </select>
    </span>
  );
}

/* ── O palco: papel, cursores dos outros, e o painel lateral ───────────────── */

/* `CSS.escape` nem sempre existe no ambiente de teste, e um id de bloco é
   `[a-z0-9-]`: sem a volta, um ambiente sem ele derrubaria o cursor calado. */
const escaparId = (id: string) =>
  (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id.replace(/["\\]/g, '\\$&'));

export function PalcoDoEditor({ children, lado }: { children: ReactNode; lado?: ReactNode }) {
  return (
    <div className="ed-palco">
      <div className="ed-rolagem">{children}</div>
      {lado}
    </div>
  );
}

/**
 * O cursor de quem está escrevendo junto, com o nome na bandeirinha.
 *
 * Ele mede o parágrafo pelo `data-bloco` que a folha já emite e se desenha
 * por cima, **sem empurrar o texto** — no editor de verdade o cursor do outro
 * também não muda o que está escrito. Quando o parágrafo não está na tela
 * (folha rolada, bloco apagado), ele simplesmente não aparece: um cursor
 * pendurado em coordenada velha apontaria para o parágrafo errado, que é pior
 * do que cursor nenhum.
 */
export function CursorDeOutro({ quem, blocoId }: { quem: Pessoa; blocoId: string }) {
  const meu = useRef<HTMLDivElement>(null);
  const [caixa, setCaixa] = useState<{ top: number; left: number; height: number } | null>(null);

  useLayoutEffect(() => {
    /* O palco se acha por classe, e não por `offsetParent`: aquele é layout
       calculado, que o jsdom não faz — a trava veria o cursor sumir e
       acusaria o componente de um defeito que é do ambiente. É a mesma
       família do `pointerenter` que o React não escuta. */
    const palco = meu.current?.closest<HTMLElement>('.ed-rolagem') ?? null;
    const alvo = palco?.querySelector<HTMLElement>(`[data-bloco="${escaparId(blocoId)}"]`);
    if (!palco || !alvo) { setCaixa(null); return; }
    const p = palco.getBoundingClientRect();
    const a = alvo.getBoundingClientRect();
    setCaixa({ top: a.top - p.top + palco.scrollTop, left: a.right - p.left, height: a.height });
  }, [blocoId, quem]);

  return (
    <div
      ref={meu}
      className="ed-cursor"
      data-cursor-de={quem}
      style={caixa
        ? { color: COR_DO_AUTOR[quem], top: caixa.top, left: caixa.left, height: caixa.height }
        : { display: 'none' }}
    >
      <span><b>{NOME_DO_AUTOR[quem]}</b></span>
    </div>
  );
}

/** O aviso preto que o editor sobe no pé, e some. É do programa, não da tarefa. */
export function AvisoDoEditor({ children, acao, aoAgir }: {
  children: ReactNode;
  acao?: string;
  aoAgir?: () => void;
}) {
  return (
    <div className="ed-aviso" role="status">
      <span>{children}</span>
      {acao && <button type="button" onClick={aoAgir}>{acao}</button>}
    </div>
  );
}

/* ── O histórico de versões: o requisito 4.5 ──────────────────────────────── */

export function PainelDeHistorico({
  versoes, escolhida, aoEscolher, aoRestaurar, aoFechar,
}: {
  versoes: Versao[];
  escolhida: string | null;
  aoEscolher: (id: string) => void;
  /** Sem ele o painel é só de leitura: a peça vem pela presença do setter. */
  aoRestaurar?: (id: string) => void;
  aoFechar: () => void;
}) {
  const ultima = versoes[versoes.length - 1]?.id;
  return (
    <aside className="ed-historico" aria-label="Histórico de versões">
      <div className="ed-historico-topo">
        <History size={19} aria-hidden />
        <h4>Histórico de versões</h4>
        <button type="button" className="ed-ferramenta" aria-label="Fechar o histórico"
          onClick={aoFechar}><X size={17} aria-hidden /></button>
      </div>

      <div className="ed-versoes">
        {[...versoes].reverse().map(v => (
          <button key={v.id} type="button" className="ed-versao"
            aria-current={v.id === escolhida} onClick={() => aoEscolher(v.id)}>
            <b>{v.quando}{v.id === ultima ? ' (versão atual)' : ''}</b>
            <span className="ed-quem-escreveu">
              {v.porQuem.map(q => (
                <span key={q} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <i className="ed-ponto" style={{ background: COR_DO_AUTOR[q] }} aria-hidden />
                  {NOME_DO_AUTOR[q]}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>

      {aoRestaurar && (
        <div className="ed-restaurar">
          {/* O editor de verdade escreve isto, e escrevê-lo é metade da lição:
              quem acha que restaurar destrói o que veio depois nunca restaura,
              e prefere refazer o trabalho à mão. */}
          <p>A versão de agora continua no histórico depois de restaurar.</p>
          <button type="button" className="ed-btn" data-principal="sim"
            disabled={!escolhida || escolhida === ultima}
            title={escolhida === ultima ? 'Esta já é a versão aberta' : undefined}
            onClick={() => escolhida && aoRestaurar(escolhida)}>
            <RotateCcw size={15} aria-hidden style={{ verticalAlign: '-2px', marginRight: 7 }} />
            Restaurar esta versão
          </button>
        </div>
      )}
    </aside>
  );
}

export function BotaoDoEditor({ principal, desligado, aoClicar, children, titulo }: {
  principal?: boolean;
  desligado?: boolean;
  aoClicar?: () => void;
  children: ReactNode;
  titulo?: string;
}) {
  return (
    <button type="button" className="ed-btn" title={titulo}
      data-principal={principal ? 'sim' : undefined}
      disabled={desligado} onClick={aoClicar}>
      {children}
    </button>
  );
}
