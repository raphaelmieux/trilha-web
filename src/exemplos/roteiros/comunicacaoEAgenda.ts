import type { Acao, Roteiro } from '../roteiros';

/*
 * CC-ES007 Comunicação e Agenda, no correio, no calendário e na sala do
 * laboratório, com a fanfarra do clube — e não o acampamento que as lições
 * preparam. O motivo está em `fanfarraDoClube.ts`.
 */

const V = 'CC-ES007';
const L = 1280;
const A = 800;

/* O correio */
const linha = (assunto: string) => `.co-linha:has-text("${assunto}")`;
const ENDERECOS = '.co-cabecalho-enderecos';
const ESCREVER = '[aria-label="Escrever"]';
const JANELINHA = '.co-janelinha';
const COPIAS = '.co-copias:has-text("Cc")';
const trazer = (campo: string, grupo: string) => `[aria-label="No ${campo}, trazer ${grupo}"]`;
const campo = (rotulo: string) => `${JANELINHA} .co-linha-campo:has(.co-rotulo:text-is("${rotulo}"))`;
const ASSUNTO = `${JANELINHA} input[aria-label="Assunto"]`;
const TEXTO = '[aria-label="Mensagem"]';
const ENVIAR = `${JANELINHA} .co-bt.primario`;
const CONFIGURACOES = '.co-topo [aria-label="Configurações"]';
const aba = (nome: string) => `.co-aba:has-text("${nome}")`;
const BOTAO = (texto: string) => `.co-bt:has-text("${texto}")`;
const BUSCA = '[aria-label="Pesquisar no correio"]';

/* O calendário */
const chip = (titulo: string) => `[aria-label="Abrir: ${titulo}"]`;
const linhaDaCaixa = (rotulo: string) => `.ca-linha-caixa:has([aria-label="${rotulo}"])`;
const CAIXA = '.ca-caixa';
const btCal = (texto: string) => `.ca-bt:has-text("${texto}")`;

/* A sala */
const btSala = (texto: string) => `.re-bt:has-text("${texto}")`;

const r = (topico: string, cena: string, acoes: Acao[]): Roteiro =>
  ({ vereda: V, topico, cena: `fanfarra-${cena}`, largura: L, altura: A, acoes });

/** Abre a janelinha de escrever e escreve assunto e texto. */
const escrever = (assunto: string, texto: string): Acao[] => [
  { clicar: ESCREVER },
  { clicar: ASSUNTO }, { digitar: assunto },
  { clicar: TEXTO }, { digitar: texto },
];

export const ROTEIROS_DA_COMUNICACAO: Roteiro[] = [
  /* ── Módulo 1 — cópia oculta ── */
  r('os-tres-campos', 'correio', [
    { clicar: linha('Encontro de Fanfarras') },
    { foto: true, destaque: [ENDERECOS] },
    { clicar: BOTAO('Voltar') },
    { clicar: ESCREVER },
    { clicar: COPIAS },
    { clicar: trazer('Cco', 'os clubes da região') },
    { foto: true, destaque: [campo('Cco')] },
  ]),
  r('quando-cco-e-errado', 'correio', [
    { clicar: ESCREVER },
    { clicar: trazer('Para', 'a fanfarra') },
    { foto: true, destaque: [campo('Para')] },
  ]),

  /* ── Módulo 2 — a mensagem que se entende ── */
  r('o-assunto', 'correio', [
    ...escrever('Fanfarra — lista de instrumentos até sexta', ''),
    { foto: true, destaque: [ASSUNTO] },
  ]),
  r('pedido-saudacao-assinatura', 'correio', [
    { clicar: CONFIGURACOES },
    { clicar: '[aria-label="Assinatura"]' },
    { digitar: 'Lúcia Campos\nSecretaria do Clube Pioneiros' },
    { foto: true, destaque: ['[aria-label="Assinatura"]'] },
    { clicar: BOTAO('Voltar') },
    { clicar: ESCREVER },
    { clicar: `${campo('Para')} input` }, { digitar: 'valter.regente@exemplo.com' }, { tecla: 'Enter' },
    { clicar: ASSUNTO }, { digitar: 'Fanfarra — lista de instrumentos até sexta' },
    { clicar: TEXTO }, { digitar:
      'Olá, Tio Válter!\n\nPeço que me confirme até sexta quem toca cada instrumento no desfile.' },
    { foto: true, destaque: [TEXTO, '.co-assinatura'] },
  ]),

  /* ── Módulo 3 — o arquivo pesado ── */
  r('o-peso-multiplica', 'correio', [
    ...escrever('Gravação do ensaio geral', 'Segue a gravação do ensaio para todos ouvirem.'),
    { clicar: '[aria-label="Anexar arquivo"]' },
    { clicar: ENVIAR },
    { foto: true, destaque: [`${JANELINHA} .co-vinculo`, `${JANELINHA} .co-aviso`] },
  ]),
  r('o-vinculo-que-ninguem-abre', 'correio', [
    ...escrever('Gravação do ensaio geral', 'A gravação está na pasta do clube.'),
    { clicar: '[aria-label="Inserir vínculo de arquivo"]' },
    { foto: true, destaque: [`${JANELINHA} .co-vinculo`] },
    { clicar: `${JANELINHA} .co-vinculo .co-bt:has-text("Mudar quem abre")` },
    { foto: true, destaque: [`${JANELINHA} .co-vinculo`] },
  ]),

  /* ── Módulo 4 — a caixa que se usa ── */
  r('arquivar-nao-e-excluir', 'correio', [
    { clicar: linha('Baquetas novas') },
    { foto: true, destaque: [BOTAO('Arquivar'), BOTAO('Excluir')] },
    { clicar: BOTAO('Arquivar') },
    { clicar: BOTAO('Voltar') },
    { clicar: BUSCA }, { digitar: 'violão' },
    { foto: true, destaque: [BUSCA, linha('Empréstimo do violão')] },
  ]),
  r('a-entrada-e-uma-lista', 'correio', [
    { foto: true, destaque: [linha('Baquetas novas'), linha('Horário dos ensaios')] },
    { clicar: linha('Baquetas novas') }, { clicar: BOTAO('Arquivar') }, { clicar: BOTAO('Voltar') },
    { clicar: linha('Horário dos ensaios') }, { clicar: BOTAO('Arquivar') }, { clicar: BOTAO('Voltar') },
    { foto: true, destaque: ['.co-lista'] },
  ]),

  /* ── Módulo 5 — a lista ── */
  r('o-que-uma-lista-e', 'correio', [
    { clicar: CONFIGURACOES },
    { clicar: aba('Listas') },
    { foto: true, destaque: ['.co-bloco-lista >> nth=0'] },
  ]),
  r('a-lista-envelhece', 'correio', [
    { clicar: CONFIGURACOES },
    { clicar: aba('Listas') },
    { foto: true, destaque: ['[aria-label="Caio Mendes na Fanfarra"]', '[aria-label="Lívia Torres na Fanfarra"]'] },
    { clicar: '[aria-label="Caio Mendes na Fanfarra"]' },
    { clicar: '[aria-label="Lívia Torres na Fanfarra"]' },
    { foto: true, destaque: ['.co-bloco-lista >> nth=0'] },
  ]),

  /* ── Módulo 6 — a ausência ── */
  r('para-quem-ela-e', 'correio', [
    { clicar: CONFIGURACOES },
    { clicar: aba('Resposta automática') },
    { clicar: '[aria-label="Ligar a resposta automática"]' },
    { preencher: '[aria-label="Primeiro dia"]', valor: '2026-07-13' },
    { preencher: '[aria-label="Último dia"]', valor: '2026-07-24' },
    { clicar: '[aria-label="Texto da resposta automática"]' },
    { digitar: 'Estou fora da secretaria até 24/07. Para assuntos da fanfarra, '
      + 'fale com a Tia Denise: denise.fanfarra@exemplo.com.' },
    { foto: true, destaque: ['[aria-label="Último dia"]', '[aria-label="Texto da resposta automática"]'] },
  ]),
  r('o-que-nao-contar', 'correio', [
    { clicar: CONFIGURACOES },
    { clicar: aba('Resposta automática') },
    { clicar: '[aria-label="Responder só a quem está nos contatos"]' },
    { foto: true, destaque: ['.co-membro:has([aria-label="Responder só a quem está nos contatos"])'] },
  ]),

  /* ── Módulo 7 — o evento ── */
  r('local-horario-descricao', 'calendario', [
    { clicar: chip('Ensaio geral do desfile') },
    { foto: true, destaque: [linhaDaCaixa('Começa às'), linhaDaCaixa('Local'), linhaDaCaixa('Descrição')] },
  ]),
  r('o-fuso', 'calendario', [
    { clicar: chip('Conversa com a fanfarra de Rio Branco') },
    { foto: true, destaque: [linhaDaCaixa('Começa às'), `${CAIXA} .ca-linha-caixa:has(.ca-dica) >> nth=0`] },
  ]),

  /* ── Módulo 8 — o convite ── */
  r('o-que-um-convite-faz', 'calendario', [
    { clicar: chip('Ensaio geral do desfile') },
    { rolarAte: `${CAIXA} .ca-linha-caixa:has-text("Ver as respostas")` },
    { foto: true, destaque: [`${CAIXA} .ca-linha-caixa:has-text("Ver as respostas")`] },
  ]),
  r('aguardando-nao-e-sim', 'calendario', [
    { clicar: chip('Ensaio geral do desfile') },
    { rolarAte: `${CAIXA} .ca-linha-caixa:has-text("Ver as respostas")` },
    { foto: true, destaque: ['.ca-fila:has-text("denise.fanfarra@exemplo.com")', '.ca-fila:has-text("otavio.reis@exemplo.co ")'] },
    { clicar: '[aria-label="Corrigir o endereço de otavio.reis@exemplo.co"]' },
    { foto: true, destaque: ['.ca-fila:has-text("otavio.reis@exemplo.com")'] },
  ]),

  /* ── Módulo 9 — o que se repete ── */
  r('a-serie', 'calendario', [
    { foto: true, destaque: [[`${chip('Ensaio da fanfarra')} >> nth=0`, `${chip('Ensaio da fanfarra')} >> nth=4`]] },
    { clicar: `${chip('Ensaio da fanfarra')} >> nth=0` },
    { foto: true, destaque: [linhaDaCaixa('Repetir toda semana')] },
  ]),
  r('as-tres-opcoes', 'calendario', [
    { clicar: `${chip('Ensaio da fanfarra')} >> nth=0` },
    { clicar: btCal('Excluir') },
    { foto: true, destaque: ['.ca-dialogo'] },
  ]),

  /* ── Módulo 10 — o calendário compartilhado ── */
  r('os-quatro-niveis', 'calendario', [
    { clicar: '[aria-label="Opções de Fanfarra do clube"]' },
    { escolher: '[aria-label="A quem dar acesso"]', valor: 'valter.regente@exemplo.com' },
    { escolher: '[aria-label="Com que nível"]', valor: 'alterar' },
    { clicar: btCal('Dar acesso') },
    { escolher: '[aria-label="A quem dar acesso"]', valor: 'bianca.lopes@exemplo.com' },
    { escolher: '[aria-label="Com que nível"]', valor: 'ver-detalhes' },
    { clicar: btCal('Dar acesso') },
    { foto: true, destaque: [CAIXA] },
  ]),
  r('a-grade-responde-o-que-consultou', 'calendario', [
    { clicar: chip('Ensaio geral do desfile') },
    { clicar: btCal('Ver a disponibilidade') },
    { rolarAte: '.ca-disp' },
    { foto: true, destaque: ['.ca-disp tr:has-text("Otávio Reis")'] },
    { clicar: '[aria-label="Perguntar a Otávio Reis"]' },
    { foto: true, destaque: [`${CAIXA} .ca-aviso`] },
  ]),

  /* ── Módulo 11 — a reunião ── */
  r('conduzir', 'sala', [
    { clicar: btSala('Agendar no calendário') },
    { foto: true, destaque: ['.re-faixa'] },
    { clicar: btSala('Entrar agora') },
    { clicar: '[aria-label="Falar"]' },
    { foto: true, destaque: ['.re-faixa:has-text("quer entrar")', '.re-faixa:has-text("microfone fechado")', '[aria-label="Abrir o microfone"]'] },
  ]),
  r('compartilhar-a-tela', 'sala', [
    { clicar: btSala('Entrar agora') },
    { clicar: btSala('Apresentar agora') },
    { foto: true, destaque: ['.re-abas', '.re-dialogo .re-nota'] },
    { clicar: '.re-dialogo [data-principal="sim"]' },
    { foto: true, destaque: ['.re-faixa:has-text("notificação")'] },
  ]),

  /* ── Módulo 12 — a pauta e a ata ── */
  r('a-pauta', 'correio', [
    { clicar: ESCREVER },
    { clicar: trazer('Para', 'a fanfarra') },
    { clicar: ASSUNTO }, { digitar: 'Pauta da reunião da fanfarra de 10 de julho' },
    { clicar: TEXTO },
    { digitar: 'Olá, fanfarra!\n\nPauta da reunião:\n1. Repertório do Encontro de Fanfarras\n'
      + '2. Conserto da tuba\n3. Escala de quem leva os instrumentos' },
    { foto: true, destaque: [ASSUNTO, TEXTO] },
  ]),
  r('a-ata', 'correio', [
    { clicar: ESCREVER },
    { clicar: trazer('Para', 'a fanfarra') },
    { clicar: ASSUNTO }, { digitar: 'Ata da reunião da fanfarra de 10 de julho' },
    { clicar: TEXTO },
    { digitar: 'Decisões:\nTio Válter escolhe as três músicas do Encontro até dia 17.\n'
      + 'Tia Denise leva a tuba ao conserto até sexta.\nBianca monta a escala dos instrumentos até dia 14.' },
    { foto: true, destaque: [TEXTO] },
  ]),
];
