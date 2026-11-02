import { AREA, DOCUMENTOS, LIXEIRA, type No } from '../labs/arquivos';
import { BACKUP } from '../labs/discoDoClube';

/*
 * O notebook da unidade Tucano: o computador que as telas da CC-ES001
 * percorrem.
 *
 * ── Por que outro computador ─────────────────────────────────────────────
 * O laboratório abre o computador do clube (`discoDoClube`), e tudo nele é
 * resposta de alguma lição: os dez nomes da Área de Trabalho que o módulo 5
 * manda renomear, o relatório na versão errada, a lista de inscritos que só
 * existe na cópia de segurança. Fotografar o gesto ali seria mostrar a
 * bagunça já arrumada — a decisão do lago da CC-DG003 e do guia da
 * caminhada da CC-DG005.
 *
 * Aqui é outra unidade, outro evento (o bazar de inverno) e outros arquivos,
 * com os mesmos tipos de defeito: nomes que a câmera e o WhatsApp escrevem, o
 * "FINAL" que não é final, um anexo com extensão dupla, a prestação de contas
 * salva por cima e uma planilha que só sobrou na cópia.
 * `exemplosDeArquivos.test.ts` reprova se algum nome daqui coincidir com um
 * do disco do clube.
 */

const DIA = 86_400_000;

const pasta = (id: string, nome: string, paiId: string | null, agora: number, dias: number): No =>
  ({ id, nome, tipo: 'pasta', paiId, tamanhoKb: 0, modificadoEm: agora - dias * DIA });

const arq = (id: string, nome: string, paiId: string, kb: number, agora: number, dias: number, rotulo?: string): No => ({
  id, nome, tipo: 'arquivo', paiId, tamanhoKb: kb, modificadoEm: agora - dias * DIA, ...(rotulo ? { rotulo } : {}),
});

export const BAZAR = 'bazar';
export const FOTOS_DO_BAZAR = 'fotos-bazar';

/** A Área de Trabalho do notebook, como a unidade a deixou. */
export const NOMES_NA_AREA = [
  'WhatsApp Image 2026-05-03 at 10.12.31.jpg',
  'WhatsApp Image 2026-05-03 at 10.14.05.jpg',
  'cartaz bazar.docx',
  'cartaz bazar (1).docx',
  'cartaz bazar FINAL.docx',
  'lista de doacoes.pdf.exe',
  'troco do caixa.txt',
] as const;

/** O que a prestação de contas era antes de alguém salvar por cima. */
export const PRESTACAO = 'prestacao de contas do bazar.docx';
export const PRESTACAO_ATUAL = 'só a primeira página — o resto foi apagado';
export const PRESTACAO_BOA = 'completa, com as vendas de sábado e domingo';

/** O que só sobrou na cópia de segurança. */
export const SO_NA_COPIA = 'precos das pecas.xlsx';

export function discoDaUnidade(agora: number): No[] {
  return [
    pasta(AREA, 'Área de Trabalho', null, agora, 0),
    pasta(DOCUMENTOS, 'Documentos', null, agora, 0),
    pasta(LIXEIRA, 'Lixeira', null, agora, 0),
    pasta(BACKUP, 'Cópia de Segurança (D:)', null, agora, 0),

    ...NOMES_NA_AREA.map((nome, i) => arq(
      `area${i}`, nome, AREA, [1830, 1760, 58, 61, 66, 412, 2][i], agora, [12, 12, 18, 16, 9, 3, 11][i],
    )),

    pasta(BAZAR, 'Bazar de Inverno', DOCUMENTOS, agora, 15),
    pasta(FOTOS_DO_BAZAR, 'Fotos', BAZAR, agora, 12),
    arq('fb1', 'barraca das roupas.jpg', FOTOS_DO_BAZAR, 2240, agora, 12),
    arq('fb2', 'mesa dos livros.jpg', FOTOS_DO_BAZAR, 1980, agora, 12),
    arq('fb3', 'caixa.jpg', FOTOS_DO_BAZAR, 2105, agora, 11),
    arq('fb4', 'fila da entrada.jpg', FOTOS_DO_BAZAR, 2390, agora, 12),
    {
      id: 'prestacao', nome: PRESTACAO, tipo: 'arquivo', paiId: BAZAR,
      tamanhoKb: 14, modificadoEm: agora - 1 * DIA, rotulo: PRESTACAO_ATUAL,
      versoes: [
        { em: agora - 4 * DIA, rotulo: PRESTACAO_BOA, tamanhoKb: 96 },
        { em: agora - 10 * DIA, rotulo: 'rascunho, sem os números', tamanhoKb: 40 },
      ],
    },
    arq('regulamento', 'regulamento do bazar.pdf', BAZAR, 310, agora, 30),
    arq('hino-tucano', 'grito da unidade.mp3', DOCUMENTOS, 1450, agora, 90),

    arq('bk_prestacao', PRESTACAO, BACKUP, 96, agora, 4, PRESTACAO_BOA),
    arq('bk_precos', SO_NA_COPIA, BACKUP, 38, agora, 4, 'a tabela de preços de cada peça'),
  ];
}
