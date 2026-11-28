import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * O mesmo programa no Dart de verdade, para as travas compararem.
 *
 * Só existe para os testes, como o `nodeDeVerdade.ts`: roda o `dart` da
 * máquina numa pasta temporária, com os mesmos arquivos e a mesma entrada.
 * O Dart não vem com a plataforma; o `ci.yml` o instala e liga
 * `EXIGE_DART`, e aí a conferência é obrigatória: `dartDisponivel` reprova
 * quando a variável está ligada e o `dart` não está, para a trava nunca
 * passar por não ter olhado. A variável é do `ci.yml`, e não o `CI` que todo
 * workflow liga: o `deploy.yml` roda os mesmos testes sem o Dart, e o commit
 * que ele publica já passou pela conferência no `ci.yml`.
 */

let disponivel: boolean | null = null;

export function dartDisponivel(): boolean {
  if (disponivel !== null) return disponivel;
  try {
    execFileSync('dart', ['--version'], { stdio: 'ignore', timeout: 30000 });
    disponivel = true;
  } catch {
    disponivel = false;
  }
  if (!disponivel && process.env.EXIGE_DART) {
    throw new Error('O Dart de verdade precisa estar instalado no CI: é contra ele que o simulador da CC-MB001 é conferido. Veja o passo "Dart" do ci.yml.');
  }
  return disponivel;
}

export interface ResultadoDoDartDeVerdade {
  saida: string;
  /** O que saiu no stderr: os erros de compilação ou a exceção. */
  erro: string;
  codigo: number;
}

export function rodarNoDart(pasta: Record<string, string>, principal: string, entrada: string[] = []): ResultadoDoDartDeVerdade {
  const dir = mkdtempSync(join(tmpdir(), 'dart-de-verdade-'));
  try {
    for (const [nome, conteudo] of Object.entries(pasta)) writeFileSync(join(dir, nome), conteudo);
    try {
      const saida = execFileSync('dart', [principal], {
        cwd: dir, encoding: 'utf8', input: entrada.length ? `${entrada.join('\n')}\n` : '',
        stdio: ['pipe', 'pipe', 'pipe'], timeout: 60000,
        env: { ...process.env, LANG: 'pt_BR.UTF-8' },
      });
      return { saida, erro: '', codigo: 0 };
    } catch (e) {
      const x = e as { stdout?: string; stderr?: string; status?: number };
      return { saida: x.stdout ?? '', erro: (x.stderr ?? '').split(dir + '/').join(''), codigo: x.status ?? 1 };
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** As duas primeiras linhas de uma exceção não tratada: o cabeçalho e o que aconteceu. */
export function cabecaDaExcecao(texto: string): string {
  const linhas = texto.split('\n');
  const i = linhas.findIndex(l => l.startsWith('Unhandled exception:'));
  if (i < 0) return '';
  return linhas.slice(i, i + 2).join('\n');
}
