/**
 * O que cada lição da CC-ES012 cobra, e de que estado do conjunto ela parte.
 *
 * Mora fora do componente e fora da trava, como o `PASTAS_DA_CC_ES004`, o mapa
 * dos cadernos da CC-ES003 e o `LICOES_DA_CC_ES011`, e pelo motivo escrito nos
 * três: quem lê é a tela, que monta a lição, **e** a trava, que confere que
 * nenhuma meta abre verde. Escrito só na trava, a tela repetiria a escolha e as
 * duas divergiriam na primeira lição nova — com a trava continuando verde
 * conferindo uma lição que a tela não abre.
 *
 * ── Cada lição parte de onde a anterior acabou ───────────────────────────
 * O módulo 2 recebe o conjunto com a proposta aprovada; o módulo 5 recebe a
 * planilha já calculando e o formulário já arrumado. Começar a lição seguinte
 * mandando refazer a anterior ensinaria que o trabalho anterior não conta, e
 * as metas do módulo 1 apareceriam cumpridas ou não ao acaso. É o campo
 * `documento` da CC-ES002 e o `caderno` da CC-ES003 outra vez.
 *
 * Onde a mudança é **mecânica** — aplicar a identidade, trocar o tipo de um
 * campo, importar as respostas —, o estado se deriva chamando a função que a
 * lição chamaria: derivar não tem como divergir do que a lição faz. Onde a
 * mudança **é o texto** — a seção que aponta para as outras peças, as
 * instruções do ano que vem —, ele está escrito, porque não há de onde derivar
 * prosa.
 */

import { type Apresentacao } from './apresentacao';
import {
  type Nuvem,
  compartilhar, gravarVersao, tirarAcessoDoArquivo, transferirPropriedade,
} from './arquivoCompartilhado';
import {
  type Bloco, type Doc, paragrafos, sumarioAtualizado, titulosDoDoc,
} from './documento';
import { type DocumentoPdf, type Pagina, ehPesquisavel, juntar } from './documentoPdf';
import { type Formulario } from './formulario';
import { ehNumero } from './formulas';
import { type Caderno, type Planilha, planilhaPorNome, valorDe } from './planilha';
import {
  ARQUIVO_DA_APRESENTACAO, ARQUIVO_DO_CONTROLE,
  ARQUIVO_DO_REGULAMENTO, CAMPO_QUANTOS,
  CAMPO_RESPONSAVEL, CAMPOS_ARRUMADOS, CUSTO_POR_UNIDADE, EQUIPE_DA_FEIRA,
  GRAFICO_DA_FEIRA, IDENTIDADE_DA_FEIRA, INSCRICOES_DA_FEIRA,
  LINHA_DAS_UNIDADES, LINHA_DO_CUSTO, LINHA_DO_TOTAL, LINHA_DOS_DESBRAVADORES,
  OUTRA_PESSOA, PASTA_DA_DIVULGACAO, PASTA_DA_SECRETARIA, PASTA_DA_TESOURARIA,
  PASTA_RAIZ, PASTAS_DA_FEIRA, PROJETO_DA_FEIRA, RESPOSTAS_DA_FEIRA,
  type SecaoDoRegulamento,
} from './projetoDaFeira';
import {
  type ProjetoDocumental, type TipoDePeca,
  NOME_DA_ABA_DE_CONTROLE, NOME_DA_ABA_DE_RESPOSTAS, PECAS_DE_DISTRIBUICAO,
  acessosForaDaFuncao, acompanhaAFonte, dentroDoTempo, importarRespostas,
  instrucoesCompletas, numerosDesatualizados, pastasForaDoPadrao,
  pecasComColaboracao, pecasForaDaIdentidade, propostaCompleta,
  respostasQueFaltam, textoComoSeLe,
} from './projetoDocumental';

/* ── A lição, e o que viaja com ela ───────────────────────────────────────── */

export type LicaoDaCcEs012 =
  | 'proposta' | 'documento' | 'planilha' | 'formulario' | 'importar'
  | 'apresentacao' | 'dossie' | 'repositorio' | 'instrucoes' | 'quinze-minutos';

/**
 * Em que programa a lição **começa**.
 *
 * Começa, e não acontece: o módulo 5 parte do construtor de formulários e
 * termina na planilha, que é onde se vê se a importação funcionou — é o
 * arranjo da CC-ES008, escrito lá. `plataforma` é tela da plataforma, para as
 * duas lições que não imitam programa nenhum.
 */
export type ProgramaDaLicao =
  | 'word' | 'excel' | 'formulario' | 'powerpoint' | 'pdf' | 'nuvem' | 'plataforma';

export interface ContextoDoProjeto {
  p: ProjetoDocumental;
  /**
   * Apertou "começar a montar" antes de a proposta ser aprovada.
   *
   * O requisito 2 diz que a execução **não pode ser iniciada** antes da
   * aprovação, e sem este campo isso seria uma frase do enunciado sem nada
   * por trás: a meta leria só "está aprovada?", e construir tudo antes e pedir
   * aprovação depois fecharia a lição. O caminho errado existe e está a um
   * clique, que é a única forma de a ordem significar alguma coisa.
   */
  comecouAntes: boolean;
  /**
   * O que a pessoa viu acontecer.
   *
   * Fica no contexto da lição, e não no conjunto: o que aconteceu foi com quem
   * estuda, e não com os arquivos. É a decisão de `descobertas` da CC-ES004,
   * escrita lá.
   */
  descobertas: string[];
}

export const CHAVE_DA_PROPAGACAO = 'viu-o-dado-chegar-nas-outras-pecas';
export const CHAVE_DO_DOSSIE_VELHO = 'viu-o-dossie-nao-mudar';

export const contextoDe = (p: ProjetoDocumental): ContextoDoProjeto =>
  ({ p, comecouAntes: false, descobertas: [] });

/* ── Derivações: o documento ──────────────────────────────────────────────── */

/** O regulamento vestido com a identidade do conjunto. */
export const comIdentidadeNoDocumento = (d: Doc<string>): Doc<string> => ({
  ...d,
  fonte: 'sem-serifa',
  estilos: { ...d.estilos, 'Título 1': { ...d.estilos?.['Título 1'], cor: IDENTIDADE_DA_FEIRA.cor } },
});

/** O id da seção que aponta para as outras quatro peças. */
export const BLOCO_DO_MAPA = 'b-mapa';

/**
 * A seção "Onde está cada peça", escrita.
 *
 * Escrita e não derivada, porque é prosa. Ela nomeia as quatro outras peças e
 * diz onde cada uma mora — que é o que faz o regulamento ser a porta do
 * conjunto em vez de um arquivo que por acaso está na mesma pasta.
 */
export const BLOCOS_DO_MAPA: Bloco<SecaoDoRegulamento>[] = [
  {
    id: 'b-h-mapa', secao: 'datas', tipo: 'paragrafo', estilo: 'Título 1',
    trechos: [{ id: 'b-h-mapa-a', texto: 'Onde está cada peça', posicao: 'normal', realce: 'nenhum', enfase: false }],
  },
  {
    id: BLOCO_DO_MAPA, secao: 'datas', tipo: 'paragrafo', estilo: 'Normal',
    trechos: [{
      id: 'b-mapa-a',
      texto: 'A inscrição é o formulário da secretaria, e o link dele vai na '
        + 'circular. As respostas caem na planilha de controle, na pasta da '
        + 'tesouraria, que é de onde saem os números deste regulamento. A '
        + 'apresentação de divulgação fica na pasta da divulgação, e o dossiê '
        + 'em PDF reúne este regulamento e a apresentação para as famílias.',
      posicao: 'normal', realce: 'nenhum', enfase: false,
    }],
  },
];

/** O regulamento com a seção do mapa e o sumário refeito. */
export function comMapaDasPecas(d: Doc<string>): Doc<string> {
  const comBlocos = { ...d, blocos: [...d.blocos, ...BLOCOS_DO_MAPA] };
  /* O sumário se refaz aqui porque mandar atualizá-lo é o gesto que acompanha
     a seção nova — e porque ele guarda o que leu, pela razão da CC-ES002. */
  return { ...comBlocos, sumario: titulosDoDoc(comBlocos) };
}

/* ── Derivações: a planilha ───────────────────────────────────────────────── */

const trocarCelula = (
  pl: Planilha, linha: number, coluna: number, mudar: (texto: string) => string,
): Planilha => ({
  ...pl,
  celulas: pl.celulas.map((l, i) => (i === linha
    ? l.map((c, j) => (j === coluna ? { ...c, texto: mudar(c.texto) } : c)) : l)),
});

const trocarAba = (cad: Caderno, nome: string, mudar: (pl: Planilha) => Planilha): Caderno => ({
  ...cad,
  planilhas: cad.planilhas.map(pl => (pl.nome === nome ? mudar(pl) : pl)),
});

/** O total de material passa a ser fórmula sobre as unidades e o custo. */
export const comTotalEmFormula = (cad: Caderno): Caderno =>
  trocarAba(cad, NOME_DA_ABA_DE_CONTROLE, pl =>
    trocarCelula(pl, LINHA_DO_TOTAL, 1, () => `=B${LINHA_DAS_UNIDADES + 1}*B${LINHA_DO_CUSTO + 1}`));

/** A célula do título da aba de controle recebe a cor do conjunto. */
export const comCorNaPlanilha = (cad: Caderno): Caderno =>
  trocarAba(cad, NOME_DA_ABA_DE_CONTROLE, pl => ({
    ...pl,
    celulas: pl.celulas.map((l, i) => (i === 0
      ? l.map((c, j) => (j === 0 ? { ...c, cor: IDENTIDADE_DA_FEIRA.cor } : c)) : l)),
  }));

/** A última linha que a faixa das respostas alcança. Ver `FAIXA_DAS_RESPOSTAS`. */
export const ULTIMA_LINHA_DAS_RESPOSTAS = 20;

/**
 * As duas contas passam a ler a aba de respostas.
 *
 * A faixa vai até a linha 20, e não até a última resposta de hoje: inscrição
 * nova entra numa linha que a fórmula já alcança. Uma faixa que terminasse na
 * sexta resposta daria o número certo hoje e pararia de crescer — que é o
 * mesmo defeito do número digitado, com cara de fórmula.
 */
export const comContasSobreAsRespostas = (cad: Caderno): Caderno =>
  trocarAba(cad, NOME_DA_ABA_DE_CONTROLE, pl => trocarCelula(
    trocarCelula(pl, LINHA_DAS_UNIDADES, 1,
      () => `=CONT.VALORES(${NOME_DA_ABA_DE_RESPOSTAS}!B2:B${ULTIMA_LINHA_DAS_RESPOSTAS})`),
    LINHA_DOS_DESBRAVADORES, 1,
    () => `=SOMA(${NOME_DA_ABA_DE_RESPOSTAS}!D2:D${ULTIMA_LINHA_DAS_RESPOSTAS})`,
  ));

/* ── Derivações: o formulário ─────────────────────────────────────────────── */

/** O formulário arrumado: campos separados, tipo certo, e o tema do conjunto. */
export const comFormularioArrumado = (f: Formulario): Formulario => ({
  ...f,
  campos: CAMPOS_ARRUMADOS,
  aparencia: { fonte: IDENTIDADE_DA_FEIRA.fonteDosTitulos, cor: IDENTIDADE_DA_FEIRA.cor },
  /* As respostas chegam depois de os campos estarem certos, que é a ordem que
     a lição ensina: formulário aberto com o campo errado coleta resposta
     errada, e trocar o campo depois não conserta o que já entrou. */
  respostas: RESPOSTAS_DA_FEIRA.map(r => ({
    ...r,
    valores: {
      unidade: r.valores['unidade-e-especialidade'].split(' — ')[0],
      especialidade: r.valores['unidade-e-especialidade'].split(' — ')[1] ?? '',
      [CAMPO_QUANTOS]: String(
        INSCRICOES_DA_FEIRA.find(i => i.unidade === r.valores['unidade-e-especialidade'].split(' — ')[0])?.quantos
        ?? 0),
      [CAMPO_RESPONSAVEL]: r.valores[CAMPO_RESPONSAVEL],
    },
  })),
});

/* ── Derivações: a apresentação ───────────────────────────────────────────── */

export const comIdentidadeNoMestre = (a: Apresentacao): Apresentacao => ({
  ...a,
  mestre: {
    ...a.mestre,
    fonteDoTitulo: IDENTIDADE_DA_FEIRA.fonteDosTitulos,
    fonteDoCorpo: IDENTIDADE_DA_FEIRA.fonteDoCorpo,
    corDoTitulo: IDENTIDADE_DA_FEIRA.cor,
  },
});

/** O gráfico passa a ler a planilha, e o retrato dele se refaz com as seis. */
export const comGraficoVinculado = (a: Apresentacao): Apresentacao => ({
  ...a,
  slides: a.slides.map(s => (s.grafico?.id === GRAFICO_DA_FEIRA
    ? {
      ...s,
      grafico: {
        ...s.grafico,
        como: 'vinculado' as const,
        retrato: INSCRICOES_DA_FEIRA.map(i => ({ rotulo: i.unidade, valor: i.quantos })),
      },
    }
    : s)),
});

/* ── Derivações: o dossiê ─────────────────────────────────────────────────── */

const paginaDigital = (id: string, origem: string, linhas: string[]): Pagina =>
  ({ id, origem, linhas, texto: linhas.join('\n') });

/**
 * O regulamento exportado em PDF.
 *
 * Páginas digitais, com a camada de texto: exportar do editor produz PDF
 * pesquisável, e é esse o caminho certo. Quem digitaliza o regulamento
 * impresso recebe imagem — é a CC-ES004, e aqui aparece como o que não
 * fazer.
 */
export const pdfDoRegulamento = (p: ProjetoDocumental): DocumentoPdf => ({
  nome: 'regulamento-da-feira-2026-07-20-v01',
  /* `textoComoSeLe`, e não `textoDoBloco`: o PDF guarda o que a folha mostra.
     Gerado do texto digitado, ele sairia com o número de ontem **mesmo depois**
     de o vínculo estar funcionando — um dossiê errado ao lado de um conjunto
     certo, que é a pior forma de aparecer. */
  paginas: [paginaDigital('p-reg', 'regulamento', textoComoSeLe(p))],
  campos: [], anotacoes: [], geradoDe: 'texto',
});

export const pdfDaApresentacao = (a: Apresentacao): DocumentoPdf => ({
  nome: 'feira-divulgacao-2026-07-20-v01',
  paginas: a.slides.map(s =>
    paginaDigital(`p-${s.id}`, 'apresentacao', [s.titulo, ...s.topicos])),
  campos: [], anotacoes: [], geradoDe: 'apresentacao',
});

/** A planilha exportada — a peça que **não** é de distribuição. */
export const pdfDoControle = (cad: Caderno): DocumentoPdf => {
  const aba = planilhaPorNome(cad, NOME_DA_ABA_DE_CONTROLE);
  return {
    nome: 'controle-da-feira-2026-07-20-v01',
    paginas: [paginaDigital('p-ctrl', 'controle',
      (aba?.celulas ?? []).slice(0, 8).map(l => l.map(c => c.texto).join(' ')))],
    campos: [], anotacoes: [], geradoDe: 'planilha',
  };
};

export const DOSSIE_DAS_DUAS = (p: ProjetoDocumental): DocumentoPdf =>
  juntar([pdfDoRegulamento(p), pdfDaApresentacao(p.apresentacao)],
    'dossie-da-feira-2026-07-20-v01');

/**
 * As origens que o dossiê carrega.
 *
 * `juntar` guarda a origem de cada página, e é por ela que se sabe o que
 * entrou — contar páginas não serve, porque a mesma peça juntada duas vezes
 * daria o número certo sem ter reunido nada. É a decisão da CC-ES004.
 */
export const origensDoDossie = (d: DocumentoPdf | null): string[] =>
  [...new Set((d?.paginas ?? []).map(pg => pg.origem))];

/* ── Derivações: o repositório ────────────────────────────────────────────── */

/** Os quatro nomes de pasta no molde da CC-ES001: um só, com data e versão. */
export const NOMES_DAS_PASTAS: Record<string, string> = {
  [PASTA_RAIZ]: 'feira-de-especialidades-2026-07-02-v01',
  [PASTA_DA_SECRETARIA]: 'secretaria-da-feira-2026-07-02-v01',
  [PASTA_DA_TESOURARIA]: 'tesouraria-da-feira-2026-07-02-v01',
  [PASTA_DA_DIVULGACAO]: 'divulgacao-da-feira-2026-07-02-v01',
};

export const comPastasNoPadrao = (n: Nuvem): Nuvem => ({
  ...n,
  arquivos: n.arquivos.map(a => (NOMES_DAS_PASTAS[a.id] ? { ...a, nome: NOMES_DAS_PASTAS[a.id] } : a)),
});

/** Cada pasta com exatamente quem exerce a função dela, e o mínimo que ela pede. */
export function comAcessoPorFuncao(n: Nuvem): Nuvem {
  let saida = n;
  for (const pasta of PASTAS_DA_FEIRA) {
    const daFuncao = EQUIPE_DA_FEIRA.filter(e => e.funcao === pasta.funcao).map(e => e.quem);
    const arquivo = saida.arquivos.find(a => a.id === pasta.id);
    for (const ac of arquivo?.acessos ?? []) {
      if (!daFuncao.includes(ac.quem)) saida = tirarAcessoDoArquivo(saida, pasta.id, ac.quem);
    }
    for (const quem of daFuncao) saida = compartilhar(saida, pasta.id, quem, pasta.minimo);
  }
  return saida;
}

/** A outra pessoa escreve numa peça, que é o que o histórico comprova. */
export function comColaboracaoNoHistorico(n: Nuvem): Nuvem {
  const comAcesso = compartilhar(n, ARQUIVO_DO_REGULAMENTO, OUTRA_PESSOA, 'editor');
  return gravarVersao(comAcesso, ARQUIVO_DO_REGULAMENTO, '2026-07-10', [OUTRA_PESSOA]);
}

/** As três peças passam para a conta da diretoria, que é a que fica no clube. */
export function comConjuntoNaContaDoClube(n: Nuvem): Nuvem {
  let saida = n;
  for (const id of [ARQUIVO_DO_REGULAMENTO, ARQUIVO_DO_CONTROLE, ARQUIVO_DA_APRESENTACAO]) {
    saida = transferirPropriedade(saida, id, 'lideranca');
  }
  return saida;
}

/* ── As instruções do ano que vem ─────────────────────────────────────────── */

export const INSTRUCOES_ESCRITAS = {
  porOndeComecar:
    'Abra o regulamento primeiro: a seção "Onde está cada peça" diz onde mora '
    + 'cada uma das outras quatro.',
  oQueTrocarNoAno:
    'As datas do regulamento, o valor do material na aba Controle, e as '
    + 'unidades na lista do formulário. O resto se refaz sozinho.',
  oQueNaoMexer:
    'Não apague a aba Respostas nem digite número por cima das células de '
    + 'fórmula: é por elas que o regulamento e o gráfico ficam sabendo quantas '
    + 'unidades se inscreveram.',
  comoTransferirAcesso:
    'As peças são da conta da diretoria. Quem assume pede à diretoria acesso '
    + 'de editor nas pastas da função dele — e quem sai é tirado da pasta, não '
    + 'do arquivo.',
};

/* ── A meta ───────────────────────────────────────────────────────────────── */

export interface MetaDoProjeto {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDoProjeto) => boolean;
}

/**
 * O conjunto continua com as cinco peças.
 *
 * Viaja como **conjunção** de cada meta que mexe numa peça, e não como item da
 * lista: ela é verdadeira no segundo zero, e como tarefa própria abriria verde
 * — que `veredas.test.ts` reprova, e com razão. É a decisão de "sem alterar
 * uma palavra do texto" da CC-ES002 e das metas de preservação da CC-ES005.
 */
const CINCO_PECAS: TipoDePeca[] = ['documento', 'planilha', 'formulario', 'apresentacao', 'dossie'];

const aPropostaPrometeAsCinco = (c: ContextoDoProjeto) =>
  CINCO_PECAS.every(peca => c.p.proposta.pecas.includes(peca));

/** O texto do regulamento não perdeu nenhuma das seções que ele tinha. */
const asSecoesContinuam = (c: ContextoDoProjeto) =>
  titulosDoDoc(c.p.documento).length >= 6;

const aba = (c: ContextoDoProjeto, nome: string) => planilhaPorNome(c.p.controle, nome);

const ehFormula = (c: ContextoDoProjeto, linha: number) =>
  (aba(c, NOME_DA_ABA_DE_CONTROLE)?.celulas[linha][1].texto ?? '').startsWith('=');

const leAAbaDeRespostas = (c: ContextoDoProjeto, linha: number) =>
  (aba(c, NOME_DA_ABA_DE_CONTROLE)?.celulas[linha][1].texto ?? '')
    .includes(`${NOME_DA_ABA_DE_RESPOSTAS}!`);

/**
 * O total acompanha o valor por unidade?
 *
 * Mede **simulando a mudança**, e não comparando o número de hoje: `=240`
 * começa por igual, devolve o valor certo, e não acompanha nada — é a família
 * do `=820+910+1180` da CC-ES003, e nenhuma conta sobre o estado de agora o
 * distingue de `=B3*B5`.
 *
 * E a planilha alterada é **descartada**: pedir que a mudança aconteça de
 * verdade obrigaria a lembrar de desfazer, e deixaria a tarefa verde numa
 * planilha com o valor errado — a lição seguinte partiria de dados mexidos.
 * É a decisão do módulo 2 da CC-ES003, escrita lá.
 */
function oTotalAcompanha(c: ContextoDoProjeto): boolean {
  const antes = aba(c, NOME_DA_ABA_DE_CONTROLE);
  if (!antes) return false;
  const depois = trocarCelula(antes, LINHA_DO_CUSTO, 1,
    texto => String(Number(texto) + 10));
  const cad = { ...c.p.controle, planilhas: c.p.controle.planilhas.map(pl =>
    (pl.nome === NOME_DA_ABA_DE_CONTROLE ? depois : pl)) };
  const unidades = Number(valorDe(depois, LINHA_DAS_UNIDADES, 1));
  const total = valorDe(
    planilhaPorNome(cad, NOME_DA_ABA_DE_CONTROLE)!, LINHA_DO_TOTAL, 1,
  );
  return total === String(unidades * (CUSTO_POR_UNIDADE + 10));
}

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

const METAS_DA_PROPOSTA: MetaDoProjeto[] = [
  {
    id: 'proposta-escrita',
    titulo: 'A proposta responde às quatro perguntas',
    detalhe: 'Qual necessidade do clube o conjunto atende, para quem ele é, que peças ele vai ter, e o que vai contar como pronto. A quarta é a que ninguém escreve, e é a única que dá ao examinador como dizer que o conjunto acabou.',
    onde: 'Proposta do conjunto',
    passos: [
      'Escreva a necessidade com as palavras de quem vive ela.',
      'Diga para quem o conjunto é.',
      'Diga o que vai contar como pronto.',
    ],
    feita: c => propostaCompleta(c.p.proposta),
  },
  {
    id: 'proposta-cinco-pecas',
    titulo: 'As cinco peças estão na proposta',
    detalhe: 'Documento, planilha, formulário, apresentação e dossiê. Prometer quatro e entregar cinco é bom; prometer cinco e entregar quatro é o que a aprovação existe para pegar antes.',
    onde: 'Proposta do conjunto → Peças',
    passos: ['Marque as cinco peças que o conjunto vai ter.'],
    feita: aPropostaPrometeAsCinco,
  },
  {
    id: 'proposta-aprovada-antes',
    titulo: 'A aprovação veio antes de começar',
    detalhe: 'O requisito diz que a execução não pode ser iniciada antes da aprovação. Proposta aprovada depois é proposta que ninguém podia mudar: o examinador recebe o conjunto pronto e a única resposta possível é sim.',
    onde: 'Proposta do conjunto → Enviar para aprovação',
    passos: [
      'Envie a proposta e espere a resposta.',
      'Só depois de aprovada, comece a montar o conjunto.',
    ],
    feita: c => c.p.proposta.aprovadaEm !== null && !c.comecouAntes,
  },
];

/* ── Módulo 2: o documento ────────────────────────────────────────────────── */

const METAS_DO_DOCUMENTO: MetaDoProjeto[] = [
  {
    id: 'doc-identidade',
    titulo: 'O regulamento veste a identidade do conjunto',
    detalhe: 'Cinco peças feitas por cinco pessoas em cinco programas parecem cinco projetos, e quem lê não tem como saber que elas são um. Uma fonte e uma cor, as mesmas nas cinco.',
    onde: 'Início → Estilos → Modificar',
    passos: [
      'Modifique Título 1 e ponha a cor do conjunto.',
      'Deixe o corpo na fonte sem serifa do conjunto.',
    ],
    feita: c => !pecasForaDaIdentidade(c.p).includes('documento'),
  },
  {
    id: 'doc-aponta-as-pecas',
    titulo: 'Uma seção diz onde está cada peça',
    detalhe: 'O regulamento é a peça que o leitor encontra primeiro, então é a que tem de nomear as outras quatro. Sem ela, o conjunto é cinco arquivos que por acaso estão na mesma pasta. E o sumário guarda o que leu: seção nova pede Atualizar Sumário.',
    onde: 'Referências → Atualizar Sumário',
    passos: [
      'Escreva a seção "Onde está cada peça".',
      'Nomeie o formulário, a planilha, a apresentação e o dossiê.',
      'Mande atualizar o sumário.',
    ],
    feita: c => paragrafos(c.p.documento).some(b => b.id === BLOCO_DO_MAPA)
      && sumarioAtualizado(c.p.documento)
      && asSecoesContinuam(c),
  },
];

/* ── Módulo 3: a planilha ─────────────────────────────────────────────────── */

const METAS_DA_PLANILHA: MetaDoProjeto[] = [
  {
    id: 'total-em-formula',
    titulo: 'O total de material se refaz sozinho',
    detalhe: 'O 240 está certo hoje: quatro unidades a sessenta reais. No ano que vem, com seis, ele continua dizendo 240 — e nada na tela avisa, porque o número é plausível. É a família do número guardado que não responde por hoje.',
    onde: 'Aba Controle → célula do total',
    passos: [
      'Apague o total digitado.',
      'Escreva a fórmula que multiplica as unidades pelo valor por unidade.',
      'Mude o valor por unidade e olhe se o total acompanhou.',
    ],
    feita: c => ehFormula(c, LINHA_DO_TOTAL) && oTotalAcompanha(c),
  },
  {
    id: 'planilha-identidade',
    titulo: 'A planilha veste a identidade do conjunto',
    detalhe: 'A planilha é a peça que a tesouraria abre toda semana, e é a que mais some no meio das outras do computador. O título dela na cor do conjunto é o que a identifica de longe.',
    onde: 'Início → Fonte → Cor da fonte',
    passos: [
      'Selecione o título da aba Controle.',
      'Ponha a cor do conjunto na fonte.',
    ],
    feita: c => !pecasForaDaIdentidade(c.p).includes('planilha'),
  },
];

/* ── Módulo 4: o formulário ───────────────────────────────────────────────── */

const METAS_DO_FORMULARIO: MetaDoProjeto[] = [
  {
    id: 'form-separa-os-campos',
    titulo: 'Unidade e especialidade em campos separados',
    detalhe: '"Falcão — Nós e amarras" é uma resposta, e a planilha precisa das duas coisas em colunas separadas para contar por unidade. Quem importa assim abre cada linha e parte o texto à mão, que é exatamente a redigitação que o requisito 4 proíbe.',
    onde: 'Construtor de formulários',
    passos: [
      'Separe o campo em dois: Unidade e Especialidade.',
      'Deixe a unidade como lista, com as unidades do clube.',
    ],
    feita: c => c.p.formulario.campos.some(f => f.id === 'unidade')
      && c.p.formulario.campos.some(f => f.id === 'especialidade')
      && c.p.formulario.campos.some(f => f.id === CAMPO_RESPONSAVEL),
  },
  {
    id: 'form-quantidade-numero',
    titulo: 'A quantidade é campo de número',
    detalhe: 'Num campo de texto curto chega "seis", chega "5 ou 6", chega "4". A SOMA pula os dois primeiros e fecha a conta com um número menor, sem reclamar. O tipo do campo é o que impede a resposta errada de entrar.',
    onde: 'Construtor de formulários → tipo do campo',
    passos: ['Troque o tipo da quantidade para número.'],
    feita: c => c.p.formulario.campos.find(f => f.id === CAMPO_QUANTOS)?.tipo === 'numero',
  },
  {
    id: 'form-identidade',
    titulo: 'O formulário veste a identidade do conjunto',
    detalhe: 'O formulário é a peça que vai para fora do clube — é ele que as famílias e os conselheiros abrem. Chegar com a cara do conjunto é o que diz que ele é do clube e não de alguém.',
    onde: 'Construtor de formulários → Personalizar tema',
    passos: ['Ponha a fonte e a cor do conjunto no tema.'],
    feita: c => !pecasForaDaIdentidade(c.p).includes('formulario'),
  },
];

/* ── Módulo 5: do formulário para a planilha ──────────────────────────────── */

const METAS_DA_IMPORTACAO: MetaDoProjeto[] = [
  {
    id: 'importou-sem-redigitar',
    titulo: 'As respostas entraram na planilha sem ninguém redigitar',
    detalhe: 'Importar liga o envio à linha pela chave que o formulário já guarda. Digitar os mesmos nomes à mão dá uma planilha igual, com doze linhas e nenhuma resposta: no ano que vem, a mesma meia hora de digitação, e um erro de digitação que ninguém acha.',
    onde: 'Aba Respostas → Importar respostas do formulário',
    passos: [
      'Abra o formulário e veja quantas respostas chegaram.',
      'Na planilha, mande importar as respostas.',
      'Confira que cada envio virou uma linha.',
    ],
    feita: c => respostasQueFaltam(c.p) === 0 && c.p.formulario.respostas.length > 0,
  },
  {
    id: 'contagem-vem-das-respostas',
    titulo: 'A contagem de unidades lê a aba de respostas',
    detalhe: 'Enquanto o número de unidades é digitado, importar resposta nova não muda nada no resto do conjunto — a aba cresce e todas as contas continuam as de antes. É a fórmula que faz a importação valer para alguma coisa.',
    onde: 'Aba Controle → célula das unidades',
    passos: [
      'Escreva a contagem sobre a coluna da unidade, na aba Respostas.',
      'Estique a faixa além da última resposta de hoje.',
    ],
    feita: c => leAAbaDeRespostas(c, LINHA_DAS_UNIDADES),
  },
  {
    id: 'soma-vem-das-respostas',
    titulo: 'O total de desbravadores soma a coluna da quantidade',
    detalhe: 'E só faz sentido depois do campo de número: sobre texto, a SOMA pula a linha e devolve um total plausível e menor. As duas lições são a mesma, uma no formulário e outra na planilha.',
    onde: 'Aba Controle → célula dos desbravadores',
    passos: ['Escreva a soma sobre a coluna da quantidade, na aba Respostas.'],
    feita: c => leAAbaDeRespostas(c, LINHA_DOS_DESBRAVADORES)
      && ehNumero(valorDe(aba(c, NOME_DA_ABA_DE_CONTROLE)!, LINHA_DOS_DESBRAVADORES, 1))
      /* E a conta de módulo 3 continua de pé: a importação não pode custar o
         total que já acompanhava. */
      && ehFormula(c, LINHA_DO_TOTAL),
  },
];

/* ── Módulo 6: a apresentação ─────────────────────────────────────────────── */

const METAS_DA_APRESENTACAO: MetaDoProjeto[] = [
  {
    id: 'ap-identidade',
    titulo: 'O mestre veste a identidade do conjunto',
    detalhe: 'No mestre, e não slide por slide: a identidade do conjunto é uma, e aplicá-la à mão em quatro slides é o que faz o quinto sair diferente.',
    onde: 'Exibir → Slide Mestre',
    passos: ['Ponha a fonte e a cor do conjunto no mestre.'],
    feita: c => !pecasForaDaIdentidade(c.p).includes('apresentacao'),
  },
  {
    id: 'ap-grafico-acompanha',
    titulo: 'O gráfico lê a planilha de controle',
    detalhe: 'Colado como figura, ele mostra as quatro unidades de quando alguém o copiou — e continua mostrando quatro depois de a sexta se inscrever. Vinculado, ele lê a planilha agora. É a única das quatro maneiras que se propaga.',
    onde: 'Inserir → Gráfico → Colar com vínculo',
    passos: [
      'Apague a figura colada.',
      'Insira o gráfico com vínculo para a planilha de controle.',
      'Confira que ele mostra as unidades de agora.',
    ],
    feita: c => {
      const g = c.p.apresentacao.slides.find(s => s.grafico?.id === GRAFICO_DA_FEIRA)?.grafico;
      return g !== undefined && acompanhaAFonte(g.como)
        && g.retrato.length === INSCRICOES_DA_FEIRA.length;
    },
  },
];

/* ── Módulo 7: o dossiê ───────────────────────────────────────────────────── */

const METAS_DO_DOSSIE: MetaDoProjeto[] = [
  {
    id: 'dossie-reune-as-de-distribuicao',
    titulo: 'O dossiê reúne as peças de distribuição, e só elas',
    detalhe: 'O dossiê é o que sai do clube. A planilha de controle tem o que o clube gasta e o nome de cada conselheiro responsável — juntá-la "porque faz parte do conjunto" entrega às famílias o que nunca foi para elas. O que vai para fora é decisão, e não tudo o que se tem.',
    onde: 'Combinar arquivos',
    passos: [
      'Exporte o regulamento e a apresentação em PDF.',
      'Combine os dois num dossiê.',
      'Deixe a planilha de controle de fora.',
    ],
    feita: c => {
      const origens = origensDoDossie(c.p.dossie);
      return origens.length === PECAS_DE_DISTRIBUICAO.length
        && origens.includes('regulamento') && origens.includes('apresentacao')
        && !origens.includes('controle');
    },
  },
  {
    id: 'dossie-pesquisavel',
    titulo: 'O dossiê é pesquisável',
    detalhe: 'Exportado do editor, ele nasce com a camada de texto e a família acha a data procurando por ela. Digitalizado do papel impresso, ele é uma foto: abre igual, imprime igual, e a busca não acha uma palavra.',
    onde: 'Combinar arquivos → procurar no dossiê',
    passos: [
      'Exporte do próprio programa, em vez de digitalizar a via impressa.',
      'Procure uma palavra no dossiê para conferir.',
    ],
    feita: c => c.p.dossie !== null && ehPesquisavel(c.p.dossie),
  },
];

/* ── Módulo 8: o repositório ──────────────────────────────────────────────── */

const METAS_DO_REPOSITORIO: MetaDoProjeto[] = [
  {
    id: 'pastas-no-padrao',
    titulo: 'As pastas seguem o padrão da CC-ES001',
    detalhe: '"Feira", "documentos_feira", "CONTAS DA FEIRA 2026", "divulgacao-v2-final": quatro moldes, nenhum com data e versão. No ano que vem aparecem quatro pastas novas ao lado destas, e nada diz qual é de qual ano.',
    onde: 'Repositório → renomear pasta',
    passos: [
      'Escolha um molde e use o mesmo nas quatro.',
      'Ponha data e versão em cada nome.',
    ],
    feita: c => pastasForaDoPadrao(c.p).length === 0 && c.p.pastas.length > 0,
  },
  {
    id: 'acesso-por-funcao',
    titulo: 'Cada pasta tem quem exerce a função dela',
    detalhe: 'O Ronaldo é do conselho e ficou editor da pasta da tesouraria porque precisou ver uma nota em março. Ninguém tirou, e ninguém notou. O outro lado custa igual: a tesoureira sem acesso não lança o pagamento, e vai pedir por mensagem.',
    onde: 'Repositório → compartilhar pasta',
    passos: [
      'Tire de cada pasta quem não exerce a função dela.',
      'Dê acesso a quem exerce e ainda não tem.',
    ],
    /* Uma conta só, e é de propósito. A diretoria na raiz já é cobrada por
       `acessosForaDaFuncao`: é a função que a raiz serve, e quem a exerce
       precisa alcançar o papel dela. Uma segunda conferência lendo a lista de
       acesso não mediria nada a mais — e mediria errado no dia em que a raiz
       fosse da diretoria, porque o dono não aparece na lista de acesso e a
       conta diria que ela não acha o conjunto que é dela. */
    feita: c => acessosForaDaFuncao(c.p).length === 0,
  },
  {
    id: 'colaboracao-no-historico',
    titulo: 'O histórico mostra mais de uma pessoa escrevendo',
    detalhe: 'O requisito pede o trabalho feito com, no mínimo, uma outra pessoa, comprovado pelo histórico de versões. Quem só abriu o arquivo não entra: ler não é participar, e um histórico que contasse leitura deixaria "produzimos juntos" verdadeiro para quem só olhou.',
    onde: 'Repositório → histórico de versões',
    passos: [
      'Dê acesso de editor a quem vai escrever com você.',
      'Deixe a outra pessoa escrever uma versão.',
      'Abra o histórico e veja os dois nomes.',
    ],
    feita: c => pecasComColaboracao(c.p).length > 0,
  },
];

/* ── Módulo 9: as instruções ──────────────────────────────────────────────── */

const METAS_DAS_INSTRUCOES: MetaDoProjeto[] = [
  {
    id: 'instrucoes-completas',
    titulo: 'As instruções respondem às quatro coisas',
    detalhe: 'Por onde começar, o que trocar a cada ano, o que não mexer, e como transferir o acesso. A terceira é a que ninguém escreve, e é a que evita alguém apagar o vínculo sem saber que era ele que fazia o conjunto funcionar.',
    onde: 'Repositório → Descrição da pasta',
    passos: [
      'Escreva por onde a próxima diretoria começa.',
      'Diga o que se troca a cada ano.',
      'Diga o que não se mexe, e por quê.',
      'Diga como o acesso se transfere.',
    ],
    feita: c => instrucoesCompletas(c.p.instrucoes),
  },
  {
    id: 'conjunto-na-conta-do-clube',
    titulo: 'As peças não são de uma pessoa',
    detalhe: 'Dar acesso de editar parece dar a conta, e não dá. O arquivo mora na conta do dono e some com ela — por mais gente que tenha acesso. Três peças de um conjunto do clube numa conta pessoal é o conjunto saindo do clube no dia em que essa pessoa sai.',
    onde: 'Repositório → Transferir propriedade',
    passos: [
      'Transfira a propriedade das peças para a conta da diretoria.',
      'Confira que você continua editor.',
    ],
    feita: c => {
      const pecas = c.p.nuvem.arquivos.filter(a => a.tipo !== 'pasta');
      return pecas.length > 0 && pecas.every(a => a.dono !== 'voce')
        /* Transferir não é perder: quem entrega continua editor, senão ninguém
           transferiria nunca e o clube ficaria com tudo na conta de uma
           pessoa. */
        && pecas.every(a => a.acessos.some(ac => ac.quem === 'voce' && ac.papel === 'editor'));
    },
  },
];

/* ── Módulo 10: os quinze minutos ─────────────────────────────────────────── */

const METAS_DOS_QUINZE_MINUTOS: MetaDoProjeto[] = [
  {
    id: 'numeros-do-regulamento-vinculados',
    titulo: 'Os números do regulamento leem a planilha',
    detalhe: 'Eles estão certos hoje, e é isso que os torna o pior dos quatro jeitos: um número digitado não se refaz nunca e nada na tela diz que ele é de ontem. O gráfico pelo menos se vê que é um retrato. No Word o gesto é Colar Especial → Colar Vínculo; aqui o painel do conjunto mostra de onde cada número devia vir.',
    onde: 'O conjunto → de onde vem cada número',
    passos: [
      'No regulamento, troque os dois números digitados por vínculos.',
      'Confira que eles passaram a dizer o que a planilha diz.',
    ],
    feita: c => c.p.numeros.filter(n => n.peca === 'documento')
      .every(n => acompanhaAFonte(n.como)),
  },
  {
    id: 'viu-o-dado-propagar',
    titulo: 'Mudar um dado chegou nas outras peças',
    detalhe: 'É o requisito 8 inteiro: uma inscrição nova na aba de respostas, e o total, o regulamento e o gráfico dizem o número novo sem ninguém abrir nenhum dos três. Enquanto alguma peça não acompanha, o conjunto conta dois números para a mesma feira, e nenhum com cara de errado.',
    onde: 'Demonstração',
    passos: [
      'Acrescente uma inscrição na aba de respostas.',
      'Olhe o total, o regulamento e o gráfico sem mexer em nenhum deles.',
    ],
    feita: c => c.descobertas.includes(CHAVE_DA_PROPAGACAO)
      && numerosDesatualizados(c.p).length === 0,
  },
  {
    id: 'dossie-refeito',
    titulo: 'O dossiê foi exportado de novo depois da mudança',
    detalhe: 'O PDF congela: ele guarda o retrato de quando saiu, e é por isso que ele é a peça que não se propaga. Entregar às famílias um dossiê gerado antes da mudança é entregar o número de antes, com todo o resto do conjunto certo.',
    onde: 'Combinar arquivos',
    passos: [
      'Olhe o dossiê depois da mudança e veja que ele não mudou.',
      'Exporte as peças de novo e refaça o dossiê.',
    ],
    feita: c => c.descobertas.includes(CHAVE_DO_DOSSIE_VELHO)
      && origensDoDossie(c.p.dossie).length === PECAS_DE_DISTRIBUICAO.length
      && (c.p.dossie?.paginas ?? []).some(pg =>
        (pg.texto ?? '').includes(String(INSCRICOES_DA_FEIRA.length + 1))),
  },
  {
    id: 'dentro-dos-quinze',
    titulo: 'A demonstração cabe em quinze minutos',
    detalhe: 'Quinze minutos para cinco peças é pouco, e é de propósito: o que se mostra é o conjunto funcionando, e não cada peça uma a uma. Quem abre as cinco e passa por todas as telas gasta os quinze sem chegar ao dado que se propaga, que é o que o requisito pede para ver.',
    onde: 'Demonstração',
    passos: [
      'Abra pelo dado que muda, e não pela primeira peça.',
      'Mostre o conjunto reagindo, e não as cinco telas.',
    ],
    feita: c => dentroDoTempo(c.p),
  },
];

/* ── O registro das dez lições ────────────────────────────────────────────── */

/* Os estados de partida, cada um saindo do anterior. */
const DEPOIS_DA_PROPOSTA: ProjetoDocumental = {
  ...PROJETO_DA_FEIRA,
  proposta: {
    necessidade: 'A feira recomeça do zero todo ano, e ninguém sabe quantas unidades vêm.',
    paraQuem: 'A secretaria, a tesouraria e os conselheiros das unidades.',
    pecas: CINCO_PECAS,
    pronto: 'O conjunto está pronto quando uma inscrição nova aparece sozinha nas outras peças.',
    aprovadaEm: '2026-07-01',
  },
};

const DEPOIS_DO_DOCUMENTO: ProjetoDocumental = {
  ...DEPOIS_DA_PROPOSTA,
  documento: comMapaDasPecas(comIdentidadeNoDocumento(DEPOIS_DA_PROPOSTA.documento)),
};

const DEPOIS_DA_PLANILHA: ProjetoDocumental = {
  ...DEPOIS_DO_DOCUMENTO,
  controle: comCorNaPlanilha(comTotalEmFormula(DEPOIS_DO_DOCUMENTO.controle)),
};

const DEPOIS_DO_FORMULARIO: ProjetoDocumental = {
  ...DEPOIS_DA_PLANILHA,
  formulario: comFormularioArrumado(DEPOIS_DA_PLANILHA.formulario),
};

const DEPOIS_DA_IMPORTACAO: ProjetoDocumental = {
  ...importarRespostas(DEPOIS_DO_FORMULARIO),
  controle: comContasSobreAsRespostas(importarRespostas(DEPOIS_DO_FORMULARIO).controle),
};

const DEPOIS_DA_APRESENTACAO: ProjetoDocumental = {
  ...DEPOIS_DA_IMPORTACAO,
  apresentacao: comGraficoVinculado(comIdentidadeNoMestre(DEPOIS_DA_IMPORTACAO.apresentacao)),
};

const DEPOIS_DO_DOSSIE: ProjetoDocumental = {
  ...DEPOIS_DA_APRESENTACAO,
  dossie: DOSSIE_DAS_DUAS(DEPOIS_DA_APRESENTACAO),
};

const DEPOIS_DO_REPOSITORIO: ProjetoDocumental = {
  ...DEPOIS_DO_DOSSIE,
  nuvem: comColaboracaoNoHistorico(comAcessoPorFuncao(comPastasNoPadrao(DEPOIS_DO_DOSSIE.nuvem))),
};

const DEPOIS_DAS_INSTRUCOES: ProjetoDocumental = {
  ...DEPOIS_DO_REPOSITORIO,
  instrucoes: INSTRUCOES_ESCRITAS,
  nuvem: comConjuntoNaContaDoClube(DEPOIS_DO_REPOSITORIO.nuvem),
};

export interface LicaoDoProjeto {
  projeto: ProjetoDocumental;
  programa: ProgramaDaLicao;
  metas: MetaDoProjeto[];
}

/**
 * De que estado cada lição parte e o que ela cobra.
 *
 * `Record` sobre a união, e não uma escada de `if`: a décima primeira lição
 * não compila até alguém dizer de onde ela parte, em que programa ela abre e
 * o que ela cobra. É a decisão do despacho de três telas da CC-ES002 e do mapa
 * dos cadernos da CC-ES003.
 */
export const LICOES_DA_CC_ES012: Record<LicaoDaCcEs012, LicaoDoProjeto> = {
  proposta: { projeto: PROJETO_DA_FEIRA, programa: 'plataforma', metas: METAS_DA_PROPOSTA },
  documento: { projeto: DEPOIS_DA_PROPOSTA, programa: 'word', metas: METAS_DO_DOCUMENTO },
  planilha: { projeto: DEPOIS_DO_DOCUMENTO, programa: 'excel', metas: METAS_DA_PLANILHA },
  formulario: { projeto: DEPOIS_DA_PLANILHA, programa: 'formulario', metas: METAS_DO_FORMULARIO },
  importar: { projeto: DEPOIS_DO_FORMULARIO, programa: 'formulario', metas: METAS_DA_IMPORTACAO },
  apresentacao: {
    projeto: DEPOIS_DA_IMPORTACAO, programa: 'powerpoint', metas: METAS_DA_APRESENTACAO,
  },
  dossie: { projeto: DEPOIS_DA_APRESENTACAO, programa: 'pdf', metas: METAS_DO_DOSSIE },
  repositorio: { projeto: DEPOIS_DO_DOSSIE, programa: 'nuvem', metas: METAS_DO_REPOSITORIO },
  instrucoes: { projeto: DEPOIS_DO_REPOSITORIO, programa: 'nuvem', metas: METAS_DAS_INSTRUCOES },
  'quinze-minutos': {
    projeto: DEPOIS_DAS_INSTRUCOES, programa: 'plataforma', metas: METAS_DOS_QUINZE_MINUTOS,
  },
};

export const metasDa = (licao: LicaoDaCcEs012) => LICOES_DA_CC_ES012[licao].metas;
