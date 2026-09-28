/**
 * A janela do construtor de formulários da CC-ES008.
 *
 * ── Ela não imita marca ──────────────────────────────────────────────────
 * O Google Forms, o Microsoft Forms e o Typeform não se parecem, e mesmo assim
 * compartilham um **arranjo**: o nome do formulário em cima com duas abas ao
 * lado — Perguntas e Respostas, com a contagem na segunda —, um cartão por
 * pergunta, o tipo num menu dentro do cartão, o pé do cartão com "Obrigatório"
 * e o menu de três pontos onde a validação se esconde, e a coluna flutuante de
 * acrescentar ao lado do cartão escolhido. É esse arranjo que está aqui, como
 * `ide.tsx` faz com o editor de código.
 *
 * ── O nome do arquivo ────────────────────────────────────────────────────
 * `formularios.tsx` ficaria a uma letra de `formulario.ts`, que é o motor — e
 * uma troca de import entre os dois compila nos dois sentidos enquanto os nomes
 * exportados não colidirem. O nome longo custa um pouco de digitação e não
 * custa uma tarde.
 *
 * ── O que a janela não pode dizer ────────────────────────────────────────
 * **Ela nunca desenha se um campo é dado pessoal.** O requisito 7 pede que o
 * desbravador identifique quais dados coletados são pessoais; escrever a
 * resposta ao lado de cada pergunta resolveria o requisito numa olhada, e
 * resolveria só para quem olha — quem usa leitor de tela ficaria sem a
 * pergunta e sem a resposta. É a decisão da linha da nuvem que não escreve o
 * papel de ninguém, na CC-ES006.
 *
 * **E a tabela de respostas mostra o que foi digitado, cru.** As quatro
 * grafias do Falcão aparecem como quatro grafias, os campos em branco aparecem
 * em branco, e o número com ponto aparece com ponto. Normalizar na tela — ou
 * marcar o que está esquisito — poria na nossa tela a resposta que o requisito
 * 5.2 manda o desbravador achar, e faria a tabela dinâmica virar enfeite.
 *
 * ── E as peças aparecem pela presença do setter ──────────────────────────
 * É a regra do `aoBuscar` do Explorador: o nome do formulário vira campo de
 * digitar quando o laboratório entrega `aoMudarNome`, o botão de criar planilha
 * só existe com `aoCriarPlanilha`, e o item de baixar CSV só com `aoBaixarCsv`.
 * Desenhá-los sempre prometeria gestos que a lição daquele módulo não faz, e
 * gesto sem efeito é o que ensina a desconfiar do programa.
 */

import { useId } from 'react';
import {
  AlignLeft, Calendar, CheckSquare, ChevronDown, Circle, Copy, Eye, Hash,
  List, MoreVertical, Plus, Send, Sheet, Trash2, Type,
} from 'lucide-react';
import {
  type Campo, type TipoDeResposta,
  NOME_DO_TIPO, SEPARADOR_DE_ESCOLHAS, temOpcoes,
} from './formulario';

/* ── Aparência ────────────────────────────────────────────────────────────── */

export const CSS_DO_CONSTRUTOR = `
.fb-janela {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  background: #F0EBF8; color: #202124;
  font-family: system-ui, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13.5px;
}
/* O roxo é a cor deste tipo de programa, como o azul é do Word e o verde do
   Excel: é por ele que o desbravador reconhece qual abriu. */
.fb-topo {
  display: flex; align-items: center; gap: 12px; padding: 8px 16px;
  background: #FFFFFF; border-bottom: 1px solid #DADCE0;
}
.fb-nome {
  font-size: 15px; font-weight: 500; color: #202124;
  background: transparent; border: none; border-bottom: 1px solid transparent;
  padding: 2px 2px; min-width: 200px; max-width: 420px; flex: 1;
}
.fb-nome:hover { border-bottom-color: #DADCE0; }
.fb-nome:focus { outline: none; border-bottom-color: #673AB7; }
.fb-nome[data-fixo="sim"] { border-bottom-color: transparent; cursor: default; }

.fb-abas { display: flex; gap: 4px; }
.fb-aba {
  background: transparent; border: none; border-bottom: 3px solid transparent;
  padding: 10px 14px 7px; font-size: 13.5px; color: #5F6368; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
}
.fb-aba[aria-selected="true"] { color: #673AB7; border-bottom-color: #673AB7; font-weight: 500; }
.fb-conta {
  background: #673AB7; color: #FFFFFF; border-radius: 9px; padding: 0 6px;
  font-size: 11px; line-height: 17px; min-width: 17px; text-align: center;
}

.fb-corpo { flex: 1; min-height: 0; overflow: auto; padding: 20px 0 48px; }
.fb-coluna { max-width: 700px; margin: 0 auto; padding: 0 16px; display: flex; flex-direction: column; gap: 14px; }

.fb-cartao {
  background: #FFFFFF; border: 1px solid #DADCE0; border-radius: 8px;
  padding: 20px 22px; position: relative;
}
/* A faixa roxa à esquerda é o que diz qual cartão está escolhido, e é a única
   coisa que muda — o cartão não cresce nem muda de cor, senão a lista pula
   debaixo do ponteiro a cada clique. */
.fb-cartao[data-ativo="sim"] { border-left: 6px solid #673AB7; padding-left: 17px; }
.fb-cartao[data-cabecalho="sim"] { border-top: 8px solid #673AB7; }

.fb-rotulo {
  font-size: 15px; color: #202124; background: #F8F9FA; border: none;
  border-bottom: 1px solid #DADCE0; padding: 8px 10px; width: 100%;
}
.fb-rotulo:focus { outline: none; border-bottom: 2px solid #673AB7; }
.fb-descricao { font-size: 13px; color: #5F6368; margin-top: 6px; }

.fb-linha-tipo { display: flex; gap: 12px; align-items: flex-start; margin-top: 4px; }
.fb-linha-tipo > :first-child { flex: 1; }

.fb-tipo {
  display: flex; align-items: center; gap: 8px; min-width: 190px;
  background: #FFFFFF; border: 1px solid #DADCE0; border-radius: 4px;
  padding: 8px 10px; font-size: 13.5px; color: #202124; cursor: pointer;
}
.fb-tipo:hover { background: #F8F9FA; }

.fb-menu {
  position: absolute; z-index: 5; background: #FFFFFF; border: 1px solid #DADCE0;
  border-radius: 4px; box-shadow: 0 2px 10px rgba(60,64,67,.3); padding: 6px 0;
  min-width: 210px;
}
.fb-item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  background: transparent; border: none; text-align: left;
  padding: 8px 14px; font-size: 13.5px; color: #202124; cursor: pointer;
}
.fb-item:hover { background: #F1F3F4; }
.fb-item[aria-checked="true"] { background: #E8DEF8; }

/* O rótulo quando ele é só de leitura. É o data-fixo do nome do formulário,
   pelo mesmo motivo: campo com cara de editável promete um gesto sem efeito. */
.fb-rotulo[data-fixo="sim"] {
  background: transparent; border-bottom-color: transparent; padding-left: 0;
}

/* A regra de validação, escrita no cartão depois de salva. Sem ela, ligar a
   validação não muda nada na tela do construtor, e o gesto parece não ter
   acontecido — é o interruptor que se liga e nunca se vê agir. */
.fb-validacao-resumo {
  margin-top: 12px; font-size: 12.5px; color: #5F6368;
  border-left: 3px solid #673AB7; padding-left: 10px;
}

/* Os campos de dentro de um diálogo. */
.fb-campo { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.fb-campo > span { font-size: 12px; color: #5F6368; }
.fb-campo select, .fb-campo input {
  border: 1px solid #DADCE0; border-radius: 4px; padding: 7px 9px;
  font-size: 13.5px; color: #202124; background: #FFFFFF;
}
.fb-dois { display: flex; gap: 12px; }
.fb-dois > * { flex: 1; }

.fb-opcoes { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.fb-opcao { display: flex; align-items: center; gap: 10px; }
.fb-opcao input {
  flex: 1; border: none; border-bottom: 1px solid transparent; padding: 4px 2px;
  font-size: 13.5px; color: #202124; background: transparent;
}
.fb-opcao input:focus { outline: none; border-bottom-color: #673AB7; }

.fb-pe {
  display: flex; align-items: center; justify-content: flex-end; gap: 6px;
  margin-top: 18px; padding-top: 12px; border-top: 1px solid #E8EAED;
}
.fb-pe-espaco { flex: 1; }

/* O interruptor de "Obrigatório". Ele diz o estado pela posição da bolinha e
   pela palavra ao lado, e não só pela cor: é a regra da insígnia que tem forma
   e cor, aplicada a um controle. */
.fb-chave { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #5F6368; }
.fb-chave button {
  width: 34px; height: 14px; border-radius: 7px; border: none; position: relative;
  background: #BDC1C6; cursor: pointer; padding: 0;
}
.fb-chave button[aria-checked="true"] { background: #B39DDB; }
.fb-chave button::after {
  content: ''; position: absolute; top: -3px; left: -1px;
  width: 20px; height: 20px; border-radius: 50%; background: #F1F3F4;
  box-shadow: 0 1px 3px rgba(60,64,67,.4); transition: left .12s;
}
.fb-chave button[aria-checked="true"]::after { left: 15px; background: #673AB7; }

.fb-validacao {
  margin-top: 14px; padding: 12px 14px; background: #F8F9FA;
  border-radius: 4px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
}
.fb-validacao select, .fb-validacao input {
  border: 1px solid #DADCE0; border-radius: 4px; padding: 6px 8px;
  font-size: 13px; color: #202124; background: #FFFFFF;
}
.fb-validacao input { width: 92px; }

.fb-acrescentar {
  align-self: center; display: flex; gap: 6px; background: #FFFFFF;
  border: 1px solid #DADCE0; border-radius: 8px; padding: 6px;
}
.fb-acrescentar button {
  background: transparent; border: none; border-radius: 50%; padding: 8px;
  color: #5F6368; cursor: pointer; display: grid; place-items: center;
}
.fb-acrescentar button:hover { background: #F1F3F4; color: #202124; }

/* ── Respostas ── */
.fb-barra-respostas {
  display: flex; align-items: center; gap: 12px; padding: 14px 22px;
  background: #FFFFFF; border: 1px solid #DADCE0; border-radius: 8px;
}
.fb-barra-respostas h3 { margin: 0; font-size: 16px; font-weight: 400; color: #202124; }
.fb-tabela-caixa {
  background: #FFFFFF; border: 1px solid #DADCE0; border-radius: 8px; overflow: auto;
}
.fb-tabela { border-collapse: collapse; width: 100%; font-size: 12.5px; }
.fb-tabela th, .fb-tabela td {
  border: 1px solid #E8EAED; padding: 7px 10px; text-align: left;
  white-space: nowrap; color: #202124;
}
.fb-tabela th { background: #F8F9FA; font-weight: 500; position: sticky; top: 0; }
.fb-tabela tbody tr:nth-child(even) td { background: #FCFCFD; }

/* ── Prévia, que é o formulário como quem responde o vê ── */
.fb-previa { max-width: 640px; margin: 0 auto; padding: 0 16px; display: flex; flex-direction: column; gap: 12px; }
.fb-previa .fb-cartao { padding: 22px 24px; }
.fb-pergunta-titulo { font-size: 15px; color: #202124; margin: 0 0 12px; }
.fb-obrigatorio { color: #D93025; margin-left: 4px; }
.fb-resposta-campo {
  border: none; border-bottom: 1px solid #DADCE0; padding: 6px 2px;
  font-size: 13.5px; width: 100%; max-width: 380px; background: transparent; color: #202124;
}
.fb-resposta-campo:focus { outline: none; border-bottom: 2px solid #673AB7; }
.fb-escolha { display: flex; align-items: center; gap: 12px; padding: 5px 0; font-size: 13.5px; }
.fb-recusa { color: #D93025; font-size: 12.5px; display: flex; align-items: center; gap: 6px; margin-top: 8px; }

/* ── Botões, diálogo e aviso ── */
.fb-bt {
  border-radius: 4px; padding: 8px 16px; font-size: 13.5px; font-weight: 500;
  border: 1px solid #DADCE0; background: #FFFFFF; color: #673AB7; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px;
}
.fb-bt[data-principal="sim"] { background: #673AB7; color: #FFFFFF; border-color: #673AB7; }
/* Esta regra vem **depois** da do principal, e não antes: as duas têm a mesma
   especificidade, e escrita antes ela perderia — o botão desligado sairia roxo
   e branco, com cara de clicável, e clicar não faria nada. Foi o defeito que a
   CC-ES005 consertou nas duas janelas dela, e a trava lê a ordem na folha. */
.fb-bt:disabled {
  background: #F1F3F4; color: #9AA0A6; border-color: #E8EAED; cursor: not-allowed;
}

.fb-fundo {
  position: fixed; inset: 0; background: rgba(32,33,36,.5);
  display: flex; align-items: center; justify-content: center; z-index: 40; padding: 16px;
}
.fb-dialogo {
  background: #FFFFFF; border-radius: 8px; padding: 22px 24px; min-width: 300px;
  max-width: 460px; box-shadow: 0 4px 24px rgba(0,0,0,.3);
}
/* A plataforma pinta h1..h4 de quase branco, que está certo no aplicativo
   escuro dela e some em cima de papel: o diálogo diz a própria cor. */
.fb-dialogo h2, .fb-dialogo h3 { color: #202124; margin: 0 0 10px; font-size: 16px; font-weight: 500; }
.fb-dialogo p { color: #5F6368; font-size: 13px; margin: 0 0 14px; }
.fb-dialogo-pe { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }

.fb-aviso {
  display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px;
  border-radius: 4px; font-size: 13px; background: #FEF7E0; color: #5F4300;
  border: 1px solid #FDE293;
}
.fb-aviso[data-tom="erro"] { background: #FCE8E6; color: #7B231C; border-color: #F5C4BF; }
.fb-aviso[data-tom="bom"] { background: #E6F4EA; color: #17603A; border-color: #B7E1C4; }

@media (max-width: 760px) {
  .fb-topo { flex-wrap: wrap; gap: 8px; }
  .fb-nome { min-width: 0; }
  .fb-cartao { padding: 16px; }
  .fb-cartao[data-ativo="sim"] { padding-left: 12px; }
  .fb-linha-tipo { flex-direction: column; }
  .fb-tipo { min-width: 0; width: 100%; }
  /* A cápsula de tarefas da plataforma mora no canto de baixo: centrado, o
     diálogo mais alto termina debaixo dela, e vê-se o formulário inteiro sem
     ver como confirmar. Esta regra vem depois da que centra, e escrita antes
     não valeria nada — mesma especificidade. É o conserto que a CC-ES001, a
     CC-ES004 e a CC-ES005 já fizeram, e a trava confere a ordem. */
  .fb-fundo { align-items: flex-start; padding-top: 24px; }
}
`;

/* ── O ícone de cada tipo ─────────────────────────────────────────────────── */

const ICONE_DO_TIPO: Record<TipoDeResposta, typeof Type> = {
  'texto-curto': Type,
  paragrafo: AlignLeft,
  'escolha-unica': Circle,
  'varias-escolhas': CheckSquare,
  lista: List,
  numero: Hash,
  data: Calendar,
};

/**
 * O ícone fica aqui e **não sai daqui**.
 *
 * Exportar um mapa que ninguém de fora lê é oferecer segunda fonte para a
 * mesma coisa. É o corte de `capturaDoScanner.ts`, que o próprio lint apontou:
 * a lista de tipos e os nomes deles são conteúdo, e moram no motor; o desenho é
 * aparência, e mora na janela.
 */
export function IconeDoTipo({ tipo, size = 16 }: { tipo: TipoDeResposta; size?: number }) {
  const Icone = ICONE_DO_TIPO[tipo];
  return <Icone size={size} aria-hidden />;
}

/* ── Topo ─────────────────────────────────────────────────────────────────── */

export type AbaDoConstrutor = 'perguntas' | 'respostas';

export function TopoDoConstrutor({
  nome, aoMudarNome, aba, aoTrocarAba, respostas, aoPrever, aoEnviar,
}: {
  nome: string;
  /** Sem ele o nome é enfeite, e um campo editável prometeria um gesto sem efeito. */
  aoMudarNome?: (v: string) => void;
  aba: AbaDoConstrutor;
  aoTrocarAba: (a: AbaDoConstrutor) => void;
  respostas: number;
  aoPrever?: () => void;
  aoEnviar?: () => void;
}) {
  return (
    <div className="fb-topo">
      {aoMudarNome
        ? (
          <input
            className="fb-nome" value={nome} aria-label="Nome do formulário"
            onChange={e => aoMudarNome(e.target.value)}
          />
        )
        : <span className="fb-nome" data-fixo="sim">{nome}</span>}

      <div className="fb-abas" role="tablist">
        <button
          type="button" role="tab" className="fb-aba" aria-selected={aba === 'perguntas'}
          onClick={() => aoTrocarAba('perguntas')}
        >
          Perguntas
        </button>
        <button
          type="button" role="tab" className="fb-aba" aria-selected={aba === 'respostas'}
          onClick={() => aoTrocarAba('respostas')}
        >
          Respostas
          {/* A contagem fica na aba, como em todo formulário — é por ela que se
              sabe que chegou resposta sem entrar na aba. */}
          <span className="fb-conta">{respostas}</span>
        </button>
      </div>

      <div className="fb-pe-espaco" />
      {aoPrever && (
        <button type="button" className="fb-bt" onClick={aoPrever} title="Visualizar">
          <Eye size={16} aria-hidden /> Visualizar
        </button>
      )}
      {aoEnviar && (
        <button type="button" className="fb-bt" data-principal="sim" onClick={aoEnviar}>
          <Send size={16} aria-hidden /> Enviar
        </button>
      )}
    </div>
  );
}

/* ── Cartões ──────────────────────────────────────────────────────────────── */

export function CorpoDoConstrutor({ children }: { children: React.ReactNode }) {
  return <div className="fb-corpo"><div className="fb-coluna">{children}</div></div>;
}

export function CartaoDeCabecalho({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="fb-cartao" data-cabecalho="sim">
      <div style={{ fontSize: 22, color: '#202124' }}>{titulo}</div>
      <div className="fb-descricao">{descricao}</div>
    </div>
  );
}

export function CartaoDoConstrutor({ ativo, aoAtivar, children }: {
  ativo?: boolean;
  aoAtivar?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fb-cartao" data-ativo={ativo ? 'sim' : 'nao'}
      onClick={aoAtivar}
    >
      {children}
    </div>
  );
}

export function SeletorDeTipo({ tipo, aberto, aoAbrir, aoEscolher }: {
  tipo: TipoDeResposta;
  aberto: boolean;
  aoAbrir: () => void;
  aoEscolher: (t: TipoDeResposta) => void;
}) {
  const tipos = Object.keys(NOME_DO_TIPO) as TipoDeResposta[];
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button" className="fb-tipo" onClick={e => { e.stopPropagation(); aoAbrir(); }}
        aria-haspopup="menu" aria-expanded={aberto}
      >
        <IconeDoTipo tipo={tipo} />
        <span style={{ flex: 1, textAlign: 'left' }}>{NOME_DO_TIPO[tipo]}</span>
        <ChevronDown size={16} aria-hidden />
      </button>
      {aberto && (
        <div className="fb-menu" role="menu" style={{ right: 0, marginTop: 2 }}>
          {tipos.map(t => (
            <button
              key={t} type="button" className="fb-item" role="menuitemradio"
              aria-checked={t === tipo}
              onClick={e => { e.stopPropagation(); aoEscolher(t); }}
            >
              <IconeDoTipo tipo={t} />
              {NOME_DO_TIPO[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListaDeOpcoes({ tipo, opcoes, aoMudar, aoAcrescentar, aoTirar }: {
  tipo: TipoDeResposta;
  opcoes: string[];
  aoMudar?: (i: number, v: string) => void;
  aoAcrescentar?: () => void;
  aoTirar?: (i: number) => void;
}) {
  if (!temOpcoes(tipo)) return null;
  return (
    <div className="fb-opcoes">
      {opcoes.map((o, i) => (
        <div className="fb-opcao" key={i}>
          <IconeDoTipo tipo={tipo} />
          <input
            value={o} aria-label={`Opção ${i + 1}`}
            readOnly={!aoMudar}
            onChange={e => aoMudar?.(i, e.target.value)}
            onClick={e => e.stopPropagation()}
          />
          {aoTirar && opcoes.length > 1 && (
            <button
              type="button" className="fb-item" style={{ width: 'auto', padding: 4 }}
              aria-label={`Remover opção ${i + 1}`}
              onClick={e => { e.stopPropagation(); aoTirar(i); }}
            >
              <Trash2 size={15} aria-hidden />
            </button>
          )}
        </div>
      ))}
      {aoAcrescentar && (
        <div className="fb-opcao">
          <IconeDoTipo tipo={tipo} />
          <button
            type="button" className="fb-item" style={{ width: 'auto', padding: '2px 4px' }}
            onClick={e => { e.stopPropagation(); aoAcrescentar(); }}
          >
            Adicionar opção
          </button>
        </div>
      )}
    </div>
  );
}

export function PeDoCartao({
  obrigatorio, aoTrocarObrigatorio, aoDuplicar, aoExcluir, menu, aoAbrirMenu, extra,
}: {
  obrigatorio: boolean;
  aoTrocarObrigatorio?: () => void;
  aoDuplicar?: () => void;
  aoExcluir?: () => void;
  /** O conteúdo do menu de três pontos, quando ele está aberto. */
  menu?: React.ReactNode;
  aoAbrirMenu?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="fb-pe">
      <div className="fb-pe-espaco">{extra}</div>
      {aoDuplicar && (
        <button
          type="button" className="fb-item" style={{ width: 'auto', padding: 6 }}
          aria-label="Duplicar pergunta" onClick={e => { e.stopPropagation(); aoDuplicar(); }}
        >
          <Copy size={17} aria-hidden />
        </button>
      )}
      {aoExcluir && (
        <button
          type="button" className="fb-item" style={{ width: 'auto', padding: 6 }}
          aria-label="Excluir pergunta" onClick={e => { e.stopPropagation(); aoExcluir(); }}
        >
          <Trash2 size={17} aria-hidden />
        </button>
      )}
      {aoTrocarObrigatorio && (
        <span className="fb-chave">
          Obrigatório
          <button
            type="button" role="switch" aria-checked={obrigatorio}
            aria-label="Obrigatório"
            onClick={e => { e.stopPropagation(); aoTrocarObrigatorio(); }}
          />
        </span>
      )}
      {aoAbrirMenu && (
        <div style={{ position: 'relative' }}>
          <button
            type="button" className="fb-item" style={{ width: 'auto', padding: 6 }}
            aria-label="Mais opções" aria-haspopup="menu"
            onClick={e => { e.stopPropagation(); aoAbrirMenu(); }}
          >
            <MoreVertical size={17} aria-hidden />
          </button>
          {menu && (
            <div className="fb-menu" role="menu" style={{ right: 0, bottom: '100%', marginBottom: 4 }}>
              {menu}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ItemDoMenu({ marcado, children, aoClicar }: {
  marcado?: boolean;
  children: React.ReactNode;
  aoClicar: () => void;
}) {
  return (
    <button
      type="button" className="fb-item" role="menuitemcheckbox" aria-checked={!!marcado}
      onClick={e => { e.stopPropagation(); aoClicar(); }}
    >
      {children}
    </button>
  );
}

export function ColunaDeAcrescentar({ aoAcrescentar }: { aoAcrescentar: () => void }) {
  return (
    <div className="fb-acrescentar">
      <button type="button" aria-label="Adicionar pergunta" onClick={aoAcrescentar}>
        <Plus size={20} aria-hidden />
      </button>
    </div>
  );
}

/* ── Respostas ────────────────────────────────────────────────────────────── */

export function BarraDeRespostas({ total, aoCriarPlanilha, aoBaixarCsv, extra }: {
  total: number;
  /** Requisito 5.1. Sem ele, o botão não existe. */
  aoCriarPlanilha?: () => void;
  /** Requisito 5.4. */
  aoBaixarCsv?: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div className="fb-barra-respostas">
      <h3>{total} {total === 1 ? 'resposta' : 'respostas'}</h3>
      <div className="fb-pe-espaco">{extra}</div>
      {aoBaixarCsv && (
        <button type="button" className="fb-bt" onClick={aoBaixarCsv}>
          Baixar .csv
        </button>
      )}
      {aoCriarPlanilha && (
        <button type="button" className="fb-bt" data-principal="sim" onClick={aoCriarPlanilha}>
          <Sheet size={16} aria-hidden /> Criar planilha
        </button>
      )}
    </div>
  );
}

/**
 * A tabela de respostas, com o que foi digitado.
 *
 * Ela não normaliza, não apara e não marca o que está esquisito: as quatro
 * grafias do Falcão saem como quatro, o branco sai branco, e o número com
 * ponto sai com ponto. Qualquer uma dessas três coisas poria na nossa tela a
 * resposta que o requisito 5.2 manda o desbravador achar.
 */
export function TabelaDeRespostas({ cabecalho, linhas }: {
  cabecalho: string[];
  linhas: string[][];
}) {
  return (
    <div className="fb-tabela-caixa">
      <table className="fb-tabela">
        <thead>
          <tr>{cabecalho.map(h => <th key={h} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr key={i}>{l.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Prévia: o formulário como quem responde o vê ────────────────────────── */

/**
 * A prévia é onde "obrigatório" e "validação" significam alguma coisa.
 *
 * Sem ela as duas marcas seriam interruptores que o desbravador liga e nunca vê
 * agir — e a lição do requisito 4 passaria a medir ter clicado. Aqui a recusa
 * aparece escrita embaixo do campo, como em todo formulário.
 */
export function PreviaDoFormulario({
  titulo, descricao, campos, valores, aoMudar, recusas, aoEnviar, aviso,
}: {
  titulo: string;
  descricao: string;
  campos: Campo[];
  valores: Record<string, string>;
  aoMudar: (campoId: string, v: string) => void;
  /** As frases de recusa, já montadas pelo motor, por rótulo de campo. */
  recusas: string[];
  aoEnviar: () => void;
  aviso?: React.ReactNode;
}) {
  return (
    <div className="fb-corpo">
      <div className="fb-previa">
        <div className="fb-cartao" data-cabecalho="sim">
          <div style={{ fontSize: 22, color: '#202124' }}>{titulo}</div>
          <div className="fb-descricao">{descricao}</div>
        </div>
        {campos.map(c => (
          <PerguntaDaPrevia
            key={c.id} campo={c} valor={valores[c.id] ?? ''}
            aoMudar={v => aoMudar(c.id, v)}
            recusa={recusas.find(r => r.startsWith(`${c.rotulo}:`))}
          />
        ))}
        {aviso}
        <div>
          <button type="button" className="fb-bt" data-principal="sim" onClick={aoEnviar}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

function PerguntaDaPrevia({ campo, valor, aoMudar, recusa }: {
  campo: Campo;
  valor: string;
  aoMudar: (v: string) => void;
  recusa?: string;
}) {
  const grupo = useId();
  const opcoes = campo.opcoes ?? [];
  return (
    <div className="fb-cartao">
      <p className="fb-pergunta-titulo">
        {campo.rotulo}
        {campo.obrigatorio && <span className="fb-obrigatorio" aria-label="obrigatório">*</span>}
      </p>

      {campo.tipo === 'paragrafo' && (
        <textarea
          className="fb-resposta-campo" rows={3} value={valor}
          aria-label={campo.rotulo} onChange={e => aoMudar(e.target.value)}
        />
      )}

      {(campo.tipo === 'texto-curto' || campo.tipo === 'numero' || campo.tipo === 'data') && (
        <input
          className="fb-resposta-campo"
          // O tipo do campo na tela é sempre texto, de propósito: um
          // `type="number"` do navegador recusaria a vírgula ou o ponto antes
          // de o desbravador chegar na planilha, e a inconsistência do
          // requisito 5.2 deixaria de poder acontecer.
          value={valor} aria-label={campo.rotulo}
          placeholder={campo.tipo === 'data' ? 'dd/mm/aaaa' : 'Sua resposta'}
          onChange={e => aoMudar(e.target.value)}
        />
      )}

      {/*
        A lista suspensa é um menu, e a múltipla escolha é uma fileira de
        botões. Desenhar as duas iguais apagaria a diferença que o menu de tipo
        oferece: quem trocasse de uma para a outra veria a tela não mudar, e
        concluiria que o tipo não faz nada. É a mesma regra do "abrir com" que
        não é "definir padrão".
      */}
      {campo.tipo === 'lista' && (
        <select
          className="fb-resposta-campo" value={valor} aria-label={campo.rotulo}
          onChange={e => aoMudar(e.target.value)}
        >
          <option value="">Escolher</option>
          {opcoes.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}

      {/* O grupo de rádio tem nome, e o nome é a pergunta: sem ele, quem ouve
          a tela escuta "Falcão, botão 1 de 6" sem saber do que se trata. */}
      {campo.tipo === 'escolha-unica' && (
        <div role="radiogroup" aria-label={campo.rotulo}>
          {opcoes.map(o => (
            <label className="fb-escolha" key={o}>
              <input
                type="radio" name={grupo} checked={valor === o}
                onChange={() => aoMudar(o)}
              />
              {o}
            </label>
          ))}
        </div>
      )}

      {campo.tipo === 'varias-escolhas' && (
        <div role="group" aria-label={campo.rotulo}>
          {opcoes.map((o) => {
            const marcadas = valor ? valor.split(SEPARADOR_DE_ESCOLHAS) : [];
            return (
              <label className="fb-escolha" key={o}>
                <input
                  type="checkbox" checked={marcadas.includes(o)}
                  onChange={() => aoMudar(
                    (marcadas.includes(o) ? marcadas.filter(m => m !== o) : [...marcadas, o])
                      .join(SEPARADOR_DE_ESCOLHAS))}
                />
                {o}
              </label>
            );
          })}
        </div>
      )}

      {recusa && <div className="fb-recusa">{recusa}</div>}
    </div>
  );
}

/* ── Diálogo, aviso e botão ──────────────────────────────────────────────── */

export function DialogoDoConstrutor({ titulo, explica, aoFechar, children, acoes }: {
  titulo: string;
  explica?: string;
  aoFechar?: () => void;
  children?: React.ReactNode;
  acoes?: React.ReactNode;
}) {
  return (
    <div className="fb-fundo" onClick={aoFechar}>
      <div
        className="fb-dialogo" role="dialog" aria-modal="true" aria-label={titulo}
        onClick={e => e.stopPropagation()}
      >
        <h3>{titulo}</h3>
        {explica && <p>{explica}</p>}
        {children}
        <div className="fb-dialogo-pe">{acoes}</div>
      </div>
    </div>
  );
}

export function AvisoDoConstrutor({ tom = 'atencao', children }: {
  tom?: 'atencao' | 'erro' | 'bom';
  children: React.ReactNode;
}) {
  return <div className="fb-aviso" data-tom={tom}>{children}</div>;
}

export function BotaoDoConstrutor({ primario, children, ...resto }: {
  primario?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="fb-bt" data-principal={primario ? 'sim' : 'nao'} {...resto}>
      {children}
    </button>
  );
}
