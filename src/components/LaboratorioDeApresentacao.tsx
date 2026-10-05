import { useEffect, useMemo, useState } from 'react';
import {
  AlignLeft, Baseline, ChevronDown, ChevronUp, Copy, FileDown, FileText,
  Image as ImageIcon, LayoutTemplate, Layers, Minimize2, Monitor, NotebookPen,
  Palette, Play, Plus, RotateCcw, Shrink, Sun, Table2, Trash2, Type, UserSquare2,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import { Cartao, CampoLongo, Escolha } from '../labs/caderno';
import { DesenhoDoGrafico } from '../labs/excel';
import {
  AchadoDoPainel, AvisoDoMestre, BarraDeTituloDoPowerPoint, BotaoDoPowerPoint,
  CSS_POWERPOINT, CampoDoMestre, DialogoDoPowerPoint, FolhaDoSlide,
  GrupoDoPowerPoint, GuiasDoPowerPoint, ItemDeMenuDoPowerPoint, MenuDoPowerPoint,
  PainelDeNotas, PainelDoPowerPoint, ReguaDoPowerPoint,
  SeletorDeCorDoPowerPoint, TelaDeApresentacao,
} from '../labs/powerpoint';
import {
  NOMES_DOS_LAYOUTS, aplicarLayout, compactarImagem, limparFormatacaoDireta,
  palavrasDoSlide, pesoEmMegabytes, pixelsQueAProjecaoPede, resolucaoDaImagem,
  slideNovo, vazio,
  type Apresentacao, type Layout, type Slide,
} from '../labs/apresentacao';
import {
  CONTRASTE_MINIMO, IDEIAS_ESSENCIAIS, IMAGENS_DO_CLUBE, OURO_DO_CLUBE,
  PLANILHA_DOS_CUSTOS, VERDE_DO_CLUBE, umaImagemDoClube,
} from '../labs/apresentacaoDoAcampamento';
import {
  CHAVE_DA_SALA_CLARA, CHAVE_DO_APRESENTADOR, CHAVE_DO_GRAFICO, CHAVE_DO_PESO,
  CHAVE_DO_PULO, CHAVE_DO_ROTEIRO, ERROS_FREQUENTES, METAS_DA_LICAO,
  OPCOES_DE_EFEITO, OPCOES_DE_ERRO, PARTIDA_DA_LICAO, TETO_DE_MEGABYTES,
  minutosDeFala,
  type ContextoDaApresentacao, type LicaoDaCcEs011,
} from '../labs/metasDaCcEs011';
import { contrastRatio } from '../lib/imageTools';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';
import { roteiroDaApresentacao } from '../labs/roteiroDaApresentacao';

/*
 * Os dez laboratórios da CC-ES011, num componente só.
 *
 * Eles abrem a mesma apresentação e usam os mesmos comandos: o que muda é de
 * que estado se parte e o que se cobra. Dez componentes seriam dez PowerPoint,
 * que é a razão de `powerpoint.tsx` existir — é o arranjo do
 * `LaboratorioDePlanilha` sobre `excel.tsx` e do `LaboratorioDeExplorador`
 * sobre `explorer.tsx`, pelo motivo escrito nos dois.
 *
 * ── Onde cada coisa mora ─────────────────────────────────────────────────
 * O que é do **programa** está em `powerpoint.tsx`. O que é da **plataforma**
 * — o caderno, e o botão que mostra o slide no telão da sala com a luz acesa —
 * fica no painel de tarefas, onde as coisas da plataforma moram: é a decisão
 * do caderno da CC-ES009, e nenhum programa simula projetor.
 */

type Tela = 'normal' | 'mestre' | 'telao' | 'bastidores' | 'caderno' | 'planilha';

/**
 * As linhas do fim que ficaram vazias saem.
 *
 * Apertar Enter no fim da lista cria uma linha vazia, e no PowerPoint ela é um
 * tópico — vazio, mas um. Guardá-la faria o teto de seis estourar por uma
 * linha que ninguém vê, e a tarefa ficaria vermelha sem nada na tela
 * explicando. As do meio ficam: linha em branco entre dois tópicos é escolha
 * de quem escreve.
 */
function semVaziosNoFim(linhas: string[]): string[] {
  const fim = [...linhas];
  while (fim.length > 0 && fim[fim.length - 1].trim() === '') fim.pop();
  return fim;
}

const USAVEIS = ['Página Inicial', 'Inserir', 'Design', 'Revisão', 'Apresentação de Slides', 'Exibir'];

/** Os tons que a coluna do seletor de cor oferece de cada cor do clube. */
const TONS_DO_OURO = [
  { hex: OURO_DO_CLUBE, nome: 'Ouro do clube' },
  { hex: '#A8871F', nome: 'Ouro do clube, 25% mais escuro' },
  { hex: '#8A6D0B', nome: 'Ouro do clube, 50% mais escuro' },
  { hex: '#000000', nome: 'Preto, texto 1' },
];
const TONS_DO_VERDE = [
  { hex: VERDE_DO_CLUBE, nome: 'Verde do clube' },
  { hex: '#4ECB71', nome: 'Verde do clube, 40% mais claro' },
  { hex: '#147A39', nome: 'Verde do clube, 25% mais escuro' },
  { hex: '#0E5C2C', nome: 'Verde do clube, 50% mais escuro' },
  { hex: '#333333', nome: 'Cinza-escuro, texto 2' },
];

/** Em qual lição o caderno existe — e nas outras ele não se oferece. */
const TEM_CADERNO: Record<LicaoDaCcEs011, boolean> = {
  'mestre': false, 'layout': false, 'hierarquia': false, 'contraste': false,
  'erros': true, 'imagens': false, 'grafico': false, 'notas': false,
  'corte': true, 'cinco-minutos': true,
};

/** E em qual a planilha de custos abre, que é a que precisa de barra de tarefas. */
const TEM_PLANILHA: Record<LicaoDaCcEs011, boolean> = {
  'mestre': false, 'layout': false, 'hierarquia': false, 'contraste': false,
  'erros': false, 'imagens': false, 'grafico': true, 'notas': false,
  'corte': false, 'cinco-minutos': false,
};

export default function LaboratorioDeApresentacao({ vereda, licao: daLicao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'apresentacao' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licao = daLicao.licao;
  const [ctx, setCtx] = useState<ContextoDaApresentacao>(() => PARTIDA_DA_LICAO[licao]());
  const [salvando, setSalvando] = useState(false);
  const [tela, setTela] = useState<Tela>('normal');
  const [guia, setGuia] = useState('Página Inicial');
  const [atual, setAtual] = useState(0);
  const [menu, setMenu] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [notasAbertas, setNotasAbertas] = useState(false);
  const [painel, setPainel] = useState<'nenhum' | 'acessibilidade' | 'imagem'>('nenhum');
  const [luz, setLuz] = useState(false);
  const [apresentador, setApresentador] = useState(false);
  const [ppiEscolhido, setPpi] = useState(150);

  const { ap } = ctx;
  const slide = ap.slides[Math.min(atual, ap.slides.length - 1)];
  const metas = METAS_DA_LICAO[licao];

  const tarefas = metas.filter(m => daLicao.verificacoes.includes(m.id)).map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde,
    passos: m.passos, feita: m.feita(ctx),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  const fecharMenu = () => setMenu(null);
  const abrir = (id: string) => setMenu(m => (m === id ? null : id));
  const avisar = (recado: string) => { fecharMenu(); setAviso(recado); };
  const naoFazParte = (nome: string) => avisar(
    `${nome} existe no PowerPoint de verdade, e está aqui para a faixa ficar igual — mas não faz parte deste exercício.`);

  const mudarAp = (f: (a: Apresentacao) => Apresentacao) =>
    setCtx(c => ({ ...c, ap: f(c.ap) }));
  const mudarSlide = (id: string, m: Partial<Slide>) =>
    mudarAp(a => ({ ...a, slides: a.slides.map(s => (s.id === id ? { ...s, ...m } : s)) }));
  const descobrir = (chave: string) => setCtx(c => (
    c.descobertas.includes(chave) ? c : { ...c, descobertas: [...c.descobertas, chave] }));
  const mudarCaderno = (f: (k: ContextoDaApresentacao['caderno']) => ContextoDaApresentacao['caderno']) =>
    setCtx(c => ({ ...c, caderno: f(c.caderno) }));

  /*
    Sair da apresentação pelo Esc, que é a tecla que o PowerPoint usa.

    Sem ela, quem entra no telão fica sem saída de teclado — e quem navega por
    teclado não tem como voltar. O ouvinte sai quando a tela sai: um ouvinte
    que sobrevivesse chamaria `setTela` depois do desmonte.
  */
  /*
    Passar de um slide para o outro é onde o título pula.

    A descoberta não sai de entrar na apresentação: ela sai de **ver dois
    slides seguidos** cujo título está em alturas diferentes. Marcá-la na
    entrada premiaria o clique e não a observação, que é o contrário do que o
    requisito 4.2 ensina — e é a decisão das `descobertas` da CC-ES004.
  */
  const alturaDoTitulo = (s: Slide) => s.caixas.find(c => c.papel === 'titulo')?.y;

  const irPara = (j: number) => {
    const destino = Math.max(0, Math.min(j, ap.slides.length - 1));
    if (tela === 'telao' && destino !== atual) {
      const ya = alturaDoTitulo(ap.slides[atual]);
      const yb = alturaDoTitulo(ap.slides[destino]);
      if (ya !== undefined && yb !== undefined && Math.abs(ya - yb) > 0.5) {
        descobrir(CHAVE_DO_PULO);
      }
    }
    setAtual(destino);
  };

  /*
    Sem lista de dependências, de propósito: o ouvinte lê o slide **de agora**.

    Com `[tela]`, ele ficaria preso ao `atual` da renderização em que foi
    montado, e a seta direita andaria um slide e pararia — a tecla parecendo
    quebrada, sem nada estourar. É a irmã do Enter que deixava o cursor no
    parágrafo de cima na CC-ES006.
  */
  useEffect(() => {
    if (tela !== 'telao') return;
    const aoTeclar = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setTela('normal');
      if (ev.key === 'ArrowRight' || ev.key === ' ') irPara(atual + 1);
      if (ev.key === 'ArrowLeft') irPara(atual - 1);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  });

  /* ── Comandos ─────────────────────────────────────────────────────────── */

  const criarSlide = (l: Layout) => {
    fecharMenu();
    const novo = slideNovo(`n${Date.now()}`, l);
    mudarAp(a => ({ ...a, slides: [...a.slides.slice(0, atual + 1), novo, ...a.slides.slice(atual + 1)] }));
    setAtual(atual + 1);
  };

  const trocarLayout = (l: Layout) => {
    fecharMenu();
    mudarSlide(slide.id, aplicarLayout(slide, l));
    setAviso(slide.caixas.length > 0
      ? `O texto foi para o espaço reservado do layout ${NOMES_DOS_LAYOUTS[l]}, e a caixa desenhada deixou de existir.`
      : `Layout ${NOMES_DOS_LAYOUTS[l]} aplicado.`);
  };

  const duplicar = () => {
    fecharMenu();
    const copia = { ...slide, id: `c${Date.now()}` };
    mudarAp(a => ({ ...a, slides: [...a.slides.slice(0, atual + 1), copia, ...a.slides.slice(atual + 1)] }));
    setAtual(atual + 1);
  };

  const excluir = () => {
    fecharMenu();
    if (ap.slides.length === 1) { setAviso('A apresentação tem de ter ao menos um slide.'); return; }
    const saiu = slide.id;
    mudarAp(a => ({ ...a, slides: a.slides.filter(s => s.id !== saiu) }));
    setAtual(Math.max(0, atual - 1));
    setAviso(vazio(slide)
      ? 'O slide vazio saiu.'
      : 'O slide saiu. Se ele dizia algo que a família precisa, aquilo precisa estar em outro slide.');
  };

  const mover = (d: number) => {
    fecharMenu();
    const i = atual;
    const j = i + d;
    if (j < 0 || j >= ap.slides.length) return;
    const slides = [...ap.slides];
    [slides[i], slides[j]] = [slides[j], slides[i]];
    mudarAp(a => ({ ...a, slides }));
    setAtual(j);
  };

  const limparFormatacao = () => {
    fecharMenu();
    mudarAp(a => ({ ...a, slides: a.slides.map(limparFormatacaoDireta) }));
    setAviso('A formatação aplicada à mão saiu dos dezesseis. Agora o que vale é o mestre.');
  };

  const inserirImagem = (arquivo: string) => {
    setDialogo(null);
    mudarSlide(slide.id, {
      imagens: [...slide.imagens.filter(i => i.legenda !== 'logo-clube.png'),
        umaImagemDoClube(`i${Date.now()}`, arquivo, 40)],
    });
  };

  const trocarImagem = (idDaImagem: string, arquivo: string) => {
    setDialogo(null);
    mudarSlide(slide.id, {
      imagens: slide.imagens.map(i => (
        i.id === idDaImagem ? umaImagemDoClube(i.id, arquivo, i.largura) : i
      )),
    });
    setAviso(`A imagem passou a ser ${arquivo}.`);
  };

  const compactarTodas = () => {
    setDialogo(null);
    mudarAp(a => ({
      ...a,
      slides: a.slides.map(s => ({ ...s, imagens: s.imagens.map(i => compactarImagem(i, ppiEscolhido)) })),
    }));
    setAviso(`As imagens foram compactadas a ${ppiEscolhido} ppi. Isto não volta.`);
  };

  const colarGrafico = (como: 'imagem' | 'vinculado' | 'incorporado') => {
    fecharMenu();
    mudarSlide(slide.id, {
      grafico: {
        id: `g${Date.now()}`, como, planilha: PLANILHA_DOS_CUSTOS,
        retrato: ctx.custos.map(x => ({ ...x })),
      },
    });
    setAviso(como === 'imagem'
      ? 'O gráfico entrou como imagem. Ele mostra os números de agora, e vai mostrar estes mesmos no ano que vem.'
      : 'O gráfico entrou ligado à planilha.');
  };

  const exportarPdf = () => {
    fecharMenu();
    mudarAp(a => ({ ...a, pdf: a.slides.map(s => s.id) }));
    setTela('normal');
    setAviso(`PDF criado com ${ap.slides.length} slides.`);
  };

  /* ── O que a planilha de custos faz, quando ela existe ────────────────── */

  const mudarCusto = (rotulo: string, valor: number) => {
    setCtx(c => ({ ...c, custos: c.custos.map(x => (x.rotulo === rotulo ? { ...x, valor } : x)) }));
    /*
      E o gráfico ligado acompanha: o retrato dele passa a ser o de agora.

      É aqui que a diferença do requisito 4.4 acontece — a imagem fica com o
      retrato de quando foi colada, e os outros dois seguem.
    */
    mudarAp(a => ({
      ...a,
      slides: a.slides.map(s => (
        s.grafico && s.grafico.como !== 'imagem'
          ? {
            ...s,
            grafico: {
              ...s.grafico,
              retrato: ctx.custos.map(x => (x.rotulo === rotulo ? { ...x, valor } : { ...x })),
            },
          }
          : s
      )),
    }));
    if (ap.slides.some(s => s.grafico)) descobrir(CHAVE_DO_GRAFICO);
  };

  /* ── O que o painel lateral relata ────────────────────────────────────── */

  const achadosDeAcessibilidade = useMemo(() => {
    const achados: { tom: 'aviso' | 'bom'; diz: string }[] = [];
    const t = contrastRatio(ap.mestre.corDoTitulo, ap.mestre.corDoFundo);
    const c = contrastRatio(ap.mestre.corDoCorpo, ap.mestre.corDoFundo);
    const escrever = (onde: string, razao: number) => (razao < CONTRASTE_MINIMO
      ? { tom: 'aviso' as const, diz: `Texto com contraste insuficiente: ${onde}, ${razao.toFixed(2).replace('.', ',')}:1` }
      : { tom: 'bom' as const, diz: `${onde}: ${razao.toFixed(2).replace('.', ',')}:1` });
    achados.push(escrever('título do slide mestre', t));
    achados.push(escrever('corpo do slide mestre', c));
    const semTitulo = ap.slides.filter(s => s.layout !== 'em-branco' && s.titulo.trim() === '').length;
    if (semTitulo > 0) {
      achados.push({ tom: 'aviso', diz: `${semTitulo} slide(s) sem título` });
    }
    return achados;
  }, [ap]);

  const achadosDaImagem = useMemo(() => slide.imagens.map(img => {
    const pede = pixelsQueAProjecaoPede(img.largura);
    const estado = resolucaoDaImagem(img);
    return {
      id: img.id,
      arquivo: img.legenda,
      diz: `${img.pixelsLargura} × ${img.pixelsAltura} px, ocupando ${img.largura}% do slide`
        + ` — a projeção usa ${pede} px de largura`,
      tom: estado === 'adequada' ? ('bom' as const) : ('aviso' as const),
    };
  }), [slide]);

  const roteiro = useMemo(() => roteiroDaApresentacao(ap), [ap]);

  const recomecar = () => {
    setCtx(PARTIDA_DA_LICAO[licao]());
    setTela('normal');
    setAtual(0);
    setPainel('nenhum');
    setLuz(false);
    setApresentador(false);
    setAviso('A apresentação voltou ao que era.');
  };

  /* ── O painel de tarefas, que é da plataforma ─────────────────────────── */

  const acoes = (
    <div className="flex flex-col gap-2">
      {/*
        O telão com a luz da sala é da **plataforma**, e por isso mora aqui.

        Nenhum programa simula projetor: um botão disso na faixa poria coisa
        nossa dentro do PowerPoint, que é o contrário do que a moldura existe
        para fazer. É a decisão do caderno da CC-ES009.
      */}
      <button
        onClick={() => { setTela('telao'); setLuz(true); setApresentador(false); descobrir(CHAVE_DA_SALA_CLARA); }}
        className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1"
      >
        <Sun className="w-3 h-3" /> Ver no telão, com luz na sala
      </button>
      {TEM_CADERNO[licao] && (
        <button
          onClick={() => {
            if (tela !== 'caderno' && licao === 'cinco-minutos') descobrir(CHAVE_DO_ROTEIRO);
            setTela(t => (t === 'caderno' ? 'normal' : 'caderno'));
          }}
          className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1"
        >
          <NotebookPen className="w-3 h-3" />
          {tela === 'caderno' ? 'Voltar à apresentação' : 'Abrir o caderno'}
        </button>
      )}
      <button
        onClick={async () => { setSalvando(true); await aoVencer(); aoSair(); }}
        disabled={!tudoFeito || salvando}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50"
      >
        {tudoFeito ? 'Concluir a lição' : `Faltam ${tarefas.filter(t => !t.feita).length}`}
      </button>
      <button
        onClick={recomecar}
        className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1"
      >
        <RotateCcw className="w-3 h-3" /> Recomeçar
      </button>
    </div>
  );

  const desenharGrafico = (g: { retrato: { rotulo: string; valor: number }[] }) => (
    <DesenhoDoGrafico tipo="pizza" pontos={g.retrato} altura={78} />
  );

  const folhaDoSlide = (s: Slide, mini = false) => (
    <FolhaDoSlide
      slide={s} mestre={ap.mestre} mini={mini}
      numero={ap.slides.findIndex(x => x.id === s.id) + 1}
      desenharGrafico={desenharGrafico}
      nomeDoAudio="hino-do-clube.mp3"
    />
  );

  /* ── A tela ───────────────────────────────────────────────────────────── */

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={daLicao.titulo}
      programa="powerpoint"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_POWERPOINT}</style>

      <div className="pp-janela" onClick={fecharMenu}>
        <BarraDeTituloDoPowerPoint
          arquivo="Acampamento de Inverno 2026" aoAvisar={avisar} aoNaoFazParte={naoFazParte}
        />

        {tela === 'telao' && (
          <TelaDeApresentacao
            slide={slide} mestre={ap.mestre} numero={atual + 1} total={ap.slides.length}
            luz={luz} apresentador={apresentador}
            aoAvancar={() => irPara(atual + 1)}
            aoVoltar={() => irPara(atual - 1)}
            aoSair={() => setTela('normal')}
            desenharGrafico={desenharGrafico} nomeDoAudio="hino-do-clube.mp3"
          />
        )}

        {tela === 'bastidores' && (
          <div className="pp-bastidores">
            <nav className="pp-rail" aria-label="Arquivo">
              <button type="button" onClick={() => setTela('normal')} aria-label="Voltar para a apresentação">
                ← Voltar
              </button>
              <button type="button" onClick={() => { descobrir(CHAVE_DO_PESO); setDialogo('informacoes'); }}>
                Informações
              </button>
              <button type="button" onClick={exportarPdf}>Exportar</button>
              <button type="button" onClick={() => naoFazParte('Salvar como')}>Salvar como</button>
              <button type="button" onClick={() => naoFazParte('Imprimir')}>Imprimir</button>
            </nav>
            <div className="pp-bast-corpo">
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Informações</h3>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 14px', fontSize: 12.5 }}>
                <dt style={{ color: '#605E5C' }}>Nome</dt>
                <dd>Acampamento de Inverno 2026.pptx</dd>
                <dt style={{ color: '#605E5C' }}>Slides</dt>
                <dd>{ap.slides.length}</dd>
                <dt style={{ color: '#605E5C' }}>Tamanho</dt>
                <dd>{pesoEmMegabytes(ap).toFixed(1).replace('.', ',')} MB</dd>
                <dt style={{ color: '#605E5C' }}>PDF</dt>
                <dd>{ap.pdf ? `criado com ${ap.pdf.length} slides` : 'nenhum'}</dd>
              </dl>
              <div className="mt-4">
                <button type="button" className="pp-bt-dialogo" data-principal="sim" onClick={exportarPdf}>
                  <FileDown className="w-3.5 h-3.5 inline" /> Criar Documento PDF/XPS
                </button>
              </div>
            </div>
          </div>
        )}

        {tela === 'caderno' && (
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: 'var(--color-bg)', padding: 16 }}>
            {licao === 'erros' && (
              <div className="flex flex-col gap-4">
                {ERROS_FREQUENTES.map(e => {
                  const resposta = ctx.caderno.erros[e.id];
                  const erradoDoErro = resposta && resposta.erro !== e.erro
                    ? OPCOES_DE_ERRO.find(o => o.diz === resposta.erro)?.porque ?? null
                    : null;
                  const erradoDoEfeito = resposta && resposta.efeito !== e.efeito
                    ? OPCOES_DE_EFEITO.find(o => o.diz === resposta.efeito)?.porque ?? null
                    : null;
                  const acertou = resposta?.erro === e.erro && resposta?.efeito === e.efeito;
                  return (
                    <Cartao key={e.id} titulo={`O slide "${e.slide}" como a sala o vê`}
                      abaixo="Olhe o slide no telão antes de responder.">
                      <div className="flex flex-col gap-3">
                        <div style={{ maxWidth: 360 }}>
                          <FolhaDoSlide
                            slide={PARTIDA_DA_LICAO[licao]().ap.slides.find(s => s.id === e.slide)
                              ?? slide}
                            mestre={ap.mestre}
                          />
                        </div>
                        <p className="text-sm font-semibold">O que está errado nele?</p>
                        <Escolha
                          opcoes={OPCOES_DE_ERRO.map(o => ({ id: o.diz, rotulo: o.diz }))}
                          escolhida={resposta?.erro}
                          porque={erradoDoErro}
                          aoEscolher={diz => mudarCaderno(k => ({
                            ...k,
                            erros: { ...k.erros, [e.id]: { erro: diz, efeito: k.erros[e.id]?.efeito ?? '' } },
                          }))}
                        />
                        <p className="text-sm font-semibold">E o que isso faz com quem assiste?</p>
                        <Escolha
                          opcoes={OPCOES_DE_EFEITO.map(o => ({ id: o.diz, rotulo: o.diz }))}
                          escolhida={resposta?.efeito}
                          porque={erradoDoEfeito}
                          aoEscolher={diz => mudarCaderno(k => ({
                            ...k,
                            erros: { ...k.erros, [e.id]: { erro: k.erros[e.id]?.erro ?? '', efeito: diz } },
                          }))}
                        />
                        {/*
                          A saída só aparece **depois** de classificar.

                          Antes, ela diria a resposta: é a mutação que a CC-ES010
                          achou em três lições, onde o `porque` de cada achado
                          aparecia antes da escolha e transformava a tarefa em
                          leitura.
                        */}
                        {acertou && (
                          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{e.saida}</p>
                        )}
                        <CampoLongo
                          rotulo="O que você faria em vez disso?"
                          valor={ctx.caderno.emVezDisso[e.id] ?? ''} minimo={25}
                          aoEscrever={t => mudarCaderno(k => ({
                            ...k, emVezDisso: { ...k.emVezDisso, [e.id]: t },
                          }))}
                        />
                      </div>
                    </Cartao>
                  );
                })}
              </div>
            )}

            {licao === 'corte' && (
              <Cartao titulo="Por que cada slide saiu"
                abaixo="O requisito pede a justificativa por escrito. Diga também onde o conteúdo dele ficou.">
                <div className="flex flex-col gap-3">
                  {PARTIDA_DA_LICAO.corte().ap.slides
                    .filter(s => !ap.slides.some(x => x.id === s.id))
                    .map(s => (
                      <CampoLongo
                        key={s.id} rotulo={`"${s.titulo || '(slide vazio)'}" — por que saiu?`}
                        valor={ctx.caderno.cortes.find(x => x.slide === s.id)?.porque ?? ''}
                        minimo={20}
                        aoEscrever={t => mudarCaderno(k => ({
                          ...k,
                          cortes: [...k.cortes.filter(x => x.slide !== s.id), { slide: s.id, porque: t }],
                        }))}
                      />
                    ))}
                  {ap.slides.length === PARTIDA_DA_LICAO.corte().ap.slides.length && (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      Nenhum slide saiu ainda. Exclua um e ele aparece aqui para justificar.
                    </p>
                  )}
                  <div>
                    <p className="text-sm font-semibold mb-1">As dez informações que não podem sair</p>
                    <ul className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {IDEIAS_ESSENCIAIS.map(i => <li key={i.id}>· {i.diz}</li>)}
                    </ul>
                  </div>
                </div>
              </Cartao>
            )}

            {licao === 'cinco-minutos' && (
              <div className="flex flex-col gap-4">
                <Cartao titulo="Roteiro"
                  abaixo={`No ritmo de quem explica, isto leva ${minutosDeFala(ap).toFixed(1).replace('.', ',')} minutos.`}>
                  <ol className="flex flex-col gap-2 text-sm">
                    {roteiro.map(f => (
                      <li key={f.slide} className="flex gap-2">
                        <span style={{ color: 'var(--color-text-dim)' }}>{f.numero}.</span>
                        <span>{f.frase} <span style={{ color: 'var(--color-text-dim)' }}>({f.segundos}s)</span></span>
                      </li>
                    ))}
                  </ol>
                </Cartao>
                <Cartao titulo="A sua abertura"
                  abaixo="A primeira frase é a única que vale decorar — ela é a que trava se não estiver pronta.">
                  <CampoLongo
                    rotulo="Com que frase você vai abrir?" valor={ctx.caderno.abertura} minimo={25}
                    aoEscrever={t => mudarCaderno(k => ({ ...k, abertura: t }))}
                  />
                </Cartao>
              </div>
            )}
          </div>
        )}

        {tela === 'mestre' && (
          <>
            <AvisoDoMestre />
            <div className="pp-faixa" onClick={ev => ev.stopPropagation()}>
              <GrupoDoPowerPoint nome="Título">
                <div className="flex flex-col">
                  <CampoDoMestre rotulo="Fonte">
                    <select value={ap.mestre.fonteDoTitulo} aria-label="Fonte do título"
                      onChange={e => mudarAp(a => ({ ...a, mestre: { ...a.mestre, fonteDoTitulo: e.target.value } }))}>
                      <option value="">(a do programa)</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Calibri">Calibri</option>
                      <option value="Arial">Arial</option>
                    </select>
                  </CampoDoMestre>
                  <CampoDoMestre rotulo="Tamanho">
                    <input type="number" min={12} max={80} value={ap.mestre.tamanhoDoTitulo}
                      aria-label="Tamanho do título" style={{ width: 56 }}
                      onChange={e => mudarAp(a => ({
                        ...a, mestre: { ...a.mestre, tamanhoDoTitulo: Number(e.target.value) },
                      }))} />
                  </CampoDoMestre>
                  <CampoDoMestre rotulo="Cor">
                    <SeletorDeCorDoPowerPoint
                      tons={TONS_DO_OURO} escolhida={ap.mestre.corDoTitulo} rotulo="Cor do título"
                      aoEscolher={hex => mudarAp(a => ({ ...a, mestre: { ...a.mestre, corDoTitulo: hex } }))}
                    />
                  </CampoDoMestre>
                </div>
              </GrupoDoPowerPoint>

              <GrupoDoPowerPoint nome="Corpo">
                <div className="flex flex-col">
                  <CampoDoMestre rotulo="Fonte">
                    <select value={ap.mestre.fonteDoCorpo} aria-label="Fonte do corpo"
                      onChange={e => mudarAp(a => ({ ...a, mestre: { ...a.mestre, fonteDoCorpo: e.target.value } }))}>
                      <option value="">(a do programa)</option>
                      <option value="Calibri">Calibri</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Arial">Arial</option>
                    </select>
                  </CampoDoMestre>
                  <CampoDoMestre rotulo="Tamanho">
                    <input type="number" min={10} max={60} value={ap.mestre.tamanhoDoCorpo}
                      aria-label="Tamanho do corpo" style={{ width: 56 }}
                      onChange={e => mudarAp(a => ({
                        ...a, mestre: { ...a.mestre, tamanhoDoCorpo: Number(e.target.value) },
                      }))} />
                  </CampoDoMestre>
                  <CampoDoMestre rotulo="Cor">
                    <SeletorDeCorDoPowerPoint
                      tons={TONS_DO_VERDE} escolhida={ap.mestre.corDoCorpo} rotulo="Cor do corpo"
                      aoEscolher={hex => mudarAp(a => ({ ...a, mestre: { ...a.mestre, corDoCorpo: hex } }))}
                    />
                  </CampoDoMestre>
                </div>
              </GrupoDoPowerPoint>

              <GrupoDoPowerPoint nome="Inserir no mestre">
                <BotaoDoPowerPoint dica="Logo do clube" rotulo="Logo" empilhado
                  ativo={ap.mestre.logo}
                  aoClicar={() => mudarAp(a => ({ ...a, mestre: { ...a.mestre, logo: !a.mestre.logo } }))}>
                  <ImageIcon className="w-5 h-5" />
                </BotaoDoPowerPoint>
                <BotaoDoPowerPoint dica="Número do Slide" rotulo="Número" empilhado
                  ativo={ap.mestre.numeroNoPe}
                  aoClicar={() => mudarAp(a => ({ ...a, mestre: { ...a.mestre, numeroNoPe: !a.mestre.numeroNoPe } }))}>
                  <Baseline className="w-5 h-5" />
                </BotaoDoPowerPoint>
              </GrupoDoPowerPoint>

              <GrupoDoPowerPoint nome="Fechar">
                <BotaoDoPowerPoint dica="Fechar Modo de Exibição Mestre" rotulo="Fechar" empilhado
                  aoClicar={() => setTela('normal')}>
                  <Minimize2 className="w-5 h-5" />
                </BotaoDoPowerPoint>
              </GrupoDoPowerPoint>
            </div>

            <div className="pp-corpo">
              <div className="pp-palco" onClick={ev => ev.stopPropagation()}>
                <div style={{ width: '100%', maxWidth: 620 }}>
                  {/*
                    O mestre se desenha como um slide, porque é isso que ele é —
                    e é aí que mora metade do requisito 4.1: quem não repara no
                    aviso acha que está formatando um slide.
                  */}
                  <FolhaDoSlide
                    slide={{
                      ...slideNovo('mestre', 'titulo-conteudo'),
                      titulo: 'Estilo do título mestre',
                      topicos: ['Editar os estilos do texto mestre', 'Segundo nível', 'Terceiro nível'],
                    }}
                    mestre={ap.mestre} numero={1}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {tela === 'planilha' && (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#F3F2F1' }}>
            <div style={{
              background: '#217346', color: '#FFFFFF', padding: '6px 10px', fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Table2 className="w-4 h-4" />
              <span style={{ fontWeight: 600 }}>{PLANILHA_DOS_CUSTOS}</span>
              <span style={{ opacity: .85 }}>— Excel</span>
            </div>
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 14 }}>
              <table style={{ borderCollapse: 'collapse', fontSize: 12.5, background: '#FFFFFF' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #D0D0D0', background: '#F3F2F1', padding: '3px 10px' }}>A</th>
                    <th style={{ border: '1px solid #D0D0D0', background: '#F3F2F1', padding: '3px 10px' }}>B</th>
                  </tr>
                </thead>
                <tbody>
                  {ctx.custos.map(c => (
                    <tr key={c.rotulo}>
                      <td style={{ border: '1px solid #D0D0D0', padding: '3px 10px' }}>{c.rotulo}</td>
                      <td style={{ border: '1px solid #D0D0D0', padding: '3px 2px' }}>
                        <input
                          type="number" value={c.valor} aria-label={`Valor de ${c.rotulo}`}
                          style={{
                            width: 72, border: 'none', font: 'inherit', fontSize: 12.5,
                            textAlign: 'right', padding: '0 6px', color: '#201F1E', background: 'transparent',
                          }}
                          onChange={e => mudarCusto(c.rotulo, Number(e.target.value))}
                        />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ border: '1px solid #D0D0D0', padding: '3px 10px', fontWeight: 600 }}>Total</td>
                    <td style={{
                      border: '1px solid #D0D0D0', padding: '3px 10px', fontWeight: 600, textAlign: 'right',
                    }}>
                      {ctx.custos.reduce((t, c) => t + c.valor, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: 11.5, color: '#605E5C', marginTop: 10 }}>
                O gráfico desta planilha está selecionado. Em Inserir, no PowerPoint,
                há as opções de colagem.
              </p>
              <div style={{ maxWidth: 260, marginTop: 8, background: '#FFFFFF', padding: 8, border: '1px solid #D0D0D0' }}>
                <DesenhoDoGrafico tipo="pizza" pontos={ctx.custos} altura={90} />
              </div>
            </div>
          </div>
        )}

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
                      <BotaoDoPowerPoint dica="Novo Slide" rotulo="Novo Slide" empilhado
                        aoClicar={() => abrir('novo')}>
                        <Plus className="w-5 h-5" />
                      </BotaoDoPowerPoint>
                      <MenuDoPowerPoint aberto={menu === 'novo'}>
                        {(Object.keys(NOMES_DOS_LAYOUTS) as Layout[]).map(l => (
                          <ItemDeMenuDoPowerPoint key={l} aoClicar={() => criarSlide(l)}>
                            {NOMES_DOS_LAYOUTS[l]}
                          </ItemDeMenuDoPowerPoint>
                        ))}
                      </MenuDoPowerPoint>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <BotaoDoPowerPoint dica="Layout" rotulo="Layout" empilhado
                        aoClicar={() => abrir('layout')}>
                        <LayoutTemplate className="w-5 h-5" />
                      </BotaoDoPowerPoint>
                      <MenuDoPowerPoint aberto={menu === 'layout'}>
                        {(Object.keys(NOMES_DOS_LAYOUTS) as Layout[]).map(l => (
                          <ItemDeMenuDoPowerPoint key={l} ativo={slide.layout === l}
                            aoClicar={() => trocarLayout(l)}>
                            {NOMES_DOS_LAYOUTS[l]}
                          </ItemDeMenuDoPowerPoint>
                        ))}
                      </MenuDoPowerPoint>
                    </div>
                    <BotaoDoPowerPoint dica="Duplicar Slide" aoClicar={duplicar}>
                      <Copy className="w-4 h-4" />
                    </BotaoDoPowerPoint>
                    <BotaoDoPowerPoint dica="Excluir Slide" aoClicar={excluir}>
                      <Trash2 className="w-4 h-4" />
                    </BotaoDoPowerPoint>
                    <BotaoDoPowerPoint dica="Mover Slide para Cima" aoClicar={() => mover(-1)}>
                      <ChevronUp className="w-4 h-4" />
                    </BotaoDoPowerPoint>
                    <BotaoDoPowerPoint dica="Mover Slide para Baixo" aoClicar={() => mover(1)}>
                      <ChevronDown className="w-4 h-4" />
                    </BotaoDoPowerPoint>
                  </GrupoDoPowerPoint>

                  <GrupoDoPowerPoint nome="Fonte">
                    <BotaoDoPowerPoint dica="Limpar Formatação" rotulo="Limpar" empilhado
                      aoClicar={limparFormatacao}>
                      <Type className="w-5 h-5" />
                    </BotaoDoPowerPoint>
                    <BotaoDoPowerPoint dica="Negrito (Ctrl+N)" aoClicar={() => naoFazParte('O negrito')}>
                      <span style={{ fontWeight: 700 }}>N</span>
                    </BotaoDoPowerPoint>
                  </GrupoDoPowerPoint>
                </>
              )}

              {guia === 'Inserir' && (
                <>
                  <GrupoDoPowerPoint nome="Imagens">
                    <BotaoDoPowerPoint dica="Imagens" rotulo="Imagens" empilhado
                      aoClicar={() => setDialogo('imagens')}>
                      <ImageIcon className="w-5 h-5" />
                    </BotaoDoPowerPoint>
                  </GrupoDoPowerPoint>
                  <GrupoDoPowerPoint nome="Ilustrações">
                    <div style={{ position: 'relative' }}>
                      <BotaoDoPowerPoint dica="Gráfico" rotulo="Gráfico" empilhado
                        aoClicar={() => abrir('grafico')}>
                        <Layers className="w-5 h-5" />
                      </BotaoDoPowerPoint>
                      <MenuDoPowerPoint aberto={menu === 'grafico'}>
                        <ItemDeMenuDoPowerPoint aoClicar={() => colarGrafico('imagem')}>
                          Colar como Imagem
                        </ItemDeMenuDoPowerPoint>
                        <ItemDeMenuDoPowerPoint aoClicar={() => colarGrafico('incorporado')}>
                          Colar Mantendo a Formatação (incorpora a planilha)
                        </ItemDeMenuDoPowerPoint>
                        <ItemDeMenuDoPowerPoint aoClicar={() => colarGrafico('vinculado')}>
                          Colar Vinculando aos Dados (a planilha viaja junto)
                        </ItemDeMenuDoPowerPoint>
                      </MenuDoPowerPoint>
                    </div>
                  </GrupoDoPowerPoint>
                </>
              )}

              {guia === 'Design' && (
                <GrupoDoPowerPoint nome="Temas">
                  <BotaoDoPowerPoint dica="Abrir o painel Formatar Imagem" rotulo="Imagem" empilhado
                    aoClicar={() => { setPainel('imagem'); setGuia('Design'); }}>
                    <Palette className="w-5 h-5" />
                  </BotaoDoPowerPoint>
                  <BotaoDoPowerPoint dica="Compactar Imagens" rotulo="Compactar" empilhado
                    aoClicar={() => setDialogo('compactar')}>
                    <Shrink className="w-5 h-5" />
                  </BotaoDoPowerPoint>
                </GrupoDoPowerPoint>
              )}

              {guia === 'Revisão' && (
                <GrupoDoPowerPoint nome="Acessibilidade">
                  <BotaoDoPowerPoint dica="Verificar Acessibilidade" rotulo="Verificar" empilhado
                    aoClicar={() => setPainel('acessibilidade')}>
                    <AlignLeft className="w-5 h-5" />
                  </BotaoDoPowerPoint>
                </GrupoDoPowerPoint>
              )}

              {guia === 'Apresentação de Slides' && (
                <GrupoDoPowerPoint nome="Iniciar">
                  <BotaoDoPowerPoint dica="Do Começo (F5)" rotulo="Do Começo" empilhado
                    aoClicar={() => { setAtual(0); setApresentador(false); setLuz(false); setTela('telao'); }}>
                    <Play className="w-5 h-5" />
                  </BotaoDoPowerPoint>
                  <BotaoDoPowerPoint dica="Modo de Exibição do Apresentador" rotulo="Apresentador" empilhado
                    aoClicar={() => {
                      setApresentador(true); setLuz(false); setTela('telao');
                      descobrir(CHAVE_DO_APRESENTADOR);
                    }}>
                    <UserSquare2 className="w-5 h-5" />
                  </BotaoDoPowerPoint>
                </GrupoDoPowerPoint>
              )}

              {guia === 'Exibir' && (
                <GrupoDoPowerPoint nome="Modos de Exibição">
                  <BotaoDoPowerPoint dica="Slide Mestre" rotulo="Slide Mestre" empilhado
                    aoClicar={() => setTela('mestre')}>
                    <Monitor className="w-5 h-5" />
                  </BotaoDoPowerPoint>
                  {TEM_PLANILHA[licao] && (
                    <BotaoDoPowerPoint dica="Planilha de custos" rotulo="Planilha" empilhado
                      aoClicar={() => setTela('planilha')}>
                      <Table2 className="w-5 h-5" />
                    </BotaoDoPowerPoint>
                  )}
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
                    <span className="pp-tira-moldura">{folhaDoSlide(s, true)}</span>
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div className="pp-palco" onClick={ev => ev.stopPropagation()}>
                  <div style={{ width: '100%', maxWidth: 620 }}>
                    <FolhaDoSlide
                      slide={slide} mestre={ap.mestre} numero={atual + 1}
                      rotuloDoTitulo={`Título do slide ${atual + 1}`}
                      aoEscreverNoTitulo={titulo => mudarSlide(slide.id, { titulo })}
                      desenharGrafico={desenharGrafico} nomeDoAudio="hino-do-clube.mp3"
                    />
                    {/*
                      O corpo é **uma** caixa de texto, e as linhas dela são os
                      tópicos.

                      É o que um espaço reservado de conteúdo é no PowerPoint, e
                      é também o que torna a lição possível: com um campo por
                      tópico não haveria gesto nenhum para **apagar** um — e a
                      meta de seis tópicos por slide ficaria impossível de
                      vencer com o motor inteiramente correto, que é o defeito
                      que esta trava existe para achar.
                    */}
                    {slide.layout !== 'em-branco'
                      && (slide.layout !== 'so-titulo' || slide.topicos.length > 0) && (
                      <textarea
                        className="pp-titulo-campo mt-2"
                        aria-label={`Tópicos do slide ${atual + 1}`}
                        value={slide.topicos.join('\n')}
                        rows={Math.max(3, slide.topicos.length + 1)}
                        style={{ fontSize: 12, border: '1px solid #D7D7D7', borderRadius: 2, resize: 'vertical' }}
                        onChange={e => mudarSlide(slide.id, { topicos: semVaziosNoFim(e.target.value.split('\n')) })}
                      />
                    )}
                  </div>
                </div>
                <PainelDeNotas
                  notas={slide.notas} aberto={notasAbertas}
                  aoAbrir={() => setNotasAbertas(v => !v)}
                  rotulo={`Notas do slide ${atual + 1}`}
                  aoEscrever={texto => mudarSlide(slide.id, { notas: texto })}
                />
              </div>

              {painel === 'acessibilidade' && (
                <PainelDoPowerPoint titulo="Acessibilidade">
                  {achadosDeAcessibilidade.map(a => (
                    <AchadoDoPainel key={a.diz} tom={a.tom}>{a.diz}</AchadoDoPainel>
                  ))}
                </PainelDoPowerPoint>
              )}
              {painel === 'imagem' && (
                <PainelDoPowerPoint titulo="Formatar Imagem">
                  {achadosDaImagem.length === 0
                    ? <AchadoDoPainel tom="bom">Este slide não tem imagem.</AchadoDoPainel>
                    : achadosDaImagem.map(a => (
                      <div key={a.id}>
                        <AchadoDoPainel tom={a.tom}>
                          <strong>{a.arquivo}</strong><br />{a.diz}
                        </AchadoDoPainel>
                        <button type="button" className="pp-bt-dialogo" style={{ marginBottom: 8 }}
                          onClick={() => setDialogo(`trocar:${a.id}`)}>
                          Alterar Imagem
                        </button>
                      </div>
                    ))}
                </PainelDoPowerPoint>
              )}
            </div>

            <ReguaDoPowerPoint
              atual={atual + 1} total={ap.slides.length} palavras={palavrasDoSlide(slide)}
              extra={(
                <span className="hidden md:inline">
                  {pesoEmMegabytes(ap).toFixed(1).replace('.', ',')} MB
                </span>
              )}
            />
          </>
        )}

        {/*
          Dois programas abertos querem dizer barra de tarefas.

          É a regra do laboratório de compactar da AP041, e só a lição do
          gráfico a aciona: nas outras nove ela prometeria caminho para um
          programa que a lição não usa.
        */}
        {TEM_PLANILHA[licao] && (tela === 'normal' || tela === 'planilha') && (
          <div style={{
            background: '#1F1F1F', color: '#F3F2F1', fontSize: 11.5,
            display: 'flex', gap: 6, padding: '3px 8px', alignItems: 'center',
          }}>
            <button type="button" onClick={() => setTela('normal')}
              aria-current={tela === 'normal'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                borderRadius: 3, background: tela === 'normal' ? '#3A3A3A' : 'transparent',
                borderBottom: tela === 'normal' ? '2px solid #B7472A' : '2px solid transparent',
              }}>
              <FileText className="w-3.5 h-3.5" /> Acampamento de Inverno 2026
            </button>
            <button type="button" onClick={() => setTela('planilha')}
              aria-current={tela === 'planilha'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
                borderRadius: 3, background: tela === 'planilha' ? '#3A3A3A' : 'transparent',
                borderBottom: tela === 'planilha' ? '2px solid #217346' : '2px solid transparent',
              }}>
              <Table2 className="w-3.5 h-3.5" /> {PLANILHA_DOS_CUSTOS}
            </button>
          </div>
        )}

        {dialogo === 'imagens' && (
          <DialogoDoPowerPoint
            titulo="Inserir Imagem" confirmar="Fechar"
            aoConfirmar={() => setDialogo(null)} aoFechar={() => setDialogo(null)}
          >
            <p>Imagens em <strong>Este Computador › Clube › Fotos</strong></p>
            {IMAGENS_DO_CLUBE.map(f => (
              <button key={f.arquivo} type="button" className="pp-bt-dialogo"
                style={{ textAlign: 'left' }} onClick={() => inserirImagem(f.arquivo)}>
                {f.arquivo} <span style={{ color: '#605E5C' }}>· {f.px} × {f.py} px</span>
              </button>
            ))}
          </DialogoDoPowerPoint>
        )}

        {dialogo?.startsWith('trocar:') && (
          <DialogoDoPowerPoint
            titulo="Alterar Imagem" confirmar="Fechar"
            aoConfirmar={() => setDialogo(null)} aoFechar={() => setDialogo(null)}
          >
            <p>Escolha o arquivo que vai no lugar.</p>
            {IMAGENS_DO_CLUBE.map(f => (
              <button key={f.arquivo} type="button" className="pp-bt-dialogo"
                style={{ textAlign: 'left' }}
                onClick={() => trocarImagem(dialogo.slice('trocar:'.length), f.arquivo)}>
                {f.arquivo} <span style={{ color: '#605E5C' }}>· {f.px} × {f.py} px</span>
              </button>
            ))}
          </DialogoDoPowerPoint>
        )}

        {dialogo === 'compactar' && (
          <DialogoDoPowerPoint
            titulo="Compactar Imagens" confirmar="OK"
            aoConfirmar={compactarTodas} aoFechar={() => setDialogo(null)}
          >
            <p>Resolução de saída. Isto não volta.</p>
            {[96, 150, 220].map(ppi => (
              <label key={ppi} className="flex items-center gap-2">
                <input type="radio" name="ppi" checked={ppiEscolhido === ppi}
                  onChange={() => setPpi(ppi)} aria-label={`${ppi} ppi`} />
                <span>
                  {ppi} ppi
                  {ppi === 96 && ' — e-mail: minimiza o tamanho do documento para compartilhar'}
                  {ppi === 150 && ' — web: boa qualidade em páginas e projetores'}
                  {ppi === 220 && ' — impressão: qualidade em impressoras e telas de alta definição'}
                </span>
              </label>
            ))}
            <p style={{ color: '#605E5C' }}>
              Agora o arquivo tem {pesoEmMegabytes(ap).toFixed(1).replace('.', ',')} MB.
            </p>
          </DialogoDoPowerPoint>
        )}

        {dialogo === 'informacoes' && (
          <DialogoDoPowerPoint
            titulo="Tamanho do arquivo" confirmar="Fechar"
            aoConfirmar={() => setDialogo(null)} aoFechar={() => setDialogo(null)}
          >
            <p>
              A apresentação tem <strong>{pesoEmMegabytes(ap).toFixed(1).replace('.', ',')} MB</strong>.
            </p>
            <p style={{ color: '#605E5C' }}>
              O anexo de e-mail do clube aceita {TETO_DE_MEGABYTES} MB.
            </p>
          </DialogoDoPowerPoint>
        )}
      </div>
    </LaboratorioEmTelaCheia>
  );
}
