import type { Acao, Roteiro } from '../roteiros';

/*
 * CC-ES005 Contas e Segurança Digital, no cofre, na página da conta e no
 * correio do laboratório, com as contas dos Aventureiros Estrela Guia — e não
 * as do Clube Pioneiros que as lições arrumam. O motivo está em
 * `aventureirosEstrelaGuia.ts`.
 */

const V = 'CC-ES005';
const L = 1280;
const A = 800;

/* O cofre */
const item = (servico: string) => `.cf-linha:has-text("${servico}")`;
const MOSTRAR = '[aria-label="Mostrar a senha"]';
const SENHA = '#cf-Senha';
const MEDIDOR = '.cf-medidor >> nth=0';
const AVISO = '.cf-aviso';
const GERAR = '.cf-cartao:has(h3:text-is("Gerar uma senha"))';
const TAMANHO = '[aria-label="Tamanho da senha"]';
const USAR = '.cf-bt:has-text("Usar esta senha")';
const ACESSO = '.cf-cartao:has(h3:text-is("Quem entra nesta conta"))';
const RELATORIO = '.cf-cartao:has(h3:text-is("Relatório do cofre"))';
const problema = (texto: string) => `.cf-problema:has-text("${texto}")`;

/* A conta */
const secao = (nome: string) => `.ct-secao:has-text("${nome}")`;
const cartao = (titulo: string) => `.ct-cartao:has-text("${titulo}")`;
const metodo = (nome: string) => `.ct-metodo:has-text("${nome}")`;
const ATIVAR = '.ct-bt:text-is("Ativar")';
const CONSULTAR = '.ct-bt:has-text("Consultar")';
const ENDERECO = '[aria-label="Endereço a consultar"]';
const DIALOGO = '.ct-dialogo';
const SALVAR = `${DIALOGO} .ct-bt:has-text("Salvar")`;
const ajuste = (nome: string) => `.ct-item:has(.ct-item-nome:text-is("${nome}"))`;
const app = (nome: string) => `.ct-item:has(.ct-item-nome:text-is("${nome}"))`;

/* O correio */
const mensagem = (assunto: string) => `.co-linha:has-text("${assunto}")`;
const REMETENTE = '.co-msg > p >> nth=0';
const LINK = '.co-link';
const DESTINO = '.co-destino';
const VOLTAR = '.co-voltar-lista';

const r = (topico: string, cena: string, acoes: Acao[], altura = A): Roteiro =>
  ({ vereda: V, topico, cena: `aventureiros-${cena}`, largura: L, altura, acoes });

/** Leva o controle de tamanho do gerador até `n`, pelo teclado, como quem arrasta. */
const tamanho = (n: number): Acao[] => [
  { clicar: TAMANHO }, { tecla: 'Home' },
  ...Array.from({ length: n - 6 }, () => ({ tecla: 'ArrowRight' }) as Acao),
];

export const ROTEIROS_DE_CONTAS: Roteiro[] = [
  /* ── Módulo 1 — senha forte e o cofre ── */
  r('o-que-e-senha-forte', 'senhas', [
    ...tamanho(8),
    { foto: true, destaque: [`${GERAR} [aria-label="Senha gerada"]`, `${GERAR} .cf-medidor`, TAMANHO] },
    ...tamanho(24),
    { foto: true, destaque: [`${GERAR} [aria-label="Senha gerada"]`, `${GERAR} .cf-medidor`, TAMANHO] },
  ]),
  r('senha-de-lista', 'senhas', [
    { clicar: item('Caixa da cantina') },
    { clicar: MOSTRAR },
    { foto: true, destaque: [`${item('Caixa da cantina')} .cf-sinal`, SENHA, MEDIDOR] },
    { rolarAte: RELATORIO },
    { foto: true, destaque: [problema('Caixa da cantina')] },
  ]),
  r('gerenciador', 'senhas', [
    { clicar: item('Página na rede social') },
    { clicar: MOSTRAR },
    { foto: true, destaque: [SENHA, AVISO, USAR] },
    { clicar: USAR },
    { foto: true, destaque: [SENHA, MEDIDOR, `${item('Página na rede social')}`] },
  ]),
  r('reutilizar', 'senhas', [
    { foto: true, destaque: [[`${item('E-mail do clube')} .cf-sinal`, `${item('Página na rede social')} .cf-sinal`], AVISO] },
    { rolarAte: RELATORIO },
    { foto: true, destaque: [problema('A mesma senha')] },
  ]),

  /* ── Módulo 2 — duas etapas ── */
  r('os-tres-metodos', 'duas-etapas', [
    { clicar: metodo('aplicativo autenticador') },
    { foto: true, destaque: [[metodo('mensagem de texto'), metodo('Chave de segurança')], ATIVAR] },
  ]),
  r('codigos-de-reserva', 'duas-etapas', [
    { clicar: metodo('aplicativo autenticador') },
    { clicar: ATIVAR },
    { rolarAte: cartao('Códigos de reserva') },
    { foto: true, destaque: [cartao('Códigos de reserva')] },
    { clicar: '.ct-bt:has-text("Baixar os códigos")' },
    { foto: true, destaque: [`${cartao('Códigos de reserva')} .ct-item-diz`] },
  ]),
  r('recuperacao', 'duas-etapas', [
    { rolarAte: cartao('Formas de recuperar a conta') },
    { foto: true, destaque: [ajuste('E-mail de recuperação')] },
    { clicar: `${ajuste('E-mail de recuperação')} .ct-bt` },
    { clicar: '[aria-label="Novo e-mail de recuperação"]' },
    { digitar: 'secretaria@aventureirosestrela.org' },
    { foto: true, destaque: [DIALOGO] },
  ]),

  /* ── Módulo 3 — aplicativos ── */
  r('escopos', 'aplicativos', [
    { clicar: secao('Aplicativos') },
    { foto: true, destaque: [app('Quiz Relâmpago')] },
  ]),
  r('revisar', 'aplicativos', [
    { clicar: secao('Aplicativos') },
    { foto: true, destaque: [[`${app('Agenda das Reuniões')} .ct-item-diz`], [`${app('Quiz Relâmpago')} .ct-item-diz`], [`${app('Cartões de Aniversário')} .ct-item-diz`]] },
    { clicar: '[aria-label="Remover o acesso de Quiz Relâmpago"]' },
    { clicar: '[aria-label="Remover o acesso de Cartões de Aniversário"]' },
    { foto: true, destaque: [app('Agenda das Reuniões')] },
  ]),

  /* ── Módulo 4 — vazamento ── */
  r('o-que-e-vazamento', 'vazamento', [
    { rolarAte: cartao('Verificar se um endereço') },
    { clicar: CONSULTAR },
    /* Com os dois achados embaixo, o cartão passa da dobra: sobe até a
       recuperação, que fica logo acima dele. */
    { rolarAte: cartao('Formas de recuperar a conta') },
    { foto: true, destaque: [ENDERECO, `${cartao('Verificar se um endereço')} .ct-item >> nth=0`] },
  ]),
  r('nada-encontrado', 'vazamento', [
    { rolarAte: cartao('Verificar se um endereço') },
    { clicar: ENDERECO }, { tecla: 'Control+a' }, { digitar: 'secretaria@aventureirosestrela.org' },
    { clicar: CONSULTAR },
    { foto: true, destaque: [`${cartao('Verificar se um endereço')} p.ct-item-diz`] },
  ]),
  r('o-que-fazer', 'vazamento', [
    { foto: true, destaque: [cartao('Senha')] },
    { clicar: '.ct-bt:has-text("Trocar a senha")' },
    { foto: true, destaque: [DIALOGO] },
    { clicar: SALVAR },
    { foto: true, destaque: [`${cartao('Senha')} .ct-diz`] },
  ]),

  /* ── Módulo 5 — privacidade ── */
  r('o-que-decidem', 'privacidade', [
    { clicar: secao('Privacidade') },
    { foto: true, destaque: [[ajuste('Quem pode ver a lista de membros'), ajuste('Quem pode ver os telefones cadastrados')]] },
  ]),
  r('local-nas-fotos', 'privacidade', [
    { clicar: secao('Privacidade') },
    { foto: true, destaque: [ajuste('Publicar o local junto das fotos')] },
    { escolher: '[aria-label="Publicar o local junto das fotos"]', valor: 'não' },
    { foto: true, destaque: [ajuste('Publicar o local junto das fotos')] },
  ]),
  r('ajustar-nao-e-fechar', 'privacidade', [
    { clicar: secao('Privacidade') },
    { clicar: '.ct-bt:has-text("Deixar tudo privado")' },
    { foto: true, destaque: [ajuste('A página do clube aparece em sites de busca')] },
    { escolher: '[aria-label="A página do clube aparece em sites de busca"]', valor: 'sim' },
    { foto: true, destaque: [ajuste('A página do clube aparece em sites de busca'), ajuste('Quem pode ver a lista de membros')] },
  ]),

  /* ── Módulo 6 — mensagem fraudulenta ── */
  r('indicios', 'golpes', [
    { clicar: mensagem('Sua encomenda está retida') },
    { foto: true, destaque: [REMETENTE] },
    { apontar: LINK },
    { foto: true, destaque: [LINK, DESTINO] },
    { clicar: VOLTAR },
    { clicar: mensagem('kit de brinquedos') },
    { foto: true, destaque: ['.co-anexo'] },
  ]),
  r('o-que-nao-e-indicio', 'golpes', [
    { clicar: mensagem('Lanche do passeio') },
    { foto: true, destaque: [REMETENTE, '.co-msg > p >> nth=1'] },
    { clicar: VOLTAR },
    { clicar: mensagem('três reuniões') },
    { apontar: LINK },
    { foto: true, destaque: [LINK, DESTINO] },
  ]),

  /* ── Módulo 7 — a conta invadida ── */
  r('a-ordem', 'invasao', [
    { clicar: secao('Atividade') },
    { foto: true, destaque: [cartao('Aparelhos com sessão aberta')] },
    { clicar: secao('Segurança') },
    { clicar: '.ct-bt:has-text("Trocar a senha")' },
    { clicar: SALVAR },
    { clicar: secao('Atividade') },
    { foto: true, destaque: [cartao('Aparelhos com sessão aberta')] },
  ]),
  r('as-tres-portas', 'invasao', [
    { clicar: '.ct-bt:has-text("Trocar a senha")' },
    { clicar: SALVAR },
    { rolarAte: cartao('Formas de recuperar a conta') },
    { foto: true, destaque: [ajuste('E-mail de recuperação')] },
    { clicar: secao('Aplicativos') },
    { foto: true, destaque: [app('Backup Automático de E-mails')] },
    { clicar: secao('Atividade') },
    { foto: true, destaque: [cartao('Encaminhamento de mensagens')] },
  ]),

  /* ── Módulo 8 — o plano de contas ── */
  r('conta-de-pessoa', 'plano', [
    { clicar: item('Formulário de matrícula') },
    { rolarAte: ACESSO },
    { foto: true, destaque: [`${ACESSO} .cf-dono`] },
    { clicar: `${ACESSO} .cf-bt[data-principal="sim"]` },
    { foto: true, destaque: [`${ACESSO} .cf-dono`] },
  ]),
  r('quem-tem-acesso', 'plano', [
    { rolarAte: ACESSO },
    { foto: true, destaque: [`${ACESSO} .cf-pessoas`] },
    { clicar: `${ACESSO} .cf-bt:has-text("Dar acesso a Paulo")` },
    { foto: true, destaque: [`${ACESSO} .cf-pessoas`] },
  ]),
  r('troca-de-diretoria', 'plano', [
    { clicar: `${ACESSO} .cf-bt:has-text("Dar acesso a Paulo")` },
    { clicar: `${ACESSO} .cf-bt:has-text("Dar acesso a Débora")` },
    { clicar: '[aria-label="Tirar o acesso de Lúcia"]' },
    { rolarAte: ACESSO },
    { foto: true, destaque: [`${ACESSO} .cf-pessoas`] },
    { rolarAte: '.cf-cartao >> nth=0' },
    { clicar: MOSTRAR },
    { clicar: USAR },
    { foto: true, destaque: [SENHA, MEDIDOR] },
  ]),
];
