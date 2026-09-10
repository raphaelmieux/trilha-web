/**
 * O que o laboratório de estilos da AP044 cobra, e de onde ele parte.
 *
 * Mesma razão de `metasDaAp043.ts`: o modelo e o critério moram fora do
 * componente para que um teste os alcance sem montar tela nenhuma.
 * "Laboratório que abre resolvido não ensina nada", e o defeito é invisível de
 * dentro — o painel mostra tarefas concluídas, que é exatamente o que se espera
 * de um laboratório funcionando.
 *
 * ── O que este laboratório é ─────────────────────────────────────────────
 * O requisito 7 da AP044 tem nove itens, e eles parecem nove truques soltos.
 * Sete existem porque alguém decidiu **descrever o papel** de cada pedaço de
 * texto em vez de pintá-lo à mão — e o sumário fecha a lista porque ele é a
 * consequência visível disso, e não um recurso à parte.
 *
 * Por isso o documento nasce com tudo pintado à mão e nenhum estilo aplicado:
 * na tela ele já parece um manual pronto. O que falta não se vê olhando — vê-se
 * ao mandar gerar o sumário, que sai vazio.
 *
 * ── Estilo de parágrafo e estilo de caractere ────────────────────────────
 * Título 1, Título 2 e Citação valem para o parágrafo inteiro; Ênfase vale para
 * o trecho selecionado. A diferença não é detalhe de implementação: é por que
 * "Ênfase" não aparece no sumário e "Título 2" aparece. Aplicar Ênfase a um
 * parágrafo inteiro no Word também funciona — e some do sumário do mesmo jeito.
 */

/* ── O documento ───────────────────────────────────────────────────────────── */

/** Estilo de parágrafo. Ênfase não está aqui: ela é de caractere. */
export type Estilo = 'Normal' | 'Título 1' | 'Título 2' | 'Citação';
export type Posicao = 'normal' | 'sobrescrito' | 'subscrito';
export type Realce = 'nenhum' | 'amarelo' | 'verde' | 'ciano' | 'rosa';
export type Secao = 'capa' | 'abertura' | 'levar' | 'programacao' | 'culto' | 'fim';

export interface Trecho {
  id: string;
  texto: string;
  posicao: Posicao;
  realce: Realce;
  /** Estilo de caractere — o único é Ênfase, e é de propósito. */
  enfase: boolean;
  /**
   * Formatação direta que veio de fora e foi mantida na colagem.
   *
   * É o que "Manter Formatação Original" preserva e o que "Manter Somente
   * Texto" descarta: a fonte, o tamanho e a cor do lugar de origem, que não
   * são os do documento.
   */
  deFora?: boolean;
}

export interface Bloco {
  id: string;
  trechos: Trecho[];
  estilo: Estilo;
  secao: Secao;
  /** Nota de rodapé pendurada neste parágrafo. */
  nota?: string;
}

/** Uma linha do sumário, como ela foi lida no momento em que ele foi gerado. */
export interface ItemDeSumario {
  texto: string;
  nivel: 1 | 2;
}

export interface Doc {
  blocos: Bloco[];
  /** Quantas colunas cada seção usa. Uma é o padrão do Word. */
  colunas: Record<Secao, number>;
  /**
   * O sumário, ou `null` enquanto ninguém mandou gerar.
   *
   * Ele guarda o que leu **na hora em que foi gerado** — e não é preguiça de
   * modelagem: é o comportamento do Word, e é a metade da lição que ninguém
   * conta. Trocar um título depois deixa o sumário mostrando o texto antigo, e
   * nada na tela avisa. Só "Atualizar Sumário" o alcança.
   */
  sumario: ItemDeSumario[] | null;
}

const t = (id: string, texto: string): Trecho =>
  ({ id, texto, posicao: 'normal', realce: 'nenhum', enfase: false });

const bloco = (id: string, secao: Secao, trechos: Trecho[]): Bloco =>
  ({ id, secao, trechos, estilo: 'Normal' });

const linha = (id: string, secao: Secao, texto: string): Bloco =>
  bloco(id, secao, [t(`${id}-a`, texto)]);

/**
 * O texto que está aberto no site do clube, fora do Word.
 *
 * Ele existe para os itens b) e c): colar mantendo a formatação da origem e
 * colar com a do destino. O desbravador cola do site e o texto chega com fundo
 * cinza, outra fonte e outro tamanho — e conclui que "o Word estragou". Não
 * estragou: fez o que se pediu. A outra opção estava no mesmo menu.
 */
export const TEXTO_DO_SITE = 'O ônibus sai da igreja às 6h da sexta-feira e volta no domingo à noite.';

/**
 * O documento como ele chega: escrito por inteiro, e sem um estilo sequer.
 *
 * O título veio com o Caps Lock ligado, os três títulos de seção são parágrafos
 * comuns em negrito, a citação está solta no meio do texto e o sumário não
 * existe. Na tela isso passa por manual pronto — é esse o ponto.
 */
export const DOC_INICIAL: Doc = {
  blocos: [
    linha('capa', 'capa', 'Clube de Desbravadores Pioneiros'),
    linha('titulo', 'capa', 'MANUAL DO ACAMPAMENTO DE INVERNO'),
    linha('intro', 'abertura', 'Este manual reúne o que cada desbravador precisa saber antes de sair de casa. Leia com quem vai assinar a sua autorização.'),
    bloco('prazo', 'abertura', [
      t('prazo-a', 'A ficha assinada tem de chegar à secretaria '),
      t('prazo-b', 'até 20 de junho'),
      t('prazo-c', '. Depois dessa data não há como incluir ninguém no seguro.'),
    ]),
    linha('h-levar', 'levar', 'O que levar'),
    linha('lev-1', 'levar', 'Saco de dormir e isolante'),
    bloco('lev-2', 'levar', [
      t('lev-2-a', 'Garrafa com 2 litros de H'),
      t('lev-2-b', '2'),
      t('lev-2-c', 'O, cheia antes de sair'),
    ]),
    linha('lev-3', 'levar', 'Lanterna com pilha de reserva'),
    linha('lev-4', 'levar', 'Agasalho, touca e luva'),
    linha('lev-5', 'levar', 'Prato, caneca e talher'),
    linha('lev-6', 'levar', 'Bíblia e caderno'),
    bloco('lev-7', 'levar', [
      t('lev-7-a', 'A barraca de cada unidade ocupa 6 m'),
      t('lev-7-b', '2'),
      t('lev-7-c', ' no gramado'),
    ]),
    linha('lev-8', 'levar', 'Sacola para a roupa suja'),
    linha('h-prog', 'programacao', 'A programação'),
    linha('prog-1', 'programacao', 'A chegada é na sexta à noite, com a montagem das barracas ainda com luz. No sábado há culto de manhã, classes à tarde e fogueira à noite. No domingo desmontamos tudo antes do almoço.'),
    linha('h-culto', 'culto', 'O culto da noite'),
    linha('culto-1', 'culto', 'O estudo desta edição é sobre a mansidão, e cada unidade apresenta uma parte para as outras.'),
    linha('citacao', 'culto', 'Bem-aventurados os mansos, porque eles herdarão a terra.'),
    linha('fim', 'fim', 'Dúvidas: fale com a liderança da sua unidade antes da véspera.'),
  ],
  colunas: { capa: 1, abertura: 1, levar: 1, programacao: 1, culto: 1, fim: 1 },
  sumario: null,
};

/* ── Operações que o teste também usa ──────────────────────────────────────── */

export const textoDoBloco = (b: Bloco) => b.trechos.map(x => x.texto).join('');

/** Os títulos do documento, na ordem, como o sumário os leria agora. */
export function titulosDoDoc(d: Doc): ItemDeSumario[] {
  return d.blocos
    .filter(b => b.estilo === 'Título 1' || b.estilo === 'Título 2')
    .map(b => ({ texto: textoDoBloco(b), nivel: b.estilo === 'Título 1' ? 1 : 2 } as ItemDeSumario));
}

/** O sumário existe e diz o que os títulos dizem hoje. */
export function sumarioAtualizado(d: Doc): boolean {
  if (!d.sumario) return false;
  const agora = titulosDoDoc(d);
  if (agora.length !== d.sumario.length) return false;
  return agora.every((x, i) => x.texto === d.sumario![i].texto && x.nivel === d.sumario![i].nivel);
}

/** Os cinco modos do botão Aa do Word, com os nomes que ele usa. */
export type ModoDeCaixa = 'frase' | 'minusculas' | 'maiusculas' | 'palavras' | 'alternar';

export const NOMES_DA_CAIXA: Record<ModoDeCaixa, string> = {
  frase: 'Primeira letra da frase em maiúscula.',
  minusculas: 'minúsculas',
  maiusculas: 'MAIÚSCULAS',
  palavras: 'Colocar Cada Palavra Em Maiúscula',
  alternar: 'aLTERNAR mAIÚSCULAS/mINÚSCULAS',
};

export function aplicarCaixa(texto: string, modo: ModoDeCaixa): string {
  switch (modo) {
    case 'minusculas': return texto.toLocaleLowerCase('pt-BR');
    case 'maiusculas': return texto.toLocaleUpperCase('pt-BR');
    case 'palavras':
      return texto.toLocaleLowerCase('pt-BR')
        .replace(/(^|\s)(\p{L})/gu, (_m, antes: string, letra: string) => antes + letra.toLocaleUpperCase('pt-BR'));
    case 'alternar':
      return [...texto].map(c => {
        const alto = c.toLocaleUpperCase('pt-BR');
        return c === alto ? c.toLocaleLowerCase('pt-BR') : alto;
      }).join('');
    case 'frase':
    default: {
      const baixo = texto.toLocaleLowerCase('pt-BR');
      return baixo.replace(/(^\s*|[.!?]\s+)(\p{L})/gu,
        (_m, antes: string, letra: string) => antes + letra.toLocaleUpperCase('pt-BR'));
    }
  }
}

/* ── As metas ──────────────────────────────────────────────────────────────── */

export interface MetaDeEstilos {
  id: string;
  titulo: string;
  detalhe: string;
  /** Onde, na faixa de opções, isso se resolve. */
  onde: string;
  passos: string[];
  feita: (d: Doc) => boolean;
}

const comEstilo = (d: Doc, e: Estilo) => d.blocos.filter(b => b.estilo === e);
const trechos = (d: Doc) => d.blocos.flatMap(b => b.trechos);
const um = (d: Doc, id: string) => d.blocos.find(b => b.id === id);
const trecho = (d: Doc, id: string) => trechos(d).find(x => x.id === id);
const colados = (d: Doc) => d.blocos.filter(b => textoDoBloco(b) === TEXTO_DO_SITE);

export const METAS_DOS_ESTILOS: MetaDeEstilos[] = [
  {
    id: 'estilos',
    titulo: 'Aplicar os estilos',
    detalhe: 'O nome do manual recebe Título 1; os três títulos de seção recebem Título 2; o versículo do fim recebe Citação; e a data-limite, que está no primeiro trecho em destaque, recebe Ênfase.',
    onde: 'Início › Estilos',
    passos: [
      'Clique no parágrafo do nome do manual — em qualquer palavra dele.',
      'Na galeria de Estilos, escolha Título 1.',
      'Repita em "O que levar", "A programação" e "O culto da noite", agora com Título 2.',
      'Clique no versículo e escolha Citação.',
      'Ênfase é estilo de caractere: selecione o trecho "até 20 de junho" e só então clique em Ênfase.',
    ],
    feita: d => comEstilo(d, 'Título 1').length >= 1
      && comEstilo(d, 'Título 2').length >= 3
      && comEstilo(d, 'Citação').length >= 1
      && trechos(d).some(x => x.enfase),
  },
  {
    id: 'caixa',
    titulo: 'Consertar o título em caixa alta',
    detalhe: 'O nome do manual foi digitado com o Caps Lock ligado. Deixe-o como "Manual do acampamento de inverno" sem redigitar nada.',
    onde: 'Início › Fonte › Aa',
    passos: [
      'Clique no parágrafo do nome do manual.',
      'Na guia Início, no grupo Fonte, abra o botão Aa.',
      'Escolha "Primeira letra da frase em maiúscula." — é o que devolve o título ao normal.',
    ],
    feita: d => {
      const b = um(d, 'titulo');
      return !!b && textoDoBloco(b) === 'Manual do acampamento de inverno';
    },
  },
  {
    id: 'colar-original',
    titulo: 'Colar mantendo a formatação de origem',
    detalhe: 'Copie o aviso que está aberto no site do clube e cole no fim da seção "A programação" mantendo a formatação original — o texto chega com a letra do site, e é para chegar assim mesmo.',
    onde: 'Início › Área de Transferência › Colar',
    passos: [
      'No cartão do site do clube, clique em Copiar.',
      'Clique no parágrafo da seção "A programação", que é onde o texto vai entrar.',
      'Abra a setinha embaixo de Colar e escolha "Manter Formatação Original".',
    ],
    feita: d => colados(d).some(b => b.trechos.every(x => x.deFora)),
  },
  {
    id: 'colar-destino',
    titulo: 'Colar de novo, agora com a formatação do documento',
    detalhe: 'Cole o mesmo aviso no fim do manual, dessa vez usando "Manter Somente Texto" — ele chega com a letra do documento, e não a do site.',
    onde: 'Início › Área de Transferência › Colar',
    passos: [
      'Clique no último parágrafo do manual.',
      'Abra a setinha embaixo de Colar.',
      'Escolha "Manter Somente Texto". Compare com a outra colagem: é o mesmo texto com duas aparências.',
    ],
    feita: d => colados(d).some(b => b.trechos.every(x => !x.deFora)),
  },
  {
    id: 'sobre-sub',
    titulo: 'Usar sobrescrito e subscrito',
    detalhe: 'Na lista do que levar, o "2" de m² é sobrescrito e o "2" de H₂O é subscrito. Os dois estão escritos na linha, do tamanho errado.',
    onde: 'Início › Fonte',
    passos: [
      'Clique no "2" que está depois de "6 m".',
      'No grupo Fonte, clique em x² (Sobrescrito).',
      'Clique no "2" que está entre o H e o O e escolha x₂ (Subscrito).',
    ],
    feita: d => trecho(d, 'lev-7-b')?.posicao === 'sobrescrito'
      && trecho(d, 'lev-2-b')?.posicao === 'subscrito',
  },
  {
    id: 'realce',
    titulo: 'Destacar a data-limite com cor',
    detalhe: 'Ponha realce colorido em "até 20 de junho". Repare que ele não é estilo: o realce pinta, e o sumário não fica sabendo dele.',
    onde: 'Início › Fonte › Cor do Realce do Texto',
    passos: [
      'Selecione o trecho "até 20 de junho".',
      'No grupo Fonte, abra a setinha ao lado do marcador de texto.',
      'Escolha uma cor. Amarelo é a que o Word já vem oferecendo.',
    ],
    feita: d => trecho(d, 'prazo-b')?.realce !== 'nenhum' && !!trecho(d, 'prazo-b'),
  },
  {
    id: 'colunas',
    titulo: 'Pôr a lista do que levar em duas colunas',
    detalhe: 'São oito itens curtos ocupando oito linhas inteiras. Em duas colunas eles cabem em quatro, e sobra página.',
    onde: 'Layout › Configurar Página › Colunas',
    passos: [
      'Clique em qualquer item da lista "O que levar".',
      'Vá na guia Layout.',
      'Em Colunas, escolha Duas.',
    ],
    feita: d => d.colunas.levar === 2,
  },
  {
    id: 'nota',
    titulo: 'Explicar "isolante" numa nota de rodapé',
    detalhe: 'Nem todo mundo sabe o que é. Ponha uma nota de rodapé no item do saco de dormir explicando — a numeração é do programa, e não sua.',
    onde: 'Referências › Inserir Nota de Rodapé',
    passos: [
      'Clique no item "Saco de dormir e isolante".',
      'Vá na guia Referências e clique em Inserir Nota de Rodapé.',
      'Escreva a explicação no pé da página, por exemplo: "Espuma fina que fica entre o saco de dormir e o chão."',
    ],
    feita: d => d.blocos.some(b => (b.nota ?? '').trim().length >= 10),
  },
  {
    id: 'sumario',
    titulo: 'Gerar o sumário — e deixá-lo em dia',
    detalhe: 'Com os títulos marcados, o sumário se monta sozinho. Se você mexer num título depois, ele continua mostrando o texto velho até ser atualizado.',
    onde: 'Referências › Sumário',
    passos: [
      'Confira antes se os quatro títulos já receberam Título 1 e Título 2 — sem estilo, o sumário sai vazio.',
      'Vá na guia Referências e clique em Sumário.',
      'Se você trocar algum título depois disso, volte aqui e clique em Atualizar Sumário.',
    ],
    /*
      Três condições, e nenhuma delas é enfeite.

      Existir não basta: sumário de documento sem título nenhum sai vazio, e uma
      lista vazia é a armadilha do "zero link não é zero link quebrado" — nada
      quebrado porque nada existe. Ter quatro linhas é o que prova que os
      estilos foram aplicados. E estar em dia é o que a lição de verdade cobra:
      o do Word guarda o que leu, e o título consertado depois só chega lá com
      Atualizar.
    */
    feita: d => !!d.sumario && d.sumario.length >= 4 && sumarioAtualizado(d),
  },
];
