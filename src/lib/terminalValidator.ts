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

/* ── O gerenciador de pacotes (requisito 7 da CC004) ───────────────────────── */

/*
  Este bloco não é da CC003.

  O requisito 7 da CC004 pede demonstrar a instalação de uma biblioteca de
  terceiros pelo gerenciador de pacotes, e isso acontece no terminal — não
  dentro do programa. Em vez de inventar um segundo terminal para a vereda
  seguinte, a lição dela usa este, que é o mesmo que o desbravador já
  aprendeu a operar na CC003: duas telas de terminal diferentes ensinariam
  que cada vereda tem o seu, e ele tem um só.
*/
const instalado = (c: ContextoDoTerminal, nome: string) =>
  c.maquina.instalados.some(e => e.split('==')[0] === nome);

const PACOTES: Spec[] = [
  {
    id: 'viu-o-que-tem',
    label: 'Ver o que já está instalado',
    hint: 'pip list mostra o que existe antes de você instalar qualquer coisa.',
    run: c => ({ passed: rodou(c, p => p[0] === 'pip' && p[1] === 'list') }),
  },
  {
    /*
      Conferir **antes** de instalar, e é por isso que esta tarefa existe
      separada da de instalar.

      O `reqeusts` do catálogo é o `requests` com duas letras trocadas, e ele
      instala sem reclamar — como o de verdade instalaria. O que denuncia está
      no `pip show`: autor desconhecido, publicado há quatro dias, trinta e um
      downloads. Uma tarefa que só pedisse "instale requests" ensinaria que o
      pip protege, e ele não protege.
    */
    id: 'conferiu-antes',
    label: 'Conferir o pacote antes de instalar',
    hint: 'pip show <nome> diz quem publicou, quando, e quantos usam.',
    run: c => {
      const viu = c.executados.filter(l => {
        const p = palavras(l);
        return p[0] === 'pip' && p[1] === 'show';
      });
      return {
        passed: viu.length > 0,
        detail: viu.length ? undefined
          : 'Instalar é rodar código de outra pessoa no seu computador. Olhe quem publicou antes.',
      };
    },
  },
  {
    id: 'instalou',
    label: 'Instalar a biblioteca certa',
    hint: 'pip install requests — copiado da página oficial, e não digitado de memória.',
    run: c => {
      if (instalado(c, 'requests')) return { passed: true };
      /* O nome trocado instala e não reclama: quem caiu nele precisa saber que
         caiu, e ler no `pip show` o que havia para ver. */
      if (instalado(c, 'reqeusts')) {
        return {
          passed: false,
          detail: 'Você instalou "reqeusts", com as duas letras trocadas — um pacote de autor '
            + 'desconhecido, publicado há quatro dias. Veja o pip show dele, desinstale, e '
            + 'instale o nome certo.',
        };
      }
      return { passed: false };
    },
  },
  {
    /*
      E a lista tem de ter sido gravada **com** alguma coisa dentro.

      `pip freeze > requirements.txt` sem nada instalado grava um arquivo
      vazio, e o arquivo existe — que é a armadilha do "zero link não é zero
      link quebrado" com um arquivo por cima. O que se confere é o conteúdo.
    */
    id: 'gravou-a-lista',
    label: 'Gravar o requirements.txt pelo pip',
    hint: 'pip freeze > requirements.txt — a lista é o retrato do que está instalado, e não algo que se digita.',
    run: c => {
      const alvo = achar(c.maquina.disco, `${RAIZ}/requirements.txt`)
        ?? achar(c.maquina.disco, '/home/desbravador/requirements.txt');
      const conteudo = alvo?.tipo === 'arquivo' ? (alvo.conteudo ?? '') : null;
      if (conteudo === null) return { passed: false };
      if (!/requests==/.test(conteudo)) {
        return {
          passed: false,
          detail: conteudo.trim()
            ? 'O arquivo existe e não traz a biblioteca certa.'
            : 'O arquivo foi gravado vazio: nada estava instalado na hora do freeze.',
        };
      }
      return { passed: true };
    },
  },
];

/* ── O projeto de programa (requisitos 4 e 5 da CC006) ─────────────────────── */

/*
  Este bloco também não é da CC003: é do repositório do almoxarifado, que tem
  calendário. A raiz sai do repositório, e não da constante de cima — o
  projeto mora em outra pasta.
*/

/** O histórico do ramo atual, do mais velho ao mais novo. */
function historicoDoRamo(c: ContextoDoTerminal) {
  const repo = c.maquina.repo;
  if (!repo) return [];
  const lista = [];
  let id = repo.ramos[repo.ramoAtual];
  while (id) {
    const commit = repo.commits.find(x => x.id === id);
    if (!commit) break;
    lista.unshift(commit);
    id = commit.pai;
  }
  return lista;
}

/** Os commits feitos hoje, cada um com o anterior a ele. */
function commitsDeHoje(c: ContextoDoTerminal) {
  const lista = historicoDoRamo(c);
  return lista.map((x, i) => ({ commit: x, antes: i > 0 ? lista[i - 1].arvore : {} }))
    .filter(x => !!c.maquina.hoje && x.commit.data === c.maquina.hoje);
}

const arquivosMudados = (antes: Record<string, string>, depois: Record<string, string>) =>
  [...new Set([...Object.keys(antes), ...Object.keys(depois)])].filter(k => antes[k] !== depois[k]);

/*
  Mensagem que não diz nada. A lista é curta e é das que aparecem de verdade:
  quem lê o histórico daqui a um mês não sabe o que "ajustes" ajustou.
*/
const VAGAS = /^(update|updates|wip|fix|teste|testes|commit|mudan[cç]as?|ajustes?|altera[cç](ão|ões)|coisas|v\d+|\.+)$/i;
export const mensagemDiz = (m: string) => m.trim().split(/\s+/).length >= 3 && !VAGAS.test(m.trim());

const leiaMeDoProjeto = (c: ContextoDoTerminal): string | null => {
  const raiz = c.maquina.repo?.raiz;
  if (!raiz) return null;
  const no = achar(c.maquina.disco, `${raiz}/README.md`);
  return no?.tipo === 'arquivo' ? (no.conteudo ?? '') : null;
};

/** A seção do README cujo título casa com o padrão, e o que vem até o próximo título. */
function secao(texto: string, titulo: RegExp): string | null {
  const linhas = texto.split('\n');
  const i = linhas.findIndex(l => /^#{1,6}\s/.test(l) && titulo.test(l));
  if (i < 0) return null;
  const fim = linhas.findIndex((l, j) => j > i && /^#{1,6}\s/.test(l));
  return linhas.slice(i + 1, fim < 0 ? undefined : fim).join('\n').trim();
}

const PROJETO: Spec[] = [
  {
    id: 'quinzeCommits',
    label: 'Chegar a quinze commits',
    hint: 'git log mostra quantos há. Cada mudança guardada no seu próprio commit conta um.',
    run: c => {
      const n = historicoDoRamo(c).length;
      return { passed: n >= 15, detail: n < 15 ? `O histórico tem ${n} commits.` : undefined };
    },
  },
  {
    id: 'quatroDias',
    label: 'Commits em quatro dias diferentes',
    hint: 'git log mostra a data de cada um. Os de hoje entram no quarto dia.',
    run: c => {
      const dias = new Set(historicoDoRamo(c).map(x => x.data).filter(Boolean)).size;
      return { passed: dias >= 4, detail: dias < 4 ? `Os commits estão em ${dias} dias.` : undefined };
    },
  },
  {
    /* Um assunto por commit: é o que torna o histórico legível e o que deixa
       desfazer uma mudança sem levar as outras junto. Um "git add ." com as
       quatro dentro passa as quatro de uma vez para um commit só. */
    id: 'umAssuntoPorCommit',
    label: 'Cada mudança no seu commit',
    hint: 'git add um arquivo, git commit; depois o próximo. git status mostra o que falta.',
    run: c => {
      const hoje = commitsDeHoje(c);
      if (hoje.length === 0) return { passed: false, detail: 'Nenhum commit hoje ainda.' };
      const misturado = hoje.find(x => arquivosMudados(x.antes, x.commit.arvore).length > 1);
      return misturado
        ? { passed: false, detail: `O commit "${misturado.commit.mensagem}" guarda mais de uma mudança.` }
        : { passed: true };
    },
  },
  {
    id: 'mensagensQueDizem',
    label: 'Mensagens que dizem o que mudou',
    hint: 'Uma frase que diga o que o commit fez, como "Avisa quando não há material cadastrado".',
    run: c => {
      const hoje = commitsDeHoje(c);
      if (hoje.length === 0) return { passed: false, detail: 'Nenhum commit hoje ainda.' };
      const vaga = hoje.find(x => !mensagemDiz(x.commit.mensagem));
      return vaga ? { passed: false, detail: `"${vaga.commit.mensagem}" não diz o que mudou.` } : { passed: true };
    },
  },
  {
    id: 'arvoreLimpa',
    label: 'Nada ficar de fora',
    hint: 'git status tem de dizer que a árvore de trabalho está limpa.',
    run: c => {
      const { modificados, novos, apagados } = mudancas(c.maquina);
      const n = modificados.length + novos.length + apagados.length;
      return { passed: !!c.maquina.repo && n === 0, detail: n ? `Ainda há ${n} arquivo${n === 1 ? '' : 's'} sem commit.` : undefined };
    },
  },
  {
    id: 'leiameDescreve',
    label: 'O README diz o que o programa é',
    hint: 'Um título e uma seção "Descrição" dizendo para que o programa serve e para quem.',
    run: c => {
      const t = leiaMeDoProjeto(c);
      const corpo = t === null ? null : secao(t, /descri|sobre|o que [eé]/i);
      return { passed: !!corpo && corpo.split(/\s+/).length >= 8 };
    },
  },
  {
    id: 'leiameInstala',
    label: 'O README diz como instalar',
    hint: 'Uma seção "Instalação": o Python 3 e como baixar o projeto. O banco se cria sozinho na primeira vez.',
    run: c => {
      const t = leiaMeDoProjeto(c);
      const corpo = t === null ? null : secao(t, /instala/i);
      return { passed: !!corpo && /python/i.test(corpo) };
    },
  },
  {
    id: 'leiameUsa',
    label: 'O README diz como usar',
    hint: 'Uma seção "Uso" com o comando que abre o programa, python principal.py, e o que o menu oferece.',
    run: c => {
      const t = leiaMeDoProjeto(c);
      const corpo = t === null ? null : secao(t, /\buso\b|usar/i);
      return { passed: !!corpo && /principal\.py/.test(corpo) };
    },
  },
  {
    /* O exemplo é uma execução de verdade, colada: o menu, uma escolha e o que
       o programa respondeu. Um exemplo inventado de cabeça mostra uma tela que
       o programa não tem — e é a primeira coisa que quem chega vai comparar. */
    id: 'leiameExemplo',
    label: 'O README traz um exemplo de execução',
    hint: 'Uma seção "Exemplo" com um bloco entre três crases mostrando o menu, uma escolha e a resposta.',
    run: c => {
      const t = leiaMeDoProjeto(c);
      const corpo = t === null ? null : secao(t, /exemplo/i);
      const bloco = corpo ? /```[^\n]*\n([\s\S]*?)```/.exec(corpo)?.[1] ?? '' : '';
      return { passed: /Escolha:/.test(bloco) && /\d+ - \S/.test(bloco) };
    },
  },
  {
    id: 'leiameVersionado',
    label: 'O README que está no disco é o do último commit',
    hint: 'git add README.md e git commit. Mexeu depois? Commit de novo.',
    run: c => {
      const repo = c.maquina.repo;
      const t = leiaMeDoProjeto(c);
      const ultimo = historicoDoRamo(c).slice(-1)[0];
      const noCommit = repo && ultimo ? ultimo.arvore[`${repo.raiz}/README.md`] : undefined;
      return {
        passed: t !== null && noCommit === t,
        detail: t !== null && noCommit !== t ? 'O README do disco não é o que está no último commit.' : undefined,
      };
    },
  },
];

/* ── O catálogo ────────────────────────────────────────────────────────────── */

const TODAS: Spec[] = [...ANDAR, ...MEXER, ...REPOSITORIO, ...RAMOS, ...REMOTO, ...README, ...PACOTES, ...PROJETO];

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
