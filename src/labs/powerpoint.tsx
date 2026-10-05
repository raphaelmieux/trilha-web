import type React from 'react';
import { Link2, Minus, Music, Play, Presentation, Square as SquareIcon, X } from 'lucide-react';
import type { CoresDoModelo, Slide } from './apresentacao';

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
.pp-titulo {
  background: #B7472A; color: #FFFFFF; display: flex; align-items: center;
  gap: 10px; padding: 6px 10px; font-size: 12px;
}
.pp-guias {
  display: flex; gap: 2px; padding: 0 8px; background: #F9F8F7;
  border-bottom: 1px solid #E1DFDD; overflow-x: auto;
}
.pp-guia {
  padding: 6px 10px 7px; font-size: 12.5px; white-space: nowrap;
  border: none; background: none; color: #201F1E; cursor: pointer;
  border-bottom: 2px solid transparent;
}
.pp-guia:hover { background: #EDEBE9; }
.pp-guia[aria-selected="true"] { color: #B7472A; border-bottom-color: #B7472A; font-weight: 600; }
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
.pp-titulo-campo:focus { outline: none; border-color: #B7472A; border-style: solid; }
.pp-status {
  background: #B7472A; color: #FFFFFF; font-size: 11.5px;
  padding: 4px 10px; display: flex; gap: 14px; align-items: center;
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
.pp-leitor-corpo .pp-slide { max-width: 520px; }`;

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
export function BarraDeTituloDoPowerPoint({ arquivo, aoAvisar, aoNaoFazParte }: {
  arquivo: string;
  aoAvisar: (recado: string) => void;
  aoNaoFazParte: (nome: string) => void;
}) {
  return (
    <div className="pp-titulo">
      <Presentation className="w-4 h-4" />
      <span style={{ fontWeight: 600 }}>{arquivo}</span>
      <span style={{ opacity: .85 }}>— PowerPoint</span>
      <span className="ml-auto flex items-center gap-3" style={{ opacity: .9 }}>
        <button type="button" aria-label="Minimizar" onClick={() => aoNaoFazParte('Minimizar')}>
          <Minus className="w-3 h-3" />
        </button>
        <button type="button" aria-label="Maximizar"
          onClick={() => aoAvisar('O PowerPoint já está ocupando a tela inteira.')}>
          <SquareIcon className="w-2.5 h-2.5" />
        </button>
        <button type="button" aria-label="Fechar" onClick={() => aoNaoFazParte('Fechar o PowerPoint')}>
          <X className="w-3 h-3" />
        </button>
      </span>
    </div>
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
   * Recebe o **nome** da guia, e não o recado: quem escreve a frase é o
   * laboratório, porque é ele que sabe o que faz parte do exercício dele — e é
   * a mesma frase que os botões da barra de título usam.
   */
  aoNaoFazParte: (nome: string) => void;
  aoAbrirArquivo?: () => void;
}) {
  return (
    <div className="pp-guias" role="tablist">
      {GUIAS_DO_POWERPOINT.map((nome) => {
        if (nome === 'Arquivo') {
          return (
            <button
              key={nome} type="button" className="pp-guia"
              style={{ background: '#B7472A', color: '#FFFFFF', borderRadius: '3px 3px 0 0' }}
              onClick={(ev) => {
                ev.stopPropagation();
                if (aoAbrirArquivo) aoAbrirArquivo();
                else aoNaoFazParte('A guia Arquivo');
              }}
            >
              Arquivo
            </button>
          );
        }
        if (usaveis.includes(nome)) {
          return (
            <button
              key={nome} type="button" role="tab" aria-selected={atual === nome}
              className="pp-guia"
              onClick={(ev) => { ev.stopPropagation(); aoTrocar(nome); }}
            >
              {nome}
            </button>
          );
        }
        return (
          <button
            key={nome} type="button" className="pp-guia" style={{ color: '#8A8886' }}
            onClick={(ev) => { ev.stopPropagation(); aoNaoFazParte(`A guia ${nome}`); }}
          >
            {nome}
          </button>
        );
      })}
    </div>
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
  slide, cores, mini, caminhoDoVideo, nomeDoAudio, caminhoDoAudio,
  aoEscreverNoTitulo, rotuloDoTitulo,
}: {
  slide: Slide;
  cores: CoresDoModelo;
  mini?: boolean;
  caminhoDoVideo?: string;
  nomeDoAudio?: string;
  caminhoDoAudio?: string;
  aoEscreverNoTitulo?: (texto: string) => void;
  rotuloDoTitulo?: string;
}) {
  const f = mini ? 0.28 : 1;
  const s = slide;
  return (
    <div className="pp-slide" style={{ background: cores.fundo }}>
      {cores.faixa !== 'transparent' && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: 6 * f, background: cores.faixa,
        }} />
      )}
      {s.layout !== 'em-branco' && (
        <p style={{
          color: cores.titulo, fontSize: 26 * f, fontWeight: 600, lineHeight: 1.15,
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
      {s.topicos.length > 0 && (
        <ul style={{
          color: cores.texto, fontSize: 15 * f, padding: `0 ${34 * f}px`,
          textAlign: s.layout === 'titulo' ? 'center' : 'left',
          listStyle: s.layout === 'titulo' ? 'none' : 'disc',
          lineHeight: 1.5,
        }}>
          {s.topicos.map((t, i) => <li key={i} style={{ marginBottom: 3 * f }}>{t}</li>)}
        </ul>
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
            color: cores.texto, border: '1px solid #A6A6A6', borderRadius: 999,
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
    </div>
  );
}
