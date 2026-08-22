import { Link } from 'react-router-dom';
import BadgeIcon from './BadgeIcon';
import type { Badge } from '../../types';
import type { PosicaoNoRanking } from '../../hooks/useMinhasPosicoes';

/**
 * As insígnias conquistadas, e a colocação nos rankings, logo abaixo do nome.
 *
 * A home mostrava só a contagem — "6 badges" — atrás de um link para o perfil.
 * Uma insígnia que ninguém vê não recompensa nada: o número não lembra o que
 * foi feito, e quem não clica nunca descobre que a estante existe.
 *
 * O que falta aparece como número, e não como fileira de cadeados: são 57 no
 * catálogo, e desenhar 50 silhuetas apagadas transforma a conquista em lista de
 * pendências.
 */
export default function EstanteDeInsignias({ badges, total, posicoes }: {
  badges: Badge[];
  /** Quantas existem no catálogo, para dizer quantas ainda faltam. */
  total: number;
  /** Vazio para quem não entrou no ranking — e então nada de ranking aparece. */
  posicoes: PosicaoNoRanking[];
}) {
  const faltam = Math.max(0, total - badges.length);

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
        <div className="flex flex-wrap gap-2">
          {badges.map(badge => (
            <Link
              key={badge.id}
              to="/perfil"
              title={`${badge.name} — ${badge.description}`}
              aria-label={`${badge.name}. ${badge.description}`}
              className="transition hover:opacity-80"
            >
              <BadgeIcon badge={badge} size="sm" />
            </Link>
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
