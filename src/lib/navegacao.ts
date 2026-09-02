/**
 * O percurso que está aberto agora, pelo endereço — ou nada.
 *
 * O botão do menu levava a `/especialidade/AP034`, escrito à mão. Quem estava
 * numa lição da AP041 e clicava nele saía da própria trilha e caía em outra: o
 * botão nunca levava à trilha da tela, porque não olhava para a tela.
 *
 * É o mesmo erro que este projeto já corrigiu em nove lugares — uma tela que
 * sabe o código de uma trilha. Aqui o código sai do endereço, e percurso novo
 * entra sozinho.
 *
 * Devolve `null` fora de um percurso, e aí o botão não aparece. "Trilha Atual"
 * sem trilha atual não é um atalho: é uma promessa que a tela não pode cumprir,
 * e antes ela era cumprida levando a pessoa para uma trilha qualquer.
 *
 * ── E a vereda não se chama trilha ───────────────────────────────────────
 * A vereda tinha o mesmo problema pela raiz oposta: o botão simplesmente não
 * existia nela, e quem saía para o relatório voltava pela home. Ela entra aqui,
 * com o rótulo dela — chamar a vereda de trilha desfaria de uma vez a distinção
 * que o resto da plataforma sustenta com cuidado.
 *
 * Mora aqui, e não em App.tsx, porque Fast Refresh só troca um módulo em pé
 * quando tudo o que ele exporta é componente — ver AuthProvider/AuthContext.
 */
export interface PercursoAberto {
  /** Para onde o botão leva. */
  rota: string;
  /** O que ele diz. */
  rotulo: string;
}

export function percursoAtual(pathname: string): PercursoAberto | null {
  /* /especialidade/:trilha  e  /licao/:trilha/:modulo/:licao */
  const trilha = pathname.match(/^\/(?:especialidade|licao)\/([^/]+)/);
  if (trilha) return { rota: `/especialidade/${trilha[1]}`, rotulo: 'Trilha Atual' };

  /*
    A lição da vereda não tem endereço próprio: ela abre dentro de
    `/vereda/:code`. O botão então aponta para a página onde a pessoa já está —
    e isso não é inútil, porque de dentro de uma lição o menu é o único caminho
    de volta que não passa pela home.
  */
  const vereda = pathname.match(/^\/vereda\/([^/]+)/);
  if (vereda) return { rota: `/vereda/${vereda[1]}`, rotulo: 'Vereda Atual' };

  return null;
}
