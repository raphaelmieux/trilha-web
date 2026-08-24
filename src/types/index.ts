import type { Database } from './database';

export type { Json } from './database';

/*
  A linha de uma tabela ou view do banco: `Tabela<'user_profiles'>`.

  O nome por extenso (`Database['public']['Tables']['x']['Row']`) apareceria em
  toda tela que lê o banco, e ninguém escreve isso duas vezes sem voltar para o
  `any`. O que um INSERT aceita e o que uma função devolve seguem o mesmo
  molde, trocando `Row` por `Insert` ou indo em `['Functions']`.
*/
export type Tabela<
  T extends keyof (Database['public']['Tables'] & Database['public']['Views']),
> = (Database['public']['Tables'] & Database['public']['Views'])[T]['Row'];

/*
  Os estados de um requisito, na mesma ordem do CHECK de `requirement_progress`.

  Lista e união saem do mesmo lugar para não poderem divergir: quem acrescentar
  um estado no banco precisa acrescentar aqui, e `umDe` avisa em voz alta se
  chegar um valor que esta lista não conhece.
*/
export const STATUS_DO_REQUISITO = [
  'not_started',
  'learning',
  'practicing',
  'needs_review',
  'demonstrated',
  'completed',
  'blocked',
] as const;

export type RequirementStatus = (typeof STATUS_DO_REQUISITO)[number];

/*
  Como o nome aparece para os outros, igual ao CHECK de `user_profiles`.

  Estava escrita à mão em três lugares — perfil, perfil público e linha do
  ranking —, e uma forma nova teria que ser lembrada nos três.
*/
export const FORMAS_DE_NOME = ['full', 'first', 'initials', 'anonymous'] as const;

export type FormaDeNome = (typeof FORMAS_DE_NOME)[number];

/** Os níveis de insígnia, como no CHECK de `badges`. */
export const NIVEIS_DA_INSIGNIA = ['bronze', 'silver', 'gold'] as const;

export type NivelDaInsignia = (typeof NIVEIS_DA_INSIGNIA)[number];

/*
  A fronteira onde o texto do banco vira união do domínio.

  Estas colunas são `text` com CHECK, e o tipo gerado não tem como dizer mais
  que `string` — o Postgres deste projeto não usa enum. Converter na mão, com
  `as`, seria trocar um `any` por uma afirmação sem prova.

  Valor fora da lista não derruba a tela nem segue adiante disfarçado: cai no
  padrão e reclama no console. O caso real é uma migration ter acrescentado um
  valor novo sem que o TypeScript soubesse — e isso tem que aparecer para quem
  desenvolve, em vez de virar uma tela em branco para o desbravador.
*/
export function umDe<T extends readonly string[]>(
  aceitos: T,
  valor: string,
  padrao: T[number],
): T[number] {
  if ((aceitos as readonly string[]).includes(valor)) return valor;
  console.warn(`Valor fora do previsto: "${valor}". Esperado um de: ${aceitos.join(', ')}.`);
  return padrao;
}

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
  pairs?: ParDeLigar[];
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

/*
  Um par já ligado numa questão de associar.

  `type` e não `interface`: as respostas da lição inteira são gravadas na
  coluna `answers` de `lesson_attempts`, que é jsonb, e só apelido de tipo
  ganha index signature implícita — `interface` é recusada por `Json`. Mesma
  razão de ConferenciaEtapa, em labs/redacaoGuiada.ts.
*/
export type ParDeLigar = {
  left: string;
  right: string;
};

/*
  O que o desbravador respondeu, na forma que cada tipo de questão produz.

  São três formas, e o tipo da questão decide qual: id da alternativa escolhida
  em múltipla escolha, verdadeiro/falso e cenário; lista de ids na ordem
  montada em questão de ordenar; lista de textos, um por lacuna, em completar;
  e os pares em questão de ligar.

  Era `any` de ponta a ponta — da tela ao `checkAnswer` —, e `any` aqui é caro:
  é justamente onde a resposta certa é conferida.
*/
export type RespostaDaQuestao = string | string[] | ParDeLigar[];

/*
  As duas guardas abaixo separam as três formas. Elas conferem de verdade, em
  execução — com `any` a leitura errada compilava e só aparecia como resposta
  certa marcada como errada.
*/

/** Ordenar e completar produzem lista de textos. */
export function ehListaDeTextos(v: RespostaDaQuestao | null | undefined): v is string[] {
  return Array.isArray(v) && v.every(x => typeof x === 'string');
}

/** Só questão de ligar produz lista de pares. */
export function ehListaDePares(v: RespostaDaQuestao | null | undefined): v is ParDeLigar[] {
  return Array.isArray(v)
    && v.every(x => typeof x === 'object' && x !== null && typeof x.left === 'string');
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

/**
 * O nome pelo qual uma trilha é chamada em toda a plataforma: código e nome.
 *
 * Cada tela escrevia o seu: o card mostrava "Internet", o painel de
 * certificações "Internet (AP034)", o relatório "AP034 — Internet". Três formas
 * do mesmo nome, e quem via duas ao mesmo tempo tinha motivo para achar que
 * eram coisas diferentes.
 *
 * Sem separador entre os dois: o travessão entrega texto gerado, e o parêntese
 * transforma o código em nota de rodapé quando ele é parte do nome — é assim
 * que a especialidade aparece no material dos Desbravadores.
 */
export function nomeCompleto(e: { code: string; name: string }): string {
  return `${e.code} ${e.name}`;
}

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
  public_name_form: FormaDeNome;
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
  public_name_form: FormaDeNome;
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
  tier: NivelDaInsignia;
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
  public_name_form: FormaDeNome;
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
