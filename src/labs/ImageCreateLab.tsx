import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shapes, MousePointerClick, PanelTop, Download, CheckCircle2, Palette, Type,
  Ruler, Contrast, AlertTriangle,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  formatBytes, contrastRatio, drawLogo, drawButton, drawHeader,
  canvasToBlob, hasTransparency, downloadBlob, isWebSafe, nearestWebSafe,
  type LogoShape,
} from '../lib/imageTools';
import {
  logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity,
  getSpecialtyId, getRequirementId, registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP035 requisito 5.2, segunda metade: um PNG abaixo de 15 KB com fundo
 * transparente, cinco botões de navegação e um header para o site.
 *
 * ── Por que separado de comprimir ────────────────────────────────────────
 * Comprimir é escolher o que jogar fora; desenhar é escolher o que pôr. São
 * dois assuntos, e na vida são dois programas — ninguém faz banner no mesmo
 * lugar em que espreme foto.
 *
 * ── A forma: um editor de design ─────────────────────────────────────────
 * Três peças na lateral, a prancheta no meio e as propriedades à direita. É o
 * arranjo do Canva, do Figma e de qualquer editor do gênero, e é o que o
 * desbravador vai encontrar quando for fazer o cartaz do clube.
 *
 * ── O que é medido, e não perguntado ─────────────────────────────────────
 * Contraste, transparência, cor segura da web e bytes saem do arquivo que a
 * pessoa gerou — não de uma resposta que ela escolheu. Um logo com texto
 * ilegível passa por qualquer questionário e não passa aqui.
 */

const ORCAMENTO = 15 * 1024;
const ALVO_DE_TOQUE = 44;
/** "pelo menos, cinco botões de navegação gráfica" */
const ROTULOS_PADRAO = ['Início', 'Sobre', 'Galeria', 'Contato', 'Eventos'];

type Peca = 'logo' | 'botoes' | 'header';

const CSS_ESTUDIO = `
  .es {
    flex: 1; min-height: 0; display: flex; flex-direction: column;
    background: #1A1A1F; color: #E9E9ED;
    font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  }
  .es-topo {
    flex: none; display: flex; align-items: center; gap: 12px; padding: 10px 16px;
    background: #23232A; border-bottom: 1px solid #31313A;
  }
  .es-marca { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }
  .es-projeto { font-size: 12.5px; color: #9C9CA8; }
  .es-bt {
    display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 14px;
    border-radius: 6px; font-size: 13px; cursor: pointer;
    background: #2E2E38; border: 1px solid #3E3E4A; color: #E9E9ED;
  }
  .es-bt:hover { background: #383843; }
  .es-bt.forte { background: #8B5CF6; border-color: #8B5CF6; color: #FFFFFF; font-weight: 600; }
  .es-bt.forte:hover { background: #9E75F8; }
  .es-bt:disabled { background: #26262E; border-color: #31313A; color: #66666F; cursor: default; }

  .es-corpo { flex: 1; min-height: 0; display: flex; }

  /* ── A lateral: as três peças do projeto ── */
  .es-pecas { width: 176px; flex: none; padding: 12px 10px; background: #23232A; border-right: 1px solid #31313A; overflow-y: auto; }
  .es-secao { font-size: 10.5px; letter-spacing: .12em; text-transform: uppercase; color: #8A8A96; margin: 0 0 10px 4px; }
  .es-peca {
    display: block; width: 100%; text-align: left; padding: 9px 10px; margin-bottom: 6px;
    border-radius: 8px; background: #2A2A33; border: 1px solid transparent;
    color: #C9C9D3; font-size: 13px; cursor: pointer;
  }
  .es-peca:hover { background: #33333E; }
  .es-peca[aria-current="true"] { border-color: #8B5CF6; background: #2E2740; color: #FFFFFF; }
  .es-peca-topo { display: flex; align-items: center; gap: 8px; }
  .es-peca-estado { font-size: 11px; color: #8A8A96; margin-top: 4px; display: block; }
  .es-peca-estado.ok { color: #4ADE80; }

  /* ── A prancheta ── */
  .es-prancheta {
    flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 14px; padding: 24px; overflow: auto;
    background: repeating-conic-gradient(#1E1E24 0% 25%, #22222A 0% 50%) 50% / 20px 20px;
  }
  .es-papel {
    background: #FFFFFF; border-radius: 4px; padding: 20px; max-width: 100%;
    box-shadow: 0 12px 40px rgba(0,0,0,.45); line-height: 0;
    /* Xadrez atrás do que é transparente: sem ele, fundo transparente e fundo
       branco ficam idênticos, e a lição da transparência some. */
    background-image: repeating-conic-gradient(#EDEDED 0% 25%, #FFFFFF 0% 50%);
    background-size: 16px 16px;
  }
  .es-papel img { display: block; max-width: 100%; height: auto; }
  .es-fila { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
  .es-medida { font-size: 11.5px; color: #9C9CA8; font-variant-numeric: tabular-nums; }

  /* ── As propriedades ── */
  .es-props { width: 274px; flex: none; overflow-y: auto; padding: 16px; background: #23232A; border-left: 1px solid #31313A; }
  .es-campo { margin-bottom: 14px; }
  .es-rotulo { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #9C9CA8; margin-bottom: 5px; }
  .es-entrada {
    width: 100%; height: 32px; padding: 0 9px; border-radius: 6px; font-size: 13px;
    background: #1A1A1F; border: 1px solid #3E3E4A; color: #E9E9ED;
  }
  .es-entrada:focus { outline: 2px solid #8B5CF6; outline-offset: -1px; }
  .es-faixa { width: 100%; accent-color: #8B5CF6; }
  .es-cores { display: flex; gap: 8px; align-items: center; }
  .es-cor { width: 34px; height: 32px; padding: 0; border: 1px solid #3E3E4A; border-radius: 6px; background: none; cursor: pointer; }
  .es-opcoes { display: flex; gap: 6px; }
  .es-opcoes button {
    flex: 1; height: 30px; border-radius: 6px; font-size: 12px; cursor: pointer;
    background: #2E2E38; border: 1px solid #3E3E4A; color: #C9C9D3;
  }
  .es-opcoes button[aria-pressed="true"] { background: #8B5CF6; border-color: #8B5CF6; color: #FFFFFF; }

  /* A leitura de contraste e de peso: medida, e não opinião. */
  .es-leitura {
    display: flex; align-items: center; gap: 8px; padding: 9px 11px; border-radius: 7px;
    background: #1A1A1F; border: 1px solid #31313A; font-size: 12px; margin-bottom: 9px;
  }
  .es-leitura b { margin-left: auto; font-variant-numeric: tabular-nums; }
  .es-leitura.bom { border-color: #2C5C3E; color: #86EFAC; }
  .es-leitura.ruim { border-color: #6B3030; color: #FCA5A5; }

  @media (max-width: 1023px) { .es-pecas { width: 138px; } .es-props { width: 232px; } }
  @media (max-width: 767px) {
    .es-corpo { flex-direction: column; }
    .es-pecas { width: 100%; border-right: none; border-bottom: 1px solid #31313A; display: flex; gap: 6px; overflow-x: auto; }
    .es-pecas .es-secao { display: none; }
    .es-peca { width: auto; flex: none; margin: 0; white-space: nowrap; }
    .es-props { width: 100%; border-left: none; border-top: 1px solid #31313A; }
  }
`;

/** Uma leitura medida do arquivo, com o veredicto na cor. */
function Leitura({ Ico, texto, valor, bom }: {
  Ico: typeof Contrast; texto: string; valor: string; bom: boolean;
}) {
  return (
    <div className={`es-leitura ${bom ? 'bom' : 'ruim'}`}>
      <Ico className="w-3.5 h-3.5 flex-none" />
      {texto} <b>{valor}</b>
    </div>
  );
}

export default function ImageCreateLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [peca, setPeca] = useState<Peca>('logo');
  const [salvo, setSalvo] = useState<Record<Peca, boolean>>({ logo: false, botoes: false, header: false });
  const [concluido, setConcluido] = useState(false);
  const [gravando, setGravando] = useState(false);
  const [aviso] = useState('');

  /* ── 1. O logo ─────────────────────────────────────────────────────────── */
  const [logoTexto, setLogoTexto] = useState('DBV');
  const [logoForma, setLogoForma] = useState<LogoShape>('escudo');
  const [logoTamanho, setLogoTamanho] = useState(512);
  const [logoFundo, setLogoFundo] = useState('#F5A623');
  const [logoFrente, setLogoFrente] = useState('#FFFFFF');

  const telaDoLogo = useMemo(
    () => drawLogo({ text: logoTexto, shape: logoForma, fill: logoFundo, fg: logoFrente, size: logoTamanho }),
    [logoTexto, logoForma, logoFundo, logoFrente, logoTamanho],
  );
  const contrasteDoLogo = contrastRatio(logoFundo, logoFrente);

  /* ── 2. Os cinco botões ────────────────────────────────────────────────── */
  const [rotulos, setRotulos] = useState(ROTULOS_PADRAO);
  const [botaoAltura, setBotaoAltura] = useState(48);
  const [botaoRaio, setBotaoRaio] = useState(10);
  const [botaoFundo, setBotaoFundo] = useState('#CC3300');
  const [botaoFrente, setBotaoFrente] = useState('#FFFFFF');

  const telasDosBotoes = useMemo(
    () => rotulos.map(r => drawButton({
      label: r || ' ', width: Math.max(140, r.length * 16 + 60),
      height: botaoAltura, bg: botaoFundo, fg: botaoFrente, radius: botaoRaio,
    })),
    [rotulos, botaoAltura, botaoFundo, botaoFrente, botaoRaio],
  );
  const contrasteDoBotao = contrastRatio(botaoFundo, botaoFrente);
  const rotulosPreenchidos = rotulos.filter(r => r.trim().length >= 2).length;
  const coresSeguras = isWebSafe(botaoFundo) && isWebSafe(botaoFrente);

  /* ── 3. O header ───────────────────────────────────────────────────────── */
  const [tituloHeader, setTituloHeader] = useState('Clube de Desbravadores');
  const [subtituloHeader, setSubtituloHeader] = useState('Aventura, serviço e amizade');
  const [headerLargura, setHeaderLargura] = useState(1200);
  const [headerAltura, setHeaderAltura] = useState(300);
  const [headerDe, setHeaderDe] = useState('#003366');
  const [headerAte, setHeaderAte] = useState('#CC3300');
  const [headerFrente, setHeaderFrente] = useState('#FFFFFF');

  const telaDoHeader = useMemo(
    () => drawHeader({
      title: tituloHeader, subtitle: subtituloHeader, width: headerLargura,
      height: headerAltura, from: headerDe, to: headerAte, fg: headerFrente,
    }),
    [tituloHeader, subtituloHeader, headerLargura, headerAltura, headerDe, headerAte, headerFrente],
  );
  const contrasteInicio = contrastRatio(headerDe, headerFrente);
  const contrasteFim = contrastRatio(headerAte, headerFrente);
  const proporcaoDoHeader = headerAltura > 0 ? headerLargura / headerAltura : 0;

  /* ── Codificar tudo, para medir bytes e transparência ──────────────────── */
  const [png, setPng] = useState<Record<Peca, { url: string; blob: Blob; bytes: number; alfa: boolean }[] | null>>({
    logo: null, botoes: null, header: null,
  });

  useEffect(() => {
    let cancelado = false;
    const urls: string[] = [];
    (async () => {
      const codificar = async (telas: HTMLCanvasElement[]) => Promise.all(telas.map(async tela => {
        const blob = await canvasToBlob(tela, 'png');
        const url = URL.createObjectURL(blob);
        urls.push(url);
        return { url, blob, bytes: blob.size, alfa: hasTransparency(tela) };
      }));
      const [l, b, h] = await Promise.all([
        codificar([telaDoLogo]), codificar(telasDosBotoes), codificar([telaDoHeader]),
      ]);
      if (cancelado) return;
      setPng({ logo: l, botoes: b, header: h });
    })();
    return () => { cancelado = true; urls.forEach(URL.revokeObjectURL); };
  }, [telaDoLogo, telasDosBotoes, telaDoHeader]);

  const bytesDoLogo = png.logo?.[0]?.bytes ?? 0;
  const logoTemAlfa = png.logo?.[0]?.alfa ?? false;
  const botoesComAlfa = !!png.botoes?.length && png.botoes.every(b => b.alfa);
  const bytesDoHeader = png.header?.[0]?.bytes ?? 0;

  /* ── O que o requisito cobra ───────────────────────────────────────────── */
  const logoPronto = logoTexto.trim().length > 0 && logoTexto.trim().length <= 6
    && logoTemAlfa && contrasteDoLogo >= 4.5 && bytesDoLogo <= ORCAMENTO;
  const botoesProntos = rotulosPreenchidos >= 5 && botaoAltura >= ALVO_DE_TOQUE
    && contrasteDoBotao >= 4.5 && coresSeguras && botoesComAlfa && botaoRaio > 0;
  const headerPronto = tituloHeader.trim().length >= 3 && proporcaoDoHeader >= 3
    && contrasteInicio >= 4.5 && contrasteFim >= 4.5;

  const tarefas = [
    {
      id: 't1', titulo: 'Um logo em PNG, com fundo transparente e abaixo de 15 KB', feita: logoPronto && salvo.logo,
      onde: 'Peça Logo, na lateral',
      detalhe: !logoPronto
        ? (contrasteDoLogo < 4.5 ? `O contraste do texto está em ${contrasteDoLogo.toFixed(1)}:1.`
          : bytesDoLogo > ORCAMENTO ? `O arquivo está em ${formatBytes(bytesDoLogo)}.`
            : logoTexto.trim().length > 6 ? 'A sigla passou de seis letras.' : undefined)
        : (!salvo.logo ? 'Falta baixar o arquivo.' : undefined),
      passos: [
        'Escreva de uma a seis letras — um logo com frase inteira some quando fica pequeno.',
        'Escureça a forma ou clareie o texto até o contraste passar de 4,5:1.',
        'Se o arquivo passar de 15 KB, reduza o tamanho: cor chapada comprime bem, mas pixel demais pesa.',
        'Repare no xadrez atrás do logo: é ele que mostra que o fundo é transparente de verdade.',
        'Clique em Baixar.',
      ],
    },
    {
      id: 't2', titulo: 'Cinco botões de navegação, em cores seguras da web', feita: botoesProntos && salvo.botoes,
      onde: 'Peça Botões, na lateral',
      detalhe: !botoesProntos
        ? (rotulosPreenchidos < 5 ? `${rotulosPreenchidos} de 5 preenchidos.`
          : !coresSeguras ? 'As cores não são seguras da web.'
            : botaoAltura < ALVO_DE_TOQUE ? `A altura está em ${botaoAltura} px.` : undefined)
        : (!salvo.botoes ? 'Falta baixar os cinco.' : undefined),
      passos: [
        'Preencha os cinco rótulos — o requisito pede pelo menos cinco botões.',
        `Deixe a altura em ${ALVO_DE_TOQUE} px ou mais: abaixo disso o dedo erra o alvo no celular.`,
        'Use cores seguras da web: só os valores 00, 33, 66, 99, CC e FF em cada canal. O botão "Ajustar" arruma.',
        'Arredonde os cantos — é esse recorte que só sobrevive em PNG.',
        'Clique em Baixar os cinco.',
      ],
    },
    {
      id: 't3', titulo: 'Um header para o topo do site', feita: headerPronto && salvo.header,
      onde: 'Peça Header, na lateral',
      detalhe: !headerPronto
        ? (proporcaoDoHeader < 3 ? `A proporção está em ${proporcaoDoHeader.toFixed(1)}×.`
          : 'O texto precisa ser legível nas duas pontas do degradê.')
        : (!salvo.header ? 'Falta baixar o arquivo.' : undefined),
      passos: [
        'Escreva o nome do clube: o header é a primeira coisa que a pessoa lê.',
        'Deixe a largura em pelo menos três vezes a altura — header alto empurra o conteúdo para fora da tela.',
        'O texto atravessa o degradê inteiro: confira o contraste nas duas pontas, não só numa.',
        'Clique em Baixar.',
      ],
    },
  ];

  const tudoFeito = tarefas.every(t => t.feita);

  const baixar = (quais: { blob: Blob }[], nomes: string[], qual: Peca) => {
    quais.forEach((p, i) => downloadBlob(p.blob, nomes[i]));
    setSalvo(s => ({ ...s, [qual]: true }));
  };

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
    await logActivity(userId, 'image_create_completed', {
      specialtyCode, lessonCode, logoBytes: bytesDoLogo, botoes: rotulosPreenchidos,
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
          Um logo com fundo transparente, cinco botões em cores seguras e um header —
          todos legíveis, todos leves, todos salvos no seu aparelho.
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

  const PECAS: [Peca, string, typeof Shapes, boolean][] = [
    ['logo', 'Logo', Shapes, logoPronto],
    ['botoes', 'Botões', MousePointerClick, botoesProntos],
    ['header', 'Header', PanelTop, headerPronto],
  ];

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      titulo={lessonTitle}
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
    >
      <style>{CSS_ESTUDIO}</style>

      <div className="es">
        <div className="es-topo">
          <span className="es-marca">
            <Palette className="w-4 h-4" style={{ color: '#8B5CF6' }} /> Estúdio
          </span>
          <span className="es-projeto">Imagens do site do clube</span>
        </div>

        <div className="es-corpo">
          <div className="es-pecas">
            <p className="es-secao">Peças do projeto</p>
            {PECAS.map(([id, nome, Ico, pronta]) => (
              <button key={id} className="es-peca" aria-current={peca === id} onClick={() => setPeca(id)}>
                <span className="es-peca-topo"><Ico className="w-4 h-4 flex-none" /> {nome}</span>
                <span className={`es-peca-estado${pronta && salvo[id] ? ' ok' : ''}`}>
                  {pronta && salvo[id] ? 'pronta' : pronta ? 'falta baixar' : 'em edição'}
                </span>
              </button>
            ))}
          </div>

          <div className="es-prancheta">
            {peca === 'logo' && png.logo && (
              <>
                <div className="es-papel"><img src={png.logo[0].url} alt="O logo em construção"
                  style={{ width: Math.min(240, logoTamanho / 2) }} /></div>
                <p className="es-medida">{logoTamanho} × {logoTamanho} px · PNG · {formatBytes(bytesDoLogo)}</p>
              </>
            )}

            {peca === 'botoes' && png.botoes && (
              <>
                <div className="es-papel"><div className="es-fila">
                  {png.botoes.map((b, i) => <img key={i} src={b.url} alt={`Botão ${rotulos[i]}`} />)}
                </div></div>
                <p className="es-medida">
                  {png.botoes.length} botões · o mais pesado tem {formatBytes(Math.max(...png.botoes.map(b => b.bytes)))}
                </p>
              </>
            )}

            {peca === 'header' && png.header && (
              <>
                <div className="es-papel" style={{ padding: 12, maxWidth: 620 }}>
                  <img src={png.header[0].url} alt="O header em construção" />
                </div>
                <p className="es-medida">
                  {headerLargura} × {headerAltura} px · {proporcaoDoHeader.toFixed(1)}× · {formatBytes(bytesDoHeader)}
                </p>
              </>
            )}
          </div>

          <div className="es-props">
            {peca === 'logo' && (
              <>
                <div className="es-campo">
                  <span className="es-rotulo"><Type className="w-3.5 h-3.5" /> Sigla (até 6 letras)</span>
                  <input className="es-entrada" value={logoTexto} maxLength={6}
                    aria-label="Sigla do logo" onChange={e => setLogoTexto(e.target.value)} />
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Shapes className="w-3.5 h-3.5" /> Forma</span>
                  <div className="es-opcoes">
                    {(['escudo', 'circulo', 'hexagono'] as LogoShape[]).map(f => (
                      <button key={f} aria-pressed={logoForma === f} onClick={() => setLogoForma(f)}>{f}</button>
                    ))}
                  </div>
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Palette className="w-3.5 h-3.5" /> Cores</span>
                  <div className="es-cores">
                    <input className="es-cor" type="color" value={logoFundo} aria-label="Cor da forma"
                      onChange={e => setLogoFundo(e.target.value)} />
                    <input className="es-cor" type="color" value={logoFrente} aria-label="Cor do texto"
                      onChange={e => setLogoFrente(e.target.value)} />
                    <span style={{ fontSize: 12, color: '#9C9CA8' }}>forma · texto</span>
                  </div>
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Ruler className="w-3.5 h-3.5" /> Tamanho · {logoTamanho} px</span>
                  <input className="es-faixa" type="range" min={128} max={1024} step={32}
                    value={logoTamanho} aria-label="Tamanho do logo"
                    onChange={e => setLogoTamanho(Number(e.target.value))} />
                </div>

                <Leitura Ico={Contrast} texto="Contraste do texto"
                  valor={`${contrasteDoLogo.toFixed(1)}:1`} bom={contrasteDoLogo >= 4.5} />
                <Leitura Ico={AlertTriangle} texto="Fundo transparente"
                  valor={logoTemAlfa ? 'sim' : 'não'} bom={logoTemAlfa} />
                <Leitura Ico={Download} texto="Tamanho do arquivo"
                  valor={formatBytes(bytesDoLogo)} bom={bytesDoLogo <= ORCAMENTO} />

                <button className="es-bt forte" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
                  onClick={() => png.logo && baixar(png.logo, ['logo-do-clube.png'], 'logo')}>
                  <Download className="w-4 h-4" /> Baixar PNG
                </button>
              </>
            )}

            {peca === 'botoes' && (
              <>
                <div className="es-campo">
                  <span className="es-rotulo"><Type className="w-3.5 h-3.5" /> Os cinco rótulos</span>
                  {rotulos.map((r, i) => (
                    <input key={i} className="es-entrada" value={r} maxLength={14}
                      style={{ marginBottom: 5 }} aria-label={`Rótulo do botão ${i + 1}`}
                      onChange={e => setRotulos(rotulos.map((v, j) => (j === i ? e.target.value : v)))} />
                  ))}
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Ruler className="w-3.5 h-3.5" /> Altura · {botaoAltura} px</span>
                  <input className="es-faixa" type="range" min={28} max={72} step={2}
                    value={botaoAltura} aria-label="Altura dos botões"
                    onChange={e => setBotaoAltura(Number(e.target.value))} />
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Shapes className="w-3.5 h-3.5" /> Cantos · {botaoRaio} px</span>
                  <input className="es-faixa" type="range" min={0} max={24} step={2}
                    value={botaoRaio} aria-label="Arredondamento dos cantos"
                    onChange={e => setBotaoRaio(Number(e.target.value))} />
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Palette className="w-3.5 h-3.5" /> Cores</span>
                  <div className="es-cores">
                    <input className="es-cor" type="color" value={botaoFundo} aria-label="Cor do fundo do botão"
                      onChange={e => setBotaoFundo(e.target.value)} />
                    <input className="es-cor" type="color" value={botaoFrente} aria-label="Cor do rótulo"
                      onChange={e => setBotaoFrente(e.target.value)} />
                    <button className="es-bt" style={{ height: 32, flex: 1 }}
                      onClick={() => { setBotaoFundo(nearestWebSafe(botaoFundo)); setBotaoFrente(nearestWebSafe(botaoFrente)); }}>
                      Ajustar
                    </button>
                  </div>
                </div>

                <Leitura Ico={MousePointerClick} texto="Rótulos preenchidos"
                  valor={`${rotulosPreenchidos} de 5`} bom={rotulosPreenchidos >= 5} />
                <Leitura Ico={Contrast} texto="Contraste do rótulo"
                  valor={`${contrasteDoBotao.toFixed(1)}:1`} bom={contrasteDoBotao >= 4.5} />
                <Leitura Ico={Palette} texto="Cores seguras da web"
                  valor={coresSeguras ? 'sim' : 'não'} bom={coresSeguras} />
                <Leitura Ico={Ruler} texto="Alvo de toque"
                  valor={`${botaoAltura} px`} bom={botaoAltura >= ALVO_DE_TOQUE} />

                <button className="es-bt forte" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
                  onClick={() => png.botoes && baixar(png.botoes, rotulos.map((r, i) => `botao-${i + 1}-${r.toLowerCase().replace(/\s+/g, '-') || 'sem-nome'}.png`), 'botoes')}>
                  <Download className="w-4 h-4" /> Baixar os cinco
                </button>
              </>
            )}

            {peca === 'header' && (
              <>
                <div className="es-campo">
                  <span className="es-rotulo"><Type className="w-3.5 h-3.5" /> Título</span>
                  <input className="es-entrada" value={tituloHeader} maxLength={40}
                    aria-label="Título do header" onChange={e => setTituloHeader(e.target.value)} />
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Type className="w-3.5 h-3.5" /> Subtítulo</span>
                  <input className="es-entrada" value={subtituloHeader} maxLength={50}
                    aria-label="Subtítulo do header" onChange={e => setSubtituloHeader(e.target.value)} />
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Ruler className="w-3.5 h-3.5" /> Largura · {headerLargura} px</span>
                  <input className="es-faixa" type="range" min={600} max={1600} step={50}
                    value={headerLargura} aria-label="Largura do header"
                    onChange={e => setHeaderLargura(Number(e.target.value))} />
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Ruler className="w-3.5 h-3.5" /> Altura · {headerAltura} px</span>
                  <input className="es-faixa" type="range" min={120} max={600} step={20}
                    value={headerAltura} aria-label="Altura do header"
                    onChange={e => setHeaderAltura(Number(e.target.value))} />
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Palette className="w-3.5 h-3.5" /> Degradê e texto</span>
                  <div className="es-cores">
                    <input className="es-cor" type="color" value={headerDe} aria-label="Cor do início do degradê"
                      onChange={e => setHeaderDe(e.target.value)} />
                    <input className="es-cor" type="color" value={headerAte} aria-label="Cor do fim do degradê"
                      onChange={e => setHeaderAte(e.target.value)} />
                    <input className="es-cor" type="color" value={headerFrente} aria-label="Cor do texto do header"
                      onChange={e => setHeaderFrente(e.target.value)} />
                  </div>
                </div>

                <Leitura Ico={Ruler} texto="Proporção de banner"
                  valor={`${proporcaoDoHeader.toFixed(1)}×`} bom={proporcaoDoHeader >= 3} />
                <Leitura Ico={Contrast} texto="Contraste no início"
                  valor={`${contrasteInicio.toFixed(1)}:1`} bom={contrasteInicio >= 4.5} />
                <Leitura Ico={Contrast} texto="Contraste no fim"
                  valor={`${contrasteFim.toFixed(1)}:1`} bom={contrasteFim >= 4.5} />

                <button className="es-bt forte" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
                  onClick={() => png.header && baixar(png.header, ['header-do-clube.png'], 'header')}>
                  <Download className="w-4 h-4" /> Baixar PNG
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
