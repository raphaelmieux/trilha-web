import { useState } from 'react';
import {
  ArrowDownAZ, ArrowUpZA, BarChart3, Grid3x3, NotebookPen, Shuffle, Sigma,
  Table2, Undo2, Redo2,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_EXCEL, BarraDeFormulas, AbasDoExcel, BarraDeTituloDoExcel, BotaoDoExcel, DesenhoDoGrafico, GradeDoExcel,
  GrupoDoExcel, GuiasDoExcel,
} from '../labs/excel';
import { useGradeDoExcel } from '../labs/gradeDoExcel';
import { CampoLongo, Cartao, Escolha, EscolhaMultipla } from '../labs/caderno';
import {
  type Caderno, type Historico, type Planilha, type TipoDeGrafico,
  desfazer, historicoDe, nomeDaFaixa, normalizar, ordenar, planilhaAtiva,
  pontosDaDispersao, pontosDoGrafico, refazer, registrar, trocarAtiva,
} from '../labs/planilha';
import { escritoEm } from '../labs/cadernoDoClube';
import {
  type ContextoDaEstatistica, type LicaoDaCcEs010, type Meta,
  type ProgramaDaCcEs010,
  ACHADOS_DA_LICAO, CANDIDATAS_A_ESCONDIDA, CHAVE_ACASO, CHAVE_DADO, CHAVE_EFEITO,
  CHAVE_OUTRA, CHAVE_RAZOES, CHAVE_RISCO, CHAVE_SUGERE, COLUNAS_PARA_ESCOLHER,
  GRAUS_DA_LICAO, IDADE_DENTRO, IDADE_FORA, LEITURAS_DE_R, LEITURAS_DO_ACASO_DA_LICAO,
  LICOES_DA_CC_ES010, PARES, PAR_DO_MODULO_2, POPULACOES_DA_LICAO,
  PROVIDENCIAS_DA_LICAO, ROTULO_INCL_TODOS,
  rotuloDoCampo,
} from '../labs/metasDaCcEs010';
import { ABA_CALCULOS, ABA_RESPOSTAS, assinaturaDaBase } from '../labs/metasDaCcEs009';
import { COLETAS, NOME_DA_FORMA } from '../labs/amostraDoClube';
import type { ClassificacaoDaColeta } from '../labs/metasDaCcEs010';
import {
  CAMPO_DA_MEDIDA, CAMPO_DO_GRUPO, GRUPO_A, GRUPO_B, SORTEIOS_POR_VEZ,
} from '../labs/acasoEntreGrupos';
import { sortearEntreGrupos } from '../labs/analiseDeDados';
import { mostrarNumero } from '../labs/formulas';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * CC-ES010 — as dez lições, numa tela só.
 *
 * ── Duas telas, e a lição começa numa delas ──────────────────────────────
 * A planilha, que é o Excel de sempre, e o **caderno da análise**, que é da
 * plataforma e cujas peças moram em `labs/caderno.tsx`. É o arranjo do
 * `LaboratorioDaAnalise` da CC-ES009, e as peças do caderno saíram de lá
 * justamente para que as duas veredas vizinhas não tenham dois cadernos
 * ligeiramente diferentes.
 *
 * ── Três lições são tela da plataforma inteira ──────────────────────────
 * O módulo 1 classifica coletas, o 9 embaralha rótulos e o 10 declara um grau
 * de confiança. Não há botão de planilha nenhuma que faça essas três coisas, e
 * no caso do embaralho há mais: fazê-lo numa planilha é ordenar **só** a
 * coluna da chave, que é o gesto que a CC-ES003 existe para proibir. Elas
 * entram sem moldura de programa, e `imitaPrograma` fica falso — o aviso de
 * tela pequena fala de botões que encolhem, e aqui não há programa imitado
 * nenhum.
 *
 * ── A faixa é a mesma nas sete lições de planilha ───────────────────────
 * Todos os comandos, o tempo todo, porque é assim que um programa é. Uma faixa
 * que só mostrasse "Gráfico" na lição que o pede ensinaria a procurar o botão
 * que a tarefa quer, e não a procurar no programa. É a regra do Explorador da
 * CC-ES001.
 */

/* ── A moldura ────────────────────────────────────────────────────────────── */

type Comum = {
  vereda: Vereda;
  licao: { titulo: string; verificacoes: string[] };
  qual: LicaoDaCcEs010;
  metas: Meta[];
  contexto: ContextoDaEstatistica;
  mudar: (f: (c: ContextoDaEstatistica) => ContextoDaEstatistica) => void;
  desfazer: () => void;
  refazer: () => void;
  /*
    O que a pessoa viu, gravado **fora** do histórico, pelo motivo escrito na
    CC-ES009: a lição do módulo 8 manda filtrar e olhar a conta não se mover, e
    com a descoberta dentro do histórico o Ctrl+Z apagaria a única coisa que a
    tarefa mede.
  */
  anotarVisto: (o: string) => void;
  irPara: (t: ProgramaDaCcEs010) => void;
  recomecar: () => void;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
};

function Moldura({
  vereda, licao, metas, contexto, recomecar, programa, imitaPrograma, rodape, aviso,
  acoesExtra, aoVencer, aoSair, children,
}: Comum & {
  programa: string;
  imitaPrograma?: boolean;
  rodape?: number;
  aviso?: string;
  acoesExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [salvando, setSalvando] = useState(false);
  const tarefas = metas
    .filter(m => licao.verificacoes.includes(m.id))
    .map(m => ({
      id: m.id, titulo: m.titulo, detalhe: m.detalhe,
      onde: m.onde, passos: m.passos, feita: m.feita(contexto),
    }));
  const faltam = tarefas.filter(t => !t.feita).length;

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={licao.titulo}
      programa={programa}
      imitaPrograma={imitaPrograma}
      tarefas={tarefas}
      aviso={aviso}
      rodape={rodape}
      acoes={(
        <div className="flex flex-col gap-2">
          <button
            onClick={async () => { setSalvando(true); await aoVencer(); aoSair(); }}
            disabled={faltam > 0 || salvando}
            className="btn-primary text-sm w-full justify-center disabled:opacity-50"
          >
            {faltam === 0 ? 'Concluir a lição' : `Faltam ${faltam}`}
          </button>
          {acoesExtra}
          <button onClick={recomecar} className="btn-ghost text-sm w-full justify-center">
            <Undo2 className="w-4 h-4" /> Recomeçar
          </button>
        </div>
      )}
    >
      {children}
    </LaboratorioEmTelaCheia>
  );
}

const escreverTexto = (
  c: ContextoDaEstatistica, chave: string, valor: string,
): ContextoDaEstatistica => ({ ...c, textos: { ...c.textos, [chave]: valor } });

/*
  Quais lições têm trabalho no caderno, declarado numa tabela sobre a união.

  As sete de planilha têm todas — a interpretação do r, a coluna escondida, o
  risco da extrapolação, o pior ajuste, os três campos do par escolhido, o
  relato da exclusão —, e as três de plataforma **são** o caderno. Isso é
  verdade hoje e pode deixar de ser: a lição nova não compila até dizer, e um
  botão que abrisse uma folha em branco prometeria trabalho que ela não pede.
*/
const TEM_CADERNO: Record<LicaoDaCcEs010, boolean> = {
  amostra: true,
  correlacao: true,
  espuria: true,
  reta: true,
  prever: true,
  ajuste: true,
  escolhido: true,
  exclusao: true,
  acaso: true,
  confianca: true,
};

/* ── A planilha ───────────────────────────────────────────────────────────── */

const GUIAS_USAVEIS = ['Página Inicial', 'Inserir', 'Dados'] as const;

const NOME_DO_GRAFICO: Record<TipoDeGrafico, string> = {
  pizza: 'Pizza',
  colunas: 'Colunas',
  linha: 'Linhas',
  dispersao: 'Dispersão',
};

/*
  O que cada tipo responde, escrito por extenso.

  O programa explica a escolha em vez de só deixar a tarefa vermelha — é a
  decisão da CC-ES003 e da CC-ES009. O que ele não diz é qual é o certo para
  esta lição: com a resposta na tela, quatro tipos viram quatro tentativas.
*/
const O_QUE_O_GRAFICO_RESPONDE: Record<TipoDeGrafico, string> = {
  pizza: 'Repartição: de que o todo é feito. Só serve quando as partes somam o todo.',
  colunas: 'Comparação: qual é maior que qual.',
  linha: 'Evolução: como uma coisa mudou ao longo do tempo.',
  dispersao: 'Relação: se duas medidas andam juntas. Os dois eixos são medidas.',
};

/*
  A folha de Elementos do Gráfico.

  Ela veste superfície **clara** — o gráfico do Excel é branco —, e por isso
  diz a própria cor do texto: a plataforma pinta `legend` e rótulo com o cinza
  dela, medido contra o aplicativo escuro, e sobre branco ele some. É a conta
  do painel de tarefas claro, em `painelDoLaboratorio.test.ts`.
*/
const CSS_DOS_ELEMENTOS = `
.pl-elementos {
  display: flex; gap: 14px; flex-wrap: wrap;
  margin: 6px 10px 10px; padding: 6px 10px;
  border: 1px solid #D8D8D8; border-radius: 4px;
  background: #FFFFFF; color: #1A1A1A;
}
.pl-elementos legend { font-size: 11px; font-weight: 700; color: #1A1A1A; padding: 0 4px; }
.pl-elementos label {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: #1A1A1A; cursor: pointer;
}
`;

type Dialogo = {
  tipo: 'grafico';
  grafico: TipoDeGrafico;
  titulo: string;
  eixoX: string;
  eixoY: string;
};

function TelaDaPlanilha(c: Comum & { comCaderno: boolean }) {
  const cad = c.contexto.caderno;
  const p = planilhaAtiva(cad);
  const [guia, setGuia] = useState<string>('Página Inicial');
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);
  const [filtroAberto, setFiltroAberto] = useState<
    { coluna: number; x: number; y: number } | null
  >(null);
  const [aviso, setAviso] = useState('');

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 8000);
  };

  const mudarCaderno = (g: (k: Caderno) => Caderno) =>
    c.mudar(x => ({ ...x, caderno: g(x.caderno) }));

  /*
    Toda mudança da planilha passa por aqui, e é por isso que o aviso da base
    mexida também mora aqui: quem escreve pela **barra de fórmulas** não passa
    por `aoConfirmar` da grade, e foi a trava que clica da CC-ES009 quem
    descobriu isso do lado dela.

    As duas metas de "sem o atípico" do módulo 8 são conferidas contra a base
    como ela chegou, então mexer nela não é um detalhe: é o atalho que elas
    existem para recusar.
  */
  const mudar = (g: (q: Planilha) => Planilha) => {
    mudarCaderno(k => trocarAtiva(k, g(planilhaAtiva(k))));
    if (p.nome !== ABA_RESPOSTAS) return;
    if (assinaturaDaBase(g(p)) === assinaturaDaBase(p)) return;
    avisar('Você mexeu no dado da base. As contas desta vereda são conferidas contra a base como ela chegou — aperte Ctrl+Z. Para excluir um valor atípico da conta, a coluna auxiliar é o caminho, e ela não mexe no dado.');
  };

  const grade = useGradeDoExcel({
    planilha: p, mudar, desfazer: c.desfazer, refazer: c.refazer, avisar,
  });
  const { faixa, setFaixa, sel, setBarra, setEditando } = grade;

  const classificar = (crescente: boolean) => {
    if (!p.tabela) {
      avisar('Esta aba não tem uma tabela reconhecida para classificar.');
      return;
    }
    mudar(q => ordenar(q, sel.c, crescente));
    avisar('A linha inteira viajou junto — é isso que separa ordenar de filtrar, e é por isso que classificar não conta como mexer no dado.');
  };

  const abrirGrafico = () => {
    if (p.nome !== ABA_RESPOSTAS) {
      avisar(`Abra a aba ${ABA_RESPOSTAS} e selecione as duas colunas: o gráfico lê o dado, e não a conta.`);
      return;
    }
    /*
      A caixa abre com os três campos **vazios**, como a do Excel: ele nomeia a
      série pelo cabeçalho da faixa e não escreve título de eixo nenhum.
      Trazê-los prontos entregaria a tarefa dos eixos de graça, e ela existe
      porque gráfico sem eixo identificado não afirma nada.

      E ela **não** oferece a linha de tendência, porque a do Excel não
      oferece: ela mora em Elementos do Gráfico, no gráfico já desenhado. Posta
      aqui, daria dois caminhos para o mesmo gesto e deixaria marcar a reta de
      um gráfico que ainda não existe.
    */
    setDialogo({ tipo: 'grafico', grafico: 'colunas', titulo: '', eixoX: '', eixoY: '' });
  };

  const criarGrafico = (d: Dialogo) => {
    mudar(q => ({
      ...q,
      grafico: {
        tipo: d.grafico,
        titulo: d.titulo,
        eixoX: d.eixoX,
        eixoY: d.eixoY,
        faixa,
      },
    }));
    setDialogo(null);
    if (d.grafico !== 'dispersao') {
      avisar(`${NOME_DO_GRAFICO[d.grafico]} — ${O_QUE_O_GRAFICO_RESPONDE[d.grafico]}`);
    }
  };

  /* ── O filtro ── */

  const valoresDaColuna = (coluna: number): string[] => {
    if (!p.tabela) return [];
    const n = normalizar(p.tabela);
    const vistos: string[] = [];
    for (let l = n.topo + 1; l <= n.base; l++) {
      const t = escritoEm(p, l, coluna);
      if (t !== '' && !vistos.includes(t)) vistos.push(t);
    }
    return vistos.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  };

  const quantasSobraram = (): number | null => {
    if (!p.filtro || !p.tabela || p.filtro.valor === '') return null;
    const n = normalizar(p.tabela);
    let quantas = 0;
    for (let l = n.topo + 1; l <= n.base; l++) {
      if (escritoEm(p, l, p.filtro.coluna) === p.filtro.valor) quantas += 1;
    }
    return quantas;
  };

  const filtrar = (coluna: number, valor: string) => {
    mudar(q => ({ ...q, filtro: { coluna, valor } }));
    setFiltroAberto(null);
    if (valor === '' || p.nome !== ABA_RESPOSTAS || !p.tabela) return;

    /*
      A descoberta sai de **esconder linha** e a conta não se mover, que é o
      primeiro jeito que todo mundo tenta. Ela exige que alguma linha tenha de
      fato sumido: um filtro que não esconde ninguém não demonstra nada, e é
      "zero link não é zero link quebrado" aplicado a um filtro.
    */
    const n = normalizar(p.tabela);
    const total = n.base - n.topo;
    let visiveis = 0;
    for (let l = n.topo + 1; l <= n.base; l++) {
      if (escritoEm(p, l, coluna) === valor) visiveis += 1;
    }
    if (visiveis >= total) return;
    c.anotarVisto('esconder-nao-exclui');
    avisar(`O filtro escondeu ${total - visiveis} de ${total} linhas. Volte à aba ${ABA_CALCULOS} e olhe a "${ROTULO_INCL_TODOS}": o número não se moveu. Filtro é de tela — a linha escondida continua na conta.`);
  };

  const botao = (dica: string, aoClicar: () => void, filho: React.ReactNode, ativo?: boolean) => (
    <BotaoDoExcel dica={dica} aoClicar={aoClicar} ativo={ativo}>{filho}</BotaoDoExcel>
  );

  const sobraram = quantasSobraram();

  return (
    <Moldura
      {...c}
      programa="excel"
      aviso={aviso}
      rodape={28}
      acoesExtra={c.comCaderno ? (
        <button onClick={() => c.irPara('plataforma')} className="btn-secondary text-sm w-full justify-center">
          <NotebookPen className="w-4 h-4" /> Abrir o caderno da análise
        </button>
      ) : undefined}
    >
      <style>{CSS_EXCEL}</style>
      <style>{CSS_DOS_ELEMENTOS}</style>

      <div className="pl-janela">
        <BarraDeTituloDoExcel arquivo="Acampamento 2026 — estatística" aoAvisar={avisar} />
        <GuiasDoExcel atual={guia} usaveis={GUIAS_USAVEIS} aoTrocar={setGuia} aoAvisar={avisar} />

        <div className="pl-faixa">
          {guia === 'Página Inicial' && (
            <>
              <GrupoDoExcel nome="Desfazer">
                {botao('Desfazer (Ctrl+Z)', grade.desfazer, <Undo2 className="w-4 h-4" />)}
                {botao('Refazer (Ctrl+Y)', grade.refazer, <Redo2 className="w-4 h-4" />)}
              </GrupoDoExcel>
              <GrupoDoExcel nome="Edição">
                {botao('AutoSoma', () => {
                  setBarra(`=SOMA(${nomeDaFaixa({ l1: 1, c1: sel.c, l2: Math.max(1, sel.l - 1), c2: sel.c })})`);
                  setEditando('celula');
                }, <Sigma className="w-4 h-4" />)}
              </GrupoDoExcel>
            </>
          )}
          {guia === 'Inserir' && (
            <GrupoDoExcel nome="Gráficos">
              {botao('Inserir Gráfico', abrirGrafico, (
                <span className="flex flex-col items-center">
                  <BarChart3 className="w-4 h-4" />
                  <span style={{ fontSize: 9 }}>Gráfico</span>
                </span>
              ))}
            </GrupoDoExcel>
          )}
          {guia === 'Dados' && (
            <GrupoDoExcel nome="Classificar e Filtrar">
              {botao('Classificar de A a Z', () => classificar(true), <ArrowDownAZ className="w-4 h-4" />)}
              {botao('Classificar de Z a A', () => classificar(false), <ArrowUpZA className="w-4 h-4" />)}
              {botao('Filtro', () => {
                if (!p.tabela) { avisar('Esta aba não tem uma tabela reconhecida para filtrar.'); return; }
                mudar(q => ({ ...q, filtro: q.filtro ? null : { coluna: sel.c, valor: '' } }));
              }, <Grid3x3 className="w-4 h-4" />, Boolean(p.filtro))}
            </GrupoDoExcel>
          )}
        </div>

        <BarraDeFormulas nome={nomeDaFaixa(faixa)} props={grade.propsDaBarra} />

        <GradeDoExcel
          {...grade.props}
          caderno={cad}
          aoArrastarBorda={grade.aoArrastarBorda}
          aoAjustarAoConteudo={grade.aoAjustarAoConteudo}
          aoComecarPreenchimento={grade.aoComecarPreenchimento}
          aoAbrirFiltro={p.filtro ? (col => {
            const alvo = grade.gradeRef.current?.querySelectorAll('.pl-cab-col')[col]?.getBoundingClientRect();
            setFiltroAberto({ coluna: col, x: alvo?.left ?? 80, y: (alvo?.bottom ?? 120) + 2 });
          }) : undefined}
        />

        {p.grafico && (
          <div className="pl-grafico" role="figure" aria-label={`Gráfico: ${p.grafico.titulo}`}>
            <div className="pl-grafico-titulo">{p.grafico.titulo || '(sem título)'}</div>
            <DesenhoDoGrafico tipo={p.grafico.tipo} pontos={pontosDoGrafico(p)}
              pares={pontosDaDispersao(p)} tendencia={p.grafico.tendencia}
              equacao={p.grafico.equacao} />
            <div className="pl-grafico-eixo">
              {p.grafico.eixoX || '(eixo sem nome)'} × {p.grafico.eixoY || '(eixo sem nome)'}
            </div>
            {/*
              Elementos do Gráfico, e são **duas** caixas: no Excel dá para ver
              a reta e nunca ler a equação dela, que é o que quase todo mundo
              faz. Uma caixa só apagaria uma das duas metades do requisito 5.3.

              Ele vive **no gráfico**, e não na caixa de inserir, porque é onde
              o Excel o põe: a linha de tendência é um elemento de um gráfico
              que já existe. E ele muda o gráfico no lugar, em vez de refazê-lo
              — refazendo, o título e os eixos que a lição entregou sumiriam.
            */}
            <fieldset className="pl-elementos">
              <legend>Elementos do Gráfico</legend>
              <label>
                <input
                  type="checkbox" aria-label="Linha de Tendência"
                  checked={Boolean(p.grafico.tendencia)}
                  onChange={e => mudar(q => (q.grafico ? {
                    ...q,
                    grafico: { ...q.grafico, tendencia: e.target.checked || undefined },
                  } : q))}
                />
                Linha de Tendência
              </label>
              <label>
                <input
                  type="checkbox" aria-label="Exibir Equação no gráfico"
                  checked={Boolean(p.grafico.equacao)}
                  onChange={e => mudar(q => (q.grafico ? {
                    ...q,
                    grafico: { ...q.grafico, equacao: e.target.checked || undefined },
                  } : q))}
                />
                Exibir Equação no gráfico
              </label>
            </fieldset>
          </div>
        )}

        <AbasDoExcel
          nomes={cad.planilhas.map(q => q.nome)} ativa={cad.ativa} aoAvisar={avisar}
          aoTrocar={i => {
            mudarCaderno(k => ({ ...k, ativa: i }));
            setFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 });
            setEditando(null);
            setBarra('');
          }}
        />

        {/* A régua conta o que o filtro deixou à vista, como a do Excel. Ela
            relata o número, e nunca o que ele significa. */}
        <div className="pl-status">
          <span>Pronto</span>
          {sobraram !== null && (
            <span style={{ marginLeft: 12 }}>
              {sobraram} de {(p.tabela ? normalizar(p.tabela).base - normalizar(p.tabela).topo : 0)} registros encontrados
            </span>
          )}
          <span style={{ marginLeft: 'auto' }}>{nomeDaFaixa(faixa)}</span>
        </div>
      </div>

      {filtroAberto && (
        <>
          <div className="pl-veu" onPointerDown={() => setFiltroAberto(null)} />
          <div className="pl-filtro-lista" style={{ left: filtroAberto.x, top: filtroAberto.y }} role="listbox">
            <button type="button" className="pl-filtro-item" aria-current={!p.filtro?.valor}
              onClick={() => filtrar(filtroAberto.coluna, '')}>
              (Todas)
            </button>
            {valoresDaColuna(filtroAberto.coluna).map(v => (
              <button key={v} type="button" className="pl-filtro-item"
                aria-current={p.filtro?.coluna === filtroAberto.coluna && p.filtro.valor === v}
                onClick={() => filtrar(filtroAberto.coluna, v)}>
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
                <span>Título</span>
                <input value={dialogo.titulo}
                  onChange={e => setDialogo({ ...dialogo, titulo: e.target.value })} />
              </label>
              <label className="pl-campo">
                <span>Eixo horizontal</span>
                <input value={dialogo.eixoX}
                  onChange={e => setDialogo({ ...dialogo, eixoX: e.target.value })} />
              </label>
              <label className="pl-campo">
                <span>Eixo vertical</span>
                <input value={dialogo.eixoY}
                  onChange={e => setDialogo({ ...dialogo, eixoY: e.target.value })} />
              </label>
            </div>
            <div className="pl-dialogo-pe">
              <button type="button" className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Cancelar</button>
              <button type="button" className="pl-dialogo-bt pl-dialogo-bt-ok"
                onClick={() => criarGrafico(dialogo)}>OK</button>
            </div>
          </div>
        </>
      )}
    </Moldura>
  );
}

/* ── O caderno ────────────────────────────────────────────────────────────── */

const CLASSIFICACOES: { id: ClassificacaoDaColeta; rotulo: string }[] = [
  ...(Object.entries(NOME_DA_FORMA) as [ClassificacaoDaColeta, string][])
    .map(([id, rotulo]) => ({ id, rotulo })),
  { id: 'honesta', rotulo: 'Não torceu a amostra' },
];

const opcoesDeCampo = (ids: readonly string[]) =>
  ids.map(id => ({ id, rotulo: rotuloDoCampo(id) }));

const opcoesDePar = PARES.map(par => ({ id: par.id, rotulo: par.rotulo }));

function TelaDoCaderno(c: Comum) {
  const x = c.contexto;
  const escrever = (chave: string) => (t: string) => c.mudar(k => escreverTexto(k, chave, t));

  /*
    O embaralho faz uma **leva** por clique, e não um sorteio.

    Ver um embaralho chegar na diferença real diz tanto quanto ver um não
    chegar: o que a lição mostra é uma frequência. E o `Math.random` daqui é o
    certo — é a trava que não pode depender de sorte, e ela injeta o sorteio
    dela pelo parâmetro que `sortearEntreGrupos` tem para isso.
  */
  const embaralhar = () => c.mudar((k) => {
    const { sorteadas } = sortearEntreGrupos(
      k.base, CAMPO_DO_GRUPO, CAMPO_DA_MEDIDA, GRUPO_A, GRUPO_B, SORTEIOS_POR_VEZ,
    );
    return { ...k, sorteios: [...k.sorteios, ...sorteadas] };
  });

  const real = x.sorteios.length > 0
    ? sortearEntreGrupos(x.base, CAMPO_DO_GRUPO, CAMPO_DA_MEDIDA, GRUPO_A, GRUPO_B, 0).real
    : 0;
  const alcancaram = x.sorteios.filter(d => d >= real - 1e-9).length;

  const cartoes = () => {
    switch (c.qual) {
      case 'amostra':
        return (
          <>
            <Cartao
              titulo="De quem esta base fala"
              abaixo="Quarenta e oito pessoas responderam. De que grupo elas são amostra?"
            >
              <Escolha
                opcoes={POPULACOES_DA_LICAO.map(p => ({ id: p.id, rotulo: p.rotulo }))}
                escolhida={x.populacao}
                aoEscolher={id => c.mudar(k => ({ ...k, populacao: id }))}
                porque={x.populacao
                  ? POPULACOES_DA_LICAO.find(p => p.id === x.populacao)?.porque ?? null
                  : null}
              />
            </Cartao>

            {COLETAS.map(coleta => (
              <Cartao key={coleta.id} titulo="Como esta coleta aconteceu" abaixo={coleta.descricao}>
                <Escolha
                  opcoes={CLASSIFICACOES}
                  escolhida={x.classificacoes[coleta.id]}
                  aoEscolher={id => c.mudar(k => ({
                    ...k, classificacoes: { ...k.classificacoes, [coleta.id]: id },
                  }))}
                  /*
                    Quem fica de fora aparece **depois** da classificação, e
                    nunca antes: dito antes, a classificação vira leitura.
                  */
                  porque={x.classificacoes[coleta.id] ? coleta.quemFicaDeFora : null}
                />
              </Cartao>
            ))}
          </>
        );

      case 'correlacao':
        return (
          <Cartao
            titulo="O que esse valor de r diz"
            abaixo="Calcular é metade do requisito 5.2. A outra é interpretar."
          >
            <Escolha
              opcoes={LEITURAS_DE_R.map(l => ({ id: l.id, rotulo: l.frase }))}
              escolhida={x.leituraDeR}
              aoEscolher={id => c.mudar(k => ({ ...k, leituraDeR: id }))}
            />
          </Cartao>
        );

      case 'espuria':
        return (
          <>
            <Cartao
              titulo="Qual dos três pares não tem uma coisa mexendo na outra"
              abaixo="Os três r estão calculados na aba Cálculos. Compare-os."
            >
              <Escolha
                opcoes={opcoesDePar}
                escolhida={x.parApontado}
                aoEscolher={id => c.mudar(k => ({ ...k, parApontado: id }))}
              />
            </Cartao>
            <Cartao
              titulo="E que coluna explica os dois lados dele"
              abaixo="Ela está na base, e você já a usou nas duas outras correlações."
            >
              <Escolha
                opcoes={opcoesDeCampo(CANDIDATAS_A_ESCONDIDA)}
                escolhida={x.colunaEscondida}
                aoEscolher={id => c.mudar(k => ({ ...k, colunaEscondida: id }))}
              />
            </Cartao>
          </>
        );

      case 'reta':
        return (
          <Cartao
            titulo="Qual das duas explica a outra"
            abaixo="A reta recebe o que se explica primeiro, e trocá-las devolve outra reta com a mesma cara."
          >
            <Escolha
              opcoes={opcoesDeCampo([PAR_DO_MODULO_2.x, PAR_DO_MODULO_2.y])}
              escolhida={x.independente}
              aoEscolher={id => c.mudar(k => ({ ...k, independente: id }))}
            />
          </Cartao>
        );

      case 'prever':
        return (
          <Cartao
            titulo="O risco de prever fora do intervalo observado"
            abaixo={`A base vai de dez a quinze anos. Você previu para ${IDADE_DENTRO} e para ${IDADE_FORA}.`}
          >
            <CampoLongo
              rotulo="Por que a segunda previsão não vale"
              ajuda="Com o número que a reta devolveu, e com o intervalo em que os dados estão."
              valor={x.textos[CHAVE_RISCO] ?? ''}
              minimo={60}
              aoEscrever={escrever(CHAVE_RISCO)}
            />
          </Cartao>
        );

      case 'ajuste':
        return (
          <Cartao
            titulo="Onde a reta descreve pior"
            abaixo="Os três r² estão na aba Cálculos. O menor deles é o par em que a reta menos explica."
          >
            <Escolha
              opcoes={opcoesDePar}
              escolhida={x.piorAjuste}
              aoEscolher={id => c.mudar(k => ({ ...k, piorAjuste: id }))}
            />
          </Cartao>
        );

      case 'escolhido':
        return (
          <>
            <Cartao
              titulo="A relação que você quis olhar"
              abaixo="Escolha duas colunas. Pode ser um par que as lições anteriores não usaram."
            >
              {/*
                Os dois eixos são duas fileiras das **mesmas** quatro colunas, e
                sem grupo nomeado elas são oito botões com quatro nomes
                repetidos: quem navega por leitor de tela ouve "Idade" duas
                vezes e não tem como saber qual é qual. O rótulo do grupo é o
                que separa as duas perguntas.
              */}
              <div className="grid sm:grid-cols-2 gap-3">
                {([['x', 'No eixo horizontal'], ['y', 'No eixo vertical']] as const)
                  .map(([eixo, rotulo]) => (
                    <div key={eixo} role="group" aria-label={rotulo}>
                      <p className="text-sm font-semibold mb-1.5">{rotulo}</p>
                      <Escolha
                        opcoes={opcoesDeCampo(COLUNAS_PARA_ESCOLHER)}
                        escolhida={x.parEscolhido?.[eixo]}
                        aoEscolher={id => c.mudar(k => ({
                          ...k,
                          parEscolhido: {
                            x: eixo === 'x' ? id : k.parEscolhido?.x ?? '',
                            y: eixo === 'y' ? id : k.parEscolhido?.y ?? '',
                          },
                        }))}
                      />
                    </div>
                  ))}
              </div>
            </Cartao>
            <Cartao titulo="O que a relação sugere" abaixo="Com o r que você calculou.">
              <CampoLongo
                rotulo="O que esse número está sugerindo"
                valor={x.textos[CHAVE_SUGERE] ?? ''} minimo={60}
                aoEscrever={escrever(CHAVE_SUGERE)}
              />
            </Cartao>
            <Cartao
              titulo="Outra explicação possível para o mesmo padrão"
              abaixo="O mesmo padrão quase sempre aceita mais de uma história."
            >
              <CampoLongo
                rotulo="Uma história que não seja 'uma causa a outra'"
                valor={x.textos[CHAVE_OUTRA] ?? ''} minimo={60}
                aoEscrever={escrever(CHAVE_OUTRA)}
              />
            </Cartao>
            <Cartao
              titulo="Que dado a mais decidiria entre as duas"
              abaixo="Duas explicações para o mesmo padrão não se resolvem discutindo."
            >
              <CampoLongo
                rotulo="O número que faltaria para saber qual das duas é"
                valor={x.textos[CHAVE_DADO] ?? ''} minimo={60}
                aoEscrever={escrever(CHAVE_DADO)}
              />
            </Cartao>
          </>
        );

      case 'exclusao':
        return (
          <Cartao
            titulo="O efeito da exclusão sobre a conclusão"
            abaixo="Olhe os quatro números da aba Cálculos: as duas inclinações e os dois r²."
          >
            <CampoLongo
              rotulo="O que a exclusão fez"
              ajuda="Se a conclusão mudou, e o quanto — com os números."
              valor={x.textos[CHAVE_EFEITO] ?? ''} minimo={60}
              aoEscrever={escrever(CHAVE_EFEITO)}
            />
          </Cartao>
        );

      case 'acaso':
        return (
          <>
            <Cartao
              titulo={`${GRUPO_A} e ${GRUPO_B}, com os rótulos embaralhados`}
              abaixo="Nada muda na base: os números continuam os mesmos, e só quem é de qual unidade é sorteado de novo."
            >
              <button type="button" onClick={embaralhar} className="btn-primary text-sm">
                <Shuffle className="w-4 h-4" /> Embaralhar {SORTEIOS_POR_VEZ} vezes
              </button>
              {x.sorteios.length > 0 && (
                <div className="mt-3 text-sm flex flex-col gap-1">
                  <p>
                    Diferença de verdade: <strong>{mostrarNumero(real)}</strong>
                    {' '}acampamentos.
                  </p>
                  <p>
                    {x.sorteios.length} embaralhos, e{' '}
                    <strong>{alcancaram}</strong> chegaram a uma diferença deste tamanho ou maior.
                  </p>
                  {/*
                    A fileira mostra as últimas, porque é olhando os números
                    saírem que se vê o acaso alcançar. A plataforma não escreve
                    a conclusão: ela mostra o que saiu.
                  */}
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Últimas: {x.sorteios.slice(-12).map(d => mostrarNumero(d)).join(' · ')}
                  </p>
                </div>
              )}
            </Cartao>

            <Cartao titulo="O que esse resultado significa" abaixo="Três das quatro frases respondem a outra pergunta.">
              <Escolha
                opcoes={LEITURAS_DO_ACASO_DA_LICAO.map(l => ({ id: l.id, rotulo: l.frase }))}
                escolhida={x.leituraDoAcaso}
                aoEscolher={id => c.mudar(k => ({ ...k, leituraDoAcaso: id }))}
                porque={x.leituraDoAcaso
                  ? LEITURAS_DO_ACASO_DA_LICAO.find(l => l.id === x.leituraDoAcaso)?.porque ?? null
                  : null}
              />
            </Cartao>

            <Cartao
              titulo="Por que uma diferença entre dois grupos pode ser do acaso"
              abaixo="Com as suas palavras, e com o número que você obteve."
            >
              <CampoLongo
                rotulo="A sua explicação"
                valor={x.textos[CHAVE_ACASO] ?? ''} minimo={60}
                aoEscrever={escrever(CHAVE_ACASO)}
              />
            </Cartao>

            <Cartao
              titulo="Três providências que aumentariam a confiança"
              abaixo="São sete, e quatro delas só parecem aumentar. Nenhuma das quatro é bobagem."
            >
              <EscolhaMultipla
                opcoes={PROVIDENCIAS_DA_LICAO.map(pr => ({ id: pr.id, rotulo: pr.frase }))}
                marcadas={x.providencias}
                aoAlternar={id => c.mudar(k => ({
                  ...k,
                  providencias: k.providencias.includes(id)
                    ? k.providencias.filter(o => o !== id)
                    : [...k.providencias, id],
                }))}
              />
              {/*
                O porquê de cada uma aparece **depois** de marcada, e só das
                marcadas: a lista inteira explicada seria a resposta na tela.
              */}
              {x.providencias.length > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                  {PROVIDENCIAS_DA_LICAO.filter(pr => x.providencias.includes(pr.id)).map(pr => (
                    <p key={pr.id} className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      <strong>{pr.frase}</strong> {pr.porque}
                    </p>
                  ))}
                </div>
              )}
            </Cartao>
          </>
        );

      case 'confianca':
        return (
          <>
            {ACHADOS_DA_LICAO.map(achado => (
              <Cartao key={achado.id} titulo={achado.deOnde} abaixo={achado.frase}>
                <Escolha
                  opcoes={[
                    { id: 'sustenta' as const, rotulo: 'Sustenta a conclusão' },
                    { id: 'limita' as const, rotulo: 'Limita a conclusão' },
                  ]}
                  escolhida={x.pesos[achado.id]}
                  aoEscolher={id => c.mudar(k => ({
                    ...k, pesos: { ...k.pesos, [achado.id]: id },
                  }))}
                  porque={x.pesos[achado.id] ? achado.porque : null}
                />
              </Cartao>
            ))}

            <Cartao
              titulo="O grau de confiança que você deposita na conclusão"
              abaixo="Cada um diz a que ele compromete você. Dois dos quatro esta análise não sustenta."
            >
              <Escolha
                opcoes={GRAUS_DA_LICAO.map(g => ({
                  id: g.id, rotulo: g.rotulo, abaixo: g.compromisso,
                }))}
                escolhida={x.grau}
                aoEscolher={id => c.mudar(k => ({ ...k, grau: id }))}
              />
            </Cartao>

            <Cartao titulo="As razões dessa avaliação" abaixo="O que sustenta, o que limita, e por que o grau é esse.">
              <CampoLongo
                rotulo="As suas razões"
                valor={x.textos[CHAVE_RAZOES] ?? ''} minimo={60}
                aoEscrever={escrever(CHAVE_RAZOES)}
              />
            </Cartao>
          </>
        );

      default: {
        const nunca: never = c.qual;
        return nunca;
      }
    }
  };

  const daPlanilha = LICOES_DA_CC_ES010[c.qual].programa === 'planilha';

  return (
    <Moldura
      {...c}
      programa="caderno-da-estatistica"
      /*
        O caderno não imita programa nenhum, e isso vale **sempre** — inclusive
        quando se chega nele a partir de uma lição de planilha.

        O aviso de tela pequena diz, com todas as letras, que o laboratório
        imita um programa de computador e que no celular os botões encolhem.
        Aqui a frase é falsa: são cartões, escolhas e campos de texto, que
        funcionam perfeitamente no telefone. Deixá-lo ligado mandaria a pessoa
        procurar um computador para uma tela que não precisa de um. É a conta
        do módulo 8 da CC-ES008, e a janela do Excel continua avisando do lado
        dela, onde a frase é verdadeira.
      */
      imitaPrograma={false}
      acoesExtra={daPlanilha ? (
        <button onClick={() => c.irPara('planilha')} className="btn-secondary text-sm w-full justify-center">
          <Table2 className="w-4 h-4" /> Voltar à planilha
        </button>
      ) : undefined}
    >
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-4 p-4">
        {cartoes()}
      </div>
    </Moldura>
  );
}

/* ── O despacho ───────────────────────────────────────────────────────────── */

export default function LaboratorioDaEstatistica({ vereda, licao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'estatistica' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const daLicao = LICOES_DA_CC_ES010[licao.licao];
  const [hist, setHist] = useState<Historico<ContextoDaEstatistica>>(
    () => historicoDe(daLicao.inicial()),
  );
  const [tela, setTela] = useState<ProgramaDaCcEs010>(daLicao.programa);

  /*
    Desfazer e refazer andam com a **pasta**, e não com o que a pessoa viu.

    A descoberta do filtro é monotônica — o que se viu, viu-se —, e levá-la
    junto faria o Ctrl+Z apagar a única coisa que a primeira meta do módulo 8
    mede. É a conta que a CC-ES009 pagou para aprender, com a trava que clica.
  */
  const andarNoHistorico = (
    passo: (h: Historico<ContextoDaEstatistica>) => Historico<ContextoDaEstatistica>,
  ) => setHist((h) => {
    const depois = passo(h);
    const vistas = h.presente.descobertas.filter(o => !depois.presente.descobertas.includes(o));
    return vistas.length === 0 ? depois : {
      ...depois,
      presente: {
        ...depois.presente,
        descobertas: [...depois.presente.descobertas, ...vistas],
      },
    };
  });

  const comum: Comum = {
    vereda,
    licao,
    qual: licao.licao,
    metas: daLicao.metas,
    contexto: hist.presente,
    mudar: f => setHist(h => registrar(h, f(h.presente))),
    desfazer: () => andarNoHistorico(desfazer),
    refazer: () => andarNoHistorico(refazer),
    anotarVisto: o => setHist(h => (h.presente.descobertas.includes(o) ? h : {
      ...h,
      presente: { ...h.presente, descobertas: [...h.presente.descobertas, o] },
    })),
    irPara: setTela,
    recomecar: () => { setHist(historicoDe(daLicao.inicial())); setTela(daLicao.programa); },
    aoVencer,
    aoSair,
  };

  /*
    O `switch` é exaustivo, com `never` no `default`: uma terceira tela não
    compila até alguém dizer o que ela desenha.
  */
  switch (tela) {
    case 'planilha':
      return <TelaDaPlanilha {...comum} comCaderno={TEM_CADERNO[licao.licao]} />;
    case 'plataforma':
      return <TelaDoCaderno {...comum} />;
    default: {
      const nunca: never = tela;
      return nunca;
    }
  }
}
