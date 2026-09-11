import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import { MarcaEmTexto } from './BrandMark';
import type { Certification } from '../../types';

/**
 * O Token.Web() emitido, no cartão do percurso que o rendeu.
 *
 * Era um `<div>` dentro do `<Link>` do cartão — quer dizer, um aviso com cara
 * de botão que levava para a trilha, como todo o resto do cartão. Quem via
 * "Token.Web() emitido!" clicava ali esperando o certificado, chegava na
 * trilha, e só então achava o botão de verdade no cabeçalho. Dois cliques para
 * o documento, e o primeiro deles parecendo o certo.
 *
 * Agora é um link próprio, e por isso o cartão **deixou de ser um `<Link>` só**:
 * âncora dentro de âncora é HTML inválido, o navegador desmonta o encaixe e
 * quem decide o que o clique de dentro faz passa a ser ele. É o mesmo defeito
 * do `<button>` dentro de `<button>` que o laboratório de Configurações já
 * teve — o cartão virou uma caixa com dois links irmãos.
 *
 * Um por cartão, e não dois parecidos: a trilha e a vereda mostram o mesmo
 * documento, e duas cópias divergem no primeiro ajuste.
 */
export default function TokenNoCartao({ cert }: { cert: Certification }) {
  return (
    <Link
      to={`/certificado/${cert.code}`}
      className="mt-3 p-2 rounded-lg text-sm flex items-center gap-2 transition group"
      style={{
        backgroundColor: 'var(--color-secondary-a08)',
        border: '1px solid var(--color-secondary-a20)',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-secondary-a40)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-secondary-a20)')}
    >
      <Award className="w-5 h-5 flex-none group-hover:scale-110 transition"
        style={{ color: 'var(--color-secondary)' }} />
      <span className="flex-1 min-w-0">
        <span className="font-semibold block" style={{ color: 'var(--color-secondary)' }}>
          <MarcaEmTexto marca="token" /> emitido!
        </span>
        {/* O código truncado é reconhecimento, e não conferência: quem confere
            abre o certificado, que é justamente aonde este link leva. */}
        <span className="text-xs font-mono block truncate" style={{ color: 'var(--color-text-dim)' }}>
          {cert.code}
        </span>
      </span>
      {/* A seta é o que diz que daqui se sai. Sem ela o bloco continua parecendo
          aviso, que é como ele já enganou uma vez. */}
      <ArrowRight className="w-4 h-4 flex-none" style={{ color: 'var(--color-secondary)' }} />
    </Link>
  );
}
