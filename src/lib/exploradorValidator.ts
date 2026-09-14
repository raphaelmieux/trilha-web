import {
  DOCUMENTOS, LIXEIRA, acharNo, caminhoDe,
  type No, type Coluna, type FiltroDaBusca,
} from '../labs/arquivos';
import { profundidade } from '../labs/roteiroDaEstrutura';
import {
  BACKUP, RELATORIO, SUMIU, VERSAO_PERDIDA, DEZ_MAL_NOMEADOS,
} from '../labs/discoDoClube';
import {
  PENDRIVE, gravadosDeVerdade, type DispositivoExterno,
} from '../labs/dispositivoExterno';

/**
 * O que cada laboratório da CC-ES001 cobra, e como se confere.
 *
 * ── O que se lê aqui é o disco, e não o clique ───────────────────────────
 * Vale o que está escrito em `terminalValidator.ts`: quase toda verificação
 * olha o **resultado**, e não o gesto. Conferir o clique seria a armadilha de
 * sempre — apertar "Compactar" com nada selecionado é um clique que não faz
 * pacote nenhum, e um teste de clique aprovaria.
 *
 * As exceções são as que não deixam marca no disco. Extrair um pacote cujo
 * original continua lá produz uma árvore indistinguível da de quem copiou os
 * arquivos à mão; restaurar da Lixeira devolve a árvore exatamente ao que ela
 * era; e "Salvar como" grava um arquivo novo igualzinho ao que qualquer outro
 * caminho gravaria. Para essas, o que se guarda é o gesto — e ainda assim ele
 * precisa ter **funcionado**, e não só ter sido tentado.
 *
 * ── E o disco de partida entra na conta ──────────────────────────────────
 * O contexto carrega a árvore de agora **e** a de quando a lição abriu. É o
 * que permite perguntar "o que esta pessoa fez", e não "o que existe": o
 * relatório já nasce com histórico de versões, e uma trava que só olhasse
 * `versoes.length` diria que alguém salvou por cima antes de alguém abrir a
 * lição.
 *
 * ── A armadilha do vazio, de novo ────────────────────────────────────────
 * "Sem links quebrados" passava numa página sem link nenhum. Aqui ela toma
 * estas formas: três pastas vazias satisfazem "hierarquia de três níveis" sem
 * guardar nada; um pacote com um arquivo só é um pacote; esvaziar uma Lixeira
 * que nunca recebeu nada não demonstra exclusão; e remover com segurança um
 * pen drive sem nada dentro é um clique sem consequência. Todas exigem que
 * algo exista primeiro.
 */

export interface CheckResult {
  id: string;
  label: string;
  hint: string;
  passed: boolean;
  detail?: string;
}

/** O que não deixa marca no disco, e por isso é guardado como gesto. */
export interface GestosDoExplorador {
  /** As colunas por que já se ordenou nesta sessão. */
  ordenacoes: Coluna[];
  /** As buscas rodadas: o filtro usado e quantos resultados ela deu. */
  buscas: { filtro: FiltroDaBusca; achados: number }[];
  /** O Explorador está mostrando as extensões? */
  extensoesVisiveis: boolean;
  /** As extensões para as quais se escolheu o programa certo em "Abrir com". */
  associacoes: string[];
  /** Uma extração que trouxe conteúdo de verdade já aconteceu. */
  extraiu: boolean;
  /** "Salvar como": de que arquivo saiu, e qual nasceu. */
  salvouComo: { origem: string; novo: string }[];
  /** Os ids que foram para a Lixeira e voltaram para o lugar de origem. */
  restaurados: string[];
  /** A Lixeira foi esvaziada tendo arquivo dentro. */
  esvaziou: boolean;
}

export const gestosVazios = (): GestosDoExplorador => ({
  ordenacoes: [], buscas: [], extensoesVisiveis: false, associacoes: [],
  extraiu: false, salvouComo: [], restaurados: [], esvaziou: false,
});

export interface ContextoDoExplorador {
  /** O disco agora. */
  arvore: No[];
  /** O disco quando a lição abriu — é a diferença que diz o que se fez. */
  inicial: No[];
  dispositivo: DispositivoExterno;
  gestos: GestosDoExplorador;
}

interface Spec {
  id: string;
  label: string;
  hint: string;
  run: (c: ContextoDoExplorador) => { passed: boolean; detail?: string };
}

/* ── Ajudas ───────────────────────────────────────────────────────────────── */

const eraDoDisco = (c: ContextoDoExplorador, id: string) =>
  c.inicial.some(n => n.id === id);

/** As pastas que a pessoa criou e batizou — nem do disco, nem "Nova pasta". */
const pastasNovas = (c: ContextoDoExplorador): No[] =>
  c.arvore.filter(n => n.tipo === 'pasta'
    && !eraDoDisco(c, n.id)
    && !n.nome.startsWith('Nova pasta')
    && !caminhoDe(c.arvore, n.id).some(p => p.id === LIXEIRA));

/* ── Requisito 4.1 — a hierarquia de três níveis ──────────────────────────── */

const HIERARQUIA: Spec[] = [
  {
    id: 'tresNiveis',
    label: 'Montar uma hierarquia de três níveis, com nomes seus',
    hint: 'Uma pasta dentro de outra dentro de outra, as três batizadas por você.',
    run: c => {
      const novas = pastasNovas(c);
      /* O topo da corrente é a pasta nova cujo pai não é pasta nova: contar a
         profundidade a partir de qualquer uma delas mediria o pedaço de baixo
         e diria "um nível" para uma corrente de três. */
      const topos = novas.filter(n => !novas.some(o => o.id === n.paiId));
      const fundo = Math.max(0, ...topos.map(t => profundidade(c.arvore, t.id)));
      if (fundo >= 3) return { passed: true };
      return {
        passed: false,
        detail: fundo === 0
          ? 'Nenhuma pasta nova ainda. Crie a do projeto e dê nome a ela.'
          : `A corrente mais funda tem ${fundo} ${fundo === 1 ? 'nível' : 'níveis'}. Faltam ${3 - fundo}.`,
      };
    },
  },
  {
    id: 'guardouOProjeto',
    label: 'Guardar o material do projeto dentro da estrutura',
    hint: 'Leve pelo menos quatro arquivos da Área de Trabalho para dentro dela, em mais de uma pasta.',
    run: c => {
      /*
        Estrutura vazia não é organização — é o "zero link não é zero link
        quebrado" aplicado a pasta. E espalhar em duas pastas, e não numa só:
        jogar tudo no fundo da corrente usa três níveis para guardar um monte,
        que é o que a hierarquia existe para não fazer.
      */
      const novas = pastasNovas(c);
      const dentro = c.arvore.filter(n => n.tipo === 'arquivo'
        && DEZ_MAL_NOMEADOS.includes(n.nome as typeof DEZ_MAL_NOMEADOS[number])
        && novas.some(p => p.id === n.paiId));
      const espalhados = new Set(dentro.map(n => n.paiId));

      if (dentro.length >= 4 && espalhados.size >= 2) return { passed: true };
      return {
        passed: false,
        detail: dentro.length < 4
          ? `${dentro.length} de 4 arquivos guardados.`
          : 'Estão todos na mesma pasta. Divida entre pelo menos duas.',
      };
    },
  },
];

/* ── Requisito 4.5 — compactar e descompactar ─────────────────────────────── */

const PACOTE: Spec[] = [
  {
    id: 'compactou',
    label: 'Compactar um conjunto de arquivos num pacote só',
    hint: 'Selecione uma pasta com vários arquivos e mande compactar.',
    run: c => {
      const pacotes = c.arvore.filter(n => (n.empacotado?.length ?? 0) >= 3);
      if (pacotes.length) return { passed: true };
      const magros = c.arvore.filter(n => n.empacotado?.length);
      return {
        passed: false,
        detail: magros.length
          ? 'O pacote tem menos de três itens. Compactar um arquivo sozinho não junta nada.'
          : undefined,
      };
    },
  },
  {
    id: 'extraiu',
    label: 'Descompactar o pacote e conferir que saiu tudo',
    hint: 'Abra o pacote e mande extrair. O que sai é igual ao que entrou.',
    run: c => ({ passed: c.gestos.extraiu }),
  },
];

/* ── Requisitos 2 e 3 — salvar, salvar como, excluir e restaurar ──────────── */

const SALVAR_E_EXCLUIR: Spec[] = [
  {
    id: 'salvou',
    label: 'Editar um arquivo de texto e salvar por cima',
    hint: 'Abra um .txt, mude o texto e use Salvar. O nome não muda; o conteúdo, sim.',
    run: c => {
      /* Versão nova num arquivo que abriu sem nenhuma: o relatório já nasce
         com histórico, e sem esta conta ele diria que alguém salvou por cima
         antes de a lição abrir. */
      const salvos = c.arvore.filter(n => (n.versoes?.length ?? 0) > 0
        && (acharNo(c.inicial, n.id)?.versoes?.length ?? 0) === 0);
      return { passed: salvos.length > 0 };
    },
  },
  {
    id: 'salvouComo',
    label: 'Usar Salvar como e deixar o original intacto',
    hint: 'Mude o texto e use Salvar como, com outro nome. Depois confira o arquivo de antes.',
    run: c => {
      for (const { origem, novo } of c.gestos.salvouComo) {
        const a = acharNo(c.arvore, origem);
        const b = acharNo(c.arvore, novo);
        if (!a || !b) continue;
        /* Os dois precisam ter conteúdos diferentes. Salvar como sem mudar
           nada faz duas cópias iguais, que é copiar — e não é o que o
           requisito 2 manda mostrar. */
        if ((a.rotulo ?? '') !== (b.rotulo ?? '')) return { passed: true };
      }
      return {
        passed: false,
        detail: c.gestos.salvouComo.length
          ? 'O arquivo novo ficou igual ao antigo. Mude o texto antes de salvar como.'
          : undefined,
      };
    },
  },
  {
    id: 'restaurouDaLixeira',
    label: 'Excluir um arquivo e trazê-lo de volta',
    hint: 'Exclua, abra a Lixeira e mande Restaurar. Ele volta para a pasta de onde saiu.',
    run: c => ({
      passed: c.gestos.restaurados.some(id => {
        const n = acharNo(c.arvore, id);
        return !!n && !caminhoDe(c.arvore, id).some(p => p.id === LIXEIRA);
      }),
    }),
  },
  {
    id: 'esvaziou',
    label: 'Esvaziar a Lixeira e ver o que não volta mais',
    hint: 'Exclua alguma coisa e depois use Esvaziar Lixeira.',
    run: c => ({ passed: c.gestos.esvaziou }),
  },
];

/* ── Requisitos 4.2, 4.3 e 4.4 — ordenar, buscar e reconhecer ─────────────── */

const ORDENS_EXIGIDAS: Coluna[] = ['nome', 'modificado', 'tamanho'];
/** O requisito 4.4 diz "cada uma": quatro extensões diferentes é o piso. */
const EXTENSOES_EXIGIDAS = 4;

const ACHAR: Spec[] = [
  {
    id: 'ordenou',
    label: 'Ordenar por nome, por data de modificação e por tamanho',
    hint: 'Clique nos títulos das colunas, ou use o menu Classificar.',
    run: c => {
      const feitas = ORDENS_EXIGIDAS.filter(o => c.gestos.ordenacoes.includes(o));
      return feitas.length === ORDENS_EXIGIDAS.length
        ? { passed: true }
        : { passed: false, detail: `${feitas.length} de ${ORDENS_EXIGIDAS.length} até agora.` };
    },
  },
  {
    id: 'buscouComFiltro',
    label: 'Achar um arquivo filtrando por tipo e por data',
    hint: 'Abra a pesquisa e combine os dois filtros — é o caso de quem não lembra o nome.',
    run: c => {
      /* Achados > 0 é o que separa buscar de ter clicado em buscar: filtro que
         não devolve nada não localizou arquivo nenhum. */
      const boa = c.gestos.buscas.some(b => b.filtro.tipo
        && (b.filtro.de !== undefined || b.filtro.ate !== undefined)
        && b.achados > 0);
      if (boa) return { passed: true };
      const tentou = c.gestos.buscas.some(b => b.filtro.tipo || b.filtro.de !== undefined);
      return {
        passed: false,
        detail: tentou ? 'A busca precisa dos dois filtros juntos e precisa achar alguma coisa.' : undefined,
      };
    },
  },
  {
    id: 'extensoes',
    label: 'Fazer o Explorador mostrar as extensões',
    hint: 'Menu Exibir, "Extensões de nomes de arquivos".',
    run: c => ({ passed: c.gestos.extensoesVisiveis }),
  },
  {
    id: 'programas',
    label: 'Dizer que programa abre cada extensão',
    hint: 'Botão direito, "Abrir com", e escolha o programa certo. Quatro extensões diferentes.',
    run: c => {
      const quantas = new Set(c.gestos.associacoes).size;
      return quantas >= EXTENSOES_EXIGIDAS
        ? { passed: true }
        : { passed: false, detail: `${quantas} de ${EXTENSOES_EXIGIDAS} extensões.` };
    },
  },
];

/* ── Requisito 5 — o padrão de nomeação ───────────────────────────────────── */

/** O requisito diz "no mínimo dez". */
const QUANTOS_RENOMEAR = 10;

/**
 * A forma de um nome, com os números apagados.
 *
 * `ata-2026-03-14-v02.docx` e `cantina-2026-04-01-v01.pdf` viram
 * `#-#-#-#-v#` — o mesmo molde. É assim que dá para conferir que a pessoa
 * aplicou **um** padrão sem ditar qual: o documento oficial pede padrão
 * *próprio*, e uma trava que exigisse `AAAA-MM-DD_vNN` estaria escolhendo por
 * ela.
 *
 * O nome do arquivo sai fora, e a extensão também: os dez são de tipos
 * diferentes, e um molde que levasse `.jpg` junto nunca casaria com o `.docx`.
 */
export function moldeDoNome(nome: string): string {
  const semExtensao = nome.includes('.') ? nome.slice(0, nome.lastIndexOf('.')) : nome;
  return semExtensao
    .replace(/\d+/g, '#')
    /* `\p{L}`, e não `[A-Za-z]`: "relatório" e "ata" têm de virar o mesmo
       pedaço de molde, e um intervalo ASCII deixaria o "ó" de fora — os dois
       sairiam com moldes diferentes e a trava diria que a pessoa usou dois
       padrões tendo usado um. */
    .replace(/\p{L}+/gu, l => (/^v$/i.test(l) ? 'v' : 'a'));
}

/**
 * O nome traz data **e** versão?
 *
 * Esta conta se faz no nome, e não no molde, porque o molde apaga justamente
 * o que distingue uma data de um número qualquer: `ata-2026-02-10-v01` e
 * `ata-1-2-3-v03` viram o mesmo `a-#-#-#-v#`, e o segundo não tem data nenhuma.
 *
 * A data se aceita em qualquer separador, e também sem nenhum: `2026-02-10`,
 * `2026_02_10`, `2026.02.10` e `20260210` são o mesmo dia escrito do mesmo
 * jeito — ano, mês e dia, do maior para o menor. É essa ordem que faz a ordem
 * alfabética virar ordem de tempo, e é ela que o requisito 5 quer.
 *
 * A versão é `v` e um número, que é o que a lição ensina. Um padrão próprio
 * pode marcá-la de outro jeito, e reconhecer todos seria adivinhar; o passo a
 * passo diz qual a plataforma reconhece, para ninguém ficar preso sem saber
 * por quê.
 */
export function nomeTemDataEVersao(nome: string): boolean {
  const temData = /\d{4}([-_.]?)\d{2}\1\d{2}/.test(nome);
  const temVersao = /v\d+/i.test(nome);
  return temData && temVersao;
}

const NOMEAR: Spec[] = [
  {
    id: 'padrao',
    label: `Aplicar um padrão com data e versão a ${QUANTOS_RENOMEAR} arquivos`,
    hint: 'Renomeie os dez da Área de Trabalho. O padrão é seu — só precisa ser o mesmo nos dez, com data e versão.',
    run: c => {
      /* Só conta o que a pessoa renomeou: dez arquivos que já chegassem no
         molde seriam dez tarefas cumpridas antes de a lição abrir. */
      const renomeados = c.arvore.filter(n => n.tipo === 'arquivo'
        && acharNo(c.inicial, n.id)
        && acharNo(c.inicial, n.id)!.nome !== n.nome);

      /* Agrupa por molde e conta, dentro de cada grupo, quantos trazem data e
         versão: as duas contas são separadas de propósito. Dez nomes no mesmo
         molde sem data não é padrão nenhum, e dez com data em dez moldes
         diferentes não ordena — o requisito pede as duas coisas. */
      const porMolde = new Map<string, number>();
      for (const n of renomeados) {
        if (!nomeTemDataEVersao(n.nome)) continue;
        const m = moldeDoNome(n.nome);
        porMolde.set(m, (porMolde.get(m) ?? 0) + 1);
      }
      const melhor = Math.max(0, ...porMolde.values());
      if (melhor >= QUANTOS_RENOMEAR) return { passed: true };

      const comData = renomeados.filter(n => nomeTemDataEVersao(n.nome)).length;
      return {
        passed: false,
        detail: renomeados.length === 0
          ? undefined
          : comData === 0
            ? `${renomeados.length} renomeados, e nenhum com data e versão no nome.`
            : `${melhor} de ${QUANTOS_RENOMEAR} no mesmo padrão. `
              + (comData > melhor ? 'Os outros ficaram com um molde diferente.' : ''),
      };
    },
  },
];

/* ── Requisito 4.6 — o dispositivo externo ────────────────────────────────── */

/** Copiar um arquivo só não é "copiar arquivos", e não dá o que perder. */
const QUANTOS_NO_PENDRIVE = 3;

const DISPOSITIVO: Spec[] = [
  {
    id: 'copiouParaOPendrive',
    label: 'Copiar arquivos para o pen drive',
    hint: 'Espete o pen drive na barra de tarefas, copie e cole nele.',
    run: c => {
      const quantos = c.arvore.filter(n => n.paiId === PENDRIVE).length;
      return quantos >= QUANTOS_NO_PENDRIVE
        ? { passed: true }
        : { passed: false, detail: `${quantos} de ${QUANTOS_NO_PENDRIVE} copiados.` };
    },
  },
  {
    id: 'removeuComSeguranca',
    label: 'Remover o pen drive com segurança, com tudo inteiro',
    hint: 'Antes de puxar, use "Ejetar". É aí que o sistema termina de gravar.',
    run: c => {
      const inteiros = gravadosDeVerdade(c.arvore, c.dispositivo).length;
      const quebrados = c.arvore.filter(n => n.paiId === PENDRIVE).length - inteiros;

      if (c.dispositivo.conectado) {
        return { passed: false, detail: 'O pen drive ainda está conectado.' };
      }
      if (inteiros >= QUANTOS_NO_PENDRIVE) return { passed: true };
      return {
        passed: false,
        detail: quebrados > 0
          ? `${quebrados} ${quebrados === 1 ? 'arquivo chegou' : 'arquivos chegaram'} pela metade. `
            + 'Espete de novo, copie por cima e ejete antes de puxar.'
          : `${inteiros} de ${QUANTOS_NO_PENDRIVE} chegaram inteiros.`,
      };
    },
  },
];

/* ── Requisito 8 — restaurar e voltar no tempo ────────────────────────────── */

const RESTAURAR: Spec[] = [
  {
    id: 'restaurouDoBackup',
    label: 'Trazer de volta um arquivo que só existe na cópia de segurança',
    hint: `Ache ${SUMIU} no disco de cópia de segurança e copie para Documentos.`,
    run: c => {
      const voltou = c.arvore.some(n => n.nome === SUMIU
        && caminhoDe(c.arvore, n.id).some(p => p.id === DOCUMENTOS));
      const aindaNoBackup = c.arvore.some(n => n.nome === SUMIU
        && caminhoDe(c.arvore, n.id).some(p => p.id === BACKUP));

      if (voltou && aindaNoBackup) return { passed: true };
      return {
        passed: false,
        /* Mover em vez de copiar é o erro que a lição precisa nomear: o
           arquivo volta e a cópia de segurança some junto — e quem fez isso
           fica sem cópia justamente do arquivo que já perdeu uma vez. */
        detail: voltou && !aindaNoBackup
          ? 'Você moveu em vez de copiar: o arquivo voltou, e agora não há mais cópia de segurança dele.'
          : undefined,
      };
    },
  },
  {
    id: 'voltouAVersao',
    label: 'Recuperar a versão anterior do relatório',
    hint: `Botão direito em ${RELATORIO}, "Versões anteriores".`,
    run: c => {
      const n = c.arvore.find(x => x.id === 'relatorio');
      if (n?.rotulo === VERSAO_PERDIDA) return { passed: true };
      return {
        passed: false,
        detail: n && n.rotulo !== acharNo(c.inicial, 'relatorio')?.rotulo
          ? 'Esta não é a versão que tinha o relatório inteiro. Olhe a lista de novo.'
          : undefined,
      };
    },
  },
];

const TODAS: Spec[] = [
  ...HIERARQUIA, ...PACOTE, ...SALVAR_E_EXCLUIR, ...ACHAR,
  ...NOMEAR, ...DISPOSITIVO, ...RESTAURAR,
];

export const IDS_DO_EXPLORADOR = TODAS.map(s => s.id);

/**
 * Confere o disco contra os ids que a lição pede.
 *
 * Id desconhecido vira uma verificação que nunca passa, e não some: laboratório
 * que encolhe em silêncio é o que a plataforma inteira evita. `veredas.test.ts`
 * cobra que todo id exista de verdade.
 */
export function validarExplorador(
  c: ContextoDoExplorador, ids: string[],
): CheckResult[] {
  return ids.map(id => {
    const spec = TODAS.find(s => s.id === id);
    if (!spec) {
      return {
        id,
        label: `Verificação desconhecida: ${id}`,
        hint: 'Esta lição cobra um id que o validador não conhece.',
        passed: false,
      };
    }
    const { passed, detail } = spec.run(c);
    return { id, label: spec.label, hint: spec.hint, passed, detail };
  });
}
