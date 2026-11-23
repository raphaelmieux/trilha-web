/**
 * As duas lições da CC-FE007 que nenhum programa tem onde guardar: a proposta
 * e o roteiro da apresentação.
 *
 * ── Por que são tela da plataforma ───────────────────────────────────────
 * Os requisitos 3, 4, 5 e 6 acontecem em programas — o projeto do Vite, o
 * site do repositório, o terminal —, e as lições deles abrem nos laboratórios
 * de React, de publicação e de terminal. Os requisitos 2 e 7 não: uma
 * proposta e uma apresentação se escrevem para uma pessoa. É a regra do
 * caderno da CC006, pelo motivo escrito lá.
 *
 * ── O projeto é a agenda do clube ────────────────────────────────────────
 * A mesma aplicação das lições de React: os eventos, a tela de cada evento e
 * os feriados do ano. A proposta é a dela, e o roteiro mostra ela rodando.
 *
 * ── O mapa de telas e o rascunho são desenho, e se conferem como desenho ─
 * O requisito pede "mapa de telas e rascunho da interface". O mapa diz quais
 * telas existem e para onde cada uma leva; o rascunho diz o que vai em cada
 * uma, de cima para baixo, em blocos — é o *wireframe* que se faz no papel
 * antes de qualquer código. A plataforma não confere gosto: confere que o
 * mapa se percorre inteiro a partir da primeira tela, e que o rascunho de
 * cada uma tem o caminho para as telas a que ela leva.
 */

import { palavrasDe, publicoDefinido } from './projetoDeDesign';

export type LicaoDoCadernoDaCcFe007 = 'proposta' | 'apresentacao';

/* ── A proposta, que é o requisito 2 ──────────────────────────────────────── */

/** O dia em que o examinador aprova: véspera do primeiro commit da agenda, que é de 2 de novembro. */
export const HOJE_DA_PROPOSTA_DA_AGENDA = '2026-11-01';

/** Os blocos de que se monta o rascunho de uma tela, como no papel. */
export const BLOCOS_DO_RASCUNHO = [
  { id: 'cabecalho', nome: 'Cabeçalho com o nome', leva: false },
  { id: 'menu', nome: 'Menu com links', leva: true },
  { id: 'titulo', nome: 'Título da tela', leva: false },
  { id: 'texto', nome: 'Texto', leva: false },
  { id: 'lista', nome: 'Lista de cartões', leva: true },
  { id: 'botao', nome: 'Botão', leva: true },
  { id: 'imagem', nome: 'Imagem', leva: false },
  { id: 'campo', nome: 'Campo de busca', leva: false },
  { id: 'carregando', nome: 'Aviso de "carregando"', leva: false },
  { id: 'erro', nome: 'Mensagem de erro', leva: false },
] as const;

export type BlocoDoRascunho = (typeof BLOCOS_DO_RASCUNHO)[number]['id'];

/** O bloco é um caminho para outra tela: é por ele que o mapa vira interface. */
export const blocoLeva = (b: BlocoDoRascunho) => BLOCOS_DO_RASCUNHO.find(x => x.id === b)!.leva;

export interface TelaDoMapa {
  id: string;
  nome: string;
  /** O que a tela mostra, numa frase. */
  mostra: string;
  /** Os ids das telas a que ela leva. */
  leva: string[];
  /** O rascunho, de cima para baixo. */
  rascunho: BlocoDoRascunho[];
}

export interface PropostaDeInterface {
  objetivo: string;
  publico: string;
  telas: TelaDoMapa[];
  aprovadaEm: string | null;
  devolvida: string | null;
}

export const PROPOSTA_DE_INTERFACE_EM_BRANCO: PropostaDeInterface = {
  objetivo: '', publico: '', telas: [], aprovadaEm: null, devolvida: null,
};

export const PALAVRAS_DO_OBJETIVO = 12;
export const PALAVRAS_DO_QUE_A_TELA_MOSTRA = 4;
export const MINIMO_DE_TELAS = 3;
export const MINIMO_DE_BLOCOS = 3;

export const telasDescritas = (p: PropostaDeInterface) =>
  p.telas.filter(t => t.nome.trim() !== '' && palavrasDe(t.mostra).length >= PALAVRAS_DO_QUE_A_TELA_MOSTRA);

/**
 * As telas que se alcançam a partir da primeira, seguindo as setas.
 *
 * É o que faz um mapa ser mapa: três telas soltas, sem ligação nenhuma, são
 * três páginas que ninguém acha. A primeira tela é a de entrada — é por ela
 * que o link público abre.
 */
export function telasAlcancaveis(p: PropostaDeInterface): Set<string> {
  const vistas = new Set<string>();
  const fila = p.telas.length ? [p.telas[0].id] : [];
  while (fila.length) {
    const id = fila.shift()!;
    if (vistas.has(id)) continue;
    vistas.add(id);
    p.telas.find(t => t.id === id)?.leva.forEach(x => fila.push(x));
  }
  return vistas;
}

export const telasSoltas = (p: PropostaDeInterface) => {
  const alcancadas = telasAlcancaveis(p);
  return p.telas.filter(t => !alcancadas.has(t.id));
};

/**
 * A tela que leva a outra precisa ter no rascunho um bloco que leve — um
 * menu, uma lista de cartões, um botão. Sem ele, a seta do mapa promete um
 * caminho que a tela desenhada não tem, e é na hora de programar que alguém
 * descobre que não há onde clicar.
 */
export const rascunhoSemCaminho = (p: PropostaDeInterface) =>
  p.telas.filter(t => t.leva.length > 0 && !t.rascunho.some(blocoLeva));

export const rascunhoCurto = (p: PropostaDeInterface) => p.telas.filter(t => t.rascunho.length < MINIMO_DE_BLOCOS);

/** O que falta na proposta, nas palavras de quem a devolve. Vazio é completa. */
export function faltasDaPropostaDeInterface(p: PropostaDeInterface): string[] {
  const faltas: string[] = [];
  if (palavrasDe(p.objetivo).length < PALAVRAS_DO_OBJETIVO) faltas.push('O objetivo precisa dizer o que a aplicação resolve, e para quê.');
  if (!publicoDefinido(p.publico)) faltas.push('O público precisa ser gente de verdade, e não "todo mundo".');
  if (telasDescritas(p).length < MINIMO_DE_TELAS) faltas.push(`O mapa precisa de pelo menos ${MINIMO_DE_TELAS} telas, cada uma dizendo o que mostra.`);
  else if (telasSoltas(p).length) faltas.push(`Não há caminho até ${telasSoltas(p).map(t => t.nome).join(', ')} a partir da primeira tela.`);
  if (p.telas.length && (rascunhoCurto(p).length || rascunhoSemCaminho(p).length)) {
    faltas.push('O rascunho de cada tela precisa mostrar o que vai nela, e o caminho para as telas a que ela leva.');
  }
  return faltas;
}

export function enviarPropostaDeInterface(p: PropostaDeInterface, hoje: string): PropostaDeInterface {
  const faltas = faltasDaPropostaDeInterface(p);
  if (faltas.length) return { ...p, devolvida: faltas.join(' ') };
  return { ...p, aprovadaEm: p.aprovadaEm ?? hoje, devolvida: null };
}

/* ── A apresentação, que é o requisito 7 ──────────────────────────────────── */

export type ParteDaApresentacaoDaAgenda = 'objetivo' | 'celular' | 'decisoes' | 'perguntas';

export const PARTES_DA_APRESENTACAO_DA_AGENDA: { id: ParteDaApresentacaoDaAgenda; nome: string; obrigatoria: boolean }[] = [
  { id: 'objetivo', nome: 'O objetivo e quem usa', obrigatoria: true },
  { id: 'celular', nome: 'A agenda funcionando no celular', obrigatoria: true },
  { id: 'decisoes', nome: 'As decisões de interface', obrigatoria: true },
  { id: 'perguntas', nome: 'Perguntas do examinador', obrigatoria: false },
];

export const MINUTOS_DA_APRESENTACAO_DA_AGENDA = 15;

export type RoteiroDaAgenda = Partial<Record<ParteDaApresentacaoDaAgenda, number>>;

export const minutosDoRoteiroDaAgenda = (r: RoteiroDaAgenda) =>
  Object.values(r).reduce<number>((s, m) => s + (m ?? 0), 0);

export const roteiroCabe = (r: RoteiroDaAgenda) =>
  minutosDoRoteiroDaAgenda(r) <= MINUTOS_DA_APRESENTACAO_DA_AGENDA
  && PARTES_DA_APRESENTACAO_DA_AGENDA.every(p => !p.obrigatoria || (r[p.id] ?? 0) > 0);

/** O celular leva a maior fatia: é a parte que o requisito torna obrigatória. */
export const celularNoCentro = (r: RoteiroDaAgenda) =>
  (r.celular ?? 0) > 0
  && PARTES_DA_APRESENTACAO_DA_AGENDA.every(p => p.id === 'celular' || (r[p.id] ?? 0) <= (r.celular ?? 0));

/**
 * O que se mostra no celular. Cada item é uma das peças do requisito 3 vista
 * de verdade: o link público, as três telas, a lista que vira uma coluna, e o
 * erro — que só aparece se alguém o provoca, e por isso se planeja.
 */
export const NO_CELULAR = [
  { id: 'link', nome: 'Abrir pelo link público, digitado ou lido no QR code' },
  { id: 'telas', nome: 'Andar pelas três telas, e voltar pelo menu' },
  { id: 'coluna', nome: 'Mostrar a lista em uma coluna, sem rolar de lado' },
  { id: 'erro', nome: 'Ligar o modo avião nos feriados, ver o erro, e tentar de novo' },
] as const;

export type NoCelular = (typeof NO_CELULAR)[number]['id'];

/**
 * Onde a agenda vai aparecer como celular. O requisito diz "aparelho celular
 * real", e as outras duas opções são as que todo mundo pensa primeiro: a
 * janela do navegador estreitada no computador e as capturas de tela. As
 * duas parecem um celular e não são: nenhuma tem o dedo, o teclado que sobe
 * por cima da tela, a internet do aparelho.
 */
export const APARELHOS = [
  { id: 'real', nome: 'Um celular de verdade, com o link aberto nele' },
  { id: 'janela', nome: 'O navegador do computador, no modo celular' },
  { id: 'capturas', nome: 'Capturas de tela tiradas antes' },
] as const;

export type Aparelho = (typeof APARELHOS)[number]['id'];

export const PALAVRAS_DO_PLANO_B = 8;

export interface ContextoDaCcFe007Caderno {
  proposta: PropostaDeInterface;
  /** Começou a programar antes de a proposta voltar aprovada — o campo da CC006. */
  comecouAntes: boolean;
  roteiro: RoteiroDaAgenda;
  noCelular: NoCelular[];
  aparelho: Aparelho | null;
  /** O que fazer se a internet da sala não funcionar na hora. */
  planoB: string;
}

export const contextoDoCadernoDaCcFe007 = (): ContextoDaCcFe007Caderno => ({
  proposta: PROPOSTA_DE_INTERFACE_EM_BRANCO,
  comecouAntes: false,
  roteiro: {},
  noCelular: [],
  aparelho: null,
  planoB: '',
});

export interface MetaDoCadernoDaCcFe007 {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDaCcFe007Caderno) => boolean;
}

const METAS: Record<LicaoDoCadernoDaCcFe007, MetaDoCadernoDaCcFe007[]> = {
  proposta: [
    {
      id: 'objetivo-e-publico',
      titulo: 'Dizer o objetivo e o público',
      detalhe: 'O que a agenda resolve, e quem vai abri-la.',
      onde: 'Na proposta',
      passos: [
        'No objetivo, conte o que acontece hoje — o aviso do acampamento que se perde no grupo de mensagens — e o que a agenda muda.',
        `Escreva pelo menos ${PALAVRAS_DO_OBJETIVO} palavras.`,
        'No público, diga quem é: os desbravadores e as famílias do clube. "Todo mundo" não vale.',
      ],
      feita: c => palavrasDe(c.proposta.objetivo).length >= PALAVRAS_DO_OBJETIVO && publicoDefinido(c.proposta.publico),
    },
    {
      id: 'mapa-de-telas',
      titulo: 'Desenhar o mapa de telas',
      detalhe: `Pelo menos ${MINIMO_DE_TELAS} telas, o que cada uma mostra, e para onde cada uma leva.`,
      onde: 'No mapa de telas',
      passos: [
        'Acrescente uma tela por vez: o nome dela e, numa frase, o que ela mostra.',
        'A primeira tela é a de entrada: é ela que abre pelo link.',
        'Em cada tela, marque as telas a que ela leva. Toda tela precisa ter um caminho a partir da primeira.',
      ],
      feita: c => telasDescritas(c.proposta).length >= MINIMO_DE_TELAS && telasSoltas(c.proposta).length === 0,
    },
    {
      id: 'rascunho',
      titulo: 'Rascunhar cada tela',
      detalhe: 'O que vai em cada tela, de cima para baixo — e o caminho para as telas a que ela leva.',
      onde: 'No rascunho',
      passos: [
        `Em cada tela, acrescente pelo menos ${MINIMO_DE_BLOCOS} blocos, na ordem em que aparecem.`,
        'Se a tela leva a outra, ponha o que leva: um menu, uma lista de cartões, um botão.',
        'A tela que busca dados de fora mostra alguma coisa enquanto espera e quando falha: o aviso de "carregando" e a mensagem de erro.',
      ],
      feita: c => c.proposta.telas.length >= MINIMO_DE_TELAS && rascunhoCurto(c.proposta).length === 0 && rascunhoSemCaminho(c.proposta).length === 0
        && c.proposta.telas.some(t => t.rascunho.includes('erro')),
    },
    {
      id: 'aprovada-antes',
      titulo: 'Ter a proposta aprovada antes de programar',
      detalhe: 'O requisito diz que a execução não pode começar antes da aprovação.',
      onde: 'Na proposta',
      passos: [
        'Clique em Enviar para aprovação.',
        'Se ela voltar, leia o que falta, complete e envie de novo.',
        'Só depois de aprovada, clique em Começar a programar.',
      ],
      feita: c => c.proposta.aprovadaEm !== null && !c.comecouAntes,
    },
  ],
  apresentacao: [
    {
      id: 'cabe-em-quinze',
      titulo: 'Montar um roteiro que cabe em quinze minutos',
      detalhe: 'O objetivo, a agenda no celular e as decisões de interface, com os minutos de cada parte.',
      onde: 'No roteiro',
      passos: [
        'Dê minutos a cada parte do roteiro.',
        'As três primeiras precisam de algum tempo; as perguntas podem ficar no que sobrar.',
        `A soma não passa de ${MINUTOS_DA_APRESENTACAO_DA_AGENDA}.`,
      ],
      feita: c => roteiroCabe(c.roteiro),
    },
    {
      id: 'celular-no-centro',
      titulo: 'Dar ao celular a maior parte',
      detalhe: 'O requisito torna obrigatório mostrar a agenda funcionando num celular.',
      onde: 'No roteiro',
      passos: [
        'Nenhuma parte pode ter mais minutos que a agenda no celular.',
        'Se as decisões estão tomando tempo demais, conte cada uma em uma frase e mostre a tela em que ela aparece.',
      ],
      feita: c => celularNoCentro(c.roteiro),
    },
    {
      id: 'o-que-mostrar',
      titulo: 'Planejar o que mostrar no celular',
      detalhe: 'O link, as três telas, a lista em uma coluna e o erro que a tela mostra.',
      onde: 'No roteiro',
      passos: [
        'Marque o que você vai fazer na frente do examinador.',
        'O erro só aparece se alguém o provoca: o modo avião na tela dos feriados é o jeito mais rápido.',
      ],
      feita: c => NO_CELULAR.every(x => c.noCelular.includes(x.id)),
    },
    {
      id: 'aparelho-real',
      titulo: 'Mostrar num celular de verdade, com um plano se a internet falhar',
      detalhe: 'A janela estreitada e as capturas parecem um celular, e o requisito pede o aparelho.',
      onde: 'No roteiro',
      passos: [
        'Escolha o celular de verdade.',
        'Escreva o que fazer se a internet da sala não funcionar: os dados do celular, a rede de outra pessoa.',
        'Capturas de tela não são plano B: elas mostram uma agenda que não roda.',
      ],
      feita: c => c.aparelho === 'real' && palavrasDe(c.planoB).length >= PALAVRAS_DO_PLANO_B && !/captura|print|foto da tela/i.test(c.planoB),
    },
  ],
};

export const metasDoCadernoDaCcFe007 = (licao: LicaoDoCadernoDaCcFe007) => METAS[licao];

/** A proposta como a solução de referência a escreve: a agenda das lições de React. */
export const PROPOSTA_DA_AGENDA: PropostaDeInterface = {
  objetivo: 'Os avisos dos eventos do clube se perdem no grupo de mensagens. A agenda junta os próximos eventos e os feriados num endereço só, que abre no celular.',
  publico: 'Os desbravadores e as famílias do Clube Pioneiros',
  telas: [
    { id: 't1', nome: 'Eventos', mostra: 'A lista dos próximos eventos do clube', leva: ['t2', 't3'], rascunho: ['cabecalho', 'menu', 'titulo', 'lista'] },
    { id: 't2', nome: 'Evento', mostra: 'A data, o local e a descrição de um evento', leva: ['t1'], rascunho: ['cabecalho', 'menu', 'titulo', 'texto', 'lista'] },
    { id: 't3', nome: 'Feriados', mostra: 'Os feriados nacionais do ano, vindos da BrasilAPI', leva: ['t1'], rascunho: ['cabecalho', 'menu', 'titulo', 'carregando', 'erro', 'lista'] },
  ],
  aprovadaEm: null,
  devolvida: null,
};
