import { useMemo, useState } from 'react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_NAVEGADOR, CascaDoNavegador, FichaTecnicaDaPagina, ResultadoDaBusca,
} from './navegador';
import {
  ETAPAS, FICHAS_INICIAIS, PAGINAS, VERIFICACOES, buscar, descartar, guardar,
  paginaPorId, quantasFeitas, tudoFeito,
  type Ficha, type Pagina,
} from './pesquisaDoMilenio';
import {
  logActivity, upsertRequirementProgress, ensureEnrollment,
  updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import { Trash2 } from 'lucide-react';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * A pesquisa do bug do milênio — requisito 6 da AP045, primeira metade.
 *
 * ── Por que ela ocupa a tela ─────────────────────────────────────────────
 * Porque imita um programa, e é a regra da casa: quando um laboratório imita um
 * programa, ele não é um cartão dentro da página — ocupa a tela e a plataforma
 * sai de cena, devolvendo por cima o que é dela (tarefas, progresso, o caminho
 * de volta).
 *
 * ── As fichas ficam na bolha da plataforma ───────────────────────────────
 * Elas não são do navegador: o navegador não guarda ficha de pesquisa nenhuma.
 * São da lição, e por isso moram no painel, ao lado da lista de tarefas — é a
 * mesma divisão da régua de status do Word, que conta o que está na pasta e não
 * escreve veredito.
 *
 * ── E o que sai daqui vai para a lição seguinte ──────────────────────────
 * As fichas viajam na metadata do evento `pesquisa_concluida`, e é o relatório
 * do módulo seguinte quem as lê. Sem tabela nova: é a decisão de "lição vencida
 * é um evento", a mesma pela qual o progresso da vereda sai dos eventos que já
 * existem. Guardá-las no navegador seria guardá-las em lugar nenhum — o
 * computador do clube costuma ser de todo mundo.
 */

type Aba = 'busca' | 'pagina';

export default function PesquisaWebLab({
  specialtyCode, lessonCode, lessonTitle, requirementCodes, userId,
}: Props) {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState<Pagina[]>([]);
  const [aberta, setAberta] = useState<Pagina | null>(null);
  const [aba, setAba] = useState<Aba>('busca');
  const [fichas, setFichas] = useState<Ficha[]>(FICHAS_INICIAIS);
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const feitas = quantasFeitas(fichas);
  const pronto = tudoFeito(fichas);

  const tarefas = useMemo(() => VERIFICACOES.map(v => ({
    id: v.id,
    titulo: v.rotulo,
    feita: v.feita(fichas),
    passos: [v.dica],
  })), [fichas]);

  const pesquisar = (t: string) => {
    setTermo(t);
    setResultados(buscar(t));
    setAviso('');
  };

  const abrir = (p: Pagina) => {
    setAberta(p);
    setAba('pagina');
    setAviso('');
  };

  const guardada = (fato: string, pagina: string) =>
    fichas.some(f => f.fato === fato && f.pagina === pagina);

  const alternarFicha = (p: Pagina, fato: string, etapa: Ficha['etapa']) => {
    if (guardada(fato, p.id)) {
      setFichas(fs => descartar(fs, fato, p.id));
      setAviso('Ficha descartada.');
      return;
    }
    setFichas(fs => guardar(fs, { fato, etapa, pagina: p.id }));
    setAviso('Ficha guardada, com a página de onde ela saiu.');
  };

  const concluir = async () => {
    setSalvando(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: feitas, total_questions: VERIFICACOES.length,
      }, specialtyCode);
    }
    /* As fichas vão junto: é delas que o relatório da lição seguinte é escrito,
       e este evento é onde elas cabem sem tabela nova. */
    await logActivity(userId, 'pesquisa_concluida', {
      specialtyCode, lessonCode,
      fichas: fichas.map(f => ({ fato: f.fato, etapa: f.etapa, pagina: f.pagina })),
    });
    setConcluido(true);
  };

  const abas = [
    { id: 'busca', titulo: 'Pesquisa' },
    ...(aberta ? [{ id: 'pagina', titulo: aberta.titulo }] : []),
  ];

  return (
    <>
      <style>{CSS_NAVEGADOR}</style>
      <LaboratorioEmTelaCheia
        trilha={specialtyCode}
        voltarPara={`/especialidade/${specialtyCode}`}
        titulo={lessonTitle}
        programa="navegador"
        tarefas={tarefas}
        aviso={aviso}
        acoes={
          /* Os botões vêm **antes** das fichas, e é uma correção medida no
             navegador: a lista cresce a cada ficha, e com quinze delas
             "Entregar a pesquisa" saía pelo pé da bolha no celular — o botão
             que fecha a lição, fora da tela, sem nada dizendo que ele existia.
             É a irmã da tira de miniaturas da CC-ES004, que cortava a marca de
             "imagem" por ter teto de altura. */
          <>
            <button
              type="button" className="btn-primary w-full"
              disabled={!pronto || salvando || concluido}
              onClick={() => void concluir()}
            >
              {concluido ? 'Pesquisa entregue' : salvando ? 'Gravando…' : 'Entregar a pesquisa'}
            </button>
            <button
              type="button" className="btn-secondary w-full mt-2 mb-3"
              onClick={() => { setFichas(FICHAS_INICIAIS); setAviso('Fichas apagadas.'); }}
            >
              Recomeçar
            </button>
            <PainelDeFichas fichas={fichas} aoDescartar={(fato, pagina) => setFichas(fs => descartar(fs, fato, pagina))} />
          </>
        }
      >
        <div className="nv-janela">
          <CascaDoNavegador
            abas={abas}
            atual={aba}
            endereco={aba === 'pagina' && aberta ? aberta.url : 'buscador.com.br/busca'}
            aoTrocarAba={id => setAba(id as Aba)}
            aoVoltar={() => setAba('busca')}
            podeVoltar={aba === 'pagina'}
            busca={aba === 'busca' ? termo : undefined}
            aoBuscar={aba === 'busca' ? pesquisar : undefined}
          />

          <div className="nv-pagina">
            {aba === 'busca'
              ? (
                termo.trim() === ''
                  ? (
                    <p style={{ color: '#5F6368' }}>
                      Escreva o que você quer descobrir na barra de pesquisa acima.
                    </p>
                  )
                  : resultados.length === 0
                    ? <p style={{ color: '#5F6368' }}>Nenhuma página encontrada para “{termo}”.</p>
                    : (
                      <>
                        <p style={{ color: '#5F6368', fontSize: 12.5, marginBottom: 18 }}>
                          {resultados.length} resultados
                        </p>
                        {resultados.map(p => (
                          <ResultadoDaBusca
                            key={p.id} url={p.url} titulo={p.titulo} resumo={p.resumo}
                            aoAbrir={() => abrir(p)}
                          />
                        ))}
                      </>
                    )
              )
              : aberta && (
                <>
                  <div className="nv-cabecalho">
                    <h1 className="nv-titulo-pagina">{aberta.titulo}</h1>
                    <FichaTecnicaDaPagina
                      autor={aberta.autor} publicado={aberta.publicado} referencias={aberta.referencias}
                    />
                  </div>
                  <p style={{ marginBottom: 18 }}>{aberta.abertura}</p>
                  <p style={{ fontSize: 12.5, color: '#5F6368', marginBottom: 10 }}>
                    Clique numa frase para guardá-la como ficha. A página de onde ela saiu vai junto.
                  </p>
                  {aberta.frases.map(f => {
                    const marcada = guardada(f.texto, aberta.id);
                    return (
                      <button
                        key={f.texto} type="button" className="nv-frase"
                        aria-pressed={marcada}
                        onClick={() => alternarFicha(aberta, f.texto, f.etapa)}
                      >
                        {f.texto}
                        {marcada && (
                          <span className="nv-frase-marca">
                            Guardada em “{ETAPAS.find(e => e.id === f.etapa)?.titulo}”
                          </span>
                        )}
                      </button>
                    );
                  })}
                </>
              )}
          </div>
        </div>
      </LaboratorioEmTelaCheia>
    </>
  );
}

/**
 * As fichas guardadas, por etapa.
 *
 * Elas ficam no painel da plataforma, e não numa gaveta do navegador: o
 * navegador não guarda ficha de pesquisa nenhuma, e desenhá-las lá dentro
 * poria coisa da plataforma dentro do programa imitado.
 */
function PainelDeFichas({ fichas, aoDescartar }: {
  fichas: Ficha[];
  aoDescartar: (fato: string, pagina: string) => void;
}) {
  return (
    <details style={{ marginBottom: 12 }}>
      <summary style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, cursor: 'pointer' }}>
        Fichas ({fichas.length})
      </summary>
      {/* A lista rola dentro de si, e é por isso que ela tem teto.

          Ela cresce a cada ficha, e o espaço das ações é o pé do painel: com
          oito fichas ela empurrava "Entregar a pesquisa" para fora da bolha no
          celular — o botão que fecha a lição, inalcançável, sem nada dizendo
          que ele existia. Quem viu foi o Chromium a 390px; no jsdom não há
          altura nenhuma para estourar, então o que se testa é o teto. */}
      <div style={{ maxHeight: '38vh', overflowY: 'auto', marginBottom: 8 }}>
      {fichas.length === 0
        ? <p style={{ fontSize: 12.5, opacity: 0.75 }}>Nenhuma ficha ainda.</p>
        : ETAPAS.map(e => {
          const daEtapa = fichas.filter(f => f.etapa === e.id);
          if (daEtapa.length === 0) return null;
          return (
            <div key={e.id} style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '.04em', opacity: 0.7 }}>
                {e.titulo}
              </p>
              {daEtapa.map(f => (
                <div key={f.fato} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 12.5, marginTop: 4 }}>
                  <span style={{ flex: 1 }}>
                    {f.fato.length > 90 ? `${f.fato.slice(0, 90)}…` : f.fato}
                    {/* A fonte aparece com a ficha, sempre: uma ficha sem a
                        página de onde saiu é um fato sem onde voltar. */}
                    <em style={{ display: 'block', opacity: 0.7, fontStyle: 'normal', fontSize: 11.5 }}>
                      {paginaPorId(f.pagina)?.url}
                    </em>
                  </span>
                  <button
                    type="button" className="btn-ghost"
                    style={{ padding: 2 }}
                    aria-label={`Descartar a ficha de ${paginaPorId(f.pagina)?.url}`}
                    onClick={() => aoDescartar(f.fato, f.pagina)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      {/* As páginas que sobraram sem ficha nenhuma não se listam aqui: o painel
          conta o que foi guardado, e não o que falta. Quem diz o que falta é a
          lista de tarefas, que é o lugar dela. */}
      </div>
      <p style={{ fontSize: 11.5, opacity: 0.7 }}>
        {PAGINAS.length} páginas no buscador.
      </p>
    </details>
  );
}
