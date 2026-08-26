import { useState } from 'react';
import {
  FileArchive, FileText, FileImage, Folder, Plus, PackageOpen, Eye, Trash2,
  FileSearch, Wand2, Info, ShieldCheck, ArrowUp, Globe, Search, Settings,
  Monitor, Bluetooth, Network, AppWindow, User, MoreHorizontal, Package,
  Printer, ShieldAlert, Lock, Download, Palette, CheckCircle2, X,
} from 'lucide-react';
import { BarraDeJanela, IconeWinRAR } from './windows';

/*
 * As janelas do laboratório de operações com arquivos.
 *
 * Cada uma imita um programa que o desbravador vai abrir de verdade: o WinRAR,
 * um editor de texto, as Configurações do Windows e um navegador. Elas moram
 * fora do laboratório porque o laboratório já é grande, e porque nenhuma
 * guarda estado: recebem o que mostrar e devolvem o que a pessoa clicou.
 *
 * Nenhuma delas herda cor da plataforma. A plataforma é escura e pinta h1..h4
 * de quase branco; superfície clara aqui dentro precisa dizer a própria cor,
 * ou o título some em cima do painel branco. Ver a nota no CLAUDE.md.
 */

/* ── Peças pequenas, repetidas nas quatro ──────────────────────────────────── */

interface Fechavel { aoMinimizar: () => void; aoFechar: () => void }

/** Um botão da barra de ferramentas do WinRAR: desenho grande, nome embaixo. */
function BotaoRar({ Ico, nome, cor, onClick, desabilitado }: {
  Ico: typeof Plus; nome: string; cor: string;
  onClick: () => void; desabilitado?: boolean;
}) {
  return (
    <button className="rar-bt" onClick={onClick} disabled={desabilitado} title={nome}>
      <Ico className="w-5 h-5" style={{ color: desabilitado ? '#A8A8A8' : cor }} />
      {nome}
    </button>
  );
}

/* ── 1. WinRAR ─────────────────────────────────────────────────────────────── */

export interface LinhaDoArquivo {
  nome: string;
  /** Tamanho original, em KB — o WinRAR conta em KB, não em MB. */
  kb: number;
  /** Quanto sobrou depois de compactar. */
  compactado: number;
  tipo: string;
}

/**
 * A janela do WinRAR com um arquivo aberto.
 *
 * A aparência é a de sempre — o programa mal mudou em vinte anos, e é essa
 * janela cinza de barra de ferramentas colorida que está na máquina do clube.
 */
export function JanelaWinRAR({ nomeDoArquivo, linhas, aoExtrair, aoAvisar, aoMinimizar, aoFechar }: Fechavel & {
  nomeDoArquivo: string;
  linhas: LinhaDoArquivo[];
  aoExtrair: () => void;
  aoAvisar: (o: string) => void;
}) {
  const totalKb = linhas.reduce((s, l) => s + l.kb, 0);
  const totalComp = linhas.reduce((s, l) => s + l.compactado, 0);
  const emKb = (n: number) => n.toLocaleString('pt-BR');

  return (
    <div className="win-janela media rar" style={{ background: '#F0F0F0' }}>
      <BarraDeJanela
        icone={<IconeWinRAR />}
        titulo={`${nomeDoArquivo} - WinRAR (cópia de avaliação)`}
        aoMinimizar={aoMinimizar}
        aoFechar={aoFechar}
      />

      <div className="rar-menu">
        {['Arquivo', 'Comandos', 'Ferramentas', 'Favoritos', 'Opções', 'Ajuda'].map(m => (
          <button key={m} onClick={() => aoAvisar(`O menu ${m}`)}>{m}</button>
        ))}
      </div>

      <div className="rar-ferramentas">
        <BotaoRar Ico={Plus} nome="Adicionar" cor="#C0392B" onClick={() => aoAvisar('Adicionar, aqui dentro,')} />
        <BotaoRar Ico={PackageOpen} nome="Extrair Para" cor="#1F6FB2" onClick={aoExtrair} />
        <BotaoRar Ico={ShieldCheck} nome="Testar" cor="#2E7D32" onClick={() => aoAvisar('Testar')} />
        <BotaoRar Ico={Eye} nome="Ver" cor="#6B2E8F" onClick={() => aoAvisar('Ver')} />
        <BotaoRar Ico={Trash2} nome="Excluir" cor="#B71C1C" onClick={() => aoAvisar('Excluir de dentro do arquivo')} />
        <BotaoRar Ico={FileSearch} nome="Localizar" cor="#00695C" onClick={() => aoAvisar('Localizar')} />
        <BotaoRar Ico={Wand2} nome="Assistente" cor="#EF6C00" onClick={() => aoAvisar('O Assistente')} />
        <BotaoRar Ico={Info} nome="Informação" cor="#1565C0" onClick={() => aoAvisar('Informação')} />
      </div>

      <div className="rar-caminho">
        <button onClick={() => aoAvisar('Subir um nível')} aria-label="Um nível acima"
          style={{ display: 'flex', padding: 2 }}>
          <ArrowUp className="w-4 h-4" style={{ color: '#8B6914' }} />
        </button>
        <div className="rar-combo">
          <IconeWinRAR tamanho={13} />
          <span className="truncate">{nomeDoArquivo}\</span>
        </div>
      </div>

      <div className="rar-cabecalhos">
        <span className="win-c-nome">Nome</span>
        <span style={{ width: 84, flex: 'none', textAlign: 'right' }}>Tamanho</span>
        <span style={{ width: 92, flex: 'none', textAlign: 'right' }}>Compactado</span>
        <span className="win-c-tipo">Tipo</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: '#FFFFFF' }}>
        <div className="rar-linha">
          <span className="win-c-nome" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Folder className="w-4 h-4" style={{ color: '#E6B14C' }} /> ..
          </span>
          <span style={{ width: 84, flex: 'none' }} />
          <span style={{ width: 92, flex: 'none' }} />
          <span className="win-c-tipo">Pasta</span>
        </div>
        {linhas.map(l => (
          <div key={l.nome} className="rar-linha">
            <span className="win-c-nome truncate" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {l.nome.endsWith('.odt')
                ? <FileText className="w-4 h-4" style={{ color: '#1F6FB2' }} />
                : <FileImage className="w-4 h-4" style={{ color: '#2E7D32' }} />}
              {l.nome}
            </span>
            <span style={{ width: 84, flex: 'none', textAlign: 'right' }}>{emKb(l.kb)}</span>
            <span style={{ width: 92, flex: 'none', textAlign: 'right' }}>{emKb(l.compactado)}</span>
            <span className="win-c-tipo truncate">{l.tipo}</span>
          </div>
        ))}
      </div>

      <div className="rar-status">
        <IconeWinRAR tamanho={13} />
        <span>
          Total {linhas.length} arquivos, {emKb(totalKb)} KB — compactados em {emKb(totalComp)} KB
        </span>
      </div>
    </div>
  );
}

/* ── 2. Editor de texto ────────────────────────────────────────────────────── */

export type ItemDoMenuArquivo = 'salvar' | 'salvar-como' | 'exportar-pdf' | 'imprimir';

/**
 * O editor de texto com o relatório aberto.
 *
 * O menu Arquivo é o laboratório inteiro desta estação: é lá que mora a
 * escolha entre Salvar — que não vira pdf — e os dois caminhos que viram.
 */
export function JanelaEditor({ nome, pdfPronto, aoEscolher, aoAvisar, aoMinimizar, aoFechar }: Fechavel & {
  nome: string;
  pdfPronto: boolean;
  aoEscolher: (o: ItemDoMenuArquivo) => void;
  aoAvisar: (o: string) => void;
}) {
  const [menu, setMenu] = useState(false);

  const itens: [ItemDoMenuArquivo, string, string][] = [
    ['salvar', 'Salvar', 'Ctrl+S'],
    ['salvar-como', 'Salvar como…', 'Ctrl+Shift+S'],
    ['exportar-pdf', 'Exportar como PDF…', ''],
    ['imprimir', 'Imprimir…', 'Ctrl+P'],
  ];

  return (
    <div className="win-janela media" onClick={() => setMenu(false)}>
      <BarraDeJanela
        icone={<FileText className="w-4 h-4" style={{ color: '#1F6FB2' }} />}
        titulo={`${nome} — Editor de Texto`}
        aoMinimizar={aoMinimizar}
        aoFechar={aoFechar}
      />

      <div className="win-menus" style={{ position: 'relative' }}>
        {/* O clique precisa parar aqui: se subir, cai no onClick da janela que
            fecha o menu, e ele abriria e sumiria no mesmo gesto. */}
        <button onClick={e => { e.stopPropagation(); setMenu(a => !a); }}
          style={menu ? { background: '#E5E5E5' } : undefined}>
          Arquivo
        </button>
        {['Editar', 'Exibir', 'Inserir', 'Formatar', 'Ferramentas'].map(m => (
          <button key={m} onClick={() => aoAvisar(`O menu ${m}`)}>{m}</button>
        ))}

        {menu && (
          <div className="win-menu" style={{ position: 'absolute', left: 4, top: 28 }}
            onClick={e => e.stopPropagation()}>
            {itens.map(([id, rotulo, atalho]) => (
              <button key={id} onClick={() => { setMenu(false); aoEscolher(id); }}>
                <span style={{ flex: 1 }}>{rotulo}</span>
                <span style={{ color: '#767676', fontSize: 11.5 }}>{atalho}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: '#9E9E9E', padding: 16 }}>
        <div style={{
          maxWidth: 560, margin: '0 auto', background: '#FFFFFF', color: '#1B1B1B',
          padding: '28px 32px', boxShadow: '0 2px 10px rgba(0,0,0,.3)', fontSize: 12.5, lineHeight: 1.7,
        }}>
          <p style={{ fontSize: 15, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            Relatório da Unidade Falcão
          </p>
          <p style={{ marginBottom: 8 }}>
            No primeiro semestre a unidade participou de quatro programações do
            clube e de um acampamento de três dias no Parque das Águas.
          </p>
          <p style={{ marginBottom: 8 }}>
            Oito desbravadores começaram especialidades novas, e cinco delas
            foram concluídas antes do acampamento.
          </p>
          <p>
            A unidade pede à diretoria duas barracas para a próxima saída, já que
            uma das atuais teve a vareta quebrada na última chuva.
          </p>
        </div>
      </div>

      <div className="win-status">
        <span>Página 1 de 4</span>
        <span>168 palavras</span>
        <span style={{ marginLeft: 'auto' }}>
          {pdfPronto ? 'PDF exportado' : 'Documento de texto ODF (.odt)'}
        </span>
      </div>
    </div>
  );
}

/* ── 3. Configurações do Windows ───────────────────────────────────────────── */

/**
 * Configurações → Aplicativos → Aplicativos instalados.
 *
 * É o caminho certo para tirar um programa, e por isso ele existe aqui inteiro,
 * com os vizinhos que a lista de verdade tem — desinstalar não é uma tela
 * especial, é uma linha no meio de outras.
 */
export function JanelaConfiguracoes({ desenhadorInstalado, aoDesinstalar, aoAvisar, aoMinimizar, aoFechar }: Fechavel & {
  desenhadorInstalado: boolean;
  aoDesinstalar: () => void;
  aoAvisar: (o: string) => void;
}) {
  const [menuDe, setMenuDe] = useState<string | null>(null);

  const secoes: [typeof Monitor, string, boolean][] = [
    [Monitor, 'Sistema', false],
    [Bluetooth, 'Bluetooth e dispositivos', false],
    [Network, 'Rede e Internet', false],
    [AppWindow, 'Aplicativos', true],
    [User, 'Contas', false],
  ];

  const programas: [string, string, string][] = [
    ['Navegador Web', '112 MB', '02/08/2026'],
    ...(desenhadorInstalado ? [['Desenhador', '284 MB', '20/08/2026'] as [string, string, string]] : []),
    ['Editor de Texto', '396 MB', '15/03/2026'],
    ['Tocador de Mídia', '64,2 MB', '15/03/2026'],
    ['WinRAR', '5,84 MB', '11/05/2026'],
  ];

  return (
    <div className="win-janela media" onClick={() => setMenuDe(null)}>
      <BarraDeJanela
        icone={<Settings className="w-4 h-4" style={{ color: '#0F6CBD' }} />}
        titulo="Configurações"
        aoMinimizar={aoMinimizar}
        aoFechar={aoFechar}
      />

      <div className="win-corpo">
        <div className="win-painel" style={{ padding: '8px 6px' }}>
          {secoes.map(([Ico, nome, aqui]) => (
            <button key={nome} onClick={() => !aqui && aoAvisar(`A seção ${nome}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                padding: '8px 8px', borderRadius: 5, fontSize: 12.5, color: '#1B1B1B',
                background: aqui ? '#E8E8E8' : 'transparent', border: 'none', cursor: 'pointer',
              }}>
              <Ico className="w-4 h-4" style={{ color: aqui ? '#0F6CBD' : '#5B5B5B' }} />
              <span className="truncate">{nome}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0, overflow: 'auto', background: '#FFFFFF', padding: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1B1B1B', marginBottom: 4 }}>
            Aplicativos instalados
          </p>
          <p style={{ fontSize: 12, color: '#5B5B5B', marginBottom: 12 }}>
            {programas.length} aplicativos encontrados
          </p>

          <div className="win-busca" style={{ width: '100%', marginBottom: 12 }}>
            <Search className="w-3.5 h-3.5" />
            <span>Pesquisar aplicativos</span>
          </div>

          {programas.map(([nome, tamanho, data]) => (
            <div key={nome} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
              border: '1px solid #EDEDED', borderRadius: 6, marginBottom: 6, background: '#FCFCFC',
            }}>
              <Package className="w-5 h-5 flex-none" style={{ color: '#5B5B5B' }} />
              <div className="min-w-0" style={{ flex: 1 }}>
                <p style={{ fontSize: 12.5, color: '#1B1B1B' }} className="truncate">{nome}</p>
                <p style={{ fontSize: 11, color: '#767676' }}>Instalado em {data}</p>
              </div>
              <span style={{ fontSize: 11.5, color: '#5B5B5B' }} className="hidden sm:inline">{tamanho}</span>
              <div style={{ position: 'relative' }}>
                <button aria-label={`Mais opções de ${nome}`}
                  onClick={e => { e.stopPropagation(); setMenuDe(m => (m === nome ? null : nome)); }}
                  style={{ padding: 5, borderRadius: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#1B1B1B' }}>
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {menuDe === nome && (
                  <div className="win-menu" style={{ position: 'absolute', right: 0, top: 28, minWidth: 170 }}
                    onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setMenuDe(null); aoAvisar('Modificar'); }}>Modificar</button>
                    <button onClick={() => {
                      setMenuDe(null);
                      if (nome === 'Desenhador') aoDesinstalar();
                      else aoAvisar(`Desinstalar o ${nome}`);
                    }}>
                      Desinstalar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 4. Navegador ──────────────────────────────────────────────────────────── */

export type Origem = 'oficial' | 'agregador' | 'link';

/**
 * O navegador com a busca pelo programa de desenho.
 *
 * Os três resultados são os três que aparecem de verdade quando alguém procura
 * programa para baixar, e na ordem em que costumam aparecer — o oficial não é
 * sempre o primeiro.
 */
export function JanelaNavegador({ pagina, baixando, baixado, aoEscolher, aoBaixar, aoAbrirBaixado, aoMinimizar, aoFechar }: Fechavel & {
  /** 'busca' na lista de resultados; 'produto' na página do site oficial. */
  pagina: 'busca' | 'produto';
  /** Progresso do download, de 0 a 100, ou null quando não há download. */
  baixando: number | null;
  baixado: boolean;
  aoEscolher: (o: Origem) => void;
  aoBaixar: () => void;
  aoAbrirBaixado: () => void;
}) {
  const resultados: [Origem, string, string, string, boolean][] = [
    ['agregador', 'Baixaki Programas — Desenhador 2026 grátis',
      'baixe-programas-gratis.com › desenhador',
      'Download rápido, sem cadastro. Recomendado por nossos usuários.', false],
    ['oficial', 'Desenhador — Site oficial',
      'desenhador.org › baixar',
      'Versão 6.2 para Windows, macOS e Linux. Direto de quem faz o programa.', true],
    ['link', 'Desenhador PRO ATIVADO 2026 (link do grupo)',
      'arquivos-liberados.net › desenhador-pro',
      'Versão paga liberada, já com a licença aplicada. Serve em qualquer Windows.', false],
  ];

  const endereco = pagina === 'busca'
    ? 'buscador.com/pesquisa?q=programa+de+desenho+para+baixar'
    : 'desenhador.org/baixar';

  return (
    <div className="win-janela media">
      <BarraDeJanela
        icone={<Globe className="w-4 h-4" style={{ color: '#0F6CBD' }} />}
        titulo={pagina === 'busca'
          ? 'programa de desenho para baixar — Navegador Web'
          : 'Desenhador — Baixar — Navegador Web'}
        aoMinimizar={aoMinimizar}
        aoFechar={aoFechar}
      />

      <div className="win-endereco">
        <div className="win-caminho" style={{ gap: 7 }}>
          <Lock className="w-3.5 h-3.5" style={{ color: '#2E7D32', flex: 'none' }} />
          <span className="truncate" style={{ fontSize: 12 }}>{endereco}</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: '#FFFFFF', padding: 16 }}>
        {pagina === 'busca' && (
          <>
            <p style={{ fontSize: 11.5, color: '#767676', marginBottom: 12 }}>
              Cerca de 2.140.000 resultados
            </p>
            {resultados.map(([id, titulo, endereco, resumo, seguro]) => (
              <button key={id} onClick={() => aoEscolher(id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', marginBottom: 16,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>
                <p style={{ fontSize: 11.5, color: '#3C6E3C', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {seguro
                    ? <Lock className="w-3 h-3" style={{ color: '#2E7D32' }} />
                    : <ShieldAlert className="w-3 h-3" style={{ color: '#B26A00' }} />}
                  <span className="truncate">{endereco}</span>
                </p>
                <p style={{ fontSize: 14.5, color: '#1A0DAB', textDecoration: 'underline' }}>{titulo}</p>
                <p style={{ fontSize: 12.5, color: '#4D5156' }}>{resumo}</p>
              </button>
            ))}
          </>
        )}

        {/* A página do produto existe porque clicar num resultado de busca não
            baixa nada: leva ao site, e é lá que fica o botão. Pular esse passo
            ensinaria a esperar um download que começa sozinho — que é
            justamente o comportamento dos sites que não se deve usar. */}
        {pagina === 'produto' && (
          <div style={{ maxWidth: 520, margin: '0 auto', color: '#1B1B1B' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
              <Palette className="w-9 h-9 flex-none" style={{ color: '#C0392B' }} />
              <div>
                <p style={{ fontSize: 19, fontWeight: 700 }}>Desenhador</p>
                <p style={{ fontSize: 12.5, color: '#5B5B5B' }}>
                  Programa livre de desenho e pintura · versão 6.2
                </p>
              </div>
            </div>

            <p style={{ fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
              Pincéis, camadas e ferramentas de pintura para computador. Serve
              para cartaz de clube, convite e desenho livre.
            </p>

            <button onClick={aoBaixar} disabled={baixando !== null || baixado}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px',
                background: baixado ? '#8FBF8F' : '#2E7D32', color: '#FFFFFF', border: 'none',
                borderRadius: 5, fontSize: 14, fontWeight: 600,
                cursor: baixando !== null || baixado ? 'default' : 'pointer',
              }}>
              <Download className="w-4 h-4" />
              {baixado ? 'Baixado' : 'Baixar para Windows'}
            </button>
            <p style={{ marginTop: 8, fontSize: 11.5, color: '#5B5B5B' }}>
              desenhador-6.2-instalador.exe · 86,4 MB · Windows 10 ou mais novo
            </p>

            <div style={{ marginTop: 18, padding: 12, background: '#F1F7F1', borderRadius: 6, fontSize: 12, color: '#2E5B2E' }}>
              <Lock className="w-3.5 h-3.5 inline mr-1" />
              Este é o site do fabricante. O arquivo é assinado, e o Windows vai
              mostrar o nome dele antes de instalar.
            </div>
          </div>
        )}
      </div>

      {/* A barra de downloads do rodapé, que é por onde quase todo mundo abre o
          que acabou de baixar — e por isso ela abre o instalador daqui também,
          além do Explorador. */}
      {(baixando !== null || baixado) && (
        <div style={{
          flex: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
          background: '#F3F3F3', borderTop: '1px solid #DCDCDC',
        }}>
          {baixado
            ? <CheckCircle2 className="w-5 h-5 flex-none" style={{ color: '#2E7D32' }} />
            : <Download className="w-5 h-5 flex-none" style={{ color: '#0F6CBD' }} />}
          <div className="min-w-0" style={{ flex: 1 }}>
            <p className="truncate" style={{ fontSize: 12, color: '#1B1B1B' }}>
              desenhador-6.2-instalador.exe
            </p>
            {baixado ? (
              <p style={{ fontSize: 11, color: '#5B5B5B' }}>Concluído · 86,4 MB</p>
            ) : (
              <div className="setup-barra" style={{ height: 6, marginTop: 4 }}>
                <span style={{ width: `${baixando ?? 0}%` }} />
              </div>
            )}
          </div>
          {baixado && (
            <button className="win-bt" style={{ minWidth: 0, height: 26 }} onClick={aoAbrirBaixado}>
              Abrir arquivo
            </button>
          )}
          <X className="w-4 h-4 flex-none" style={{ color: '#767676' }} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

/* ── A janela de impressão ─────────────────────────────────────────────────── */

export interface Impressao {
  copias: number;
  agrupado: boolean;
  qualidade: 'rascunho' | 'normal' | 'alta';
  ajuste: 'real' | 'pagina';
  porFolha: 1 | 2 | 4;
}

/**
 * O corpo do diálogo de impressão, com os controles que a janela do Windows
 * tem — e nessa ordem, porque é assim que a pessoa vai procurá-los depois.
 */
export function ControlesDeImpressao({ imp, aoMudar }: {
  imp: Impressao; aoMudar: (i: Impressao) => void;
}) {
  const folhas = Math.ceil(4 / imp.porFolha) * imp.copias;

  return (
    <div className="flex flex-col gap-3">
      <label>
        <span className="win-rotulo-campo">Impressora</span>
        <select className="win-lista-op" defaultValue="clube" aria-label="Impressora">
          <option value="clube">Impressora do clube (HP LaserJet)</option>
          <option value="pdf">Microsoft Print to PDF</option>
        </select>
      </label>

      <div className="flex gap-3">
        <label style={{ width: 110 }}>
          <span className="win-rotulo-campo">Cópias</span>
          <select className="win-lista-op" value={imp.copias} aria-label="Cópias"
            onChange={e => aoMudar({ ...imp, copias: Number(e.target.value) })}>
            {[1, 2, 3, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label style={{ flex: 1 }}>
          <span className="win-rotulo-campo">Qualidade</span>
          <select className="win-lista-op" value={imp.qualidade} aria-label="Qualidade"
            onChange={e => aoMudar({ ...imp, qualidade: e.target.value as Impressao['qualidade'] })}>
            <option value="rascunho">Rascunho</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
          </select>
        </label>
      </div>

      <label className="win-marca">
        <input type="checkbox" checked={imp.agrupado}
          onChange={e => aoMudar({ ...imp, agrupado: e.target.checked })} />
        Agrupar (cada cópia inteira, uma depois da outra)
      </label>

      <div className="flex gap-3">
        <label style={{ flex: 1 }}>
          <span className="win-rotulo-campo">Tamanho</span>
          <select className="win-lista-op" value={imp.ajuste} aria-label="Tamanho"
            onChange={e => aoMudar({ ...imp, ajuste: e.target.value as Impressao['ajuste'] })}>
            <option value="real">Tamanho real</option>
            <option value="pagina">Ajustar à página</option>
          </select>
        </label>
        <label style={{ width: 150 }}>
          <span className="win-rotulo-campo">Páginas por folha</span>
          <select className="win-lista-op" value={imp.porFolha} aria-label="Páginas por folha"
            onChange={e => aoMudar({ ...imp, porFolha: Number(e.target.value) as Impressao['porFolha'] })}>
            {[1, 2, 4].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>

      {/* O gasto de papel, dito antes de gastar. É o que a janela de verdade
          não mostra, e o que faz a diferença entre acertar e descobrir com a
          folha na mão. */}
      <p style={{ fontSize: 11.5, color: '#5B5B5B', borderTop: '1px solid #E5E5E5', paddingTop: 8 }}>
        <Printer className="w-3.5 h-3.5 inline mr-1" style={{ color: '#5B5B5B' }} />
        Vai sair: {imp.copias} {imp.copias === 1 ? 'cópia' : 'cópias'} de 4 páginas,
        {imp.agrupado ? ' cada cópia inteira de uma vez' : ' todas as páginas 1, depois todas as 2'},
        {imp.porFolha === 1 ? ' uma página por folha' : ` ${imp.porFolha} páginas por folha`} —
        {' '}{folhas} {folhas === 1 ? 'folha' : 'folhas'} de papel.
      </p>
    </div>
  );
}

/** O corpo do diálogo Salvar como, com a lista de formatos. */
export function ControlesDeSalvar({ nome, formato, aoMudarFormato }: {
  nome: string; formato: string; aoMudarFormato: (f: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="win-caminho" style={{ height: 28 }}>
        <Folder className="w-3.5 h-3.5" style={{ color: '#E6B14C', flex: 'none' }} />
        <span style={{ fontSize: 12 }}>Documentos › Clube</span>
      </div>

      <label>
        <span className="win-rotulo-campo">Nome do arquivo</span>
        <input className="win-campo" value={nome} readOnly aria-label="Nome do arquivo" />
      </label>

      <label>
        <span className="win-rotulo-campo">Tipo</span>
        <select className="win-lista-op" value={formato} aria-label="Tipo"
          onChange={e => aoMudarFormato(e.target.value)}>
          <option value="odt">Documento de texto ODF (*.odt)</option>
          <option value="docx">Documento do Word (*.docx)</option>
          <option value="txt">Texto sem formatação (*.txt)</option>
          <option value="pdf">PDF (*.pdf)</option>
        </select>
      </label>
    </div>
  );
}

/** O corpo do diálogo do WinRAR que cria o arquivo compactado. */
export function ControlesDeCompactar({ nome, aoMudarNome, formato, aoMudarFormato, apagar, aoMudarApagar }: {
  nome: string; aoMudarNome: (n: string) => void;
  formato: string; aoMudarFormato: (f: string) => void;
  apagar: boolean; aoMudarApagar: (a: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label>
        <span className="win-rotulo-campo">Nome do arquivo</span>
        <input className="win-campo" value={nome} aria-label="Nome do arquivo"
          onChange={e => aoMudarNome(e.target.value)} />
      </label>

      <div className="flex gap-3">
        <label style={{ flex: 1 }}>
          <span className="win-rotulo-campo">Formato do arquivo</span>
          <select className="win-lista-op" value={formato} aria-label="Formato do arquivo"
            onChange={e => aoMudarFormato(e.target.value)}>
            <option value="rar">RAR</option>
            <option value="zip">ZIP</option>
          </select>
        </label>
        <label style={{ flex: 1 }}>
          <span className="win-rotulo-campo">Método de compressão</span>
          <select className="win-lista-op" defaultValue="normal" aria-label="Método de compressão">
            <option value="rapido">Rápido</option>
            <option value="normal">Normal</option>
            <option value="otimo">Ótimo</option>
          </select>
        </label>
      </div>

      {/* Essa opção existe mesmo, e é a razão do engano: quem marca acha que
          "compactar apaga". Deixá-la à vista, desmarcada, é o que ensina que
          apagar é escolha à parte. */}
      <label className="win-marca">
        <input type="checkbox" checked={apagar} onChange={e => aoMudarApagar(e.target.checked)} />
        Apagar os arquivos depois de compactar
      </label>

      <p style={{ fontSize: 11.5, color: '#5B5B5B' }}>
        <FileArchive className="w-3.5 h-3.5 inline mr-1" style={{ color: '#5B5B5B' }} />
        O arquivo compactado é criado na mesma pasta.
      </p>
    </div>
  );
}

/** O corpo do diálogo de extração do WinRAR. */
export function ControlesDeExtrair({ destino }: { destino: string }) {
  return (
    <div className="flex flex-col gap-3">
      <label>
        <span className="win-rotulo-campo">Caminho de destino</span>
        <input className="win-campo" value={destino} readOnly aria-label="Caminho de destino" />
      </label>

      <div>
        <span className="win-rotulo-campo">Modo de atualização</span>
        <label className="win-marca" style={{ marginBottom: 4 }}>
          <input type="radio" name="modo" defaultChecked readOnly /> Extrair e substituir arquivos
        </label>
        <label className="win-marca" style={{ color: '#767676' }}>
          <input type="radio" name="modo" disabled /> Extrair e atualizar arquivos
        </label>
      </div>
    </div>
  );
}
