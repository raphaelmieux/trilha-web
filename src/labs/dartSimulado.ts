import { lerArquivoDart, ErroDeSintaxe, NaoSuportado, type ArquivoDart } from './dartSintaxe';
import { analisarDart, type Problema } from './dartAnalisador';
import { executarDart } from './dartExecucao';
import { linhaEColuna } from './dartLexico';

/**
 * `dart run clube.dart`, no navegador.
 *
 * Três etapas, como no Dart: ler, conferir os tipos, rodar. Se a leitura ou a
 * conferência acham erro, **nada roda** — é a diferença entre uma linguagem
 * compilada e o Python ou o JavaScript, que as duas primeiras veredas
 * ensinaram, e o requisito 2.1 manda definir compilação justamente por isso.
 *
 * A pasta é um mapa de nome para texto, como a do Python e a do Node: o
 * principal e os arquivos que ele importa.
 */

export type PastaDart = Record<string, string>;

export interface ResultadoDoDart {
  saida: string;
  /** O que o terminal mostra depois da saída: os erros de compilação ou a exceção. */
  erro: string | null;
  /** Os erros que impediram de rodar; vazio quando compilou. */
  problemas: Problema[];
  semFim: boolean;
  /** As árvores lidas, para a análise das tarefas; vazio quando a leitura falhou. */
  arvores: ArquivoDart[];
}

/** Lê o principal e o que ele importa, sem repetir arquivo. */
export function lerPrograma(pasta: PastaDart, principal: string): { arvores: ArquivoDart[]; problemas: Problema[] } {
  const arvores: ArquivoDart[] = [];
  const problemas: Problema[] = [];
  const vistos = new Set<string>();
  const ler = (nome: string, deOnde?: { arquivo: string; ini: number; fim: number }) => {
    if (vistos.has(nome)) return;
    vistos.add(nome);
    const fonte = pasta[nome];
    if (fonte === undefined) {
      if (deOnde) {
        problemas.push({ arquivo: deOnde.arquivo, ini: deOnde.ini, fim: deOnde.fim, mensagem: `Error when reading '${nome}': No such file or directory` });
      }
      return;
    }
    try {
      const a = lerArquivoDart(nome, fonte);
      arvores.push(a);
      for (const im of a.importacoes) {
        if (!im.uri.startsWith('dart:') && !im.uri.startsWith('package:')) {
          const ini = fonte.indexOf(`'${im.uri}'`, im.ini) >= 0 ? fonte.indexOf(`'${im.uri}'`, im.ini) : fonte.indexOf(`"${im.uri}"`, im.ini);
          ler(im.uri, { arquivo: nome, ini, fim: ini + im.uri.length + 2 });
        }
      }
    } catch (e) {
      if (e instanceof ErroDeSintaxe) problemas.push({ arquivo: nome, ini: e.ini, fim: e.fim, mensagem: e.message });
      else if (e instanceof NaoSuportado) problemas.push({ arquivo: nome, ini: e.ini, fim: e.fim, mensagem: e.message, foraDoSimulador: true });
      else throw e;
    }
  };
  ler(principal);
  return { arvores, problemas };
}

export function executarProgramaDart(pasta: PastaDart, principal: string, entrada: string[] = []): ResultadoDoDart {
  const lido = lerPrograma(pasta, principal);
  if (lido.problemas.length) {
    return { saida: '', erro: formatarProblemas(lido.problemas, pasta), problemas: lido.problemas, semFim: false, arvores: lido.arvores };
  }
  const analise = analisarDart(lido.arvores);
  if (analise.problemas.length) {
    const ordenados = ordenar(analise.problemas, lido.arvores);
    return { saida: '', erro: formatarProblemas(ordenados, pasta), problemas: ordenados, semFim: false, arvores: lido.arvores };
  }
  const r = executarDart(lido.arvores, {
    entrada, comoDouble: analise.comoDouble, conjuntosVazios: analise.conjuntosVazios,
    importados: analise.importados, prefixos: analise.prefixos,
  });
  return { saida: r.saida, erro: r.erro, problemas: [], semFim: r.semFim, arvores: lido.arvores };
}

/* Os erros na ordem dos arquivos e, dentro de cada um, na ordem do texto. */
function ordenar(problemas: Problema[], arvores: ArquivoDart[]): Problema[] {
  const ordem = new Map(arvores.map((a, i) => [a.arquivo, i]));
  return [...problemas].sort((a, b) => (ordem.get(a.arquivo) ?? 0) - (ordem.get(b.arquivo) ?? 0) || a.ini - b.ini);
}

/**
 * Os erros como o `dart run` os escreve: o arquivo, a linha e a coluna, a
 * mensagem, a dica, a linha do código e a seta embaixo do que está errado.
 * O que é limite do simulador sai em português e marcado como tal — não é
 * erro do programa, e confundir os dois faria a pessoa procurar defeito onde
 * não há.
 */
export function formatarProblemas(problemas: Problema[], pasta: PastaDart): string {
  return problemas.map(p => {
    const fonte = pasta[p.arquivo] ?? '';
    const { linha, coluna } = linhaEColuna(fonte, p.ini);
    const textoDaLinha = fonte.split('\n')[linha - 1] ?? '';
    const largura = Math.max(1, Math.min(p.fim - p.ini, textoDaLinha.length - coluna + 1));
    const seta = `${' '.repeat(coluna - 1)}${'^'.repeat(largura)}`;
    const rotulo = p.foraDoSimulador ? 'Fora do simulador' : 'Error';
    const partes = [`${p.arquivo}:${linha}:${coluna}: ${rotulo}: ${p.mensagem}`];
    if (p.dica) partes.push(p.dica);
    partes.push(textoDaLinha, seta);
    return partes.join('\n');
  }).join('\n');
}

/** A primeira linha de cada erro — o que as travas comparam com o `dart` de verdade. */
export function linhasDeErro(texto: string | null): string[] {
  if (!texto) return [];
  return texto.split('\n').filter(l => /^\S+\.dart:\d+:\d+: Error: /.test(l));
}
