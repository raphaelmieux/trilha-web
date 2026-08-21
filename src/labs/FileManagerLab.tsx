import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Folder, File as FileIcon, Link2, Trash2, Monitor, FolderOpen,
  Plus, Pencil, Copy, Scissors, CheckCircle2, Circle, RotateCcw,
} from 'lucide-react';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
} from '../lib/progress';

/*
 * AP041 requisito 5 — as seis operações de pasta e arquivo.
 *
 * O requisito pede demonstração no computador, que um navegador não alcança:
 * a página não cria pasta na área de trabalho de ninguém. A alternativa seria
 * a pessoa marcar "fiz" numa lista, e autodeclaração é justamente o que o resto
 * da plataforma evita.
 *
 * Então o computador é simulado aqui dentro. Cada operação é a de verdade —
 * criar, renomear, copiar, mover, atalho, excluir, esvaziar a lixeira e
 * ordenar — e o laboratório observa se ela aconteceu, em vez de perguntar.
 *
 * Por cliques, e não por arrastar: arrastar é ruim no celular, que é onde boa
 * parte dos desbravadores vai abrir isto.
 */

type Local = 'area' | 'documentos' | 'lixeira';
type Tipo = 'pasta' | 'arquivo' | 'atalho';

interface Item {
  id: string;
  nome: string;
  tipo: Tipo;
  local: Local;
  tamanhoKb: number;
  modificadoEm: number;   // dias atrás, para a ordenação por data
}

const LOCAIS: { id: Local; rotulo: string; icone: typeof Monitor }[] = [
  { id: 'area',        rotulo: 'Área de Trabalho', icone: Monitor },
  { id: 'documentos',  rotulo: 'Documentos',       icone: FolderOpen },
  { id: 'lixeira',     rotulo: 'Lixeira',          icone: Trash2 },
];

const INICIAL: Item[] = [
  { id: 'a1', nome: 'Acampamento.jpg',      tipo: 'arquivo', local: 'area',       tamanhoKb: 2400, modificadoEm: 2 },
  { id: 'a2', nome: 'Lista de bordado.txt', tipo: 'arquivo', local: 'area',       tamanhoKb: 3,    modificadoEm: 14 },
  { id: 'd1', nome: 'Unidade Falcão',       tipo: 'pasta',   local: 'documentos', tamanhoKb: 120,  modificadoEm: 30 },
  { id: 'd2', nome: 'Cantina.pdf',          tipo: 'arquivo', local: 'documentos', tamanhoKb: 850,  modificadoEm: 7 },
];

/** As seis operações do requisito, na ordem do documento oficial. */
const TAREFAS = [
  { id: 't1', rotulo: 'Criar uma pasta e dar um nome a ela',       req: 0 },
  { id: 't2', rotulo: 'Copiar uma pasta para outro lugar',         req: 1 },
  { id: 't3', rotulo: 'Mover uma pasta para outro lugar',          req: 2 },
  { id: 't4', rotulo: 'Criar um atalho',                           req: 3 },
  { id: 't5', rotulo: 'Excluir um arquivo e esvaziar a lixeira',   req: 4 },
  { id: 't6', rotulo: 'Organizar por nome, por data e por tamanho', req: 5 },
] as const;

type TarefaId = (typeof TAREFAS)[number]['id'];

const proximoId = (() => { let n = 0; return () => `n${++n}`; })();

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

export default function FileManagerLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [itens, setItens] = useState<Item[]>(INICIAL);
  const [local, setLocal] = useState<Local>('area');
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [ordem, setOrdem] = useState<'nome' | 'data' | 'tamanho'>('nome');
  const [ordensUsadas, setOrdensUsadas] = useState<Set<string>>(new Set(['nome']));
  const [feitas, setFeitas] = useState<Set<TarefaId>>(new Set());
  const [renomeando, setRenomeando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState('');
  const [aviso, setAviso] = useState('');
  const [salvo, setSalvo] = useState(false);

  const item = itens.find(i => i.id === selecionado) ?? null;
  const naLixeira = local === 'lixeira';

  const visiveis = useMemo(() => {
    const lista = itens.filter(i => i.local === local);
    const por = {
      nome: (a: Item, b: Item) => a.nome.localeCompare(b.nome, 'pt-BR'),
      data: (a: Item, b: Item) => a.modificadoEm - b.modificadoEm,
      tamanho: (a: Item, b: Item) => b.tamanhoKb - a.tamanhoKb,
    }[ordem];
    return [...lista].sort(por);
  }, [itens, local, ordem]);

  const concluir = (t: TarefaId) => setFeitas(f => (f.has(t) ? f : new Set(f).add(t)));

  // ── Operações ──────────────────────────────────────────────────────────
  const criarPasta = () => {
    const nova: Item = {
      id: proximoId(), nome: 'Nova pasta', tipo: 'pasta',
      local, tamanhoKb: 0, modificadoEm: 0,
    };
    setItens(l => [...l, nova]);
    setSelecionado(nova.id);
    setRenomeando(nova.id);
    setRascunho('Nova pasta');
    setAviso('Pasta criada. Agora dê um nome a ela.');
  };

  const confirmarNome = () => {
    const nome = rascunho.trim();
    if (!nome) { setAviso('O nome não pode ficar vazio.'); return; }
    const alvo = itens.find(i => i.id === renomeando);
    setItens(l => l.map(i => (i.id === renomeando ? { ...i, nome } : i)));
    /* Só conta como cumprida quando o nome deixou de ser o padrão: criar e
       aceitar "Nova pasta" não é dar nome a nada. */
    if (alvo?.tipo === 'pasta' && nome !== 'Nova pasta') concluir('t1');
    setRenomeando(null);
    setAviso('');
  };

  const copiar = (destino: Local) => {
    if (!item) return;
    setItens(l => [...l, { ...item, id: proximoId(), local: destino, modificadoEm: 0 }]);
    if (item.tipo === 'pasta' && destino !== item.local) concluir('t2');
    setAviso(`Copiado para ${LOCAIS.find(x => x.id === destino)!.rotulo}. O original continua aqui.`);
  };

  const mover = (destino: Local) => {
    if (!item) return;
    setItens(l => l.map(i => (i.id === item.id ? { ...i, local: destino } : i)));
    if (item.tipo === 'pasta' && destino !== item.local) concluir('t3');
    setSelecionado(null);
    setAviso(`Movido para ${LOCAIS.find(x => x.id === destino)!.rotulo}. Aqui não ficou nenhuma cópia.`);
  };

  const criarAtalho = () => {
    if (!item) return;
    setItens(l => [...l, {
      id: proximoId(), nome: `${item.nome} — atalho`, tipo: 'atalho',
      local, tamanhoKb: 1, modificadoEm: 0,
    }]);
    concluir('t4');
    setAviso('Atalho criado. Ele só aponta para o original — por isso ocupa quase nada.');
  };

  const excluir = () => {
    if (!item) return;
    setItens(l => l.map(i => (i.id === item.id ? { ...i, local: 'lixeira' } : i)));
    setSelecionado(null);
    setAviso('Foi para a lixeira. Enquanto estiver lá, ainda dá para recuperar.');
  };

  const restaurar = () => {
    if (!item) return;
    setItens(l => l.map(i => (i.id === item.id ? { ...i, local: 'area' } : i)));
    setSelecionado(null);
    setAviso('Restaurado para a Área de Trabalho.');
  };

  const esvaziarLixeira = () => {
    const tinha = itens.some(i => i.local === 'lixeira' && i.tipo === 'arquivo');
    setItens(l => l.filter(i => i.local !== 'lixeira'));
    setSelecionado(null);
    /* A tarefa é "excluir um arquivo E esvaziar a lixeira": esvaziar uma
       lixeira que nunca recebeu arquivo não demonstra a primeira metade. */
    if (tinha) concluir('t5');
    setAviso(tinha
      ? 'Lixeira esvaziada. Agora sim: o que estava lá não volta mais.'
      : 'A lixeira já estava sem arquivos.');
  };

  const ordenarPor = (o: 'nome' | 'data' | 'tamanho') => {
    setOrdem(o);
    setOrdensUsadas(u => {
      const nova = new Set(u).add(o);
      if (nova.size === 3) concluir('t6');
      return nova;
    });
  };

  // ── Registro ───────────────────────────────────────────────────────────
  const tudoFeito = feitas.size === TAREFAS.length;

  const registrar = async () => {
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) {
      await ensureEnrollment(userId, specId);
      await updateEnrollmentActivity(userId, specId);
    }

    /*
      Conta quantos requisitos foram de fato gravados.

      getRequirementId devolve nulo em silêncio quando o código não existe no
      banco — e foi assim que a primeira versão deste laboratório exibiu
      "Você domina as seis operações!" sem ter registrado coisa alguma: os
      requisitos da AP041 ainda não tinham sido semeados. Comemorar sem gravar
      é a falha que mais custa a aparecer, porque parece sucesso.
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
      setAviso(
        'As operações foram todas feitas, mas o progresso não pôde ser guardado agora. '
        + 'Nada do que você fez se perdeu — avise a liderança do clube.'
      );
      return;
    }

    await logActivity(userId, 'file_manager_completed', { operacoes: TAREFAS.length });
    setSalvo(true);
  };

  const Icone = ({ tipo }: { tipo: Tipo }) =>
    tipo === 'pasta' ? <Folder className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
    : tipo === 'atalho' ? <Link2 className="w-5 h-5" style={{ color: 'var(--color-tertiary-light)' }} />
    : <FileIcon className="w-5 h-5" style={{ color: 'var(--color-text-dim)' }} />;

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

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="font-bold mb-1">Mexendo em pastas e arquivos</h2>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Este é um computador de mentirinha, só para praticar. Faça as seis
          coisas da lista e nada aqui estraga o seu computador de verdade.
        </p>
      </div>

      <div className="card p-4">
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>O que falta fazer</p>
        <ul className="space-y-1.5">
          {TAREFAS.map(t => {
            const ok = feitas.has(t.id);
            return (
              <li key={t.id} className="flex items-start gap-2 text-sm">
                {ok
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                  : <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-faint)' }} />}
                <span style={{ color: ok ? 'var(--color-success)' : 'var(--color-text-muted)' }}>{t.rotulo}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="card p-4">
        {/* Onde estou */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {LOCAIS.map(l => {
            const Ico = l.icone;
            const aqui = local === l.id;
            return (
              <button
                key={l.id}
                onClick={() => { setLocal(l.id); setSelecionado(null); setAviso(''); }}
                className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5"
                style={{
                  backgroundColor: aqui ? 'var(--color-primary)' : 'var(--color-bg-input)',
                  color: aqui ? '#fff' : 'var(--color-text-muted)',
                  border: `1px solid ${aqui ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                <Ico className="w-4 h-4" /> {l.rotulo}
                {l.id === 'lixeira' && itens.some(i => i.local === 'lixeira') && (
                  <span className="text-xs">({itens.filter(i => i.local === 'lixeira').length})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Ordenação */}
        <div className="flex gap-2 mb-3 flex-wrap items-center">
          <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Organizar por:</span>
          {([['nome', 'Nome'], ['data', 'Data'], ['tamanho', 'Tamanho']] as const).map(([id, rotulo]) => (
            <button
              key={id}
              onClick={() => ordenarPor(id)}
              className="px-2.5 py-1 rounded text-xs"
              style={{
                backgroundColor: ordem === id ? 'var(--color-secondary-a08)' : 'transparent',
                color: ordem === id ? 'var(--color-secondary)' : 'var(--color-text-dim)',
                border: `1px solid ${ordem === id ? 'var(--color-secondary-a20)' : 'var(--color-border)'}`,
              }}
            >
              {rotulo}{ordensUsadas.has(id) && ' ✓'}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          {visiveis.length === 0 ? (
            <p className="p-6 text-center text-sm" style={{ color: 'var(--color-text-faint)' }}>
              Nada por aqui.
            </p>
          ) : visiveis.map(i => (
            <div
              key={i.id}
              onClick={() => { setSelecionado(i.id); setAviso(''); }}
              className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
              style={{
                backgroundColor: selecionado === i.id ? 'var(--color-primary-a08)' : 'transparent',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <Icone tipo={i.tipo} />
              {renomeando === i.id ? (
                <input
                  autoFocus
                  value={rascunho}
                  onChange={e => setRascunho(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && confirmarNome()}
                  onBlur={confirmarNome}
                  className="input-field flex-1 py-1"
                />
              ) : (
                <>
                  <span className="flex-1 text-sm" style={{ color: 'var(--color-text)' }}>{i.nome}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-faint)' }}>
                    {i.tamanhoKb >= 1024 ? `${(i.tamanhoKb / 1024).toFixed(1)} MB` : `${i.tamanhoKb} KB`}
                  </span>
                  <span className="text-xs w-20 text-right" style={{ color: 'var(--color-text-faint)' }}>
                    {i.modificadoEm === 0 ? 'agora' : `há ${i.modificadoEm} dias`}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {!naLixeira && (
            <button onClick={criarPasta} className="btn-secondary text-sm">
              <Plus className="w-4 h-4 mr-1" /> Nova pasta
            </button>
          )}
          {item && !naLixeira && (
            <>
              <button onClick={() => { setRenomeando(item.id); setRascunho(item.nome); }} className="btn-secondary text-sm">
                <Pencil className="w-4 h-4 mr-1" /> Renomear
              </button>
              <button onClick={criarAtalho} className="btn-secondary text-sm">
                <Link2 className="w-4 h-4 mr-1" /> Criar atalho
              </button>
              <button onClick={excluir} className="btn-secondary text-sm">
                <Trash2 className="w-4 h-4 mr-1" /> Excluir
              </button>
              {LOCAIS.filter(l => l.id !== 'lixeira' && l.id !== local).map(l => (
                <span key={l.id} className="flex gap-2">
                  <button onClick={() => copiar(l.id)} className="btn-secondary text-sm">
                    <Copy className="w-4 h-4 mr-1" /> Copiar para {l.rotulo}
                  </button>
                  <button onClick={() => mover(l.id)} className="btn-secondary text-sm">
                    <Scissors className="w-4 h-4 mr-1" /> Mover para {l.rotulo}
                  </button>
                </span>
              ))}
            </>
          )}
          {naLixeira && (
            <>
              {item && (
                <button onClick={restaurar} className="btn-secondary text-sm">
                  <RotateCcw className="w-4 h-4 mr-1" /> Restaurar
                </button>
              )}
              <button onClick={esvaziarLixeira} className="btn-secondary text-sm">
                <Trash2 className="w-4 h-4 mr-1" /> Esvaziar lixeira
              </button>
            </>
          )}
        </div>

        {aviso && (
          <p className="text-sm mt-3" role="status" style={{ color: 'var(--color-secondary)' }}>{aviso}</p>
        )}
      </div>

      <button onClick={registrar} disabled={!tudoFeito} className="btn-primary w-full">
        {tudoFeito
          ? 'Concluir laboratório'
          : `Faltam ${TAREFAS.length - feitas.size} de ${TAREFAS.length}`}
      </button>
    </div>
  );
}
