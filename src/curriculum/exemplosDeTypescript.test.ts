import { describe, it, expect } from 'vitest';
import { VEREDAS, licoesDaVereda, type TopicoDeVereda } from './veredas';
import { executarLinha } from '../labs/terminalDoTs';
import { compilarNoNode, ts } from '../labs/compiladorNoNode';
import { executarNode } from '../labs/nodeSimulado';
import { ouvirNoTeste } from '../labs/nodeDeVerdade';
import { TSCONFIG_DO_CLUBE } from '../labs/metasDaCcFe005';

/*
  Os exemplos de TypeScript da teoria, compilados e rodados.

  É a trava de `exemplosDeJavascript.test.ts`, com o compilador na frente:
  cada exemplo passa por `tsc && node programa.js` com o tsconfig dos
  laboratórios — modo estrito ligado —, e o terminal tem de dizer o que a
  lição declara. Quando o exemplo mostra um erro, o que se compara é a
  mensagem do compilador, palavra por palavra, em português: escrever de
  cabeça o que o tsc diz erra o código, a coluna e a frase.
*/

const topicos: [string, TopicoDeVereda][] = VEREDAS
  .flatMap(v => licoesDaVereda(v).map(l => [v, l] as const))
  .flatMap(([v, l]) => (l.tipo === 'teoria' ? l.topicos.map(t => [`${v.code} · ${t.id}`, t] as [string, TopicoDeVereda]) : []))
  .filter(([, t]) => t.exemploComo === 'typescript' && t.exemplo !== undefined);

describe('os exemplos de TypeScript da teoria', () => {
  it('existem — a lista vazia aprovaria tudo sem conferir nada', () => {
    expect(topicos.length).toBeGreaterThanOrEqual(15);
  });

  it('nenhum declara o que o terminal mostra sem ter o que mostrar', () => {
    expect(topicos.filter(([, t]) => t.exemploSaida === undefined).map(([n]) => n)).toEqual([]);
  });

  it.each(topicos)('%s mostra no terminal o que a lição diz', async (_, t) => {
    const r = await executarLinha('tsc && node programa.js', { 'programa.ts': t.exemplo ?? '', 'tsconfig.json': TSCONFIG_DO_CLUBE }, {
      compilar: compilarNoNode, rodar: (p, x) => executarNode(p, x, { ouvirRejeicoes: ouvirNoTeste }), versao: ts.version,
    });
    expect(r.passos.map(p => p.saida).join('').trimEnd()).toBe(t.exemploSaida ?? '');
  }, 30000);

  /* A tradução do pacote para a TS2820 chega quebrada, e é ela que o módulo
     de união mostra. O conserto mora em `emPortugues`. */
  it('a TS2820 sai em português com os três valores no lugar', async () => {
    const r = await compilarNoNode({
      'tsconfig.json': TSCONFIG_DO_CLUBE,
      'programa.ts': "type Cargo = 'diretor' | 'desbravador';\nconst c: Cargo = 'Diretor';\n",
    });
    expect(r.diagnosticos.map(d => d.mensagem)).toEqual([
      "O tipo '\"Diretor\"' não pode ser atribuído ao tipo 'Cargo'. Você quis dizer '\"diretor\"'?",
    ]);
  });
});
