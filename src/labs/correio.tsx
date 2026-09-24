import type React from 'react';
import {
  Mail, Pencil, Inbox, Reply, Forward, Archive, Paperclip, Link2,
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

.co-busca-campo {
  flex: 1; min-width: 0; border: none; background: transparent;
  font: inherit; color: #202124; outline: none;
}
.co-fichas { display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 0; flex: 1; min-width: 0; }
.co-ficha {
  display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px 2px 8px;
  border-radius: 999px; background: #E8F0FE; color: #174EA6; font-size: 12px;
  max-width: 100%;
}
.co-ficha span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.co-ficha button { border: none; background: none; cursor: pointer; color: #174EA6; line-height: 0; }
.co-mais {
  padding: 2px 8px; border-radius: 999px; background: #F1F3F4; color: #5F6368; font-size: 12px;
}
.co-abas { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
.co-aba {
  padding: 7px 12px; border: 1px solid #DADCE0; border-radius: 6px;
  background: #FFFFFF; color: #202124; font-size: 13px; cursor: pointer;
}
.co-aba[aria-pressed="true"] { background: #E8F0FE; border-color: #0B57D0; color: #174EA6; }
.co-aviso {
  margin: 0 14px 10px; padding: 10px 12px; border-radius: 6px; font-size: 12.5px;
  background: #FEF7E0; border: 1px solid #F1D68C; color: #202124;
}
.co-aviso[data-tom="ruim"] { background: #FCE8E6; border-color: #F0B4AE; }
.co-aviso[data-tom="bom"] { background: #E6F4EA; border-color: #A8D5B5; }
.co-vinculo {
  display: flex; align-items: center; gap: 8px; margin: 10px 14px; padding: 8px 10px;
  border: 1px solid #DADCE0; border-radius: 8px; font-size: 12.5px; color: #202124;
}
/*
  A regra do desligado vem **depois** da do primário, e não antes: mesma
  especificidade, e escrita primeiro ela perde — o botão desligado sairia azul
  e branco, com cara de clicável. É a ordem que a CC-ES001, a CC-ES004 e a
  CC-ES005 precisaram, e errá-la não estoura nada.
*/
.co-bt:disabled, .co-bt.primario:disabled {
  background: #F1F3F4; border-color: #E0E0E0; color: #9AA0A6; cursor: not-allowed;
}

.co-link {
  color: #1A73E8; text-decoration: underline; cursor: pointer;
  margin-right: 14px; word-break: break-word;
}
.co-link:focus-visible { outline: 2px solid #1A73E8; outline-offset: 2px; }

/* A barra que diz para onde o link vai, no canto de baixo — onde o navegador
   a põe. Escrever o destino ao lado do link poria na nossa tela a resposta que
   o programa imitado já dá na dele, e apagaria o gesto que o requisito 5
   manda: parar o ponteiro em cima e ler. */
.co-destino {
  position: absolute; left: 0; bottom: 0; max-width: 80%;
  background: #FFFFFF; border: 1px solid #DADCE0; border-bottom: none;
  border-left: none; border-radius: 0 6px 0 0; padding: 3px 10px;
  font-size: 11.5px; color: #3C4043;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

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
 * A caixa de pesquisa é enfeite quando o laboratório não entrega `aoBuscar`, e
 * é honesto que seja: ela existe em todo correio, e a AP044 e a CC-ES005 não a
 * usam. Com `aoBuscar` ela vira campo de verdade — é a regra do Explorador,
 * escrita aqui desde o primeiro dia e agora com um caso: o requisito 4.3 da
 * CC-ES007 é justamente achar na busca o que foi arquivado, que é a diferença
 * entre arquivar e excluir.
 */
export function TopoDoCorreio({ aoAbrirConfiguracoes, busca, aoBuscar, extra }: {
  aoAbrirConfiguracoes?: () => void;
  busca?: string;
  aoBuscar?: (termo: string) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="co-topo">
      <Mail className="w-5 h-5" style={{ color: '#C5221F' }} />
      <span style={{ fontWeight: 600 }}>Correio</span>
      <div className="co-busca">
        <Search className="w-4 h-4" style={{ color: '#5F6368' }} />
        {aoBuscar
          ? (
            <input
              className="co-busca-campo" value={busca ?? ''} aria-label="Pesquisar no correio"
              placeholder="Pesquisar no correio"
              onChange={e => aoBuscar(e.target.value)}
            />
          )
          : <span style={{ color: '#5F6368' }}>Pesquisar no correio</span>}
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
/**
 * Um link dentro da mensagem.
 *
 * O `texto` é o que se lê; o `para` é para onde ele vai de verdade. Eles podem
 * discordar, e **é essa discordância que o requisito 5 manda apontar**: um
 * link escrito "banco.com.br" levando a outro lugar é o indício mais comum que
 * existe, e o único que não se vê sem parar o ponteiro em cima dele.
 *
 * Por isso o destino aparece na barra de baixo da janela ao passar o ponteiro,
 * como no navegador — e não escrito ao lado do link, que poria na nossa tela a
 * resposta que o programa imitado dá na dele.
 */
export interface LinkDaMensagem {
  texto: string;
  para: string;
}

export function LeituraDaMensagem({
  assunto, deNome, de, corpo, anexos, links, aoApontarLink, rodape, children,
}: {
  assunto: string;
  deNome: string;
  de: string;
  corpo: string;
  anexos?: string[];
  links?: LinkDaMensagem[];
  /** Presente, apontar um link avisa o laboratório para onde ele vai. */
  aoApontarLink?: (para: string | undefined) => void;
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
      {links && links.length > 0 && (
        <p style={{ marginTop: 12, lineHeight: 1.9 }}>
          {links.map(l => (
            <a
              key={l.texto} href={l.para} className="co-link"
              onClick={e => e.preventDefault()}
              onMouseEnter={() => aoApontarLink?.(l.para)}
              onMouseLeave={() => aoApontarLink?.(undefined)}
              onFocus={() => aoApontarLink?.(l.para)}
              onBlur={() => aoApontarLink?.(undefined)}
            >
              {l.texto}
            </a>
          ))}
        </p>
      )}
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

/**
 * Para onde o link aponta, no canto de baixo da janela.
 *
 * É onde o navegador a mostra, e é o único lugar em que o destino de verdade
 * de um link aparece antes de alguém clicar nele. Um link disfarçado — texto
 * "bancodobrasil.com.br" levando a outro endereço — é o indício mais comum
 * que existe, e é o único que não se vê sem parar o ponteiro em cima.
 */
export const DestinoDoLink = ({ para }: { para?: string }) =>
  (para ? <span className="co-destino">{para}</span> : null);

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

/* ── Muitos destinatários ─────────────────────────────────────────────────── */

/**
 * Um campo de endereços que aguenta cinquenta e dois.
 *
 * `CampoDeEndereco` é um texto, e serve enquanto o campo tem dois ou três
 * endereços — que é o caso da AP044. Cinquenta e duas famílias num campo de
 * texto não se leem nem se conferem, e é justamente a conferência que o
 * requisito 3 pede.
 *
 * Ele mostra as primeiras e diz quantas faltam, que é o que todo correio faz —
 * e é a razão de o vazamento passar despercebido: ninguém vê os cinquenta e um
 * endereços, vê "e mais 49".
 */
export function CampoDeDestinatarios({
  rotulo, enderecos, aoTirar, aoAcrescentar, mostrarAte = 3, extra,
}: {
  rotulo: string;
  enderecos: string[];
  aoTirar?: (endereco: string) => void;
  /** O que se digita e se confirma com Enter. Sem ele, o campo é só de leitura. */
  aoAcrescentar?: (endereco: string) => void;
  mostrarAte?: number;
  extra?: React.ReactNode;
}) {
  const visiveis = enderecos.slice(0, mostrarAte);
  const restam = enderecos.length - visiveis.length;
  return (
    <div className="co-linha-campo">
      <span className="co-rotulo">{rotulo}</span>
      <div className="co-fichas">
        {visiveis.map(e => (
          <span key={e} className="co-ficha">
            <span>{e}</span>
            {aoTirar && (
              <button type="button" aria-label={`Tirar ${e}`} onClick={() => aoTirar(e)}>
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        {restam > 0 && <span className="co-mais">e mais {restam}</span>}
        {aoAcrescentar && (
          <input
            className="co-campo" style={{ flex: 1, minWidth: 120, borderBottom: 'none' }}
            aria-label={rotulo} placeholder="Escreva um endereço e tecle Enter"
            onKeyDown={e => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              const v = (e.target as HTMLInputElement).value.trim();
              if (!v) return;
              aoAcrescentar(v);
              (e.target as HTMLInputElement).value = '';
            }}
          />
        )}
      </div>
      {extra}
    </div>
  );
}

/* ── O pé da janelinha ────────────────────────────────────────────────────── */

/**
 * A barra de baixo de quem está escrevendo.
 *
 * Anexar e inserir vínculo ficam lado a lado, que é onde os dois ficam num
 * correio de verdade — e é o que faz o requisito 4.2 ser uma escolha e não uma
 * instrução: os dois botões estão ali, e nada na tela diz qual usar.
 */
export function PeDeEscrever({ aoEnviar, podeEnviar = true, aoAnexar, aoInserirVinculo, extra }: {
  aoEnviar?: () => void;
  podeEnviar?: boolean;
  aoAnexar?: () => void;
  aoInserirVinculo?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="co-pe">
      <button type="button" className="co-bt primario" onClick={aoEnviar}
        disabled={!aoEnviar || !podeEnviar}>
        Enviar
      </button>
      {aoAnexar && (
        <button type="button" className="co-bt" aria-label="Anexar arquivo" onClick={aoAnexar}>
          <Paperclip className="w-4 h-4" /> Anexar
        </button>
      )}
      {aoInserirVinculo && (
        <button type="button" className="co-bt" aria-label="Inserir vínculo de arquivo"
          onClick={aoInserirVinculo}>
          <Link2 className="w-4 h-4" /> Inserir vínculo
        </button>
      )}
      {extra}
    </div>
  );
}

/**
 * Um vínculo dentro da mensagem.
 *
 * Ele mostra o nome do arquivo e **quem consegue abrir**, que é o campo que o
 * correio de verdade mostra e a metade do requisito 4.2 que ninguém conta:
 * mandar um vínculo que a pessoa não abre troca um problema barulhento por um
 * quieto. O anexo grande pelo menos volta com erro.
 */
export function VinculoDaMensagem({ nome, quemAbre, aoTrocarAcesso, aoTirar }: {
  nome: string;
  quemAbre: string;
  aoTrocarAcesso?: () => void;
  aoTirar?: () => void;
}) {
  return (
    <div className="co-vinculo">
      <Link2 className="w-4 h-4" style={{ color: '#5F6368' }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <strong>{nome}</strong>
        <span style={{ color: '#5F6368' }}> — {quemAbre}</span>
      </span>
      {aoTrocarAcesso && (
        <button type="button" className="co-bt" onClick={aoTrocarAcesso}>Mudar quem abre</button>
      )}
      {aoTirar && (
        <button type="button" className="co-bt" aria-label={`Tirar o vínculo ${nome}`}
          onClick={aoTirar}>
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/**
 * O aviso do provedor.
 *
 * Ele diz o que o **correio** sabe — "o anexo passa de 25 MB" — e nunca se a
 * tarefa está cumprida. É a regra da régua de status do Word, do painel de
 * Problemas do Python e do aviso do digitalizador.
 */
export function AvisoDoCorreio({ tom, children }: {
  tom?: 'bom' | 'ruim';
  children: React.ReactNode;
}) {
  return <p className="co-aviso" data-tom={tom}>{children}</p>;
}

/* ── As abas das configurações ────────────────────────────────────────────── */

/**
 * As abas de dentro das Configurações.
 *
 * Elas existem **todas**, sempre, mesmo nas lições que só usam uma: é assim
 * que um programa é, e um correio que só mostrasse "Resposta automática" na
 * lição da resposta automática ensinaria a procurar o botão que a tarefa quer,
 * e não a procurar no programa.
 */
export function AbasDasConfiguracoes({ abas, atual, aoTrocar }: {
  abas: { id: string; nome: string }[];
  atual: string;
  aoTrocar: (id: string) => void;
}) {
  return (
    <div className="co-abas">
      {abas.map(a => (
        <button key={a.id} type="button" className="co-aba" aria-pressed={a.id === atual}
          onClick={() => aoTrocar(a.id)}>
          {a.nome}
        </button>
      ))}
    </div>
  );
}

export function BotaoDoCorreio({ primario, children, ...resto }: {
  primario?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={primario ? 'co-bt primario' : 'co-bt'} {...resto}>
      {children}
    </button>
  );
}
