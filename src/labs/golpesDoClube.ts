/**
 * A caixa de entrada do clube, com as mensagens do requisito 5.
 *
 * "Analisar três mensagens fraudulentas reais e apontar, em cada uma, os
 * indícios que a denunciam." Três coisas saem daí, e nenhuma é opcional:
 *
 * ── Os indícios são diferentes em cada uma ──────────────────────────────
 * Se as três tivessem o mesmo conjunto, marcar tudo em todas passaria, e a
 * lição mediria ter clicado em todos os botões. Elas têm três, três e três
 * indícios, e só **um** aparece nas três — o domínio de quem mandou.
 *
 * ── E há mensagem verdadeira na caixa ───────────────────────────────────
 * Duas, e é o mesmo motivo do Aceitar Todas que não fecha a tarefa: sem elas,
 * "denuncie tudo" seria a resposta certa, e o que a lição ensinaria é
 * desconfiar de toda mensagem — que é inútil, porque ninguém consegue viver
 * assim e todo mundo volta a clicar em tudo na semana seguinte.
 *
 * As duas verdadeiras foram escolhidas para derrubar as duas regras erradas
 * que alguém aprenderia depressa aqui:
 *
 * — a da Marta **tem prazo** ("me avisa antes de sexta") e não é golpe, porque
 *   prazo não é o indício: o indício é a **ameaça** junto do prazo;
 * — a do provedor **tem link** e não é golpe, porque link não é o indício: o
 *   indício é o link cujo texto discorda do destino.
 *
 * ── E o que denuncia cada uma está na tela ──────────────────────────────
 * O endereço inteiro de quem mandou, o destino de verdade do link na barra de
 * baixo, o anexo com o nome completo. Nenhum indício desta lista se conhece de
 * fora da mensagem — senão o requisito 5 pediria para apontar o que não está à
 * vista.
 */

import type { LinkDaMensagem } from './correio';

/* ── O que denuncia uma mensagem ──────────────────────────────────────────── */

export type Indicio =
  | 'dominio' | 'urgencia' | 'saudacao-generica' | 'link-disfarcado'
  | 'anexo-inesperado' | 'pede-senha' | 'erro-de-escrita';

/**
 * Os sete indícios, com o que cada um é.
 *
 * A explicação diz **o que procurar**, e nunca em qual mensagem está: escrever
 * "o Banco do Brasil não manda de bb-atendimento" poria o gabarito no painel.
 */
export const INDICIOS: Record<Indicio, { nome: string; explica: string }> = {
  dominio: {
    nome: 'O endereço de quem mandou',
    explica: 'O nome que aparece é livre — qualquer um escreve o que quiser ali. '
      + 'O que não se falsifica é o endereço depois do @.',
  },
  urgencia: {
    nome: 'Prazo curto com ameaça',
    explica: 'Prazo sozinho não é indício: gente marca reunião. O indício é o prazo '
      + 'com uma perda anunciada junto, para você agir antes de pensar.',
  },
  'saudacao-generica': {
    nome: 'Não sabe o seu nome',
    explica: '"Prezado cliente", "Caro usuário". Quem tem conta com você sabe como '
      + 'você se chama; quem mandou para dez mil endereços de uma vez, não.',
  },
  'link-disfarcado': {
    nome: 'O link vai para outro lugar',
    explica: 'Link não é indício — quase toda mensagem tem um. O indício é o texto do '
      + 'link dizer um endereço e o destino ser outro. Pare o ponteiro em cima e leia embaixo.',
  },
  'anexo-inesperado': {
    nome: 'Anexo que ninguém pediu',
    explica: 'Ainda mais com duas extensões no nome. O computador lê a última, e é '
      + 'ela que decide o que acontece ao abrir.',
  },
  'pede-senha': {
    nome: 'Pede senha, código ou dados',
    explica: 'Nenhum serviço pede sua senha por mensagem, nem o código das duas etapas. '
      + 'Quem pede, pede porque não tem.',
  },
  'erro-de-escrita': {
    nome: 'Escrita descuidada',
    explica: 'Acento faltando, frase torta, nome da empresa escrito de dois jeitos. '
      + 'Uma empresa revisa o que manda para milhares de pessoas.',
  },
};

/* ── Uma mensagem ─────────────────────────────────────────────────────────── */

export interface MensagemDoCorreio {
  id: string;
  deNome: string;
  de: string;
  assunto: string;
  corpo: string;
  quando: string;
  links?: LinkDaMensagem[];
  anexos?: string[];
  /**
   * Os indícios que esta mensagem **de fato** tem. Lista vazia é mensagem
   * verdadeira — e há duas na caixa, de propósito.
   */
  indicios: Indicio[];
}

export const CAIXA_DO_CLUBE: MensagemDoCorreio[] = [
  {
    id: 'banco',
    deNome: 'Banco do Brasil',
    de: 'seguranca@bb-atendimento-cliente.com',
    assunto: 'AVISO: sua conta será bloqueada em 24 horas',
    quando: 'hoje, 08:14',
    corpo: 'Prezado cliente,\n\n'
      + 'Detectamos uma movimentação não reconhecida na conta do seu clube. Por '
      + 'segurança, ela será bloqueada em 24 horas caso os dados não sejam '
      + 'confirmados.\n\n'
      + 'Confirme agora e evite o bloqueio:',
    links: [{ texto: 'bb.com.br/central-de-seguranca', para: 'http://bb-atendimento-cliente.com/verificar' }],
    indicios: ['dominio', 'urgencia', 'saudacao-generica', 'link-disfarcado'],
  },
  {
    id: 'boleto',
    deNome: 'Cobrança Digital',
    de: 'financeiro@nota-fiscal-eletronica.info',
    assunto: 'Segunda via do boleto — documento anexo',
    quando: 'ontem, 16:03',
    /* Sem prazo e sem ameaça de propósito: se esta também tivesse urgência, ela
       e a do banco teriam quase o mesmo conjunto, e marcar os mesmos botões nas
       duas passaria. */
    corpo: 'Prezados, segue em anexo a segunda via do boleto referente a '
      + 'mensalidade. Favor conferir os dados e efetuar o pagamento pelo codigo '
      + 'de barras do documento. Qualquer duvida estamos a disposicao.',
    anexos: ['segunda-via-boleto.pdf.exe'],
    indicios: ['dominio', 'anexo-inesperado', 'erro-de-escrita'],
  },
  {
    id: 'associacao',
    deNome: 'Secretaria da Associação',
    de: 'cadastro.clubes@associacao-desbravadores.online',
    assunto: 'Recadastramento obrigatório dos clubes',
    quando: 'ontem, 09:40',
    /*
      A mais perigosa das três, e a que não tem link nem anexo: bem escrita,
      educada, e falando de uma coisa que o clube reconhece. O que ela pede é o
      que nenhum serviço pede.
    */
    corpo: 'Olá! Estamos atualizando o cadastro de todos os clubes do campo.\n\n'
      + 'Para que o seu clube não perca o acesso aos sistemas da Associação, '
      + 'responda esta mensagem informando o e-mail e a senha usados pelo clube. '
      + 'O recadastramento encerra nesta sexta-feira.\n\n'
      + 'Contamos com a colaboração de todos.',
    indicios: ['dominio', 'pede-senha', 'urgencia'],
  },
  {
    id: 'marta',
    deNome: 'Marta Oliveira',
    de: 'marta.oliveira@gmail.com',
    assunto: 'Escala das unidades para o acampamento',
    quando: 'ontem, 21:12',
    /* Tem prazo e não é golpe: prazo não é o indício, ameaça junto do prazo é.
       Quem marcar urgência aqui aprendeu a regra errada, e é para isso que ela
       está na caixa. */
    corpo: 'Oi, pessoal! Terminei a escala das unidades para o acampamento de '
      + 'julho.\n\n'
      + 'Vou levar impressa na reunião de sábado para conferirmos juntos. Quem '
      + 'não puder ir, me avisa antes de sexta que eu passo por telefone.\n\n'
      + 'Abraço, Marta',
    indicios: [],
  },
  {
    id: 'provedor',
    deNome: 'Correio',
    de: 'avisos@correio.com',
    assunto: 'Seu armazenamento está em 82%',
    quando: 'há 3 dias',
    /* Tem link e não é golpe: o texto do link e o destino dele são o mesmo
       endereço. Link não é o indício — link disfarçado é. */
    corpo: 'Olá, Clube Pioneiros.\n\n'
      + 'O armazenamento da sua conta está em 82% do espaço disponível. Quando '
      + 'ele chegar a 100%, novas mensagens deixarão de ser recebidas.\n\n'
      + 'Você pode ver o que ocupa mais espaço na página da sua conta:',
    links: [{ texto: 'correio.com/conta/armazenamento', para: 'https://correio.com/conta/armazenamento' }],
    indicios: [],
  },
];

/* ── A análise ────────────────────────────────────────────────────────────── */

export interface AnaliseDaMensagem {
  id: string;
  /** Os indícios que a pessoa apontou nesta mensagem. */
  apontados: Indicio[];
  /** Se ela marcou a mensagem como golpe. */
  denunciada?: boolean;
}

export const apontar = (a: AnaliseDaMensagem[], id: string, i: Indicio): AnaliseDaMensagem[] => {
  const atual = a.find(x => x.id === id) ?? { id, apontados: [] };
  const apontados = atual.apontados.includes(i)
    ? atual.apontados.filter(x => x !== i)
    : [...atual.apontados, i];
  return [...a.filter(x => x.id !== id), { ...atual, apontados }];
};

export const denunciar = (a: AnaliseDaMensagem[], id: string, sim: boolean): AnaliseDaMensagem[] => {
  const atual = a.find(x => x.id === id) ?? { id, apontados: [] };
  return [...a.filter(x => x.id !== id), { ...atual, denunciada: sim }];
};

const mesmoConjunto = (a: Indicio[], b: Indicio[]) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

/**
 * A análise de uma mensagem está certa?
 *
 * **Conjunto igual, e não conjunto que contém.** É a decisão inteira desta
 * lição: exigir só que os indícios verdadeiros estejam marcados deixaria
 * "marque todos os sete em todas" passar com louvor, e o que se mediria seria
 * ter clicado em todos os botões.
 *
 * E ela vale para a mensagem verdadeira também, onde o conjunto certo é o
 * vazio: quem marca um indício numa mensagem que não tem nenhum errou, e errou
 * do jeito que mais custa na vida — desconfiando de quem não deu motivo.
 */
export function analiseCerta(m: MensagemDoCorreio, a?: AnaliseDaMensagem): boolean {
  if (!a) return false;
  if (!mesmoConjunto(a.apontados, m.indicios)) return false;
  return (a.denunciada ?? false) === (m.indicios.length > 0);
}

/** As mensagens que são golpe. São três, e é o número que o requisito pede. */
export const golpesDaCaixa = (caixa = CAIXA_DO_CLUBE) =>
  caixa.filter(m => m.indicios.length > 0);

/** As verdadeiras, que é o que impede "denuncie tudo" de ser a resposta. */
export const verdadeirasDaCaixa = (caixa = CAIXA_DO_CLUBE) =>
  caixa.filter(m => m.indicios.length === 0);
