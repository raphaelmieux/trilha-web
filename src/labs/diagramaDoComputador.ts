/**
 * O diagrama do caminho da informação — AP045 requisito 5.
 *
 * "Saber explicar o funcionamento de informações entre periféricos e a CPU,
 * usando o código binário 1 e 0. Montar um diagrama." São três coisas numa
 * frase: as peças e o sentido em que a informação anda entre elas; o código
 * binário que anda; e o diagrama, que é onde as duas primeiras se mostram.
 *
 * O modelo e o critério moram fora do componente pela razão de sempre — um
 * teste os alcança sem montar tela.
 *
 * ── A BNCC por trás, e o tamanho da conta ────────────────────────────────
 * Valor posicional é EF06MA02: o sistema decimal, e a comparação dele com
 * outros sistemas de numeração. É exatamente o que se faz aqui, com a base 2 —
 * oito chaves, cada uma valendo o dobro da vizinha. A conta é pequena de
 * propósito: 67 cabe em três chaves (64 + 2 + 1), e quem entende por que são
 * essas três entende o binário inteiro. O resto é o eixo Mundo Digital do
 * complemento de Computação à BNCC: como a informação é representada e por
 * onde ela passa dentro da máquina.
 *
 * ── Por que ele chega com um rascunho, e não vazio ───────────────────────
 * O diagrama abre com o teclado, a CPU e o monitor já postos e duas setas:
 * uma certa e sem rótulo, e uma ao contrário — do monitor para a CPU. É o erro
 * mais comum de quem desenha isto pela primeira vez: o monitor "conversa" com
 * o computador, então a seta parece poder ir para os dois lados. Não vai. O
 * monitor só recebe.
 *
 * Tela vazia pediria que o desbravador adivinhasse o que um diagrama é;
 * rascunho errado pede que ele olhe para um e diga o que está errado — que é
 * o que ele vai fazer na frente do examinador.
 */

/* ── As peças ──────────────────────────────────────────────────────────── */

export type TipoDePeca =
  | 'teclado' | 'mouse' | 'scanner' | 'microfone'
  | 'cpu' | 'ram' | 'disco' | 'video'
  | 'monitor' | 'impressora' | 'caixa-de-som';

/**
 * O que a peça faz com a informação.
 *
 * Isto nunca aparece na tela. A paleta lista as peças pelo nome, em ordem
 * alfabética, sem agrupar por papel: agrupar seria escrever na tela a resposta
 * da primeira metade do requisito — quem é entrada e quem é saída — e o
 * desbravador passaria a desenhar setas por onde a paleta mandou.
 */
export type Papel = 'entrada' | 'processamento' | 'memoria' | 'armazenamento' | 'video' | 'saida';

export const PAPEL: Record<TipoDePeca, Papel> = {
  teclado: 'entrada',
  mouse: 'entrada',
  scanner: 'entrada',
  microfone: 'entrada',
  cpu: 'processamento',
  ram: 'memoria',
  disco: 'armazenamento',
  video: 'video',
  monitor: 'saida',
  impressora: 'saida',
  'caixa-de-som': 'saida',
};

export const NOME_DA_PECA: Record<TipoDePeca, string> = {
  teclado: 'Teclado',
  mouse: 'Mouse',
  scanner: 'Scanner',
  microfone: 'Microfone',
  cpu: 'CPU',
  ram: 'Memória RAM',
  disco: 'Disco',
  video: 'Placa de vídeo',
  monitor: 'Monitor',
  impressora: 'Impressora',
  'caixa-de-som': 'Caixa de som',
};

/** A paleta, na ordem do nome — e não do papel. */
export const PALETA: TipoDePeca[] = (Object.keys(NOME_DA_PECA) as TipoDePeca[])
  .sort((a, b) => NOME_DA_PECA[a].localeCompare(NOME_DA_PECA[b], 'pt-BR'));

export interface Peca {
  id: string;
  tipo: TipoDePeca;
  /** Posição do centro, no espaço lógico da prancheta (800 × 480). */
  x: number;
  y: number;
}

export interface Seta {
  id: string;
  de: string;
  para: string;
  /** O que está passando por ela — escrito por quem desenhou. */
  rotulo: string;
}

/** O resultado da última simulação, preso ao desenho de quando ela rodou. */
export interface Simulacao {
  chegou: boolean;
  /** A letra que acendeu no monitor, quando chegou. */
  letra: string | null;
  assinatura: string;
}

export interface Diagrama {
  pecas: Peca[];
  setas: Seta[];
  /** As oito chaves, da de maior valor (128) para a de menor (1). */
  bits: boolean[];
  simulacao: Simulacao | null;
  /** A assinatura do desenho exportado, ou `null` enquanto ninguém exportou. */
  exportado: string | null;
}

export const LARGURA = 800;
export const ALTURA = 480;

/* ── O código ──────────────────────────────────────────────────────────── */

export const VALORES_DAS_CHAVES = [128, 64, 32, 16, 8, 4, 2, 1];

/** A tecla da história: C maiúscula, que no código ASCII é o 67. */
export const LETRA_DA_HISTORIA = 'C';
export const CODIGO_DA_LETRA = 67;

export const valorDosBits = (bits: readonly boolean[]): number =>
  bits.reduce((s, b, i) => s + (b ? VALORES_DAS_CHAVES[i] : 0), 0);

export const bitsComoTexto = (bits: readonly boolean[]): string =>
  bits.map(b => (b ? '1' : '0')).join('');

/**
 * A letra que um código acende.
 *
 * Só as maiúsculas e os algarismos têm desenho aqui — o resto é "?", como o
 * quadradinho que um programa mostra quando não sabe desenhar o caractere. É
 * isso que faz a simulação ensinar: com 65 o monitor acende A, e quem errou
 * uma chave vê a letra errada na tela, e não um aviso.
 */
export function letraDoCodigo(codigo: number): string {
  if (codigo >= 65 && codigo <= 90) return String.fromCharCode(codigo);
  if (codigo >= 48 && codigo <= 57) return String.fromCharCode(codigo);
  if (codigo === 32) return '␣';
  return '?';
}

/* ── As setas ──────────────────────────────────────────────────────────── */

export const umaPeca = (d: Diagrama, id: string) => d.pecas.find(p => p.id === id);

/**
 * Por que uma seta está no sentido errado, ou `null` quando está certa.
 *
 * A regra é o caminho do requisito, e nada mais fino do que isso: a entrada
 * só manda para a CPU; a CPU manda para a saída, direto ou pela placa de
 * vídeo; memória e disco conversam com a CPU nos dois sentidos, porque ela
 * guarda **e** busca. Uma CPU mandando direto para o monitor passa — placa de
 * vídeo integrada ao processador existe, e é o que tem na maioria dos
 * notebooks —, e reprovar isso seria ensinar uma meia-verdade.
 *
 * A frase diz o que a peça faz, e não o que a seta deveria ser: "o monitor só
 * recebe" deixa a pessoa descobrir sozinha que é para inverter.
 */
export function problemaDaSeta(d: Diagrama, s: Seta): string | null {
  const de = umaPeca(d, s.de);
  const para = umaPeca(d, s.para);
  if (!de || !para) return 'Esta seta aponta para uma peça que não está mais no diagrama.';
  if (de.id === para.id) return 'Esta seta sai e chega na mesma peça.';
  const a = PAPEL[de.tipo];
  const b = PAPEL[para.tipo];
  const nomeDe = NOME_DA_PECA[de.tipo];
  const nomePara = NOME_DA_PECA[para.tipo];

  if (b === 'entrada') return `${nomePara} é por onde a informação entra: nada chega até ${artigo(para.tipo)} por esta seta.`;
  if (a === 'saida') return `${nomeDe} só recebe: é por ${artigo(de.tipo)} que a informação sai para a pessoa, e não volta por ali.`;
  if (a === 'entrada' && b !== 'processamento') return `${nomeDe} não fala direto com ${comArtigo(para.tipo)}: quem decide o que fazer com o toque é a CPU.`;
  if (a === 'video' && b !== 'saida') return 'A placa de vídeo transforma o código em pixels para o monitor; ela não manda nada de volta.';
  if (b === 'video' && a !== 'processamento') return 'A placa de vídeo recebe da CPU o que é para desenhar.';
  if ((a === 'memoria' || a === 'armazenamento') && b !== 'processamento') return `${nomeDe} guarda para a CPU, e só com ela troca informação.`;
  if ((b === 'memoria' || b === 'armazenamento') && a !== 'processamento') return `${nomePara} guarda para a CPU, e só com ela troca informação.`;
  if (b === 'saida' && a !== 'processamento' && a !== 'video') return `${nomePara} recebe da CPU — ou da placa de vídeo — o que é para mostrar.`;
  return null;
}

/** "a CPU", "o monitor": a frase falada precisa do artigo. */
const comArtigo = (t: TipoDePeca) =>
  `${artigo(t) === 'ela' ? 'a' : 'o'} ${t === 'cpu' ? 'CPU' : NOME_DA_PECA[t][0].toLowerCase() + NOME_DA_PECA[t].slice(1)}`;

function artigo(t: TipoDePeca): string {
  return ['cpu', 'ram', 'impressora', 'caixa-de-som', 'video'].includes(t) ? 'ela' : 'ele';
}

/* ── A simulação ───────────────────────────────────────────────────────── */

/**
 * Tudo o que decide o resultado de uma simulação ou de uma exportação.
 *
 * A posição das peças fica de fora de propósito: arrastar uma caixa para
 * arrumar o desenho não muda o caminho, e invalidar a simulação por isso
 * ensinaria que o diagrama é a aparência dele.
 */
export function assinatura(d: Diagrama): string {
  const pecas = d.pecas.map(p => `${p.id}:${p.tipo}`).sort();
  const setas = d.setas.map(s => `${s.de}>${s.para}=${s.rotulo.trim()}`).sort();
  return JSON.stringify([pecas, setas, bitsComoTexto(d.bits)]);
}

export interface PassoDaSimulacao {
  setaId: string;
  de: TipoDePeca;
  para: TipoDePeca;
  /** O que anda por ela: o rótulo escrito, ou o código quando não há rótulo. */
  leva: string;
}

export interface ResultadoDaSimulacao {
  chegou: boolean;
  passos: PassoDaSimulacao[];
  /** A letra que o monitor acende, quando a informação chega a ele. */
  letra: string | null;
  /** Por que parou, quando parou. */
  motivo: string | null;
  /** As setas que estão ao contrário, com o porquê — mostradas mesmo quando chega. */
  problemas: { setaId: string; motivo: string }[];
}

/**
 * Solta os bits no teclado e segue as setas até o monitor.
 *
 * Só as setas no sentido certo são percorridas: a que está ao contrário não
 * leva nada, e é assim que o rascunho de partida falha — o monitor→CPU não
 * chega a lugar nenhum. As erradas continuam listadas em `problemas` mesmo
 * quando existe outro caminho que chega: um diagrama que funciona apesar de
 * uma seta errada continua ensinando a seta errada a quem o ler.
 *
 * A memória entra no caminho quando está ligada à CPU: é lá que a letra fica
 * enquanto é usada, e o requisito fala do caminho, não só do atalho.
 */
export function simular(d: Diagrama): ResultadoDaSimulacao {
  const problemas = d.setas
    .map(s => ({ setaId: s.id, motivo: problemaDaSeta(d, s) }))
    .filter((p): p is { setaId: string; motivo: string } => p.motivo !== null);
  const erradas = new Set(problemas.map(p => p.setaId));
  const validas = d.setas.filter(s => !erradas.has(s.id));

  const teclado = d.pecas.find(p => p.tipo === 'teclado');
  if (!teclado) {
    return { chegou: false, passos: [], letra: null, problemas,
      motivo: 'Não há teclado no diagrama: a tecla C não tem por onde entrar.' };
  }

  const codigo = bitsComoTexto(d.bits);
  const leva = (s: Seta) => s.rotulo.trim() || codigo;

  /* Busca em largura a partir do teclado, guardando por qual seta se chegou. */
  const veio = new Map<string, Seta>();
  const fila = [teclado.id];
  const vistos = new Set(fila);
  while (fila.length) {
    const atual = fila.shift()!;
    for (const s of validas.filter(x => x.de === atual)) {
      if (vistos.has(s.para)) continue;
      vistos.add(s.para);
      veio.set(s.para, s);
      fila.push(s.para);
    }
  }

  const monitor = d.pecas.find(p => p.tipo === 'monitor' && vistos.has(p.id));
  if (!monitor) {
    const cpuAlcancada = d.pecas.some(p => p.tipo === 'cpu' && vistos.has(p.id));
    const motivo = !d.pecas.some(p => p.tipo === 'monitor')
      ? 'Não há monitor no diagrama: a letra não tem onde aparecer.'
      : cpuAlcancada
        ? 'Os bits chegaram à CPU e pararam: nenhuma seta leva o resultado até o monitor.'
        : 'Os bits não saíram do teclado: nenhuma seta no sentido certo leva à CPU.';
    return { chegou: false, passos: caminhoAte(d, veio, [...vistos].filter(v => v !== teclado.id), leva),
      letra: null, motivo, problemas };
  }

  const passos = caminho(d, veio, monitor.id, leva);
  /* A passagem pela memória, quando ela está ligada à CPU do caminho. */
  const cpuDoCaminho = passos.find(p => p.para === 'cpu') ? d.pecas.find(p => p.tipo === 'cpu' && vistos.has(p.id)) : undefined;
  if (cpuDoCaminho) {
    const paraMemoria = validas.find(s => s.de === cpuDoCaminho.id && umaPeca(d, s.para)?.tipo === 'ram');
    if (paraMemoria) {
      const i = passos.findIndex(p => p.para === 'cpu');
      passos.splice(i + 1, 0, { setaId: paraMemoria.id, de: 'cpu', para: 'ram', leva: leva(paraMemoria) });
    }
  }

  return { chegou: true, passos, letra: letraDoCodigo(valorDosBits(d.bits)), motivo: null, problemas };
}

function caminho(
  d: Diagrama, veio: Map<string, Seta>, ate: string, leva: (s: Seta) => string,
): PassoDaSimulacao[] {
  const passos: PassoDaSimulacao[] = [];
  let atual = ate;
  while (veio.has(atual)) {
    const s = veio.get(atual)!;
    passos.unshift({ setaId: s.id, de: umaPeca(d, s.de)!.tipo, para: umaPeca(d, s.para)!.tipo, leva: leva(s) });
    atual = s.de;
  }
  return passos;
}

/** O pedaço de caminho que andou, para mostrar onde parou. */
function caminhoAte(
  d: Diagrama, veio: Map<string, Seta>, alcancados: string[], leva: (s: Seta) => string,
): PassoDaSimulacao[] {
  const maisLonge = alcancados[alcancados.length - 1];
  return maisLonge ? caminho(d, veio, maisLonge, leva) : [];
}

/** Roda a simulação e guarda o resultado preso ao desenho de agora. */
export function comSimulacao(d: Diagrama): Diagrama {
  const r = simular(d);
  return { ...d, simulacao: { chegou: r.chegou, letra: r.letra, assinatura: assinatura(d) } };
}

/* ── O roteiro da explicação ───────────────────────────────────────────── */

const FRASE_DA_PECA: Record<TipoDePeca, string> = {
  teclado: 'o teclado percebe a tecla apertada',
  mouse: 'o mouse percebe o movimento',
  scanner: 'o scanner lê o papel',
  microfone: 'o microfone capta o som',
  cpu: 'a CPU interpreta o código e decide o que fazer',
  ram: 'a memória RAM guarda a informação enquanto ela está sendo usada',
  disco: 'o disco guarda a informação para depois',
  video: 'a placa de vídeo transforma o código em pixels',
  monitor: 'o monitor acende os pixels',
  impressora: 'a impressora põe no papel',
  'caixa-de-som': 'a caixa de som faz o som',
};

/**
 * O que dizer ao examinador, em primeira pessoa, lendo o próprio diagrama.
 *
 * O requisito pede **saber explicar**, e o diagrama é o apoio da explicação,
 * não a explicação. Primeira pessoa porque é para falar em voz alta — a
 * mesma decisão do roteiro de Python e do de planilha. E descreve sem julgar:
 * quem avalia é o examinador, e o roteiro só põe em frases o que está
 * desenhado, rótulos inclusive, do jeito que foram escritos.
 */
export function roteiroDoDiagrama(d: Diagrama): string[] {
  const r = simular(d);
  if (!r.chegou) return [];
  const codigo = bitsComoTexto(d.bits);
  const valor = valorDosBits(d.bits);
  const ligadas = VALORES_DAS_CHAVES.filter((_, i) => d.bits[i]);
  const frases = [
    `Eu aperto a tecla ${LETRA_DA_HISTORIA}. Dentro do computador ela é o número ${valor}, que em binário se escreve ${codigo}${ligadas.length ? ` — ${ligadas.join(' + ')} = ${valor}` : ''}.`,
    'Cada 1 é "tem corrente" e cada 0 é "não tem": é assim que um circuito consegue guardar e mandar esse número.',
  ];
  r.passos.forEach((p, i) => {
    const quando = i === 0 ? 'Primeiro' : 'Depois';
    frases.push(`${quando} ${FRASE_DA_PECA[p.de]}, e pela seta até ${comArtigo(p.para)} passa: ${p.leva}.`);
  });
  frases.push(`No fim, ${FRASE_DA_PECA.monitor}, e eu vejo a letra ${r.letra} na tela.`);
  return frases;
}

/* ── O rascunho de partida ─────────────────────────────────────────────── */

export const DIAGRAMA_INICIAL: Diagrama = {
  pecas: [
    { id: 'p-teclado', tipo: 'teclado', x: 130, y: 240 },
    { id: 'p-cpu', tipo: 'cpu', x: 400, y: 240 },
    { id: 'p-monitor', tipo: 'monitor', x: 670, y: 240 },
  ],
  setas: [
    /* Certa, e sem dizer o que leva. */
    { id: 's-1', de: 'p-teclado', para: 'p-cpu', rotulo: '' },
    /* Ao contrário: é o erro que a lição existe para mostrar. */
    { id: 's-2', de: 'p-monitor', para: 'p-cpu', rotulo: '' },
  ],
  bits: [false, false, false, false, false, false, false, false],
  simulacao: null,
  exportado: null,
};

/* ── As metas ──────────────────────────────────────────────────────────── */

/** O código de C, em binário, com ou sem espaço no meio. */
const CODIGO_DE_C = CODIGO_DA_LETRA.toString(2).padStart(8, '0');
const levaOCodigo = (rotulo: string) => rotulo.replace(/\s+/g, '').includes(CODIGO_DE_C);

const temTipo = (d: Diagrama, t: TipoDePeca) => d.pecas.some(p => p.tipo === t);
const ligadas = (d: Diagrama, a: TipoDePeca, b: TipoDePeca) => d.setas.some(s => {
  const x = umaPeca(d, s.de)?.tipo; const y = umaPeca(d, s.para)?.tipo;
  return (x === a && y === b) || (x === b && y === a);
});

export interface MetaDoDiagrama {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (d: Diagrama) => boolean;
}

export const METAS_DO_DIAGRAMA: MetaDoDiagrama[] = [
  {
    id: 'pecas',
    titulo: 'Pôr as peças do caminho',
    detalhe: 'A letra C vai do teclado até a tela. Falta no rascunho a peça onde ela fica guardada enquanto a CPU trabalha com ela.',
    onde: 'Paleta de peças, à esquerda',
    passos: [
      'Olhe as peças que já estão na prancheta: teclado, CPU e monitor.',
      'Na paleta, clique em Memória RAM para pô-la na prancheta.',
      'Arraste a peça para perto da CPU, onde a seta vai ficar curta.',
    ],
    feita: d => temTipo(d, 'teclado') && temTipo(d, 'cpu') && temTipo(d, 'ram') && temTipo(d, 'monitor'),
  },
  {
    id: 'setas',
    titulo: 'Deixar toda seta no sentido em que a informação anda',
    detalhe: 'Uma das setas do rascunho está ao contrário. E a memória precisa de uma seta que a ligue à CPU.',
    onde: 'Ferramenta Conectar, e o painel Propriedades da seta',
    passos: [
      'Clique na seta que liga o monitor à CPU e leia o painel da direita.',
      'Use "Inverter sentido": o monitor só recebe.',
      'Escolha Conectar, clique na CPU e depois na Memória RAM.',
    ],
    /*
      Todas certas **e** o caminho existindo: sem a segunda metade, apagar
      todas as setas deixaria a meta verde — nenhuma seta errada porque
      nenhuma seta existe.
    */
    feita: d => d.setas.length > 0
      && d.setas.every(s => problemaDaSeta(d, s) === null)
      && ligadas(d, 'teclado', 'cpu')
      && ligadas(d, 'cpu', 'ram')
      && (ligadas(d, 'cpu', 'monitor') || (ligadas(d, 'cpu', 'video') && ligadas(d, 'video', 'monitor'))),
  },
  {
    id: 'codigo',
    titulo: 'Escrever em binário o código da letra C',
    detalhe: 'No código que o computador usa para as letras, o C maiúsculo é o número 67. Ligue as chaves cujos valores somam 67.',
    onde: 'Painel Código binário, embaixo da prancheta',
    passos: [
      'Cada chave vale o dobro da vizinha da direita: 128, 64, 32, 16, 8, 4, 2, 1.',
      'Comece pela maior que cabe em 67: é a de 64. Sobram 3.',
      'Das que sobram, o 3 é 2 + 1. Ligue as chaves de 64, 2 e 1, e deixe as outras em 0.',
    ],
    feita: d => valorDosBits(d.bits) === CODIGO_DA_LETRA,
  },
  {
    id: 'rotulos',
    titulo: 'Escrever em cada seta o que passa por ela',
    detalhe: 'Diagrama sem rótulo mostra que as peças se ligam, e não diz o quê. A seta que sai do teclado leva o código da letra C, em 1 e 0.',
    onde: 'Painel Propriedades da seta › Rótulo',
    passos: [
      'Clique numa seta e escreva, em Rótulo, o que anda por ela.',
      'Na seta do teclado para a CPU, escreva o código binário da letra C.',
      'Nas outras, diga com palavras: "a letra C, para guardar", "os pixels da letra C".',
    ],
    /* Toda seta com rótulo, e a do teclado com o código — o mesmo das
       chaves. Seta sem rótulo nenhuma não conta como rotulada. */
    feita: d => d.setas.length > 0
      && d.setas.every(s => s.rotulo.trim().length >= 3)
      && d.setas.some(s => umaPeca(d, s.de)?.tipo === 'teclado' && umaPeca(d, s.para)?.tipo === 'cpu' && levaOCodigo(s.rotulo)),
  },
  {
    id: 'simulacao',
    titulo: 'Simular e ver a letra C aparecer no monitor',
    detalhe: 'A simulação solta os bits no teclado e segue as setas. Se o desenho mudar depois, ela vale para o desenho antigo — rode de novo.',
    onde: 'Botão Simular, na barra de cima',
    passos: [
      'Deixe as setas e as chaves prontas antes: a simulação usa o que está desenhado.',
      'Clique em Simular.',
      'Se o monitor acender outra letra, confira as chaves; se os bits pararem, confira as setas.',
    ],
    feita: d => !!d.simulacao && d.simulacao.chegou
      && d.simulacao.letra === LETRA_DA_HISTORIA
      && d.simulacao.assinatura === assinatura(d),
  },
  {
    id: 'exportar',
    titulo: 'Exportar o diagrama para a apresentação',
    detalhe: 'É com a imagem na mão que você explica ao examinador. Exporte depois de terminar: a imagem guarda o desenho da hora em que foi feita.',
    onde: 'Arquivo › Exportar como imagem',
    passos: [
      'Termine o diagrama antes: a imagem não muda depois.',
      'Abra Arquivo e escolha Exportar como imagem.',
      'Leia o roteiro que aparece ao lado: é o que você vai dizer apontando para cada seta.',
    ],
    feita: d => d.exportado !== null && d.exportado === assinatura(d),
  },
];
