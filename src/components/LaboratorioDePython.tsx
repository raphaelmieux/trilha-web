import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Play, RotateCcw, Square } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_IDE, CabecalhoDaIde, EditorDeCodigo, StatusDaIde } from '../labs/ide';
import { contarLinhas } from '../labs/realce';
import { PASSOS_DE_PYTHON } from '../labs/passosDePython';
import { Python, type ResultadoDeExecucao } from '../labs/pythonRuntime';
import { validarPython, type CheckResult } from '../lib/pythonValidator';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/**
 * O laboratório de Python.
 *
 * ── Por que ele não é o laboratório de HTML com outro validador ──────────
 * Em HTML e em CSS a verificação é síncrona: o texto muda, o validador roda, a
 * lista de tarefas se repinta na mesma tecla. Python não é assim. Saber se um
 * programa roda exige rodá-lo, e rodar leva tempo, acontece noutra thread e
 * pode não terminar.
 *
 * Daí a diferença que a tela precisa carregar: **a lista mostra a última
 * execução, e não o texto de agora**. Quando o código muda depois de rodar, os
 * resultados envelhecem — e dizer isso é obrigação, porque uma lista verde ao
 * lado de um código que ninguém rodou é a mentira mais fácil de contar aqui.
 *
 * ── A entrada vem antes ──────────────────────────────────────────────────
 * `input()` é síncrono, e o worker não consegue esperar digitação na página. As
 * linhas são decididas antes, no campo ao lado — que é como se testa um
 * programa de verdade, e como todo juiz de código online funciona.
 */
export default function LaboratorioDePython({ vereda, licao, userId, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'laboratorio' }>;
  userId: string;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const chave = `${vereda.code}-${licao.id}`;

  const [codigo, setCodigo] = useState(() => {
    const g = lerRascunho<string>(userId, chave);
    return typeof g?.conteudo === 'string' ? g.conteudo : licao.modelo;
  });
  const [voltou] = useState(() => {
    const g = lerRascunho<string>(userId, chave);
    return typeof g?.conteudo === 'string' && g.conteudo !== licao.modelo;
  });
  const [entrada, setEntrada] = useState((licao.entradaPadrao ?? []).join('\n'));
  const [execucao, setExecucao] = useState<ResultadoDeExecucao | null>(null);
  const [achados, setAchados] = useState<Record<string, boolean>>({});
  const [erroDeAnalise, setErroDeAnalise] = useState<string | null>(null);
  /* O texto que gerou os resultados de agora. Diferente do atual, a lista está
     velha — e a tela diz isso em vez de mostrar verde por um código que
     ninguém rodou. */
  const [codigoRodado, setCodigoRodado] = useState<string | null>(null);
  const [rodando, setRodando] = useState(false);
  const [entregue, setEntregue] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(voltou ? 'Seu código voltou como você deixou.' : '');

  useRascunhoLocal(userId, chave, codigo, !entregue);

  /* Um Python por laboratório, e ele morre junto com a tela: o worker segura
     13 MB de Pyodide, e deixá-lo vivo depois de sair seria guardar isso por
     nada. */
  const python = useRef<Python | null>(null);
  if (!python.current) python.current = new Python();
  useEffect(() => {
    const p = python.current;
    return () => p?.encerrar();
  }, []);

  const executar = useCallback(async () => {
    const py = python.current;
    if (!py || rodando) return;
    setRodando(true);
    setAviso('');
    const fonte = codigo;
    const linhas = entrada.split('\n').filter((l, i, todas) => l !== '' || i < todas.length - 1);

    /* A análise primeiro: código que não compila não tem árvore, e é o erro de
       sintaxe que a pessoa precisa ler antes de qualquer outra coisa. */
    const analise = await py.analisar(fonte);
    setAchados(analise.achados);
    setErroDeAnalise(analise.erro);

    const r = analise.erro
      /* Sem árvore não há o que rodar: o Python recusaria com o mesmo erro, e
         mostrá-lo duas vezes só faria a pessoa acreditar que são dois. */
      ? { saida: '', erro: analise.erro, semFim: false }
      : await py.rodar(fonte, linhas);

    setExecucao(r);
    setCodigoRodado(fonte);
    setRodando(false);
  }, [codigo, entrada, rodando]);

  const parar = () => { python.current?.encerrar(); setRodando(false); };

  const velha = codigoRodado !== null && codigoRodado !== codigo;

  const resultados: CheckResult[] = useMemo(
    () => validarPython({
      codigo, achados, erroDeAnalise, execucao,
      saidaEsperada: licao.saidaEsperada,
    }, licao.verificacoes),
    [codigo, achados, erroDeAnalise, execucao, licao.saidaEsperada, licao.verificacoes]);

  const passaram = resultados.filter(r => r.passed).length;
  /* Entregar exige que os resultados sejam do código que está na tela. Sem
     isso, bastaria acertar, mexer numa linha e entregar o que não rodou. */
  const podeEntregar = passaram === resultados.length && !velha && !rodando;

  const entregar = async () => {
    setSalvando(true);
    await aoVencer();
    descartarRascunho(userId, chave);
    setSalvando(false);
    setEntregue(true);
  };

  if (entregue) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{licao.titulo} — vencido!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Seu programa passou nas {resultados.length} verificações.
        </p>
        <button onClick={aoSair} className="btn-primary">Voltar para a vereda</button>
      </div>
    );
  }

  const tarefas = resultados.map(r => ({
    id: r.id,
    titulo: r.label,
    detalhe: r.passed ? undefined : (r.detail || r.hint),
    passos: PASSOS_DE_PYTHON[r.id],
    feita: r.passed && !velha,
  }));

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={entregar} disabled={!podeEntregar || salvando}
        className="btn-primary w-full disabled:opacity-50">
        {salvando ? 'Salvando…'
          : velha ? 'Execute de novo'
            : podeEntregar ? 'Entregar' : `Faltam ${resultados.length - passaram}`}
      </button>
      <button onClick={() => { setCodigo(licao.modelo); setExecucao(null); setCodigoRodado(null); }}
        className="btn-ghost w-full text-sm inline-flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Recomeçar do zero
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      titulo={licao.titulo}
      programa="editor-de-codigo"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_IDE}</style>
      <style>{CSS_PY}</style>

      <div className="ide">
        <CabecalhoDaIde arquivo={licao.arquivo} projeto={licao.projeto} aoAvisar={setAviso} />

        <div className="ide-corpo">
          {/* Direto no corpo, sem invólucro: `.ide-codigo` já traz `flex: 1`,
              e um `div` a mais no meio faz esse flex valer dentro dele em vez
              de dentro do corpo — o editor encolhe e sobra faixa morta. */}
          <EditorDeCodigo codigo={codigo} aoMudar={setCodigo}
            rotulo={licao.arquivo} linguagem="python" />

          <div className="py-lado">
            <div className="py-barra">
              <button onClick={executar} disabled={rodando}>
                <Play className="w-3.5 h-3.5" /> {rodando ? 'Rodando…' : 'Executar'}
              </button>
              {rodando && (
                <button onClick={parar} className="py-parar">
                  <Square className="w-3.5 h-3.5" /> Parar
                </button>
              )}
            </div>

            {/*
              O campo de entrada é parte do laboratório, e não um detalhe: é
              nele que se decide o que o input() vai ler, uma linha por chamada.
            */}
            <label className="py-rotulo" htmlFor="py-entrada">
              Entrada — uma linha por <code>input()</code>
            </label>
            <textarea id="py-entrada" className="py-entrada" value={entrada}
              onChange={e => setEntrada(e.target.value)}
              placeholder="O que o programa vai receber" spellCheck={false} />

            <div className="py-rotulo">Saída</div>
            <pre className="py-saida">
              {rodando ? 'Rodando…'
                : execucao === null ? 'Clique em Executar para ver o que o programa faz.'
                  : (execucao.saida || '') + (execucao.erro ? `\n${execucao.erro}` : '')
                  || '(o programa não escreveu nada)'}
            </pre>

            {velha && (
              <p className="py-velha">
                O código mudou depois da última execução. As tarefas mostram o
                resultado de antes — execute de novo.
              </p>
            )}
          </div>
        </div>

        <StatusDaIde problemas={resultados.length - passaram} linhas={contarLinhas(codigo)}
          aoAvisar={setAviso} linguagem="Python" />
      </div>
    </LaboratorioEmTelaCheia>
  );
}

/* As peças que só este laboratório tem: a barra de executar, a entrada e a
   saída. O resto do arranjo é o mesmo `CSS_IDE` dos outros editores. */
const CSS_PY = `
.py-lado { width: 340px; flex: none; display: flex; flex-direction: column; gap: 6px;
  padding: 8px; border-left: 1px solid var(--ide-borda, #2A2F3A); min-height: 0; }
.py-barra { display: flex; gap: 6px; }
.py-barra button { display: inline-flex; align-items: center; gap: 5px; border: 0;
  border-radius: 4px; padding: 6px 10px; font-size: 12px; font-weight: 700;
  background: #2E7D32; color: #fff; cursor: pointer; }
.py-barra button:disabled { opacity: .5; cursor: default; }
.py-barra .py-parar { background: #9A3B2F; }
.py-rotulo { font-size: 11px; text-transform: uppercase; letter-spacing: .04em;
  color: #8B93A7; }
.py-rotulo code { text-transform: none; letter-spacing: 0; }
.py-entrada { height: 84px; resize: vertical; border: 1px solid #2A2F3A; border-radius: 4px;
  background: #10141C; color: #D7DCE6; font-family: ui-monospace, monospace; font-size: 12px;
  padding: 6px; }
.py-saida { flex: 1; min-height: 120px; overflow: auto; margin: 0; padding: 8px;
  border: 1px solid #2A2F3A; border-radius: 4px; background: #10141C; color: #D7DCE6;
  font-family: ui-monospace, monospace; font-size: 12px; white-space: pre-wrap; }
.py-velha { margin: 0; font-size: 11px; color: #E0A458; line-height: 1.5; }

@media (max-width: 900px) {
  .py-lado { width: 100%; border-left: 0; border-top: 1px solid #2A2F3A; }
}
`;
