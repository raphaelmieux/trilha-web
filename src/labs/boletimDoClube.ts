/**
 * O boletim de inverno do clube: o documento que a CC-DG005 diagrama.
 *
 * ── Um boletim, sete lições ──────────────────────────────────────────────
 * O arranjo do `discoDoClube()` da CC-ES001 e da marca da Ipê da CC-DG004:
 * um documento só, e cada lição parte de onde a anterior chegou — a malha
 * montada, os estilos aplicados, as fotos no lugar, as páginas numeradas, o
 * PDF exportado.
 *
 * ── Ele chega como chega de verdade ──────────────────────────────────────
 * Escrito por quatro pessoas, colado de quatro lugares: um título que é
 * corpo de texto aumentado à mão, dois parágrafos com a letra mudada, uma
 * foto de celular pequena demais posta grande, a capa parando na borda do
 * papel, e os números das páginas digitados um por um. Nenhum desses defeitos
 * se vê de longe, e é por isso que a vereda existe.
 */

import type { Documento, EstiloDeParagrafo, Imagem, Paragrafo, QuadroDeImagem, QuadroDeTexto, TextoSolto } from './diagramacao';

export const A5 = { largura: 148, altura: 210 };

export const ESTILOS: EstiloDeParagrafo[] = [
  { id: 'titulo', nome: 'Título', familia: 'Trebuchet MS', corpo: 16, entrelinha: 19, peso: 700, espacoAntes: 5 },
  { id: 'corpo', nome: 'Corpo', familia: 'Georgia', corpo: 9.5, entrelinha: 13, peso: 400, espacoAntes: 2 },
  { id: 'legenda', nome: 'Legenda', familia: 'Trebuchet MS', corpo: 8, entrelinha: 10, peso: 400, espacoAntes: 1 },
];

const T = (id: string, texto: string, extra: Partial<Paragrafo> = {}): Paragrafo =>
  ({ id, papel: 'titulo', estilo: 'titulo', texto, ...extra });
const C = (id: string, texto: string, extra: Partial<Paragrafo> = {}): Paragrafo =>
  ({ id, papel: 'corpo', estilo: 'corpo', texto, ...extra });

/**
 * A matéria, como chegou. Quatro defeitos de estilo: o título do segundo
 * artigo é um parágrafo de corpo engordado à mão, dois parágrafos estão em
 * outra letra e outro corpo, e o título da agenda está no estilo errado.
 */
export const HISTORIA_COMO_CHEGOU: Paragrafo[] = [
  T('t1', 'Acampamento de inverno na Chapada'),
  C('c1a', 'Saímos de Brasília às seis da manhã de sexta-feira, com o ônibus cheio e o termômetro marcando onze graus. Para quem mora no cerrado, onze graus é frio de verdade, e metade da unidade Ipê dormiu enrolada no saco de dormir antes mesmo de chegar a Alto Paraíso.'),
  C('c1b', 'O acampamento ficou num terreno de um amigo do clube, perto de uma cachoeira de água gelada que ninguém teve coragem de enfrentar na primeira manhã. Na segunda, o desafio de quem entrava primeiro virou competição entre as unidades, e a Águia venceu por três segundos.'),
  C('c1c', 'À noite, a fogueira reuniu todo mundo para a história dos pioneiros e para o canto de encerramento. O céu da Chapada sem luz de cidade mostrou a Via Láctea inteira, e os conselheiros aproveitaram para ensinar a achar o Cruzeiro do Sul e os pontos cardeais pelas estrelas.'),
  C('c1d', 'Na volta, cada unidade escreveu um relatório do que aprendeu. Os melhores trechos estão nas páginas seguintes, junto com as fotos que a diretoria escolheu para o mural da sede.'),
  C('t2', 'A unidade Ipê ganhou marca nova', { papel: 'titulo', direta: { corpo: 15, peso: 700 } }),
  C('c2a', 'Depois de três meses de rascunhos, a unidade Ipê apresentou a marca nova na reunião de sábado. A copa roxa sobre o tronco reto foi escolhida entre dez ideias desenhadas à mão, e cada uma das descartadas foi explicada para a unidade antes da votação.'),
  C('c2b', 'A marca já aparece na camiseta, no crachá do acampamento e no post das inscrições. O manual de quatro páginas mostra as três versões, as cores com código e os usos que não valem, e fica na pasta da secretaria para quem precisar.', { direta: { familia: 'Comic Sans MS', corpo: 11 } }),
  C('c2c', 'A próxima etapa é o estandarte, que vai ser bordado por uma costureira do bairro. Ela pediu a versão de uma cor só, porque cada cor a mais é uma linha a mais e um dia a mais de bordado, e foi aí que a unidade entendeu para que serve a versão monocromática.'),
  T('t3', 'Especialidade de computação: como foi'),
  C('c3a', 'Doze desbravadores terminaram a especialidade de computação neste semestre. As aulas foram no laboratório da escola, aos domingos, e cada um saiu com um pequeno site sobre o clube, escrito do zero em HTML e publicado para a família ver.'),
  C('c3b', 'O que mais deu trabalho, segundo os próprios desbravadores, foi o pacto de uso da internet: escrever regras que todo mundo concorda em seguir é bem mais difícil do que parece. O que mais divertiu foi descobrir que um site inteiro cabe num arquivo de texto.', { direta: { familia: 'Courier New' } }),
  C('c3d', 'Os pais foram convidados para a última aula, e cada desbravador mostrou o próprio site no projetor. Houve quem colocasse a receita da avó, quem fizesse uma página sobre a unidade e quem escrevesse um guia de nós com desenhos feitos à mão e escaneados.'),
  C('c3c', 'No próximo semestre, a turma começa as veredas de escritório. A primeira é a de organização de arquivos, que promete acabar com a pasta chamada novo documento final de verdade dois.'),
  T('t4', 'Agenda do semestre', { estilo: 'legenda' }),
  C('c4a', 'Em agosto, o campori regional em Formosa, com quatro dias de acampamento e a prova de ordem unida. As inscrições vão até o fim de julho, pela secretaria, e a ficha médica precisa estar assinada pelo responsável.'),
  C('c4b', 'Em setembro, a caminhada ecológica no Parque Nacional e o mutirão de limpeza do córrego atrás da sede. Em outubro, a investidura dos novos amigos e companheiros, com a presença das famílias e o lanche coletivo depois da cerimônia.'),
  C('c4c', 'Em novembro, o encerramento do ano com a apresentação dos projetos das unidades. Cada unidade terá dez minutos, e o boletim de verão vai trazer as fotos de todos.'),
  T('t6', 'Achados e perdidos'),
  C('c6a', 'Voltaram do acampamento sem dono: uma lanterna azul, dois cantis, uma blusa de moletom cinza com o nome apagado e um par de chinelos número trinta e oito. Tudo está na caixa da secretaria até o fim do mês.'),
  T('t5', 'Recado da diretoria'),
  C('c5a', 'Este boletim foi diagramado pelos próprios desbravadores, na vereda de diagramação e impressão. Se você encontrar uma foto torta ou uma página com o número errado, avise: é assim que se aprende a conferir antes de mandar para a gráfica.'),
  C('c5b', 'Agradecemos às famílias que emprestaram barracas e carros para o acampamento, e à escola que cedeu o laboratório nos domingos. Sem vocês, metade do que está nestas páginas não teria acontecido.'),
];

/** A matéria com os estilos certos e sem nada aplicado à mão — o fim do módulo 2. */
export const HISTORIA_ARRUMADA: Paragrafo[] = HISTORIA_COMO_CHEGOU.map(p => ({
  id: p.id, papel: p.papel, texto: p.texto, estilo: p.papel === 'titulo' ? 'titulo' : 'corpo',
}));

export const BIBLIOTECA: Imagem[] = [
  { id: 'capa', nome: 'capa-cachoeira.jpg', largura: 2400, altura: 3400, modo: 'rgb' },
  { id: 'fogueira', nome: 'fogueira.jpg', largura: 1800, altura: 1200, modo: 'rgb' },
  { id: 'unidade', nome: 'unidade-ipe-whatsapp.jpg', largura: 640, altura: 480, modo: 'rgb' },
];

export const CORES_DO_BOLETIM = ['#7B3F98', '#1B4D3E', '#00B3FF', '#FF6A00', '#1F2A24'];

/* ── As páginas ──────────────────────────────────────────────────────────── */

export const MALHA_CRUA = { margens: { topo: 6, base: 6, interna: 6, externa: 6 }, colunas: 1, medianiz: 0 };
export const MALHA_FEITA = { margens: { topo: 15, base: 18, interna: 16, externa: 13 }, colunas: 2, medianiz: 5 };

/**
 * Os quadros de texto de uma malha de duas colunas, nas páginas 2 a 4 —
 * menos a coluna da direita da página 4, que ninguém criou. É dela que
 * sobra o texto excedente: o fim da matéria não tem onde morar.
 */
export function quadrosDaMalha(semOUltimo = true): QuadroDeTexto[] {
  const m = MALHA_FEITA.margens;
  const util = A5.largura - m.interna - m.externa;
  const coluna = (util - MALHA_FEITA.medianiz) / 2;
  const quadros: QuadroDeTexto[] = [];
  let ordem = 1;
  for (const pagina of [1, 2, 3]) {
    const impar = (pagina + 1) % 2 === 1;
    const esquerda = impar ? m.interna : m.externa;
    for (const c of [0, 1]) {
      if (semOUltimo && pagina === 3 && c === 1) continue;
      quadros.push({
        id: `q${pagina}-${c}`, pagina, ordem: ordem++,
        x: esquerda + c * (coluna + MALHA_FEITA.medianiz), y: m.topo + 8, largura: coluna, altura: A5.altura - m.topo - m.base - 8,
      });
    }
  }
  return quadros;
}

/** O nome do boletim na capa, que é texto solto e não parte da matéria. */
const NOME_NA_CAPA: TextoSolto = {
  id: 'capa-titulo', pagina: 0, texto: 'Boletim de Inverno', x: 14, y: 150, largura: 120, altura: 14, corpo: 24, peso: 700, cor: '#FFFFFF',
};

/** Os números de página que alguém digitou, um por um, no pé de cada página. */
export const NUMEROS_DIGITADOS: TextoSolto[] = [1, 2, 3].map(i => ({
  id: `numero-${i + 1}`, pagina: i, texto: String(i + 1), x: 70, y: 200, largura: 8, altura: 5, corpo: 8, peso: 400, cor: '#1F2A24',
}));

/** As fotos como chegaram: a capa parando na borda, a fogueira fora da malha, a da unidade grande demais. */
export const IMAGENS_COMO_CHEGARAM: QuadroDeImagem[] = [
  { id: 'img-capa', pagina: 0, imagem: 'capa', x: 0, y: 0, largura: 148, altura: 210 },
  { id: 'img-fogueira', pagina: 1, imagem: 'fogueira', x: 22, y: 120, largura: 70, altura: 47 },
  { id: 'img-unidade', pagina: 2, imagem: 'unidade', x: 13, y: 120, largura: 119, altura: 70 },
];

export function boletim(parcial: Partial<Documento> = {}): Documento {
  return {
    nome: 'Boletim de Inverno',
    formato: A5,
    malha: MALHA_CRUA,
    sangria: 0,
    estilos: ESTILOS,
    historia: HISTORIA_COMO_CHEGOU,
    quadros: quadrosDaMalha(),
    imagens: [],
    soltos: [NOME_NA_CAPA, ...NUMEROS_DIGITADOS],
    biblioteca: BIBLIOTECA,
    paginas: [0, 1, 2, 3].map(i => ({ id: `p${i + 1}`, mestre: 'A' as const })),
    mestre: { numero: false, cabecalho: '' },
    cores: CORES_DO_BOLETIM,
    ...parcial,
  };
}
