import { useMemo, useRef, useState } from 'react';
import {
  Check, X, ChevronRight, RefreshCw, FileType2,
  Bold, Italic, Underline, AlignLeft, Clipboard, Scissors, Copy,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_WORD, CSS_FOLHA, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa,
  BotaoDaFaixa, EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord, FolhaDoWord,
  BastidoresDoWord, type PainelDosBastidores, type AjustesDeImpressao,
} from '../labs/word';
import {
  RELATORIO_DA_ENTREGA_INICIAL, ENTREGA_INICIAL, METAS_DA_ENTREGA,
  retratoDoDoc, quantasPaginas, revisoesPendentes,
  sumarioAtualizado, titulosDoDoc,
  type Doc, type Entrega, type FormatoDeArquivo,
} from '../labs/entregaDoRelatorio';
import { aceitarRevisao, rejeitarRevisao, paragrafos, NOME_DO_AUTOR } from '../labs/documento';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/*
  O laboratório de Word da CC-ES002, módulo 6 — requisitos 2.5, 4.6 e 7.

  ── O único dos seis em que o documento chega pronto ─────────────────────
  As quatro peças que o requisito 7 nomeia já estão lá, porque construí-las é o
  que os módulos 3 e 4 cobraram. O que falta é a **entrega**, e ela tem ordem:
  terminar, aceitar as marcas, atualizar o sumário, e só então exportar.

  ── A armadilha é o gesto natural ────────────────────────────────────────
  Abrir Arquivo e exportar agora é o que se faz sem pensar. O PDF sai com a
  marca de revisão dentro e o sumário apontando para as folhas de antes, e nada
  na tela diz isso: do lado de fora um PDF velho e um novo são o mesmo ícone. A
  tarefa "entregar o PDF do documento de agora" é a única que percebe, e o
  conserto é exportar de novo — quem conserta dentro do PDF acaba com dois
  documentos diferentes.

  ── Os bastidores são os do Word, e já existiam ──────────────────────────
  `BastidoresDoWord` é a tela que o menu Arquivo abre por cima do documento,
  escrita para a AP042. Aqui ela ganhou duas coisas que faltavam para ser a
  tela do programa e não a de um exercício: o nome do arquivo passa a poder ser
  digitado quando o laboratório entrega o setter, e a prévia de impressão passa
  a vir de fora. Ela era o texto do documento da AP042, escrito dentro da
  janela compartilhada — o segundo laboratório a abrir Imprimir mostraria a
  prévia do relatório do outro exercício.
*/

interface Props {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'word' }>;
  aoVencer: () => void | Promise<void>;
  aoSair: () => void;
}

const GUIAS_USAVEIS = ['Início', 'Referências', 'Revisão'];

const IMPRESSAO_INICIAL: AjustesDeImpressao = {
  copias: 1, agrupado: true, qualidade: 'normal', ajuste: 'real', porFolha: 1,
};

export default function LaboratorioDaEntrega({ vereda, licao, aoVencer, aoSair }: Props) {
  const [doc, setDoc] = useState<Doc>(RELATORIO_DA_ENTREGA_INICIAL);
  const [entrega, setEntrega] = useState<Entrega>(ENTREGA_INICIAL);
  const [guia, setGuia] = useState('Revisão');
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [trecho, setTrecho] = useState<string | null>(null);
  const [painel, setPainel] = useState<PainelDosBastidores | null>(null);
  const [formato, setFormato] = useState<FormatoDeArquivo>('docx');
  const [imp, setImp] = useState<AjustesDeImpressao>(IMPRESSAO_INICIAL);
  const [aviso, setAviso] = useState('');
  const [zoom, setZoom] = useState(1);
  const jaGravou = useRef(false);

  const contexto = useMemo(() => ({ doc, entrega }), [doc, entrega]);
  const feitas = useMemo(
    () => new Set(METAS_DA_ENTREGA.filter(m => m.feita(contexto)).map(m => m.id)),
    [contexto],
  );
  const pedidas = METAS_DA_ENTREGA.filter(m => licao.verificacoes.includes(m.id));
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

  /* ── Terminar ────────────────────────────────────────────────────────────── */

  const pendentes = revisoesPendentes(doc);
  const marcaEscolhida = trecho && pendentes.some(r => r.trecho.id === trecho) ? trecho : null;

  const proximaMarca = () => {
    if (pendentes.length === 0) { setAviso('Não há mais marcas para resolver.'); return; }
    const atual = pendentes.findIndex(r => r.trecho.id === trecho);
    const proxima = pendentes[(atual + 1) % pendentes.length];
    setTrecho(proxima.trecho.id);
    setSelecionado(proxima.bloco);
    setAviso(`Marca de ${NOME_DO_AUTOR[proxima.trecho.revisao.autor]}: "${proxima.trecho.texto}" `
      + `${proxima.trecho.revisao.tipo === 'inserido' ? 'entrou' : 'saiu'}.`);
  };

  /* Sem marca escolhida os dois botões não agem calados: agir na primeira
     pendente pareceria funcionar e resolveria a marca errada. */
  const semMarca = () => setAviso('Clique primeiro na marca que você quer resolver, no texto — '
    + 'ou use Próxima para andar até ela.');

  const aceitar = () => {
    if (!marcaEscolhida) { semMarca(); return; }
    setDoc(d => aceitarRevisao(d, marcaEscolhida));
    setTrecho(null);
    setAviso('Marca aceita.');
  };

  const rejeitar = () => {
    if (!marcaEscolhida) { semMarca(); return; }
    setDoc(d => rejeitarRevisao(d, marcaEscolhida));
    setTrecho(null);
    setAviso('Marca rejeitada: o texto voltou ao que era.');
  };

  const atualizarSumario = () => {
    setDoc(d => ({ ...d, sumario: titulosDoDoc(d) }));
    setAviso('Sumário atualizado: agora ele lista o documento como ele está hoje.');
  };

  /* ── A entrega ───────────────────────────────────────────────────────────── */

  /*
    Gravar em disco é sempre o mesmo gesto, seja por Salvar como ou por
    Exportar: o arquivo leva o **retrato** do documento no instante em que foi
    gravado. Duas funções separadas divergiriam, e uma delas passaria a gravar
    um arquivo que se atualiza sozinho — que é o contrário da lição.
  */
  const gravar = (fmt: FormatoDeArquivo) => {
    const nome = `${entrega.nome}.${fmt}`;
    setEntrega(e => ({
      ...e,
      arquivos: [
        ...e.arquivos.filter(a => a.formato !== fmt),
        { nome, formato: fmt, retrato: retratoDoDoc(doc) },
      ],
    }));
    return nome;
  };

  const salvarComo = () => {
    const nome = gravar(formato);
    setPainel(null);
    setAviso(formato === 'pdf'
      ? `${nome} gravado. Salvar como em PDF e Exportar chegam no mesmo lugar.`
      : `${nome} gravado em Documentos › Clube.`);
  };

  const exportarPdf = () => {
    const nome = gravar('pdf');
    setPainel(null);
    setAviso(`${nome} criado. Ele congelou o documento como ele está agora — `
      + 'se você mexer em alguma coisa depois disto, exporte de novo.');
  };

  /* ── A cápsula ───────────────────────────────────────────────────────────── */

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
        setDoc(RELATORIO_DA_ENTREGA_INICIAL);
        setEntrega(ENTREGA_INICIAL);
        setSelecionado(null); setTrecho(null); setPainel(null);
        setFormato('docx'); setImp(IMPRESSAO_INICIAL);
        setAviso('O relatório e a pasta voltaram ao estado em que chegaram.');
      }}>
        Recomeçar
      </button>
      <button type="button" className="btn-primary" disabled={!venceu} onClick={concluir}>
        {venceu ? 'Concluir a lição' : `Faltam ${pedidas.length - feitas.size}`}
      </button>
    </>
  );

  /* A prévia mostra **este** relatório, e vem daqui: dentro da janela
     compartilhada ela mostraria o documento de outro exercício. */
  const previa = (
    <>
      <div className="wd-previa-folha">
        <p style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
          {paragrafos(doc)[0]?.trechos.map(x => x.texto).join('')}
        </p>
        {paragrafos(doc).slice(1, 4).map(b => (
          <p key={b.id} style={{ marginBottom: 5 }}>
            {b.trechos.filter(x => x.revisao?.tipo !== 'excluido').map(x => x.texto).join('')}
          </p>
        ))}
      </div>
      <p style={{ fontSize: 11.5, color: '#605E5C' }}>1 de {quantasPaginas(doc)} páginas</p>
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

      {painel ? (
        <BastidoresDoWord
          nomeDoArquivo={entrega.nome}
          aoMudarNome={v => setEntrega(e => ({ ...e, nome: v }))}
          painel={painel}
          aoTrocarPainel={setPainel}
          aoVoltar={() => setPainel(null)}
          formato={formato}
          aoMudarFormato={f => setFormato(f as FormatoDeArquivo)}
          aoSalvarComo={salvarComo}
          aoSalvar={() => { gravar('docx'); setPainel(null); setAviso('Documento salvo.'); }}
          aoExportarPdf={exportarPdf}
          imp={imp}
          aoMudarImpressao={setImp}
          aoImprimir={() => setAviso('O clube entrega o relatório em arquivo; imprimir não faz parte desta lição.')}
          aoAvisar={naoFazParte}
          previaDaImpressao={previa}
        />
      ) : (
        <div className="wd-janela">
          <BarraDeTituloDoWord documento={entrega.nome} aoAvisar={naoFazParte} />

          {/* Arquivo não é guia: é a porta dos bastidores, como no Word. */}
          <GuiasDoWord
            atual={guia} usaveis={GUIAS_USAVEIS}
            aoTrocar={setGuia}
            aoAbrirArquivo={() => setPainel('salvar-como')}
            aoAvisar={naoFazParte} />

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

            {guia === 'Referências' && (
              <GrupoDaFaixa nome="Sumário">
                <BotaoDaFaixa dica="Atualizar Sumário" rotulo="Atualizar Sumário" empilhado
                  aoClicar={atualizarSumario}>
                  <RefreshCw className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
            )}

            {guia === 'Revisão' && (
              <GrupoDaFaixa nome="Alterações">
                <BotaoDaFaixa dica="Próxima" rotulo="Próxima" empilhado aoClicar={proximaMarca}>
                  <ChevronRight className="w-5 h-5" />
                </BotaoDaFaixa>
                <BotaoDaFaixa dica="Aceitar" rotulo="Aceitar" empilhado aoClicar={aceitar}>
                  <Check className="w-5 h-5" />
                </BotaoDaFaixa>
                <BotaoDaFaixa dica="Rejeitar" rotulo="Rejeitar" empilhado aoClicar={rejeitar}>
                  <X className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
            )}

            {/* Exportar também mora na faixa, e não só no menu Arquivo: é o
                atalho que o Word tem, e é onde a tarefa manda olhar. */}
            <GrupoDaFaixa nome="Entrega">
              <BotaoDaFaixa dica="Exportar em PDF" rotulo="Exportar" empilhado
                aoClicar={() => setPainel('exportar')}>
                <FileType2 className="w-5 h-5" />
              </BotaoDaFaixa>
            </GrupoDaFaixa>
          </div>

          <ReguaDoWord larguraCm={21} margemCm={2.5} />

          <FolhaDoWord
            doc={doc}
            selecionado={selecionado}
            aoEscolher={(id) => { setSelecionado(id); setAviso(''); }}
            aoEscolherTrecho={(id) => {
              setTrecho(id);
              const bloco = paragrafos(doc).find(b => b.trechos.some(x => x.id === id));
              if (bloco) setSelecionado(bloco.id);
              setAviso('');
            }}
            aoClicarNoVazio={() => { setSelecionado(null); setTrecho(null); }}
          />

          <div className="wd-status">
            <span>{quantasPaginas(doc)} folhas</span>
            <span>
              {pendentes.length === 0
                ? 'Sem marcas pendentes'
                : `${pendentes.length} ${pendentes.length === 1 ? 'marca' : 'marcas'} pendentes`}
            </span>
            <span>{sumarioAtualizado(doc) ? 'Sumário em dia' : 'Sumário desatualizado'}</span>
            {/*
              A régua de status conta o que está na pasta, e **não** diz se o
              arquivo está em dia: o Word não sabe disso, e escrever "PDF
              desatualizado" aqui poria na nossa tela a resposta que a lição
              existe para o desbravador descobrir sozinho, olhando a ordem.
            */}
            <span data-arquivos={entrega.arquivos.length}>
              {entrega.arquivos.length === 0
                ? 'Nada gravado ainda'
                : entrega.arquivos.map(a => a.nome).join(' · ')}
            </span>
            <ZoomDoWord zoom={zoom} aoMudar={setZoom} />
          </div>
        </div>
      )}
    </LaboratorioEmTelaCheia>
  );
}
