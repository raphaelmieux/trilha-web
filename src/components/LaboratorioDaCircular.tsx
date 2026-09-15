import { useMemo, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Pilcrow, AlignLeft, Sparkles, Trash2,
  Clipboard, Scissors, Copy, CornerDownLeft, FileText, Plus,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_WORD, CSS_FOLHA, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa,
  BotaoDaFaixa, EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord, FolhaDoWord,
} from '../labs/word';
import {
  CIRCULAR_INICIAL, METAS_DA_CIRCULAR, PARAGRAFO_QUE_CHEGA, IDS_DO_ENDERECO,
  gestosVazios, textoDoBloco,
  type Doc, type GestosDaCircular,
} from '../labs/circularDoClube';
import { linhaDe, trechoDe, FONTES } from '../labs/documento';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/*
  O laboratório de Word da CC-ES002, módulo 2.

  ── Por que é um segundo componente, e não um modo do primeiro ───────────
  A **janela** é a mesma, e por isso ela mora em `word.tsx` — a folha, o
  parágrafo, o sumário, a barra de título, a faixa. O que muda é a lição: lá
  se troca formatação direta por estilo, aqui se troca estrutura errada por
  estrutura certa. Dois conjuntos de tarefas e dois documentos dentro de um
  componente só viraria uma cascata de `if` sobre qual exercício está aberto.

  É o arranjo de `FileManagerLab` e `LaboratorioDeExplorador`, que são dois
  laboratórios vestindo o mesmo `explorer.tsx`.

  ── O botão ¶ não é enfeite ─────────────────────────────────────────────
  A teoria desta vereda escreve que, com as marcas desligadas, o Enter e a
  quebra de linha são invisíveis "e o documento erra calado". Um laboratório
  sobre a diferença entre os dois em que ninguém pudesse ver a diferença
  cometeria, na própria tela, o defeito que a lição existe para nomear. Por
  isso ligá-las é a primeira tarefa, e por isso `FolhaDoWord` sabe desenhá-las.
*/

interface Props {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'word' }>;
  aoVencer: () => void | Promise<void>;
  aoSair: () => void;
}

const GUIAS_USAVEIS = ['Início', 'Inserir'];

const FAMILIAS = [
  { id: 'serifada' as const, nome: 'Georgia', dica: 'Serifada — texto longo no papel' },
  { id: 'sem-serifa' as const, nome: 'Calibri', dica: 'Sem serifa — tela, título, placa' },
];

export default function LaboratorioDaCircular({ vereda, licao, aoVencer, aoSair }: Props) {
  const [doc, setDoc] = useState<Doc>(CIRCULAR_INICIAL);
  const [gestos, setGestos] = useState<GestosDaCircular>(gestosVazios);
  const [guia, setGuia] = useState('Início');
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [zoom, setZoom] = useState(1);
  const jaGravou = useRef(false);

  const contexto = useMemo(() => ({ doc, gestos }), [doc, gestos]);
  const alvo = doc.blocos.find(b => b.id === selecionado) ?? null;

  const feitas = useMemo(
    () => new Set(METAS_DA_CIRCULAR.filter(m => m.feita(contexto)).map(m => m.id)),
    [contexto],
  );
  const pedidas = METAS_DA_CIRCULAR.filter(m => licao.verificacoes.includes(m.id));
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

  const exigirSelecao = () => {
    if (alvo) return true;
    setAviso('Clique primeiro num parágrafo — o comando vale para onde o cursor está.');
    return false;
  };

  /* ── Os gestos ───────────────────────────────────────────────────────────── */

  const alternarMarcas = () => {
    setGestos(g => ({ ...g, marcas: !g.marcas }));
    setAviso(gestos.marcas
      ? 'Marcas desligadas. O documento volta a parecer certo — e é justamente por isso que elas existem.'
      : 'Marcas ligadas. Cada ¶ é um Enter; os cinco sozinhos antes da assinatura são os que a empurram.');
  };

  /**
   * Junta o endereço num parágrafo só, com quebras de linha entre as linhas.
   *
   * O gesto de verdade é apagar o ¶ e pôr `Shift+Enter` no lugar, e é o que o
   * passo a passo ensina. Aqui ele é um comando porque não há cursor de texto
   * dentro do parágrafo — a folha não é editável, e inventar um editor de texto
   * completo para este exercício daria um programa que não é o Word.
   */
  const juntarComQuebra = () => {
    if (!exigirSelecao() || !alvo || alvo.secao !== 'endereco') {
      setAviso('Escolha uma das linhas do endereço: são elas que deviam ser um parágrafo só.');
      return;
    }
    setDoc(d => {
      const doEndereco = d.blocos.filter(b => IDS_DO_ENDERECO.includes(b.id));
      if (doEndereco.length < 2) return d;
      const junto = {
        ...doEndereco[0],
        trechos: doEndereco.map((b, i) => ({
          ...trechoDe(`end-${i}`, textoDoBloco(b)),
          ...(i > 0 ? { quebra: true } : {}),
        })),
      };
      const onde = d.blocos.findIndex(b => b.id === IDS_DO_ENDERECO[0]);
      const resto = d.blocos.filter(b => !IDS_DO_ENDERECO.includes(b.id));
      return { ...d, blocos: [...resto.slice(0, onde), junto, ...resto.slice(onde)] };
    });
    setSelecionado(IDS_DO_ENDERECO[0]);
    setAviso('As três linhas viraram um parágrafo só. Com as marcas ligadas, o ↵ apareceu no lugar '
      + 'de dois ¶ — e o vão entre elas sumiu junto.');
  };

  const acrescentarParagrafo = () => {
    if (gestos.cresceu) return;
    setDoc(d => {
      const onde = d.blocos.findIndex(b => b.id === 'ab-3');
      const novo = linhaDe(PARAGRAFO_QUE_CHEGA.id, PARAGRAFO_QUE_CHEGA.secao, PARAGRAFO_QUE_CHEGA.texto);
      return { ...d, blocos: [...d.blocos.slice(0, onde + 1), novo, ...d.blocos.slice(onde + 1)] };
    });
    setGestos(g => ({ ...g, cresceu: true }));
    setAviso('Parágrafo acrescentado. Olhe a assinatura: os cinco Enters continuam empurrando o mesmo '
      + 'tanto, e o tanto certo mudou. É isso que o Enter cobra depois.');
  };

  const excluirParagrafo = () => {
    if (!exigirSelecao() || !alvo) return;
    if (textoDoBloco(alvo).trim() !== '') {
      setAviso('Este parágrafo tem texto. Os que empurram a assinatura são os vazios — com as marcas '
        + 'ligadas, são os ¶ sozinhos.');
      return;
    }
    const id = alvo.id;
    setDoc(d => ({ ...d, blocos: d.blocos.filter(b => b.id !== id) }));
    setSelecionado(null);
    setAviso('Parágrafo vazio apagado.');
  };

  const quebraDePagina = () => {
    if (!exigirSelecao() || !alvo) return;
    const id = alvo.id;
    setDoc(d => ({
      ...d,
      blocos: d.blocos.map(b => (b.id === id ? { ...b, quebraDePagina: !b.quebraDePagina } : b)),
    }));
    setAviso(alvo.quebraDePagina
      ? 'Quebra de página removida.'
      : 'Quebra de página posta antes deste parágrafo. Ela empurra para a folha seguinte e continua '
        + 'certa quando o texto de cima crescer.');
  };

  const escolherFonte = (id: 'serifada' | 'sem-serifa') => {
    setDoc(d => ({ ...d, fonte: id }));
    setAviso(id === 'serifada'
      ? 'Fonte serifada. É a de texto longo impresso — os pezinhos ajudam o olho a seguir a linha no papel.'
      : 'Fonte sem serifa. Ela é a de tela e de título; esta circular vai impressa e lida inteira.');
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
        setDoc(CIRCULAR_INICIAL);
        setGestos(gestosVazios());
        setSelecionado(null);
        setAviso('A circular voltou ao estado em que chegou.');
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
      <style>{`
        .wc-fontes { display: flex; gap: 3px; }
        .wc-fonte {
          border: 1px solid #C8C6C4; background: #FFFFFF; border-radius: 2px;
          padding: 2px 10px; height: 40px; min-width: 76px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: #201F1E; white-space: nowrap;
        }
        .wc-fonte:hover { border-color: #2B579A; }
      `}</style>

      {/* A fonte escolhida veste a folha inteira, que é o que o requisito 2.4
          pede: a decisão é do documento, e não de um parágrafo. */}
      <div className="wd-janela" style={doc.fonte ? { fontFamily: FONTES[doc.fonte] } : undefined}>
        <BarraDeTituloDoWord documento="Circular às famílias" aoAvisar={naoFazParte} />

        <GuiasDoWord
          atual={guia} usaveis={GUIAS_USAVEIS}
          aoTrocar={setGuia}
          aoAvisar={naoFazParte} />

        {guia === 'Início' && (
          <div className="wd-faixa" style={{ overflowX: 'auto' }}>
            <GrupoDaFaixa nome="Área de Transferência">
              <EnfeiteDaFaixa dica="Colar (Ctrl+V)" rotulo="Colar" empilhado aoAvisar={naoFazParte}>
                <Clipboard className="w-5 h-5" />
              </EnfeiteDaFaixa>
              <EnfeiteDaFaixa dica="Recortar (Ctrl+X)" aoAvisar={naoFazParte}><Scissors className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
              <EnfeiteDaFaixa dica="Copiar (Ctrl+C)" aoAvisar={naoFazParte}><Copy className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
            </GrupoDaFaixa>

            <GrupoDaFaixa nome="Fonte">
              {/* As duas famílias, e não uma lista de vinte nomes: o requisito
                  2.4 pede a escolha entre serifada e sem serifa, e uma lista
                  longa esconderia a decisão no meio do rolar. */}
              <div className="wc-fontes">
                {FAMILIAS.map(f => (
                  <button
                    key={f.id} type="button" className="wc-fonte" title={f.dica}
                    aria-pressed={doc.fonte === f.id}
                    style={{
                      fontFamily: FONTES[f.id],
                      borderColor: doc.fonte === f.id ? '#2B579A' : '#C8C6C4',
                    }}
                    onClick={() => escolherFonte(f.id)}
                  >
                    {f.nome}
                  </button>
                ))}
              </div>
              <EnfeiteDaFaixa dica="Negrito (Ctrl+N)" aoAvisar={naoFazParte}><Bold className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
              <EnfeiteDaFaixa dica="Itálico (Ctrl+I)" aoAvisar={naoFazParte}><Italic className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
              <EnfeiteDaFaixa dica="Sublinhado (Ctrl+S)" aoAvisar={naoFazParte}><Underline className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
            </GrupoDaFaixa>

            <GrupoDaFaixa nome="Parágrafo">
              <EnfeiteDaFaixa dica="Alinhar à Esquerda (Ctrl+Q)" aoAvisar={naoFazParte}><AlignLeft className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
              {/*
                O botão que a lição inteira depende. Com ele desligado o Enter e
                a quebra de linha não aparecem, e o documento errado passa por
                certo — é o que a teoria diz, e é a primeira tarefa.
              */}
              <BotaoDaFaixa dica="Mostrar Tudo (Ctrl+*)" ativo={gestos.marcas} aoClicar={alternarMarcas}>
                <Pilcrow className="w-3.5 h-3.5" />
              </BotaoDaFaixa>
              <BotaoDaFaixa dica="Juntar com Quebra de Linha (Shift+Enter)" aoClicar={juntarComQuebra}>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </BotaoDaFaixa>
              <BotaoDaFaixa dica="Excluir Parágrafo Vazio" aoClicar={excluirParagrafo}>
                <Trash2 className="w-3.5 h-3.5" />
              </BotaoDaFaixa>
            </GrupoDaFaixa>

            <GrupoDaFaixa nome="Editando">
              <EnfeiteDaFaixa dica="Localizar (Ctrl+L)" aoAvisar={naoFazParte}><Sparkles className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
            </GrupoDaFaixa>
          </div>
        )}

        {guia === 'Inserir' && (
          <div className="wd-faixa" style={{ overflowX: 'auto' }}>
            <GrupoDaFaixa nome="Páginas">
              <BotaoDaFaixa dica="Quebra de Página (Ctrl+Enter)" rotulo="Quebra de Página" empilhado
                aoClicar={quebraDePagina}>
                <FileText className="w-5 h-5" />
              </BotaoDaFaixa>
            </GrupoDaFaixa>
            <GrupoDaFaixa nome="Texto">
              {/*
                O parágrafo que a liderança pediu. Ele é da lição, e não do Word
                — e mesmo assim entra aqui, onde o texto se insere, em vez de
                virar um botão da plataforma por cima da janela: o que a tarefa
                mede é o que acontece com a assinatura depois, e para isso o
                gesto precisa acontecer dentro do documento.
              */}
              <BotaoDaFaixa dica="Acrescentar o parágrafo da revisão" rotulo="Parágrafo da revisão"
                empilhado aoClicar={acrescentarParagrafo}>
                <Plus className="w-5 h-5" />
              </BotaoDaFaixa>
            </GrupoDaFaixa>
          </div>
        )}

        <ReguaDoWord larguraCm={21} margemCm={2.5} />

        <FolhaDoWord
          doc={doc}
          selecionado={selecionado}
          marcas={gestos.marcas}
          aoEscolher={id => { setSelecionado(id); setAviso(''); }}
          aoClicarNoVazio={() => setSelecionado(null)}
        />

        <div className="wd-status">
          <span>{doc.blocos.length} parágrafos</span>
          <span>{gestos.marcas ? 'Marcas de parágrafo ligadas' : 'Marcas de parágrafo desligadas'}</span>
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} />
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
