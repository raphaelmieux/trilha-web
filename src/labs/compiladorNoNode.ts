import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { compilarPasta, emPortugues, libsDaPasta, libsNecessarias, type ModuloTs, type Pasta, type ResultadoDaCompilacao } from './compiladorTs';

/**
 * O compilador da CC-FE005 para as travas: o mesmo `compilarPasta` da tela,
 * com o `typescript` e as bibliotecas lidos do `node_modules`, e as mensagens
 * em português — as mesmas que o worker carrega.
 *
 * Só as travas importam este arquivo.
 */
const exigir = createRequire(import.meta.url);
export const ts = exigir('typescript') as ModuloTs;
emPortugues(ts, exigir('typescript/lib/pt-br/diagnosticMessages.generated.json'));

const PASTA_DAS_LIBS = exigir.resolve('typescript/lib/lib.es5.d.ts').replace(/lib\.es5\.d\.ts$/, '');
const cache: Pasta = {};

export async function compilarNoNode(pasta: Pasta): Promise<ResultadoDaCompilacao> {
  const libs = await libsNecessarias(libsDaPasta(ts, pasta), async nome => {
    if (!(nome in cache)) {
      const c = `${PASTA_DAS_LIBS}${nome}`;
      if (!existsSync(c)) return null;
      cache[nome] = readFileSync(c, 'utf8');
    }
    return cache[nome];
  });
  return compilarPasta(ts, libs, pasta);
}
