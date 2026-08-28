import { MODULOS_DE_HTML } from './sintaxeHtml';

/*
 * As veredas.
 *
 * ── O que é uma vereda ───────────────────────────────────────────────────
 * Vereda é o caminho estreito que sai da trilha principal. Aqui é o percurso
 * curto que nasce de uma trilha completa e passa a valer sozinho: a sintaxe
 * do HTML saiu da AP035 porque quem escreve HTML precisa dela, tenha ou não
 * feito a especialidade de Internet — presa ali, só quem estivesse naquela
 * trilha a encontraria.
 *
 * Chamava-se "mini-trilha", que dizia o tamanho e não dizia o que a coisa é.
 *
 * ── Tem a forma de uma trilha, e não o peso dela ─────────────────────────
 * Módulos, cada um com uma lição de teoria e um laboratório a vencer, e
 * progresso à vista — porque é assim que o desbravador já sabe percorrer uma
 * coisa nesta plataforma, e inventar uma segunda gramática de percurso só
 * para o material curto seria pedir que ele aprendesse duas.
 *
 * O que não tem é peso de especialidade: não há requisito oficial, não há
 * nota, e nada disto entra no percentual de trilha nenhuma. É bônus — rende
 * insígnia e uma seção própria no relatório.
 *
 * ── Por que não vira uma Specialty ───────────────────────────────────────
 * Uma `Specialty` precisa de linha em `specialties`, `modules`, `lessons` e
 * `requirements` para que o progresso seja gravado, e a partir daí ela entra
 * no percentual, na família do painel, no XP e nas insígnias de trilha. Seria
 * o contrário de bônus. O progresso da vereda sai de eventos de atividade,
 * que é onde as insígnias já procuram tudo, e nenhuma tabela nova é criada.
 *
 * ── Para acrescentar a próxima ───────────────────────────────────────────
 * Escreva os módulos num arquivo como `sintaxeHtml.ts`, acrescente a entrada
 * em VEREDAS com o próximo código VD, e semeie a linha da insígnia numa
 * migration nova — `vereda_<id>`. `insignias.test.ts` cobra.
 */

export interface TopicoDeVereda {
  id: string;
  titulo: string;
  /** Uma frase: o que se aprende aqui. Aparece na lista de tópicos. */
  resumo: string;
  /** Dois ou três parágrafos curtos. Frase curta, exemplo do dia a dia. */
  explicacao: string[];
  /** O exemplo. Roda de verdade no quadro do resultado, quando a vereda mostra um. */
  exemplo: string;
  /** O engano que este tópico costuma produzir. Aparece em destaque. */
  atencao?: string;
  /** As marcas que o tópico cobre — é por aqui que se procura. */
  marcas: string[];
}

/**
 * Uma lição da vereda: ou se lê, ou se faz.
 *
 * São os dois tipos que uma trilha tem, e por isso são os dois que a vereda
 * tem. Teoria sem laboratório é leitura; laboratório sem teoria é adivinhação.
 */
export type LicaoDeVereda =
  | {
    id: string;
    tipo: 'teoria';
    titulo: string;
    resumo: string;
    topicos: TopicoDeVereda[];
  }
  | {
    id: string;
    tipo: 'laboratorio';
    titulo: string;
    resumo: string;
    /** De onde a pessoa parte. Abre reprovando em tudo, como todo modelo aqui. */
    modelo: string;
    /** Os ids das verificações de `htmlValidator` que este laboratório cobra. */
    verificacoes: string[];
    /** O nome do arquivo e o da pasta, na lateral do editor. */
    arquivo: string;
    projeto: string;
  };

export interface ModuloDeVereda {
  id: string;
  titulo: string;
  resumo: string;
  licoes: LicaoDeVereda[];
}

export interface Vereda {
  /** Vai na rota: /vereda/html. */
  id: string;
  /** O código curto. Nomeia a arte, e nomeará o certificado. */
  codigo: string;
  titulo: string;
  resumo: string;
  /** A trilha completa de onde ela saiu. Só para dizer de onde veio. */
  origem: string;
  /**
   * O quadro do resultado roda o exemplo como HTML. Uma vereda cujos exemplos
   * não sejam HTML — de planilha, de linha de comando — desliga isto e mostra
   * só o código, em vez de fingir que executa.
   */
  mostraResultado: boolean;
  modulos: ModuloDeVereda[];
}

export const VEREDAS: Vereda[] = [
  {
    id: 'html',
    codigo: 'VD01',
    titulo: 'Sintaxe do HTML',
    resumo: 'Do que é uma tag até o menu de um site. Sete módulos, cada um com teoria e um laboratório.',
    origem: 'AP035',
    mostraResultado: true,
    modulos: MODULOS_DE_HTML,
  },
];

export function getVereda(id: string | undefined): Vereda | undefined {
  return VEREDAS.find(v => v.id === id);
}

/** Todas as lições, na ordem em que se percorre, sabendo de que módulo são. */
export function licoesDaVereda(vereda: Vereda) {
  return vereda.modulos.flatMap(m =>
    m.licoes.map(l => ({ ...l, modulo: m.titulo, moduloId: m.id })));
}

export function getLicaoDaVereda(vereda: Vereda, licaoId: string | undefined) {
  return licoesDaVereda(vereda).find(l => l.id === licaoId);
}

/** Só os tópicos, na ordem — é o que o leitor desenha. */
export function topicosDaVereda(vereda: Vereda) {
  return licoesDaVereda(vereda).flatMap(l =>
    l.tipo === 'teoria'
      ? l.topicos.map(t => ({ ...t, licao: l.titulo, licaoId: l.id, modulo: l.modulo }))
      : []);
}

/**
 * A insígnia de cada vereda.
 *
 * Como a das trilhas completas: o código sai do id, e a próxima vereda entra
 * sozinha. O que continua sendo à mão é semear a linha na tabela — insígnia
 * que não existe lá é ignorada sem erro e sem prêmio.
 */
export function codigoDaInsigniaDaVereda(id: string): string {
  return `vereda_${id}`;
}
