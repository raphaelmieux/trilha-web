import { useState } from 'react';
import { Link } from 'react-router-dom';
import BadgeIcon from './BadgeIcon';
import { ESCADAS } from '../../lib/escadasDeInsignia';
import { CLASSES, type NivelDaInsignia } from '../../lib/nivelDaInsignia';
import { ALTURA, LARGURA, formaDaClasse } from '../../lib/formaDaInsignia';
import type { Badge } from '../../types';
import type { PosicaoNoRanking } from '../../hooks/useMinhasPosicoes';

/**
 * As insígnias conquistadas, e a colocação nos rankings, logo abaixo do nome.
 *
 * A home mostrava só a contagem — "6 badges" — atrás de um link para o perfil.
 * Uma insígnia que ninguém vê não recompensa nada: o número não lembra o que
 * foi feito, e quem não clica nunca descobre que a estante existe.
 *
 * ── Uma por família, e não uma por conquista ─────────────────────────────
 * Com as sete classes cada família virou escada de sete degraus, e quem está
 * adiantado tem dezenas de insígnias. Despejar todas daria noventa e uma numa
 * tela só — o muro que os trinta e dois cartões de vereda já foram uma vez.
 * A estante mostra o **topo** de cada família, que é a classe mais alta já
 * alcançada ali, e a escada inteira abre num clique, com os degraus vencidos
 * acesos e os que faltam em contorno.
 *
 * O que falta continua aparecendo como número, e não como fileira de cadeados:
 * desenhar cento e vinte silhuetas apagadas transforma a conquista em lista de
 * pendências.
 */
export default function EstanteDeInsignias({ badges, total, posicoes }: {
  badges: Badge[];
  /** Quantas existem no catálogo, para dizer quantas ainda faltam. */
  total: number;
  /** Vazio para quem não entrou no ranking — e então nada de ranking aparece. */
  posicoes: PosicaoNoRanking[];
}) {
  const [aberta, setAberta] = useState<string | null>(null);
  const faltam = Math.max(0, total - badges.length);
  const porCodigo = new Map(badges.map(b => [b.code, b]));

  /* O topo de cada escada em que a pessoa pôs o pé. Escada sem nenhum degrau
     vencido não vira ícone apagado: ela simplesmente não aparece ainda. */
  const topos = ESCADAS
    .map(escada => {
      const vencidos = escada.degraus.filter(d => porCodigo.has(d.code));
      return { escada, vencidos, topo: vencidos[vencidos.length - 1] };
    })
    .filter(x => x.topo);

  /* As que não pertencem a escada nenhuma — laboratório, trilha, vereda e as
     de horário. Cada uma diz que uma coisa específica foi feita, então não há
     topo a escolher: aparecem todas. */
  const emEscada = new Set(ESCADAS.flatMap(e => e.degraus.map(d => d.code)));
  const avulsas = badges.filter(b => !emEscada.has(b.code));

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-soft)' }}>
          {badges.length > 0 ? `Suas insígnias (${badges.length})` : 'Suas insígnias'}
        </h2>
        {faltam > 0 && badges.length > 0 && (
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            faltam {faltam} para completar a estante
          </span>
        )}
      </div>

      {badges.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          A primeira vem com a primeira lição concluída. São {total} para conquistar.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {topos.map(({ escada, topo }) => {
              const badge = porCodigo.get(topo.code)!;
              const estaAberta = aberta === escada.chave;
              return (
                <button
                  key={escada.chave}
                  type="button"
                  onClick={() => setAberta(estaAberta ? null : escada.chave)}
                  aria-expanded={estaAberta}
                  aria-label={`${escada.familia}: ${CLASSES[topo.classe].nome}. ${badge.description}`}
                  className="transition hover:opacity-80 rounded"
                  style={estaAberta ? { outline: '2px solid var(--color-primary)', outlineOffset: 2 } : undefined}
                >
                  <BadgeIcon badge={badge} size="sm" />
                </button>
              );
            })}
            {avulsas.map(badge => (
              <Link
                key={badge.id}
                to="/perfil"
                /* Sem `title` aqui. O BadgeIcon já põe um, e o navegador mostra
                   só o mais interno — a descrição que este prometia nunca
                   chegava à tela. O `aria-label` fica, porque esse o leitor de
                   tela usa, e é onde a descrição faz falta de verdade. */
                aria-label={`${badge.name}. ${badge.description}`}
                className="transition hover:opacity-80"
              >
                <BadgeIcon badge={badge} size="sm" />
              </Link>
            ))}
          </div>

          {/* A escada aberta: os sete degraus, com o que falta em contorno. Aqui
              o apagado vale a pena, e na fileira acima não: são sete de uma
              família só, e o que falta é o próximo passo — não a lista inteira
              do que ainda não foi feito. */}
          {topos.filter(t => t.escada.chave === aberta).map(({ escada, topo }) => (
            <div key={escada.chave} className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                <span className="font-bold" style={{ color: 'var(--color-text-soft)' }}>{escada.familia}</span>
                {' — '}{escada.mede}
              </p>
              <ol className="flex flex-wrap gap-2 list-none p-0 m-0">
                {escada.degraus.map(d => {
                  const vencido = porCodigo.get(d.code);
                  return (
                    <li key={d.code} className="flex flex-col items-center gap-1" style={{ width: 56 }}>
                      {vencido
                        ? <BadgeIcon badge={vencido} size="sm" />
                        : <DegrauPorVencer classe={d.classe} nome={`${CLASSES[d.classe].nome}: ${d.nome}`} />}
                      <span
                        className="text-[10px] font-mono tabular-nums"
                        style={{ color: vencido ? 'var(--color-text-soft)' : 'var(--color-text-faint)' }}
                      >
                        {d.alvo.toLocaleString('pt-BR')}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-dim)' }}>
                Você está em <span className="font-bold">{CLASSES[topo.classe].nome}</span>.
              </p>
            </div>
          ))}
        </div>
      )}

      {posicoes.length > 0 && (
        <div className="pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
            {posicoes.map(({ periodo, rotulo, posicao, total: quantos }) => (
              <Link
                key={periodo}
                to="/ranking"
                className="text-xs transition hover:opacity-80"
                style={{ color: 'var(--color-text-dim)' }}
              >
                {rotulo}:{' '}
                {posicao === null ? (
                  /* Sem pontos na janela a pessoa nem entra na listagem — dizer
                     "último lugar" seria inventar uma colocação que não existe. */
                  <span style={{ color: 'var(--color-text-muted)' }}>sem pontos ainda</span>
                ) : (
                  <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                    {posicao}º de {quantos}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * O degrau que ainda não veio: a forma da classe, em contorno.
 *
 * É o polígono de verdade, e não uma silhueta genérica — quem olha vê que o
 * próximo é um pentágono, e é isso que o degrau por vencer tem a dizer. Sem
 * preenchimento não há contraste a garantir, então o traço é `currentColor` e
 * herda a cor do texto: funciona no claro e no escuro sem duas versões, que é
 * onde uma delas acabaria errada.
 */
function DegrauPorVencer({ classe, nome }: { classe: NivelDaInsignia; nome: string }) {
  const forma = formaDaClasse(classe);
  return (
    <svg
      viewBox={`0 0 ${LARGURA} ${ALTURA}`}
      width={(30 * LARGURA) / ALTURA}
      height={30}
      role="img"
      aria-label={`${nome} — ainda não conquistada`}
      style={{ color: 'var(--color-text-faint)' }}
    >
      <title>{nome} — ainda não conquistada</title>
      <polygon
        points={forma.pontos}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeDasharray="2.5 2"
      />
    </svg>
  );
}
