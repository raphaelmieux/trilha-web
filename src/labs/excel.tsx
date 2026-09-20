import { ArrowDownAZ, ArrowUpZA, Filter, X } from 'lucide-react';
import {
  type Direcao, type Faixa, type Planilha,
  alinhamentoDe, estiloCondicional, linhaEscondida, naFaixa, nomeDaColuna, valorDe,
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
   * A alça de preenchimento. Quem não a passa não a desenha — é a regra do
   * `aoBuscar` do Explorador: a peça existe quando o laboratório tem o que
   * fazer com ela.
   */
  aoPreencher?: (ate: { l: number; c: number }) => void;
  /** Quais células o estilo de tabela pinta. Só a AP043 usa. */
  naTabela?: (l: number, c: number) => boolean;
  /** A setinha do filtro no cabeçalho. Sem ela, o cabeçalho não tem botão. */
  aoAbrirFiltro?: (c: number) => void;
}

export function GradeDoExcel({
  planilha: p, faixa, ativa, rascunho, gradeRef,
  aoTeclar, aoApontarCelula, aoEntrarNaCelula, aoApontarColuna, aoApontarLinha,
  aoMoverPonteiro, aoSoltarPonteiro, aoSairDaGrade,
  aoAbrirEdicao, aoEscrever, aoConfirmar, aoCancelar,
  aoContexto, aoArrastarBorda, aoAjustarAoConteudo, aoPreencher, naTabela, aoAbrirFiltro,
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
                const mostrado = valorDe(p, l, c);
                const h = alinhamentoDe(cel, mostrado);
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
                    {ancora && rascunho !== null ? (
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
                      <span onDoubleClick={() => aoAbrirEdicao(cel.texto)} className="pl-valor">
                        {mostrado}
                      </span>
                    )}
                    {ancora && aoPreencher && rascunho === null && (
                      <span
                        className="pl-alca-preencher"
                        title="Arraste para preencher as células abaixo"
                        aria-label="Alça de preenchimento"
                        onPointerDown={e => { e.stopPropagation(); e.preventDefault(); }}
                        onPointerUp={e => { e.stopPropagation(); aoPreencher({ l, c }); }} />
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
