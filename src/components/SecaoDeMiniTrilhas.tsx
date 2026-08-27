import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Check, ArrowRight } from 'lucide-react';
import { MINI_TRILHAS } from '../curriculum/miniTrilhas';
import { useMiniTrilhas } from '../hooks/useMiniTrilhas';

/*
 * A seção das mini-trilhas, no pé da página inicial.
 *
 * Última de propósito: quem abre o painel vem para a trilha em que está, e as
 * mini-trilhas são o extra. Pô-las em cima disputaria a atenção com o que a
 * pessoa veio fazer.
 *
 * A arte de cada uma mora em `public/assets/mini-trilhas/<CODIGO>.svg`, do
 * mesmo jeito que a das trilhas. Enquanto ela não existe, o cartão mostra o
 * ícone de livro — um código sem arte não deixa buraco na tela.
 */
/**
 * A arte da mini-trilha, com o livro no lugar dela enquanto não existe.
 *
 * O ícone não fica ao lado da imagem: fica no lugar dela. Os dois juntos é o
 * que o primeiro rascunho fazia, e o cartão saía com duas figuras dizendo a
 * mesma coisa.
 */
function ArteDaMiniTrilha({ codigo }: { codigo: string }) {
  const [semArte, setSemArte] = useState(false);
  if (semArte) {
    return <BookOpen className="w-12 h-12 flex-none" style={{ color: 'var(--color-primary-hover)' }} />;
  }
  return (
    <img
      src={`${import.meta.env.BASE_URL}assets/mini-trilhas/${codigo}.svg`}
      alt=""
      className="w-12 h-12 flex-none"
      onError={() => setSemArte(true)}
    />
  );
}

export default function SecaoDeMiniTrilhas({ userId }: { userId?: string }) {
  const { andamento } = useMiniTrilhas(userId);
  if (MINI_TRILHAS.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-soft)' }}>Mini-Trilhas</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          Material curto, que nasceu de uma trilha e vale sozinho. Não conta no
          percentual de nenhuma especialidade — é bônus, e rende insígnia.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {MINI_TRILHAS.map(t => {
          const a = andamento.find(x => x.id === t.id);
          const proporcao = a && a.total ? a.lidos / a.total : 0;
          return (
            <Link key={t.id} to={`/mini-trilha/${t.id}`}
              className="card p-6 block transition group"
              style={{ transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary-a40)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '')}>
              <div className="flex items-start gap-4">
                <ArteDaMiniTrilha codigo={t.codigo} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold">{t.titulo}</h3>
                    <span className="font-mono text-xs" style={{ color: 'var(--color-text-faint)' }}>{t.codigo}</span>
                    {a?.concluida && (
                      <span className="flex items-center gap-1 text-xs font-semibold"
                        style={{ color: 'var(--color-success)' }}>
                        <Check className="w-3.5 h-3.5" /> concluída
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>{t.resumo}</p>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'var(--color-bg-hover)' }}>
                      <span className="block h-full rounded-full" style={{
                        width: `${proporcao * 100}%`,
                        background: a?.concluida ? 'var(--color-success)' : 'var(--color-primary)',
                      }} />
                    </span>
                    <span className="text-xs whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                      {a ? `${a.lidos} de ${a.total}` : '—'}
                    </span>
                    <ArrowRight className="w-4 h-4 flex-none" style={{ color: 'var(--color-text-faint)' }} />
                  </div>

                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-faint)' }}>
                    Saiu da trilha {t.origem}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
