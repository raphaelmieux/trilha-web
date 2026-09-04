import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Play, RotateCcw, Square } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_IDE, CabecalhoDaIde, EditorDeCodigo, StatusDaIde } from '../labs/ide';
import { contarLinhas } from '../labs/realce';
import { PASSOS_DE_PYTHON } from '../labs/passosDePython';
import { Python, type ResultadoDeExecucao } from '../labs/pythonRuntime';
import { validarPython, IDS_DA_EXECUCAO, type CheckResult } from '../lib/pythonValidator';
import {
  CATEGORIAS, ORDEM_DAS_CATEGORIAS, classificacaoInicial, conferirClassificacao,
  type CategoriaDeFalha, type Classificacao,
} from '../labs/falhasDePython';
import { roteiroDePython, funcoesQueNaoRodam } from '../labs/roteiroDePython';
import type { NoDoEsboco } from '../labs/pythonAnalise';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/**
 * O laboratório de Python.
 *
 * ── Por que ele não é o laboratório de HTML com outro validador ──────────
 * Em HTML e em CSS a verificação é síncrona: o texto muda, o validador roda, a
 * lista de tarefas se repinta na mesma tecla. Python não é assim. Saber se um
 * programa roda exige rodá-lo, e rodar leva tempo, acontece noutra thread e
 * pode não terminar.
 *
 * Daí a diferença que a tela precisa carregar: **a lista mostra a última
 * execução, e não o texto de agora**. Quando o código muda depois de rodar, os
 * resultados envelhecem — e dizer isso é obrigação, porque uma lista verde ao
 * lado de um código que ninguém rodou é a mentira mais fácil de contar aqui.
 *
 * ── A entrada vem antes ──────────────────────────────────────────────────
 * `input()` é síncrono, e o worker não consegue esperar digitação na página. As
 * linhas são decididas antes, no campo ao lado — que é como se testa um
 * programa de verdade, e como todo juiz de código online funciona.
 */
export default function LaboratorioDePython({ vereda, licao, userId, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'laboratorio' }>;
  userId: string;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const chave = `${vereda.code}-${licao.id}`;

  const [codigo, setCodigo] = useState(() => {
    const g = lerRascunho<string>(userId, chave);
    return typeof g?.conteudo === 'string' ? g.conteudo : licao.modelo;
  });
  const [voltou] = useState(() => {
    const g = lerRascunho<string>(userId, chave);
    return typeof g?.conteudo === 'string' && g.conteudo !== licao.modelo;
  });
  const [entrada, setEntrada] = useState((licao.entradaPadrao ?? []).join('\n'));
  const falhas = useMemo(() => licao.falhas ?? [], [licao.falhas]);
  /* Numa chave própria: o rascunho do código é uma string, e é a mesma forma
     nos outros laboratórios de Python. Misturar as duas coisas numa só
     mudaria o que já está gravado no navegador de quem está no meio de um. */
  const chaveDasFalhas = `${chave}-falhas`;
  const [classificacao, setClassificacao] = useState<Classificacao>(() => {
    const g = lerRascunho<Classificacao>(userId, chaveDasFalhas);
    return g?.conteudo && typeof g.conteudo === 'object'
      ? { ...classificacaoInicial(licao.falhas ?? []), ...g.conteudo }
      : classificacaoInicial(licao.falhas ?? []);
  });
  const [execucao, setExecucao] = useState<ResultadoDeExecucao | null>(null);
  const [achados, setAchados] = useState<Record<string, boolean>>({});
  /* A estrutura da última análise, para o roteiro da apresentação. Ela vem
     junto dos achados — as duas leem a mesma árvore. */
  const [esboco, setEsboco] = useState<NoDoEsboco[]>([]);
  const [chamadas, setChamadas] = useState<string[]>([]);
  const [erroDeAnalise, setErroDeAnalise] = useState<string | null>(null);
  /* O texto que gerou os resultados de agora. Diferente do atual, a lista está
     velha — e a tela diz isso em vez de mostrar verde por um código que
     ninguém rodou. */
  const [codigoRodado, setCodigoRodado] = useState<string | null>(null);
  const [rodando, setRodando] = useState(false);
  const [entregue, setEntregue] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(voltou ? 'Seu código voltou como você deixou.' : '');

  useRascunhoLocal(userId, chave, codigo, !entregue);
  useRascunhoLocal(userId, chaveDasFalhas, classificacao, !entregue && falhas.length > 0);

  /* Um Python por laboratório, e ele morre junto com a tela: o worker segura
     13 MB de Pyodide, e deixá-lo vivo depois de sair seria guardar isso por
     nada. */
  const python = useRef<Python | null>(null);
  if (!python.current) python.current = new Python();
  useEffect(() => {
    const p = python.current;
    return () => p?.encerrar();
  }, []);

  const executar = useCallback(async () => {
    const py = python.current;
    if (!py || rodando) return;
    setRodando(true);
    setAviso('');
    const fonte = codigo;
    const linhas = entrada.split('\n').filter((l, i, todas) => l !== '' || i < todas.length - 1);

    /* A análise primeiro: código que não compila não tem árvore, e é o erro de
       sintaxe que a pessoa precisa ler antes de qualquer outra coisa. */
    const analise = await py.analisar(fonte);
    setAchados(analise.achados);
    setErroDeAnalise(analise.erro);
    setEsboco(analise.esboco);
    setChamadas(analise.chamadas);

    const r = analise.erro
      /* Sem árvore não há o que rodar: o Python recusaria com o mesmo erro, e
         mostrá-lo duas vezes só faria a pessoa acreditar que são dois. */
      ? { saida: '', erro: analise.erro, semFim: false }
      : await py.rodar(fonte, linhas);

    setExecucao(r);
    setCodigoRodado(fonte);
    setRodando(false);
  }, [codigo, entrada, rodando]);

  const parar = () => { python.current?.encerrar(); setRodando(false); };

  const velha = codigoRodado !== null && codigoRodado !== codigo;

  const resultados: CheckResult[] = useMemo(
    () => validarPython({
      codigo, achados, erroDeAnalise, execucao,
      saidaEsperada: licao.saidaEsperada,
      falhas, classificacao,
    }, licao.verificacoes),
    [codigo, achados, erroDeAnalise, execucao, licao.saidaEsperada, licao.verificacoes,
      falhas, classificacao]);

  const passaram = resultados.filter(r => r.passed).length;
  /* Entregar exige que os resultados sejam do código que está na tela. Sem
     isso, bastaria acertar, mexer numa linha e entregar o que não rodou. */
  const podeEntregar = passaram === resultados.length && !velha && !rodando;

  const entregar = async () => {
    setSalvando(true);
    await aoVencer();
    descartarRascunho(userId, chave);
    descartarRascunho(userId, chaveDasFalhas);
    setSalvando(false);
    setEntregue(true);
  };

  if (entregue) {
    /*
      O roteiro da apresentação sai daqui, e só no laboratório do programa livre.

      O requisito 7 pede o programa **e** apresentá-lo explicando o que cada
      parte faz. A plataforma não tem como conferir a apresentação; o que ela
      pode fazer é preparar — ler a estrutura do programa e dizer, em português,
      o que cada pedaço faz, para a pessoa treinar com o próprio programa na
      frente.

      Reconhecido pela verificação, e não pelo id da lição: id se renomeia sem
      que ninguém repare, e aí o roteiro sumiria em silêncio justamente do único
      lugar onde ele serve. Nos laboratórios de treino não há o que apresentar —
      um roteiro de quatro linhas no módulo 2 ensinaria a tratá-lo como enfeite
      de fim de tela.
    */
    const ehOPrograma = licao.verificacoes.includes('quarentaLinhas');
    const roteiro = ehOPrograma ? roteiroDePython(esboco, chamadas) : [];
    const mudas = ehOPrograma ? funcoesQueNaoRodam(esboco, chamadas) : 0;

    return (
      <div className="card p-8">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
          <h1 className="text-2xl font-bold mb-2">{licao.titulo} — vencido!</h1>
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {resultados.length === 1
              ? 'Seu programa passou na verificação.'
              : `Seu programa passou nas ${resultados.length} verificações.`}
          </p>
        </div>

        {roteiro.length > 0 && (
          <div className="mt-6 text-left">
            <h2 className="text-lg font-bold mb-1">Para apresentar ao examinador</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              O requisito 7 pede que você explique o que cada parte do programa faz.
              Este é o roteiro do <b>seu</b> programa, escrito a partir do que você
              escreveu. Treine em voz alta — por dentro parece fácil até a primeira
              vez que se tenta na frente de alguém.
            </p>

            {roteiro.map((t, i) => (
              <div key={i} className="mb-4 p-4 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm font-semibold mb-1">{t.titulo}</p>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-dim)' }}>{t.quando}</p>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-dim)' }}>
                  {t.faz.map((f, j) => (
                    /* O recuo é o aninhamento, e é a única marca de que uma
                       linha está dentro de outra — marcador de lista antes
                       dela competiria com isso e não diria nada a mais. */
                    <li key={j} style={{ paddingLeft: `${(f.length - f.trimStart().length) / 2 * 16}px` }}>
                      {f.trimStart()}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {mudas > 0 && (
              /* Função escrita e nunca chamada não roda, e o examinador não a
                 verá acontecer. Dizer isso agora evita que a pessoa a explique
                 como se rodasse. */
              <p className="text-sm mb-4" style={{ color: 'var(--color-secondary)' }}>
                {mudas === 1
                  ? 'Há uma função no seu programa que nenhuma parte chama. Ela não roda — o roteiro dela diz isso.'
                  : `Há ${mudas} funções no seu programa que nenhuma parte chama. Elas não rodam — o roteiro delas diz isso.`}
              </p>
            )}
          </div>
        )}

        <div className="text-center mt-4">
          <button onClick={aoSair} className="btn-primary">Voltar para a vereda</button>
        </div>
      </div>
    );
  }

  const tarefas = resultados.map(r => ({
    id: r.id,
    titulo: r.label,
    detalhe: r.passed ? undefined : (r.detail || r.hint),
    passos: PASSOS_DE_PYTHON[r.id],
    /* Contar linhas e classificar falhas respondem pelo texto de agora, e não
       pela última execução: apagá-las junto com as outras diria que a pessoa
       desfez um trabalho que ela não desfez. */
    feita: r.passed && (!velha || !IDS_DA_EXECUCAO.includes(r.id)),
  }));

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={entregar} disabled={!podeEntregar || salvando}
        className="btn-primary w-full disabled:opacity-50">
        {salvando ? 'Salvando…'
          : velha ? 'Execute de novo'
            : podeEntregar ? 'Entregar' : `Faltam ${resultados.length - passaram}`}
      </button>
      <button onClick={() => {
        setCodigo(licao.modelo); setExecucao(null); setCodigoRodado(null);
        setClassificacao(classificacaoInicial(falhas));
      }}
        className="btn-ghost w-full text-sm inline-flex items-center justify-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5" /> Recomeçar do zero
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={licao.titulo}
      programa="editor-de-codigo"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      /* A régua de status, e o painel de problemas quando ele existe: os dois
         são do editor e ficam colados no pé, e a cápsula sobe os dois. */
      rodape={26 + (falhas.length > 0 ? ALTURA_DOS_PROBLEMAS : 0)}
    >
      <style>{CSS_IDE}</style>
      <style>{CSS_PY}</style>

      <div className="ide">
        <CabecalhoDaIde arquivo={licao.arquivo} projeto={licao.projeto} aoAvisar={setAviso} />

        <div className="ide-corpo">
          {/* Direto no corpo, sem invólucro: `.ide-codigo` já traz `flex: 1`,
              e um `div` a mais no meio faz esse flex valer dentro dele em vez
              de dentro do corpo — o editor encolhe e sobra faixa morta. */}
          <EditorDeCodigo codigo={codigo} aoMudar={setCodigo}
            rotulo={licao.arquivo} linguagem="python" />

          <div className="py-lado">
            <div className="py-barra">
              <button onClick={executar} disabled={rodando}>
                <Play className="w-3.5 h-3.5" /> {rodando ? 'Rodando…' : 'Executar'}
              </button>
              {rodando && (
                <button onClick={parar} className="py-parar">
                  <Square className="w-3.5 h-3.5" /> Parar
                </button>
              )}
            </div>

            {/*
              O campo de entrada é parte do laboratório, e não um detalhe: é
              nele que se decide o que o input() vai ler, uma linha por chamada.
            */}
            <label className="py-rotulo" htmlFor="py-entrada">
              Entrada — uma linha por <code>input()</code>
            </label>
            <textarea id="py-entrada" className="py-entrada" value={entrada}
              onChange={e => setEntrada(e.target.value)}
              placeholder="O que o programa vai receber" spellCheck={false} />

            <div className="py-rotulo">Saída</div>
            <pre className="py-saida">
              {rodando ? 'Rodando…'
                : execucao === null ? 'Clique em Executar para ver o que o programa faz.'
                  : (execucao.saida || '') + (execucao.erro ? `\n${execucao.erro}` : '')
                  || '(o programa não escreveu nada)'}
            </pre>

            {velha && (
              <p className="py-velha">
                O código mudou depois da última execução. As tarefas mostram o
                resultado de antes — execute de novo.
              </p>
            )}
          </div>
        </div>

        {falhas.length > 0 && (
          <PainelDeProblemas
            conferidas={conferirClassificacao(falhas, classificacao)}
            aoMarcar={(id, cat) => setClassificacao(c => ({ ...c, [id]: cat }))}
          />
        )}

        <StatusDaIde problemas={resultados.length - passaram} linhas={contarLinhas(codigo)}
          aoAvisar={setAviso} linguagem="Python" />
      </div>
    </LaboratorioEmTelaCheia>
  );
}

/**
 * A altura do painel de problemas, em pixels.
 *
 * Fixa, e não um teto em vh, porque ela é a conta que a moldura precisa: a
 * cápsula da plataforma sobe a altura do que o programa imitado tem colado no
 * pé, e um painel que muda de tamanho com a tela não dá número nenhum para
 * subir. Com altura fixa, a cápsula pousa acima dele — e a lista rola por
 * dentro, como rola a de qualquer editor.
 */
const ALTURA_DOS_PROBLEMAS = 220;

/**
 * O painel de Problemas, onde as falhas se classificam.
 *
 * ── Por que aqui, e não num formulário da plataforma ─────────────────────
 * Todo editor de código tem um painel de problemas embaixo, e é lá que se olha
 * quando alguma coisa está errada. Pôr a classificação num cartão da plataforma
 * abaixo do laboratório repetiria o erro que o laboratório de IA já corrigiu:
 * a avaliação acontece dentro do programa, com as peças que ele tem.
 *
 * O que muda em relação a um editor de verdade é de quem é a resposta. Lá o
 * editor classifica; aqui quem classifica é quem estuda — porque é isso que o
 * requisito pede, e porque a família que mais importa, a de lógica, é a única
 * que nenhum editor consegue apontar.
 *
 * O recado de quem erra diz o que ela **teria visto** se a família marcada
 * fosse a certa, e não qual é a certa: com a resposta, três botões viram três
 * tentativas.
 */
function PainelDeProblemas({ conferidas, aoMarcar }: {
  conferidas: ReturnType<typeof conferirClassificacao>;
  aoMarcar: (id: string, categoria: CategoriaDeFalha) => void;
}) {
  /*
    Duas contas diferentes, e não uma.

    A lista de tarefas conta primeiro o que não foi respondido e só depois o que
    foi respondido errado — são dois estados, e o segundo só existe quando o
    primeiro acabou. O painel dizia "2 por classificar" enquanto a tarefa dizia
    "faltam 1 de 3", porque somava as duas coisas na mesma palavra. Duas
    palavras, dois números, e as duas telas passam a dizer o mesmo.
  */
  const semResposta = conferidas.filter(c => c.marcada === null).length;
  const erradas = conferidas.filter(c => c.marcada !== null && !c.certa).length;
  const conta = semResposta > 0 ? `${semResposta} por classificar`
    : erradas > 0 ? `${erradas} por rever`
      : 'todas classificadas';
  return (
    <section className="py-problemas" aria-label="Problemas">
      <header className="py-problemas-topo">
        <span>Problemas</span>
        <span className="py-problemas-conta">{conta}</span>
      </header>

      {/*
        A legenda mora aqui, e não em cada botão.

        O que separa as três famílias é uma frase por família, e ela vale para o
        painel inteiro — repetida embaixo de cada um dos três botões de cada
        falha, virava nove repetições da mesma coisa e empurrava as falhas para
        fora da tela. Dita uma vez, no alto, ela se lê uma vez.
      */}
      <p className="py-legenda">
        Quando o erro aparece:{' '}
        {ORDEM_DAS_CATEGORIAS.map((cat, i) => (
          <span key={cat}>
            {i > 0 && ' · '}
            <b>{CATEGORIAS[cat].nome.replace('Erro de ', '')}</b>, {CATEGORIAS[cat].quando.toLowerCase()}
          </span>
        ))}
      </p>

      <ul className="py-lista">
        {conferidas.map(c => (
          <li key={c.id} className={c.certa ? 'py-falha py-falha-ok' : 'py-falha'}>
            <p className="py-sintoma">{c.sintoma}</p>
            <div className="py-familias" role="group" aria-label={`Família da falha: ${c.sintoma}`}>
              {ORDEM_DAS_CATEGORIAS.map(cat => (
                <button key={cat} type="button"
                  className={c.marcada === cat ? 'py-familia py-familia-viva' : 'py-familia'}
                  aria-pressed={c.marcada === cat}
                  title={CATEGORIAS[cat].comoSeVe}
                  onClick={() => aoMarcar(c.id, cat)}>
                  {CATEGORIAS[cat].nome}
                </button>
              ))}
            </div>
            {c.recado && <p className="py-recado">{c.recado}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* As peças que só este laboratório tem: a barra de executar, a entrada e a
   saída. O resto do arranjo é o mesmo `CSS_IDE` dos outros editores. */
const CSS_PY = `
.py-lado { width: 340px; flex: none; display: flex; flex-direction: column; gap: 6px;
  padding: 8px; border-left: 1px solid var(--ide-borda, #2A2F3A); min-height: 0; }
.py-barra { display: flex; gap: 6px; }
.py-barra button { display: inline-flex; align-items: center; gap: 5px; border: 0;
  border-radius: 4px; padding: 6px 10px; font-size: 12px; font-weight: 700;
  background: #2E7D32; color: #fff; cursor: pointer; }
.py-barra button:disabled { opacity: .5; cursor: default; }
.py-barra .py-parar { background: #9A3B2F; }
.py-rotulo { font-size: 11px; text-transform: uppercase; letter-spacing: .04em;
  color: #8B93A7; }
.py-rotulo code { text-transform: none; letter-spacing: 0; }
.py-entrada { height: 84px; resize: vertical; border: 1px solid #2A2F3A; border-radius: 4px;
  background: #10141C; color: #D7DCE6; font-family: ui-monospace, monospace; font-size: 12px;
  padding: 6px; }
.py-saida { flex: 1; min-height: 120px; overflow: auto; margin: 0; padding: 8px;
  border: 1px solid #2A2F3A; border-radius: 4px; background: #10141C; color: #D7DCE6;
  font-family: ui-monospace, monospace; font-size: 12px; white-space: pre-wrap; }
.py-velha { margin: 0; font-size: 11px; color: #E0A458; line-height: 1.5; }

/* O painel de problemas, embaixo e da largura toda — a posição que ele tem em
   todo editor. Altura com teto: ele não pode empurrar o editor para fora da
   tela, então rola por dentro quando as falhas são muitas. */
.py-problemas { flex: none; height: ${ALTURA_DOS_PROBLEMAS}px; overflow: auto;
  border-top: 1px solid #2A2F3A; background: #16191F; }
.py-problemas-topo { position: sticky; top: 0; display: flex; align-items: center;
  justify-content: space-between; gap: 10px; padding: 5px 10px; background: #1B1F27;
  border-bottom: 1px solid #2A2F3A; font-size: 11px; text-transform: uppercase;
  letter-spacing: .06em; color: #8B93A7; }
.py-problemas-conta { text-transform: none; letter-spacing: 0; }
.py-legenda { margin: 0; padding: 6px 10px; border-bottom: 1px solid #21262F;
  font-size: 11.5px; line-height: 1.5; color: #8B93A7; }
.py-legenda b { color: #B7BECC; font-weight: 700; }
.py-lista { list-style: none; margin: 0; padding: 0; }
.py-falha { padding: 8px 10px; border-bottom: 1px solid #21262F;
  display: flex; flex-direction: column; gap: 6px; }
.py-falha:last-child { border-bottom: 0; }
/* Verde na borda esquerda, e não no fundo: a lista continua legível, e a marca
   fica onde o olho corre. */
.py-falha-ok { border-left: 3px solid #4C9A5A; padding-left: 7px; }
.py-sintoma { margin: 0; font-size: 12.5px; color: #D7DCE6; line-height: 1.45; }
.py-familias { display: flex; flex-wrap: wrap; gap: 6px; }
.py-familia { border: 1px solid #2A2F3A; border-radius: 4px; padding: 4px 10px;
  cursor: pointer; background: #10141C; color: #B7BECC; font-size: 12px;
  font-weight: 600; }
.py-familia:hover { border-color: #3B424F; }
.py-familia-viva { background: #1E2A3A; border-color: #4C7BB0; color: #E6EDF7; }
.py-recado { margin: 0; font-size: 11.5px; line-height: 1.5; color: #E0A458; }

/*
  No celular o editor ficava com zero de largura.

  O corpo da IDE é uma fila, e a coluna da direita passava a 100% aqui sem que
  a fila virasse pilha: o editor, que divide o que sobra, não recebia nada. A
  tela abria no campo de entrada, sem código à vista e sem nada dizendo que
  havia um. Os outros laboratórios de código resolvem isso com o alternador de
  abas; aqui a coluna da direita é curta, e empilhar as duas cabe — desde que o
  editor tenha altura mínima e o corpo role.
*/
@media (max-width: 900px) {
  .ide-corpo { flex-direction: column; overflow: auto; }
  .ide-codigo { min-height: 240px; }
  .py-lado { width: 100%; flex: none; border-left: 0; border-top: 1px solid #2A2F3A; }
  .py-saida { min-height: 96px; }
}
`;
