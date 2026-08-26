import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Copy, ClipboardPaste, FileCheck2, CheckCircle2, Circle,
  MousePointerClick, RotateCcw,
} from 'lucide-react';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';

/*
 * AP042 requisito 3 — as sete demonstrações de formatação.
 *
 * O requisito manda ajustar margem, copiar, colar, trocar fonte, usar negrito,
 * alinhar, espaçar e listar. São gestos, e gesto não se prova em múltipla
 * escolha: dá para acertar a alternativa sobre o botão de negrito sem nunca ter
 * apertado um. Então aqui existe um documento de verdade, e o laboratório
 * observa cada operação acontecer nele.
 *
 * ── Por que um documento só, e não sete exercícios ───────────────────────
 * Sete telas, uma por alínea, ensinariam sete botões soltos. O que se aprende
 * aqui é formatar um documento — a ordem em que as coisas se fazem, e o fato de
 * que a folha se acerta antes do texto. Um documento só também deixa o erro
 * aparecer onde ele aparece na vida: o parágrafo justificado ao lado do que não
 * foi, e a diferença visível entre os dois.
 *
 * ── A seleção primeiro ───────────────────────────────────────────────────
 * Nenhum botão faz nada sem bloco selecionado, e isso é de propósito. É o engano
 * número um de quem começa: apertar negrito sem ter marcado nada, não ver
 * mudança nenhuma e concluir que o programa quebrou. Aqui o programa responde —
 * diz que falta escolher onde — em vez de ficar mudo como o programa de verdade
 * fica.
 *
 * ── O documento começa errado ────────────────────────────────────────────
 * Papel Carta, deitado, margens estreitas. Se ele começasse em A4 retrato, o
 * requisito 3.1 estaria cumprido antes de a pessoa tocar em nada, e "ajustar a
 * folha" viraria "conferir a folha". A tarefa tem que exigir a mudança.
 */

type Alinhamento = 'esquerda' | 'centro' | 'direita' | 'justificado';
type Lista = 'nenhuma' | 'marcadores' | 'numeracao';
type Papel = 'A4' | 'Carta';
type Orientacao = 'retrato' | 'paisagem';
type Margem = 'estreita' | 'normal' | 'larga';

interface Bloco {
  id: string;
  texto: string;
  /** A que parte do documento o bloco pertence — é o que a tarefa cobra. */
  grupo: 'clube' | 'titulo' | 'corpo' | 'rotulo' | 'materiais' | 'passos' | 'assinatura';
  fonte: string;
  tamanho: number;
  negrito: boolean;
  italico: boolean;
  sublinhado: boolean;
  alinhamento: Alinhamento;
  /** Entrelinha do parágrafo: 1 é simples, 1.5 é o pedido em trabalho escolar. */
  espacamento: number;
  lista: Lista;
}

const FONTES = ['Times New Roman', 'Arial', 'Calibri', 'Georgia'];
const TAMANHOS = [10, 11, 12, 14, 18, 24];

const bloco = (id: string, texto: string, grupo: Bloco['grupo']): Bloco => ({
  id, texto, grupo,
  fonte: 'Times New Roman', tamanho: 12,
  negrito: false, italico: false, sublinhado: false,
  alinhamento: 'esquerda', espacamento: 1, lista: 'nenhuma',
});

const DOCUMENTO: Bloco[] = [
  bloco('clube', 'Clube de Desbravadores Pioneiros', 'clube'),
  bloco('titulo', 'Relatório do acampamento da Unidade Falcão', 'titulo'),
  bloco('p1', 'A nossa unidade passou três dias no acampamento regional, com outras onze unidades. Montamos a barraca no sábado de manhã, cozinhamos as três refeições do domingo e participamos da caminhada de doze quilômetros na segunda-feira, antes de desmontar tudo.', 'corpo'),
  bloco('p2', 'Nas noites, o estudo foi do livro O Maior Discurso de Cristo, e cada unidade apresentou uma parte para as outras. A nossa ficou com o trecho sobre a mansidão.', 'corpo'),
  bloco('rot-mat', 'Material que cada um levou:', 'rotulo'),
  bloco('m1', 'Saco de dormir e isolante', 'materiais'),
  bloco('m2', 'Lanterna com pilha de reserva', 'materiais'),
  bloco('m3', 'Prato, caneca e talher', 'materiais'),
  bloco('rot-pas', 'Como montamos a barraca, na ordem:', 'rotulo'),
  bloco('s1', 'Escolher o terreno mais alto e sem pedra', 'passos'),
  bloco('s2', 'Estender a lona e prender as estacas', 'passos'),
  bloco('s3', 'Levantar as varetas e esticar as cordas', 'passos'),
  bloco('ass', 'Curitiba, 12 de outubro', 'assinatura'),
];

interface Meta {
  id: string;
  titulo: string;
  detalhe: string;
  /** Cumprida? Recebe o documento e a folha como estão agora. */
  feita: (d: Bloco[], f: Folha) => boolean;
}

interface Folha { papel: Papel; orientacao: Orientacao; margem: Margem }

const doGrupo = (d: Bloco[], g: Bloco['grupo']) => d.filter(b => b.grupo === g);
const um = (d: Bloco[], id: string) => d.find(b => b.id === id);

const METAS: Meta[] = [
  {
    id: 'folha',
    titulo: 'Acertar a folha',
    detalhe: 'Deixe o papel em A4, na orientação retrato e com margens normais. O documento chegou com a folha errada.',
    feita: (_d, f) => f.papel === 'A4' && f.orientacao === 'retrato' && f.margem === 'normal',
  },
  {
    id: 'copiar',
    titulo: 'Copiar e colar',
    detalhe: 'O nome do clube precisa aparecer também no fim, embaixo da data. Copie a primeira linha e cole no fim do documento.',
    feita: d => doGrupo(d, 'clube').length >= 2 && d[d.length - 1].grupo === 'clube',
  },
  {
    id: 'fonte',
    titulo: 'Trocar a fonte e o tamanho',
    detalhe: 'O título tem que se destacar: escolha outra fonte para ele e um tamanho de 18 ou mais.',
    feita: d => {
      const t = um(d, 'titulo');
      return !!t && t.fonte !== 'Times New Roman' && t.tamanho >= 18;
    },
  },
  {
    id: 'destaque',
    titulo: 'Usar negrito, itálico e sublinhado',
    detalhe: 'Título em negrito. O parágrafo que cita o nome do livro em itálico. A data sublinhada.',
    feita: d => !!um(d, 'titulo')?.negrito && !!um(d, 'p2')?.italico && !!um(d, 'ass')?.sublinhado,
  },
  {
    id: 'alinhar',
    titulo: 'Alinhar cada parte',
    detalhe: 'Título centralizado, os dois parágrafos do corpo justificados e a data alinhada à direita.',
    feita: d => um(d, 'titulo')?.alinhamento === 'centro'
      && doGrupo(d, 'corpo').every(b => b.alinhamento === 'justificado')
      && um(d, 'ass')?.alinhamento === 'direita',
  },
  {
    id: 'espacar',
    titulo: 'Ajustar o espaçamento',
    detalhe: 'Os dois parágrafos do corpo com espaçamento 1,5, que é o pedido em trabalho escolar.',
    feita: d => doGrupo(d, 'corpo').every(b => b.espacamento === 1.5),
  },
  {
    id: 'listas',
    titulo: 'Usar marcadores e numeração',
    detalhe: 'O material vira lista com marcadores — a ordem não importa. A montagem da barraca vira lista numerada, porque ali a ordem importa.',
    feita: d => doGrupo(d, 'materiais').every(b => b.lista === 'marcadores')
      && doGrupo(d, 'passos').every(b => b.lista === 'numeracao'),
  },
];

const MARGEM_EM_PX: Record<Margem, number> = { estreita: 8, normal: 22, larga: 40 };

interface Props { specialtyCode: string; lessonCode: string; requirementCodes: string[]; userId: string; }

export default function FormatacaoTextoLab({ specialtyCode, lessonCode, requirementCodes, userId }: Props) {
  const [doc, setDoc] = useState<Bloco[]>(DOCUMENTO);
  const [folha, setFolha] = useState<Folha>({ papel: 'Carta', orientacao: 'paisagem', margem: 'estreita' });
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [areaDeTransferencia, setAreaDeTransferencia] = useState<Bloco | null>(null);
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  const alvo = doc.find(b => b.id === selecionado) ?? null;
  const cumpridas = METAS.filter(m => m.feita(doc, folha));
  const tudoFeito = cumpridas.length === METAS.length;

  /*
    Toda mudança de formatação passa por aqui, e por isso o aviso de "selecione
    primeiro" também. Espalhar essa checagem por cada botão deixaria um deles
    de fora mais cedo ou mais tarde.
  */
  const formatar = (mudanca: Partial<Bloco>, valeParaOGrupo = false) => {
    if (!alvo) {
      setAviso('Escolha antes onde aplicar: clique num trecho do documento. Botão de formatação sem seleção não faz nada — no computador de verdade também não.');
      return;
    }
    setAviso('');
    setDoc(d => d.map(b => {
      const atinge = valeParaOGrupo ? b.grupo === alvo.grupo : b.id === alvo.id;
      return atinge ? { ...b, ...mudanca } : b;
    }));
  };

  const copiar = () => {
    if (!alvo) {
      setAviso('Selecione o trecho que você quer copiar antes de apertar Copiar.');
      return;
    }
    setAreaDeTransferencia(alvo);
    setAviso(`"${alvo.texto.slice(0, 30)}…" foi copiado. Agora escolha onde colar.`);
  };

  const colar = () => {
    if (!areaDeTransferencia) {
      setAviso('Não há nada copiado ainda. Selecione um trecho e aperte Copiar primeiro.');
      return;
    }
    /* Sem seleção, cola no fim — que é o comportamento de quem clicou no fim do
       documento antes de colar, e é o que a tarefa pede. */
    const copia: Bloco = {
      ...areaDeTransferencia,
      id: `${areaDeTransferencia.id}-copia-${doc.length}`,
    };
    setDoc(d => {
      if (!alvo) return [...d, copia];
      const i = d.findIndex(b => b.id === alvo.id);
      return [...d.slice(0, i + 1), copia, ...d.slice(i + 1)];
    });
    setAviso('Colado. O original continua onde estava — foi copiado, e não recortado.');
  };

  const recomecar = () => {
    setDoc(DOCUMENTO);
    setFolha({ papel: 'Carta', orientacao: 'paisagem', margem: 'estreita' });
    setSelecionado(null);
    setAreaDeTransferencia(null);
    setAviso('');
  };

  const registrar = async () => {
    setErro('');
    setGravando(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) {
      await ensureEnrollment(userId, specId);
      await updateEnrollmentActivity(userId, specId);
    }
    await registrarConclusaoDeLicao(userId, lessonCode);
    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: METAS.length, total_questions: METAS.length,
      });
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você formatou tudo, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'formatacao_concluida', { specialtyCode, lessonCode, metas: METAS.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Documento pronto para entregar!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Você acertou a folha, copiou, trocou a letra, destacou, alinhou, espaçou
          e listou. É exatamente o que se faz com um trabalho antes de imprimir —
          e agora você faz num programa de verdade sem procurar botão.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  const Botao = ({ onClick, ativo, titulo, children }: {
    onClick: () => void; ativo?: boolean; titulo: string; children: React.ReactNode;
  }) => (
    <button onClick={onClick} title={titulo} aria-label={titulo}
      className="p-2 rounded-lg"
      style={{
        backgroundColor: ativo ? 'var(--color-primary-a20)' : 'var(--color-bg-input)',
        color: ativo ? 'var(--color-primary)' : 'var(--color-text)',
      }}>
      {children}
    </button>
  );

  const larguraDaPagina = folha.orientacao === 'retrato' ? 'max-w-md' : 'max-w-2xl';

  return (
    <div className="space-y-4">
      {/* ── As sete tarefas ── */}
      <div className="card p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="font-bold">O que este documento ainda precisa</h2>
          <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
            {cumpridas.length} de {METAS.length}
          </span>
        </div>
        <div className="space-y-2">
          {METAS.map(m => {
            const feita = m.feita(doc, folha);
            return (
              <div key={m.id} className="flex items-start gap-2 p-2 rounded-lg"
                style={{ backgroundColor: feita ? 'var(--color-success-a10)' : 'var(--color-bg-input)' }}>
                {feita
                  ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                  : <Circle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-text-faint)' }} />}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{m.titulo}</p>
                  {!feita && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{m.detalhe}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── A folha ── */}
      <div className="card p-4">
        <h2 className="font-bold mb-1">A folha</h2>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          A folha se acerta antes do texto: mudar o papel depois de tudo pronto
          desmancha o que já estava no lugar.
        </p>
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            <span className="block text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>Tamanho do papel</span>
            <select value={folha.papel} onChange={e => setFolha(f => ({ ...f, papel: e.target.value as Papel }))}
              className="input-field text-sm">
              <option value="A4">A4</option>
              <option value="Carta">Carta</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>Orientação</span>
            <select value={folha.orientacao} onChange={e => setFolha(f => ({ ...f, orientacao: e.target.value as Orientacao }))}
              className="input-field text-sm">
              <option value="retrato">Retrato (em pé)</option>
              <option value="paisagem">Paisagem (deitada)</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>Margens</span>
            <select value={folha.margem} onChange={e => setFolha(f => ({ ...f, margem: e.target.value as Margem }))}
              className="input-field text-sm">
              <option value="estreita">Estreitas</option>
              <option value="normal">Normais</option>
              <option value="larga">Largas</option>
            </select>
          </label>
        </div>
      </div>

      {/* ── A barra de ferramentas ── */}
      <div className="card p-4">
        <h2 className="font-bold mb-3">A barra de ferramentas</h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm">
            <span className="block text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>Fonte</span>
            <select value={alvo?.fonte ?? 'Times New Roman'} onChange={e => formatar({ fonte: e.target.value })}
              className="input-field text-sm">
              {FONTES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>Tamanho</span>
            <select value={alvo?.tamanho ?? 12} onChange={e => formatar({ tamanho: Number(e.target.value) })}
              className="input-field text-sm">
              {TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <div className="flex gap-1">
            <Botao titulo="Negrito" ativo={alvo?.negrito} onClick={() => formatar({ negrito: !alvo?.negrito })}>
              <Bold className="w-4 h-4" />
            </Botao>
            <Botao titulo="Itálico" ativo={alvo?.italico} onClick={() => formatar({ italico: !alvo?.italico })}>
              <Italic className="w-4 h-4" />
            </Botao>
            <Botao titulo="Sublinhado" ativo={alvo?.sublinhado} onClick={() => formatar({ sublinhado: !alvo?.sublinhado })}>
              <Underline className="w-4 h-4" />
            </Botao>
          </div>

          <div className="flex gap-1">
            <Botao titulo="Alinhar à esquerda" ativo={alvo?.alinhamento === 'esquerda'} onClick={() => formatar({ alinhamento: 'esquerda' })}>
              <AlignLeft className="w-4 h-4" />
            </Botao>
            <Botao titulo="Centralizar" ativo={alvo?.alinhamento === 'centro'} onClick={() => formatar({ alinhamento: 'centro' })}>
              <AlignCenter className="w-4 h-4" />
            </Botao>
            <Botao titulo="Alinhar à direita" ativo={alvo?.alinhamento === 'direita'} onClick={() => formatar({ alinhamento: 'direita' })}>
              <AlignRight className="w-4 h-4" />
            </Botao>
            <Botao titulo="Justificar" ativo={alvo?.alinhamento === 'justificado'} onClick={() => formatar({ alinhamento: 'justificado' })}>
              <AlignJustify className="w-4 h-4" />
            </Botao>
          </div>

          <label className="text-sm">
            <span className="block text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>Espaçamento</span>
            <select value={alvo?.espacamento ?? 1} onChange={e => formatar({ espacamento: Number(e.target.value) })}
              className="input-field text-sm">
              <option value={1}>Simples</option>
              <option value={1.5}>1,5</option>
              <option value={2}>Duplo</option>
            </select>
          </label>

          <div className="flex gap-1">
            <Botao titulo="Marcadores" ativo={alvo?.lista === 'marcadores'}
              onClick={() => formatar({ lista: alvo?.lista === 'marcadores' ? 'nenhuma' : 'marcadores' }, true)}>
              <List className="w-4 h-4" />
            </Botao>
            <Botao titulo="Numeração" ativo={alvo?.lista === 'numeracao'}
              onClick={() => formatar({ lista: alvo?.lista === 'numeracao' ? 'nenhuma' : 'numeracao' }, true)}>
              <ListOrdered className="w-4 h-4" />
            </Botao>
          </div>

          <div className="flex gap-1">
            <Botao titulo="Copiar" onClick={copiar}><Copy className="w-4 h-4" /></Botao>
            <Botao titulo="Colar" onClick={colar}><ClipboardPaste className="w-4 h-4" /></Botao>
          </div>

          <button onClick={recomecar} className="btn-secondary text-xs py-2 ml-auto inline-flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Recomeçar
          </button>
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs p-2 rounded-lg"
          style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>
          <MousePointerClick className="w-4 h-4 shrink-0" style={{ color: 'var(--color-secondary)' }} />
          <span>
            {alvo
              ? <>Selecionado: <strong style={{ color: 'var(--color-text)' }}>{alvo.texto.slice(0, 40)}{alvo.texto.length > 40 ? '…' : ''}</strong></>
              : 'Nada selecionado. Clique num trecho do documento para escolher onde a formatação vai valer.'}
          </span>
        </div>

        {aviso && (
          <p className="mt-2 text-sm p-2 rounded-lg"
            style={{ backgroundColor: 'var(--color-warning-a10)', color: 'var(--color-text)' }}>
            {aviso}
          </p>
        )}
      </div>

      {/* ── O documento ── */}
      <div className="card p-4">
        <h2 className="font-bold mb-3">O documento</h2>
        <div className={`mx-auto ${larguraDaPagina} rounded-lg`}
          style={{
            backgroundColor: '#ffffff',
            padding: MARGEM_EM_PX[folha.margem],
            border: '1px solid var(--color-border)',
          }}>
          {doc.map((b, i) => {
            const numero = b.lista === 'numeracao'
              ? doc.filter(x => x.grupo === b.grupo).findIndex(x => x.id === b.id) + 1
              : 0;
            const selecionadoAqui = b.id === selecionado;
            return (
              <div key={b.id}
                onClick={() => { setSelecionado(b.id); setAviso(''); }}
                className="cursor-pointer rounded px-1 py-0.5"
                style={{
                  outline: selecionadoAqui ? '2px solid #2563eb' : 'none',
                  backgroundColor: selecionadoAqui ? '#dbeafe' : 'transparent',
                  marginTop: i === 0 ? 0 : 6,
                  fontFamily: b.fonte,
                  fontSize: b.tamanho,
                  fontWeight: b.negrito ? 700 : 400,
                  fontStyle: b.italico ? 'italic' : 'normal',
                  textDecoration: b.sublinhado ? 'underline' : 'none',
                  textAlign: b.alinhamento === 'centro' ? 'center'
                    : b.alinhamento === 'direita' ? 'right'
                    : b.alinhamento === 'justificado' ? 'justify' : 'left',
                  lineHeight: b.espacamento,
                  color: '#111827',
                  paddingLeft: b.lista === 'nenhuma' ? undefined : 18,
                }}>
                {b.lista === 'marcadores' && <span style={{ marginLeft: -14, marginRight: 6 }}>•</span>}
                {b.lista === 'numeracao' && <span style={{ marginLeft: -16, marginRight: 6 }}>{numero}.</span>}
                {b.texto}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Entregar ── */}
      {tudoFeito && (
        <div className="card p-4 text-center">
          <p className="mb-3" style={{ color: 'var(--color-text-muted)' }}>
            As sete estão feitas. O documento está formatado como um trabalho que
            se entrega.
          </p>
          {erro && <p className="mb-3 text-sm" style={{ color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary inline-flex">
            {gravando ? 'Guardando…' : 'Entregar o documento'}
          </button>
        </div>
      )}
    </div>
  );
}
