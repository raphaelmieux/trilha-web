import { Minus, Square, X } from 'lucide-react';

/*
 * As peças de janela do Windows, compartilhadas pelos laboratórios que imitam
 * um programa dele.
 *
 * Dois laboratórios precisam da mesma moldura — o gerenciador de arquivos e o
 * de compactar — e um terceiro virá. Copiar a barra de título de um para o
 * outro faria as duas divergirem no primeiro ajuste, e o desbravador veria dois
 * "Windows" diferentes na mesma trilha.
 *
 * ── Por que tudo aqui é escrito à mão, e não pela plataforma ─────────────
 * A plataforma é escura e pinta `h1..h4` de quase branco. Toda superfície clara
 * dentro de um laboratório precisa dizer a própria cor, ou some. Por isso as
 * classes abaixo não herdam nada: cada uma declara fundo, borda e texto.
 *
 * As cores são as do Windows 11 — #F3F3F3 na moldura, #FFFFFF no conteúdo,
 * #CCE4F7 na seleção — porque é o arranjo *e* a aparência que o desbravador
 * precisa reconhecer na escola. Ver a nota sobre imitar um aplicativo no
 * CLAUDE.md.
 */

export const CSS_WINDOWS = `
  .win {
    background: #F3F3F3; color: #1B1B1B;
    font-family: 'Segoe UI', system-ui, Roboto, sans-serif;
    flex: 1; display: flex; flex-direction: column; min-height: 0;
  }
  .win-titulo {
    display: flex; align-items: center; gap: 8px; padding: 0 0 0 8px;
    background: #F3F3F3; flex: none; height: 38px;
  }
  .win-guia {
    display: flex; align-items: center; gap: 7px; height: 30px; padding: 0 10px;
    background: #FFFFFF; border-radius: 7px 7px 0 0; font-size: 12px;
    max-width: 240px; box-shadow: 0 -1px 2px rgba(0,0,0,.05);
  }
  .win-botoes-janela { margin-left: auto; display: flex; }
  .win-botoes-janela button {
    width: 44px; height: 38px; display: grid; place-items: center; color: #1B1B1B;
  }
  .win-botoes-janela button:hover { background: #E5E5E5; }
  .win-botoes-janela button:last-child:hover { background: #C42B1C; color: #fff; }

  .win-barra {
    display: flex; align-items: center; gap: 4px; padding: 5px 8px;
    background: #F3F3F3; flex: none; overflow-x: auto;
  }
  .win-cmd {
    display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 9px;
    border-radius: 4px; font-size: 12px; color: #1B1B1B; background: transparent;
    border: none; cursor: pointer; white-space: nowrap;
  }
  .win-cmd:hover:not(:disabled) { background: #EAEAEA; }
  .win-cmd:disabled { color: #A0A0A0; cursor: default; }
  .win-cmd:focus-visible { outline: 2px solid #0F6CBD; outline-offset: -2px; }
  .win-sep { width: 1px; align-self: stretch; margin: 4px 4px; background: #DCDCDC; flex: none; }

  .win-endereco {
    display: flex; align-items: center; gap: 3px; padding: 4px 8px 8px;
    background: #F3F3F3; flex: none;
  }
  .win-nav {
    width: 30px; height: 30px; display: grid; place-items: center; border-radius: 4px;
    color: #1B1B1B; background: transparent; border: none; cursor: pointer;
  }
  .win-nav:hover:not(:disabled) { background: #EAEAEA; }
  .win-nav:disabled { color: #B8B8B8; cursor: default; }
  .win-caminho {
    flex: 1; min-width: 0; display: flex; align-items: center; gap: 2px;
    height: 30px; padding: 0 8px; border-radius: 4px;
    background: #FFFFFF; border: 1px solid #D9D9D9; overflow-x: auto;
  }
  .win-caminho button {
    font-size: 12px; color: #1B1B1B; background: none; border: none; cursor: pointer;
    padding: 2px 5px; border-radius: 3px; white-space: nowrap;
  }
  .win-caminho button:hover { background: #EFEFEF; }
  .win-busca {
    width: 190px; height: 30px; border-radius: 4px; background: #FFFFFF;
    border: 1px solid #D9D9D9; display: flex; align-items: center; gap: 6px;
    padding: 0 9px; font-size: 12px; color: #767676; flex: none;
  }

  .win-corpo { flex: 1; display: flex; min-height: 0; background: #FFFFFF; }
  .win-painel {
    width: 200px; flex: none; overflow-y: auto; padding: 6px 4px;
    background: #F9F9F9; border-right: 1px solid #E5E5E5;
  }
  .win-lista { flex: 1; min-width: 0; display: flex; flex-direction: column; background: #FFFFFF; }
  .win-cabecalhos { display: flex; flex: none; border-bottom: 1px solid #E5E5E5; }
  .win-cabecalhos button {
    display: flex; align-items: center; gap: 4px; padding: 6px 8px;
    font-size: 12px; color: #444; background: none; border: none; cursor: pointer; text-align: left;
  }
  .win-cabecalhos button:hover { background: #F5F5F5; }

  /* As colunas são classe, e não porcentagem escrita na linha, porque em tela
     estreita duas delas somem — e porcentagem que sobra deixaria o tamanho
     boiando no meio da linha em vez de encostar na direita. */
  .win-c-nome { flex: 1 1 auto; min-width: 0; }
  .win-c-data { width: 172px; flex: none; }
  .win-c-tipo { width: 132px; flex: none; }
  .win-c-tam  { width: 96px;  flex: none; text-align: right; }
  .win-linha {
    display: flex; align-items: center; font-size: 12.5px; color: #1B1B1B;
    padding: 5px 0; margin: 1px 4px; border-radius: 4px; cursor: default;
  }
  .win-linha:hover { background: #F0F0F0; }
  .win-linha.escolhida { background: #CCE4F7; }
  .win-linha.recebendo { background: #E3F0FB; outline: 1px dashed #0F6CBD; }
  .win-status {
    flex: none; display: flex; align-items: center; gap: 14px; padding: 4px 12px;
    background: #F3F3F3; border-top: 1px solid #E5E5E5; font-size: 11.5px; color: #444;
  }

  /* ── Janela estreita ──
     O Explorer também encolhe: a caixa de pesquisa vira ícone, os comandos
     perdem o texto e ficam só com o desenho, e as colunas do meio saem. Em
     390 px o painel de navegação de 200 px comia metade da tela e a lista
     virava três colunas truncadas — pior que o Explorer de verdade, não
     parecido com ele. */
  @media (max-width: 1023px) {
    .win-busca { display: none; }
  }
  @media (max-width: 767px) {
    .win-painel { width: 136px; padding: 5px 2px; }
    .win-rotulo { display: none; }
    .win-cmd { padding: 0 7px; }
    /* Escrito com o pai junto porque .win-cabecalhos button é mais
       específico do que a classe da coluna, e ganharia o display. */
    .win-linha .win-c-data, .win-linha .win-c-tipo,
    .win-cabecalhos .win-c-data, .win-cabecalhos .win-c-tipo,
    .rar-linha .win-c-tipo, .rar-cabecalhos .win-c-tipo { display: none; }
    .win-janela.media { inset: 8px; }
  }

  .win-menu {
    position: fixed; z-index: 80; min-width: 210px; padding: 5px;
    background: #F9F9F9; border: 1px solid #E0E0E0; border-radius: 8px;
    box-shadow: 0 10px 28px rgba(0,0,0,.22);
  }
  .win-menu button {
    display: flex; align-items: center; gap: 9px; width: 100%; text-align: left;
    padding: 7px 10px; font-size: 12.5px; color: #1B1B1B; background: none;
    border: none; border-radius: 4px; cursor: pointer;
  }
  .win-menu button:hover:not(:disabled) { background: #EAEAEA; }
  .win-menu button:disabled { color: #A0A0A0; cursor: default; }

  /* ── Diálogo do sistema ── */
  .win-modal-fundo {
    position: absolute; inset: 0; z-index: 70; display: grid; place-items: center;
    background: rgba(0,0,0,.35); padding: 16px;
  }
  .win-modal {
    background: #F3F3F3; color: #1B1B1B; border-radius: 8px; width: min(520px, 100%);
    box-shadow: 0 24px 60px rgba(0,0,0,.4); border: 1px solid #D9D9D9;
    font-family: 'Segoe UI', system-ui, sans-serif; overflow: hidden;
  }
  .win-modal-cab {
    display: flex; align-items: center; padding: 10px 12px; font-size: 13px; font-weight: 600;
  }
  .win-modal-corpo { background: #FFFFFF; padding: 16px; border-top: 1px solid #E5E5E5; }
  .win-modal-pe {
    display: flex; justify-content: flex-end; gap: 8px; padding: 12px;
    border-top: 1px solid #E5E5E5;
  }
  .win-bt {
    min-width: 96px; height: 32px; padding: 0 14px; border-radius: 4px; font-size: 12.5px;
    background: #FDFDFD; border: 1px solid #D0D0D0; color: #1B1B1B; cursor: pointer;
  }
  .win-bt:hover { background: #F5F5F5; }
  .win-bt.primario { background: #0F6CBD; border-color: #0F6CBD; color: #FFFFFF; }
  .win-bt.primario:hover { background: #115EA3; }

  /* ── A área de trabalho, quando o laboratório precisa de mais de um programa ──
     O de compactar precisa de quatro: Explorador, WinRAR, o editor de texto e
     as Configurações. Empilhar quatro telas dentro de uma só faria um
     acordeão que não existe em computador nenhum; o que existe é a área de
     trabalho com janelas em cima e a barra de tarefas embaixo. */
  .win-mesa {
    flex: 1; min-height: 0; position: relative; display: flex; flex-direction: column;
    background: linear-gradient(150deg, #0B3B6F 0%, #1C6EA4 45%, #3E9AC4 100%);
  }
  .win-area { flex: 1; min-height: 0; position: relative; }
  .win-janela {
    position: absolute; display: flex; flex-direction: column; min-height: 0;
    background: #F3F3F3; color: #1B1B1B; border: 1px solid #C9C9C9; border-radius: 8px;
    box-shadow: 0 18px 50px rgba(0,0,0,.42); overflow: hidden;
    font-family: 'Segoe UI', system-ui, Roboto, sans-serif;
  }
  /* A janela de baixo ocupa tudo, como o Explorador maximizado. */
  .win-janela.cheia { inset: 0; border-radius: 0; border: none; box-shadow: none; }
  /* As de cima deixam ver a de baixo pela borda — é o que diz que existe uma
     janela atrás, e não que a tela inteira virou outro programa.
     O vão de baixo é maior do que o de cima de propósito: é ali que a cápsula
     da plataforma flutua, e sem o vão ela cairia justamente sobre a régua de
     status da janela de cima. */
  .win-janela.media { inset: 5% 6% 96px 6%; }

  .win-tarefas {
    flex: none; height: 46px; display: flex; align-items: center; justify-content: center;
    gap: 6px; background: rgba(243,243,243,.86); border-top: 1px solid rgba(0,0,0,.08);
    backdrop-filter: blur(18px);
  }
  .win-tarefas button {
    width: 40px; height: 38px; display: grid; place-items: center; border-radius: 6px;
    background: none; border: none; cursor: pointer; color: #1B1B1B; position: relative;
  }
  .win-tarefas button:hover { background: rgba(0,0,0,.06); }
  /* O tracinho embaixo do ícone: no Windows 11 é ele que diz o que está aberto. */
  .win-tarefas button.aberta::after {
    content: ''; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
    width: 14px; height: 3px; border-radius: 2px; background: #0F6CBD;
  }

  .win-iniciar {
    position: absolute; left: 50%; transform: translateX(-50%); bottom: 52px; z-index: 90;
    width: min(300px, calc(100% - 24px)); padding: 10px; border-radius: 10px;
    background: rgba(249,249,249,.98); border: 1px solid #E0E0E0;
    box-shadow: 0 20px 48px rgba(0,0,0,.35);
  }
  .win-iniciar button {
    display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
    padding: 9px 10px; font-size: 13px; color: #1B1B1B; background: none;
    border: none; border-radius: 6px; cursor: pointer;
  }
  .win-iniciar button:hover { background: #EAEAEA; }

  /* Caixinha de seleção do Explorador. No Windows ela é opção; aqui é sempre,
     porque no celular não existe Ctrl para marcar o segundo arquivo. */
  .win-caixa {
    width: 15px; height: 15px; flex: none; border-radius: 3px; border: 1px solid #8A8A8A;
    background: #FFFFFF; display: grid; place-items: center; font-size: 10px; color: #fff;
  }
  .win-caixa.marcada { background: #0F6CBD; border-color: #0F6CBD; }

  /* Barra de menus antiga — o editor de texto e o WinRAR têm uma. */
  .win-menus {
    display: flex; gap: 2px; padding: 2px 4px; background: #F3F3F3;
    border-bottom: 1px solid #E5E5E5; font-size: 12.5px; flex: none;
  }
  .win-menus > button {
    padding: 4px 9px; background: none; border: none; cursor: pointer; color: #1B1B1B;
    border-radius: 4px;
  }
  .win-menus > button:hover { background: #E5E5E5; }

  /* Controles de diálogo. O Windows desenha campo e lista do mesmo jeito nos
     dois, e escrever isso em cada janela faria elas divergirem. */
  .win-campo, .win-lista-op {
    height: 30px; padding: 0 8px; font-size: 12.5px; color: #1B1B1B;
    background: #FFFFFF; border: 1px solid #B8B8B8; border-radius: 3px; width: 100%;
  }
  .win-campo:focus, .win-lista-op:focus { outline: 2px solid #0F6CBD; outline-offset: -1px; }
  .win-rotulo-campo { display: block; font-size: 12px; color: #444; margin-bottom: 4px; }
  .win-marca { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #1B1B1B; }

  /* ── WinRAR: outra época, outra paleta ── */
  .rar { background: #F0F0F0; color: #000; font-family: 'Segoe UI', Tahoma, sans-serif; }
  .rar-menu {
    display: flex; gap: 2px; padding: 2px 4px; background: #F0F0F0;
    border-bottom: 1px solid #DCDCDC; font-size: 12px; flex: none;
  }
  .rar-menu button { padding: 3px 8px; background: none; border: none; cursor: pointer; color: #000; }
  .rar-menu button:hover { background: #D8E6F2; }
  .rar-ferramentas {
    display: flex; gap: 2px; padding: 4px; background: #F0F0F0;
    border-bottom: 1px solid #C8C8C8; flex: none; overflow-x: auto;
  }
  .rar-bt {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    min-width: 58px; padding: 4px 6px; font-size: 11px; color: #000;
    background: none; border: 1px solid transparent; border-radius: 3px; cursor: pointer;
  }
  .rar-bt:hover:not(:disabled) { background: #D8E6F2; border-color: #9DBCD4; }
  .rar-bt:disabled { color: #9A9A9A; cursor: default; }
  .rar-caminho {
    display: flex; align-items: center; gap: 6px; padding: 4px 6px; font-size: 12px;
    background: #F0F0F0; border-bottom: 1px solid #DCDCDC; flex: none;
  }
  .rar-combo {
    flex: 1; min-width: 0; height: 22px; display: flex; align-items: center; gap: 6px;
    padding: 0 6px; background: #FFFFFF; border: 1px solid #7A7A7A; font-size: 12px;
  }
  .rar-cabecalhos {
    display: flex; flex: none; background: #F0F0F0; border-bottom: 1px solid #C8C8C8;
    font-size: 11.5px; color: #000;
  }
  .rar-cabecalhos span { padding: 3px 6px; border-right: 1px solid #DCDCDC; }
  .rar-linha { display: flex; font-size: 12px; padding: 3px 0; background: #FFFFFF; }
  .rar-linha span { padding: 0 6px; }
  .rar-status {
    flex: none; display: flex; gap: 12px; padding: 3px 8px; font-size: 11.5px;
    background: #F0F0F0; border-top: 1px solid #C8C8C8; color: #000;
  }
`;

/** A barra de título de uma janela, com a guia e os botões de janela. */
export function BarraDeTitulo({ icone, nome, aoAvisar }: {
  icone: React.ReactNode; nome: string; aoAvisar: (o: string) => void;
}) {
  return (
    <div className="win-titulo">
      <div className="win-guia">
        {icone}
        <span className="truncate">{nome}</span>
        <button onClick={() => aoAvisar('Fechar a guia')} aria-label="Fechar a guia" style={{ marginLeft: 4, color: '#616161' }}>
          <X className="w-3 h-3" />
        </button>
      </div>
      <button onClick={() => aoAvisar('Abrir uma guia nova')} aria-label="Nova guia"
        style={{ color: '#616161', padding: '0 6px' }}>+</button>
      <div className="win-botoes-janela">
        <button onClick={() => aoAvisar('Minimizar')} aria-label="Minimizar"><Minus className="w-3.5 h-3.5" /></button>
        <button onClick={() => aoAvisar('Maximizar')} aria-label="Maximizar"><Square className="w-3 h-3" /></button>
        <button onClick={() => aoAvisar('Fechar a janela')} aria-label="Fechar"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

/*
  O ícone do WinRAR: três livros empilhados. Vale a pena desenhar em vez de
  pegar um ícone genérico de pasta zipada — é por essa pilha que a pessoa
  reconhece o programa na máquina do clube, e é ela que aparece na barra de
  tarefas do laboratório.
*/
export function IconeWinRAR({ tamanho = 16 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="3" width="3.4" height="10.5" rx="0.6" fill="#8B1A1A" />
      <rect x="5.4" y="4.2" width="3.4" height="9.3" rx="0.6" fill="#1F4E9C" />
      <rect x="9.3" y="2.4" width="3.4" height="11.1" rx="0.6" fill="#6B2E8F" />
      <rect x="1.5" y="5.4" width="3.4" height="1" fill="#F0C674" />
      <rect x="5.4" y="6.4" width="3.4" height="1" fill="#F0C674" />
      <rect x="9.3" y="4.8" width="3.4" height="1" fill="#F0C674" />
    </svg>
  );
}

/**
 * A barra de título de uma janela solta — as que abrem por cima do Explorador.
 * Diferente da do Explorador, que carrega guia; esta é a clássica: ícone e
 * nome à esquerda, os botões à direita.
 */
export function BarraDeJanela({ icone, titulo, aoMinimizar, aoFechar }: {
  icone: React.ReactNode; titulo: string;
  aoMinimizar: () => void; aoFechar: () => void;
}) {
  return (
    <div className="win-titulo" style={{ paddingLeft: 10, height: 34, gap: 8 }}>
      {icone}
      <span className="truncate" style={{ fontSize: 12.5 }}>{titulo}</span>
      <div className="win-botoes-janela">
        <button onClick={aoMinimizar} aria-label="Minimizar" style={{ height: 34 }}>
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button onClick={aoFechar} aria-label="Fechar" style={{ height: 34 }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Um diálogo do sistema, por cima da janela. */
export function DialogoDoWindows({ titulo, children, acoes }: {
  titulo: string; children: React.ReactNode; acoes: React.ReactNode;
}) {
  return (
    <div className="win-modal-fundo">
      <div className="win-modal" role="dialog" aria-label={titulo}>
        <div className="win-modal-cab">{titulo}</div>
        <div className="win-modal-corpo">{children}</div>
        <div className="win-modal-pe">{acoes}</div>
      </div>
    </div>
  );
}
