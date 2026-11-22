/**
 * As declarações do Node que o compilador da CC-FE005 enxerga.
 *
 * O programa compilado roda no Node simulado da CC-FE003, e estas são as
 * peças que ele tem: o `console`, o `process`, os temporizadores, o `fs` com
 * as funções de ler e gravar arquivo, e o `path`. Declarar o Node inteiro —
 * o `@types/node` de verdade — diria ao compilador que existe o que o
 * simulado não tem, e o programa passaria pela verificação para estourar ao
 * rodar, que é o contrário do que esta vereda ensina.
 *
 * Os nomes dos parâmetros são em inglês, como no `@types/node`: é o que a
 * pessoa vai ler no computador do clube, ao passar o mouse sobre a função.
 *
 * Ela entra como arquivo de declaração escondido, e não como o
 * `node_modules/@types/node` que o projeto de verdade instalaria: é o
 * ambiente em que o programa roda, e não uma dependência que a lição ensina a
 * pôr.
 */
export const NOME_DOS_TIPOS_DO_NODE = '/__trilha/node.d.ts';

export const TIPOS_DO_NODE = `declare var console: {
  log(...data: any[]): void;
  info(...data: any[]): void;
  warn(...data: any[]): void;
  error(...data: any[]): void;
  table(tabularData: any): void;
};

declare var process: {
  argv: string[];
  exitCode: number | undefined;
  exit(code?: number): never;
  env: Record<string, string | undefined>;
};

declare function setTimeout(callback: (...args: any[]) => void, ms?: number, ...args: any[]): number;
declare function clearTimeout(id: number | undefined): void;
declare function setInterval(callback: (...args: any[]) => void, ms?: number, ...args: any[]): number;
declare function clearInterval(id: number | undefined): void;

declare var require: (id: string) => any;
declare var module: { exports: any };
declare var exports: any;
declare var __dirname: string;
declare var __filename: string;

interface NodeBuffer {
  toString(encoding?: string): string;
  length: number;
}

declare module 'fs' {
  namespace fs {
    type Codificacao = 'utf8' | 'utf-8';
    function readFileSync(path: string, options: Codificacao | { encoding: Codificacao }): string;
    function readFileSync(path: string): NodeBuffer;
    function writeFileSync(path: string, data: string): void;
    function appendFileSync(path: string, data: string): void;
    function existsSync(path: string): boolean;
    function readdirSync(path: string): string[];
    function unlinkSync(path: string): void;
    function mkdirSync(path: string, options?: { recursive?: boolean }): void;
    namespace promises {
      function readFile(path: string, options: Codificacao | { encoding: Codificacao }): Promise<string>;
      function writeFile(path: string, data: string): Promise<void>;
    }
  }
  export = fs;
}

declare module 'node:fs' {
  import fs = require('fs');
  export = fs;
}

declare module 'fs/promises' {
  import fs = require('fs');
  export = fs.promises;
}

declare module 'node:fs/promises' {
  import fs = require('fs');
  export = fs.promises;
}

declare module 'path' {
  namespace path {
    function join(...paths: string[]): string;
    function resolve(...paths: string[]): string;
  }
  export = path;
}

declare module 'node:path' {
  import path = require('path');
  export = path;
}
`;
