import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Folder, FolderOpen, FileText, FileImage, FileType2, Link2, Monitor, HardDrive,
  ChevronRight, ChevronDown, ArrowLeft, ArrowRight, ArrowUp, RotateCw, Search,
  FolderPlus, Scissors, Copy, ClipboardPaste, Pencil, Trash2, MoreHorizontal,
  ArrowUpDown, LayoutGrid, Grid2x2, Settings, Globe, PartyPopper,
  Download, Palette, AppWindow,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import { CSS_WINDOWS, BarraDeTitulo, DialogoDoWindows, IconeWinRAR } from './windows';
import {
  JanelaWinRAR, JanelaEditor, JanelaConfiguracoes, JanelaNavegador,
  ControlesDeCompactar, ControlesDeExtrair,
  type Origem, type LinhaDoArquivo,
} from './operacoesJanelas';
import type { AjustesDeImpressao } from './word';
import {
  AssistenteDeInstalacao, AvisoDeContaDeUsuario, JanelaDesenhador,
  type EscolhasDaInstalacao, type DestinoDaInstalacao,
} from './instalador';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP042 requisito 6 — as quatro tarefas que o documento manda demonstrar.
 *
 * Comprimir, exportar em pdf, instalar e imprimir. Nenhuma delas o navegador
 * pode fazer no computador de quem estuda: a página não instala programa nem
 * manda para a impressora da casa de ninguém. A alternativa seria a pessoa
 * marcar "fiz" numa lista, e autodeclaração é o que o resto da plataforma
 * evita — então as quatro acontecem aqui dentro, e o laboratório vê cada uma.
 *
 * ── Por que uma área de trabalho, e não quatro cartões ───────────────────
 * A primeira versão eram quatro cartões empilhados na página, um por tarefa.
 * Praticavam as quatro, e não se pareciam com computador nenhum: no Windows
 * essas tarefas não moram numa lista, moram em quatro programas diferentes,
 * e boa parte do que há para aprender é justamente *em qual deles* cada uma
 * acontece. Compactar é o Explorador chamando o WinRAR pelo menu de contexto;
 * desinstalar é Configurações, e não a lixeira.
 *
 * Daí a forma daqui: área de trabalho, Explorador maximizado, barra de tarefas,
 * e os outros três programas abrindo por cima. As peças de janela vêm de
 * `windows.tsx`, compartilhadas com o laboratório de pastas e arquivos.
 *
 * ── Onde mora a lição de cada estação ────────────────────────────────────
 * Não é no acerto, é no erro que se escolhe. Três das quatro têm um caminho
 * errado que parece certo, e é ele que o desbravador vai encontrar na vida:
 *
 *   compactar   — "compactar" não é "apagar": o original continua lá. A opção
 *                 que apaga existe no diálogo do WinRAR, desmarcada, e é isso
 *                 que mostra que apagar é escolha à parte;
 *   pdf         — apertar Salvar não vira pdf. Vira pdf quem troca o formato,
 *                 em Salvar como ou Exportar;
 *   desinstalar — arrastar o atalho para a lixeira não desinstala nada, e
 *                 apagar a pasta deixa sobra espalhada pelo sistema. Os dois
 *                 caminhos errados estão no Explorador, no lugar exato onde
 *                 estão num Windows de verdade: o atalho na Área de Trabalho e
 *                 a pasta em Arquivos de Programas. Este é o engano mais comum
 *                 dos quatro, e o que mais entope máquina de clube;
 *   imprimir    — três cópias não agrupadas saem em ordem de página, e não em
 *                 ordem de documento. Quem descobre isso com o papel na mão já
 *                 gastou a tinta.
 *
 * Errar não reprova: explica e devolve a vez, como no laboratório de cuidados.
 */

/* ── O disco simulado ──────────────────────────────────────────────────────── */

type Pasta = 'area' | 'clube' | 'programas' | 'downloads' | 'extraida' | 'desenhador';
type Especie = 'jpg' | 'docx' | 'rar' | 'pdf' | 'pasta' | 'atalho' | 'exe';

interface Item {
  id: string;
  nome: string;
  especie: Especie;
  /** Em MB. Pasta e atalho não contam tamanho, como no Explorador. */
  mb: number;
  data: string;
}

const NOME_DA_PASTA: Record<Pasta, string> = {
  area: 'Área de Trabalho',
  clube: 'Clube',
  programas: 'Arquivos de Programas',
  downloads: 'Downloads',
  extraida: 'acampamento',
  desenhador: 'Desenhador',
};

/** O caminho até cada pasta, para a barra de endereço e para a árvore. */
const CAMINHO: Record<Pasta, string[]> = {
  area: ['Área de Trabalho'],
  clube: ['Documentos', 'Clube'],
  programas: ['Este Computador', 'Disco Local (C:)', 'Arquivos de Programas'],
  downloads: ['Downloads'],
  extraida: ['Documentos', 'Clube', 'acampamento'],
  desenhador: ['Este Computador', 'Disco Local (C:)', 'Arquivos de Programas', 'Desenhador'],
};

const ARQUIVOS_DO_CLUBE: Item[] = [
  { id: 'f1', nome: 'acampamento-01.jpg', especie: 'jpg', mb: 3.4, data: '09/08/2026 14:12' },
  { id: 'f2', nome: 'acampamento-02.jpg', especie: 'jpg', mb: 2.9, data: '09/08/2026 14:15' },
  { id: 'f3', nome: 'lista-de-presenca.docx', especie: 'docx', mb: 0.2, data: '11/08/2026 20:03' },
  { id: 'f4', nome: 'relatorio-da-unidade.docx', especie: 'docx', mb: 0.3, data: '18/08/2026 21:40' },
];

const TOTAL = ARQUIVOS_DO_CLUBE.reduce((s, a) => s + a.mb, 0);
/* Foto já vem comprimida de fábrica: o rar encolhe pouco aqui, e é isso que a
   estação diz em voz alta em vez de prometer milagre. */
const TOTAL_RAR = 5.1;

/** O que o WinRAR mostra quando o arquivo está aberto — ele conta em KB. */
const DENTRO_DO_RAR: LinhaDoArquivo[] = [
  { nome: 'acampamento-01.jpg', kb: 3482, compactado: 3390, tipo: 'Imagem JPEG' },
  { nome: 'acampamento-02.jpg', kb: 2970, compactado: 2884, tipo: 'Imagem JPEG' },
  { nome: 'lista-de-presenca.docx', kb: 205, compactado: 128, tipo: 'Documento do Word' },
  { nome: 'relatorio-da-unidade.docx', kb: 307, compactado: 176, tipo: 'Documento do Word' },
];

const brasileiro = (n: number) => n.toFixed(1).replace('.', ',');

const ROTULO_DO_TIPO: Record<Especie, string> = {
  jpg: 'Imagem JPEG',
  docx: 'Documento do Word',
  rar: 'Arquivo WinRAR',
  pdf: 'Documento PDF',
  pasta: 'Pasta de arquivos',
  atalho: 'Atalho',
  exe: 'Aplicativo',
};

function IconeDoItem({ item }: { item: Item }) {
  const c = 'w-4 h-4 flex-none';
  switch (item.especie) {
    case 'pasta': return <Folder className={c} style={{ color: '#E6B14C' }} />;
    case 'jpg': return <FileImage className={c} style={{ color: '#2E7D32' }} />;
    case 'docx': return <FileText className={c} style={{ color: '#1F6FB2' }} />;
    case 'pdf': return <FileType2 className={c} style={{ color: '#B71C1C' }} />;
    case 'atalho': return <Link2 className={c} style={{ color: '#0F6CBD' }} />;
    case 'exe': return <Grid2x2 className={c} style={{ color: '#5B5B5B' }} />;
    case 'rar': return <span className={c}><IconeWinRAR /></span>;
  }
}

/* ── As tarefas ────────────────────────────────────────────────────────────── */

const PEDIDO: AjustesDeImpressao = {
  copias: 3, agrupado: true, qualidade: 'alta', ajuste: 'pagina', porFolha: 2,
};

type Programa = 'winrar' | 'editor' | 'config' | 'navegador' | 'instalador' | 'desenhador';
type Dialogo = 'compactar' | 'extrair' | 'uac' | null;

const INSTALADOR = 'desenhador-6.2-instalador.exe';

const CAMINHO_ESCOLHIDO: Record<DestinoDaInstalacao, string> = {
  programas: 'Arquivos de Programas',
  clube: 'Documentos › Clube',
  area: 'Área de Trabalho',
};

/* ── O laboratório ─────────────────────────────────────────────────────────── */

export default function OperacoesArquivoLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  /* ── 1. Compactar e extrair ── */
  const [rarCriado, setRarCriado] = useState(false);
  const [extraido, setExtraido] = useState(false);

  /* ── 2. Salvar em pdf ── */
  const [formato, setFormato] = useState('docx');
  const [pdfPronto, setPdfPronto] = useState(false);

  /* ── 3. Instalar e desinstalar ──
     Mais estado do que as outras porque o caminho é mais longo, e é o caminho
     que ensina: achar o site, baixar, autorizar, escolher, ver instalar. */
  const [paginaDoNavegador, setPaginaDoNavegador] = useState<'busca' | 'produto'>('busca');
  const [baixando, setBaixando] = useState<number | null>(null);
  const [baixado, setBaixado] = useState(false);
  const [instalado, setInstalado] = useState(false);
  const [escolhas, setEscolhas] = useState<EscolhasDaInstalacao | null>(null);
  const [desinstalado, setDesinstalado] = useState(false);

  /* ── 4. Imprimir ── */
  const [imp, setImp] = useState<AjustesDeImpressao>({
    copias: 1, agrupado: false, qualidade: 'normal', ajuste: 'real', porFolha: 1,
  });
  const [impresso, setImpresso] = useState(false);

  /* ── A área de trabalho ── */
  const [pasta, setPasta] = useState<Pasta>('clube');
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [abertos, setAbertos] = useState<Programa[]>([]);
  const [minimizados, setMinimizados] = useState<Set<Programa>>(new Set());
  const [iniciar, setIniciar] = useState(false);
  const [menuMais, setMenuMais] = useState<{ x: number; y: number } | null>(null);
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  /* ── Diálogos ── */
  const [nomeDoRar, setNomeDoRar] = useState('acampamento.rar');
  const [formatoDoRar, setFormatoDoRar] = useState('rar');
  const [apagarDepois, setApagarDepois] = useState(false);

  const [aviso, setAviso] = useState('');
  const [salvo, setSalvo] = useState(false);
  const [gravando, setGravando] = useState(false);

  const programaPresente = instalado && !desinstalado;

  const feito = {
    t1: rarCriado && extraido,
    t2: pdfPronto,
    t3: instalado && desinstalado,
    t4: impresso,
  };
  const tudoFeito = Object.values(feito).every(Boolean);

  /* Fecha os menus flutuantes ao clicar em qualquer lugar, como todo menu de
     sistema faz. Quem abre um deles para o clique antes de subir até aqui. */
  useEffect(() => {
    if (!iniciar && !menuMais) return;
    const fechar = () => { setIniciar(false); setMenuMais(null); };
    window.addEventListener('click', fechar);
    return () => window.removeEventListener('click', fechar);
  }, [iniciar, menuMais]);

  /* ── O conteúdo de cada pasta ────────────────────────────────────────────
     Montado na hora a partir do que já aconteceu, e não guardado em estado:
     o arquivo compactado, a pasta extraída, o pdf e o programa instalado são
     consequências das quatro tarefas, e derivá-los evita a classe de erro em
     que a lista e as tarefas discordam. */
  const conteudoDe = (p: Pasta): Item[] => {
    switch (p) {
      case 'clube': return [
        ...(programaPresente && escolhas?.destino === 'clube'
          ? [{ id: 'prog', nome: 'Desenhador', especie: 'pasta' as const, mb: 0, data: '26/08/2026 11:24' }]
          : []),
        ...ARQUIVOS_DO_CLUBE,
        ...(extraido ? [{ id: 'ext', nome: 'acampamento', especie: 'pasta' as const, mb: 0, data: '26/08/2026 11:04' }] : []),
        ...(rarCriado ? [{ id: 'rar', nome: nomeDoRar, especie: 'rar' as const, mb: TOTAL_RAR, data: '26/08/2026 11:02' }] : []),
        ...(pdfPronto ? [{ id: 'pdf', nome: 'relatorio-da-unidade.pdf', especie: 'pdf' as const, mb: 0.4, data: '26/08/2026 11:08' }] : []),
      ];
      case 'extraida': return extraido ? ARQUIVOS_DO_CLUBE.map(a => ({ ...a, id: `x-${a.id}` })) : [];
      /* O instalador continua em Downloads depois de instalar, e continua
         depois de desinstalar — é assim mesmo, e é o que explica a pasta
         Downloads cheia de instalador velho em toda máquina de clube. */
      case 'downloads': return baixado
        ? [{ id: 'inst', nome: INSTALADOR, especie: 'exe' as const, mb: 86.4, data: '26/08/2026 11:20' }]
        : [];
      case 'area': return [
        ...(programaPresente && escolhas?.destino === 'area'
          ? [{ id: 'prog', nome: 'Desenhador', especie: 'pasta' as const, mb: 0, data: '26/08/2026 11:24' }]
          : []),
        ...(programaPresente && escolhas?.atalhoNaArea
          ? [{ id: 'atalho', nome: 'Desenhador — Atalho', especie: 'atalho' as const, mb: 0, data: '26/08/2026 11:24' }]
          : []),
      ];
      case 'programas': return programaPresente && escolhas?.destino === 'programas'
        ? [{ id: 'prog', nome: 'Desenhador', especie: 'pasta', mb: 0, data: '26/08/2026 11:24' }]
        : [];
      case 'desenhador': return programaPresente ? [
        { id: 'd1', nome: 'desenhador.exe', especie: 'exe', mb: 42.6, data: '20/08/2026 19:22' },
        { id: 'd2', nome: 'pinceis', especie: 'pasta', mb: 0, data: '20/08/2026 19:22' },
        { id: 'd3', nome: 'desinstalar.exe', especie: 'exe', mb: 1.2, data: '20/08/2026 19:22' },
      ] : [];
    }
  };

  const itens = conteudoDe(pasta);
  const selecionados = itens.filter(i => marcados.has(i.id));

  const irPara = (p: Pasta) => { setPasta(p); setMarcados(new Set()); setAviso(''); };

  const alternar = (id: string) => {
    setAviso('');
    setMarcados(m => {
      const c = new Set(m);
      if (c.has(id)) c.delete(id); else c.add(id);
      return c;
    });
  };

  const naoFazParte = (o: string) =>
    setAviso(`${o} existe no Windows de verdade, e está aqui para a tela ficar igual — mas não faz parte deste exercício.`);

  /* ── Abrir janelas ─────────────────────────────────────────────────────── */

  const abrir = (p: Programa) => {
    setAbertos(a => (a.includes(p) ? [...a.filter(x => x !== p), p] : [...a, p]));
    setMinimizados(m => { const c = new Set(m); c.delete(p); return c; });
    setIniciar(false);
    setAviso('');
  };
  const minimizar = (p: Programa) => setMinimizados(m => new Set(m).add(p));
  const fechar = (p: Programa) => {
    setAbertos(a => a.filter(x => x !== p));
    setMinimizados(m => { const c = new Set(m); c.delete(p); return c; });
  };

  /* Onde o programa foi parar, para a lição de apagar a pasta continuar valendo
     mesmo quem tenha mudado o destino no assistente. */
  const pastaDoPrograma: Pasta = escolhas?.destino ?? 'programas';

  /* A janela de cima é a última usada que não esteja minimizada. */
  const emFoco = [...abertos].reverse().find(p => !minimizados.has(p)) ?? null;

  const abrirItem = (item: Item) => {
    switch (item.especie) {
      case 'pasta':
        return irPara(item.nome === 'acampamento' ? 'extraida' : 'desenhador');
      case 'rar': return abrir('winrar');
      case 'docx': return abrir('editor');
      case 'pdf':
        return setAviso('O pdf abre no leitor do sistema. Aqui ele já cumpriu o que tinha de cumprir: existe, e vai chegar igual do outro lado.');
      case 'atalho':
        return setAviso('O atalho abriria o Desenhador. Repare que ele é só um caminho até o programa — o programa mesmo está em Arquivos de Programas.');
      case 'exe':
        if (item.nome === INSTALADOR) return abrirInstalador();
        return naoFazParte(`Abrir ${item.nome}`);
      case 'jpg':
        return naoFazParte(`Abrir ${item.nome}`);
    }
  };

  /* ── 1. Compactar ──────────────────────────────────────────────────────── */

  const pedirCompactacao = () => {
    if (selecionados.length !== ARQUIVOS_DO_CLUBE.length
      || !selecionados.every(s => ARQUIVOS_DO_CLUBE.some(a => a.id === s.id))) {
      setAviso('Marque os quatro arquivos do clube antes. Compactar age sobre o que está selecionado — o que ficar de fora não entra no arquivo compactado.');
      return;
    }
    setAviso('');
    setDialogo('compactar');
  };

  const compactar = () => {
    if (apagarDepois) {
      setAviso('Essa opção apaga os quatro originais depois de compactar — e repare que ela é uma opção, desmarcada por padrão. Compactar, sozinho, não apaga nada. Desmarque para ver os originais continuarem na pasta.');
      return;
    }
    if (!nomeDoRar.trim()) {
      setAviso('O arquivo compactado precisa de um nome.');
      return;
    }
    setDialogo(null);
    setRarCriado(true);
    setMarcados(new Set());
    setAviso(`De ${brasileiro(TOTAL)} MB para ${brasileiro(TOTAL_RAR)} MB. Encolheu pouco porque foto já vem comprimida de fábrica — o ganho aqui foi virar um anexo só, e não o tamanho. E repare: os quatro originais continuam na pasta. Compactar copia, não move.`);
  };

  const extrair = () => {
    setDialogo(null);
    setExtraido(true);
    setAviso('Os quatro arquivos voltaram inteiros, com o mesmo nome e o mesmo conteúdo, na pasta "acampamento". Compactar não estraga nada no caminho.');
  };

  /* ── 2. Salvar em pdf ──────────────────────────────────────────────────── */

  const concluirPdf = (caminho: string) => {
    setPdfPronto(true);
    setAviso(`Pronto, ${caminho}: relatorio-da-unidade.pdf está na pasta do clube. Em pdf o relatório chega com as margens, as fontes e as quebras de página do jeito que você deixou — e ninguém muda o texto sem querer.`);
  };

  const salvar = () =>
    setAviso('Salvar apenas grava por cima do mesmo documento do Word. Para virar pdf é preciso trocar o formato — e isso está em "Salvar como", na lista Tipo, ou em "Exportar".');

  const salvarComo = () => {
    if (formato === 'pdf') { concluirPdf('pelo Salvar como'); return; }
    setAviso(formato === 'txt'
      ? 'O .txt guarda só as letras: perde negrito, margem e imagem. Não serve para entregar um relatório formatado.'
      : 'Esse formato continua sendo documento editável, e vai abrir diferente em cada computador. Na lista Tipo, escolha PDF.');
  };

  /* ── 3. Instalar e desinstalar ─────────────────────────────────────────── */

  const escolherOrigem = (o: Origem) => {
    if (o === 'oficial') {
      setPaginaDoNavegador('produto');
      setAviso('Este é o site de quem faz o programa. Repare que clicar no resultado não baixou nada: levou ao site, e o botão de baixar está lá dentro.');
      return;
    }
    setAviso(o === 'agregador'
      ? 'Sites que juntam "programas grátis" costumam empacotar o instalador com outras coisas junto — barra de navegador, anúncio, às vezes pior. O programa até instala, e vem acompanhado.'
      : 'Programa pago que aparece de graça num link de mensagem é isca. É assim que entra a maior parte dos vírus em computador de casa.');
  };

  /* O download anda sozinho, como anda. Dois segundos: dá para ver a barra
     encher sem virar espera — quem aprende alguma coisa esperando 86 MB
     chegarem é ninguém.

     Um intervalo só, e não um setTimeout que se reagenda a cada passo: a
     versão reagendada depende de o efeito rodar de novo entre um passo e o
     seguinte, e sob relógio de teste isso não acontece dentro do mesmo avanço
     — a barra parava no primeiro passo e o teste ficava esperando para
     sempre. */
  const baixandoAgora = baixando !== null;

  useEffect(() => {
    if (!baixandoAgora) return;
    const passo = setInterval(
      () => setBaixando(b => (b === null || b >= 100 ? b : b + 5)),
      90,
    );
    return () => clearInterval(passo);
  }, [baixandoAgora]);

  useEffect(() => {
    if (baixando === null || baixando < 100) return;
    setBaixando(null);
    setBaixado(true);
    setAviso(`${INSTALADOR} foi baixado. Ele está na pasta Downloads — e repare que baixar não é instalar: o programa ainda não existe na máquina. Abra o instalador para começar.`);
  }, [baixando]);

  const abrirInstalador = () => {
    if (!baixado) return;
    setDialogo('uac');
  };

  const concluirInstalacao = (e: EscolhasDaInstalacao) => {
    setEscolhas(e);
    setInstalado(true);
    fechar('instalador');
    if (e.executarAoFim) abrir('desenhador');
    const onde = e.atalhoNaArea
      ? 'O atalho ficou na Área de Trabalho, como você pediu.'
      : 'Você desmarcou o atalho da Área de Trabalho, então ele não está lá — o programa está instalado do mesmo jeito.';
    setAviso(`Instalado em ${CAMINHO_ESCOLHIDO[e.destino]}. ${onde} Agora a diretoria pediu para tirar da máquina: isso é em Configurações → Aplicativos, e não pela lixeira.`);
  };

  const desinstalar = () => {
    setDesinstalado(true);
    fechar('config');
    fechar('desenhador');
    setAviso('Desinstalado pelo caminho certo. O desinstalador desfaz o que a instalação fez — arquivos, atalhos e registros — em vez de deixar sobra pelo sistema. Repare que o atalho sumiu junto, e que o instalador continua em Downloads: ele não é o programa, é só a caixa em que o programa veio.');
  };

  const excluir = () => {
    if (selecionados.some(s => s.especie === 'atalho')) {
      setAviso('Apagar o atalho apaga o atalho, e só. O programa continua instalado, ocupando o mesmo espaço — some apenas o caminho até ele. É o engano que mais entope máquina de clube.');
      return;
    }
    if (selecionados.some(s => s.nome === 'Desenhador' || s.nome.endsWith('.exe'))) {
      setAviso('Apagar a pasta tira os arquivos principais e deixa o resto: registros do sistema, atalhos e configurações espalhadas. O sistema continua achando que o programa existe. Quem tira um programa é o desinstalador, em Configurações → Aplicativos.');
      return;
    }
    setAviso('Neste laboratório os arquivos do clube ficam onde estão — o que se pratica aqui é compactar, exportar em pdf, instalar e imprimir.');
  };

  /* ── 4. Imprimir ───────────────────────────────────────────────────────── */

  const imprimir = () => {
    const faltas: string[] = [];
    if (imp.copias !== PEDIDO.copias) faltas.push('a quantidade de cópias');
    if (imp.agrupado !== PEDIDO.agrupado) faltas.push('o agrupamento — sem ele saem todas as páginas 1, depois todas as 2');
    if (imp.qualidade !== PEDIDO.qualidade) faltas.push('a qualidade');
    if (imp.ajuste !== PEDIDO.ajuste) faltas.push('o ajuste de tamanho');
    if (imp.porFolha !== PEDIDO.porFolha) faltas.push('as páginas por folha');

    if (faltas.length) { setAviso(`Ainda falta acertar ${faltas.join('; ')}.`); return; }
    setImpresso(true);
    setAviso('Saíram 3 cópias completas, uma depois da outra, em 6 folhas. Sem agrupar seriam as mesmas folhas fora de ordem, para separar à mão.');
  };

  /* ── Conclusão ─────────────────────────────────────────────────────────── */

  const registrar = async () => {
    setAviso('');
    setGravando(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) {
      await ensureEnrollment(userId, specId);
      await updateEnrollmentActivity(userId, specId);
    }
    await registrarConclusaoDeLicao(userId, lessonCode);

    /* Conferir quantos requisitos foram gravados, e não só disparar a gravação:
       comemorar sem ter registrado é a falha que mais custa a aparecer, porque
       parece sucesso. */
    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: 4, total_questions: 4,
      });
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setAviso('Você concluiu as quatro tarefas, mas o progresso não pôde ser guardado agora. Nada do que você fez se perdeu — avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'operacoes_concluidas', { specialtyCode, lessonCode, etapas: 4 });
    setSalvo(true);
  };

  if (salvo) {
    return (
      <div className="card p-6 text-center">
        <PartyPopper className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">As quatro tarefas, feitas!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Compactar para enviar, exportar em pdf para não desmontar, instalar e
          desinstalar pelo caminho certo, e imprimir sem desperdiçar papel. São
          as coisas que todo mundo precisa saber fazer num computador.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  /* ── A tela ────────────────────────────────────────────────────────────── */

  /*
    As quatro tarefas, com o caminho inteiro guardado em `passos`. A moldura só
    oferece esse caminho depois de um tempo sem ninguém concluir nada — quem
    está achando sozinho não é interrompido, e quem empacou não fica sem saída.
  */
  const tarefas = [
    {
      id: 't1', titulo: 'Compactar os quatro arquivos e extrair de volta', feita: feito.t1,
      onde: 'Explorador → marcar os quatro → ⋯ → WinRAR',
      detalhe: !feito.t1 && rarCriado ? 'Falta abrir o arquivo compactado e extrair.' : undefined,
      passos: rarCriado ? [
        'Na lista, clique na linha do acampamento.rar para marcá-lo.',
        'Clique no ⋯ na ponta da barra de comandos.',
        'Escolha "Extrair para \'acampamento\\\'".',
        'No diálogo do WinRAR, clique em OK.',
      ] : [
        'Clique na caixinha à esquerda de cada um dos quatro arquivos do clube — as duas fotos e os dois documentos.',
        'Clique no ⋯ na ponta da barra de comandos, ou aperte o botão direito em cima de um deles.',
        'Escolha "Adicionar para o arquivo…".',
        'Deixe o nome acampamento.rar como está e clique em OK.',
        'Depois, dois cliques no acampamento.rar abrem o WinRAR, e o botão "Extrair Para" devolve os arquivos.',
      ],
    },
    {
      id: 't2', titulo: 'Salvar o relatório em pdf', feita: feito.t2,
      onde: 'Word → guia Arquivo → Salvar como',
      passos: [
        'Dois cliques em relatorio-da-unidade.docx, na pasta do clube — ou abra o Editor de Texto pelo menu Iniciar.',
        'No Word, clique na guia Arquivo, a primeira, azul. Ela abre uma tela inteira: são os bastidores.',
        'Na faixa azul da esquerda, clique em "Salvar como".',
        'Na lista Tipo, troque de "Documento do Word" para "PDF (*.pdf)".',
        'Clique no botão Salvar.',
        'Pelo caminho "Exportar" dá no mesmo: lá o botão se chama "Criar PDF/XPS".',
      ],
    },
    {
      id: 't3', titulo: 'Instalar e desinstalar um programa', feita: feito.t3,
      onde: instalado
        ? 'Iniciar → Configurações → Aplicativos'
        : 'Iniciar → Navegador Web',
      detalhe: !feito.t3 && instalado
        ? `Instalado em ${CAMINHO_ESCOLHIDO[pastaDoPrograma]}. Falta tirar da máquina pelo caminho certo.`
        : undefined,
      passos: instalado ? [
        'Clique no botão Iniciar, na barra de tarefas, e abra as Configurações.',
        'A seção Aplicativos já vem aberta, com a lista dos programas instalados.',
        'Ache o Desenhador na lista e clique nas três bolinhas à direita dele.',
        'Escolha Desinstalar.',
      ] : [
        'Clique no botão Iniciar, na barra de tarefas, e abra o Navegador Web.',
        'Entre os três resultados, escolha o do site oficial — o endereço é desenhador.org.',
        'Na página do programa, clique em "Baixar para Windows" e espere o download terminar.',
        'Clique em "Abrir arquivo" na barra de baixo, ou ache o instalador na pasta Downloads e dê dois cliques.',
        'O Windows vai perguntar se pode fazer alterações no dispositivo: responda Sim.',
        'Siga o assistente: idioma, Avançar, aceitar o contrato, a pasta, os atalhos, e então Instalar.',
      ],
    },
    {
      id: 't4', titulo: 'Imprimir 3 cópias agrupadas, alta, ajustadas, 2 por folha', feita: feito.t4,
      onde: 'Word → guia Arquivo → Imprimir',
      passos: [
        'Abra relatorio-da-unidade.docx com dois cliques, ou pelo menu Iniciar.',
        'No Word, guia Arquivo → "Imprimir", na faixa azul da esquerda.',
        'Ao lado do botão Imprimir, ponha Cópias em 3.',
        'Em Configurações, na lista Agrupamento, escolha "Agrupado" — repare no 1,2,3 1,2,3 embaixo dela.',
        'Qualidade de impressão: Alta. Tamanho: Ajustar à Página. Páginas por folha: 2 Páginas por Folha.',
        'A linha embaixo diz quantas folhas vão sair. Confira e clique em Imprimir.',
      ],
    },
  ];

  const acoes = (
    <button onClick={registrar} disabled={!tudoFeito || gravando}
      className="btn-primary text-sm w-full justify-center disabled:opacity-50">
      {gravando ? 'Guardando…' : tudoFeito ? 'Concluir o laboratório' : `Faltam ${4 - Object.values(feito).filter(Boolean).length}`}
    </button>
  );

  const caminho = CAMINHO[pasta];

  const Cmd = ({ Ico, dica, onClick, desabilitado, children }: {
    Ico: typeof Folder; dica: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    desabilitado?: boolean; children?: React.ReactNode;
  }) => (
    <button className="win-cmd" onClick={onClick} disabled={desabilitado} title={dica} aria-label={dica}>
      <Ico className="w-4 h-4" />
      {children && <span className="win-rotulo">{children}</span>}
    </button>
  );

  const Raiz = ({ p, Ico, nome, filhos }: {
    p: Pasta; Ico: typeof Folder; nome: string; filhos?: [Pasta, string][];
  }) => (
    <div>
      <div className="flex items-center gap-1 px-1 py-1 rounded cursor-pointer"
        style={{
          paddingLeft: 4, fontSize: 12.5, color: '#1B1B1B',
          background: !filhos?.length && pasta === p ? '#EAEAEA' : 'transparent',
        }}
        onClick={() => irPara(p)}>
        <ChevronDown className="w-3.5 h-3.5 flex-none" style={{ visibility: filhos?.length ? 'visible' : 'hidden' }} />
        <Ico className="w-4 h-4 flex-none" style={{ color: '#5B5B5B' }} />
        <span className="truncate">{nome}</span>
      </div>
      {filhos?.map(([fp, fn]) => (
        <div key={fp} className="flex items-center gap-1 px-1 py-1 rounded cursor-pointer"
          style={{
            paddingLeft: 22, fontSize: 12.5, color: '#1B1B1B',
            background: pasta === fp ? '#EAEAEA' : 'transparent',
          }}
          onClick={() => irPara(fp)}>
          <Folder className="w-4 h-4 flex-none" style={{ color: '#E6B14C' }} />
          <span className="truncate">{fn}</span>
        </div>
      ))}
    </div>
  );

  /* O menu ⋯ do Explorador, que é onde o WinRAR se enfia num Windows de
     verdade — e o mesmo que abre com o botão direito. */
  const opcoesDoMais = () => {
    const um = selecionados.length === 1 ? selecionados[0] : null;
    const soRar = um?.especie === 'rar';
    return (
      <>
        <button disabled={!um} onClick={() => { setMenuMais(null); if (um) abrirItem(um); }}>
          <FolderOpen className="w-3.5 h-3.5" /> Abrir
        </button>
        <div style={{ height: 1, background: '#E0E0E0', margin: '4px 6px' }} />
        <button onClick={() => { setMenuMais(null); pedirCompactacao(); }}>
          <span style={{ display: 'flex', width: 14 }}><IconeWinRAR tamanho={14} /></span>
          Adicionar para o arquivo…
        </button>
        <button disabled={!soRar} onClick={() => { setMenuMais(null); abrir('winrar'); }}>
          <span style={{ display: 'flex', width: 14 }}><IconeWinRAR tamanho={14} /></span>
          Abrir com o WinRAR
        </button>
        <button disabled={!soRar} onClick={() => { setMenuMais(null); setDialogo('extrair'); }}>
          <span style={{ display: 'flex', width: 14 }}><IconeWinRAR tamanho={14} /></span>
          Extrair para "acampamento\"
        </button>
        <div style={{ height: 1, background: '#E0E0E0', margin: '4px 6px' }} />
        <button onClick={() => { setMenuMais(null); naoFazParte('Propriedades'); }}>
          Propriedades
        </button>
      </>
    );
  };

  const abrirMais = (e: React.MouseEvent) => {
    /* Sem parar aqui, o mesmo clique que abre o menu sobe até o window e cai
       no ouvinte que o fecha — abriria e sumiria no mesmo gesto. */
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuMais({ x: Math.min(r.left, window.innerWidth - 240), y: r.bottom + 4 });
  };

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      titulo={lessonTitle}
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={46}
    >
      <style>{CSS_WINDOWS}</style>

      <div className="win-mesa">
        <div className="win-area">
          {/* ── O Explorador, sempre por baixo ── */}
          <div className="win-janela cheia win">
            <BarraDeTitulo
              icone={<Folder className="w-4 h-4" style={{ color: '#E6B14C' }} />}
              nome={NOME_DA_PASTA[pasta]}
              aoAvisar={naoFazParte}
            />

            <div className="win-barra">
              <Cmd Ico={FolderPlus} dica="Nova pasta" onClick={() => naoFazParte('Novo')}>Novo</Cmd>
              <div className="win-sep" />
              <Cmd Ico={Scissors} dica="Recortar (Ctrl+X)" desabilitado={!selecionados.length}
                onClick={() => naoFazParte('Recortar')} />
              <Cmd Ico={Copy} dica="Copiar (Ctrl+C)" desabilitado={!selecionados.length}
                onClick={() => naoFazParte('Copiar')} />
              <Cmd Ico={ClipboardPaste} dica="Colar (Ctrl+V)" desabilitado onClick={() => {}} />
              <Cmd Ico={Pencil} dica="Renomear (F2)" desabilitado={selecionados.length !== 1}
                onClick={() => naoFazParte('Renomear')} />
              <Cmd Ico={Trash2} dica="Excluir (Del)" desabilitado={!selecionados.length} onClick={excluir} />
              <div className="win-sep" />
              <Cmd Ico={ArrowUpDown} dica="Classificar" onClick={() => naoFazParte('O menu Classificar')}>
                Classificar
              </Cmd>
              <Cmd Ico={LayoutGrid} dica="Exibir" onClick={() => naoFazParte('O menu Exibir')}>Exibir</Cmd>
              <Cmd Ico={MoreHorizontal} dica="Ver mais" onClick={abrirMais} />
            </div>

            <div className="win-endereco">
              <button className="win-nav" aria-label="Voltar" disabled onClick={() => {}}>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button className="win-nav" aria-label="Avançar" disabled onClick={() => {}}>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="win-nav" aria-label="Acima"
                disabled={pasta !== 'extraida' && pasta !== 'desenhador'}
                onClick={() => irPara(pasta === 'extraida' ? 'clube' : 'programas')}>
                <ArrowUp className="w-4 h-4" />
              </button>
              <button className="win-nav" aria-label="Atualizar" onClick={() => naoFazParte('Atualizar')}>
                <RotateCw className="w-4 h-4" />
              </button>

              <div className="win-caminho">
                {caminho.map((n, i) => (
                  <span key={n} className="flex items-center flex-shrink-0">
                    {i > 0 && <ChevronRight className="w-3 h-3" style={{ color: '#767676' }} />}
                    <button>{n}</button>
                  </span>
                ))}
              </div>

              <div className="win-busca">
                <Search className="w-3.5 h-3.5" />
                <span className="truncate">Pesquisar em {NOME_DA_PASTA[pasta]}</span>
              </div>
            </div>

            <div className="win-corpo">
              <div className="win-painel">
                <Raiz p="area" Ico={Monitor} nome="Área de Trabalho" />
                <Raiz p="downloads" Ico={Download} nome="Downloads" />
                <Raiz p="clube" Ico={Folder} nome="Documentos" filhos={[['clube', 'Clube']]} />
                <Raiz p="programas" Ico={HardDrive} nome="Este Computador"
                  filhos={[['programas', 'Arquivos de Programas']]} />
              </div>

              <div className="win-lista">
                <div className="win-cabecalhos">
                  <button className="win-c-nome" onClick={() => naoFazParte('Ordenar pela coluna')}>Nome</button>
                  <button className="win-c-data" onClick={() => naoFazParte('Ordenar pela coluna')}>Data de modificação</button>
                  <button className="win-c-tipo" onClick={() => naoFazParte('Ordenar pela coluna')}>Tipo</button>
                  <button className="win-c-tam" onClick={() => naoFazParte('Ordenar pela coluna')}>Tamanho</button>
                </div>

                <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  {itens.length === 0 && (
                    <p style={{ padding: 16, fontSize: 12.5, color: '#767676' }}>Esta pasta está vazia.</p>
                  )}
                  {itens.map(item => (
                    <div
                      key={item.id}
                      className={`win-linha${marcados.has(item.id) ? ' escolhida' : ''}`}
                      onClick={() => alternar(item.id)}
                      onDoubleClick={() => abrirItem(item)}
                      onContextMenu={e => {
                        e.preventDefault();
                        setMarcados(m => (m.has(item.id) ? m : new Set(m).add(item.id)));
                        setMenuMais({ x: Math.min(e.clientX, window.innerWidth - 240), y: e.clientY });
                      }}
                    >
                      <div className="win-c-nome flex items-center gap-2 px-2">
                        {/* A caixinha do Explorador. No Windows ela é opção; aqui
                            é sempre, porque no celular não existe Ctrl para
                            marcar o segundo arquivo. */}
                        <span className={`win-caixa${marcados.has(item.id) ? ' marcada' : ''}`} aria-hidden="true">
                          {marcados.has(item.id) ? '✓' : ''}
                        </span>
                        <IconeDoItem item={item} />
                        <span className="truncate">{item.nome}</span>
                      </div>
                      <span className="win-c-data px-2 truncate" style={{ color: '#5B5B5B' }}>{item.data}</span>
                      <span className="win-c-tipo px-2 truncate" style={{ color: '#5B5B5B' }}>
                        {ROTULO_DO_TIPO[item.especie]}
                      </span>
                      <span className="win-c-tam px-2" style={{ color: '#5B5B5B' }}>
                        {item.mb ? `${brasileiro(item.mb)} MB` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="win-status">
              <span>{itens.length} {itens.length === 1 ? 'item' : 'itens'}</span>
              {selecionados.length > 0 && (
                <span>{selecionados.length} {selecionados.length === 1 ? 'item selecionado' : 'itens selecionados'}</span>
              )}
            </div>
          </div>

          {/* ── As janelas por cima ── */}
          {emFoco === 'winrar' && (
            <JanelaWinRAR
              nomeDoArquivo={nomeDoRar}
              linhas={DENTRO_DO_RAR}
              aoExtrair={() => setDialogo('extrair')}
              aoAvisar={naoFazParte}
              aoMinimizar={() => minimizar('winrar')}
              aoFechar={() => fechar('winrar')}
            />
          )}
          {emFoco === 'editor' && (
            <JanelaEditor
              nome="relatorio-da-unidade.docx"
              pdfPronto={pdfPronto}
              formato={formato}
              aoMudarFormato={setFormato}
              aoSalvar={salvar}
              aoSalvarComo={salvarComo}
              aoExportarPdf={() => concluirPdf('pelo Exportar')}
              imp={imp}
              aoMudarImpressao={setImp}
              aoImprimir={imprimir}
              aoAvisar={naoFazParte}
              aoMinimizar={() => minimizar('editor')}
              aoFechar={() => fechar('editor')}
            />
          )}
          {emFoco === 'config' && (
            <JanelaConfiguracoes
              desenhadorInstalado={programaPresente}
              aoDesinstalar={desinstalar}
              aoAvisar={naoFazParte}
              aoMinimizar={() => minimizar('config')}
              aoFechar={() => fechar('config')}
            />
          )}
          {emFoco === 'navegador' && (
            <JanelaNavegador
              pagina={paginaDoNavegador}
              baixando={baixando}
              baixado={baixado}
              aoEscolher={escolherOrigem}
              aoBaixar={() => { setBaixando(0); setAviso(''); }}
              aoAbrirBaixado={abrirInstalador}
              aoMinimizar={() => minimizar('navegador')}
              aoFechar={() => fechar('navegador')}
            />
          )}
          {emFoco === 'instalador' && (
            <AssistenteDeInstalacao
              aoConcluir={concluirInstalacao}
              aoCancelar={() => {
                fechar('instalador');
                setAviso('Instalação cancelada. Nada foi instalado — o instalador continua em Downloads, e dá para abrir de novo quando quiser.');
              }}
              aoMinimizar={() => minimizar('instalador')}
            />
          )}
          {emFoco === 'desenhador' && (
            <JanelaDesenhador
              aoMinimizar={() => minimizar('desenhador')}
              aoFechar={() => fechar('desenhador')}
            />
          )}

          {/* ── Os diálogos ── */}
          {dialogo === 'compactar' && (
            <DialogoDoWindows
              titulo="Nome e parâmetros do arquivo"
              acoes={<>
                <button className="win-bt primario" onClick={compactar}>OK</button>
                <button className="win-bt" onClick={() => setDialogo(null)}>Cancelar</button>
              </>}
            >
              <ControlesDeCompactar
                nome={nomeDoRar} aoMudarNome={setNomeDoRar}
                formato={formatoDoRar} aoMudarFormato={f => {
                  setFormatoDoRar(f);
                  setNomeDoRar(n => n.replace(/\.(rar|zip)$/, `.${f}`));
                }}
                apagar={apagarDepois} aoMudarApagar={setApagarDepois}
              />
            </DialogoDoWindows>
          )}

          {dialogo === 'extrair' && (
            <DialogoDoWindows
              titulo="Caminho e opções de extração"
              acoes={<>
                <button className="win-bt primario" onClick={extrair}>OK</button>
                <button className="win-bt" onClick={() => setDialogo(null)}>Cancelar</button>
              </>}
            >
              <ControlesDeExtrair destino="C:\Documentos\Clube\acampamento" />
            </DialogoDoWindows>
          )}

          {dialogo === 'uac' && (
            <AvisoDeContaDeUsuario
              arquivo={INSTALADOR}
              aoPermitir={() => { setDialogo(null); abrir('instalador'); }}
              aoRecusar={() => {
                setDialogo(null);
                setAviso('Sem essa permissão nenhum instalador roda — é ela que separa mexer nos seus arquivos de mexer no sistema. Repare que ela mostra quem assinou o arquivo: quando disser "Editor desconhecido", pense duas vezes.');
              }}
            />
          )}

          {/* ── O menu ⋯ ── */}
          {menuMais && (
            <div className="win-menu" style={{ left: menuMais.x, top: menuMais.y }}
              onClick={e => e.stopPropagation()}>
              {opcoesDoMais()}
            </div>
          )}

          {/* ── O menu Iniciar ── */}
          {iniciar && (
            <div className="win-iniciar" onClick={e => e.stopPropagation()}>
              <p style={{ fontSize: 11.5, color: '#5B5B5B', padding: '2px 10px 6px' }}>Todos os aplicativos</p>
              <button onClick={() => abrir('navegador')}>
                <Globe className="w-4 h-4" style={{ color: '#0F6CBD' }} /> Navegador Web
              </button>
              <button onClick={() => abrir('editor')}>
                <FileText className="w-4 h-4" style={{ color: '#1F6FB2' }} /> Editor de Texto
              </button>
              <button onClick={() => abrir('config')}>
                <Settings className="w-4 h-4" style={{ color: '#0F6CBD' }} /> Configurações
              </button>
              <button onClick={() => (rarCriado ? abrir('winrar') : naoFazParte('O WinRAR sem arquivo aberto'))}>
                <IconeWinRAR /> WinRAR
              </button>
              {/* Só aparece se o atalho do Menu Iniciar tiver sido marcado no
                  assistente. É a consequência de uma caixinha que quase ninguém
                  lê — e agora dá para ver o efeito dela. */}
              {programaPresente && escolhas?.atalhoNoMenu && (
                <button onClick={() => abrir('desenhador')}>
                  <Palette className="w-4 h-4" style={{ color: '#C0392B' }} /> Desenhador
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── A barra de tarefas ── */}
        <div className="win-tarefas">
          <button aria-label="Iniciar" title="Iniciar"
            onClick={e => { e.stopPropagation(); setIniciar(a => !a); setMenuMais(null); }}>
            <Grid2x2 className="w-5 h-5" style={{ color: '#0F6CBD' }} />
          </button>
          <button aria-label="Explorador de Arquivos" title="Explorador de Arquivos"
            className="aberta" onClick={() => { setMinimizados(new Set(abertos)); }}>
            <Folder className="w-5 h-5" style={{ color: '#E6B14C' }} />
          </button>
          {abertos.map(p => {
            const [rotulo, Desenho] = ({
              winrar: ['WinRAR', () => <IconeWinRAR tamanho={20} />] as const,
              editor: ['Editor de Texto', () => <FileText className="w-5 h-5" style={{ color: '#1F6FB2' }} />] as const,
              config: ['Configurações', () => <Settings className="w-5 h-5" style={{ color: '#0F6CBD' }} />] as const,
              navegador: ['Navegador Web', () => <Globe className="w-5 h-5" style={{ color: '#0F6CBD' }} />] as const,
              instalador: ['Instalar - Desenhador', () => <AppWindow className="w-5 h-5" style={{ color: '#5B5B5B' }} />] as const,
              desenhador: ['Desenhador', () => <Palette className="w-5 h-5" style={{ color: '#C0392B' }} />] as const,
            })[p];
            return (
              <button key={p} aria-label={rotulo} title={rotulo} className="aberta"
                onClick={() => (emFoco === p ? minimizar(p) : abrir(p))}>
                <Desenho />
              </button>
            );
          })}
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
