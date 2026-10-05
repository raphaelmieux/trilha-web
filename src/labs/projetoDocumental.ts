/**
 * O conjunto documental da CC-ES012: cinco peças e **uma** fonte da verdade.
 *
 * Esta vereda não ensina programa nenhum. As cinco peças que o requisito 3
 * pede já foram ensinadas, cada uma na vereda que o requisito 1 exige antes
 * desta: o documento com estilos e sumário é a CC-ES002, a planilha que
 * calcula é a CC-ES003, o dossiê pesquisável é a CC-ES004, o formulário é a
 * CC-ES008, a apresentação é a CC-ES011. O que ela ensina é o que nenhuma
 * delas podia ensinar sozinha — que **as cinco são um conjunto**, e que um
 * conjunto tem uma fonte da verdade.
 *
 * ── Por que isto é um modelo novo, e não um campo numa das peças ──────────
 * O vínculo entre duas peças não é de nenhuma das duas. Guardá-lo no
 * documento faria `documento.ts` importar `planilha.ts` — e a CC-ES002
 * passaria a depender da CC-ES003 por causa de uma vereda que vem depois das
 * duas. Guardá-lo na planilha seria pior: ela não sabe quem a lê, e é isso
 * que a torna fonte. O vínculo é do **conjunto**, e é aqui que ele mora.
 *
 * ── O que o requisito 8 pede, e o que ele desmente ───────────────────────
 * "Demonstrar a alteração de um dado que se propague automaticamente pelas
 * demais peças." Propagar automaticamente é uma afirmação forte, e só uma das
 * quatro maneiras de um número chegar a uma peça a cumpre. As outras três
 * chegam ao mesmo lugar na tela, com o mesmo número, e param ali para sempre.
 */

import { type Doc } from './documento';
import { type Formulario, cabecalhoDe, linhasDe } from './formulario';
import { type Formato, mostrar, mostrarNumero, num, type Valor } from './formulas';
import {
  type Caderno, type Celula, type Planilha,
  planilhaPorNome, valorCalculado, vazia,
} from './planilha';
import { type Apresentacao } from './apresentacao';
import { type DocumentoPdf } from './documentoPdf';
import {
  type Nuvem, type Papel, type Pessoa, papelAlcanca, papelDe, quemEscreveu,
} from './arquivoCompartilhado';
import { moldeDoNome, nomeTemDataEVersao } from '../lib/exploradorValidator';

/* ── A identidade, que é o requisito 3.6 ──────────────────────────────────── */

export type FamiliaDaFonte = 'serifada' | 'sem-serifa';

/**
 * A que família cada fonte pertence, **declarado**.
 *
 * O documento guarda a família (`'serifada' | 'sem-serifa'`), porque é a
 * distinção que o requisito 2.4 da CC-ES002 pede; o mestre da apresentação
 * guarda o nome da fonte, porque é o que a caixa do PowerPoint oferece. Para
 * as duas peças poderem ser comparadas com a mesma identidade, alguém tem de
 * dizer que Georgia é serifada — e quem diz é esta tabela, e não uma segunda
 * cópia da identidade escrita em cada formato.
 *
 * Adivinhar pelo nome exigiria uma lista de sufixos e erraria calado: Verdana
 * e Georgia terminam igual e são de famílias diferentes.
 */
export const FAMILIA_DA_FONTE: Record<string, FamiliaDaFonte> = {
  Georgia: 'serifada',
  'Times New Roman': 'serifada',
  Garamond: 'serifada',
  Calibri: 'sem-serifa',
  Arial: 'sem-serifa',
  Verdana: 'sem-serifa',
};

/**
 * A identidade do conjunto: duas fontes e uma cor.
 *
 * Duas fontes e não uma porque é assim que um conjunto se veste — uma para
 * título e outra para corpo —, e uma cor e não uma paleta porque o requisito
 * pede **coerência**, e não um manual de marca: isso é a CC-DG004.
 *
 * Ela é declarada no projeto e não derivada da primeira peça que alguém fez.
 * Derivar faria a identidade mudar quando a peça mudasse, e aí "as peças
 * concordam" seria verdade sempre — a armadilha do "zero link não é zero link
 * quebrado" aplicada à própria conta.
 */
export interface IdentidadeDoProjeto {
  fonteDosTitulos: string;
  fonteDoCorpo: string;
  /** Uma só, e é a que o título usa. Ver `CONTRASTE_DA_IDENTIDADE`. */
  cor: string;
}

/* ── Como um número chega a uma peça ──────────────────────────────────────── */

/**
 * As quatro maneiras, e só uma acompanha a fonte.
 *
 * É a `VindoDaPlanilha` da CC-ES011 alargada, e o quarto valor é justamente o
 * que o comentário dela nomeia como "o que nenhuma delas é": digitar o número
 * na peça.
 *
 * E há uma mudança de leitura que **parece** contradição e não é.
 * `incorporado` é, na CC-ES011, "a única que acompanha e viaja sozinha" — e
 * continua sendo, para a pergunta que aquela vereda faz, que é "o quadro
 * mostra os números do ano passado?". A pergunta daqui é outra: "mexer na
 * planilha de controle chega até ele?". Não chega: o que ele acompanha é a
 * **cópia que viaja dentro dele**, que é uma segunda fonte. As duas leituras
 * são verdadeiras, e a distância entre elas é a vereda inteira — um conjunto
 * com duas fontes conta dois números, e nenhum dos dois com cara de errado.
 */
export type ComoChegou = 'digitado' | 'imagem' | 'incorporado' | 'vinculado';

/** A única que se refaz quando a planilha de controle muda. */
export const acompanhaAFonte = (como: ComoChegou) => como === 'vinculado';

/**
 * O que cada maneira faz e o que ela **não** faz.
 *
 * Cada opção traz escrito o lado que ela não cobre, como os três métodos de
 * duas etapas da CC-ES005 e os quatro níveis de calendário da CC-ES007: sem
 * esse lado, a fileira é quatro palavras parecidas e a escolha vira "clicar na
 * primeira".
 */
export const O_QUE_CADA_UM_FAZ: Record<ComoChegou, { faz: string; naoFaz: string }> = {
  digitado: {
    faz: 'Entra na peça como texto, e sai igual em qualquer computador.',
    naoFaz: 'Não se refaz nunca, e nada na tela diz que ele é de ontem.',
  },
  imagem: {
    faz: 'Mostra o retrato de quando foi colado, e se vê que é um retrato.',
    naoFaz: 'Não se refaz, e não dá para corrigir um número dentro dela.',
  },
  incorporado: {
    faz: 'Leva uma cópia da planilha dentro do arquivo, e viaja sozinho.',
    naoFaz: 'A cópia é uma segunda fonte: mexer na de controle não o alcança.',
  },
  vinculado: {
    faz: 'Lê a planilha de controle agora, e é o único que se propaga.',
    naoFaz: 'Precisa que a planilha viaje junto, senão fica sem o que ler.',
  },
};

/**
 * Um número do conjunto que mora numa peça e devia vir da planilha.
 *
 * `alvo` é o id do bloco (no documento) ou do gráfico (na apresentação) que o
 * desenha, e `retrato` é o que ele mostrava quando foi posto ali. Guardar o
 * retrato é o que permite a divergência existir: sem ele, um número que
 * parou no tempo não teria valor nenhum para mostrar, e o defeito que o
 * requisito 8 manda demonstrar não teria como aparecer.
 */
export interface NumeroNoConjunto {
  id: string;
  peca: Exclude<TipoDePeca, 'planilha' | 'formulario'>;
  alvo: string;
  como: ComoChegou;
  /** Onde ele devia ler: a aba da planilha de controle e a célula. */
  de: { planilha: string; linha: number; coluna: number };
  retrato: number;
}

/* ── As peças ─────────────────────────────────────────────────────────────── */

export type TipoDePeca =
  | 'documento' | 'planilha' | 'formulario' | 'apresentacao' | 'dossie';

export const NOME_DA_PECA: Record<TipoDePeca, string> = {
  documento: 'Documento',
  planilha: 'Planilha de controle',
  formulario: 'Formulário',
  apresentacao: 'Apresentação',
  dossie: 'Dossiê em PDF',
};

/** Quais peças o requisito 3.5 manda reunir no dossiê: as de distribuição. */
export const PECAS_DE_DISTRIBUICAO: TipoDePeca[] = ['documento', 'apresentacao'];

/* ── A proposta, que é o requisito 2 ──────────────────────────────────────── */

/**
 * A proposta escrita, e a aprovação que vem **antes** da execução.
 *
 * `aprovadaEm` é um campo da proposta, e não um booleano do projeto, porque o
 * requisito não pede que exista aprovação: pede que ela venha antes. Uma
 * data é o que torna "antes" uma pergunta respondível — e é ela que faz o
 * caminho rápido e errado ficar visível, que é construir tudo e pedir
 * aprovação para o que já está pronto. Proposta aprovada depois é proposta
 * que ninguém podia mudar.
 */
export interface Proposta {
  /** A necessidade documental real, nas palavras de quem escreveu. */
  necessidade: string;
  /** Quem vai usar o conjunto. */
  paraQuem: string;
  /** As peças que o conjunto vai ter. */
  pecas: TipoDePeca[];
  /** O que vai contar como pronto — sem isto, a proposta não promete nada. */
  pronto: string;
  /** `AAAA-MM-DD`, ou `null` enquanto o examinador não aprovou. */
  aprovadaEm: string | null;
}

export const PROPOSTA_EM_BRANCO: Proposta = {
  necessidade: '', paraQuem: '', pecas: [], pronto: '', aprovadaEm: null,
};

/**
 * A proposta responde às quatro perguntas?
 *
 * As quatro, e não três: `pronto` é a que ninguém escreve, e é a única que
 * dá ao examinador como dizer que o conjunto acabou. Sem ela, a aprovação é
 * de uma intenção.
 */
export const propostaCompleta = (p: Proposta): boolean =>
  p.necessidade.trim() !== '' && p.paraQuem.trim() !== ''
  && p.pronto.trim() !== '' && p.pecas.length > 0;

/* ── A função no clube, que é o requisito 5 ───────────────────────────────── */

export type FuncaoNoClube = 'diretoria' | 'secretaria' | 'tesouraria' | 'conselho';

export const NOME_DA_FUNCAO: Record<FuncaoNoClube, string> = {
  diretoria: 'Diretoria',
  secretaria: 'Secretaria',
  tesouraria: 'Tesouraria',
  conselho: 'Conselho de unidades',
};

/**
 * Quem exerce qual função, declarado.
 *
 * O requisito pede "permissões definidas por função", e a nuvem de verdade
 * não tem função nenhuma: ela compartilha com pessoas. "Por função" é uma
 * disciplina, e o que a torna conferível é esta lista — quem tem acesso a uma
 * pasta é quem exerce a função que aquela pasta serve, nem mais nem menos.
 *
 * É também o que faz o requisito 7 ter o que pedir: permissão dada a uma
 * **pessoa** morre com a saída dela, e a transferência de acesso passa a ser
 * vinte gestos em vez de um. É a decisão de "conta do clube não é conta de
 * pessoa" da CC-ES005, aplicada ao repositório.
 */
export interface NaEquipe {
  quem: Pessoa;
  funcao: FuncaoNoClube;
}

/**
 * Uma pasta do repositório, e a função que ela serve.
 *
 * `minimo` é o papel que a função precisa ter ali — e não o papel exato:
 * quem é dono da pasta também a edita, e exigir igualdade acusaria o dono de
 * ter acesso demais à própria pasta.
 */
export interface PastaDoProjeto {
  id: string;
  funcao: FuncaoNoClube;
  minimo: Papel;
}

/* ── As instruções, que são o requisito 7 ─────────────────────────────────── */

/**
 * O que a diretoria do ano que vem precisa achar escrito.
 *
 * Quatro campos, e a transferência de acesso é um deles por exigência do
 * requisito. Os outros três são o que torna o conjunto reaproveitável em vez
 * de legível: por onde começar, o que trocar a cada ano, e o que **não**
 * mexer — que é o campo que ninguém escreve e o que faz alguém apagar o
 * vínculo sem saber que era ele que fazia o conjunto funcionar.
 */
export interface Instrucoes {
  porOndeComecar: string;
  oQueTrocarNoAno: string;
  oQueNaoMexer: string;
  comoTransferirAcesso: string;
}

export const INSTRUCOES_EM_BRANCO: Instrucoes = {
  porOndeComecar: '', oQueTrocarNoAno: '', oQueNaoMexer: '', comoTransferirAcesso: '',
};

export const instrucoesCompletas = (i: Instrucoes): boolean =>
  Object.values(i).every(t => t.trim() !== '');

/* ── O conjunto ───────────────────────────────────────────────────────────── */

export interface ProjetoDocumental {
  proposta: Proposta;
  identidade: IdentidadeDoProjeto;
  documento: Doc<string>;
  /** A pasta de trabalho, com a aba de respostas e a de controle. */
  controle: Caderno;
  formulario: Formulario;
  apresentacao: Apresentacao;
  /** `null` enquanto ninguém montou o dossiê. */
  dossie: DocumentoPdf | null;
  /** Os vínculos do conjunto: ver `NumeroNoConjunto`. */
  numeros: NumeroNoConjunto[];
  nuvem: Nuvem;
  equipe: NaEquipe[];
  pastas: PastaDoProjeto[];
  instrucoes: Instrucoes;
  /** Quantos minutos a demonstração do requisito 8 levou, ou `null`. */
  minutosDaDemonstracao: number | null;
}

/* ── O que a planilha de controle diz agora ───────────────────────────────── */

export const NOME_DA_ABA_DE_RESPOSTAS = 'Respostas';
export const NOME_DA_ABA_DE_CONTROLE = 'Controle';

/** A aba de respostas, que é onde o formulário desemboca. */
export const abaDeRespostas = (p: ProjetoDocumental): Planilha | null =>
  planilhaPorNome(p.controle, NOME_DA_ABA_DE_RESPOSTAS);

export const abaDeControle = (p: ProjetoDocumental): Planilha | null =>
  planilhaPorNome(p.controle, NOME_DA_ABA_DE_CONTROLE);

/**
 * O número que a célula de origem mostra **agora**.
 *
 * `undefined` quando a aba não existe ou a célula não é número: um conjunto
 * cuja fonte sumiu não tem valor zero, tem valor nenhum — e devolver zero
 * poria na tela o número plausível e errado que esta plataforma existe para
 * não mostrar.
 */
export function valorNaFonte(
  p: ProjetoDocumental, de: NumeroNoConjunto['de'],
): number | undefined {
  const aba = planilhaPorNome(p.controle, de.planilha);
  if (!aba) return undefined;
  const v: Valor = valorCalculado(aba, de.linha, de.coluna, p.controle);
  /* `Valor` é união etiquetada, e não número cru: `typeof v === 'number'`
     nunca casa, e a conta inteira devolveria `undefined` em silêncio — com o
     retrato aparecendo no lugar do valor de agora e o requisito 8 parecendo
     cumprido por um conjunto em que nada se propaga. */
  return v.tipo === 'numero' ? v.n : undefined;
}

/**
 * O número que a peça **mostra**.
 *
 * Vinculado lê a fonte agora; as outras três mostram o retrato. É a mesma
 * divisão de `textoDoBloco` e `textoDoTrecho` na CC-ES002 — o que foi posto
 * ali e o que se lê —, e a distância entre as duas é a lição.
 */
export function valorMostrado(p: ProjetoDocumental, n: NumeroNoConjunto): number {
  if (!acompanhaAFonte(n.como)) return n.retrato;
  return valorNaFonte(p, n.de) ?? n.retrato;
}

/**
 * Os números que a peça mostra e que já não são os da fonte.
 *
 * É o que o requisito 8 manda demonstrar, do lado que ninguém demonstra: não
 * "veja este número mudar", e sim "veja estes três não mudarem". Um número
 * cujo retrato por acaso é igual ao de agora não entra — ele não está
 * divergindo hoje, e acusá-lo faria a conta reprovar um conjunto certo.
 */
export function numerosDesatualizados(p: ProjetoDocumental): NumeroNoConjunto[] {
  return p.numeros.filter(n => {
    const agora = valorNaFonte(p, n.de);
    return agora !== undefined && valorMostrado(p, n) !== agora;
  });
}

/** Os números que não acompanham a fonte, divergindo hoje ou não. */
export const numerosQueNaoAcompanham = (p: ProjetoDocumental): NumeroNoConjunto[] =>
  p.numeros.filter(n => !acompanhaAFonte(n.como));

/**
 * Passa um número para vinculado, e refaz o retrato dele.
 *
 * O retrato se refaz porque vincular, no Word e no PowerPoint, atualiza na
 * hora: deixá-lo velho faria a peça continuar mostrando o número de ontem
 * **depois** de a pessoa ter feito exatamente o que a lição pediu.
 */
export function vincular(p: ProjetoDocumental, id: string): ProjetoDocumental {
  return {
    ...p,
    numeros: p.numeros.map(n => (n.id === id
      ? { ...n, como: 'vinculado' as ComoChegou, retrato: valorNaFonte(p, n.de) ?? n.retrato }
      : n)),
  };
}

/* ── A aparência de cada peça, e o requisito 3.6 ──────────────────────────── */

/**
 * A fonte e a cor que uma peça de fato carrega.
 *
 * `undefined` num campo é "esta peça não diz nada sobre isso" — e não é a
 * mesma coisa que dizer algo diferente da identidade. O dossiê é o caso: ele
 * é montado a partir das outras, então ele não tem aparência própria. Dar a
 * ele um campo seria dar um campo que ninguém consegue errar, e a coerência
 * dele é a coerência do que está dentro.
 */
export interface AparenciaDaPeca {
  titulo?: string;
  corpo?: string;
  cor?: string;
}

export function aparenciaDe(p: ProjetoDocumental, peca: TipoDePeca): AparenciaDaPeca {
  switch (peca) {
    case 'documento': {
      const cor = p.documento.estilos?.['Título 1']?.cor;
      /* O documento guarda a família, e não o nome. Quem traduz é
         FAMILIA_DA_FONTE, pelo motivo escrito lá. */
      const familia = p.documento.fonte;
      const nome = familia === undefined ? undefined
        : Object.keys(FAMILIA_DA_FONTE).find(f => FAMILIA_DA_FONTE[f] === familia
          && (f === p.identidade.fonteDoCorpo || f === p.identidade.fonteDosTitulos));
      return { corpo: nome ?? (familia && `(${familia})`), cor };
    }
    case 'apresentacao':
      return {
        titulo: p.apresentacao.mestre.fonteDoTitulo,
        corpo: p.apresentacao.mestre.fonteDoCorpo,
        cor: p.apresentacao.mestre.corDoTitulo,
      };
    case 'formulario':
      return p.formulario.aparencia
        ? { titulo: p.formulario.aparencia.fonte, cor: p.formulario.aparencia.cor }
        : {};
    case 'planilha': {
      const aba = abaDeControle(p);
      const topo = aba?.celulas[0]?.[0];
      return topo ? { cor: topo.cor } : {};
    }
    case 'dossie':
      return {};
  }
}

/**
 * As peças cuja aparência discorda da identidade.
 *
 * Campo ausente **conta**: uma peça que não diz nada sobre a cor é uma peça
 * sem a cor do conjunto, e é exatamente como as cinco chegam. Tratar ausente
 * como "não diverge" deixaria o requisito 3.6 verde no segundo zero, que é o
 * "zero link não é zero link quebrado" aplicado à coerência.
 *
 * O dossiê fica de fora porque ele não tem aparência própria, pela razão
 * escrita em `AparenciaDaPeca`.
 */
export function pecasForaDaIdentidade(p: ProjetoDocumental): TipoDePeca[] {
  const fora: TipoDePeca[] = [];
  for (const peca of ['documento', 'planilha', 'formulario', 'apresentacao'] as const) {
    const a = aparenciaDe(p, peca);
    const tituloErrado = a.titulo !== undefined && a.titulo !== p.identidade.fonteDosTitulos;
    const corpoErrado = a.corpo !== undefined && a.corpo !== p.identidade.fonteDoCorpo
      && a.corpo !== p.identidade.fonteDosTitulos;
    /* A cor é a única que toda peça pode carregar, então ausente é divergente:
       é assim que as cinco chegam, e é o que a lição manda consertar. */
    if (a.cor !== p.identidade.cor || tituloErrado || corpoErrado) fora.push(peca);
  }
  return fora;
}

/* ── Do formulário para a planilha, que é o requisito 4 ───────────────────── */

/**
 * As linhas que a aba de respostas **devia** ter, lidas do formulário.
 *
 * Sai de `cabecalhoDe` e `linhasDe`, que são as mesmas funções que a CC-ES008
 * usa para exportar o CSV. Escrever uma segunda leitura aqui daria duas
 * conversões do mesmo formulário, e a divergência apareceria como uma coluna
 * fora de lugar na planilha — plausível, e sem nada acusando.
 */
export const respostasEmLinhas = (f: Formulario): string[][] =>
  [cabecalhoDe(f), ...linhasDe(f)];

/**
 * A aba de respostas com os dados do formulário dentro.
 *
 * Ela é **refeita**, e não acrescentada: importar de novo depois de uma
 * resposta nova deixaria as antigas duplicadas, e uma planilha com o mesmo
 * inscrito duas vezes soma duas diárias e fecha a conta com um número
 * plausível. É a decisão da pasta do projeto de Python, que é apagada e
 * refeita a cada execução.
 *
 * O que ela **não** faz é mexer na aba de controle: as fórmulas de lá leem
 * esta, e reescrevê-las na importação apagaria o trabalho do módulo 3.
 */
export function importarRespostas(p: ProjetoDocumental): ProjetoDocumental {
  const aba = abaDeRespostas(p);
  if (!aba) return p;
  const linhas = respostasEmLinhas(p.formulario);
  const celulas = aba.celulas.map((linha, l) => linha.map((c, col): Celula => {
    const texto = linhas[l]?.[col];
    if (texto === undefined) return { ...vazia(), negrito: l === 0 };
    return { ...c, texto, negrito: l === 0 };
  }));
  return {
    ...p,
    controle: {
      ...p.controle,
      planilhas: p.controle.planilhas.map(q => (q.nome === aba.nome
        ? { ...q, celulas } : q)),
    },
  };
}

/**
 * As respostas que a aba de respostas ainda não tem.
 *
 * Conta **envios**, e não linhas preenchidas: uma aba em que alguém digitou
 * doze nomes à mão tem doze linhas e nenhuma resposta importada, e contar
 * linhas daria a tarefa por cumprida a quem redigitou — que é o gesto exato
 * que o requisito 4 proíbe. O que casa é o id do envio, que a importação
 * escreve na coluna do instante.
 */
export function respostasQueFaltam(p: ProjetoDocumental): number {
  const aba = abaDeRespostas(p);
  if (!aba) return p.formulario.respostas.length;
  const naAba = new Set(aba.celulas.slice(1).map(l => l[0]?.texto.trim()).filter(t => t));
  const esperadas = linhasDe(p.formulario).map(l => l[0]?.trim());
  return esperadas.filter(e => e !== undefined && e !== '' && !naAba.has(e)).length;
}

/* ── O repositório, que é o requisito 5 ───────────────────────────────────── */

/**
 * As pastas cujo nome não segue o padrão da CC-ES001.
 *
 * As funções são **importadas** daquela vereda, e não reescritas: o requisito
 * manda nomear "segundo o padrão adotado na vereda CC-ES001", e duas
 * implementações do mesmo padrão divergem no primeiro ajuste — foi
 * exatamente o que aconteceu na CC-ES004, onde as daqui aceitavam `v 2` com
 * espaço e as de lá recusavam. O desbravador levaria bronca num nome que a
 * outra vereda aprovou, e nenhuma das duas telas teria como saber.
 */
export function pastasForaDoPadrao(p: ProjetoDocumental): string[] {
  const nomes = p.pastas
    .map(pasta => p.nuvem.arquivos.find(a => a.id === pasta.id)?.nome)
    .filter((n): n is string => n !== undefined);
  if (nomes.length === 0) return [];
  const moldes = new Set(nomes.map(moldeDoNome));
  /* Duas contas, e nenhuma substitui a outra: o molde é justamente o que apaga
     a diferença entre uma data e um número qualquer, e dez datados em dez
     moldes não ordenam. Está escrito na CC-ES001 e vale igual aqui. */
  const foraDoMolde = moldes.size > 1 ? nomes : [];
  const semDataOuVersao = nomes.filter(n => !nomeTemDataEVersao(n));
  return [...new Set([...foraDoMolde, ...semDataOuVersao])];
}

/**
 * Quem tem acesso a uma pasta sem exercer a função dela, e quem a exerce e
 * não tem.
 *
 * As duas contas, porque são erros diferentes e nenhum deles substitui o
 * outro: acesso a mais é a ficha da tesouraria aberta para trinta pessoas,
 * acesso a menos é a tesoureira sem como lançar o pagamento. Devolver só
 * "está certo ou não" mandaria a pessoa procurar qual dos dois é.
 */
export function acessosForaDaFuncao(p: ProjetoDocumental): {
  pasta: string; sobrando: Pessoa[]; faltando: Pessoa[];
}[] {
  return p.pastas.map(pasta => {
    const daFuncao = p.equipe.filter(e => e.funcao === pasta.funcao).map(e => e.quem);
    const todos = [...new Set(p.equipe.map(e => e.quem))];
    const sobrando = todos.filter(quem => !daFuncao.includes(quem)
      && papelAlcanca(papelDe(p.nuvem, pasta.id, quem) ?? 'leitor', pasta.minimo)
      && papelDe(p.nuvem, pasta.id, quem) !== undefined);
    const faltando = daFuncao.filter(quem => {
      const papel = papelDe(p.nuvem, pasta.id, quem);
      return papel === undefined || !papelAlcanca(papel, pasta.minimo);
    });
    return { pasta: pasta.id, sobrando, faltando };
  }).filter(r => r.sobrando.length > 0 || r.faltando.length > 0);
}

/* ── A colaboração, que é o requisito 6 ───────────────────────────────────── */

/**
 * As peças cujo histórico tem mais de uma pessoa escrevendo.
 *
 * Quem responde é `quemEscreveu`, da CC-ES006, que já deixa de fora quem só
 * abriu o arquivo — ler não é participar, e um histórico que contasse leitura
 * deixaria "produzimos juntos" verdadeiro para quem só olhou. O requisito
 * pede **no mínimo uma outra pessoa**, então a conta é "alguém além de você",
 * e não "duas pessoas": um conjunto feito por Marta e Ronaldo sem você teria
 * duas e não seria seu.
 */
export function pecasComColaboracao(p: ProjetoDocumental): string[] {
  return p.nuvem.arquivos
    .filter(a => a.tipo !== 'pasta' && !a.naLixeira
      && quemEscreveu(a).some(quem => quem !== 'voce')
      && quemEscreveu(a).includes('voce'))
    .map(a => a.id);
}

/* ── Os quinze minutos, que são o requisito 8 ─────────────────────────────── */

export const MINUTOS_DA_APRESENTACAO = 15;

export const dentroDoTempo = (p: ProjetoDocumental): boolean =>
  p.minutosDaDemonstracao !== null && p.minutosDaDemonstracao <= MINUTOS_DA_APRESENTACAO;

/* ── Como o número se escreve ─────────────────────────────────────────────── */

/**
 * O número como a peça o imprime.
 *
 * Sai de `mostrar`/`mostrarNumero`, que é o formatador da plataforma, e não de
 * um `toFixed` escrito aqui: a planilha e a peça têm de dizer o mesmo número
 * com os mesmos dígitos, senão a divergência que o requisito 8 manda ver
 * apareceria também quando os dois concordam.
 */
export const escreverNumero = (n: number, formato?: Formato): string =>
  (formato ? mostrar(num(n), formato) : mostrarNumero(n));
