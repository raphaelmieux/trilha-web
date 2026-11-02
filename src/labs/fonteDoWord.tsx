import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown, Eraser, Strikethrough, Subscript, Superscript, Highlighter, Baseline, CaseSensitive, Sparkles,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, ListTree, IndentDecrease, IndentIncrease,
  ArrowDownAZ, Pilcrow, ArrowUpDown, PaintBucket, Square, ClipboardPaste, Scissors, Copy, Paintbrush,
  StickyNote, Ruler, Columns,
} from 'lucide-react';
import { BotaoDaFaixa, GrupoDaFaixa } from './word';
import { IconeItalico, IconeNegrito, IconeSublinhado } from './office';
import {
  FONTES_DO_WORD, COR_DO_REALCE, APARENCIA_DO_ESTILO, NOMES_DA_CAIXA, MEDIDAS_DO_PAPEL, PAGINA_PADRAO,
  type ConfiguracaoDaPagina, type Estilo, type Margens, type ModoDeCaixa, type Orientacao, type Papel, type Realce,
} from './documento';
import {
  TAMANHOS_DO_WORD, type FormatoDaSelecao, type FormatoDoParagrafoDaSelecao, type Marca,
} from './edicao';
import type { ComandoDeTexto, Formatacao, FormatacaoDeParagrafo } from './useEdicaoDoWord';

/*
 * O grupo Fonte da guia Início, que funciona.
 *
 * ── Por que ele é uma peça só, e não um em cada laboratório ──────────────
 * Cada laboratório de Word desenhava o seu grupo Fonte, quase sempre com os
 * botões de enfeite: Negrito avisava que "não faz parte deste exercício". Era
 * honesto enquanto não havia cursor — não havia sobre o que agir. Com o cursor,
 * o negrito passou a ter onde valer, e um Word em que o negrito funciona numa
 * lição e avisa na outra seria dois programas. Ele mora aqui, e os
 * laboratórios o põem na faixa deles.
 *
 * Não guarda estado de documento nenhum: lê o formato da seleção e devolve o
 * comando. O único estado é o da caixa aberta, que é da tela.
 *
 * ── As caixas abrem por cima de tudo ─────────────────────────────────────
 * A faixa rola de lado no celular, e rolagem corta o que sai dela — a lista de
 * fontes abriria cortada no primeiro item. Ela se desenha no `body`, presa ao
 * botão pela posição na tela, que é o que o Word faz com as listas dele.
 */

interface ControleDaFonte {
  formato: FormatoDaSelecao;
  marcar: (m: Marca) => void;
  formatar: (f: Formatacao) => void;
  focar: () => void;
}

interface ControleDosEstilos {
  formato: FormatoDaSelecao;
  estilo: (e: Estilo) => boolean;
}

/** Uma lista suspensa presa a um botão, desenhada fora da faixa. */
function ListaSuspensa({ ancora, aoFechar, children, largura }: {
  ancora: HTMLElement | null;
  aoFechar: () => void;
  children: ReactNode;
  largura?: number;
}) {
  const caixa = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const fora = (ev: MouseEvent) => {
      if (caixa.current?.contains(ev.target as Node) || ancora?.contains(ev.target as Node)) return;
      aoFechar();
    };
    const esc = (ev: KeyboardEvent) => { if (ev.key === 'Escape') aoFechar(); };
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', esc);
    };
  }, [ancora, aoFechar]);
  if (!ancora) return null;
  const r = ancora.getBoundingClientRect();
  return createPortal(
    <div ref={caixa} className="wd-lista-suspensa" role="listbox"
      style={{ top: r.bottom + 2, left: Math.max(4, Math.min(r.left, window.innerWidth - (largura ?? 200) - 4)), width: largura }}
      onMouseDown={ev => ev.preventDefault()}>
      {children}
    </div>,
    document.body,
  );
}

const CORES_DA_FONTE: { nome: string; cor: string }[] = [
  { nome: 'Automático', cor: '#000000' },
  { nome: 'Vermelho Escuro', cor: '#C00000' },
  { nome: 'Vermelho', cor: '#FF0000' },
  { nome: 'Laranja', cor: '#FFC000' },
  { nome: 'Verde', cor: '#00B050' },
  { nome: 'Azul', cor: '#0070C0' },
  { nome: 'Azul-Escuro', cor: '#002060' },
  { nome: 'Roxo', cor: '#7030A0' },
  { nome: 'Cinza', cor: '#7F7F7F' },
];

const NOMES_DO_REALCE: Record<Exclude<Realce, 'nenhum'>, string> = {
  amarelo: 'Amarelo', verde: 'Verde Brilhante', ciano: 'Turquesa', rosa: 'Rosa',
};

export const CSS_FONTE_DO_WORD = `
.wd-lista-suspensa {
  position: fixed; z-index: 1000; background: #FFFFFF; color: #201F1E;
  border: 1px solid #C8C6C4; border-radius: 4px; box-shadow: 0 6px 18px rgba(0,0,0,.22);
  padding: 4px 0; max-height: 320px; overflow-y: auto; font-size: 12.5px;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
.wd-lista-titulo { font-size: 11px; font-weight: 600; color: #605E5C; padding: 6px 10px 3px; background: #F3F2F1; }
.wd-lista-item {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
  padding: 5px 12px; border: none; background: none; cursor: pointer; color: #201F1E; font-size: 13px;
}
.wd-lista-item:hover, .wd-lista-item[aria-selected="true"] { background: #E1DFDD; }
.wd-caixa-fonte {
  display: inline-flex; align-items: center; height: 22px; border: 1px solid #C8C6C4;
  background: #FFFFFF; border-radius: 2px; color: #201F1E; font-size: 12px;
}
.wd-caixa-fonte:hover { border-color: #8A8886; }
.wd-caixa-fonte > button {
  height: 100%; border: none; background: none; cursor: pointer; color: inherit;
  display: inline-flex; align-items: center; padding: 0 4px; font: inherit;
}
.wd-caixa-fonte > button:hover { background: #EDEBE9; }
.wd-caixa-fonte input {
  height: 100%; border: none; outline: none; background: none; color: inherit;
  font: inherit; padding: 0 4px; min-width: 0;
}
.wd-paleta { display: grid; grid-template-columns: repeat(5, 18px); gap: 4px; padding: 6px 10px; }
.wd-paleta button { width: 18px; height: 18px; border: 1px solid #C8C6C4; cursor: pointer; padding: 0; }
.wd-dividido { display: inline-flex; align-items: center; }
.wd-galeria { display: flex; border: 1px solid #E1DFDD; background: #FFFFFF; border-radius: 2px; }
.wd-galeria-item {
  width: 76px; height: 50px; border: 1px solid transparent; background: none; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  color: #201F1E; overflow: hidden;
}
.wd-galeria-item:hover { background: #F3F2F1; }
.wd-galeria-item[aria-pressed="true"] { border-color: #2B579A; background: #EFF4FB; }
.wd-galeria-amostra { font-size: 14px; line-height: 1.1; white-space: nowrap; }
.wd-galeria-nome { font-size: 10px; color: #605E5C; white-space: nowrap; }
.wd-dividido > .wd-seta {
  width: 12px; height: 24px; border: none; background: none; cursor: pointer; color: #605E5C;
  display: inline-flex; align-items: center; justify-content: center; border-radius: 2px;
}
.wd-dividido > .wd-seta:hover { background: #EDEBE9; }
`;

/** Um botão com uma setinha ao lado, que abre as opções — Cor da Fonte, Realce. */
function BotaoDividido({ dica, aoClicar, children, abrir, aberto, ancoraRef }: {
  dica: string;
  aoClicar: () => void;
  children: ReactNode;
  abrir: () => void;
  aberto: boolean;
  ancoraRef: React.MutableRefObject<HTMLSpanElement | null>;
}) {
  return (
    <span className="wd-dividido" ref={ancoraRef}>
      <BotaoDaFaixa dica={dica} aoClicar={aoClicar}>{children}</BotaoDaFaixa>
      <button type="button" className="wd-seta" aria-label={`${dica}: mais opções`} aria-expanded={aberto}
        onMouseDown={ev => ev.preventDefault()} onClick={abrir}>
        <ChevronDown className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

/**
 * O grupo Fonte inteiro: família, tamanho, aumentar e diminuir, limpar, as
 * três marcas, subscrito e sobrescrito, realce e cor.
 *
 * Tachado e Efeitos de Texto estão na fileira e avisam: o modelo do documento não os guarda, e um botão que mudasse a tela
 * sem mudar o documento seria pior do que o aviso.
 */
export function GrupoDeFonte({ edicao, aoAvisar }: {
  edicao: ControleDaFonte;
  aoAvisar: (recado: string) => void;
}) {
  const [aberta, setAberta] = useState<null | 'fonte' | 'tamanho' | 'cor' | 'realce' | 'caixa'>(null);
  const [digitado, setDigitado] = useState<string | null>(null);
  const [ultimaCor, setUltimaCor] = useState('#FF0000');
  const [ultimoRealce, setUltimoRealce] = useState<Exclude<Realce, 'nenhum'>>('amarelo');
  const caixaFonte = useRef<HTMLSpanElement | null>(null);
  const caixaTamanho = useRef<HTMLSpanElement | null>(null);
  const botaoCor = useRef<HTMLSpanElement | null>(null);
  const botaoRealce = useRef<HTMLSpanElement | null>(null);
  const botaoCaixa = useRef<HTMLSpanElement | null>(null);
  const { formato } = edicao;
  const fechar = () => setAberta(null);
  const enfeite = (nome: string) => aoAvisar(`${nome} existe no Word de verdade, e não faz parte deste exercício.`);

  const aplicarTamanho = (valor: string) => {
    const pt = Number(valor.replace(',', '.'));
    setDigitado(null);
    if (!Number.isFinite(pt) || pt < 1 || pt > 1638) {
      aoAvisar('O tamanho precisa ser um número entre 1 e 1638.');
      return;
    }
    edicao.formatar({ tipo: 'tamanho', pt });
    edicao.focar();
  };

  return (
    <GrupoDaFaixa nome="Fonte">
      <div className="wd-linhas">
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span className="wd-caixa-fonte" ref={caixaFonte} style={{ width: 128 }}>
            <button type="button" style={{ flex: 1, justifyContent: 'space-between' }}
              title="Fonte" aria-label="Fonte" aria-haspopup="listbox" aria-expanded={aberta === 'fonte'}
              onMouseDown={ev => ev.preventDefault()}
              onClick={() => setAberta(a => (a === 'fonte' ? null : 'fonte'))}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formato.fonte ?? ''}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </span>
          <span className="wd-caixa-fonte" ref={caixaTamanho} style={{ width: 50 }}>
            <input aria-label="Tamanho da Fonte" title="Tamanho da Fonte"
              value={digitado ?? (formato.tamanho !== null ? String(formato.tamanho) : '')}
              onChange={ev => setDigitado(ev.target.value)}
              onKeyDown={ev => {
                if (ev.key === 'Enter') { ev.preventDefault(); aplicarTamanho(ev.currentTarget.value); }
                if (ev.key === 'Escape') { setDigitado(null); edicao.focar(); }
              }}
              onBlur={() => setDigitado(null)}
              style={{ width: 32 }} />
            <button type="button" aria-label="Tamanhos" aria-expanded={aberta === 'tamanho'}
              onMouseDown={ev => ev.preventDefault()}
              onClick={() => setAberta(a => (a === 'tamanho' ? null : 'tamanho'))}>
              <ChevronDown className="w-3 h-3" />
            </button>
          </span>
          <BotaoDaFaixa dica="Aumentar Tamanho da Fonte (Ctrl+>)" aoClicar={() => edicao.formatar({ tipo: 'crescer' })}>
            <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}>A<sup style={{ fontSize: 8 }}>▲</sup></span>
          </BotaoDaFaixa>
          <BotaoDaFaixa dica="Diminuir Tamanho da Fonte (Ctrl+<)" aoClicar={() => edicao.formatar({ tipo: 'encolher' })}>
            <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1 }}>A<sup style={{ fontSize: 8 }}>▼</sup></span>
          </BotaoDaFaixa>
          <span ref={botaoCaixa}>
            <BotaoDaFaixa dica="Maiúsculas e Minúsculas" aoClicar={() => setAberta(a => (a === 'caixa' ? null : 'caixa'))}>
              <CaseSensitive className="w-4 h-4" />
              <ChevronDown className="w-2.5 h-2.5" />
            </BotaoDaFaixa>
          </span>
          <BotaoDaFaixa dica="Limpar Toda a Formatação" aoClicar={() => edicao.formatar({ tipo: 'limpar' })}>
            <Eraser className="w-3.5 h-3.5" />
          </BotaoDaFaixa>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BotaoDaFaixa dica="Negrito (Ctrl+N)" ativo={formato.negrito} aoClicar={() => edicao.marcar('negrito')}><IconeNegrito /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Itálico (Ctrl+I)" ativo={formato.italico} aoClicar={() => edicao.marcar('italico')}><IconeItalico /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Sublinhado (Ctrl+S)" ativo={formato.sublinhado} aoClicar={() => edicao.marcar('sublinhado')}><IconeSublinhado /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Tachado" aoClicar={() => enfeite('Tachado')}><Strikethrough className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Subscrito (Ctrl+=)" aoClicar={() => edicao.formatar({ tipo: 'subscrito' })}><Subscript className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Sobrescrito (Ctrl+Shift++)" aoClicar={() => edicao.formatar({ tipo: 'sobrescrito' })}><Superscript className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Efeitos de Texto e Tipografia" aoClicar={() => enfeite('Efeitos de Texto e Tipografia')}><Sparkles className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDividido dica="Cor do Realce do Texto" ancoraRef={botaoRealce} aberto={aberta === 'realce'}
            abrir={() => setAberta(a => (a === 'realce' ? null : 'realce'))}
            aoClicar={() => edicao.formatar({ tipo: 'realce', realce: ultimoRealce })}>
            <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
              <Highlighter className="w-3.5 h-3.5" />
              <i style={{ display: 'block', width: 14, height: 3, background: COR_DO_REALCE[ultimoRealce] }} />
            </span>
          </BotaoDividido>
          <BotaoDividido dica="Cor da Fonte" ancoraRef={botaoCor} aberto={aberta === 'cor'}
            abrir={() => setAberta(a => (a === 'cor' ? null : 'cor'))}
            aoClicar={() => edicao.formatar({ tipo: 'cor', cor: ultimaCor })}>
            <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
              <Baseline className="w-3.5 h-3.5" />
              <i style={{ display: 'block', width: 14, height: 3, background: ultimaCor }} />
            </span>
          </BotaoDividido>
        </div>
      </div>

      {aberta === 'fonte' && (
        <ListaSuspensa ancora={caixaFonte.current} aoFechar={fechar} largura={230}>
          <div className="wd-lista-titulo">Fontes do Tema</div>
          <button type="button" className="wd-lista-item" role="option" aria-selected={formato.fonte === 'Calibri'}
            style={{ fontFamily: FONTES_DO_WORD[0].pilha }}
            onClick={() => { edicao.formatar({ tipo: 'fonte', nome: 'Calibri' }); fechar(); }}>
            Calibri <span style={{ marginLeft: 'auto', fontSize: 11, color: '#605E5C', fontFamily: 'system-ui' }}>(Corpo)</span>
          </button>
          <div className="wd-lista-titulo">Todas as Fontes</div>
          {FONTES_DO_WORD.map(f => (
            <button key={f.nome} type="button" className="wd-lista-item" role="option"
              aria-selected={formato.fonte === f.nome} style={{ fontFamily: f.pilha }}
              onClick={() => { edicao.formatar({ tipo: 'fonte', nome: f.nome }); fechar(); }}>
              {f.nome}
            </button>
          ))}
        </ListaSuspensa>
      )}
      {aberta === 'caixa' && (
        <ListaSuspensa ancora={botaoCaixa.current} aoFechar={fechar} largura={260}>
          {(Object.keys(NOMES_DA_CAIXA) as ModoDeCaixa[]).map(m => (
            <button key={m} type="button" className="wd-lista-item" role="option"
              onClick={() => { edicao.formatar({ tipo: 'caixa', modo: m }); fechar(); }}>
              {NOMES_DA_CAIXA[m]}
            </button>
          ))}
        </ListaSuspensa>
      )}
      {aberta === 'tamanho' && (
        <ListaSuspensa ancora={caixaTamanho.current} aoFechar={fechar} largura={64}>
          {TAMANHOS_DO_WORD.map(t => (
            <button key={t} type="button" className="wd-lista-item" role="option" aria-selected={formato.tamanho === t}
              onClick={() => { edicao.formatar({ tipo: 'tamanho', pt: t }); fechar(); }}>
              {t}
            </button>
          ))}
        </ListaSuspensa>
      )}
      {aberta === 'cor' && (
        <ListaSuspensa ancora={botaoCor.current} aoFechar={fechar} largura={150}>
          <div className="wd-lista-titulo">Cores Padrão</div>
          <div className="wd-paleta">
            {CORES_DA_FONTE.map(c => (
              <button key={c.cor} type="button" title={c.nome} aria-label={c.nome} style={{ background: c.cor }}
                onClick={() => { setUltimaCor(c.cor); edicao.formatar({ tipo: 'cor', cor: c.cor }); fechar(); }} />
            ))}
          </div>
        </ListaSuspensa>
      )}
      {aberta === 'realce' && (
        <ListaSuspensa ancora={botaoRealce.current} aoFechar={fechar} largura={170}>
          {(Object.keys(NOMES_DO_REALCE) as Exclude<Realce, 'nenhum'>[]).map(r => (
            <button key={r} type="button" className="wd-lista-item" role="option"
              onClick={() => { setUltimoRealce(r); edicao.formatar({ tipo: 'realce', realce: r }); fechar(); }}>
              <i style={{ width: 14, height: 14, background: COR_DO_REALCE[r], border: '1px solid #C8C6C4' }} />
              {NOMES_DO_REALCE[r]}
            </button>
          ))}
          <button type="button" className="wd-lista-item" role="option"
            onClick={() => { edicao.formatar({ tipo: 'realce', realce: 'nenhum' }); fechar(); }}>
            Sem Cor
          </button>
        </ListaSuspensa>
      )}
    </GrupoDaFaixa>
  );
}

/**
 * A galeria de Estilos da guia Início, que funciona.
 *
 * O estilo vale para todo parágrafo que a seleção toca — com o cursor parado
 * no meio de um título, basta clicar em Título 1. É a mesma peça em todo
 * laboratório que não tem uma galeria própria da lição (a do módulo 1 da
 * CC-ES002 tem, porque o botão direito dela abre Modificar Estilo).
 */
export function GrupoDeEstilos({ edicao, estilos, aoAvisar }: {
  edicao: ControleDosEstilos;
  estilos: Estilo[];
  aoAvisar: (recado: string) => void;
}) {
  return (
    <GrupoDaFaixa nome="Estilos">
      <div className="wd-galeria" role="listbox" aria-label="Estilos">
        {estilos.map(e => {
          const a = APARENCIA_DO_ESTILO[e];
          return (
            <button key={e} type="button" className="wd-galeria-item" title={e} aria-label={e}
              aria-pressed={edicao.formato.estilo === e}
              onMouseDown={ev => ev.preventDefault()}
              onClick={() => {
                if (!edicao.estilo(e)) aoAvisar('Clique primeiro no documento — o estilo vale para onde o cursor está.');
              }}>
              <span className="wd-galeria-amostra" style={{
                color: a.color, fontWeight: a.fontWeight, fontStyle: a.fontStyle,
                fontSize: Math.min(16, Number(a.fontSize ?? 11) + 3),
              }}>AaBbCc</span>
              <span className="wd-galeria-nome">{e}</span>
            </button>
          );
        })}
      </div>
    </GrupoDaFaixa>
  );
}

interface ControleDoParagrafo {
  formatoDoParagrafo: FormatoDoParagrafoDaSelecao;
  paragrafar: (f: FormatacaoDeParagrafo) => void;
  focar: () => void;
}

/** As entrelinhas que o menu do Word oferece. */
const ENTRELINHAS = [1, 1.15, 1.5, 2, 2.5, 3];
const mostrarEntrelinha = (v: number) => v.toFixed(v === 1.15 ? 2 : 1).replace('.', ',');

/**
 * O grupo Parágrafo da guia Início, que funciona.
 *
 * É a mesma razão do grupo Fonte: com cursor, alinhar e listar passaram a ter
 * onde valer, e um Word em que centralizar funciona numa lição e avisa na
 * outra seria dois programas. Tudo vale para o parágrafo do cursor, ou para
 * todos que a seleção toca.
 *
 * Lista de Vários Níveis, Classificar, Sombreamento e Bordas estão na fileira
 * e avisam: o documento não os guarda. "Mostrar Tudo" só funciona onde o
 * laboratório desenha as marcas — é a regra da presença do setter.
 */
export function GrupoDeParagrafo({ edicao, aoAvisar, marcas }: {
  edicao: ControleDoParagrafo;
  aoAvisar: (recado: string) => void;
  marcas?: { ligadas: boolean; alternar: () => void };
}) {
  const [aberta, setAberta] = useState(false);
  const botaoEntrelinha = useRef<HTMLSpanElement | null>(null);
  const f = edicao.formatoDoParagrafo;
  const enfeite = (nome: string) => aoAvisar(`${nome} existe no Word de verdade, e não faz parte deste exercício.`);
  const alinhar = (alinhamento: 'esquerda' | 'centro' | 'direita' | 'justificado') =>
    edicao.paragrafar({ tipo: 'alinhar', alinhamento });
  return (
    <GrupoDaFaixa nome="Parágrafo">
      <div className="wd-linhas">
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BotaoDaFaixa dica="Marcadores" ativo={f.lista === 'marcadores'}
            aoClicar={() => edicao.paragrafar({ tipo: 'lista', lista: 'marcadores' })}><List className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Numeração" ativo={f.lista === 'numeracao'}
            aoClicar={() => edicao.paragrafar({ tipo: 'lista', lista: 'numeracao' })}><ListOrdered className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Lista de Vários Níveis" aoClicar={() => enfeite('A Lista de Vários Níveis')}><ListTree className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Diminuir Recuo" aoClicar={() => edicao.paragrafar({ tipo: 'recuo', delta: -1 })}><IndentDecrease className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Aumentar Recuo" aoClicar={() => edicao.paragrafar({ tipo: 'recuo', delta: 1 })}><IndentIncrease className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Classificar" aoClicar={() => enfeite('Classificar')}><ArrowDownAZ className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Mostrar Tudo (Ctrl+*)" ativo={marcas?.ligadas}
            aoClicar={() => (marcas ? marcas.alternar() : enfeite('Mostrar Tudo'))}><Pilcrow className="w-3.5 h-3.5" /></BotaoDaFaixa>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BotaoDaFaixa dica="Alinhar à Esquerda (Ctrl+Q)" ativo={f.alinhamento === 'esquerda'} aoClicar={() => alinhar('esquerda')}><AlignLeft className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Centralizar (Ctrl+E)" ativo={f.alinhamento === 'centro'} aoClicar={() => alinhar('centro')}><AlignCenter className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Alinhar à Direita (Ctrl+G)" ativo={f.alinhamento === 'direita'} aoClicar={() => alinhar('direita')}><AlignRight className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Justificar (Ctrl+J)" ativo={f.alinhamento === 'justificado'} aoClicar={() => alinhar('justificado')}><AlignJustify className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <span ref={botaoEntrelinha}>
            <BotaoDaFaixa dica="Espaçamento de Linha e Parágrafo" aoClicar={() => setAberta(a => !a)}>
              <ArrowUpDown className="w-3.5 h-3.5" /><ChevronDown className="w-2.5 h-2.5" />
            </BotaoDaFaixa>
          </span>
          <BotaoDaFaixa dica="Sombreamento" aoClicar={() => enfeite('O Sombreamento')}><PaintBucket className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Bordas" aoClicar={() => enfeite('Bordas')}><Square className="w-3.5 h-3.5" /></BotaoDaFaixa>
        </div>
      </div>
      {aberta && (
        <ListaSuspensa ancora={botaoEntrelinha.current} aoFechar={() => setAberta(false)} largura={120}>
          {ENTRELINHAS.map(v => (
            <button key={v} type="button" className="wd-lista-item" role="option" aria-selected={f.entrelinha === v}
              onClick={() => { edicao.paragrafar({ tipo: 'entrelinha', valor: v }); setAberta(false); }}>
              <span style={{ width: 12 }}>{f.entrelinha === v ? '✓' : ''}</span>{mostrarEntrelinha(v)}
            </button>
          ))}
        </ListaSuspensa>
      )}
    </GrupoDaFaixa>
  );
}

interface ControleDaTransferencia {
  copiar: () => string | null;
  executar: (c: ComandoDeTexto) => void;
  temTransferencia: boolean;
  selecao: unknown;
  focar: () => void;
}

/**
 * O grupo Área de Transferência: Colar, Recortar, Copiar e o Pincel.
 *
 * Os três primeiros passam pela área do gancho, que guarda a formatação, e
 * tentam a do sistema também — é o que deixa colar no bloco de notas o que se
 * copiou aqui. A do sistema pode recusar (o navegador pede permissão para
 * ler), e aí vale a do programa, que é a que o Ctrl+V da folha também lê.
 */
export function GrupoAreaDeTransferencia({ edicao, aoAvisar }: {
  edicao: ControleDaTransferencia;
  aoAvisar: (recado: string) => void;
}) {
  const copiar = (recortar: boolean) => {
    if (!edicao.selecao) { aoAvisar('Clique primeiro no documento e selecione o texto.'); return; }
    const texto = edicao.copiar();
    if (texto === null) {
      aoAvisar(`Selecione antes o que quer ${recortar ? 'recortar' : 'copiar'}: arraste por cima do texto, ou use Shift com as setas.`);
      return;
    }
    navigator.clipboard?.writeText(texto).catch(() => undefined);
    if (recortar) edicao.executar({ tipo: 'recortar' });
    edicao.focar();
  };
  const colar = () => {
    if (!edicao.selecao) { aoAvisar('Clique primeiro no documento, onde o texto deve entrar.'); return; }
    if (!edicao.temTransferencia) {
      aoAvisar('A área de transferência está vazia. Selecione um texto e copie antes de colar.');
      return;
    }
    edicao.executar({ tipo: 'colar' });
    edicao.focar();
  };
  return (
    <GrupoDaFaixa nome="Área de Transferência">
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <BotaoDaFaixa dica="Colar (Ctrl+V)" rotulo="Colar" empilhado aoClicar={colar}>
          <ClipboardPaste className="w-6 h-6" style={{ color: edicao.temTransferencia ? '#2B579A' : '#8A8886' }} />
        </BotaoDaFaixa>
        <div className="wd-linhas">
          <BotaoDaFaixa dica="Recortar (Ctrl+X)" aoClicar={() => copiar(true)}><Scissors className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Copiar (Ctrl+C)" aoClicar={() => copiar(false)}><Copy className="w-3.5 h-3.5" /></BotaoDaFaixa>
          <BotaoDaFaixa dica="Pincel de Formatação" aoClicar={() => aoAvisar('O Pincel de Formatação existe no Word de verdade, e não faz parte deste exercício.')}>
            <Paintbrush className="w-3.5 h-3.5" />
          </BotaoDaFaixa>
        </div>
      </div>
    </GrupoDaFaixa>
  );
}

const NOMES_DAS_MARGENS: { v: Margens; nome: string; medida: string }[] = [
  { v: 'normal', nome: 'Normal', medida: '2,5 cm em todos os lados' },
  { v: 'estreita', nome: 'Estreita', medida: '1,27 cm em todos os lados' },
  { v: 'moderada', nome: 'Moderada', medida: '1,91 cm em todos os lados' },
  { v: 'larga', nome: 'Larga', medida: '5,08 cm em todos os lados' },
];
const PAPEIS: Papel[] = ['Carta', 'Ofício', 'A4'];
const emCm = (n: number) => `${n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} cm`;

/**
 * O grupo Configurar Página da guia Layout: Margens, Orientação e Tamanho
 * funcionando, Colunas e Quebras desenhados.
 *
 * A configuração é do **documento** (`Doc.pagina`), e quem a grava é o
 * laboratório, para entrar no Ctrl+Z junto com o resto.
 */
export function GrupoDeConfigurarPagina({ pagina, aoMudar, aoAvisar }: {
  pagina: ConfiguracaoDaPagina | undefined;
  aoMudar: (mudanca: Partial<ConfiguracaoDaPagina>) => void;
  aoAvisar: (recado: string) => void;
}) {
  const [aberta, setAberta] = useState<null | 'margens' | 'orientacao' | 'tamanho'>(null);
  const ancoras = {
    margens: useRef<HTMLSpanElement | null>(null),
    orientacao: useRef<HTMLSpanElement | null>(null),
    tamanho: useRef<HTMLSpanElement | null>(null),
  };
  const p = pagina ?? PAGINA_PADRAO;
  const escolher = (m: Partial<ConfiguracaoDaPagina>) => { aoMudar(m); setAberta(null); };
  const botao = (id: 'margens' | 'orientacao' | 'tamanho', rotulo: string, icone: ReactNode) => (
    <span ref={ancoras[id]}>
      <BotaoDaFaixa dica={rotulo} rotulo={rotulo} empilhado ativo={aberta === id}
        aoClicar={() => setAberta(a => (a === id ? null : id))}>
        {icone}<ChevronDown className="w-3 h-3" />
      </BotaoDaFaixa>
    </span>
  );
  const item = (ativo: boolean, nome: string, detalhe: string | null, aoClicar: () => void) => (
    <button key={nome} type="button" className="wd-lista-item" role="option" aria-selected={ativo}
      onClick={aoClicar} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
      <strong style={{ fontWeight: 600 }}>{nome}</strong>
      {detalhe && <span style={{ fontSize: 11, color: '#605E5C' }}>{detalhe}</span>}
    </button>
  );
  return (
    <GrupoDaFaixa nome="Configurar Página">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {botao('margens', 'Margens', <StickyNote className="w-5 h-5" />)}
        {botao('orientacao', 'Orientação', <Square className="w-5 h-5" />)}
        {botao('tamanho', 'Tamanho', <Ruler className="w-5 h-5" />)}
        <BotaoDaFaixa dica="Colunas" rotulo="Colunas" empilhado
          aoClicar={() => aoAvisar('Colunas existe no Word de verdade, e não faz parte deste exercício.')}>
          <Columns className="w-5 h-5" />
        </BotaoDaFaixa>
      </div>
      {aberta === 'margens' && (
        <ListaSuspensa ancora={ancoras.margens.current} aoFechar={() => setAberta(null)} largura={220}>
          {NOMES_DAS_MARGENS.map(m => item(p.margens === m.v, m.nome, m.medida, () => escolher({ margens: m.v })))}
        </ListaSuspensa>
      )}
      {aberta === 'orientacao' && (
        <ListaSuspensa ancora={ancoras.orientacao.current} aoFechar={() => setAberta(null)} largura={140}>
          {([['retrato', 'Retrato'], ['paisagem', 'Paisagem']] as [Orientacao, string][])
            .map(([v, nome]) => item(p.orientacao === v, nome, null, () => escolher({ orientacao: v })))}
        </ListaSuspensa>
      )}
      {aberta === 'tamanho' && (
        <ListaSuspensa ancora={ancoras.tamanho.current} aoFechar={() => setAberta(null)} largura={200}>
          {PAPEIS.map(papel => item(p.papel === papel, papel,
            `${emCm(MEDIDAS_DO_PAPEL[papel].largura)} × ${emCm(MEDIDAS_DO_PAPEL[papel].altura)}`,
            () => escolher({ papel })))}
        </ListaSuspensa>
      )}
    </GrupoDaFaixa>
  );
}
