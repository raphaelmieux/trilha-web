import { getAllSpecialties } from '../curriculum';
import { VEREDAS } from '../curriculum/veredas';

/*
  Os Mestrados: completar um conjunto rende uma peça a mais na Faixa.

  No clube de verdade, completar um conjunto de especialidades de uma área
  rende um Mestrado. Aqui há dois tipos, e eles não se confundem nem na Faixa:

  - **Mestrado da plataforma** — um por família de trilha e um por família de
    vereda, ao concluir todas as dela. É invenção desta plataforma, e o cartão
    diz isso: o relatório entregue ao clube não pode apresentá-lo como se fosse
    um Mestrado oficial. Na Faixa é um button em retângulo áureo.
  - **ME006 Mestrado em Ciência e Tecnologia** — oficial. O requisito pede sete
    de vinte especialidades, e onze delas são trilhas daqui; a plataforma
    confere só as que tem. Na Faixa é patch, como a especialidade, e segredo
    até a sétima trilha.

  A família de cada Mestrado sai do registro (`familia`), e não de uma lista
  escrita à mão: trilha ou vereda nova entra no Mestrado dela sozinha. Família
  com percurso anunciado só fecha quando ele abrir e for concluído — é o
  "fecha no fim" que a Faixa inteira segue.
*/

export interface Mestrado {
  code: string;
  nome: string;
  descricao: string;
  oficial: boolean;
  /** Trilhas que contam, pelo código; e veredas, pelo id. */
  trilhas: readonly string[];
  veredas: readonly string[];
  /** Quantas da lista bastam. */
  minimo: number;
}

/*
  `Artes e Habilidades Manuais` → `artes_e_habilidades_manuais`, e `Front-end`
  → `front_end`. Sublinhado, e não hífen: o leitor das migrations
  (`catalogoSemeado`) só reconhece código feito de `[a-z0-9_]`, e um código
  com hífen ficaria invisível para as travas do catálogo.
*/
export const slugDaFamilia = (familia: string) =>
  familia.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '_');

/*
  A lista do ME006 é a do documento oficial
  (`public/curriculum files/ME006 Mestrado em Ciência e Tecnologia.pdf`), só com
  as especialidades que existem aqui. Física, Química e as outras sete não
  entram: dizer "eu fiz Física" seria autodeclaração.
*/
export const TRILHAS_DO_ME006 = ['AP041', 'AP042', 'AP043', 'AP044', 'AP045', 'AP049', 'AP052', 'AP034', 'AP035', 'AP063', 'AP064'] as const;

const familias = <T extends { familia: string }>(lista: readonly T[]) => [...new Set(lista.map(x => x.familia))];

export function mestrados(): Mestrado[] {
  const trilhas = getAllSpecialties();
  const daPlataforma = (familia: string, ehTrilha: boolean): Mestrado => {
    const t = ehTrilha ? trilhas.filter(x => x.familia === familia).map(x => x.code) : [];
    const v = ehTrilha ? [] : VEREDAS.filter(x => x.familia === familia).map(x => x.id);
    return {
      code: `mestrado_${slugDaFamilia(familia)}`,
      nome: `Mestrado ${familia}`,
      descricao: `Mestrado da plataforma: concluiu todas as ${ehTrilha ? 'trilhas' : 'veredas'} da família ${familia}.`,
      oficial: false,
      trilhas: t, veredas: v, minimo: t.length + v.length,
    };
  };
  return [
    ...familias(trilhas).map(f => daPlataforma(f, true)),
    ...familias(VEREDAS).map(f => daPlataforma(f, false)),
    {
      code: 'mestrado_me006',
      nome: 'ME006 Mestrado em Ciência e Tecnologia',
      descricao: 'Mestrado oficial: concluiu nesta plataforma sete trilhas da lista do ME006.',
      oficial: true,
      trilhas: TRILHAS_DO_ME006, veredas: [], minimo: 7,
    },
  ];
}

/** Os Mestrados alcançados, pelas trilhas (código) e veredas (id) concluídas. */
export function mestradosConquistados(trilhas: readonly string[], veredas: readonly string[]): string[] {
  return mestrados()
    .filter(m => m.trilhas.filter(t => trilhas.includes(t)).length + m.veredas.filter(v => veredas.includes(v)).length >= m.minimo)
    .map(m => m.code);
}
