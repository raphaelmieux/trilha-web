import type { ComponentType } from 'react';
import LaboratorioDeWord from '../components/LaboratorioDeWord';
import LaboratorioDaCircular from '../components/LaboratorioDaCircular';
import LaboratorioDoRelatorio from '../components/LaboratorioDoRelatorio';
import LaboratorioDoRelatorioAnual from '../components/LaboratorioDoRelatorioAnual';
import LaboratorioDaRevisao from '../components/LaboratorioDaRevisao';
import LaboratorioDaEntrega from '../components/LaboratorioDaEntrega';
import { CENAS_DE_DESIGN } from './cenasDeDesign';
import { CENAS_VETORIAIS } from './cenasVetoriais';
import { VEREDAS, type LicaoDeVereda } from '../curriculum/veredas';
import { blocoDe, campoDe, linhaDe, trechoDe, titulosDoDoc, type Doc, type Paragrafo, type Bloco } from '../labs/documento';

/*
 * As cenas das telas das lições: cada uma abre um laboratório com um arquivo
 * de exemplo, e é sobre ela que um roteiro de `roteiros.ts` age.
 *
 * O arquivo nunca é o do exercício. A lição mostra o gesto, e o laboratório
 * pede que a pessoa o faça; fotografar o gesto no documento da lição seria
 * pôr a resposta na teoria, um clique antes de a pessoa precisar dela. Os
 * documentos daqui são outros papéis do mesmo clube — o programa do campori,
 * a lista da cantina —, com o defeito ou a situação que o tópico explica.
 */

const vereda = (id: string) => VEREDAS.find(v => v.id === id)!;
const licaoDe = <T extends LicaoDeVereda['tipo']>(id: string, tipo: T, n = 0) =>
  vereda(id).modulos.flatMap(m => m.licoes).filter(l => l.tipo === tipo)[n] as Extract<LicaoDeVereda, { tipo: T }>;
const nada = () => {};

/* ── Word ─────────────────────────────────────────────────────────────────── */

const AZUL_A_MAO = '#1F4E79';

/** Um título que só parece título: Normal, com negrito, tamanho e cor à mão. */
const aMao = (id: string, secao: string, texto: string, tamanho: number): Paragrafo<string> =>
  blocoDe(id, secao, [{ ...trechoDe(`${id}-a`, texto), direta: { negrito: true, tamanho, cor: AZUL_A_MAO } }]);

const comEstilo = (b: Paragrafo<string>, estilo: Paragrafo<string>['estilo']): Paragrafo<string> => ({ ...b, estilo });

const PROGRAMA = [
  ['p1', 'O campori regional acontece de 9 a 12 de outubro, no parque da regional, e cada clube leva as próprias barracas.'],
  ['p2', 'Chegada às 18h, montagem das barracas por unidade e culto de abertura às 20h, no palco principal.'],
  ['p3', 'Culto pela manhã, provas de especialidade à tarde e fogueira à noite, com a apresentação dos clubes.'],
  ['p4', 'Desmontagem, inspeção da área de cada clube e saída dos ônibus às 14h, do portão norte.'],
] as const;

/** O programa do campori com os títulos feitos à mão — o defeito do módulo 1. */
const PROGRAMA_A_MAO: Doc<string> = {
  blocos: [
    aMao('titulo', 'capa', 'Programa do Campori Regional', 16),
    linhaDe('p1', 'capa', PROGRAMA[0][1]),
    aMao('sexta', 'dias', 'Sexta-feira', 13),
    linhaDe('p2', 'dias', PROGRAMA[1][1]),
    aMao('sabado', 'dias', 'Sábado', 13),
    linhaDe('p3', 'dias', PROGRAMA[2][1]),
    aMao('domingo', 'dias', 'Domingo', 13),
    linhaDe('p4', 'dias', PROGRAMA[3][1]),
  ],
  colunas: { capa: 1, dias: 1 },
  sumario: null,
};

/** O mesmo programa, com os títulos marcados por estilo. */
const PROGRAMA_COM_ESTILO: Doc<string> = {
  ...PROGRAMA_A_MAO,
  blocos: [
    comEstilo(linhaDe('titulo', 'capa', 'Programa do Campori Regional'), 'Título 1'),
    linhaDe('p1', 'capa', PROGRAMA[0][1]),
    comEstilo(linhaDe('sexta', 'dias', 'Sexta-feira'), 'Título 2'),
    linhaDe('p2', 'dias', PROGRAMA[1][1]),
    comEstilo(linhaDe('sabado', 'dias', 'Sábado'), 'Título 2'),
    linhaDe('p3', 'dias', PROGRAMA[2][1]),
    comEstilo(linhaDe('domingo', 'dias', 'Domingo'), 'Título 2'),
    linhaDe('p4', 'dias', PROGRAMA[3][1]),
  ],
};

/**
 * O convite da investidura, escrito do jeito que a circular do módulo 2 chega:
 * o endereço em três parágrafos e quatro Enters empurrando a assinatura.
 */
const CONVITE: Doc<string> = {
  blocos: [
    linhaDe('titulo', 'cabeca', 'Convite — Cerimônia de Investidura'),
    linhaDe('c1', 'corpo', 'Queridas famílias, no sábado, 14 de novembro, às 16h, os desbravadores que concluíram as classes deste ano recebem os lenços e as insígnias diante do clube e da igreja.'),
    linhaDe('c2', 'corpo', 'A cerimônia dura cerca de uma hora, e depois dela há um lanche no salão. Venha de uniforme de gala quem tiver; quem não tiver, venha do jeito que puder.'),
    linhaDe('e1', 'endereco', 'Igreja Central de Sobradinho'),
    linhaDe('e2', 'endereco', 'Quadra 6, Área Especial 2'),
    linhaDe('e3', 'endereco', 'Sobradinho, DF'),
    linhaDe('v1', 'assinatura', ''),
    linhaDe('v2', 'assinatura', ''),
    linhaDe('v3', 'assinatura', ''),
    linhaDe('v4', 'assinatura', ''),
    linhaDe('assina', 'assinatura', 'Diretoria do Clube de Desbravadores Pioneiros'),
  ],
  colunas: { cabeca: 1, corpo: 1, endereco: 1, assinatura: 1 },
  sumario: null,
};

/* ── A cantina do campori: tabela, imagem e legenda ─────────────────────────── */

const titulo2 = (id: string, secao: string, texto: string) => comEstilo(linhaDe(id, secao, texto), 'Título 2');

const VENDAS = [
  ['Item', 'Vendidos', 'Arrecadado'],
  ['Pastel', '184', 'R$ 920,00'],
  ['Suco', '212', 'R$ 636,00'],
  ['Pipoca', '95', 'R$ 285,00'],
  ['Água', '160', 'R$ 320,00'],
];

const ABERTURA_DA_CANTINA: Bloco<string>[] = [
  comEstilo(linhaDe('titulo', 'cabeca', 'Relatório da Cantina — Campori Regional'), 'Título 1'),
  linhaDe('abertura', 'cabeca', 'A cantina do clube funcionou nas três noites do campori, das 19h às 22h, com quatro desbravadores por turno e um conselheiro no caixa.'),
  titulo2('h-vendas', 'quem', 'O que se vendeu'),
];

/** As vendas alinhadas com Tab, do jeito que a planilha do caixa foi colada. */
const CANTINA_NA_TABULACAO: Doc<string> = {
  blocos: [
    ...ABERTURA_DA_CANTINA,
    ...VENDAS.map((l, i) => linhaDe(`v${i}`, 'lista', l.join('\t'))),
    linhaDe('depois', 'noite', 'O pastel acabou na segunda noite, e a pipoca sobrou nas três.'),
  ],
  colunas: { cabeca: 1, quem: 1, lista: 1, noite: 1, encerramento: 1 },
  sumario: null,
};

/** As mesmas vendas já em tabela, com uma linha que precisa sair. */
const CANTINA_EM_TABELA: Doc<string> = {
  ...CANTINA_NA_TABULACAO,
  blocos: [
    ...ABERTURA_DA_CANTINA,
    {
      tipo: 'tabela', id: 'tab-vendas', secao: 'lista', cabecalho: true, estilo: 'Tabela com Grade',
      linhas: [...VENDAS, ['Gelo', '0', 'R$ 0,00']],
    },
    linhaDe('depois', 'noite', 'O gelo foi doado pelo mercado do bairro e não foi vendido: a linha dele não devia estar aqui.'),
  ],
};

const TEXTO_DA_NOITE = [
  'A fila da cantina se formava logo depois do culto, e a maior parte das vendas acontecia nos primeiros quarenta minutos.',
  'Nas três noites o caixa fechou sem diferença, conferido pelo conselheiro de plantão e pela tesouraria no dia seguinte.',
  'Para o próximo campori, a equipe sugere dobrar a massa de pastel da segunda noite e levar metade da pipoca.',
];

/** Uma foto entrando no meio do texto, ainda alinhada com ele. */
const CANTINA_COM_FOTO: Doc<string> = {
  ...CANTINA_NA_TABULACAO,
  blocos: [
    ...ABERTURA_DA_CANTINA.slice(0, 2),
    titulo2('h-noite', 'noite', 'Como foram as noites'),
    linhaDe('n1', 'noite', TEXTO_DA_NOITE[0]),
    {
      tipo: 'imagem', id: 'img-fila', secao: 'noite', arquivo: 'fila-da-cantina.jpg',
      descricao: 'A fila da cantina na sexta à noite', disposicao: 'alinhada',
    },
    linhaDe('n2', 'noite', TEXTO_DA_NOITE[1]),
    linhaDe('n3', 'noite', TEXTO_DA_NOITE[2]),
  ],
};

/** Duas fotos: a segunda já legendada, a primeira ainda não. */
const CANTINA_COM_DUAS_FOTOS: Doc<string> = {
  ...CANTINA_NA_TABULACAO,
  blocos: [
    ...ABERTURA_DA_CANTINA.slice(0, 2),
    titulo2('h-noite', 'noite', 'Como foram as noites'),
    linhaDe('n1', 'noite', TEXTO_DA_NOITE[0]),
    {
      tipo: 'imagem', id: 'img-fila', secao: 'noite', arquivo: 'fila-da-cantina.jpg',
      descricao: 'A fila da cantina na sexta à noite', disposicao: 'acima-e-abaixo',
    },
    linhaDe('n2', 'noite', TEXTO_DA_NOITE[1]),
    {
      tipo: 'imagem', id: 'img-caixa', secao: 'noite', arquivo: 'caixa-fechado.jpg',
      descricao: 'O caixa conferido no domingo', disposicao: 'acima-e-abaixo',
    },
    {
      ...linhaDe('leg-img-caixa', 'noite', ''), estilo: 'Legenda',
      trechos: [campoDe('leg-img-caixa-n', 'figura'), trechoDe('leg-img-caixa-t', ' — O caixa conferido no domingo.')],
    },
    linhaDe('n3', 'noite', TEXTO_DA_NOITE[2]),
  ],
};

/* ── O manual da unidade: o que se repete em toda página ───────────────────── */

const titulo1 = (id: string, secao: string, texto: string) => comEstilo(linhaDe(id, secao, texto), 'Título 1');
const novaFolha = <B extends Bloco<string>>(b: B): B => ({ ...b, quebraDePagina: true });

/** Três folhas, com títulos de verdade — o sumário tem o que ler. */
const MANUAL: Doc<string> = {
  blocos: [
    titulo1('titulo', 'abertura', 'Manual de Acampamento da Unidade Falcão'),
    linhaDe('sub', 'abertura', 'O que cada um leva, faz e confere — edição 2026.'),
    novaFolha(titulo1('h-antes', 'apresentacao', 'Antes de sair')),
    titulo2('h-mochila', 'apresentacao', 'A mochila'),
    linhaDe('a1', 'apresentacao', 'Saco de dormir, agasalho, lanterna com pilhas novas, cantil, prato, caneca e talheres que não sejam descartáveis.'),
    titulo2('h-ficha', 'apresentacao', 'A ficha de saúde'),
    linhaDe('a2', 'apresentacao', 'Entregue ao conselheiro até a quarta-feira anterior, com a assinatura de quem é responsável.'),
    novaFolha(titulo1('h-durante', 'atividades', 'No acampamento')),
    titulo2('h-barraca', 'atividades', 'A barraca'),
    linhaDe('d1', 'atividades', 'Cada barraca tem um responsável pela ordem do dia, e a inspeção passa às 7h30.'),
    titulo2('h-fogo', 'atividades', 'O fogo'),
    linhaDe('d2', 'atividades', 'Só se acende fogo com um conselheiro presente, e só se sai de perto dele depois de apagado e molhado.'),
  ],
  cabecalho: null,
  rodape: null,
  primeiraPaginaDiferente: false,
  colunas: { abertura: 1, apresentacao: 1, atividades: 1, numeros: 1, fecho: 1 },
  sumario: null,
};

/** O mesmo manual, com "Página 1" digitado no rodapé — e repetido em todas. */
const MANUAL_COM_NUMERO_DIGITADO: Doc<string> = {
  ...MANUAL,
  rodape: { trechos: [trechoDe('rod-a', 'Página 1')] },
};

/* ── A ata da diretoria: revisar com outra pessoa ───────────────────────────── */

const ATA: Doc<string> = {
  blocos: [
    titulo1('titulo', 'abertura', 'Ata da reunião da diretoria — 3 de outubro'),
    titulo2('h-decisoes', 'programacao', 'O que ficou decidido'),
    linhaDe('d1', 'programacao', 'A saída para o campori será às 18h de sexta, do pátio da igreja, e a chamada começa meia hora antes.'),
    linhaDe('d2', 'programacao', 'O gás da cozinha será comprado pela tesouraria até a quarta-feira, e o fogão passa por revisão na quinta.'),
    linhaDe('d3', 'programacao', 'Cada unidade leva a própria bandeira, e a da Unidade Falcão precisa de mastro novo.'),
    titulo2('h-proxima', 'fecho', 'Próxima reunião'),
    linhaDe('p1', 'fecho', 'No sábado depois do campori, às 16h, para fechar as contas.'),
  ],
  colunas: { abertura: 1, programacao: 1, 'quem-foi': 1, fecho: 1 },
  sumario: null,
  controlarAlteracoes: false,
};

/** A mesma ata, devolvida pela liderança com uma pergunta na margem. */
const ATA_COMENTADA: Doc<string> = {
  ...ATA,
  comentarios: [{
    id: 'c-gas', trecho: 'd2-a', autor: 'lideranca',
    texto: 'Quem da tesouraria vai comprar o gás? Na última vez ninguém foi, porque cada um achou que era o outro.',
    respostas: [], resolvido: false,
  }],
};

/** A escala da cantina, com um nome escrito em minúscula duas vezes. */
const ESCALA: Doc<string> = {
  ...ATA,
  blocos: [
    titulo1('titulo', 'abertura', 'Escala da cantina do campori'),
    linhaDe('e1', 'programacao', 'Na primeira semana de preparação, quem abre a cantina é a ana, com a Mariana no caixa.'),
    linhaDe('e2', 'programacao', 'A banana da vitamina chega na segunda; o resto da semana fica com a ana e o Juliano.'),
    linhaDe('e3', 'programacao', 'Quem não puder no seu turno avisa a diretoria até a sexta anterior.'),
  ],
};

const word = (inicial: Doc<string>, arquivo: string) => () => (
  <LaboratorioDeWord vereda={vereda('cc-es002')} licao={licaoDe('cc-es002', 'word')}
    aoVencer={nada} aoSair={nada} inicial={inicial} arquivo={arquivo} />
);

const circular = (inicial: Doc<string>, arquivo: string) => () => (
  <LaboratorioDaCircular vereda={vereda('cc-es002')} licao={licaoDe('cc-es002', 'word', 1)}
    aoVencer={nada} aoSair={nada} inicial={inicial} arquivo={arquivo} />
);

const relatorio = (inicial: Doc<string>, arquivo: string) => () => (
  <LaboratorioDoRelatorio vereda={vereda('cc-es002')} licao={licaoDe('cc-es002', 'word', 2)}
    aoVencer={nada} aoSair={nada} inicial={inicial} arquivo={arquivo} />
);

const relatorioAnual = (inicial: Doc<string>, arquivo: string) => () => (
  <LaboratorioDoRelatorioAnual vereda={vereda('cc-es002')} licao={licaoDe('cc-es002', 'word', 3)}
    aoVencer={nada} aoSair={nada} inicial={inicial} arquivo={arquivo} />
);

const revisao = (inicial: Doc<string>, arquivo: string) => () => (
  <LaboratorioDaRevisao vereda={vereda('cc-es002')} licao={licaoDe('cc-es002', 'word', 4)}
    aoVencer={nada} aoSair={nada} inicial={inicial} arquivo={arquivo} />
);

const entrega = (inicial: Doc<string>, arquivo: string) => () => (
  <LaboratorioDaEntrega vereda={vereda('cc-es002')} licao={licaoDe('cc-es002', 'word', 5)}
    aoVencer={nada} aoSair={nada} inicial={inicial} arquivo={arquivo} />
);

export const CENAS: Record<string, ComponentType> = {
  'word-programa-a-mao': word(PROGRAMA_A_MAO, 'Programa do Campori'),
  'word-programa-com-estilo': word(PROGRAMA_COM_ESTILO, 'Programa do Campori'),
  'word-convite': circular(CONVITE, 'Convite da Investidura'),
  'word-cantina-tabulacao': relatorio(CANTINA_NA_TABULACAO, 'Relatório da Cantina'),
  'word-cantina-tabela': relatorio(CANTINA_EM_TABELA, 'Relatório da Cantina'),
  'word-cantina-foto': relatorio(CANTINA_COM_FOTO, 'Relatório da Cantina'),
  'word-cantina-duas-fotos': relatorio(CANTINA_COM_DUAS_FOTOS, 'Relatório da Cantina'),
  'word-manual': relatorioAnual(MANUAL, 'Manual da Unidade Falcão'),
  'word-manual-numero-digitado': relatorioAnual(MANUAL_COM_NUMERO_DIGITADO, 'Manual da Unidade Falcão'),
  'word-ata': revisao(ATA, 'Ata da Diretoria'),
  'word-ata-comentada': revisao(ATA_COMENTADA, 'Ata da Diretoria'),
  'word-escala': revisao(ESCALA, 'Escala da Cantina'),
  'word-manual-entrega': entrega({ ...MANUAL, sumario: titulosDoDoc(MANUAL) }, 'Manual da Unidade Falcão'),
  ...CENAS_DE_DESIGN,
  ...CENAS_VETORIAIS,
};
