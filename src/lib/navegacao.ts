/**
 * A trilha que está aberta agora, pelo endereço — ou nada.
 *
 * O botão do menu levava a `/especialidade/AP034`, escrito à mão. Quem estava
 * numa lição da AP041 e clicava nele saía da própria trilha e caía em outra: o
 * botão nunca levava à trilha da tela, porque não olhava para a tela.
 *
 * É o mesmo erro que este projeto já corrigiu em nove lugares — uma tela que
 * sabe o código de uma trilha. Aqui o código sai do endereço, e trilha nova
 * entra sozinha.
 *
 * Devolve `null` fora de uma trilha, e aí o botão não aparece. "Trilha Atual"
 * sem trilha atual não é um atalho: é uma promessa que a tela não pode cumprir,
 * e antes ela era cumprida levando a pessoa para uma trilha qualquer.
 *
 * Mora aqui, e não em App.tsx, porque Fast Refresh só troca um módulo em pé
 * quando tudo o que ele exporta é componente — ver AuthProvider/AuthContext.
 */
export function rotaDaTrilhaAtual(pathname: string): string | null {
  /* /especialidade/:trilha  e  /licao/:trilha/:modulo/:licao */
  const achado = pathname.match(/^\/(?:especialidade|licao)\/([^/]+)/);
  return achado ? `/especialidade/${achado[1]}` : null;
}
