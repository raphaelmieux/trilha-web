export type RequirementStatus =
  | 'not_started'
  | 'learning'
  | 'practicing'
  | 'needs_review'
  | 'demonstrated'
  | 'completed'
  | 'blocked';

export type LessonType = 'theory' | 'quiz' | 'lab' | 'checkpoint' | 'final';

export type LabType =
  | 'text_editor'
  | 'redacao_guiada'
  | 'pact_builder'
  | 'threat_lab'
  | 'web_lab'
  | 'mail_lab'
  | 'filipenses'
  | 'code_lab'
  | 'table_challenge'
  | 'image_lab'
  | 'site_lab'
  | 'file_manager'
  | 'computer_care'
  | 'ai_lab'
  | 'final_exam';

export interface Requirement {
  code: string;
  title: string;
  description: string;
  type: 'theory' | 'practice' | 'mixed';
  /**
   * Cumprido pelo próprio bloqueio da trilha, e não por uma lição.
   *
   * Algumas especialidades avançadas trazem, como primeiro requisito oficial,
   * "ter concluído a especialidade anterior". Havia um módulo inteiro só para
   * isso, com um laboratório que conferia a certificação e pedia um clique.
   *
   * Era pedir ao desbravador que provasse o que já está registrado na conta
   * dele. Quem controla o acesso é a própria plataforma: enquanto a trilha
   * anterior não estiver concluída, esta nem abre; assim que estiver, abre — e o
   * requisito se dá por cumprido no mesmo instante.
   */
  peloPreRequisito?: boolean;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'matching' | 'ordering' | 'fill_blank' | 'scenario';
  prompt: string;
  data: QuestionData;
  explanation?: string;
}

/*
  Uma alternativa e, opcionalmente, o motivo de ela estar errada.

  A explicação da questão diz por que a resposta certa é certa. Quem marcou
  outra coisa precisa de algo diferente: saber o que confundiu. Quem responde
  "navegador" onde se pedia "buscador" não aprende lendo a definição de
  buscador — aprende lendo que navegador é o programa que abre as páginas e
  buscador é o serviço que as encontra.
*/
export interface QuestionOption {
  id: string;
  text: string;
  correct?: boolean;
  /** Por que esta alternativa está errada. Só faz sentido nas incorretas. */
  porque?: string;
}

export interface QuestionData {
  options?: QuestionOption[];
  scenarios?: QuestionOption[];
  pairs?: { left: string; right: string }[];
  /**
   * Os itens de uma questão de ordenar.
   *
   * `order` é a resposta — 1 a n, sem repetir —, e é o único lugar de onde ela
   * sai: a posição no array não significa nada, porque os itens são
   * embaralhados antes de aparecer (ver lib/questoes.ts).
   *
   * A forma de mexer neles é sempre a mesma, em lição e em prova: arrastar para
   * o lugar, com as setas ao lado para quem está no celular, onde arrastar não
   * existe. Isso não é escolha de cada questão — todas passam por
   * `OrderingQuestion`, em components/questions/QuestionRenderer.tsx, que é
   * quem desenha o tipo. Questão de ordenar nova só precisa dos itens e do
   * `order`; a interface vem junto.
   */
  items?: { id: string; text: string; order: number }[];
  blanks?: {
    id: string;
    /** A resposta canônica — a que aparece no gabarito e na explicação. */
    answer: string;
    hint?: string;
    /**
     * Outras formas de dizer a mesma coisa, aceitas como certas.
     *
     * "ISP" e "provedor" nomeiam o mesmo conceito; exigir uma delas mede
     * memória da palavra escolhida pelo autor, não entendimento. A comparação
     * ainda ignora acento, caixa e pontuação, e tolera erro de digitação — isto
     * aqui é para sinônimo, não para grafia.
     */
    aceitas?: string[];
  }[];
}

export interface Lesson {
  code: string;
  title: string;
  type: LessonType;
  content: string;
  requirementCodes: string[];
  questions?: Question[];
  labType?: LabType;
}

export interface Module {
  code: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

/**
 * Os três níveis da classificação oficial dos Desbravadores.
 *
 * Eram dois, `fundamental` e `advanced`, escritos quando a plataforma tinha as
 * duas trilhas de Internet e a palavra "fundamental" parecia descrever a
 * primeira. A classificação real é Básico, Intermediário e Avançado, e a
 * família de Computação usa os três — daí o nome e o número certos.
 */
export type NivelDaEspecialidade = 'basico' | 'intermediario' | 'avancado';

export const ROTULO_DO_NIVEL: Record<NivelDaEspecialidade, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

/** A ordem em que os níveis se sucedem, para ordenar e agrupar. */
export const ORDEM_DOS_NIVEIS: NivelDaEspecialidade[] = ['basico', 'intermediario', 'avancado'];

export interface Specialty {
  code: string;
  name: string;
  /**
   * O grau da especialidade dentro da própria família — "Internet" e "Internet,
   * Avançado" são o mesmo assunto em dois níveis.
   *
   * Não serve para identificar a trilha: várias especialidades podem ser
   * básicas. Quem identifica é `code`.
   */
  level: NivelDaEspecialidade;
  /**
   * O assunto a que a trilha pertence — "Internet", "Computação".
   *
   * É por aqui que o painel agrupa. Com duas trilhas dava para listar as duas e
   * pronto; com cinco de Computação a mais, uma parede de cards sem hierarquia
   * esconde o percurso que existe dentro de cada família.
   */
  familia: string;
  /**
   * O código da trilha que precisa estar concluída antes desta.
   *
   * Declarado aqui, e não escrito dentro de uma tela: era um `if` para a AP035
   * na página da trilha, e cada nova trilha com pré-requisito exigiria outro.
   *
   * O pré-requisito é cumprido pelo próprio bloqueio — quem não concluiu a
   * anterior não entra, e quem concluiu entra. Não existe módulo para isso: a
   * plataforma já sabe a resposta, e perguntá-la ao desbravador seria pedir que
   * ele provasse o que está registrado na conta dele.
   */
  preRequisito?: string;
  description: string;
  /**
   * Anunciada, mas ainda não aberta.
   *
   * O painel mostra o card acinzentado, sem link, para que o clube saiba o que
   * vem — em vez de a trilha aparecer só no dia em que ficar pronta, ou pior,
   * aparecer aberta e vazia.
   */
  emConstrucao?: boolean;
  requirements: Requirement[];
  modules: Module[];
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  username?: string;
  club?: string;
  /* From clubes.adventistas.org. Null when the club was typed by hand — the
     admin screen uses that to tell a validated club from an unverified one. */
  club_code?: string | null;
  club_city?: string | null;
  club_association?: string | null;
  unit?: string;
  public_name_form: 'full' | 'first' | 'initials' | 'anonymous';
  is_admin: boolean;
  avatar_url?: string | null;
}

// Non-sensitive projection of UserProfile, backed by the `public_profiles` view.
// Never carries email/is_admin — those are only ever readable by the row's owner.
export interface PublicProfile {
  id: string;
  display_name: string;
  username?: string;
  club?: string;
  /* From clubes.adventistas.org. Null when the club was typed by hand — the
     admin screen uses that to tell a validated club from an unverified one. */
  club_code?: string | null;
  club_city?: string | null;
  club_association?: string | null;
  unit?: string;
  public_name_form: 'full' | 'first' | 'initials' | 'anonymous';
  avatar_url?: string | null;
}

export interface Certification {
  id: string;
  code: string;
  hash: string;
  level: NivelDaEspecialidade;
  curriculum_code: string;
  curriculum_version: string;
  status: 'active' | 'revoked';
  issued_at: string;
  user_id: string;
}

/*
  O que a verificação por código devolve.

  Não é uma Certification: `id` e `user_id` ficam de fora de propósito — quem
  confere um certificado não precisa saber a quem a conta pertence no banco, e
  o que não é devolvido não pode ser correlacionado. O nome vem completo,
  ignorando a forma de exibição pública, porque é isso que dá ao Token.Web()
  validade fora do aplicativo.
*/
/*
  O que basta para desenhar um certificado — código, trilha e data.

  Nem o canvas nem o PDF precisam de `id` ou `user_id`; exigir a Certification
  inteira obrigava a página pública a carregar dados que ela deliberadamente
  não recebe mais.
*/
export type CertificadoImprimivel = Pick<Certification, 'code' | 'curriculum_code' | 'issued_at'>;

export interface CertificadoVerificado {
  code: string;
  hash: string;
  level: NivelDaEspecialidade;
  curriculum_code: string;
  curriculum_version: string;
  status: 'active' | 'revoked';
  issued_at: string;
  full_name: string;
  club: string | null;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
}

/* As janelas do ranking. Os valores são os que a função leaderboard() espera. */
export const LEADERBOARD_PERIODS = [
  { value: 'dia',    label: 'Diário'      },
  { value: 'semana', label: 'Semanal'     },
  { value: 'mes',    label: 'Mensal'      },
  { value: 'tudo',   label: 'Geral' },
] as const;

export type LeaderboardPeriod = (typeof LEADERBOARD_PERIODS)[number]['value'];

export interface LeaderboardEntry {
  id: string;
  display_name: string;
  public_name_form: 'full' | 'first' | 'initials' | 'anonymous';
  avatar_url: string | null;
  /* Nulos quando a pessoa não marcou "mostrar meu clube": a linha continua,
     só o clube some. */
  club: string | null;
  club_city: string | null;
  total_xp: number;
  best_streak: number;
  badge_count: number;
}

export function getPublicName(profile: Pick<UserProfile | PublicProfile, 'display_name' | 'public_name_form'>): string {
  switch (profile.public_name_form) {
    case 'full': return profile.display_name;
    case 'first': return profile.display_name.split(' ')[0];
    case 'initials':
      return profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase();
    case 'anonymous': return 'Anônimo';
  }
}
