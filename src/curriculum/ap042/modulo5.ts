import type { Module } from '../../types';

/*
 * AP042 módulo 5 — o requisito 6, quatro tarefas que só se provam fazendo.
 *
 * Como no módulo 5 da AP041, não há lição teórica antes: comprimir, exportar,
 * instalar e imprimir são gestos, e ler sobre gesto não ensina gesto. O
 * laboratório explica no meio do caminho, quando a explicação tem onde se
 * apoiar — e é aí que ela gruda.
 *
 * Uma lição só, com as quatro tarefas dentro, e não quatro lições: elas
 * pertencem ao mesmo requisito e à mesma tarde. Separar em quatro telas faria o
 * desbravador atravessar quatro vezes a mesma abertura para fazer coisas de dois
 * minutos cada.
 */

export const modulo5: Module = {
  code: 'AP042.5',
  title: 'O que se faz com um arquivo pronto',
  description: 'Compactar, exportar em pdf, instalar um programa e imprimir do jeito certo.',
  lessons: [
    {
      code: 'AP042.5-L1',
      title: 'Comprimindo, exportando e imprimindo',
      type: 'lab',
      content: '',
      requirementCodes: ['AP042-6.1', 'AP042-6.2', 'AP042-6.3', 'AP042-6.4'],
      labType: 'operacoes_arquivo',
    },
  ],
};
