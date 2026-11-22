import { describe, it, expect } from 'vitest';
import { compilarNoNode, ts } from './compiladorNoNode';
import { analisarTs } from './analiseTs';
import { executarLinha, type Ambiente } from './terminalDoTs';
import { executarNode } from './nodeSimulado';
import { ouvirNoTeste } from './nodeDeVerdade';
import {
  LICOES_DA_CC_FE005, fontesDe, type ContextoDoTs, type LicaoDaCcFe005, type PassoComFontes,
} from './metasDaCcFe005';
import { CORRECAO_DO_CAMPORI, REFERENCIAS_DA_CC_FE005, type Referencia } from './referenciasDaCcFe005';
import type { Pasta } from './compiladorTs';

/*
  Os oito laboratórios da CC-FE005, conferidos com o compilador de verdade.

  Cada modelo abre com a lista inteira vermelha, e cada solução de referência
  — os arquivos escritos e os comandos rodados, na ordem — a fecha inteira.
  Os quase-certos embaixo são os atalhos que as lições nomeiam, e cada um
  derruba a tarefa que existe para ele: calar o compilador com "any", "as" ou
  "!" não é eliminar o erro.
*/

export const AMBIENTE: Ambiente = {
  compilar: compilarNoNode,
  rodar: (p, m) => executarNode(p, m, { ouvirRejeicoes: ouvirNoTeste }),
  versao: ts.version,
};

const LICOES = Object.keys(LICOES_DA_CC_FE005) as LicaoDaCcFe005[];

async function verificar(pasta: Pasta) {
  const compilacao = await compilarNoNode(pasta);
  const analise = Object.fromEntries(Object.entries(pasta)
    .filter(([n]) => n.endsWith('.ts') && !n.endsWith('.d.ts'))
    .map(([n, t]) => [n, analisarTs(ts, t, n)]));
  return { compilacao, analise };
}

/** Uma sessão: a pasta de partida, e cada passo da referência aplicado em ordem. */
async function sessao(licao: LicaoDaCcFe005, refs: Referencia[]): Promise<ContextoDoTs> {
  const def = LICOES_DA_CC_FE005[licao];
  let pasta: Pasta = { ...def.arquivos };
  const historico: PassoComFontes[] = [];
  const rodar = async (linha: string) => {
    const fontes = fontesDe(pasta, def.editaveis);
    const r = await executarLinha(linha, pasta, AMBIENTE);
    pasta = r.pasta;
    historico.push(...r.passos.map(p => ({ ...p, fontes })));
  };
  for (const ref of refs) {
    for (const l of ref.antes) await rodar(l);
    pasta = { ...pasta, ...ref.arquivos };
    for (const l of ref.depois) await rodar(l);
  }
  return { pasta, verificacao: await verificar(pasta), historico };
}

const referencias = (l: LicaoDaCcFe005): Referencia[] =>
  (l === 'projeto' ? [REFERENCIAS_DA_CC_FE005.projeto, CORRECAO_DO_CAMPORI] : [REFERENCIAS_DA_CC_FE005[l]]);

const feitas = (l: LicaoDaCcFe005, ctx: ContextoDoTs) => LICOES_DA_CC_FE005[l].metas.filter(m => m.feita(ctx)).map(m => m.id);
const todas = (l: LicaoDaCcFe005) => LICOES_DA_CC_FE005[l].metas.map(m => m.id);

describe('os laboratórios da CC-FE005', () => {
  it('são oito, e toda meta tem passo a passo', () => {
    expect(LICOES).toHaveLength(8);
    for (const l of LICOES) for (const m of LICOES_DA_CC_FE005[l].metas) expect(m.passos.length, `${l}/${m.id}`).toBeGreaterThan(0);
  });

  it.each(LICOES)('%s abre com a lista inteira vermelha', async licao => {
    expect(feitas(licao, await sessao(licao, []))).toEqual([]);
  }, 30000);

  /* Rodar é parte das tarefas — ver o compilador apontar é uma delas —, e
     por isso a conta acima é sem comando nenhum. Mas rodar o modelo do jeito
     que o botão roda não pode entregar a saída: senão a lição se vence
     clicando em Executar. */
  it.each(LICOES)('rodar o modelo de %s não fecha a saída', async licao => {
    const ctx = await sessao(licao, [{ antes: [], arquivos: {}, depois: [LICOES_DA_CC_FE005[licao].executar] }]);
    expect(feitas(licao, ctx)).not.toContain('saida');
  }, 30000);

  it.each(LICOES)('a solução de %s fecha a lista inteira', async licao => {
    const ctx = await sessao(licao, referencias(licao));
    const abertas = LICOES_DA_CC_FE005[licao].metas.filter(m => !m.feita(ctx)).map(m => `${m.id}: ${m.motivo?.(ctx) ?? ''}`);
    expect(abertas).toEqual([]);
    expect(feitas(licao, ctx)).toEqual(todas(licao));
  }, 30000);
});

describe('os atalhos que as lições nomeiam', () => {
  const com = async (licao: LicaoDaCcFe005, troca: (t: string) => string, arquivo = LICOES_DA_CC_FE005[licao].abre) => {
    const ref = REFERENCIAS_DA_CC_FE005[licao];
    return sessao(licao, [{ ...ref, arquivos: { ...ref.arquivos, [arquivo]: troca(ref.arquivos[arquivo]) } }]);
  };
  const falham = (l: LicaoDaCcFe005, ctx: ContextoDoTs) => LICOES_DA_CC_FE005[l].metas.filter(m => !m.feita(ctx)).map(m => m.id);

  it('o telefone forçado com "!" compila e não trata a falta', async () => {
    const ctx = await com('uniao', t => t.replace("  if (p.telefone === undefined) return `${p.nome}: sem telefone`;\n", '')
      .replace('p.telefone.replace', 'p.telefone!.replace'));
    expect(falham('uniao', ctx)).toContain('trata-a-falta');
  }, 30000);

  it('o cargo que continua texto livre não vale por união', async () => {
    const ctx = await com('uniao', t => t.replace('cargo: Cargo;', 'cargo: string;'));
    expect(falham('uniao', ctx)).toContain('cargo');
  }, 30000);

  it('a genérica que devolve any passa pela conta do any', async () => {
    const ctx = await com('generico', t => t.replace('): T | undefined {', '): any {'));
    expect(falham('generico', ctx)).toEqual(['sem-any']);
  }, 30000);

  it('o ranking calado com "as any" não vale por convertido', async () => {
    const ctx = await com('converter', t => t.replace("JSON.parse(readFileSync(arquivo, 'utf8'))", "JSON.parse(readFileSync(arquivo, 'utf8')) as any"));
    expect(falham('converter', ctx)).toEqual(['sem-calar']);
  }, 30000);

  it('o ranking com // @ts-ignore no lugar do tipo não vale', async () => {
    const ctx = await com('converter', t => t.replace('function carregar(arquivo: string): Registro[] {', '// @ts-ignore\nfunction carregar(arquivo): Registro[] {'));
    expect(falham('converter', ctx)).toContain('sem-calar');
  }, 30000);

  it('tirar o tipo do parâmetro junto com os redundantes reprova', async () => {
    const ctx = await com('inferencia', t => t.replace('function media(valores: number[]): number {', 'function media(valores): number {'));
    expect(falham('inferencia', ctx)).toContain('sem-repeticao');
  }, 30000);

  it('a saída de um .ts mexido depois do último tsc não vale', async () => {
    const ref = REFERENCIAS_DA_CC_FE005.anotar;
    const ctx = await sessao('anotar', [ref, { antes: [], arquivos: { 'programa.ts': `${ref.arquivos['programa.ts']}\n// mais uma linha\n` }, depois: [] }]);
    expect(falham('anotar', ctx)).toEqual(['saida']);
  }, 30000);

  it('no campori, consertar antes de ver o erro segurar a saída deixa a demonstração por fazer', async () => {
    const ctx = await sessao('projeto', [
      { antes: ['tsc --init'], arquivos: REFERENCIAS_DA_CC_FE005.projeto.arquivos, depois: [] },
      CORRECAO_DO_CAMPORI,
    ]);
    expect(falham('projeto', ctx)).toEqual(['segurou']);
  }, 30000);

  it('no campori, com noEmitOnError, o erro aparece uma vez só e nada é gerado', async () => {
    const ctx = await sessao('projeto', [REFERENCIAS_DA_CC_FE005.projeto]);
    const tscs = ctx.historico.filter(p => p.tipo === 'tsc' && p.compilacao);
    const ultimo = tscs[tscs.length - 1];
    expect(ultimo.compilacao!.diagnosticos.map(d => d.codigo)).toEqual([2345]);
    expect(ultimo.saida).toContain('Encontrado 1 erro.');
    expect(ultimo.compilacao!.emitidos).toEqual({});
  }, 30000);

  it('no campori, sem noEmitOnError o tsc aponta o erro e gera o JavaScript mesmo assim', async () => {
    const ctx = await sessao('projeto', [{ antes: ['tsc --init', 'tsc'], arquivos: {}, depois: [] }]);
    const tscs = ctx.historico.filter(p => p.tipo === 'tsc');
    const tsc = tscs[tscs.length - 1];
    expect(tsc.compilacao!.diagnosticos.map(d => d.codigo)).toEqual([2345]);
    expect(Object.keys(tsc.compilacao!.emitidos)).toEqual(['programa.js']);
  }, 30000);

  it('na inscrição, só compilar não mostra o programa estourando', async () => {
    const ref = REFERENCIAS_DA_CC_FE005['dois-erros'];
    const ctx = await sessao('dois-erros', [{ ...ref, antes: ['tsc'] }]);
    expect(falham('dois-erros', ctx)).toEqual(['viu-estourar']);
  }, 30000);
});
