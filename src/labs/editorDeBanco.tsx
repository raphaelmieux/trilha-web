import { useEffect, useState } from 'react';
import {
  ChevronDown, ChevronRight, Database, FileCode, KeyRound, Link2, Play, Table2, TriangleAlert,
} from 'lucide-react';
import { EditorDeCodigo } from './ide';
import { chavePrimaria, mostrarValor, type EstadoDoBanco, type ExecucaoDeSql, type Valor } from './sqlite';
import type { ArquivoDeApoio } from './metasDaCc005';

/**
 * O editor de banco de dados da CC005.
 *
 * ── Um arranjo, e não uma marca ──────────────────────────────────────────
 * É a decisão do editor de código, pelo motivo escrito em `ide.tsx`: o
 * desbravador pode encontrar o DB Browser, o DBeaver ou o painel de um
 * serviço na nuvem, e o que os três têm em comum é este arranjo — as tabelas
 * do banco à esquerda, o arquivo de comandos no meio, e embaixo o resultado de
 * cada consulta e as mensagens de cada comando. O editor de texto é o mesmo
 * do editor de código, com o realce de SQL: duas cópias do campo divergiriam
 * no primeiro ajuste do Tab ou do Enter.
 *
 * ── A janela guarda só o que é da tela ───────────────────────────────────
 * Que guia está aberta, que tabela está desdobrada, que painel está embaixo.
 * O arquivo, a execução e o banco são do laboratório, que é quem responde às
 * tarefas — é a regra de `explorer.tsx` e de `excel.tsx`.
 *
 * ── A mensagem de erro é a do SQLite ─────────────────────────────────────
 * Ela sai em inglês, como sai em todo banco, e a lição ensina a ler as cinco
 * que mais aparecem. Traduzir aqui ensinaria uma frase que a pessoa nunca vai
 * reencontrar; o que a janela acrescenta é a linha, que é o que o banco de
 * verdade também diz.
 */

/** Um painel de baixo: o resultado de um comando, as mensagens, ou os dados de uma tabela. */
type Painel = { tipo: 'resultado'; indice: number } | { tipo: 'mensagens' } | { tipo: 'dados'; tabela: string };

export function EditorDeBanco({
  arquivo, codigo, aoMudar, apoio, banco, execucao, rodando, velha, aoExecutar,
}: {
  arquivo: string;
  codigo: string;
  aoMudar: (codigo: string) => void;
  apoio: ArquivoDeApoio[];
  /** O banco que a lateral mostra: o de depois da última execução, ou o de partida. */
  banco: EstadoDoBanco | null;
  execucao: ExecucaoDeSql | null;
  rodando: boolean;
  /** O arquivo mudou depois da última execução. */
  velha: boolean;
  aoExecutar: () => void;
}) {
  const [aberto, setAberto] = useState(arquivo);
  const [desdobradas, setDesdobradas] = useState<string[]>([]);
  const [painel, setPainel] = useState<Painel>({ tipo: 'mensagens' });

  /* A execução nova abre o que mais interessa dela: o erro, quando houve, e
     senão o último resultado — que é o que todo editor de banco mostra. */
  useEffect(() => {
    if (!execucao) return;
    const comResultado = execucao.comandos.map((c, i) => ({ c, i })).filter(x => x.c.tipo === 'consulta' && !x.c.erro);
    setPainel(execucao.erro || comResultado.length === 0
      ? { tipo: 'mensagens' }
      : { tipo: 'resultado', indice: comResultado[comResultado.length - 1].i });
  }, [execucao]);

  const doApoio = apoio.find(a => a.nome === aberto);
  const consultas = (execucao?.comandos ?? []).map((c, i) => ({ c, i })).filter(x => x.c.tipo === 'consulta' && !x.c.erro);

  const alternar = (t: string) => setDesdobradas(d => (d.includes(t) ? d.filter(x => x !== t) : [...d, t]));

  return (
    <div className="bd" onKeyDown={e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); if (!rodando) aoExecutar(); }
    }}>
      <div className="bd-titulo">
        <Database className="w-4 h-4" style={{ color: '#4FA3E0' }} />
        <span className="truncate">clube.db — {aberto} — Editor de Banco de Dados</span>
      </div>
      <div className="bd-barra">
        <button className="bd-executar" onClick={aoExecutar} disabled={rodando || !!doApoio}
          title="Executar todos os comandos do arquivo (Ctrl+Enter)">
          <Play className="w-3.5 h-3.5" /> {rodando ? 'Executando…' : 'Executar'}
        </button>
        <span className="bd-dica">Ctrl+Enter executa o arquivo inteiro, de cima para baixo.</span>
      </div>

      <div className="bd-corpo">
        <nav className="bd-lateral" aria-label="Banco de dados">
          <p className="bd-lateral-nome">Tabelas</p>
          {(banco?.tabelas ?? []).map(t => {
            const aberta = desdobradas.includes(t.nome);
            const chave = chavePrimaria(t);
            return (
              <div key={t.nome}>
                <div className="bd-tabela">
                  <button className="bd-seta" aria-expanded={aberta} aria-label={`${aberta ? 'Recolher' : 'Mostrar'} as colunas de ${t.nome}`}
                    onClick={() => alternar(t.nome)}>
                    {aberta ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <button className="bd-nome-tabela" onClick={() => setPainel({ tipo: 'dados', tabela: t.nome })}
                    title={`Ver os dados de ${t.nome}`}>
                    <Table2 className="w-3.5 h-3.5 flex-none" /> <span className="truncate">{t.nome}</span>
                    <span className="bd-conta">{t.linhas.length}</span>
                  </button>
                </div>
                {aberta && (
                  <ul className="bd-colunas">
                    {t.colunas.map(c => {
                      const fk = t.estrangeiras.find(e => e.coluna === c.nome);
                      return (
                        <li key={c.nome}>
                          {/* A chave e a estrangeira se dizem por ícone e por
                              palavra: o ícone sozinho é o que a lição ensina a
                              reconhecer, e a palavra é o que o leitor de tela
                              lê. */}
                          {chave.includes(c.nome)
                            ? <KeyRound className="w-3 h-3 flex-none" style={{ color: '#E2C044' }} aria-label="chave primária" />
                            : fk ? <Link2 className="w-3 h-3 flex-none" style={{ color: '#7FB8E6' }} aria-label="chave estrangeira" />
                              : <span className="bd-vazio-icone" />}
                          <span className="bd-col-nome">{c.nome}</span>
                          <span className="bd-col-tipo">{c.tipo || 'sem tipo'}{c.naoNulo ? ' · NOT NULL' : ''}</span>
                          {fk && <span className="bd-col-ref">→ {fk.tabela}{fk.para ? `.${fk.para}` : ''}</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
          <p className="bd-lateral-nome">Arquivos</p>
          {[{ nome: arquivo }, ...apoio].map(a => (
            <button key={a.nome} className="bd-arquivo" aria-current={a.nome === aberto} onClick={() => setAberto(a.nome)}>
              <FileCode className="w-3.5 h-3.5 flex-none" /> <span className="truncate">{a.nome}</span>
            </button>
          ))}
        </nav>

        <div className="bd-meio">
          <div className="bd-guias" role="tablist">
            {[{ nome: arquivo }, ...apoio].map(a => (
              <button key={a.nome} role="tab" aria-selected={a.nome === aberto} className="bd-guia"
                onClick={() => setAberto(a.nome)}>{a.nome}</button>
            ))}
          </div>
          <EditorDeCodigo
            codigo={doApoio ? doApoio.conteudo : codigo}
            aoMudar={doApoio ? () => {} : aoMudar}
            rotulo={aberto}
            linguagem={aberto.endsWith('.py') ? 'python' : 'sql'}
            somenteLeitura={!!doApoio}
          />

          <section className="bd-baixo" aria-label="Resultados">
            <div className="bd-paineis" role="tablist">
              {consultas.map((x, n) => (
                <button key={x.i} role="tab" className="bd-painel"
                  aria-selected={painel.tipo === 'resultado' && painel.indice === x.i}
                  onClick={() => setPainel({ tipo: 'resultado', indice: x.i })}>
                  Resultado {n + 1}
                </button>
              ))}
              <button role="tab" className="bd-painel" aria-selected={painel.tipo === 'mensagens'}
                onClick={() => setPainel({ tipo: 'mensagens' })}>
                {execucao?.erro && <TriangleAlert className="w-3 h-3" style={{ color: '#F48771' }} />} Mensagens
              </button>
              {painel.tipo === 'dados' && (
                <button role="tab" className="bd-painel" aria-selected>Dados: {painel.tabela}</button>
              )}
            </div>
            <div className="bd-painel-corpo">
              {velha && (
                <p className="bd-velha">
                  O arquivo mudou depois da última execução. O que está aqui é o resultado de antes.
                </p>
              )}
              <ConteudoDoPainel painel={painel} execucao={execucao} banco={banco} rodando={rodando} />
            </div>
          </section>
        </div>
      </div>

      <div className="bd-status">
        <span>SQLite</span>
        <span>O banco volta ao estado da lição a cada execução</span>
        <span>{execucao ? `${execucao.comandos.length} comando${execucao.comandos.length === 1 ? '' : 's'}` : 'Nada executado ainda'}</span>
      </div>
    </div>
  );
}

function ConteudoDoPainel({ painel, execucao, banco, rodando }: {
  painel: Painel; execucao: ExecucaoDeSql | null; banco: EstadoDoBanco | null; rodando: boolean;
}) {
  if (rodando) return <p className="bd-nota">Executando…</p>;
  if (painel.tipo === 'dados') {
    const t = banco?.tabelas.find(x => x.nome === painel.tabela);
    if (!t) return <p className="bd-nota">A tabela {painel.tabela} não existe mais neste banco.</p>;
    return <Grade colunas={t.colunas.map(c => c.nome)} linhas={t.linhas} rodape={`${t.linhas.length} linha${t.linhas.length === 1 ? '' : 's'} em ${t.nome}`} />;
  }
  if (painel.tipo === 'resultado') {
    const c = execucao?.comandos[painel.indice];
    if (!c) return <p className="bd-nota">Execute o arquivo para ver o resultado.</p>;
    const rodape = `Linha ${c.linha} · ${c.linhas.length}${c.cortado ? '+' : ''} linha${c.linhas.length === 1 ? '' : 's'} devolvida${c.linhas.length === 1 ? '' : 's'}`
      + (c.cortado ? ' — o resultado é maior do que se mostra' : '');
    return <Grade colunas={c.colunas} linhas={c.linhas} rodape={rodape} />;
  }
  if (!execucao) return <p className="bd-nota">Escreva os comandos no arquivo e clique em Executar.</p>;
  if (execucao.comandos.length === 0) return <p className="bd-nota">O arquivo não tem comando nenhum para executar — só comentários.</p>;
  return (
    <ol className="bd-mensagens">
      {execucao.comandos.map((c, i) => (
        <li key={i} className={c.erro ? 'bd-msg bd-msg-erro' : 'bd-msg'}>
          <span className="bd-msg-linha">Linha {c.linha}</span>
          <code className="bd-msg-sql">{resumir(c.sql)}</code>
          <span className="bd-msg-texto">{c.erro ? `Erro: ${c.erro}` : descrever(c)}</span>
        </li>
      ))}
      {execucao.erro && (
        <li className="bd-msg bd-msg-erro">
          A execução parou na linha {execucao.erro.linha}. Os comandos de antes valeram; os de depois não rodaram.
        </li>
      )}
      {execucao.transacaoDesfeita && (
        <li className="bd-msg bd-msg-erro">
          O arquivo abriu uma transação e não a fechou. Ela foi desfeita quando o banco fechou, e o que estava dentro dela não ficou.
        </li>
      )}
    </ol>
  );
}

const resumir = (sql: string) => {
  const linha = sql.replace(/\s+/g, ' ').trim();
  return linha.length > 70 ? `${linha.slice(0, 67)}…` : linha;
};

function descrever(c: ExecucaoDeSql['comandos'][number]): string {
  if (c.tipo === 'consulta') return `${c.linhas.length}${c.cortado ? '+' : ''} linha${c.linhas.length === 1 ? '' : 's'} devolvida${c.linhas.length === 1 ? '' : 's'}`;
  if (c.tipo === 'alteracao') return `${c.alteradas} linha${c.alteradas === 1 ? '' : 's'} afetada${c.alteradas === 1 ? '' : 's'}`;
  if (c.tipo === 'definicao') return 'Estrutura alterada';
  return 'Executado';
}

function Grade({ colunas, linhas, rodape }: { colunas: string[]; linhas: Valor[][]; rodape: string }) {
  return (
    <>
      <div className="bd-grade-rolo">
        <table className="bd-grade">
          <thead>
            <tr>{colunas.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr>
          </thead>
          <tbody>
            {linhas.map((l, i) => (
              <tr key={i}>
                {l.map((v, j) => (
                  /* NULL em itálico e apagado, como em todo editor de banco: é
                     "não se sabe", e não a palavra NULL guardada como texto. */
                  <td key={j} className={v === null ? 'bd-nulo' : typeof v === 'number' ? 'bd-numero' : undefined}>
                    {mostrarValor(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="bd-rodape">{rodape}</p>
    </>
  );
}

/*
  Escura como o editor de código, que é de onde vem o campo de texto: uma
  janela clara com um editor escuro no meio seriam dois programas colados.
*/
export const CSS_DO_EDITOR_DE_BANCO = `
.bd { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #1E1E1E; color: #D4D4D4;
  font-family: 'Segoe UI', system-ui, Roboto, sans-serif; }
.bd-titulo { flex: none; height: 34px; display: flex; align-items: center; gap: 8px; padding: 0 10px;
  background: #3C3C3C; font-size: 12.5px; color: #CCCCCC; }
.bd-barra { flex: none; display: flex; align-items: center; gap: 10px; padding: 5px 8px; background: #2D2D2D;
  border-bottom: 1px solid #3A3A3A; }
.bd-executar { display: inline-flex; align-items: center; gap: 5px; border: 0; border-radius: 4px;
  padding: 6px 12px; font-size: 12px; font-weight: 700; background: #2E7D32; color: #FFFFFF; cursor: pointer; }
.bd-executar:disabled { background: #3A3A3A; color: #9A9A9A; cursor: default; }
.bd-dica { font-size: 11.5px; color: #A8A8A8; }
.bd-corpo { flex: 1; min-height: 0; display: flex; }
.bd-lateral { width: 250px; flex: none; overflow: auto; background: #252526; border-right: 1px solid #3A3A3A;
  padding: 6px 0 12px; font-size: 12.5px; }
.bd-lateral-nome { margin: 8px 10px 4px; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #A8A8A8; }
.bd-tabela { display: flex; align-items: center; }
.bd-seta { border: 0; background: none; color: #CCCCCC; padding: 3px 2px 3px 8px; cursor: pointer; display: inline-flex; }
.bd-nome-tabela { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; border: 0; background: none;
  color: #E0E0E0; padding: 3px 8px 3px 2px; cursor: pointer; text-align: left; font-size: 12.5px; }
.bd-nome-tabela:hover, .bd-arquivo:hover { background: #2A2D2E; }
.bd-conta { margin-left: auto; font-size: 11px; color: #A8A8A8; }
.bd-colunas { list-style: none; margin: 0 0 4px; padding: 0 0 0 30px; }
.bd-colunas li { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; padding: 2px 8px 2px 0; font-size: 12px; }
.bd-vazio-icone { width: 12px; flex: none; }
.bd-col-nome { color: #9CDCFE; }
.bd-col-tipo { color: #A8A8A8; font-size: 11px; }
.bd-col-ref { color: #7FB8E6; font-size: 11px; }
.bd-arquivo { width: 100%; display: flex; align-items: center; gap: 6px; border: 0; background: none; color: #CCCCCC;
  padding: 3px 12px; cursor: pointer; font-size: 12.5px; text-align: left; }
.bd-arquivo[aria-current="true"] { background: #37373D; color: #FFFFFF; }
.bd-meio { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.bd-guias { flex: none; display: flex; background: #252526; overflow-x: auto; }
.bd-guia { border: 0; border-right: 1px solid #1E1E1E; background: #2D2D2D; color: #A8A8A8; padding: 7px 14px;
  font-size: 12.5px; cursor: pointer; white-space: nowrap; }
.bd-guia[aria-selected="true"] { background: #1E1E1E; color: #FFFFFF; }
.bd-baixo { flex: none; height: 42%; min-height: 150px; display: flex; flex-direction: column;
  border-top: 1px solid #3A3A3A; background: #181818; }
.bd-paineis { flex: none; display: flex; gap: 2px; padding: 0 6px; background: #252526; overflow-x: auto; }
.bd-painel { display: inline-flex; align-items: center; gap: 4px; border: 0; border-bottom: 2px solid transparent;
  background: none; color: #A8A8A8; padding: 6px 10px; font-size: 11.5px; text-transform: uppercase;
  letter-spacing: .04em; cursor: pointer; white-space: nowrap; }
.bd-painel[aria-selected="true"] { color: #FFFFFF; border-bottom-color: #4FA3E0; }
.bd-painel-corpo { flex: 1; min-height: 0; overflow: auto; padding: 6px 8px; }
.bd-velha { margin: 0 0 6px; font-size: 11.5px; color: #E0A458; }
.bd-nota { margin: 4px 0; font-size: 12.5px; color: #B0B0B0; }
.bd-grade-rolo { overflow-x: auto; }
.bd-grade { border-collapse: collapse; font-size: 12px; font-family: ui-monospace, 'Cascadia Code', Consolas, monospace; }
.bd-grade th { position: sticky; top: 0; background: #2D2D2D; color: #E0E0E0; text-align: left; font-weight: 600;
  padding: 4px 10px; border: 1px solid #3A3A3A; white-space: nowrap; }
.bd-grade td { padding: 3px 10px; border: 1px solid #2E2E2E; color: #D4D4D4; white-space: nowrap; }
.bd-grade .bd-numero { text-align: right; color: #B5CEA8; }
.bd-grade .bd-nulo { font-style: italic; color: #9A9A9A; }
.bd-rodape { margin: 6px 0 0; font-size: 11.5px; color: #A8A8A8; }
.bd-mensagens { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.bd-msg { display: flex; flex-wrap: wrap; gap: 4px 10px; font-size: 12px; padding: 4px 6px; border-left: 3px solid #4C9A5A; }
.bd-msg-erro { border-left-color: #F48771; color: #F6B0A4; }
.bd-msg-linha { color: #A8A8A8; }
.bd-msg-sql { color: #D4D4D4; font-family: ui-monospace, 'Cascadia Code', Consolas, monospace; }
.bd-msg-texto { color: inherit; }
.bd-status { flex: none; height: 24px; display: flex; align-items: center; gap: 16px; padding: 0 10px;
  background: #007ACC; color: #FFFFFF; font-size: 11.5px; overflow: hidden; white-space: nowrap; }

/*
  No celular as tabelas sobem para o alto, numa faixa que rola, e o arquivo e os
  resultados se empilham embaixo. Esconder a lateral tiraria o único caminho até
  as colunas de cada tabela — e sem ler o nome das colunas não há consulta que se
  escreva. Reduzir a tela nunca reduz o que dá para fazer nela.
*/
@media (max-width: 760px) {
  .bd-corpo { flex-direction: column; overflow: auto; }
  .bd-lateral { width: 100%; max-height: 180px; border-right: 0; border-bottom: 1px solid #3A3A3A; }
  .bd-meio { flex: none; }
  .bd-meio .ide-codigo { min-height: 220px; }
  .bd-baixo { height: auto; min-height: 220px; }
  .bd-dica { display: none; }
}
`;
