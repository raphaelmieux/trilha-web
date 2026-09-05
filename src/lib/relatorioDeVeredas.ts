import type { Vereda } from '../curriculum/veredas';
import { licoesDaVereda, textoDaOrigem } from '../curriculum/veredas';
import type { Certification } from '../types';

/**
 * O que o relatório diz sobre as veredas.
 *
 * ── O que estava errado ──────────────────────────────────────────────────
 * O relatório só citava vereda **concluída**. Quem estivesse no meio de uma —
 * que é onde quase todo mundo está — não aparecia de jeito nenhum: a seção
 * inteira sumia, e o documento entregue ao clube dizia, por omissão, que a
 * pessoa não tinha feito nada além das trilhas. E no PDF nem a versão
 * concluída entrava: a seção existia só na tela.
 *
 * ── Por que ela merece um lugar próprio ──────────────────────────────────
 * A vereda é bônus: não entra em percentual, não tem requisito oficial e não
 * tem nota. Isso a mantém fora da contabilidade das trilhas, e não fora do
 * relatório — o documento existe para dizer o que a pessoa fez, e estudar por
 * conta própria é das coisas mais dignas de nota que ela pode ter feito.
 *
 * Justamente por ser bônus, o texto precisa explicar o que é uma vereda antes
 * de listar qualquer coisa: quem lê o relatório é a liderança do clube, que
 * conhece a ficha das especialidades e nunca ouviu falar disto.
 *
 * ── Desempenho, aqui, é percurso ─────────────────────────────────────────
 * Não há nota a relatar, e inventar uma seria pior do que não ter: os eventos
 * gravam qual lição foi vencida, e nada mais. O que se diz é o que se sabe —
 * quantas lições, de que tipo, e o que o percurso rendeu.
 */

/** O andamento de uma vereda, como o painel já o calcula. */
export interface AndamentoDaVereda {
  id: string;
  vencidas: number;
  total: number;
  concluida: boolean;
}

export interface VeredaNoRelatorio {
  code: string;
  nome: string;
  familia: string;
  descricao: string;
  vencidas: number;
  total: number;
  percent: number;
  concluida: boolean;
  /** A frase que descreve esta vereda e o ponto em que a pessoa está nela. */
  frase: string;
}

export interface RelatorioDeVeredas {
  /** O parágrafo que explica o que é uma vereda. Vazio quando não há o que dizer. */
  introducao: string;
  percursos: VeredaNoRelatorio[];
  /** O fechamento: o que as veredas renderam. Vazio quando não rendeu nada. */
  conquistas: string;
}

const plural = (n: number, um: string, muitos: string) => (n === 1 ? um : muitos);

/*
  Teoria e laboratório são as duas metades, e vale dizer quais foram vencidas.

  "Cinco de catorze lições" é um número; "toda a teoria e três dos sete
  laboratórios" diz o que a pessoa sabe e o que ela ainda não pôs em prática, que
  é a pergunta que a liderança faz.
*/
function metades(vereda: Vereda, vencidasIds: Set<string>) {
  const licoes = licoesDaVereda(vereda);
  const conta = (tipo: 'teoria' | 'resto') => {
    const doTipo = licoes.filter(l => (tipo === 'teoria' ? l.tipo === 'teoria' : l.tipo !== 'teoria'));
    return { total: doTipo.length, feitas: doTipo.filter(l => vencidasIds.has(l.id)).length };
  };
  return { teoria: conta('teoria'), pratica: conta('resto') };
}

function fraseDaVereda(
  vereda: Vereda,
  vencidas: number,
  total: number,
  vencidasIds: Set<string>,
): string {
  const { teoria, pratica } = metades(vereda, vencidasIds);
  const onde = vereda.origem ? ` Ela nasceu ${textoDaOrigem(vereda.origem)}.` : '';

  if (total > 0 && vencidas === total) {
    return `Percorreu a vereda inteira: ${total} ${plural(total, 'lição', 'lições')}, `
      + `sendo ${teoria.total} de teoria e ${pratica.total} de prática.${onde}`;
  }

  /* A palavra "lições" aparece uma vez só: repeti-la nas duas metades sai
     truncado em voz alta, e este texto é lido em voz alta na entrega ao clube.
     Metade com zero também não vira parte — dizer "0 de 7 de prática" é ocupar
     uma linha para não dizer nada. */
  const partes: string[] = [];
  if (teoria.feitas > 0) {
    partes.push(`${teoria.feitas} de ${teoria.total} ${plural(teoria.total, 'lição', 'lições')} de teoria`);
  }
  if (pratica.feitas > 0) {
    const so = teoria.feitas > 0 ? '' : `${plural(pratica.total, 'lição', 'lições')} `;
    partes.push(`${pratica.feitas} de ${pratica.total} ${so}de prática`);
  }

  const feito = partes.length === 2 ? `${partes[0]} e ${partes[1]}` : partes[0];
  return `Está em percurso: venceu ${feito}, de um total de ${total}.${onde}`;
}

/**
 * O trecho de veredas do relatório.
 *
 * Só entram as veredas em que a pessoa venceu ao menos uma lição. Listar as que
 * ela nunca abriu encheria o documento de linhas iguais dizendo zero, e um
 * relatório de aprendizagem fala do que foi feito.
 */
export function montarRelatorioDeVeredas(
  abertas: Vereda[],
  andamento: AndamentoDaVereda[],
  vencidasPorVereda: Record<string, Set<string>>,
  certificados: Certification[],
  studentName: string,
): RelatorioDeVeredas {
  const percursos: VeredaNoRelatorio[] = abertas
    .map(v => ({ v, a: andamento.find(x => x.id === v.id) }))
    .filter(({ a }) => (a?.vencidas ?? 0) > 0)
    .map(({ v, a }) => {
      const vencidas = a?.vencidas ?? 0;
      const total = a?.total ?? licoesDaVereda(v).length;
      return {
        code: v.code,
        nome: v.name,
        familia: v.familia,
        descricao: v.description,
        vencidas,
        total,
        percent: total ? Math.round((vencidas / total) * 100) : 0,
        concluida: total > 0 && vencidas === total,
        frase: fraseDaVereda(v, vencidas, total, vencidasPorVereda[v.id] ?? new Set()),
      };
    });

  if (percursos.length === 0) return { introducao: '', percursos: [], conquistas: '' };

  const concluidas = percursos.filter(p => p.concluida);
  const emCurso = percursos.filter(p => !p.concluida);

  /*
    A explicação vem antes da lista, e é sempre a mesma.

    Quem lê o relatório conhece a ficha das especialidades e nunca ouviu falar de
    vereda. Sem esta abertura, os parágrafos seguintes parecem falar de
    especialidades que a liderança não encontra em documento nenhum.
  */
  const introducao = `Vereda é o caminho estreito que sai da trilha principal: um percurso `
    + `curto, com lições de teoria e laboratórios a vencer, que a plataforma oferece `
    + `fora do currículo das especialidades. Não tem requisito oficial, não tem nota e `
    + `não entra no percentual de especialidade nenhuma — é estudo que ${studentName} `
    + `escolheu fazer por conta própria, e por isso consta aqui: o que segue é o que foi `
    + `percorrido, e não o que foi exigido.`;

  const contagem: string[] = [];
  if (concluidas.length > 0) {
    contagem.push(`concluiu ${concluidas.length} ${plural(concluidas.length, 'vereda', 'veredas')} `
      + `(${concluidas.map(p => p.code).join(', ')})`);
  }
  if (emCurso.length > 0) {
    contagem.push(`está em percurso em ${emCurso.length} ${plural(emCurso.length, 'outra', 'outras')} `
      + `(${emCurso.map(p => p.code).join(', ')})`);
  }

  /*
    O que a vereda rendeu, dito com o que existe: a insígnia e o Token.Web().
    Certificado de vereda é o mesmo documento da trilha, pela mesma tabela e com
    a mesma verificação pública — o clube não tem por que aprender dois.
  */
  const comCertificado = concluidas.filter(p =>
    certificados.some(c => c.status === 'active' && c.curriculum_code === p.code));

  let conquistas = `${studentName} ${contagem.join(' e ')}.`;
  if (comCertificado.length > 0) {
    conquistas += ` ${comCertificado.length === 1 ? 'Uma delas' : `${comCertificado.length} delas`} `
      + `rendeu Token.Web(), o mesmo certificado das trilhas, com a mesma verificação pública: `
      + `${comCertificado.map(p => p.code).join(', ')}.`;
  } else if (concluidas.length > 0) {
    conquistas += ' A vereda concluída rende Token.Web() a pedido, na página da própria vereda.';
  }

  return { introducao, percursos, conquistas };
}
