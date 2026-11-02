import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Accessibility, BookOpen, ChevronDown, ChevronUp, FileText, Focus, Globe, Grid3x3, LayoutGrid,
  LayoutTemplate, MessageSquare, Minus, Pen, Play, Plus, Redo2, Save, Search, Share2, Square,
  Ruler, SquareDashed, Table, Undo2, X, type LucideIcon,
} from 'lucide-react';
import {
  APPS_DO_OFFICE, FAIXAS, corDoApp, naoFazParte, ordemDoGrupo, semRepetir,
  type AppDoOffice, type Comando, type GrupoPadrao,
} from './faixasDoOffice';

export type { AppDoOffice } from './faixasDoOffice';

/*
 * A moldura do Microsoft 365, compartilhada pelos três programas.
 *
 * ── Por que existe um arquivo acima de `word.tsx` ────────────────────────
 * Word, Excel e PowerPoint são três programas e uma janela só: a mesma barra
 * de título com a barra de acesso rápido, a mesma fileira de guias com
 * Comentários e Compartilhar na ponta, a mesma faixa de opções em cartão, a
 * mesma barra de status com os modos de exibição e o zoom. O que muda é a cor
 * e o que vai dentro da faixa.
 *
 * Cada um desenhava a própria moldura, e as três já tinham divergido onde mais
 * se vê: o Word e o Excel tinham a barra de título clara do Microsoft 365, e o
 * PowerPoint a tinha laranja, do tema colorido do Office 2016. Quem saía de um
 * laboratório de apresentação para um de planilha via dois pacotes Office
 * diferentes no mesmo computador. É a decisão de `word.tsx`, um andar acima:
 * duas cópias divergem no primeiro ajuste.
 *
 * ── A guia que não faz parte do exercício abre assim mesmo ───────────────
 * As guias que um laboratório não usa apareciam apagadas, e clicar nelas
 * respondia com um aviso. Nenhum programa de verdade tem guia cinza: quem
 * abria "Layout" para ver o que havia lá recebia um muro, e muro ensina a
 * andar no trilho — é a regra da simulação que aguenta curiosidade. Hoje toda
 * guia abre a faixa inteira que o programa de verdade mostra, com os grupos e
 * os nomes certos, e o aviso só chega no botão.
 *
 * Isso é feito aqui, e não em cada laboratório. A fileira de guias guarda qual
 * guia está sendo espiada e desenha a faixa dela logo abaixo de si; a faixa do
 * laboratório, que vem logo depois na marcação, se esconde pela folha enquanto
 * isso (`.of-faixa-padrao + .wd-faixa`). Vinte e cinco laboratórios ganham o
 * comportamento sem mudar uma linha, e quem escreve o próximo não tem como
 * esquecer dele.
 *
 * ── E o nome dos botões é o do Office em português ───────────────────────
 * Negrito é N, Itálico é I e Sublinhado é S: é o que a faixa em português
 * desenha, e um B de "bold" mandaria procurar uma letra que a tela do clube
 * não tem. Os nomes dos grupos e dos comandos seguem a tradução da Microsoft,
 * pela regra do bloco do Scratch: o nome na lição é o nome na tela.
 */

/* ── A folha ──────────────────────────────────────────────────────────────

   Comentário dentro deste template não leva crase: fechou a string nove vezes
   nesta casa. Rode o tsc antes de medir qualquer coisa no navegador. */
export const CSS_OFFICE = `
/* ── Barra de título ── */
.of-titulo {
  background: #F3F3F3 !important; color: #242424;
  display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 0 0 10px !important;
  border-bottom: none !important; font-size: 12px; flex: none;
}
.of-app {
  width: 18px; height: 18px; border-radius: 4px; display: grid; place-items: center;
  color: #FFFFFF; font-weight: 700; font-size: 11px; flex: none;
  font-family: 'Segoe UI', system-ui, sans-serif;
}
.of-acesso { display: flex; align-items: center; gap: 2px; margin-left: 4px; }
.of-auto { display: flex; align-items: center; gap: 6px; padding: 0 6px; font-size: 11.5px; color: #424242; }
.of-chave {
  width: 32px; height: 16px; border-radius: 8px; border: 1px solid #616161;
  background: #FFFFFF; position: relative; cursor: pointer; padding: 0; flex: none;
}
.of-chave::after {
  content: ''; position: absolute; left: 2px; top: 2px; width: 10px; height: 10px;
  border-radius: 50%; background: #616161;
}
.of-chave[aria-checked="true"] { background: var(--of-cor); border-color: var(--of-cor); }
.of-chave[aria-checked="true"]::after { left: 18px; background: #FFFFFF; }
.of-icone-bt {
  width: 28px; height: 28px; border-radius: 4px; display: grid; place-items: center;
  color: #424242; background: transparent; border: none; cursor: pointer; flex: none;
}
.of-icone-bt:hover { background: #E6E6E6; }
.of-icone-bt:focus-visible { outline: 2px solid var(--of-cor); outline-offset: -2px; }
.of-nome {
  display: flex; align-items: center; gap: 4px; min-width: 0; padding: 4px 8px;
  border-radius: 4px; background: transparent; border: none; cursor: pointer; color: #242424;
  font-size: 12px; margin-left: 6px;
}
.of-nome:hover { background: #E6E6E6; }
.of-nome-arquivo { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.of-nome-estado { color: #616161; white-space: nowrap; }
.of-pesquisa {
  display: flex; align-items: center; gap: 8px; height: 28px; flex: 0 1 340px; min-width: 0;
  margin: 0 auto; padding: 0 10px; border-radius: 4px; border: 1px solid #D1D1D1;
  background: #FFFFFF; color: #616161; font-size: 12px; cursor: text; text-align: left;
}
.of-pesquisa:hover { border-color: #A0A0A0; }
.of-conta {
  width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center;
  background: #6B4E9B; color: #FFFFFF; font-size: 10.5px; font-weight: 600; border: none;
  cursor: pointer; margin: 0 6px; flex: none;
}
.of-janela-bts { display: flex; align-self: stretch; }
.of-janela-bt {
  width: 46px; display: grid; place-items: center; background: transparent; border: none;
  color: #242424; cursor: pointer;
}
.of-janela-bt:hover { background: #E1E1E1; }
.of-janela-bt.of-fechar:hover { background: #C42B1C; color: #FFFFFF; }

/* ── Fileira de guias ── */
.of-guias {
  background: #F3F3F3 !important; border-bottom: none !important;
  display: flex; align-items: center; gap: 0 !important; padding: 0 8px !important; flex: none;
  min-height: 36px;
}
.of-guias-lista { display: flex; align-items: stretch; gap: 0; overflow-x: auto; min-width: 0; flex: 1; align-self: stretch; }
.of-guias .of-guia {
  position: relative; padding: 0 9px !important; font-size: 13px; white-space: nowrap;
  border: none !important; background: transparent !important; color: #242424 !important;
  cursor: pointer; border-radius: 4px 4px 0 0 !important; font-weight: 400 !important;
  display: inline-flex; align-items: center;
}
.of-guias .of-guia:hover { background: #E6E6E6 !important; }
.of-guias .of-guia[aria-selected="true"] { color: var(--of-cor) !important; font-weight: 600 !important; }
/* O traço curto embaixo da guia ativa, arredondado, é o do Microsoft 365 —
   e não a borda inteira de baixo do Office 2016. */
.of-guias .of-guia[aria-selected="true"]::after {
  content: ''; position: absolute; left: 50%; bottom: 3px; transform: translateX(-50%);
  width: calc(100% - 22px); max-width: 32px; height: 3px; border-radius: 2px; background: var(--of-cor);
}
.of-guias .of-guia.of-guia-contextual { color: #C43E1C !important; }
.of-guias .of-guia.of-guia-contextual[aria-selected="true"]::after { background: #C43E1C; }
.of-guias-acoes { display: flex; align-items: center; gap: 6px; flex: none; padding-left: 8px; }
.of-acao {
  display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px;
  border-radius: 4px; border: 1px solid #D1D1D1; background: #FFFFFF; color: #242424;
  font-size: 12px; cursor: pointer; white-space: nowrap;
}
.of-acao:hover { background: #F5F5F5; }
.of-acao-cheia { background: var(--of-cor); border-color: var(--of-cor); color: #FFFFFF; }
.of-acao-cheia:hover { background: var(--of-escuro); }
/* A janela se mede por ela mesma, e não pela tela: ao lado do painel de
   tarefas ela tem trezentos pixels a menos do que a tela diz, e era aí que as
   últimas guias sumiam atrás dos botões da direita. Encolher o texto dos
   botões antes é o que o Office faz quando a janela estreita. */
.of-guias { container-type: inline-size; }
@container (max-width: 1180px) { .of-acao-secundaria { display: none; } }
@container (max-width: 820px) { .of-acao-texto { display: none; } }
@media (max-width: 900px) { .of-pesquisa-texto { display: none; } .of-pesquisa { flex: 0 0 auto; } }
@media (max-width: 640px) {
  .of-auto, .of-nome-estado, .of-conta, .of-so-largo { display: none; }
  .of-janela-bt { width: 34px; }
}

/* ── A faixa em cartão ──

   No Microsoft 365 a faixa é um cartão branco de cantos redondos pousado no
   cinza da janela, e não uma tira que encosta nas bordas. As três janelas a
   desenham com a mesma regra, escrita sobre as classes que os laboratórios já
   usam. O important vence a regra antiga de cada janela, que vem antes. */
.wd-faixa, .pl-faixa, .pp-faixa, .ac-faixa, .of-faixa-padrao {
  background: #FFFFFF !important; margin: 0 8px 6px; border: 1px solid #E0E0E0 !important;
  border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.08);
  padding: 4px 30px 0 4px !important; min-height: 92px; flex: none; position: relative;
}
.wd-grupo, .pl-grupo, .pp-grupo, .ac-grupo, .of-faixa-padrao .of-grupo {
  border-right: none !important; position: relative; padding: 0 8px !important;
}
.wd-grupo::after, .pl-grupo::after, .pp-grupo::after, .ac-grupo::after,
.of-faixa-padrao .of-grupo::after {
  content: ''; position: absolute; right: 0; top: 6px; bottom: 8px; width: 1px; background: #E0E0E0;
}
.wd-grupo-nome, .pl-grupo-nome, .pp-grupo-nome, .ac-grupo-nome, .of-grupo-nome {
  font-size: 11px !important; color: #616161 !important; padding: 2px 14px 4px !important;
  white-space: nowrap; position: relative; text-align: center;
}
/* Enquanto se espia uma guia que o laboratório não usa, a faixa dele sai de
   cena. A faixa padrão é sempre a irmã imediatamente anterior dela, porque a
   fileira de guias desenha a padrão logo depois de si. */
.of-faixa-padrao + .wd-faixa, .of-faixa-padrao + .pl-faixa, .of-faixa-padrao + .pp-faixa,
.of-faixa-padrao + .ac-faixa { display: none !important; }

.of-faixa-padrao { display: flex; align-items: stretch; overflow-x: auto; }
.of-grupo { display: flex; flex-direction: column; justify-content: space-between; min-width: max-content; }
.of-grupo-corpo { display: flex; align-items: flex-start; gap: 2px; padding: 2px 0 2px; }
.of-lancador {
  position: absolute; right: 0; bottom: 3px; width: 13px; height: 13px; padding: 0;
  display: grid; place-items: center; color: #616161; background: transparent; border: none;
  cursor: pointer; border-radius: 2px;
}
.of-lancador:hover { background: #E6E6E6; }
.of-grande {
  display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 44px; max-width: 74px;
  padding: 4px 4px 2px; border-radius: 4px; background: transparent; border: 1px solid transparent;
  color: #242424; font-size: 11.5px; line-height: 1.15; text-align: center; cursor: pointer;
}
.of-grande:hover, .of-pequeno:hover, .of-icone:hover { background: #F0F0F0; border-color: #E0E0E0; }
.of-pilha { display: flex; flex-direction: column; gap: 1px; }
.of-pequeno {
  display: flex; align-items: center; gap: 5px; height: 22px; padding: 0 5px; border-radius: 4px;
  background: transparent; border: 1px solid transparent; color: #242424; font-size: 11.5px;
  white-space: nowrap; cursor: pointer; text-align: left;
}
.of-linhas { display: flex; flex-direction: column; gap: 3px; }
.of-linha { display: flex; align-items: center; gap: 1px; }
.of-icone {
  position: relative; height: 24px; min-width: 24px; padding: 0 3px; border-radius: 4px;
  display: inline-flex; align-items: center; justify-content: center; gap: 1px;
  background: transparent; border: 1px solid transparent; color: #242424; cursor: pointer;
}
.of-letra { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 13.5px; line-height: 1; }
.of-barra-cor { position: absolute; left: 4px; right: 4px; bottom: 2px; height: 3px; border-radius: 1px; }
.of-seta { color: #616161; }
.of-combo {
  height: 22px; border: 1px solid #C7C7C7; border-radius: 3px; background: #FFFFFF; color: #242424;
  display: inline-flex; align-items: center; justify-content: space-between; gap: 4px;
  padding: 0 4px 0 6px; font-size: 11.5px; cursor: pointer; white-space: nowrap; overflow: hidden;
}
.of-combo:hover { border-color: #8A8A8A; }
.of-galeria {
  display: flex; align-items: stretch; border: 1px solid #E0E0E0; border-radius: 4px; overflow: hidden;
  height: 62px; margin-top: 2px;
}
.of-galeria-item {
  width: 78px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 4px;
  background: #FFFFFF; border: none; border-right: 1px solid #F0F0F0; color: #242424;
  font-size: 10.5px; cursor: pointer; padding: 2px;
}
.of-galeria-item:hover { background: #F0F0F0; }
.of-galeria-amostra { font-size: 15px; line-height: 1; color: #242424; }
.of-galeria-setas { display: flex; flex-direction: column; border-left: 1px solid #E0E0E0; }
.of-galeria-setas button {
  flex: 1; width: 16px; display: grid; place-items: center; background: #FAFAFA; border: none;
  border-bottom: 1px solid #E0E0E0; color: #616161; cursor: pointer;
}
.of-galeria-setas button:last-child { border-bottom: none; }
.of-recolher {
  position: absolute; right: 6px; bottom: 4px; width: 20px; height: 18px; border-radius: 3px;
  display: grid; place-items: center; background: transparent; border: none; color: #616161; cursor: pointer;
}
.of-recolher:hover { background: #E6E6E6; }

/* ── Barra de status: os modos de exibição e o zoom ── */
.of-modos { display: inline-flex; align-items: center; gap: 1px; }
.of-modo {
  width: 26px; height: 20px; display: grid; place-items: center; border-radius: 3px;
  background: transparent; border: none; color: #424242; cursor: pointer;
}
.of-modo:hover { background: #E1E1E1; }
.of-modo[aria-pressed="true"] { background: #D6D6D6; }
.of-status-direita { margin-left: auto; display: inline-flex; align-items: center; gap: 10px; }
.of-status-esquerda { display: inline-flex; align-items: center; gap: 14px; min-width: 0; overflow: hidden; }
.of-zoom { display: inline-flex; align-items: center; gap: 4px; }
.of-zoom input { width: 96px; accent-color: #616161; cursor: pointer; }
.of-zoom-bt {
  width: 18px; height: 18px; display: grid; place-items: center; background: transparent;
  border: none; color: #424242; cursor: pointer; border-radius: 2px;
}
.of-zoom-bt:hover { background: #E1E1E1; }
.of-zoom-valor { min-width: 36px; text-align: right; }
@media (max-width: 640px) { .of-modos, .of-zoom input { display: none; } }
`;

/* ── A barra de título ────────────────────────────────────────────────────── */

/**
 * A barra de título do Microsoft 365.
 *
 * Da esquerda para a direita: o ícone do programa, a barra de acesso rápido
 * (AutoSalvamento, Salvar, Desfazer, Refazer), o nome do arquivo com o estado,
 * a caixa de pesquisa, a conta e os três botões da janela. É nessa ordem que
 * ela aparece no computador do clube, e é por ela que se reconhece qual dos
 * três está aberto antes de ler qualquer palavra.
 *
 * Desfazer e Refazer chamam o laboratório quando ele os entrega; sem isso,
 * avisam — a presença do setter decide, como o `aoBuscar` do Explorador.
 */
export function BarraDeTituloDoOffice({
  app, classe, arquivo, estado = 'Salvo', aoAvisar, aoNaoFazParte, aoDesfazer, aoRefazer, aoSalvar, extra,
}: {
  app: AppDoOffice;
  /** A classe da janela, que os testes e as folhas antigas procuram. */
  classe: string;
  arquivo: string;
  estado?: string;
  aoAvisar: (recado: string) => void;
  /**
   * Quando o laboratório escreve a própria frase de "não faz parte", recebe só
   * o nome do comando — é como o PowerPoint sempre fez, e a frase dele é a
   * mesma dos botões da faixa.
   */
  aoNaoFazParte?: (comando: string) => void;
  aoDesfazer?: () => void;
  aoRefazer?: () => void;
  aoSalvar?: () => void;
  /** O que o laboratório pendura depois do nome, como o rótulo de confidencialidade. */
  extra?: ReactNode;
}) {
  const a = APPS_DO_OFFICE[app];
  const fora = (comando: string, recado: string) => (aoNaoFazParte ? aoNaoFazParte(comando) : aoAvisar(recado));
  /* O AutoSalvamento só liga com o arquivo no OneDrive; no computador do clube
     ele fica desligado, e ligar abre a pergunta de onde salvar. A chave existe
     porque está lá no programa — e mente menos desligada do que ligada. */
  const [auto, setAuto] = useState(false);
  return (
    <div className={`${classe} of-titulo`} style={corDoApp(app)}>
      <span className="of-app" style={{ background: a.cor }} aria-hidden="true">{a.letra}</span>
      <div className="of-acesso">
        <span className="of-auto">
          <span>AutoSalvamento</span>
          <button type="button" role="switch" aria-checked={auto} aria-label="AutoSalvamento"
            className="of-chave"
            onClick={() => {
              setAuto(false);
              aoAvisar('O AutoSalvamento só liga com o arquivo guardado no OneDrive. Neste computador o arquivo fica na pasta do clube, e quem salva é você.');
            }} />
          <span style={{ color: '#616161' }}>{auto ? 'Ligado' : 'Desligado'}</span>
        </span>
        <button type="button" className="of-icone-bt" aria-label="Salvar" title="Salvar"
          onClick={aoSalvar ?? (() => aoAvisar(`O arquivo já está salvo. Para guardar uma cópia com outro nome ou em outro formato, é Arquivo › Salvar como.`))}>
          <Save className="w-4 h-4" />
        </button>
        <button type="button" className="of-icone-bt" aria-label="Desfazer" title="Desfazer"
          onClick={aoDesfazer ?? (() => fora('Desfazer pela barra de acesso rápido', naoFazParte(app, 'Desfazer pela barra de acesso rápido')))}>
          <Undo2 className="w-4 h-4" />
        </button>
        <button type="button" className="of-icone-bt of-so-largo" aria-label="Refazer" title="Refazer"
          onClick={aoRefazer ?? (() => fora('Refazer pela barra de acesso rápido', naoFazParte(app, 'Refazer pela barra de acesso rápido')))}>
          <Redo2 className="w-4 h-4" />
        </button>
        <button type="button" className="of-icone-bt hidden sm:grid" aria-label="Personalizar Barra de Ferramentas de Acesso Rápido"
          title="Personalizar Barra de Ferramentas de Acesso Rápido"
          onClick={() => aoAvisar(naoFazParte(app, 'Personalizar a barra de acesso rápido'))}>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
      <button type="button" className="of-nome" title={arquivo}
        onClick={() => aoAvisar(`Este menu mostra onde o arquivo está guardado e deixa renomeá-lo. Ele existe no ${a.nome} de verdade, mas não faz parte deste exercício.`)}>
        <span className="of-nome-arquivo">{arquivo}</span>
        <span className="of-nome-estado">• {estado}</span>
        <ChevronDown className="w-3 h-3" style={{ color: '#616161', flex: 'none' }} />
        {extra}
      </button>
      <button type="button" className="of-pesquisa" aria-label="Pesquisar"
        onClick={() => aoAvisar(naoFazParte(app, 'A caixa de pesquisa'))}>
        <Search className="w-3.5 h-3.5" style={{ flex: 'none' }} />
        <span className="of-pesquisa-texto">Pesquisar (Alt+G)</span>
      </button>
      <button type="button" className="of-conta" aria-label="Conta: Desbravador" title="Desbravador"
        onClick={() => aoAvisar(naoFazParte(app, 'O menu da conta'))}>
        DB
      </button>
      <div className="of-janela-bts">
        <button type="button" className="of-janela-bt" aria-label="Minimizar"
          onClick={() => fora('Minimizar', 'Minimizar não faz parte deste exercício.')}>
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button type="button" className="of-janela-bt of-so-largo" aria-label="Maximizar"
          onClick={() => aoAvisar(`O ${a.nome} já está ocupando a tela inteira.`)}>
          <Square className="w-3 h-3" />
        </button>
        <button type="button" className="of-janela-bt of-fechar" aria-label="Fechar"
          onClick={() => fora(`Fechar o ${a.nome}`, `Fechar o ${a.nome} não faz parte deste exercício.`)}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── A fileira de guias ───────────────────────────────────────────────────── */

/**
 * A fileira de guias do Microsoft 365, com a faixa padrão da guia espiada.
 *
 * `usaveis` são as guias cuja faixa o laboratório desenha; qualquer outra abre
 * a faixa inteira do programa de verdade, desenhada aqui, com todos os botões
 * respondendo que existem e não fazem parte. A guia que o laboratório usa
 * continua no estado dele: espiar é da tela, e voltar a uma guia usável
 * devolve a faixa dele exatamente como estava.
 */
export function GuiasDoOffice({
  app, classe, classeDaGuia, guias, atual, usaveis, contextuais = [], aoTrocar, aoAvisar,
  aoAbrirArquivo, recadoDaGuia, mostrarEditando, classeDoArquivo = '', aoNaoFazParte,
}: {
  app: AppDoOffice;
  /** As classes antigas da fileira e de cada guia, que testes e folhas procuram. */
  classe: string;
  classeDaGuia: string;
  guias: readonly string[];
  atual: string;
  usaveis: readonly string[];
  contextuais?: readonly { id: string; nome: string }[];
  aoTrocar: (id: string) => void;
  aoAvisar: (recado: string) => void;
  aoAbrirArquivo?: () => void;
  /** Uma frase própria para a guia, quando o programa tem uma razão a dizer. */
  recadoDaGuia?: (nome: string) => string | undefined;
  mostrarEditando?: boolean;
  /** Classe a mais na guia Arquivo, que a trava do Excel procura. */
  classeDoArquivo?: string;
  /** A frase própria do laboratório, como na barra de título. */
  aoNaoFazParte?: (comando: string) => void;
}) {
  const fora = (comando: string) => (aoNaoFazParte ? aoNaoFazParte(comando) : aoAvisar(naoFazParte(app, comando)));
  const [espiando, setEspiando] = useState<string | null>(null);
  /* O laboratório trocou de guia por conta própria — um botão que leva a outra
     guia, um recomeço. A guia dele passa a ser a da tela. */
  useEffect(() => { setEspiando(null); }, [atual]);
  const selecionada = espiando ?? atual;
  const faixa = espiando ? FAIXAS[app][espiando] : undefined;

  /*
    A faixa do laboratório, completada.

    Cada laboratório desenha os grupos de que o exercício precisa, e só eles:
    a faixa de Início do Word saía com quatro grupos onde o programa tem oito,
    e a do Excel com seis botões sem nome. É a mesma faixa que se reencontra
    no computador do clube — com os grupos no lugar em que eles estão — que
    ensina onde procurar, e uma faixa magra ensina que o resto não existe.

    Os grupos que faltam entram aqui, e não em cada laboratório: a fileira de
    guias lê os nomes dos grupos que a faixa irmã desenhou, põe os do programa
    que não estão lá por portal dentro dela, e ordena todos por `order` na
    ordem do programa de verdade. Um grupo do exercício com nome que o
    programa não tem fica onde estava, logo depois do vizinho de antes.
  */
  const raiz = useRef<HTMLDivElement>(null);
  const [alvo, setAlvo] = useState<HTMLElement | null>(null);
  const [presentes, setPresentes] = useState('');
  const [desenhados, setDesenhados] = useState('');
  const padrao = FAIXAS[app][atual];
  useLayoutEffect(() => {
    let el = raiz.current?.nextElementSibling as HTMLElement | null;
    if (el?.classList.contains('of-faixa-padrao')) el = el.nextElementSibling as HTMLElement | null;
    const faixaDoLab = el && el.matches('.wd-faixa, .pl-faixa, .pp-faixa, .ac-faixa') ? el : null;
    setAlvo(faixaDoLab);
    if (!faixaDoLab || !padrao) return;
    const ler = () => {
      const grupos = [...faixaDoLab.querySelectorAll<HTMLElement>('.wd-grupo, .pl-grupo, .pp-grupo, .ac-grupo')]
        .filter(gr => !gr.closest('[data-of-completa]'));
      const nomes = grupos.map(gr =>
        gr.querySelector('.wd-grupo-nome, .pl-grupo-nome, .pp-grupo-nome, .ac-grupo-nome')?.textContent?.trim() ?? '');
      let anterior = 0;
      grupos.forEach((gr, i) => {
        const k = ordemDoGrupo(padrao, nomes[i]);
        const ordem = k >= 0 ? k * 10 + 5 : anterior + 1;
        anterior = ordem;
        let filho: HTMLElement = gr;
        while (filho.parentElement && filho.parentElement !== faixaDoLab) filho = filho.parentElement;
        filho.style.order = String(ordem);
      });
      setPresentes(nomes.join('|'));
      const rotulos = [...faixaDoLab.querySelectorAll<HTMLElement>('button, select, input')]
        .filter(b => !b.closest('[data-of-completa]'))
        .flatMap(b => [b.title, b.getAttribute('aria-label') ?? '', b.textContent?.trim() ?? ''])
        .map(r => r.replace(/\s*\(Ctrl\+[^)]*\)$/, ''))
        .filter(Boolean);
      setDesenhados([...new Set(rotulos)].sort().join('|'));
    };
    ler();
    /* A faixa do laboratório muda sem a fileira de guias saber — um grupo que
       aparece quando o cursor entra na tabela, outro que some com o menu. O
       observador relê os nomes a cada mudança; os grupos que ele mesmo pôs
       ficam de fora da leitura, e por isso a releitura não se repete. */
    const observador = new MutationObserver(ler);
    observador.observe(faixaDoLab, { childList: true, subtree: true });
    return () => observador.disconnect();
  }, [padrao, espiando]);
  const nomesPresentes = presentes.split('|');
  const jaDesenhados = new Set(desenhados.split('|'));
  const faltam = padrao && alvo
    ? padrao.map((gr, k) => ({ gr: semRepetir(gr, jaDesenhados), k }))
      .filter((x): x is { gr: GrupoPadrao; k: number } => x.gr !== null)
      .filter(({ gr }) => !nomesPresentes.some(n => ordemDoGrupo([gr], n) === 0))
    : [];

  return (
    <>
      <div ref={raiz} className={`${classe} of-guias`} style={corDoApp(app)}>
        <div className="of-guias-lista" role="tablist">
          <button type="button" className={`${classeDaGuia} of-guia ${classeDoArquivo}`}
            onClick={(ev) => {
              ev.stopPropagation();
              if (aoAbrirArquivo) aoAbrirArquivo();
              else if (aoNaoFazParte) aoNaoFazParte('A guia Arquivo');
              else aoAvisar(`A guia Arquivo abre os bastidores do ${APPS_DO_OFFICE[app].nome} — Salvar como, Imprimir, Exportar —, e não faz parte deste exercício.`);
            }}>
            Arquivo
          </button>
          {guias.map(nome => (
            <button key={nome} type="button" role="tab" aria-selected={selecionada === nome}
              className={`${classeDaGuia} of-guia`}
              onClick={(ev) => {
                ev.stopPropagation();
                if (usaveis.includes(nome)) { setEspiando(null); aoTrocar(nome); return; }
                setEspiando(nome);
                const recado = recadoDaGuia?.(nome);
                if (recado) aoAvisar(recado);
              }}>
              {nome}
            </button>
          ))}
          {contextuais.map(g => (
            <button key={g.id} type="button" role="tab" aria-selected={selecionada === g.id}
              className={`${classeDaGuia} of-guia of-guia-contextual`}
              onClick={(ev) => { ev.stopPropagation(); setEspiando(null); aoTrocar(g.id); }}>
              {g.nome}
            </button>
          ))}
        </div>
        <div className="of-guias-acoes">
          <button type="button" className="of-acao" aria-label="Painel de comentários"
            onClick={() => fora('O painel de Comentários')}>
            <MessageSquare className="w-3.5 h-3.5" /> <span className="of-acao-texto of-acao-secundaria">Comentários</span>
          </button>
          {mostrarEditando && (
            <button type="button" className="of-acao hidden md:inline-flex" aria-label="Modo de edição"
              onClick={() => fora('A troca entre Edição, Revisão e Exibição')}>
              <Pen className="w-3.5 h-3.5" /> <span className="of-acao-texto of-acao-secundaria">Editando</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          )}
          <button type="button" className="of-acao of-acao-cheia" aria-label="Compartilhar o arquivo"
            onClick={() => fora('Compartilhar')}>
            <Share2 className="w-3.5 h-3.5" /> <span className="of-acao-texto">Compartilhar</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
      {espiando && (
        <FaixaPadraoDoOffice app={app} guia={espiando} grupos={faixa ?? []} fora={fora} />
      )}
      {alvo && faltam.length > 0 && createPortal(
        <>
          {faltam.map(({ gr, k }) => (
            <GrupoPadraoDoOffice key={gr.nome} app={app} grupo={gr} fora={fora} ordem={k * 10 + 5} />
          ))}
          <span data-of-completa style={{ order: 9999 }}>
            <BotaoDeRecolher fora={fora} />
          </span>
        </>,
        alvo,
      )}
    </>
  );
}

/* ── A faixa padrão: o que cada guia mostra no programa de verdade ─────────── */

function IconeDoComando({ c: cmd }: { c: Comando }) {
  return (
    <>
      {cmd.I ? <cmd.I className="w-4 h-4" strokeWidth={1.6} /> :
        <span className="of-letra" style={cmd.letraEstilo}>{cmd.letra}</span>}
      {cmd.cor && <span className="of-barra-cor" style={{ background: cmd.cor }} />}
    </>
  );
}

function BotaoDeRecolher({ fora }: { fora: (comando: string) => void }) {
  return (
    <button type="button" className="of-recolher" aria-label="Recolher a Faixa de Opções"
      onClick={() => fora('Recolher a faixa de opções')}>
      <ChevronUp className="w-3.5 h-3.5" />
    </button>
  );
}

function FaixaPadraoDoOffice({ app, guia, grupos, fora }: {
  app: AppDoOffice; guia: string; grupos: GrupoPadrao[]; fora: (comando: string) => void;
}) {
  return (
    <div className="of-faixa-padrao" role="tabpanel" aria-label={`Faixa da guia ${guia}`} style={corDoApp(app)}>
      {grupos.map(gr => <GrupoPadraoDoOffice key={gr.nome} app={app} grupo={gr} fora={fora} />)}
      <BotaoDeRecolher fora={fora} />
    </div>
  );
}

/** Um grupo da faixa do programa de verdade, com todos os botões avisando. */
function GrupoPadraoDoOffice({ app, grupo: gr, fora: avisar, ordem }: {
  app: AppDoOffice; grupo: GrupoPadrao; fora: (comando: string) => void; ordem?: number;
}) {
  return (
        <div className="of-grupo" data-of-completa={ordem !== undefined ? '' : undefined}
          style={ordem !== undefined ? { order: ordem, ...corDoApp(app) } : undefined}>
          <div className="of-grupo-corpo">
            {gr.blocos.map((b, i) => {
              if (b.t === 'grande') {
                const Ico = b.c.I!;
                return (
                  <button key={i} type="button" className="of-grande" title={b.c.r} onClick={() => avisar(b.c.r)}>
                    <Ico className="w-6 h-6" strokeWidth={1.4} style={{ color: APPS_DO_OFFICE[app].cor }} />
                    <span>{b.c.r}{b.c.seta && <ChevronDown className="inline w-2.5 h-2.5 of-seta" />}</span>
                  </button>
                );
              }
              if (b.t === 'pilha') {
                return (
                  <div key={i} className="of-pilha">
                    {b.c.map(cmd => (
                      <button key={cmd.r} type="button" className="of-pequeno" title={cmd.r} onClick={() => avisar(cmd.r)}>
                        {cmd.I && <cmd.I className="w-3.5 h-3.5" strokeWidth={1.6} />}
                        <span>{cmd.r}</span>
                        {cmd.seta && <ChevronDown className="w-2.5 h-2.5 of-seta" />}
                      </button>
                    ))}
                  </div>
                );
              }
              if (b.t === 'linhas') {
                return (
                  <div key={i} className="of-linhas">
                    {b.c.map((linha, j) => (
                      <div key={j} className="of-linha">
                        {linha.map(cmd => cmd.combo ? (
                          <button key={cmd.r} type="button" className="of-combo" title={cmd.r}
                            style={{ width: cmd.combo }} onClick={() => avisar(cmd.r)}>
                            <span className="truncate">{cmd.valor}</span>
                            <ChevronDown className="w-3 h-3 of-seta" style={{ flex: 'none' }} />
                          </button>
                        ) : (
                          <button key={cmd.r} type="button" className="of-icone" title={cmd.r} aria-label={cmd.r}
                            onClick={() => avisar(cmd.r)}>
                            <IconeDoComando c={cmd} />
                            {cmd.seta && <ChevronDown className="w-2.5 h-2.5 of-seta" />}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <div key={i} className="of-galeria">
                  {b.c.map(item => (
                    <button key={item.nome} type="button" className="of-galeria-item" title={item.nome}
                      onClick={() => avisar(`O item ${item.nome} da galeria`)}>
                      <span className="of-galeria-amostra" style={item.estilo}>{item.amostra ?? 'Aa'}</span>
                      <span>{item.nome}</span>
                    </button>
                  ))}
                  <div className="of-galeria-setas">
                    <button type="button" aria-label="Linha anterior da galeria" onClick={() => avisar('Rolar a galeria')}><ChevronUp className="w-3 h-3" /></button>
                    <button type="button" aria-label="Próxima linha da galeria" onClick={() => avisar('Rolar a galeria')}><ChevronDown className="w-3 h-3" /></button>
                    <button type="button" aria-label="Mais itens da galeria" onClick={() => avisar('Abrir a galeria inteira')}><ChevronDown className="w-3 h-3" /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="of-grupo-nome">
            {gr.nome}
            {gr.lancador && (
              <button type="button" className="of-lancador" aria-label={`Abrir a caixa ${gr.nome}`}
                title={`Abrir a caixa ${gr.nome}`} onClick={() => avisar(`A caixa completa de ${gr.nome}`)}>
                <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true"><path d="M1 1h4M1 1v4M3 6l5-5M8 4v4H4" stroke="currentColor" fill="none" strokeWidth="1" /></svg>
              </button>
            )}
          </div>
        </div>
  );
}

/* ── As letras da faixa em português ─────────────────────────────────────── */

/*
  Negrito é N, Itálico é I e Sublinhado é S. O ícone de "bold" que vem nos
  pacotes de ícones é um B, e um B na faixa manda procurar uma letra que o
  computador do clube não mostra.
*/
export function IconeNegrito() {
  return <span className="of-letra" style={{ fontWeight: 700 }} aria-hidden="true">N</span>;
}
export function IconeItalico() {
  return <span className="of-letra" style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }} aria-hidden="true">I</span>;
}
export function IconeSublinhado() {
  return <span className="of-letra" style={{ textDecoration: 'underline' }} aria-hidden="true">S</span>;
}

/* ── A barra de status ────────────────────────────────────────────────────── */

const MODOS: Record<AppDoOffice, { r: string; I: LucideIcon }[]> = {
  word: [
    { r: 'Modo de Leitura', I: BookOpen },
    { r: 'Layout de Impressão', I: FileText },
    { r: 'Layout da Web', I: Globe },
  ],
  excel: [
    { r: 'Normal', I: Grid3x3 },
    { r: 'Layout da Página', I: FileText },
    { r: 'Visualização da Quebra de Página', I: SquareDashed },
  ],
  access: [
    { r: 'Modo Folha de Dados', I: Table },
    { r: 'Modo Estrutura', I: Ruler },
  ],
  powerpoint: [
    { r: 'Normal', I: LayoutTemplate },
    { r: 'Classificação de Slides', I: LayoutGrid },
    { r: 'Modo de Exibição de Leitura', I: BookOpen },
    { r: 'Apresentação de Slides', I: Play },
  ],
};

/**
 * Os botões de modo de exibição da barra de status.
 *
 * O primeiro de cada programa é o que o laboratório mostra — Layout de
 * Impressão no Word, Normal nos outros dois —, e é o que fica marcado. Os
 * outros avisam: existem, e trocar de modo não é o que a lição cobra.
 */
export function ModosDeExibicao({ app, aoAvisar }: { app: AppDoOffice; aoAvisar: (r: string) => void }) {
  const ativo = app === 'word' ? 'Layout de Impressão' : app === 'access' ? 'Modo Folha de Dados' : 'Normal';
  return (
    <span className="of-modos" role="group" aria-label="Modos de exibição">
      {app === 'word' && (
        <button type="button" className="of-modo hidden md:grid" aria-label="Foco" title="Foco"
          onClick={() => aoAvisar(naoFazParte(app, 'O modo Foco'))}>
          <Focus className="w-3.5 h-3.5" />
        </button>
      )}
      {MODOS[app].map(m => (
        <button key={m.r} type="button" className="of-modo" title={m.r} aria-label={m.r}
          aria-pressed={m.r === ativo}
          onClick={() => m.r !== ativo && aoAvisar(naoFazParte(app, `O modo ${m.r}`))}>
          <m.I className="w-3.5 h-3.5" />
        </button>
      ))}
    </span>
  );
}

/**
 * O zoom do rodapé: menos, régua, mais e a porcentagem.
 *
 * Sem `aoMudar` ele é desenhado e avisa — a planilha e a apresentação não têm
 * zoom que mude alguma coisa nos laboratórios de hoje, e um controle que
 * mexesse num número sem mexer na tela ensinaria que o programa mente.
 */
export function ZoomDoOffice({ app, zoom = 1, aoMudar, aoAvisar }: {
  app: AppDoOffice;
  zoom?: number;
  aoMudar?: (z: number) => void;
  aoAvisar?: (r: string) => void;
}) {
  const mudar = (z: number) => {
    if (aoMudar) aoMudar(Math.min(1.5, Math.max(0.4, Number(z.toFixed(2)))));
    else aoAvisar?.(naoFazParte(app, 'O zoom'));
  };
  return (
    <span className="of-zoom">
      <button type="button" aria-label="Reduzir o zoom" className="of-zoom-bt wd-zoom-bt" onClick={() => mudar(zoom - 0.1)}>
        <Minus className="w-3 h-3" />
      </button>
      <input type="range" min={40} max={150} step={10} value={Math.round(zoom * 100)}
        aria-label="Zoom" className="wd-zoom"
        onChange={e => mudar(Number(e.target.value) / 100)} />
      <button type="button" aria-label="Aumentar o zoom" className="of-zoom-bt wd-zoom-bt" onClick={() => mudar(zoom + 0.1)}>
        <Plus className="w-3 h-3" />
      </button>
      <span className="of-zoom-valor">{Math.round(zoom * 100)}%</span>
    </span>
  );
}

/** O ícone e o texto de acessibilidade que os três põem na barra de status. */
export function AcessibilidadeDoStatus({ app, aoAvisar }: { app: AppDoOffice; aoAvisar: (r: string) => void }) {
  return (
    <button type="button" className="hidden md:inline-flex items-center gap-1"
      style={{ color: 'inherit', fontSize: 'inherit', background: 'none', border: 'none', cursor: 'pointer' }}
      onClick={() => aoAvisar(naoFazParte(app, 'O Verificador de Acessibilidade'))}>
      <Accessibility className="w-3.5 h-3.5" /> Acessibilidade: tudo certo
    </button>
  );
}
