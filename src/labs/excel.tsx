import { X } from 'lucide-react';

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
export function GuiasDoExcel({ atual, usaveis, aoTrocar, aoAvisar }: {
  atual: string;
  usaveis: readonly string[];
  aoTrocar: (id: string) => void;
  aoAvisar: (recado: string) => void;
}) {
  return (
    <div className="pl-guias" role="tablist">
      <button type="button" className="pl-guia pl-guia-arquivo"
        onClick={() => aoAvisar('A guia Arquivo existe no Excel de verdade, e não faz parte deste exercício.')}>
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
