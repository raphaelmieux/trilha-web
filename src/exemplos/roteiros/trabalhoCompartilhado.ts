import type { Acao, Roteiro } from '../roteiros';

/*
 * CC-ES006 Trabalho Compartilhado, na nuvem e no editor de documento do
 * laboratório, com a pasta da fanfarra — e não a do acampamento que as lições
 * arrumam. O motivo está em `nuvemDaFanfarra.ts`.
 */

const V = 'CC-ES006';
const L = 1280;
const A = 800;

/* A nuvem */
const linha = (nome: string) => `.nv-linha:has-text("${nome}")`;
const mais = (nome: string) => `[aria-label="Mais ações de ${nome}"]`;
const item = (texto: string) => `.nv-item:has-text("${texto}")`;
const CAIXA = '.nv-caixa';
const CONCLUIDO = `${CAIXA} button:has-text("Concluído")`;
const ENVIAR = `${CAIXA} button:has-text("Enviar")`;
const HERDADO = '.nv-herdado';

/* O editor */
const paragrafo = (id: string) => `[data-bloco="${id}"]`;
const ferramenta = (dica: string) => `[aria-label="${dica}"]`;
const HISTORICO = '.ed-historico';
const BALAO = '.wd-balao';

const r = (topico: string, cena: string, acoes: Acao[]): Roteiro =>
  ({ vereda: V, topico, cena: `nuvem-${cena}`, largura: L, altura: A, acoes });

/** Põe o cursor no fim de um parágrafo e escreve. */
const escreverNoFim = (id: string, texto: string): Acao[] => [
  { ponto: paragrafo(id), em: [0.99, 0.5] }, { tecla: 'End' }, { digitar: texto },
];

export const ROTEIROS_DA_NUVEM: Roteiro[] = [
  /* ── Módulo 1 — anexo ou vínculo ── */
  r('o-que-o-anexo-produz', 'lista', [
    { clicar: mais('Uniformes da fanfarra') },
    { clicar: item('Enviar por e-mail') },
    { foto: true, destaque: [`${CAIXA} .nv-pessoa:has-text("Anexar uma cópia")`, `${CAIXA} .nv-pessoa:has-text("Compartilhar o vínculo")`] },
  ]),
  r('os-dois-problemas', 'lista', [
    { clicar: mais('Uniformes da fanfarra') },
    { clicar: item('Enviar por e-mail') },
    { clicar: ENVIAR },
    { clicar: '.nv-lugar:has-text("Compartilhados comigo")' },
    { foto: true, destaque: ['.nv-lista'] },
  ]),

  /* ── Módulo 2 — os três níveis ── */
  r('os-tres', 'lista', [
    { clicar: mais('Uniformes da fanfarra') },
    { clicar: item('Compartilhar') },
    { escolher: '[aria-label="Ver o que um nível permite"]', valor: 'comentarista' },
    { rolarAte: '[aria-label="Ver o que um nível permite"]' },
    { foto: true, destaque: [`${CAIXA} .nv-secao-caixa:has([aria-label="Ver o que um nível permite"])`] },
  ]),
  r('o-acesso-geral', 'lista', [
    { clicar: mais('Uniformes da fanfarra') },
    { clicar: item('Compartilhar') },
    { escolher: '[aria-label="Acesso geral"]', valor: 'editor' },
    { foto: true, destaque: ['.nv-acesso-geral'] },
  ]),

  /* ── Módulo 3 — a pasta manda ── */
  r('a-heranca', 'lista', [
    { clicar: linha('Fanfarra'), duplo: true },
    { foto: true, destaque: [linha('Telefones dos pais')] },
    { clicar: mais('Telefones dos pais da fanfarra') },
    { clicar: item('Compartilhar') },
    { foto: true, destaque: [`${CAIXA} .nv-secao-caixa:has-text("Pessoas com acesso")`] },
  ]),
  r('onde-isso-aparece', 'lista', [
    { clicar: linha('Fanfarra'), duplo: true },
    { clicar: mais('Telefones dos pais da fanfarra') },
    { clicar: item('Compartilhar') },
    { clicar: `${HERDADO} .nv-revelar` },
    { foto: true, destaque: [HERDADO] },
    { clicar: CONCLUIDO },
    { clicar: mais('Telefones dos pais da fanfarra') },
    { clicar: item('Mover para') },
    { escolher: '[aria-label="Pasta de destino"]', valor: 'raiz' },
    { foto: true, destaque: ['[aria-label="Pasta de destino"]'] },
  ]),

  /* ── Módulo 4 — escrever junto ── */
  r('edicao-simultanea', 'juntos', [
    ...escreverNoFim('rp-3', ' Todos os naipes juntos.'),
    { foto: true, destaque: ['.ed-bolhas', paragrafo('rp-3'), paragrafo('rp-4')] },
  ]),

  /* ── Módulo 5 — comentar ── */
  r('o-comentario', 'repertorio', [
    { foto: true, destaque: [paragrafo('rp-2'), BALAO] },
    { clicar: `${BALAO} textarea` },
    { digitar: 'Pode: a Lívia toca a Marcha no lugar do hino, e o hino fica para o desfile.' },
    { clicar: `${BALAO} button:has-text("Responder")` },
    { foto: true, destaque: [BALAO] },
  ]),
  r('resolver-nao-e-apagar', 'repertorio', [
    { clicar: `${BALAO} textarea` },
    { digitar: 'Pode: a Lívia toca a Marcha no lugar do hino.' },
    { clicar: `${BALAO} button:has-text("Responder")` },
    { foto: true, destaque: [`${BALAO} button:has-text("Resolver")`] },
    { clicar: `${BALAO} button:has-text("Resolver")` },
    { foto: true, destaque: ['[aria-label="Abrir histórico de comentários"]'] },
  ]),

  /* ── Módulo 6 — sugerir ── */
  r('modo-de-sugestao', 'repertorio', [
    { escolher: '[aria-label="Modo de edição"]', valor: 'sugestao' },
    { foto: true, destaque: ['.ed-modo'] },
    ...escreverNoFim('rp-1', ' Em ritmo de marcha lenta.'),
    { foto: true, destaque: [paragrafo('rp-1'), `${BALAO}:has-text("sugeriu")`] },
  ]),
  r('aceitar-todas', 'repertorio', [
    { escolher: '[aria-label="Modo de edição"]', valor: 'sugestao' },
    ...escreverNoFim('rp-1', ' Em ritmo de marcha lenta.'),
    ...escreverNoFim('rp-3', ' Duas vezes, se der tempo.'),
    { clicar: '.ed-menu:has-text("Ferramentas")' },
    { foto: true, destaque: [['.ed-gaveta-item:has-text("Aceitar todas")', '.ed-gaveta-item:has-text("Rejeitar todas")']] },
    { clicar: '.ed-menu:has-text("Ferramentas")' },
    { clicar: `${BALAO}:has-text("sugeriu") >> nth=0 >> button:has-text("Aceitar")` },
    { foto: true, destaque: [paragrafo('rp-1'), `${BALAO}:has-text("sugeriu")`] },
  ]),
  /* ── Módulo 7 — o histórico ── */
  r('o-que-ele-guarda', 'ata', [
    { clicar: ferramenta('Histórico de versões') },
    { foto: true, destaque: [HISTORICO] },
  ]),
  r('restaurar-nao-apaga', 'ata', [
    { clicar: ferramenta('Histórico de versões') },
    { clicar: '.ed-versao:has-text("4 de agosto")' },
    { foto: true, destaque: ['.ed-versao[aria-current="true"]', '.ed-restaurar'] },
    { clicar: '.ed-restaurar button' },
    { foto: true, destaque: ['.ed-versoes'] },
  ]),

  /* ── Módulo 8 — o conflito ── */
  r('onde-ele-nasce', 'conflito', [
    ...escreverNoFim('rp-3', ' Com os tambores na frente.'),
    { clicar: 'button:has-text("Voltar para a nuvem")' },
    { clicar: linha('Fanfarra'), duplo: true },
    { foto: true, destaque: [linha('cópia em conflito')] },
  ]),
  r('como-se-resolve', 'conflito', [
    ...escreverNoFim('rp-3', ' Com os tambores na frente.'),
    { clicar: 'button:has-text("Voltar para a nuvem")' },
    { clicar: linha('Fanfarra'), duplo: true },
    { clicar: linha('cópia em conflito'), duplo: true },
    { foto: true, destaque: [paragrafo('rp-5')] },
    { clicar: 'button:has-text("Voltar para a nuvem")' },
    { clicar: `${linha('cópia em conflito')} [aria-label^="Mais ações de"]` },
    { clicar: item('Mover para a lixeira') },
    { foto: true, destaque: ['.nv-lista'] },
  ]),

  /* ── Módulo 9 — o dono ── */
  r('dono-nao-e-editor', 'lista', [
    { clicar: mais('Uniformes da fanfarra') },
    { clicar: item('Compartilhar') },
    { escolher: '[aria-label="Pessoa"]', valor: 'ronaldo' },
    { escolher: `${CAIXA} .nv-secao-caixa >> nth=0 >> [aria-label="Permissão"]`, valor: 'editor' },
    { clicar: `${CAIXA} button:has-text("Adicionar")` },
    { foto: true, destaque: [`${CAIXA} .nv-secao-caixa:has-text("Pessoas com acesso")`] },
    { escolher: `${CAIXA} .nv-pessoa:has-text("Ronaldo") [aria-label="Permissão"]`, valor: 'transferir' },
    { foto: true, destaque: [`${CAIXA} .nv-secao-caixa:has-text("Pessoas com acesso")`] },
  ]),
];
