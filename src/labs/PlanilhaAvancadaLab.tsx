import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Filter, Snowflake, ChartLine, ChartPie, ChartColumn, ChartScatter,
  Sigma, ArrowDownAZ, ArrowUpZA, Eraser, Copy, ClipboardPaste, Scissors,
  FileCheck2, RotateCcw, Undo2, Redo2, Check, ChevronDown, Rows3, Percent,
} from 'lucide-react';
import { IconeNegrito } from './office';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_EXCEL, BarraDeTituloDoExcel, GuiasDoExcel, GrupoDoExcel, BotaoDoExcel, AbasDoExcel,
  BarraDeFormulas, GradeDoExcel, DesenhoDoGrafico, BarraDeStatusDoExcel,
} from './excel';
import { useGradeDoExcel } from './gradeDoExcel';
import { regiaoAtual } from './teclasDaPlanilha';
import {
  type Caderno, type Planilha, type TipoDeGrafico, type Historico, type Formato,
  planilhaAtiva, trocarAtiva, historicoDe, registrar as registrarPasso, desfazer, refazer,
  nomeDaCelula, nomeDaFaixa, normalizar, umaCelulaSo, ordenar, pontosDoGrafico,
} from './planilha';
import {
  METAS_DO_ACAMPAMENTO, INSCRITOS, ABA_DOS_INSCRITOS,
  acampamentoInicial, inscritosVisiveis,
} from './planilhaDoAcampamento';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP044 requisito 8 — filtros, congelar e gráfico, no mesmo Excel da AP043.
 *
 * ── Por que outro laboratório de planilha ────────────────────────────────
 * O da AP043 **monta** a planilha: escrever, alargar coluna, mesclar, somar.
 * Este parte de uma planilha pronta, com cento e vinte inscritos, e ensina a
 * parar de olhar linha por linha. Estender aquele mudaria o que a trilha
 * anterior avalia como concluído.
 *
 * ── E é a mesma grade ────────────────────────────────────────────────────
 * Ele desenhava uma tabela HTML própria, com o total num painel ao lado e a
 * fórmula num botão: setas, F2, Enter e a barra de fórmulas — tudo o que a
 * AP043 acabara de ensinar — não existiam aqui. Hoje a planilha é uma
 * `Planilha` na `GradeDoExcel`, e o gancho é o mesmo dos outros seis
 * laboratórios de planilha, o que põe este na mesa de `gradeDoExcel.test.tsx`.
 *
 * ── Os dois números ──────────────────────────────────────────────────────
 * A célula D123 é a `SOMA`; a barra de status soma a seleção pulando o que o
 * filtro escondeu — como o Excel de verdade faz. Com filtro aplicado eles não
 * batem, e é aí que a lição acontece. O programa não escreve aviso nenhum
 * sobre isso: a régua de status relata, e quem compara é o desbravador.
 */

const GUIAS_USAVEIS = ['Página Inicial', 'Inserir', 'Dados', 'Exibir'] as const;
const DESIGN_DO_GRAFICO = 'Design do Gráfico';

const NOME_DO_GRAFICO: Record<TipoDeGrafico, string> = {
  colunas: 'Colunas',
  linha: 'Linhas',
  pizza: 'Pizza',
  dispersao: 'Dispersão',
};

const ICONE_DO_GRAFICO: Record<TipoDeGrafico, typeof ChartLine> = {
  colunas: ChartColumn,
  linha: ChartLine,
  pizza: ChartPie,
  dispersao: ChartScatter,
};

/* O programa explica o que cada tipo responde ao inseri-lo, em vez de só
   deixar a tarefa vermelha: vermelho sem explicação mede paciência. */
const O_QUE_O_GRAFICO_RESPONDE: Record<TipoDeGrafico, string> = {
  linha: 'Gráfico de linhas: o eixo tem ordem no tempo, e a linha entre dois pontos diz "daqui foi para ali".',
  pizza: 'Pizza responde composição — quanto cada parte representa do todo. Ela não mostra que março veio depois de fevereiro.',
  colunas: 'Colunas comparam quantidades. Comparam bem — mas não mostram a subida entre um mês e o seguinte.',
  dispersao: 'Dispersão relaciona duas medidas, e não uma série no tempo.',
};

type Menu = 'classificar' | 'congelar' | 'elemento' | 'tipo' | null;

export default function PlanilhaAvancadaLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [hist, setHist] = useState<Historico<Caderno>>(() => historicoDe(acampamentoInicial()));
  const cad = hist.presente;
  const p = planilhaAtiva(cad);

  const [guia, setGuia] = useState<string>('Página Inicial');
  const [menu, setMenu] = useState<Menu>(null);
  const [filtroAberto, setFiltroAberto] = useState<{ coluna: number; x: number; y: number } | null>(null);
  const [graficoEscolhido, setGraficoEscolhido] = useState(false);
  /* Os títulos dos eixos aparecem quando alguém os acrescenta, como no Excel:
     o gráfico inserido não traz nenhum. */
  const [eixosNaTela, setEixosNaTela] = useState(false);
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  const avisar = (texto: string) => { setMenu(null); setAviso(texto); };
  const naoFazParte = (n: string) =>
    avisar(`${n} existe no Excel de verdade, e está aqui para a faixa ficar igual — mas não faz parte deste exercício.`);

  const mudar = (f: (q: Planilha) => Planilha) =>
    setHist(h => registrarPasso(h, trocarAtiva(h.presente, f(planilhaAtiva(h.presente)))));

  const g = useGradeDoExcel({
    planilha: p,
    mudar,
    desfazer: () => setHist(desfazer),
    refazer: () => setHist(refazer),
    avisar,
  });
  const { faixa, setFaixa, sel, setBarra, setEditando } = g;

  const tarefas = METAS_DO_ACAMPAMENTO.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde,
    passos: m.passos, feita: m.feita(cad),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  /* ── Os comandos ───────────────────────────────────────────────────────── */

  const naFaixa = (f: (cel: Planilha['celulas'][0][0]) => Planilha['celulas'][0][0]) => {
    const n = normalizar(faixa);
    mudar(q => ({
      ...q,
      celulas: q.celulas.map((linha, l) => linha.map((cel, c) => (
        l >= n.topo && l <= n.base && c >= n.esq && c <= n.dir ? f(cel) : cel))),
    }));
  };
  const negritar = () => {
    const alvo = !p.celulas[sel.l][sel.c].negrito;
    naFaixa(cel => ({ ...cel, negrito: alvo }));
  };
  const formatar = (formato: Formato) => naFaixa(cel => ({ ...cel, formato }));

  /* A AutoSoma soma o que está acima até a primeira célula vazia, como a do
     Excel — é a mesma conta da CC-ES003. */
  const autoSoma = () => {
    let topo = sel.l - 1;
    while (topo >= 0 && (p.celulas[topo][sel.c]?.texto ?? '').trim() !== '') topo--;
    topo++;
    if (topo >= sel.l) { avisar('Não há números logo acima desta célula para somar.'); return; }
    setBarra(`=SOMA(${nomeDaCelula(topo, sel.c)}:${nomeDaCelula(sel.l - 1, sel.c)})`);
    setEditando('celula');
  };

  const ligarFiltro = () => {
    setMenu(null);
    if (!p.tabela) { avisar('Esta aba não tem uma tabela para filtrar.'); return; }
    mudar(q => ({ ...q, filtro: q.filtro ? null : { coluna: normalizar(q.tabela!).esq, valor: '' } }));
  };
  const limparFiltro = () => {
    setMenu(null);
    if (!p.filtro) return;
    mudar(q => ({ ...q, filtro: q.filtro ? { ...q.filtro, valor: '' } : null }));
  };
  const classificar = (crescente: boolean) => {
    setMenu(null);
    if (!p.tabela) { avisar('Esta aba não tem uma tabela para classificar.'); return; }
    mudar(q => ordenar(q, sel.c, crescente));
  };

  const congelar = (linhas: number) => {
    setMenu(null);
    mudar(q => ({ ...q, congeladas: linhas }));
    if (linhas === 0 && sel.l === 0) {
      avisar('Congelar Painéis prende o que está acima da célula escolhida — na linha 1 não há nada acima.');
    }
  };

  const valoresDaColuna = (coluna: number): string[] => {
    if (!p.tabela) return [];
    const n = normalizar(p.tabela);
    const vistos = new Set<string>();
    for (let l = n.topo + 1; l <= n.base; l++) {
      const t = (p.celulas[l]?.[coluna]?.texto ?? '').trim();
      if (t !== '') vistos.add(t);
    }
    return [...vistos].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  };

  /*
    Inserir o gráfico lê a seleção; com uma célula só, a região em volta dela.

    É o que o Excel faz: clicar dentro da tabela e mandar inserir pega a tabela
    inteira. Exigir a faixa arrastada ensinaria um gesto a mais que o programa
    não pede.
  */
  const inserirGrafico = (tipo: TipoDeGrafico) => {
    const origem = umaCelulaSo(faixa) ? regiaoAtual(p, sel.l, sel.c) : faixa;
    const n = normalizar(origem);
    if (n.topo === n.base && n.esq === n.dir) {
      avisar('Selecione os dados do gráfico antes de inserir.');
      return;
    }
    mudar(q => ({
      ...q,
      grafico: { tipo, titulo: q.grafico?.titulo ?? '', eixoX: q.grafico?.eixoX ?? '', eixoY: q.grafico?.eixoY ?? '', faixa: origem },
    }));
    setGraficoEscolhido(true);
    setGuia(DESIGN_DO_GRAFICO);
    avisar(O_QUE_O_GRAFICO_RESPONDE[tipo]);
  };

  const trocarTipo = (tipo: TipoDeGrafico) => {
    if (!p.grafico) return;
    mudar(q => ({ ...q, grafico: q.grafico ? { ...q.grafico, tipo } : null }));
    avisar(O_QUE_O_GRAFICO_RESPONDE[tipo]);
  };

  const escreverNoGrafico = (campo: 'titulo' | 'eixoX' | 'eixoY', valor: string) =>
    mudar(q => ({ ...q, grafico: q.grafico ? { ...q.grafico, [campo]: valor } : null }));

  const excluirGrafico = () => {
    mudar(q => ({ ...q, grafico: null }));
    setGraficoEscolhido(false);
    setEixosNaTela(false);
    setGuia('Inserir');
  };

  const trocarAba = (i: number) => {
    setHist(h => ({ ...h, presente: { ...h.presente, ativa: i } }));
    setFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 });
    setEditando(null);
    setGraficoEscolhido(false);
    if (guia === DESIGN_DO_GRAFICO) setGuia('Inserir');
    /* A aba nova abre no começo dela: herdar a rolagem da lista de cento e
       vinte deixaria a de seis meses com o cabeçalho fora da tela. */
    const caixa = g.gradeRef.current;
    if (caixa) { caixa.scrollTop = 0; caixa.scrollLeft = 0; }
  };

  const recomecar = () => {
    setHist(historicoDe(acampamentoInicial()));
    setGuia('Página Inicial');
    setGraficoEscolhido(false);
    setEixosNaTela(false);
    setMenu(null);
    setAviso('');
  };

  const registrar = async () => {
    setErro('');
    setGravando(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) {
      await ensureEnrollment(userId, specId);
      await updateEnrollmentActivity(userId, specId);
    }
    await registrarConclusaoDeLicao(userId, lessonCode);
    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: METAS_DO_ACAMPAMENTO.length, total_questions: METAS_DO_ACAMPAMENTO.length,
      }, specialtyCode);
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você fez tudo, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'planilha_avancada_concluida', { specialtyCode, lessonCode, metas: METAS_DO_ACAMPAMENTO.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Planilha entregue!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Filtro em vez do olho, cabeçalho preso em vez de rolar de volta,
          gráfico em vez de ler números — e um total que respeita o que está à
          vista. Da próxima vez que um número não bater com a tela, você já sabe
          onde olhar.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <>
          {erro && <p style={{ fontSize: 11.5, color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary text-sm w-full justify-center">
            {gravando ? 'Guardando…' : 'Entregar a planilha'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar a planilha
      </button>
      <p style={{ fontSize: 11, opacity: 0.75 }}>
        As setas andam, Shift+setas estendem, Ctrl+setas pulam até a borda dos dados,
        F2 edita e Enter grava. Fórmula começa por <strong>=</strong>.
      </p>
    </div>
  );

  const ItemDoMenu = ({ aoClicar, ativo, children }: {
    aoClicar: () => void; ativo?: boolean; children: React.ReactNode;
  }) => (
    <button type="button" role="menuitem" onClick={aoClicar} className="pl-menu-item">
      <span className="pl-menu-rotulo">
        {ativo ? <Check className="w-3 h-3" /> : <span style={{ width: 12 }} />}
        {children}
      </span>
    </button>
  );

  const visiveis = inscritosVisiveis(cad);
  const filtrando = cad.ativa === ABA_DOS_INSCRITOS && !!p.filtro?.valor;

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="excel"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={28}
    >
      <style>{CSS_EXCEL}</style>

      {/* Clicar fora do gráfico o desescolhe, e a guia contextual some junto —
          é o que o Excel faz com Design do Gráfico. */}
      <div className="pl-janela" onPointerDownCapture={ev => {
        const alvo = ev.target as HTMLElement;
        if (graficoEscolhido && !alvo.closest('.pl-grafico, .pl-faixa, .pl-guias')) setGraficoEscolhido(false);
      }}>
        <BarraDeTituloDoExcel arquivo="inscritos-do-acampamento" aoAvisar={avisar} />
        <GuiasDoExcel atual={guia} usaveis={GUIAS_USAVEIS}
          contextuais={p.grafico && graficoEscolhido ? [{ id: DESIGN_DO_GRAFICO, nome: DESIGN_DO_GRAFICO }] : []}
          aoTrocar={x => { setGuia(x); setMenu(null); }} aoAvisar={avisar} />

        <div className="pl-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
          {guia === 'Página Inicial' && (
            <>
              <GrupoDoExcel nome="Desfazer">
                <BotaoDoExcel dica="Desfazer (Ctrl+Z)" aoClicar={g.desfazer}><Undo2 className="w-4 h-4" /></BotaoDoExcel>
                <BotaoDoExcel dica="Refazer (Ctrl+Y)" aoClicar={g.refazer}><Redo2 className="w-4 h-4" /></BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Área de Transferência">
                <BotaoDoExcel dica="Colar (Ctrl+V)" aoClicar={g.colar}><ClipboardPaste className="w-4 h-4" /></BotaoDoExcel>
                <BotaoDoExcel dica="Recortar (Ctrl+X)" aoClicar={g.recortar}><Scissors className="w-4 h-4" /></BotaoDoExcel>
                <BotaoDoExcel dica="Copiar (Ctrl+C)" aoClicar={g.copiar}><Copy className="w-4 h-4" /></BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Fonte">
                <BotaoDoExcel dica="Negrito (Ctrl+N)" ativo={p.celulas[sel.l]?.[sel.c]?.negrito} aoClicar={negritar}>
                  <IconeNegrito />
                </BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Número">
                <BotaoDoExcel dica="Formato de Moeda" aoClicar={() => formatar('moeda')}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>R$</span>
                </BotaoDoExcel>
                <BotaoDoExcel dica="Estilo de Porcentagem" aoClicar={() => formatar('porcentagem')}>
                  <Percent className="w-4 h-4" />
                </BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Edição">
                <BotaoDoExcel dica="AutoSoma" aoClicar={autoSoma}><Sigma className="w-4 h-4" /></BotaoDoExcel>
                <div style={{ position: 'relative' }}>
                  <BotaoDoExcel dica="Classificar e Filtrar" ativo={!!p.filtro}
                    aoClicar={() => setMenu(m => (m === 'classificar' ? null : 'classificar'))}>
                    <span className="inline-flex items-center"><ArrowDownAZ className="w-4 h-4" /><ChevronDown className="w-3 h-3" /></span>
                  </BotaoDoExcel>
                  {menu === 'classificar' && (
                    <div className="pl-menu" role="menu">
                      <ItemDoMenu aoClicar={() => classificar(true)}>Classificar de A a Z</ItemDoMenu>
                      <ItemDoMenu aoClicar={() => classificar(false)}>Classificar de Z a A</ItemDoMenu>
                      <div className="pl-menu-risco" />
                      <ItemDoMenu ativo={!!p.filtro} aoClicar={ligarFiltro}>Filtro</ItemDoMenu>
                      <ItemDoMenu aoClicar={limparFiltro}>Limpar</ItemDoMenu>
                    </div>
                  )}
                </div>
                <BotaoDoExcel dica="Limpar Conteúdo (Del)" aoClicar={g.limparConteudo}><Eraser className="w-4 h-4" /></BotaoDoExcel>
              </GrupoDoExcel>
            </>
          )}

          {guia === 'Inserir' && (
            <GrupoDoExcel nome="Gráficos">
              {(Object.keys(NOME_DO_GRAFICO) as TipoDeGrafico[]).map(t => {
                const Icone = ICONE_DO_GRAFICO[t];
                return (
                  <BotaoDoExcel key={t} dica={`Inserir Gráfico de ${NOME_DO_GRAFICO[t]}`}
                    ativo={p.grafico?.tipo === t} aoClicar={() => inserirGrafico(t)}>
                    <span className="flex flex-col items-center">
                      <Icone className="w-5 h-5" />
                      <span style={{ fontSize: 9 }}>{NOME_DO_GRAFICO[t]}</span>
                    </span>
                  </BotaoDoExcel>
                );
              })}
            </GrupoDoExcel>
          )}

          {guia === 'Dados' && (
            <GrupoDoExcel nome="Classificar e Filtrar">
              <BotaoDoExcel dica="Classificar de A a Z" aoClicar={() => classificar(true)}><ArrowDownAZ className="w-4 h-4" /></BotaoDoExcel>
              <BotaoDoExcel dica="Classificar de Z a A" aoClicar={() => classificar(false)}><ArrowUpZA className="w-4 h-4" /></BotaoDoExcel>
              <BotaoDoExcel dica="Filtro" ativo={!!p.filtro} aoClicar={ligarFiltro}>
                <span className="flex flex-col items-center"><Filter className="w-5 h-5" /><span style={{ fontSize: 9 }}>Filtro</span></span>
              </BotaoDoExcel>
              <BotaoDoExcel dica="Limpar" aoClicar={limparFiltro}><Eraser className="w-4 h-4" /></BotaoDoExcel>
            </GrupoDoExcel>
          )}

          {guia === 'Exibir' && (
            <GrupoDoExcel nome="Janela">
              <div style={{ position: 'relative' }}>
                <BotaoDoExcel dica="Congelar Painéis" ativo={p.congeladas > 0}
                  aoClicar={() => setMenu(m => (m === 'congelar' ? null : 'congelar'))}>
                  <span className="flex flex-col items-center">
                    <Snowflake className="w-5 h-5" />
                    <span style={{ fontSize: 9 }}>Congelar Painéis</span>
                  </span>
                </BotaoDoExcel>
                {menu === 'congelar' && (
                  <div className="pl-menu" role="menu">
                    {p.congeladas > 0 ? (
                      <ItemDoMenu aoClicar={() => congelar(0)}>Descongelar Painéis</ItemDoMenu>
                    ) : (
                      <ItemDoMenu aoClicar={() => congelar(sel.l)}>Congelar Painéis</ItemDoMenu>
                    )}
                    <ItemDoMenu aoClicar={() => congelar(1)}>Congelar Linha Superior</ItemDoMenu>
                    <ItemDoMenu aoClicar={() => naoFazParte('Congelar Primeira Coluna')}>Congelar Primeira Coluna</ItemDoMenu>
                  </div>
                )}
              </div>
              <BotaoDoExcel dica="Linhas de Grade" aoClicar={() => naoFazParte('Desligar as Linhas de Grade')}>
                <Rows3 className="w-4 h-4" />
              </BotaoDoExcel>
            </GrupoDoExcel>
          )}

          {guia === DESIGN_DO_GRAFICO && p.grafico && (
            <>
              <GrupoDoExcel nome="Layouts de Gráfico">
                <div style={{ position: 'relative' }}>
                  <BotaoDoExcel dica="Adicionar Elemento Gráfico"
                    aoClicar={() => setMenu(m => (m === 'elemento' ? null : 'elemento'))}>
                    <span className="flex flex-col items-center">
                      <ChartColumn className="w-5 h-5" />
                      <span style={{ fontSize: 9 }}>Adicionar Elemento</span>
                    </span>
                  </BotaoDoExcel>
                  {menu === 'elemento' && (
                    <div className="pl-menu" role="menu">
                      <ItemDoMenu ativo={eixosNaTela} aoClicar={() => { setEixosNaTela(v => !v); setMenu(null); }}>
                        Títulos dos Eixos
                      </ItemDoMenu>
                      <ItemDoMenu aoClicar={() => avisar('O título do gráfico já está nele: clique em "Título do Gráfico" e escreva.')}>
                        Título do Gráfico
                      </ItemDoMenu>
                      <ItemDoMenu aoClicar={() => naoFazParte('Legenda')}>Legenda</ItemDoMenu>
                      <ItemDoMenu aoClicar={() => naoFazParte('Rótulos de Dados')}>Rótulos de Dados</ItemDoMenu>
                    </div>
                  )}
                </div>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Tipo">
                <div style={{ position: 'relative' }}>
                  <BotaoDoExcel dica="Alterar Tipo de Gráfico"
                    aoClicar={() => setMenu(m => (m === 'tipo' ? null : 'tipo'))}>
                    <span className="flex flex-col items-center">
                      <ChartLine className="w-5 h-5" />
                      <span style={{ fontSize: 9 }}>Alterar Tipo</span>
                    </span>
                  </BotaoDoExcel>
                  {menu === 'tipo' && (
                    <div className="pl-menu" role="menu">
                      {(Object.keys(NOME_DO_GRAFICO) as TipoDeGrafico[]).map(t => (
                        <ItemDoMenu key={t} ativo={p.grafico?.tipo === t} aoClicar={() => trocarTipo(t)}>
                          {NOME_DO_GRAFICO[t]}
                        </ItemDoMenu>
                      ))}
                    </div>
                  )}
                </div>
                <BotaoDoExcel dica="Excluir Gráfico" aoClicar={excluirGrafico}><Eraser className="w-4 h-4" /></BotaoDoExcel>
              </GrupoDoExcel>
            </>
          )}
        </div>

        <BarraDeFormulas nome={nomeDaFaixa(faixa)} props={g.propsDaBarra} />

        <GradeDoExcel
          {...g.props}
          aoArrastarBorda={g.aoArrastarBorda}
          aoAjustarAoConteudo={g.aoAjustarAoConteudo}
          aoAbrirFiltro={p.filtro ? ((c, alvo) => {
            /* A lista abre embaixo da setinha, sem passar da borda da tela. */
            const x = Math.min(alvo?.left ?? 80, window.innerWidth - 200);
            setFiltroAberto({ coluna: c, x: Math.max(8, x), y: (alvo?.bottom ?? 120) + 2 });
          }) : undefined}
          sobreposicao={p.grafico && (
            <div className="pl-grafico" role="figure" aria-label={`Gráfico: ${p.grafico.titulo || 'Título do Gráfico'}`}
              data-escolhido={graficoEscolhido ? 'sim' : 'nao'}
              onClick={() => { if (!graficoEscolhido) { setGraficoEscolhido(true); setGuia(DESIGN_DO_GRAFICO); } }}>
              <input className="pl-grafico-campo pl-grafico-titulo" aria-label="Título do Gráfico"
                placeholder="Título do Gráfico" value={p.grafico.titulo}
                onFocus={() => setGraficoEscolhido(true)}
                onChange={e => escreverNoGrafico('titulo', e.target.value)} />
              {eixosNaTela && (
                <input className="pl-grafico-campo pl-grafico-eixo" aria-label="Título do Eixo Vertical"
                  placeholder="Título do Eixo" value={p.grafico.eixoY} style={{ textAlign: 'left' }}
                  onChange={e => escreverNoGrafico('eixoY', e.target.value)} />
              )}
              <DesenhoDoGrafico tipo={p.grafico.tipo} pontos={pontosDoGrafico(p, cad)} />
              {eixosNaTela && (
                <input className="pl-grafico-campo pl-grafico-eixo" aria-label="Título do Eixo Horizontal"
                  placeholder="Título do Eixo" value={p.grafico.eixoX}
                  onChange={e => escreverNoGrafico('eixoX', e.target.value)} />
              )}
            </div>
          )}
        />

        <AbasDoExcel nomes={cad.planilhas.map(q => q.nome)} ativa={cad.ativa} aoAvisar={avisar} aoTrocar={trocarAba} />

        {/* A régua relata, e não julga: o Excel escreve quantos registros o
            filtro achou e soma a seleção, e quem compara com D123 é quem
            está estudando. */}
        <BarraDeStatusDoExcel aoAvisar={avisar} planilha={p} faixa={faixa} caderno={cad}>
          <span>{g.modo}</span>
          {filtrando && <span>{`${visiveis} de ${INSCRITOS.length} registros encontrados`}</span>}
        </BarraDeStatusDoExcel>
      </div>

      {menu && <div className="pl-veu" style={{ zIndex: 30 }} onPointerDown={() => setMenu(null)} />}

      {filtroAberto && (
        <>
          <div className="pl-veu" onPointerDown={() => setFiltroAberto(null)} />
          <div className="pl-filtro-lista" style={{ left: filtroAberto.x, top: filtroAberto.y }} role="listbox"
            aria-label={`Filtrar ${p.celulas[0]?.[filtroAberto.coluna]?.texto ?? ''}`}>
            <button type="button" className="pl-filtro-item"
              aria-current={!p.filtro?.valor}
              onClick={() => {
                mudar(q => ({ ...q, filtro: { coluna: filtroAberto.coluna, valor: '' } }));
                setFiltroAberto(null);
              }}>
              (Selecionar Tudo)
            </button>
            {valoresDaColuna(filtroAberto.coluna).map(v => (
              <button key={v} type="button" className="pl-filtro-item"
                aria-current={p.filtro?.coluna === filtroAberto.coluna && p.filtro.valor === v}
                onClick={() => {
                  mudar(q => ({ ...q, filtro: { coluna: filtroAberto.coluna, valor: v } }));
                  setFiltroAberto(null);
                }}>
                {v}
              </button>
            ))}
          </div>
        </>
      )}
    </LaboratorioEmTelaCheia>
  );
}
