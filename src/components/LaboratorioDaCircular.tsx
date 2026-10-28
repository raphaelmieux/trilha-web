import { useMemo, useRef, useState } from 'react';
import {
  Sparkles, FileText, Search, Replace, MousePointer2,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_WORD, CSS_FOLHA, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa,
  BotaoDaFaixa, EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord, FolhaDoWord,
} from '../labs/word';
import { GrupoDeFonte, CSS_FONTE_DO_WORD, GrupoDeParagrafo, GrupoAreaDeTransferencia } from '../labs/fonteDoWord';
import {
  CIRCULAR_INICIAL, METAS_DA_CIRCULAR, PARAGRAFO_QUE_CHEGA,
  gestosVazios,
  type Doc, type GestosDaCircular,
} from '../labs/circularDoClube';
import { quantasPaginas, textoVisivel } from '../labs/documento';
import { useEdicaoDoWord } from '../labs/useEdicaoDoWord';
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
  /**
   * O documento de partida e o nome dele, quando não são os do exercício. Só a
   * página de bastidor passa isto, para fotografar um gesto num documento que
   * não é o da lição — veja `src/components/bastidor.ts`.
   */
  inicial?: import('../labs/documento').Doc<string>;
  arquivo?: string;
}

const GUIAS_USAVEIS = ['Início', 'Inserir'];

/** Em que folha está o parágrafo do cursor — a régua de status do Word diz. */
function paginaDoCursor(d: Doc, bloco: string | undefined): number {
  if (!bloco) return 1;
  let pagina = 1;
  for (const b of d.blocos) {
    if (b.quebraDePagina && b !== d.blocos[0]) pagina++;
    if (b.id === bloco) return pagina;
  }
  return 1;
}

export default function LaboratorioDaCircular({ vereda, licao, aoVencer, aoSair, inicial, arquivo }: Props) {
  const [doc, setDoc] = useState<Doc>((inicial as Doc | undefined) ?? CIRCULAR_INICIAL);
  const [gestos, setGestos] = useState<GestosDaCircular>(gestosVazios);
  const [guia, setGuia] = useState('Início');
  const [aviso, setAviso] = useState('');
  const [zoom, setZoom] = useState(1);
  const jaGravou = useRef(false);
  const edicao = useEdicaoDoWord(doc, setDoc);

  const contexto = useMemo(() => ({ doc, gestos }), [doc, gestos]);

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

  /* ── Os gestos ───────────────────────────────────────────────────────────── */

  const alternarMarcas = () => {
    setGestos(g => ({ ...g, marcas: !g.marcas }));
    setAviso(gestos.marcas
      ? 'Marcas desligadas. O documento volta a parecer certo — e é justamente por isso que elas existem.'
      : 'Marcas ligadas. Cada ¶ é um Enter; os cinco sozinhos antes da assinatura são os que a empurram.');
    edicao.focar();
  };

  const quebraDePagina = () => {
    if (!edicao.selecao) {
      setAviso('Clique primeiro no documento — a quebra de página entra onde o cursor está.');
      return;
    }
    edicao.executar({ tipo: 'quebra-de-pagina' });
    edicao.focar();
  };

  /*
    O recado da liderança vai para a área de transferência do computador, e
    dali entra no documento pelo Ctrl+V de sempre. Antes havia um botão na
    faixa que punha o parágrafo pronto no lugar certo — um comando que o Word
    não tem, e que fazia a tarefa medir um clique. A cópia é da plataforma, e
    por isso mora no painel; colar é do programa.
  */
  const copiarRecado = async () => {
    try {
      await navigator.clipboard.writeText(PARAGRAFO_QUE_CHEGA.texto);
      setAviso('O aviso da liderança foi copiado. Clique onde ele deve entrar, aperte Enter e cole com Ctrl+V.');
    } catch {
      setAviso(`Não deu para copiar daqui — escreva o aviso: "${PARAGRAFO_QUE_CHEGA.texto}"`);
    }
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
      <button type="button" className="btn-ghost" onClick={copiarRecado}>
        Copiar o aviso da liderança
      </button>
      <button type="button" className="btn-ghost" onClick={() => {
        edicao.reiniciar(CIRCULAR_INICIAL);
        setGestos(gestosVazios());
        setAviso('A circular voltou ao estado em que chegou.');
      }}>
        Recomeçar
      </button>
      <button type="button" className="btn-primary" disabled={!venceu} onClick={concluir}>
        {venceu ? 'Concluir a lição' : `Faltam ${pedidas.length - feitas.size}`}
      </button>
    </>
  );

  const palavras = textoVisivel(doc).split(/\s+/).filter(Boolean).length;

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
      <style>{CSS_FONTE_DO_WORD}</style>

      <div className="wd-janela" style={{
        '--largura-cm': 21, '--altura-cm': 29.7, '--margem-cm': 2.5, '--zoom': zoom,
      } as React.CSSProperties}>
        <BarraDeTituloDoWord documento={arquivo ?? 'Circular às famílias'} aoAvisar={setAviso}
          aoDesfazer={edicao.podeDesfazer ? edicao.desfazer : undefined}
          aoRefazer={edicao.podeRefazer ? edicao.refazer : undefined} />

        <GuiasDoWord
          atual={guia} usaveis={GUIAS_USAVEIS}
          aoTrocar={setGuia}
          aoAvisar={setAviso} />

        {guia === 'Início' && (
          <div className="wd-faixa">
            <GrupoAreaDeTransferencia edicao={edicao} aoAvisar={setAviso} />

            <GrupoDeFonte edicao={edicao} aoAvisar={setAviso} />

            <GrupoDeParagrafo edicao={edicao} aoAvisar={setAviso}
              marcas={{ ligadas: gestos.marcas, alternar: alternarMarcas }} />

            <GrupoDaFaixa nome="Edição">
              <div className="wd-linhas">
                <EnfeiteDaFaixa dica="Localizar (Ctrl+L)" rotulo="Localizar" aoAvisar={setAviso}><Search className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                <EnfeiteDaFaixa dica="Substituir (Ctrl+U)" rotulo="Substituir" aoAvisar={setAviso}><Replace className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                <BotaoDaFaixa dica="Selecionar Tudo (Ctrl+A)" rotulo="Selecionar" aoClicar={() => { edicao.executar({ tipo: 'selecionar-tudo' }); edicao.focar(); }}>
                  <MousePointer2 className="w-3.5 h-3.5" />
                </BotaoDaFaixa>
              </div>
            </GrupoDaFaixa>
          </div>
        )}

        {guia === 'Inserir' && (
          <div className="wd-faixa">
            <GrupoDaFaixa nome="Páginas">
              <EnfeiteDaFaixa dica="Folha de Rosto" rotulo="Folha de Rosto" empilhado aoAvisar={setAviso}>
                <FileText className="w-5 h-5" />
              </EnfeiteDaFaixa>
              <EnfeiteDaFaixa dica="Página em Branco" rotulo="Página em Branco" empilhado aoAvisar={setAviso}>
                <FileText className="w-5 h-5" />
              </EnfeiteDaFaixa>
              <BotaoDaFaixa dica="Quebra de Página (Ctrl+Enter)" rotulo="Quebra de Página" empilhado
                aoClicar={quebraDePagina}>
                <Sparkles className="w-5 h-5" />
              </BotaoDaFaixa>
            </GrupoDaFaixa>
          </div>
        )}

        <ReguaDoWord larguraCm={21} margemCm={2.5} />

        <FolhaDoWord doc={doc} marcas={gestos.marcas} edicao={edicao.folha} />

        <div className="wd-status">
          <span>Página {Math.min(paginaDoCursor(doc, edicao.selecao?.foco.bloco), quantasPaginas(doc))} de {quantasPaginas(doc)}</span>
          <span>{palavras} palavras</span>
          <span>Português (Brasil)</span>
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} aoAvisar={setAviso} />
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
