import {
  Files, Search, GitBranch, Blocks, Play, RotateCw, Lock,
  FileCode, ChevronDown, CircleAlert, TriangleAlert, Code2, Eye, BookOpen,
} from 'lucide-react';
import { realcarLinhasCss, realcarLinhas, realcarLinhasPython } from './realce';

/*
 * A moldura do editor de código, compartilhada pelos laboratórios de HTML.
 *
 * Antes eram dois cartões da plataforma lado a lado: um com um campo de texto,
 * outro com um iframe. Praticavam o HTML e não se pareciam com nada — quem
 * escreve HTML de verdade escreve num editor de código, e é esse editor que o
 * desbravador vai abrir depois: barra lateral com os arquivos, guias em cima,
 * números de linha, cores por tipo de coisa, prévia ao lado e uma régua de
 * status embaixo dizendo quantos problemas existem.
 *
 * É de propósito que não imita marca nenhuma. Word e Explorador são *aquele*
 * programa; editor de código não é — o desbravador pode encontrar o VS Code,
 * o Notepad++ ou o editor do celular, e o que se repete entre os três é este
 * arranjo. Imitar um deles ensinaria a reconhecer o logotipo errado.
 *
 * A paleta é escura porque editor de código é escuro, e porque aqui não há o
 * risco do CLAUDE.md: nada herda cor da plataforma, cada peça declara a sua.
 */

/**
 * As cores do realce, num pedaço só.
 *
 * Elas eram do editor e ninguém mais as tinha — e o exemplo da teoria emitia as
 * mesmas classes sem nenhuma regra que as pintasse: todo bloco de código das
 * lições saía cinza, do primeiro ao último caractere, em todas as veredas.
 *
 * Ficam aqui, exportadas, porque quem mostra código são duas telas. Duas cópias
 * divergiriam no primeiro ajuste, e a lição passaria a mostrar uma paleta que o
 * editor não usa — o mesmo defeito de dizer o nome do bloco de outro jeito.
 */
export const CORES_DO_REALCE = `
  .ide-tag  { color: #569CD6; }
  .ide-attr { color: #9CDCFE; }
  .ide-val  { color: #CE9178; }
  .ide-com  { color: #6A9955; }
  .ide-pon  { color: #808080; }
  .ide-txt  { color: #D4D4D4; }
`;

export const CSS_IDE = `
  .ide {
    flex: 1; min-height: 0; display: flex; flex-direction: column;
    background: #1E1E1E; color: #D4D4D4;
    font-family: 'Segoe UI', system-ui, Roboto, sans-serif;
  }
  .ide-titulo {
    flex: none; height: 34px; display: flex; align-items: center; gap: 8px;
    padding: 0 10px; background: #3C3C3C; font-size: 12.5px; color: #CCCCCC;
  }
  .ide-menus {
    flex: none; display: flex; gap: 2px; padding: 2px 6px; background: #3C3C3C;
    font-size: 12.5px; overflow-x: auto;
  }
  .ide-menus button {
    padding: 3px 8px; background: none; border: none; color: #CCCCCC;
    cursor: pointer; border-radius: 3px; white-space: nowrap;
  }
  .ide-menus button:hover { background: #505050; }

  .ide-corpo { flex: 1; min-height: 0; display: flex; position: relative; }
  /* A referência entra por cima do editor, e não no lugar dele: o arquivo
     continua aberto atrás, com o que já foi escrito. Cobre da barra de
     atividades para a direita e deixa a barra de título à mostra, que é a
     regra desta moldura — o que se precisa reconhecer depois não se tapa. */
  .ide-referencia { position: absolute; inset: 0; z-index: 5; display: flex; }
  /* Sem isto a referência fica com a largura do próprio conteúdo e a prévia
     do editor aparece por baixo, do lado direito. */
  .ide-referencia > * { flex: 1; min-width: 0; }
  .ide-atividade {
    width: 48px; flex: none; background: #333333; display: flex; flex-direction: column;
    align-items: center; padding-top: 6px; gap: 2px;
  }
  .ide-atividade button {
    width: 44px; height: 42px; display: grid; place-items: center;
    background: none; border: none; color: #858585; cursor: pointer;
    border-left: 2px solid transparent;
  }
  .ide-atividade button:hover { color: #FFFFFF; }
  .ide-atividade button[aria-current="true"] { color: #FFFFFF; border-left-color: #007ACC; }

  .ide-lateral {
    width: 180px; flex: none; background: #252526; overflow-y: auto;
    border-right: 1px solid #1B1B1B;
  }
  .ide-lateral-nome {
    padding: 8px 12px 6px; font-size: 10.5px; letter-spacing: .08em;
    text-transform: uppercase; color: #BBBBBB;
  }
  .ide-arquivo {
    display: flex; align-items: center; gap: 6px; width: 100%; text-align: left;
    padding: 4px 10px 4px 16px; font-size: 12.5px; color: #CCCCCC;
    background: none; border: none; cursor: pointer;
  }
  .ide-arquivo:hover { background: #2A2D2E; }
  .ide-arquivo[aria-current="true"] { background: #37373D; color: #FFFFFF; }

  .ide-painel { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .ide-guias { flex: none; display: flex; background: #252526; overflow-x: auto; }
  .ide-guia {
    display: flex; align-items: center; gap: 6px; padding: 7px 12px;
    font-size: 12.5px; color: #969696; background: #2D2D2D; border: none;
    border-right: 1px solid #1B1B1B; cursor: pointer; white-space: nowrap;
  }
  .ide-guia[aria-current="true"] {
    background: #1E1E1E; color: #FFFFFF; border-top: 1px solid #007ACC; padding-top: 6px;
  }

  /* ── O editor: régua, realce e campo, os três no mesmo lugar ──
     O campo de texto fica por cima, transparente, e o realce por baixo. Os
     dois precisam da mesma fonte, do mesmo tamanho e do mesmo recuo, ou a
     letra que se digita não cai em cima da letra colorida.

     ── A linha quebra ──
     Não quebrava, e uma linha de <img src="..." alt="..."> saía pela direita:
     no computador dava para rolar de lado, no celular o desbravador escrevia
     às cegas o que já não cabia na tela. Agora quebra, como quebra em
     qualquer editor com quebra automática ligada.

     Quebrar custa a régua: com uma linha ocupando três faixas, uma coluna de
     alturas fixas ao lado desalinha na primeira quebra. Por isso a régua não
     é mais uma coluna — cada linha lógica virou uma faixa de grade, com o
     número numa célula e o código na outra, e a faixa cresce junto com o que
     ela contém. Ninguém mede nada, e nada dessincroniza.

     A faixa que continua uma linha não recebe número, e é justamente por aí
     que se lê que ela é continuação, e não linha nova. Continuação começa na
     margem, sem herdar o recuo: um <textarea> é um bloco só, e recuo pendente
     por linha não existe nele — se o realce recuasse e o campo não, o cursor
     deixaria de cair em cima da letra que o desbravador vê. */
  .ide-codigo {
    --regua: 46px;
    flex: 1; min-height: 0; position: relative; background: #1E1E1E;
    overflow-y: auto; overflow-x: hidden;
  }
  .ide-folha { position: relative; min-height: 100%; padding: 10px 0; }
  .ide-realce, .ide-texto {
    font-family: 'Cascadia Code', Consolas, 'Courier New', monospace;
    font-size: 12.5px; line-height: 19px; tab-size: 2;
    white-space: pre-wrap; overflow-wrap: break-word;
  }
  .ide-realce { margin: 0; color: #D4D4D4; pointer-events: none; }
  .ide-linha { display: grid; grid-template-columns: var(--regua) 1fr; min-height: 19px; }
  .ide-num { text-align: right; padding-right: 10px; color: #6E7681; user-select: none; }
  .ide-cod { min-width: 0; padding-right: 12px; }
  .ide-texto {
    position: absolute; top: 10px; right: 0; bottom: 10px; left: var(--regua);
    width: auto; margin: 0; padding: 0 12px 0 0; border: none; resize: none;
    /* Escondido, e não automático: quem rola é a folha inteira, com a régua
       junto. Duas barras de rolagem seriam dois lugares para o mesmo texto. */
    overflow: hidden;
    background: transparent; color: transparent; caret-color: #FFFFFF;
  }
  .ide-texto:focus { outline: none; }
  .ide-texto::selection { background: #264F78; color: transparent; }

  ${CORES_DO_REALCE}

  /* ── A prévia: um navegadorzinho ao lado ── */
  .ide-lado-codigo { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .ide-lado-previa { width: 44%; flex: none; display: flex; min-width: 0; }
  .ide-previa { flex: 1; min-width: 0; display: flex; flex-direction: column; border-left: 1px solid #1B1B1B; }
  .ide-previa-barra {
    flex: none; display: flex; align-items: center; gap: 7px; padding: 5px 8px;
    background: #2D2D2D; font-size: 11.5px; color: #CCCCCC;
  }
  .ide-previa-url {
    flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px;
    height: 22px; padding: 0 8px; border-radius: 11px; background: #1E1E1E; color: #A0A0A0;
  }
  .ide-previa iframe { flex: 1; min-height: 0; width: 100%; border: none; background: #FFFFFF; }

  .ide-status {
    flex: none; display: flex; align-items: center; gap: 14px; padding: 3px 10px;
    background: #007ACC; color: #FFFFFF; font-size: 11.5px;
  }
  .ide-status button {
    display: flex; align-items: center; gap: 5px; background: none; border: none;
    color: #FFFFFF; cursor: pointer; padding: 0 4px; border-radius: 2px;
  }
  .ide-status button:hover { background: rgba(255,255,255,.16); }

  /* Alternador de código e prévia, só quando não cabem lado a lado. Acima
     dessa largura os dois ficam visíveis e a classe escondido não vale nada — é o
     CSS que decide, e não o JavaScript, para não haver descompasso entre o que
     o estado acha e o que a tela mostra. */
  .ide-alternador { display: none; }
  @media (max-width: 1023px) {
    .ide-lado-codigo.escondido, .ide-lado-previa.escondido { display: none; }
    .ide-lado-previa { width: auto; flex: 1; }
    .ide-lateral { width: 148px; }
    .ide-previa { border-left: none; }
    .ide-alternador { display: flex; }
    .ide-alternador button {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 7px; font-size: 12.5px; background: #2D2D2D; color: #969696;
      border: none; border-bottom: 1px solid #1B1B1B; cursor: pointer;
    }
    .ide-alternador button[aria-current="true"] { background: #1E1E1E; color: #FFFFFF; }
  }
  @media (max-width: 767px) {
    .ide-atividade { display: none; }
    .ide-lateral { width: 124px; }
    .ide-codigo { --regua: 34px; }
  }
`;

/* ── Peças ─────────────────────────────────────────────────────────────────── */

export interface ArquivoDoProjeto {
  nome: string;
  /** Quantos problemas o arquivo tem — a bolinha ao lado do nome vem daqui. */
  problemas: number;
}

/** A barra de título e a de menus, iguais em qualquer editor. */
export function CabecalhoDaIde({ arquivo, projeto, aoAvisar }: {
  arquivo: string; projeto: string; aoAvisar: (o: string) => void;
}) {
  return (
    <>
      <div className="ide-titulo">
        <Code2 className="w-4 h-4" style={{ color: '#519ABA' }} />
        <span className="truncate">{arquivo} — {projeto} — Editor de Código</span>
      </div>
      <div className="ide-menus">
        {['Arquivo', 'Editar', 'Selecionar', 'Exibir', 'Ir', 'Executar', 'Ajuda'].map(m => (
          <button key={m} onClick={() => aoAvisar(`O menu ${m}`)}>{m}</button>
        ))}
      </div>
    </>
  );
}

/** A barra de ícones e a lista de arquivos do projeto. */
export function LateralDaIde({ projeto, arquivos, atual, aoAbrir, aoAvisar, aoConsultar }: {
  projeto: string;
  arquivos: ArquivoDoProjeto[];
  atual: string;
  aoAbrir: (nome: string) => void;
  aoAvisar: (o: string) => void;
  /** Abre a referência de sintaxe. É o único ícone da barra que faz algo. */
  aoConsultar: () => void;
}) {
  return (
    <>
      <div className="ide-atividade">
        <button aria-current="true" title="Explorador" aria-label="Explorador">
          <Files className="w-5 h-5" />
        </button>
        <button title="Pesquisar" aria-label="Pesquisar" onClick={() => aoAvisar('A pesquisa')}>
          <Search className="w-5 h-5" />
        </button>
        <button title="Controle de versão" aria-label="Controle de versão" onClick={() => aoAvisar('O controle de versão')}>
          <GitBranch className="w-5 h-5" />
        </button>
        <button title="Extensões" aria-label="Extensões" onClick={() => aoAvisar('As extensões')}>
          <Blocks className="w-5 h-5" />
        </button>
        {/* Num editor de verdade este seria o painel de documentação de uma
            extensão. Aqui é a mini-trilha de sintaxe, e é o motivo de ela
            existir: quem está escrevendo não deveria ter de sair da tela para
            lembrar como se escreve uma tabela. */}
        <button title="Sintaxe do HTML" aria-label="Sintaxe do HTML" onClick={aoConsultar}>
          <BookOpen className="w-5 h-5" />
        </button>
      </div>

      <div className="ide-lateral">
        <p className="ide-lateral-nome">Explorador</p>
        <div className="flex items-center gap-1 px-2" style={{ fontSize: 11.5, color: '#CCCCCC' }}>
          <ChevronDown className="w-3.5 h-3.5" />
          <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{projeto}</span>
        </div>
        {arquivos.map(a => (
          <button key={a.nome} className="ide-arquivo" aria-current={a.nome === atual}
            onClick={() => aoAbrir(a.nome)}>
            <FileCode className="w-4 h-4 flex-none" style={{ color: '#E37933' }} />
            <span className="truncate" style={{ flex: 1 }}>{a.nome}</span>
            {a.problemas > 0 && (
              <span style={{ fontSize: 10.5, color: '#F48771' }}>{a.problemas}</span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

/* ── O recuo ────────────────────────────────────────────────────────────────
 *
 * Sem isto, escrever HTML aninhado no laboratório era impossível: o Tab levava
 * o foco para o próximo botão, e a única forma de recuar era segurar a barra de
 * espaço. Quem escreve HTML de verdade aperta Tab, e o editor recua.
 *
 * Dois espaços por nível, que é o que os modelos deste currículo usam. Sair do
 * campo com o teclado continua possível pelo Esc — sem essa saída, um Tab
 * capturado prenderia quem não usa mouse dentro do editor.
 */
const RECUO = '  ';

/** Tags sem fechamento: depois delas o próximo nível não aumenta. */
const SEM_FECHAMENTO = new Set([
  'br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed',
  'source', 'track', 'wbr', '!doctype',
]);

/** O branco com que começa a linha em que o cursor está. */
function recuoDaLinha(texto: string, posicao: number): string {
  const inicio = texto.lastIndexOf('\n', posicao - 1) + 1;
  return /^[ \t]*/.exec(texto.slice(inicio, posicao))![0];
}

/** O que vem antes do cursor termina abrindo uma tag que ainda vai fechar? */
function abriuTag(antes: string): boolean {
  if (/\/>\s*$/.test(antes)) return false;
  const tag = /<([A-Za-z!][\w:-]*)(?:\s[^<>]*)?>\s*$/.exec(antes);
  return !!tag && !SEM_FECHAMENTO.has(tag[1].toLowerCase());
}

/**
 * Escreve no campo pelo caminho do próprio navegador.
 *
 * `execCommand` está marcado como obsoleto e continua sendo o único jeito de
 * escrever num textarea sem zerar a pilha de desfazer: mexer no valor na mão
 * faz o Ctrl+Z devolver o arquivo inteiro de uma vez, e perder meia hora de
 * trabalho num atalho é pior do que não ter o atalho. Quando ele não existe,
 * cai no caminho manual, que ao menos escreve.
 */
function escrever(
  campo: HTMLTextAreaElement, texto: string, de: number, ate: number,
  aoMudar: (c: string) => void,
): void {
  campo.setSelectionRange(de, ate);
  try {
    if (document.execCommand('insertText', false, texto)) return;
  } catch { /* navegador sem execCommand: segue abaixo */ }
  const novo = campo.value.slice(0, de) + texto + campo.value.slice(ate);
  campo.value = novo;
  campo.setSelectionRange(de + texto.length, de + texto.length);
  aoMudar(novo);
}

/**
 * O editor: régua de linhas, realce por baixo e campo de texto por cima.
 *
 * Uma faixa por linha lógica, com o número ao lado do código. Como a faixa
 * cresce quando a linha quebra, a régua acompanha sozinha — antes ela era uma
 * coluna de alturas fixas com a rolagem espelhada à mão, e bastava uma linha
 * comprida para o número deixar de bater com o código.
 */
export function EditorDeCodigo({ codigo, aoMudar, rotulo, somenteLeitura = false, linguagem = 'html' }: {
  codigo: string; aoMudar: (c: string) => void; rotulo: string;
  /** Decide o realce. O arranjo do editor é o mesmo; a coloração, não. */
  linguagem?: 'html' | 'css' | 'python';
  /**
   * Arquivo de referência, aberto e não editável.
   *
   * O laboratório de CSS mostra a marcação a que a folha se aplica: sem ler o
   * `class=` e o `id=` não há como escrever um seletor que acerte alguém. Ela
   * é dada, então o campo continua realçado e navegável — só não recebe
   * digitação.
   */
  somenteLeitura?: boolean;
}) {
  const linhas = (linguagem === 'css' ? realcarLinhasCss
    : linguagem === 'python' ? realcarLinhasPython
      : realcarLinhas)(codigo);

  const aoTeclar = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const campo = e.currentTarget;
    const { selectionStart: de, selectionEnd: ate, value } = campo;

    /* A saída para quem navega por teclado: Esc devolve o foco à página, e daí
       o Tab volta a andar entre os controles. */
    if (e.key === 'Escape') { campo.blur(); return; }

    if (e.key === 'Tab') {
      e.preventDefault();
      const daLinha = value.lastIndexOf('\n', de - 1) + 1;
      const varias = value.slice(de, ate).includes('\n');

      /* Cursor solto e sem Shift: recua onde ele está. */
      if (!varias && !e.shiftKey) { escrever(campo, RECUO, de, ate, aoMudar); return; }

      /* Com bloco selecionado, ou com Shift, mexe em linha inteira — é como
         se arruma um trecho aninhado de uma vez. */
      const quebra = value.indexOf('\n', ate);
      const fim = quebra === -1 ? value.length : quebra;
      const bloco = value.slice(daLinha, fim);
      const trocado = bloco
        .split('\n')
        .map(l => (e.shiftKey ? l.replace(/^ {1,2}|^\t/, '') : RECUO + l))
        .join('\n');
      if (trocado !== bloco) escrever(campo, trocado, daLinha, fim, aoMudar);
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      const recuo = recuoDaLinha(value, de);
      if (!abriuTag(value.slice(0, de))) {
        /* Linha comum: repete o recuo da anterior. Sem recuo nenhum, o
           comportamento do navegador já serve e sai mais barato. */
        if (!recuo) return;
        e.preventDefault();
        escrever(campo, '\n' + recuo, de, ate, aoMudar);
        return;
      }
      /* Acabou de abrir uma tag: entra um nível. E se o fechamento já estiver
         logo adiante, a tag ganha o miolo aberto e o cursor fica dentro dele,
         que é o que qualquer editor faz e o que o desbravador vai querer. */
      e.preventDefault();
      const dentro = recuo + RECUO;
      const fechaLogo = /^\s*<\//.test(value.slice(ate));
      escrever(campo, fechaLogo ? `\n${dentro}\n${recuo}` : `\n${dentro}`, de, ate, aoMudar);
      if (fechaLogo) {
        const cursor = de + 1 + dentro.length;
        campo.setSelectionRange(cursor, cursor);
      }
    }
  };

  return (
    <div className="ide-codigo">
      <div className="ide-folha">
        {/* O realce é decoração: quem lê a tela lê o campo de texto. */}
        <pre className="ide-realce" aria-hidden="true">
          {linhas.map((html, i) => (
            <div className="ide-linha" key={i}>
              <span className="ide-num">{i + 1}</span>
              <span className="ide-cod" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          ))}
        </pre>
        <textarea
          className="ide-texto"
          value={codigo}
          onChange={e => aoMudar(e.target.value)}
          onKeyDown={somenteLeitura ? undefined : aoTeclar}
          readOnly={somenteLeitura}
          spellCheck={false}
          aria-label={rotulo}
        />
      </div>
    </div>
  );
}

/** A prévia ao lado, com casca de navegador para deixar claro o que é. */
export function PreviaDaIde({ html, arquivo, aoAvisar }: {
  html: string; arquivo: string; aoAvisar: (o: string) => void;
}) {
  return (
    <div className="ide-previa">
      <div className="ide-previa-barra">
        <Play className="w-3.5 h-3.5" style={{ color: '#89D185' }} />
        <span>Prévia ao vivo</span>
        <div className="ide-previa-url">
          <Lock className="w-3 h-3 flex-none" />
          <span className="truncate">localhost:5500/{arquivo}</span>
        </div>
        <button aria-label="Recarregar a prévia" onClick={() => aoAvisar('Recarregar')}
          style={{ background: 'none', border: 'none', color: '#CCCCCC', cursor: 'pointer' }}>
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Sem allow-scripts: a marcação do desbravador aparece, e não roda
          JavaScript nem alcança a página que a contém. */}
      <iframe srcDoc={html} sandbox="" title={`Prévia de ${arquivo}`} />
    </div>
  );
}

/** A régua de status, com a contagem de problemas à esquerda. */
export function StatusDaIde({ problemas, linhas, aoAvisar, linguagem = 'HTML' }: {
  problemas: number; linhas: number; aoAvisar: (o: string) => void;
  /** O que a régua diz à direita. Editor de verdade nomeia o arquivo aberto. */
  linguagem?: string;
}) {
  return (
    <div className="ide-status">
      <button onClick={() => aoAvisar('O painel de Problemas')} aria-label="Problemas">
        <CircleAlert className="w-3.5 h-3.5" /> {problemas}
        <TriangleAlert className="w-3.5 h-3.5" style={{ marginLeft: 8 }} /> 0
      </button>
      <span style={{ marginLeft: 'auto' }}>{linhas} linhas</span>
      {/* "Espaços: 2" é régua de editor de verdade; o Esc está escrito ao lado
          porque o Tab agora recua em vez de trocar de campo, e quem navega
          por teclado precisa saber por onde sai. */}
      <span>Espaços: 2</span>
      <span className="hidden sm:inline">Tab recua · Esc sai</span>
      <span>UTF-8</span>
      <span>{linguagem}</span>
    </div>
  );
}

/** O alternador entre código e prévia, que só aparece quando não cabem juntos. */
export function AlternadorDaIde({ vendo, aoTrocar }: {
  vendo: 'codigo' | 'previa'; aoTrocar: (v: 'codigo' | 'previa') => void;
}) {
  return (
    <div className="ide-alternador">
      <button aria-current={vendo === 'codigo'} onClick={() => aoTrocar('codigo')}>
        <FileCode className="w-4 h-4" /> Código
      </button>
      <button aria-current={vendo === 'previa'} onClick={() => aoTrocar('previa')}>
        <Eye className="w-4 h-4" /> Prévia
      </button>
    </div>
  );
}
