import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  logActivity, upsertRequirementProgress, ensureEnrollment,
  updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import {
  DIAGRAMA_INICIAL, PECAS, VERIFICACOES, acrescentarPeca, caminhoDosBits,
  chegouNaSaida, desligar, ehCodigoBinario, ligar, ondePararam, pecaPorId,
  quantasFeitas, tirarPeca, tudoFeito,
  type Diagrama, type Papel,
} from './diagramaBinario';
import {
  CheckCircle2, Circle, Play, Plus, RotateCcw, Trash2, Network, ArrowRight, Info,
} from 'lucide-react';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * O diagrama do caminho da informação — requisito 5 da AP045.
 *
 * ── Por que não se arrasta nada aqui ─────────────────────────────────────
 * A peça entra por um botão da paleta, e a ligação por um formulário de duas
 * escolhas mais o código. Arrastar caixas numa tela seria o gesto "natural", e
 * é o que fecha a porta para metade de quem estuda: no celular um alvo de 26px
 * é difícil, e quem navega por teclado não arrasta nada. É a decisão dos cantos
 * do digitalizador, que são botões além de alvos de arrasto — só que aqui não
 * há um gesto de arrasto que valha a pena preservar, porque o diagrama não tem
 * posição livre: quem decide onde cada peça pousa é o papel dela.
 *
 * ── E por que a posição não é livre ──────────────────────────────────────
 * Entrada à esquerda, processamento no meio, saída à direita. Um diagrama em
 * que a ordem visual contradiz o sentido da informação ensina errado sobre a
 * própria coisa que ele desenha, e sem arrasto ninguém teria como consertar.
 *
 * ── A simulação mostra, e não julga ──────────────────────────────────────
 * Ela desenha os bits andando e diz **onde eles pararam**. Não é item da lista:
 * as sete verificações já exigem as setas na direção certa, então um item
 * "a simulação chegou ao fim" nunca conseguiria ficar vermelho sozinho — o
 * espelho do item que abre verde. Está escrito em `diagramaBinario.ts`.
 */

const NOME_DO_PAPEL: Record<Papel, string> = {
  entrada: 'Periféricos de entrada',
  cpu: 'Processamento',
  memoria: 'Memória',
  intermediario: 'No caminho',
  saida: 'Periféricos de saída',
};

const ORDEM_DA_PALETA: Papel[] = ['entrada', 'cpu', 'memoria', 'intermediario', 'saida'];

/* A caixa de cada peça no desenho. Medidas em unidades do viewBox. */
/* O vão entre colunas é maior que a caixa por uma razão medida: o rótulo da
   seta tem oito dígitos monoespaçados, e num vão de 42px ele sangrava por cima
   das duas caixas que a seta liga. Quem viu foi o Chromium — no jsdom não há
   largura de texto nenhuma para estourar. */
const LARGURA = 108, ALTURA = 44, VAO_X = 196, VAO_Y = 62;

export default function DiagramaBinarioLab({
  specialtyCode, lessonCode, lessonTitle, requirementCodes, userId,
}: Props) {
  const [diagrama, setDiagrama] = useState<Diagrama>(DIAGRAMA_INICIAL);
  const [de, setDe] = useState('');
  const [para, setPara] = useState('');
  const [codigo, setCodigo] = useState('');
  const [aviso, setAviso] = useState('');
  /* Quantos passos da simulação já foram desenhados. `-1` é "não está
     rodando", e não `0`: zero é o primeiro passo, com a primeira peça acesa. */
  const [passo, setPasso] = useState(-1);
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const noDiagrama = diagrama.nos.map(n => n.id);
  const caminho = useMemo(() => caminhoDosBits(diagrama), [diagrama]);
  const parou = ondePararam(diagrama);
  const feitas = quantasFeitas(diagrama);
  const pronto = tudoFeito(diagrama);

  const posicao = (id: string) => {
    const n = diagrama.nos.find(x => x.id === id);
    return n ? { x: 16 + n.coluna * VAO_X, y: 16 + n.linha * VAO_Y } : { x: 0, y: 0 };
  };

  const acrescentar = (id: string) => {
    setDiagrama(d => acrescentarPeca(d, id));
    setPasso(-1);
    setAviso('');
  };

  const remover = (id: string) => {
    setDiagrama(d => tirarPeca(d, id));
    setPasso(-1);
    if (de === id) setDe('');
    if (para === id) setPara('');
  };

  const ligarPecas = () => {
    if (!de || !para) { setAviso('Escolha de qual peça a informação sai e para qual ela vai.'); return; }
    if (de === para) { setAviso('Uma peça não se liga a si mesma.'); return; }
    /* O aviso nomeia o que está errado, e não "o código é inválido": quem
       escreveu `A` acha que escreveu a informação que passa ali, que é
       exatamente a confusão que a lição desfaz. */
    if (!ehCodigoBinario(codigo)) {
      setAviso('Escreva o que passa nesta ligação em código binário — só 1 e 0, pelo menos quatro dígitos. A letra "A" viaja no cabo como 01000001.');
      return;
    }
    setDiagrama(d => ligar(d, de, para, codigo));
    setCodigo('');
    setPasso(-1);
    setAviso('');
  };

  const simular = () => {
    setPasso(0);
    setAviso('');
    /* Um passo a cada 600ms. O `setTimeout` encadeado não precisa de guarda de
       desmontagem: ele só chama `setPasso`, que o React ignora numa tela que
       saiu — e não há `await` nenhum aqui, que é onde a escrita depois do
       desmonte custa caro. */
    caminho.forEach((_, i) => {
      if (i > 0) window.setTimeout(() => setPasso(i), i * 600);
    });
  };

  const concluir = async () => {
    setSalvando(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: feitas, total_questions: VERIFICACOES.length,
      }, specialtyCode);
    }
    await logActivity(userId, 'diagrama_concluido', {
      specialtyCode, lessonCode,
      pecas: diagrama.nos.length, setas: diagrama.setas.length,
    });
    setConcluido(true);
  };

  if (concluido) {
    return (
      <div className="card p-8 text-center">
        <Network className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">Diagrama montado!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          O caminho está completo: a entrada vira código binário, a CPU processa o
          código, e a saída transforma o resultado em algo que a pessoa percebe.
          Este é o diagrama que você mostra ao examinador — agora você sabe
          explicar cada seta dele.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h1 className="text-xl font-bold mb-1">{lessonTitle}</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Monte o caminho que um toque de tecla percorre até virar uma letra na tela.
          Acrescente as peças, ligue-as na direção em que a informação viaja, e
          escreva em cada ligação o código binário que passa por ali.
        </p>
      </div>

      {/* ── A paleta ───────────────────────────────────────────────────── */}
      <div className="card p-5">
        <h2 className="font-bold mb-3">Peças</h2>
        <div className="space-y-3">
          {ORDEM_DA_PALETA.map(papel => (
            <div key={papel}>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-dim)' }}>
                {NOME_DO_PAPEL[papel]}
              </p>
              <div className="flex flex-wrap gap-2">
                {PECAS.filter(p => p.papel === papel).map(p => {
                  const posta = noDiagrama.includes(p.id);
                  return (
                    <button
                      key={p.id} type="button"
                      /* As duas caras são `btn-secondary`, e a diferença é o
                         estado. A peça por pôr usava `btn-ghost`, que é fundo
                         transparente e borda transparente: no cartão escuro ela
                         saía como texto solto, sem nada dizendo que dá para
                         clicar — e é justamente ela que precisa convidar. É o
                         mesmo defeito que o painel branco da moldura já teve. */
                      className="btn-secondary"
                      style={posta
                        ? { borderColor: 'var(--color-primary)', color: 'var(--color-text)' }
                        : undefined}
                      title={p.oQueFaz}
                      aria-pressed={posta}
                      onClick={() => (posta ? remover(p.id) : acrescentar(p.id))}
                    >
                      {posta
                        ? <Trash2 className="w-3.5 h-3.5 mr-1" aria-hidden />
                        : <Plus className="w-3.5 h-3.5 mr-1" aria-hidden />}
                      {p.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── O desenho ──────────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2 className="font-bold">O diagrama</h2>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={simular}
              disabled={caminho.length < 2}>
              <Play className="w-4 h-4 mr-1" /> Simular
            </button>
            <button type="button" className="btn-ghost"
              onClick={() => { setDiagrama(DIAGRAMA_INICIAL); setPasso(-1); setAviso(''); }}>
              <RotateCcw className="w-4 h-4 mr-1" /> Recomeçar
            </button>
          </div>
        </div>

        {diagrama.nos.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-dim)' }}>
            A tela está em branco. Comece acrescentando um periférico de entrada.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <svg
              viewBox={`0 0 ${16 + 4 * VAO_X} ${32 + Math.max(2, ...diagrama.nos.map(n => n.linha + 1)) * VAO_Y}`}
              style={{ width: '100%', minWidth: 520 }}
              role="img"
              aria-label={descreverDiagrama(diagrama)}
            >
              <defs>
                <marker id="ponta" markerWidth="8" markerHeight="8" refX="7" refY="3"
                  orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L7,3 z" fill="var(--color-primary)" />
                </marker>
              </defs>

              {diagrama.setas.map(s => {
                const a = posicao(s.de), b = posicao(s.para);
                const x1 = a.x + LARGURA, y1 = a.y + ALTURA / 2;
                const x2 = b.x, y2 = b.y + ALTURA / 2;
                /* A seta entre peças da mesma coluna — CPU e RAM — sai por
                   baixo em vez de atravessar a caixa de lado. */
                const mesmaColuna = Math.abs(a.x - b.x) < 1;
                const dCaminho = mesmaColuna
                  ? `M ${a.x + LARGURA / 2} ${a.y + ALTURA} L ${b.x + LARGURA / 2} ${b.y}`
                  : `M ${x1} ${y1} L ${x2 - 4} ${y2}`;
                const meioX = mesmaColuna ? a.x + LARGURA / 2 + 6 : (x1 + x2) / 2;
                const meioY = mesmaColuna ? (a.y + ALTURA + b.y) / 2 : (y1 + y2) / 2 - 5;
                return (
                  <g key={`${s.de}-${s.para}`}>
                    <path d={dCaminho} stroke="var(--color-primary)" strokeWidth={1.6}
                      fill="none" markerEnd="url(#ponta)" />
                    <text x={meioX} y={meioY} fontSize={10} textAnchor={mesmaColuna ? 'start' : 'middle'}
                      fill="var(--color-text-muted)" fontFamily="monospace">
                      {s.rotulo}
                    </text>
                  </g>
                );
              })}

              {diagrama.nos.map(n => {
                const p = pecaPorId(n.id);
                const { x, y } = posicao(n.id);
                /* A peça acesa é a que os bits estão ocupando agora. */
                const acesa = passo >= 0 && caminho[passo] === n.id;
                return (
                  <g key={n.id}>
                    <rect
                      x={x} y={y} width={LARGURA} height={ALTURA} rx={6}
                      fill={acesa ? 'var(--color-primary)' : 'var(--color-bg-hover)'}
                      stroke={acesa ? 'var(--color-primary)' : 'var(--color-border)'}
                      strokeWidth={1.2}
                    />
                    <text
                      x={x + LARGURA / 2} y={y + ALTURA / 2 + 4} fontSize={12} textAnchor="middle"
                      fill={acesa ? '#FFFFFF' : 'var(--color-text)'}
                    >
                      {p?.nome}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* O que a simulação relata. Ela conta o que mediu, e nunca diz se a
            tarefa está cumprida — é a régua de status do Word. */}
        {passo >= 0 && (
          <p className="text-sm mt-2 flex items-start gap-2" style={{ color: 'var(--color-text-muted)' }}>
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            {chegouNaSaida(diagrama)
              ? `Os bits saíram de ${nomeDe(caminho[0])} e chegaram a ${nomeDe(caminho[caminho.length - 1])}, passando por ${caminho.length} peças.`
              : parou
                ? `Os bits pararam em ${nomeDe(parou)}: não há seta saindo dali para a próxima peça.`
                : 'Os bits não saíram do lugar: não há seta saindo do periférico de entrada.'}
          </p>
        )}
      </div>

      {/* ── As ligações ────────────────────────────────────────────────── */}
      <div className="card p-5">
        <h2 className="font-bold mb-3">Ligações</h2>
        <div className="flex flex-wrap items-end gap-2 mb-3">
          <label className="text-sm">
            <span className="block mb-1" style={{ color: 'var(--color-text-dim)' }}>A informação sai de</span>
            <select className="input-field" style={{ width: 150 }}
              value={de} onChange={e => setDe(e.target.value)} aria-label="A informação sai de">
              <option value="">—</option>
              {noDiagrama.map(id => <option key={id} value={id}>{nomeDe(id)}</option>)}
            </select>
          </label>
          <ArrowRight className="w-4 h-4 mb-2" style={{ color: 'var(--color-text-dim)' }} aria-hidden />
          <label className="text-sm">
            <span className="block mb-1" style={{ color: 'var(--color-text-dim)' }}>e vai para</span>
            <select className="input-field" style={{ width: 150 }}
              value={para} onChange={e => setPara(e.target.value)} aria-label="e vai para">
              <option value="">—</option>
              {noDiagrama.map(id => <option key={id} value={id}>{nomeDe(id)}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="block mb-1" style={{ color: 'var(--color-text-dim)' }}>Código binário que passa</span>
            {/* `input-field` e não um `<input>` nu: o campo nativo desenha
                fundo branco dentro de um cartão escuro, e some junto com o que
                está escrito nele. */}
            <input
              className="input-field"
              value={codigo} onChange={e => setCodigo(e.target.value)}
              placeholder="01000001" aria-label="Código binário que passa"
              style={{ fontFamily: 'monospace', width: 150 }}
            />
          </label>
          <button type="button" className="btn-primary" onClick={ligarPecas}>Ligar</button>
        </div>

        {aviso && (
          <p className="text-sm mb-3" style={{ color: 'var(--color-warning)' }}>{aviso}</p>
        )}

        {diagrama.setas.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>Nenhuma ligação ainda.</p>
        ) : (
          <ul className="space-y-1">
            {diagrama.setas.map(s => (
              <li key={`${s.de}-${s.para}`} className="flex items-center gap-2 text-sm">
                <span>{nomeDe(s.de)}</span>
                <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--color-text-dim)' }} aria-hidden />
                <span>{nomeDe(s.para)}</span>
                <code style={{ color: 'var(--color-text-muted)' }}>{s.rotulo}</code>
                <button
                  type="button" className="btn-ghost"
                  aria-label={`Desfazer a ligação de ${nomeDe(s.de)} para ${nomeDe(s.para)}`}
                  onClick={() => { setDiagrama(d => desligar(d, s.de, s.para)); setPasso(-1); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── A lista ────────────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">O que o diagrama precisa ter</h2>
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {feitas} de {VERIFICACOES.length}
          </span>
        </div>
        <ul className="space-y-2">
          {VERIFICACOES.map(v => {
            const ok = v.feita(diagrama);
            return (
              <li key={v.id} className="flex items-start gap-2 text-sm">
                {ok
                  ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-success)' }} />
                  : <Circle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-text-faint)' }} />}
                <span>
                  <span style={{ color: ok ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{v.rotulo}</span>
                  {!ok && <span className="block text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>{v.dica}</span>}
                </span>
              </li>
            );
          })}
        </ul>

        <button
          type="button" className="btn-primary mt-4 w-full"
          disabled={!pronto || salvando} onClick={() => void concluir()}
        >
          {salvando ? 'Gravando…' : 'Concluir a lição'}
        </button>
      </div>
    </div>
  );
}

const nomeDe = (id: string) => pecaPorId(id)?.nome ?? id;

/**
 * O diagrama dito em palavras, para quem não vê o desenho.
 *
 * Ele diz as ligações e a direção delas, que é o que alguém olhando também lê
 * nas setas — e é a única coisa que importa aqui. Um `aria-label` que dissesse
 * só os nomes das peças esconderia justamente a direção, que é o que a lição
 * ensina e o que erra calado.
 */
function descreverDiagrama(d: Diagrama): string {
  if (d.setas.length === 0) return `Diagrama com ${d.nos.length} peças e nenhuma ligação.`;
  const ligacoes = d.setas
    .map(s => `de ${nomeDe(s.de)} para ${nomeDe(s.para)}, ${s.rotulo}`)
    .join('; ');
  return `Diagrama. Ligações: ${ligacoes}.`;
}
