/**
 * A base da CC-ES009: o formulário da CC-ES008, fechado.
 *
 * ── Por que é o mesmo formulário ─────────────────────────────────────────
 * Está escrito no requisito 8: a pergunta própria é "a respeito da base
 * coletada na vereda CC-ES008". Uma base nova aqui faria a exigência do
 * requisito 1 virar enfeite — o desbravador teria arrumado um formulário numa
 * vereda e analisado outro dado na seguinte, e a única coisa que a CC-ES008
 * teria ensinado seria clicar.
 *
 * Ele chega **fechado** porque análise acontece depois da coleta: com o
 * formulário ainda aceitando resposta, toda conta feita aqui envelheceria no
 * envio seguinte, e a mediana da terça não seria a de quarta. `aceitandoRespostas`
 * já existe e já significa isso.
 *
 * ── E ele chega arrumado ─────────────────────────────────────────────────
 * O módulo 5 da CC-ES008 é o conserto das inconsistências. Começar esta vereda
 * mandando refazer aquele trabalho ensinaria que o trabalho anterior não conta
 * — é a decisão do caderno da CC-ES003, cujo módulo 2 recebe a aba **já**
 * arrumada, e está escrita lá pelo mesmo motivo.
 *
 * Os quatro consertos que a CC-ES008 ensina aparecem aqui como as quatro
 * exceções de `HERDADOS`, e não como uma regra geral de limpeza:
 *
 *   - a unidade escrita de quatro jeitos virou a grafia da lista (e isso não
 *     é exceção nenhuma: `unidadeCanonica` a resolve sozinha);
 *   - a resposta que chegou **sem** unidade ganhou a dela, porque o clube foi
 *     perguntar — não havia grafia para normalizar;
 *   - os dois e-mails em branco foram atrás do responsável, que é exatamente o
 *     que "marcar obrigatório depois não preenche o que já chegou em branco"
 *     quer dizer;
 *   - as duas diárias com ponto decimal viraram número inteiro, porque diária
 *     é noite dormida e não existe meia.
 *
 * ── Nome, e-mail e diárias não são recopiados ────────────────────────────
 * Eles saem de `formularioDeInscricao()`, lido aqui. Duas listas dos mesmos
 * quinze desbravadores divergiriam no primeiro ajuste de redação, e o
 * desbravador que acabou de arrumar o formulário encontraria outro Bruno Costa
 * na vereda seguinte — sem nada estourar, porque as duas veredas nunca se
 * olhariam. É a decisão de `correspondencia` importar `CONSELHEIROS` e de
 * `metasDaCcEs004` importar `moldeDoNome` da CC-ES001: uma fonte, e não uma
 * trava conferindo duas.
 *
 * ── O que o formulário passou a perguntar ────────────────────────────────
 * Quatro campos novos, e cada um existe por um requisito:
 *
 *   - **idade** e **acampamentos** são quantitativas **discretas** — contagens;
 *   - **altura** é quantitativa **contínua** — medida. É a única da base, e sem
 *     ela o requisito 5.1 teria uma classificação que nunca aparece, que é o
 *     "zero link não é zero link quebrado" aplicado a um exercício de
 *     classificar;
 *   - **camiseta** é qualitativa **ordinal** — PP, P, M, G e GG têm ordem, e
 *     nenhuma conta. Sem ela, "qualitativa" e "nominal" pareceriam a mesma
 *     palavra.
 *
 * `acampamentos` carrega três requisitos de uma vez, e é por isso que ela é
 * uma contagem de evento raro e não mais uma medida: a média dela fica bem
 * acima da mediana (requisito 3), o que puxa a média são três veteranos
 * (requisito 5.6), e eles são **reais** — a decisão que o requisito 5.6 pede
 * por escrito é mantê-los e relatar a mediana ao lado, e não apagá-los.
 *
 * ── O valor que se exclui é outro, e não grita ───────────────────────────
 * Uma altura de 1,05 m não é ninguém: é o 1,50 digitado com os algarismos
 * trocados. Ela é um número válido, passa por qualquer soma, e move a média da
 * turma em **um centímetro** — o número plausível de sempre. Os dois valores
 * atípicos da base são de naturezas opostas de propósito: um é gente e fica, o
 * outro é digitação e sai. Uma base com atípico de um tipo só faria "decidir"
 * virar "apagar o que está longe".
 */

import { CONSELHEIROS } from './cadernoDoClube';
import {
  type Campo, type Formulario, type Resposta,
  CAMPO_ALIMENTACAO, CAMPO_DIARIAS, CAMPO_EMAIL, CAMPO_NOME, CAMPO_OBSERVACAO, CAMPO_UNIDADE,
  formularioDeInscricao, paraComparar, respostasReais, valorDa,
} from './formulario';

/* ── Os campos novos ──────────────────────────────────────────────────────── */

export const CAMPO_IDADE = 'idade';
export const CAMPO_ALTURA = 'altura';
export const CAMPO_CAMISETA = 'camiseta';
export const CAMPO_ACAMPAMENTOS = 'acampamentos';

/** As unidades do clube, na ordem em que o clube as escreve. */
export const UNIDADES_DO_CLUBE = CONSELHEIROS.map(([unidade]) => unidade);

/**
 * Os tamanhos, **em ordem**, que é o que os torna uma variável ordinal.
 *
 * A ordem é a do vestuário e não a alfabética: escrita em ordem de letra, GG
 * viria antes de M e a única coisa que distingue ordinal de nominal — poder
 * dizer "maior que" — sumiria do arquivo.
 */
export const TAMANHOS_DE_CAMISETA = ['PP', 'P', 'M', 'G', 'GG'];

export const ALIMENTACOES = ['Comum', 'Vegetariana', 'Sem lactose', 'Sem glúten'];

/* ── O clube inteiro, e não só quem se inscreveu ──────────────────────────── */

export interface UnidadeDoClube {
  nome: string;
  conselheiro: string;
  /** Quantos desbravadores a unidade tem — inscritos ou não. */
  membros: number;
}

/**
 * Quantos desbravadores cada unidade tem.
 *
 * É o denominador, e sem ele o requisito 4 não existe: taxa é uma divisão, e
 * uma base que só guarda quem se inscreveu não tem por que dividir. O número
 * de membros não vem do formulário — vem da secretaria do clube, que é de onde
 * ele vem na vida real.
 *
 * ── Os números não são quaisquer números ─────────────────────────────────
 * O requisito 4 pede "um caso em que a comparação [por número absoluto]
 * conduz a conclusão errada", e o caso está armado aqui:
 *
 *   Falcão  16 membros, 13 inscritos → 3 de fora, 81,25%
 *   Águia   10 membros,  8 inscritos → 2 de fora, 80,00%
 *   Tucano  10 membros,  8 inscritos → 2 de fora, 80,00%
 *   Arara    9 membros,  7 inscritos → 2 de fora, 77,78%
 *   Jaguar   8 membros,  6 inscritos → 2 de fora, 75,00%
 *   Onça     8 membros,  6 inscritos → 2 de fora, 75,00%
 *
 * O Falcão tem **o maior número de ausentes** — três, contra dois de todas as
 * outras — e ao mesmo tempo **a melhor taxa de adesão** de todas. Quem ordena
 * pela coluna de ausentes conclui que o Falcão é a unidade que mais deixa
 * gente para trás; quem divide conclui o contrário, e é o contrário que é
 * verdade. Nenhuma das duas contas está errada: elas respondem a perguntas
 * diferentes, e só uma delas responde à pergunta que foi feita.
 *
 * Os dois extremos são únicos de propósito. Empate no topo — duas unidades com
 * três ausentes, ou duas com 81,25% — deixaria a lição com duas respostas
 * certas, e a tarefa mediria ter escolhido a nossa.
 */
export const ELENCO: UnidadeDoClube[] = [
  { nome: 'Falcão', conselheiro: 'Tio Samuel', membros: 16 },
  { nome: 'Águia', conselheiro: 'Tia Rute', membros: 10 },
  { nome: 'Tucano', conselheiro: 'Tia Joana', membros: 10 },
  { nome: 'Arara', conselheiro: 'Tio Márcio', membros: 9 },
  { nome: 'Jaguar', conselheiro: 'Tia Priscila', membros: 8 },
  { nome: 'Onça', conselheiro: 'Tio Edson', membros: 8 },
];

export const MEMBROS_DO_CLUBE = ELENCO.reduce((s, u) => s + u.membros, 0);

/* ── A grafia da unidade ──────────────────────────────────────────────────── */

/**
 * A unidade da lista que a grafia escrita designa, ou `null`.
 *
 * "Falcão", "falcao", "FALCÃO" e "Falcao " são a mesma unidade, e é a CC-ES008
 * inteira que ensina isso. Aqui ela serve para **derivar**: os quinze herdados
 * trazem a grafia de lá, e o que a base fechada guarda é a da lista — que é o
 * conserto do módulo 5, e não uma segunda escrita do nome da unidade.
 */
export function unidadeCanonica(escrita: string): string | null {
  const chave = paraComparar(escrita);
  return UNIDADES_DO_CLUBE.find(u => paraComparar(u) === chave) ?? null;
}

/* ── Os campos do formulário fechado ──────────────────────────────────────── */

/**
 * O formulário como ele ficou depois da CC-ES008.
 *
 * Os cinco primeiros são os de lá, com os consertos que as lições de lá
 * pedem: a unidade saiu de texto livre para lista, as diárias viraram número,
 * o e-mail virou obrigatório e ganhou validação de formato. Chegar diferente
 * disto diria que o trabalho da vereda anterior não pegou.
 */
export function camposDaBase(): Campo[] {
  return [
    { id: CAMPO_NOME, rotulo: 'Nome do desbravador', tipo: 'texto-curto', obrigatorio: true, pessoal: true },
    {
      id: CAMPO_UNIDADE, rotulo: 'Unidade', tipo: 'lista', obrigatorio: true, pessoal: false,
      opcoes: [...UNIDADES_DO_CLUBE],
    },
    {
      id: CAMPO_EMAIL, rotulo: 'E-mail do responsável', tipo: 'texto-curto', obrigatorio: true, pessoal: true,
      validacao: { tipo: 'email' },
    },
    { id: CAMPO_DIARIAS, rotulo: 'Quantas diárias', tipo: 'numero', obrigatorio: true, pessoal: false },
    { id: CAMPO_IDADE, rotulo: 'Idade', tipo: 'numero', obrigatorio: true, pessoal: false },
    {
      id: CAMPO_ALTURA, rotulo: 'Altura em metros', tipo: 'numero', obrigatorio: true, pessoal: false,
    },
    {
      id: CAMPO_CAMISETA, rotulo: 'Tamanho da camiseta', tipo: 'escolha-unica', obrigatorio: true, pessoal: false,
      opcoes: [...TAMANHOS_DE_CAMISETA],
    },
    {
      id: CAMPO_ALIMENTACAO, rotulo: 'Alimentação', tipo: 'escolha-unica', obrigatorio: true, pessoal: false,
      opcoes: [...ALIMENTACOES],
    },
    {
      id: CAMPO_ACAMPAMENTOS, rotulo: 'Quantos acampamentos do clube já fez',
      tipo: 'numero', obrigatorio: true, pessoal: false,
    },
    { id: CAMPO_OBSERVACAO, rotulo: 'Alguma observação', tipo: 'paragrafo', obrigatorio: false, pessoal: true },
  ];
}

/* ── Os dezesseis que vieram da CC-ES008 ──────────────────────────────────── */

interface Herdado {
  /** O id da resposta em `RESPOSTAS_COLETADAS`, de onde o resto é lido. */
  de: string;
  idade: number;
  /** Em metros, com vírgula na hora de gravar — é texto que o formulário guarda. */
  altura: string;
  camiseta: string;
  alimentacao: string;
  acampamentos: number;
  /* Os três consertos da CC-ES008, e só onde eles se aplicam. */
  unidade?: string;
  email?: string;
  diarias?: string;
}

const HERDADOS: Herdado[] = [
  { de: 'r01', idade: 13, altura: '1,58', camiseta: 'M', alimentacao: 'Vegetariana', acampamentos: 4 },
  { de: 'r02', idade: 12, altura: '1,51', camiseta: 'M', alimentacao: 'Comum', acampamentos: 2 },
  { de: 'r03', idade: 14, altura: '1,62', camiseta: 'G', alimentacao: 'Comum', acampamentos: 5 },
  { de: 'r04', idade: 11, altura: '1,44', camiseta: 'P', alimentacao: 'Comum', acampamentos: 1 },
  /* Chegou sem unidade e sem e-mail: não havia grafia para normalizar, e o
     clube foi perguntar. É o que "obrigatório não preenche o que já está lá"
     custa — uma ligação por resposta. */
  {
    de: 'r05', idade: 13, altura: '1,56', camiseta: 'M', alimentacao: 'Sem lactose', acampamentos: 3,
    unidade: 'Tucano', email: 'pires.eduarda@exemplo.com',
  },
  /* `1.5` era número escrito com ponto, que em planilha pt-BR é texto. Diária
     é noite dormida, e não existe meia: a inscrição é de duas. */
  {
    de: 'r06', idade: 15, altura: '1,73', camiseta: 'GG', alimentacao: 'Comum', acampamentos: 12,
    diarias: '2',
  },
  { de: 'r07', idade: 12, altura: '1,50', camiseta: 'M', alimentacao: 'Comum', acampamentos: 2 },
  { de: 'r08', idade: 14, altura: '1,66', camiseta: 'G', alimentacao: 'Sem glúten', acampamentos: 4 },
  { de: 'r09', idade: 10, altura: '1,38', camiseta: 'PP', alimentacao: 'Comum', acampamentos: 0 },
  { de: 'r10', idade: 13, altura: '1,57', camiseta: 'M', alimentacao: 'Comum', acampamentos: 3 },
  {
    de: 'r11', idade: 11, altura: '1,42', camiseta: 'P', alimentacao: 'Comum', acampamentos: 1,
    email: 'campos.larissa@exemplo.com',
  },
  {
    de: 'r12', idade: 15, altura: '1,76', camiseta: 'GG', alimentacao: 'Comum', acampamentos: 14,
    diarias: '3',
  },
  { de: 'r13', idade: 12, altura: '1,48', camiseta: 'P', alimentacao: 'Vegetariana', acampamentos: 2 },
  { de: 'r14', idade: 14, altura: '1,68', camiseta: 'G', alimentacao: 'Comum', acampamentos: 5 },
  { de: 'r15', idade: 10, altura: '1,35', camiseta: 'PP', alimentacao: 'Comum', acampamentos: 0 },
  { de: 'r18', idade: 13, altura: '1,54', camiseta: 'M', alimentacao: 'Comum', acampamentos: 3 },
];

/* ── As trinta e duas que chegaram depois ─────────────────────────────────── */

/**
 * O resto da coleta, já com o formulário arrumado.
 *
 * A ordem das colunas é a dos campos, e a primeira linha as nomeia — é o
 * desenho do CSV que a CC-ES008 exporta, que é como um formulário entrega o
 * que coletou.
 *
 * ── Os instantes não são enfeite ─────────────────────────────────────────
 * O requisito 6 pede uma pergunta de **evolução**, e a única coisa que evolui
 * numa base de inscrição é a própria chegada das inscrições. Por semana:
 * dezenove, seis, sete e dezesseis — o repique do começo, o vazio do meio, e a
 * correria dos últimos dias. É a forma que toda inscrição de clube tem, e uma
 * chegada distribuída por igual faria a linha responder "nada aconteceu",
 * que é o gráfico que não vale a pena desenhar.
 */
const NOVAS: string[][] = [
  ['Enviado em', 'Nome', 'Unidade', 'E-mail', 'Diárias', 'Idade', 'Altura', 'Camiseta', 'Alimentação', 'Acampamentos', 'Observação'],

  ['2026-06-13T10:15', 'Sofia Nunes', 'Falcão', 'nunes.sofia@exemplo.com', '3', '12', '1,49', 'M', 'Comum', '2', ''],
  ['2026-06-14T11:07', 'Laura Pontes', 'Tucano', 'pontes.laura@exemplo.com', '3', '12', '1,52', 'M', 'Comum', '2', ''],
  ['2026-06-14T19:33', 'Enzo Vilela', 'Águia', 'vilela.enzo@exemplo.com', '3', '14', '1,67', 'G', 'Comum', '3', ''],

  ['2026-06-16T19:22', 'Thiago Ramalho', 'Falcão', 'ramalho.thiago@exemplo.com', '3', '14', '1,64', 'G', 'Comum', '4', ''],
  ['2026-06-18T08:40', 'Vitória Sampaio', 'Falcão', 'sampaio.vitoria@exemplo.com', '3', '11', '1,41', 'P', 'Comum', '1', ''],
  ['2026-06-19T09:12', 'Júlia Monteiro', 'Arara', 'monteiro.julia@exemplo.com', '3', '13', '1,57', 'M', 'Comum', '2', ''],
  ['2026-06-20T15:33', 'Murilo Sá', 'Tucano', 'sa.murilo@exemplo.com', '2', '13', '1,60', 'M', 'Comum', '3', ''],
  ['2026-06-21T20:30', 'Bernardo Quintela', 'Jaguar', 'quintela.bernardo@exemplo.com', '3', '15', '1,77', 'GG', 'Comum', '2', ''],
  ['2026-06-21T21:14', 'Nicolas Paiva', 'Onça', 'paiva.nicolas@exemplo.com', '3', '14', '1,70', 'G', 'Comum', '4', ''],

  ['2026-06-23T16:41', 'Alice Rangel', 'Águia', 'rangel.alice@exemplo.com', '2', '10', '1,36', 'PP', 'Comum', '0', ''],
  ['2026-06-24T21:05', 'Arthur Bezerra', 'Falcão', 'bezerra.arthur@exemplo.com', '2', '10', '1,33', 'PP', 'Comum', '0', 'Primeiro acampamento dele'],
  ['2026-06-25T14:55', 'Caio Bastos', 'Arara', 'bastos.caio@exemplo.com', '3', '12', '1,50', 'M', 'Comum', '1', ''],
  ['2026-06-26T18:20', 'Antônia Freire', 'Tucano', 'freire.antonia@exemplo.com', '3', '10', '1,31', 'PP', 'Vegetariana', '0', ''],
  ['2026-06-27T10:48', 'Melissa Duarte', 'Jaguar', 'duarte.melissa@exemplo.com', '3', '12', '1,46', 'M', 'Comum', '2', ''],
  ['2026-06-28T17:52', 'Rebeca Fialho', 'Onça', 'fialho.rebeca@exemplo.com', '3', '10', '1,28', 'PP', 'Comum', '0', ''],
  ['2026-06-28T19:36', 'Marina Sobral', 'Tucano', 'sobral.marina@exemplo.com', '3', '15', '1,68', 'G', 'Comum', '18', 'Vai ajudar na secretaria'],

  ['2026-06-29T19:03', 'Pedro Henrique Galvão', 'Águia', 'galvao.ph@exemplo.com', '3', '13', '1,59', 'M', 'Comum', '2', ''],
  ['2026-06-30T17:12', 'Manuela Fontes', 'Falcão', 'fontes.manuela@exemplo.com', '3', '13', '1,55', 'M', 'Vegetariana', '3', ''],
  ['2026-07-01T16:07', 'Yasmin Loureiro', 'Arara', 'loureiro.yasmin@exemplo.com', '3', '14', '1,63', 'G', 'Sem lactose', '3', ''],
  ['2026-07-01T19:15', 'Théo Vasques', 'Jaguar', 'vasques.theo@exemplo.com', '3', '12', '1,61', 'M', 'Comum', '2', ''],
  ['2026-07-01T22:48', 'Lucas Peixoto', 'Falcão', 'peixoto.lucas@exemplo.com', '3', '15', '1,79', 'GG', 'Comum', '5', ''],
  ['2026-07-02T09:30', 'Helena Braga', 'Falcão', 'braga.helena@exemplo.com', '3', '12', '1,47', 'M', 'Sem lactose', '2', ''],
  ['2026-07-02T13:26', 'Beatriz Carvalho', 'Águia', 'carvalho.beatriz@exemplo.com', '3', '15', '1,71', 'GG', 'Sem glúten', '4', ''],
  /* O 1,50 com os algarismos trocados. Não é ninguém, e não grita: move a
     média da turma em um centímetro. É o valor atípico que sai. */
  ['2026-07-02T20:14', 'Davi Queiroz', 'Falcão', 'queiroz.davi@exemplo.com', '3', '11', '1,05', 'P', 'Comum', '1', ''],
  ['2026-07-02T21:41', 'Leonardo Cruz', 'Onça', 'cruz.leonardo@exemplo.com', '3', '13', '1,58', 'M', 'Comum', '3', ''],
  ['2026-07-03T18:55', 'Cecília Maia', 'Falcão', 'maia.cecilia@exemplo.com', '1', '12', '1,53', 'M', 'Comum', '2', 'Só a noite de sábado'],
  ['2026-07-03T19:48', 'Igor Rezende', 'Tucano', 'rezende.igor@exemplo.com', '1', '11', '1,40', 'P', 'Comum', '1', ''],
  ['2026-07-03T20:22', 'Renato Villela', 'Arara', 'villela.renato@exemplo.com', '2', '10', '1,34', 'PP', 'Comum', '0', ''],
  ['2026-07-03T21:10', 'Gustavo Assis', 'Águia', 'assis.gustavo@exemplo.com', '3', '11', '1,43', 'P', 'Comum', '1', ''],
  ['2026-07-03T21:37', 'Lívia Amorim', 'Jaguar', 'amorim.livia@exemplo.com', '2', '11', '1,39', 'P', 'Vegetariana', '1', ''],
  ['2026-07-03T22:05', 'Clara Sarmento', 'Arara', 'sarmento.clara@exemplo.com', '3', '11', '1,45', 'P', 'Comum', '1', ''],
  ['2026-07-03T23:02', 'Sophia Bandeira', 'Onça', 'bandeira.sophia@exemplo.com', '3', '12', '1,54', 'M', 'Comum', '1', ''],
];

/* ── A montagem ───────────────────────────────────────────────────────────── */

function respostaHerdada(h: Herdado, veio: Resposta): Resposta {
  const escrita = valorDa(veio, CAMPO_UNIDADE);
  const unidade = h.unidade ?? unidadeCanonica(escrita);
  if (!unidade) {
    /* Grafia que não designa unidade nenhuma e sem conserto declarado: a base
       sairia com um grupo a mais e ninguém veria, porque um nome de unidade
       desconhecido é plausível. Melhor não montar. */
    throw new Error(`A resposta ${h.de} tem a unidade "${escrita}", que não é uma do clube.`);
  }
  return {
    id: h.de,
    em: veio.em,
    valores: {
      [CAMPO_NOME]: valorDa(veio, CAMPO_NOME),
      [CAMPO_UNIDADE]: unidade,
      [CAMPO_EMAIL]: h.email ?? valorDa(veio, CAMPO_EMAIL),
      [CAMPO_DIARIAS]: h.diarias ?? valorDa(veio, CAMPO_DIARIAS),
      [CAMPO_IDADE]: String(h.idade),
      [CAMPO_ALTURA]: h.altura,
      [CAMPO_CAMISETA]: h.camiseta,
      [CAMPO_ALIMENTACAO]: h.alimentacao,
      [CAMPO_ACAMPAMENTOS]: String(h.acampamentos),
      [CAMPO_OBSERVACAO]: valorDa(veio, CAMPO_OBSERVACAO),
    },
  };
}

function respostasDaBase(): Resposta[] {
  const daCcEs008 = new Map(respostasReais(formularioDeInscricao()).map(r => [r.id, r]));

  const herdadas = HERDADOS.map(h => {
    const veio = daCcEs008.get(h.de);
    if (!veio) {
      /* A CC-ES008 deixou de ter esta resposta, ou passou a descartá-la. Sem
         a guarda, a base encolheria em silêncio e toda conta desta vereda
         continuaria devolvendo um número plausível. */
      throw new Error(`A resposta ${h.de} não existe mais na CC-ES008.`);
    }
    return respostaHerdada(h, veio);
  });

  const [cabecalho, ...linhas] = NOVAS;
  const novas = linhas.map((linha, i): Resposta => {
    if (linha.length !== cabecalho.length) {
      throw new Error(`A linha ${i + 1} de NOVAS tem ${linha.length} colunas, e o cabeçalho tem ${cabecalho.length}.`);
    }
    const [em, nome, unidade, email, diarias, idade, altura, camiseta, alimentacao, acampamentos, observacao] = linha;
    return {
      id: `n${String(i + 1).padStart(2, '0')}`,
      em,
      valores: {
        [CAMPO_NOME]: nome,
        [CAMPO_UNIDADE]: unidade,
        [CAMPO_EMAIL]: email,
        [CAMPO_DIARIAS]: diarias,
        [CAMPO_IDADE]: idade,
        [CAMPO_ALTURA]: altura,
        [CAMPO_CAMISETA]: camiseta,
        [CAMPO_ALIMENTACAO]: alimentacao,
        [CAMPO_ACAMPAMENTOS]: acampamentos,
        [CAMPO_OBSERVACAO]: observacao,
      },
    };
  });

  /* Em ordem de chegada, que é a ordem em que um formulário entrega o que
     coletou — e a ordem de que a pergunta de evolução depende. */
  return [...herdadas, ...novas].sort((a, b) => a.em.localeCompare(b.em));
}

/**
 * O formulário da CC-ES008 como ele ficou no dia em que as inscrições
 * fecharam.
 */
export function baseDoAcampamento(): Formulario {
  return {
    titulo: 'Inscrição — Acampamento de inverno',
    descricao: 'As inscrições fecharam no dia 3 de julho. A análise usa o que chegou até lá.',
    aceitandoRespostas: false,
    campos: camposDaBase(),
    respostas: respostasDaBase(),
  };
}

/* ── O que cada coluna é ──────────────────────────────────────────────────── */

export type Natureza = 'qualitativa' | 'quantitativa';
export type Escala = 'nominal' | 'ordinal' | 'discreta' | 'continua';

export interface Classificacao {
  natureza: Natureza;
  escala: Escala;
  /**
   * Cada resposta preenchida é diferente da outra: não há grupo aqui.
   *
   * Nome, e-mail e observação são qualitativos como qualquer outro, e os
   * livros param aí. Só que uma tabela de frequências do nome tem quarenta e
   * oito linhas de "1", e um gráfico dela tem quarenta e oito fatias iguais —
   * um desenho que não responde a nada e que não dá erro nenhum.
   *
   * O que une as três **não** é serem identificação: a observação não
   * identifica ninguém, e nove das quarenta e oito a preencheram. É cada valor
   * aparecer uma vez só. Uma categoria tem gente dentro; estas têm uma pessoa
   * dentro de cada valor, e a décima observação será a décima frase diferente.
   * Contar "quase um valor por pessoa" sobre a coluna inteira diria que a
   * observação agrupa, porque trinta e nove estão em branco — a conta é sobre
   * quem respondeu.
   */
  naoAgrupa?: boolean;
}

/**
 * A classificação de cada coluna — o requisito 5.1.
 *
 * Ela mora aqui e não na tela: quem desenha o exercício não mostra a resposta,
 * e quem confere precisa dela. É o arranjo de `exploradorValidator`, e vale o
 * que está escrito lá — um validador que não soubesse a resposta não seria um
 * validador.
 */
export const CLASSIFICACAO: Record<string, Classificacao> = {
  [CAMPO_NOME]: { natureza: 'qualitativa', escala: 'nominal', naoAgrupa: true },
  [CAMPO_UNIDADE]: { natureza: 'qualitativa', escala: 'nominal' },
  [CAMPO_EMAIL]: { natureza: 'qualitativa', escala: 'nominal', naoAgrupa: true },
  [CAMPO_DIARIAS]: { natureza: 'quantitativa', escala: 'discreta' },
  [CAMPO_IDADE]: { natureza: 'quantitativa', escala: 'discreta' },
  [CAMPO_ALTURA]: { natureza: 'quantitativa', escala: 'continua' },
  [CAMPO_CAMISETA]: { natureza: 'qualitativa', escala: 'ordinal' },
  [CAMPO_ALIMENTACAO]: { natureza: 'qualitativa', escala: 'nominal' },
  [CAMPO_ACAMPAMENTOS]: { natureza: 'quantitativa', escala: 'discreta' },
  [CAMPO_OBSERVACAO]: { natureza: 'qualitativa', escala: 'nominal', naoAgrupa: true },
};

/* ── Os valores atípicos, e o que se faz com cada um ──────────────────────── */

export interface ValorAtipico {
  campo: string;
  /** A resposta em que ele está. */
  resposta: string;
  /** Fica na análise, ou sai dela. */
  mantem: boolean;
}

/**
 * Os quatro valores que a cerca acusa, e a decisão de cada um — requisito 5.6.
 *
 * ── Eles são de duas naturezas, e é isso que faz a lição ─────────────────
 * Três são **gente**: o Felipe com doze acampamentos, o Matheus com catorze e
 * a Marina com dezoito. Estão longe do resto porque estão mesmo — entraram no
 * clube cedo e não faltaram. Apagá-los para a média "ficar melhor" é apagar a
 * parte mais interessante do clube, e é a coisa mais comum que se faz com um
 * valor atípico. A decisão é mantê-los, e relatar a **mediana** ao lado da
 * média, que é o que o requisito 3 pede pelo mesmo motivo.
 *
 * Um é **digitação**: a altura de 1,05 m é o 1,50 com os algarismos trocados.
 * Não é ninguém de 1,05 m. Ela sai da análise da altura — e sair não é apagar
 * a linha: o Davi continua inscrito, com camiseta P e três diárias. Excluir a
 * pessoa inteira por causa de uma célula é o conserto que perde nove valores
 * bons para arrumar um.
 *
 * Uma base com atípico de um tipo só faria "decidir com justificativa" virar
 * "apagar o que está longe", que é a regra errada e a mais fácil de aprender.
 */
export const ATIPICOS: ValorAtipico[] = [
  { campo: CAMPO_ACAMPAMENTOS, resposta: 'r06', mantem: true },
  { campo: CAMPO_ACAMPAMENTOS, resposta: 'r12', mantem: true },
  { campo: CAMPO_ACAMPAMENTOS, resposta: 'n16', mantem: true },
  { campo: CAMPO_ALTURA, resposta: 'n24', mantem: false },
];

/* ── Adesão: o número absoluto e a taxa ───────────────────────────────────── */

export interface AdesaoDaUnidade {
  unidade: string;
  membros: number;
  inscritos: number;
  /** Quantos da unidade ficaram de fora — o número absoluto. */
  fora: number;
  /** Quantos dos membros se inscreveram, em partes de um. */
  taxa: number | null;
}

/**
 * Quem se inscreveu, por unidade, dos dois jeitos — requisito 4.
 *
 * As duas colunas saem da mesma conta e respondem a perguntas diferentes.
 * `fora` responde "quantas vagas o acampamento perdeu nesta unidade", que é o
 * que interessa a quem compra comida. `taxa` responde "que parte da unidade
 * veio", que é o que interessa a quem quer saber qual conselheiro conseguiu
 * mobilizar a dele. Trocar uma pela outra é o erro do requisito, e ele não dá
 * erro nenhum: as duas colunas são verdadeiras.
 */
export function adesaoPorUnidade(base = baseDoAcampamento()): AdesaoDaUnidade[] {
  const contagem = new Map<string, number>();
  for (const r of respostasReais(base)) {
    const u = valorDa(r, CAMPO_UNIDADE);
    contagem.set(u, (contagem.get(u) ?? 0) + 1);
  }
  return ELENCO.map(u => {
    const inscritos = contagem.get(u.nome) ?? 0;
    return {
      unidade: u.nome,
      membros: u.membros,
      inscritos,
      fora: u.membros - inscritos,
      taxa: u.membros === 0 ? null : inscritos / u.membros,
    };
  });
}

/* ── A chegada das inscrições ─────────────────────────────────────────────── */

export interface SemanaDaColeta {
  /** Como a semana aparece no eixo do gráfico. */
  rotulo: string;
  /** O primeiro dia dela, em AAAA-MM-DD. */
  inicio: string;
  inscricoes: number;
}

/*
  O dia sai da string, e nunca de um `Date`.

  Os instantes gravados são hora de parede de Brasília, sem fuso escrito —
  `new Date('2026-06-08T19:12')` os lê no fuso de quem está olhando, e o
  `toISOString()` seguinte devolveria 8 ou 9 de junho conforme a máquina. É o
  defeito que `ofensiva.ts` documenta, e a resposta é a mesma: fatiar o texto
  para ler o dia, e fazer conta de calendário com `Date.UTC`, que não tem fuso
  nenhum para errar.
*/
const diaDe = (instante: string) => instante.slice(0, 10);

const emDias = (dia: string) => {
  const [a, m, d] = dia.split('-').map(Number);
  return Date.UTC(a, m - 1, d) / 86400000;
};

const diaDoNumero = (n: number) => new Date(n * 86400000).toISOString().slice(0, 10);

const curto = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

/**
 * Quantas inscrições chegaram em cada semana da coleta — requisito 6.
 *
 * É a única pergunta de **evolução** que uma base de inscrição responde: o que
 * muda ao longo do tempo não é quem se inscreveu, é quando. As semanas são
 * blocos de sete dias contados do primeiro envio, e não semanas de calendário:
 * o que se quer ver é a distância até o prazo, e um bloco que começasse no
 * domingo partiria a última semana em duas só porque o prazo caiu numa sexta.
 *
 * Semana sem nenhuma inscrição sai com zero, e não sai de fora: uma linha que
 * pula a semana vazia desenha uma reta onde houve um buraco, e o buraco é
 * metade do que o gráfico tem a dizer.
 */
export function porSemana(base = baseDoAcampamento()): SemanaDaColeta[] {
  const dias = respostasReais(base).map(r => emDias(diaDe(r.em)));
  if (dias.length === 0) return [];

  const primeiro = Math.min(...dias);
  const ultimo = Math.max(...dias);
  const quantas = Math.floor((ultimo - primeiro) / 7) + 1;

  return Array.from({ length: quantas }, (_, i) => {
    const inicio = primeiro + 7 * i;
    const fim = inicio + 6;
    return {
      rotulo: `${curto(diaDoNumero(inicio))} a ${curto(diaDoNumero(fim))}`,
      inicio: diaDoNumero(inicio),
      inscricoes: dias.filter(d => d >= inicio && d <= fim).length,
    };
  });
}
