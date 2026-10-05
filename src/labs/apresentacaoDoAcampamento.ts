/**
 * A apresentação que o clube tem, e de onde cada lição da CC-ES011 parte.
 *
 * Uma apresentação, dez lições. É o arranjo do `discoDoClube()` da CC-ES001,
 * do `cadernoDoClube()` da CC-ES003 e do `dossieDoClube.ts` da CC-ES004, pelo
 * motivo escrito nos três: dez apresentações diferentes ensinariam que cada
 * exercício acontece num arquivo de mentira. Quem abre o módulo 6 reencontra
 * os slides que o módulo 2 arrumou, e é deles que a lição fala.
 *
 * ── Ela chega do jeito que a secretária do clube a entregou ──────────────
 * Dezesseis slides, escritos por inteiro, e isso é de propósito: na tira
 * lateral passa por apresentação pronta, que é a decisão do laboratório de
 * estilos da AP044 e do relatório da CC-ES002. O que falta não é texto — é
 * decisão, e cada defeito dela desenha bonito:
 *
 * - **o título de cada slide foi formatado à mão**, em negrito, em tamanhos
 *   que quase coincidem. O mestre está em branco, e mexer nele não muda nada
 *   na tela enquanto a direta estiver lá (requisito 4.1);
 * - **seis slides têm o título numa caixa de texto solta**, cada uma alguns
 *   pontos acima ou abaixo da anterior. Cada slide está perfeito; a
 *   apresentação pisca a cada troca (requisito 4.2);
 * - **os tópicos são parágrafos com um ponto na frente**, de até vinte e duas
 *   palavras (requisitos 2.3 e 6);
 * - **o logo é um arquivo de 320 pixels esticado** para quase metade do
 *   slide, e as fotos saíram do celular com doze megapixels cada (requisito
 *   4.3);
 * - **os custos foram digitados à mão**, e a planilha já mudou (requisito
 *   4.4);
 * - **nenhum slide tem nota do apresentador** (requisitos 2.4 e 4.5);
 * - e **são dezesseis**, para cinco minutos de fala (requisitos 5 e 6).
 */

import {
  imagemInserida, mestreDoModelo, slideNovo,
  type Apresentacao, type CaixaAMao, type Imagem, type Layout, type Slide,
  type SlideMestre,
} from './apresentacao';

/* ── Os arquivos que o computador do clube tem ────────────────────────────── */

/**
 * As imagens da pasta, com o tamanho de cada arquivo.
 *
 * O logo existe em dois tamanhos, e é essa a escolha do requisito 4.3: o
 * pequeno é o que está no slide hoje, e o grande é o que o clube também tem —
 * trocar o arquivo e reduzir o espaço que ele ocupa são os **dois** caminhos
 * certos, como as duas passagens do Substituir Tudo da CC-ES002.
 */
export const IMAGENS_DO_CLUBE: { arquivo: string; px: number; py: number }[] = [
  { arquivo: 'logo-clube.png', px: 320, py: 240 },
  { arquivo: 'logo-clube-grande.png', px: 2000, py: 1500 },
  { arquivo: 'fogueira.jpg', px: 4032, py: 3024 },
  { arquivo: 'barracas.jpg', px: 4032, py: 3024 },
  { arquivo: 'chegada.jpg', px: 4032, py: 3024 },
];

export const umaImagemDoClube = (id: string, arquivo: string, largura: number): Imagem => {
  const f = IMAGENS_DO_CLUBE.find(i => i.arquivo === arquivo);
  if (!f) throw new Error(`não há ${arquivo} na pasta do clube`);
  return imagemInserida(id, arquivo, f.px, f.py, largura);
};

/** A planilha de onde o gráfico de custos tem de vir, e o nome do arquivo. */
export const PLANILHA_DOS_CUSTOS = 'Custos do acampamento.xlsx';

/**
 * Os custos de hoje, na planilha.
 *
 * Os slides foram digitados quando a alimentação custava 80 e a estrutura 40.
 * A planilha mudou em julho, e o slide não — é a família do "número guardado
 * não responde por hoje", e é a razão do requisito 4.4.
 */
export const CUSTOS_DE_HOJE: { rotulo: string; valor: number }[] = [
  { rotulo: 'Alimentação', valor: 90 },
  { rotulo: 'Transporte', valor: 60 },
  { rotulo: 'Estrutura', valor: 45 },
  { rotulo: 'Material', valor: 25 },
];

/** O que os slides dizem hoje, digitado à mão antes de a planilha mudar. */
export const CUSTOS_DIGITADOS: { rotulo: string; valor: number }[] = [
  { rotulo: 'Alimentação', valor: 80 },
  { rotulo: 'Transporte', valor: 60 },
  { rotulo: 'Estrutura', valor: 40 },
  { rotulo: 'Material', valor: 25 },
];

export const totalDosCustos = (custos: { valor: number }[]) =>
  custos.reduce((t, c) => t + c.valor, 0);

/* ── O mestre como ele chega: em branco, e sem identidade nenhuma ─────────── */

/**
 * O mestre de partida.
 *
 * Em branco, sem logo e sem número no pé: nada aqui está *errado*, está **não
 * decidido**, e é essa a diferença que o requisito 4.1 cobra.
 *
 * Com uma coisa decidida, e decidida ao contrário: o corpo foi aumentado de
 * vinte e quatro para **trinta e dois pontos**, para o texto "preencher o
 * slide". Com os títulos apertados à mão entre trinta e quatro e trinta e
 * sete, título e corpo passam a ter quase o mesmo tamanho — e aí não há
 * hierarquia nenhuma: o olho começa onde cair. É o requisito 2.3 esperando no
 * módulo 3, e é o que mais se faz num slide que sobrou espaço.
 */
export const MESTRE_INICIAL: SlideMestre = { ...mestreDoModelo('branco'), tamanhoDoCorpo: 32 };

/*
  As cores que o clube usa, e as que se leem.

  O verde é o da camisa dos Pioneiros e o ouro é o do emblema: escolhidos pela
  camisa e pelo emblema, e não pela leitura — que é como quase toda identidade
  chega a um slide. Medidos sobre o branco do modelo, o ouro dá **2,42:1** e o
  verde **3,48:1**: o ouro não se lê nem como título e o verde não se lê como
  corpo, e nenhum dos dois estoura nada. É o requisito 2.5 esperando no módulo
  4.

  As duas de baixo são as mesmas cores escurecidas — 4,91:1 e 8,12:1 —, e é o
  que separa *escurecer o verde do clube* de *desistir dele*: elas continuam
  ouro e verde pelos canais, e a condição do módulo 4 cobra isso. Consertar
  pintando tudo de preto resolveria a conta e jogaria a identidade fora.
*/
export const OURO_DO_CLUBE = '#C9A227';
export const VERDE_DO_CLUBE = '#1B9E4B';
export const OURO_LEGIVEL = '#8A6D0B';
export const VERDE_LEGIVEL = '#0E5C2C';

/** O contraste que um slide projetado numa sala com luz precisa ter. */
export const CONTRASTE_MINIMO = 4.5;

/* ── Os dezesseis slides ──────────────────────────────────────────────────── */

/** Um slide escrito, com o título formatado à mão como a secretária o deixou. */
const escrito = (
  id: string, titulo: string, topicos: string[], layout: Layout = 'titulo-conteudo',
  tamanhoDoTitulo = 36,
): Slide => ({
  ...slideNovo(id, layout),
  titulo,
  topicos,
  /* O negrito e o tamanho foram apertados na barra, um slide por vez — e é por
     isso que os tamanhos quase coincidem em vez de coincidir. */
  diretoNoTitulo: { tamanho: tamanhoDoTitulo, negrito: true },
});

/**
 * Um slide cujo título foi **desenhado à mão**, na posição em que ficou.
 *
 * `layout: 'em-branco'` porque é isso que acontece: quem desenha caixa de
 * texto parte do slide em branco, e aí não há espaço reservado nenhum para o
 * título cair. O `y` de cada um é o que o requisito 4.2 mede.
 */
const aMao = (id: string, titulo: string, topicos: string[], y: number): Slide => ({
  ...slideNovo(id, 'em-branco'),
  caixas: [
    { id: `${id}-t`, texto: titulo, x: 7, y, largura: 84, tamanho: 36, papel: 'titulo' },
    ...topicos.map((texto, i): CaixaAMao => ({
      id: `${id}-c${i}`, texto, x: 9, y: y + 16 + i * 9, largura: 80, tamanho: 20, papel: 'corpo',
    })),
  ],
});

/**
 * A apresentação como o clube a entregou.
 *
 * Dezesseis slides, e cada tópico é uma frase inteira — que é o que se escreve
 * quando o slide é o roteiro da fala em vez do apoio dela.
 */
export const APRESENTACAO_DO_ACAMPAMENTO: Apresentacao = {
  modelo: 'branco',
  mestre: MESTRE_INICIAL,
  pdf: null,
  slides: [
    {
      ...aMao('s1', 'Acampamento de Inverno 2026 do Clube de Desbravadores Pioneiros', [
        'Uma apresentação preparada pela secretaria do clube para as famílias',
      ], 9),
      imagens: [umaImagemDoClube('s1-logo', 'logo-clube.png', 46)],
    },
    escrito('s2', 'Quem somos', [
      'O Clube de Desbravadores Pioneiros existe desde 1998 e hoje reúne quarenta e nove desbravadores divididos em seis unidades',
      'A diretoria é formada por voluntários da própria igreja, e ninguém recebe nada para estar aqui no sábado de manhã',
      'As atividades acontecem todos os sábados à tarde, no salão, das catorze às dezessete horas',
    ]),
    escrito('s3', 'O que é o acampamento', [
      'O acampamento de inverno é a maior atividade do ano, e é onde a maior parte das especialidades de campo é cumprida de uma vez',
      'Dormimos em barracas, cozinhamos em fogão de campanha e tudo é organizado pelas próprias unidades',
      'Participam os desbravadores a partir de dez anos, com autorização assinada pelos responsáveis',
    ]),
    aMao('s4', 'Datas e local', [
      'De 13 a 15 de junho de 2026',
      'Chácara Recanto Verde, estrada do Contorno, km 12',
    ], 11.5),
    aMao('s5', 'Como chegar', [
      'O ônibus do clube sai do salão às dezenove horas de sexta-feira, e quem for de carro próprio precisa avisar a secretaria antes',
      'O portão da chácara fica depois da ponte, à direita, e não tem placa',
    ], 7.5),
    escrito('s6', 'O que levar — parte 1', [
      'Saco de dormir e isolante térmico, porque o chão da chácara esfria muito durante a noite',
      'Lanterna com pilha de reserva, e a de celular não serve porque a bateria não dura a noite',
      'Agasalho, touca e luva, já que a temperatura chega perto dos sete graus de madrugada',
    ], 'titulo-conteudo', 34),
    escrito('s7', 'O que levar — parte 2', [
      'Bíblia, caderno e caneta para as classes que acontecem no sábado de manhã',
      'Prato, caneca e talher marcados com o nome, porque todo ano sobram dez canecas sem dono',
      'Remédio de uso contínuo entregue na chegada à enfermaria, com a receita',
    ], 'titulo-conteudo', 37),
    escrito('s8', 'O que não levar', [
      'Aparelho eletrônico de jogo, caixa de som e qualquer coisa de valor que a gente não possa guardar',
      'Faca, canivete e lanterna de alta potência ficam com a liderança da unidade',
    ]),
    aMao('s9', 'Programação de sexta', [
      'Dezenove horas: saída do salão',
      'Vinte e uma horas: chegada, montagem das barracas por unidade',
      'Vinte e três horas: silêncio',
    ], 10),
    aMao('s10', 'Programação de sábado', [
      'Sete horas: alvorada e culto matinal',
      'Nove horas: classes e especialidades',
      'Quinze horas: atividades de campo por unidade',
      'Vinte horas: fogueira e culto de encerramento do sábado',
    ], 8),
    aMao('s11', 'Programação de domingo', [
      'Sete horas: café e desmontagem',
      'Dez horas: inspeção das áreas por unidade',
      'Onze horas: saída da chácara',
    ], 12),
    escrito('s12', 'Custos por desbravador', [
      ...CUSTOS_DIGITADOS.map(c => `${c.rotulo}: R$ ${c.valor},00`),
      `Total: R$ ${totalDosCustos(CUSTOS_DIGITADOS)},00`,
    ]),
    escrito('s13', 'Formas de pagamento', [
      'À vista até 30 de maio, com desconto de dez por cento para quem pagar antes',
      'Ou em duas parcelas, a primeira até 30 de maio e a segunda até 10 de junho',
      'Pix para a tesouraria do clube, e o comprovante entregue à secretaria',
      'Dinheiro só na secretaria, no sábado à tarde, e com recibo na hora',
      'Quem precisar de ajuda deve falar com a diretoria, e isso fica entre vocês',
      'Irmãos no clube têm desconto na segunda inscrição, falem com a tesouraria',
      'A devolução por desistência segue o regulamento do clube, consultem a secretaria',
    ]),
    {
      ...escrito('s14', 'O acampamento do ano passado', []),
      imagens: [
        umaImagemDoClube('s14-a', 'fogueira.jpg', 44),
        umaImagemDoClube('s14-b', 'barracas.jpg', 44),
      ],
    },
    escrito('s15', 'Regras de convivência', [
      'O horário de silêncio é para todos, e a liderança da unidade responde pela área dela',
      'Ninguém sai da área da chácara sem a liderança da unidade, em nenhuma circunstância',
      'A área de cada unidade é inspecionada no domingo, e a unidade que deixar lixo perde pontos',
      'O uniforme de gala é usado no culto de sábado de manhã, e o de atividades no resto',
      'A cozinha é da unidade escalada, e ninguém mexe no fogão sem a liderança por perto',
      'Celular fica guardado com a liderança fora dos horários livres combinados',
      'Visitas só no sábado à tarde, e com aviso à secretaria na sexta',
      'Quem machucar o pé procura a enfermaria na hora, e não no dia seguinte',
    ]),
    {
      ...escrito('s16', 'Dúvidas', [
        'Fale com a liderança da sua unidade, ou com a secretaria do clube no sábado à tarde',
      ], 'so-titulo'),
      imagens: [umaImagemDoClube('s16-foto', 'chegada.jpg', 38)],
    },
  ],
};

/* ── O que não pode sair quando a apresentação for cortada ────────────────── */

/**
 * As informações que a família precisa, e que o requisito 5 chama de conteúdo
 * essencial.
 *
 * Elas são **declaradas**, e não adivinhadas da prosa. Medir "perda de
 * conteúdo essencial" lendo o texto seria máquina frágil que um dia para de
 * achar o que procura e aprova tudo calada — a armadilha do "zero link não é
 * zero link quebrado" aplicada à própria trava. Declaradas, a lição pode
 * **dizer** quais são, que é o que um examinador faria: ele não pede para
 * adivinhar o que ele considera essencial.
 *
 * `marca` é o trecho que denuncia a presença dela. Ele é curto e específico de
 * propósito — uma data, um nome de lugar, um horário —, porque juntar dois
 * slides é copiar e colar, e é o trecho copiado que sobrevive.
 */
export interface IdeiaEssencial {
  id: string;
  /** O que ela diz, para a lição poder listá-las. */
  diz: string;
  /** O trecho que denuncia a presença dela no texto que projeta. */
  marca: string;
  /**
   * Quando ela é carregada pelo **gráfico**, e não por texto.
   *
   * O custo deixa de ser texto no módulo 7, quando a tabela digitada sai e
   * entra o gráfico que veio da planilha. Procurá-la no texto depois disso
   * acusaria de perda justamente quem fez o requisito 4.4 — por isso os dois
   * jeitos de carregar uma ideia são declarados, e não um só.
   */
  peloGrafico?: boolean;
}

export const IDEIAS_ESSENCIAIS: IdeiaEssencial[] = [
  { id: 'quando', diz: 'a data do acampamento', marca: '13 a 15 de junho' },
  { id: 'onde', diz: 'o local', marca: 'Recanto Verde' },
  { id: 'saida', diz: 'a hora e o lugar da saída', marca: 'dezenove horas' },
  { id: 'custo', diz: 'quanto custa por desbravador', marca: '', peloGrafico: true },
  { id: 'prazo', diz: 'o prazo do pagamento', marca: '30 de maio' },
  { id: 'pagamento', diz: 'como se paga', marca: 'Pix' },
  { id: 'levar', diz: 'o que levar para dormir no frio', marca: 'Saco de dormir' },
  { id: 'remedio', diz: 'o que fazer com remédio de uso contínuo', marca: 'Remédio' },
  { id: 'autorizacao', diz: 'que precisa de autorização assinada', marca: 'autorização' },
  { id: 'area', diz: 'que ninguém sai da área sozinho', marca: 'Ninguém sai da área' },
];
