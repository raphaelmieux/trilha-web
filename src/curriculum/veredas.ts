import { MODULOS_DE_HTML } from './sintaxeHtml';
import { MODULOS_DE_CSS } from './folhaDeEstilo';
import { MODULOS_DE_BLOCOS } from './logicaComBlocos';
import type { Question } from '../types';

/*
 * As veredas.
 *
 * ── O que é uma vereda ───────────────────────────────────────────────────
 * Vereda é o caminho estreito que sai da trilha principal. Aqui é o percurso
 * curto que nasce de uma trilha completa e passa a valer sozinho: a sintaxe
 * do HTML saiu da AP035 porque quem escreve HTML precisa dela, tenha ou não
 * feito a especialidade de Internet — presa ali, só quem estivesse naquela
 * trilha a encontraria.
 *
 * Chamava-se "mini-trilha", que dizia o tamanho e não dizia o que a coisa é.
 *
 * ── Tem a forma de uma trilha, e não o peso dela ─────────────────────────
 * Módulos, cada um com uma lição de teoria e um laboratório a vencer, e
 * progresso à vista — porque é assim que o desbravador já sabe percorrer uma
 * coisa nesta plataforma, e inventar uma segunda gramática de percurso só
 * para o material curto seria pedir que ele aprendesse duas.
 *
 * O que não tem é peso de especialidade: não há requisito oficial, não há
 * nota, e nada disto entra no percentual de trilha nenhuma. É bônus — rende
 * insígnia e uma seção própria no relatório.
 *
 * ── Por que não vira uma Specialty ───────────────────────────────────────
 * Uma `Specialty` precisa de linha em `specialties`, `modules`, `lessons` e
 * `requirements` para que o progresso seja gravado, e a partir daí ela entra
 * no percentual, na família do painel, no XP e nas insígnias de trilha. Seria
 * o contrário de bônus. O progresso da vereda sai de eventos de atividade,
 * que é onde as insígnias já procuram tudo, e nenhuma tabela nova é criada.
 *
 * ── Para acrescentar a próxima ───────────────────────────────────────────
 * Escreva os módulos num arquivo como `sintaxeHtml.ts`, acrescente a entrada
 * em VEREDAS com o próximo código VD, e semeie a linha da insígnia numa
 * migration nova — `vereda_<id>`. `insignias.test.ts` cobra.
 */

export interface TopicoDeVereda {
  id: string;
  titulo: string;
  /** Uma frase: o que se aprende aqui. Aparece na lista de tópicos. */
  resumo: string;
  /** Dois ou três parágrafos curtos. Frase curta, exemplo do dia a dia. */
  explicacao: string[];
  /** O exemplo. Roda de verdade no quadro do resultado, quando a vereda mostra um. */
  exemplo: string;
  /**
   * O que o exemplo é, e portanto como ele se desenha.
   *
   * Ausente, `'html'` — como a vereda nasceu. Não se adivinha pelo conteúdo: o
   * que erraria são justamente os casos mistos, um exemplo de CSS que mostra o
   * `<link>` do HTML, um de blocos que compara texto e blocos na mesma caixa.
   * Quem escreveu a lição sabe o que está mostrando.
   *
   * `'blocos'` desenha a pilha do Scratch, com a cor da categoria; `'texto'` é
   * um algoritmo ou uma tabela, e não tem resultado nenhum a mostrar.
   */
  exemploComo?: 'html' | 'css' | 'blocos' | 'texto';
  /**
   * Só para `'css'`: a marcação a que a folha se aplica.
   *
   * Sem ela não há resultado — uma regra de CSS sozinha não pinta nada, e era
   * essa a razão de o quadro do navegador mostrar a regra escrita em vez do
   * efeito dela.
   */
  exemploMarcacao?: string;
  /** O engano que este tópico costuma produzir. Aparece em destaque. */
  atencao?: string;
  /** As marcas que o tópico cobre — é por aqui que se procura. */
  marcas: string[];
}

/**
 * Uma lição da vereda: ou se lê, ou se faz.
 *
 * São os dois tipos que uma trilha tem, e por isso são os dois que a vereda
 * tem. Teoria sem laboratório é leitura; laboratório sem teoria é adivinhação.
 */
export type LicaoDeVereda =
  | {
    id: string;
    tipo: 'teoria';
    titulo: string;
    resumo: string;
    topicos: TopicoDeVereda[];
    /**
     * As questões que fecham a lição.
     *
     * Lição de teoria da plataforma não se conclui sem responder, e não havia
     * razão para a vereda ser a exceção: abrir os tópicos media rolagem, e não
     * entendimento.
     */
    questoes: Question[];
  }
  | {
    id: string;
    tipo: 'laboratorio';
    titulo: string;
    resumo: string;
    /** De onde a pessoa parte. Abre reprovando em tudo, como todo modelo aqui. */
    modelo: string;
    /** Os ids de verificação que este laboratório cobra, no validador da linguagem. */
    verificacoes: string[];
    /** O nome do arquivo e o da pasta, na lateral do editor. */
    arquivo: string;
    projeto: string;
    /**
     * A linguagem do arquivo. Ausente, `'html'` — como a vereda nasceu.
     *
     * O que muda com ela é o validador e a prévia. CSS não se vê sozinho: uma
     * folha de estilo sem página é texto, e o resultado só existe quando ela
     * encontra a marcação.
     */
    linguagem?: 'html' | 'css' | 'blocos' | 'python' | 'scratch';
    /**
     * Só para `'blocos'`: o projeto de onde a pessoa parte.
     *
     * A vereda de lógica não escreve texto — ela monta uma árvore —, então o
     * modelo dela não é uma string. `modelo` continua existindo por causa do
     * tipo, e não é lido neste caminho. O nome é `projetoDeBlocos` e não
     * `projeto` porque `projeto` já é a pasta que o editor de código mostra na
     * lateral, e dois campos com o mesmo nome e significados diferentes é o
     * tipo de coisa que ninguém percebe até ler o arquivo errado.
     */
    projetoDeBlocos?: import('../labs/blocos').Projeto;
    /**
     * Só para `'css'`: a página a que a folha se aplica.
     *
     * Fixa e só de leitura, e é assim que se trabalha CSS na vida — a
     * marcação vem dada, e o que se escreve é o estilo. Ela fica visível na
     * lateral do editor, porque sem ler o `class=` e o `id=` não há como
     * escrever seletor que acerte alguém.
     */
    marcacao?: string;
    /**
     * Só para `'python'`: as linhas que `input()` vai consumir.
     *
     * `input()` é síncrono e um worker não consegue esperar digitação na página
     * sem SharedArrayBuffer, que exige cabeçalhos que o GitHub Pages não deixa
     * definir. Então a entrada é decidida antes de executar — que é como todo
     * juiz de código online funciona, e como se testa um programa de verdade.
     *
     * A lição dá o valor inicial do campo; a pessoa pode mudá-lo.
     */
    /**
     * Só para `'scratch'`: o projeto de onde a pessoa parte, em sb3.
     *
     * É o mesmo formato que o Scratch salva e abre, então o modelo pode ser
     * feito no próprio Scratch e colado aqui. `vm.loadProject` o semeia, e
     * `vm.toJSON` devolve o que a pessoa montou para o validador ler — as duas
     * pontas de que o laboratório precisa.
     */
    projetoDeScratch?: string;
    entradaPadrao?: string[];
    /**
     * Só para `'python'`: a saída que o programa deve produzir.
     *
     * Usada pela verificação `saidaEsperada`, que é o que dá dente ao
     * laboratório de consertar programa quebrado: sem ela, "roda sem erro"
     * aprovaria um programa que roda e responde errado.
     */
    saidaEsperada?: string;
  }
  | {
    /*
      O computador simulado, e por que ele é um quarto tipo.

      O requisito 4 da CC002 pede *demonstrar*: instalar o Python e executar um
      programa a partir de arquivo. Isso tem verificação e tem modelo que não
      pode abrir resolvido — até aí é laboratório. O que não tem é `modelo`
      string nem `linguagem`: não há arquivo para validar, e o que se confere é
      o estado de um computador. Enfiá-lo em `laboratorio` obrigaria a inventar
      um `modelo: ''` e uma linguagem falsa, e a trava dos modelos passaria a
      conferir uma string vazia com o validador de HTML — verde sem ter olhado
      nada, que é a forma que o defeito silencioso toma aqui.

      O ponto de partida não vem do currículo: é sempre o mesmo computador, sem
      nada baixado e sem nada instalado, e ele mora em `estadoInicial()`. Um
      currículo que pudesse descrever o computador poderia descrevê-lo já com o
      Python instalado, que é justamente o laboratório que abre resolvido.

      Para o progresso conta como lição de fazer: grava `vereda_laboratorio`.
    */
    id: string;
    tipo: 'ambiente';
    titulo: string;
    resumo: string;
    /** Os ids de verificação, no validador do ambiente. */
    verificacoes: string[];
  }
  | {
    /*
      A redação guiada, e por que ela é um terceiro tipo.

      O requisito 1 da CC001 pede um relatório escrito. Isso não é teoria — não
      se lê, se produz — e não é laboratório: não há validador, não há modelo
      que possa abrir resolvido, e não há verificação com passo a passo. Enfiá-la
      em `laboratorio` com `verificacoes: []` faria duas travas passarem sem
      conferir nada, que é a forma que o defeito silencioso costuma tomar aqui.

      Para o progresso ela conta como lição de fazer: grava `vereda_laboratorio`,
      porque é trabalho e não leitura, e é assim que `registrarLicaoVencida` já
      trata tudo o que não é teoria.
    */
    id: string;
    tipo: 'redacao';
    titulo: string;
    resumo: string;
    /** A chave do roteiro em `ROTEIROS`, no cliente e no servidor. */
    roteiro: string;
  };

export interface ModuloDeVereda {
  id: string;
  titulo: string;
  resumo: string;
  licoes: LicaoDeVereda[];
}

export interface Vereda {
  /**
   * A chave interna, e ela nunca muda.
   *
   * É por ela que a insígnia se chama e que os eventos de percurso são
   * gravados. O código na tela pode ser renomeado — o da vereda de HTML já
   * foi, de VD01 para CC-FE001 — e nada do que alguém percorreu se perde,
   * porque nada disso depende dele.
   */
  id: string;
  /*
    Daqui para baixo, os mesmos nomes de campo de uma `Specialty`.

    Não é preguiça de traduzir: é o que faz o cartão da vereda e o da trilha
    serem o mesmo cartão, `nomeCompleto` servir aos dois, e a próxima pessoa
    que mexer nisto não precisar aprender duas gramáticas para a mesma ideia.
  */
  /** 'CC-FE001'. Nomeia o emblema, o certificado e a rota. */
  code: string;
  /** 'HTML'. O nome sozinho; `nomeCompleto` junta com o código. */
  name: string;
  /** O conjunto a que ela pertence — é por aqui que o painel agrupa. */
  familia: string;
  description: string;
  /**
   * Anunciada, mas ainda não aberta.
   *
   * O painel mostra o cartão acinzentado, sem link, para que o clube saiba o
   * que vem — em vez de a vereda aparecer só no dia em que ficar pronta, ou
   * pior, aparecer aberta e vazia. É a mesma regra das trilhas.
   */
  emConstrucao?: boolean;
  /** A trilha completa de onde ela saiu, quando saiu de uma. */
  origem?: string;
  /**
   * O quadro do resultado roda o exemplo como HTML. Uma vereda cujos exemplos
   * não sejam HTML — de Python, de linha de comando — desliga isto e mostra
   * só o código, em vez de fingir que executa.
   */
  mostraResultado: boolean;
  modulos: ModuloDeVereda[];
}

/** Uma vereda ainda por escrever: só o cartão, para o clube saber o que vem. */
const anunciada = (
  code: string, name: string, familia: string, description: string,
): Vereda => ({
  id: code.toLowerCase(),
  code, name, familia, description,
  emConstrucao: true,
  mostraResultado: false,
  modulos: [],
});

export const VEREDAS: Vereda[] = [
  /* ── Base ── */
  {
    id: 'cc001',
    code: 'CC001',
    name: 'Lógica com Scratch',
    familia: 'Base',
    description: 'Montar um programa arrastando blocos: sequência, repetição e condição, sem digitar uma linha.',
    /*
      Sem `origem`: esta é a primeira vereda de todas, e não sai de trilha
      nenhuma. As outras nascem de uma trilha completa e se soltam dela — a
      sintaxe do HTML saiu da AP035 —, e esta vem antes de qualquer uma.
    */
    mostraResultado: true,
    modulos: MODULOS_DE_BLOCOS,
  },
  anunciada('CC002', 'Python', 'Base',
    'A primeira linguagem escrita: variável, condição, laço e função, resolvendo problemas pequenos.'),
  anunciada('CC003', 'Terminal e Git', 'Base',
    'Conversar com o computador por texto, e guardar o histórico do que se escreveu.'),
  anunciada('CC004', 'Python, Avançado', 'Base',
    'Listas, dicionários, arquivos e erros — o que separa um exercício de um programa que se usa.'),
  anunciada('CC005', 'SQL', 'Base',
    'Guardar e procurar informação numa base de dados, que é onde quase todo programa a guarda.'),
  anunciada('CC006', 'Projeto de Programa', 'Base',
    'Juntar tudo num programa que resolve uma coisa do clube, do começo ao fim.'),

  /* ── Front-end ── */
  {
    id: 'html',
    code: 'CC-FE001',
    name: 'HTML',
    familia: 'Front-end',
    description: 'Do que é uma tag até o menu de um site. Sete módulos, cada um com teoria e um laboratório.',
    origem: 'AP035',
    mostraResultado: true,
    modulos: MODULOS_DE_HTML,
  },
  {
    id: 'css',
    code: 'CC-FE002',
    name: 'CSS',
    familia: 'Front-end',
    description: 'Dizer como a página se parece: cor, espaço, tamanho e o que muda quando a tela encolhe.',
    origem: 'CC-FE001',
    mostraResultado: true,
    modulos: MODULOS_DE_CSS,
  },
  anunciada('CC-FE003', 'JavaScript', 'Front-end',
    'Fazer a página responder: guardar valores, decidir e reagir ao que a pessoa faz.'),
  anunciada('CC-FE004', 'DOM', 'Front-end',
    'Mexer na página depois que ela abriu — achar um elemento, trocar o texto, criar outro.'),
  anunciada('CC-FE005', 'TypeScript', 'Front-end',
    'Dizer de que tipo é cada coisa, e descobrir o erro antes de ele chegar na tela de alguém.'),
  anunciada('CC-FE006', 'React', 'Front-end',
    'Montar a tela em pedaços que se repetem, cada um cuidando do próprio estado.'),
  anunciada('CC-FE007', 'Projeto de Interface', 'Front-end',
    'Uma tela inteira do começo ao fim, com o que as veredas anteriores ensinaram.'),

  /* ── Mobile ── */
  anunciada('CC-MB001', 'Dart', 'Mobile',
    'A linguagem do Flutter: o suficiente dela para escrever um aplicativo.'),
  anunciada('CC-MB002', 'Flutter', 'Mobile',
    'Um aplicativo que roda no Android e no iPhone a partir do mesmo código.'),
  anunciada('CC-MB003', 'Kotlin', 'Mobile',
    'A linguagem com que se escreve para Android sem camada nenhuma no meio.'),
  anunciada('CC-MB004', 'Swift', 'Mobile',
    'A linguagem com que se escreve para iPhone sem camada nenhuma no meio.'),
  anunciada('CC-MB005', 'Projeto Mobile', 'Mobile',
    'Um aplicativo de verdade, instalado no telefone e usado por alguém do clube.'),

  /* ── Back-end ── */
  anunciada('CC-BE001', 'Node', 'Back-end',
    'JavaScript fora do navegador: um servidor que responde ao que a página pede.'),
  anunciada('CC-BE002', 'C#', 'Back-end',
    'A linguagem da plataforma .NET, e o que se constrói com ela do lado do servidor.'),
  anunciada('CC-BE003', 'Java', 'Back-end',
    'A linguagem que sustenta boa parte dos sistemas grandes que existem hoje.'),
  anunciada('CC-BE004', 'Pandas', 'Back-end',
    'Ler uma planilha por programa e fazer perguntas a ela que o Excel não responde sozinho.'),
  anunciada('CC-BE005', 'R', 'Back-end',
    'Estatística e gráfico feitos por código, do jeito que a pesquisa faz.'),
  anunciada('CC-BE006', 'Projeto de Servidor', 'Back-end',
    'Um serviço que guarda dados e responde a pedidos, publicado e funcionando.'),

  /* ── Sistemas ── */
  anunciada('CC-SI001', 'C', 'Sistemas',
    'A linguagem que fala perto da máquina: memória, ponteiro e o que o computador faz de fato.'),
  anunciada('CC-SI002', 'C++', 'Sistemas',
    'Programa rápido e organizado ao mesmo tempo — é com ela que se fazem jogos e motores.'),
  anunciada('CC-SI003', 'Go', 'Sistemas',
    'Escrever programas que fazem várias coisas ao mesmo tempo sem virar bagunça.'),
  anunciada('CC-SI004', 'Rust', 'Sistemas',
    'A linguagem que recusa compilar o erro de memória, em vez de deixá-lo para o usuário achar.'),
  anunciada('CC-SI005', 'Projeto de Sistema', 'Sistemas',
    'Um programa que roda perto da máquina e resolve algo real, medido e ajustado.'),

  /* ── Infraestrutura ── */
  anunciada('CC-IE001', 'Bash', 'Infraestrutura',
    'Automatizar no terminal o que ninguém quer repetir à mão todo dia.'),
  anunciada('CC-IE002', 'Docker', 'Infraestrutura',
    'Empacotar o programa com tudo de que ele precisa, para rodar igual em qualquer lugar.'),
  anunciada('CC-IE003', 'Projeto de Implantação', 'Infraestrutura',
    'Pôr no ar o que foi construído, e mantê-lo no ar quando alguém usar.'),
];

/**
 * A ordem em que as famílias aparecem no painel.
 *
 * Escrita aqui, e não deduzida da lista: as famílias têm um percurso entre
 * elas — Base primeiro, projeto por último dentro de cada uma —, e ordem
 * alfabética poria Infraestrutura antes de Base.
 */
export const FAMILIAS_DE_VEREDA = [
  'Base', 'Front-end', 'Mobile', 'Back-end', 'Sistemas', 'Infraestrutura',
];

/** As veredas agrupadas, na ordem das famílias. */
export function veredasPorFamilia() {
  return FAMILIAS_DE_VEREDA
    .map(nome => ({ nome, veredas: VEREDAS.filter(v => v.familia === nome) }))
    .filter(f => f.veredas.length > 0);
}

/** As que já se pode percorrer. É delas que se cobra insígnia. */
export function veredasAbertas(): Vereda[] {
  return VEREDAS.filter(v => !v.emConstrucao);
}

/**
 * As que têm conteúdo escrito, publicadas ou não.
 *
 * É contra esta lista que a qualidade é conferida, e não contra as abertas.
 * O conteúdo entra por partes — uma vereda de sete módulos leva vários dias —,
 * e enquanto ela está `emConstrucao` nenhuma trava a olhava: laboratório
 * abrindo resolvido, verificação sem passo a passo e questão repetida só
 * seriam reprovados no dia em que ela abrisse, com tudo já escrito.
 *
 * Insígnia e certificado continuam saindo de `veredasAbertas()`: prometer
 * prêmio por percurso que ninguém pode percorrer é outra coisa.
 */
export function veredasComConteudo(): Vereda[] {
  return VEREDAS.filter(v => licoesDaVereda(v).length > 0);
}

/**
 * Acha a vereda pelo código da tela ou pela chave interna.
 *
 * A rota usa o código — `/vereda/CC-FE001` —, que é o que a pessoa vê e
 * compartilha. A chave interna continua servindo a quem guardou um link antigo.
 */
export function getVereda(qual: string | undefined): Vereda | undefined {
  if (!qual) return undefined;
  const procurado = qual.toLowerCase();
  return VEREDAS.find(v => v.code.toLowerCase() === procurado || v.id === procurado);
}

/** Todas as lições, na ordem em que se percorre, sabendo de que módulo são. */
export function licoesDaVereda(vereda: Vereda) {
  return vereda.modulos.flatMap(m =>
    m.licoes.map(l => ({ ...l, modulo: m.titulo, moduloId: m.id })));
}

export function getLicaoDaVereda(vereda: Vereda, licaoId: string | undefined) {
  return licoesDaVereda(vereda).find(l => l.id === licaoId);
}

/** As questões de uma vereda, para as travas de qualidade. */
export function questoesDaVereda(vereda: Vereda): Question[] {
  return licoesDaVereda(vereda).flatMap(l => (l.tipo === 'teoria' ? l.questoes : []));
}

/** Só os tópicos, na ordem — é o que o leitor desenha. */
export function topicosDaVereda(vereda: Vereda) {
  return licoesDaVereda(vereda).flatMap(l =>
    l.tipo === 'teoria'
      ? l.topicos.map(t => ({ ...t, licao: l.titulo, licaoId: l.id, modulo: l.modulo }))
      : []);
}

/**
 * A insígnia de cada vereda.
 *
 * Como a das trilhas completas: o código sai do id, e a próxima vereda entra
 * sozinha. O que continua sendo à mão é semear a linha na tabela — insígnia
 * que não existe lá é ignorada sem erro e sem prêmio.
 */
export function codigoDaInsigniaDaVereda(id: string): string {
  /* Só letras e números: o código da insígnia é `[a-z0-9_]`, e um id como
     `cc-fe002` traria um hífen que a tabela não aceita. */
  return `vereda_${id.replace(/[^a-z0-9]/g, '')}`;
}
