/*
  Remove a view public_leaderboard.

  O ranking passou a ser servido pela função leaderboard(periodo), que soma XP
  dentro de uma janela de tempo e respeita show_club_publicly. A view continuou
  no banco, sem ninguém consultando, carregando uma segunda definição de quem
  pode aparecer no ranking — inclusive a junção com privacy_preferences.

  Duas definições da mesma regra é o tipo de coisa que morde depois: uma
  mudança sobre quem aparece publicamente pode ser feita na cópia errada e
  parecer aplicada. Verificado antes de apagar: nada em src/, nada nas edge
  functions, e nenhuma outra view ou regra dependia dela.
*/
drop view if exists public.public_leaderboard;
