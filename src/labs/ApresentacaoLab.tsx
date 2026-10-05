import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutTemplate, Copy, Trash2, Plus, ChevronUp, ChevronDown,
  Image as ImageIcon, Video, Music, Layers,
  FileDown, FileText, Square as SquareIcon, Type,
  FileCheck2, RotateCcw, ArrowLeft,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_POWERPOINT, BarraDeTituloDoPowerPoint, GuiasDoPowerPoint,
  GrupoDoPowerPoint, BotaoDoPowerPoint, MenuDoPowerPoint, ItemDeMenuDoPowerPoint,
  FolhaDoSlide,
} from './powerpoint';
import {
  CORES_DO_MODELO, NOMES_DOS_LAYOUTS, NOMES_DOS_MODELOS, vazio,
  type Apresentacao, type Slide, type Layout, type Modelo, type Midia,
} from './apresentacao';
import { APRESENTACAO_INICIAL, METAS_DA_APRESENTACAO } from './apresentacaoDoClube';
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
 * A janela mora em `powerpoint.tsx` e o modelo de uma apresentação em
 * `apresentacao.ts`; o que a AP044 cobra e de onde ela parte, em
 * `apresentacaoDoClube.ts`.
 */

/** As guias que respondem neste exercício; a fileira inteira é do programa. */
const USAVEIS = ['Página Inicial', 'Inserir', 'Design'];

/** Os arquivos que o computador do clube tem, para os diálogos de inserir. */
const FOTOS = ['fogueira.jpg', 'barracas.jpg', 'caminhada.jpg'];
const VIDEOS = ['abertura-2025.mp4'];
const AUDIOS = ['hino-do-clube.mp3'];

/*
  E onde eles moram, que é o que o vínculo guarda em vez do arquivo.

  O caminho é deste computador, e não do programa: é por isso que ele vem do
  laboratório e não de `powerpoint.tsx`.
*/
const CAMINHO_DO_VIDEO = `C:\\Users\\clube\\Vídeos\\${VIDEOS[0]}`;
const CAMINHO_DO_AUDIO = `C:\\Users\\clube\\Música\\${AUDIOS[0]}`;

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
      }, specialtyCode);
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

  /**
   * O slide desenhado — no palco e, menor, na tira lateral e no PDF.
   *
   * Quem desenha é `FolhaDoSlide`, de `powerpoint.tsx`: o desenho é do
   * programa. O caminho do vídeo e o do áudio vêm daqui porque são arquivos
   * **deste** computador, e é neles que a diferença entre incorporar e
   * vincular aparece antes do dia da apresentação.
   */
  const desenharSlide = (s: Slide, mini = false) => (
    <FolhaDoSlide
      slide={s} cores={cores} mini={mini}
      caminhoDoVideo={CAMINHO_DO_VIDEO} nomeDoAudio={AUDIOS[0]}
      caminhoDoAudio={CAMINHO_DO_AUDIO}
    />
  );

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
      <style>{CSS_POWERPOINT}</style>

      <div className="pp-janela" onClick={fecharMenu}>
        <BarraDeTituloDoPowerPoint
          arquivo="Acampamento de Inverno" aoAvisar={avisar} aoNaoFazParte={naoFazParte}
        />

        {tela === 'normal' && (
          <>
            <GuiasDoPowerPoint
              atual={guia} usaveis={USAVEIS}
              aoTrocar={nome => { setGuia(nome); fecharMenu(); }}
              aoNaoFazParte={naoFazParte}
              aoAbrirArquivo={() => { setTela('bastidores'); fecharMenu(); }}
            />

            <div className="pp-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}
              onClick={ev => ev.stopPropagation()}>
              {guia === 'Página Inicial' && (
                <>
                  <GrupoDoPowerPoint nome="Slides">
                    <div style={{ position: 'relative' }}>
                      <BotaoDoPowerPoint dica="Novo Slide" rotulo="Novo Slide" empilhado aoClicar={() => abrir('novo')}>
                        <Plus className="w-5 h-5" />
                      </BotaoDoPowerPoint>
                      <MenuDoPowerPoint aberto={menu === 'novo'}>
                        {(Object.keys(NOMES_DOS_LAYOUTS) as Layout[]).map(l => (
                          <ItemDeMenuDoPowerPoint key={l} aoClicar={() => criarSlide(l)}>{NOMES_DOS_LAYOUTS[l]}</ItemDeMenuDoPowerPoint>
                        ))}
                      </MenuDoPowerPoint>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <BotaoDoPowerPoint dica="Layout" rotulo="Layout" empilhado aoClicar={() => abrir('layout')}>
                        <LayoutTemplate className="w-5 h-5" />
                      </BotaoDoPowerPoint>
                      <MenuDoPowerPoint aberto={menu === 'layout'}>
                        {(Object.keys(NOMES_DOS_LAYOUTS) as Layout[]).map(l => (
                          <ItemDeMenuDoPowerPoint key={l} ativo={slide.layout === l} aoClicar={() => trocarLayout(l)}>
                            {NOMES_DOS_LAYOUTS[l]}
                          </ItemDeMenuDoPowerPoint>
                        ))}
                      </MenuDoPowerPoint>
                    </div>
                    <BotaoDoPowerPoint dica="Duplicar Slide" aoClicar={duplicarSlide}><Copy className="w-4 h-4" /></BotaoDoPowerPoint>
                    <BotaoDoPowerPoint dica="Excluir Slide" aoClicar={excluirSlide}><Trash2 className="w-4 h-4" /></BotaoDoPowerPoint>
                    <BotaoDoPowerPoint dica="Mover Slide para Cima" aoClicar={() => mover(-1)}><ChevronUp className="w-4 h-4" /></BotaoDoPowerPoint>
                    <BotaoDoPowerPoint dica="Mover Slide para Baixo" aoClicar={() => mover(1)}><ChevronDown className="w-4 h-4" /></BotaoDoPowerPoint>
                  </GrupoDoPowerPoint>
                  <GrupoDoPowerPoint nome="Fonte">
                    <BotaoDoPowerPoint dica="Fonte" aoClicar={() => naoFazParte('A caixa de fonte')}><Type className="w-4 h-4" /></BotaoDoPowerPoint>
                  </GrupoDoPowerPoint>
                  <GrupoDoPowerPoint nome="Desenho">
                    <div style={{ position: 'relative' }}>
                      <BotaoDoPowerPoint dica="Organizar" rotulo="Organizar" empilhado aoClicar={() => abrir('organizar')}>
                        <Layers className="w-5 h-5" />
                      </BotaoDoPowerPoint>
                      <MenuDoPowerPoint aberto={menu === 'organizar'}>
                        <p style={{ fontSize: 10.5, color: '#605E5C', padding: '4px 10px 2px' }}>Posicionar Objetos</p>
                        <ItemDeMenuDoPowerPoint aoClicar={alinharImagens}>Alinhar › Alinhar em Cima</ItemDeMenuDoPowerPoint>
                        <ItemDeMenuDoPowerPoint aoClicar={() => naoFazParte('Trazer para a Frente')}>Trazer para a Frente</ItemDeMenuDoPowerPoint>
                        <ItemDeMenuDoPowerPoint aoClicar={() => naoFazParte('Agrupar')}>Agrupar</ItemDeMenuDoPowerPoint>
                      </MenuDoPowerPoint>
                    </div>
                  </GrupoDoPowerPoint>
                </>
              )}

              {guia === 'Inserir' && (
                <>
                  <GrupoDoPowerPoint nome="Imagens">
                    <div style={{ position: 'relative' }}>
                      <BotaoDoPowerPoint dica="Imagens" rotulo="Imagens" empilhado aoClicar={() => abrir('imagens')}>
                        <ImageIcon className="w-5 h-5" />
                      </BotaoDoPowerPoint>
                      <MenuDoPowerPoint aberto={menu === 'imagens'}>
                        <p style={{ fontSize: 10.5, color: '#605E5C', padding: '4px 10px 2px' }}>Este Dispositivo…</p>
                        {FOTOS.map(f => <ItemDeMenuDoPowerPoint key={f} aoClicar={() => inserirFoto(f)}>{f}</ItemDeMenuDoPowerPoint>)}
                      </MenuDoPowerPoint>
                    </div>
                    <BotaoDoPowerPoint dica="Formas" aoClicar={() => naoFazParte('Formas')}><SquareIcon className="w-4 h-4" /></BotaoDoPowerPoint>
                  </GrupoDoPowerPoint>
                  <GrupoDoPowerPoint nome="Mídia">
                    <div style={{ position: 'relative' }}>
                      <BotaoDoPowerPoint dica="Vídeo" rotulo="Vídeo" empilhado aoClicar={() => abrir('video')}>
                        <Video className="w-5 h-5" />
                      </BotaoDoPowerPoint>
                      <MenuDoPowerPoint aberto={menu === 'video'}>
                        <p style={{ fontSize: 10.5, color: '#605E5C', padding: '4px 10px 2px' }}>
                          {VIDEOS[0]} — como inserir?
                        </p>
                        <ItemDeMenuDoPowerPoint aoClicar={() => inserirMidia('video', 'incorporada')}>
                          Inserir <span style={{ color: '#605E5C' }}>(o arquivo vai junto)</span>
                        </ItemDeMenuDoPowerPoint>
                        <ItemDeMenuDoPowerPoint aoClicar={() => inserirMidia('video', 'vinculada')}>
                          Vincular ao Arquivo <span style={{ color: '#605E5C' }}>(guarda só o endereço)</span>
                        </ItemDeMenuDoPowerPoint>
                      </MenuDoPowerPoint>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <BotaoDoPowerPoint dica="Áudio" rotulo="Áudio" empilhado aoClicar={() => abrir('audio')}>
                        <Music className="w-5 h-5" />
                      </BotaoDoPowerPoint>
                      <MenuDoPowerPoint aberto={menu === 'audio'}>
                        <p style={{ fontSize: 10.5, color: '#605E5C', padding: '4px 10px 2px' }}>
                          {AUDIOS[0]} — como inserir?
                        </p>
                        <ItemDeMenuDoPowerPoint aoClicar={() => inserirMidia('audio', 'incorporada')}>
                          Inserir <span style={{ color: '#605E5C' }}>(o arquivo vai junto)</span>
                        </ItemDeMenuDoPowerPoint>
                        <ItemDeMenuDoPowerPoint aoClicar={() => inserirMidia('audio', 'vinculada')}>
                          Vincular ao Arquivo <span style={{ color: '#605E5C' }}>(guarda só o endereço)</span>
                        </ItemDeMenuDoPowerPoint>
                      </MenuDoPowerPoint>
                    </div>
                  </GrupoDoPowerPoint>
                </>
              )}

              {guia === 'Design' && (
                <GrupoDoPowerPoint nome="Temas">
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
                </GrupoDoPowerPoint>
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
                  <FolhaDoSlide
                    slide={slide} cores={cores}
                    rotuloDoTitulo={`Título do slide ${atual + 1}`}
                    aoEscreverNoTitulo={titulo => mudarSlide(slide.id, { titulo })}
                    caminhoDoVideo={CAMINHO_DO_VIDEO}
                    nomeDoAudio={AUDIOS[0]}
                    caminhoDoAudio={CAMINHO_DO_AUDIO}
                  />
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
