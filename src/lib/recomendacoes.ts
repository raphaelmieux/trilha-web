import { VEREDAS_RECOMENDADAS, type RecomendacaoDeVereda } from '../curriculum/recomendacoes';
import { getVereda, veredasAbertas, type Vereda } from '../curriculum/veredas';

/**
 * As veredas que complementam uma trilha, e as que a destravam.
 *
 * Tudo aqui olha só para `veredasAbertas()`. Recomendar uma vereda em
 * construção é prometer um caminho que não existe; travar a trilha atrás dela é
 * pior — a trilha nunca abriria, porque "concluída" nunca fica verdadeiro para
 * uma vereda sem lição nenhuma.
 */

export interface RecomendacaoResolvida extends RecomendacaoDeVereda {
  /** A vereda de verdade, já sabida aberta. */
  aberta: Vereda;
}

const abertas = () => new Set(veredasAbertas().map(v => v.id));

export function recomendacoesDaTrilha(codigoDaTrilha: string): RecomendacaoResolvida[] {
  const disponiveis = abertas();
  return (VEREDAS_RECOMENDADAS[codigoDaTrilha] ?? [])
    .flatMap(r => {
      if (!disponiveis.has(r.vereda)) return [];
      const aberta = getVereda(r.vereda);
      return aberta ? [{ ...r, aberta }] : [];
    });
}

/**
 * As veredas essenciais que ainda faltam — é o que segura a trilha.
 *
 * Lista vazia quer dizer trilha liberada, e é o caso de todas as trilhas com
 * conteúdo hoje. A trava foi escrita para as anunciadas, cujos requisitos
 * oficiais supõem programação que elas mesmas não ensinam.
 */
export function veredasQueFaltam(
  codigoDaTrilha: string,
  concluidas: string[],
): RecomendacaoResolvida[] {
  const feitas = new Set(concluidas);
  return recomendacoesDaTrilha(codigoDaTrilha)
    .filter(r => r.essencial && !feitas.has(r.vereda));
}

export const trilhaTravada = (codigoDaTrilha: string, concluidas: string[]) =>
  veredasQueFaltam(codigoDaTrilha, concluidas).length > 0;
