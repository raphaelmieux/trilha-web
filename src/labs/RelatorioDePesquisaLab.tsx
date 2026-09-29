import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RedacaoGuiadaLab from './RedacaoGuiadaLab';
import { ETAPAS, paginaPorId, type Etapa, type Ficha } from './pesquisaDoMilenio';
import { useMontado } from '../hooks/useMontado';
import { FileSearch, Loader2 } from 'lucide-react';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * O relatório do bug do milênio — requisito 6 da AP045, segunda metade.
 *
 * Ele é a redação guiada de sempre, com duas diferenças que não cabem num
 * `if` dentro dela.
 *
 * A primeira é a chave: `AP045-bug-do-milenio`, e não `AP045`. A trilha já
 * gasta a chave dela no relatório da evolução da computação, do requisito 2, e
 * com a chave antiga entregar este sobrescreveria aquele em silêncio — depois
 * de escrito. É para isso que `text_projects` ganhou a coluna `projeto`.
 *
 * A segunda é o material: as fichas da lição anterior ficam ao lado do campo,
 * filtradas pela pergunta da vez. É delas que o texto sai, e é por isso que o
 * roteiro daqui não manda pesquisar.
 *
 * ── De onde as fichas vêm ────────────────────────────────────────────────
 * Do evento `pesquisa_concluida`, na metadata. Sem tabela nova: é a decisão de
 * "lição vencida é um evento", a mesma pela qual o progresso da vereda sai dos
 * eventos que já existem. E fica no servidor, e não no navegador, porque quem
 * pesquisa no computador do clube e escreve em casa não perderia a pesquisa no
 * caminho — é a razão de `useRascunhoLocal` guardar o texto **e** o servidor
 * guardar o projeto.
 *
 * ── E quando não há pesquisa nenhuma ─────────────────────────────────────
 * A lição não se abre com o campo em branco fingindo que está tudo certo: ela
 * diz que a pesquisa não foi feita e dá o caminho de volta. Abrir assim seria
 * pedir um relatório sobre fichas que não existem, e o desbravador concluiria
 * que o material sumiu.
 */

const PROJETO = 'AP045-bug-do-milenio';
/** A lição de onde as fichas vêm. Nomeada aqui para o aviso poder citá-la. */
const LICAO_DA_PESQUISA = 'Pesquisando o bug do milênio em sites especializados';

export default function RelatorioDePesquisaLab(props: Props) {
  const [fichas, setFichas] = useState<Ficha[] | null>(null);
  const [carregando, setCarregando] = useState(true);
  const montado = useMontado();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('activity_events')
        .select('metadata')
        .eq('user_id', props.userId)
        .eq('event_type', 'pesquisa_concluida')
        .order('created_at', { ascending: false })
        .limit(1);
      if (!montado.current) return;
      /* A mais recente, e não a primeira: quem refaz a pesquisa espera escrever
         a partir do que guardou agora. */
      const bruto = (data?.[0]?.metadata ?? {}) as { fichas?: Ficha[] };
      setFichas(Array.isArray(bruto.fichas) ? bruto.fichas : []);
      setCarregando(false);
    })();
  }, [props.userId, montado]);

  if (carregando) {
    return (
      <div className="card p-8 text-center">
        <Loader2 className="w-6 h-6 mx-auto animate-spin" style={{ color: 'var(--color-text-dim)' }} />
        <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Buscando as fichas da sua pesquisa…
        </p>
      </div>
    );
  }

  if (!fichas || fichas.length === 0) {
    return (
      <div className="card p-8 text-center">
        <FileSearch className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-dim)' }} />
        {/* O nome desce do currículo, como em todo laboratório: ele diz em que
            lição a pessoa está, e o aviso vem abaixo. Escrever aqui um título
            próprio faria esta tela ser a única da casa com nome inventado. */}
        <h1 className="text-xl font-bold mb-2">{props.lessonTitle}</h1>
        <p className="mb-2 font-medium" style={{ color: 'var(--color-warning)' }}>
          A pesquisa ainda não foi feita.
        </p>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Este relatório se escreve a partir das fichas que você guarda na lição
          “{LICAO_DA_PESQUISA}”. Faça aquela lição primeiro: as fichas aparecem
          aqui ao lado de cada pergunta.
        </p>
        <Link to={`/especialidade/${props.specialtyCode}`} className="btn-primary">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  return (
    <RedacaoGuiadaLab
      {...props}
      projeto={PROJETO}
      material={etapaId => <FichasDaEtapa fichas={fichas} etapa={etapaId as Etapa} />}
    />
  );
}

/**
 * As fichas daquela pergunta, e só elas.
 *
 * A fonte vai junto de cada uma, como foi guardada: uma ficha sem a página de
 * onde saiu é um fato sem onde voltar, e é justamente o hábito que a lição
 * anterior existe para instalar.
 */
function FichasDaEtapa({ fichas, etapa }: { fichas: Ficha[]; etapa: Etapa }) {
  const daEtapa = fichas.filter(f => f.etapa === etapa);
  const titulo = ETAPAS.find(e => e.id === etapa)?.titulo ?? '';

  return (
    <div
      className="rounded-lg p-3 mb-3"
      style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}
    >
      <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-dim)' }}>
        Suas fichas — {titulo}
      </p>
      {daEtapa.length === 0
        ? (
          /* A etapa de opinião não tem ficha, e as de fato podem não ter se a
             pesquisa foi entregue antes de cobri-las. Dizer isso é melhor do
             que um quadro vazio, que parece defeito. */
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Você não guardou ficha para esta pergunta — aqui a resposta é sua.
          </p>
        )
        : (
          <ul className="space-y-2">
            {daEtapa.map(f => (
              <li key={`${f.pagina}-${f.fato}`} className="text-sm">
                <span style={{ color: 'var(--color-text)' }}>{f.fato}</span>
                <span className="block text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
                  {paginaPorId(f.pagina)?.url ?? f.pagina}
                </span>
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
