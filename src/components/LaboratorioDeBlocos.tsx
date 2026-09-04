import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_BLOCOS, Paleta, PalcoDeBlocos, ListaDePersonagens, BlocoNaPilha, BarraDoPalco,
  type Cursor,
} from '../labs/blocosUi';
import { blocoNovo } from '../labs/blocosPaleta';
import { palcoInicial } from '../labs/modeloDeBlocos';
import {
  ehChapeu, novoId, type Categoria, type Ator, type Projeto, type Tecla, type TipoDeBloco,
} from '../labs/blocos';
import { Palco, QUADROS_POR_SEGUNDO, estadoInicial, type EstadoDoPalco } from '../labs/blocosRuntime';
import { inserirDentro, inserirDepois, alterar, remover, mover, naPilha, contem } from '../labs/blocosEdicao';
import { validarBlocos, type CheckResult } from '../lib/blocosValidator';
import { PASSOS_DE_BLOCOS } from '../labs/passosDeBlocos';
import { roteiroDeApresentacao, pilhasSemChapeu } from '../labs/roteiroDeApresentacao';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/*
 * O laboratório de blocos.
 *
 * Imita o Scratch de propósito — ele é *aquele* programa, como o Word e o
 * Explorador —, e por isso a paleta por categoria, o palco no canto e a lista
 * de atores embaixo dele estão onde a pessoa vai encontrá-los depois.
 *
 * O que ele cobra sai de `verificacoes`, contra `blocosValidator`, que olha a
 * árvore de blocos e não a tela. E o palco roda de verdade: a bandeira verde
 * dispara as pilhas, as teclas movem, o placar sobe. Um laboratório de
 * programação em que o programa não executa ensina a montar desenho de
 * programa, que é outra coisa.
 */

/** Teclas do navegador para as do palco. As outras não interessam ao palco. */
const TECLA_DO_EVENTO: Record<string, Tecla> = {
  ArrowRight: 'direita', ArrowLeft: 'esquerda', ArrowUp: 'cima', ArrowDown: 'baixo', ' ': 'espaço',
};

export default function LaboratorioDeBlocos({ vereda, licao, userId, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'laboratorio' }>;
  userId: string;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  /* O tipo permite ausência porque a maioria dos laboratórios de vereda é de
     texto. Sem projeto, o padrão é o palco de dois atores — um palco vazio
     abriria uma tela em que não há o que fazer, sem uma palavra dizendo por
     quê, que é o defeito que esta casa já pagou três vezes. */
  const inicial: Projeto = licao.projetoDeBlocos ?? palcoInicial();
  const chave = `${vereda.code}-${licao.id}`;

  const [projeto, setProjeto] = useState<Projeto>(() => {
    const guardado = lerRascunho<Projeto>(userId, chave);
    return guardado?.conteudo && typeof guardado.conteudo === 'object'
      ? (guardado.conteudo as Projeto) : inicial;
  });
  const [voltou] = useState(() => {
    const g = lerRascunho<Projeto>(userId, chave);
    return !!g?.conteudo && JSON.stringify(g.conteudo) !== JSON.stringify(inicial);
  });

  /*
    O projeto também num ref, e é o ref que os cálculos leem.

    `setProjeto(f)` não roda `f` na hora: o React o guarda e o executa na
    renderização seguinte. Então tudo o que se quisesse saber sobre o resultado
    — em qual pilha o bloco caiu, para onde o cursor vai — chegava tarde, e o
    clique seguinte lia o projeto de antes. Duas cliques rápidos punham o
    segundo bloco na pilha errada.

    O ref é a verdade para quem calcula; o estado é o que desenha.
  */
  const projetoRef = useRef(projeto);
  const aplicar = useCallback((f: (p: Projeto) => Projeto) => {
    const proximo = f(projetoRef.current);
    projetoRef.current = proximo;
    setProjeto(proximo);
  }, []);

  const [atual, setAtual] = useState(inicial.atores[0]?.id ?? '');
  const [categoria, setCategoria] = useState<Categoria>('eventos');
  const [cursor, setCursorEstado] = useState<Cursor | null>(null);
  /*
    O cursor também num ref, e é o ref que a inserção lê.

    Dois cliques na paleta dentro do mesmo quadro liam o cursor do render
    anterior: o segundo bloco entrava depois do mesmo vizinho que o primeiro —
    ou seja, **antes** dele. Uma criança clicando depressa monta a pilha ao
    contrário e não tem como saber por quê. O estado continua existindo porque
    é ele que desenha a linha do cursor na tela.
  */
  const cursorRef = useRef<Cursor | null>(null);
  const setCursor = useCallback((c: Cursor | null) => {
    cursorRef.current = c;
    setCursorEstado(c);
  }, []);
  const [entregue, setEntregue] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState(voltou ? 'Seu projeto voltou como você deixou.' : '');

  useRascunhoLocal(userId, chave, projeto, !entregue);

  const resultados: CheckResult[] = useMemo(
    () => validarBlocos(projeto, licao.verificacoes), [projeto, licao.verificacoes]);
  const passaram = resultados.filter(r => r.passed).length;
  const tudoPassa = passaram === resultados.length;

  /* ── O palco ────────────────────────────────────────────────────────── */

  const palco = useRef<Palco | null>(null);
  const teclas = useRef<Set<Tecla>>(new Set());
  const clique = useRef<string | undefined>(undefined);
  const [estado, setEstado] = useState<EstadoDoPalco>(() => estadoInicial(projeto));

  /* O palco é remontado quando o projeto muda: editar um bloco enquanto o
     programa roda deve valer no próximo Começar, e não no meio da execução. */
  useEffect(() => {
    palco.current = new Palco(projeto);
    setEstado(palco.current.estado);
  }, [projeto]);

  useEffect(() => {
    const desce = (e: KeyboardEvent) => {
      const t = TECLA_DO_EVENTO[e.key];
      if (t) { teclas.current.add(t); if (t === 'espaço') e.preventDefault(); }
    };
    const sobe = (e: KeyboardEvent) => {
      const t = TECLA_DO_EVENTO[e.key];
      if (t) teclas.current.delete(t);
    };
    window.addEventListener('keydown', desce);
    window.addEventListener('keyup', sobe);
    return () => {
      window.removeEventListener('keydown', desce);
      window.removeEventListener('keyup', sobe);
    };
  }, []);

  /* O laço de quadros. `setInterval` e não `requestAnimationFrame`: o palco tem
     ritmo próprio — trinta quadros por segundo, como o Scratch —, e amarrá-lo à
     taxa do monitor faria o mesmo programa correr mais rápido em telas de 120Hz. */
  useEffect(() => {
    const id = setInterval(() => {
      const p = palco.current;
      if (!p || !p.estado.rodando) return;
      p.quadro({ teclas: new Set(teclas.current), clicado: clique.current });
      clique.current = undefined;
      setEstado({ ...p.estado, atores: p.estado.atores.map(x => ({ ...x })) });
    }, 1000 / QUADROS_POR_SEGUNDO);
    return () => clearInterval(id);
  }, []);

  const comecar = () => {
    palco.current?.bandeira();
    if (palco.current) setEstado({ ...palco.current.estado });
  };
  const parar = () => {
    palco.current?.parar();
    if (palco.current) setEstado({ ...palco.current.estado });
  };

  /* ── A edição ───────────────────────────────────────────────────────── */

  const ator = projeto.atores.find(p => p.id === atual);
  const outros = projeto.atores.filter(p => p.id !== atual).map(p => ({ id: p.id, nome: p.nome }));
  const variaveis = projeto.variaveis.map(v => v.nome);

  /*
    Criar variável é ação do laboratório, e não da lição.

    O requisito pede "criar uma variável e alterar seu valor durante a
    execução", e as duas metades são da pessoa. Entregá-la pronta no
    `projetoDeBlocos` dava a primeira de graça e deixava a verificação medir só
    a segunda — sem que nada na tela denunciasse.

    Ela nasce em zero: é o valor de placar, de vidas e de tempo no instante em
    que o jogo começa, e é o que o bloco "defina para 0" da bandeira verde
    depois repete de propósito, para que recomeçar o jogo zere de novo.
  */
  const criarVariavel = useCallback((nome: string) => {
    aplicar(agora => (agora.variaveis.some(v => v.nome === nome)
      ? agora
      : { ...agora, variaveis: [...agora.variaveis, { nome, valor: 0 }] }));
  }, [aplicar]);

  const trocarPersonagem = useCallback((p: (x: Ator) => Ator) => {
    aplicar(agora => ({
      ...agora,
      atores: agora.atores.map(x => (x.id === atual ? p(x) : x)),
    }));
  }, [aplicar, atual]);

  /**
   * Põe um bloco onde o cursor está.
   *
   * Tudo é calculado agora, a partir de `projetoRef`, porque o cursor seguinte
   * depende de onde o bloco caiu — e esperar o React aplicar o estado para
   * descobrir isso é o defeito que punha o segundo bloco na pilha anterior.
   */
  const acrescentar = (tipo: TipoDeBloco) => {
    const projetoAgora = projetoRef.current;
    const p = projetoAgora.atores.find(x => x.id === atual);
    if (!p) return;

    const novo = blocoNovo(tipo, novoId(), variaveis[0] ?? 'placar', outros[0]?.id ?? 'borda');

    /* Um chapéu sempre abre uma pilha nova: encaixá-lo no meio de outra
       deixaria dois gatilhos numa pilha só, que o Scratch não permite e que
       ninguém consegue ler. */
    if (ehChapeu(novo)) {
      const pilha = { id: novoId('p'), blocos: [novo] };
      aplicar(agora => ({
        ...agora,
        atores: agora.atores.map(x =>
          (x.id === atual ? { ...x, pilhas: [...x.pilhas, pilha] } : x)),
      }));
      setCursor({ pilha: pilha.id, depois: novo.id });
      return;
    }

    const c = cursorRef.current;
    const alvo = c && p.pilhas.some(x => x.id === c.pilha)
      ? c
      : { pilha: p.pilhas[p.pilhas.length - 1]?.id ?? '', depois: undefined, dentro: undefined };

    if (!alvo.pilha) {
      setAviso('Comece por um bloco de Eventos: sem um chapéu, a pilha não roda.');
      return;
    }

    trocarPersonagem(x => naPilha(x, alvo.pilha, blocos => {
      if (alvo.dentro) return inserirDentro(blocos, alvo.dentro, novo);
      if (alvo.depois && contem(blocos, alvo.depois)) return inserirDepois(blocos, alvo.depois, novo);
      return [...blocos, novo];
    }));
    setCursor({ pilha: alvo.pilha, depois: novo.id });
  };

  const naPilhaAtual = (pilha: string, op: Parameters<typeof naPilha>[2]) =>
    trocarPersonagem(p => naPilha(p, pilha, op));

  /* ── A entrega ──────────────────────────────────────────────────────── */

  /*
    O jogo é o laboratório que cobra a interação entre os dois atores.

    É por essa verificação que se reconhece o último, e não pelo id da lição:
    id se renomeia sem que ninguém repare, e aí o roteiro de apresentação
    sumiria em silêncio justamente do único lugar onde ele serve.
  */
  const ehOJogo = licao.verificacoes.includes('interacao');

  const entregar = async () => {
    setSalvando(true);
    await aoVencer();
    descartarRascunho(userId, chave);
    setSalvando(false);
    setEntregue(true);
  };

  if (entregue) {
    /*
      O roteiro da apresentação sai daqui, e só no último laboratório.

      O requisito 6 pede apresentar o jogo ao examinador explicando em voz alta
      a função de cada grupo de blocos — o requisito mais difícil, porque montar
      copiando é possível e explicar copiando não é. A plataforma não tem como
      conferi-lo, e o que ela pode fazer é preparar: ler a árvore que a pessoa
      montou e dizer, em português, o que cada pilha dela faz.

      Só no último porque antes dele não há jogo para apresentar: um roteiro de
      duas linhas no laboratório do módulo 2 ensinaria a tratá-lo como enfeite
      de fim de tela.
    */
    const roteiro = ehOJogo ? roteiroDeApresentacao(projeto) : [];
    const mudas = ehOJogo ? pilhasSemChapeu(projeto) : 0;

    return (
      <div className="card p-8">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
          <h1 className="text-2xl font-bold mb-2">{licao.titulo} — vencido!</h1>
          <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Seu projeto passou nas {resultados.length} verificações.
          </p>
        </div>

        {roteiro.length > 0 && (
          <div className="mt-6 text-left">
            <h2 className="text-lg font-bold mb-1">Para apresentar ao examinador</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              O requisito 6 pede que você explique em voz alta o que cada grupo de
              blocos faz. Este é o roteiro do <b>seu</b> jogo, escrito a partir do
              que você montou. Treine em voz alta — por dentro parece fácil até a
              primeira vez que se tenta na frente de alguém.
            </p>

            {roteiro.map((t, i) => (
              <div key={i} className="mb-4 p-4 rounded-lg"
                style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm font-semibold mb-2">
                  {t.ator}: “Esta pilha roda {t.quando}…”
                </p>
                <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-dim)' }}>
                  {t.faz.map((f, j) => (
                    <li key={j} style={{ paddingLeft: `${(f.length - f.trimStart().length) / 2 * 14}px` }}>
                      … {f.trimStart()}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {mudas > 0 && (
              /* Pilha sem chapéu não roda, e o examinador não a verá acontecer.
                 Dizer isso agora evita que a pessoa a explique como se rodasse. */
              <p className="text-sm mb-4" style={{ color: 'var(--color-secondary)' }}>
                {mudas === 1
                  ? 'Há uma pilha sem bloco de chapéu no seu projeto. Ela não roda, e por isso ficou de fora do roteiro.'
                  : `Há ${mudas} pilhas sem bloco de chapéu no seu projeto. Elas não rodam, e por isso ficaram de fora do roteiro.`}
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
    passos: PASSOS_DE_BLOCOS[r.id],
    feita: r.passed,
  }));

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={entregar} disabled={!tudoPassa || salvando}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50">
        {salvando ? 'Salvando…' : tudoPassa ? 'Entregar' : `Faltam ${resultados.length - passaram}`}
      </button>
      <button onClick={() => { aplicar(() => inicial); setCursor(null); }}
        className="btn-secondary text-xs w-full justify-center">
        <RotateCcw className="w-3 h-3 mr-1" /> Recomeçar do zero
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={licao.titulo}
      programa="editor-de-blocos"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={0}
    >
      <style>{CSS_BLOCOS}</style>

      <div className="bl">
        <BarraDoPalco rodando={estado.rodando} aoRodar={comecar} aoParar={parar}
          nome={`${licao.projeto} — ${ator?.nome ?? ''}`} />

        <div className="bl-corpo">
          <Paleta categoria={categoria} aoTrocarCategoria={setCategoria}
            aoEscolher={acrescentar} aoCriarVariavel={criarVariavel}
            variaveis={variaveis} outro={outros[0]?.id ?? 'borda'} />

          <div className="bl-scripts">
            {!ator || ator.pilhas.length === 0 ? (
              <p className="bl-vazio-scripts">
                Nada aqui ainda. Comece por <b>Eventos</b>, na paleta: um bloco de
                chapéu diz <i>quando</i> o programa roda, e sem ele nada acontece
                ao clicar em Começar.
              </p>
            ) : ator.pilhas.map(pilha => (
              <div key={pilha.id} className="bl-pilha">
                {pilha.blocos.map((b, i) => (
                  <BlocoNaPilha key={b.id} bloco={b} cursor={cursor} pilha={pilha.id}
                    primeiro={i === 0} ultimo={i === pilha.blocos.length - 1}
                    variaveis={variaveis} atores={outros}
                    aoSelecionar={setCursor}
                    aoMudar={(id, m) => naPilhaAtual(pilha.id, bs => alterar(bs, id, m))}
                    aoRemover={id => {
                      naPilhaAtual(pilha.id, bs => remover(bs, id));
                      setCursor(null);
                    }}
                    aoMover={(id, d) => naPilhaAtual(pilha.id, bs => mover(bs, id, d))} />
                ))}
              </div>
            ))}
          </div>

          <div className="bl-lado">
            <PalcoDeBlocos estado={estado} aoClicarNoAtor={id => { clique.current = id; }} />
            <ListaDePersonagens atores={projeto.atores} atual={atual}
              aoEscolher={id => { setAtual(id); setCursor(null); }} />
          </div>
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
