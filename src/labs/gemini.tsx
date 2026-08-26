import { Menu, Plus, MessageSquare, Settings, HelpCircle, Send, Mic, Paperclip } from 'lucide-react';

/*
 * A moldura do Gemini.
 *
 * O laboratório de IA já pedia texto, imagem e logotipo a um modelo de
 * verdade, e mostrava tudo em cartões da plataforma. Praticava o pedido e não
 * se parecia com nada: quem for pedir alguma coisa a uma IA depois vai abrir
 * um aplicativo de conversa — barra lateral com o histórico, a pergunta numa
 * bolha à direita, a resposta à esquerda com o desenho do assistente, e os
 * polegares embaixo dela.
 *
 * ── Onde a lição encaixa na casca ────────────────────────────────────────
 * Os polegares não são enfeite aqui. A avaliação crítica que o requisito
 * AP035-8 pede é exatamente o que o aplicativo já pergunta ao pé de cada
 * resposta — então ela acontece ali, no botão que existe de verdade, em vez
 * de num formulário da plataforma logo abaixo.
 *
 * A paleta é a do tema claro do Gemini, e cada peça declara a própria cor: a
 * plataforma é escura e pinta h1..h4 de quase branco.
 */

export const CSS_GEMINI = `
  .gem {
    flex: 1; min-height: 0; display: flex; background: #FFFFFF; color: #1F1F1F;
    font-family: 'Google Sans', 'Segoe UI', system-ui, Roboto, sans-serif;
  }
  .gem-lateral {
    width: 258px; flex: none; display: flex; flex-direction: column; gap: 4px;
    background: #F0F4F9; padding: 10px 8px; overflow-y: auto;
  }
  .gem-lateral-topo {
    display: flex; align-items: center; gap: 4px; padding: 2px 4px 10px;
  }
  .gem-icone {
    width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
    background: none; border: none; cursor: pointer; color: #444746; flex: none;
  }
  .gem-icone:hover { background: #E1E6EC; }
  .gem-nova {
    display: flex; align-items: center; gap: 10px; align-self: flex-start;
    padding: 10px 16px; border-radius: 20px; background: #DDE3EA; border: none;
    color: #1F1F1F; font-size: 14px; cursor: pointer; margin-bottom: 12px;
  }
  .gem-nova:hover { background: #D3DAE3; }
  .gem-secao {
    font-size: 12.5px; color: #1F1F1F; padding: 6px 14px 4px; font-weight: 500;
  }
  .gem-conversa {
    display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
    padding: 9px 14px; border-radius: 18px; font-size: 13.5px; color: #1F1F1F;
    background: none; border: none; cursor: pointer;
  }
  .gem-conversa:hover { background: #E1E6EC; }
  .gem-conversa[aria-current="true"] { background: #D3E3FD; }
  .gem-lateral-pe { margin-top: auto; padding-top: 10px; }

  .gem-palco { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .gem-topo {
    flex: none; display: flex; align-items: center; gap: 10px; padding: 10px 16px;
  }
  .gem-marca { font-size: 21px; color: #444746; letter-spacing: -.01em; }
  .gem-modelo {
    display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px;
    border-radius: 14px; background: #F0F4F9; font-size: 13px; color: #444746;
    border: none; cursor: pointer;
  }
  .gem-conta {
    margin-left: auto; width: 32px; height: 32px; border-radius: 50%; flex: none;
    background: #7B4EA8; color: #FFFFFF; display: grid; place-items: center;
    font-size: 13px; font-weight: 600;
  }

  .gem-fluxo { flex: 1; min-height: 0; overflow-y: auto; padding: 8px 16px 4px; }
  .gem-centro { max-width: 760px; margin: 0 auto; }

  /* A saudação em degradê da tela vazia — a primeira coisa que o Gemini mostra. */
  .gem-saudacao {
    font-size: clamp(28px, 4.4vw, 44px); font-weight: 500; letter-spacing: -.02em;
    background: linear-gradient(74deg, #4285F4 0%, #9B72CB 46%, #D96570 100%);
    -webkit-background-clip: text; background-clip: text; color: transparent;
    padding: 40px 0 6px;
  }
  .gem-subsaudacao { font-size: 17px; color: #6B7075; margin-bottom: 6px; }

  .gem-pergunta {
    display: flex; justify-content: flex-end; margin: 24px 0 8px;
  }
  .gem-pergunta > div {
    background: #F0F4F9; border-radius: 22px; padding: 12px 18px; font-size: 15px;
    line-height: 1.55; max-width: 78%; color: #1F1F1F;
  }
  .gem-resposta { display: flex; gap: 14px; margin-bottom: 8px; }
  .gem-selo { width: 28px; height: 28px; flex: none; margin-top: 2px; }
  .gem-corpo { flex: 1; min-width: 0; font-size: 15px; line-height: 1.72; color: #1F1F1F; }
  .gem-corpo p { margin: 0 0 14px; }
  .gem-corpo img {
    display: block; max-width: 100%; border-radius: 14px; margin: 4px 0 8px;
    border: 1px solid #E3E3E3;
  }
  .gem-acoes { display: flex; gap: 2px; margin-top: 2px; }
  .gem-acoes button {
    width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center;
    background: none; border: none; color: #444746; cursor: pointer;
  }
  .gem-acoes button:hover { background: #F0F4F9; }
  .gem-acoes button[aria-pressed="true"] { background: #D3E3FD; color: #0B57D0; }

  /* O painel que o próprio Gemini abre quando se toca no polegar. */
  .gem-retorno {
    margin: 10px 0 4px; padding: 16px 18px; border-radius: 16px;
    background: #F0F4F9; border: 1px solid #DDE3EA;
  }
  .gem-retorno h4 { font-size: 14px; font-weight: 500; color: #1F1F1F; margin: 0 0 10px; }
  .gem-campo {
    width: 100%; min-height: 68px; padding: 10px 12px; border-radius: 10px;
    border: 1px solid #C4C7C5; background: #FFFFFF; color: #1F1F1F;
    font-size: 14px; font-family: inherit; line-height: 1.5; resize: vertical;
  }
  .gem-campo:focus { outline: 2px solid #0B57D0; outline-offset: -1px; }
  .gem-rotulo { display: block; font-size: 12.5px; color: #444746; margin: 0 0 5px; }

  /* ── A barra de perguntar, embaixo ── */
  .gem-pe { flex: none; padding: 6px 16px 12px; }
  .gem-caixa {
    max-width: 760px; margin: 0 auto; background: #F0F4F9; border-radius: 26px;
    padding: 12px 8px 8px 18px;
  }
  .gem-prompt {
    font-size: 15px; line-height: 1.5; color: #1F1F1F; padding: 2px 0 10px;
    min-height: 24px;
  }
  .gem-prompt.vazio { color: #8E9296; }
  .gem-ferramentas { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .gem-chip {
    display: inline-flex; align-items: center; gap: 5px; height: 32px; padding: 0 12px;
    border-radius: 16px; background: #FFFFFF; border: 1px solid #DDE3EA;
    font-size: 13px; color: #444746; cursor: pointer;
  }
  .gem-chip:hover { background: #F7F9FC; }
  .gem-chip select {
    background: none; border: none; font: inherit; color: inherit; cursor: pointer;
    max-width: 190px;
  }
  .gem-chip select:focus { outline: none; }
  .gem-detalhe {
    height: 32px; padding: 0 12px; border-radius: 16px; background: #FFFFFF;
    border: 1px solid #DDE3EA; font-size: 13px; color: #1F1F1F; min-width: 0; flex: 1;
  }
  .gem-detalhe:focus { outline: 2px solid #0B57D0; outline-offset: -1px; }
  .gem-enviar {
    margin-left: auto; width: 36px; height: 36px; border-radius: 50%; flex: none;
    display: grid; place-items: center; background: #0B57D0; color: #FFFFFF;
    border: none; cursor: pointer;
  }
  .gem-enviar:hover { background: #0842A0; }
  .gem-enviar:disabled { background: #DDE3EA; color: #A8ADB2; cursor: default; }
  .gem-aviso {
    max-width: 760px; margin: 8px auto 0; text-align: center;
    font-size: 12px; color: #6B7075;
  }

  /* Enquanto a resposta não chega, o Gemini pisca três blocos. */
  .gem-carregando span {
    display: block; height: 13px; border-radius: 7px; margin-bottom: 9px;
    background: linear-gradient(90deg, #EFEFEF 25%, #E1E6EC 50%, #EFEFEF 75%);
    background-size: 400% 100%; animation: gem-onda 1.4s ease infinite;
  }
  @keyframes gem-onda { 0% { background-position: 100% 0 } 100% { background-position: 0 0 } }
  @media (prefers-reduced-motion: reduce) {
    .gem-carregando span { animation: none; background: #E9EDF2; }
  }

  @media (max-width: 1023px) { .gem-lateral { width: 76px; } .gem-lateral .gem-so-largo { display: none; } }
  @media (max-width: 767px) { .gem-lateral { display: none; } .gem-pergunta > div { max-width: 90%; } }
`;

/** O selo de quatro pontas do Gemini, no degradê da marca. */
export function SeloDoGemini({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 28 28" aria-hidden="true">
      <defs>
        <linearGradient id="gem-degrade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="46%" stopColor="#9B72CB" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path
        d="M14 2c.5 5.2 4.8 9.5 10 10-5.2.5-9.5 4.8-10 10-.5-5.2-4.8-9.5-10-10 5.2-.5 9.5-4.8 10-10z"
        fill="url(#gem-degrade)"
      />
    </svg>
  );
}

/** A barra lateral, com o histórico da conversa. */
export function LateralDoGemini({ conversas, atual, aoAvisar }: {
  conversas: string[]; atual: number; aoAvisar: (o: string) => void;
}) {
  return (
    <div className="gem-lateral">
      <div className="gem-lateral-topo">
        <button className="gem-icone" aria-label="Menu principal" onClick={() => aoAvisar('O menu')}>
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <button className="gem-nova" onClick={() => aoAvisar('Começar uma conversa nova')}>
        <Plus className="w-5 h-5" />
        <span className="gem-so-largo">Nova conversa</span>
      </button>

      <p className="gem-secao gem-so-largo">Recentes</p>
      {conversas.map((c, i) => (
        <button key={c} className="gem-conversa" aria-current={i === atual}
          onClick={() => i !== atual && aoAvisar('Voltar a uma conversa anterior')}>
          <MessageSquare className="w-4 h-4 flex-none" />
          <span className="truncate gem-so-largo">{c}</span>
        </button>
      ))}

      <div className="gem-lateral-pe">
        <button className="gem-conversa" onClick={() => aoAvisar('A ajuda')}>
          <HelpCircle className="w-4 h-4 flex-none" />
          <span className="gem-so-largo">Ajuda</span>
        </button>
        <button className="gem-conversa" onClick={() => aoAvisar('As configurações')}>
          <Settings className="w-4 h-4 flex-none" />
          <span className="gem-so-largo">Configurações</span>
        </button>
      </div>
    </div>
  );
}

/** O cabeçalho do palco: marca, modelo e a bolinha da conta. */
export function TopoDoGemini({ inicial, aoAvisar }: {
  inicial: string; aoAvisar: (o: string) => void;
}) {
  return (
    <div className="gem-topo">
      <span className="gem-marca">Gemini</span>
      <button className="gem-modelo" onClick={() => aoAvisar('Trocar de modelo')}>
        2.5 Flash <span style={{ fontSize: 10 }}>▾</span>
      </button>
      <div className="gem-conta" aria-hidden="true">{inicial}</div>
    </div>
  );
}

/** A pergunta, na bolha cinza à direita. */
export function PerguntaDoGemini({ texto }: { texto: string }) {
  return <div className="gem-pergunta"><div>{texto}</div></div>;
}

/**
 * A resposta, com o selo à esquerda e os polegares embaixo.
 *
 * Os polegares carregam a avaliação crítica do requisito: é no botão que o
 * aplicativo já tem que ela acontece, e não num formulário à parte.
 */
export function RespostaDoGemini({ carregando, children, acoes }: {
  carregando?: boolean; children?: React.ReactNode; acoes?: React.ReactNode;
}) {
  return (
    <div className="gem-resposta">
      <span className="gem-selo"><SeloDoGemini /></span>
      <div className="gem-corpo">
        {carregando ? (
          <div className="gem-carregando" aria-label="Gerando resposta">
            <span style={{ width: '92%' }} />
            <span style={{ width: '78%' }} />
            <span style={{ width: '86%' }} />
          </div>
        ) : children}
        {!carregando && acoes && <div className="gem-acoes">{acoes}</div>}
      </div>
    </div>
  );
}

/**
 * A barra de perguntar.
 *
 * O texto do pedido não é digitado: é montado pelos chips. São duas razões, na
 * ordem — quem estuda aqui é menor de idade, e vocabulário fechado quer dizer
 * que não há canal aberto para um modelo generativo; e montar o pedido por
 * partes (assunto, público, tom, tamanho) é o que ensina a pedir. Campo em
 * branco não ensina nada.
 */
export function CaixaDoGemini({ prompt, podeEnviar, enviando, aoEnviar, aoAvisar, children }: {
  prompt: string;
  podeEnviar: boolean;
  enviando: boolean;
  aoEnviar: () => void;
  aoAvisar: (o: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="gem-pe">
      <div className="gem-caixa">
        <p className={prompt ? 'gem-prompt' : 'gem-prompt vazio'}>
          {prompt || 'Pergunte ao Gemini'}
        </p>
        <div className="gem-ferramentas">
          <button className="gem-icone" style={{ width: 32, height: 32 }}
            aria-label="Anexar arquivo" onClick={() => aoAvisar('Anexar um arquivo')}>
            <Paperclip className="w-4 h-4" />
          </button>
          {children}
          <button className="gem-icone" style={{ width: 32, height: 32 }}
            aria-label="Falar" onClick={() => aoAvisar('Ditar por voz')}>
            <Mic className="w-4 h-4" />
          </button>
          <button className="gem-enviar" onClick={aoEnviar} disabled={!podeEnviar || enviando}
            aria-label="Enviar o pedido">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="gem-aviso">
        O Gemini pode cometer erros, inclusive sobre pessoas. Confira as respostas.
      </p>
    </div>
  );
}

/** Um chip de escolha na barra de perguntar. */
export function ChipDoGemini({ rotulo, valor, opcoes, aoMudar }: {
  rotulo: string; valor: string;
  opcoes: { id: string; label: string }[];
  aoMudar: (v: string) => void;
}) {
  return (
    <label className="gem-chip">
      <select value={valor} aria-label={rotulo} onChange={e => aoMudar(e.target.value)}>
        {opcoes.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </label>
  );
}
