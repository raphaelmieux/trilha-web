/**
 * O que o laboratório de planilha avançada da AP044 cobra, e de onde parte.
 *
 * Mesma razão de `metasDaAp043.ts`: modelo e critério fora do componente, para
 * que a trava os alcance sem montar tela.
 *
 * ── O requisito 8, e o que ele tem de diferente do da AP043 ──────────────
 * A AP043 monta a planilha: escrever, alargar coluna, mesclar, somar. Aqui a
 * planilha já existe, com cento e vinte inscritos — e o que se aprende é a
 * **parar de olhar linha por linha**. Filtro em vez do olho, cabeçalho preso
 * em vez de rolar de volta, gráfico em vez de ler números.
 *
 * ── Filtro esconde, e não apaga ──────────────────────────────────────────
 * É o mal-entendido que custa caro, e ele tem uma consequência que ninguém
 * conta: com filtro aplicado, `SOMA` continua somando tudo, inclusive o que
 * está escondido. Quem não sabe disso lê um total que não corresponde ao que
 * vê na tela — e manda esse total para a liderança.
 *
 * A planilha mostra os dois números ao mesmo tempo, como o Excel de verdade
 * mostra: a célula do total, que é a `SOMA`, e a barra de status, que soma o
 * que está à vista. Quando eles não batem, é porque há linha escondida.
 * `SUBTOTAL` é a fórmula que respeita o filtro, e é ela que a tarefa pede.
 *
 * ── Congelar é de tela, e não de dado ────────────────────────────────────
 * Não muda a planilha, não trava célula contra edição e não vai para o PDF.
 * Vale dizer porque "congelar" soa como travar.
 *
 * ── E o gráfico é uma leitura ────────────────────────────────────────────
 * Criar é fácil; escolher o tipo é a lição, e o tipo sai da pergunta. A
 * pergunta aqui é de **evolução** — como a inscrição cresceu mês a mês —, e
 * ela só tem uma resposta certa. Pizza responde composição e barras respondem
 * comparação: nenhuma das duas mostra que março veio depois de fevereiro.
 */

export type TipoDeGrafico = 'nenhum' | 'pizza' | 'barras' | 'linha' | 'dispersao';

export const NOMES_DOS_GRAFICOS: Record<TipoDeGrafico, string> = {
  nenhum: '(nenhum)',
  pizza: 'Pizza',
  barras: 'Colunas',
  linha: 'Linhas',
  dispersao: 'Dispersão',
};

export interface Grafico {
  tipo: TipoDeGrafico;
  titulo: string;
  /** Os eixos foram identificados — sem isso o gráfico não afirma nada. */
  eixos: boolean;
}

export interface Inscrito {
  nome: string;
  unidade: string;
  diarias: number;
  valor: number;
}

export interface Acampamento {
  inscritos: Inscrito[];
  /** O filtro está ligado: as setinhas aparecem no cabeçalho. */
  filtroLigado: boolean;
  /** A unidade escolhida no filtro, ou vazio para todas. */
  unidadeFiltrada: string;
  /** A fórmula escrita na célula do total. */
  formulaDoTotal: string;
  /** Quantas linhas do alto ficam paradas enquanto o resto rola. */
  linhasCongeladas: number;
  grafico: Grafico | null;
}

export const UNIDADES = ['Falcão', 'Águia', 'Tucano', 'Arara', 'Jaguar', 'Onça'];

/** As inscrições mês a mês, que é o que o gráfico tem de mostrar. */
export const INSCRICOES_POR_MES: { mes: string; total: number }[] = [
  { mes: 'Janeiro', total: 8 },
  { mes: 'Fevereiro', total: 17 },
  { mes: 'Março', total: 29 },
  { mes: 'Abril', total: 44 },
  { mes: 'Maio', total: 78 },
  { mes: 'Junho', total: 120 },
];

/*
  Cento e vinte inscritos, gerados por regra e não escritos à mão.

  O número importa: a lição de teoria fala em cento e vinte, e uma planilha de
  doze linhas não faz ninguém sentir falta do filtro — rolar com o olho ainda
  daria. E é o que faz o cabeçalho sair da tela, que é a razão de congelar.
*/
export const INSCRITOS: Inscrito[] = Array.from({ length: 120 }, (_, i) => {
  const unidade = UNIDADES[i % UNIDADES.length];
  const diarias = 2 + (i % 3);
  return {
    nome: `Inscrito ${String(i + 1).padStart(3, '0')}`,
    unidade,
    diarias,
    valor: diarias * 45,
  };
});

/** A fórmula que a planilha traz, e que não sabe do filtro. */
export const FORMULA_INICIAL = '=SOMA(D2:D121)';
/** A que respeita o filtro. 109 é o código da soma que ignora o escondido. */
export const FORMULA_QUE_RESPEITA = '=SUBTOTAL(109;D2:D121)';

export const ACAMPAMENTO_INICIAL: Acampamento = {
  inscritos: INSCRITOS,
  filtroLigado: false,
  unidadeFiltrada: '',
  formulaDoTotal: FORMULA_INICIAL,
  linhasCongeladas: 0,
  grafico: null,
};

/** As linhas que a tela mostra: as escondidas continuam existindo. */
export const inscritosNaTela = (a: Acampamento): Inscrito[] =>
  a.unidadeFiltrada ? a.inscritos.filter(x => x.unidade === a.unidadeFiltrada) : a.inscritos;

/** O que a célula do total mostra, conforme a fórmula que está escrita nela. */
export function totalDaCelula(a: Acampamento): number {
  const respeita = a.formulaDoTotal.toUpperCase().startsWith('=SUBTOTAL');
  const linhas = respeita ? inscritosNaTela(a) : a.inscritos;
  return linhas.reduce((s, x) => s + x.valor, 0);
}

/** O que a barra de status soma: sempre o que está à vista, como no Excel. */
export const totalNaTela = (a: Acampamento): number =>
  inscritosNaTela(a).reduce((s, x) => s + x.valor, 0);

export interface MetaDoAcampamento {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (a: Acampamento) => boolean;
}

export const METAS_DO_ACAMPAMENTO: MetaDoAcampamento[] = [
  {
    id: 'filtro',
    titulo: 'Filtrar por uma unidade',
    detalhe: 'São cento e vinte linhas e você precisa ver só as de uma unidade. Ligue o filtro e escolha uma — e repare que as outras continuam lá, escondidas.',
    onde: 'Página Inicial › Classificar e Filtrar › Filtro',
    passos: [
      'Clique em qualquer célula da tabela.',
      'Em Classificar e Filtrar, clique em Filtro: aparecem setinhas no cabeçalho.',
      'Clique na setinha da coluna Unidade e escolha uma.',
      'Olhe o rodapé: ele continua dizendo quantas linhas existem, e não só as que aparecem.',
    ],
    feita: a => a.filtroLigado && a.unidadeFiltrada !== '' && inscritosNaTela(a).length > 0,
  },
  {
    id: 'soma',
    titulo: 'Fazer o total respeitar o filtro',
    detalhe: 'Com o filtro aplicado, a célula do total continua somando as cento e vinte — inclusive as escondidas. Compare com o número do rodapé: eles não batem. Troque a fórmula por uma que respeite o filtro.',
    onde: 'Na célula do total, ou na barra de fórmulas',
    passos: [
      'Repare nos dois números: o da célula do total e o do rodapé.',
      'Clique na célula do total e olhe a fórmula: ela soma o intervalo inteiro.',
      `Troque por ${FORMULA_QUE_RESPEITA} — o 109 é a soma que ignora o que está escondido.`,
      'Agora os dois números batem, e continuam batendo quando você troca o filtro.',
    ],
    /*
      Duas condições, e a segunda não é redundante.

      Exigir só a fórmula deixaria passar quem a escreveu sem nunca ter
      filtrado nada — e a lição inteira é a diferença entre os dois números,
      que só existe com filtro aplicado.
    */
    feita: a => a.formulaDoTotal.toUpperCase().startsWith('=SUBTOTAL')
      && a.unidadeFiltrada !== ''
      && totalDaCelula(a) === totalNaTela(a),
  },
  {
    id: 'congelar',
    titulo: 'Congelar a linha do cabeçalho',
    detalhe: 'Ao rolar para a linha 80, o cabeçalho já saiu da tela e as colunas viram letras sem nome. Prenda a primeira linha no alto.',
    onde: 'Exibir › Janela › Congelar Painéis',
    passos: [
      'Vá na guia Exibir.',
      'Clique em Congelar Painéis e escolha Congelar Linha Superior.',
      'Role a tabela: o cabeçalho fica, o resto passa por baixo dele.',
      'Congelar é coisa de tela — não muda dado nenhum e não aparece na impressão.',
    ],
    feita: a => a.linhasCongeladas >= 1,
  },
  {
    id: 'grafico',
    titulo: 'Desenhar como a inscrição cresceu',
    detalhe: 'A pergunta é de evolução: como a inscrição cresceu de janeiro a junho. Escolha o tipo de gráfico que responde isso — pizza responde composição, colunas respondem comparação, e nenhuma das duas mostra que março veio depois de fevereiro.',
    onde: 'Inserir › Gráficos',
    passos: [
      'Selecione a tabela dos meses, que está ao lado da lista de inscritos.',
      'Em Inserir, abra Gráficos.',
      'Escolha o tipo que mostra evolução no tempo.',
    ],
    feita: a => a.grafico?.tipo === 'linha',
  },
  {
    id: 'rotulos',
    titulo: 'Dar título ao gráfico e nomear os eixos',
    detalhe: 'Sem eles, o gráfico é um desenho bonito que não afirma nada — e quem lê precisa adivinhar o que está medido.',
    onde: 'Design do Gráfico › Adicionar Elemento Gráfico',
    passos: [
      'Clique no gráfico para que a guia de design apareça.',
      'Em Adicionar Elemento Gráfico, escreva o título.',
      'Ainda ali, ligue os títulos dos eixos.',
    ],
    feita: a => !!a.grafico && a.grafico.titulo.trim().length >= 4 && a.grafico.eixos,
  },
];
