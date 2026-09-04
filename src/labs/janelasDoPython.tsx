import { useEffect, useRef, useState } from 'react';
import { Globe, FileText, Terminal, Package, Search, ShieldAlert } from 'lucide-react';
import { BarraDeJanela, DialogoDoWindows } from './windows';
import {
  VERSAO, PASTA_DOCUMENTOS, TITULO_DA_JANELA, prompt, rodarComando,
  type EstadoDoAmbiente, type Origem, type Instalacao, type Janela,
} from './ambientePython';

/**
 * As janelas do computador simulado da CC002.
 *
 * ── Por que não reaproveitam o instalador da AP042 ──────────────────────
 * Aquele é o assistente do Inno Setup — idioma, contrato, pasta, atalhos —, que
 * é o de quase todo programa de Windows e não é o do Python. O do python.org é
 * uma tela só, com dois botões grandes e duas caixas embaixo. Vestir um de
 * outro pareceria economia e ensinaria uma tela que o desbravador não vai
 * encontrar: a caixa "Add python.exe to PATH" só existe ali, e é ela que faz
 * a diferença entre o computador funcionar e não funcionar.
 *
 * O que se reaproveita é o que é do Windows e não do programa: a moldura de
 * janela, o diálogo do sistema e o controle de conta de usuário — de
 * `windows.tsx`, que é onde as peças compartilhadas moram.
 */

/* Locais, e não exportados: um módulo que exporta qualquer coisa além de
   componente perde o Fast Refresh inteiro. O tipo e os títulos moram no modelo,
   em `ambientePython.ts`. */
const ICONE_DA_JANELA: Record<Janela, React.ReactNode> = {
  navegador: <Globe className="w-4 h-4" style={{ color: '#0F6CBD' }} />,
  instalador: <Package className="w-4 h-4" style={{ color: '#3776AB' }} />,
  notas: <FileText className="w-4 h-4" style={{ color: '#5A5A5A' }} />,
  prompt: <Terminal className="w-4 h-4" style={{ color: '#1B1B1B' }} />,
};

interface Fechavel { aoMinimizar: () => void; aoFechar: () => void }

/* ────────────────────────────────────────────────────────────────────────
   O navegador
   ──────────────────────────────────────────────────────────────────────── */

/*
  A busca vem antes do site, e não é enfeite.

  O primeiro resultado é sempre o que promete "download rápido, sem cadastro" —
  é assim que a busca real se parece, e escolher errado aqui é de graça. No
  computador do clube, não.
*/
const RESULTADOS: [Origem, string, string, string][] = [
  ['agregador', 'Baixar Python 3 grátis — download rápido',
    'baixe-programas-gratis.com › python',
    'Instalador completo, sem cadastro. Recomendado por nossos usuários.'],
  ['oficial', 'Welcome to Python.org',
    'www.python.org',
    'The official home of the Python Programming Language.'],
  ['agregador', 'Python 3.14 Full + Ativador 2026',
    'programas-full-download.net › python-3-14',
    'Versão completa liberada. Baixe já e instale sem limite.'],
];

export function JanelaNavegador({
  aviso, baixando, aoEscolher, aoBaixar, aoAbrirBaixado, baixado, aoMinimizar, aoFechar,
}: Fechavel & {
  /** O que a escolha errada rendeu, para aparecer na própria página. */
  aviso: string | null;
  /** Progresso de 0 a 100, ou null quando não há download em curso. */
  baixando: number | null;
  baixado: boolean;
  aoEscolher: (o: Origem) => void;
  aoBaixar: () => void;
  aoAbrirBaixado: () => void;
}) {
  const [pagina, setPagina] = useState<'busca' | 'oficial'>('busca');

  return (
    <>
      <BarraDeJanela icone={ICONE_DA_JANELA.navegador} titulo={TITULO_DA_JANELA.navegador}
        aoMinimizar={aoMinimizar} aoFechar={aoFechar} />
      <div className="win-endereco">
        <Search className="w-3.5 h-3.5" style={{ color: '#5A5A5A' }} />
        <span>{pagina === 'busca' ? 'buscar: baixar python' : 'https://www.python.org/downloads/'}</span>
      </div>
      <div className="win-corpo" style={{ background: '#FFFFFF', padding: 14, overflow: 'auto' }}>
        {pagina === 'busca' ? (
          <div className="flex flex-col gap-3">
            {aviso && (
              <p style={{ fontSize: 12, color: '#8A5700', background: '#FFF4CE', padding: '8px 10px', borderRadius: 4 }}>
                {aviso}
              </p>
            )}
            {RESULTADOS.map(([origem, titulo, endereco, descricao]) => (
              <button key={titulo} className="text-left"
                onClick={() => { aoEscolher(origem); if (origem === 'oficial') setPagina('oficial'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <span style={{ display: 'block', fontSize: 12, color: '#3C4043' }}>{endereco}</span>
                <span style={{ display: 'block', fontSize: 15, color: '#1A0DAB' }}>{titulo}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: '#4D5156' }}>{descricao}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div style={{ background: '#306998', color: '#FFF', padding: '10px 14px', borderRadius: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>python</span>
              <span style={{ fontSize: 15, color: '#FFD43B' }}>™</span>
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>Download Python {VERSAO}</p>
              <p style={{ fontSize: 12.5, color: '#4D5156', marginTop: 4 }}>
                Windows installer (64-bit) · 27 MB
              </p>
            </div>
            {baixando !== null ? (
              <div>
                <div style={{ height: 6, background: '#E5E5E5', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${baixando}%`, background: '#3776AB' }} />
                </div>
                <p style={{ fontSize: 12, color: '#4D5156', marginTop: 6 }}>
                  Baixando python-{VERSAO}-amd64.exe… {baixando}%
                </p>
              </div>
            ) : baixado ? (
              <div className="flex items-center gap-3" style={{ borderTop: '1px solid #E5E5E5', paddingTop: 10 }}>
                <Package className="w-4 h-4" style={{ color: '#3776AB' }} />
                <span style={{ fontSize: 12.5 }}>python-{VERSAO}-amd64.exe</span>
                <button className="win-bt primario" onClick={aoAbrirBaixado}>Abrir</button>
              </div>
            ) : (
              <button className="win-bt primario" style={{ alignSelf: 'flex-start' }} onClick={aoBaixar}>
                Download Python {VERSAO}
              </button>
            )}
            <button onClick={() => setPagina('busca')}
              style={{ alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#1A0DAB' }}>
              ← voltar à busca
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   O instalador do Python
   ──────────────────────────────────────────────────────────────────────── */

const DESTINO = 'C:\\Users\\desbravador\\AppData\\Local\\Programs\\Python\\Python314';

/* Os arquivos que passam na barra. São os que o instalador do Python copia
   mesmo — quem já instalou reconhece a lista correndo. */
const COPIADOS = [
  'python.exe', 'python314.dll', 'Lib\\os.py', 'Lib\\json\\__init__.py',
  'Lib\\tkinter\\__init__.py', 'Scripts\\pip.exe', 'Lib\\idlelib\\idle.py', 'py.exe',
];

type EtapaDoInstalador = 'inicio' | 'uac' | 'instalando' | 'fim' | 'modificar' | 'opcoes';

export function JanelaInstalador({ jaInstalado, aoInstalar, aoMinimizar, aoFechar }: Fechavel & {
  /** Quando já há Python, o instalador abre em "Modify Setup", como o de verdade. */
  jaInstalado: Instalacao | null;
  aoInstalar: (escolhas: Instalacao) => void;
}) {
  const [etapa, setEtapa] = useState<EtapaDoInstalador>(jaInstalado ? 'modificar' : 'inicio');
  const [noPath, setNoPath] = useState(jaInstalado?.noPath ?? false);
  const [comLancador, setComLancador] = useState(jaInstalado?.comLancador ?? true);
  const [progresso, setProgresso] = useState(0);

  /* A barra anda sozinha, como toda barra de instalação. Sem isto, "instalando"
     seria uma palavra na tela, e o que se reconhece depois é o tempo. */
  useEffect(() => {
    if (etapa !== 'instalando') return;
    const t = setInterval(() => {
      setProgresso(p => {
        if (p >= 100) { clearInterval(t); setEtapa('fim'); aoInstalar({ noPath, comLancador }); return 100; }
        return p + 5;
      });
    }, 90);
    return () => clearInterval(t);
  }, [etapa, noPath, comLancador, aoInstalar]);

  const caixa = (marcada: boolean, aoTrocar: () => void, rotulo: React.ReactNode) => (
    <label className="flex items-start gap-2" style={{ fontSize: 12.5, cursor: 'pointer' }}>
      <input type="checkbox" checked={marcada} onChange={aoTrocar} style={{ marginTop: 2 }} />
      <span>{rotulo}</span>
    </label>
  );

  return (
    <>
      <BarraDeJanela icone={ICONE_DA_JANELA.instalador} titulo={TITULO_DA_JANELA.instalador}
        aoMinimizar={aoMinimizar} aoFechar={aoFechar} />
      <div className="win-corpo" style={{ background: '#FFFFFF', overflow: 'auto' }}>
        {/* A faixa azul do topo, que é a cara desse instalador. */}
        <div style={{ background: 'linear-gradient(90deg,#3776AB,#4B8BBE)', color: '#FFF', padding: '14px 16px' }}>
          <p style={{ fontSize: 15, fontWeight: 600 }}>
            {etapa === 'modificar' ? 'Modify Setup'
              : etapa === 'opcoes' ? 'Advanced Options'
                : etapa === 'fim' ? 'Setup was successful'
                  : etapa === 'instalando' ? 'Setup Progress'
                    : `Install Python ${VERSAO} (64-bit)`}
          </p>
          <p style={{ fontSize: 11.5, opacity: .9 }}>python.org</p>
        </div>

        <div style={{ padding: 16 }}>
          {etapa === 'inicio' && (
            <div className="flex flex-col gap-3">
              <button className="text-left" onClick={() => setEtapa('uac')}
                style={{ background: '#F3F3F3', border: '1px solid #C9C9C9', borderRadius: 6, padding: 12, cursor: 'pointer' }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1B1B1B' }}>Install Now</span>
                <span style={{ display: 'block', fontSize: 11, color: '#5A5A5A', wordBreak: 'break-all' }}>{DESTINO}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: '#5A5A5A', marginTop: 6 }}>
                  Includes IDLE, pip and documentation
                </span>
              </button>
              <button className="text-left" onClick={() => setEtapa('opcoes')}
                style={{ background: '#F3F3F3', border: '1px solid #C9C9C9', borderRadius: 6, padding: 12, cursor: 'pointer' }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1B1B1B' }}>Customize installation</span>
                <span style={{ display: 'block', fontSize: 11.5, color: '#5A5A5A' }}>Choose location and features</span>
              </button>

              {/*
                As duas caixas do rodapé, na ordem e no estado em que aparecem.
                "Add python.exe to PATH" vem DESMARCADA de verdade, e é por isso
                que meio mundo instala o Python e o prompt não o encontra. Marcá-la
                por padrão aqui seria poupar o desbravador do problema que a lição
                existe para ensinar.
              */}
              <div className="flex flex-col gap-2" style={{ borderTop: '1px solid #E5E5E5', paddingTop: 12 }}>
                {caixa(comLancador, () => setComLancador(v => !v),
                  <>Use admin privileges when installing py.exe</>)}
                {caixa(noPath, () => setNoPath(v => !v),
                  <><strong>Add python.exe to PATH</strong></>)}
              </div>
            </div>
          )}

          {etapa === 'opcoes' && (
            <div className="flex flex-col gap-3">
              <p style={{ fontSize: 12.5, color: '#5A5A5A' }}>
                É aqui que se acrescenta o Python às variáveis de ambiente, se a caixa
                da primeira tela tiver passado batido.
              </p>
              {caixa(noPath, () => setNoPath(v => !v), <>Add Python to environment variables</>)}
              {caixa(comLancador, () => setComLancador(v => !v), <>Install py launcher for all users</>)}
              <div className="flex gap-2" style={{ marginTop: 8 }}>
                <button className="win-bt" onClick={() => setEtapa(jaInstalado ? 'modificar' : 'inicio')}>Voltar</button>
                <button className="win-bt primario" onClick={() => setEtapa('uac')}>Install</button>
              </div>
            </div>
          )}

          {etapa === 'modificar' && (
            <div className="flex flex-col gap-3">
              <p style={{ fontSize: 12.5, color: '#5A5A5A' }}>
                O Python {VERSAO} já está instalado neste computador.
              </p>
              <button className="win-bt" onClick={() => setEtapa('opcoes')}>Modify</button>
              <button className="win-bt" onClick={() => setEtapa('uac')}>Repair</button>
            </div>
          )}

          {etapa === 'instalando' && (
            <div className="flex flex-col gap-3">
              <p style={{ fontSize: 12.5 }}>
                Installing: {COPIADOS[Math.min(COPIADOS.length - 1, Math.floor(progresso / (100 / COPIADOS.length)))]}
              </p>
              <div style={{ height: 8, background: '#E5E5E5', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progresso}%`, background: '#3776AB', transition: 'width .09s linear' }} />
              </div>
            </div>
          )}

          {etapa === 'fim' && (
            <div className="flex flex-col gap-3">
              <p style={{ fontSize: 13 }}>
                O Python {VERSAO} foi instalado
                {noPath
                  ? ' e acrescentado ao PATH: o prompt vai reconhecer o comando python.'
                  : ' — mas sem acrescentá-lo ao PATH.'}
              </p>
              {!noPath && (
                <p style={{ fontSize: 12, color: '#8A5700', background: '#FFF4CE', padding: '8px 10px', borderRadius: 4 }}>
                  A caixa "Add python.exe to PATH" ficou desmarcada. O instalador não
                  reclama disso — quem reclama é o prompt, mais tarde. Dá para voltar
                  aqui e usar Modify.
                </p>
              )}
              <button className="win-bt primario" style={{ alignSelf: 'flex-start' }} onClick={aoFechar}>Close</button>
            </div>
          )}
        </div>
      </div>

      {etapa === 'uac' && (
        <DialogoDoWindows
          titulo="Controle de Conta de Usuário"
          acoes={<>
            <button className="win-bt primario" onClick={() => { setProgresso(0); setEtapa('instalando'); }}>Sim</button>
            <button className="win-bt" onClick={() => setEtapa(jaInstalado ? 'modificar' : 'inicio')}>Não</button>
          </>}
        >
          <div className="flex gap-3">
            <ShieldAlert className="w-8 h-8 flex-none" style={{ color: '#0F6CBD' }} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 600 }}>
                Deseja permitir que este aplicativo faça alterações no seu dispositivo?
              </p>
              <p style={{ fontSize: 12, color: '#5A5A5A', marginTop: 6 }}>
                python-{VERSAO}-amd64.exe<br />
                Fornecedor verificado: Python Software Foundation
              </p>
            </div>
          </div>
        </DialogoDoWindows>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   O Bloco de Notas
   ──────────────────────────────────────────────────────────────────────── */

type TipoDeArquivo = 'txt' | 'todos';

/**
 * O Bloco de Notas, com a armadilha que ele tem de verdade.
 *
 * Salvar `programa.py` com o tipo em "Documentos de texto" grava
 * `programa.py.txt` — o Bloco de Notas acrescenta a extensão sem avisar, e o
 * nome que fica na tela do "Salvar como" não é o nome que fica no disco. É a
 * causa nº 1 de "eu salvei e o Python não acha".
 */
export function JanelaNotas({ texto, aoEscrever, aoSalvar, aoMinimizar, aoFechar }: Fechavel & {
  texto: string;
  aoEscrever: (t: string) => void;
  aoSalvar: (nome: string, conteudo: string) => void;
}) {
  const [salvando, setSalvando] = useState(false);
  const [nome, setNome] = useState('programa.py');
  const [tipo, setTipo] = useState<TipoDeArquivo>('txt');

  const nomeFinal = tipo === 'txt' && !nome.toLowerCase().endsWith('.txt') ? `${nome}.txt` : nome;

  return (
    <>
      <BarraDeJanela icone={ICONE_DA_JANELA.notas} titulo={`${TITULO_DA_JANELA.notas} — programa`}
        aoMinimizar={aoMinimizar} aoFechar={aoFechar} />
      {/* Os botões vão sem classe: quem os desenha é `.win-menus > button`.
          `.win-menu`, no singular, é o menu suspenso — `position: fixed` —, e
          usá-lo aqui empilhava os três por cima uns dos outros. */}
      <div className="win-menus">
        <button onClick={() => setSalvando(true)}>Arquivo</button>
        <button>Editar</button>
        <button>Exibir</button>
      </div>
      <div className="win-corpo" style={{ background: '#FFFFFF' }}>
        <textarea
          value={texto}
          onChange={e => aoEscrever(e.target.value)}
          spellCheck={false}
          aria-label="Texto do Bloco de Notas"
          style={{
            width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none',
            padding: 10, fontFamily: 'Consolas, monospace', fontSize: 13, lineHeight: 1.5,
            color: '#1B1B1B', background: 'transparent',
          }}
        />
      </div>
      <div className="win-status">
        <span>Ln 1, Col 1</span>
        <span style={{ marginLeft: 'auto' }}>UTF-8</span>
      </div>

      {salvando && (
        <DialogoDoWindows
          titulo="Salvar como"
          acoes={<>
            <button className="win-bt primario"
              onClick={() => { aoSalvar(nomeFinal, texto); setSalvando(false); }}>Salvar</button>
            <button className="win-bt" onClick={() => setSalvando(false)}>Cancelar</button>
          </>}
        >
          <div className="flex flex-col gap-3">
            <p style={{ fontSize: 12, color: '#5A5A5A' }}>Salvar em: {PASTA_DOCUMENTOS}</p>
            <label className="flex items-center gap-2" style={{ fontSize: 12.5 }}>
              <span style={{ width: 108 }}>Nome do arquivo:</span>
              <input className="win-campo" value={nome} onChange={e => setNome(e.target.value)}
                aria-label="Nome do arquivo" style={{ flex: 1 }} />
            </label>
            <label className="flex items-center gap-2" style={{ fontSize: 12.5 }}>
              <span style={{ width: 108 }}>Tipo:</span>
              <select className="win-campo" value={tipo} aria-label="Tipo do arquivo"
                onChange={e => setTipo(e.target.value as TipoDeArquivo)} style={{ flex: 1 }}>
                <option value="txt">Documentos de texto (*.txt)</option>
                <option value="todos">Todos os arquivos (*.*)</option>
              </select>
            </label>
            {/* O nome de verdade, à vista. O Bloco de Notas não mostra isto — e é
                exatamente por não mostrar que o erro passa. Aqui aparece porque a
                lição é sobre isso; a consequência de ignorá-lo continua valendo. */}
            <p style={{ fontSize: 12, color: nomeFinal === nome ? '#0F6CBD' : '#8A5700' }}>
              Vai ser salvo como: <strong>{nomeFinal}</strong>
            </p>
          </div>
        </DialogoDoWindows>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   O Prompt de Comando
   ──────────────────────────────────────────────────────────────────────── */

export function JanelaPrompt({ estado, aoMudar, aoMinimizar, aoFechar }: Fechavel & {
  estado: EstadoDoAmbiente;
  aoMudar: (e: EstadoDoAmbiente) => void;
}) {
  const [linha, setLinha] = useState('');
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => { fim.current?.scrollIntoView({ block: 'end' }); }, [estado.historico]);

  /* A transcrição vem pronta de `rodarComando`: a tela não decide o que
     aparece no prompt, só mostra. */
  const enviar = () => {
    aoMudar(rodarComando(linha, estado).estado);
    setLinha('');
  };

  return (
    <>
      <BarraDeJanela icone={ICONE_DA_JANELA.prompt} titulo={TITULO_DA_JANELA.prompt}
        aoMinimizar={aoMinimizar} aoFechar={aoFechar} />
      {/* Preto, monoespaçado, e a linha de boas-vindas do Windows. Reconhecer a
          tela é parte do que a lição entrega. */}
      {/* `.win-corpo` é flex em linha — é o que serve às janelas com painel
          lateral. O prompt é uma coluna, e sem esta caixa de dentro o texto e o
          cursor viravam duas colunas lado a lado no meio da tela. */}
      <div className="win-corpo" style={{ background: '#0C0C0C' }}>
        <div onClick={e => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}
          style={{
            flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
            color: '#CCCCCC', padding: 10, overflow: 'auto', cursor: 'text',
          }}>
        <pre style={{ margin: 0, fontFamily: 'Consolas, monospace', fontSize: 13, lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
{`Microsoft Windows [versão 10.0.26100.2033]
(c) Microsoft Corporation. Todos os direitos reservados.
`}
          {estado.historico.join('\n')}
        </pre>
        <div className="flex items-center" style={{ fontFamily: 'Consolas, monospace', fontSize: 13 }}>
          <span style={{ whiteSpace: 'pre' }}>{prompt(estado)}</span>
          <input
            value={linha}
            onChange={e => setLinha(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); enviar(); } }}
            aria-label="Linha de comando"
            spellCheck={false}
            autoComplete="off"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#CCCCCC', fontFamily: 'inherit', fontSize: 'inherit', padding: 0,
            }}
          />
        </div>
          <div ref={fim} />
        </div>
      </div>
    </>
  );
}
