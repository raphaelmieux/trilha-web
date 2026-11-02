import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { OuvirRejeicoes, Pasta } from './nodeSimulado';

/**
 * O mesmo programa no Node de verdade, para as travas compararem.
 *
 * Só existe para os testes: roda o `node` da máquina numa pasta temporária,
 * com os mesmos arquivos, e devolve o que ele escreveu e a pasta depois. O
 * erro é recortado para a forma que o motor escreve — o arquivo e a linha, a
 * linha de código, a seta e a mensagem —, porque o rastro de `node:internal`
 * e o caminho da pasta temporária mudam de máquina para máquina e não dizem
 * nada sobre o programa.
 */
export function rodarNoNode(pasta: Pasta, principal: string): { saida: string; erro: string | null; pasta: Pasta } {
  const dir = mkdtempSync(join(tmpdir(), 'node-de-verdade-'));
  try {
    for (const [nome, conteudo] of Object.entries(pasta)) writeFileSync(join(dir, nome), conteudo);
    let saida = '';
    let erro: string | null = null;
    try {
      saida = execFileSync(process.execPath, [principal], {
        cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000,
        env: { PATH: process.env.PATH ?? '', LANG: 'pt_BR.UTF-8' },
      });
    } catch (e) {
      const x = e as { stdout?: string; stderr?: string };
      saida = x.stdout ?? '';
      erro = recortarErro(x.stderr ?? '', dir);
    }
    const depois: Pasta = {};
    for (const nome of readdirSync(dir)) depois[nome] = readFileSync(join(dir, nome), 'utf8');
    return { saida, erro, pasta: depois };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function recortarErro(stderr: string, dir: string): string {
  let texto = stderr;
  texto = texto.replace(new RegExp(`^(?:file://)?${dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(\\S+):(\\d+)$`, 'm'), '$1:$2');
  texto = texto.split(dir).join('/projeto');
  const fim: string[] = [];
  for (const l of texto.split('\n')) {
    if (/^\s+at /.test(l) || /^Node\.js v/.test(l)) break;
    fim.push(l);
  }
  return fim.join('\n').replace(/\n+$/, '');
}

/** Onde o teste ouve a promessa rejeitada sem tratamento: no `process`, como o worker ouve em `self`. */
export const ouvirNoTeste: OuvirRejeicoes = aoRejeitar => {
  const h = (m: unknown) => aoRejeitar(m);
  process.on('unhandledRejection', h);
  return () => { process.off('unhandledRejection', h); };
};
