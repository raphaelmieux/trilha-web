import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Filter, Snowflake, ChartLine, ChartPie, ChartColumn, ChartScatter,
  Type, Ruler, ChevronDown, Sigma, ArrowDownAZ, Eraser, Copy, ClipboardPaste,
  FileCheck2, RotateCcw, Check,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_EXCEL, BarraDeTituloDoExcel, GuiasDoExcel, GrupoDoExcel, BotaoDoExcel, AbasDoExcel,
} from './excel';
import {
  ACAMPAMENTO_INICIAL, METAS_DO_ACAMPAMENTO, UNIDADES, INSCRICOES_POR_MES,
  NOMES_DOS_GRAFICOS,
  inscritosNaTela, totalDaCelula, totalNaTela,
  type Acampamento, type TipoDeGrafico,
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
 * A janela é a mesma, de `excel.tsx` — que saiu de dentro do laboratório da
 * AP043 justamente agora, para que não existam dois "Excel" diferentes na
 * plataforma. É a mesma decisão que `word.tsx` já tinha registrado.
 *
 * ── Os dois números ──────────────────────────────────────────────────────
 * A planilha mostra ao mesmo tempo a célula do total, que é a `SOMA`, e a
 * barra de status, que soma o que está à vista — como o Excel de verdade faz.
 * Com filtro aplicado eles não batem, e é aí que a lição acontece: quem não
 * sabe disso lê o número da célula e o manda para a liderança.
 */

const COLUNAS = ['Nome', 'Unidade', 'Diárias', 'Valor'] as const;
const USAVEIS = ['Página Inicial', 'Inserir', 'Exibir'];

const ICONE_DO_GRAFICO: Record<Exclude<TipoDeGrafico, 'nenhum'>, typeof ChartLine> = {
  pizza: ChartPie,
  barras: ChartColumn,
  linha: ChartLine,
  dispersao: ChartScatter,
};

const reais = (n: number) => `R$ ${n.toLocaleString('pt-BR')}`;

export default function PlanilhaAvancadaLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [ac, setAc] = useState<Acampamento>(ACAMPAMENTO_INICIAL);
  const [guia, setGuia] = useState('Página Inicial');
  const [menu, setMenu] = useState<string | null>(null);
  const [editandoTotal, setEditandoTotal] = useState(false);
  const [rascunhoDaFormula, setRascunhoDaFormula] = useState('');
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  const naTela = inscritosNaTela(ac);
  const daCelula = totalDaCelula(ac);
  const daVista = totalNaTela(ac);
  const batem = daCelula === daVista;

  const tarefas = METAS_DO_ACAMPAMENTO.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde,
    passos: m.passos, feita: m.feita(ac),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  const fecharMenu = () => setMenu(null);
  const abrir = (id: string) => setMenu(m => (m === id ? null : id));
  const avisar = (r: string) => { fecharMenu(); setAviso(r); };
  const naoFazParte = (n: string) =>
    avisar(`${n} existe no Excel de verdade, e está aqui para a faixa ficar igual — mas não faz parte deste exercício.`);

  const ligarFiltro = () => {
    fecharMenu();
    setAc(a => ({ ...a, filtroLigado: !a.filtroLigado, unidadeFiltrada: a.filtroLigado ? '' : a.unidadeFiltrada }));
    setAviso(ac.filtroLigado
      ? 'Filtro desligado. As cento e vinte linhas voltaram — elas nunca tinham saído.'
      : 'Filtro ligado: repare nas setinhas que apareceram no cabeçalho. Clique na da coluna Unidade.');
  };

  const filtrarPor = (unidade: string) => {
    fecharMenu();
    setAc(a => ({ ...a, unidadeFiltrada: unidade }));
    setAviso(unidade
      ? 'Filtrado. As outras linhas continuam na planilha, escondidas — e repare que o total da célula não mudou junto.'
      : 'Filtro retirado da coluna.');
  };

  const congelar = (linhas: number) => {
    fecharMenu();
    setAc(a => ({ ...a, linhasCongeladas: linhas }));
    setAviso(linhas
      ? 'Cabeçalho preso no alto. Congelar é coisa de tela: não muda dado nenhum, não trava célula contra edição e não vai para a impressão.'
      : 'Painéis descongelados.');
  };

  const gravarFormula = () => {
    setEditandoTotal(false);
    const nova = rascunhoDaFormula.trim();
    if (!nova.startsWith('=')) {
      setAviso('Fórmula começa com sinal de igual — sem ele, o Excel guarda o texto e não calcula nada.');
      return;
    }
    setAc(a => ({ ...a, formulaDoTotal: nova }));
    setAviso(nova.toUpperCase().startsWith('=SUBTOTAL')
      ? 'Agora os dois números batem — e continuam batendo quando você trocar o filtro, porque a fórmula lê o que está à vista.'
      : 'Gravado. Confira se ele bate com o número do rodapé.');
  };

  const criarGrafico = (tipo: Exclude<TipoDeGrafico, 'nenhum'>) => {
    fecharMenu();
    setAc(a => ({ ...a, grafico: { tipo, titulo: a.grafico?.titulo ?? '', eixos: a.grafico?.eixos ?? false } }));
    setAviso(tipo === 'linha'
      ? 'Gráfico de linhas: o eixo tem ordem no tempo, e a linha entre dois pontos diz "daqui foi para ali". Agora dê um título e nomeie os eixos.'
      : tipo === 'pizza'
        ? 'Pizza responde composição — quanto cada parte representa do todo. Ela não mostra que março veio depois de fevereiro.'
        : tipo === 'barras'
          ? 'Colunas comparam quantidades. Comparam bem — mas não mostram a subida e a descida entre um mês e o seguinte.'
          : 'Dispersão relaciona duas medidas, e não uma série no tempo.');
  };

  const recomecar = () => {
    setAc(ACAMPAMENTO_INICIAL);
    setGuia('Página Inicial');
    setEditandoTotal(false);
    fecharMenu();
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
      });
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
    </div>
  );

  const Menu = ({ id, children }: { id: string; children: React.ReactNode }) => (
    menu === id ? <div className="pl-menu" role="menu">{children}</div> : null
  );

  const ItemMenu = ({ aoClicar, ativo, children }: {
    aoClicar: () => void; ativo?: boolean; children: React.ReactNode;
  }) => (
    <button type="button" role="menuitem" onClick={aoClicar} className="pl-menu-item">
      <span className="pl-menu-rotulo">
        {ativo ? <Check className="w-3 h-3" /> : <span style={{ width: 12 }} />}
        {children}
      </span>
    </button>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="excel"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_EXCEL}</style>
      <style>{`
        .pa-corpo { flex: 1; min-height: 0; display: flex; overflow: hidden; }
        .pa-lista { flex: 1; min-width: 0; overflow: auto; background: #FFFFFF; }
        .pa-tabela { border-collapse: collapse; width: 100%; font-size: 12.5px; }
        .pa-tabela th {
          background: #F3F2F1; border: 1px solid #D2D0CE; padding: 3px 6px;
          color: #605E5C; font-size: 11.5px; font-weight: 600; text-align: left;
          white-space: nowrap;
        }
        /* O cabeçalho congelado é sticky: é o que "congelar painéis" faz —
           prender no alto o que ficaria para trás na rolagem. */
        .pa-congelado th { position: sticky; top: 0; z-index: 2; }
        .pa-tabela td { border: 1px solid #E1DFDD; padding: 2px 6px; color: #201F1E; white-space: nowrap; }
        .pa-seta {
          border: 1px solid #C8C6C4; background: #FFFFFF; border-radius: 2px;
          margin-left: 6px; padding: 0 3px; cursor: pointer; color: #605E5C;
        }
        .pa-lado {
          width: 300px; flex: none; border-left: 1px solid #E1DFDD; background: #FAF9F8;
          padding: 10px; overflow: auto;
        }
        .pa-total {
          border: 1px solid #D2D0CE; background: #FFFFFF; padding: 8px 10px;
          margin-bottom: 12px; font-size: 12.5px; color: #201F1E;
        }
        .pa-formula {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px;
          color: #605E5C; cursor: cell; display: block; padding: 2px 0;
        }
        .pa-mini {
          border: 1px solid #D2D0CE; background: #FFFFFF; padding: 8px; font-size: 11.5px;
        }
        .pa-grafico { border: 1px solid #D2D0CE; background: #FFFFFF; padding: 10px; }
        .pa-barras { display: flex; align-items: flex-end; gap: 6px; height: 92px; }
        .pa-fatia { border-radius: 2px; }
      `}</style>

      <div className="pl-janela" onClick={fecharMenu}>
        <BarraDeTituloDoExcel arquivo="inscritos-do-acampamento" aoAvisar={avisar} />
        <GuiasDoExcel atual={guia} usaveis={USAVEIS}
          aoTrocar={g => { setGuia(g); fecharMenu(); }} aoAvisar={avisar} />

        <div className="pl-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}
          onClick={ev => ev.stopPropagation()}>
          {guia === 'Página Inicial' && (
            <>
              <GrupoDoExcel nome="Área de Transferência">
                <BotaoDoExcel dica="Colar (Ctrl+V)" aoClicar={() => naoFazParte('Colar')}>
                  <ClipboardPaste className="w-4 h-4" />
                </BotaoDoExcel>
                <BotaoDoExcel dica="Copiar (Ctrl+C)" aoClicar={() => naoFazParte('Copiar')}>
                  <Copy className="w-4 h-4" />
                </BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Fonte">
                <BotaoDoExcel dica="Fonte" aoClicar={() => naoFazParte('A caixa de fonte')}>
                  <Type className="w-4 h-4" />
                </BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Classificar e Filtrar">
                <BotaoDoExcel dica="Filtro" ativo={ac.filtroLigado} aoClicar={ligarFiltro}>
                  <Filter className="w-4 h-4" />
                </BotaoDoExcel>
                <BotaoDoExcel dica="Classificar de A a Z" aoClicar={() => naoFazParte('Classificar')}>
                  <ArrowDownAZ className="w-4 h-4" />
                </BotaoDoExcel>
                <BotaoDoExcel dica="Limpar Filtros" aoClicar={() => filtrarPor('')}>
                  <Eraser className="w-4 h-4" />
                </BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Edição">
                <BotaoDoExcel dica="AutoSoma" aoClicar={() => naoFazParte('A AutoSoma')}>
                  <Sigma className="w-4 h-4" />
                </BotaoDoExcel>
              </GrupoDoExcel>
            </>
          )}

          {guia === 'Inserir' && (
            <GrupoDoExcel nome="Gráficos">
              {(Object.keys(ICONE_DO_GRAFICO) as (keyof typeof ICONE_DO_GRAFICO)[]).map(t => {
                const Icone = ICONE_DO_GRAFICO[t];
                return (
                  <BotaoDoExcel key={t} dica={`Gráfico de ${NOMES_DOS_GRAFICOS[t]}`}
                    ativo={ac.grafico?.tipo === t} aoClicar={() => criarGrafico(t)}>
                    <span className="flex flex-col items-center">
                      <Icone className="w-5 h-5" />
                      <span style={{ fontSize: 9 }}>{NOMES_DOS_GRAFICOS[t]}</span>
                    </span>
                  </BotaoDoExcel>
                );
              })}
            </GrupoDoExcel>
          )}

          {guia === 'Exibir' && (
            <GrupoDoExcel nome="Janela">
              <div style={{ position: 'relative' }}>
                <BotaoDoExcel dica="Congelar Painéis" ativo={ac.linhasCongeladas > 0}
                  aoClicar={() => abrir('congelar')}>
                  <span className="flex flex-col items-center">
                    <Snowflake className="w-5 h-5" />
                    <span style={{ fontSize: 9 }}>Congelar</span>
                  </span>
                </BotaoDoExcel>
                <Menu id="congelar">
                  <ItemMenu ativo={ac.linhasCongeladas > 0} aoClicar={() => congelar(1)}>
                    Congelar Linha Superior
                  </ItemMenu>
                  <ItemMenu aoClicar={() => naoFazParte('Congelar Primeira Coluna')}>
                    Congelar Primeira Coluna
                  </ItemMenu>
                  <ItemMenu ativo={ac.linhasCongeladas === 0} aoClicar={() => congelar(0)}>
                    Descongelar Painéis
                  </ItemMenu>
                </Menu>
              </div>
              <BotaoDoExcel dica="Linhas de Grade" aoClicar={() => naoFazParte('Linhas de Grade')}>
                <Ruler className="w-4 h-4" />
              </BotaoDoExcel>
            </GrupoDoExcel>
          )}
        </div>

        <div className="pa-corpo">
          <div className="pa-lista">
            <table className={`pa-tabela ${ac.linhasCongeladas > 0 ? 'pa-congelado' : ''}`}>
              <thead>
                <tr>
                  {COLUNAS.map(c => (
                    <th key={c}>
                      {c}
                      {ac.filtroLigado && c === 'Unidade' && (
                        <span style={{ position: 'relative', display: 'inline-block' }}>
                          <button type="button" className="pa-seta" aria-label="Filtrar por Unidade"
                            onClick={ev => { ev.stopPropagation(); abrir('unidade'); }}>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <Menu id="unidade">
                            <ItemMenu ativo={!ac.unidadeFiltrada} aoClicar={() => filtrarPor('')}>
                              (Selecionar Tudo)
                            </ItemMenu>
                            {UNIDADES.map(u => (
                              <ItemMenu key={u} ativo={ac.unidadeFiltrada === u} aoClicar={() => filtrarPor(u)}>
                                {u}
                              </ItemMenu>
                            ))}
                          </Menu>
                        </span>
                      )}
                      {ac.filtroLigado && c !== 'Unidade' && (
                        <button type="button" className="pa-seta" aria-label={`Filtrar por ${c}`}
                          onClick={ev => { ev.stopPropagation(); naoFazParte(`Filtrar por ${c}`); }}>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {naTela.map(i => (
                  <tr key={i.nome}>
                    <td>{i.nome}</td>
                    <td>{i.unidade}</td>
                    <td>{i.diarias}</td>
                    <td>{reais(i.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pa-lado" onClick={ev => ev.stopPropagation()}>
            {/* A célula do total, que é onde os dois números divergem. */}
            <div className="pa-total">
              <p style={{ fontWeight: 600, marginBottom: 2 }}>Total arrecadado (célula D123)</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: batem ? '#217346' : '#A4262C' }}>
                {reais(daCelula)}
              </p>
              {editandoTotal ? (
                <input className="pl-entrada" autoFocus value={rascunhoDaFormula}
                  aria-label="Fórmula da célula do total"
                  onChange={e => setRascunhoDaFormula(e.target.value)}
                  onBlur={gravarFormula}
                  onKeyDown={e => { if (e.key === 'Enter') gravarFormula(); }} />
              ) : (
                <button type="button" className="pa-formula" aria-label="Fórmula da célula do total"
                  onClick={() => { setRascunhoDaFormula(ac.formulaDoTotal); setEditandoTotal(true); }}>
                  {ac.formulaDoTotal}
                </button>
              )}
              {!batem && (
                <p style={{ fontSize: 11, color: '#A4262C', marginTop: 4 }}>
                  Este número não é o do rodapé. Com filtro aplicado, a SOMA continua
                  contando as linhas escondidas.
                </p>
              )}
            </div>

            {/* Os meses, que é o que o gráfico tem de mostrar. */}
            <div className="pa-mini" style={{ marginBottom: 12 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Inscrições por mês (F2:G7)</p>
              <table style={{ width: '100%', fontSize: 11.5 }}>
                <tbody>
                  {INSCRICOES_POR_MES.map(m => (
                    <tr key={m.mes}>
                      <td style={{ color: '#605E5C' }}>{m.mes}</td>
                      <td style={{ textAlign: 'right' }}>{m.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {ac.grafico && (
              <div className="pa-grafico">
                <input className="pl-entrada" style={{ marginBottom: 6, width: '100%' }}
                  placeholder="Título do gráfico"
                  aria-label="Título do gráfico"
                  value={ac.grafico.titulo}
                  onChange={e => setAc(a => ({ ...a, grafico: { ...a.grafico!, titulo: e.target.value } }))} />

                {ac.grafico.tipo === 'pizza' ? (
                  <div style={{
                    width: 92, height: 92, borderRadius: '50%', margin: '4px auto',
                    background: 'conic-gradient(#217346 0 12%, #4C9A6E 0 26%, #7FBFA8 0 44%, #A9D6C4 0 66%, #CBE7DC 0 100%)',
                  }} />
                ) : ac.grafico.tipo === 'dispersao' ? (
                  <div style={{ position: 'relative', height: 92, border: '1px solid #E1DFDD' }}>
                    {INSCRICOES_POR_MES.map((m, i) => (
                      <span key={m.mes} style={{
                        position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: '#217346',
                        left: `${8 + i * 15}%`, bottom: `${(m.total / 120) * 80}%`,
                      }} />
                    ))}
                  </div>
                ) : ac.grafico.tipo === 'linha' ? (
                  <svg viewBox="0 0 120 60" style={{ width: '100%', height: 92, border: '1px solid #E1DFDD' }}>
                    <polyline fill="none" stroke="#217346" strokeWidth="2"
                      points={INSCRICOES_POR_MES.map((m, i) =>
                        `${8 + i * 20},${56 - (m.total / 120) * 48}`).join(' ')} />
                    {INSCRICOES_POR_MES.map((m, i) => (
                      <circle key={m.mes} r="2" fill="#217346"
                        cx={8 + i * 20} cy={56 - (m.total / 120) * 48} />
                    ))}
                  </svg>
                ) : (
                  <div className="pa-barras">
                    {INSCRICOES_POR_MES.map(m => (
                      <span key={m.mes} className="pa-fatia" style={{
                        flex: 1, background: '#217346', height: `${(m.total / 120) * 100}%`,
                      }} />
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-2" style={{ fontSize: 11.5, marginTop: 6 }}>
                  <input type="checkbox" checked={ac.grafico.eixos}
                    aria-label="Títulos dos Eixos"
                    onChange={e => setAc(a => ({ ...a, grafico: { ...a.grafico!, eixos: e.target.checked } }))} />
                  Títulos dos Eixos
                </label>
                {ac.grafico.eixos && (
                  <p style={{ fontSize: 10.5, color: '#605E5C', marginTop: 2 }}>
                    Eixo horizontal: Mês · Eixo vertical: Inscritos
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <AbasDoExcel nome="Inscritos" aoAvisar={avisar} />

        {/*
          A barra de status soma o que está à vista, como a do Excel.
          É o segundo número, e é ele que denuncia a linha escondida.
        */}
        <div className="pl-status">
          <span>Pronto</span>
          <span>
            {ac.unidadeFiltrada
              ? `${naTela.length} de ${ac.inscritos.length} registros encontrados`
              : `${ac.inscritos.length} registros`}
          </span>
          <span className="ml-auto" style={{ color: batem ? '#605E5C' : '#A4262C' }}>
            Soma do que está à vista: {reais(daVista)}
          </span>
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
