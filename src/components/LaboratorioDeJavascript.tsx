import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Play, RotateCcw, Square } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_IDE, CabecalhoDaIde, LateralDaIde, EditorDeCodigo, StatusDaIde } from '../labs/ide';
import { contarLinhas } from '../labs/realce';
import { PASSOS_DE_JAVASCRIPT } from '../labs/passosDeJavascript';
import { NodeNoNavegador } from '../labs/javascriptRuntime';
import type { ResultadoDoNode } from '../labs/nodeSimulado';
import { analisarJavascript, type AnaliseDeJavascript } from '../labs/javascriptAnalise';
import { validarJavascript, IDS_DA_EXECUCAO_JS } from '../lib/javascriptValidator';
import type { CheckResult } from '../lib/pythonValidator';
import { arquivosEditaveis } from '../labs/projetoDePython';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/**
 * O laboratório de JavaScript: o editor de código e um terminal com
 * `node programa.js`.
 *
 * É o arranjo do de Python, pelo mesmo motivo escrito lá — saber se um
 * programa roda exige rodá-lo, e **a lista mostra a última execução, e não o
 * texto de agora**. O que muda é o painel da direita: no Python é um painel
 * de saída com a entrada em cima; aqui é um terminal, porque o requisito 7
 * pede um programa executado **fora do navegador**, e fora do navegador
 * JavaScript se executa digitando `node` e o nome do arquivo. A linha do
 * comando aparece em cima da saída, a cada execução, para que a primeira vez
 * diante do terminal do clube não seja a primeira vez que se vê aquilo.
 *
 * Não há campo de entrada. O `input()` do Python lia do teclado; o programa
 * de linha de comando em JavaScript lê de arquivo — é o que as lições pedem,
 * e é o que o requisito 6 ensina.
 *
 * ── A pasta depois da execução ───────────────────────────────────────────
 * Os arquivos de dado aparecem na lateral como ficaram depois do programa, e
 * o arquivo que o programa criou aparece também. Gravar JSON só se confere
 * abrindo o arquivo, e esconder o resultado da gravação seria pedir que a
 * pessoa acreditasse na lista de tarefas.
 */
export default function LaboratorioDeJavascript({ vereda, licao, userId, aoVencer, aoSair }: {
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
  const [aberto, setAberto] = useState(licao.arquivo);
  const [execucao, setExecucao] = useState<ResultadoDoNode | null>(null);
  const [analise, setAnalise] = useState<AnaliseDeJavascript>({ achados: {} as AnaliseDeJavascript['achados'], ilegiveis: [] });
  /* O que gerou os resultados de agora — diferente do atual, a lista está velha. */
  const [rodado, setRodado] = useState<string | null>(null);
  const [rodando, setRodando] = useState(false);
  const [entregue, setEntregue] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(voltou ? 'Seu código voltou como você deixou.' : '');

  useRascunhoLocal(userId, chave, codigo, !entregue);
  useRascunhoLocal(userId, chaveDosExtras, extras, !entregue && Object.keys(extras).length > 0);

  const node = useRef<NodeNoNavegador | null>(null);
  if (!node.current) node.current = new NodeNoNavegador();
  useEffect(() => {
    const n = node.current;
    return () => n?.encerrar();
  }, []);

  /* A pasta como ela está antes de rodar: o principal, o que a pessoa
     escreveu nos outros arquivos, e o dado como a lição o entrega. */
  const pastaDeAgora = useCallback(() => {
    const pasta: Record<string, string> = { [licao.arquivo]: codigo };
    for (const a of doProjeto) pasta[a.nome] = a.editavel ? extras[a.nome] ?? a.modelo : a.modelo;
    return pasta;
  }, [codigo, doProjeto, extras, licao.arquivo]);
  const assinatura = JSON.stringify(pastaDeAgora());
  const velha = rodado !== null && rodado !== assinatura;

  const executar = useCallback(async () => {
    const n = node.current;
    if (!n || rodando) return;
    setRodando(true);
    setAviso('');
    const pasta = pastaDeAgora();
    /* A análise lê só o que a pessoa escreveu: o `servidor.js` que a lição
       entrega já tem promessa e função, e contá-lo daria a tarefa de graça. */
    const escritos: Record<string, string> = { [licao.arquivo]: pasta[licao.arquivo] };
    for (const a of doProjeto) if (a.editavel && a.nome.endsWith('.js')) escritos[a.nome] = pasta[a.nome];
    setAnalise(analisarJavascript(escritos));
    const r = await n.rodar(pasta, licao.arquivo);
    setExecucao(r);
    setRodado(JSON.stringify(pasta));
    setRodando(false);
  }, [rodando, pastaDeAgora, doProjeto, licao.arquivo]);

  const parar = () => { node.current?.encerrar(); setRodando(false); };

  const resultados: CheckResult[] = useMemo(
    () => validarJavascript({
      achados: analise.achados, ilegiveis: analise.ilegiveis, execucao,
      saidaEsperada: licao.saidaEsperada, saidaContem: licao.saidaContem, jsonEsperado: licao.jsonEsperado,
    }, licao.verificacoes),
    [analise, execucao, licao.saidaEsperada, licao.saidaContem, licao.jsonEsperado, licao.verificacoes]);

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
    passos: PASSOS_DE_JAVASCRIPT[r.id],
    feita: r.passed && (!velha || !IDS_DA_EXECUCAO_JS.includes(r.id)),
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
        setCodigo(licao.modelo); setExecucao(null); setRodado(null);
        setExtras(modelosDosExtras); setAberto(licao.arquivo);
      }}
        className="btn-ghost w-full text-sm inline-flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Recomeçar do zero
      </button>
    </div>
  );

  /*
    O principal na frente, os da lição na ordem em que ela os declarou, e por
    último os que o programa criou — quem gravou um arquivo novo precisa vê-lo
    aparecer, senão não há como saber que a gravação aconteceu.
  */
  const daLicao = [licao.arquivo, ...doProjeto.map(a => a.nome)];
  const criados = execucao && !velha
    ? Object.keys(execucao.pasta).filter(n => !daLicao.includes(n)).sort()
    : [];
  const todos = [...daLicao, ...criados];

  const ehOPrincipal = aberto === licao.arquivo;
  const doProjetoAberto = doProjeto.find(a => a.nome === aberto);
  const podeEscrever = ehOPrincipal || !!doProjetoAberto?.editavel;
  /* O dado mostra como ficou depois do programa; o que se escreve mostra o
     que se escreveu. */
  const depois = execucao && !velha ? execucao.pasta[aberto] : undefined;
  const conteudoAberto = ehOPrincipal ? codigo
    : doProjetoAberto?.editavel ? extras[aberto] ?? doProjetoAberto.modelo
      : depois ?? doProjetoAberto?.modelo ?? '';
  const mudouNaExecucao = !podeEscrever && depois !== undefined
    && depois !== (doProjetoAberto?.modelo ?? undefined);
  const escrever = (texto: string) => {
    if (ehOPrincipal) setCodigo(texto);
    else if (doProjetoAberto?.editavel) setExtras(e => ({ ...e, [aberto]: texto }));
  };
  const linguagemDo = (nome: string) => (nome.endsWith('.json') ? 'json' : nome.endsWith('.js') ? 'javascript' : 'html') as 'json' | 'javascript' | 'html';
  const nomeDaLinguagem = (nome: string) => (nome.endsWith('.json') ? 'JSON' : nome.endsWith('.js') ? 'JavaScript' : 'Texto sem formatação');

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
      <style>{CSS_JS}</style>

      <div className="ide">
        <CabecalhoDaIde arquivo={aberto} projeto={licao.projeto} aoAvisar={setAviso} />

        <div className="ide-corpo">
          {todos.length > 1 && (
            <LateralDaIde
              projeto={licao.projeto}
              arquivos={todos.map(nome => ({ nome, problemas: 0 }))}
              atual={aberto}
              aoAbrir={setAberto}
              aoAvisar={setAviso}
            />
          )}

          <EditorDeCodigo
            codigo={conteudoAberto}
            aoMudar={escrever}
            rotulo={aberto}
            linguagem={linguagemDo(aberto)}
            somenteLeitura={!podeEscrever}
          />

          <div className="js-lado">
            <div className="js-barra">
              <button onClick={executar} disabled={rodando}>
                <Play className="w-3.5 h-3.5" /> {rodando ? 'Rodando…' : 'Executar'}
              </button>
              {rodando && (
                <button onClick={parar} className="js-parar">
                  <Square className="w-3.5 h-3.5" /> Parar
                </button>
              )}
            </div>

            <div className="js-rotulo">Terminal</div>
            <pre className="js-terminal" aria-live="polite">
              <span className="js-prompt">~/{licao.projeto}$ </span>
              {execucao || rodando ? `node ${licao.arquivo}\n` : '\n'}
              {rodando ? ''
                : execucao === null ? 'Clique em Executar: é o mesmo que digitar o comando acima.'
                  : execucao.saida}
              {!rodando && execucao?.erro && <span className="js-erro">{`${execucao.saida && !execucao.saida.endsWith('\n') ? '\n' : ''}${execucao.erro}\n`}</span>}
              {!rodando && execucao && !execucao.saida && !execucao.erro && <span className="js-nada">(o programa não escreveu nada)</span>}
            </pre>

            {mudouNaExecucao && (
              <p className="js-nota">{aberto} está como o programa o deixou. Ao executar de novo, a pasta volta ao começo.</p>
            )}
            {velha && (
              <p className="js-velha">
                O código mudou depois da última execução. As tarefas mostram o
                resultado de antes — execute de novo.
              </p>
            )}
          </div>
        </div>

        <StatusDaIde problemas={resultados.length - passaram} linhas={contarLinhas(conteudoAberto)}
          aoAvisar={setAviso} linguagem={nomeDaLinguagem(aberto)} somenteLeitura={!podeEscrever} />
      </div>
    </LaboratorioEmTelaCheia>
  );
}

const CSS_JS = `
.js-lado { width: 360px; flex: none; display: flex; flex-direction: column; gap: 6px;
  padding: 8px; border-left: 1px solid var(--ide-borda, #2A2F3A); min-height: 0; }
.js-barra { display: flex; gap: 6px; }
.js-barra button { display: inline-flex; align-items: center; gap: 5px; border: 0;
  border-radius: 4px; padding: 6px 10px; font-size: 12px; font-weight: 700;
  background: #2E7D32; color: #fff; cursor: pointer; }
.js-barra button:disabled { opacity: .5; cursor: default; }
.js-barra .js-parar { background: #9A3B2F; }
.js-rotulo { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #8B93A7; }
.js-terminal { flex: 1; min-height: 160px; overflow: auto; margin: 0; padding: 8px;
  border: 1px solid #2A2F3A; border-radius: 4px; background: #0C0F14; color: #D7DCE6;
  font-family: ui-monospace, monospace; font-size: 12px; white-space: pre-wrap; }
.js-prompt { color: #7FB685; }
.js-erro { color: #F2A099; }
.js-nada { color: #8B93A7; }
.js-nota { margin: 0; font-size: 11px; color: #9DB4D4; line-height: 1.5; }
.js-velha { margin: 0; font-size: 11px; color: #E0A458; line-height: 1.5; }

@media (max-width: 900px) {
  .ide-corpo { flex-direction: column; overflow: auto; }
  .ide-codigo { min-height: 240px; }
  .js-lado { width: 100%; flex: none; border-left: 0; border-top: 1px solid #2A2F3A; }
  .js-terminal { min-height: 120px; }
}
`;
