import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  Pencil, MessageSquare, Eye, History, X, RotateCcw, Star, FolderInput, CloudCheck,
  Search, Undo2, Redo2, Printer, SpellCheck, Paintbrush, ChevronDown, Minus, Plus, Bold,
  Italic, Underline, Baseline, Highlighter, Link, Image, AlignLeft, ArrowUpDown, ListChecks,
  List, ListOrdered, IndentDecrease, IndentIncrease, RemoveFormatting, Lock, Video,
  type LucideIcon,
} from 'lucide-react';
import {
  type ModoDeTrabalho, type Pessoa, type Versao, MODOS_DE_TRABALHO,
} from './arquivoCompartilhado';
import { NOME_DO_AUTOR, COR_DO_AUTOR } from './documento';
import type { FormatoDaSelecao, FormatoDoParagrafoDaSelecao, Marca } from './edicao';
import type { Formatacao, FormatacaoDeParagrafo } from './useEdicaoDoWord';

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
  display: flex; align-items: center; gap: 6px; margin: 8px 14px 0;
  padding: 4px 9px; background: #EDF2FA; border-radius: 999px;
}
.ed-barra-rolagem {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 3px;
  overflow-x: auto; scrollbar-width: none;
}
.ed-barra-rolagem::-webkit-scrollbar { display: none; }
.ed-barra-rolagem > * { flex-shrink: 0; }
.ed-ferramenta {
  border: none; background: none; cursor: pointer; color: #1F1F1F;
  width: 30px; height: 30px; border-radius: 6px; display: grid; place-items: center;
}
.ed-ferramenta:hover { background: #DCE3ED; }
.ed-ferramenta[aria-pressed="true"] { background: #D3E3FD; }
.ed-ferramenta:disabled { color: #9AA0A6; cursor: default; background: none; }
.ed-separador { width: 1px; height: 20px; background: #C4C7C5; margin: 0 5px; }
.ed-modo {
  margin-left: auto; flex-shrink: 0; display: inline-flex; align-items: center; gap: 7px;
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

/* ── O que faz desta janela o editor de documento do navegador ──────────────

   O ícone azul de folha, a estrela, o mover e a nuvem ao lado do nome; os oito
   menus de palavras; a barra larga com desfazer, imprimir, zoom, estilo,
   fonte e tamanho; e o papel centrado numa mesa quase branca, com régua. Sem
   isso a janela era um nome, quatro botões e um texto encostado na borda —
   nada que se reencontre na sala de informática. */
.ed-logo {
  width: 40px; height: 40px; flex: none; display: grid; place-items: center; margin-top: 2px;
  border: none; background: none; cursor: pointer; border-radius: 50%;
}
.ed-logo:hover { background: #F1F3F4; }
.ed-linha-nome { display: flex; align-items: center; gap: 2px; flex-wrap: wrap; }
.ed-icone-nome {
  width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
  border: none; background: none; color: #444746; cursor: pointer;
}
.ed-icone-nome:hover { background: #E8EAED; }
.ed-acoes-topo { display: flex; align-items: center; gap: 6px; }
.ed-redondo {
  width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
  border: none; background: none; color: #444746; cursor: pointer;
}
.ed-redondo:hover { background: #E8EAED; }
.ed-combo {
  display: inline-flex; align-items: center; gap: 4px; height: 26px; padding: 0 6px;
  border: none; background: none; border-radius: 4px; color: #1F1F1F; cursor: pointer;
  font: inherit; font-size: 13px; white-space: nowrap;
}
.ed-combo:hover { background: #DCE3ED; }
.ed-tamanho {
  width: 34px; height: 24px; border: 1px solid #747775; border-radius: 4px; text-align: center;
  font: inherit; font-size: 13px; color: #1F1F1F; background: transparent;
}
.ed-letra { font-family: Arial, sans-serif; font-size: 15px; line-height: 1; }
/* A janela se mede por ela mesma: ao lado do painel de tarefas ela tem
   trezentos pixels a menos do que a tela diz. Abaixo da largura em que a
   barra cabe numa linha, as ferramentas de menos uso saem — é o que o editor
   de verdade faz, recolhendo-as atrás das reticências —, e o seletor de modo,
   que é a lição do requisito 4.4, continua no fim da mesma linha. */
.ed-janela { container-type: inline-size; }
@container (max-width: 1240px) { .ed-menos { display: none !important; } }
@container (max-width: 760px) { .ed-so-largo { display: none !important; } }

.ed-rolagem {
  --px-cm: 34;
  background: #F9FBFD;
}
@media (max-width: 640px)  { .ed-rolagem { --px-cm: 17; } }
@media (min-width: 641px) and (max-width: 1023px) { .ed-rolagem { --px-cm: 26; } }
.ed-regua {
  position: sticky; top: 0; z-index: 4; background: #F9FBFD; padding: 4px 0;
  display: flex; justify-content: center; border-bottom: 1px solid #E3E3E3;
}
.ed-regua-barra {
  width: calc(21 * var(--px-cm) * 1px); height: 14px; position: relative;
  background: #E8EAED; border-radius: 1px;
}
.ed-regua-miolo {
  position: absolute; top: 0; bottom: 0; background: #FFFFFF;
  left: calc(2.5 * var(--px-cm) * 1px); right: calc(2.5 * var(--px-cm) * 1px);
}
.ed-regua-numero {
  position: absolute; top: 1px; transform: translateX(-50%); font-size: 8px; color: #5E5E5E;
  line-height: 12px;
}
/* A folha é a mesma do Word, e a casca é que muda: aqui ela pousa na mesa
   clara, com a borda fina do editor de navegador, e não na mesa cinza do
   Word. Sem estas regras a folha nem existia nesta janela — as medidas
   moram na folha do Word, que este laboratório não carrega, e o texto saía
   encostado na borda da tela. */
.ed-rolagem .wd-canvas { background: transparent; padding: 14px 12px 40px; }
.ed-rolagem .wd-pagina {
  background: #FFFFFF; margin: 0 auto; position: relative; z-index: 0;
  box-shadow: 0 0 0 1px #DADCE0, 0 1px 3px rgba(60,64,67,.15);
  width: calc(var(--largura-cm, 21) * var(--px-cm) * 1px);
  min-height: calc(var(--altura-cm, 29.7) * var(--px-cm) * 1px);
  padding: calc(var(--margem-cm, 2.5) * var(--px-cm) * 1px);
  display: flex; flex-direction: column;
}
.ed-rolagem .wd-pagina + .wd-pagina { margin-top: 12px; }
.ed-rolagem .wd-par { font-size: calc(var(--pt, 11) * var(--px-cm) * 0.035277px); }

`;

/* ── Os três modos: é aqui que o requisito 4.4 acontece ────────────────────── */

/* O desenho de cada modo, e só ele: o nome e o que cada um faz são conteúdo e
   moram em `arquivoCompartilhado.ts`. Exportar este mapa seria oferecer
   segunda fonte para a mesma coisa. */
const ICONE_DO_MODO: Record<ModoDeTrabalho, LucideIcon> = {
  edicao: Pencil, sugestao: MessageSquare, visualizacao: Eye,
};

/* ── O alto ────────────────────────────────────────────────────────────────── */

/**
 * O ícone do editor de documento: a folha azul de canto dobrado.
 *
 * Desenhado aqui, e não tirado de um pacote de ícones: é por ele que se
 * reconhece de longe qual programa está aberto, e um ícone genérico de
 * arquivo diria "algum programa".
 */
function IconeDoDocumento() {
  return (
    <svg width="26" height="34" viewBox="0 0 26 34" aria-hidden="true">
      <path d="M2 0h16l8 8v24a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z" fill="#4285F4" />
      <path d="M18 0l8 8h-6a2 2 0 0 1-2-2z" fill="#A1C2FA" />
      <rect x="6" y="15" width="14" height="2" fill="#FFFFFF" />
      <rect x="6" y="19.5" width="14" height="2" fill="#FFFFFF" />
      <rect x="6" y="24" width="10" height="2" fill="#FFFFFF" />
    </svg>
  );
}

export function TopoDoEditor({ nome, aoMudarNome, menus, direita, aoNaoFazParte, aoIrParaInicio }: {
  nome: string;
  /** Sem ele o nome não se digita: a peça vem pela presença do setter. */
  aoMudarNome?: (n: string) => void;
  menus: ReactNode;
  direita: ReactNode;
  /**
   * Para a estrela, o mover e a nuvem ao lado do nome, que existem no editor
   * de verdade e não fazem parte da lição. Sem ele, os três não são
   * desenhados — ícone que não responde nada ensina que o programa mente.
   */
  aoNaoFazParte?: (comando: string) => void;
  /** O ícone do programa leva de volta à lista de arquivos, como no de verdade. */
  aoIrParaInicio?: () => void;
}) {
  return (
    <div className="ed-topo">
      <button type="button" className="ed-logo" title="Página inicial do Documentos"
        aria-label="Página inicial do Documentos"
        onClick={aoIrParaInicio ?? (() => aoNaoFazParte?.('A página inicial do Documentos'))}>
        <IconeDoDocumento />
      </button>
      <div className="ed-identidade">
        <div className="ed-linha-nome">
          <input
            className="ed-nome"
            value={nome}
            readOnly={!aoMudarNome}
            aria-label="Nome do documento"
            size={Math.max(nome.length, 8)}
            onChange={e => aoMudarNome?.(e.target.value)}
          />
          {aoNaoFazParte && (
            <>
              <button type="button" className="ed-icone-nome" title="Marcar com estrela"
                aria-label="Marcar com estrela" onClick={() => aoNaoFazParte('Marcar com estrela')}>
                <Star size={17} aria-hidden />
              </button>
              <button type="button" className="ed-icone-nome" title="Mover"
                aria-label="Mover o documento" onClick={() => aoNaoFazParte('Mover o documento para outra pasta, por aqui,')}>
                <FolderInput size={17} aria-hidden />
              </button>
              <button type="button" className="ed-icone-nome" title="Todas as alterações foram salvas no Drive"
                aria-label="Status do documento: salvo" onClick={() => aoNaoFazParte('O status de salvamento')}>
                <CloudCheck size={17} aria-hidden />
              </button>
            </>
          )}
        </div>
        <div className="ed-menus">{menus}</div>
      </div>
      <div className="ed-presenca">{direita}</div>
    </div>
  );
}

/**
 * Os oito menus de palavras, na ordem em que o editor de navegador os põe.
 *
 * O laboratório desenha a gaveta dos que a lição usa; os outros abrem a
 * gaveta padrão, com os itens que o programa tem, todos avisando. Menu que
 * não abria nada — Formatar e Ajuda abriam, até aqui, para lugar nenhum — é o
 * muro que ensina a parar de procurar.
 */
export const MENUS_DO_EDITOR = [
  'Arquivo', 'Editar', 'Ver', 'Inserir', 'Formatar', 'Ferramentas', 'Extensões', 'Ajuda',
] as const;

const GAVETAS_PADRAO: Record<(typeof MENUS_DO_EDITOR)[number], string[]> = {
  Arquivo: ['Novo', 'Abrir', 'Fazer uma cópia', 'Compartilhar', 'E-mail', 'Fazer o download', 'Renomear', 'Mover', 'Mover para a lixeira', 'Histórico de versões', 'Disponibilizar off-line', 'Detalhes', 'Idioma', 'Configuração da página', 'Imprimir'],
  Editar: ['Desfazer', 'Refazer', 'Recortar', 'Copiar', 'Colar', 'Colar sem formatação', 'Selecionar tudo', 'Excluir', 'Localizar e substituir'],
  Ver: ['Modo', 'Mostrar layout de impressão', 'Mostrar régua', 'Mostrar contorno', 'Mostrar barra de equações', 'Mostrar caracteres não imprimíveis', 'Tela cheia'],
  Inserir: ['Imagem', 'Tabela', 'Desenho', 'Gráfico', 'Linha horizontal', 'Emoji', 'Caracteres especiais', 'Equação', 'Cabeçalhos e rodapés', 'Números de página', 'Quebra', 'Link', 'Comentário', 'Índice'],
  Formatar: ['Texto', 'Estilos de parágrafo', 'Alinhar e recuar', 'Espaçamento entre linhas e parágrafos', 'Colunas', 'Marcadores e numeração', 'Cabeçalhos e rodapés', 'Números de página', 'Orientação da página', 'Limpar formatação'],
  Ferramentas: ['Ortografia e gramática', 'Contagem de palavras', 'Revisar alterações sugeridas', 'Comparar documentos', 'Citações', 'Dicionário', 'Traduzir documento', 'Digitação por voz', 'Preferências', 'Acessibilidade'],
  Extensões: ['Complementos', 'Apps Script'],
  Ajuda: ['Ajuda do Documentos', 'Treinamento', 'Atualizações', 'Enviar feedback ao Google', 'Atalhos do teclado'],
};

/** A gaveta que o editor de verdade tem nesse menu, com todo item avisando. */
export function GavetaPadraoDoEditor({ menu, aoNaoFazParte }: {
  menu: (typeof MENUS_DO_EDITOR)[number];
  aoNaoFazParte: (comando: string) => void;
}) {
  return (
    <>
      {GAVETAS_PADRAO[menu].map(item => (
        <ItemDaGaveta key={item} aoClicar={() => aoNaoFazParte(`${menu} › ${item}`)}>{item}</ItemDaGaveta>
      ))}
    </>
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
      <Lock size={15} aria-hidden /> Compartilhar
    </button>
  );
}

/* ── A barra fina ──────────────────────────────────────────────────────────── */

/**
 * A barra larga de ferramentas.
 *
 * As ferramentas rolam de lado numa linha só, e o que vai em `direita` — o
 * seletor de modo — fica fora da rolagem, sempre à vista no fim da linha. A
 * barra quebrava em duas e depois em três no celular, empurrando o papel
 * para baixo; e o seletor de modo, que é o requisito 4.4 inteiro, era o
 * primeiro a cair para a linha de baixo.
 */
export function BarraDoEditor({ children, direita }: { children: ReactNode; direita?: ReactNode }) {
  return (
    <div className="ed-barra">
      <div className="ed-barra-rolagem">{children}</div>
      {direita}
    </div>
  );
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
 * As ferramentas que a barra do editor de navegador tem sempre, avisando.
 *
 * Vêm em duas metades porque o laboratório põe a dele no meio, onde o
 * programa de verdade a põe: o comentário fica depois do link, e o que é só
 * da lição — aceitar, rejeitar, o histórico — depois de tudo. Negrito aqui é
 * B, e não N: o editor de navegador não traduz os ícones, ao contrário do
 * Word em português.
 */
/** O que a barra precisa do cursor do documento para agir. */
interface ControleDaBarra {
  formato: FormatoDaSelecao;
  marcar: (m: Marca) => void;
  formatar: (f: Formatacao) => void;
  desfazer: () => void;
  refazer: () => void;
  paragrafar?: (f: FormatacaoDeParagrafo) => void;
  formatoDoParagrafo?: FormatoDoParagrafoDaSelecao;
}

export function FerramentasPadraoDoEditor({ parte, aoNaoFazParte, controle }: {
  parte: 'antes' | 'depois';
  aoNaoFazParte: (comando: string) => void;
  /**
   * O cursor do documento. Com ele, desfazer, refazer, negrito, itálico,
   * sublinhado e o tamanho da letra agem sobre a seleção, como no editor de
   * verdade; sem ele, avisam — é a regra da presença do setter.
   */
  controle?: ControleDaBarra;
}) {
  const acao: Partial<Record<string, () => void>> = controle ? {
    'Desfazer (Ctrl+Z)': controle.desfazer,
    'Refazer (Ctrl+Y)': controle.refazer,
    'Negrito (Ctrl+B)': () => controle.marcar('negrito'),
    'Itálico (Ctrl+I)': () => controle.marcar('italico'),
    'Sublinhado (Ctrl+U)': () => controle.marcar('sublinhado'),
    'Diminuir tamanho da fonte (Ctrl+Shift+,)': () => controle.formatar({ tipo: 'encolher' }),
    'Aumentar tamanho da fonte (Ctrl+Shift+.)': () => controle.formatar({ tipo: 'crescer' }),
    ...(controle.paragrafar ? {
      'Lista com marcadores': () => controle.paragrafar!({ tipo: 'lista', lista: 'marcadores' }),
      'Lista numerada': () => controle.paragrafar!({ tipo: 'lista', lista: 'numeracao' }),
      'Diminuir recuo (Ctrl+[)': () => controle.paragrafar!({ tipo: 'recuo', delta: -1 }),
      'Aumentar recuo (Ctrl+])': () => controle.paragrafar!({ tipo: 'recuo', delta: 1 }),
      'Limpar formatação (Ctrl+\\)': () => controle.formatar({ tipo: 'limpar-caractere' }),
    } : {}),
  } : {};
  const ligado: Partial<Record<string, boolean>> = controle ? {
    'Negrito (Ctrl+B)': controle.formato.negrito,
    'Itálico (Ctrl+I)': controle.formato.italico,
    'Sublinhado (Ctrl+U)': controle.formato.sublinhado,
    'Lista com marcadores': controle.formatoDoParagrafo?.lista === 'marcadores',
    'Lista numerada': controle.formatoDoParagrafo?.lista === 'numeracao',
  } : {};
  const f = (Icone: LucideIcon, dica: string, extra = '') => (
    <button key={dica} type="button" className={`ed-ferramenta ${extra}`} title={dica} aria-label={dica}
      aria-pressed={ligado[dica]}
      /* O clique na barra não tira o cursor do documento. */
      onMouseDown={ev => ev.preventDefault()}
      onClick={() => (acao[dica] ? acao[dica]!() : aoNaoFazParte(dica))}>
      <Icone size={17} aria-hidden />
    </button>
  );
  const combo = (rotulo: string, valor: string, extra = '') => (
    <button key={rotulo} type="button" className={`ed-combo ${extra}`} title={rotulo} aria-label={rotulo}
      onClick={() => aoNaoFazParte(rotulo)}>
      {valor} <ChevronDown size={13} aria-hidden />
    </button>
  );
  if (parte === 'antes') {
    return (
      <>
        {f(Search, 'Pesquisar nos menus (Alt+/)', 'ed-menos')}
        {f(Undo2, 'Desfazer (Ctrl+Z)')}
        {f(Redo2, 'Refazer (Ctrl+Y)')}
        {f(Printer, 'Imprimir (Ctrl+P)', 'ed-menos')}
        {f(SpellCheck, 'Verificação ortográfica e gramatical (Ctrl+Alt+X)', 'ed-menos')}
        {f(Paintbrush, 'Pintar formatação', 'ed-menos')}
        {combo('Zoom', '100%', 'ed-menos')}
        <SeparadorDaBarra />
        {combo('Estilos', 'Texto normal')}
        <SeparadorDaBarra />
        {combo('Fonte', 'Arial', 'ed-so-largo')}
        <span className="ed-so-largo" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          {f(Minus, 'Diminuir tamanho da fonte (Ctrl+Shift+,)')}
          <button type="button" className="ed-tamanho" aria-label="Tamanho da fonte"
            onClick={() => aoNaoFazParte('Tamanho da fonte')}>{controle?.formato.tamanho ?? 11}</button>
          {f(Plus, 'Aumentar tamanho da fonte (Ctrl+Shift+.)')}
        </span>
        <SeparadorDaBarra />
        {f(Bold, 'Negrito (Ctrl+B)')}
        {f(Italic, 'Itálico (Ctrl+I)')}
        {f(Underline, 'Sublinhado (Ctrl+U)')}
        {f(Baseline, 'Cor do texto')}
        {f(Highlighter, 'Cor de destaque', 'ed-menos')}
        <SeparadorDaBarra />
        {f(Link, 'Inserir link (Ctrl+K)')}
      </>
    );
  }
  return (
    <>
      {f(Image, 'Inserir imagem', 'ed-so-largo')}
      <SeparadorDaBarra />
      {f(AlignLeft, 'Alinhar e recuar', 'ed-so-largo')}
      {f(ArrowUpDown, 'Espaçamento entre linhas e parágrafos', 'ed-so-largo')}
      {f(ListChecks, 'Lista de verificação', 'ed-menos')}
      {f(List, 'Lista com marcadores', 'ed-so-largo')}
      {f(ListOrdered, 'Lista numerada', 'ed-so-largo')}
      {f(IndentDecrease, 'Diminuir recuo (Ctrl+[)', 'ed-menos')}
      {f(IndentIncrease, 'Aumentar recuo (Ctrl+])', 'ed-menos')}
      {f(RemoveFormatting, 'Limpar formatação (Ctrl+\\)', 'ed-menos')}
    </>
  );
}

/** Os dois botões redondos do alto, antes das bolhas: comentários e reunião. */
export function AcoesDoTopoDoEditor({ aoNaoFazParte }: { aoNaoFazParte: (comando: string) => void }) {
  return (
    <span className="ed-acoes-topo">
      <button type="button" className="ed-redondo ed-so-largo" title="Abrir histórico de comentários"
        aria-label="Abrir histórico de comentários" onClick={() => aoNaoFazParte('O histórico de comentários')}>
        <MessageSquare size={19} aria-hidden />
      </button>
      <button type="button" className="ed-redondo ed-so-largo" title="Participar de uma chamada aqui ou apresentar esta guia na chamada"
        aria-label="Participar de uma chamada" onClick={() => aoNaoFazParte('Abrir uma reunião de vídeo a partir do documento')}>
        <Video size={19} aria-hidden />
      </button>
    </span>
  );
}

/** A régua do editor, com o branco onde o texto cabe e o cinza das margens. */
export function ReguaDoEditor() {
  return (
    <div className="ed-regua" aria-hidden="true">
      <div className="ed-regua-barra">
        <div className="ed-regua-miolo" />
        {Array.from({ length: 16 }, (_, i) => i + 1).map(n => (
          <span key={n} className="ed-regua-numero"
            style={{ left: `calc(${n + 2.5} * var(--px-cm) * 1px)` }}>{n}</span>
        ))}
      </div>
    </div>
  );
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
      <div className="ed-rolagem"><ReguaDoEditor />{children}</div>
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
