import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import { VEREDAS } from './veredas';
import { ANALISADOR, type SaidaDaAnalise } from '../labs/pythonAnalise';
import { validarPython } from '../lib/pythonValidator';
import { classificacaoInicial, type Classificacao } from '../labs/falhasDePython';
import type { LicaoDeVereda } from './veredas';

/*
  Os laboratórios de Python, conferidos rodando.

  ── Por que a trava de sempre não basta aqui ─────────────────────────────
  `veredas.test.ts` confere que o modelo abre sem verificação verde, e o faz sem
  execução nenhuma — porque em HTML e em CSS não há execução: o validador lê o
  texto. Em Python metade das verificações só responde depois de rodar, então
  aquela trava aprova qualquer modelo, inclusive um que estivesse pronto.

  ── E a pergunta que ninguém tinha feito ─────────────────────────────────
  Um laboratório impossível é pior do que um que abre resolvido: a pessoa faz
  tudo certo, a lista continua vermelha, e não há nada na tela que explique.
  Uma saída esperada com um espaço a mais, um enunciado que pede o que a
  verificação não aceita — nada disso estoura em lugar nenhum.

  Por isso cada laboratório tem aqui a solução de referência, e ela precisa
  deixar a lista inteira verde. É a mesma ideia do jogo de verdade que passa nas
  dez verificações da CC001, do outro lado da estante.
*/

interface Py {
  runPython: (c: string) => unknown;
  setStdin: (o: { stdin: () => string }) => void;
  setStdout: (o: { batched: (t: string) => void }) => void;
  setStderr: (o: { batched: (t: string) => void }) => void;
}

let py: Py;

beforeAll(async () => {
  const require = createRequire(import.meta.url);
  const dir = require.resolve('pyodide/package.json').replace(/package\.json$/, '');
  const { loadPyodide } = await import(`${dir}pyodide.mjs`);
  py = await loadPyodide({ indexURL: dir }) as Py;
}, 120000);

/** O mesmo par que o laboratório faz: analisar primeiro, depois executar. */
function conferir(licao: Extract<LicaoDeVereda, { tipo: 'laboratorio' }>, codigo: string, classificacao: Classificacao) {
  py.runPython(`_fonte = ${JSON.stringify(codigo)}`);
  const analise = JSON.parse(py.runPython(ANALISADOR) as string) as SaidaDaAnalise;

  let saida = '';
  let erro: string | null = null;
  if (!analise.ok) {
    /* Sem árvore não há o que rodar: o Python recusaria com o mesmo erro. */
    erro = analise.erro.msg;
  } else {
    const entrada = licao.entradaPadrao ?? [];
    let i = 0;
    py.setStdin({ stdin: () => (i < entrada.length ? entrada[i++] : '') });
    py.setStdout({ batched: t => { saida += `${t}\n`; } });
    py.setStderr({ batched: t => { saida += `${t}\n`; } });
    try {
      py.runPython(codigo);
    } catch (e) {
      erro = String((e as Error)?.message ?? e);
    }
  }

  return validarPython({
    codigo,
    achados: analise.ok ? analise.achados : {},
    erroDeAnalise: analise.ok ? null : analise.erro.msg,
    execucao: { saida, erro, semFim: false },
    saidaEsperada: licao.saidaEsperada,
    falhas: licao.falhas,
    classificacao,
  }, licao.verificacoes);
}

const laboratorios = () => (VEREDAS.find(v => v.code === 'CC002')?.modulos ?? [])
  .flatMap(m => m.licoes)
  .filter((l): l is Extract<LicaoDeVereda, { tipo: 'laboratorio' }> => l.tipo === 'laboratorio');

/*
  As soluções de referência: um programa por laboratório, escrito como quem
  acabou de ler a lição escreveria. Elas moram no teste, e não no currículo —
  gabarito no currículo é gabarito a um import de distância da tela.
*/
const SOLUCOES: Record<string, string> = {
  'm2-lab': `nome = "Ana"
idade = 12
altura = 1.58
inscrito = True

print("Nome:", nome)
print("Idade:", idade)
print("Altura:", altura)
print("Inscrito:", inscrito)
`,

  'm3-lab': `nome = input("Seu nome: ")
idade = int(input("Sua idade: "))

print("Olá,", nome)
print("Ano que vem você faz", idade + 1)
`,

  'm4-lab': `arrecadado = 480
gasto = 375
desbravadores = 12

sobrou = arrecadado - gasto
por_desbravador = sobrou / desbravadores

print("Sobrou:", sobrou)
print("Por desbravador:", por_desbravador)
print("Fechou no azul?", sobrou > 0)
`,

  'm5-lab': `nota = 7

if nota >= 9:
    print("excelente")
elif nota >= 6:
    print("bom")
else:
    print("a recuperar")
`,

  'm6-lab': `for desbravador in range(4):
    print("Presente!")

total = 0
contribuicoes = 0

while total < 100:
    total = total + 25
    contribuicoes = contribuicoes + 1

print("Foram", contribuicoes, "contribuicoes")
`,

  'm7-lab': `notas = [8, 6, 10]
soma = 0

for n in notas:
    soma = soma + n

print("Soma:", soma)

media = soma / len(notas)
print("Media:", media)

if media >= 9:
    print("Conceito: excelente")
elif media >= 6:
    print("Conceito: bom")
else:
    print("Conceito: a recuperar")
`,

  /* Quarenta linhas de programa, com entrada e saída — como o requisito 7 pede.
     A entrada vem do campo ao lado, e por isso ela é declarada abaixo. */
  'm8-lab': `# Caixa do acampamento da unidade Falcão
nome_da_unidade = "Falcão"
valor_da_diaria = 45.0
dias = 3
caixa = 0.0
inscritos = 0
pendentes = 0

print("Caixa do acampamento -", nome_da_unidade)
print("Diária:", valor_da_diaria, "por", dias, "dias")

quantos = int(input("Quantos desbravadores? "))

for numero in range(quantos):
    pago = float(input("Quanto já foi pago? "))
    total_devido = valor_da_diaria * dias
    caixa = caixa + pago
    if pago >= total_devido:
        print("Desbravador", numero + 1, "- inscrito")
        inscritos = inscritos + 1
    elif pago > 0:
        print("Desbravador", numero + 1, "- falta", total_devido - pago)
        pendentes = pendentes + 1
    else:
        print("Desbravador", numero + 1, "- nao pagou nada")
        pendentes = pendentes + 1

esperado = valor_da_diaria * dias * quantos
falta = esperado - caixa

print("Arrecadado:", caixa)
print("Esperado:", esperado)
print("Inscritos:", inscritos)
print("Pendentes:", pendentes)

lembretes = 0
while lembretes < pendentes:
    lembretes = lembretes + 1
    print("Lembrete", lembretes, "enviado")

media_paga = caixa / quantos
print("Media paga por desbravador:", media_paga)

if falta <= 0:
    print("A unidade fechou o caixa")
elif falta < valor_da_diaria:
    print("Falta menos de uma diaria:", falta)
else:
    print("Ainda faltam", falta)

print("Fim do relatorio da unidade", nome_da_unidade)
`,
};

const ENTRADA_DA_SOLUCAO: Record<string, string[]> = {
  'm8-lab': ['2', '135', '50'],
};

const CLASSIFICACAO_CERTA: Record<string, Classificacao> = {
  'm7-lab': { f1: 'sintaxe', f2: 'execucao', f3: 'logica' },
};

describe('os laboratórios de Python da CC002', () => {
  it('há laboratórios para conferir', () => {
    expect(laboratorios().length).toBeGreaterThan(4);
  });

  /*
    Rodando o modelo, nada fica verde — com uma exceção nomeada.

    "O programa roda até o fim" é verdade num arquivo só de comentários, e por
    isso `roda` só é cobrado onde significa alguma coisa: no laboratório de
    consertar, cujo modelo não roda, e no programa livre, que não tem saída fixa
    para comparar. Ali ele pode abrir verde, e a lista continua tendo o que
    fazer — é o que a segunda asserção confere.
  */
  it('nenhum modelo abre com verificação verde, tirando o "roda" declarado', () => {
    const indevidas: string[] = [];
    for (const l of laboratorios()) {
      const verdes = conferir(l, l.modelo, classificacaoInicial(l.falhas ?? []))
        .filter(r => r.passed).map(r => r.id);
      for (const id of verdes.filter(id => id !== 'roda')) indevidas.push(`${l.id}: ${id}`);
      expect(verdes.length, `${l.id} abre com tudo verde`).toBeLessThan(l.verificacoes.length);
    }
    expect(indevidas).toEqual([]);
  });

  /*
    E a solução de referência deixa a lista inteira verde.

    É a pergunta que faltava: laboratório impossível não estoura em lugar nenhum,
    e quem faz tudo certo fica olhando uma lista vermelha sem explicação.
  */
  it('toda solução de referência passa em todas as verificações', () => {
    const reprovadas: string[] = [];
    for (const l of laboratorios()) {
      const solucao = SOLUCOES[l.id];
      expect(solucao, `${l.id} não tem solução de referência`).toBeDefined();

      const licao = ENTRADA_DA_SOLUCAO[l.id]
        ? { ...l, entradaPadrao: ENTRADA_DA_SOLUCAO[l.id] }
        : l;
      const resultados = conferir(licao, solucao, CLASSIFICACAO_CERTA[l.id] ?? {});
      for (const r of resultados.filter(r => !r.passed)) {
        reprovadas.push(`${l.id} · ${r.id}: ${r.detail ?? r.hint}`);
      }
    }
    expect(reprovadas).toEqual([]);
  });

  /* O enunciado mora no modelo, e um modelo sem enunciado é uma tela em branco
     com uma lista de tarefas ao lado. */
  it('todo modelo traz o enunciado escrito nele', () => {
    const mudos = laboratorios()
      .filter(l => !l.modelo.trimStart().startsWith('#') || l.modelo.length < 120)
      .map(l => l.id);
    expect(mudos).toEqual([]);
  });
});
