import { registrarLicaoVencida, EVENTO_LABORATORIO, EVENTO_TEORIA, type PercursoDeVereda } from './veredas';
import { evaluateBadges } from './gamification';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  Vencer uma lição de vereda: gravar, e então avaliar as insígnias.

  A lição gravava o evento e parava ali. Nada chamava a avaliação, e o
  laboratório de vereda — que rende insígnia própria — ficava sem prêmio até a
  pessoa fazer alguma coisa numa trilha, que quem só percorre veredas pode
  nunca fazer. "Todo laboratório concluído rende uma conquista" quer dizer
  rende **agora**, com o aviso aparecendo na hora da vitória.

  ── Por que um arquivo só para isto ───────────────────────────────────────
  O lugar óbvio seria dentro de `registrarLicaoVencida`, e lá não dá:
  `gamification.ts` importa de `veredas.ts` (a conta do que a vereda rende), e
  `veredas.ts` importando `gamification.ts` fecharia o laço. Ciclo de ESM não
  estoura — devolve `undefined` no meio da inicialização, que é o defeito que
  já tirou o `LIMIAR_DOMINIO` de `progress.ts`. Daqui os dois são folhas.
*/
export async function vencerLicaoDaVereda(
  userId: string,
  vereda: Vereda,
  licao: LicaoDeVereda,
  feito: PercursoDeVereda,
): Promise<void> {
  const gravou = await registrarLicaoVencida(userId, vereda, licao, feito);
  /* Lição já vencida não grava nada de novo, e avaliar seria ida ao banco por
     nada. O gatilho diz a vereda pelo código, que é o que o cartão da
     insígnia usa para escrever onde ela caiu. */
  if (!gravou) return;
  evaluateBadges(userId, {
    evento: licao.tipo === 'teoria' ? EVENTO_TEORIA : EVENTO_LABORATORIO,
    percurso: vereda.code,
    licao: licao.id,
  }).catch(() => {});
}
