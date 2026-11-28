import { useCallback, useMemo, useState } from 'react';
import { CheckCircle2, Play, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_IDE, CabecalhoDaIde, LateralDaIde, EditorDeCodigo, StatusDaIde } from '../labs/ide';
import { contarLinhas } from '../labs/realce';
import { PASSOS_DE_DART } from '../labs/passosDeDart';
import { executarProgramaDart, lerPrograma, type ResultadoDoDart } from '../labs/dartSimulado';
import { analisarProgramaDart, type AchadosDart } from '../labs/dartAnalise';
import { validarDart, IDS_DA_EXECUCAO_DART } from '../lib/dartValidator';
import type { CheckResult } from '../lib/pythonValidator';
import { arquivosEditaveis } from '../labs/projetoDePython';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import { useAgendar } from '../hooks/useAgendar';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/**
 * O laboratório de Dart: o editor de código e um terminal com `dart run`.
 *
 * É o arranjo do de JavaScript, com uma diferença que é a matéria do
 * requisito 2.1: **o compilador vem antes**. Com um erro de tipo no arquivo,
 * nada roda — o terminal mostra o erro e nenhuma linha de saída, nem as que
 * vêm antes do erro. No Python e no JavaScript as linhas de cima já teriam
 * saído; aqui não, e é vendo isso que se entende o que compilar quer dizer.
 *
 * A entrada fica em cima do terminal, como no laboratório de Python: o
 * `stdin.readLineSync()` lê uma linha por chamada, e quando as linhas acabam
 * ele devolve `null` — que é o nulo que a lição de nulo seguro manda tratar.
 */
export default function LaboratorioDeDart({ vereda, licao, userId, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'laboratorio' }>;
  userId: string;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const chave = `${vereda.code}-${licao.id}`;
  const agendar = useAgendar();

  const [codigo, setCodigo] = useState(() => {
    const g = lerRascunho<string>(userId, chave);
    return typeof g?.conteudo === 'string' ? g.conteudo : licao.modelo;
  });
  const [voltou] = useState(() => {
    const g = lerRascunho<string>(userId, chave);
    return typeof g?.conteudo === 'string' && g.conteudo !== licao.modelo;
  });

  const doProjeto = useMemo(() => licao.arquivosDoProjeto ?? [], [licao.arquivosDoProjeto]);
  const modelosDosExtras = useMemo(
    () => Object.fromEntries(arquivosEditaveis(doProjeto).map(a => [a.nome, a.modelo])),
    [doProjeto]);
  const chaveDosExtras = `${chave}-arquivos`;
  const [extras, setExtras] = useState<Record<string, string>>(() => {
    const g = lerRascunho<Record<string, string>>(userId, chaveDosExtras);
    return g?.conteudo && typeof g.conteudo === 'object'
      ? { ...modelosDosExtras, ...g.conteudo }
      : modelosDosExtras;
  });
  const [entrada, setEntrada] = useState((licao.entradaPadrao ?? []).join('\n'));
  const [aberto, setAberto] = useState(licao.arquivo);
  const [execucao, setExecucao] = useState<ResultadoDoDart | null>(null);
  const [achados, setAchados] = useState<AchadosDart | null>(null);
  const [rodado, setRodado] = useState<string | null>(null);
  const [rodando, setRodando] = useState(false);
  const [entregue, setEntregue] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(voltou ? 'Seu código voltou como você deixou.' : '');

  useRascunhoLocal(userId, chave, codigo, !entregue);
  useRascunhoLocal(userId, chaveDosExtras, extras, !entregue && Object.keys(extras).length > 0);

  const pastaDeAgora = useCallback(() => {
    const pasta: Record<string, string> = { [licao.arquivo]: codigo };
    for (const a of doProjeto) pasta[a.nome] = a.editavel ? extras[a.nome] ?? a.modelo : a.modelo;
    return pasta;
  }, [codigo, doProjeto, extras, licao.arquivo]);
  const temEntrada = licao.entradaPadrao !== undefined;
  const assinatura = JSON.stringify([pastaDeAgora(), temEntrada ? entrada : '']);
  const velha = rodado !== null && rodado !== assinatura;

  const executar = useCallback(() => {
    if (rodando) return;
    setRodando(true);
    setAviso('');
    const pasta = pastaDeAgora();
    const linhas = entrada.split('\n').filter((l, i, todas) => l !== '' || i < todas.length - 1);
    const assinado = JSON.stringify([pasta, temEntrada ? entrada : '']);
    /* Um quadro para o "Rodando…" aparecer: o simulador roda na própria página,
       e sem a pausa o botão nem piscaria. */
    agendar(() => {
      const r = executarProgramaDart(pasta, licao.arquivo, temEntrada ? linhas : []);
      /* A análise lê só o que a pessoa escreveu: o arquivo que a lição entrega
         pronto já tem classe e campo, e contá-lo daria a tarefa de graça. */
      const escritos: Record<string, string> = { [licao.arquivo]: pasta[licao.arquivo] };
      for (const a of doProjeto) if (a.editavel) escritos[a.nome] = pasta[a.nome];
      const lido = lerPrograma(pasta, licao.arquivo);
      const deQuemEscreveu = lido.arvores.filter(a => a.arquivo in escritos);
      setAchados(lido.problemas.some(p => p.arquivo in escritos) ? null : analisarProgramaDart(deQuemEscreveu));
      setExecucao(r);
      setRodado(assinado);
      setRodando(false);
    }, 30);
  }, [rodando, pastaDeAgora, entrada, temEntrada, agendar, licao.arquivo, doProjeto]);

  const resultados: CheckResult[] = useMemo(
    () => validarDart({ achados, execucao, saidaEsperada: licao.saidaEsperada, saidaContem: licao.saidaContem }, licao.verificacoes),
    [achados, execucao, licao.saidaEsperada, licao.saidaContem, licao.verificacoes]);

  const passaram = resultados.filter(r => r.passed).length;
  const podeEntregar = passaram === resultados.length && !velha && !rodando;

  const entregar = async () => {
    setSalvando(true);
    await aoVencer();
    descartarRascunho(userId, chave);
    descartarRascunho(userId, chaveDosExtras);
    setSalvando(false);
    setEntregue(true);
  };

  if (entregue) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{licao.titulo} — vencido!</h1>
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {resultados.length === 1
            ? 'Seu programa passou na verificação.'
            : `Seu programa passou nas ${resultados.length} verificações.`}
        </p>
        <button onClick={aoSair} className="btn-primary">Voltar para a vereda</button>
      </div>
    );
  }

  const tarefas = resultados.map(r => ({
    id: r.id,
    titulo: r.label,
    detalhe: r.passed ? undefined : (r.detail || r.hint),
    passos: PASSOS_DE_DART[r.id],
    feita: r.passed && (!velha || !IDS_DA_EXECUCAO_DART.includes(r.id)),
  }));

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={entregar} disabled={!podeEntregar || salvando}
        className="btn-primary w-full disabled:opacity-50">
        {salvando ? 'Salvando…'
          : velha ? 'Execute de novo'
            : podeEntregar ? 'Entregar' : `Faltam ${resultados.length - passaram}`}
      </button>
      <button onClick={() => {
        setCodigo(licao.modelo); setExecucao(null); setAchados(null); setRodado(null);
        setExtras(modelosDosExtras); setAberto(licao.arquivo);
        setEntrada((licao.entradaPadrao ?? []).join('\n'));
      }}
        className="btn-ghost w-full text-sm inline-flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Recomeçar do zero
      </button>
    </div>
  );

  const todos = [licao.arquivo, ...doProjeto.map(a => a.nome)];
  const ehOPrincipal = aberto === licao.arquivo;
  const doProjetoAberto = doProjeto.find(a => a.nome === aberto);
  const podeEscrever = ehOPrincipal || !!doProjetoAberto?.editavel;
  const conteudoAberto = ehOPrincipal ? codigo
    : doProjetoAberto?.editavel ? extras[aberto] ?? doProjetoAberto.modelo
      : doProjetoAberto?.modelo ?? '';
  const escrever = (texto: string) => {
    if (ehOPrincipal) setCodigo(texto);
    else if (doProjetoAberto?.editavel) setExtras(e => ({ ...e, [aberto]: texto }));
  };
  const ehDart = (nome: string) => nome.endsWith('.dart');
  const problemasPorArquivo = (nome: string) => (execucao && !velha ? execucao.problemas.filter(p => p.arquivo === nome).length : 0);

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={licao.titulo}
      programa="editor-de-codigo"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_IDE}</style>
      <style>{CSS_DART}</style>

      <div className="ide">
        <CabecalhoDaIde arquivo={aberto} projeto={licao.projeto} aoAvisar={setAviso} />

        <div className="ide-corpo">
          {todos.length > 1 && (
            <LateralDaIde
              projeto={licao.projeto}
              arquivos={todos.map(nome => ({ nome, problemas: problemasPorArquivo(nome) }))}
              atual={aberto}
              aoAbrir={setAberto}
              aoAvisar={setAviso}
            />
          )}

          <EditorDeCodigo
            codigo={conteudoAberto}
            aoMudar={escrever}
            rotulo={aberto}
            linguagem={ehDart(aberto) ? 'dart' : 'html'}
            somenteLeitura={!podeEscrever}
          />

          <div className="dt-lado">
            <div className="dt-barra">
              <button onClick={executar} disabled={rodando}>
                <Play className="w-3.5 h-3.5" /> {rodando ? 'Rodando…' : 'Executar'}
              </button>
            </div>

            {temEntrada && (
              <>
                <label className="dt-rotulo" htmlFor="dt-entrada">
                  Entrada — uma linha por <code>readLineSync()</code>
                </label>
                <textarea id="dt-entrada" className="dt-entrada" value={entrada}
                  onChange={e => setEntrada(e.target.value)}
                  placeholder="O que o programa vai ler do teclado" spellCheck={false} />
              </>
            )}

            <div className="dt-rotulo">Terminal</div>
            <pre className="dt-terminal" aria-live="polite">
              <span className="dt-prompt">~/{licao.projeto}$ </span>
              {execucao || rodando ? `dart run ${licao.arquivo}\n` : '\n'}
              {rodando ? ''
                : execucao === null ? 'Clique em Executar: é o mesmo que digitar o comando acima.'
                  : execucao.saida}
              {!rodando && execucao?.erro && (
                <span className="dt-erro">{`${execucao.saida && !execucao.saida.endsWith('\n') ? '\n' : ''}${execucao.erro}\n`}</span>
              )}
              {!rodando && execucao?.semFim && !execucao.erro && (
                <span className="dt-erro">{'\nO programa não terminou sozinho e foi encerrado.\nQuase sempre é um laço cuja condição nunca fica falsa: confira se algo dentro dele muda a variável que a condição testa.\n'}</span>
              )}
              {!rodando && execucao && !execucao.saida && !execucao.erro && !execucao.semFim && <span className="dt-nada">(o programa não escreveu nada)</span>}
            </pre>

            {velha && (
              <p className="dt-velha">
                O código mudou depois da última execução. As tarefas mostram o
                resultado de antes — execute de novo.
              </p>
            )}
          </div>
        </div>

        <StatusDaIde problemas={resultados.length - passaram} linhas={contarLinhas(conteudoAberto)}
          aoAvisar={setAviso} linguagem={ehDart(aberto) ? 'Dart' : 'Texto sem formatação'} somenteLeitura={!podeEscrever} />
      </div>
    </LaboratorioEmTelaCheia>
  );
}

const CSS_DART = `
.dt-lado { width: 380px; flex: none; display: flex; flex-direction: column; gap: 6px;
  padding: 8px; border-left: 1px solid var(--ide-borda, #2A2F3A); min-height: 0; }
.dt-barra { display: flex; gap: 6px; }
.dt-barra button { display: inline-flex; align-items: center; gap: 5px; border: 0;
  border-radius: 4px; padding: 6px 10px; font-size: 12px; font-weight: 700;
  background: #2E7D32; color: #fff; cursor: pointer; }
.dt-barra button:disabled { opacity: .5; cursor: default; }
.dt-rotulo { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #8B93A7; }
.dt-rotulo code { text-transform: none; letter-spacing: 0; }
.dt-entrada { height: 72px; resize: vertical; border: 1px solid #2A2F3A; border-radius: 4px;
  background: #10141C; color: #D7DCE6; font-family: ui-monospace, monospace; font-size: 12px; padding: 6px; }
.dt-terminal { flex: 1; min-height: 160px; overflow: auto; margin: 0; padding: 8px;
  border: 1px solid #2A2F3A; border-radius: 4px; background: #0C0F14; color: #D7DCE6;
  font-family: ui-monospace, monospace; font-size: 12px; white-space: pre-wrap; }
.dt-prompt { color: #7FB685; }
.dt-erro { color: #F2A099; }
.dt-nada { color: #8B93A7; }
.dt-velha { margin: 0; font-size: 11px; color: #E0A458; line-height: 1.5; }

@media (max-width: 900px) {
  .ide-corpo { flex-direction: column; overflow: auto; }
  .ide-codigo { min-height: 240px; }
  .dt-lado { width: 100%; flex: none; border-left: 0; border-top: 1px solid #2A2F3A; }
  .dt-terminal { min-height: 120px; }
}
`;
