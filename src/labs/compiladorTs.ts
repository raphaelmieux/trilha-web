import type * as TS from 'typescript';
import { NOME_DOS_TIPOS_DO_NODE, TIPOS_DO_NODE } from './tiposDoNodeSimulado';

/**
 * O compilador da CC-FE005: o `tsc` de verdade, sobre uma pasta em memória.
 *
 * ── Por que o compilador de verdade ──────────────────────────────────────
 * É a regra da CC002 e da CC005: o motor que confere é o motor que o
 * computador do clube vai usar. Um verificador de tipos escrito aqui
 * discordaria do TypeScript no primeiro caso que ninguém previu — e o caso
 * que ninguém previu é justamente o que quem está aprendendo escreve. O
 * pacote é Apache-2.0, e as mensagens em português vêm nele: são as que o
 * editor do clube mostra quando está em português.
 *
 * Este arquivo não importa o `typescript`: recebe o módulo. O pacote tem
 * nove megabytes, e quem o carrega é o worker, sob demanda, e as travas,
 * pelo Node. A tela que só desenha a lição não o arrasta junto.
 *
 * ── A pasta é o projeto ──────────────────────────────────────────────────
 * Como no `tsc`: com `tsconfig.json`, valem as opções dele e entram os `.ts`
 * da pasta; sem ele, o `tsc` sozinho não compila nada e responde com a
 * ajuda, e é por isso que o requisito 5 começa criando o arquivo. O que se
 * gera vai para a pasta — ao lado do `.ts`, ou no `outDir` —, e o `node`
 * roda o que foi gerado, e não o que foi escrito.
 */

export type ModuloTs = typeof TS;
export type Pasta = Record<string, string>;

export interface Diagnostico {
  arquivo: string | null;
  linha: number | null;
  coluna: number | null;
  codigo: number;
  mensagem: string;
}

export interface ResultadoDaCompilacao {
  /** O `tsc` nem chegou a compilar — sem tsconfig, ou com um que não se lê. */
  semProjeto: boolean;
  diagnosticos: Diagnostico[];
  /** Os arquivos gerados, pelo caminho na pasta. Vazio quando `noEmitOnError` segurou. */
  emitidos: Pasta;
  opcoes: OpcoesResumidas;
}

/** O que da configuração a lição e a tela precisam saber. */
export interface OpcoesResumidas {
  strict: boolean;
  noEmitOnError: boolean;
  outDir: string | null;
  noImplicitAny: boolean;
  strictNullChecks: boolean;
}

/**
 * O `tsconfig.json` que o `tsc --init` escreve, enxuto.
 *
 * O de verdade tem cem linhas, quase todas comentadas, e é por elas que se
 * aprende o que existe. Aqui ficam as que valem no arquivo gerado mais as
 * três que as lições mandam mexer, comentadas, para a pessoa as achar onde o
 * `tsc --init` as põe. Os comentários continuam em inglês, porque é assim
 * que o arquivo sai no computador do clube.
 */
export const TSCONFIG_DO_INIT = `{
  "compilerOptions": {
    /* Language and Environment */
    "target": "es2016",                         /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */

    /* Modules */
    "module": "commonjs",                       /* Specify what module code is generated. */
    // "rootDir": "./",                         /* Specify the root folder within your source files. */

    /* Emit */
    // "outDir": "./",                          /* Specify an output folder for all emitted files. */
    // "noEmitOnError": true,                   /* Disable emitting files if any type checking errors are reported. */

    /* Interop Constraints */
    "esModuleInterop": true,                    /* Emit additional JavaScript to ease support for importing CommonJS modules. */
    "forceConsistentCasingInFileNames": true,   /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": true,                             /* Enable all strict type-checking options. */

    /* Completeness */
    "skipLibCheck": true                        /* Skip type checking all .d.ts files. */
  }
}
`;

const RAIZ = '/projeto';
const absoluto = (nome: string) => `${RAIZ}/${nome.replace(/^\.\//, '')}`;
const relativo = (caminho: string) => caminho.startsWith(`${RAIZ}/`) ? caminho.slice(RAIZ.length + 1) : caminho;
const LIB = '/__lib/';

/**
 * A biblioteca padrão sem o navegador.
 *
 * Sem `lib` no tsconfig, o TypeScript escolhe a da versão do `target` com o
 * `.full` — que traz o DOM inteiro, e com ele o `document` e o `window`. O
 * programa daqui roda no Node, e o DOM declarado deixaria passar um
 * `document.querySelector` que estoura ao rodar. Fica a mesma versão, sem o
 * navegador.
 */
function libsDasOpcoes(ts: ModuloTs, opcoes: TS.CompilerOptions): string[] {
  if (opcoes.lib && opcoes.lib.length > 0) return opcoes.lib.map(l => l.replace(/^.*\//, ''));
  const padrao = ts.getDefaultLibFileName(opcoes);
  return [padrao === 'lib.d.ts' ? 'lib.es5.d.ts' : padrao.replace('.full.d.ts', '.d.ts')];
}

/** Os arquivos de biblioteca que um conjunto de raízes puxa, seguindo os `/// <reference lib>`. */
export async function libsNecessarias(raizes: string[], carregar: (nome: string) => Promise<string | null>): Promise<Pasta> {
  const libs: Pasta = {};
  const fila = [...raizes];
  while (fila.length > 0) {
    const nome = fila.shift()!;
    if (nome in libs) continue;
    const texto = await carregar(nome);
    if (texto === null) continue;
    libs[nome] = texto;
    for (const m of texto.matchAll(/\/\/\/\s*<reference\s+lib="([^"]+)"/g)) fila.push(`lib.${m[1].toLowerCase()}.d.ts`);
  }
  return libs;
}

/** Lê o tsconfig da pasta. `null` quando não há arquivo. */
export function lerTsconfig(ts: ModuloTs, pasta: Pasta): { opcoes: TS.CompilerOptions; raizes: string[]; erros: Diagnostico[] } | null {
  if (!('tsconfig.json' in pasta)) return null;
  const host: TS.ParseConfigHost = {
    useCaseSensitiveFileNames: true,
    fileExists: c => relativo(c) in pasta,
    readFile: c => pasta[relativo(c)],
    readDirectory: (_raiz, extensoes) => Object.keys(pasta)
      .filter(n => (extensoes ?? []).some(e => n.endsWith(e)) && !n.endsWith('.d.ts'))
      .filter(n => !/^(node_modules|dist)\//.test(n))
      .map(absoluto),
  };
  const lido = ts.parseConfigFileTextToJson(absoluto('tsconfig.json'), pasta['tsconfig.json']);
  if (lido.error) return { opcoes: {}, raizes: [], erros: [paraDiagnostico(ts, lido.error)] };
  const r = ts.parseJsonConfigFileContent(lido.config, host, RAIZ, undefined, absoluto('tsconfig.json'));
  /* Um tsconfig sem nenhum .ts por perto responde TS18003 — é o que o tsc
     de verdade diz, e é útil: avisa que a pasta está vazia. */
  return { opcoes: r.options, raizes: r.fileNames, erros: r.errors.map(e => paraDiagnostico(ts, e)) };
}

/** As raízes de biblioteca que a compilação da pasta vai pedir. */
export function libsDaPasta(ts: ModuloTs, pasta: Pasta): string[] {
  const cfg = lerTsconfig(ts, pasta);
  return libsDasOpcoes(ts, cfg?.opcoes ?? {});
}

function paraDiagnostico(ts: ModuloTs, d: TS.Diagnostic): Diagnostico {
  const mensagem = ts.flattenDiagnosticMessageText(d.messageText, '\n');
  if (!d.file || d.start === undefined) return { arquivo: null, linha: null, coluna: null, codigo: d.code, mensagem };
  const p = d.file.getLineAndCharacterOfPosition(d.start);
  return { arquivo: relativo(d.file.fileName), linha: p.line + 1, coluna: p.character + 1, codigo: d.code, mensagem };
}

export function resumirOpcoes(o: TS.CompilerOptions): OpcoesResumidas {
  const strict = o.strict === true;
  return {
    strict,
    noEmitOnError: o.noEmitOnError === true,
    outDir: o.outDir ? relativo(o.outDir).replace(/\/$/, '') || '.' : null,
    noImplicitAny: o.noImplicitAny ?? strict,
    strictNullChecks: o.strictNullChecks ?? strict,
  };
}

/**
 * Compila a pasta como o `tsc` compilaria, com o tsconfig dela.
 *
 * `libs` precisa trazer os arquivos de biblioteca que `libsDaPasta` pediu —
 * o compilador é síncrono e não tem como ir buscá-los no meio.
 */
export function compilarPasta(ts: ModuloTs, libs: Pasta, pasta: Pasta): ResultadoDaCompilacao {
  const cfg = lerTsconfig(ts, pasta);
  if (!cfg) {
    return { semProjeto: true, diagnosticos: [], emitidos: {}, opcoes: resumirOpcoes({}) };
  }
  if (cfg.erros.length > 0 && cfg.raizes.length === 0) {
    return { semProjeto: false, diagnosticos: cfg.erros, emitidos: {}, opcoes: resumirOpcoes(cfg.opcoes) };
  }
  const opcoes: TS.CompilerOptions = { ...cfg.opcoes, lib: libsDasOpcoes(ts, cfg.opcoes), types: [] };
  const emitidos: Pasta = {};
  const host = hospedeiro(ts, libs, pasta, opcoes, emitidos);
  const programa = ts.createProgram([...cfg.raizes, NOME_DOS_TIPOS_DO_NODE], opcoes, host);
  const antes = ts.getPreEmitDiagnostics(programa);
  const emissao = programa.emit();
  /* Com noEmitOnError, a emissão devolve de novo os erros da verificação —
     é por eles que ela desistiu de gerar —, e somar as duas listas dizia
     "Encontrados 2 erros" de um erro só, escrito duas vezes no terminal. */
  const vistos = new Set<string>();
  const todos = [...cfg.erros.map(e => ({ ...e })), ...[...antes, ...emissao.diagnostics].map(d => paraDiagnostico(ts, d))]
    .filter(d => {
      const chave = `${d.arquivo}:${d.linha}:${d.coluna}:${d.codigo}:${d.mensagem}`;
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
  return {
    semProjeto: false,
    diagnosticos: todos.filter(d => d.arquivo === null || !d.arquivo.startsWith('/__')),
    emitidos,
    opcoes: resumirOpcoes(cfg.opcoes),
  };
}

function hospedeiro(ts: ModuloTs, libs: Pasta, pasta: Pasta, opcoes: TS.CompilerOptions, emitidos: Pasta): TS.CompilerHost {
  const ler = (caminho: string): string | undefined => {
    if (caminho === NOME_DOS_TIPOS_DO_NODE) return TIPOS_DO_NODE;
    if (caminho.startsWith(LIB)) return libs[caminho.slice(LIB.length)];
    return pasta[relativo(caminho)];
  };
  return {
    getSourceFile: (nome, versao) => {
      const texto = ler(nome);
      return texto === undefined ? undefined : ts.createSourceFile(nome, texto, versao);
    },
    getDefaultLibFileName: () => `${LIB}${libsDasOpcoes(ts, opcoes)[0]}`,
    getDefaultLibLocation: () => LIB.slice(0, -1),
    writeFile: (nome, texto) => { emitidos[relativo(nome)] = texto; },
    getCurrentDirectory: () => RAIZ,
    getCanonicalFileName: n => n,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    fileExists: n => ler(n) !== undefined,
    readFile: n => ler(n),
    directoryExists: d => d === RAIZ || d.startsWith(LIB.slice(0, -1)) || Object.keys(pasta).some(n => absoluto(n).startsWith(`${d}/`)),
    getDirectories: () => [],
  };
}

/**
 * As mensagens do compilador em português.
 *
 * `setLocalizedDiagnosticMessages` é exportada pelo pacote e não aparece nos
 * tipos dele: é por ela que o `tsc --locale pt-br` e o editor em português
 * trocam a língua. As mensagens são as do próprio pacote, as mesmas que o
 * editor do clube mostra.
 */
export function emPortugues(ts: ModuloTs, mensagens: unknown): void {
  const consertadas = { ...(mensagens as Record<string, string>), ...TRADUCOES_CONSERTADAS };
  (ts as unknown as { setLocalizedDiagnosticMessages: (m: unknown) => void }).setLocalizedDiagnosticMessages(consertadas);
}

/**
 * As traduções do pacote que saem quebradas, consertadas aqui.
 *
 * A TS2820 — o valor que quase casa com uma união de palavras, o "Diretor"
 * com maiúscula do módulo 5 — chega em português com o primeiro valor
 * perdido e os outros dois trocados de lugar: "O tipo '' não pode ser
 * atribuído ao tipo "Diretor" 'Cargo'". É a mensagem que a lição de união
 * existe para mostrar, e quebrada ela ensina que o compilador fala
 * enrolado. `compiladorTs.test.ts` confere a frase inteira.
 */
const TRADUCOES_CONSERTADAS: Record<string, string> = {
  Type_0_is_not_assignable_to_type_1_Did_you_mean_2_2820: "O tipo '{0}' não pode ser atribuído ao tipo '{1}'. Você quis dizer '{2}'?",
};

/** Uma linha como o `tsc` a escreve no terminal. */
export function comoOTscEscreve(d: Diagnostico): string {
  const onde = d.arquivo ? `${d.arquivo}${d.linha !== null ? `:${d.linha}:${d.coluna}` : ''} - ` : '';
  return `${onde}error TS${d.codigo}: ${d.mensagem}`;
}
