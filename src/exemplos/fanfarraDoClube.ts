import {
  type Caixa, type Contato, type Mensagem,
  AUSENCIA_DESLIGADA, DIRECAO, DOMINIO, VOCE,
} from '../labs/correspondencia';
import {
  type Agenda, type Evento, type PessoaNaAgenda,
  CALENDARIO_DO_CLUBE, FUSO_DE_BRASILIA, FUSO_DO_ACRE, MINHA_AGENDA,
} from '../labs/agenda';
import type { Reuniao } from '../labs/reuniaoRemota';
import type { ContextoDaComunicacao } from '../labs/metasDaCcEs007';
import type { OutraComunicacao } from '../components/LaboratorioDeComunicacao';

/*
 * A fanfarra do clube: a caixa, a agenda e a sala que as telas da CC-ES007
 * percorrem.
 *
 * ── Por que outra coisa ──────────────────────────────────────────────────
 * O laboratório abre o correio, a agenda e a sala da secretaria preparando o
 * Acampamento de Inverno (`correspondencia.ts`, `agenda.ts`,
 * `reuniaoRemota.ts`), e quase tudo ali é resposta de alguma lição: as
 * cinquenta e duas famílias que vão para o Cco, o Daniel que saiu da lista do
 * Falcão e a Helena que entrou, a reunião regional com o Acre às 15h, o
 * endereço do Tio Samuel com uma letra a menos, o Tio Márcio que não
 * compartilha a agenda, o sábado do acampamento a desmarcar. Os quadros de
 * texto da teoria citavam isso tudo, que é pôr o gabarito na teoria — a
 * decisão da gincana da CC-ES004 e dos Aventureiros da CC-ES005.
 *
 * Aqui é a mesma secretaria cuidando de outra frente, a fanfarra: outras
 * mensagens, outra lista, outros eventos, outras pessoas e outra sala. O que
 * continua igual é o programa — o endereço da secretaria, o domínio, a mesa
 * —, porque é ele que a pessoa vai reencontrar no laboratório.
 * `exemplosDaComunicacao.test.ts` confere as legendas contra estes dados e
 * reprova se eles passarem a dividir uma mensagem, uma pessoa, um evento ou
 * um endereço com os do laboratório.
 */

export const REGENTE: Contato = { id: 'valter', nome: 'Tio Válter (regente)', endereco: 'valter.regente@exemplo.com' };
export const COORDENADORA: Contato = { id: 'denise', nome: 'Tia Denise (fanfarra)', endereco: 'denise.fanfarra@exemplo.com' };

/** A fanfarra: o Caio saiu em maio, e a Lívia entrou em junho. */
export const MUSICOS: Contato[] = [
  { id: 'bianca', nome: 'Bianca Lopes', endereco: 'bianca.lopes@exemplo.com' },
  { id: 'caio', nome: 'Caio Mendes', endereco: 'caio.mendes@exemplo.com' },
  { id: 'livia', nome: 'Lívia Torres', endereco: 'livia.torres@exemplo.com' },
  { id: 'mateus', nome: 'Mateus Faria', endereco: 'mateus.faria@exemplo.com' },
  { id: 'otavio', nome: 'Otávio Reis', endereco: 'otavio.reis@exemplo.com' },
];
export const NA_LISTA = ['bianca', 'caio', 'mateus', 'otavio'];
export const NA_FANFARRA = ['bianca', 'livia', 'mateus', 'otavio'];

/** Os clubes da região: não se conhecem, e nunca combinaram trocar endereço. */
export const CLUBES_DA_REGIAO: string[] = Array.from({ length: 24 }, (_, i) =>
  `secretaria@clube${String(i + 1).padStart(2, '0')}.exemplo.org`);

export const ARQUIVO_GRANDE = { nome: 'gravacao-do-ensaio.mp4', mb: 240 };
export const ENDERECO_ERRADO = 'otavio.reis@exemplo.co';
export const PALAVRA_DA_BUSCA = 'violão';

const msg = (m: Partial<Mensagem> & Pick<Mensagem, 'id' | 'de' | 'deNome' | 'assunto' | 'corpo' | 'quando'>): Mensagem => ({
  para: [VOCE], cc: [], cco: [], anexos: [], vinculos: [], assinada: true,
  pasta: 'entrada', lida: false, ...m,
});

/*
  Duas que pedem alguma coisa e duas que não pedem, e uma arquivada com a
  palavra que a busca procura — o arranjo da caixa do laboratório, com outras
  mensagens.
*/
export const MENSAGENS_DA_FANFARRA: Mensagem[] = [
  msg({
    id: 'encontro', de: CLUBES_DA_REGIAO[0], deNome: 'Clube Sabiá',
    cc: CLUBES_DA_REGIAO.slice(1),
    assunto: 'Convite: Encontro de Fanfarras da Região',
    corpo: 'Olá, clubes! O Encontro de Fanfarras será no dia 22 de agosto, na praça central. '
      + 'Confirmem a presença respondendo a esta mensagem.',
    quando: 'seg, 10:12',
  }),
  msg({
    id: 'instrumentos', de: REGENTE.endereco, deNome: REGENTE.nome,
    assunto: 'Lista de instrumentos do desfile — até sexta',
    corpo: 'Preciso da lista de quem toca cada instrumento até sexta, para pedir as partituras.',
    quando: 'ter, 08:40',
  }),
  msg({
    id: 'tuba', de: COORDENADORA.endereco, deNome: COORDENADORA.nome,
    assunto: 'Conserto da tuba — orçamento para aprovar',
    corpo: 'O conserto da tuba ficou em 180 reais. Você aprova até quinta?',
    quando: 'ter, 19:05',
  }),
  msg({
    id: 'baquetas', de: COORDENADORA.endereco, deNome: COORDENADORA.nome,
    assunto: 'Baquetas novas',
    corpo: 'Recebi as baquetas novas. Obrigada!',
    quando: 'qua, 07:30',
  }),
  msg({
    id: 'horarios-julho', de: REGENTE.endereco, deNome: REGENTE.nome,
    assunto: 'Horário dos ensaios de julho no mural',
    corpo: 'Os horários de julho já estão no mural da sala de música.',
    quando: 'qua, 12:15',
  }),
  msg({
    id: 'violao', de: COORDENADORA.endereco, deNome: COORDENADORA.nome,
    assunto: 'Empréstimo do violão',
    corpo: 'O violão da secretaria ficou com o Mateus até o fim do mês.',
    quando: '12 de maio', pasta: 'arquivadas', lida: true,
  }),
];

export const caixaDaFanfarra = (): Caixa => ({
  mensagens: MENSAGENS_DA_FANFARRA.map(m => ({ ...m })),
  contatos: [...DIRECAO, REGENTE, COORDENADORA, ...MUSICOS],
  listas: [{
    id: 'fanfarra', nome: 'Fanfarra', endereco: `fanfarra@${DOMINIO}`,
    membros: [...NA_LISTA],
  }],
  assinatura: '',
  ausencia: AUSENCIA_DESLIGADA(),
});

/* ── A agenda ─────────────────────────────────────────────────────────────── */

export const ENSAIO_GERAL = 'ensaio-geral';
export const ENSAIO_SEMANAL = 'ensaio-semanal';
export const CONVERSA_COM_O_ACRE = 'rio-branco';

const evento = (e: Partial<Evento> & Pick<Evento, 'id' | 'titulo' | 'dia' | 'inicio' | 'fim'>): Evento => ({
  local: '', descricao: '', fuso: FUSO_DE_BRASILIA, calendario: CALENDARIO_DO_CLUBE,
  convidados: [], ...e,
});

export const agendaDaFanfarra = (): Agenda => ({
  fuso: FUSO_DE_BRASILIA,
  calendarios: [
    { id: CALENDARIO_DO_CLUBE, nome: 'Fanfarra do clube', dono: 'voce', acessos: [], publico: false },
    { id: MINHA_AGENDA, nome: 'Minha agenda', dono: 'voce', acessos: [], publico: false },
  ],
  eventos: [
    evento({
      id: ENSAIO_GERAL, titulo: 'Ensaio geral do desfile',
      local: 'Quadra da escola',
      descricao: 'Ensaio com uniforme completo. Trazer o instrumento afinado e garrafa de água.',
      dia: '2026-07-08', inicio: '19:00', fim: '21:00',
      convidados: [
        { endereco: REGENTE.endereco, resposta: 'sim' },
        { endereco: 'bianca.lopes@exemplo.com', resposta: 'sim' },
        { endereco: 'mateus.faria@exemplo.com', resposta: 'nao' },
        { endereco: 'livia.torres@exemplo.com', resposta: 'talvez' },
        { endereco: COORDENADORA.endereco, resposta: 'aguardando' },
        /* Uma letra a menos no fim: na tela é "aguardando", igual à Tia Denise,
           que recebeu e ainda não decidiu. */
        { endereco: ENDERECO_ERRADO, resposta: 'aguardando', naoChegou: true },
      ],
    }),
    evento({
      id: ENSAIO_SEMANAL, titulo: 'Ensaio da fanfarra',
      local: 'Sala de música',
      descricao: 'Ensaio semanal de todos os naipes.',
      dia: '2026-06-24', inicio: '19:30', fim: '21:00',
      repete: { cada: 'semana', ate: '2026-11-25', pulados: [] },
    }),
    evento({
      id: CONVERSA_COM_O_ACRE, titulo: 'Conversa com a fanfarra de Rio Branco',
      local: 'Reunião a distância',
      descricao: 'Combinar o repertório do Encontro de Fanfarras com o regente de Rio Branco.',
      dia: '2026-07-15', inicio: '10:00', fim: '11:00', fuso: FUSO_DO_ACRE,
    }),
  ],
});

/** A grade do dia do ensaio extra: três compartilham a agenda e um não. */
export const PESSOAS_DA_GRADE: PessoaNaAgenda[] = [
  { endereco: REGENTE.endereco, nome: REGENTE.nome, compartilha: true,
    ocupado: [{ dia: '2026-07-10', inicio: '19:00', fim: '20:30' }] },
  { endereco: COORDENADORA.endereco, nome: COORDENADORA.nome, compartilha: true,
    ocupado: [{ dia: '2026-07-10', inicio: '08:00', fim: '10:00' }] },
  { endereco: 'bianca.lopes@exemplo.com', nome: 'Bianca Lopes', compartilha: true,
    ocupado: [{ dia: '2026-07-10', inicio: '14:00', fim: '16:00' }] },
  { endereco: 'otavio.reis@exemplo.com', nome: 'Otávio Reis', compartilha: false, ocupado: [] },
];
export const DIA_DA_GRADE = '2026-07-10';
export const OTAVIO_SO_DEPOIS_DE = '18:00';

/* ── A sala ───────────────────────────────────────────────────────────────── */

export const PARTITURAS = 'Partituras do desfile — PDF';
export const CONVERSA = 'Mensagens';
export const GRAVACAO = 'Gravação do ensaio — navegador';
export const NOTIFICACAO_DA_TUBA = {
  de: COORDENADORA.nome,
  texto: 'A família do Mateus pediu para pagar o conserto da tuba em duas vezes. Pode?',
};

export const salaDaFanfarra = (): Reuniao => ({
  link: 'https://reuniao.exemplo.com/fanfarra-ensaio',
  quemEntra: 'so-do-clube',
  naSala: false,
  seuMicrofone: false,
  suaCamera: false,
  participantes: [
    { endereco: REGENTE.endereco, nome: REGENTE.nome, estado: 'na-sala', microfone: true },
    { endereco: COORDENADORA.endereco, nome: COORDENADORA.nome, estado: 'na-sala', microfone: false },
    { endereco: 'bianca.lopes@exemplo.com', nome: 'Bianca Lopes', estado: 'na-espera', microfone: false },
    { endereco: 'otavio.reis@exemplo.com', nome: 'Otávio Reis', estado: 'fora', microfone: false },
  ],
  apresentacoes: [],
  emFoco: PARTITURAS,
  notificacoes: [NOTIFICACAO_DA_TUBA],
  falas: [],
});

export const contextoDaFanfarra = (): ContextoDaComunicacao => {
  const caixa = caixaDaFanfarra();
  return { caixa, caixaAntes: caixa, agenda: agendaDaFanfarra(), reuniao: salaDaFanfarra(), descobertas: [] };
};

export const FANFARRA: OutraComunicacao = {
  inicial: contextoDaFanfarra,
  grupos: [
    { nome: 'os clubes da região', enderecos: CLUBES_DA_REGIAO },
    { nome: 'a fanfarra', enderecos: MUSICOS.filter(m => NA_FANFARRA.includes(m.id)).map(m => m.endereco) },
  ],
  membrosDasListas: MUSICOS,
  arquivoGrande: ARQUIVO_GRANDE,
  convidaveis: [REGENTE, COORDENADORA, ...MUSICOS],
  grade: { pessoas: PESSOAS_DA_GRADE, dia: DIA_DA_GRADE, soDepoisDe: OTAVIO_SO_DEPOIS_DE },
  correcoes: { [ENDERECO_ERRADO]: 'otavio.reis@exemplo.com' },
  sala: { nome: 'Sala da fanfarra', eventoId: ENSAIO_GERAL, janelas: [PARTITURAS, CONVERSA], guias: [GRAVACAO] },
};
