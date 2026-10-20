import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Globe, Home, NotebookPen, BookmarkPlus, Trash2, RotateCcw, FileCheck2, X, Lock,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CADERNO_VAZIO, METAS_DA_PESQUISA, PAGINAS, PERGUNTAS,
  acharParagrafo, buscar, fichasParaEntregar, problemaDaAnotacao, umaPagina, umaPergunta,
  type Avaliacao, type Caderno, type Ficha, type PerguntaId,
} from './pesquisaDoBug';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity, registrarConclusaoDeLicao,
} from '../lib/progress';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import { descartarRascunho, lerRascunho } from '../lib/rascunho';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP045 requisito 6, primeira metade — a pesquisa em sites especializados.
 *
 * Um navegador com um buscador e, ao lado, o caderno de pesquisa: o painel
 * lateral onde se marca o recorte, se avalia cada página aberta e se guardam
 * as fichas. É o arranjo que os navegadores de hoje têm — coleções, notas,
 * leitura ao lado —, e é onde uma pesquisa de verdade acontece: não se lê uma
 * página inteira e se escreve de memória; se anota com a fonte presa.
 *
 * ── O que a tela não diz ────────────────────────────────────────────────
 * Se uma página é confiável. Nem ao avaliar, nem ao fazer a ficha: dito em
 * qualquer um dos dois lugares, a avaliação vira dois botões e duas
 * tentativas. As pistas estão onde estão na vida — autor, data, lista de
 * fontes, o tom do título —, e o porquê de cada uma aparece só no fim.
 *
 * O caderno vive no navegador até a entrega, pelo mesmo motivo dos
 * laboratórios de HTML: pesquisa é trabalho de uma tarde, e recarregar sem
 * querer não pode apagá-la.
 *
 * O modelo, as páginas e as metas moram em `pesquisaDoBug.ts`.
 */

type Tela = { tipo: 'inicio' } | { tipo: 'resultados'; consulta: string } | { tipo: 'pagina'; id: string; consulta: string };
type Vista = 'navegador' | 'caderno';

export default function PesquisaWebLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [c, setC] = useState<Caderno>(CADERNO_VAZIO);
  const [recuperado, setRecuperado] = useState(false);
  const [tela, setTela] = useState<Tela>({ tipo: 'inicio' });
  const [texto, setTexto] = useState('');
  const [vista, setVista] = useState<Vista>('caderno');
  const [rascunho, setRascunho] = useState<{ paragrafoId: string; pergunta: PerguntaId | ''; anotacao: string; desmente: boolean } | null>(null);
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  /* Volta com o que ficou no navegador, e diz que voltou. */
  useEffect(() => {
    const local = lerRascunho<Caderno>(userId, lessonCode);
    if (local?.conteudo && (local.conteudo.fichas?.length || local.conteudo.recorte?.length || local.conteudo.abertas?.length)) {
      setC({ ...CADERNO_VAZIO, ...local.conteudo });
      setRecuperado(true);
    }
  }, [userId, lessonCode]);
  useRascunhoLocal(userId, lessonCode, c, !pronto);

  const tarefas = METAS_DA_PESQUISA.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos, feita: m.feita(c),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  const resultados = useMemo(() => (tela.tipo === 'inicio' ? [] : buscar(tela.consulta)), [tela]);
  const pagina = tela.tipo === 'pagina' ? umaPagina(tela.id) : undefined;

  /* ── Navegação ─────────────────────────────────────────────────────── */

  const pesquisar = (consulta: string) => {
    const q = consulta.trim();
    if (!q) return;
    setC(x => ({ ...x, buscas: [...x.buscas, q] }));
    setTela({ tipo: 'resultados', consulta: q });
    setTexto(q);
    setVista('navegador');
    setAviso('');
  };

  const abrir = (id: string) => {
    if (tela.tipo === 'inicio') return;
    setC(x => (x.abertas.includes(id) ? x : { ...x, abertas: [...x.abertas, id] }));
    setTela({ tipo: 'pagina', id, consulta: tela.consulta });
    setRascunho(null);
  };

  const voltar = () => {
    if (tela.tipo === 'pagina') setTela({ tipo: 'resultados', consulta: tela.consulta });
    else if (tela.tipo === 'resultados') setTela({ tipo: 'inicio' });
  };

  const endereco = tela.tipo === 'inicio'
    ? 'buscador.exemplo'
    : tela.tipo === 'resultados'
      ? `buscador.exemplo/busca?q=${encodeURIComponent(tela.consulta)}`
      : pagina?.endereco ?? '';

  /* ── Caderno ───────────────────────────────────────────────────────── */

  const alternarPergunta = (id: PerguntaId) =>
    setC(x => ({ ...x, recorte: x.recorte.includes(id) ? x.recorte.filter(p => p !== id) : [...x.recorte, id] }));

  const avaliar = (id: string, a: Avaliacao) => {
    setC(x => ({ ...x, avaliacoes: { ...x.avaliacoes, [id]: a } }));
    setAviso(`Avaliação guardada no caderno: ${a === 'confiavel' ? 'confiável' : 'não confiável'}.`);
  };

  const comecarFicha = (paragrafoId: string) => {
    setRascunho({ paragrafoId, pergunta: '', anotacao: '', desmente: false });
    setVista('caderno');
    if (c.recorte.length === 0) setAviso('Marque antes as perguntas do caderno: a ficha diz qual delas o trecho responde.');
  };

  const problemaDoRascunho = rascunho ? problemaDaAnotacao(rascunho) : null;

  const guardarFicha = () => {
    if (!rascunho) return;
    if (!rascunho.pergunta) { setAviso('Escolha qual pergunta este trecho responde.'); return; }
    if (problemaDoRascunho) { setAviso(problemaDoRascunho); return; }
    const nova: Ficha = {
      id: `f-${Date.now().toString(36)}`,
      paragrafoId: rascunho.paragrafoId,
      pergunta: rascunho.pergunta,
      anotacao: rascunho.anotacao.trim(),
      desmente: rascunho.desmente,
    };
    setC(x => ({ ...x, fichas: [...x.fichas, nova] }));
    setRascunho(null);
    setAviso('Ficha guardada, com a fonte presa a ela.');
  };

  const apagarFicha = (id: string) => {
    setC(x => ({ ...x, fichas: x.fichas.filter(f => f.id !== id) }));
    setAviso('Ficha apagada.');
  };

  const recomecar = () => {
    setC(CADERNO_VAZIO);
    setTela({ tipo: 'inicio' });
    setTexto(''); setRascunho(null); setAviso(''); setRecuperado(false);
    descartarRascunho(userId, lessonCode);
  };

  const registrar = async () => {
    setErro(''); setGravando(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: METAS_DA_PESQUISA.length, total_questions: METAS_DA_PESQUISA.length,
      }, specialtyCode);
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Sua pesquisa está feita, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    /* As fichas viajam no evento: é dele que o relatório, na lição seguinte,
       as lê — "lição vencida é um evento", e não tabela nova. */
    await logActivity(userId, 'pesquisa_concluida', {
      specialtyCode, lessonCode, fichas: fichasParaEntregar(c), buscas: c.buscas.length,
    });
    descartarRascunho(userId, lessonCode);
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <FileCheck2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
          <h2 className="text-xl font-bold mb-2">Pesquisa feita!</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            As suas fichas estão guardadas, cada uma com a fonte. Na próxima lição
            você escreve o relatório a partir delas.
          </p>
        </div>
        <h3 className="font-bold mt-5 mb-2">Por que cada página era ou não confiável</h3>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {PAGINAS.map(p => (
            <li key={p.id}><strong style={{ color: 'var(--color-text)' }}>{p.site}:</strong> {p.pista}</li>
          ))}
        </ul>
        <div className="text-center">
          <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-5 inline-flex">
            Voltar para a Trilha
          </Link>
        </div>
      </div>
    );
  }

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <>
          {erro && <p style={{ fontSize: 11.5, color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary text-sm w-full justify-center">
            {gravando ? 'Guardando…' : 'Entregar a pesquisa'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar a pesquisa
      </button>
    </div>
  );

  const perguntasDoRecorte = PERGUNTAS.filter(p => c.recorte.includes(p.id));

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="navegador"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
    >
      <style>{CSS_DO_NAVEGADOR}</style>
      <div className="pw-janela">
        <div className="pw-abas">
          <div className="pw-aba"><Globe className="w-3.5 h-3.5" aria-hidden />
            <span>{pagina ? pagina.titulo : tela.tipo === 'resultados' ? `${tela.consulta} — Buscador` : 'Buscador'}</span>
          </div>
        </div>
        <div className="pw-barra">
          <button type="button" className="pw-icone" aria-label="Voltar" title="Voltar" onClick={voltar} disabled={tela.tipo === 'inicio'}>
            <ArrowLeft className="w-4 h-4" aria-hidden />
          </button>
          <button type="button" className="pw-icone" aria-label="Página inicial" title="Página inicial" onClick={() => setTela({ tipo: 'inicio' })}>
            <Home className="w-4 h-4" aria-hidden />
          </button>
          <div className="pw-endereco" aria-label="Endereço">
            <Lock className="w-3.5 h-3.5" aria-hidden /> <span>{endereco}</span>
          </div>
          <button type="button" className="pw-caderno-botao" aria-pressed={vista === 'caderno'}
            onClick={() => setVista(v => (v === 'caderno' ? 'navegador' : 'caderno'))}>
            <NotebookPen className="w-4 h-4" aria-hidden /> Caderno ({c.fichas.length})
          </button>
        </div>

        <div className="pw-corpo" data-vista={vista}>
          <main className="pw-navegador">
            {tela.tipo === 'inicio' && (
              <div className="pw-inicio">
                <p className="pw-logo">Buscador</p>
                <form className="pw-busca" role="search" onSubmit={e => { e.preventDefault(); pesquisar(texto); }}>
                  <Search className="w-4 h-4" aria-hidden />
                  <input aria-label="Pesquisar" value={texto} onChange={e => setTexto(e.target.value)} placeholder="Pesquise na web" />
                  <button type="submit" className="pw-botao">Pesquisar</button>
                </form>
              </div>
            )}

            {tela.tipo === 'resultados' && (
              <div>
                <form className="pw-busca pw-busca-topo" role="search" onSubmit={e => { e.preventDefault(); pesquisar(texto); }}>
                  <Search className="w-4 h-4" aria-hidden />
                  <input aria-label="Pesquisar" value={texto} onChange={e => setTexto(e.target.value)} />
                  <button type="submit" className="pw-botao">Pesquisar</button>
                </form>
                {resultados.length === 0
                  ? <p className="pw-nada">Nenhum resultado para "{tela.consulta}". Tente palavras do assunto, como "bug do milênio" ou "problema do ano 2000".</p>
                  : <p className="pw-cont">Cerca de {resultados.length} resultados</p>}
                <ol className="pw-lista">
                  {resultados.map(p => (
                    <li key={p.id}>
                      <p className="pw-site">{p.site} · <span>{p.endereco}</span></p>
                      <button type="button" className="pw-link" onClick={() => abrir(p.id)}>{p.titulo}</button>
                      <p className="pw-resumo">{p.data ? `${p.data} — ` : ''}{p.resumo}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {pagina && (
              <article className="pw-pagina">
                <p className="pw-site">{pagina.site}</p>
                <h1 className="pw-h1">{pagina.titulo}</h1>
                <p className="pw-meta">
                  {pagina.autor ?? 'Autor não informado'} · {pagina.data ? `Publicado em ${pagina.data}` : 'Sem data'}
                </p>
                {pagina.paragrafos.map(par => (
                  <div key={par.id} className="pw-par">
                    <p>{par.texto}</p>
                    <button type="button" className="pw-fichar" onClick={() => comecarFicha(par.id)}>
                      <BookmarkPlus className="w-3.5 h-3.5" aria-hidden /> Fazer ficha
                    </button>
                  </div>
                ))}
                <h2 className="pw-h2">Fontes</h2>
                {pagina.fontes.length
                  ? <ul className="pw-fontes">{pagina.fontes.map(f => <li key={f}>{f}</li>)}</ul>
                  : <p className="pw-meta">Esta página não cita fontes.</p>}
              </article>
            )}
          </main>

          <aside className="pw-caderno" aria-label="Caderno de pesquisa">
            <div className="pw-caderno-topo">
              <strong>Caderno de pesquisa</strong>
              <button type="button" className="pw-icone pw-so-celular" aria-label="Voltar ao navegador" onClick={() => setVista('navegador')}>
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>
            {recuperado && (
              <p className="pw-recuperado">O seu caderno voltou do jeito que você deixou.</p>
            )}

            <section>
              <h3 className="pw-h3">Perguntas</h3>
              <p className="pw-dica">Antes de buscar: o que a sua pesquisa vai responder?</p>
              {PERGUNTAS.map(p => (
                <label key={p.id} className="pw-check">
                  <input type="checkbox" checked={c.recorte.includes(p.id)} onChange={() => alternarPergunta(p.id)} />
                  <span>{p.texto}</span>
                </label>
              ))}
            </section>

            {pagina && (
              <section>
                <h3 className="pw-h3">Esta página</h3>
                <p className="pw-dica">{pagina.site}. É uma fonte confiável?</p>
                <div className="pw-avaliar" role="group" aria-label="Avaliação da fonte">
                  <button type="button" className="pw-botao-sec" aria-pressed={c.avaliacoes[pagina.id] === 'confiavel'}
                    onClick={() => avaliar(pagina.id, 'confiavel')}>Confiável</button>
                  <button type="button" className="pw-botao-sec" aria-pressed={c.avaliacoes[pagina.id] === 'nao-confiavel'}
                    onClick={() => avaliar(pagina.id, 'nao-confiavel')}>Não confiável</button>
                </div>
              </section>
            )}

            {rascunho && (() => {
              const achado = acharParagrafo(rascunho.paragrafoId);
              return (
                <section className="pw-ficha-nova" aria-label="Nova ficha">
                  <h3 className="pw-h3">Nova ficha</h3>
                  <blockquote className="pw-trecho">{achado?.paragrafo.texto}</blockquote>
                  <p className="pw-dica">Fonte: {achado?.pagina.site}</p>
                  <label className="pw-campo">
                    Qual pergunta este trecho responde?
                    <select value={rascunho.pergunta} onChange={e => setRascunho({ ...rascunho, pergunta: e.target.value as PerguntaId | '' })}>
                      <option value="">Escolha…</option>
                      {perguntasDoRecorte.map(p => <option key={p.id} value={p.id}>{p.texto}</option>)}
                    </select>
                  </label>
                  <label className="pw-campo">
                    Com as suas palavras
                    <textarea rows={3} value={rascunho.anotacao}
                      onChange={e => setRascunho({ ...rascunho, anotacao: e.target.value })} />
                  </label>
                  {rascunho.anotacao.trim() && problemaDoRascunho && <p className="pw-problema">{problemaDoRascunho}</p>}
                  <label className="pw-check">
                    <input type="checkbox" checked={rascunho.desmente} onChange={e => setRascunho({ ...rascunho, desmente: e.target.checked })} />
                    <span>Esta ficha desmente o que outra página afirmou</span>
                  </label>
                  <div className="pw-avaliar">
                    <button type="button" className="pw-botao" onClick={guardarFicha}>Guardar ficha</button>
                    <button type="button" className="pw-botao-sec" onClick={() => setRascunho(null)}>Cancelar</button>
                  </div>
                </section>
              );
            })()}

            <section>
              <h3 className="pw-h3">Fichas ({c.fichas.length})</h3>
              {c.fichas.length === 0 && <p className="pw-dica">Nenhuma ficha ainda. Abra uma página e use "Fazer ficha" ao lado de um trecho.</p>}
              <ul className="pw-fichas">
                {c.fichas.map(f => {
                  const achado = acharParagrafo(f.paragrafoId);
                  return (
                    <li key={f.id} className="pw-ficha">
                      <p className="pw-ficha-pergunta">{umaPergunta(f.pergunta).texto}{f.desmente ? ' · desmente' : ''}</p>
                      <p>{f.anotacao}</p>
                      <p className="pw-dica">Fonte: {achado?.pagina.site ?? '—'}</p>
                      <button type="button" className="pw-icone" aria-label={`Apagar a ficha "${f.anotacao.slice(0, 30)}"`} onClick={() => apagarFicha(f.id)}>
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <h3 className="pw-h3">Páginas avaliadas ({Object.keys(c.avaliacoes).length} de {PAGINAS.length})</h3>
              <ul className="pw-avaliadas">
                {PAGINAS.filter(p => c.avaliacoes[p.id]).map(p => (
                  <li key={p.id}>{p.site}: {c.avaliacoes[p.id] === 'confiavel' ? 'confiável' : 'não confiável'}</li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}

const CSS_DO_NAVEGADOR = `
.pw-janela {
  background: #F1F3F4; color: #202124; flex: 1; min-height: 0;
  display: flex; flex-direction: column;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif; font-size: 14px;
}
.pw-abas { display: flex; padding: 6px 8px 0; background: #DEE1E6; }
.pw-aba {
  display: flex; align-items: center; gap: 6px; max-width: 280px; padding: 6px 12px;
  background: #FFFFFF; color: #202124; border-radius: 8px 8px 0 0; font-size: 12.5px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pw-aba span { overflow: hidden; text-overflow: ellipsis; }
.pw-barra { display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: #FFFFFF; border-bottom: 1px solid #DADCE0; }
.pw-icone {
  display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px;
  background: none; border: none; border-radius: 50%; color: #3C4043; cursor: pointer;
}
.pw-icone:hover { background: #F1F3F4; }
.pw-icone:disabled { color: #9AA0A6; cursor: default; background: none; }
.pw-endereco {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; padding: 6px 12px;
  background: #F1F3F4; border-radius: 999px; color: #202124; font-size: 13px;
  white-space: nowrap; overflow: hidden;
}
.pw-endereco span { overflow: hidden; text-overflow: ellipsis; }
.pw-caderno-botao {
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; white-space: nowrap;
  background: #FFFFFF; color: #202124; border: 1px solid #DADCE0; border-radius: 999px; cursor: pointer;
}
.pw-caderno-botao[aria-pressed="true"] { background: #E8F0FE; border-color: #1A73E8; color: #174EA6; }
.pw-corpo { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) 320px; }
.pw-navegador { overflow-y: auto; background: #FFFFFF; color: #202124; padding: 16px 20px 96px; }
.pw-caderno {
  overflow-y: auto; background: #F8F9FA; color: #202124; border-left: 1px solid #DADCE0;
  padding: 12px 12px 96px; display: flex; flex-direction: column; gap: 14px;
}
.pw-caderno-topo { display: flex; justify-content: space-between; align-items: center; }
.pw-so-celular { display: none; }
.pw-inicio { display: flex; flex-direction: column; align-items: center; gap: 18px; padding-top: 12vh; }
.pw-logo { font-size: 34px; font-weight: 700; color: #1A73E8; letter-spacing: -.02em; }
.pw-busca {
  display: flex; align-items: center; gap: 8px; width: min(560px, 100%); padding: 6px 6px 6px 14px;
  border: 1px solid #DADCE0; border-radius: 999px; background: #FFFFFF; color: #5F6368;
}
.pw-busca input { flex: 1; min-width: 0; border: none; outline: none; background: none; color: #202124; font-size: 15px; }
.pw-busca-topo { margin-bottom: 12px; }
.pw-botao {
  padding: 7px 14px; background: #1A73E8; color: #FFFFFF; border: none; border-radius: 999px; cursor: pointer; font-weight: 500;
}
.pw-botao:hover { background: #1765CC; }
.pw-botao-sec {
  padding: 6px 12px; background: #FFFFFF; color: #202124; border: 1px solid #DADCE0; border-radius: 999px; cursor: pointer;
}
.pw-botao-sec[aria-pressed="true"] { background: #E8F0FE; border-color: #1A73E8; color: #174EA6; font-weight: 600; }
.pw-cont, .pw-nada { color: #5F6368; font-size: 13px; margin-bottom: 10px; }
.pw-lista { display: flex; flex-direction: column; gap: 18px; max-width: 640px; }
.pw-site { color: #202124; font-size: 12.5px; }
.pw-site span { color: #4D5156; }
.pw-link {
  background: none; border: none; padding: 0; text-align: left; cursor: pointer;
  color: #1A0DAB; font-size: 18px; line-height: 1.3;
}
.pw-link:hover { text-decoration: underline; }
.pw-resumo { color: #4D5156; font-size: 13.5px; }
.pw-pagina { max-width: 680px; color: #202124; line-height: 1.6; }
.pw-h1 { font-size: 24px; font-weight: 700; color: #202124; line-height: 1.25; margin: 4px 0; }
.pw-h2 { font-size: 16px; font-weight: 700; color: #202124; margin-top: 18px; }
.pw-h3 { font-size: 13px; font-weight: 700; color: #202124; margin-bottom: 4px; }
.pw-meta { color: #5F6368; font-size: 13px; margin-bottom: 12px; }
.pw-par { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; margin-bottom: 12px; }
.pw-fichar {
  display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; font-size: 12px;
  background: #FFFFFF; color: #174EA6; border: 1px solid #D2E3FC; border-radius: 999px; cursor: pointer;
}
.pw-fichar:hover { background: #E8F0FE; }
.pw-fontes { list-style: disc; padding-left: 20px; color: #3C4043; font-size: 13.5px; }
.pw-dica { color: #5F6368; font-size: 12.5px; }
.pw-recuperado { background: #E6F4EA; color: #0D652D; padding: 6px 8px; border-radius: 6px; font-size: 12.5px; }
.pw-check { display: flex; align-items: flex-start; gap: 8px; padding: 3px 0; color: #202124; cursor: pointer; }
.pw-check input { margin-top: 3px; }
.pw-avaliar { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.pw-ficha-nova { background: #FFFFFF; border: 1px solid #1A73E8; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.pw-trecho { border-left: 3px solid #DADCE0; padding-left: 8px; color: #3C4043; font-size: 13px; }
.pw-campo { display: flex; flex-direction: column; gap: 4px; font-size: 12.5px; color: #3C4043; }
.pw-campo select, .pw-campo textarea {
  padding: 6px 8px; border: 1px solid #DADCE0; border-radius: 6px; background: #FFFFFF; color: #202124; font: inherit;
}
.pw-problema { color: #B3261E; font-size: 12.5px; }
.pw-fichas { display: flex; flex-direction: column; gap: 8px; }
.pw-ficha { position: relative; background: #FFFFFF; border: 1px solid #DADCE0; border-radius: 8px; padding: 8px 36px 8px 10px; font-size: 13px; }
.pw-ficha .pw-icone { position: absolute; top: 4px; right: 4px; }
.pw-ficha-pergunta { font-weight: 600; font-size: 12px; color: #174EA6; }
.pw-avaliadas { font-size: 12.5px; color: #3C4043; list-style: disc; padding-left: 18px; }
@media (max-width: 767px) {
  .pw-corpo { grid-template-columns: minmax(0, 1fr); }
  .pw-corpo[data-vista="caderno"] .pw-navegador { display: none; }
  .pw-corpo[data-vista="navegador"] .pw-caderno { display: none; }
  .pw-caderno { border-left: none; }
  .pw-so-celular { display: inline-flex; }
  .pw-aba { max-width: 100%; }
}
`;
