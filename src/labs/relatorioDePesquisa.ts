/**
 * O relatório escrito a partir de uma pesquisa — AP045 requisito 6, segunda
 * metade.
 *
 * É a redação guiada de sempre (`redacaoGuiada.ts`), com três coisas a mais,
 * todas saídas da mesma ideia: o relatório vem das **fichas**, e não das
 * páginas.
 *
 * - toda etapa de fato cita pelo menos uma ficha — escrever sem apoio numa
 *   etapa é voltar a escrever de memória, que é o que a pesquisa existia para
 *   substituir;
 * - o que for copiado do trecho de uma ficha precisa vir entre aspas — cópia
 *   com aspas é citação, e citação é legítima; sem aspas é o texto de outra
 *   pessoa assinado por você (EF69LP43: citação, paráfrase e referência);
 * - as referências saem das fichas citadas, montadas, e vão no fim do texto.
 *   Ninguém as digita, e por isso ninguém as esquece.
 *
 * O mínimo de 200 palavras é nosso, e não do documento oficial — que não pede
 * tamanho nenhum. Sem mínimo, quatro frases passariam por relatório; duzentas
 * palavras são o que as quatro perguntas do recorte pedem para serem
 * respondidas de verdade por alguém de dez a quinze anos.
 */

import type { FichaEntregue } from './pesquisaDoBug';
import { copiaDaFonte } from './pesquisaDoBug';
import type { EtapaRedacao, RespostaEtapa } from './redacaoGuiada';

/** Qual pesquisa alimenta qual relatório, pelo código da lição do relatório. */
export const PESQUISA_DO_RELATORIO: Record<string, { projeto: string; licaoDaPesquisa: string; moduloDaPesquisa: string }> = {
  'AP045.5-L4': { projeto: 'AP045-bug-do-milenio', licaoDaPesquisa: 'AP045.5-L3', moduloDaPesquisa: 'AP045.5' },
};

/** O cabeçalho da seção de referências — também é por ele que o texto é partido. */
export const TITULO_DAS_REFERENCIAS = 'Referências';

/**
 * Tira o que está entre aspas: aquilo é citação, e citar não é copiar.
 *
 * As retas e as curvas, porque o teclado do celular troca uma pela outra
 * sozinho, e quem pôs aspas não pode levar bronca pela tecla que o aparelho
 * escolheu.
 */
export const semCitacoes = (texto: string) =>
  texto.replace(/"[^"]*"/g, ' ').replace(/“[^”]*”/g, ' ');

/** A ficha cujo trecho a resposta copiou sem aspas, se houver. */
export function fichaCopiada(texto: string, fichas: readonly FichaEntregue[]): FichaEntregue | undefined {
  const livre = semCitacoes(texto);
  return fichas.find(f => copiaDaFonte(livre, f.trecho));
}

/** As fichas que uma resposta cita, na ordem em que estão no caderno. */
export const fichasCitadas = (resposta: RespostaEtapa | undefined, fichas: readonly FichaEntregue[]) =>
  fichas.filter(f => resposta?.fichas?.includes(f.id));

/**
 * O que ainda impede a etapa de valer, além do que a redação guiada já cobra.
 *
 * Etapa de opinião não cita nada: é a pessoa pensando, e exigir fonte para o
 * que alguém acha seria reprovar por pensar — a mesma razão de ela não passar
 * pela conferência de fatos.
 */
export function faltaNaEtapa(
  etapa: EtapaRedacao, resposta: RespostaEtapa | undefined, fichas: readonly FichaEntregue[],
): { tipo: 'citar' | 'copia'; mensagem: string } | null {
  if (etapa.opiniao) return null;
  const citadas = fichasCitadas(resposta, fichas);
  if (citadas.length === 0) return { tipo: 'citar', mensagem: 'Marque pelo menos uma ficha em que esta resposta se apoia.' };
  /* Contra todas as fichas, e não só as marcadas: copiar de uma ficha que
     não se citou é o mesmo texto de outra pessoa, com um passo a menos. */
  const copiada = fichaCopiada(resposta?.texto ?? '', fichas);
  if (copiada) {
    return { tipo: 'copia',
      mensagem: `Um pedaço desta resposta está igual ao trecho de "${copiada.site}". Escreva com as suas palavras, ou ponha o pedaço entre aspas.` };
  }
  return null;
}

/** A seção de referências, a partir das fichas citadas em alguma etapa. */
export function referencias(citadas: readonly FichaEntregue[]): string {
  const unicas = [...new Set(citadas.map(f => f.fonte))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return unicas.length ? `${TITULO_DAS_REFERENCIAS}\n${unicas.map(r => `- ${r}`).join('\n')}` : '';
}

/**
 * O texto sem a seção de referências — é ele que conta as palavras.
 *
 * As referências são montadas, e não escritas: contá-las deixaria um relatório
 * de cento e quarenta palavras passar das duzentas pelo tamanho das citações.
 */
export function semReferencias(texto: string): string {
  const i = texto.lastIndexOf(`\n${TITULO_DAS_REFERENCIAS}\n`);
  return i >= 0 ? texto.slice(0, i) : texto;
}

/** Valida o que veio do banco: metadata é jsonb, e a forma não é garantida. */
export function lerFichas(metadata: unknown): FichaEntregue[] {
  const m = metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {};
  const lista = Array.isArray(m.fichas) ? m.fichas : [];
  return lista.flatMap((f): FichaEntregue[] => {
    if (!f || typeof f !== 'object') return [];
    const x = f as Record<string, unknown>;
    const texto = (k: string) => (typeof x[k] === 'string' ? (x[k] as string) : '');
    if (!texto('id') || !texto('anotacao') || !texto('fonte')) return [];
    return [{
      id: texto('id'), pergunta: texto('pergunta') as FichaEntregue['pergunta'],
      anotacao: texto('anotacao'), trecho: texto('trecho'), desmente: x.desmente === true,
      fonte: texto('fonte'), site: texto('site'),
    }];
  });
}
