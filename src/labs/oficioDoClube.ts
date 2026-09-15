import {
  blocoDe, linhaDe, trechoDe, textoDoBloco, textoDoDoc, comFormatacaoDireta,
  sumarioAtualizado, titulosDoDoc, paragrafos,
  type Doc as DocDoWord, type Bloco as BlocoDoWord, type Trecho, type Estilo,
} from './documento';

/*
  O relatório do clube como o examinador o entrega: escrito por inteiro e
  formatado inteiramente à mão.

  ── Por que ele parece pronto ────────────────────────────────────────────
  Nenhum parágrafo tem estilo: o nome do relatório e os quatro títulos de
  seção são `Normal` com negrito, tamanho e cor postos um a um. Na tela isso
  é indistinguível de um documento bem feito — e é esse o ponto, porque é
  assim que ele chega na vida real, das mãos de quem formatou apertando os
  botões da barra.

  O que denuncia não está na aparência, está no que o documento **não faz**:
  mandar gerar o sumário devolve uma caixa vazia. O sumário lê estilo, e não
  negrito. É a mesma família do laboratório da AP044 em que o sumário sai
  desatualizado, e da tabela que abre com oito verificações verdes: o defeito
  é invisível de dentro.

  ── O texto não pode mudar ───────────────────────────────────────────────
  O requisito 6 diz "sem alterar uma palavra do texto", e é por isso que
  `TEXTO_ORIGINAL` existe como constante, congelado aqui. Conferir contra uma
  cópia tirada no meio do caminho deixaria passar quem apagasse um parágrafo e
  o reescrevesse — e apagar para reescrever é exatamente o atalho que o
  requisito existe para proibir, porque num documento de verdade ele é a
  forma mais rápida de perder um parágrafo inteiro sem perceber.
*/

export type Secao = 'capa' | 'abertura' | 'atividades' | 'numeros' | 'fecho';

export type Doc = DocDoWord<Secao>;
export type Bloco = BlocoDoWord<Secao>;

/** O azul que quem formata à mão escolhe na paleta, por parecer o do Word. */
const AZUL_A_MAO = '#1F4E79';

/** Um trecho com formatação direta em cima. */
const comDireta = (id: string, texto: string, direta: Trecho['direta']): Trecho =>
  ({ ...trechoDe(id, texto), direta });

/** Uma linha inteira formatada à mão, que é como os títulos daqui chegam. */
const aMao = (id: string, secao: Secao, texto: string, direta: Trecho['direta']): Bloco =>
  blocoDe(id, secao, [comDireta(`${id}-a`, texto, direta)]);

const linha = (id: string, secao: Secao, texto: string): Bloco =>
  linhaDe(id, secao, texto);

/**
 * O documento de partida.
 *
 * Os cinco títulos — o nome do relatório e as quatro seções — estão em negrito
 * e no tamanho de um título, e nenhum deles é um título. Há ainda um versículo
 * que alguém pôs em itálico à mão, no lugar de usar Citação, e uma legenda de
 * foto no mesmo caso.
 */
export const OFICIO_INICIAL: Doc = {
  blocos: [
    aMao('titulo', 'capa', 'Relatório de Atividades — Primeiro Semestre',
      { negrito: true, tamanho: 16, cor: AZUL_A_MAO }),
    linha('clube', 'capa', 'Clube de Desbravadores Pioneiros — Regional Centro'),
    linha('periodo', 'capa', 'Período de janeiro a junho, entregue à liderança em 3 de julho.'),

    aMao('h-abertura', 'abertura', 'Apresentação',
      { negrito: true, tamanho: 13, cor: AZUL_A_MAO }),
    linha('ab-1', 'abertura', 'Este relatório reúne o que o clube fez no primeiro semestre, quantas pessoas participaram de cada atividade e o que ficou pendente para o segundo. Ele foi escrito pela secretaria a partir das atas das reuniões de unidade.'),
    linha('ab-2', 'abertura', 'A ordem das seções segue a do calendário do ano, e não a da importância — quem procura uma atividade específica acha pela data em que ela aconteceu.'),

    aMao('h-atividades', 'atividades', 'As atividades do semestre',
      { negrito: true, tamanho: 13, cor: AZUL_A_MAO }),
    linha('at-1', 'atividades', 'O acampamento de inverno ocupou o fim de semana de 20 a 22 de junho, no sítio da regional, com barracas por unidade e programação de sexta à noite a domingo de manhã.'),
    linha('at-2', 'atividades', 'A campanha de alimentos aconteceu em duas sextas de maio, com recolhimento na igreja e entrega no bairro vizinho na semana seguinte.'),
    linha('at-3', 'atividades', 'A classe de Amigo teve dezoito encontros, um por sábado, e a de Companheiro teve dezesseis — duas datas caíram em feriado e foram remarcadas para o segundo semestre.'),
    aMao('legenda-foto', 'atividades', 'Figura 1 — A montagem das barracas na sexta à noite.',
      { italico: true, tamanho: 9 }),

    aMao('h-numeros', 'numeros', 'Os números',
      { negrito: true, tamanho: 13, cor: AZUL_A_MAO }),
    linha('nu-1', 'numeros', 'O clube fechou o semestre com sessenta e dois desbravadores matriculados, contra cinquenta e quatro no semestre anterior. A frequência média aos sábados foi de quarenta e sete.'),
    linha('nu-2', 'numeros', 'O acampamento levou quarenta e nove pessoas, o maior número dos últimos três anos. A campanha de alimentos recolheu trezentos e onze quilos.'),

    aMao('h-fecho', 'fecho', 'O que fica para o segundo semestre',
      { negrito: true, tamanho: 13, cor: AZUL_A_MAO }),
    linha('fe-1', 'fecho', 'Faltam as duas aulas remarcadas da classe de Companheiro, a investidura das duas classes e a prestação de contas do acampamento, que depende das notas fiscais do transporte.'),
    aMao('versiculo', 'fecho', 'Tudo quanto te vier à mão para fazer, faze-o conforme as tuas forças.',
      { italico: true }),
    linha('assinatura', 'fecho', 'Secretaria do Clube de Desbravadores Pioneiros'),
  ],
  colunas: { capa: 1, abertura: 1, atividades: 1, numeros: 1, fecho: 1 },
  sumario: null,
};

/**
 * O texto do documento como ele chegou, congelado.
 *
 * É contra isto que "sem alterar uma palavra" se mede. Ele é derivado do
 * documento de partida em vez de escrito à parte de propósito: duas cópias do
 * mesmo texto divergiriam no primeiro ajuste de redação, e a trava passaria a
 * reprovar um documento que ninguém mexeu.
 */
export const TEXTO_ORIGINAL = textoDoDoc(OFICIO_INICIAL);

/** O que cada título deve virar. É a resposta do requisito 4.1. */
export const ESTILO_ESPERADO: Record<string, Estilo> = {
  titulo: 'Título 1',
  'h-abertura': 'Título 2',
  'h-atividades': 'Título 2',
  'h-numeros': 'Título 2',
  'h-fecho': 'Título 2',
  'legenda-foto': 'Legenda',
  versiculo: 'Citação',
};

/* ── As metas ─────────────────────────────────────────────────────────────── */

export interface MetaDoOficio {
  id: string;
  titulo: string;
  detalhe: string;
  /** Onde, na faixa de opções, isso se resolve. */
  onde: string;
  passos: string[];
  feita: (d: Doc) => boolean;
}

const um = (d: Doc, id: string) => paragrafos(d).find(b => b.id === id);

/**
 * O texto está intacto.
 *
 * Não é uma tarefa da lista — é uma condição que viaja junto das outras, e por
 * isso entra como conjunção de cada meta que mexe em parágrafo. Como tarefa
 * própria ela abriria **verde**, que é o que `veredas.test.ts` reprova, e com
 * razão: uma lista em que um item já está feito no primeiro segundo ensina a
 * não ler a lista.
 */
export const textoIntacto = (d: Doc) => textoDoDoc(d) === TEXTO_ORIGINAL;

export const METAS_DO_OFICIO: MetaDoOficio[] = [
  {
    id: 'titulos',
    titulo: 'Dar estilo de título aos cinco títulos',
    detalhe: 'O nome do relatório recebe Título 1; as quatro seções recebem Título 2. '
      + 'Eles já parecem títulos, e não são: estão em negrito e maiores, e continuam sendo parágrafos comuns.',
    onde: 'Início › Estilos',
    passos: [
      'Clique em qualquer palavra do nome do relatório.',
      'Na galeria de Estilos, escolha Título 1. Repare que a aparência muda pouco — ela já estava imitando um título.',
      'Repita em "Apresentação", "As atividades do semestre", "Os números" e "O que fica para o segundo semestre", agora com Título 2.',
      'Não apague nem redigite nada: o requisito pede o documento consertado com o mesmo texto.',
    ],
    feita: d => textoIntacto(d)
      && um(d, 'titulo')?.estilo === 'Título 1'
      && ['h-abertura', 'h-atividades', 'h-numeros', 'h-fecho']
        .every(id => um(d, id)?.estilo === 'Título 2'),
  },
  {
    id: 'citacao-legenda',
    titulo: 'Dar estilo ao versículo e à legenda da foto',
    detalhe: 'Os dois estão em itálico posto à mão. O versículo é Citação e a linha da figura é Legenda — '
      + 'com o estilo certo, os dois passam a acompanhar qualquer mudança que o documento sofra depois.',
    onde: 'Início › Estilos',
    passos: [
      'Clique no versículo, no fim do relatório, e escolha Citação.',
      'Clique na linha "Figura 1 — ..." e escolha Legenda.',
    ],
    feita: d => textoIntacto(d)
      && um(d, 'versiculo')?.estilo === 'Citação'
      && um(d, 'legenda-foto')?.estilo === 'Legenda',
  },
  {
    id: 'limpar',
    titulo: 'Tirar toda a formatação direta',
    detalhe: 'Aplicar o estilo não apaga o negrito e o tamanho que estavam por cima — eles continuam lá, '
      + 'vencendo o estilo. Enquanto não saírem, mudar o estilo não muda nada, que é o contrário do que a vereda inteira ensina.',
    onde: 'Início › Fonte › Limpar Toda a Formatação',
    passos: [
      'Selecione o parágrafo — ou use Selecionar Tudo, que aqui é o caminho mais curto.',
      'No grupo Fonte, clique em "Limpar Toda a Formatação" (o A com a borracha).',
      'Confira: o estilo continua aplicado, e o que sai é só o que alguém tinha posto por cima dele.',
    ],
    feita: d => textoIntacto(d) && comFormatacaoDireta(d).length === 0,
  },
  {
    id: 'modificar',
    titulo: 'Modificar o estilo Título 2 e ver as quatro seções mudarem juntas',
    detalhe: 'É o requisito 8, e é a razão de tudo o que veio antes: mexer uma vez na definição de Título 2 '
      + 'e as quatro seções mudarem no mesmo instante. Formatadas à mão, seriam quatro alterações — e uma esquecida.',
    onde: 'Início › Estilos › botão direito em Título 2 › Modificar',
    passos: [
      'Clique com o botão direito em Título 2, na galeria de Estilos.',
      'Escolha Modificar.',
      'Mude o tamanho ou a cor e confirme.',
      'Olhe as quatro seções: todas mudaram, e você mexeu em uma coisa só.',
    ],
    feita: d => {
      const ajuste = d.estilos?.['Título 2'];
      return !!ajuste && Object.keys(ajuste).length > 0
        && ['h-abertura', 'h-atividades', 'h-numeros', 'h-fecho']
          .every(id => um(d, id)?.estilo === 'Título 2');
    },
  },
  {
    id: 'sumario',
    titulo: 'Gerar o sumário',
    detalhe: 'Antes dos estilos ele sairia vazio — o sumário lê estilo, e não negrito. '
      + 'Agora ele tem o que ler, e precisa listar os cinco títulos.',
    onde: 'Referências › Sumário',
    passos: [
      'Vá à guia Referências.',
      'Clique em Sumário e mande gerar.',
      'Confira que as cinco linhas apareceram, com as seções recuadas sob o nome do relatório.',
    ],
    feita: d => sumarioAtualizado(d) && titulosDoDoc(d).length >= 5,
  },
];

/** A primeira meta por fazer, que é de quem o passo a passo fala. */
export const metaDaVez = (d: Doc) => METAS_DO_OFICIO.find(m => !m.feita(d)) ?? null;

export { textoDoBloco, textoDoDoc, comFormatacaoDireta };
