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

  /*
    Enquanto carrega, a resposta é sim.

    A trava de pré-requisito pergunta isto, e durante a consulta o percurso está
    vazio: responder "não" faria a tela de quem já concluiu a CC001 piscar
    bloqueada antes de abrir — e ver "bloqueada" onde havia acesso é a forma
    mais rápida de alguém achar que perdeu o que fez. O outro lado do erro é
    inofensivo: quem não cumpriu vê a vereda um instante e ela se fecha.
  */
  const concluida = (id: string): boolean =>
    carregando || (andamento.find(a => a.id === id)?.concluida ?? false);

  return { andamento, percursoDe, concluida, carregando, recarregar };
}
