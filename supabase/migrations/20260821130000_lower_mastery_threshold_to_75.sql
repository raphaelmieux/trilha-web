/*
  Reavalia o progresso já registrado com o novo acerto mínimo.

  O corte para um requisito contar como cumprido caiu de 80% para 75%. Das 42
  primeiras conclusões de lição, 17 haviam ficado em "a recuperar", e a maior
  parte delas por uma questão: 6 acertos em 8 dá 75%, e 80% de 8 exige 7.

  Quem tirou 75% não precisa refazer nada — o desempenho é o mesmo, o que mudou
  foi a régua. Sem esta reavaliação, a mudança só valeria para quem estudasse
  daqui em diante, e quem já estava a um passo continuaria parado sem entender
  por quê.

  Só sobe: nada aqui rebaixa um requisito.
*/
update requirement_progress
   set status = 'completed',
       updated_at = now()
 where status <> 'completed'
   and mastery_score >= 75;
