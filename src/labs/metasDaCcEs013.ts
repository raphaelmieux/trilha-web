/**
 * O que cada lição da CC-ES013 cobra, e de que estado do projeto ela parte.
 *
 * Mora fora do componente e fora da trava, como o `LICOES_DA_CC_ES012` e os
 * registros das veredas de antes dele, e pelo motivo escrito lá: quem lê é a
 * tela, que monta a lição, **e** a trava, que confere que nenhuma meta abre
 * verde. Escrito só na trava, a tela repetiria a escolha e as duas divergiriam
 * na primeira lição nova.
 *
 * ── Cada lição parte de onde a anterior acabou ───────────────────────────
 * E onde a mudança é **mecânica** — copiar a aba, padronizar a grafia,
 * escrever as contas —, o estado se deriva chamando os mesmos comandos que a
 * lição oferece: `moverOuCopiar`, `substituir`, `removerDuplicatas`. Derivar
 * não tem como divergir do que a lição faz, e é a trava mais barata de que o
 * caminho existe: se a derivação não fecha as metas do módulo, nenhum clique
 * fecharia. Onde a mudança **é o texto** — o diário, a conclusão —, ele está
 * escrito, porque não há de onde derivar prosa.
 *
 * ── Toda conta confere a fórmula, o lugar e o resultado ──────────────────
 * É a decisão da CC-ES003 e da CC-ES009, com uma conta a mais que só esta
 * vereda precisa: a fórmula tem de ler a **tratada**, e não a bruta. As duas
 * abas têm o mesmo cabeçalho e quase os mesmos números, e a mediana da
 * presença sai igual nas duas — conferindo só o resultado, a conta sobre a
 * base suja passaria, e é justamente a conta que a limpeza existe para não
 * deixar alguém fazer.
 */

import {
  type Caderno, type Faixa, type Planilha, type TipoDeGrafico,
  moverOuCopiar, planilhaDe, planilhaPorNome, pontosDaDispersao, pontosDoGrafico,
  removerDuplicatas, renomearAba, substituir, valorCalculado, escrever, limpar,
} from './planilha';
import { referenciasDe } from './formulas';
import { escritoEm, usaFuncao } from './cadernoDoClube';
import { correlacaoDe, desvioPadrao, media, mediana } from './analiseDeDados';
import {
  type Coluna, type Modo,
  COLUNAS, INDICE, MEMBROS, MODOS, NOME_DA_BRUTA, NOME_DA_TRATADA, UNIDADES_DO_CLUBE,
  abaBruta, linhaCerta, linhasBrutas,
} from './chamadaDoClube';
import {
  type ArquivoDaNuvem, type Nuvem, papelDe,
} from './arquivoCompartilhado';
import {
  type Conclusao, type DecisaoDeLimpeza, type ProjetoDeDados, type Roteiro,
  FICHA_EM_BRANCO, PROPOSTA_EM_BRANCO, PUBLICOS_DO_CLUBE, MINUTOS_DA_APRESENTACAO,
  abaTratada, ausenciasDePe, brutaIntacta, cabecalhoIntacto, cabeEmDuasPaginas, candidata, citaNumero,
  colunaCerta, colunaNumerica, dataEscrita, defeitosConsertados, documentado,
  ehPergunta, linhasDa, minutosDoRoteiro, modosPadronizados, nomeDizOQueE,
  palavrasDe, semRepetida, unidadesPadronizadas,
} from './projetoDeDados';

/* ── A lição, e o que viaja com ela ───────────────────────────────────────── */

export type LicaoDaCcEs013 =
  | 'proposta' | 'base' | 'grafia' | 'numeros' | 'descritivas' | 'grupos'
  | 'relacao' | 'painel' | 'conclusao' | 'apresentacao' | 'entrega';

/**
 * Em que programa a lição **começa**.
 *
 * Três, e não um por lição: a planilha, onde a base e as contas moram; a
 * nuvem, onde a entrega acontece; e a tela da plataforma, para o que não é de
 * programa nenhum — a proposta ao examinador, a ficha da base, o diário de
 * limpeza, a conclusão e o roteiro da apresentação.
 */
export type ProgramaDaLicao = 'plataforma' | 'excel' | 'nuvem';

export interface ContextoDoProjetoDeDados {
  p: ProjetoDeDados;
  /**
   * Abriu a base antes de a proposta ser aprovada.
   *
   * É o `comecouAntes` da CC-ES012, pelo motivo escrito lá: sem um caminho
   * errado a um clique, "a execução não pode ser iniciada antes da aprovação"
   * seria uma frase do enunciado sem nada por trás. Aqui ele pesa mais do que
   * lá, e é a razão do requisito existir: quem olha o dado antes de escrever a
   * pergunta escreve a pergunta que o dado já respondeu.
   */
  comecouAntes: boolean;
  descobertas: string[];
}

export const contextoDe = (p: ProjetoDeDados): ContextoDoProjetoDeDados =>
  ({ p, comecouAntes: false, descobertas: [] });

/* ── As chaves do caderno ─────────────────────────────────────────────────── */

export const CHAVE_MEDIDA_TIPICA = 'medida-tipica-da-distancia';
export const CHAVE_POR_QUE_MEDIDA = 'por-que-essa-medida';
export const CHAVE_COMPARACAO = 'comparacao-dos-grupos';
export const CHAVE_GRUPO_PEQUENO = 'grupo-pequeno';
export const CHAVE_RELACAO_SUGERE = 'o-que-a-relacao-sugere';
export const CHAVE_RELACAO_NAO_PROVA = 'o-que-a-relacao-nao-prova';

/* ── As abas de conta ─────────────────────────────────────────────────────── */

export const ABA_DE_CALCULOS = 'Cálculos';
export const ABA_DE_GRUPOS = 'Grupos';
export const ABA_DE_UNIDADES = 'Unidades';
export const ABA_DE_DISTANCIAS = 'Distâncias';

/** A última linha de dado da tratada, como a planilha a escreve: 61 registros abaixo do cabeçalho. */
export const ULTIMA_LINHA = MEMBROS.length + 1;

const faixaDa = (coluna: Coluna, fixa = false) => {
  const letra = String.fromCharCode(65 + INDICE[coluna]);
  return fixa
    ? `${NOME_DA_TRATADA}!$${letra}$2:$${letra}$${ULTIMA_LINHA}`
    : `${NOME_DA_TRATADA}!${letra}2:${letra}${ULTIMA_LINHA}`;
};

export interface Medida {
  rotulo: string;
  funcao: string;
  coluna: Coluna;
}

/**
 * As seis medidas do requisito 5.1, e em que linha da aba cada uma mora.
 *
 * Média, mediana e desvio das duas variáveis da pergunta — a presença, que é o
 * que se quer explicar, e a distância, que é a suspeita. A idade fica de fora
 * de propósito: o requisito diz "variáveis principais", e medir tudo o que a
 * base tem é o que transforma um relatório numa tabela que ninguém lê.
 *
 * O desvio é `DESVPADP`, com P, pela razão escrita na CC-ES009: a base é o
 * clube inteiro, e não uma amostra dele.
 */
export const MEDIDAS: Medida[] = [
  { rotulo: 'Presenças — média', funcao: 'MÉDIA', coluna: 'presencas' },
  { rotulo: 'Presenças — mediana', funcao: 'MED', coluna: 'presencas' },
  { rotulo: 'Presenças — desvio padrão', funcao: 'DESVPADP', coluna: 'presencas' },
  { rotulo: 'Distância — média', funcao: 'MÉDIA', coluna: 'distancia' },
  { rotulo: 'Distância — mediana', funcao: 'MED', coluna: 'distancia' },
  { rotulo: 'Distância — desvio padrão', funcao: 'DESVPADP', coluna: 'distancia' },
];

export const linhaDaMedida = (i: number) => i + 1;

export const ROTULO_DA_CORRELACAO = 'Correlação entre distância e presenças';
export const LINHA_DA_CORRELACAO = MEDIDAS.length + 2;

/** A coluna como a base certa a tem, escrita como célula — que é o que as funções leem. */
const colunaCertaEscrita = (coluna: Coluna) => MEMBROS.map(m => linhaCerta(m)[INDICE[coluna]]);

const FUNCAO_NO_MOTOR: Record<string, (v: string[]) => number | null> = {
  'MÉDIA': media,
  MED: mediana,
  DESVPADP: desvioPadrao,
};

/** O número que a medida devolve sobre a base certa, pelo mesmo motor da célula. */
export const esperadoDaMedida = (m: Medida): number =>
  FUNCAO_NO_MOTOR[m.funcao](colunaCertaEscrita(m.coluna))!;

export const CORRELACAO_ESPERADA = (): number =>
  correlacaoDe(colunaCertaEscrita('distancia'), colunaCertaEscrita('presencas'))!;

/* ── A conferência de uma conta ───────────────────────────────────────────── */

/**
 * A célula chama estas funções, lê a tratada **e não a bruta**, e devolve
 * este número.
 *
 * As três contas não se substituem. Só o número deixa passar `=14,85`
 * digitado com um igual na frente, e a mediana feita sobre a bruta, que sai
 * igual; só a função deixa passar a média sobre o intervalo que esqueceu as
 * últimas linhas; só a aba deixa passar qualquer número.
 *
 * A comparação é por proximidade, pela razão escrita em `contaConfere` da
 * CC-ES009: dois caminhos até a mesma raiz quadrada devolvem bits diferentes
 * na última casa.
 */
export function contaConfere(
  cad: Caderno, aba: string, linha: number, coluna: number, funcoes: string[], esperado: number,
): boolean {
  const p = planilhaPorNome(cad, aba);
  const tratada = abaTratada(cad);
  if (!p || !tratada) return false;
  const escrito = escritoEm(p, linha, coluna);
  if (!funcoes.every(f => usaFuncao(escrito, f))) return false;
  const refs = referenciasDe(escrito);
  if (!refs.some(r => r.aba === tratada.nome)) return false;
  const v = valorCalculado(p, linha, coluna, cad);
  return v.tipo === 'numero' && Math.abs(v.n - esperado) < 1e-9;
}

/* ── Os grupos (requisito 5.2) ────────────────────────────────────────────── */

export const CABECALHO_DOS_GRUPOS = ['Como chega', 'Quantos', 'Média de presenças', 'Média da distância (km)'];

const doModo = (modo: Modo) => MEMBROS.filter(m => m.modo === modo);

const mediaDe = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

export const esperadoDoGrupo = (modo: Modo) => ({
  quantos: doModo(modo).length,
  presencas: mediaDe(doModo(modo).map(m => m.presencas)),
  distancia: mediaDe(doModo(modo).map(m => m.distancia!)),
});

/* ── O painel (requisito 6) ───────────────────────────────────────────────── */

export const graficosDo = (cad: Caderno) => cad.planilhas.filter(p => p.grafico !== null);

/** Os pontos que o gráfico desenha, com a pasta junto — a tabela de resumo lê outra aba. */
export const pontosDe = (p: Planilha, cad: Caderno) =>
  (p.grafico?.tipo === 'dispersao' ? pontosDaDispersao(p, cad).length : pontosDoGrafico(p, cad).length);

/** Um gráfico que desenha alguma coisa: dois pontos, no mínimo. */
export const desenha = (p: Planilha, cad: Caderno) => pontosDe(p, cad) >= 2;

export const MINIMO_DE_GRAFICOS = 4;

const graficosQueDesenham = (cad: Caderno) => graficosDo(cad).filter(p => desenha(p, cad));

/**
 * O título é uma pergunta.
 *
 * Três palavras e o ponto de interrogação. "Distância e presença" é um
 * assunto; "Quem mora longe falta mais?" é uma pergunta que o gráfico pode
 * responder ou não — e é isso que o requisito 6 chama de declarada.
 */
export const tituloEhPergunta = (t: string) => t.trim().endsWith('?') && palavrasDe(t).length >= 3;

const normalizarTitulo = (t: string) =>
  t.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');

/** O cabeçalho da coluna que o gráfico desenha como valor. */
function cabecalhoDoValor(p: Planilha): string {
  const g = p.grafico!;
  const f = { topo: Math.min(g.faixa.l1, g.faixa.l2), dir: Math.max(g.faixa.c1, g.faixa.c2) };
  return escritoEm(p, 0, f.dir) || escritoEm(p, f.topo, f.dir);
}

/**
 * O tipo do gráfico pode responder a uma pergunta sobre este dado.
 *
 * As três regras são as da CC-ES009, e não critério novo:
 *
 *   - **linha** só serve a evolução, e esta base não tem tempo: ligar o Falcão
 *     ao Tucano com um traço afirma que um virou o outro;
 *   - **pizza** só serve quando as partes somam o todo, e só uma contagem soma
 *     o clube. A pizza das médias de presença por unidade sai com fatias
 *     perfeitamente plausíveis de um todo que não existe;
 *   - **dispersão** só serve a duas medidas, e é por isso que ela mora na
 *     tratada: as abas de resumo têm uma categoria na primeira coluna.
 */
export function tipoResponde(p: Planilha): boolean {
  const g = p.grafico;
  if (!g) return false;
  const tipo: TipoDeGrafico = g.tipo;
  switch (tipo) {
    case 'linha': return false;
    case 'pizza': return /^quantos/i.test(cabecalhoDoValor(p));
    case 'dispersao': {
      const esq = Math.min(g.faixa.c1, g.faixa.c2);
      const dir = Math.max(g.faixa.c1, g.faixa.c2);
      return esq === INDICE.distancia && dir === INDICE.presencas;
    }
    case 'colunas': return true;
    default: {
      const nunca: never = tipo;
      return nunca;
    }
  }
}

export const eixosNomeados = (p: Planilha) =>
  p.grafico?.tipo === 'pizza'
  || (p.grafico !== null && p.grafico.eixoX.trim() !== '' && p.grafico.eixoY.trim() !== '');

/* ── A meta ───────────────────────────────────────────────────────────────── */

export interface MetaDoProjetoDeDados {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDoProjetoDeDados) => boolean;
}

const tratadaDe = (c: ContextoDoProjetoDeDados) => abaTratada(c.p.caderno);
const linhasDaTratada = (c: ContextoDoProjetoDeDados) => {
  const t = tratadaDe(c);
  return t ? linhasDa(t) : [];
};
const bruta = (c: ContextoDoProjetoDeDados) => brutaIntacta(c.p.caderno);
const texto = (c: ContextoDoProjetoDeDados, chave: string) => (c.p.textos[chave] ?? '').trim();

/** Uma frase escrita, e não duas palavras. É o piso da CC-ES010, pelo motivo escrito lá. */
const frase = (t: string) => t.length >= 60;

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

const METAS_DA_PROPOSTA: MetaDoProjetoDeDados[] = [
  {
    id: 'proposta-pergunta',
    titulo: 'A proposta faz uma pergunta',
    detalhe: '"A presença no clube" é um assunto: qualquer gráfico serve e nenhum responde. "Quem mora longe falta mais?" é uma pergunta, e dá para o dado dizer sim ou não.',
    onde: 'Proposta do projeto → A pergunta',
    passos: [
      'Escreva o que você quer saber, terminando com ponto de interrogação.',
      'Confira se dá para responder com um número.',
    ],
    feita: c => ehPergunta(c.p.proposta.pergunta),
  },
  {
    id: 'proposta-quem-decide',
    titulo: 'A proposta diz de onde vem o dado e quem decide o quê',
    detalhe: 'Um projeto de dados existe para alguém fazer alguma coisa com o resultado. Sem nome e sem decisão, a análise vira curiosidade, e a apresentação do fim não tem para quem ser.',
    onde: 'Proposta do projeto',
    passos: [
      'Diga de onde o dado vai sair.',
      'Diga quem vai decidir e que decisão é essa.',
    ],
    feita: c => c.p.proposta.origem.trim().length >= 20
      && c.p.proposta.quemDecide.trim() !== '' && c.p.proposta.decisao.trim().length >= 20,
  },
  {
    id: 'proposta-aprovada-antes',
    titulo: 'A aprovação veio antes de abrir a base',
    detalhe: 'O requisito diz que a execução não começa antes da aprovação. Quem olha o dado antes de escrever a pergunta acaba escrevendo a pergunta que o dado já respondeu.',
    onde: 'Proposta do projeto → Enviar para aprovação',
    passos: [
      'Envie a proposta e espere a resposta.',
      'Só depois de aprovada, abra a base.',
    ],
    feita: c => c.p.proposta.aprovadaEm !== null && !c.comecouAntes,
  },
];

/* ── Módulo 2: a base ─────────────────────────────────────────────────────── */

const METAS_DA_BASE: MetaDoProjetoDeDados[] = [
  {
    id: 'base-que-serve',
    titulo: 'A base escolhida responde à pergunta e tem o tamanho do requisito',
    detalhe: 'Sessenta registros e cinco campos é o mínimo — e uma base grande que não fala de quem falta ao clube continua não servindo. As duas contas valem juntas.',
    onde: 'Ficha da base → Qual base',
    passos: [
      'Para cada arquivo, veja quantos registros e quais campos ele tem.',
      'Escolha o que tem a presença de cada um e o que pode explicá-la.',
    ],
    feita: c => c.p.ficha.base === 'chamada',
  },
  {
    id: 'origem-declarada',
    titulo: 'A origem está declarada',
    detalhe: 'Quem vai conferir a análise precisa conseguir buscar o mesmo arquivo de novo. "Da secretaria" não basta: de que sistema, cruzado com o quê.',
    onde: 'Ficha da base → Origem',
    passos: ['Escreva quem forneceu o arquivo, de que sistema ele saiu e com que outro dado foi cruzado.'],
    feita: c => c.p.ficha.base !== null && c.p.ficha.origem.trim().length >= 40,
  },
  {
    id: 'data-de-obtencao',
    titulo: 'A data é a de obtenção, e não a do período',
    detalhe: 'O dado é de fevereiro a julho; o arquivo chegou em agosto. O requisito pede a segunda, porque é ela que diz de que versão da base a análise fala — a chamada pode ser corrigida depois.',
    onde: 'Ficha da base → Obtida em',
    passos: [
      'Leia as duas datas da descrição do arquivo.',
      'Escreva a do dia em que o arquivo chegou às suas mãos.',
    ],
    feita: c => c.p.ficha.base === 'chamada'
      && dataEscrita(c.p.ficha.obtidaEm) === candidata('chamada').obtidaEm,
  },
];

/* ── Módulo 3: a grafia ───────────────────────────────────────────────────── */

const METAS_DA_GRAFIA: MetaDoProjetoDeDados[] = [
  {
    id: 'copia-com-nome',
    titulo: 'A limpeza acontece numa cópia, com nome que diz o que ela é',
    detalhe: 'O requisito pede a base bruta e a tratada na entrega. Só entrega a bruta quem limpou numa cópia — e a caixa "Criar uma cópia" nasce desmarcada.',
    onde: 'Página Inicial → Formatar → Mover ou Copiar Planilha',
    passos: [
      'Abra Mover ou Copiar e marque "Criar uma cópia".',
      'Renomeie a cópia para Tratada.',
    ],
    feita: c => {
      const t = tratadaDe(c);
      return t !== null && nomeDizOQueE(t) && bruta(c);
    },
  },
  {
    id: 'unidades-padronizadas',
    titulo: 'Cada unidade está escrita de um jeito só',
    detalhe: '"aguia", "AGUIA" e "Águia" viram três grupos em qualquer conta por unidade. Substituir resolve — e, sem cuidado, troca também o nome de quem tem "Aguia" no sobrenome.',
    onde: 'Página Inicial → Localizar e Selecionar → Substituir',
    passos: [
      'Selecione a coluna Unidade antes de substituir.',
      'Marque "Coincidir conteúdo da célula inteira".',
      'Repita para cada grafia diferente.',
    ],
    feita: c => {
      const l = linhasDaTratada(c);
      return unidadesPadronizadas(l) && colunaCerta(l, 'unidade') && bruta(c);
    },
  },
  {
    id: 'transporte-padronizado',
    titulo: 'Cada jeito de chegar está escrito como no questionário',
    detalhe: '"onibus", "Onibus" e "ônibus" são três para a planilha. O acento é outra letra: desmarcar as maiúsculas não junta "onibus" com "ônibus".',
    onde: 'Página Inicial → Localizar e Selecionar → Substituir',
    passos: [
      'Selecione a coluna Como chega.',
      'Substitua cada grafia pela do questionário: A pé, Bicicleta, Carona, Ônibus.',
    ],
    feita: c => {
      const l = linhasDaTratada(c);
      return modosPadronizados(l) && colunaCerta(l, 'modo') && bruta(c);
    },
  },
  {
    id: 'sem-repetida',
    titulo: 'A linha repetida saiu, e a homônima ficou',
    detalhe: 'Remover Duplicatas compara o que está escrito: rodado antes de padronizar, não acha nada. E desmarcar tudo menos o nome apaga uma das duas Ana Clara Ribeiro, que são duas pessoas.',
    onde: 'Dados → Remover Duplicatas',
    passos: [
      'Padronize a grafia primeiro.',
      'Rode Remover Duplicatas com todas as colunas marcadas.',
    ],
    feita: c => semRepetida(linhasDaTratada(c)) && bruta(c),
  },
  {
    id: 'diario-da-grafia',
    titulo: 'As três decisões estão no diário de limpeza',
    detalhe: 'O requisito pede cada decisão por escrito. Quem ler a base tratada no ano que vem precisa saber que "aguia" virou Águia e por que uma linha da Carla sumiu.',
    onde: 'Diário de limpeza',
    passos: [
      'Uma decisão para a grafia da unidade, uma para o transporte e uma para a linha repetida.',
      'Em cada uma, o que você fez e por quê.',
    ],
    feita: c => documentado(c.p.diario, 'grafia', ['unidade'])
      && documentado(c.p.diario, 'grafia', ['modo'])
      && documentado(c.p.diario, 'duplicata', ['linha', 'nome']),
  },
];

/* ── Módulo 4: os números e as ausências ──────────────────────────────────── */

/**
 * O que a lição de número não pode estragar: o cabeçalho, as colunas que não
 * eram dela, e as sessenta e uma pessoas, uma vez cada.
 *
 * O cabeçalho é o caso que a tela produz sozinha: "Distância (km)" também tem
 * "km", e quem seleciona a coluna pelo título para tirar o "km" dos números
 * apaga o do título junto.
 *
 * Viaja como conjunção da primeira meta, e não como item da lista — é
 * verdadeira no segundo zero. E as duas metades são contas diferentes:
 * `colunaCerta` olha cada linha que existe, e por isso aprova uma base com uma
 * pessoa a menos; quem conta as pessoas é `semRepetida`.
 */
const restoIntacto = (c: ContextoDoProjetoDeDados) => {
  const t = tratadaDe(c);
  const l = linhasDaTratada(c);
  return t !== null && cabecalhoIntacto(t) && semRepetida(l)
    && (['nome', 'unidade', 'modo', 'presencas'] as Coluna[]).every(col => colunaCerta(l, col));
};

const METAS_DOS_NUMEROS: MetaDoProjetoDeDados[] = [
  {
    id: 'texto-virou-numero',
    titulo: 'Número guardado como texto virou número',
    detalhe: '"3,75 km", "13.5" e "13 anos" encostam à esquerda e a MÉDIA pula os três sem avisar. A conta sai plausível e sobre menos gente do que a base tem.',
    onde: 'Página Inicial → Localizar e Selecionar → Substituir',
    passos: [
      'Selecione só os números da distância — sem o cabeçalho, que também tem "km" — e troque o ponto pela vírgula.',
      'Tire o " km" e o "km" do fim.',
      'Na idade, tire o " anos".',
    ],
    feita: c => {
      const l = linhasDaTratada(c);
      return colunaNumerica(l, 'distancia') && colunaNumerica(l, 'idade')
        && defeitosConsertados(l, 'numero-como-texto', 'distancia')
        && defeitosConsertados(l, 'numero-como-texto', 'idade')
        && restoIntacto(c) && bruta(c);
    },
  },
  {
    id: 'impossiveis-tratados',
    titulo: 'Os dois valores impossíveis foram tratados, cada um do seu jeito',
    detalhe: 'O 1.250 é o único que a planilha aceita como número, e puxa a média da distância de seis para trinta quilômetros. Ele tem conserto, porque há evidência do certo. O 41 não tem: pode ser 11 ou 14, e o que não se sabe fica em branco.',
    onde: 'A tratada',
    passos: [
      'Ache o maior valor de cada coluna e pergunte se ele é possível.',
      'Corrija só o que tem evidência do valor certo.',
      'O que não tem vira célula vazia — a linha fica.',
    ],
    feita: c => {
      const l = linhasDaTratada(c);
      return defeitosConsertados(l, 'valor-impossivel', 'distancia')
        && defeitosConsertados(l, 'valor-impossivel', 'idade') && bruta(c);
    },
  },
  {
    id: 'ausencias-de-pe',
    titulo: 'Quem não respondeu ao questionário continua na base, sem valor inventado',
    detalhe: 'Excluir as quatro linhas derruba a base para cinquenta e sete — abaixo do requisito — e joga fora uma presença que vale. Preencher com a média inventa quatro distâncias iguais que ninguém mediu.',
    onde: 'A tratada, e o diário de limpeza',
    passos: [
      'Deixe a distância e o transporte dessas quatro pessoas em branco.',
      'Escreva no diário por que a linha ficou e o valor não foi preenchido.',
    ],
    feita: c => {
      const l = linhasDaTratada(c);
      return ausenciasDePe(l)
        && documentado(c.p.diario, 'ausencia', ['distancia', 'modo']) && bruta(c);
    },
  },
  {
    id: 'diario-dos-numeros',
    titulo: 'As decisões de número estão no diário',
    detalhe: 'Duas para o número guardado como texto e duas para os impossíveis, porque a idade e a distância foram tratadas de jeitos diferentes — e é exatamente isso que quem ler precisa saber.',
    onde: 'Diário de limpeza',
    passos: [
      'Uma decisão para cada coluna em que o número estava guardado como texto.',
      'Uma para cada valor impossível, dizendo por que um foi corrigido e o outro não.',
    ],
    feita: c => documentado(c.p.diario, 'numero-como-texto', ['distancia'])
      && documentado(c.p.diario, 'numero-como-texto', ['idade'])
      && documentado(c.p.diario, 'valor-impossivel', ['distancia'])
      && documentado(c.p.diario, 'valor-impossivel', ['idade']),
  },
];

/* ── Módulo 5: as medidas ─────────────────────────────────────────────────── */

const medidaConfere = (c: ContextoDoProjetoDeDados, i: number) =>
  contaConfere(c.p.caderno, ABA_DE_CALCULOS, linhaDaMedida(i), 1,
    [MEDIDAS[i].funcao], esperadoDaMedida(MEDIDAS[i]));

const METAS_DAS_DESCRITIVAS: MetaDoProjetoDeDados[] = [
  {
    id: 'medidas-da-presenca',
    titulo: 'Média, mediana e desvio padrão da presença',
    detalhe: 'Sobre a tratada, e não sobre a bruta. A mediana da presença sai igual nas duas, e é exatamente por isso que conferir só o número não basta.',
    onde: 'Aba Cálculos',
    passos: [
      'Escreva =MÉDIA(Tratada!F2:F62) ao lado do rótulo.',
      'Faça o mesmo com MED e DESVPADP.',
    ],
    feita: c => [0, 1, 2].every(i => medidaConfere(c, i)),
  },
  {
    id: 'medidas-da-distancia',
    titulo: 'Média, mediana e desvio padrão da distância',
    detalhe: 'As quatro células em branco ficam de fora da conta, e é o certo: a média é de quem respondeu, e o relatório diz isso.',
    onde: 'Aba Cálculos',
    passos: ['As mesmas três funções, sobre Tratada!E2:E62.'],
    feita: c => [3, 4, 5].every(i => medidaConfere(c, i)),
  },
  {
    id: 'medida-tipica',
    titulo: 'A medida que descreve a distância típica está escolhida e explicada',
    detalhe: 'Quando poucos moram muito longe, a média anda para o lado deles e deixa de descrever quem mora perto. A explicação cita os dois números.',
    onde: 'Caderno da análise',
    passos: [
      'Compare a média e a mediana da distância.',
      'Escolha a que descreve a maioria e diga por quê, com os dois números.',
    ],
    feita: c => c.p.escolhas[CHAVE_MEDIDA_TIPICA] === 'mediana'
      && frase(texto(c, CHAVE_POR_QUE_MEDIDA)) && citaNumero(texto(c, CHAVE_POR_QUE_MEDIDA)),
  },
];

/* ── Módulo 6: os grupos ──────────────────────────────────────────────────── */

const linhaDoGrupo = (modo: Modo) => MODOS.indexOf(modo) + 1;

const METAS_DOS_GRUPOS: MetaDoProjetoDeDados[] = [
  {
    id: 'quantos-por-grupo',
    titulo: 'Quantos chegam de cada jeito',
    detalhe: 'Antes de comparar médias, saber o tamanho de cada grupo. Uma média de quatro pessoas e uma de vinte não pesam a mesma coisa.',
    onde: 'Aba Grupos → coluna Quantos',
    passos: [
      'Escreva =CONT.SE(Tratada!$D$2:$D$62;A2) na primeira linha.',
      'Arraste a alça para baixo.',
    ],
    feita: c => MODOS.every(m => contaConfere(c.p.caderno, ABA_DE_GRUPOS, linhaDoGrupo(m), 1,
      ['CONT.SE'], esperadoDoGrupo(m).quantos)),
  },
  {
    id: 'medias-por-grupo',
    titulo: 'A média da presença e da distância de cada grupo',
    detalhe: 'Esta planilha não tem MÉDIASE: a média do grupo é a soma do grupo dividida pela quantidade dele. Carona e ônibus moram longe parecido — e a presença é muito diferente.',
    onde: 'Aba Grupos',
    passos: [
      'Na média de presenças: =SOMASE(Tratada!$D$2:$D$62;A2;Tratada!$F$2:$F$62)/B2.',
      'Na média da distância, a mesma conta sobre a coluna E.',
      'Arraste as duas para baixo.',
    ],
    feita: c => MODOS.every(m => {
      const e = esperadoDoGrupo(m);
      return contaConfere(c.p.caderno, ABA_DE_GRUPOS, linhaDoGrupo(m), 2, ['SOMASE'], e.presencas)
        && contaConfere(c.p.caderno, ABA_DE_GRUPOS, linhaDoGrupo(m), 3, ['SOMASE'], e.distancia);
    }),
  },
  {
    id: 'comparacao-escrita',
    titulo: 'A comparação está escrita, e sabe do grupo pequeno',
    detalhe: 'Dois grupos, com os números deles. E o de bicicleta tem quatro pessoas: uma que falte muito muda a média inteira, e por isso ele não sustenta conclusão nenhuma.',
    onde: 'Caderno da análise',
    passos: [
      'Compare carona e ônibus, citando as duas médias.',
      'Diga o que o grupo de bicicleta permite concluir.',
    ],
    feita: c => frase(texto(c, CHAVE_COMPARACAO)) && citaNumero(texto(c, CHAVE_COMPARACAO))
      && c.p.escolhas[CHAVE_GRUPO_PEQUENO] === 'pouco',
  },
];

/* ── Módulo 7: a relação ──────────────────────────────────────────────────── */

const PARES_COM_OS_DOIS = MEMBROS.filter(m => m.distancia !== null).length;

const dispersaoDaTratada = (c: ContextoDoProjetoDeDados) => {
  const t = tratadaDe(c);
  return t && t.grafico?.tipo === 'dispersao' && tipoResponde(t)
    && pontosDaDispersao(t, c.p.caderno).length === PARES_COM_OS_DOIS ? t : null;
};

const METAS_DA_RELACAO: MetaDoProjetoDeDados[] = [
  {
    id: 'dispersao-da-base',
    titulo: 'A dispersão da distância com a presença, com a base inteira',
    detalhe: 'Cada ponto é uma pessoa. Selecionar só uma parte das linhas desenha uma nuvem plausível sobre metade do clube.',
    onde: 'Inserir → Gráfico → Dispersão',
    passos: [
      'Na tratada, selecione E1:F62.',
      'Insira uma dispersão e dê nome aos dois eixos.',
    ],
    feita: c => {
      const t = dispersaoDaTratada(c);
      return t !== null && eixosNomeados(t);
    },
  },
  {
    id: 'reta-e-equacao',
    titulo: 'A linha de tendência e a equação dela',
    detalhe: 'A reta resume a nuvem; a equação diz quanto a presença cai a cada quilômetro. São duas caixas, e a segunda é a que quase ninguém marca.',
    onde: 'Elementos do Gráfico',
    passos: ['Marque Linha de Tendência.', 'Marque Exibir Equação no gráfico.'],
    feita: c => {
      const t = dispersaoDaTratada(c);
      return t !== null && Boolean(t.grafico?.tendencia) && Boolean(t.grafico?.equacao);
    },
  },
  {
    id: 'correlacao-calculada',
    titulo: 'A correlação está calculada',
    detalhe: 'O gráfico mostra; o r diz quanto. Ele é o número que a conclusão vai citar.',
    onde: 'Aba Cálculos',
    passos: [`Ao lado de "${ROTULO_DA_CORRELACAO}", escreva =CORREL(Tratada!E2:E62;Tratada!F2:F62).`],
    feita: c => contaConfere(c.p.caderno, ABA_DE_CALCULOS, LINHA_DA_CORRELACAO, 1,
      ['CORREL'], CORRELACAO_ESPERADA()),
  },
  {
    id: 'relacao-lida',
    titulo: 'O que a relação sugere, e o que ela não prova',
    detalhe: 'Quem mora longe falta mais — e quem mora longe também pega ônibus. A distância pode não ser a causa: a carona que mora tão longe quanto falta pouco.',
    onde: 'Caderno da análise',
    passos: [
      'Escreva o que a relação sugere, com o r.',
      'Escreva que outra explicação cabe no mesmo desenho.',
    ],
    feita: c => frase(texto(c, CHAVE_RELACAO_SUGERE)) && citaNumero(texto(c, CHAVE_RELACAO_SUGERE))
      && frase(texto(c, CHAVE_RELACAO_NAO_PROVA)),
  },
];

/* ── Módulo 8: o painel ───────────────────────────────────────────────────── */

const temOsQuatro = (c: ContextoDoProjetoDeDados) =>
  graficosQueDesenham(c.p.caderno).length >= MINIMO_DE_GRAFICOS;

const METAS_DO_PAINEL: MetaDoProjetoDeDados[] = [
  {
    id: 'quatro-graficos',
    titulo: 'Quatro gráficos que desenham alguma coisa',
    detalhe: 'O requisito pede quatro. Gráfico sobre faixa vazia conta como gráfico e não mostra nada — por isso cada um precisa de dois pontos, pelo menos.',
    onde: 'Inserir → Gráfico, em cada aba de resumo',
    passos: [
      'Em cada aba de resumo, selecione a tabela e insira um gráfico.',
      'Confira que ele desenhou.',
    ],
    feita: temOsQuatro,
  },
  {
    id: 'cada-um-uma-pergunta',
    titulo: 'Cada gráfico tem uma pergunta como título, e as quatro são diferentes',
    detalhe: '"Presença por unidade" é um assunto. "Alguma unidade falta mais que as outras?" é uma pergunta, e quem olha o gráfico sabe o que procurar nele.',
    onde: 'O título de cada gráfico',
    passos: [
      'Reescreva cada título como a pergunta que o gráfico responde.',
      'Confira que não há duas perguntas iguais.',
    ],
    feita: c => {
      const g = graficosQueDesenham(c.p.caderno);
      const titulos = g.map(p => p.grafico!.titulo);
      return g.length >= MINIMO_DE_GRAFICOS && titulos.every(tituloEhPergunta)
        && new Set(titulos.map(normalizarTitulo)).size === titulos.length;
    },
  },
  {
    id: 'cada-tipo-responde',
    titulo: 'O tipo de cada gráfico responde à pergunta dele',
    detalhe: 'Linha é para tempo, e esta base não tem tempo. Pizza é para partes de um todo, e média não soma todo nenhum. E gráfico sem eixo nomeado não afirma nada.',
    onde: 'Alterar Tipo de Gráfico',
    passos: [
      'Pizza só sobre uma coluna de Quantos.',
      'Colunas para comparar, dispersão para relacionar duas medidas.',
      'Dê nome aos eixos de todos que têm eixo.',
    ],
    feita: c => temOsQuatro(c)
      && graficosQueDesenham(c.p.caderno).every(p => tipoResponde(p) && eixosNomeados(p)),
  },
];

/* ── Módulo 9: a conclusão ────────────────────────────────────────────────── */

/** O rascunho que a lição recebe. A recomendação dele é a que a meta recusa. */
export const RECOMENDACAO_VAGA = 'O clube deveria tentar melhorar a presença dos desbravadores nas reuniões.';

/**
 * Quem age, escrito pelo nome.
 *
 * Uma recomendação prática diz quem vai fazer: "melhorar a presença" não tem
 * dono, e é por isso que ninguém a cumpre. A lista é das funções do clube, e
 * não de pessoas — quem decide está na proposta, e é a ela que a recomendação
 * se dirige.
 */
const QUEM_AGE = /diretori|secretari|tesour|conselheir|conselho|unidade|famíli|pais|responsáve|motorist|direto/i;

const METAS_DA_CONCLUSAO: MetaDoProjetoDeDados[] = [
  {
    id: 'tres-partes-em-duas-paginas',
    titulo: 'As três partes cabem em duas páginas',
    detalhe: 'Duas páginas é o limite, e não a meta. O rascunho conta a limpeza inteira de novo — e ela já está no diário, que vai junto.',
    onde: 'Relatório → Conclusão',
    passos: [
      'Tire da conclusão o que já está no diário e no painel.',
      'Fique com o que muda a decisão.',
    ],
    feita: c => cabeEmDuasPaginas(c.p.conclusao) && frase(c.p.conclusao.mostram.trim())
      && frase(c.p.conclusao.naoPermitem.trim()) && frase(c.p.conclusao.recomendacao.trim()),
  },
  {
    id: 'mostram-com-numero',
    titulo: 'O que os dados mostram vem com os números',
    detalhe: '"Quem mora longe falta mais" é uma impressão. "Quem vem de ônibus vai a 11 de 20 reuniões; quem vem de carona, a 17" é um resultado.',
    onde: 'Relatório → O que os dados mostram',
    passos: ['Cite os números do painel e das contas que sustentam cada frase.'],
    feita: c => citaNumero(c.p.conclusao.mostram) && frase(c.p.conclusao.mostram.trim()),
  },
  {
    id: 'o-que-nao-permitem',
    titulo: 'O que os dados não permitem afirmar está escrito',
    detalhe: 'É a parte que quase ninguém escreve e a que mais protege quem decide: um semestre só, quatro famílias sem resposta, quem já saiu do clube não está na chamada, e relação não é causa.',
    onde: 'Relatório → O que não permitem afirmar',
    passos: ['Escreva o que a base não cobre e o que a relação não prova.'],
    feita: c => frase(c.p.conclusao.naoPermitem.trim()),
  },
  {
    id: 'recomendacao-pratica',
    titulo: 'A recomendação diz quem faz o quê',
    detalhe: '"Melhorar a presença" não tem dono. Uma recomendação prática nomeia quem age e o que faz — e é ela que quem decide vai aprovar ou não.',
    onde: 'Relatório → Recomendação',
    passos: [
      'Diga quem do clube faz.',
      'Diga o que faz, de um jeito que dê para conferir depois se foi feito.',
    ],
    feita: c => {
      const r = c.p.conclusao.recomendacao.trim();
      return frase(r) && QUEM_AGE.test(r) && r !== RECOMENDACAO_VAGA;
    },
  },
];

/* ── Módulo 10: a apresentação ────────────────────────────────────────────── */

const minutosDe = (r: Roteiro, id: string) => r.blocos.find(b => b.id === id)?.minutos ?? 0;

const METAS_DA_APRESENTACAO: MetaDoProjetoDeDados[] = [
  {
    id: 'cabe-em-dez-minutos',
    titulo: 'A apresentação cabe em dez minutos, com tempo para o que importa',
    detalhe: 'Seis minutos de limpeza e nenhum de recomendação é o roteiro de quem quer mostrar trabalho. Quem decide precisa da pergunta, do painel, da recomendação e de tempo para perguntar.',
    onde: 'Roteiro da apresentação',
    passos: [
      'Corte a limpeza para um minuto: o diário vai junto.',
      'Dê tempo à recomendação e às perguntas.',
    ],
    feita: c => minutosDoRoteiro(c.p.roteiro) <= MINUTOS_DA_APRESENTACAO
      && c.p.roteiro.blocos.every(b => Number.isInteger(b.minutos) && b.minutos >= 0)
      && minutosDe(c.p.roteiro, 'painel') >= 1
      && minutosDe(c.p.roteiro, 'recomendacao') >= 1
      && minutosDe(c.p.roteiro, 'perguntas') >= 1,
  },
  {
    id: 'publico-que-decide',
    titulo: 'O público é do clube, e pode decidir',
    detalhe: 'A família em casa ouve com gosto e não decide nada no clube. O requisito pede diretoria, unidade ou conselho — gente que pode fazer alguma coisa com a recomendação.',
    onde: 'Roteiro da apresentação → Para quem',
    passos: ['Escolha o público que tem o poder de decidir o que a recomendação pede.'],
    feita: c => c.p.roteiro.publico !== null && PUBLICOS_DO_CLUBE.includes(c.p.roteiro.publico),
  },
  {
    id: 'registro-da-decisao',
    titulo: 'A decisão tomada, ou a reação, está registrada',
    detalhe: 'O que aconteceu, e não o que se esperava. "Vão pensar" também é registro — e é o que diz que a recomendação ainda não virou decisão.',
    onde: 'Roteiro da apresentação → Registro',
    passos: [
      'Escreva a data em que apresentou e quem estava.',
      'Escreva a decisão tomada ou a reação, com as palavras de quem decidiu.',
    ],
    feita: c => {
      const r = c.p.roteiro.registro;
      const quando = dataEscrita(r.data);
      const aprovada = c.p.proposta.aprovadaEm;
      return quando !== null && (aprovada === null || quando >= aprovada)
        && r.quem.trim() !== '' && frase(r.texto.trim());
    },
  },
];

/* ── Módulo 11: a entrega ─────────────────────────────────────────────────── */

export const PASTA_DA_ENTREGA = 'f-projeto';
export const ARQUIVO_BRUTO = 'a-bruta';
export const ARQUIVO_BRUTO_MEXIDO = 'a-bruta-2';
export const ARQUIVO_DA_ANALISE = 'a-analise';
export const ARQUIVO_DO_RELATORIO = 'a-relatorio';

const naPasta = (n: Nuvem) =>
  n.arquivos.filter(a => a.pasta === PASTA_DA_ENTREGA && !a.naLixeira).map(a => a.id).sort();

const METAS_DA_ENTREGA: MetaDoProjetoDeDados[] = [
  {
    id: 'entregaveis-na-pasta',
    titulo: 'A pasta do projeto tem os três entregáveis, e só eles',
    detalhe: 'A base bruta, a análise com a tratada e o relatório final. O rascunho e a foto da reunião são seus, e não da entrega — quem confere não precisa adivinhar qual arquivo vale.',
    onde: 'Nuvem → Mover para',
    passos: [
      'Mova a bruta, a análise e o relatório para a pasta do projeto.',
      'Deixe o resto onde está.',
    ],
    feita: c => {
      const dentro = naPasta(c.p.nuvem);
      const brutas = dentro.filter(id => id === ARQUIVO_BRUTO || id === ARQUIVO_BRUTO_MEXIDO);
      return brutas.length === 1 && dentro.length === 3
        && dentro.includes(ARQUIVO_DA_ANALISE) && dentro.includes(ARQUIVO_DO_RELATORIO);
    },
  },
  {
    id: 'bruta-nunca-editada',
    titulo: 'A bruta entregue é a que ninguém abriu para editar',
    detalhe: 'Há duas cópias da exportação, com o mesmo nome. Uma foi aberta e editada — e base bruta editada não é mais bruta. O histórico de versões diz qual é qual.',
    onde: 'Nuvem → Histórico de versões',
    passos: [
      'Abra o histórico das duas cópias.',
      'Entregue a que tem uma versão só, a da secretaria.',
    ],
    feita: c => naPasta(c.p.nuvem).includes(ARQUIVO_BRUTO)
      && !naPasta(c.p.nuvem).includes(ARQUIVO_BRUTO_MEXIDO),
  },
  {
    id: 'compartilhada-para-conferir',
    titulo: 'A pasta está compartilhada com quem examina, para ler — e sem link aberto',
    detalhe: 'Quem examina confere, e não edita: editor pode mexer na bruta sem querer, e aí ela deixa de ser a prova. E a base tem o nome de sessenta e uma crianças — link aberto é para qualquer pessoa.',
    onde: 'Nuvem → Compartilhar',
    passos: [
      'Compartilhe a pasta com a liderança como leitor ou comentarista.',
      'Deixe o acesso geral em Restrito.',
    ],
    feita: c => {
      const n = c.p.nuvem;
      const papel = papelDe(n, PASTA_DA_ENTREGA, 'lideranca');
      const aberto = n.arquivos.some(a =>
        (a.id === PASTA_DA_ENTREGA || a.pasta === PASTA_DA_ENTREGA) && a.linkAberto !== undefined);
      return (papel === 'leitor' || papel === 'comentarista') && !aberto;
    },
  },
];

/* ── As derivações: o que cada lição deixa pronto para a seguinte ─────────── */

const ULTIMA_LINHA_BRUTA = linhasBrutas().length;
const colunaDaBase = (col: Coluna): Faixa =>
  ({ l1: 1, c1: INDICE[col], l2: ULTIMA_LINHA_BRUTA, c2: INDICE[col] });

const naTratada = (cad: Caderno, mudar: (p: Planilha) => Planilha): Caderno => ({
  ...cad,
  planilhas: cad.planilhas.map(p => (p.nome === NOME_DA_TRATADA ? mudar(p) : p)),
});

/** A cópia, renomeada: Mover ou Copiar com a caixa marcada, e Renomear. */
export function comCopiaTratada(cad: Caderno): Caderno {
  const copia = moverOuCopiar(cad, cad.planilhas.findIndex(p => p.nome === NOME_DA_BRUTA), 1, true);
  const renomeada = renomearAba(copia, copia.ativa, NOME_DA_TRATADA);
  return typeof renomeada === 'string' ? copia : renomeada;
}

/**
 * As substituições da lição de grafia, com a coluna selecionada e a célula
 * inteira marcada — o caminho que não acerta o Pedro Aguiar.
 *
 * Sem diferenciar maiúsculas: `aguia` pega `AGUIA` e `Aguia`, e não pega
 * `Águia`, que já está certa. O acento é outra letra, e é por isso que o
 * ônibus pede duas passadas e a onça também.
 */
export const SUBSTITUICOES_DA_GRAFIA: [Coluna, string, string][] = [
  ['unidade', 'aguia', 'Águia'],
  ['unidade', 'onça', 'Onça'],
  ['unidade', 'onca', 'Onça'],
  ['unidade', 'tucano', 'Tucano'],
  ['modo', 'onibus', 'Ônibus'],
  ['modo', 'ônibus', 'Ônibus'],
  ['modo', 'a pé', 'A pé'],
  ['modo', 'a pe', 'A pé'],
  ['modo', 'carona', 'Carona'],
];

export function comGrafiaPadronizada(cad: Caderno): Caderno {
  return naTratada(cad, p => {
    let q = p;
    for (const [coluna, de, para] of SUBSTITUICOES_DA_GRAFIA) {
      q = substituir(q, de, para, { maiusculas: false, inteira: true }, colunaDaBase(coluna)).planilha;
    }
    return removerDuplicatas(q, COLUNAS.map((_, i) => i)).planilha;
  });
}

/**
 * Os números da lição 4: as substituições na coluna da distância e na da
 * idade, e o 41 apagado.
 *
 * Trocar o ponto pela vírgula conserta o 13.5 e o 9.5 — e conserta o 1.250
 * também, por outro motivo: lá o ponto era a vírgula de quem digitou, e o
 * valor certo é 1,25. A mesma troca, duas decisões, e é por isso que o diário
 * as escreve separadas.
 */
export function comNumerosConsertados(cad: Caderno): Caderno {
  return naTratada(cad, p => {
    let q = p;
    const dist = colunaDaBase('distancia');
    const idade = colunaDaBase('idade');
    q = substituir(q, '.', ',', { maiusculas: false, inteira: false }, dist).planilha;
    q = substituir(q, ' km', '', { maiusculas: false, inteira: false }, dist).planilha;
    q = substituir(q, 'km', '', { maiusculas: false, inteira: false }, dist).planilha;
    q = substituir(q, ' anos', '', { maiusculas: false, inteira: false }, idade).planilha;
    const linha = q.celulas.findIndex(l =>
      l[INDICE.nome]?.texto === 'Ana Clara Ribeiro' && l[INDICE.unidade]?.texto === 'Tucano');
    return linha < 0 ? q : limpar(q, { l1: linha, c1: INDICE.idade, l2: linha, c2: INDICE.idade });
  });
}

const decisao = (id: string, problema: DecisaoDeLimpeza['problema'], coluna: DecisaoDeLimpeza['coluna'], t: string): DecisaoDeLimpeza =>
  ({ id, problema, coluna, texto: t });

export const DIARIO_DA_GRAFIA: DecisaoDeLimpeza[] = [
  decisao('d1', 'grafia', 'unidade', 'Padronizei a unidade como a lista do clube escreve: aguia, AGUIA e Aguia viraram Águia, onça e Onca viraram Onça, tucano virou Tucano. Substituí só na coluna Unidade, com célula inteira, para não mexer em nome nenhum.'),
  decisao('d2', 'grafia', 'modo', 'Padronizei o transporte como o questionário oferece — A pé, Bicicleta, Carona, Ônibus. O acento conta como outra letra, então ônibus e a pé pediram duas passadas cada.'),
  decisao('d3', 'duplicata', 'linha', 'A Carla Menezes veio duas vezes, a segunda escrita aguia e onibus. Depois de padronizar, Remover Duplicatas com todas as colunas tirou a de baixo. As duas Ana Clara Ribeiro ficaram: são de unidades e idades diferentes.'),
];

export const DIARIO_DOS_NUMEROS: DecisaoDeLimpeza[] = [
  decisao('d4', 'numero-como-texto', 'distancia', 'Cinco distâncias estavam guardadas como texto: com ponto no lugar da vírgula ou com km no fim. Troquei o ponto pela vírgula e tirei o km, só na coluna da distância.'),
  decisao('d5', 'numero-como-texto', 'idade', 'Duas idades vieram escritas com a palavra anos, e a planilha as lia como texto. Tirei o " anos" só na coluna da idade e conferi que todas foram para a direita.'),
  decisao('d6', 'valor-impossivel', 'distancia', 'A Isabela aparecia a 1.250 km, que a planilha lê como mil duzentos e cinquenta. Ela vem a pé, e a mesma coluna tinha outros números com ponto no lugar da vírgula: corrigi para 1,25.'),
  decisao('d7', 'valor-impossivel', 'idade', 'A idade da Ana Clara do Tucano veio como 41, impossível para um desbravador. Pode ser 11 ou 14, e não há como saber pela base: deixei a célula vazia e mantive a linha, porque a presença dela vale.'),
  decisao('d8', 'ausencia', 'distancia', 'Quatro famílias não responderam ao questionário de transporte. Mantive as quatro linhas, porque a presença está na chamada, e deixei distância e transporte em branco: excluir derrubava a base para 57, e preencher com a média inventava dado.'),
];

const comLarguras = (p: Planilha, primeiras: number[]): Planilha =>
  ({ ...p, larguras: p.larguras.map((l, i) => primeiras[i] ?? l) });

const comAba = (cad: Caderno, p: Planilha): Caderno =>
  (planilhaPorNome(cad, p.nome) ? cad : { ...cad, planilhas: [...cad.planilhas, p] });

const naAba = (cad: Caderno, nome: string, mudar: (p: Planilha) => Planilha): Caderno => ({
  ...cad,
  planilhas: cad.planilhas.map(p => (p.nome === nome ? mudar(p) : p)),
});

export const comAbaDeCalculos = (cad: Caderno): Caderno => {
  const p = planilhaDe(ABA_DE_CALCULOS, [['Medida', 'Valor'], ...MEDIDAS.map(m => [m.rotulo])]);
  return comAba(cad, comLarguras(escrever(p, LINHA_DA_CORRELACAO, 0, ROTULO_DA_CORRELACAO), [260, 120]));
};

export const comMedidasEscritas = (cad: Caderno): Caderno =>
  naAba(cad, ABA_DE_CALCULOS, p => MEDIDAS.reduce(
    (q, m, i) => escrever(q, linhaDaMedida(i), 1, `=${m.funcao}(${faixaDa(m.coluna)})`), p));

export const comAbaDeGrupos = (cad: Caderno): Caderno =>
  comAba(cad, comLarguras(planilhaDe(ABA_DE_GRUPOS, [CABECALHO_DOS_GRUPOS, ...MODOS.map(m => [m])], {
    tabela: { l1: 0, c1: 0, l2: MODOS.length, c2: CABECALHO_DOS_GRUPOS.length - 1 },
  }), [110, 80, 140, 170]));

export const comGruposEscritos = (cad: Caderno): Caderno =>
  naAba(cad, ABA_DE_GRUPOS, p => MODOS.reduce((q, _m, i) => {
    const l = i + 1;
    let r = escrever(q, l, 1, `=CONT.SE(${faixaDa('modo', true)};A${l + 1})`);
    r = escrever(r, l, 2, `=SOMASE(${faixaDa('modo', true)};A${l + 1};${faixaDa('presencas', true)})/B${l + 1}`);
    return escrever(r, l, 3, `=SOMASE(${faixaDa('modo', true)};A${l + 1};${faixaDa('distancia', true)})/B${l + 1}`);
  }, p));

export const comDispersao = (cad: Caderno, titulo = 'Distância e presença'): Caderno =>
  naTratada(cad, p => ({
    ...p,
    grafico: {
      tipo: 'dispersao', titulo,
      eixoX: 'Distância até o clube (km)', eixoY: 'Presenças no semestre (de 20)',
      faixa: { l1: 0, c1: INDICE.distancia, l2: ULTIMA_LINHA - 1, c2: INDICE.presencas },
      tendencia: true, equacao: true,
    },
  }));

export const comCorrelacao = (cad: Caderno): Caderno =>
  naAba(cad, ABA_DE_CALCULOS, p => escrever(p, LINHA_DA_CORRELACAO, 1,
    `=CORREL(${faixaDa('distancia')};${faixaDa('presencas')})`));

/**
 * As duas abas de resumo que o painel recebe prontas.
 *
 * Prontas, e é decisão: as contas delas são `CONT.SE` e `SOMASE`, que o módulo
 * 6 já mediu. Mandar refazê-las mediria de novo o que já foi medido, e o que o
 * requisito 6 pede é outra coisa — que cada gráfico responda a uma pergunta.
 * É a decisão do módulo 6 da CC-ES004 e da CC-ES012, que recebem as peças
 * prontas pelo mesmo motivo.
 */
export const comAbasDoPainel = (cad: Caderno): Caderno => {
  const unidades = planilhaDe(ABA_DE_UNIDADES, [
    ['Unidade', 'Quantos', 'Média de presenças'],
    ...UNIDADES_DO_CLUBE.map((u, i) => [
      u,
      `=CONT.SE(${faixaDa('unidade', true)};A${i + 2})`,
      `=SOMASE(${faixaDa('unidade', true)};A${i + 2};${faixaDa('presencas', true)})/B${i + 2}`,
    ]),
  ], { tabela: { l1: 0, c1: 0, l2: UNIDADES_DO_CLUBE.length, c2: 2 } });
  const d = faixaDa('distancia', true);
  const distancias = planilhaDe(ABA_DE_DISTANCIAS, [
    ['Distância até o clube', 'Quantos'],
    ['Até 2 km', `=CONT.SE(${d};"<=2")`],
    ['De 2 a 5 km', `=CONT.SE(${d};"<=5")-CONT.SE(${d};"<=2")`],
    ['De 5 a 10 km', `=CONT.SE(${d};"<=10")-CONT.SE(${d};"<=5")`],
    ['Mais de 10 km', `=CONT.SE(${d};">10")`],
  ], { tabela: { l1: 0, c1: 0, l2: 4, c2: 1 } });
  return comAba(comAba(cad, comLarguras(unidades, [100, 80, 150])), comLarguras(distancias, [170, 80]));
};

/** O painel feito: quatro gráficos, quatro perguntas, quatro tipos que respondem. */
export function comPainelPronto(cad: Caderno): Caderno {
  let k = comDispersao(cad, 'Quem mora mais longe vai a menos reuniões?');
  k = naAba(k, ABA_DE_GRUPOS, p => ({
    ...p,
    grafico: {
      tipo: 'colunas', titulo: 'Quem vem de carona falta menos que quem vem de ônibus?',
      eixoX: 'Como chega', eixoY: 'Média de presenças (de 20)',
      faixa: { l1: 1, c1: 0, l2: MODOS.length, c2: 2 },
    },
  }));
  k = naAba(k, ABA_DE_UNIDADES, p => ({
    ...p,
    grafico: {
      tipo: 'colunas', titulo: 'Alguma unidade falta mais que as outras?',
      eixoX: 'Unidade', eixoY: 'Média de presenças (de 20)',
      faixa: { l1: 1, c1: 0, l2: UNIDADES_DO_CLUBE.length, c2: 2 },
    },
  }));
  return naAba(k, ABA_DE_DISTANCIAS, p => ({
    ...p,
    grafico: {
      tipo: 'pizza', titulo: 'Quantos desbravadores moram longe do clube?',
      eixoX: '', eixoY: '',
      faixa: { l1: 1, c1: 0, l2: 4, c2: 1 },
    },
  }));
}

/* ── Os textos que a lição de conclusão e a de apresentação recebem ───────── */

/**
 * O rascunho da conclusão: longo, sem o que os dados não permitem afirmar, e
 * com a recomendação sem dono.
 *
 * É como a primeira versão de todo relatório sai, e cada defeito dele é uma
 * meta. A primeira parte reconta o diário de limpeza e repete o painel em
 * prosa, que é o que faz duas páginas virarem três; e não cita número nenhum,
 * porque quem reconta o caminho esquece de dizer aonde ele chegou.
 */
export const CONCLUSAO_RASCUNHO: Conclusao = {
  mostram: [
    'Para começar, eu peguei a chamada do primeiro semestre que a secretaria exportou do sistema e cruzei com o questionário de transporte que as famílias responderam em junho. A base veio com muitos problemas, e eu gastei boa parte do projeto arrumando tudo antes de conseguir fazer qualquer conta.',
    'O primeiro problema era a unidade. Ela estava escrita de vários jeitos diferentes: tinha aguia com letra minúscula, tinha AGUIA toda em maiúscula, tinha Aguia sem acento, e a mesma coisa acontecia com a Onça e com o Tucano. Isso parece pouco, mas numa conta por unidade cada jeito de escrever vira um grupo diferente, e aí a unidade Águia aparecia dividida em quatro pedaços. Eu usei o Localizar e Substituir, selecionando só a coluna da unidade e marcando a opção de célula inteira, porque na primeira tentativa eu substituí na planilha toda e o Pedro Aguiar virou Pedro Águiar, e eu tive que desfazer.',
    'Depois eu arrumei o jeito de chegar, que também estava escrito de vários jeitos. Tinha onibus sem acento, Onibus, ônibus com o o minúsculo, tinha a pé e A pe, tinha carona e CARONA. Eu descobri que desmarcar a diferença de maiúsculas não junta o onibus com o ônibus, porque o acento conta como outra letra, então precisei de duas passadas para o ônibus e duas para o a pé.',
    'O terceiro problema foi a linha repetida da Carla Menezes. Ela aparecia duas vezes, e a segunda vinha com a unidade e o transporte escritos de outro jeito. Quando eu rodei o Remover Duplicatas antes de padronizar, ele disse que não tinha duplicata nenhuma. Só depois de padronizar ele achou. E eu tomei cuidado para não remover olhando só o nome, porque existem duas Ana Clara Ribeiro, uma no Tucano e outra na Arara, e são duas pessoas diferentes.',
    'Depois vieram os números. Algumas distâncias estavam com ponto no lugar da vírgula, outras com km escrito no fim, e algumas idades vieram com a palavra anos. Tudo isso a planilha lia como texto, e a média pulava essas células sem avisar. Eu troquei o ponto pela vírgula e tirei o km e o anos, sempre selecionando só a coluna certa.',
    'Teve também dois valores impossíveis. A Isabela aparecia morando a mil duzentos e cinquenta quilômetros, o que não faz sentido porque ela vem a pé, e eu corrigi para um vírgula vinte e cinco. E a Ana Clara do Tucano aparecia com quarenta e um anos, mas como não dá para saber se era onze ou catorze, eu deixei a idade dela em branco. Quatro famílias não responderam ao questionário, e eu deixei a distância e o transporte delas em branco, sem apagar a linha.',
    'Com a base arrumada, eu fui para a aba de cálculos. Escrevi a média, a mediana e o desvio padrão da presença, usando as funções MÉDIA, MED e DESVPADP, sempre apontando para a aba tratada e nunca para a bruta, porque na bruta o mil duzentos e cinquenta ainda estava lá e estragava a conta da distância. Depois fiz as mesmas três contas para a distância. Eu tive que pensar bastante sobre qual medida usar para a distância, porque a média e a mediana davam números bem diferentes, e no fim eu escolhi a mediana, porque uns poucos que moram muito longe puxam a média para cima.',
    'Em seguida fiz a aba de grupos. Como a planilha não tem MÉDIASE, eu usei o CONT.SE para contar quantos chegam de cada jeito e o SOMASE dividido pela contagem para achar a média de presença e a média de distância de cada grupo. Escrevi a fórmula na primeira linha e arrastei para baixo, e conferi que a soma dos quatro grupos dava o número de pessoas que responderam ao questionário. O grupo de bicicleta ficou muito pequeno, com só quatro pessoas, e por isso eu não tirei conclusão nenhuma dele.',
    'Depois desenhei a dispersão da distância com a presença. Selecionei as duas colunas inteiras da tratada, inseri o gráfico de dispersão, dei nome aos dois eixos, marquei a linha de tendência e a equação, e calculei a correlação com a função CORREL na aba de cálculos. A nuvem de pontos desce da esquerda para a direita, e a reta também.',
    'Por último eu montei o painel com quatro gráficos. Um é a dispersão. Outro é de colunas e compara a presença de quem vem de cada jeito. O terceiro também é de colunas e compara as unidades. O quarto é uma pizza que mostra quantos desbravadores moram em cada faixa de distância. Cada gráfico tem uma pergunta no título, e eu tomei cuidado para não usar gráfico de linha, porque a base não tem tempo, e para não fazer pizza das médias, porque média não soma um todo.',
    'Todo esse trabalho levou várias semanas, e eu aprendi muito sobre como uma base chega bagunçada e quanto tempo leva para deixá-la pronta para análise. Aprendi também que o Excel não avisa quando uma conta pula uma célula escrita como texto, e que é preciso conferir a contagem antes de confiar em qualquer média.',
    'O que os dados mostram, no geral, é que quem mora mais longe tende a faltar mais às reuniões, e que o jeito de chegar parece fazer bastante diferença na presença. Também dá para ver que as unidades são parecidas entre si e que a maior parte do clube mora relativamente perto.',
  ].join('\n\n'),
  naoPermitem: '',
  recomendacao: RECOMENDACAO_VAGA,
};

export const CONCLUSAO_FEITA: Conclusao = {
  mostram: 'Quem mora mais longe vai a menos reuniões: a correlação entre distância e presença é de -0,70. Mas a distância não é tudo. Quem vem de carona mora, em média, a 8,37 km e vai a 17,37 das 20 reuniões; quem vem de ônibus mora a 9,05 km, quase o mesmo, e vai a 11,35. A diferença entre as unidades é menor do que a entre carona e ônibus.',
  naoPermitem: 'A base é de um semestre só, e quatro famílias não responderam ao questionário. Quem já saiu do clube não está na chamada. E a relação não prova que a distância causa a falta: quem vem de ônibus pode faltar por outros motivos, como o horário do ônibus de sábado ou a família trabalhar no fim de semana. O grupo de bicicleta tem quatro pessoas e não sustenta conclusão.',
  recomendacao: 'Que a diretoria monte, no segundo semestre, uma lista de carona para os desbravadores que vêm de ônibus e moram a mais de 5 km, e que a secretaria compare a presença deles em dezembro com a deste semestre.',
};

export const ROTEIRO_RASCUNHO: Roteiro = {
  publico: null,
  blocos: [
    { id: 'pergunta', rotulo: 'A pergunta e quem decide', minutos: 1 },
    { id: 'origem', rotulo: 'De onde veio o dado', minutos: 1 },
    { id: 'limpeza', rotulo: 'Tudo o que eu limpei, passo a passo', minutos: 6 },
    { id: 'medidas', rotulo: 'As medidas de cada coluna', minutos: 4 },
    { id: 'painel', rotulo: 'Os quatro gráficos', minutos: 2 },
    { id: 'conclusao', rotulo: 'O que os dados mostram e o que não permitem', minutos: 2 },
    { id: 'recomendacao', rotulo: 'A recomendação ao clube', minutos: 0 },
    { id: 'perguntas', rotulo: 'Perguntas de quem decide', minutos: 0 },
  ],
  registro: { data: '', quem: '', texto: '' },
};

/* ── A nuvem da entrega ───────────────────────────────────────────────────── */

const arquivo = (id: string, nome: string, tipo: ArquivoDaNuvem['tipo'], extra: Partial<ArquivoDaNuvem> = {}): ArquivoDaNuvem =>
  ({ id, nome, tipo, dono: 'voce', acessos: [], versoes: [{ id: 'v1', quando: '2026-08-03', porQuem: ['voce'] }], ...extra });

/**
 * A nuvem como a lição de entrega a recebe: tudo na raiz, a pasta vazia.
 *
 * As duas cópias da exportação têm o **mesmo nome** visto de longe, e é de
 * propósito: é o que acontece quando o mesmo anexo é baixado duas vezes. Uma
 * delas foi aberta e editada depois — está no histórico, que é onde a nuvem
 * guarda isso —, e base bruta editada não é mais bruta.
 */
export const NUVEM_DA_ENTREGA: Nuvem = {
  arquivos: [
    arquivo(PASTA_DA_ENTREGA, 'Projeto de dados — presença', 'pasta', { versoes: [] }),
    arquivo(ARQUIVO_BRUTO, 'chamada_1sem_2026', 'planilha', {
      versoes: [{ id: 'v1', quando: '2026-08-03', porQuem: ['cleide'] }],
    }),
    arquivo(ARQUIVO_BRUTO_MEXIDO, 'chamada_1sem_2026 (1)', 'planilha', {
      versoes: [
        { id: 'v1', quando: '2026-08-03', porQuem: ['cleide'] },
        { id: 'v2', quando: '2026-08-05', porQuem: ['voce'] },
      ],
    }),
    arquivo(ARQUIVO_DA_ANALISE, 'Análise da presença — bruta, tratada e contas', 'planilha', {
      versoes: [{ id: 'v1', quando: '2026-08-20', porQuem: ['voce'] }],
    }),
    arquivo(ARQUIVO_DO_RELATORIO, 'Relatório final — presença', 'pdf', {
      versoes: [{ id: 'v1', quando: '2026-08-24', porQuem: ['voce'] }],
    }),
    arquivo('a-rascunho', 'Rascunho da conclusão', 'documento', {
      versoes: [{ id: 'v1', quando: '2026-08-22', porQuem: ['voce'] }],
    }),
    arquivo('a-foto', 'reuniao-com-a-diretoria.jpg', 'imagem', {
      versoes: [{ id: 'v1', quando: '2026-08-29', porQuem: ['voce'] }],
    }),
  ],
};

/* ── Os estados de partida ────────────────────────────────────────────────── */

export const PROJETO_INICIAL: ProjetoDeDados = {
  proposta: PROPOSTA_EM_BRANCO,
  ficha: FICHA_EM_BRANCO,
  caderno: { planilhas: [abaBruta()], ativa: 0 },
  diario: [],
  textos: {},
  escolhas: {},
  conclusao: { mostram: '', naoPermitem: '', recomendacao: '' },
  roteiro: ROTEIRO_RASCUNHO,
  nuvem: NUVEM_DA_ENTREGA,
};

const DEPOIS_DA_PROPOSTA: ProjetoDeDados = {
  ...PROJETO_INICIAL,
  proposta: {
    pergunta: 'Quem mora mais longe do clube falta mais às reuniões de sábado?',
    origem: 'A chamada do semestre, da secretaria, cruzada com um questionário de transporte respondido pelas famílias.',
    quemDecide: 'A diretoria do clube',
    decisao: 'Se monta uma lista de carona para o segundo semestre, e para quem.',
    aprovadaEm: '2026-07-01',
  },
};

const DEPOIS_DA_BASE: ProjetoDeDados = {
  ...DEPOIS_DA_PROPOSTA,
  ficha: {
    base: 'chamada',
    origem: 'Exportação do sistema de chamada da secretaria (Cleide), com as vinte reuniões do semestre, cruzada com o questionário de transporte respondido pelas famílias em junho.',
    obtidaEm: '03/08/2026',
  },
};

const DEPOIS_DA_GRAFIA: ProjetoDeDados = {
  ...DEPOIS_DA_BASE,
  caderno: comGrafiaPadronizada(comCopiaTratada(DEPOIS_DA_BASE.caderno)),
  diario: DIARIO_DA_GRAFIA,
};

const DEPOIS_DOS_NUMEROS: ProjetoDeDados = {
  ...DEPOIS_DA_GRAFIA,
  caderno: comNumerosConsertados(DEPOIS_DA_GRAFIA.caderno),
  diario: [...DIARIO_DA_GRAFIA, ...DIARIO_DOS_NUMEROS],
};

const DEPOIS_DAS_DESCRITIVAS: ProjetoDeDados = {
  ...DEPOIS_DOS_NUMEROS,
  caderno: comMedidasEscritas(comAbaDeCalculos(DEPOIS_DOS_NUMEROS.caderno)),
  escolhas: { [CHAVE_MEDIDA_TIPICA]: 'mediana' },
  textos: {
    [CHAVE_POR_QUE_MEDIDA]: 'A média da distância dá 6,43 km e a mediana dá 5 km. Uns poucos moram a mais de 13 km e puxam a média para cima; a mediana diz onde mora quem está no meio.',
  },
};

const DEPOIS_DOS_GRUPOS: ProjetoDeDados = {
  ...DEPOIS_DAS_DESCRITIVAS,
  caderno: comGruposEscritos(comAbaDeGrupos(DEPOIS_DAS_DESCRITIVAS.caderno)),
  escolhas: { ...DEPOIS_DAS_DESCRITIVAS.escolhas, [CHAVE_GRUPO_PEQUENO]: 'pouco' },
  textos: {
    ...DEPOIS_DAS_DESCRITIVAS.textos,
    [CHAVE_COMPARACAO]: 'Carona e ônibus moram longe parecido, 8,37 e 9,05 km em média, mas quem vem de carona vai a 17,37 reuniões e quem vem de ônibus a 11,35. O grupo de bicicleta tem só quatro pessoas.',
  },
};

const DEPOIS_DA_RELACAO: ProjetoDeDados = {
  ...DEPOIS_DOS_GRUPOS,
  caderno: comCorrelacao(comDispersao(DEPOIS_DOS_GRUPOS.caderno)),
  textos: {
    ...DEPOIS_DOS_GRUPOS.textos,
    [CHAVE_RELACAO_SUGERE]: 'A correlação é de -0,70: quem mora mais longe tende a ir a menos reuniões, e a reta perde perto de meia reunião a cada quilômetro.',
    [CHAVE_RELACAO_NAO_PROVA]: 'Não prova que a distância causa a falta. Quem mora longe também pega ônibus, e quem vem de carona mora tão longe quanto e falta pouco: o transporte pode ser o que pesa.',
  },
};

const DEPOIS_DO_PAINEL: ProjetoDeDados = {
  ...DEPOIS_DA_RELACAO,
  caderno: comPainelPronto(comAbasDoPainel(DEPOIS_DA_RELACAO.caderno)),
};

const DEPOIS_DA_CONCLUSAO: ProjetoDeDados = {
  ...DEPOIS_DO_PAINEL,
  conclusao: CONCLUSAO_FEITA,
};

const DEPOIS_DA_APRESENTACAO: ProjetoDeDados = {
  ...DEPOIS_DA_CONCLUSAO,
  roteiro: {
    publico: 'diretoria',
    blocos: [
      { id: 'pergunta', rotulo: 'A pergunta e quem decide', minutos: 1 },
      { id: 'origem', rotulo: 'De onde veio o dado', minutos: 1 },
      { id: 'limpeza', rotulo: 'Tudo o que eu limpei, passo a passo', minutos: 1 },
      { id: 'medidas', rotulo: 'As medidas de cada coluna', minutos: 0 },
      { id: 'painel', rotulo: 'Os quatro gráficos', minutos: 3 },
      { id: 'conclusao', rotulo: 'O que os dados mostram e o que não permitem', minutos: 2 },
      { id: 'recomendacao', rotulo: 'A recomendação ao clube', minutos: 1 },
      { id: 'perguntas', rotulo: 'Perguntas de quem decide', minutos: 1 },
    ],
    registro: {
      data: '29/08/2026',
      quem: 'A diretoria: o diretor, a secretária e a tesoureira',
      texto: 'A diretoria aprovou a lista de carona para o segundo semestre e pediu à secretaria que traga a presença de dezembro para comparar. A tesoureira perguntou se dá para ajudar com a passagem de quem não conseguir carona.',
    },
  },
};

/* ── O registro das onze lições ───────────────────────────────────────────── */

export interface LicaoDoProjetoDeDados {
  projeto: ProjetoDeDados;
  programa: ProgramaDaLicao;
  metas: MetaDoProjetoDeDados[];
}

/**
 * De que estado cada lição parte e o que ela cobra.
 *
 * `Record` sobre a união, e não uma escada de `if`: a décima segunda lição não
 * compila até alguém dizer de onde ela parte, em que programa ela abre e o que
 * ela cobra. É a decisão do `LICOES_DA_CC_ES012`.
 */
export const LICOES_DA_CC_ES013: Record<LicaoDaCcEs013, LicaoDoProjetoDeDados> = {
  proposta: { projeto: PROJETO_INICIAL, programa: 'plataforma', metas: METAS_DA_PROPOSTA },
  base: { projeto: DEPOIS_DA_PROPOSTA, programa: 'plataforma', metas: METAS_DA_BASE },
  grafia: { projeto: DEPOIS_DA_BASE, programa: 'excel', metas: METAS_DA_GRAFIA },
  numeros: { projeto: DEPOIS_DA_GRAFIA, programa: 'excel', metas: METAS_DOS_NUMEROS },
  descritivas: {
    projeto: { ...DEPOIS_DOS_NUMEROS, caderno: comAbaDeCalculos(DEPOIS_DOS_NUMEROS.caderno) },
    programa: 'excel', metas: METAS_DAS_DESCRITIVAS,
  },
  grupos: {
    projeto: { ...DEPOIS_DAS_DESCRITIVAS, caderno: comAbaDeGrupos(DEPOIS_DAS_DESCRITIVAS.caderno) },
    programa: 'excel', metas: METAS_DOS_GRUPOS,
  },
  relacao: { projeto: DEPOIS_DOS_GRUPOS, programa: 'excel', metas: METAS_DA_RELACAO },
  painel: {
    projeto: { ...DEPOIS_DA_RELACAO, caderno: comAbasDoPainel(DEPOIS_DA_RELACAO.caderno) },
    programa: 'excel', metas: METAS_DO_PAINEL,
  },
  conclusao: {
    projeto: { ...DEPOIS_DO_PAINEL, conclusao: CONCLUSAO_RASCUNHO },
    programa: 'plataforma', metas: METAS_DA_CONCLUSAO,
  },
  apresentacao: { projeto: DEPOIS_DA_CONCLUSAO, programa: 'plataforma', metas: METAS_DA_APRESENTACAO },
  entrega: { projeto: DEPOIS_DA_APRESENTACAO, programa: 'nuvem', metas: METAS_DA_ENTREGA },
};

export const metasDa = (licao: LicaoDaCcEs013) => LICOES_DA_CC_ES013[licao].metas;

/** O estado que a lição seguinte recebe — é o que a trava usa como solução de referência. */
export const ESTADO_DEPOIS: Record<LicaoDaCcEs013, ProjetoDeDados> = {
  proposta: DEPOIS_DA_PROPOSTA,
  base: DEPOIS_DA_BASE,
  grafia: DEPOIS_DA_GRAFIA,
  numeros: DEPOIS_DOS_NUMEROS,
  descritivas: DEPOIS_DAS_DESCRITIVAS,
  grupos: DEPOIS_DOS_GRUPOS,
  relacao: DEPOIS_DA_RELACAO,
  painel: DEPOIS_DO_PAINEL,
  conclusao: DEPOIS_DA_CONCLUSAO,
  apresentacao: DEPOIS_DA_APRESENTACAO,
  entrega: {
    ...DEPOIS_DA_APRESENTACAO,
    nuvem: {
      arquivos: NUVEM_DA_ENTREGA.arquivos.map(a => {
        if (a.id === PASTA_DA_ENTREGA) return { ...a, acessos: [{ quem: 'lideranca', papel: 'leitor' }] };
        if ([ARQUIVO_BRUTO, ARQUIVO_DA_ANALISE, ARQUIVO_DO_RELATORIO].includes(a.id)) return { ...a, pasta: PASTA_DA_ENTREGA };
        return a;
      }),
    },
  },
};
