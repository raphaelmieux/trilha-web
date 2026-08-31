import { Link } from 'react-router-dom';
import { HardHat } from 'lucide-react';
import { VEREDAS, veredasPorFamilia, licoesDaVereda, type Vereda } from '../curriculum/veredas';
import { useVeredas, type AndamentoDeVereda } from '../hooks/useVeredas';
import { nomeCompleto } from '../types';
import { coresDoProgresso, corDoPercentual } from '../lib/coresDoProgresso';
import Emblema from './ui/Emblema';
import ProgressBar from './ui/ProgressBar';

/*
 * As veredas no painel.
 *
 * Último bloco de cursos, antes das certificações: a vereda é um percurso como
 * os de cima, e por isso fica junto deles — depois, porque é o extra. Ficou uma
 * vez no pé da página, atrás do mural de atividade, onde ninguém procura curso.
 *
 * ── O mesmo cartão da trilha ─────────────────────────────────────────────
 * Emblema, nome completo, família, barra de progresso, e a contagem embaixo.
 * Não é imitação: são a mesma coisa vista de dois tamanhos, e um desbravador
 * que aprendeu a ler o cartão de uma trilha não deveria ter de aprender a ler
 * outro. Em construção acinzenta e tira o link, como lá.
 *
 * A arte sai da mesma pasta e do mesmo componente das trilhas — os emblemas
 * viraram PNG e passaram a conviver em `public/assets/specialties`. Um código
 * sem arte cai no ícone de reserva do `Emblema`, e não deixa buraco.
 */

function CardDaVereda({ v, andamento }: { v: Vereda; andamento?: AndamentoDeVereda }) {
  const identificacao = (
    <div className="min-w-0">
      <h3 className="text-xl font-bold">{nomeCompleto(v)}</h3>
      <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
        Vereda de {v.familia}
      </p>
    </div>
  );

  /* Anunciada: o clube vê o que vem, acinzentado e sem link. */
  if (v.emConstrucao) {
    return (
      <div className="card p-6 opacity-60" style={{ border: '2px dashed var(--color-border)' }}>
        <div className="flex items-center gap-4 mb-3">
          <Emblema code={v.code} status="bloqueado" />
          {identificacao}
        </div>
        <span className="text-xs px-2 py-1 rounded inline-flex items-center gap-1 mb-2"
          style={{ backgroundColor: 'var(--color-secondary-a08)', color: 'var(--color-secondary)' }}>
          <HardHat className="w-3.5 h-3.5" /> Em construção
        </span>
        <p className="text-sm" style={{ color: 'var(--color-text-faint)' }}>{v.description}</p>
      </div>
    );
  }

  const total = andamento?.total ?? licoesDaVereda(v).length;
  const vencidas = andamento?.vencidas ?? 0;
  const percent = total ? Math.round((vencidas / total) * 100) : 0;
  const cores = coresDoProgresso(percent);

  return (
    <Link to={`/vereda/${v.code}`} className="card p-6 block transition"
      style={{
        borderColor: percent === 100 ? 'var(--color-success-a20)' : 'var(--color-border)',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={ev => (ev.currentTarget.style.borderColor = cores.bordaAoPassar)}
      onMouseLeave={ev => (ev.currentTarget.style.borderColor = percent === 100 ? 'var(--color-success-a20)' : 'var(--color-border)')}>
      <div className="flex items-center gap-4 mb-4">
        <Emblema code={v.code} status={percent === 100 ? 'concluido' : 'em-andamento'} />
        {identificacao}
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span style={{ color: 'var(--color-text-muted)' }}>Progresso</span>
          <span className="font-semibold" style={{ color: corDoPercentual(percent) }}>{percent}%</span>
        </div>
        <ProgressBar percent={percent} color={cores.gradiente} />
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
        {vencidas} de {total} {total === 1 ? 'lição vencida' : 'lições vencidas'}
        {v.origem && ` · saiu da trilha ${v.origem}`}
      </p>
    </Link>
  );
}

export default function SecaoDeVeredas({ userId }: { userId?: string }) {
  const { andamento } = useVeredas(userId);
  if (VEREDAS.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-soft)' }}>Veredas</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          Vereda é o caminho estreito que sai da trilha. Percurso curto, com
          módulos de teoria e laboratórios a vencer, que vale sozinho — não conta
          no percentual de especialidade nenhuma, e rende insígnia.
        </p>
      </div>

      {veredasPorFamilia().map(({ nome, veredas }) => (
        <div key={nome} className="space-y-3">
          <h3 className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>{nome}</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {veredas.map(v => (
              <CardDaVereda key={v.id} v={v} andamento={andamento.find(a => a.id === v.id)} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
