import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bold, Italic, Underline, Strikethrough, Superscript, Subscript,
  Highlighter, CaseSensitive, Columns, ClipboardPaste, Copy, Scissors,
  Paintbrush, Eraser, ChevronDown, ListTree, Quote, StickyNote, BookMarked,
  Type, Baseline, Sparkles, AlignLeft, Pilcrow, Globe,
  FileCheck2, RotateCcw,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_WORD, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa,
  BotaoDaFaixa, EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord,
} from './word';
import {
  DOC_INICIAL, METAS_DOS_ESTILOS, TEXTO_DO_SITE, NOMES_DA_CAIXA,
  aplicarCaixa, titulosDoDoc, textoDoBloco,
  type Doc, type Bloco, type Trecho, type Estilo, type Realce, type ModoDeCaixa,
} from './metasDaAp044';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP044 requisito 7 — os nove itens, no mesmo Word da AP042 e da AP043.
 *
 * ── Por que outro laboratório de Word, e não mais tarefas no de lá ───────
 * O da AP042 cobra formatação direta: negrito, fonte, alinhamento, margem.
 * Este cobra o contrário disso — descrever o papel do texto e deixar o
 * programa aplicar. Estender aquele mudaria o que a trilha anterior avalia como
 * concluído, e quem já fechou a AP042 veria tarefas novas aparecerem num
 * laboratório que ele entregou.
 *
 * A janela é a mesma, de `word.tsx`, e é de propósito: o desbravador precisa
 * reencontrar a faixa que já conhece, com grupos novos onde eles de fato estão.
 * Estilos fica em Início; Colunas, em Layout; Sumário e Nota de Rodapé, em
 * Referências — que é uma guia que ele nunca teve motivo de abrir até agora.
 *
 * ── O documento chega pronto, e é isso que engana ────────────────────────
 * Ele abre escrito por inteiro: título, três seções, oito itens, versículo. Na
 * tela parece um manual acabado. O que falta não se vê olhando — vê-se ao
 * mandar gerar o sumário, que sai vazio porque não há um único parágrafo
 * marcado como título. É a lição inteira num clique.
 *
 * O modelo, o critério e o passo a passo moram em `metasDaAp044.ts`, fora
 * daqui, para que a trava os alcance sem montar tela nenhuma.
 */

/* ── Aparência de cada estilo, com os números do Word ───────────────────────
   Título 1 é 16 pt azul #2F5496, Título 2 é 13 pt no mesmo azul, Citação é
   itálico recuado. Não são escolhas nossas: é o que a galeria de Estilos do
   Word aplica, e o desbravador precisa reconhecer o resultado lá. */
/* Nenhuma entrada usa a forma curta `margin`: misturar `margin` com
   `marginLeft` no mesmo objeto faz o React reclamar e, pior, deixa a ordem de
   aplicação decidir quem vence. Cada lado é escrito por extenso. */
const APARENCIA: Record<Estilo, React.CSSProperties> = {
  'Normal': {
    fontSize: 11, color: '#201F1E',
    marginTop: 0, marginBottom: 5, marginLeft: 0, marginRight: 0,
  },
  'Título 1': {
    fontSize: 16, color: '#2F5496', fontWeight: 400,
    marginTop: 10, marginBottom: 4, marginLeft: 0, marginRight: 0,
  },
  'Título 2': {
    fontSize: 13, color: '#2F5496', fontWeight: 600,
    marginTop: 8, marginBottom: 3, marginLeft: 0, marginRight: 0,
  },
  'Citação': {
    fontSize: 11, color: '#404040', fontStyle: 'italic',
    marginTop: 6, marginBottom: 6, marginLeft: 26, marginRight: 26,
  },
};

const CORES_DO_REALCE: Record<Realce, string> = {
  nenhum: 'transparent',
  amarelo: '#FFFF00',
  verde: '#00FF00',
  ciano: '#00FFFF',
  rosa: '#FF00FF',
};

/** A letra que o texto do site traz consigo, e que a colagem decide manter ou não. */
const LETRA_DO_SITE: React.CSSProperties = {
  fontFamily: 'Verdana, Geneva, sans-serif',
  fontSize: 10.5,
  color: '#1F5C99',
  background: '#EEF3F8',
};

const GUIAS_USAVEIS = ['Início', 'Layout', 'Referências'];

const ORDEM_DAS_SECOES: Doc['blocos'][number]['secao'][] =
  ['capa', 'abertura', 'levar', 'programacao', 'culto', 'fim'];

const ESTILOS_DE_PARAGRAFO: Estilo[] = ['Normal', 'Título 1', 'Título 2', 'Citação'];

export default function EstilosTextoLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [doc, setDoc] = useState<Doc>(DOC_INICIAL);
  const [guia, setGuia] = useState('Início');
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  const blocoDoTrecho = (id: string | null) =>
    id ? doc.blocos.find(b => b.trechos.some(x => x.id === id)) ?? null : null;
  const alvoBloco = blocoDoTrecho(selecionado);
  const alvoTrecho = selecionado
    ? doc.blocos.flatMap(b => b.trechos).find(x => x.id === selecionado) ?? null
    : null;

  const tarefas = METAS_DOS_ESTILOS.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde,
    passos: m.passos, feita: m.feita(doc),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  const fecharMenu = () => setMenu(null);
  const avisarFechando = (recado: string) => { fecharMenu(); setAviso(recado); };

  /*
    Toda operação passa por aqui, e por isso o aviso de "selecione primeiro"
    também. Espalhar essa checagem por cada botão deixaria um de fora mais cedo
    ou mais tarde — foi o que já aconteceu no laboratório da AP042.
  */
  const exigirSelecao = (): boolean => {
    fecharMenu();
    if (alvoBloco) { setAviso(''); return true; }
    setAviso('Clique antes num trecho do documento. Botão de formatação sem seleção não faz nada — no Word também não.');
    return false;
  };

  const mudarBloco = (id: string, mudanca: Partial<Bloco>) =>
    setDoc(d => ({ ...d, blocos: d.blocos.map(b => (b.id === id ? { ...b, ...mudanca } : b)) }));

  const mudarTrecho = (id: string, mudanca: Partial<Trecho>) =>
    setDoc(d => ({
      ...d,
      blocos: d.blocos.map(b => ({
        ...b, trechos: b.trechos.map(x => (x.id === id ? { ...x, ...mudanca } : x)),
      })),
    }));

  const aplicarEstilo = (e: Estilo) => {
    if (!exigirSelecao()) return;
    mudarBloco(alvoBloco!.id, { estilo: e });
    setAviso(e === 'Normal'
      ? 'Estilo removido: o parágrafo voltou a ser texto comum, e sai do sumário.'
      : `${e} aplicado ao parágrafo inteiro. Estilo de parágrafo não pede seleção de palavra: ele vale da primeira à última letra.`);
  };

  const aplicarEnfase = () => {
    if (!exigirSelecao()) return;
    mudarTrecho(alvoTrecho!.id, { enfase: !alvoTrecho!.enfase });
    setAviso(alvoTrecho!.enfase
      ? 'Ênfase retirada do trecho.'
      : 'Ênfase aplicada só ao trecho selecionado — ela é estilo de caractere, e por isso não entra no sumário.');
  };

  const posicionar = (p: Trecho['posicao']) => {
    if (!exigirSelecao()) return;
    const atual = alvoTrecho!.posicao;
    mudarTrecho(alvoTrecho!.id, { posicao: atual === p ? 'normal' : p });
  };

  const realcar = (cor: Realce) => {
    if (!exigirSelecao()) return;
    mudarTrecho(alvoTrecho!.id, { realce: cor });
    setAviso(cor === 'nenhum'
      ? 'Realce retirado.'
      : 'Realce é pintura, e não estilo: ele não diz ao programa o que aquele trecho é, e o sumário não fica sabendo dele.');
  };

  const trocarCaixa = (modo: ModoDeCaixa) => {
    if (!exigirSelecao()) return;
    const b = alvoBloco!;
    mudarBloco(b.id, { trechos: b.trechos.map(x => ({ ...x, texto: aplicarCaixa(x.texto, modo) })) });
    setAviso('Trocado sem redigitar nada. Repare que o texto guardado mudou de verdade — não é um efeito de aparência.');
  };

  const copiarDoSite = () => {
    fecharMenu();
    setCopiado(true);
    setAviso('O aviso do site foi para a área de transferência. Agora escolha onde colar, e como.');
  };

  const colar = (modo: 'original' | 'mesclar' | 'texto') => {
    fecharMenu();
    if (!copiado) {
      setAviso('A área de transferência está vazia. Clique em Copiar, no cartão do site do clube, antes de colar.');
      return;
    }
    if (!alvoBloco) {
      setAviso('Clique antes no parágrafo depois do qual o texto deve entrar.');
      return;
    }
    const deFora = modo === 'original';
    const id = `colado-${doc.blocos.length}`;
    const novo: Bloco = {
      id, secao: alvoBloco.secao, estilo: 'Normal',
      trechos: [{ id: `${id}-a`, texto: TEXTO_DO_SITE, posicao: 'normal', realce: 'nenhum', enfase: false, deFora }],
    };
    setDoc(d => {
      const i = d.blocos.findIndex(b => b.id === alvoBloco.id);
      return { ...d, blocos: [...d.blocos.slice(0, i + 1), novo, ...d.blocos.slice(i + 1)] };
    });
    setAviso(deFora
      ? 'Colado com a letra do site: outra fonte, outro tamanho, outra cor. É o que "Manter Formatação Original" faz — e é o que costuma ser confundido com o Word estragando o documento.'
      : 'Colado com a letra do documento. Mesmo texto, aparência do destino.');
  };

  const inserirNota = () => {
    if (!exigirSelecao()) return;
    mudarBloco(alvoBloco!.id, { nota: alvoBloco!.nota ?? '' });
    setAviso('Nota criada no pé da página. Escreva nela — a numeração é do programa, e é por isso que se usa o recurso em vez de digitar o número à mão.');
  };

  const gerarSumario = () => {
    fecharMenu();
    const itens = titulosDoDoc(doc);
    setDoc(d => ({ ...d, sumario: itens }));
    setAviso(itens.length === 0
      ? 'O sumário saiu vazio, e não é defeito: ele lista o que está marcado como título, e neste documento nada está. Aplique Título 1 e Título 2 antes.'
      : `Sumário montado com ${itens.length} ${itens.length === 1 ? 'linha' : 'linhas'}, lidas dos estilos que você aplicou.`);
  };

  const recomecar = () => {
    setDoc(DOC_INICIAL);
    setSelecionado(null);
    setCopiado(false);
    setGuia('Início');
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
        attempts: 1, correct_count: METAS_DOS_ESTILOS.length, total_questions: METAS_DOS_ESTILOS.length,
      });
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você fez tudo, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'estilos_concluidos', { specialtyCode, lessonCode, metas: METAS_DOS_ESTILOS.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Manual pronto para imprimir!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Você marcou o que cada parágrafo é, e o sumário se montou sozinho a
          partir disso. Da próxima vez que precisar de um trabalho com sumário,
          o caminho não é digitar a lista das páginas: é aplicar os estilos
          primeiro.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  // ── Peças de menu ──────────────────────────────────────────────────────

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

  const abrir = (id: string) => setMenu(m => (m === id ? null : id));

  // ── A folha ────────────────────────────────────────────────────────────

  const medidas = {
    '--largura-cm': 21, '--altura-cm': 29.7, '--margem-cm': 2.5,
    '--zoom': zoom,
  } as React.CSSProperties;

  const notas = doc.blocos.filter(b => b.nota !== undefined);
  const palavras = doc.blocos.reduce((n, b) => n + textoDoBloco(b).trim().split(/\s+/).length, 0);

  const desenharTrecho = (x: Trecho) => {
    const estilo: React.CSSProperties = {
      background: CORES_DO_REALCE[x.realce],
      fontStyle: x.enfase ? 'italic' : undefined,
      /* Ênfase no Word é itálico com a cor do texto do corpo; o que a distingue
         do itálico solto não é a aparência, e sim ela ter nome. */
      verticalAlign: x.posicao === 'normal' ? undefined : x.posicao === 'sobrescrito' ? 'super' : 'sub',
      fontSize: x.posicao === 'normal' ? undefined : '0.72em',
      outline: selecionado === x.id ? '2px solid #2B579A' : undefined,
      borderRadius: selecionado === x.id ? 2 : undefined,
      cursor: 'text',
      ...(x.deFora ? LETRA_DO_SITE : {}),
    };
    return (
      <span key={x.id} style={estilo}
        onClick={ev => { ev.stopPropagation(); setSelecionado(x.id); setAviso(''); fecharMenu(); }}>
        {x.texto}
      </span>
    );
  };

  const desenharBloco = (b: Bloco) => (
    <p key={b.id} className="wd-par" style={{ ...APARENCIA[b.estilo], lineHeight: 1.45 }}>
      {b.trechos.map(desenharTrecho)}
      {b.nota !== undefined && (
        <sup style={{ color: '#2B579A', fontWeight: 700, marginLeft: 1 }}>
          {notas.findIndex(n => n.id === b.id) + 1}
        </sup>
      )}
    </p>
  );

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <>
          {erro && <p style={{ fontSize: 11.5, color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary text-sm w-full justify-center">
            {gravando ? 'Guardando…' : 'Entregar o manual'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar o manual
      </button>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="word"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_WORD}</style>
      <style>{`
        .es-site {
          max-width: calc(21 * var(--px-cm) * 1px); margin: 0 auto 14px;
          background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 4px;
          padding: 8px 10px; font-size: 11.5px; color: #201F1E;
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .es-galeria { display: flex; gap: 3px; }
        .es-estilo {
          border: 1px solid #C8C6C4; background: #FFFFFF; border-radius: 2px;
          padding: 2px 8px; height: 40px; min-width: 58px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: #201F1E; white-space: nowrap;
        }
        .es-estilo:hover { border-color: #2B579A; }
        .es-notas {
          margin-top: auto; padding-top: 8px; border-top: 1px solid #C8C6C4;
          font-size: 9px; color: #201F1E;
        }
        .es-nota-campo {
          border: none; border-bottom: 1px dotted #8A8886; background: transparent;
          font-size: 9px; color: #201F1E; width: 100%; padding: 1px 2px;
        }
        .es-nota-campo:focus { outline: 1px solid #2B579A; }
        .es-sumario {
          border: 1px solid #D1D1D1; padding: 8px 10px; margin-bottom: 12px;
          font-size: 10.5px; color: #201F1E;
        }
        .es-sumario-linha { display: flex; gap: 6px; align-items: baseline; }
        .es-sumario-pontos { flex: 1; border-bottom: 1px dotted #8A8886; }
        .es-colunas-2 { column-count: 2; column-gap: 26px; }
      `}</style>

      <div className="wd-janela" style={medidas}>
        <BarraDeTituloDoWord documento="Manual do acampamento" aoAvisar={avisarFechando} />

        <GuiasDoWord
          atual={guia} usaveis={GUIAS_USAVEIS}
          aoTrocar={id => { setGuia(id); fecharMenu(); }}
          aoAvisar={avisarFechando} />

        {/* Faixa de opções. Com menu aberto ela deixa de recortar: `overflow-x`
            cria contexto de recorte, e era ele que cortava o menu pela metade. */}
        {guia === 'Início' && (
          <div className="wd-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
            <GrupoDaFaixa nome="Área de Transferência">
              <div style={{ position: 'relative' }}>
                <BotaoDaFaixa dica="Colar (Ctrl+V)" rotulo="Colar" empilhado
                  aoClicar={() => abrir('colar')}>
                  <ClipboardPaste className="w-5 h-5" />
                  <ChevronDown className="w-2.5 h-2.5" />
                </BotaoDaFaixa>
                <Menu id="colar">
                  <p style={{ fontSize: 10.5, color: '#605E5C', padding: '4px 10px 2px' }}>
                    Opções de Colagem:
                  </p>
                  <ItemMenu aoClicar={() => colar('original')}>
                    Manter Formatação Original <span style={{ color: '#605E5C' }}>(M)</span>
                  </ItemMenu>
                  <ItemMenu aoClicar={() => colar('mesclar')}>
                    Mesclar Formatação <span style={{ color: '#605E5C' }}>(H)</span>
                  </ItemMenu>
                  <ItemMenu aoClicar={() => colar('texto')}>
                    Manter Somente Texto <span style={{ color: '#605E5C' }}>(T)</span>
                  </ItemMenu>
                </Menu>
              </div>
              <div className="wd-linhas">
                <EnfeiteDaFaixa dica="Recortar (Ctrl+X)" aoAvisar={avisarFechando}><Scissors className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                <EnfeiteDaFaixa dica="Copiar (Ctrl+C)" aoAvisar={avisarFechando}><Copy className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                <EnfeiteDaFaixa dica="Pincel de Formatação" aoAvisar={avisarFechando}><Paintbrush className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
              </div>
            </GrupoDaFaixa>

            <GrupoDaFaixa nome="Fonte">
              <div className="wd-linhas">
                <div style={{ display: 'flex', gap: 3 }}>
                  <EnfeiteDaFaixa dica="Fonte" aoAvisar={avisarFechando}><Type className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                  <div style={{ position: 'relative' }}>
                    <BotaoDaFaixa dica="Alterar Maiúsculas e Minúsculas" aoClicar={() => abrir('caixa')}>
                      <CaseSensitive className="w-4 h-4" />
                      <ChevronDown className="w-2.5 h-2.5" />
                    </BotaoDaFaixa>
                    <Menu id="caixa">
                      {(Object.keys(NOMES_DA_CAIXA) as ModoDeCaixa[]).map(m => (
                        <ItemMenu key={m} aoClicar={() => trocarCaixa(m)}>{NOMES_DA_CAIXA[m]}</ItemMenu>
                      ))}
                    </Menu>
                  </div>
                  <EnfeiteDaFaixa dica="Limpar Toda a Formatação" aoAvisar={avisarFechando}><Eraser className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                  <EnfeiteDaFaixa dica="Negrito (Ctrl+N)" aoAvisar={avisarFechando}><Bold className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                  <EnfeiteDaFaixa dica="Itálico (Ctrl+I)" aoAvisar={avisarFechando}><Italic className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                  <EnfeiteDaFaixa dica="Sublinhado (Ctrl+S)" aoAvisar={avisarFechando}><Underline className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                  <EnfeiteDaFaixa dica="Tachado" aoAvisar={avisarFechando}><Strikethrough className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                  <BotaoDaFaixa dica="Subscrito (Ctrl+=)" ativo={alvoTrecho?.posicao === 'subscrito'}
                    aoClicar={() => posicionar('subscrito')}>
                    <Subscript className="w-3.5 h-3.5" />
                  </BotaoDaFaixa>
                  <BotaoDaFaixa dica="Sobrescrito (Ctrl+Shift++)" ativo={alvoTrecho?.posicao === 'sobrescrito'}
                    aoClicar={() => posicionar('sobrescrito')}>
                    <Superscript className="w-3.5 h-3.5" />
                  </BotaoDaFaixa>
                  <div style={{ position: 'relative' }}>
                    <BotaoDaFaixa dica="Cor do Realce do Texto" ativo={!!alvoTrecho && alvoTrecho.realce !== 'nenhum'}
                      aoClicar={() => abrir('realce')}>
                      <Highlighter className="w-3.5 h-3.5" />
                      <ChevronDown className="w-2.5 h-2.5" />
                    </BotaoDaFaixa>
                    <Menu id="realce">
                      {(['amarelo', 'verde', 'ciano', 'rosa'] as Realce[]).map(c => (
                        <ItemMenu key={c} aoClicar={() => realcar(c)}>
                          <span style={{
                            display: 'inline-block', width: 12, height: 12, marginRight: 8,
                            background: CORES_DO_REALCE[c], border: '1px solid #8A8886', verticalAlign: 'middle',
                          }} />
                          {c[0].toUpperCase() + c.slice(1)}
                        </ItemMenu>
                      ))}
                      <ItemMenu aoClicar={() => realcar('nenhum')}>Sem Cor</ItemMenu>
                    </Menu>
                  </div>
                  <EnfeiteDaFaixa dica="Cor da Fonte" aoAvisar={avisarFechando}><Baseline className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                </div>
              </div>
            </GrupoDaFaixa>

            <GrupoDaFaixa nome="Parágrafo">
              <EnfeiteDaFaixa dica="Alinhar à Esquerda (Ctrl+Q)" aoAvisar={avisarFechando}><AlignLeft className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
              <EnfeiteDaFaixa dica="Mostrar Tudo (Ctrl+*)" aoAvisar={avisarFechando}><Pilcrow className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
            </GrupoDaFaixa>

            {/*
              A galeria de Estilos, que é onde esta trilha mora.

              Os quatro primeiros são de parágrafo e valem para o parágrafo
              inteiro; Ênfase é de caractere e vale para o trecho. Estarem lado a
              lado na mesma galeria é fiel ao Word — e a diferença entre eles é o
              que decide quem entra no sumário.
            */}
            <GrupoDaFaixa nome="Estilos">
              <div className="es-galeria">
                {ESTILOS_DE_PARAGRAFO.map(e => (
                  <button key={e} type="button" className="es-estilo"
                    title={`${e} — estilo de parágrafo`}
                    aria-pressed={alvoBloco?.estilo === e}
                    style={{
                      borderColor: alvoBloco?.estilo === e ? '#2B579A' : '#C8C6C4',
                      ...(e === 'Título 1' ? { color: '#2F5496', fontSize: 13 } : {}),
                      ...(e === 'Título 2' ? { color: '#2F5496', fontSize: 12, fontWeight: 600 } : {}),
                      ...(e === 'Citação' ? { fontStyle: 'italic', color: '#404040' } : {}),
                    }}
                    onClick={() => aplicarEstilo(e)}>
                    {e}
                  </button>
                ))}
                <button type="button" className="es-estilo"
                  title="Ênfase — estilo de caractere: vale para o trecho selecionado"
                  aria-pressed={!!alvoTrecho?.enfase}
                  style={{
                    borderColor: alvoTrecho?.enfase ? '#2B579A' : '#C8C6C4',
                    fontStyle: 'italic',
                  }}
                  onClick={aplicarEnfase}>
                  Ênfase
                </button>
              </div>
            </GrupoDaFaixa>

            <GrupoDaFaixa nome="Editando">
              <EnfeiteDaFaixa dica="Localizar (Ctrl+L)" aoAvisar={avisarFechando}><Sparkles className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
            </GrupoDaFaixa>
          </div>
        )}

        {guia === 'Layout' && (
          <div className="wd-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
            <GrupoDaFaixa nome="Configurar Página">
              <EnfeiteDaFaixa dica="Margens" rotulo="Margens" empilhado aoAvisar={avisarFechando}>
                <Baseline className="w-5 h-5" />
              </EnfeiteDaFaixa>
              <EnfeiteDaFaixa dica="Orientação" rotulo="Orientação" empilhado aoAvisar={avisarFechando}>
                <Type className="w-5 h-5" />
              </EnfeiteDaFaixa>
              <EnfeiteDaFaixa dica="Tamanho" rotulo="Tamanho" empilhado aoAvisar={avisarFechando}>
                <BookMarked className="w-5 h-5" />
              </EnfeiteDaFaixa>
              <div style={{ position: 'relative' }}>
                <BotaoDaFaixa dica="Colunas" rotulo="Colunas" empilhado aoClicar={() => abrir('colunas')}>
                  <Columns className="w-5 h-5" />
                </BotaoDaFaixa>
                <Menu id="colunas">
                  {[1, 2, 3].map(n => (
                    <ItemMenu key={n} ativo={alvoBloco ? doc.colunas[alvoBloco.secao] === n : false}
                      aoClicar={() => {
                        if (!exigirSelecao()) return;
                        setDoc(d => ({ ...d, colunas: { ...d.colunas, [alvoBloco!.secao]: n } }));
                        setAviso(n === 1
                          ? 'De volta a uma coluna.'
                          : `Esta seção passou a ${n} colunas. As colunas valem para a seção, e não para o parágrafo — é por isso que o Word pede onde o cursor está.`);
                      }}>
                      {['Uma', 'Duas', 'Três'][n - 1]}
                    </ItemMenu>
                  ))}
                </Menu>
              </div>
            </GrupoDaFaixa>
          </div>
        )}

        {guia === 'Referências' && (
          <div className="wd-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
            <GrupoDaFaixa nome="Sumário">
              <div style={{ position: 'relative' }}>
                <BotaoDaFaixa dica="Sumário" rotulo="Sumário" empilhado aoClicar={() => abrir('sumario')}>
                  <ListTree className="w-5 h-5" />
                </BotaoDaFaixa>
                <Menu id="sumario">
                  <ItemMenu aoClicar={gerarSumario}>Sumário Automático 1</ItemMenu>
                  <ItemMenu aoClicar={gerarSumario}>Atualizar Sumário</ItemMenu>
                </Menu>
              </div>
            </GrupoDaFaixa>
            <GrupoDaFaixa nome="Notas de Rodapé">
              <BotaoDaFaixa dica="Inserir Nota de Rodapé (Alt+Ctrl+F)" rotulo="Nota de Rodapé" empilhado
                aoClicar={inserirNota}>
                <StickyNote className="w-5 h-5" />
              </BotaoDaFaixa>
              <EnfeiteDaFaixa dica="Inserir Nota de Fim" aoAvisar={avisarFechando}><Quote className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
            </GrupoDaFaixa>
            <GrupoDaFaixa nome="Citações e Bibliografia">
              <EnfeiteDaFaixa dica="Inserir Citação" aoAvisar={avisarFechando}><BookMarked className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
            </GrupoDaFaixa>
          </div>
        )}

        <ReguaDoWord larguraCm={21} margemCm={2.5} />

        <div className="wd-canvas" onClick={() => { setSelecionado(null); fecharMenu(); }}>
          {/* O site do clube, aberto ao lado — a origem do texto que se cola.
              Ele fica fora da folha de propósito: o que os itens b) e c) ensinam
              é o que acontece quando o texto atravessa a fronteira entre dois
              programas. */}
          <div className="es-site" onClick={ev => ev.stopPropagation()}>
            <Globe className="w-4 h-4" style={{ color: '#1F5C99' }} />
            <span style={{ color: '#605E5C', fontSize: 10.5 }}>clubepioneiros.org.br › avisos</span>
            <span style={LETRA_DO_SITE}>{TEXTO_DO_SITE}</span>
            <button type="button" onClick={copiarDoSite}
              className="wd-bt" style={{ border: '1px solid #C8C6C4', marginLeft: 'auto' }}>
              <Copy className="w-3 h-3" /> {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="wd-pagina" onClick={ev => ev.stopPropagation()}>
            {doc.sumario && (
              <div className="es-sumario">
                <p style={{ fontWeight: 700, color: '#2F5496', marginBottom: 4 }}>Sumário</p>
                {doc.sumario.length === 0 ? (
                  <p style={{ color: '#A19F9D', fontStyle: 'italic' }}>
                    Nenhuma entrada de sumário foi encontrada.
                  </p>
                ) : doc.sumario.map((it, i) => (
                  <div key={i} className="es-sumario-linha" style={{ paddingLeft: it.nivel === 2 ? 14 : 0 }}>
                    <span>{it.texto}</span>
                    <span className="es-sumario-pontos" />
                    <span>{i + 1}</span>
                  </div>
                ))}
              </div>
            )}

            {ORDEM_DAS_SECOES.map(secao => {
              const blocos = doc.blocos.filter(b => b.secao === secao);
              if (!blocos.length) return null;
              const n = doc.colunas[secao];
              return (
                <div key={secao} className={n === 2 ? 'es-colunas-2' : undefined}
                  style={n === 3 ? { columnCount: 3, columnGap: 20 } : undefined}>
                  {blocos.map(desenharBloco)}
                </div>
              );
            })}

            {notas.length > 0 && (
              <div className="es-notas">
                {notas.map((b, i) => (
                  <div key={b.id} style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
                    <sup style={{ color: '#2B579A', fontWeight: 700 }}>{i + 1}</sup>
                    <input
                      className="es-nota-campo"
                      value={b.nota ?? ''}
                      placeholder="Escreva aqui a nota de rodapé…"
                      aria-label={`Nota de rodapé ${i + 1}`}
                      onChange={e => mudarBloco(b.id, { nota: e.target.value })} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="wd-status">
          <span>Página 1 de 1</span>
          <span className="hidden sm:inline">{palavras} palavras</span>
          <span className="hidden md:inline">
            {doc.sumario ? `Sumário com ${doc.sumario.length}` : 'Sem sumário'}
          </span>
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} />
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
