import type React from 'react';
import {
  AppWindow, Mic, MicOff, Monitor, MonitorUp, PhoneOff, SquareArrowOutUpRight,
  Users, Video, VideoOff, X,
} from 'lucide-react';

/*
 * A sala de reunião a distância, em peças.
 *
 * ── Por que ela nasce separada ───────────────────────────────────────────
 * Pelo motivo escrito em `word.tsx`, `excel.tsx`, `explorer.tsx`,
 * `leitorDePdf.tsx`, `correio.tsx`, `nuvem.tsx` e `calendario.tsx`: extrair
 * **antes** de a cópia existir. A CC-ES012 Projeto Documental já está
 * anunciada apontando para esta vereda, e uma segunda sala escrita copiando
 * esta é como a plataforma ficou com dois "Word" uma vez.
 *
 * ── E ela não imita marca ────────────────────────────────────────────────
 * Meet, Zoom e Teams não se parecem, e compartilham um **arranjo**: o palco
 * escuro com os quadradinhos de quem está, a barra embaixo com microfone,
 * câmera, apresentar e sair, a faixa no alto avisando que você está
 * apresentando, e a caixa de escolher o que mostrar com as três abas. É esse
 * arranjo que está aqui.
 *
 * ── O palco é escuro, e a plataforma some ────────────────────────────────
 * É a única janela desta vereda que não é branca, e é assim em todas elas: o
 * vídeo pede fundo escuro. Por isso as cores estão escritas aqui e não
 * herdadas — e a caixa de escolher o que mostrar é clara, porque é um diálogo
 * do sistema, e diz a própria cor.
 */

export const CSS_DA_SALA = `
.re-janela {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  background: #202124; color: #E8EAED;
  font-family: system-ui, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13.5px;
}
.re-janela h1, .re-janela h2, .re-janela h3, .re-janela h4 { color: #E8EAED; }
.re-faixa {
  display: flex; align-items: center; gap: 10px; padding: 8px 14px;
  background: #3C4043; font-size: 12.5px; flex-wrap: wrap;
}
.re-faixa[data-tom="apresentando"] { background: #1A73E8; color: #FFFFFF; }
.re-palco {
  flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 10px;
  padding: 12px; overflow: auto;
}
.re-tela {
  flex: 1; min-height: 140px; border-radius: 10px; background: #000000;
  border: 1px solid #5F6368; display: flex; align-items: center; justify-content: center;
  padding: 16px; text-align: center; color: #E8EAED;
}
.re-tela[data-vazia="sim"] { background: #3C4043; border-style: dashed; color: #BDC1C6; }
.re-ladrilhos {
  display: flex; gap: 8px; flex-wrap: wrap;
}
.re-ladrilho {
  width: 132px; height: 82px; border-radius: 8px; background: #3C4043;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; font-size: 11.5px; padding: 6px; text-align: center; color: #E8EAED;
}
.re-ladrilho[data-voce="sim"] { outline: 2px solid #8AB4F8; }
.re-barra {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 10px 14px; background: #202124; border-top: 1px solid #3C4043; flex-wrap: wrap;
}
.re-bt {
  display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px;
  border-radius: 999px; border: 1px solid #5F6368; background: #3C4043;
  color: #E8EAED; font-size: 13px; cursor: pointer;
}
.re-bt:hover { background: #4A4D51; }
.re-bt[data-ligado="nao"] { background: #EA4335; border-color: #EA4335; color: #FFFFFF; }
.re-bt[data-principal="sim"] { background: #1A73E8; border-color: #1A73E8; color: #FFFFFF; }
.re-bt[data-sair="sim"] { background: #EA4335; border-color: #EA4335; color: #FFFFFF; }
/*
  A regra do desligado vem **depois** de todas as outras, e não antes.

  Mesma especificidade: escrita primeiro, um botão desligado continuaria azul
  ou vermelho, com cara de clicável, e clicar não faria nada — que é o que
  ensina a desconfiar do programa. É a quarta vez que esta ordem é necessária
  na plataforma, e errá-la não estoura nada. Ela troca o **fundo**, e não só a
  letra: um retângulo azul continua parecendo botão por mais clara que fique a
  palavra dentro dele.
*/
.re-bt:disabled,
.re-bt[data-ligado="nao"]:disabled,
.re-bt[data-principal="sim"]:disabled,
.re-bt[data-sair="sim"]:disabled {
  background: #2B2C2F; border-color: #3C4043; color: #7A7E83; cursor: not-allowed;
}

.re-fundo {
  position: absolute; inset: 0; background: rgba(0,0,0,.6);
  display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 20;
}
/* A caixa de escolher o que mostrar é do sistema, e é clara: ela diz a
   própria cor, senão os títulos da plataforma somem em cima do papel. */
.re-dialogo {
  background: #FFFFFF; color: #202124; border-radius: 10px; padding: 18px 20px;
  width: min(560px, 100%); max-height: 88%; overflow: auto;
  box-shadow: 0 8px 28px rgba(0,0,0,.4);
}
.re-dialogo h3, .re-dialogo h4 { color: #202124; }
.re-abas { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
.re-aba {
  padding: 7px 12px; border: 1px solid #DADCE0; border-radius: 6px;
  background: #FFFFFF; color: #202124; font-size: 13px; cursor: pointer;
}
.re-aba[aria-pressed="true"] { background: #E8F0FE; border-color: #1A73E8; color: #174EA6; }
.re-alvo {
  display: flex; gap: 10px; align-items: center; width: 100%; text-align: left;
  padding: 9px 12px; border: 1px solid #DADCE0; border-radius: 8px;
  background: #FFFFFF; color: #202124; cursor: pointer; margin-bottom: 8px;
}
.re-alvo:hover { background: #F1F3F4; }
.re-alvo[aria-pressed="true"] { border-color: #1A73E8; background: #E8F0FE; }
.re-nota { font-size: 11.5px; color: #5F6368; }
.re-bt-claro {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;
  border: 1px solid #DADCE0; border-radius: 6px; background: #FFFFFF;
  color: #202124; font-size: 13px; cursor: pointer;
}
.re-bt-claro[data-principal="sim"] { background: #1A73E8; border-color: #1A73E8; color: #FFFFFF; }
.re-bt-claro:disabled, .re-bt-claro[data-principal="sim"]:disabled {
  background: #F1F3F4; border-color: #E0E0E0; color: #9AA0A6; cursor: not-allowed;
}

@media (max-width: 760px) {
  .re-ladrilho { width: 104px; height: 68px; }
  .re-bt { padding: 8px 11px; }
  /* O diálogo sobe: a cápsula de tarefas da plataforma mora no canto de baixo,
     e centrado ele põe Cancelar e Compartilhar debaixo dela. A regra vem
     depois da que centra, pela mesma razão escrita nas outras janelas. */
  .re-fundo { align-items: flex-start; padding-top: 12px; }
}
`;

/* ── A faixa de cima ──────────────────────────────────────────────────────── */

/**
 * A faixa que avisa o que está acontecendo.
 *
 * Ela diz o que o **programa** sabe — "você está apresentando a tela inteira",
 * "uma pessoa esperando para entrar" — e nunca se a tarefa está cumprida. É a
 * regra da régua de status do Word e do painel de Problemas do Python.
 */
export function FaixaDaSala({ tom, children }: {
  tom?: 'apresentando';
  children: React.ReactNode;
}) {
  return <div className="re-faixa" data-tom={tom}>{children}</div>;
}

/* ── O palco ──────────────────────────────────────────────────────────────── */

export interface LadrilhoDaSala {
  id: string;
  nome: string;
  microfone: boolean;
  voce?: boolean;
}

/**
 * O que a sala está vendo, e quem está nela.
 *
 * `mostrando` é o nome da janela que a sala vê, e `undefined` é ninguém
 * apresentando. A tela desenha **o que a sala vê**, e não o que você está
 * olhando — a diferença entre as duas é metade do requisito 6, e um palco que
 * desenhasse a sua janela em foco esconderia a janela parada que todo mundo
 * está vendo.
 */
export function PalcoDaSala({ mostrando, vazio, ladrilhos, rodape }: {
  mostrando?: string;
  vazio?: string;
  ladrilhos: LadrilhoDaSala[];
  rodape?: React.ReactNode;
}) {
  return (
    <div className="re-palco">
      <div className="re-tela" data-vazia={mostrando ? undefined : 'sim'}>
        {mostrando
          ? (
            <span>
              <MonitorUp className="w-5 h-5" style={{ display: 'inline', marginRight: 8 }} />
              A sala está vendo: <strong>{mostrando}</strong>
            </span>
          )
          : <span>{vazio ?? 'Ninguém está apresentando.'}</span>}
      </div>
      <div className="re-ladrilhos">
        {ladrilhos.map(l => (
          <div key={l.id} className="re-ladrilho" data-voce={l.voce ? 'sim' : undefined}>
            {l.microfone
              ? <Mic className="w-4 h-4" />
              : <MicOff className="w-4 h-4" style={{ color: '#F28B82' }} />}
            <span>{l.nome}</span>
          </div>
        ))}
      </div>
      {rodape}
    </div>
  );
}

/* ── A barra de baixo ─────────────────────────────────────────────────────── */

/**
 * Os comandos que toda sala tem embaixo.
 *
 * Eles aparecem **sempre**, e ficam desligados quando o laboratório não
 * entrega a função — que é o que um programa faz quando o comando não cabe.
 * Esconder o de apresentar durante a lição que não apresenta ensinaria a
 * procurar o botão que a tarefa quer, e não a procurar no programa.
 */
export function BarraDaSala({
  microfone, aoTrocarMicrofone, camera, aoTrocarCamera,
  aoApresentar, apresentando, aoPararDeApresentar, quantos, aoVerPessoas, aoSair, extra,
}: {
  microfone: boolean;
  aoTrocarMicrofone?: (aberto: boolean) => void;
  camera: boolean;
  aoTrocarCamera?: (aberta: boolean) => void;
  aoApresentar?: () => void;
  apresentando?: boolean;
  aoPararDeApresentar?: () => void;
  quantos?: number;
  aoVerPessoas?: () => void;
  aoSair?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="re-barra">
      <button type="button" className="re-bt" data-ligado={microfone ? 'sim' : 'nao'}
        aria-label={microfone ? 'Fechar o microfone' : 'Abrir o microfone'}
        onClick={() => aoTrocarMicrofone?.(!microfone)} disabled={!aoTrocarMicrofone}>
        {microfone ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
      </button>
      <button type="button" className="re-bt" data-ligado={camera ? 'sim' : 'nao'}
        aria-label={camera ? 'Desligar a câmera' : 'Ligar a câmera'}
        onClick={() => aoTrocarCamera?.(!camera)} disabled={!aoTrocarCamera}>
        {camera ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
      </button>
      {apresentando
        ? (
          <button type="button" className="re-bt" data-principal="sim"
            onClick={aoPararDeApresentar} disabled={!aoPararDeApresentar}>
            <MonitorUp className="w-4 h-4" /> Parar de apresentar
          </button>
        )
        : (
          <button type="button" className="re-bt"
            onClick={aoApresentar} disabled={!aoApresentar}>
            <MonitorUp className="w-4 h-4" /> Apresentar agora
          </button>
        )}
      <button type="button" className="re-bt" aria-label="Pessoas"
        onClick={aoVerPessoas} disabled={!aoVerPessoas}>
        <Users className="w-4 h-4" />{quantos !== undefined ? ` ${quantos}` : ''}
      </button>
      <button type="button" className="re-bt" data-sair="sim" aria-label="Sair da reunião"
        onClick={aoSair} disabled={!aoSair}>
        <PhoneOff className="w-4 h-4" />
      </button>
      {extra}
    </div>
  );
}

/* ── A caixa de escolher o que mostrar ────────────────────────────────────── */

const ICONE_DA_ABA = {
  'tela-inteira': Monitor,
  janela: AppWindow,
  guia: SquareArrowOutUpRight,
};

export interface AbaDeApresentar {
  id: 'tela-inteira' | 'janela' | 'guia';
  nome: string;
  /** O que esta escolha leva junto. Sem ele, as três abas são três botões iguais. */
  leva: string;
  /** O que dá para escolher dentro dela. A tela inteira não tem escolha. */
  alvos: string[];
}

/**
 * A caixa que o sistema abre quando alguém clica em apresentar.
 *
 * As três abas vêm com o mesmo peso, e **é** assim no programa de verdade:
 * nenhuma é destacada. Destacar a certa aqui seria a plataforma escolhendo
 * pela pessoa, e o requisito 6 pede que ela escolha. O que cada aba traz é o
 * que ela **leva junto** — que é o dado que a escolha precisa, e o que o
 * sistema de verdade não escreve.
 */
export function CaixaDeApresentar({
  abas, aba, aoTrocarAba, alvo, aoEscolherAlvo, comSom, aoTrocarSom,
  aoCancelar, aoCompartilhar,
}: {
  abas: AbaDeApresentar[];
  aba: AbaDeApresentar['id'];
  aoTrocarAba: (id: AbaDeApresentar['id']) => void;
  alvo?: string;
  aoEscolherAlvo: (a: string) => void;
  comSom: boolean;
  aoTrocarSom?: (v: boolean) => void;
  aoCancelar: () => void;
  aoCompartilhar?: () => void;
}) {
  const atual = abas.find(a => a.id === aba);
  return (
    <div className="re-fundo">
      <div className="re-dialogo" role="dialog" aria-label="Escolher o que compartilhar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>Escolha o que compartilhar</h3>
          <button type="button" className="re-bt-claro" aria-label="Fechar" onClick={aoCancelar}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="re-abas">
          {abas.map(a => {
            const Icone = ICONE_DA_ABA[a.id];
            return (
              <button key={a.id} type="button" className="re-aba" aria-pressed={a.id === aba}
                onClick={() => aoTrocarAba(a.id)}>
                <Icone className="w-4 h-4" style={{ display: 'inline', marginRight: 6 }} />
                {a.nome}
              </button>
            );
          })}
        </div>
        {atual && <p className="re-nota" style={{ marginBottom: 10 }}>{atual.leva}</p>}
        {atual?.alvos.map(a => (
          <button key={a} type="button" className="re-alvo" aria-pressed={a === alvo}
            onClick={() => aoEscolherAlvo(a)}>
            <Monitor className="w-4 h-4" /> {a}
          </button>
        ))}
        {aoTrocarSom && (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '10px 0' }}>
            <input type="checkbox" checked={comSom}
              onChange={e => aoTrocarSom(e.target.checked)} />
            <span>Compartilhar também o áudio</span>
          </label>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button type="button" className="re-bt-claro" onClick={aoCancelar}>Cancelar</button>
          <button type="button" className="re-bt-claro" data-principal="sim"
            onClick={aoCompartilhar} disabled={!aoCompartilhar}>
            Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── A sala de espera ─────────────────────────────────────────────────────── */

/**
 * O pedido de quem está esperando para entrar.
 *
 * Ele aparece no palco, e não numa aba — porque é onde ele precisa ser visto.
 * Num programa de verdade ele some sozinho em alguns segundos, e é por isso
 * que a pessoa fica quinze minutos do lado de fora: quem conduz está olhando
 * o que está apresentando.
 */
export function PedidoDeEntrar({ quem, aoAdmitir, aoRecusar }: {
  quem: string;
  aoAdmitir?: () => void;
  aoRecusar?: () => void;
}) {
  return (
    <div className="re-faixa">
      <span style={{ flex: 1 }}><strong>{quem}</strong> quer entrar na reunião.</span>
      <button type="button" className="re-bt" data-principal="sim"
        onClick={aoAdmitir} disabled={!aoAdmitir}>
        Admitir
      </button>
      <button type="button" className="re-bt" onClick={aoRecusar} disabled={!aoRecusar}>
        Recusar
      </button>
    </div>
  );
}

export function BotaoDaSala({ principal, children, ...resto }: {
  principal?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="re-bt" data-principal={principal ? 'sim' : undefined} {...resto}>
      {children}
    </button>
  );
}
