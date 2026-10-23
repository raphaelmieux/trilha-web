/**
 * As nove lições da CC-DG006 Projeto de Design, e o que cada uma cobra.
 *
 * ── Um projeto, cinco telas ──────────────────────────────────────────────
 * A proposta, o processo, o retorno e a apresentação são tela da
 * plataforma, porque nenhum programa de design tem onde guardá-los — é a
 * regra do caderno da CC-ES009. O símbolo e o post abrem o editor de design;
 * a foto, o editor de pontos; o convite, o programa de diagramação; e a
 * entrega, a nuvem. São as janelas das veredas que o requisito 1 exige antes
 * desta, e nenhuma ganhou cópia: elas recebem o estado do projeto e devolvem
 * o que mudou.
 *
 * ── Cada lição parte do conserto da anterior ─────────────────────────────
 * `estadoDepois` é a referência de cada uma, e a lição seguinte começa nela.
 * É o arranjo do boletim da CC-DG005 e da marca da CC-DG004: mandar refazer o
 * símbolo para poder fazer o post ensinaria que o trabalho de antes não
 * conta.
 */

import {
  contrasteFunciona, mesmaPeca, umaPrancha,
  type Arte, type Prancha,
} from './design';
import { exportarPdf, type Documento as Diagramacao, type Pdf } from './diagramacao';
import type { Documento as Foto } from './raster';
import { imagemDo } from './raster';
import { exportar } from './formatosDeImagem';
import {
  arquivoDaCrua, fotoAjustada, fotoCrua, luzCerta, nivelada, type ArquivoNaPasta,
} from './metasDaCcDg003';
import { arquivoDe, mandarParaALixeira, mover, pastasAcima, type Nuvem } from './arquivoCompartilhado';
import {
  CREDITO_DA_FOGUEIRA, HOJE, IMAGENS_DO_PROJETO, MAPA_DA_ENTREGA, NOMES_DOS_FINAIS, NOME_DA_CRUA,
  NOME_DA_TRATADA, PASTA_DO_PROJETO, RESPONDENTES, arteComPost, arteComSimbolo, arteDePartida,
  conviteArrumado, conviteComoChegou, imagemDoProjeto, pastaComoChegou, postAdaptado, postEncolhido,
} from './acampamentoDasFamilias';
import {
  PALAVRAS_DA_ALTERACAO, PALAVRAS_DA_DEMANDA, PALAVRAS_DA_IDEIA, PARTES_DA_FALA, PECAS_DO_PROJETO,
  PRANCHA_DO_POST, PRANCHA_DO_SIMBOLO, PROPOSTA_EM_BRANCO, MINUTOS_DA_APRESENTACAO,
  conviteImprimivel, creditaA, detalhesQueSomemEm, enviarParaAprovacao, essenciaisQueFaltam,
  finaisNoPadrao, imagensNa, letraDoCelular, levaOSimbolo, minutosDo, motivosProprios, origemCerta,
  palavrasDe, palavrasDoPost, pecasNoCentro, pecasNosDois, pdfDoConvitePronto, proporcaoDoMeio,
  publicoDefinido, sem, simboloDa, soltosNaRaiz, textoDoConvite, textoDoPost, usaImagem, versoesDoArquivo,
  PALAVRAS_DO_POST,
  type Alteracao, type DecisaoDeVersao, type Leitura, type OrigemDeclarada, type PropostaDeDesign,
  type Rascunho, type Roteiro,
} from './projetoDeDesign';

export type LicaoDaCcDg006 =
  | 'proposta' | 'simbolo' | 'imagens' | 'impressa' | 'digital'
  | 'processo' | 'arquivos' | 'retorno' | 'apresentacao';

/** Em que tela a lição começa. `plataforma` é o caderno do projeto. */
export type ProgramaDaLicao = 'plataforma' | 'design' | 'foto' | 'diagramador' | 'nuvem';

/** O que o projeto guarda que nenhum programa de design tem onde guardar. */
export interface CadernoDoProjeto {
  origens: Record<string, OrigemDeclarada>;
  credito: string;
  rascunhos: Rascunho[];
  versoes: Record<string, DecisaoDeVersao>;
  doPublico: string[];
  leitura: Record<string, Leitura>;
  alteracao: Alteracao;
  roteiro: Roteiro;
  levaImpressa: boolean;
}

export const CADERNO_VAZIO: CadernoDoProjeto = {
  origens: {}, credito: '', rascunhos: [], versoes: {}, doPublico: [], leitura: {},
  alteracao: { respondente: '', oQueMudou: '' }, roteiro: {}, levaImpressa: false,
};

export interface ContextoDoProjetoDeDesign {
  proposta: PropostaDeDesign;
  /**
   * Começou a produzir antes de a proposta voltar aprovada.
   *
   * É o campo da CC-ES012, pelo motivo escrito lá: sem ele, "a execução não
   * pode ser iniciada antes da aprovação" seria uma frase do enunciado sem
   * nada por trás, e fazer tudo e pedir aprovação depois fecharia a lição.
   */
  comecouAntes: boolean;
  arte: Arte;
  foto: Foto;
  pasta: ArquivoNaPasta[];
  convite: Diagramacao;
  pdfs: Pdf[];
  nuvem: Nuvem;
  caderno: CadernoDoProjeto;
  descobertas: string[];
}

/** A chave que o editor de design avisa quando alguém confere o símbolo em três tamanhos. */
export const VIU_OS_TAMANHOS = `tamanhos:${PRANCHA_DO_SIMBOLO}`;

export interface MetaDoProjetoDeDesign {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoDoProjetoDeDesign) => boolean;
}

const mesmoConjunto = (a: string[], b: string[]) => a.length === b.length && a.every(x => b.includes(x));
const prancha = (c: ContextoDoProjetoDeDesign, id: string): Prancha | undefined => umaPrancha(c.arte, id);
const simboloDoProjeto = (c: ContextoDoProjetoDeDesign) => simboloDa(prancha(c, PRANCHA_DO_SIMBOLO));
const ehClipart = (nome: string) => sem(nome).includes('clipart');

/* ── Módulo 1: a proposta ─────────────────────────────────────────────────── */

const METAS_DA_PROPOSTA: MetaDoProjetoDeDesign[] = [
  {
    id: 'demanda-e-publico',
    titulo: 'Dizer a demanda e o público',
    detalhe: 'O que o clube precisa que alguém fique sabendo, e quem é esse alguém. "Todo mundo" não é público.',
    onde: 'Caderno → Proposta',
    passos: [
      `Escreva a demanda com pelo menos ${PALAVRAS_DA_DEMANDA} palavras: o que precisa ser comunicado, e o que acontece hoje.`,
      'Diga quem precisa ficar sabendo, e de que idade.',
    ],
    feita: c => palavrasDe(c.proposta.demanda).length >= PALAVRAS_DA_DEMANDA && publicoDefinido(c.proposta.publico),
  },
  {
    id: 'quatro-pecas',
    titulo: 'Prometer as quatro peças, e o meio da digital',
    detalhe: 'A impressa, a digital, o símbolo e as imagens tratadas. E onde a digital vai circular, que é de onde sai a proporção dela.',
    onde: 'Caderno → Proposta → Peças',
    passos: ['Marque as quatro peças.', 'Escreva onde a peça digital vai ser vista.'],
    feita: c => PECAS_DO_PROJETO.every(p => c.proposta.pecas.includes(p.id)) && c.proposta.meio.trim() !== '',
  },
  {
    id: 'aprovada-antes',
    titulo: 'Ter a proposta aprovada antes de começar',
    detalhe: 'O requisito diz que a execução não pode começar antes da aprovação. Aprovar o que já está pronto não deixa o examinador mudar nada.',
    onde: 'Caderno → Proposta → Enviar para aprovação',
    passos: ['Envie a proposta.', 'Se ela voltar, leia o que falta e envie de novo.', 'Só depois de aprovada, comece a produzir.'],
    feita: c => c.proposta.aprovadaEm !== null && !c.comecouAntes,
  },
];

/* ── Módulo 2: o símbolo ──────────────────────────────────────────────────── */

const METAS_DO_SIMBOLO: MetaDoProjetoDeDesign[] = [
  {
    id: 'simbolo-seu',
    titulo: 'Desenhar o símbolo em vetor, e agrupá-lo',
    detalhe: 'Pelo menos duas formas suas, num grupo — e a primeira ideia continua no arquivo, porque ela é processo.',
    onde: 'Prancha Símbolo',
    passos: [
      'Desenhe as formas do símbolo com as ferramentas de forma e a caneta.',
      'Selecione todas e agrupe (Ctrl+G).',
      'Não apague a prancha da primeira ideia: ela vai ser mostrada ao examinador.',
    ],
    feita: c => simboloDoProjeto(c) !== null && !!prancha(c, 'simbolo-tentativa'),
  },
  {
    id: 'sem-clipart',
    titulo: 'Tirar o clipart do símbolo',
    detalhe: 'Ele veio de um site de ícones grátis que não diz a licença: não é seu, e não pode ser o símbolo do projeto.',
    onde: 'Prancha Símbolo',
    passos: ['Selecione a imagem baixada.', 'Exclua (Del).'],
    feita: c => simboloDoProjeto(c) !== null && imagensNa(prancha(c, PRANCHA_DO_SIMBOLO)).length === 0,
  },
  {
    id: 'le-pequeno',
    titulo: 'Conferir o símbolo pequeno',
    detalhe: 'Ele vai aparecer no canto do post e no rodapé do convite. Nada dele pode sumir com 32 pixels de lado.',
    onde: 'Exibir → Tamanhos do ícone',
    passos: ['Abra Exibir → Tamanhos do ícone.', 'Engrosse o que sumir no tamanho pequeno.'],
    feita: c => {
      const s = simboloDoProjeto(c);
      return !!s && detalhesQueSomemEm(s).length === 0 && c.descobertas.includes(VIU_OS_TAMANHOS);
    },
  },
];

/* ── Módulo 3: as imagens ─────────────────────────────────────────────────── */

const ehATratada = (a: ArquivoNaPasta) => a.nome !== NOME_DA_CRUA && nivelada(a.imagem) && luzCerta(a.imagem);
const cruaIntacta = (c: ContextoDoProjetoDeDesign) => c.pasta.some(a => a.nome === NOME_DA_CRUA && a.original);

const METAS_DAS_IMAGENS: MetaDoProjetoDeDesign[] = [
  {
    id: 'tratou-a-foto',
    titulo: 'Tratar a foto do acampamento, e guardar o original',
    detalhe: 'Nivelada e com a luz de volta, exportada com outro nome — o arquivo do celular continua como veio.',
    onde: 'Editor de foto',
    passos: [
      'Endireite a foto pelo horizonte.',
      'Devolva a luz em Ajustes.',
      'Exporte com um nome novo, sem escrever por cima do original.',
    ],
    feita: c => c.pasta.some(ehATratada) && cruaIntacta(c),
  },
  {
    id: 'declarou-as-origens',
    titulo: 'Declarar a origem de cada imagem',
    detalhe: 'De quem é cada uma e com que licença: a do clube, a da fotógrafa e a do site de ícones.',
    onde: 'Caderno → De onde vem cada imagem',
    passos: ['Leia de onde cada imagem veio.', 'Marque a licença e escreva quem fez.'],
    feita: c => IMAGENS_DO_PROJETO.every(i => origemCerta(i, c.caderno.origens[i.id])),
  },
  {
    id: 'escreveu-o-credito',
    titulo: 'Escrever o crédito da fogueira',
    detalhe: 'A licença CC BY deixa usar com uma condição: dizer quem fez, e com que licença.',
    onde: 'Caderno → Crédito',
    passos: ['Escreva o nome da fotógrafa e a licença, do jeito que vai sair no convite.'],
    feita: c => creditaA(c.caderno.credito, imagemDoProjeto('fogueira')),
  },
];

/* ── Módulo 4: a peça impressa ────────────────────────────────────────────── */

const METAS_DA_IMPRESSA: MetaDoProjetoDeDesign[] = [
  {
    id: 'simbolo-no-convite',
    titulo: 'Trocar o clipart pelo símbolo',
    detalhe: 'O convite leva o símbolo do projeto, e não a imagem baixada.',
    onde: 'Quadro de imagem → Imagem a pôr',
    passos: ['Exclua o quadro do clipart.', 'Crie um quadro de imagem com o símbolo.svg.'],
    feita: c => usaImagem(c.convite, 'simbolo') && !usaImagem(c.convite, 'clipart'),
  },
  {
    id: 'foto-tratada-sangrando',
    titulo: 'Pôr a foto tratada, sangrando',
    detalhe: 'A do celular sai torta e escura; a tratada passa 3 mm da borda e tem resolução de impressão.',
    onde: 'Página → quadro da foto',
    passos: [
      'Exclua o quadro da foto crua e crie um com a tratada.',
      'Leve-o a X -3, Y -3, com 154 mm de largura.',
      'Confira se o ppi não ficou vermelho.',
    ],
    feita: c => !usaImagem(c.convite, 'acampamento') && usaImagem(c.convite, 'tratada') && conviteImprimivel(c.convite),
  },
  {
    id: 'diz-onde',
    titulo: 'Dizer onde',
    detalhe: 'O quê, quando e onde. O convite diz os dois primeiros e esquece o lugar, que quem escreveu sabe de cor.',
    onde: 'Texto → Editar matéria → parágrafo novo',
    passos: ['Abra Editar matéria.', 'Acrescente um parágrafo com o lugar e a saída do ônibus.'],
    feita: c => essenciaisQueFaltam(textoDoConvite(c.convite)).length === 0,
  },
  {
    id: 'credita-a-fogueira',
    titulo: 'Creditar a fogueira, ou tirá-la',
    detalhe: 'Usar uma imagem CC BY sem o crédito é usá-la como se fosse protegida.',
    onde: 'Texto → Editar matéria → parágrafo novo',
    passos: ['Acrescente o crédito como legenda, com o nome da fotógrafa e a licença.'],
    feita: c => !usaImagem(c.convite, 'fogueira') || creditaA(textoDoConvite(c.convite), imagemDoProjeto('fogueira')),
  },
  {
    id: 'pdf-da-grafica',
    titulo: 'Exportar o PDF da gráfica',
    detalhe: 'Sangria, marcas de corte e CMYK — e exportado do convite como ele está agora.',
    onde: 'Arquivo → Exportar PDF',
    passos: ['Exporte com 3 mm de sangria, marcas de corte e cor em CMYK.', 'Mexeu depois? Exporte de novo.'],
    feita: c => pdfDoConvitePronto(c.convite, c.pdfs),
  },
];

/* ── Módulo 5: a peça digital ─────────────────────────────────────────────── */

const post = (c: ContextoDoProjetoDeDesign) => prancha(c, PRANCHA_DO_POST);

const METAS_DA_DIGITAL: MetaDoProjetoDeDesign[] = [
  {
    id: 'guardou-o-encolhido',
    titulo: 'Guardar o post encolhido antes de refazer',
    detalhe: 'Ele é a versão descartada que o examinador vai ver: duplique a prancha antes de mexer.',
    onde: 'Prancha → Duplicar prancha',
    passos: ['Duplique a prancha do post.', 'Refaça a original; a cópia fica como estava.'],
    feita: c => c.arte.pranchas.some(p => p.id !== PRANCHA_DO_POST && mesmaPeca(p, postEncolhido())),
  },
  {
    id: 'proporcao-do-feed',
    titulo: 'Dar ao post a proporção do meio',
    detalhe: 'Quadrado, retrato ou story. A folha A5 não é nenhuma delas, e o feed a corta.',
    onde: 'Prancha → Tamanho da prancha',
    passos: ['Clique fora de tudo para ver a prancha.', 'Escolha o tamanho do lugar em que o post vai circular.'],
    feita: c => { const p = post(c); return !!p && proporcaoDoMeio(p); },
  },
  {
    id: 'letra-do-celular',
    titulo: 'Letra de celular',
    detalhe: 'Nenhum texto abaixo de 40 pixels no post de 1080, e todos lidos contra o fundo.',
    onde: 'Propriedades → Corpo',
    passos: ['Aumente cada texto até pelo menos 40.', 'Confira o contraste de cada um no medidor.'],
    feita: c => { const p = post(c); return !!p && letraDoCelular(p) && contrasteFunciona(p); },
  },
  {
    id: 'so-o-essencial',
    titulo: 'Cortar até o essencial',
    detalhe: `No máximo ${PALAVRAS_DO_POST} palavras — e o quê, quando e onde continuam lá.`,
    onde: 'Prancha Post',
    passos: ['Tire o parágrafo do convite.', 'Encurte o que sobrou, sem perder o quê, o quando e o onde.'],
    feita: c => {
      const p = post(c);
      return !!p && palavrasDoPost(p) <= PALAVRAS_DO_POST && essenciaisQueFaltam(textoDoPost(p)).length === 0;
    },
  },
  {
    id: 'mesmo-simbolo',
    titulo: 'Pôr o símbolo do projeto no post',
    detalhe: 'O mesmo do convite, copiado da prancha do símbolo. O clipart sai.',
    onde: 'Prancha Símbolo → Copiar; Prancha Post → Colar',
    passos: ['Copie o grupo do símbolo.', 'Cole no post e diminua com o grupo inteiro.', 'Exclua o clipart.'],
    feita: c => {
      const p = post(c);
      return !!p && levaOSimbolo(p, simboloDoProjeto(c)) && !imagensNa(p).some(o => ehClipart(o.nome));
    },
  },
];

/* ── Módulo 6: o processo ─────────────────────────────────────────────────── */

export const RASCUNHOS_MINIMOS = 3;

const METAS_DO_PROCESSO: MetaDoProjetoDeDesign[] = [
  {
    id: 'rascunhos',
    titulo: 'Registrar os rascunhos à mão',
    detalhe: `Pelo menos ${RASCUNHOS_MINIMOS}, cada um com a ideia dele em poucas palavras.`,
    onde: 'Caderno → Rascunhos',
    passos: ['Fotografe ou guarde os rascunhos de papel.', 'Escreva a ideia de cada um.'],
    feita: c => {
      const ideias = c.caderno.rascunhos.map(r => sem(r.ideia)).filter(i => palavrasDe(i).length >= PALAVRAS_DA_IDEIA);
      return new Set(ideias).size >= RASCUNHOS_MINIMOS;
    },
  },
  {
    id: 'versoes-com-motivo',
    titulo: 'Dizer por que cada versão foi descartada',
    detalhe: 'Cada versão guardada no arquivo, com um motivo próprio. O mesmo motivo duas vezes não explica nenhuma.',
    onde: 'Caderno → Versões do arquivo',
    passos: ['Para cada versão, marque que ela foi descartada.', 'Escreva o que estava errado nela, com o que você viu.'],
    feita: c => {
      const vs = versoesDoArquivo(c.arte);
      const ds = vs.map(v => c.caderno.versoes[v.id]);
      return vs.length >= 2 && ds.every(d => d?.descartada) && motivosProprios(ds.map(d => d?.motivo ?? ''));
    },
  },
];

/* ── Módulo 7: a entrega ──────────────────────────────────────────────────── */

const vivos = (n: Nuvem) => n.arquivos.filter(a => !a.naLixeira);
/* Fora é fora do projeto em qualquer profundidade: guardá-lo numa subpasta
   continua sendo entregá-lo junto. */
const clipartFora = (n: Nuvem) => {
  const c = n.arquivos.find(a => a.id === 'f-clipart');
  return !c || !!c.naLixeira || !(c.pasta === PASTA_DO_PROJETO || pastasAcima(n, c.id).some(p => p.id === PASTA_DO_PROJETO));
};
/** Nenhum arquivo do projeto se perdeu no caminho: só o clipart sai. */
const nadaPerdido = (n: Nuvem) => Object.keys(MAPA_DA_ENTREGA)
  .filter(id => id !== 'f-clipart').every(id => vivos(n).some(a => a.id === id));

const METAS_DA_ENTREGA: MetaDoProjetoDeDesign[] = [
  {
    id: 'editavel-e-final',
    titulo: 'Separar o editável do final',
    detalhe: 'Uma pasta de editáveis e uma de finais, e cada uma das quatro peças com o seu arquivo em cada.',
    onde: 'Nuvem → Novo → Pasta; Mover para',
    passos: ['Crie as pastas Editáveis e Finais dentro do projeto.', 'Mova cada arquivo para a sua.'],
    feita: c => pecasNosDois(c.nuvem, PASTA_DO_PROJETO, MAPA_DA_ENTREGA).length === PECAS_DO_PROJETO.length,
  },
  {
    id: 'nada-solto',
    titulo: 'Não deixar nada solto na pasta do projeto',
    detalhe: 'Os originais e as versões também têm lugar, e nenhum arquivo do projeto vai para a lixeira.',
    onde: 'Nuvem → Mover para',
    passos: ['Crie uma pasta para os originais e as versões.', 'Mova o que sobrou.'],
    feita: c => soltosNaRaiz(c.nuvem, PASTA_DO_PROJETO).length === 0 && nadaPerdido(c.nuvem),
  },
  {
    id: 'clipart-fora',
    titulo: 'Não entregar o que não é seu',
    detalhe: 'O clipart não entrou em peça nenhuma, e a licença dele não deixa distribuí-lo.',
    onde: 'Nuvem → Mover para a lixeira',
    passos: ['Mande o clipart para a lixeira.'],
    feita: c => clipartFora(c.nuvem) && nadaPerdido(c.nuvem),
  },
  {
    id: 'finais-no-padrao',
    titulo: 'Nomear os finais com data e versão',
    detalhe: 'O padrão da CC-ES001: cada final com data e versão, e todos no mesmo molde.',
    onde: 'Nuvem → Renomear',
    passos: ['Renomeie cada arquivo da pasta de finais com a data e a versão, sempre do mesmo jeito.'],
    feita: c => finaisNoPadrao(c.nuvem, PASTA_DO_PROJETO, MAPA_DA_ENTREGA),
  },
];

/* ── Módulo 8: o retorno ──────────────────────────────────────────────────── */

const doPublico = RESPONDENTES.filter(r => r.doPublico);

const METAS_DO_RETORNO: MetaDoProjetoDeDesign[] = [
  {
    id: 'cinco-do-publico',
    titulo: 'Separar as cinco pessoas do público',
    detalhe: 'O requisito pede cinco do público-alvo. Quem não é do público também opina, e a opinião é sobre outra coisa.',
    onde: 'Caderno → Retorno',
    passos: ['Leia quem é cada pessoa.', 'Marque só as que são do público que a proposta escolheu.'],
    feita: c => mesmoConjunto(c.caderno.doPublico, doPublico.map(r => r.id)),
  },
  {
    id: 'leu-cada-um',
    titulo: 'Ler cada retorno: muda ou fica',
    detalhe: 'Muda o que falta para alguém do público decidir ir; fica o que é gosto. Seguir todo comentário é tão errado quanto não seguir nenhum.',
    onde: 'Caderno → Retorno',
    passos: ['Para cada pessoa do público, decida se o comentário pede mudança.'],
    feita: c => doPublico.every(r => c.caderno.leitura[r.id] === r.leitura),
  },
  {
    id: 'mudou-a-peca',
    titulo: 'Fazer uma mudança que o público pediu, e registrá-la',
    detalhe: 'A mudança aparece no post, e o post continua se lendo no celular.',
    onde: 'Editor → Post; Caderno → O que mudou',
    passos: [
      'Escolha um comentário que pede mudança.',
      'Faça a mudança no post.',
      `Escreva, com pelo menos ${PALAVRAS_DA_ALTERACAO} palavras, o que mudou e por quê.`,
    ],
    feita: c => {
      const r = RESPONDENTES.find(x => x.id === c.caderno.alteracao.respondente);
      const p = post(c);
      /* Só quem pede mudança tem o que atender: elogio, gosto e opinião de quem
         não é do público não trazem conta nenhuma, e não fecham a meta. */
      return !!r && !!p && !!r.atendido?.(p)
        && palavrasDe(c.caderno.alteracao.oQueMudou).length >= PALAVRAS_DA_ALTERACAO
        && proporcaoDoMeio(p) && letraDoCelular(p) && palavrasDoPost(p) <= PALAVRAS_DO_POST;
    },
  },
];

/* ── Módulo 9: a apresentação ─────────────────────────────────────────────── */

const METAS_DA_APRESENTACAO: MetaDoProjetoDeDesign[] = [
  {
    id: 'cabe-em-quinze',
    titulo: 'Caber em quinze minutos, com tudo o que se pede',
    detalhe: 'Demanda, peças, processo e retorno, cada um com pelo menos um minuto — e a soma até quinze.',
    onde: 'Caderno → Roteiro',
    passos: ['Dê minutos a cada parte.', 'Confira a soma.'],
    feita: c => {
      const r = c.caderno.roteiro;
      return minutosDo(r) <= MINUTOS_DA_APRESENTACAO
        && PARTES_DA_FALA.filter(p => p.obrigatoria).every(p => (r[p.id] ?? 0) >= 1);
    },
  },
  {
    id: 'pecas-no-centro',
    titulo: 'Dar às peças a maior parte do tempo',
    detalhe: 'É delas que o examinador vai perguntar. Nenhuma outra parte leva mais minutos que elas.',
    onde: 'Caderno → Roteiro',
    passos: ['Confira se as peças têm pelo menos tantos minutos quanto a maior das outras partes.'],
    feita: c => pecasNoCentro(c.caderno.roteiro),
  },
  {
    id: 'leva-a-impressa',
    titulo: 'Levar a peça impressa',
    detalhe: 'O requisito pede a peça impressa em mãos — e ela sai do PDF da gráfica, que já está pronto.',
    onde: 'Caderno → Roteiro',
    passos: ['Marque que a peça impressa vai junto.'],
    feita: c => c.caderno.levaImpressa && pdfDoConvitePronto(c.convite, c.pdfs),
  },
];

/* ── As referências: como cada lição termina ──────────────────────────────── */

export const PROPOSTA_DE_REFERENCIA: PropostaDeDesign = enviarParaAprovacao({
  ...PROPOSTA_EM_BRANCO,
  demanda: 'As famílias dos desbravadores novos ficam sabendo do Acampamento das Famílias na véspera, por um áudio no grupo, e metade não vai.',
  publico: 'Pais, mães e avós dos desbravadores que entraram este ano',
  meio: 'O grupo de mensagens das famílias e o perfil do clube na rede social',
  pecas: PECAS_DO_PROJETO.map(p => p.id),
}, HOJE);

export const ORIGENS_DE_REFERENCIA: Record<string, OrigemDeclarada> = {
  acampamento: { licenca: 'propria', autor: 'Célia Moura, secretária do clube' },
  fogueira: { licenca: 'livre', autor: 'Ana Souza' },
  clipart: { licenca: 'protegida', autor: '' },
};

export const RASCUNHOS_DE_REFERENCIA: Rascunho[] = [
  { ideia: 'Barraca com a porta aberta, convidando a entrar' },
  { ideia: 'Fogueira com duas pessoas grandes e uma pequena' },
  { ideia: 'Mão de adulto segurando mão de criança na trilha' },
];

export const VERSOES_DE_REFERENCIA: Record<string, DecisaoDeVersao> = {
  'simbolo-tentativa': { descartada: true, motivo: 'Feita de traço fino, a barraca sumia inteira com 32 pixels no canto do post.' },
  'post-encolhido': { descartada: true, motivo: 'Era o convite encolhido: proporção de folha, letra de sete pixels no celular e texto demais.' },
};

export const ALTERACAO_DE_REFERENCIA: Alteracao = {
  respondente: 'lucia',
  oQueMudou: 'Pus o horário na linha da data, das 8h às 17h, porque a Lúcia trabalha até meio-dia e não sabia se dava tempo.',
};

export const ROTEIRO_DE_REFERENCIA: Roteiro = { demanda: 2, proposta: 1, pecas: 5, processo: 3, retorno: 2, perguntas: 2 };

/** A foto tratada, exportada com outro nome: o original do celular continua na pasta. */
let tratada: ArquivoNaPasta | undefined;
export const arquivoDaTratada = (): ArquivoNaPasta =>
  (tratada ??= { ...exportar(imagemDo(fotoAjustada()), 'jpg', NOME_DA_TRATADA, 90), original: false });

/** O post depois do retorno: a hora volta para a linha da data. */
export function postComAHora(): Prancha {
  const p = postAdaptado();
  return { ...p, objetos: p.objetos.map(o => (o.tipo === 'texto' && o.id === 'pa-data' ? { ...o, texto: 'Sábado, 14 de setembro, 8h às 17h' } : o)) };
}

/** A pasta da entrega organizada como a referência a deixa. */
export function pastaOrganizada(): Nuvem {
  let n: Nuvem = pastaComoChegou();
  n = { arquivos: [...n.arquivos,
    arquivoDe('pasta-editaveis', 'Editáveis', 'pasta', 'voce', { pasta: PASTA_DO_PROJETO }),
    arquivoDe('pasta-finais', 'Finais', 'pasta', 'voce', { pasta: PASTA_DO_PROJETO }),
    arquivoDe('pasta-originais', 'Originais e versões', 'pasta', 'voce', { pasta: PASTA_DO_PROJETO }),
  ] };
  for (const [id, x] of Object.entries(MAPA_DA_ENTREGA)) {
    if (x.papel === 'editavel') n = mover(n, id, 'pasta-editaveis');
    else if (x.papel === 'final') n = mover(n, id, 'pasta-finais');
    else if (x.papel === 'clipart') n = mandarParaALixeira(n, id);
    else n = mover(n, id, 'pasta-originais');
  }
  return { arquivos: n.arquivos.map(a => (NOMES_DOS_FINAIS[a.id] ? { ...a, nome: NOMES_DOS_FINAIS[a.id] } : a)) };
}

export interface LicaoDoProjetoDeDesign {
  programa: ProgramaDaLicao;
  /** A prancha à vista, quando a lição abre o editor de design. */
  prancha?: string;
  /** Se a lição tem o caderno ao lado do programa. */
  caderno: boolean;
  /**
   * Abre no caderno, e não no programa. O retorno começa pelo que as pessoas
   * disseram, e só então vai ao post: mudar antes de ler é mudar no escuro.
   */
  abreNoCaderno?: boolean;
  contexto: () => ContextoDoProjetoDeDesign;
  metas: MetaDoProjetoDeDesign[];
}

function partida(): ContextoDoProjetoDeDesign {
  return {
    proposta: PROPOSTA_EM_BRANCO, comecouAntes: false,
    arte: arteDePartida(),
    foto: fotoCrua(), pasta: [arquivoDaCrua()],
    convite: conviteComoChegou(), pdfs: [],
    nuvem: pastaComoChegou(),
    caderno: CADERNO_VAZIO,
    descobertas: [],
  };
}

const ORDEM: LicaoDaCcDg006[] = ['proposta', 'simbolo', 'imagens', 'impressa', 'digital', 'processo', 'arquivos', 'retorno', 'apresentacao'];

/** Como cada lição termina na referência. A seguinte começa aqui. */
export function estadoDepois(licao: LicaoDaCcDg006): ContextoDoProjetoDeDesign {
  const antes = ORDEM.indexOf(licao) === 0 ? partida() : estadoDepois(ORDEM[ORDEM.indexOf(licao) - 1]);
  const cad = antes.caderno;
  switch (licao) {
    case 'proposta':
      return { ...antes, proposta: PROPOSTA_DE_REFERENCIA };
    case 'simbolo':
      return { ...antes, arte: arteComSimbolo(), descobertas: [...antes.descobertas, VIU_OS_TAMANHOS] };
    case 'imagens':
      return {
        ...antes, foto: fotoAjustada(), pasta: [...antes.pasta, arquivoDaTratada()],
        caderno: { ...cad, origens: ORIGENS_DE_REFERENCIA, credito: CREDITO_DA_FOGUEIRA },
      };
    case 'impressa': {
      const convite = conviteArrumado();
      return { ...antes, convite, pdfs: [exportarPdf(convite, 'convite.pdf', { sangria: 3, marcasDeCorte: true, cor: 'cmyk' })] };
    }
    case 'digital':
      return { ...antes, arte: arteComPost() };
    case 'processo':
      return { ...antes, caderno: { ...cad, rascunhos: RASCUNHOS_DE_REFERENCIA, versoes: VERSOES_DE_REFERENCIA } };
    case 'arquivos':
      return { ...antes, nuvem: pastaOrganizada() };
    case 'retorno':
      return {
        ...antes,
        arte: { ...antes.arte, pranchas: antes.arte.pranchas.map(p => (p.id === PRANCHA_DO_POST ? postComAHora() : p)) },
        caderno: {
          ...cad,
          doPublico: doPublico.map(r => r.id),
          leitura: Object.fromEntries(doPublico.map(r => [r.id, r.leitura])),
          alteracao: ALTERACAO_DE_REFERENCIA,
        },
      };
    case 'apresentacao':
      return { ...antes, caderno: { ...cad, roteiro: ROTEIRO_DE_REFERENCIA, levaImpressa: true } };
    default: {
      const nunca: never = licao;
      return nunca;
    }
  }
}

/** A lição começa onde a anterior terminou. */
const contextoDe = (licao: LicaoDaCcDg006) => () => {
  const i = ORDEM.indexOf(licao);
  return i === 0 ? partida() : estadoDepois(ORDEM[i - 1]);
};

export const LICOES_DA_CC_DG006: Record<LicaoDaCcDg006, LicaoDoProjetoDeDesign> = {
  proposta: { programa: 'plataforma', caderno: true, contexto: contextoDe('proposta'), metas: METAS_DA_PROPOSTA },
  simbolo: { programa: 'design', prancha: PRANCHA_DO_SIMBOLO, caderno: false, contexto: contextoDe('simbolo'), metas: METAS_DO_SIMBOLO },
  imagens: { programa: 'foto', caderno: true, contexto: contextoDe('imagens'), metas: METAS_DAS_IMAGENS },
  impressa: { programa: 'diagramador', caderno: false, contexto: contextoDe('impressa'), metas: METAS_DA_IMPRESSA },
  digital: { programa: 'design', prancha: PRANCHA_DO_POST, caderno: false, contexto: contextoDe('digital'), metas: METAS_DA_DIGITAL },
  processo: { programa: 'plataforma', caderno: true, contexto: contextoDe('processo'), metas: METAS_DO_PROCESSO },
  arquivos: { programa: 'nuvem', caderno: false, contexto: contextoDe('arquivos'), metas: METAS_DA_ENTREGA },
  retorno: { programa: 'design', prancha: PRANCHA_DO_POST, caderno: true, abreNoCaderno: true, contexto: contextoDe('retorno'), metas: METAS_DO_RETORNO },
  apresentacao: { programa: 'plataforma', caderno: true, contexto: contextoDe('apresentacao'), metas: METAS_DA_APRESENTACAO },
};

export const metasDa = (licao: LicaoDaCcDg006) => LICOES_DA_CC_DG006[licao].metas;
