import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Check, ArrowRight } from 'lucide-react';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { useVeredas } from '../hooks/useVeredas';

/*
 * A seção das veredas, no painel.
 *
 * Último bloco de cursos, antes das certificações: a vereda é um percurso como
 * os de cima, e por isso fica junto deles — depois, porque é o extra. Ficou uma
 * vez no pé da página, atrás do mural de atividade, onde ninguém procura curso.
 *
 * A arte de cada uma mora em `public/assets/veredas/<CODIGO>.svg`, do mesmo
 * jeito que a das trilhas. Enquanto ela não existe, o cartão mostra o ícone de
 * livro — um código sem arte não deixa buraco na tela.
 */
/**
 * A arte da mini-trilha, com o livro no lugar dela enquanto não existe.
 *
 * O ícone não fica ao lado da imagem: fica no lugar dela. Os dois juntos é o
 * que o primeiro rascunho fazia, e o cartão saía com duas figuras dizendo a
 * mesma coisa.
 */
function ArteDaVereda({ codigo }: { codigo: string }) {
  const [semArte, setSemArte] = useState(false);
  if (semArte) {
    return <BookOpen className="w-12 h-12 flex-none" style={{ color: 'var(--color-primary-hover)' }} />;
  }
  return (
    <img
      src={`${import.meta.env.BASE_URL}assets/veredas/${codigo}.svg`}
      alt=""
      className="w-12 h-12 flex-none"
      onError={() => setSemArte(true)}
    />
  );
}

export default function SecaoDeVeredas({ userId }: { userId?: string }) {
  const { andamento } = useVeredas(userId);
  if (VEREDAS.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-soft)' }}>Veredas</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          Vereda é o caminho estreito que sai da trilha. Percurso curto, com
          teoria e laboratório, que nasceu de uma trilha e vale sozinho — não
          conta no percentual de especialidade nenhuma, e rende insígnia.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {VEREDAS.map(v => {
          const a = andamento.find(x => x.id === v.id);
          const proporcao = a && a.total ? a.vencidas / a.total : 0;
          return (
            <Link key={v.id} to={`/vereda/${v.id}`}
              className="card p-6 block transition group"
              style={{ transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary-a40)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '')}>
              <div className="flex items-start gap-4">
                <ArteDaVereda codigo={v.codigo} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold">{v.titulo}</h3>
                    <span className="font-mono text-xs" style={{ color: 'var(--color-text-faint)' }}>{v.codigo}</span>
                    {a?.concluida && (
                      <span className="flex items-center gap-1 text-xs font-semibold"
                        style={{ color: 'var(--color-success)' }}>
                        <Check className="w-3.5 h-3.5" /> concluída
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>{v.resumo}</p>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'var(--color-bg-hover)' }}>
                      <span className="block h-full rounded-full" style={{
                        width: `${proporcao * 100}%`,
                        background: a?.concluida ? 'var(--color-success)' : 'var(--color-primary)',
                      }} />
                    </span>
                    <span className="text-xs whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                      {a ? `${a.vencidas} de ${a.total} lições` : `${licoesDaVereda(v).length} lições`}
                    </span>
                    <ArrowRight className="w-4 h-4 flex-none" style={{ color: 'var(--color-text-faint)' }} />
                  </div>

                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-faint)' }}>
                    Saiu da trilha {v.origem}
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
