import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_IDE } from '../labs/ide';
import { CSS_DO_EDITOR_DE_BANCO, EditorDeBanco } from '../labs/editorDeBanco';
import { CSS_DO_MODELADOR, ModeladorDeTabelas } from '../labs/modeladorDeTabelas';
import { Python } from '../labs/pythonRuntime';
import { LICOES_DA_CC005, metasDa, type ContextoDoBanco, type ProgramaDaCc005 } from '../labs/metasDaCc005';
import type { Diagrama } from '../labs/diagramaDeTabelas';
import type { EstadoDoBanco, ExecucaoDeSql } from '../labs/sqlite';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/**
 * Os laboratórios da CC005, menos o do Python.
 *
 * ── Dois programas, um despacho ──────────────────────────────────────────
 * Sete lições abrem o editor de banco e uma abre o modelador de tabelas. O
 * que muda entre as sete é de que banco se parte e o que se cobra, e isso
 * está escrito em `LICOES_DA_CC005`; quem escolhe a janela é o `Record`
 * abaixo, e a nona lição não compila até dizer em qual ela abre. O módulo 9 é
 * o laboratório de Python de sempre, com o banco na pasta: é o mesmo editor
 * da CC002 e da CC004, e uma terceira janela de Python seria o segundo "Word".
 *
 * ── A lista mostra a última execução ─────────────────────────────────────
 * Pelo motivo escrito em `LaboratorioDePython`: o arquivo mudou depois de
 * rodar, as tarefas que leem a execução deixam de valer até rodar de novo, e
 * a tela diz por quê.
 */

const PROGRAMA_IMITADO: Record<ProgramaDaCc005, string> = {
  sql: 'editor-de-banco',
  diagrama: 'modelador-de-tabelas',
};

const FOLHA: Record<ProgramaDaCc005, string> = {
  sql: CSS_IDE + CSS_DO_EDITOR_DE_BANCO,
  diagrama: CSS_DO_MODELADOR,
};

const RODAPE: Record<ProgramaDaCc005, number> = { sql: 24, diagrama: 0 };

export default function LaboratorioDeBanco({ vereda, licao: daLicao, userId, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'banco' }>;
  userId: string;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const definicao = LICOES_DA_CC005[daLicao.licao];
  const programa = definicao.programa;
  const chave = `${vereda.code}-${daLicao.id}`;

  const [codigo, setCodigo] = useState(() => {
    const g = lerRascunho<string>(userId, chave);
    return typeof g?.conteudo === 'string' ? g.conteudo : definicao.modelo;
  });
  const [diagrama, setDiagrama] = useState<Diagrama>(() => {
    const g = lerRascunho<Diagrama>(userId, `${chave}-diagrama`);
    return g?.conteudo && Array.isArray(g.conteudo.tabelas) ? g.conteudo : definicao.diagrama();
  });
  const [aviso, setAviso] = useState(() =>
    lerRascunho(userId, chave) || lerRascunho(userId, `${chave}-diagrama`) ? 'Seu trabalho voltou como você deixou.' : '');
  const [inicial, setInicial] = useState<EstadoDoBanco | null>(null);
  const [execucao, setExecucao] = useState<ExecucaoDeSql | null>(null);
  const [codigoRodado, setCodigoRodado] = useState<string | null>(null);
  const [rodando, setRodando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [entregue, setEntregue] = useState(false);

  useRascunhoLocal(userId, chave, codigo, !entregue && programa === 'sql');
  useRascunhoLocal(userId, `${chave}-diagrama`, diagrama, !entregue && programa === 'diagrama');

  /* Um Python por laboratório, e ele morre junto com a tela: o worker segura
     o Pyodide inteiro, e deixá-lo vivo depois de sair seria guardar isso por
     nada. */
  const python = useRef<Python | null>(null);
  if (!python.current) python.current = new Python();
  useEffect(() => {
    const p = python.current;
    return () => p?.encerrar();
  }, []);

  /* O banco de partida, para a lateral ter as tabelas antes da primeira
     execução: é a mesma semente executada sem comando nenhum. */
  /* O worker atende um pedido por vez, e recusa o segundo. Quem aperta
     Executar no primeiro segundo — antes de o banco de partida terminar de
     abrir — perdia o clique; a execução espera a abertura em vez disso. */
  const abrindo = useRef<Promise<unknown>>(Promise.resolve());
  useEffect(() => {
    if (programa !== 'sql') return;
    let vivo = true;
    const pedido = python.current!.sql(definicao.semente, '').then(r => {
      if (vivo && r.ok) setInicial(r.execucao.banco);
    });
    abrindo.current = pedido;
    return () => { vivo = false; };
  }, [programa, definicao.semente]);

  const executar = useCallback(async () => {
    const py = python.current;
    if (!py || rodando) return;
    setRodando(true);
    setAviso('');
    const fonte = codigo;
    await abrindo.current;
    const r = await py.sql(definicao.semente, fonte);
    setRodando(false);
    if (!r.ok) {
      setAviso(r.mensagem);
      return;
    }
    setExecucao(r.execucao);
    setCodigoRodado(fonte);
  }, [codigo, rodando, definicao.semente]);

  const velha = codigoRodado !== null && codigoRodado !== codigo;
  const ctx = useMemo<ContextoDoBanco>(() => ({ execucao: velha ? null : execucao, diagrama }), [velha, execucao, diagrama]);

  const tarefas = useMemo(
    () => metasDa(daLicao.licao).map(m => ({
      id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos, feita: m.feita(ctx),
    })),
    [daLicao.licao, ctx],
  );
  const faltam = tarefas.filter(t => !t.feita).length;

  const entregar = async () => {
    setSalvando(true);
    await aoVencer();
    descartarRascunho(userId, chave);
    descartarRascunho(userId, `${chave}-diagrama`);
    setSalvando(false);
    setEntregue(true);
    aoSair();
  };

  const recomecar = () => {
    setCodigo(definicao.modelo);
    setDiagrama(definicao.diagrama());
    setExecucao(null);
    setCodigoRodado(null);
    setAviso('');
  };

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={entregar} disabled={faltam > 0 || salvando || rodando}
        className="btn-primary w-full justify-center disabled:opacity-50">
        {salvando ? 'Salvando…' : velha && programa === 'sql' ? 'Execute de novo' : faltam === 0 ? 'Concluir a lição' : `Faltam ${faltam}`}
      </button>
      <button onClick={recomecar} className="btn-ghost w-full text-sm inline-flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Recomeçar do zero
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia trilha={vereda.code} voltarPara={`/vereda/${vereda.code}`} titulo={daLicao.titulo}
      programa={PROGRAMA_IMITADO[programa]} tarefas={tarefas} aviso={aviso} acoes={acoes} rodape={RODAPE[programa]}>
      <style>{FOLHA[programa]}</style>
      {programa === 'sql' && (
        <EditorDeBanco arquivo={definicao.arquivo} codigo={codigo} aoMudar={setCodigo} apoio={definicao.apoio}
          banco={execucao?.banco ?? inicial} execucao={execucao} rodando={rodando} velha={velha}
          aoExecutar={() => { void executar(); }} />
      )}
      {programa === 'diagrama' && <ModeladorDeTabelas diagrama={diagrama} mudar={setDiagrama} />}
    </LaboratorioEmTelaCheia>
  );
}
