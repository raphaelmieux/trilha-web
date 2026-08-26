import { useEffect, useState } from 'react';
import {
  FileText, FileType2, Image as IconeImagem, Music, Play, Pause,
  SkipBack, SkipForward, Volume2, ZoomIn, ZoomOut, Printer, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { BarraDeJanela } from './windows';
import type { FamiliaDeArquivo } from './tiposDeArquivo';

/*
 * Os programas que abrem um arquivo quando se dá dois cliques nele.
 *
 * Antes, dois cliques num .jpg respondiam "isto abriria no programa do
 * computador. Aqui o que interessa é mexer nele". Era verdade e era um muro:
 * a janela inteira dizia "computador", e no primeiro gesto de curiosidade
 * dizia "aqui não". Simulação que só funciona no caminho previsto ensina a
 * pessoa a andar no trilho, e o desbravador vai ter de se virar fora dele.
 *
 * Então todo arquivo abre. Não porque cada visualizador tenha algo a ensinar,
 * mas porque *não abrir* desensina: quebra a única coisa que a janela toda
 * estava construindo, que é a impressão de estar num computador de verdade.
 *
 * Como toda superfície clara desta trilha, cada um declara a própria cor — a
 * plataforma é escura e pinta h1..h4 de quase branco.
 */

interface Fechavel { aoMinimizar: () => void; aoFechar: () => void }

/* ── O conteúdo de cada arquivo ────────────────────────────────────────────
   Escrito por nome, e não genérico: abrir "o que levar.txt" e encontrar
   "conteúdo de exemplo" seria o mesmo muro de antes, com mais passos. */

const TEXTOS: Record<string, string> = {
  'o que levar.txt': `O QUE LEVAR PARA O ACAMPAMENTO

- saco de dormir
- isolante térmico
- lanterna e pilhas
- prato, caneca e talheres
- roupa de frio (a noite esfria na serra)
- capa de chuva
- repelente
- Bíblia e caderno

NÃO levar: aparelho de som, faca, dinheiro além do lanche.

Qualquer dúvida, falar com o conselheiro da unidade.`,
};

const TEXTO_PADRAO = `Este arquivo de texto está vazio.

O Bloco de Notas abre qualquer arquivo .txt e mostra só as letras: sem
negrito, sem margem, sem imagem. É por isso que ele é leve e abre na hora.`;

const PDFS: Record<string, { titulo: string; paginas: string[][] }> = {
  'ata da reunião.pdf': {
    titulo: 'Ata da reunião de 21 de agosto',
    paginas: [[
      'Presentes: conselheiro, secretária e sete desbravadores da unidade.',
      'Ausentes justificados: dois, por prova na escola.',
      'A unidade decidiu levar o cartaz das especialidades para a próxima reunião do clube.',
      'A secretária ficou de mandar a lista de presença até quarta-feira.',
    ], [
      'Segundo assunto: o acampamento de setembro.',
      'Cada desbravador leva o próprio prato e caneca. O clube leva as barracas.',
      'A saída é às 6h da manhã, do pátio da igreja.',
      'Nada mais havendo a tratar, a reunião foi encerrada com oração.',
    ]],
  },
  'cantina.pdf': {
    titulo: 'Cardápio da cantina do clube',
    paginas: [[
      'Sanduíche natural — R$ 6,00',
      'Suco de laranja — R$ 4,00',
      'Bolo de cenoura (fatia) — R$ 3,50',
      'Água — R$ 2,00',
      '',
      'A cantina funciona no intervalo, e o dinheiro vai para o fundo do acampamento.',
    ]],
  },
};

const DOCUMENTOS: Record<string, { titulo: string; linhas: string[] }> = {
  'especialidades.docx': {
    titulo: 'Especialidades da Unidade Falcão',
    linhas: [
      'AP034 Informática Básica — cinco concluíram',
      'AP035 Internet — três concluíram, dois em andamento',
      'AP041 Computação 1 — quatro em andamento',
      'AP042 Computação 2 — começa depois do acampamento',
      '',
      'Meta do semestre: cada desbravador com pelo menos duas especialidades novas.',
    ],
  },
};

/* ── Fotos ─────────────────────────────────────────────────────────────────
   O desenho é feito aqui, em SVG, e não guardado como imagem: um .jpg no
   repositório teria de ser baixado, e a foto não é a matéria — o programa é. */

function Fogueira() {
  return (
    <svg viewBox="0 0 320 220" style={{ width: '100%', height: '100%' }} aria-label="fogueira à noite">
      <defs>
        <radialGradient id="brilho" cx="50%" cy="72%" r="55%">
          <stop offset="0%" stopColor="#FFD27F" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0B1020" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="220" fill="#0B1020" />
      {[[40, 30], [90, 22], [150, 34], [210, 26], [270, 38], [60, 60], [190, 62], [250, 70]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.4} fill="#FFFFFF" opacity={0.85} />
      ))}
      <path d="M0 165 L60 140 L120 158 L190 132 L260 152 L320 138 L320 220 L0 220 Z" fill="#131A2E" />
      <rect width="320" height="220" fill="url(#brilho)" />
      <path d="M128 186 L196 158" stroke="#6B4A2B" strokeWidth="7" strokeLinecap="round" />
      <path d="M196 186 L128 158" stroke="#5A3E24" strokeWidth="7" strokeLinecap="round" />
      <path d="M140 182 L184 182" stroke="#6B4A2B" strokeWidth="6" strokeLinecap="round" />
      <path d="M162 106 C182 132, 188 148, 178 164 C170 176, 154 176, 146 164 C136 148, 142 132, 162 106 Z" fill="#F5A623" />
      <path d="M162 128 C173 144, 176 154, 170 163 C165 170, 157 170, 153 163 C147 154, 151 144, 162 128 Z" fill="#FFD861" />
      <ellipse cx="162" cy="186" rx="52" ry="9" fill="#F5A623" opacity="0.16" />
    </svg>
  );
}

export function JanelaFotos({ nome, aoMinimizar, aoFechar }: Fechavel & { nome: string }) {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="win-janela media">
      <BarraDeJanela
        icone={<IconeImagem className="w-4 h-4" style={{ color: '#2E7D32' }} />}
        titulo={`${nome} — Fotos`}
        aoMinimizar={aoMinimizar}
        aoFechar={aoFechar}
      />
      <div className="win-barra" style={{ justifyContent: 'center' }}>
        <button className="win-cmd" aria-label="Diminuir o zoom" onClick={() => setZoom(z => Math.max(40, z - 20))}>
          <ZoomOut className="w-4 h-4" />
        </button>
        <span style={{ fontSize: 12, width: 48, textAlign: 'center' }}>{zoom}%</span>
        <button className="win-cmd" aria-label="Aumentar o zoom" onClick={() => setZoom(z => Math.min(200, z + 20))}>
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
      <div style={{
        flex: 1, minHeight: 0, overflow: 'auto', background: '#1B1B1B',
        display: 'grid', placeItems: 'center', padding: 16,
      }}>
        <div style={{ width: `${zoom * 3.2}px`, maxWidth: '100%' }}>
          <Fogueira />
        </div>
      </div>
      <div className="win-status">
        <span>1 de 1</span>
        <span>1600 × 1100</span>
      </div>
    </div>
  );
}

/* ── Bloco de Notas ────────────────────────────────────────────────────────── */

export function JanelaBlocoDeNotas({ nome, aoMinimizar, aoFechar }: Fechavel & { nome: string }) {
  const texto = TEXTOS[nome] ?? TEXTO_PADRAO;

  return (
    <div className="win-janela media">
      <BarraDeJanela
        icone={<FileText className="w-4 h-4" style={{ color: '#5B5B5B' }} />}
        titulo={`${nome} — Bloco de Notas`}
        aoMinimizar={aoMinimizar}
        aoFechar={aoFechar}
      />
      <div className="win-menus">
        {['Arquivo', 'Editar', 'Formatar', 'Exibir', 'Ajuda'].map(m => <button key={m}>{m}</button>)}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: '#FFFFFF', padding: 12 }}>
        <pre style={{
          margin: 0, fontFamily: 'Consolas, monospace', fontSize: 13, lineHeight: 1.5,
          color: '#1B1B1B', whiteSpace: 'pre-wrap',
        }}>{texto}</pre>
      </div>
      <div className="win-status">
        <span>Ln 1, Col 1</span>
        <span style={{ marginLeft: 'auto' }}>100%</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}

/* ── Tocador de Mídia ──────────────────────────────────────────────────────── */

const DURACAO = 154;

const relogio = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function JanelaTocador({ nome, aoMinimizar, aoFechar }: Fechavel & { nome: string }) {
  const [tocando, setTocando] = useState(false);
  const [em, setEm] = useState(0);

  useEffect(() => {
    if (!tocando) return;
    const passo = setInterval(() => {
      setEm(t => {
        if (t + 1 >= DURACAO) { setTocando(false); return DURACAO; }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(passo);
  }, [tocando]);

  return (
    <div className="win-janela media">
      <BarraDeJanela
        icone={<Music className="w-4 h-4" style={{ color: '#6B2E8F' }} />}
        titulo={`${nome} — Tocador de Mídia`}
        aoMinimizar={aoMinimizar}
        aoFechar={aoFechar}
      />
      <div style={{
        flex: 1, minHeight: 0, background: '#1E1E28', color: '#FFFFFF',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 14, padding: 20,
      }}>
        <div style={{
          width: 116, height: 116, borderRadius: '50%', display: 'grid', placeItems: 'center',
          background: 'radial-gradient(circle, #4A4A5C 0%, #23232E 70%)',
          border: '6px solid #2C2C38',
        }}>
          <Music className="w-9 h-9" style={{ color: '#B9A6D6' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>{nome.replace(/\.[^.]+$/, '')}</p>
          <p style={{ fontSize: 12, color: '#A8A8B8' }}>Clube de Desbravadores · álbum desconhecido</p>
        </div>

        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ height: 4, borderRadius: 2, background: '#3A3A48', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(em / DURACAO) * 100}%`, background: '#8B6FC0' }} />
          </div>
          <div className="flex" style={{ justifyContent: 'space-between', fontSize: 11, color: '#A8A8B8', marginTop: 4 }}>
            <span>{relogio(em)}</span>
            <span>{relogio(DURACAO)}</span>
          </div>
        </div>

        <div className="flex items-center" style={{ gap: 16 }}>
          <button aria-label="Anterior" onClick={() => setEm(0)} style={{ color: '#C8C8D4' }}>
            <SkipBack className="w-5 h-5" />
          </button>
          <button aria-label={tocando ? 'Pausar' : 'Tocar'}
            onClick={() => setTocando(t => !t)}
            style={{
              width: 44, height: 44, borderRadius: '50%', background: '#8B6FC0',
              display: 'grid', placeItems: 'center', color: '#FFFFFF',
            }}>
            {tocando ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button aria-label="Próxima" onClick={() => setEm(DURACAO)} style={{ color: '#C8C8D4' }}>
            <SkipForward className="w-5 h-5" />
          </button>
          <Volume2 className="w-4 h-4" style={{ color: '#A8A8B8', marginLeft: 8 }} />
        </div>
      </div>
      <div className="win-status">
        <span>{tocando ? 'Reproduzindo' : em >= DURACAO ? 'Concluído' : 'Pausado'}</span>
        <span style={{ marginLeft: 'auto' }}>MP3 · 128 kbps</span>
      </div>
    </div>
  );
}

/* ── Leitor de PDF ─────────────────────────────────────────────────────────── */

export function JanelaLeitorPdf({ nome, aoAvisar, aoMinimizar, aoFechar }: Fechavel & {
  nome: string; aoAvisar: (o: string) => void;
}) {
  const doc = PDFS[nome];
  const paginas = doc?.paginas ?? [['Este documento não tem páginas.']];
  const [pagina, setPagina] = useState(0);

  return (
    <div className="win-janela media">
      <BarraDeJanela
        icone={<FileType2 className="w-4 h-4" style={{ color: '#B71C1C' }} />}
        titulo={`${nome} — Leitor de PDF`}
        aoMinimizar={aoMinimizar}
        aoFechar={aoFechar}
      />
      <div className="win-barra">
        <button className="win-cmd" aria-label="Página anterior"
          disabled={pagina === 0} onClick={() => setPagina(p => p - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span style={{ fontSize: 12 }}>{pagina + 1} de {paginas.length}</span>
        <button className="win-cmd" aria-label="Próxima página"
          disabled={pagina >= paginas.length - 1} onClick={() => setPagina(p => p + 1)}>
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="win-sep" />
        <button className="win-cmd" aria-label="Imprimir" onClick={() => aoAvisar('Imprimir daqui')}>
          <Printer className="w-4 h-4" />
          <span className="win-rotulo">Imprimir</span>
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: '#525659', padding: 16 }}>
        <div style={{
          maxWidth: 520, margin: '0 auto', background: '#FFFFFF', color: '#1B1B1B',
          padding: '30px 34px', boxShadow: '0 2px 12px rgba(0,0,0,.45)', fontSize: 12.5, lineHeight: 1.7,
        }}>
          {pagina === 0 && (
            <p style={{ fontSize: 15, fontWeight: 700, textAlign: 'center', marginBottom: 14 }}>
              {doc?.titulo ?? nome}
            </p>
          )}
          {paginas[pagina].map((linha, i) => (
            <p key={i} style={{ marginBottom: 8, minHeight: linha ? undefined : 10 }}>{linha}</p>
          ))}
        </div>
      </div>
      <div className="win-status">
        {/* O que o pdf é, dito onde a pessoa está olhando para ele. */}
        <span>O texto não muda: o pdf guarda a página pronta, do jeito que foi salva.</span>
      </div>
    </div>
  );
}

/* ── Editor de Texto ───────────────────────────────────────────────────────── */

export function JanelaDocumento({ nome, aoMinimizar, aoFechar }: Fechavel & { nome: string }) {
  const doc = DOCUMENTOS[nome];

  return (
    <div className="win-janela media">
      <BarraDeJanela
        icone={<FileText className="w-4 h-4" style={{ color: '#1F6FB2' }} />}
        titulo={`${nome} — Editor de Texto`}
        aoMinimizar={aoMinimizar}
        aoFechar={aoFechar}
      />
      <div className="win-menus">
        {['Arquivo', 'Editar', 'Exibir', 'Inserir', 'Formatar'].map(m => <button key={m}>{m}</button>)}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: '#9E9E9E', padding: 16 }}>
        <div style={{
          maxWidth: 520, margin: '0 auto', background: '#FFFFFF', color: '#1B1B1B',
          padding: '28px 32px', boxShadow: '0 2px 10px rgba(0,0,0,.3)', fontSize: 12.5, lineHeight: 1.7,
        }}>
          <p style={{ fontSize: 15, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
            {doc?.titulo ?? nome.replace(/\.[^.]+$/, '')}
          </p>
          {(doc?.linhas ?? ['Documento vazio.']).map((linha, i) => (
            <p key={i} style={{ marginBottom: 6, minHeight: linha ? undefined : 10 }}>{linha}</p>
          ))}
        </div>
      </div>
      <div className="win-status">
        <span>Página 1 de 1</span>
        <span style={{ marginLeft: 'auto' }}>Português (Brasil)</span>
      </div>
    </div>
  );
}

/** A janela certa para o arquivo, já montada. */
export function VisualizadorDe({ nome, familia, aoAvisar, aoMinimizar, aoFechar }: Fechavel & {
  nome: string; familia: FamiliaDeArquivo; aoAvisar: (o: string) => void;
}) {
  const comuns = { nome, aoMinimizar, aoFechar };
  switch (familia) {
    case 'imagem': return <JanelaFotos {...comuns} />;
    case 'texto': return <JanelaBlocoDeNotas {...comuns} />;
    case 'audio': return <JanelaTocador {...comuns} />;
    case 'pdf': return <JanelaLeitorPdf {...comuns} aoAvisar={aoAvisar} />;
    case 'documento': return <JanelaDocumento {...comuns} />;
  }
}
