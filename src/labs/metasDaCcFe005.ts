import type { AnaliseDeTs } from './analiseTs';
import type { Diagnostico, Pasta, ResultadoDaCompilacao } from './compiladorTs';
import type { PassoDoTerminal } from './terminalDoTs';
import { PONTUACAO_DA_GINCANA } from '../curriculum/javascript';

/**
 * Os oito laboratórios da CC-FE005.
 *
 * ── Um laboratório, uma pasta e um terminal ──────────────────────────────
 * Todos abrem a mesma janela: o editor com os arquivos do projeto, o painel
 * de Problemas embaixo dele — o compilador lendo enquanto se escreve, como no
 * editor do clube — e um terminal com `tsc` e `node`. O que muda é a pasta
 * de partida e o que se cobra.
 *
 * Do primeiro ao sexto, e no oitavo, o projeto já vem configurado: o
 * `tsconfig.json` está na pasta, só de leitura, com o modo estrito ligado. O
 * sétimo é o requisito 5 — configurar —, e começa sem ele.
 *
 * ── O que se confere ─────────────────────────────────────────────────────
 * Três leituras, e cada tarefa diz quais usa. A **verificação** é a pasta de
 * agora compilada com o tsconfig dela, e a árvore de cada `.ts` lida: diz se
 * há erro e o que foi escrito. O **terminal** é o que se rodou nesta sessão,
 * com as fontes de quando rodou: diz o que a pessoa viu acontecer — o erro
 * apontado, o programa que estourou, a saída. E a saída só vale se o `tsc` e
 * o `node` rodaram sobre o que está escrito agora: o `node` roda o `.js` que
 * o último `tsc` gerou, e um `.ts` mexido depois dele é outro programa.
 */

export type LicaoDaCcFe005 =
  | 'anotar' | 'interface' | 'uniao' | 'generico' | 'inferencia'
  | 'dois-erros' | 'projeto' | 'converter';

export interface VerificacaoDoTs {
  compilacao: ResultadoDaCompilacao;
  analise: Record<string, AnaliseDeTs>;
}

export type PassoComFontes = PassoDoTerminal & { fontes: string };

export interface ContextoDoTs {
  pasta: Pasta;
  /** A pasta de agora, compilada e lida. `null` enquanto o compilador não respondeu. */
  verificacao: VerificacaoDoTs | null;
  historico: PassoComFontes[];
}

export interface MetaDoTs {
  id: string;
  titulo: string;
  passos: string[];
  feita: (ctx: ContextoDoTs) => boolean;
  motivo?: (ctx: ContextoDoTs) => string | undefined;
}

export interface DefinicaoDaLicaoDeTs {
  projeto: string;
  arquivos: Pasta;
  editaveis: string[];
  abre: string;
  /** O que o botão Executar digita no terminal. */
  executar: string;
  metas: MetaDoTs[];
}

/** As fontes de uma pasta: o que a pessoa escreveu, e não o que o tsc gerou. */
export const fontesDe = (pasta: Pasta, editaveis: string[]) =>
  JSON.stringify(editaveis.map(n => [n, pasta[n] ?? null]));

/* ────────────────────────────────────────────────────────────────────────
   Ferramentas das metas
   ──────────────────────────────────────────────────────────────────────── */

const erros = (ctx: ContextoDoTs): Diagnostico[] => ctx.verificacao?.compilacao.diagnosticos ?? [];

const compilaLimpo = (ctx: ContextoDoTs) =>
  !!ctx.verificacao && !ctx.verificacao.compilacao.semProjeto && erros(ctx).length === 0;

const analise = (ctx: ContextoDoTs, arquivo: string): AnaliseDeTs | null => ctx.verificacao?.analise[arquivo] ?? null;

/**
 * A saída da última vez que o `node` rodou o que está escrito agora, depois
 * de um `tsc` limpo sobre as mesmas fontes. `null` quando não houve.
 */
export function saidaDeAgora(ctx: ContextoDoTs, editaveis: string[], principal: string): string | null {
  const agora = fontesDe(ctx.pasta, editaveis);
  let compilou = false;
  let saida: string | null = null;
  for (const p of ctx.historico) {
    if (p.fontes !== agora) { compilou = false; saida = null; continue; }
    if (p.tipo === 'tsc') { compilou = p.codigo === 0; saida = null; }
    if (p.tipo === 'node' && compilou && p.comando.split(/\s+/)[1]?.replace(/^\.\//, '') === principal) {
      saida = p.codigo === 0 ? p.execucao?.saida ?? '' : null;
    }
  }
  return saida;
}

function motivoDaCompilacao(ctx: ContextoDoTs): string | undefined {
  if (!ctx.verificacao) return 'O compilador ainda está lendo o projeto.';
  if (ctx.verificacao.compilacao.semProjeto) return 'Não há tsconfig.json na pasta: o tsc não tem projeto para compilar.';
  const e = erros(ctx)[0];
  if (e) {
    const n = erros(ctx).length;
    return `O compilador aponta ${n === 1 ? 'um erro' : `${n} erros`}. O primeiro${e.arquivo ? `, em ${e.arquivo}${e.linha ? ` na linha ${e.linha}` : ''}` : ''}: ${e.mensagem}`;
  }
  return undefined;
}

/** A tarefa de rodar e acertar a saída, a mesma em toda lição. */
function metaDaSaida(principal: string, editaveis: string[], esperada: string, comando: string): MetaDoTs {
  return {
    id: 'saida',
    titulo: 'Compilar sem erro e rodar, com a saída certa',
    passos: [
      'Resolva tudo o que o painel Problemas aponta.',
      `No terminal, rode ${comando} — ou clique em Executar, que digita isso por você.`,
      `A saída tem de ser esta:\n${esperada}`,
    ],
    feita: ctx => compilaLimpo(ctx) && saidaDeAgora(ctx, editaveis, principal)?.trimEnd() === esperada.trimEnd(),
    motivo: ctx => {
      const m = motivoDaCompilacao(ctx);
      if (m) return m;
      const s = saidaDeAgora(ctx, editaveis, principal);
      if (s === null) return `Rode ${comando} no terminal, depois da última mudança.`;
      return 'O programa rodou, e a saída não é a combinada. Compare as duas, linha por linha.';
    },
  };
}

/** O tsconfig das lições que já chegam configuradas. */
export const TSCONFIG_DO_CLUBE = `{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
`;

const DIGITAR = (principal: string) => `tsc && node ${principal}`;

/* ────────────────────────────────────────────────────────────────────────
   1 · Anotar
   ──────────────────────────────────────────────────────────────────────── */

const ANOTAR = `// A taxa do acampamento, agora com tipos.
//
// O tsconfig.json desta pasta liga o modo estrito, e o painel Problemas,
// aqui embaixo, já reclama: um parâmetro sem tipo vira "any" implícito, e
// "any" desliga a conferência daquele valor inteiro.
//
// 1. Dê um tipo a cada parâmetro e diga o que cada função devolve.
// 2. A lista de inscritos começa vazia: diga de que ela é feita.
// 3. No terminal, rode: tsc && node programa.js
//
// A saída tem de ser:
//
//     Inscritos: Ana, Caio
//     Taxa por pessoa: R$ 135

const diaria = 45;
const inscritos = [];

function inscrever(nome, idade) {
  if (idade < 10) return false;
  inscritos.push(nome);
  return true;
}

function taxa(dias) {
  return diaria * dias;
}

inscrever('Ana', 12);
inscrever('Bia', 9);
inscrever('Caio', 11);
console.log(\`Inscritos: \${inscritos.join(', ')}\`);
console.log(\`Taxa por pessoa: R$ \${taxa(3)}\`);
`;

/* ────────────────────────────────────────────────────────────────────────
   2 · Interface
   ──────────────────────────────────────────────────────────────────────── */

const INTERFACE = `// A apresentação dos membros.
//
// Rode primeiro, como está: tsc && node programa.js. O programa roda, e a
// unidade de todo mundo sai "undefined" — há um nome escrito errado, e
// nada avisa.
//
// 1. Escreva uma interface Membro que diga o formato de cada um: o nome e a
//    unidade são texto, a idade é número.
// 2. Diga que a lista é de Membro, e que apresentar recebe um Membro.
// 3. Agora o compilador aponta o nome errado. Conserte e rode de novo.
//
// A saída tem de ser:
//
//     Ana Clara (12) — unidade Ipê
//     Bruno (11) — unidade Jatobá
//     Lívia (10) — unidade Buriti

const membros = [
  { nome: 'Ana Clara', idade: 12, unidade: 'Ipê' },
  { nome: 'Bruno', idade: 11, unidade: 'Jatobá' },
  { nome: 'Lívia', idade: 10, unidade: 'Buriti' },
];

function apresentar(m) {
  return \`\${m.nome} (\${m.idade}) — unidade \${m.unidde}\`;
}

for (const m of membros) {
  console.log(apresentar(m));
}
`;

/* ────────────────────────────────────────────────────────────────────────
   3 · União e opcional
   ──────────────────────────────────────────────────────────────────────── */

const UNIAO = `// A lista de contatos da equipe.
//
// A interface diz que todo mundo tem telefone, e o Davi não tem: o
// compilador já aponta isso. E o cargo é texto livre, então "Diretor", com
// maiúscula, passa — e a contagem de diretores sai errada.
//
// 1. Crie um tipo Cargo que só aceite 'diretor', 'conselheira' ou
//    'desbravador', e use-o no lugar de string.
// 2. Torne o telefone opcional.
// 3. Agora o compilador aponta onde o telefone pode faltar. Trate a falta:
//    quem não tem telefone aparece como "sem telefone". Sem "!" e sem "as":
//    os dois mandam o compilador calar, e não resolvem nada.
//
// A saída tem de ser:
//
//     Tia Lúcia: 99999-1234
//     Davi: sem telefone
//     Rafael: 98888-4321
//     Diretores: 1

interface Pessoa {
  nome: string;
  cargo: string;
  telefone: string;
}

const equipe: Pessoa[] = [
  { nome: 'Tia Lúcia', cargo: 'conselheira', telefone: '(61) 99999-1234' },
  { nome: 'Davi', cargo: 'desbravador' },
  { nome: 'Rafael', cargo: 'Diretor', telefone: '(61) 98888-4321' },
];

function contato(p: Pessoa): string {
  return \`\${p.nome}: \${p.telefone.replace('(61) ', '')}\`;
}

for (const p of equipe) {
  console.log(contato(p));
}
console.log(\`Diretores: \${equipe.filter(p => p.cargo === 'diretor').length}\`);
`;

/* ────────────────────────────────────────────────────────────────────────
   4 · Genérico
   ──────────────────────────────────────────────────────────────────────── */

const GENERICO = `// O primeiro da fila.
//
// Três funções fazem a mesma coisa — devolver o primeiro de uma lista —, e a
// terceira serve para qualquer lista porque recebe "any". Com any, o
// compilador não confere nada: o programa compila sem um erro, e estoura ao
// rodar. Rode e veja: tsc && node programa.js
//
// 1. Troque as três por uma função genérica só, primeiro, que recebe uma
//    lista de qualquer tipo T e devolve um T, ou undefined se a lista estiver
//    vazia.
// 2. Use-a para as duas listas. Nenhum "any" escrito no arquivo.
// 3. O resultado pode ser undefined — a fila vazia não tem primeiro —, e
//    agora o compilador aponta isso antes de rodar. Trate com ?. e ??.
//
// A saída tem de ser:
//
//     Maior pontuação: 72.0
//     Primeira da chamada: ANA
//     Fila vazia: ninguém

function primeiroNumero(lista: number[]): number | undefined {
  return lista[0];
}

function primeiroTexto(lista: string[]): string | undefined {
  return lista[0];
}

function primeiroDeQualquer(lista: any[]): any {
  return lista[0];
}

const pontos = [72, 55, 38];
const nomes = ['Ana', 'Bia', 'Caio'];
const fila: string[] = [];

console.log(\`Maior pontuação: \${primeiroDeQualquer(pontos).toFixed(1)}\`);
console.log(\`Primeira da chamada: \${primeiroDeQualquer(nomes).toUpperCase()}\`);
console.log(\`Fila vazia: \${primeiroDeQualquer(fila).toUpperCase() ?? 'ninguém'}\`);
`;

/* ────────────────────────────────────────────────────────────────────────
   5 · Inferência
   ──────────────────────────────────────────────────────────────────────── */

const INFERENCIA = `// A média da unidade.
//
// Este programa compila sem erro, e tem tipo escrito em tudo — inclusive onde
// o compilador já sabe sozinho. "const nome: string = 'Ana'" diz duas vezes a
// mesma coisa, e é a cópia que envelhece: quem muda o valor esquece o tipo.
//
// 1. Tire o tipo das variáveis que recebem um valor que já diz o tipo.
//    O compilador infere: passe o mouse no editor do clube e ele mostra.
// 2. Deixe o tipo onde o compilador não tem de onde tirar: nos parâmetros,
//    e na lista que começa vazia.
// 3. Rode de novo: a saída não pode mudar.
//
// E veja o erro que o painel já aponta: alguém mudou o valor do resumo, que
// era um número, e esqueceu o tipo escrito ao lado. É a cópia que envelheceu.
//
// A saída tem de ser:
//
//     Unidade Ipê: média 57
//     Acima da média: Ana, Caio
//     Resumo: 3 membros

const unidade: string = 'Ipê';
const nomes: string[] = ['Ana', 'Bia', 'Caio'];
const pontos: number[] = [72, 38, 61];
const acima: string[] = [];

function media(valores: number[]): number {
  let soma: number = 0;
  for (const v of valores) {
    soma = soma + v;
  }
  const resultado: number = soma / valores.length;
  return resultado;
}

const valor: number = media(pontos);
for (let i: number = 0; i < nomes.length; i++) {
  if (pontos[i] > valor) {
    acima.push(nomes[i]);
  }
}
console.log(\`Unidade \${unidade}: média \${valor}\`);
console.log(\`Acima da média: \${acima.join(', ')}\`);
const resumo: number = nomes.length + ' membros';
console.log(\`Resumo: \${resumo}\`);
`;

/* ────────────────────────────────────────────────────────────────────────
   6 · Os dois erros
   ──────────────────────────────────────────────────────────────────────── */

const DOIS_ERROS_JS = `// A inscrição, na versão antiga em JavaScript.
// Rode: node inscricao-antiga.js — e leia o terminal até o fim.

const inscritos = [
  { nome: 'Ana', unidade: 'Ipê', idade: 12 },
  { nome: 'Bia', unidade: 'Buriti', idade: 11 },
];

function cadastrar(nome, unidade, idade) {
  inscritos.push({ nome, unidade, idade });
}

function somaDasIdades(lista) {
  let soma = 0;
  for (const p of lista) soma = soma + p.idade;
  return soma;
}

function etiqueta(p) {
  return \`\${p.nome.toUpperCase()} — \${p.unidad.toUpperCase()}\`;
}

// A idade chega do formulário, e o formulário devolve texto.
cadastrar('Caio', 'Jatobá', '13');

console.log(\`Soma das idades: \${somaDasIdades(inscritos)}\`);
for (const p of inscritos) {
  console.log(etiqueta(p));
}
`;

const DOIS_ERROS_TS = `// A mesma inscrição, em TypeScript.
//
// O arquivo inscricao-antiga.js, aqui do lado, é este programa sem tipos.
//
// 1. Rode a versão antiga: node inscricao-antiga.js. Ela roda até o meio,
//    escreve uma soma estranha, e estoura.
// 2. Agora compile esta: tsc. O compilador aponta os dois defeitos — antes
//    de o programa rodar uma linha.
// 3. Conserte os dois aqui, compile e rode: tsc && node inscricao.js
//
// A saída tem de ser:
//
//     Soma das idades: 36
//     ANA — IPÊ
//     BIA — BURITI
//     CAIO — JATOBÁ

interface Inscrito {
  nome: string;
  unidade: string;
  idade: number;
}

const inscritos: Inscrito[] = [
  { nome: 'Ana', unidade: 'Ipê', idade: 12 },
  { nome: 'Bia', unidade: 'Buriti', idade: 11 },
];

function cadastrar(nome: string, unidade: string, idade: number): void {
  inscritos.push({ nome, unidade, idade });
}

function somaDasIdades(lista: Inscrito[]): number {
  let soma = 0;
  for (const p of lista) soma = soma + p.idade;
  return soma;
}

function etiqueta(p: Inscrito): string {
  return \`\${p.nome.toUpperCase()} — \${p.unidad.toUpperCase()}\`;
}

// A idade chega do formulário, e o formulário devolve texto.
cadastrar('Caio', 'Jatobá', '13');

console.log(\`Soma das idades: \${somaDasIdades(inscritos)}\`);
for (const p of inscritos) {
  console.log(etiqueta(p));
}
`;

/* ────────────────────────────────────────────────────────────────────────
   7 · Projeto
   ──────────────────────────────────────────────────────────────────────── */

const PROJETO = `// As vagas do campori.
//
// Esta pasta ainda não é um projeto de TypeScript: não há tsconfig.json.
// Rode tsc no terminal e veja o que ele responde.
//
// 1. Crie o projeto: tsc --init. Abra o tsconfig.json que apareceu.
// 2. Mande o que se gera para uma pasta dist: ligue o "outDir": "./dist".
// 3. Ligue "noEmitOnError": true — é ela que faz o erro segurar a saída.
// 4. Este programa tem um erro de tipo. Rode tsc, e veja o erro apontado
//    e a pasta dist continuar vazia: nada foi gerado para rodar.
// 5. Conserte, e rode: tsc && node dist/programa.js
//
// A saída tem de ser:
//
//     Vagas restantes: 9

function vagasRestantes(total: number, inscritos: number): number {
  return total - inscritos;
}

console.log(\`Vagas restantes: \${vagasRestantes('40', 31)}\`);
`;

/* ────────────────────────────────────────────────────────────────────────
   8 · Converter
   ──────────────────────────────────────────────────────────────────────── */

/**
 * O programa do ranking como a CC-FE003 o deixou — a solução daquele
 * laboratório, com o nome trocado para `.ts`. É o requisito 6: o programa
 * da vereda anterior, e não um novo. O que a pessoa entregou lá não fica
 * guardado depois da entrega, então a lição parte do programa de referência
 * dele, que faz a mesma coisa.
 */
export const RANKING_DA_CC_FE003 = `import { readFileSync } from 'node:fs';

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
`;

const CONVERTER = `// O ranking da gincana, da vereda CC-FE003, agora em TypeScript.
//
// O programa é o mesmo que rodava em JavaScript, só com o nome trocado para
// .ts. Ele funciona — e com o modo estrito o compilador aponta tudo o que
// ele deixava sem dizer.
//
// 1. Eliminar os erros é dar o tipo, e não calar o compilador: nenhum "any"
//    escrito, nenhum "as", nenhum "// @ts-ignore".
// 2. Cada registro do pontuacao.json tem unidade, prova e pontos: escreva
//    uma interface para ele.
// 3. Compile e rode: tsc && node ranking.js — a saída é a mesma de antes:
//
//     Ranking da gincana
//     1º Falcão: 85 pontos
//     2º Pantera: 84 pontos
//     3º Águia: 80 pontos
//     4º Tucano: 65 pontos

${RANKING_DA_CC_FE003}`;

/* ────────────────────────────────────────────────────────────────────────
   O registro
   ──────────────────────────────────────────────────────────────────────── */

const SAIDAS = {
  anotar: 'Inscritos: Ana, Caio\nTaxa por pessoa: R$ 135',
  interface: 'Ana Clara (12) — unidade Ipê\nBruno (11) — unidade Jatobá\nLívia (10) — unidade Buriti',
  uniao: 'Tia Lúcia: 99999-1234\nDavi: sem telefone\nRafael: 98888-4321\nDiretores: 1',
  generico: 'Maior pontuação: 72.0\nPrimeira da chamada: ANA\nFila vazia: ninguém',
  inferencia: 'Unidade Ipê: média 57\nAcima da média: Ana, Caio\nResumo: 3 membros',
  'dois-erros': 'Soma das idades: 36\nANA — IPÊ\nBIA — BURITI\nCAIO — JATOBÁ',
  projeto: 'Vagas restantes: 9',
  converter: 'Ranking da gincana\n1º Falcão: 85 pontos\n2º Pantera: 84 pontos\n3º Águia: 80 pontos\n4º Tucano: 65 pontos',
} as const;

export const SAIDA_DA_CC_FE005: Record<LicaoDaCcFe005, string> = SAIDAS;

/** Um tipo que é número, texto ou booleano, escrito de qualquer jeito comum. */
const ehTipo = (escrito: string, ...aceitos: string[]) => aceitos.includes(escrito.replace(/\s+/g, ''));

const lcd = (ctx: ContextoDoTs, a: string) => analise(ctx, a);

/** O que o terminal viu de um comando, em toda a sessão. */
const rodou = (ctx: ContextoDoTs, teste: (p: PassoComFontes) => boolean) => ctx.historico.some(teste);

const tsconfigDe = (ctx: ContextoDoTs) => ctx.verificacao?.compilacao.opcoes ?? null;

export const LICOES_DA_CC_FE005: Record<LicaoDaCcFe005, DefinicaoDaLicaoDeTs> = {
  anotar: {
    projeto: 'acampamento',
    arquivos: { 'programa.ts': ANOTAR, 'tsconfig.json': TSCONFIG_DO_CLUBE },
    editaveis: ['programa.ts'],
    abre: 'programa.ts',
    executar: DIGITAR('programa.js'),
    metas: [
      {
        id: 'parametros',
        titulo: 'Todo parâmetro com tipo',
        passos: [
          'O tipo vai depois do nome, com dois-pontos: function taxa(dias: number).',
          'nome é texto (string), idade e dias são números (number).',
        ],
        feita: ctx => {
          const a = lcd(ctx, 'programa.ts');
          return !!a && a.funcoes.length >= 2 && a.parametrosSemTipo.length === 0;
        },
        motivo: ctx => {
          const a = lcd(ctx, 'programa.ts');
          if (!a) return 'O compilador ainda está lendo o arquivo.';
          if (a.parametrosSemTipo.length > 0) return `Ainda sem tipo: ${a.parametrosSemTipo.join(', ')}.`;
          return 'As duas funções do programa precisam continuar lá.';
        },
      },
      {
        id: 'retornos',
        titulo: 'Toda função diz o que devolve',
        passos: [
          'O tipo do retorno vai depois dos parênteses: function taxa(dias: number): number.',
          'inscrever devolve verdadeiro ou falso: boolean.',
        ],
        feita: ctx => {
          const a = lcd(ctx, 'programa.ts');
          return !!a && a.funcoes.length >= 2 && a.funcoes.every(f => f.temRetorno);
        },
        motivo: ctx => {
          const a = lcd(ctx, 'programa.ts');
          const faltam = a?.funcoes.filter(f => !f.temRetorno).map(f => f.nome) ?? [];
          return faltam.length > 0 ? `Sem tipo de retorno: ${faltam.join(', ')}.` : undefined;
        },
      },
      {
        id: 'lista-vazia',
        titulo: 'A lista que começa vazia diz de que é feita',
        passos: [
          'Uma lista vazia não diz ao compilador o que vai entrar nela.',
          'Escreva o tipo: const inscritos: string[] = [];',
        ],
        feita: ctx => {
          const a = lcd(ctx, 'programa.ts');
          return !!a && a.listasVaziasSemTipo.length === 0
            && a.variaveisAnotadas.some(v => v.nome === 'inscritos' && ehTipo(v.tipo, 'string[]', 'Array<string>'));
        },
      },
      metaDaSaida('programa.js', ['programa.ts'], SAIDAS.anotar, DIGITAR('programa.js')),
    ],
  },

  interface: {
    projeto: 'membros',
    arquivos: { 'programa.ts': INTERFACE, 'tsconfig.json': TSCONFIG_DO_CLUBE },
    editaveis: ['programa.ts'],
    abre: 'programa.ts',
    executar: DIGITAR('programa.js'),
    metas: [
      {
        id: 'interface',
        titulo: 'Uma interface Membro com nome, idade e unidade',
        passos: [
          'interface Membro { nome: string; idade: number; unidade: string; }',
          'Cada propriedade com o tipo dela: texto é string, número é number.',
        ],
        feita: ctx => {
          const i = lcd(ctx, 'programa.ts')?.interfaces.find(x => x.nome === 'Membro');
          if (!i) return false;
          const tipo = (n: string) => i.membros.find(m => m.nome === n && !m.opcional)?.tipo ?? '';
          return ehTipo(tipo('nome'), 'string') && ehTipo(tipo('idade'), 'number') && ehTipo(tipo('unidade'), 'string');
        },
      },
      {
        id: 'usa-interface',
        titulo: 'A lista e a função usam o Membro',
        passos: [
          'const membros: Membro[] = [ ... ]',
          'function apresentar(m: Membro): string',
        ],
        feita: ctx => {
          const a = lcd(ctx, 'programa.ts');
          if (!a) return false;
          const lista = a.variaveisAnotadas.some(v => v.nome === 'membros' && ehTipo(v.tipo, 'Membro[]', 'Array<Membro>'));
          const funcao = a.funcoes.find(f => f.nome === 'apresentar');
          return lista && !!funcao && ehTipo(funcao.tiposDosParametros[0] ?? '', 'Membro');
        },
      },
      metaDaSaida('programa.js', ['programa.ts'], SAIDAS.interface, DIGITAR('programa.js')),
    ],
  },

  uniao: {
    projeto: 'contatos',
    arquivos: { 'programa.ts': UNIAO, 'tsconfig.json': TSCONFIG_DO_CLUBE },
    editaveis: ['programa.ts'],
    abre: 'programa.ts',
    executar: DIGITAR('programa.js'),
    metas: [
      {
        id: 'cargo',
        titulo: 'O cargo só aceita os três que existem',
        passos: [
          "type Cargo = 'diretor' | 'conselheira' | 'desbravador';",
          'Na interface, cargo: Cargo no lugar de cargo: string.',
          'O compilador passa a apontar o "Diretor" com maiúscula: conserte o dado.',
        ],
        feita: ctx => {
          const a = lcd(ctx, 'programa.ts');
          const u = a?.unioes.find(x => x.membros.length >= 3 && x.membros.every(m => /^'[^']*'$|^"[^"]*"$/.test(m)));
          if (!a || !u) return false;
          const valores = new Set(u.membros.map(m => m.slice(1, -1)));
          const cargo = a.interfaces.find(i => i.nome === 'Pessoa')?.membros.find(m => m.nome === 'cargo');
          return ['diretor', 'conselheira', 'desbravador'].every(v => valores.has(v)) && valores.size === 3
            && !!cargo && cargo.tipo.trim() === u.nome;
        },
      },
      {
        id: 'opcional',
        titulo: 'O telefone é opcional',
        passos: ['Um ponto de interrogação depois do nome: telefone?: string;'],
        feita: ctx => !!lcd(ctx, 'programa.ts')?.interfaces.find(i => i.nome === 'Pessoa')
          ?.membros.some(m => m.nome === 'telefone' && m.opcional && ehTipo(m.tipo, 'string')),
      },
      {
        id: 'trata-a-falta',
        titulo: 'A falta do telefone é tratada, e não calada',
        passos: [
          'Antes de usar p.telefone, pergunte se ele existe: if (p.telefone === undefined) return ...',
          'Nem "p.telefone!" nem "as string": os dois dizem ao compilador que está tudo bem, sem estar.',
        ],
        feita: ctx => {
          const a = lcd(ctx, 'programa.ts');
          return !!a && compilaLimpo(ctx) && a.naoNulos === 0 && a.afirmacoes === 0 && a.anyEscrito === 0 && a.silenciadores === 0
            && !!a.interfaces.find(i => i.nome === 'Pessoa')?.membros.some(m => m.nome === 'telefone' && m.opcional);
        },
        motivo: ctx => {
          const a = lcd(ctx, 'programa.ts');
          if (a && (a.naoNulos > 0 || a.afirmacoes > 0)) return 'O "!" e o "as" fazem o erro sumir sem resolver nada: quem não tem telefone continuaria estourando.';
          return motivoDaCompilacao(ctx);
        },
      },
      metaDaSaida('programa.js', ['programa.ts'], SAIDAS.uniao, DIGITAR('programa.js')),
    ],
  },

  generico: {
    projeto: 'fila',
    arquivos: { 'programa.ts': GENERICO, 'tsconfig.json': TSCONFIG_DO_CLUBE },
    editaveis: ['programa.ts'],
    abre: 'programa.ts',
    executar: DIGITAR('programa.js'),
    metas: [
      {
        id: 'generica',
        titulo: 'Uma função genérica primeiro, com o tipo T',
        passos: [
          'function primeiro<T>(lista: T[]): T | undefined { return lista[0]; }',
          'O <T> depois do nome diz: o tipo é o da lista que chegar.',
        ],
        feita: ctx => {
          const f = lcd(ctx, 'programa.ts')?.funcoes.find(x => x.nome === 'primeiro');
          return !!f && f.parametrosDeTipo.length === 1
            && f.tiposDosParametros.some(t => t.includes(f.parametrosDeTipo[0]));
        },
      },
      {
        id: 'uma-so',
        titulo: 'Uma função só, para as listas de todo tipo',
        passos: [
          'Apague primeiroNumero, primeiroTexto e primeiroDeQualquer.',
          'Chame primeiro(pontos), primeiro(nomes) e primeiro(fila).',
        ],
        feita: ctx => {
          const a = lcd(ctx, 'programa.ts');
          if (!a) return false;
          const restantes = a.funcoes.filter(f => /^primeiro.+/.test(f.nome));
          const listas = new Set(a.chamadas.filter(c => c.nome === 'primeiro').map(c => c.primeiroArgumento));
          return restantes.length === 0 && listas.has('pontos') && listas.has('nomes');
        },
      },
      {
        id: 'sem-any',
        titulo: 'Nenhum any escrito, e o undefined tratado',
        passos: [
          'Com a genérica no lugar, o any não é mais necessário.',
          'primeiro(pontos) pode ser undefined: use ?. — primeiro(pontos)?.toFixed(1).',
        ],
        feita: ctx => {
          const a = lcd(ctx, 'programa.ts');
          return !!a && compilaLimpo(ctx) && a.anyEscrito === 0 && a.naoNulos === 0 && a.afirmacoes === 0 && a.silenciadores === 0;
        },
        motivo: ctx => {
          const a = lcd(ctx, 'programa.ts');
          if (a && a.anyEscrito > 0) return 'Ainda há "any" escrito no arquivo.';
          return motivoDaCompilacao(ctx);
        },
      },
      metaDaSaida('programa.js', ['programa.ts'], SAIDAS.generico, DIGITAR('programa.js')),
    ],
  },

  inferencia: {
    projeto: 'media',
    arquivos: { 'programa.ts': INFERENCIA, 'tsconfig.json': TSCONFIG_DO_CLUBE },
    editaveis: ['programa.ts'],
    abre: 'programa.ts',
    executar: DIGITAR('programa.js'),
    metas: [
      {
        id: 'sem-repeticao',
        titulo: 'Nenhum tipo repetido onde o valor já diz',
        passos: [
          "const unidade = 'Ipê'; — o compilador infere string.",
          'let soma = 0; e const resultado = soma / valores.length; — number, inferidos.',
          'O i do for também: for (let i = 0; ...).',
          'O resumo é texto, e o compilador sabe: const resumo = nomes.length + \' membros\';',
          'Mas o parâmetro valores: number[] e a lista vazia acima: string[] continuam com tipo — ali o compilador não tem de onde tirar.',
        ],
        /* E sem tirar o tipo de onde ele é necessário — o parâmetro e a
           lista vazia. Isso é verdade no modelo, e como tarefa própria
           abriria verde; viaja junto, como condição desta. */
        feita: ctx => {
          const a = lcd(ctx, 'programa.ts');
          return !!a && a.anotacoesRedundantes.length === 0
            && a.parametrosSemTipo.length === 0 && a.listasVaziasSemTipo.length === 0
            && a.funcoes.some(f => f.nome === 'media');
        },
        motivo: ctx => {
          const a = lcd(ctx, 'programa.ts');
          if (!a) return undefined;
          if (a.anotacoesRedundantes.length > 0) return `Ainda repetem o tipo do valor: ${a.anotacoesRedundantes.join(', ')}.`;
          if (a.parametrosSemTipo.length > 0) return `O parâmetro precisa do tipo — o compilador não tem de onde tirá-lo: ${a.parametrosSemTipo.join(', ')}.`;
          if (a.listasVaziasSemTipo.length > 0) return `A lista que começa vazia precisa do tipo: ${a.listasVaziasSemTipo.join(', ')}.`;
          return undefined;
        },
      },
      metaDaSaida('programa.js', ['programa.ts'], SAIDAS.inferencia, DIGITAR('programa.js')),
    ],
  },

  'dois-erros': {
    projeto: 'inscricao',
    arquivos: { 'inscricao.ts': DOIS_ERROS_TS, 'inscricao-antiga.js': DOIS_ERROS_JS, 'tsconfig.json': TSCONFIG_DO_CLUBE },
    editaveis: ['inscricao.ts'],
    abre: 'inscricao.ts',
    executar: DIGITAR('inscricao.js'),
    metas: [
      {
        id: 'viu-estourar',
        titulo: 'Ver a versão em JavaScript estourar ao rodar',
        passos: [
          'No terminal: node inscricao-antiga.js',
          'A soma sai "2313" — o 13 entrou como texto e o + juntou —, e depois o programa estoura com um TypeError.',
        ],
        feita: ctx => rodou(ctx, p => p.tipo === 'node' && /inscricao-antiga\.js/.test(p.comando) && /TypeError/.test(p.execucao?.erro ?? '')),
      },
      {
        id: 'viu-apontar',
        titulo: 'Ver o compilador apontar os dois antes de rodar',
        passos: [
          'No terminal: tsc',
          'Ele aponta a propriedade que não existe e o texto passado onde se esperava número — com o arquivo e a linha.',
        ],
        feita: ctx => rodou(ctx, p => {
          const codigos = new Set((p.compilacao?.diagnosticos ?? []).map(d => d.codigo));
          return p.tipo === 'tsc' && (codigos.has(2551) || codigos.has(2339)) && codigos.has(2345);
        }),
      },
      metaDaSaida('inscricao.js', ['inscricao.ts'], SAIDAS['dois-erros'], DIGITAR('inscricao.js')),
    ],
  },

  projeto: {
    projeto: 'campori',
    arquivos: { 'programa.ts': PROJETO },
    editaveis: ['programa.ts', 'tsconfig.json'],
    abre: 'programa.ts',
    executar: 'tsc && node dist/programa.js',
    metas: [
      {
        id: 'tsconfig',
        titulo: 'Criar o projeto, com o modo estrito',
        passos: [
          'No terminal: tsc --init',
          'O tsconfig.json aparece na lateral, e já vem com "strict": true.',
        ],
        feita: ctx => 'tsconfig.json' in ctx.pasta && tsconfigDe(ctx)?.strict === true,
      },
      {
        id: 'opcoes',
        titulo: 'O que se gera vai para dist, e o erro segura a saída',
        passos: [
          'No tsconfig.json, tire as duas barras da linha do outDir e escreva "./dist".',
          'Tire as barras da linha do noEmitOnError: "noEmitOnError": true.',
        ],
        feita: ctx => {
          const o = tsconfigDe(ctx);
          return !!o && o.outDir === 'dist' && o.noEmitOnError;
        },
        motivo: ctx => {
          const o = tsconfigDe(ctx);
          if (!o || !('tsconfig.json' in ctx.pasta)) return 'Crie o tsconfig.json primeiro.';
          if (o.outDir !== 'dist') return 'O outDir ainda não aponta para ./dist.';
          if (!o.noEmitOnError) return 'O noEmitOnError ainda está desligado — ou ainda comentado.';
          return undefined;
        },
      },
      {
        id: 'segurou',
        titulo: 'Ver o erro apontado, e nada gerado para rodar',
        passos: [
          'Com o erro ainda no programa, rode tsc.',
          'O terminal aponta o erro, e a pasta dist não aparece: com noEmitOnError, o JavaScript não é gerado.',
        ],
        feita: ctx => rodou(ctx, p => p.tipo === 'tsc' && !!p.compilacao && p.compilacao.diagnosticos.length > 0
          && p.compilacao.opcoes.noEmitOnError && p.compilacao.opcoes.outDir === 'dist'
          && Object.keys(p.compilacao.emitidos).length === 0),
      },
      metaDaSaida('dist/programa.js', ['programa.ts', 'tsconfig.json'], SAIDAS.projeto, 'tsc && node dist/programa.js'),
    ],
  },

  converter: {
    projeto: 'gincana',
    arquivos: { 'ranking.ts': CONVERTER, 'pontuacao.json': PONTUACAO_DA_GINCANA, 'tsconfig.json': TSCONFIG_DO_CLUBE },
    editaveis: ['ranking.ts'],
    abre: 'ranking.ts',
    executar: DIGITAR('ranking.js'),
    metas: [
      {
        id: 'registro',
        titulo: 'Uma interface para cada registro do arquivo',
        passos: [
          'Abra o pontuacao.json: cada registro tem unidade, prova e pontos.',
          'interface Registro { unidade: string; prova: string; pontos: number; }',
          'carregar devolve Registro[].',
        ],
        feita: ctx => !!lcd(ctx, 'ranking.ts')?.interfaces.some(i => {
          const tipo = (n: string) => i.membros.find(m => m.nome === n)?.tipo ?? '';
          return ehTipo(tipo('unidade'), 'string') && ehTipo(tipo('pontos'), 'number');
        }),
      },
      {
        id: 'sem-calar',
        titulo: 'Zero erro de tipo, sem calar o compilador',
        passos: [
          'Cada parâmetro ganha o seu tipo; o objeto dos totais é Record<string, number>.',
          'Nenhum "any", nenhum "as", nenhum "// @ts-ignore": eliminar não é esconder.',
        ],
        feita: ctx => {
          const a = lcd(ctx, 'ranking.ts');
          return !!a && compilaLimpo(ctx) && a.anyEscrito === 0 && a.afirmacoes === 0 && a.silenciadores === 0 && a.naoNulos === 0;
        },
        motivo: ctx => {
          const a = lcd(ctx, 'ranking.ts');
          if (a && (a.anyEscrito > 0 || a.afirmacoes > 0 || a.silenciadores > 0 || a.naoNulos > 0)) {
            return 'O erro sumiu, mas por "any", "as", "!" ou "@ts-ignore": o compilador foi calado, e não convencido.';
          }
          return motivoDaCompilacao(ctx);
        },
      },
      metaDaSaida('ranking.js', ['ranking.ts'], SAIDAS.converter, DIGITAR('ranking.js')),
    ],
  },
};

export const metasDaCcFe005 = (licao: LicaoDaCcFe005): MetaDoTs[] => LICOES_DA_CC_FE005[licao].metas;
