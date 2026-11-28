import { describe, it, expect } from 'vitest';
import { VEREDAS, licoesDaVereda, type LicaoDeVereda } from './veredas';
import { executarProgramaDart, lerPrograma } from '../labs/dartSimulado';
import { analisarProgramaDart } from '../labs/dartAnalise';
import { validarDart } from '../lib/dartValidator';
import { dartDisponivel, rodarNoDart } from '../labs/dartDeVerdade';
import { SOLUCOES_DE_DART } from '../labs/referenciasDaCcMb001';

/*
  Os laboratórios de Dart, conferidos rodando.

  Pela razão de `laboratoriosDeJavascript.test.ts`: `veredas.test.ts` confere
  o modelo sem executar nada, e aqui ele roda — e não pode deixar nada
  verde. A solução de referência roda e precisa deixar tudo verde:
  laboratório impossível é pior do que um que abre resolvido. E no CI ela
  roda também no Dart de verdade, que precisa escrever o mesmo.

  As soluções moram em `referenciasDaCcMb001.ts`, e não no currículo:
  gabarito no currículo fica a um import de distância da tela. Arquivo à
  parte, e não aqui, porque a trava que clica escreve as mesmas.
*/

const vereda = VEREDAS.find(v => v.id === 'cc-mb001')!;
const labs = licoesDaVereda(vereda).filter(l => l.tipo === 'laboratorio') as unknown as Extract<LicaoDeVereda, { tipo: 'laboratorio' }>[];

function conferir(licao: Extract<LicaoDeVereda, { tipo: 'laboratorio' }>, pasta: Record<string, string>) {
  const r = executarProgramaDart(pasta, licao.arquivo, licao.entradaPadrao ?? []);
  const editaveis = new Set([licao.arquivo, ...(licao.arquivosDoProjeto ?? []).filter(a => a.editavel).map(a => a.nome)]);
  const lido = lerPrograma(pasta, licao.arquivo);
  const achados = lido.problemas.length ? null : analisarProgramaDart(lido.arvores.filter(a => editaveis.has(a.arquivo)));
  return { r, resultados: validarDart({ achados, execucao: r, saidaEsperada: licao.saidaEsperada, saidaContem: licao.saidaContem }, licao.verificacoes) };
}

const pastaDoModelo = (licao: Extract<LicaoDeVereda, { tipo: 'laboratorio' }>) => {
  const pasta: Record<string, string> = { [licao.arquivo]: licao.modelo };
  for (const a of licao.arquivosDoProjeto ?? []) pasta[a.nome] = a.modelo;
  return pasta;
};

describe('os laboratórios da CC-MB001', () => {
  it('são oito, e cada um tem solução de referência', () => {
    expect(labs).toHaveLength(8);
    expect(Object.keys(SOLUCOES_DE_DART).sort()).toEqual(labs.map(l => l.id).sort());
  });

  it.each(labs.map(l => [l.id, l] as const))('%s abre sem nada verde, rodando o modelo', (_, licao) => {
    const { resultados } = conferir(licao, pastaDoModelo(licao));
    expect(resultados.filter(x => x.passed).map(x => x.id)).toEqual([]);
  });

  it.each(labs.map(l => [l.id, l] as const))('%s se vence com a solução de referência', (_, licao) => {
    const { r, resultados } = conferir(licao, { ...pastaDoModelo(licao), ...SOLUCOES_DE_DART[licao.id] });
    expect(r.erro).toBeNull();
    expect(resultados.filter(x => !x.passed).map(x => `${x.id}: ${x.detail}`)).toEqual([]);
  });

  it('o m1 abre com um erro de compilação, e por isso nenhuma linha sai', () => {
    const licao = labs.find(l => l.id === 'm1-lab')!;
    const r = executarProgramaDart(pastaDoModelo(licao), licao.arquivo);
    expect(r.problemas).toHaveLength(1);
    expect(r.saida).toBe('');
  });

  it('o m3 com o ! compila, roda — e não fecha', () => {
    const licao = labs.find(l => l.id === 'm3-lab')!;
    const comExclamacao = SOLUCOES_DE_DART['m3-lab']['clube.dart'].replace("lido ?? 'visitante'", 'lido!');
    const { r, resultados } = conferir(licao, { 'clube.dart': comExclamacao });
    expect(r.erro).toContain('Null check operator used on a null value');
    expect(resultados.find(x => x.id === 'semExclamacao')?.passed).toBe(false);
  });

  it('o m4 sem tirar a repetição escreve a Bia duas vezes, e não fecha', () => {
    const licao = labs.find(l => l.id === 'm4-lab')!;
    const repetindo = SOLUCOES_DE_DART['m4-lab']['clube.dart'].replace('marcados.toSet()', 'marcados');
    const { resultados } = conferir(licao, { 'clube.dart': repetindo });
    expect(resultados.find(x => x.id === 'saidaEsperada')?.passed).toBe(false);
  });

  it('o m7 com a classe copiada para o principal não demonstra o import', () => {
    const licao = labs.find(l => l.id === 'm7-lab')!;
    const tudoNumSo = SOLUCOES_DE_DART['m7-lab']['clube.dart'].replace("import 'unidade.dart';\n", '') + SOLUCOES_DE_DART['m7-lab']['unidade.dart'];
    const { resultados } = conferir(licao, { 'clube.dart': tudoNumSo, 'unidade.dart': '' });
    expect(resultados.find(x => x.id === 'saidaEsperada')?.passed).toBe(true);
    expect(resultados.find(x => x.id === 'importaArquivo')?.passed).toBe(false);
  });

  it('o m8 com uma classe só não tem duas classes que se relacionam', () => {
    const licao = labs.find(l => l.id === 'm8-lab')!;
    const umaSo = `import 'dart:io';

void main() {
  var contagem = <String, int>{};
  var total = 0;
  while (true) {
    String? linha = stdin.readLineSync();
    if (linha == null) break;
    var nome = linha.split(';')[0];
    contagem[nome] = (contagem[nome] ?? 0) + 1;
    total++;
  }
  contagem.forEach((nome, n) => print('$nome: $n \${n == 1 ? 'especialidade' : 'especialidades'}'));
  print('Total: $total conquistas');
}
`;
    const { resultados } = conferir(licao, { 'clube.dart': umaSo });
    expect(resultados.find(x => x.id === 'saidaContem')?.passed).toBe(true);
    expect(resultados.find(x => x.id === 'duasClassesRelacionadas')?.passed).toBe(false);
  });

  it('o Dart de verdade escreve o mesmo com as soluções', () => {
    if (!dartDisponivel()) return;
    const diferencas: string[] = [];
    for (const licao of labs) {
      const pasta = { ...pastaDoModelo(licao), ...SOLUCOES_DE_DART[licao.id] };
      const simulado = executarProgramaDart(pasta, licao.arquivo, licao.entradaPadrao ?? []);
      const real = rodarNoDart(pasta, licao.arquivo, licao.entradaPadrao ?? []);
      if (real.saida !== simulado.saida || real.codigo !== 0) {
        diferencas.push(`${licao.id}: o simulador deu ${JSON.stringify(simulado.saida)}, o dart deu ${JSON.stringify(real.saida + real.erro)}`);
      }
    }
    if (diferencas.length) console.log(`::error title=Laboratórios de Dart::${diferencas.join('%0A')}`);
    expect(diferencas).toEqual([]);
  }, 600000);
});
