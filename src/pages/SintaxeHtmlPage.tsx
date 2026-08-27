import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReferenciaDeHtml from '../components/ReferenciaDeHtml';

/*
 * A mini-trilha de sintaxe fora do laboratório.
 *
 * Dentro do editor ela abre por cima do arquivo, para consulta no meio do
 * trabalho. Aqui ela é a tela inteira, para quem quer ler antes de começar —
 * ou depois, sem ter uma lição aberta.
 *
 * É a mesma peça nos dois lugares: uma referência que diverge do que o
 * laboratório mostra é pior do que referência nenhuma.
 */
export default function SintaxeHtmlPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/" className="flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Início
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Sintaxe do HTML</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
            O que é uma tag, o que é um atributo, e como se escreve cada peça de
            uma página. Cada exemplo roda ao lado.
          </p>
        </div>
      </div>

      {/* Altura fixa porque a referência tem rolagem própria em duas colunas:
          deixar a página inteira rolar tiraria o sumário da vista justamente
          quando ele é útil. */}
      <div className="rounded-xl overflow-hidden" style={{ height: 'min(78vh, 720px)' }}>
        <ReferenciaDeHtml />
      </div>
    </div>
  );
}
