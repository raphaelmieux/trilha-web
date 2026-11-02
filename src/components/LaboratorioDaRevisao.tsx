import { useMemo, useRef, useState } from 'react';
import {
  GitCompareArrows, Check, X, MessageSquarePlus, ChevronRight, Replace, Undo2, Redo2,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { GrupoDeFonte, CSS_FONTE_DO_WORD, GrupoDeParagrafo, GrupoAreaDeTransferencia } from '../labs/fonteDoWord';
import { useEdicaoDoWord } from '../labs/useEdicaoDoWord';
import { isolarSelecao, palavraEmVolta, recolhida, selecaoDoTrecho, tamanhoDoParagrafo, trechosEmVolta } from '../labs/edicao';
import {
  CSS_WORD, CSS_FOLHA, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa, BotaoDaFaixa, ReguaDoWord,
  ZoomDoWord, FolhaDoWord, BalaoDeComentario, DialogoDeSubstituir,
} from '../labs/word';
import {
  DIA_DO_DESBRAVADOR_INICIAL, METAS_DA_REVISAO, type Doc,
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
  /**
   * O documento de partida e o nome dele, quando não são os do exercício. Só a
   * página de bastidor passa isto, para fotografar um gesto num documento que
   * não é o da lição — veja `src/components/bastidor.ts`.
   */
  inicial?: import('../labs/documento').Doc<string>;
  arquivo?: string;
}

const GUIAS_USAVEIS = ['Início', 'Revisão'];

const SEM_OPCOES: OpcoesDeBusca = { diferenciarMaiusculas: false, palavrasInteiras: false };

export default function LaboratorioDaRevisao({ vereda, licao, aoVencer, aoSair, inicial, arquivo }: Props) {
  const [doc, setDoc] = useState<Doc>((inicial as Doc | undefined) ?? DIA_DO_DESBRAVADOR_INICIAL);
  const [guia, setGuia] = useState('Revisão');
  const [aviso, setAviso] = useState('');
  const [zoom, setZoom] = useState(1);
  const [marcas, setMarcas] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [procurar, setProcurar] = useState('');
  const [por, setPor] = useState('');
  const [opcoes, setOpcoes] = useState<OpcoesDeBusca>(SEM_OPCOES);
  const [rascunhos, setRascunhos] = useState<Record<string, string>>({});
  const jaGravou = useRef(false);
  /* O controle de alterações é do documento: com ele ligado, o que se digita
     sai marcado com o seu nome, sem nada mais a fazer. O Desfazer é o mesmo
     para tecla e para botão — no Word ele não distingue os dois. */
  const edicao = useEdicaoDoWord(doc, setDoc, { quem: { autor: 'voce' } });
  const mexer = (f: (d: Doc) => Doc) => edicao.mudar(d => f(d));
  const desfazer = () => {
    if (!edicao.podeDesfazer) { setAviso('Não há mais nada para desfazer.'); return; }
    edicao.desfazer();
  };
  const refazer = () => {
    if (!edicao.podeRefazer) { setAviso('Não há nada para refazer.'); return; }
    edicao.refazer();
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


  /* ── Controle de alterações ──────────────────────────────────────────────── */

  const alternarControle = () => {
    mexer(d => ({ ...d, controlarAlteracoes: !d.controlarAlteracoes }));
    setAviso(doc.controlarAlteracoes
      ? 'Controle desligado. As marcas que já existem continuam lá — desligar não apaga nada; o que muda é que o que você fizer daqui em diante não aparece mais marcado.'
      : 'Controle ligado. O que você mudar daqui em diante aparece marcado e assinado com o seu nome.');
  };

  const pendentes = revisoesPendentes(doc);

  /* A marca escolhida é a que está debaixo do cursor — no Word é o cursor
     dentro da marca que diz qual Aceitar aceita. */
  const emVolta = edicao.selecao ? trechosEmVolta(doc, edicao.selecao.foco) : null;
  const debaixoDoCursor = (emVolta?.depois?.revisao ? emVolta.depois.id : null)
    ?? (emVolta?.antes?.revisao ? emVolta.antes.id : null);
  const marcaEscolhida = debaixoDoCursor && pendentes.some(r => r.trecho.id === debaixoDoCursor) ? debaixoDoCursor : null;

  const proximaMarca = () => {
    if (pendentes.length === 0) { setAviso('Não há mais marcas para resolver.'); return; }
    const atual = pendentes.findIndex(r => r.trecho.id === debaixoDoCursor);
    const proxima = pendentes[(atual + 1) % pendentes.length];
    edicao.folha.aoSelecionar(selecaoDoTrecho(doc, proxima.trecho.id));
    edicao.focar();
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
    setAviso('Marca aceita.');
  };

  const rejeitar = () => {
    if (!marcaEscolhida) { semMarca(); return; }
    mexer(d => rejeitarRevisao(d, marcaEscolhida));
    setAviso('Marca rejeitada: o texto voltou ao que era.');
  };

  /* ── Comentários ─────────────────────────────────────────────────────────── */

  const comentarios = comentariosDoDoc(doc);
  const comentados = useMemo(() => new Set(comentarios.map(c => c.trecho)), [comentarios]);

  /**
   * Novo Comentário vale para o que está selecionado, como no Word. Com o
   * cursor parado, vale para a palavra em que ele está; num espaço, para o
   * parágrafo inteiro.
   */
  const novoComentario = () => {
    const s = edicao.selecao;
    if (!s) {
      setAviso('Selecione primeiro o texto que você quer comentar.');
      return;
    }
    const p = paragrafos(doc).find(b => b.id === s.foco.bloco);
    const alcance = !recolhida(s) ? s
      : palavraEmVolta(doc, s.foco)
        ?? (p ? { ancora: { bloco: p.id, offset: 0 }, foco: { bloco: p.id, offset: tamanhoDoParagrafo(p) } } : null);
    if (!alcance || recolhida(alcance)) { setAviso('Este parágrafo não tem texto para comentar.'); return; }
    const isolado = isolarSelecao(doc, alcance);
    if (!isolado.trecho) { setAviso('Este parágrafo não tem texto para comentar.'); return; }
    const alvo = isolado.trecho;
    const id = `meu-${comentarios.length + 1}`;
    edicao.mudar(() => acrescentarComentario(isolado.doc, {
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
        edicao.reiniciar(DIA_DO_DESBRAVADOR_INICIAL);
        setRascunhos({});
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
      <style>{CSS_FONTE_DO_WORD}</style>

      <div className="wd-janela" style={{
        '--largura-cm': 21, '--altura-cm': 29.7, '--margem-cm': 2.5, '--zoom': zoom,
      } as React.CSSProperties}>
        <BarraDeTituloDoWord documento={arquivo ?? 'Dia do Desbravador — relato'} aoAvisar={setAviso}
          aoDesfazer={edicao.podeDesfazer ? edicao.desfazer : undefined}
          aoRefazer={edicao.podeRefazer ? edicao.refazer : undefined} />

        <GuiasDoWord
          atual={guia} usaveis={GUIAS_USAVEIS}
          aoTrocar={setGuia} aoAvisar={setAviso} />

        <div className="wd-faixa" style={{ overflowX: 'auto' }}>
          {guia === 'Início' && (
            <>
              <GrupoAreaDeTransferencia edicao={edicao} aoAvisar={setAviso} />
              <GrupoDeFonte edicao={edicao} aoAvisar={setAviso} />
              <GrupoDeParagrafo edicao={edicao} aoAvisar={setAviso}
                marcas={{ ligadas: marcas, alternar: () => { setMarcas(m => !m); edicao.focar(); } }} />
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
                    setAviso('Todas as marcas foram aceitas. Releia o documento: aceitar tudo aceita também o que estava errado.');
                  }}>
                  <Check className="w-5 h-5" />
                </BotaoDaFaixa>
                <BotaoDaFaixa dica="Rejeitar Todas as Alterações" rotulo="Rejeitar Todas" empilhado
                  aoClicar={() => {
                    mexer(rejeitarTodasAsRevisoes);
                    setAviso('Todas as marcas foram rejeitadas, inclusive as que estavam certas.');
                  }}>
                  <X className="w-5 h-5" />
                </BotaoDaFaixa>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Desfazer">
                <BotaoDaFaixa dica="Desfazer (Ctrl+Z)" rotulo="Desfazer" empilhado
                  ativo={edicao.podeDesfazer} aoClicar={desfazer}>
                  <Undo2 className="w-5 h-5" />
                </BotaoDaFaixa>
                <BotaoDaFaixa dica="Refazer (Ctrl+Y)" rotulo="Refazer" empilhado
                  ativo={edicao.podeRefazer} aoClicar={refazer}>
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
          marcas={marcas}
          edicao={edicao.folha}
          comentado={comentados}
          aoEscolher={() => setAviso('')}
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
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} aoAvisar={setAviso} />
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
