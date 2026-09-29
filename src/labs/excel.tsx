import { ArrowDownAZ, ArrowUpZA, Filter, X } from 'lucide-react';
import {
  type Caderno, type Direcao, type Faixa, type Planilha,
  alinhamentoDe, estiloCondicional, linhaEscondida, mostrar, naFaixa, nomeDaColuna,
  textoDoResumo, valorCalculado,
  type TipoDeGrafico, type PontoDoGrafico, type EixoDoGrafico,
} from './planilha';

/*
 * A janela do Excel, compartilhada.
 *
 * Ela nasceu dentro de `PlanilhaLab.tsx`, e saiu de lá quando a AP044 precisou
 * de um segundo laboratório de planilha. É a mesma decisão de `word.tsx`, e
 * pelo mesmo motivo escrito lá: duas cópias divergem no primeiro ajuste, e a
 * trilha passa a mostrar dois "Excel" diferentes — um com a fileira de guias
 * completa e o outro sem, um com a fileira de abas no pé e o outro sem. O que
 * a trilha estava ensinando a reconhecer era justamente esta janela.
 *
 * O que mora aqui é o que as duas telas têm em comum: o CSS, a barra de
 * título, a fileira de guias, as peças da faixa e a fileira de abas do pé. O
 * que cada laboratório cobra continua no laboratório.
 */

/** As guias do Excel em português, na ordem em que ele as põe. */
export const GUIAS_DO_EXCEL = [
  'Página Inicial', 'Inserir', 'Layout da Página', 'Fórmulas',
  'Dados', 'Revisão', 'Exibir', 'Ajuda',
] as const;

/*
  A planilha genérica: o verde da guia, o cinza dos cabeçalhos, a borda grossa
  da célula ativa. As três planilhas que o desbravador pode encontrar arrumam
  isso do mesmo jeito, e é o arranjo que ele precisa reconhecer.
*/
export const CSS_EXCEL = `
.pl-janela {
  background: #F3F2F1; color: #201F1E;
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
.pl-titulo {
  background: #F9F8F7; border-bottom: 1px solid #E1DFDD;
  display: flex; align-items: center; gap: 10px; padding: 6px 10px; font-size: 12px;
}
.pl-guias { display: flex; background: #F3F2F1; border-bottom: 1px solid #E1DFDD; padding: 0 6px; }
.pl-guia {
  padding: 6px 12px; font-size: 12.5px; color: #201F1E;
  border-bottom: 2px solid transparent; background: transparent;
}
.pl-guia:hover { background: #EDEBE9; }
.pl-guia[aria-selected="true"] { color: #217346; border-bottom-color: #217346; font-weight: 600; }
.pl-faixa {
  display: flex; gap: 2px; background: #FFFFFF; border-bottom: 1px solid #E1DFDD;
  padding: 3px 6px 0; overflow-x: auto;
}
.pl-grupo { display: flex; flex-direction: column; border-right: 1px solid #E1DFDD; padding: 0 6px; }
.pl-grupo-corpo { display: flex; align-items: flex-start; gap: 3px; padding: 2px 0 4px; }
.pl-grupo-nome {
  font-size: 10px; color: #605E5C; text-align: center; padding-bottom: 3px;
  /* Nome de grupo não quebra: "Área de Transferência" em duas linhas empurrava
     a faixa inteira para baixo, e o Excel não faz isso. */
  white-space: nowrap;
}
.pl-bt {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 24px; padding: 4px 5px; border-radius: 3px; color: #201F1E;
}
.pl-bt:hover { background: #EDEBE9 !important; }
.pl-bt:focus-visible { outline: 2px solid #217346; outline-offset: 1px; }
.pl-sep { width: 1px; align-self: stretch; background: #E1DFDD; margin: 2px 3px; }

.pl-formula {
  display: flex; align-items: center; gap: 6px; padding: 4px 8px;
  background: #FFFFFF; border-bottom: 1px solid #E1DFDD;
}
.pl-nome {
  min-width: 62px; font-size: 12px; padding: 3px 6px;
  border: 1px solid #D2D0CE; border-radius: 2px; background: #FFFFFF;
}
.pl-fx { font-style: italic; color: #605E5C; font-size: 12px; }
.pl-entrada {
  flex: 1; border: 1px solid #D2D0CE; border-radius: 2px; padding: 3px 6px;
  font-size: 12.5px; font-family: inherit; background: #FFFFFF; color: #201F1E;
}
.pl-entrada:focus { outline: 1px solid #217346; }

.pl-grade-caixa { flex: 1; min-height: 0; overflow: auto; background: #FFFFFF; padding-bottom: 20px; }
.pl-grade { border-collapse: collapse; table-layout: fixed; }
.pl-canto { width: 34px; background: #F3F2F1; border: 1px solid #D2D0CE; position: sticky; left: 0; z-index: 2; }
.pl-cab-col, .pl-cab-lin {
  background: #F3F2F1; border: 1px solid #D2D0CE; color: #605E5C;
  font-size: 11.5px; font-weight: 600; position: relative;
}
.pl-cab-col { height: 20px; }
.pl-cab-lin { width: 34px; position: sticky; left: 0; z-index: 1; }
/* As alças ficam por cima da borda do cabeçalho, como na planilha de verdade:
   é ali que o ponteiro vira seta dupla. */
.pl-alca-col { position: absolute; top: 0; right: -3px; width: 7px; height: 100%; cursor: col-resize; }
.pl-alca-lin { position: absolute; left: 0; bottom: -3px; height: 7px; width: 100%; cursor: row-resize; }

.pl-grade td {
  border: 1px solid #E1DFDD; padding: 2px 5px; font-size: 12.5px;
  overflow: hidden; white-space: nowrap;
}
.pl-ativa { outline: 2px solid #217346; outline-offset: -2px; }
/* A faixa selecionada: azulada, com a âncora branca por dentro. É assim que a
   planilha mostra o que vai ser mesclado, somado ou formatado — sem isso, quem
   arrasta não vê que arrastou. */
.pl-na-faixa { background: #E3EFE8; }
.pl-valor { display: block; min-height: 15px; cursor: cell; }
/* A grade não é para selecionar texto com o ponteiro: arrastar seleciona
   células, e o texto azul do navegador por cima disso confunde as duas coisas. */
.pl-grade { user-select: none; }
.pl-celula-entrada, .pl-entrada { user-select: text; }
.pl-celula-entrada {
  width: 100%; border: none; outline: none; background: transparent;
  font: inherit; color: inherit;
}

/* Formatação automática: o estilo pronto, com cabeçalho pintado e faixas.

   A faixa alternada começa na linha 3, e não na 2: a linha 2 é o cabeçalho, e
   ela também é par. Com as duas regras valendo, a de baixo levava o fundo — o
   cabeçalho ficava verde-claro com a letra branca por cima, ilegível, e a
   tabela continuava parecendo formatada. É a armadilha de sempre: a superfície
   clara precisa dizer a própria cor. */
/* O estilo pega só o que está dentro da tabela, marcado pela classe pl-na-tabela.
   As listras começam na terceira linha porque a segunda é o cabeçalho, e as
   duas regras casavam com ela: a última escrita ganhava o fundo, e o cabeçalho
   saía branco sobre verde claro em vez de branco sobre verde escuro. */
.pl-layout-automatico td.pl-na-tabela { border-color: #A9C7B1; }
.pl-layout-automatico tr:nth-child(n+3):nth-child(even) td.pl-na-tabela { background: #EAF3EC; }
.pl-layout-automatico tr:nth-child(2) td.pl-na-tabela { background: #217346; color: #FFFFFF; font-weight: 600; }
/* Manual: bordas e preenchimento escolhidos, sem faixa alternada. */
.pl-layout-manual td.pl-na-tabela { border: 1px solid #605E5C; background: #FBFBF9; }

.pl-status {
  display: flex; align-items: center; gap: 14px; padding: 4px 10px;
  background: #F3F2F1; border-top: 1px solid #E1DFDD; font-size: 11.5px; color: #605E5C;
}
.pl-menu {
  position: absolute; z-index: 40; top: 100%; left: 0; margin-top: 2px;
  background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 3px;
  box-shadow: 0 6px 18px rgba(0,0,0,.22); min-width: 232px; padding: 4px;
}
/* O menu do botão direito é preso à janela, e não à célula: célula com
   overflow escondido recortaria o menu pela metade. */
.pl-contexto {
  position: fixed; z-index: 60;
  background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 4px;
  box-shadow: 0 8px 24px rgba(0,0,0,.26); min-width: 224px; padding: 4px;
}
.pl-veu { position: fixed; inset: 0; z-index: 50; }
.pl-menu-item {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
  padding: 7px 10px; font-size: 12.5px; border: none; border-radius: 2px;
  cursor: pointer; color: #201F1E; background: transparent;
}
.pl-menu-item:hover { background: #EDEBE9; }
/* O rótulo é uma linha só, com o ícone ao lado do texto: sem isto o ícone
   empurrava a palavra para a linha de baixo e cada item ficava com dois
   andares. */
.pl-menu-rotulo { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.pl-menu-atalho { margin-left: auto; padding-left: 18px; color: #8A8886; font-size: 11px; }
.pl-menu-risco { height: 1px; background: #E1DFDD; margin: 4px 6px; }
.pl-linhas { display: flex; flex-direction: column; gap: 3px; }
.pl-combo {
  display: inline-flex; align-items: center; height: 22px; padding: 0 6px;
  border: 1px solid #C8C6C4; background: #FFFFFF; color: #201F1E;
  border-radius: 2px; font-size: 11.5px; white-space: nowrap; overflow: hidden;
}
/* A grade tem foco para receber o teclado, e o contorno do navegador em volta
   dela inteira não diz nada — quem mostra onde está o cursor é a célula. */
.pl-grade-caixa:focus { outline: none; }
.pl-guia-arquivo { background: #217346; color: #FFFFFF; border-radius: 3px 3px 0 0; }
.pl-abas {
  display: flex; align-items: stretch; gap: 2px; padding: 0 8px;
  background: #F3F2F1; border-top: 1px solid #E1DFDD;
}
.pl-aba {
  padding: 5px 14px; font-size: 12px; color: #201F1E; background: transparent;
  border: none; border-top: 2px solid transparent; cursor: pointer;
}
.pl-aba[aria-current="true"] {
  background: #FFFFFF; color: #217346; font-weight: 600; border-top-color: #217346;
}
.pl-aba-mais {
  padding: 5px 10px; font-size: 14px; color: #605E5C; background: transparent;
  border: none; cursor: pointer;
}
.pl-aba-mais:hover { background: #EDEBE9; }

/* ── O que a CC-ES003 acrescentou à grade ──────────────────────────────────

   As três saem do **modelo**, e não do laboratório: a planilha guarda as
   regras, o filtro e quantas linhas estão congeladas, então a mesma grade
   desenha as duas telas e a da AP043 simplesmente não tem nenhuma delas. */

/* As cores da formatação condicional. Elas são escolhidas de uma lista curta,
   e não livres, porque cada uma tem o texto medido contra ela: o vermelho do
   Excel sobre a letra escura dá 9,4:1, o amarelo 13,1:1 e o verde 10,6:1.
   "Escolha qualquer cor" acabaria com vermelho sobre vermelho num exercício em
   que o desbravador não teria como saber que errou. */
.pl-cond-vermelho { background: #FFC7CE; color: #9C0006; }
.pl-cond-amarelo  { background: #FFEB9C; color: #9C6500; }
.pl-cond-verde    { background: #C6EFCE; color: #006100; }

/* A área do relatório de tabela dinâmica.

   Ela precisa **parecer** outra coisa, porque é: o que está ali não foi
   digitado e não se edita na célula. O Excel a pinta com um fundo próprio pelo
   mesmo motivo, e sem essa diferença o desbravador tenta escrever por cima e
   conclui que a planilha travou. Medido contra a letra do Excel (#323130) em
   cima de #F3F2F1: 11,6:1. */
.pl-resumo { background: #F3F2F1; color: #323130; }

/* A linha escondida pelo filtro some da tela e **continua na planilha** —
   display: none na linha, e não remoção: os números das linhas à esquerda
   continuam pulando, que é como se vê que há linha escondida. */
.pl-escondida { display: none; }

/* O congelamento é de tela: a linha congelada gruda no alto enquanto o resto
   rola. O z-index fica acima do cabeçalho de linha, senão a coluna de números passa
   por cima dela ao rolar de lado. */
.pl-congelada td, .pl-congelada th { position: sticky; z-index: 3; background: #FFFFFF; }
.pl-congelada th.pl-cab-lin { z-index: 4; }

/* A alça de preenchimento: o quadradinho no canto da célula ativa. Ela fica
   **fora** do fluxo do texto, senão empurra o conteúdo da célula e a coluna
   parece mais larga do que é. */
.pl-alca-preencher {
  position: absolute; right: -3px; bottom: -3px; width: 7px; height: 7px;
  background: #217346; border: 1px solid #FFFFFF; cursor: crosshair; z-index: 5;
}
.pl-grade td.pl-ativa { position: relative; }

/* A setinha do filtro e a da ordenação moram no cabeçalho, como no Excel. */
.pl-cab-marca {
  display: inline-flex; align-items: center; gap: 2px;
  margin-left: 4px; vertical-align: middle; color: #217346;
}
.pl-cab-bt {
  display: inline-flex; align-items: center; justify-content: center;
  width: 14px; height: 14px; border: none; background: transparent;
  color: #605E5C; cursor: pointer; border-radius: 2px;
}
.pl-cab-bt:hover { background: #E1DFDD; color: #217346; }

/* ── As caixas de diálogo ──────────────────────────────────────────────────

   Formatação condicional, gráfico e filtro abrem caixa, como no Excel. Elas
   sobem no celular pela mesma razão do diálogo do Explorador: a cápsula de
   tarefas mora no canto de baixo, e uma caixa centrada punha Cancelar e OK
   debaixo dela — via-se o formulário inteiro e não se via como confirmar.

   A regra que sobe vem DEPOIS da que centra: as duas têm a mesma
   especificidade, e escrita antes ela não valeria nada, sem nada estourar. */
.pl-veu-dialogo { position: fixed; inset: 0; z-index: 70; background: rgba(0,0,0,.35); }
.pl-dialogo {
  position: fixed; z-index: 71; left: 50%; top: 50%; transform: translate(-50%, -50%);
  background: #FFFFFF; color: #201F1E; border: 1px solid #C8C6C4; border-radius: 4px;
  box-shadow: 0 12px 34px rgba(0,0,0,.3); width: min(420px, calc(100vw - 32px));
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px;
}
.pl-dialogo-titulo {
  padding: 10px 14px; border-bottom: 1px solid #E1DFDD; font-weight: 600; font-size: 13px;
}
.pl-dialogo-corpo { padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.pl-dialogo-pe {
  padding: 10px 14px; border-top: 1px solid #E1DFDD;
  display: flex; justify-content: flex-end; gap: 8px;
}
.pl-campo { display: flex; flex-direction: column; gap: 4px; }
.pl-campo > span { font-size: 11.5px; color: #605E5C; }
.pl-campo input, .pl-campo select {
  border: 1px solid #C8C6C4; border-radius: 2px; padding: 5px 7px;
  font: inherit; background: #FFFFFF; color: #201F1E;
}
.pl-campo input:focus, .pl-campo select:focus { outline: 2px solid #217346; outline-offset: -1px; }
.pl-dialogo-bt {
  padding: 6px 16px; border: 1px solid #C8C6C4; border-radius: 2px;
  background: #F3F2F1; color: #201F1E; font: inherit; cursor: pointer;
}
.pl-dialogo-bt:hover { background: #EDEBE9; }
.pl-dialogo-bt-ok { background: #217346; border-color: #217346; color: #FFFFFF; }
.pl-dialogo-bt-ok:hover { background: #1A5C38; }
.pl-nota {
  background: #FFF4CE; border: 1px solid #E8D26A; border-radius: 3px;
  padding: 8px 10px; font-size: 11.5px; line-height: 1.45; color: #4A3B00;
}

/* A lista de valores do filtro, como a do Excel. */
.pl-filtro-lista {
  position: fixed; z-index: 71; background: #FFFFFF; border: 1px solid #C8C6C4;
  border-radius: 3px; box-shadow: 0 8px 24px rgba(0,0,0,.26);
  min-width: 190px; max-height: 260px; overflow: auto; padding: 4px;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
.pl-filtro-item {
  display: block; width: 100%; text-align: left; padding: 6px 10px;
  border: none; background: transparent; font-size: 12.5px; color: #201F1E;
  border-radius: 2px; cursor: pointer;
}
.pl-filtro-item:hover { background: #EDEBE9; }
.pl-filtro-item[aria-current="true"] { background: #E3EFE8; font-weight: 600; }

/* O gráfico: ele mora sobre a grade, como no Excel, e pode ser arrastado
   para fora do caminho não — arrastar gráfico não é o que a lição cobra, e um
   gesto que existe sem ser cobrado é um caminho a mais para se perder. */
.pl-grafico {
  position: absolute; right: 16px; top: 16px; z-index: 6;
  background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 3px;
  box-shadow: 0 4px 14px rgba(0,0,0,.18); padding: 10px 12px; width: 280px;
}
.pl-grafico-titulo { font-size: 12.5px; font-weight: 600; text-align: center; margin-bottom: 6px; }
.pl-grafico-eixo { font-size: 10.5px; color: #605E5C; text-align: center; }
.pl-grade-caixa { position: relative; }

@media (max-width: 720px) {
  .pl-dialogo { top: 12px; transform: translate(-50%, 0); }
}
`;


export function BarraDeTituloDoExcel({ arquivo, estado = 'Salvo', aoAvisar }: {
  arquivo: string;
  estado?: string;
  aoAvisar: (recado: string) => void;
}) {
  return (
    <div className="pl-titulo">
      <span style={{ color: '#217346', fontWeight: 700, fontSize: 13 }}>▦</span>
      <span style={{ fontWeight: 600 }}>{arquivo}</span>
      <span style={{ color: '#605E5C' }}>— {estado}</span>
      <span className="ml-auto flex items-center gap-2" style={{ color: '#605E5C' }}>
        <button type="button" className="px-1" aria-label="Minimizar"
          onClick={() => aoAvisar('Minimizar não faz parte deste exercício.')}>—</button>
        <button type="button" className="px-1" aria-label="Fechar"
          onClick={() => aoAvisar('Fechar a planilha não faz parte deste exercício.')}>
          <X className="w-3 h-3" />
        </button>
      </span>
    </div>
  );
}

/**
 * A fileira de guias.
 *
 * `usaveis` são as que este laboratório desenha; toda outra guia do Excel
 * aparece assim mesmo, apagada, e responde que existe e não faz parte. Guia que
 * sumisse da fileira ensinaria que o Excel não a tem.
 */
export function GuiasDoExcel({ atual, usaveis, aoTrocar, aoAvisar, aoAbrirArquivo }: {
  atual: string;
  usaveis: readonly string[];
  aoTrocar: (id: string) => void;
  aoAvisar: (recado: string) => void;
  /**
   * Os bastidores, quando o laboratório tem o que pôr neles.
   *
   * É a decisão de `word.tsx`, escrita lá: sem ela, quem precisa da porta —
   * aqui, o Salvar como do requisito 5.4 — redesenha a fileira de guias à mão,
   * que é como a plataforma ficou com dois "Word" uma vez. Sem o laboratório
   * entregar nada, a guia continua avisando que não faz parte do exercício.
   */
  aoAbrirArquivo?: () => void;
}) {
  return (
    <div className="pl-guias" role="tablist">
      <button type="button" className="pl-guia pl-guia-arquivo"
        onClick={() => (aoAbrirArquivo
          ? aoAbrirArquivo()
          : aoAvisar('A guia Arquivo existe no Excel de verdade, e não faz parte deste exercício.'))}>
        Arquivo
      </button>
      {GUIAS_DO_EXCEL.map(nome => (
        usaveis.includes(nome) ? (
          <button key={nome} type="button" role="tab" aria-selected={atual === nome}
            className="pl-guia" onClick={() => aoTrocar(nome)}>{nome}</button>
        ) : (
          <button key={nome} type="button" className="pl-guia" style={{ color: '#8A8886' }}
            onClick={() => aoAvisar(nome === 'Fórmulas'
              ? 'A guia Fórmulas existe no Excel de verdade. Aqui a fórmula se escreve direto na célula, que é como se faz na prática.'
              : `A guia ${nome} existe no Excel de verdade, e não faz parte deste exercício.`)}>
            {nome}
          </button>
        )
      ))}
    </div>
  );
}

/** Grupo da faixa: os botões e, embaixo, o nome — como no Excel. */
export function GrupoDoExcel({ nome, children }: { nome: string; children: React.ReactNode }) {
  return (
    <div className="pl-grupo">
      <div className="pl-grupo-corpo">{children}</div>
      <div className="pl-grupo-nome">{nome}</div>
    </div>
  );
}

/** Botão da faixa. */
export function BotaoDoExcel({ dica, aoClicar, ativo, children }: {
  dica: string; aoClicar: () => void; ativo?: boolean; children: React.ReactNode;
}) {
  return (
    <button type="button" title={dica} aria-label={dica} aria-pressed={ativo}
      onClick={aoClicar} className="pl-bt"
      style={{ background: ativo ? '#E3EFE8' : 'transparent' }}>
      {children}
    </button>
  );
}

/**
 * A fileira de abas do pé.
 *
 * É a fileira que mais diz "isto é uma planilha", e ela não existia no primeiro
 * desenho: o nome da planilha aparecia solto na barra de status, onde ninguém
 * procura por ele.
 */
export function AbasDoExcel({ nome, aoAvisar }: { nome: string; aoAvisar: (r: string) => void }) {
  return (
    <div className="pl-abas">
      <button type="button" className="pl-aba" aria-current="true">{nome}</button>
      <button type="button" className="pl-aba-mais" title="Nova planilha" aria-label="Nova planilha"
        onClick={() => aoAvisar('Acrescentar planilhas existe no programa de verdade, e não faz parte deste exercício.')}>
        +
      </button>
    </div>
  );
}

/**
 * A grade: a peça que mais diz "isto é uma planilha".
 *
 * ── Por que ela saiu de `PlanilhaLab.tsx` ────────────────────────────────
 * Ela morava dentro do laboratório da AP043 — cabeçalhos com letra e número,
 * alças de redimensionar, seleção de faixa por arrasto, edição na célula. A
 * CC-ES003 precisa da mesma grade, e copiá-la é como a plataforma já teve dois
 * "Word" e quase teve dois "Explorador". Saiu **antes** de a cópia existir,
 * que é a decisão de `word.tsx` e de `explorer.tsx`, pelo motivo escrito nos
 * dois.
 *
 * ── O que é do programa e o que é do exercício ───────────────────────────
 * Aqui fica o que é da **planilha**: como uma célula se desenha, onde ficam as
 * alças, o que a faixa selecionada mostra. O que cada laboratório cobra — que
 * botões a faixa oferece, que tarefas se conferem, de que planilha se parte —
 * continua no laboratório.
 *
 * ── E ela não guarda estado ──────────────────────────────────────────────
 * Nem um pedaço. Uma grade com seleção própria obrigaria os dois lados a
 * concordar sobre a mesma célula ativa, que é a forma mais rápida de mostrarem
 * coisas diferentes. É a mesma regra escrita em `explorer.tsx`.
 *
 * ── Formatação condicional, filtro e congelamento saem do modelo ─────────
 * A planilha guarda as regras, o filtro e quantas linhas estão congeladas,
 * então a mesma grade desenha as duas telas — e a da AP043 simplesmente não
 * tem nenhuma das três. Sem isso, cada laboratório teria de dizer à grade como
 * pintar, e dois laboratórios pintariam diferente.
 */
export interface PropsDaGradeDoExcel {
  planilha: Planilha;
  /**
   * A pasta inteira, quando o laboratório tem mais de uma aba.
   *
   * É o que faz `=SOMA(Respostas!E2:E17)` achar o que somar. Sem ela a fórmula
   * que nomeia aba responde #NOME?, e a lição do requisito 3 da CC-ES008 —
   * a base numa aba, o total na outra — pediria uma fórmula quebrada.
   */
  caderno?: Caderno;
  /** A faixa selecionada, da âncora até onde o arrasto parou. */
  faixa: Faixa;
  /** A célula ativa: onde o cursor está, e onde a edição acontece. */
  ativa: { l: number; c: number };
  /**
   * O texto em edição, ou `null` quando não se está editando **na célula**.
   *
   * A distinção é o defeito que custou caro na AP043: a barra de fórmulas
   * ligava o modo de edição, a célula passava a desenhar um campo com
   * `autoFocus`, e esse campo roubava o foco a cada tecla. Só quem começou a
   * editar na célula recebe o campo.
   */
  rascunho: string | null;
  gradeRef: React.RefObject<HTMLDivElement>;

  aoTeclar: (e: React.KeyboardEvent) => void;
  aoApontarCelula: (l: number, c: number, e: React.PointerEvent) => void;
  aoEntrarNaCelula: (l: number, c: number) => void;
  aoApontarColuna: (c: number, e: React.PointerEvent) => void;
  aoApontarLinha: (l: number, e: React.PointerEvent) => void;
  aoMoverPonteiro: (e: React.PointerEvent) => void;
  aoSoltarPonteiro: () => void;
  aoSairDaGrade: () => void;

  aoAbrirEdicao: (texto: string) => void;
  aoEscrever: (texto: string) => void;
  aoConfirmar: (texto: string, direcao?: Direcao) => void;
  aoCancelar: () => void;

  /** Menu do botão direito. Sem ele, a grade não abre menu nenhum. */
  aoContexto?: (e: React.MouseEvent, alvo: 'celula' | 'coluna' | 'linha', l: number, c: number) => void;
  /** Arrastar a borda do cabeçalho. Sem ele, as alças de tamanho não aparecem. */
  aoArrastarBorda?: (tipo: 'coluna' | 'linha', indice: number, e: React.PointerEvent) => void;
  aoAjustarAoConteudo?: (tipo: 'coluna' | 'linha', indice: number) => void;
  /**
   * O começo do arrasto da alça de preenchimento. Quem não o passa não desenha
   * a alça — é a regra do `aoBuscar` do Explorador: a peça existe quando o
   * laboratório tem o que fazer com ela.
   *
   * Ela **começa** um arrasto, e não preenche: no Excel se arrasta a alça até
   * onde a fórmula deve ir, e a faixa cresce debaixo do ponteiro. A primeira
   * versão daqui preenchia no clique e exigia a faixa já selecionada, que é o
   * gesto ao contrário — e ninguém que conhece Excel o descobriria.
   */
  aoComecarPreenchimento?: (origem: { l: number; c: number }) => void;
  /** Quais células o estilo de tabela pinta. Só a AP043 usa. */
  naTabela?: (l: number, c: number) => boolean;
  /** A setinha do filtro no cabeçalho. Sem ela, o cabeçalho não tem botão. */
  aoAbrirFiltro?: (c: number) => void;
}

export function GradeDoExcel({
  planilha: p, caderno, faixa, ativa, rascunho, gradeRef,
  aoTeclar, aoApontarCelula, aoEntrarNaCelula, aoApontarColuna, aoApontarLinha,
  aoMoverPonteiro, aoSoltarPonteiro, aoSairDaGrade,
  aoAbrirEdicao, aoEscrever, aoConfirmar, aoCancelar,
  aoContexto, aoArrastarBorda, aoAjustarAoConteudo, aoComecarPreenchimento, naTabela, aoAbrirFiltro,
}: PropsDaGradeDoExcel) {
  return (
    <div
      ref={gradeRef}
      className="pl-grade-caixa"
      tabIndex={0}
      onKeyDown={aoTeclar}
      onPointerMove={aoMoverPonteiro}
      onPointerUp={aoSoltarPonteiro}
      onPointerLeave={aoSairDaGrade}>
      <table className={`pl-grade pl-layout-${p.layout}`}>
        <thead>
          <tr>
            <th className="pl-canto" />
            {p.larguras.map((w, c) => (
              <th key={c} className="pl-cab-col" style={{ width: w, minWidth: w }}
                onPointerDown={e => aoApontarColuna(c, e)}
                onContextMenu={e => aoContexto?.(e, 'coluna', 0, c)}>
                {nomeDaColuna(c)}
                {p.ordenacao?.coluna === c && (
                  <span className="pl-cab-marca" aria-label={p.ordenacao.crescente ? 'ordenada de A a Z' : 'ordenada de Z a A'}>
                    {p.ordenacao.crescente ? <ArrowDownAZ className="w-3 h-3" /> : <ArrowUpZA className="w-3 h-3" />}
                  </span>
                )}
                {aoAbrirFiltro && ehCabecalhoDaTabela(p, c) && (
                  <button type="button" className="pl-cab-bt"
                    title={`Filtrar a coluna ${nomeDaColuna(c)}`}
                    aria-label={`Filtrar a coluna ${nomeDaColuna(c)}`}
                    onPointerDown={e => e.stopPropagation()}
                    onClick={() => aoAbrirFiltro(c)}>
                    <Filter className="w-3 h-3" style={{ color: p.filtro?.coluna === c && p.filtro.valor ? '#217346' : undefined }} />
                  </button>
                )}
                {aoArrastarBorda && (
                  <span
                    className="pl-alca-col"
                    title="Arraste para mudar a largura, ou dois cliques para caber o conteúdo"
                    onPointerDown={e => aoArrastarBorda('coluna', c, e)}
                    onDoubleClick={() => aoAjustarAoConteudo?.('coluna', c)} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {p.celulas.map((linha, l) => (
            <tr
              key={l}
              style={{ height: p.alturas[l], top: l < p.congeladas ? l * p.alturas[0] : undefined }}
              className={[
                linhaEscondida(p, l) ? 'pl-escondida' : '',
                l < p.congeladas ? 'pl-congelada' : '',
              ].filter(Boolean).join(' ')}>
              <th className="pl-cab-lin"
                onPointerDown={e => aoApontarLinha(l, e)}
                onContextMenu={e => aoContexto?.(e, 'linha', l, 0)}>
                {l + 1}
                {aoArrastarBorda && (
                  <span
                    className="pl-alca-lin"
                    title="Arraste para mudar a altura, ou dois cliques para o AutoAjuste"
                    onPointerDown={e => aoArrastarBorda('linha', l, e)}
                    onDoubleClick={() => aoAjustarAoConteudo?.('linha', l)} />
                )}
              </th>
              {linha.map((cel, c) => {
                if (cel.coberta) return null;
                const ancora = ativa.l === l && ativa.c === c;
                const dentro = naFaixa(faixa, l, c);
                /* O valor primeiro, e o texto a partir dele: o alinhamento
                   pergunta o **tipo**, e imprimir joga o tipo fora. */
                const valor = valorCalculado(p, l, c, caderno);
                /*
                  O resumo é desenhado **por cima** da célula, e ganha dela.

                  Ele não está escrito nas células — está no modelo, como o
                  filtro e a formatação condicional —, e por isso a grade o
                  pinta aqui. Quem o guarda é `planilha.resumo`; quem o mexe é
                  o botão Atualizar. Ele vence o texto porque no Excel aquela
                  área é do relatório: o que estiver por baixo não aparece, e
                  mostrar o de baixo faria a tela discordar do retrato.
                */
                const doResumo = textoDoResumo(p, l, c);
                const mostrado = doResumo ?? mostrar(valor);
                const h = doResumo !== null ? 'esquerda' : alinhamentoDe(cel, valor);
                const cond = estiloCondicional(p, l, c);
                return (
                  <td
                    key={c}
                    colSpan={cel.span}
                    /* Apontar começa a faixa, arrastar a estende e soltar a
                       fecha — o mesmo gesto da planilha de verdade. Sem ele não
                       havia como dizer "de A1 até D1". */
                    onPointerDown={e => aoApontarCelula(l, c, e)}
                    onContextMenu={e => aoContexto?.(e, 'celula', l, c)}
                    onPointerEnter={() => aoEntrarNaCelula(l, c)}
                    className={[
                      ancora ? 'pl-ativa' : '',
                      dentro && !ancora ? 'pl-na-faixa' : '',
                      naTabela?.(l, c) ? 'pl-na-tabela' : '',
                      doResumo !== null ? 'pl-resumo' : '',
                      cond ? `pl-cond-${cond}` : '',
                    ].filter(Boolean).join(' ')}
                    style={{
                      textAlign: h === 'centro' ? 'center' : h === 'direita' ? 'right' : 'left',
                      verticalAlign: cel.v === 'meio' ? 'middle' : cel.v === 'acima' ? 'top' : 'bottom',
                      fontWeight: cel.negrito ? 700 : 400,
                    }}>
                    {/* O autoFocus é só de quem começou a editar *na célula*:
                        dado à célula durante a digitação na barra, era ele que
                        roubava o foco a cada tecla. */}
                    {ancora && rascunho !== null && doResumo === null ? (
                      <input
                        className="pl-celula-entrada"
                        autoFocus
                        value={rascunho}
                        onChange={e => aoEscrever(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { e.preventDefault(); aoConfirmar(rascunho, e.shiftKey ? 'cima' : 'baixo'); gradeRef.current?.focus(); }
                          if (e.key === 'Tab') { e.preventDefault(); aoConfirmar(rascunho, e.shiftKey ? 'esquerda' : 'direita'); gradeRef.current?.focus(); }
                          if (e.key === 'Escape') { e.preventDefault(); aoCancelar(); gradeRef.current?.focus(); }
                        }}
                        onBlur={() => aoConfirmar(rascunho)} />
                    ) : (
                      <span
                        onDoubleClick={() => doResumo === null && aoAbrirEdicao(cel.texto)}
                        className="pl-valor">
                        {mostrado}
                      </span>
                    )}
                    {ancora && aoComecarPreenchimento && rascunho === null && (
                      <span
                        className="pl-alca-preencher"
                        title="Arraste para preencher as células abaixo ou ao lado"
                        aria-label="Alça de preenchimento"
                        onPointerDown={e => {
                          e.stopPropagation();
                          e.preventDefault();
                          aoComecarPreenchimento({ l, c });
                        }} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A coluna faz parte do cabeçalho da tabela declarada.
 *
 * A setinha do filtro só aparece onde há o que filtrar. Pô-la em toda coluna
 * prometeria filtrar a coluna vazia da direita, que é um gesto sem efeito — e
 * gesto sem efeito é o que ensina a pessoa a desconfiar do programa.
 */
function ehCabecalhoDaTabela(p: Planilha, c: number): boolean {
  if (!p.tabela) return false;
  const esq = Math.min(p.tabela.c1, p.tabela.c2);
  const dir = Math.max(p.tabela.c1, p.tabela.c2);
  return c >= esq && c <= dir;
}

/* ── O gráfico ─────────────────────────────────────────────────────────────

   Ele saiu de dentro dos laboratórios, e aqui a regra da casa chegou tarde:
   não havia uma cópia a caminho, havia **duas** já escritas, e elas já tinham
   divergido.

   A da CC-ES003 lia a faixa da planilha e desenhava certo — mas só a pizza
   tinha ramo próprio, e `linha` e `dispersão` caíam no ramo das colunas. Quem
   escolhia "linha" via barras. A da AP044 desenhava uma pizza de
   `conic-gradient` com porcentagens fixas, que não vinham de dado nenhum, e as
   outras três liam uma constante do módulo em vez da planilha aberta.

   Nenhuma das duas estoura, e é por isso que elas sobreviveram: um gráfico
   errado é um gráfico. O preço aparece na CC-ES009, cujo requisito 6 é
   exatamente "a pizza responde composição e a linha responde evolução" — com
   o desenho de antes, escolher a linha desenhava colunas e a lição inteira
   media ter clicado em Inserir.

   O que mora aqui é do **programa**: como uma pizza, uma coluna, uma linha e
   uma dispersão se desenham, e onde o eixo começa. O que fica em cada
   laboratório é do **exercício**: de onde saem os pontos e o que se cobra
   deles. Como as outras peças desta janela, ela não guarda estado nenhum.
*/

const CORES_DO_GRAFICO = ['#217346', '#4C8C6B', '#8AB79A', '#C13516', '#D98C6A', '#7A6FAE'];

/* A caixa de desenho. A calha da esquerda é dos rótulos do eixo dos valores:
   sem eles não há como ler onde o eixo começa, e um eixo truncado que ninguém
   consegue ler deixa de ser um recurso a apontar e vira um desenho errado. */
const ESQ = 22, DIR = 136, ALTO = 6, PISO = 58;

export function DesenhoDoGrafico({ tipo, pontos, eixo, altura = 90 }: {
  tipo: TipoDeGrafico;
  pontos: PontoDoGrafico[];
  eixo?: EixoDoGrafico;
  altura?: number;
}) {
  if (pontos.length === 0) return null;

  if (tipo === 'pizza') return <Pizza pontos={pontos} altura={altura} />;

  const valores = pontos.map(p => p.valor);
  /* O piso é o que `eixo.minimo` diz, e o teto o que `eixo.maximo` diz. O
     padrão de um é zero e o do outro é o maior valor — e `|| 1` porque uma
     série toda igual daria faixa zero e divisão por zero desenharia nada. */
  const piso = eixo?.minimo ?? 0;
  const teto = eixo?.maximo ?? Math.max(...valores, piso + 1);
  const faixa = teto - piso || 1;
  /* Valor abaixo do piso some do desenho, que é o que o Excel faz: o eixo
     cortado corta o que fica embaixo dele, sem escrever nada. */
  const y = (v: number) => PISO - (Math.min(Math.max(v, piso), teto) - piso) / faixa * (PISO - ALTO);
  const passo = (DIR - ESQ) / Math.max(pontos.length, 1);
  const x = (i: number) => ESQ + passo * (i + 0.5);

  return (
    <svg viewBox="0 0 140 74" style={{ width: '100%', height: altura }}
      role="img" aria-label={descrever(tipo, pontos, piso, teto)}>
      <line x1={ESQ} y1={ALTO} x2={ESQ} y2={PISO} stroke="#C8C6C4" strokeWidth={0.6} />
      <line x1={ESQ} y1={PISO} x2={DIR} y2={PISO} stroke="#C8C6C4" strokeWidth={0.6} />
      <text x={ESQ - 2} y={PISO + 2} fontSize={5} fill="#605E5C" textAnchor="end">{rotuloDoEixo(piso)}</text>
      <text x={ESQ - 2} y={ALTO + 4} fontSize={5} fill="#605E5C" textAnchor="end">{rotuloDoEixo(teto)}</text>

      {tipo === 'colunas' && pontos.map((p, i) => {
        const largura = Math.min(16, passo * 0.7);
        return (
          <rect key={`${p.rotulo}-${i}`} x={x(i) - largura / 2} y={y(p.valor)}
            width={largura} height={Math.max(PISO - y(p.valor), 0)}
            fill={CORES_DO_GRAFICO[i % CORES_DO_GRAFICO.length]} />
        );
      })}

      {tipo === 'linha' && (
        <polyline fill="none" stroke={CORES_DO_GRAFICO[0]} strokeWidth={1.4}
          points={pontos.map((p, i) => `${x(i)},${y(p.valor)}`).join(' ')} />
      )}

      {/* A linha marca os pontos e a dispersão só tem pontos: é a diferença
          entre as duas, e desenhar a dispersão ligada afirmaria uma sequência
          que ela não tem. */}
      {(tipo === 'linha' || tipo === 'dispersao') && pontos.map((p, i) => (
        <circle key={`${p.rotulo}-${i}`} cx={x(i)} cy={y(p.valor)} r={1.6} fill={CORES_DO_GRAFICO[0]} />
      ))}

      {pontos.map((p, i) => (
        <text key={`r-${p.rotulo}-${i}`} x={x(i)} y={PISO + 8} fontSize={4.6} fill="#605E5C"
          textAnchor="middle">{p.rotulo.slice(0, 8)}</text>
      ))}
    </svg>
  );
}

function Pizza({ pontos, altura }: { pontos: PontoDoGrafico[]; altura: number }) {
  /* Fatia negativa não existe numa pizza, e o Excel a descarta em silêncio:
     somar o módulo dela daria um total que nenhuma fatia explica. Zero é outra
     coisa — ele não tem fatia, porque não ocupa parte nenhuma do todo, **e
     continua na legenda**, porque a categoria existe e a composição dela é de
     0%. Tirá-lo da legenda faria a unidade sem inscrito nenhum sumir da tela,
     que é o que o gráfico de colunas logo acima deixou de fazer.

     Por isso a cor sai da posição em `pontos`, e não em uma lista filtrada: com
     duas listas, a legenda e as fatias começariam a discordar de cor na
     primeira categoria zerada. */
  const total = pontos.reduce((s, p) => s + Math.max(p.valor, 0), 0);
  if (total === 0) return null;
  let inicio = 0;
  const cor = (i: number) => CORES_DO_GRAFICO[i % CORES_DO_GRAFICO.length];
  return (
    <svg viewBox="0 0 140 74" style={{ width: '100%', height: altura }}
      role="img" aria-label={descrever('pizza', pontos)}>
      {pontos.map((p, i) => {
        if (p.valor <= 0) return null;
        const angulo = (p.valor / total) * 360;
        const d = arcoDaPizza(38, 37, 30, inicio, inicio + angulo);
        inicio += angulo;
        return <path key={`${p.rotulo}-${i}`} d={d} fill={cor(i)} />;
      })}
      {/* A legenda encolhe para caber, e não corta.

          Ela era `slice(0, 5)`, o que nunca apareceu enquanto a CC-ES003
          desenhava quatro categorias. Com os seis meses da AP044, a fatia
          **maior** — Junho, quase metade da pizza — ficava sem nome nenhum,
          e o gráfico continuava parecendo um gráfico. Uma pizza com fatia
          anônima é a mesma família da unidade que some por valer zero.

          Acima de umas oito categorias a pizza deixa de responder qualquer
          pergunta, e aí o problema não é a legenda. */}
      {pontos.map((p, i) => {
        const linha = Math.min(11, 62 / Math.max(pontos.length, 1));
        return (
          <g key={`l-${p.rotulo}-${i}`}>
            <rect x={80} y={8 + i * linha} width={Math.min(7, linha * 0.64)}
              height={Math.min(7, linha * 0.64)} fill={cor(i)} />
            <text x={91} y={13.4 + i * linha} fontSize={Math.min(5.4, linha * 0.52)}
              fill="#201F1E">{p.rotulo.slice(0, 11)}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** O número do eixo, com a vírgula decimal que o português usa. */
const rotuloDoEixo = (v: number) =>
  (Number.isInteger(v) ? String(v) : v.toFixed(1)).replace('.', ',');

/*
 * O que o gráfico diz a quem não o vê.
 *
 * Ele diz os valores **e** onde o eixo começa, que é o que alguém lendo o
 * desenho também consegue ler na calha da esquerda. Dizer só os valores
 * esconderia de quem usa leitor de tela justamente o recurso que o requisito 7
 * manda apontar; dizer "este gráfico engana" poria na nossa tela a resposta
 * que a lição existe para a pessoa achar.
 */
function descrever(tipo: TipoDeGrafico, pontos: PontoDoGrafico[], piso?: number, teto?: number): string {
  const nome = { pizza: 'pizza', colunas: 'colunas', linha: 'linha', dispersao: 'dispersão' }[tipo];
  const eixo = piso === undefined || teto === undefined
    ? ''
    : ` O eixo dos valores vai de ${rotuloDoEixo(piso)} a ${rotuloDoEixo(teto)}.`;
  const itens = pontos.map(p => `${p.rotulo}: ${rotuloDoEixo(p.valor)}`).join('; ');
  return `Gráfico de ${nome}.${eixo} ${itens}.`;
}

/**
 * Uma fatia de pizza, em caminho SVG.
 *
 * Os ângulos começam no topo e crescem no sentido do relógio, que é como a
 * pizza do Excel é desenhada — começar à direita deixaria a primeira fatia num
 * lugar que ninguém reconhece.
 */
function arcoDaPizza(cx: number, cy: number, r: number, de: number, ate: number): string {
  const ponto = (grau: number) => {
    const rad = ((grau - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [x1, y1] = ponto(de);
  const [x2, y2] = ponto(ate);
  const grande = ate - de > 180 ? 1 : 0;
  /* Uma fatia sozinha fecharia em si mesma e não desenharia nada: um arco de
     360° tem começo e fim no mesmo ponto. O círculo inteiro vira dois arcos. */
  if (ate - de >= 359.9) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${grande} 1 ${x2} ${y2} Z`;
}
