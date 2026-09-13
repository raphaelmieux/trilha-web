import type { ResumoDoDesbravador } from './insignias';
import { classeDoDegrau, type NivelDaInsignia } from './nivelDaInsignia';

/*
 * As treze escadas, cada uma com os sete degraus das classes.
 *
 * Antes cada família de conquista tinha o número de marcas que coubesse — as
 * lições tinham quatro, os módulos três, os laboratórios um só. Quem chegava
 * ao fim de uma família parava de receber qualquer sinal daquilo, e famílias
 * de tamanhos diferentes não se comparavam entre si: "quinze módulos" e
 * "cinquenta lições" eram as duas de ouro e não custavam nem de longe o mesmo.
 *
 * Agora toda família vai de Amigo a Líder. O degrau diz a classe, e a classe
 * diz a forma — então duas insígnias de famílias diferentes na mesma classe
 * são a mesma conquista em assuntos diferentes, e isso se lê sem legenda.
 *
 * ── Os limiares que já existiam não se mexem ─────────────────────────────
 * Cada escada foi montada **em volta** dos limiares que o catálogo já tinha:
 * 5, 10, 25 e 50 lições continuam sendo 5, 10, 25 e 50, com os mesmos códigos
 * e os mesmos nomes. Nenhum dos 79 códigos antigos foi aposentado, e por isso
 * ninguém perde insígnia nem vê uma que tinha mudar de nome. Os 55 degraus
 * novos preenchem os buracos e esticam o topo.
 *
 * ── O topo mira a plataforma escrita, e não a de hoje ────────────────────
 * Hoje há 192 requisitos, 45 módulos, 83 lições de trilha, 26 laboratórios,
 * 13 trilhas e 51 veredas registradas — e sete trilhas e quarenta e seis
 * veredas ainda por escrever. Os degraus altos existem antes de serem
 * alcançáveis de propósito: é o conteúdo que vai subir até eles.
 */

export interface DegrauDaEscada {
  /** Quanto é preciso para chegar nele. */
  alvo: number;
  code: string;
  nome: string;
  descricao: string;
  degrau: number;
  classe: NivelDaInsignia;
}

export interface Escada {
  chave: string;
  /** Como a família se chama na estante. */
  familia: string;
  icone: string;
  /** O que ela conta, em português, para a tela poder dizer. */
  mede: string;
  medir: (r: ResumoDoDesbravador) => number;
  degraus: DegrauDaEscada[];
}

/* Os degraus são escritos como tupla — alvo, código, nome, descrição — e
   ganham `degrau` e `classe` logo abaixo: escrever "companheiro" ao lado de
   cada um seria repetir treze vezes a mesma sequência de sete, e no dia em que
   uma escada ganhasse um degrau no meio todas as classes abaixo dele estariam
   erradas sem nada reprovar. A posição é que manda. */
type Cru = {
  chave: string; familia: string; icone: string; mede: string;
  medir: (r: ResumoDoDesbravador) => number;
  degraus: [number, string, string, string][];
};

const CRUAS: Cru[] = [
  {
    chave: 'requisitos', familia: 'Requisitos', icone: 'footprints',
    mede: 'requisitos oficiais cumpridos',
    medir: r => r.requisitos,
    degraus: [
    [1, 'first_step', 'Primeiro Passo',
     'Cumpriu o primeiro requisito de uma trilha.'],
    [10, 'requisitos_10', 'Dez Requisitos',
     'Cumpriu dez requisitos oficiais.'],
    [25, 'requisitos_25', 'Vinte e Cinco Requisitos',
     'Cumpriu vinte e cinco requisitos oficiais.'],
    [50, 'requisitos_50', 'Cinquenta Requisitos',
     'Cumpriu cinquenta requisitos oficiais.'],
    [100, 'requisitos_100', 'Cem Requisitos',
     'Cumpriu cem requisitos oficiais.'],
    [145, 'requisitos_145', 'Cento e quarenta e cinco Requisitos',
     'Cumpriu cento e quarenta e cinco requisitos oficiais.'],
    [192, 'requisitos_192', 'Cento e noventa e dois Requisitos',
     'Cumpriu cento e noventa e dois requisitos oficiais.'],
    ],
  },
  {
    chave: 'licoes', familia: 'Lições', icone: 'theory',
    mede: 'lições de trilha vencidas',
    medir: r => r.licoes,
    degraus: [
    [1, 'primeira_licao', 'Primeira Lição',
     'Concluiu a primeira lição.'],
    [5, 'licoes_5', 'Cinco Lições',
     'Concluiu cinco lições.'],
    [10, 'licoes_10', 'Dez Lições',
     'Concluiu dez lições.'],
    [25, 'licoes_25', 'Vinte e Cinco Lições',
     'Concluiu vinte e cinco lições.'],
    [50, 'licoes_50', 'Cinquenta Lições',
     'Concluiu cinquenta lições.'],
    [75, 'licoes_75', 'Setenta e cinco Lições',
     'Concluiu setenta e cinco lições.'],
    [110, 'licoes_110', 'Cento e dez Lições',
     'Concluiu cento e dez lições.'],
    ],
  },
  {
    chave: 'modulos', familia: 'Módulos', icone: 'layers',
    mede: 'módulos concluídos',
    medir: r => r.modulos,
    degraus: [
    [1, 'module_complete', 'Módulo Concluído',
     'Concluiu todos os requisitos de um módulo.'],
    [3, 'modulos_3', 'Três Módulos',
     'Concluiu três módulos por inteiro.'],
    [5, 'modulos_5', 'Cinco Módulos',
     'Concluiu cinco módulos.'],
    [10, 'modulos_10', 'Dez Módulos',
     'Concluiu dez módulos por inteiro.'],
    [15, 'modulos_15', 'Quinze Módulos',
     'Concluiu quinze módulos.'],
    [28, 'modulos_28', 'Vinte e oito Módulos',
     'Concluiu vinte e oito módulos por inteiro.'],
    [45, 'modulos_45', 'Quarenta e cinco Módulos',
     'Concluiu quarenta e cinco módulos por inteiro.'],
    ],
  },
  {
    chave: 'laboratorios', familia: 'Laboratórios', icone: 'lab',
    mede: 'laboratórios distintos vencidos',
    medir: r => r.laboratorios.size,
    degraus: [
    [1, 'primeiro_laboratorio', 'Primeiro Laboratório',
     'Concluiu o primeiro laboratório.'],
    [3, 'laboratorios_3', 'Três Laboratórios',
     'Venceu três laboratórios diferentes.'],
    [6, 'laboratorios_6', 'Seis Laboratórios',
     'Venceu seis laboratórios diferentes.'],
    [10, 'laboratorios_10', 'Dez Laboratórios',
     'Venceu dez laboratórios diferentes.'],
    [15, 'laboratorios_15', 'Quinze Laboratórios',
     'Venceu quinze laboratórios diferentes.'],
    [21, 'laboratorios_21', 'Vinte e uma Laboratórios',
     'Venceu vinte e uma laboratórios diferentes.'],
    [28, 'laboratorios_28', 'Vinte e oito Laboratórios',
     'Venceu vinte e oito laboratórios diferentes.'],
    ],
  },
  {
    chave: 'ofensiva', familia: 'Ofensiva', icone: 'flame',
    mede: 'dias seguidos de atividade',
    medir: r => r.melhorSequencia,
    degraus: [
    [3, 'streak_3', 'Sequência de 3 Dias',
     'Praticou a trilha 3 dias seguidos.'],
    [7, 'streak_7', 'Sequência de 7 Dias',
     'Praticou a trilha 7 dias seguidos.'],
    [14, 'streak_14', 'Sequência de 14 Dias',
     'Praticou a trilha 14 dias seguidos.'],
    [30, 'streak_30', 'Sequência de 30 Dias',
     'Praticou a trilha 30 dias seguidos.'],
    [60, 'ofensiva_60', 'Sequência de 60 Dias',
     'Venceu alguma coisa sessenta dias seguidos.'],
    [120, 'ofensiva_120', 'Sequência de 120 Dias',
     'Venceu alguma coisa cento e vinte dias seguidos.'],
    [250, 'ofensiva_250', 'Sequência de 250 Dias',
     'Venceu alguma coisa duzentos e cinquenta dias seguidos.'],
    ],
  },
  {
    chave: 'constancia', familia: 'Constância', icone: 'calendar',
    mede: 'dias distintos de estudo',
    medir: r => r.diasAtivos,
    degraus: [
    [5, 'dias_5', 'Cinco Dias de Estudo',
     'Estudou em cinco dias diferentes.'],
    [15, 'dias_15', 'Quinze Dias de Estudo',
     'Estudou em quinze dias diferentes.'],
    [30, 'dias_30', 'Trinta Dias de Estudo',
     'Estudou em trinta dias diferentes.'],
    [60, 'constancia_60', 'Sessenta Dias de Estudo',
     'Estudou em sessenta dias diferentes.'],
    [120, 'constancia_120', 'Cento e vinte Dias de Estudo',
     'Estudou em cento e vinte dias diferentes.'],
    [210, 'constancia_210', 'Duzentos e dez Dias de Estudo',
     'Estudou em duzentos e dez dias diferentes.'],
    [365, 'constancia_365', 'Trezentos e sessenta e cinco Dias de Estudo',
     'Estudou em trezentos e sessenta e cinco dias diferentes.'],
    ],
  },
  {
    chave: 'semerro', familia: 'Sem erro', icone: 'star',
    mede: 'lições com 100% de acerto',
    medir: r => r.licoesPerfeitas,
    degraus: [
    [1, 'licao_perfeita', 'Lição sem Erro',
     'Acertou todas as questões de uma lição.'],
    [5, 'semerro_5', 'Cinco Lições sem Erro',
     'Acertou tudo em cinco lições.'],
    [10, 'licoes_perfeitas_10', 'Dez Lições sem Erro',
     'Acertou tudo em dez lições.'],
    [25, 'licoes_perfeitas_25', 'Vinte e Cinco Lições sem Erro',
     'Acertou tudo em vinte e cinco lições.'],
    [45, 'semerro_45', 'Quarenta e cinco Lições sem Erro',
     'Acertou tudo em quarenta e cinco lições.'],
    [65, 'semerro_65', 'Sessenta e cinco Lições sem Erro',
     'Acertou tudo em sessenta e cinco lições.'],
    [90, 'semerro_90', 'Noventa Lições sem Erro',
     'Acertou tudo em noventa lições.'],
    ],
  },
  {
    chave: 'avaliacoes', familia: 'Avaliações', icone: 'exam',
    mede: 'avaliações finais concluídas',
    medir: r => r.provas,
    degraus: [
    [1, 'primeira_prova', 'Primeira Avaliação',
     'Concluiu a primeira avaliação final.'],
    [2, 'avaliacoes_2', 'Duas Avaliações',
     'Concluiu duas avaliações finals.'],
    [3, 'avaliacoes_3', 'Três Avaliações',
     'Concluiu três avaliações finals.'],
    [5, 'avaliacoes_5', 'Cinco Avaliações',
     'Concluiu cinco avaliações finals.'],
    [7, 'avaliacoes_7', 'Sete Avaliações',
     'Concluiu sete avaliações finals.'],
    [10, 'avaliacoes_10', 'Dez Avaliações',
     'Concluiu dez avaliações finals.'],
    [13, 'avaliacoes_13', 'Treze Avaliações',
     'Concluiu treze avaliações finals.'],
    ],
  },
  {
    chave: 'notamaxima', familia: 'Nota máxima', icone: 'bullseye',
    mede: 'avaliações com 100%',
    medir: r => r.provasPerfeitas,
    degraus: [
    [1, 'perfect_exam', 'Nota Máxima',
     'Acertou 100% em uma avaliação final.'],
    [2, 'provas_perfeitas_2', 'Duas Notas Máximas',
     'Acertou 100% em duas avaliações finais.'],
    [3, 'notamaxima_3', 'Três Notas Máximas',
     'Acertou 100% em três avaliações finals.'],
    [4, 'notamaxima_4', 'Quatro Notas Máximas',
     'Acertou 100% em quatro avaliações finals.'],
    [6, 'notamaxima_6', 'Seis Notas Máximas',
     'Acertou 100% em seis avaliações finals.'],
    [9, 'notamaxima_9', '9 Notas Máximas',
     'Acertou 100% em 9 avaliações finals.'],
    [13, 'notamaxima_13', 'Treze Notas Máximas',
     'Acertou 100% em treze avaliações finals.'],
    ],
  },
  {
    chave: 'trilhas', familia: 'Trilhas', icone: 'trophy',
    mede: 'especialidades concluídas',
    medir: r => r.trilhas.length,
    degraus: [
    [1, 'trilhas_1', 'Uma Trilha',
     'Concluiu uma especialidade.'],
    [2, 'duas_trilhas', 'Duas Trilhas',
     'Concluiu duas especialidades.'],
    [3, 'tres_trilhas', 'Três Trilhas',
     'Concluiu três especialidades.'],
    [5, 'cinco_trilhas', 'Cinco Trilhas',
     'Concluiu cinco especialidades.'],
    [7, 'trilhas_7', 'Sete Trilhas',
     'Concluiu sete especialidades.'],
    [10, 'trilhas_10', 'Dez Trilhas',
     'Concluiu dez especialidades.'],
    [13, 'trilhas_13', 'Treze Trilhas',
     'Concluiu treze especialidades.'],
    ],
  },
  {
    chave: 'veredas', familia: 'Veredas', icone: 'route',
    mede: 'veredas percorridas até o fim',
    medir: r => r.veredas.length,
    degraus: [
    [1, 'veredas_1', 'Uma Vereda',
     'Percorreu uma vereda até o fim.'],
    [2, 'veredas_2', 'Duas Veredas',
     'Percorreu duas veredas até o fim.'],
    [4, 'veredas_4', 'Quatro Veredas',
     'Percorreu quatro veredas até o fim.'],
    [8, 'veredas_8', 'Oito Veredas',
     'Percorreu oito veredas até o fim.'],
    [15, 'veredas_15', 'Quinze Veredas',
     'Percorreu quinze veredas até o fim.'],
    [30, 'veredas_30', 'Trinta Veredas',
     'Percorreu trinta veredas até o fim.'],
    [51, 'veredas_51', 'Cinquenta e uma Veredas',
     'Percorreu cinquenta e uma veredas até o fim.'],
    ],
  },
  {
    chave: 'tokens', familia: 'Token.Web()', icone: 'award',
    mede: 'certificados recebidos',
    medir: r => r.certificados.length,
    degraus: [
    [1, 'primeiro_token', 'Primeiro Token.Web()',
     'Recebeu o primeiro certificado.'],
    [2, 'tokens_2', 'Dois Token.Web()',
     'Recebeu dois certificados.'],
    [3, 'tokens_3', 'Três Token.Web()',
     'Recebeu três certificados.'],
    [5, 'tokens_5', 'Cinco Token.Web()',
     'Recebeu cinco certificados.'],
    [10, 'tokens_10', 'Dez Token.Web()',
     'Recebeu dez certificados.'],
    [20, 'tokens_20', 'Vinte Token.Web()',
     'Recebeu vinte certificados.'],
    [40, 'tokens_40', 'Quarenta Token.Web()',
     'Recebeu quarenta certificados.'],
    ],
  },
  {
    chave: 'xp', familia: 'XP', icone: 'zap',
    mede: 'pontos de experiência somados',
    medir: r => r.xp,
    degraus: [
    [100, 'xp_100', 'Cem de XP',
     'Somou cem pontos de experiência.'],
    [300, 'xp_300', '300 de XP',
     'Somou 300 pontos de experiência.'],
    [500, 'xp_500', 'Quinhentos de XP',
     'Somou quinhentos pontos de experiência.'],
    [1000, 'xp_1000', 'Mil de XP',
     'Somou mil pontos de experiência.'],
    [2500, 'xp_2500', '2500 de XP',
     'Somou 2500 pontos de experiência.'],
    [6000, 'xp_6000', '6000 de XP',
     'Somou 6000 pontos de experiência.'],
    [12000, 'xp_12000', '12000 de XP',
     'Somou 12000 pontos de experiência.'],
    ],
  },];

export const ESCADAS: Escada[] = CRUAS.map(e => ({
  ...e,
  degraus: e.degraus.map(([alvo, code, nome, descricao], i) => ({
    alvo, code, nome, descricao, degrau: i + 1, classe: classeDoDegrau(i + 1),
  })),
}));

/** Todos os degraus de todas as escadas, achatados. */
export const TODOS_OS_DEGRAUS: (DegrauDaEscada & { escada: Escada })[] =
  ESCADAS.flatMap(escada => escada.degraus.map(d => ({ ...d, escada })));

/**
 * Até que degrau alguém subiu numa escada, contando de 1 — zero se nenhum.
 *
 * É o que a estante mostra: uma insígnia por família, na classe mais alta
 * alcançada. Mostrar todas as conquistadas daria até noventa e uma numa tela
 * só, que é o muro que os trinta e dois cartões de vereda já foram uma vez.
 */
export function degrauAlcancado(escada: Escada, r: ResumoDoDesbravador): number {
  const quanto = escada.medir(r);
  let alcancado = 0;
  for (const d of escada.degraus) if (quanto >= d.alvo) alcancado = d.degrau;
  return alcancado;
}
