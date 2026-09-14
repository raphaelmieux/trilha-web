import { useState } from 'react';
import { Link } from 'react-router-dom';
import BadgeIcon from './BadgeIcon';
import ExplicacaoDaInsignia from './ExplicacaoDaInsignia';
import { ESCADAS } from '../../lib/escadasDeInsignia';
import { CLASSES, type NivelDaInsignia } from '../../lib/nivelDaInsignia';
import { ALTURA, LARGURA, formaDaClasse } from '../../lib/formaDaInsignia';
import type { InsigniaConquistada } from '../../lib/conquista';
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
 *
 * ── O clique numa insígnia conta o que ela rendeu ────────────────────────
 * Aqui ele levava para a edição do perfil — uma tela de formulário, que não
 * mostra insígnia nenhuma desde que a estante virou página. Quem clicava numa
 * medalha para saber o que tinha feito por ela caía num campo de nome de
 * usuário, e aprendia que aquele caminho não leva a lugar nenhum.
 *
 * É o mesmo cartão da Estante, pelo mesmo componente: a insígnia é a mesma nas
 * duas telas, e clicar nela tem de querer dizer a mesma coisa. O topo de cada
 * família continua abrindo a escada, porque ali o clique tem outro trabalho —
 * e cada degrau vencido dentro dela abre o cartão dele.
 */
export default function EstanteDeInsignias({ badges, total, posicoes }: {
  badges: InsigniaConquistada[];
  /** Quantas existem no catálogo, para dizer quantas ainda faltam. */
  total: number;
  /** Vazio para quem não entrou no ranking — e então nada de ranking aparece. */
  posicoes: PosicaoNoRanking[];
}) {
  const [aberta, setAberta] = useState<string | null>(null);
  /* Qual insígnia está explicada, por código: a lista se refaz a cada
     `useBadges`, e um objeto guardado ficaria velho. É o mesmo que a Estante
     faz, pela mesma razão. */
  const [explicando, setExplicando] = useState<string | null>(null);
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
        {/*
          O que falta continua sendo número aqui, e vira porta.

          Desenhar as cento e vinte que faltam neste cartão transformaria o
          painel numa lista de pendências em cima de quem só queria estudar —
          é a mesma decisão de mostrar o topo de cada família e não as noventa
          e uma. O lugar de ver os vazios é a Estante, onde quem entrou foi ver
          exatamente isso.
        */}
        <Link to="/estante" className="text-xs transition hover:opacity-80" style={{ color: 'var(--color-text-muted)' }}>
          {faltam > 0 && badges.length > 0
            ? `faltam ${faltam} — ver a estante`
            : 'ver a estante'}
        </Link>
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
              <button
                key={badge.id}
                type="button"
                onClick={() => setExplicando(badge.code)}
                /* Sem `title` aqui. O BadgeIcon já põe um, e o navegador mostra
                   só o mais interno — a descrição que este prometia nunca
                   chegava à tela. O `aria-label` fica, porque esse o leitor de
                   tela usa, e é onde a descrição faz falta de verdade. */
                aria-label={`${badge.name}. ${badge.description}. Ver o que rendeu esta insígnia`}
                className="transition hover:opacity-80 rounded"
              >
                <BadgeIcon badge={badge} size="sm" />
              </button>
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
                      {/* Só o degrau vencido abre: o que falta não tem feito,
                          percurso nem data para contar, e um botão que abre um
                          cartão vazio ensina que o caminho não funciona. */}
                      {vencido ? (
                        <button
                          type="button"
                          onClick={() => setExplicando(vencido.code)}
                          aria-label={`${CLASSES[d.classe].nome}: ${d.nome} — conquistada. Ver o que rendeu esta insígnia`}
                          className="transition hover:opacity-80 rounded"
                        >
                          <BadgeIcon badge={vencido} size="sm" />
                        </button>
                      ) : <DegrauPorVencer classe={d.classe} nome={`${CLASSES[d.classe].nome}: ${d.nome}`} />}
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

      {explicando && porCodigo.has(explicando) && (
        <ExplicacaoDaInsignia
          insignia={porCodigo.get(explicando)!}
          aoFechar={() => setExplicando(null)}
        />
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
