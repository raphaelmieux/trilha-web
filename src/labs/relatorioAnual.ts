import {
  linhaDe, trechoDe, campoDe, textoDoBloco, textoDoDoc, paragrafos,
  titulosDoDoc, sumarioAtualizado, quantasPaginas, faixaTemCampoDePagina,
  type Doc as DocDoWord, type Bloco as BlocoDoWord,
  type Paragrafo as ParagrafoDoWord, type FaixaDaPagina,
} from './documento';

/*
  O relatório anual: o documento em que o que devia se repetir sozinho foi
  escrito uma vez, à mão.

  ── O quarto engano da vereda ────────────────────────────────────────────
  Os módulos 1 e 2 chegam errados de um jeito que não se vê; o 3 chega
  incompleto e torto. Este chega com um defeito que **muda de página**: o
  rodapé diz "Página 2" em todas elas, porque alguém o digitou no dia em que o
  documento tinha duas folhas. Na folha 2 está certo. Na 1, na 3 e na 4 está
  errado — e o documento não tem como saber.

  É a irmã exata da legenda digitada do módulo 3, aplicada ao outro campo que
  esta vereda ensina. A teoria diz isso com todas as letras: "se o número não
  muda de página para página, ele foi digitado, e não inserido como campo. É o
  mesmo teste do sumário: o que o editor calcula, ele recalcula."

  ── E o sumário envelhece enquanto se trabalha ───────────────────────────
  A liderança pediu uma seção de encerramento que não está aqui. Quem gerar o
  sumário antes de acrescentá-la — que é a ordem natural, porque o sumário é a
  tarefa que se vê primeiro — vê o sumário ficar velho **na própria tela**: a
  seção nova não aparece nele, e as folhas das seguintes andaram. Nada avisa.
  O botão Atualizar Sumário é o que alcança isso, e é metade da lição.

  ── Por que não há capa ──────────────────────────────────────────────────
  A primeira folha é o nome do relatório e o sumário, que é o papel que a capa
  faria. Repetir o nome do relatório no cabeçalho da folha que já o mostra
  grande é redundância, e é exatamente para isso que a caixa "Primeira página
  diferente" existe. Uma capa separada, com estilo próprio fora do sumário,
  pediria um estilo de Título que o Word tem e a plataforma não — e inventá-lo
  aqui daria à galeria um nome que o desbravador não vai achar lá.
*/

export type Secao = 'abertura' | 'apresentacao' | 'atividades' | 'numeros' | 'fecho';

export type Doc = DocDoWord<Secao>;
export type Bloco = BlocoDoWord<Secao>;
export type Paragrafo = ParagrafoDoWord<Secao>;

const linha = (id: string, secao: Secao, texto: string): Paragrafo =>
  linhaDe(id, secao, texto);

const titulo = (
  id: string, secao: Secao, texto: string, nivel: 'Título 1' | 'Título 2',
): Paragrafo => ({ ...linhaDe(id, secao, texto), estilo: nivel });

/** Abre folha nova antes deste parágrafo. */
const novaFolha = (b: Paragrafo): Paragrafo => ({ ...b, quebraDePagina: true });

/** O que o cabeçalho deve passar a dizer. */
export const TEXTO_DO_CABECALHO = 'Clube de Desbravadores Pioneiros — Relatório Anual 2026';

/**
 * O rodapé como ele chega: um número **digitado**.
 *
 * "Página 2" em toda folha, porque no dia em que alguém escreveu isso o
 * documento tinha duas. É o defeito do requisito 4.4, e ele se vê sem clicar
 * em nada — basta olhar a folha seguinte.
 */
export const RODAPE_DIGITADO: FaixaDaPagina = {
  trechos: [trechoDe('rod-a', 'Página 2')],
};

/** O rodapé certo: o campo que o editor recalcula em cada folha. */
export const rodapeDeCampo = (): FaixaDaPagina => ({
  trechos: [trechoDe('rod-t', 'Página '), campoDe('rod-n', 'pagina')],
});

/** A seção que a liderança pediu e que ainda não está no documento. */
export const SECAO_QUE_FALTA = {
  tituloId: 'h-fecho',
  titulo: 'O que fica para o ano que vem',
  corpoId: 'fe-1',
  corpo: 'Ficam a investidura das duas classes, a prestação de contas do acampamento — '
    + 'que depende das notas fiscais do transporte — e a troca do fogão de campanha, que '
    + 'não passou na última revisão.',
  secao: 'fecho' as Secao,
};

/**
 * O relatório como ele chega: quatro folhas, sem cabeçalho, com o rodapé
 * digitado, sem sumário e sem a seção de encerramento.
 *
 * Os estilos de título já estão certos — quem cobra isso é o módulo 1, e
 * repetir a mesma tarefa aqui mediria de novo o que já foi medido. Aqui eles
 * estão certos justamente para que o sumário tenha o que ler.
 */
export const RELATORIO_ANUAL_INICIAL: Doc = {
  blocos: [
    titulo('titulo', 'abertura', 'Relatório Anual 2026', 'Título 1'),
    linha('clube', 'abertura', 'Clube de Desbravadores Pioneiros — Regional Centro'),
    linha('entrega', 'abertura', 'Entregue à liderança da igreja em 12 de dezembro de 2026.'),

    novaFolha(titulo('h-apresentacao', 'apresentacao', 'Apresentação', 'Título 1')),
    linha('ap-1', 'apresentacao', 'Este relatório reúne o que o clube fez no ano, quantas pessoas participaram de cada atividade e o que ficou pendente. Ele foi escrito pela secretaria a partir das atas das reuniões de unidade.'),
    linha('ap-2', 'apresentacao', 'A ordem das seções segue a do calendário, e não a da importância: quem procura uma atividade acha pela data em que ela aconteceu.'),

    novaFolha(titulo('h-atividades', 'atividades', 'As atividades do ano', 'Título 1')),
    titulo('h-acampamento', 'atividades', 'O acampamento de inverno', 'Título 2'),
    linha('at-1', 'atividades', 'Ocupou o fim de semana de 20 a 22 de junho, no sítio da regional, com barracas por unidade e programação de sexta à noite a domingo de manhã. Foram quarenta e nove pessoas.'),
    titulo('h-campanha', 'atividades', 'A campanha de alimentos', 'Título 2'),
    linha('at-2', 'atividades', 'Aconteceu em duas sextas de maio, com recolhimento na igreja e entrega no bairro vizinho na semana seguinte. Foram trezentos e onze quilos.'),

    novaFolha(titulo('h-numeros', 'numeros', 'Os números', 'Título 1')),
    linha('nu-1', 'numeros', 'O clube fechou o ano com sessenta e dois desbravadores matriculados, contra cinquenta e quatro no ano anterior. A frequência média aos sábados foi de quarenta e sete.'),
    linha('nu-2', 'numeros', 'A classe de Amigo teve trinta e seis encontros e a de Companheiro teve trinta e dois; duas datas caíram em feriado e foram remarcadas.'),
  ],
  cabecalho: null,
  rodape: RODAPE_DIGITADO,
  primeiraPaginaDiferente: false,
  colunas: { abertura: 1, apresentacao: 1, atividades: 1, numeros: 1, fecho: 1 },
  sumario: null,
};

export const TEXTO_ORIGINAL = textoDoDoc(RELATORIO_ANUAL_INICIAL);

/* ── Ler o documento ──────────────────────────────────────────────────────── */

/** A seção de encerramento já entrou? */
export const temASecaoQueFaltava = (d: Doc): boolean =>
  paragrafos(d).some(b => b.id === SECAO_QUE_FALTA.tituloId);

/** O cabeçalho diz alguma coisa, e não só existe. */
export const cabecalhoEscrito = (d: Doc): boolean =>
  (d.cabecalho?.trechos ?? []).map(x => x.texto).join('').trim().length > 0;

/* ── As metas ─────────────────────────────────────────────────────────────── */

export interface MetaDoRelatorioAnual {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (d: Doc) => boolean;
}

export const METAS_DO_RELATORIO_ANUAL: MetaDoRelatorioAnual[] = [
  {
    id: 'cabecalho',
    titulo: 'Pôr o nome do clube no cabeçalho',
    detalhe: 'O que se escreve no cabeçalho aparece em toda folha, e é para isso que ele existe. '
      + 'Escrever o nome do clube no alto da primeira folha, dentro do texto, parece a mesma coisa '
      + 'e não é: não se repete, e empurra o texto quando alguém acrescenta um parágrafo acima.',
    onde: 'Inserir › Cabeçalho e Rodapé › Cabeçalho',
    passos: [
      'Abra a guia Inserir e clique em Cabeçalho.',
      'Escreva o nome do clube e o do relatório.',
      'Role até a folha seguinte: ele está lá também, sem ninguém ter digitado de novo.',
    ],
    feita: cabecalhoEscrito,
  },
  {
    id: 'numeracao',
    titulo: 'Trocar o número digitado por numeração de páginas',
    detalhe: 'O rodapé diz "Página 2" em todas as folhas — alguém digitou isso no dia em que o '
      + 'documento tinha duas. Número de página é campo: o editor calcula em que folha ele está. '
      + 'Se o número não muda de folha para folha, ele foi digitado.',
    onde: 'Inserir › Cabeçalho e Rodapé › Número de Página',
    passos: [
      'Olhe o rodapé da folha 1 e o da folha 3: os dois dizem a mesma coisa, e um deles está errado.',
      'Abra Inserir › Número de Página e escolha o fim da página.',
      'Confira folha a folha: agora cada uma diz a sua.',
    ],
    feita: d => faixaTemCampoDePagina(d.rodape),
  },
  {
    id: 'primeira-diferente',
    titulo: 'Deixar a primeira folha sem as faixas',
    detalhe: 'A primeira folha já traz o nome do relatório em letra grande e o sumário: repetir o '
      + 'mesmo nome no cabeçalho dela é dizer duas vezes. É para isso que existe a caixa '
      + '"Primeira página diferente" — e é ela que evita a gambiarra de pôr a capa noutro arquivo.',
    onde: 'Cabeçalho e Rodapé › Primeira Página Diferente',
    passos: [
      'Com o cabeçalho aberto, marque "Primeira página diferente".',
      'A faixa some da folha 1 e continua nas outras.',
    ],
    feita: d => d.primeiraPaginaDiferente === true,
  },
  {
    id: 'secao',
    titulo: 'Acrescentar a seção que a liderança pediu',
    detalhe: `Falta "${SECAO_QUE_FALTA.titulo}", e ela entra em folha própria, no fim. `
      + 'Depois de acrescentá-la, olhe o sumário: se você já o tinha gerado, ele não sabe que ela existe.',
    onde: 'no fim do relatório',
    passos: [
      'Use o botão "Acrescentar a seção de encerramento", na guia Inserir.',
      'Ela entra com o estilo Título 1, que é o que o sumário procura.',
      'Volte à folha 1 e olhe o sumário.',
    ],
    feita: temASecaoQueFaltava,
  },
  {
    id: 'sumario',
    titulo: 'Gerar o sumário e mantê-lo em dia',
    detalhe: 'O sumário se gera dos estilos de título — e ele guarda o que leu. Acrescentar uma '
      + 'seção depois de gerar deixa ele mostrando o documento de antes, com as folhas erradas, e '
      + 'nada avisa. Um sumário desatualizado é pior do que nenhum, porque quem lê confia nele.',
    onde: 'Referências › Sumário, e Atualizar Sumário',
    passos: [
      'Na guia Referências, clique em Sumário.',
      'Acrescente a seção que falta, se ainda não acrescentou.',
      'Clique em Atualizar Sumário e confira: todas as seções, com a folha de cada uma.',
    ],
    /* As duas metades: existir e estar em dia. Só "existe sumário" deixaria
       entregar um documento cujo sumário aponta para as folhas de antes. */
    feita: sumarioAtualizado,
  },
];

export const metaDaVez = (d: Doc) =>
  METAS_DO_RELATORIO_ANUAL.find(m => !m.feita(d)) ?? null;

export {
  textoDoBloco, textoDoDoc, paragrafos, titulosDoDoc, sumarioAtualizado,
  quantasPaginas, faixaTemCampoDePagina,
};
