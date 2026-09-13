import { ESCADAS } from './escadasDeInsignia';
import { getSpecialty } from '../curriculum';
import { getVereda } from '../curriculum/veredas';
import { nomeCompleto } from '../types';
import { FUSO_DE_BRASILIA } from './ofensiva';
import type { InsigniaConquistada } from './conquista';

/*
  O que uma insígnia quer dizer, em três frases.

  ── O problema ────────────────────────────────────────────────────────────
  A estante mostrava o desenho e o nome. "Coruja" com uma coruja dentro não
  diz o que a pessoa fez para ganhar: ela sabe que ganhou e não sabe por quê,
  e uma recompensa que não se liga a um feito não recompensa feito nenhum —
  vira enfeite. Nas de escada ainda dava para adivinhar pelo número; nas que
  marcam uma coisa só, não havia o que adivinhar.

  ── As três frases, e de onde cada uma sai ────────────────────────────────
  **O feito** se deriva do catálogo: a descrição já diz o que foi preciso
  ("Estudou entre a meia-noite e as cinco da manhã"), e a família diz de que
  assunto ela é. Nada disso é gravado — guardar de novo seria a segunda cópia.

  **Onde** sai do `context` da linha, gravado no instante da conquista, porque
  é a única coisa que só aquele instante sabia. Quem conquistou antes disto
  existir tem `{}` — e aí a frase simplesmente não aparece. Não se inventa
  percurso: dizer "na AP034" sem saber seria afirmar o que não foi conferido,
  que é a mesma assimetria do `umDe`.

  **Quando** sai de `awarded_at`, que sempre esteve lá. Em Brasília, pelo
  mesmo fuso que `ofensiva.ts` estabeleceu como o único da plataforma — a data
  da conquista de quem estuda às 22h não pode cair no dia seguinte.
*/

export interface ExplicacaoDaInsignia {
  /** A família a que ela pertence, quando pertence a alguma. */
  familia?: string;
  /** O que foi preciso fazer. Sempre existe. */
  feito: string;
  /** Em que trilha ou vereda ela caiu. Ausente quando não se sabe. */
  onde?: string;
  /** Quando caiu, por extenso. Ausente quando a linha não trouxe a data. */
  quando?: string;
}

/** A família de uma insígnia de escada — as de identidade não têm. */
function familiaDe(code: string): string | undefined {
  return ESCADAS.find(e => e.degraus.some(d => d.code === code))?.familia;
}

/**
 * O nome do percurso por código, seja ele trilha ou vereda.
 *
 * É o mesmo par código + nome de `nomeCompleto` que o resto da plataforma usa;
 * montar "AP044 — Computação 4" à mão aqui deixaria esta tela com um formato
 * que nenhuma outra tem.
 */
export function nomeDoPercurso(codigo: string): string | undefined {
  const trilha = getSpecialty(codigo);
  if (trilha) return nomeCompleto(trilha);
  const vereda = getVereda(codigo);
  if (vereda) return nomeCompleto(vereda);
  return undefined;
}

/*
  A data por extenso, em Brasília.

  `toLocaleDateString` sem `timeZone` usa o fuso do aparelho, e é o mesmo erro
  que a ofensiva já custou: quem estuda às 22h — que é quando o clube se
  reúne — veria a conquista datada do dia seguinte. O fuso se diz pelo nome,
  nunca por um `-3` escrito à mão.
*/
export function dataPorExtenso(instante: string): string | undefined {
  const quando = new Date(instante);
  if (Number.isNaN(quando.getTime())) return undefined;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: FUSO_DE_BRASILIA,
  }).format(quando);
}

/** As três frases de uma insígnia conquistada. */
export function explicarInsignia(insignia: InsigniaConquistada): ExplicacaoDaInsignia {
  const percurso = insignia.contexto?.percurso;
  return {
    familia: familiaDe(insignia.code),
    feito: insignia.description,
    /* Só quando o código gravado corresponde a um percurso que existe: um
       código que o currículo não conhece — percurso renomeado, dump antigo —
       vira silêncio, e não uma sigla solta na tela. */
    onde: percurso ? nomeDoPercurso(percurso) : undefined,
    quando: insignia.conquistadaEm ? dataPorExtenso(insignia.conquistadaEm) : undefined,
  };
}

/**
 * A explicação numa linha, que é o que o aviso de conquista mostra.
 *
 * O aviso tem três elementos e nada mais — desenho, título e explicação —, e
 * ele aparece por poucos segundos: uma lista de três itens ali obrigaria a
 * ler correndo o que não dá tempo de ler. Aqui a frase é uma só, e o resto
 * fica na estante, onde a pessoa chega quando quiser.
 */
export function explicacaoEmUmaLinha(insignia: InsigniaConquistada): string {
  const { feito, onde } = explicarInsignia(insignia);
  return onde ? `${feito} — em ${onde}` : feito;
}
