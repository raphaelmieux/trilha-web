/**
 * A base que a teoria da CC-ES009 e a da CC-ES010 fotografam: as inscrições
 * do Campori de Primavera.
 *
 * ── Por que outra base ───────────────────────────────────────────────────
 * O laboratório analisa as inscrições do acampamento de inverno, e cada número
 * dela é a resposta de uma lição: a média de 12,40 anos, os 2,85 acampamentos,
 * os 4,71 da Arara, os 81,25% do Falcão, o 1,05 do Davi. A teoria citava todos
 * eles, e quem a lia chegava ao laboratório com o gabarito.
 *
 * Esta é outra inscrição do mesmo clube, com os **mesmos campos** — a mesma
 * tela, as mesmas colunas, as mesmas funções —, e outras pessoas e outros
 * números, armados para mostrar as mesmas coisas: a idade em que média,
 * mediana e moda concordam, os acampamentos em que os veteranos puxam a
 * média, a altura com uma digitação trocada, e a unidade que deixou mais gente
 * de fora sendo a que mobilizou melhor. As unidades e quantos membros cada uma
 * tem são as do clube, e por isso o elenco é o mesmo.
 * `exemplosDaAnalise.test.ts` confere cada número das telas por esta base.
 */

import type { Formulario, Resposta } from '../labs/formulario';
import { CAMPO_ALIMENTACAO, CAMPO_DIARIAS, CAMPO_EMAIL, CAMPO_NOME, CAMPO_UNIDADE } from '../labs/formulario';
import {
  CAMPO_ACAMPAMENTOS, CAMPO_ALTURA, CAMPO_CAMISETA, CAMPO_IDADE, camposDaBase,
} from '../labs/baseDoAcampamento';

/**
 * As quarenta e duas inscrições, na ordem em que chegaram.
 *
 * O Samuel Teixeira aparece com **1,16 m**: é o 1,61 com os algarismos
 * trocados, e a camiseta G que ele pediu diz isso. É o atípico que sai. O
 * Kevin Valadares, com 11 acampamentos, e o Bento Fagundes, com 16, são os
 * veteranos: gente de verdade, que fica.
 */
const INSCRICOES: string[][] = [
  ['2026-08-10T18:04', 'Alana Bragança', 'Arara', 'braganca.alana@exemplo.com', '2', '13', '1,62', 'G', 'Sem glúten', '1'],
  ['2026-08-12T20:24', 'Bento Hipólito', 'Falcão', 'hipolito.bento@exemplo.com', '2', '11', '1,47', 'P', 'Comum', '0'],
  ['2026-08-13T20:10', 'Cauã Queiroga', 'Jaguar', 'queiroga.caua@exemplo.com', '2', '14', '1,67', 'G', 'Comum', '8'],
  ['2026-08-16T21:11', 'Dalila Xavier', 'Arara', 'xavier.dalila@exemplo.com', '3', '14', '1,61', 'G', 'Comum', '4'],
  ['2026-08-17T20:10', 'Enrico Damasceno', 'Arara', 'damasceno.enrico@exemplo.com', '3', '12', '1,55', 'M', 'Sem glúten', '3'],
  ['2026-08-18T18:04', 'Fernanda Moraes', 'Águia', 'moraes.fernanda@exemplo.com', '3', '13', '1,63', 'G', 'Comum', '4'],
  ['2026-08-19T18:20', 'Gael Sampaio', 'Falcão', 'sampaio.gael@exemplo.com', '3', '11', '1,45', 'P', 'Sem glúten', '1'],
  ['2026-08-20T20:57', 'Hadassa Almeida', 'Falcão', 'almeida.hadassa@exemplo.com', '3', '11', '1,41', 'P', 'Comum', '2'],
  ['2026-08-22T20:20', 'Isaque Guedes', 'Tucano', 'guedes.isaque@exemplo.com', '2', '13', '1,63', 'G', 'Comum', '3'],
  ['2026-08-23T18:12', 'Joana Pacheco', 'Arara', 'pacheco.joana@exemplo.com', '3', '13', '1,54', 'M', 'Comum', '5'],
  ['2026-08-24T18:57', 'Kevin Valadares', 'Águia', 'valadares.kevin@exemplo.com', '3', '15', '1,65', 'G', 'Comum', '11'],
  ['2026-08-25T21:52', 'Luna Correia', 'Falcão', 'correia.luna@exemplo.com', '3', '11', '1,47', 'P', 'Comum', '1'],
  ['2026-08-26T18:57', 'Mateus Lacerda', 'Tucano', 'lacerda.mateus@exemplo.com', '3', '13', '1,59', 'M', 'Comum', '2'],
  ['2026-08-27T18:58', 'Noemi Ribas', 'Águia', 'ribas.noemi@exemplo.com', '2', '11', '1,38', 'PP', 'Comum', '1'],
  ['2026-08-28T19:46', 'Olívia Zanetti', 'Falcão', 'zanetti.olivia@exemplo.com', '3', '14', '1,65', 'G', 'Vegetariana', '4'],
  ['2026-08-29T20:33', 'Paulo Fagundes', 'Jaguar', 'fagundes.paulo@exemplo.com', '3', '14', '1,64', 'G', 'Comum', '6'],
  ['2026-08-30T20:22', 'Rute Nogueira', 'Falcão', 'nogueira.rute@exemplo.com', '3', '12', '1,44', 'P', 'Sem lactose', '1'],
  ['2026-08-31T19:48', 'Samuel Teixeira', 'Falcão', 'teixeira.samuel@exemplo.com', '3', '13', '1,16', 'G', 'Vegetariana', '2'],
  ['2026-08-31T21:49', 'Talita Bragança', 'Jaguar', 'braganca.talita@exemplo.com', '3', '14', '1,64', 'G', 'Comum', '5'],
  ['2026-09-01T22:49', 'Uriel Hipólito', 'Tucano', 'hipolito.uriel@exemplo.com', '3', '13', '1,54', 'M', 'Comum', '4'],
  ['2026-09-02T21:30', 'Valéria Queiroga', 'Tucano', 'queiroga.valeria@exemplo.com', '3', '11', '1,39', 'PP', 'Comum', '1'],
  ['2026-09-03T20:42', 'Wagner Xavier', 'Falcão', 'xavier.wagner@exemplo.com', '3', '12', '1,45', 'P', 'Sem lactose', '2'],
  ['2026-09-03T22:34', 'Yuri Damasceno', 'Falcão', 'damasceno.yuri@exemplo.com', '3', '12', '1,48', 'M', 'Comum', '3'],
  ['2026-09-04T20:36', 'Zoe Moraes', 'Onça', 'moraes.zoe@exemplo.com', '3', '13', '1,52', 'M', 'Comum', '5'],
  ['2026-09-05T19:57', 'Abner Sampaio', 'Tucano', 'sampaio.abner@exemplo.com', '3', '13', '1,54', 'M', 'Comum', '4'],
  ['2026-09-06T19:51', 'Bruna Almeida', 'Arara', 'almeida.bruna@exemplo.com', '3', '10', '1,34', 'PP', 'Comum', '0'],
  ['2026-09-07T18:12', 'Ester Valadares', 'Jaguar', 'valadares.ester@exemplo.com', '3', '13', '1,56', 'M', 'Sem lactose', '5'],
  ['2026-09-07T18:48', 'Calebe Guedes', 'Falcão', 'guedes.calebe@exemplo.com', '2', '12', '1,51', 'M', 'Comum', '3'],
  ['2026-09-07T20:33', 'Dafne Pacheco', 'Onça', 'pacheco.dafne@exemplo.com', '3', '10', '1,42', 'P', 'Comum', '0'],
  ['2026-09-08T20:16', 'Glória Lacerda', 'Onça', 'lacerda.gloria@exemplo.com', '3', '10', '1,39', 'PP', 'Comum', '2'],
  ['2026-09-08T20:18', 'Filipe Correia', 'Arara', 'correia.filipe@exemplo.com', '3', '14', '1,64', 'G', 'Comum', '2'],
  ['2026-09-09T20:05', 'Alana Zanetti', 'Falcão', 'zanetti.alana@exemplo.com', '2', '12', '1,47', 'P', 'Sem lactose', '2'],
  ['2026-09-09T20:17', 'Henrique Ribas', 'Águia', 'ribas.henrique@exemplo.com', '2', '13', '1,51', 'M', 'Comum', '5'],
  ['2026-09-10T18:54', 'Bento Fagundes', 'Onça', 'fagundes.bento@exemplo.com', '3', '15', '1,73', 'GG', 'Comum', '16'],
  ['2026-09-10T20:09', 'Dalila Teixeira', 'Águia', 'teixeira.dalila@exemplo.com', '3', '15', '1,74', 'GG', 'Comum', '7'],
  ['2026-09-10T20:36', 'Cauã Nogueira', 'Águia', 'nogueira.caua@exemplo.com', '3', '13', '1,62', 'G', 'Comum', '2'],
  ['2026-09-11T21:56', 'Enrico Bragança', 'Jaguar', 'braganca.enrico@exemplo.com', '3', '10', '1,31', 'PP', 'Comum', '4'],
  ['2026-09-11T22:35', 'Fernanda Hipólito', 'Onça', 'hipolito.fernanda@exemplo.com', '3', '12', '1,49', 'M', 'Comum', '1'],
  ['2026-09-12T18:23', 'Gael Queiroga', 'Falcão', 'queiroga.gael@exemplo.com', '3', '12', '1,45', 'P', 'Comum', '3'],
  ['2026-09-12T19:23', 'Hadassa Xavier', 'Águia', 'xavier.hadassa@exemplo.com', '2', '12', '1,45', 'P', 'Comum', '2'],
  ['2026-09-13T21:26', 'Joana Moraes', 'Tucano', 'moraes.joana@exemplo.com', '3', '11', '1,49', 'M', 'Vegetariana', '1'],
  ['2026-09-13T21:38', 'Isaque Damasceno', 'Tucano', 'damasceno.isaque@exemplo.com', '3', '10', '1,38', 'PP', 'Sem glúten', '0'],
];

const CAMPOS = [CAMPO_NOME, CAMPO_UNIDADE, CAMPO_EMAIL, CAMPO_DIARIAS, CAMPO_IDADE, CAMPO_ALTURA, CAMPO_CAMISETA,
  CAMPO_ALIMENTACAO, CAMPO_ACAMPAMENTOS];

export const RESPOSTAS_DO_CAMPORI: Resposta[] = INSCRICOES.map(([em, ...valores], i) => ({
  id: `c${String(i + 1).padStart(2, '0')}`,
  em,
  valores: Object.fromEntries(CAMPOS.map((c, j) => [c, valores[j]])),
}));

export function baseDoCampori(): Formulario {
  return {
    titulo: 'Inscrição — Campori de Primavera',
    descricao: 'As inscrições fecharam no dia 13 de setembro.',
    aceitandoRespostas: false,
    campos: camposDaBase(),
    respostas: RESPOSTAS_DO_CAMPORI,
  };
}

export const ARQUIVO_DO_CAMPORI = 'Campori de Primavera — análise';

/*
 * O que a teoria da CC-ES010 pergunta a esta base, e que não é o que a lição
 * pergunta à do acampamento: a lição prevê para 13 e 25 anos e embaralha a
 * Arara com a Águia, e a teoria que mostrasse as mesmas perguntas mostraria o
 * caminho do gabarito.
 */

/** As idades que a teoria pergunta à reta: uma dentro do que se viu, outra fora. */
export const IDADES_DA_TEORIA = [12, 22] as const;

/**
 * As duas unidades que a teoria embaralha: o Jaguar, a mais experiente do
 * campori, e a Arara. Seis e cinco inscritos, e uma diferença de médias que o
 * acaso alcança cerca de uma vez em dez.
 */
export const GRUPOS_DA_TEORIA = ['Arara', 'Jaguar'] as const;
