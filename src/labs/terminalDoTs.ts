import type { Pasta, ResultadoDaCompilacao } from './compiladorTs';
import { TSCONFIG_DO_INIT, comoOTscEscreve } from './compiladorTs';
import type { ResultadoDoNode } from './nodeSimulado';

/**
 * O terminal da CC-FE005: `tsc`, `node` e o pouco que se usa em volta.
 *
 * ── Por que um terminal, e não um botão ──────────────────────────────────
 * O requisito 5 pede **configurar** o projeto com o compilador e mostrar o
 * erro apontado antes da execução. As duas coisas acontecem digitando: o
 * `tsc --init` cria o tsconfig, o `tsc` compila, o `node` roda o que saiu. E
 * a ordem é a lição — `tsc && node programa.js` não chega ao `node` quando o
 * compilador acha erro, porque o `tsc` sai com código diferente de zero. Um
 * botão "Compilar e executar" esconderia justamente a parte que se aprende.
 *
 * O botão Executar existe mesmo assim, e o que ele faz é **digitar** essa
 * linha: quem clica vê o comando que rodou.
 *
 * ── O que o tsc de verdade faz, e este também ────────────────────────────
 * Gera o `.js` mesmo com erro de tipo. É o comportamento de fábrica, e é o
 * que mais surpreende: o TypeScript avisa, e não impede. O `node` roda o que
 * foi gerado, e o erro que o compilador apontou acontece ao rodar. Quem quer
 * que o erro segure a saída liga `noEmitOnError` — e é aí que "apontado
 * antes da execução" passa a valer de verdade.
 *
 * Este arquivo não sabe compilar nem rodar: recebe as duas coisas. Na tela
 * são o worker do compilador e o do Node; nas travas, o `typescript` do
 * `node_modules` e o Node simulado na mesma thread.
 */

export interface Ambiente {
  compilar: (pasta: Pasta) => Promise<ResultadoDaCompilacao>;
  rodar: (pasta: Pasta, principal: string) => Promise<ResultadoDoNode>;
  versao: string;
}

export interface PassoDoTerminal {
  comando: string;
  saida: string;
  /** Diferente de zero, o `&&` para. */
  codigo: number;
  tipo: 'tsc' | 'tsc-init' | 'node' | 'outro';
  compilacao?: ResultadoDaCompilacao;
  execucao?: ResultadoDoNode;
  /** A pasta depois do comando — o que o tsc gerou, o que o node gravou. */
  pasta: Pasta;
}

const resumoDosErros = (n: number) => (n === 1 ? 'Encontrado 1 erro.' : `Encontrados ${n} erros.`);

const ajudaDoTsc = (versao: string) => `Versão ${versao}
tsc: o Compilador TypeScript

COMANDOS COMUNS

  tsc
  Compila o projeto atual (tsconfig.json no diretório de trabalho).

  tsc app.ts util.ts
  Ignora a configuração e compila os arquivos especificados com as opções padrão.

  tsc --init
  Cria um tsconfig.json com as configurações recomendadas no diretório de trabalho.

  tsc --noEmit
  Confere os tipos sem gerar nenhum arquivo.
`;

/** As partes de uma linha, divididas pelo `&&`, cada uma já em palavras. */
export function partirLinha(linha: string): string[][] {
  return linha.split('&&').map(p => p.trim().split(/\s+/).filter(Boolean)).filter(p => p.length > 0);
}

async function tsc(args: string[], pasta: Pasta, amb: Ambiente): Promise<Omit<PassoDoTerminal, 'comando'>> {
  if (args.includes('--init')) {
    if ('tsconfig.json' in pasta) {
      return { tipo: 'tsc-init', codigo: 1, pasta, saida: "error TS5054: Um arquivo 'tsconfig.json' já está definido em: '/projeto/tsconfig.json'.\n" };
    }
    const nova = { ...pasta, 'tsconfig.json': TSCONFIG_DO_INIT };
    return {
      tipo: 'tsc-init', codigo: 0, pasta: nova,
      saida: '\nArquivo tsconfig.json criado com êxito.\nAbra o tsconfig.json no editor para ler o que cada opção faz.\n',
    };
  }
  if (args.some(a => a === '--version' || a === '-v')) return { tipo: 'outro', codigo: 0, pasta, saida: `Version ${amb.versao}\n` };
  if (args.some(a => a === '--help' || a === '-h')) return { tipo: 'outro', codigo: 0, pasta, saida: ajudaDoTsc(amb.versao) };

  const semEmitir = args.includes('--noEmit');
  const arquivos = args.filter(a => !a.startsWith('-'));
  for (const a of arquivos) {
    if (!(a in pasta)) {
      return { tipo: 'tsc', codigo: 1, pasta, saida: `error TS6053: O arquivo '/projeto/${a}' não foi encontrado.\n` };
    }
  }
  /* Com arquivos na linha, o tsc ignora o tsconfig e usa as opções de
     fábrica — sem modo estrito. É uma armadilha de verdade: o mesmo
     programa passa limpo assim e reprova com o projeto. */
  const projeto: Pasta = arquivos.length > 0
    ? { ...pasta, 'tsconfig.json': JSON.stringify({ compilerOptions: {}, files: arquivos }) }
    : pasta;
  if (!('tsconfig.json' in projeto)) {
    return { tipo: 'tsc', codigo: 1, pasta, saida: ajudaDoTsc(amb.versao) };
  }
  const compilacao = await amb.compilar(projeto);
  const erros = compilacao.diagnosticos;
  const nova = semEmitir ? pasta : { ...pasta, ...compilacao.emitidos };
  const linhas = erros.map(d => `${comoOTscEscreve(d)}\n`);
  const saida = erros.length > 0 ? `${linhas.join('\n')}\n${resumoDosErros(erros.length)}\n` : '';
  return { tipo: 'tsc', codigo: erros.length > 0 ? 2 : 0, compilacao, pasta: nova, saida };
}

async function node(args: string[], pasta: Pasta, amb: Ambiente): Promise<Omit<PassoDoTerminal, 'comando'>> {
  const principal = args.find(a => !a.startsWith('-'));
  if (!principal) {
    return { tipo: 'node', codigo: 1, pasta, saida: 'Este terminal não abre o modo interativo do Node: escreva node e o nome do arquivo.\n' };
  }
  const nome = principal.replace(/^\.\//, '');
  if (!(nome in pasta)) {
    return {
      tipo: 'node', codigo: 1, pasta,
      saida: `node:internal/modules/cjs/loader\n  throw err;\n  ^\n\nError: Cannot find module '/projeto/${nome}'\n    code: 'MODULE_NOT_FOUND'\n\nNode.js v22.0.0\n`,
    };
  }
  const execucao = await amb.rodar(pasta, nome);
  const saida = execucao.saida + (execucao.erro ? `${execucao.saida && !execucao.saida.endsWith('\n') ? '\n' : ''}${execucao.erro}${execucao.erro.endsWith('\n') ? '' : '\n'}` : '');
  return { tipo: 'node', codigo: execucao.erro ? 1 : 0, execucao, pasta: execucao.pasta ?? pasta, saida };
}

/** Roda uma linha do terminal, com o `&&` parando no primeiro que falhar. */
export async function executarLinha(linha: string, pasta: Pasta, amb: Ambiente): Promise<{ pasta: Pasta; passos: PassoDoTerminal[] }> {
  const passos: PassoDoTerminal[] = [];
  let atual = pasta;
  for (const partes of partirLinha(linha)) {
    const [cmd, ...args] = partes;
    const comando = partes.join(' ');
    let r: Omit<PassoDoTerminal, 'comando'>;
    if (cmd === 'tsc' || (cmd === 'npx' && args[0] === 'tsc')) r = await tsc(cmd === 'npx' ? args.slice(1) : args, atual, amb);
    else if (cmd === 'node') r = await node(args, atual, amb);
    else if (cmd === 'ls') r = { tipo: 'outro', codigo: 0, pasta: atual, saida: `${Object.keys(atual).sort((a, b) => a.localeCompare(b)).join('  ')}\n` };
    else if (cmd === 'cat') {
      const nome = (args[0] ?? '').replace(/^\.\//, '');
      r = nome in atual
        ? { tipo: 'outro', codigo: 0, pasta: atual, saida: atual[nome].endsWith('\n') ? atual[nome] : `${atual[nome]}\n` }
        : { tipo: 'outro', codigo: 1, pasta: atual, saida: `cat: ${args[0] ?? ''}: Arquivo ou diretório inexistente\n` };
    } else {
      r = { tipo: 'outro', codigo: 127, pasta: atual, saida: `${cmd}: comando não encontrado\n` };
    }
    passos.push({ comando, ...r });
    atual = r.pasta;
    if (r.codigo !== 0) break;
  }
  return { pasta: atual, passos };
}
