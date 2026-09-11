/**
 * O que o laboratório de Configurações da AP044 cobra, e de onde parte.
 *
 * Modelo e critério fora do componente, pela razão de sempre.
 *
 * ── O requisito 13, e o que ele tem de próprio ───────────────────────────
 * Cinco ajustes do sistema, e o que os une é que todos são decisões que a
 * máquina guarda: qual programa abre cada tipo, qual impressora sai escolhida,
 * quem entra no computador. Não é "usar o programa": é dizer ao computador o
 * que fazer quando ninguém estiver olhando.
 *
 * ── Desfragmentar deixou de valer para quase todo mundo ──────────────────
 * O item a) pede limpeza e desfragmentação, e foi escrito quando todo disco era
 * de prato girando. Em SSD não se desfragmenta — o próprio Windows troca o
 * botão por "Otimizar" e escreve "Unidade de estado sólido" na coluna do tipo
 * de mídia. Ensinar a desfragmentar SSD é ensinar a gastar a vida útil do disco
 * à toa.
 *
 * A máquina do clube tem os dois discos, e é isso que faz a lição existir: a
 * ferramenta é a mesma, e é o disco que responde por si. Quem escolhe o SSD lê,
 * na própria janela, o que o Windows escreve ali.
 *
 * ── Abrir com não é definir padrão ───────────────────────────────────────
 * Um vale para aquele arquivo, desta vez; o outro muda a regra para todos os
 * arquivos daquele tipo, de agora em diante. Confundir os dois é o motivo de
 * alguém abrir uma foto no editor de imagens uma vez e passar a abrir todas
 * ali. As duas tarefas existem separadas por isso.
 */

export type TipoDeDisco = 'hd' | 'ssd';

export interface Disco {
  id: string;
  nome: string;
  tipo: TipoDeDisco;
  /** Espaço temporário, em GB, que a limpeza pode devolver. */
  lixoEmGb: number;
  /** A limpeza já foi feita neste disco. */
  limpo: boolean;
  /** Desfragmentado (HD) ou otimizado (SSD) — a mesma ferramenta, nomes diferentes. */
  otimizado: boolean;
}

export interface Usuario {
  nome: string;
  /** Conta de administrador, ou padrão. */
  administrador: boolean;
}

export interface Impressora {
  id: string;
  nome: string;
  local: string;
}

export interface Arquivo {
  nome: string;
  /** A extensão decide qual programa o sistema abre. */
  tipo: string;
}

export interface Maquina {
  discos: Disco[];
  /** Programa padrão de cada tipo de arquivo. */
  padroes: Record<string, string>;
  /** Aberturas avulsas já feitas: tipo → programa, sem mudar o padrão. */
  aberturasAvulsas: { arquivo: string; programa: string }[];
  impressoraPadrao: string;
  usuarios: Usuario[];
}

export const PROGRAMAS_POR_TIPO: Record<string, string[]> = {
  jpg: ['Fotos', 'Paint', 'GIMP', 'Navegador'],
  txt: ['Bloco de Notas', 'WordPad', 'VS Code'],
  pdf: ['Navegador', 'Adobe Acrobat Reader'],
};

export const IMPRESSORAS: Impressora[] = [
  { id: 'sec', nome: 'HP LaserJet — Secretaria', local: 'Sala da secretaria' },
  { id: 'sal', nome: 'Epson EcoTank — Sala de aula', local: 'Sala das unidades' },
];

export const ARQUIVOS: Arquivo[] = [
  { nome: 'foto-do-acampamento.jpg', tipo: 'jpg' },
  { nome: 'lista-de-inscritos.txt', tipo: 'txt' },
  { nome: 'autorizacao.pdf', tipo: 'pdf' },
];

/*
  A máquina como ela chega.

  Dois discos, para que a diferença entre desfragmentar e otimizar tenha onde
  aparecer; a impressora padrão é a da sala de aula, que é a errada para quem
  imprime da secretaria; e há um usuário só, administrador, que é como o
  computador do clube costuma estar.
*/
export const MAQUINA_INICIAL: Maquina = {
  discos: [
    { id: 'c', nome: 'Windows (C:)', tipo: 'ssd', lixoEmGb: 12, limpo: false, otimizado: false },
    { id: 'd', nome: 'Arquivos do clube (D:)', tipo: 'hd', lixoEmGb: 4, limpo: false, otimizado: false },
  ],
  padroes: { jpg: 'Fotos', txt: 'Bloco de Notas', pdf: 'Navegador' },
  aberturasAvulsas: [],
  impressoraPadrao: 'sal',
  usuarios: [{ nome: 'Clube', administrador: true }],
};

export interface MetaDaMaquina {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (m: Maquina) => boolean;
}

export const METAS_DA_MAQUINA: MetaDaMaquina[] = [
  {
    id: 'limpeza',
    titulo: 'Limpar o disco do sistema',
    detalhe: 'Ele tem 12 GB de arquivo temporário, lixeira e resto de atualização. A limpeza devolve esse espaço — e não toca em documento nem em foto sua.',
    onde: 'Configurações › Sistema › Armazenamento › Limpeza de Disco',
    passos: [
      'Abra Armazenamento, em Sistema.',
      'Clique em Limpeza de Disco no disco do Windows.',
      'Confira o que ela vai apagar antes de confirmar: são temporários, lixeira e restos de atualização.',
    ],
    feita: m => m.discos.some(d => d.id === 'c' && d.limpo),
  },
  {
    id: 'otimizar',
    titulo: 'Otimizar os dois discos, e reparar na diferença',
    detalhe: 'A ferramenta é a mesma; o disco é que responde por si. Num deles o botão diz Desfragmentar, no outro diz Otimizar — e a coluna do tipo de mídia explica por quê.',
    onde: 'Configurações › Armazenamento › Otimizar Unidades',
    passos: [
      'Abra Otimizar Unidades.',
      'Leia a coluna "Tipo de mídia" das duas unidades.',
      'Otimize as duas. Repare que o botão muda de nome conforme o disco.',
    ],
    /* Os dois, e não um: a lição é a diferença entre eles, e ela só aparece
       quando se passa pelos dois. */
    feita: m => m.discos.every(d => d.otimizado),
  },
  {
    id: 'abrir-com',
    titulo: 'Abrir a foto num programa diferente do padrão',
    detalhe: 'Só desta vez, e sem mudar nada para as próximas. É a diferença que faz alguém abrir uma foto no editor uma vez e passar a abrir todas ali.',
    onde: 'No arquivo › botão direito › Abrir com',
    passos: [
      'Clique com o botão direito na foto do acampamento.',
      'Escolha Abrir com e um programa que não seja o padrão.',
      'Repare que o padrão continua o mesmo depois disso.',
    ],
    /* A abertura avulsa não pode ter mudado o padrão — é justamente a
       diferença que a tarefa mede. */
    feita: m => m.aberturasAvulsas.some(a => a.programa !== m.padroes['jpg'])
      && m.padroes['jpg'] === MAQUINA_INICIAL.padroes['jpg'],
  },
  {
    id: 'padrao',
    titulo: 'Definir um programa padrão para os arquivos de texto',
    detalhe: 'Agora sim, para todos os .txt de agora em diante. Repare que esta escolha fica guardada e a outra não.',
    onde: 'Configurações › Aplicativos › Aplicativos padrão',
    passos: [
      'Abra Aplicativos padrão, em Aplicativos.',
      'Procure pelo tipo de arquivo .txt.',
      'Escolha outro programa. Daqui em diante, todo .txt abre nele.',
    ],
    feita: m => m.padroes['txt'] !== MAQUINA_INICIAL.padroes['txt'],
  },
  {
    id: 'impressora',
    titulo: 'Definir a impressora da secretaria como padrão',
    detalhe: 'A que está escolhida é a da sala de aula. Num clube com duas, o padrão errado imprime na sala do lado.',
    onde: 'Configurações › Bluetooth e dispositivos › Impressoras',
    passos: [
      'Abra Impressoras e scanners.',
      'Clique na impressora da secretaria.',
      'Clique em Definir como padrão.',
    ],
    feita: m => m.impressoraPadrao === 'sec',
  },
  {
    id: 'usuario',
    titulo: 'Criar um usuário para o computador do clube',
    detalhe: 'Cada pessoa com a própria área de trabalho, os próprios arquivos e as próprias configurações na mesma máquina — que é o que faz sentido num computador de todo mundo.',
    onde: 'Configurações › Contas › Outros usuários',
    passos: [
      'Abra Outros usuários, em Contas.',
      'Clique em Adicionar conta e escreva o nome.',
      'Deixe como conta padrão: administrador é quem instala programa e mexe no sistema, e não precisa ser todo mundo.',
    ],
    /*
      Padrão, e não administrador.

      Criar um segundo administrador é criar outra conta com poder de mexer em
      tudo — o contrário do que separar usuários serve para fazer. A tarefa
      cobra a conta comum, que é a que o item pede na prática.
    */
    feita: m => m.usuarios.length >= 2 && m.usuarios.some(u => !u.administrador),
  },
];
