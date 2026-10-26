/**
 * O modelo da CC-DG006 Projeto de Design: uma demanda real do clube, quatro
 * peças, o processo, a entrega, o retorno do público e a apresentação.
 *
 * ── Por que um modelo de projeto, e não um programa novo ─────────────────
 * Esta vereda não ensina ferramenta nenhuma: as quatro peças que o requisito
 * 3 pede já foram ensinadas, cada uma na vereda de antes dela — a impressa no
 * programa de diagramação da CC-DG005, o símbolo no editor de vetor da
 * CC-DG002, a foto no editor de pontos da CC-DG003, e a digital no editor de
 * design da CC-DG001. O que ela ensina é o que nenhuma podia ensinar sozinha:
 * que as quatro são **um** projeto, para **um** público, e que a peça digital
 * é outra peça, e não a impressa encolhida.
 *
 * Por isso aqui não há janela nem desenho: há o que liga as peças — a
 * proposta que vem antes, o símbolo que é o mesmo nas duas, a foto que entra
 * tratada e com a origem declarada, as versões que contam o processo, a pasta
 * que separa o editável do final, e a mudança que o público pediu. É a
 * decisão de `projetoDocumental.ts` na CC-ES012, pelo motivo escrito lá.
 */

import {
  achatarObjetos, contrasteFunciona, silhueta, textos, uniaoDe,
  type Arte, type Grupo, type Objeto, type Prancha,
} from './design';
import { coincidencia, normalizar, type Contorno } from './vetor';
import {
  PPI_DE_IMPRESSAO, SANGRIA_DA_GRAFICA, encostaSemSangrar, imagemDe, pdfParaGrafica, ppiEfetivo,
  type Documento as Diagramacao, type Pdf,
} from './diagramacao';
import type { Licenca } from './metasDaCcDg003';
import { pastasAcima, type ArquivoDaNuvem, type Nuvem } from './arquivoCompartilhado';
import { moldeDoNome, nomeTemDataEVersao } from '../lib/exploradorValidator';

/* ── Palavras ────────────────────────────────────────────────────────────── */

export const palavrasDe = (s: string) => s.trim().split(/\s+/).filter(Boolean);

/** Sem acento e em minúsculas: é como se procura uma palavra que alguém digitou. */
export const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/* ── A proposta, que é o requisito 2 ──────────────────────────────────────── */

export type PecaDoProjeto = 'impressa' | 'digital' | 'simbolo' | 'imagens';

export const PECAS_DO_PROJETO: { id: PecaDoProjeto; nome: string }[] = [
  { id: 'impressa', nome: 'Uma peça impressa' },
  { id: 'digital', nome: 'Uma peça digital adaptada da impressa' },
  { id: 'simbolo', nome: 'Um símbolo vetorial de autoria própria' },
  { id: 'imagens', nome: 'Imagens tratadas, com a origem declarada' },
];

/**
 * A proposta escrita, e a aprovação que vem **antes** da execução.
 *
 * `aprovadaEm` é data, e não booleano, pela razão escrita na CC-ES012: o
 * requisito não pede que a aprovação exista, pede que ela venha antes. O
 * examinador desta simulação aprova o que está completo e devolve o resto
 * dizendo o que falta — que é o que um examinador de verdade faz com uma
 * proposta sem público.
 */
export interface PropostaDeDesign {
  /** A demanda de comunicação: o que o clube precisa que alguém fique sabendo. */
  demanda: string;
  /** Quem precisa ficar sabendo. */
  publico: string;
  /** Onde a peça digital vai circular — é dele que sai a proporção dela. */
  meio: string;
  pecas: PecaDoProjeto[];
  aprovadaEm: string | null;
  /** O que o examinador escreveu ao devolver, ou `null`. */
  devolvida: string | null;
}

export const PROPOSTA_EM_BRANCO: PropostaDeDesign = {
  demanda: '', publico: '', meio: '', pecas: [], aprovadaEm: null, devolvida: null,
};

export const PALAVRAS_DA_DEMANDA = 12;
export const PALAVRAS_DO_PUBLICO = 4;

/**
 * "Todo mundo" não é público. É a régua da CC-DG004, pelo motivo escrito lá:
 * peça feita para todos é feita para ninguém, e o requisito pede o público
 * justamente para obrigar a escolher.
 */
const PUBLICO_VAGO = ['todo mundo', 'todos', 'qualquer pessoa', 'qualquer um', 'as pessoas', 'geral', 'a comunidade'];

export function publicoDefinido(publico: string): boolean {
  const t = sem(publico);
  return palavrasDe(t).length >= PALAVRAS_DO_PUBLICO
    && !PUBLICO_VAGO.some(v => t === v || t.startsWith(`${v} `) || t.endsWith(` ${v}`));
}

/** O que falta na proposta, nas palavras de quem a devolve. Vazio é completa. */
export function faltasDaProposta(p: PropostaDeDesign): string[] {
  const faltas: string[] = [];
  if (palavrasDe(p.demanda).length < PALAVRAS_DA_DEMANDA) faltas.push('A demanda precisa dizer o que o clube precisa comunicar, e por quê.');
  if (!publicoDefinido(p.publico)) faltas.push('O público precisa ser gente de verdade, e não "todo mundo".');
  if (p.meio.trim() === '') faltas.push('Falta dizer onde a peça digital vai circular.');
  const faltam = PECAS_DO_PROJETO.filter(x => !p.pecas.includes(x.id));
  if (faltam.length) faltas.push(`Faltam peças que o requisito pede: ${faltam.map(x => x.nome.toLowerCase()).join('; ')}.`);
  return faltas;
}

export const propostaCompleta = (p: PropostaDeDesign) => faltasDaProposta(p).length === 0;

/**
 * Mandar a proposta ao examinador. Completa, ela volta aprovada com a data;
 * incompleta, volta com o que falta escrito — e a aprovação anterior, se
 * houver, não se perde por ela ter sido reenviada.
 */
export function enviarParaAprovacao(p: PropostaDeDesign, hoje: string): PropostaDeDesign {
  const faltas = faltasDaProposta(p);
  if (faltas.length) return { ...p, devolvida: faltas.join(' ') };
  return { ...p, aprovadaEm: p.aprovadaEm ?? hoje, devolvida: null };
}

/* ── O símbolo, que é o requisito 3.3 ─────────────────────────────────────── */

export const PRANCHA_DO_SIMBOLO = 'simbolo';
export const PRANCHA_DO_POST = 'post';

const ehVetor = (o: Objeto) => o.tipo === 'retangulo' || o.tipo === 'elipse' || o.tipo === 'caminho';

/**
 * O símbolo da prancha: o grupo feito só de formas vetoriais.
 *
 * Grupo, porque um símbolo se move inteiro de uma peça para a outra — e é a
 * cópia do grupo que vai aparecer no post. Só de vetor, porque é isso que o
 * requisito pede: uma imagem de pontos dentro do grupo seria o clipart com
 * moldura.
 */
export function simboloDa(p: Prancha | undefined): Grupo | null {
  if (!p) return null;
  return p.objetos.find((o): o is Grupo => {
    if (o.tipo !== 'grupo') return false;
    const dentro = achatarObjetos(o.filhos).filter(x => x.tipo !== 'grupo');
    return dentro.length >= 2 && dentro.every(ehVetor);
  }) ?? null;
}

/** A silhueta do símbolo, levada à origem e à largura um, para comparar com cópias. */
export const desenhoDoSimbolo = (g: Grupo): Contorno[] =>
  normalizar(uniaoDe(achatarObjetos(g.filhos).filter(ehVetor).map(silhueta)));

/** O tamanho em que um ícone ainda precisa funcionar: o da tela do celular. */
export const LADO_PEQUENO = 32;

/**
 * O que some quando o símbolo é desenhado com 32 pixels de lado: traço mais
 * fino que um pixel, e forma preenchida com algum lado menor que um pixel.
 *
 * É a conta de `detalhesQueSomem` da CC-DG002, feita no tamanho do símbolo e
 * não da prancha: o mesmo desenho pode estar grande ou pequeno na prancha, e
 * o que importa é o tamanho em que ele vai aparecer.
 */
export function detalhesQueSomemEm(g: Grupo, lado = LADO_PEQUENO): string[] {
  const fator = lado / Math.max(g.largura, g.altura);
  return achatarObjetos(g.filhos).filter(ehVetor).filter(o => {
    const traco = (o.tipo === 'caminho' || o.tipo === 'retangulo' || o.tipo === 'elipse') ? o.traco : null;
    if (traco && traco.espessura * fator < 1) return true;
    const preenche = o.tipo === 'caminho' ? !!o.preenchimento : true;
    const altura = o.tipo === 'caminho' || o.tipo === 'retangulo' || o.tipo === 'elipse' ? o.altura : 0;
    return preenche && Math.min(o.largura, altura) * fator < 1;
  }).map(o => o.id);
}

/** Imagem de pontos na prancha: o clipart, enquanto ninguém o tirar. */
export const imagensNa = (p: Prancha | undefined) =>
  p ? achatarObjetos(p.objetos).filter(o => o.tipo === 'foto') : [];

export const COINCIDENCIA_DO_SIMBOLO = 0.95;

/** A prancha leva uma cópia do símbolo, em qualquer tamanho e em qualquer lugar. */
export function levaOSimbolo(p: Prancha | undefined, simbolo: Grupo | null): boolean {
  if (!p || !simbolo) return false;
  const alvo = desenhoDoSimbolo(simbolo);
  return achatarObjetos(p.objetos).some(o => o.tipo === 'grupo'
    && coincidencia(desenhoDoSimbolo(o), alvo) >= COINCIDENCIA_DO_SIMBOLO);
}

/* ── As imagens, que são o requisito 3.4 ──────────────────────────────────── */

export interface ImagemDoProjeto {
  id: string;
  nome: string;
  /** A licença de verdade, que a pessoa precisa descobrir e declarar. */
  licenca: Licenca;
  /** Quem fez. Vazio quando não se sabe — que é o que acontece com o clipart. */
  autor: string;
  /** De onde veio, como a lição a mostra. */
  fonte: string;
}

export interface OrigemDeclarada {
  licenca: Licenca | null;
  autor: string;
}

/**
 * A origem declarada bate com a de verdade.
 *
 * A licença precisa ser a certa, e o autor precisa estar escrito sempre que
 * existe: "própria" sem dizer quem tirou não é declaração — o clube tem vinte
 * celulares, e a autorização de uso é de uma pessoa.
 */
export function origemCerta(img: ImagemDoProjeto, d: OrigemDeclarada | undefined): boolean {
  if (!d || d.licenca !== img.licenca) return false;
  if (img.licenca === 'protegida') return true;
  const sobrenome = sem(img.autor).split(' ').pop() ?? '';
  return sobrenome !== '' && sem(d.autor).includes(sobrenome);
}

/**
 * O crédito que uma imagem de licença livre pede: quem fez, e a licença. Sem
 * os dois, usar a imagem é usar como se fosse protegida — a licença CC BY
 * permite exatamente com essa condição.
 */
export function creditaA(texto: string, img: ImagemDoProjeto): boolean {
  const t = sem(texto);
  const sobrenome = sem(img.autor).split(' ').pop() ?? '';
  return sobrenome !== '' && t.includes(sobrenome) && /cc[\s-]?by/.test(t);
}

/* ── A peça impressa, que é o requisito 3.1 ───────────────────────────────── */

/**
 * O que o convite precisa dizer: o quê, quando e onde.
 *
 * Declarado, e não adivinhado na prosa, pela razão das dez informações
 * essenciais da CC-ES011: a lição pode dizer quais são, e a conta não depende
 * de achar um sentido no texto.
 */
export interface Essencial { id: 'oque' | 'quando' | 'onde'; nome: string; padrao: RegExp }

export const ESSENCIAIS: Essencial[] = [
  { id: 'oque', nome: 'o quê', padrao: /acampamento das familias/ },
  { id: 'quando', nome: 'quando', padrao: /14 de setembro/ },
  { id: 'onde', nome: 'onde', padrao: /recanto verde/ },
];

export const essenciaisQueFaltam = (texto: string) => ESSENCIAIS.filter(e => !e.padrao.test(sem(texto)));

/** Todo o texto que a página impressa diz: a matéria e os textos soltos. */
export const textoDoConvite = (d: Diagramacao) =>
  [...d.historia.map(p => p.texto), ...d.soltos.map(s => s.texto)].join('\n');

export const imagensDoConvite = (d: Diagramacao) => [...new Set(d.imagens.map(q => q.imagem))];

/**
 * O convite vai para a gráfica: sangria reservada, nada encostando na borda
 * sem passar dela, e toda foto com resolução de impressão no tamanho posta.
 * É a conta da CC-DG005, nas três partes que se aplicam a uma página só.
 */
export function conviteImprimivel(d: Diagramacao): boolean {
  return d.sangria >= SANGRIA_DA_GRAFICA
    && d.imagens.every(q => !encostaSemSangrar(d, q) && ppiEfetivo(d, q) >= PPI_DE_IMPRESSAO);
}

/** O último PDF exportado serve à gráfica, e é do convite como ele está agora. */
export function pdfDoConvitePronto(d: Diagramacao, pdfs: Pdf[]): boolean {
  const ultimo = pdfs[pdfs.length - 1];
  if (!ultimo) return false;
  const r = pdfParaGrafica(d, ultimo);
  return r.sangria && r.marcas && r.cmyk && r.atual;
}

export const usaImagem = (d: Diagramacao, id: string) => d.imagens.some(q => q.imagem === id);
export const nomeNaBiblioteca = (d: Diagramacao, id: string) => imagemDe(d, id)?.nome ?? id;

/* ── A peça digital, que é o requisito 3.2 ────────────────────────────────── */

/**
 * As proporções do meio digital: o post quadrado, o post em retrato e o story.
 * A da folha A5, 1 por 1,41, não é nenhuma delas — num feed ela sai cortada
 * em cima e embaixo, ou com faixas dos lados.
 */
export const PROPORCOES_DIGITAIS: { nome: string; largura: number; altura: number }[] = [
  { nome: 'Post quadrado', largura: 1080, altura: 1080 },
  { nome: 'Post retrato', largura: 1080, altura: 1350 },
  { nome: 'Story', largura: 1080, altura: 1920 },
];

export const proporcaoDoMeio = (p: Prancha) =>
  PROPORCOES_DIGITAIS.some(f => Math.abs(p.largura / p.altura - f.largura / f.altura) < 0.01);

/**
 * A menor letra que se lê num post visto no celular.
 *
 * O post de 1080 pixels aparece com uns 360 de largura na tela do telefone: um
 * terço. A letra de 40 chega a uns 13, que é o menor corpo confortável de
 * leitura; a de 22 do convite encolhido chega a 7, que é o limite da
 * CC-DG004 para a letra existir — existe, e ninguém lê.
 */
export const CORPO_MINIMO_NO_CELULAR = 40;

export const letraDoCelular = (p: Prancha) => textos(p).length > 0 && textos(p).every(t => t.corpo >= CORPO_MINIMO_NO_CELULAR);

/**
 * Quantas palavras um post aguenta. O convite em papel é lido parado; o post
 * passa debaixo do dedo em um segundo e meio, e cada palavra a mais é uma
 * palavra a menos lida.
 */
export const PALAVRAS_DO_POST = 30;

export const textoDoPost = (p: Prancha) => textos(p).map(t => t.texto).join('\n');
export const palavrasDoPost = (p: Prancha) => palavrasDe(textoDoPost(p)).length;

/* ── O processo, que é o requisito 4 ──────────────────────────────────────── */

export interface Rascunho { ideia: string }

export interface DecisaoDeVersao { descartada: boolean; motivo: string }

/**
 * As versões do arquivo: toda prancha que não é uma das duas peças finais.
 *
 * Elas saem do **arquivo**, e não de uma lista escrita à parte: uma versão
 * descartada é uma prancha que alguém guardou antes de refazer, e é isso que
 * se mostra ao examinador. Uma lista de versões que não existem no arquivo
 * seria contar um processo, e não apresentá-lo.
 */
export const versoesDoArquivo = (a: Arte) =>
  a.pranchas.filter(p => p.id !== PRANCHA_DO_SIMBOLO && p.id !== PRANCHA_DO_POST);

export const PALAVRAS_DO_MOTIVO = 8;
export const PALAVRAS_DA_IDEIA = 4;

/** Os motivos dos descartes, cada um com palavras suficientes e nenhum repetido. */
export function motivosProprios(motivos: string[]): boolean {
  const limpos = motivos.map(m => sem(m).replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' '));
  return motivos.every(m => palavrasDe(m).length >= PALAVRAS_DO_MOTIVO) && new Set(limpos).size === limpos.length;
}

/* ── A entrega, que é o requisito 5 ───────────────────────────────────────── */

/**
 * O que cada arquivo da pasta do projeto é.
 *
 * Declarado, e não lido da extensão: `.svg` é o editável do símbolo e também
 * poderia ser um final, e `.png` é final do post e original do clipart. A
 * extensão não sabe, e quem sabe é o projeto.
 */
export type PapelDoArquivo = 'editavel' | 'final' | 'original' | 'terceiro' | 'clipart' | 'versao';

export interface ArquivoDaEntrega { peca: PecaDoProjeto | null; papel: PapelDoArquivo }

/** O nome da pasta como alguém o digita, sem acento nem maiúscula. */
const normal = (s: string) => sem(s).replace(/[^a-z0-9]/g, '');

export const ehPastaDeEditaveis = (a: ArquivoDaNuvem) => a.tipo === 'pasta' && normal(a.nome).startsWith('editave');
export const ehPastaDeFinais = (a: ArquivoDaNuvem) => a.tipo === 'pasta' && normal(a.nome).startsWith('fina');

/** As pastas de editáveis e de finais **dentro** do projeto. */
export function pastasDaEntrega(n: Nuvem, raiz: string) {
  const dentro = (a: ArquivoDaNuvem) => !a.naLixeira && (a.pasta === raiz || pastasAcima(n, a.id).some(p => p.id === raiz));
  return {
    editaveis: n.arquivos.filter(a => dentro(a) && ehPastaDeEditaveis(a)),
    finais: n.arquivos.filter(a => dentro(a) && ehPastaDeFinais(a)),
  };
}

/** O arquivo está dentro de alguma das pastas dadas, em qualquer profundidade. */
export const dentroDe = (n: Nuvem, a: ArquivoDaNuvem, pastas: ArquivoDaNuvem[]) =>
  pastas.some(p => a.pasta === p.id || pastasAcima(n, a.id).some(x => x.id === p.id));

/**
 * Cada peça tem o editável na pasta de editáveis e o final na de finais.
 *
 * As duas metades do requisito 5, e nenhuma se substitui: só o final é o que
 * se entrega a quem vai imprimir, e no ano que vem ninguém consegue mudar a
 * data; só o editável é o que se entrega a quem vai mudar, e a gráfica não
 * abre.
 */
export function pecasNosDois(n: Nuvem, raiz: string, mapa: Record<string, ArquivoDaEntrega>): PecaDoProjeto[] {
  const { editaveis, finais } = pastasDaEntrega(n, raiz);
  const vivos = n.arquivos.filter(a => !a.naLixeira && mapa[a.id]);
  return PECAS_DO_PROJETO.map(x => x.id).filter(peca =>
    vivos.some(a => mapa[a.id].peca === peca && mapa[a.id].papel === 'editavel' && dentroDe(n, a, editaveis))
    && vivos.some(a => mapa[a.id].peca === peca && mapa[a.id].papel === 'final' && dentroDe(n, a, finais)));
}

/** Arquivos soltos na raiz do projeto, fora de toda pasta. */
export const soltosNaRaiz = (n: Nuvem, raiz: string) =>
  n.arquivos.filter(a => !a.naLixeira && a.pasta === raiz && a.tipo !== 'pasta');

/**
 * Os finais nomeados no padrão da CC-ES001: data e versão em cada nome, e
 * todos no mesmo molde. São as funções de lá, importadas, pelo motivo escrito
 * na CC-ES004: escritas aqui elas já divergiriam.
 */
export function finaisNoPadrao(n: Nuvem, raiz: string, mapa: Record<string, ArquivoDaEntrega>): boolean {
  const { finais } = pastasDaEntrega(n, raiz);
  const fs = n.arquivos.filter(a => !a.naLixeira && mapa[a.id]?.papel === 'final' && dentroDe(n, a, finais));
  if (fs.length < PECAS_DO_PROJETO.length) return false;
  const base = (nome: string) => nome.replace(/\.[a-z0-9]+$/i, '');
  return fs.every(a => nomeTemDataEVersao(base(a.nome))) && new Set(fs.map(a => moldeDoNome(base(a.nome)))).size === 1;
}

/* ── O retorno, que é o requisito 6 ───────────────────────────────────────── */

export type Leitura = 'mudar' | 'manter';

export interface Respondente {
  id: string;
  nome: string;
  /** Quem é, nas palavras de quem coletou: é daqui que se decide se é do público. */
  quem: string;
  doPublico: boolean;
  comentario: string;
  /** Se o comentário pede uma mudança que serve à demanda, ou é gosto. */
  leitura: Leitura;
  /** Quando pede mudança: a peça atende ao pedido? */
  atendido?: (post: Prancha) => boolean;
}

export interface Alteracao { respondente: string; oQueMudou: string }

export const PALAVRAS_DA_ALTERACAO = 8;

/* ── A apresentação, que é o requisito 7 ──────────────────────────────────── */

export type ParteDaFala = 'demanda' | 'proposta' | 'pecas' | 'processo' | 'retorno' | 'perguntas';

export const PARTES_DA_FALA: { id: ParteDaFala; nome: string; obrigatoria: boolean }[] = [
  { id: 'demanda', nome: 'A demanda e o público', obrigatoria: true },
  { id: 'proposta', nome: 'A proposta aprovada', obrigatoria: false },
  { id: 'pecas', nome: 'As peças, com a impressa em mãos', obrigatoria: true },
  { id: 'processo', nome: 'Rascunhos e versões descartadas', obrigatoria: true },
  { id: 'retorno', nome: 'O retorno do público e o que mudou', obrigatoria: true },
  { id: 'perguntas', nome: 'Perguntas do examinador', obrigatoria: false },
];

export const MINUTOS_DA_APRESENTACAO = 15;

export type Roteiro = Partial<Record<ParteDaFala, number>>;

export const minutosDo = (r: Roteiro) => Object.values(r).reduce<number>((s, m) => s + (m ?? 0), 0);

/**
 * As peças levam a maior fatia. É delas que o examinador vai perguntar, e é a
 * peça impressa em mãos que o requisito 7 pede; um roteiro que gastasse mais
 * tempo explicando a demanda do que mostrando o que foi feito teria a
 * apresentação de um projeto que não aconteceu.
 */
export const pecasNoCentro = (r: Roteiro) =>
  (r.pecas ?? 0) > 0 && PARTES_DA_FALA.every(p => p.id === 'pecas' || (r[p.id] ?? 0) <= (r.pecas ?? 0));

/* ── Medidas que o post e o convite dividem ───────────────────────────────── */

/** O post se lê: proporção do meio, letra do celular, contraste e pouco texto com o essencial. */
export function postSeLe(p: Prancha | undefined): boolean {
  if (!p) return false;
  return proporcaoDoMeio(p) && letraDoCelular(p) && contrasteFunciona(p)
    && palavrasDoPost(p) <= PALAVRAS_DO_POST && essenciaisQueFaltam(textoDoPost(p)).length === 0;
}
