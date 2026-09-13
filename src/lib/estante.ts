import { ESCADAS, type Escada, type DegrauDaEscada } from './escadasDeInsignia';
import {
  INSIGNIAS, SEM_CLASSE, codigoDaInsigniaDaTrilha, classeDaTrilha, classeDaVereda,
} from './insignias';
import { getOpenSpecialties } from '../curriculum';
import { veredasAbertas, codigoDaInsigniaDaVereda, licoesDaVereda } from '../curriculum/veredas';
import { nomeCompleto } from '../types';
import type { NivelDaInsignia } from './nivelDaInsignia';

/*
  O catálogo inteiro, montado para a estante desenhar — inclusive o que ainda
  não foi conquistado.

  ── Por que ele não existia ───────────────────────────────────────────────
  Até aqui, ninguém precisava da lista completa. `INSIGNIAS` traz as que são
  escritas à mão — os noventa e um degraus das escadas, as quatro de horário e
  as vinte e seis de laboratório —, e as de trilha e de vereda **não estão
  nela**: nascem do currículo na hora de conceder, por
  `codigoDaInsigniaDaTrilha` e `codigoDaInsigniaDaVereda`. Quem só desenha o
  que a pessoa já tem nunca sente falta delas, porque o que ela tem já veio do
  banco com nome e classe.

  A estante desenha o que **falta**, e aí a falta aparece: sem este arquivo,
  onze insígnias de percurso simplesmente não teriam lugar na prateleira, e
  ninguém perceberia — a página ficaria bonita, completa, e com onze buracos
  que não se veem porque não há nada onde eles deveriam estar. É a armadilha do
  "zero link não é zero link quebrado" aplicada a uma vitrine.

  ── E por que ele não é uma segunda lista ─────────────────────────────────
  Tudo aqui é derivado: as escadas saem de `ESCADAS`, os laboratórios e as de
  horário saem de `INSIGNIAS`, e as de percurso saem do currículo com as mesmas
  funções que a concessão usa. Uma segunda lista escrita à mão divergiria no
  primeiro percurso novo — a trilha abriria, a insígnia seria concedida, e a
  estante continuaria sem a prateleira dela.
*/

/** Um lugar na prateleira: pode estar ocupado ou vazio. */
export interface LugarNaEstante {
  code: string;
  nome: string;
  descricao: string;
  icone: string;
  classe: NivelDaInsignia;
  /** As de horário não têm classe — círculo off-white. */
  semClasse?: boolean;
  /** O que é preciso alcançar, nas que são degrau de escada. */
  alvo?: number;
}

/** Uma fileira da estante: a família, o que ela mede, e os sete degraus. */
export interface FileiraDaEstante {
  chave: string;
  titulo: string;
  /** O que a fileira mede, ou de onde a classe de cada item sai. */
  explica: string;
  lugares: LugarNaEstante[];
}

const doDegrau = (escada: Escada, d: DegrauDaEscada): LugarNaEstante => ({
  code: d.code, nome: d.nome, descricao: d.descricao,
  icone: escada.icone, classe: d.classe, alvo: d.alvo,
});

/** As treze escadas, com os sete degraus de cada uma. */
export function fileirasDasEscadas(): FileiraDaEstante[] {
  return ESCADAS.map(escada => ({
    chave: escada.chave,
    titulo: escada.familia,
    explica: escada.mede,
    lugares: escada.degraus.map(d => doDegrau(escada, d)),
  }));
}

/*
  As de percurso, montadas como a concessão as monta.

  O nome e a descrição são escritos aqui e **também** na migration do catálogo,
  que é de onde a tela lê o nome de uma já conquistada. As duas precisam
  coincidir: divergir é a mesma insígnia se chamando uma coisa no lugar vazio e
  outra depois de ganha, que é o defeito que os nomes por extenso já custaram.
  `estante.test.ts` compara as duas.
*/
function fileiraDasTrilhas(): FileiraDaEstante {
  return {
    chave: 'trilhas-concluidas',
    titulo: 'Trilhas concluídas',
    explica: 'uma por especialidade — a classe é o nível dela',
    lugares: getOpenSpecialties().map(e => ({
      code: codigoDaInsigniaDaTrilha(e.code),
      nome: `Trilha ${nomeCompleto(e)}`,
      descricao: `Concluiu todos os requisitos da especialidade ${nomeCompleto(e)}.`,
      icone: 'trophy',
      classe: classeDaTrilha(e.code),
    })),
  };
}

function fileiraDasVeredas(): FileiraDaEstante {
  return {
    chave: 'veredas-concluidas',
    titulo: 'Veredas concluídas',
    explica: 'uma por vereda — a classe é o tamanho dela',
    lugares: veredasAbertas().map(v => ({
      code: codigoDaInsigniaDaVereda(v.id),
      nome: `Vereda ${nomeCompleto(v)}`,
      descricao: `Percorreu a vereda ${nomeCompleto(v)} inteira — ${licoesDaVereda(v).length} lições.`,
      icone: 'route',
      classe: classeDaVereda(v.id),
    })),
  };
}

/** Os códigos que pertencem a alguma escada, para não repetir na estante. */
const emEscada = (): Set<string> =>
  new Set(ESCADAS.flatMap(e => e.degraus.map(d => d.code)));

function fileiraDosLaboratorios(): FileiraDaEstante {
  const daEscada = emEscada();
  return {
    chave: 'laboratorios-vencidos',
    titulo: 'Laboratórios vencidos',
    explica: 'uma por laboratório — a classe é o nível da trilha dele',
    lugares: INSIGNIAS
      .filter(i => !daEscada.has(i.code) && !SEM_CLASSE.has(i.code))
      .map(i => ({
        code: i.code, nome: i.nome, descricao: i.descricao,
        icone: i.icone, classe: i.tier,
      })),
  };
}

function fileiraSemClasse(): FileiraDaEstante {
  return {
    chave: 'sem-classe',
    titulo: 'Curiosidades',
    explica: 'medem quando se estuda, e não quanto — por isso não têm classe',
    lugares: INSIGNIAS
      .filter(i => SEM_CLASSE.has(i.code))
      .map(i => ({
        code: i.code, nome: i.nome, descricao: i.descricao,
        icone: i.icone, classe: i.tier, semClasse: true,
      })),
  };
}

/**
 * A estante inteira, na ordem em que ela se lê.
 *
 * As escadas primeiro, porque é nelas que se anda todo dia; depois o que marca
 * um percurso específico; e as curiosidades no fim, que é onde o que não tem
 * ordem não atrapalha quem procura ordem.
 */
export function fileirasDaEstante(): FileiraDaEstante[] {
  return [
    ...fileirasDasEscadas(),
    fileiraDosLaboratorios(),
    fileiraDasTrilhas(),
    fileiraDasVeredas(),
    fileiraSemClasse(),
  ];
}

/** Quantos lugares a estante tem ao todo. */
export function totalDaEstante(): number {
  return fileirasDaEstante().reduce((soma, f) => soma + f.lugares.length, 0);
}
