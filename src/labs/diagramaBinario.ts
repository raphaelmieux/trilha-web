/*
 * O diagrama do caminho da informação — requisito 5 da AP045.
 *
 * "Saber explicar o funcionamento de informações entre periféricos e a CPU,
 * usando o código binário 1 e 0. Montar um diagrama."
 *
 * A trilha abriu com isto só como lição de teoria: a plataforma ensinava o que
 * pôr no diagrama, e o diagrama ficava para fora daqui. Montar um diagrama é
 * um gesto que se faz numa tela — escolher as peças, ligá-las na direção em que
 * a informação viaja, escrever o que passa em cada ligação —, e medir o gesto é
 * o que um laboratório faz.
 *
 * ── O que erra calado, e que é a razão de a simulação existir ─────────────
 * Uma seta desenhada ao contrário **não estoura**. O diagrama fica bonito, com
 * todas as peças no lugar e todas as setas escritas, e afirma que o monitor
 * manda dados para a CPU. Conferir só "existe uma ligação entre monitor e CPU"
 * aprovaria isso, e o desbravador levaria para o examinador um diagrama que diz
 * o contrário do que o requisito ensina.
 *
 * Quem denuncia é `percorrer`: ela anda pelas setas na direção delas, e o
 * caminho simplesmente não chega. É o mesmo princípio do laboratório de
 * planilha, onde o que separa a fórmula do número digitado é simular a mudança.
 *
 * ── E o rótulo vazio ─────────────────────────────────────────────────────
 * "Há setas no diagrama" é verdade num diagrama de setas sem uma letra escrita
 * — e o requisito é sobre **o código binário** que passa por elas. É o "zero
 * link não é zero link quebrado" aplicado à seta: toda verificação que pode ser
 * satisfeita pelo vazio precisa exigir que algo exista primeiro.
 *
 * Escrever `A` na seta é a outra metade: é plausível, é o que a pessoa quer
 * dizer, e é exatamente o que não viaja no cabo.
 */

export type Papel = 'entrada' | 'cpu' | 'memoria' | 'intermediario' | 'saida';

export interface Peca {
  id: string;
  nome: string;
  papel: Papel;
  /** Uma linha dizendo o que ela faz, com as palavras da lição de teoria. */
  oQueFaz: string;
}

/*
  As peças que a lição de teoria nomeia, e só elas.

  Três de entrada e três de saída porque o requisito diz "um periférico de
  entrada (teclado, mouse ou scanner)" e "um periférico de saída (monitor,
  impressora ou caixa de som)": oferecer um de cada faria a escolha do
  requisito desaparecer, e o diagrama passaria a ser o único diagrama possível.

  A placa de vídeo é `intermediario` e não `saida`: ela não é um periférico, é
  quem traduz o código da CPU em pixels. Classificá-la como saída deixaria o
  diagrama terminar nela, que é onde a informação **ainda não** chegou à pessoa.
*/
export const PECAS: Peca[] = [
  { id: 'teclado', nome: 'Teclado', papel: 'entrada', oQueFaz: 'Detecta a tecla apertada e a converte num código binário.' },
  { id: 'mouse', nome: 'Mouse', papel: 'entrada', oQueFaz: 'Converte o movimento e o clique num código binário.' },
  { id: 'scanner', nome: 'Scanner', papel: 'entrada', oQueFaz: 'Converte o papel numa imagem, em código binário.' },
  { id: 'cpu', nome: 'CPU', papel: 'cpu', oQueFaz: 'Interpreta o código que chega e decide o que fazer com ele.' },
  { id: 'ram', nome: 'Memória RAM', papel: 'memoria', oQueFaz: 'Guarda a informação enquanto ela está sendo usada.' },
  { id: 'video', nome: 'Placa de vídeo', papel: 'intermediario', oQueFaz: 'Transforma o código da CPU em pixels para acender.' },
  { id: 'monitor', nome: 'Monitor', papel: 'saida', oQueFaz: 'Acende os pixels para a pessoa ver.' },
  { id: 'impressora', nome: 'Impressora', papel: 'saida', oQueFaz: 'Põe no papel o que a CPU mandou imprimir.' },
  { id: 'som', nome: 'Caixa de som', papel: 'saida', oQueFaz: 'Transforma o código em som que a pessoa ouve.' },
];

export const pecaPorId = (id: string): Peca | undefined => PECAS.find(p => p.id === id);

/** Uma peça posta no diagrama. `id` é o da peça: cada uma entra uma vez só. */
export interface NoDoDiagrama {
  id: string;
  /** A coluna em que ela foi posta, da esquerda para a direita. */
  coluna: number;
  linha: number;
}

export interface SetaDoDiagrama {
  de: string;
  para: string;
  /** O que passa nesta ligação, escrito por quem monta. */
  rotulo: string;
}

export interface Diagrama {
  nos: NoDoDiagrama[];
  setas: SetaDoDiagrama[];
}

/**
 * A tela em branco.
 *
 * Ela é **vazia**, e isso é a decisão. Um diagrama que já abrisse com o teclado
 * e a CPU no lugar deixaria metade das verificações verdes no segundo zero, e
 * "montar um diagrama" viraria "ligar as duas peças que já estão aí". É a
 * armadilha do laboratório que abre resolvido, que esta casa já pagou duas
 * vezes — e das duas o erro é invisível de dentro, porque o painel mostra
 * tarefas concluídas, que é o que se espera de um laboratório funcionando.
 */
export const DIAGRAMA_INICIAL: Diagrama = { nos: [], setas: [] };

/* ── O código binário ─────────────────────────────────────────────────────── */

/**
 * O rótulo é um código binário, e não o que ele representa.
 *
 * Escrever `A` na seta é plausível — é o que a pessoa quer dizer —, e é
 * exatamente o que **não** viaja no cabo. A lição inteira é que ali passa
 * `01000001`, e aceitar a letra apagaria o requisito.
 *
 * Quatro dígitos é o piso, e não oito: o requisito fala em "usando o código
 * binário 1 e 0", não em ASCII de oito bits, e reprovar `1011` seria cobrar uma
 * regra que o documento oficial não tem.
 */
export const ehCodigoBinario = (rotulo: string): boolean =>
  /^[01\s]+$/.test(rotulo) && rotulo.replace(/\s/g, '').length >= 4;

/* ── Andar pelo diagrama ──────────────────────────────────────────────────── */

/** Para onde se pode ir a partir de uma peça, seguindo a direção das setas. */
const saindoDe = (d: Diagrama, id: string): SetaDoDiagrama[] => d.setas.filter(s => s.de === id);

const no = (d: Diagrama, id: string) => d.nos.find(n => n.id === id);
const papelDe = (id: string): Papel | undefined => pecaPorId(id)?.papel;

const naoRepetido = <T,>(xs: T[]): T[] => [...new Set(xs)];

/** As peças de um papel que estão no diagrama. */
export const noDiagramaComPapel = (d: Diagrama, papel: Papel): string[] =>
  d.nos.filter(n => papelDe(n.id) === papel).map(n => n.id);

/**
 * O caminho que os bits percorrem, da entrada em diante.
 *
 * Ela anda **na direção das setas**, que é o que faz a seta ao contrário
 * aparecer: o caminho para na peça anterior e a simulação mostra onde. Uma
 * verificação de "existe ligação entre A e B" não teria como ver isso.
 *
 * O laço guarda por onde passou porque o desbravador pode ligar a CPU à RAM e a
 * RAM de volta à CPU — que é uma ligação **certa**, e num percurso ingênuo
 * seria um ciclo infinito com a aba travada.
 */
export function percorrer(d: Diagrama, de: string): string[] {
  const caminho: string[] = [];
  const vistos = new Set<string>();
  let atual: string | undefined = de;
  while (atual && !vistos.has(atual)) {
    vistos.add(atual);
    caminho.push(atual);
    /* Entre dois caminhos possíveis, segue o que leva para mais perto da
       saída. Sem isso, um desvio para a RAM terminaria o percurso ali, num
       diagrama que está inteiramente certo.

       Não há filtro de "já visitado" aqui, e houve por uma hora: ele era
       código morto. Quem impede o laço é o `vistos.has(atual)` do `while`, que
       sai **antes** de empilhar a peça de novo — e o resultado é o mesmo com
       filtro e sem ele. A mutação que o apagou não derrubou teste nenhum, que
       foi como ele apareceu; é a mesma descoberta da célula vazia na formatação
       condicional. */
    const adiante: SetaDoDiagrama[] = saindoDe(d, atual);
    const paraSaida = adiante.find(s => papelDe(s.para) === 'saida');
    const seguinte: SetaDoDiagrama | undefined = paraSaida
      ?? adiante.find(s => papelDe(s.para) !== 'memoria')
      ?? adiante[0];
    atual = seguinte?.para;
  }
  return caminho;
}

/**
 * O caminho que a simulação desenha: o que sai de uma entrada e chega mais
 * longe.
 *
 * Ela tenta **todas** as entradas, e não a primeira. Quem põe o teclado e o
 * mouse no diagrama e liga só o teclado montou um diagrama certo com uma peça
 * solta ao lado; começar pela primeira da lista faria os bits saírem do mouse,
 * não chegarem a lugar nenhum, e a tela acusar de erro um diagrama que está
 * certo. Laboratório impossível de vencer é pior do que um que abre resolvido.
 */
export function caminhoDosBits(d: Diagrama): string[] {
  const entradas = noDiagramaComPapel(d, 'entrada');
  let melhor: string[] = [];
  for (const entrada of entradas) {
    const caminho = percorrer(d, entrada);
    const chegou = papelDe(caminho[caminho.length - 1]) === 'saida';
    if (chegou) return caminho;
    if (caminho.length > melhor.length) melhor = caminho;
  }
  return melhor;
}

/** O percurso saiu de um periférico de entrada e chegou a um de saída. */
export const chegouNaSaida = (d: Diagrama): boolean => {
  const caminho = caminhoDosBits(d);
  return caminho.length > 1 && papelDe(caminho[caminho.length - 1]) === 'saida';
};

/* ── O que a lição cobra ──────────────────────────────────────────────────── */

export interface Verificacao {
  id: string;
  rotulo: string;
  /** O que dizer a quem travou. Nunca a resposta: o caminho até ela. */
  dica: string;
  feita: (d: Diagrama) => boolean;
}

/** Há uma seta ligando as duas peças, nesta direção, com código binário escrito. */
const ligaComBinario = (d: Diagrama, de: string[], para: string[]): boolean =>
  d.setas.some(s => de.includes(s.de) && para.includes(s.para) && ehCodigoBinario(s.rotulo));

export const VERIFICACOES: Verificacao[] = [
  {
    id: 'entrada',
    rotulo: 'O diagrama tem um periférico de entrada',
    dica: 'Teclado, mouse ou scanner — escolha um e acrescente ao diagrama.',
    feita: d => noDiagramaComPapel(d, 'entrada').length > 0,
  },
  {
    id: 'cpu',
    rotulo: 'A CPU está no diagrama',
    dica: 'É ela que interpreta o código que chega do periférico.',
    feita: d => !!no(d, 'cpu'),
  },
  {
    id: 'ram',
    rotulo: 'A memória RAM está no diagrama',
    dica: 'É ela que guarda a informação enquanto ela está sendo usada.',
    feita: d => !!no(d, 'ram'),
  },
  {
    id: 'saida',
    rotulo: 'O diagrama tem um periférico de saída',
    dica: 'Monitor, impressora ou caixa de som — é onde a informação chega à pessoa.',
    feita: d => noDiagramaComPapel(d, 'saida').length > 0,
  },
  {
    id: 'entrada-cpu',
    rotulo: 'Uma seta leva do periférico de entrada até a CPU, com o código binário escrito',
    dica: 'A seta aponta para onde a informação vai. Escreva nela o código que representa a tecla, como 01000001.',
    feita: d => ligaComBinario(d, noDiagramaComPapel(d, 'entrada'), ['cpu']),
  },
  {
    id: 'cpu-ram',
    rotulo: 'A CPU está ligada à memória RAM',
    dica: 'A CPU guarda na RAM a informação que está usando agora.',
    feita: d => d.setas.some(s => (s.de === 'cpu' && s.para === 'ram') || (s.de === 'ram' && s.para === 'cpu')),
  },
  {
    id: 'cpu-saida',
    rotulo: 'O caminho continua da CPU até o periférico de saída, com o código binário escrito',
    dica: 'Pode passar pela placa de vídeo antes de chegar ao monitor — é o que acontece de verdade.',
    feita: d => {
      const saidas = noDiagramaComPapel(d, 'saida');
      return ligaComBinario(d, ['cpu'], saidas)
        || (ligaComBinario(d, ['cpu'], ['video']) && ligaComBinario(d, ['video'], saidas));
    },
  },
];

/*
  A simulação **mostra**, e não julga — e isto é uma correção.

  Ela era o oitavo item da lista: "a simulação percorreu o caminho inteiro". A
  mutação que a reduziu a "o botão foi apertado" não derrubou teste nenhum, e
  foi assim que ficou claro que ela nunca podia reprovar sozinha: as sete
  verificações acima já exigem a seta da entrada até a CPU e da CPU até a saída,
  **na direção certa**, então estrutura certa implica caminho que chega.

  Um item de lista que não consegue ficar vermelho por conta própria é o espelho
  do item que abre verde: os dois ensinam a não ler a lista. Ele saiu.

  O que a simulação faz continua valendo, e é o que a lição pede: ela desenha os
  bits andando e diz **onde eles pararam**. É por ela que a seta ao contrário
  aparece enquanto se monta, em vez de aparecer como um item vermelho sem
  explicação — a mesma divisão da régua de status do Word, que conta o que está
  na pasta e não escreve veredito.
*/

/** Onde os bits pararam, para a tela dizer. `null` quando chegaram. */
export function ondePararam(d: Diagrama): string | null {
  if (chegouNaSaida(d)) return null;
  const caminho = caminhoDosBits(d);
  return caminho[caminho.length - 1] ?? null;
}

/** Quantas verificações já passaram. */
export const quantasFeitas = (d: Diagrama): number =>
  VERIFICACOES.filter(v => v.feita(d)).length;

export const tudoFeito = (d: Diagrama): boolean => VERIFICACOES.every(v => v.feita(d));

/* ── Mexer no diagrama ────────────────────────────────────────────────────── */

/**
 * Onde uma peça nova pousa.
 *
 * Por papel, e não por ordem de clique: entrada à esquerda, processamento no
 * meio, saída à direita. Um diagrama em que a ordem visual contradiz o sentido
 * da informação ensina errado sobre a própria coisa que ele desenha — e quem
 * monta não teria como arrastar para consertar, porque aqui não se arrasta.
 */
const COLUNA_DO_PAPEL: Record<Papel, number> = {
  entrada: 0, cpu: 1, memoria: 1, intermediario: 2, saida: 3,
};

export function acrescentarPeca(d: Diagrama, id: string): Diagrama {
  if (!pecaPorId(id) || no(d, id)) return d;
  const coluna = COLUNA_DO_PAPEL[papelDe(id) as Papel];
  /* A RAM fica embaixo da CPU, na mesma coluna: elas conversam entre si e não
     fazem parte da fileira que vai da entrada à saída. */
  const linha = d.nos.filter(n => COLUNA_DO_PAPEL[papelDe(n.id) as Papel] === coluna).length;
  return { ...d, nos: [...d.nos, { id, coluna, linha }] };
}

/**
 * Tirar uma peça leva junto as setas dela.
 *
 * Deixá-las faria o diagrama guardar ligações para uma peça que ninguém vê, e
 * as verificações passariam a responder sobre o que não está na tela — que é o
 * defeito da seleção não podada do Explorador, com outra roupa.
 */
export function tirarPeca(d: Diagrama, id: string): Diagrama {
  return {
    nos: d.nos.filter(n => n.id !== id),
    setas: d.setas.filter(s => s.de !== id && s.para !== id),
  };
}

export function ligar(d: Diagrama, de: string, para: string, rotulo: string): Diagrama {
  if (de === para || !no(d, de) || !no(d, para)) return d;
  /* Ligar duas peças que já estão ligadas reescreve o rótulo, em vez de
     empilhar uma segunda seta por cima da primeira: duas setas no mesmo lugar
     desenham uma só, e quem corrigisse o rótulo veria o antigo continuar
     valendo, sem nada explicando por quê. */
  const outras = d.setas.filter(s => !(s.de === de && s.para === para));
  return { ...d, setas: [...outras, { de, para, rotulo: rotulo.trim() }] };
}

export function desligar(d: Diagrama, de: string, para: string): Diagrama {
  return { ...d, setas: d.setas.filter(s => !(s.de === de && s.para === para)) };
}

/** As peças que já estão no diagrama, na ordem em que elas se desenham. */
export const pecasDoDiagrama = (d: Diagrama): Peca[] =>
  naoRepetido(d.nos.map(n => n.id)).map(id => pecaPorId(id)).filter((p): p is Peca => !!p);
