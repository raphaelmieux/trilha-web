import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Presentation, LayoutTemplate, Copy, Trash2, Plus, ChevronUp, ChevronDown,
  Image as ImageIcon, Video, Music, Layers,
  FileDown, FileText, Minus, Square as SquareIcon, X, Play, Type,
  FileCheck2, RotateCcw, ArrowLeft, Link2,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  APRESENTACAO_INICIAL, METAS_DA_APRESENTACAO, NOMES_DOS_LAYOUTS, NOMES_DOS_MODELOS,
  vazio,
  type Apresentacao, type Slide, type Layout, type Modelo, type Midia,
} from './apresentacaoDoClube';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP044 requisito 9 — os sete itens, num PowerPoint.
 *
 * ── O que a apresentação já traz, e o que falta nela ─────────────────────
 * Ela chega escrita: seis slides, títulos, tópicos. Na tira lateral isso passa
 * por apresentação começada — e é esse o ponto, como no laboratório de estilos.
 * O que falta não é texto: é decisão. Não há modelo escolhido, um slide de
 * tópicos ficou no layout de título, sobrou um slide vazio de um Ctrl+M sem
 * querer, e o encerramento está antes do que ele encerra.
 *
 * ── O que a tela mede, e o que ela não mede ──────────────────────────────
 * O laboratório mede o **layout declarado**, e não a posição que ficou na
 * tela. É de propósito: quem desenha caixa de texto à mão acerta a posição de
 * um slide e erra a do seguinte por alguns milímetros, e a apresentação pisca a
 * cada troca. De dentro, cada slide parece perfeito.
 *
 * ── O vídeo vinculado, e onde a diferença aparece ────────────────────────
 * Inserir tem dois caminhos com o mesmo nome. O vinculado mostra, embaixo do
 * quadro, o caminho do arquivo — que é o que o painel de informações do
 * PowerPoint de verdade relata, e é a única diferença visível antes do dia da
 * apresentação. A outra aparece longe de casa, com o quadro preto.
 *
 * O modelo, o critério e o passo a passo moram em `apresentacaoDoClube.ts`.
 */

const GUIAS = [
  'Arquivo', 'Página Inicial', 'Inserir', 'Desenhar', 'Design', 'Transições',
  'Animações', 'Apresentação de Slides', 'Revisão', 'Exibir', 'Ajuda',
] as const;

const USAVEIS = ['Página Inicial', 'Inserir', 'Design'];

/** As cores de cada modelo, que é o que muda nos seis slides de uma vez. */
const CORES_DO_MODELO: Record<Modelo, { fundo: string; titulo: string; texto: string; faixa: string }> = {
  branco: { fundo: '#FFFFFF', titulo: '#262626', texto: '#404040', faixa: 'transparent' },
  madison: { fundo: '#F4F1EA', titulo: '#7B3F00', texto: '#3D3128', faixa: '#C9A227' },
  facetas: { fundo: '#FFFFFF', titulo: '#1F6F63', texto: '#2E4A45', faixa: '#7FBFA8' },
  berlim: { fundo: '#1B1B1B', titulo: '#FFFFFF', texto: '#D6D6D6', faixa: '#E8562A' },
};

/** Os arquivos que o computador do clube tem, para os diálogos de inserir. */
const FOTOS = ['fogueira.jpg', 'barracas.jpg', 'caminhada.jpg'];
const VIDEOS = ['abertura-2025.mp4'];
const AUDIOS = ['hino-do-clube.mp3'];

const novoSlide = (id: string, layout: Layout): Slide =>
  ({ id, titulo: '', topicos: [], layout, imagens: [], imagensAlinhadas: false, video: 'nenhuma', audio: 'nenhuma' });

export default function ApresentacaoLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [ap, setAp] = useState<Apresentacao>(APRESENTACAO_INICIAL);
  const [guia, setGuia] = useState('Design');
  const [atual, setAtual] = useState(0);
  const [tela, setTela] = useState<'normal' | 'bastidores' | 'pdf'>('normal');
  const [menu, setMenu] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  const slide = ap.slides[Math.min(atual, ap.slides.length - 1)];
  const cores = CORES_DO_MODELO[ap.modelo];

  const tarefas = METAS_DA_APRESENTACAO.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde,
    passos: m.passos, feita: m.feita(ap),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  const fecharMenu = () => setMenu(null);
  const abrir = (id: string) => setMenu(m => (m === id ? null : id));
  const avisar = (recado: string) => { fecharMenu(); setAviso(recado); };
  const naoFazParte = (nome: string) =>
    avisar(`${nome} existe no PowerPoint de verdade, e está aqui para a faixa ficar igual — mas não faz parte deste exercício.`);

  const mudarSlide = (id: string, m: Partial<Slide>) =>
    setAp(a => ({ ...a, slides: a.slides.map(s => (s.id === id ? { ...s, ...m } : s)) }));

  // ── Design ─────────────────────────────────────────────────────────────

  const escolherModelo = (m: Modelo) => {
    fecharMenu();
    setAp(a => ({ ...a, modelo: m }));
    setAviso(m === 'branco'
      ? 'De volta ao branco.'
      : `Modelo ${NOMES_DOS_MODELOS[m]} aplicado. Repare na tira lateral: os ${ap.slides.length} slides mudaram juntos, e não um por um.`);
  };

  // ── Slides ─────────────────────────────────────────────────────────────

  const criarSlide = (layout: Layout) => {
    fecharMenu();
    const novo = novoSlide(`n${Date.now()}`, layout);
    setAp(a => ({ ...a, slides: [...a.slides.slice(0, atual + 1), novo, ...a.slides.slice(atual + 1)] }));
    setAtual(atual + 1);
    setAviso('Slide criado. Ele nasce dentro do modelo, com as caixas do layout escolhido — clique no título para escrever nele.');
  };

  const duplicarSlide = () => {
    fecharMenu();
    setAp(a => ({
      ...a,
      slides: [...a.slides.slice(0, atual + 1), { ...slide, id: `d${Date.now()}` }, ...a.slides.slice(atual + 1)],
    }));
    setAtual(atual + 1);
    setAviso('Duplicado com conteúdo e formatação. A cópia é independente: mexer numa não mexe na outra.');
  };

  const excluirSlide = () => {
    fecharMenu();
    if (ap.slides.length <= 1) { setAviso('Uma apresentação precisa de pelo menos um slide.'); return; }
    setAp(a => ({ ...a, slides: a.slides.filter((_, i) => i !== atual) }));
    setAtual(Math.max(0, atual - 1));
    setAviso('Slide excluído.');
  };

  const mover = (delta: number) => {
    fecharMenu();
    const destino = atual + delta;
    if (destino < 0 || destino >= ap.slides.length) return;
    setAp(a => {
      const s = [...a.slides];
      [s[atual], s[destino]] = [s[destino], s[atual]];
      return { ...a, slides: s };
    });
    setAtual(destino);
    setAviso('Mudar a ordem é montar o raciocínio, e ela quase nunca sai certa de primeira.');
  };

  const trocarLayout = (l: Layout) => {
    fecharMenu();
    mudarSlide(slide.id, { layout: l });
    setAviso(`Layout trocado para ${NOMES_DOS_LAYOUTS[l]}. O layout já traz as caixas nos lugares certos — você preenche, não desenha.`);
  };

  // ── Inserir ────────────────────────────────────────────────────────────

  const inserirFoto = (nome: string) => {
    fecharMenu();
    mudarSlide(slide.id, {
      imagens: [...slide.imagens, { id: `img${Date.now()}`, legenda: nome, largura: 40 }],
      /* Foto nova desfaz o alinhamento: ela entra onde o programa a põe, e não
         onde as outras estão. É o que acontece no PowerPoint. */
      imagensAlinhadas: false,
    });
    setAviso(slide.imagens.length >= 1
      ? 'Segunda foto no slide. Agora alinhe as duas pelo comando, em Organizar — arrastar deixa "quase alinhado", que é o que se vê projetado.'
      : 'Foto inserida. Ela entra com a proporção dela: redimensionar pelo canto mantém, pelo lado estica.');
  };

  const alinharImagens = () => {
    fecharMenu();
    if (slide.imagens.length < 2) {
      setAviso('Alinhar precisa de duas ou mais imagens selecionadas — com uma só não há a que alinhar.');
      return;
    }
    mudarSlide(slide.id, { imagensAlinhadas: true });
    setAviso('Alinhadas pelo comando. Quatro fotos arrastadas ficam quase alinhadas, e "quase" é o que aparece na parede.');
  };

  const inserirMidia = (tipo: 'video' | 'audio', modo: Midia) => {
    fecharMenu();
    mudarSlide(slide.id, tipo === 'video' ? { video: modo } : { audio: modo });
    setAviso(modo === 'incorporada'
      ? `${tipo === 'video' ? 'Vídeo' : 'Áudio'} incorporado: o arquivo foi para dentro da apresentação. Ela fica pesada e toca em qualquer computador.`
      : `${tipo === 'video' ? 'Vídeo' : 'Áudio'} vinculado: só o endereço do arquivo foi guardado. Repare no caminho que apareceu embaixo do quadro — no computador do clube esse caminho não existe.`);
  };

  // ── Exportar ───────────────────────────────────────────────────────────

  const exportarPdf = () => {
    fecharMenu();
    setAp(a => ({ ...a, pdf: a.slides.map(s => s.id) }));
    setTela('pdf');
    setAviso('PDF criado. Ele congela a aparência e abre em qualquer aparelho — em troca é papel: o vídeo não toca, o áudio não toca, a transição não acontece.');
  };

  const recomecar = () => {
    setAp(APRESENTACAO_INICIAL);
    setAtual(0);
    setGuia('Design');
    setTela('normal');
    fecharMenu();
    setAviso('');
  };

  const registrar = async () => {
    setErro('');
    setGravando(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) {
      await ensureEnrollment(userId, specId);
      await updateEnrollmentActivity(userId, specId);
    }
    await registrarConclusaoDeLicao(userId, lessonCode);
    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: METAS_DA_APRESENTACAO.length, total_questions: METAS_DA_APRESENTACAO.length,
      });
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você montou a apresentação, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'apresentacao_concluida', { specialtyCode, lessonCode, metas: METAS_DA_APRESENTACAO.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Apresentação pronta!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Modelo escolhido uma vez para todos os slides, layout no lugar de caixa
          arrastada, mídia que viaja dentro do arquivo — e o PDF para deixar com
          quem pediu. Leve os dois: a apresentação para apresentar, o PDF para
          entregar.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <>
          {erro && <p style={{ fontSize: 11.5, color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary text-sm w-full justify-center">
            {gravando ? 'Guardando…' : 'Entregar a apresentação'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar a apresentação
      </button>
    </div>
  );

  const Bt = ({ dica, rotulo, aoClicar, children, empilhado, ativo }: {
    dica: string; rotulo?: string; aoClicar: () => void;
    children: React.ReactNode; empilhado?: boolean; ativo?: boolean;
  }) => (
    <button type="button" title={dica} aria-label={dica} aria-pressed={ativo}
      onClick={aoClicar} className="pp-bt"
      style={{
        background: ativo ? '#F7DDD7' : 'transparent',
        border: ativo ? '1px solid #E0B6AC' : '1px solid transparent',
        ...(empilhado ? { flexDirection: 'column' as const, height: 'auto', padding: '3px 8px', gap: 2 } : {}),
      }}>
      {children}
      {rotulo && <span style={{ fontSize: 10.5 }}>{rotulo}</span>}
    </button>
  );

  const Grupo = ({ nome, children }: { nome: string; children: React.ReactNode }) => (
    <div className="pp-grupo">
      <div className="pp-grupo-corpo">{children}</div>
      <div className="pp-grupo-nome">{nome}</div>
    </div>
  );

  const Menu = ({ id, children }: { id: string; children: React.ReactNode }) => (
    menu === id ? <div className="pp-menu" role="menu">{children}</div> : null
  );

  const ItemMenu = ({ aoClicar, ativo, children }: {
    aoClicar: () => void; ativo?: boolean; children: React.ReactNode;
  }) => (
    <button type="button" role="menuitem" onClick={aoClicar} className="pp-menu-item"
      style={{ background: ativo ? '#F7DDD7' : 'transparent' }}>{children}</button>
  );

  /** O slide desenhado — no palco e, menor, na tira lateral e no PDF. */
  const desenharSlide = (s: Slide, mini = false) => {
    const f = mini ? 0.28 : 1;
    return (
      <div className="pp-slide" style={{ background: cores.fundo }}>
        {cores.faixa !== 'transparent' && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6 * f, background: cores.faixa }} />
        )}
        {s.layout !== 'em-branco' && (
          <p style={{
            color: cores.titulo, fontSize: 26 * f, fontWeight: 600, lineHeight: 1.15,
            padding: `${(s.layout === 'titulo' ? 60 : 26) * f}px ${28 * f}px ${8 * f}px`,
            textAlign: s.layout === 'titulo' ? 'center' : 'left',
          }}>
            {s.titulo || (mini ? '' : 'Clique para adicionar um título')}
          </p>
        )}
        {s.topicos.length > 0 && (
          <ul style={{
            color: cores.texto, fontSize: 15 * f, padding: `0 ${34 * f}px`,
            textAlign: s.layout === 'titulo' ? 'center' : 'left',
            listStyle: s.layout === 'titulo' ? 'none' : 'disc',
            lineHeight: 1.5,
          }}>
            {s.topicos.map((t, i) => <li key={i} style={{ marginBottom: 3 * f }}>{t}</li>)}
          </ul>
        )}
        {s.imagens.length > 0 && (
          <div style={{
            display: 'flex', gap: 10 * f, padding: `${10 * f}px ${28 * f}px`,
            alignItems: s.imagensAlinhadas ? 'flex-start' : 'baseline',
          }}>
            {s.imagens.map((img, i) => (
              <div key={img.id} style={{
                width: `${img.largura}%`, aspectRatio: '4 / 3', background: '#C9C9C9',
                border: '1px solid #A6A6A6', display: 'grid', placeItems: 'center',
                color: '#5A5A5A', fontSize: 9 * f,
                /* Sem alinhar, a segunda entra alguns pixels abaixo — que é o
                   "quase" que se vê projetado. */
                marginTop: s.imagensAlinhadas ? 0 : i * 9 * f,
              }}>
                {mini ? '' : img.legenda}
              </div>
            ))}
          </div>
        )}
        {s.video !== 'nenhuma' && (
          <div style={{ padding: `${6 * f}px ${28 * f}px` }}>
            <div style={{
              background: '#111', color: '#FFF', aspectRatio: '16 / 9', width: `${52}%`,
              display: 'grid', placeItems: 'center',
            }}>
              <Play style={{ width: 18 * f, height: 18 * f }} />
            </div>
            {!mini && s.video === 'vinculada' && (
              <p style={{ fontSize: 9.5, color: '#A4262C', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Link2 className="w-3 h-3" /> Vinculado a C:\Users\clube\Vídeos\{VIDEOS[0]}
              </p>
            )}
          </div>
        )}
        {s.audio !== 'nenhuma' && (
          <div style={{ padding: `0 ${28 * f}px ${6 * f}px` }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10 * f,
              color: cores.texto, border: '1px solid #A6A6A6', borderRadius: 999,
              padding: `${2 * f}px ${8 * f}px`,
            }}>
              <Music style={{ width: 10 * f, height: 10 * f }} /> {mini ? '' : AUDIOS[0]}
            </span>
            {!mini && s.audio === 'vinculada' && (
              <p style={{ fontSize: 9.5, color: '#A4262C', marginTop: 2 }}>
                Vinculado a C:\Users\clube\Música\{AUDIOS[0]}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="powerpoint"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{`
        .pp-janela {
          background: #F3F2F1; color: #201F1E; flex: 1;
          display: flex; flex-direction: column; min-height: 0;
          font-family: system-ui, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px;
        }
        .pp-titulo {
          background: #B7472A; color: #FFFFFF; display: flex; align-items: center;
          gap: 10px; padding: 6px 10px; font-size: 12px;
        }
        .pp-guias {
          display: flex; gap: 2px; padding: 0 8px; background: #F9F8F7;
          border-bottom: 1px solid #E1DFDD; overflow-x: auto;
        }
        .pp-guia {
          padding: 6px 10px 7px; font-size: 12.5px; white-space: nowrap;
          border: none; background: none; color: #201F1E; cursor: pointer;
          border-bottom: 2px solid transparent;
        }
        .pp-guia:hover { background: #EDEBE9; }
        .pp-guia[aria-selected="true"] { color: #B7472A; border-bottom-color: #B7472A; font-weight: 600; }
        .pp-faixa {
          display: flex; align-items: stretch; padding: 4px 6px 2px;
          background: #F3F2F1; border-bottom: 1px solid #E1DFDD; overflow-x: auto;
        }
        .pp-grupo {
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 0 8px; border-right: 1px solid #E1DFDD; min-width: max-content;
        }
        .pp-grupo-corpo { display: flex; align-items: flex-start; gap: 3px; padding: 2px 0 4px; }
        .pp-grupo-nome { font-size: 10px; color: #605E5C; text-align: center; padding-bottom: 3px; }
        .pp-bt {
          height: 26px; padding: 0 6px; border-radius: 3px; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 4px;
          color: #201F1E; font-size: 12px;
        }
        .pp-bt:hover { background: #EDEBE9 !important; }
        .pp-menu {
          position: absolute; z-index: 30; top: 100%; left: 0; margin-top: 2px;
          background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 3px;
          box-shadow: 0 6px 18px rgba(0,0,0,.22); min-width: 220px; padding: 4px; text-align: left;
        }
        .pp-menu-item {
          display: block; width: 100%; text-align: left; padding: 6px 10px;
          font-size: 12.5px; border: none; border-radius: 2px; cursor: pointer; color: #201F1E;
        }
        .pp-menu-item:hover { background: #EDEBE9 !important; }
        .pp-corpo { flex: 1; min-height: 0; display: flex; background: #F3F2F1; }
        .pp-tira {
          width: 168px; flex: none; background: #EDEBE9; border-right: 1px solid #C8C6C4;
          padding: 8px 6px; overflow-y: auto;
        }
        .pp-tira-item {
          display: flex; gap: 6px; align-items: flex-start; width: 100%;
          background: none; border: none; cursor: pointer; padding: 3px 0 7px;
          color: #605E5C; font-size: 11px;
        }
        .pp-tira-moldura { flex: 1; border: 2px solid transparent; }
        .pp-tira-item[aria-current="true"] .pp-tira-moldura { border-color: #B7472A; }
        .pp-palco { flex: 1; min-width: 0; overflow: auto; padding: 16px; display: flex; justify-content: center; }
        .pp-slide {
          position: relative; aspect-ratio: 16 / 9; width: 100%;
          box-shadow: 0 1px 5px rgba(0,0,0,.3); overflow: hidden;
        }
        .pp-palco .pp-slide { max-width: 620px; }
        .pp-titulo-campo {
          background: transparent; border: 1px dashed transparent; width: 100%;
          font: inherit; color: inherit; text-align: inherit; padding: 1px 3px;
        }
        .pp-titulo-campo:hover { border-color: #A6A6A6; }
        .pp-titulo-campo:focus { outline: none; border-color: #B7472A; border-style: solid; }
        .pp-status {
          background: #B7472A; color: #FFFFFF; font-size: 11.5px;
          padding: 4px 10px; display: flex; gap: 14px; align-items: center;
        }
        .pp-bastidores { flex: 1; min-height: 0; display: flex; background: #FFFFFF; }
        .pp-rail {
          width: 190px; flex: none; background: #B7472A; color: #FFFFFF; padding: 12px 0; overflow-y: auto;
        }
        .pp-rail button {
          display: block; width: 100%; text-align: left; padding: 8px 18px;
          font-size: 13px; color: #FFFFFF; background: none; border: none; cursor: pointer;
        }
        .pp-rail button:hover { background: rgba(255,255,255,.16); }
        .pp-bast-corpo { flex: 1; min-width: 0; overflow: auto; padding: 20px 26px; color: #201F1E; }
        .pp-leitor { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #525659; }
        .pp-leitor-barra {
          background: #323639; color: #FFFFFF; padding: 6px 10px; font-size: 12px;
          display: flex; align-items: center; gap: 10px;
        }
        .pp-leitor-corpo { flex: 1; overflow: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; align-items: center; }
        .pp-leitor-corpo .pp-slide { max-width: 520px; }
      `}</style>

      <div className="pp-janela" onClick={fecharMenu}>
        <div className="pp-titulo">
          <Presentation className="w-4 h-4" />
          <span style={{ fontWeight: 600 }}>Acampamento de Inverno</span>
          <span style={{ opacity: .85 }}>— PowerPoint</span>
          <span className="ml-auto flex items-center gap-3" style={{ opacity: .9 }}>
            <button type="button" aria-label="Minimizar" onClick={() => naoFazParte('Minimizar')}>
              <Minus className="w-3 h-3" />
            </button>
            <button type="button" aria-label="Maximizar" onClick={() => avisar('O PowerPoint já está ocupando a tela inteira.')}>
              <SquareIcon className="w-2.5 h-2.5" />
            </button>
            <button type="button" aria-label="Fechar" onClick={() => naoFazParte('Fechar o PowerPoint')}>
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>

        {tela === 'normal' && (
          <>
            <div className="pp-guias" role="tablist">
              {GUIAS.map(nome => (
                nome === 'Arquivo' ? (
                  <button key={nome} type="button" className="pp-guia"
                    style={{ background: '#B7472A', color: '#FFFFFF', borderRadius: '3px 3px 0 0' }}
                    onClick={ev => { ev.stopPropagation(); setTela('bastidores'); fecharMenu(); }}>
                    Arquivo
                  </button>
                ) : USAVEIS.includes(nome) ? (
                  <button key={nome} type="button" role="tab" aria-selected={guia === nome}
                    className="pp-guia" onClick={ev => { ev.stopPropagation(); setGuia(nome); fecharMenu(); }}>
                    {nome}
                  </button>
                ) : (
                  <button key={nome} type="button" className="pp-guia" style={{ color: '#8A8886' }}
                    onClick={ev => { ev.stopPropagation(); naoFazParte(`A guia ${nome}`); }}>
                    {nome}
                  </button>
                )
              ))}
            </div>

            <div className="pp-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}
              onClick={ev => ev.stopPropagation()}>
              {guia === 'Página Inicial' && (
                <>
                  <Grupo nome="Slides">
                    <div style={{ position: 'relative' }}>
                      <Bt dica="Novo Slide" rotulo="Novo Slide" empilhado aoClicar={() => abrir('novo')}>
                        <Plus className="w-5 h-5" />
                      </Bt>
                      <Menu id="novo">
                        {(Object.keys(NOMES_DOS_LAYOUTS) as Layout[]).map(l => (
                          <ItemMenu key={l} aoClicar={() => criarSlide(l)}>{NOMES_DOS_LAYOUTS[l]}</ItemMenu>
                        ))}
                      </Menu>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Bt dica="Layout" rotulo="Layout" empilhado aoClicar={() => abrir('layout')}>
                        <LayoutTemplate className="w-5 h-5" />
                      </Bt>
                      <Menu id="layout">
                        {(Object.keys(NOMES_DOS_LAYOUTS) as Layout[]).map(l => (
                          <ItemMenu key={l} ativo={slide.layout === l} aoClicar={() => trocarLayout(l)}>
                            {NOMES_DOS_LAYOUTS[l]}
                          </ItemMenu>
                        ))}
                      </Menu>
                    </div>
                    <Bt dica="Duplicar Slide" aoClicar={duplicarSlide}><Copy className="w-4 h-4" /></Bt>
                    <Bt dica="Excluir Slide" aoClicar={excluirSlide}><Trash2 className="w-4 h-4" /></Bt>
                    <Bt dica="Mover Slide para Cima" aoClicar={() => mover(-1)}><ChevronUp className="w-4 h-4" /></Bt>
                    <Bt dica="Mover Slide para Baixo" aoClicar={() => mover(1)}><ChevronDown className="w-4 h-4" /></Bt>
                  </Grupo>
                  <Grupo nome="Fonte">
                    <Bt dica="Fonte" aoClicar={() => naoFazParte('A caixa de fonte')}><Type className="w-4 h-4" /></Bt>
                  </Grupo>
                  <Grupo nome="Desenho">
                    <div style={{ position: 'relative' }}>
                      <Bt dica="Organizar" rotulo="Organizar" empilhado aoClicar={() => abrir('organizar')}>
                        <Layers className="w-5 h-5" />
                      </Bt>
                      <Menu id="organizar">
                        <p style={{ fontSize: 10.5, color: '#605E5C', padding: '4px 10px 2px' }}>Posicionar Objetos</p>
                        <ItemMenu aoClicar={alinharImagens}>Alinhar › Alinhar em Cima</ItemMenu>
                        <ItemMenu aoClicar={() => naoFazParte('Trazer para a Frente')}>Trazer para a Frente</ItemMenu>
                        <ItemMenu aoClicar={() => naoFazParte('Agrupar')}>Agrupar</ItemMenu>
                      </Menu>
                    </div>
                  </Grupo>
                </>
              )}

              {guia === 'Inserir' && (
                <>
                  <Grupo nome="Imagens">
                    <div style={{ position: 'relative' }}>
                      <Bt dica="Imagens" rotulo="Imagens" empilhado aoClicar={() => abrir('imagens')}>
                        <ImageIcon className="w-5 h-5" />
                      </Bt>
                      <Menu id="imagens">
                        <p style={{ fontSize: 10.5, color: '#605E5C', padding: '4px 10px 2px' }}>Este Dispositivo…</p>
                        {FOTOS.map(f => <ItemMenu key={f} aoClicar={() => inserirFoto(f)}>{f}</ItemMenu>)}
                      </Menu>
                    </div>
                    <Bt dica="Formas" aoClicar={() => naoFazParte('Formas')}><SquareIcon className="w-4 h-4" /></Bt>
                  </Grupo>
                  <Grupo nome="Mídia">
                    <div style={{ position: 'relative' }}>
                      <Bt dica="Vídeo" rotulo="Vídeo" empilhado aoClicar={() => abrir('video')}>
                        <Video className="w-5 h-5" />
                      </Bt>
                      <Menu id="video">
                        <p style={{ fontSize: 10.5, color: '#605E5C', padding: '4px 10px 2px' }}>
                          {VIDEOS[0]} — como inserir?
                        </p>
                        <ItemMenu aoClicar={() => inserirMidia('video', 'incorporada')}>
                          Inserir <span style={{ color: '#605E5C' }}>(o arquivo vai junto)</span>
                        </ItemMenu>
                        <ItemMenu aoClicar={() => inserirMidia('video', 'vinculada')}>
                          Vincular ao Arquivo <span style={{ color: '#605E5C' }}>(guarda só o endereço)</span>
                        </ItemMenu>
                      </Menu>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Bt dica="Áudio" rotulo="Áudio" empilhado aoClicar={() => abrir('audio')}>
                        <Music className="w-5 h-5" />
                      </Bt>
                      <Menu id="audio">
                        <p style={{ fontSize: 10.5, color: '#605E5C', padding: '4px 10px 2px' }}>
                          {AUDIOS[0]} — como inserir?
                        </p>
                        <ItemMenu aoClicar={() => inserirMidia('audio', 'incorporada')}>
                          Inserir <span style={{ color: '#605E5C' }}>(o arquivo vai junto)</span>
                        </ItemMenu>
                        <ItemMenu aoClicar={() => inserirMidia('audio', 'vinculada')}>
                          Vincular ao Arquivo <span style={{ color: '#605E5C' }}>(guarda só o endereço)</span>
                        </ItemMenu>
                      </Menu>
                    </div>
                  </Grupo>
                </>
              )}

              {guia === 'Design' && (
                <Grupo nome="Temas">
                  {(Object.keys(NOMES_DOS_MODELOS) as Modelo[]).map(m => (
                    <button key={m} type="button" className="pp-bt"
                      aria-label={`Tema ${NOMES_DOS_MODELOS[m]}`} aria-pressed={ap.modelo === m}
                      onClick={() => escolherModelo(m)}
                      style={{
                        flexDirection: 'column', height: 'auto', padding: 2, gap: 3,
                        border: ap.modelo === m ? '2px solid #B7472A' : '1px solid #C8C6C4',
                      }}>
                      <span style={{
                        display: 'block', width: 62, height: 34,
                        background: CORES_DO_MODELO[m].fundo,
                        borderTop: `4px solid ${CORES_DO_MODELO[m].faixa === 'transparent' ? CORES_DO_MODELO[m].fundo : CORES_DO_MODELO[m].faixa}`,
                      }}>
                        <span style={{
                          display: 'block', margin: '8px auto 0', width: 34, height: 4,
                          background: CORES_DO_MODELO[m].titulo,
                        }} />
                      </span>
                      <span style={{ fontSize: 10 }}>{NOMES_DOS_MODELOS[m]}</span>
                    </button>
                  ))}
                </Grupo>
              )}
            </div>

            <div className="pp-corpo">
              <div className="pp-tira">
                {ap.slides.map((s, i) => (
                  <button key={s.id} type="button" className="pp-tira-item" aria-current={i === atual}
                    aria-label={`Slide ${i + 1}${s.titulo ? `: ${s.titulo}` : ' (vazio)'}`}
                    onClick={ev => { ev.stopPropagation(); setAtual(i); fecharMenu(); }}>
                    <span>{i + 1}</span>
                    <span className="pp-tira-moldura">{desenharSlide(s, true)}</span>
                  </button>
                ))}
              </div>

              <div className="pp-palco" onClick={ev => ev.stopPropagation()}>
                <div style={{ width: '100%', maxWidth: 620 }}>
                  <div className="pp-slide" style={{ background: cores.fundo }}>
                    {cores.faixa !== 'transparent' && (
                      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 6, background: cores.faixa }} />
                    )}
                    {slide.layout !== 'em-branco' && (
                      <div style={{
                        padding: `${slide.layout === 'titulo' ? 60 : 26}px 28px 8px`,
                        textAlign: slide.layout === 'titulo' ? 'center' : 'left',
                      }}>
                        <input className="pp-titulo-campo" value={slide.titulo}
                          placeholder="Clique para adicionar um título"
                          aria-label={`Título do slide ${atual + 1}`}
                          style={{ color: cores.titulo, fontSize: 26, fontWeight: 600 }}
                          onChange={e => mudarSlide(slide.id, { titulo: e.target.value })} />
                      </div>
                    )}
                    {slide.topicos.length > 0 && (
                      <ul style={{
                        color: cores.texto, fontSize: 15, padding: '0 34px',
                        textAlign: slide.layout === 'titulo' ? 'center' : 'left',
                        listStyle: slide.layout === 'titulo' ? 'none' : 'disc',
                        lineHeight: 1.5,
                      }}>
                        {slide.topicos.map((t, i) => <li key={i} style={{ marginBottom: 3 }}>{t}</li>)}
                      </ul>
                    )}
                    {slide.imagens.length > 0 && (
                      <div style={{ display: 'flex', gap: 10, padding: '10px 28px', alignItems: 'flex-start' }}>
                        {slide.imagens.map((img, i) => (
                          <div key={img.id} style={{
                            width: `${img.largura}%`, aspectRatio: '4 / 3', background: '#C9C9C9',
                            border: '1px solid #A6A6A6', display: 'grid', placeItems: 'center',
                            color: '#5A5A5A', fontSize: 10,
                            marginTop: slide.imagensAlinhadas ? 0 : i * 9,
                          }}>{img.legenda}</div>
                        ))}
                      </div>
                    )}
                    {slide.video !== 'nenhuma' && (
                      <div style={{ padding: '6px 28px' }}>
                        <div style={{ background: '#111', color: '#FFF', aspectRatio: '16 / 9', width: '52%', display: 'grid', placeItems: 'center' }}>
                          <Play className="w-5 h-5" />
                        </div>
                        {slide.video === 'vinculada' && (
                          <p style={{ fontSize: 9.5, color: '#A4262C', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Link2 className="w-3 h-3" /> Vinculado a C:\Users\clube\Vídeos\{VIDEOS[0]}
                          </p>
                        )}
                      </div>
                    )}
                    {slide.audio !== 'nenhuma' && (
                      <div style={{ padding: '0 28px 6px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10,
                          color: cores.texto, border: '1px solid #A6A6A6', borderRadius: 999, padding: '2px 8px',
                        }}>
                          <Music className="w-2.5 h-2.5" /> {AUDIOS[0]}
                        </span>
                        {slide.audio === 'vinculada' && (
                          <p style={{ fontSize: 9.5, color: '#A4262C', marginTop: 2 }}>
                            Vinculado a C:\Users\clube\Música\{AUDIOS[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#605E5C', marginTop: 6 }}>
                    Layout: {NOMES_DOS_LAYOUTS[slide.layout]}
                    {vazio(slide) && ' — este slide está vazio'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pp-status">
              <span>Slide {atual + 1} de {ap.slides.length}</span>
              <span className="hidden sm:inline">Português (Brasil)</span>
              <span className="hidden md:inline">
                {ap.pdf ? `PDF com ${ap.pdf.length} slides` : 'Sem PDF'}
              </span>
            </div>
          </>
        )}

        {tela === 'bastidores' && (
          <div className="pp-bastidores">
            <div className="pp-rail">
              <button type="button" onClick={() => setTela('normal')}
                aria-label="Voltar para a apresentação"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button type="button" onClick={() => naoFazParte('Salvar')}>Salvar</button>
              <button type="button" onClick={() => naoFazParte('Salvar como')}>Salvar como</button>
              <button type="button" onClick={() => naoFazParte('Imprimir')}>Imprimir</button>
              <button type="button" aria-current="true">Exportar</button>
            </div>
            <div className="pp-bast-corpo">
              <h2 style={{ fontSize: 26, fontWeight: 300, color: '#201F1E', marginBottom: 16 }}>Exportar</h2>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <button type="button" className="pp-bt"
                  aria-label="Criar Documento PDF/XPS"
                  onClick={exportarPdf}
                  style={{ flexDirection: 'column', height: 'auto', padding: 14, border: '1px solid #C8C6C4', gap: 6 }}>
                  <FileDown className="w-8 h-8" style={{ color: '#B7472A' }} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Criar Documento PDF/XPS</span>
                </button>
                <button type="button" className="pp-bt"
                  aria-label="Criar um Vídeo"
                  onClick={() => naoFazParte('Criar um Vídeo')}
                  style={{ flexDirection: 'column', height: 'auto', padding: 14, border: '1px solid #C8C6C4', gap: 6 }}>
                  <Video className="w-8 h-8" style={{ color: '#605E5C' }} />
                  <span style={{ fontSize: 13 }}>Criar um Vídeo</span>
                </button>
              </div>
              <ul style={{ fontSize: 12.5, color: '#605E5C', marginTop: 18, listStyle: 'disc', paddingLeft: 18 }}>
                <li>Mantém a aparência, as letras e as imagens.</li>
                <li>O conteúdo não pode ser alterado com facilidade.</li>
                <li>Abre em qualquer aparelho, mesmo sem o PowerPoint instalado.</li>
                <li style={{ color: '#A4262C' }}>Vídeo, áudio e transição não vão para o PDF: ele é papel.</li>
              </ul>
              {ap.pdf && (
                <p style={{ fontSize: 12.5, marginTop: 14 }}>
                  Último PDF criado: <strong>Acampamento de Inverno.pdf</strong>, com {ap.pdf.length} páginas.
                </p>
              )}
            </div>
          </div>
        )}

        {tela === 'pdf' && (
          <div className="pp-leitor">
            <div className="pp-leitor-barra">
              <FileText className="w-4 h-4" />
              <span>Acampamento de Inverno.pdf</span>
              <span style={{ opacity: .8 }}>— {ap.pdf?.length ?? 0} páginas</span>
              <button type="button" className="ml-auto"
                aria-label="Voltar para a apresentação"
                onClick={() => setTela('normal')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ArrowLeft className="w-4 h-4" /> Voltar ao PowerPoint
              </button>
            </div>
            <div className="pp-leitor-corpo">
              {(ap.pdf ?? []).map(id => {
                const s = ap.slides.find(x => x.id === id);
                if (!s) return null;
                return <div key={id} style={{ width: '100%', maxWidth: 520 }}>{desenharSlide(s)}</div>;
              })}
              <p style={{ color: '#D6D6D6', fontSize: 11.5, maxWidth: 520 }}>
                O quadro do vídeo está aqui como imagem parada: num PDF ele não toca,
                e o áudio também não. É por isso que o PDF é o que se entrega, e não
                o que se apresenta.
              </p>
            </div>
          </div>
        )}
      </div>
    </LaboratorioEmTelaCheia>
  );
}
