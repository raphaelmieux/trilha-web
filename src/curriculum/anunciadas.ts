import type { Specialty } from '../types';

/*
 * As trilhas anunciadas, ainda sem conteúdo.
 *
 * O clube precisa ver o percurso inteiro desde já — uma trilha que aparece
 * pronta no dia em que fica pronta não deixa ninguém se planejar. Enquanto
 * `emConstrucao` for verdadeiro elas aparecem acinzentadas no painel, sem link
 * e sem permitir início.
 *
 * Eram quatro, todas de Computação. A AP042 saiu daqui quando os requisitos
 * dela foram publicados e a trilha ganhou conteúdo — que é exatamente o
 * percurso previsto abaixo. Depois entraram outras quatro, de duas famílias
 * novas, cujo emblema e cujo fundo de certificado já estão no repositório.
 *
 * Ficam neste arquivo, e não cada uma no seu, porque não há o que separar: são
 * declarações de existência. Quando os requisitos de uma chegarem, ela ganha o
 * próprio arquivo e sai daqui.
 *
 * A descrição diz o que se sabe e nada além. Inventar ementa para requisito que
 * ainda não foi publicado é prometer ao clube um conteúdo que pode não ser esse.
 *
 * ── O nível também é o que se sabe ───────────────────────────────────────
 * `level` é campo obrigatório e não dá para deixar em branco, então ele sai do
 * que o próprio nome da especialidade já diz: "Avançado" é avançado, e a
 * básica de um par é a básica. Onde o nome não diz nada, fica o meio. Isso é
 * ordenação de vitrine, e não identidade — quem identifica é `code` —, e por
 * isso um nível provisório aqui não estraga nada além da ordem em que os
 * cartões saem, que se corrige junto com os requisitos.
 */

function anunciada(
  code: string,
  name: string,
  level: Specialty['level'],
  familia: string,
  description: string,
  preRequisito?: string,
): Specialty {
  return {
    code, name, level, familia, description,
    ...(preRequisito ? { preRequisito } : {}),
    emConstrucao: true,
    requirements: [],
    modules: [],
  };
}

export const ap043 = anunciada('AP043', 'Computação 3', 'intermediario', 'Computação',
  'A terceira da família, já no nível intermediário. Os requisitos serão publicados quando a trilha abrir.');

export const ap044 = anunciada('AP044', 'Computação 4', 'intermediario', 'Computação',
  'A quarta da família, também intermediária. Os requisitos serão publicados quando a trilha abrir.');

export const ap045 = anunciada('AP045', 'Computação 5', 'avancado', 'Computação',
  'A que fecha a família Computação, no nível avançado. Os requisitos serão publicados quando a trilha abrir.');

/*
  Programação: escrever o programa, e não só usar o computador.

  Duas especialidades separadas do resto porque o assunto é outro — a família
  Computação trata da máquina e do que se faz nela; aqui se escreve o que a
  máquina executa. É também para onde as veredas de Back-end e Sistemas
  apontam quando ganharem conteúdo.
*/
export const ap049 = anunciada('AP049', 'Desenvolvimento de Sistemas', 'avancado', 'Programação',
  'Levar um sistema do problema ao programa que funciona. Os requisitos serão publicados quando a trilha abrir.');

export const ap052 = anunciada('AP052', 'Informática Programável', 'intermediario', 'Programação',
  'Fazer o computador executar o que se escreveu. Os requisitos serão publicados quando a trilha abrir.');

/*
  Web Design: o par básico e avançado, como Internet e Internet Avançado.

  A AP064 traz o pré-requisito escrito no próprio nome, e por isso ele fica
  registrado desde já: é `preRequisitoCumprido` que segura a trilha, e não um
  requisito dentro dela pedindo prova do que a plataforma já sabe. Registrado
  agora, o cartão avançado já nasce com o cadeado certo em vez de ganhá-lo no
  dia em que o conteúdo chegar.
*/
export const ap063 = anunciada('AP063', 'Web Designer', 'intermediario', 'Web Design',
  'Desenhar e construir páginas para a web. Os requisitos serão publicados quando a trilha abrir.');

export const ap064 = anunciada('AP064', 'Web Designer Avançado', 'avancado', 'Web Design',
  'A continuação da Web Designer, no nível avançado. Os requisitos serão publicados quando a trilha abrir.',
  'AP063');

export const anunciadas = [ap043, ap044, ap045, ap049, ap052, ap063, ap064];
