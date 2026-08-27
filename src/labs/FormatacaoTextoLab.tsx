import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListTree, IndentIncrease, IndentDecrease,
  ArrowDownAZ, Pilcrow, ArrowUpDown, PaintBucket, Square,
  Copy, ClipboardPaste, Scissors, Paintbrush, Eraser, CaseSensitive, Columns,
  Highlighter, Baseline, Sparkles, Search, ChevronDown, Type,
  FileCheck2, RotateCcw, Minus, X,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import { CSS_WORD } from './word';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP042 requisito 3 — as sete demonstrações de formatação, num Word.
 *
 * O requisito manda ajustar margem, copiar, colar, trocar fonte, usar negrito,
 * alinhar, espaçar e listar. São gestos, e gesto não se prova em múltipla
 * escolha: dá para acertar a alternativa sobre o botão de negrito sem nunca ter
 * apertado um. Então aqui existe um documento de verdade, e o laboratório
 * observa cada operação acontecer nele.
 *
 * ── Por que a interface imita o Word, e não a plataforma ─────────────────
 * O laboratório de pastas e arquivos tomou a decisão contrária, e está escrito
 * lá: usa as cores da plataforma porque "imitar o cinza do sistema deixaria uma
 * ilha clara dentro de um aplicativo escuro, e o que precisa ser reconhecido é o
 * arranjo, não a paleta".
 *
 * Aqui a conta dá outro resultado, por dois motivos. O primeiro é que o
 * gerenciador de arquivos existe em toda máquina com aparência diferente, e o
 * Word é um programa só, com uma interface que o desbravador vai encontrar
 * idêntica na escola e no clube — a faixa de opções, as guias, os grupos com o
 * nome embaixo. O segundo é que metade do que o requisito cobra é *onde fica*:
 * margem, orientação e tamanho do papel não estão na guia Início, estão em
 * Layout, e um painel inventado ensinaria a procurar no lugar errado.
 *
 * A ilha clara continua sendo um risco real, e ele é resolvido pela moldura: a
 * janela tem barra de título, botões de janela e sombra, então lê-se como
 * janela de outro programa dentro da plataforma — que é o que ela é. O painel
 * de tarefas fica fora dela, na paleta escura, e a separação entre "o exercício"
 * e "o programa" fica visível.
 *
 * ── O que é fiel de propósito ────────────────────────────────────────────
 *   · as guias na ordem do Word, com Início e Layout funcionando;
 *   · os grupos com o rótulo embaixo, e os botões na posição em que estão lá;
 *   · os atalhos em português nas dicas — Negrito é Ctrl+N, e não Ctrl+B, que
 *     é a primeira coisa que confunde quem aprendeu em vídeo em inglês;
 *   · a régua acompanhando a margem escolhida;
 *   · a barra de status contando as palavras de verdade.
 *
 * Os botões que não fazem parte do exercício estão desenhados e não respondem —
 * tirá-los deixaria a faixa irreconhecível, e fazê-los funcionar seria escrever
 * um editor de texto. Clicar num deles diz isso, em vez de ficar mudo.
 *
 * ── A seleção primeiro ───────────────────────────────────────────────────
 * Nenhum botão faz nada sem seleção, e isso é de propósito: é o engano número um
 * de quem começa. No Word o botão aplica ao ponto de inserção e nada muda na
 * tela, e a pessoa conclui que o programa quebrou. Aqui o programa responde.
 */

type Alinhamento = 'esquerda' | 'centro' | 'direita' | 'justificado';
type Lista = 'nenhuma' | 'marcadores' | 'numeracao';
type Papel = 'A4' | 'Carta';
type Orientacao = 'retrato' | 'paisagem';
type Margem = 'estreita' | 'normal' | 'larga';
type Guia = 'inicio' | 'layout';

interface Bloco {
  id: string;
  texto: string;
  /** A que parte do documento o bloco pertence — é o que a tarefa cobra. */
  grupo: 'clube' | 'titulo' | 'corpo' | 'rotulo' | 'materiais' | 'passos' | 'assinatura';
  fonte: string;
  tamanho: number;
  negrito: boolean;
  italico: boolean;
  sublinhado: boolean;
  alinhamento: Alinhamento;
  /** Entrelinha do parágrafo: 1 é simples, 1.5 é o pedido em trabalho escolar. */
  espacamento: number;
  lista: Lista;
}

/* Cada fonte com a pilha que a faz parecer o que ela é, já que nenhuma delas
   está instalada num Linux: o que precisa mudar na tela é o desenho da letra. */
const FONTES: { nome: string; pilha: string }[] = [
  { nome: 'Aptos', pilha: 'system-ui, "Segoe UI", sans-serif' },
  { nome: 'Arial', pilha: 'Arial, Helvetica, sans-serif' },
  { nome: 'Calibri', pilha: 'Carlito, Calibri, system-ui, sans-serif' },
  { nome: 'Comic Sans MS', pilha: '"Comic Sans MS", "Comic Neue", cursive' },
  { nome: 'Georgia', pilha: 'Georgia, "Times New Roman", serif' },
  { nome: 'Times New Roman', pilha: '"Times New Roman", Times, serif' },
  { nome: 'Verdana', pilha: 'Verdana, Geneva, sans-serif' },
];
const pilhaDaFonte = (nome: string) => FONTES.find(f => f.nome === nome)?.pilha ?? 'sans-serif';

const TAMANHOS = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48];

const FONTE_INICIAL = 'Aptos';

const bloco = (id: string, texto: string, grupo: Bloco['grupo']): Bloco => ({
  id, texto, grupo,
  fonte: FONTE_INICIAL, tamanho: 11,
  negrito: false, italico: false, sublinhado: false,
  alinhamento: 'esquerda', espacamento: 1, lista: 'nenhuma',
});

const DOCUMENTO: Bloco[] = [
  bloco('clube', 'Clube de Desbravadores Pioneiros', 'clube'),
  bloco('titulo', 'Relatório do acampamento da Unidade Falcão', 'titulo'),
  bloco('p1', 'A nossa unidade passou três dias no acampamento regional, com outras onze unidades. Montamos a barraca no sábado de manhã, cozinhamos as três refeições do domingo e participamos da caminhada de doze quilômetros na segunda-feira, antes de desmontar tudo.', 'corpo'),
  bloco('p2', 'Nas noites, o estudo foi do livro O Maior Discurso de Cristo, e cada unidade apresentou uma parte para as outras. A nossa ficou com o trecho sobre a mansidão.', 'corpo'),
  bloco('rot-mat', 'Material que cada um levou:', 'rotulo'),
  bloco('m1', 'Saco de dormir e isolante', 'materiais'),
  bloco('m2', 'Lanterna com pilha de reserva', 'materiais'),
  bloco('m3', 'Prato, caneca e talher', 'materiais'),
  bloco('rot-pas', 'Como montamos a barraca, na ordem:', 'rotulo'),
  bloco('s1', 'Escolher o terreno mais alto e sem pedra', 'passos'),
  bloco('s2', 'Estender a lona e prender as estacas', 'passos'),
  bloco('s3', 'Levantar as varetas e esticar as cordas', 'passos'),
  bloco('ass', 'Curitiba, 12 de outubro', 'assinatura'),
];

interface Folha { papel: Papel; orientacao: Orientacao; margem: Margem }

interface Meta {
  id: string;
  titulo: string;
  detalhe: string;
  /** Onde, na faixa de opções, isso se resolve. */
  onde: string;
  feita: (d: Bloco[], f: Folha) => boolean;
}

const doGrupo = (d: Bloco[], g: Bloco['grupo']) => d.filter(b => b.grupo === g);
const um = (d: Bloco[], id: string) => d.find(b => b.id === id);

const METAS: Meta[] = [
  {
    id: 'folha',
    titulo: 'Acertar a folha',
    detalhe: 'Deixe o papel em A4, na orientação retrato e com margens normais. O documento chegou com a folha errada.',
    onde: 'Layout › Configurar Página',
    feita: (_d, f) => f.papel === 'A4' && f.orientacao === 'retrato' && f.margem === 'normal',
  },
  {
    id: 'copiar',
    titulo: 'Copiar e colar',
    detalhe: 'O nome do clube precisa aparecer também no fim, embaixo da data. Copie a primeira linha e cole no fim do documento.',
    onde: 'Início › Área de Transferência',
    feita: d => doGrupo(d, 'clube').length >= 2 && d[d.length - 1].grupo === 'clube',
  },
  {
    id: 'fonte',
    titulo: 'Trocar a fonte e o tamanho',
    detalhe: 'O título tem que se destacar: escolha outra fonte para ele e um tamanho de 18 ou mais.',
    onde: 'Início › Fonte',
    feita: d => {
      const t = um(d, 'titulo');
      return !!t && t.fonte !== FONTE_INICIAL && t.tamanho >= 18;
    },
  },
  {
    id: 'destaque',
    titulo: 'Usar negrito, itálico e sublinhado',
    detalhe: 'Título em negrito. O parágrafo que cita o nome do livro em itálico. A data sublinhada.',
    onde: 'Início › Fonte',
    feita: d => !!um(d, 'titulo')?.negrito && !!um(d, 'p2')?.italico && !!um(d, 'ass')?.sublinhado,
  },
  {
    id: 'alinhar',
    titulo: 'Alinhar cada parte',
    detalhe: 'Título centralizado, os dois parágrafos do corpo justificados e a data alinhada à direita.',
    onde: 'Início › Parágrafo',
    feita: d => um(d, 'titulo')?.alinhamento === 'centro'
      && doGrupo(d, 'corpo').every(b => b.alinhamento === 'justificado')
      && um(d, 'ass')?.alinhamento === 'direita',
  },
  {
    id: 'espacar',
    titulo: 'Ajustar o espaçamento',
    detalhe: 'Os dois parágrafos do corpo com espaçamento 1,5, que é o pedido em trabalho escolar.',
    onde: 'Início › Parágrafo',
    feita: d => doGrupo(d, 'corpo').every(b => b.espacamento === 1.5),
  },
  {
    id: 'listas',
    titulo: 'Usar marcadores e numeração',
    detalhe: 'O material vira lista com marcadores — a ordem não importa. A montagem da barraca vira lista numerada, porque ali a ordem importa.',
    onde: 'Início › Parágrafo',
    feita: d => doGrupo(d, 'materiais').every(b => b.lista === 'marcadores')
      && doGrupo(d, 'passos').every(b => b.lista === 'numeracao'),
  },
];

/* Medidas em centímetros, como o Word mostra em Margens. */
const MARGENS_CM: Record<Margem, number> = { estreita: 1.27, normal: 2.5, larga: 5.08 };
const LARGURA_CM: Record<Papel, number> = { A4: 21, Carta: 21.6 };

export default function FormatacaoTextoLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [doc, setDoc] = useState<Bloco[]>(DOCUMENTO);
  const [folha, setFolha] = useState<Folha>({ papel: 'Carta', orientacao: 'paisagem', margem: 'estreita' });
  const [guia, setGuia] = useState<Guia>('inicio');
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [areaDeTransferencia, setAreaDeTransferencia] = useState<Bloco | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  const alvo = doc.find(b => b.id === selecionado) ?? null;
  const cumpridas = METAS.filter(m => m.feita(doc, folha));
  const tudoFeito = cumpridas.length === METAS.length;
  const palavras = doc.reduce((n, b) => n + b.texto.trim().split(/\s+/).length, 0);

  const fecharMenu = () => setMenu(null);

  /*
    Toda mudança de formatação passa por aqui, e por isso o aviso de "selecione
    primeiro" também. Espalhar essa checagem por cada botão deixaria um deles de
    fora mais cedo ou mais tarde.
  */
  const formatar = (mudanca: Partial<Bloco>, valeParaOGrupo = false) => {
    fecharMenu();
    if (!alvo) {
      setAviso('Escolha antes onde aplicar: clique num parágrafo do documento. Botão de formatação sem seleção não faz nada — no Word também não.');
      return;
    }
    setAviso('');
    setDoc(d => d.map(b => {
      const atinge = valeParaOGrupo ? b.grupo === alvo.grupo : b.id === alvo.id;
      return atinge ? { ...b, ...mudanca } : b;
    }));
  };

  const naoFazParte = (nome: string) => {
    fecharMenu();
    setAviso(`${nome} existe no Word de verdade, e está aqui para a faixa ficar igual — mas não faz parte deste exercício.`);
  };

  const copiar = () => {
    fecharMenu();
    if (!alvo) {
      setAviso('Selecione o parágrafo que você quer copiar antes de apertar Copiar.');
      return;
    }
    setAreaDeTransferencia(alvo);
    setAviso(`"${alvo.texto.slice(0, 34)}…" foi para a área de transferência. Agora escolha onde colar.`);
  };

  const colar = () => {
    fecharMenu();
    if (!areaDeTransferencia) {
      setAviso('A área de transferência está vazia. Selecione um parágrafo e aperte Copiar primeiro.');
      return;
    }
    const copia: Bloco = {
      ...areaDeTransferencia,
      id: `${areaDeTransferencia.id}-copia-${doc.length}`,
    };
    setDoc(d => {
      if (!alvo) return [...d, copia];
      const i = d.findIndex(b => b.id === alvo.id);
      return [...d.slice(0, i + 1), copia, ...d.slice(i + 1)];
    });
    setAviso('Colado. O original continua onde estava — foi copiado, e não recortado.');
  };

  const recomecar = () => {
    setDoc(DOCUMENTO);
    setFolha({ papel: 'Carta', orientacao: 'paisagem', margem: 'estreita' });
    setSelecionado(null);
    setAreaDeTransferencia(null);
    setGuia('inicio');
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
        attempts: 1, correct_count: METAS.length, total_questions: METAS.length,
      });
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você formatou tudo, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'formatacao_concluida', { specialtyCode, lessonCode, metas: METAS.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Documento pronto para entregar!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Você acertou a folha em Layout, copiou, trocou a letra, destacou,
          alinhou, espaçou e listou — nos mesmos lugares em que esses botões ficam
          no Word de verdade. Abrir o programa na escola agora é reconhecer a
          faixa, e não procurar nela.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  // ── Peças da faixa de opções ──────────────────────────────────────────

  /** Botão pequeno da faixa, com dica igual à do Word. */
  const Bt = ({ dica, ativo, aoClicar, children, largo }: {
    dica: string; ativo?: boolean; aoClicar: () => void; children: React.ReactNode; largo?: boolean;
  }) => (
    <button
      type="button" title={dica} aria-label={dica} aria-pressed={ativo}
      onClick={aoClicar}
      className="wd-bt"
      style={{
        backgroundColor: ativo ? '#D6E8F7' : 'transparent',
        border: ativo ? '1px solid #9EC5E8' : '1px solid transparent',
        minWidth: largo ? 'auto' : 24,
      }}
    >
      {children}
    </button>
  );

  /** Grupo da faixa: os botões e, embaixo, o nome — como no Word. */
  const Grupo = ({ nome, children }: { nome: string; children: React.ReactNode }) => (
    <div className="wd-grupo">
      <div className="wd-grupo-corpo">{children}</div>
      <div className="wd-grupo-nome">{nome}</div>
    </div>
  );

  const Menu = ({ id, children }: { id: string; children: React.ReactNode }) => (
    menu === id ? <div className="wd-menu" role="menu">{children}</div> : null
  );

  const ItemMenu = ({ aoClicar, ativo, children }: {
    aoClicar: () => void; ativo?: boolean; children: React.ReactNode;
  }) => (
    <button type="button" role="menuitem" onClick={aoClicar} className="wd-menu-item"
      style={{ backgroundColor: ativo ? '#D6E8F7' : 'transparent' }}>
      {children}
    </button>
  );

  const margemCm = MARGENS_CM[folha.margem];
  const larguraCm = folha.orientacao === 'retrato'
    ? LARGURA_CM[folha.papel]
    : (folha.papel === 'A4' ? 29.7 : 27.9);
  /* A página na tela: pixels por centímetro fixos, para a folha mudar de forma
     de verdade quando o papel e a orientação mudam. 34 px/cm dá 90% do tamanho
     real numa tela de 96 dpi — é esse número que a barra de status mostra, como
     o Word mostra o dele. A letra acompanha: 1 pt vira 1,2 px nessa escala, e
     por isso 11 pt na tela tem o tamanho que teria no papel a 90%. */
  /* As medidas em centímetros descem para o CSS; quem multiplica por pixel é a
     media query, que é quem sabe o tamanho da tela. */
  const medidas = {
    '--largura-cm': larguraCm,
    '--margem-cm': margemCm,
  } as React.CSSProperties;

  const tarefas = METAS.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde,
    feita: m.feita(doc, folha),
  }));

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <>
          {erro && <p style={{ fontSize: 11.5, color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary text-sm w-full justify-center">
            {gravando ? 'Guardando…' : 'Entregar o documento'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar o documento
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      titulo={lessonTitle}
      programa="word"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
    >
      <style>{CSS_WORD}</style>

      {/* ── A janela do Word ── */}
      <div className="wd-janela">
        {/* Barra de título */}
        <div className="wd-titulo">
          <span style={{ color: '#2B579A', fontWeight: 700, fontSize: 13 }}>W</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: '#E6EEF7', color: '#2B579A', fontSize: 10.5, fontWeight: 600 }}>
            AutoSalvamento
          </span>
          <span style={{ fontWeight: 600 }}>Relatório do acampamento</span>
          <span style={{ color: '#605E5C' }}>— Salvo</span>
          <span className="hidden sm:flex items-center gap-1 mx-auto px-3 py-1 rounded"
            style={{ background: '#EFEDEB', color: '#605E5C', fontSize: 11.5 }}>
            <Search className="w-3 h-3" /> Pesquisar
          </span>
          <span className="ml-auto sm:ml-0 flex items-center gap-3" style={{ color: '#605E5C' }} aria-hidden="true">
            <Minus className="w-3 h-3" /><Square className="w-2.5 h-2.5" /><X className="w-3 h-3" />
          </span>
        </div>

        {/* Guias */}
        <div className="wd-guias" role="tablist">
          <button className="wd-guia" style={{ background: '#2B579A', color: '#fff', borderRadius: '3px 3px 0 0' }}
            onClick={() => naoFazParte('A guia Arquivo')}>Arquivo</button>
          {([['inicio', 'Início'], ['layout', 'Layout']] as const).map(([id, rotulo]) => (
            <button key={id} role="tab" aria-selected={guia === id} className="wd-guia"
              onClick={() => { setGuia(id); fecharMenu(); }}>{rotulo}</button>
          ))}
          {['Inserir', 'Desenhar', 'Design', 'Referências', 'Revisão', 'Exibir', 'Ajuda'].map(g => (
            <button key={g} className="wd-guia" style={{ color: '#8A8886' }}
              onClick={() => naoFazParte(`A guia ${g}`)}>{g}</button>
          ))}
        </div>

        {/* Faixa de opções */}
        {/* Com menu aberto a faixa deixa de recortar: `overflow-x: auto` cria um
            contexto de recorte, e era ele que cortava o menu de Margens pela
            metade. Enquanto o menu está aberto, ninguém precisa rolar a faixa. */}
        {guia === 'inicio' ? (
          <div className="wd-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
            <Grupo nome="Área de Transferência">
              <div style={{ position: 'relative' }}>
                <button type="button" className="wd-bt" onClick={colar}
                  title="Colar (Ctrl+V)" style={{ flexDirection: 'column', height: 'auto', padding: '2px 6px' }}>
                  <ClipboardPaste className="w-5 h-5" />
                  <span style={{ fontSize: 10.5 }}>Colar</span>
                </button>
              </div>
              <div className="wd-linhas">
                <Bt dica="Recortar (Ctrl+X)" aoClicar={() => naoFazParte('Recortar')}><Scissors className="w-3.5 h-3.5" /></Bt>
                <Bt dica="Copiar (Ctrl+C)" aoClicar={copiar}><Copy className="w-3.5 h-3.5" /></Bt>
                <Bt dica="Pincel de Formatação" aoClicar={() => naoFazParte('O Pincel de Formatação')}><Paintbrush className="w-3.5 h-3.5" /></Bt>
              </div>
            </Grupo>

            <Grupo nome="Fonte">
              <div className="wd-linhas">
                <div className="flex items-center gap-1">
                  <select className="wd-combo" style={{ width: 128 }} aria-label="Fonte"
                    value={alvo?.fonte ?? FONTE_INICIAL}
                    onChange={e => formatar({ fonte: e.target.value })}>
                    {FONTES.map(f => <option key={f.nome} value={f.nome}>{f.nome}</option>)}
                  </select>
                  <select className="wd-combo" style={{ width: 52 }} aria-label="Tamanho da fonte"
                    value={alvo?.tamanho ?? 11}
                    onChange={e => formatar({ tamanho: Number(e.target.value) })}>
                    {TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Bt dica="Aumentar Tamanho da Fonte (Ctrl+>)"
                    aoClicar={() => formatar({ tamanho: Math.min(48, (alvo?.tamanho ?? 11) + 2) })}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>A</span>
                  </Bt>
                  <Bt dica="Diminuir Tamanho da Fonte (Ctrl+&lt;)"
                    aoClicar={() => formatar({ tamanho: Math.max(8, (alvo?.tamanho ?? 11) - 2) })}>
                    <span style={{ fontSize: 10 }}>A</span>
                  </Bt>
                  <Bt dica="Maiúsculas e Minúsculas" aoClicar={() => naoFazParte('Maiúsculas e Minúsculas')}><CaseSensitive className="w-4 h-4" /></Bt>
                  <Bt dica="Limpar Toda a Formatação" aoClicar={() => naoFazParte('Limpar Toda a Formatação')}><Eraser className="w-3.5 h-3.5" /></Bt>
                </div>
                <div className="flex items-center gap-1">
                  {/* N, I e S, e não B, I e U: é assim que o Word em português
                      desenha estes três, e o atalho segue a letra — Ctrl+N para
                      negrito. Quem aprendeu por vídeo em inglês tropeça aqui. */}
                  <Bt dica="Negrito (Ctrl+N)" ativo={alvo?.negrito} aoClicar={() => formatar({ negrito: !alvo?.negrito })}>
                    <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 14 }}>N</span>
                  </Bt>
                  <Bt dica="Itálico (Ctrl+I)" ativo={alvo?.italico} aoClicar={() => formatar({ italico: !alvo?.italico })}>
                    <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14 }}>I</span>
                  </Bt>
                  <Bt dica="Sublinhado (Ctrl+S)" ativo={alvo?.sublinhado} aoClicar={() => formatar({ sublinhado: !alvo?.sublinhado })}>
                    <span style={{ fontFamily: 'Georgia, serif', textDecoration: 'underline', fontSize: 14 }}>S</span>
                  </Bt>
                  <Bt dica="Tachado" aoClicar={() => naoFazParte('Tachado')}><Strikethrough className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Subscrito" aoClicar={() => naoFazParte('Subscrito')}><Subscript className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Sobrescrito" aoClicar={() => naoFazParte('Sobrescrito')}><Superscript className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Efeitos de Texto" aoClicar={() => naoFazParte('Efeitos de Texto')}><Sparkles className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Cor do Realce do Texto" aoClicar={() => naoFazParte('A Cor do Realce')}><Highlighter className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Cor da Fonte" aoClicar={() => naoFazParte('A Cor da Fonte')}><Baseline className="w-3.5 h-3.5" /></Bt>
                </div>
              </div>
            </Grupo>

            <Grupo nome="Parágrafo">
              <div className="wd-linhas">
                <div className="flex items-center gap-1">
                  <Bt dica="Marcadores" ativo={alvo?.lista === 'marcadores'}
                    aoClicar={() => formatar({ lista: alvo?.lista === 'marcadores' ? 'nenhuma' : 'marcadores' }, true)}>
                    <List className="w-3.5 h-3.5" />
                  </Bt>
                  <Bt dica="Numeração" ativo={alvo?.lista === 'numeracao'}
                    aoClicar={() => formatar({ lista: alvo?.lista === 'numeracao' ? 'nenhuma' : 'numeracao' }, true)}>
                    <ListOrdered className="w-3.5 h-3.5" />
                  </Bt>
                  <Bt dica="Lista de Vários Níveis" aoClicar={() => naoFazParte('A Lista de Vários Níveis')}><ListTree className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Diminuir Recuo" aoClicar={() => naoFazParte('Diminuir Recuo')}><IndentDecrease className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Aumentar Recuo" aoClicar={() => naoFazParte('Aumentar Recuo')}><IndentIncrease className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Classificar" aoClicar={() => naoFazParte('Classificar')}><ArrowDownAZ className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Mostrar Tudo (Ctrl+*)" aoClicar={() => naoFazParte('Mostrar Tudo')}><Pilcrow className="w-3.5 h-3.5" /></Bt>
                </div>
                <div className="flex items-center gap-1">
                  <Bt dica="Alinhar à Esquerda (Ctrl+Q)" ativo={alvo?.alinhamento === 'esquerda'}
                    aoClicar={() => formatar({ alinhamento: 'esquerda' })}><AlignLeft className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Centralizar (Ctrl+E)" ativo={alvo?.alinhamento === 'centro'}
                    aoClicar={() => formatar({ alinhamento: 'centro' })}><AlignCenter className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Alinhar à Direita (Ctrl+G)" ativo={alvo?.alinhamento === 'direita'}
                    aoClicar={() => formatar({ alinhamento: 'direita' })}><AlignRight className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Justificar (Ctrl+J)" ativo={alvo?.alinhamento === 'justificado'}
                    aoClicar={() => formatar({ alinhamento: 'justificado' })}><AlignJustify className="w-3.5 h-3.5" /></Bt>
                  <div style={{ position: 'relative' }}>
                    <Bt dica="Espaçamento de Linha e Parágrafo" ativo={menu === 'espacamento'}
                      aoClicar={() => setMenu(menu === 'espacamento' ? null : 'espacamento')}>
                      <ArrowUpDown className="w-3.5 h-3.5" /><ChevronDown className="w-3 h-3" />
                    </Bt>
                    <Menu id="espacamento">
                      {[1, 1.15, 1.5, 2].map(v => (
                        <ItemMenu key={v} ativo={alvo?.espacamento === v} aoClicar={() => formatar({ espacamento: v })}>
                          {v.toString().replace('.', ',')}
                        </ItemMenu>
                      ))}
                    </Menu>
                  </div>
                  <Bt dica="Sombreamento" aoClicar={() => naoFazParte('Sombreamento')}><PaintBucket className="w-3.5 h-3.5" /></Bt>
                  <Bt dica="Bordas" aoClicar={() => naoFazParte('Bordas')}><Square className="w-3.5 h-3.5" /></Bt>
                </div>
              </div>
            </Grupo>

            <Grupo nome="Estilos">
              <div className="flex items-center gap-1">
                {['Normal', 'Sem Espaç.', 'Título 1'].map(e => (
                  <button key={e} type="button" className="wd-bt" onClick={() => naoFazParte('A galeria de Estilos')}
                    title={`Estilo ${e}`}
                    style={{ flexDirection: 'column', height: 'auto', padding: '2px 8px', border: '1px solid #E1DFDD', background: '#FFF' }}>
                    <span style={{ fontSize: 12, fontWeight: e === 'Título 1' ? 700 : 400, color: e === 'Título 1' ? '#2B579A' : '#201F1E' }}>AaBb</span>
                    <span style={{ fontSize: 9.5, color: '#605E5C' }}>{e}</span>
                  </button>
                ))}
              </div>
            </Grupo>

            <Grupo nome="Edição">
              <div className="wd-linhas">
                <Bt dica="Localizar (Ctrl+L)" aoClicar={() => naoFazParte('Localizar')}><Search className="w-3.5 h-3.5" /></Bt>
                <Bt dica="Substituir (Ctrl+U)" aoClicar={() => naoFazParte('Substituir')}><Type className="w-3.5 h-3.5" /></Bt>
              </div>
            </Grupo>
          </div>
        ) : (
          <div className="wd-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
            <Grupo nome="Configurar Página">
              <div className="flex items-start gap-1">
                <div style={{ position: 'relative' }}>
                  <button type="button" className="wd-bt" title="Margens"
                    onClick={() => setMenu(menu === 'margens' ? null : 'margens')}
                    style={{ flexDirection: 'column', height: 'auto', padding: '2px 8px' }}>
                    <IndentIncrease className="w-5 h-5" />
                    <span style={{ fontSize: 10.5 }}>Margens</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <Menu id="margens">
                    {([['normal', 'Normal', '2,5 cm em todos os lados'],
                       ['estreita', 'Estreita', '1,27 cm em todos os lados'],
                       ['larga', 'Larga', '5,08 cm à esquerda e à direita']] as const).map(([v, nome, medida]) => (
                      <ItemMenu key={v} ativo={folha.margem === v}
                        aoClicar={() => { setFolha(f => ({ ...f, margem: v })); fecharMenu(); }}>
                        <strong>{nome}</strong>
                        <span style={{ display: 'block', fontSize: 11, color: '#605E5C' }}>{medida}</span>
                      </ItemMenu>
                    ))}
                  </Menu>
                </div>

                <div style={{ position: 'relative' }}>
                  <button type="button" className="wd-bt" title="Orientação"
                    onClick={() => setMenu(menu === 'orientacao' ? null : 'orientacao')}
                    style={{ flexDirection: 'column', height: 'auto', padding: '2px 8px' }}>
                    <Square className="w-5 h-5" />
                    <span style={{ fontSize: 10.5 }}>Orientação</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <Menu id="orientacao">
                    {([['retrato', 'Retrato'], ['paisagem', 'Paisagem']] as const).map(([v, nome]) => (
                      <ItemMenu key={v} ativo={folha.orientacao === v}
                        aoClicar={() => { setFolha(f => ({ ...f, orientacao: v })); fecharMenu(); }}>
                        {nome}
                      </ItemMenu>
                    ))}
                  </Menu>
                </div>

                <div style={{ position: 'relative' }}>
                  <button type="button" className="wd-bt" title="Tamanho"
                    onClick={() => setMenu(menu === 'tamanho' ? null : 'tamanho')}
                    style={{ flexDirection: 'column', height: 'auto', padding: '2px 8px' }}>
                    <ClipboardPaste className="w-5 h-5" />
                    <span style={{ fontSize: 10.5 }}>Tamanho</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <Menu id="tamanho">
                    {([['A4', 'A4', '21 cm × 29,7 cm'], ['Carta', 'Carta', '21,6 cm × 27,9 cm']] as const).map(([v, nome, medida]) => (
                      <ItemMenu key={v} ativo={folha.papel === v}
                        aoClicar={() => { setFolha(f => ({ ...f, papel: v })); fecharMenu(); }}>
                        <strong>{nome}</strong>
                        <span style={{ display: 'block', fontSize: 11, color: '#605E5C' }}>{medida}</span>
                      </ItemMenu>
                    ))}
                  </Menu>
                </div>

                <button type="button" className="wd-bt" title="Colunas"
                  onClick={() => naoFazParte('Colunas')}
                  style={{ flexDirection: 'column', height: 'auto', padding: '2px 8px' }}>
                  <Columns className="w-5 h-5" />
                  <span style={{ fontSize: 10.5 }}>Colunas</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div className="wd-linhas" style={{ paddingLeft: 6, borderLeft: '1px solid #E1DFDD' }}>
                  {['Quebras', 'Números de Linha', 'Hifenização'].map(n => (
                    <Bt key={n} dica={n} aoClicar={() => naoFazParte(n)} largo>
                      <span style={{ fontSize: 11 }}>{n}</span><ChevronDown className="w-3 h-3" />
                    </Bt>
                  ))}
                </div>
              </div>
            </Grupo>

            <Grupo nome="Parágrafo">
              {/* Os quatro campos que o Word mostra aqui. Ficam desenhados e não
                  respondem: o requisito 3.6 pede o espaçamento entre linhas, que
                  é o botão da guia Início, e não o espaçamento antes e depois do
                  parágrafo, que é este. Somem os dois seria perder a referência
                  de onde cada coisa mora. */}
              <div className="flex items-start gap-5">
                <div className="wd-linhas">
                  <span style={{ fontSize: 10.5, color: '#605E5C' }}>Recuar</span>
                  <label className="flex items-center gap-1" style={{ fontSize: 11 }}>
                    <IndentDecrease className="w-3.5 h-3.5" /> Esquerda:
                    <input className="wd-combo" style={{ width: 56 }} value="0 cm" readOnly
                      onClick={() => naoFazParte('O recuo à esquerda')} />
                  </label>
                  <label className="flex items-center gap-1" style={{ fontSize: 11 }}>
                    <IndentIncrease className="w-3.5 h-3.5" /> Direita:
                    <input className="wd-combo" style={{ width: 56 }} value="0 cm" readOnly
                      onClick={() => naoFazParte('O recuo à direita')} />
                  </label>
                </div>
                <div className="wd-linhas">
                  <span style={{ fontSize: 10.5, color: '#605E5C' }}>Espaçamento</span>
                  <label className="flex items-center gap-1" style={{ fontSize: 11 }}>
                    <ArrowUpDown className="w-3.5 h-3.5" /> Antes:
                    <input className="wd-combo" style={{ width: 52 }} value="0 pt" readOnly
                      onClick={() => naoFazParte('O espaçamento antes do parágrafo')} />
                  </label>
                  <label className="flex items-center gap-1" style={{ fontSize: 11 }}>
                    <ArrowUpDown className="w-3.5 h-3.5" /> Depois:
                    <input className="wd-combo" style={{ width: 52 }} value="8 pt" readOnly
                      onClick={() => naoFazParte('O espaçamento depois do parágrafo')} />
                  </label>
                </div>
              </div>
            </Grupo>

            <Grupo nome="Organizar">
              <div className="wd-linhas">
                {['Posição', 'Quebra de Texto', 'Alinhar'].map(n => (
                  <Bt key={n} dica={n} aoClicar={() => naoFazParte(n)} largo>
                    <span style={{ fontSize: 11 }}>{n}</span>
                  </Bt>
                ))}
              </div>
            </Grupo>
          </div>
        )}

        {/* Régua: o cinza é a margem, o branco é onde o texto cabe, e os números
            contam a partir da margem esquerda — como no Word. Ela muda junto
            quando a margem ou o papel mudam, que é o retorno visível de ter
            mexido em Layout. */}
        <div className="wd-regua" style={medidas}>
          <div className="wd-regua-barra">
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              left: 'calc(var(--margem-cm) * var(--px-cm) * 1px)',
              right: 'calc(var(--margem-cm) * var(--px-cm) * 1px)',
              background: '#FFFFFF', borderLeft: '1px solid #A19F9D', borderRight: '1px solid #A19F9D',
            }} />
            {Array.from({ length: Math.floor(larguraCm) }, (_, i) => i + 1).map(cm => (
              <span key={cm} style={{
                position: 'absolute', top: 1, transform: 'translateX(-50%)',
                left: `calc(${cm} * var(--px-cm) * 1px)`,
                fontSize: 8, color: '#605E5C', lineHeight: '14px',
              }}>{Math.round(Math.abs(cm - margemCm)) || ''}</span>
            ))}
          </div>
        </div>

        {/* A folha */}
        <div className="wd-canvas" onClick={fecharMenu} style={medidas}>
          <div className="wd-pagina">
            {doc.map((b, i) => {
              const numero = b.lista === 'numeracao'
                ? doc.filter(x => x.grupo === b.grupo).findIndex(x => x.id === b.id) + 1
                : 0;
              const marcado = b.id === selecionado;
              return (
                <div key={b.id}
                  onClick={() => { setSelecionado(b.id); fecharMenu(); setAviso(''); }}
                  className="wd-par"
                  style={{
                    backgroundColor: marcado ? '#CFE3F7' : undefined,
                    marginTop: i === 0 ? 0 : 6,
                    fontFamily: pilhaDaFonte(b.fonte),
                    ['--pt' as string]: b.tamanho,
                    fontWeight: b.negrito ? 700 : 400,
                    fontStyle: b.italico ? 'italic' : 'normal',
                    textDecoration: b.sublinhado ? 'underline' : 'none',
                    textAlign: b.alinhamento === 'centro' ? 'center'
                      : b.alinhamento === 'direita' ? 'right'
                      : b.alinhamento === 'justificado' ? 'justify' : 'left',
                    lineHeight: b.espacamento,
                    color: '#000000',
                    paddingLeft: b.lista === 'nenhuma' ? undefined : 20,
                  }}>
                  {b.lista === 'marcadores' && <span style={{ marginLeft: -14, marginRight: 6 }}>•</span>}
                  {b.lista === 'numeracao' && <span style={{ marginLeft: -17, marginRight: 6 }}>{numero}.</span>}
                  {b.texto}
                </div>
              );
            })}
          </div>
        </div>

        {/* Barra de status */}
        <div className="wd-status">
          <span>Página 1 de 1</span>
          <span>{palavras} palavras</span>
          <span className="hidden sm:inline">Português (Brasil)</span>
          <span className="hidden md:inline" style={{ marginLeft: 'auto' }}>
            {alvo ? `Selecionado: ${alvo.texto.slice(0, 28)}${alvo.texto.length > 28 ? '…' : ''}` : 'Clique num parágrafo para selecioná-lo'}
          </span>
          <span className="flex items-center gap-2 md:ml-4" style={{ marginLeft: 'auto' }} aria-hidden="true">
            <Minus className="w-3 h-3" />
            <span style={{ width: 60, height: 3, background: '#C8C6C4', borderRadius: 2, position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '56%', top: -3,
                width: 8, height: 9, background: '#605E5C', borderRadius: 1,
              }} />
            </span>
            <span style={{ fontSize: 13, lineHeight: 1 }}>+</span>
            <span style={{ minWidth: 32, textAlign: 'right' }}>
              <span className="sm:hidden">45%</span>
              <span className="hidden sm:inline lg:hidden">69%</span>
              <span className="hidden lg:inline">90%</span>
            </span>
          </span>
        </div>
      </div>

    </LaboratorioEmTelaCheia>
  );
}
