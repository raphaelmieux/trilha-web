import type { LabType, Specialty } from '../types';
import { codigoDaInsigniaDaVereda, VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { getAllSpecialties } from '../curriculum';
import { TODOS_OS_DEGRAUS } from './escadasDeInsignia';
import type { NivelDaInsignia } from './nivelDaInsignia';

/*
 * O catálogo de insígnias, e o que cada uma exige.
 *
 * Eram seis, e a trilha inteira podia ser percorrida sem que quase nada
 * acontecesse — o que é o oposto do que uma insígnia serve para fazer.
 *
 * Aqui elas são dado, não código espalhado: cada uma diz o próprio critério
 * sobre um resumo do que a pessoa fez. O motor (gamification.ts) monta esse
 * resumo uma vez e passa por todas; nada aqui toca o banco, e por isso tudo
 * pode ser testado sem servidor.
 *
 * ── Nada de gravação nova ────────────────────────────────────────────────
 * Todo critério sai do que a plataforma já guarda: progresso por requisito,
 * tentativas de lição, eventos de atividade, matrícula e certificados. Uma
 * insígnia que precisasse de um campo novo obrigaria a inventar histórico para
 * quem já usa o aplicativo, ou a deixá-lo para trás.
 *
 * ── Insígnia não se perde ────────────────────────────────────────────────
 * Os critérios só olham para marcas acumuladas — quantas lições, qual a maior
 * sequência —, nunca para o estado do momento. Uma insígnia que sumisse porque
 * a sequência foi quebrada puniria quem voltou depois de faltar, que é
 * exatamente quem mais precisa de um motivo para continuar.
 */

/** Tudo o que se sabe sobre o percurso de alguém, já contado. */
export interface ResumoDoDesbravador {
  /** Requisitos com status `completed`. */
  requisitos: number;
  /** Lições distintas com tentativa aprovada. */
  licoes: number;
  /** Lições em que acertou tudo. */
  licoesPerfeitas: number;
  /** Módulos com todos os requisitos cumpridos. */
  modulos: number;
  /** Trilhas com todos os requisitos cumpridos, pelo código. */
  trilhas: string[];
  /** Laboratórios distintos concluídos. */
  laboratorios: Set<LabType>;
  /** Avaliações finais concluídas, e quantas com nota cheia. */
  provas: number;
  provasPerfeitas: number;
  /** A maior sequência de dias já alcançada. */
  melhorSequencia: number;
  /** Dias distintos em que houve alguma atividade. */
  diasAtivos: number;
  /** As horas do dia (0–23) em que houve atividade. */
  horas: Set<number>;
  /** Os dias da semana (0 = domingo) em que houve atividade. */
  diasDaSemana: Set<number>;
  /** XP somado em todas as matrículas. */
  xp: number;
  /** Certificados ativos, pelo código da trilha. */
  certificados: string[];
  /** Veredas percorridas até o fim — teoria lida e laboratório vencido. */
  veredas: string[];
}

export type Tier = NivelDaInsignia;

export interface Insignia {
  code: string;
  nome: string;
  descricao: string;
  icone: string;
  tier: Tier;
  /** A família a que ela pertence, ou nada se ela não pertence a escada nenhuma. */
  familia?: string;
  /*
    Fora da escala das sete classes.

    Só as de horário: elas medem **quando** se estuda, não quanto, e não têm
    ordem interna que justifique classe. A tela as desenha em círculo
    off-white, que é a forma que nenhuma classe usa — é assim que se lê que
    elas são de outra natureza. O `tier` delas existe só porque a coluna é
    NOT NULL, e nada o desenha.
  */
  semClasse?: boolean;
  /** Cumpriu? Recebe o resumo já pronto. */
  conquistou: (r: ResumoDoDesbravador) => boolean;
}

/*
  Um laboratório é uma tarefa inteira, com tela própria e retorno próprio — a
  parte da trilha em que se faz alguma coisa, em vez de responder sobre ela.
  Cada um vale a sua marca.
*/
const LABORATORIOS: [LabType, string, string][] = [
  ['web_lab', 'Navegação com cuidado', 'Concluiu o laboratório de navegar e pesquisar.'],
  ['mail_lab', 'Correio em ordem', 'Concluiu o laboratório de e-mail e golpes.'],
  ['threat_lab', 'Caça-ameaças', 'Concluiu o laboratório de ameaças e proteção.'],
  ['pact_builder', 'Compromisso assinado', 'Escreveu o próprio compromisso de uso da internet.'],
  ['filipenses', 'Filtro de Filipenses', 'Concluiu o estudo de Filipenses 4:8.'],
  ['text_editor', 'Primeiro relatório', 'Escreveu e entregou um texto de trilha.'],
  ['redacao_guiada', 'Relatório construído', 'Montou um relatório pesquisando etapa por etapa.'],
  ['code_lab', 'Página escrita à mão', 'Concluiu o laboratório de HTML.'],
  ['table_challenge', 'Dados em linhas e colunas', 'Montou uma página com tabela.'],
  ['image_compress', 'Imagens leves', 'Espremeu uma foto até caber em 15 KB sem deixar de ser vista.'],
  ['image_create', 'Estúdio do clube', 'Desenhou o logo, os botões e o header do site.'],
  ['site_lab', 'Site de quatro páginas', 'Montou um site completo e navegável.'],
  ['ai_lab', 'Pedido bem feito', 'Concluiu o laboratório de produção com IA.'],
  ['computer_care', 'Máquina cuidada', 'Concluiu o laboratório de cuidados com o computador.'],
  ['file_manager', 'Pastas em ordem', 'Concluiu o laboratório de pastas e arquivos.'],
  ['formatacao_texto', 'Documento apresentável', 'Formatou um documento inteiro, da folha às listas.'],
  ['operacoes_arquivo', 'Tarefas do dia', 'Compactou, exportou em pdf, instalou e imprimiu.'],
  ['insercao_texto', 'Documento montado', 'Inseriu tabela, imagem, cabeçalho e numeração num documento.'],
  ['planilha', 'Planilha que calcula', 'Montou uma planilha com alinhamento, mesclagem e fórmulas.'],
  ['area_de_trabalho', 'Dono da máquina', 'Consultou, ajustou e capturou o que o sistema mostra.'],
  ['estilos_texto', 'Documento que se monta sozinho', 'Aplicou estilos e deixou o sumário se montar a partir deles.'],
  ['planilha_avancada', 'Planilha que responde', 'Filtrou, congelou o cabeçalho e desenhou o gráfico certo.'],
  ['banco_de_dados', 'Agenda com estrutura', 'Montou um banco de dados com vinte e cinco fichas.'],
  ['apresentacao', 'Apresentação pronta', 'Montou uma apresentação com modelo, mídia e PDF.'],
  ['correio_completo', 'Correio do clube', 'Escreveu, anexou, arquivou, respondeu e encaminhou.'],
  ['configuracoes_sistema', 'Máquina ajustada', 'Limpou o disco, escolheu os programas padrão e criou um usuário.'],
];

/*
  Estas ficam **acima** de `INSIGNIAS`, e não por estilo.

  O array logo abaixo é um literal avaliado quando o módulo carrega, e ele
  chama `classeDoLaboratorio` para cada laboratório. Se as tabelas morassem
  depois dele, a chamada cairia na zona morta do `const` e o módulo inteiro
  estouraria com "Cannot access before initialization" — em toda tela que
  mostra insígnia, e só em produção, porque em teste unitário o módulo às
  vezes carrega por outro caminho. É a irmã do ciclo de ESM que tirou o
  `LIMIAR_DOMINIO` de `progress.ts`: ordem de inicialização não avisa, quebra.
*/
/*
  A classe de um percurso, e de quem o marca.

  Um sistema de sete classes que desse a mesma a toda trilha diria "você
  concluiu uma especialidade" e calaria sobre qual — e a AP035 avançada custa
  muito mais que a AP034 básica. Com três níveis isso nunca coube; com sete,
  cabe, e é o que faz a estante dizer o que a pessoa fez **e** quão difícil
  era.
*/
const CLASSE_DA_TRILHA: Record<Specialty['level'], NivelDaInsignia> = {
  basico: 'pesquisador',
  intermediario: 'excursionista',
  avancado: 'lider',
};

/* O laboratório fica um patamar abaixo da trilha dele, pelo mesmo motivo. */
const CLASSE_DO_LABORATORIO: Record<Specialty['level'], NivelDaInsignia> = {
  basico: 'companheiro',
  intermediario: 'pesquisador',
  avancado: 'pioneiro',
};

/** A classe da insígnia de uma trilha concluída. */
export function classeDaTrilha(codigo: string): NivelDaInsignia {
  const trilha = getAllSpecialties().find(e => e.code === codigo);
  /* Sem trilha, a classe que reivindica menos: uma insígnia de percurso que o
     currículo não conhece não deveria se anunciar como a mais alta. */
  return trilha ? CLASSE_DA_TRILHA[trilha.level] : 'amigo';
}

/** A classe da insígnia de um laboratório, pela trilha em que ele aparece. */
export function classeDoLaboratorio(lab: LabType): NivelDaInsignia {
  for (const e of getAllSpecialties())
    for (const m of e.modules)
      for (const l of m.lessons)
        if (l.labType === lab) return CLASSE_DO_LABORATORIO[e.level];
  return 'amigo';
}

/*
  A vereda não tem nível — tem tamanho, e grava `'basico'` justamente para não
  reivindicar grau nenhum. Então a classe dela sai de quantas lições ela tem,
  que é a única medida honesta de quanto ela custa.

  Uma vereda que ganhe lição sobe de classe para quem ainda não a concluiu;
  quem já concluiu fica com a que recebeu, porque insígnia não se perde.
*/
const TAMANHO_DA_VEREDA: [number, NivelDaInsignia][] = [
  [2, 'amigo'], [5, 'companheiro'], [9, 'pesquisador'],
  [13, 'pioneiro'], [18, 'excursionista'], [25, 'guia'],
];

/** A classe da insígnia de uma vereda percorrida até o fim. */
export function classeDaVereda(id: string): NivelDaInsignia {
  const vereda = VEREDAS.find(v => v.id === id);
  if (!vereda) return 'amigo';
  const licoes = licoesDaVereda(vereda).length;
  return TAMANHO_DA_VEREDA.find(([teto]) => licoes <= teto)?.[1] ?? 'lider';
}

export const INSIGNIAS: Insignia[] = [
  /*
    As treze escadas, achatadas: cada degrau é uma insígnia, e a classe dela é
    a posição na escada. Eram trinta e nove marcas escritas uma a uma, com o
    `tier` decidido a olho — e o `tier` daqui nunca era lido, porque a tela lê
    o do banco: as duas fontes divergiram em silêncio por meses. Agora existe
    uma só, e `insignias.test.ts` confere o banco contra ela.
  */
  ...TODOS_OS_DEGRAUS.map(({ escada, ...d }): Insignia => ({
    code: d.code, nome: d.nome, descricao: d.descricao, icone: escada.icone,
    tier: d.classe, familia: escada.familia,
    conquistou: r => escada.medir(r) >= d.alvo,
  })),

  /*
    ── Fora das escadas ───────────────────────────────────────────────────
    Estas quatro medem **quando** se estuda, e não quanto. Não são acúmulo e
    não formam escada: dar a elas uma das sete classes fingiria uma ordem que
    não existe, e inventar cinco degraus para completar a série seria inventar
    conquista que ninguém pediu. Ficam sem família, e a tela as desenha em
    círculo off-white — a forma que nenhuma classe usa.
  */
  {
    code: 'coruja', nome: 'Coruja', descricao: 'Estudou entre a meia-noite e as cinco da manhã.',
    icone: 'clock', tier: 'companheiro', semClasse: true,
    conquistou: r => [...r.horas].some(h => h >= 0 && h < 5),
  },
  {
    code: 'madrugador', nome: 'Madrugador', descricao: 'Estudou antes das sete da manhã.',
    icone: 'clock', tier: 'companheiro', semClasse: true,
    conquistou: r => [...r.horas].some(h => h >= 5 && h < 7),
  },
  {
    code: 'fim_de_semana', nome: 'Fim de Semana', descricao: 'Estudou num sábado ou domingo.',
    icone: 'calendar', tier: 'companheiro', semClasse: true,
    conquistou: r => r.diasDaSemana.has(0) || r.diasDaSemana.has(6),
  },
  {
    code: 'semana_inteira', nome: 'Semana Inteira', descricao: 'Estudou em todos os sete dias da semana, em algum momento.',
    icone: 'calendar', tier: 'companheiro', semClasse: true,
    conquistou: r => r.diasDaSemana.size === 7,
  },

  /*
    ── Uma por laboratório ────────────────────────────────────────────────
    Não são acúmulo tampouco: cada uma diz que **aquele** laboratório foi
    vencido. A classe vem da dificuldade do que ela marca — o nível da trilha
    a que o laboratório pertence, um patamar abaixo da trilha inteira, porque
    um laboratório é uma lição dentro dela e não pode valer o mesmo que
    fechá-la.
  */
  ...LABORATORIOS.map(([lab, nome, descricao]): Insignia => ({
    code: `lab_${lab}`, nome, descricao, icone: 'lab',
    tier: classeDoLaboratorio(lab),
    conquistou: r => r.laboratorios.has(lab),
  })),
];



/**
 * As insígnias por trilha concluída.
 *
 * Ficam fora da lista fixa porque nascem do currículo: o código sai do código da
 * trilha, e a próxima especialidade entra sozinha. O que ainda é feito à mão é
 * semear a linha na tabela — insígnia que não existe lá é ignorada sem erro.
 */
export function codigoDaInsigniaDaTrilha(codigoDaTrilha: string): string {
  return `${codigoDaTrilha.toLowerCase()}_complete`;
}

/** Os códigos conquistados, dado o resumo. */
export function insigniasConquistadas(r: ResumoDoDesbravador): string[] {
  const codigos = INSIGNIAS.filter(i => i.conquistou(r)).map(i => i.code);
  return [
    ...codigos,
    ...r.trilhas.map(codigoDaInsigniaDaTrilha),
    ...r.veredas.map(codigoDaInsigniaDaVereda),
  ];
}

/**
 * Os códigos que a tela desenha sem classe, em círculo.
 *
 * Sai do próprio catálogo em vez de ser uma segunda lista: duas cópias
 * divergem no primeiro ajuste, e uma insígnia que saísse daqui e ficasse lá
 * viraria triângulo azul sem nada reprovar.
 */
export const SEM_CLASSE: ReadonlySet<string> = new Set(
  INSIGNIAS.filter(i => i.semClasse).map(i => i.code),
);
