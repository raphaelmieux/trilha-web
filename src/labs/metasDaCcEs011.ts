/**
 * O que cada lição da CC-ES011 cobra, e de que estado da apresentação ela
 * parte.
 *
 * Mora fora do componente e fora da trava, como o `PASTAS_DA_CC_ES004` e o
 * mapa dos cadernos da CC-ES003, e pelo motivo escrito nos dois: quem lê é a
 * tela, que monta a lição, **e** a trava, que confere que nenhuma meta abre
 * verde. Escrito só na trava, a tela repetiria a escolha e as duas divergiriam
 * na primeira lição nova — com a trava continuando verde conferindo uma lição
 * que a tela não abre.
 *
 * ── Cada lição parte de onde a anterior acabou ───────────────────────────
 * O módulo 1 recebe a apresentação como a secretaria a entregou; o módulo 2
 * recebe a mesma com o mestre já pronto. Começar a segunda lição mandando
 * refazer a primeira ensinaria que o trabalho anterior não conta, e as metas
 * do módulo 1 apareceriam cumpridas ou não ao acaso. É o campo `documento` da
 * CC-ES002 e o `caderno` da CC-ES003 outra vez.
 *
 * Onde a mudança é **mecânica** — limpar a formatação direta, aplicar o
 * layout, trocar uma cor, compactar uma imagem —, o estado se deriva chamando
 * a função do modelo: derivar não tem como divergir do que a lição faz. Onde
 * a mudança **é o texto** — encurtar um tópico, escrever uma nota, juntar dois
 * slides —, ele está escrito, porque não há de onde derivar prosa.
 */

import { contrastRatio } from '../lib/imageTools';
import {
  CORES_DO_MODELO, aplicarLayout, compactarImagem,
  limparFormatacaoDireta, maisPalavrasNumSlide, palavrasDoSlide,
  pesoEmMegabytes, resolucaoDaImagem, slidesComFormatacaoDireta,
  textoDaApresentacao,
  type Apresentacao, type Slide,
} from './apresentacao';
import {
  APRESENTACAO_DO_ACAMPAMENTO, CONTRASTE_MINIMO, CUSTOS_DE_HOJE,
  IDEIAS_ESSENCIAIS, OURO_DO_CLUBE, OURO_LEGIVEL, PLANILHA_DOS_CUSTOS,
  VERDE_DO_CLUBE, VERDE_LEGIVEL, umaImagemDoClube,
  type IdeiaEssencial,
} from './apresentacaoDoAcampamento';

/* ── A lição, e o que viaja com ela ───────────────────────────────────────── */

export type LicaoDaCcEs011 =
  | 'mestre' | 'layout' | 'hierarquia' | 'contraste' | 'erros'
  | 'imagens' | 'grafico' | 'notas' | 'corte' | 'cinco-minutos';

/** O que a pessoa escreveu no caderno, que é da plataforma e não do programa. */
export interface CadernoDaApresentacao {
  /** Para cada erro mostrado, o que ele é e o que ele faz com quem assiste. */
  erros: Record<string, { erro: string; efeito: string }>;
  /** O que fazer em vez dele, com as palavras de quem escreveu. */
  emVezDisso: Record<string, string>;
  /** Cada slide cortado, e por quê — é o "justificando por escrito" do 5. */
  cortes: { slide: string; porque: string }[];
  /** A primeira frase da fala, que é o que o roteiro prepara. */
  abertura: string;
}

export const CADERNO_VAZIO: CadernoDaApresentacao =
  { erros: {}, emVezDisso: {}, cortes: [], abertura: '' };

export interface ContextoDaApresentacao {
  ap: Apresentacao;
  /** Os custos **na planilha**, que é de onde o gráfico tem de vir. */
  custos: { rotulo: string; valor: number }[];
  /**
   * O que a pessoa viu acontecer.
   *
   * Fica no contexto da lição, e não na apresentação: o que aconteceu foi com
   * quem estuda, e não com o arquivo. É a decisão de `descobertas` da
   * CC-ES004, escrita lá.
   */
  descobertas: string[];
  caderno: CadernoDaApresentacao;
}

export const CHAVE_DO_PULO = 'viu-o-titulo-pular';
export const CHAVE_DA_SALA_CLARA = 'viu-na-sala-clara';
export const CHAVE_DO_PESO = 'viu-o-peso-do-arquivo';
export const CHAVE_DO_GRAFICO = 'viu-qual-acompanhou';
export const CHAVE_DO_APRESENTADOR = 'viu-o-modo-do-apresentador';
export const CHAVE_DO_ROTEIRO = 'leu-o-roteiro';

/* ── O mestre que o clube quer, e a cor que ele escolheu ──────────────────── */

/** A identidade do clube no mestre: a fonte, a cor do título, o logo, o número. */
const comIdentidade = (a: Apresentacao): Apresentacao => ({
  ...a,
  mestre: {
    ...a.mestre,
    fonteDoTitulo: 'Georgia', fonteDoCorpo: 'Calibri',
    /* O ouro do emblema e o verde da camisa, escolhidos pelo emblema e pela
       camisa: 2,42:1 e 3,48:1 sobre o branco. O módulo 1 não fala de
       contraste, e pôr aqui as cores legíveis apagaria o módulo 4. */
    corDoTitulo: OURO_DO_CLUBE, corDoCorpo: VERDE_DO_CLUBE,
    logo: true, numeroNoPe: true,
  },
});

/** O mesmo mestre, com as cores que se leem — que é o módulo 4. */
const comCoresLegiveis = (a: Apresentacao): Apresentacao => ({
  ...a,
  mestre: { ...a.mestre, corDoTitulo: OURO_LEGIVEL, corDoCorpo: VERDE_LEGIVEL },
});

const mapearSlides = (a: Apresentacao, f: (s: Slide) => Slide): Apresentacao =>
  ({ ...a, slides: a.slides.map(f) });

/** Sem formatação direta sobrando: o mestre passou a valer. */
const semDireta = (a: Apresentacao) => mapearSlides(a, limparFormatacaoDireta);

/** As caixas à mão foram para o espaço reservado do layout. */
const comLayouts = (a: Apresentacao) => mapearSlides(a, s => {
  if (s.caixas.length === 0) return s;
  /* O primeiro slide é o de abertura, e o layout dele é o de título — centrado,
     com o subtítulo embaixo. Aplicar "Título e Conteúdo" nele funcionaria e
     deixaria a abertura com cara de slide do meio. */
  if (s.id === 's1') return aplicarLayout(s, 'titulo');
  return aplicarLayout(s, s.caixas.some(c => c.papel === 'corpo') ? 'titulo-conteudo' : 'so-titulo');
});

/* ── O texto encurtado, que é a resposta do módulo 3 ──────────────────────── */

/**
 * Os tópicos do jeito que eles ficam quando param de ser a fala.
 *
 * Está escrito porque não há de onde derivar prosa, e é o estado de que o
 * módulo 4 parte — a decisão do relatório da CC-ES002, que também chega com o
 * que os módulos anteriores pediram. Nenhum passa de oito palavras, e nenhum
 * slide passa de seis tópicos.
 */
const TOPICOS_ENXUTOS: Record<string, string[]> = {
  s1: ['Clube de Desbravadores Pioneiros'],
  s2: ['Desde 1998, quarenta e nove desbravadores', 'Seis unidades, diretoria voluntária',
    'Sábados, 14h às 17h, no salão'],
  s3: ['A maior atividade do ano', 'Barracas e fogão de campanha',
    'A partir de dez anos, com autorização assinada'],
  s4: ['13 a 15 de junho de 2026', 'Chácara Recanto Verde, estrada do Contorno, km 12'],
  s5: ['Ônibus do clube: sexta, dezenove horas, no salão',
    'Carro próprio: avise a secretaria antes', 'O portão fica depois da ponte, à direita'],
  s6: ['Saco de dormir e isolante térmico', 'Lanterna com pilha de reserva',
    'Agasalho, touca e luva: sete graus'],
  s7: ['Bíblia, caderno e caneta', 'Prato, caneca e talher com o nome',
    'Remédio de uso contínuo: entregue na enfermaria'],
  s8: ['Eletrônico de jogo, caixa de som', 'Nada de valor',
    'Faca e canivete ficam com a liderança'],
  s9: ['19h: saída do salão', '21h: chegada e montagem', '23h: silêncio'],
  s10: ['7h: alvorada e culto', '9h: classes e especialidades', '15h: atividades de campo',
    '20h: fogueira e culto'],
  s11: ['7h: café e desmontagem', '10h: inspeção das áreas', '11h: saída da chácara'],
  s13: ['À vista até 30 de maio', 'Ou duas parcelas, a segunda até 10/06',
    'Pix para a tesouraria', 'Comprovante na secretaria',
    'Precisa de ajuda? Fale com a diretoria'],
  s15: ['Silêncio é para todos', 'Ninguém sai da área sem a liderança',
    'Área inspecionada no domingo'],
  s16: ['Liderança da unidade, ou a secretaria'],
};

const comTextoEnxuto = (a: Apresentacao) => mapearSlides(a, s => (
  TOPICOS_ENXUTOS[s.id] ? { ...s, topicos: TOPICOS_ENXUTOS[s.id] } : s
));

/* ── As imagens resolvidas, que é o módulo 6 ──────────────────────────────── */

/** O logo grande no lugar do pequeno, e as fotos compactadas a 150 ppi. */
const comImagensResolvidas = (a: Apresentacao) => mapearSlides(a, s => ({
  ...s,
  imagens: s.imagens.map(img => (
    img.legenda === 'logo-clube.png'
      ? umaImagemDoClube(img.id, 'logo-clube-grande.png', img.largura)
      : compactarImagem(img, 150)
  )),
}));

/* ── O gráfico que veio da planilha, que é o módulo 7 ─────────────────────── */

/** A tabela digitada sai, e entra o gráfico incorporado da planilha. */
const comGraficoDaPlanilha = (a: Apresentacao) => mapearSlides(a, s => (
  s.id !== 's12' ? s : {
    ...s,
    topicos: [],
    grafico: {
      id: 's12-g', como: 'incorporado', planilha: PLANILHA_DOS_CUSTOS,
      retrato: CUSTOS_DE_HOJE.map(c => ({ ...c })),
    },
  }
));

/* ── As notas escritas, que é o módulo 8 ──────────────────────────────────── */

/** O que se **fala** em cada slide, que é o que não vai para o telão. */
const NOTAS_ESCRITAS: Record<string, string> = {
  s1: 'Agradecer a presença e dizer que em dez minutos a gente responde tudo.',
  s3: 'Contar que o acampamento é onde a maior parte das especialidades de campo sai de uma vez.',
  s4: 'Lembrar que a chácara é a mesma do ano passado, e que o mapa vai no grupo.',
  s5: 'Avisar que quem for de carro precisa falar com a secretaria para o portão ficar aberto.',
  s6: 'Dizer que a temperatura chega perto dos sete graus de madrugada.',
  s7: 'Explicar que o remédio é entregue na chegada, com a receita, e devolvido no domingo.',
  s12: 'Dizer que o valor subiu por causa da alimentação, e que a planilha está aberta a quem quiser ver.',
  s13: 'Falar com calma da ajuda: ninguém fica de fora por dinheiro, e isso é conversado em particular.',
  s15: 'Repetir a regra da área com todas as letras, porque é a que mais custa quando falha.',
};

const comNotas = (a: Apresentacao) => mapearSlides(a, s => (
  NOTAS_ESCRITAS[s.id] ? { ...s, notas: NOTAS_ESCRITAS[s.id] } : s
));

/* ── A apresentação cortada pela metade, que é o módulo 9 ─────────────────── */

/**
 * Os oito slides, que é o que o requisito 5 pede da apresentação de dezesseis.
 *
 * Juntar não é concatenar: nove tópicos num slide não é um slide, é três
 * empilhados — e o limite de seis que o módulo 3 estabeleceu continua valendo.
 * Então juntar **consolida**: o que era "parte 1" e "parte 2" vira uma lista
 * de seis, e o que a família não precisa ouvir numa apresentação de cinco
 * minutos sai. As dez ideias essenciais continuam todas lá, e é isso que
 * separa cortar de perder conteúdo.
 *
 * O que ela **não** faz é caber no orçamento de vinte palavras por slide: o
 * slide do que levar sai com trinta e cinco. Cortar slide e cortar palavra são
 * duas coisas, e a segunda é o módulo 10.
 */
const JUNTADOS: { de: string[]; titulo: string; topicos: string[] }[] = [
  { de: ['s2', 's3'], titulo: 'O clube e o acampamento', topicos: [
    'Desde 1998, seis unidades',
    'A maior atividade do ano',
    'Barracas e fogão de campanha',
    'A partir de dez anos, com autorização assinada',
  ] },
  { de: ['s4', 's5'], titulo: 'Quando, onde e como chegar', topicos: [
    '13 a 15 de junho de 2026',
    'Chácara Recanto Verde, estrada do Contorno, km 12',
    'Ônibus do clube: sexta, dezenove horas, no salão',
    'O portão fica depois da ponte, à direita',
  ] },
  { de: ['s6', 's7', 's8'], titulo: 'O que levar', topicos: [
    'Saco de dormir e isolante térmico',
    'Lanterna com pilha de reserva',
    'Agasalho, touca e luva',
    'Prato, caneca e talher com o nome',
    'Remédio de uso contínuo: entregue na enfermaria',
    'Não leve eletrônico nem nada de valor',
  ] },
  { de: ['s9', 's10', 's11'], titulo: 'Programação', topicos: [
    'Sexta, 19h: saída e montagem',
    'Sábado: culto, classes, campo, fogueira',
    'Domingo, 11h: saída da chácara',
  ] },
  { de: ['s12', 's13'], titulo: 'Custos e pagamento', topicos: [
    'À vista até 30 de maio',
    'Ou duas parcelas, a segunda até 10/06',
    'Pix para a tesouraria',
    'Precisa de ajuda? Fale com a diretoria',
  ] },
  { de: ['s15', 's16'], titulo: 'Regras e dúvidas', topicos: [
    'Silêncio é para todos',
    'Ninguém sai da área sem a liderança',
    'Área inspecionada no domingo',
    'Dúvidas: liderança da unidade ou secretaria',
  ] },
];

const cortadaPelaMetade = (a: Apresentacao): Apresentacao => {
  const porId = new Map(a.slides.map(s => [s.id, s]));
  const consumidos = new Set(JUNTADOS.flatMap(j => j.de.slice(1)));
  const slides = a.slides
    .filter(s => !consumidos.has(s.id))
    .map(s => {
      const junto = JUNTADOS.find(j => j.de[0] === s.id);
      if (!junto) return s;
      /* O gráfico e as imagens dos slides juntados vêm junto: o conteúdo é o
         que não pode sair, e o gráfico dos custos é uma das dez ideias. */
      const outros = junto.de.slice(1).map(id => porId.get(id)).filter((x): x is Slide => !!x);
      return {
        ...s,
        titulo: junto.titulo,
        topicos: junto.topicos,
        imagens: [...s.imagens, ...outros.flatMap(o => o.imagens)],
        grafico: s.grafico ?? outros.find(o => o.grafico)?.grafico,
        notas: [s.notas, ...outros.map(o => o.notas)].filter(n => n.trim()).join(' '),
      };
    });
  return { ...a, slides };
};

/* ── Os nove estados, cada um partindo de onde o anterior acabou ───────────── */

const PARTIDA = APRESENTACAO_DO_ACAMPAMENTO;
const DEPOIS_DO_MESTRE = semDireta(comIdentidade(PARTIDA));
const DEPOIS_DO_LAYOUT = comLayouts(DEPOIS_DO_MESTRE);
const DEPOIS_DA_HIERARQUIA = comTextoEnxuto(DEPOIS_DO_LAYOUT);
const DEPOIS_DO_CONTRASTE = comCoresLegiveis(DEPOIS_DA_HIERARQUIA);
const DEPOIS_DAS_IMAGENS = comImagensResolvidas(DEPOIS_DO_CONTRASTE);
const DEPOIS_DO_GRAFICO = comGraficoDaPlanilha(DEPOIS_DAS_IMAGENS);
const DEPOIS_DAS_NOTAS = comNotas(DEPOIS_DO_GRAFICO);
const DEPOIS_DO_CORTE = cortadaPelaMetade(DEPOIS_DAS_NOTAS);

const comApresentacao = (ap: Apresentacao): ContextoDaApresentacao =>
  ({ ap, custos: CUSTOS_DE_HOJE.map(c => ({ ...c })), descobertas: [], caderno: CADERNO_VAZIO });

/** De que estado cada lição parte. */
export const PARTIDA_DA_LICAO: Record<LicaoDaCcEs011, () => ContextoDaApresentacao> = {
  'mestre': () => comApresentacao(PARTIDA),
  'layout': () => comApresentacao(DEPOIS_DO_MESTRE),
  'hierarquia': () => comApresentacao(DEPOIS_DO_LAYOUT),
  'contraste': () => comApresentacao(DEPOIS_DA_HIERARQUIA),
  'erros': () => comApresentacao(DEPOIS_DO_CONTRASTE),
  'imagens': () => comApresentacao(DEPOIS_DO_CONTRASTE),
  'grafico': () => comApresentacao(DEPOIS_DAS_IMAGENS),
  'notas': () => comApresentacao(DEPOIS_DO_GRAFICO),
  'corte': () => comApresentacao(DEPOIS_DAS_NOTAS),
  'cinco-minutos': () => comApresentacao(DEPOIS_DO_CORTE),
};

/* ── Os três erros, e o que cada um faz com quem assiste ──────────────────── */

/**
 * Os três erros frequentes do requisito 3, nos **próprios slides do clube**.
 *
 * Eles não são exemplos inventados: são os três slides que os módulos 1 a 4
 * acabaram de consertar, mostrados do jeito que as famílias os teriam visto.
 * Inventar slides ruins deixaria a lição genérica; estes a pessoa reconhece,
 * porque trabalhou neles.
 *
 * O efeito é sobre **quem assiste**, e não sobre o arquivo — é literalmente o
 * que o requisito pede, e é a parte que ninguém escreve: quase todo conselho
 * sobre apresentação diz o que não fazer e não diz o que acontece com a sala.
 */
export interface ErroDeApresentacao {
  id: string;
  /** O slide do clube que o mostra, no estado em que ele tinha o defeito. */
  slide: string;
  erro: string;
  efeito: string;
  /** O que fazer em vez dele, para quem travar — e nunca a resposta certa. */
  saida: string;
}

export const ERROS_FREQUENTES: ErroDeApresentacao[] = [
  {
    id: 'texto',
    slide: 's2',
    erro: 'O slide traz a fala escrita, e não o apoio dela',
    efeito: 'A plateia lê o slide e para de ouvir quem fala',
    saida: 'Deixe no slide o que ninguém guarda de ouvido — a data, o valor, o nome do lugar — e o resto vá para a nota do apresentador.',
  },
  {
    id: 'contraste',
    slide: 's4',
    erro: 'A cor foi escolhida pela identidade, e não pela leitura',
    efeito: 'Quem está no fundo da sala desiste e olha o celular',
    saida: 'Escureça a cor do clube até ela se ler sobre o fundo; ela continua sendo a cor do clube.',
  },
  {
    id: 'hierarquia',
    slide: 's12',
    erro: 'Tudo tem o mesmo peso, inclusive o que decide',
    efeito: 'A plateia não sabe o que precisa anotar',
    saida: 'Uma coisa por slide fica grande, e o resto fica menor — o número que a família vai anotar não pode parecer com os quatro de cima dele.',
  },
];

/**
 * As opções de erro, misturadas.
 *
 * Cinco para três slides, com duas que não respondem — e por conjunto igual,
 * como os indícios da CC-ES005: exigir só que as certas estejam marcadas
 * deixaria "marque todas" passar com louvor.
 */
export const OPCOES_DE_ERRO: { diz: string; porque?: string }[] = [
  ...ERROS_FREQUENTES.map(e => ({ diz: e.erro })),
  {
    diz: 'A fonte não é a da identidade do clube',
    porque: 'é verdade em alguns slides e não é o que atrapalha quem assiste: trocar a fonte não devolve ninguém para a fala.',
  },
  {
    diz: 'Faltam animações entre os tópicos',
    porque: 'animação não resolve nenhum dos três, e é o que se acrescenta quando não se sabe o que cortar.',
  },
];

export const OPCOES_DE_EFEITO: { diz: string; porque?: string }[] = [
  ...ERROS_FREQUENTES.map(e => ({ diz: e.efeito })),
  {
    diz: 'A apresentação demora mais para abrir no computador do clube',
    porque: 'isso é o peso do arquivo, que é o requisito 4.3, e não tem nada que ver com quem está assistindo.',
  },
  {
    diz: 'Quem está apresentando esquece o que ia dizer',
    porque: 'quem esquece a fala é quem não tem nota do apresentador — justamente o requisito 4.5. Quem tem o slide cheio lê o slide e não esquece nada; o problema dele é outro.',
  },
];

/* ── Quando uma ideia essencial se perdeu ─────────────────────────────────── */

/**
 * Quais das dez informações saíram da apresentação.
 *
 * Duas maneiras de carregar uma ideia, as duas declaradas: o texto que
 * projeta, e o gráfico dos custos. Procurar tudo no texto acusaria de perda
 * justamente quem cumpriu o requisito 4.4, trocando a tabela digitada pelo
 * gráfico.
 */
export function ideiasPerdidas(a: Apresentacao): IdeiaEssencial[] {
  const texto = textoDaApresentacao(a).toLowerCase();
  const temGraficoDosCustos = a.slides.some(s => s.grafico?.planilha === PLANILHA_DOS_CUSTOS);
  const temTabelaDigitada = a.slides.some(s => s.topicos.some(t => /R\$ ?\d/.test(t)));
  return IDEIAS_ESSENCIAIS.filter(i => (
    i.peloGrafico
      ? !(temGraficoDosCustos || temTabelaDigitada)
      : !texto.includes(i.marca.toLowerCase())
  ));
}

/** O maior número de tópicos num slide, que é o teto da hierarquia. */
const maisTopicosNumSlide = (a: Apresentacao) =>
  a.slides.reduce((m, s) => Math.max(m, s.topicos.length), 0);

/** A frase mais comprida que alguém pôs num tópico. */
const maisPalavrasNumTopico = (a: Apresentacao) => a.slides
  .flatMap(s => s.topicos)
  .reduce((m, t) => Math.max(m, t.trim().split(/\s+/).filter(Boolean).length), 0);

export const TETO_DE_TOPICOS = 6;
export const TETO_DE_PALAVRAS_NO_TOPICO = 8;
export const TETO_DE_PALAVRAS_NO_SLIDE = 20;
export const TETO_DE_SLIDES = 10;
export const METADE_DOS_SLIDES = 8;
export const TETO_DE_MEGABYTES = 5;

/** Se a cor continua sendo a do clube, e não preto resolvendo a conta. */
const continuaOuro = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return r > g && g > b;
};
const continuaVerde = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return g > r && g > b;
};

/* ── As metas, lição por lição ────────────────────────────────────────────── */

export interface MetaDaApresentacao {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDaApresentacao) => boolean;
}

/**
 * O texto não mudou.
 *
 * Viaja como **conjunção** de cada meta que mexe em formatação, e não como
 * item da lista: ela é verdadeira no segundo zero, e como tarefa própria
 * abriria verde — que `veredas.test.ts` reprova, e com razão. É a decisão de
 * "sem alterar uma palavra do texto" da CC-ES002, escrita lá.
 */
const textoIntacto = (c: ContextoDaApresentacao, original: Apresentacao) =>
  textoDaApresentacao(c.ap) === textoDaApresentacao(original);

const METAS_DO_MESTRE: MetaDaApresentacao[] = [
  {
    id: 'identidade-no-mestre',
    titulo: 'Pôr a identidade do clube no slide mestre',
    detalhe: 'A fonte e a cor do título, uma vez, para os dezesseis slides. Sem alterar uma palavra do texto.',
    onde: 'Exibir → Slide Mestre',
    passos: [
      'Abra Exibir e clique em Slide Mestre.',
      'Clique no espaço reservado do título e escolha a fonte e a cor do clube.',
      'Clique no espaço do corpo e escolha a fonte dele.',
      'Feche a exibição do mestre em Fechar Modo de Exibição Mestre.',
    ],
    feita: c => c.ap.mestre.fonteDoTitulo.trim() !== ''
      && c.ap.mestre.fonteDoCorpo.trim() !== ''
      && c.ap.mestre.corDoTitulo !== CORES_DO_MODELO.branco.titulo
      && textoIntacto(c, PARTIDA),
  },
  {
    id: 'logo-e-numero',
    titulo: 'O logo e o número do slide, no mestre e não em cada slide',
    detalhe: 'Postos no mestre, eles aparecem nos dezesseis. O número é campo: ele conta a folha, e não um número digitado.',
    onde: 'Exibir → Slide Mestre → Inserir',
    passos: [
      'Com o mestre aberto, ligue o logo do clube no canto.',
      'Ligue o número do slide no pé.',
      'Feche o mestre e repare na tira lateral: os dezesseis receberam os dois.',
    ],
    feita: c => c.ap.mestre.logo && c.ap.mestre.numeroNoPe && textoIntacto(c, PARTIDA),
  },
  {
    id: 'sem-direta',
    titulo: 'Tirar a formatação que foi aplicada à mão',
    detalhe: 'Enquanto ela estiver lá, ela vence o mestre — e mexer no mestre não muda nada na tela.',
    onde: 'Página Inicial → Limpar Formatação',
    passos: [
      'Escolha um slide e repare: o título dele ainda não é o do mestre.',
      'Selecione os slides na tira lateral e clique em Limpar Formatação.',
      'O título de todos passa a ser o que o mestre manda.',
    ],
    feita: c => slidesComFormatacaoDireta(c.ap).length === 0 && textoIntacto(c, PARTIDA),
  },
];

const METAS_DO_LAYOUT: MetaDaApresentacao[] = [
  {
    id: 'viu-o-pulo',
    titulo: 'Passar os slides e ver o título pular',
    detalhe: 'Cada slide está perfeito. O defeito só existe na sequência, e é por isso que ninguém o vê trabalhando num slide por vez.',
    onde: 'Apresentação de Slides → Do Começo',
    passos: [
      'Clique em Apresentação de Slides e comece do primeiro.',
      'Passe de um para o outro e olhe para a **altura** do título.',
      'Volte para a edição quando tiver visto.',
    ],
    feita: c => c.descobertas.includes(CHAVE_DO_PULO),
  },
  {
    id: 'sem-caixa-a-mao',
    titulo: 'Pôr o texto no layout, e não em caixa desenhada',
    detalhe: 'O espaço reservado do layout tem posição fixa; a caixa desenhada tem a posição em que ela ficou. Sem alterar uma palavra do texto.',
    onde: 'Página Inicial → Layout',
    passos: [
      'Escolha um slide cujo título está numa caixa solta.',
      'Clique em Layout e escolha o que serve ao que o slide tem.',
      'O texto vai para o espaço reservado, e a caixa deixa de existir.',
      'Repita nos outros cinco.',
    ],
    feita: c => c.ap.slides.every(s => s.caixas.length === 0)
      && textoIntacto(c, DEPOIS_DO_MESTRE),
  },
  {
    id: 'abertura-com-layout-de-titulo',
    titulo: 'A abertura usa o layout de título',
    detalhe: 'Centrado, com o subtítulo embaixo. "Título e Conteúdo" funciona e deixa a abertura com cara de slide do meio.',
    onde: 'Página Inicial → Layout',
    passos: [
      'Vá ao primeiro slide.',
      'Em Layout, escolha Slide de Título.',
    ],
    feita: c => c.ap.slides[0]?.layout === 'titulo' && c.ap.slides[0]?.caixas.length === 0,
  },
];

const METAS_DA_HIERARQUIA: MetaDaApresentacao[] = [
  {
    id: 'titulo-maior',
    titulo: 'O título se lê antes do corpo',
    detalhe: 'Hierarquia visual é a ordem em que o olho lê. Com título e corpo do mesmo tamanho, não há ordem nenhuma — o olho começa onde cair.',
    onde: 'Exibir → Slide Mestre',
    passos: [
      'Abra o mestre.',
      'Deixe o título ao menos metade maior que o corpo.',
    ],
    feita: c => c.ap.mestre.tamanhoDoTitulo >= c.ap.mestre.tamanhoDoCorpo * 1.5,
  },
  {
    id: 'seis-topicos',
    titulo: `No máximo ${TETO_DE_TOPICOS} tópicos por slide`,
    detalhe: 'Nove itens iguais não têm hierarquia: são uma lista, e lista não se lê projetada. Divida ou corte.',
    onde: 'No slide, no texto',
    passos: [
      'Procure na tira lateral o slide com mais itens.',
      'Tire o que a família não vai anotar, ou divida em dois slides.',
    ],
    feita: c => maisTopicosNumSlide(c.ap) <= TETO_DE_TOPICOS,
  },
  {
    id: 'topico-nao-e-frase',
    titulo: `Tópico de até ${TETO_DE_PALAVRAS_NO_TOPICO} palavras`,
    detalhe: 'Um tópico de vinte palavras é um parágrafo com um ponto na frente — e é a fala escrita no slide.',
    onde: 'No slide, no texto',
    passos: [
      'Clique num tópico e encurte-o até ele caber numa linha.',
      'O que sobrar da frase é fala, e vai para a nota do apresentador no módulo 8.',
    ],
    /*
      Encurtar pode perder o que não pode sair, e por isso as dez informações
      essenciais viajam conjugadas aqui também — e não só no corte do módulo 9.
      Truncar cada frase nas oito primeiras palavras deixa esta meta verde e
      leva embora o "dezenove horas" da saída do ônibus, sem nada acusar.
    */
    feita: c => maisPalavrasNumTopico(c.ap) <= TETO_DE_PALAVRAS_NO_TOPICO
      && ideiasPerdidas(c.ap).length === 0,
  },
];

/** O contraste sobre o fundo do mestre, que é onde o texto de fato pousa. */
const contrasteDoTitulo = (a: Apresentacao) =>
  contrastRatio(a.mestre.corDoTitulo, a.mestre.corDoFundo);
const contrasteDoCorpo = (a: Apresentacao) =>
  contrastRatio(a.mestre.corDoCorpo, a.mestre.corDoFundo);

const METAS_DO_CONTRASTE: MetaDaApresentacao[] = [
  {
    id: 'viu-na-sala-clara',
    titulo: 'Ver o slide como a sala o vê',
    detalhe: 'O projetor numa sala com luz lava a cor. O que no computador é um ouro bonito, no telão é um texto que não está lá.',
    onde: 'Apresentação de Slides → Com luz na sala',
    passos: [
      'Entre na apresentação e ligue a luz da sala.',
      'Olhe o título e os tópicos.',
    ],
    feita: c => c.descobertas.includes(CHAVE_DA_SALA_CLARA),
  },
  {
    id: 'titulo-se-le',
    titulo: `O título passa de ${String(CONTRASTE_MINIMO).replace('.', ',')}:1`,
    detalhe: `O ouro do emblema mede 2,42:1 sobre o branco. Escureça-o: ele continua sendo o ouro do clube.`,
    onde: 'Exibir → Slide Mestre → cor do título',
    passos: [
      'Abra o mestre e clique na cor do título.',
      'Escolha um tom mais escuro da mesma cor.',
      'A medida aparece ao lado da cor, como no seletor do PowerPoint.',
    ],
    feita: c => contrasteDoTitulo(c.ap) >= CONTRASTE_MINIMO && continuaOuro(c.ap.mestre.corDoTitulo),
  },
  {
    id: 'corpo-se-le',
    titulo: `O corpo também passa de ${String(CONTRASTE_MINIMO).replace('.', ',')}:1`,
    detalhe: 'O verde da camisa mede 3,48:1 — passa como título grande e não passa como texto corrido, que é o que o corpo é.',
    onde: 'Exibir → Slide Mestre → cor do corpo',
    passos: [
      'Com o mestre aberto, clique na cor do corpo.',
      'Escureça o verde até a medida passar.',
    ],
    feita: c => contrasteDoCorpo(c.ap) >= CONTRASTE_MINIMO && continuaVerde(c.ap.mestre.corDoCorpo),
  },
];

const METAS_DOS_ERROS: MetaDaApresentacao[] = [
  {
    id: 'nomeou-os-erros',
    titulo: 'Dizer qual é o erro de cada um dos três slides',
    detalhe: 'São os três slides que você acabou de consertar, do jeito que as famílias os teriam visto. Há cinco opções para três slides, e duas delas não respondem.',
    onde: 'No caderno, ao lado do slide',
    passos: [
      'Entre na apresentação e olhe o primeiro dos três como a sala o veria.',
      'No caderno, escolha o que está errado nele.',
      'Repita nos outros dois.',
    ],
    feita: c => ERROS_FREQUENTES.every(e => c.caderno.erros[e.id]?.erro === e.erro),
  },
  {
    id: 'nomeou-os-efeitos',
    titulo: 'E o que cada um faz com quem assiste',
    detalhe: 'É a segunda metade do requisito, e a que ninguém escreve: o conselho de sempre diz o que não fazer e não diz o que acontece com a sala.',
    onde: 'No caderno, ao lado do slide',
    passos: [
      'Para cada um dos três, escolha o efeito sobre quem está assistindo.',
      'Repare que os cinco efeitos são diferentes: só um responde a cada slide.',
    ],
    feita: c => ERROS_FREQUENTES.every(e => c.caderno.erros[e.id]?.efeito === e.efeito),
  },
  {
    id: 'o-que-fazer-em-vez',
    titulo: 'Escrever o que fazer em vez de cada um',
    detalhe: 'Com as suas palavras, e numa frase. Quem sabe dizer o que fazer em vez disso não comete o erro de novo.',
    onde: 'No caderno, no campo de escrever',
    passos: [
      'Depois de classificar um erro, escreva no caderno o que você faria no lugar.',
      'Uma frase basta, e ela precisa ser sua.',
    ],
    feita: c => ERROS_FREQUENTES.every(e => (c.caderno.emVezDisso[e.id] ?? '').trim().length >= 25),
  },
];

const METAS_DAS_IMAGENS: MetaDaApresentacao[] = [
  {
    id: 'viu-o-peso',
    titulo: 'Olhar quanto o arquivo pesa',
    detalhe: 'Três fotos de celular passam de dez megabytes, e a apresentação deixa de caber num anexo de e-mail. Nada na tela diz isso.',
    onde: 'Arquivo → Informações',
    passos: [
      'Abra a guia Arquivo e vá em Informações.',
      'Olhe o tamanho do arquivo.',
    ],
    feita: c => c.descobertas.includes(CHAVE_DO_PESO),
  },
  {
    id: 'nada-esticado',
    titulo: 'Nenhuma imagem esticada além do que ela tem',
    detalhe: 'O logo tem 320 pixels e está ocupando quase metade do slide. Na tela do computador ele fica bonito; no telão, serrilhado. O clube também tem o arquivo grande.',
    onde: 'Formato da Imagem, ou Inserir → Imagens',
    passos: [
      'Clique no logo e veja o tamanho do arquivo dele.',
      'Ou troque pelo arquivo grande que o clube tem, ou reduza o espaço que ele ocupa.',
      'Os dois caminhos resolvem.',
    ],
    feita: c => c.ap.slides.flatMap(s => s.imagens).every(i => resolucaoDaImagem(i) !== 'baixa'),
  },
  {
    id: 'arquivo-leve',
    titulo: `O arquivo abaixo de ${TETO_DE_MEGABYTES} MB`,
    detalhe: 'Doze megapixels é dez vezes o que o telão mostra. Compactar tira o que ninguém vê e deixa o arquivo passar por e-mail.',
    onde: 'Formato da Imagem → Compactar Imagens',
    passos: [
      'Clique numa foto e abra Compactar Imagens.',
      'Escolha uma resolução que sirva à projeção — e repare que a de e-mail não serve.',
      'Volte em Arquivo → Informações e compare.',
    ],
    feita: c => pesoEmMegabytes(c.ap) < TETO_DE_MEGABYTES
      && c.ap.slides.flatMap(s => s.imagens).every(i => resolucaoDaImagem(i) !== 'baixa'),
  },
];

const METAS_DO_GRAFICO: MetaDaApresentacao[] = [
  {
    id: 'grafico-da-planilha',
    titulo: 'Trocar a tabela digitada por um gráfico que veio da planilha',
    detalhe: 'Os valores do slide foram digitados antes de a planilha mudar. Eles estão certos em lugar nenhum, e nada avisa.',
    onde: 'Inserir → Gráfico, ou copiar da planilha',
    passos: [
      'Abra a planilha de custos na barra de tarefas e compare com o slide.',
      'Copie o gráfico da planilha.',
      'No slide, apague as linhas digitadas e cole o gráfico.',
    ],
    feita: c => {
      const custos = c.ap.slides.find(s => s.grafico?.planilha === PLANILHA_DOS_CUSTOS);
      return !!custos && !custos.topicos.some(t => /R\$ ?\d/.test(t));
    },
  },
  {
    id: 'grafico-acompanha',
    titulo: 'E ele acompanha a planilha',
    detalhe: 'Colado como imagem, ele congela os números de hoje — e a apresentação do ano que vem mostra os do ano passado.',
    onde: 'Ao colar: Opções de Colagem',
    passos: [
      'Ao colar, escolha a opção que mantém o gráfico ligado à planilha.',
      'Incorporar leva uma cópia da planilha dentro do arquivo; vincular pede que ela viaje junto.',
    ],
    feita: c => c.ap.slides.some(s =>
      s.grafico?.planilha === PLANILHA_DOS_CUSTOS && s.grafico.como !== 'imagem'),
  },
  {
    id: 'viu-qual-acompanhou',
    titulo: 'Mudar um custo na planilha e ver qual representação seguiu',
    detalhe: 'É a única forma de ver a diferença antes do ano que vem.',
    onde: 'Na planilha, e de volta no slide',
    passos: [
      'Vá à planilha e mude um dos valores.',
      'Volte ao slide e olhe o gráfico.',
    ],
    feita: c => c.descobertas.includes(CHAVE_DO_GRAFICO),
  },
];

/** Quantos slides têm nota escrita — e aberta não é escrita. */
const slidesComNota = (a: Apresentacao) => a.slides.filter(s => s.notas.trim() !== '').length;

/** A nota que é cópia de um tópico do próprio slide, que não é nota nenhuma. */
const notasQueRepetemOSlide = (a: Apresentacao) => a.slides.filter(s => {
  const nota = s.notas.trim().toLowerCase();
  if (nota === '') return false;
  return s.topicos.some(t => t.trim().length > 12 && nota.includes(t.trim().toLowerCase()));
}).map(s => s.id);

export const NOTAS_MINIMAS = 6;

const METAS_DAS_NOTAS: MetaDaApresentacao[] = [
  {
    id: 'viu-o-modo-do-apresentador',
    titulo: 'Ver o modo do apresentador',
    detalhe: 'A nota aparece na tela de quem fala e não vai para o telão. É o que faz o slide poder ficar enxuto.',
    onde: 'Apresentação de Slides → Modo de Exibição do Apresentador',
    passos: [
      'Entre na apresentação pelo modo do apresentador.',
      'Repare: a nota está na sua tela, e o telão mostra só o slide.',
    ],
    feita: c => c.descobertas.includes(CHAVE_DO_APRESENTADOR),
  },
  {
    id: 'notas-escritas',
    titulo: `Nota escrita em ao menos ${NOTAS_MINIMAS} slides`,
    detalhe: 'Abrir o painel é um clique, e painel vazio não diz nada a ninguém. A nota é o que você vai falar.',
    onde: 'No painel de notas, embaixo do slide',
    passos: [
      'Clique na faixa de notas embaixo do slide para abri-la.',
      'Escreva o que você vai dizer naquele slide.',
      'Faça isso nos slides em que há algo a explicar.',
    ],
    feita: c => slidesComNota(c.ap) >= NOTAS_MINIMAS
      && maisPalavrasNumSlide(c.ap) <= maisPalavrasNumSlide(DEPOIS_DO_GRAFICO),
  },
  {
    id: 'nota-nao-repete',
    titulo: 'A nota diz o que se fala, e não repete o slide',
    detalhe: 'Nota que copia o tópico não serve: a plateia já leu aquilo, e quem fala passa a ler em voz alta o que está projetado.',
    onde: 'No painel de notas',
    passos: [
      'Leia a sua nota e o tópico do lado.',
      'Se os dois dizem a mesma coisa, troque a nota pelo que você diria *a mais*.',
    ],
    feita: c => slidesComNota(c.ap) >= NOTAS_MINIMAS
      && notasQueRepetemOSlide(c.ap).length === 0,
  },
];

const METAS_DO_CORTE: MetaDaApresentacao[] = [
  {
    id: 'metade-dos-slides',
    titulo: `De dezesseis para ${METADE_DOS_SLIDES} slides`,
    detalhe: 'Juntar não é empilhar: o teto de seis tópicos por slide continua valendo, então juntar obriga a consolidar. As dez informações essenciais não podem sair.',
    onde: 'Na tira lateral, e no texto dos que ficam',
    passos: [
      'Procure dois slides que falam da mesma coisa — "parte 1" e "parte 2", por exemplo.',
      'Reescreva os tópicos de um deles cobrindo os dois, consolidando o que se repete.',
      'Exclua o que ficou vazio.',
      'Confira a lista das dez informações que não podem sair.',
    ],
    feita: c => c.ap.slides.length <= METADE_DOS_SLIDES
      && ideiasPerdidas(c.ap).length === 0
      && maisTopicosNumSlide(c.ap) <= TETO_DE_TOPICOS,
  },
  {
    id: 'cortes-justificados',
    titulo: 'Justificar por escrito cada slide que saiu',
    detalhe: 'É o que o requisito pede com todas as letras. Quem escreve por que cortou descobre, escrevendo, o que não devia ter cortado.',
    onde: 'No caderno, a cada exclusão',
    passos: [
      'A cada slide excluído, escreva no caderno por que ele saiu.',
      'Diga onde o conteúdo dele ficou, quando ele foi para outro slide.',
    ],
    feita: c => {
      const saidos = DEPOIS_DAS_NOTAS.slides
        .filter(s => !c.ap.slides.some(x => x.id === s.id))
        .map(s => s.id);
      return saidos.length > 0
        && saidos.every(id => (c.caderno.cortes.find(x => x.slide === id)?.porque ?? '').trim().length >= 20);
    },
  },
  {
    id: 'titulo-cobre-os-dois',
    titulo: 'O que ficou tem título novo',
    detalhe: '"O que levar — parte 1" não é título de um slide que agora traz as duas partes. Título que sobrou do corte denuncia que foi empilhamento, e não consolidação.',
    onde: 'No título dos slides que ficaram',
    passos: [
      'Olhe o título de cada slide que recebeu conteúdo de outro.',
      'Reescreva-o para cobrir o que o slide passou a dizer.',
    ],
    feita: c => c.ap.slides.length <= METADE_DOS_SLIDES
      && !c.ap.slides.some(s => /parte \d/i.test(s.titulo))
      && ideiasPerdidas(c.ap).length === 0,
  },
];

/* ── Cinco minutos ────────────────────────────────────────────────────────── */

/**
 * Quantos minutos a apresentação leva, no ritmo de quem fala para uma sala.
 *
 * Cento e trinta palavras por minuto é a leitura em voz alta pausada, que é o
 * ritmo de quem explica — e não a conversa, que é mais rápida. A conta serve
 * para a pessoa saber se cabe nos cinco minutos **antes** de descobrir isso na
 * frente do examinador, e por isso ela conta as **notas** e não o slide: o que
 * leva tempo é a fala.
 */
export const PALAVRAS_POR_MINUTO = 130;

export function minutosDeFala(a: Apresentacao): number {
  const palavras = a.slides
    .map(s => s.notas.trim().split(/\s+/).filter(Boolean).length + palavrasDoSlide(s))
    .reduce((t, n) => t + n, 0);
  return palavras / PALAVRAS_POR_MINUTO;
}

/** O PDF está em dia com os slides de agora — ou é um retrato de antes. */
const pdfEmDia = (a: Apresentacao) =>
  a.pdf !== null && a.pdf.length === a.slides.length
  && a.pdf.every((id, i) => id === a.slides[i].id);

const METAS_DOS_CINCO_MINUTOS: MetaDaApresentacao[] = [
  {
    id: 'vinte-palavras',
    titulo: `No máximo ${TETO_DE_PALAVRAS_NO_SLIDE} palavras por slide`,
    detalhe: 'Cortar slide e cortar palavra são duas coisas. O slide do que levar saiu do corte com trinta e cinco. As dez informações essenciais continuam não podendo sair.',
    onde: 'No texto de cada slide',
    passos: [
      'Olhe o contador de palavras de cada slide na régua de status.',
      'Nos que passam de vinte, tire o que você vai **falar** e deixe o que a família vai **anotar**.',
      'O que sair vai para a nota do apresentador.',
    ],
    feita: c => maisPalavrasNumSlide(c.ap) <= TETO_DE_PALAVRAS_NO_SLIDE
      && c.ap.slides.length <= TETO_DE_SLIDES
      && ideiasPerdidas(c.ap).length === 0,
  },
  {
    id: 'abertura-escrita',
    titulo: 'Ler o roteiro e escrever a sua primeira frase',
    detalhe: 'O roteiro lê a apresentação e diz, em português, o que cada slide faz — para você treinar com a sua apresentação na frente. A primeira frase é a única que vale decorar.',
    onde: 'No caderno, em Roteiro',
    passos: [
      'Abra o roteiro no caderno e leia o que ele diz de cada slide.',
      'Escreva a frase com que você vai abrir.',
    ],
    feita: c => c.descobertas.includes(CHAVE_DO_ROTEIRO)
      && c.caderno.abertura.trim().split(/\s+/).filter(Boolean).length >= 6,
  },
  {
    id: 'pdf-por-ultimo',
    titulo: 'Exportar em PDF, depois de terminar',
    detalhe: 'O PDF congela o que existir na hora. Exportar cedo e continuar mexendo entrega um arquivo sem o que veio depois, e nada na tela diz isso.',
    onde: 'Arquivo → Exportar → Criar Documento PDF/XPS',
    passos: [
      'Termine os cortes de palavra primeiro.',
      'Vá em Arquivo → Exportar e crie o PDF.',
      'Se mexer em algo depois, exporte de novo.',
    ],
    feita: c => pdfEmDia(c.ap)
      && maisPalavrasNumSlide(c.ap) <= TETO_DE_PALAVRAS_NO_SLIDE,
  },
];

/* ── O registro ───────────────────────────────────────────────────────────── */

export const METAS_DA_LICAO: Record<LicaoDaCcEs011, MetaDaApresentacao[]> = {
  'mestre': METAS_DO_MESTRE,
  'layout': METAS_DO_LAYOUT,
  'hierarquia': METAS_DA_HIERARQUIA,
  'contraste': METAS_DO_CONTRASTE,
  'erros': METAS_DOS_ERROS,
  'imagens': METAS_DAS_IMAGENS,
  'grafico': METAS_DO_GRAFICO,
  'notas': METAS_DAS_NOTAS,
  'corte': METAS_DO_CORTE,
  'cinco-minutos': METAS_DOS_CINCO_MINUTOS,
};

/** Os slides que o módulo 5 mostra, no estado em que eles tinham o defeito. */
export const SLIDES_DOS_ERROS: Record<string, { ap: Apresentacao; slide: Slide }> =
  Object.fromEntries(ERROS_FREQUENTES.map(e => {
    /* O de contraste precisa do mestre com as cores do clube — é esse o
       defeito dele. Os outros dois precisam do texto como ele chegou. */
    const ap = e.id === 'contraste' ? DEPOIS_DA_HIERARQUIA : PARTIDA;
    const slide = ap.slides.find(s => s.id === e.slide)!;
    return [e.id, { ap, slide }];
  }));
