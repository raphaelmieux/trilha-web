import {
  aplicarLayout, compactarImagem, imagemInserida, limparFormatacaoDireta, mestreDoModelo, slideNovo,
  type Apresentacao, type CaixaAMao, type Imagem, type Layout, type Slide, type SlideMestre,
} from '../labs/apresentacao';
import { CADERNO_VAZIO, type ContextoDaApresentacao } from '../labs/metasDaCcEs011';
import type { OutraApresentacao } from '../components/LaboratorioDeApresentacao';

/*
 * A apresentação da Feira de Especialidades: o que as telas da CC-ES011
 * fotografam.
 *
 * ── Por que outra apresentação ───────────────────────────────────────────
 * O laboratório abre a apresentação do acampamento de inverno
 * (`apresentacaoDoAcampamento.ts`), e quase tudo nela é resposta de alguma
 * lição: os tópicos enxutos de cada slide, o ouro e o verde escurecidos, os
 * custos que mudaram na planilha, as notas, os slides que se juntam no corte.
 * Os quadros de texto da teoria citavam esses mesmos slides — "Ônibus: sexta,
 * dezenove horas" é a resposta da lição de hierarquia —, que é pôr o gabarito
 * na teoria.
 *
 * Aqui é o mesmo clube apresentando outro evento, com a cor da feira no lugar
 * da do clube e os mesmos tipos de defeito: caixas à mão em alturas
 * diferentes, títulos com formatação direta, tópicos que são frases, cores que
 * não se leem, uma foto pequena esticada, custos digitados. Cada estado parte
 * do conserto do anterior, como as lições. `exemplosDasApresentacoes.test.ts`
 * confere as legendas pelos motores e reprova se as duas apresentações
 * dividirem um título ou um tópico.
 */

/** As fotos da pasta da feira, com o tamanho em pixels de cada uma. */
export const IMAGENS_DA_FEIRA: { arquivo: string; px: number; py: number }[] = [
  { arquivo: 'cartaz-da-feira.png', px: 300, py: 225 },
  { arquivo: 'cartaz-da-feira-grande.png', px: 1800, py: 1350 },
  { arquivo: 'feira-2025.jpg', px: 640, py: 480 },
  { arquivo: 'feira-2025-original.jpg', px: 4000, py: 3000 },
];

const imagem = (id: string, arquivo: string, largura: number): Imagem => {
  const f = IMAGENS_DA_FEIRA.find(i => i.arquivo === arquivo)!;
  return imagemInserida(id, arquivo, f.px, f.py, largura);
};

/** A cor da feira é laranja e azul, escolhidas pelo cartaz, e não pela leitura. */
export const LARANJA_DA_FEIRA = '#F28C28';
export const AZUL_DA_FEIRA = '#3AA0D8';
export const LARANJA_LEGIVEL = '#9E5308';
export const AZUL_LEGIVEL = '#1C5E83';

export const TONS_DO_LARANJA = [
  { hex: LARANJA_DA_FEIRA, nome: 'Laranja da feira' },
  { hex: '#C66E14', nome: 'Laranja da feira, 25% mais escuro' },
  { hex: LARANJA_LEGIVEL, nome: 'Laranja da feira, 50% mais escuro' },
  { hex: '#000000', nome: 'Preto, texto 1' },
];
export const TONS_DO_AZUL = [
  { hex: AZUL_DA_FEIRA, nome: 'Azul da feira' },
  { hex: '#8CCBEC', nome: 'Azul da feira, 40% mais claro' },
  { hex: '#2A7DAC', nome: 'Azul da feira, 25% mais escuro' },
  { hex: AZUL_LEGIVEL, nome: 'Azul da feira, 50% mais escuro' },
  { hex: '#333333', nome: 'Cinza-escuro, texto 2' },
];

export const PLANILHA_DA_FEIRA = 'Custos da feira.xlsx';
export const CUSTOS_DIGITADOS_DA_FEIRA = [
  { rotulo: 'Material', valor: 120 },
  { rotulo: 'Lanche', valor: 90 },
  { rotulo: 'Prêmios', valor: 60 },
];
/** A planilha mudou depois que alguém digitou o slide: o material e os prêmios subiram. */
export const CUSTOS_DA_FEIRA_HOJE = [
  { rotulo: 'Material', valor: 150 },
  { rotulo: 'Lanche', valor: 90 },
  { rotulo: 'Prêmios', valor: 75 },
];
const total = (c: { valor: number }[]) => c.reduce((t, x) => t + x.valor, 0);

const MESTRE: SlideMestre = { ...mestreDoModelo('branco'), tamanhoDoCorpo: 32 };

const escrito = (id: string, titulo: string, topicos: string[], tamanhoDoTitulo = 36): Slide => ({
  ...slideNovo(id, 'titulo-conteudo'),
  titulo,
  topicos,
  diretoNoTitulo: { tamanho: tamanhoDoTitulo, negrito: true },
});

const aMao = (id: string, titulo: string, topicos: string[], y: number): Slide => ({
  ...slideNovo(id, 'em-branco'),
  caixas: [
    { id: `${id}-t`, texto: titulo, x: 7, y, largura: 84, tamanho: 36, papel: 'titulo' },
    ...topicos.map((texto, i): CaixaAMao => ({
      id: `${id}-c${i}`, texto, x: 9, y: y + 16 + i * 9, largura: 80, tamanho: 20, papel: 'corpo',
    })),
  ],
});

/** A apresentação como a secretaria a montou, slide por slide, à mão. */
export const FEIRA_COMO_CHEGA: Apresentacao = {
  modelo: 'branco',
  mestre: MESTRE,
  pdf: null,
  slides: [
    {
      ...aMao('f1', 'Feira de Especialidades 2026 do Clube Pioneiros', [
        'Um convite da secretaria do clube para as famílias e os vizinhos',
      ], 8),
      imagens: [imagem('f1-cartaz', 'cartaz-da-feira.png', 40)],
    },
    escrito('f2', 'O que é a feira', [
      'A feira é o dia em que cada unidade monta uma barraca e mostra para a comunidade uma especialidade que aprendeu durante o semestre',
      'Quem visita pode experimentar, perguntar e levar para casa o que as unidades prepararam, sem pagar nada',
    ]),
    aMao('f3', 'Data e local', [
      'Domingo, 23 de agosto de 2026',
      'Pátio da escola Monteiro Lobato, entrada pela rua de trás',
    ], 12),
    aMao('f4', 'Como funciona', [
      'As barracas abrem às nove horas da manhã e cada unidade fica responsável pela sua até o meio-dia, quando começa a premiação',
      'Cada visitante recebe um passaporte na entrada e ganha um carimbo em cada barraca que visitar',
    ], 7),
    escrito('f5', 'Barracas — parte 1', [
      'A unidade Águia vai mostrar nós e amarras, com uma ponte de cordas montada no meio do pátio',
      'A unidade Tucano vai ensinar a plantar mudas em garrafa, e cada visitante leva a sua',
      'A unidade Arara vai montar um mapa do bairro e ensinar a usar a bússola',
    ], 34),
    escrito('f6', 'Barracas — parte 2', [
      'A unidade Jaguar vai fazer primeiros socorros, com bonecos e bandagens de verdade',
      'A unidade Onça vai mostrar culinária de acampamento no fogareiro',
      'A unidade Falcão vai ensinar a reconhecer as aves do cerrado pelo canto',
    ], 37),
    escrito('f7', 'Custos da feira', [
      ...CUSTOS_DIGITADOS_DA_FEIRA.map(c => `${c.rotulo}: R$ ${c.valor},00`),
      `Total: R$ ${total(CUSTOS_DIGITADOS_DA_FEIRA)},00`,
    ]),
    aMao('f8', 'Horários do domingo', [
      'Nove horas: abertura das barracas',
      'Meio-dia: premiação dos passaportes',
      'Uma hora: encerramento e limpeza do pátio',
    ], 10),
    {
      ...escrito('f9', 'Como foi a feira de 2025', []),
      imagens: [imagem('f9-foto', 'feira-2025.jpg', 80)],
    },
  ],
};

const mapear = (a: Apresentacao, f: (s: Slide) => Slide): Apresentacao => ({ ...a, slides: a.slides.map(f) });

/** Depois do módulo 1: a identidade da feira no mestre, e a formatação direta limpa. */
export const FEIRA_COM_MESTRE: Apresentacao = mapear({
  ...FEIRA_COMO_CHEGA,
  mestre: {
    ...FEIRA_COMO_CHEGA.mestre,
    fonteDoTitulo: 'Georgia', fonteDoCorpo: 'Calibri',
    corDoTitulo: LARANJA_DA_FEIRA, corDoCorpo: AZUL_DA_FEIRA,
    logo: true, numeroNoPe: true,
  },
}, limparFormatacaoDireta);

/** Depois do módulo 2: cada caixa à mão no espaço reservado do layout. */
export const FEIRA_COM_LAYOUT: Apresentacao = mapear(FEIRA_COM_MESTRE, (s) => {
  if (s.caixas.length === 0) return s;
  const l: Layout = s.id === 'f1' ? 'titulo' : 'titulo-conteudo';
  return aplicarLayout(s, l);
});

const ENXUTOS: Record<string, string[]> = {
  f1: ['Clube Pioneiros, para famílias e vizinhos'],
  f2: ['Cada unidade monta uma barraca', 'Mostra uma especialidade do semestre', 'Entrada e atividades sem custo'],
  f3: ['Domingo, 23 de agosto de 2026', 'Escola Monteiro Lobato, entrada dos fundos'],
  f4: ['Barracas: das 9h ao meio-dia', 'Passaporte na entrada', 'Um carimbo por barraca'],
  f5: ['Águia: nós e ponte de cordas', 'Tucano: mudas em garrafa', 'Arara: mapa e bússola'],
  f6: ['Jaguar: primeiros socorros', 'Onça: culinária no fogareiro', 'Falcão: aves do cerrado pelo canto'],
  f8: ['9h: abertura das barracas', '12h: premiação dos passaportes', '13h: encerramento'],
};

/** Depois do módulo 3: título 40, corpo 24, e cada tópico numa linha. */
export const FEIRA_ENXUTA: Apresentacao = mapear(
  { ...FEIRA_COM_LAYOUT, mestre: { ...FEIRA_COM_LAYOUT.mestre, tamanhoDoTitulo: 40, tamanhoDoCorpo: 24 } },
  s => (ENXUTOS[s.id] ? { ...s, topicos: ENXUTOS[s.id] } : s),
);

/** Depois do módulo 4: as mesmas duas cores, escurecidas até se lerem. */
export const FEIRA_LEGIVEL: Apresentacao = {
  ...FEIRA_ENXUTA,
  mestre: { ...FEIRA_ENXUTA.mestre, corDoTitulo: LARANJA_LEGIVEL, corDoCorpo: AZUL_LEGIVEL },
};

/** Depois do módulo 6: o cartaz trocado pelo arquivo grande, e a foto do ano passado compactada. */
export const FEIRA_COM_IMAGENS: Apresentacao = mapear(FEIRA_LEGIVEL, s => ({
  ...s,
  imagens: s.imagens.map(i => (i.legenda === 'cartaz-da-feira.png'
    ? imagem(i.id, 'cartaz-da-feira-grande.png', i.largura)
    : i.legenda === 'feira-2025.jpg' ? compactarImagem(imagem(i.id, 'feira-2025-original.jpg', i.largura), 150) : i)),
}));

/** Depois do módulo 7: o slide dos custos com o gráfico incorporado da planilha. */
export const FEIRA_COM_GRAFICO: Apresentacao = mapear(FEIRA_COM_IMAGENS, s => (s.id !== 'f7' ? s : {
  ...s,
  topicos: [],
  grafico: { id: 'f7-g', como: 'incorporado', planilha: PLANILHA_DA_FEIRA, retrato: CUSTOS_DA_FEIRA_HOJE.map(c => ({ ...c })) },
}));

export const NOTAS_DA_FEIRA: Record<string, string> = {
  f1: 'Agradecer quem veio e dizer que a feira é aberta para os vizinhos também.',
  f3: 'Avisar que a entrada da frente fica fechada no domingo, e que o portão é o da rua de trás.',
  f4: 'Explicar que o passaporte completo concorre a um prêmio, e que criança pequena pode pedir ajuda.',
  f7: 'Dizer que o material ficou mais caro, e que a planilha está com a tesouraria para quem quiser ver.',
};

/** Depois do módulo 8: as notas escritas. */
export const FEIRA_COM_NOTAS: Apresentacao = mapear(FEIRA_COM_GRAFICO, s => (
  NOTAS_DA_FEIRA[s.id] ? { ...s, notas: NOTAS_DA_FEIRA[s.id] } : s
));

/** Depois do módulo 9: as duas partes das barracas consolidadas num slide só. */
export const FEIRA_CORTADA: Apresentacao = {
  ...FEIRA_COM_NOTAS,
  slides: FEIRA_COM_NOTAS.slides
    .filter(s => s.id !== 'f6')
    .map(s => (s.id !== 'f5' ? s : {
      ...s,
      titulo: 'As barracas',
      topicos: ['Águia: nós e ponte de cordas', 'Tucano: mudas em garrafa', 'Arara: mapa e bússola',
        'Jaguar: primeiros socorros', 'Onça: culinária no fogareiro', 'Falcão: aves pelo canto'],
    })),
};

export type EstadoDaFeira =
  | 'como-chega' | 'com-mestre' | 'com-layout' | 'enxuta' | 'legivel' | 'com-imagens'
  | 'com-grafico' | 'com-notas' | 'cortada';

export const ESTADOS_DA_FEIRA: Record<EstadoDaFeira, Apresentacao> = {
  'como-chega': FEIRA_COMO_CHEGA,
  'com-mestre': FEIRA_COM_MESTRE,
  'com-layout': FEIRA_COM_LAYOUT,
  'enxuta': FEIRA_ENXUTA,
  'legivel': FEIRA_LEGIVEL,
  'com-imagens': FEIRA_COM_IMAGENS,
  'com-grafico': FEIRA_COM_GRAFICO,
  'com-notas': FEIRA_COM_NOTAS,
  'cortada': FEIRA_CORTADA,
};

/** A apresentação da feira, partindo do estado que o tópico mostra. */
export const naFeira = (estado: EstadoDaFeira): OutraApresentacao => ({
  inicial: (): ContextoDaApresentacao => ({
    ap: ESTADOS_DA_FEIRA[estado],
    custos: CUSTOS_DA_FEIRA_HOJE.map(c => ({ ...c })),
    descobertas: [],
    caderno: CADERNO_VAZIO,
  }),
  arquivo: 'Feira de Especialidades 2026',
  planilha: PLANILHA_DA_FEIRA,
  imagens: IMAGENS_DA_FEIRA,
  tonsDoTitulo: TONS_DO_LARANJA,
  tonsDoCorpo: TONS_DO_AZUL,
});
