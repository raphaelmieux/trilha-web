import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId } from '../lib/progress';
import {
  calculateResize, formatBytes, recommendFormat, contrastRatio, loadImageFile,
  drawResized, sourceSize, drawSamplePhoto, drawLogo, drawButton, drawHeader,
  canvasToBlob, hasTransparency, downloadBlob,
  type ImageFormat, type LogoShape,
} from '../lib/imageTools';
import {
  Image as ImageIcon, Upload, Wand2, Download, CheckCircle2, AlertCircle,
  MousePointerClick, PanelTop, Shapes, Camera,
} from 'lucide-react';

interface Props { specialtyCode: string; requirementCodes: string[]; userId: string; }

/**
 * ImageLab — requirement AP035-4.1: "criar imagens para uso na web: uma imagem
 * JPEG, uma imagem PNG, um botão e um header".
 *
 * The requirement says *create*. The previous version asked four multiple-choice
 * questions about formats and never opened or produced a single image, so a
 * student could finish it having produced nothing. Here each of the four stages
 * ends with a real file on the student's disk, and every check is measured off
 * the actual pixels and bytes: dimensions, file size, the alpha channel, and the
 * contrast ratio between the colours they picked.
 */

interface Check { id: string; label: string; passed: boolean; hint: string }

interface Exported {
  pngUrl: string;
  jpegUrl: string;
  pngBlob: Blob;
  jpegBlob: Blob;
  pngBytes: number;
  jpegBytes: number;
  hasAlpha: boolean;
  width: number;
  height: number;
}

/** Encodes a canvas both ways so the size comparison is measured, never asserted. */
function useExported(canvas: HTMLCanvasElement | null, quality: number): Exported | null {
  const [out, setOut] = useState<Exported | null>(null);

  useEffect(() => {
    if (!canvas) { setOut(null); return; }
    let cancelled = false;
    const urls: string[] = [];

    (async () => {
      const [pngBlob, jpegBlob] = await Promise.all([
        canvasToBlob(canvas, 'png'),
        canvasToBlob(canvas, 'jpeg', quality),
      ]);
      if (cancelled) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      const jpegUrl = URL.createObjectURL(jpegBlob);
      urls.push(pngUrl, jpegUrl);
      setOut({
        pngUrl, jpegUrl, pngBlob, jpegBlob,
        pngBytes: pngBlob.size, jpegBytes: jpegBlob.size,
        hasAlpha: hasTransparency(canvas),
        width: canvas.width, height: canvas.height,
      });
    })();

    return () => { cancelled = true; urls.forEach(URL.revokeObjectURL); };
  }, [canvas, quality]);

  return out;
}

const CHECKER = `repeating-conic-gradient(#3a3a3a 0% 25%, #262626 0% 50%) 50% / 18px 18px`;

const PHOTO_MAX_BYTES = 300 * 1024;
const TOUCH_TARGET_MIN = 44;

export default function ImageLab({ specialtyCode, requirementCodes, userId }: Props) {
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const markSaved = (id: string) => setSaved(prev => ({ ...prev, [id]: true }));

  /* ── 1. Fotografia → JPEG ───────────────────────────────────────────────── */
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | HTMLCanvasElement | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [sourceInfo, setSourceInfo] = useState<{ w: number; h: number; bytes: number } | null>(null);
  const [maxWidth, setMaxWidth] = useState(1200);
  const [quality, setQuality] = useState(0.8);

  const photoCanvas = useMemo(() => {
    if (!sourceImg) return null;
    const { width, height } = sourceSize(sourceImg);
    return drawResized(sourceImg, calculateResize(width, height, maxWidth));
  }, [sourceImg, maxWidth]);

  const photo = useExported(photoCanvas, quality);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLoadError('');
    try {
      const img = await loadImageFile(file);
      setSourceImg(img);
      setSourceName(file.name);
      setSourceInfo({ w: img.naturalWidth, h: img.naturalHeight, bytes: file.size });
    } catch (err) {
      setLoadError((err as Error).message);
    }
  };

  const useSamplePhoto = async () => {
    setLoadError('');
    const canvas = drawSamplePhoto();
    // The sample has no original file, so its "before" size is the honest one:
    // what the same picture would weigh saved losslessly, straight off the canvas.
    const blob = await canvasToBlob(canvas, 'png');
    setSourceImg(canvas);
    setSourceName('exemplo-por-do-sol.png');
    setSourceInfo({ w: canvas.width, h: canvas.height, bytes: blob.size });
  };

  const photoChecks: Check[] = [
    {
      id: 'foto-carregada', label: 'Uma fotografia foi aberta no laboratório',
      passed: !!photo,
      hint: 'Escolha uma foto do seu dispositivo ou use a imagem de exemplo.',
    },
    {
      id: 'foto-redimensionada', label: `Largura final de no máximo ${maxWidth} px`,
      passed: !!photo && photo.width <= 1200,
      hint: 'Fotos de celular saem com 3000 px ou mais. Nenhuma tela de site precisa disso — reduza para 1200 px ou menos.',
    },
    {
      id: 'foto-leve', label: `Arquivo JPEG com até ${formatBytes(PHOTO_MAX_BYTES)}`,
      passed: !!photo && photo.jpegBytes <= PHOTO_MAX_BYTES,
      hint: 'Reduza a largura ou baixe um pouco a qualidade até o arquivo caber no orçamento.',
    },
    {
      id: 'foto-menor-que-png', label: 'O JPEG ficou menor que o PNG da mesma foto',
      passed: !!photo && photo.jpegBytes < photo.pngBytes,
      hint: 'Numa imagem com milhões de cores, o JPEG vence com folga. É por isso que fotos vão em JPEG.',
    },
    {
      id: 'foto-salva', label: 'JPEG salvo no seu dispositivo',
      passed: !!saved['foto'],
      hint: 'Clique em "Baixar JPEG" para guardar o arquivo pronto.',
    },
  ];

  /* ── 2. Logo → PNG com transparência ────────────────────────────────────── */
  const [logoText, setLogoText] = useState('DBV');
  const [logoShape, setLogoShape] = useState<LogoShape>('escudo');
  const [logoFill, setLogoFill] = useState('#F5A623');
  const [logoFg, setLogoFg] = useState('#FFFFFF');

  const logoCanvas = useMemo(
    () => drawLogo({ text: logoText, shape: logoShape, fill: logoFill, fg: logoFg }),
    [logoText, logoShape, logoFill, logoFg],
  );
  const logo = useExported(logoCanvas, 0.85);
  const logoContrast = contrastRatio(logoFill, logoFg);

  const logoChecks: Check[] = [
    {
      id: 'logo-texto', label: 'O logo tem uma sigla ou nome',
      passed: logoText.trim().length > 0 && logoText.trim().length <= 6,
      hint: 'Use de 1 a 6 caracteres. Um logo com frase inteira fica ilegível em tamanho pequeno.',
    },
    {
      id: 'logo-alpha', label: 'Fundo transparente de verdade (canal alfa)',
      passed: !!logo && logo.hasAlpha,
      hint: 'O PNG guarda a transparência. Confira ao lado: sobre qualquer cor de fundo, o logo não carrega um retângulo.',
    },
    {
      id: 'logo-contraste', label: 'Contraste do texto sobre a forma de ao menos 4,5:1',
      passed: logoContrast >= 4.5,
      hint: `Agora está em ${logoContrast.toFixed(1)}:1. Escureça a forma ou clareie o texto.`,
    },
    {
      id: 'logo-salvo', label: 'PNG salvo no seu dispositivo',
      passed: !!saved['logo'],
      hint: 'Clique em "Baixar PNG" para guardar o logo com o fundo transparente.',
    },
  ];

  /* ── 3. Botão ───────────────────────────────────────────────────────────── */
  const [btnLabel, setBtnLabel] = useState('Inscreva-se');
  const [btnWidth, setBtnWidth] = useState(320);
  const [btnHeight, setBtnHeight] = useState(32);
  const [btnRadius, setBtnRadius] = useState(0);
  const [btnBg, setBtnBg] = useState('#C13516');
  const [btnFg, setBtnFg] = useState('#FFFFFF');

  const buttonCanvas = useMemo(
    () => drawButton({ label: btnLabel, width: btnWidth, height: btnHeight, bg: btnBg, fg: btnFg, radius: btnRadius }),
    [btnLabel, btnWidth, btnHeight, btnBg, btnFg, btnRadius],
  );
  const button = useExported(buttonCanvas, 0.85);
  const btnContrast = contrastRatio(btnBg, btnFg);

  const buttonChecks: Check[] = [
    {
      id: 'btn-rotulo', label: 'Rótulo curto e com verbo de ação',
      passed: btnLabel.trim().length >= 3 && btnLabel.trim().length <= 24,
      hint: 'De 3 a 24 caracteres. "Inscreva-se" diz o que acontece; "Clique aqui" não diz nada.',
    },
    {
      id: 'btn-alvo', label: `Altura de ao menos ${TOUCH_TARGET_MIN} px para o toque`,
      passed: btnHeight >= TOUCH_TARGET_MIN,
      hint: 'Num celular o botão é tocado com o dedo, não clicado com o mouse. Abaixo de 44 px o alvo passa a errar.',
    },
    {
      id: 'btn-contraste', label: 'Contraste do rótulo de ao menos 4,5:1',
      passed: btnContrast >= 4.5,
      hint: `Agora está em ${btnContrast.toFixed(1)}:1. Texto claro sobre fundo claro some no sol.`,
    },
    {
      id: 'btn-cantos', label: 'Cantos arredondados com transparência preservada',
      passed: !!button && button.hasAlpha && btnRadius > 0,
      hint: 'Arredonde os cantos. É justamente esse recorte que só sobrevive em PNG — em JPEG ele vira um quadrado preto.',
    },
    {
      id: 'btn-salvo', label: 'PNG do botão salvo no seu dispositivo',
      passed: !!saved['botao'],
      hint: 'Clique em "Baixar PNG".',
    },
  ];

  /* ── 4. Header ──────────────────────────────────────────────────────────── */
  const [hdTitle, setHdTitle] = useState('Clube de Desbravadores');
  const [hdSubtitle, setHdSubtitle] = useState('Aventura, serviço e amizade');
  const [hdWidth, setHdWidth] = useState(1600);
  const [hdHeight, setHdHeight] = useState(620);
  const [hdFrom, setHdFrom] = useState('#1B2E8C');
  const [hdTo, setHdTo] = useState('#C13516');
  const [hdFg, setHdFg] = useState('#F5A623');

  const headerCanvas = useMemo(
    () => drawHeader({ title: hdTitle, subtitle: hdSubtitle, width: hdWidth, height: hdHeight, from: hdFrom, to: hdTo, fg: hdFg }),
    [hdTitle, hdSubtitle, hdWidth, hdHeight, hdFrom, hdTo, hdFg],
  );
  const header = useExported(headerCanvas, 0.85);
  const hdContrastFrom = contrastRatio(hdFrom, hdFg);
  const hdContrastTo = contrastRatio(hdTo, hdFg);
  const hdRatio = hdHeight > 0 ? hdWidth / hdHeight : 0;
  const headerAdvice = header ? recommendFormat(header.hasAlpha, header.jpegBytes, header.pngBytes) : null;

  const headerChecks: Check[] = [
    {
      id: 'hd-titulo', label: 'Título preenchido',
      passed: hdTitle.trim().length >= 3,
      hint: 'O header é a primeira coisa que a pessoa lê. Escreva o nome do clube.',
    },
    {
      id: 'hd-proporcao', label: 'Proporção de banner (largura de ao menos 3× a altura)',
      passed: hdRatio >= 3,
      hint: `Agora está em ${hdRatio.toFixed(1)}×. Um header alto demais empurra o conteúdo do site para fora da tela.`,
    },
    {
      id: 'hd-contraste', label: 'Texto legível nas duas pontas do degradê',
      passed: hdContrastFrom >= 4.5 && hdContrastTo >= 4.5,
      hint: `Início ${hdContrastFrom.toFixed(1)}:1, fim ${hdContrastTo.toFixed(1)}:1. O texto atravessa o degradê inteiro — ele precisa passar nos dois extremos, não só onde começa.`,
    },
    {
      id: 'hd-salvo', label: 'Header salvo no formato recomendado',
      passed: !!saved['header'],
      hint: 'Baixe o header no formato que o laboratório indicar abaixo.',
    },
  ];

  /* ── Progresso ──────────────────────────────────────────────────────────── */
  const allChecks = [...photoChecks, ...logoChecks, ...buttonChecks, ...headerChecks];
  const passedCount = allChecks.filter(c => c.passed).length;
  const allPassed = passedCount === allChecks.length;

  const handleComplete = async () => {
    setSaving(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: passedCount, total_questions: allChecks.length,
      });
    }
    await logActivity(userId, 'image_lab_completed', { checksPassed: passedCount, total: allChecks.length });
    setCompleted(true);
  };

  const download = (blob: Blob, name: string, id: string) => {
    downloadBlob(blob, name);
    markSaved(id);
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">ImageLab concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Você produziu quatro imagens de verdade — fotografia, logo, botão e header —
          e todas passaram nas {allChecks.length} verificações de tamanho, formato e legibilidade.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> ImageLab — Imagens para a Web
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Quatro imagens para produzir: uma fotografia otimizada em JPEG, um logo em PNG
          com fundo transparente, um botão e um header. Nada aqui é de múltipla escolha —
          as verificações medem os pixels e os bytes que você realmente gerou. Todo o
          processamento acontece no seu próprio dispositivo; nenhuma imagem é enviada
          para a internet.
        </p>
        <p className="text-sm mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-warning-a10)', color: 'var(--color-text-soft)' }}>
          <strong style={{ color: 'var(--color-warning)' }}>Comece consertando.</strong>{' '}
          Cada etapa já vem preenchida com defeitos de propósito — os mesmos que aparecem
          em sites reais de clube. Descubra qual é o problema de cada uma e corrija até
          todas as verificações ficarem verdes.
        </p>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-bold flex items-center gap-2">
            <span style={{ color: allPassed ? 'var(--color-success)' : 'var(--color-text)' }}>
              {passedCount} de {allChecks.length}
            </span>
            <span className="text-sm font-normal" style={{ color: 'var(--color-text-muted)' }}>verificações atendidas</span>
          </h2>
          {allPassed && (
            <button onClick={handleComplete} disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Concluir ImageLab'}
            </button>
          )}
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(passedCount / allChecks.length) * 100}%`,
              background: allPassed ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            }}
          />
        </div>
      </div>

      {/* ── Etapa 1 ── */}
      <StageCard title="1. Fotografia em JPEG" icon={Camera} checks={photoChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Uma foto tirada no celular chega com 3000 px de largura e vários megabytes.
          Publicada assim, ela sozinha demora mais para carregar que a página inteira.
          Reduza a largura, escolha a qualidade e observe o arquivo encolher.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
            <Upload className="w-4 h-4 mr-1" /> Escolher uma foto
          </button>
          <button onClick={useSamplePhoto} className="btn-secondary">
            <Wand2 className="w-4 h-4 mr-1" /> Usar imagem de exemplo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { void handleFile(e.target.files?.[0]); e.target.value = ''; }}
          />
        </div>
        {loadError && (
          <p className="text-sm mb-3" style={{ color: 'var(--color-error)' }}>{loadError}</p>
        )}

        {photo && sourceInfo && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <img
                src={photo.jpegUrl}
                alt="Prévia da fotografia otimizada"
                className="w-full rounded-lg"
                style={{ border: '1px solid var(--color-border)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>{sourceName}</p>
            </div>

            <div className="space-y-3">
              <Field label={`Largura final: ${photo.width} px`}>
                <input
                  type="range" min={400} max={2000} step={100} value={maxWidth}
                  onChange={e => setMaxWidth(Number(e.target.value))}
                  className="w-full" aria-label="Largura máxima"
                />
              </Field>
              <Field label={`Qualidade do JPEG: ${Math.round(quality * 100)}%`}>
                <input
                  type="range" min={30} max={95} step={5} value={Math.round(quality * 100)}
                  onChange={e => setQuality(Number(e.target.value) / 100)}
                  className="w-full" aria-label="Qualidade do JPEG"
                />
              </Field>

              <dl className="text-sm space-y-1">
                <SizeRow label="Original" value={`${sourceInfo.w}×${sourceInfo.h} — ${formatBytes(sourceInfo.bytes)}`} />
                <SizeRow
                  label="JPEG gerado"
                  value={`${photo.width}×${photo.height} — ${formatBytes(photo.jpegBytes)}`}
                  tone={photo.jpegBytes <= PHOTO_MAX_BYTES ? 'good' : 'bad'}
                />
                <SizeRow label="Mesma foto em PNG" value={formatBytes(photo.pngBytes)} tone="bad" />
              </dl>

              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                O PNG guarda cada pixel exatamente como está, inclusive o ruído do sensor.
                O JPEG descarta o que o olho não percebe — por isso a diferença é tão grande
                numa fotografia, e por isso ele é o formato certo aqui.
              </p>

              <button
                onClick={() => download(photo.jpegBlob, 'foto-otimizada.jpg', 'foto')}
                className="btn-primary w-full"
              >
                <Download className="w-4 h-4 mr-1" /> Baixar JPEG
              </button>
            </div>
          </div>
        )}
      </StageCard>

      {/* ── Etapa 2 ── */}
      <StageCard title="2. Logo em PNG com transparência" icon={Shapes} checks={logoChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Um logo precisa pousar sobre qualquer fundo. Monte o emblema do seu clube e
          compare os dois arquivos: o PNG guarda a transparência, o JPEG não tem onde
          guardá-la e devolve a forma dentro de uma caixa preta.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Field label="Sigla ou nome curto">
              <input
                type="text" value={logoText} maxLength={6}
                onChange={e => setLogoText(e.target.value)}
                className="input-field" aria-label="Texto do logo"
              />
            </Field>
            <Field label="Forma">
              <div className="flex gap-2">
                {(['escudo', 'circulo', 'hexagono'] as LogoShape[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setLogoShape(s)}
                    className={logoShape === s ? 'btn-primary flex-1 text-xs' : 'btn-secondary flex-1 text-xs'}
                  >
                    {s === 'escudo' ? 'Escudo' : s === 'circulo' ? 'Círculo' : 'Hexágono'}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Cor da forma" value={logoFill} onChange={setLogoFill} />
              <ColorField label="Cor do texto" value={logoFg} onChange={setLogoFg} />
            </div>
            <ContrastReadout ratio={logoContrast} />
            {logo && (
              <button onClick={() => download(logo.pngBlob, 'logo.png', 'logo')} className="btn-primary w-full">
                <Download className="w-4 h-4 mr-1" /> Baixar PNG ({formatBytes(logo.pngBytes)})
              </button>
            )}
          </div>

          {logo && (
            <div className="grid grid-cols-2 gap-3">
              <Comparison
                title="PNG"
                caption={`${formatBytes(logo.pngBytes)} — fundo transparente`}
                tone="good"
                src={logo.pngUrl}
              />
              <Comparison
                title="JPEG"
                caption={`${formatBytes(logo.jpegBytes)} — a transparência virou fundo sólido`}
                tone="bad"
                src={logo.jpegUrl}
              />
            </div>
          )}
        </div>
      </StageCard>

      {/* ── Etapa 3 ── */}
      <StageCard title="3. Botão para o site" icon={MousePointerClick} checks={buttonChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Um botão é uma imagem com trabalho a fazer: precisa ser lido de relance e
          acertado com o dedo. As duas medidas que decidem isso — contraste e altura —
          são conferidas aqui.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Field label="Rótulo">
              <input
                type="text" value={btnLabel} maxLength={24}
                onChange={e => setBtnLabel(e.target.value)}
                className="input-field" aria-label="Rótulo do botão"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Largura: ${btnWidth} px`}>
                <input type="range" min={120} max={480} step={10} value={btnWidth}
                  onChange={e => setBtnWidth(Number(e.target.value))} className="w-full" aria-label="Largura do botão" />
              </Field>
              <Field label={`Altura: ${btnHeight} px`}>
                <input type="range" min={28} max={96} step={2} value={btnHeight}
                  onChange={e => setBtnHeight(Number(e.target.value))} className="w-full" aria-label="Altura do botão" />
              </Field>
            </div>
            <Field label={`Arredondamento dos cantos: ${btnRadius} px`}>
              <input type="range" min={0} max={Math.round(btnHeight / 2)} step={1} value={Math.min(btnRadius, Math.round(btnHeight / 2))}
                onChange={e => setBtnRadius(Number(e.target.value))} className="w-full" aria-label="Raio dos cantos" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Cor de fundo" value={btnBg} onChange={setBtnBg} />
              <ColorField label="Cor do texto" value={btnFg} onChange={setBtnFg} />
            </div>
            <ContrastReadout ratio={btnContrast} />
          </div>

          {button && (
            <div className="space-y-3">
              <div
                className="rounded-lg p-6 flex items-center justify-center"
                style={{ background: CHECKER, border: '1px solid var(--color-border)' }}
              >
                <img src={button.pngUrl} alt="Prévia do botão" style={{ maxWidth: '100%' }} />
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                O xadrez atrás do botão é o modo padrão de mostrar transparência — onde ele
                aparece, não há pixel nenhum na imagem. Repare nos quatro cantos.
              </p>
              <button onClick={() => download(button.pngBlob, 'botao.png', 'botao')} className="btn-primary w-full">
                <Download className="w-4 h-4 mr-1" /> Baixar PNG ({formatBytes(button.pngBytes)})
              </button>
            </div>
          )}
        </div>
      </StageCard>

      {/* ── Etapa 4 ── */}
      <StageCard title="4. Header do site" icon={PanelTop} checks={headerChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          O header é a faixa que abre a página. Ele atravessa um degradê inteiro, então
          o texto tem de continuar legível do começo ao fim — não basta funcionar de um lado.
        </p>

        <div className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Título">
              <input type="text" value={hdTitle} maxLength={40}
                onChange={e => setHdTitle(e.target.value)} className="input-field" aria-label="Título do header" />
            </Field>
            <Field label="Subtítulo">
              <input type="text" value={hdSubtitle} maxLength={60}
                onChange={e => setHdSubtitle(e.target.value)} className="input-field" aria-label="Subtítulo do header" />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Field label={`Largura: ${hdWidth} px`}>
              <input type="range" min={800} max={2000} step={50} value={hdWidth}
                onChange={e => setHdWidth(Number(e.target.value))} className="w-full" aria-label="Largura do header" />
            </Field>
            <Field label={`Altura: ${hdHeight} px — proporção ${hdRatio.toFixed(1)}×`}>
              <input type="range" min={160} max={800} step={20} value={hdHeight}
                onChange={e => setHdHeight(Number(e.target.value))} className="w-full" aria-label="Altura do header" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <ColorField label="Degradê: início" value={hdFrom} onChange={setHdFrom} />
            <ColorField label="Degradê: fim" value={hdTo} onChange={setHdTo} />
            <ColorField label="Cor do texto" value={hdFg} onChange={setHdFg} />
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <ContrastReadout ratio={hdContrastFrom} label="Contraste no início do degradê" />
            <ContrastReadout ratio={hdContrastTo} label="Contraste no fim do degradê" />
          </div>

          {header && (
            <>
              <img
                src={header.jpegUrl}
                alt="Prévia do header"
                className="w-full rounded-lg"
                style={{ border: '1px solid var(--color-border)' }}
              />
              {headerAdvice && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-tertiary-a10)', color: 'var(--color-text-soft)' }}>
                  <strong style={{ color: 'var(--color-tertiary-light)' }}>
                    Formato recomendado: {headerAdvice.format.toUpperCase()}
                  </strong>
                  <span className="block mt-0.5">{headerAdvice.reason}</span>
                  <span className="block mt-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                    JPEG {formatBytes(header.jpegBytes)} · PNG {formatBytes(header.pngBytes)}
                  </span>
                </div>
              )}
              <button
                onClick={() => {
                  const format: ImageFormat = headerAdvice?.format ?? 'jpeg';
                  const blob = format === 'png' ? header.pngBlob : header.jpegBlob;
                  download(blob, `header.${format === 'png' ? 'png' : 'jpg'}`, 'header');
                }}
                className="btn-primary w-full"
              >
                <Download className="w-4 h-4 mr-1" />
                Baixar header em {(headerAdvice?.format ?? 'jpeg').toUpperCase()}
              </button>
            </>
          )}
        </div>
      </StageCard>

      {!allPassed && (
        <div className="card p-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Faltam {allChecks.length - passedCount} verificações. Cada etapa lista o que ainda
          precisa ser ajustado.
        </div>
      )}
    </div>
  );
}

/* ── Peças de interface ───────────────────────────────────────────────────── */

function StageCard({ title, icon: Icon, checks, children }: {
  title: string;
  icon: typeof ImageIcon;
  checks: Check[];
  children: ReactNode;
}) {
  const done = checks.filter(c => c.passed).length;
  const complete = done === checks.length;
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <h2 className="font-bold flex items-center gap-2">
          <span
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: complete ? 'var(--color-success-a10)' : 'var(--color-primary-a10)' }}
          >
            <Icon className="w-5 h-5" style={{ color: complete ? 'var(--color-success)' : 'var(--color-primary)' }} />
          </span>
          {title}
        </h2>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: complete ? 'var(--color-success-a10)' : 'var(--color-bg-hover)',
            color: complete ? 'var(--color-success)' : 'var(--color-text-muted)',
          }}
        >
          {done}/{checks.length}
        </span>
      </div>

      {children}

      <ul className="mt-4 space-y-2">
        {checks.map(c => (
          <li
            key={c.id}
            className="flex items-start gap-2 text-sm p-2 rounded-lg"
            style={{ backgroundColor: c.passed ? 'var(--color-success-a10)' : 'var(--color-bg-input)' }}
          >
            {c.passed
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
              : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-faint)' }} />}
            <div className="min-w-0">
              <span className="font-medium" style={{ color: c.passed ? 'var(--color-success)' : 'var(--color-text-soft)' }}>
                {c.label}
              </span>
              {!c.passed && (
                <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{c.hint}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      {children}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-10 h-9 rounded cursor-pointer flex-shrink-0"
          style={{ background: 'transparent', border: '1px solid var(--color-border)' }}
          aria-label={label}
        />
        <span className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>{value.toUpperCase()}</span>
      </div>
    </Field>
  );
}

function ContrastReadout({ ratio, label = 'Contraste do texto' }: { ratio: number; label?: string }) {
  const ok = ratio >= 4.5;
  return (
    <p className="text-xs flex items-center gap-1.5" style={{ color: ok ? 'var(--color-success)' : 'var(--color-warning)' }}>
      {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
      {label}: <strong>{ratio.toFixed(1)}:1</strong>
      <span style={{ color: 'var(--color-text-dim)' }}>{ok ? '(passa em 4,5:1)' : '(mínimo 4,5:1)'}</span>
    </p>
  );
}

function SizeRow({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="flex justify-between gap-2">
      <dt style={{ color: 'var(--color-text-muted)' }}>{label}</dt>
      <dd
        className="font-mono"
        style={{ color: tone === 'good' ? 'var(--color-success)' : tone === 'bad' ? 'var(--color-text-soft)' : 'var(--color-text)' }}
      >
        {value}
      </dd>
    </div>
  );
}

function Comparison({ title, caption, tone, src }: {
  title: string; caption: string; tone: 'good' | 'bad'; src: string;
}) {
  const colour = tone === 'good' ? 'var(--color-success)' : 'var(--color-error)';
  return (
    <div>
      <p className="text-xs font-bold mb-1" style={{ color: colour }}>{title}</p>
      <div
        className="rounded-lg p-3 flex items-center justify-center"
        style={{ background: CHECKER, border: `1px solid ${colour}` }}
      >
        <img src={src} alt={`Logo exportado como ${title}`} style={{ maxWidth: '100%' }} />
      </div>
      <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>{caption}</p>
    </div>
  );
}
