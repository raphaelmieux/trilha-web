/**
 * A conta online, sem tela nenhuma.
 *
 * É o segundo programa que a CC-ES005 precisa e que a plataforma não tinha: a
 * área de segurança e privacidade de uma conta — o que `myaccount.google.com`
 * é, e o que toda rede social tem numa página parecida. Ela mora separada de
 * `contaOnline.tsx` pela razão de sempre: o modelo se testa sem subir React.
 * É a divisão de `capturaDoScanner.ts` e `documentoPdf.ts`.
 *
 * ── O que esta vereda cobra deste motor ──────────────────────────────────
 * Cinco demonstrações do requisito 4, e nenhuma delas significa coisa alguma
 * se a simulação for um punhado de interruptores:
 *
 * — 4.2 ativar duas etapas. Vazio se ligar for um clique: o que perde a conta
 *   de quem ligou é não ter guardado os códigos de reserva.
 * — 4.3 revisar **e** revogar aplicativos de terceiros. Vazio se revogar todos
 *   fechasse a tarefa — revisar é o que decide qual fica.
 * — 4.4 verificar se o endereço consta em vazamento. Vazio se a resposta não
 *   levar a lugar nenhum: o que importa é a senha que vazou ainda ser a de
 *   hoje, e estar em mais três serviços.
 * — 4.5 localizar e **ajustar** privacidade. Vazio se "tudo privado" passasse:
 *   o clube precisa ser achado pelas famílias.
 * — e o requisito 6, a ordem das providências quando a conta cai. Vazio se
 *   trocar a senha bastasse — o intruso volta pela recuperação que ele mesmo
 *   trocou, e a tela diz "conta recuperada" enquanto ele lê tudo.
 */

/* ── As duas etapas ───────────────────────────────────────────────────────── */

export type MetodoDeDuasEtapas = 'sms' | 'aplicativo' | 'chave';

/**
 * O que cada método protege, e o que ele não protege.
 *
 * O programa **relata**, e não dá veredito: é a régua de status do Word e o
 * painel de Problemas do Python. Nenhuma página de conta escreve "você
 * escolheu errado" — elas dizem o que o método faz, e a escolha é de quem
 * está lendo. Escrever a conclusão aqui poria na nossa tela a resposta que a
 * lição existe para o desbravador tirar sozinho.
 *
 * E os três existem porque um programa tem todos os comandos. Oferecer só o
 * melhor ensinaria a procurar o botão que a tarefa quer — e no computador do
 * clube o SMS vai estar lá, sendo oferecido primeiro, como é em todo serviço.
 */
export const METODOS_DE_DUAS_ETAPAS: Record<MetodoDeDuasEtapas, {
  nome: string; protege: string; naoProtege: string;
}> = {
  sms: {
    nome: 'Código por mensagem de texto',
    protege: 'Quem descobriu sua senha ainda precisa do código que chega no seu número.',
    naoProtege: 'Quem convence a operadora a passar seu número para outro chip recebe o código no lugar.',
  },
  aplicativo: {
    nome: 'Código de um aplicativo autenticador',
    protege: 'O código nasce dentro do aparelho e não viaja por rede nenhuma.',
    naoProtege: 'Quem monta uma página parecida com a verdadeira recebe o código se você o digitar lá.',
  },
  chave: {
    nome: 'Chave de segurança física',
    protege: 'A chave confere o endereço do site antes de responder, então uma página falsa não recebe nada.',
    naoProtege: 'Sem a chave em mãos você também não entra — perdê-la sem código de reserva tranca a conta.',
  },
};

export interface DuasEtapas {
  ativa: boolean;
  metodo?: MetodoDeDuasEtapas;
  /** Os códigos de reserva que o serviço mostra **uma vez**, ao ligar. */
  codigos: string[];
  /**
   * Se a pessoa de fato guardou os códigos.
   *
   * **Separado de `ativa` de propósito**, e é a armadilha inteira do requisito
   * 4.2. Ligar as duas etapas é um clique; fechar a caixa dos códigos de
   * reserva sem baixá-los também. A tela diz "ativada", tudo parece certo, e o
   * dia em que o telefone cair no rio a conta vai junto — sem erro nenhum, sem
   * aviso nenhum, e com o desbravador tendo feito o que a tarefa pedia.
   *
   * É "zero link não é zero link quebrado" aplicado à caixa de duas etapas.
   */
  codigosGuardados: boolean;
}

/** Os códigos que o serviço sorteia ao ligar as duas etapas. */
export function gerarCodigosDeReserva(sorteio: () => number = Math.random): string[] {
  const um = () => String(Math.floor(sorteio() * 90000000) + 10000000);
  return Array.from({ length: 8 }, um);
}

/* ── Os aplicativos de terceiros ──────────────────────────────────────────── */

export type Escopo =
  | 'ver-perfil' | 'ler-email' | 'enviar-email'
  | 'ler-arquivos' | 'gerenciar-arquivos' | 'ver-contatos' | 'publicar';

/** O que cada permissão deixa o aplicativo fazer, dito como o programa diria. */
export const ESCOPOS: Record<Escopo, string> = {
  'ver-perfil': 'Ver seu nome e sua foto',
  'ler-email': 'Ler todas as suas mensagens',
  'enviar-email': 'Enviar mensagens em seu nome',
  'ler-arquivos': 'Ver seus arquivos',
  'gerenciar-arquivos': 'Criar e apagar seus arquivos',
  'ver-contatos': 'Ver sua lista de contatos',
  publicar: 'Publicar no seu perfil',
};

export interface AplicativoAutorizado {
  id: string;
  nome: string;
  escopos: Escopo[];
  autorizadoEm: string;
  /**
   * A última vez que ele tocou na conta.
   *
   * É o dado que uma página de verdade mostra, e é por ele que se revisa. Um
   * campo `emUso: boolean` seria a resposta escrita na tela — o desbravador
   * leria "em uso" e revogaria o resto sem ter olhado nada, que é o contrário
   * do que "revisar" quer dizer no requisito 4.3.
   */
  ultimoUso?: string;
}

export const revogarAplicativo = (c: ContaOnline, id: string): ContaOnline =>
  ({ ...c, aplicativos: c.aplicativos.filter(a => a.id !== id) });

/* ── As sessões e o encaminhamento ────────────────────────────────────────── */

export interface Sessao {
  id: string;
  aparelho: string;
  lugar: string;
  quando: string;
  /** A sessão em que a pessoa está agora. Encerrá-la a põe para fora. */
  atual?: boolean;
  /**
   * Se esta sessão é de quem invadiu.
   *
   * **Declarado**, porque uma sessão não diz de quem ela é — nem na página de
   * verdade. O que a pessoa lê é o aparelho, o lugar e a hora, e é daí que ela
   * conclui. Adivinhar pelo lugar seria pôr na tela a resposta que a lição
   * existe para o desbravador tirar de um aparelho que ele não reconhece.
   */
  intruso?: boolean;
}

export interface Encaminhamento {
  id: string;
  para: string;
  criadoEm: string;
  /**
   * A regra que o intruso deixou continua copiando tudo depois da troca de
   * senha. Nenhuma tela avisa: ela mora três cliques fundo nas configurações,
   * e não mexe em nada do que a pessoa vê chegando.
   */
  doIntruso?: boolean;
}

/* ── Os vazamentos conhecidos ─────────────────────────────────────────────── */

export interface Vazamento {
  servico: string;
  /** Mês em que o vazamento veio a público, `AAAA-MM`. */
  quando: string;
  oQueVazou: string[];
  enderecos: string[];
}

/**
 * As listas públicas de vazamento que o serviço consulta.
 *
 * **O que ele responde é sobre estas listas, e não sobre o mundo.** É a coisa
 * mais fácil de ensinar errado aqui: quem consulta e recebe "nada encontrado"
 * lê "estou seguro", e o que aconteceu foi só que nenhuma lista pública tem
 * aquele endereço — vazamento não descoberto, não publicado, ou publicado sem
 * o endereço dentro. O programa diz o que consultou; a lição diz o resto.
 */
export const VAZAMENTOS_CONHECIDOS: Vazamento[] = [
  {
    servico: 'Loja de Camisetas Online',
    quando: '2026-04',
    oQueVazou: ['endereço de e-mail', 'senha', 'telefone'],
    enderecos: ['clubepioneiros@gmail.com'],
  },
  {
    servico: 'Fórum de Acampamentos',
    quando: '2023-11',
    oQueVazou: ['endereço de e-mail', 'senha'],
    enderecos: ['marta.oliveira@gmail.com'],
  },
  {
    servico: 'Aplicativo de Cupons',
    quando: '2022-08',
    oQueVazou: ['endereço de e-mail'],
    enderecos: ['marta.oliveira@gmail.com'],
  },
];

/** Em que vazamentos conhecidos este endereço aparece, do mais novo ao mais velho. */
export function vazamentosDe(
  endereco: string,
  lista: Vazamento[] = VAZAMENTOS_CONHECIDOS,
): Vazamento[] {
  const e = endereco.trim().toLowerCase();
  return lista
    .filter(v => v.enderecos.some(x => x.toLowerCase() === e))
    .sort((a, b) => b.quando.localeCompare(a.quando));
}

/**
 * Os vazamentos que ainda valem: a senha vazou e continua sendo a de hoje.
 *
 * É o que separa o requisito 4.4 de uma consulta que não leva a lugar nenhum.
 * Um vazamento de 2022 cuja senha já foi trocada é história; um de abril cuja
 * senha nunca mudou é a conta aberta, agora, para quem baixou a lista.
 *
 * A comparação é de mês, e é por isso que as duas datas são `AAAA-MM`: dia e
 * hora seriam precisão que a lista pública não tem, e fingi-la faria a conta
 * parecer mais exata do que é.
 */
export function vazamentosQueAindaValem(
  c: ContaOnline,
  lista: Vazamento[] = VAZAMENTOS_CONHECIDOS,
): Vazamento[] {
  return vazamentosDe(c.endereco, lista).filter(v =>
    v.oQueVazou.includes('senha') && c.senhaTrocadaEm < v.quando);
}

/* ── A privacidade ────────────────────────────────────────────────────────── */

export interface AjusteDePrivacidade {
  id: string;
  nome: string;
  /** O que este ajuste decide, dito como a página de verdade diria. */
  explica: string;
  opcoes: string[];
  valor: string;
  /**
   * O valor que o botão "Deixar tudo privado" põe aqui.
   *
   * Ele existe porque um programa tem todos os comandos — e porque é ele que
   * mostra que privacidade não é um interruptor: fechado tudo, a página do
   * clube some da busca e as famílias param de achar o clube. O requisito 4.5
   * diz **ajustar**, e ajustar é decidir um por um.
   */
  fechado: string;
}

export const ajustar = (c: ContaOnline, id: string, valor: string): ContaOnline => ({
  ...c,
  privacidade: c.privacidade.map(a => (a.id === id ? { ...a, valor } : a)),
});

/** O botão grosso: fecha tudo, inclusive o que o clube precisa aberto. */
export const fecharTudo = (c: ContaOnline): ContaOnline =>
  ({ ...c, privacidade: c.privacidade.map(a => ({ ...a, valor: a.fechado })) });

/* ── A conta ──────────────────────────────────────────────────────────────── */

export interface Recuperacao {
  email?: string;
  telefone?: string;
}

export interface ContaOnline {
  servico: string;
  endereco: string;
  senha: string;
  /** Mês da última troca de senha, `AAAA-MM`. É o que dá sentido ao vazamento. */
  senhaTrocadaEm: string;
  duasEtapas: DuasEtapas;
  aplicativos: AplicativoAutorizado[];
  sessoes: Sessao[];
  encaminhamentos: Encaminhamento[];
  recuperacao: Recuperacao;
  privacidade: AjusteDePrivacidade[];
}

/* ── As operações ─────────────────────────────────────────────────────────── */

export const trocarSenhaDaConta = (c: ContaOnline, senha: string, quando: string): ContaOnline => ({
  ...c,
  senha,
  senhaTrocadaEm: quando,
  /*
    Trocar a senha derruba as outras sessões, que é o que os serviços de
    verdade fazem. É justamente por isso que a ordem importa: quem encerra as
    sessões **antes** de trocar a senha as derruba para alguém que ainda sabe a
    senha, e ele entra de novo no minuto seguinte.
  */
  sessoes: c.sessoes.filter(s => s.atual),
});

/**
 * Encerrar as outras sessões.
 *
 * Com a senha antiga ainda de pé, o intruso **volta** — e isso não é castigo
 * nosso, é o que acontece: ele tem a senha, e entrar de novo é digitar. Uma
 * simulação que o deixasse fora depois de um clique ensinaria que a ordem das
 * providências dá na mesma, que é exatamente o que o requisito 6 existe para
 * desmentir.
 */
export function encerrarOutrasSessoes(c: ContaOnline, senhaVazada: string): ContaOnline {
  const sobrou = c.sessoes.filter(s => s.atual);
  const aindaSabeASenha = c.senha === senhaVazada;
  const voltou = c.sessoes.filter(s => s.intruso && aindaSabeASenha)
    .map(s => ({ ...s, quando: 'agora mesmo' }));
  return { ...c, sessoes: [...sobrou, ...voltou] };
}

export const trocarRecuperacao = (c: ContaOnline, r: Recuperacao): ContaOnline =>
  ({ ...c, recuperacao: { ...c.recuperacao, ...r } });

export const tirarEncaminhamento = (c: ContaOnline, id: string): ContaOnline =>
  ({ ...c, encaminhamentos: c.encaminhamentos.filter(e => e.id !== id) });

export const ligarDuasEtapas = (
  c: ContaOnline, metodo: MetodoDeDuasEtapas, codigos: string[],
): ContaOnline => ({ ...c, duasEtapas: { ativa: true, metodo, codigos, codigosGuardados: false } });

export const guardarCodigos = (c: ContaOnline): ContaOnline =>
  ({ ...c, duasEtapas: { ...c.duasEtapas, codigosGuardados: true } });

/* ── As portas por onde o intruso volta ───────────────────────────────────── */

export interface PortaAberta {
  id: string;
  /** O que ainda deixa o intruso entrar, dito sem acusar ninguém de nada. */
  oQue: string;
}

/**
 * O que ainda deixaria o intruso voltar.
 *
 * É a conta inteira do requisito 6, e ela existe porque **trocar a senha não
 * basta e nada na tela diz isso**. São três portas, e cada uma sobrevive à
 * correção das outras duas:
 *
 * — a recuperação que ele trocou para o endereço dele. Com ela, "esqueci minha
 *   senha" devolve a conta a ele em dois minutos, por mais forte que seja a
 *   senha nova;
 * — a sessão dele, que continua aberta nos serviços que não a derrubam;
 * — a autorização de aplicativo, que é um crachá separado da senha e continua
 *   valendo depois da troca.
 *
 * E há uma quarta coisa que não o traz de volta e é pior de esquecer: o
 * encaminhamento. Ele não precisa entrar — a conta manda tudo para ele
 * sozinha, todo dia, sem nada acontecer na tela de quem recuperou.
 */
export function portasAbertas(c: ContaOnline, enderecoDoIntruso: string): PortaAberta[] {
  const portas: PortaAberta[] = [];
  if (c.recuperacao.email?.toLowerCase() === enderecoDoIntruso.toLowerCase()) {
    portas.push({
      id: 'recuperacao',
      oQue: 'O e-mail de recuperação da conta é o endereço de quem invadiu.',
    });
  }
  if (c.sessoes.some(s => s.intruso)) {
    portas.push({ id: 'sessao', oQue: 'Há uma sessão aberta num aparelho que não é do clube.' });
  }
  const dele = c.aplicativos.filter(a => a.id === 'acesso-remoto');
  if (dele.length > 0) {
    portas.push({ id: 'aplicativo', oQue: `O aplicativo "${dele[0].nome}" continua autorizado.` });
  }
  if (c.encaminhamentos.some(e => e.doIntruso)) {
    portas.push({
      id: 'encaminhamento',
      oQue: 'Uma regra está copiando toda mensagem recebida para fora do clube.',
    });
  }
  return portas;
}

/* ── A conta do clube, como ela chega ─────────────────────────────────────── */

/**
 * A conta de e-mail do clube, do jeito que a secretaria a deixou.
 *
 * Cinco defeitos, e nenhum deles dá erro em lugar nenhum — a conta abre, as
 * mensagens chegam, e tudo funciona:
 *
 * — as duas etapas estão desligadas;
 * — três aplicativos autorizados, dois dos quais ninguém abre há mais de ano;
 * — a senha vazou num vazamento público de abril e nunca foi trocada;
 * — a recuperação vai para a caixa pessoal da secretária, que é o requisito 7
 *   aparecendo dentro da conta — e que por sua vez já consta em dois
 *   vazamentos;
 * — a privacidade está toda aberta, inclusive a localização das fotos, que num
 *   clube de crianças é o ajuste que mais custa.
 */
export const contaDoClube = (): ContaOnline => ({
  servico: 'Correio do clube',
  endereco: 'clubepioneiros@gmail.com',
  senha: 'Pioneiros2026',
  senhaTrocadaEm: '2024-02',
  duasEtapas: { ativa: false, codigos: [], codigosGuardados: false },
  aplicativos: [
    {
      id: 'formularios', nome: 'Formulários do Clube',
      escopos: ['ver-perfil', 'gerenciar-arquivos'],
      autorizadoEm: '2025-03', ultimoUso: 'ontem',
    },
    {
      id: 'fotomagica', nome: 'FotoMágica Filtros',
      escopos: ['ver-perfil', 'ler-email', 'ver-contatos', 'publicar'],
      autorizadoEm: '2024-06', ultimoUso: 'há 1 ano e 3 meses',
    },
    {
      id: 'sorteador', nome: 'Sorteador de Brindes',
      escopos: ['ler-email', 'enviar-email'],
      autorizadoEm: '2024-11', ultimoUso: 'há 1 ano',
    },
  ],
  sessoes: [
    { id: 'aqui', aparelho: 'Computador da secretaria', lugar: 'Brasília', quando: 'agora', atual: true },
    { id: 'celular-marta', aparelho: 'Celular Android', lugar: 'Brasília', quando: 'há 2 horas' },
  ],
  encaminhamentos: [],
  recuperacao: { email: 'marta.oliveira@gmail.com', telefone: '(61) 99999-2233' },
  privacidade: [
    {
      id: 'busca', nome: 'A página do clube aparece em sites de busca',
      explica: 'É por aqui que uma família que ouviu falar do clube o encontra.',
      opcoes: ['sim', 'não'], valor: 'sim', fechado: 'não',
    },
    {
      id: 'membros', nome: 'Quem pode ver a lista de membros',
      explica: 'A lista traz o nome completo de cada desbravador.',
      opcoes: ['qualquer pessoa', 'quem segue o clube', 'só a diretoria'],
      valor: 'qualquer pessoa', fechado: 'só a diretoria',
    },
    {
      id: 'telefones', nome: 'Quem pode ver os telefones cadastrados',
      explica: 'São os telefones dos pais, dados na inscrição.',
      opcoes: ['qualquer pessoa', 'quem segue o clube', 'só a diretoria'],
      valor: 'qualquer pessoa', fechado: 'só a diretoria',
    },
    {
      id: 'local', nome: 'Publicar o local junto das fotos',
      explica: 'Quem vê a foto do acampamento vê também onde ele está acontecendo.',
      opcoes: ['sim', 'não'], valor: 'sim', fechado: 'não',
    },
    {
      id: 'anuncios', nome: 'Usar o que o clube faz aqui para escolher anúncios',
      explica: 'O serviço acompanha o que a conta visita para mostrar propaganda.',
      opcoes: ['sim', 'não'], valor: 'sim', fechado: 'não',
    },
  ],
});

/** O endereço que o intruso usa. Mora aqui porque as três lições o citam. */
export const ENDERECO_DO_INTRUSO = 'recuperacao.seguranca2026@outlook.com';

/**
 * A mesma conta, depois de a mensagem fraudulenta ter funcionado.
 *
 * É de onde parte a lição do requisito 6, e ela vem logo depois da lição das
 * mensagens fraudulentas de propósito: alguém do clube clicou, digitou a senha
 * na página parecida, e a conta caiu. A partir daqui o que se mede é a
 * **ordem** das providências.
 *
 * O intruso fez o que quem invade faz, e é tudo invisível de quem só olha a
 * caixa de entrada: trocou a recuperação para o endereço dele, deixou uma
 * regra copiando toda mensagem, e autorizou um aplicativo — um crachá que
 * continua valendo depois de a senha mudar.
 */
export const contaInvadida = (): ContaOnline => {
  const c = contaDoClube();
  return {
    ...c,
    aplicativos: [
      ...c.aplicativos,
      {
        id: 'acesso-remoto', nome: 'Sincronizador de Contas',
        escopos: ['ler-email', 'enviar-email', 'ler-arquivos', 'ver-contatos'],
        autorizadoEm: 'anteontem', ultimoUso: 'há 10 minutos',
      },
    ],
    sessoes: [
      ...c.sessoes,
      {
        id: 'intruso', aparelho: 'Windows — navegador desconhecido',
        lugar: 'Fortaleza', quando: 'há 10 minutos', intruso: true,
      },
    ],
    encaminhamentos: [
      { id: 'copia', para: ENDERECO_DO_INTRUSO, criadoEm: 'anteontem', doIntruso: true },
    ],
    recuperacao: { email: ENDERECO_DO_INTRUSO, telefone: '(61) 99999-2233' },
  };
};
