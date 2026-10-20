import { useState } from 'react';
import {
  Bold, ArrowDownAZ, ArrowUpZA, RefreshCw, Rows3, Columns3, Table2, PieChart,
  Sigma, Undo2, Redo2, Trash2, Save, Sheet, FileText,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_EXCEL, BarraDeFormulas, AbasDoExcel, BarraDeTituloDoExcel, GuiasDoExcel, GrupoDoExcel, BotaoDoExcel, GradeDoExcel,
} from '../labs/excel';
import { useGradeDoExcel } from '../labs/gradeDoExcel';
import {
  BlocoDeNotas, BarraDeTarefas, CSS_DO_BLOCO_DE_NOTAS,
  type ProgramaAberto, type ProgramaNaBarra,
} from '../labs/blocoDeNotas';
import {
  CSS_DO_CONSTRUTOR, TopoDoConstrutor, CorpoDoConstrutor, CartaoDeCabecalho,
  CartaoDoConstrutor, SeletorDeTipo, ListaDeOpcoes, PeDoCartao, ItemDoMenu,
  ColunaDeAcrescentar, BarraDeRespostas, TabelaDeRespostas, PreviaDoFormulario,
  DialogoDoConstrutor, AvisoDoConstrutor, BotaoDoConstrutor, IconeDoTipo,
  type AbaDoConstrutor,
} from '../labs/construtorDeFormularios';
import {
  type Caderno, type Historico, type Planilha, type TabelaDinamica,
  atualizarResumo, excluirColuna, excluirLinha, historicoDe, naFaixa, nomeDaFaixa,
  normalizar, ordenar, planilhaAtiva, registrar, desfazer, refazer, textoDoResumo,
  trocarAtiva, NOME_DO_RESUMO, ROTULO_VAZIO, type ComoResumir,
} from '../labs/planilha';
import { abaDe, comAba } from '../labs/cadernoDoClube';
import {
  type Campo, type TipoDeValidacao, type Validacao,
  NOME_DO_TIPO, UNIDADES, cabecalhoDe, comCampo, comCampos, enviar,
  linhasDe, recusas as recusasDe, respostasReais, temOpcoes, validacaoVale,
} from '../labs/formulario';
import {
  type ContextoDeDados, type LicaoDaCcEs008, type Meta, type ProgramaDaCcEs008,
  ABA_RELATORIO, ABA_RESPOSTAS, ABRIU_O_CSV, CUIDADOS, LICOES_DA_CC_ES008, NOME_DO_CSV,
  VIU_AS_ASPAS, VIU_A_RECUSA, VIU_GRUPOS_DEMAIS, VIU_O_GRUPO_VAZIO,
  csvDaBase,
} from '../labs/metasDaCcEs008';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * CC-ES008 — as oito lições, numa tela só.
 *
 * ── Um componente, quatro telas ──────────────────────────────────────────
 * É o arranjo do `LaboratorioDeComunicacao` da CC-ES007 e do
 * `LaboratorioDeContas` da CC-ES005, pelo motivo escrito nos dois: o que se
 * repete entre as lições não é a janela, é a **moldura** — a lista de tarefas,
 * o Recomeçar, o Concluir, o passo a passo de quem trava. O `switch` é
 * exaustivo com `never` no `default`.
 *
 * ── `programa` é onde a lição **começa**, e `tela` é onde se está ─────────
 * As duas coisas são diferentes aqui, e é o módulo 6 que as separa: ele começa
 * na planilha, exporta o CSV e termina no editor de texto, que é onde se vê o
 * que o arquivo de fato é. Um campo só diria que a lição acontece num programa
 * e ficaria mentindo na metade dela.
 *
 * ── O contexto é um só ───────────────────────────────────────────────────
 * O formulário, a pasta de trabalho, o que foi exportado e o que a pessoa viu
 * viajam juntos, porque o trabalho é um só: o formulário coleta, a planilha
 * arruma, o arquivo sai. Separá-los obrigaria cada lição a escolher um
 * programa e ficar nele, que não é como um clube trabalha — é a decisão da
 * CC-ES007, e não a da CC-ES005.
 *
 * ── E o que a pessoa viu se registra na hora em que acontece ─────────────
 * Ver o formulário recusar, ver o resumo relatar dez unidades onde há seis,
 * ver a aspa em volta da resposta: nenhuma das três deixa marca, e todas são o
 * que o requisito manda demonstrar. Elas não saem de um botão "eu vi" — saem
 * do estado, no instante em que ele existe, que é a decisão do selo que vira
 * "não confere" no laboratório de PDF da CC-ES004.
 */

/* ── A moldura ────────────────────────────────────────────────────────────── */

type Comum = {
  vereda: Vereda;
  licao: { titulo: string; verificacoes: string[] };
  metas: Meta[];
  contexto: ContextoDeDados;
  mudar: (f: (c: ContextoDeDados) => ContextoDeDados) => void;
  /*
    Desfazer e refazer são do laboratório inteiro, e não da pasta: o formulário
    e a planilha viajam no mesmo contexto, e é ele que o histórico guarda. Um
    histórico por programa faria o Ctrl+Z da planilha não alcançar o que a
    lição mudou no formulário dois passos atrás.
  */
  desfazer: () => void;
  refazer: () => void;
  irPara: (t: ProgramaDaCcEs008) => void;
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

const anotar = (c: ContextoDeDados, o: string): ContextoDeDados =>
  c.descobertas.includes(o) ? c : { ...c, descobertas: [...c.descobertas, o] };

/* ── Tela 1: o construtor de formulários ──────────────────────────────────── */

const TIPOS_DE_VALIDACAO: Record<TipoDeValidacao, string> = {
  email: 'É um endereço de e-mail',
  telefone: 'É um telefone',
  'numero-entre': 'É um número entre',
  'tamanho-maximo': 'Tem no máximo … caracteres',
};

function TelaDoFormulario(c: Comum) {
  const f = c.contexto.formulario;
  const [aba, setAba] = useState<AbaDoConstrutor>('perguntas');
  const [ativo, setAtivo] = useState<string | null>(f.campos[0]?.id ?? null);
  const [menuTipo, setMenuTipo] = useState<string | null>(null);
  const [menuMais, setMenuMais] = useState<string | null>(null);
  const [regra, setRegra] = useState<{ campoId: string; v: Validacao } | null>(null);
  const [previa, setPrevia] = useState<Record<string, string> | null>(null);
  const [recusado, setRecusado] = useState<string[]>([]);
  const [aviso, setAviso] = useState('');

  const mudarCampo = (id: string, g: (x: Campo) => Campo) =>
    c.mudar(x => ({ ...x, formulario: comCampo(x.formulario, id, g) }));

  /*
    Trocar o tipo para um que tem opções semeia a primeira, como o Forms faz.
    Um menu de lista suspensa sem nenhuma opção é uma pergunta que não se pode
    responder, e quem escolhesse o tipo veria um cartão que não mudou nada.
  */
  const trocarTipo = (campo: Campo, tipo: Campo['tipo']) => {
    mudarCampo(campo.id, x => ({
      ...x,
      tipo,
      opcoes: temOpcoes(tipo) ? (x.opcoes?.length ? x.opcoes : ['Opção 1']) : x.opcoes,
    }));
    setMenuTipo(null);
  };

  const enviarPrevia = () => {
    if (!previa) return;
    const ruins = recusasDe(f, previa);
    if (ruins.length) {
      setRecusado(ruins);
      /* A recusa vista é uma das três descobertas, e ela não deixa marca:
         quem a vê corrige em seguida, e o formulário volta a aceitar. */
      c.mudar(x => anotar(x, VIU_A_RECUSA));
      return;
    }
    const comNova = enviar(f, previa);
    if (!comNova) return;
    c.mudar(x => ({ ...x, formulario: comNova }));
    setPrevia(null);
    setRecusado([]);
    setAviso('A resposta entrou. A contagem da aba Respostas subiu.');
  };

  return (
    <Moldura {...c} programa="formulario-na-web" aviso={aviso}>
      <style>{CSS_DO_CONSTRUTOR}</style>
      <div className="fb-janela">
        <TopoDoConstrutor
          nome={f.titulo}
          aba={aba}
          aoTrocarAba={setAba}
          respostas={respostasReais(f).length}
          aoPrever={() => { setPrevia({}); setRecusado([]); }}
        />

        {/*
          Nem "Criar planilha" nem "Baixar .csv" aparecem aqui, e é a regra do
          `aoBuscar` do Explorador: os dois existem no programa de verdade, e
          nestas duas lições não levam a lugar nenhum — a pasta do clube é a
          que a lição seguinte abre, e a exportação é o módulo 6, na planilha.
          Botão que aparece sem ter o que fazer ensina a desconfiar do programa.
        */}
        {aba === 'perguntas' ? (
          <CorpoDoConstrutor>
            <CartaoDeCabecalho titulo={f.titulo} descricao={f.descricao} />
            {f.campos.map(campo => (
              <CartaoDoConstrutor
                key={campo.id} ativo={ativo === campo.id}
                aoAtivar={() => { setAtivo(campo.id); setMenuTipo(null); setMenuMais(null); }}
              >
                <div className="fb-linha-tipo">
                  <span className="fb-rotulo" data-fixo="sim">{campo.rotulo}</span>
                  <SeletorDeTipo
                    tipo={campo.tipo}
                    aberto={menuTipo === campo.id}
                    aoAbrir={() => setMenuTipo(m => (m === campo.id ? null : campo.id))}
                    aoEscolher={t => trocarTipo(campo, t)}
                  />
                </div>
                <ListaDeOpcoes
                  tipo={campo.tipo}
                  opcoes={campo.opcoes ?? []}
                  aoMudar={(i, v) => mudarCampo(campo.id, x => ({
                    ...x, opcoes: (x.opcoes ?? []).map((o, j) => (j === i ? v : o)),
                  }))}
                  /* A opção nova nasce "Opção N", como no Forms, e não com o
                     nome de uma unidade do clube: semear a resposta faria o
                     cartão chegar meio resolvido, e a tarefa mediria ter
                     clicado seis vezes. */
                  aoAcrescentar={() => mudarCampo(campo.id, x => ({
                    ...x,
                    opcoes: [...(x.opcoes ?? []), `Opção ${(x.opcoes ?? []).length + 1}`],
                  }))}
                  aoTirar={i => mudarCampo(campo.id, x => ({
                    ...x, opcoes: (x.opcoes ?? []).filter((_, j) => j !== i),
                  }))}
                />
                {campo.validacao && validacaoVale(campo.validacao) && (
                  <div className="fb-validacao-resumo">
                    Validação: {TIPOS_DE_VALIDACAO[campo.validacao.tipo]}
                  </div>
                )}
                <PeDoCartao
                  obrigatorio={campo.obrigatorio}
                  aoTrocarObrigatorio={() =>
                    mudarCampo(campo.id, x => ({ ...x, obrigatorio: !x.obrigatorio }))}
                  aoDuplicar={() => c.mudar(x => ({
                    ...x,
                    formulario: comCampos(x.formulario, [
                      ...x.formulario.campos,
                      { ...campo, id: `${campo.id}-copia`, rotulo: `${campo.rotulo} (cópia)` },
                    ]),
                  }))}
                  aoAbrirMenu={() => setMenuMais(m => (m === campo.id ? null : campo.id))}
                  menu={menuMais === campo.id && (
                    <ItemDoMenu
                      marcado={!!campo.validacao}
                      aoClicar={() => {
                        setMenuMais(null);
                        setRegra({
                          campoId: campo.id,
                          v: campo.validacao ?? { tipo: 'email' },
                        });
                      }}
                    >
                      Validação de resposta
                    </ItemDoMenu>
                  )}
                />
              </CartaoDoConstrutor>
            ))}
            <ColunaDeAcrescentar aoAcrescentar={() => setAviso(
              'Acrescentar pergunta existe no programa de verdade. Nesta lição o que se muda é o que já foi perguntado.',
            )} />
          </CorpoDoConstrutor>
        ) : (
          <div className="fb-corpo">
            <div className="fb-coluna">
              <BarraDeRespostas total={respostasReais(f).length} />
              <TabelaDeRespostas cabecalho={cabecalhoDe(f)} linhas={linhasDe(f)} />
            </div>
          </div>
        )}
      </div>

      {previa && (
        <PreviaDoFormulario
          titulo={f.titulo}
          descricao={f.descricao}
          campos={f.campos}
          valores={previa}
          aoMudar={(campoId, v) => setPrevia(p => ({ ...(p ?? {}), [campoId]: v }))}
          recusas={recusado}
          aoEnviar={enviarPrevia}
          aviso={(
            <BotaoDoConstrutor onClick={() => { setPrevia(null); setRecusado([]); }}>
              Fechar a visualização
            </BotaoDoConstrutor>
          )}
        />
      )}

      {regra && (
        <DialogoDoConstrutor
          titulo="Validação de resposta"
          explica="A regra recusa o que não couber nela. Regra sem o número que ela precisa aceita tudo."
          aoFechar={() => setRegra(null)}
          acoes={(
            <>
              <BotaoDoConstrutor onClick={() => setRegra(null)}>Cancelar</BotaoDoConstrutor>
              <BotaoDoConstrutor
                primario
                onClick={() => {
                  mudarCampo(regra.campoId, x => ({ ...x, validacao: regra.v }));
                  setRegra(null);
                }}
              >
                Salvar
              </BotaoDoConstrutor>
            </>
          )}
        >
          <label className="fb-campo">
            <span>A resposta precisa ser</span>
            <select
              value={regra.v.tipo}
              onChange={e => setRegra({
                campoId: regra.campoId,
                v: { tipo: e.target.value as TipoDeValidacao },
              })}
            >
              {Object.entries(TIPOS_DE_VALIDACAO).map(([k, rotulo]) => (
                <option key={k} value={k}>{rotulo}</option>
              ))}
            </select>
          </label>
          {regra.v.tipo === 'numero-entre' && (
            <div className="fb-dois">
              <label className="fb-campo">
                <span>De</span>
                <input
                  value={regra.v.min ?? ''} inputMode="numeric"
                  onChange={e => setRegra({
                    ...regra, v: { ...regra.v, min: Number(e.target.value) || 0 },
                  })}
                />
              </label>
              <label className="fb-campo">
                <span>Até</span>
                <input
                  value={regra.v.max ?? ''} inputMode="numeric"
                  onChange={e => setRegra({
                    ...regra, v: { ...regra.v, max: Number(e.target.value) || 0 },
                  })}
                />
              </label>
            </div>
          )}
          {regra.v.tipo === 'tamanho-maximo' && (
            <label className="fb-campo">
              <span>No máximo</span>
              <input
                value={regra.v.max ?? ''} inputMode="numeric"
                onChange={e => setRegra({
                  ...regra, v: { ...regra.v, max: Number(e.target.value) || 0 },
                })}
              />
            </label>
          )}
          {!validacaoVale(regra.v) && (
            <AvisoDoConstrutor>
              Do jeito que está, esta regra não recusa nada: ela precisa do número que a
              completa.
            </AvisoDoConstrutor>
          )}
        </DialogoDoConstrutor>
      )}
    </Moldura>
  );
}

/* ── Tela 2: a planilha ───────────────────────────────────────────────────── */

const GUIAS_USAVEIS = ['Página Inicial', 'Inserir', 'Dados'] as const;

/**
 * A área de trabalho, quando há mais de um programa aberto — e nada, quando
 * não há.
 *
 * Com dois programas ela é a área com a barra de tarefas embaixo, que é como
 * um computador resolve isso. Com um só ela não envolve nada: uma div a mais
 * no meio do flex da moldura é uma div sem altura, e a janela deixa de chegar
 * ao fim da tela.
 */
/** Os dois programas que esta vereda abre: a planilha e o editor de texto. */
const DOIS_PROGRAMAS: ProgramaNaBarra<ProgramaAberto>[] = [
  { id: 'planilha', nome: 'Excel', icone: Sheet },
  { id: 'texto', nome: 'Bloco de Notas', icone: FileText },
];

function Area({ barra, children }: { barra?: React.ReactNode; children: React.ReactNode }) {
  if (!barra) return <>{children}</>;
  /* A barra é irmã do palco, e não filha dele: dentro, ela rolaria junto com a
     janela em vez de ficar colada no pé, que é onde toda barra de tarefas
     fica. */
  return (
    <div className="bn-area">
      <div className="bn-palco">{children}</div>
      {barra}
    </div>
  );
}

type DialogoDaPlanilha =
  | { tipo: 'dinamica'; linha: number; valor: number; como: ComoResumir }
  | { tipo: 'salvar'; nome: string; formato: 'xlsx' | 'csv' };

function TelaDaPlanilha(c: Comum & { comBarraDeTarefas: boolean }) {
  const cad = c.contexto.caderno;
  const p = planilhaAtiva(cad);
  const [guia, setGuia] = useState<string>('Página Inicial');
  const [dialogo, setDialogo] = useState<DialogoDaPlanilha | null>(null);
  const [aviso, setAviso] = useState('');

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 7000);
  };

  const mudarCaderno = (g: (k: Caderno) => Caderno) =>
    c.mudar(x => ({ ...x, caderno: g(x.caderno) }));

  const mudar = (g: (q: Planilha) => Planilha) =>
    mudarCaderno(k => trocarAtiva(k, g(planilhaAtiva(k))));

  const grade = useGradeDoExcel({
    planilha: p,
    mudar,
    desfazer: c.desfazer,
    refazer: c.refazer,
    avisar,
    /*
      O relatório de tabela dinâmica não se edita célula a célula, e o Excel
      recusa com todas as letras. Sem esta guarda o texto entraria por baixo do
      resumo, que continua desenhado por cima: o que foi escrito não apareceria
      em lugar nenhum, e a planilha pareceria ter engolido a digitação.
    */
    celulaProtegida: (l, col) => (textoDoResumo(p, l, col) === null
      ? null
      : 'Não é possível alterar esta parte de um relatório de tabela dinâmica. Conserte na aba de origem e clique em Atualizar.'),
  });
  const { faixa, setFaixa, sel, setBarra, setEditando } = grade;
  const area = normalizar(faixa);

  /* ── Os comandos da faixa ── */

  const naFaixaSelecionada = (g: (cel: Planilha['celulas'][0][0]) => Planilha['celulas'][0][0]) =>
    mudar(q => ({
      ...q,
      celulas: q.celulas.map((linha, l) => linha.map((cel, col) => (
        naFaixa(faixa, l, col) ? g(cel) : cel))),
    }));

  const negritar = () => {
    const ligando = !p.celulas[sel.l][sel.c].negrito;
    naFaixaSelecionada(cel => ({ ...cel, negrito: ligando }));
  };

  const tirarLinha = () => {
    const feita = excluirLinha(p, sel.l);
    if (!feita) { avisar('A planilha ficaria quase sem linhas.'); return; }
    mudar(() => feita);
  };

  const tirarColuna = () => {
    const feita = excluirColuna(p, sel.c);
    if (!feita) { avisar('A planilha ficaria quase sem colunas.'); return; }
    mudar(() => feita);
  };

  /*
    Declarar a tabela é o gesto do requisito 3, e não um detalhe de modelo.

    É essa faixa que o resumo e a ordenação leem. Sobrando o título ou o TOTAL
    dentro dela, os dois entram na conta como se fossem respostas — e é por isso
    que ela é declarada, e não adivinhada pelo que está preenchido: uma planilha
    de verdade tem título solto e bloco de cálculos ao lado.
  */
  const declararTabela = () => {
    if (faixa.l1 === faixa.l2 && faixa.c1 === faixa.c2) {
      avisar('Selecione do cabeçalho até a última linha com dado antes de formatar como tabela.');
      return;
    }
    mudar(q => ({ ...q, tabela: { ...area, l1: area.topo, c1: area.esq, l2: area.base, c2: area.dir } }));
    avisar('Pronto: daqui para a frente o resumo e a classificação leem esta faixa.');
  };

  const classificar = (crescente: boolean) => {
    if (!p.tabela) { avisar('Esta aba não tem uma tabela reconhecida para classificar.'); return; }
    mudar(q => ordenar(q, sel.c, crescente));
    avisar('A linha inteira viajou junto — é isso que separa ordenar de filtrar.');
  };

  const atualizarTudo = () => {
    let achou = false;
    mudarCaderno(k => ({
      ...k,
      planilhas: k.planilhas.map((q) => {
        if (!q.resumo) return q;
        achou = true;
        return { ...q, resumo: atualizarResumo(k, q.resumo) };
      }),
    }));
    avisar(achou
      ? 'O resumo releu a origem. Ele guarda o que leu: sem este botão, continuaria relatando o de antes.'
      : 'Não há nenhum resumo nesta pasta para atualizar.');
  };

  const abrirDinamica = () => {
    if (p.nome !== ABA_RESPOSTAS) {
      avisar('Abra a aba Respostas e selecione a tabela antes de criar o resumo.');
      return;
    }
    if (!p.tabela) {
      avisar('Esta aba não tem uma tabela reconhecida. Formate como Tabela antes.');
      return;
    }
    setDialogo({ tipo: 'dinamica', linha: 2, valor: 4, como: 'contagem' });
  };

  const criarDinamica = (d: Extract<DialogoDaPlanilha, { tipo: 'dinamica' }>) => {
    const origem = abaDe(cad, ABA_RESPOSTAS);
    if (!origem.tabela) return;
    const t: TabelaDinamica = {
      em: { l: 3, c: 0 },
      origem: { planilha: ABA_RESPOSTAS, faixa: origem.tabela },
      linha: d.linha,
      valor: { coluna: d.valor, como: d.como },
      retrato: [],
    };
    mudarCaderno((k) => {
      const relatorio = abaDe(k, ABA_RELATORIO);
      const comResumo = comAba(k, {
        ...relatorio,
        resumo: { ...t, retrato: atualizarResumo(k, t).retrato },
      });
      /* E ele abre na aba onde foi criado, como o Excel faz: um relatório que
         nascesse numa aba que ninguém está vendo pareceria não ter acontecido. */
      return {
        ...comResumo,
        ativa: comResumo.planilhas.findIndex(q => q.nome === ABA_RELATORIO),
      };
    });
    setDialogo(null);
  };

  const trocarAba = (i: number) => {
    c.mudar(x => ({ ...x, caderno: { ...x.caderno, ativa: i } }));
    setFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 });
    setEditando(null);
    setBarra('');
  };

  /*
    As duas descobertas do módulo 4 saem de clicar **numa linha** do resumo.

    Elas poderiam sair de abrir a aba, e sairiam erradas: as duas cairiam no
    mesmo instante, e quem abrisse a aba de passagem fecharia metade da lição
    sem ter olhado nada. O que a lição manda fazer é outra coisa — "olhe as que
    se parecem" e "procure a linha escrita (vazio)" —, e clicar numa célula do
    relatório é gesto que o Excel tem.

    São dois cliques em duas linhas diferentes: uma grafia que não é a do
    clube, e o grupo sem nome. Nenhum dos dois registra o outro.
  */
  const olharOResumo = (l: number, col: number) => {
    const t = p.resumo;
    if (!t || col !== t.em.c || l <= t.em.l) return;
    const rotulo = t.retrato[l - t.em.l - 1]?.rotulo;
    if (rotulo === undefined) return;
    if (rotulo === ROTULO_VAZIO) { c.mudar(x => anotar(x, VIU_O_GRUPO_VAZIO)); return; }
    if (t.retrato.length > UNIDADES.length && !UNIDADES.includes(rotulo)) {
      c.mudar(x => anotar(x, VIU_GRUPOS_DEMAIS));
    }
  };

  const salvarComo = (d: Extract<DialogoDaPlanilha, { tipo: 'salvar' }>) => {
    if (d.formato !== 'csv') {
      setDialogo(null);
      avisar('A pasta foi salva. O formato do Excel guarda abas, cores e fórmulas — e só o Excel o lê.');
      return;
    }
    c.mudar(x => ({ ...x, csv: csvDaBase(x) }));
    setDialogo(null);
    avisar(`${NOME_DO_CSV} foi para a pasta de downloads. Abra no Bloco de Notas para ver o que saiu.`);
  };

  const botao = (dica: string, aoClicar: () => void, filho: React.ReactNode, ativo?: boolean) => (
    <BotaoDoExcel dica={dica} aoClicar={aoClicar} ativo={ativo}>{filho}</BotaoDoExcel>
  );

  return (
    <Moldura
      {...c}
      programa="excel"
      aviso={aviso}
      rodape={c.comBarraDeTarefas ? 58 : 28}
    >
      <style>{CSS_EXCEL}</style>
      {c.comBarraDeTarefas && <style>{CSS_DO_BLOCO_DE_NOTAS}</style>}

      {/*
        Sem barra de tarefas, a janela do Excel é filha **direta** da moldura.

        Ela envolvia tudo numa div sem classe quando não havia barra, e essa
        div é um bloco comum no meio do flex da moldura: a janela parava vinte
        e quatro pixels antes do fim, e as abas das planilhas subiam para
        dentro da cápsula de tarefas da plataforma — meio escondidas, numa
        vereda cuja matéria é trocar de aba. Quem viu foi o Chromium: no jsdom
        não há altura nenhuma para estourar.
      */}
      <Area barra={c.comBarraDeTarefas && (
        <BarraDeTarefas programas={DOIS_PROGRAMAS} atual="planilha"
          aoTrocar={t => t === 'texto' && c.irPara('texto')} />
      )}>
          <div className="pl-janela">
            <BarraDeTituloDoExcel arquivo="Inscrições 2026" aoAvisar={avisar} />
            <GuiasDoExcel
              atual={guia} usaveis={GUIAS_USAVEIS} aoTrocar={setGuia} aoAvisar={avisar}
              aoAbrirArquivo={() => setDialogo({ tipo: 'salvar', nome: NOME_DO_CSV.replace(/\.csv$/, ''), formato: 'csv' })}
            />

            <div className="pl-faixa">
              {guia === 'Página Inicial' && (
                <>
                  <GrupoDoExcel nome="Desfazer">
                    {botao('Desfazer (Ctrl+Z)', grade.desfazer, <Undo2 className="w-4 h-4" />)}
                    {botao('Refazer (Ctrl+Y)', grade.refazer, <Redo2 className="w-4 h-4" />)}
                  </GrupoDoExcel>
                  <GrupoDoExcel nome="Fonte">
                    {botao('Negrito', negritar, <Bold className="w-4 h-4" />, p.celulas[sel.l][sel.c].negrito)}
                  </GrupoDoExcel>
                  <GrupoDoExcel nome="Células">
                    {botao('Excluir Linhas da Planilha', tirarLinha, <Rows3 className="w-4 h-4" />)}
                    {botao('Excluir Colunas da Planilha', tirarColuna, <Columns3 className="w-4 h-4" />)}
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
                <>
                  <GrupoDoExcel nome="Tabelas">
                    {botao('Formatar como Tabela', declararTabela, (
                      <span className="flex flex-col items-center">
                        <Table2 className="w-4 h-4" />
                        <span style={{ fontSize: 9 }}>Tabela</span>
                      </span>
                    ))}
                    {botao('Tabela dinâmica', abrirDinamica, (
                      <span className="flex flex-col items-center">
                        <PieChart className="w-4 h-4" />
                        <span style={{ fontSize: 9 }}>Dinâmica</span>
                      </span>
                    ))}
                  </GrupoDoExcel>
                </>
              )}
              {guia === 'Dados' && (
                <>
                  <GrupoDoExcel nome="Classificar">
                    {botao('Classificar de A a Z', () => classificar(true), <ArrowDownAZ className="w-4 h-4" />)}
                    {botao('Classificar de Z a A', () => classificar(false), <ArrowUpZA className="w-4 h-4" />)}
                  </GrupoDoExcel>
                  <GrupoDoExcel nome="Consultas">
                    {botao('Atualizar Tudo', atualizarTudo, (
                      <span className="flex flex-col items-center">
                        <RefreshCw className="w-4 h-4" />
                        <span style={{ fontSize: 9 }}>Atualizar</span>
                      </span>
                    ))}
                  </GrupoDoExcel>
                </>
              )}
            </div>

            <BarraDeFormulas nome={nomeDaFaixa(faixa)} props={grade.propsDaBarra} />

            <GradeDoExcel
              {...grade.props}
              caderno={cad}
              aoApontarCelula={(l, col, e) => {
                grade.props.aoApontarCelula(l, col, e);
                olharOResumo(l, col);
              }}
              aoArrastarBorda={grade.aoArrastarBorda}
              aoAjustarAoConteudo={grade.aoAjustarAoConteudo}
            />

            <AbasDoExcel
              nomes={cad.planilhas.map(q => q.nome)} ativa={cad.ativa}
              aoTrocar={trocarAba} aoAvisar={avisar}
            />

            <div className="pl-status">
              <span>Pronto</span>
              <span style={{ marginLeft: 'auto' }}>{nomeDaFaixa(faixa)}</span>
            </div>
          </div>
      </Area>

      {dialogo?.tipo === 'dinamica' && (
        <>
          <div className="pl-veu-dialogo" onPointerDown={() => setDialogo(null)} />
          <div className="pl-dialogo" role="dialog" aria-modal="true" aria-label="Criar tabela dinâmica">
            <div className="pl-dialogo-titulo">Criar tabela dinâmica</div>
            <div className="pl-dialogo-corpo">
              <label className="pl-campo">
                <span>Linhas</span>
                <select
                  value={dialogo.linha}
                  onChange={e => setDialogo({ ...dialogo, linha: Number(e.target.value) })}
                >
                  {cabecalhoDe(c.contexto.formulario).map((h, i) => (
                    <option key={h} value={i}>{h}</option>
                  ))}
                </select>
              </label>
              <label className="pl-campo">
                <span>Valores</span>
                <select
                  value={dialogo.valor}
                  onChange={e => setDialogo({ ...dialogo, valor: Number(e.target.value) })}
                >
                  {cabecalhoDe(c.contexto.formulario).map((h, i) => (
                    <option key={h} value={i}>{h}</option>
                  ))}
                </select>
              </label>
              <label className="pl-campo">
                <span>Resumir por</span>
                <select
                  value={dialogo.como}
                  onChange={e => setDialogo({ ...dialogo, como: e.target.value as ComoResumir })}
                >
                  {Object.entries(NOME_DO_RESUMO).map(([k, rotulo]) => (
                    <option key={k} value={k}>{rotulo}</option>
                  ))}
                </select>
              </label>
              <p style={{ fontSize: 11.5, color: '#605E5C' }}>
                O resumo vai para a aba {ABA_RELATORIO}. Ele guarda o que leu: consertando a
                origem depois, é o botão Atualizar que o refaz.
              </p>
            </div>
            <div className="pl-dialogo-pe">
              <button type="button" className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Cancelar</button>
              <button
                type="button" className="pl-dialogo-bt" data-principal="sim"
                onClick={() => criarDinamica(dialogo)}
              >
                Criar
              </button>
            </div>
          </div>
        </>
      )}

      {dialogo?.tipo === 'salvar' && (
        <>
          <div className="pl-veu-dialogo" onPointerDown={() => setDialogo(null)} />
          <div className="pl-dialogo" role="dialog" aria-modal="true" aria-label="Salvar como">
            <div className="pl-dialogo-titulo">Salvar como</div>
            <div className="pl-dialogo-corpo">
              <label className="pl-campo">
                <span>Nome do arquivo</span>
                <input
                  value={dialogo.nome} autoFocus
                  onChange={e => setDialogo({ ...dialogo, nome: e.target.value })}
                />
              </label>
              <label className="pl-campo">
                <span>Tipo</span>
                <select
                  value={dialogo.formato}
                  onChange={e => setDialogo({ ...dialogo, formato: e.target.value as 'xlsx' | 'csv' })}
                >
                  <option value="xlsx">Pasta de Trabalho do Excel (*.xlsx)</option>
                  <option value="csv">CSV (separado por ponto e vírgula) (*.csv)</option>
                </select>
              </label>
              {/* O aviso é o que o Excel de verdade dá ao salvar em CSV, e ele é
                  metade da lição: o formato guarda uma aba só e joga fora tudo o
                  que não é texto. */}
              {dialogo.formato === 'csv' && (
                <p style={{ fontSize: 11.5, color: '#8A5700' }}>
                  Este tipo de arquivo guarda só a planilha ativa, e sem cor, sem fórmula e
                  sem as outras abas.
                </p>
              )}
            </div>
            <div className="pl-dialogo-pe">
              <button type="button" className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Cancelar</button>
              <button
                type="button" className="pl-dialogo-bt" data-principal="sim"
                onClick={() => salvarComo(dialogo)}
              >
                <Save className="w-3.5 h-3.5" /> Salvar
              </button>
            </div>
          </div>
        </>
      )}
    </Moldura>
  );
}

/* ── Tela 3: o editor de texto ────────────────────────────────────────────── */

function TelaDoTexto(c: Comum) {
  const [aberto, setAberto] = useState<string | null>(null);
  const naPasta = c.contexto.csv === null
    ? []
    : [{ nome: NOME_DO_CSV, conteudo: c.contexto.csv }];

  /*
    Abrir o arquivo é o que a tarefa pede, e ver a aspa é a outra: as duas se
    registram aqui, no instante em que o texto entra na tela. A segunda depende
    do que a pessoa provocou lá atrás — o ponto e vírgula dentro de uma
    resposta —, e por isso ela olha o arquivo, e não o clique.
  */
  const abrir = (nome: string) => {
    setAberto(nome);
    c.mudar((x) => {
      let fora = anotar(x, ABRIU_O_CSV);
      if ((x.csv ?? '').includes('"')) fora = anotar(fora, VIU_AS_ASPAS);
      return fora;
    });
  };

  return (
    <Moldura {...c} programa="excel" rodape={58}>
      <style>{CSS_DO_BLOCO_DE_NOTAS}</style>
      <div className="bn-area">
        <div className="bn-palco">
          <BlocoDeNotas
            aberto={aberto === null ? null : naPasta.find(a => a.nome === aberto) ?? null}
            naPasta={naPasta}
            aoAbrir={abrir}
          />
        </div>
        <BarraDeTarefas programas={DOIS_PROGRAMAS} atual="texto"
          aoTrocar={t => t === 'planilha' && c.irPara('planilha')} />
      </div>
    </Moldura>
  );
}

/* ── Tela 4: a da plataforma ──────────────────────────────────────────────── */

/*
  O módulo 8 é tela da plataforma, e não programa imitado.

  Classificar uma pergunta como dado pessoal e escolher um cuidado não são
  gestos que o Forms ou o Excel tenham: inventá-los dentro da janela seria pôr
  coisa nossa dentro do programa imitado, que é o contrário do que a moldura
  existe para fazer. Laboratório que não imita nada continua sendo tela da
  plataforma — ordenar, classificar e escrever são exatamente esses.
*/
function TelaDaPlataforma(c: Comum) {
  const x = c.contexto;
  const [porque, setPorque] = useState<string | null>(null);

  const marcarPessoal = (id: string) => c.mudar(v => ({
    ...v,
    pessoaisMarcados: v.pessoaisMarcados.includes(id)
      ? v.pessoaisMarcados.filter(i => i !== id)
      : [...v.pessoaisMarcados, id],
  }));

  const escolherCuidado = (id: string) => {
    const errado = CUIDADOS.find(k => k.id === id && !k.certo);
    /*
      Quem marca uma errada recebe **por que** ela é errada, como a alternativa
      de uma prova. O que ela não recebe é qual é a certa: com a resposta na
      tela, seis botões viram seis tentativas e a tarefa passa a medir
      paciência.
    */
    setPorque(errado && !x.cuidadosEscolhidos.includes(id) ? (errado.porque ?? null) : null);
    c.mudar(v => ({
      ...v,
      cuidadosEscolhidos: v.cuidadosEscolhidos.includes(id)
        ? v.cuidadosEscolhidos.filter(i => i !== id)
        : [...v.cuidadosEscolhidos, id],
    }));
  };

  return (
    /* Esta tela não imita programa nenhum: classificar uma pergunta como dado
       pessoal e escolher um cuidado são gestos que nem o Forms nem o Excel
       têm. Sem o `imitaPrograma={false}`, a moldura avisaria no celular que
       "este laboratório imita um programa de computador" — uma frase falsa,
       mandando procurar um computador para uma lista de caixas que funciona
       perfeitamente no telefone. */
    <Moldura {...c} programa="entrega-de-dados" imitaPrograma={false}>
      <div className="p-4 sm:p-6 overflow-auto h-full">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">
          <section className="card p-4">
            <h2 className="text-base font-bold mb-1">Quais perguntas coletam dado pessoal?</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
              Dado pessoal é o que aponta para uma pessoa: o nome dela, como falar com ela,
              o que ela come.
            </p>
            <div className="flex flex-col gap-1.5">
              {x.formulario.campos.map(campo => (
                <label key={campo.id} className="flex items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={x.pessoaisMarcados.includes(campo.id)}
                    onChange={() => marcarPessoal(campo.id)}
                  />
                  <IconeDoTipo tipo={campo.tipo} size={14} />
                  <span>{campo.rotulo}</span>
                  <span style={{ color: 'var(--color-text-dim)', fontSize: 12 }}>
                    {NOME_DO_TIPO[campo.tipo]}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <h2 className="text-base font-bold mb-1">Escolha três cuidados</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
              De cada um, pergunte: isto muda onde este dado está, ou quem o alcança?
            </p>
            <div className="flex flex-col gap-1.5">
              {CUIDADOS.map(k => (
                <label key={k.id} className="flex items-start gap-2.5 text-sm">
                  <input
                    type="checkbox" className="mt-1"
                    checked={x.cuidadosEscolhidos.includes(k.id)}
                    onChange={() => escolherCuidado(k.id)}
                  />
                  <span>{k.texto}</span>
                </label>
              ))}
            </div>
            {porque && (
              <p className="text-sm mt-3" style={{ color: 'var(--color-warning)' }}>{porque}</p>
            )}
          </section>

          <section className="card p-4">
            <h2 className="text-base font-bold mb-1">Pasta de downloads</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
              O CSV exportado é a base inteira em texto puro, sem senha e sem dono.
            </p>
            {x.csv === null ? (
              <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
                A pasta está vazia.
              </p>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <span className="font-mono">{NOME_DO_CSV}</span>
                <button
                  className="btn-ghost text-sm ml-auto"
                  onClick={() => c.mudar(v => ({ ...v, csv: null }))}
                >
                  <Trash2 className="w-4 h-4" /> Apagar, e apagar da lixeira
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </Moldura>
  );
}

/* ── O laboratório ────────────────────────────────────────────────────────── */

export default function LaboratorioDeDados({ vereda, licao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'dados' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const daLicao = LICOES_DA_CC_ES008[licao.licao];
  const [hist, setHist] = useState<Historico<ContextoDeDados>>(() => historicoDe(daLicao.inicial()));
  const [tela, setTela] = useState<ProgramaDaCcEs008>(daLicao.programa);

  const comum: Comum = {
    vereda,
    licao,
    metas: daLicao.metas,
    contexto: hist.presente,
    mudar: f => setHist(h => registrar(h, f(h.presente))),
    desfazer: () => setHist(desfazer),
    refazer: () => setHist(refazer),
    irPara: setTela,
    recomecar: () => { setHist(historicoDe(daLicao.inicial())); setTela(daLicao.programa); },
    aoVencer,
    aoSair,
  };

  /*
    O `switch` é exaustivo, com `never` no `default`: a quinta tela não compila
    até alguém dizer o que ela desenha. É a decisão do despacho da CC-ES005 e
    da CC-ES007, do outro lado da mesma ponte.
  */
  switch (tela) {
    case 'formulario':
      return <TelaDoFormulario {...comum} />;
    case 'planilha':
      /*
        A barra de tarefas só existe onde há **dois** programas abertos, que é
        o módulo 6: a planilha que exporta e o editor que mostra o que saiu.
        Nas outras lições ela prometeria um caminho para um programa que a lição
        não usa — é a regra do `aoBuscar` do Explorador, aplicada ao sistema.
      */
      return <TelaDaPlanilha {...comum} comBarraDeTarefas={licao.licao === 'csv'} />;
    case 'texto':
      return <TelaDoTexto {...comum} />;
    case 'plataforma':
      return <TelaDaPlataforma {...comum} />;
    default: {
      const nunca: never = tela;
      return nunca;
    }
  }
}

export type { LicaoDaCcEs008 };
