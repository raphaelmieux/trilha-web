import type React from 'react';
import {
  FileText, Search, Combine, Scissors, Minimize2, PenLine, MessageSquare,
  Lock, ScanLine, Download, ChevronLeft, ChevronRight, Highlighter,
  ShieldCheck, ShieldAlert, Image as ImageIcon, Copy,
} from 'lucide-react';
import {
  type DocumentoPdf, type Pagina, type Anotacao,
  pesoKb, pesoEscrito, estadoDaAssinatura, paginasSemTexto,
} from './documentoPdf';

/*
 * A janela do leitor de PDF, em peças.
 *
 * ── Por que ela nasce separada ───────────────────────────────────────────
 * A CC-ES004 abre o mesmo leitor em cinco dos sete módulos — juntar, comprimir,
 * preencher, assinar e montar o dossiê. Escrevê-la dentro do primeiro
 * laboratório e copiá-la nos outros é como a plataforma ficou com dois "Word"
 * uma vez, e o remédio já está escrito em `word.tsx`, em `excel.tsx` e em
 * `explorer.tsx`: extrair **antes** de a cópia existir.
 *
 * ── O que fica aqui e o que fica em cada laboratório ─────────────────────
 * Aqui fica o que é do **programa**: como uma página se desenha, o que a
 * barra de ferramentas tem, o que a régua de status conta. Lá fica o que é do
 * **exercício**: que documento se abre, que tarefas se cobram.
 *
 * Nenhuma peça guarda estado. Quem guarda é o laboratório, que é quem
 * responde à verificação — uma janela com página ativa própria obrigaria os
 * dois lados a concordar sobre a mesma página, que é a forma mais rápida de
 * mostrarem coisas diferentes.
 *
 * ── O leitor não vira Acrobat só onde a tarefa precisa ───────────────────
 * A faixa traz todos os comandos o tempo todo, porque é assim que um programa
 * é. Um leitor que só mostrasse "Combinar" na lição de combinar ensinaria a
 * procurar o botão que a tarefa quer, e não a procurar no programa — a regra
 * que o Explorador da CC-ES001 e o Excel da CC-ES003 já seguem.
 *
 * ── E o aviso de digitalização é o do programa, não nosso ────────────────
 * Quando o documento não tem camada de texto, o leitor de verdade avisa e
 * oferece reconhecer — e para de avisar assim que existir **qualquer** texto,
 * bom ou ruim. Aqui é igual, e é de propósito: é esse silêncio depois de um
 * reconhecimento malfeito que faz o requisito 5 pedir prova em vez de olhada.
 */

/* As cores são as do leitor, e não as da plataforma: dentro de uma janela
   clara, um botão com a cor da plataforma seria a única peça fora do lugar.
   E a superfície clara diz a própria cor, senão os títulos da plataforma —
   que são quase brancos — somem em cima do papel. */
export const CSS_DO_LEITOR = `
.pdf-janela {
  background: #EEF0F2; color: #1F2328;
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
.pdf-janela h1, .pdf-janela h2, .pdf-janela h3, .pdf-janela h4 { color: #1F2328; }

.pdf-titulo {
  background: #FFFFFF; border-bottom: 1px solid #D7DBE0;
  display: flex; align-items: center; gap: 10px; padding: 7px 12px; font-size: 12.5px;
}
.pdf-nome { font-weight: 600; }
.pdf-titulo-dados { margin-left: auto; color: #57606A; font-size: 11.5px; }

.pdf-faixa {
  display: flex; align-items: center; gap: 2px; flex-wrap: nowrap;
  background: #FFFFFF; border-bottom: 1px solid #D7DBE0;
  padding: 5px 8px; overflow-x: auto;
}
.pdf-bt {
  display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
  padding: 6px 9px; border-radius: 4px; font-size: 12.5px; color: #1F2328;
  background: transparent; border: none; cursor: pointer;
}
.pdf-bt:hover:not(:disabled) { background: #E8EBEE; }
.pdf-bt:focus-visible { outline: 2px solid #C1121F; outline-offset: 1px; }
.pdf-bt:disabled { color: #8C959F; cursor: default; }
.pdf-sep { width: 1px; align-self: stretch; background: #D7DBE0; margin: 3px 5px; }

/* Abaixo de 900px o texto dos comandos sai e fica o ícone, que é o que o
   leitor de verdade faz. O comando continua lá: reduzir a tela nunca reduz o
   que dá para fazer nela. */
@media (max-width: 900px) {
  .pdf-bt span.pdf-rotulo { display: none; }
  .pdf-bt { padding: 6px; }
}

.pdf-procurar {
  display: flex; align-items: center; gap: 6px; margin-left: auto;
  background: #F3F5F7; border: 1px solid #D7DBE0; border-radius: 4px; padding: 3px 7px;
}
.pdf-procurar input {
  border: none; outline: none; background: transparent; font: inherit;
  font-size: 12.5px; color: #1F2328; width: 130px;
}
.pdf-achados { font-size: 11.5px; color: #57606A; white-space: nowrap; }
.pdf-achados[data-vazio="sim"] { color: #B3261E; }

.pdf-corpo { flex: 1; display: flex; min-height: 0; }

.pdf-miniaturas {
  width: 132px; flex-shrink: 0; overflow-y: auto; padding: 8px;
  background: #E3E6E9; border-right: 1px solid #D7DBE0;
  display: flex; flex-direction: column; gap: 8px;
}
/* No celular a coluna de miniaturas vira uma fileira em cima: escondê-la
   tiraria o único caminho até escolher página, que é metade do requisito
   4.3. */
@media (max-width: 720px) {
  .pdf-corpo { flex-direction: column; }
  .pdf-miniaturas {
    width: auto; flex-direction: row;
    border-right: none; border-bottom: 1px solid #D7DBE0;
  }
  /* A tira encolhe a **prévia**, e não a altura do painel.
     Ela já teve um teto de altura e a conta não fechava: prévia de 62px mais
     o número mais a marca passavam dos 96px do painel, e o que sobrava de
     fora era a última linha — a marca que diz "imagem". Cortá-la esconde
     exatamente a pista de que aquela página não tem texto dentro, que é o
     requisito 2.2, e esconde sem nada estourar: o painel continua desenhando
     miniaturas bonitas. É "peça que só funciona numa largura de tela é peça
     que some", e quem viu foi o Chromium — no jsdom não há altura nenhuma
     para estourar. */
  .pdf-mini-folha { height: 40px; }
}
.pdf-mini {
  background: #FFFFFF; border: 2px solid transparent; border-radius: 3px;
  padding: 5px; cursor: pointer; text-align: left; flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,.16);
}
.pdf-mini[aria-selected="true"] { border-color: #C1121F; }
.pdf-mini-folha {
  height: 62px; overflow: hidden; font-size: 4.5px; line-height: 1.5;
  color: #57606A; background: #FFFFFF;
}
.pdf-mini-n { font-size: 10.5px; color: #57606A; text-align: center; padding-top: 3px; }
.pdf-mini-marca { font-size: 9px; color: #B3261E; text-align: center; }

.pdf-palco {
  flex: 1; overflow: auto; padding: 18px; min-height: 0;
  background: #525659; display: flex; flex-direction: column;
  align-items: center; gap: 16px;
}
.pdf-folha {
  background: #FFFFFF; color: #1F2328; width: min(560px, 100%);
  padding: 34px 38px; box-shadow: 0 2px 10px rgba(0,0,0,.4);
  font-size: 13px; line-height: 1.65; position: relative;
}
.pdf-folha p { margin: 0 0 9px; }
/* A foto de papel: a mesma tinta, com o que a captura fez com ela. Sem isto,
   digitalizar torto e digitalizar reto dariam a mesma tela e corrigir o
   enquadramento seria um clique que não muda nada. */
.pdf-folha[data-papel="sim"] { background: #FBFAF6; }
.pdf-marca-dagua {
  position: absolute; inset: auto 0 10px 0; text-align: center;
  font-size: 10.5px; color: #8C959F;
}

.pdf-aviso-scan {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  background: #FFF4E5; border-bottom: 1px solid #F0C48A;
  color: #7A4B00; padding: 8px 12px; font-size: 12.5px;
}
.pdf-aviso-scan button {
  background: #1F6FEB; color: #FFFFFF; border: none; border-radius: 4px;
  padding: 5px 11px; font-size: 12.5px; cursor: pointer;
}

.pdf-margem {
  width: 210px; flex-shrink: 0; overflow-y: auto; padding: 10px;
  background: #F3F5F7; border-left: 1px solid #D7DBE0;
  display: flex; flex-direction: column; gap: 8px;
}
/* No celular não há 210px de sobra ao lado, e a margem desce inteira para
   baixo do papel — esconder os balões tiraria o caminho até o requisito 4.6. */
@media (max-width: 720px) {
  .pdf-margem { width: auto; border-left: none; border-top: 1px solid #D7DBE0; }
}
.pdf-balao {
  background: #FFFFFF; border: 1px solid #D7DBE0; border-left: 3px solid #1F6FEB;
  border-radius: 3px; padding: 7px 9px; font-size: 12px; color: #1F2328;
}
.pdf-balao[data-tipo="destaque"] { border-left-color: #E8B931; }
.pdf-balao-quem { font-size: 10.5px; color: #57606A; padding-bottom: 2px; }

.pdf-status {
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  padding: 5px 12px; background: #FFFFFF; border-top: 1px solid #D7DBE0;
  font-size: 11.5px; color: #57606A;
}
.pdf-selo {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 8px; border-radius: 999px; font-size: 11px;
}
.pdf-selo[data-estado="valida"] { background: #E6F4EA; color: #1E6E33; }
.pdf-selo[data-estado="quebrada"] { background: #FCE8E6; color: #B3261E; }
.pdf-selo[data-estado="imagem"] { background: #F3F5F7; color: #57606A; }
.pdf-selo[data-estado="protegido"] { background: #EDE7F6; color: #5B3E96; }

.pdf-campo-linha {
  display: flex; align-items: center; gap: 8px; margin: 0 0 9px;
  font-size: 12.5px; color: #1F2328;
}
.pdf-campo-linha label { min-width: 116px; color: #57606A; }
.pdf-campo {
  flex: 1; border: 1px solid #8C959F; border-radius: 2px; padding: 4px 7px;
  font: inherit; font-size: 12.5px; background: #F7FBFF; color: #1F2328;
}
.pdf-campo:focus { outline: 2px solid #1F6FEB; outline-offset: -1px; }
.pdf-campo[data-falta="sim"] { border-color: #B3261E; background: #FFF5F5; }
`;

/* ── Barra de título ──────────────────────────────────────────────────────── */

export function BarraDeTitulo({ doc, extra }: { doc: DocumentoPdf; extra?: React.ReactNode }) {
  return (
    <div className="pdf-titulo">
      <FileText className="w-4 h-4" style={{ color: '#B3261E' }} />
      <span className="pdf-nome">{doc.nome}</span>
      {extra}
      <span className="pdf-titulo-dados">
        {doc.paginas.length} {doc.paginas.length === 1 ? 'página' : 'páginas'}
        {' · '}{pesoEscrito(pesoKb(doc))}
      </span>
    </div>
  );
}

/* ── Faixa de ferramentas ─────────────────────────────────────────────────── */

/**
 * Um comando da faixa.
 *
 * O rótulo vem sempre, e some por CSS na tela estreita — escondê-lo aqui
 * deixaria o botão sem nome para quem navega por leitor de tela.
 */
export function Comando({ icone: Icone, rotulo, aoClicar, desligado, titulo }: {
  icone: typeof FileText;
  rotulo: string;
  aoClicar?: () => void;
  desligado?: boolean;
  titulo?: string;
}) {
  return (
    <button type="button" className="pdf-bt" onClick={aoClicar}
      disabled={desligado || !aoClicar} title={titulo ?? rotulo}>
      <Icone className="w-4 h-4" />
      <span className="pdf-rotulo">{rotulo}</span>
    </button>
  );
}

export const SeparadorDaFaixa = () => <span className="pdf-sep" />;

/**
 * Os comandos que todo leitor de PDF tem.
 *
 * Eles aparecem **sempre**, e o que muda entre as lições é se o laboratório
 * entregou a função de cada um: sem ela o botão fica desligado, como fica num
 * programa quando o comando não cabe no que está aberto. Esconder o botão
 * ensinaria que o programa muda de tamanho conforme a tarefa.
 */
export interface AcoesDoLeitor {
  aoCombinar?: () => void;
  aoExtrair?: () => void;
  aoDividir?: () => void;
  aoComprimir?: () => void;
  aoReconhecer?: () => void;
  aoComentar?: () => void;
  aoDestacar?: () => void;
  aoAssinar?: () => void;
  aoProteger?: () => void;
  aoCopiarTexto?: () => void;
  aoExportar?: () => void;
}

export function FaixaDoLeitor({ acoes, procura }: {
  acoes: AcoesDoLeitor;
  procura?: React.ReactNode;
}) {
  return (
    <div className="pdf-faixa">
      <Comando icone={Combine} rotulo="Combinar" aoClicar={acoes.aoCombinar} />
      <Comando icone={Scissors} rotulo="Extrair páginas" aoClicar={acoes.aoExtrair} />
      <Comando icone={ChevronRight} rotulo="Dividir" aoClicar={acoes.aoDividir} />
      <SeparadorDaFaixa />
      <Comando icone={Minimize2} rotulo="Reduzir tamanho" aoClicar={acoes.aoComprimir} />
      <Comando icone={ScanLine} rotulo="Reconhecer texto" aoClicar={acoes.aoReconhecer} />
      <SeparadorDaFaixa />
      <Comando icone={MessageSquare} rotulo="Comentário" aoClicar={acoes.aoComentar} />
      <Comando icone={Highlighter} rotulo="Destacar" aoClicar={acoes.aoDestacar} />
      <SeparadorDaFaixa />
      <Comando icone={PenLine} rotulo="Assinar" aoClicar={acoes.aoAssinar} />
      <Comando icone={Lock} rotulo="Proteger" aoClicar={acoes.aoProteger} />
      <SeparadorDaFaixa />
      <Comando icone={Copy} rotulo="Copiar texto" aoClicar={acoes.aoCopiarTexto} />
      <Comando icone={Download} rotulo="Salvar" aoClicar={acoes.aoExportar} />
      {procura}
    </div>
  );
}

/* ── Procurar ─────────────────────────────────────────────────────────────── */

/**
 * A caixa de procurar, e o contador de achados ao lado dela.
 *
 * O contador é a peça que faz o requisito 5 ter como se comprovar: ele diz
 * **zero** num documento em imagem que desenha a palavra na tela, e é essa
 * contradição — a palavra está à vista e o programa não a encontra — que
 * ensina o que é camada de texto.
 */
export function CaixaDeProcurar({ termo, achados, aoMudar }: {
  termo: string;
  /** `null` enquanto ninguém procurou nada: aí não se diz nem zero. */
  achados: number | null;
  aoMudar: (t: string) => void;
}) {
  return (
    <div className="pdf-procurar">
      <Search className="w-3.5 h-3.5" style={{ color: '#57606A' }} />
      <input value={termo} onChange={e => aoMudar(e.target.value)}
        placeholder="Procurar no documento" aria-label="Procurar no documento" />
      {achados !== null && (
        <span className="pdf-achados" data-vazio={achados === 0 ? 'sim' : 'nao'}>
          {achados === 0 ? 'nenhum resultado' : `${achados} página${achados > 1 ? 's' : ''}`}
        </span>
      )}
    </div>
  );
}

/* ── Aviso de documento em imagem ─────────────────────────────────────────── */

/**
 * A faixa que o leitor mostra quando não há texto por baixo.
 *
 * Ela some assim que **qualquer** texto existir — inclusive o que um
 * reconhecimento malfeito produziu. É o que o programa de verdade faz, e é o
 * que faz a lição acontecer: o aviso sai, o documento parece consertado, e a
 * palavra continua sem aparecer na procura.
 */
export function AvisoDeDigitalizacao({ doc, aoReconhecer }: {
  doc: DocumentoPdf;
  aoReconhecer?: () => void;
}) {
  const semTexto = paginasSemTexto(doc);
  if (!semTexto.length) return null;
  return (
    <div className="pdf-aviso-scan">
      <ImageIcon className="w-4 h-4" />
      <span>
        {semTexto.length === doc.paginas.length
          ? 'Este documento é uma imagem digitalizada. Não há texto dentro dele.'
          : `${semTexto.length} de ${doc.paginas.length} páginas são imagem, sem texto dentro.`}
      </span>
      {aoReconhecer && (
        <button type="button" onClick={aoReconhecer}>Reconhecer texto</button>
      )}
    </div>
  );
}

/* ── Miniaturas ───────────────────────────────────────────────────────────── */

export function PainelDeMiniaturas({ doc, escolhidas, aoEscolher }: {
  doc: DocumentoPdf;
  escolhidas: string[];
  aoEscolher: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div className="pdf-miniaturas" role="listbox" aria-label="Páginas">
      {doc.paginas.map((p, i) => (
        <button
          key={p.id}
          type="button"
          role="option"
          aria-selected={escolhidas.includes(p.id)}
          className="pdf-mini"
          onClick={e => aoEscolher(p.id, e)}
        >
          <div className="pdf-mini-folha">
            {p.linhas.slice(0, 9).map((l, k) => <div key={k}>{l}</div>)}
          </div>
          <div className="pdf-mini-n">{i + 1}</div>
          {!p.texto && <div className="pdf-mini-marca">imagem</div>}
        </button>
      ))}
    </div>
  );
}

/* ── A página ─────────────────────────────────────────────────────────────── */

/**
 * O que a página desenha — que é o mesmo com texto dentro ou sem.
 *
 * É a peça que sustenta a vereda inteira: as duas espécies de documento
 * chegam aqui iguais, e nada nesta função consegue distingui-las, porque não
 * há o que distinguir **na tinta**. A diferença mora na camada de texto, e
 * quem a enxerga é a procura.
 *
 * O que muda é a foto de papel: a inclinação, a margem sobrando e o contraste
 * aparecem, senão corrigir o enquadramento seria um clique que não muda nada
 * na tela e o requisito 5 mediria obediência.
 */
export function Folha({ pagina, rodape }: { pagina: Pagina; rodape?: React.ReactNode }) {
  const c = pagina.captura;
  const estilo: React.CSSProperties = c
    ? {
      transform: `rotate(${c.inclinacao}deg)`,
      padding: `${34 + c.margem}px ${38 + c.margem}px`,
      filter: `contrast(${Math.max(0.35, c.contraste / 100)}) blur(${(100 - c.nitidez) / 55}px)`,
    }
    : {};

  return (
    <div className="pdf-folha" data-papel={c ? 'sim' : 'nao'} style={estilo}>
      {pagina.linhas.map((l, i) => <p key={i}>{l}</p>)}
      {rodape}
    </div>
  );
}

/* ── Campos de formulário ─────────────────────────────────────────────────── */

export function CamposDaFolha({ doc, aoPreencher }: {
  doc: DocumentoPdf;
  aoPreencher?: (id: string, valor: string) => void;
}) {
  if (!doc.campos.length) return null;
  return (
    <>
      {doc.campos.map(c => (
        <div className="pdf-campo-linha" key={c.id}>
          <label htmlFor={`campo-${c.id}`}>{c.rotulo}</label>
          <input
            id={`campo-${c.id}`}
            className="pdf-campo"
            data-falta={c.obrigatorio && !c.valor.trim() ? 'sim' : 'nao'}
            value={c.valor}
            readOnly={!aoPreencher}
            onChange={e => aoPreencher?.(c.id, e.target.value)}
          />
        </div>
      ))}
    </>
  );
}

/* ── Margem de comentários ────────────────────────────────────────────────── */

/**
 * Os balões, fora do papel.
 *
 * Fora, e não dentro, pelo mesmo motivo da margem de revisão do Word: dentro,
 * o comentário sairia na impressão e empurraria o texto, que é justamente o
 * que ele não faz.
 *
 * A margem só existe quando o laboratório entrega `aoComentar` ou já tem
 * anotações — é a regra do `aoBuscar` do Explorador. Uma coluna vazia em toda
 * lição prometeria um gesto que aquela lição não faz.
 */
export function MargemDeComentarios({ anotacoes, aoComentar }: {
  anotacoes: Anotacao[];
  aoComentar?: () => void;
}) {
  if (!anotacoes.length && !aoComentar) return null;
  return (
    <div className="pdf-margem" aria-label="Comentários">
      {anotacoes.length === 0 && (
        <p style={{ fontSize: 12, color: '#57606A', margin: 0 }}>
          Nenhum comentário ainda.
        </p>
      )}
      {anotacoes.map(a => (
        <div className="pdf-balao" data-tipo={a.tipo} key={a.id}>
          <div className="pdf-balao-quem">{a.por}</div>
          {a.texto}
        </div>
      ))}
    </div>
  );
}

/* ── Régua de status ──────────────────────────────────────────────────────── */

const SELO_DA_ASSINATURA: Record<string, { texto: string; icone: typeof ShieldCheck }> = {
  valida: { texto: 'Assinatura válida', icone: ShieldCheck },
  quebrada: { texto: 'Assinatura não confere', icone: ShieldAlert },
  imagem: { texto: 'Imagem de assinatura', icone: ImageIcon },
};

/**
 * A régua conta o que está no documento, e não julga o documento.
 *
 * Ela diz quantas páginas, quanto pesa e o que a assinatura respondeu — e não
 * escreve "este PDF não serve". É a mesma regra da régua de status do Word da
 * CC-ES002: escrever o veredito poria na nossa tela a resposta que a lição
 * existe para o desbravador achar sozinho.
 *
 * O selo da assinatura é a exceção que confirma: ele **é** o que o programa
 * responde quando confere a assinatura, e escondê-lo tiraria do desbravador o
 * único lugar onde a diferença do requisito 6 aparece.
 */
export function ReguaDoLeitor({ doc, paginaAtual, extra }: {
  doc: DocumentoPdf;
  paginaAtual: number;
  extra?: React.ReactNode;
}) {
  const estado = estadoDaAssinatura(doc);
  const selo = SELO_DA_ASSINATURA[estado];
  const Icone = selo?.icone;

  return (
    <div className="pdf-status">
      <span>Página {paginaAtual} de {doc.paginas.length}</span>
      <span>{pesoEscrito(pesoKb(doc))}</span>
      {selo && Icone && (
        <span className="pdf-selo" data-estado={estado}>
          <Icone className="w-3.5 h-3.5" />{selo.texto}
        </span>
      )}
      {doc.protecao && (
        <span className="pdf-selo" data-estado="protegido">
          <Lock className="w-3.5 h-3.5" />Protegido por senha
        </span>
      )}
      {extra}
    </div>
  );
}

/* ── Navegar entre páginas ────────────────────────────────────────────────── */

export function SetasDePagina({ indice, total, aoIr }: {
  indice: number; total: number; aoIr: (i: number) => void;
}) {
  return (
    <>
      <Comando icone={ChevronLeft} rotulo="Anterior"
        aoClicar={indice > 0 ? () => aoIr(indice - 1) : undefined} />
      <Comando icone={ChevronRight} rotulo="Próxima"
        aoClicar={indice < total - 1 ? () => aoIr(indice + 1) : undefined} />
    </>
  );
}
