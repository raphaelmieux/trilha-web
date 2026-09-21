import type React from 'react';
import {
  Mail, Pencil, Inbox, Reply, Forward, Archive, Paperclip,
  Settings, Search, Star, ChevronLeft, X,
} from 'lucide-react';

/*
 * A janela do correio de navegador, em peças.
 *
 * ── Por que ela nasce separada ───────────────────────────────────────────
 * A CC-ES005 precisa de uma segunda caixa de correio: o requisito 5 manda
 * analisar três mensagens fraudulentas e apontar, em cada uma, os indícios que
 * a denunciam. Escrevê-la copiando `CorreioLab.tsx` é como a plataforma ficou
 * com dois "Word" uma vez, e o remédio já está escrito em `word.tsx`, em
 * `excel.tsx`, em `explorer.tsx` e em `leitorDePdf.tsx`: extrair **antes** de
 * a cópia existir.
 *
 * ── O que não entra aqui ─────────────────────────────────────────────────
 * O laboratório de correio da AP034 não é uma janela: ele é cartão da
 * plataforma, e não imita programa nenhum. Vesti-lo com esta moldura mudaria
 * uma trilha que já está entregue, e não é disto que esta vereda trata.
 *
 * ── O que fica aqui e o que fica em cada laboratório ─────────────────────
 * Aqui fica o que é do **programa**: como uma linha da lista se desenha, o que
 * a lateral tem, onde a janelinha de escrever se abre. Lá fica o que é do
 * **exercício**: que mensagens existem, que tarefas se cobram, o que cada
 * botão faz com elas.
 *
 * Nenhuma peça guarda estado. Quem guarda pasta aberta, mensagem aberta e
 * rascunho é o laboratório, que é quem responde à verificação — uma janela com
 * estado próprio obrigaria os dois lados a concordar sobre a mesma mensagem,
 * que é a forma mais rápida de mostrarem coisas diferentes.
 *
 * ── E a peça aparece pela presença do setter ─────────────────────────────
 * É a regra do `aoBuscar` do Explorador e do `aoPreencher` da grade do Excel:
 * o botão Escrever só existe quando o laboratório entrega `aoEscrever`, e a
 * engrenagem de Configurações só quando ele entrega `aoAbrirConfiguracoes`.
 * Prometer um gesto que a lição não faz é o que ensina a desconfiar do
 * programa.
 */

/* As cores são as do correio, e não as da plataforma: dentro de uma janela
   clara, um botão com a cor da plataforma seria a única peça fora do lugar.
   E a superfície clara diz a própria cor, senão os títulos da plataforma —
   que são quase brancos — somem em cima do papel. */
export const CSS_DO_CORREIO = `
.co-janela {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  background: #FFFFFF; color: #202124;
  font-family: system-ui, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13.5px;
}
.co-topo {
  display: flex; align-items: center; gap: 12px; padding: 8px 14px;
  border-bottom: 1px solid #E0E0E0; background: #F6F8FC;
}
.co-busca {
  flex: 1; max-width: 620px; background: #EAF1FB; border: none; border-radius: 8px;
  padding: 8px 12px; font-size: 13.5px; color: #202124; display: flex; gap: 8px; align-items: center;
}
.co-corpo { flex: 1; min-height: 0; display: flex; }
.co-lado { width: 190px; flex: none; padding: 10px 6px; }
.co-escrever {
  display: inline-flex; align-items: center; gap: 10px; padding: 12px 20px;
  border-radius: 999px; background: #C2E7FF; color: #001D35; border: none;
  font-size: 14px; cursor: pointer; margin: 0 8px 14px;
}
.co-escrever:hover { background: #A8DBFF; }
.co-pasta {
  display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
  padding: 7px 14px; border: none; background: none; cursor: pointer;
  border-radius: 0 999px 999px 0; color: #202124; font-size: 13.5px;
}
.co-pasta:hover { background: #EAECEF; }
.co-pasta[aria-current="true"] { background: #D3E3FD; font-weight: 700; }
.co-lista { flex: 1; min-width: 0; overflow: auto; border-left: 1px solid #E0E0E0; }
.co-linha {
  display: flex; gap: 12px; align-items: center; width: 100%; text-align: left;
  padding: 10px 14px; border-bottom: 1px solid #F1F1F1; background: none;
  border-left: none; border-right: none; border-top: none; cursor: pointer; color: #202124;
}
.co-linha:hover { box-shadow: inset 0 0 0 1px #E0E0E0; }
.co-de { width: 168px; flex: none; font-weight: 700; }
.co-msg { flex: 1; min-width: 0; overflow: auto; border-left: 1px solid #E0E0E0; padding: 14px 18px; }
.co-acoes { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.co-bt {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
  border: 1px solid #DADCE0; border-radius: 999px; background: #FFFFFF;
  font-size: 12.5px; color: #202124; cursor: pointer;
}
.co-bt:hover { background: #F1F3F4; }
.co-bt.primario { background: #0B57D0; border-color: #0B57D0; color: #FFFFFF; }
.co-bt.primario:hover { background: #0A4BB5; }
.co-janelinha {
  position: absolute; right: 16px; bottom: 0; width: min(520px, calc(100% - 32px));
  background: #FFFFFF; border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 16px rgba(0,0,0,.28); display: flex; flex-direction: column;
  max-height: 88%; z-index: 5;
}
.co-janelinha-topo {
  background: #F2F6FC; padding: 8px 14px; border-radius: 8px 8px 0 0;
  display: flex; align-items: center; font-size: 13px; font-weight: 600;
}
.co-campo {
  border: none; border-bottom: 1px solid #E0E0E0; padding: 8px 14px;
  font-size: 13px; width: 100%; color: #202124; background: transparent;
}
.co-campo:focus { outline: none; border-bottom-color: #0B57D0; }
.co-linha-campo { display: flex; align-items: center; border-bottom: 1px solid #E0E0E0; }
.co-linha-campo .co-campo { border-bottom: none; }
.co-rotulo { padding: 0 6px 0 14px; color: #5F6368; font-size: 12.5px; flex: none; }
.co-copias { padding: 0 14px; color: #5F6368; font-size: 12.5px; background: none; border: none; cursor: pointer; }
.co-texto {
  flex: 1; min-height: 130px; border: none; padding: 12px 14px; resize: none;
  font: inherit; color: #202124; background: transparent;
}
.co-texto:focus { outline: none; }
.co-assinatura { padding: 0 14px 8px; color: #5F6368; font-size: 12.5px; white-space: pre-wrap; }
.co-historico {
  margin: 0 14px 10px; padding-left: 10px; border-left: 2px solid #DADCE0;
  color: #5F6368; font-size: 12px; white-space: pre-wrap; max-height: 96px; overflow: auto;
}
.co-pe {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  border-top: 1px solid #E0E0E0; flex-wrap: wrap;
}
.co-anexo {
  display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px;
  border: 1px solid #DADCE0; border-radius: 6px; font-size: 12px; color: #202124;
}
.co-previa {
  margin: 0 14px 10px; padding: 10px; border-radius: 6px;
  background: #FEF7E0; border: 1px solid #F1D68C; font-size: 12.5px; color: #202124;
}
.co-previa.perigo { background: #FCE8E6; border-color: #F0B4AE; }
.co-config { flex: 1; min-height: 0; overflow: auto; padding: 18px 22px; }
.co-config h2 { color: #202124; }

/*
  No celular a lateral vira uma fileira no alto: uma coluna de 190px ao lado da
  lista deixa a mensagem sem largura nenhuma, e ler a mensagem é o que o
  requisito 5 pede. É a regra de sempre — reduzir a tela nunca reduz o que dá
  para fazer nela: as pastas continuam todas ali, e só mudam de lugar.
*/
@media (max-width: 720px) {
  .co-corpo { flex-direction: column; }
  .co-lado {
    width: auto; display: flex; align-items: center; gap: 4px;
    overflow-x: auto; padding: 6px; border-bottom: 1px solid #E0E0E0;
  }
  .co-escrever { margin: 0 6px 0 0; padding: 8px 14px; flex: none; }
  .co-pasta { width: auto; flex: none; border-radius: 999px; padding: 6px 12px; }
  .co-lista, .co-msg { border-left: none; }
  .co-de { width: 108px; }
}
`;

/* ── A barra de cima ──────────────────────────────────────────────────────── */

/**
 * O topo do correio: marca, caixa de pesquisa e a engrenagem.
 *
 * A caixa de pesquisa é enfeite aqui, e é honesto que seja: ela existe em todo
 * correio e nenhuma das lições a usa. Fosse requisito de alguma, ela viraria
 * campo de verdade pela presença de um `aoBuscar`, como no Explorador.
 */
export function TopoDoCorreio({ aoAbrirConfiguracoes, extra }: {
  aoAbrirConfiguracoes?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="co-topo">
      <Mail className="w-5 h-5" style={{ color: '#C5221F' }} />
      <span style={{ fontWeight: 600 }}>Correio</span>
      <div className="co-busca">
        <Search className="w-4 h-4" style={{ color: '#5F6368' }} />
        <span style={{ color: '#5F6368' }}>Pesquisar no correio</span>
      </div>
      {extra}
      {aoAbrirConfiguracoes && (
        <button type="button" className="co-bt" aria-label="Configurações"
          onClick={aoAbrirConfiguracoes}>
          <Settings className="w-4 h-4" /> Configurações
        </button>
      )}
    </div>
  );
}

/* ── A lateral ────────────────────────────────────────────────────────────── */

export interface PastaDoCorreio {
  id: string;
  nome: string;
  icone: typeof Inbox;
  /** Quantas mensagens ela tem; ausente não desenha número nenhum. */
  quantas?: number;
}

/**
 * A coluna da esquerda.
 *
 * A Lixeira entra na lista mesmo sem exercício nenhum que a use, porque ela
 * existe em todo correio e uma lateral sem ela seria outra lateral. Clicar
 * nela avisa que não faz parte do exercício — que é o que a moldura já faz com
 * a estrela e com a barra de pesquisa: o programa tem todos os comandos, e o
 * que muda é o que cada um responde.
 */
export function LateralDoCorreio({ pastas, atual, aoTrocar, aoEscrever }: {
  pastas: PastaDoCorreio[];
  atual: string;
  aoTrocar: (id: string) => void;
  aoEscrever?: () => void;
}) {
  return (
    <div className="co-lado">
      {aoEscrever && (
        <button type="button" className="co-escrever" aria-label="Escrever" onClick={aoEscrever}>
          <Pencil className="w-4 h-4" /> Escrever
        </button>
      )}
      {pastas.map(p => {
        const Icone = p.icone;
        return (
          <button key={p.id} type="button" className="co-pasta"
            aria-current={p.id === atual}
            onClick={() => aoTrocar(p.id)}>
            <Icone className="w-4 h-4" /> {p.nome}
            {p.quantas !== undefined && (
              <span style={{ marginLeft: 'auto', fontSize: 12 }}>{p.quantas}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── A lista ──────────────────────────────────────────────────────────────── */

/** Uma linha da lista: quem mandou, o assunto, e o começo do corpo. */
export function LinhaDaLista({ de, assunto, previa, direita, aoAbrir }: {
  de: string;
  assunto: string;
  previa?: string;
  /** O que aparece na ponta direita — anexo, contagem de cópia oculta. */
  direita?: React.ReactNode;
  /** Sem ele a linha é texto, e não botão: é o caso da pasta de enviados. */
  aoAbrir?: () => void;
}) {
  const miolo = (
    <>
      <span className="co-de">{de}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <strong>{assunto || '(sem assunto)'}</strong>
        {previa && <span style={{ color: '#5F6368' }}> — {previa}</span>}
      </span>
      {direita && (
        <span style={{ fontSize: 11.5, color: '#5F6368', whiteSpace: 'nowrap' }}>{direita}</span>
      )}
    </>
  );
  return aoAbrir
    ? (
      <button type="button" className="co-linha" aria-label={`Abrir: ${assunto}`} onClick={aoAbrir}>
        {miolo}
      </button>
    )
    : <div className="co-linha" style={{ cursor: 'default' }}>{miolo}</div>;
}

export function ListaDoCorreio({ vazia, children }: {
  /** O que dizer quando não há nada — cada pasta diz uma coisa diferente. */
  vazia?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="co-lista">
      {vazia ? <p style={{ padding: 20, color: '#5F6368' }}>{vazia}</p> : children}
    </div>
  );
}

/* ── A mensagem aberta ────────────────────────────────────────────────────── */

/**
 * Os comandos que todo correio tem em cima da mensagem aberta.
 *
 * Eles aparecem **sempre**, e o que muda entre as lições é se o laboratório
 * entregou a função de cada um: sem ela o botão fica desligado, como fica num
 * programa quando o comando não cabe no que está aberto. Esconder o botão
 * ensinaria que o programa muda de tamanho conforme a tarefa.
 */
export interface AcoesDaMensagem {
  aoVoltar?: () => void;
  aoArquivar?: () => void;
  aoResponder?: () => void;
  aoEncaminhar?: () => void;
  aoMarcarEstrela?: () => void;
}

export function BarraDaMensagem({ acoes, extra }: {
  acoes: AcoesDaMensagem;
  extra?: React.ReactNode;
}) {
  const bt = (rotulo: string, Icone: typeof Reply, aoClicar?: () => void, soIcone = false) => (
    <button type="button" className="co-bt" aria-label={rotulo}
      onClick={aoClicar} disabled={!aoClicar}>
      <Icone className="w-4 h-4" />{soIcone ? '' : ` ${rotulo}`}
    </button>
  );
  return (
    <div className="co-acoes">
      {bt('Voltar', ChevronLeft, acoes.aoVoltar)}
      {bt('Arquivar', Archive, acoes.aoArquivar)}
      {bt('Responder', Reply, acoes.aoResponder)}
      {bt('Encaminhar', Forward, acoes.aoEncaminhar)}
      {bt('Marcar com estrela', Star, acoes.aoMarcarEstrela, true)}
      {extra}
    </div>
  );
}

/**
 * A mensagem aberta.
 *
 * O endereço de quem mandou vem **inteiro**, ao lado do nome, e não escondido
 * atrás dele. É por ele que se descobre que "Banco do Brasil" escreveu de um
 * domínio que não é do banco, e um correio que mostrasse só o nome apagaria o
 * primeiro indício que o requisito 5 manda apontar.
 */
export function LeituraDaMensagem({ assunto, deNome, de, corpo, anexos, rodape, children }: {
  assunto: string;
  deNome: string;
  de: string;
  corpo: string;
  anexos?: string[];
  rodape?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="co-msg">
      {children}
      <h2 style={{ fontSize: 19, marginBottom: 6, color: '#202124' }}>{assunto}</h2>
      <p style={{ color: '#5F6368', fontSize: 12.5, marginBottom: 12 }}>
        <strong style={{ color: '#202124' }}>{deNome}</strong> &lt;{de}&gt;
      </p>
      <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{corpo}</p>
      {anexos && anexos.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {anexos.map(a => (
            <span key={a} className="co-anexo"><Paperclip className="w-3 h-3" /> {a}</span>
          ))}
        </div>
      )}
      {rodape}
    </div>
  );
}

/* ── A janelinha de escrever ──────────────────────────────────────────────── */

export function JanelinhaDeEscrever({ titulo, aoDescartar, children }: {
  titulo?: string;
  aoDescartar: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="co-janelinha">
      <div className="co-janelinha-topo">
        {titulo ?? 'Nova mensagem'}
        <button type="button" aria-label="Descartar a mensagem" className="ml-auto"
          onClick={aoDescartar}>
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  );
}

/** Uma linha de endereço da janelinha: rótulo à esquerda, campo à direita. */
export function CampoDeEndereco({ rotulo, valor, aoMudar, extra }: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="co-linha-campo">
      <span className="co-rotulo">{rotulo}</span>
      <input className="co-campo" value={valor} aria-label={rotulo}
        onChange={e => aoMudar(e.target.value)} />
      {extra}
    </div>
  );
}

/* ── Configurações ────────────────────────────────────────────────────────── */

export function CaixaDeConfiguracoes({ titulo, explica, aoVoltar, children }: {
  titulo: string;
  explica?: string;
  aoVoltar: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="co-config">
      <button type="button" className="co-bt" aria-label="Voltar para o correio"
        onClick={aoVoltar} style={{ marginBottom: 14 }}>
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{titulo}</h2>
      {explica && (
        <p style={{ color: '#5F6368', fontSize: 12.5, marginBottom: 10 }}>{explica}</p>
      )}
      {children}
    </div>
  );
}
