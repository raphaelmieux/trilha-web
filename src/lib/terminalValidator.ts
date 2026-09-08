import {
  achar, arquivosSob, mudancas, palavras,
  type Maquina,
} from '../labs/terminal';

/**
 * O que cada laboratório da CC003 cobra, e como se confere.
 *
 * ── O que se lê aqui não é texto: é o computador ─────────────────────────
 * Nos outros validadores da casa há um arquivo e um analisador — o CSSOM lê a
 * folha, o `ast` lê o programa. Aqui o que existe é o **estado** depois dos
 * comandos: onde a pessoa está, o que há em disco, o que ficou registrado no
 * repositório. Conferir a linha digitada seria a armadilha de sempre —
 * `git commit -m "..."` escrito num comentário não registra nada, e o teste de
 * texto aprovaria.
 *
 * Então quase toda verificação olha o resultado, e não o comando. As exceções
 * são as que só existem como gesto: `ls -a` não deixa marca no disco, e `pwd`
 * também não. Para essas, o que se guarda é o histórico do que foi digitado —
 * e ainda assim o comando precisa ter **funcionado**, e não só ter sido
 * escrito.
 *
 * ── A armadilha do vazio, de novo ────────────────────────────────────────
 * "Sem links quebrados" passava numa página sem link nenhum, e a lição está
 * escrita no CLAUDE.md. Aqui ela toma esta forma: "cinco commits" é fácil de
 * satisfazer com cinco mensagens vazias, e "criou um ramo" com um ramo em que
 * nada foi feito. Por isso as mensagens precisam ser distintas e ter tamanho,
 * e a mesclagem precisa ter trazido arquivo de verdade.
 */

export interface CheckResult {
  id: string;
  label: string;
  hint: string;
  passed: boolean;
  detail?: string;
}

export interface ContextoDoTerminal {
  maquina: Maquina;
  /** Tudo o que foi digitado e não deu erro. */
  executados: string[];
}

interface Spec {
  id: string;
  label: string;
  hint: string;
  run: (c: ContextoDoTerminal) => { passed: boolean; detail?: string };
}

const RAIZ = '/home/desbravador/projeto-do-clube';

/** O comando foi executado com sucesso, e casa com o teste dado? */
const rodou = (c: ContextoDoTerminal, teste: (partes: string[]) => boolean) =>
  c.executados.some(linha => teste(palavras(linha)));

const existe = (c: ContextoDoTerminal, caminho: string) => achar(c.maquina.disco, caminho) !== null;

/* ── Andar pelo disco (requisito 4, primeira metade) ───────────────────────── */

const ANDAR: Spec[] = [
  {
    id: 'pwd',
    label: 'Descobrir onde você está',
    hint: 'O comando pwd escreve o caminho da pasta atual.',
    run: c => ({ passed: rodou(c, p => p[0] === 'pwd') }),
  },
  {
    id: 'entrou',
    label: 'Entrar na pasta do projeto',
    hint: 'cd projeto-do-clube. O prompt muda junto.',
    run: c => ({
      passed: rodou(c, p => p[0] === 'cd'),
      detail: c.maquina.cwd === '/home/desbravador' ? 'Você está na casa. Entre em alguma pasta.' : undefined,
    }),
  },
  {
    id: 'listou',
    label: 'Listar o que existe na pasta',
    hint: 'ls mostra o conteúdo do diretório atual.',
    run: c => ({ passed: rodou(c, p => p[0] === 'ls') }),
  },
  {
    /*
      A tarefa que dá nome ao requisito: sem -a, o `.oculto` não aparece, e é
      por isso que tanta gente jura que a pasta está vazia. Exigir que o
      comando tenha sido rodado *dentro* da pasta que tem oculto é o que
      impede um `ls -a` na casa, onde não há nenhum, de valer.
    */
    id: 'ocultos',
    label: 'Ver também os arquivos ocultos',
    hint: 'ls -a. Arquivo que começa com ponto só aparece com essa opção.',
    run: c => ({
      passed: rodou(c, p => p[0] === 'ls' && p.slice(1).some(a => a.startsWith('-') && a.includes('a')))
        && c.executados.some(l => l.startsWith('ls -a') || l.startsWith('ls -la') || l.startsWith('ls -al')),
    }),
  },
  {
    id: 'leu',
    label: 'Ler um arquivo sem abrir programa nenhum',
    hint: 'cat leiame.txt escreve o conteúdo na tela.',
    run: c => ({ passed: rodou(c, p => p[0] === 'cat' && !!p[1]) }),
  },
  {
    /*
      Caminho absoluto e relativo são dois dos termos que o requisito 2 manda
      definir, e definir sem usar é decorar. A tarefa exige um de cada: um `cd`
      que começa com `/` ou `~`, e um que não começa.
    */
    id: 'dois-caminhos',
    label: 'Usar um caminho absoluto e um relativo',
    hint: 'Absoluto começa com / ou ~ e vale de qualquer lugar; relativo parte de onde você está.',
    run: c => {
      const cds = c.executados.map(palavras).filter(p => p[0] === 'cd' && p[1]);
      const absoluto = cds.some(p => p[1].startsWith('/') || p[1].startsWith('~'));
      const relativo = cds.some(p => !p[1].startsWith('/') && !p[1].startsWith('~'));
      return {
        passed: absoluto && relativo,
        detail: absoluto && !relativo ? 'Falta um relativo — um cd sem a barra na frente.'
          : relativo && !absoluto ? 'Falta um absoluto — um cd começando com / ou ~.' : undefined,
      };
    },
  },
];

/* ── Mexer em arquivos (requisito 4, segunda metade) ───────────────────────── */

const MEXER: Spec[] = [
  {
    id: 'pasta-nova',
    label: 'Criar a pasta provas',
    hint: 'mkdir provas, dentro de projeto-do-clube.',
    run: c => ({ passed: existe(c, `${RAIZ}/provas`) }),
  },
  {
    id: 'arquivo-novo',
    label: 'Criar um arquivo vazio dentro dela',
    hint: 'touch provas/teste.txt cria o arquivo sem abrir editor nenhum.',
    run: c => {
      const dentro = Object.keys(arquivosSob(c.maquina.disco, `${RAIZ}/provas`));
      return { passed: dentro.length > 0 };
    },
  },
  {
    /*
      Copiar tem de deixar os dois. É o erro clássico de quem confunde cp com
      mv, e ele fica invisível: o arquivo aparece no destino, a tarefa parece
      cumprida, e o original sumiu.
    */
    id: 'copiou',
    label: 'Copiar o leiame para a pasta provas',
    hint: 'cp leiame.txt provas/ — copiar deixa os dois; mover deixa um.',
    run: c => {
      const copia = existe(c, `${RAIZ}/provas/leiame.txt`);
      const original = existe(c, `${RAIZ}/leiame.txt`);
      return {
        passed: copia && original,
        detail: copia && !original ? 'A cópia chegou, mas o original sumiu — isso foi mv, e não cp.' : undefined,
      };
    },
  },
  {
    id: 'renomeou',
    label: 'Renomear o arquivo criado',
    hint: 'mv também renomeia: mv provas/teste.txt provas/presenca.txt',
    run: c => ({ passed: rodou(c, p => p[0] === 'mv') }),
  },
  {
    id: 'removeu',
    label: 'Remover um arquivo',
    hint: 'rm <arquivo>. Não há lixeira aqui: o que sai, sai.',
    run: c => ({ passed: rodou(c, p => p[0] === 'rm') }),
  },
  {
    id: 'removeu-pasta',
    label: 'Remover a pasta provas inteira',
    hint: 'rm sozinho recusa pasta. rm -r provas remove com o que estiver dentro.',
    run: c => ({
      passed: rodou(c, p => p[0] === 'rm' && p.slice(1).some(a => a.startsWith('-') && /[rR]/.test(a)))
        && !existe(c, `${RAIZ}/provas`),
    }),
  },
];

/* ── O repositório (requisito 5, a, b e c) ─────────────────────────────────── */

/** Mensagem que descreve alguma coisa: não é vazia, não é "teste", tem palavras. */
const descritiva = (m: string) => m.trim().length >= 12 && m.trim().split(/\s+/).length >= 2;

const REPOSITORIO: Spec[] = [
  {
    id: 'iniciou',
    label: 'Iniciar o repositório na pasta do projeto',
    hint: 'Entre em projeto-do-clube e rode git init.',
    run: c => ({
      passed: c.maquina.repo?.raiz === RAIZ,
      detail: c.maquina.repo && c.maquina.repo.raiz !== RAIZ
        ? `O repositório foi iniciado em ${c.maquina.repo.raiz}, e não na pasta do projeto.` : undefined,
    }),
  },
  {
    id: 'preparou',
    label: 'Preparar arquivos com git add',
    hint: 'git add . prepara tudo o que mudou. Sem isso, o commit não tem o que registrar.',
    run: c => ({ passed: rodou(c, p => p[0] === 'git' && p[1] === 'add') }),
  },
  {
    /*
      Cinco commits *com mensagens descritivas*, diz o documento. Cinco
      mensagens iguais, ou cinco "teste", satisfariam a contagem e não o
      requisito — é a armadilha do vazio nesta lição.
    */
    id: 'cinco-commits',
    label: 'Registrar cinco commits com mensagens descritivas',
    hint: 'git commit -m "o que mudou". A mensagem diz o que mudou, e não "teste".',
    run: c => {
      const commits = c.maquina.repo?.commits ?? [];
      const boas = commits.filter(x => descritiva(x.mensagem));
      const distintas = new Set(boas.map(x => x.mensagem.trim().toLowerCase()));
      const passed = distintas.size >= 5;
      return {
        passed,
        detail: passed ? undefined
          : commits.length >= 5 && distintas.size < 5
            ? `${commits.length} commits, mas ${distintas.size} mensagem(ns) diferente(s) e descritiva(s). "teste" e "x" não dizem o que mudou.`
            : `${distintas.size} de 5.`,
      };
    },
  },
  {
    id: 'viu-historico',
    label: 'Consultar o histórico',
    hint: 'git log mostra os commits do mais novo para o mais antigo. git log --oneline resume.',
    run: c => ({ passed: rodou(c, p => p[0] === 'git' && p[1] === 'log') }),
  },
];

/* ── Desfazer e ramificar (requisito 5, d e e) ─────────────────────────────── */

const RAMOS: Spec[] = [
  {
    /*
      Desfazer só significa alguma coisa se houve o que desfazer. Exigir só o
      comando deixaria passar um `git restore` num arquivo intocado — verde
      sem ter desfeito nada.
    */
    id: 'desfez',
    label: 'Desfazer uma alteração que ainda não foi registrada',
    hint: 'Mude um arquivo pelo editor, veja em git status, e devolva com git restore <arquivo>.',
    run: c => ({
      passed: rodou(c, p => p[0] === 'git' && (p[1] === 'restore' || (p[1] === 'checkout' && p[2] === '--')))
        && mudancas(c.maquina).modificados.length === 0,
      detail: rodou(c, p => p[0] === 'git' && p[1] === 'restore') && mudancas(c.maquina).modificados.length > 0
        ? 'Ainda há arquivo modificado sem registrar. Restaure-o, ou registre-o.' : undefined,
    }),
  },
  {
    id: 'criou-ramo',
    label: 'Criar um ramo e entrar nele',
    hint: 'git checkout -b <nome> cria e já entra. git branch sozinho lista os que existem.',
    run: c => {
      const ramos = Object.keys(c.maquina.repo?.ramos ?? {});
      return { passed: ramos.length >= 2, detail: ramos.length < 2 ? `Ramos: ${ramos.join(', ') || 'nenhum'}` : undefined };
    },
  },
  {
    /*
      Alterar código *no ramo*, diz o documento. Um ramo criado e abandonado
      cumpre "criar um ramo" e não cumpre isto — e é justamente por aí que a
      mesclagem do passo seguinte fica sem sentido.
    */
    id: 'trabalhou-no-ramo',
    label: 'Alterar alguma coisa dentro do ramo e registrar',
    hint: 'Já no ramo novo, mude um arquivo, dê git add e git commit.',
    run: c => {
      const commits = c.maquina.repo?.commits ?? [];
      const noRamo = commits.filter(x => x.ramo !== 'main' && !x.mesclagem);
      return {
        passed: noRamo.length > 0,
        detail: noRamo.length === 0 && Object.keys(c.maquina.repo?.ramos ?? {}).length >= 2
          ? 'O ramo existe, e nada foi registrado dentro dele.' : undefined,
      };
    },
  },
  {
    id: 'mesclou',
    label: 'Mesclar o ramo de volta no principal',
    hint: 'Volte com git checkout main e junte com git merge <nome do ramo>.',
    run: c => ({
      passed: (c.maquina.repo?.commits ?? []).some(x => x.mesclagem)
        && c.maquina.repo?.ramoAtual === 'main',
      detail: (c.maquina.repo?.commits ?? []).some(x => x.mesclagem) && c.maquina.repo?.ramoAtual !== 'main'
        ? 'A mesclagem aconteceu, mas fora do main. Volte para ele e mescle ali.' : undefined,
    }),
  },
];

/* ── O remoto (requisito 6) ────────────────────────────────────────────────── */

const REMOTO: Spec[] = [
  {
    id: 'apontou',
    label: 'Apontar o repositório para um endereço remoto',
    hint: 'git remote add origin https://exemplo/clube.git',
    run: c => ({ passed: !!c.maquina.repo?.remoto }),
  },
  {
    id: 'enviou',
    label: 'Enviar o que está registrado',
    hint: 'git push. Só sai o que já foi commitado — o que está solto no disco não vai.',
    run: c => ({ passed: Object.keys(c.maquina.repo?.publicado ?? {}).length > 0 }),
  },
  {
    /*
      Receber só existe se houver o que receber, e por isso o push simulado
      cria trabalho do outro lado. Sem isso, "demonstrar o recebimento" seria
      uma mensagem sem nada por trás — a encenação que esta casa evita.
    */
    id: 'recebeu',
    label: 'Receber o que outra pessoa registrou',
    hint: 'Depois do push, alguém mexeu no leiame. Traga com git pull e confira com cat.',
    run: c => {
      const leiame = achar(c.maquina.disco, `${RAIZ}/leiame.txt`)?.conteudo ?? '';
      return { passed: leiame.includes('Clube Falcão Peregrino') };
    },
  },
];

/* ── O README (requisito 7) ────────────────────────────────────────────────── */

const leiaMe = (c: ContextoDoTerminal) =>
  achar(c.maquina.disco, `${RAIZ}/README.md`)?.conteudo ?? null;

const README: Spec[] = [
  {
    id: 'existe',
    label: 'Criar o arquivo README.md',
    hint: 'touch README.md e depois editar README.md para escrever nele.',
    run: c => ({ passed: leiaMe(c) !== null }),
  },
  {
    id: 'titulo',
    label: 'Pôr um título',
    hint: 'Em Markdown, título é uma linha começando com # — e ## é um subtítulo.',
    run: c => ({ passed: /^#{1,6}\s+\S/m.test(leiaMe(c) ?? '') }),
  },
  {
    /* Uma linha sozinha não é lista: lista é o que se lê como conjunto, e uma
       marca só passa a mesma impressão sem cumprir o requisito. */
    id: 'lista',
    label: 'Escrever uma lista de pelo menos dois itens',
    hint: 'Cada item numa linha começando com - ou com *.',
    run: c => {
      const itens = (leiaMe(c) ?? '').split('\n').filter(l => /^\s*[-*]\s+\S/.test(l));
      return { passed: itens.length >= 2, detail: itens.length === 1 ? 'Um item só ainda não é lista.' : undefined };
    },
  },
  {
    id: 'codigo',
    label: 'Incluir um trecho de código',
    hint: 'Entre três crases numa linha própria, ou entre uma crase no meio da frase.',
    run: c => {
      const t = leiaMe(c) ?? '';
      return { passed: /```[\s\S]*?```/.test(t) || /`[^`\n]+`/.test(t) };
    },
  },
  {
    id: 'link',
    label: 'Incluir um link',
    hint: 'O texto entre colchetes e o endereço entre parênteses, colados: [texto](endereço).',
    run: c => ({ passed: /\[[^\]\n]+\]\([^)\s]+\)/.test(leiaMe(c) ?? '') }),
  },
  {
    /* Escrever o arquivo e não registrar é deixá-lo fora do repositório —
       exatamente o que o módulo anterior ensinou a não fazer. */
    id: 'registrado',
    label: 'Registrar o README no repositório',
    hint: 'git add README.md e git commit -m "...". Arquivo não commitado não está no histórico.',
    run: c => {
      const repo = c.maquina.repo;
      if (!repo) return { passed: false };
      return {
        passed: repo.commits.some(x => `${RAIZ}/README.md` in x.arvore),
        detail: leiaMe(c) !== null && !repo.commits.some(x => `${RAIZ}/README.md` in x.arvore)
          ? 'O arquivo existe em disco, mas nenhum commit o contém.' : undefined,
      };
    },
  },
];

/* ── O catálogo ────────────────────────────────────────────────────────────── */

const TODAS: Spec[] = [...ANDAR, ...MEXER, ...REPOSITORIO, ...RAMOS, ...REMOTO, ...README];

/** Os ids que existem, para o teste da vereda conferir o que a lição pede. */
export const IDS_DO_TERMINAL = TODAS.map(s => s.id);

export function validarTerminal(ctx: ContextoDoTerminal, ids: string[]): CheckResult[] {
  return ids.map(id => {
    const spec = TODAS.find(s => s.id === id);
    if (!spec) {
      return { id, label: id, hint: '', passed: false, detail: 'Verificação desconhecida.' };
    }
    const r = spec.run(ctx);
    return { id, label: spec.label, hint: spec.hint, passed: r.passed, detail: r.detail };
  });
}
