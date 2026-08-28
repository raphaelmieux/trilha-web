import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, CircleAlert, BookOpen, FlaskConical, Check, Play, Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getVereda, licoesDaVereda, type LicaoDeVereda,
} from '../curriculum/veredas';
import { licaoVencida, registrarLaboratorioVencido } from '../lib/veredas';
import { useVeredas } from '../hooks/useVeredas';
import LeitorDeVereda from '../components/LeitorDeVereda';
import LaboratorioDeVereda from '../components/LaboratorioDeVereda';
import ProgressBar from '../components/ui/ProgressBar';

/*
 * A tela de uma vereda.
 *
 * Tem a forma da tela de uma trilha: módulos em ordem, cada um com as lições
 * dentro, e o progresso em cima. É de propósito — o desbravador já sabe
 * percorrer uma trilha aqui, e inventar uma segunda gramática de percurso só
 * para o material curto seria pedir que ele aprendesse duas.
 *
 * O que ela não tem é o peso: nenhum percentual de especialidade se move, e
 * nada disto vira requisito. A lição aberta ocupa a tela inteira — teoria no
 * leitor, laboratório no editor — e voltar recarrega o percurso, que é como a
 * lista se repinta sem recarregar a página.
 */
export default function VeredaPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const vereda = getVereda(id);
  const { percursoDe, recarregar, carregando } = useVeredas(profile?.id);
  const [aberta, setAberta] = useState<string | null>(null);

  if (!vereda) {
    return (
      <div className="card p-8 text-center">
        <CircleAlert className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-faint)' }} />
        <h1 className="text-xl font-bold mb-2">Vereda não encontrada</h1>
        <p className="mb-5" style={{ color: 'var(--color-text-muted)' }}>
          O endereço aponta para uma vereda que não existe.
        </p>
        <Link to="/" className="btn-primary">Voltar ao Início</Link>
      </div>
    );
  }

  const feito = percursoDe(vereda.id);
  const licoes = licoesDaVereda(vereda);
  const vencidas = licoes.filter(l => licaoVencida(l, feito)).length;
  const percentual = licoes.length ? Math.round((vencidas / licoes.length) * 100) : 0;

  const licaoAberta = licoes.find(l => l.id === aberta);

  const fechar = async () => { setAberta(null); await recarregar(); };

  if (licaoAberta?.tipo === 'teoria') {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: '#1E1E1E' }}>
        <LeitorDeVereda vereda={vereda} userId={profile?.id} licaoId={licaoAberta.id}
          aoFechar={fechar} />
      </div>
    );
  }

  if (licaoAberta?.tipo === 'laboratorio' && profile?.id) {
    return (
      <LaboratorioDeVereda
        vereda={vereda}
        licao={licaoAberta}
        userId={profile.id}
        aoVencer={async () => {
          await registrarLaboratorioVencido(
            profile.id, vereda, licaoAberta.id,
            feito ?? { topicos: new Set(), laboratorios: new Set() });
        }}
        aoSair={fechar}
      />
    );
  }

  const Licao = ({ licao, ordem }: { licao: LicaoDeVereda; ordem: number }) => {
    const pronta = licaoVencida(licao, feito);
    const Ico = licao.tipo === 'teoria' ? BookOpen : FlaskConical;
    /* Sem conta, a vereda se lê mas não se grava — e um laboratório que não
       registra nada não é lição, é rascunho. Melhor dizer isso do que deixar
       a pessoa fazer tudo e descobrir depois. */
    const semConta = !profile?.id;

    return (
      <button
        onClick={() => !semConta && setAberta(licao.id)}
        disabled={semConta}
        className="w-full text-left p-4 rounded-lg flex items-start gap-3 transition disabled:opacity-60"
        style={{
          backgroundColor: 'var(--color-bg-input)',
          border: `1px solid ${pronta ? 'var(--color-success-a40, var(--color-border))' : 'var(--color-border)'}`,
        }}>
        <span className="flex-none w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
          style={{
            backgroundColor: pronta ? 'var(--color-success)' : 'var(--color-bg-hover)',
            color: pronta ? '#fff' : 'var(--color-text-muted)',
          }}>
          {pronta ? <Check className="w-4 h-4" /> : <Ico className="w-4 h-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-faint)' }}>
              {ordem}
            </span>
            <span className="font-semibold">{licao.titulo}</span>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--color-bg-hover)',
                color: 'var(--color-text-muted)',
              }}>
              {licao.tipo === 'teoria' ? 'teoria' : 'laboratório'}
            </span>
          </span>
          <span className="block text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
            {licao.resumo}
          </span>
        </span>
        {semConta
          ? <Lock className="w-4 h-4 flex-none mt-1" style={{ color: 'var(--color-text-faint)' }} />
          : <Play className="w-4 h-4 flex-none mt-1" style={{ color: 'var(--color-text-faint)' }} />}
      </button>
    );
  };

  let ordem = 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/" className="flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Início
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{vereda.titulo}</h1>
            <span className="font-mono text-xs" style={{ color: 'var(--color-text-faint)' }}>
              {vereda.codigo}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{vereda.resumo}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span style={{ color: 'var(--color-text-muted)' }}>
            Progresso
            <span className="ml-2" style={{ color: 'var(--color-text-dim)' }}>
              · {vencidas} de {licoes.length} lições
            </span>
          </span>
          <span className="font-semibold"
            style={{ color: percentual === 100 ? 'var(--color-success)' : 'var(--color-primary-hover)' }}>
            {carregando ? '—' : `${percentual}%`}
          </span>
        </div>
        <ProgressBar percent={percentual} />
        {/* Dito na tela, e não só no relatório: quem percorre uma vereda
            precisa saber, antes de começar, que ela não move a trilha. */}
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-faint)' }}>
          Saiu da trilha {vereda.origem}. Não conta no percentual de nenhuma
          especialidade — é bônus, e rende insígnia ao terminar.
        </p>
      </div>

      {vereda.modulos.map(m => (
        <section key={m.id} className="card p-5 space-y-3">
          <div>
            <h2 className="font-bold">{m.titulo}</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{m.resumo}</p>
          </div>
          <div className="space-y-2">
            {m.licoes.map(l => { ordem += 1; return <Licao key={l.id} licao={l} ordem={ordem} />; })}
          </div>
        </section>
      ))}
    </div>
  );
}
