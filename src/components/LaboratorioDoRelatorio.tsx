import { useMemo, useRef, useState } from 'react';
import {
  Table, ImagePlus, Captions, Rows3, Columns3, Trash2, PanelTop,
  Bold, Italic, Underline, AlignLeft, Clipboard, Scissors, Copy, WrapText,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_WORD, CSS_FOLHA, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa,
  BotaoDaFaixa, EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord, FolhaDoWord,
} from '../labs/word';
import {
  RELATORIO_INICIAL, METAS_DO_RELATORIO, FOTO_DA_FOGUEIRA, COLUNAS_DA_LISTA,
  tabelaDaLista, legendaDeFigura, textoDoBloco,
  type Doc, type Secao,
} from '../labs/relatorioDoAcampamento';
import {
  paragrafos, ehParagrafo, larguraDaTabela,
  ESTILOS_DE_TABELA, ESTILO_PADRAO_DE_TABELA, NOMES_DA_DISPOSICAO,
  type Bloco, type Disposicao, type EstiloDeTabela,
} from '../labs/documento';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/*
  O laboratório de Word da CC-ES002, módulo 3 — requisitos 4.2 e 4.3.

  ── O terceiro na mesma janela ───────────────────────────────────────────
  A folha, o parágrafo, a tabela e a imagem moram em `word.tsx`, e foi por
  este laboratório que a tabela e a imagem desceram para lá: a decisão é a
  mesma de `explorer.tsx` e de `excel.tsx`, e ela vale **antes** de a cópia
  existir. O que fica aqui é do exercício — de que documento se parte, que
  comandos a faixa oferece, o que se cobra.

  ── As guias contextuais são a lição, e não enfeite ──────────────────────
  A teoria escreve que "Design da Tabela" e "Layout da Tabela" só existem
  enquanto o cursor está dentro da tabela, e que "se a guia sumiu, o cursor
  saiu dela — não é defeito do programa". Desenhá-las sempre contradiria a
  lição na própria tela; escondê-las por tarefa ensinaria a procurar o botão
  que a tarefa quer. Elas aparecem pelo que está selecionado, que é a regra do
  Word.

  ── E os dois comandos de tabela existem os dois ─────────────────────────
  "Inserir Tabela" põe uma grade vazia; "Converter Texto em Tabela" é o que a
  lição pede. O primeiro não some porque o exercício não o usa — um programa
  não esconde botão conforme a lição —, e é por isso que a meta exige que a
  tabulação tenha sumido, e não só que exista uma tabela.
*/

interface Props {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'word' }>;
  aoVencer: () => void | Promise<void>;
  aoSair: () => void;
}

const GUIAS_USAVEIS = ['Início', 'Inserir', 'Referências'];

/** As seis disposições do Word, na ordem em que ele as lista. */
const DISPOSICOES = Object.keys(NOMES_DA_DISPOSICAO) as Disposicao[];

/** O que cada disposição faz com o texto, dito na hora de escolher. */
const O_QUE_A_DISPOSICAO_FAZ: Record<Disposicao, string> = {
  alinhada: 'A imagem entra na linha como uma letra gigante, e empurra o parágrafo inteiro. '
    + 'É como ela nasce, e quase nunca é o que se quer.',
  quadrada: 'O texto contorna a caixa da imagem. É a escolha de sempre num relatório.',
  proxima: 'O texto contorna o desenho, e não a caixa. Serve a figura recortada.',
  atras: 'A imagem vai para trás do texto, que passa por cima dela. O texto não se ajusta a ela — '
    + 'ele a ignora, e é por isso que esta não responde ao que a tarefa pede.',
  frente: 'A imagem cobre o texto. Como a de trás, ela não ajusta nada: tapa.',
  'acima-e-abaixo': 'A imagem fica sozinha na largura da página, com o texto acima e abaixo.',
};

export default function LaboratorioDoRelatorio({ vereda, licao, aoVencer, aoSair }: Props) {
  const [doc, setDoc] = useState<Doc>(RELATORIO_INICIAL);
  const [guia, setGuia] = useState('Inserir');
  const [selecionado, setSelecionado] = useState<string | null>(null);
  /* Onde o cursor está dentro da tabela. Comando de tabela age onde o cursor
     está, e sem isto "Excluir › Colunas" teria de perguntar qual. */
  const [celula, setCelula] = useState<{ linha: number; coluna: number } | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [zoom, setZoom] = useState(1);
  const jaGravou = useRef(false);

  const alvo: Bloco<Secao> | null = doc.blocos.find(b => b.id === selecionado) ?? null;
  const tabela = alvo?.tipo === 'tabela' ? alvo : null;
  const imagem = alvo?.tipo === 'imagem' ? alvo : null;

  const feitas = useMemo(
    () => new Set(METAS_DO_RELATORIO.filter(m => m.feita(doc)).map(m => m.id)),
    [doc],
  );
  const pedidas = METAS_DO_RELATORIO.filter(m => licao.verificacoes.includes(m.id));
  const venceu = pedidas.every(m => feitas.has(m.id));

  const tarefas = pedidas.map(m => ({
    id: m.id,
    titulo: m.titulo,
    feita: feitas.has(m.id),
    detalhe: m.detalhe,
    onde: m.onde,
    passos: m.passos,
  }));

  /*
    As contextuais, pelo que está selecionado. É o que a teoria descreve, e é
    o que faz o aviso dela ("se a guia sumiu, o cursor saiu da tabela") ser
    verdade aqui dentro em vez de ser uma frase sobre outro programa.
  */
  const contextuais = tabela
    ? [{ id: 'Design da Tabela', nome: 'Design da Tabela' },
      { id: 'Layout da Tabela', nome: 'Layout da Tabela' }]
    : imagem
      ? [{ id: 'Formato da Imagem', nome: 'Formato da Imagem' }]
      : [];

  /* Guia contextual que deixou de existir não pode continuar desenhada: o
     cursor saiu do que a convocava, e a faixa ficaria mostrando comandos que
     não agem sobre nada. */
  const guiaAtual = contextuais.some(g => g.id === guia) || GUIAS_USAVEIS.includes(guia)
    ? guia : 'Inserir';

  const naoFazParte = (nome: string) =>
    setAviso(`${nome} existe no Word de verdade, e está aqui para a janela ficar igual — mas não faz parte desta lição.`);

  const fecharMenu = () => setMenu(null);
  const abrir = (id: string) => setMenu(m => (m === id ? null : id));

  const escolher = (id: string) => {
    setSelecionado(id);
    setCelula(null);
    setAviso('');
    fecharMenu();
  };

  /* ── Tabela ──────────────────────────────────────────────────────────────── */

  const inserirGradeVazia = () => {
    fecharMenu();
    const id = `tab-${doc.blocos.length}`;
    const onde = doc.blocos.findIndex(b => b.id === (selecionado ?? 'quem-1'));
    const grade = {
      tipo: 'tabela' as const, id, secao: (alvo?.secao ?? 'quem') as Secao,
      linhas: Array.from({ length: 3 }, () => ['', '', '']),
      cabecalho: false, estilo: ESTILO_PADRAO_DE_TABELA,
    };
    setDoc(d => ({
      ...d,
      blocos: [...d.blocos.slice(0, onde + 1), grade, ...d.blocos.slice(onde + 1)],
    }));
    setSelecionado(id);
    setAviso('Grade vazia de 3 por 3 inserida. Ela não tem nada a ver com a lista que já está '
      + 'escrita — para aproveitar o que existe, o comando é "Converter Texto em Tabela".');
  };

  const converterEmTabela = () => {
    fecharMenu();
    const daLista = paragrafos(doc).filter(b => b.secao === 'lista');
    if (daLista.length === 0) {
      setAviso('Não há mais nada alinhado com tabulação para converter.');
      return;
    }
    const onde = doc.blocos.findIndex(b => b.id === daLista[0].id);
    const nova = {
      tipo: 'tabela' as const, id: 'tab-inscritos', secao: 'lista' as Secao,
      linhas: daLista.map(b => textoDoBloco(b).split('\t')),
      cabecalho: false,
      /* Nasce na grade crua, que é o que o Word aplica sozinho — e é o que faz
         a tarefa seguinte, de escolher na galeria, ter o que mudar. */
      estilo: ESTILO_PADRAO_DE_TABELA,
    };
    setDoc((d) => {
      const resto = d.blocos.filter(b => b.secao !== 'lista');
      return { ...d, blocos: [...resto.slice(0, onde), nova, ...resto.slice(onde)] };
    });
    setSelecionado('tab-inscritos');
    setAviso('Lista convertida. As colunas agora são colunas de verdade: o nome comprido não '
      + 'empurra mais o que está ao lado dele.');
  };

  const exigirTabela = () => {
    if (tabela) return true;
    setAviso('Clique dentro da tabela primeiro. Os comandos de tabela agem onde o cursor está — '
      + 'é por isso que as guias delas só aparecem quando ele está lá dentro.');
    return false;
  };

  const mudarTabela = (f: (t: NonNullable<typeof tabela>) => Partial<NonNullable<typeof tabela>>) => {
    if (!tabela) return;
    const id = tabela.id;
    setDoc(d => ({
      ...d,
      blocos: d.blocos.map(b => (b.id === id && b.tipo === 'tabela' ? { ...b, ...f(b) } : b)),
    }));
  };

  const alternarCabecalho = () => {
    if (!exigirTabela() || !tabela) return;
    const ligando = !tabela.cabecalho;
    mudarTabela(() => ({ cabecalho: ligando }));
    setAviso(ligando
      ? 'Primeira linha marcada como cabeçalho. Numa tabela que atravessa duas páginas, é ela que '
        + 'se repete no alto da segunda.'
      : 'Cabeçalho desmarcado. Se esta tabela virasse a página, a segunda folha ficaria sem os '
        + 'títulos das colunas.');
  };

  const aplicarEstilo = (e: EstiloDeTabela) => {
    fecharMenu();
    if (!exigirTabela()) return;
    mudarTabela(() => ({ estilo: e }));
    setAviso(e === ESTILO_PADRAO_DE_TABELA
      ? 'Grade crua aplicada — é a que a tabela já tinha ao nascer.'
      : `"${e}" aplicado. É o mesmo gesto do módulo 1, um nível acima: escolher na galeria em vez `
        + 'de pintar célula por célula.');
  };

  const inserirLinha = () => {
    fecharMenu();
    if (!exigirTabela() || !tabela) return;
    const largura = larguraDaTabela(tabela);
    const onde = celula ? celula.linha + 1 : tabela.linhas.length;
    mudarTabela(t => ({
      linhas: [
        ...t.linhas.slice(0, onde),
        Array.from({ length: largura }, () => ''),
        ...t.linhas.slice(onde),
      ],
    }));
    setAviso('Linha inserida, vazia. Clique nas células dela e escreva quem faltava.');
  };

  const excluirColuna = () => {
    fecharMenu();
    if (!exigirTabela() || !tabela) return;
    if (!celula) {
      setAviso('Clique numa célula da coluna que você quer tirar: o comando age onde o cursor está.');
      return;
    }
    if (larguraDaTabela(tabela) <= 1) {
      setAviso('Uma tabela precisa de pelo menos uma coluna. Para tirar a tabela inteira, o comando é Excluir › Tabela.');
      return;
    }
    const qual = celula.coluna;
    const nome = tabela.linhas[0]?.[qual] ?? '';
    mudarTabela(t => ({ linhas: t.linhas.map(l => l.filter((_, j) => j !== qual)) }));
    setCelula(null);
    setAviso(`Coluna "${nome}" removida. Repare na diferença: Delete nas células esvaziaria e `
      + 'deixaria a coluna vazia ali, ocupando espaço.');
  };

  const excluirLinha = () => {
    fecharMenu();
    if (!exigirTabela() || !tabela) return;
    if (!celula) {
      setAviso('Clique numa célula da linha que você quer tirar.');
      return;
    }
    const qual = celula.linha;
    mudarTabela(t => ({ linhas: t.linhas.filter((_, i) => i !== qual) }));
    setCelula(null);
    setAviso('Linha removida.');
  };

  /**
   * O cursor entra na célula, e com ele a tabela passa a ser o que está
   * selecionado — as duas coisas de uma vez, porque no Word elas são a mesma.
   * Só selecionar a tabela deixaria "Excluir › Colunas" sem saber qual coluna.
   */
  const cursorNaCelula = (blocoId: string, linha: number, coluna: number) => {
    setSelecionado(blocoId);
    setCelula({ linha, coluna });
    setAviso('');
  };

  const escreverNaCelula = (id: string, linha: number, coluna: number, valor: string) => {
    setDoc(d => ({
      ...d,
      blocos: d.blocos.map(b => (b.id === id && b.tipo === 'tabela'
        ? { ...b, linhas: b.linhas.map((l, i) => (i === linha
          ? l.map((c, j) => (j === coluna ? valor : c)) : l)) }
        : b)),
    }));
  };

  /* ── Imagem ──────────────────────────────────────────────────────────────── */

  const inserirImagem = () => {
    fecharMenu();
    const ancora = alvo && ehParagrafo(alvo) ? alvo : null;
    if (!ancora) {
      setAviso('Clique antes num parágrafo: a imagem entra onde o cursor está, e é ele que vira a '
        + 'âncora dela.');
      return;
    }
    const id = 'img-fogueira';
    if (doc.blocos.some(b => b.id === id)) {
      setAviso('Esta foto já está no documento.');
      return;
    }
    const onde = doc.blocos.findIndex(b => b.id === ancora.id);
    const foto = {
      tipo: 'imagem' as const, id, secao: ancora.secao,
      arquivo: FOTO_DA_FOGUEIRA.arquivo,
      descricao: FOTO_DA_FOGUEIRA.descricao,
      /* Alinhada com o texto, que é como o Word insere — e é o que dá à tarefa
         seguinte o que consertar. Inseri-la já disposta seria a tarefa abrindo
         verde. */
      disposicao: 'alinhada' as const,
    };
    setDoc(d => ({
      ...d,
      blocos: [...d.blocos.slice(0, onde + 1), foto, ...d.blocos.slice(onde + 1)],
    }));
    setSelecionado(id);
    setAviso('Foto inserida, alinhada com o texto: ela entrou na linha como se fosse uma letra '
      + 'gigante. Repare no que aconteceu com o parágrafo.');
  };

  const dispor = (qual: Disposicao) => {
    fecharMenu();
    if (!imagem) {
      setAviso('Clique antes na imagem.');
      return;
    }
    const id = imagem.id;
    setDoc(d => ({
      ...d,
      blocos: d.blocos.map(b => (b.id === id && b.tipo === 'imagem'
        ? { ...b, disposicao: qual } : b)),
    }));
    setAviso(`${NOMES_DA_DISPOSICAO[qual]}. ${O_QUE_A_DISPOSICAO_FAZ[qual]}`);
  };

  /* ── Legenda ─────────────────────────────────────────────────────────────── */

  const inserirLegenda = () => {
    fecharMenu();
    if (!imagem) {
      setAviso('Clique antes na figura que você quer legendar. A legenda pertence a ela, e entra '
        + 'logo abaixo.');
      return;
    }
    const id = `leg-${imagem.id}`;
    if (doc.blocos.some(b => b.id === id)) {
      setAviso('Esta figura já tem legenda.');
      return;
    }
    const onde = doc.blocos.findIndex(b => b.id === imagem.id);
    const nova = legendaDeFigura(id, imagem.secao, imagem.descricao);
    setDoc(d => ({
      ...d,
      blocos: [...d.blocos.slice(0, onde + 1), nova, ...d.blocos.slice(onde + 1)],
    }));
    setSelecionado(id);
    setAviso('Legenda inserida. O "Figura" e o número da frente não foram digitados: são um campo, '
      + 'e o fundo cinza é o Word dizendo isso. O número sai da posição dela entre as figuras.');
  };

  const excluirParagrafo = () => {
    fecharMenu();
    if (!alvo || !ehParagrafo(alvo)) {
      setAviso('Clique antes no parágrafo que você quer apagar.');
      return;
    }
    const id = alvo.id;
    setDoc(d => ({ ...d, blocos: d.blocos.filter(b => b.id !== id) }));
    setSelecionado(null);
    setAviso('Parágrafo apagado.');
  };

  /* Uma gravação por montagem: o `StrictMode` monta duas vezes de propósito. */
  const concluir = async () => {
    if (!venceu || jaGravou.current) return;
    jaGravou.current = true;
    await aoVencer();
    aoSair();
  };

  const acoes = (
    <>
      <button type="button" className="btn-ghost" onClick={() => {
        setDoc(RELATORIO_INICIAL);
        setSelecionado(null);
        setCelula(null);
        setAviso('O relatório voltou ao estado em que chegou.');
      }}>
        Recomeçar
      </button>
      <button type="button" className="btn-primary" disabled={!venceu} onClick={concluir}>
        {venceu ? 'Concluir a lição' : `Faltam ${pedidas.length - feitas.size}`}
      </button>
    </>
  );

  const temTabela = tabelaDaLista(doc) !== null;

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={licao.titulo}
      programa="word"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_WORD}</style>
      <style>{CSS_FOLHA}</style>
      <style>{`
        .wt-galeria { display: flex; gap: 3px; }
        .wt-estilo {
          border: 1px solid #C8C6C4; background: #FFFFFF; border-radius: 2px;
          padding: 2px 8px; height: 40px; min-width: 64px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; text-align: center;
          font-size: 10.5px; color: #201F1E; line-height: 1.15;
        }
        .wt-estilo:hover { border-color: #2B579A; }
        .wt-estilo[aria-pressed="true"] { border-color: #2B579A; background: #EFF4FB; }
      `}</style>

      <div className="wd-janela">
        <BarraDeTituloDoWord documento="Relatório do Acampamento" aoAvisar={naoFazParte} />

        <GuiasDoWord
          atual={guiaAtual} usaveis={GUIAS_USAVEIS} contextuais={contextuais}
          aoTrocar={(id) => { setGuia(id); fecharMenu(); }}
          aoAvisar={naoFazParte} />

        <div className="wd-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
          {guiaAtual === 'Início' && (
            <>
              <GrupoDaFaixa nome="Área de Transferência">
                <EnfeiteDaFaixa dica="Colar (Ctrl+V)" rotulo="Colar" empilhado aoAvisar={naoFazParte}>
                  <Clipboard className="w-5 h-5" />
                </EnfeiteDaFaixa>
                <EnfeiteDaFaixa dica="Recortar (Ctrl+X)" aoAvisar={naoFazParte}><Scissors className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                <EnfeiteDaFaixa dica="Copiar (Ctrl+C)" aoAvisar={naoFazParte}><Copy className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Fonte">
                <EnfeiteDaFaixa dica="Negrito (Ctrl+N)" aoAvisar={naoFazParte}><Bold className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                <EnfeiteDaFaixa dica="Itálico (Ctrl+I)" aoAvisar={naoFazParte}><Italic className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                <EnfeiteDaFaixa dica="Sublinhado (Ctrl+S)" aoAvisar={naoFazParte}><Underline className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Parágrafo">
                <EnfeiteDaFaixa dica="Alinhar à Esquerda (Ctrl+Q)" aoAvisar={naoFazParte}><AlignLeft className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                <BotaoDaFaixa dica="Excluir Parágrafo" aoClicar={excluirParagrafo}>
                  <Trash2 className="w-3.5 h-3.5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
            </>
          )}

          {guiaAtual === 'Inserir' && (
            <>
              <GrupoDaFaixa nome="Tabelas">
                <div style={{ position: 'relative' }}>
                  <BotaoDaFaixa dica="Tabela" rotulo="Tabela" empilhado aoClicar={() => abrir('tabela')}>
                    <Table className="w-5 h-5" />
                  </BotaoDaFaixa>
                  {menu === 'tabela' && (
                    <div className="wd-menu" role="menu">
                      {/*
                        Os dois existem, e o exercício usa um. Esconder o outro
                        porque a lição não o pede ensinaria a procurar o botão
                        que a tarefa quer, e não a procurar no programa.
                      */}
                      <button type="button" role="menuitem" className="wd-menu-item"
                        onClick={inserirGradeVazia}>
                        Inserir Tabela…
                      </button>
                      <button type="button" role="menuitem" className="wd-menu-item"
                        onClick={converterEmTabela}>
                        Converter Texto em Tabela…
                      </button>
                    </div>
                  )}
                </div>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Ilustrações">
                <BotaoDaFaixa dica="Imagem" rotulo="Imagem" empilhado aoClicar={inserirImagem}>
                  <ImagePlus className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
            </>
          )}

          {guiaAtual === 'Referências' && (
            <GrupoDaFaixa nome="Legendas">
              <BotaoDaFaixa dica="Inserir Legenda" rotulo="Inserir Legenda" empilhado
                aoClicar={inserirLegenda}>
                <Captions className="w-5 h-5" />
              </BotaoDaFaixa>
              <EnfeiteDaFaixa dica="Inserir Índice de Ilustrações" aoAvisar={naoFazParte}>
                <PanelTop className="w-3.5 h-3.5" />
              </EnfeiteDaFaixa>
            </GrupoDaFaixa>
          )}

          {guiaAtual === 'Design da Tabela' && (
            <GrupoDaFaixa nome="Estilos de Tabela">
              <div className="wt-galeria">
                {ESTILOS_DE_TABELA.map(e => (
                  <button key={e} type="button" className="wt-estilo" title={e}
                    aria-pressed={tabela?.estilo === e}
                    onClick={() => aplicarEstilo(e)}>
                    {e}
                  </button>
                ))}
              </div>
            </GrupoDaFaixa>
          )}

          {guiaAtual === 'Layout da Tabela' && (
            <>
              <GrupoDaFaixa nome="Opções de Estilo">
                <BotaoDaFaixa dica="Linha de Cabeçalho" rotulo="Linha de Cabeçalho" empilhado
                  ativo={tabela?.cabecalho} aoClicar={alternarCabecalho}>
                  <PanelTop className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Linhas e Colunas">
                <BotaoDaFaixa dica="Inserir Abaixo" rotulo="Inserir Abaixo" empilhado
                  aoClicar={inserirLinha}>
                  <Rows3 className="w-5 h-5" />
                </BotaoDaFaixa>
                <div style={{ position: 'relative' }}>
                  <BotaoDaFaixa dica="Excluir" rotulo="Excluir" empilhado
                    aoClicar={() => abrir('excluir')}>
                    <Columns3 className="w-5 h-5" />
                  </BotaoDaFaixa>
                  {menu === 'excluir' && (
                    <div className="wd-menu" role="menu">
                      <button type="button" role="menuitem" className="wd-menu-item"
                        onClick={excluirLinha}>Excluir Linhas</button>
                      <button type="button" role="menuitem" className="wd-menu-item"
                        onClick={excluirColuna}>Excluir Colunas</button>
                    </div>
                  )}
                </div>
              </GrupoDaFaixa>
            </>
          )}

          {guiaAtual === 'Formato da Imagem' && (
            <GrupoDaFaixa nome="Organizar">
              <div style={{ position: 'relative' }}>
                <BotaoDaFaixa dica="Dispor Texto" rotulo="Dispor Texto" empilhado
                  aoClicar={() => abrir('dispor')}>
                  <WrapText className="w-5 h-5" />
                </BotaoDaFaixa>
                {menu === 'dispor' && (
                  <div className="wd-menu" role="menu">
                    {DISPOSICOES.map(d => (
                      <button key={d} type="button" role="menuitem" className="wd-menu-item"
                        aria-pressed={imagem?.disposicao === d}
                        onClick={() => dispor(d)}>
                        {NOMES_DA_DISPOSICAO[d]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </GrupoDaFaixa>
          )}
        </div>

        <ReguaDoWord larguraCm={21} margemCm={2.5} />

        <FolhaDoWord
          doc={doc}
          selecionado={selecionado}
          aoEscolher={escolher}
          aoClicarNoVazio={() => { setSelecionado(null); setCelula(null); fecharMenu(); }}
          celula={celula}
          aoCursorNaCelula={cursorNaCelula}
          aoEditarCelula={escreverNaCelula}
        />

        <div className="wd-status">
          <span>{doc.blocos.length} blocos</span>
          <span>
            {tabela
              ? `Tabela: ${tabela.linhas.length} × ${larguraDaTabela(tabela)}`
              : imagem
                ? `Imagem: ${NOMES_DA_DISPOSICAO[imagem.disposicao]}`
                : temTabela
                  ? 'Nenhuma tabela selecionada'
                  : `Lista com ${COLUNAS_DA_LISTA.length} colunas alinhadas com tabulação`}
          </span>
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} />
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
