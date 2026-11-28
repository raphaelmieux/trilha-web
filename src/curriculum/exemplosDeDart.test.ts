import { describe, it, expect } from 'vitest';
import { VEREDAS, licoesDaVereda, type TopicoDeVereda } from './veredas';
import { executarProgramaDart, linhasDeErro } from '../labs/dartSimulado';
import { dartDisponivel, rodarNoDart } from '../labs/dartDeVerdade';

/*
  Os exemplos de Dart da teoria, conferidos rodando — no simulador sempre, e
  no Dart de verdade no CI.

  É a trava de `exemplosDeJavascript.test.ts`, pelo motivo escrito lá:
  escrever de cabeça o que um programa escreve erra por pouco e com
  frequência. No Dart o engano mais provável é de forma — o `.0` de um
  double, o iterável entre parênteses, o mapa sem aspas — e de mensagem: o
  exemplo de compilação mostra o erro, e o erro tem de ser o do compilador.
*/

const topicos: [string, TopicoDeVereda][] = VEREDAS
  .flatMap(v => licoesDaVereda(v).map(l => [v, l] as const))
  .flatMap(([v, l]) => (l.tipo === 'teoria' ? l.topicos.map(t => [`${v.code} · ${t.id}`, t] as [string, TopicoDeVereda]) : []))
  .filter(([, t]) => t.exemploComo === 'dart');

describe('os exemplos de Dart da teoria', () => {
  it('existem — a lista vazia aprovaria tudo sem conferir nada', () => {
    expect(topicos.length).toBeGreaterThanOrEqual(18);
  });

  it.each(topicos)('%s escreve o que a lição diz', (_, t) => {
    expect(t.exemploSaida, 'todo exemplo de Dart declara a saída').toBeDefined();
    const r = executarProgramaDart({ 'clube.dart': t.exemplo ?? '' }, 'clube.dart', t.exemploEntrada ?? []);
    const terminal = r.problemas.length ? r.erro ?? '' : `${r.saida}${r.erro ?? ''}`;
    expect(terminal.replace(/\n$/, '')).toBe(t.exemploSaida);
  });

  it('o Dart de verdade escreve o mesmo', () => {
    if (!dartDisponivel()) return;
    const diferencas: string[] = [];
    for (const [nome, t] of topicos) {
      const r = rodarNoDart({ 'clube.dart': t.exemplo ?? '' }, 'clube.dart', t.exemploEntrada ?? []);
      const esperado = t.exemploSaida ?? '';
      const linhas = linhasDeErro(esperado);
      if (linhas.length) {
        const obtidas = linhasDeErro(r.erro);
        if (obtidas[0] !== linhas[0]) diferencas.push(`${nome}: esperado ${JSON.stringify(linhas[0])}, o dart deu ${JSON.stringify(obtidas[0] ?? r.erro)}`);
      } else if (r.saida.replace(/\n$/, '') !== esperado) {
        diferencas.push(`${nome}: esperado ${JSON.stringify(esperado)}, o dart deu ${JSON.stringify(r.saida + r.erro)}`);
      }
    }
    if (diferencas.length) console.log(`::error title=Exemplos de Dart::${diferencas.join('%0A')}`);
    expect(diferencas).toEqual([]);
  }, 600000);
});
