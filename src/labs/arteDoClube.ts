/**
 * O arquivo de arte do clube: as peças que a CC-DG001 abre, cada uma com o
 * defeito que a lição dela existe para consertar.
 *
 * ── Um arquivo, oito lições ──────────────────────────────────────────────
 * É o arranjo do `cadernoDoClube()` da CC-ES003 e do `discoDoClube()` da
 * CC-ES001, pelo motivo escrito nos dois: oito arquivos diferentes ensinariam
 * que cada exercício acontece num programa de mentira. As peças são pranchas
 * do mesmo arquivo, como num editor de verdade, e quem abre o módulo 7
 * reencontra o cartaz que arrumou no módulo 1.
 *
 * ── As peças da análise não são de ninguém de fora ───────────────────────
 * O requisito 4 pede três peças **reais**, e na vida o desbravador vai buscá-las
 * no mural da igreja. Aqui elas são do próprio clube: reproduzir o cartaz de
 * uma empresa de verdade para chamá-lo de mal resolvido seria pôr na tela a
 * marca de alguém para falar mal dela. E o veredito de cada uma não é escrito
 * à mão — `arteDoClube.test.ts` confere que o que a lição chama de falha é o
 * que `design.ts` mede como falha.
 */

import type { Arte, Foto, Forma, Prancha, Texto } from './design';

/* ── Peças de montar ─────────────────────────────────────────────────────── */

export const TINTA = '#1F2A24';
const BRANCO = '#FFFFFF';

const texto = (id: string, nome: string, t: string, x: number, y: number, largura: number,
  extra: Partial<Texto> = {}): Texto => ({
  id, nome, tipo: 'texto', texto: t, x, y, largura,
  familia: 'Arial', peso: 400, corpo: 16, entrelinha: 1.4, cor: TINTA, alinhamento: 'esquerda',
  ...extra,
});

const retangulo = (id: string, nome: string, x: number, y: number, largura: number, altura: number,
  preenchimento: string): Forma => ({ id, nome, tipo: 'retangulo', x, y, largura, altura, preenchimento });

const ponto = (id: string, nome: string, x: number, y: number, preenchimento: string): Forma =>
  ({ id, nome, tipo: 'elipse', x, y, largura: 16, altura: 16, preenchimento });

const foto = (id: string, nome: string, motivo: Foto['motivo'], x: number, y: number,
  largura: number, altura: number, tons: [string, string]): Foto =>
  ({ id, nome, tipo: 'foto', motivo, x, y, largura, altura, tons });

const LARGURA = 480;
const ALTURA = 680;

const peca = (id: string, nome: string, objetos: Prancha['objetos'], fundo = BRANCO): Prancha =>
  ({ id, nome, largura: LARGURA, altura: ALTURA, fundo, objetos });

/* ── Módulo 1: o cartaz em que tudo tem o mesmo tamanho ──────────────────── */

/**
 * O cartaz do acampamento, digitado como quem digita um e-mail.
 *
 * Seis blocos no mesmo corpo, no mesmo peso, na mesma cor. Está tudo certo e
 * nada se lê de longe: o olho não tem por onde começar, e o título — que é o
 * que faz alguém parar diante do mural — pesa o mesmo que a linha do rodapé.
 */
export const CARTAZ = 'cartaz';
export const CARTAZ_INICIAL = peca(CARTAZ, 'Cartaz do acampamento', [
  texto('titulo', 'Título', 'Acampamento de Inverno', 40, 48, 400, { corpo: 18 }),
  texto('data', 'Data', '12 a 14 de julho', 40, 96, 400, { corpo: 18 }),
  texto('local', 'Local', 'Chácara Recanto Verde, Sobradinho', 40, 132, 400, { corpo: 18 }),
  texto('descricao', 'Descrição',
    'Três dias de trilha, fogueira e especialidades. Leve saco de dormir, lanterna e agasalho.',
    40, 180, 400, { corpo: 18 }),
  texto('inscricao', 'Inscrições', 'Inscrições até 30 de junho, com a secretaria do clube.', 40, 272, 400, { corpo: 18 }),
  texto('clube', 'Clube', 'Clube Pioneiros de Sobradinho', 40, 336, 400, { corpo: 18 }),
  foto('foto', 'Foto das barracas', 'barracas', 40, 400, 400, 220, ['#2F4A3A', '#C9D8C0']),
]);

/* ── Módulo 2: o aviso em que cada linha começa num lugar ────────────────── */

/**
 * O aviso da reunião de pais: oito linhas, cada uma começando num ponto, e o
 * mesmo vão entre todas.
 *
 * O vão igual é o defeito que ninguém vê de primeira. Ele diz que "sábado",
 * "traga" e "a autorização assinada" são a mesma conversa, e o pai que lê
 * correndo não separa o quando do o que levar.
 */
export const AVISO = 'aviso';
export const AVISO_INICIAL = peca(AVISO, 'Aviso da reunião de pais', [
  texto('titulo', 'Título', 'Reunião de pais', 40, 48, 400, { corpo: 30, peso: 700 }),
  texto('quando-dia', 'Dia', 'Sábado, 9 de agosto', 52, 120, 400),
  texto('quando-hora', 'Hora', 'Às 16h, depois da reunião do clube', 44, 154, 400),
  texto('quando-local', 'Local', 'No salão da igreja central', 61, 188, 400),
  texto('levar-titulo', 'Traga', 'Traga:', 40, 222, 400, { peso: 700 }),
  texto('levar-1', 'Ficha de saúde', 'A ficha de saúde atualizada', 48, 256, 400),
  texto('levar-2', 'Autorização', 'A autorização do acampamento assinada', 57, 290, 400),
  texto('assinatura', 'Assinatura', 'Diretoria do Clube Pioneiros', 70, 324, 400),
]);

/** Os grupos do aviso, na ordem da página: o que vem junto se lê junto. */
export const GRUPOS_DO_AVISO: string[][] = [
  ['titulo'],
  ['quando-dia', 'quando-hora', 'quando-local'],
  ['levar-titulo', 'levar-1', 'levar-2'],
  ['assinatura'],
];

/* ── Módulo 3: três cartões que não combinam, e nenhum respiro ───────────── */

/**
 * A programação do sábado: três cartões, cada um feito num dia, por uma mão.
 *
 * Três larguras, três cores, três fontes nos títulos — e tudo encostado na
 * borda e no vizinho. Repetir é o que faria os três serem lidos como uma
 * série; o respiro é o que deixaria cada um ser lido sozinho.
 */
export const PROGRAMACAO = 'programacao';
export const PROGRAMACAO_INICIAL = peca(PROGRAMACAO, 'Programação do sábado', [
  texto('titulo', 'Título', 'Programação do sábado', 0, 6, 480, { familia: 'Georgia', corpo: 28, peso: 700 }),
  retangulo('cartao-1', 'Cartão 1', 0, 70, 150, 170, '#E8F0E8'),
  texto('cartao-1-titulo', 'Cartão 1 · atividade', 'Especialidade de Nós', 10, 82, 130,
    { corpo: 16, peso: 700 }),
  texto('cartao-1-hora', 'Cartão 1 · horário', '9h às 10h30', 10, 150, 130, { corpo: 14 }),
  retangulo('cartao-2', 'Cartão 2', 152, 70, 170, 150, '#F3E5D0'),
  texto('cartao-2-titulo', 'Cartão 2 · atividade', 'Ordem unida', 162, 80, 150,
    { familia: 'Georgia', corpo: 18, cor: '#7A4B12' }),
  texto('cartao-2-hora', 'Cartão 2 · horário', '10h45 às 11h30', 162, 140, 150, { familia: 'Verdana', corpo: 13 }),
  retangulo('cartao-3', 'Cartão 3', 324, 70, 156, 190, '#DDE7F5'),
  texto('cartao-3-titulo', 'Cartão 3 · atividade', 'Almoço e descanso', 334, 84, 136,
    { familia: 'Verdana', corpo: 15, peso: 700, cor: '#1E3A8A' }),
  texto('cartao-3-hora', 'Cartão 3 · horário', '12h às 13h30', 334, 160, 136, { corpo: 14 }),
  texto('rodape', 'Rodapé', 'Uniforme de gala obrigatório.', 0, 660, 480, { corpo: 14 }),
]);

export const CARTOES = ['cartao-1', 'cartao-2', 'cartao-3'];
export const TITULOS_DOS_CARTOES = CARTOES.map(c => `${c}-titulo`);
export const HORAS_DOS_CARTOES = CARTOES.map(c => `${c}-hora`);

/* ── Módulo 4: as cores do documento ─────────────────────────────────────── */

/**
 * A paleta como chegou: um cinza-claro de texto que mal se lê, um verde-limão
 * que a tinta não alcança, um azul que não conversa com nada e um "neutro" que
 * é ouro. Cada uma escolhida por um motivo bom — o cinza "é elegante", o verde
 * "chama atenção" —, e nenhuma pelo papel que ela cumpre.
 */
export const PALETA_INICIAL: Arte['paleta'] = {
  fundo: '#FFFFFF',
  texto: '#A7B0A9',
  destaque: '#39FF14',
  apoio: '#1E3A8A',
  neutro: '#C9A227',
};

/* ── Módulo 5: duas sem serifa que brigam, e o corpo apertado ────────────── */

/**
 * O folheto da classe de Amigo: Arial no título e Verdana no texto.
 *
 * As duas são sem serifa, parecidas o bastante para parecerem um engano e
 * diferentes o bastante para o olho perceber — é conflito, e não contraste. E
 * o texto corrido está em 11 pixels com entrelinha de 100%, as linhas quase
 * se tocando: no papel do mural ninguém passa da terceira.
 */
export const FOLHETO = 'folheto';
export const PARAGRAFO_1 =
  'A classe de Amigo é a primeira do caminho do desbravador. Nela se aprende a amarrar os primeiros nós, a reconhecer as árvores do bairro e a montar a mochila de um acampamento de fim de semana.';
export const PARAGRAFO_2 =
  'Os encontros são aos sábados, depois da reunião do clube, e duram uma hora. Cada requisito cumprido é assinado pelo conselheiro da unidade na ficha de classe.';
export const FOLHETO_INICIAL = peca(FOLHETO, 'Folheto da classe de Amigo', [
  texto('titulo', 'Título', 'Classe de Amigo', 40, 48, 400, { corpo: 34, peso: 700 }),
  texto('subtitulo', 'Subtítulo', 'O primeiro passo do desbravador', 40, 100, 400, { familia: 'Verdana', corpo: 16 }),
  texto('paragrafo-1', 'Parágrafo 1', PARAGRAFO_1, 40, 150, 400, { familia: 'Verdana', corpo: 11, entrelinha: 1 }),
  texto('paragrafo-2', 'Parágrafo 2', PARAGRAFO_2, 40, 214, 400, { familia: 'Verdana', corpo: 11, entrelinha: 1 }),
  foto('foto', 'Foto da trilha', 'trilha', 40, 420, 400, 220, ['#2E3B26', '#DCE6C8']),
]);
export const CORPO_DO_FOLHETO = ['paragrafo-1', 'paragrafo-2'];

/* ── Módulo 6: três peças para analisar ──────────────────────────────────── */

/**
 * A gincana: a bem resolvida.
 *
 * Um título que se lê de longe na faixa escura, a data no segundo degrau,
 * tudo na mesma borda esquerda, e a foto embaixo, sem nada escrito por cima.
 */
export const GINCANA = 'gincana';
export const GINCANA_PECA = peca(GINCANA, 'Cartaz da gincana', [
  retangulo('faixa', 'Faixa', 0, 0, LARGURA, 200, '#1B4D3E'),
  texto('titulo', 'Título', 'Gincana da Primavera', 40, 48, 400,
    { familia: 'Georgia', corpo: 40, peso: 700, cor: BRANCO, entrelinha: 1.15 }),
  texto('data', 'Data', 'Sábado, 20 de setembro, às 8h', 40, 232, 400, { corpo: 20, peso: 700 }),
  texto('descricao', 'Descrição',
    'Seis provas em equipe pelo bairro. Cada unidade monta a própria bandeira antes de sair.',
    40, 272, 400, { cor: '#333333' }),
  texto('local', 'Local', 'Saída da igreja central', 40, 340, 400, { cor: '#333333' }),
  foto('foto', 'Foto da trilha', 'trilha', 40, 390, 400, 210, ['#2E3B26', '#DCE6C8']),
  texto('rodape', 'Rodapé', 'Clube Pioneiros de Sobradinho', 40, 626, 400, { corpo: 14, cor: '#555555' }),
]);

/**
 * O batismo: a mal resolvida.
 *
 * Seis linhas centradas, cada uma num centro diferente — nenhum deles o da
 * folha. O título em letra cursiva amarela, que é a única cor que some no
 * papel branco, no mesmo tamanho da data. E o nome do clube colado no topo.
 */
export const BATISMO = 'batismo';
export const BATISMO_PECA = peca(BATISMO, 'Convite do batismo', [
  texto('rodape', 'Clube', 'Clube Pioneiros', 151, 8, 200,
    { familia: 'Impact', corpo: 24, cor: '#B08A1E', alinhamento: 'centro' }),
  texto('titulo', 'Título', 'Batismo na Primavera', 67, 60, 360,
    { familia: 'Brush Script MT', corpo: 24, cor: '#E8C547', alinhamento: 'centro' }),
  texto('data', 'Data', 'Domingo, 21 de setembro', 48, 120, 370, { corpo: 24, alinhamento: 'centro', cor: '#333333' }),
  texto('hora', 'Hora', 'Às 9h, no culto da manhã', 49, 172, 360, { corpo: 24, alinhamento: 'centro', cor: '#999999' }),
  texto('local', 'Local', 'Igreja Central de Sobradinho', 76, 228, 360,
    { familia: 'Comic Sans MS', corpo: 22, alinhamento: 'centro', cor: '#E58F65' }),
  texto('convite', 'Convite',
    'Venha celebrar com os onze desbravadores que vão descer às águas.', 37, 292, 376,
    { corpo: 22, alinhamento: 'centro', cor: '#555555' }),
  foto('foto', 'Foto da piscina', 'piscina', 90, 420, 300, 200, ['#1D4E6B', '#BFE3F2']),
]);

/**
 * O campori: a discutível.
 *
 * Quase tudo certo — a hierarquia é clara, a coluna é uma só —, e o título
 * branco em cima da foto da fogueira. Na metade de cima da foto ele se lê; na
 * metade das chamas, some. É a peça que se aprova olhando de relance, e é por
 * isso que ela é a que mais ensina a olhar.
 */
export const CAMPORI = 'campori';
export const CAMPORI_PECA = peca(CAMPORI, 'Convocação do campori', [
  foto('foto', 'Foto da fogueira', 'fogueira', 0, 0, LARGURA, 300, ['#2B1A10', '#F4C27A']),
  texto('titulo', 'Título', 'Campori Regional', 40, 214, 400, { corpo: 44, peso: 700, cor: BRANCO, entrelinha: 1.15 }),
  texto('data', 'Data', '5 a 9 de novembro, em Formosa (GO)', 40, 332, 400, { corpo: 20, peso: 700 }),
  texto('descricao', 'Descrição',
    'Cinco dias de acampamento com clubes de todo o Distrito Federal. Vagas limitadas a quarenta por clube.',
    40, 372, 400, { cor: '#333333' }),
  texto('prazo', 'Prazo', 'Confirme até 10 de outubro com o diretor da sua unidade.', 40, 450, 400, { cor: '#333333' }),
  texto('rodape', 'Rodapé', 'Clube Pioneiros de Sobradinho', 40, 630, 400, { corpo: 14, cor: '#555555' }),
]);

export type Classe = 'bem' | 'mal' | 'discutivel';
export const NOME_DA_CLASSE: Record<Classe, string> = {
  bem: 'Bem resolvida', mal: 'Mal resolvida', discutivel: 'De qualidade discutível',
};

/** As peças da análise, na ordem em que a tela as mostra — que não é a da classe. */
export const PECAS_DA_ANALISE = [CAMPORI, BATISMO, GINCANA] as const;
export type PecaDaAnalise = typeof PECAS_DA_ANALISE[number];

export const CLASSE_DA_PECA: Record<PecaDaAnalise, Classe> = {
  [GINCANA]: 'bem', [BATISMO]: 'mal', [CAMPORI]: 'discutivel',
};

/* ── Módulo 8: a escala em que só a cor diz quem vem ─────────────────────── */

export type Situacao = 'confirmado' | 'pendente' | 'cancelado';

/**
 * O verde e o vermelho da escala, escolhidos com a mesma luminosidade.
 *
 * É o par que os semáforos de planilha usam, e é o par que quem tem
 * deuteranopia não separa: na simulação os dois viram o mesmo marrom.
 * `arteDoClube.test.ts` confere que é assim — um par que continuasse distinto
 * na simulação ensinaria que o problema não existe.
 */
export const COR_DA_SITUACAO: Record<Situacao, string> = {
  confirmado: '#3F8F3F',
  pendente: '#C9A227',
  cancelado: '#C0503A',
};

export const PALAVRA_DA_SITUACAO: Record<Situacao, string> = {
  confirmado: 'confirmado', pendente: 'pendente', cancelado: 'cancelado',
};

export const ESCALA_DA_CANTINA: { nome: string; situacao: Situacao }[] = [
  { nome: 'Ana Clara Ribeiro', situacao: 'confirmado' },
  { nome: 'Davi Moreira', situacao: 'cancelado' },
  { nome: 'Heloísa Campos', situacao: 'confirmado' },
  { nome: 'Lucas Andrade', situacao: 'pendente' },
  { nome: 'Marta Souza', situacao: 'cancelado' },
  { nome: 'Pedro Aguiar', situacao: 'confirmado' },
];

export const ESCALA = 'escala';
export const linhaDaEscala = (i: number) => 150 + i * 48;
export const ESCALA_INICIAL = peca(ESCALA, 'Escala da cantina', [
  texto('titulo', 'Título', 'Escala da cantina — agosto', 40, 48, 400, { corpo: 28, peso: 700 }),
  texto('instrucao', 'Instrução', 'Quem serve o lanche depois da reunião de sábado.', 40, 96, 400, { cor: '#333333' }),
  ...ESCALA_DA_CANTINA.flatMap(({ nome, situacao }, i) => [
    ponto(`ponto-${i + 1}`, `Situação ${i + 1}`, 40, linhaDaEscala(i) + 4, COR_DA_SITUACAO[situacao]),
    texto(`nome-${i + 1}`, `Nome ${i + 1}`, nome, 68, linhaDaEscala(i), 260),
  ]),
  ...(['confirmado', 'pendente', 'cancelado'] as Situacao[]).flatMap((s, i) => [
    ponto(`legenda-ponto-${i + 1}`, `Legenda ${i + 1}`, 40 + i * 140, 474, COR_DA_SITUACAO[s]),
    texto(`legenda-${i + 1}`, `Legenda ${i + 1} · texto`, s[0].toUpperCase() + s.slice(1), 62 + i * 140, 470, 110,
      { corpo: 14, cor: '#333333' }),
  ]),
]);

/* ── O arquivo inteiro ───────────────────────────────────────────────────── */

export const ARTE_INICIAL: Arte = {
  pranchas: [
    CARTAZ_INICIAL, AVISO_INICIAL, PROGRAMACAO_INICIAL, FOLHETO_INICIAL,
    GINCANA_PECA, BATISMO_PECA, CAMPORI_PECA, ESCALA_INICIAL,
  ],
  paleta: PALETA_INICIAL,
};

/**
 * O título de uma peça, inclusive na cópia.
 *
 * A cópia renomeia os ids — `batismo-copia-1-titulo` —, e o título continua
 * sendo o título: é ele que a hierarquia mede.
 */
export const tituloDaPeca = (p: Prancha) =>
  p.objetos.find(o => o.tipo === 'texto' && (o.id === 'titulo' || o.id.endsWith('-titulo')) && o.nome === 'Título')?.id ?? '';
