/*
 * O roteiro da redação guiada — a redação montada aos poucos, por perguntas.
 *
 * O laboratório anterior entregava uma caixa de texto vazia e pedia 250
 * palavras sobre a história dos computadores. Para quem tem dez anos isso não é
 * uma tarefa de escrita: é uma parede. O que acontece na prática é copiar da
 * primeira página que a busca devolver.
 *
 * Aqui a mesma redação nasce de oito perguntas curtas. Cada uma pede uma
 * pesquisa pequena e uma resposta de duas ou três frases; ao final, as respostas
 * são unidas num texto único. O desbravador escreve o tempo todo — o que muda é
 * que ele nunca encara a folha em branco.
 *
 * ── Onde moram os fatos ──────────────────────────────────────────────────
 * Este arquivo traz só o que a tela precisa: a pergunta, o que pesquisar e o
 * tamanho mínimo. Os fatos contra os quais a resposta é conferida ficam na Edge
 * Function, e de propósito: se viessem daqui, o navegador poderia mandar fatos
 * inventados junto da resposta e o validador aprovaria qualquer coisa. O
 * servidor conhece as etapas pelo `id`, e recusa validar id que não conheça.
 */

export interface EtapaRedacao {
  id: string;
  /** Rótulo curto, para a trilha de etapas no topo. */
  titulo: string;
  pergunta: string;
  /** O que procurar antes de responder. */
  paraPesquisar: string;
  /** Mostra o formato esperado sem entregar o conteúdo. */
  exemplo: string;
  /**
   * Quanto a etapa pede.
   *
   * A soma dos mínimos precisa alcançar `minPalavrasTotal` — há teste para
   * isso. Enquanto não alcançava, dava para cumprir as oito etapas, ver "8 de 8
   * prontas" na tela e mesmo assim não conseguir montar o texto, sem que nada
   * explicasse o que faltava.
   */
  minPalavras: number;
  /**
   * Etapa de opinião: não há fato a conferir, e o validador só olha se a
   * resposta fala do assunto. Exigir precisão factual de "o que você acha"
   * seria reprovar a pessoa por pensar.
   */
  opiniao?: boolean;
}

export interface RoteiroRedacao {
  titulo: string;
  introducao: string;
  /** O mínimo do documento oficial, contado sobre o que a pessoa escreveu. */
  minPalavrasTotal: number;
  etapas: EtapaRedacao[];
}

export const ROTEIROS: Record<string, RoteiroRedacao> = {
  AP034: {
    titulo: 'História da Internet',
    introducao:
      'Você vai montar seu relatório respondendo oito perguntas. Pesquise cada uma antes de responder, '
      + 'escreva com suas palavras, e no fim o texto todo é montado a partir do que você escreveu.',
    /* O documento oficial pede de 250 a 300 palavras. O portão fica no piso
       dele; os mínimos das etapas somam 310, então quem cumpre as oito passa
       do topo da faixa sem precisar contar nada. */
    minPalavrasTotal: 250,
    etapas: [
      {
        id: 'por-que',
        titulo: 'Por que a rede nasceu',
        pergunta: 'Por que se quis ligar computadores em rede? Diga qual problema isso resolvia.',
        paraPesquisar: 'Procure por "ARPANET" e "compartilhar computadores". Veja quem pagou a pesquisa e o que se queria resolver.',
        exemplo: 'Nos anos ... , computadores eram ... . Ligá-los em rede permitiria ... , e por isso ...',
        minPalavras: 35,
      },
      {
        id: 'arpanet',
        titulo: 'A primeira rede',
        pergunta: 'Qual foi a primeira rede a funcionar, em que ano, e o que aconteceu na primeira mensagem enviada?',
        paraPesquisar: 'Procure por "ARPANET 1969", "primeira mensagem" e "UCLA Stanford". Anote o ano e o que deu errado na primeira tentativa.',
        exemplo: 'A ... entrou no ar em ... . A primeira mensagem seria ... , mas ...',
        minPalavras: 40,
      },
      {
        id: 'lingua-comum',
        titulo: 'A língua comum',
        pergunta: 'O que é o TCP/IP e por que ele foi tão importante? Cite quem o criou.',
        paraPesquisar: 'Procure por "TCP/IP", "Vinton Cerf" e "Robert Kahn". Veja por que redes diferentes não conseguiam conversar antes dele.',
        exemplo: 'O ... é ... , criado por ... e ... . Antes dele, cada rede ... , e por isso ...',
        minPalavras: 40,
      },
      {
        id: 'web',
        titulo: 'A Web, que não é a internet',
        pergunta: 'Quem inventou a World Wide Web, quando, e o que ela acrescentou à internet que já existia?',
        paraPesquisar: 'Procure por "Tim Berners-Lee", "CERN" e "primeiro site". Veja a diferença entre a internet e a Web.',
        exemplo: 'Em ... , ... criou a Web no ... . A internet já existia, mas a Web trouxe ...',
        minPalavras: 40,
      },
      {
        id: 'navegador',
        titulo: 'A janela para a Web',
        pergunta: 'O que é um navegador, e qual foi um dos primeiros a deixar a Web fácil de usar?',
        paraPesquisar: 'Procure por "Mosaic", "Netscape" e "navegador". Veja o que mudou quando as páginas passaram a mostrar imagens.',
        exemplo: 'Um navegador serve para ... . O ... , de ... , foi um dos primeiros a ...',
        minPalavras: 35,
      },
      {
        id: 'brasil',
        titulo: 'A internet chega ao Brasil',
        pergunta: 'Quando a internet chegou ao Brasil e quando ela passou a ser aberta ao público em geral?',
        paraPesquisar: 'Procure por "internet no Brasil", "RNP" e "1995". Veja a diferença entre o uso nas universidades e a abertura comercial.',
        exemplo: 'No Brasil, a internet começou em ... , usada por ... . Em ... ela foi aberta para ...',
        minPalavras: 40,
      },
      {
        id: 'hoje',
        titulo: 'A internet hoje',
        pergunta: 'Como usamos a internet hoje? Fale do celular e de pelo menos duas coisas que se fazem por ela.',
        paraPesquisar: 'Pense em mensagens, vídeo, escola e banco. Procure quantas pessoas no mundo estão conectadas hoje.',
        exemplo: 'Hoje a maior parte das pessoas acessa por ... . Dá para ... e também ...',
        minPalavras: 40,
      },
      {
        id: 'mudou',
        titulo: 'O que mudou para nós',
        pergunta: 'O que a internet mudou na vida das pessoas? Escreva o que você pensa sobre isso.',
        paraPesquisar: 'Aqui não precisa pesquisar: pense na sua escola, na sua casa e no seu clube, e escreva a sua opinião.',
        exemplo: 'Para mim, o que mais mudou foi ... , porque ... . No meu clube, por exemplo, ...',
        minPalavras: 40,
        opiniao: true,
      },
    ],
  },
  AP041: {
    titulo: 'História dos computadores',
    introducao:
      'Você vai montar seu relatório respondendo oito perguntas. Pesquise cada uma antes de responder, '
      + 'escreva com suas palavras, e no fim o texto todo é montado a partir do que você escreveu.',
    minPalavrasTotal: 250,
    etapas: [
      {
        id: 'antes',
        titulo: 'Antes do computador',
        pergunta: 'Como as pessoas faziam contas antes de existir computador? Cite pelo menos um instrumento antigo e diga para que servia.',
        paraPesquisar: 'Procure por "ábaco", "quipu" e "régua de cálculo". Veja de quando eles são e quem os usava.',
        exemplo: 'Antes dos computadores, as pessoas usavam o ... , que servia para ... . Ele era usado por ...',
        minPalavras: 30,
      },
      {
        id: 'primeiras-maquinas',
        titulo: 'As primeiras máquinas',
        pergunta: 'Qual foi uma das primeiras máquinas de calcular, quem a inventou e em que ano?',
        paraPesquisar: 'Procure por "Pascalina", "Blaise Pascal" e "Leibniz". Anote o ano e o que a máquina conseguia fazer.',
        exemplo: 'Em ... , ... inventou a ... , uma máquina que conseguia ...',
        minPalavras: 30,
      },
      {
        id: 'programavel',
        titulo: 'A máquina programável',
        pergunta: 'Quem teve a ideia de uma máquina que seguisse instruções, e quem escreveu o primeiro programa da história?',
        paraPesquisar: 'Procure por "Charles Babbage", "máquina analítica" e "Ada Lovelace". Veja por que ela é chamada de primeira programadora.',
        exemplo: '... imaginou uma máquina que ... . Já ... escreveu ... , e por isso é considerada ...',
        minPalavras: 30,
      },
      {
        id: 'gigantes',
        titulo: 'Os computadores gigantes',
        pergunta: 'Como eram os primeiros computadores eletrônicos? Cite um deles e conte o tamanho ou o peso que tinha.',
        paraPesquisar: 'Procure por "ENIAC" e "Colossus". Anote o ano, o peso, e o que eram as válvulas que eles usavam.',
        exemplo: 'O ... , de ... , pesava ... e ocupava ... . Ele funcionava com ... , que ...',
        minPalavras: 35,
      },
      {
        id: 'encolheu',
        titulo: 'O que fez tudo encolher',
        pergunta: 'O que foi inventado que permitiu aos computadores ficarem menores e mais baratos?',
        paraPesquisar: 'Procure por "transistor", "circuito integrado" e "microprocessador". Veja o ano de cada um.',
        exemplo: 'Em ... foi inventado o ... , que substituiu ... . Depois veio o ... , que permitiu ...',
        minPalavras: 30,
      },
      {
        id: 'pessoal',
        titulo: 'O computador em casa',
        pergunta: 'Como o computador saiu das empresas e chegou à casa das pessoas? Cite pelo menos um computador pessoal famoso.',
        paraPesquisar: 'Procure por "Apple II", "IBM PC" e "computador pessoal". Veja o ano e por que eles mudaram tudo.',
        exemplo: 'O ... , lançado em ... , foi um dos primeiros a ... . A partir dali, as famílias puderam ...',
        minPalavras: 35,
      },
      {
        id: 'hoje',
        titulo: 'O computador hoje',
        pergunta: 'Como são os computadores hoje em dia? Fale dos aparelhos que usamos agora.',
        paraPesquisar: 'Pense em notebook, tablet e celular. Procure comparar a potência de um celular de hoje com a do ENIAC.',
        exemplo: 'Hoje os computadores são ... . Um celular comum consegue ... , muito mais do que ...',
        minPalavras: 30,
      },
      {
        id: 'mudou',
        titulo: 'O que mudou para nós',
        pergunta: 'O que os computadores mudaram na vida das pessoas? Escreva o que você pensa sobre isso.',
        paraPesquisar: 'Aqui não precisa pesquisar: pense na sua escola, na sua casa e no seu clube, e escreva a sua opinião.',
        exemplo: 'Para mim, o que mais mudou foi ... , porque ... . Na minha escola, por exemplo, ...',
        minPalavras: 40,
        opiniao: true,
      },
    ],
  },
};

/* ── Estado de cada resposta ──────────────────────────────────────────────── */

export type Veredito = 'ok' | 'impreciso' | 'fora_do_tema';

/*
  `type` e não `interface`, aqui e em RespostaEtapa, de propósito.

  As duas viajam inteiras para a coluna `etapas` de `text_projects`, que é
  jsonb — e o tipo gerado do banco recebe jsonb como `Json`. Uma `interface`
  não é atribuível a `Json`: o TypeScript só dá index signature implícita a
  apelido de tipo, então a mesma forma passa como `type` e é recusada como
  `interface`. Voltar para `interface` quebra a gravação do rascunho.
*/
export type ConferenciaEtapa = {
  veredito: Veredito;
  /** O que dizer ao desbravador, em português e sem jargão. */
  observacao: string;
  /** Preenchido só quando há um fato a corrigir. */
  correcao?: string;
};

export type RespostaEtapa = {
  texto: string;
  /** Ausente enquanto a resposta não passou pela conferência. */
  conferencia?: ConferenciaEtapa;
  /** O texto que estava no campo quando a conferência rodou. */
  conferidoEm?: string;
};

export type RespostasRedacao = Record<string, RespostaEtapa>;

/* ── Funções puras ────────────────────────────────────────────────────────── */

export function contarPalavras(texto: string): number {
  const limpo = texto.trim();
  return limpo ? limpo.split(/\s+/).length : 0;
}

export function totalDePalavras(respostas: RespostasRedacao): number {
  return Object.values(respostas).reduce((s, r) => s + contarPalavras(r.texto), 0);
}

/**
 * Uma etapa está pronta quando tem tamanho e passou pela conferência sem ficar
 * fora do tema.
 *
 * `impreciso` não trava: o desbravador vê a observação e decide se corrige. O
 * que não pode acontecer é a imprecisão entrar no texto final — quem cuida
 * disso é `respostasParaUniao`, que só manda adiante o que está em ordem.
 */
export function etapaPronta(etapa: EtapaRedacao, resposta?: RespostaEtapa): boolean {
  if (!resposta) return false;
  if (contarPalavras(resposta.texto) < etapa.minPalavras) return false;
  if (!resposta.conferencia) return false;
  /* Conferência de um texto que já mudou não vale para o texto de agora. */
  if (resposta.conferidoEm !== undefined && resposta.conferidoEm !== resposta.texto) return false;
  return resposta.conferencia.veredito !== 'fora_do_tema';
}

/** As etapas que ainda faltam, na ordem do roteiro. */
export function etapasPendentes(roteiro: RoteiroRedacao, respostas: RespostasRedacao): EtapaRedacao[] {
  return roteiro.etapas.filter(e => !etapaPronta(e, respostas[e.id]));
}

/**
 * Só entra no texto final o que foi conferido e está em ordem.
 *
 * O requisito pede um relatório sobre a história dos computadores; um relatório
 * com data errada não cumpre o requisito, cumpre a aparência dele. Uma resposta
 * marcada como imprecisa e não corrigida fica de fora da união em vez de ser
 * costurada com o resto.
 */
export function respostasParaUniao(
  roteiro: RoteiroRedacao,
  respostas: RespostasRedacao,
): { etapaId: string; texto: string }[] {
  return roteiro.etapas
    .filter(e => {
      const r = respostas[e.id];
      return etapaPronta(e, r) && r!.conferencia!.veredito === 'ok';
    })
    .map(e => ({ etapaId: e.id, texto: respostas[e.id].texto.trim() }));
}

export function podeUnir(roteiro: RoteiroRedacao, respostas: RespostasRedacao): boolean {
  return respostasParaUniao(roteiro, respostas).length === roteiro.etapas.length
    && totalDePalavras(respostas) >= roteiro.minPalavrasTotal;
}

/**
 * A união local, para quando a IA não está disponível.
 *
 * Um clube sem chave do Gemini configurada não pode ficar impedido de cumprir um
 * requisito oficial. Sem a IA o texto sai mais seco — os parágrafos são as
 * respostas emendadas, sem costura — mas sai, é do desbravador e conta as mesmas
 * palavras. Os grupos abaixo existem só para o texto ter parágrafos em vez de
 * um bloco único.
 */
const GRUPOS: string[][] = [
  ['antes', 'primeiras-maquinas'],
  ['programavel', 'gigantes'],
  ['encolheu', 'pessoal'],
  ['hoje', 'mudou'],
];

export function unirLocalmente(
  roteiro: RoteiroRedacao,
  respostas: RespostasRedacao,
): string {
  const prontas = new Map(respostasParaUniao(roteiro, respostas).map(r => [r.etapaId, r.texto]));

  const grupos = GRUPOS.some(g => g.some(id => prontas.has(id)))
    ? GRUPOS
    : [roteiro.etapas.map(e => e.id)];

  return grupos
    .map(grupo => grupo.map(id => prontas.get(id)).filter(Boolean).join(' '))
    .filter(p => p.length > 0)
    .join('\n\n');
}
