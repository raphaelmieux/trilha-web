/**
 * O computador dos módulos 7 e 8 da CC-FE007: o repositório da agenda.
 *
 * ── É o mesmo repositório que foi publicado ──────────────────────────────
 * Os arquivos são os da agenda das lições de React, e o último dia da
 * história é o da publicação: a base no `vite.config.ts`, a esteira, e o
 * conserto do `evento.lugar` que o build recusou. Um projeto à parte para o
 * terminal ensinaria que versionar acontece num programa de mentira — é a
 * decisão do almoxarifado da CC006, pelo motivo escrito lá.
 *
 * ── A história chega com quinze, e o quinto dia é o de hoje ──────────────
 * O requisito 5 pede vinte commits em pelo menos cinco dias distintos, e a
 * plataforma não faz o calendário andar. A agenda foi escrita em quatro dias,
 * com quinze commits; a lição é o quinto, com cinco mudanças feitas e não
 * guardadas. Guardar cada uma no seu commit chega aos vinte e aos cinco dias
 * ao mesmo tempo — e o `git add .` que junta as cinco chega aos cinco dias
 * com dezesseis commits, que é a conta que separa um caminho do outro.
 *
 * Os arquivos ficam na raiz, e não numa pasta `src/`, porque é assim que o
 * laboratório de publicação os mostra: é o mesmo repositório nas duas telas.
 */

import { arquivo, pasta, type Commit, type Maquina, type No } from './terminal';
import {
  AGENDA_COM_COMPONENTES, AGENDA_COM_TELAS, AGENDA_NO_COMECO, CARTAO_DE_EVENTO, FERIADOS_COM_API,
  FOLHA_RESPONSIVA, INDEX_DA_AGENDA, MENSAGEM_DE_ERRO, SECAO,
} from './agendaDoClube';
import { CARTAO_COM_ERRO, ENDERECO_DO_SITE, ESTEIRA, PACKAGE_JSON, VITE_CONFIG_COM_BASE, VITE_CONFIG_DE_FABRICA } from './hospedagem';

export const RAIZ_DA_AGENDA = '/home/desbravador/agenda-do-clube';

/** O dia da lição de versionar, e o da lição do README, que vem depois. */
export const HOJE_DO_VERSIONAMENTO_DA_AGENDA = '2026-11-08';
export const HOJE_DO_README_DA_AGENDA = '2026-11-09';

const GITIGNORE = 'node_modules/\n';

type Arquivos = Record<string, string>;

/* As mudanças da noite em que ninguém commitou: cinco, em cinco arquivos, e
   cada uma é um assunto só. É por isso que cada uma pede o seu commit. */
export const MUDANCAS_PENDENTES_DA_AGENDA = {
  'MensagemDeErro.tsx': MENSAGEM_DE_ERRO.replace('<button onClick', '<button type="button" onClick'),
  'estilo.css': `${FOLHA_RESPONSIVA}
:focus-visible {
  outline: 3px solid #1b4d3e;
  outline-offset: 2px;
}
`,
  'Feriados.tsx': FERIADOS_COM_API.replace("'Não deu para buscar os feriados.'", "'Não deu para buscar os feriados. Confira a internet e tente de novo.'"),
  'index.html': INDEX_DA_AGENDA(true).replace('<title>Agenda do Clube</title>', '<title>Agenda do Clube Pioneiros</title>'),
  '.gitignore': `${GITIGNORE}dist/\n`,
} satisfies Arquivos;

/** As mensagens que a solução de referência usa, uma por mudança. */
export const MENSAGENS_DAS_MUDANCAS: Record<keyof typeof MUDANCAS_PENDENTES_DA_AGENDA, string> = {
  'MensagemDeErro.tsx': 'Dá ao botão de tentar de novo o tipo button',
  'estilo.css': 'Mostra onde está o foco de quem navega pelo teclado',
  'Feriados.tsx': 'Diz o que fazer quando os feriados não chegam',
  'index.html': 'Põe o nome do clube no título da página',
  '.gitignore': 'Tira a pasta dist do controle de versão',
};

/** Os quinze commits dos quatro dias de trabalho, do mais velho ao mais novo. */
function historia(): Commit[] {
  const passos: [string, string, Arquivos][] = [
    ['2026-11-02', 'Cria o projeto da agenda com o Vite e o React', {
      'index.html': AGENDA_NO_COMECO['index.html'], 'main.tsx': AGENDA_NO_COMECO['main.tsx'],
      'estilo.css': AGENDA_NO_COMECO['estilo.css'], 'dados.ts': AGENDA_NO_COMECO['dados.ts'],
      'App.tsx': AGENDA_NO_COMECO['App.tsx'], 'package.json': PACKAGE_JSON,
      'vite.config.ts': VITE_CONFIG_DE_FABRICA, '.gitignore': GITIGNORE,
    }],
    ['2026-11-02', 'Monta a tela de início com a lista dos eventos', { 'Inicio.tsx': AGENDA_COM_TELAS['Inicio.tsx'] }],
    ['2026-11-02', 'Monta a tela de cada evento, lida pelo endereço', { 'Evento.tsx': AGENDA_COM_TELAS['Evento.tsx'] }],
    ['2026-11-02', 'Liga as três telas pelas rotas e pelo menu', {
      'App.tsx': AGENDA_COM_TELAS['App.tsx'], 'Feriados.tsx': AGENDA_COM_TELAS['Feriados.tsx'],
    }],
    ['2026-11-03', 'Cria o componente Secao para os blocos das telas', { 'Secao.tsx': SECAO }],
    ['2026-11-03', 'Cria o cartão de evento', { 'CartaoDeEvento.tsx': CARTAO_COM_ERRO }],
    ['2026-11-03', 'Usa a seção e o cartão na tela de início', { 'Inicio.tsx': AGENDA_COM_COMPONENTES['Inicio.tsx'] }],
    ['2026-11-03', 'Usa a seção e o cartão na tela do evento', { 'Evento.tsx': AGENDA_COM_COMPONENTES['Evento.tsx'] }],
    ['2026-11-03', 'Mostra os erros pelo componente MensagemDeErro', {
      'MensagemDeErro.tsx': MENSAGEM_DE_ERRO, 'App.tsx': AGENDA_COM_COMPONENTES['App.tsx'],
      'Feriados.tsx': AGENDA_COM_COMPONENTES['Feriados.tsx'],
    }],
    ['2026-11-05', 'Busca os feriados do ano na BrasilAPI', { 'Feriados.tsx': FERIADOS_COM_API }],
    ['2026-11-05', 'Deixa a lista em uma coluna no celular', { 'estilo.css': FOLHA_RESPONSIVA }],
    ['2026-11-05', 'Põe a meta viewport no index.html', { 'index.html': INDEX_DA_AGENDA(true) }],
    ['2026-11-06', 'Acrescenta a esteira que publica no Pages', { '.github/workflows/publicar.yml': ESTEIRA }],
    ['2026-11-06', 'Corrige o local do evento, que o build recusava', { 'CartaoDeEvento.tsx': CARTAO_DE_EVENTO }],
    ['2026-11-06', 'Publica na pasta do repositório pela base do Vite', { 'vite.config.ts': VITE_CONFIG_COM_BASE }],
  ];
  const commits: Commit[] = [];
  let arvore: Arquivos = {};
  passos.forEach(([data, mensagem, mudou], i) => {
    arvore = { ...arvore, ...Object.fromEntries(Object.entries(mudou).map(([n, t]) => [`${RAIZ_DA_AGENDA}/${n}`, t])) };
    commits.push({ id: `a${i + 1}`, mensagem, arvore, pai: i === 0 ? null : `a${i}`, ramo: 'main', data });
  });
  return commits;
}

export const COMMITS_DA_AGENDA = historia();

/** A pasta, com as subpastas que os caminhos pedem (a esteira mora em .github/workflows). */
function discoCom(arquivos: Arquivos): No {
  const raiz: Record<string, unknown> = {};
  for (const [caminho, texto] of Object.entries(arquivos)) {
    const partes = caminho.split('/');
    let atual = raiz;
    partes.slice(0, -1).forEach(p => { atual = (atual[p] ??= {}) as Record<string, unknown>; });
    atual[partes[partes.length - 1]] = texto;
  }
  const montar = (o: Record<string, unknown>): No => pasta(Object.fromEntries(Object.entries(o)
    .map(([n, v]) => [n, typeof v === 'string' ? arquivo(v) : montar(v as Record<string, unknown>)])));
  return pasta({ home: pasta({ desbravador: pasta({ 'agenda-do-clube': montar(raiz) }) }) });
}

const relativos = (arvore: Arquivos): Arquivos =>
  Object.fromEntries(Object.entries(arvore).map(([c, t]) => [c.slice(RAIZ_DA_AGENDA.length + 1), t]));

const comHistoria = (commits: Commit[], disco: Arquivos, hoje: string): Maquina => ({
  disco: discoCom(disco),
  cwd: RAIZ_DA_AGENDA,
  repo: {
    raiz: RAIZ_DA_AGENDA,
    commits,
    ramos: { main: commits[commits.length - 1].id },
    ramoAtual: 'main',
    preparados: [],
    remoto: null,
    publicado: {},
    aguardando: [],
  },
  historico: [],
  instalados: [],
  hoje,
});

/** O computador do módulo 7: quinze commits em quatro dias, e cinco mudanças por guardar. */
export function computadorDaAgendaVersionamento(): Maquina {
  const ultimo = relativos(COMMITS_DA_AGENDA[COMMITS_DA_AGENDA.length - 1].arvore);
  return comHistoria(COMMITS_DA_AGENDA, { ...ultimo, ...MUDANCAS_PENDENTES_DA_AGENDA }, HOJE_DO_VERSIONAMENTO_DA_AGENDA);
}

/**
 * O computador do módulo 8: o do módulo 7 depois de cada mudança ganhar o seu
 * commit, e um dia depois. O README e o registro das decisões se escrevem
 * sobre o repositório que a pessoa acabou de arrumar.
 */
export function computadorDaAgendaReadme(): Maquina {
  const commits = [...COMMITS_DA_AGENDA];
  let arvore = { ...commits[commits.length - 1].arvore };
  for (const [nome, texto] of Object.entries(MUDANCAS_PENDENTES_DA_AGENDA) as [keyof typeof MUDANCAS_PENDENTES_DA_AGENDA, string][]) {
    arvore = { ...arvore, [`${RAIZ_DA_AGENDA}/${nome}`]: texto };
    commits.push({
      id: `a${commits.length + 1}`, mensagem: MENSAGENS_DAS_MUDANCAS[nome], arvore, pai: commits[commits.length - 1].id,
      ramo: 'main', data: HOJE_DO_VERSIONAMENTO_DA_AGENDA,
    });
  }
  return comHistoria(commits, relativos(arvore), HOJE_DO_README_DA_AGENDA);
}

/* ── O README e o registro das decisões, que são o requisito 6 ─────────────── */

/** O link que o README precisa trazer: é por ele que alguém chega ao site sem baixar nada. */
export const LINK_DO_SITE = ENDERECO_DO_SITE;

/**
 * O que caracteriza uma decisão registrada: ela diz o que se escolheu, por
 * quê, e qual era a outra opção. "Usei cartões" não é decisão, é descrição —
 * a decisão só aparece quando se sabe o que foi descartado. É a regra das
 * decisões justificadas da CC006, e do registro de decisões de arquitetura
 * que as equipes de software escrevem.
 */
export const PALAVRAS_DA_DECISAO = 20;
export const NOMEIA_ALTERNATIVA = /em vez d|no lugar d|ao inv[eé]s d|alternativa|descart|consider|outra op[cç]|tamb[eé]m pensei|pensei em/i;
export const DIZ_O_PORQUE = /porque|para que|\bpois\b|j[aá] que|por causa|assim\b|desse jeito|dessa forma/i;

/** As seções de segundo nível do registro: cada uma é uma decisão. */
export function decisoesDoRegistro(texto: string): { titulo: string; corpo: string }[] {
  const linhas = texto.split('\n');
  const decisoes: { titulo: string; corpo: string }[] = [];
  linhas.forEach((l, i) => {
    if (!/^##\s+\S/.test(l)) return;
    const fim = linhas.findIndex((x, j) => j > i && /^#{1,2}\s/.test(x));
    decisoes.push({ titulo: l.replace(/^##\s+/, '').trim(), corpo: linhas.slice(i + 1, fim < 0 ? undefined : fim).join('\n').trim() });
  });
  return decisoes;
}

const palavras = (s: string) => s.split(/\s+/).filter(Boolean).length;

export const decisaoCompleta = (d: { corpo: string }) =>
  palavras(d.corpo) >= PALAVRAS_DA_DECISAO && NOMEIA_ALTERNATIVA.test(d.corpo) && DIZ_O_PORQUE.test(d.corpo);

/** O README e o registro como a solução de referência os escreve. */
export const README_DA_AGENDA = `# Agenda do Clube

## Descrição

A Agenda do Clube mostra os próximos eventos do Clube Pioneiros, a tela de cada evento e os feriados nacionais do ano, para os desbravadores e as famílias consultarem pelo celular.

Está no ar em ${LINK_DO_SITE}

## Instalação

Precisa do Node.js 20 ou mais novo. Depois de baixar o repositório, rode \`npm install\` na pasta dele.

## Uso

\`npm run dev\` abre a agenda no navegador, em http://localhost:5173. \`npm run build\` constrói a pasta dist, que é o que a esteira publica.
`;

export const DECISOES_DA_AGENDA = `# Decisões de interface

## A lista vira uma coluna no celular

Na tela do celular, três colunas deixavam cada cartão com dois centímetros de largura. Considerei rolar de lado, e descartei porque ninguém descobre que a lista continua para a direita.

## O menu fica no topo, e não numa gaveta

Com duas telas no menu, uma gaveta escondida atrás de um ícone esconderia metade da agenda. Ficou no topo, porque assim os dois links aparecem sempre, em vez de esperar alguém abrir.

## O erro dos feriados tem botão de tentar de novo

Quando a BrasilAPI não responde, a tela diz o que houve e oferece outra tentativa. A alternativa era recarregar a página inteira, e ficou de fora porque perde o lugar onde a pessoa estava.
`;
