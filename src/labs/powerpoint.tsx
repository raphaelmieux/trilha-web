import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CAMADA_DO_MENU, CAMADA_DO_VEU_DO_MENU } from './camadas';
import { useOrtografiaNoElemento } from './ortografiaNoElemento';
import { Copy, Link2, Music, Play, Plus, Trash2 } from 'lucide-react';
import {
  CSS_OFFICE, BarraDeTituloDoOffice, GuiasDoOffice, ModosDeExibicao, ZoomDoOffice, AcessibilidadeDoStatus,
} from './office';
import {
  PX_POR_PONTO, NIVEIS_DO_TOPICO, aparenciaDoSlide, nivelDoTopico, semVaziosNoFim,
  type CaixaAMao, type GraficoNoSlide, type Slide, type SlideMestre,
} from './apresentacao';

/**
 * A janela do PowerPoint.
 *
 * Ela morava dentro de `ApresentacaoLab.tsx` — barra de título, fileira de
 * guias, faixa, tira de slides, palco, bastidores e prévia de impressão —,
 * tudo privado ao requisito 9 da AP044. A CC-ES011 é a vereda de
 * Apresentações, e precisa da mesma janela: `powerpoint.tsx` é ela, extraída
 * **antes** de a cópia existir, que é a decisão de `word.tsx`, `excel.tsx`,
 * `explorer.tsx`, `leitorDePdf.tsx` e `correio.tsx`, pelo motivo escrito nos
 * cinco — duas cópias divergem no primeiro ajuste, e a plataforma passa a
 * mostrar dois "PowerPoint" diferentes.
 *
 * ── O que fica aqui, e o que fica em cada laboratório ────────────────────
 * Aqui mora o que é do **programa**: como um slide se desenha, o que a barra
 * de título tem, que guias existem e quais delas respondem, como um grupo da
 * faixa se arruma, o que os quatro modelos de design pintam. Em cada
 * laboratório fica o que é do **exercício**: que comandos a faixa oferece, que
 * tarefas se cobram, de que apresentação se parte, que arquivos o computador
 * do clube tem.
 *
 * Nenhuma peça guarda estado. Uma janela com estado próprio obrigaria os dois
 * lados a concordar sobre o mesmo slide ativo, que é a forma mais rápida de
 * mostrarem coisas diferentes — e é o que `excel.tsx` e `explorer.tsx` já
 * documentam dos lados deles.
 *
 * ── E a prévia de impressão vem de fora ─────────────────────────────────
 * `BastidoresDoWord` carregava o documento de um exercício dentro da janela
 * compartilhada, e o segundo laboratório a abrir Imprimir mostraria a prévia
 * do documento do outro. Aqui a prévia recebe os slides por parâmetro, pelo
 * motivo escrito lá: prévia que diverge do documento é pior do que prévia
 * nenhuma.
 */

/* ── A folha, e a crase que ela não pode ter ──────────────────────────────── */

/*
  Comentário dentro deste template não leva crase.

  Já fechou a string nove vezes nesta casa, e o servidor de desenvolvimento
  continua servindo o módulo antigo quando isso acontece: a tela parece certa e
  a medida que se faz nela é de um arquivo que não existe mais. Rode o `tsc`
  antes de medir qualquer coisa no navegador.
*/
export const CSS_POWERPOINT = `
.pp-janela {
  background: #F3F2F1; color: #201F1E; flex: 1;
  display: flex; flex-direction: column; min-height: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px;
}
/* Barra de título e guias: as do Microsoft 365, em office.tsx — a mesma
   janela clara do Word e do Excel, e não mais a faixa laranja do tema
   colorido do Office 2016, que fazia o PowerPoint parecer de outro pacote. */
.pp-titulo, .pp-guias, .pp-guia { font-size: 12px; }
.pp-faixa {
  display: flex; align-items: stretch; padding: 4px 6px 2px;
  background: #F3F2F1; border-bottom: 1px solid #E1DFDD; overflow-x: auto;
}
.pp-grupo {
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 0 8px; border-right: 1px solid #E1DFDD; min-width: max-content;
}
.pp-grupo-corpo { display: flex; align-items: flex-start; gap: 3px; padding: 2px 0 4px; }
.pp-grupo-nome { font-size: 10px; color: #605E5C; text-align: center; padding-bottom: 3px; }
.pp-bt {
  height: 26px; padding: 0 6px; border-radius: 3px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 4px;
  color: #201F1E; font-size: 12px;
}
.pp-bt:hover { background: #EDEBE9 !important; }
.pp-menu {
  position: absolute; z-index: 30; top: 100%; left: 0; margin-top: 2px;
  background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 3px;
  box-shadow: 0 6px 18px rgba(0,0,0,.22); min-width: 220px; padding: 4px; text-align: left;
}
.pp-menu-item {
  display: block; width: 100%; text-align: left; padding: 6px 10px;
  font-size: 12.5px; border: none; border-radius: 2px; cursor: pointer; color: #201F1E;
}
.pp-menu-item:hover { background: #EDEBE9 !important; }
/* O menu do botão direito da miniatura. Fica dentro da janela, e não no
   body: o véu posto fora da moldura da plataforma ficaria por baixo dela. */
.pp-veu { position: fixed; inset: 0; z-index: ${CAMADA_DO_VEU_DO_MENU}; }
.pp-contexto {
  position: fixed; z-index: ${CAMADA_DO_MENU}; background: #FFFFFF; border: 1px solid #C8C6C4;
  border-radius: 4px; box-shadow: 0 8px 24px rgba(0,0,0,.26); min-width: 210px; padding: 4px;
}
.pp-contexto-item { display: flex; align-items: center; gap: 10px; }
.pp-contexto-atalho { margin-left: auto; color: #605E5C; font-size: 11px; padding-left: 16px; }
.pp-tira-item:focus-visible { outline: 2px solid #B7472A; outline-offset: -2px; }
.pp-corpo { flex: 1; min-height: 0; display: flex; background: #F3F2F1; }
.pp-tira {
  width: 168px; flex: none; background: #EDEBE9; border-right: 1px solid #C8C6C4;
  padding: 8px 6px; overflow-y: auto;
}
.pp-tira-item {
  display: flex; gap: 6px; align-items: flex-start; width: 100%;
  background: none; border: none; cursor: pointer; padding: 3px 0 7px;
  color: #605E5C; font-size: 11px;
}
.pp-tira-moldura { flex: 1; border: 2px solid transparent; }
.pp-tira-item[aria-current="true"] .pp-tira-moldura { border-color: #B7472A; }
/* A linha de onde a miniatura arrastada vai cair, como no PowerPoint. */
.pp-tira-item[data-cai-aqui="antes"] { box-shadow: inset 0 3px 0 #B7472A; }
.pp-tira-item[data-cai-aqui="depois"] { box-shadow: inset 0 -3px 0 #B7472A; }
.pp-palco { flex: 1; min-width: 0; overflow: auto; padding: 16px; display: flex; justify-content: center; }
.pp-slide {
  position: relative; aspect-ratio: 16 / 9; width: 100%;
  box-shadow: 0 1px 5px rgba(0,0,0,.3); overflow: hidden;
}
.pp-palco .pp-slide { max-width: 620px; }
.pp-titulo-campo {
  background: transparent; border: 1px dashed transparent; width: 100%;
  font: inherit; color: inherit; text-align: inherit; padding: 1px 3px;
}
.pp-titulo-campo:hover { border-color: #A6A6A6; }
/* O espaço reservado do corpo: tracejado ao passar o ponteiro, contínuo com o
   cursor dentro, e o convite cinza enquanto estiver vazio — como no PowerPoint. */
.pp-corpo-campo {
  margin: 0 22px; border: 1px dashed transparent; min-height: 2.2em; outline: none;
  padding-top: 2px; padding-bottom: 2px; white-space: pre-wrap;
}
.pp-corpo-campo:hover { border-color: #A6A6A6; }
.pp-corpo-campo:focus { border-color: #B7472A; border-style: solid; }
.pp-corpo-campo li { margin-bottom: 3px; }
.pp-corpo-campo[data-vazio="sim"]:not(:focus) li:first-child::before {
  content: 'Clique para adicionar texto'; color: #7A7A7A;
}
/*
  A caixa desenhada à mão fica onde ela ficou, por cima do slide.

  Posição absoluta porque é isso que uma caixa de texto solta é — e é a
  posição de cada uma que o requisito 4.2 da CC-ES011 cobra. O espaço
  reservado do layout não tem posição própria nenhuma, e é essa a diferença.
*/
.pp-caixa { position: absolute; white-space: pre-wrap; }
/*
  A caixa que se mexe: tracejada ao passar o ponteiro, com moldura e alças
  quando escolhida, e a moldura tracejada de novo com o cursor no texto —
  as três aparências do PowerPoint, que dizem o que o próximo clique faz.
*/
.pp-caixa-mexe { outline: 1px dashed transparent; cursor: move; touch-action: none; user-select: none; }
.pp-caixa-mexe:hover { outline-color: #A6A6A6; }
.pp-caixa-mexe[data-escolhida="sim"] { outline: 1px solid #7A7A7A; }
.pp-caixa-mexe[data-escrevendo="sim"] { outline: 1px dashed #7A7A7A; cursor: text; user-select: text; }
.pp-caixa-mexe:focus-visible { outline: 2px solid #B7472A; }
.pp-caixa-texto { outline: none; min-height: 1em; }
.pp-alca {
  position: absolute; width: 9px; height: 9px; background: #FFFFFF;
  border: 1px solid #7A7A7A; border-radius: 50%; transform: translate(-50%, -50%);
  touch-action: none;
}
.pp-alca[data-alca="nw"] { left: 0; top: 0; cursor: nwse-resize; }
.pp-alca[data-alca="n"] { left: 50%; top: 0; cursor: ns-resize; }
.pp-alca[data-alca="ne"] { left: 100%; top: 0; cursor: nesw-resize; }
.pp-alca[data-alca="e"] { left: 100%; top: 50%; cursor: ew-resize; }
.pp-alca[data-alca="se"] { left: 100%; top: 100%; cursor: nwse-resize; }
.pp-alca[data-alca="s"] { left: 50%; top: 100%; cursor: ns-resize; }
.pp-alca[data-alca="sw"] { left: 0; top: 100%; cursor: nesw-resize; }
.pp-alca[data-alca="w"] { left: 0; top: 50%; cursor: ew-resize; }
.pp-logo {
  position: absolute; right: 2.5%; bottom: 4%; background: rgba(0,0,0,.08);
  letter-spacing: .06em; text-transform: uppercase; font-weight: 600;
}
.pp-numero { position: absolute; right: 2.5%; bottom: 1.5%; opacity: .75; }
.pp-grafico { width: 100%; }
.pp-titulo-campo:focus { outline: none; border-color: #B7472A; border-style: solid; }
.pp-status {
  background: #F3F3F3; color: #424242; font-size: 11.5px; border-top: 1px solid #E0E0E0;
  padding: 3px 10px; display: flex; gap: 14px; align-items: center; min-height: 26px; flex: none;
}
.pp-bastidores { flex: 1; min-height: 0; display: flex; background: #FFFFFF; }
.pp-rail {
  width: 190px; flex: none; background: #B7472A; color: #FFFFFF; padding: 12px 0; overflow-y: auto;
}
.pp-rail button {
  display: block; width: 100%; text-align: left; padding: 8px 18px;
  font-size: 13px; color: #FFFFFF; background: none; border: none; cursor: pointer;
}
.pp-rail button:hover { background: rgba(255,255,255,.16); }
.pp-bast-corpo { flex: 1; min-width: 0; overflow: auto; padding: 20px 26px; color: #201F1E; }
.pp-leitor { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #525659; }
.pp-leitor-barra {
  background: #323639; color: #FFFFFF; padding: 6px 10px; font-size: 12px;
  display: flex; align-items: center; gap: 10px;
}
.pp-leitor-corpo { flex: 1; overflow: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.pp-leitor-corpo .pp-slide { max-width: 520px; }

/* ── O painel de notas, embaixo do palco ────────────────────────────────── */
.pp-notas { border-top: 1px solid #C8C6C4; background: #FFFFFF; }
.pp-notas-aba {
  width: 100%; text-align: left; padding: 4px 12px; font-size: 11.5px;
  background: #F3F2F1; border: none; border-bottom: 1px solid #E1DFDD;
  color: #605E5C; cursor: pointer;
}
.pp-notas-aba:hover { background: #EDEBE9; }
.pp-notas-campo {
  width: 100%; min-height: 64px; border: none; resize: vertical; padding: 8px 12px;
  font: inherit; font-size: 12.5px; color: #201F1E; background: #FFFFFF;
}
.pp-notas-campo:focus { outline: 2px solid #B7472A; outline-offset: -2px; }

/* ── O modo mestre ──────────────────────────────────────────────────────── */
.pp-mestre-aviso {
  background: #FFF4CE; color: #4A3C00; border-bottom: 1px solid #F2D77E;
  padding: 5px 12px; font-size: 11.5px;
}
.pp-mestre-campo {
  display: flex; align-items: center; gap: 6px; font-size: 11.5px; padding: 2px 0;
}
.pp-mestre-campo select, .pp-mestre-campo input[type="number"] {
  border: 1px solid #C8C6C4; border-radius: 2px; padding: 2px 4px;
  font: inherit; font-size: 11.5px; background: #FFFFFF; color: #201F1E;
}
.pp-cores { display: flex; gap: 3px; }
.pp-cor {
  width: 20px; height: 20px; border: 1px solid #A6A6A6; border-radius: 2px; cursor: pointer;
  padding: 0;
}
.pp-cor[aria-pressed="true"] { outline: 2px solid #B7472A; outline-offset: 1px; }

/* ── A tela cheia da apresentação ───────────────────────────────────────── */
.pp-telao { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #000000; }
.pp-telao-palco {
  flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center;
  padding: 12px; position: relative;
}
.pp-telao-palco .pp-slide { max-width: min(100%, 760px); }
/*
  A luz da sala lava a cor do projetor, e é por isso que ela é uma camada por
  cima e não uma cor diferente: o slide continua sendo o mesmo slide, e o que
  muda é o que chega ao olho de quem está no fundo.
*/
.pp-telao-luz {
  position: absolute; inset: 12px; pointer-events: none;
  background: rgba(255,255,255,.42);
}
.pp-telao-barra {
  background: #1B1B1B; color: #D6D6D6; font-size: 11.5px; padding: 6px 12px;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.pp-apresentador { display: flex; min-height: 0; flex: 1; gap: 10px; padding: 10px; }
.pp-apresentador-nota {
  width: 230px; flex: none; background: #1B1B1B; color: #F3F2F1;
  border: 1px solid #3A3A3A; border-radius: 4px; padding: 10px; font-size: 12px;
  overflow: auto;
}
@media (max-width: 760px) {
  .pp-apresentador { flex-direction: column; }
  .pp-apresentador-nota { width: auto; }
}

/* ── Diálogo ────────────────────────────────────────────────────────────── */
.pp-fundo {
  position: absolute; inset: 0; background: rgba(0,0,0,.35); z-index: 40;
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.pp-dialogo {
  background: #FFFFFF; color: #201F1E; border: 1px solid #C8C6C4; border-radius: 4px;
  box-shadow: 0 10px 30px rgba(0,0,0,.3); width: min(100%, 420px);
  max-height: 100%; overflow: auto;
}
.pp-dialogo-titulo {
  background: #F3F2F1; border-bottom: 1px solid #E1DFDD; padding: 8px 12px;
  font-size: 12.5px; font-weight: 600;
}
.pp-dialogo-corpo { padding: 12px; font-size: 12.5px; display: flex; flex-direction: column; gap: 10px; }
.pp-dialogo-pe {
  display: flex; justify-content: flex-end; gap: 8px; padding: 10px 12px;
  border-top: 1px solid #E1DFDD;
}
.pp-bt-dialogo {
  border: 1px solid #C8C6C4; background: #FFFFFF; color: #201F1E; border-radius: 2px;
  padding: 4px 14px; font-size: 12.5px; cursor: pointer;
}
.pp-bt-dialogo:hover { background: #F3F2F1; }
/*
  A regra do principal vem antes da do desligado, de propósito.

  As duas têm a mesma especificidade: escrita depois, a do desligado vence e o
  botão apagado deixa de parecer clicável. Invertida, o principal desligado sai
  vermelho e branco com cara de botão, e clicar não faz nada — que é o que
  ensina a desconfiar do programa. É a ordem que a CC-ES001, a CC-ES004 e a
  CC-ES005 precisaram, e a trava confere a ordem e não só a existência.
*/
.pp-bt-dialogo[data-principal="sim"] { background: #B7472A; border-color: #B7472A; color: #FFFFFF; }
.pp-bt-dialogo:disabled {
  background: #F3F2F1; border-color: #E1DFDD; color: #A19F9D; cursor: not-allowed;
}
@media (max-width: 760px) {
  /* A cápsula de tarefas mora no canto de baixo: centrado, o diálogo mais alto
     termina debaixo dela, e vê-se o formulário inteiro sem ver como confirmar.
     Esta regra vem **depois** da que centra, e escrita antes não valeria nada. */
  .pp-fundo { align-items: flex-start; padding-top: 20px; }
}

/* ── O painel de verificação, que é o do PowerPoint ─────────────────────── */
.pp-painel {
  width: 240px; flex: none; background: #FFFFFF; border-left: 1px solid #C8C6C4;
  padding: 10px; overflow: auto; font-size: 12px; color: #201F1E;
}
.pp-painel h4 { font-size: 12.5px; font-weight: 600; margin-bottom: 6px; color: #201F1E; }
.pp-achado {
  border: 1px solid #F2D77E; background: #FFF4CE; border-radius: 3px;
  padding: 6px 8px; margin-bottom: 6px; font-size: 11.5px; color: #4A3C00;
}
.pp-achado[data-tom="bom"] { background: #DFF6E3; border-color: #A8DDB5; color: #13522E; }
@media (max-width: 900px) {
  .pp-painel { width: 190px; }
}
@media (max-width: 720px) {
  .pp-tira { width: 104px; }
  /*
    O painel desce para baixo do palco, **inteiro**, e não desaparece.

    Ele é o único lugar onde o PowerPoint relata o contraste insuficiente, que
    é o caminho do requisito 2.5: escondê-lo tiraria a tarefa da tela estreita.
    É a regra de sempre — reduzir a tela nunca reduz o que dá para fazer nela —
    e é o que a margem de revisão da CC-ES002 faz do lado dela.
  */
  .pp-corpo { flex-direction: column; }
  .pp-painel {
    width: auto; border-left: none; border-top: 1px solid #C8C6C4;
    max-height: 40%; flex: none;
  }
}
${CSS_OFFICE}`;

/* ── As guias ─────────────────────────────────────────────────────────────── */

/**
 * A fileira inteira de guias do PowerPoint.
 *
 * Todas, e não só as que respondem: é assim que um programa é, e uma fileira
 * com três guias ensinaria a procurar a guia que a tarefa quer. Quais delas
 * respondem é de cada laboratório, pelo `usaveis`.
 */
export const GUIAS_DO_POWERPOINT = [
  'Arquivo', 'Página Inicial', 'Inserir', 'Desenhar', 'Design', 'Transições',
  'Animações', 'Apresentação de Slides', 'Revisão', 'Exibir', 'Ajuda',
] as const;

/* ── As peças da janela ───────────────────────────────────────────────────── */

/** A barra de título, com o nome do arquivo e os três botões da direita. */
export function BarraDeTituloDoPowerPoint({ arquivo, aoAvisar, aoNaoFazParte, aoDesfazer, aoRefazer }: {
  arquivo: string;
  aoAvisar: (recado: string) => void;
  aoNaoFazParte: (nome: string) => void;
  /** Desfazer e Refazer do acesso rápido, quando o laboratório os tem. */
  aoDesfazer?: () => void;
  aoRefazer?: () => void;
}) {
  return (
    <BarraDeTituloDoOffice app="powerpoint" classe="pp-titulo" arquivo={arquivo}
      aoAvisar={aoAvisar} aoNaoFazParte={aoNaoFazParte} aoDesfazer={aoDesfazer} aoRefazer={aoRefazer} />
  );
}

/**
 * A fileira de guias.
 *
 * A guia **Arquivo** abre os bastidores quando o laboratório entrega
 * `aoAbrirArquivo`, e avisa que não faz parte quando não entrega — é a decisão
 * do `aoBuscar` do Explorador e do `aoMudarNome` do Word: sem ela, quem
 * precisa da porta redesenha a fileira de guias à mão, que é como a plataforma
 * ficou com dois "Word" uma vez.
 */
export function GuiasDoPowerPoint({ atual, usaveis, aoTrocar, aoNaoFazParte, aoAbrirArquivo }: {
  atual: string;
  usaveis: readonly string[];
  aoTrocar: (nome: string) => void;
  /**
   * Recebe o **nome** do comando, e não o recado: quem escreve a frase é o
   * laboratório, porque é ele que sabe o que faz parte do exercício dele — e é
   * a mesma frase que os botões da barra de título usam.
   */
  aoNaoFazParte: (nome: string) => void;
  aoAbrirArquivo?: () => void;
}) {
  return (
    <GuiasDoOffice app="powerpoint" classe="pp-guias" classeDaGuia="pp-guia"
      guias={GUIAS_DO_POWERPOINT.filter(g => g !== 'Arquivo')} atual={atual} usaveis={usaveis}
      aoTrocar={aoTrocar} aoAbrirArquivo={aoAbrirArquivo}
      aoAvisar={aoNaoFazParte} aoNaoFazParte={aoNaoFazParte} />
  );
}

/** Um grupo da faixa: os botões, e o nome embaixo. */
export function GrupoDoPowerPoint({ nome, children }: {
  nome: string; children: React.ReactNode;
}) {
  return (
    <div className="pp-grupo">
      <div className="pp-grupo-corpo">{children}</div>
      <div className="pp-grupo-nome">{nome}</div>
    </div>
  );
}

/** Um botão da faixa, deitado ou empilhado com o rótulo embaixo. */
export function BotaoDoPowerPoint({ dica, rotulo, aoClicar, children, empilhado, ativo }: {
  dica: string;
  rotulo?: string;
  aoClicar: () => void;
  children: React.ReactNode;
  empilhado?: boolean;
  ativo?: boolean;
}) {
  return (
    <button
      type="button" title={dica} aria-label={dica} aria-pressed={ativo}
      onClick={aoClicar} className="pp-bt"
      style={{
        background: ativo ? '#F7DDD7' : 'transparent',
        border: ativo ? '1px solid #E0B6AC' : '1px solid transparent',
        ...(empilhado
          ? { flexDirection: 'column' as const, height: 'auto', padding: '3px 8px', gap: 2 }
          : {}),
      }}
    >
      {children}
      {rotulo && <span style={{ fontSize: 10.5 }}>{rotulo}</span>}
    </button>
  );
}

/**
 * O menu que cai de um botão da faixa.
 *
 * Ele recebe `aberto` em vez de ler qual menu está aberto: estado próprio aqui
 * obrigaria a janela e o laboratório a concordar sobre o mesmo menu, e quem
 * fecha o menu ao clicar fora é a janela do laboratório.
 */
export function MenuDoPowerPoint({ aberto, children }: {
  aberto: boolean; children: React.ReactNode;
}) {
  if (!aberto) return null;
  return <div className="pp-menu" role="menu">{children}</div>;
}

export function ItemDeMenuDoPowerPoint({ aoClicar, ativo, children }: {
  aoClicar: () => void; ativo?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button" role="menuitem" onClick={aoClicar} className="pp-menu-item"
      style={{ background: ativo ? '#F7DDD7' : 'transparent' }}
    >
      {children}
    </button>
  );
}


/**
 * O slide desenhado — no palco, e menor na tira lateral e na prévia.
 *
 * O `mini` não é um tamanho a menos: é o mesmo desenho com um fator, para que
 * a miniatura seja o slide e não uma segunda representação dele. Duas
 * representações divergiriam, e a tira passaria a mostrar um slide que o palco
 * não mostra.
 *
 * ── Quem manda na aparência é o mestre ──────────────────────────────────
 * Fonte, tamanho, cor e fundo saem de `SlideMestre`, e por cima dele vem a
 * formatação aplicada à mão — nessa ordem, como no PowerPoint. É essa
 * precedência que faz o requisito 4.1 existir: mexer no mestre e nada mudar na
 * tela significa que a direta continua lá, ganhando.
 *
 * ── A folha desenha igual, com imagem boa ou ruim ────────────────────────
 * Resolução não aparece no desenho, e **é essa a premissa**: a foto pequena
 * esticada fica bonita na tela do computador e serrilhada no telão, que é por
 * que tanta apresentação chega assim. É a decisão de `leitorDePdf.tsx` — a
 * folha desenha igual com texto dentro ou sem —, pelo motivo escrito lá: se a
 * tela marcasse qual é qual, o requisito 4.3 não teria o que demonstrar.
 * Quem relata a medida é o programa, onde o PowerPoint a relata.
 *
 * ── E as notas não aparecem aqui ────────────────────────────────────────
 * Elas são o que se fala, e o telão não as mostra. Desenhá-las no slide
 * apagaria a distinção inteira do requisito 2.4.
 *
 * Os caminhos do vídeo e do áudio vinculados vêm de fora, porque são arquivos
 * do computador do exercício — e é neles que a diferença entre incorporar e
 * vincular aparece antes do dia da apresentação.
 *
 * ── O título se digita quando há quem receba o que se digitou ────────────
 * Com `aoEscreverNoTitulo`, o título é um campo; sem ele, é texto. É a regra do
 * `aoBuscar` do Explorador e do `aoMudarNome` do Word, e aqui ela existe para
 * que o palco, a tira lateral e a prévia sejam **um** desenho só: o palco era
 * uma segunda cópia porque precisava do campo, e duas cópias divergem no
 * primeiro ajuste — a tira passaria a mostrar um slide que o palco não mostra.
 */
export function FolhaDoSlide({
  slide, mestre, mini, numero, caminhoDoVideo, nomeDoAudio, caminhoDoAudio,
  aoEscreverNoTitulo, rotuloDoTitulo, aoEscreverNoCorpo, rotuloDoCorpo, desenharGrafico, aoMexerNaCaixa,
}: {
  slide: Slide;
  mestre: SlideMestre;
  mini?: boolean;
  /** O número deste slide, para o campo do pé — que é campo, e não digitado. */
  numero?: number;
  caminhoDoVideo?: string;
  nomeDoAudio?: string;
  caminhoDoAudio?: string;
  aoEscreverNoTitulo?: (texto: string) => void;
  rotuloDoTitulo?: string;
  /**
   * O corpo se escreve no próprio slide, com os marcadores, quando há quem
   * receba as linhas. Era um campo à parte embaixo do palco — um formulário da
   * plataforma onde o PowerPoint tem o espaço reservado —, e o desbravador
   * aprendia a escrever fora do slide.
   */
  aoEscreverNoCorpo?: (topicos: string[]) => void;
  rotuloDoCorpo?: string;
  /**
   * O gráfico, desenhado por quem tem os números.
   *
   * A folha não sabe desenhar gráfico, e é de propósito: quem desenha é o
   * `DesenhoDoGrafico` de `excel.tsx`, que é o mesmo desenho que a planilha
   * faz. Dois desenhos para o mesmo gráfico divergiriam, e o slide passaria a
   * mostrar uma coisa e a planilha outra.
   */
  desenharGrafico?: (g: GraficoNoSlide) => React.ReactNode;
  /**
   * A caixa desenhada à mão se arrasta, se alarga pelas alças, anda pelas
   * setas, se apaga pelo Delete e se reescreve, quando há quem receba a
   * mudança — `null` é a caixa apagada. Sem isso, ela é desenho.
   */
  aoMexerNaCaixa?: (id: string, mudanca: Partial<CaixaAMao> | null) => void;
}) {
  const f = mini ? 0.28 : 1;
  const s = slide;
  const pt = (pontos: number) => pontos * PX_POR_PONTO * f;
  const doTitulo = aparenciaDoSlide(mestre, 'titulo', s.diretoNoTitulo);
  const doCorpo = aparenciaDoSlide(mestre, 'corpo', s.diretoNoCorpo);
  const estilo = (a: ReturnType<typeof aparenciaDoSlide>) => ({
    color: a.cor,
    fontSize: pt(a.tamanho),
    fontWeight: a.negrito ? 600 : 400,
    fontStyle: a.italico ? 'italic' as const : 'normal' as const,
    ...(a.fonte ? { fontFamily: a.fonte } : {}),
  });

  return (
    <div className="pp-slide" style={{ background: mestre.corDoFundo }}>
      {mestre.corDaFaixa !== 'transparent' && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: 6 * f,
          background: mestre.corDaFaixa,
        }} />
      )}
      {mestre.logo && (
        <span className="pp-logo" style={{
          fontSize: 9 * f, padding: `${2 * f}px ${5 * f}px`, borderRadius: 2 * f,
        }}>
          Pioneiros
        </span>
      )}
      {s.layout !== 'em-branco' && (
        <p style={{
          ...estilo(doTitulo), lineHeight: 1.15,
          padding: `${(s.layout === 'titulo' ? 60 : 26) * f}px ${28 * f}px ${8 * f}px`,
          textAlign: s.layout === 'titulo' ? 'center' : 'left',
        }}>
          {aoEscreverNoTitulo ? (
            <input
              className="pp-titulo-campo" value={s.titulo}
              placeholder="Clique para adicionar um título"
              aria-label={rotuloDoTitulo}
              onChange={(ev) => aoEscreverNoTitulo(ev.target.value)}
            />
          ) : (
            s.titulo || (mini ? '' : 'Clique para adicionar um título')
          )}
        </p>
      )}
      {aoEscreverNoCorpo && !mini && s.layout !== 'em-branco'
        && (s.layout !== 'so-titulo' || s.topicos.length > 0) ? (
        <CorpoEditavel
          topicos={s.topicos} aoEscrever={aoEscreverNoCorpo} rotulo={rotuloDoCorpo}
          centrado={s.layout === 'titulo'}
          estilo={{ ...estilo(doCorpo), padding: `0 ${34 * f}px`, lineHeight: 1.5 }}
        />
      ) : s.topicos.length > 0 && (
        <ul style={{
          ...estilo(doCorpo), padding: `0 ${34 * f}px`,
          textAlign: s.layout === 'titulo' ? 'center' : 'left',
          listStyle: s.layout === 'titulo' ? 'none' : 'disc',
          lineHeight: 1.5,
        }}>
          {s.topicos.map((t, i) => {
            const { nivel, texto } = nivelDoTopico(t);
            return <li key={i} style={{ marginBottom: 3 * f, ...estiloDoNivel(nivel) }}>{texto}</li>;
          })}
        </ul>
      )}
      {/*
        As caixas desenhadas à mão, cada uma onde ela ficou.

        Elas vão por cima, em posição absoluta, porque é isso que uma caixa de
        texto solta é — e é a posição de cada uma que o requisito 4.2 cobra.
      */}
      {s.caixas.map(c => {
        const visual = {
          ...estilo(c.papel === 'titulo' ? doTitulo : doCorpo),
          fontSize: pt(c.tamanho),
          lineHeight: c.papel === 'titulo' ? 1.15 : 1.4,
        };
        return aoMexerNaCaixa && !mini ? (
          <CaixaNoSlide key={c.id} caixa={c} visual={visual} aoMexer={m => aoMexerNaCaixa(c.id, m)} />
        ) : (
          <div
            key={c.id} className="pp-caixa"
            style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.largura}%`, ...visual }}
          >
            {c.texto}
          </div>
        );
      })}
      {s.grafico && desenharGrafico && (
        <div className="pp-grafico" style={{ padding: `${4 * f}px ${28 * f}px` }}>
          {desenharGrafico(s.grafico)}
        </div>
      )}
      {s.imagens.length > 0 && (
        <div style={{
          display: 'flex', gap: 10 * f, padding: `${10 * f}px ${28 * f}px`,
          alignItems: s.imagensAlinhadas ? 'flex-start' : 'baseline',
        }}>
          {s.imagens.map((img, i) => (
            <div key={img.id} style={{
              width: `${img.largura}%`, aspectRatio: '4 / 3', background: '#C9C9C9',
              border: '1px solid #A6A6A6', display: 'grid', placeItems: 'center',
              color: '#5A5A5A', fontSize: 9 * f,
              /* Sem alinhar, a segunda entra alguns pixels abaixo — que é o
                 "quase" que se vê projetado. */
              marginTop: s.imagensAlinhadas ? 0 : i * 9 * f,
            }}>
              {mini ? '' : img.legenda}
            </div>
          ))}
        </div>
      )}
      {s.video !== 'nenhuma' && (
        <div style={{ padding: `${6 * f}px ${28 * f}px` }}>
          <div style={{
            background: '#111', color: '#FFF', aspectRatio: '16 / 9', width: '52%',
            display: 'grid', placeItems: 'center',
          }}>
            <Play style={{ width: 18 * f, height: 18 * f }} />
          </div>
          {!mini && s.video === 'vinculada' && caminhoDoVideo && (
            <p style={{
              fontSize: 9.5, color: '#A4262C', marginTop: 2,
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <Link2 className="w-3 h-3" /> Vinculado a {caminhoDoVideo}
            </p>
          )}
        </div>
      )}
      {s.audio !== 'nenhuma' && (
        <div style={{ padding: `0 ${28 * f}px ${6 * f}px` }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10 * f,
            color: doCorpo.cor, border: '1px solid #A6A6A6', borderRadius: 999,
            padding: `${2 * f}px ${8 * f}px`,
          }}>
            <Music style={{ width: 10 * f, height: 10 * f }} /> {mini ? '' : nomeDoAudio}
          </span>
          {!mini && s.audio === 'vinculada' && caminhoDoAudio && (
            <p style={{ fontSize: 9.5, color: '#A4262C', marginTop: 2 }}>
              Vinculado a {caminhoDoAudio}
            </p>
          )}
        </div>
      )}
      {/*
        O número do slide no pé: campo, e não número digitado.

        É a mesma distinção do requisito 4.4 da CC-ES002, e aqui ela é do
        mestre: o campo mostra a posição de cada slide, e quem digita "3" fica
        com três na apresentação inteira.
      */}
      {mestre.numeroNoPe && numero !== undefined && (
        <span className="pp-numero" style={{ fontSize: 9 * f, color: doCorpo.cor }}>
          {numero}
        </span>
      )}
    </div>
  );
}

/** As oito alças da caixa: os quatro cantos e o meio de cada lado. */
const ALCAS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const;
type Alca = typeof ALCAS[number];

/** A menor largura que uma caixa pode ter, em por cento do slide. */
const LARGURA_MINIMA = 4;

/**
 * A caixa de texto desenhada à mão, como ela se mexe no PowerPoint.
 *
 * O primeiro clique escolhe a caixa: aparece a moldura com as oito alças, e
 * arrastar leva a caixa junto. Arrastar uma alça muda a largura — a altura da
 * caixa de texto acompanha o texto, como no PowerPoint, que é por que as
 * alças de cima e de baixo não mudam nada que fique. Com a caixa escolhida,
 * as setas a empurram (com Ctrl, de pouquinho), o Delete a apaga e o Esc a
 * solta. Clicar de novo, F2 ou Enter entram no texto.
 *
 * ── Alinhar no olho é o defeito, e ele continua possível ────────────────
 * O requisito 4.2 da CC-ES011 pede layout **em vez de** caixa à mão, e a
 * tarefa confere que não sobrou caixa nenhuma — e não que as caixas estão na
 * mesma altura. Arrastar até parecer alinhado é o que todo mundo tenta antes,
 * e a simulação deixa tentar: proibir o arrasto ensinaria que caixa solta não
 * se mexe, e ela se mexe em todo programa. O que ela não faz é aparecer no
 * mesmo lugar no slide seguinte.
 *
 * As posições são em por cento do slide, que é o que o modelo guarda: o
 * mesmo arrasto no palco e no telão leva a caixa ao mesmo ponto do slide.
 */
function CaixaNoSlide({ caixa: c, visual, aoMexer }: {
  caixa: CaixaAMao;
  visual: React.CSSProperties;
  aoMexer: (m: Partial<CaixaAMao> | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const texto = useRef<HTMLDivElement>(null);
  const [escolhida, setEscolhida] = useState(false);
  const [escrevendo, setEscrevendo] = useState(false);
  const [arrasto, setArrasto] = useState<{ x: number; y: number; largura: number } | null>(null);
  const gesto = useRef<{
    alca: Alca | null; px: number; py: number; slideL: number; slideA: number;
    x: number; y: number; largura: number; andou: boolean; jaEscolhida: boolean;
  } | null>(null);

  /* Clicar fora solta a caixa, como em todo programa de desenho. */
  useEffect(() => {
    if (!escolhida) return;
    const fora = (ev: PointerEvent) => {
      if (!ref.current?.contains(ev.target as Node)) { setEscolhida(false); setEscrevendo(false); }
    };
    document.addEventListener('pointerdown', fora, true);
    return () => document.removeEventListener('pointerdown', fora, true);
  }, [escolhida]);

  /* Ao entrar no texto, o cursor vai para o fim dele. */
  useLayoutEffect(() => {
    const el = texto.current;
    if (!escrevendo || !el) return;
    el.focus();
    const sel = el.ownerDocument.getSelection();
    if (sel) { sel.selectAllChildren(el); sel.collapseToEnd(); }
  }, [escrevendo]);

  const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const arredondar = (v: number) => Math.round(v * 10) / 10;

  const comecar = (alca: Alca | null) => (ev: React.PointerEvent) => {
    if (escrevendo && alca === null) return;
    if (ev.button !== 0) return;
    ev.stopPropagation();
    const slide = ref.current?.closest('.pp-slide')?.getBoundingClientRect();
    gesto.current = {
      alca, px: ev.clientX, py: ev.clientY,
      slideL: slide?.width || 1, slideA: slide?.height || 1,
      x: c.x, y: c.y, largura: c.largura, andou: false, jaEscolhida: escolhida,
    };
    setEscolhida(true);
    (ev.currentTarget as Element).setPointerCapture?.(ev.pointerId);
    ref.current?.focus({ preventScroll: true });
  };

  const andar = (ev: React.PointerEvent) => {
    const g = gesto.current;
    if (!g) return;
    const dx = ((ev.clientX - g.px) / g.slideL) * 100;
    const dy = ((ev.clientY - g.py) / g.slideA) * 100;
    if (!g.andou && Math.hypot(ev.clientX - g.px, ev.clientY - g.py) < 3) return;
    g.andou = true;
    let { x, y, largura } = g;
    if (g.alca === null) {
      x = limitar(g.x + dx, -largura + 2, 98);
      y = limitar(g.y + dy, -5, 98);
    } else {
      if (g.alca.includes('e')) largura = limitar(g.largura + dx, LARGURA_MINIMA, 100 - g.x);
      if (g.alca.includes('w')) {
        largura = limitar(g.largura - dx, LARGURA_MINIMA, g.x + g.largura);
        x = g.x + g.largura - largura;
      }
    }
    setArrasto({ x: arredondar(x), y: arredondar(y), largura: arredondar(largura) });
  };

  const soltar = () => {
    const g = gesto.current;
    gesto.current = null;
    if (!g) return;
    if (g.andou && arrasto) {
      aoMexer(arrasto);
    } else if (g.alca === null && g.jaEscolhida) {
      setEscrevendo(true);
    }
    setArrasto(null);
  };

  const sairDoTexto = () => {
    const novo = (texto.current?.innerText ?? c.texto).replace(/\n$/, '');
    setEscrevendo(false);
    if (novo !== c.texto) aoMexer({ texto: novo });
    ref.current?.focus({ preventScroll: true });
  };

  const teclar = (ev: React.KeyboardEvent) => {
    if (escrevendo) {
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); sairDoTexto(); }
      return;
    }
    if (!escolhida) return;
    const passo = ev.ctrlKey || ev.metaKey ? 0.25 : 1;
    const setas: Record<string, [number, number]> = {
      ArrowLeft: [-passo, 0], ArrowRight: [passo, 0], ArrowUp: [0, -passo], ArrowDown: [0, passo],
    };
    const seta = setas[ev.key];
    if (seta) {
      ev.preventDefault();
      ev.stopPropagation();
      aoMexer({ x: arredondar(c.x + seta[0]), y: arredondar(c.y + seta[1]) });
      return;
    }
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      ev.preventDefault();
      ev.stopPropagation();
      aoMexer(null);
      return;
    }
    if (ev.key === 'Escape') { ev.stopPropagation(); setEscolhida(false); return; }
    if (ev.key === 'Enter' || ev.key === 'F2') { ev.preventDefault(); setEscrevendo(true); }
  };

  const onde = arrasto ?? c;
  return (
    <div
      ref={ref} className="pp-caixa pp-caixa-mexe" tabIndex={0} role="group"
      aria-label={`Caixa de texto: ${c.texto}`}
      data-escolhida={escolhida ? 'sim' : undefined}
      data-escrevendo={escrevendo ? 'sim' : undefined}
      style={{ left: `${onde.x}%`, top: `${onde.y}%`, width: `${onde.largura}%`, ...visual }}
      onPointerDown={comecar(null)} onPointerMove={andar} onPointerUp={soltar} onPointerCancel={soltar}
      onDoubleClick={() => setEscrevendo(true)}
      onKeyDown={teclar}
    >
      <div
        ref={texto} className="pp-caixa-texto"
        contentEditable={escrevendo ? 'plaintext-only' : false}
        suppressContentEditableWarning
        onBlur={escrevendo ? sairDoTexto : undefined}
      >
        {c.texto}
      </div>
      {escolhida && !escrevendo && ALCAS.map(a => (
        <span
          key={a} className="pp-alca" data-alca={a} aria-hidden="true"
          onPointerDown={comecar(a)} onPointerMove={andar} onPointerUp={soltar} onPointerCancel={soltar}
        />
      ))}
    </div>
  );
}

/**
 * O espaço reservado do corpo, escrito no slide.
 *
 * É uma lista editável do próprio navegador, e não um campo de texto: é ela
 * que desenha o marcador na frente de cada linha e faz o Enter abrir o tópico
 * seguinte, como no PowerPoint. O DOM é de quem digita enquanto ele digita;
 * o modelo só o reescreve quando os dois discordam — reescrever a cada tecla
 * jogaria o cursor para o começo da caixa.
 *
 * As duas leituras aparam as linhas vazias do fim **igual**: sem isso, o Enter
 * no último tópico criaria a linha nova, o modelo a aparava, a comparação
 * acusava diferença e a linha recém-aberta sumia debaixo do cursor.
 */
function CorpoEditavel({ topicos, aoEscrever, rotulo, centrado, estilo }: {
  topicos: string[];
  aoEscrever: (topicos: string[]) => void;
  rotulo?: string;
  centrado: boolean;
  estilo: React.CSSProperties;
}) {
  const ref = useRef<HTMLUListElement>(null);
  /* O corretor da plataforma, e não o do navegador: é ele que conhece o
     dicionário pessoal, e é o mesmo vermelho da folha do Word. */
  const ortografia = useOrtografiaNoElemento(ref);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* Sem item nenhum também se escreve: é no primeiro item que o convite
       cinza aparece, e é nele que o cursor cai ao clicar. */
    if (el.querySelector('li') && semVaziosNoFim(linhasDoCorpo(el)).join('\n') === topicos.join('\n')) return;
    el.replaceChildren(...(topicos.length ? topicos : ['']).map(t => {
      const li = document.createElement('li');
      const { nivel, texto } = nivelDoTopico(t);
      if (nivel) {
        li.dataset.nivel = String(nivel);
        Object.assign(li.style, estiloDoNivel(nivel));
      }
      if (texto) li.textContent = texto;
      else li.appendChild(document.createElement('br'));
      return li;
    }));
  }, [topicos]);

  const aoDigitar = () => {
    const el = ref.current;
    if (!el) return;
    /* Apagar tudo tira até o último item, e o que se digita depois cairia
       solto, sem marcador. Ele volta a ser um tópico. */
    if (!el.querySelector('li') && (el.textContent ?? '') !== '') {
      const li = document.createElement('li');
      li.textContent = el.textContent;
      el.replaceChildren(li);
      const r = document.createRange();
      r.selectNodeContents(li);
      r.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(r);
    }
    aoEscrever(semVaziosNoFim(linhasDoCorpo(el)));
  };

  return (
    <>
    {ortografia.menu}
    <ul
      ref={ref}
      className="pp-corpo-campo"
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onContextMenu={ortografia.aoMenu}
      role="textbox"
      aria-multiline="true"
      aria-label={rotulo}
      data-vazio={topicos.length === 0 ? 'sim' : undefined}
      style={{ ...estilo, textAlign: centrado ? 'center' : 'left', listStyle: centrado ? 'none' : 'disc' }}
      onInput={aoDigitar}
      /* Colar entra como texto: o HTML copiado de uma página traria a cor e a
         fonte dela, que o slide não guarda e a tela mostraria até o próximo
         desenho. */
      onPaste={ev => {
        ev.preventDefault();
        document.execCommand('insertText', false, ev.clipboardData.getData('text/plain'));
      }}
      /* Negrito, itálico e sublinhado moram na faixa e valem para a caixa
         inteira; deixados ao navegador, ele escreveria um <b> que o modelo não
         guarda. */
      onKeyDown={ev => {
        if ((ev.ctrlKey || ev.metaKey) && ['b', 'i', 'u', 'n', 's'].includes(ev.key.toLowerCase())) ev.preventDefault();
        /* Tab rebaixa o tópico e Shift+Tab o sobe, como no PowerPoint. Sem
           isto o Tab tirava o cursor do slide e o levava para a faixa. */
        if (ev.key === 'Tab') {
          ev.preventDefault();
          const no = window.getSelection()?.anchorNode ?? null;
          const li = (no instanceof Element ? no : no?.parentElement)?.closest('li');
          if (!li || !ref.current?.contains(li)) return;
          const agora = Number(li.dataset.nivel ?? 0);
          const novo = Math.max(0, Math.min(NIVEIS_DO_TOPICO - 1, agora + (ev.shiftKey ? -1 : 1)));
          if (novo === agora) return;
          if (novo) li.dataset.nivel = String(novo); else delete li.dataset.nivel;
          li.removeAttribute('style');
          Object.assign(li.style, estiloDoNivel(novo));
          aoDigitar();
        }
      }}
    />
    </>
  );
}

const estiloDoNivel = (nivel: number): React.CSSProperties => (nivel === 0 ? {} : {
  marginLeft: `${nivel * 1.4}em`, listStyleType: nivel === 1 ? 'circle' : 'square', fontSize: '0.9em',
});

/** As linhas da lista, uma por item; sem item nenhum, o texto solto. */
function linhasDoCorpo(el: HTMLElement): string[] {
  const itens = [...el.querySelectorAll('li')];
  if (itens.length) {
    return itens.map(li => '\t'.repeat(Number(li.dataset.nivel ?? 0))
      + (li.textContent ?? '').replace(/\u00a0/g, ' '));
  }
  const t = el.textContent ?? '';
  return t ? t.split('\n') : [];
}

/* ── A tira de slides ─────────────────────────────────────────────────────── */

/** O que se faz com os slides pela tira. Ausente, a tira só navega. */
export interface AcoesDaTira {
  novo: () => void;
  duplicar: () => void;
  excluir: () => void;
  /** Leva o slide atual `delta` posições para baixo (negativo, para cima). */
  mover: (delta: number) => void;
}

/**
 * A tira de miniaturas à esquerda, com o teclado e o menu do PowerPoint.
 *
 * Ela estava escrita três vezes, uma em cada laboratório de apresentação, e as
 * três só sabiam ser clicadas: Ctrl+M não criava slide, Delete não apagava a
 * miniatura escolhida, as setas não andavam, e o botão direito abria o menu
 * do navegador. É o que mais se usa numa apresentação de verdade — montar e
 * reordenar slides pela tira —, e quem aprendeu aqui procurava na faixa o que
 * no programa se faz sem tirar a mão do teclado.
 *
 * Os comandos são do laboratório (`acoes`), porque é ele que guarda a
 * apresentação; aqui fica o gesto. Sem `acoes`, a tira só navega — é a regra
 * da presença do setter, e a CC-ES012, que não monta slide, fica assim.
 */
export function TiraDeSlides({ total, atual, aoIr, rotuloDe, desenhar, acoes }: {
  total: number;
  atual: number;
  aoIr: (i: number) => void;
  rotuloDe: (i: number) => string;
  desenhar: (i: number) => React.ReactNode;
  acoes?: AcoesDaTira;
}) {
  const tira = useRef<HTMLDivElement | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  /* Arrastar a miniatura muda a ordem, como no PowerPoint; a linha mostra
     onde ela vai cair. Só com `acoes`: a tira que só navega não reordena. */
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [cairEm, setCairEm] = useState<number | null>(null);
  /* O foco acompanha o slide atual depois de andar, criar ou excluir: sem
     isso a seta seguinte cairia no botão de um slide que já saiu. */
  const andou = useRef(false);
  useEffect(() => {
    if (!andou.current) return;
    andou.current = false;
    tira.current?.querySelector<HTMLElement>(`[data-slide="${atual}"]`)?.focus();
  }, [atual, total]);

  /*
    Ctrl+M cria slide de qualquer lugar da janela — com o cursor no título ou
    no corpo também, como no PowerPoint. A tira escuta a janela inteira, e não
    só a si mesma, porque é ela quem sabe criar.
  */
  const acoesAtuais = useRef(acoes);
  acoesAtuais.current = acoes;
  useEffect(() => {
    const janela = tira.current?.closest('.pp-janela');
    if (!janela) return;
    const aoTeclar = (ev: Event) => {
      const e = ev as KeyboardEvent;
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'm' || !acoesAtuais.current) return;
      if (tira.current?.contains(e.target as Node)) return; // a tira trata o dela
      e.preventDefault();
      andou.current = true;
      acoesAtuais.current.novo();
    };
    janela.addEventListener('keydown', aoTeclar);
    return () => janela.removeEventListener('keydown', aoTeclar);
  }, []);

  const fazer = (f: () => void) => { andou.current = true; setMenu(null); f(); };
  const ir = (i: number) => {
    if (i < 0 || i >= total) return;
    fazer(() => aoIr(i));
  };

  const teclar = (ev: React.KeyboardEvent) => {
    const ctrl = ev.ctrlKey || ev.metaKey;
    const tecla = ev.key;
    let feito = true;
    if (ctrl && acoes && tecla === 'ArrowUp') fazer(() => acoes.mover(-1));
    else if (ctrl && acoes && tecla === 'ArrowDown') fazer(() => acoes.mover(1));
    else if (ctrl && acoes && tecla.toLowerCase() === 'd') fazer(acoes.duplicar);
    else if (ctrl && acoes && tecla.toLowerCase() === 'm') fazer(acoes.novo);
    else if (ctrl) feito = false;
    else if (tecla === 'ArrowDown' || tecla === 'ArrowRight' || tecla === 'PageDown') ir(atual + 1);
    else if (tecla === 'ArrowUp' || tecla === 'ArrowLeft' || tecla === 'PageUp') ir(atual - 1);
    else if (tecla === 'Home') ir(0);
    else if (tecla === 'End') ir(total - 1);
    /* Enter na tira cria o slide seguinte, e Delete apaga o escolhido — como
       no painel de miniaturas do PowerPoint. */
    else if (acoes && tecla === 'Enter') fazer(acoes.novo);
    else if (acoes && (tecla === 'Delete' || tecla === 'Backspace')) fazer(acoes.excluir);
    else feito = false;
    if (feito) ev.preventDefault();
  };

  return (
    <div className="pp-tira" ref={tira} role="listbox" aria-label="Slides" onKeyDown={teclar}>
      {Array.from({ length: total }, (_, i) => (
        <button key={i} type="button" className="pp-tira-item" role="option"
          aria-selected={i === atual} aria-current={i === atual}
          aria-label={rotuloDe(i)} data-slide={i}
          tabIndex={i === atual ? 0 : -1}
          data-cai-aqui={cairEm === i && arrastando !== null && arrastando !== i ? (i > arrastando ? 'depois' : 'antes') : undefined}
          draggable={!!acoes}
          onDragStart={acoes ? ev => {
            if (ev.dataTransfer) {
              ev.dataTransfer.effectAllowed = 'move';
              ev.dataTransfer.setData('text/plain', String(i));
            }
            setArrastando(i);
            aoIr(i);
          } : undefined}
          onDragOver={acoes ? ev => { if (arrastando === null) return; ev.preventDefault(); setCairEm(i); } : undefined}
          onDrop={acoes ? ev => {
            ev.preventDefault();
            const de = arrastando;
            setArrastando(null);
            setCairEm(null);
            if (de !== null && de !== i) fazer(() => acoes.mover(i - de));
          } : undefined}
          onDragEnd={() => { setArrastando(null); setCairEm(null); }}
          onClick={ev => { ev.stopPropagation(); setMenu(null); aoIr(i); }}
          onContextMenu={acoes ? ev => {
            ev.preventDefault();
            ev.stopPropagation();
            aoIr(i);
            setMenu({ x: ev.clientX, y: ev.clientY });
          } : undefined}>
          <span>{i + 1}</span>
          <span className="pp-tira-moldura">{desenhar(i)}</span>
        </button>
      ))}
      {menu && acoes && (
        <>
          <div className="pp-veu" onPointerDown={() => setMenu(null)}
            onContextMenu={ev => { ev.preventDefault(); setMenu(null); }} />
          <div className="pp-contexto" role="menu" aria-label="Menu do slide"
            style={{ left: Math.min(menu.x, window.innerWidth - 230), top: Math.min(menu.y, window.innerHeight - 150) }}>
            <button type="button" role="menuitem" className="pp-menu-item pp-contexto-item" onClick={() => fazer(acoes.novo)}>
              <Plus className="w-3.5 h-3.5" /> Novo Slide <span className="pp-contexto-atalho">Ctrl+M</span>
            </button>
            <button type="button" role="menuitem" className="pp-menu-item pp-contexto-item" onClick={() => fazer(acoes.duplicar)}>
              <Copy className="w-3.5 h-3.5" /> Duplicar Slide <span className="pp-contexto-atalho">Ctrl+D</span>
            </button>
            <button type="button" role="menuitem" className="pp-menu-item pp-contexto-item" onClick={() => fazer(acoes.excluir)}>
              <Trash2 className="w-3.5 h-3.5" /> Excluir Slide <span className="pp-contexto-atalho">Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── O painel de notas ────────────────────────────────────────────────────── */

/**
 * As notas do apresentador, embaixo do palco.
 *
 * Fechada, a faixa mostra a primeira linha; aberta, ela se digita. Ela aparece
 * **só quando o laboratório entrega `aoEscrever`** — é a regra do `aoBuscar`
 * do Explorador, e sem ela os quatro laboratórios de PowerPoint que não falam
 * de nota ganhariam uma faixa que não faz nada.
 */
export function PainelDeNotas({ notas, aberto, aoAbrir, aoEscrever, rotulo }: {
  notas: string;
  aberto: boolean;
  aoAbrir: () => void;
  aoEscrever?: (texto: string) => void;
  rotulo: string;
}) {
  if (!aoEscrever) return null;
  return (
    <div className="pp-notas">
      <button type="button" className="pp-notas-aba" onClick={aoAbrir}
        aria-expanded={aberto} aria-label="Notas do apresentador">
        {aberto ? '▾' : '▸'} Notas do apresentador
        {!aberto && notas.trim() !== '' && ` — ${notas.trim().slice(0, 60)}`}
        {!aberto && notas.trim() === '' && ' — clique para adicionar notas'}
      </button>
      {aberto && (
        <textarea
          className="pp-notas-campo" value={notas} aria-label={rotulo}
          placeholder="Clique para adicionar notas"
          onChange={(ev) => aoEscrever(ev.target.value)}
        />
      )}
    </div>
  );
}

/* ── A régua de status ────────────────────────────────────────────────────── */

/**
 * A régua de status: qual slide, de quantos, e quantas palavras.
 *
 * Ela **conta o que está na pasta**, e não julga o slide: não escreve "palavras
 * demais". É a regra da régua do Word e do aviso do digitalizador — o contador
 * de palavras existe no PowerPoint de verdade, e dizer que vinte e uma é
 * demais poria na nossa tela a resposta que a lição existe para o desbravador
 * ler na lista de tarefas.
 */
export function ReguaDoPowerPoint({ atual, total, palavras, extra, aoAvisar }: {
  atual: number; total: number; palavras?: number; extra?: React.ReactNode;
  /** Para Anotações, Comentários e os modos de exibição, que existem e não fazem parte. */
  aoAvisar?: (r: string) => void;
}) {
  const avisar = aoAvisar ?? (() => undefined);
  return (
    <div className="pp-status">
      <span className="of-status-esquerda">
        <span>Slide {atual} de {total}</span>
        {palavras !== undefined && (
          <span>{palavras} {palavras === 1 ? 'palavra' : 'palavras'}</span>
        )}
        <span className="hidden sm:inline">Português (Brasil)</span>
        {extra}
      </span>
      <span className="of-status-direita">
        <AcessibilidadeDoStatus app="powerpoint" aoAvisar={avisar} />
        <ModosDeExibicao app="powerpoint" aoAvisar={avisar} />
        <ZoomDoOffice app="powerpoint" aoAvisar={avisar} />
      </span>
    </div>
  );
}

/* ── Diálogo ──────────────────────────────────────────────────────────────── */

export function DialogoDoPowerPoint({ titulo, children, confirmar, aoConfirmar, aoFechar, podeConfirmar = true }: {
  titulo: string;
  children: React.ReactNode;
  confirmar: string;
  aoConfirmar: () => void;
  aoFechar: () => void;
  podeConfirmar?: boolean;
}) {
  return (
    <div className="pp-fundo" onClick={aoFechar}>
      <div className="pp-dialogo" role="dialog" aria-label={titulo}
        onClick={(ev) => ev.stopPropagation()}>
        <div className="pp-dialogo-titulo">{titulo}</div>
        <div className="pp-dialogo-corpo">{children}</div>
        <div className="pp-dialogo-pe">
          <button type="button" className="pp-bt-dialogo" onClick={aoFechar}>Cancelar</button>
          <button
            type="button" className="pp-bt-dialogo" data-principal="sim"
            disabled={!podeConfirmar} onClick={aoConfirmar}
          >
            {confirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── O seletor de cor, com a coluna de tons ───────────────────────────────── */

/**
 * O seletor de cor do tema, com a coluna de tons mais claros e mais escuros.
 *
 * É a coluna que o PowerPoint põe debaixo de cada cor do tema, e é por ela que
 * o conserto do requisito 2.5 acontece: escurecer o ouro do clube até ele se
 * ler, sem deixar de ser o ouro do clube.
 *
 * Ele **não** diz quanto cada tom mede. Essa conta tem lugar próprio, e é o do
 * programa de verdade: Revisão → Verificar Acessibilidade. Escrevê-la aqui
 * poria na nossa tela a resposta que a lição existe para o desbravador achar.
 */
export function SeletorDeCorDoPowerPoint({ tons, escolhida, aoEscolher, rotulo }: {
  tons: { hex: string; nome: string }[];
  escolhida: string;
  aoEscolher: (hex: string) => void;
  rotulo: string;
}) {
  return (
    <div className="pp-cores" role="group" aria-label={rotulo}>
      {tons.map(t => (
        <button
          key={t.hex} type="button" className="pp-cor" title={t.nome} aria-label={t.nome}
          aria-pressed={escolhida.toUpperCase() === t.hex.toUpperCase()}
          style={{ background: t.hex }} onClick={() => aoEscolher(t.hex)}
        />
      ))}
    </div>
  );
}

/* ── O painel lateral do PowerPoint ──────────────────────────────────────── */

/**
 * Um painel à direita, que é onde o PowerPoint põe o que ele relata.
 *
 * Verificar Acessibilidade, Informações da Imagem, Verificar Ortografia — os
 * três abrem aqui. Quem escreve os achados é o laboratório; o painel é do
 * programa, e é por isso que ele não sabe de contraste nenhum.
 */
export function PainelDoPowerPoint({ titulo, children }: {
  titulo: string; children: React.ReactNode;
}) {
  return (
    <aside className="pp-painel" aria-label={titulo}>
      <h4>{titulo}</h4>
      {children}
    </aside>
  );
}

export function AchadoDoPainel({ tom = 'aviso', children }: {
  tom?: 'aviso' | 'bom'; children: React.ReactNode;
}) {
  return <p className="pp-achado" data-tom={tom}>{children}</p>;
}

/* ── A tela cheia: o telão, e o modo do apresentador ──────────────────────── */

/**
 * O slide como a sala o vê.
 *
 * Duas coisas que o programa de verdade tem, e uma que ele não tem.
 *
 * O **modo do apresentador** é dele: a nota na tela de quem fala, o slide no
 * telão, e é ele que faz a nota do requisito 4.5 valer a pena. A **luz da
 * sala** não é: nenhum programa simula projetor. Ela é da plataforma, e por
 * isso o botão que a liga mora no painel de tarefas, onde as coisas da
 * plataforma moram — é a decisão do caderno da CC-ES009, pelo motivo escrito
 * lá: não há botão de programa nenhum que faça isso, e desenhar um dentro da
 * faixa poria coisa nossa dentro do programa imitado.
 */
export function TelaDeApresentacao({
  slide, mestre, numero, total, luz, apresentador,
  aoAvancar, aoVoltar, aoSair, desenharGrafico, nomeDoAudio,
}: {
  slide: Slide;
  mestre: SlideMestre;
  numero: number;
  total: number;
  /** A luz da sala acesa, que lava a cor do projetor. */
  luz: boolean;
  /** O modo do apresentador: a nota ao lado, que o telão não mostra. */
  apresentador: boolean;
  aoAvancar: () => void;
  aoVoltar: () => void;
  aoSair: () => void;
  desenharGrafico?: (g: GraficoNoSlide) => React.ReactNode;
  nomeDoAudio?: string;
}) {
  const folha = (
    <FolhaDoSlide
      slide={slide} mestre={mestre} numero={numero}
      desenharGrafico={desenharGrafico} nomeDoAudio={nomeDoAudio}
    />
  );
  return (
    <div className="pp-telao">
      {apresentador ? (
        <div className="pp-apresentador">
          <div style={{ flex: 1, minWidth: 0, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: '100%', position: 'relative' }}>
              {folha}
              {luz && <div className="pp-telao-luz" style={{ inset: 0 }} />}
            </div>
          </div>
          <div className="pp-apresentador-nota">
            <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 11 }}>Suas notas</p>
            <p>{slide.notas.trim() || 'Este slide não tem nota.'}</p>
          </div>
        </div>
      ) : (
        <div className="pp-telao-palco">
          <div style={{ width: '100%', maxWidth: 760 }}>{folha}</div>
          {luz && <div className="pp-telao-luz" />}
        </div>
      )}
      <div className="pp-telao-barra">
        <button type="button" onClick={aoVoltar} aria-label="Slide anterior">◀</button>
        <span>{numero} / {total}</span>
        <button type="button" onClick={aoAvancar} aria-label="Próximo slide">▶</button>
        {apresentador && <span>Modo de exibição do apresentador</span>}
        {luz && <span>Luz da sala acesa</span>}
        <button type="button" onClick={aoSair} className="ml-auto" aria-label="Sair da apresentação">
          Sair (Esc)
        </button>
      </div>
    </div>
  );
}

/* ── O modo mestre ────────────────────────────────────────────────────────── */

/**
 * O aviso de que se está no mestre, e não num slide.
 *
 * Ele existe porque o mestre **se parece com um slide**, e é aí que mora metade
 * do requisito 4.1: quem não sabe onde está acha que está formatando um slide,
 * e quem formata um slide volta ao problema que a lição existe para desfazer.
 */
export function AvisoDoMestre() {
  return (
    <p className="pp-mestre-aviso">
      Você está no <strong>slide mestre</strong>. O que mudar aqui vale para
      todos os slides de uma vez.
    </p>
  );
}

export function CampoDoMestre({ rotulo, children }: {
  rotulo: string; children: React.ReactNode;
}) {
  return (
    <label className="pp-mestre-campo">
      <span>{rotulo}</span>
      {children}
    </label>
  );
}
