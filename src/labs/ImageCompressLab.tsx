import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Image as IconeImagem, Upload, Download, CheckCircle2, Sparkles, Minimize2,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  calculateResize, formatBytes, loadImageFile, drawResized, sourceSize,
  drawSamplePhoto, canvasToBlob, downloadBlob,
} from '../lib/imageTools';
import {
  logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity,
  getSpecialtyId, getRequirementId, registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP035 requisito 5.2, primeira metade: um JPG abaixo de 15 KB que ainda seja
 * "facilmente visível em um site".
 *
 * ── Por que isto virou um laboratório sozinho ────────────────────────────
 * Antes, comprimir era a primeira de quatro estações de um laboratório só, e
 * dividia a tela com criar logo, criar botões e criar header. São dois
 * assuntos diferentes: um é escolher o que jogar fora, o outro é desenhar. E
 * são duas ferramentas diferentes na vida — ninguém comprime foto no mesmo
 * programa em que faz banner.
 *
 * ── Por que a comparação é lado a lado, com uma régua no meio ────────────
 * Comprimir é abrir mão de detalhe em troca de bytes, e a troca só ensina
 * alguma coisa quando dá para *ver* o que se perdeu. Número sozinho não
 * ensina: "38 KB" não diz nada a quem não tem com o que comparar. Daí a
 * divisória arrastável, que é como todo compressor sério mostra — original de
 * um lado, comprimido do outro, e a mesma parte da foto nos dois.
 *
 * 15 KB é apertado de propósito: não se chega lá por acaso. É preciso trocar
 * largura por qualidade e ver o número se mexer, que é justamente a habilidade
 * que o requisito descreve.
 */

/** O orçamento do documento oficial, em bytes. "15k" é 15 × 1024. */
const ORCAMENTO = 15 * 1024;
/** Abaixo disto o arquivo seria pequeno por ser inútil, não por estar otimizado. */
const LARGURA_MINIMA_VISIVEL = 400;

const CSS_COMPRESSOR = `
  .cp {
    flex: 1; min-height: 0; display: flex; flex-direction: column;
    background: #17171C; color: #E8E8EC;
    font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  }
  .cp-topo {
    flex: none; display: flex; align-items: center; gap: 12px; padding: 10px 16px;
    background: #1F1F26; border-bottom: 1px solid #2C2C35;
  }
  .cp-marca { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
  .cp-arquivo { font-size: 12.5px; color: #9A9AA6; }
  .cp-bt {
    display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 14px;
    border-radius: 6px; font-size: 13px; cursor: pointer; border: 1px solid #3A3A46;
    background: #2A2A33; color: #E8E8EC;
  }
  .cp-bt:hover { background: #33333E; }
  .cp-bt.forte { background: #4C8DFF; border-color: #4C8DFF; color: #0B0B10; font-weight: 600; }
  .cp-bt.forte:hover { background: #6BA0FF; }
  .cp-bt:disabled { background: #24242C; border-color: #2C2C35; color: #63636E; cursor: default; }

  .cp-corpo { flex: 1; min-height: 0; display: flex; }
  .cp-palco {
    flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center;
    padding: 22px; background:
      repeating-conic-gradient(#1C1C22 0% 25%, #202028 0% 50%) 50% / 22px 22px;
    overflow: auto;
  }

  /* ── A comparação ──
     Duas cópias da mesma foto, uma em cima da outra. A de cima é recortada na
     posição da régua, então o que se vê à esquerda é o original e à direita é
     o comprimido — a mesma parte da imagem, nos dois estados. */
  .cp-comparador {
    position: relative; max-width: 100%; user-select: none; touch-action: none;
    box-shadow: 0 10px 40px rgba(0,0,0,.5); line-height: 0;
  }
  .cp-comparador img { display: block; max-width: 100%; height: auto; }
  .cp-comparador img.depois { position: absolute; inset: 0; width: 100%; }
  .cp-regua {
    position: absolute; top: 0; bottom: 0; width: 2px; background: #FFFFFF;
    box-shadow: 0 0 0 1px rgba(0,0,0,.35); cursor: ew-resize; z-index: 2;
  }
  .cp-pega {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 34px; height: 34px; border-radius: 50%; background: #FFFFFF;
    display: grid; place-items: center; color: #17171C; font-size: 13px;
    box-shadow: 0 2px 8px rgba(0,0,0,.4);
  }
  .cp-etiqueta {
    position: absolute; bottom: 12px; z-index: 3; padding: 7px 11px; border-radius: 7px;
    background: rgba(10,10,14,.78); backdrop-filter: blur(6px);
    font-size: 12px; line-height: 1.45; color: #E8E8EC; pointer-events: none;
  }
  .cp-etiqueta b { display: block; font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: #9A9AA6; }
  .cp-etiqueta.esq { left: 12px; }
  .cp-etiqueta.dir { right: 12px; text-align: right; }

  .cp-painel {
    width: 288px; flex: none; overflow-y: auto; padding: 16px;
    background: #1F1F26; border-left: 1px solid #2C2C35;
  }
  .cp-secao { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #8A8A96; margin: 20px 0 8px; }
  .cp-secao:first-child { margin-top: 0; }
  .cp-linha { display: flex; align-items: center; justify-content: space-between; font-size: 13px; margin-bottom: 7px; }
  .cp-linha span:last-child { color: #E8E8EC; font-variant-numeric: tabular-nums; }
  .cp-faixa { width: 100%; accent-color: #4C8DFF; }
  .cp-radio { display: flex; gap: 6px; }
  .cp-radio button {
    flex: 1; height: 30px; border-radius: 6px; font-size: 12.5px; cursor: pointer;
    background: #2A2A33; border: 1px solid #3A3A46; color: #C4C4CE;
  }
  .cp-radio button[aria-pressed="true"] { background: #4C8DFF; border-color: #4C8DFF; color: #0B0B10; font-weight: 600; }

  /* O orçamento: a barra é o que faz o número virar decisão. */
  .cp-orcamento { background: #17171C; border: 1px solid #2C2C35; border-radius: 8px; padding: 12px; }
  .cp-medida { font-size: 22px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .cp-barra { height: 8px; border-radius: 4px; background: #2C2C35; overflow: hidden; margin: 9px 0 7px; }
  .cp-barra > span { display: block; height: 100%; border-radius: 4px; transition: width .18s ease; }
  .cp-nota { font-size: 11.5px; color: #9A9AA6; line-height: 1.5; }

  .cp-vazio { text-align: center; max-width: 380px; color: #9A9AA6; }
  .cp-vazio h2 { font-size: 17px; color: #E8E8EC; margin: 14px 0 8px; font-weight: 600; }
  .cp-vazio p { font-size: 13.5px; line-height: 1.6; margin: 0 0 18px; }

  @media (max-width: 1023px) { .cp-painel { width: 232px; } }
  @media (max-width: 767px) {
    .cp-corpo { flex-direction: column; }
    .cp-painel { width: 100%; border-left: none; border-top: 1px solid #2C2C35; }
    .cp-palco { padding: 12px; }
  }
`;

export default function ImageCompressLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [origem, setOrigem] = useState<HTMLImageElement | HTMLCanvasElement | null>(null);
  const [nomeOriginal, setNomeOriginal] = useState('');
  const [urlOriginal, setUrlOriginal] = useState('');
  const [bytesOriginais, setBytesOriginais] = useState(0);
  const [largura, setLargura] = useState(1200);
  const [qualidade, setQualidade] = useState(0.8);
  const [formato, setFormato] = useState<'jpeg' | 'png'>('jpeg');
  const [reguaEm, setReguaEm] = useState(50);
  const [salvo, setSalvo] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [aviso, setAviso] = useState('');

  const campoArquivo = useRef<HTMLInputElement>(null);
  const comparador = useRef<HTMLDivElement>(null);

  /* ── A imagem comprimida, refeita a cada ajuste ────────────────────────── */
  const telaRedimensionada = useMemo(() => {
    if (!origem) return null;
    const { width, height } = sourceSize(origem);
    return drawResized(origem, calculateResize(width, height, largura));
  }, [origem, largura]);

  const [saida, setSaida] = useState<{ url: string; blob: Blob; bytes: number; w: number; h: number } | null>(null);

  useEffect(() => {
    if (!telaRedimensionada) { setSaida(null); return; }
    let cancelado = false;
    let url = '';
    (async () => {
      const blob = await canvasToBlob(telaRedimensionada, formato, qualidade);
      if (cancelado) return;
      url = URL.createObjectURL(blob);
      setSaida({ url, blob, bytes: blob.size, w: telaRedimensionada.width, h: telaRedimensionada.height });
    })();
    return () => { cancelado = true; if (url) URL.revokeObjectURL(url); };
  }, [telaRedimensionada, formato, qualidade]);

  useEffect(() => () => { if (urlOriginal) URL.revokeObjectURL(urlOriginal); }, [urlOriginal]);

  const receberArquivo = async (arquivo: File | undefined) => {
    if (!arquivo) return;
    try {
      const img = await loadImageFile(arquivo);
      if (urlOriginal) URL.revokeObjectURL(urlOriginal);
      setOrigem(img);
      setNomeOriginal(arquivo.name);
      setUrlOriginal(URL.createObjectURL(arquivo));
      setBytesOriginais(arquivo.size);
      setLargura(Math.min(1200, img.naturalWidth));
      setAviso('');
    } catch (erro) {
      setAviso((erro as Error).message);
    }
  };

  const usarExemplo = async () => {
    const tela = drawSamplePhoto();
    const blob = await canvasToBlob(tela, 'png');
    if (urlOriginal) URL.revokeObjectURL(urlOriginal);
    setOrigem(tela);
    setNomeOriginal('exemplo-por-do-sol.png');
    setUrlOriginal(URL.createObjectURL(blob));
    setBytesOriginais(blob.size);
    setLargura(1200);
    setAviso('');
  };

  /* ── A régua arrastável ────────────────────────────────────────────────── */
  const arrastar = (e: React.PointerEvent) => {
    if (e.buttons !== 1 && e.type !== 'pointerdown') return;
    const caixa = comparador.current?.getBoundingClientRect();
    if (!caixa) return;
    const proporcao = ((e.clientX - caixa.left) / caixa.width) * 100;
    setReguaEm(Math.max(0, Math.min(100, proporcao)));
  };

  /* ── O que o requisito cobra ───────────────────────────────────────────── */
  const dentroDoOrcamento = !!saida && saida.bytes <= ORCAMENTO;
  const aindaVisivel = !!saida && saida.w >= LARGURA_MINIMA_VISIVEL;
  const proporcaoDoOrcamento = saida ? saida.bytes / ORCAMENTO : 0;
  /* Quantas vezes menor, e não quantos por cento: 2,71 MB virando 4,5 KB dá
     99,83%, que arredonda para "100% menor" — e 100% menor é zero byte. Vezes
     é exato em qualquer escala, e diz mais a quem tem dez anos. */
  const vezesMenor = bytesOriginais && saida ? bytesOriginais / saida.bytes : 0;
  const quantasVezes = vezesMenor >= 10 ? Math.round(vezesMenor) : Math.round(vezesMenor * 10) / 10;

  const tarefas = [
    {
      id: 't1', titulo: 'Abrir uma fotografia', feita: !!saida,
      onde: 'Botão Abrir imagem, no alto',
      passos: [
        'Clique em "Abrir imagem" e escolha uma foto do seu aparelho.',
        'Se não tiver nenhuma à mão, clique em "Usar exemplo".',
      ],
    },
    {
      id: 't2', titulo: `Manter ao menos ${LARGURA_MINIMA_VISIVEL} px de largura`, feita: aindaVisivel,
      detalhe: saida && !aindaVisivel ? `Agora está em ${saida.w} px.` : undefined,
      onde: 'Controle Largura, no painel da direita',
      passos: [
        'O requisito pede um arquivo leve que ainda seja "facilmente visível".',
        'Encolher até virar selo deixa o arquivo pequeno e inútil.',
        `Arraste a largura de volta para pelo menos ${LARGURA_MINIMA_VISIVEL} px.`,
      ],
    },
    {
      id: 't3', titulo: `Chegar abaixo de ${formatBytes(ORCAMENTO)}`, feita: dentroDoOrcamento,
      detalhe: saida && !dentroDoOrcamento ? `Agora está em ${formatBytes(saida.bytes)}.` : undefined,
      onde: 'Largura e Qualidade, nessa ordem',
      passos: [
        'Primeiro reduza a largura: metade da largura é um quarto dos pixels, e é o que mais pesa.',
        'Depois baixe a qualidade, de dez em dez, olhando a divisória.',
        'Arraste a régua branca do meio para ver o que se perdeu — se não dá para notar, pode baixar mais.',
        'Confira o formato: JPEG para fotografia; PNG guarda cada pixel e fica bem mais pesado.',
      ],
    },
    {
      id: 't4', titulo: 'Baixar o arquivo pronto', feita: salvo,
      onde: 'Botão Baixar, no pé do painel',
      passos: ['Com o arquivo abaixo de 15 KB, clique em "Baixar" e guarde no aparelho.'],
    },
  ];

  const tudoFeito = tarefas.every(t => t.feita);

  const finalizar = async () => {
    setGravando(true);
    const idTrilha = await getSpecialtyId(specialtyCode);
    if (idTrilha) { await ensureEnrollment(userId, idTrilha); await updateEnrollmentActivity(userId, idTrilha); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const codigo of requirementCodes) {
      const idRequisito = await getRequirementId(codigo);
      if (idRequisito) await upsertRequirementProgress(userId, idRequisito, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: tarefas.length, total_questions: tarefas.length,
      });
    }
    await logActivity(userId, 'image_compress_completed', {
      specialtyCode, lessonCode, bytes: saida?.bytes, largura: saida?.w, formato,
    });
    setGravando(false);
    setConcluido(true);
  };

  if (concluido) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{lessonTitle} — concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {formatBytes(bytesOriginais)} viraram {formatBytes(saida?.bytes ?? 0)} — {quantasVezes.toLocaleString('pt-BR')} vezes
          menor — sem que a foto deixasse de ser vista. É essa troca que faz uma página
          abrir no 3G do acampamento.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  const acoes = (
    <button onClick={finalizar} disabled={!tudoFeito || gravando}
      className="btn-primary text-sm w-full justify-center disabled:opacity-50">
      {gravando ? 'Salvando…' : tudoFeito ? 'Concluir o laboratório' : `Faltam ${tarefas.filter(t => !t.feita).length}`}
    </button>
  );

  const corDaBarra = dentroDoOrcamento ? '#3FBF6F' : proporcaoDoOrcamento > 2 ? '#E5484D' : '#E8A33D';

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="compressor-de-imagens"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
    >
      <style>{CSS_COMPRESSOR}</style>

      <div className="cp">
        <div className="cp-topo">
          <span className="cp-marca">
            <Minimize2 className="w-4 h-4" style={{ color: '#4C8DFF' }} /> Comprimir Imagens
          </span>
          {nomeOriginal && <span className="cp-arquivo truncate">{nomeOriginal}</span>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="cp-bt" onClick={() => campoArquivo.current?.click()}>
              <Upload className="w-4 h-4" /> Abrir imagem
            </button>
            <input ref={campoArquivo} type="file" accept="image/*" hidden
              aria-label="Escolher uma imagem"
              onChange={e => receberArquivo(e.target.files?.[0])} />
            <button className="cp-bt" onClick={usarExemplo}>
              <Sparkles className="w-4 h-4" /> Usar exemplo
            </button>
          </div>
        </div>

        <div className="cp-corpo">
          <div className="cp-palco">
            {!saida ? (
              <div className="cp-vazio">
                <IconeImagem className="w-12 h-12 mx-auto" style={{ color: '#4C4C58' }} />
                <h2>Abra uma foto para começar</h2>
                <p>
                  Uma foto de celular sai com dois ou três megabytes. Numa página de
                  internet isso é uma eternidade — e o requisito pede que ela caiba
                  em 15&nbsp;KB sem deixar de ser vista.
                </p>
                <button className="cp-bt forte" onClick={usarExemplo}>
                  <Sparkles className="w-4 h-4" /> Usar a foto de exemplo
                </button>
              </div>
            ) : (
              <div className="cp-comparador" ref={comparador}
                onPointerDown={e => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); arrastar(e); }}
                onPointerMove={arrastar}>
                <img src={urlOriginal} alt="A foto original" />
                <img className="depois" src={saida.url} alt="A foto comprimida"
                  style={{ clipPath: `inset(0 0 0 ${reguaEm}%)` }} />
                <div className="cp-regua" style={{ left: `${reguaEm}%` }}>
                  <span className="cp-pega" aria-hidden="true">⇄</span>
                </div>
                <div className="cp-etiqueta esq">
                  <b>Original</b>
                  {formatBytes(bytesOriginais)} · {sourceSize(origem!).width} × {sourceSize(origem!).height}
                </div>
                <div className="cp-etiqueta dir">
                  <b>{formato === 'jpeg' ? 'JPEG' : 'PNG'}</b>
                  {formatBytes(saida.bytes)} · {saida.w} × {saida.h}
                </div>
              </div>
            )}
          </div>

          <div className="cp-painel">
            <p className="cp-secao">Redimensionar</p>
            <div className="cp-linha"><span>Largura</span><span>{saida?.w ?? largura} px</span></div>
            <input className="cp-faixa" type="range" min={200} max={2000} step={20}
              value={largura} aria-label="Largura em pixels"
              onChange={e => setLargura(Number(e.target.value))} />
            <p className="cp-nota">
              Metade da largura é um quarto dos pixels. É o ajuste que mais tira peso.
            </p>

            <p className="cp-secao">Formato</p>
            <div className="cp-radio">
              <button aria-pressed={formato === 'jpeg'} onClick={() => setFormato('jpeg')}>JPEG</button>
              <button aria-pressed={formato === 'png'} onClick={() => setFormato('png')}>PNG</button>
            </div>
            <p className="cp-nota" style={{ marginTop: 7 }}>
              {formato === 'jpeg'
                ? 'O JPEG joga fora detalhe que o olho não percebe. É o que vence em fotografia.'
                : 'O PNG guarda cada pixel, e por isso pesa. Serve para desenho e para transparência — não para foto.'}
            </p>

            {formato === 'jpeg' && (
              <>
                <p className="cp-secao">Qualidade</p>
                <div className="cp-linha"><span>Compressão</span><span>{Math.round(qualidade * 100)}</span></div>
                <input className="cp-faixa" type="range" min={10} max={100} step={5}
                  value={Math.round(qualidade * 100)} aria-label="Qualidade"
                  onChange={e => setQualidade(Number(e.target.value) / 100)} />
              </>
            )}

            <p className="cp-secao">Tamanho do arquivo</p>
            <div className="cp-orcamento">
              <p className="cp-medida" style={{ color: corDaBarra }}>
                {saida ? formatBytes(saida.bytes) : '—'}
              </p>
              <div className="cp-barra">
                <span style={{ width: `${Math.min(100, proporcaoDoOrcamento * 100)}%`, background: corDaBarra }} />
              </div>
              <p className="cp-nota">
                {!saida ? 'Abra uma foto para medir.'
                  : dentroDoOrcamento
                    ? `Dentro do limite de ${formatBytes(ORCAMENTO)}. A foto ficou ${quantasVezes.toLocaleString('pt-BR')} vezes menor que a original.`
                    : `O limite é ${formatBytes(ORCAMENTO)}. Falta tirar ${formatBytes(saida.bytes - ORCAMENTO)}.`}
              </p>
            </div>

            <button className="cp-bt forte" style={{ width: '100%', marginTop: 14, height: 36, justifyContent: 'center' }}
              disabled={!saida}
              onClick={() => {
                if (!saida) return;
                const base = nomeOriginal.replace(/\.[^.]+$/, '') || 'foto';
                downloadBlob(saida.blob, `${base}-leve.${formato === 'jpeg' ? 'jpg' : 'png'}`);
                setSalvo(true);
              }}>
              <Download className="w-4 h-4" /> Baixar
            </button>
          </div>
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
