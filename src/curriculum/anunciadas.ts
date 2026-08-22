import type { Specialty } from '../types';

/*
 * As trilhas anunciadas, ainda sem conteúdo.
 *
 * A família Computação tem cinco especialidades, e o clube precisa ver o
 * percurso inteiro desde já — uma trilha que aparece pronta no dia em que fica
 * pronta não deixa ninguém se planejar. Enquanto `emConstrucao` for verdadeiro
 * elas aparecem acinzentadas no painel, sem link e sem permitir início.
 *
 * Ficam neste arquivo, e não cada uma no seu, porque não há o que separar: são
 * quatro declarações de existência. Quando os requisitos de uma chegarem, ela
 * ganha o próprio arquivo e sai daqui.
 *
 * A descrição diz o que se sabe e nada além. Inventar ementa para requisito que
 * ainda não foi publicado é prometer ao clube um conteúdo que pode não ser esse.
 */

function anunciada(
  code: string,
  name: string,
  level: Specialty['level'],
  description: string,
): Specialty {
  return {
    code, name, level, description,
    familia: 'Computação',
    emConstrucao: true,
    requirements: [],
    modules: [],
  };
}

export const ap042 = anunciada('AP042', 'Computação 2', 'basico',
  'A segunda especialidade da família Computação. Os requisitos serão publicados quando a trilha abrir.');

export const ap043 = anunciada('AP043', 'Computação 3', 'intermediario',
  'A terceira da família, já no nível intermediário. Os requisitos serão publicados quando a trilha abrir.');

export const ap044 = anunciada('AP044', 'Computação 4', 'intermediario',
  'A quarta da família, também intermediária. Os requisitos serão publicados quando a trilha abrir.');

export const ap045 = anunciada('AP045', 'Computação 5', 'avancado',
  'A que fecha a família Computação, no nível avançado. Os requisitos serão publicados quando a trilha abrir.');

export const anunciadas = [ap042, ap043, ap044, ap045];
