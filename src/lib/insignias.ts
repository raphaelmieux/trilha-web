import type { LabType } from '../types';

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
}

export type Tier = 'bronze' | 'silver' | 'gold';

export interface Insignia {
  code: string;
  nome: string;
  descricao: string;
  icone: string;
  tier: Tier;
  /** Cumpriu? Recebe o resumo já pronto. */
  conquistou: (r: ResumoDoDesbravador) => boolean;
}

/** Atalho para as insígnias que são só "chegou a N". */
const marco = (
  code: string, nome: string, descricao: string, icone: string, tier: Tier,
  medir: (r: ResumoDoDesbravador) => number, alvo: number,
): Insignia => ({ code, nome, descricao, icone, tier, conquistou: r => medir(r) >= alvo });

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
  ['image_lab', 'Imagens leves', 'Concluiu o laboratório de otimização de imagens.'],
  ['site_lab', 'Site de quatro páginas', 'Montou um site completo e navegável.'],
  ['ai_lab', 'Pedido bem feito', 'Concluiu o laboratório de produção com IA.'],
  ['computer_care', 'Máquina cuidada', 'Concluiu o laboratório de cuidados com o computador.'],
  ['file_manager', 'Pastas em ordem', 'Concluiu o laboratório de pastas e arquivos.'],
  ['formatacao_texto', 'Documento apresentável', 'Formatou um documento inteiro, da folha às listas.'],
  ['operacoes_arquivo', 'Tarefas do dia', 'Compactou, exportou em pdf, instalou e imprimiu.'],
];

export const INSIGNIAS: Insignia[] = [
  // ── Primeiros passos ───────────────────────────────────────────────────
  marco('first_step', 'Primeiro Passo', 'Cumpriu o primeiro requisito de uma trilha.', 'footprints', 'bronze', r => r.requisitos, 1),
  marco('primeira_licao', 'Primeira Lição', 'Concluiu a primeira lição.', 'footprints', 'bronze', r => r.licoes, 1),
  marco('primeiro_laboratorio', 'Primeiro Laboratório', 'Concluiu o primeiro laboratório.', 'beaker', 'bronze', r => r.laboratorios.size, 1),
  marco('primeira_prova', 'Primeira Avaliação', 'Concluiu a primeira avaliação final.', 'star', 'bronze', r => r.provas, 1),

  // ── Lições ─────────────────────────────────────────────────────────────
  marco('licoes_5', 'Cinco Lições', 'Concluiu cinco lições.', 'layers', 'bronze', r => r.licoes, 5),
  marco('licoes_10', 'Dez Lições', 'Concluiu dez lições.', 'layers', 'bronze', r => r.licoes, 10),
  marco('licoes_25', 'Vinte e Cinco Lições', 'Concluiu vinte e cinco lições.', 'layers', 'silver', r => r.licoes, 25),
  marco('licoes_50', 'Cinquenta Lições', 'Concluiu cinquenta lições.', 'layers', 'gold', r => r.licoes, 50),

  // ── Requisitos ─────────────────────────────────────────────────────────
  marco('requisitos_10', 'Dez Requisitos', 'Cumpriu dez requisitos oficiais.', 'footprints', 'bronze', r => r.requisitos, 10),
  marco('requisitos_25', 'Vinte e Cinco Requisitos', 'Cumpriu vinte e cinco requisitos oficiais.', 'footprints', 'silver', r => r.requisitos, 25),
  marco('requisitos_50', 'Cinquenta Requisitos', 'Cumpriu cinquenta requisitos oficiais.', 'footprints', 'silver', r => r.requisitos, 50),
  marco('requisitos_100', 'Cem Requisitos', 'Cumpriu cem requisitos oficiais.', 'footprints', 'gold', r => r.requisitos, 100),

  // ── Módulos ────────────────────────────────────────────────────────────
  marco('module_complete', 'Módulo Concluído', 'Concluiu todos os requisitos de um módulo.', 'layers', 'bronze', r => r.modulos, 1),
  marco('modulos_5', 'Cinco Módulos', 'Concluiu cinco módulos.', 'layers', 'silver', r => r.modulos, 5),
  marco('modulos_15', 'Quinze Módulos', 'Concluiu quinze módulos.', 'layers', 'gold', r => r.modulos, 15),

  // ── Sequência ──────────────────────────────────────────────────────────
  marco('streak_3', 'Sequência de 3 Dias', 'Praticou a trilha 3 dias seguidos.', 'flame', 'bronze', r => r.melhorSequencia, 3),
  marco('streak_7', 'Sequência de 7 Dias', 'Praticou a trilha 7 dias seguidos.', 'flame', 'silver', r => r.melhorSequencia, 7),
  marco('streak_14', 'Sequência de 14 Dias', 'Praticou a trilha 14 dias seguidos.', 'flame', 'silver', r => r.melhorSequencia, 14),
  marco('streak_30', 'Sequência de 30 Dias', 'Praticou a trilha 30 dias seguidos.', 'flame', 'gold', r => r.melhorSequencia, 30),

  // ── Constância ─────────────────────────────────────────────────────────
  marco('dias_5', 'Cinco Dias de Estudo', 'Estudou em cinco dias diferentes.', 'calendar', 'bronze', r => r.diasAtivos, 5),
  marco('dias_15', 'Quinze Dias de Estudo', 'Estudou em quinze dias diferentes.', 'calendar', 'silver', r => r.diasAtivos, 15),
  marco('dias_30', 'Trinta Dias de Estudo', 'Estudou em trinta dias diferentes.', 'calendar', 'gold', r => r.diasAtivos, 30),

  // ── Acertos ────────────────────────────────────────────────────────────
  marco('licao_perfeita', 'Lição sem Erro', 'Acertou todas as questões de uma lição.', 'star', 'bronze', r => r.licoesPerfeitas, 1),
  marco('licoes_perfeitas_10', 'Dez Lições sem Erro', 'Acertou tudo em dez lições.', 'star', 'silver', r => r.licoesPerfeitas, 10),
  marco('licoes_perfeitas_25', 'Vinte e Cinco Lições sem Erro', 'Acertou tudo em vinte e cinco lições.', 'star', 'gold', r => r.licoesPerfeitas, 25),
  marco('perfect_exam', 'Nota Máxima', 'Acertou 100% em uma avaliação final.', 'star', 'gold', r => r.provasPerfeitas, 1),
  marco('provas_perfeitas_2', 'Duas Notas Máximas', 'Acertou 100% em duas avaliações finais.', 'star', 'gold', r => r.provasPerfeitas, 2),

  // ── Trilhas ────────────────────────────────────────────────────────────
  marco('duas_trilhas', 'Duas Trilhas', 'Concluiu duas especialidades.', 'trophy', 'silver', r => r.trilhas.length, 2),
  marco('tres_trilhas', 'Três Trilhas', 'Concluiu três especialidades.', 'trophy', 'gold', r => r.trilhas.length, 3),
  marco('cinco_trilhas', 'Cinco Trilhas', 'Concluiu cinco especialidades.', 'trophy', 'gold', r => r.trilhas.length, 5),

  // ── Certificados ───────────────────────────────────────────────────────
  marco('primeiro_token', 'Primeiro Token.Web()', 'Recebeu o primeiro certificado.', 'award', 'silver', r => r.certificados.length, 1),
  marco('tokens_2', 'Dois Token.Web()', 'Recebeu dois certificados.', 'award', 'gold', r => r.certificados.length, 2),
  marco('tokens_3', 'Três Token.Web()', 'Recebeu três certificados.', 'award', 'gold', r => r.certificados.length, 3),

  // ── XP ─────────────────────────────────────────────────────────────────
  marco('xp_100', 'Cem de XP', 'Somou cem pontos de experiência.', 'zap', 'bronze', r => r.xp, 100),
  marco('xp_500', 'Quinhentos de XP', 'Somou quinhentos pontos de experiência.', 'zap', 'silver', r => r.xp, 500),
  marco('xp_1000', 'Mil de XP', 'Somou mil pontos de experiência.', 'zap', 'gold', r => r.xp, 1000),

  // ── Quando se estuda ───────────────────────────────────────────────────
  {
    code: 'coruja', nome: 'Coruja', descricao: 'Estudou entre a meia-noite e as cinco da manhã.',
    icone: 'clock', tier: 'bronze',
    conquistou: r => [...r.horas].some(h => h >= 0 && h < 5),
  },
  {
    code: 'madrugador', nome: 'Madrugador', descricao: 'Estudou antes das sete da manhã.',
    icone: 'clock', tier: 'bronze',
    conquistou: r => [...r.horas].some(h => h >= 5 && h < 7),
  },
  {
    code: 'fim_de_semana', nome: 'Fim de Semana', descricao: 'Estudou num sábado ou domingo.',
    icone: 'calendar', tier: 'bronze',
    conquistou: r => r.diasDaSemana.has(0) || r.diasDaSemana.has(6),
  },
  {
    code: 'semana_inteira', nome: 'Semana Inteira', descricao: 'Estudou em todos os sete dias da semana, em algum momento.',
    icone: 'calendar', tier: 'gold',
    conquistou: r => r.diasDaSemana.size === 7,
  },

  // ── Um por laboratório ─────────────────────────────────────────────────
  ...LABORATORIOS.map(([lab, nome, descricao]): Insignia => ({
    code: `lab_${lab}`, nome, descricao, icone: 'beaker', tier: 'bronze',
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
  return [...codigos, ...r.trilhas.map(codigoDaInsigniaDaTrilha)];
}
