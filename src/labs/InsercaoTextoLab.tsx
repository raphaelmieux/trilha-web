import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table, Image as ImageIcon, Heading, PanelBottom, Hash, RotateCcw, Rows3, Columns3, Trash2,
  WrapText, FileCheck2, Shapes, Link2, Sigma, FileText, Sparkles, Search, Replace, MousePointer2, X,
  ChevronDown,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_WORD, CSS_FOLHA, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa, BotaoDaFaixa,
  EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord, FolhaDoWord,
} from './word';
import {
  CSS_FONTE_DO_WORD, GrupoAreaDeTransferencia, GrupoDeConfigurarPagina, GrupoDeEstilos, GrupoDeFonte,
  GrupoDeParagrafo,
} from './fonteDoWord';
import {
  trechoDe, campoDe, ehParagrafo, faixaTemCampoDePagina, larguraDaTabela, medidasDaPagina,
  quantasPaginas, textoVisivel, ESTILOS_DE_TABELA, ESTILO_PADRAO_DE_TABELA, NOMES_DA_DISPOSICAO,
  type Bloco, type ConfiguracaoDaPagina, type Disposicao, type EstiloDeTabela, type FaixaDaPagina,
  type TabelaDoDoc,
} from './documento';
import { useEdicaoDoWord } from './useEdicaoDoWord';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';
import {
  DOC_INICIAL, TABELA_INICIAL, FOTO_DO_ACAMPAMENTO, METAS_DA_INSERCAO as METAS,
  type Doc, type Secao,
} from './metasDaAp043';

/*
 * AP043 requisito 4 — as quatro inserções que o documento manda demonstrar.
 *
 * Tabela, imagem, cabeçalho e rodapé, numeração de páginas. É o mesmo Word do
 * laboratório de formatação da AP042 e da vereda de editor de texto, e de
 * propósito: a folha, o cursor e a faixa vêm de `word.tsx`. O que muda é a
 * guia — inserir mora em Inserir.
 *
 * ── O que separa este requisito do da AP042 ──────────────────────────────
 * Lá as tarefas eram de uma peça só: negrito é o botão de negrito. Aqui cada
 * uma tem partes que precisam conversar. "Inserir uma tabela" não acaba na
 * tabela: o documento cobra adicionar e excluir linha e coluna, e formatá-la
 * — três operações que só existem *depois* que a tabela está lá, numa guia que
 * só aparece com o cursor dentro dela.
 *
 * ── As armadilhas, uma por tarefa ────────────────────────────────────────
 *   tabela    — inserir é fácil; achar onde se adiciona linha, não. A guia
 *               Layout da Tabela só existe com o cursor dentro dela;
 *   imagem    — a imagem entra alinhada com o texto, empurrando o parágrafo,
 *               como no Word. Ajustar ao texto é escolher a quebra, e Atrás e
 *               Na Frente do Texto não ajustam: cobrem;
 *   cabeçalho — não se escreve nele clicando no meio da página: ele fica
 *               apagado até ser aberto, por dois cliques ou pelo botão, e
 *               fecha com "Fechar Cabeçalho e Rodapé";
 *   números   — numeração de página é um campo que se recalcula, e a
 *               diferença aparece na segunda página, que existe para isso.
 *
 * ── A tabela chega com os dados da secretaria ────────────────────────────
 * O Word insere a grade vazia. Aqui ela entra com as unidades que a
 * secretaria já mandou, para que a tarefa seja mexer na tabela — a linha que
 * falta, a coluna que sobra, o estilo — e não digitar seis células.
 */

const GUIAS_USAVEIS = ['Início', 'Inserir', 'Layout'];
const DISPOSICOES = Object.keys(NOMES_DA_DISPOSICAO) as Disposicao[];
const ESTILOS_DA_GALERIA = ['Normal', 'Título 1', 'Título 2', 'Subtítulo'] as const;

/** O que cada disposição faz com o texto, dito na hora de escolher. */
const O_QUE_A_DISPOSICAO_FAZ: Record<Disposicao, string> = {
  alinhada: 'A imagem fica na linha como uma letra gigante, e empurra o parágrafo inteiro.',
  quadrada: 'O texto contorna a caixa da imagem. É a escolha de sempre num relatório.',
  proxima: 'O texto contorna o desenho, e não a caixa.',
  atras: 'A imagem vai para trás do texto, que passa por cima dela — o texto a ignora, e é por isso que esta não ajusta nada.',
  frente: 'A imagem cobre o texto. Como a de trás, ela não ajusta: tapa.',
  'acima-e-abaixo': 'A imagem fica sozinha na largura da página, com o texto acima e abaixo.',
};

export default function InsercaoTextoLab({
  specialtyCode, lessonCode, lessonTitle, requirementCodes, userId,
}: Props) {
  const [doc, setDoc] = useState<Doc>(DOC_INICIAL);
  const [guia, setGuia] = useState('Inserir');
  const [menu, setMenu] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [marcas, setMarcas] = useState(false);
  /* O objeto escolhido — tabela ou imagem. Clicar no texto o tira de
     escolhido: é o cursor saindo da tabela, e as guias contextuais somem
     junto, como no Word. */
  const [escolha, setEscolha] = useState<string | null>(null);
  const [celula, setCelula] = useState<{ linha: number; coluna: number } | null>(null);
  const [faixasAbertas, setFaixasAbertas] = useState(false);
  const [aviso, setAviso] = useState('');
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState('');
  const [pronto, setPronto] = useState(false);
  const grade = useRef<{ colunas: number; linhas: number }>({ colunas: 0, linhas: 0 });
  const [sobre, setSobre] = useState<{ colunas: number; linhas: number } | null>(null);
  const edicao = useEdicaoDoWord(doc, setDoc);

  const escolhido: Bloco<Secao> | null = doc.blocos.find(b => b.id === escolha) ?? null;
  const tabela = escolhido?.tipo === 'tabela' ? escolhido : null;
  const imagem = escolhido?.tipo === 'imagem' ? escolhido : null;

  const contextuais = faixasAbertas
    ? [{ id: 'Cabeçalho e Rodapé', nome: 'Cabeçalho e Rodapé' }]
    : tabela
      ? [{ id: 'Design da Tabela', nome: 'Design da Tabela' }, { id: 'Layout da Tabela', nome: 'Layout da Tabela' }]
      : imagem
        ? [{ id: 'Formato da Imagem', nome: 'Formato da Imagem' }]
        : [];
  /* Guia contextual que deixou de existir não continua desenhada: a faixa
     mostraria comandos que não agem sobre nada. */
  const guiaAtual = contextuais.some(g => g.id === guia) || GUIAS_USAVEIS.includes(guia) ? guia : 'Inserir';

  const tarefas = useMemo(() => METAS.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos, feita: m.feita(doc),
  })), [doc]);
  const tudoFeito = tarefas.every(t => t.feita);

  const fecharMenu = () => setMenu(null);
  const abrir = (id: string) => setMenu(m => (m === id ? null : id));
  const escolher = (id: string) => {
    setEscolha(id);
    setCelula(null);
    fecharMenu();
  };

  /** O bloco depois do qual uma coisa nova entra: o parágrafo do cursor. */
  const depoisDe = (): string | null => edicao.paragrafo?.id ?? null;

  const inserirBloco = (novo: Bloco<Secao>) => {
    const onde = depoisDe();
    edicao.mudar(d => {
      const i = d.blocos.findIndex(b => b.id === onde);
      return { ...d, blocos: [...d.blocos.slice(0, i + 1), novo, ...d.blocos.slice(i + 1)] };
    });
  };

  /* ── Tabela ──────────────────────────────────────────────────────────────── */

  const inserirTabela = (colunas: number, linhas: number) => {
    fecharMenu();
    setSobre(null);
    if (!depoisDe()) {
      setAviso('Clique antes no documento: a tabela entra onde o cursor está.');
      return;
    }
    const id = `tab-${doc.blocos.length}`;
    const nova: TabelaDoDoc<Secao> = {
      tipo: 'tabela', id, secao: 'texto', cabecalho: false, estilo: ESTILO_PADRAO_DE_TABELA,
      linhas: Array.from({ length: linhas }, (_, l) =>
        Array.from({ length: colunas }, (_, c) => TABELA_INICIAL[l]?.[c] ?? '')),
    };
    inserirBloco(nova);
    setEscolha(id);
    setCelula({ linha: 0, coluna: 0 });
    setGuia('Layout da Tabela');
    setAviso(`Tabela de ${colunas} por ${linhas} inserida, com as unidades que a secretaria mandou. Repare nas duas guias novas no alto: elas só existem com o cursor dentro da tabela.`);
  };

  const mudarTabela = (f: (t: TabelaDoDoc<Secao>) => Partial<TabelaDoDoc<Secao>>) => {
    if (!tabela) return;
    const id = tabela.id;
    /* O cursor está numa célula, e não no texto: `mudar` devolveria o foco à
       folha e trocaria a seleção, que é o que tira a tabela de escolhida. */
    setDoc(d => ({ ...d, blocos: d.blocos.map(b => (b.id === id && b.tipo === 'tabela' ? { ...b, ...f(b) } : b)) }));
  };

  const precisaDaCelula = (o: string) => {
    if (!celula) { setAviso(`Clique numa célula da ${o}: o comando age onde o cursor está.`); return false; }
    return true;
  };

  const inserirLinha = (abaixo: boolean) => {
    fecharMenu();
    if (!tabela || !precisaDaCelula('linha de referência')) return;
    const onde = celula!.linha + (abaixo ? 1 : 0);
    const largura = larguraDaTabela(tabela);
    mudarTabela(t => ({ linhas: [...t.linhas.slice(0, onde), Array(largura).fill(''), ...t.linhas.slice(onde)] }));
    setCelula({ linha: onde, coluna: 0 });
    setAviso('Linha inserida, vazia. Clique nas células dela e escreva.');
  };

  const inserirColuna = (direita: boolean) => {
    fecharMenu();
    if (!tabela || !precisaDaCelula('coluna de referência')) return;
    const onde = celula!.coluna + (direita ? 1 : 0);
    mudarTabela(t => ({ linhas: t.linhas.map(l => [...l.slice(0, onde), '', ...l.slice(onde)]) }));
    setCelula({ linha: celula!.linha, coluna: onde });
  };

  const excluir = (o: 'linha' | 'coluna' | 'tabela') => {
    fecharMenu();
    if (!tabela) return;
    if (o === 'tabela') {
      const id = tabela.id;
      setDoc(d => ({ ...d, blocos: d.blocos.filter(b => b.id !== id) }));
      setEscolha(null);
      setAviso('Tabela excluída.');
      return;
    }
    if (!precisaDaCelula(o)) return;
    if (o === 'coluna') {
      if (larguraDaTabela(tabela) <= 1) { setAviso('Uma tabela precisa de pelo menos uma coluna. Para tirar a tabela inteira, use Excluir › Tabela.'); return; }
      const qual = celula!.coluna;
      mudarTabela(t => ({ linhas: t.linhas.map(l => l.filter((_, j) => j !== qual)) }));
      setAviso('Coluna excluída. Repare: apagar o texto das células deixaria a coluna vazia ali, ocupando espaço.');
    } else {
      if (tabela.linhas.length <= 1) { setAviso('Uma tabela precisa de pelo menos uma linha. Para tirar a tabela inteira, use Excluir › Tabela.'); return; }
      const qual = celula!.linha;
      mudarTabela(t => ({ linhas: t.linhas.filter((_, i) => i !== qual) }));
      setAviso('Linha excluída.');
    }
    setCelula(null);
  };

  const estilizar = (e: EstiloDeTabela) => {
    mudarTabela(() => ({ estilo: e }));
    setAviso(e === ESTILO_PADRAO_DE_TABELA ? 'Grade crua: é a que a tabela já tinha ao nascer.' : `"${e}" aplicado.`);
  };

  const cursorNaCelula = (id: string, linha: number, coluna: number) => {
    setEscolha(id);
    setCelula({ linha, coluna });
    setGuia(g => (g === 'Design da Tabela' || g === 'Layout da Tabela' ? g : 'Layout da Tabela'));
  };

  const escreverNaCelula = (id: string, linha: number, coluna: number, valor: string) => {
    setDoc(d => ({
      ...d,
      blocos: d.blocos.map(b => (b.id === id && b.tipo === 'tabela'
        ? { ...b, linhas: b.linhas.map((l, i) => (i === linha ? l.map((c, j) => (j === coluna ? valor : c)) : l)) }
        : b)),
    }));
  };

  /* ── Imagem ──────────────────────────────────────────────────────────────── */

  const inserirImagem = () => {
    fecharMenu();
    if (!depoisDe()) {
      setAviso('Clique antes no documento: a imagem entra onde o cursor está.');
      return;
    }
    if (doc.blocos.some(b => b.tipo === 'imagem')) {
      setAviso('A foto do acampamento já está no documento.');
      return;
    }
    const id = 'img-acampamento';
    inserirBloco({
      tipo: 'imagem', id, secao: 'texto',
      arquivo: FOTO_DO_ACAMPAMENTO.arquivo, descricao: FOTO_DO_ACAMPAMENTO.descricao,
      /* Alinhada com o texto, que é como o Word insere — e é o que dá à tarefa
         o que consertar. */
      disposicao: 'alinhada',
    });
    setEscolha(id);
    setGuia('Formato da Imagem');
    setAviso('A foto entrou alinhada com o texto, empurrando o parágrafo. É assim que ela entra no Word — ajustar ao texto é o passo seguinte.');
  };

  const dispor = (qual: Disposicao) => {
    fecharMenu();
    if (!imagem) { setAviso('Clique antes na imagem.'); return; }
    const id = imagem.id;
    setDoc(d => ({ ...d, blocos: d.blocos.map(b => (b.id === id && b.tipo === 'imagem' ? { ...b, disposicao: qual } : b)) }));
    setAviso(`${NOMES_DA_DISPOSICAO[qual]}. ${O_QUE_A_DISPOSICAO_FAZ[qual]}`);
  };

  /* ── Cabeçalho, rodapé e número de página ────────────────────────────────── */

  /*
    A faixa nasce com um trecho vazio, e não sem trecho nenhum: é ele que vira
    o campo de digitar. O rodapé que nasce do número de página também traz o
    trecho de texto antes do campo, senão o nome da unidade não teria onde ser
    escrito.
  */
  const abrirFaixa = (onde: 'cabecalho' | 'rodape') => {
    fecharMenu();
    const atual = onde === 'cabecalho' ? doc.cabecalho : doc.rodape;
    if (!atual) {
      const nova: FaixaDaPagina = { trechos: [trechoDe(`${onde}-a`, '')] };
      edicao.mudar(d => (onde === 'cabecalho' ? { ...d, cabecalho: nova } : { ...d, rodape: nova }));
    }
    setFaixasAbertas(true);
    setEscolha(null);
    setGuia('Cabeçalho e Rodapé');
    setAviso(onde === 'cabecalho'
      ? 'O cabeçalho abriu, e o texto ficou apagado: agora é o cabeçalho que se edita. Escreva nele.'
      : 'O rodapé abriu. Escreva nele, no pé da folha.');
  };

  const fecharFaixas = () => {
    setFaixasAbertas(false);
    setGuia('Inserir');
    edicao.focar();
  };

  const escreverNaFaixa = (onde: 'cabecalho' | 'rodape', trechoId: string, valor: string) => {
    setDoc(d => {
      const faixa = onde === 'cabecalho' ? d.cabecalho : d.rodape;
      if (!faixa) return d;
      const trocada = { trechos: faixa.trechos.map(x => (x.id === trechoId ? { ...x, texto: valor } : x)) };
      return onde === 'cabecalho' ? { ...d, cabecalho: trocada } : { ...d, rodape: trocada };
    });
  };

  const numerarPaginas = (ligar: boolean) => {
    fecharMenu();
    if (!ligar) {
      edicao.mudar(d => (d.rodape
        ? { ...d, rodape: { trechos: d.rodape.trechos.filter(x => x.campo !== 'pagina') } } : d));
      setAviso('Os números de página saíram do rodapé.');
      return;
    }
    if (faixaTemCampoDePagina(doc.rodape)) { setAviso('O rodapé já traz o número de página.'); return; }
    edicao.mudar(d => ({
      ...d,
      rodape: {
        trechos: [
          ...(d.rodape?.trechos.filter(x => !x.campo) ?? [trechoDe('rodape-a', '')]),
          trechoDe('rodape-sep', ' — '),
          campoDe('rodape-n', 'pagina'),
        ],
      },
    }));
    setAviso('Número de página inserido no rodapé. Role até a segunda folha: ela diz 2, e ninguém digitou nada lá.');
  };

  /* ── Página ───────────────────────────────────────────────────────────────── */

  const configurar = (mudanca: Partial<ConfiguracaoDaPagina>) =>
    edicao.mudar(d => ({ ...d, pagina: { papel: 'A4', orientacao: 'retrato', margens: 'normal', ...d.pagina, ...mudanca } }));

  const recomecar = () => {
    edicao.reiniciar(DOC_INICIAL);
    setEscolha(null);
    setCelula(null);
    setFaixasAbertas(false);
    setGuia('Inserir');
    setZoom(1);
    setAviso('O documento voltou ao estado em que chegou.');
  };

  const registrar = async () => {
    setErro('');
    setGravando(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) {
      await ensureEnrollment(userId, specId);
      await updateEnrollmentActivity(userId, specId);
    }
    await registrarConclusaoDeLicao(userId, lessonCode);
    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: METAS.length, total_questions: METAS.length,
      }, specialtyCode);
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você montou tudo, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'insercao_concluida', { specialtyCode, lessonCode, metas: METAS.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Documento entregue</h2>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Tabela, imagem, cabeçalho, rodapé e numeração — as quatro inserções do requisito 4.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">
          Voltar para a trilha
        </Link>
      </div>
    );
  }

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <>
          {erro && <p style={{ fontSize: 11.5, color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary text-sm w-full justify-center">
            {gravando ? 'Guardando…' : 'Entregar o documento'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar o documento
      </button>
    </div>
  );

  const medidas = medidasDaPagina(doc);
  const palavras = textoVisivel(doc).split(/\s+/).filter(Boolean).length;
  const menuAberto = (id: string) => menu === id;

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="word"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_WORD}</style>
      <style>{CSS_FOLHA}</style>
      <style>{CSS_FONTE_DO_WORD}</style>
      <style>{CSS_INSERCAO}</style>

      <div className="wd-janela" style={{
        '--largura-cm': medidas.largura, '--altura-cm': medidas.altura, '--margem-cm': medidas.margem, '--zoom': zoom,
      } as React.CSSProperties}>
        <BarraDeTituloDoWord documento="Relatório do acampamento" aoAvisar={setAviso}
          aoDesfazer={edicao.podeDesfazer ? edicao.desfazer : undefined}
          aoRefazer={edicao.podeRefazer ? edicao.refazer : undefined} />

        <GuiasDoWord
          atual={guiaAtual} usaveis={GUIAS_USAVEIS} contextuais={contextuais}
          aoTrocar={id => { setGuia(id); fecharMenu(); }} aoAvisar={setAviso} />

        {/* Com menu aberto a faixa deixa de recortar: `overflow-x: auto` cria um
            contexto de recorte, e cortaria a grade de tamanho da tabela. */}
        <div className="wd-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
          {guiaAtual === 'Início' && (
            <>
              <GrupoAreaDeTransferencia edicao={edicao} aoAvisar={setAviso} />
              <GrupoDeFonte edicao={edicao} aoAvisar={setAviso} />
              <GrupoDeParagrafo edicao={edicao} aoAvisar={setAviso}
                marcas={{ ligadas: marcas, alternar: () => { setMarcas(m => !m); edicao.focar(); } }} />
              <GrupoDeEstilos edicao={edicao} estilos={[...ESTILOS_DA_GALERIA]} aoAvisar={setAviso} />
              <GrupoDaFaixa nome="Edição">
                <div className="wd-linhas">
                  <EnfeiteDaFaixa dica="Localizar (Ctrl+L)" rotulo="Localizar" aoAvisar={setAviso}><Search className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                  <EnfeiteDaFaixa dica="Substituir (Ctrl+U)" rotulo="Substituir" aoAvisar={setAviso}><Replace className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                  <BotaoDaFaixa dica="Selecionar Tudo (Ctrl+A)" rotulo="Selecionar"
                    aoClicar={() => { edicao.executar({ tipo: 'selecionar-tudo' }); edicao.focar(); }}>
                    <MousePointer2 className="w-3.5 h-3.5" />
                  </BotaoDaFaixa>
                </div>
              </GrupoDaFaixa>
            </>
          )}

          {guiaAtual === 'Inserir' && (
            <>
              <GrupoDaFaixa nome="Páginas">
                <EnfeiteDaFaixa dica="Folha de Rosto" rotulo="Folha de Rosto" empilhado aoAvisar={setAviso}><FileText className="w-5 h-5" /></EnfeiteDaFaixa>
                <BotaoDaFaixa dica="Quebra de Página (Ctrl+Enter)" rotulo="Quebra de Página" empilhado
                  aoClicar={() => {
                    if (!edicao.selecao) { setAviso('Clique primeiro no documento — a quebra entra onde o cursor está.'); return; }
                    edicao.executar({ tipo: 'quebra-de-pagina' });
                    edicao.focar();
                  }}>
                  <Sparkles className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>

              <GrupoDaFaixa nome="Tabelas">
                <div style={{ position: 'relative' }}>
                  <BotaoDaFaixa dica="Tabela" rotulo="Tabela" empilhado ativo={menuAberto('tabela')} aoClicar={() => abrir('tabela')}>
                    <Table className="w-5 h-5" /><ChevronDown className="w-3 h-3" />
                  </BotaoDaFaixa>
                  {menuAberto('tabela') && (
                    /* A grade do Word: passar o mouse acende o tamanho, e o
                       título diz "Tabela 3x3" antes de clicar. */
                    <div className="wd-menu" role="menu" style={{ padding: 8 }}>
                      <p style={{ fontSize: 11, color: '#605E5C', marginBottom: 6 }}>
                        {sobre ? `Tabela ${sobre.colunas}x${sobre.linhas}` : 'Inserir Tabela'}
                      </p>
                      <div onMouseLeave={() => setSobre(null)}>
                        {Array.from({ length: 6 }, (_, l) => (
                          <div key={l} className="ins-grade-linha">
                            {Array.from({ length: 8 }, (_, c) => {
                              const aceso = !!sobre && c < sobre.colunas && l < sobre.linhas;
                              return (
                                <button key={c} type="button" className={`ins-grade-celula${aceso ? ' acesa' : ''}`}
                                  title={`${c + 1} por ${l + 1}`} aria-label={`Tabela de ${c + 1} colunas por ${l + 1} linhas`}
                                  onMouseDown={ev => ev.preventDefault()}
                                  onMouseEnter={() => { grade.current = { colunas: c + 1, linhas: l + 1 }; setSobre(grade.current); }}
                                  onClick={() => inserirTabela(c + 1, l + 1)} />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GrupoDaFaixa>

              <GrupoDaFaixa nome="Ilustrações">
                <div style={{ position: 'relative' }}>
                  <BotaoDaFaixa dica="Imagens" rotulo="Imagens" empilhado ativo={menuAberto('imagens')} aoClicar={() => abrir('imagens')}>
                    <ImageIcon className="w-5 h-5" /><ChevronDown className="w-3 h-3" />
                  </BotaoDaFaixa>
                  {menuAberto('imagens') && (
                    <div className="wd-menu" role="menu">
                      <p style={{ fontSize: 11, color: '#605E5C', padding: '4px 10px' }}>Inserir Imagem de</p>
                      <button type="button" role="menuitem" className="wd-menu-item"
                        onMouseDown={ev => ev.preventDefault()} onClick={inserirImagem}>
                        Este Dispositivo…
                        <span style={{ display: 'block', fontSize: 11, color: '#605E5C' }}>{FOTO_DO_ACAMPAMENTO.arquivo}</span>
                      </button>
                      <button type="button" role="menuitem" className="wd-menu-item"
                        onClick={() => { fecharMenu(); setAviso('Imagens Online existe no Word de verdade, e não faz parte deste exercício.'); }}>
                        Imagens Online…
                      </button>
                    </div>
                  )}
                </div>
                <EnfeiteDaFaixa dica="Formas" rotulo="Formas" empilhado aoAvisar={setAviso}><Shapes className="w-5 h-5" /></EnfeiteDaFaixa>
              </GrupoDaFaixa>

              <GrupoDaFaixa nome="Links">
                <EnfeiteDaFaixa dica="Link" rotulo="Link" empilhado aoAvisar={setAviso}><Link2 className="w-5 h-5" /></EnfeiteDaFaixa>
              </GrupoDaFaixa>

              <GrupoDaFaixa nome="Cabeçalho e Rodapé">
                <BotaoDaFaixa dica="Cabeçalho" rotulo="Cabeçalho" empilhado aoClicar={() => abrirFaixa('cabecalho')}>
                  <Heading className="w-5 h-5" />
                </BotaoDaFaixa>
                <BotaoDaFaixa dica="Rodapé" rotulo="Rodapé" empilhado aoClicar={() => abrirFaixa('rodape')}>
                  <PanelBottom className="w-5 h-5" />
                </BotaoDaFaixa>
                <div style={{ position: 'relative' }}>
                  <BotaoDaFaixa dica="Número de Página" rotulo="Número de Página" empilhado ativo={menuAberto('numero')} aoClicar={() => abrir('numero')}>
                    <Hash className="w-5 h-5" />
                  </BotaoDaFaixa>
                  {menuAberto('numero') && (
                    <div className="wd-menu" role="menu">
                      <button type="button" role="menuitem" className="wd-menu-item" onClick={() => numerarPaginas(true)}>Fim da Página</button>
                      <button type="button" role="menuitem" className="wd-menu-item" onClick={() => numerarPaginas(false)}>Remover Números de Página</button>
                    </div>
                  )}
                </div>
              </GrupoDaFaixa>

              <GrupoDaFaixa nome="Símbolos">
                <EnfeiteDaFaixa dica="Equação" rotulo="Equação" empilhado aoAvisar={setAviso}><Sigma className="w-5 h-5" /></EnfeiteDaFaixa>
              </GrupoDaFaixa>
            </>
          )}

          {guiaAtual === 'Layout' && (
            <GrupoDeConfigurarPagina pagina={doc.pagina} aoMudar={configurar} aoAvisar={setAviso} />
          )}

          {guiaAtual === 'Layout da Tabela' && tabela && (
            <>
              <GrupoDaFaixa nome="Linhas e Colunas">
                <div style={{ position: 'relative' }}>
                  <BotaoDaFaixa dica="Excluir" rotulo="Excluir" empilhado ativo={menuAberto('excluir')} aoClicar={() => abrir('excluir')}>
                    <Trash2 className="w-5 h-5" /><ChevronDown className="w-3 h-3" />
                  </BotaoDaFaixa>
                  {menuAberto('excluir') && (
                    <div className="wd-menu" role="menu">
                      <button type="button" role="menuitem" className="wd-menu-item" onClick={() => excluir('coluna')}>Excluir Colunas</button>
                      <button type="button" role="menuitem" className="wd-menu-item" onClick={() => excluir('linha')}>Excluir Linhas</button>
                      <button type="button" role="menuitem" className="wd-menu-item" onClick={() => excluir('tabela')}>Excluir Tabela</button>
                    </div>
                  )}
                </div>
                <BotaoDaFaixa dica="Inserir Acima" rotulo="Inserir Acima" empilhado aoClicar={() => inserirLinha(false)}><Rows3 className="w-5 h-5" /></BotaoDaFaixa>
                <div className="wd-linhas">
                  <BotaoDaFaixa dica="Inserir Abaixo" rotulo="Inserir Abaixo" aoClicar={() => inserirLinha(true)}><Rows3 className="w-3.5 h-3.5" /></BotaoDaFaixa>
                  <BotaoDaFaixa dica="Inserir à Esquerda" rotulo="Inserir à Esquerda" aoClicar={() => inserirColuna(false)}><Columns3 className="w-3.5 h-3.5" /></BotaoDaFaixa>
                  <BotaoDaFaixa dica="Inserir à Direita" rotulo="Inserir à Direita" aoClicar={() => inserirColuna(true)}><Columns3 className="w-3.5 h-3.5" /></BotaoDaFaixa>
                </div>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Mesclar">
                <EnfeiteDaFaixa dica="Mesclar Células" rotulo="Mesclar Células" empilhado aoAvisar={setAviso}><Table className="w-5 h-5" /></EnfeiteDaFaixa>
              </GrupoDaFaixa>
            </>
          )}

          {guiaAtual === 'Design da Tabela' && tabela && (
            <GrupoDaFaixa nome="Estilos de Tabela">
              <div className="wd-galeria" role="listbox" aria-label="Estilos de Tabela">
                {ESTILOS_DE_TABELA.map(e => (
                  <button key={e} type="button" className="wd-galeria-item" title={e} aria-label={e}
                    aria-pressed={tabela.estilo === e} onClick={() => estilizar(e)}>
                    <span className={`ins-amostra ins-amostra-${ESTILOS_DE_TABELA.indexOf(e)}`} aria-hidden="true" />
                    <span className="wd-galeria-nome">{e.replace('Tabela ', '').replace(' — Ênfase 1', '')}</span>
                  </button>
                ))}
              </div>
            </GrupoDaFaixa>
          )}

          {guiaAtual === 'Formato da Imagem' && imagem && (
            <GrupoDaFaixa nome="Organizar">
              <div style={{ position: 'relative' }}>
                <BotaoDaFaixa dica="Quebra de Texto Automática" rotulo="Quebra de Texto Automática" empilhado
                  ativo={menuAberto('dispor')} aoClicar={() => abrir('dispor')}>
                  <WrapText className="w-5 h-5" /><ChevronDown className="w-3 h-3" />
                </BotaoDaFaixa>
                {menuAberto('dispor') && (
                  <div className="wd-menu" role="menu">
                    {DISPOSICOES.map(d => (
                      <button key={d} type="button" role="menuitemradio" aria-checked={imagem.disposicao === d}
                        className="wd-menu-item" onClick={() => dispor(d)}
                        style={{ backgroundColor: imagem.disposicao === d ? '#D6E8F7' : 'transparent' }}>
                        {NOMES_DA_DISPOSICAO[d]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </GrupoDaFaixa>
          )}

          {guiaAtual === 'Cabeçalho e Rodapé' && faixasAbertas && (
            <>
              <GrupoDaFaixa nome="Cabeçalho e Rodapé">
                <BotaoDaFaixa dica="Cabeçalho" rotulo="Cabeçalho" empilhado aoClicar={() => abrirFaixa('cabecalho')}><Heading className="w-5 h-5" /></BotaoDaFaixa>
                <BotaoDaFaixa dica="Rodapé" rotulo="Rodapé" empilhado aoClicar={() => abrirFaixa('rodape')}><PanelBottom className="w-5 h-5" /></BotaoDaFaixa>
                <BotaoDaFaixa dica="Número de Página" rotulo="Número de Página" empilhado aoClicar={() => numerarPaginas(true)}><Hash className="w-5 h-5" /></BotaoDaFaixa>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Fechar">
                <BotaoDaFaixa dica="Fechar Cabeçalho e Rodapé" rotulo="Fechar Cabeçalho e Rodapé" empilhado aoClicar={fecharFaixas}>
                  <X className="w-5 h-5" style={{ color: '#C43E1C' }} />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
            </>
          )}
        </div>

        <ReguaDoWord larguraCm={medidas.largura} margemCm={medidas.margem} />

        <FolhaDoWord
          doc={doc}
          marcas={marcas}
          edicao={faixasAbertas ? undefined : edicao.folha}
          selecionado={escolhido?.id ?? null}
          aoEscolher={id => { if (doc.blocos.find(b => b.id === id && !ehParagrafo(b))) escolher(id); }}
          aoClicarNoVazio={() => { setEscolha(null); setCelula(null); }}
          celula={celula}
          aoCursorNaCelula={cursorNaCelula}
          aoEditarCelula={escreverNaCelula}
          aoEscreverNaFaixa={escreverNaFaixa}
          faixasAbertas={faixasAbertas}
          aoAbrirFaixas={() => abrirFaixa('cabecalho')}
          aoFecharFaixas={fecharFaixas}
        />

        <div className="wd-status">
          <span>{quantasPaginas(doc)} páginas</span>
          <span>{palavras} palavras</span>
          <span className="hidden md:inline">Português (Brasil)</span>
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} aoAvisar={setAviso} />
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}

/* A grade de tamanho da tabela e as amostras da galeria — peças deste
   exercício; a tabela em si é desenhada pela folha, com os estilos dela. */
const CSS_INSERCAO = `
.ins-grade-linha { display: flex; }
.ins-grade-celula { width: 16px; height: 16px; margin: 1px; border: 1px solid #C8C6C4; background: #FFFFFF; padding: 0; cursor: pointer; }
.ins-grade-celula.acesa { background: #D6E8F7; border-color: #2B579A; }
.ins-amostra {
  display: block; width: 42px; height: 26px; border: 1px solid #605E5C;
  background-image: linear-gradient(#605E5C 1px, transparent 1px), linear-gradient(90deg, #605E5C 1px, transparent 1px);
  background-size: 14px 8.7px;
}
.ins-amostra-1 { border-color: #FFFFFF; background: repeating-linear-gradient(#FFFFFF 0 8.7px, #DDEBF7 8.7px 17.4px); border-top: 3px solid #2B579A; }
.ins-amostra-2 { border-color: #9BC2E6; background: repeating-linear-gradient(#DDEBF7 0 8.7px, #FFFFFF 8.7px 17.4px); border-top: 8px solid #4472C4; }
`;
