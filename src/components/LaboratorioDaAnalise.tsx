import { useState } from 'react';
import {
  ArrowDownAZ, ArrowUpZA, BarChart3, NotebookPen, RefreshCw, Sigma, Table2,
  Undo2, Redo2, Grid3x3,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_EXCEL, BarraDeTituloDoExcel, GuiasDoExcel, GrupoDoExcel, BotaoDoExcel,
  GradeDoExcel, DesenhoDoGrafico,
} from '../labs/excel';
import { useGradeDoExcel } from '../labs/gradeDoExcel';
import { CampoLongo, Cartao, Escolha } from '../labs/caderno';
import {
  type Caderno, type ComoResumir, type Historico, type Planilha,
  type TabelaDinamica, type TipoDeGrafico,
  atualizarResumo, desfazer, historicoDe, nomeDaFaixa, normalizar, ordenar,
  planilhaAtiva, pontosDaDispersao, pontosDoGrafico, refazer, registrar, textoDoResumo, trocarAtiva,
  NOME_DO_RESUMO,
} from '../labs/planilha';
import { abaDe, comAba, escritoEm, mostradoEm } from '../labs/cadernoDoClube';
import { nomeDaColuna } from '../labs/formulas';
import {
  type ContextoDaAnalise, type Julgamento, type LicaoDaCcEs009,
  type Meta, type ProgramaDaCcEs009, type Veredito,
  ABA_CALCULOS, ABA_RESPOSTAS, CHAVE_CONCLUSAO, CHAVE_LIMITES,
  CHAVE_MAIS_EXPERIENTE, CHAVE_MOBILIZOU_MELHOR, CHAVE_PERGUNTA, CHAVE_POR_QUE_FICA,
  CHAVE_POR_QUE_SAI, CHAVE_RESPOSTA, COLUNAS_MEDIDAS, COL_FORA,
  COL_MEDIA_ACAMPAMENTOS, COL_TAXA,
  CONTESTACOES, LETRAS_DA_JUSTIFICATIVA, LETRAS_DA_PAGINA, LICOES_DA_CC_ES009,
  PERGUNTAS_DO_GRAFICO, REPETICOES_QUE_FAZEM_MODA, VIU_AS_DUAS_LEITURAS,
  VIU_A_COLUNA_QUE_ENGANA, VIU_A_CONTA_SE_REFAZER, VIU_QUE_A_MODA_NAO_SERVE,
  VIU_QUE_MEDIDA_NAO_SE_CONTA,
  assinaturaDaBase, candidatosDasPontas, chaveDaResposta, chaveDoCandidato,
  colunaDoBloco, colunaDoCampo, linhaDoRotulo, melhorTaxa, unidadeMaisExperiente,
} from '../labs/metasDaCcEs009';
import {
  type Escala, type Natureza, UNIDADES_DO_CLUBE, camposDaBase,
} from '../labs/baseDoAcampamento';
import { colunaDe, media, mediana, repeticoesDaModa } from '../labs/analiseDeDados';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * CC-ES009 — as dez lições, numa tela só.
 *
 * ── Duas telas, e a lição começa numa delas ──────────────────────────────
 * A planilha, que é o Excel de sempre, e o **caderno da análise**, que é da
 * plataforma. É o arranjo do `LaboratorioDeDados` da CC-ES008 e do
 * `LaboratorioDeContas` da CC-ES005, pelo motivo escrito nos dois: o que se
 * repete entre as lições não é a janela, é a moldura.
 *
 * ── Por que o caderno existe, em vez de a pergunta ir para dentro da janela ─
 * Sete das dez lições terminam numa coisa que o Excel não tem onde guardar:
 * dizer em qual coluna a média descreve mal, julgar um valor de ponta,
 * escrever por que aquele gráfico responde àquela pergunta. Não há botão de
 * planilha nenhuma que faça isso — e desenhar um dentro da faixa seria pôr
 * coisa da plataforma dentro do programa imitado, que é o contrário do que
 * esta moldura existe para fazer. É a mesma decisão do módulo 8 da CC-ES008 e
 * do módulo 1 daqui, que são tela da plataforma pela mesma razão.
 *
 * O caderno não é um programa: é a folha ao lado da planilha, que é onde a
 * análise de verdade acontece. A travessia mora no painel de tarefas, que é
 * onde as coisas da plataforma já moram, e ela existe nos dois sentidos —
 * quem escreve no caderno cita números, e eles saem da aba Cálculos, não de
 * memória.
 *
 * ── A faixa é a mesma nas sete lições de planilha ────────────────────────
 * Todos os comandos, o tempo todo, porque é assim que um programa é. Uma faixa
 * que só mostrasse "Tabela Dinâmica" na lição que a pede ensinaria a procurar
 * o botão que a tarefa quer, e não a procurar no programa. É a regra do
 * Explorador da CC-ES001, e `LaboratorioDePlanilha.test.tsx` já a cobra do
 * lado da CC-ES003.
 */

/* ── A moldura ────────────────────────────────────────────────────────────── */

type Comum = {
  vereda: Vereda;
  licao: { titulo: string; verificacoes: string[] };
  qual: LicaoDaCcEs009;
  metas: Meta[];
  contexto: ContextoDaAnalise;
  mudar: (f: (c: ContextoDaAnalise) => ContextoDaAnalise) => void;
  /*
    Desfazer e refazer são do laboratório inteiro, e não da pasta: o que se
    escreve no caderno e o que se escreve na planilha viajam no mesmo contexto,
    e é ele que o histórico guarda. Um histórico por tela faria o Ctrl+Z da
    planilha não alcançar o veredito que a pessoa acabou de mudar.
  */
  desfazer: () => void;
  refazer: () => void;
  /*
    O que a pessoa viu, gravado **fora** do histórico.

    Não é atalho: é a diferença entre a pasta e quem a olha. A lição do módulo
    2 manda mexer num dado, ver a média andar e devolver o dado ao que era — e
    com a descoberta dentro do histórico o Ctrl+Z pediria dois toques para
    desfazer uma digitação só, e o segundo apagaria a única coisa que a tarefa
    mede. Descoberta é do desbravador; o histórico é da planilha.
  */
  anotarVisto: (o: string) => void;
  irPara: (t: ProgramaDaCcEs009) => void;
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

const escreverTexto = (c: ContextoDaAnalise, chave: string, valor: string): ContextoDaAnalise =>
  ({ ...c, textos: { ...c.textos, [chave]: valor } });

/*
  A razão entre a média e a mediana de uma coluna — a conta do módulo 3.

  A tela precisa dela duas vezes: para saber em qual coluna a média descreve
  mal, e para dizer, de uma coluna em que ela descreve bem, a que distância as
  duas medidas ficaram. E ela sai do **mesmo motor** que responde ao
  desbravador na planilha: a tela e a fórmula que ele acabou de escrever não
  podem discordar, que é a regra de `exemplosDePlanilha.test.ts`.

  Sem número de um dos dois lados a resposta é 1 — distância zero, a coluna
  não é acusada de nada. O padrão cai para o lado que reivindica menos.
*/
function razaoDe(valores: string[]): number {
  const m = media(valores);
  const d = mediana(valores);
  return m === null || d === null || d === 0 ? 1 : m / d;
}

/* ── A planilha ───────────────────────────────────────────────────────────── */

const GUIAS_USAVEIS = ['Página Inicial', 'Inserir', 'Dados'] as const;

const NOME_DO_GRAFICO: Record<TipoDeGrafico, string> = {
  pizza: 'Pizza',
  colunas: 'Colunas',
  linha: 'Linhas',
  dispersao: 'Dispersão',
};

/*
  O que cada tipo de gráfico responde, escrito por extenso.

  O programa explica a escolha em vez de só deixar a tarefa vermelha — é a
  decisão do laboratório de planilha da AP044 e da CC-ES003, e a razão é a
  mesma: vermelho sem explicação mede paciência. O que ele não diz é qual é o
  certo para aquela aba: com a resposta na tela, quatro tipos viram quatro
  tentativas.
*/
const O_QUE_O_GRAFICO_RESPONDE: Record<TipoDeGrafico, string> = {
  pizza: 'Repartição: de que o todo é feito. Só serve quando as partes somam o todo.',
  colunas: 'Comparação: qual é maior que qual.',
  linha: 'Evolução: como uma coisa mudou ao longo do tempo.',
  dispersao: 'Relação: se duas medidas andam juntas.',
};

/*
  As duas leituras da mesma coisa, uma por clique.

  `VIU_AS_DUAS_LEITURAS` não sai de um botão "eu vi": sai de achar, na aba de
  cálculos, o maior número de cada uma das duas colunas — e são dois cliques
  porque são duas perguntas. Um só deixaria a descoberta cair de passagem, e o
  que a lição manda ver é que as duas respostas são a **mesma linha**.

  Eles moram aqui, e não junto das metas, porque são do gesto e não do que se
  cobra: a meta pergunta se a pessoa viu, e quem sabe como se vê é a tela.
*/
const VIU_O_MAIOR_AUSENTE = 'viu-o-maior-numero-de-ausentes';
const VIU_A_MELHOR_TAXA = 'viu-a-melhor-taxa-de-adesao';

type Dialogo =
  | { tipo: 'dinamica'; linha: number; valor: number; como: ComoResumir }
  | { tipo: 'grafico'; grafico: TipoDeGrafico; titulo: string; eixoX: string; eixoY: string };

function TelaDaPlanilha(c: Comum & { comCaderno: boolean }) {
  const cad = c.contexto.caderno;
  const p = planilhaAtiva(cad);
  const [guia, setGuia] = useState<string>('Página Inicial');
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);
  const [filtroAberto, setFiltroAberto] = useState<{ coluna: number; x: number; y: number } | null>(null);
  const [aviso, setAviso] = useState('');

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 8000);
  };

  const mudarCaderno = (g: (k: Caderno) => Caderno) =>
    c.mudar(x => ({ ...x, caderno: g(x.caderno) }));

  /*
    Toda mudança da planilha passa por aqui, e é aqui que se vê o dado mexer.

    A primeira versão pendurava isso num `aoConfirmar` da grade, e a trava que
    clica derrubou logo: quem escreve pela **barra de fórmulas** — que é como
    se escreve numa planilha — nunca passava por lá, então a descoberta do
    módulo 2 não acontecia para ninguém que digitasse onde se digita. Um lugar
    só, e ele cobre a barra, a célula, o Delete e o colar.

    A conta é a mesma que a meta faz, por `assinaturaDaBase`: classificar a
    coluna não conta como mexer no dado, porque ordenar leva a linha inteira e
    ordem de linha não é dado — e duas lições mandam classificar.
  */
  const mudar = (g: (q: Planilha) => Planilha) => {
    mudarCaderno(k => trocarAtiva(k, g(planilhaAtiva(k))));
    if (p.nome !== ABA_RESPOSTAS) return;
    if (assinaturaDaBase(g(p)) === assinaturaDaBase(p)) return;
    c.anotarVisto(VIU_A_CONTA_SE_REFAZER);
    avisar('O dado mudou. Volte à aba Cálculos: toda conta que aponta para esta coluna se refez sozinha — é isso que separa uma fórmula de um número digitado. Depois aperte Ctrl+Z: as contas desta lição são conferidas contra a base como ela chegou.');
  };

  const grade = useGradeDoExcel({
    planilha: p,
    mudar,
    desfazer: c.desfazer,
    refazer: c.refazer,
    avisar,
    /*
      O relatório de tabela dinâmica não se edita célula a célula, e o Excel
      recusa com todas as letras. Sem a guarda o texto entraria por baixo do
      resumo, que continua desenhado por cima: o que foi escrito não apareceria
      em lugar nenhum. É a guarda que a CC-ES008 documenta, e ela vale aqui
      porque o resumo do módulo 5 mora na mesma aba do dado.
    */
    celulaProtegida: (l, col) => (textoDoResumo(p, l, col) === null
      ? null
      : 'Não é possível alterar esta parte de um relatório de tabela dinâmica. Conserte na aba de origem e clique em Atualizar.'),
  });
  const { faixa, setFaixa, sel, setBarra, setEditando } = grade;

  /* ── Os comandos da faixa ── */

  const classificar = (crescente: boolean) => {
    if (!p.tabela) {
      avisar('Esta aba não tem uma tabela reconhecida para classificar.');
      return;
    }
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
      avisar(`Abra a aba ${ABA_RESPOSTAS} antes de criar o resumo: a tabela dinâmica lê o dado, e não a conta.`);
      return;
    }
    if (!p.tabela) {
      avisar('Esta aba não tem uma tabela reconhecida. O resumo precisa saber onde o dado começa e termina.');
      return;
    }
    setDialogo({ tipo: 'dinamica', linha: 1, valor: 1, como: 'contagem' });
  };

  /*
    O resumo pousa **ao lado** do dado, e não em cima dele.

    O Excel oferece "nova planilha" ou "planilha existente"; aqui a pasta é a
    da lição e não se acrescenta aba, então ele vai para a coluna vazia à
    direita da base. Em cima dela — que era onde ele nascia — o relatório
    cobriria o cabeçalho e as primeiras respostas, e a lição do módulo 5 pede
    justamente comparar o resumo com o dado que ele leu.
  */
  const COLUNA_DO_RESUMO = camposDaBase().length + 2;

  const criarDinamica = (d: Extract<Dialogo, { tipo: 'dinamica' }>) => {
    const origem = abaDe(cad, ABA_RESPOSTAS);
    if (!origem.tabela) return;
    const t: TabelaDinamica = {
      em: { l: 0, c: COLUNA_DO_RESUMO },
      origem: { planilha: ABA_RESPOSTAS, faixa: origem.tabela },
      linha: d.linha,
      valor: { coluna: d.valor, como: d.como },
      retrato: [],
    };
    mudarCaderno(k => comAba(k, {
      ...abaDe(k, ABA_RESPOSTAS),
      resumo: { ...t, retrato: atualizarResumo(k, t).retrato },
    }));
    setDialogo(null);
    avisar(`O resumo pousou em ${nomeDaColuna(COLUNA_DO_RESUMO)}1, ao lado do dado que ele leu.`);
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

  const abrirGrafico = () => {
    if (faixa.l1 === faixa.l2 && faixa.c1 === faixa.c2) {
      avisar('Selecione a coluna dos rótulos e a dos números, do cabeçalho até a última linha, antes de inserir o gráfico.');
      return;
    }
    /*
      A caixa abre com os três campos **vazios**, como a do Excel.

      O Excel nomeia a série pelo cabeçalho da faixa, e não escreve título de
      eixo nenhum: quem quer isso vai em Elementos do Gráfico e digita. Trazer
      os cabeçalhos prontos aqui entregaria a tarefa dos eixos de graça — e ela
      existe justamente porque gráfico sem eixo identificado não afirma nada.
    */
    setDialogo({ tipo: 'grafico', grafico: 'colunas', titulo: '', eixoX: '', eixoY: '' });
  };

  /* ── Os valores distintos de uma coluna, para o filtro ── */

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

  /*
    Quantas pessoas de fato têm o valor filtrado — o que a régua de status do
    Excel escreve quando um filtro está ligado.

    É por aqui que a moda da altura se desmascara: ela é um número plausível
    que descreve **duas** pessoas em quarenta e oito, e a planilha não avisa
    isso em lugar nenhum. Quem pergunta é o desbravador, e o jeito de perguntar
    numa planilha é filtrar e ler quantas linhas sobraram.
  */
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
    if (valor === '') return;

    /*
      A descoberta sai de filtrar a coluna **medida** pela própria moda dela e
      ver quantas linhas sobram. Ela não sai de abrir a aba nem de calcular o
      MODO: o MODO devolve um número nas três colunas, e é justamente por ele
      não avisar nada que a lição existe.
    */
    if (p.nome !== ABA_RESPOSTAS) return;

    /* Só as três colunas medidas, porque é sobre medida que a moda deixa de
       responder — é o que o nome da descoberta diz. Filtrar a unidade pela
       unidade mais comum não ensina nada: ela é justamente o valor que se
       repete às dezenas. */
    const campo = COLUNAS_MEDIDAS.find(id => colunaDoCampo(id) === coluna);
    if (!campo) return;
    const valores = colunaDe(c.contexto.base, campo);
    const quantas = valores.filter(v => v === valor).length;
    /* `valor` é uma moda quando se repete tanto quanto a moda se repete — e a
       comparação é essa, e não com o número que o MODO devolve: a coluna
       guarda "1,58" e o motor devolve 1.58, que não casa como texto. */
    const ehAModa = quantas > 0 && quantas === repeticoesDaModa(valores);
    if (ehAModa && quantas < REPETICOES_QUE_FAZEM_MODA) c.anotarVisto(VIU_QUE_A_MODA_NAO_SERVE);
  };

  /* ── Os dois cliques do módulo 6 ── */

  /*
    Qual célula de uma coluna do bloco guarda o maior número.

    Ela lê o valor **calculado**, e não o texto: a taxa é uma divisão, e
    comparar `=B3/C3` com `=B4/C4` como texto não compara nada.
  */
  const linhaDoMaior = (rotulos: string[], coluna: number): number | null => {
    let melhor: { l: number; n: number } | null = null;
    for (const rotulo of rotulos) {
      const l = linhaDoRotulo(c.contexto.blocos, rotulo);
      const n = Number(mostradoEm(p, l, coluna).replace(',', '.'));
      if (!Number.isFinite(n)) continue;
      if (!melhor || n > melhor.n) melhor = { l, n };
    }
    return melhor?.l ?? null;
  };

  const olharAsDuasColunas = (l: number, col: number) => {
    const bloco = c.contexto.blocos.find(b => b.titulo.startsWith('Adesão por unidade'));
    if (!bloco || p.nome !== ABA_CALCULOS) return;
    const cFora = colunaDoBloco(bloco, COL_FORA);
    const cTaxa = colunaDoBloco(bloco, COL_TAXA);
    if (col !== cFora && col !== cTaxa) return;
    if (l !== linhaDoMaior(bloco.rotulos, col)) return;

    /* O recado relata o que a célula é, e nunca o que ela quer dizer: a
       conclusão é da pessoa, e escrevê-la aqui apagaria a lição. */
    avisar(col === cFora
      ? `Este é o maior número da coluna ${COL_FORA}.`
      : `Este é o maior número da coluna ${COL_TAXA}.`);
    c.anotarVisto(col === cFora ? VIU_O_MAIOR_AUSENTE : VIU_A_MELHOR_TAXA);
    /* As duas juntas são a descoberta. A conta é sobre o que já estava lá mais
       a marca de agora, porque `anotarVisto` acabou de ser chamado e o
       contexto desta renderização ainda é o de antes. */
    const outra = col === cFora ? VIU_A_MELHOR_TAXA : VIU_O_MAIOR_AUSENTE;
    if (c.contexto.descobertas.includes(outra)) c.anotarVisto(VIU_AS_DUAS_LEITURAS);
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

      <div className="pl-janela">
        <BarraDeTituloDoExcel arquivo="Acampamento 2026 — análise" aoAvisar={avisar} />
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
            <>
              <GrupoDoExcel nome="Tabelas">
                {botao('Tabela dinâmica', abrirDinamica, (
                  <span className="flex flex-col items-center">
                    <Table2 className="w-4 h-4" />
                    <span style={{ fontSize: 9 }}>Dinâmica</span>
                  </span>
                ))}
              </GrupoDoExcel>
              <GrupoDoExcel nome="Gráficos">
                {botao('Inserir Gráfico', abrirGrafico, (
                  <span className="flex flex-col items-center">
                    <BarChart3 className="w-4 h-4" />
                    <span style={{ fontSize: 9 }}>Gráfico</span>
                  </span>
                ))}
              </GrupoDoExcel>
            </>
          )}
          {guia === 'Dados' && (
            <>
              <GrupoDoExcel nome="Classificar e Filtrar">
                {botao('Classificar de A a Z', () => classificar(true), <ArrowDownAZ className="w-4 h-4" />)}
                {botao('Classificar de Z a A', () => classificar(false), <ArrowUpZA className="w-4 h-4" />)}
                {botao('Filtro', () => {
                  if (!p.tabela) { avisar('Esta aba não tem uma tabela reconhecida para filtrar.'); return; }
                  mudar(q => ({ ...q, filtro: q.filtro ? null : { coluna: sel.c, valor: '' } }));
                }, <Grid3x3 className="w-4 h-4" />, Boolean(p.filtro))}
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

        <div className="pl-formula">
          <span className="pl-nome" aria-label="Caixa de nome">{nomeDaFaixa(faixa)}</span>
          <span className="pl-fx">fx</span>
          <input
            className="pl-entrada"
            {...grade.propsDaBarra}
            placeholder="Escreva aqui, ou uma fórmula começando por ="
          />
        </div>

        <GradeDoExcel
          {...grade.props}
          caderno={cad}
          aoApontarCelula={(l, col, e) => {
            grade.props.aoApontarCelula(l, col, e);
            olharAsDuasColunas(l, col);
          }}
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
          </div>
        )}

        <div className="pl-abas">
          {cad.planilhas.map((q, i) => (
            <button
              key={q.nome} type="button" className="pl-aba" aria-current={i === cad.ativa}
              onClick={() => {
                mudarCaderno(k => ({ ...k, ativa: i }));
                setFaixa({ l1: 0, c1: 0, l2: 0, c2: 0 });
                setEditando(null);
                setBarra('');
              }}
            >
              {q.nome}
            </button>
          ))}
        </div>

        {/* A régua conta o que o filtro deixou à vista, como a do Excel — e é
            por ela que se descobre que a moda da altura descreve duas pessoas
            em quarenta e oito. Ela relata o número, e nunca o que ele significa. */}
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
            {dialogo.tipo === 'dinamica' && (
              <>
                <div className="pl-dialogo-titulo">Criar tabela dinâmica</div>
                <div className="pl-dialogo-corpo">
                  <label className="pl-campo">
                    <span>Linhas</span>
                    <select value={dialogo.linha}
                      onChange={e => setDialogo({ ...dialogo, linha: Number(e.target.value) })}>
                      {camposDaBase().map(campo => (
                        <option key={campo.id} value={colunaDoCampo(campo.id)}>{campo.rotulo}</option>
                      ))}
                    </select>
                  </label>
                  <label className="pl-campo">
                    <span>Valores</span>
                    <select value={dialogo.valor}
                      onChange={e => setDialogo({ ...dialogo, valor: Number(e.target.value) })}>
                      {camposDaBase().map(campo => (
                        <option key={campo.id} value={colunaDoCampo(campo.id)}>{campo.rotulo}</option>
                      ))}
                    </select>
                  </label>
                  <label className="pl-campo">
                    <span>Resumir por</span>
                    <select value={dialogo.como}
                      onChange={e => setDialogo({ ...dialogo, como: e.target.value as ComoResumir })}>
                      {Object.entries(NOME_DO_RESUMO).map(([k, rotulo]) => (
                        <option key={k} value={k}>{rotulo}</option>
                      ))}
                    </select>
                  </label>
                  <p className="pl-nota">
                    O resumo guarda o que leu. Consertando a origem depois, é o botão Atualizar
                    Tudo que o refaz.
                  </p>
                </div>
                <div className="pl-dialogo-pe">
                  <button type="button" className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Cancelar</button>
                  <button type="button" className="pl-dialogo-bt pl-dialogo-bt-ok"
                    onClick={() => criarDinamica(dialogo)}>OK</button>
                </div>
              </>
            )}

            {dialogo.tipo === 'grafico' && (
              <>
                <div className="pl-dialogo-titulo">Inserir Gráfico — dados de {nomeDaFaixa(faixa)}</div>
                <div className="pl-dialogo-corpo">
                  {/* A pergunta da aba, repetida onde ela é necessária: na hora
                      de escolher o tipo. Ela é o enunciado, e não a resposta —
                      qual desenho a responde continua sendo decisão de quem
                      escolhe. */}
                  {PERGUNTAS_DO_GRAFICO.filter(q => q.aba === p.nome).map(q => (
                    <p key={q.aba} className="pl-nota">{q.pergunta}</p>
                  ))}
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
                  <button type="button" className="pl-dialogo-bt" onClick={() => setDialogo(null)}>Cancelar</button>
                  <button type="button" className="pl-dialogo-bt pl-dialogo-bt-ok"
                    onClick={() => aplicarGrafico(dialogo)}>OK</button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </Moldura>
  );
}

/* ── O caderno da análise ─────────────────────────────────────────────────── */

const NOME_DA_NATUREZA: Record<Natureza, string> = {
  qualitativa: 'Qualitativa',
  quantitativa: 'Quantitativa',
};

const NOME_DA_ESCALA: Record<Escala, string> = {
  nominal: 'Nominal',
  ordinal: 'Ordinal',
  discreta: 'Discreta',
  continua: 'Contínua',
};

const NOME_DO_JULGAMENTO: Record<Julgamento, string> = {
  normal: 'Normal',
  mantem: 'Fica',
  exclui: 'Sai',
};

const O_QUE_O_JULGAMENTO_QUER_DIZER: Record<Julgamento, string> = {
  normal: 'O valor é possível. Só está na ponta.',
  mantem: 'É estranho e é verdadeiro: entra na análise, com a mediana relatada ao lado da média.',
  exclui: 'É estranho porque está errado. Sai da análise da coluna — e o que sai é a célula, não a pessoa.',
};

const NOME_DO_VEREDITO: Record<Veredito, string> = {
  defendo: 'Defendo com os dados',
  reconheco: 'Reconheço o limite',
};

/*
  As alternativas do módulo 4, e por que as erradas erram.

  Elas não são três jeitos de dizer a mesma coisa: cada errada é uma regra que
  alguém de fato aprende ao ver a tabela por classe pela primeira vez, e o
  `porque` de cada uma se desfaz com uma coluna desta própria base. Quem erra
  recebe o que teria visto se aquela regra valesse — e nunca qual é a certa,
  que é a decisão do painel de Problemas da CC003.
*/
const POR_QUE_A_ALTURA_PRECISA_DE_CLASSE = [
  {
    id: 'distintos',
    rotulo: 'Porque quase toda pessoa tem uma altura diferente.',
    abaixo: 'Contar valor a valor daria uma tabela de quarenta e oito linhas de "1", que é a lista com outro nome.',
    certo: true,
  },
  {
    id: 'numeros',
    rotulo: 'Porque a altura tem números e a unidade tem palavras.',
    abaixo: 'Número e palavra não decidem isso.',
    certo: false,
    porque: 'As diárias também são números, e elas se contam valor a valor sem classe nenhuma: são três valores diferentes em quarenta e oito respostas.',
  },
  {
    id: 'erro',
    rotulo: 'Porque a coluna da altura tem um valor errado.',
    abaixo: 'Tem, e ele é assunto de outro módulo.',
    certo: false,
    porque: 'Tem um, e ele é o módulo dos valores atípicos. Mesmo sem ele, contar quarenta e sete alturas distintas continuaria não mostrando forma nenhuma.',
  },
  {
    id: 'muitas',
    rotulo: 'Porque são muitas respostas.',
    abaixo: 'A conta é de quantos valores distintos existem.',
    certo: false,
    porque: 'A coluna da unidade também tem quarenta e oito respostas, e seis linhas bastam para ela. O que pesa é quantos valores **distintos** existem, e não quantas respostas.',
  },
] as const;

function TelaDoCaderno(c: Comum) {
  const x = c.contexto;
  const [porque, setPorque] = useState<string | null>(null);
  const campos = camposDaBase();

  const texto = (chave: string) => x.textos[chave] ?? '';
  const escrever = (chave: string, valor: string) => c.mudar(v => escreverTexto(v, chave, valor));

  const marcar = (id: string, m: Partial<ContextoDaAnalise['marcacoes'][string]>) =>
    c.mudar(v => ({ ...v, marcacoes: { ...v.marcacoes, [id]: { ...v.marcacoes[id], ...m } } }));

  const julgar = (chave: string, j: Julgamento) =>
    c.mudar(v => ({ ...v, julgamentos: { ...v.julgamentos, [chave]: j } }));

  const responder = (id: string, veredito: Veredito) =>
    c.mudar(v => ({ ...v, vereditos: { ...v.vereditos, [id]: veredito } }));

  /*
    Qual coluna a média descreve mal sai da conta, e não de uma lista escrita
    à mão.

    É a distância entre média e mediana — a mesma razão que a pessoa acabou de
    calcular na aba Cálculos. Escrever "é a de acampamentos" aqui seria uma
    segunda fonte para o que o módulo 3 inteiro existe para medir, e ela
    divergiria da base no dia em que alguém mexesse num veterano.
  */
  const colunaQueEngana = (): string => {
    let pior = { id: COLUNAS_MEDIDAS[0], distancia: -1 };
    for (const id of COLUNAS_MEDIDAS) {
      const distancia = Math.abs(razaoDe(colunaDe(x.base, id)) - 1);
      if (distancia > pior.distancia) pior = { id, distancia };
    }
    return pior.id;
  };

  const unidades = UNIDADES_DO_CLUBE.map(u => ({ id: u, rotulo: u }));

  const cartoes = () => {
    switch (c.qual) {
      /* ── Módulo 1: o tipo de cada variável ── */
      case 'tipos':
        return (
          <Cartao
            titulo="O tipo de cada coluna"
            abaixo="Comece perguntando se somar duas respostas daquela coluna quer dizer alguma coisa. Se não quiser, ela é qualitativa."
          >
            <div className="flex flex-col gap-3">
              {campos.map((campo) => {
                const m = x.marcacoes[campo.id];
                return (
                  <div key={campo.id} role="group" aria-label={campo.rotulo}
                    className="flex flex-col gap-1.5 pb-3"
                    style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <span className="text-sm font-semibold">{campo.rotulo}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(NOME_DA_NATUREZA) as Natureza[]).map(n => (
                        <button key={n} type="button" onClick={() => marcar(campo.id, { natureza: n })}
                          aria-pressed={m?.natureza === n}
                          className="text-xs rounded-full px-2.5 py-1"
                          style={{
                            border: `1px solid ${m?.natureza === n ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: m?.natureza === n ? 'var(--color-bg-hover)' : 'transparent',
                          }}>
                          {NOME_DA_NATUREZA[n]}
                        </button>
                      ))}
                      <span aria-hidden="true" style={{ width: 10 }} />
                      {(Object.keys(NOME_DA_ESCALA) as Escala[]).map(e => (
                        <button key={e} type="button" onClick={() => marcar(campo.id, { escala: e })}
                          aria-pressed={m?.escala === e}
                          className="text-xs rounded-full px-2.5 py-1"
                          style={{
                            border: `1px solid ${m?.escala === e ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: m?.escala === e ? 'var(--color-bg-hover)' : 'transparent',
                          }}>
                          {NOME_DA_ESCALA[e]}
                        </button>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-xs"
                      style={{ color: 'var(--color-text-muted)' }}>
                      <input type="checkbox" checked={Boolean(m?.naoAgrupa)}
                        onChange={e => marcar(campo.id, { naoAgrupa: e.target.checked })} />
                      Não serve para agrupar: cada valor aparece uma vez só
                    </label>
                  </div>
                );
              })}
            </div>
          </Cartao>
        );

      /* ── Módulo 3: em qual coluna a média descreve mal ── */
      case 'engano':
        return (
          <Cartao
            titulo="Em qual das três colunas a média descreve mal o clube?"
            abaixo="É uma só. Nas outras duas a média está ótima — e quem sai daqui achando que média sempre mente deixa de usar uma medida boa."
          >
            <Escolha
              opcoes={COLUNAS_MEDIDAS.map(id => ({
                id,
                rotulo: campos.find(f => f.id === id)?.rotulo ?? id,
              }))}
              escolhida={x.descobertas.includes(VIU_A_COLUNA_QUE_ENGANA) ? colunaQueEngana() : undefined}
              porque={porque}
              aoEscolher={(id) => {
                if (id === colunaQueEngana()) {
                  setPorque(null);
                  c.anotarVisto(VIU_A_COLUNA_QUE_ENGANA);
                  return;
                }
                const valores = colunaDe(x.base, id);
                setPorque(`Nesta coluna a média e a mediana ficam a ${Math.round(Math.abs(razaoDe(valores) - 1) * 100)}% uma da outra: as duas descrevem o mesmo clube.`);
              }}
            />
          </Cartao>
        );

      /* ── Módulo 4: por que a altura precisou de classes ── */
      case 'frequencias':
        return (
          <Cartao
            titulo="Por que a altura precisou de classes e a unidade não?"
            abaixo="É a diferença que você marcou no módulo 1, agora fazendo diferença: uma se conta, a outra se mede."
          >
            <Escolha
              opcoes={POR_QUE_A_ALTURA_PRECISA_DE_CLASSE.map(o => ({
                id: o.id, rotulo: o.rotulo, abaixo: o.abaixo,
              }))}
              escolhida={x.descobertas.includes(VIU_QUE_MEDIDA_NAO_SE_CONTA) ? 'distintos' : undefined}
              porque={porque}
              aoEscolher={(id) => {
                const o = POR_QUE_A_ALTURA_PRECISA_DE_CLASSE.find(k => k.id === id);
                if (o?.certo) {
                  setPorque(null);
                  c.anotarVisto(VIU_QUE_MEDIDA_NAO_SE_CONTA);
                  return;
                }
                setPorque(o && 'porque' in o ? o.porque : null);
              }}
            />
          </Cartao>
        );

      /* ── Módulo 5: a unidade mais experiente ── */
      case 'comparacao':
        return (
          <Cartao
            titulo="Qual unidade já foi a mais acampamentos, em média?"
            abaixo="Olhe a coluna de média de acampamentos na aba Cálculos, e não a de inscritos: contar quantos são responde uma pergunta, tirar a média responde outra."
          >
            <Escolha
              opcoes={unidades}
              escolhida={texto(CHAVE_MAIS_EXPERIENTE) || undefined}
              porque={porque}
              aoEscolher={(u) => {
                setPorque(u === unidadeMaisExperiente(x.base)
                  ? null
                  : `Olhe a coluna ${COL_MEDIA_ACAMPAMENTOS} na aba ${ABA_CALCULOS}: esta unidade não é a maior dela.`);
                escrever(CHAVE_MAIS_EXPERIENTE, u);
              }}
            />
          </Cartao>
        );

      /* ── Módulo 6: quem mobilizou melhor ── */
      case 'adesao':
        return (
          <Cartao
            titulo="Qual conselheiro mobilizou melhor a unidade dele?"
            abaixo="Mobilizar bem é levar a maior parte da própria gente. O número absoluto de ausentes responde outra coisa: quantas vagas o acampamento perdeu."
          >
            <Escolha
              opcoes={unidades}
              escolhida={texto(CHAVE_MOBILIZOU_MELHOR) || undefined}
              porque={porque}
              aoEscolher={(u) => {
                setPorque(u === melhorTaxa(x.base)
                  ? null
                  : `Olhe a coluna ${COL_TAXA} na aba ${ABA_CALCULOS}: esta unidade não é a maior dela.`);
                escrever(CHAVE_MOBILIZOU_MELHOR, u);
              }}
            />
          </Cartao>
        );

      /* ── Módulo 7: os valores das pontas ── */
      case 'atipicos':
        return (
          <>
            <Cartao
              titulo="Os valores das pontas de cada coluna"
              abaixo="São os três maiores e os três menores de cada uma. A maioria é gente comum: alguém tem de ser o mais novo do clube, e isso não o torna estranho."
            >
              <div className="flex flex-col gap-2.5">
                {candidatosDasPontas(x.base).map((k) => {
                  const chave = chaveDoCandidato(k.campo, k.valor);
                  const escolhido = x.julgamentos[chave];
                  return (
                    <div key={chave} role="group"
                      aria-label={`${campos.find(f => f.id === k.campo)?.rotulo ?? k.campo} ${k.valor}`}
                      className="flex flex-wrap items-center gap-2 pb-2.5"
                      style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <span className="text-sm" style={{ minWidth: 190 }}>
                        <span className="font-semibold">{campos.find(f => f.id === k.campo)?.rotulo}</span>
                        {' — '}
                        <span className="font-mono">{k.valor}</span>
                        <span style={{ color: 'var(--color-text-dim)' }}>
                          {' '}({k.quantos === 1 ? 'uma pessoa' : `${k.quantos} pessoas`}, ponta {k.ponta === 'alto' ? 'de cima' : 'de baixo'})
                        </span>
                      </span>
                      <span className="flex gap-1.5 ml-auto">
                        {(Object.keys(NOME_DO_JULGAMENTO) as Julgamento[]).map(j => (
                          <button key={j} type="button" onClick={() => julgar(chave, j)}
                            aria-pressed={escolhido === j} title={O_QUE_O_JULGAMENTO_QUER_DIZER[j]}
                            className="text-xs rounded-full px-2.5 py-1"
                            style={{
                              border: `1px solid ${escolhido === j ? 'var(--color-primary)' : 'var(--color-border)'}`,
                              background: escolhido === j ? 'var(--color-bg-hover)' : 'transparent',
                            }}>
                            {NOME_DO_JULGAMENTO[j]}
                          </button>
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>
              <dl className="text-xs mt-3 flex flex-col gap-1" style={{ color: 'var(--color-text-muted)' }}>
                {(Object.keys(NOME_DO_JULGAMENTO) as Julgamento[]).map(j => (
                  <div key={j}>
                    <dt className="inline font-semibold">{NOME_DO_JULGAMENTO[j]}: </dt>
                    <dd className="inline">{O_QUE_O_JULGAMENTO_QUER_DIZER[j]}</dd>
                  </div>
                ))}
              </dl>
            </Cartao>

            <Cartao titulo="A decisão por escrito">
              <div className="flex flex-col gap-4">
                <CampoLongo
                  rotulo="Por que o valor que fica, fica"
                  ajuda="Diga por que você acredita que o número é verdadeiro, mesmo estando longe do resto."
                  valor={texto(CHAVE_POR_QUE_FICA)} minimo={LETRAS_DA_JUSTIFICATIVA}
                  aoEscrever={t => escrever(CHAVE_POR_QUE_FICA, t)}
                />
                <CampoLongo
                  rotulo="Por que o valor que sai, sai"
                  ajuda="Diga o que você acha que aconteceu, e o que faria para confirmar."
                  valor={texto(CHAVE_POR_QUE_SAI)} minimo={LETRAS_DA_JUSTIFICATIVA}
                  aoEscrever={t => escrever(CHAVE_POR_QUE_SAI, t)}
                />
              </div>
            </Cartao>
          </>
        );

      /* ── Módulo 8: por que cada gráfico responde à sua pergunta ── */
      case 'graficos':
        return (
          <Cartao
            titulo="Por que cada tipo responde à sua pergunta"
            abaixo="Três perguntas diferentes pedem três razões diferentes. Diga também o que outro tipo mostraria de errado ali."
          >
            <div className="flex flex-col gap-4">
              {PERGUNTAS_DO_GRAFICO.map(pg => (
                <CampoLongo
                  key={pg.chave}
                  rotulo={`Aba ${pg.aba} — ${pg.pergunta}`}
                  valor={texto(pg.chave)} minimo={LETRAS_DA_JUSTIFICATIVA}
                  aoEscrever={t => escrever(pg.chave, t)}
                />
              ))}
            </div>
          </Cartao>
        );

      /* ── Módulo 10: a pergunta, a resposta, a conclusão e os limites ── */
      case 'conclusao':
        return (
          <>
            <Cartao
              titulo="A sua pergunta"
              abaixo="Ela é sua — mas tem de se responder com esta base. Marcar as colunas é o que mostra que ela se responde."
            >
              <div className="flex flex-col gap-4">
                <CampoLongo
                  rotulo="A pergunta, como você a faria para a liderança"
                  valor={texto(CHAVE_PERGUNTA)} minimo={LETRAS_DA_JUSTIFICATIVA}
                  aoEscrever={t => escrever(CHAVE_PERGUNTA, t)}
                />
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold">As colunas de que ela trata</span>
                  {campos.map(campo => (
                    <label key={campo.id} className="flex items-center gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={x.colunasDaPergunta.includes(campo.id)}
                        onChange={() => c.mudar(v => ({
                          ...v,
                          colunasDaPergunta: v.colunasDaPergunta.includes(campo.id)
                            ? v.colunasDaPergunta.filter(i => i !== campo.id)
                            : [...v.colunasDaPergunta, campo.id],
                        }))}
                      />
                      {campo.rotulo}
                    </label>
                  ))}
                </div>
              </div>
            </Cartao>

            <Cartao titulo="A resposta, com o número que a sustenta"
              abaixo="O número sai da aba Cálculos, e não de memória. Se a pergunta compara grupos, traga os dois — um sozinho não compara nada.">
              <CampoLongo
                rotulo="A resposta" valor={texto(CHAVE_RESPOSTA)} minimo={LETRAS_DA_JUSTIFICATIVA}
                aoEscrever={t => escrever(CHAVE_RESPOSTA, t)}
              />
            </Cartao>

            <Cartao titulo="A conclusão, em no máximo uma página"
              abaixo="Comece pela resposta, e não pelo caminho que levou até ela. Se passar de uma página, corte o que não muda a decisão de quem vai ler.">
              <CampoLongo
                rotulo="A conclusão" valor={texto(CHAVE_CONCLUSAO)}
                minimo={LETRAS_DA_JUSTIFICATIVA * 3} maximo={LETRAS_DA_PAGINA}
                aoEscrever={t => escrever(CHAVE_CONCLUSAO, t)}
              />
            </Cartao>

            <Cartao titulo="E o que esta base não permite afirmar"
              abaixo="É a metade que não se escreve sozinha: quem acabou de achar um número quer contar o que ele mostra, não o que ele não mostra.">
              <CampoLongo
                rotulo="Os limites" valor={texto(CHAVE_LIMITES)} minimo={LETRAS_DA_JUSTIFICATIVA}
                aoEscrever={t => escrever(CHAVE_LIMITES, t)}
              />
            </Cartao>
          </>
        );

      /* ── Módulo 11: a defesa diante do examinador ── */
      case 'defesa':
        return (
          <>
            {CONTESTACOES.map(o => (
              <Cartao key={o.id} titulo="O examinador diz:">
                <blockquote className="text-sm mb-3 pl-3"
                  style={{ borderLeft: '3px solid var(--color-border)', color: 'var(--color-text)' }}>
                  {o.texto}
                </blockquote>
                <div className="flex gap-1.5 mb-3">
                  {(Object.keys(NOME_DO_VEREDITO) as Veredito[]).map(v => (
                    <button key={v} type="button" onClick={() => responder(o.id, v)}
                      aria-pressed={x.vereditos[o.id] === v}
                      className="text-xs rounded-full px-3 py-1.5"
                      style={{
                        border: `1px solid ${x.vereditos[o.id] === v ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: x.vereditos[o.id] === v ? 'var(--color-bg-hover)' : 'transparent',
                      }}>
                      {NOME_DO_VEREDITO[v]}
                    </button>
                  ))}
                </div>
                <CampoLongo
                  rotulo="A sua resposta"
                  ajuda={x.vereditos[o.id] === 'reconheco'
                    ? 'Quem reconhece o limite não precisa de número: precisa dizer o que falta.'
                    : 'Defender com os dados quer dizer com os dados. Traga o número que desfaz a objeção.'}
                  valor={texto(chaveDaResposta(o.id))} minimo={LETRAS_DA_JUSTIFICATIVA}
                  aoEscrever={t => escrever(chaveDaResposta(o.id), t)}
                />
              </Cartao>
            ))}
          </>
        );

      /*
        O módulo 2 não tem caderno: as duas coisas que ele manda ver — a moda
        que não descreve ninguém e a conta que se refaz — acontecem **na
        planilha**, filtrando uma coluna e mexendo num dado. Uma pergunta aqui
        seria a plataforma pedindo que a pessoa confirmasse por escrito o que
        acabou de ver na tela.
      */
      case 'centro':
        return null;

      default: {
        const nunca: never = c.qual;
        return nunca;
      }
    }
  };

  return (
    /*
      Esta tela não imita programa nenhum, e o `imitaPrograma={false}` é o que
      impede a moldura de avisar, no celular, que "este laboratório imita um
      programa de computador": a frase seria falsa, e mandaria procurar um
      computador para uma lista de botões e campos de texto que funciona
      perfeitamente no telefone.
    */
    <Moldura
      {...c}
      programa="caderno-da-analise"
      imitaPrograma={false}
      acoesExtra={(
        <button onClick={() => c.irPara('planilha')} className="btn-secondary text-sm w-full justify-center">
          <Table2 className="w-4 h-4" /> Ver a planilha
        </button>
      )}
    >
      <div className="p-4 sm:p-6 overflow-auto h-full">
        <div className="max-w-3xl mx-auto flex flex-col gap-5">{cartoes()}</div>
      </div>
    </Moldura>
  );
}

/* ── O laboratório ────────────────────────────────────────────────────────── */

/*
  Quais lições têm caderno.

  O módulo 2 não tem, e por isso a travessia não aparece nele: um botão que
  abrisse uma folha em branco prometeria trabalho que a lição não pede — é a
  regra do `aoBuscar` do Explorador, aplicada à própria plataforma.
*/
const SEM_CADERNO: LicaoDaCcEs009[] = ['centro'];

export default function LaboratorioDaAnalise({ vereda, licao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'analise' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const daLicao = LICOES_DA_CC_ES009[licao.licao];
  const [hist, setHist] = useState<Historico<ContextoDaAnalise>>(() => historicoDe(daLicao.inicial()));
  const [tela, setTela] = useState<ProgramaDaCcEs009>(daLicao.programa);

  /*
    Desfazer e refazer andam com a **pasta**, e não com o que a pessoa viu.

    O Ctrl+Z é peça da lição do módulo 2: mexe-se num dado, olha-se a média
    andar, e devolve-se o dado ao que era. Levando a descoberta junto, o gesto
    que a lição manda dar apagaria a única coisa que ela mede — e a tarefa
    voltaria ao vermelho justamente depois de cumprida, sem nada na tela
    explicando. Foi a trava que clica quem achou isto: gravar a descoberta fora
    do histórico não bastava, porque desfazer troca o presente inteiro pelo
    passado guardado, e o passado é de antes de ela existir.

    Descoberta é monotônica — o que se viu, viu-se —, então trazê-la adiante é
    a leitura certa e não um remendo. Quem responde pelo documento continua
    sendo o histórico.
  */
  const andarNoHistorico = (
    passo: (h: Historico<ContextoDaAnalise>) => Historico<ContextoDaAnalise>,
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
    /* Fora do histórico, de propósito — a razão está escrita em `Comum`. */
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
    compila até alguém dizer o que ela desenha. É a decisão do despacho da
    CC-ES005, da CC-ES007 e da CC-ES008.
  */
  switch (tela) {
    case 'planilha':
      return <TelaDaPlanilha {...comum} comCaderno={!SEM_CADERNO.includes(licao.licao)} />;
    case 'plataforma':
      return <TelaDoCaderno {...comum} />;
    default: {
      const nunca: never = tela;
      return nunca;
    }
  }
}
