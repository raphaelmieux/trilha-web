import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Play, RotateCcw, Eraser } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_IDE, CabecalhoDaIde, LateralDaIde, EditorDeCodigo, StatusDaIde } from '../labs/ide';
import { contarLinhas } from '../labs/realce';
import { NodeNoNavegador } from '../labs/javascriptRuntime';
import { CompiladorNoNavegador } from '../labs/typescriptRuntime';
import type { ResultadoDoNode } from '../labs/nodeSimulado';
import type { Pasta, ResultadoDaCompilacao } from '../labs/compiladorTs';
import type { AnaliseDeTs } from '../labs/analiseTs';
import { executarLinha } from '../labs/terminalDoTs';
import {
  LICOES_DA_CC_FE005, fontesDe, type ContextoDoTs, type PassoComFontes, type VerificacaoDoTs,
} from '../labs/metasDaCcFe005';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/** O que a tela precisa para compilar e rodar — o worker na tela, o Node das travas nos testes. */
export interface AmbienteDoTs {
  compilar: (pasta: Pasta) => Promise<{ compilacao: ResultadoDaCompilacao; analise: Record<string, AnaliseDeTs>; versao: string }>;
  rodar: (pasta: Pasta, principal: string) => Promise<ResultadoDoNode>;
}

/**
 * O laboratório de TypeScript: o editor, o painel de Problemas embaixo dele
 * e um terminal ao lado.
 *
 * ── Duas leituras do mesmo código ────────────────────────────────────────
 * O painel de Problemas é o compilador lendo **enquanto se escreve**, como o
 * editor do clube faz: cada pausa na digitação manda a pasta ao worker, e o
 * erro aparece antes de qualquer comando. O terminal é o `tsc` e o `node`
 * **rodados**: o que a pessoa viu acontecer. As duas coisas são o requisito
 * 5 — o erro apontado antes da execução —, e as tarefas leem as duas.
 *
 * A pasta inclui o que o `tsc` gerou. O `.js` aparece na lateral, só de
 * leitura, e é ele que o `node` roda: ver o arquivo gerado ao lado do escrito
 * é a definição de transpilação que nenhum parágrafo dá.
 */
export default function LaboratorioDeTypescript({ vereda, licao, userId, aoVencer, aoSair, ambiente }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'typescript' }>;
  userId: string;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
  ambiente?: AmbienteDoTs;
}) {
  const definicao = LICOES_DA_CC_FE005[licao.licao];
  const chave = `${vereda.code}-${licao.id}`;
  const metas = definicao.metas;

  const [pasta, setPasta] = useState<Pasta>(() => {
    const g = lerRascunho<Pasta>(userId, chave);
    const daPessoa = g?.conteudo && typeof g.conteudo === 'object' ? g.conteudo : {};
    const base = { ...definicao.arquivos };
    for (const nome of definicao.editaveis) if (typeof daPessoa[nome] === 'string') base[nome] = daPessoa[nome];
    return base;
  });
  const [aviso, setAviso] = useState(() => (lerRascunho(userId, chave) ? 'Seu código voltou como você deixou.' : ''));
  const [aberto, setAberto] = useState(definicao.abre);
  const [historico, setHistorico] = useState<PassoComFontes[]>([]);
  /* O que o terminal mostra: a linha como foi digitada, uma vez, e a saída de
     cada parte dela embaixo. O histórico guarda as partes separadas, porque
     é cada uma que as tarefas leem. */
  const [tela, setTela] = useState<{ linha: string; saida: string; falhou: boolean }[]>([]);
  const [rodando, setRodando] = useState(false);
  const [linha, setLinha] = useState('');
  const [anteriores, setAnteriores] = useState<string[]>([]);
  const [entregue, setEntregue] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const editaveis = useMemo(
    () => Object.fromEntries(definicao.editaveis.filter(n => n in pasta).map(n => [n, pasta[n]])),
    [definicao.editaveis, pasta]);
  useRascunhoLocal(userId, chave, editaveis, !entregue);

  /* ── O compilador e o Node ───────────────────────────────────────────── */

  const reais = useRef<{ compilador: CompiladorNoNavegador; node: NodeNoNavegador } | null>(null);
  const amb = useMemo<AmbienteDoTs>(() => {
    if (ambiente) return ambiente;
    reais.current ??= { compilador: new CompiladorNoNavegador(), node: new NodeNoNavegador() };
    const { compilador, node } = reais.current;
    return { compilar: p => compilador.compilar(p), rodar: (p, m) => node.rodar(p, m) };
  }, [ambiente]);
  useEffect(() => () => { reais.current?.compilador.encerrar(); reais.current?.node.encerrar(); }, []);

  const [versao, setVersao] = useState('5.6.3');

  /* ── O painel de Problemas: a pasta de agora, a cada pausa ───────────── */

  const fontes = fontesDe(pasta, definicao.editaveis);
  const [verificacao, setVerificacao] = useState<{ fontes: string; v: VerificacaoDoTs } | null>(null);
  const pastaRef = useRef(pasta);
  pastaRef.current = pasta;
  useEffect(() => {
    let vivo = true;
    const t = setTimeout(() => {
      const enviada = pastaRef.current;
      void amb.compilar(enviada).then(r => {
        if (!vivo) return;
        setVersao(r.versao);
        setVerificacao({ fontes: fontesDe(enviada, definicao.editaveis), v: { compilacao: r.compilacao, analise: r.analise } });
      });
    }, 400);
    return () => { vivo = false; clearTimeout(t); };
  }, [fontes, amb, definicao.editaveis]);
  const verificacaoDeAgora = verificacao && verificacao.fontes === fontes ? verificacao.v : null;

  /* ── O terminal ──────────────────────────────────────────────────────── */

  const montado = useRef(true);
  useEffect(() => { montado.current = true; return () => { montado.current = false; }; }, []);

  const rodar = useCallback(async (comando: string) => {
    const texto = comando.trim();
    if (!texto || rodando) return;
    setRodando(true);
    setAviso('');
    setAnteriores(a => [...a.filter(x => x !== texto), texto].slice(-30));
    const antes = pastaRef.current;
    const deAgora = fontesDe(antes, definicao.editaveis);
    const r = await executarLinha(texto, antes, {
      compilar: p => amb.compilar(p).then(x => x.compilacao),
      rodar: amb.rodar,
      versao,
    });
    if (!montado.current) return;
    /* O que o comando gerou entra na pasta; o que a pessoa escreveu enquanto
       ele rodava, também — o editor não pode voltar atrás. */
    setPasta(atual => {
      const nova = { ...r.pasta };
      for (const n of definicao.editaveis) if (atual[n] !== antes[n] && n in atual) nova[n] = atual[n];
      return nova;
    });
    setHistorico(h => [...h, ...r.passos.map(p => ({ ...p, fontes: deAgora }))].slice(-60));
    setTela(t => [...t, {
      linha: texto,
      saida: r.passos.map(p => p.saida).join(''),
      falhou: r.passos.some(p => p.codigo !== 0),
    }].slice(-40));
    setRodando(false);
  }, [rodando, amb, versao, definicao.editaveis]);

  const terminalRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const t = terminalRef.current;
    if (t) t.scrollTop = t.scrollHeight;
  }, [tela, rodando]);

  /* ── As tarefas ──────────────────────────────────────────────────────── */

  const ctx = useMemo<ContextoDoTs>(
    () => ({ pasta, verificacao: verificacaoDeAgora, historico }),
    [pasta, verificacaoDeAgora, historico]);
  const tarefas = metas.map(m => {
    const feita = m.feita(ctx);
    return { id: m.id, titulo: m.titulo, passos: m.passos, feita, detalhe: feita ? undefined : m.motivo?.(ctx) };
  });
  const faltam = tarefas.filter(t => !t.feita).length;

  const entregar = async () => {
    setSalvando(true);
    await aoVencer();
    descartarRascunho(userId, chave);
    setSalvando(false);
    setEntregue(true);
  };

  const recomecar = () => {
    setPasta({ ...definicao.arquivos });
    setHistorico([]);
    setTela([]);
    setAberto(definicao.abre);
    setAviso('');
  };

  if (entregue) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{licao.titulo} — vencido!</h1>
        <p className="mb-6" style={{ color: 'var(--color-text-muted)' }}>O projeto compila sem erro e faz o que devia.</p>
        <button onClick={aoSair} className="btn-primary">Voltar para a vereda</button>
      </div>
    );
  }

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={entregar} disabled={faltam > 0 || salvando || rodando}
        className="btn-primary w-full disabled:opacity-50">
        {salvando ? 'Salvando…' : faltam === 0 ? 'Concluir a lição' : `Faltam ${faltam}`}
      </button>
      <button onClick={recomecar} className="btn-ghost w-full text-sm inline-flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Recomeçar do zero
      </button>
    </div>
  );

  /* A ordem da lateral: os da lição, depois o tsconfig se ele apareceu, e por
     último o que o tsc gerou — o .js embaixo do .ts que o originou. */
  const daLicao = Object.keys(definicao.arquivos);
  const criados = Object.keys(pasta).filter(n => !daLicao.includes(n)).sort((a, b) => a.localeCompare(b));
  const nomes = [...daLicao, ...criados];
  const podeEscrever = definicao.editaveis.includes(aberto);
  const conteudo = pasta[aberto] ?? '';
  const gerado = !daLicao.includes(aberto) && aberto !== 'tsconfig.json';
  const linguagem = aberto.endsWith('.ts') ? 'typescript' : aberto.endsWith('.json') ? 'json' : aberto.endsWith('.js') ? 'javascript' : 'html';
  const nomeDaLinguagem = aberto.endsWith('.ts') ? 'TypeScript' : aberto.endsWith('.json') ? 'JSON' : aberto.endsWith('.js') ? 'JavaScript' : 'Texto';

  const diagnosticos = verificacaoDeAgora?.compilacao.diagnosticos ?? [];
  const problemasDe = (nome: string) => diagnosticos.filter(d => d.arquivo === nome).length;

  const aoTeclar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); const l = linha; setLinha(''); void rodar(l); }
    if (e.key === 'ArrowUp' && anteriores.length > 0) {
      e.preventDefault();
      const i = anteriores.indexOf(linha);
      setLinha(anteriores[i <= 0 ? anteriores.length - 1 : i - 1]);
    }
  };

  return (
    <LaboratorioEmTelaCheia trilha={vereda.code} voltarPara={`/vereda/${vereda.code}`} titulo={licao.titulo}
      programa="editor-de-codigo" tarefas={tarefas} aviso={aviso} acoes={acoes} rodape={26}>
      <style>{CSS_IDE}</style>
      <style>{CSS_TS}</style>
      <div className="ide">
        <CabecalhoDaIde arquivo={aberto} projeto={definicao.projeto} aoAvisar={setAviso} />
        <div className="ide-corpo">
          <LateralDaIde projeto={definicao.projeto} arquivos={nomes.map(nome => ({ nome, problemas: problemasDe(nome) }))}
            atual={aberto} aoAbrir={setAberto} aoAvisar={setAviso} />
          <div className="ts-centro">
            {gerado && <p className="ts-gerado">Gerado pelo tsc a partir do .ts — não se edita: mude o .ts e compile de novo.</p>}
            <EditorDeCodigo codigo={conteudo} rotulo={aberto} linguagem={linguagem} somenteLeitura={!podeEscrever}
              aoMudar={texto => { if (podeEscrever) setPasta(p => ({ ...p, [aberto]: texto })); }} />
            <div className="ts-problemas" role="region" aria-label="Problemas">
              <div className="ts-rotulo">
                Problemas{verificacaoDeAgora && !verificacaoDeAgora.compilacao.semProjeto ? ` (${diagnosticos.length})` : ''}
              </div>
              <ul>
                {!verificacaoDeAgora && <li className="ts-nada">O compilador está lendo o projeto…</li>}
                {verificacaoDeAgora?.compilacao.semProjeto && (
                  <li className="ts-nada">Esta pasta não tem tsconfig.json: ainda não é um projeto de TypeScript.</li>
                )}
                {verificacaoDeAgora && !verificacaoDeAgora.compilacao.semProjeto && diagnosticos.length === 0 && (
                  <li className="ts-nada">Nenhum problema no projeto.</li>
                )}
                {diagnosticos.map((d, i) => (
                  <li key={i}>
                    <button className="ts-problema" onClick={() => { if (d.arquivo && d.arquivo in pasta) setAberto(d.arquivo); }}>
                      <span className="ts-x" aria-hidden="true">⊗</span>
                      <span className="ts-msg">{d.mensagem} <span className="ts-cod">ts({d.codigo})</span></span>
                      {d.arquivo && <span className="ts-onde">{d.arquivo}{d.linha ? ` [${d.linha}, ${d.coluna}]` : ''}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="ts-lado">
            <div className="ts-barra">
              <button onClick={() => { void rodar(definicao.executar); }} disabled={rodando} title={`Digita: ${definicao.executar}`}>
                <Play className="w-3.5 h-3.5" /> {rodando ? 'Rodando…' : 'Executar'}
              </button>
              <button onClick={() => setTela([])} className="ts-limpar" title="Limpar o terminal" aria-label="Limpar o terminal">
                <Eraser className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="ts-rotulo">Terminal</div>
            <pre className="ts-terminal" ref={terminalRef} aria-live="polite">
              {tela.length === 0 && !rodando && (
                <span className="ts-nada">{'Digite um comando embaixo — tsc, node, ls, cat — ou clique em Executar.\n'}</span>
              )}
              {tela.map((p, i) => (
                <span key={i}>
                  <span className="ts-prompt">~/{definicao.projeto}$ </span>{`${p.linha}\n`}
                  <span className={p.falhou ? 'ts-erro' : undefined}>{p.saida}</span>
                </span>
              ))}
              {rodando && <span className="ts-nada">…</span>}
            </pre>
            <label className="ts-linha">
              <span className="ts-prompt">~/{definicao.projeto}$</span>
              <input value={linha} onChange={e => setLinha(e.target.value)} onKeyDown={aoTeclar} disabled={rodando}
                aria-label="Comando do terminal" spellCheck={false} autoCapitalize="off" autoComplete="off" />
            </label>
          </div>
        </div>
        <StatusDaIde problemas={diagnosticos.length} linhas={contarLinhas(conteudo)} aoAvisar={setAviso}
          linguagem={nomeDaLinguagem} somenteLeitura={!podeEscrever} />
      </div>
    </LaboratorioEmTelaCheia>
  );
}

const CSS_TS = `
.ts-centro { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ts-centro > .ide-codigo { flex: 1; min-height: 0; }
.ts-gerado { margin: 0; padding: 4px 10px; font-size: 11px; background: #2A2F3A; color: #E0C98A; }
.ts-problemas { height: 128px; flex: none; overflow: auto; border-top: 1px solid #2A2F3A; background: #181A1F; }
.ts-problemas ul { list-style: none; margin: 0; padding: 0 0 6px; }
.ts-rotulo { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #8B93A7; padding: 6px 10px 4px; }
.ts-problema { width: 100%; display: flex; gap: 8px; align-items: baseline; text-align: left; background: none; border: 0;
  padding: 3px 10px; color: #D7DCE6; font-size: 12px; cursor: pointer; }
.ts-problema:hover, .ts-problema:focus-visible { background: #2A2F3A; }
.ts-x { color: #F2A099; flex: none; }
.ts-msg { flex: 1; min-width: 0; white-space: pre-wrap; }
.ts-cod { color: #8B93A7; }
.ts-onde { flex: none; color: #8B93A7; }
.ts-nada { color: #8B93A7; font-size: 12px; padding: 2px 10px; }
.ts-lado { width: 380px; flex: none; display: flex; flex-direction: column; gap: 6px;
  padding: 8px; border-left: 1px solid #2A2F3A; min-height: 0; }
.ts-barra { display: flex; gap: 6px; }
.ts-barra button { display: inline-flex; align-items: center; gap: 5px; border: 0;
  border-radius: 4px; padding: 6px 10px; font-size: 12px; font-weight: 700;
  background: #2E7D32; color: #FFFFFF; cursor: pointer; }
.ts-barra button:disabled { opacity: .5; cursor: default; }
.ts-barra .ts-limpar { background: #2A2F3A; color: #D7DCE6; margin-left: auto; }
.ts-terminal { flex: 1; min-height: 160px; overflow: auto; margin: 0; padding: 8px;
  border: 1px solid #2A2F3A; border-radius: 4px 4px 0 0; background: #0C0F14; color: #D7DCE6;
  font-family: ui-monospace, monospace; font-size: 12px; white-space: pre-wrap; }
.ts-terminal .ts-nada { padding: 0; }
.ts-prompt { color: #7FB685; }
.ts-erro { color: #F2A099; }
.ts-linha { display: flex; gap: 6px; align-items: center; margin-top: -6px; padding: 6px 8px;
  border: 1px solid #2A2F3A; border-top: 0; border-radius: 0 0 4px 4px; background: #0C0F14;
  font-family: ui-monospace, monospace; font-size: 12px; }
.ts-linha input { flex: 1; min-width: 0; background: transparent; border: 0; outline: none; color: #D7DCE6;
  font: inherit; }

@media (max-width: 900px) {
  .ide-corpo { flex-direction: column; overflow: auto; }
  .ts-centro { flex: none; }
  .ts-centro > .ide-codigo { min-height: 240px; }
  .ts-lado { width: 100%; flex: none; border-left: 0; border-top: 1px solid #2A2F3A; }
  .ts-terminal { min-height: 140px; }
}
`;
