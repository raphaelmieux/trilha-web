import { useMemo, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Eraser, AlignLeft, Pilcrow, Sparkles,
  BookMarked, ListTree, StickyNote, Quote,
  Clipboard, Scissors, Copy,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_WORD, CSS_FOLHA, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa,
  BotaoDaFaixa, EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord, FolhaDoWord,
} from '../labs/word';
import {
  OFICIO_INICIAL, METAS_DO_OFICIO, type Doc,
} from '../labs/oficioDoClube';
import {
  aparenciaDe, textoDoBloco, ehTitulo, titulosDoDoc,
  type Estilo, type AjusteDeEstilo,
} from '../labs/documento';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/*
  O laboratório de Word da CC-ES002, módulo 1.

  ── O que ele tem que o da AP044 não tem ─────────────────────────────────
  A janela é a mesma — as peças saem de `word.tsx`, e é essa a razão de elas
  terem saído de dentro de `PlanilhaLab` um dia. O que muda é a pergunta.

  Lá o documento chega sem estilo nenhum e a tarefa é aplicar. Aqui ele chega
  **formatado à mão**: os títulos estão em negrito, grandes e azuis, e nenhum
  deles é um título. A tarefa é trocar uma coisa pela outra sem mexer no texto,
  e o que prova que valeu a pena é o último gesto — modificar a definição de
  Título 2 e ver as quatro seções mudarem juntas.

  Três coisas só existem aqui, e cada uma é um requisito:

  - "Limpar Toda a Formatação", no grupo Fonte. Sem ela o estilo fica embaixo
    da direta e o documento não muda de aparência, que é o requisito 6;
  - o botão direito na galeria de Estilos, que abre "Modificar". É o requisito
    4.1 ("aplicar **e modificar**") e o 8;
  - o sumário que sai vazio antes dos estilos. A mensagem é a do Word, e ela é
    o único sinal de que o documento bonito está quebrado.
*/

interface Props {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'word' }>;
  aoVencer: () => void | Promise<void>;
  aoSair: () => void;
}

const GUIAS_USAVEIS = ['Início', 'Referências'];

/** Os estilos que esta lição precisa oferecer na galeria. */
const NA_GALERIA: Estilo[] = ['Normal', 'Título 1', 'Título 2', 'Citação', 'Legenda'];

/** As cores que a caixa Modificar oferece — as da paleta padrão do Word. */
const CORES = [
  { nome: 'Automático', valor: '#201F1E' },
  { nome: 'Azul, Ênfase 1', valor: '#2F5496' },
  { nome: 'Vermelho escuro', valor: '#7F2C1E' },
  { nome: 'Verde, Ênfase 6', valor: '#2E6C4D' },
];

const TAMANHOS = [9, 10, 11, 12, 13, 14, 16, 18, 20, 24];

export default function LaboratorioDeWord({ vereda, licao, aoVencer, aoSair }: Props) {
  const [doc, setDoc] = useState<Doc>(OFICIO_INICIAL);
  const [guia, setGuia] = useState('Início');
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  /* A caixa Modificar Estilo, quando aberta, e o rascunho dela. O rascunho é
     separado do documento porque a caixa do Word tem Cancelar: aplicar a cada
     digitação faria o Cancelar não ter o que desfazer. */
  const [modificando, setModificando] = useState<Estilo | null>(null);
  const [rascunho, setRascunho] = useState<AjusteDeEstilo>({});
  const [aviso, setAviso] = useState('');
  const [zoom, setZoom] = useState(1);
  const [gravando, setGravando] = useState(false);
  const jaGravou = useRef(false);

  const alvo = doc.blocos.find(b => b.id === selecionado) ?? null;

  const feitas = useMemo(
    () => new Set(METAS_DO_OFICIO.filter(m => m.feita(doc)).map(m => m.id)),
    [doc],
  );
  const pedidas = METAS_DO_OFICIO.filter(m => licao.verificacoes.includes(m.id));
  const venceu = pedidas.every(m => feitas.has(m.id));

  /* O passo a passo vai **em cada tarefa**, e não num campo da moldura: é a
     moldura que decide quando oferecê-lo, depois de um tempo sem ninguém
     concluir nada, e ela precisa saber de qual tarefa está falando. */
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

  const fecharMenu = () => setMenu(null);
  const abrir = (id: string) => setMenu(m => (m === id ? null : id));

  const exigirSelecao = () => {
    if (alvo) return true;
    /* O Word também diz isso, em vez de aplicar no nada: é a mesma decisão do
       "selecione primeiro" do laboratório de operações. */
    setAviso('Clique primeiro num parágrafo do documento — o estilo vale para onde o cursor está.');
    return false;
  };

  /* ── Os gestos ───────────────────────────────────────────────────────────── */

  const aplicarEstilo = (e: Estilo) => {
    if (!exigirSelecao()) return;
    setDoc(d => ({
      ...d,
      blocos: d.blocos.map(b => (b.id === selecionado ? { ...b, estilo: e } : b)),
    }));
    fecharMenu();
    setAviso(ehTitulo(e)
      ? `${e} aplicado. A aparência mudou pouco — ela já estava imitando um título. O que mudou é que agora o sumário consegue ler este parágrafo.`
      : `${e} aplicado.`);
  };

  const limparFormatacao = () => {
    /*
      Limpa o documento inteiro, e não só o parágrafo: é o que "Selecionar Tudo
      e limpar" faz, que é o caminho que o passo a passo ensina — e é o gesto
      honesto num documento que chegou inteiro formatado à mão.
    */
    const tinha = doc.blocos.some(b => b.trechos.some(x => x.direta));
    setDoc(d => ({
      ...d,
      blocos: d.blocos.map(b => ({
        ...b,
        trechos: b.trechos.map(({ direta, ...x }) => { void direta; return x; }),
      })),
    }));
    fecharMenu();
    setAviso(tinha
      ? 'Formatação direta removida. O que sobrou é o estilo — e agora mexer no estilo mexe no documento.'
      : 'Não havia formatação direta para tirar.');
  };

  const abrirModificar = (e: Estilo) => {
    setModificando(e);
    setRascunho(doc.estilos?.[e] ?? {});
    fecharMenu();
  };

  const confirmarModificar = () => {
    if (!modificando) return;
    const estilo = modificando;
    setDoc(d => ({ ...d, estilos: { ...d.estilos, [estilo]: rascunho } }));
    setModificando(null);
    const quantos = doc.blocos.filter(b => b.estilo === estilo).length;
    setAviso(`${estilo} redefinido. ${quantos} ${quantos === 1 ? 'parágrafo mudou' : 'parágrafos mudaram'} `
      + 'de uma vez, e você mexeu numa coisa só — é isso que formatar por estilo compra.');
  };

  const gerarSumario = () => {
    const titulos = titulosDoDoc(doc);
    setDoc(d => ({ ...d, sumario: titulos }));
    fecharMenu();
    setAviso(titulos.length
      ? `Sumário gerado com ${titulos.length} ${titulos.length === 1 ? 'entrada' : 'entradas'}.`
      : 'O sumário saiu vazio. Ele procura parágrafos com estilo de título — negrito e tamanho grande '
        + 'não contam, por mais que pareçam.');
  };

  /* Uma gravação por montagem, no `ref`: o `StrictMode` monta duas vezes de
     propósito, e dois registros simultâneos da mesma lição passariam os dois
     pela conferência de "já existe?" do servidor. É a mesma guarda do
     `TokenDaVereda`, pelo mesmo motivo. */
  const concluir = async () => {
    if (!venceu || jaGravou.current) return;
    jaGravou.current = true;
    setGravando(true);
    await aoVencer();
    aoSair();
  };

  /* ── Peças pequenas ──────────────────────────────────────────────────────── */

  const Menu = ({ id, children }: { id: string; children: React.ReactNode }) =>
    (menu === id ? <div className="wd-menu" onClick={ev => ev.stopPropagation()}>{children}</div> : null);

  const ItemMenu = ({ aoClicar, children }: { aoClicar: () => void; children: React.ReactNode }) => (
    <button type="button" className="wd-item" onClick={aoClicar}>{children}</button>
  );

  const acoes = (
    <>
      <button type="button" className="btn-ghost" onClick={() => {
        setDoc(OFICIO_INICIAL);
        setSelecionado(null);
        setAviso('O relatório voltou ao estado em que o examinador o entregou.');
      }}>
        Recomeçar
      </button>
      <button type="button" className="btn-primary" disabled={!venceu || gravando} onClick={concluir}>
        {venceu ? (gravando ? 'Gravando…' : 'Concluir a lição') : `Faltam ${pedidas.length - feitas.size}`}
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
        .wr-galeria { display: flex; gap: 3px; }
        .wr-estilo {
          border: 1px solid #C8C6C4; background: #FFFFFF; border-radius: 2px;
          padding: 2px 8px; height: 40px; min-width: 58px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: #201F1E; white-space: nowrap;
        }
        .wr-estilo:hover { border-color: #2B579A; }
        /* A caixa Modificar Estilo. Superfície clara dentro da moldura escura:
           ela diz a própria cor, pela razão escrita em CSS_DA_MOLDURA. */
        .wr-caixa-fundo {
          position: absolute; inset: 0; background: rgba(0,0,0,.35);
          display: grid; place-items: center; z-index: 30;
        }
        .wr-caixa {
          background: #FFFFFF; color: #201F1E; border: 1px solid #8A8886;
          border-radius: 4px; width: min(420px, 92%); padding: 14px 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,.35); font-size: 12.5px;
        }
        .wr-caixa h4 { color: #201F1E; font-size: 13.5px; margin: 0 0 10px; font-weight: 600; }
        .wr-linha { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .wr-linha label { flex: none; width: 74px; color: #201F1E; }
        .wr-campo {
          border: 1px solid #8A8886; background: #FFFFFF; color: #201F1E;
          padding: 3px 6px; font-size: 12.5px; border-radius: 2px;
        }
        .wr-previa {
          border: 1px solid #D1D1D1; padding: 10px; margin: 10px 0;
          background: #FAF9F8; min-height: 44px; display: flex; align-items: center;
        }
        .wr-acoes { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
        @media (max-width: 1023px) {
          .wr-caixa-fundo { place-items: start center; padding-top: 8px; }
        }
      `}</style>

      <div className="wd-janela">
        <BarraDeTituloDoWord documento="Relatório de Atividades" aoAvisar={naoFazParte} />

        <GuiasDoWord
          atual={guia} usaveis={GUIAS_USAVEIS}
          aoTrocar={id => { setGuia(id); fecharMenu(); }}
          aoAvisar={naoFazParte} />

        {guia === 'Início' && (
          <div className="wd-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
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
              {/*
                O botão que o requisito 6 pede. Ele fica no grupo Fonte, que é
                onde o Word o põe — e não num lugar inventado pela lição, que
                ensinaria a procurá-lo onde ele não está.
              */}
              <BotaoDaFaixa dica="Limpar Toda a Formatação" aoClicar={limparFormatacao}>
                <Eraser className="w-3.5 h-3.5" />
              </BotaoDaFaixa>
            </GrupoDaFaixa>

            <GrupoDaFaixa nome="Parágrafo">
              <EnfeiteDaFaixa dica="Alinhar à Esquerda (Ctrl+Q)" aoAvisar={naoFazParte}><AlignLeft className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
              <EnfeiteDaFaixa dica="Mostrar Tudo (Ctrl+*)" aoAvisar={naoFazParte}><Pilcrow className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
            </GrupoDaFaixa>

            {/*
              A galeria. O clique aplica; o botão direito abre Modificar, que é
              onde a definição do estilo mora — e é a diferença entre "este
              parágrafo fica assim" e "todo parágrafo deste estilo fica assim".
            */}
            <GrupoDaFaixa nome="Estilos">
              <div className="wr-galeria">
                {NA_GALERIA.map(e => (
                  <div key={e} style={{ position: 'relative' }}>
                    <button
                      type="button" className="wr-estilo"
                      title={`${e} — clique para aplicar, botão direito para modificar`}
                      aria-pressed={alvo?.estilo === e}
                      style={{
                        borderColor: alvo?.estilo === e ? '#2B579A' : '#C8C6C4',
                        ...aparenciaDe(doc, e),
                        marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
                        fontSize: Math.min(13, Number(aparenciaDe(doc, e).fontSize ?? 11)),
                      }}
                      onClick={() => aplicarEstilo(e)}
                      onContextMenu={ev => { ev.preventDefault(); abrir(`estilo-${e}`); }}
                    >
                      {e}
                    </button>
                    <Menu id={`estilo-${e}`}>
                      <ItemMenu aoClicar={() => abrirModificar(e)}>Modificar…</ItemMenu>
                      <ItemMenu aoClicar={() => { naoFazParte('Atualizar para Corresponder à Seleção'); fecharMenu(); }}>
                        Atualizar para Corresponder à Seleção
                      </ItemMenu>
                    </Menu>
                  </div>
                ))}
              </div>
            </GrupoDaFaixa>

            <GrupoDaFaixa nome="Editando">
              <EnfeiteDaFaixa dica="Localizar (Ctrl+L)" aoAvisar={naoFazParte}><Sparkles className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
            </GrupoDaFaixa>
          </div>
        )}

        {guia === 'Referências' && (
          <div className="wd-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
            <GrupoDaFaixa nome="Sumário">
              <div style={{ position: 'relative' }}>
                <BotaoDaFaixa dica="Sumário" rotulo="Sumário" empilhado aoClicar={() => abrir('sumario')}>
                  <ListTree className="w-5 h-5" />
                </BotaoDaFaixa>
                <Menu id="sumario">
                  <ItemMenu aoClicar={gerarSumario}>Sumário Automático 1</ItemMenu>
                  <ItemMenu aoClicar={gerarSumario}>Atualizar Sumário</ItemMenu>
                </Menu>
              </div>
            </GrupoDaFaixa>
            <GrupoDaFaixa nome="Notas de Rodapé">
              <EnfeiteDaFaixa dica="Inserir Nota de Rodapé (Alt+Ctrl+F)" rotulo="Nota de Rodapé" empilhado aoAvisar={naoFazParte}>
                <StickyNote className="w-5 h-5" />
              </EnfeiteDaFaixa>
              <EnfeiteDaFaixa dica="Inserir Nota de Fim" aoAvisar={naoFazParte}><Quote className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
            </GrupoDaFaixa>
            <GrupoDaFaixa nome="Índice">
              <EnfeiteDaFaixa dica="Marcar Entrada" aoAvisar={naoFazParte}><BookMarked className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
            </GrupoDaFaixa>
          </div>
        )}

        <ReguaDoWord larguraCm={21} margemCm={2.5} />

        <FolhaDoWord
          doc={doc}
          selecionado={selecionado}
          aoEscolher={id => { setSelecionado(id); setAviso(''); fecharMenu(); }}
          aoClicarNoVazio={() => { setSelecionado(null); fecharMenu(); }}
        />

        <div className="wd-status">
          <span>{doc.blocos.length} parágrafos</span>
          <span>{alvo ? `${alvo.estilo} — ${textoDoBloco(alvo).slice(0, 28)}…` : 'Nenhum parágrafo selecionado'}</span>
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} />
        </div>
      </div>

      {/* ── A caixa Modificar Estilo ── */}
      {modificando && (
        <div className="wr-caixa-fundo" onClick={() => setModificando(null)}>
          <div className="wr-caixa" onClick={ev => ev.stopPropagation()} role="dialog"
            aria-label={`Modificar Estilo — ${modificando}`}>
            <h4>Modificar Estilo</h4>
            <p style={{ color: '#605E5C', marginBottom: 10 }}>
              Nome: <strong>{modificando}</strong> — a mudança vale para todo parágrafo
              que usa este estilo neste documento.
            </p>

            <div className="wr-linha">
              <label htmlFor="wr-tamanho">Tamanho</label>
              <select
                id="wr-tamanho" className="wr-campo"
                value={String(rascunho.tamanho ?? aparenciaDe(doc, modificando).fontSize ?? 11)}
                onChange={ev => setRascunho(r => ({ ...r, tamanho: Number(ev.target.value) }))}
              >
                {TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="wr-linha">
              <label htmlFor="wr-cor">Cor</label>
              <select
                id="wr-cor" className="wr-campo"
                value={String(rascunho.cor ?? aparenciaDe(doc, modificando).color ?? '#201F1E')}
                onChange={ev => setRascunho(r => ({ ...r, cor: ev.target.value }))}
              >
                {CORES.map(c => <option key={c.valor} value={c.valor}>{c.nome}</option>)}
              </select>
            </div>

            <div className="wr-linha">
              <label htmlFor="wr-negrito">Negrito</label>
              <input
                id="wr-negrito" type="checkbox"
                checked={rascunho.negrito ?? Number(aparenciaDe(doc, modificando).fontWeight ?? 400) >= 600}
                onChange={ev => setRascunho(r => ({ ...r, negrito: ev.target.checked }))}
              />
            </div>

            <div className="wr-previa">
              <span style={{
                ...aparenciaDe(doc, modificando),
                ...(rascunho.tamanho !== undefined ? { fontSize: rascunho.tamanho } : {}),
                ...(rascunho.cor !== undefined ? { color: rascunho.cor } : {}),
                ...(rascunho.negrito !== undefined ? { fontWeight: rascunho.negrito ? 700 : 400 } : {}),
                marginTop: 0, marginBottom: 0,
              }}>
                Como este estilo vai ficar
              </span>
            </div>

            <div className="wr-acoes">
              <button type="button" className="wd-bt" style={{ border: '1px solid #C8C6C4' }}
                onClick={() => setModificando(null)}>
                Cancelar
              </button>
              <button type="button" className="wd-bt" style={{ border: '1px solid #2B579A', background: '#2B579A', color: '#FFF' }}
                onClick={confirmarModificar}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </LaboratorioEmTelaCheia>
  );
}
