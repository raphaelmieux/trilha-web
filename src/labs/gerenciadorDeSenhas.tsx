import type React from 'react';
import {
  KeyRound, Search, Plus, Eye, EyeOff, Copy, RefreshCw, ShieldAlert,
  Users, Building2, User, Check,
} from 'lucide-react';
import {
  type EntradaDoCofre, type ForcaDaSenha, type ComoGerar,
  forcaDaSenha,
} from './cofreDeSenhas';

/*
 * A janela do gerenciador de senhas, em peças.
 *
 * ── Por que ela é um programa, e não um cartão da plataforma ─────────────
 * O requisito 4.1 manda **gerar e armazenar** senha longa e única com auxílio
 * de gerenciador. O gesto que ele nomeia acontece dentro de um programa que o
 * desbravador vai reencontrar — o do navegador dele, o do celular, o do clube
 * —, e um formulário da plataforma ensinaria a digitar uma senha num campo
 * nosso. Vale a regra de sempre: quando um laboratório imita um programa, ele
 * ocupa a tela e a plataforma sai de cena.
 *
 * Ele não imita marca. Bitwarden, 1Password, o cofre do Google e o do Firefox
 * não se parecem entre si no desenho, e se parecem no **arranjo**: lista dos
 * itens de um lado, o item aberto do outro, o gerador atrás de um botão, e um
 * relatório que cruza as entradas. É esse arranjo que está aqui — a mesma
 * decisão do editor de código em `ide.tsx`.
 *
 * ── O que fica aqui e o que fica no laboratório ──────────────────────────
 * Aqui fica o que é do **programa**: como uma entrada se desenha, o que o
 * medidor mostra, o que o gerador oferece. Lá fica o que é do **exercício**:
 * de que cofre se parte e o que se cobra dele.
 *
 * Nenhuma peça guarda estado. Quem guarda é o laboratório, que é quem responde
 * à verificação — um cofre com entrada aberta própria obrigaria os dois lados
 * a concordar sobre a mesma entrada, que é a forma mais rápida de mostrarem
 * coisas diferentes.
 */

/* A superfície é clara, e diz a própria cor: a plataforma pinta `h1..h4` de
   quase branco, o que está certo num aplicativo escuro e some em cima de
   painel branco. É o que `CSS_DA_MOLDURA` já faz pelo painel de tarefas. */
export const CSS_DO_COFRE = `
.cf-janela {
  background: #F2F4F8; color: #1B1F27;
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
.cf-janela h1, .cf-janela h2, .cf-janela h3, .cf-janela h4 { color: #1B1F27; }

.cf-topo {
  background: #1B3A6B; color: #FFFFFF;
  display: flex; align-items: center; gap: 10px; padding: 9px 12px; font-size: 13px;
}
.cf-marca { display: flex; align-items: center; gap: 7px; font-weight: 600; }
.cf-topo-extra { margin-left: auto; display: flex; align-items: center; gap: 8px; }

.cf-busca {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.14); border-radius: 6px; padding: 4px 9px;
}
.cf-busca input {
  border: none; outline: none; background: transparent; font: inherit;
  font-size: 12.5px; color: #FFFFFF; width: 150px;
}
.cf-busca input::placeholder { color: rgba(255,255,255,0.72); }

.cf-corpo { flex: 1; display: flex; min-height: 0; }

.cf-lista {
  width: 264px; flex-shrink: 0; overflow-y: auto;
  background: #FFFFFF; border-right: 1px solid #D5DAE2;
  display: flex; flex-direction: column;
}
.cf-lista-topo {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 12px; border-bottom: 1px solid #E5E9EF;
  font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; color: #4A5261;
}
.cf-linha {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 9px 12px; border: none; background: transparent; cursor: pointer;
  text-align: left; border-bottom: 1px solid #EEF1F5; color: #1B1F27;
}
.cf-linha:hover { background: #F3F6FA; }
.cf-linha[aria-current="true"] { background: #E4ECF8; box-shadow: inset 3px 0 0 #1B3A6B; }
.cf-linha:focus-visible { outline: 2px solid #1B3A6B; outline-offset: -2px; }
.cf-inicial {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 7px;
  background: #E4ECF8; color: #1B3A6B; font-weight: 700; font-size: 13px;
  display: flex; align-items: center; justify-content: center;
}
.cf-linha-txt { min-width: 0; }
.cf-linha-servico { font-size: 13px; font-weight: 600; }
.cf-linha-usuario {
  font-size: 11.5px; color: #4A5261;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.cf-sinal { margin-left: auto; flex-shrink: 0; color: #B3261E; display: flex; }

.cf-painel { flex: 1; overflow-y: auto; padding: 16px; min-width: 0; }
.cf-cartao {
  background: #FFFFFF; border: 1px solid #D5DAE2; border-radius: 8px;
  padding: 14px; margin-bottom: 14px;
}
.cf-cartao h3 { font-size: 14px; font-weight: 600; margin: 0 0 10px; }
.cf-vazio { color: #4A5261; font-size: 13px; padding: 24px; text-align: center; }

.cf-campo { margin-bottom: 11px; }
.cf-rotulo {
  display: block; font-size: 11.5px; color: #4A5261; margin-bottom: 3px;
}
.cf-valor {
  display: flex; align-items: center; gap: 6px;
  border: 1px solid #C9D0DA; border-radius: 6px; padding: 6px 8px; background: #FFFFFF;
}
.cf-valor input {
  border: none; outline: none; background: transparent; font: inherit;
  font-size: 13px; color: #1B1F27; flex: 1; min-width: 0;
}
.cf-valor input[data-mono="sim"] { font-family: 'Space Mono', ui-monospace, monospace; }
.cf-icone-bt {
  border: none; background: transparent; cursor: pointer; color: #4A5261;
  padding: 3px; border-radius: 4px; display: inline-flex;
}
.cf-icone-bt:hover { background: #EEF1F5; color: #1B1F27; }
.cf-icone-bt:focus-visible { outline: 2px solid #1B3A6B; outline-offset: 1px; }

/* O medidor tem **largura e palavra**, e não só cor. Quem não distingue
   vermelho de verde veria quatro medidores idênticos, e numa tela em preto e
   branco ninguém veria nenhum — é a mesma razão de a insígnia ter forma e cor,
   e de MarcaDaLicao ter ícone e disco. */
.cf-medidor { display: flex; align-items: center; gap: 8px; margin-top: 5px; }
.cf-barra {
  flex: 1; height: 6px; border-radius: 3px; background: #E1E6ED; overflow: hidden;
}
.cf-barra span { display: block; height: 100%; border-radius: 3px; }
.cf-forca { font-size: 11.5px; font-weight: 600; white-space: nowrap; }
.cf-forca[data-f="frágil"], .cf-barra span[data-f="frágil"] { color: #B3261E; }
.cf-forca[data-f="fraca"], .cf-barra span[data-f="fraca"] { color: #A14E00; }
.cf-forca[data-f="razoável"], .cf-barra span[data-f="razoável"] { color: #6A5300; }
.cf-forca[data-f="forte"], .cf-barra span[data-f="forte"] { color: #1A6C37; }
.cf-barra span { background: currentColor; }

.cf-aviso {
  display: flex; gap: 8px; align-items: flex-start;
  background: #FDECEA; border: 1px solid #F3C4BF; border-radius: 6px;
  padding: 9px 11px; font-size: 12.5px; color: #7A1913; margin-top: 8px;
}
.cf-aviso svg { flex-shrink: 0; margin-top: 1px; }

.cf-bt {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 12px; border-radius: 6px; font-size: 12.5px; font-weight: 600;
  border: 1px solid #C9D0DA; background: #FFFFFF; color: #1B1F27; cursor: pointer;
}
.cf-bt:hover:not(:disabled) { background: #F3F6FA; }
.cf-bt:focus-visible { outline: 2px solid #1B3A6B; outline-offset: 1px; }
.cf-bt[data-principal="sim"] {
  background: #1B3A6B; border-color: #1B3A6B; color: #FFFFFF;
}
.cf-bt[data-principal="sim"]:hover:not(:disabled) { background: #16305A; }
/* O desligado vem **depois** do principal, e não antes. Escrito primeiro, ele
   tem a mesma especificidade e perde: o botão principal desligado saía azul e
   branco, com cara de clicável, e clicar não fazia nada. É a mesma ordem que o
   diálogo do celular precisou nas duas veredas anteriores, e errá-la não
   estoura nada. */
.cf-bt:disabled, .cf-bt[data-principal="sim"]:disabled {
  background: #F1F3F5; color: #8A93A2; border-color: #D5DAE2; cursor: default;
}
.cf-acoes { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }

.cf-gerar-linha { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }
.cf-gerar-linha label { font-size: 12.5px; display: flex; align-items: center; gap: 6px; }
.cf-gerar-linha input[type="range"] { flex: 1; accent-color: #1B3A6B; }
.cf-gerar-linha input[type="checkbox"] { accent-color: #1B3A6B; }
.cf-tamanho { font-variant-numeric: tabular-nums; font-weight: 600; width: 2.2em; }

.cf-pessoas { display: flex; flex-wrap: wrap; gap: 6px; }
.cf-pessoa {
  display: inline-flex; align-items: center; gap: 5px;
  background: #EEF1F5; border: 1px solid #D5DAE2; border-radius: 999px;
  padding: 3px 9px; font-size: 12px;
}
.cf-pessoa button {
  border: none; background: transparent; cursor: pointer; color: #4A5261;
  font-size: 14px; line-height: 1; padding: 0 1px;
}
.cf-pessoa button:hover { color: #B3261E; }
.cf-dono {
  display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px;
  border-radius: 999px; padding: 3px 10px; border: 1px solid;
}
.cf-dono[data-de="clube"] { background: #E8F3EC; border-color: #BCD9C6; color: #17532F; }
.cf-dono[data-de="pessoa"] { background: #FDECEA; border-color: #F3C4BF; color: #7A1913; }

.cf-problema {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 10px 0; border-top: 1px solid #EEF1F5; font-size: 12.5px;
}
.cf-problema:first-of-type { border-top: none; }
.cf-problema b { font-weight: 600; }
.cf-problema p { margin: 2px 0 0; color: #4A5261; }

/* Abaixo de 860px a lista vira uma fileira em cima, como o cofre do celular
   faz. Escondê-la tiraria o único caminho até escolher a entrada — reduzir a
   tela nunca reduz o que dá para fazer nela. */
@media (max-width: 860px) {
  .cf-corpo { flex-direction: column; }
  .cf-lista {
    width: auto; max-height: 176px;
    border-right: none; border-bottom: 1px solid #D5DAE2;
  }
  .cf-busca input { width: 100px; }
  .cf-painel { padding: 12px; }
}
`;

/* ── O topo ───────────────────────────────────────────────────────────────── */

export function TopoDoCofre({ cofre, aoBuscar, termo, extra }: {
  /** O nome do cofre aberto, como o programa o chama. */
  cofre?: string;
  /** Presente, há caixa de pesquisa. É a regra do `aoBuscar` do Explorador. */
  aoBuscar?: (t: string) => void;
  termo?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="cf-topo">
      <span className="cf-marca"><KeyRound size={16} aria-hidden /> Cofre de Senhas</span>
      {cofre && <span style={{ opacity: 0.82 }}>· {cofre}</span>}
      <div className="cf-topo-extra">
        {aoBuscar && (
          <div className="cf-busca">
            <Search size={14} aria-hidden />
            <input
              value={termo ?? ''} aria-label="Pesquisar no cofre"
              placeholder="Pesquisar no cofre"
              onChange={e => aoBuscar(e.target.value)}
            />
          </div>
        )}
        {extra}
      </div>
    </div>
  );
}

/* ── A lista ──────────────────────────────────────────────────────────────── */

export function ListaDoCofre({ quantas, aoAdicionar, children }: {
  quantas: number;
  /** Presente, há botão de acrescentar item. */
  aoAdicionar?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="cf-lista">
      <div className="cf-lista-topo">
        <span>{quantas} {quantas === 1 ? 'item' : 'itens'}</span>
        {aoAdicionar && (
          <button type="button" className="cf-icone-bt" aria-label="Novo item" onClick={aoAdicionar}>
            <Plus size={16} aria-hidden />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function LinhaDoCofre({ entrada, aberta, aoAbrir, alerta }: {
  entrada: EntradaDoCofre;
  aberta?: boolean;
  aoAbrir?: () => void;
  /** O que faz esta linha merecer o sinal. Vai no `title`, e não na tela. */
  alerta?: string;
}) {
  return (
    <button
      type="button" className="cf-linha" aria-current={aberta ? 'true' : undefined}
      onClick={aoAbrir}
    >
      <span className="cf-inicial" aria-hidden>{entrada.servico.slice(0, 1).toUpperCase()}</span>
      <span className="cf-linha-txt">
        <span className="cf-linha-servico">{entrada.servico}</span>
        <span className="cf-linha-usuario" style={{ display: 'block' }}>{entrada.usuario}</span>
      </span>
      {alerta && (
        <span className="cf-sinal" title={alerta}>
          <ShieldAlert size={15} aria-label={alerta} />
        </span>
      )}
    </button>
  );
}

/* ── Um campo ─────────────────────────────────────────────────────────────── */

export function CampoDoCofre({ rotulo, valor, aoMudar, segredo, aberto, aoAbrir, aoCopiar }: {
  rotulo: string;
  valor: string;
  aoMudar?: (v: string) => void;
  /** Campo de senha: sai escondido, com o olho ao lado. */
  segredo?: boolean;
  aberto?: boolean;
  aoAbrir?: () => void;
  aoCopiar?: () => void;
}) {
  const escondido = segredo && !aberto;
  return (
    <div className="cf-campo">
      <label className="cf-rotulo" htmlFor={`cf-${rotulo}`}>{rotulo}</label>
      <div className="cf-valor">
        <input
          id={`cf-${rotulo}`} aria-label={rotulo}
          type={escondido ? 'password' : 'text'}
          data-mono={segredo ? 'sim' : undefined}
          value={valor} readOnly={!aoMudar}
          onChange={e => aoMudar?.(e.target.value)}
        />
        {segredo && aoAbrir && (
          <button
            type="button" className="cf-icone-bt" onClick={aoAbrir}
            aria-label={escondido ? 'Mostrar a senha' : 'Esconder a senha'}
          >
            {escondido ? <Eye size={15} aria-hidden /> : <EyeOff size={15} aria-hidden />}
          </button>
        )}
        {aoCopiar && (
          <button type="button" className="cf-icone-bt" onClick={aoCopiar} aria-label={`Copiar ${rotulo}`}>
            <Copy size={15} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── O medidor ────────────────────────────────────────────────────────────── */

const QUANTO: Record<ForcaDaSenha, string> = {
  'frágil': '25%', fraca: '50%', 'razoável': '75%', forte: '100%',
};

/**
 * A força da senha, em largura **e** em palavra.
 *
 * Cor sozinha não se lê: quem não distingue vermelho de verde veria quatro
 * medidores idênticos, e numa tela em preto e branco ninguém veria nenhum. É a
 * mesma razão de a insígnia ter forma e cor.
 */
export function MedidorDeForca({ senha }: { senha: string }) {
  const f = forcaDaSenha(senha);
  return (
    <div className="cf-medidor">
      <span className="cf-barra">
        <span data-f={f} style={{ width: QUANTO[f] }} />
      </span>
      <span className="cf-forca" data-f={f}>{f}</span>
    </div>
  );
}

/* ── Os avisos ────────────────────────────────────────────────────────────── */

export function AvisoDoCofre({ children }: { children: React.ReactNode }) {
  return (
    <p className="cf-aviso">
      <ShieldAlert size={16} aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/* ── O gerador ────────────────────────────────────────────────────────────── */

export function CaixaDeGerar({ como, aoMudar, senha, aoSortear, aoUsar }: {
  como: ComoGerar;
  aoMudar: (c: ComoGerar) => void;
  senha: string;
  aoSortear: () => void;
  aoUsar?: () => void;
}) {
  return (
    <div className="cf-cartao">
      <h3>Gerar uma senha</h3>
      <div className="cf-valor" style={{ marginBottom: 12 }}>
        <input value={senha} readOnly aria-label="Senha gerada" data-mono="sim" />
        <button type="button" className="cf-icone-bt" onClick={aoSortear} aria-label="Sortear outra">
          <RefreshCw size={15} aria-hidden />
        </button>
      </div>
      <MedidorDeForca senha={senha} />

      <div className="cf-gerar-linha" style={{ marginTop: 12 }}>
        <label htmlFor="cf-tam">Tamanho</label>
        <input
          id="cf-tam" type="range" min={6} max={40} value={como.tamanho}
          aria-label="Tamanho da senha"
          onChange={e => aoMudar({ ...como, tamanho: Number(e.target.value) })}
        />
        <span className="cf-tamanho">{como.tamanho}</span>
      </div>
      <div className="cf-gerar-linha">
        <label>
          <input
            type="checkbox" checked={como.maiusculas}
            onChange={e => aoMudar({ ...como, maiusculas: e.target.checked })}
          />
          Maiúsculas
        </label>
        <label>
          <input
            type="checkbox" checked={como.numeros}
            onChange={e => aoMudar({ ...como, numeros: e.target.checked })}
          />
          Números
        </label>
        <label>
          <input
            type="checkbox" checked={como.simbolos}
            onChange={e => aoMudar({ ...como, simbolos: e.target.checked })}
          />
          Símbolos
        </label>
      </div>

      {aoUsar && (
        <div className="cf-acoes">
          <button type="button" className="cf-bt" data-principal="sim" onClick={aoUsar}>
            <Check size={15} aria-hidden /> Usar esta senha
          </button>
        </div>
      )}
    </div>
  );
}

/* ── De quem é a conta: o requisito 8 ─────────────────────────────────────── */

/**
 * Quem consegue entrar nesta conta, e de quem ela é.
 *
 * É o requisito 8 dentro do programa, e não num formulário da plataforma: um
 * gerenciador de verdade com cofre de equipe mostra exatamente isto — de quem
 * é o item e quem tem acesso a ele. É a mesma regra do painel de Problemas do
 * Python e do polegar do laboratório de IA.
 */
export function AcessoDaEntrada({ entrada, aoPassarParaOClube, aoDarAcesso, aoTirarAcesso }: {
  entrada: EntradaDoCofre;
  aoPassarParaOClube?: () => void;
  aoDarAcesso?: (quem: string) => void;
  aoTirarAcesso?: (quem: string) => void;
}) {
  const daDiretoria = ['Marta', 'Ronaldo', 'Cleide'];
  const fora = daDiretoria.filter(q => !entrada.acesso.includes(q));
  return (
    <div className="cf-cartao">
      <h3>Quem entra nesta conta</h3>

      <p className="cf-rotulo">A conta está no nome de</p>
      <span className="cf-dono" data-de={entrada.dono}>
        {entrada.dono === 'clube'
          ? <><Building2 size={14} aria-hidden /> do clube</>
          : <><User size={14} aria-hidden /> de uma pessoa</>}
      </span>

      <p className="cf-rotulo" style={{ marginTop: 12 }}>
        <Users size={13} aria-hidden style={{ verticalAlign: '-2px', marginRight: 4 }} />
        Tem acesso hoje
      </p>
      <div className="cf-pessoas">
        {entrada.acesso.length === 0 && <span style={{ fontSize: 12.5 }}>ninguém</span>}
        {entrada.acesso.map(q => (
          <span className="cf-pessoa" key={q}>
            {q}
            {aoTirarAcesso && (
              <button type="button" onClick={() => aoTirarAcesso(q)} aria-label={`Tirar o acesso de ${q}`}>
                ×
              </button>
            )}
          </span>
        ))}
      </div>

      <div className="cf-acoes">
        {aoDarAcesso && fora.map(q => (
          <button type="button" className="cf-bt" key={q} onClick={() => aoDarAcesso(q)}>
            <Plus size={14} aria-hidden /> Dar acesso a {q}
          </button>
        ))}
        {aoPassarParaOClube && entrada.dono === 'pessoa' && (
          <button type="button" className="cf-bt" data-principal="sim" onClick={aoPassarParaOClube}>
            <Building2 size={14} aria-hidden /> Passar para a conta do clube
          </button>
        )}
      </div>
    </div>
  );
}

/* ── O relatório ──────────────────────────────────────────────────────────── */

export interface ProblemaDoCofre {
  id: string;
  titulo: string;
  detalhe: string;
}

/**
 * O relatório de segurança do cofre.
 *
 * Ele **relata**, e não diz se a tarefa está cumprida: é a régua de status do
 * Word e o painel de Problemas do Python. Um relatório que escrevesse "resolva
 * isto para concluir a lição" poria na nossa tela a resposta que o programa
 * imitado dá na dele — e nenhum gerenciador de senhas fala de lição nenhuma.
 */
export function PainelDeSeguranca({ problemas, vazio }: {
  problemas: ProblemaDoCofre[];
  vazio?: string;
}) {
  return (
    <div className="cf-cartao">
      <h3>Relatório do cofre</h3>
      {problemas.length === 0 && (
        <p style={{ fontSize: 12.5, color: '#17532F', margin: 0 }}>
          {vazio ?? 'Nada a apontar nas entradas deste cofre.'}
        </p>
      )}
      {problemas.map(p => (
        <div className="cf-problema" key={p.id}>
          <ShieldAlert size={16} aria-hidden style={{ color: '#B3261E', flexShrink: 0 }} />
          <span>
            <b>{p.titulo}</b>
            <p>{p.detalhe}</p>
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── O painel vazio ───────────────────────────────────────────────────────── */

export const PainelSemEntrada = ({ diz }: { diz?: string }) => (
  <p className="cf-vazio">{diz ?? 'Escolha um item na lista para ver os dados dele.'}</p>
);
