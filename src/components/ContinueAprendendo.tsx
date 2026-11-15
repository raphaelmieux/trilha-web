import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { getFamilias } from '../curriculum';
import { veredasPorFamilia, veredasQueFaltamAntes } from '../curriculum/veredas';
import { useVeredas } from '../hooks/useVeredas';
import { useLicoesConcluidas } from '../hooks/useLicoesConcluidas';
import { continueAprendendo, type ParaContinuar } from '../lib/continuar';
import { trilhaTravada } from '../lib/recomendacoes';
import { coresDoProgresso, corDoPercentual } from '../lib/coresDoProgresso';
import type { ProgressMap } from '../lib/progress';
import type { Specialty } from '../types';
import Emblema from './ui/Emblema';
import ProgressBar from './ui/ProgressBar';
import MarcaDaLicao from './ui/MarcaDaLicao';

/*
 * "Continue aprendendo", no topo do painel.
 *
 * São duas partes, e as duas respondem "o que eu faço agora?".
 *
 * **Em andamento**: as trilhas e veredas pela metade, da mais recente para a
 * mais antiga, cada uma com a próxima lição escrita no cartão. É o "Continuar
 * assistindo" de um serviço de vídeo, e pela mesma razão: o painel lista tudo
 * o que existe, e quem está no meio de três coisas não deveria ter de procurar
 * as três no meio de sessenta e quatro cartões — nem, dentro de cada uma, a
 * lição que falta.
 *
 * **Próximo passo em cada grupo**: para cada grupo do painel sem nada em
 * andamento, a primeira trilha ou vereda que dá para começar. Sem esta parte,
 * terminar uma coisa a tirava da seção e não punha nada no lugar — a seção
 * encolhia justamente para quem estava avançando. A regra de quem entra em
 * cada parte mora em `lib/continuar.ts`.
 *
 * ── O cartão inteiro é um link só, e ele leva à lição ────────────────────
 * Os cartões de baixo levam à trilha; estes levam ao próximo passo, que é o
 * que eles prometem — a primeira lição, no cartão de começar. Por isso não há
 * segundo destino dentro deles, e cada um pode ser um `<Link>` inteiro sem
 * âncora dentro de âncora.
 *
 * ── Espera tudo chegar ───────────────────────────────────────────────────
 * Desenhar com metade dos dados poria a ordem errada na tela por um instante,
 * ou ofereceria para começar uma vereda que a pessoa já tem pela metade — e
 * ela clicaria no cartão que estava no lugar do outro.
 */

/*
  Quantos cartões de "em andamento" aparecem.

  Quatro, porque a grade tem duas colunas — a mesma conta do resumo das
  veredas. Quem está no meio de mais de quatro coisas tem as outras nas listas
  logo abaixo, e a seção diz quantas são. Os de começar não têm teto: são um
  por grupo, e os grupos são poucos.
*/
const NA_FILA = 4;

/* "Trilha de Computação", "Vereda de Escritório" — a mesma frase do cartão de
   vereda das listas de baixo, para que o grupo se leia igual nos dois lugares. */
const rotuloDoGrupo = (c: ParaContinuar) =>
  `${c.tipo === 'trilha' ? 'Trilha' : 'Vereda'} de ${c.grupo}`;

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
            {rotuloDoGrupo(c)} · {c.feitas} de {c.total} {c.total === 1 ? 'lição' : 'lições'}
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

/*
  O cartão de começar é menor, e não tem barra.

  Uma barra em 0% em cada cartão seria uma fileira de trilhos vazios dizendo o
  que a pessoa não fez — o contrário de convite. E o tamanho menor deixa claro
  de relance qual parte é o que já se começou: o olho acha primeiro o que está
  pela metade, que é o que tem mais chance de ser terminado hoje.
*/
function CartaoParaComecar({ c }: { c: ParaContinuar }) {
  const cores = coresDoProgresso(0);
  return (
    <Link
      to={c.proxima.rota}
      className="card p-3 flex items-center gap-3 min-w-0"
      style={{ transition: 'border-color 0.2s' }}
      onMouseEnter={ev => (ev.currentTarget.style.borderColor = cores.bordaAoPassar)}
      onMouseLeave={ev => (ev.currentTarget.style.borderColor = 'var(--color-border)')}>
      <Emblema code={c.code} status="em-andamento" size={44} />
      <div className="min-w-0 flex-1">
        <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
          {rotuloDoGrupo(c)} · {c.total} {c.total === 1 ? 'lição' : 'lições'}
        </p>
        <h3 className="font-bold leading-snug">{c.nome}</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Primeira lição: {c.proxima.titulo}
        </p>
      </div>
      <span className="flex-none inline-flex items-center gap-1 text-sm font-bold"
        style={{ color: 'var(--color-primary)' }}>
        <Play className="w-4 h-4" /> Começar
      </span>
    </Link>
  );
}

export default function ContinueAprendendo({
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
  const { andamento, percursoDe, concluida, carregando: carregandoVeredas } = useVeredas(userId);
  const { licoesFeitas, loading: carregandoLicoes } = useLicoesConcluidas(userId);

  if (carregando || carregandoVeredas || carregandoLicoes) return null;

  /* Liberada é a regra da tela da trilha inteira: o pré-requisito **e** as
     veredas essenciais. Oferecer para começar uma trilha que abriria trancada
     seria o cartão de "Começar" levando a um cadeado. */
  const veredasFeitas = andamento.filter(a => a.concluida).map(a => a.id);
  const { emAndamento, paraComecar } = continueAprendendo({
    trilhas: getFamilias(),
    veredas: veredasPorFamilia(),
    progress,
    feitas: licoesFeitas,
    ultimaAtividade,
    percursoDe,
    trilhaLiberada: e => liberada(e) && !trilhaTravada(e.code, veredasFeitas),
    /* A vereda bloqueada fica de fora mesmo com lição vencida: ela pode ter
       ganhado uma exigência depois, e o cartão levaria a uma porta trancada. */
    veredaLiberada: v => veredasQueFaltamAntes(v, concluida).length === 0,
  });
  if (emAndamento.length === 0 && paraComecar.length === 0) return null;

  const mostrados = emAndamento.slice(0, NA_FILA);
  const outros = emAndamento.length - mostrados.length;

  return (
    <section className="space-y-4" aria-labelledby="continue-titulo">
      <div>
        <h2 id="continue-titulo" className="text-lg font-bold" style={{ color: 'var(--color-text-soft)' }}>
          Continue aprendendo
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          {mostrados.length > 0
            ? 'O que você começou, do mais recente para o mais antigo, e o próximo passo em cada grupo que ainda não tem nada em andamento.'
            : 'Um bom começo em cada grupo — escolha um e dê o primeiro passo.'}
        </p>
      </div>

      {mostrados.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>Em andamento</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {mostrados.map(c => <CartaoParaContinuar key={`${c.tipo}-${c.code}`} c={c} />)}
          </div>
          {outros > 0 && (
            <p className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
              Mais {outros} {outros === 1 ? 'está' : 'estão'} pela metade nas listas abaixo.
            </p>
          )}
        </div>
      )}

      {paraComecar.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>
            Próximo passo em cada grupo
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {paraComecar.map(c => <CartaoParaComecar key={`${c.tipo}-${c.code}`} c={c} />)}
          </div>
        </div>
      )}
    </section>
  );
}
