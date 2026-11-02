import type { Cofre } from '../labs/cofreDeSenhas';
import type { ContaOnline, Vazamento } from '../labs/contaOnline';
import type { MensagemDoCorreio } from '../labs/golpesDoClube';

/*
 * As contas do Clube de Aventureiros Estrela Guia: o cofre, a conta e a caixa
 * de correio que as telas da CC-ES005 percorrem.
 *
 * ── Por que outro clube ──────────────────────────────────────────────────
 * O laboratório abre as contas do Clube Pioneiros (`cofreDeSenhas.ts`,
 * `contaOnline.ts`, `golpesDoClube.ts`), e quase tudo nelas é resposta de
 * alguma lição: a senha `Pioneiros2026` repetida em quatro contas, o
 * formulário no endereço pessoal da Marta, a FotoMágica que lê as mensagens,
 * o vazamento da loja de camisetas, o banco que bloqueia em 24 horas. Os
 * quadros de texto da teoria citavam isso tudo, que é pôr o gabarito na
 * teoria — a decisão da excursão de outubro da CC-ES003 e da gincana da
 * CC-ES004.
 *
 * Aqui é o clube das crianças menores da mesma igreja, com outra diretoria,
 * outras senhas, outros aplicativos, outro vazamento e outras mensagens — com
 * os mesmos tipos de defeito, porque é deles que a teoria fala.
 * `exemplosDeContas.test.ts` confere as legendas contra estas contas e
 * reprova se elas passarem a dividir um endereço, uma senha, um aplicativo ou
 * uma mensagem com as do laboratório.
 */

export const ENDERECO = 'aventureiros.estrela@gmail.com';
export const SENHA_REPETIDA = 'Estrela2025';
export const DIRETORA = 'Lúcia';
export const ENDERECO_DA_DIRETORA = 'lucia.prado@gmail.com';
export const DIRETORIA = ['Lúcia', 'Paulo', 'Débora'];
export const ENDERECO_DO_CLUBE = 'secretaria@aventureirosestrela.org';
export const ENDERECO_DO_INTRUSO = 'verificacao.conta@outlook.com';
export const NOME_DO_COFRE = 'Aventureiros Estrela Guia';

export const cofreDosAventureiros = (): Cofre => ({
  entradas: [
    {
      id: 'email', servico: 'E-mail do clube', dono: 'clube',
      usuario: ENDERECO, senha: SENHA_REPETIDA, acesso: ['Lúcia'],
    },
    {
      id: 'agenda', servico: 'Agenda das reuniões', dono: 'clube',
      usuario: ENDERECO, senha: SENHA_REPETIDA, acesso: ['Lúcia'],
    },
    {
      id: 'rede', servico: 'Página na rede social', dono: 'clube',
      usuario: '@aventureirosestrela', senha: SENHA_REPETIDA, acesso: ['Lúcia'],
    },
    {
      id: 'matricula', servico: 'Formulário de matrícula', dono: 'pessoa',
      usuario: ENDERECO_DA_DIRETORA, senha: 'lucia1987', acesso: ['Lúcia'],
    },
    {
      id: 'cantina', servico: 'Caixa da cantina', dono: 'clube',
      usuario: 'cantina.estrela', senha: 'mudar123', acesso: ['Paulo'],
    },
  ],
});

/*
  Os nomes e as explicações dos ajustes são os do programa — é a página da
  conta, e é ela que diz o que cada ajuste faz —; o que muda é como esta conta
  os deixou.
*/
export const contaDosAventureiros = (): ContaOnline => ({
  servico: 'Correio do clube',
  endereco: ENDERECO,
  senha: SENHA_REPETIDA,
  senhaTrocadaEm: '2023-09',
  duasEtapas: { ativa: false, codigos: [], codigosGuardados: false },
  aplicativos: [
    {
      id: 'agenda', nome: 'Agenda das Reuniões',
      escopos: ['ver-perfil', 'gerenciar-arquivos'],
      autorizadoEm: '2025-08', ultimoUso: 'anteontem',
    },
    {
      id: 'quiz', nome: 'Quiz Relâmpago',
      escopos: ['ver-perfil', 'ler-email', 'ver-contatos', 'publicar'],
      autorizadoEm: '2024-02', ultimoUso: 'há 2 anos',
    },
    {
      id: 'cartoes', nome: 'Cartões de Aniversário',
      escopos: ['ler-email', 'enviar-email'],
      autorizadoEm: '2025-01', ultimoUso: 'há 10 meses',
    },
  ],
  sessoes: [
    { id: 'aqui', aparelho: 'Notebook da secretaria', lugar: 'Goiânia', quando: 'agora', atual: true },
    { id: 'celular-lucia', aparelho: 'iPhone', lugar: 'Goiânia', quando: 'há 1 dia' },
  ],
  encaminhamentos: [],
  recuperacao: { email: ENDERECO_DA_DIRETORA, telefone: '(62) 98888-4411' },
  privacidade: [
    {
      id: 'busca', nome: 'A página do clube aparece em sites de busca',
      explica: 'É por aqui que uma família nova encontra o clube.',
      opcoes: ['sim', 'não'], valor: 'sim', fechado: 'não',
    },
    {
      id: 'membros', nome: 'Quem pode ver a lista de membros',
      explica: 'A lista traz o nome completo de cada criança.',
      opcoes: ['qualquer pessoa', 'quem segue o clube', 'só a diretoria'],
      valor: 'qualquer pessoa', fechado: 'só a diretoria',
    },
    {
      id: 'telefones', nome: 'Quem pode ver os telefones cadastrados',
      explica: 'São os telefones dos pais, dados na matrícula.',
      opcoes: ['qualquer pessoa', 'quem segue o clube', 'só a diretoria'],
      valor: 'quem segue o clube', fechado: 'só a diretoria',
    },
    {
      id: 'local', nome: 'Publicar o local junto das fotos',
      explica: 'Quem vê a foto do passeio vê também onde as crianças estão.',
      opcoes: ['sim', 'não'], valor: 'sim', fechado: 'não',
    },
    {
      id: 'anuncios', nome: 'Usar o que o clube faz aqui para escolher anúncios',
      explica: 'O serviço acompanha o que a conta visita para mostrar propaganda.',
      opcoes: ['sim', 'não'], valor: 'sim', fechado: 'não',
    },
  ],
});

/** A mesma conta, depois de alguém ter digitado a senha numa página falsa. */
export const contaDosAventureirosInvadida = (): ContaOnline => {
  const c = contaDosAventureiros();
  return {
    ...c,
    aplicativos: [
      ...c.aplicativos,
      {
        id: 'acesso-remoto', nome: 'Backup Automático de E-mails',
        escopos: ['ler-email', 'enviar-email', 'ver-contatos'],
        autorizadoEm: 'ontem', ultimoUso: 'há 5 minutos',
      },
    ],
    sessoes: [
      ...c.sessoes,
      {
        id: 'intruso', aparelho: 'Linux — navegador desconhecido',
        lugar: 'Manaus', quando: 'há 5 minutos', intruso: true,
      },
    ],
    encaminhamentos: [
      { id: 'copia', para: ENDERECO_DO_INTRUSO, criadoEm: 'ontem', doIntruso: true },
    ],
    recuperacao: { email: ENDERECO_DO_INTRUSO, telefone: '(62) 98888-4411' },
  };
};

/** As listas públicas que a consulta de vazamento lê, nesta conta. */
export const VAZAMENTOS_DO_EXEMPLO: Vazamento[] = [
  {
    servico: 'Papelaria Online',
    quando: '2026-03',
    oQueVazou: ['endereço de e-mail', 'senha'],
    enderecos: [ENDERECO],
  },
  {
    servico: 'Site de Receitas',
    quando: '2021-05',
    oQueVazou: ['endereço de e-mail'],
    enderecos: [ENDERECO_DA_DIRETORA],
  },
];

/*
  Três golpes e duas verdadeiras, pela razão escrita em `golpesDoClube.ts`:
  sem mensagem verdadeira, "denuncie tudo" seria a resposta certa. As duas
  verdadeiras derrubam as mesmas regras erradas — uma tem prazo e não é golpe,
  a outra tem link e o link vai para onde diz.
*/
export const CAIXA_DOS_AVENTUREIROS: MensagemDoCorreio[] = [
  {
    id: 'entrega',
    deNome: 'Correios',
    de: 'rastreio@correios-entregas-br.net',
    assunto: 'Sua encomenda está retida: pague a taxa até hoje',
    quando: 'hoje, 09:42',
    corpo: 'Prezado cliente,\n\n'
      + 'Sua encomenda está retida no centro de distribuição. Se a taxa de '
      + 'liberação não for paga hoje, ela volta ao remetente.\n\n'
      + 'Pague agora:',
    links: [{ texto: 'correios.com.br/rastreio', para: 'http://correios-entregas-br.net/taxa' }],
    indicios: ['dominio', 'urgencia', 'saudacao-generica', 'link-disfarcado'],
  },
  {
    id: 'sorteio',
    deNome: 'Promoção Brinquedos',
    de: 'premios@sorteio-oficial.club',
    assunto: 'Seu clube ganhou um kit de brinquedos',
    quando: 'ontem, 14:20',
    corpo: 'Parabens! O seu clube foi sorteado e ganhou um kit de brinquedos. '
      + 'Abra o comprovante em anexo para resgatar o premio.',
    anexos: ['comprovante-premio.pdf.exe'],
    indicios: ['dominio', 'anexo-inesperado', 'erro-de-escrita', 'saudacao-generica'],
  },
  {
    id: 'associacao',
    deNome: 'Associação dos Clubes',
    de: 'atualizacao@associacao-clubes-cadastro.online',
    assunto: 'Atualize o cadastro do clube',
    quando: 'ontem, 10:05',
    corpo: 'Prezado diretor,\n\n'
      + 'Estamos atualizando o cadastro dos clubes. Responda esta mensagem com o '
      + 'e-mail e a senha que o clube usa no sistema, para não perder o acesso.',
    indicios: ['dominio', 'saudacao-generica', 'pede-senha'],
  },
  {
    id: 'lucia',
    deNome: 'Lúcia Prado',
    de: ENDERECO_DA_DIRETORA,
    assunto: 'Lanche do passeio',
    quando: 'segunda, 19:10',
    corpo: 'Oi! Quem for levar lanche no passeio do sábado, me avisa até quinta, '
      + 'para eu fechar a lista da cantina. Obrigada!',
    indicios: [],
  },
  {
    id: 'agenda',
    deNome: 'Agenda das Reuniões',
    de: 'avisos@agendadasreunioes.com',
    assunto: 'Sua agenda tem três reuniões nesta semana',
    quando: 'domingo, 08:00',
    corpo: 'Olá, Clube de Aventureiros Estrela Guia. Estas são as reuniões desta '
      + 'semana. Para ver os detalhes, abra a agenda:',
    links: [{ texto: 'agendadasreunioes.com/semana', para: 'https://agendadasreunioes.com/semana' }],
    indicios: [],
  },
];
