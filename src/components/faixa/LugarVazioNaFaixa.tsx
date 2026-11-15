import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Circle, HardHat, Lightbulb, Target, X } from 'lucide-react';
import type { LugarVazio } from '../../lib/faixa/lugarVazio';

/*
  O cartão do lugar vazio: o que é a peça que falta e como ela chega.

  É irmão do cartão da insígnia conquistada (`ExplicacaoDaInsignia`), e pelas
  mesmas razões escritas lá: cartão aberto, e não dica de ferramenta, porque
  no celular a dica não abre; três saídas (Esc, botão, clique fora); e
  desenhado no `body`, porque o `backdrop-filter` do `.card` prenderia o
  `position: fixed` dentro de quem o chamou.
*/
export default function LugarVazioNaFaixa({ lugar, aoFechar }: { lugar: LugarVazio; aoFechar: () => void }) {
  const fechar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fechar.current?.focus();
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
        style={{ maxWidth: 400, maxHeight: '88vh', overflowY: 'auto' }}
        role="dialog"
        aria-modal="true"
        aria-label={`Lugar vazio: ${lugar.titulo}`}
        onClick={ev => ev.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide m-0" style={{ color: 'var(--color-text-faint)' }}>
              Ainda não está na sua faixa
            </p>
            <h2 className="font-bold leading-tight mt-1">{lugar.titulo}</h2>
            <p className="text-xs mt-0.5 m-0" style={{ color: 'var(--color-text-dim)' }}>{lugar.subtitulo}</p>
          </div>
          <button
            ref={fechar}
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="p-1 rounded transition hover:opacity-70 flex-shrink-0"
            style={{ color: 'var(--color-text-dim)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {lugar.dica && (
          <Linha icone={<Lightbulb className="w-4 h-4" />} rotulo="Dica" valor={lugar.dica} />
        )}
        <Linha icone={<Target className="w-4 h-4" />} rotulo={lugar.dica ? 'Sobre os segredos' : 'Como se conquista'} valor={lugar.como} />

        {lugar.passos && (
          <ul className="space-y-1.5 m-0 p-0 list-none" aria-label="O que fecha este Mestrado">
            {lugar.passos.map(passo => (
              <li key={passo.nome} className="flex items-center gap-2 text-sm" style={{ color: passo.feito ? 'var(--color-text-soft)' : 'var(--color-text-dim)' }}>
                {passo.feito
                  ? <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-success)' }} aria-hidden="true" />
                  : <Circle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
                <span>{passo.nome}</span>
                <span className="sr-only">{passo.feito ? ' — concluída' : ' — falta'}</span>
              </li>
            ))}
          </ul>
        )}

        {lugar.emBreve && (
          <p className="text-xs m-0 flex items-center gap-1.5" style={{ color: 'var(--color-text-faint)' }}>
            <HardHat className="w-3.5 h-3.5" aria-hidden="true" />
            {lugar.passos ? 'Parte do que fecha este Mestrado ainda está sendo escrita.' : 'Em breve.'}
          </p>
        )}

        {lugar.caminho && (
          <Link
            to={lugar.caminho.para}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            onClick={aoFechar}
          >
            {lugar.caminho.rotulo} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>,
    document.body,
  );
}

function Linha({ icone, rotulo, valor }: { icone: React.ReactNode; rotulo: string; valor: string }) {
  return (
    <div className="flex gap-2.5">
      <span className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} aria-hidden="true">{icone}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide m-0" style={{ color: 'var(--color-text-faint)' }}>{rotulo}</p>
        <p className="text-sm m-0" style={{ color: 'var(--color-text-soft)' }}>{valor}</p>
      </div>
    </div>
  );
}
