import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import {
  calculateResize, formatBytes, contrastRatio, loadImageFile,
  drawResized, sourceSize, drawSamplePhoto, drawLogo, drawButton, drawHeader,
  canvasToBlob, hasTransparency, downloadBlob, isWebSafe, nearestWebSafe,
  type LogoShape,
} from '../lib/imageTools';
import {
  Image as ImageIcon, Upload, Wand2, Download, CheckCircle2, AlertCircle,
  MousePointerClick, PanelTop, Shapes, Camera, Palette,
} from 'lucide-react';

interface Props { specialtyCode: string; lessonCode: string; requirementCodes: string[]; userId: string; }

/**
 * ImageLab — requirement AP035-5.2, quoted from the official sheet:
 *
 *   "Usar esse conhecimento para criar um JPG e um GIF/PNG que estão ambos sob
 *    15k, mas que ainda são facilmente visíveis em um site e criar, pelo menos,
 *    cinco botões de navegação gráfica e um header para o seu site."
 *
 * The previous version budgeted 300 KB — twenty times what the document allows —
 * asked for one button where the sheet asks for five, and never mentioned the
 * web-safe colours the same requirement opens with. It was a good lab for a
 * requirement nobody had written.
 *
 * 15 KB is genuinely tight, and that is the point: it cannot be met by accident.
 * The student has to trade width against quality and watch the byte count move,
 * which is the skill the requirement is describing.
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

/** The document's budget, in bytes. "15k" is 15 × 1024. */
const BUDGET = 15 * 1024;
/** Below this the file would be small by being useless, not by being optimised. */
const MIN_VISIBLE_WIDTH = 400;
const TOUCH_TARGET_MIN = 44;
/** "pelo menos, cinco botões de navegação gráfica" */
const NAV_LABELS_DEFAULT = ['Início', 'Sobre', 'Galeria', 'Contato', 'Eventos'];

export default function ImageLab({ specialtyCode, lessonCode, requirementCodes, userId }: Props) {
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const markSaved = (id: string) => setSaved(prev => ({ ...prev, [id]: true }));

  /* ── 1. Fotografia → JPEG sob 15 KB ─────────────────────────────────────── */
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
      id: 'foto-visivel', label: `Continua visível: ao menos ${MIN_VISIBLE_WIDTH} px de largura`,
      passed: !!photo && photo.width >= MIN_VISIBLE_WIDTH,
      hint: 'O requisito pede um arquivo leve que ainda seja "facilmente visível". Encolher até virar selo não vale.',
    },
    {
      id: 'foto-budget', label: `JPG abaixo de ${formatBytes(BUDGET)}`,
      passed: !!photo && photo.jpegBytes <= BUDGET,
      hint: photo
        ? `Agora está em ${formatBytes(photo.jpegBytes)}. Reduza a largura, depois a qualidade — nessa ordem.`
        : 'Abra uma foto para começar.',
    },
    {
      id: 'foto-salva', label: 'JPG salvo no seu dispositivo',
      passed: !!saved['foto'],
      hint: 'Clique em "Baixar JPG" para guardar o arquivo pronto.',
    },
  ];

  /* ── 2. Logo → PNG sob 15 KB ────────────────────────────────────────────── */
  const [logoText, setLogoText] = useState('DBV');
  const [logoShape, setLogoShape] = useState<LogoShape>('escudo');
  const [logoSize, setLogoSize] = useState(512);
  const [logoFill, setLogoFill] = useState('#F5A623');
  const [logoFg, setLogoFg] = useState('#FFFFFF');

  const logoCanvas = useMemo(
    () => drawLogo({ text: logoText, shape: logoShape, fill: logoFill, fg: logoFg, size: logoSize }),
    [logoText, logoShape, logoFill, logoFg, logoSize],
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
      id: 'logo-budget', label: `PNG abaixo de ${formatBytes(BUDGET)}`,
      passed: !!logo && logo.pngBytes <= BUDGET,
      hint: logo
        ? `Agora está em ${formatBytes(logo.pngBytes)}. Reduza o tamanho do logo — cor chapada comprime bem, mas pixel demais pesa.`
        : 'Monte o logo para conferir.',
    },
    {
      id: 'logo-salvo', label: 'PNG salvo no seu dispositivo',
      passed: !!saved['logo'],
      hint: 'Clique em "Baixar PNG".',
    },
  ];

  /* ── 3. Cinco botões de navegação ───────────────────────────────────────── */
  const [navLabels, setNavLabels] = useState<string[]>(NAV_LABELS_DEFAULT);
  const [btnHeight, setBtnHeight] = useState(48);
  const [btnRadius, setBtnRadius] = useState(10);
  const [btnBg, setBtnBg] = useState('#CC3300');
  const [btnFg, setBtnFg] = useState('#FFFFFF');

  const buttonCanvases = useMemo(
    () => navLabels.map(label => drawButton({
      label: label || ' ', width: Math.max(140, label.length * 16 + 60),
      height: btnHeight, bg: btnBg, fg: btnFg, radius: btnRadius,
    })),
    [navLabels, btnHeight, btnBg, btnFg, btnRadius],
  );

  const [buttonUrls, setButtonUrls] = useState<{ url: string; blob: Blob; bytes: number; alpha: boolean }[]>([]);
  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    (async () => {
      const made = await Promise.all(buttonCanvases.map(async canvas => {
        const blob = await canvasToBlob(canvas, 'png');
        return { blob, bytes: blob.size, alpha: hasTransparency(canvas) };
      }));
      if (cancelled) return;
      const withUrls = made.map(m => {
        const url = URL.createObjectURL(m.blob);
        urls.push(url);
        return { ...m, url };
      });
      setButtonUrls(withUrls);
    })();
    return () => { cancelled = true; urls.forEach(URL.revokeObjectURL); };
  }, [buttonCanvases]);

  const btnContrast = contrastRatio(btnBg, btnFg);
  const filledLabels = navLabels.filter(l => l.trim().length >= 2).length;
  const heaviestButton = buttonUrls.length ? Math.max(...buttonUrls.map(b => b.bytes)) : 0;

  const buttonChecks: Check[] = [
    {
      id: 'btn-cinco', label: 'Cinco botões de navegação com rótulo',
      passed: filledLabels >= 5,
      hint: `${filledLabels} de 5 preenchidos. O requisito pede pelo menos cinco.`,
    },
    {
      id: 'btn-alvo', label: `Altura de ao menos ${TOUCH_TARGET_MIN} px para o toque`,
      passed: btnHeight >= TOUCH_TARGET_MIN,
      hint: 'Num celular o botão é tocado com o dedo. Abaixo de 44 px o alvo passa a errar.',
    },
    {
      id: 'btn-contraste', label: 'Contraste do rótulo de ao menos 4,5:1',
      passed: btnContrast >= 4.5,
      hint: `Agora está em ${btnContrast.toFixed(1)}:1.`,
    },
    {
      id: 'btn-websafe', label: 'Cores seguras da web nos botões',
      passed: isWebSafe(btnBg) && isWebSafe(btnFg),
      hint: 'Use os seis valores por canal (00, 33, 66, 99, CC, FF). O botão abaixo ajusta para a cor segura mais próxima.',
    },
    {
      id: 'btn-cantos', label: 'Cantos arredondados com transparência preservada',
      passed: buttonUrls.length > 0 && buttonUrls.every(b => b.alpha) && btnRadius > 0,
      hint: 'Arredonde os cantos. É esse recorte que só sobrevive em PNG.',
    },
    {
      id: 'btn-salvos', label: 'Os cinco botões foram salvos',
      passed: !!saved['botoes'],
      hint: 'Clique em "Baixar os cinco botões".',
    },
  ];

  /* ── 4. Header ──────────────────────────────────────────────────────────── */
  const [hdTitle, setHdTitle] = useState('Clube de Desbravadores');
  const [hdSubtitle, setHdSubtitle] = useState('Aventura, serviço e amizade');
  const [hdWidth, setHdWidth] = useState(1200);
  const [hdHeight, setHdHeight] = useState(300);
  const [hdFrom, setHdFrom] = useState('#003366');
  const [hdTo, setHdTo] = useState('#CC3300');
  const [hdFg, setHdFg] = useState('#FFFFFF');

  const headerCanvas = useMemo(
    () => drawHeader({ title: hdTitle, subtitle: hdSubtitle, width: hdWidth, height: hdHeight, from: hdFrom, to: hdTo, fg: hdFg }),
    [hdTitle, hdSubtitle, hdWidth, hdHeight, hdFrom, hdTo, hdFg],
  );
  const header = useExported(headerCanvas, 0.75);
  const hdContrastFrom = contrastRatio(hdFrom, hdFg);
  const hdContrastTo = contrastRatio(hdTo, hdFg);
  const hdRatio = hdHeight > 0 ? hdWidth / hdHeight : 0;

  const headerChecks: Check[] = [
    {
      id: 'hd-titulo', label: 'Título preenchido',
      passed: hdTitle.trim().length >= 3,
      hint: 'O header é a primeira coisa que a pessoa lê. Escreva o nome do clube.',
    },
    {
      id: 'hd-proporcao', label: 'Proporção de banner (largura de ao menos 3× a altura)',
      passed: hdRatio >= 3,
      hint: `Agora está em ${hdRatio.toFixed(1)}×. Um header alto demais empurra o conteúdo para fora da tela.`,
    },
    {
      id: 'hd-contraste', label: 'Texto legível nas duas pontas do degradê',
      passed: hdContrastFrom >= 4.5 && hdContrastTo >= 4.5,
      hint: `Início ${hdContrastFrom.toFixed(1)}:1, fim ${hdContrastTo.toFixed(1)}:1. O texto atravessa o degradê inteiro.`,
    },
    {
      id: 'hd-salvo', label: 'Header salvo no seu dispositivo',
      passed: !!saved['header'],
      hint: 'Clique em "Baixar header".',
    },
  ];

  const allChecks = [...photoChecks, ...logoChecks, ...buttonChecks, ...headerChecks];
  const passedCount = allChecks.filter(c => c.passed).length;
  const allPassed = passedCount === allChecks.length;

  const handleComplete = async () => {
    setSaving(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: passedCount, total_questions: allChecks.length,
      });
    }
    await logActivity(userId, 'image_lab_completed', {
      jpgBytes: photo?.jpegBytes, pngBytes: logo?.pngBytes, botoes: filledLabels,
    });
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
          Você entregou o que o requisito 5.2 pede: um JPG e um PNG abaixo de 15 KB e ainda
          legíveis, cinco botões de navegação em cores seguras e um header para o site.
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
          O requisito é literal: um JPG e um GIF/PNG <strong>ambos abaixo de 15 KB</strong> e
          ainda facilmente visíveis, mais <strong>cinco</strong> botões de navegação e um
          header. Quinze quilobytes é apertado de propósito — não se chega lá por acaso, só
          trocando largura por qualidade e olhando o número mexer.
        </p>
        <p className="text-sm mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-warning-a10)', color: 'var(--color-text-soft)' }}>
          <strong style={{ color: 'var(--color-warning)' }}>Comece consertando.</strong>{' '}
          As etapas já vêm com defeitos de propósito. Descubra qual é o de cada uma.
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
      <StageCard title="1. Fotografia em JPG, abaixo de 15 KB" icon={Camera} checks={photoChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Reduza primeiro a largura, depois a qualidade. Comprimir uma imagem grande demais
          é otimizar o desperdício.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
            <Upload className="w-4 h-4 mr-1" /> Escolher uma foto
          </button>
          <button onClick={useSamplePhoto} className="btn-secondary">
            <Wand2 className="w-4 h-4 mr-1" /> Usar imagem de exemplo
          </button>
          <input
            ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { void handleFile(e.target.files?.[0]); e.target.value = ''; }}
          />
        </div>
        {loadError && <p className="text-sm mb-3" style={{ color: 'var(--color-error)' }}>{loadError}</p>}

        {photo && sourceInfo && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <img src={photo.jpegUrl} alt="Prévia da fotografia otimizada" className="w-full rounded-lg"
                style={{ border: '1px solid var(--color-border)' }} />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>{sourceName}</p>
            </div>

            <div className="space-y-3">
              <Field label={`Largura final: ${photo.width} px`}>
                <input type="range" min={300} max={1600} step={20} value={maxWidth}
                  onChange={e => setMaxWidth(Number(e.target.value))} className="w-full" aria-label="Largura máxima" />
              </Field>
              <Field label={`Qualidade do JPG: ${Math.round(quality * 100)}%`}>
                <input type="range" min={20} max={95} step={5} value={Math.round(quality * 100)}
                  onChange={e => setQuality(Number(e.target.value) / 100)} className="w-full" aria-label="Qualidade do JPG" />
              </Field>

              <BudgetBar bytes={photo.jpegBytes} label="JPG gerado" />

              <dl className="text-sm space-y-1">
                <SizeRow label="Original" value={`${sourceInfo.w}×${sourceInfo.h} — ${formatBytes(sourceInfo.bytes)}`} />
                <SizeRow label="JPG" value={`${photo.width}×${photo.height} — ${formatBytes(photo.jpegBytes)}`}
                  tone={photo.jpegBytes <= BUDGET ? 'good' : 'bad'} />
                <SizeRow label="Mesma foto em PNG" value={formatBytes(photo.pngBytes)} tone="bad" />
              </dl>

              <button onClick={() => download(photo.jpegBlob, 'foto.jpg', 'foto')} className="btn-primary w-full">
                <Download className="w-4 h-4 mr-1" /> Baixar JPG
              </button>
            </div>
          </div>
        )}
      </StageCard>

      {/* ── Etapa 2 ── */}
      <StageCard title="2. Logo em PNG, abaixo de 15 KB" icon={Shapes} checks={logoChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Cor chapada comprime muito bem em PNG — mas pixel demais pesa mesmo assim. O
          controle de tamanho é o que fecha o orçamento aqui.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Field label="Sigla ou nome curto">
              <input type="text" value={logoText} maxLength={6}
                onChange={e => setLogoText(e.target.value)} className="input-field" aria-label="Texto do logo" />
            </Field>
            <Field label="Forma">
              <div className="flex gap-2">
                {(['escudo', 'circulo', 'hexagono'] as LogoShape[]).map(s => (
                  <button key={s} onClick={() => setLogoShape(s)}
                    className={logoShape === s ? 'btn-primary flex-1 text-xs' : 'btn-secondary flex-1 text-xs'}>
                    {s === 'escudo' ? 'Escudo' : s === 'circulo' ? 'Círculo' : 'Hexágono'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={`Tamanho: ${logoSize}×${logoSize} px`}>
              <input type="range" min={128} max={768} step={32} value={logoSize}
                onChange={e => setLogoSize(Number(e.target.value))} className="w-full" aria-label="Tamanho do logo" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Cor da forma" value={logoFill} onChange={setLogoFill} />
              <ColorField label="Cor do texto" value={logoFg} onChange={setLogoFg} />
            </div>
            <ContrastReadout ratio={logoContrast} />
            {logo && <BudgetBar bytes={logo.pngBytes} label="PNG gerado" />}
            {logo && (
              <button onClick={() => download(logo.pngBlob, 'logo.png', 'logo')} className="btn-primary w-full">
                <Download className="w-4 h-4 mr-1" /> Baixar PNG ({formatBytes(logo.pngBytes)})
              </button>
            )}
          </div>

          {logo && (
            <div className="grid grid-cols-2 gap-3">
              <Comparison title="PNG" caption={`${formatBytes(logo.pngBytes)} — fundo transparente`} tone="good" src={logo.pngUrl} />
              <Comparison title="JPEG" caption={`${formatBytes(logo.jpegBytes)} — a transparência virou fundo sólido`} tone="bad" src={logo.jpegUrl} />
            </div>
          )}
        </div>
      </StageCard>

      {/* ── Etapa 3 ── */}
      <StageCard title="3. Cinco botões de navegação" icon={MousePointerClick} checks={buttonChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Um conjunto de botões precisa parecer um conjunto: mesma altura, mesmo
          arredondamento, mesmas cores. Aqui você define o estilo uma vez e ele vale para
          os cinco.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {navLabels.map((label, i) => (
              <Field key={i} label={`Botão ${i + 1}`}>
                <input
                  type="text" value={label} maxLength={16}
                  onChange={e => setNavLabels(prev => prev.map((l, j) => j === i ? e.target.value : l))}
                  className="input-field text-sm" aria-label={`Rótulo do botão ${i + 1}`}
                />
              </Field>
            ))}
          </div>

          <div className="space-y-3">
            <Field label={`Altura: ${btnHeight} px`}>
              <input type="range" min={28} max={72} step={2} value={btnHeight}
                onChange={e => setBtnHeight(Number(e.target.value))} className="w-full" aria-label="Altura dos botões" />
            </Field>
            <Field label={`Arredondamento: ${btnRadius} px`}>
              <input type="range" min={0} max={Math.round(btnHeight / 2)} step={1}
                value={Math.min(btnRadius, Math.round(btnHeight / 2))}
                onChange={e => setBtnRadius(Number(e.target.value))} className="w-full" aria-label="Raio dos cantos" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Cor de fundo" value={btnBg} onChange={setBtnBg} />
              <ColorField label="Cor do texto" value={btnFg} onChange={setBtnFg} />
            </div>
            <ContrastReadout ratio={btnContrast} />

            <div
              className="text-xs p-2 rounded-lg flex items-start gap-2"
              style={{
                backgroundColor: isWebSafe(btnBg) && isWebSafe(btnFg) ? 'var(--color-success-a10)' : 'var(--color-bg-input)',
                color: isWebSafe(btnBg) && isWebSafe(btnFg) ? 'var(--color-success)' : 'var(--color-text-dim)',
              }}
            >
              <Palette className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
              <div>
                {isWebSafe(btnBg) && isWebSafe(btnFg)
                  ? 'As duas cores são seguras da web.'
                  : 'Alguma cor está fora da paleta segura.'}
                {!(isWebSafe(btnBg) && isWebSafe(btnFg)) && (
                  <button
                    onClick={() => { setBtnBg(nearestWebSafe(btnBg)); setBtnFg(nearestWebSafe(btnFg)); }}
                    className="btn-secondary text-xs mt-2"
                  >
                    Ajustar para as mais próximas
                  </button>
                )}
              </div>
            </div>

            {buttonUrls.length > 0 && (
              <>
                <div className="rounded-lg p-4 flex flex-wrap gap-2 items-center justify-center"
                  style={{ background: CHECKER, border: '1px solid var(--color-border)' }}>
                  {buttonUrls.map((b, i) => (
                    <img key={i} src={b.url} alt={`Botão ${navLabels[i]}`} style={{ maxWidth: '100%' }} />
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                  Maior arquivo do conjunto: {formatBytes(heaviestButton)}.
                </p>
                <button
                  onClick={() => {
                    buttonUrls.forEach((b, i) => downloadBlob(b.blob,
                      `botao-${(navLabels[i] || `${i + 1}`).toLowerCase().replace(/\s+/g, '-')}.png`));
                    markSaved('botoes');
                  }}
                  className="btn-primary w-full"
                >
                  <Download className="w-4 h-4 mr-1" /> Baixar os cinco botões
                </button>
              </>
            )}
          </div>
        </div>
      </StageCard>

      {/* ── Etapa 4 ── */}
      <StageCard title="4. Header do site" icon={PanelTop} checks={headerChecks}>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          O header atravessa um degradê inteiro, então o texto precisa continuar legível do
          começo ao fim — não basta funcionar de um lado.
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
              <input type="range" min={800} max={1600} step={50} value={hdWidth}
                onChange={e => setHdWidth(Number(e.target.value))} className="w-full" aria-label="Largura do header" />
            </Field>
            <Field label={`Altura: ${hdHeight} px — proporção ${hdRatio.toFixed(1)}×`}>
              <input type="range" min={120} max={600} step={20} value={hdHeight}
                onChange={e => setHdHeight(Number(e.target.value))} className="w-full" aria-label="Altura do header" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <ColorField label="Degradê: início" value={hdFrom} onChange={setHdFrom} />
            <ColorField label="Degradê: fim" value={hdTo} onChange={setHdTo} />
            <ColorField label="Cor do texto" value={hdFg} onChange={setHdFg} />
          </div>

          <div className="grid sm:grid-cols-2 gap-2">
            <ContrastReadout ratio={hdContrastFrom} label="Contraste no início" />
            <ContrastReadout ratio={hdContrastTo} label="Contraste no fim" />
          </div>

          {header && (
            <>
              <img src={header.jpegUrl} alt="Prévia do header" className="w-full rounded-lg"
                style={{ border: '1px solid var(--color-border)' }} />
              <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                JPG {formatBytes(header.jpegBytes)} · PNG {formatBytes(header.pngBytes)}
              </p>
              <button onClick={() => download(header.jpegBlob, 'header.jpg', 'header')} className="btn-primary w-full">
                <Download className="w-4 h-4 mr-1" /> Baixar header
              </button>
            </>
          )}
        </div>
      </StageCard>
    </div>
  );
}

/* ── Peças de interface ───────────────────────────────────────────────────── */

/** Shows the 15 KB budget as a bar, because a number alone does not feel like a limit. */
function BudgetBar({ bytes, label }: { bytes: number; label: string }) {
  const ratio = Math.min(1.4, bytes / BUDGET);
  const over = bytes > BUDGET;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
        <span style={{ color: over ? 'var(--color-error)' : 'var(--color-success)' }}>
          {formatBytes(bytes)} de {formatBytes(BUDGET)}
        </span>
      </div>
      <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
        <div className="h-2 rounded-full transition-all"
          style={{ width: `${Math.min(100, ratio * 100 / 1.4)}%`, backgroundColor: over ? 'var(--color-error)' : 'var(--color-success)' }} />
      </div>
    </div>
  );
}

function StageCard({ title, icon: Icon, checks, children }: {
  title: string; icon: typeof ImageIcon; checks: Check[]; children: ReactNode;
}) {
  const done = checks.filter(c => c.passed).length;
  const complete = done === checks.length;
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <h2 className="font-bold flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: complete ? 'var(--color-success-a10)' : 'var(--color-primary-a10)' }}>
            <Icon className="w-5 h-5" style={{ color: complete ? 'var(--color-success)' : 'var(--color-primary)' }} />
          </span>
          {title}
        </h2>
        <span className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: complete ? 'var(--color-success-a10)' : 'var(--color-bg-hover)',
            color: complete ? 'var(--color-success)' : 'var(--color-text-muted)',
          }}>
          {done}/{checks.length}
        </span>
      </div>

      {children}

      <ul className="mt-4 space-y-2">
        {checks.map(c => (
          <li key={c.id} className="flex items-start gap-2 text-sm p-2 rounded-lg"
            style={{ backgroundColor: c.passed ? 'var(--color-success-a10)' : 'var(--color-bg-input)' }}>
            {c.passed
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
              : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-faint)' }} />}
            <div className="min-w-0">
              <span className="font-medium" style={{ color: c.passed ? 'var(--color-success)' : 'var(--color-text-soft)' }}>
                {c.label}
              </span>
              {!c.passed && <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{c.hint}</p>}
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
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-10 h-9 rounded cursor-pointer flex-shrink-0"
          style={{ background: 'transparent', border: '1px solid var(--color-border)' }} aria-label={label} />
        <span className="text-xs font-mono" style={{ color: isWebSafe(value) ? 'var(--color-success)' : 'var(--color-text-dim)' }}>
          {value.toUpperCase()}
        </span>
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
      <span style={{ color: 'var(--color-text-dim)' }}>{ok ? '(passa)' : '(mínimo 4,5:1)'}</span>
    </p>
  );
}

function SizeRow({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div className="flex justify-between gap-2">
      <dt style={{ color: 'var(--color-text-muted)' }}>{label}</dt>
      <dd className="font-mono"
        style={{ color: tone === 'good' ? 'var(--color-success)' : tone === 'bad' ? 'var(--color-text-soft)' : 'var(--color-text)' }}>
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
      <div className="rounded-lg p-3 flex items-center justify-center"
        style={{ background: CHECKER, border: `1px solid ${colour}` }}>
        <img src={src} alt={`Logo exportado como ${title}`} style={{ maxWidth: '100%' }} />
      </div>
      <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>{caption}</p>
    </div>
  );
}
