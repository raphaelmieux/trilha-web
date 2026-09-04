import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { PASSOS_DE_SCRATCH } from '../labs/passosDeScratch';
import { validarScratch, type CheckResult, type ProjetoSb3 } from '../lib/scratchValidator';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import type { VmDeScratch } from '../labs/scratch/vm';
import { PROJETO_INICIAL } from '../labs/scratch/projetoInicial';
import { acrescentarNossaArte, evitarOWorkerQuebrado, guardarNossaArte } from '../labs/scratch/armazenamento';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/**
 * O laboratório que roda o Scratch de verdade.
 *
 * ── O peso fica onde ele é usado ─────────────────────────────────────────
 * O `scratch-gui` são dezenas de megabytes. Ele entra por `lazy()`, então o
 * Vite o separa num pedaço próprio e só quem abre este laboratório paga.
 * Importá-lo direto aqui devolveria o peso ao pacote principal, e todo visitante
 * o baixaria para ver o painel.
 *
 * ── E a conferência olha a árvore, não um clique ─────────────────────────
 * `vm.toJSON()` devolve o projeto em sb3, e o validador lê os blocos que a
 * pessoa realmente montou. É a razão de embutir o Scratch em vez de apontar
 * para o site dele: dentro de um iframe ele é caixa fechada, e o laboratório
 * cairia em "clicou em salvar, então passou".
 */

const EditorDeScratch = lazy(() => import('../labs/scratch/EditorDeScratch'));

/*
  O VM é o do editor, e não um nosso.

  A primeira versão criava um `new VM()` e o passava em `<GUI vm={...}>`. O
  editor abria, e o nosso VM ficava vazio para sempre: o `scratch-gui` guarda o
  VM no store dele, e ali `mapStateToProps` vence a prop de quem chama — a ação
  `SET_VM` existe no pacote e nunca é despachada por ninguém. O sintoma era o
  pior que há: tela montada, nenhum erro, e `toJSON()` devolvendo um projeto
  sem ator nenhum. O laboratório conferia um projeto que não era o que
  estava na frente do desbravador.

  `guiInitialState.vm` é esse VM — criado uma vez pelo pacote, com o
  armazenamento já ligado por ele. Pegá-lo aqui dá as duas pontas de que o
  laboratório precisa (semear o modelo, ler o sb3) sem disputar a posse com
  quem já a tem. E é o mesmo `import()` do editor, então não traz peso novo.
*/
async function obterVm(): Promise<VmDeScratch> {
  const { exportadoDe } = await import('../labs/scratch/importar');
  /* Antes do import, e não depois: o `scratch-gui` escolhe o idioma na carga
     do módulo, e o que chega depois disso não é lido. */
  const { pedirOEditorEmPortugues } = await import('../labs/scratch/idioma');
  pedirOEditorEmPortugues();
  const inicial = exportadoDe<{ vm: VmDeScratch }>(
    await import('scratch-gui'), 'scratch-gui', 'guiInitialState');
  return inicial.vm;
}

/*
  Espera o editor ligar o desenho ao VM.

  O `scratch-gui` faz isso ao montar o palco. Carregar o projeto antes constrói
  os atores sem desenho nenhum: eles existem para o validador e não
  aparecem na tela — de novo o sintoma que não se vê de dentro.

  (E não se espera pelo projeto padrão do Scratch: ele não vem. O
  `ProjectFetcherHOC` está na composição, mas sem `projectId` ele nunca sai do
  estado inicial. Esperar por um `PROJECT_LOADED` que ninguém emite custou
  vinte segundos de tela cinza antes de eu medir.)
*/
async function esperarODesenho(vm: VmDeScratch, tetoMs = 20000): Promise<void> {
  const ate = Date.now() + tetoMs;
  while (Date.now() < ate) {
    if (vm.runtime?.renderer) return;
    await new Promise(r => setTimeout(r, 50));
  }
}

/*
  Põe um teto no `loadProject`.

  Não é zelo excessivo: este laboratório já ficou pendurado para sempre uma vez,
  porque o armazenamento do Scratch tem um caminho de falha que não rejeita
  nunca (ver `evitarOWorkerQuebrado`). Contra promessa que não volta, teto é a
  única defesa — e um aviso na tela é infinitamente melhor do que uma espera sem
  fim que ninguém sabe ler.
*/
function comTeto<T>(promessa: Promise<T>, tetoMs: number, recado: string): Promise<T> {
  return Promise.race([
    promessa,
    new Promise<T>((_, rejeita) => setTimeout(() => rejeita(new Error(recado)), tetoMs)),
  ]);
}

export default function LaboratorioDeScratch({ vereda, licao, userId, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'laboratorio' }>;
  userId: string;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const chave = `${vereda.code}-${licao.id}`;
  const [vm, setVm] = useState<VmDeScratch | null>(null);
  /* O editor monta assim que o VM existe; a lição só entra depois que ele
     terminou de abrir o projeto padrão dele. Ver o efeito abaixo. */
  const [semeado, setSemeado] = useState(false);
  const [resultados, setResultados] = useState<CheckResult[]>(
    () => validarScratch({ targets: [] }, licao.verificacoes));
  const [entregue, setEntregue] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState('');
  /* O projeto em sb3, como ele está agora. É o que se confere e o que se
     guarda de rascunho — as duas coisas querem exatamente este texto. */
  const [projeto, setProjeto] = useState('');

  /* Sem modelo na lição, o padrão da vereda: palco, dois atores e nenhum
     bloco. Deixar vazio abriria um editor sem palco e sem ator, e não há
     o que fazer numa tela assim. */
  const modelo = licao.projetoDeScratch ?? PROJETO_INICIAL;

  /* Etapa 1: pegar o VM. Isto é o que baixa o `scratch-gui`, e assim que
     resolve o editor pode montar — a espera na tela acaba aqui. */
  useEffect(() => {
    let vivo = true;
    void (async () => {
      const encontrado = await obterVm();
      if (vivo) setVm(encontrado);
    })();
    return () => { vivo = false; };
  }, []);

  /*
    Etapa 2: pôr o projeto da lição — ou o rascunho — dentro do editor.

    Ele espera o editor terminar de abrir o projeto *dele*. O `scratch-gui`
    carrega o projeto padrão do Scratch ao montar, sem ninguém pedir, e semear
    antes disso é perder a corrida em silêncio: o desbravador via o gato do
    Scratch onde deveria estar o palco da lição, e o validador conferia aquilo.

    Rascunho aqui é o projeto inteiro em sb3, e não um texto: um jogo é trabalho
    de horas, e recarregar sem querer apagava tudo nos outros laboratórios até
    isto existir. Quem perde meia hora de trabalho não recomeça: desiste.
  */
  useEffect(() => {
    if (!vm) return;
    let vivo = true;
    void (async () => {
      await esperarODesenho(vm);
      if (!vivo) return;
      /* Tudo isto antes de abrir o projeto: o `loadProject` busca cada fantasia
         enquanto lê, e conserto de armazenamento feito depois chega tarde. */
      evitarOWorkerQuebrado(vm);
      acrescentarNossaArte(vm);

      const guardado = lerRascunho<string>(userId, chave);
      const inicial = typeof guardado?.conteudo === 'string' && guardado.conteudo
        ? guardado.conteudo : modelo;
      if (inicial) {
        await guardarNossaArte(vm, inicial);
        if (!vivo) return;
        /*
          Modelo que não carrega precisa aparecer.

          Isto engolia o erro, e o sintoma era um editor sem palco e sem
          ator — uma tela em que não há o que fazer, sem uma palavra
          dizendo por quê. Silenciar o erro do modelo é esconder justamente o
          defeito que só o autor da lição pode consertar.
        */
        try {
          await comTeto(vm.loadProject(inicial), 30000,
            'o editor não respondeu ao abrir o projeto');
        } catch (e) {
          if (!vivo) return;
          setAviso(`O projeto desta lição não pôde ser aberto: ${String((e as Error)?.message ?? e).slice(0, 160)}`);
        }
      }
      if (!vivo) return;
      setProjeto(vm.toJSON());
      if (guardado?.conteudo && guardado.conteudo !== modelo) {
        setAviso('Seu projeto voltou como você deixou.');
      }
      setSemeado(true);
    })();
    return () => { vivo = false; };
  }, [vm, userId, chave, modelo]);

  /*
    A conferência acompanha o projeto, e não cada tecla.

    O VM avisa a cada mudança do espaço de trabalho; ler o sb3 inteiro a cada
    aviso seria caro numa edição contínua. O intervalo curto agrupa a rajada que
    um arrasto produz, e mantém a lista viva sem pedir que ninguém clique em
    conferir — no Scratch não há botão de conferir, e inventar um seria pedir
    que a pessoa aprendesse algo que o programa de verdade não tem.
  */
  const conferir = useCallback(() => {
    if (!vm) return;
    try {
      const json = vm.toJSON();
      setProjeto(json);
      setResultados(validarScratch(JSON.parse(json) as ProjetoSb3, licao.verificacoes));
    } catch { /* projeto em transição: a próxima leitura pega */ }
  }, [vm, licao.verificacoes]);

  useEffect(() => {
    if (!semeado) return;
    conferir();
    const relogio = setInterval(conferir, 1200);
    return () => clearInterval(relogio);
  }, [semeado, conferir]);

  /* Só se guarda o que já é da pessoa. Gravar antes de semear escreveria por
     cima do rascunho dela o projeto padrão do Scratch. */
  useRascunhoLocal(userId, chave, projeto, !entregue && semeado);

  const passaram = resultados.filter(r => r.passed).length;
  const tudoPassa = passaram === resultados.length && resultados.length > 0;

  const entregar = async () => {
    setSalvando(true);
    await aoVencer();
    descartarRascunho(userId, chave);
    setSalvando(false);
    setEntregue(true);
  };

  const recomecar = async () => {
    if (!vm || !modelo) return;
    try { await vm.loadProject(modelo); conferir(); setAviso('Projeto recomeçado.'); }
    catch { setAviso('Não foi possível recomeçar agora.'); }
  };

  if (entregue) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{licao.titulo} — vencido!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Seu projeto passou nas {resultados.length} verificações.
        </p>
        <button onClick={aoSair} className="btn-primary">Voltar para a vereda</button>
      </div>
    );
  }

  const tarefas = resultados.map(r => ({
    id: r.id,
    titulo: r.label,
    detalhe: r.passed ? undefined : (r.detail || r.hint),
    passos: PASSOS_DE_SCRATCH[r.id],
    feita: r.passed,
  }));

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={entregar} disabled={!tudoPassa || salvando}
        className="btn-primary w-full disabled:opacity-50">
        {salvando ? 'Salvando…' : tudoPassa ? 'Entregar' : `Faltam ${resultados.length - passaram}`}
      </button>
      {modelo && (
        <button onClick={recomecar}
          className="btn-ghost w-full text-sm inline-flex items-center justify-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" /> Recomeçar do zero
        </button>
      )}
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={licao.titulo}
      programa="scratch"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={0}
    >
      <Suspense fallback={<EsperandoOScratch />}>
        {vm ? <EditorDeScratch /> : <EsperandoOScratch />}
      </Suspense>
    </LaboratorioEmTelaCheia>
  );
}

/*
  A espera é longa o bastante para precisar ser explicada.

  São dezenas de megabytes na primeira vez, e uma tela cinza sem palavra nenhuma
  durante dez segundos parece defeito. Dizer o que está acontecendo — e que só
  acontece uma vez — é a diferença entre esperar e desistir.
*/
function EsperandoOScratch() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 p-8 text-center">
      <p className="font-semibold">Abrindo o Scratch…</p>
      <p className="text-sm max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
        É o editor de verdade, e ele é grande. A primeira vez demora alguns
        segundos; depois disso o navegador já o tem guardado.
      </p>
    </div>
  );
}
