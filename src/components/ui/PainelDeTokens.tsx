import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import Emblema from './Emblema';
import { MarcaEmTexto } from './BrandMark';
import { percursoDoCertificado } from '../../lib/certificados';
import type { Certification } from '../../types';

/*
  Os Token.Web() de quem está olhando — o mesmo painel no painel e na estante.

  ── Eram dois, e cada um tinha metade da razão ────────────────────────────
  O do painel dava **espaço** a cada documento: uma fileira larga, com o nome
  do percurso, o código e a seta, num cartão que se atravessa inteiro com o
  dedo. O da estante dizia o **nome certo** — "Seus Token.Web()", e não "Suas
  Certificações", que é a palavra que a plataforma trocou — e desenhava o
  emblema do percurso em vez de um troféu genérico igual para todos.

  Cada um deixava de fora o acerto do outro, e quem passasse de uma tela para
  a outra encontrava o mesmo prêmio com duas caras. Aqui é um só: o espaço de
  lá, o nome e os emblemas de cá.

  ── Por que repetir o painel nas duas telas ───────────────────────────────
  Redundância aqui é economia: o Token.Web() é o prêmio maior, e obrigar
  alguém a lembrar em qual das duas telas ele mora é cobrar esforço para achar
  o que já foi conquistado.

  ── Só os ativos ──────────────────────────────────────────────────────────
  A estante já filtrava; o painel listava tudo, e um Token.Web() revogado
  aparecia ali como conquista. Isso desfaz na tela a decisão que a liderança
  tomou, sem erro nenhum e sem ninguém saber. Quem quer ver o revogado abre o
  documento, que é onde a revogação está escrita.
*/

/*
  O realce mora aqui, e não em `onMouseEnter`.

  Era assim que o painel pintava a borda, e é um realce que só o mouse
  alcança: quem navega por teclado atravessava os cartões sem nenhum sinal de
  onde estava. `:focus-visible` resolve os dois com a mesma regra.
*/
const CSS = `
.token-cartao {
  border: 1px solid var(--color-border);
  transition: border-color .2s;
}
.token-cartao:hover { border-color: var(--color-secondary-a40); }
.token-cartao:focus-visible {
  border-color: var(--color-secondary);
  outline: 2px solid var(--color-secondary);
  outline-offset: 2px;
}
`;

export default function PainelDeTokens({ certifications, carregando = false }: {
  certifications: Certification[];
  /** Enquanto a consulta não voltou — para o vazio não parecer resposta. */
  carregando?: boolean;
}) {
  const tokens = certifications.filter(c => c.status === 'active');

  return (
    <section className="card p-6 space-y-4" style={{ borderColor: 'var(--color-secondary-a20)' }}>
      <style>{CSS}</style>
      <h2 className="font-bold flex items-center gap-2">
        <Award className="w-5 h-5 flex-none" style={{ color: 'var(--color-secondary)' }} />
        <span className="flex items-center gap-1.5">Seus <MarcaEmTexto marca="token" /></span>
      </h2>

      {carregando ? (
        <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Procurando...</p>
      ) : tokens.length === 0 ? (
        /* O convite aparece nas duas telas, e não só na estante: quem ainda
           não tem nenhum é justamente quem precisa saber que ele existe e de
           onde vem. */
        <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          O primeiro sai sozinho quando você concluir uma trilha ou uma vereda inteira.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tokens.map(cert => {
            /*
              Pelo código do percurso, e pelos **dois** currículos: era
              `getSpecialty`, que só conhece trilha, e o certificado de uma
              vereda saía escrito só com o código ao lado de "AP034 Internet".
            */
            const percurso = percursoDoCertificado(cert.curriculum_code);
            return (
              <Link
                key={cert.id}
                to={`/certificado/${cert.code}`}
                className="token-cartao block p-4 rounded-lg group"
                style={{ backgroundColor: 'var(--color-bg-input)' }}
              >
                <div className="flex items-center gap-3">
                  {/* Quem sabe a forma da arte é o `Emblema`: oval para trilha,
                      círculo para vereda, sem lista de códigos por forma. */}
                  <Emblema code={cert.curriculum_code} status="certificado" size={48} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{percurso.nome}</p>
                    <p className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>
                      {cert.code}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 flex-none" style={{ color: 'var(--color-text-faint)' }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
