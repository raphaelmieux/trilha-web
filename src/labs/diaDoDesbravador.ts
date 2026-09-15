import {
  linhaDe, trechoDe, textoDoDoc, paragrafos, textoVisivel,
  revisoesDe, comentariosDoDoc,
  type Doc as DocDoWord, type Bloco as BlocoDoWord,
  type Paragrafo as ParagrafoDoWord, type Trecho, type Comentario,
} from './documento';

/*
  O relato do Dia do Desbravador: o documento que **voltou** revisado.

  ── O quinto engano da vereda, e por que ele é de outra natureza ──────────
  Os quatro documentos anteriores chegam errados, e quem conserta é quem os
  abre. Este chega **certo pela metade e já mexido por outra pessoa** — a
  liderança leu, marcou duas alterações e deixou uma pergunta na margem. É o
  requisito 5 inteiro, e ele só existe com duas pessoas: controle de
  alterações, comentário e substituição são os três recursos de quem manda o
  documento para alguém ler antes.

  Uma das duas marcas está certa e a outra não, e é por isso que os dois
  botões grossos da guia Revisão — Aceitar Todas e Rejeitar Todas — falham os
  dois. Aceitar tudo troca a data por uma que o próprio documento desmente em
  outros dois lugares; rejeitar tudo devolve o nome do clube escrito errado.
  Só percorrer marca a marca fecha a tarefa, que é o que o recurso existe para
  ensinar.

  ── A substituição precisa poder errar ───────────────────────────────────
  A liderança pede que "criança" vire "desbravador" em todo o texto, e o
  documento tem as duas formas: duas no singular e duas no plural. Um
  Substituir Tudo sem "palavras inteiras" transforma "crianças" em
  "desbravadors" nos dois lugares, de uma vez, e nada estoura — a tela mostra
  um documento com cara de pronto e duas palavras que não existem.

  É de propósito, e é a lição: o programa não protege, ele oferece as caixas.
  Um laboratório que só aceitasse a substituição certa mediria ter clicado no
  botão. As saídas são as de verdade — Ctrl+Z, que desfaz o Substituir Tudo
  inteiro, e Recomeçar.

  E há dois caminhos certos, não um: marcar "palavras inteiras" e fazer duas
  passagens, ou trocar o **plural primeiro** e o singular depois. O segundo
  funciona mesmo com as caixas desmarcadas, e quem o descobre aprendeu mais do
  que quem marcou a caixa.
*/

export type Secao = 'abertura' | 'programacao' | 'quem-foi' | 'fecho';

export type Doc = DocDoWord<Secao>;
export type Bloco = BlocoDoWord<Secao>;
export type Paragrafo = ParagrafoDoWord<Secao>;

const linha = (id: string, secao: Secao, texto: string): Paragrafo =>
  linhaDe(id, secao, texto);

const titulo = (id: string, secao: Secao, texto: string): Paragrafo =>
  ({ ...linhaDe(id, secao, texto), estilo: 'Título 1' });

/** Um parágrafo montado de pedaços, que é o que uma marca de revisão exige. */
const emPedacos = (id: string, secao: Secao, trechos: Trecho[]): Paragrafo =>
  ({ tipo: 'paragrafo', id, secao, trechos, estilo: 'Normal' });

/** O que a liderança riscou. */
const riscado = (id: string, texto: string): Trecho =>
  ({ ...trechoDe(id, texto), revisao: { autor: 'lideranca', tipo: 'excluido' } });

/** O que a liderança escreveu por cima. */
const inserido = (id: string, texto: string): Trecho =>
  ({ ...trechoDe(id, texto), revisao: { autor: 'lideranca', tipo: 'inserido' } });

/* ── O que a lição cobra que o texto passe a dizer ────────────────────────── */

/**
 * As quatro ocorrências da palavra que a liderança pediu para trocar.
 *
 * São frases escolhidas para **sobreviver à troca**: "cada", "quarenta e nove"
 * e "mais de trinta" não têm gênero, então trocar a palavra não deixa
 * "Nenhuma desbravador" no documento. Substituir e Substituir entregam
 * português torto com uma frase mal escolhida, e o exercício passaria a
 * premiar um texto que ninguém entregaria.
 *
 * Duas no singular e duas no plural, porque é o plural que a substituição
 * ingênua destrói: sem "palavras inteiras", "crianças" vira "desbravadors".
 */
export const TROCAS_ESPERADAS = [
  'Cada desbravador levou',
  'mais de trinta desbravadores',
  'quarenta e nove desbravadores',
  'cada desbravador que esqueceu',
] as const;

/** O estrago que o Substituir Tudo desatento produz, e que a meta recusa. */
export const PALAVRA_ESTRAGADA = 'desbravadors';

/** O parágrafo em que a marca da data está, e onde o comentário próprio vai. */
export const PARAGRAFO_DA_DATA = 'pr-3';

/** O comentário que a liderança deixou, e que espera resposta. */
export const COMENTARIO_DA_LIDERANCA = 'c-lideranca';

/* ── O documento como ele voltou ──────────────────────────────────────────── */

/**
 * O relato depois de a liderança ler.
 *
 * Duas marcas, e uma pergunta. A do nome do clube está certa — "Pioneros" é
 * erro de digitação. A da data está errada, e o próprio documento diz isso em
 * outros dois lugares: o título e o fecho falam em domingo, e 15 de março de
 * 2026 é o terceiro domingo do mês.
 *
 * O controle de alterações chega **desligado**, embora o documento já venha
 * marcado. É o que acontece de verdade: a marca é do arquivo e o controle é do
 * estado dele, e quem recebe um documento revisado e sai editando sem ligar
 * nada devolve mudanças que ninguém vê.
 */
export const DIA_DO_DESBRAVADOR_INICIAL: Doc = {
  blocos: [
    titulo('titulo', 'abertura', 'Dia do Desbravador — domingo, 15 de março de 2026'),
    emPedacos('clube', 'abertura', [
      trechoDe('clube-a', 'Clube de Desbravadores '),
      riscado('clube-b', 'Pioneros'),
      inserido('clube-c', 'Pioneiros'),
      trechoDe('clube-d', ' — Regional Centro'),
    ]),
    linha('entrega', 'abertura', 'Relato entregue à secretaria em 18 de março.'),

    titulo('h-prog', 'programacao', 'A programação'),
    linha('pr-1', 'programacao', 'A concentração foi no pátio da igreja às 8h30, com chamada por unidade. Cada criança levou o próprio almoço e uma garrafa de água.'),
    linha('pr-2', 'programacao', 'O desfile começou às 10h na praça, com mais de trinta crianças de lenço novo, e a tarde teve gincana e a entrega das especialidades.'),
    emPedacos(PARAGRAFO_DA_DATA, 'programacao', [
      trechoDe('pr3-a', 'Tudo aconteceu no '),
      riscado('pr3-b', 'domingo'),
      inserido('pr3-c', 'sábado'),
      trechoDe('pr3-d', ', e a programação terminou às 17h, com o culto no salão.'),
    ]),

    titulo('h-quem', 'quem-foi', 'Quem foi'),
    linha('qf-1', 'quem-foi', 'Foram quarenta e nove crianças e oito líderes, de cinco unidades.'),
    linha('qf-2', 'quem-foi', 'Os líderes de plantão: Raphael, Ana, Márcia, Joel, Ester, Davi, Sara, Tiago e Rute.'),
    linha('qf-3', 'quem-foi', 'Sobraram quatro lenços, um para cada criança que esqueceu o seu em casa.'),

    titulo('h-fecho', 'fecho', 'O que fica'),
    linha('fe-1', 'fecho', 'Quem não pôde ir recebeu a lembrança no sábado seguinte, na reunião de unidade.'),
    linha('fe-2', 'fecho', 'O próximo Dia do Desbravador cai no terceiro domingo de março do ano que vem.'),
  ],
  colunas: { abertura: 1, programacao: 1, 'quem-foi': 1, fecho: 1 },
  sumario: null,
  controlarAlteracoes: false,
  comentarios: [
    {
      id: COMENTARIO_DA_LIDERANCA,
      /* O trecho, e não o bloco: `linhaDe` nomeia o dela com o sufixo `-a`, e
         é nele que a palavra que a substituição troca está escrita. Prender o
         comentário no id do bloco o deixaria pendurado em nada desde o
         primeiro instante, sem erro nenhum e sem a margem mostrar nada. */
      trecho: 'qf-1-a',
      autor: 'lideranca',
      texto: 'A lista logo abaixo tem nove nomes, e aqui está escrito oito. Qual dos dois está certo?',
      respostas: [],
      resolvido: false,
    },
  ],
};

export const TEXTO_ORIGINAL = textoDoDoc(DIA_DO_DESBRAVADOR_INICIAL);

/* ── Ler o documento ──────────────────────────────────────────────────────── */

/** Os ids dos trechos de um parágrafo, que é onde um comentário se pendura. */
export const trechosDoParagrafo = (d: Doc, blocoId: string): string[] =>
  paragrafos(d).find(b => b.id === blocoId)?.trechos.map(x => x.id) ?? [];

/** O comentário da liderança, como ele está agora. */
export const comentarioDaLideranca = (d: Doc): Comentario | undefined =>
  comentariosDoDoc(d).find(c => c.id === COMENTARIO_DA_LIDERANCA);

/**
 * O comentário que a pessoa deixou no parágrafo da data.
 *
 * Ele se procura pelo **parágrafo**, e não pelo trecho: a substituição parte
 * trechos em pedaços, e um comentário preso a um id que sumiu seria um
 * comentário que a tarefa deixa de enxergar depois de um Substituir Tudo.
 */
export const comentarioProprioNaData = (d: Doc): Comentario | undefined => {
  const trechos = trechosDoParagrafo(d, PARAGRAFO_DA_DATA);
  return comentariosDoDoc(d).find(c =>
    c.autor === 'voce' && trechos.includes(c.trecho) && c.texto.trim() !== '');
};

/* ── As metas ─────────────────────────────────────────────────────────────── */

export interface MetaDaRevisao {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (d: Doc) => boolean;
}

export const METAS_DA_REVISAO: MetaDaRevisao[] = [
  {
    id: 'controlar',
    titulo: 'Ligar o controle de alterações',
    detalhe: 'O documento voltou marcado, e mesmo assim o controle chega desligado — a marca é '
      + 'do arquivo, e o controle é do estado dele. Editar agora muda o texto em silêncio, e a '
      + 'liderança receberia de volta um documento sem saber o que você mexeu.',
    onde: 'Revisão › Controle › Controlar Alterações',
    passos: [
      'Abra a guia Revisão.',
      'Clique em Controlar Alterações. O botão fica aceso.',
      'Daqui em diante, tudo o que você mudar aparece marcado e assinado com o seu nome.',
    ],
    feita: d => d.controlarAlteracoes === true,
  },
  {
    id: 'resolver',
    titulo: 'Aceitar a marca que está certa e rejeitar a que não está',
    detalhe: 'São duas. "Pioneros" é erro de digitação e a correção está certa. A troca de '
      + 'domingo por sábado não está: o título e o fecho falam em domingo, e 15 de março de 2026 '
      + 'é o terceiro domingo do mês. Aceitar Todas e Rejeitar Todas erram as duas, cada um do '
      + 'seu jeito — este é o caso em que se percorre marca a marca.',
    onde: 'Revisão › Alterações › Aceitar e Rejeitar',
    passos: [
      'Use Próxima para andar de marca em marca, ou clique direto numa delas.',
      'No nome do clube, Aceitar: "Pioneiros" é o certo.',
      'Na data, Rejeitar: o documento diz domingo em outros dois lugares.',
      'Confira que não sobrou marca da liderança pendente.',
    ],
    feita: d => {
      const t = textoVisivel(d);
      return revisoesDe(d, 'lideranca').length === 0
        && t.includes('Pioneiros')
        && t.includes('Tudo aconteceu no domingo');
    },
  },
  {
    id: 'responder',
    titulo: 'Responder a pergunta da liderança e resolver o comentário',
    detalhe: 'Ela perguntou quantos líderes foram, porque a lista tem nove nomes e o texto diz '
      + 'oito. Responder no próprio comentário deixa a conversa encadeada ali; resolver sem '
      + 'responder fecha o assunto sem dizer nada a quem perguntou.',
    onde: 'na margem, no balão do comentário',
    passos: [
      'Clique no comentário da liderança, na margem.',
      'Conte os nomes da lista e escreva a resposta no campo de resposta.',
      'Só então clique em Resolver.',
    ],
    /* Resolver é um clique. Sem exigir a resposta, a tarefa premiaria fechar o
       assunto sem dizer nada — é "zero link não é zero link quebrado" aplicado
       a uma conversa. */
    feita: d => {
      const c = comentarioDaLideranca(d);
      if (!c) return false;
      return c.resolvido
        && c.respostas.some(r => r.autor === 'voce' && r.texto.trim() !== '');
    },
  },
  {
    id: 'comentar',
    titulo: 'Dizer por que você rejeitou a mudança da data',
    detalhe: 'Rejeitar em silêncio devolve o documento com a marca sumida e sem explicação — '
      + 'quem revisou vai achar que você não viu. Comentário é para o que é pergunta ou '
      + 'discordância; escrever a correção dentro dele é que não serve, porque obriga a outra '
      + 'pessoa a digitar de novo.',
    onde: 'Revisão › Comentários › Novo Comentário, no parágrafo da data',
    passos: [
      'Clique no parágrafo que fala em domingo.',
      'Em Revisão, clique em Novo Comentário.',
      'Escreva por que a data está certa como estava.',
    ],
    feita: d => comentarioProprioNaData(d) !== undefined,
  },
  {
    id: 'substituir',
    titulo: 'Trocar "criança" por "desbravador" em todo o texto, sem estragar o resto',
    detalhe: 'São quatro lugares, dois no singular e dois no plural. Substituir Tudo sem '
      + '"palavras inteiras" transforma "crianças" em "desbravadors" — em todo o documento, de '
      + 'uma vez, e sem nada avisar. Marque a caixa e faça duas passagens, ou troque o plural '
      + 'primeiro. Se der errado, Ctrl+Z desfaz o Substituir Tudo inteiro.',
    onde: 'Início › Edição › Substituir (Ctrl+H)',
    passos: [
      'Abra Substituir e olhe as duas caixas de baixo antes de clicar em nada.',
      'Marque "palavras inteiras" e troque "crianças" por "desbravadores".',
      'Depois troque "criança" por "desbravador".',
      'Leia os quatro lugares: nenhum pode ter virado "desbravadors".',
    ],
    feita: d => {
      const t = textoVisivel(d);
      return !/crianç/i.test(t)
        && !t.includes(PALAVRA_ESTRAGADA)
        && TROCAS_ESPERADAS.every(frase => t.includes(frase));
    },
  },
];

export const metaDaVez = (d: Doc) =>
  METAS_DA_REVISAO.find(m => !m.feita(d)) ?? null;

export { textoDoDoc, textoVisivel, paragrafos, revisoesDe, comentariosDoDoc };
