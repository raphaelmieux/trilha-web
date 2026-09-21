/**
 * O que cada uma das nove lições da CC-ES006 cobra.
 *
 * Num arquivo só, como `metasDaCcEs005.ts` e `metasDaCcEs004.ts`. O que muda
 * aqui é que o programa é **um**, e não três: a nuvem e o editor são duas
 * telas do mesmo serviço, como a tela inicial e o documento são duas telas do
 * leitor de PDF. Então o contexto é um, e o registro é um `Record` sobre a
 * união das lições — a décima não compila até alguém dizer de que estado ela
 * parte e o que ela cobra.
 *
 * O registro mora **fora do teste**, como o de planilha e o de PDF: quem o lê
 * é a tela, que monta a lição, **e** a trava, que confere que nenhuma meta
 * abre verde. Escrito só na trava, a tela repetiria a escolha e as duas
 * divergiriam na primeira lição nova, com a trava continuando verde
 * conferindo uma lição que a tela não abre.
 */

import {
  type ModoDeTrabalho, type Nuvem, type Papel, type Pessoa,
  arquivoDe, conflitosQueHouve, copiasEmConflito, copiasQueDivergiram,
  gravarVersao, nuvemDoClube, papelDe, pastasAcima, versaoAtual,
} from './arquivoCompartilhado';
import { type Doc, comentariosDoDoc, revisoesPendentes, textoDoDoc } from './documento';
import {
  COMBINADO_DE_TRABALHO, ESCALA, LINHA_DA_MARTA, PERGUNTAS_DO_COMBINADO, RESPOSTA_DE,
} from './documentosDaNuvem';

/* ── O que uma meta é ─────────────────────────────────────────────────────── */

export interface Meta {
  id: string;
  titulo: string;
  /** Por que isto importa. Uma ou duas frases, do jeito que se fala com alguém de dez anos. */
  detalhe: string;
  /** Onde, no programa, este gesto acontece. */
  onde: string;
  /** O passo a passo, para quem travar. Convite, e não despejo. */
  passos: string[];
  feita: (c: ContextoDaNuvem) => boolean;
}

/* ── O contexto ───────────────────────────────────────────────────────────── */

export interface ContextoDaNuvem {
  nuvem: Nuvem;
  /**
   * A nuvem de quando a lição abriu.
   *
   * O módulo 1 precisa dela: a cópia que saiu por anexo só se compara com o
   * original se houver com o que comparar. É a mesma razão de a CC-ES001
   * carregar o disco de agora e o de quando abriu, e de a CC-ES005 carregar
   * os dois cofres.
   */
  antes: Nuvem;
  /** Em que modo se está trabalhando no documento aberto. */
  modo: ModoDeTrabalho;
  /**
   * O que a pessoa viu, e que não deixa marca em arquivo nenhum.
   *
   * É a família das quatro verificações do Explorador que só existem como
   * gesto, e das duas descobertas do módulo 6 da CC-ES004: ver que o
   * comentarista não muda o texto, ver que a cópia por anexo não acompanha,
   * ver quem entra pela pasta. Nenhuma delas muda um byte, e todas as três
   * são o que o requisito manda demonstrar.
   */
  descobertas: string[];
}

const arq = (n: Nuvem, id: string) => n.arquivos.find(a => a.id === id);
const docDe = (n: Nuvem, id: string): Doc<string> | undefined => {
  const a = arq(n, id);
  return a && versaoAtual(a)?.doc;
};
const viu = (c: ContextoDaNuvem, o: string) => c.descobertas.includes(o);

/** Quem escreveu em qualquer versão deste arquivo. */
const maos = (n: Nuvem, id: string): Pessoa[] =>
  [...new Set((arq(n, id)?.versoes ?? []).flatMap(v => v.porQuem))];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 1 — Anexo ou vínculo (requisito 3)
   ──────────────────────────────────────────────────────────────────────── */

const copiaDaCleide = (n: Nuvem) =>
  n.arquivos.find(a => a.copiaDe === 'materiais' && a.dono === 'cleide');

export const METAS_DO_ANEXO: Meta[] = [
  {
    id: 'mandou-anexo',
    titulo: 'Mandar a lista por anexo para a Cleide',
    detalhe: 'É o jeito que todo mundo faz, e é por isso que a lição começa por ele. '
      + 'O que sai não é a sua lista: é uma cópia solta, que a partir de agora é dela.',
    onde: 'Nuvem › a lista › menu de três pontos › Enviar por e-mail › Anexar uma cópia',
    passos: [
      'Na nuvem, clique nos três pontos da Lista de materiais.',
      'Escolha Enviar por e-mail.',
      'Na caixa, escolha Anexar uma cópia — e não Compartilhar o vínculo.',
      'Mande para a Cleide.',
    ],
    feita: c => !!copiaDaCleide(c.nuvem),
  },
  {
    id: 'as-duas-discordam',
    titulo: 'Escrever na sua lista, e as duas deixarem de dizer a mesma coisa',
    detalhe: 'Recém-mandada, a cópia ainda diz o mesmo — e é por isso que ela parece '
      + 'inofensiva no dia em que se manda. Basta alguém escrever de um dos lados.',
    onde: 'Nuvem › abra a Lista de materiais › escreva uma linha › feche',
    passos: [
      'Abra a Lista de materiais no editor.',
      'Acrescente um item que faltava — por exemplo, o galão de água.',
      'Volte para a nuvem: a cópia da Cleide continua com a lista de antes.',
    ],
    feita: c => copiasQueDivergiram(c.nuvem, 'materiais').some(a => a.dono === 'cleide'),
  },
  {
    id: 'a-copia-nao-volta',
    titulo: 'Ver que nada do que você escreve chega na cópia dela',
    detalhe: 'Este é o primeiro dos dois problemas do requisito 3: em pouco tempo há '
      + 'duas versões e ninguém sabe qual vale. Nenhuma das duas está errada, e é isso '
      + 'que faz a confusão durar.',
    onde: 'Nuvem › abra a cópia da Cleide e compare com a sua',
    passos: [
      'Na nuvem, abra o arquivo com "(cópia de Cleide)" no nome.',
      'Compare com a sua lista: o item que você acabou de escrever não está lá.',
      'E não vai estar nunca — a cópia não se liga de volta ao original.',
    ],
    feita: c => viu(c, 'a-copia-nao-acompanha'),
  },
  {
    id: 'vinculo-para-ronaldo',
    titulo: 'Mandar o vínculo para o Ronaldo, e não uma cópia',
    detalhe: 'Compartilhar o vínculo deixa **um** arquivo, que é o seu, com mais gente '
      + 'dentro. Quem abre lê o que está escrito agora, e não o que estava escrito no '
      + 'dia em que alguém mandou.',
    onde: 'Nuvem › a lista › Compartilhar › o endereço do Ronaldo',
    passos: [
      'Nos três pontos da Lista de materiais, escolha Compartilhar.',
      'Escreva o endereço do Ronaldo e escolha o papel dele.',
      'Repare que não apareceu arquivo novo nenhum na nuvem: é o mesmo.',
    ],
    /*
      A segunda metade é **condição**, e não meta própria: "não existe cópia
      solta na mão dele" é verdade no segundo zero, e como item da lista
      abriria verde — que é o que ensina a não ler a lista. É a decisão de
      "sem alterar uma palavra do texto" da CC-ES002.
    */
    feita: c => papelDe(c.nuvem, 'materiais', 'ronaldo') !== undefined
      && !c.nuvem.arquivos.some(a => a.copiaDe === 'materiais' && a.dono === 'ronaldo'),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 2 — Os três níveis de permissão (requisitos 2.2 e 4.1)
   ──────────────────────────────────────────────────────────────────────── */

/** O que o trabalho de cada um pede. É o que a lição conta, e não gosto nosso. */
const PAPEL_QUE_O_TRABALHO_PEDE: Record<'marta' | 'ronaldo' | 'cleide', Papel> = {
  marta: 'editor',        /* vai escrever os itens que faltam */
  ronaldo: 'comentarista', /* vai opinar sobre as quantidades */
  cleide: 'leitor',        /* vai ler a lista no dia, na portaria */
};

/** O link fechado é condição de tudo neste módulo, e não uma terceira tarefa. */
const linkFechado = (c: ContextoDaNuvem) => arq(c.nuvem, 'materiais')?.linkAberto === undefined;

export const METAS_DOS_NIVEIS: Meta[] = [
  {
    id: 'tres-distintos',
    titulo: 'Aplicar os três níveis, sem repetir nenhum',
    detalhe: 'O requisito 4.1 pede três níveis **distintos** no mesmo documento. '
      + 'Três pessoas com "Editor" é um nível usado três vezes, e não três níveis.',
    onde: 'Nuvem › a lista › Compartilhar › o seletor ao lado de cada nome',
    passos: [
      'Abra Compartilhar na Lista de materiais.',
      'Acrescente as três pessoas.',
      'No seletor ao lado de cada nome, escolha um nível diferente.',
    ],
    feita: c => {
      const a = arq(c.nuvem, 'materiais');
      const papeis = new Set((a?.acessos ?? []).map(x => x.papel));
      return papeis.size === 3 && linkFechado(c);
    },
  },
  {
    id: 'cada-um-o-seu',
    titulo: 'E dar a cada um o nível que o trabalho dele pede',
    detalhe: 'A Marta ainda vai escrever itens que faltam. O Ronaldo só vai opinar '
      + 'sobre as quantidades. A Cleide vai ler a lista no portão, no dia. Dar edição '
      + 'a quem só lê não estoura nada — e um dia alguém apaga uma linha sem querer.',
    onde: 'Nuvem › a lista › Compartilhar › o seletor ao lado de cada nome',
    passos: [
      'A Marta escreve: Editor.',
      'O Ronaldo opina: Comentarista.',
      'A Cleide lê: Leitor.',
      'Repare no que a caixa diz que cada nível **não** deixa fazer.',
    ],
    feita: c => (Object.keys(PAPEL_QUE_O_TRABALHO_PEDE) as (keyof typeof PAPEL_QUE_O_TRABALHO_PEDE)[])
      .every(q => papelDe(c.nuvem, 'materiais', q) === PAPEL_QUE_O_TRABALHO_PEDE[q])
      && linkFechado(c),
  },
  {
    id: 'viu-o-que-nao-deixa',
    titulo: 'Ler o que cada nível não deixa fazer',
    detalhe: 'É o que faz os três serem três coisas, e não três palavras. Quem tem '
      + 'permissão de comentar e digita no documento não muda o texto: ele propõe.',
    onde: 'Nuvem › Compartilhar › o seletor de cada nível',
    passos: [
      'Na caixa de compartilhar, passe pelos três níveis no seletor.',
      'Leia o "Não pode" de cada um — é ele que separa os três.',
    ],
    feita: c => viu(c, 'leu-os-tres-limites'),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 3 — A pasta manda no que está dentro (requisito 5)
   ──────────────────────────────────────────────────────────────────────── */

const QUEM_ENTRA_PELA_PASTA = ['voce', 'ronaldo', 'cleide'] as const;

export const METAS_DA_PASTA: Meta[] = [
  {
    id: 'compartilhou-a-pasta',
    titulo: 'Compartilhar a pasta do acampamento inteira com a Cleide',
    detalhe: 'Compartilhar pasta é o que se faz quando são muitos arquivos, e é o que '
      + 'o requisito 5 manda demonstrar. O que ela alcança é o que está dentro — hoje '
      + 'e o que for posto lá depois.',
    onde: 'Nuvem › a pasta Acampamento de julho › Compartilhar',
    passos: [
      'Na nuvem, ache a pasta Acampamento de julho.',
      'Nos três pontos dela, escolha Compartilhar.',
      'Acrescente a Cleide como leitora.',
    ],
    feita: c => (arq(c.nuvem, 'pasta-acampamento')?.acessos ?? [])
      .some(x => x.quem === 'cleide'),
  },
  {
    id: 'viu-alcancar',
    titulo: 'Ver que a ficha médica lá dentro passou a abrir para ela',
    detalhe: 'Ninguém tocou na ficha. A caixa dela continua dizendo o que dizia. E a '
      + 'Cleide abre — porque a permissão da pasta alcança o que está dentro.',
    onde: 'Nuvem › entre na pasta › a ficha médica › Compartilhar',
    passos: [
      'Entre na pasta Acampamento de julho e abra Compartilhar na ficha médica.',
      'A lista de pessoas dela continua vazia.',
      'Clique na linha que diz quantas pessoas entram pela pasta.',
    ],
    feita: c => viu(c, 'a-pasta-alcanca'),
  },
  {
    id: 'viu-quem-ja-entrava',
    titulo: 'Descobrir quem já entrava na ficha antes de você mexer',
    detalhe: 'São nomes completos e dado de saúde de criança, num arquivo cuja caixa '
      + 'diz que ninguém foi convidado. Nada estourou, nada avisou: alguém arrastou a '
      + 'ficha para a pasta errada e foi cuidar da vida.',
    onde: 'Nuvem › a ficha médica › Compartilhar › a linha da pasta',
    passos: [
      'Na caixa da ficha, abra a linha de quem entra pela pasta.',
      'Conte quantas pessoas são, e com que papel cada uma entra.',
    ],
    feita: c => viu(c, 'contou-quem-entrava'),
  },
  {
    id: 'tirou-a-ficha-de-la',
    titulo: 'Tirar a ficha médica da pasta compartilhada',
    detalhe: 'Tirar o nome de cada pessoa da caixa da ficha não fecha nada: ela continua '
      + 'dentro da pasta. Quem não move, não fecha. E a pasta continua compartilhada, '
      + 'porque o clube precisa dela.',
    onde: 'Nuvem › a ficha médica › menu de três pontos › Mover para',
    passos: [
      'Nos três pontos da ficha médica, escolha Mover para.',
      'Tire-a da pasta do acampamento.',
      'Confira na caixa dela: agora não entra mais ninguém pela pasta.',
    ],
    /*
      "Sem tirar o acesso do clube à pasta" viaja como **condição**, e não
      como meta: ela é verdade no segundo zero. Assim, fechar a pasta inteira
      — que é o caminho rápido e errado — deixa esta meta vermelha, e não uma
      terceira que a pessoa leria como detalhe à parte.
    */
    feita: c => QUEM_ENTRA_PELA_PASTA.every(q => papelDe(c.nuvem, 'fichas', q) === undefined)
      && QUEM_ENTRA_PELA_PASTA.every(q => papelDe(c.nuvem, 'pasta-acampamento', q) !== undefined),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 4 — Escrever ao mesmo tempo (requisitos 2.1 e 4.2)
   ──────────────────────────────────────────────────────────────────────── */

const LINHA_QUE_A_MARTA_ESCREVE = 'Domingo, 8h — Café da manhã: unidade Falcão.';

export const METAS_DE_ESCREVER_JUNTO: Meta[] = [
  {
    id: 'voce-escreveu',
    titulo: 'Acrescentar a sua linha na escala',
    detalhe: 'A escala está aberta em dois lugares ao mesmo tempo: no seu computador e '
      + 'no da Marta. Nenhum dos dois precisou esperar o outro sair.',
    onde: 'Editor › clique no fim da última linha e escreva',
    passos: [
      'Abra a Escala das unidades.',
      'Acrescente a linha que falta — quem arruma o lanche da tarde de sábado.',
      'Repare nas bolhas lá em cima: você não está sozinho no documento.',
    ],
    /* Sem diferença de caixa: quem escreve "Lanche da tarde" escreveu o
       lanche da tarde, e reprovar por uma maiúscula seria a tarefa medindo
       digitação. */
    feita: c => {
      const d = docDe(c.nuvem, 'escala');
      const antes = docDe(c.antes, 'escala');
      return !!d && !!antes && textoDoDoc(d).length > textoDoDoc(antes).length
        && textoDoDoc(d).toLowerCase().includes('lanche');
    },
  },
  {
    id: 'marta-escreveu',
    titulo: 'E a linha da Marta entrar enquanto você está lá',
    detalhe: 'Isto é edição simultânea, que é o requisito 2.1: as duas edições entram, '
      + 'nenhuma espera a outra, e não há nada para resolver depois. O conflito do '
      + 'requisito 6 é outra coisa, e acontece noutro lugar.',
    onde: 'Editor › o cursor com o nome dela aparece ao lado do parágrafo',
    passos: [
      'Continue com o documento aberto.',
      'A linha da Marta aparece sozinha, com o cursor dela do lado.',
      'Não há nada a aceitar: ela já está no documento, para os dois.',
    ],
    feita: c => {
      const d = docDe(c.nuvem, 'escala');
      return !!d && textoDoDoc(d).includes(LINHA_QUE_A_MARTA_ESCREVE);
    },
  },
  {
    id: 'historico-diz-os-dois',
    titulo: 'E a versão gravada nomear os dois',
    detalhe: 'Quem escreveu entra no histórico; quem só leu, não. É o que o requisito 8 '
      + 'manda comprovar mais adiante, e começa aqui.',
    onde: 'Editor › Arquivo › Histórico de versões',
    passos: [
      'Abra Arquivo › Histórico de versões.',
      'A versão de agora traz o seu nome e o da Marta, lado a lado.',
    ],
    feita: c => {
      const nomes = maos(c.nuvem, 'escala');
      return nomes.includes('voce') && nomes.includes('marta');
    },
  },
  {
    id: 'viu-quem-esta-junto',
    titulo: 'Ver quem está com o documento aberto agora',
    detalhe: 'As bolhas no alto dizem quem está dentro neste instante — e é a única '
      + 'coisa na tela que separa "estamos escrevendo juntos" de "eu estou sozinho aqui".',
    onde: 'Editor › as bolhas no canto de cima',
    passos: [
      'Olhe as bolhas no alto do editor, ao lado de Compartilhar.',
      'Passe o ponteiro em cada uma para ver de quem é.',
    ],
    feita: c => viu(c, 'viu-as-bolhas'),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 5 — Comentar e resolver (requisito 4.3)
   ──────────────────────────────────────────────────────────────────────── */

const comentariosDaEscala = (c: ContextoDaNuvem) => {
  const d = docDe(c.nuvem, 'escala');
  return d ? comentariosDoDoc(d) : [];
};

const comentarioDaMarta = (c: ContextoDaNuvem) =>
  comentariosDaEscala(c).find(x => x.id === 'c-marta-1');

export const METAS_DOS_COMENTARIOS: Meta[] = [
  {
    id: 'respondeu-a-marta',
    titulo: 'Responder a pergunta que a Marta deixou na margem',
    detalhe: 'Ela perguntou se a Onça dá conta do almoço de sábado com quatro '
      + 'desbravadores. Pergunta espera resposta, e não um clique.',
    onde: 'Editor › o balão na margem direita › Responder',
    passos: [
      'Clique no balão da Marta, na margem do parágrafo do almoço.',
      'Escreva a resposta no campo e clique em Responder.',
    ],
    feita: c => (comentarioDaMarta(c)?.respostas.length ?? 0) > 0,
  },
  {
    id: 'resolveu-o-dela',
    titulo: 'E só então resolver o comentário dela',
    detalhe: 'Resolver é um clique, e responder não. Resolver sem responder fecha o '
      + 'assunto sem dizer nada a quem perguntou — e quem perguntou fica achando que '
      + 'ninguém leu.',
    onde: 'Editor › o balão da Marta › Resolver',
    passos: [
      'Com a resposta escrita, clique em Resolver no mesmo balão.',
      'O balão sai da margem, e a conversa fica guardada.',
    ],
    feita: c => {
      const cm = comentarioDaMarta(c);
      return !!cm && cm.resolvido && cm.respostas.length > 0;
    },
  },
  {
    id: 'comentou-no-seu',
    titulo: 'Deixar um comentário seu num parágrafo',
    detalhe: 'Comentar é o jeito de dizer alguma coisa **sobre** o texto sem mexer no '
      + 'texto. O requisito 4.3 pede as duas metades: inserir um seu e resolver o de '
      + 'outra pessoa.',
    onde: 'Editor › escolha um parágrafo › o botão de comentar na barra',
    passos: [
      'Clique num parágrafo da escala.',
      'Clique no botão de comentar, na barra de cima.',
      'Escreva a sua observação.',
    ],
    feita: c => comentariosDaEscala(c).some(x => x.autor === 'voce'),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 6 — Sugerir, aceitar e rejeitar (requisito 4.4)
   ──────────────────────────────────────────────────────────────────────── */

const sugestoes = (c: ContextoDaNuvem) => {
  const d = docDe(c.nuvem, 'materiais');
  return d ? revisoesPendentes(d) : [];
};

export const METAS_DA_SUGESTAO: Meta[] = [
  {
    id: 'viu-o-comentarista-nao-editar',
    titulo: 'Tentar escrever no combinado da Marta, e ver o que acontece',
    detalhe: 'No combinado dela você é comentarista. Digitar ali não muda o texto: vira '
      + 'sugestão, e espera alguém aceitar. Quem não sabe disso acha que editou.',
    onde: 'Editor › abra o Combinado do acampamento e tente escrever',
    passos: [
      'Abra o Combinado do acampamento, que é da Marta.',
      'Tente escrever no meio de uma frase.',
      'Repare no que o editor faz com o que você escreveu.',
    ],
    feita: c => viu(c, 'comentarista-so-sugere'),
  },
  {
    id: 'propos-em-sugestao',
    titulo: 'Propor duas alterações na sua lista, em modo de Sugestão',
    detalhe: 'No seu próprio documento o modo de Sugestão também existe, e é assim que '
      + 'se propõe uma mudança para a equipe ver antes de ela valer.',
    onde: 'Editor › a barra de cima › o seletor de modo, à direita',
    passos: [
      'Abra a Lista de materiais.',
      'No canto direito da barra, troque o modo de Edição para Sugestão.',
      'Mude duas coisas — uma quantidade e um item.',
    ],
    /*
      Ela lê a **descoberta**, e não as sugestões pendentes, porque as duas
      metas seguintes resolvem as duas sugestões: com `sugestoes >= 2` aqui, a
      lista nunca fecharia — quem fizesse tudo certo ficaria olhando uma meta
      que acabou de apagar a própria prova. É o defeito que a CC-ES004 tinha
      na lição de assinar, e ele não sai de graça: a descoberta só é gravada
      quando o que se escreve vira marca de sugestão em vez de virar texto.
    */
    feita: c => viu(c, 'escreveu-em-modo-sugestao'),
  },
  {
    id: 'aceitou-uma',
    titulo: 'Aceitar uma delas, e o texto mudar de verdade',
    detalhe: 'Aceitar tira a marca e deixa o texto. Até alguém aceitar, o documento '
      + 'continua dizendo o que dizia.',
    onde: 'Editor › o balão da sugestão › Aceitar',
    passos: [
      'Volte o modo para Edição.',
      'Clique na primeira sugestão e escolha Aceitar.',
      'Repare que a marca some e o texto novo fica.',
    ],
    /*
      As duas metades são necessárias. O gesto sozinho premiaria o clique —
      e o estado sozinho não separa aceitar de rejeitar, porque as duas
      operações tiram a marca e a diferença está em qual texto sobrou. É a
      decisão das duas descobertas do módulo 6 da CC-ES004.
    */
    feita: c => {
      const d = docDe(c.nuvem, 'materiais');
      const antes = docDe(c.antes, 'materiais');
      return viu(c, 'aceitou-uma-sugestao')
        && !!d && !!antes && textoDoDoc(d) !== textoDoDoc(antes);
    },
  },
  {
    id: 'rejeitou-a-outra',
    titulo: 'E rejeitar a outra, e o texto voltar inteiro',
    detalhe: 'Rejeitar faz o contrário: o que foi proposto nunca existiu, e o que '
      + 'estava riscado volta. Os dois botões são a mesma operação espelhada.',
    onde: 'Editor › o balão da outra sugestão › Rejeitar',
    passos: [
      'Clique na sugestão que sobrou e escolha Rejeitar.',
      'Confira: o texto voltou a ser o que era naquela frase.',
    ],
    feita: c => sugestoes(c).length === 0 && viu(c, 'rejeitou-uma-sugestao'),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 7 — O histórico de versões (requisitos 2.3 e 4.5)
   ──────────────────────────────────────────────────────────────────────── */

const AS_DECISOES = 'a inscrição custa 45 reais';

export const METAS_DO_HISTORICO: Meta[] = [
  {
    id: 'achou-a-versao',
    titulo: 'Achar no histórico a versão que ainda tinha as decisões',
    detalhe: 'Alguém apagou o parágrafo das decisões da ata e salvou. Na tela não há '
      + 'sinal nenhum disso: a ata abre inteira, bem formatada, e só falta o que falta.',
    onde: 'Editor › Arquivo › Histórico de versões',
    passos: [
      'Abra a Ata da reunião de junho.',
      'Vá em Arquivo › Histórico de versões.',
      'Clique nas versões, de baixo para cima, até achar a que tem as decisões.',
    ],
    feita: c => viu(c, 'achou-a-versao-boa'),
  },
  {
    id: 'restaurou',
    titulo: 'Restaurar essa versão',
    detalhe: 'Restaurar **não apaga** as versões mais novas: ela acrescenta uma. Quem '
      + 'acha que restaurar destrói o que veio depois nunca restaura, e prefere '
      + 'refazer o trabalho à mão.',
    onde: 'Editor › Histórico de versões › Restaurar esta versão',
    passos: [
      'Com a versão certa escolhida, clique em Restaurar esta versão.',
      'A ata volta a ter o parágrafo das decisões.',
      'Abra o histórico de novo: a versão de 8 de julho continua lá.',
    ],
    /*
      "E a versão de 8 de julho continua no histórico" é **condição**, e não
      meta: ela é verdade no segundo zero, e como item da lista abriria verde.
      Junta aqui, ela reprova quem restaurar apagando o que veio depois — que
      é o modelo errado de restauração que esta lição existe para desfazer.
    */
    feita: c => {
      const d = docDe(c.nuvem, 'ata');
      const a = arq(c.nuvem, 'ata');
      return !!d && textoDoDoc(d).includes(AS_DECISOES)
        && !!a?.versoes.some(v => v.id === 'ata-v3');
    },
  },
  {
    id: 'o-historico-diz-quem',
    titulo: 'Ver quem escreveu em cada versão',
    detalhe: 'O histórico guarda quem **escreveu**, e não quem abriu. Ler não é '
      + 'participar, e um histórico que contasse leitura diria que todo mundo ajudou.',
    onde: 'Editor › Histórico de versões › os nomes embaixo de cada data',
    passos: [
      'No painel de versões, olhe os nomes embaixo de cada data.',
      'Repare que a versão que você acabou de criar traz o seu.',
    ],
    feita: c => viu(c, 'leu-quem-escreveu') && maos(c.nuvem, 'ata').includes('voce'),
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 8 — O conflito de edição (requisitos 2.4 e 6)
   ──────────────────────────────────────────────────────────────────────── */

const O_QUE_A_MARTA_ESCREVEU_SEM_INTERNET = 'A Águia troca com a Onça no almoço de sábado.';
const O_QUE_VOCE_ESCREVEU = 'lanche';

export const METAS_DO_CONFLITO: Meta[] = [
  {
    id: 'provocou',
    titulo: 'Provocar o conflito: os dois mexem no arquivo sincronizado',
    detalhe: 'Na pasta que sincroniza com o computador não há edição simultânea. Quem '
      + 'estava sem internet volta, e as duas versões chegam ao servidor ao mesmo tempo.',
    onde: 'Nuvem › a escala na pasta sincronizada › Simular a volta da internet',
    passos: [
      'Escreva a sua linha na escala, pela pasta sincronizada.',
      'A Marta escreveu na dela, sem internet, na mesma hora.',
      'Quando a internet dela volta, as duas versões sobem.',
    ],
    /*
      Ela lê o conflito que **houve**, e não o que ainda está na pasta: a meta
      seguinte manda tirar a cópia da frente, e com `copiasEmConflito` aqui
      esta voltaria a ficar vermelha no fim — quem fizesse tudo certo ficaria
      com uma lista que nunca fecha. Foi a própria trava que achou, na
      primeira execução, e é o defeito que a CC-ES004 teve na lição de
      assinar. A lixeira existe por causa disto: apagar de verdade apagaria a
      prova de que o conflito aconteceu.
    */
    feita: c => conflitosQueHouve(c.nuvem).length > 0,
  },
  {
    id: 'achou-a-copia',
    titulo: 'Achar a cópia em conflito na pasta',
    detalhe: 'A nuvem não escolhe entre as duas: ela guarda as duas. O trabalho não se '
      + 'perde por ser sobrescrito — se perde por ficar num arquivo que ninguém abre, '
      + 'na mesma pasta, com o nome quase igual.',
    onde: 'Nuvem › a pasta do clube › o arquivo com "(cópia em conflito de …)"',
    passos: [
      'Volte para a nuvem e olhe a pasta.',
      'Tem um arquivo a mais, com "(cópia em conflito de Marta)" no nome.',
      'Abra e leia o que está dentro: é o que ela escreveu.',
    ],
    feita: c => viu(c, 'abriu-a-copia-em-conflito'),
  },
  {
    id: 'juntou',
    titulo: 'Juntar o que os dois escreveram num arquivo só',
    detalhe: 'Apagar a cópia sem juntar joga fora o que a outra pessoa escreveu — que é '
      + 'exatamente o que o conflito existia para não deixar acontecer.',
    onde: 'Editor › a escala › escreva também o que estava na cópia',
    passos: [
      'Abra a escala e acrescente o que a Marta tinha escrito na cópia dela.',
      'Confira que as duas coisas estão no mesmo arquivo agora.',
    ],
    feita: c => {
      const d = docDe(c.nuvem, 'escala');
      if (!d) return false;
      const texto = textoDoDoc(d);
      return texto.includes(O_QUE_A_MARTA_ESCREVEU_SEM_INTERNET)
        && texto.toLowerCase().includes(O_QUE_VOCE_ESCREVEU);
    },
  },
  {
    id: 'tirou-a-copia',
    titulo: 'E tirar a cópia da pasta',
    detalhe: 'Juntar sem apagar a cópia deixa na pasta um arquivo quase igual, que '
      + 'alguém vai abrir por engano no mês que vem — e trabalhar nele.',
    onde: 'Nuvem › a cópia em conflito › Mover para a lixeira',
    passos: [
      'Com o conteúdo já junto, volte para a nuvem.',
      'Nos três pontos da cópia em conflito, mande para a lixeira.',
    ],
    /*
      As duas metades outra vez. "Não há cópia em conflito na pasta" é verdade
      no segundo zero — esta meta abriria verde com a anterior. O que a fecha
      é o conflito ter existido **e** ter saído da frente, e por isso a cópia
      vai para a lixeira em vez de deixar de existir: apagá-la de verdade
      deixaria a nuvem igualzinha à de quem nunca teve conflito nenhum.
    */
    feita: c => copiasEmConflito(c.nuvem).length === 0
      && conflitosQueHouve(c.nuvem).length > 0,
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   Módulo 9 — O combinado da equipe (requisitos 2.5, 4.6, 7 e 8)
   ──────────────────────────────────────────────────────────────────────── */

/** Uma resposta de verdade, e não um ponto para a lista ficar verde. */
const RESPOSTA_MINIMA = 25;

const respondeu = (d: Doc<string> | undefined, id: string) => {
  const bloco = d?.blocos.find(b => b.id === id);
  if (!bloco || bloco.tipo !== 'paragrafo') return false;
  return bloco.trechos.map(x => x.texto).join('').trim().length >= RESPOSTA_MINIMA;
};

export const METAS_DO_COMBINADO: Meta[] = [
  {
    id: 'quatro-respostas',
    titulo: 'Responder as quatro perguntas do combinado',
    detalhe: 'Onde ficam os arquivos, como eles se chamam, quem tem cada permissão, e '
      + 'o que acontece quando alguém sai. As quatro precisam de resposta: a que ficar '
      + 'de fora é a que vai custar, e sempre é a última.',
    onde: 'Editor › o Combinado de trabalho › cada parágrafo embaixo de uma pergunta',
    passos: [
      'Abra o Combinado de trabalho — equipe do acampamento.',
      'Escreva a resposta de cada uma das quatro perguntas.',
      'Escreva como quem vai ler daqui a um ano, sem você por perto para explicar.',
    ],
    feita: c => {
      const d = docDe(c.nuvem, 'acordo');
      return PERGUNTAS_DO_COMBINADO.every(p => respondeu(d, RESPOSTA_DE(p.id)));
    },
  },
  {
    id: 'tres-maos',
    titulo: 'E o histórico nomear você, a Marta e o Ronaldo',
    detalhe: 'O requisito 8 pede um documento feito com pelo menos duas outras pessoas, '
      + 'comprovando no histórico a participação de cada uma. Colar o texto dos outros '
      + 'deixa o histórico com um nome só.',
    onde: 'Editor › Arquivo › Histórico de versões',
    passos: [
      'Deixe a Marta e o Ronaldo escreverem as partes deles.',
      'Abra o histórico e confira: os três nomes aparecem.',
    ],
    feita: c => {
      const nomes = maos(c.nuvem, 'acordo');
      return (['voce', 'marta', 'ronaldo'] as Pessoa[]).every(q => nomes.includes(q));
    },
  },
  {
    id: 'guardou-na-pasta',
    titulo: 'Guardar o combinado na pasta da equipe',
    detalhe: 'É a primeira pergunta do combinado, respondida com o gesto e não só com '
      + 'a frase. Arquivo solto na nuvem de uma pessoa é arquivo que some com ela.',
    onde: 'Nuvem › o combinado › menu de três pontos › Mover para',
    passos: [
      'Na nuvem, ache o Combinado de trabalho.',
      'Mova-o para a pasta Clube Pioneiros.',
    ],
    feita: c => pastasAcima(c.nuvem, 'acordo').some(p => p.id === 'pasta-clube'),
  },
  {
    id: 'passou-a-propriedade',
    titulo: 'Passar a propriedade para quem fica na equipe',
    detalhe: 'Dar permissão de editar não é dar a conta. No dia em que você sair do '
      + 'clube, a sua conta some — e os arquivos que são seus somem junto, por mais '
      + 'gente que tivesse acesso. Transferir não é perder: você continua editor.',
    onde: 'Nuvem › o combinado › Compartilhar › o seletor do Ronaldo › Transferir propriedade',
    passos: [
      'Abra Compartilhar no Combinado de trabalho.',
      'No seletor ao lado do Ronaldo, escolha Transferir propriedade.',
      'Confira: ele virou Proprietário e você continua na lista, como Editor.',
    ],
    feita: c => arq(c.nuvem, 'acordo')?.dono === 'ronaldo'
      && papelDe(c.nuvem, 'acordo', 'voce') === 'editor',
  },
];

/* ────────────────────────────────────────────────────────────────────────────
   O registro das nove lições
   ──────────────────────────────────────────────────────────────────────── */

export type LicaoDaCcEs006 =
  | 'anexo' | 'niveis' | 'pasta' | 'juntos' | 'comentarios'
  | 'sugestao' | 'historico' | 'conflito' | 'combinado';

export interface LicaoDaNuvem {
  /** De que estado da nuvem esta lição parte. */
  inicial: () => Nuvem;
  /** Qual arquivo o editor abre quando a lição começa. `undefined` abre a nuvem. */
  abre?: string;
  metas: Meta[];
}

/** O combinado de trabalho, que só existe a partir do módulo 9. */
const comOCombinado = (n: Nuvem): Nuvem => ({
  arquivos: [
    ...n.arquivos,
    arquivoDe('acordo', 'Combinado de trabalho', 'documento', 'voce', {
      acessos: [{ quem: 'marta', papel: 'editor' }, { quem: 'ronaldo', papel: 'editor' }],
      versoes: [{
        id: 'acordo-v1', quando: 'agora mesmo', porQuem: ['voce'],
        doc: COMBINADO_DE_TRABALHO(),
      }],
    }),
  ],
});

/**
 * A escala já com a linha da Marta, de onde o módulo 5 parte.
 *
 * Começar a lição seguinte mandando refazer a anterior ensinaria que o
 * trabalho de antes não conta. É o campo `documento` da CC-ES002 e o
 * `caderno` da CC-ES003, pelo motivo escrito nos dois.
 */
const depoisDeEscreverJunto = (): Nuvem => {
  const escrita = ESCALA();
  return gravarVersao(nuvemDoClube(), 'escala', 'hoje, 20:40', ['voce', 'marta'],
    { ...escrita, blocos: [...escrita.blocos, LINHA_DA_MARTA()] });
};

export const LICOES_DA_CC_ES006: Record<LicaoDaCcEs006, LicaoDaNuvem> = {
  anexo: { inicial: nuvemDoClube, abre: 'materiais', metas: METAS_DO_ANEXO },
  niveis: { inicial: nuvemDoClube, abre: 'materiais', metas: METAS_DOS_NIVEIS },
  pasta: { inicial: nuvemDoClube, metas: METAS_DA_PASTA },
  juntos: { inicial: nuvemDoClube, abre: 'escala', metas: METAS_DE_ESCREVER_JUNTO },
  comentarios: {
    inicial: depoisDeEscreverJunto, abre: 'escala', metas: METAS_DOS_COMENTARIOS,
  },
  sugestao: { inicial: nuvemDoClube, abre: 'materiais', metas: METAS_DA_SUGESTAO },
  historico: { inicial: nuvemDoClube, abre: 'ata', metas: METAS_DO_HISTORICO },
  conflito: { inicial: nuvemDoClube, abre: 'escala', metas: METAS_DO_CONFLITO },
  combinado: {
    inicial: () => comOCombinado(nuvemDoClube()), abre: 'acordo', metas: METAS_DO_COMBINADO,
  },
};

/** O contexto de partida de uma lição, com a nuvem de antes já guardada. */
export const contextoInicial = (l: LicaoDaCcEs006): ContextoDaNuvem => {
  const n = LICOES_DA_CC_ES006[l].inicial();
  return { nuvem: n, antes: n, modo: 'edicao', descobertas: [] };
};
