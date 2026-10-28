import { ArrowDownAZ, ArrowUpZA, Check, ChevronDown, ChevronLeft, ChevronRight, Filter, MoreHorizontal, Plus, X } from 'lucide-react';
import {
  CSS_OFFICE, BarraDeTituloDoOffice, GuiasDoOffice, ModosDeExibicao, ZoomDoOffice, AcessibilidadeDoStatus,
} from './office';
import {
  type Caderno, type Direcao, type Faixa, type Planilha,
  alinhamentoDe, estiloCondicional, linhaEscondida, mostrar, naFaixa, nomeDaColuna, nomeDaCelula, normalizar,
  textoDoResumo, valorCalculado, contaDaSelecao,
  type TipoDeGrafico, type PontoDoGrafico, type PontoDeDispersao, type EixoDoGrafico,
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
  'Página Inicial', 'Inserir', 'Desenhar', 'Layout da Página', 'Fórmulas',
  'Dados', 'Revisão', 'Exibir', 'Ajuda',
] as const;

/*
  A planilha genérica: o verde da guia, o cinza dos cabeçalhos, a borda grossa
  da célula ativa. As três planilhas que o desbravador pode encontrar arrumam
  isso do mesmo jeito, e é o arranjo que ele precisa reconhecer.
*/
export const CSS_EXCEL = `
/* Posicionada, porque a caixa do gráfico ancora nela. Sem isto o gráfico
   ancorava na moldura da tela inteira, e o right: 16px dele o punha em cima
   do painel de tarefas — cobrindo a tarefa que mandava fazer o gráfico. */
.pl-janela {
  position: relative;
  background: #F3F2F1; color: #201F1E;
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
}
/* Barra de título e guias: as do Microsoft 365, em office.tsx. */
.pl-titulo, .pl-guias, .pl-guia { font-size: 12px; }
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

/* A barra de fórmulas do Microsoft 365: a caixa de nome com a setinha, o
   pontilhado de arrastar, os três botões (cancelar, inserir e fx) e o campo
   com a setinha de expandir no fim. Os dois primeiros só acendem durante a
   edição, como no Excel — é por eles que se vê que a célula está em edição. */
.pl-formula {
  display: flex; align-items: center; gap: 0; padding: 4px 8px 6px;
  background: #F3F3F3; flex: none;
}
.pl-nome {
  display: inline-flex; align-items: center; justify-content: space-between; gap: 4px;
  width: 92px; height: 24px; font-size: 12px; padding: 0 4px 0 7px;
  border: 1px solid #D1D1D1; border-radius: 4px 0 0 4px; background: #FFFFFF; color: #242424;
}
.pl-formula-meio {
  display: inline-flex; align-items: center; height: 24px; padding: 0 2px;
  background: #FFFFFF; border-top: 1px solid #D1D1D1; border-bottom: 1px solid #D1D1D1; color: #616161;
}
.pl-formula-bt {
  width: 24px; height: 22px; display: grid; place-items: center; border: none; background: transparent;
  color: #616161; cursor: pointer; border-radius: 3px;
}
.pl-formula-bt:hover:not(:disabled) { background: #EBEBEB; }
.pl-formula-bt:disabled { color: #BDBDBD; cursor: default; }
.pl-pontilhado { width: 8px; text-align: center; color: #9E9E9E; letter-spacing: -1px; font-size: 11px; }
.pl-fx { font-style: italic; font-family: Georgia, 'Times New Roman', serif; color: #424242; font-size: 13px; }
.pl-entrada {
  flex: 1; min-width: 0; height: 24px; border: 1px solid #D1D1D1; border-radius: 0; padding: 0 6px;
  font-size: 12.5px; font-family: inherit; background: #FFFFFF; color: #242424;
}
.pl-formula-expandir {
  height: 24px; width: 22px; display: grid; place-items: center; background: #FFFFFF; color: #616161;
  border: 1px solid #D1D1D1; border-left: none; border-radius: 0 4px 4px 0; cursor: pointer;
}
.pl-entrada:focus { outline: 1px solid #217346; }

.pl-grade-caixa { flex: 1; min-height: 0; overflow: auto; background: #FFFFFF; padding-bottom: 20px; }
.pl-grade { border-collapse: collapse; table-layout: fixed; }
.pl-canto {
  width: 34px; background: #F5F5F5; border: 1px solid #D4D4D4; position: sticky; left: 0; z-index: 2;
  /* O triângulo no canto de baixo é o "selecionar tudo" do Excel. */
  background-image: linear-gradient(135deg, transparent 62%, #B5B5B5 62%, #B5B5B5 82%, transparent 82%);
}
.pl-cab-col, .pl-cab-lin {
  background: #F5F5F5; border: 1px solid #D4D4D4; color: #424242;
  font-size: 11.5px; font-weight: 400; position: relative;
}
/* O cabeçalho da coluna e da linha selecionadas acende, com a borda verde do
   lado que encosta na grade: é assim que o Excel diz onde está o cursor sem
   ninguém ler a caixa de nome. */
.pl-cab-col.pl-cab-ativo { background: #D3F0E0; color: #0E5C2F; font-weight: 600; box-shadow: inset 0 -2px 0 #217346; }
.pl-cab-lin.pl-cab-ativo { background: #D3F0E0; color: #0E5C2F; font-weight: 600; box-shadow: inset -2px 0 0 #217346; }
.pl-cab-col { height: 20px; }
.pl-cab-lin { width: 34px; position: sticky; left: 0; z-index: 1; }
/* As alças ficam por cima da borda do cabeçalho, como na planilha de verdade:
   é ali que o ponteiro vira seta dupla. */
.pl-alca-col { position: absolute; top: 0; right: -3px; width: 7px; height: 100%; cursor: col-resize; }
.pl-alca-lin { position: absolute; left: 0; bottom: -3px; height: 7px; width: 100%; cursor: row-resize; }

.pl-grade td {
  border: 1px solid #E1E1E1; padding: 2px 5px; font-size: 12.5px;
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
  display: flex; align-items: center; gap: 14px; padding: 3px 10px; min-height: 26px; flex: none;
  background: #F3F3F3; border-top: 1px solid #E0E0E0; font-size: 11.5px; color: #424242;
}
.pl-agregados { display: inline-flex; gap: 16px; white-space: nowrap; }
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
.pl-guia-arquivo { letter-spacing: 0; }
.pl-abas {
  display: flex; align-items: stretch; gap: 0; padding: 0 8px 0 4px; min-height: 30px; flex: none;
  background: #F3F3F3; border-top: 1px solid #E0E0E0; overflow-x: auto;
}
/* As setas de rolar as abas e as reticências ficam à esquerda, antes delas,
   como no Excel. */
.pl-abas-nav { display: flex; align-items: center; gap: 0; padding-right: 6px; flex: none; }
.pl-abas-nav button {
  width: 22px; height: 22px; display: grid; place-items: center; border: none; background: transparent;
  color: #616161; cursor: pointer; border-radius: 3px;
}
.pl-abas-nav button:hover { background: #E1E1E1; }
.pl-aba {
  position: relative; padding: 0 16px; font-size: 12px; color: #242424; background: transparent;
  border: none; border-right: 1px solid #E0E0E0; cursor: pointer; white-space: nowrap;
}
.pl-aba:hover { background: #EBEBEB; }
.pl-aba[aria-current="true"] { background: #FFFFFF; color: #217346; font-weight: 600; }
.pl-aba[aria-current="true"]::after {
  content: ''; position: absolute; left: 12px; right: 12px; bottom: 3px; height: 2px;
  border-radius: 1px; background: #217346;
}
.pl-aba-mais {
  align-self: center; margin-left: 8px; width: 22px; height: 22px; border-radius: 50%;
  display: grid; place-items: center; color: #616161; background: transparent;
  border: 1px solid #9E9E9E; cursor: pointer; flex: none; padding: 0;
}
.pl-aba-mais:hover { background: #E1E1E1; }

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
/* Escrito com a tabela e a linha na frente para vencer as regras que põem a
   célula ativa e a da setinha do filtro em position: relative — com a mesma
   especificidade elas venciam, e o cabeçalho com setinha rolava embora. */
.pl-grade tr.pl-congelada td, .pl-grade tr.pl-congelada th { position: sticky; top: inherit; z-index: 3; background: #FFFFFF; }
.pl-grade tr.pl-congelada th.pl-cab-lin { z-index: 4; background: #F5F5F5; }
/* A linha cinza-escura embaixo da última linha presa é como o Excel mostra
   onde o congelamento corta. */
.pl-congelada-ultima td, .pl-congelada-ultima th { box-shadow: inset 0 -1px 0 #8A8886; }
/* As letras das colunas nunca saem do alto, congelado ou não — é por elas que
   se lê o endereço de uma célula na linha 80. */
.pl-grade thead th { position: sticky; top: 0; z-index: 5; }
.pl-grade thead th.pl-canto { z-index: 6; }

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
/* A setinha do filtro, no canto direito da célula do cabeçalho: um quadradinho
   cinza com borda, como o do Excel. A célula reserva o espaço dela à direita
   para o texto não passar por baixo. */
.pl-grade td:has(> .pl-filtro-seta) { position: relative; padding-right: 22px; }
.pl-filtro-seta {
  position: absolute; right: 2px; top: 50%; transform: translateY(-50%);
  width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid #C8C6C4; background: #F3F2F1; color: #424242; border-radius: 2px; cursor: pointer;
}
.pl-filtro-seta:hover { background: #E1DFDD; border-color: #8A8886; }

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
/* Escolhido, o gráfico ganha a moldura e os títulos viram campos de escrever,
   como no Excel: o título se edita no lugar, e não numa caixa à parte. */
.pl-grafico[data-escolhido="sim"] { outline: 2px solid #217346; outline-offset: 1px; }
.pl-grafico-campo {
  display: block; width: 100%; border: 1px dashed transparent; background: transparent;
  text-align: center; color: #201F1E; font: inherit; padding: 1px 2px;
}
.pl-grafico[data-escolhido="sim"] .pl-grafico-campo { border-color: #A19F9D; }
.pl-grafico-campo::placeholder { color: #605E5C; }
.pl-grade-caixa { position: relative; }
/* O gráfico flutua no canto da área das células, e rola com elas. */
.pl-sobre-a-grade { position: absolute; top: 0; right: 0; z-index: 6; }
.pl-sobre-a-grade .pl-grafico { position: relative; top: 36px; right: 16px; }

@media (max-width: 720px) {
  .pl-dialogo { top: 12px; transform: translate(-50%, 0); }
}
${CSS_OFFICE}
`;


export function BarraDeTituloDoExcel({ arquivo, estado = 'Salvo', aoAvisar, aoDesfazer, aoRefazer }: {
  arquivo: string;
  estado?: string;
  aoAvisar: (recado: string) => void;
  aoDesfazer?: () => void;
  aoRefazer?: () => void;
}) {
  return (
    <BarraDeTituloDoOffice app="excel" classe="pl-titulo" arquivo={arquivo} estado={estado}
      aoAvisar={aoAvisar} aoDesfazer={aoDesfazer} aoRefazer={aoRefazer} />
  );
}

/**
 * A fileira de guias.
 *
 * `usaveis` são as que este laboratório desenha; toda outra guia do Excel
 * aparece assim mesmo, apagada, e responde que existe e não faz parte. Guia que
 * sumisse da fileira ensinaria que o Excel não a tem.
 */
export function GuiasDoExcel({ atual, usaveis, contextuais, aoTrocar, aoAvisar, aoAbrirArquivo }: {
  atual: string;
  usaveis: readonly string[];
  /** As guias que só existem com algo escolhido — Design do Gráfico, com o gráfico. */
  contextuais?: readonly { id: string; nome: string }[];
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
    <GuiasDoOffice app="excel" classe="pl-guias" classeDaGuia="pl-guia" classeDoArquivo="pl-guia-arquivo"
      guias={GUIAS_DO_EXCEL} atual={atual} usaveis={usaveis} contextuais={contextuais}
      aoTrocar={aoTrocar} aoAvisar={aoAvisar} aoAbrirArquivo={aoAbrirArquivo}
      /* A guia Fórmulas tem uma razão própria a dizer, e diz ao abrir: a
         faixa dela existe inteira, mas aqui a fórmula se escreve na célula. */
      recadoDaGuia={nome => (nome === 'Fórmulas'
        ? 'A guia Fórmulas existe no Excel de verdade. Aqui a fórmula se escreve direto na célula, que é como se faz na prática.'
        : undefined)} />
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
/**
 * A fileira de abas do pé.
 *
 * Ela estava escrita **cinco** vezes: aqui, para a pasta de uma planilha só, e
 * à mão dentro de quatro laboratórios, para as de várias. As cinco já tinham
 * divergido no lugar mais visível — o botão "+" aparecia em duas e faltava nas
 * outras três, e a mesma suíte mostrava dois Excel diferentes conforme a
 * lição. Agora é uma, e é a decisão de `word.tsx` e de `explorer.tsx`, pelo
 * motivo escrito nos dois.
 *
 * `aoTrocar` entra pela **presença do setter**, como o `aoBuscar` do
 * Explorador: sem ele a pasta é de uma planilha só e as abas não trocam de
 * nada — prometer o gesto numa pasta com uma aba seria prometer um clique que
 * não muda nada. O "+" fica sempre, porque o programa tem todos os comandos o
 * tempo todo.
 */
/**
 * A barra de fórmulas: a caixa de nome, o `fx`, e o campo.
 *
 * Ela estava escrita **cinco** vezes, uma em cada laboratório de planilha, e
 * as cinco idênticas — o que é sorte, e não garantia: `propsDaBarra` já mora
 * no gancho justamente porque o que a barra **faz** não pode divergir, e o
 * que ela **é** continuava solto. É a decisão de `AbasDoExcel` logo abaixo e
 * de `word.tsx`, pelo motivo escrito nos dois.
 *
 * O que a barra faz continua no gancho, junto da edição na célula: as duas
 * dividem o mesmo `barra`, o mesmo `editando` e a mesma guarda de
 * cancelamento, e escrever uma delas por fora custaria justamente essa
 * guarda.
 */
export function BarraDeFormulas({ nome, props, editando, aoCancelar, aoConfirmar, aoAvisar }: {
  /** O nome da faixa selecionada, por `nomeDaFaixa`. */
  nome: string;
  props: React.ComponentProps<'input'>;
  /**
   * Se há edição em curso. Acende o ✕ e o ✓, que no Excel ficam cinzentos
   * enquanto não há o que cancelar nem confirmar. Sem o laboratório dizer,
   * a barra deduz do foco no campo dela.
   */
  editando?: boolean;
  aoCancelar?: () => void;
  aoConfirmar?: () => void;
  aoAvisar?: (r: string) => void;
}) {
  const avisar = (r: string) => aoAvisar?.(`${r} existe no Excel de verdade, e não faz parte deste exercício.`);
  return (
    <div className="pl-formula">
      <span className="pl-nome" aria-label="Caixa de nome">
        <span className="truncate">{nome}</span>
        <ChevronDown className="w-3 h-3" style={{ color: '#616161', flex: 'none' }} aria-hidden="true" />
      </span>
      <span className="pl-formula-meio">
        <span className="pl-pontilhado" aria-hidden="true">⋮</span>
        <button type="button" className="pl-formula-bt" aria-label="Cancelar" title="Cancelar"
          disabled={!editando} onClick={aoCancelar}>
          <X className="w-3.5 h-3.5" />
        </button>
        <button type="button" className="pl-formula-bt" aria-label="Inserir" title="Inserir"
          disabled={!editando} onClick={aoConfirmar}>
          <Check className="w-3.5 h-3.5" />
        </button>
        <button type="button" className="pl-formula-bt" aria-label="Inserir Função" title="Inserir Função"
          onClick={() => avisar('A caixa Inserir Função')}>
          <span className="pl-fx">fx</span>
        </button>
      </span>
      <input
        className="pl-entrada"
        aria-label="Barra de fórmulas"
        placeholder="Escreva aqui, ou uma fórmula começando por ="
        {...props} />
      <button type="button" className="pl-formula-expandir" aria-label="Expandir a Barra de Fórmulas"
        title="Expandir a Barra de Fórmulas" onClick={() => avisar('Expandir a barra de fórmulas')}>
        <ChevronDown className="w-3 h-3" />
      </button>
    </div>
  );
}

export function AbasDoExcel({ nomes, ativa = 0, aoTrocar, aoAvisar }: {
  nomes: readonly string[];
  ativa?: number;
  aoTrocar?: (i: number) => void;
  aoAvisar: (r: string) => void;
}) {
  /* As setas rolam a fileira quando há mais abas do que cabem — e aqui, com a
     fileira inteira à vista, elas passam para a aba vizinha, que é o que o
     Ctrl+PgDn faz no Excel. Numa pasta de uma aba só elas não têm para onde ir. */
  const ir = (d: number) => {
    const alvo = ativa + d;
    if (aoTrocar && alvo >= 0 && alvo < nomes.length) aoTrocar(alvo);
  };
  return (
    <div className="pl-abas">
      <span className="pl-abas-nav">
        <button type="button" aria-label="Planilha anterior" title="Planilha anterior" onClick={() => ir(-1)}>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button type="button" aria-label="Próxima planilha" title="Próxima planilha" onClick={() => ir(1)}>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button type="button" aria-label="Todas as planilhas" title="Todas as planilhas"
          onClick={() => aoAvisar('A lista de todas as planilhas existe no programa de verdade, e não faz parte deste exercício.')}>
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </span>
      {nomes.map((nome, i) => (
        <button
          key={nome} type="button" className="pl-aba" aria-current={i === ativa}
          onClick={aoTrocar ? () => aoTrocar(i) : undefined}
        >
          {nome}
        </button>
      ))}
      <button type="button" className="pl-aba-mais" title="Nova planilha" aria-label="Nova planilha"
        onClick={() => aoAvisar('Acrescentar planilhas existe no programa de verdade, e não faz parte deste exercício.')}>
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
}


/**
 * A barra de status do Excel: o que o laboratório tem a dizer à esquerda, e à
 * direita o que o programa sempre tem — média, contagem e soma da seleção, os
 * modos de exibição e o zoom.
 *
 * O que o laboratório escreve vai dentro de um bloco próprio, e isso não é
 * enfeite: as travas procuram o último `span` dele.
 */
export function BarraDeStatusDoExcel({ children, aoAvisar, planilha, faixa, caderno }: {
  children?: React.ReactNode;
  aoAvisar: (r: string) => void;
  planilha?: Planilha;
  faixa?: Faixa;
  caderno?: Caderno;
}) {
  const conta = planilha && faixa ? contaDaSelecao(planilha, faixa, caderno) : null;
  return (
    <div className="pl-status">
      <div className="of-status-esquerda">{children}</div>
      <div className="of-status-direita">
        <AcessibilidadeDoStatus app="excel" aoAvisar={aoAvisar} />
        {conta && (
          <span className="pl-agregados" aria-label="Resumo da seleção">
            {conta.numeros > 0 && <span>Média: {mostrar({ tipo: 'numero', n: conta.soma / conta.numeros })}</span>}
            <span>Contagem: {conta.contagem}</span>
            {conta.numeros > 0 && <span>Soma: {mostrar({ tipo: 'numero', n: conta.soma })}</span>}
          </span>
        )}
        <ModosDeExibicao app="excel" aoAvisar={aoAvisar} />
        <ZoomDoOffice app="excel" aoAvisar={aoAvisar} />
      </div>
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
  /**
   * A fórmula em edição espera uma referência. Aí o clique numa célula não pode
   * tirar o foco do campo: ele escreve o nome dela, e quem decide é o gancho.
   */
  apontavel?: boolean;
  /** As faixas que a fórmula em edição cita, contornadas cada uma na sua cor. */
  referencias?: { faixa: Faixa; cor: string }[];
  /** As teclas da edição — F2, F4, Ctrl+Enter, as setas do modo Inserir. */
  aoTeclarNaEdicao?: (e: React.KeyboardEvent<HTMLInputElement>) => boolean;

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
  /** Abre a lista do filtro; o retângulo é o da setinha, para a lista abrir embaixo dela. */
  aoAbrirFiltro?: (c: number, onde?: DOMRect) => void;
  /**
   * O que flutua sobre a planilha — o gráfico.
   *
   * Mora dentro da caixa que rola, e não sobre a janela: no Excel o gráfico
   * está preso às células e rola com elas. Pendurado na janela, ele cobria a
   * barra de título e a faixa, que é justamente o que a pessoa precisa ver
   * para achar Design do Gráfico.
   */
  sobreposicao?: React.ReactNode;
}

/** A altura da fileira das letras das colunas, com a borda: é dela que a linha presa desconta. */
const ALTURA_DAS_LETRAS = 21;

export function GradeDoExcel({
  planilha: p, caderno, faixa, ativa, rascunho, gradeRef,
  aoTeclar, aoApontarCelula, aoEntrarNaCelula, aoApontarColuna, aoApontarLinha,
  aoMoverPonteiro, aoSoltarPonteiro, aoSairDaGrade,
  aoAbrirEdicao, aoEscrever, aoConfirmar, aoCancelar, apontavel, referencias, aoTeclarNaEdicao,
  aoContexto, aoArrastarBorda, aoAjustarAoConteudo, aoComecarPreenchimento, naTabela, aoAbrirFiltro,
  sobreposicao,
}: PropsDaGradeDoExcel) {
  /* O contorno colorido de cada referência da fórmula em edição: só as bordas
     da faixa, como o Excel desenha, e não a faixa inteira pintada. */
  const contornoDasReferencias = (l: number, c: number): string | undefined => {
    if (!referencias?.length) return undefined;
    const sombras: string[] = [];
    for (const r of referencias) {
      const n = normalizar(r.faixa);
      if (l < n.topo || l > n.base || c < n.esq || c > n.dir) continue;
      if (l === n.topo) sombras.push(`inset 0 2px 0 ${r.cor}`);
      if (l === n.base) sombras.push(`inset 0 -2px 0 ${r.cor}`);
      if (c === n.esq) sombras.push(`inset 2px 0 0 ${r.cor}`);
      if (c === n.dir) sombras.push(`inset -2px 0 0 ${r.cor}`);
    }
    return sombras.length ? sombras.join(', ') : undefined;
  };
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
              <th key={c} className={`pl-cab-col${dentroDasColunas(faixa, c) ? ' pl-cab-ativo' : ''}`} style={{ width: w, minWidth: w }}
                onPointerDown={e => aoApontarColuna(c, e)}
                onContextMenu={e => aoContexto?.(e, 'coluna', 0, c)}>
                {nomeDaColuna(c)}
                {p.ordenacao?.coluna === c && (
                  <span className="pl-cab-marca" aria-label={p.ordenacao.crescente ? 'ordenada de A a Z' : 'ordenada de Z a A'}>
                    {p.ordenacao.crescente ? <ArrowDownAZ className="w-3 h-3" /> : <ArrowUpZA className="w-3 h-3" />}
                  </span>
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
              /* A linha presa gruda logo abaixo das letras das colunas, somando
                 a altura das presas acima dela. */
              style={{
                height: p.alturas[l],
                top: l < p.congeladas ? ALTURA_DAS_LETRAS + p.alturas.slice(0, l).reduce((s, a) => s + a, 0) : undefined,
              }}
              className={[
                linhaEscondida(p, l) ? 'pl-escondida' : '',
                l < p.congeladas ? 'pl-congelada' : '',
                l === p.congeladas - 1 ? 'pl-congelada-ultima' : '',
              ].filter(Boolean).join(' ')}>
              <th className={`pl-cab-lin${dentroDasLinhas(faixa, l) ? ' pl-cab-ativo' : ''}`}
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
                const mostrado = doResumo ?? mostrar(valor, cel.formato);
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
                    onMouseDown={apontavel ? e => e.preventDefault() : undefined}
                    data-celula={nomeDaCelula(l, c)}
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
                      boxShadow: contornoDasReferencias(l, c),
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
                          if (aoTeclarNaEdicao?.(e)) return;
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
                    {/* A setinha do filtro mora na célula do cabeçalho da
                        tabela, e não na letra da coluna: é ali que o Excel a
                        põe, e é ali que quem leu a teoria vai procurá-la. */}
                    {aoAbrirFiltro && ehCelulaDoCabecalho(p, l, c) && (
                      <button type="button" className="pl-filtro-seta"
                        title={`Filtrar a coluna ${nomeDaColuna(c)}`}
                        aria-label={`Filtrar a coluna ${nomeDaColuna(c)}`}
                        onPointerDown={e => e.stopPropagation()}
                        onClick={e => aoAbrirFiltro(c, e.currentTarget.getBoundingClientRect())}>
                        {p.filtro?.coluna === c && p.filtro.valor
                          ? <Filter className="w-2.5 h-2.5" />
                          : <ChevronDown className="w-3 h-3" />}
                      </button>
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
      {sobreposicao && (
        /* O que se faz no gráfico é do gráfico: a tecla escrita no título não
           pode virar movimento de célula, nem o clique virar seleção. */
        <div className="pl-sobre-a-grade"
          onKeyDown={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          onPointerMove={e => e.stopPropagation()}
          onPointerUp={e => e.stopPropagation()}>
          {sobreposicao}
        </div>
      )}
    </div>
  );
}

const dentroDasColunas = (f: Faixa, c: number) => c >= Math.min(f.c1, f.c2) && c <= Math.max(f.c1, f.c2);
const dentroDasLinhas = (f: Faixa, l: number) => l >= Math.min(f.l1, f.l2) && l <= Math.max(f.l1, f.l2);

/**
 * A coluna faz parte do cabeçalho da tabela declarada.
 *
 * A setinha do filtro só aparece onde há o que filtrar. Pô-la em toda coluna
 * prometeria filtrar a coluna vazia da direita, que é um gesto sem efeito — e
 * gesto sem efeito é o que ensina a pessoa a desconfiar do programa.
 */
function ehCelulaDoCabecalho(p: Planilha, l: number, c: number): boolean {
  if (!p.tabela) return false;
  const esq = Math.min(p.tabela.c1, p.tabela.c2);
  const dir = Math.max(p.tabela.c1, p.tabela.c2);
  return l === Math.min(p.tabela.l1, p.tabela.l2) && c >= esq && c <= dir;
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

export function DesenhoDoGrafico({ tipo, pontos, pares, eixo, tendencia, equacao, altura = 90 }: {
  tipo: TipoDeGrafico;
  pontos: PontoDoGrafico[];
  /**
   * Os pares da dispersão. Ela é o único tipo que não lê rótulo: os outros
   * três põem uma fileira de nomes no eixo horizontal, e nela os dois eixos
   * são medidas. Sem isto, os pontos caíam em posições igualmente espaçadas
   * pela **ordem da linha** — um desenho plausível que muda de forma quando
   * alguém ordena a tabela, e a dispersão de verdade não muda.
   */
  pares?: PontoDeDispersao[];
  eixo?: EixoDoGrafico;
  tendencia?: boolean;
  equacao?: boolean;
  altura?: number;
}) {
  if (tipo === 'dispersao') {
    return <Dispersao pares={pares ?? []} tendencia={tendencia} equacao={equacao} altura={altura} />;
  }
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

      {/* A linha marca os pontos que ela liga. A dispersão não passa por aqui:
          ela tem desenho próprio, porque o eixo horizontal dela é uma medida e
          não uma fileira de nomes. */}
      {tipo === 'linha' && pontos.map((p, i) => (
        <circle key={`${p.rotulo}-${i}`} cx={x(i)} cy={y(p.valor)} r={1.6} fill={CORES_DO_GRAFICO[0]} />
      ))}

      {pontos.map((p, i) => (
        <text key={`r-${p.rotulo}-${i}`} x={x(i)} y={PISO + 8} fontSize={4.6} fill="#605E5C"
          textAnchor="middle">{p.rotulo.slice(0, 8)}</text>
      ))}
    </svg>
  );
}

/**
 * A dispersão, que é o requisito 5.1 da CC-ES010.
 *
 * Os dois eixos são medidas: o horizontal sai do x de cada par, e não da
 * posição da linha. É a diferença inteira entre ela e os outros três
 * gráficos — e é o que a torna imune à ordenação, que os outros não são.
 *
 * Ela não liga os pontos, e nunca ligou: ligar afirmaria uma sequência que
 * uma nuvem de pares não tem.
 */
function Dispersao({ pares, tendencia, equacao, altura }: {
  pares: PontoDeDispersao[];
  tendencia?: boolean;
  equacao?: boolean;
  altura: number;
}) {
  if (pares.length === 0) return null;

  const xs = pares.map(p => p.x);
  const ys = pares.map(p => p.y);
  /* Os dois eixos começam no menor valor observado, e não em zero — que é o
     que o Excel faz numa dispersão e o contrário do que ele faz numa coluna.
     Forçar o zero aqui espremeria a nuvem de alturas entre 1,05 e 1,79 num
     canto do desenho, e a relação que a lição manda ver sumiria. */
  const escala = (vs: number[], de: number, ate: number) => {
    const min = Math.min(...vs);
    const max = Math.max(...vs);
    /* `|| 1` porque uma coluna toda igual daria faixa zero: dividir por ela
       não desenharia nada, e nada é indistinguível de um gráfico vazio. */
    const faixa = (max - min) || 1;
    return { min, max, em: (v: number) => de + (v - min) / faixa * (ate - de) };
  };
  const ex = escala(xs, ESQ, DIR);
  const ey = escala(ys, PISO, ALTO);

  const reta = tendencia ? ajusteDaNuvem(xs, ys) : null;

  return (
    <svg viewBox="0 0 140 74" style={{ width: '100%', height: altura }}
      role="img" aria-label={descreverDispersao(pares, reta, equacao)}>
      <line x1={ESQ} y1={ALTO} x2={ESQ} y2={PISO} stroke="#C8C6C4" strokeWidth={0.6} />
      <line x1={ESQ} y1={PISO} x2={DIR} y2={PISO} stroke="#C8C6C4" strokeWidth={0.6} />
      <text x={ESQ - 2} y={PISO + 2} fontSize={5} fill="#605E5C" textAnchor="end">{rotuloDoEixo(ey.min)}</text>
      <text x={ESQ - 2} y={ALTO + 4} fontSize={5} fill="#605E5C" textAnchor="end">{rotuloDoEixo(ey.max)}</text>
      <text x={ESQ} y={PISO + 7} fontSize={4.6} fill="#605E5C" textAnchor="start">{rotuloDoEixo(ex.min)}</text>
      <text x={DIR} y={PISO + 7} fontSize={4.6} fill="#605E5C" textAnchor="end">{rotuloDoEixo(ex.max)}</text>

      {/* A reta vai **debaixo** dos pontos: por cima, ela esconderia
          justamente os pontos que mais se afastam dela, que são os que dizem
          se o ajuste presta. */}
      {reta && (
        <line x1={ex.em(ex.min)} y1={ey.em(reta.intercepcao + reta.inclinacao * ex.min)}
          x2={ex.em(ex.max)} y2={ey.em(reta.intercepcao + reta.inclinacao * ex.max)}
          stroke="#C13516" strokeWidth={0.9} strokeDasharray="3 2" />
      )}

      {pares.map((p, i) => (
        <circle key={`${p.x}-${p.y}-${i}`} cx={ex.em(p.x)} cy={ey.em(p.y)} r={1.6}
          fill={CORES_DO_GRAFICO[0]} fillOpacity={0.75} />
      ))}

      {reta && equacao && (
        <text x={DIR} y={ALTO + 5} fontSize={5} fill="#C13516" textAnchor="end">
          {textoDaEquacao(reta)}
        </text>
      )}
    </svg>
  );
}

/**
 * A reta de mínimos quadrados da nuvem.
 *
 * Ela repete a conta de `ajuste` em `formulas.ts` porque este arquivo é da
 * **janela** e não pode importar o motor do exercício — mas as duas são
 * conferidas uma contra a outra em `desenhoDoGrafico.test.tsx`, pelo motivo
 * de sempre: duas contas parecidas discordam um dia, e aqui a divergência
 * apareceria como uma reta desenhada por cima de uma equação que não é a
 * dela.
 */
function ajusteDaNuvem(xs: number[], ys: number[]): { inclinacao: number; intercepcao: number } | null {
  const n = xs.length;
  if (n === 0) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
  }
  if (sxx === 0) return null;
  const inclinacao = sxy / sxx;
  return { inclinacao, intercepcao: my - inclinacao * mx };
}

/* A forma que o Excel escreve: `y = 2,2x + 1,4`, com o sinal do termo
   constante lido da própria conta — escrever sempre `+` daria
   `y = 2,2x + -1,4`, que ninguém lê. */
function textoDaEquacao(r: { inclinacao: number; intercepcao: number }): string {
  const sinal = r.intercepcao < 0 ? '−' : '+';
  return `y = ${rotuloDoEixo(r.inclinacao)}x ${sinal} ${rotuloDoEixo(Math.abs(r.intercepcao))}`;
}

/**
 * O que o leitor de tela lê.
 *
 * Uma nuvem não se descreve ponto a ponto — quarenta e oito pares lidos em voz
 * alta não são uma descrição —, então ele diz o que a nuvem tem: quantos
 * pares, onde começam e terminam os dois eixos, e a reta, quando ela existe.
 *
 * **E a equação só entra quando a caixa dela está marcada.** Ela é a segunda
 * metade do requisito 5.3 — "ajustar a linha de tendência **e obter sua
 * equação**" —, e é um gesto: no Excel são duas caixas, e quem marca só a
 * primeira vê a reta e nunca lê a equação. Ditá-la assim que a reta existe
 * entregaria metade do requisito de graça, e entregaria **só a quem usa
 * leitor de tela** — que é a mesma decisão da lista da nuvem da CC-ES006, que
 * não escreve o papel de ninguém nem como texto para leitor de tela.
 *
 * O que cada pessoa recebe é o mesmo: vendo, a reta sem a equação; ouvindo, a
 * reta sem a equação.
 */
function descreverDispersao(
  pares: PontoDeDispersao[],
  reta: { inclinacao: number; intercepcao: number } | null,
  equacao?: boolean,
): string {
  const xs = pares.map(p => p.x);
  const ys = pares.map(p => p.y);
  const faixa = (vs: number[]) => `${rotuloDoEixo(Math.min(...vs))} a ${rotuloDoEixo(Math.max(...vs))}`;
  const nuvem = `Gráfico de dispersão com ${pares.length} pontos. `
    + `Eixo horizontal de ${faixa(xs)}; eixo vertical de ${faixa(ys)}.`;
  if (!reta) return nuvem;
  return equacao
    ? `${nuvem} Linha de tendência: ${textoDaEquacao(reta)}.`
    : `${nuvem} Com linha de tendência.`;
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
