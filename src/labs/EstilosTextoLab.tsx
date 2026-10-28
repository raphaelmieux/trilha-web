import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Columns, ClipboardPaste, Copy, Scissors, Paintbrush, ChevronDown, ListTree, Quote,
  StickyNote, BookMarked, Type, Baseline, Globe, Search, Replace, FileCheck2, RotateCcw,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_WORD, CSS_FOLHA, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa,
  BotaoDaFaixa, EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord, FolhaDoWord,
} from './word';
import { GrupoDeFonte, CSS_FONTE_DO_WORD, GrupoDeParagrafo } from './fonteDoWord';
import { useEdicaoDoWord } from './useEdicaoDoWord';
import {
  DOC_INICIAL, METAS_DOS_ESTILOS, TEXTO_DO_SITE, titulosDoDoc, textoVisivel,
  APARENCIA_DO_ESTILO, LETRA_DE_FORA, ehParagrafo,
  type Doc, type Paragrafo, type Estilo,
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

const GUIAS_USAVEIS = ['Início', 'Layout', 'Referências'];

const ESTILOS_DE_PARAGRAFO: Estilo[] = ['Normal', 'Título 1', 'Título 2', 'Citação'];

export default function EstilosTextoLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [doc, setDoc] = useState<Doc>(DOC_INICIAL);
  const [guia, setGuia] = useState('Início');
  const [copiado, setCopiado] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [zoom, setZoom] = useState(1);
  const [marcas, setMarcas] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);
  const edicao = useEdicaoDoWord(doc, setDoc);

  /* O parágrafo do cursor: é onde a nota, a colagem e as colunas valem. */
  const alvoBloco = edicao.paragrafo;

  const tarefas = METAS_DOS_ESTILOS.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde,
    passos: m.passos, feita: m.feita(doc),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  const fecharMenu = () => setMenu(null);
  const avisarFechando = (recado: string) => { fecharMenu(); setAviso(recado); };

  /*
    Toda operação que depende de onde o cursor está passa por aqui, e por isso
    o aviso de "clique primeiro" também. Espalhar essa checagem por cada botão
    deixaria um de fora mais cedo ou mais tarde — foi o que já aconteceu no
    laboratório da AP042.
  */
  const exigirCursor = (): boolean => {
    fecharMenu();
    if (edicao.selecao) { setAviso(''); return true; }
    setAviso('Clique antes no documento. Os comandos valem para onde o cursor está — no Word também.');
    return false;
  };

  const aplicarEstilo = (e: Estilo) => {
    if (!exigirCursor()) return;
    edicao.estilo(e);
    setAviso(e === 'Normal'
      ? 'Estilo removido: o parágrafo voltou a ser texto comum, e sai do sumário.'
      : `${e} aplicado ao parágrafo inteiro. Estilo de parágrafo não pede seleção de palavra: ele vale da primeira à última letra.`);
  };

  const aplicarEnfase = () => {
    if (!exigirCursor()) return;
    edicao.formatar({ tipo: 'enfase' });
    setAviso('Ênfase é estilo de caractere: vale só para o que está selecionado, e por isso não entra no sumário.');
  };

  const copiarDoSite = () => {
    fecharMenu();
    setCopiado(true);
    setAviso('O aviso do site foi para a área de transferência. Agora escolha onde colar, e como.');
  };

  /**
   * As três opções de colagem do Word. O aviso copiado é um parágrafo inteiro
   * do site, e entra como parágrafo depois do que tem o cursor — que é o que o
   * Word faz com um parágrafo colado no fim de outro.
   */
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
    const novo: Paragrafo = {
      tipo: 'paragrafo', id, secao: alvoBloco.secao, estilo: 'Normal',
      trechos: [{ id: `${id}-a`, texto: TEXTO_DO_SITE, posicao: 'normal', realce: 'nenhum', enfase: false, deFora }],
    };
    const depoisDe = alvoBloco.id;
    edicao.mudar(d => {
      const i = d.blocos.findIndex(b => b.id === depoisDe);
      return { ...d, blocos: [...d.blocos.slice(0, i + 1), novo, ...d.blocos.slice(i + 1)] };
    });
    setAviso(deFora
      ? 'Colado com a letra do site: outra fonte, outro tamanho, outra cor. É o que "Manter Formatação Original" faz — e é o que costuma ser confundido com o Word estragando o documento.'
      : 'Colado com a letra do documento. Mesmo texto, aparência do destino.');
  };

  const mudarNota = (id: string, nota: string) =>
    setDoc(d => ({
      ...d,
      blocos: d.blocos.map(b => (b.id === id && ehParagrafo(b) ? { ...b, nota } : b)),
    }));

  const inserirNota = () => {
    if (!exigirCursor() || !alvoBloco) return;
    const id = alvoBloco.id;
    edicao.mudar(d => ({
      ...d,
      blocos: d.blocos.map(b => (b.id === id && ehParagrafo(b) ? { ...b, nota: b.nota ?? '' } : b)),
    }));
    setAviso('Nota criada no pé da página. Escreva nela — a numeração é do programa, e é por isso que se usa o recurso em vez de digitar o número à mão.');
  };

  const gerarSumario = () => {
    fecharMenu();
    const itens = titulosDoDoc(doc);
    edicao.mudar(d => ({ ...d, sumario: itens }));
    setAviso(itens.length === 0
      ? 'O sumário saiu vazio, e não é defeito: ele lista o que está marcado como título, e neste documento nada está. Aplique Título 1 e Título 2 antes.'
      : `Sumário montado com ${itens.length} ${itens.length === 1 ? 'linha' : 'linhas'}, lidas dos estilos que você aplicou.`);
  };

  const recomecar = () => {
    edicao.reiniciar(DOC_INICIAL);
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
      }, specialtyCode);
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
      onMouseDown={ev => ev.preventDefault()}
      style={{ backgroundColor: ativo ? '#D6E8F7' : 'transparent' }}>
      {children}
    </button>
  );

  const abrir = (id: string) => setMenu(m => (m === id ? null : id));

  const palavras = textoVisivel(doc).split(/\s+/).filter(Boolean).length;
  const enfaseLigada = !!edicao.trecho?.enfase;

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
      <style>{CSS_FOLHA}</style>
      <style>{CSS_FONTE_DO_WORD}</style>
      <style>{`
        .es-site {
          margin: 0; background: #FFFFFF; border-bottom: 1px solid #C8C6C4;
          padding: 6px 10px; font-size: 11.5px; color: #201F1E;
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
      `}</style>

      <div className="wd-janela" style={{
        '--largura-cm': 21, '--altura-cm': 29.7, '--margem-cm': 2.5, '--zoom': zoom,
      } as React.CSSProperties}>
        <BarraDeTituloDoWord documento="Manual do acampamento" aoAvisar={avisarFechando}
          aoDesfazer={edicao.podeDesfazer ? edicao.desfazer : undefined}
          aoRefazer={edicao.podeRefazer ? edicao.refazer : undefined} />

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

            <GrupoDeFonte edicao={edicao} aoAvisar={avisarFechando} />

            <GrupoDeParagrafo edicao={edicao} aoAvisar={avisarFechando}
              marcas={{ ligadas: marcas, alternar: () => { setMarcas(m => !m); edicao.focar(); } }} />

            {/*
              A galeria de Estilos, que é onde esta trilha mora.

              Os quatro primeiros são de parágrafo e valem para o parágrafo
              inteiro; Ênfase é de caractere e vale para a seleção. Estarem lado
              a lado na mesma galeria é fiel ao Word — e a diferença entre eles é
              o que decide quem entra no sumário.
            */}
            <GrupoDaFaixa nome="Estilos">
              <div className="es-galeria">
                {ESTILOS_DE_PARAGRAFO.map(e => (
                  <button key={e} type="button" className="es-estilo"
                    title={`${e} — estilo de parágrafo`}
                    aria-pressed={edicao.formato.estilo === e}
                    onMouseDown={ev => ev.preventDefault()}
                    style={{
                      borderColor: edicao.formato.estilo === e ? '#2B579A' : '#C8C6C4',
                      ...(e === 'Título 1' ? { color: APARENCIA_DO_ESTILO['Título 1'].color, fontSize: 13 } : {}),
                      ...(e === 'Título 2' ? { color: APARENCIA_DO_ESTILO['Título 2'].color, fontSize: 12, fontWeight: 600 } : {}),
                      ...(e === 'Citação' ? { fontStyle: 'italic', color: '#404040' } : {}),
                    }}
                    onClick={() => aplicarEstilo(e)}>
                    {e}
                  </button>
                ))}
                <button type="button" className="es-estilo"
                  title="Ênfase — estilo de caractere: vale para o trecho selecionado"
                  aria-pressed={enfaseLigada}
                  onMouseDown={ev => ev.preventDefault()}
                  style={{ borderColor: enfaseLigada ? '#2B579A' : '#C8C6C4', fontStyle: 'italic' }}
                  onClick={aplicarEnfase}>
                  Ênfase
                </button>
              </div>
            </GrupoDaFaixa>

            <GrupoDaFaixa nome="Edição">
              <div className="wd-linhas">
                <EnfeiteDaFaixa dica="Localizar (Ctrl+L)" rotulo="Localizar" aoAvisar={avisarFechando}><Search className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
                <EnfeiteDaFaixa dica="Substituir (Ctrl+U)" rotulo="Substituir" aoAvisar={avisarFechando}><Replace className="w-3.5 h-3.5" /></EnfeiteDaFaixa>
              </div>
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
                        if (!exigirCursor() || !alvoBloco) return;
                        const secao = alvoBloco.secao;
                        edicao.mudar(d => ({ ...d, colunas: { ...d.colunas, [secao]: n } }));
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

        {/* O site do clube, aberto ao lado — a origem do texto que se cola.
            Ele fica fora da folha de propósito: o que os itens b) e c) ensinam
            é o que acontece quando o texto atravessa a fronteira entre dois
            programas. */}
        <div className="es-site">
          <Globe className="w-4 h-4" style={{ color: '#1F5C99' }} />
          <span style={{ color: '#605E5C', fontSize: 10.5 }}>clubepioneiros.org.br › avisos</span>
          <span style={LETRA_DE_FORA}>{TEXTO_DO_SITE}</span>
          <button type="button" onClick={copiarDoSite}
            className="wd-bt" style={{ border: '1px solid #C8C6C4', marginLeft: 'auto' }}>
            <Copy className="w-3 h-3" /> {copiado ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <ReguaDoWord larguraCm={21} margemCm={2.5} />

        <FolhaDoWord doc={doc} marcas={marcas} edicao={edicao.folha}
          aoEscolher={() => fecharMenu()} aoEscreverNota={mudarNota} />

        <div className="wd-status">
          <span>Página 1 de 1</span>
          <span className="hidden sm:inline">{palavras} palavras</span>
          <span className="hidden md:inline">
            {doc.sumario ? `Sumário com ${doc.sumario.length}` : 'Sem sumário'}
          </span>
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} aoAvisar={avisarFechando} />
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
