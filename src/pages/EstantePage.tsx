import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBadges } from '../hooks/useBadges';
import { useCertifications } from '../hooks/useCertifications';
import BadgeIcon from '../components/ui/BadgeIcon';
import ExplicacaoDaInsignia from '../components/ui/ExplicacaoDaInsignia';
import { MarcaEmTexto } from '../components/ui/BrandMark';
import PainelDeTokens from '../components/ui/PainelDeTokens';
import { LoadingState } from '../components/ui/PageState';
import { fileirasDaEstante, type LugarNaEstante } from '../lib/estante';
import { CLASSES } from '../lib/nivelDaInsignia';
import { ALTURA, LARGURA, formaDaClasse } from '../lib/formaDaInsignia';
import { Trophy } from 'lucide-react';
import type { InsigniaConquistada } from '../lib/conquista';

/*
 * A estante: as cento e trinta e duas insígnias e os Token.Web(), num lugar só.
 *
 * ── Por que uma página, e por que ela mostra o que falta ─────────────────
 * A estante do painel mostra o **topo** de cada família e conta o que falta
 * como número, de propósito: lá ela divide a tela com o percurso, e desenhar
 * cento e vinte silhuetas apagadas em cima de quem só queria estudar
 * transforma a conquista em lista de pendências.
 *
 * Aqui é o contrário, e é o que justifica a página existir. Quem abre a
 * estante veio ver a estante: o lugar vazio é o que dá tamanho ao que já está
 * lá, e é o que responde "quanto falta para a próxima?" sem obrigar a clicar
 * em nada. Sala de troféu com as prateleiras cortadas no tamanho do que já se
 * ganhou não mostra conquista nenhuma — mostra uma coleção que parece completa.
 *
 * ── Por família, e não por classe ────────────────────────────────────────
 * Requisitos, Lições, Módulos, Ofensiva — é o vocabulário que a plataforma já
 * usa em toda tela, e é dentro de uma família que o progresso se lê: três
 * degraus acesos e quatro apagados dizem onde a pessoa está naquele assunto.
 * Por classe, as sete seções diriam até onde ela chegou e perderiam o de quê.
 *
 * ── O Token.Web() fecha a página ─────────────────────────────────────────
 * Ele é o prêmio maior e vem por último, como coroamento do que está acima —
 * e não disputando o topo com a primeira fileira de insígnias.
 */

const MEDIDA = 44;

export default function EstantePage() {
  const { profile } = useAuth();
  const { badges, loading } = useBadges(profile?.id);
  const { certifications, loading: carregandoCerts } = useCertifications(profile?.id);

  const porCodigo = new Map(badges.map(b => [b.code, b]));
  /* Qual insígnia está aberta. Guardada por código, e não pelo objeto: a
     lista se refaz a cada `useBadges`, e um objeto guardado ficaria velho. */
  const [aberta, setAberta] = useState<string | null>(null);
  const fileiras = fileirasDaEstante();
  const total = fileiras.reduce((soma, f) => soma + f.lugares.length, 0);

  /* Só os ativos. Um revogado não é conquista a exibir, e mostrá-lo como
     conquista desfaria na tela a decisão que a liderança tomou. */
  const tokens = certifications.filter(c => c.status === 'active');

  if (loading) return <LoadingState label="Abrindo a estante..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Minha Estante
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
          <span className="font-bold" style={{ color: 'var(--color-text)' }}>{badges.length}</span>
          {' '}de {total} insígnias
          {tokens.length > 0 && (
            <>
              {' · '}
              <span className="font-bold" style={{ color: 'var(--color-text)' }}>{tokens.length}</span>
              {' '}<MarcaEmTexto marca="token" />
            </>
          )}
        </p>
      </div>

      {fileiras.map(fileira => {
        const vencidos = fileira.lugares.filter(l => porCodigo.has(l.code)).length;
        return (
          <section key={fileira.chave} className="card p-4 space-y-3">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <h2 className="font-bold text-sm">
                {fileira.titulo}{' '}
                <span className="font-normal" style={{ color: 'var(--color-text-dim)' }}>
                  — {fileira.explica}
                </span>
              </h2>
              <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--color-text-muted)' }}>
                {vencidos}/{fileira.lugares.length}
              </span>
            </div>
            <ol className="flex flex-wrap gap-x-2 gap-y-4 list-none p-0 m-0">
              {fileira.lugares.map(lugar => (
                <li key={lugar.code}>
                  <Lugar
                    lugar={lugar}
                    conquistada={porCodigo.get(lugar.code)}
                    aoAbrir={() => setAberta(lugar.code)}
                  />
                </li>
              ))}
            </ol>
          </section>
        );
      })}

      {/* O prêmio maior fecha a página, e é o mesmo painel do painel inicial —
          ver PainelDeTokens. */}
      <PainelDeTokens certifications={certifications} carregando={carregandoCerts} />

      {aberta && porCodigo.has(aberta) && (
        <ExplicacaoDaInsignia
          insignia={porCodigo.get(aberta)!}
          aoFechar={() => setAberta(null)}
        />
      )}
    </div>
  );
}

/**
 * Um lugar da prateleira: a insígnia, ou o contorno do que ainda não veio.
 *
 * O vazio é o polígono **daquela classe**, e não uma silhueta genérica: ver que
 * o próximo é um pentágono é o que o lugar vazio tem a dizer. Sem
 * preenchimento não há contraste a garantir, então o traço herda a cor do texto
 * e funciona nos dois temas sem duas versões — que é onde uma delas acabaria
 * errada.
 */
function Lugar({ lugar, conquistada, aoAbrir }: {
  lugar: LugarNaEstante;
  conquistada?: InsigniaConquistada;
  aoAbrir: () => void;
}) {
  const classe = CLASSES[lugar.classe];
  const rotulo = conquistada
    ? `${lugar.nome} — conquistada`
    : `${lugar.nome} — ainda não conquistada${lugar.semClasse ? '' : `. Classe ${classe.nome}`}`;

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: 78 }}>
      {/* Só a conquistada abre: o lugar vazio não tem feito, percurso nem
          data para contar, e um botão que abre um cartão vazio ensina que o
          caminho não funciona. */}
      {conquistada ? (
        <button
          type="button"
          onClick={aoAbrir}
          className="transition hover:opacity-80 rounded"
          aria-label={`${rotulo}. Ver o que rendeu esta insígnia`}
        >
          <BadgeIcon badge={conquistada} size="md" rotulo={rotulo} />
        </button>
      ) : <Contorno lugar={lugar} rotulo={rotulo} />}
      <span
        className="text-[10px] leading-tight text-center"
        style={{ color: conquistada ? 'var(--color-text-soft)' : 'var(--color-text-faint)' }}
      >
        {lugar.alvo !== undefined
          ? <span className="font-mono tabular-nums">{lugar.alvo.toLocaleString('pt-BR')}</span>
          : lugar.nome}
      </span>
    </div>
  );
}

function Contorno({ lugar, rotulo }: { lugar: LugarNaEstante; rotulo: string }) {
  const forma = formaDaClasse(lugar.classe);
  const comum = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.2,
    strokeLinejoin: 'round' as const,
    strokeDasharray: '2.5 2',
  };
  return (
    <svg
      viewBox={`0 0 ${LARGURA} ${ALTURA}`}
      width={(MEDIDA * LARGURA) / ALTURA}
      height={MEDIDA}
      className="flex-shrink-0"
      role="img"
      aria-label={rotulo}
      style={{ color: 'var(--color-text-faint)' }}
    >
      <title>{rotulo}</title>
      {/* As de horário não têm classe, e por isso não têm polígono: o vazio
          delas é o mesmo círculo, em contorno. */}
      {lugar.semClasse
        ? <circle cx={LARGURA / 2} cy={ALTURA / 2} r={ALTURA / 2 - 0.6} {...comum} />
        : <polygon points={forma.pontos} {...comum} />}
    </svg>
  );
}
