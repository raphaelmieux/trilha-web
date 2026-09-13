/*
 * As sete classes da insígnia.
 *
 * Eram três — bronze, prata e ouro —, que é a escala de medalha de pódio e não
 * diz nada sobre o percurso de quem estuda. As sete são as classes regulares
 * dos Desbravadores: Amigo, Companheiro, Pesquisador, Pioneiro, Excursionista,
 * Guia e Líder. O clube já sabe ordená-las de cor, e é a única escala de sete
 * degraus que ele não precisa aprender.
 *
 * ── Forma e cor, e não só cor ────────────────────────────────────────────
 * Cada classe tem um polígono próprio, do triângulo ao octógono, porque cor
 * sozinha não se lê: quem não distingue vermelho de verde via duas insígnias
 * idênticas, e numa estante impressa em preto e branco ninguém via nenhuma.
 * O número de lados cresce com a classe, então a forma sozinha já diz a
 * ordem — é o mesmo motivo de a marca da lição ter ícone **e** disco.
 *
 * ── Por que a cor é o preenchimento, e não o traço ───────────────────────
 * A composição antiga era um disco translúcido com o glifo traçado na cor da
 * classe. Medido contra o cartão da plataforma, que é escuro, cinco das sete
 * cores ficavam entre 1,1:1 e 3,0:1 — o marinho do topo era literalmente
 * invisível. Hoje a cor preenche a forma e o glifo vai por cima em branco ou
 * quase-preto, o que medir mais contraste. Nenhuma classe fica abaixo de
 * 5,2:1, e a cor continua dizendo qual é.
 */

/** Da mais baixa para a mais alta. A ordem aqui **é** a ordem das classes. */
export const NIVEIS_DA_INSIGNIA = [
  'amigo', 'companheiro', 'pesquisador', 'pioneiro', 'excursionista', 'guia', 'lider',
] as const;

export type NivelDaInsignia = (typeof NIVEIS_DA_INSIGNIA)[number];

export interface ClasseDaInsignia {
  /** Como ela se chama na tela, no PDF e no relatório do clube. */
  nome: string;
  /** Lados do polígono. Cresce com a classe, e é isso que a ordena sem cor. */
  lados: number;
  /** O triângulo do Companheiro aponta para baixo — é o que o distingue do Amigo. */
  invertido?: boolean;
  cor: string;
}

export const CLASSES: Record<NivelDaInsignia, ClasseDaInsignia> = {
  amigo:         { nome: 'Amigo',         lados: 3, cor: '#033A7E' },
  companheiro:   { nome: 'Companheiro',   lados: 3, cor: '#B70B28', invertido: true },
  pesquisador:   { nome: 'Pesquisador',   lados: 4, cor: '#007D54' },
  pioneiro:      { nome: 'Pioneiro',      lados: 5, cor: '#A39B98' },
  excursionista: { nome: 'Excursionista', lados: 6, cor: '#820247' },
  guia:          { nome: 'Guia',          lados: 7, cor: '#EAC600' },
  lider:         { nome: 'Líder',         lados: 8, cor: '#D16914' },
};

/** A classe de um degrau, contando de 1. Fora da faixa, cai na mais baixa. */
export const classeDoDegrau = (degrau: number): NivelDaInsignia =>
  NIVEIS_DA_INSIGNIA[degrau - 1] ?? NIVEIS_DA_INSIGNIA[0];

/** Quão alta é uma classe, de 1 a 7 — para ordenar e comparar. */
export const alturaDaClasse = (n: NivelDaInsignia): number =>
  NIVEIS_DA_INSIGNIA.indexOf(n) + 1;

/*
  Os nomes velhos continuam sendo lidos.

  `badges.tier` é semeado por migration, e o `supabase.yml` corre **em
  paralelo** com o frontend, nunca antes. Durante essa janela a tela nova
  recebe 'bronze', 'silver' e 'gold' do banco, e sem esta tabela `umDe` não
  reconheceria nenhum: toda insígnia de todo mundo viraria triângulo azul até
  o outro workflow terminar. Vale também para quem restaura um dump antigo.

  O destino de cada um é a classe onde a maior parte das insígnias daquele
  tier de fato aterrissou, então a janela mostra uma estante plausível em vez
  de uma achatada.
*/
const APELIDOS: Record<string, NivelDaInsignia> = {
  bronze: 'companheiro',
  silver: 'pioneiro',
  gold: 'excursionista',
};

/** A classe de hoje para um valor de `badges.tier`, seja qual for a idade dele. */
export function classeCanonica(tier: string): NivelDaInsignia | undefined {
  if ((NIVEIS_DA_INSIGNIA as readonly string[]).includes(tier)) return tier as NivelDaInsignia;
  return APELIDOS[tier];
}
