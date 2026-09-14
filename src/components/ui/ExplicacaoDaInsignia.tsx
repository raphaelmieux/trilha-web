import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, Target, Layers } from 'lucide-react';
import BadgeIcon from './BadgeIcon';
import { CLASSES } from '../../lib/nivelDaInsignia';
import { SEM_CLASSE } from '../../lib/insignias';
import { explicarInsignia } from '../../lib/explicacaoDaInsignia';
import type { InsigniaConquistada } from '../../lib/conquista';

/**
 * O que a insígnia quer dizer: o feito, o percurso e a data.
 *
 * ── Por que um cartão aberto, e não uma dica de ferramenta ───────────────
 * São três fatos, e dica de ferramenta não segura três fatos sem virar
 * parágrafo flutuante. Pior: ela depende do mouse parado em cima, e o público
 * daqui está no celular do clube — no toque, a dica ou não abre ou abre e some
 * no primeiro rolar. O que não se alcança com o dedo não existe para metade
 * de quem usa a plataforma.
 *
 * O cartão fecha no Esc, no botão e no clique fora — três saídas, porque a
 * pessoa veio ver uma medalha, não abrir um formulário.
 *
 * ── Por que ele sai do lugar onde foi chamado ────────────────────────────
 * Ele se desenha no `body`, e não onde o JSX o põe. `position: fixed` só
 * mede a janela enquanto nenhum ancestral tiver `transform`, `filter` ou
 * `backdrop-filter` — qualquer um dos três vira bloco de contenção, e o
 * `inset: 0` passa a ser o retângulo daquele ancestral.
 *
 * O `.card` da plataforma tem `backdrop-filter`, que é o vidro fosco dele.
 * Chamado de dentro de um cartão, o cartão de explicação escurecia só a área
 * daquele cartão e se centrava dentro dela, saindo por cima da borda: metade
 * do cabeçalho ficava fora da tela, com o nome da insígnia e o botão de
 * fechar. Nada estoura, e nenhum teste de jsdom vê — o jsdom não calcula
 * bloco de contenção nenhum. O portal é o que faz "ocupa a tela" ser verdade
 * seja de onde for que alguém o chame.
 */
export default function ExplicacaoDaInsignia({ insignia, aoFechar }: {
  insignia: InsigniaConquistada;
  aoFechar: () => void;
}) {
  const { familia, feito, onde, quando } = explicarInsignia(insignia);
  const semClasse = SEM_CLASSE.has(insignia.code);
  const classe = CLASSES[insignia.tier];

  useEffect(() => {
    const comEsc = (ev: KeyboardEvent) => { if (ev.key === 'Escape') aoFechar(); };
    document.addEventListener('keydown', comEsc);
    return () => document.removeEventListener('keydown', comEsc);
  }, [aoFechar]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.62)' }}
      onClick={aoFechar}
      role="presentation"
    >
      <div
        className="card p-5 w-full space-y-4"
        style={{ maxWidth: 380 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Sobre a insígnia ${insignia.name}`}
        onClick={ev => ev.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <BadgeIcon badge={insignia} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="font-bold leading-tight">{insignia.name}</h2>
            {/* A classe é a escala dos Desbravadores, que o clube já sabe
                ordenar de cor. As de horário não entram nela, e dizer que a
                Coruja é "Companheiro" fingiria uma ordem que não existe. */}
            {!semClasse && (
              <p className="text-xs mt-0.5" style={{ color: classe.cor === '#EAC600' ? 'var(--color-text-muted)' : undefined }}>
                <span className="font-bold" style={{ color: 'var(--color-text-soft)' }}>{classe.nome}</span>
                {familia && <span style={{ color: 'var(--color-text-dim)' }}> · {familia}</span>}
              </p>
            )}
            {semClasse && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
                Curiosidade — mede quando você estuda, e não quanto
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="p-1 rounded transition hover:opacity-70 flex-shrink-0"
            style={{ color: 'var(--color-text-dim)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <dl className="space-y-2.5 m-0">
          <Fato icone={<Target className="w-4 h-4" />} rotulo="O que rendeu" valor={feito} />
          {/*
            Só aparece quando se sabe. Quem conquistou antes de a plataforma
            passar a gravar o percurso tem o contexto vazio, e escrever um
            palpite ali seria afirmar o que não foi conferido.
          */}
          {onde && <Fato icone={<MapPin className="w-4 h-4" />} rotulo="Onde" valor={onde} />}
          {quando && <Fato icone={<Calendar className="w-4 h-4" />} rotulo="Quando" valor={quando} />}
          {!onde && (
            <p className="text-xs m-0 pt-1" style={{ color: 'var(--color-text-faint)' }}>
              <Layers className="w-3 h-3 inline mr-1" />
              O percurso desta não ficou registrado — ela é anterior a esta tela.
            </p>
          )}
        </dl>
      </div>
    </div>,
    document.body,
  );
}

function Fato({ icone, rotulo, valor }: { icone: React.ReactNode; rotulo: string; valor: string }) {
  return (
    <div className="flex gap-2.5">
      <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }}>{icone}</span>
      <div className="min-w-0">
        <dt className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-faint)' }}>
          {rotulo}
        </dt>
        <dd className="text-sm m-0" style={{ color: 'var(--color-text-soft)' }}>{valor}</dd>
      </div>
    </div>
  );
}
