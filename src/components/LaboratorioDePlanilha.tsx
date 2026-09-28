import { useState } from 'react';
import {
  AlignLeft, AlignCenter, AlignRight, ChevronsUp, Minus, ChevronsDown,
  Bold, Combine, Sigma, Palette, ArrowDownAZ, ArrowUpZA, Filter,
  Snowflake, PieChart, Undo2, Redo2, Percent, ClipboardList,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_EXCEL, BarraDeTituloDoExcel, GuiasDoExcel, GrupoDoExcel, BotaoDoExcel, GradeDoExcel,
} from '../labs/excel';
import { useGradeDoExcel } from '../labs/gradeDoExcel';
import {
  type Caderno, type EstiloCondicional, type Planilha, type TipoDeGrafico,
  type Formato, type Historico,
  mesclar, mesclagemApaga, ordenar, planilhaAtiva, trocarAtiva,
  historicoDe, registrar, desfazer, refazer,
  nomeDaCelula, nomeDaFaixa, normalizar, umaCelulaSo, linhaEscondida, valorDaGrade,
} from '../labs/planilha';
import { CADERNOS_DA_CC_ES003 } from '../labs/cadernosDaCcEs003';
import { roteiroDaPlanilha } from '../labs/roteiroDaPlanilha';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * CC-ES003 — os sete laboratórios de planilha, numa tela só.
 *
 * ── Por que um componente para as sete ───────────────────────────────────
 * As sete lições abrem a **mesma** pasta de trabalho e usam os **mesmos**
 * comandos: o que muda entre elas é de que estado da pasta se parte e o que se
 * cobra. Sete componentes seriam sete Excel, e a plataforma já teve dois
 * "Word" uma vez. É o arranjo do `LaboratorioDeExplorador` sobre
 * `explorer.tsx`, do outro lado da mesma ponte.
 *
 * ── E a faixa não muda conforme o exercício ──────────────────────────────
 * Todos os comandos o tempo todo, porque é assim que um programa é. Um Excel
 * que só mostrasse Formatação Condicional na lição de formatação condicional
 * ensinaria a procurar o botão que a tarefa quer, e não a procurar no
 * programa. É a regra que o Explorador da CC-ES001 já segue.
 *
 * ── O que é do programa mora em `excel.tsx` ──────────────────────────────
 * A janela, a fileira de guias, a grade e as caixas de diálogo. Aqui fica o
 * que é do **exercício**: que tarefas se conferem, de que pasta se parte, e o
 * que cada botão faz com ela.
 */

/* ── As guias que este laboratório desenha ─────────────────────────────────── */

const GUIAS_USAVEIS = ['Página Inicial', 'Inserir', 'Dados', 'Exibir'] as const;

const NOME_DO_GRAFICO: Record<TipoDeGrafico, string> = {
  pizza: 'Pizza',
  colunas: 'Colunas',
  linha: 'Linhas',
  dispersao: 'Dispersão',
};

/*
  Por que cada tipo de gráfico responde a uma pergunta, escrito por extenso.

  O programa explica a escolha errada em vez de só deixar a tarefa vermelha —
  é a mesma decisão do laboratório de planilha da AP044, e a razão é a mesma:
  vermelho sem explicação mede paciência.
*/
const O_QUE_O_GRAFICO_RESPONDE: Record<TipoDeGrafico, string> = {
  pizza: 'Repartição: quanto cada parte pesa no todo.',
  colunas: 'Comparação: qual é maior que qual.',
  linha: 'Evolução: como uma coisa mudou ao longo do tempo.',
  dispersao: 'Relação: se duas medidas andam juntas.',
};

const CORES_CONDICIONAIS: Record<EstiloCondicional, string> = {
  vermelho: 'Vermelho claro',
  amarelo: 'Amarelo claro',
  verde: 'Verde claro',
};

const QUANDO: Record<string, string> = {
  maiorQue: 'É Maior do Que',
  menorQue: 'É Menor do Que',
  igualA: 'É Igual a',
  contemTexto: 'Texto que Contém',
};

type Dialogo =
  | { tipo: 'condicional'; quando: keyof typeof QUANDO; valor: string; estilo: EstiloCondicional }
  | { tipo: 'grafico'; grafico: TipoDeGrafico; titulo: string; eixoX: string; eixoY: string }
  | { tipo: 'roteiro' };

/* ── O laboratório ─────────────────────────────────────────────────────────── */

export default function LaboratorioDePlanilha({ vereda, licao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'planilha' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licaoDoCaderno = CADERNOS_DA_CC_ES003[licao.caderno];
  const [hist, setHist] = useState<Historico<Caderno>>(() => historicoDe(licaoDoCaderno.inicial()));
  const cad = hist.presente;
  const p = planilhaAtiva(cad);

  const [guia, setGuia] = useState<string>('Página Inicial');
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);
  const [filtroAberto, setFiltroAberto] = useState<{ coluna: number; x: number; y: number } | null>(null);
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 7000);
  };

  /** Toda mudança passa por aqui, e por isso Ctrl+Z alcança todas elas. */
  const mudar = (f: (p: Planilha) => Planilha) =>
    setHist(h => registrar(h, trocarAtiva(h.presente, f(planilhaAtiva(h.presente)))));

  /*
    A grade é controlada pelo gancho, e não por fiação escrita aqui.

    Ela estava escrita duas vezes — uma aqui e outra em `PlanilhaLab` —, e as
    duas já tinham divergido: lá o Ctrl+C copia, aqui não copiava nada. Quem
    aprendeu a copiar e colar na AP043 chegava nesta vereda, apertava Ctrl+C, e
    nada acontecia, sem erro e sem aviso.

    O estado continua sendo daqui: é este componente que guarda a pasta e o
    histórico, e é o `mudar` acima que o Ctrl+Z alcança. O gancho guarda só o
    que é do gesto.
  */
  const g = useGradeDoExcel({
    planilha: p,
    mudar,
    desfazer: () => setHist(desfazer),
    refazer: () => setHist(refazer),
    avisar: (texto: string) => avisar(texto),
  });
  const { faixa, setFaixa, sel, setBarra, setEditando, gradeRef } = g;

  /* ── Os comandos da faixa ──────────────────────────────────────────────── */

  const naFaixaSelecionada = (f: (cel: Planilha['celulas'][0][0]) => Planilha['celulas'][0][0]) => {
    const n = normalizar(faixa);
    mudar(q => ({
      ...q,
      celulas: q.celulas.map((linha, l) => linha.map((cel, c) => (
        l >= n.topo && l <= n.base && c >= n.esq && c <= n.dir ? f(cel) : cel))),
    }));
  };

  const alinhar = (h: 'esquerda' | 'centro' | 'direita') => naFaixaSelecionada(cel => ({ ...cel, h }));
  const alinharV = (v: 'acima' | 'meio' | 'abaixo') => naFaixaSelecionada(cel => ({ ...cel, v }));
  const negritar = () => {
    const alvo = !p.celulas[sel.l][sel.c].negrito;
    naFaixaSelecionada(cel => ({ ...cel, negrito: alvo }));
  };
  const formatar = (formato: Formato) => naFaixaSelecionada(cel => ({ ...cel, formato }));

  const mesclarFaixa = () => {
    if (umaCelulaSo(faixa)) { avisar('Selecione mais de uma célula para mesclar.'); return; }
    if (mesclagemApaga(p, faixa)) {
      avisar('A mesclagem mantém só o valor da célula de cima à esquerda — o resto se perde.');
    }
    mudar(q => mesclar(q, faixa) ?? q);
  };

  /*
    A AutoSoma escreve a soma do que está **acima** da célula, como o Excel faz.

    Ela para na primeira célula vazia subindo, e não vai até a linha 1: numa
    planilha com título e cabeçalho, somar tudo o que está acima pegaria os
    dois e daria erro ou um número maior. É essa a conta que o Excel faz, e
    escrever outra aqui ensinaria um botão que não existe.
  */
  const autoSoma = () => {
    let topo = sel.l - 1;
    while (topo >= 0 && (p.celulas[topo][sel.c]?.texto ?? '').trim() !== '') topo--;
    topo++;
    if (topo >= sel.l) { avisar('Não há números logo acima desta célula para somar.'); return; }
    const primeira = nomeDaCelula(topo, sel.c);
    const ultima = nomeDaCelula(sel.l - 1, sel.c);
    setBarra(`=SOMA(${primeira}:${ultima})`);
    setEditando('celula');
  };

  /*
    Soltar a alça preenche até onde ela foi arrastada.

    Para baixo ou para o lado, o que tiver andado mais: arrastar a alça na
    diagonal é um gesto que o Excel resolve de um jeito só, e adivinhar o
    outro faria a coluna aparecer preenchida onde ninguém pediu.
  */
  const classificar = (crescente: boolean) => {
    if (!p.tabela) { avisar('Esta aba não tem uma tabela reconhecida para classificar.'); return; }
    mudar(q => ordenar(q, sel.c, crescente));
    avisar('A linha inteira viajou junto — é isso que separa ordenar de filtrar.');
  };

  const ligarFiltro = () => {
    if (!p.tabela) { avisar('Esta aba não tem uma tabela reconhecida para filtrar.'); return; }
    mudar(q => ({ ...q, filtro: q.filtro ? null : { coluna: normalizar(q.tabela!).esq, valor: '' } }));
  };

  const congelar = () => {
    mudar(q => ({ ...q, congeladas: q.congeladas > 0 ? 0 : sel.l }));
    if (sel.l === 0) avisar('Congelar prende tudo o que está acima da célula escolhida — escolha uma célula abaixo do cabeçalho.');
  };

  /* ── As caixas ─────────────────────────────────────────────────────────── */

  const aplicarCondicional = (d: Extract<Dialogo, { tipo: 'condicional' }>) => {
    mudar(q => ({
      ...q,
      regras: [...q.regras, {
        id: `r${q.regras.length + 1}`,
        faixa: { ...faixa },
        quando: d.quando as 'maiorQue' | 'menorQue' | 'igualA' | 'contemTexto',
        valor: d.valor,
        estilo: d.estilo,
      }],
    }));
    setDialogo(null);
  };

  const aplicarGrafico = (d: Extract<Dialogo, { tipo: 'grafico' }>) => {
    mudar(q => ({
      ...q,
      grafico: {
        tipo: d.grafico, titulo: d.titulo, eixoX: d.eixoX, eixoY: d.eixoY, faixa: { ...faixa },
      },
    }));
    setDialogo(null);
  };

  const valoresDaColuna = (coluna: number): string[] => {
    if (!p.tabela) return [];
    const n = normalizar(p.tabela);
    const vistos: string[] = [];
    for (let l = n.topo + 1; l <= n.base; l++) {
      const t = (p.celulas[l]?.[coluna]?.texto ?? '').trim();
      if (t !== '' && !vistos.includes(t)) vistos.push(t);
    }
    return vistos.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  };

  /* ── A cápsula da plataforma ───────────────────────────────────────────── */

  const metas = licaoDoCaderno.metas.filter(m => licao.verificacoes.includes(m.id));
  const tarefas = metas.map(m => ({
    id: m.id,
    titulo: m.titulo,
    detalhe: m.detalhe,
    onde: m.onde,
    passos: m.passos,
    feita: m.feita(cad),
  }));
  const faltam = tarefas.filter(t => !t.feita).length;

  const concluir = async () => {
    setSalvando(true);
    await aoVencer();
    aoSair();
  };

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={concluir} disabled={faltam > 0 || salvando}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50">
        {faltam === 0 ? 'Concluir a lição' : `Faltam ${faltam}`}
      </button>
      {licaoDoCaderno.roteiro && (
        <button onClick={() => setDialogo({ tipo: 'roteiro' })} className="btn-ghost text-sm w-full justify-center">
          <ClipboardList className="w-4 h-4" /> Ensaiar a apresentação
        </button>
      )}
      <button onClick={() => setHist(historicoDe(licaoDoCaderno.inicial()))}
        className="btn-ghost text-sm w-full justify-center">
        <Undo2 className="w-4 h-4" /> Recomeçar a planilha
      </button>
      {/* Herda a cor da superfície: este parágrafo é desenhado no painel branco
          do computador e na bolha escura do celular. */}
      <p style={{ fontSize: 11, opacity: 0.75 }}>
        Fórmula começa por <strong>=</strong>. As setas andam, Shift+setas estendem,
        F2 edita e Del limpa. Arraste o quadradinho do canto da célula para preencher.
      </p>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={licao.titulo}
      programa="excel"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={28}
    >
      <style>{CSS_EXCEL}</style>

      <div className="pl-janela">
        <BarraDeTituloDoExcel arquivo="Acampamento 2026" aoAvisar={avisar} />
        <GuiasDoExcel atual={guia} usaveis={GUIAS_USAVEIS} aoTrocar={setGuia} aoAvisar={avisar} />

        <div className="pl-faixa">
          {guia === 'Página Inicial' && (
            <>
              <GrupoDoExcel nome="Desfazer">
                <BotaoDoExcel dica="Desfazer (Ctrl+Z)" aoClicar={g.desfazer}>
                  <Undo2 className="w-4 h-4" />
                </BotaoDoExcel>
                <BotaoDoExcel dica="Refazer (Ctrl+Y)" aoClicar={g.refazer}>
                  <Redo2 className="w-4 h-4" />
                </BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Fonte">
                <BotaoDoExcel dica="Negrito" ativo={p.celulas[sel.l][sel.c].negrito} aoClicar={negritar}>
                  <Bold className="w-4 h-4" />
                </BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Alinhamento">
                <BotaoDoExcel dica="Alinhar Acima" aoClicar={() => alinharV('acima')}>
                  <ChevronsUp className="w-4 h-4" />
                </BotaoDoExcel>
                <BotaoDoExcel dica="Alinhar no Meio" aoClicar={() => alinharV('meio')}>
                  <Minus className="w-4 h-4" />
                </BotaoDoExcel>
                <BotaoDoExcel dica="Alinhar Abaixo" aoClicar={() => alinharV('abaixo')}>
                  <ChevronsDown className="w-4 h-4" />
                </BotaoDoExcel>
                <span className="pl-sep" />
                <BotaoDoExcel dica="Alinhar à Esquerda" aoClicar={() => alinhar('esquerda')}>
                  <AlignLeft className="w-4 h-4" />
                </BotaoDoExcel>
                <BotaoDoExcel dica="Centralizar" aoClicar={() => alinhar('centro')}>
                  <AlignCenter className="w-4 h-4" />
                </BotaoDoExcel>
                <BotaoDoExcel dica="Alinhar à Direita" aoClicar={() => alinhar('direita')}>
                  <AlignRight className="w-4 h-4" />
                </BotaoDoExcel>
                <span className="pl-sep" />
                <BotaoDoExcel dica="Mesclar e Centralizar" aoClicar={mesclarFaixa}>
                  <Combine className="w-4 h-4" />
                </BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Número">
                <BotaoDoExcel dica="Formato de Moeda" aoClicar={() => formatar('moeda')}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>R$</span>
                </BotaoDoExcel>
                <BotaoDoExcel dica="Formato de Porcentagem" aoClicar={() => formatar('porcentagem')}>
                  <Percent className="w-4 h-4" />
                </BotaoDoExcel>
                <BotaoDoExcel dica="Formato Geral" aoClicar={() => formatar('geral')}>
                  <span style={{ fontSize: 11 }}>Geral</span>
                </BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Estilos">
                <BotaoDoExcel dica="Formatação Condicional › Realçar Regras das Células"
                  aoClicar={() => setDialogo({ tipo: 'condicional', quando: 'menorQue', valor: '', estilo: 'vermelho' })}>
                  <Palette className="w-4 h-4" />
                </BotaoDoExcel>
              </GrupoDoExcel>
              <GrupoDoExcel nome="Edição">
                <BotaoDoExcel dica="AutoSoma" aoClicar={autoSoma}>
                  <Sigma className="w-4 h-4" />
                </BotaoDoExcel>
              </GrupoDoExcel>
            </>
          )}

          {guia === 'Inserir' && (
            <GrupoDoExcel nome="Gráficos">
              <BotaoDoExcel dica="Inserir Gráfico"
                aoClicar={() => setDialogo({ tipo: 'grafico', grafico: 'colunas', titulo: '', eixoX: '', eixoY: '' })}>
                <PieChart className="w-4 h-4" />
              </BotaoDoExcel>
            </GrupoDoExcel>
          )}

          {guia === 'Dados' && (
            <>
              <GrupoDoExcel nome="Classificar e Filtrar">
                <BotaoDoExcel dica="Classificar de A a Z" aoClicar={() => classificar(true)}>
                  <ArrowDownAZ className="w-4 h-4" />
                </BotaoDoExcel>
                <BotaoDoExcel dica="Classificar de Z a A" aoClicar={() => classificar(false)}>
                  <ArrowUpZA className="w-4 h-4" />
                </BotaoDoExcel>
                <BotaoDoExcel dica="Filtro" ativo={!!p.filtro} aoClicar={ligarFiltro}>
                  <Filter className="w-4 h-4" />
                </BotaoDoExcel>
              </GrupoDoExcel>
            </>
          )}

          {guia === 'Exibir' && (
            <GrupoDoExcel nome="Janela">
              <BotaoDoExcel dica="Congelar Painéis" ativo={p.congeladas > 0} aoClicar={congelar}>
                <Snowflake className="w-4 h-4" />
              </BotaoDoExcel>
            </GrupoDoExcel>
          )}
        </div>

        <div className="pl-formula">
          <span className="pl-nome" aria-label="Caixa de nome">{nomeDaFaixa(faixa)}</span>
          <span className="pl-fx">fx</span>
          <input
            className="pl-entrada"
            aria-label="Barra de fórmulas"
            placeholder="Escreva aqui, ou uma fórmula começando por ="
            {...g.propsDaBarra} />
        </div>

        <GradeDoExcel
          {...g.props}
          aoArrastarBorda={g.aoArrastarBorda}
          aoAjustarAoConteudo={g.aoAjustarAoConteudo}
          aoComecarPreenchimento={g.aoComecarPreenchimento}
          aoAbrirFiltro={p.filtro ? (c => {
            const alvo = gradeRef.current?.querySelectorAll('.pl-cab-col')[c]?.getBoundingClientRect();
            setFiltroAberto({ coluna: c, x: alvo?.left ?? 80, y: (alvo?.bottom ?? 120) + 2 });
          }) : undefined}
        />

        {p.grafico && (
          <div className="pl-grafico" role="figure" aria-label={`Gráfico: ${p.grafico.titulo}`}>
            <div className="pl-grafico-titulo">{p.grafico.titulo || '(sem título)'}</div>
            <DesenhoDoGrafico planilha={p} />
            <div className="pl-grafico-eixo">
              {p.grafico.eixoX || '(eixo sem nome)'} × {p.grafico.eixoY || '(eixo sem nome)'}
            </div>
          </div>
        )}

        <div className="pl-abas">
          {cad.planilhas.map((q, i) => (
            <button key={q.nome} type="button" className="pl-aba" aria-current={i === cad.ativa}
              onClick={() => {
                setHist(h => ({ ...h, presente: { ...h.presente, ativa: i } }));
                setFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 });
                setEditando(null);
              }}>
              {q.nome}
            </button>
          ))}
          <button type="button" className="pl-aba-mais" title="Nova planilha" aria-label="Nova planilha"
            onClick={() => avisar('Acrescentar planilhas existe no programa de verdade, e não faz parte deste exercício.')}>
            +
          </button>
        </div>

        <div className="pl-status">
          <span>Pronto</span>
          <span style={{ marginLeft: 'auto' }}>
            {p.filtro?.valor
              ? `Filtro: ${p.filtro.valor} — ${contarVisiveis(p)} de ${contarDaTabela(p)} linhas`
              : nomeDaFaixa(faixa)}
          </span>
        </div>
      </div>

      {filtroAberto && (
        <>
          <div className="pl-veu" onPointerDown={() => setFiltroAberto(null)} />
          <div className="pl-filtro-lista" style={{ left: filtroAberto.x, top: filtroAberto.y }} role="listbox">
            <button type="button" className="pl-filtro-item"
              aria-current={!p.filtro?.valor}
              onClick={() => {
                mudar(q => ({ ...q, filtro: { coluna: filtroAberto.coluna, valor: '' } }));
                setFiltroAberto(null);
              }}>
              (Todas)
            </button>
            {valoresDaColuna(filtroAberto.coluna).map(v => (
              <button key={v} type="button" className="pl-filtro-item"
                aria-current={p.filtro?.coluna === filtroAberto.coluna && p.filtro.valor === v}
                onClick={() => {
                  mudar(q => ({ ...q, filtro: { coluna: filtroAberto.coluna, valor: v } }));
                  setFiltroAberto(null);
                  avisar('As linhas escondidas continuam na planilha — e continuam entrando na SOMA.');
                }}>
                {v}
              </button>
            ))}
          </div>
        </>
      )}

      {dialogo && (
        <>
          <div className="pl-veu-dialogo" onPointerDown={() => setDialogo(null)} />
          <div className="pl-dialogo" role="dialog" aria-modal="true">
            {dialogo.tipo === 'condicional' && (
              <>
                <div className="pl-dialogo-titulo">Formatação Condicional — {nomeDaFaixa(faixa)}</div>
                <div className="pl-dialogo-corpo">
                  <label className="pl-campo">
                    <span>Formatar as células em que o valor</span>
                    <select value={dialogo.quando}
                      onChange={e => setDialogo({ ...dialogo, quando: e.target.value })}>
                      {Object.entries(QUANDO).map(([k, rotulo]) => (
                        <option key={k} value={k}>{rotulo}</option>
                      ))}
                    </select>
                  </label>
                  <label className="pl-campo">
                    <span>Comparar com</span>
                    <input value={dialogo.valor} autoFocus
                      onChange={e => setDialogo({ ...dialogo, valor: e.target.value })} />
                  </label>
                  <label className="pl-campo">
                    <span>Pintar de</span>
                    <select value={dialogo.estilo}
                      onChange={e => setDialogo({ ...dialogo, estilo: e.target.value as EstiloCondicional })}>
                      {Object.entries(CORES_CONDICIONAIS).map(([k, rotulo]) => (
                        <option key={k} value={k}>{rotulo}</option>
                      ))}
                    </select>
                  </label>
                  {/* O aviso é o do programa, e não da plataforma: a célula
                      vazia vale zero no Excel, e quem não sabe disso pinta
                      metade da coluna sem entender por quê. */}
                  <p className="pl-nota">
                    A regra vale para {nomeDaFaixa(faixa)}. Célula vazia conta como zero:
                    uma regra de “menor que” esticada até o fim da coluna acende a parte
                    em branco dela.
                  </p>
                </div>
                <div className="pl-dialogo-pe">
                  <button className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Cancelar</button>
                  <button className="pl-dialogo-bt pl-dialogo-bt-ok"
                    onClick={() => aplicarCondicional(dialogo)}>OK</button>
                </div>
              </>
            )}

            {dialogo.tipo === 'grafico' && (
              <>
                <div className="pl-dialogo-titulo">Inserir Gráfico — dados de {nomeDaFaixa(faixa)}</div>
                <div className="pl-dialogo-corpo">
                  <label className="pl-campo">
                    <span>Tipo</span>
                    <select value={dialogo.grafico}
                      onChange={e => setDialogo({ ...dialogo, grafico: e.target.value as TipoDeGrafico })}>
                      {Object.entries(NOME_DO_GRAFICO).map(([k, rotulo]) => (
                        <option key={k} value={k}>{rotulo}</option>
                      ))}
                    </select>
                  </label>
                  <p className="pl-nota">{O_QUE_O_GRAFICO_RESPONDE[dialogo.grafico]}</p>
                  <label className="pl-campo">
                    <span>Título do gráfico</span>
                    <input value={dialogo.titulo}
                      onChange={e => setDialogo({ ...dialogo, titulo: e.target.value })} />
                  </label>
                  <label className="pl-campo">
                    <span>Nome do eixo horizontal</span>
                    <input value={dialogo.eixoX}
                      onChange={e => setDialogo({ ...dialogo, eixoX: e.target.value })} />
                  </label>
                  <label className="pl-campo">
                    <span>Nome do eixo vertical</span>
                    <input value={dialogo.eixoY}
                      onChange={e => setDialogo({ ...dialogo, eixoY: e.target.value })} />
                  </label>
                </div>
                <div className="pl-dialogo-pe">
                  <button className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Cancelar</button>
                  <button className="pl-dialogo-bt pl-dialogo-bt-ok"
                    onClick={() => aplicarGrafico(dialogo)}>OK</button>
                </div>
              </>
            )}

            {dialogo.tipo === 'roteiro' && (
              <>
                <div className="pl-dialogo-titulo">O que dizer sobre cada fórmula</div>
                <div className="pl-dialogo-corpo" style={{ maxHeight: '60vh', overflow: 'auto' }}>
                  {/* Isto é da plataforma, e não do Excel: o requisito 8
                      acontece na conversa com o examinador, e o que a
                      plataforma faz é preparar — como o roteiro da estrutura
                      na CC-ES001 e o do programa na CC004. */}
                  <p className="pl-nota">
                    Isto não é uma tarefa. Você vai apresentar a planilha a alguém, e
                    estas são as frases para treinar com a sua planilha na frente.
                  </p>
                  {roteiroDaPlanilha(p).length === 0 ? (
                    <p>Esta aba ainda não tem fórmula nenhuma para explicar.</p>
                  ) : (
                    roteiroDaPlanilha(p).map(passo => (
                      <div key={passo.onde} className="pl-campo">
                        <span>{passo.onde} — {passo.formula}</span>
                        <p style={{ margin: 0, lineHeight: 1.45 }}>{passo.fala}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="pl-dialogo-pe">
                  <button className="pl-dialogo-bt pl-dialogo-bt-ok" onClick={() => setDialogo(null)}>Fechar</button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </LaboratorioEmTelaCheia>
  );
}

/* ── Peças de apoio ────────────────────────────────────────────────────────── */

const contarDaTabela = (p: Planilha) => {
  if (!p.tabela) return 0;
  const n = normalizar(p.tabela);
  return n.base - n.topo;
};

const contarVisiveis = (p: Planilha) => {
  if (!p.tabela) return 0;
  const n = normalizar(p.tabela);
  let visiveis = 0;
  for (let l = n.topo + 1; l <= n.base; l++) if (!linhaEscondida(p, l)) visiveis++;
  return visiveis;
};

/**
 * O desenho do gráfico.
 *
 * Ele é pequeno e é de propósito: o que a lição cobra é a **escolha** do tipo,
 * do título e dos eixos, e não a beleza do desenho. Um gráfico caprichado aqui
 * faria o exercício parecer ser sobre desenhar.
 */
function DesenhoDoGrafico({ planilha: p }: { planilha: Planilha }) {
  const g = p.grafico;
  if (!g) return null;
  const n = normalizar(g.faixa);
  const linhas: { rotulo: string; valor: number }[] = [];
  for (let l = n.topo; l <= n.base; l++) {
    const rotulo = (p.celulas[l]?.[n.esq]?.texto ?? '').trim();
    let valor = 0;
    for (let c = n.dir; c > n.esq; c--) {
      const v = valorNumerico(p, l, c);
      if (v !== null) { valor = v; break; }
    }
    if (rotulo !== '' && valor > 0) linhas.push({ rotulo, valor });
  }
  const total = linhas.reduce((s, x) => s + x.valor, 0) || 1;
  const maior = Math.max(...linhas.map(x => x.valor), 1);

  if (g.tipo === 'pizza') {
    let inicio = 0;
    return (
      <svg viewBox="0 0 120 70" style={{ width: '100%', height: 90 }} role="img">
        {linhas.map((x, i) => {
          const fatia = (x.valor / total) * 360;
          const d = arco(35, 35, 30, inicio, inicio + fatia);
          inicio += fatia;
          return <path key={x.rotulo} d={d} fill={CORES_DO_GRAFICO[i % CORES_DO_GRAFICO.length]} />;
        })}
        {linhas.slice(0, 4).map((x, i) => (
          <g key={x.rotulo}>
            <rect x={74} y={10 + i * 12} width={8} height={8} fill={CORES_DO_GRAFICO[i % CORES_DO_GRAFICO.length]} />
            <text x={86} y={17 + i * 12} fontSize={7} fill="#201F1E">{x.rotulo}</text>
          </g>
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 70" style={{ width: '100%', height: 90 }} role="img">
      {linhas.map((x, i) => {
        const largura = Math.min(18, 110 / Math.max(linhas.length, 1));
        const altura = (x.valor / maior) * 46;
        return (
          <g key={x.rotulo}>
            <rect x={6 + i * (largura + 4)} y={56 - altura} width={largura} height={altura}
              fill={CORES_DO_GRAFICO[i % CORES_DO_GRAFICO.length]} />
            <text x={6 + i * (largura + 4)} y={66} fontSize={6} fill="#605E5C">{x.rotulo.slice(0, 6)}</text>
          </g>
        );
      })}
      <line x1={4} y1={56} x2={116} y2={56} stroke="#C8C6C4" strokeWidth={0.6} />
    </svg>
  );
}

const CORES_DO_GRAFICO = ['#217346', '#4C8C6B', '#8AB79A', '#C13516', '#D98C6A', '#7A6FAE'];

/** O número que a célula mostra, ou `null` quando ela não mostra número nenhum. */
function valorNumerico(p: Planilha, l: number, c: number): number | null {
  const v = valorDaGrade(p, l, c);
  return v.tipo === 'numero' ? v.n : null;
}

/**
 * Uma fatia de pizza, em caminho SVG.
 *
 * Os ângulos começam no topo e crescem no sentido do relógio, que é como a
 * pizza do Excel é desenhada — começar à direita deixaria a primeira fatia num
 * lugar que ninguém reconhece.
 */
function arco(cx: number, cy: number, r: number, de: number, ate: number): string {
  const ponto = (grau: number) => {
    const rad = ((grau - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [x1, y1] = ponto(de);
  const [x2, y2] = ponto(ate);
  const grande = ate - de > 180 ? 1 : 0;
  /* Uma fatia sozinha fecharia em si mesma e não desenharia nada: um arco de
     360° tem começo e fim no mesmo ponto. O círculo inteiro vira dois arcos. */
  if (ate - de >= 359.9) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${grande} 1 ${x2} ${y2} Z`;
}
