/**
 * O projeto de dados da CC-ES013, sem tela nenhuma.
 *
 * ── O que esta vereda ensina que as anteriores não ──────────────────────
 * A CC-ES009 e a CC-ES010 entregam a base **fechada e arrumada**: o que se
 * produz lá é uma leitura dela, e mexer no dado é o atalho que as duas existem
 * para recusar. Aqui é o contrário, e é o requisito 4 inteiro: a base chega
 * como a exportação a deixou, e arrumá-la é o trabalho — com uma condição que
 * as outras não tinham como cobrar, que é **a bruta continuar bruta**. O
 * requisito 9 pede as duas na entrega, e só se entrega a base bruta de quem
 * limpou numa cópia.
 *
 * O resto é o que as três veredas exigidas já ensinaram, junto: as medidas e a
 * comparação de grupos da CC-ES009, a dispersão com a reta da CC-ES010, e a
 * apresentação de dez minutos da CC-ES011. O que se mede de novo é a costura —
 * uma pergunta que alguém fez antes de olhar o dado, e uma decisão que alguém
 * toma depois de ver a resposta.
 *
 * ── Uma fonte da verdade para o certo ────────────────────────────────────
 * Toda conferência da base tratada compara com `MEMBROS`, por pessoa, e não
 * por linha: ordenar a tratada é legítimo, e uma trava que lesse posição
 * reprovaria quem classificou por unidade para conferir a grafia.
 */

import {
  type Caderno, type Planilha, normalizar, planilhaPorNome,
} from './planilha';
import { numeroDoTexto, valorDoBruto } from './formulas';
import { unidadeCanonica } from './baseDoAcampamento';
import {
  type Coluna, type Membro, type TipoDeProblema,
  CABECALHO, COLUNAS, DEFEITOS, INDICE, MEMBROS, MODOS, NOME_DA_BRUTA,
  UNIDADES_DO_CLUBE, abaBruta, chaveDe, chaveDoMembro,
} from './chamadaDoClube';
import type { Nuvem } from './arquivoCompartilhado';

/* ── A proposta (requisito 2) ─────────────────────────────────────────────── */

export interface PropostaDeDados {
  /** A pergunta, como pergunta. */
  pergunta: string;
  /** De onde o dado vai sair — antes de existir. */
  origem: string;
  /** Quem vai tomar alguma decisão a partir do resultado. */
  quemDecide: string;
  /** Que decisão. Sem ela, "a diretoria" é um nome, e não um uso. */
  decisao: string;
  /** `AAAA-MM-DD`, ou `null` enquanto o examinador não aprovou. */
  aprovadaEm: string | null;
}

export const palavrasDe = (t: string): string[] =>
  t.trim().split(/\s+/).filter(p => /[\p{L}\p{N}]/u.test(p));

/**
 * Uma pergunta, e não um assunto.
 *
 * "A presença no clube" é um assunto, e com ele qualquer gráfico serve e
 * nenhum responde. O ponto de interrogação é a parte fácil; as quatro palavras
 * são o piso que separa "Presença?" de uma pergunta que alguém consegue
 * responder com um número.
 */
export const ehPergunta = (t: string) => t.trim().endsWith('?') && palavrasDe(t).length >= 4;

export const propostaCompleta = (p: PropostaDeDados): boolean =>
  ehPergunta(p.pergunta) && p.origem.trim().length >= 20
  && p.quemDecide.trim() !== '' && p.decisao.trim().length >= 20;

export const PROPOSTA_EM_BRANCO: PropostaDeDados = {
  pergunta: '', origem: '', quemDecide: '', decisao: '', aprovadaEm: null,
};

/* ── A base (requisito 3) ─────────────────────────────────────────────────── */

export const MINIMO_DE_REGISTROS = 60;
export const MINIMO_DE_CAMPOS = 5;

export type IdDaCandidata = 'inscricoes' | 'chamada' | 'chamada-2025' | 'deslocamento-df';

export interface CandidataDeBase {
  id: IdDaCandidata;
  arquivo: string;
  /** Como a fonte descreve o arquivo — que é tudo o que se sabe dele antes de abrir. */
  descricao: string;
  /** Linhas de dado, sem o cabeçalho. */
  registros: number;
  campos: string[];
  /** O período a que o dado se refere. Não é a data de obtenção. */
  periodo: string;
  /** Quando o arquivo chegou às mãos de quem vai analisar. */
  obtidaEm: string;
  publica: boolean;
}

/**
 * As quatro bases que estavam ao alcance.
 *
 * Cada uma das três erradas falha por um motivo diferente, e é por isso que
 * são três: a do acampamento é a conhecida e tem quarenta e oito — e é a que
 * quem fez a CC-ES009 vai querer reaproveitar; a da chamada do ano passado
 * tem registros de sobra e três campos; a pública é a mais "oficial" e fala do
 * Distrito Federal inteiro, e não de quem falta ao clube. Uma lista em que só
 * o tamanho reprovasse ensinaria que tamanho é o critério, e o critério que
 * pesa mais é a base **responder à pergunta**.
 *
 * O período e a data de obtenção da certa estão os dois escritos, porque são
 * as duas datas que se confundem: o dado é de fevereiro a julho, e chegou em
 * agosto. O requisito pede a segunda.
 */
export const CANDIDATAS: CandidataDeBase[] = [
  {
    id: 'inscricoes',
    arquivo: 'Inscrições do acampamento 2026.xlsx',
    descricao: 'As respostas do formulário de inscrição do acampamento, já arrumadas na CC-ES008.',
    registros: 48,
    campos: ['Enviado em', 'Nome', 'Unidade', 'E-mail do responsável', 'Diárias', 'Idade', 'Altura', 'Camiseta', 'Alimentação', 'Acampamentos', 'Observação'],
    periodo: 'maio e junho de 2026',
    obtidaEm: '2026-06-20',
    publica: false,
  },
  {
    id: 'chamada',
    arquivo: 'chamada_1sem_2026.xlsx',
    descricao: 'A chamada das vinte reuniões do semestre, exportada pela secretaria, cruzada com o questionário de transporte que as famílias responderam em junho.',
    registros: 62,
    campos: COLUNAS.map(c => CABECALHO[c]),
    periodo: 'fevereiro a julho de 2026',
    obtidaEm: '2026-08-03',
    publica: false,
  },
  {
    id: 'chamada-2025',
    arquivo: 'chamada_2sem_2025.xlsx',
    descricao: 'A chamada do segundo semestre do ano passado, do sistema antigo da secretaria.',
    registros: 66,
    campos: ['Nome', 'Unidade', 'Presenças'],
    periodo: 'agosto a dezembro de 2025',
    obtidaEm: '2026-01-15',
    publica: false,
  },
  {
    id: 'deslocamento-df',
    arquivo: 'tempo_de_deslocamento_RAs.csv',
    descricao: 'Pesquisa pública do governo do Distrito Federal: tempo médio de deslocamento por região administrativa.',
    registros: 33,
    campos: ['Região', 'População', 'Tempo médio (min)', 'Usa ônibus (%)', 'Usa carro (%)', 'Anda a pé (%)'],
    periodo: '2024',
    obtidaEm: '2026-07-28',
    publica: true,
  },
];

export const candidata = (id: IdDaCandidata) => CANDIDATAS.find(c => c.id === id)!;

/** A base cumpre o mínimo de tamanho do requisito 3 — o tamanho, e só ele. */
export const cumpreOMinimo = (c: CandidataDeBase) =>
  c.registros >= MINIMO_DE_REGISTROS && c.campos.length >= MINIMO_DE_CAMPOS;

/**
 * Responde à pergunta da proposta: tem a presença de cada um **e** o que se
 * suspeita que a explique, na mesma linha.
 *
 * Está declarado, e não adivinhado pelo nome das colunas, pela razão de sempre:
 * ler "Presenças" no cabeçalho como prova de que a base serve seria máquina
 * frágil, e a chamada do ano passado tem a coluna e não serve.
 */
export const RESPONDE_A_PERGUNTA: Record<IdDaCandidata, boolean> = {
  inscricoes: false,
  chamada: true,
  'chamada-2025': false,
  'deslocamento-df': false,
};

export interface FichaDaBase {
  base: IdDaCandidata | null;
  /** De onde veio, escrito por quem vai declarar. */
  origem: string;
  /** Como a pessoa escreveu — `DD/MM/AAAA` ou `AAAA-MM-DD`. */
  obtidaEm: string;
}

export const FICHA_EM_BRANCO: FichaDaBase = { base: null, origem: '', obtidaEm: '' };

/**
 * A data escrita, como `AAAA-MM-DD`, ou `null`.
 *
 * Aceita as duas formas que se escrevem aqui — a do calendário brasileiro e a
 * do campo de data do navegador — e recusa o que não existe: 31/02 não vira
 * 3 de março, que é o que `new Date` faria calado.
 */
export function dataEscrita(t: string): string | null {
  const s = t.trim();
  let d: number; let m: number; let a: number;
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (br) [d, m, a] = [Number(br[1]), Number(br[2]), Number(br[3])];
  else if (iso) [a, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else return null;
  const dia = new Date(Date.UTC(a, m - 1, d));
  if (dia.getUTCFullYear() !== a || dia.getUTCMonth() !== m - 1 || dia.getUTCDate() !== d) return null;
  return `${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/* ── A base tratada, lida por pessoa ──────────────────────────────────────── */

export type ValoresDaLinha = Record<Coluna, string>;

/**
 * As linhas de dado de uma aba da base, sem o cabeçalho e sem linha vazia.
 *
 * Lê pela tabela declarada quando ela existe, e as seis primeiras colunas
 * sempre: o que alguém escrever ao lado da base — uma conta solta, uma
 * anotação — não é registro. Linha inteiramente vazia não é registro também,
 * e é o que sobra embaixo depois de excluir uma linha no meio.
 */
export function linhasDa(p: Planilha): ValoresDaLinha[] {
  const t = p.tabela ? normalizar(p.tabela) : { topo: 0, base: p.celulas.length - 1 };
  const linhas: ValoresDaLinha[] = [];
  for (let l = t.topo + 1; l <= Math.min(t.base, p.celulas.length - 1); l++) {
    const v = Object.fromEntries(COLUNAS.map(c => [c, (p.celulas[l]?.[INDICE[c]]?.texto ?? '').trim()])) as ValoresDaLinha;
    if (COLUNAS.some(c => v[c] !== '')) linhas.push(v);
  }
  return linhas;
}

/** A pessoa que a linha designa, com a unidade passada pela lista. */
export const chaveDaLinha = (v: ValoresDaLinha) =>
  chaveDe(v.nome, unidadeCanonica(v.unidade) ?? v.unidade);

const CHAVES = new Set(MEMBROS.map(chaveDoMembro));

/** Quantas vezes cada pessoa aparece. */
function contagemPorPessoa(linhas: ValoresDaLinha[]): Map<string, number> {
  const n = new Map<string, number>();
  for (const v of linhas) n.set(chaveDaLinha(v), (n.get(chaveDaLinha(v)) ?? 0) + 1);
  return n;
}

/**
 * A aba que faz as vezes de base tratada: a primeira que não é a bruta e que
 * começa como a base começa — "Nome" em A1.
 *
 * Achada pelo começo da base, e não pelo nome da aba: o requisito não diz como
 * ela se chama, e uma trava que exigisse "Tratada" reprovaria quem a chamou de
 * "Base limpa". O que se exige do nome é outra conta, em `nomeDizOQueE`.
 *
 * E não pelo cabeçalho inteiro, de propósito. "Distância (km)" também tem
 * "km", e quem seleciona a coluna pelo cabeçalho para tirar o "km" dos números
 * tira o do título junto — é o que o Excel faz. Exigir o cabeçalho inteiro
 * faria a aba deixar de ser reconhecida, e todas as metas da lição apagariam
 * sem nada na tela explicando; a conta do cabeçalho mora em `cabecalhoIntacto`,
 * que diz o que aconteceu.
 */
export function abaTratada(cad: Caderno): Planilha | null {
  return cad.planilhas.find(p => p.nome !== NOME_DA_BRUTA
    && (p.celulas[0]?.[INDICE.nome]?.texto ?? '').trim() === CABECALHO.nome) ?? null;
}

/** O cabeçalho da aba continua o da base, coluna por coluna. */
export const cabecalhoIntacto = (p: Planilha) =>
  COLUNAS.every(c => (p.celulas[0]?.[INDICE[c]]?.texto ?? '').trim() === CABECALHO[c]);

/**
 * O nome da cópia diz o que ela é.
 *
 * "Bruta (2)" é o nome que o Excel dá, e entregar a base tratada com ele é
 * entregar duas abas que se chamam bruta. A conta é só essa: renomeada para
 * qualquer coisa que não diga "bruta".
 */
export const nomeDizOQueE = (p: Planilha) => !/bruta/i.test(p.nome);

/* ── A bruta continua bruta ───────────────────────────────────────────────── */

const textos = (p: Planilha): string[][] => p.celulas.map(l => l.map(c => c.texto));

/**
 * A bruta está como chegou: mesmas células, mesmo texto, nada a mais.
 *
 * Compara a grade inteira, e não só a tabela: uma conta escrita ao lado da
 * bruta também a deixa de ser bruta, e é o primeiro lugar em que alguém
 * escreve uma `CONT.VALORES` para conferir os sessenta registros.
 *
 * Ordenar a bruta também reprova, e é de propósito: a ordem da exportação é
 * parte do que ela é — é por ela que se acha a linha repetida logo depois do
 * Leonardo, e é ela que outra pessoa vai comparar com o sistema da secretaria.
 */
export function brutaIntacta(cad: Caderno): boolean {
  const b = planilhaPorNome(cad, NOME_DA_BRUTA);
  if (!b) return false;
  const original = textos(abaBruta());
  const agora = textos(b);
  const linhas = Math.max(original.length, agora.length);
  for (let l = 0; l < linhas; l++) {
    const colunas = Math.max(original[l]?.length ?? 0, agora[l]?.length ?? 0);
    for (let c = 0; c < colunas; c++) {
      if ((original[l]?.[c] ?? '') !== (agora[l]?.[c] ?? '')) return false;
    }
  }
  return true;
}

/* ── As conferências da limpeza ───────────────────────────────────────────── */

const membroDa = (chave: string): Membro | undefined => MEMBROS.find(m => chaveDoMembro(m) === chave);

/** Toda linha tem a unidade escrita como a lista a escreve. */
export const unidadesPadronizadas = (linhas: ValoresDaLinha[]) =>
  linhas.length > 0 && linhas.every(v => UNIDADES_DO_CLUBE.includes(v.unidade));

/** Todo transporte escrito é um dos quatro do questionário, escrito como lá. */
export const modosPadronizados = (linhas: ValoresDaLinha[]) =>
  linhas.length > 0 && linhas.every(v => v.modo === '' || (MODOS as string[]).includes(v.modo));

/** Cada uma das sessenta e uma pessoas está na base pelo menos uma vez. */
export const todoMundoNaBase = (linhas: ValoresDaLinha[]) => {
  const n = contagemPorPessoa(linhas);
  return [...CHAVES].every(k => (n.get(k) ?? 0) >= 1);
};

/**
 * A linha repetida saiu, e só ela.
 *
 * Sessenta e uma linhas, cada pessoa uma vez: as duas Ana Clara Ribeiro
 * continuam, porque são duas pessoas. Remover duplicata olhando só o nome
 * também deixa "cada nome uma vez" verdadeiro — e o clube com uma desbravadora
 * a menos.
 */
export function semRepetida(linhas: ValoresDaLinha[]): boolean {
  const n = contagemPorPessoa(linhas);
  return linhas.length === MEMBROS.length && [...CHAVES].every(k => n.get(k) === 1);
}

/** O valor de uma coluna como a base certa o tem, escrito como célula. */
function esperado(m: Membro, coluna: Coluna): number | string | null {
  switch (coluna) {
    case 'nome': return m.nome;
    case 'unidade': return m.unidade;
    case 'idade': return m.idade;
    case 'modo': return m.modo;
    case 'distancia': return m.distancia;
    case 'presencas': return m.presencas;
    default: {
      const nunca: never = coluna;
      return nunca;
    }
  }
}

/**
 * A célula diz o que a base certa diz.
 *
 * A linha precisa designar alguém que existe, e é aí que cai o Pedro Aguiar:
 * substituir "aguia" sem "célula inteira" e com a planilha toda no alcance o
 * transforma em Pedro Águiar, ninguém no clube se chama assim, e a coluna
 * inteira deixa de conferir — com a contagem de trocas que o Excel devolve
 * parecendo exatamente a esperada.
 *
 * Número se compara como número **lido pela planilha**, e não como texto:
 * `3,5` e `3,50` são o mesmo valor, e `3.5` não é valor nenhum — é texto, e a
 * `MÉDIA` o pula. Vazio esperado só aceita vazio, que é a trava de quem
 * preenche a ausência com a média da coluna.
 */
export function celulaCerta(texto: string, m: Membro, coluna: Coluna): boolean {
  const e = esperado(m, coluna);
  if (e === null) return texto === '';
  if (typeof e === 'number') {
    const v = valorDoBruto(texto);
    return v.tipo === 'numero' && Math.abs(v.n - e) < 1e-9;
  }
  return texto === e;
}

/** Toda linha da base tem a coluna certa, pessoa por pessoa. */
export function colunaCerta(linhas: ValoresDaLinha[], coluna: Coluna): boolean {
  if (linhas.length === 0) return false;
  return linhas.every(v => {
    const m = membroDa(chaveDaLinha(v));
    return m !== undefined && celulaCerta(v[coluna], m, coluna);
  });
}

/** Os defeitos de um tipo, numa coluna, estão todos consertados como deviam. */
export function defeitosConsertados(
  linhas: ValoresDaLinha[], tipo: TipoDeProblema, coluna: Coluna,
): boolean {
  const alvo = DEFEITOS.filter(d => d.tipo === tipo && d.coluna === coluna);
  return alvo.length > 0 && alvo.every(d => {
    const m = membroDa(d.chave)!;
    const achadas = linhas.filter(v => chaveDaLinha(v) === d.chave);
    return achadas.length > 0 && achadas.every(v => celulaCerta(v[coluna], m, coluna));
  });
}

/** Toda célula preenchida da coluna é número para a planilha. */
export const colunaNumerica = (linhas: ValoresDaLinha[], coluna: Coluna) =>
  linhas.length > 0 && linhas.every(v => v[coluna] === '' || numeroDoTexto(v[coluna]) !== null);

/**
 * Quem não respondeu ao questionário continua na base, com as duas colunas
 * dele em branco.
 *
 * As duas coisas, e nenhuma substitui a outra. Excluir a linha derruba a base
 * para cinquenta e sete e joga fora a presença dessas quatro pessoas, que a
 * chamada tem e vale. Preencher com a média da coluna inventa quatro
 * distâncias que ninguém mediu — e todas iguais, que é o que encolhe o desvio
 * padrão e deixa a reta mais confiante do que o dado.
 */
export function ausenciasDePe(linhas: ValoresDaLinha[]): boolean {
  const semQuestionario = MEMBROS.filter(m => m.modo === null);
  return semQuestionario.length > 0 && semQuestionario.every(m => {
    const achadas = linhas.filter(v => chaveDaLinha(v) === chaveDoMembro(m));
    return achadas.length > 0 && achadas.every(v => v.modo === '' && v.distancia === '');
  });
}

/* ── O diário de limpeza (o "documentar" do requisito 4) ──────────────────── */

export type ColunaDoDiario = Coluna | 'linha';

export const NOME_DA_COLUNA_DO_DIARIO: Record<ColunaDoDiario, string> = {
  ...CABECALHO,
  linha: 'A linha inteira',
};

export interface DecisaoDeLimpeza {
  id: string;
  problema: TipoDeProblema | null;
  coluna: ColunaDoDiario | null;
  /** O que foi feito e por quê. */
  texto: string;
}

/**
 * O piso de uma decisão escrita.
 *
 * A plataforma não lê português, e o que ela pode cobrar é que haja frase: é a
 * conta dos campos escritos da CC-ES009 e da CC-ES010. Uma decisão de limpeza
 * tem duas metades — o que se fez e por quê —, e sessenta caracteres é onde as
 * duas começam a caber.
 */
export const DECISAO_MINIMA = 60;

/** O diário tem uma decisão escrita para este problema nesta coluna. */
export const documentado = (diario: DecisaoDeLimpeza[], problema: TipoDeProblema, colunas: ColunaDoDiario[]) =>
  diario.some(d => d.problema === problema && d.coluna !== null && colunas.includes(d.coluna)
    && d.texto.trim().length >= DECISAO_MINIMA);

/* ── A conclusão (requisito 7) ────────────────────────────────────────────── */

export interface Conclusao {
  mostram: string;
  naoPermitem: string;
  recomendacao: string;
}

/**
 * Quantas palavras cabem numa página.
 *
 * Numa folha A4 com fonte de corpo de onze pontos cabem perto de quinhentas
 * palavras de texto corrido; a conclusão tem três títulos e espaço entre as
 * partes, e quatrocentas e cinquenta é a conta que não promete duas páginas a
 * quem vai entregar três.
 */
export const PALAVRAS_POR_PAGINA = 450;
export const PAGINAS_DA_CONCLUSAO = 2;

export const palavrasDaConclusao = (c: Conclusao) =>
  palavrasDe(c.mostram).length + palavrasDe(c.naoPermitem).length + palavrasDe(c.recomendacao).length;

export const paginasDaConclusao = (c: Conclusao) =>
  Math.max(1, Math.ceil(palavrasDaConclusao(c) / PALAVRAS_POR_PAGINA));

export const cabeEmDuasPaginas = (c: Conclusao) =>
  palavrasDaConclusao(c) <= PALAVRAS_POR_PAGINA * PAGINAS_DA_CONCLUSAO;

/** Tem algum número escrito — com dígito, que é como um resultado se cita. */
export const citaNumero = (t: string) => /\d/.test(t);

/* ── A apresentação (requisito 8) ─────────────────────────────────────────── */

export const MINUTOS_DA_APRESENTACAO = 10;

/**
 * Para quem se apresenta.
 *
 * As três primeiras são o público que o requisito nomeia — diretoria, unidade,
 * conselho. As outras duas são quem ouviria com gosto e não decide nada no
 * clube, e é a diferença inteira: a apresentação existe para alguém **fazer**
 * alguma coisa com o resultado, e é por isso que a proposta pergunta, lá no
 * módulo 1, quem vai decidir.
 */
export type Publico = 'diretoria' | 'unidade' | 'conselho' | 'familia' | 'escola';

export const PUBLICOS_DO_CLUBE: Publico[] = ['diretoria', 'unidade', 'conselho'];

export const NOME_DO_PUBLICO: Record<Publico, string> = {
  diretoria: 'A diretoria do clube',
  unidade: 'Uma unidade, com o conselheiro',
  conselho: 'O conselho de conselheiros',
  familia: 'A família, em casa',
  escola: 'A turma da escola',
};

export interface BlocoDoRoteiro {
  id: string;
  rotulo: string;
  minutos: number;
}

export interface RegistroDaApresentacao {
  /** Quando se apresentou, como a pessoa escreveu. */
  data: string;
  /** Quem estava. */
  quem: string;
  /** A decisão tomada, ou a reação — o que aconteceu, e não o que se esperava. */
  texto: string;
}

export interface Roteiro {
  publico: Publico | null;
  blocos: BlocoDoRoteiro[];
  registro: RegistroDaApresentacao;
}

export const minutosDoRoteiro = (r: Roteiro) => r.blocos.reduce((s, b) => s + b.minutos, 0);

/* ── O projeto inteiro ────────────────────────────────────────────────────── */

export interface ProjetoDeDados {
  proposta: PropostaDeDados;
  ficha: FichaDaBase;
  /** A pasta de trabalho: a bruta, a tratada e as abas de conta. */
  caderno: Caderno;
  diario: DecisaoDeLimpeza[];
  /** O que se escreveu no caderno da análise, por chave. */
  textos: Record<string, string>;
  /** As escolhas do caderno da análise, por chave. */
  escolhas: Record<string, string>;
  conclusao: Conclusao;
  roteiro: Roteiro;
  nuvem: Nuvem;
}
