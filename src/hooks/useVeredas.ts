import { useCallback, useEffect, useState } from 'react';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import {
  buscarPercurso, percursoDosEventos, licoesVencidas,
  type PercursoDeVereda, type PercursoDasVeredas,
} from '../lib/veredas';

export interface AndamentoDeVereda {
  id: string;
  vencidas: number;
  total: number;
  concluida: boolean;
}

/**
 * Quanto de cada vereda já foi vencido.
 *
 * Uma consulta só, filtrada pelos tipos de evento da vereda — o painel não
 * precisa do histórico inteiro para desenhar duas barrinhas.
 *
 * Devolve também `recarregar`, porque a tela da vereda muda o que ela mesma
 * mostra: sair de um laboratório vencido tem de repintar a lista sem recarregar
 * a página.
 */
export function useVeredas(userId: string | undefined) {
  const [percurso, setPercurso] = useState<PercursoDasVeredas>({});
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!userId) { setCarregando(false); return; }
    const eventos = await buscarPercurso(userId);
    setPercurso(percursoDosEventos(eventos));
    setCarregando(false);
  }, [userId]);

  useEffect(() => { void recarregar(); }, [recarregar]);

  const andamento: AndamentoDeVereda[] = VEREDAS.map(v => {
    const total = licoesDaVereda(v).length;
    const vencidas = licoesVencidas(v, percurso[v.id]);
    /*
      `total > 0` carrega o peso todo.

      Vereda anunciada tem zero lições, e `0 === 0` é verdadeiro: sem esta
      guarda toda vereda por escrever nasce concluída para todo mundo. É o
      mesmo vazio que já enganou a verificação de links quebrados e o percentual
      das veredas — `veredasConcluidas` foi corrigida na época, e este cálculo,
      que é outra cópia da mesma conta, ficou para trás. O relatório entregue ao
      clube listava as vinte e nove por escrever como cumpridas.
    */
    return { id: v.id, vencidas, total, concluida: total > 0 && vencidas === total };
  });

  const percursoDe = (id: string): PercursoDeVereda | undefined => percurso[id];

  return { andamento, percursoDe, carregando, recarregar };
}
