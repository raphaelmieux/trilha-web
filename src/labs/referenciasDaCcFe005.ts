/**
 * As soluções de referência dos laboratórios da CC-FE005 TypeScript.
 *
 * Só as travas importam isto: a de motor, que confere que cada uma fecha a
 * lista, e a que clica, que as escreve no editor. Ficam num arquivo próprio
 * para as duas escreverem o mesmo texto. Nenhuma tela importa daqui.
 *
 * Cada solução é a pasta inteira dos arquivos que a pessoa escreve, e os
 * comandos que ela roda no terminal, na ordem — porque metade das tarefas
 * desta vereda é ver alguma coisa acontecer no terminal.
 */

import { LICOES_DA_CC_FE005, type LicaoDaCcFe005 } from './metasDaCcFe005';
import { TSCONFIG_DO_INIT } from './compiladorTs';
import type { Pasta } from './compiladorTs';

export interface Referencia {
  /** Comandos rodados antes de escrever — o que a lição manda ver primeiro. */
  antes: string[];
  arquivos: Pasta;
  /** Comandos rodados depois de escrever. */
  depois: string[];
}

const TSCONFIG_DO_CAMPORI = TSCONFIG_DO_INIT
  .replace('// "outDir": "./",       ', '"outDir": "./dist",     ')
  .replace('// "noEmitOnError": true,', '"noEmitOnError": true,  ');

export const REFERENCIAS_DA_CC_FE005: Record<LicaoDaCcFe005, Referencia> = {
  anotar: {
    antes: [],
    arquivos: {
      'programa.ts': `const diaria = 45;
const inscritos: string[] = [];

function inscrever(nome: string, idade: number): boolean {
  if (idade < 10) return false;
  inscritos.push(nome);
  return true;
}

function taxa(dias: number): number {
  return diaria * dias;
}

inscrever('Ana', 12);
inscrever('Bia', 9);
inscrever('Caio', 11);
console.log(\`Inscritos: \${inscritos.join(', ')}\`);
console.log(\`Taxa por pessoa: R$ \${taxa(3)}\`);
`,
    },
    depois: ['tsc && node programa.js'],
  },

  interface: {
    antes: [],
    arquivos: {
      'programa.ts': `interface Membro {
  nome: string;
  idade: number;
  unidade: string;
}

const membros: Membro[] = [
  { nome: 'Ana Clara', idade: 12, unidade: 'Ipê' },
  { nome: 'Bruno', idade: 11, unidade: 'Jatobá' },
  { nome: 'Lívia', idade: 10, unidade: 'Buriti' },
];

function apresentar(m: Membro): string {
  return \`\${m.nome} (\${m.idade}) — unidade \${m.unidade}\`;
}

for (const m of membros) {
  console.log(apresentar(m));
}
`,
    },
    depois: ['tsc && node programa.js'],
  },

  uniao: {
    antes: [],
    arquivos: {
      'programa.ts': `type Cargo = 'diretor' | 'conselheira' | 'desbravador';

interface Pessoa {
  nome: string;
  cargo: Cargo;
  telefone?: string;
}

const equipe: Pessoa[] = [
  { nome: 'Tia Lúcia', cargo: 'conselheira', telefone: '(61) 99999-1234' },
  { nome: 'Davi', cargo: 'desbravador' },
  { nome: 'Rafael', cargo: 'diretor', telefone: '(61) 98888-4321' },
];

function contato(p: Pessoa): string {
  if (p.telefone === undefined) return \`\${p.nome}: sem telefone\`;
  return \`\${p.nome}: \${p.telefone.replace('(61) ', '')}\`;
}

for (const p of equipe) {
  console.log(contato(p));
}
console.log(\`Diretores: \${equipe.filter(p => p.cargo === 'diretor').length}\`);
`,
    },
    depois: ['tsc && node programa.js'],
  },

  generico: {
    antes: [],
    arquivos: {
      'programa.ts': `function primeiro<T>(lista: T[]): T | undefined {
  return lista[0];
}

const pontos = [72, 55, 38];
const nomes = ['Ana', 'Bia', 'Caio'];
const fila: string[] = [];

console.log(\`Maior pontuação: \${primeiro(pontos)?.toFixed(1)}\`);
console.log(\`Primeira da chamada: \${primeiro(nomes)?.toUpperCase()}\`);
console.log(\`Fila vazia: \${primeiro(fila)?.toUpperCase() ?? 'ninguém'}\`);
`,
    },
    depois: ['tsc && node programa.js'],
  },

  inferencia: {
    antes: [],
    arquivos: {
      'programa.ts': `const unidade = 'Ipê';
const nomes = ['Ana', 'Bia', 'Caio'];
const pontos = [72, 38, 61];
const acima: string[] = [];

function media(valores: number[]): number {
  let soma = 0;
  for (const v of valores) {
    soma = soma + v;
  }
  const resultado = soma / valores.length;
  return resultado;
}

const valor = media(pontos);
for (let i = 0; i < nomes.length; i++) {
  if (pontos[i] > valor) {
    acima.push(nomes[i]);
  }
}
console.log(\`Unidade \${unidade}: média \${valor}\`);
console.log(\`Acima da média: \${acima.join(', ')}\`);
const resumo = nomes.length + ' membros';
console.log(\`Resumo: \${resumo}\`);
`,
    },
    depois: ['tsc && node programa.js'],
  },

  'dois-erros': {
    antes: ['node inscricao-antiga.js', 'tsc'],
    arquivos: {
      'inscricao.ts': LICOES_DA_CC_FE005['dois-erros'].arquivos['inscricao.ts']
        .replace('p.unidad.toUpperCase()', 'p.unidade.toUpperCase()')
        .replace("cadastrar('Caio', 'Jatobá', '13');", "cadastrar('Caio', 'Jatobá', Number('13'));"),
    },
    depois: ['tsc && node inscricao.js'],
  },

  projeto: {
    antes: ['tsc', 'tsc --init'],
    arquivos: {
      'tsconfig.json': TSCONFIG_DO_CAMPORI,
      'programa.ts': LICOES_DA_CC_FE005.projeto.arquivos['programa.ts'],
    },
    /* A ordem é a lição: com o erro ainda lá, o tsc aponta e não gera nada;
       a correção vem depois, em `CORRECAO_DO_CAMPORI`. */
    depois: ['tsc'],
  },

  converter: {
    antes: [],
    arquivos: {
      'ranking.ts': `import { readFileSync } from 'node:fs';

interface Registro {
  unidade: string;
  prova: string;
  pontos: number;
}

function carregar(arquivo: string): Registro[] {
  return JSON.parse(readFileSync(arquivo, 'utf8'));
}

function somarPorUnidade(registros: Registro[]): Record<string, number> {
  const totais: Record<string, number> = {};
  for (const r of registros) {
    totais[r.unidade] = (totais[r.unidade] ?? 0) + r.pontos;
  }
  return totais;
}

const emOrdem = (totais: Record<string, number>): [string, number][] =>
  Object.entries(totais).sort((a, b) => b[1] - a[1]);

function mostrar(ranking: [string, number][]): void {
  console.log('Ranking da gincana');
  ranking.forEach(([unidade, pontos], i) => {
    console.log(\`\${i + 1}º \${unidade}: \${pontos} pontos\`);
  });
}

mostrar(emOrdem(somarPorUnidade(carregar('pontuacao.json'))));
`,
    },
    depois: ['tsc && node ranking.js'],
  },
};

/** O segundo passo do campori: o programa consertado, e o projeto rodando. */
export const CORRECAO_DO_CAMPORI: Referencia = {
  antes: [],
  arquivos: {
    'programa.ts': LICOES_DA_CC_FE005.projeto.arquivos['programa.ts'].replace("vagasRestantes('40', 31)", 'vagasRestantes(40, 31)'),
  },
  depois: ['tsc && node dist/programa.js'],
};

