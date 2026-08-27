import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CircleAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMiniTrilha } from '../curriculum/miniTrilhas';
import LeitorDeMiniTrilha from '../components/LeitorDeMiniTrilha';

/*
 * Uma mini-trilha, fora de laboratório nenhum.
 *
 * Dentro do editor ela abre por cima do arquivo, para consulta no meio do
 * trabalho. Aqui é a tela inteira, para quem quer ler antes de começar — ou
 * depois, sem ter lição aberta.
 *
 * É a mesma peça nos dois lugares: uma referência que diverge do que o
 * laboratório mostra é pior do que referência nenhuma.
 */
export default function MiniTrilhaPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const trilha = getMiniTrilha(id);

  if (!trilha) {
    return (
      <div className="card p-8 text-center">
        <CircleAlert className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-faint)' }} />
        <h1 className="text-xl font-bold mb-2">Mini-trilha não encontrada</h1>
        <p className="mb-5" style={{ color: 'var(--color-text-muted)' }}>
          O endereço aponta para uma mini-trilha que não existe.
        </p>
        <Link to="/" className="btn-primary">Voltar ao Início</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/" className="flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Início
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{trilha.titulo}</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{trilha.resumo}</p>
        </div>
      </div>

      {/* Altura fixa porque o leitor tem rolagem própria em duas colunas:
          deixar a página inteira rolar tiraria o sumário da vista justamente
          quando ele é útil. */}
      <div className="rounded-xl overflow-hidden" style={{ height: 'min(78vh, 720px)' }}>
        <LeitorDeMiniTrilha trilha={trilha} userId={profile?.id} />
      </div>
    </div>
  );
}
