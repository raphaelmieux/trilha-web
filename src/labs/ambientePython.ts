/**
 * O computador simulado onde o Python é instalado e um arquivo é executado.
 *
 * ── Por que isto é um laboratório, e não um texto ────────────────────────
 * O requisito 4 pede *demonstrar*: acessar um ambiente Python funcional e
 * executar um programa a partir de arquivo. Nada disso acontece no editor da
 * plataforma — ali o Python já está pronto e o arquivo já existe. O que trava
 * o desbravador no computador do clube é outra coisa: o instalador, a caixa do
 * PATH, e o Bloco de Notas salvando `programa.py.txt` sem avisar.
 *
 * ── A regra da casa: as escolhas valem ──────────────────────────────────
 * Quem não marcar "Add python.exe to PATH" vai encontrar, no prompt, a mesma
 * frase que encontraria de verdade — e não um aviso nosso dizendo que marcou
 * errado. Quem salvar como "Documento de texto" vai ver o arquivo virar
 * `programa.py.txt` e o Python reclamar que não achou `programa.py`. Simulação
 * que impede o erro não ensina a sair dele, e sair dele é o que a pessoa vai
 * precisar fazer sozinha.
 *
 * Por isso o estado mora aqui, fora da tela: é ele que decide o que o prompt
 * responde, e é ele que se testa sem navegador.
 */

/** De onde o instalador veio. O agregador existe para ter o que recusar. */
export type Origem = 'oficial' | 'agregador';

export interface Instalacao {
  /** "Add python.exe to PATH", a caixa que quase todo mundo deixa passar. */
  noPath: boolean;
  /** "Use admin privileges when installing py.exe": é o que põe o `py`. */
  comLancador: boolean;
}

export interface EstadoDoAmbiente {
  baixadoDe: Origem | null;
  instalado: Instalacao | null;
  /** Os arquivos da pasta Documentos, pelo nome exato com que foram salvos. */
  documentos: Record<string, string>;
  /** A pasta em que o prompt está. */
  pasta: string;
  /** O que já saiu no prompt, linha a linha. */
  historico: string[];
  /** Um programa do arquivo já rodou e imprimiu alguma coisa. */
  rodou: boolean;
}

export const PASTA_INICIAL = 'C:\\Users\\desbravador';
export const PASTA_DOCUMENTOS = 'C:\\Users\\desbravador\\Documents';

/** A versão que a simulação instala. Aparece no site, no instalador e no `--version`. */
export const VERSAO = '3.14.2';

/*
  Abre com tudo por fazer: nada baixado, nada instalado, Documentos vazio.

  É a regra que já custou caro três vezes nesta casa — laboratório que abre
  resolvido não ensina nada, e o erro é invisível de dentro, porque a lista de
  tarefas mostra exatamente o que se espera de um laboratório funcionando.
*/
export const estadoInicial = (): EstadoDoAmbiente => ({
  baixadoDe: null,
  instalado: null,
  documentos: {},
  pasta: PASTA_INICIAL,
  historico: [],
  rodou: false,
});

/*
  O programa que a lição manda escrever.

  Duas linhas, e as duas são o requisito 4.3: lê um dado do usuário e mostra um
  resultado. Fica curto de propósito — o assunto aqui é o computador, e não a
  linguagem; quem quiser escrever programa grande tem os outros laboratórios.
*/
export const PROGRAMA_DA_LICAO = `nome = input("Como você se chama? ")
print("Boa noite,", nome + "!")`;

/** O que esse programa escreve, com o nome que o prompt vai fingir que foi digitado. */
export const SAIDA_DO_PROGRAMA = ['Como você se chama? Ana', 'Boa noite, Ana!'];

/** Os programas que este computador tem. */
export type Janela = 'navegador' | 'instalador' | 'notas' | 'prompt';

export const TITULO_DA_JANELA: Record<Janela, string> = {
  navegador: 'Navegador Web',
  instalador: `Python ${VERSAO} (64-bit) Setup`,
  notas: 'Bloco de Notas',
  prompt: 'Prompt de Comando',
};

/* ────────────────────────────────────────────────────────────────────────
   O prompt de comando
   ──────────────────────────────────────────────────────────────────────── */

/** A frase exata do Windows quando o comando não está no PATH. */
export const NAO_RECONHECIDO =
  "não é reconhecido como um comando interno ou externo, um programa operável ou um arquivo em lotes.";

const nomeDaPasta = (caminho: string) => caminho.split('\\').pop() ?? caminho;

/*
  Um comando é lido como o Windows o lê: o programa, e o resto.

  Não é análise de shell de verdade — não há aspas, nem pipe, nem variável. É o
  bastante para os comandos que esta lição usa, e o suficiente para responder
  com honestidade a tudo o que ela não usa.
*/
function partes(linha: string): { programa: string; argumentos: string[] } {
  const pedacos = linha.trim().split(/\s+/).filter(p => p.length > 0);
  return { programa: (pedacos[0] ?? '').toLowerCase(), argumentos: pedacos.slice(1) };
}

/** O interpretador do Python existe para este prompt? E por qual nome? */
function chamaOPython(programa: string, e: EstadoDoAmbiente): 'python' | 'py' | null {
  if (!e.instalado) return null;
  /* `python` só responde de qualquer pasta quando o instalador o pôs no PATH.
     `py` é o lançador, e ele vai para a pasta do sistema — que já está no PATH
     desde sempre. É por isso que ele funciona quando o outro não funciona, e
     não é truque nosso: é assim no Windows. */
  if (programa === 'python' && e.instalado.noPath) return 'python';
  if (programa === 'py' && e.instalado.comLancador) return 'py';
  return null;
}

export interface RespostaDoPrompt {
  /** As linhas que o prompt escreve. */
  saida: string[];
  /** O estado depois do comando. */
  estado: EstadoDoAmbiente;
}

/**
 * Roda um comando no prompt e devolve o que ele responderia.
 *
 * Toda resposta é a do Windows de verdade, inclusive as de erro — são elas que
 * o desbravador vai reencontrar, e reconhecer uma mensagem é metade de sair
 * dela. Inventar um texto mais gentil pareceria ajuda e seria a única coisa
 * daqui que ele não veria de novo em lugar nenhum.
 */
export function rodarComando(linha: string, estado: EstadoDoAmbiente): RespostaDoPrompt {
  const { programa, argumentos } = partes(linha);
  const antes = { ...estado, historico: [...estado.historico] };

  if (programa === '') return { saida: [], estado: antes };

  if (programa === 'cls') return { saida: [], estado: { ...antes, historico: [] } };

  if (programa === 'cd') {
    const alvo = argumentos.join(' ');
    if (!alvo || alvo === '.') return { saida: [antes.pasta], estado: antes };
    if (alvo === '..') {
      const acima = antes.pasta.split('\\').slice(0, -1).join('\\');
      /* Não se sobe além da raiz: `cd ..` em `C:\` fica em `C:\`. */
      return { saida: [], estado: { ...antes, pasta: acima.includes('\\') ? acima : 'C:\\' } };
    }
    const destino = alvo.toLowerCase() === 'documents' || alvo.toLowerCase() === 'documentos'
      ? PASTA_DOCUMENTOS
      : null;
    if (destino && antes.pasta === PASTA_INICIAL) {
      return { saida: [], estado: { ...antes, pasta: destino } };
    }
    if (alvo.toLowerCase().startsWith('c:')) {
      const certo = alvo.replace(/\//g, '\\');
      if (certo.toLowerCase() === PASTA_DOCUMENTOS.toLowerCase()) {
        return { saida: [], estado: { ...antes, pasta: PASTA_DOCUMENTOS } };
      }
      if (certo.toLowerCase() === PASTA_INICIAL.toLowerCase()) {
        return { saida: [], estado: { ...antes, pasta: PASTA_INICIAL } };
      }
    }
    return { saida: ['O sistema não pode encontrar o caminho especificado.'], estado: antes };
  }

  if (programa === 'dir') {
    if (antes.pasta === PASTA_DOCUMENTOS) {
      const nomes = Object.keys(antes.documentos);
      if (nomes.length === 0) {
        return {
          saida: [` O volume na unidade C não tem nome.`, '', ` Pasta de ${antes.pasta}`, '',
            '               0 arquivo(s)'],
          estado: antes,
        };
      }
      return {
        saida: [` O volume na unidade C não tem nome.`, '', ` Pasta de ${antes.pasta}`, '',
          ...nomes.map(n => `03/09/2026  06:40    ${String(antes.documentos[n].length).padStart(14)} ${n}`),
          `               ${nomes.length} arquivo(s)`],
        estado: antes,
      };
    }
    return {
      saida: [` O volume na unidade C não tem nome.`, '', ` Pasta de ${antes.pasta}`, '',
        '03/09/2026  06:40    <DIR>          Documents',
        '               0 arquivo(s)'],
      estado: antes,
    };
  }

  if (programa === 'python' || programa === 'py' || programa === 'python3') {
    const como = chamaOPython(programa === 'python3' ? 'python' : programa, antes);
    if (!como) {
      /* Instalado ou não, a frase é a mesma — e é justamente por ser a mesma
         que ela confunde. O passo a passo separa os dois casos. */
      return { saida: [`'${programa}' ${NAO_RECONHECIDO}`], estado: antes };
    }

    if (argumentos.length === 0) {
      return {
        saida: [`Python ${VERSAO} (tags/v${VERSAO}) [MSC v.1940 64 bit (AMD64)] on win32`,
          'Type "help", "copyright", "credits" or "license" for more information.',
          '>>> ^Z',
          ''],
        estado: antes,
      };
    }

    if (argumentos[0] === '--version' || argumentos[0] === '-V') {
      return { saida: [`Python ${VERSAO}`], estado: antes };
    }

    const pedido = argumentos[0];
    /* O arquivo só é achado na pasta em que o prompt está. É o que faz o `cd`
       ser parte da lição em vez de enfeite. */
    const existe = antes.pasta === PASTA_DOCUMENTOS && antes.documentos[pedido] !== undefined;
    if (!existe) {
      const caminho = `${antes.pasta}\\${pedido}`;
      return {
        saida: [`${como}: can't open file '${caminho}': [Errno 2] No such file or directory`],
        estado: antes,
      };
    }
    return { saida: [...SAIDA_DO_PROGRAMA], estado: { ...antes, rodou: true } };
  }

  return { saida: [`'${linha.trim().split(/\s+/)[0]}' ${NAO_RECONHECIDO}`], estado: antes };
}

/** O texto do prompt antes do cursor, como o Windows o escreve. */
export const prompt = (estado: EstadoDoAmbiente) => `${estado.pasta}>`;

/** Só para a tela: o nome curto da pasta, para o título da janela. */
export const tituloDaPasta = (estado: EstadoDoAmbiente) => nomeDaPasta(estado.pasta);

/* ────────────────────────────────────────────────────────────────────────
   As verificações
   ──────────────────────────────────────────────────────────────────────── */

export interface CheckResult {
  id: string;
  label: string;
  hint: string;
  passed: boolean;
  detail?: string;
}

interface Spec {
  id: string;
  label: string;
  hint: string;
  run: (e: EstadoDoAmbiente) => { passed: boolean; detail?: string };
}

/*
  Quatro tarefas, e nenhuma delas é "marque a caixa certa".

  A caixa do PATH não é verificação, e isso é decisão: transformá-la numa
  tarefa faria dela um item a cumprir, e o que se aprende ali é outra coisa —
  que existe um obstáculo, como ele se anuncia, e como se sai dele. Quem
  esquecer a caixa vai ler `'python' não é reconhecido` e ter de resolver, ou
  refazendo a instalação, ou chamando pelo `py`. As duas saídas são verdadeiras,
  e as duas fazem o programa rodar — que é o que o requisito pede.
*/
const SPECS: Spec[] = [
  {
    id: 'baixouDoSiteOficial',
    label: 'Baixar o Python do site oficial',
    hint: 'O endereço é python.org. Sites que juntam "programas grátis" empacotam o instalador com outras coisas junto.',
    run: e => {
      if (e.baixadoDe === 'oficial') return { passed: true };
      if (e.baixadoDe === 'agregador') {
        return {
          passed: false,
          detail: 'O instalador veio de um site que junta programas. Ele até instala, e vem acompanhado. Volte ao navegador e baixe de python.org.',
        };
      }
      return { passed: false, detail: 'Nada foi baixado ainda. Abra o navegador na barra de tarefas.' };
    },
  },
  {
    id: 'instalouOPython',
    label: 'Instalar o Python',
    hint: 'Abra o instalador baixado e vá até o fim.',
    run: e => (e.instalado
      ? { passed: true }
      : { passed: false, detail: 'O Python ainda não está instalado neste computador.' }),
  },
  {
    id: 'salvouOArquivoPy',
    label: 'Salvar o programa como um arquivo .py',
    hint: 'No Bloco de Notas, o nome precisa terminar em .py — e o tipo do arquivo muda o que é salvo de verdade.',
    run: e => {
      const nomes = Object.keys(e.documentos);
      if (nomes.some(n => n.endsWith('.py'))) return { passed: true };
      const enganado = nomes.find(n => n.includes('.py.'));
      if (enganado) {
        return {
          passed: false,
          detail: `O arquivo foi salvo como "${enganado}". O Bloco de Notas acrescenta .txt quando o tipo é "Documentos de texto" — troque para "Todos os arquivos".`,
        };
      }
      return { passed: false, detail: 'Nenhum arquivo .py em Documentos. Escreva o programa no Bloco de Notas e salve.' };
    },
  },
  {
    id: 'rodouNoPrompt',
    label: 'Executar o programa a partir do arquivo',
    hint: 'No Prompt de Comando, entre na pasta do arquivo e chame o Python com o nome dele.',
    run: e => (e.rodou
      ? { passed: true }
      : { passed: false, detail: 'O programa ainda não rodou pelo prompt. É o requisito 4.2: executar a partir do arquivo, e não de dentro de um editor.' }),
  },
];

const POR_ID = new Map(SPECS.map(s => [s.id, s]));

/** Todos os ids que existem — é contra esta lista que o currículo é conferido. */
export const IDS_DO_AMBIENTE = SPECS.map(s => s.id);

/**
 * Roda as verificações pedidas contra o estado do computador simulado.
 *
 * Id desconhecido não some em silêncio: vira verificação que nunca passa, com o
 * motivo escrito. Ignorar produziria um laboratório com menos tarefas do que a
 * lição prometeu, e ninguém veria.
 */
export function validarAmbiente(estado: EstadoDoAmbiente, ids: string[]): CheckResult[] {
  return ids.map(id => {
    const spec = POR_ID.get(id);
    if (!spec) {
      return {
        id, passed: false, label: id,
        hint: 'Verificação desconhecida.',
        detail: `A lição pede "${id}", que não existe no verificador do ambiente.`,
      };
    }
    const { passed, detail } = spec.run(estado);
    return { id, label: spec.label, hint: spec.hint, passed, detail };
  });
}
