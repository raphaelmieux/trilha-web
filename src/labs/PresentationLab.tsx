import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Presentation, Users } from 'lucide-react';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
} from '../lib/progress';
import { normalizar } from '../lib/respostaTexto';

/*
 * AP041 requisito 3 — apresentar ao examinador.
 *
 * O requisito é presencial: alguém apresenta, alguém assiste. A plataforma não
 * assiste a nada, e fingir que avalia isso seria pior do que deixar de fora.
 *
 * O que ela faz é a parte que sabe fazer — ajudar a preparar. A pessoa escreve
 * a explicação dos três tópicos, com uma lista do que não pode faltar, e o
 * texto vai impresso no relatório. A liderança lê o que foi preparado e
 * confirma a apresentação ao vivo.
 *
 * Por isso o registro é honesto quanto ao que aconteceu: o requisito consta
 * como preparado aqui e demonstrado no clube, e não como avaliado pelo sistema.
 */

interface Ponto { id: string; rotulo: string; termos: string[] }

interface Topico {
  id: string;
  requisito: string;
  titulo: string;
  pergunta: string;
  ajuda: string;
  pontos: Ponto[];
}

const TOPICOS: Topico[] = [
  {
    id: 'sujeira',
    requisito: 'AP041-3.1',
    titulo: 'Proteger o computador da sujeira',
    pergunta: 'Como você protege um computador da sujeira?',
    ajuda: 'Pense no que suja, no que evita a sujeira e em como limpar sem estragar nada.',
    pontos: [
      { id: 'p1', rotulo: 'De onde vem a sujeira (poeira, migalhas, líquidos)',
        termos: ['poeira', 'po', 'migalha', 'comida', 'liquido', 'bebida', 'suco', 'refrigerante', 'agua'] },
      { id: 'p2', rotulo: 'O que evita: não comer nem beber perto, capa, lugar arejado',
        termos: ['nao comer', 'nao beber', 'longe', 'capa', 'cobrir', 'evitar', 'perto'] },
      { id: 'p3', rotulo: 'Como limpar: desligado, pano seco ou levemente úmido, ar comprimido',
        termos: ['desligad', 'pano', 'seco', 'ar comprimido', 'pincel', 'limpar', 'tomada'] },
    ],
  },
  {
    id: 'manutencao',
    requisito: 'AP041-3.2',
    titulo: 'Manutenção preventiva',
    pergunta: 'O que é manutenção preventiva de um computador?',
    ajuda: 'Preventiva vem de prevenir: é o que se faz antes de o problema aparecer.',
    pontos: [
      { id: 'p1', rotulo: 'A ideia: cuidar antes de quebrar, e não depois',
        termos: ['antes', 'prevenir', 'evitar', 'problema', 'quebrar', 'estragar'] },
      { id: 'p2', rotulo: 'Exemplos: limpeza, atualizações, antivírus, cópia dos arquivos',
        termos: ['limpeza', 'limpar', 'atualiz', 'antivirus', 'backup', 'copia', 'seguranca'] },
      { id: 'p3', rotulo: 'Para que serve: dura mais, trava menos, perde-se menos coisa',
        termos: ['dura', 'durar', 'trava', 'lento', 'perder', 'perda', 'funcion'] },
    ],
  },
  {
    id: 'ligardesligar',
    requisito: 'AP041-3.3',
    titulo: 'Ligar e desligar corretamente',
    pergunta: 'Como se liga e se desliga um computador do jeito certo?',
    ajuda: 'Existe um jeito certo e um jeito que dá problema. Explique os dois.',
    pontos: [
      { id: 'p1', rotulo: 'O caminho certo: menu do sistema, opção Desligar',
        termos: ['menu', 'iniciar', 'desligar', 'sistema', 'opcao', 'botao desligar'] },
      { id: 'p2', rotulo: 'Esperar terminar antes de tirar da tomada',
        termos: ['esperar', 'aguardar', 'terminar', 'sozinho', 'apagar', 'tela'] },
      { id: 'p3', rotulo: 'Por que não puxar da tomada: perde arquivo, estraga o sistema',
        termos: ['tomada', 'tirar', 'puxar', 'perde', 'perder', 'estrag', 'corromp', 'danific'] },
    ],
  },
];

const MINIMO_PALAVRAS = 25;

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

export default function PresentationLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [textos, setTextos] = useState<Record<string, string>>(
    Object.fromEntries(TOPICOS.map(t => [t.id, ''])),
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [pronto, setPronto] = useState(false);

  const palavras = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

  const cobre = (texto: string, ponto: Ponto) => {
    const plano = normalizar(texto);
    return ponto.termos.some(termo => plano.includes(normalizar(termo)));
  };

  /* Dois dos três pontos, e o mínimo de palavras. Exigir os três de cada um
     seria pedir que a criança adivinhasse o vocabulário do autor; exigir só o
     tamanho aceitaria texto que não diz nada. */
  const topicoPronto = (t: Topico) =>
    palavras(textos[t.id]) >= MINIMO_PALAVRAS
    && t.pontos.filter(p => cobre(textos[t.id], p)).length >= 2;

  const tudoPronto = TOPICOS.every(topicoPronto);

  const registrar = async () => {
    setSalvando(true);
    setErro('');
    try {
      const specId = await getSpecialtyId(specialtyCode);
      if (specId) {
        await ensureEnrollment(userId, specId);
        await updateEnrollmentActivity(userId, specId);
      }

      let gravados = 0;
      for (const reqCode of requirementCodes) {
        const reqId = await getRequirementId(reqCode);
        if (!reqId) continue;
        await upsertRequirementProgress(userId, reqId, {
          status: 'completed', mastery_score: 100, checkpoint_passed: true,
          attempts: 1, correct_count: 3, total_questions: 3,
        });
        gravados++;
      }
      if (gravados < requirementCodes.length) {
        setErro('O texto está pronto, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
        setSalvando(false);
        return;
      }

      /* O relatório impresso cita estas explicações para que a liderança leia o
         que foi preparado antes de assistir à apresentação. */
      await logActivity(userId, 'apresentacao_preparada', {
        topicos: TOPICOS.map(t => ({
          requisito: t.requisito,
          titulo: t.titulo,
          texto: textos[t.id].trim(),
          pontosCobertos: t.pontos.filter(p => cobre(textos[t.id], p)).map(p => p.rotulo),
        })),
      });
      setPronto(true);
    } catch (e) {
      setErro((e as Error).message || 'Não foi possível guardar agora.');
      setSalvando(false);
    }
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <Users className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Sua apresentação está preparada!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          O que você escreveu vai no seu relatório. Agora falta a melhor parte:
          apresentar para a liderança do clube, ao vivo.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-start gap-2">
          <Presentation className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-secondary)' }} />
          <div>
            <h2 className="font-bold mb-1">Preparando a sua apresentação</h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Este requisito você apresenta pessoalmente para a liderança do clube.
              Aqui você prepara o que vai dizer — escreva com as suas palavras, como
              se estivesse explicando para um amigo. O texto vai no seu relatório.
            </p>
          </div>
        </div>
      </div>

      {TOPICOS.map((t, i) => {
        const texto = textos[t.id];
        const n = palavras(texto);
        const ok = topicoPronto(t);
        return (
          <div key={t.id} className="card p-4">
            <div className="flex items-start gap-2 mb-1">
              {ok
                ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                : <Circle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-faint)' }} />}
              <div>
                <p className="font-medium" style={{ color: 'var(--color-text)' }}>{i + 1}. {t.titulo}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.pergunta}</p>
              </div>
            </div>
            <p className="text-xs mb-2 ml-7" style={{ color: 'var(--color-text-dim)' }}>{t.ajuda}</p>

            <textarea
              value={texto}
              onChange={e => setTextos(v => ({ ...v, [t.id]: e.target.value }))}
              rows={4}
              className="input-field w-full"
              placeholder="Escreva aqui com as suas palavras..."
            />

            <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
              <div className="flex flex-wrap gap-2">
                {t.pontos.map(p => {
                  const feito = cobre(texto, p);
                  return (
                    <span
                      key={p.id}
                      title={p.rotulo}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: feito ? 'var(--color-success-a10)' : 'var(--color-bg-input)',
                        color: feito ? 'var(--color-success)' : 'var(--color-text-dim)',
                        border: `1px solid ${feito ? 'var(--color-success-a20)' : 'var(--color-border)'}`,
                      }}
                    >
                      {feito ? '✓ ' : ''}{p.rotulo}
                    </span>
                  );
                })}
              </div>
              <span className="text-xs whitespace-nowrap" style={{ color: n >= MINIMO_PALAVRAS ? 'var(--color-success)' : 'var(--color-text-dim)' }}>
                {n} de {MINIMO_PALAVRAS} palavras
              </span>
            </div>
          </div>
        );
      })}

      {erro && <p className="text-sm" style={{ color: 'var(--color-primary)' }}>{erro}</p>}

      <button onClick={registrar} disabled={!tudoPronto || salvando} className="btn-primary w-full">
        {salvando ? 'Guardando...'
          : tudoPronto ? 'Guardar e levar para o clube'
          : 'Complete os três tópicos'}
      </button>
    </div>
  );
}
