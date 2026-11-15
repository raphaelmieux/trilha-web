import type { LabType } from '../types';

/*
  O motor de um laboratório: a tela que o monta.

  O tipo de laboratório é a identidade dele — é por ele que a insígnia se
  chama `lab_<tipo>`, e é por ser de uma trilha só que o pin dele orbita um
  patch só na Faixa. O motor é outra coisa: a redação guiada monta o relatório
  da AP034, o da AP041 e o da AP045, e o WebLab serve à AP034 e à AP044. Era o
  mesmo tipo nas cinco lições, e por isso duas trilhas venciam o laboratório e
  só uma insígnia existia para as duas.

  Separar as duas ideias deixa cada trilha com o seu tipo sem copiar tela
  nenhuma. Tipo sem entrada aqui é motor de si mesmo, que é o caso de quase
  todos.
*/
const MOTOR: Partial<Record<LabType, LabType>> = {
  redacao_historia_dos_computadores: 'redacao_guiada',
  redacao_evolucao_da_computacao: 'redacao_guiada',
  sites_educativos: 'web_lab',
};

export function motorDoLaboratorio(tipo: LabType): LabType {
  return MOTOR[tipo] ?? tipo;
}
