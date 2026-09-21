/**
 * Os documentos que moram na nuvem do clube.
 *
 * É o `oficioDoClube.ts` e o `dossieDoClube.ts` desta vereda: o conteúdo de
 * cada arquivo fica aqui, fora do motor e fora da tela, porque é **conteúdo**
 * — e porque as nove lições partem todas da mesma nuvem, com cada uma pegando
 * um estado dela. É o arranjo do `discoDoClube()` da CC-ES001, do
 * `cadernoDoClube()` da CC-ES003 e do `dossieDoClube()` da CC-ES004, pelo
 * motivo escrito nos três: nove nuvens diferentes ensinariam que cada
 * exercício acontece num serviço de mentira.
 *
 * Todos são `Doc` da CC-ES002 — o mesmo documento, com os mesmos trechos,
 * comentários e marcas de revisão. É a razão de o requisito 1 pedir aquela
 * vereda antes desta.
 */

import {
  type Comentario, type Doc, type Paragrafo, type Trecho,
  blocoDe, linhaDe, trechoDe,
} from './documento';

/** Uma seção só: nenhum destes documentos tem colunas nem capa. */
type Secao = 'corpo';

const doc = (blocos: Paragrafo<Secao>[], extra: Partial<Doc<Secao>> = {}): Doc<Secao> =>
  ({ blocos, colunas: { corpo: 1 }, sumario: null, ...extra });

const titulo = (id: string, texto: string): Paragrafo<Secao> =>
  ({ ...linhaDe(id, 'corpo', texto), estilo: 'Título 1' });

/* ── A lista de materiais: o documento do requisito 3 ─────────────────────── */

/**
 * A lista que **você** escreveu, e que por isso é sua.
 *
 * Ela é o arquivo do módulo 1 porque o requisito 3 pede comparar mandar a
 * cópia por anexo com compartilhar o vínculo, e os dois gestos são de quem é
 * dono. Um arquivo dos outros deixaria metade do requisito fora de alcance.
 */
export const LISTA_DE_MATERIAIS = (): Doc<Secao> => doc([
  titulo('lm-t', 'Lista de materiais — Acampamento de julho'),
  linhaDe('lm-1', 'corpo', 'Barracas: 6 de quatro lugares e 2 de seis lugares.'),
  linhaDe('lm-2', 'corpo', 'Lampiões: 8, com pilha reserva para cada um.'),
  linhaDe('lm-3', 'corpo', 'Cordas: 4 de dez metros para as barracas e 2 de vinte para o mastro.'),
  linhaDe('lm-4', 'corpo', 'Caixa de primeiros socorros: 2, uma por unidade.'),
]);

/* ── O combinado: o documento em que você só comenta ──────────────────────── */

/**
 * O combinado da Marta, em que você é **comentarista**.
 *
 * É o documento do módulo 6, e por isso ele traz uma frase que dá o que
 * sugerir: a data da saída está escrita de um jeito no começo e de outro mais
 * adiante, e nenhuma das duas é obviamente a certa. Sugerir uma correção que
 * o próprio documento não desmente seria pedir adivinhação — a evidência
 * mora dentro do texto, como na CC-ES002.
 */
export const COMBINADO = (): Doc<Secao> => doc([
  titulo('cb-t', 'Combinado do acampamento'),
  linhaDe('cb-1', 'corpo',
    'A saída é no dia 17 de julho, sexta-feira, às 18h, da porta da igreja.'),
  linhaDe('cb-2', 'corpo',
    'Cada desbravador leva a própria roupa de cama. O clube leva as barracas.'),
  linhaDe('cb-3', 'corpo',
    'A volta é no domingo, dia 19 de julho, até as 17h, no mesmo lugar.'),
  linhaDe('cb-4', 'corpo',
    'Quem não puder ir avisa a secretaria até o dia 10 de julho.'),
]);

/* ── A escala: o documento em que se escreve junto ────────────────────────── */

/**
 * A escala das unidades, em que você é editor e a Marta também.
 *
 * É o documento dos módulos 4, 5, 7 e 8 — escrever ao mesmo tempo, comentar,
 * o histórico e o conflito. Ele chega com um comentário da Marta **já
 * aberto**, porque o requisito 4.3 manda resolver comentário de terceiro, e
 * um documento sem comentário de ninguém deixaria essa metade sem o que
 * resolver.
 */
export const ESCALA = (): Doc<Secao> => doc([
  titulo('es-t', 'Escala das unidades — julho'),
  linhaDe('es-1', 'corpo', 'Sexta, 18h — Montagem do acampamento: unidade Falcão.'),
  linhaDe('es-2', 'corpo', 'Sábado, 7h — Café da manhã: unidade Águia.'),
  linhaDe('es-3', 'corpo', 'Sábado, 12h — Almoço: unidade Onça.'),
  linhaDe('es-4', 'corpo', 'Sábado, 19h — Fogueira e culto: unidade Tucano.'),
  linhaDe('es-5', 'corpo', 'Domingo, 14h — Desmontagem: todas as unidades.'),
], {
  comentarios: [COMENTARIO_DA_MARTA()],
});

/**
 * O comentário que a Marta deixou, e que espera resposta.
 *
 * Ele **pergunta**, e não avisa: o requisito 4.3 manda resolver comentário de
 * terceiro, e resolver em silêncio uma pergunta é fechar o assunto sem dizer
 * nada a quem perguntou. É a decisão do balão da liderança na CC-ES002.
 */
export const COMENTARIO_DA_MARTA = (): Comentario => ({
  id: 'c-marta-1',
  trecho: 'es-3-a',
  autor: 'marta',
  texto: 'A Onça tem só quatro desbravadores em julho. Dá para o almoço de sábado?',
  respostas: [],
  resolvido: false,
});

/**
 * O parágrafo que a Marta escreve enquanto você está com o documento aberto.
 *
 * É o requisito 4.2 acontecendo: as duas edições entram, nenhuma espera a
 * outra sair, e nada precisa ser resolvido. O conflito do requisito 6 é de
 * arquivo **sincronizado**, e é outra história.
 */
export const LINHA_DA_MARTA = (): Paragrafo<Secao> =>
  linhaDe('es-6', 'corpo', 'Domingo, 8h — Café da manhã: unidade Falcão.');

/* ── A ata: o documento antigo, para o histórico ──────────────────────────── */

/**
 * A ata da reunião, que é o documento do módulo 7.
 *
 * Ela chega com um estrago **já feito**: a versão de agora perdeu o parágrafo
 * das decisões, que estava na versão de anteontem. Sem o estrago, restaurar
 * uma versão anterior seria um gesto sem consequência, e o requisito 4.5
 * mediria ter clicado.
 */
export const ATA_INTEIRA = (): Doc<Secao> => doc([
  titulo('at-t', 'Ata da reunião de junho'),
  linhaDe('at-1', 'corpo', 'Presentes: Marta, Ronaldo, Cleide e a diretoria.'),
  linhaDe('at-2', 'corpo',
    'Decisões: o acampamento fica em julho; a inscrição custa 45 reais; '
    + 'quem não tiver barraca usa a do clube.'),
  linhaDe('at-3', 'corpo', 'Próxima reunião: primeiro sábado de julho, depois do culto.'),
]);

/** A mesma ata depois de alguém apagar as decisões sem querer. */
export const ATA_SEM_AS_DECISOES = (): Doc<Secao> => doc([
  titulo('at-t', 'Ata da reunião de junho'),
  linhaDe('at-1', 'corpo', 'Presentes: Marta, Ronaldo, Cleide e a diretoria.'),
  linhaDe('at-3', 'corpo', 'Próxima reunião: primeiro sábado de julho, depois do culto.'),
]);

/* ── O combinado de trabalho: o documento do requisito 7 ──────────────────── */

/**
 * O que as quatro perguntas do requisito 7 são.
 *
 * Elas ficam aqui, e não numa lista dentro da meta, porque são **conteúdo**:
 * o laboratório desenha cada uma como um parágrafo por escrever no documento,
 * e o passo a passo da lição as cita. Um combinado que já chegasse respondido
 * abriria a lição resolvida, e um que não dissesse o que perguntar mediria
 * adivinhação.
 */
export const PERGUNTAS_DO_COMBINADO = [
  { id: 'onde', pergunta: 'Onde ficam os arquivos da equipe?' },
  { id: 'nomes', pergunta: 'Como os arquivos são nomeados?' },
  { id: 'quem', pergunta: 'Quem detém cada permissão?' },
  { id: 'saida', pergunta: 'O que acontece quando alguém deixa a equipe?' },
] as const;

export type PerguntaDoCombinado = typeof PERGUNTAS_DO_COMBINADO[number]['id'];

/** O id do parágrafo de resposta de cada pergunta, no documento do combinado. */
export const RESPOSTA_DE = (p: PerguntaDoCombinado) => `ct-${p}-r`;

/**
 * O combinado de trabalho, como ele chega: as quatro perguntas e nada mais.
 *
 * Cada pergunta é um título e cada resposta é um parágrafo **vazio**. Vazio, e
 * não com um exemplo apagado: modelo é o que sai de quem aceita o que veio na
 * frente, e um exemplo escrito viraria a resposta de todo mundo.
 */
export const COMBINADO_DE_TRABALHO = (): Doc<Secao> => doc([
  titulo('ct-t', 'Combinado de trabalho — equipe do acampamento'),
  ...PERGUNTAS_DO_COMBINADO.flatMap((p): Paragrafo<Secao>[] => [
    { ...linhaDe(`ct-${p.id}`, 'corpo', p.pergunta), estilo: 'Título 2' },
    blocoDe(RESPOSTA_DE(p.id), 'corpo', [trechoDe(`${RESPOSTA_DE(p.id)}-a`, '')]),
  ]),
]);

/** Um trecho escrito por alguém, com a marca de quem foi. */
export const escritoPor = (id: string, texto: string): Trecho => trechoDe(id, texto);
