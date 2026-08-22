import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Folder, FolderOpen, File as FileIcon, Link2, Trash2, Monitor,
  FolderPlus, Pencil, Copy, Scissors, ClipboardPaste, X,
  ChevronRight, ChevronDown, ArrowLeft, ArrowRight, ArrowUp,
  CheckCircle2, Circle, RotateCcw, ArrowUpNarrowWide, ArrowDownWideNarrow,
} from 'lucide-react';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import {
  AREA, DOCUMENTOS, LIXEIRA, ehRaiz, type No, type Coluna,
  acharNo, filhosDe, caminhoDe, podeSoltarEm, nomeDisponivel, ordenar,
  copiarPara, moverPara, mandarParaLixeira, restaurar, esvaziarLixeira,
  criarGerador, formatarTamanho, formatarData, rotuloDoTipo,
} from './arquivos';

/*
 * AP041 requisito 5 — as seis operações de pasta e arquivo.
 *
 * O requisito pede demonstração no computador, que um navegador não alcança: a
 * página não cria pasta na área de trabalho de ninguém. A alternativa seria a
 * pessoa marcar "fiz" numa lista, e autodeclaração é o que o resto da
 * plataforma evita. Então o computador é simulado aqui, e o laboratório observa
 * cada operação acontecer em vez de perguntar se aconteceu.
 *
 * A versão anterior era uma lista com três botões de "lugar". Praticava as seis
 * operações, mas não se parecia com computador nenhum — e o desbravador vai
 * repetir isto num Windows de verdade, onde o que ele precisa reconhecer é a
 * janela: a árvore à esquerda, o caminho em cima, as colunas que ordenam quando
 * clicadas, o menu que abre com o botão direito.
 *
 * Daí a forma daqui. As cores são as da plataforma, não as do Windows: imitar o
 * cinza do sistema deixaria uma ilha clara dentro de um aplicativo escuro, e o
 * que precisa ser reconhecido é o arranjo, não a paleta.
 *
 * Dois caminhos para cada operação, sempre. Arrastar é o gesto do Explorer e
 * está aqui; no celular ele é impreciso, e lá valem a barra de ferramentas e o
 * menu de contexto por toque longo. Nenhum requisito depende de arrastar.
 */

interface Props { specialtyCode: string; lessonCode: string; requirementCodes: string[]; userId: string; }

const DIA = 86_400_000;

function arvoreInicial(agora: number): No[] {
  const pasta = (id: string, nome: string, paiId: string | null, dias: number): No =>
    ({ id, nome, tipo: 'pasta', paiId, tamanhoKb: 0, modificadoEm: agora - dias * DIA });
  const arq = (id: string, nome: string, paiId: string, kb: number, dias: number): No =>
    ({ id, nome, tipo: 'arquivo', paiId, tamanhoKb: kb, modificadoEm: agora - dias * DIA });

  return [
    pasta(AREA, 'Área de Trabalho', null, 0),
    pasta(DOCUMENTOS, 'Documentos', null, 0),
    pasta(LIXEIRA, 'Lixeira', null, 0),

    pasta('p_acamp', 'Acampamento 2026', AREA, 12),
    arq('a_foto', 'fogueira.jpg', 'p_acamp', 2400, 12),
    arq('a_lista', 'o que levar.txt', 'p_acamp', 3, 20),
    arq('a_hino', 'hino.mp3', AREA, 4100, 45),

    pasta('p_unidade', 'Unidade Falcão', DOCUMENTOS, 30),
    arq('d_ata', 'ata da reunião.pdf', 'p_unidade', 180, 5),
    arq('d_cantina', 'cantina.pdf', DOCUMENTOS, 850, 7),
    arq('d_especial', 'especialidades.docx', DOCUMENTOS, 64, 60),
  ];
}

/** As seis operações do requisito, na ordem do documento oficial. */
const TAREFAS = [
  { id: 't1', rotulo: 'Criar uma pasta e dar um nome a ela' },
  { id: 't2', rotulo: 'Copiar uma pasta para outro lugar' },
  { id: 't3', rotulo: 'Mover uma pasta para outro lugar' },
  { id: 't4', rotulo: 'Criar um atalho' },
  { id: 't5', rotulo: 'Excluir um arquivo e esvaziar a lixeira' },
  { id: 't6', rotulo: 'Organizar por nome, por data e por tamanho' },
] as const;
type TarefaId = (typeof TAREFAS)[number]['id'];

/** As três ordens que o requisito 5.6 nomeia. */
const ORDENS_EXIGIDAS: Coluna[] = ['nome', 'modificado', 'tamanho'];

const ICONE_RAIZ: Record<string, typeof Monitor> = {
  [AREA]: Monitor, [DOCUMENTOS]: FolderOpen, [LIXEIRA]: Trash2,
};

/* ── Pedaços da tela ────────────────────────────────────────────────────────
 *
 * Estes componentes vivem aqui fora, e não dentro de FileManagerLab, por um
 * motivo que só aparece ao arrastar: um componente declarado no corpo de outro
 * é uma função nova a cada render, e para o React função nova é *tipo* novo —
 * ele desmonta a subárvore inteira e monta outra no lugar.
 *
 * Quem arrasta paga a conta. O nó sobre o qual se está soltando é substituído no
 * meio do gesto, e o soltar acontece sobre um elemento que já saiu da página:
 * nada se move, e não há erro nenhum para explicar por quê. Do lado de fora, a
 * identidade é estável e o que muda chega por props.
 */

function IconeDe({ n, tamanho = 'w-4 h-4' }: { n: No; tamanho?: string }) {
  if (ehRaiz(n.id)) {
    const Ico = ICONE_RAIZ[n.id];
    return <Ico className={tamanho} style={{ color: 'var(--color-text-muted)' }} />;
  }
  if (n.tipo === 'pasta') return <Folder className={tamanho} style={{ color: 'var(--color-secondary)' }} />;
  if (n.tipo === 'atalho') return <Link2 className={tamanho} style={{ color: 'var(--color-tertiary-light)' }} />;
  return <FileIcon className={tamanho} style={{ color: 'var(--color-text-dim)' }} />;
}

interface GalhoProps {
  n: No;
  nivel: number;
  arvore: No[];
  expandidas: Set<string>;
  pastaAtual: string;
  alvoSolto: string | null;
  arrastando: string | null;
  aoIr: (id: string) => void;
  aoAlternar: (id: string) => void;
  aoPassarArrastando: (id: string | null) => void;
  aoSoltar: (id: string, copiando: boolean) => void;
}

/** Um galho da árvore, com os filhos abaixo quando aberto. */
function Galho(p: GalhoProps) {
  const { n, nivel, arvore, expandidas, pastaAtual, alvoSolto, arrastando } = p;
  const subpastas = filhosDe(arvore, n.id).filter(f => f.tipo === 'pasta');
  const aberta = expandidas.has(n.id);
  const aqui = pastaAtual === n.id;
  const recebendo = alvoSolto === n.id;

  return (
    <div>
      <div
        className="flex items-center gap-1 px-1 py-1 rounded cursor-pointer text-sm"
        style={{
          paddingLeft: 4 + nivel * 14,
          backgroundColor: recebendo ? 'var(--color-primary-a20)' : aqui ? 'var(--color-bg-hover)' : 'transparent',
          outline: recebendo ? '1px dashed var(--color-primary)' : 'none',
          color: aqui ? 'var(--color-text)' : 'var(--color-text-muted)',
        }}
        onClick={() => p.aoIr(n.id)}
        onDragOver={e => {
          if (arrastando && podeSoltarEm(arvore, arrastando, n.id)) { e.preventDefault(); p.aoPassarArrastando(n.id); }
        }}
        onDragLeave={() => p.aoPassarArrastando(null)}
        onDrop={e => { e.preventDefault(); p.aoSoltar(n.id, e.ctrlKey || e.metaKey); }}
      >
        <button
          onClick={e => { e.stopPropagation(); p.aoAlternar(n.id); }}
          className="flex-shrink-0"
          style={{ visibility: subpastas.length ? 'visible' : 'hidden' }}
          aria-label={aberta ? 'Recolher' : 'Expandir'}
        >
          {aberta ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        <IconeDe n={n} />
        <span className="truncate">{n.nome}</span>
      </div>
      {aberta && subpastas.map(f => <Galho key={f.id} {...p} n={f} nivel={nivel + 1} />)}
    </div>
  );
}

function Cabecalho({ c, rotulo, largura, coluna, crescente, aoOrdenar }: {
  c: Coluna; rotulo: string; largura: string;
  coluna: Coluna; crescente: boolean; aoOrdenar: (c: Coluna) => void;
}) {
  return (
    <button
      onClick={() => aoOrdenar(c)}
      className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-left"
      style={{ width: largura, color: coluna === c ? 'var(--color-text)' : 'var(--color-text-muted)' }}
      title={`Ordenar por ${rotulo.toLowerCase()}`}
    >
      {rotulo}
      {coluna === c && (crescente
        ? <ArrowUpNarrowWide className="w-3 h-3" />
        : <ArrowDownWideNarrow className="w-3 h-3" />)}
    </button>
  );
}

function BotaoBarra({ onClick, desabilitado, Ico, children }: {
  onClick: () => void; desabilitado?: boolean; Ico: typeof Folder; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={desabilitado}
      className="px-2 py-1.5 rounded text-xs flex items-center gap-1.5 disabled:opacity-40"
      style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-soft)' }}
    >
      <Ico className="w-3.5 h-3.5" /> {children}
    </button>
  );
}

export default function FileManagerLab({ specialtyCode, lessonCode, requirementCodes, userId }: Props) {
  const agora = useRef(Date.now()).current;
  const novoId = useRef(criarGerador('n')).current;

  const [arvore, setArvore] = useState<No[]>(() => arvoreInicial(agora));
  const [historico, setHistorico] = useState<string[]>([AREA]);
  const [posicao, setPosicao] = useState(0);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set([AREA]));
  const [coluna, setColuna] = useState<Coluna>('nome');
  const [crescente, setCrescente] = useState(true);
  const [ordensUsadas, setOrdensUsadas] = useState<Set<Coluna>>(new Set(['nome']));
  const [transferencia, setTransferencia] = useState<{ id: string; recortar: boolean } | null>(null);
  const [renomeando, setRenomeando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState('');
  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvoSolto, setAlvoSolto] = useState<string | null>(null);
  const [feitas, setFeitas] = useState<Set<TarefaId>>(new Set());
  const [aviso, setAviso] = useState('');
  const [salvo, setSalvo] = useState(false);

  const pastaAtual = historico[posicao];
  const noAtual = acharNo(arvore, pastaAtual);
  const item = acharNo(arvore, selecionado) ?? null;
  const naLixeira = pastaAtual === LIXEIRA || (selecionado ? caminhoDe(arvore, selecionado).some(n => n.id === LIXEIRA) : false);

  const visiveis = useMemo(
    () => ordenar(filhosDe(arvore, pastaAtual), coluna, crescente),
    [arvore, pastaAtual, coluna, crescente],
  );

  const concluir = useCallback((t: TarefaId) => setFeitas(f => (f.has(t) ? f : new Set(f).add(t))), []);

  /* Fecha o menu de contexto ao clicar em qualquer lugar — é o que todo menu de
     sistema faz, e sem isso ele fica preso na tela. */
  useEffect(() => {
    if (!menu) return;
    const fechar = () => setMenu(null);
    window.addEventListener('click', fechar);
    window.addEventListener('scroll', fechar, true);
    return () => { window.removeEventListener('click', fechar); window.removeEventListener('scroll', fechar, true); };
  }, [menu]);

  /* ── Navegação ─────────────────────────────────────────────────────────── */

  const irPara = (id: string) => {
    if (id === pastaAtual) return;
    setHistorico(h => [...h.slice(0, posicao + 1), id]);
    setPosicao(p => p + 1);
    setSelecionado(null);
    setAviso('');
    setExpandidas(e => new Set([...e, ...caminhoDe(arvore, id).map(n => n.id)]));
  };

  const abrir = (n: No) => {
    if (n.tipo === 'pasta') irPara(n.id);
    else setAviso(`"${n.nome}" abriria no programa do computador. Aqui o que interessa é mexer nele.`);
  };

  /* ── Operações ─────────────────────────────────────────────────────────── */

  const criarPasta = () => {
    const nome = nomeDisponivel(arvore, pastaAtual, 'Nova pasta');
    const id = novoId();
    setArvore(a => [...a, { id, nome, tipo: 'pasta', paiId: pastaAtual, tamanhoKb: 0, modificadoEm: Date.now() }]);
    setSelecionado(id);
    setRenomeando(id);
    setRascunho(nome);
    setAviso('Pasta criada. Agora dê um nome a ela.');
  };

  const confirmarNome = () => {
    const desejado = rascunho.trim();
    if (!renomeando) return;
    if (!desejado) { setAviso('O nome não pode ficar vazio.'); return; }
    const alvo = acharNo(arvore, renomeando)!;
    const nome = nomeDisponivel(arvore, alvo.paiId!, desejado, renomeando);
    setArvore(a => a.map(n => (n.id === renomeando ? { ...n, nome, modificadoEm: Date.now() } : n)));
    /* Só conta como cumprida quando o nome deixou de ser o padrão: criar e
       aceitar "Nova pasta" não é dar nome a nada. */
    if (alvo.tipo === 'pasta' && !nome.startsWith('Nova pasta')) concluir('t1');
    setRenomeando(null);
    setAviso(nome !== desejado ? `Já havia algo com esse nome aqui, então virou "${nome}".` : '');
  };

  const colar = (destino: string) => {
    if (!transferencia) return;
    const origem = acharNo(arvore, transferencia.id);
    if (!origem) return;

    if (transferencia.recortar) {
      if (!podeSoltarEm(arvore, transferencia.id, destino)) {
        setAviso('Não dá para mover uma pasta para dentro dela mesma.');
        return;
      }
      setArvore(a => moverPara(a, transferencia.id, destino, Date.now()));
      if (origem.tipo === 'pasta') concluir('t3');
      setAviso('Movido. No lugar de origem não ficou nenhuma cópia.');
      setTransferencia(null);
    } else {
      setArvore(a => copiarPara(a, transferencia.id, destino, novoId, Date.now()));
      if (origem.tipo === 'pasta' && origem.paiId !== destino) concluir('t2');
      setAviso('Copiado. O original continua onde estava.');
    }
  };

  const criarAtalho = () => {
    if (!item) return;
    const nome = nomeDisponivel(arvore, pastaAtual, `${item.nome} — Atalho`);
    setArvore(a => [...a, {
      id: novoId(), nome, tipo: 'atalho', paiId: pastaAtual,
      tamanhoKb: 1, modificadoEm: Date.now(), apontaPara: item.id,
    }]);
    concluir('t4');
    setAviso('Atalho criado. Ele só aponta para o original — por isso ocupa quase nada.');
  };

  const excluir = () => {
    if (!item || ehRaiz(item.id)) return;
    setArvore(a => mandarParaLixeira(a, item.id));
    setSelecionado(null);
    setAviso('Foi para a Lixeira. Enquanto estiver lá, ainda dá para recuperar.');
  };

  const devolver = () => {
    if (!item) return;
    setArvore(a => restaurar(a, item.id));
    setSelecionado(null);
    setAviso('Restaurado para o lugar de onde saiu.');
  };

  const esvaziar = () => {
    /* A tarefa é "excluir um arquivo E esvaziar a lixeira": esvaziar uma lixeira
       que nunca recebeu arquivo não demonstra a primeira metade. */
    const tinhaArquivo = arvore.some(n => n.tipo === 'arquivo' && caminhoDe(arvore, n.id).some(p => p.id === LIXEIRA));
    setArvore(a => esvaziarLixeira(a));
    setSelecionado(null);
    if (tinhaArquivo) concluir('t5');
    setAviso(tinhaArquivo
      ? 'Lixeira esvaziada. Agora sim: o que estava lá não volta mais.'
      : 'A Lixeira já estava sem arquivos.');
  };

  const ordenarPor = (c: Coluna) => {
    setCrescente(c === coluna ? !crescente : true);
    setColuna(c);
    setOrdensUsadas(u => {
      const nova = new Set(u).add(c);
      if (ORDENS_EXIGIDAS.every(o => nova.has(o))) concluir('t6');
      return nova;
    });
  };

  /* ── Arrastar e soltar ─────────────────────────────────────────────────── */

  const soltarEm = (destino: string, copiando: boolean) => {
    const id = arrastando;
    setArrastando(null);
    setAlvoSolto(null);
    if (!id) return;
    const origem = acharNo(arvore, id);
    if (!origem) return;

    if (!podeSoltarEm(arvore, id, destino)) {
      setAviso(destino === id || !acharNo(arvore, destino)
        ? ''
        : 'Não dá para soltar aí: uma pasta não entra dentro dela mesma.');
      return;
    }
    if (copiando) {
      setArvore(a => copiarPara(a, id, destino, novoId, Date.now()));
      if (origem.tipo === 'pasta') concluir('t2');
      setAviso('Copiado — segurar Ctrl enquanto arrasta copia em vez de mover.');
    } else {
      setArvore(a => moverPara(a, id, destino, Date.now()));
      if (origem.tipo === 'pasta') concluir('t3');
      setAviso('Movido para a pasta de destino.');
    }
  };

  /* ── Conclusão ─────────────────────────────────────────────────────────── */

  const tudoFeito = TAREFAS.every(t => feitas.has(t.id));

  const finalizar = async () => {
    setAviso('');
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);

    /*
      Conferir quantos requisitos foram gravados, e não só disparar a gravação:
      comemorar sem ter registrado é a falha que mais custa a aparecer, porque
      parece sucesso.
    */
    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: TAREFAS.length, total_questions: TAREFAS.length,
      });
      gravados++;
    }
    if (gravados < requirementCodes.length) {
      setAviso('As operações foram todas feitas, mas o progresso não pôde ser guardado agora. '
        + 'Nada do que você fez se perdeu — avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'file_manager_completed', { specialtyCode, lessonCode, operacoes: TAREFAS.length });
    setSalvo(true);
  };

  if (salvo) {
    return (
      <div className="card p-6 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Você domina as seis operações!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Criar, copiar, mover, atalho, excluir e organizar. É assim em qualquer
          computador — muda a aparência, não o que cada uma faz.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  const caminho = caminhoDe(arvore, pastaAtual);

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="font-bold mb-1">Mexendo em pastas e arquivos</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Este é um computador de mentirinha, com a mesma janela que você vai
          encontrar num de verdade. Faça as seis coisas da lista — nada aqui
          estraga o seu computador.
        </p>
      </div>

      {/* ── A lista do requisito ── */}
      <div className="card p-4">
        <p className="text-sm font-medium mb-2">O que falta fazer</p>
        <ul className="space-y-1.5">
          {TAREFAS.map(t => {
            const ok = feitas.has(t.id);
            return (
              <li key={t.id} className="flex items-start gap-2 text-sm">
                {ok
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                  : <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-faint)' }} />}
                <span style={{ color: ok ? 'var(--color-success)' : 'var(--color-text-muted)' }}>{t.rotulo}</span>
                {t.id === 't6' && !ok && (
                  <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                    ({ordensUsadas.size} de 3 — clique nos títulos das colunas)
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── A janela ── */}
      <div className="card overflow-hidden" style={{ padding: 0 }}>
        {/* Barra de navegação e caminho */}
        <div className="flex items-center gap-1 px-2 py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button onClick={() => { setPosicao(p => Math.max(0, p - 1)); setSelecionado(null); }}
            disabled={posicao === 0} className="p-1.5 rounded disabled:opacity-30" aria-label="Voltar">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button onClick={() => { setPosicao(p => Math.min(historico.length - 1, p + 1)); setSelecionado(null); }}
            disabled={posicao >= historico.length - 1} className="p-1.5 rounded disabled:opacity-30" aria-label="Avançar">
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => noAtual?.paiId && irPara(noAtual.paiId)}
            disabled={!noAtual?.paiId} className="p-1.5 rounded disabled:opacity-30" aria-label="Acima">
            <ArrowUp className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 flex-1 min-w-0 ml-1 px-2 py-1 rounded text-sm overflow-x-auto"
            style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
            {caminho.map((n, i) => (
              <span key={n.id} className="flex items-center gap-1 flex-shrink-0">
                {i > 0 && <ChevronRight className="w-3 h-3" style={{ color: 'var(--color-text-faint)' }} />}
                <button onClick={() => irPara(n.id)} className="hover:underline whitespace-nowrap"
                  style={{ color: i === caminho.length - 1 ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                  {n.nome}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Barra de ferramentas */}
        <div className="flex items-center gap-1.5 px-2 py-2 flex-wrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <BotaoBarra onClick={criarPasta} Ico={FolderPlus} desabilitado={pastaAtual === LIXEIRA}>Nova pasta</BotaoBarra>
          <BotaoBarra onClick={() => { setTransferencia({ id: item!.id, recortar: true }); setAviso('Recortado. Vá até o destino e clique em Colar.'); }}
            Ico={Scissors} desabilitado={!item || ehRaiz(item.id)}>Recortar</BotaoBarra>
          <BotaoBarra onClick={() => { setTransferencia({ id: item!.id, recortar: false }); setAviso('Copiado. Vá até o destino e clique em Colar.'); }}
            Ico={Copy} desabilitado={!item || ehRaiz(item.id)}>Copiar</BotaoBarra>
          <BotaoBarra onClick={() => colar(pastaAtual)} Ico={ClipboardPaste} desabilitado={!transferencia}>Colar</BotaoBarra>
          <BotaoBarra onClick={() => { setRenomeando(item!.id); setRascunho(item!.nome); }}
            Ico={Pencil} desabilitado={!item || ehRaiz(item.id)}>Renomear</BotaoBarra>
          <BotaoBarra onClick={criarAtalho} Ico={Link2} desabilitado={!item || ehRaiz(item.id) || naLixeira}>Atalho</BotaoBarra>
          {naLixeira
            ? <BotaoBarra onClick={devolver} Ico={RotateCcw} desabilitado={!item}>Restaurar</BotaoBarra>
            : <BotaoBarra onClick={excluir} Ico={Trash2} desabilitado={!item || ehRaiz(item.id)}>Excluir</BotaoBarra>}
          {pastaAtual === LIXEIRA && (
            <BotaoBarra onClick={esvaziar} Ico={X} desabilitado={filhosDe(arvore, LIXEIRA).length === 0}>
              Esvaziar Lixeira
            </BotaoBarra>
          )}
        </div>

        <div className="flex" style={{ minHeight: 300 }}>
          {/* Árvore */}
          <div className="w-40 sm:w-52 flex-shrink-0 py-2 overflow-y-auto"
            style={{ borderRight: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-input)' }}>
            {arvore.filter(n => n.paiId === null).map(r => (
              <Galho
                key={r.id} n={r} nivel={0}
                arvore={arvore} expandidas={expandidas} pastaAtual={pastaAtual}
                alvoSolto={alvoSolto} arrastando={arrastando}
                aoIr={irPara}
                aoAlternar={id => setExpandidas(x => {
                  const c = new Set(x);
                  if (c.has(id)) c.delete(id); else c.add(id);
                  return c;
                })}
                aoPassarArrastando={setAlvoSolto}
                aoSoltar={soltarEm}
              />
            ))}
          </div>

          {/* Lista de detalhes */}
          <div className="flex-1 min-w-0 overflow-x-auto">
            <div className="flex" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <Cabecalho c="nome" rotulo="Nome" largura="45%" coluna={coluna} crescente={crescente} aoOrdenar={ordenarPor} />
              <Cabecalho c="modificado" rotulo="Data de modificação" largura="25%" coluna={coluna} crescente={crescente} aoOrdenar={ordenarPor} />
              <Cabecalho c="tipo" rotulo="Tipo" largura="18%" coluna={coluna} crescente={crescente} aoOrdenar={ordenarPor} />
              <Cabecalho c="tamanho" rotulo="Tamanho" largura="12%" coluna={coluna} crescente={crescente} aoOrdenar={ordenarPor} />
            </div>

            {visiveis.length === 0 && (
              <p className="p-4 text-sm" style={{ color: 'var(--color-text-faint)' }}>Esta pasta está vazia.</p>
            )}

            {visiveis.map(n => {
              const escolhido = selecionado === n.id;
              const recebendo = alvoSolto === n.id;
              return (
                <div
                  key={n.id}
                  className="flex items-center text-sm cursor-default select-none"
                  style={{
                    backgroundColor: recebendo ? 'var(--color-primary-a20)' : escolhido ? 'var(--color-primary-dim)' : 'transparent',
                    outline: recebendo ? '1px dashed var(--color-primary)' : 'none',
                  }}
                  draggable={!ehRaiz(n.id) && renomeando !== n.id}
                  onDragStart={() => { setArrastando(n.id); setSelecionado(n.id); }}
                  onDragEnd={() => { setArrastando(null); setAlvoSolto(null); }}
                  onDragOver={e => { if (arrastando && podeSoltarEm(arvore, arrastando, n.id)) { e.preventDefault(); setAlvoSolto(n.id); } }}
                  onDragLeave={() => setAlvoSolto(a => (a === n.id ? null : a))}
                  onDrop={e => { e.preventDefault(); soltarEm(n.id, e.ctrlKey || e.metaKey); }}
                  onClick={() => { setSelecionado(n.id); setAviso(''); }}
                  onDoubleClick={() => abrir(n)}
                  onContextMenu={e => { e.preventDefault(); setSelecionado(n.id); setMenu({ x: e.clientX, y: e.clientY, id: n.id }); }}
                >
                  <div className="flex items-center gap-2 px-2 py-1.5 min-w-0" style={{ width: '45%' }}>
                    <IconeDe n={n} />
                    {renomeando === n.id ? (
                      <input
                        autoFocus
                        value={rascunho}
                        onChange={e => setRascunho(e.target.value)}
                        onBlur={confirmarNome}
                        onKeyDown={e => {
                          if (e.key === 'Enter') confirmarNome();
                          if (e.key === 'Escape') setRenomeando(null);
                        }}
                        className="input-field text-sm py-0.5 px-1"
                        aria-label="Novo nome"
                      />
                    ) : (
                      <span className="truncate">{n.nome}</span>
                    )}
                  </div>
                  <span className="px-2 py-1.5 truncate" style={{ width: '25%', color: 'var(--color-text-muted)' }}>
                    {formatarData(n.modificadoEm)}
                  </span>
                  <span className="px-2 py-1.5 truncate" style={{ width: '18%', color: 'var(--color-text-muted)' }}>
                    {rotuloDoTipo(n)}
                  </span>
                  <span className="px-2 py-1.5 text-right" style={{ width: '12%', color: 'var(--color-text-muted)' }}>
                    {formatarTamanho(n)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Barra de status */}
        <div className="px-3 py-1.5 text-xs flex justify-between"
          style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-muted)' }}>
          <span>{visiveis.length} {visiveis.length === 1 ? 'item' : 'itens'}{item ? ' · 1 selecionado' : ''}</span>
          {transferencia && (
            <span>{transferencia.recortar ? 'Recortado' : 'Copiado'}: {acharNo(arvore, transferencia.id)?.nome}</span>
          )}
        </div>
      </div>

      {aviso && <p className="text-sm px-1" style={{ color: 'var(--color-secondary)' }}>{aviso}</p>}

      <p className="text-xs px-1" style={{ color: 'var(--color-text-faint)' }}>
        Dois toques abrem uma pasta. Arraste um item até uma pasta para mover — segurando
        Ctrl, copia. No celular, use a barra de cima ou segure o item para abrir o menu.
      </p>

      <button onClick={finalizar} disabled={!tudoFeito} className="btn-primary">
        {tudoFeito ? 'Concluir o laboratório' : `Faltam ${TAREFAS.length - feitas.size} operação(ões)`}
      </button>

      {/* Menu de contexto */}
      {menu && (() => {
        const n = acharNo(arvore, menu.id);
        if (!n) return null;
        const naoRaiz = !ehRaiz(n.id);
        const opcoes: [string, typeof Folder, () => void, boolean][] = [
          ['Abrir', FolderOpen, () => abrir(n), true],
          ['Recortar', Scissors, () => setTransferencia({ id: n.id, recortar: true }), naoRaiz],
          ['Copiar', Copy, () => setTransferencia({ id: n.id, recortar: false }), naoRaiz],
          ['Colar aqui', ClipboardPaste, () => colar(n.tipo === 'pasta' ? n.id : pastaAtual), !!transferencia],
          ['Criar atalho', Link2, criarAtalho, naoRaiz && !naLixeira],
          ['Renomear', Pencil, () => { setRenomeando(n.id); setRascunho(n.nome); }, naoRaiz],
          [naLixeira ? 'Restaurar' : 'Excluir', naLixeira ? RotateCcw : Trash2, naLixeira ? devolver : excluir, naoRaiz],
        ];
        return (
          <ul
            className="fixed z-50 py-1 rounded-lg text-sm shadow-xl"
            style={{
              left: Math.min(menu.x, window.innerWidth - 180), top: Math.min(menu.y, window.innerHeight - 260),
              minWidth: 168, backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {opcoes.filter(([, , , mostrar]) => mostrar).map(([rotulo, Ico, acao]) => (
              <li key={rotulo}>
                <button
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:opacity-80"
                  style={{ color: 'var(--color-text-soft)' }}
                  onClick={() => { acao(); setMenu(null); }}
                >
                  <Ico className="w-3.5 h-3.5" /> {rotulo}
                </button>
              </li>
            ))}
          </ul>
        );
      })()}
    </div>
  );
}
