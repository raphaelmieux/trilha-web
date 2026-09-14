import { AREA, DOCUMENTOS, LIXEIRA, type No } from './arquivos';

/*
 * O computador do clube, e por que ele é um só para as sete lições.
 *
 * ── O disco de partida não vem do currículo ──────────────────────────────
 * É a mesma decisão já escrita em `maquinaInicial()` e em `estadoInicial()`:
 * um currículo que pudesse descrever o disco poderia descrevê-lo já com a
 * hierarquia montada, com o pacote feito, com o arquivo restaurado — que é
 * exatamente o laboratório que abre resolvido.
 *
 * E é **um** disco, e não sete. O computador do clube é um computador: quem
 * abre a lição do módulo 5 reencontra a mesma Área de Trabalho bagunçada da
 * lição do módulo 1, e é dela que a bagunça fala. Sete discos diferentes
 * ensinariam que cada exercício acontece numa máquina de mentira.
 *
 * ── O que está aqui, e o que cada coisa existe para ensinar ──────────────
 * Tudo o que esta vereda cobra precisa ter **onde** acontecer, e nada pode já
 * ter acontecido:
 *
 * - a Área de Trabalho tem dez arquivos com nomes de verdade — os que o
 *   computador da câmera escreve e os que a gente escreve com pressa. São os
 *   dez do requisito 5, e nenhum deles tem data nem versão no nome;
 * - nenhuma corrente de pastas chega a três níveis, que é o que o requisito
 *   4.1 manda construir;
 * - não há nenhum `.zip`, que é o que o 4.5 manda fazer;
 * - a Lixeira está vazia;
 * - o pen drive não está conectado — ele nem aparece na árvore até alguém o
 *   espetar;
 * - o relatório está na **versão errada**, com as boas guardadas no histórico;
 * - e o disco de cópia de segurança tem um arquivo que sumiu de Documentos.
 *
 * ── Por que o disco de cópia de segurança já está aí ─────────────────────
 * Porque cópia de segurança que se faz na hora de precisar não é cópia de
 * segurança. O requisito 8 pede restaurar **a partir de** uma cópia, e a
 * lição toda é que ela foi feita antes, por alguém que não sabia que ia
 * precisar. Mandar a pessoa fazer a cópia e depois restaurá-la ensinaria o
 * contrário: que dá para voltar no tempo depois de perder.
 */

const DIA = 86_400_000;

const pasta = (id: string, nome: string, paiId: string | null, agora: number, dias: number): No =>
  ({ id, nome, tipo: 'pasta', paiId, tamanhoKb: 0, modificadoEm: agora - dias * DIA });

const arq = (
  id: string, nome: string, paiId: string, kb: number, agora: number, dias: number,
  rotulo?: string,
): No => ({
  id, nome, tipo: 'arquivo', paiId, tamanhoKb: kb, modificadoEm: agora - dias * DIA,
  ...(rotulo ? { rotulo } : {}),
});

/**
 * O disco externo onde a cópia de segurança do clube mora.
 *
 * O pen drive não está aqui: ele é `PENDRIVE`, em `dispositivoExterno.ts`,
 * junto com a única coisa que o torna diferente de uma quarta raiz — a
 * gravação que ainda não terminou quando a barra chega a 100%.
 */
export const BACKUP = 'backup';

/**
 * Os dez arquivos mal nomeados da Área de Trabalho (requisito 5).
 *
 * Eles não são dez nomes quaisquer: são os quatro jeitos de nomear mal que
 * aparecem em todo computador de clube — o nome que a câmera escreve e
 * ninguém lê, o "nova" que não diz quando, o "FINAL" que nunca é o final, e o
 * parêntese que o sistema pôs porque já havia um igual.
 *
 * A lista é exportada porque a trava do laboratório conta em cima dela: dez é
 * o mínimo do requisito, e uma lista que encolhesse para nove deixaria a
 * tarefa impossível sem nada dizendo por quê.
 */
export const DEZ_MAL_NOMEADOS = [
  'IMG_20260214_193045.jpg',
  'IMG_20260214_193112.jpg',
  'IMG_20260215_081930.jpg',
  'ata.docx',
  'ata nova.docx',
  'ata nova FINAL.docx',
  'o que levar.txt',
  'o que levar (1).txt',
  'cantina.pdf',
  'cantina corrigido.pdf',
] as const;

/** O documento que abre na versão errada, e as que estão guardadas (requisito 8). */
export const RELATORIO = 'relatorio do acampamento.docx';
export const VERSAO_PERDIDA = 'relatório inteiro, com as fotos e a prestação de contas';
export const VERSAO_ATUAL = 'em branco — o texto foi apagado sem querer';
export const VERSAO_RASCUNHO = 'primeiro rascunho, só os títulos';

/** O arquivo que sumiu de Documentos e só existe na cópia de segurança. */
export const SUMIU = 'inscritos.docx';

export function discoDoClube(agora: number): No[] {
  const naArea = DEZ_MAL_NOMEADOS.map((nome, i) => arq(
    `bagunca${i}`, nome, AREA,
    /* Tamanhos de verdade: foto de celular na casa dos megabytes, texto em
       kilobytes. É o que faz a coluna Tamanho dizer alguma coisa quando o
       módulo 4 manda ordenar por ela. */
    [2400, 2210, 1980, 64, 71, 73, 3, 4, 850, 870][i],
    agora,
    [31, 31, 30, 28, 26, 25, 35, 34, 33, 32][i],
  ));

  return [
    pasta(AREA, 'Área de Trabalho', null, agora, 0),
    pasta(DOCUMENTOS, 'Documentos', null, agora, 0),
    pasta(LIXEIRA, 'Lixeira', null, agora, 0),
    pasta(BACKUP, 'Cópia de Segurança (D:)', null, agora, 0),

    ...naArea,

    /*
      Uma pasta com fotos dentro, e só um nível: é daqui que sai o pacote do
      módulo 2, e é aqui que a busca do módulo 4 tem o que achar. Dois níveis
      de propósito — o requisito 4.1 manda construir três, e uma corrente que
      já chegasse lá abriria a tarefa cumprida.
    */
    pasta('fotos', 'Fotos do Acampamento', DOCUMENTOS, agora, 20),
    arq('f1', 'fogueira.jpg', 'fotos', 2600, agora, 20),
    arq('f2', 'bandeirinha.jpg', 'fotos', 1750, agora, 20),
    arq('f3', 'turma.jpg', 'fotos', 3100, agora, 19),
    arq('f4', 'chegada.jpg', 'fotos', 2050, agora, 21),

    arq('hino', 'hino do clube.mp3', DOCUMENTOS, 4100, agora, 120),
    arq('estatuto', 'estatuto.pdf', DOCUMENTOS, 640, agora, 200),

    /* O relatório na versão errada. As boas estão no histórico, e é de lá que
       o requisito 8 manda tirá-las. */
    {
      id: 'relatorio', nome: RELATORIO, tipo: 'arquivo', paiId: DOCUMENTOS,
      tamanhoKb: 12, modificadoEm: agora - 2 * DIA,
      rotulo: VERSAO_ATUAL,
      versoes: [
        { em: agora - 6 * DIA, rotulo: VERSAO_PERDIDA, tamanhoKb: 1840 },
        { em: agora - 14 * DIA, rotulo: VERSAO_RASCUNHO, tamanhoKb: 96 },
      ],
    },

    /* A cópia de segurança, feita há uma semana por quem não sabia que ia
       precisar. Ela tem o que existe em Documentos e tem o que não existe
       mais. */
    arq('bk_relatorio', RELATORIO, BACKUP, 1840, agora, 7, VERSAO_PERDIDA),
    arq('bk_sumiu', SUMIU, BACKUP, 210, agora, 7, 'a lista de inscritos do acampamento'),
    arq('bk_estatuto', 'estatuto.pdf', BACKUP, 640, agora, 7),
  ];
}
