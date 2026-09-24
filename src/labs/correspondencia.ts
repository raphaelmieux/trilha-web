/**
 * O correio da CC-ES007: o modelo, e a caixa de onde as seis lições partem.
 *
 * ── Por que ele não é o da AP044 ─────────────────────────────────────────
 * A AP044 já tem um laboratório de correio, e ele mede **o gesto**: pôr a
 * lista grande no Cco, anexar, assinar, arquivar, responder, encaminhar. Este
 * mede **a decisão**, que é o que os requisitos 3 e 4 pedem com todas as
 * letras — "explicar quando se deve usar", "justificando a escolha".
 *
 * A diferença aparece em cada peça daqui. O Cco tem um lado em que ele é a
 * escolha **errada**; o anexo tem um peso e um limite; a caixa de entrada tem
 * mensagens que pedem ação e mensagens que não pedem, e decidir quais é a
 * lição; a lista de distribuição envelhece; e a resposta de ausência responde
 * a quem não devia.
 *
 * ── E por que o clube é o mesmo clube ────────────────────────────────────
 * As unidades e os conselheiros vêm de `cadernoDoClube`, e não escritos de
 * novo aqui. Duas listas de unidades divergiriam no primeiro ajuste, e aí o
 * Falcão teria um conselheiro na planilha e outro no correio — sem nada
 * estourar, porque as duas veredas nunca se olham. É a mesma decisão de
 * `metasDaCcEs004` importar `moldeDoNome` da CC-ES001 em vez de reescrevê-la.
 */

import { CONSELHEIROS } from './cadernoDoClube';

/* ── Endereços ────────────────────────────────────────────────────────────── */

export const DOMINIO = 'clubepioneiros.org.br';
export const VOCE = `secretaria@${DOMINIO}`;
export const DIRETOR = `diretor@${DOMINIO}`;
export const TESOURARIA = `tesouraria@${DOMINIO}`;
export const DIRETORA_ASSOCIADA = `direcao.associada@${DOMINIO}`;
export const CONSELHO = `conselho@${DOMINIO}`;

export interface Contato {
  id: string;
  nome: string;
  endereco: string;
}

/**
 * As cinquenta e duas famílias.
 *
 * Elas não se conhecem e não combinaram trocar endereço entre si — é isso, e
 * não o número, que faz do Cco a escolha certa para elas. O número importa só
 * para o tamanho do estrago: cinquenta e duas pessoas recebendo a lista das
 * outras cinquenta e uma.
 */
export const FAMILIAS: Contato[] = Array.from({ length: 52 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return { id: `familia-${n}`, nome: `Família ${n}`, endereco: `familia${n}@exemplo.com` };
});

/**
 * Os quatro da direção, que é o caso em que o Cco é a escolha **errada**.
 *
 * Eles precisam responder uns aos outros: pôr qualquer um deles em cópia
 * oculta tira dele a conversa — quem responde a todos não o alcança, e se ele
 * mesmo responder a todos, os outros descobrem que havia alguém ali que não
 * aparecia. Cco protege quem não devia aparecer; entre quem trabalha junto,
 * ele esconde a conversa.
 */
export const DIRECAO: Contato[] = [
  { id: 'diretor', nome: 'Tio Ricardo (direção)', endereco: DIRETOR },
  { id: 'associada', nome: 'Tia Cláudia (direção associada)', endereco: DIRETORA_ASSOCIADA },
  { id: 'tesouraria', nome: 'Tio Nelson (tesouraria)', endereco: TESOURARIA },
  { id: 'conselho', nome: 'Conselho do Clube', endereco: CONSELHO },
];

/** Os seis conselheiros, um por unidade, com o nome que a planilha do clube usa. */
export const CONSELHEIROS_DO_CLUBE: Contato[] = CONSELHEIROS.map(([unidade, nome]) => ({
  id: `conselheiro-${unidade.toLowerCase()}`,
  nome: `${nome} (${unidade})`,
  endereco: `${semAcento(unidade)}@${DOMINIO}`,
}));

/**
 * A unidade Falcão, que é a do requisito 4.4.
 *
 * Cinco desbravadores e o conselheiro — e a lista de hoje está errada em dois
 * sentidos ao mesmo tempo, porque são dois erros diferentes e esquecer um não
 * é esquecer o outro. O Daniel saiu do clube em fevereiro e continua na lista;
 * a Helena entrou em março e não está nela.
 */
export const FALCAO: Contato[] = [
  { id: 'bruno', nome: 'Bruno Alves', endereco: 'bruno.alves@exemplo.com' },
  { id: 'daniel', nome: 'Daniel Rocha', endereco: 'daniel.rocha@exemplo.com' },
  { id: 'helena', nome: 'Helena Prado', endereco: 'helena.prado@exemplo.com' },
  { id: 'lucas', nome: 'Lucas Ferraz', endereco: 'lucas.ferraz@exemplo.com' },
  { id: 'sofia', nome: 'Sofia Andrade', endereco: 'sofia.andrade@exemplo.com' },
  { id: 'tiago', nome: 'Tiago Melo', endereco: 'tiago.melo@exemplo.com' },
];

/** Quem de fato está na unidade hoje — o que a lista precisa passar a dizer. */
export const FALCAO_HOJE = ['bruno', 'helena', 'lucas', 'sofia', 'tiago'];
/** Quem a lista diz hoje: o Daniel, que saiu, e sem a Helena, que entrou. */
export const FALCAO_NA_LISTA = ['bruno', 'daniel', 'lucas', 'sofia', 'tiago'];

/*
  Declarada como `function`, e não como `const`, de propósito: ela é chamada
  por `CONSELHEIROS_DO_CLUBE`, que é um literal avaliado quando o módulo
  carrega. Um arrow em `const` cairia na zona morta e o módulo inteiro
  estouraria com "Cannot access before initialization" — é a armadilha que
  `INSIGNIAS` já pagou uma vez.
*/
/**
 * A unidade Águia, que é a lista que o requisito 4.4 manda **criar**.
 *
 * A do Falcão já existe e está velha — foi montada pela secretária anterior —,
 * e são dois trabalhos diferentes: consertar uma lista que envelheceu e montar
 * uma que não existe. Quem só conserta nunca escolheu quem entra.
 */
export const AGUIA: Contato[] = [
  { id: 'ana', nome: 'Ana Beatriz Rocha', endereco: 'ana.rocha@exemplo.com' },
  { id: 'gabriela', nome: 'Gabriela Nunes', endereco: 'gabriela.nunes@exemplo.com' },
  { id: 'rafael', nome: 'Rafael Brito', endereco: 'rafael.brito@exemplo.com' },
  { id: 'vitoria', nome: 'Vitória Sales', endereco: 'vitoria.sales@exemplo.com' },
];

function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/* ── O que uma mensagem é ─────────────────────────────────────────────────── */

export type Pasta = 'entrada' | 'arquivadas' | 'enviadas' | 'lixeira';

export interface Anexo {
  nome: string;
  mb: number;
}

/**
 * Quem consegue abrir o vínculo.
 *
 * É a metade do requisito 4.2 que ninguém conta. Mandar o vínculo em vez do
 * anexo resolve o peso; mandar um vínculo que a pessoa não abre troca um
 * problema por outro **mais quieto** — ela clica, cai numa tela de "solicitar
 * acesso", e o pedido fica esperando numa caixa que você não olha. O anexo
 * grande pelo menos volta com erro.
 */
export type QuemAbre = 'so-voce' | 'convidados' | 'qualquer-um-com-o-link';

export interface VinculoNaMensagem {
  nome: string;
  mb: number;
  quemAbre: QuemAbre;
}

export interface Mensagem {
  id: string;
  de: string;
  deNome: string;
  para: string[];
  cc: string[];
  cco: string[];
  assunto: string;
  corpo: string;
  anexos: Anexo[];
  vinculos: VinculoNaMensagem[];
  /** A assinatura configurada entrou no fim desta mensagem. */
  assinada: boolean;
  /** O dia, em AAAA-MM-DD. */
  quando: string;
  pasta: Pasta;
  lida: boolean;
  respondeA?: string;
}

/**
 * Uma lista de distribuição.
 *
 * Ela é um **apelido** para um conjunto de endereços, e é só isso: escrever o
 * endereço dela num campo é escrever os endereços de todo mundo naquele campo.
 * Por isso lista não é privacidade — quem quer privacidade quer o Cco. As duas
 * se confundem porque as duas encurtam a digitação.
 */
export interface Lista {
  id: string;
  nome: string;
  endereco: string;
  /** Os ids dos contatos, e não os endereços: um contato que mude de endereço continua na lista. */
  membros: string[];
}

/**
 * A resposta automática de ausência.
 *
 * Quatro campos, e três deles existem por um defeito que não dá erro nenhum.
 * Sem `ate`, ela continua respondendo em março que você está de férias. Com
 * `soParaContatos` desligado, ela responde a quem mandou spam — e responder
 * confirma que o endereço existe e que tem gente lendo. E o `texto` é onde
 * cabe dizer com quem falar enquanto você não está: sem isso, quem escreveu
 * recebe a informação de que não vai ser atendido e nada mais.
 */
export interface Ausencia {
  ligada: boolean;
  /** Primeiro dia, AAAA-MM-DD. */
  de: string;
  /** Último dia, AAAA-MM-DD. Vazio quer dizer "sem fim", que é o defeito. */
  ate: string;
  texto: string;
  soParaContatos: boolean;
}

export interface Caixa {
  mensagens: Mensagem[];
  contatos: Contato[];
  listas: Lista[];
  /** O texto que entra sozinho no fim de toda mensagem, ou vazio. */
  assinatura: string;
  ausencia: Ausencia;
}

/* ── Limites e pesos ──────────────────────────────────────────────────────── */

/**
 * O teto de anexo do provedor, em MB.
 *
 * Vinte e cinco é o do Gmail, e é o número que a maioria dos provedores
 * grandes usa. Ele existe aqui para o anexo pesado **voltar**: sem limite, a
 * escolha entre anexo e vínculo seria preferência, e o requisito 4.2 pede uma
 * justificativa.
 */
export const LIMITE_DE_ANEXO = 25;

/** O peso dos anexos de uma mensagem, em MB. */
export const pesoDosAnexos = (m: Pick<Mensagem, 'anexos'>): number =>
  m.anexos.reduce((s, a) => s + a.mb, 0);

/** O anexo cabe no que o provedor aceita? */
export const cabeNoAnexo = (m: Pick<Mensagem, 'anexos'>): boolean =>
  pesoDosAnexos(m) <= LIMITE_DE_ANEXO;

/**
 * Quantos MB o envio custa no total, somando todas as caixas que recebem.
 *
 * É este número que responde ao "justificando a escolha" do requisito 4.2, e
 * ele não aparece em lugar nenhum de um correio de verdade — o que aparece é
 * o tamanho do arquivo, uma vez. Cento e oitenta MB parecem pouco até serem
 * multiplicados por quarenta pessoas.
 */
export const custoDoEnvio = (c: Caixa, m: Mensagem): number =>
  pesoDosAnexos(m) * Math.max(quemRecebe(c, m).length, 1);

/* ── Endereços: quem recebe, e quem aparece ───────────────────────────────── */

/** O endereço de um contato pelo id, ou o próprio texto se já for um endereço. */
export const enderecoDe = (c: Caixa, quem: string): string =>
  c.contatos.find(x => x.id === quem)?.endereco ?? quem;

/** O nome de quem tem este endereço, ou o endereço mesmo. */
export const nomeDe = (c: Caixa, endereco: string): string =>
  c.contatos.find(x => x.endereco === endereco)?.nome
  ?? c.listas.find(l => l.endereco === endereco)?.nome
  ?? endereco;

/**
 * Abre as listas nos endereços de quem está dentro delas.
 *
 * É o que o provedor faz na hora de entregar, e é por isso que lista não
 * esconde ninguém: o campo que tinha um endereço passa a ter seis.
 */
export function expandir(c: Caixa, enderecos: readonly string[]): string[] {
  const fora: string[] = [];
  for (const e of enderecos) {
    const lista = c.listas.find(l => l.endereco === e);
    if (lista) fora.push(...lista.membros.map(id => enderecoDe(c, id)));
    else fora.push(e);
  }
  return [...new Set(fora)];
}

/**
 * Os endereços que **aparecem** para quem recebe a mensagem.
 *
 * Para e Cc aparecem; Cco não. E a lista aparece aberta, porque na entrega ela
 * deixa de ser um apelido — é a metade que faz alguém achar que mandou para a
 * lista e portanto protegeu.
 */
export const enderecosVisiveis = (c: Caixa, m: Mensagem): string[] =>
  expandir(c, [...m.para, ...m.cc]);

/** Todo mundo que recebe, inclusive quem está oculto. */
export const quemRecebe = (c: Caixa, m: Mensagem): string[] =>
  [...new Set([...expandir(c, [...m.para, ...m.cc]), ...expandir(c, m.cco)])];

/**
 * Quantos endereços de outras pessoas cada quem-recebe vai ler.
 *
 * O próprio endereço não conta: quem recebe já sabe o dele. É esta conta que
 * diz se houve vazamento, e não "o Cco está preenchido" — uma mensagem com uma
 * família no Cco e cinquenta e uma no Para tem o campo preenchido e vazou
 * tudo. É a mesma decisão da AP044, escrita aqui porque o modelo é outro.
 */
export function enderecosQueCadaUmVe(c: Caixa, m: Mensagem): number {
  const visiveis = enderecosVisiveis(c, m);
  return Math.max(visiveis.length - 1, 0);
}

/* ── Mexer na caixa ───────────────────────────────────────────────────────── */

const trocar = (c: Caixa, id: string, f: (m: Mensagem) => Mensagem): Caixa => ({
  ...c,
  mensagens: c.mensagens.map(m => (m.id === id ? f(m) : m)),
});

export const naPasta = (c: Caixa, p: Pasta): Mensagem[] =>
  c.mensagens.filter(m => m.pasta === p);

export const mensagemDe = (c: Caixa, id: string): Mensagem | undefined =>
  c.mensagens.find(m => m.id === id);

/**
 * Arquivar tira da caixa de entrada e guarda.
 *
 * A mensagem continua existindo, continua aparecendo na busca, e volta na hora
 * em que alguém responder a ela. É por isso que arquivar é seguro e excluir
 * não é — e é a diferença que faz alguém passar três anos com quatro mil
 * mensagens na entrada, porque aprendeu que tirar dali é perder.
 */
export const arquivar = (c: Caixa, id: string): Caixa =>
  trocar(c, id, m => ({ ...m, pasta: 'arquivadas', lida: true }));

export const paraAEntrada = (c: Caixa, id: string): Caixa =>
  trocar(c, id, m => ({ ...m, pasta: 'entrada' }));

export const paraALixeira = (c: Caixa, id: string): Caixa =>
  trocar(c, id, m => ({ ...m, pasta: 'lixeira' }));

export const marcarLida = (c: Caixa, id: string, lida = true): Caixa =>
  trocar(c, id, m => ({ ...m, lida }));

/**
 * A busca, que é a razão de arquivar não ser perder.
 *
 * Ela lê assunto, corpo e remetente — e **não** lê a lixeira, como não lê em
 * provedor nenhum. É essa assimetria que separa as duas: o que foi arquivado
 * se acha, o que foi excluído não. Sem ela as duas seriam a mesma coisa com
 * dois nomes, e a lição do requisito 4.3 não teria o que mostrar.
 */
export function buscar(c: Caixa, termo: string): Mensagem[] {
  const t = termo.trim().toLowerCase();
  if (!t) return [];
  return c.mensagens.filter(m => m.pasta !== 'lixeira' && (
    m.assunto.toLowerCase().includes(t)
    || m.corpo.toLowerCase().includes(t)
    || m.deNome.toLowerCase().includes(t)
    || m.de.toLowerCase().includes(t)));
}

/* ── Enviar ───────────────────────────────────────────────────────────────── */

export interface Rascunho {
  para: string[];
  cc: string[];
  cco: string[];
  assunto: string;
  corpo: string;
  anexos: Anexo[];
  vinculos: VinculoNaMensagem[];
  respondeA?: string;
}

export const rascunhoVazio = (): Rascunho => ({
  para: [], cc: [], cco: [], assunto: '', corpo: '', anexos: [], vinculos: [],
});

/**
 * Manda a mensagem, e o que sai não volta.
 *
 * O anexo que passa do limite **não** é bloqueado aqui: `cabeNoAnexo` responde,
 * e quem decide o que fazer com a resposta é a tela — que devolve a recusa do
 * provedor, como um provedor de verdade devolve. Simulação que vira muro no
 * primeiro desvio ensina a andar no trilho; o requisito 4.2 pede justamente
 * que se descubra por que o anexo não serve.
 */
export function enviar(c: Caixa, r: Rascunho, quando: string): Caixa {
  const m: Mensagem = {
    id: `env-${c.mensagens.length + 1}-${Date.now().toString(36)}`,
    de: VOCE,
    deNome: 'Secretaria do Clube',
    para: r.para, cc: r.cc, cco: r.cco,
    assunto: r.assunto,
    corpo: c.assinatura ? `${r.corpo}\n\n${c.assinatura}` : r.corpo,
    anexos: r.anexos,
    vinculos: r.vinculos,
    assinada: c.assinatura.trim().length > 0,
    quando,
    pasta: 'enviadas',
    lida: true,
    respondeA: r.respondeA,
  };
  return { ...c, mensagens: [...c.mensagens, m] };
}

/* ── Listas de distribuição ───────────────────────────────────────────────── */

export const listaDe = (c: Caixa, id: string): Lista | undefined =>
  c.listas.find(l => l.id === id);

export const criarLista = (c: Caixa, l: Lista): Caixa =>
  ({ ...c, listas: [...c.listas, l] });

export const mudarMembros = (c: Caixa, id: string, membros: string[]): Caixa => ({
  ...c,
  listas: c.listas.map(l => (l.id === id ? { ...l, membros } : l)),
});

/* ── A resposta de ausência ───────────────────────────────────────────────── */

/**
 * Responderia a esta mensagem?
 *
 * Duas guardas, e a segunda é a que ninguém liga. Fora do período ela não
 * responde — e período sem fim nunca termina, que é o defeito de deixar `ate`
 * vazio. E `soParaContatos` é o que impede a resposta de sair para quem mandou
 * spam: responder a um endereço que atirou no escuro confirma que ele existe e
 * que tem alguém lendo, que é exatamente o que quem atirou queria saber.
 */
export function responderiaA(c: Caixa, m: Mensagem, dia: string): boolean {
  const a = c.ausencia;
  if (!a.ligada) return false;
  if (a.de && dia < a.de) return false;
  if (a.ate && dia > a.ate) return false;
  if (a.soParaContatos && !c.contatos.some(x => x.endereco === m.de)) return false;
  return true;
}

/**
 * A resposta de ausência tem fim declarado?
 *
 * Sem ele, ela responde em março que você está de férias — e quem recebe
 * conclui que a secretaria do clube não está funcionando. Não estoura nada:
 * a resposta continua saindo, correta e antiga.
 */
export const temFim = (a: Ausencia): boolean => a.ate.trim().length > 0;

/**
 * As palavras que dizem que a casa está vazia.
 *
 * É o requisito 4.5 encostando na CC-ES005, que é a vereda exigida aqui: a
 * resposta de ausência é a única mensagem que você escreve para **quem quer
 * que escreva**, inclusive para quem escreveu no escuro. Dizer que a família
 * inteira está viajando de 10 a 25 é dizer isso a todo mundo.
 */
const DIZ_QUE_A_CASA_ESTA_VAZIA = [
  'viajando', 'viajamos', 'de viagem', 'fora da cidade', 'longe de casa',
  'de férias com a família', 'passando as férias', 'toda a família',
];

export const contaDemais = (a: Ausencia): boolean =>
  DIZ_QUE_A_CASA_ESTA_VAZIA.some(p => a.texto.toLowerCase().includes(p));

/**
 * A resposta diz com quem falar enquanto você não está?
 *
 * Sem isso ela informa que não vai haver resposta e nada mais, e quem escreveu
 * fica esperando do mesmo jeito. A conta é por endereço: um nome sem endereço
 * manda procurar. É a mesma família do "zero link não é zero link quebrado" —
 * uma resposta automática vazia de encaminhamento parece uma resposta
 * automática funcionando.
 */
export const dizComQuemFalar = (a: Ausencia): boolean =>
  /[\w.+-]+@[\w-]+\.[\w.-]+/.test(a.texto);

/* ── O assunto e o pedido ─────────────────────────────────────────────────── */

/**
 * Os assuntos que não dizem nada.
 *
 * Nenhum deles está errado no dia em que se escreve — quem recebe abre e
 * entende. O estrago é seis meses depois, quando alguém procura por "ônibus"
 * e acha quatro mensagens escritas "Reunião". Num clube que se reúne toda
 * semana, "Reunião" é o assunto mais inútil que existe.
 */
export const ASSUNTOS_QUE_NAO_DIZEM_NADA = [
  'oi', 'olá', 'ola', 'aviso', 'aviso importante', 'importante', 'urgente',
  'favor ler', 'leiam', 'sem assunto', 'reunião', 'reuniao', 'informação',
  'informacao', 'informe', 'comunicado', 'atenção', 'atencao', 'recado',
];

export const assuntoVago = (assunto: string): boolean =>
  ASSUNTOS_QUE_NAO_DIZEM_NADA.includes(assunto.trim().toLowerCase());

/**
 * O assunto nomeia a matéria da mensagem?
 *
 * As palavras vêm da lição, e não de uma adivinhação sobre o texto: um assunto
 * informativo é o que a pessoa vai **procurar** dali a seis meses, e quem sabe
 * por qual palavra ela vai procurar é quem escreveu o exercício.
 *
 * As duas contas são separadas de propósito, como o molde e a data da
 * CC-ES001: "Reunião do ônibus" nomeia a matéria e continua começando por um
 * assunto vago; "Confirmação para quarta" não é vago e não nomeia nada.
 */
export const assuntoNomeiaAMateria = (assunto: string, palavras: readonly string[]): boolean =>
  palavras.some(p => assunto.toLowerCase().includes(p.toLowerCase()));

const SAUDACOES = [
  'prezado', 'prezada', 'caro ', 'cara ', 'caros', 'caras',
  'bom dia', 'boa tarde', 'boa noite', 'olá', 'ola,', 'oi,', 'senhor', 'senhora',
];

/** A mensagem abre com uma saudação — nas primeiras linhas, que é onde ela é saudação. */
export function temSaudacao(corpo: string): boolean {
  const comeco = corpo.trim().split('\n').slice(0, 2).join(' ').toLowerCase();
  return SAUDACOES.some(s => comeco.includes(s));
}

/**
 * O pedido, que é duas contas e não uma.
 *
 * "Seria bom se alguém pudesse levar o som" é uma frase simpática que não pede
 * nada a ninguém: não há quem, não há quando, e ninguém leva o som. Por isso
 * são duas: a mensagem precisa **pedir** — um verbo de pedido, e não um desejo
 * no condicional — e precisa dizer **até quando**.
 *
 * Faltar uma e faltar a outra são erros diferentes, e juntá-los numa conta só
 * diria "o pedido está fraco" a quem escreveu um pedido claro sem prazo.
 */
const VERBOS_DE_PEDIDO = [
  'peço', 'peco', 'solicito', 'preciso', 'precisamos', 'favor ', 'por favor',
  'poderia', 'poderiam', 'pode ', 'podem ', 'confirme', 'confirmem', 'confirmar',
  'envie', 'enviem', 'mande', 'mandem', 'traga', 'tragam', 'responda', 'respondam',
  'avise', 'avisem', 'assine', 'assinem', 'leve', 'levem',
];

export const pedeAlgumaCoisa = (corpo: string): boolean =>
  VERBOS_DE_PEDIDO.some(v => corpo.toLowerCase().includes(v));

const DIAS_DA_SEMANA = [
  'segunda', 'terça', 'terca', 'quarta', 'quinta', 'sexta', 'sábado', 'sabado', 'domingo',
];

/**
 * A mensagem diz até quando.
 *
 * Um dia da semana, uma data, ou um "até" seguido de alguma coisa. Pedido sem
 * prazo é pedido que todo mundo lê e ninguém atende hoje — e como ele não
 * estoura, quem pediu descobre na véspera.
 */
export function temPrazo(corpo: string): boolean {
  const t = corpo.toLowerCase();
  if (DIAS_DA_SEMANA.some(d => t.includes(d))) return true;
  if (/\b\d{1,2}\s*\/\s*\d{1,2}\b/.test(t)) return true;
  if (/\bdia\s+\d{1,2}\b/.test(t)) return true;
  if (/até\s+\d{1,2}\b/.test(t)) return true;
  return false;
}

/** As frases do corpo: ponto, interrogação, exclamação ou quebra de linha. */
const frases = (corpo: string): string[] =>
  corpo.split(/[.!?\n]+/).map(f => f.trim()).filter(Boolean);

/**
 * O pedido e o prazo **na mesma frase**.
 *
 * Separadas, as duas contas se enganam: quase toda mensagem de clube cita uma
 * data — a do acampamento, a da reunião —, e uma mensagem que diga "a saída é
 * dia 3 de julho" e peça alguma coisa em outra frase passaria por ter prazo
 * sem ter prazo nenhum. O prazo de que o requisito 4.1 fala é o do **pedido**,
 * e ele mora junto do pedido: "confirme até quarta".
 *
 * As duas contas continuam existindo separadas porque elas nomeiam erros
 * diferentes, e é isso que a lição ensina; esta é a que a tarefa mede.
 */
export const pedidoComPrazo = (corpo: string): boolean =>
  frases(corpo).some(f => pedeAlgumaCoisa(f) && temPrazo(f));

/**
 * As palavras que dizem quem é você no clube.
 *
 * É o requisito 2.3: uma assinatura existe para quem recebe saber quem está
 * pedindo. "Marina" assina; "Marina Duarte — Secretaria do Clube Pioneiros"
 * diz a quem responder e com que autoridade o pedido foi feito, que é a
 * diferença entre uma mensagem que é atendida e uma que fica esperando alguém
 * perguntar quem escreveu.
 */
const FUNCOES_NO_CLUBE = [
  'secretaria', 'secretário', 'secretaria', 'secretária', 'diretor', 'diretora',
  'direção', 'tesoureiro', 'tesoureira', 'tesouraria', 'conselheiro', 'conselheira',
  'instrutor', 'instrutora', 'capitão', 'capitã', 'clube', 'unidade',
];

export const assinaturaDizQuemEVoce = (assinatura: string): boolean => {
  const t = assinatura.trim();
  return t.length >= 12 && FUNCOES_NO_CLUBE.some(f => t.toLowerCase().includes(f));
};

/* ── A caixa do clube ─────────────────────────────────────────────────────── */

/**
 * O dia em que as lições acontecem.
 *
 * Uma data escrita, e não `new Date()`: a resposta de ausência tem período, e
 * uma lição cujo resultado muda conforme o dia em que alguém a abre é uma
 * lição que um dia reprova sozinha. É a mesma razão de os exemplos de Python
 * serem conferidos rodando, e não de cabeça.
 */
export const HOJE = '2026-06-24';

/**
 * As mensagens da caixa de entrada.
 *
 * Oito, e a decisão do requisito 4.3 é sobre elas: três pedem alguma coisa de
 * quem lê, cinco não pedem nada. Nenhuma carrega um campo dizendo de que lado
 * está — um `pedeAcao: boolean` seria a resposta impressa na tela, que é a
 * mesma decisão do `emUso` que a CC-ES005 recusou. Quem sabe é a meta, e a
 * meta é a trava, não o programa.
 */
export const MENSAGENS_DO_CLUBE: Mensagem[] = [
  {
    id: 'inscritos',
    de: DIRETOR, deNome: 'Tio Ricardo (direção)',
    para: [VOCE], cc: [], cco: [],
    assunto: 'Número final de inscritos do acampamento',
    corpo: 'A empresa do ônibus quer o número fechado para emitir a nota. '
      + 'Me manda o total até quarta que eu passo para eles.',
    anexos: [], vinculos: [], assinada: false,
    quando: '2026-06-22', pasta: 'entrada', lida: false,
  },
  {
    id: 'autorizacao',
    de: TESOURARIA, deNome: 'Tio Nelson (tesouraria)',
    para: [VOCE], cc: [], cco: [],
    assunto: 'Falta a autorização assinada da Gabriela',
    corpo: 'Conferi as trinta e nove autorizações e falta a da Gabriela Nunes. '
      + 'Sem ela, ela não embarca. Consegue falar com a mãe dela?',
    anexos: [], vinculos: [], assinada: false,
    quando: '2026-06-22', pasta: 'entrada', lida: false,
  },
  {
    id: 'escala-falcao',
    de: 'falcao@clubepioneiros.org.br', deNome: 'Tio Samuel (Falcão)',
    para: [VOCE], cc: [], cco: [],
    assunto: 'Escala de cozinha da Falcão',
    corpo: 'Montei a escala da minha unidade mas preciso saber em que dia a '
      + 'Falcão cozinha. Você tem a divisão dos dias?',
    anexos: [], vinculos: [], assinada: false,
    quando: '2026-06-23', pasta: 'entrada', lida: false,
  },
  {
    id: 'mural',
    de: DIRETORA_ASSOCIADA, deNome: 'Tia Cláudia (direção associada)',
    para: [VOCE], cc: [DIRETOR], cco: [],
    assunto: 'Escala das unidades já está no mural',
    corpo: 'Imprimi e afixei no mural da secretaria. Obrigada a todo mundo que ajudou a montar.',
    anexos: [], vinculos: [], assinada: false,
    quando: '2026-06-21', pasta: 'entrada', lida: false,
  },
  {
    id: 'salao',
    de: 'secretaria@igrejacentral.org.br', deNome: 'Secretaria da Igreja Central',
    para: [VOCE], cc: [], cco: [],
    assunto: 'Confirmado: salão reservado para 4 de julho',
    corpo: 'Está reservado das 8h às 18h. Qualquer mudança é só avisar.',
    anexos: [], vinculos: [], assinada: false,
    quando: '2026-06-20', pasta: 'entrada', lida: false,
  },
  {
    id: 'boletim',
    de: 'boletim@uniao.org.br', deNome: 'Boletim da União',
    para: ['lista@uniao.org.br'], cc: [], cco: [],
    assunto: 'Boletim de junho — notícias dos clubes da região',
    corpo: 'Nesta edição: o campori regional, as novas especialidades e o calendário do segundo semestre.',
    anexos: [], vinculos: [], assinada: false,
    quando: '2026-06-19', pasta: 'entrada', lida: false,
  },
  {
    id: 'obrigada',
    de: 'aguia@clubepioneiros.org.br', deNome: 'Tia Rute (Águia)',
    para: [VOCE], cc: [], cco: [],
    assunto: 'Re: Lista do que levar',
    corpo: 'Recebi, obrigada! Já repassei para a minha unidade.',
    anexos: [], vinculos: [], assinada: false,
    quando: '2026-06-19', pasta: 'entrada', lida: false,
  },
  {
    /*
      A mensagem que já chegou vazada, e que é o requisito 3 acontecendo na
      caixa de quem estuda.

      Trinta e quatro clubes no campo Cc: quem abre esta mensagem está lendo o
      endereço de trinta e três secretarias que nunca autorizaram nada, e o
      endereço dela foi lido por trinta e três pessoas. Ninguém fez por mal, e
      é exatamente por isso que ela existe aqui — o vazamento do requisito 3
      não é uma hipótese, é a mensagem de terça.
    */
    id: 'regional',
    de: 'secretaria@clubealvorada.org.br', deNome: 'Secretaria do Clube Alvorada',
    para: ['secretaria@clubealvorada.org.br'],
    cc: [VOCE, ...Array.from({ length: 33 }, (_, i) =>
      `secretaria@clube${String(i + 1).padStart(2, '0')}.org.br`)],
    cco: [],
    assunto: 'Datas do campori regional de 2027',
    corpo: 'Boa tarde a todos os clubes. Segue o calendário do campori regional '
      + 'de 2027 para vocês irem programando. Não é preciso responder.',
    anexos: [], vinculos: [], assinada: false,
    quando: '2026-06-23', pasta: 'entrada', lida: false,
  },
  {
    id: 'senha',
    de: 'nao-responda@correio.exemplo.com', deNome: 'Correio do Clube',
    para: [VOCE], cc: [], cco: [],
    assunto: 'Sua senha foi alterada',
    corpo: 'A senha da conta secretaria@clubepioneiros.org.br foi alterada em 18 de junho, às 20h14. '
      + 'Se foi você, não é preciso fazer nada.',
    anexos: [], vinculos: [], assinada: false,
    quando: '2026-06-18', pasta: 'entrada', lida: false,
  },
];

export const AUSENCIA_DESLIGADA = (): Ausencia => ({
  ligada: false, de: '', ate: '', texto: '', soParaContatos: false,
});

/**
 * A caixa de onde as seis lições de correio partem.
 *
 * Uma caixa só para as seis, como o `discoDoClube()` da CC-ES001 e o
 * `cadernoDoClube()` da CC-ES003: seis caixas diferentes ensinariam que cada
 * exercício acontece num correio de mentira. Cada lição parte de um **estado**
 * dela, e quem diz qual é o registro das lições.
 */
export function caixaDoClube(): Caixa {
  return {
    mensagens: MENSAGENS_DO_CLUBE.map(m => ({ ...m })),
    contatos: [...DIRECAO, ...CONSELHEIROS_DO_CLUBE, ...FALCAO, ...AGUIA, ...FAMILIAS],
    listas: [{
      id: 'falcao',
      nome: 'Unidade Falcão',
      endereco: `unidade.falcao@${DOMINIO}`,
      membros: [...FALCAO_NA_LISTA],
    }],
    assinatura: '',
    ausencia: AUSENCIA_DESLIGADA(),
  };
}

/* ── A pauta e a ata ──────────────────────────────────────────────────────── */

/**
 * Os itens de uma pauta.
 *
 * Uma pauta é uma **lista**: três ou quatro assuntos, na ordem em que vão ser
 * tratados. Um parágrafo dizendo "vamos falar do acampamento e de mais umas
 * coisas" não é pauta — quem recebe não sabe o que preparar, que é a única
 * razão de mandar a pauta antes.
 *
 * A conta é por linha que abre com marcador ou número, que é como se escreve
 * lista em mensagem: nem toda plataforma tem lista de verdade, e todo mundo
 * escreve assim mesmo.
 */
export const itensDaPauta = (corpo: string): string[] =>
  corpo.split('\n')
    .map(l => l.trim())
    .filter(l => /^([-*\u2022]|\d+[.)])\s+\S/.test(l));

/**
 * As decisões de uma ata que têm dono e prazo.
 *
 * É a metade do requisito 7 que decide se a ata serve para alguma coisa. "Ficou
 * combinado que alguém vai ver o som" é a mesma frase de "seria bom se alguém
 * pudesse levar o som", escrita um mês depois: ninguém vê o som, e a ata
 * registrou que a reunião aconteceu e mais nada.
 *
 * As duas contas são as do pedido — quem, e até quando —, e é de propósito:
 * uma ata inteira de decisões sem prazo e uma inteira de prazos sem responsável
 * são erros diferentes, e as duas vêm de reuniões que pareciam produtivas.
 */
export const decisoesComDono = (corpo: string, nomes: readonly string[]): string[] =>
  corpo.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0
      && nomes.some(n => l.toLowerCase().includes(n.toLowerCase()))
      && temPrazo(l));
