import type React from 'react';
import {
  Camera, Crop, Check, RotateCcw, Sparkles, Sun, Contrast, Image as ImageIcon,
  type LucideIcon,
} from 'lucide-react';
import type { Captura } from './documentoPdf';
import {
  FILTROS, filtroPorId,
  type FiltroDoScanner, type EtapaDoScanner,
} from './capturaDoScanner';

/*
 * O aplicativo de digitalizar do celular, em peças.
 *
 * ── Por que ele é um arquivo à parte ─────────────────────────────────────
 * Não é porque uma cópia esteja a caminho — hoje só a CC-ES004 digitaliza.
 * É porque ele é **outro programa**, e a arquitetura da casa separa o
 * programa do exercício: o que é do aplicativo mora aqui, o que se cobra
 * mora no laboratório. Escrevê-lo dentro do componente da lição faria daquele
 * componente duas coisas, e a segunda vereda que precisar digitalizar não
 * teria de onde puxar.
 *
 * ── O que ele imita ──────────────────────────────────────────────────────
 * O arranjo que o Adobe Scan, o Microsoft Lens e a digitalização do Google
 * Drive têm em comum, que é o que o desbravador vai encontrar: a câmera com a
 * borda detectada sozinha, a tela de recorte com quatro cantos para arrastar,
 * a fileira de filtros, e só então salvar.
 *
 * ── E ele chega errado, de propósito ─────────────────────────────────────
 * O requisito 5 manda **corrigir** enquadramento e contraste. Um aplicativo
 * que detectasse a borda certa e escolhesse o filtro bom sozinho entregaria a
 * lição resolvida — "laboratório que abre resolvido não ensina nada", e aqui
 * seria pior do que de costume, porque o gesto que ele apagaria é o gesto que
 * o requisito nomeia.
 *
 * A detecção erra como erra de verdade: pega a beirada da mesa em vez da folha.
 * É o que acontece em toda mesa de madeira com pouca luz, e é por isso que os
 * aplicativos de verdade põem os cantos para arrastar.
 */

/* ── O ícone de cada filtro ───────────────────────────────────────────────── */

/*
  O desenho fica aqui e a lista fica em `capturaDoScanner.ts`: a lista é
  conteúdo — o nome do filtro, o contraste que ele deixa, o que ele custa —, e
  o ícone é aparência. É a mesma divisão de `ICONE_DA_LICAO`, que mora em
  `components/ui/` e não no catálogo.

  Ele não sai daqui: quem o usa é a fileira de filtros, logo abaixo. Exportar
  um mapa que ninguém de fora lê é oferecer uma segunda fonte para a mesma
  coisa, que é como dois mapas de ícone divergiram uma vez.
*/
const ICONE_DO_FILTRO: Record<FiltroDoScanner, LucideIcon> = {
  original: ImageIcon,
  automatico: Sparkles,
  cinza: Sun,
  pretoEBranco: Contrast,
};

/* ── CSS ──────────────────────────────────────────────────────────────────── */

/* As cores são as do aplicativo — preto de câmera, azul de ação —, e não as
   da plataforma. E a superfície diz a própria cor: a folha de recorte é clara
   e herdaria o quase-branco que a plataforma põe nos títulos. */
export const CSS_DO_DIGITALIZADOR = `
.scan-celular {
  background: #101114; color: #F2F3F5;
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
.scan-celular h1, .scan-celular h2, .scan-celular h3, .scan-celular h4 { color: #F2F3F5; }

.scan-topo {
  display: flex; align-items: center; gap: 10px; padding: 9px 14px;
  background: #17181C; border-bottom: 1px solid #26282E; font-size: 13px;
}
.scan-etapa { margin-left: auto; color: #9AA0A6; font-size: 11.5px; }

.scan-palco {
  flex: 1; min-height: 0; overflow: auto; display: flex;
  align-items: center; justify-content: center; padding: 16px;
  /* A mesa. É ela que faz "enquadrar" querer dizer alguma coisa: sem mesa em
     volta, não há o que tirar da foto. */
  background:
    repeating-linear-gradient(101deg, #6B4A2F 0 26px, #61432A 26px 52px);
}

.scan-papel {
  background: #FBFAF6; color: #23262B; position: relative;
  width: min(330px, 86%); padding: 26px 24px;
  font-size: 11px; line-height: 1.6;
  box-shadow: 0 6px 22px rgba(0,0,0,.5);
}
.scan-papel p { margin: 0 0 7px; }

/* A borda que o aplicativo detectou. Ela chega errada, e é o que os cantos
   servem para consertar. */
.scan-borda {
  position: absolute; border: 2px solid #4C9AFF;
  background: rgba(76,154,255,.12); pointer-events: none;
}
.scan-canto {
  position: absolute; width: 26px; height: 26px; border-radius: 50%;
  background: #4C9AFF; border: 2px solid #FFFFFF; cursor: grab;
  touch-action: none;
}
.scan-canto:focus-visible { outline: 3px solid #FFD400; outline-offset: 2px; }

.scan-controles {
  background: #17181C; border-top: 1px solid #26282E; padding: 10px 12px;
  display: flex; flex-direction: column; gap: 9px;
}
.scan-filtros { display: flex; gap: 7px; overflow-x: auto; }
.scan-filtro {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 7px 9px; border-radius: 7px; border: 1px solid #31343B;
  background: #1D1F24; color: #E4E6EA; font-size: 10.5px; cursor: pointer;
  white-space: nowrap; flex-shrink: 0;
}
.scan-filtro[aria-pressed="true"] { border-color: #4C9AFF; background: #16263B; }
.scan-dica { font-size: 11px; color: #9AA0A6; min-height: 15px; }

.scan-reguas { display: flex; flex-direction: column; gap: 7px; }
.scan-regua { display: flex; align-items: center; gap: 9px; font-size: 11.5px; color: #C6CAD1; }
.scan-regua label { min-width: 84px; }
.scan-regua input { flex: 1; }
.scan-regua output { min-width: 34px; text-align: right; color: #9AA0A6; }

.scan-acoes { display: flex; gap: 8px; }
.scan-bt {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  padding: 10px 12px; border-radius: 7px; border: none; cursor: pointer;
  font-size: 13px; background: #2A2D34; color: #F2F3F5;
}
.scan-bt[data-tom="principal"] { background: #1A73E8; color: #FFFFFF; }
.scan-bt:disabled { opacity: .45; cursor: default; }
.scan-bt:focus-visible { outline: 2px solid #FFD400; outline-offset: 2px; }

/* O aviso de qualidade é o do aplicativo, e ele diz o que **ele** mediu — não
   diz se a tarefa está cumprida. Aplicativo de digitalizar de verdade avisa
   "imagem escura" e "endireite a página"; nenhum diz "seu exercício está
   errado". */
.scan-qualidade {
  display: flex; align-items: center; gap: 8px; font-size: 11.5px;
  padding: 7px 10px; border-radius: 6px;
}
.scan-qualidade[data-nivel="bom"] { background: #10341C; color: #7DDB9B; }
.scan-qualidade[data-nivel="medio"] { background: #3A2E0B; color: #E9CF6B; }
.scan-qualidade[data-nivel="ruim"] { background: #3B1614; color: #F09891; }
`;

/* ── A moldura ────────────────────────────────────────────────────────────── */

export function TopoDoScanner({ titulo, etapa }: { titulo: string; etapa: string }) {
  return (
    <div className="scan-topo">
      <Camera className="w-4 h-4" style={{ color: '#4C9AFF' }} />
      <span>{titulo}</span>
      <span className="scan-etapa">{etapa}</span>
    </div>
  );
}

/* ── A folha sobre a mesa ─────────────────────────────────────────────────── */

/**
 * O papel na mesa, com a captura aplicada.
 *
 * A inclinação, a margem e o contraste se veem — é o que faz corrigir valer a
 * pena. Uma folha que desenhasse igual torta e reta transformaria o requisito
 * 5 num par de cliques sem consequência.
 */
export function PapelNaMesa({ linhas, captura, children }: {
  linhas: string[];
  captura: Captura;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="scan-papel"
      style={{
        transform: `rotate(${captura.inclinacao}deg)`,
        filter: `contrast(${Math.max(0.35, captura.contraste / 100)})`,
        margin: `${captura.margem}px`,
      }}
    >
      {linhas.map((l, i) => <p key={i}>{l}</p>)}
      {children}
    </div>
  );
}

/* ── Os cantos de recorte ─────────────────────────────────────────────────── */

/**
 * Os quatro cantos que o aplicativo põe sobre a borda detectada.
 *
 * Eles existem porque a detecção erra — e a deste aplicativo erra de propósito,
 * pegando a beirada da mesa em vez da folha, que é o que acontece em mesa de
 * madeira com pouca luz.
 *
 * Cada canto é um **botão**, e não uma área que só responde ao arrasto: no
 * celular arrastar um alvo de 26px é difícil, e quem navega por teclado não
 * arrasta nada. Apertar o canto o encaixa na folha, que é o mesmo resultado
 * do arrasto bem-feito — "reduzir a tela nunca reduz o que dá para fazer
 * nela", e o teclado vale a mesma regra.
 */
export function CantosDeRecorte({ margem, aoAjustar }: {
  margem: number;
  aoAjustar: (m: number) => void;
}) {
  const cantos: [string, React.CSSProperties][] = [
    ['superior esquerdo', { top: -13, left: -13 }],
    ['superior direito', { top: -13, right: -13 }],
    ['inferior esquerdo', { bottom: -13, left: -13 }],
    ['inferior direito', { bottom: -13, right: -13 }],
  ];
  return (
    <>
      {cantos.map(([nome, pos]) => (
        <button
          key={nome}
          type="button"
          className="scan-canto"
          style={pos}
          aria-label={`Canto ${nome} — encaixar na folha`}
          onClick={() => aoAjustar(Math.max(0, margem - 10))}
        />
      ))}
    </>
  );
}

/* ── Filtros ──────────────────────────────────────────────────────────────── */

export function FileiraDeFiltros({ escolhido, aoEscolher }: {
  escolhido: FiltroDoScanner;
  aoEscolher: (f: FiltroDoScanner) => void;
}) {
  const atual = filtroPorId(escolhido);
  return (
    <>
      <div className="scan-filtros" role="group" aria-label="Filtro da digitalização">
        {FILTROS.map(f => {
          const Icone = ICONE_DO_FILTRO[f.id];
          return (
            <button
              key={f.id}
              type="button"
              className="scan-filtro"
              aria-pressed={f.id === escolhido}
              onClick={() => aoEscolher(f.id)}
            >
              <Icone className="w-4 h-4" />
              {f.nome}
            </button>
          );
        })}
      </div>
      <div className="scan-dica">{atual.dica}</div>
    </>
  );
}

/* ── Réguas ───────────────────────────────────────────────────────────────── */

/**
 * Endireitar e enquadrar, com número à vista.
 *
 * O número aparece porque o aplicativo de verdade mostra os graus ao
 * endireitar, e porque sem ele "está reto o bastante?" vira adivinhação — e o
 * reconhecimento depois erraria sem que a pessoa soubesse por quê.
 */
export function ReguasDaCaptura({ captura, aoMudar }: {
  captura: Captura;
  aoMudar: (c: Captura) => void;
}) {
  return (
    <div className="scan-reguas">
      <div className="scan-regua">
        <label htmlFor="scan-girar">Endireitar</label>
        <input
          id="scan-girar" type="range" min={-20} max={20} step={1}
          value={captura.inclinacao}
          onChange={e => aoMudar({ ...captura, inclinacao: Number(e.target.value) })}
        />
        <output>{captura.inclinacao}°</output>
      </div>
      <div className="scan-regua">
        <label htmlFor="scan-margem">Enquadrar</label>
        <input
          id="scan-margem" type="range" min={0} max={48} step={1}
          value={captura.margem}
          onChange={e => aoMudar({ ...captura, margem: Number(e.target.value) })}
        />
        <output>{captura.margem}</output>
      </div>
    </div>
  );
}

/* ── Aviso de qualidade ───────────────────────────────────────────────────── */

/**
 * O que o aplicativo mediu da foto — e só isso.
 *
 * Ele diz "imagem escura" e "endireite a página", que é o que um aplicativo de
 * digitalizar de verdade diz. O que ele **não** diz é se a tarefa da lição
 * está cumprida: escrever isso poria na nossa tela a resposta que o requisito
 * 5 manda o desbravador comprovar procurando a palavra. É a mesma regra da
 * régua de status do Word e do painel de Problemas do Python.
 */
export function AvisoDeQualidade({ qualidade }: { qualidade: number }) {
  const nivel = qualidade >= 0.98 ? 'bom' : qualidade >= 0.6 ? 'medio' : 'ruim';
  const texto = nivel === 'bom'
    ? 'Imagem nítida e bem enquadrada.'
    : nivel === 'medio'
      ? 'Dá para melhorar: firme o contraste e endireite a página.'
      : 'Imagem escura ou torta. O texto pode sair errado.';
  return (
    <div className="scan-qualidade" data-nivel={nivel} role="status">
      <Crop className="w-3.5 h-3.5" />{texto}
    </div>
  );
}

/* ── Ações ────────────────────────────────────────────────────────────────── */

export function AcoesDoScanner({ etapa, aoAvancar, aoRefazer, rotuloPrincipal }: {
  etapa: EtapaDoScanner;
  aoAvancar?: () => void;
  aoRefazer?: () => void;
  rotuloPrincipal: string;
}) {
  return (
    <div className="scan-acoes">
      {aoRefazer && (
        <button type="button" className="scan-bt" onClick={aoRefazer}>
          <RotateCcw className="w-4 h-4" />Refazer a foto
        </button>
      )}
      <button
        type="button"
        className="scan-bt"
        data-tom="principal"
        onClick={aoAvancar}
        disabled={!aoAvancar}
      >
        {etapa === 'camera' ? <Camera className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        {rotuloPrincipal}
      </button>
    </div>
  );
}
