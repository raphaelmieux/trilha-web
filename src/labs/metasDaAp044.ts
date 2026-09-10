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

/* ══ O laboratório de banco de dados ═══════════════════════════════════════
 *
 * AP044 requisito 6: uma agenda com nome, endereço, telefone e e-mail de, no
 * mínimo, vinte e cinco pessoas.
 *
 * ── Por que ninguém digita vinte e cinco fichas aqui ─────────────────────
 * Digitar cem campos numa tela simulada ensina a digitar. O que o requisito
 * mede é **montar** o banco: declarar os campos, dizer o tipo de cada um, e
 * então pôr os dados lá dentro.
 *
 * E há um jeito de pôr vinte e cinco pessoas lá dentro que é o de verdade e é
 * exatamente a lição: **importar**. A lista do clube já existe, escrita em
 * outro lugar, e o assistente de importação pergunta coluna por coluna a que
 * campo ela corresponde e de que tipo é. É a teoria inteira virando gesto — e
 * é onde o erro aparece, porque o assistente adivinha errado e chega com o
 * mapeamento trocado.
 *
 * ── O telefone é a armadilha, e ela é real ───────────────────────────────
 * Telefone parece número e é texto: ninguém soma dois telefones, e como número
 * ele perde os parênteses, o traço e o zero da frente. O assistente adivinha
 * "Número" para ele — que é o que os assistentes de verdade fazem —, e a
 * importação mostra o estrago em vez de explicá-lo.
 */

export type TipoDeCampo = 'texto' | 'numero' | 'data';

export interface Campo {
  id: string;
  /** O nome escrito na coluna de cima, que é o que o relatório vai imprimir. */
  nome: string;
  tipo: TipoDeCampo;
  /**
   * A regra de validação, escrita como o programa a escreve.
   *
   * Não é o tipo: o tipo diz o que cabe, a regra diz o que vale. É com ela que
   * um campo de e-mail recusa "joana" sem arroba — e é por isso que ela é uma
   * tarefa separada de declarar o campo.
   */
  regra?: string;
}

export interface Registro {
  id: string;
  valores: Record<string, string>;
}

export type Ordem = { campo: string; crescente: boolean } | null;

export interface Agenda {
  /** Os campos declarados. Vazio é o que abre: não há tabela nenhuma ainda. */
  campos: Campo[];
  registros: Registro[];
  ordem: Ordem;
  /** O bairro escolhido no filtro, ou vazio para "todos". */
  filtroDeBairro: string;
  /** O relatório foi gerado — e com que campos, na ordem em que ele os leu. */
  relatorio: string[] | null;
}

/** A regra que o assistente oferece pronta, e que só o e-mail precisa. */
export const REGRA_DE_EMAIL = 'Como "*@*.*"';

/**
 * A lista que o clube já tem, escrita fora do programa.
 *
 * Vinte e cinco pessoas, e as colunas com os nomes que o clube de fato usa —
 * "Zap", "Onde mora", "Contato". É por isso que o assistente de importação não
 * acerta o mapeamento sozinho: ele não tem como saber que "Zap" é telefone, e
 * cai no palpite por posição, que troca duas.
 *
 * O endereço traz o bairro junto, de propósito: é assim que essas listas chegam
 * na vida, e é o que torna o filtro por bairro uma leitura, e não um campo a
 * mais. E uma das fichas tem e-mail sem arroba, que é o que a regra de
 * validação vai recusar.
 */
export const COLUNAS_DA_LISTA = ['Nome completo', 'Zap', 'Onde mora', 'Contato'] as const;

/** A que campo da agenda cada coluna da lista corresponde de verdade. */
export const CAMPO_DA_COLUNA: Record<string, string> = {
  'Nome completo': 'Nome',
  'Zap': 'Telefone',
  'Onde mora': 'Endereço',
  'Contato': 'E-mail',
};

/* A ordem é a da lista do clube — nome, telefone, endereço, e-mail —, e não a
   dos campos da agenda. É essa diferença que o assistente erra. */
const pessoa = (nome: string, rua: string, bairro: string, fone: string, email: string) =>
  [nome, fone, `${rua} — ${bairro}`, email];

export const LISTA_DO_CLUBE: string[][] = [
  pessoa('Ana Beatriz Rocha', 'Rua das Flores, 120', 'Centro', '(61) 99612-4410', 'ana.rocha@exemplo.com'),
  pessoa('Bruno Carvalho', 'Av. das Palmeiras, 88', 'Centro', '(61) 99871-2033', 'bruno.c@exemplo.com'),
  pessoa('Camila Duarte', 'Rua do Sol, 45', 'Jardim Novo', '(61) 99204-7781', 'camila.d@exemplo.com'),
  pessoa('Daniel Freitas', 'Rua São João, 9', 'Vila Verde', '(61) 99333-1201', 'daniel.f@exemplo.com'),
  /* A ficha com o e-mail sem arroba. Ela existe para a regra de validação ter o
     que recusar — sem uma linha errada, declarar a regra seria um clique que
     não muda nada na tela. */
  pessoa('Elisa Nogueira', 'Rua das Acácias, 302', 'Centro', '(61) 99145-6690', 'elisa.nogueira'),
  pessoa('Felipe Andrade', 'Rua Bela Vista, 77', 'Jardim Novo', '(61) 99422-8815', 'felipe.a@exemplo.com'),
  pessoa('Gabriela Pinto', 'Av. Brasil, 1500', 'Centro', '(61) 99788-3320', 'gabi.pinto@exemplo.com'),
  pessoa('Heitor Barbosa', 'Rua do Campo, 16', 'Vila Verde', '(61) 99017-4456', 'heitor.b@exemplo.com'),
  pessoa('Isabela Correia', 'Rua Nova, 210', 'Jardim Novo', '(61) 99630-9902', 'isa.correia@exemplo.com'),
  pessoa('João Pedro Lima', 'Rua da Mata, 33', 'Vila Verde', '(61) 99255-6674', 'joao.lima@exemplo.com'),
  pessoa('Karina Souza', 'Av. Central, 402', 'Centro', '(61) 99908-1123', 'karina.s@exemplo.com'),
  pessoa('Lucas Teixeira', 'Rua do Lago, 58', 'Jardim Novo', '(61) 99544-7708', 'lucas.t@exemplo.com'),
  pessoa('Mariana Alves', 'Rua Primavera, 91', 'Centro', '(61) 99361-2287', 'mari.alves@exemplo.com'),
  pessoa('Nicolas Ribeiro', 'Rua do Moinho, 7', 'Vila Verde', '(61) 99082-5540', 'nicolas.r@exemplo.com'),
  pessoa('Olívia Martins', 'Av. das Águas, 660', 'Jardim Novo', '(61) 99719-3364', 'olivia.m@exemplo.com'),
  pessoa('Pedro Henrique Sá', 'Rua Aurora, 128', 'Centro', '(61) 99476-8891', 'pedro.sa@exemplo.com'),
  pessoa('Quésia Ferreira', 'Rua do Cedro, 24', 'Vila Verde', '(61) 99190-4417', 'quesia.f@exemplo.com'),
  pessoa('Rafael Moreira', 'Rua Boa Esperança, 310', 'Jardim Novo', '(61) 99823-6605', 'rafa.moreira@exemplo.com'),
  pessoa('Sara Vasconcelos', 'Av. Guanabara, 15', 'Centro', '(61) 99567-2248', 'sara.v@exemplo.com'),
  pessoa('Thiago Medeiros', 'Rua das Palmas, 402', 'Vila Verde', '(61) 99934-7719', 'thiago.m@exemplo.com'),
  pessoa('Ursula Campos', 'Rua Ipê, 66', 'Jardim Novo', '(61) 99306-5583', 'ursula.c@exemplo.com'),
  pessoa('Vinícius Prado', 'Av. dos Pinheiros, 820', 'Centro', '(61) 99641-9930', 'vini.prado@exemplo.com'),
  pessoa('Wesley Tavares', 'Rua do Horto, 41', 'Vila Verde', '(61) 99228-3376', 'wesley.t@exemplo.com'),
  pessoa('Yasmin Coelho', 'Rua Girassol, 173', 'Jardim Novo', '(61) 99855-1162', 'yasmin.c@exemplo.com'),
  pessoa('Zeca Nascimento', 'Av. do Contorno, 9', 'Centro', '(61) 99413-4408', 'zeca.n@exemplo.com'),
];

/** Os quatro campos que o requisito nomeia, e o tipo certo de cada um. */
export const CAMPOS_PEDIDOS: { nome: string; tipo: TipoDeCampo }[] = [
  { nome: 'Nome', tipo: 'texto' },
  { nome: 'Endereço', tipo: 'texto' },
  /* Telefone é texto, e é a armadilha inteira desta lição. */
  { nome: 'Telefone', tipo: 'texto' },
  { nome: 'E-mail', tipo: 'texto' },
];

/** A agenda como ela abre: nenhuma tabela, nenhum registro, nada. */
export const AGENDA_INICIAL: Agenda = {
  campos: [],
  registros: [],
  ordem: null,
  filtroDeBairro: '',
  relatorio: null,
};

export const temArroba = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

/** O bairro sai do endereço, que é onde ele foi escrito na lista de origem. */
export const bairroDe = (endereco: string) => endereco.split('—').slice(-1)[0].trim();

/** Os registros como a tela os mostra: filtrados e ordenados. */
export function registrosNaTela(a: Agenda): Registro[] {
  let r = a.registros;
  if (a.filtroDeBairro) r = r.filter(x => bairroDe(x.valores['Endereço'] ?? '') === a.filtroDeBairro);
  if (a.ordem) {
    const { campo, crescente } = a.ordem;
    r = [...r].sort((p, q) =>
      (p.valores[campo] ?? '').localeCompare(q.valores[campo] ?? '', 'pt-BR') * (crescente ? 1 : -1));
  }
  return r;
}

export interface MetaDaAgenda {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (a: Agenda) => boolean;
}

const campo = (a: Agenda, nome: string) => a.campos.find(c => c.nome === nome);

export const METAS_DA_AGENDA: MetaDaAgenda[] = [
  {
    id: 'campos',
    titulo: 'Declarar os quatro campos',
    detalhe: 'A agenda pede nome, endereço, telefone e e-mail. Crie os quatro no modo de estrutura, cada um com o tipo dele — e repare que telefone não é número.',
    onde: 'Criar › Tabela › Modo Estrutura',
    passos: [
      'Clique em Nova Tabela para abrir o modo de estrutura.',
      'Escreva o nome do primeiro campo e escolha o tipo ao lado.',
      'Repita para os quatro: Nome, Endereço, Telefone e E-mail.',
      'Telefone é Texto: ele tem parêntese e traço, e ninguém soma dois telefones.',
    ],
    feita: a => CAMPOS_PEDIDOS.every(p => campo(a, p.nome)?.tipo === p.tipo),
  },
  {
    id: 'regra',
    titulo: 'Escrever a regra de validação do e-mail',
    detalhe: 'O tipo diz o que cabe; a regra diz o que vale. Sem ela, "joana" sem arroba entra na agenda e só se descobre quando a mensagem voltar.',
    onde: 'Modo Estrutura › Propriedades do campo › Regra de Validação',
    passos: [
      'Clique na linha do campo E-mail, no modo de estrutura.',
      'No painel de propriedades, ache Regra de Validação.',
      `Escolha a regra ${REGRA_DE_EMAIL}: ela exige arroba e ponto.`,
    ],
    feita: a => campo(a, 'E-mail')?.regra === REGRA_DE_EMAIL,
  },
  {
    id: 'importar',
    titulo: 'Importar as 25 pessoas da lista do clube',
    detalhe: 'A lista já existe, escrita fora do programa. O assistente pergunta a que campo cada coluna corresponde — e ele chega com o palpite dele, que não é o certo.',
    onde: 'Dados Externos › Importar Lista',
    passos: [
      'Clique em Importar Lista, na guia Dados Externos.',
      'Confira, coluna por coluna, a que campo ela vai. O palpite do assistente troca duas.',
      'Confirme. As linhas que a regra recusar aparecem separadas, e não entram.',
    ],
    /*
      Vinte e quatro, e não vinte e cinco.

      A ficha da Elisa tem e-mail sem arroba, e a regra a recusa — que é a
      lição da tarefa anterior acontecendo. Exigir vinte e cinco aqui faria a
      tarefa depender de consertar a ficha, que é a tarefa seguinte, e o painel
      mostraria duas vermelhas por um motivo só.
    */
    feita: a => a.registros.length >= LISTA_DO_CLUBE.length - 1
      && a.registros.every(r => CAMPOS_PEDIDOS.every(p => (r.valores[p.nome] ?? '').trim() !== '')),
  },
  {
    id: 'recusada',
    titulo: 'Consertar a ficha que a regra recusou',
    detalhe: 'Uma pessoa ficou de fora: o e-mail dela foi escrito sem arroba. Corrija e inclua — a agenda precisa das 25.',
    onde: 'Na caixa de fichas recusadas, depois da importação',
    passos: [
      'Olhe a lista de recusadas: ela diz qual campo reprovou.',
      'Escreva o e-mail completo, com arroba e com ponto.',
      'Clique em Incluir. Agora a regra deixa passar.',
    ],
    feita: a => a.registros.length >= LISTA_DO_CLUBE.length
      && a.registros.every(r => temArroba(r.valores['E-mail'] ?? '')),
  },
  {
    id: 'ordenar',
    titulo: 'Pôr a agenda em ordem alfabética',
    detalhe: 'É a primeira das três coisas que um caderno cobra recomeçar e a estrutura dá de graça.',
    onde: 'Página Inicial › Classificar › Crescente',
    passos: [
      'Clique no cabeçalho da coluna Nome.',
      'Escolha Classificar Crescente (A → Z).',
      'Repare que nada foi redigitado: a ordem é uma leitura, e não uma cópia.',
    ],
    feita: a => a.ordem?.campo === 'Nome' && a.ordem.crescente === true,
  },
  {
    id: 'filtrar',
    titulo: 'Filtrar quem mora num bairro',
    detalhe: 'Mostre só as pessoas de um bairro. É a segunda coisa que o caderno não faz — e, como na planilha, filtrar esconde e não apaga.',
    onde: 'Página Inicial › Filtro',
    passos: [
      'Clique no cabeçalho da coluna Endereço.',
      'Escolha um bairro na lista do filtro.',
      'Confira o rodapé: ele conta quantas fichas estão sendo mostradas de quantas existem.',
    ],
    feita: a => a.filtroDeBairro !== '' && registrosNaTela(a).length > 0,
  },
  {
    id: 'relatorio',
    titulo: 'Gerar o relatório da agenda',
    detalhe: 'A terceira: a lista pronta para imprimir, com os quatro campos, montada a partir do que já está guardado.',
    onde: 'Criar › Relatório',
    passos: [
      'Vá na guia Criar e clique em Relatório.',
      'Escolha os quatro campos que devem sair impressos.',
      'Ele se monta a partir da tabela — nada é redigitado.',
    ],
    /*
      Quatro campos, e não "existe relatório".

      Relatório de uma coluna só sai sem erro nenhum e não serve para nada: é a
      armadilha do "zero link não é zero link quebrado" aplicada aqui. O
      requisito nomeia os quatro campos, e é isso que o papel entregue ao clube
      precisa mostrar.
    */
    feita: a => !!a.relatorio
      && CAMPOS_PEDIDOS.every(p => a.relatorio!.includes(p.nome))
      && a.registros.length >= LISTA_DO_CLUBE.length,
  },
];
