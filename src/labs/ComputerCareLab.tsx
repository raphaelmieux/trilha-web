import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ShieldCheck, ArrowUp, ArrowDown } from 'lucide-react';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
} from '../lib/progress';

/*
 * AP041 requisito 3 — cuidar do computador.
 *
 * O documento oficial diz "apresentar ao examinador". Aqui a pessoa prova ao
 * sistema, com três exercícios em que a resposta certa não é a palavra certa,
 * e sim a decisão certa:
 *
 *   3.1  separar o que protege do que põe em risco, numa mesa de verdade;
 *   3.2  distinguir manutenção preventiva de corretiva — a distinção É a
 *        definição que o requisito pede;
 *   3.3  pôr o desligamento na ordem e saber o que acontece se pular etapa.
 *
 * Errar não reprova: explica e devolve a vez. Numa trilha para dez anos, o erro
 * é o momento de ensinar, e são poucos itens — deixar um engano derrubar a nota
 * ensinaria só a ter medo de clicar.
 */

interface Objeto { id: string; rotulo: string; protege: boolean; porque: string }

const MESA: Objeto[] = [
  { id: 'm1', rotulo: 'Copo de suco do lado do teclado', protege: false,
    porque: 'Um esbarrão derrama tudo dentro do teclado, e líquido em circuito costuma ser definitivo.' },
  { id: 'm2', rotulo: 'Prato de biscoito sobre a mesa', protege: false,
    porque: 'As migalhas caem entre as teclas, viram sujeira acumulada e às vezes atraem formiga.' },
  { id: 'm3', rotulo: 'Capa por cima quando não está em uso', protege: true,
    porque: 'A capa é o que segura a poeira que cai o dia inteiro sobre o aparelho.' },
  { id: 'm4', rotulo: 'Pano seco e macio para limpar', protege: true,
    porque: 'Seco e macio limpa sem arranhar e sem deixar água entrar em lugar nenhum.' },
  { id: 'm5', rotulo: 'Pano encharcado na tela', protege: false,
    porque: 'A água escorre pelas bordas e entra por onde você não vê. Pano só levemente úmido, e nunca pingando.' },
  { id: 'm6', rotulo: 'Computador no chão, encostado na parede', protege: false,
    porque: 'No chão ele engole poeira e pelo de bicho, e encostado não deixa o ar circular.' },
  { id: 'm7', rotulo: 'Mesa arejada, longe da janela empoeirada', protege: true,
    porque: 'Ar circulando e menos poeira no lugar significa menos sujeira entrando.' },
  { id: 'm8', rotulo: 'Tirar da tomada antes de limpar', protege: true,
    porque: 'Desligado da tomada, nada acontece se um pingo escapar enquanto você limpa.' },
];

interface Acao { id: string; rotulo: string; preventiva: boolean; porque: string }

const ACOES: Acao[] = [
  { id: 'a1', rotulo: 'Limpar a poeira de dentro a cada seis meses', preventiva: true,
    porque: 'Feito antes de qualquer problema, justamente para o problema não vir.' },
  { id: 'a2', rotulo: 'Levar na assistência porque não liga mais', preventiva: false,
    porque: 'Isso é corretiva: já quebrou, e agora se corre atrás do conserto.' },
  { id: 'a3', rotulo: 'Manter o antivírus atualizado', preventiva: true,
    porque: 'Protege de ameaças que ainda nem chegaram. É prevenção pura.' },
  { id: 'a4', rotulo: 'Formatar tudo depois de pegar um vírus', preventiva: false,
    porque: 'Corretiva: o estrago já aconteceu, e formatar é o remédio.' },
  { id: 'a5', rotulo: 'Guardar uma cópia dos arquivos importantes', preventiva: true,
    porque: 'A cópia se faz enquanto está tudo bem — depois de perder, não há o que copiar.' },
  { id: 'a6', rotulo: 'Trocar a fonte que queimou', preventiva: false,
    porque: 'Corretiva: repõe o que estragou, não evita que estragasse.' },
];

const PASSOS = [
  { id: 'p1', rotulo: 'Salvar o trabalho e fechar os programas' },
  { id: 'p2', rotulo: 'Abrir o menu do sistema' },
  { id: 'p3', rotulo: 'Escolher a opção Desligar' },
  { id: 'p4', rotulo: 'Esperar a tela apagar sozinha' },
  { id: 'p5', rotulo: 'Só então, se precisar, tirar da tomada' },
];

const embaralhar = <T,>(l: T[]): T[] => {
  const c = [...l];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
};

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

export default function ComputerCareLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [mesa] = useState(() => embaralhar(MESA));
  const [acoes] = useState(() => embaralhar(ACOES));
  const [ordem, setOrdem] = useState(() => embaralhar(PASSOS));

  const [classifMesa, setClassifMesa] = useState<Record<string, boolean>>({});
  const [classifAcoes, setClassifAcoes] = useState<Record<string, boolean>>({});
  const [correcao, setCorrecao] = useState('');
  const [ordemConferida, setOrdemConferida] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');

  /* Classificar devolve retorno na hora: acertou, segue; errou, aprende e
     escolhe de novo. O item só fica guardado quando está certo. */
  const classificar = (
    id: string, escolha: boolean, certo: boolean, porque: string,
    guardar: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  ) => {
    if (escolha === certo) {
      guardar(m => ({ ...m, [id]: true }));
      setCorrecao('');
    } else {
      setCorrecao(porque);
    }
  };

  const mesaOk = mesa.every(o => classifMesa[o.id]);
  const acoesOk = acoes.every(a => classifAcoes[a.id]);
  const ordemOk = ordem.every((p, i) => p.id === PASSOS[i].id);

  const mover = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= ordem.length) return;
    const nova = [...ordem];
    [nova[i], nova[j]] = [nova[j], nova[i]];
    setOrdem(nova);
    setOrdemConferida(false);
    setCorrecao('');
  };

  const conferirOrdem = () => {
    setOrdemConferida(true);
    if (ordemOk) { setCorrecao(''); return; }
    const primeiroErro = ordem.findIndex((p, i) => p.id !== PASSOS[i].id);
    setCorrecao(
      primeiroErro === 0
        ? 'Comece pelo que se perde primeiro: o que está aberto e sem salvar.'
        : `O passo ${primeiroErro + 1} ainda não está no lugar. Pense no que precisa acontecer antes dele.`,
    );
  };

  const registrar = async () => {
    setErro('');
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
      setErro('Você concluiu tudo, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'cuidados_concluido', { etapas: 3 });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <ShieldCheck className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Você sabe cuidar de um computador!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Proteger da sujeira, cuidar antes de quebrar e desligar do jeito certo.
          São três hábitos que fazem a máquina durar anos a mais.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  const Cabecalho = ({ n, titulo, feito }: { n: number; titulo: string; feito: boolean }) => (
    <div className="flex items-center gap-2 mb-3">
      {feito
        ? <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
        : <Circle className="w-5 h-5" style={{ color: 'var(--color-text-faint)' }} />}
      <h2 className="font-bold">{n}. {titulo}</h2>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* ── 1. A mesa ── */}
      <div className="card p-4">
        <Cabecalho n={1} titulo="O que protege e o que põe em risco" feito={mesaOk} />
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Olhe cada coisa da mesa e diga se ela ajuda a proteger o computador da
          sujeira ou se coloca ele em risco.
        </p>
        <div className="space-y-2">
          {mesa.map(o => {
            const feito = classifMesa[o.id];
            return (
              <div key={o.id} className="flex items-center gap-2 flex-wrap p-2 rounded-lg"
                style={{ backgroundColor: feito ? 'var(--color-success-a10)' : 'var(--color-bg-input)' }}>
                <span className="flex-1 text-sm min-w-0" style={{ color: 'var(--color-text)' }}>{o.rotulo}</span>
                {feito ? (
                  <span className="text-xs" style={{ color: 'var(--color-success)' }}>
                    {o.protege ? '✓ protege' : '✓ põe em risco'}
                  </span>
                ) : (
                  <>
                    <button onClick={() => classificar(o.id, true, o.protege, o.porque, setClassifMesa)}
                      className="btn-secondary text-xs py-1">Protege</button>
                    <button onClick={() => classificar(o.id, false, o.protege, o.porque, setClassifMesa)}
                      className="btn-secondary text-xs py-1">Põe em risco</button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. Preventiva ou corretiva ── */}
      {mesaOk && (
        <div className="card p-4">
          <Cabecalho n={2} titulo="Antes de quebrar, ou depois?" feito={acoesOk} />
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Manutenção <strong>preventiva</strong> é o que se faz antes de o problema
            aparecer. <strong>Corretiva</strong> é o que se faz depois que ele apareceu.
            Diga qual é cada uma.
          </p>
          <div className="space-y-2">
            {acoes.map(a => {
              const feito = classifAcoes[a.id];
              return (
                <div key={a.id} className="flex items-center gap-2 flex-wrap p-2 rounded-lg"
                  style={{ backgroundColor: feito ? 'var(--color-success-a10)' : 'var(--color-bg-input)' }}>
                  <span className="flex-1 text-sm min-w-0" style={{ color: 'var(--color-text)' }}>{a.rotulo}</span>
                  {feito ? (
                    <span className="text-xs" style={{ color: 'var(--color-success)' }}>
                      {a.preventiva ? '✓ preventiva' : '✓ corretiva'}
                    </span>
                  ) : (
                    <>
                      <button onClick={() => classificar(a.id, true, a.preventiva, a.porque, setClassifAcoes)}
                        className="btn-secondary text-xs py-1">Preventiva</button>
                      <button onClick={() => classificar(a.id, false, a.preventiva, a.porque, setClassifAcoes)}
                        className="btn-secondary text-xs py-1">Corretiva</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. A ordem de desligar ── */}
      {acoesOk && (
        <div className="card p-4">
          <Cabecalho n={3} titulo="Desligando do jeito certo" feito={ordemConferida && ordemOk} />
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Ponha os passos na ordem, do primeiro ao último.
          </p>
          <ol className="space-y-2">
            {ordem.map((p, i) => (
              <li key={p.id} className="flex items-center gap-2 p-2 rounded-lg"
                style={{
                  backgroundColor: ordemConferida && ordemOk ? 'var(--color-success-a10)' : 'var(--color-bg-input)',
                  border: '1px solid var(--color-border)',
                }}>
                <span className="w-6 text-center text-sm font-bold" style={{ color: 'var(--color-secondary)' }}>{i + 1}</span>
                <span className="flex-1 text-sm" style={{ color: 'var(--color-text)' }}>{p.rotulo}</span>
                <button onClick={() => mover(i, -1)} disabled={i === 0} className="btn-secondary text-xs py-1 px-2">
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button onClick={() => mover(i, 1)} disabled={i === ordem.length - 1} className="btn-secondary text-xs py-1 px-2">
                  <ArrowDown className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ol>
          {!(ordemConferida && ordemOk) && (
            <button onClick={conferirOrdem} className="btn-secondary mt-3 text-sm">Conferir a ordem</button>
          )}
        </div>
      )}

      {correcao && (
        <div className="card p-3 text-sm" role="status"
          style={{ backgroundColor: 'var(--color-secondary-a08)', borderColor: 'var(--color-secondary-a20)', color: 'var(--color-secondary)' }}>
          {correcao}
        </div>
      )}

      {erro && <p className="text-sm" style={{ color: 'var(--color-primary)' }}>{erro}</p>}

      <button
        onClick={registrar}
        disabled={!(mesaOk && acoesOk && ordemConferida && ordemOk)}
        className="btn-primary w-full"
      >
        {mesaOk && acoesOk && ordemConferida && ordemOk ? 'Concluir laboratório' : 'Complete as três partes'}
      </button>
    </div>
  );
}
