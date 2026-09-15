import { useMemo, useRef, useState } from 'react';
import {
  PanelTop, PanelBottom, Hash, ListTree, RefreshCw, Plus, SquareCheck, Square,
  Bold, Italic, Underline, AlignLeft, Clipboard, Scissors, Copy,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_WORD, CSS_FOLHA, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa,
  BotaoDaFaixa, EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord, FolhaDoWord,
} from '../labs/word';
import {
  RELATORIO_ANUAL_INICIAL, METAS_DO_RELATORIO_ANUAL, SECAO_QUE_FALTA,
  quantasPaginas, titulosDoDoc, sumarioAtualizado,
  type Doc, type Secao,
} from '../labs/relatorioAnual';
import { linhaDe, trechoDe, campoDe, faixaTemCampoDePagina } from '../labs/documento';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/*
  O laboratório de Word da CC-ES002, módulo 4 — requisitos 4.4 e 4.5.

  ── Por que a folha precisou repartir de verdade ─────────────────────────
  Foi por esta lição. Cabeçalho que se repete numa folha só não se repete, e
  número de página que nunca muda não mostra a diferença entre o campo e o
  número digitado — que é a lição inteira. `FolhaDoWord` reparte pelas quebras
  de página que o documento carrega, e desenha as faixas em cada folha; os três
  laboratórios anteriores ganharam isso junto, e o do módulo 2 passou a mostrar
  duas folhas onde mostrava uma régua tracejada, que é o que uma quebra de
  página de fato faz.

  ── O número não se digita por cima ──────────────────────────────────────
  O rodapé chega com "Página 2" escrito à mão. O campo que o substitui é
  desenhado com o sombreado do Word e **não** é editável: deixar digitar por
  cima dele ensinaria que dá para consertar o número errado escrevendo o certo,
  que é exatamente o gesto que a lição existe para desfazer.

  ── E o sumário envelhece na tela ────────────────────────────────────────
  A seção que a liderança pediu entra por um botão, como o parágrafo da revisão
  do módulo 2 — e pelo mesmo motivo: o que a tarefa mede é o que acontece com o
  sumário depois, e para isso o gesto precisa acontecer dentro do documento.
*/

interface Props {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'word' }>;
  aoVencer: () => void | Promise<void>;
  aoSair: () => void;
}

const GUIAS_USAVEIS = ['Início', 'Inserir', 'Referências'];

export default function LaboratorioDoRelatorioAnual({ vereda, licao, aoVencer, aoSair }: Props) {
  const [doc, setDoc] = useState<Doc>(RELATORIO_ANUAL_INICIAL);
  const [guia, setGuia] = useState('Inserir');
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [zoom, setZoom] = useState(1);
  const jaGravou = useRef(false);

  const feitas = useMemo(
    () => new Set(METAS_DO_RELATORIO_ANUAL.filter(m => m.feita(doc)).map(m => m.id)),
    [doc],
  );
  const pedidas = METAS_DO_RELATORIO_ANUAL.filter(m => licao.verificacoes.includes(m.id));
  const venceu = pedidas.every(m => feitas.has(m.id));

  const tarefas = pedidas.map(m => ({
    id: m.id,
    titulo: m.titulo,
    feita: feitas.has(m.id),
    detalhe: m.detalhe,
    onde: m.onde,
    passos: m.passos,
  }));

  const naoFazParte = (nome: string) =>
    setAviso(`${nome} existe no Word de verdade, e está aqui para a janela ficar igual — mas não faz parte desta lição.`);

  /* ── As faixas ───────────────────────────────────────────────────────────── */

  const abrirFaixa = (onde: 'cabecalho' | 'rodape') => {
    const jaTinha = onde === 'cabecalho' ? !!doc.cabecalho : !!doc.rodape;
    if (jaTinha) {
      setAviso(onde === 'cabecalho'
        ? 'O cabeçalho já está aberto: clique nele, no alto da folha, e escreva.'
        : 'O rodapé já está aberto: clique nele, no pé da folha.');
      return;
    }
    /*
      A faixa nasce com um trecho vazio, e não sem trecho nenhum: é ele que
      vira o campo de digitar na folha. Uma faixa sem trecho apareceria aberta
      e sem onde escrever, que é pior do que não ter aberto.
    */
    const nova = { trechos: [trechoDe(`${onde}-a`, '')] };
    setDoc(d => (onde === 'cabecalho' ? { ...d, cabecalho: nova } : { ...d, rodape: nova }));
    setAviso(onde === 'cabecalho'
      ? 'Cabeçalho aberto. Escreva nele, no alto da folha — o que você escrever aparece em todas.'
      : 'Rodapé aberto.');
  };

  const escreverNaFaixa = (onde: 'cabecalho' | 'rodape', trechoId: string, valor: string) => {
    setDoc((d) => {
      const faixa = onde === 'cabecalho' ? d.cabecalho : d.rodape;
      if (!faixa) return d;
      const trocada = {
        trechos: faixa.trechos.map(x => (x.id === trechoId ? { ...x, texto: valor } : x)),
      };
      return onde === 'cabecalho' ? { ...d, cabecalho: trocada } : { ...d, rodape: trocada };
    });
  };

  const inserirNumeroDePagina = () => {
    if (faixaTemCampoDePagina(doc.rodape)) {
      setAviso('O rodapé já traz o campo de número de página.');
      return;
    }
    /*
      Ele **substitui** o que estava lá, que é o número digitado. Pôr o campo ao
      lado deixaria "Página 2 Página 3" no pé da folha, e a tarefa ficaria verde
      com o documento pior do que antes.
    */
    setDoc(d => ({
      ...d,
      rodape: { trechos: [trechoDe('rod-t', 'Página '), campoDe('rod-n', 'pagina')] },
    }));
    setAviso('Número de página inserido, e o que estava digitado saiu. Role as folhas: agora cada '
      + 'uma diz a sua, e ninguém precisou digitar nada.');
  };

  const alternarPrimeiraDiferente = () => {
    const ligando = !doc.primeiraPaginaDiferente;
    setDoc(d => ({ ...d, primeiraPaginaDiferente: ligando }));
    setAviso(ligando
      ? 'Primeira página diferente. A folha 1 já traz o nome do relatório em letra grande — '
        + 'repeti-lo no cabeçalho dela seria dizer duas vezes.'
      : 'As faixas voltaram para a folha 1.');
  };

  /* ── O documento ─────────────────────────────────────────────────────────── */

  const acrescentarSecao = () => {
    if (doc.blocos.some(b => b.id === SECAO_QUE_FALTA.tituloId)) {
      setAviso('A seção de encerramento já está no relatório.');
      return;
    }
    const tinhaSumario = !!doc.sumario;
    setDoc(d => ({
      ...d,
      blocos: [
        ...d.blocos,
        {
          ...linhaDe(SECAO_QUE_FALTA.tituloId, SECAO_QUE_FALTA.secao as Secao, SECAO_QUE_FALTA.titulo),
          estilo: 'Título 1' as const,
          quebraDePagina: true,
        },
        linhaDe(SECAO_QUE_FALTA.corpoId, SECAO_QUE_FALTA.secao as Secao, SECAO_QUE_FALTA.corpo),
      ],
    }));
    setAviso(tinhaSumario
      ? 'Seção acrescentada, em folha própria. Agora volte à folha 1 e olhe o sumário: ele não '
        + 'sabe que ela existe, e continua mostrando as folhas de antes. Nada avisou.'
      : 'Seção acrescentada, em folha própria, com o estilo Título 1 — que é o que o sumário procura.');
  };

  const gerarSumario = () => {
    const itens = titulosDoDoc(doc);
    setDoc(d => ({ ...d, sumario: itens }));
    setAviso(itens.length === 0
      ? 'Nenhuma entrada de sumário foi encontrada: ele lê os estilos de título, e não o tamanho da letra.'
      : `Sumário gerado com ${itens.length} entradas, cada uma com a folha em que está hoje.`);
  };

  const atualizarSumario = () => {
    if (!doc.sumario) {
      setAviso('Não há sumário para atualizar: gere um primeiro, em Referências › Sumário.');
      return;
    }
    const estava = sumarioAtualizado(doc);
    setDoc(d => ({ ...d, sumario: titulosDoDoc(d) }));
    setAviso(estava
      ? 'O sumário já estava em dia.'
      : 'Sumário atualizado. Ele estava mostrando o documento de antes — é isto que o botão '
        + 'alcança, e é a metade da lição que ninguém conta.');
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
        setDoc(RELATORIO_ANUAL_INICIAL);
        setSelecionado(null);
        setAviso('O relatório voltou ao estado em que chegou.');
      }}>
        Recomeçar
      </button>
      <button type="button" className="btn-primary" disabled={!venceu} onClick={concluir}>
        {venceu ? 'Concluir a lição' : `Faltam ${pedidas.length - feitas.size}`}
      </button>
    </>
  );

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

      <div className="wd-janela">
        <BarraDeTituloDoWord documento="Relatório Anual 2026" aoAvisar={naoFazParte} />

        <GuiasDoWord
          atual={guia} usaveis={GUIAS_USAVEIS}
          aoTrocar={setGuia} aoAvisar={naoFazParte} />

        <div className="wd-faixa" style={{ overflowX: 'auto' }}>
          {guia === 'Início' && (
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
              </GrupoDaFaixa>
            </>
          )}

          {guia === 'Inserir' && (
            <>
              <GrupoDaFaixa nome="Cabeçalho e Rodapé">
                <BotaoDaFaixa dica="Cabeçalho" rotulo="Cabeçalho" empilhado
                  ativo={!!doc.cabecalho} aoClicar={() => abrirFaixa('cabecalho')}>
                  <PanelTop className="w-5 h-5" />
                </BotaoDaFaixa>
                <BotaoDaFaixa dica="Rodapé" rotulo="Rodapé" empilhado
                  ativo={!!doc.rodape} aoClicar={() => abrirFaixa('rodape')}>
                  <PanelBottom className="w-5 h-5" />
                </BotaoDaFaixa>
                <BotaoDaFaixa dica="Número de Página" rotulo="Número de Página" empilhado
                  aoClicar={inserirNumeroDePagina}>
                  <Hash className="w-5 h-5" />
                </BotaoDaFaixa>
                {/*
                  A caixa do Word, e não um botão nosso: ela mora no grupo de
                  cabeçalho e rodapé porque é deles que ela fala.
                */}
                <BotaoDaFaixa dica="Primeira Página Diferente" rotulo="Primeira Página Diferente"
                  empilhado ativo={doc.primeiraPaginaDiferente}
                  aoClicar={alternarPrimeiraDiferente}>
                  {doc.primeiraPaginaDiferente
                    ? <SquareCheck className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </BotaoDaFaixa>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Texto">
                <BotaoDaFaixa dica="Acrescentar a seção de encerramento"
                  rotulo="Seção de encerramento" empilhado aoClicar={acrescentarSecao}>
                  <Plus className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
            </>
          )}

          {guia === 'Referências' && (
            <GrupoDaFaixa nome="Sumário">
              <BotaoDaFaixa dica="Sumário" rotulo="Sumário" empilhado aoClicar={gerarSumario}>
                <ListTree className="w-5 h-5" />
              </BotaoDaFaixa>
              <BotaoDaFaixa dica="Atualizar Sumário" rotulo="Atualizar Sumário" empilhado
                aoClicar={atualizarSumario}>
                <RefreshCw className="w-5 h-5" />
              </BotaoDaFaixa>
            </GrupoDaFaixa>
          )}
        </div>

        <ReguaDoWord larguraCm={21} margemCm={2.5} />

        <FolhaDoWord
          doc={doc}
          selecionado={selecionado}
          aoEscolher={(id) => { setSelecionado(id); setAviso(''); }}
          aoClicarNoVazio={() => setSelecionado(null)}
          aoEscreverNaFaixa={escreverNaFaixa}
        />

        <div className="wd-status">
          <span>{quantasPaginas(doc)} folhas</span>
          <span>
            {doc.sumario
              ? (sumarioAtualizado(doc) ? 'Sumário em dia' : 'Sumário desatualizado')
              : 'Sem sumário'}
          </span>
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} />
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
