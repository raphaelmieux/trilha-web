import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shapes, MousePointerClick, PanelTop, Download, CheckCircle2, Palette, Type,
  Ruler, Contrast, AlertTriangle, Plus, X, Ban, Sparkles,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  formatBytes, contrastRatio, drawLogo, drawButton, drawHeader, desenharSimbolo,
  canvasToBlob, hasTransparency, downloadBlob, isWebSafe, nearestWebSafe,
  NOME_DA_FORMA, NOME_DO_SIMBOLO, NOME_DA_FONTE,
  type LogoShape, type Simbolo, type FonteDeDesenho,
} from '../lib/imageTools';
import {
  logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity,
  getSpecialtyId, getRequirementId, registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';
import {
  LOGO_INICIAL, BOTOES_INICIAIS, HEADER_INICIAL,
  ORCAMENTO, ALVO_DE_TOQUE, MINIMO_DE_BOTOES, MAXIMO_DE_BOTOES,
  CONTRASTE_MINIMO, PROPORCAO_MINIMA, MAXIMO_DE_LETRAS, MAIOR_LADO_DO_LOGO,
} from './modeloInicial';

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
 *
 * ── Por que os modelos começam errados ───────────────────────────────────
 * Já começaram certos, e era pior: as três peças nasciam aprovadas, e o
 * desbravador concluía a lição sem ter decidido nada. O modelo e os limites
 * moram em `modeloInicial.ts`, com o motivo escrito lá e um teste que confere
 * que ele continua reprovando em tudo.
 */

const SUGESTOES = ['Sobre o clube', 'Galeria', 'Eventos', 'Unidades', 'Notícias', 'Contato'];

type Peca = 'logo' | 'botoes' | 'header';

/** As formas em miniatura, para o botão dizer o que faz sem precisar do nome. */
const DESENHO_DA_FORMA: Record<LogoShape, string> = {
  circulo: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  escudo: 'M4 4.5h16v8.2c0 4.2-4.2 6.4-8 7.3-3.8-.9-8-3.1-8-7.3z',
  hexagono: 'M12 2.6l8.1 4.7v9.4L12 21.4l-8.1-4.7V7.3z',
  losango: 'M12 2.5l8.2 9.5-8.2 9.5L3.8 12z',
  estrela: 'M12 2.6l2.7 6.5 7 .5-5.4 4.6 1.7 6.8L12 17.3l-6 3.7 1.7-6.8L2.3 9.6l7-.5z',
  quadrado: 'M7.5 4h9A3.5 3.5 0 0 1 20 7.5v9a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 16.5v-9A3.5 3.5 0 0 1 7.5 4z',
};

const FORMAS = Object.keys(DESENHO_DA_FORMA) as LogoShape[];
const FIGURAS = Object.keys(NOME_DO_SIMBOLO) as Simbolo[];
const FONTES = Object.keys(NOME_DA_FONTE) as FonteDeDesenho[];

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

  /* Formas e figuras entram como grade de miniaturas, e não como lista de
     nomes: escolher desenho olhando palavra é o que nenhum editor faz. */
  .es-grade { display: grid; gap: 6px; }
  .es-grade.formas { grid-template-columns: repeat(3, 1fr); }
  .es-grade.figuras { grid-template-columns: repeat(4, 1fr); }
  .es-grade button {
    display: flex; align-items: center; justify-content: center; height: 40px;
    border-radius: 6px; cursor: pointer; padding: 0;
    background: #2E2E38; border: 1px solid #3E3E4A; color: #C9C9D3;
  }
  .es-grade button:hover { background: #383843; color: #FFFFFF; }
  .es-grade button[aria-pressed="true"] { background: #3B2F55; border-color: #8B5CF6; color: #FFFFFF; }
  .es-grade canvas { display: block; }

  /* A lista de botões: cada linha tem o seu excluir, como em qualquer editor. */
  .es-linha { display: flex; gap: 6px; margin-bottom: 5px; }
  .es-linha .es-entrada { flex: 1; min-width: 0; }
  .es-tirar {
    width: 32px; height: 32px; flex: none; border-radius: 6px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    background: #2E2E38; border: 1px solid #3E3E4A; color: #9C9CA8;
  }
  .es-tirar:hover { background: #4A2A2A; border-color: #7A3B3B; color: #FCA5A5; }
  .es-tirar:disabled { opacity: .4; cursor: default; background: #2E2E38; border-color: #3E3E4A; color: #9C9CA8; }

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

/**
 * A figura em miniatura, desenhada pelo mesmo código da prancheta.
 *
 * Poderia ser um ícone parecido, e aí a pessoa escolheria uma coisa e receberia
 * outra. Sai do mesmo `desenharSimbolo`, então o que ela vê no botão é o que
 * vai para o arquivo.
 */
function Figurinha({ simbolo }: { simbolo: Simbolo }) {
  const tela = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = tela.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharSimbolo(ctx, simbolo, canvas.width / 2, canvas.height / 2, canvas.width * 0.84, '#D8D8E2');
  }, [simbolo]);
  return <canvas ref={tela} width={28} height={28} aria-hidden="true" />;
}

/** A grade de figuras, usada pelo logo e pelo header — os dois pedem o mesmo. */
function EscolhaDeFigura({ valor, aoEscolher, rotulo }: {
  valor: Simbolo; aoEscolher: (s: Simbolo) => void; rotulo: string;
}) {
  return (
    <div className="es-campo">
      <span className="es-rotulo"><Sparkles className="w-3.5 h-3.5" /> {rotulo}</span>
      <div className="es-grade figuras">
        {FIGURAS.map(s => (
          <button key={s} aria-pressed={valor === s} title={NOME_DO_SIMBOLO[s]}
            aria-label={NOME_DO_SIMBOLO[s]} onClick={() => aoEscolher(s)}>
            {s === 'nenhum' ? <Ban className="w-4 h-4" /> : <Figurinha simbolo={s} />}
          </button>
        ))}
      </div>
      <span className="es-medida" style={{ display: 'block', marginTop: 5 }}>
        {NOME_DO_SIMBOLO[valor]}
      </span>
    </div>
  );
}

/** O seletor de fonte, igual nas três peças. */
function EscolhaDeFonte({ valor, aoEscolher, id }: {
  valor: FonteDeDesenho; aoEscolher: (f: FonteDeDesenho) => void; id: string;
}) {
  return (
    <div className="es-campo">
      <span className="es-rotulo"><Type className="w-3.5 h-3.5" /> Fonte</span>
      <select className="es-entrada" value={valor} aria-label={`Fonte ${id}`}
        onChange={e => aoEscolher(e.target.value as FonteDeDesenho)}>
        {FONTES.map(f => <option key={f} value={f}>{NOME_DA_FONTE[f]}</option>)}
      </select>
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
  const [logoTexto, setLogoTexto] = useState(LOGO_INICIAL.texto);
  const [logoForma, setLogoForma] = useState<LogoShape>(LOGO_INICIAL.forma);
  const [logoFigura, setLogoFigura] = useState<Simbolo>(LOGO_INICIAL.figura);
  const [logoFonte, setLogoFonte] = useState<FonteDeDesenho>(LOGO_INICIAL.fonte);
  const [logoTamanho, setLogoTamanho] = useState(LOGO_INICIAL.tamanho);
  const [logoFundoBranco, setLogoFundoBranco] = useState(LOGO_INICIAL.fundoBranco);
  const [logoFundo, setLogoFundo] = useState(LOGO_INICIAL.fundo);
  const [logoFrente, setLogoFrente] = useState(LOGO_INICIAL.frente);

  const telaDoLogo = useMemo(
    () => drawLogo({
      text: logoTexto, shape: logoForma, fill: logoFundo, fg: logoFrente, size: logoTamanho,
      symbol: logoFigura, font: logoFonte, background: logoFundoBranco ? 'branco' : 'transparente',
    }),
    [logoTexto, logoForma, logoFundo, logoFrente, logoTamanho, logoFigura, logoFonte, logoFundoBranco],
  );
  const contrasteDoLogo = contrastRatio(logoFundo, logoFrente);

  /* ── 2. Os botões de navegação ─────────────────────────────────────────── */
  // Cópia, e não a constante: o modelo é compartilhado com o teste que o
  // vigia, e uma peça que se edita não pode ser a mesma que serve de padrão.
  const [rotulos, setRotulos] = useState<string[]>([...BOTOES_INICIAIS.rotulos]);
  const [botaoAltura, setBotaoAltura] = useState(BOTOES_INICIAIS.altura);
  const [botaoRaio, setBotaoRaio] = useState(BOTOES_INICIAIS.raio);
  const [botaoFonte, setBotaoFonte] = useState<FonteDeDesenho>(BOTOES_INICIAIS.fonte);
  const [botaoFundo, setBotaoFundo] = useState(BOTOES_INICIAIS.fundo);
  const [botaoFrente, setBotaoFrente] = useState(BOTOES_INICIAIS.frente);

  const telasDosBotoes = useMemo(
    () => rotulos.map(r => drawButton({
      label: r || ' ', width: Math.max(140, r.length * 16 + 60),
      height: botaoAltura, bg: botaoFundo, fg: botaoFrente, radius: botaoRaio, font: botaoFonte,
    })),
    [rotulos, botaoAltura, botaoFundo, botaoFrente, botaoRaio, botaoFonte],
  );
  const contrasteDoBotao = contrastRatio(botaoFundo, botaoFrente);
  const rotulosPreenchidos = rotulos.filter(r => r.trim().length >= 2).length;
  const coresSeguras = isWebSafe(botaoFundo) && isWebSafe(botaoFrente);

  const acrescentarBotao = () => setRotulos(r => (r.length >= MAXIMO_DE_BOTOES ? r : [...r, '']));
  const tirarBotao = (i: number) => setRotulos(r => (r.length <= 1 ? r : r.filter((_, j) => j !== i)));

  /* ── 3. O header ───────────────────────────────────────────────────────── */
  const [tituloHeader, setTituloHeader] = useState(HEADER_INICIAL.titulo);
  const [subtituloHeader, setSubtituloHeader] = useState(HEADER_INICIAL.subtitulo);
  const [headerFigura, setHeaderFigura] = useState<Simbolo>(HEADER_INICIAL.figura);
  const [headerFonte, setHeaderFonte] = useState<FonteDeDesenho>(HEADER_INICIAL.fonte);
  const [headerLargura, setHeaderLargura] = useState(HEADER_INICIAL.largura);
  const [headerAltura, setHeaderAltura] = useState(HEADER_INICIAL.altura);
  const [headerDe, setHeaderDe] = useState(HEADER_INICIAL.de);
  const [headerAte, setHeaderAte] = useState(HEADER_INICIAL.ate);
  const [headerFrente, setHeaderFrente] = useState(HEADER_INICIAL.frente);

  const telaDoHeader = useMemo(
    () => drawHeader({
      title: tituloHeader, subtitle: subtituloHeader, width: headerLargura,
      height: headerAltura, from: headerDe, to: headerAte, fg: headerFrente,
      symbol: headerFigura, font: headerFonte,
    }),
    [tituloHeader, subtituloHeader, headerLargura, headerAltura, headerDe, headerAte,
      headerFrente, headerFigura, headerFonte],
  );
  const contrasteInicio = contrastRatio(headerDe, headerFrente);
  const contrasteFim = contrastRatio(headerAte, headerFrente);
  const proporcaoDoHeader = headerAltura > 0 ? headerLargura / headerAltura : 0;

  /* ── Codificar tudo, para medir bytes e transparência ──────────────────── */
  const [png, setPng] = useState<Record<Peca, { url: string; blob: Blob; bytes: number; alfa: boolean }[] | null>>({
    logo: null, botoes: null, header: null,
  });
  /*
   * O header também sai em JPEG, e é o único dos três que sai.
   *
   * Degradê é o que o PNG faz de pior: o navegador espalha ruído no degradê
   * para não sair em faixas, e o PNG, que guarda tudo sem perder nada, guarda
   * o ruído inteiro — meio megabyte de banner. Sem transparência para
   * defender, o JPEG ganha por vinte vezes. É a outra metade da mesma lição do
   * logo: o formato sai do que a imagem tem, e não do gosto de quem salva.
   */
  const [jpegDoHeader, setJpegDoHeader] = useState<{ blob: Blob; bytes: number } | null>(null);

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
      const [l, b, h, jpegH] = await Promise.all([
        codificar([telaDoLogo]), codificar(telasDosBotoes), codificar([telaDoHeader]),
        canvasToBlob(telaDoHeader, 'jpeg'),
      ]);
      if (cancelado) return;
      setPng({ logo: l, botoes: b, header: h });
      setJpegDoHeader({ blob: jpegH, bytes: jpegH.size });
    })();
    return () => { cancelado = true; urls.forEach(URL.revokeObjectURL); };
  }, [telaDoLogo, telasDosBotoes, telaDoHeader]);

  const bytesDoLogo = png.logo?.[0]?.bytes ?? 0;
  const logoTemAlfa = png.logo?.[0]?.alfa ?? false;
  const botoesComAlfa = !!png.botoes?.length && png.botoes.every(b => b.alfa);
  const bytesDoHeader = png.header?.[0]?.bytes ?? 0;
  const bytesJpegDoHeader = jpegDoHeader?.bytes ?? 0;
  const headerVaiEmJpeg = !!jpegDoHeader && bytesJpegDoHeader < bytesDoHeader;
  const letrasDoLogo = logoTexto.trim().length;

  /* ── O que o requisito cobra ───────────────────────────────────────────── */
  const logoPronto = letrasDoLogo > 0 && letrasDoLogo <= MAXIMO_DE_LETRAS
    && logoTemAlfa && contrasteDoLogo >= CONTRASTE_MINIMO && bytesDoLogo <= ORCAMENTO;
  const botoesProntos = rotulosPreenchidos >= MINIMO_DE_BOTOES && botaoAltura >= ALVO_DE_TOQUE
    && contrasteDoBotao >= CONTRASTE_MINIMO && coresSeguras && botoesComAlfa && botaoRaio > 0;
  const headerPronto = tituloHeader.trim().length >= 3 && proporcaoDoHeader >= PROPORCAO_MINIMA
    && contrasteInicio >= CONTRASTE_MINIMO && contrasteFim >= CONTRASTE_MINIMO;

  const tarefas = [
    {
      id: 't1', titulo: 'Um logo em PNG, com fundo transparente e abaixo de 15 KB', feita: logoPronto && salvo.logo,
      onde: 'Peça Logo, na lateral',
      detalhe: !logoPronto
        ? (letrasDoLogo === 0 ? 'O logo está sem sigla.'
          : letrasDoLogo > MAXIMO_DE_LETRAS ? `A sigla tem ${letrasDoLogo} letras; cabem ${MAXIMO_DE_LETRAS}.`
            : !logoTemAlfa ? 'O fundo ainda é branco, e não transparente.'
              : contrasteDoLogo < CONTRASTE_MINIMO ? `O contraste do texto está em ${contrasteDoLogo.toFixed(1)}:1.`
                : bytesDoLogo > ORCAMENTO ? `O arquivo está em ${formatBytes(bytesDoLogo)}.` : undefined)
        : (!salvo.logo ? 'Falta baixar o arquivo.' : undefined),
      passos: [
        'Troque o nome inteiro por uma sigla de até seis letras — nome comprido vira borrão quando o logo fica pequeno.',
        'Escolha uma figura: pinheiro, fogueira, pegada, Cruzeiro do Sul. É ela que se reconhece de longe, antes das letras.',
        'Ponha o fundo em Transparente. No Branco o logo vai carregar uma caixa branca para dentro de qualquer página.',
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
        ? (rotulosPreenchidos < MINIMO_DE_BOTOES ? `${rotulosPreenchidos} de ${MINIMO_DE_BOTOES} preenchidos.`
          : botaoAltura < ALVO_DE_TOQUE ? `A altura está em ${botaoAltura} px.`
            : botaoRaio === 0 ? 'Os cantos ainda são quadrados.'
              : !coresSeguras ? 'As cores não são seguras da web.'
                : contrasteDoBotao < CONTRASTE_MINIMO ? `O contraste do rótulo está em ${contrasteDoBotao.toFixed(1)}:1.` : undefined)
        : (!salvo.botoes ? 'Falta baixar todos.' : undefined),
      passos: [
        `Use o + para acrescentar botões: o requisito pede pelo menos ${MINIMO_DE_BOTOES}, e começam dois.`,
        'Dê nome a cada um. Botão sem rótulo não navega para lugar nenhum.',
        `Deixe a altura em ${ALVO_DE_TOQUE} px ou mais: abaixo disso o dedo erra o alvo no celular.`,
        'Use cores seguras da web: só os valores 00, 33, 66, 99, CC e FF em cada canal. O botão "Ajustar" arruma.',
        'Clareie o rótulo ou escureça o fundo até o contraste passar de 4,5:1.',
        'Arredonde os cantos — é esse recorte que só sobrevive em PNG.',
        'Clique em Baixar todos.',
      ],
    },
    {
      id: 't3', titulo: 'Um header para o topo do site', feita: headerPronto && salvo.header,
      onde: 'Peça Header, na lateral',
      detalhe: !headerPronto
        ? (tituloHeader.trim().length < 3 ? 'O header está sem título.'
          : proporcaoDoHeader < PROPORCAO_MINIMA ? `A proporção está em ${proporcaoDoHeader.toFixed(1)}×.`
            : 'O texto precisa ser legível nas duas pontas do degradê.')
        : (!salvo.header ? 'Falta baixar o arquivo.' : undefined),
      passos: [
        'Escreva o nome do clube: o header é a primeira coisa que a pessoa lê.',
        'Ponha uma figura à esquerda do título, como o brasão no papel timbrado.',
        'Deixe a largura em pelo menos três vezes a altura — header alto empurra o conteúdo para fora da tela.',
        'O texto atravessa o degradê inteiro: confira o contraste nas duas pontas, não só numa.',
        'Repare nos dois pesos embaixo da prancheta: o header não tem transparência para defender, e aí o JPEG ganha do PNG com folga. É por isso que ele baixa em JPEG.',
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
          Um logo com fundo transparente, {rotulos.length} botões em cores seguras e um header —
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
      programa="estudio-de-design"
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
                  {png.botoes.map((b, i) => <img key={i} src={b.url} alt={`Botão ${rotulos[i] || 'sem nome'}`} />)}
                </div></div>
                <p className="es-medida">
                  {png.botoes.length} {png.botoes.length === 1 ? 'botão' : 'botões'} ·
                  {' '}o mais pesado tem {formatBytes(Math.max(...png.botoes.map(b => b.bytes)))}
                </p>
              </>
            )}

            {peca === 'header' && png.header && (
              <>
                <div className="es-papel" style={{ padding: 12, maxWidth: 620 }}>
                  <img src={png.header[0].url} alt="O header em construção" />
                </div>
                <p className="es-medida">
                  {headerLargura} × {headerAltura} px · {proporcaoDoHeader.toFixed(1)}× ·
                  {' '}PNG {formatBytes(bytesDoHeader)}
                  {jpegDoHeader && ` · JPEG ${formatBytes(bytesJpegDoHeader)}`}
                </p>
              </>
            )}
          </div>

          <div className="es-props">
            {peca === 'logo' && (
              <>
                <div className="es-campo">
                  <span className="es-rotulo"><Type className="w-3.5 h-3.5" /> Sigla (até {MAXIMO_DE_LETRAS} letras)</span>
                  <input className="es-entrada" value={logoTexto} maxLength={24}
                    aria-label="Sigla do logo" onChange={e => setLogoTexto(e.target.value)} />
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Shapes className="w-3.5 h-3.5" /> Forma · {NOME_DA_FORMA[logoForma]}</span>
                  <div className="es-grade formas">
                    {FORMAS.map(f => (
                      <button key={f} aria-pressed={logoForma === f} title={NOME_DA_FORMA[f]}
                        aria-label={NOME_DA_FORMA[f]} onClick={() => setLogoForma(f)}>
                        <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
                          <path d={DESENHO_DA_FORMA[f]} fill="currentColor" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <EscolhaDeFigura valor={logoFigura} aoEscolher={setLogoFigura} rotulo="Figura do logo" />
                <EscolhaDeFonte valor={logoFonte} aoEscolher={setLogoFonte} id="do logo" />

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
                  <span className="es-rotulo"><AlertTriangle className="w-3.5 h-3.5" /> Fundo do arquivo</span>
                  <div className="es-opcoes">
                    <button aria-pressed={!logoFundoBranco} onClick={() => setLogoFundoBranco(false)}>Transparente</button>
                    <button aria-pressed={logoFundoBranco} onClick={() => setLogoFundoBranco(true)}>Branco</button>
                  </div>
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Ruler className="w-3.5 h-3.5" /> Tamanho · {logoTamanho} px</span>
                  <input className="es-faixa" type="range" min={128} max={MAIOR_LADO_DO_LOGO} step={32}
                    value={logoTamanho} aria-label="Tamanho do logo"
                    onChange={e => setLogoTamanho(Number(e.target.value))} />
                </div>

                <Leitura Ico={Type} texto="Letras da sigla"
                  valor={`${letrasDoLogo} de ${MAXIMO_DE_LETRAS}`}
                  bom={letrasDoLogo > 0 && letrasDoLogo <= MAXIMO_DE_LETRAS} />
                <Leitura Ico={Contrast} texto="Contraste do texto"
                  valor={`${contrasteDoLogo.toFixed(1)}:1`} bom={contrasteDoLogo >= CONTRASTE_MINIMO} />
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
                  <span className="es-rotulo">
                    <Type className="w-3.5 h-3.5" /> Rótulos ({rotulos.length} de {MINIMO_DE_BOTOES}+)
                  </span>
                  {rotulos.map((r, i) => (
                    <div className="es-linha" key={i}>
                      <input className="es-entrada" value={r} maxLength={14}
                        placeholder={SUGESTOES[i % SUGESTOES.length]}
                        aria-label={`Rótulo do botão ${i + 1}`}
                        onChange={e => setRotulos(rotulos.map((v, j) => (j === i ? e.target.value : v)))} />
                      <button className="es-tirar" disabled={rotulos.length <= 1}
                        aria-label={`Excluir o botão ${i + 1}`} title="Excluir este botão"
                        onClick={() => tirarBotao(i)}>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button className="es-bt" style={{ width: '100%', justifyContent: 'center', marginTop: 3 }}
                    disabled={rotulos.length >= MAXIMO_DE_BOTOES} onClick={acrescentarBotao}>
                    <Plus className="w-3.5 h-3.5" /> Acrescentar botão
                  </button>
                </div>

                <EscolhaDeFonte valor={botaoFonte} aoEscolher={setBotaoFonte} id="dos botões" />

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
                  valor={`${rotulosPreenchidos} de ${MINIMO_DE_BOTOES}`} bom={rotulosPreenchidos >= MINIMO_DE_BOTOES} />
                <Leitura Ico={Contrast} texto="Contraste do rótulo"
                  valor={`${contrasteDoBotao.toFixed(1)}:1`} bom={contrasteDoBotao >= CONTRASTE_MINIMO} />
                <Leitura Ico={Palette} texto="Cores seguras da web"
                  valor={coresSeguras ? 'sim' : 'não'} bom={coresSeguras} />
                <Leitura Ico={Ruler} texto="Alvo de toque"
                  valor={`${botaoAltura} px`} bom={botaoAltura >= ALVO_DE_TOQUE} />
                <Leitura Ico={Shapes} texto="Cantos arredondados"
                  valor={botaoRaio > 0 ? `${botaoRaio} px` : 'não'} bom={botaoRaio > 0 && botoesComAlfa} />

                <button className="es-bt forte" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
                  onClick={() => png.botoes && baixar(png.botoes, rotulos.map((r, i) => `botao-${i + 1}-${r.toLowerCase().replace(/\s+/g, '-') || 'sem-nome'}.png`), 'botoes')}>
                  <Download className="w-4 h-4" /> Baixar todos
                </button>
              </>
            )}

            {peca === 'header' && (
              <>
                <div className="es-campo">
                  <span className="es-rotulo"><Type className="w-3.5 h-3.5" /> Título</span>
                  <input className="es-entrada" value={tituloHeader} maxLength={40}
                    placeholder="Nome do seu clube" aria-label="Título do header"
                    onChange={e => setTituloHeader(e.target.value)} />
                </div>
                <div className="es-campo">
                  <span className="es-rotulo"><Type className="w-3.5 h-3.5" /> Subtítulo</span>
                  <input className="es-entrada" value={subtituloHeader} maxLength={50}
                    placeholder="Aventura, serviço e amizade" aria-label="Subtítulo do header"
                    onChange={e => setSubtituloHeader(e.target.value)} />
                </div>

                <EscolhaDeFigura valor={headerFigura} aoEscolher={setHeaderFigura} rotulo="Figura do header" />
                <EscolhaDeFonte valor={headerFonte} aoEscolher={setHeaderFonte} id="do header" />

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
                  valor={`${proporcaoDoHeader.toFixed(1)}×`} bom={proporcaoDoHeader >= PROPORCAO_MINIMA} />
                <Leitura Ico={Contrast} texto="Contraste no início"
                  valor={`${contrasteInicio.toFixed(1)}:1`} bom={contrasteInicio >= CONTRASTE_MINIMO} />
                <Leitura Ico={Contrast} texto="Contraste no fim"
                  valor={`${contrasteFim.toFixed(1)}:1`} bom={contrasteFim >= CONTRASTE_MINIMO} />

                <button className="es-bt forte" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
                  onClick={() => png.header && baixar(
                    headerVaiEmJpeg && jpegDoHeader ? [jpegDoHeader] : png.header,
                    [`header-do-clube.${headerVaiEmJpeg ? 'jpg' : 'png'}`], 'header')}>
                  <Download className="w-4 h-4" /> Baixar {headerVaiEmJpeg ? 'JPEG' : 'PNG'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
