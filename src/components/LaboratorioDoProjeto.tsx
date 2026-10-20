import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { CSS_WORD, CSS_FOLHA } from '../labs/word';
import { CSS_EXCEL } from '../labs/excel';
import { CSS_DO_CONSTRUTOR } from '../labs/construtorDeFormularios';
import { CSS_POWERPOINT } from '../labs/powerpoint';
import { CSS_DO_LEITOR } from '../labs/leitorDePdf';
import { CSS_DA_NUVEM } from '../labs/nuvem';
import { CSS_DO_BLOCO_DE_NOTAS } from '../labs/blocoDeNotas';
import {
  LICOES_DA_CC_ES012, contextoDe, metasDa,
  type ContextoDoProjeto, type LicaoDaCcEs012, type ProgramaDaLicao,
} from '../labs/metasDaCcEs012';
import {
  ConjuntoInteiro, PropostaDoConjunto, type PropsDaSuperficie,
} from '../labs/projetoNaPlataforma';
import { RegulamentoNoWord } from '../labs/projetoNoTexto';
import { ControleNoExcel } from '../labs/projetoNaPlanilha';
import { FormularioDaFeira, ImportacaoDasRespostas } from '../labs/projetoNoFormulario';
import { DivulgacaoNoPowerPoint } from '../labs/projetoNaApresentacao';
import { DossieNoLeitor } from '../labs/projetoNoDossie';
import { EntregaDoProjeto, RepositorioDaFeira } from '../labs/projetoNoRepositorio';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * As dez lições da CC-ES012, numa moldura só.
 *
 * ── Por que uma moldura e seis superfícies ───────────────────────────────
 * As outras veredas abrem **um** programa, e por isso cabem num componente: o
 * que muda entre as lições é de que estado se parte. Esta abre seis — o Word,
 * o Excel, o construtor de formulários, o PowerPoint, o leitor de PDF e a
 * nuvem —, porque o conjunto documental é feito nos cinco programas que as
 * veredas do requisito 1 ensinaram, mais o repositório que os guarda.
 *
 * Um componente com as seis dentro passaria de duas mil linhas e teria seis
 * assuntos. Cada superfície mora no arquivo da janela que ela veste, e o que
 * fica aqui é o que é da **moldura**: o estado do conjunto, a lista de
 * tarefas, o aviso, e o despacho.
 *
 * ── O despacho é um `Record`, e não uma escada de `if` ───────────────────
 * A décima primeira lição não compila até alguém dizer em que superfície ela
 * abre. É a decisão do despacho de três telas da CC-ES002 e do mapa dos
 * cadernos da CC-ES003, e a razão está escrita nas duas: com duas lições um
 * ternário funciona, com dez o `else` vira "todo o resto" e a lição nova cai
 * calada na tela da primeira.
 *
 * ── E duas lições não imitam programa nenhum ─────────────────────────────
 * A proposta e a demonstração são tela da plataforma, então a moldura recebe
 * `imitaPrograma={false}`: o aviso de tela pequena diz, com todas as letras,
 * que o laboratório imita um programa de computador — numa lista de perguntas
 * a frase é falsa, e manda a pessoa procurar um computador para uma tela que
 * funciona no telefone dela. É a decisão do módulo 8 da CC-ES008.
 */

const SUPERFICIE: Record<LicaoDaCcEs012, (p: PropsDaSuperficie) => JSX.Element> = {
  proposta: PropostaDoConjunto,
  documento: RegulamentoNoWord,
  planilha: ControleNoExcel,
  formulario: FormularioDaFeira,
  importar: ImportacaoDasRespostas,
  apresentacao: DivulgacaoNoPowerPoint,
  dossie: DossieNoLeitor,
  repositorio: RepositorioDaFeira,
  instrucoes: EntregaDoProjeto,
  'quinze-minutos': ConjuntoInteiro,
};

/**
 * O nome do programa imitado, para a lembrança do aviso de tela pequena.
 *
 * São os **mesmos nomes** que as outras veredas usam — `word`, `excel`,
 * `powerpoint`, `leitor-de-pdf`, `nuvem`, `formulario-na-web` —, e isso é
 * decisão: a lembrança é por programa imitado, então quem dispensou o aviso no
 * Word da CC-ES002 não é avisado de novo aqui. Um nome próprio por vereda daria
 * seis avisos a quem já tinha dispensado os seis, e aviso que volta é o que
 * ensina a pessoa a não ler avisos.
 */
const PROGRAMA_IMITADO: Record<ProgramaDaLicao, string> = {
  word: 'word',
  excel: 'excel',
  formulario: 'formulario-na-web',
  powerpoint: 'powerpoint',
  pdf: 'leitor-de-pdf',
  nuvem: 'nuvem',
  plataforma: 'projeto-documental',
};

/**
 * A folha que a lição pede **além** da do programa de partida.
 *
 * O módulo 5 abre dois programas, com barra de tarefas entre eles: ele começa
 * no construtor e termina na planilha, que é onde as fórmulas moram. Então ele
 * leva a folha do Excel e a da barra, além da do construtor.
 */
const FOLHA_EXTRA: Partial<Record<LicaoDaCcEs012, string>> = {
  importar: `${CSS_EXCEL}\n${CSS_DO_BLOCO_DE_NOTAS}`,
};

/** A altura do que o programa imitado tem colado no pé, para a cápsula subir. */
const RODAPE: Partial<Record<LicaoDaCcEs012, number>> = { importar: 58 };

/** A folha de cada programa. A da plataforma não tem: ela usa as da casa. */
const FOLHA: Record<ProgramaDaLicao, string> = {
  word: `${CSS_WORD}\n${CSS_FOLHA}`,
  excel: CSS_EXCEL,
  formulario: CSS_DO_CONSTRUTOR,
  powerpoint: CSS_POWERPOINT,
  pdf: CSS_DO_LEITOR,
  nuvem: CSS_DA_NUVEM,
  plataforma: '',
};

export default function LaboratorioDoProjeto({ vereda, licao: daLicao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'projeto' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licao = daLicao.licao;
  const [ctx, setCtx] = useState<ContextoDoProjeto>(
    () => contextoDe(LICOES_DA_CC_ES012[licao].projeto),
  );
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  /*
    A conta de remontagens, e por que ela existe.

    A superfície do Excel guarda o histórico do Ctrl+Z, que é o que o Ctrl+Z
    desfaz no Excel: um passo da planilha, e não a seção que se escreveu no
    regulamento dois módulos atrás. Recomeçar troca o conjunto por baixo dela,
    e um histórico que sobrevivesse a isso desfaria para um estado que a tela
    já não mostra. Trocar a `key` remonta a superfície, que é a resposta do
    React para "este componente recomeça do zero".
  */
  const [vida, setVida] = useState(0);

  const programa = LICOES_DA_CC_ES012[licao].programa;
  const Superficie = SUPERFICIE[licao];

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 7000);
  };

  const mudar = (f: (c: ContextoDoProjeto) => ContextoDoProjeto) => setCtx(f);

  const recomecar = () => {
    setCtx(contextoDe(LICOES_DA_CC_ES012[licao].projeto));
    setVida(v => v + 1);
    setAviso('');
  };

  const tarefas = useMemo(
    () => metasDa(licao).map(m => ({
      id: m.id,
      titulo: m.titulo,
      detalhe: m.detalhe,
      onde: m.onde,
      passos: m.passos,
      feita: m.feita(ctx),
    })),
    [licao, ctx],
  );
  const tudoFeito = tarefas.every(t => t.feita);

  const acoes = (
    <div className="flex flex-col gap-2">
      <button
        onClick={async () => { setSalvando(true); await aoVencer(); aoSair(); }}
        disabled={!tudoFeito || salvando}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50"
      >
        {tudoFeito ? 'Concluir a lição' : `Faltam ${tarefas.filter(t => !t.feita).length}`}
      </button>
      <button
        onClick={recomecar}
        className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1"
      >
        <RotateCcw className="w-3 h-3" /> Recomeçar
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={daLicao.titulo}
      programa={PROGRAMA_IMITADO[programa]}
      imitaPrograma={programa !== 'plataforma'}
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={RODAPE[licao] ?? 0}
    >
      {FOLHA[programa] !== '' && <style>{FOLHA[programa]}</style>}
      {FOLHA_EXTRA[licao] && <style>{FOLHA_EXTRA[licao]}</style>}
      <Superficie key={`${licao}-${vida}`} ctx={ctx} mudar={mudar} avisar={avisar} />
    </LaboratorioEmTelaCheia>
  );
}
