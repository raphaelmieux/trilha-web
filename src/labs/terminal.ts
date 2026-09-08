/**
 * O computador de linha de comando da CC003: arquivos, e um repositório.
 *
 * ── Por que isto não é uma linguagem a mais do editor ────────────────────
 * As outras veredas escrevem um arquivo e o validador o lê. Aqui não há
 * arquivo para escrever nem linguagem para realçar: o que se confere é o
 * **estado de um computador** depois de uma sequência de comandos — onde a
 * pessoa está, o que existe em disco, e o que ficou registrado no histórico.
 *
 * É o mesmo motivo pelo qual `ambiente` virou um tipo de lição próprio, e está
 * escrito lá: enfiar isto em `laboratorio` obrigaria a inventar um `modelo: ''`
 * e uma linguagem falsa, e a trava dos modelos passaria a conferir uma string
 * vazia com o validador de HTML — verde sem ter olhado nada.
 *
 * ── E por que o motor mora fora do componente ────────────────────────────
 * Um shell é um monte de casos, e cada um deles erra em silêncio: `cp` que
 * move em vez de copiar, `rm` que apaga a pasta errada, `git commit` que aceita
 * sem nada preparado. Nada disso aparece na tela como erro — aparece como uma
 * tarefa que não fica verde, ou pior, como uma que fica.
 *
 * Aqui é tudo função pura sobre um estado: `rodar(maquina, linha)` devolve a
 * máquina nova e o que o terminal escreveu. `terminal.test.ts` exercita cada
 * comando sem montar tela nenhuma.
 *
 * ── O que ele imita, e o que não ─────────────────────────────────────────
 * O bastante do bash e do git para os requisitos 4, 5 e 6 — e nada além. Não
 * há pipe, redirecionamento, glob nem `sudo`, porque nenhum dos três está no
 * documento e cada um deles é uma promessa que a simulação não cumpriria.
 *
 * O que ele **precisa** aguentar é curiosidade: comando que existe e não faz
 * parte do exercício responde dizendo isso, e comando que não existe responde
 * como o shell responde — `command not found`. Silêncio ensina que o terminal
 * é um trilho, e ele não é.
 */

/* ── O disco ───────────────────────────────────────────────────────────────── */

export interface No {
  tipo: 'arquivo' | 'pasta';
  /** Só arquivo. Pasta guarda os filhos em `filhos`. */
  conteudo?: string;
  filhos?: Record<string, No>;
}

export const pasta = (filhos: Record<string, No> = {}): No => ({ tipo: 'pasta', filhos });
export const arquivo = (conteudo = ''): No => ({ tipo: 'arquivo', conteudo });

/* ── O repositório ─────────────────────────────────────────────────────────── */

export interface Commit {
  id: string;
  mensagem: string;
  /** O disco inteiro no momento do commit, para o log poder dizer o que mudou. */
  arvore: Record<string, string>;
  pai: string | null;
  /*
    Em que ramo ele nasceu.

    O git de verdade não guarda isto — o ramo é um ponteiro, e a história não
    lembra por onde passou. Aqui ele é guardado porque a verificação precisa:
    "alterar código no ramo" não se distingue de "commitar no main" olhando só
    a corrente de pais, e sem isso a tarefa aceitaria um ramo criado e
    abandonado.
  */
  ramo: string;
  /** O commit veio de uma mesclagem? O log precisa saber. */
  mesclagem?: boolean;
}

export interface Repositorio {
  /** Onde ele foi iniciado, em caminho absoluto. */
  raiz: string;
  commits: Commit[];
  /** Ramo → id do commit em que ele está. */
  ramos: Record<string, string | null>;
  ramoAtual: string;
  /** Caminhos preparados por `git add`, relativos à raiz. */
  preparados: string[];
  /** Endereço do remoto, quando houver. */
  remoto: string | null;
  /** O que o remoto já recebeu: ramo → id do commit. */
  publicado: Record<string, string>;
  /** Commits que chegaram do remoto e ainda não foram trazidos. */
  aguardando: Commit[];
}

export interface Maquina {
  disco: No;
  /** Diretório de trabalho, absoluto. */
  cwd: string;
  repo: Repositorio | null;
  /** O que a pessoa já digitou, para a seta para cima. */
  historico: string[];
}

const HOME = '/home/desbravador';

/*
  O computador de onde se parte, e ele é sempre o mesmo.

  O ponto de partida não vem do currículo, pela razão que o laboratório de
  ambiente já registrou: um currículo que pudesse descrever o disco poderia
  descrevê-lo com o repositório já iniciado, que é justamente o laboratório que
  abre resolvido.

  A pasta `projeto-do-clube` tem conteúdo de verdade e um arquivo oculto,
  porque o requisito 4 pede listar os ocultos — e uma pasta sem nenhum deixaria
  `ls -a` sem nada para mostrar que `ls` não mostrasse.
*/
export function maquinaInicial(): Maquina {
  return {
    disco: pasta({
      home: pasta({
        desbravador: pasta({
          'projeto-do-clube': pasta({
            'lista.py': arquivo('nomes = ["Ana", "Bruno", "Clara"]\n\nfor n in nomes:\n    print(n)\n'),
            'leiame.txt': arquivo('Programa da lista de presença da unidade.\n'),
            '.oculto': arquivo('Arquivo que começa com ponto não aparece no ls comum.\n'),
          }),
          documentos: pasta({
            'ata-da-reuniao.txt': arquivo('Reunião de sábado: definido o acampamento de julho.\n'),
          }),
        }),
      }),
    }),
    cwd: HOME,
    repo: null,
    historico: [],
  };
}

/* ── Caminhos ──────────────────────────────────────────────────────────────── */

/**
 * Resolve um caminho como o shell resolve.
 *
 * É aqui que mora a distinção que o requisito 2 manda definir: começar com `/`
 * é absoluto e ignora onde você está; qualquer outra coisa é relativo e parte
 * do diretório atual. `..` sobe, `.` fica, `~` é a casa.
 */
export function resolver(cwd: string, caminho: string): string {
  if (caminho === '') return cwd;
  const base = caminho.startsWith('/') ? []
    : caminho === '~' || caminho.startsWith('~/') ? HOME.split('/').filter(Boolean)
      : cwd.split('/').filter(Boolean);
  const resto = (caminho.startsWith('~') ? caminho.slice(1) : caminho).split('/').filter(Boolean);
  const partes = [...base];
  for (const p of resto) {
    if (p === '.') continue;
    if (p === '..') partes.pop();
    else partes.push(p);
  }
  return `/${partes.join('/')}`;
}

const partesDe = (caminho: string) => caminho.split('/').filter(Boolean);

export function achar(disco: No, caminho: string): No | null {
  let atual: No | undefined = disco;
  for (const p of partesDe(caminho)) {
    if (!atual || atual.tipo !== 'pasta') return null;
    atual = atual.filhos?.[p];
  }
  return atual ?? null;
}

/** Cópia profunda: o estado é imutável, e mutar em silêncio some com o desfazer. */
function clonar(no: No): No {
  return no.tipo === 'arquivo'
    ? { tipo: 'arquivo', conteudo: no.conteudo }
    : { tipo: 'pasta', filhos: Object.fromEntries(Object.entries(no.filhos ?? {}).map(([k, v]) => [k, clonar(v)])) };
}

/** Põe (ou tira, com `null`) um nó num caminho, devolvendo o disco novo. */
function escrever(disco: No, caminho: string, no: No | null): No {
  const partes = partesDe(caminho);
  const novo = clonar(disco);
  let atual = novo;
  for (const p of partes.slice(0, -1)) {
    const proximo = atual.filhos?.[p];
    if (!proximo || proximo.tipo !== 'pasta') return disco;
    atual = proximo;
  }
  const nome = partes[partes.length - 1];
  if (!atual.filhos) return disco;
  if (no === null) delete atual.filhos[nome];
  else atual.filhos[nome] = no;
  return novo;
}

/** Todos os arquivos sob um caminho, como caminho absoluto → conteúdo. */
export function arquivosSob(disco: No, raiz: string): Record<string, string> {
  const achados: Record<string, string> = {};
  const no = achar(disco, raiz);
  if (!no) return achados;
  const andar = (n: No, caminho: string) => {
    if (n.tipo === 'arquivo') { achados[caminho] = n.conteudo ?? ''; return; }
    for (const [nome, filho] of Object.entries(n.filhos ?? {})) andar(filho, `${caminho}/${nome}`);
  };
  andar(no, raiz);
  return achados;
}

/* ── O resultado de um comando ─────────────────────────────────────────────── */

export interface Resposta {
  maquina: Maquina;
  /** O que o terminal escreveu. Vazio é sucesso silencioso, como no shell. */
  saida: string;
}

const erro = (m: Maquina, texto: string): Resposta => ({ maquina: m, saida: texto });
const ok = (m: Maquina, saida = ''): Resposta => ({ maquina: m, saida });

/*
  Comandos que existem no shell de verdade e não fazem parte do exercício.

  Responder "command not found" a eles seria mentira — eles existem —, e ficar
  em silêncio ensinaria que o terminal é um trilho. Então o laboratório diz o
  que são, e diz que não são daqui.
*/
const FORA_DO_EXERCICIO: Record<string, string> = {
  sudo: 'executa um comando como administrador',
  chmod: 'muda a permissão de um arquivo',
  grep: 'procura texto dentro de arquivos',
  nano: 'abre um editor de texto dentro do terminal',
  vim: 'abre um editor de texto dentro do terminal',
  curl: 'baixa coisas da internet',
  ssh: 'entra noutro computador pela rede',
  man: 'mostra o manual de um comando',
};

/** Reparte a linha em palavras, respeitando aspas — `commit -m "mensagem"`. */
export function palavras(linha: string): string[] {
  const achadas: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(linha))) achadas.push(m[1] ?? m[2] ?? m[3]);
  return achadas;
}

/* ── Os comandos de arquivo ────────────────────────────────────────────────── */

const nomeDe = (caminho: string) => partesDe(caminho).pop() ?? '';
const paiDe = (caminho: string) => `/${partesDe(caminho).slice(0, -1).join('/')}`;

function listar(m: Maquina, args: string[]): Resposta {
  const mostrarOcultos = args.some(a => a.startsWith('-') && a.includes('a'));
  const alvo = resolver(m.cwd, args.find(a => !a.startsWith('-')) ?? '');
  const no = achar(m.disco, alvo);
  if (!no) return erro(m, `ls: não foi possível acessar '${args.find(a => !a.startsWith('-'))}': arquivo ou diretório inexistente`);
  if (no.tipo === 'arquivo') return ok(m, nomeDe(alvo));
  const nomes = Object.keys(no.filhos ?? {})
    .filter(n => mostrarOcultos || !n.startsWith('.'))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  /* O ls de verdade também lista . e .. com -a, e é por eles que se descobre
     que ".." não é enfeite de caminho: é uma entrada do diretório. */
  const comPontos = mostrarOcultos ? ['.', '..', ...nomes] : nomes;
  return ok(m, comPontos.join('  '));
}

function entrar(m: Maquina, args: string[]): Resposta {
  const alvo = resolver(m.cwd, args[0] ?? '~');
  const no = achar(m.disco, alvo);
  if (!no) return erro(m, `cd: ${args[0]}: arquivo ou diretório inexistente`);
  if (no.tipo !== 'pasta') return erro(m, `cd: ${args[0]}: não é um diretório`);
  return ok({ ...m, cwd: alvo });
}

function ver(m: Maquina, args: string[]): Resposta {
  if (!args[0]) return erro(m, 'cat: falta o nome do arquivo');
  const alvo = resolver(m.cwd, args[0]);
  const no = achar(m.disco, alvo);
  if (!no) return erro(m, `cat: ${args[0]}: arquivo ou diretório inexistente`);
  if (no.tipo === 'pasta') return erro(m, `cat: ${args[0]}: é um diretório`);
  return ok(m, (no.conteudo ?? '').replace(/\n$/, ''));
}

function criarPasta(m: Maquina, args: string[]): Resposta {
  const nomes = args.filter(a => !a.startsWith('-'));
  if (nomes.length === 0) return erro(m, 'mkdir: falta o nome do diretório');
  let disco = m.disco;
  for (const nome of nomes) {
    const alvo = resolver(m.cwd, nome);
    if (achar(disco, alvo)) return erro(m, `mkdir: não foi possível criar o diretório '${nome}': arquivo existe`);
    if (!achar(disco, paiDe(alvo))) return erro(m, `mkdir: não foi possível criar o diretório '${nome}': arquivo ou diretório inexistente`);
    disco = escrever(disco, alvo, pasta());
  }
  return ok({ ...m, disco });
}

function criarArquivo(m: Maquina, args: string[]): Resposta {
  if (args.length === 0) return erro(m, 'touch: falta o nome do arquivo');
  let disco = m.disco;
  for (const nome of args) {
    const alvo = resolver(m.cwd, nome);
    if (achar(disco, alvo)) continue;   /* touch em arquivo existente não apaga nada */
    if (!achar(disco, paiDe(alvo))) return erro(m, `touch: não foi possível criar '${nome}': arquivo ou diretório inexistente`);
    disco = escrever(disco, alvo, arquivo());
  }
  return ok({ ...m, disco });
}

/** Destino de `cp` e `mv`: se for pasta existente, o arquivo entra nela. */
function destinoReal(m: Maquina, origem: string, destino: string): string {
  const no = achar(m.disco, destino);
  return no?.tipo === 'pasta' ? `${destino}/${nomeDe(origem)}` : destino;
}

function copiar(m: Maquina, args: string[]): Resposta {
  const recursivo = args.some(a => a.startsWith('-') && /[rR]/.test(a));
  const [de, para] = args.filter(a => !a.startsWith('-'));
  if (!de || !para) return erro(m, 'cp: falta o arquivo de origem ou o de destino');
  const origem = resolver(m.cwd, de);
  const no = achar(m.disco, origem);
  if (!no) return erro(m, `cp: não foi possível abrir '${de}': arquivo ou diretório inexistente`);
  if (no.tipo === 'pasta' && !recursivo) return erro(m, `cp: -r não informado; omitindo o diretório '${de}'`);
  const alvo = destinoReal(m, origem, resolver(m.cwd, para));
  if (!achar(m.disco, paiDe(alvo))) return erro(m, `cp: não foi possível criar '${para}': arquivo ou diretório inexistente`);
  return ok({ ...m, disco: escrever(m.disco, alvo, clonar(no)) });
}

function mover(m: Maquina, args: string[]): Resposta {
  const [de, para] = args.filter(a => !a.startsWith('-'));
  if (!de || !para) return erro(m, 'mv: falta o arquivo de origem ou o de destino');
  const origem = resolver(m.cwd, de);
  const no = achar(m.disco, origem);
  if (!no) return erro(m, `mv: não foi possível mover '${de}': arquivo ou diretório inexistente`);
  const alvo = destinoReal(m, origem, resolver(m.cwd, para));
  if (!achar(m.disco, paiDe(alvo))) return erro(m, `mv: não foi possível mover '${de}': arquivo ou diretório inexistente`);
  const disco = escrever(escrever(m.disco, alvo, clonar(no)), origem, null);
  return ok({ ...m, disco });
}

function remover(m: Maquina, args: string[]): Resposta {
  const recursivo = args.some(a => a.startsWith('-') && /[rR]/.test(a));
  const nomes = args.filter(a => !a.startsWith('-'));
  if (nomes.length === 0) return erro(m, 'rm: falta o nome do arquivo');
  let disco = m.disco;
  let cwd = m.cwd;
  for (const nome of nomes) {
    const alvo = resolver(cwd, nome);
    const no = achar(disco, alvo);
    if (!no) return erro(m, `rm: não foi possível remover '${nome}': arquivo ou diretório inexistente`);
    if (no.tipo === 'pasta' && !recursivo) return erro(m, `rm: não foi possível remover '${nome}': é um diretório`);
    disco = escrever(disco, alvo, null);
    /* Apagar a pasta em que se está deixaria o prompt apontando para o nada.
       O shell de verdade deixa; aqui a pessoa não teria como voltar. */
    if (cwd === alvo || cwd.startsWith(`${alvo}/`)) cwd = paiDe(alvo);
  }
  return ok({ ...m, disco, cwd });
}

/* ── O Git ─────────────────────────────────────────────────────────────────── */

const proximoId = (repo: Repositorio) => `c${repo.commits.length + 1}`.padEnd(2, '0');

const commitDe = (repo: Repositorio, id: string | null) =>
  repo.commits.find(c => c.id === id) ?? null;

/** Onde o ramo atual está, como árvore de arquivos. */
function arvoreDoRamo(repo: Repositorio): Record<string, string> {
  return commitDe(repo, repo.ramos[repo.ramoAtual])?.arvore ?? {};
}

/** O que mudou no disco em relação ao último commit. */
export function mudancas(m: Maquina): { modificados: string[]; novos: string[]; apagados: string[] } {
  const repo = m.repo;
  if (!repo) return { modificados: [], novos: [], apagados: [] };
  const agora = arquivosSob(m.disco, repo.raiz);
  const antes = arvoreDoRamo(repo);
  const modificados: string[] = [];
  const novos: string[] = [];
  for (const [caminho, texto] of Object.entries(agora)) {
    if (!(caminho in antes)) novos.push(caminho);
    else if (antes[caminho] !== texto) modificados.push(caminho);
  }
  const apagados = Object.keys(antes).filter(c => !(c in agora));
  return { modificados: modificados.sort(), novos: novos.sort(), apagados: apagados.sort() };
}

const relativo = (repo: Repositorio, caminho: string) =>
  caminho.startsWith(`${repo.raiz}/`) ? caminho.slice(repo.raiz.length + 1) : caminho;

function git(m: Maquina, args: string[]): Resposta {
  const [sub, ...resto] = args;
  const repo = m.repo;

  if (!sub) return erro(m, 'uso: git <comando> [<argumentos>]');

  if (sub === 'init') {
    if (repo && repo.raiz === m.cwd) return erro(m, `Repositório Git já existente em ${m.cwd}/.git/`);
    return ok({
      ...m,
      repo: {
        raiz: m.cwd,
        commits: [],
        ramos: { main: null },
        ramoAtual: 'main',
        preparados: [],
        remoto: null,
        publicado: {},
        aguardando: [],
      },
    }, `Repositório Git vazio inicializado em ${m.cwd}/.git/`);
  }

  if (!repo) return erro(m, 'fatal: não é um repositório git (nem nenhum diretório-pai)');

  if (sub === 'status') {
    const { modificados, novos, apagados } = mudancas(m);
    const linhas = [`No ramo ${repo.ramoAtual}`];
    if (repo.preparados.length > 0) {
      linhas.push('', 'Mudanças a serem submetidas:');
      for (const c of repo.preparados) linhas.push(`\tmodificado: ${relativo(repo, c)}`);
    }
    const naoPreparados = [...modificados, ...novos, ...apagados]
      .filter(c => !repo.preparados.includes(c));
    if (naoPreparados.length > 0) {
      linhas.push('', 'Mudanças não preparadas / arquivos não rastreados:');
      for (const c of naoPreparados) linhas.push(`\t${relativo(repo, c)}`);
    }
    if (repo.preparados.length === 0 && naoPreparados.length === 0) {
      linhas.push('nada a submeter, árvore de trabalho limpa');
    }
    return ok(m, linhas.join('\n'));
  }

  if (sub === 'add') {
    if (resto.length === 0) return erro(m, 'Nada especificado, nada adicionado.');
    const { modificados, novos, apagados } = mudancas(m);
    const candidatos = [...modificados, ...novos, ...apagados];
    /* `git add .` prepara tudo o que mudou; um nome prepara aquele arquivo. */
    const escolhidos = resto.includes('.') || resto.includes('-A')
      ? candidatos
      : resto.map(r => resolver(m.cwd, r)).filter(c => candidatos.includes(c));
    if (escolhidos.length === 0) {
      return erro(m, `fatal: caminho '${resto[0]}' não corresponde a nenhum arquivo alterado`);
    }
    return ok({ ...m, repo: { ...repo, preparados: [...new Set([...repo.preparados, ...escolhidos])] } });
  }

  if (sub === 'commit') {
    const i = resto.findIndex(r => r === '-m');
    const mensagem = i >= 0 ? resto[i + 1] : undefined;
    if (!mensagem) {
      return erro(m, 'Falta a mensagem. Use: git commit -m "o que mudou"');
    }
    if (repo.preparados.length === 0) {
      const { modificados, novos } = mudancas(m);
      return erro(m, [...modificados, ...novos].length > 0
        ? 'nada adicionado ao commit, mas há arquivos não rastreados (use "git add")'
        : 'nada a submeter, árvore de trabalho limpa');
    }
    /* A árvore do commit é a do commit anterior com os preparados por cima —
       e não o disco inteiro. É essa a diferença que `git add` faz, e ela some
       se o commit gravar tudo o que estiver em disco. */
    const arvore = { ...arvoreDoRamo(repo) };
    const emDisco = arquivosSob(m.disco, repo.raiz);
    for (const c of repo.preparados) {
      if (c in emDisco) arvore[c] = emDisco[c];
      else delete arvore[c];
    }
    const commit: Commit = {
      id: proximoId(repo),
      mensagem,
      arvore,
      pai: repo.ramos[repo.ramoAtual],
      ramo: repo.ramoAtual,
    };
    return ok({
      ...m,
      repo: {
        ...repo,
        commits: [...repo.commits, commit],
        ramos: { ...repo.ramos, [repo.ramoAtual]: commit.id },
        preparados: [],
      },
    }, `[${repo.ramoAtual} ${commit.id}] ${mensagem}\n ${repo.preparados.length} arquivo(s) alterado(s)`);
  }

  if (sub === 'log') {
    const linha = resto.some(r => r === '--oneline');
    const historico: Commit[] = [];
    let id = repo.ramos[repo.ramoAtual];
    while (id) {
      const c = commitDe(repo, id);
      if (!c) break;
      historico.push(c);
      id = c.pai;
    }
    if (historico.length === 0) return erro(m, `fatal: o ramo atual ${repo.ramoAtual} não tem nenhum commit`);
    return ok(m, historico
      .map(c => (linha ? `${c.id} ${c.mensagem}` : `commit ${c.id}\n\n    ${c.mensagem}\n`))
      .join('\n'));
  }

  if (sub === 'restore' || (sub === 'checkout' && resto[0] === '--')) {
    const alvos = (sub === 'restore' ? resto : resto.slice(1)).filter(r => !r.startsWith('-'));
    if (alvos.length === 0) return erro(m, 'fatal: falta o caminho a restaurar');
    const arvore = arvoreDoRamo(repo);
    let disco = m.disco;
    for (const alvo of alvos) {
      const caminho = resolver(m.cwd, alvo);
      if (!(caminho in arvore)) return erro(m, `error: caminho '${alvo}' não está no último commit`);
      disco = escrever(disco, caminho, arquivo(arvore[caminho]));
    }
    return ok({ ...m, disco, repo: { ...repo, preparados: repo.preparados.filter(c => !alvos.map(a => resolver(m.cwd, a)).includes(c)) } });
  }

  if (sub === 'branch') {
    const nomes = resto.filter(r => !r.startsWith('-'));
    if (nomes.length === 0) {
      return ok(m, Object.keys(repo.ramos).sort()
        .map(r => `${r === repo.ramoAtual ? '* ' : '  '}${r}`).join('\n'));
    }
    const nome = nomes[0];
    if (repo.ramos[nome] !== undefined) return erro(m, `fatal: o ramo '${nome}' já existe`);
    return ok({ ...m, repo: { ...repo, ramos: { ...repo.ramos, [nome]: repo.ramos[repo.ramoAtual] } } });
  }

  if (sub === 'checkout' || sub === 'switch') {
    const criar = resto.some(r => r === '-b' || r === '-c');
    const nome = resto.filter(r => !r.startsWith('-'))[0];
    if (!nome) return erro(m, 'fatal: falta o nome do ramo');
    if (criar) {
      if (repo.ramos[nome] !== undefined) return erro(m, `fatal: o ramo '${nome}' já existe`);
      return ok({
        ...m,
        repo: { ...repo, ramos: { ...repo.ramos, [nome]: repo.ramos[repo.ramoAtual] }, ramoAtual: nome },
      }, `Mudou para o novo ramo '${nome}'`);
    }
    if (repo.ramos[nome] === undefined) return erro(m, `error: pathspec '${nome}' não corresponde a nenhum ramo`);
    /* Trocar de ramo troca o disco pelo que aquele ramo registrou. Sem isso, a
       mesclagem do módulo seguinte não teria o que mesclar: o trabalho do ramo
       apareceria no main sem ninguém ter mesclado nada. */
    const arvore = commitDe(repo, repo.ramos[nome])?.arvore ?? {};
    let disco = m.disco;
    for (const caminho of Object.keys(arquivosSob(m.disco, repo.raiz))) {
      if (!(caminho in arvore)) disco = escrever(disco, caminho, null);
    }
    for (const [caminho, texto] of Object.entries(arvore)) disco = escrever(disco, caminho, arquivo(texto));
    return ok({ ...m, disco, repo: { ...repo, ramoAtual: nome, preparados: [] } }, `Mudou para o ramo '${nome}'`);
  }

  if (sub === 'merge') {
    const nome = resto.filter(r => !r.startsWith('-'))[0];
    if (!nome) return erro(m, 'fatal: falta o nome do ramo a mesclar');
    if (repo.ramos[nome] === undefined) return erro(m, `merge: ${nome} - não é algo que possamos mesclar`);
    if (nome === repo.ramoAtual) return erro(m, 'Já está atualizado.');
    const outro = commitDe(repo, repo.ramos[nome]);
    if (!outro) return erro(m, `fatal: o ramo '${nome}' não tem nenhum commit`);
    const arvore = { ...arvoreDoRamo(repo), ...outro.arvore };
    const commit: Commit = {
      id: proximoId(repo),
      mensagem: `Merge branch '${nome}'`,
      arvore,
      pai: repo.ramos[repo.ramoAtual],
      ramo: repo.ramoAtual,
      mesclagem: true,
    };
    let disco = m.disco;
    for (const [caminho, texto] of Object.entries(arvore)) disco = escrever(disco, caminho, arquivo(texto));
    return ok({
      ...m,
      disco,
      repo: {
        ...repo,
        commits: [...repo.commits, commit],
        ramos: { ...repo.ramos, [repo.ramoAtual]: commit.id },
      },
    }, `Merge feito por 'recursive'.\n ${Object.keys(outro.arvore).length} arquivo(s) do ramo ${nome}`);
  }

  if (sub === 'remote') {
    if (resto[0] === 'add') {
      const endereco = resto[2];
      if (!endereco) return erro(m, 'uso: git remote add <nome> <endereço>');
      return ok({ ...m, repo: { ...repo, remoto: endereco } });
    }
    if (resto.length === 0 || resto[0] === '-v') {
      return ok(m, repo.remoto ? `origin\t${repo.remoto}` : '');
    }
    return erro(m, `uso: git remote add origin <endereço>`);
  }

  if (sub === 'push') {
    if (!repo.remoto) return erro(m, "fatal: nenhum repositório remoto configurado.\nUse: git remote add origin <endereço>");
    const topo = repo.ramos[repo.ramoAtual];
    if (!topo) return erro(m, 'tudo atualizado (não há commits a enviar)');
    if (repo.publicado[repo.ramoAtual] === topo) return erro(m, 'Everything up-to-date');
    /*
      Publicar cria trabalho do outro lado, e é isso que torna o `pull` do
      requisito 6 uma coisa e não uma encenação: o remoto passa a ter um commit
      que este computador não tem — o que acontece quando outra pessoa mexe no
      mesmo repositório.
    */
    const doOutro: Commit = {
      id: `r${repo.commits.length + 1}`,
      mensagem: 'Acrescenta o nome do clube no leiame (feito por outra pessoa)',
      arvore: { ...(commitDe(repo, topo)?.arvore ?? {}), [`${repo.raiz}/leiame.txt`]: 'Programa da lista de presença da unidade.\nClube Falcão Peregrino.\n' },
      pai: topo,
      ramo: repo.ramoAtual,
    };
    return ok({
      ...m,
      repo: {
        ...repo,
        publicado: { ...repo.publicado, [repo.ramoAtual]: topo },
        aguardando: repo.aguardando.length > 0 ? repo.aguardando : [doOutro],
      },
    }, `Para ${repo.remoto}\n * [novo ramo]      ${repo.ramoAtual} -> ${repo.ramoAtual}`);
  }

  if (sub === 'pull' || sub === 'fetch') {
    if (!repo.remoto) return erro(m, 'fatal: nenhum repositório remoto configurado.');
    if (repo.aguardando.length === 0) return ok(m, 'Already up to date.');
    const [vindo] = repo.aguardando;
    let disco = m.disco;
    for (const [caminho, texto] of Object.entries(vindo.arvore)) disco = escrever(disco, caminho, arquivo(texto));
    return ok({
      ...m,
      disco,
      repo: {
        ...repo,
        commits: [...repo.commits, vindo],
        ramos: { ...repo.ramos, [repo.ramoAtual]: vindo.id },
        publicado: { ...repo.publicado, [repo.ramoAtual]: vindo.id },
        aguardando: [],
      },
    }, `De ${repo.remoto}\n   ${vindo.id}  ${repo.ramoAtual} -> origin/${repo.ramoAtual}\nAtualizando arquivos: 1 alterado`);
  }

  return erro(m, `git: '${sub}' não é um comando git. Veja 'git --help'.`);
}

/* ── Escrever num arquivo ──────────────────────────────────────────────────── */

/*
  O editor do terminal, e por que ele não é o nano.

  O requisito 7 pede escrever um README, e o requisito 5 pede alterar código
  num ramo — as duas coisas pedem digitar num arquivo. O nano é uma tela
  inteira dentro do terminal, com atalhos próprios, e imitá-lo seria construir
  um segundo editor para ensinar o que não está no documento.

  `editar` abre o painel de edição ao lado, que é o que qualquer pessoa faz
  hoje: o terminal para os comandos, o editor para o texto. O comando existe no
  Linux (`gedit`, `code`, `open`) e faz exatamente isto — chama um editor.
*/
export function escreverArquivo(m: Maquina, caminho: string, conteudo: string): Maquina {
  const alvo = resolver(m.cwd, caminho);
  return { ...m, disco: escrever(m.disco, alvo, arquivo(conteudo)) };
}

/* ── O despachante ─────────────────────────────────────────────────────────── */

export function rodar(m: Maquina, linha: string): Resposta {
  const texto = linha.trim();
  const registrada = { ...m, historico: texto ? [...m.historico, texto] : m.historico };
  if (!texto) return ok(registrada);

  const [comando, ...args] = palavras(texto);

  switch (comando) {
    case 'ls': return listar(registrada, args);
    case 'cd': return entrar(registrada, args);
    case 'pwd': return ok(registrada, registrada.cwd);
    case 'cat': return ver(registrada, args);
    case 'mkdir': return criarPasta(registrada, args);
    case 'touch': return criarArquivo(registrada, args);
    case 'cp': return copiar(registrada, args);
    case 'mv': return mover(registrada, args);
    case 'rm': return remover(registrada, args);
    case 'git': return git(registrada, args);
    case 'clear': return ok(registrada, '\x00limpar');
    case 'echo': return ok(registrada, args.join(' '));
    case 'help':
      return ok(registrada, [
        'Comandos deste laboratório:',
        '  pwd                    onde eu estou',
        '  ls  ls -a              o que tem aqui (‑a mostra os ocultos)',
        '  cd <pasta>             entrar numa pasta ( .. sobe, ~ vai para a casa )',
        '  cat <arquivo>          mostrar o conteúdo de um arquivo',
        '  mkdir <pasta>          criar pasta',
        '  touch <arquivo>        criar arquivo vazio',
        '  cp <de> <para>         copiar   ( -r para pasta )',
        '  mv <de> <para>         mover ou renomear',
        '  rm <arquivo>           remover  ( -r para pasta )',
        '  git <comando>          init, status, add, commit, log, restore,',
        '                         branch, checkout, merge, remote, push, pull',
        '  editar <arquivo>       abrir o arquivo no painel ao lado',
      ].join('\n'));
  }

  if (comando in FORA_DO_EXERCICIO) {
    return erro(registrada, `${comando} existe no terminal de verdade — ${FORA_DO_EXERCICIO[comando]} — e não faz parte deste exercício.`);
  }

  return erro(registrada, `${comando}: comando não encontrado. Digite help para ver a lista.`);
}
