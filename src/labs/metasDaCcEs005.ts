/**
 * O que cada uma das oito lições da CC-ES005 cobra.
 *
 * Num arquivo só, como `metasDaCcEs004.ts` e `metasDaAp043.ts`. O que muda
 * aqui é que a vereda tem **três** programas, e não um: o cofre de senhas, a
 * página da conta e o correio. Então a meta é genérica no contexto que ela
 * lê, e o registro lá embaixo é uma união discriminada pelo programa — a tela
 * despacha por `switch` exaustivo, e a nona lição não compila até alguém
 * dizer em que programa ela acontece.
 *
 * É a decisão do `Record` sobre a união de `PASTAS_DA_CC_ES004` e de
 * `CADERNOS_DA_CC_ES003`, com um grau a mais porque os programas são três.
 */

import {
  type Cofre,
  forcaDaSenha, ehDasListas, senhasReutilizadas, cairiamJunto,
  contasNoNomeDeAlguem, contasSemSegundaPessoa, cofreDoClube,
} from './cofreDeSenhas';
import {
  type ContaOnline,
  contaDoClube, contaInvadida, portasAbertas, vazamentosQueAindaValem,
  ENDERECO_DO_INTRUSO,
} from './contaOnline';
import {
  type AnaliseDaMensagem, type MensagemDoCorreio,
  CAIXA_DO_CLUBE, analiseCerta, golpesDaCaixa, verdadeirasDaCaixa,
} from './golpesDoClube';

/* ── O que uma meta é ─────────────────────────────────────────────────────── */

export interface Meta<C> {
  id: string;
  titulo: string;
  /** Por que isto importa. Uma ou duas frases, do jeito que se fala com alguém de dez anos. */
  detalhe: string;
  /** Onde, no programa, este gesto acontece. */
  onde: string;
  /** O passo a passo, para quem travar. Convite, e não despejo. */
  passos: string[];
  feita: (c: C) => boolean;
}

/* ── Os três contextos ────────────────────────────────────────────────────── */

export interface ContextoDoCofre {
  cofre: Cofre;
  /**
   * O cofre de quando a lição abriu.
   *
   * O módulo 8 precisa dele: tirar o nome de alguém da lista de acesso não faz
   * essa pessoa esquecer as senhas que ela digitou por três anos, e a única
   * forma de saber **quais** ela sabia é olhar o cofre de antes. É a mesma
   * razão de a CC-ES001 carregar o disco de agora e o de quando abriu.
   */
  inicial: Cofre;
}

export interface ContextoDaConta {
  conta: ContaOnline;
  inicial: ContaOnline;
  /**
   * Os endereços já consultados na verificação de vazamento.
   *
   * Consultar não deixa marca na conta — é o desbravador **olhando**, e o
   * requisito 4.4 é sobre isso. É a família das quatro verificações do
   * Explorador que só existem como gesto, e das duas descobertas do módulo 6
   * da CC-ES004.
   */
  consultados: string[];
}

export interface ContextoDoCorreio {
  caixa: MensagemDoCorreio[];
  analises: AnaliseDaMensagem[];
}

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 1 — Senha forte, e o cofre (requisitos 2.1, 2.3, 3 e 4.1)
   ──────────────────────────────────────────────────────────────────────── */

const semReuso = (c: Cofre) => senhasReutilizadas(c).length === 0;

export const METAS_DE_SENHAS: Meta<ContextoDoCofre>[] = [
  {
    id: 'gerou-forte',
    titulo: 'Guardar uma senha longa e única',
    detalhe: 'O requisito 4.1 pede uma senha gerada e guardada no cofre. O gerador faz '
      + 'em dois segundos uma senha que ninguém decoraria — e ninguém precisa, porque '
      + 'quem decora é o cofre.',
    onde: 'Gerar uma senha › Usar esta senha',
    passos: [
      'Escolha uma conta na lista da esquerda.',
      'No cartão "Gerar uma senha", veja o medidor e aumente o tamanho até ele dizer "forte".',
      'Clique em Usar esta senha.',
    ],
    feita: ({ cofre }) => cofre.entradas.some(e =>
      forcaDaSenha(e.senha) === 'forte' && cairiamJunto(cofre, e.id).length === 0),
  },
  {
    id: 'sem-lista',
    titulo: 'Tirar do cofre a senha que está em toda lista de vazadas',
    detalhe: 'Uma delas tem maiúscula, minúscula, número e símbolo, e passa em qualquer '
      + 'cadastro. E está nas listas há vinte anos: ninguém a adivinha — alguém a tenta, '
      + 'primeiro, em todo lugar.',
    onde: 'Procure o item com o sinal vermelho e troque a senha dele',
    passos: [
      'Olhe o relatório do cofre e a lista da esquerda.',
      'Abra a conta marcada e leia o medidor.',
      'Gere uma senha nova e use-a.',
    ],
    feita: ({ cofre }) => !cofre.entradas.some(e => ehDasListas(e.senha)),
  },
  {
    id: 'sem-reuso',
    titulo: 'Desfazer a senha repetida em quatro contas',
    detalhe: 'É o requisito 3 virando trabalho. Repare quantas trocas ele custa — é por '
      + 'isso que reutilizar sai mais caro do que uma senha curta: a curta derruba uma '
      + 'conta, a repetida derruba todas de uma vez.',
    onde: 'Uma conta de cada vez, na lista da esquerda',
    passos: [
      'O relatório do cofre diz quais contas dividem a mesma senha.',
      'Abra a primeira e gere uma senha nova para ela.',
      'Repita nas outras — o aviso some quando não sobrar nenhuma repetida.',
    ],
    feita: ({ cofre }) => semReuso(cofre),
  },
  {
    id: 'curta-trocada',
    titulo: 'Trocar a senha curta da loja de uniformes',
    detalhe: 'Ela é única: se vazar, derruba essa conta e mais nenhuma. Mesmo assim tem '
      + 'seis caracteres, e seis caracteres um computador tenta todos em pouco tempo. '
      + 'Ser única não torna uma senha forte.',
    onde: 'Loja de uniformes › a senha',
    passos: ['Abra a Loja de uniformes.', 'Veja o medidor.', 'Gere uma senha nova.'],
    feita: ({ cofre }) => {
      const loja = cofre.entradas.find(e => e.id === 'loja');
      return !!loja && forcaDaSenha(loja.senha) !== 'frágil';
    },
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 2 — Autenticação em duas etapas (requisitos 2.2 e 4.2)
   ──────────────────────────────────────────────────────────────────────── */

export const METAS_DE_DUAS_ETAPAS: Meta<ContextoDaConta>[] = [
  {
    id: 'ativou',
    titulo: 'Ligar a verificação em duas etapas',
    detalhe: 'Com ela, saber a senha deixa de bastar. Os três métodos estão na tela com o '
      + 'que cada um cobre e o que não cobre — leia os três antes de escolher.',
    onde: 'Segurança › Verificação em duas etapas',
    passos: [
      'Abra a seção Segurança.',
      'Leia os três métodos e escolha um.',
      'Clique em Ativar.',
    ],
    feita: ({ conta }) => conta.duasEtapas.ativa,
  },
  {
    id: 'guardou',
    titulo: 'Guardar os códigos de reserva',
    detalhe: 'O serviço mostra os códigos uma vez só. Eles são o único caminho de volta se '
      + 'o telefone se perder — e fechar a caixa sem baixá-los é um clique, com a tela '
      + 'continuando a dizer que está tudo ativado.',
    onde: 'Na caixa que aparece assim que você ativa',
    passos: [
      'Assim que ativar, a caixa dos códigos aparece.',
      'Clique em Baixar os códigos antes de fechar.',
      'Se já fechou, use Recomeçar e refaça — eles não voltam.',
    ],
    feita: ({ conta }) => conta.duasEtapas.codigosGuardados,
  },
  {
    id: 'recuperacao-do-clube',
    titulo: 'Tirar a recuperação da caixa pessoal da secretária',
    detalhe: 'De nada adianta trancar a porta e deixar a chave com quem está de saída: '
      + 'quem entra na caixa pessoal dela recupera a conta do clube inteira, por mais '
      + 'etapas que a conta tenha.',
    onde: 'Segurança › Formas de recuperar a conta',
    passos: [
      'Ainda em Segurança, desça até Formas de recuperar a conta.',
      'Veja para onde o código iria hoje.',
      'Troque para um endereço do próprio clube.',
    ],
    feita: ({ conta }) => !!conta.recuperacao.email
      && !conta.recuperacao.email.includes('marta.oliveira'),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 3 — Permissão de aplicativo (requisitos 2.6 e 4.3)
   ──────────────────────────────────────────────────────────────────────── */

const autorizado = (c: ContaOnline, id: string) => c.aplicativos.some(a => a.id === id);

/*
  "Sem tirar o que o clube usa" é **condição, e não tarefa.**

  Como item próprio da lista ela abriria verde no segundo zero — o aplicativo
  dos formulários já está autorizado quando a lição começa —, e lista com item
  marcado antes de a pessoa fazer nada ensina a não ler a lista.
  `metasDaCcEs005.test.ts` reprovou exatamente isso, e com razão.

  Então ela viaja como conjunção de cada meta que revoga alguma coisa, que é a
  decisão de "sem alterar uma palavra do texto" na CC-ES002. Revogar todos de
  uma vez é rápido, quebra a inscrição do acampamento — que passa por esse
  aplicativo — e deixa as duas metas vermelhas, e não uma terceira.
*/
const formulariosDePe = (c: ContaOnline) => autorizado(c, 'formularios');

export const METAS_DE_APLICATIVOS: Meta<ContextoDaConta>[] = [
  {
    id: 'foto-fora',
    titulo: 'Tirar o aplicativo de filtro de fotos, e só ele',
    detalhe: 'Para pôr filtro numa foto ele pediu para ler todas as mensagens e ver a '
      + 'lista de contatos. Ninguém o abre há mais de ano, e a permissão continua valendo '
      + 'todo esse tempo — permissão não vence sozinha. Revisar é decidir um por um: '
      + 'remover todos é mais rápido e quebra a inscrição do acampamento.',
    onde: 'Aplicativos conectados',
    passos: [
      'Abra Aplicativos conectados.',
      'Leia o que cada um pode fazer e quando foi usado pela última vez.',
      'Remova o acesso daquele que pede muito mais do que precisa.',
      'Deixe de pé o que foi usado ontem: é por ele que as inscrições chegam.',
    ],
    feita: ({ conta }) => !autorizado(conta, 'fotomagica') && formulariosDePe(conta),
  },
  {
    id: 'sorteador-fora',
    titulo: 'Tirar o sorteador de brindes, e só ele',
    detalhe: 'Autorizado num acampamento, nunca mais aberto — e ele pode mandar mensagem '
      + 'em nome do clube. Aplicativo esquecido é porta que ficou aberta sem ninguém '
      + 'do outro lado, até o dia em que alguém aparece. O que o clube usa toda semana '
      + 'continua onde está.',
    onde: 'Aplicativos conectados',
    passos: [
      'Olhe a data do último uso de cada um.',
      'Remova o que ninguém abre há um ano.',
      'Quem foi usado ontem fica.',
    ],
    feita: ({ conta }) => !autorizado(conta, 'sorteador') && formulariosDePe(conta),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 4 — Vazamento de dados (requisitos 2.4 e 4.4)
   ──────────────────────────────────────────────────────────────────────── */

export const METAS_DE_VAZAMENTO: Meta<ContextoDaConta>[] = [
  {
    id: 'consultou-clube',
    titulo: 'Consultar o endereço do clube',
    detalhe: 'Vazamento não é sempre culpa de quem usa a conta: uma loja onde o clube '
      + 'comprou camisetas perdeu a lista de clientes dela, e o endereço e a senha do '
      + 'clube foram junto.',
    onde: 'Segurança › Verificar se um endereço consta em vazamento',
    passos: [
      'Abra Segurança e desça até a consulta.',
      'O endereço do clube já vem escrito.',
      'Clique em Consultar e leia o que apareceu.',
    ],
    feita: ({ conta, consultados }) => consultados.includes(conta.endereco),
  },
  {
    id: 'consultou-pessoal',
    titulo: 'Consultar também o endereço pessoal da secretária',
    detalhe: 'Ele é a recuperação da conta do clube — quem entra nele entra aqui. E ele '
      + 'aparece em duas listas, de dois vazamentos diferentes.',
    onde: 'A mesma consulta, trocando o endereço',
    passos: [
      'Apague o endereço do campo e escreva o pessoal da secretária.',
      'Você o encontra em Formas de recuperar a conta.',
      'Consulte.',
    ],
    feita: ({ consultados }) => consultados.some(e => e.includes('marta.oliveira')),
  },
  {
    id: 'senha-vazada-trocada',
    titulo: 'Trocar a senha que vazou',
    detalhe: 'O vazamento é de abril e a senha não muda desde 2024: ela está numa lista '
      + 'que qualquer um baixa, e continua abrindo esta conta hoje. Consultar sem trocar '
      + 'é saber e não fazer.',
    onde: 'Segurança › Senha',
    passos: [
      'Volte ao topo da seção Segurança.',
      'Repare na data da última troca e na data do vazamento.',
      'Clique em Trocar a senha.',
    ],
    feita: ({ conta }) => vazamentosQueAindaValem(conta).length === 0,
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 5 — Configurações de privacidade (requisito 4.5)
   ──────────────────────────────────────────────────────────────────────── */

const valor = (c: ContaOnline, id: string) => c.privacidade.find(a => a.id === id)?.valor;

/*
  "Sem tirar o clube da busca" é **condição, e não tarefa**, pela mesma razão
  escrita acima nos aplicativos: a busca já está aberta quando a lição começa,
  e como item próprio da lista ela nasceria verde.

  Como conjunção ela faz o que precisa fazer: "Deixar tudo privado" guarda os
  dados dos desbravadores **e** tira o clube da busca, e as duas metas ficam
  vermelhas — não uma terceira, que a pessoa poderia ler como um detalhe à
  parte. Ajustar é decidir um por um, e é isso que as duas metas medem juntas.
*/
const clubeAchavel = (c: ContaOnline) => valor(c, 'busca') === 'sim';

export const METAS_DE_PRIVACIDADE: Meta<ContextoDaConta>[] = [
  {
    id: 'dados-fechados',
    titulo: 'Fechar a lista de membros e os telefones, sem sumir da busca',
    detalhe: 'São nomes completos de crianças e os telefones dos pais, dados na inscrição '
      + 'para o clube usar — e não para qualquer pessoa ver. Existe um botão que fecha '
      + 'tudo de uma vez, e ele leva junto a página do clube na busca: aí os dados ficam '
      + 'guardados e nenhuma família consegue encontrar o clube.',
    onde: 'Privacidade › Quem vê o quê',
    passos: [
      'Abra a seção Privacidade.',
      'Leia o que cada ajuste decide antes de mexer nele.',
      'Feche os dois que mostram dados de gente.',
      'Se usou "Deixar tudo privado", volte o primeiro ajuste da lista para sim.',
    ],
    feita: ({ conta }) => valor(conta, 'membros') === 'só a diretoria'
      && valor(conta, 'telefones') === 'só a diretoria'
      && clubeAchavel(conta),
  },
  {
    id: 'local-fora',
    titulo: 'Parar de publicar o local junto das fotos',
    detalhe: 'A foto do acampamento sai com o lugar onde ele está acontecendo, agora, com '
      + 'as crianças dentro. Esse é o ajuste que mais custa num clube, e o que menos gente '
      + 'sabe que existe. E a página do clube continua achável: quem procura o clube '
      + 'precisa achar o clube.',
    onde: 'Privacidade › Publicar o local junto das fotos',
    passos: [
      'Ainda em Privacidade, ache o ajuste do local.',
      'Desligue-o.',
      'Confira que a página do clube continua aparecendo na busca.',
    ],
    feita: ({ conta }) => valor(conta, 'local') === 'não' && clubeAchavel(conta),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 6 — Mensagem fraudulenta (requisitos 2.5 e 5)
   ──────────────────────────────────────────────────────────────────────── */

const analiseDe = (c: ContextoDoCorreio, id: string) => c.analises.find(a => a.id === id);

export const METAS_DE_GOLPES: Meta<ContextoDoCorreio>[] = [
  {
    id: 'tres-analisadas',
    titulo: 'Apontar os indícios das três mensagens fraudulentas',
    detalhe: 'Em cada uma, marque exatamente o que a denuncia — nem a mais, nem a menos. '
      + 'As três não têm os mesmos indícios, e marcar todos em todas não é analisar.',
    onde: 'Abra cada mensagem e use o painel de indícios',
    passos: [
      'Abra a primeira mensagem e leia o endereço inteiro de quem mandou.',
      'Pare o ponteiro em cima de cada link e leia o destino na barra de baixo.',
      'Marque os indícios que você encontrou e denuncie a mensagem.',
    ],
    feita: c => golpesDaCaixa(c.caixa).every(m => analiseCerta(m, analiseDe(c, m.id))),
  },
  {
    id: 'poupou-as-verdadeiras',
    titulo: 'Não acusar as mensagens verdadeiras',
    detalhe: 'Duas das cinco são de verdade. Uma tem prazo e a outra tem link — e nenhuma '
      + 'das duas coisas é indício sozinha. Desconfiar de tudo é tão inútil quanto não '
      + 'desconfiar de nada.',
    onde: 'As mesmas cinco mensagens da caixa',
    passos: [
      'Releia as duas que você não denunciou.',
      'Prazo não é indício; prazo com ameaça é.',
      'Link não é indício; link que vai para outro lugar é.',
    ],
    feita: c => verdadeirasDaCaixa(c.caixa).every(m => analiseCerta(m, analiseDe(c, m.id))),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 7 — Quando a conta cai (requisito 6)
   ──────────────────────────────────────────────────────────────────────── */

const porta = (c: ContaOnline, id: string) =>
  portasAbertas(c, ENDERECO_DO_INTRUSO).some(p => p.id === id);

export const METAS_DA_INVASAO: Meta<ContextoDaConta>[] = [
  {
    id: 'senha-trocada',
    titulo: 'Trocar a senha',
    detalhe: 'É a primeira providência, e a ordem importa: trocar a senha derruba as '
      + 'outras sessões. Encerrar as sessões antes disso põe para fora alguém que ainda '
      + 'sabe a senha — e ele entra de novo no minuto seguinte.',
    onde: 'Segurança › Senha',
    passos: ['Abra Segurança.', 'Clique em Trocar a senha.', 'Só depois vá ver as sessões.'],
    feita: ({ conta, inicial }) => conta.senha !== inicial.senha,
  },
  {
    id: 'recuperacao-retomada',
    titulo: 'Retomar o e-mail de recuperação',
    detalhe: 'Ele foi trocado para o endereço de quem invadiu. Enquanto estiver assim, '
      + '"esqueci minha senha" devolve a conta a ele em dois minutos — por mais forte que '
      + 'seja a senha nova, e sem nada aparecer errado na tela.',
    onde: 'Segurança › Formas de recuperar a conta',
    passos: [
      'Em Segurança, desça até Formas de recuperar a conta.',
      'Repare no endereço que está lá.',
      'Troque para o endereço da diretoria.',
    ],
    feita: ({ conta }) => !porta(conta, 'recuperacao'),
  },
  {
    id: 'sessoes-encerradas',
    titulo: 'Encerrar a sessão que não é do clube',
    detalhe: 'Um aparelho que ninguém reconhece, de uma cidade onde o clube não tem '
      + 'ninguém. Se ela voltar depois de encerrada, é sinal de que a senha ainda é a '
      + 'antiga.',
    onde: 'Atividade da conta › Aparelhos com sessão aberta',
    passos: [
      'Abra Atividade da conta.',
      'Leia o aparelho, o lugar e a hora de cada sessão.',
      'Encerre a que não é de ninguém do clube.',
    ],
    feita: ({ conta }) => !porta(conta, 'sessao'),
  },
  {
    id: 'aplicativo-fora',
    titulo: 'Remover o aplicativo que ele autorizou',
    detalhe: 'A autorização de um aplicativo é um crachá separado da senha: ela continua '
      + 'valendo depois de a senha mudar. É por isso que trocar a senha e parar não '
      + 'resolve.',
    onde: 'Aplicativos conectados',
    passos: [
      'Abra Aplicativos conectados.',
      'Procure um que apareceu nos últimos dias e que ninguém do clube instalou.',
      'Remova o acesso dele.',
    ],
    feita: ({ conta }) => !porta(conta, 'aplicativo'),
  },
  {
    id: 'encaminhamento-apagado',
    titulo: 'Apagar a regra que copia as mensagens',
    detalhe: 'Esta é a pior de esquecer, porque ela não o traz de volta: a conta manda '
      + 'tudo para ele sozinha, todo dia, e nada muda na caixa de entrada de quem já '
      + 'acha que recuperou a conta.',
    onde: 'Atividade da conta › Encaminhamento de mensagens',
    passos: [
      'Em Atividade da conta, desça até Encaminhamento de mensagens.',
      'Veja para onde as cópias estão indo.',
      'Apague a regra.',
    ],
    feita: ({ conta }) => !porta(conta, 'encaminhamento'),
  },
  {
    id: 'duas-etapas-depois',
    titulo: 'Ligar as duas etapas, para não acontecer de novo',
    detalhe: 'A última providência não desfaz nada: ela impede a próxima. Sem ela, a '
      + 'conta volta a depender só de uma senha — e foi uma senha que caiu.',
    onde: 'Segurança › Verificação em duas etapas',
    passos: ['Volte a Segurança.', 'Escolha um método.', 'Ative e guarde os códigos.'],
    feita: ({ conta }) => conta.duasEtapas.ativa && conta.duasEtapas.codigosGuardados,
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 8 — O plano de contas do clube (requisitos 7 e 8)
   ──────────────────────────────────────────────────────────────────────── */

/** As senhas que uma pessoa chegou a saber, olhando o cofre de quando a lição abriu. */
export const senhasQueEssaPessoaSabia = (inicial: Cofre, quem: string) =>
  inicial.entradas.filter(e => e.acesso.includes(quem));

export const METAS_DO_PLANO: Meta<ContextoDoCofre>[] = [
  {
    id: 'nada-no-nome-de-alguem',
    titulo: 'Tirar as contas do clube do nome de uma pessoa',
    detalhe: 'Os formulários de inscrição estão na conta pessoal da secretária. No dia em '
      + 'que ela mudar de clube, as respostas de todos os acampamentos vão com ela — e '
      + 'ninguém vai ter feito nada de errado.',
    onde: 'Abra a conta marcada › Quem entra nesta conta',
    passos: [
      'Abra cada conta e olhe "A conta está no nome de".',
      'Ache a que está no nome de uma pessoa.',
      'Clique em Passar para a conta do clube.',
    ],
    feita: ({ cofre }) => contasNoNomeDeAlguem(cofre).length === 0,
  },
  {
    id: 'duas-pessoas-em-cada',
    titulo: 'Deixar pelo menos duas pessoas em cada conta',
    detalhe: 'Não é preciso ninguém sair de má-fé: basta perder o telefone, ficar doente '
      + 'ou viajar na semana do acampamento. Conta que uma pessoa só abre é conta que o '
      + 'clube perde quando ela não está.',
    onde: 'Quem entra nesta conta › Dar acesso a…',
    passos: [
      'Abra uma conta por vez.',
      'Veja quem tem acesso hoje.',
      'Dê acesso a mais alguém da diretoria.',
    ],
    feita: ({ cofre }) => contasSemSegundaPessoa(cofre).length === 0,
  },
  {
    id: 'marta-saiu',
    titulo: 'Fazer a troca de diretoria: tirar o acesso de quem saiu',
    detalhe: 'A secretária está deixando o clube. O acesso dela sai de todas as contas — '
      + 'é o primeiro gesto de toda troca de diretoria, e o que quase ninguém faz.',
    onde: 'Quem entra nesta conta › o × ao lado do nome',
    passos: [
      'Abra cada conta em que a Marta aparece.',
      'Clique no × ao lado do nome dela.',
      'Confira que sobrou mais de uma pessoa em cada uma.',
    ],
    feita: ({ cofre }) => !cofre.entradas.some(e => e.acesso.includes('Marta')),
  },
  {
    id: 'senhas-que-ela-sabia',
    titulo: 'Trocar as senhas que ela sabia de cor',
    detalhe: 'Tirar o nome de alguém da lista não faz essa pessoa esquecer o que digitou '
      + 'por três anos. Ela continua entrando em tudo, e o cofre continua dizendo que ela '
      + 'não tem acesso. Toda senha que ela chegou a usar precisa ser outra.',
    onde: 'Cada conta que ela abria › a senha',
    passos: [
      'Olhe de quais contas a Marta tinha acesso quando a lição abriu.',
      'Em cada uma, gere uma senha nova.',
      'Tirar o acesso e não trocar a senha não muda nada para quem já a sabe.',
    ],
    feita: ({ cofre, inicial }) => senhasQueEssaPessoaSabia(inicial, 'Marta').every(antes => {
      const agora = cofre.entradas.find(e => e.id === antes.id);
      return !agora || agora.senha !== antes.senha;
    }),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   As oito lições
   ──────────────────────────────────────────────────────────────────────── */

export type LicaoDaCcEs005 =
  | 'senhas' | 'duas-etapas' | 'aplicativos' | 'vazamento'
  | 'privacidade' | 'golpes' | 'invasao' | 'plano';

/**
 * De que programa cada lição parte, e com que lista de metas.
 *
 * União discriminada pelo programa, e não três registros soltos: a tela faz
 * um `switch` sobre `programa` e o TypeScript garante que cada caso recebe o
 * contexto certo. Lição nova não compila até dizer em qual dos três ela
 * acontece — que é a decisão do `Record` de `PASTAS_DA_CC_ES004`, com um grau
 * a mais porque aqui os programas são três.
 *
 * E o mapa mora **fora do teste**, ao contrário do de Word: quem o lê é a
 * tela, que monta a lição, **e** a trava, que confere que nenhuma meta abre
 * verde. Escrito só na trava, a tela repetiria a escolha e as duas divergiriam
 * na primeira lição nova, com a trava continuando verde conferindo uma lição
 * que a tela não abre.
 */
export type LicaoDeContas =
  | { programa: 'cofre'; inicial: () => Cofre; metas: Meta<ContextoDoCofre>[] }
  | { programa: 'conta'; inicial: () => ContaOnline; metas: Meta<ContextoDaConta>[] }
  | { programa: 'correio'; caixa: () => MensagemDoCorreio[]; metas: Meta<ContextoDoCorreio>[] };

export const LICOES_DA_CC_ES005: Record<LicaoDaCcEs005, LicaoDeContas> = {
  senhas: { programa: 'cofre', inicial: cofreDoClube, metas: METAS_DE_SENHAS },
  'duas-etapas': { programa: 'conta', inicial: contaDoClube, metas: METAS_DE_DUAS_ETAPAS },
  aplicativos: { programa: 'conta', inicial: contaDoClube, metas: METAS_DE_APLICATIVOS },
  vazamento: { programa: 'conta', inicial: contaDoClube, metas: METAS_DE_VAZAMENTO },
  privacidade: { programa: 'conta', inicial: contaDoClube, metas: METAS_DE_PRIVACIDADE },
  golpes: { programa: 'correio', caixa: () => CAIXA_DO_CLUBE, metas: METAS_DE_GOLPES },
  invasao: { programa: 'conta', inicial: contaInvadida, metas: METAS_DA_INVASAO },
  plano: { programa: 'cofre', inicial: cofreDoClube, metas: METAS_DO_PLANO },
};
