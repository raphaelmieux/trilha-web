import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getOpenSpecialties } from '../curriculum';
import { veredasAbertas, veredasQueFaltamAntes } from '../curriculum/veredas';
import { useVeredas } from '../hooks/useVeredas';
import { useLicoesConcluidas } from '../hooks/useLicoesConcluidas';
import {
  trilhaParaContinuar, veredaParaContinuar, ordenarParaContinuar, type ParaContinuar,
} from '../lib/continuar';
import { coresDoProgresso, corDoPercentual } from '../lib/coresDoProgresso';
import type { ProgressMap } from '../lib/progress';
import type { Specialty } from '../types';
import Emblema from './ui/Emblema';
import ProgressBar from './ui/ProgressBar';
import MarcaDaLicao from './ui/MarcaDaLicao';

/*
 * "Continue de onde parou", no topo do painel.
 *
 * As trilhas e veredas pela metade, da mais recente para a mais antiga, cada
 * uma com a próxima lição escrita no cartão. É o "Continuar assistindo" de um
 * serviço de vídeo, e pela mesma razão: o painel lista tudo o que existe, e
 * quem está no meio de três coisas não deveria ter de procurar as três no meio
 * de sessenta e quatro cartões — nem, dentro de cada uma, a lição que falta.
 *
 * ── O cartão inteiro é um link só, e ele leva à lição ────────────────────
 * Os cartões de baixo levam à trilha; este leva ao próximo passo, que é o que
 * ele promete. Por isso não tem segundo destino dentro dele, e pode ser um
 * `<Link>` inteiro sem âncora dentro de âncora.
 *
 * ── Some quando não há nada pela metade ──────────────────────────────────
 * Quem acabou de entrar não tem o que continuar, e uma seção vazia no topo
 * seria a primeira coisa que essa pessoa lê. E também espera tudo chegar:
 * desenhar com metade dos dados poria a ordem errada na tela por um instante,
 * e a pessoa clicaria no cartão que estava no lugar do outro.
 */

/*
  Quantos cartões aparecem.

  Quatro, porque a grade tem duas colunas — a mesma conta do resumo das
  veredas. Quem está no meio de mais de quatro coisas tem as outras nas listas
  logo abaixo, e a seção diz quantas são.
*/
const NA_FILA = 4;

function CartaoParaContinuar({ c }: { c: ParaContinuar }) {
  const cores = coresDoProgresso(c.percent);
  return (
    <Link
      to={c.proxima.rota}
      /* `min-w-0` porque item de grade não encolhe abaixo do conteúdo: uma
         palavra comprida demais para a linha alargaria a coluna, e a página
         rolaria de lado no celular. O título da lição quebra linha em vez de
         ser cortado — o nome dela é o que o cartão existe para dizer. */
      className="card p-4 flex flex-col gap-3 min-w-0"
      style={{ transition: 'border-color 0.2s' }}
      onMouseEnter={ev => (ev.currentTarget.style.borderColor = cores.bordaAoPassar)}
      onMouseLeave={ev => (ev.currentTarget.style.borderColor = 'var(--color-border)')}>
      <div className="flex items-center gap-3">
        <Emblema code={c.code} status="em-andamento" size={56} />
        <div className="min-w-0 flex-1">
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            {c.tipo === 'trilha' ? 'Trilha' : 'Vereda'} · {c.feitas} de {c.total} {c.total === 1 ? 'lição' : 'lições'}
          </p>
          <h3 className="font-bold leading-snug">{c.nome}</h3>
        </div>
        <span className="text-sm font-semibold flex-none" style={{ color: corDoPercentual(c.percent) }}>
          {c.percent}%
        </span>
      </div>

      <ProgressBar percent={c.percent} partial={c.parcial} color={cores.gradiente} height="sm" />

      <div className="flex items-center gap-3 rounded-lg p-2"
        style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
        <MarcaDaLicao tipo={c.proxima.tipo} size={28} />
        <div className="min-w-0 flex-1">
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            {c.proxima.tipo === 'final' ? 'Falta a avaliação final' : 'Próxima lição'}
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {c.proxima.titulo}
          </p>
        </div>
        <span className="flex-none inline-flex items-center gap-1 text-sm font-bold"
          style={{ color: 'var(--color-primary)' }}>
          <Play className="w-4 h-4" /> Continuar
        </span>
      </div>
    </Link>
  );
}

export default function ContinueDeOndeParou({
  userId, progress, ultimaAtividade, liberada, carregando,
}: {
  userId?: string;
  progress: ProgressMap;
  /** Quando cada trilha recebeu atividade pela última vez, pelo código dela. */
  ultimaAtividade: Record<string, string>;
  /** A trilha já passou do pré-requisito? A mesma regra dos cartões do painel. */
  liberada: (e: Specialty) => boolean;
  /** O painel ainda está buscando as matrículas, que dão a ordem das trilhas. */
  carregando: boolean;
}) {
  const { percursoDe, concluida, carregando: carregandoVeredas } = useVeredas(userId);
  const { licoesFeitas, loading: carregandoLicoes } = useLicoesConcluidas(userId);

  if (carregando || carregandoVeredas || carregandoLicoes) return null;

  const trilhas = getOpenSpecialties()
    .filter(liberada)
    .map(e => trilhaParaContinuar(e, progress, licoesFeitas, ultimaAtividade[e.code]));
  /* A vereda bloqueada fica de fora mesmo com lição vencida: ela pode ter
     ganhado uma exigência depois, e o cartão levaria a uma porta trancada. */
  const veredas = veredasAbertas()
    .filter(v => veredasQueFaltamAntes(v, concluida).length === 0)
    .map(v => veredaParaContinuar(v, percursoDe(v.id)));

  const fila = ordenarParaContinuar(
    [...trilhas, ...veredas].filter((c): c is ParaContinuar => c !== null));
  if (fila.length === 0) return null;

  const mostrados = fila.slice(0, NA_FILA);
  const outros = fila.length - mostrados.length;

  return (
    <section className="space-y-3" aria-labelledby="continue-titulo">
      <div>
        <h2 id="continue-titulo" className="text-lg font-bold" style={{ color: 'var(--color-text-soft)' }}>
          Continue de onde parou
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          O que você começou, do mais recente para o mais antigo.
          {outros > 0 && ` Mais ${outros} ${outros === 1 ? 'está' : 'estão'} pela metade nas listas abaixo.`}
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {mostrados.map(c => <CartaoParaContinuar key={`${c.tipo}-${c.code}`} c={c} />)}
      </div>
    </section>
  );
}
