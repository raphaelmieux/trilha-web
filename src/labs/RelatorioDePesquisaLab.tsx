import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, NotebookPen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import RedacaoGuiadaLab from './RedacaoGuiadaLab';
import { PESQUISA_DO_RELATORIO, lerFichas } from './relatorioDePesquisa';
import type { FichaEntregue } from './pesquisaDoBug';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * O relatório escrito a partir da pesquisa — AP045 requisito 6, segunda
 * metade.
 *
 * Não é um laboratório novo de escrita: é a redação guiada, com o projeto
 * próprio e as fichas da pesquisa. Duas telas de redação divergiriam no
 * primeiro ajuste, e a conferência de fatos, a união e o rascunho no
 * navegador já estão lá. O que este arquivo faz é achar as fichas.
 *
 * Elas vêm do evento que a pesquisa gravou ao ser entregue — "lição vencida é
 * um evento", e não tabela nova —, da mais recente, porque quem refez a
 * pesquisa quer escrever com o caderno de agora. Sem pesquisa entregue, a tela
 * diz qual é a lição que falta, e leva até ela.
 */
export default function RelatorioDePesquisaLab(props: Props) {
  const { userId, lessonCode, specialtyCode } = props;
  const ligacao = PESQUISA_DO_RELATORIO[lessonCode];
  const [fichas, setFichas] = useState<FichaEntregue[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!ligacao) return;
    /* A consulta pode voltar depois de a tela sair — ver `useMontado`. */
    let vivo = true;
    (async () => {
      const { data, error } = await supabase
        .from('activity_events')
        .select('metadata, created_at')
        .eq('user_id', userId)
        .eq('event_type', 'pesquisa_concluida')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!vivo) return;
      if (error) { setErro(true); return; }
      const daPesquisa = (data ?? []).find(e => {
        const m = e.metadata as Record<string, unknown> | null;
        return m?.lessonCode === ligacao.licaoDaPesquisa;
      });
      setFichas(daPesquisa ? lerFichas(daPesquisa.metadata) : []);
    })();
    return () => { vivo = false; };
  }, [userId, ligacao]);

  if (!ligacao) {
    return <div className="card p-6"><p>Esta lição não tem uma pesquisa ligada a ela.</p></div>;
  }

  if (erro) {
    return (
      <div className="card p-6">
        <p style={{ color: 'var(--color-text-muted)' }}>
          Não foi possível buscar as fichas da sua pesquisa agora. Tente de novo em instantes — o que você
          pesquisou continua guardado.
        </p>
      </div>
    );
  }

  if (fichas === null) {
    return (
      <div className="card p-6 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
        <Loader2 className="w-4 h-4 animate-spin" /> Buscando as fichas da sua pesquisa...
      </div>
    );
  }

  if (fichas.length === 0) {
    return (
      <div className="card p-6 text-center">
        <NotebookPen className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-secondary)' }} />
        <h2 className="text-lg font-bold mb-2">Primeiro, a pesquisa</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Este relatório é escrito a partir das fichas que você faz na pesquisa. Entregue a pesquisa e
          volte aqui: as fichas aparecem ao lado de cada pergunta.
        </p>
        <Link
          to={`/licao/${specialtyCode}/${ligacao.moduloDaPesquisa}/${ligacao.licaoDaPesquisa}`}
          className="btn-primary mt-4 inline-flex"
        >
          Ir para a pesquisa
        </Link>
      </div>
    );
  }

  return <RedacaoGuiadaLab {...props} projeto={ligacao.projeto} fichas={fichas} />;
}
