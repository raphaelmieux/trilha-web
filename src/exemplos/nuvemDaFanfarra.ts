import { type Comentario, type Doc, type Paragrafo, linhaDe } from '../labs/documento';
import { type Nuvem, arquivoDe } from '../labs/arquivoCompartilhado';
import type { OutraNuvem } from '../components/LaboratorioDaNuvem';

/*
 * A pasta da fanfarra na nuvem do clube: o que as telas da CC-ES006 percorrem.
 *
 * ── Por que outra pasta ──────────────────────────────────────────────────
 * O laboratório abre a nuvem do acampamento (`arquivoCompartilhado.ts` e
 * `documentosDaNuvem.ts`), e quase tudo nela é resposta de alguma lição: a
 * lista de materiais que vai por anexo para a Cleide, as fichas médicas
 * abertas pela pasta, a escala das unidades com a pergunta da Marta sobre a
 * Onça, o combinado com a saída no dia 17 de um lado e 19 do outro, a ata que
 * perdeu as decisões. Os quadros de texto da teoria citavam isso tudo — o
 * balão do "diz 17 e no parágrafo 4 diz 19" era a resposta da lição de
 * sugerir —, que é pôr o gabarito na teoria.
 *
 * Aqui é a mesma equipe — a Marta, o Ronaldo e a Cleide, que são as pessoas
 * do programa — trabalhando noutra pasta, com outros arquivos e outros
 * defeitos do mesmo tipo. `exemplosDaNuvem.test.ts` confere as legendas
 * contra esta pasta e reprova se ela passar a dividir um arquivo ou uma
 * linha com a do acampamento.
 */

type Secao = 'corpo';
const doc = (blocos: Paragrafo<Secao>[], extra: Partial<Doc<Secao>> = {}): Doc<Secao> =>
  ({ blocos, colunas: { corpo: 1 }, sumario: null, ...extra });
const titulo = (id: string, texto: string): Paragrafo<Secao> =>
  ({ ...linhaDe(id, 'corpo', texto), estilo: 'Título 1' });

/** A lista de uniformes: o arquivo que é seu, e que se manda de dois jeitos. */
export const LISTA_DE_UNIFORMES = (): Doc<Secao> => doc([
  titulo('lu-t', 'Uniformes da fanfarra — tamanhos'),
  linhaDe('lu-1', 'corpo', 'Bianca: camisa P, calça 12.'),
  linhaDe('lu-2', 'corpo', 'Lívia: camisa M, calça 14.'),
  linhaDe('lu-3', 'corpo', 'Mateus: camisa G, calça 16.'),
]);

/** O roteiro do desfile, em que você só comenta: a hora da saída discorda de si mesma. */
export const ROTEIRO_DO_DESFILE = (): Doc<Secao> => doc([
  titulo('rd-t', 'Roteiro do desfile de 7 de setembro'),
  linhaDe('rd-1', 'corpo', 'A fanfarra se concentra na praça às 7h, já de uniforme.'),
  linhaDe('rd-2', 'corpo', 'A tuba e os tambores vão na van do clube.'),
  linhaDe('rd-3', 'corpo', 'O desfile da fanfarra começa às 8h30, depois das escolas.'),
  linhaDe('rd-4', 'corpo', 'Quem chegar depois das 7h30 não entra na formação.'),
]);

export const PERGUNTA_DO_RONALDO = (): Comentario => ({
  id: 'c-ronaldo-1',
  trecho: 'rp-2-a',
  autor: 'ronaldo',
  texto: 'A Lívia ainda não aprendeu o hino. Dá para pôr outra música no lugar?',
  respostas: [],
  resolvido: false,
});

/** O repertório, em que se escreve junto e em que nasce o conflito. */
export const REPERTORIO = (): Doc<Secao> => doc([
  titulo('rp-t', 'Repertório do Encontro de Fanfarras'),
  linhaDe('rp-1', 'corpo', 'Abertura: Marcha dos Desbravadores.'),
  linhaDe('rp-2', 'corpo', 'Segunda música: Hino do clube, com todos os naipes.'),
  linhaDe('rp-3', 'corpo', 'Encerramento: Cisne Branco.'),
], { comentarios: [PERGUNTA_DO_RONALDO()] });

/** O que o Ronaldo escreve enquanto você está com o repertório aberto. */
export const LINHA_DO_RONALDO = (): Paragrafo<Secao> =>
  linhaDe('rp-4', 'corpo', 'Bis, se pedirem: Marcha dos Desbravadores outra vez.');

/** A versão que a Marta escreveu sem internet, e que sobe quando a rede volta. */
export const REPERTORIO_SEM_REDE = (): Doc<Secao> => ({
  ...REPERTORIO(),
  blocos: [...REPERTORIO().blocos,
    linhaDe('rp-5', 'corpo', 'Ensaio extra na quinta, para o hino sair inteiro.')],
});

/** A ata da reunião da fanfarra: a versão de agora perdeu as decisões. */
export const ATA_DA_FANFARRA = (): Doc<Secao> => doc([
  titulo('af-t', 'Ata da reunião da fanfarra'),
  linhaDe('af-1', 'corpo', 'Presentes: Marta, Ronaldo, Cleide e você.'),
  linhaDe('af-2', 'corpo', 'Decidido: a fanfarra toca três músicas no Encontro, e a tuba vai ao conserto.'),
  linhaDe('af-3', 'corpo', 'Próxima reunião: depois do Encontro.'),
]);
export const ATA_SEM_AS_DECISOES = (): Doc<Secao> => ({
  ...ATA_DA_FANFARRA(),
  blocos: ATA_DA_FANFARRA().blocos.filter(b => b.id !== 'af-2'),
});

export const nuvemDaFanfarra = (): Nuvem => ({
  arquivos: [
    arquivoDe('pasta-fanfarra', 'Fanfarra', 'pasta', 'marta', {
      acessos: [
        { quem: 'voce', papel: 'editor' },
        { quem: 'ronaldo', papel: 'editor' },
        { quem: 'cleide', papel: 'leitor' },
      ],
    }),
    /* Sem acesso próprio nenhum, e três pessoas a abrem pela pasta. */
    arquivoDe('telefones', 'Telefones dos pais da fanfarra', 'planilha', 'marta', {
      pasta: 'pasta-fanfarra',
    }),
    arquivoDe('repertorio', 'Repertório do Encontro', 'documento', 'marta', {
      pasta: 'pasta-fanfarra',
      acessos: [{ quem: 'voce', papel: 'editor' }, { quem: 'ronaldo', papel: 'editor' }],
      versoes: [{ id: 'repertorio-v1', quando: 'há 3 dias', porQuem: ['marta'], doc: REPERTORIO() }],
    }),
    arquivoDe('ata-fanfarra', 'Ata da reunião da fanfarra', 'documento', 'marta', {
      pasta: 'pasta-fanfarra',
      versoes: [
        { id: 'ata-fanfarra-v1', quando: '2 de agosto, 19:40', porQuem: ['marta'], doc: ATA_DA_FANFARRA() },
        { id: 'ata-fanfarra-v2', quando: '4 de agosto, 10:15', porQuem: ['marta', 'ronaldo'], doc: ATA_DA_FANFARRA() },
        { id: 'ata-fanfarra-v3', quando: '9 de agosto, 22:05', porQuem: ['ronaldo'], doc: ATA_SEM_AS_DECISOES() },
      ],
    }),
    arquivoDe('roteiro', 'Roteiro do desfile', 'documento', 'marta', {
      acessos: [{ quem: 'voce', papel: 'comentarista' }],
      versoes: [{ id: 'roteiro-v1', quando: 'ontem, 18:20', porQuem: ['marta'], doc: ROTEIRO_DO_DESFILE() }],
    }),
    arquivoDe('uniformes', 'Uniformes da fanfarra', 'documento', 'voce', {
      versoes: [{ id: 'uniformes-v1', quando: 'hoje, 08:10', porQuem: ['voce'], doc: LISTA_DE_UNIFORMES() }],
    }),
  ],
});

/** A pasta da fanfarra, abrindo no arquivo que o tópico mostra. */
export const naFanfarra = (abre?: string): OutraNuvem => ({
  inicial: nuvemDaFanfarra,
  abre,
  juntos: { arquivo: 'repertorio', quem: 'ronaldo', linha: LINHA_DO_RONALDO },
  conflito: { arquivo: 'repertorio', quem: 'marta', doc: REPERTORIO_SEM_REDE },
});
