import { describe, it, expect } from 'vitest';
import { VEREDAS, licoesDaVereda, type LicaoDeVereda } from './veredas';
import { executarNode, type Pasta } from '../labs/nodeSimulado';
import { ouvirNoTeste, rodarNoNode } from '../labs/nodeDeVerdade';
import { analisarJavascript } from '../labs/javascriptAnalise';
import { validarJavascript } from '../lib/javascriptValidator';

/*
  Os laboratórios de JavaScript, conferidos rodando.

  Pela razão de `laboratoriosDePython.test.ts`: `veredas.test.ts` confere o
  modelo sem executar nada, e metade das verificações só responde depois de
  rodar — aquela trava aprovaria um modelo que já estivesse pronto. Aqui o
  modelo roda e não pode deixar nada verde, e a solução de referência roda e
  precisa deixar tudo verde: laboratório impossível é pior do que um que abre
  resolvido.

  E a solução roda também no Node de verdade, que é o que o computador do
  clube vai usar. Se os dois discordarem da saída ou da pasta, o laboratório
  está aprovando um programa que lá fora faria outra coisa.

  A solução mora aqui, e não no currículo: gabarito no currículo fica a um
  import de distância da tela.
*/

const SOLUCOES: Record<string, string> = {
  'm1-lab': `const inscritos = ['Ana', 'Bia', 'Caio', 'Davi'];
const diaria = 45;
const dias = 3;
let total = 0;
for (const nome of inscritos) {
  let valor = diaria * dias;
  if (nome === 'Caio') {
    valor = valor - 20;
  }
  console.log(\`\${nome}: R$ \${valor}\`);
  total = total + valor;
}
console.log(\`Total: R$ \${total}\`);
`,
  'm2-lab': `const pontos = [10, 25, 15];
let total = 0;
for (let i = 0; i < pontos.length; i++) {
  total = total + pontos[i];
}

const titulo = 'Placar da gincana';
if (total > 40) {
  const titulo = 'Recorde da gincana!';
  console.log(titulo);
}
console.log(titulo + ': ' + total + ' pontos');

const unidades = ['Águia', 'Falcão', 'Pantera'];
for (let j = 0; j < unidades.length; j++) {
  setTimeout(function () {
    console.log('Parabéns, unidade ' + unidades[j]);
  }, 100);
}
`,
  'm3-lab': `const inscritos = [
  { nome: 'Ana', idade: 10 },
  { nome: 'Bruno', idade: 13 },
  { nome: 'Carla', idade: 12 },
  { nome: 'Davi', idade: 15 },
  { nome: 'Elisa', idade: 11 },
  { nome: 'Fábio', idade: 9 },
  { nome: 'Gabi', idade: 14 },
];
let fora = 0;
for (const pessoa of inscritos) {
  let classe;
  if (pessoa.idade === 10) classe = 'Amigo';
  else if (pessoa.idade === 11) classe = 'Companheiro';
  else if (pessoa.idade === 12) classe = 'Pesquisador';
  else if (pessoa.idade === 13) classe = 'Pioneiro';
  else if (pessoa.idade === 14) classe = 'Excursionista';
  else if (pessoa.idade === 15) classe = 'Guia';
  else {
    classe = 'fora da faixa';
    fora++;
  }
  console.log(\`\${pessoa.nome} (\${pessoa.idade}): \${classe}\`);
}
console.log(\`Fora da faixa: \${fora}\`);
`,
  'm4-lab': `function precoDoPedido(lanches, sucos) {
  return lanches * 6 + sucos * 4;
}
const troco = (pago, total) => pago - total;

const pedidos = [
  ['Ana', 1, 2, 20],
  ['Bruno', 3, 1, 50],
  ['Carla', 0, 1, 5],
];
for (const [nome, lanches, sucos, pago] of pedidos) {
  const total = precoDoPedido(lanches, sucos);
  console.log(\`\${nome}: R$ \${total}, troco de R$ \${troco(pago, total)}\`);
}
`,
  'm5-lab': `const inscricoes = [
  { nome: 'Ana', valor: 135, pagou: true },
  { nome: 'Bruno', valor: 135, pagou: false },
  { nome: 'Carla', valor: 115, pagou: true },
  { nome: 'Davi', valor: 135, pagou: true },
  { nome: 'Elisa', valor: 135, pagou: false },
];
const pagas = inscricoes.filter(i => i.pagou);
console.log('Pagaram: ' + pagas.map(i => i.nome.toUpperCase()).join(', '));
const arrecadado = pagas.reduce((soma, i) => soma + i.valor, 0);
console.log(\`Arrecadado: R$ \${arrecadado}\`);
const faltam = inscricoes.filter(i => !i.pagou).map(i => i.nome);
console.log('Faltam pagar: ' + faltam.join(', '));
`,
  'm6-lab': `const unidade = {
  nome: 'Falcão',
  conselheira: 'Tia Rute',
  membros: [],
  adicionar(nome) {
    this.membros.push(nome);
  },
  resumo() {
    return \`\${this.nome}, com \${this.conselheira}: \${this.membros.length} membros\`;
  },
};
console.log(unidade.resumo());
unidade.adicionar('Ana');
unidade.adicionar('Bruno');
unidade.adicionar('Carla');
console.log(unidade.resumo());
console.log(unidade.membros.join(', '));
`,
  'm7-lab': `import { buscarInscricoes } from './servidor.js';

const esperar = ms => new Promise(resolve => setTimeout(resolve, ms));

async function contar(unidade) {
  try {
    const n = await buscarInscricoes(unidade);
    console.log(\`\${unidade}: \${n} inscritos\`);
    return n;
  } catch (erro) {
    console.log(\`\${unidade}: \${erro.message}. Tentando de novo em 2 segundos...\`);
    await esperar(2000);
    const n = await buscarInscricoes(unidade);
    console.log(\`\${unidade}: \${n} inscritos\`);
    return n;
  }
}

async function principal() {
  let total = 0;
  for (const unidade of ['Águia', 'Falcão', 'Tucano']) {
    total += await contar(unidade);
  }
  console.log(\`Total: \${total} inscritos\`);
}

principal();
`,
  'm8-lab': `import { readFileSync, writeFileSync } from 'node:fs';

const inscritos = JSON.parse(readFileSync('inscritos.json', 'utf8'));
inscritos.push({ nome: 'Helena', unidade: 'Onça', idade: 12, pagou: false });
const bruno = inscritos.find(p => p.nome === 'Bruno');
bruno.pagou = true;
writeFileSync('inscritos.json', JSON.stringify(inscritos, null, 2));
console.log(\`Inscritos: \${inscritos.length}\`);
console.log(\`Pagaram: \${inscritos.filter(p => p.pagou).length}\`);
`,
  'm9-lab': `import { readFileSync } from 'node:fs';

function carregar(arquivo) {
  return JSON.parse(readFileSync(arquivo, 'utf8'));
}

function somarPorUnidade(registros) {
  const totais = {};
  for (const r of registros) {
    totais[r.unidade] = (totais[r.unidade] ?? 0) + r.pontos;
  }
  return totais;
}

const emOrdem = totais => Object.entries(totais).sort((a, b) => b[1] - a[1]);

function mostrar(ranking) {
  console.log('Ranking da gincana');
  ranking.forEach(([unidade, pontos], i) => {
    console.log(\`\${i + 1}º \${unidade}: \${pontos} pontos\`);
  });
}

mostrar(emOrdem(somarPorUnidade(carregar('pontuacao.json'))));
`,
};

type Lab = Extract<LicaoDeVereda, { tipo: 'laboratorio' }>;
const vereda = VEREDAS.find(v => v.id === 'cc-fe003')!;
const laboratorios: Lab[] = licoesDaVereda(vereda)
  .flatMap(l => (l.tipo === 'laboratorio' && l.linguagem === 'javascript' ? [l] : []));

const pastaCom = (lab: Lab, programa: string): Pasta => {
  const pasta: Pasta = { [lab.arquivo]: programa };
  for (const a of lab.arquivosDoProjeto ?? []) pasta[a.nome] = a.modelo;
  return pasta;
};

/* O que a tela faz ao clicar em Executar: analisa o que a pessoa escreveu,
   roda a pasta, e passa os dois ao validador. */
async function conferir(lab: Lab, programa: string) {
  const pasta = pastaCom(lab, programa);
  const analise = analisarJavascript({ [lab.arquivo]: programa });
  const execucao = await executarNode(pasta, lab.arquivo, { ouvirRejeicoes: ouvirNoTeste });
  const resultados = validarJavascript({
    achados: analise.achados, ilegiveis: analise.ilegiveis, execucao,
    saidaEsperada: lab.saidaEsperada, saidaContem: lab.saidaContem, jsonEsperado: lab.jsonEsperado,
  }, lab.verificacoes);
  return { resultados, execucao };
}

describe('os laboratórios da CC-FE003', () => {
  it('são nove, e todos têm solução de referência', () => {
    expect(laboratorios.map(l => l.id)).toEqual(Object.keys(SOLUCOES));
  });

  it.each(laboratorios.map(l => [l.id, l] as const))('%s abre, roda o modelo, e nada fica verde', async (_, lab) => {
    const { resultados } = await conferir(lab, lab.modelo);
    expect(resultados.filter(r => r.passed).map(r => r.id)).toEqual([]);
  });

  it.each(laboratorios.map(l => [l.id, l] as const))('%s fecha com a solução de referência', async (_, lab) => {
    const { resultados } = await conferir(lab, SOLUCOES[lab.id]);
    expect(resultados.filter(r => !r.passed).map(r => `${r.id}: ${r.detail}`)).toEqual([]);
  });

  it.each(laboratorios.map(l => [l.id, l] as const))('%s: a solução faz o mesmo no Node de verdade', async (_, lab) => {
    const pasta = pastaCom(lab, SOLUCOES[lab.id]);
    const simulado = await executarNode(pasta, lab.arquivo, { ouvirRejeicoes: ouvirNoTeste });
    const deVerdade = rodarNoNode(pasta, lab.arquivo);
    expect(simulado.saida).toBe(deVerdade.saida);
    expect(simulado.pasta).toEqual(deVerdade.pasta);
  }, 30000);
});

/*
  Os caminhos quase certos, que a lista não pode aprovar.

  Cada um é o engano que a lição daquele módulo existe para mostrar, e cada
  um deixa a saída certa ou quase — é por isso que a tarefa de estrutura
  existe ao lado da de saída.
*/
describe('os caminhos quase certos', () => {
  const lab = (id: string) => laboratorios.find(l => l.id === id)!;
  const falhou = async (id: string, programa: string) =>
    (await conferir(lab(id), programa)).resultados.filter(r => !r.passed).map(r => r.id);

  it('m2: um var esquecido, mesmo com a saída certa, não passa', async () => {
    const umVar = SOLUCOES['m2-lab'].replace('const unidades', 'var unidades');
    expect(await falhou('m2-lab', umVar)).toEqual(['semVar']);
  });

  it('m5: o reduce sem valor inicial dá a mesma soma, e não passa', async () => {
    const semInicial = SOLUCOES['m5-lab'].replace('soma + i.valor, 0)', 'soma + i.valor)')
      .replace('const arrecadado = pagas.reduce((soma, i)', 'const arrecadado = pagas.map(i => i.valor).reduce((soma, v)')
      .replace('soma + i.valor)', 'soma + v)');
    expect(await falhou('m5-lab', semInicial)).toEqual(['usaReduce']);
  });

  it('m6: o método de seta não enxerga o objeto', async () => {
    const seta = SOLUCOES['m6-lab'].replace('resumo() {', 'resumo: () => {');
    expect(await falhou('m6-lab', seta)).toEqual(expect.arrayContaining(['saidaEsperada']));
  });

  it('m7: tentar de novo sem try/catch derruba o programa na falha', async () => {
    const semTratar = SOLUCOES['m7-lab'].replace(/try \{([\s\S]*?)\} catch \(erro\) \{[\s\S]*?\n {2}\}\n/, '$1');
    expect(await falhou('m7-lab', semTratar)).toEqual(expect.arrayContaining(['trataErroDaPromessa', 'saidaEsperada']));
  });

  it('m8: gravar sem recuo grava o dado certo, e não passa na tarefa da forma', async () => {
    const semRecuo = SOLUCOES['m8-lab'].replace('JSON.stringify(inscritos, null, 2)', 'JSON.stringify(inscritos)');
    expect(await falhou('m8-lab', semRecuo)).toEqual(['jsonLegivel']);
  });

  it('m8: mudar a lista e não gravar mostra os números certos, e o arquivo não muda', async () => {
    const semGravar = SOLUCOES['m8-lab'].replace(/writeFileSync\('inscritos.json'.*\n/, '');
    expect(await falhou('m8-lab', semGravar)).toEqual(expect.arrayContaining(['gravaArquivo', 'jsonEsperado']));
  });

  it('m9: tudo dentro de uma função só não conta como três', async () => {
    const umaSo = `import { readFileSync } from 'node:fs';
function tudo() {
  const r = JSON.parse(readFileSync('pontuacao.json', 'utf8'));
  const t = {};
  for (const x of r) t[x.unidade] = (t[x.unidade] ?? 0) + x.pontos;
  console.log('Ranking da gincana');
  Object.entries(t).sort((a, b) => b[1] - a[1]).forEach(([u, p], i) => console.log(\`\${i + 1}º \${u}: \${p} pontos\`));
}
tudo();
`;
    expect(await falhou('m9-lab', umaSo)).toEqual(['tresFuncoes']);
  });
});
