/**
 * As três lições da CC006 que nenhum programa tem onde guardar: a proposta, o
 * diário de bordo e o roteiro da apresentação.
 *
 * ── Por que são tela da plataforma ───────────────────────────────────────
 * Os requisitos 3, 4 e 5 acontecem em programas — o editor de Python, o
 * terminal com o Git —, e as lições deles abrem nos laboratórios que a CC004 e
 * a CC003 já ensinaram. Os requisitos 2, 6 e 7 não: uma proposta, um diário e
 * uma apresentação se escrevem para uma pessoa, e não para um computador. É a
 * regra do caderno da CC-ES009 e da CC-DG006, pelo motivo escrito lá.
 *
 * ── O projeto é o almoxarifado ───────────────────────────────────────────
 * O mesmo programa das quatro lições de Python e das duas de Git. A proposta
 * é a dele, o diário conta os problemas que de fato apareceram nele — o "dez"
 * que derrubava o programa, o nome repetido, o id 99 que não dizia nada, o
 * `git add .` que juntava tudo —, e a decisão técnica da apresentação é uma
 * das que ele tomou. Um projeto inventado para cada lição ensinaria que cada
 * etapa acontece num programa de mentira.
 */

import { palavrasDe, publicoDefinido, sem } from './projetoDeDesign';

export type LicaoDaCc006 = 'proposta' | 'diario' | 'apresentacao';

/* ── A proposta, que é o requisito 2 ──────────────────────────────────────── */

/**
 * O dia em que o examinador aprova. É véspera do primeiro commit do
 * almoxarifado, que é em 17 de outubro — a ordem que o requisito pede,
 * escrita na própria história do repositório.
 */
export const HOJE_DA_PROPOSTA = '2026-10-16';

export interface PropostaDePrograma {
  /** O problema a resolver: o que acontece hoje, e por que é ruim. */
  problema: string;
  /** Quem vai usar o programa. */
  usuario: string;
  /** Uma funcionalidade por linha. */
  funcionalidades: string[];
  /**
   * Data, e não booleano, pela razão escrita na CC-ES012: o requisito não pede
   * que a aprovação exista, pede que ela venha antes.
   */
  aprovadaEm: string | null;
  devolvida: string | null;
}

export const PROPOSTA_EM_BRANCO: PropostaDePrograma = {
  problema: '', usuario: '', funcionalidades: [], aprovadaEm: null, devolvida: null,
};

export const PALAVRAS_DO_PROBLEMA = 12;
export const PALAVRAS_DA_FUNCIONALIDADE = 3;

/**
 * As quatro operações do requisito 3.2, e os verbos com que alguém as escreve.
 *
 * A proposta que esquece uma delas não é proposta deste projeto: o examinador
 * aprovaria um programa que não cumpre a especialidade. Os verbos são os do
 * dia a dia — ninguém escreve "realizar operação de inserção" numa proposta.
 * E são verbos inteiros onde o começo engana: "cri" acharia "crianças", e
 * "list" acharia "lista", que aparece em funcionalidade de qualquer operação.
 */
export const OPERACOES = [
  { id: 'criar', nome: 'criar', verbos: ['cadastr', 'criar', 'crie ', 'inclu', 'adicion', 'registr', 'insir', 'inser', 'anot'] },
  { id: 'consultar', nome: 'consultar', verbos: ['consult', 'listar', 'liste ', 'ver ', 'mostr', 'procur', 'busc', 'pesquis', 'exib'] },
  { id: 'alterar', nome: 'alterar', verbos: ['alter', 'mud', 'edit', 'atualiz', 'corrig', 'troc'] },
  { id: 'remover', nome: 'remover', verbos: ['remov', 'exclu', 'apag', 'tir', 'delet', 'elimin'] },
] as const;

export type Operacao = (typeof OPERACOES)[number]['id'];

/** Que operação uma funcionalidade escrita faz, pelo verbo que ela usa. */
export function operacoesDe(texto: string): Operacao[] {
  const t = ` ${sem(texto)} `;
  return OPERACOES.filter(o => o.verbos.some(v => t.includes(` ${v}`))).map(o => o.id);
}

export const funcionalidadesEscritas = (p: PropostaDePrograma) =>
  p.funcionalidades.filter(f => palavrasDe(f).length >= PALAVRAS_DA_FUNCIONALIDADE);

export const operacoesQueFaltam = (p: PropostaDePrograma): Operacao[] => {
  const tem = new Set(funcionalidadesEscritas(p).flatMap(operacoesDe));
  return OPERACOES.map(o => o.id).filter(id => !tem.has(id));
};

/** O que falta na proposta, nas palavras de quem a devolve. Vazio é completa. */
export function faltasDaProposta(p: PropostaDePrograma): string[] {
  const faltas: string[] = [];
  if (palavrasDe(p.problema).length < PALAVRAS_DO_PROBLEMA) {
    faltas.push('O problema precisa dizer o que acontece hoje e por que isso atrapalha.');
  }
  if (!publicoDefinido(p.usuario)) faltas.push('Quem vai usar precisa ser gente de verdade, e não "todo mundo".');
  const faltam = operacoesQueFaltam(p);
  if (faltam.length) {
    faltas.push(`As funcionalidades não dizem como ${faltam.join(', ')} — e o programa precisa fazer as quatro coisas.`);
  }
  return faltas;
}

export function enviarParaAprovacao(p: PropostaDePrograma, hoje: string): PropostaDePrograma {
  const faltas = faltasDaProposta(p);
  if (faltas.length) return { ...p, devolvida: faltas.join(' ') };
  return { ...p, aprovadaEm: p.aprovadaEm ?? hoje, devolvida: null };
}

/* ── O diário de bordo, que é o requisito 6 ───────────────────────────────── */

export interface RegistroDoDiario {
  /** O que deu errado, contado como problema e não como sintoma. */
  problema: string;
  /** O que apareceu na tela — é o que faz alguém reconhecer o mesmo problema depois. */
  comoApareceu: string;
  /** O que foi feito, e por que resolveu. */
  solucao: string;
}

export const REGISTRO_EM_BRANCO: RegistroDoDiario = { problema: '', comoApareceu: '', solucao: '' };

export const PALAVRAS_DO_PROBLEMA_NO_DIARIO = 8;
export const PALAVRAS_DO_QUE_APARECEU = 4;
export const PALAVRAS_DA_SOLUCAO = 8;

/**
 * O que aconteceu no caminho deste projeto, para lembrar — e não para copiar.
 *
 * São os tropeços que as lições de Python e de Git puseram de propósito. O
 * diário pede os **três maiores**, e escolher é parte do requisito: quem
 * registra tudo não disse qual pesou.
 */
export const LEMBRANCAS_DO_CAMINHO = [
  'O programa fechava com ValueError quando alguém digitava "dez" na quantidade.',
  'Um material sem nome entrava no banco quando se apertava Enter direto.',
  'Cadastrar a Corda duas vezes fechava o programa com IntegrityError.',
  'Remover o id 99 não dizia nada, e parecia ter removido.',
  'O git add . juntava quatro mudanças diferentes num commit só.',
  'Sem o commit, o material cadastrado sumia quando o programa fechava.',
];

const limpo = (s: string) => sem(s).replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim();

/** Três textos que não são o mesmo texto: a mesma frase três vezes não registra três problemas. */
const distintos = (textos: string[]) => new Set(textos.map(limpo)).size === textos.length;

export const problemasRegistrados = (d: RegistroDoDiario[]) =>
  d.length === 3
  && d.every(r => palavrasDe(r.problema).length >= PALAVRAS_DO_PROBLEMA_NO_DIARIO)
  && distintos(d.map(r => r.problema))
  && d.every(r => !LEMBRANCAS_DO_CAMINHO.some(l => limpo(l) === limpo(r.problema)));

export const sintomasRegistrados = (d: RegistroDoDiario[]) =>
  d.length === 3 && d.every(r => palavrasDe(r.comoApareceu).length >= PALAVRAS_DO_QUE_APARECEU);

/**
 * Uma solução para cada um, e a solução não é o problema escrito de novo.
 *
 * "O programa fechava" na coluna do problema e "o programa fechava, aí eu
 * arrumei" na da solução preenche as duas sem dizer nada a quem ler o diário
 * daqui a um ano — que é para quem ele existe.
 */
export const solucoesRegistradas = (d: RegistroDoDiario[]) =>
  d.length === 3
  && d.every(r => palavrasDe(r.solucao).length >= PALAVRAS_DA_SOLUCAO && limpo(r.solucao) !== limpo(r.problema))
  && distintos(d.map(r => r.solucao));

/* ── A apresentação, que é o requisito 7 ──────────────────────────────────── */

export type ParteDaApresentacao = 'problema' | 'demonstracao' | 'decisao' | 'perguntas';

export const PARTES_DA_APRESENTACAO: { id: ParteDaApresentacao; nome: string; obrigatoria: boolean }[] = [
  { id: 'problema', nome: 'O problema e quem usa', obrigatoria: true },
  { id: 'demonstracao', nome: 'O programa funcionando', obrigatoria: true },
  { id: 'decisao', nome: 'A decisão técnica e o porquê', obrigatoria: true },
  { id: 'perguntas', nome: 'Perguntas do examinador', obrigatoria: false },
];

export const MINUTOS_DA_APRESENTACAO = 15;

export type RoteiroDaApresentacao = Partial<Record<ParteDaApresentacao, number>>;

export const minutosDoRoteiro = (r: RoteiroDaApresentacao) =>
  Object.values(r).reduce<number>((s, m) => s + (m ?? 0), 0);

export const cabeEmQuinze = (r: RoteiroDaApresentacao) =>
  minutosDoRoteiro(r) <= MINUTOS_DA_APRESENTACAO
  && PARTES_DA_APRESENTACAO.every(p => !p.obrigatoria || (r[p.id] ?? 0) > 0);

/**
 * A demonstração leva a maior fatia. É a pecasNoCentro da CC-DG006, pelo
 * mesmo motivo: o requisito pede o programa **funcionando**, e quinze minutos
 * falando sobre um programa que aparece por dois são a apresentação de um
 * projeto que não se viu.
 */
export const demonstracaoNoCentro = (r: RoteiroDaApresentacao) =>
  (r.demonstracao ?? 0) > 0
  && PARTES_DA_APRESENTACAO.every(p => p.id === 'demonstracao' || (r[p.id] ?? 0) <= (r.demonstracao ?? 0));

/** O que se mostra rodando: as quatro operações e um erro que o programa atravessa. */
export const O_QUE_DEMONSTRAR = [
  { id: 'cadastrar', nome: 'Cadastrar um material' },
  { id: 'listar', nome: 'Listar os materiais' },
  { id: 'alterar', nome: 'Alterar a quantidade de um' },
  { id: 'remover', nome: 'Remover um' },
  { id: 'erro', nome: 'Digitar errado de propósito e ver o programa continuar' },
] as const;

export type Demonstracao = (typeof O_QUE_DEMONSTRAR)[number]['id'];

/**
 * As decisões que o almoxarifado tomou de verdade.
 *
 * O requisito pede para justificar **uma**, e justificar é dizer por que esta
 * e não a outra. Por isso cada uma traz a alternativa mais próxima escrita, e
 * a justificativa tem de nomear o que se perde com ela — "porque é melhor" não
 * justifica nada.
 */
export const DECISOES_DO_PROJETO = [
  { id: 'sqlite', nome: 'Guardar num banco SQLite, e não num arquivo CSV' },
  { id: 'parametros', nome: 'Passar os valores com ?, e não colados no comando' },
  { id: 'arquivos', nome: 'Separar banco.py e entrada.py do menu' },
  { id: 'unique', nome: 'Deixar o banco recusar o nome repetido, e não conferir antes' },
  { id: 'rowcount', nome: 'Avisar pelo rowcount quando o id não existe' },
] as const;

export type DecisaoDoProjeto = (typeof DECISOES_DO_PROJETO)[number]['id'];

export interface DecisaoJustificada {
  escolhida: DecisaoDoProjeto | null;
  /** O que se perderia fazendo do outro jeito. */
  alternativa: string;
  porque: string;
}

export const PALAVRAS_DA_JUSTIFICATIVA = 15;
export const PALAVRAS_DA_ALTERNATIVA = 3;

export const decisaoJustificada = (d: DecisaoJustificada) =>
  d.escolhida !== null
  && palavrasDe(d.porque).length >= PALAVRAS_DA_JUSTIFICATIVA
  && palavrasDe(d.alternativa).length >= PALAVRAS_DA_ALTERNATIVA
  && limpo(d.alternativa) !== limpo(d.porque);

/* ── O contexto e as metas ────────────────────────────────────────────────── */

export interface ContextoDaCc006 {
  proposta: PropostaDePrograma;
  /**
   * Começou a programar antes de a proposta voltar aprovada. É o campo da
   * CC-ES012: sem um caminho para fazer errado, "a execução não pode ser
   * iniciada antes da aprovação" seria uma frase sem nada por trás.
   */
  comecouAntes: boolean;
  diario: RegistroDoDiario[];
  roteiro: RoteiroDaApresentacao;
  demonstrar: Demonstracao[];
  decisao: DecisaoJustificada;
}

export const contextoInicial = (): ContextoDaCc006 => ({
  proposta: PROPOSTA_EM_BRANCO,
  comecouAntes: false,
  diario: [REGISTRO_EM_BRANCO, REGISTRO_EM_BRANCO, REGISTRO_EM_BRANCO],
  roteiro: {},
  demonstrar: [],
  decisao: { escolhida: null, alternativa: '', porque: '' },
});

export interface MetaDaCc006 {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDaCc006) => boolean;
}

const METAS: Record<LicaoDaCc006, MetaDaCc006[]> = {
  proposta: [
    {
      id: 'problema-e-usuario',
      titulo: 'Dizer o problema e quem vai usar',
      detalhe: 'O que acontece hoje no almoxarifado, por que isso atrapalha, e quem vai abrir o programa.',
      onde: 'Na proposta',
      passos: [
        'No campo do problema, conte o que acontece hoje: onde a lista do material está, e o que dá errado por causa disso.',
        `Escreva pelo menos ${PALAVRAS_DO_PROBLEMA} palavras.`,
        'No campo de quem usa, diga quem é: a secretaria do clube, o conselheiro do almoxarifado. "Todo mundo" não vale.',
      ],
      feita: c => palavrasDe(c.proposta.problema).length >= PALAVRAS_DO_PROBLEMA && publicoDefinido(c.proposta.usuario),
    },
    {
      id: 'quatro-operacoes',
      titulo: 'Listar as funcionalidades, com as quatro operações',
      detalhe: 'Cadastrar, consultar, alterar e remover — cada uma numa linha, com o que ela faz.',
      onde: 'Na proposta',
      passos: [
        'Escreva uma funcionalidade por vez e clique em Acrescentar.',
        'Cada uma é uma frase, como "Cadastrar um material com o nome e a quantidade".',
        'Confira que as quatro aparecem: cadastrar, consultar, alterar e remover.',
      ],
      feita: c => operacoesQueFaltam(c.proposta).length === 0,
    },
    {
      id: 'aprovada-antes',
      titulo: 'Ter a proposta aprovada antes de programar',
      detalhe: 'O requisito diz que a execução não pode começar antes da aprovação.',
      onde: 'Na proposta',
      passos: [
        'Clique em Enviar para aprovação.',
        'Se ela voltar, leia o que falta, complete e envie de novo.',
        'Só depois de aprovada, clique em Começar a programar.',
      ],
      feita: c => c.proposta.aprovadaEm !== null && !c.comecouAntes,
    },
  ],
  diario: [
    {
      id: 'tres-problemas',
      titulo: 'Registrar os três maiores problemas',
      detalhe: 'Três problemas diferentes, cada um contado com as suas palavras.',
      onde: 'No diário de bordo',
      passos: [
        'Leia a lista do que aconteceu no caminho e escolha os três que mais pesaram.',
        `Em cada registro, conte o problema com as suas palavras — pelo menos ${PALAVRAS_DO_PROBLEMA_NO_DIARIO}.`,
        'Copiar a frase da lista não vale: o diário é seu.',
      ],
      feita: c => problemasRegistrados(c.diario),
    },
    {
      id: 'como-apareceu',
      titulo: 'Anotar como cada um apareceu',
      detalhe: 'O que a tela mostrou: a mensagem de erro, o resultado estranho, o silêncio.',
      onde: 'No diário de bordo',
      passos: [
        'Em cada registro, escreva o que apareceu na tela quando o problema aconteceu.',
        'Se foi uma mensagem de erro, escreva o nome dela — ValueError, IntegrityError.',
        'É por aí que alguém reconhece o mesmo problema da próxima vez.',
      ],
      feita: c => sintomasRegistrados(c.diario),
    },
    {
      id: 'solucao-de-cada',
      titulo: 'Escrever a solução de cada um',
      detalhe: 'O que foi feito, e por que resolveu — uma para cada problema.',
      onde: 'No diário de bordo',
      passos: [
        'Em cada registro, conte o que você mudou no programa ou no jeito de trabalhar.',
        'Diga por que resolveu: "pus o int() num try com except ValueError, e o laço pergunta de novo".',
        'A solução não é o problema escrito de novo.',
      ],
      feita: c => solucoesRegistradas(c.diario),
    },
  ],
  apresentacao: [
    {
      id: 'cabe-em-quinze',
      titulo: 'Montar um roteiro que cabe em quinze minutos',
      detalhe: 'O problema, a demonstração e a decisão técnica, com os minutos de cada parte.',
      onde: 'No roteiro',
      passos: [
        'Dê minutos a cada parte do roteiro.',
        'As três primeiras precisam de algum tempo; as perguntas podem ficar no que sobrar.',
        `A soma não passa de ${MINUTOS_DA_APRESENTACAO}.`,
      ],
      feita: c => cabeEmQuinze(c.roteiro),
    },
    {
      id: 'demonstracao-no-centro',
      titulo: 'Dar à demonstração a maior parte',
      detalhe: 'O requisito pede o programa funcionando, e é ele que o examinador precisa ver.',
      onde: 'No roteiro',
      passos: [
        'Nenhuma parte pode ter mais minutos que a demonstração.',
        'Se o problema está tomando tempo demais, conte-o em uma frase e mostre o programa.',
      ],
      feita: c => demonstracaoNoCentro(c.roteiro),
    },
    {
      id: 'mostra-funcionando',
      titulo: 'Planejar o que mostrar rodando',
      detalhe: 'As quatro operações, e um erro que o programa atravessa sem fechar.',
      onde: 'No roteiro',
      passos: [
        'Marque o que você vai fazer na frente do examinador.',
        'As quatro operações e um erro de propósito: é ele que mostra a validação e o tratamento.',
      ],
      feita: c => O_QUE_DEMONSTRAR.every(d => c.demonstrar.includes(d.id)),
    },
    {
      id: 'decisao-justificada',
      titulo: 'Justificar uma decisão técnica',
      detalhe: 'Uma decisão que o projeto tomou, o que se perderia do outro jeito, e o porquê.',
      onde: 'No roteiro',
      passos: [
        'Escolha uma das decisões que o almoxarifado tomou.',
        'Diga qual era a outra opção e o que se perderia com ela.',
        `Justifique em pelo menos ${PALAVRAS_DA_JUSTIFICATIVA} palavras, com um exemplo do próprio programa.`,
      ],
      feita: c => decisaoJustificada(c.decisao),
    },
  ],
};

export const metasDaCc006 = (licao: LicaoDaCc006) => METAS[licao];
