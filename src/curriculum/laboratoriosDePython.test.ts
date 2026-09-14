import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import { VEREDAS } from './veredas';
import { ANALISADOR, type SaidaDaAnalise } from '../labs/pythonAnalise';
import { validarPython } from '../lib/pythonValidator';
import { classificacaoInicial, type Classificacao } from '../labs/falhasDePython';
import { preambuloDoProjeto } from '../labs/projetoDePython';
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
      /*
        A pasta do projeto, do mesmo jeito que o worker a prepara.

        Sem isto, o laboratório que lê um arquivo reprovaria aqui com
        FileNotFoundError e passaria no navegador — uma trava dizendo o
        contrário do que o desbravador vê é pior do que trava nenhuma. É
        também o que garante que o disco comece igual a cada solução
        conferida: uma instância só do Pyodide serve a todas.
      */
      const naPasta = licao.arquivosDoProjeto ?? [];
      if (naPasta.length) {
        py.runPython(preambuloDoProjeto(
          Object.fromEntries(naPasta.map(a => [a.nome, a.modelo]))));
      }
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

/*
  Toda vereda com laboratório de Python, e não uma lista escrita à mão.

  Estava fixa em CC002, que era a única que havia. A CC004 chegou e não entraria
  — e uma omissão dessas não reprova nada: a build segue verde conferindo os
  laboratórios velhos, que é a pior forma de falhar, porque é indistinguível de
  estar tudo certo. É a mesma correção que `index.test.ts` já fez quando a AP043
  abriu fora do `describe.each`.
*/
const laboratorios = () => VEREDAS
  .flatMap(v => (v.modulos ?? []).flatMap(m => m.licoes).map(l => [v.code, l] as const))
  .filter((par): par is [string, Extract<LicaoDeVereda, { tipo: 'laboratorio' }>] =>
    par[1].tipo === 'laboratorio' && par[1].linguagem === 'python');

/*
  As soluções de referência: um programa por laboratório, escrito como quem
  acabou de ler a lição escreveria. Elas moram no teste, e não no currículo —
  gabarito no currículo é gabarito a um import de distância da tela.
*/
const SOLUCOES: Record<string, string> = {
  'CC002/m2-lab': `nome = "Ana"
idade = 12
altura = 1.58
inscrito = True

print("Nome:", nome)
print("Idade:", idade)
print("Altura:", altura)
print("Inscrito:", inscrito)
`,

  'CC002/m3-lab': `nome = input("Seu nome: ")
idade = int(input("Sua idade: "))

print("Olá,", nome)
print("Ano que vem você faz", idade + 1)
`,

  'CC002/m4-lab': `arrecadado = 480
gasto = 375
desbravadores = 12

sobrou = arrecadado - gasto
por_desbravador = sobrou / desbravadores

print("Sobrou:", sobrou)
print("Por desbravador:", por_desbravador)
print("Fechou no azul?", sobrou > 0)
`,

  'CC002/m5-lab': `nota = 7

if nota >= 9:
    print("excelente")
elif nota >= 6:
    print("bom")
else:
    print("a recuperar")
`,

  'CC002/m6-lab': `for desbravador in range(4):
    print("Presente!")

total = 0
contribuicoes = 0

while total < 100:
    total = total + 25
    contribuicoes = contribuicoes + 1

print("Foram", contribuicoes, "contribuicoes")
`,

  'CC002/m7-lab': `notas = [8, 6, 10]
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
  'CC002/m8-lab': `# Caixa do acampamento da unidade Falcão
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

  /* Uma função só, com os três itens do requisito 4 dentro dela: recebe e
     devolve, tem um parâmetro com padrão, e é chamada de três pontos. */
  'CC004/m1-lab': `def ficha(nome, unidade, saudacao="Boa noite"):
    return saudacao + ", " + nome + " - unidade " + unidade

print(ficha("Ana", "Falcão"))
print(ficha("Tiago", "Pantera"))
print(ficha("Bia", "Águia", "Bom dia"))
`,

  /* Cada coleção no trabalho em que ela é a certa. Os dois primeiros números
     saem dos mesmos nomes: o que os separa é a coleção escolhida. */
  'CC004/m2-lab': `chamada = ["Ana", "Tiago", "Ana", "Bia", "Tiago"]
acampamento = ("Serra Azul", 2026)
ficha = {"nome": "Ana", "unidade": "Falcão"}
presentes = set(chamada)

print("Anotados:", len(chamada))
print("Pessoas diferentes:", len(presentes))
print("Acampamento: " + acampamento[0] + ", " + str(acampamento[1]))
print(ficha["nome"], "é da unidade", ficha["unidade"])
`,

  /* O csv lê o nome com vírgula dentro sem deslocar nada; o int() é o que faz
     a média ser média. As duas armadilhas do módulo 4 numa solução só. */
  'CC004/m4-lab': `import csv, json

inscritos = []
with open("inscritos.csv", encoding="utf-8", newline="") as arquivo:
    for linha in csv.DictReader(arquivo):
        inscritos.append(linha)

por_unidade = {}
soma = 0
for inscrito in inscritos:
    unidade = inscrito["unidade"]
    por_unidade[unidade] = por_unidade.get(unidade, 0) + 1
    soma = soma + int(inscrito["idade"])

resumo = {
    "total": len(inscritos),
    "por_unidade": por_unidade,
    "idade_media": soma / len(inscritos),
}

with open("resumo.json", "w", encoding="utf-8") as arquivo:
    json.dump(resumo, arquivo, ensure_ascii=False, indent=2)

with open("resumo.json", encoding="utf-8") as arquivo:
    lido = json.load(arquivo)

print("Total:", lido["total"])
for unidade in sorted(lido["por_unidade"]):
    print(unidade + ":", lido["por_unidade"][unidade])
print("Idade média:", lido["idade_media"])
`,

  /* O try apanha o que nem vira número; o if apanha o que vira e não vale. E o
     laço é o que transforma os dois em segunda chance, em vez de em fim. */
  'CC004/m5-lab': `def pedir_idade(quem):
    while True:
        try:
            idade = int(input(quem + ", quantos anos? "))
        except ValueError:
            print("Isso não é um número. Tente de novo.")
            continue
        if idade < 0:
            print("Idade não é negativa. Tente de novo.")
            continue
        return idade

primeira = pedir_idade("Ana")
segunda = pedir_idade("Tiago")
print("Soma das idades:", primeira + segunda)
`,

  /* Ler o que chegou, gravar o resultado, e reler para conferir. O `if nome:`
     e o `.strip()` não são zelo: o unidades.txt vem com espaço sobrando numa
     linha e uma linha em branco no meio, como arquivo de verdade vem. */
  'CC004/m3-lab': `unidades = []
with open("unidades.txt", encoding="utf-8") as arquivo:
    for linha in arquivo:
        nome = linha.strip()
        if nome:
            unidades.append(nome)

with open("presenca.txt", "w", encoding="utf-8") as arquivo:
    for nome in unidades:
        arquivo.write("Unidade: " + nome + "\\n")

with open("presenca.txt", encoding="utf-8") as arquivo:
    for linha in arquivo:
        print(linha.strip())
`,
};

const ENTRADA_DA_SOLUCAO: Record<string, string[]> = {
  'CC002/m8-lab': ['2', '135', '50'],
};

const CLASSIFICACAO_CERTA: Record<string, Classificacao> = {
  'CC002/m7-lab': { f1: 'sintaxe', f2: 'execucao', f3: 'logica' },
};

describe('os laboratórios de Python das veredas', () => {
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
    for (const [code, l] of laboratorios()) {
      const verdes = conferir(l, l.modelo, classificacaoInicial(l.falhas ?? []))
        .filter(r => r.passed).map(r => r.id);
      for (const id of verdes.filter(id => id !== 'roda')) indevidas.push(`${code}/${l.id}: ${id}`);
      expect(verdes.length, `${code}/${l.id} abre com tudo verde`).toBeLessThan(l.verificacoes.length);
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
    for (const [code, l] of laboratorios()) {
      /* Pela vereda e pelo id: `m3-lab` existe na CC002 e na CC004, e uma
         chave só daria a solução de uma ao laboratório da outra — que
         reprovaria com uma mensagem falando de outro exercício. */
      const chave = `${code}/${l.id}`;
      const solucao = SOLUCOES[chave];
      expect(solucao, `${chave} não tem solução de referência`).toBeDefined();

      const licao = ENTRADA_DA_SOLUCAO[chave]
        ? { ...l, entradaPadrao: ENTRADA_DA_SOLUCAO[chave] }
        : l;
      const resultados = conferir(licao, solucao, CLASSIFICACAO_CERTA[chave] ?? {});
      for (const r of resultados.filter(r => !r.passed)) {
        reprovadas.push(`${chave} · ${r.id}: ${r.detail ?? r.hint}`);
      }
    }
    expect(reprovadas).toEqual([]);
  });

  /* O enunciado mora no modelo, e um modelo sem enunciado é uma tela em branco
     com uma lista de tarefas ao lado. */
  it('todo modelo traz o enunciado escrito nele', () => {
    const mudos = laboratorios()
      .filter(([, l]) => !l.modelo.trimStart().startsWith('#') || l.modelo.length < 120)
      .map(([code, l]) => `${code}/${l.id}`);
    expect(mudos).toEqual([]);
  });
});
