import { useMemo, useRef, useState } from 'react';
import {
  GitCompareArrows, Check, X, MessageSquarePlus, ChevronRight, Replace, Undo2, Redo2,
  Bold, Italic, Underline, AlignLeft, Clipboard, Scissors, Copy,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_WORD, CSS_FOLHA, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa,
  BotaoDaFaixa, EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord, FolhaDoWord,
  BalaoDeComentario, DialogoDeSubstituir,
} from '../labs/word';
import {
  DIA_DO_DESBRAVADOR_INICIAL, METAS_DA_REVISAO, trechosDoParagrafo, type Doc,
} from '../labs/diaDoDesbravador';
import {
  aceitarRevisao, rejeitarRevisao, aceitarTodasAsRevisoes, rejeitarTodasAsRevisoes,
  revisoesPendentes, substituirTudo, ocorrencias, comentariosDoDoc,
  acrescentarComentario, responderComentario, resolverComentario, removerComentario,
  paragrafos, NOME_DO_AUTOR, type OpcoesDeBusca,
} from '../labs/documento';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/*
  O laboratório de Word da CC-ES002, módulo 5 — requisito 5.

  ── O que muda em relação aos quatro anteriores ──────────────────────────
  Ali o documento chega errado e quem conserta é quem abre. Aqui ele chega
  **já mexido por outra pessoa**, e o exercício é a conversa: aceitar, rejeitar,
  responder, perguntar e trocar. É o único dos seis em que o documento tem duas
  autorias, e é por isso que `Autor` existe no modelo.

  ── Os dois botões grossos existem, e os dois falham ─────────────────────
  Aceitar Todas e Rejeitar Todas estão na faixa porque um programa tem todos os
  comandos — tirá-los ensinaria a procurar o botão que a tarefa quer. Com uma
  marca certa e uma errada, nenhum dos dois fecha a tarefa, e é isso que põe o
  desbravador a percorrer marca a marca.

  ── Desfazer é peça desta lição, e não enfeite ───────────────────────────
  A teoria diz, com todas as letras, que o Ctrl+Z desfaz um Substituir Tudo
  inteiro e é a primeira coisa a apertar quando o documento fica estranho. Um
  laboratório sem Desfazer mostraria uma referência que diverge do que ele
  próprio faz — que é pior do que referência nenhuma. A pilha guarda o
  documento inteiro a cada comando, que é barato e não tem como divergir do que
  está na tela.
*/

interface Props {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'word' }>;
  aoVencer: () => void | Promise<void>;
  aoSair: () => void;
}

const GUIAS_USAVEIS = ['Início', 'Revisão'];

const SEM_OPCOES: OpcoesDeBusca = { diferenciarMaiusculas: false, palavrasInteiras: false };

export default function LaboratorioDaRevisao({ vereda, licao, aoVencer, aoSair }: Props) {
  const [doc, setDoc] = useState<Doc>(DIA_DO_DESBRAVADOR_INICIAL);
  const [passado, setPassado] = useState<Doc[]>([]);
  const [futuro, setFuturo] = useState<Doc[]>([]);
  const [guia, setGuia] = useState('Revisão');
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [trecho, setTrecho] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [zoom, setZoom] = useState(1);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [procurar, setProcurar] = useState('');
  const [por, setPor] = useState('');
  const [opcoes, setOpcoes] = useState<OpcoesDeBusca>(SEM_OPCOES);
  const [rascunhos, setRascunhos] = useState<Record<string, string>>({});
  const jaGravou = useRef(false);

  /* Todo comando passa por aqui: é o que faz o Desfazer existir sem que cada
     um deles precise lembrar de empilhar. */
  const mexer = (f: (d: Doc) => Doc) => {
    setDoc((d) => {
      const novo = f(d);
      if (novo === d) return d;
      setPassado(p => [...p, d]);
      setFuturo([]);
      return novo;
    });
  };

  const desfazer = () => {
    setPassado((p) => {
      if (p.length === 0) { setAviso('Não há mais nada para desfazer.'); return p; }
      const anterior = p[p.length - 1];
      setFuturo(f => [doc, ...f]);
      setDoc(anterior);
      return p.slice(0, -1);
    });
  };

  const refazer = () => {
    setFuturo((f) => {
      if (f.length === 0) { setAviso('Não há nada para refazer.'); return f; }
      setPassado(p => [...p, doc]);
      setDoc(f[0]);
      return f.slice(1);
    });
  };

  const feitas = useMemo(
    () => new Set(METAS_DA_REVISAO.filter(m => m.feita(doc)).map(m => m.id)),
    [doc],
  );
  const pedidas = METAS_DA_REVISAO.filter(m => licao.verificacoes.includes(m.id));
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

  /* ── Controle de alterações ──────────────────────────────────────────────── */

  const alternarControle = () => {
    mexer(d => ({ ...d, controlarAlteracoes: !d.controlarAlteracoes }));
    setAviso(doc.controlarAlteracoes
      ? 'Controle desligado. As marcas que já existem continuam lá — desligar não apaga nada; o que muda é que o que você fizer daqui em diante não aparece mais marcado.'
      : 'Controle ligado. O que você mudar daqui em diante aparece marcado e assinado com o seu nome.');
  };

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
    + 'ou use Próxima para andar de uma em outra.');

  const aceitar = () => {
    if (!marcaEscolhida) { semMarca(); return; }
    mexer(d => aceitarRevisao(d, marcaEscolhida));
    setTrecho(null);
    setAviso('Marca aceita.');
  };

  const rejeitar = () => {
    if (!marcaEscolhida) { semMarca(); return; }
    mexer(d => rejeitarRevisao(d, marcaEscolhida));
    setTrecho(null);
    setAviso('Marca rejeitada: o texto voltou ao que era.');
  };

  /* ── Comentários ─────────────────────────────────────────────────────────── */

  const comentarios = comentariosDoDoc(doc);
  const comentados = useMemo(() => new Set(comentarios.map(c => c.trecho)), [comentarios]);

  const novoComentario = () => {
    if (!selecionado) {
      setAviso('Selecione primeiro o parágrafo que você quer comentar, clicando nele.');
      return;
    }
    const alvo = trecho && trechosDoParagrafo(doc, selecionado).includes(trecho)
      ? trecho
      : trechosDoParagrafo(doc, selecionado)[0];
    if (!alvo) { setAviso('Este bloco não tem texto para comentar.'); return; }
    const id = `meu-${comentarios.length + 1}`;
    mexer(d => acrescentarComentario(d, {
      id, trecho: alvo, autor: 'voce', texto: '', respostas: [], resolvido: false,
    }));
    setRascunhos(r => ({ ...r, [id]: '' }));
    setAviso('Comentário aberto na margem. Escreva nele e clique em Comentar.');
  };

  /* O comentário próprio nasce **vazio** e só vira comentário quando alguém
     escreve: um que nascesse com texto seria a tarefa chegando pronta. */
  const escreverComentario = (id: string, valor: string) =>
    setRascunhos(r => ({ ...r, [id]: valor }));

  const enviar = (id: string) => {
    const texto = (rascunhos[id] ?? '').trim();
    if (texto === '') { setAviso('Escreva alguma coisa antes de enviar.'); return; }
    const alvo = comentarios.find(c => c.id === id);
    if (!alvo) return;
    if (alvo.autor === 'voce' && alvo.texto === '') {
      mexer(d => ({
        ...d,
        comentarios: comentariosDoDoc(d).map(c => (c.id === id ? { ...c, texto } : c)),
      }));
    } else {
      mexer(d => responderComentario(d, id, {
        id: `r-${id}-${alvo.respostas.length + 1}`, autor: 'voce', texto,
      }));
    }
    setRascunhos(r => ({ ...r, [id]: '' }));
    setAviso('');
  };

  const resolver = (id: string) => {
    mexer(d => resolverComentario(d, id));
    setAviso('Comentário resolvido. Ele some de quem só lê e continua aqui para quem procurar.');
  };

  /* ── Localizar e Substituir ──────────────────────────────────────────────── */

  const achados = procurar === '' ? 0 : ocorrencias(doc, procurar, opcoes);

  const substituir = () => {
    if (procurar === '') { setAviso('Escreva o que procurar.'); return; }
    let trocas = 0;
    mexer((d) => {
      const r = substituirTudo(d, procurar, por, opcoes);
      trocas = r.trocas;
      return r.doc;
    });
    setAviso(trocas === 0
      ? `Nenhuma ocorrência de "${procurar}" foi encontrada.`
      : `${trocas} ${trocas === 1 ? 'troca feita' : 'trocas feitas'}. `
        + 'Leia o documento antes de seguir — Ctrl+Z desfaz tudo de uma vez.');
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
        setDoc(DIA_DO_DESBRAVADOR_INICIAL);
        setPassado([]); setFuturo([]);
        setSelecionado(null); setTrecho(null); setRascunhos({});
        setBuscaAberta(false); setProcurar(''); setPor(''); setOpcoes(SEM_OPCOES);
        setAviso('');
      }}>
        Recomeçar
      </button>
      <button type="button" className="btn-primary" disabled={!venceu} onClick={concluir}>
        {venceu ? 'Concluir a lição' : `Faltam ${pedidas.length - feitas.size}`}
      </button>
    </>
  );

  const margem = (
    <>
      {comentarios.map(c => (
        <BalaoDeComentario
          key={c.id}
          comentario={c.texto === '' && c.autor === 'voce'
            ? { ...c, texto: '(escreva o seu comentário abaixo)' } : c}
          rascunho={rascunhos[c.id] ?? ''}
          aoEscrever={v => escreverComentario(c.id, v)}
          aoResponder={() => enviar(c.id)}
          aoResolver={() => resolver(c.id)}
          aoExcluir={c.autor === 'voce'
            ? () => { mexer(d => removerComentario(d, c.id)); setAviso(''); }
            : undefined}
        />
      ))}
      {comentarios.length === 0 && (
        <div style={{ fontSize: 11, color: '#605E5C' }}>Sem comentários.</div>
      )}
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
        <BarraDeTituloDoWord documento="Dia do Desbravador — relato" aoAvisar={naoFazParte} />

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
              {/* Substituir mora em Início › Edição, que é onde o Word o põe —
                  e não numa guia inventada por ser o assunto da lição. */}
              <GrupoDaFaixa nome="Edição">
                <BotaoDaFaixa dica="Substituir (Ctrl+H)" rotulo="Substituir" empilhado
                  ativo={buscaAberta} aoClicar={() => setBuscaAberta(v => !v)}>
                  <Replace className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
            </>
          )}

          {guia === 'Revisão' && (
            <>
              <GrupoDaFaixa nome="Comentários">
                <BotaoDaFaixa dica="Novo Comentário" rotulo="Novo Comentário" empilhado
                  aoClicar={novoComentario}>
                  <MessageSquarePlus className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Controle">
                <BotaoDaFaixa dica="Controlar Alterações" rotulo="Controlar Alterações" empilhado
                  ativo={doc.controlarAlteracoes === true} aoClicar={alternarControle}>
                  <GitCompareArrows className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
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
                {/*
                  Os dois botões grossos existem porque um programa tem todos os
                  comandos. Com uma marca certa e uma errada no documento,
                  nenhum dos dois fecha a tarefa — e é isso que põe o
                  desbravador a percorrer marca a marca, que é o que o recurso
                  existe para ensinar.
                */}
                <BotaoDaFaixa dica="Aceitar Todas as Alterações" rotulo="Aceitar Todas" empilhado
                  aoClicar={() => {
                    mexer(aceitarTodasAsRevisoes);
                    setTrecho(null);
                    setAviso('Todas as marcas foram aceitas. Releia o documento: aceitar tudo aceita também o que estava errado.');
                  }}>
                  <Check className="w-5 h-5" />
                </BotaoDaFaixa>
                <BotaoDaFaixa dica="Rejeitar Todas as Alterações" rotulo="Rejeitar Todas" empilhado
                  aoClicar={() => {
                    mexer(rejeitarTodasAsRevisoes);
                    setTrecho(null);
                    setAviso('Todas as marcas foram rejeitadas, inclusive as que estavam certas.');
                  }}>
                  <X className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Desfazer">
                <BotaoDaFaixa dica="Desfazer (Ctrl+Z)" rotulo="Desfazer" empilhado
                  ativo={passado.length > 0} aoClicar={desfazer}>
                  <Undo2 className="w-5 h-5" />
                </BotaoDaFaixa>
                <BotaoDaFaixa dica="Refazer (Ctrl+Y)" rotulo="Refazer" empilhado
                  ativo={futuro.length > 0} aoClicar={refazer}>
                  <Redo2 className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
            </>
          )}
        </div>

        <ReguaDoWord larguraCm={21} margemCm={2.5} />

        {buscaAberta && (
          <DialogoDeSubstituir
            procurar={procurar} por={por} opcoes={opcoes} achados={achados}
            aoMudarProcurar={setProcurar} aoMudarPor={setPor} aoMudarOpcoes={setOpcoes}
            aoSubstituirTudo={substituir} aoFechar={() => setBuscaAberta(false)}
          />
        )}

        <FolhaDoWord
          doc={doc}
          selecionado={selecionado}
          comentado={comentados}
          aoEscolher={(id) => { setSelecionado(id); setAviso(''); }}
          aoEscolherTrecho={(id) => {
            setTrecho(id);
            const bloco = paragrafos(doc).find(b => b.trechos.some(x => x.id === id));
            if (bloco) setSelecionado(bloco.id);
            setAviso('');
          }}
          aoClicarNoVazio={() => { setSelecionado(null); setTrecho(null); }}
          margem={margem}
        />

        <div className="wd-status">
          <span>
            {doc.controlarAlteracoes ? 'Alterações controladas' : 'Controle desligado'}
          </span>
          <span>
            {pendentes.length === 0
              ? 'Sem marcas pendentes'
              : `${pendentes.length} ${pendentes.length === 1 ? 'marca' : 'marcas'} pendentes`}
          </span>
          <span data-comentarios={comentarios.filter(c => !c.resolvido).length}>
            {comentarios.filter(c => !c.resolvido).length} por resolver
          </span>
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} />
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
