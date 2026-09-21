import type React from 'react';
import {
  ShieldCheck, Smartphone, AppWindow, EyeOff, Activity, AlertTriangle,
  MailWarning, X, Download, Monitor, LogOut, Trash2, KeyRound, Search,
  MessageSquare,
} from 'lucide-react';
import {
  type ContaOnline, type AjusteDePrivacidade, type AplicativoAutorizado,
  type Sessao, type Encaminhamento, type MetodoDeDuasEtapas, type Vazamento,
  ESCOPOS, METODOS_DE_DUAS_ETAPAS,
} from './contaOnline';

/*
 * A página de configurações da conta online, em peças.
 *
 * O modelo mora em `contaOnline.ts`; aqui está só o programa que o desenha —
 * a divisão de `cofreDeSenhas.ts` e `gerenciadorDeSenhas.tsx`, e a de
 * `documentoPdf.ts` e `leitorDePdf.tsx`.
 *
 * ── Por que ela é um programa ────────────────────────────────────────────
 * Quatro das cinco demonstrações do requisito 4 acontecem aqui — duas etapas,
 * aplicativos de terceiros, verificação de vazamento e privacidade —, e todas
 * são **onde encontrar e o que decidir** antes de serem o que clicar. Um
 * formulário da plataforma ensinaria o caminho errado: o requisito 4.5 diz
 * "localizar e ajustar", e localizar é metade dele.
 *
 * Ela não imita marca. A conta do Google, a da Microsoft e a de qualquer rede
 * social não se parecem no desenho, e se parecem no **arranjo**: lateral com
 * as seções, cartões no meio, e cada assunto numa tela própria — que é
 * justamente por que ninguém acha nada na primeira vez. É esse arranjo que
 * está aqui, como `ide.tsx` faz com o editor de código.
 *
 * ── O que fica aqui e o que fica no laboratório ──────────────────────────
 * Aqui fica o que é do **programa**: como um aplicativo autorizado se desenha,
 * o que a caixa de duas etapas oferece, o que a consulta de vazamento responde.
 * Lá fica o que é do **exercício**: de que conta se parte e o que se cobra.
 *
 * Nenhuma peça guarda estado — é a regra de `word.tsx`, `excel.tsx`,
 * `explorer.tsx`, `leitorDePdf.tsx` e `correio.tsx`, pelo motivo escrito nos
 * cinco.
 *
 * ── E a página relata, nunca dá veredito ─────────────────────────────────
 * Nenhuma conta de verdade escreve "sua tarefa está incompleta". Ela mostra o
 * método e o que ele cobre, o último uso do aplicativo, a data do vazamento —
 * e a conclusão é de quem lê. É a régua de status do Word e o painel de
 * Problemas do Python.
 */

export const CSS_DA_CONTA = `
.ct-janela {
  background: #FFFFFF; color: #1F1F1F;
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
.ct-janela h1, .ct-janela h2, .ct-janela h3, .ct-janela h4 { color: #1F1F1F; }

.ct-topo {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 16px; border-bottom: 1px solid #DADCE0; font-size: 13.5px;
}
.ct-marca { font-weight: 500; font-size: 15px; color: #0B57D0; }
.ct-quem { margin-left: auto; display: flex; align-items: center; gap: 8px; font-size: 12.5px; }
.ct-avatar {
  width: 28px; height: 28px; border-radius: 50%; background: #0B57D0; color: #FFFFFF;
  display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px;
}

.ct-corpo { flex: 1; display: flex; min-height: 0; }

.ct-lado {
  width: 212px; flex-shrink: 0; padding: 10px 8px; overflow-y: auto;
  border-right: 1px solid #DADCE0; display: flex; flex-direction: column; gap: 2px;
}
.ct-secao {
  display: flex; align-items: center; gap: 11px; width: 100%;
  padding: 9px 14px; border: none; background: transparent; cursor: pointer;
  border-radius: 999px; font-size: 13px; color: #1F1F1F; text-align: left;
}
.ct-secao:hover { background: #F1F3F4; }
.ct-secao[aria-current="true"] { background: #D3E3FD; color: #041E49; font-weight: 500; }
.ct-secao:focus-visible { outline: 2px solid #0B57D0; outline-offset: -2px; }
.ct-secao svg { flex-shrink: 0; }

.ct-painel { flex: 1; overflow-y: auto; padding: 20px 24px; min-width: 0; }
.ct-titulo { font-size: 20px; font-weight: 400; margin: 0 0 4px; }
.ct-sub { font-size: 13px; color: #444746; margin: 0 0 18px; max-width: 62ch; }

.ct-cartao {
  border: 1px solid #DADCE0; border-radius: 10px; padding: 16px; margin-bottom: 14px;
}
.ct-cartao h3 { font-size: 15px; font-weight: 500; margin: 0 0 3px; }
.ct-cartao p.ct-diz { font-size: 12.5px; color: #444746; margin: 0 0 12px; max-width: 62ch; }

.ct-item {
  display: flex; align-items: flex-start; gap: 13px;
  padding: 13px 0; border-top: 1px solid #E8EAED;
}
.ct-item:first-of-type { border-top: none; }
.ct-item-txt { flex: 1; min-width: 0; }
.ct-item-nome { font-size: 13.5px; font-weight: 500; }
.ct-item-diz { font-size: 12.5px; color: #444746; margin: 2px 0 0; }
.ct-escopos { margin: 6px 0 0; padding-left: 18px; font-size: 12.5px; color: #444746; }
.ct-escopos li { margin: 1px 0; }

.ct-bt {
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
  padding: 7px 15px; border-radius: 999px; font-size: 13px; font-weight: 500;
  border: 1px solid #747775; background: transparent; color: #0B57D0; cursor: pointer;
}
.ct-bt:hover:not(:disabled) { background: #F0F4FC; }
.ct-bt:focus-visible { outline: 2px solid #0B57D0; outline-offset: 1px; }
.ct-bt[data-principal="sim"] {
  background: #0B57D0; border-color: #0B57D0; color: #FFFFFF;
}
.ct-bt[data-principal="sim"]:hover:not(:disabled) { background: #0A4AB4; }
.ct-bt[data-perigo="sim"] { color: #B3261E; border-color: #B3261E; }
.ct-bt[data-perigo="sim"]:hover:not(:disabled) { background: #FCEEEC; }
/* O desligado vem **depois** dos dois acima, e não antes.
   Escrito primeiro, ele tem a mesma especificidade e perde: o botão principal
   desligado saía azul e branco, com cara de clicável, e clicar nele não fazia
   nada — que é o que ensina a desconfiar do programa. É a mesma ordem que o
   diálogo do celular da CC-ES001 e da CC-ES004 precisou, e ela não estoura
   nada quando está errada. */
.ct-bt:disabled,
.ct-bt[data-principal="sim"]:disabled,
.ct-bt[data-perigo="sim"]:disabled {
  background: #F1F3F4; color: #80868B; border-color: #C4C7C5; cursor: default;
}
.ct-acoes { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 13px; }

.ct-estado {
  display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px;
  border-radius: 999px; padding: 3px 11px; border: 1px solid;
}
.ct-estado[data-bom="sim"] { background: #E6F4EA; border-color: #A8D5B5; color: #0D652D; }
.ct-estado[data-bom="não"] { background: #FCE8E6; border-color: #F3BBB5; color: #8C1D18; }

.ct-select {
  border: 1px solid #747775; border-radius: 6px; padding: 6px 9px;
  font: inherit; font-size: 12.5px; color: #1F1F1F; background: #FFFFFF; flex-shrink: 0;
}
.ct-select:focus-visible { outline: 2px solid #0B57D0; outline-offset: 1px; }

.ct-faixa {
  display: flex; gap: 11px; align-items: flex-start;
  background: #FCE8E6; border: 1px solid #F3BBB5; border-radius: 10px;
  padding: 13px 15px; margin-bottom: 18px; font-size: 13px; color: #8C1D18;
}
.ct-faixa svg { flex-shrink: 0; margin-top: 1px; }
.ct-faixa b { display: block; font-weight: 600; margin-bottom: 2px; }

.ct-procura { display: flex; gap: 9px; align-items: center; flex-wrap: wrap; }
.ct-procura input {
  flex: 1; min-width: 190px; border: 1px solid #747775; border-radius: 6px;
  padding: 7px 10px; font: inherit; font-size: 13px; color: #1F1F1F; background: #FFFFFF;
}
.ct-procura input:focus-visible { outline: 2px solid #0B57D0; outline-offset: 1px; }

.ct-codigos {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 7px;
  font-family: 'Space Mono', ui-monospace, monospace; font-size: 13px;
  background: #F8F9FA; border: 1px solid #DADCE0; border-radius: 8px;
  padding: 12px; margin: 12px 0;
}

.ct-metodo {
  display: flex; gap: 11px; align-items: flex-start; width: 100%; text-align: left;
  padding: 12px; border: 1px solid #DADCE0; border-radius: 8px;
  background: #FFFFFF; cursor: pointer; margin-bottom: 9px; color: #1F1F1F;
}
.ct-metodo:hover { background: #F8F9FA; }
.ct-metodo[aria-pressed="true"] { border-color: #0B57D0; background: #F0F4FC; }
.ct-metodo:focus-visible { outline: 2px solid #0B57D0; outline-offset: 1px; }
.ct-metodo-nome { font-size: 13.5px; font-weight: 500; }
.ct-metodo p { font-size: 12.5px; color: #444746; margin: 4px 0 0; }
.ct-metodo p[data-lado="contra"] { color: #8C1D18; }

.ct-dialogo-fundo {
  position: absolute; inset: 0; z-index: 30;
  background: rgba(32,33,36,0.5);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.ct-dialogo {
  background: #FFFFFF; border-radius: 12px; padding: 20px;
  width: min(420px, 100%); box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.ct-dialogo h3 { font-size: 16px; font-weight: 500; margin: 0 0 4px; }
.ct-campo-dialogo {
  width: 100%; margin-top: 12px; border: 1px solid #747775; border-radius: 6px;
  padding: 8px 10px; font: inherit; font-size: 13px; color: #1F1F1F; background: #FFFFFF;
}
.ct-campo-dialogo:focus-visible { outline: 2px solid #0B57D0; outline-offset: 1px; }

/* Abaixo de 820px a lateral deita, como a conta do celular faz. Escondê-la
   tiraria o único caminho até quatro das cinco demonstrações do requisito 4 —
   reduzir a tela nunca reduz o que dá para fazer nela. */
@media (max-width: 820px) {
  .ct-corpo { flex-direction: column; }
  .ct-lado {
    width: auto; flex-direction: row; overflow-x: auto; padding: 7px;
    border-right: none; border-bottom: 1px solid #DADCE0;
  }
  .ct-secao { width: auto; flex: none; white-space: nowrap; padding: 7px 13px; }
  .ct-painel { padding: 14px; }
  .ct-item { flex-wrap: wrap; }

  /* O diálogo sobe, porque a cápsula de tarefas mora no canto de baixo e um
     diálogo centrado punha Salvar e Cancelar debaixo dela: via-se o formulário
     inteiro e não se via como confirmar. A regra vem **depois** da que o
     centra — as duas têm a mesma especificidade, e escrita antes ela não
     valeria nada, sem nada estourar. É o conserto que a CC-ES001 e a CC-ES004
     já fizeram, e a trava lê a ordem, e não só a existência. */
  .ct-dialogo-fundo { align-items: flex-start; padding-top: 10px; }
}
`;

/* ── O topo ───────────────────────────────────────────────────────────────── */

export function TopoDaConta({ conta, extra }: { conta: ContaOnline; extra?: React.ReactNode }) {
  return (
    <div className="ct-topo">
      <span className="ct-marca">Minha Conta</span>
      <span style={{ color: '#444746' }}>· {conta.servico}</span>
      <span className="ct-quem">
        {extra}
        <span>{conta.endereco}</span>
        <span className="ct-avatar" aria-hidden>{conta.endereco.slice(0, 1).toUpperCase()}</span>
      </span>
    </div>
  );
}

/* ── A lateral ────────────────────────────────────────────────────────────── */

export type SecaoDaConta = 'seguranca' | 'aplicativos' | 'privacidade' | 'atividade';

/*
  As quatro seções, e todas as quatro sempre.

  Um programa tem todos os comandos: uma conta que só mostrasse "Privacidade"
  na lição de privacidade ensinaria a procurar o botão que a tarefa quer, e
  não a procurar no programa. É a regra da faixa do Explorador e da do leitor
  de PDF.

  A lista não sai daqui, e foi o lint que apontou: quem precisa saber que as
  quatro existem é a trava, e ela as lê da tela desenhada — que é o que de
  fato importa. Exportar a lista ofereceria segunda fonte para a mesma coisa,
  que é por que o mapa de filtros do digitalizador e as pastas do correio
  também ficaram dentro dos arquivos deles.
*/
const SECOES_DA_CONTA: { id: SecaoDaConta; nome: string; icone: typeof ShieldCheck }[] = [
  { id: 'seguranca', nome: 'Segurança', icone: ShieldCheck },
  { id: 'aplicativos', nome: 'Aplicativos conectados', icone: AppWindow },
  { id: 'privacidade', nome: 'Privacidade', icone: EyeOff },
  { id: 'atividade', nome: 'Atividade da conta', icone: Activity },
];

export function LateralDaConta({ atual, aoTrocar }: {
  atual: SecaoDaConta;
  aoTrocar: (s: SecaoDaConta) => void;
}) {
  return (
    <nav className="ct-lado" aria-label="Seções da conta">
      {SECOES_DA_CONTA.map(({ id, nome, icone: Icone }) => (
        <button
          type="button" key={id} className="ct-secao"
          aria-current={atual === id ? 'true' : undefined}
          onClick={() => aoTrocar(id)}
        >
          <Icone size={17} aria-hidden /> {nome}
        </button>
      ))}
    </nav>
  );
}

/* ── Um cartão ────────────────────────────────────────────────────────────── */

export function CartaoDaConta({ titulo, diz, children }: {
  titulo: string; diz?: string; children?: React.ReactNode;
}) {
  return (
    <section className="ct-cartao">
      <h3>{titulo}</h3>
      {diz && <p className="ct-diz">{diz}</p>}
      {children}
    </section>
  );
}

export const TituloDaSecao = ({ titulo, diz }: { titulo: string; diz?: string }) => (
  <>
    <h2 className="ct-titulo">{titulo}</h2>
    {diz && <p className="ct-sub">{diz}</p>}
  </>
);

/* ── A faixa de aviso do serviço ──────────────────────────────────────────── */

/**
 * O aviso que o próprio serviço mostraria.
 *
 * Ele relata o que o serviço detectou, e nunca se a tarefa está cumprida —
 * nenhuma conta de verdade escreve "seu exercício está incompleto". É a mesma
 * decisão do aviso de qualidade do digitalizador.
 */
export const FaixaDaConta = ({ titulo, children }: {
  titulo: string; children: React.ReactNode;
}) => (
  <p className="ct-faixa">
    <AlertTriangle size={18} aria-hidden />
    <span><b>{titulo}</b>{children}</span>
  </p>
);

/* ── As duas etapas ───────────────────────────────────────────────────────── */

export function EscolhaDeMetodo({ escolhido, aoEscolher }: {
  escolhido?: MetodoDeDuasEtapas;
  aoEscolher: (m: MetodoDeDuasEtapas) => void;
}) {
  /* O SMS vem primeiro porque é assim que todo serviço o oferece — e é essa
     ordem que faz a escolha do requisito 4.2 significar alguma coisa. */
  const ordem: MetodoDeDuasEtapas[] = ['sms', 'aplicativo', 'chave'];
  return (
    <div>
      {ordem.map(m => {
        const d = METODOS_DE_DUAS_ETAPAS[m];
        return (
          <button
            type="button" key={m} className="ct-metodo"
            aria-pressed={escolhido === m} onClick={() => aoEscolher(m)}
          >
            {/* Três ícones diferentes, porque são três coisas diferentes — e a
                lição inteira é a diferença entre elas. Dois métodos com o
                mesmo desenho dizem que são a mesma coisa com nomes distintos,
                que é o defeito de pintar o bloco do Scratch da cor errada. */}
            {m === 'sms' ? <MessageSquare size={18} aria-hidden />
              : m === 'aplicativo' ? <Smartphone size={18} aria-hidden />
                : <KeyRound size={18} aria-hidden />}
            <span>
              <span className="ct-metodo-nome">{d.nome}</span>
              <p>{d.protege}</p>
              <p data-lado="contra">{d.naoProtege}</p>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * A caixa dos códigos de reserva.
 *
 * Ela **fecha sem guardar**, e é a armadilha inteira do requisito 4.2: o
 * serviço mostra os códigos uma vez, e fechar é um clique. A tela fica dizendo
 * "duas etapas ativada", tudo parece certo, e a conta se perde no dia em que o
 * telefone se perder. Uma caixa que só fechasse depois de baixar apagaria o
 * gesto que a lição existe para mostrar.
 */
export function CaixaDeCodigos({ codigos, guardados, aoGuardar, aoFechar }: {
  codigos: string[];
  guardados: boolean;
  aoGuardar: () => void;
  aoFechar: () => void;
}) {
  return (
    <CartaoDaConta
      titulo="Códigos de reserva"
      diz="Guarde estes códigos num lugar seguro. Eles são a única forma de entrar se você perder o aparelho, e não serão mostrados de novo."
    >
      <div className="ct-codigos">
        {codigos.map(c => <span key={c}>{c}</span>)}
      </div>
      <div className="ct-acoes">
        <button type="button" className="ct-bt" data-principal="sim" onClick={aoGuardar}>
          <Download size={15} aria-hidden /> Baixar os códigos
        </button>
        <button type="button" className="ct-bt" onClick={aoFechar}>
          <X size={15} aria-hidden /> Fechar
        </button>
      </div>
      {guardados && (
        <p className="ct-item-diz" style={{ marginTop: 10 }}>
          Arquivo <b>codigos-de-reserva.txt</b> salvo na pasta de downloads.
        </p>
      )}
    </CartaoDaConta>
  );
}

/* ── Os aplicativos ───────────────────────────────────────────────────────── */

export function LinhaDeAplicativo({ app, aoRevogar }: {
  app: AplicativoAutorizado;
  aoRevogar?: () => void;
}) {
  return (
    <div className="ct-item">
      <AppWindow size={20} aria-hidden style={{ color: '#444746', marginTop: 2 }} />
      <span className="ct-item-txt">
        <span className="ct-item-nome">{app.nome}</span>
        <p className="ct-item-diz">
          Autorizado em {app.autorizadoEm}
          {app.ultimoUso && <> · usado pela última vez {app.ultimoUso}</>}
        </p>
        <ul className="ct-escopos">
          {app.escopos.map(e => <li key={e}>{ESCOPOS[e]}</li>)}
        </ul>
      </span>
      {aoRevogar && (
        <button
          type="button" className="ct-bt" data-perigo="sim" onClick={aoRevogar}
          aria-label={`Remover o acesso de ${app.nome}`}
        >
          Remover acesso
        </button>
      )}
    </div>
  );
}

/* ── As sessões e o encaminhamento ────────────────────────────────────────── */

export function LinhaDeSessao({ sessao, aoEncerrar }: {
  sessao: Sessao;
  aoEncerrar?: () => void;
}) {
  return (
    <div className="ct-item">
      <Monitor size={20} aria-hidden style={{ color: '#444746', marginTop: 2 }} />
      <span className="ct-item-txt">
        <span className="ct-item-nome">{sessao.aparelho}</span>
        <p className="ct-item-diz">{sessao.lugar} · {sessao.quando}</p>
      </span>
      {sessao.atual
        ? <span className="ct-estado" data-bom="sim">este aparelho</span>
        : aoEncerrar && (
          <button
            type="button" className="ct-bt" onClick={aoEncerrar}
            aria-label={`Encerrar a sessão em ${sessao.aparelho}`}
          >
            <LogOut size={15} aria-hidden /> Encerrar
          </button>
        )}
    </div>
  );
}

export function LinhaDeEncaminhamento({ regra, aoTirar }: {
  regra: Encaminhamento;
  aoTirar?: () => void;
}) {
  return (
    <div className="ct-item">
      <MailWarning size={20} aria-hidden style={{ color: '#444746', marginTop: 2 }} />
      <span className="ct-item-txt">
        <span className="ct-item-nome">Copiar toda mensagem recebida para {regra.para}</span>
        <p className="ct-item-diz">Criada em {regra.criadoEm}</p>
      </span>
      {aoTirar && (
        <button
          type="button" className="ct-bt" data-perigo="sim" onClick={aoTirar}
          aria-label={`Apagar a regra que copia para ${regra.para}`}
        >
          <Trash2 size={15} aria-hidden /> Apagar
        </button>
      )}
    </div>
  );
}

/* ── A privacidade ────────────────────────────────────────────────────────── */

export function LinhaDeAjuste({ ajuste, aoMudar }: {
  ajuste: AjusteDePrivacidade;
  aoMudar?: (v: string) => void;
}) {
  return (
    <div className="ct-item">
      <span className="ct-item-txt">
        <span className="ct-item-nome">{ajuste.nome}</span>
        <p className="ct-item-diz">{ajuste.explica}</p>
      </span>
      <select
        className="ct-select" value={ajuste.valor} aria-label={ajuste.nome}
        disabled={!aoMudar} onChange={e => aoMudar?.(e.target.value)}
      >
        {ajuste.opcoes.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

/* ── A consulta de vazamento ──────────────────────────────────────────────── */

/**
 * A consulta, e o que ela responde.
 *
 * **Lista vazia não é atestado**, e o programa diz o que consultou em vez de
 * escrever "você está seguro". É o erro mais fácil de ensinar aqui: quem
 * recebe "nada encontrado" lê um atestado, e o que houve foi nenhuma lista
 * pública ter aquele endereço.
 */
export function CaixaDeVazamento({ endereco, aoMudar, aoConsultar, achados, consultado }: {
  endereco: string;
  aoMudar: (e: string) => void;
  aoConsultar: () => void;
  achados: Vazamento[];
  /** O endereço já consultado. Sem ele não se mostra resultado nenhum. */
  consultado?: string;
}) {
  return (
    <CartaoDaConta
      titulo="Verificar se um endereço consta em vazamento"
      diz="A consulta procura o endereço nas listas públicas de vazamentos já divulgados."
    >
      <div className="ct-procura">
        <input
          value={endereco} aria-label="Endereço a consultar"
          placeholder="endereco@exemplo.com"
          onChange={e => aoMudar(e.target.value)}
        />
        <button type="button" className="ct-bt" data-principal="sim" onClick={aoConsultar}>
          <Search size={15} aria-hidden /> Consultar
        </button>
      </div>

      {consultado && achados.length === 0 && (
        <p className="ct-item-diz" style={{ marginTop: 13 }}>
          <b>{consultado}</b> não aparece em nenhuma das listas públicas consultadas.
        </p>
      )}
      {consultado && achados.map(v => (
        <div className="ct-item" key={v.servico}>
          <AlertTriangle size={20} aria-hidden style={{ color: '#B3261E', marginTop: 2 }} />
          <span className="ct-item-txt">
            <span className="ct-item-nome">{v.servico} · {v.quando}</span>
            <p className="ct-item-diz">Vazou: {v.oQueVazou.join(', ')}.</p>
          </span>
        </div>
      ))}
    </CartaoDaConta>
  );
}
