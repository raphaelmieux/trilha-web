import type React from 'react';
import { type CelulaDoMes, NOMES_DOS_DIAS } from './agenda';
import {
  AlignLeft, Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock, Globe,
  Link2, MapPin, Plus, Repeat, Settings, Share2, Users, Video, X,
} from 'lucide-react';

/*
 * A janela do calendário, em peças.
 *
 * ── Por que ela nasce separada ───────────────────────────────────────────
 * Ela é extraída **antes** de a cópia existir, que é a decisão de `word.tsx`,
 * `excel.tsx`, `explorer.tsx`, `leitorDePdf.tsx`, `correio.tsx` e `nuvem.tsx`,
 * pelo motivo escrito nos seis: duas cópias divergem no primeiro ajuste, e a
 * plataforma passa a mostrar dois calendários diferentes. Hoje só a CC-ES007
 * usa; a CC-ES012 já está anunciada apontando para esta vereda.
 *
 * ── E ela não imita marca ────────────────────────────────────────────────
 * Google Calendar, Outlook e o calendário do celular não se parecem, e
 * compartilham um **arranjo**: o mês no alto com as setas, a lateral com o
 * mini-mês e a lista de calendários, a grade no meio com os eventos em
 * etiqueta, e a caixa do evento em linhas com um ícone cada. É esse arranjo
 * que está aqui, do jeito que `ide.tsx` faz com o editor de código.
 *
 * ── O que fica aqui e o que fica em cada laboratório ─────────────────────
 * Aqui fica o que é do **programa**: como um dia se desenha, onde ficam as
 * setas, o que a caixa do evento tem. Lá fica o que é do **exercício**: que
 * eventos existem, que tarefas se cobram, o que cada botão faz com eles.
 *
 * Nenhuma peça guarda estado. Uma grade com mês próprio obrigaria os dois
 * lados a concordar sobre o mesmo mês, que é a forma mais rápida de mostrarem
 * coisas diferentes.
 *
 * ── E a peça aparece pela presença do setter ─────────────────────────────
 * É a regra do `aoBuscar` do Explorador e do `aoPreencher` da grade do Excel:
 * o botão Criar só existe quando o laboratório entrega `aoCriar`, e o item de
 * compartilhar um calendário só quando ele entrega `aoCompartilhar`. Prometer
 * um gesto que a lição não faz é o que ensina a desconfiar do programa.
 */

/* As cores são as do calendário, e não as da plataforma: dentro de uma janela
   clara, um botão com a cor da plataforma seria a única peça fora do lugar. E
   a superfície clara diz a própria cor, senão os títulos da plataforma — que
   são quase brancos — somem em cima do papel. */
export const CSS_DO_CALENDARIO = `
.ca-janela {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  background: #FFFFFF; color: #202124;
  font-family: system-ui, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13.5px;
}
.ca-janela h1, .ca-janela h2, .ca-janela h3, .ca-janela h4 { color: #202124; }
.ca-topo {
  display: flex; align-items: center; gap: 10px; padding: 8px 14px;
  border-bottom: 1px solid #DADCE0; background: #FFFFFF; flex-wrap: wrap;
}
.ca-mes { font-size: 17px; font-weight: 600; margin-right: 6px; }
.ca-corpo { flex: 1; min-height: 0; display: flex; }
.ca-lado {
  width: 212px; flex: none; padding: 12px 10px; border-right: 1px solid #DADCE0;
  overflow: auto;
}
.ca-criar {
  display: inline-flex; align-items: center; gap: 10px; padding: 12px 20px;
  border-radius: 999px; background: #FFFFFF; color: #3C4043; border: 1px solid #DADCE0;
  box-shadow: 0 1px 3px rgba(60,64,67,.25); font-size: 14px; cursor: pointer;
  margin-bottom: 16px;
}
.ca-criar:hover { background: #F1F3F4; }
.ca-secao { font-size: 12px; color: #5F6368; margin: 12px 0 6px; font-weight: 600; }
.ca-item {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 6px 8px; border-radius: 6px; font-size: 13px; color: #202124;
}
.ca-item:hover { background: #F1F3F4; }
.ca-ponto { width: 12px; height: 12px; border-radius: 3px; flex: none; }

.ca-grade { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: auto; }
.ca-semana-nomes {
  display: grid; grid-template-columns: repeat(7, minmax(0, 1fr));
  border-bottom: 1px solid #DADCE0;
}
.ca-semana-nomes span {
  text-align: center; padding: 6px 0; font-size: 11px; color: #70757A;
  text-transform: uppercase; letter-spacing: .06em;
}
.ca-mes-grade {
  flex: 1; min-height: 0; display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr)); grid-auto-rows: minmax(92px, 1fr);
}
.ca-dia {
  border-right: 1px solid #E8EAED; border-bottom: 1px solid #E8EAED;
  padding: 4px; display: flex; flex-direction: column; gap: 3px; min-width: 0;
  background: #FFFFFF; text-align: left;
}
.ca-dia[data-fora="sim"] { background: #FAFAFA; color: #9AA0A6; }
.ca-dia-numero {
  align-self: center; font-size: 12px; width: 24px; height: 24px; flex: none;
  display: flex; align-items: center; justify-content: center; border-radius: 999px;
}
.ca-dia[data-hoje="sim"] .ca-dia-numero { background: #1A73E8; color: #FFFFFF; font-weight: 700; }
.ca-chip {
  display: flex; align-items: center; gap: 5px; width: 100%; text-align: left;
  border: none; border-radius: 5px; padding: 2px 6px; font-size: 11.5px;
  background: #1A73E8; color: #FFFFFF; cursor: pointer;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ca-chip:hover { filter: brightness(.92); }
.ca-chip[data-tom="claro"] { background: #E8F0FE; color: #174EA6; }

/* ── A caixa do evento ───────────────────────────────────────────────────── */
.ca-caixa { flex: 1; min-width: 0; overflow: auto; padding: 16px 20px; }
.ca-linha-caixa {
  display: flex; gap: 12px; align-items: flex-start; padding: 8px 0;
  border-bottom: 1px solid #F1F3F4;
}
.ca-linha-caixa > svg { flex: none; margin-top: 4px; color: #5F6368; }
.ca-linha-miolo { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.ca-campo {
  border: 1px solid #DADCE0; border-radius: 6px; padding: 7px 10px;
  font-size: 13.5px; color: #202124; background: #FFFFFF; width: 100%; font-family: inherit;
}
.ca-campo:focus { outline: none; border-color: #1A73E8; box-shadow: 0 0 0 1px #1A73E8; }
.ca-campo-titulo { font-size: 20px; border: none; border-bottom: 1px solid #DADCE0; border-radius: 0; padding: 6px 2px; }
.ca-campo-titulo:focus { box-shadow: none; border-bottom-color: #1A73E8; }
.ca-dica { font-size: 11.5px; color: #5F6368; }
.ca-fila { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

.ca-bt {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px;
  border: 1px solid #DADCE0; border-radius: 6px; background: #FFFFFF;
  font-size: 13px; color: #202124; cursor: pointer;
}
.ca-bt:hover { background: #F1F3F4; }
.ca-bt[data-principal="sim"] { background: #1A73E8; border-color: #1A73E8; color: #FFFFFF; }
.ca-bt[data-principal="sim"]:hover { background: #185ABC; }
/*
  A regra do desligado vem **depois** da do principal, e não antes.

  As duas têm a mesma especificidade, então escrita antes ela perde: o botão
  principal desligado sairia azul e branco, com cara de clicável, e clicar não
  faria nada — que é o que ensina a desconfiar do programa. É a mesma ordem
  que a CC-ES001, a CC-ES004 e a CC-ES005 precisaram, e errá-la não estoura
  nada. E ela troca o **fundo**, e não só a letra: um retângulo azul continua
  parecendo botão por mais clara que fique a palavra dentro dele.
*/
.ca-bt:disabled, .ca-bt[data-principal="sim"]:disabled {
  background: #F1F3F4; border-color: #E0E0E0; color: #9AA0A6; cursor: not-allowed;
}

/* ── A grade de disponibilidade ──────────────────────────────────────────── */
.ca-disp { overflow: auto; }
.ca-disp table { border-collapse: collapse; font-size: 11.5px; }
.ca-disp th, .ca-disp td {
  border: 1px solid #E8EAED; padding: 0; height: 26px; min-width: 34px; text-align: center;
}
.ca-disp th.ca-quem {
  min-width: 156px; text-align: left; padding: 0 8px; font-weight: 600;
  position: sticky; left: 0; background: #FFFFFF; z-index: 1;
}
.ca-celula { width: 100%; height: 26px; display: block; }
.ca-celula[data-estado="livre"] { background: #FFFFFF; }
.ca-celula[data-estado="ocupado"] { background: #C6DAFC; }
/*
  Sem acesso não é livre e não é ocupado: é hachura, que é como o calendário de
  verdade desenha. Pintar de branco diria que a pessoa está livre — que é
  justamente a afirmação que ninguém tem como fazer, e o requisito 5.5 inteiro.
*/
.ca-celula[data-estado="sem-acesso"] {
  background: repeating-linear-gradient(45deg, #F1F3F4 0 4px, #DADCE0 4px 8px);
}

/* ── Diálogos ────────────────────────────────────────────────────────────── */
.ca-fundo {
  position: absolute; inset: 0; background: rgba(32,33,36,.45);
  display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 20;
}
.ca-dialogo {
  background: #FFFFFF; color: #202124; border-radius: 10px; padding: 18px 20px;
  width: min(520px, 100%); max-height: 88%; overflow: auto;
  box-shadow: 0 8px 28px rgba(0,0,0,.3);
}
.ca-opcao {
  display: flex; gap: 10px; align-items: flex-start; width: 100%; text-align: left;
  padding: 10px 12px; border: 1px solid #DADCE0; border-radius: 8px; background: #FFFFFF;
  cursor: pointer; color: #202124;
}
.ca-opcao:hover { background: #F1F3F4; }
.ca-opcao[aria-pressed="true"] { border-color: #1A73E8; background: #E8F0FE; }

.ca-aviso {
  border-radius: 8px; padding: 10px 12px; font-size: 12.5px;
  background: #FEF7E0; border: 1px solid #F1D68C; color: #202124;
}
.ca-aviso[data-tom="ruim"] { background: #FCE8E6; border-color: #F0B4AE; }
.ca-aviso[data-tom="bom"] { background: #E6F4EA; border-color: #A8D5B5; }

@media (max-width: 760px) {
  /*
    A lateral deita numa fileira no alto: uma coluna de 212px ao lado da grade
    deixa o mês sem largura nenhuma, e ler o mês é o que quase toda lição pede.
    As peças continuam todas ali — reduzir a tela nunca reduz o que dá para
    fazer nela.
  */
  .ca-corpo { flex-direction: column; }
  .ca-lado {
    width: auto; display: flex; align-items: center; gap: 6px; overflow-x: auto;
    border-right: none; border-bottom: 1px solid #DADCE0; padding: 8px;
  }
  .ca-criar { margin: 0 6px 0 0; padding: 8px 14px; flex: none; }
  .ca-secao { display: none; }
  .ca-item { width: auto; flex: none; white-space: nowrap; }
  .ca-mes-grade { grid-auto-rows: minmax(68px, auto); }
  .ca-dia-numero { align-self: flex-start; }
  /*
    E o diálogo sobe, porque a cápsula de tarefas da plataforma mora no canto
    de baixo: centrado, Cancelar e Confirmar ficam debaixo dela. A regra vem
    **depois** da que centra — as duas têm a mesma especificidade, e escrita
    antes ela não valeria nada, sem nada estourar. É o conserto que a CC-ES001,
    a CC-ES004 e a CC-ES005 já fizeram.
  */
  .ca-fundo { align-items: flex-start; padding-top: 12px; }
}
`;

/* ── A barra de cima ──────────────────────────────────────────────────────── */

export type VistaDoCalendario = 'mes' | 'dia';

/**
 * O topo: o mês, as setas, Hoje e a troca de vista.
 *
 * As setas e o Hoje aparecem sempre, e ficam desligados quando o laboratório
 * não entrega a função — que é o que um programa faz quando o comando não cabe
 * no que está aberto. Escondê-los ensinaria que o programa muda de tamanho
 * conforme a tarefa.
 */
export function TopoDoCalendario({
  titulo, aoAnterior, aoProximo, aoHoje, vista, aoTrocarVista, aoAbrirConfiguracoes, extra,
}: {
  titulo: string;
  aoAnterior?: () => void;
  aoProximo?: () => void;
  aoHoje?: () => void;
  vista?: VistaDoCalendario;
  aoTrocarVista?: (v: VistaDoCalendario) => void;
  aoAbrirConfiguracoes?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="ca-topo">
      <Calendar className="w-5 h-5" style={{ color: '#1A73E8' }} />
      <span style={{ fontWeight: 600 }}>Calendário</span>
      <button type="button" className="ca-bt" onClick={aoHoje} disabled={!aoHoje}>Hoje</button>
      <button type="button" className="ca-bt" aria-label="Mês anterior"
        onClick={aoAnterior} disabled={!aoAnterior}>
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button type="button" className="ca-bt" aria-label="Próximo mês"
        onClick={aoProximo} disabled={!aoProximo}>
        <ChevronRight className="w-4 h-4" />
      </button>
      <span className="ca-mes">{titulo}</span>
      {aoTrocarVista && (
        <div className="ca-fila">
          {(['mes', 'dia'] as VistaDoCalendario[]).map(v => (
            <button key={v} type="button" className="ca-bt"
              data-principal={v === vista ? 'sim' : undefined}
              onClick={() => aoTrocarVista(v)}>
              {v === 'mes' ? 'Mês' : 'Dia'}
            </button>
          ))}
        </div>
      )}
      <span style={{ marginLeft: 'auto' }} />
      {extra}
      {aoAbrirConfiguracoes && (
        <button type="button" className="ca-bt" aria-label="Configurações"
          onClick={aoAbrirConfiguracoes}>
          <Settings className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/* ── A lateral ────────────────────────────────────────────────────────────── */

export interface ItemDaLateral {
  id: string;
  nome: string;
  cor: string;
  /** Marcado quer dizer que os eventos dele aparecem na grade. */
  ligado: boolean;
}

/**
 * A coluna da esquerda: Criar, e a lista dos calendários.
 *
 * O menu de três pontos de cada calendário é onde o compartilhamento mora nos
 * programas de verdade — e é por isso que o requisito 5.4 existe como
 * demonstração: ninguém acha sozinho. Promovê-lo a um botão na superfície
 * seria a plataforma passando por cima do gesto que a lição existe para fazer
 * alguém encontrar.
 */
export function LateralDoCalendario({ aoCriar, itens, aoLigar, aoCompartilhar, extra }: {
  aoCriar?: () => void;
  itens: ItemDaLateral[];
  aoLigar?: (id: string, ligado: boolean) => void;
  aoCompartilhar?: (id: string) => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="ca-lado">
      {aoCriar && (
        <button type="button" className="ca-criar" onClick={aoCriar}>
          <Plus className="w-4 h-4" /> Criar
        </button>
      )}
      <p className="ca-secao">Meus calendários</p>
      {itens.map(i => (
        <div key={i.id} className="ca-item">
          <input type="checkbox" checked={i.ligado} aria-label={`Mostrar ${i.nome}`}
            onChange={e => aoLigar?.(i.id, e.target.checked)} disabled={!aoLigar} />
          <span className="ca-ponto" style={{ background: i.cor }} />
          <span style={{ flex: 1, minWidth: 0 }}>{i.nome}</span>
          {aoCompartilhar && (
            <button type="button" className="ca-bt" style={{ padding: '3px 7px' }}
              aria-label={`Opções de ${i.nome}`} onClick={() => aoCompartilhar(i.id)}>
              <Share2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      {extra}
    </div>
  );
}

/* ── A grade do mês ───────────────────────────────────────────────────────── */

export function GradeDoMes({ celulas, aoClicarNoDia, chipsDoDia }: {
  celulas: CelulaDoMes[];
  aoClicarNoDia?: (dia: string) => void;
  chipsDoDia: (dia: string) => React.ReactNode;
}) {
  return (
    <div className="ca-grade">
      <div className="ca-semana-nomes" aria-hidden="true">
        {NOMES_DOS_DIAS.map(n => <span key={n}>{n}</span>)}
      </div>
      <div className="ca-mes-grade">
        {celulas.map(c => (
          <div key={c.dia} className="ca-dia"
            data-fora={c.doMes ? undefined : 'sim'} data-hoje={c.hoje ? 'sim' : undefined}>
            {aoClicarNoDia
              ? (
                <button type="button" className="ca-dia-numero"
                  aria-label={`Criar evento em ${c.dia}`} onClick={() => aoClicarNoDia(c.dia)}>
                  {Number(c.dia.slice(8))}
                </button>
              )
              : <span className="ca-dia-numero">{Number(c.dia.slice(8))}</span>}
            {chipsDoDia(c.dia)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Um evento na grade: a hora e o título, que é o que cabe. */
export function ChipDeEvento({ titulo, hora, cor, tom, aoAbrir }: {
  titulo: string;
  hora?: string;
  cor?: string;
  tom?: 'claro';
  aoAbrir?: () => void;
}) {
  const miolo = <>{hora && <strong>{hora}</strong>}<span>{titulo}</span></>;
  return aoAbrir
    ? (
      <button type="button" className="ca-chip" data-tom={tom}
        style={cor && !tom ? { background: cor } : undefined}
        aria-label={`Abrir: ${titulo}`} onClick={aoAbrir}>
        {miolo}
      </button>
    )
    : (
      <span className="ca-chip" data-tom={tom} style={cor && !tom ? { background: cor } : undefined}>
        {miolo}
      </span>
    );
}

/* ── A caixa do evento ────────────────────────────────────────────────────── */

/*
  O mapa de ícones fica aqui e **não sai daqui**: ele é aparência, e exportar
  um mapa que ninguém de fora lê é oferecer segunda fonte para a mesma coisa.
  É o corte de `capturaDoScanner.ts`, onde o conteúdo desceu para o modelo e o
  ícone ficou na tela — e foi o próprio lint que o apontou aqui também.
*/
const ICONES_DA_CAIXA = {
  hora: Clock,
  local: MapPin,
  descricao: AlignLeft,
  convidados: Users,
  fuso: Globe,
  repete: Repeat,
  reuniao: Video,
  vinculo: Link2,
  dia: CalendarDays,
};

/** Uma linha da caixa do evento: o ícone à esquerda, o campo à direita. */
export function LinhaDaCaixa({ icone, children }: {
  icone?: keyof typeof ICONES_DA_CAIXA;
  children: React.ReactNode;
}) {
  const Icone = icone ? ICONES_DA_CAIXA[icone] : undefined;
  return (
    <div className="ca-linha-caixa">
      {Icone ? <Icone className="w-4 h-4" /> : <span style={{ width: 16, flex: 'none' }} />}
      <div className="ca-linha-miolo">{children}</div>
    </div>
  );
}

export function CaixaDeEvento({ titulo, aoFechar, acoes, children }: {
  titulo: string;
  aoFechar?: () => void;
  acoes?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="ca-caixa">
      <div className="ca-fila" style={{ marginBottom: 6 }}>
        {aoFechar && (
          <button type="button" className="ca-bt" aria-label="Voltar para o calendário"
            onClick={aoFechar}>
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
        )}
        <h2 style={{ fontSize: 17, fontWeight: 600 }}>{titulo}</h2>
      </div>
      {children}
      {acoes && <div className="ca-fila" style={{ marginTop: 14 }}>{acoes}</div>}
    </div>
  );
}

/**
 * O seletor de fuso.
 *
 * Ele mostra o **nome** do fuso e a cidade, e nunca um deslocamento escrito à
 * mão: o Brasil acabou com o horário de verão em 2019, mas propostas de
 * trazê-lo de volta aparecem, e "-3" viraria mentira quatro meses por ano sem
 * nada estourar. É a regra de `ofensiva.ts`, e é a mesma razão de ele existir
 * como campo em vez de linha de descrição.
 */
export function SeletorDeFuso({ valor, opcoes, aoMudar, rotulo = 'Fuso horário' }: {
  valor: string;
  opcoes: { id: string; nome: string }[];
  aoMudar?: (v: string) => void;
  rotulo?: string;
}) {
  return (
    <select className="ca-campo" value={valor} aria-label={rotulo}
      onChange={e => aoMudar?.(e.target.value)} disabled={!aoMudar}>
      {opcoes.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
    </select>
  );
}

/* ── Compartilhar o calendário ────────────────────────────────────────────── */

export interface LinhaDeAcesso {
  quem: string;
  nome: string;
  nivel: string;
}

/**
 * Quem tem acesso ao calendário, e em que nível.
 *
 * Cada opção do seletor traz escrito o que ela **não** deixa fazer, porque é
 * isso que separa os quatro níveis — e sem esse lado a fileira seria quatro
 * palavras parecidas, e a escolha do requisito 5.4 viraria "clicar na
 * primeira". É a decisão dos métodos de duas etapas da CC-ES005.
 */
export function AcessoAoCalendario({ linhas, niveis, aoMudar, aoTirar, rodape }: {
  linhas: LinhaDeAcesso[];
  niveis: { id: string; nome: string; naoDeixa: string }[];
  aoMudar?: (quem: string, nivel: string) => void;
  aoTirar?: (quem: string) => void;
  rodape?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {linhas.length === 0 && (
        <p className="ca-dica">Ninguém além de você tem acesso a este calendário.</p>
      )}
      {linhas.map(l => {
        const n = niveis.find(x => x.id === l.nivel);
        return (
          <div key={l.quem} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="ca-fila">
              <span style={{ flex: 1, minWidth: 0 }}>{l.nome}</span>
              <select className="ca-campo" style={{ width: 'auto' }} value={l.nivel}
                aria-label={`Nível de ${l.nome}`}
                onChange={e => aoMudar?.(l.quem, e.target.value)} disabled={!aoMudar}>
                {niveis.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}
              </select>
              <button type="button" className="ca-bt" aria-label={`Tirar o acesso de ${l.nome}`}
                onClick={() => aoTirar?.(l.quem)} disabled={!aoTirar}>
                <X className="w-3 h-3" />
              </button>
            </div>
            {n && <p className="ca-dica">{n.naoDeixa}</p>}
          </div>
        );
      })}
      {rodape}
    </div>
  );
}

/* ── A grade de disponibilidade ───────────────────────────────────────────── */

export interface ColunaDaGrade {
  de: string;
  ate: string;
}

/**
 * A grade de horários dos convidados.
 *
 * Três estados e não dois: livre, ocupado e **sem acesso**, que é hachurado.
 * Desenhar quem não compartilhou como livre seria o programa afirmando uma
 * coisa que ele não tem como saber — e livre e desconhecido cabem no mesmo
 * espaço em branco, que é o requisito 5.5 inteiro.
 */
export function GradeDeDisponibilidade({
  pessoas, colunas, estadoDe, aoEscolher, escolhida,
}: {
  pessoas: { id: string; nome: string; nota?: string }[];
  colunas: ColunaDaGrade[];
  estadoDe: (pessoa: string, c: ColunaDaGrade) => 'livre' | 'ocupado' | 'sem-acesso';
  aoEscolher?: (c: ColunaDaGrade) => void;
  escolhida?: ColunaDaGrade;
}) {
  return (
    <div className="ca-disp">
      <table>
        <thead>
          <tr>
            <th className="ca-quem">Quem</th>
            {colunas.map(c => (
              <th key={c.de} scope="col">
                {aoEscolher
                  ? (
                    <button type="button" className="ca-bt"
                      style={{ padding: '2px 4px', fontSize: 10.5, border: 'none' }}
                      data-principal={escolhida?.de === c.de ? 'sim' : undefined}
                      aria-label={`Marcar às ${c.de}`} onClick={() => aoEscolher(c)}>
                      {c.de}
                    </button>
                  )
                  : c.de}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pessoas.map(p => (
            <tr key={p.id}>
              <th className="ca-quem" scope="row">
                {p.nome}
                {p.nota && <span className="ca-dica"> — {p.nota}</span>}
              </th>
              {colunas.map(c => (
                <td key={c.de}>
                  <span className="ca-celula" data-estado={estadoDe(p.id, c)}
                    aria-label={`${p.nome}, ${c.de}: ${estadoDe(p.id, c)}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Diálogos e avisos ────────────────────────────────────────────────────── */

/**
 * A caixa que o calendário abre quando o evento faz parte de uma série.
 *
 * As três opções vêm em letra do mesmo tamanho, e **é** assim no programa de
 * verdade: nenhuma delas é destacada, e é por isso que "todos os eventos"
 * apaga o ano de tanta gente. Destacar a certa aqui seria a plataforma
 * escolhendo pela pessoa.
 */
export function DialogoDoCalendario({ titulo, explica, aoFechar, acoes, children }: {
  titulo: string;
  explica?: string;
  aoFechar?: () => void;
  acoes?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="ca-fundo">
      <div className="ca-dialogo" role="dialog" aria-label={titulo}>
        <div className="ca-fila" style={{ marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>{titulo}</h3>
          {aoFechar && (
            <button type="button" className="ca-bt" aria-label="Fechar" onClick={aoFechar}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {explica && <p className="ca-dica" style={{ marginBottom: 10 }}>{explica}</p>}
        {children}
        {acoes && <div className="ca-fila" style={{ marginTop: 14 }}>{acoes}</div>}
      </div>
    </div>
  );
}

export function OpcaoDoDialogo({ rotulo, detalhe, escolhida, aoEscolher }: {
  rotulo: string;
  detalhe?: string;
  escolhida?: boolean;
  aoEscolher: () => void;
}) {
  return (
    <button type="button" className="ca-opcao" aria-pressed={!!escolhida} onClick={aoEscolher}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontWeight: 600 }}>{rotulo}</span>
        {detalhe && <span className="ca-dica">{detalhe}</span>}
      </span>
    </button>
  );
}

/**
 * O aviso do programa.
 *
 * Ele diz o que o **programa** sabe, e nunca se a tarefa está cumprida — é a
 * regra da régua de status do Word, do painel de Problemas do Python e do
 * aviso do digitalizador. "Este evento se repete" é do calendário; "sua lição
 * está errada" seria nosso.
 */
export function AvisoDoCalendario({ tom, children }: {
  tom?: 'bom' | 'ruim';
  children: React.ReactNode;
}) {
  return <p className="ca-aviso" data-tom={tom}>{children}</p>;
}

export function BotaoDoCalendario({ principal, children, ...resto }: {
  principal?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="ca-bt" data-principal={principal ? 'sim' : undefined} {...resto}>
      {children}
    </button>
  );
}
