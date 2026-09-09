import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table, Image as ImageIcon, Heading, PanelBottom, Hash, RotateCcw,
  Rows3, Columns3, Trash2, Plus, Grid2x2, Paintbrush,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, WrapText, Square,
  FileCheck2, Shapes, Link2, Sigma, ClipboardPaste, Scissors, Copy,
  Highlighter, Baseline, List, ListOrdered, IndentDecrease, IndentIncrease,
  Pilcrow, Search, Replace, FileText, SeparatorHorizontal, Minus,
  MoveVertical, LayoutGrid,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_WORD, BarraDeTituloDoWord, GuiasDoWord, GrupoDaFaixa, BotaoDaFaixa,
  EnfeiteDaFaixa, ReguaDoWord, ZoomDoWord,
} from './word';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';
import {
  DOC_INICIAL, TABELA_INICIAL, METAS_DA_INSERCAO as METAS, type Doc,
} from './metasDaAp043';

/*
 * AP043 requisito 4 — as quatro inserções que o documento manda demonstrar.
 *
 * Tabela, imagem, cabeçalho e rodapé, numeração de páginas. É o mesmo Word do
 * laboratório de formatação da AP042, e de propósito: quem chega aqui já
 * reconhece a janela, e o que muda é a guia. Formatar mora em Início e Layout;
 * inserir mora em Inserir, que os dois laboratórios anteriores desenhavam e
 * não usavam.
 *
 * ── O que separa este requisito do da AP042 ──────────────────────────────
 * Lá as tarefas eram de uma peça só: negrito é o botão de negrito, alinhar é o
 * botão de alinhar. Aqui cada uma tem partes que precisam conversar. "Inserir
 * uma tabela" não acaba na tabela: o documento cobra adicionar e excluir linha
 * e coluna, e formatá-la — três operações que só existem *depois* que a tabela
 * está lá, e que aparecem numa guia que só aparece quando o cursor está dentro
 * dela. Essa guia contextual é uma das coisas que mais confunde quem usa Word,
 * e ela está aqui porque está lá.
 *
 * ── As armadilhas, uma por tarefa ────────────────────────────────────────
 *   tabela    — inserir é fácil; achar onde se adiciona linha, não. A guia
 *               Layout da tabela só existe com o cursor dentro dela, e some
 *               quando ele sai. Quem não sabe disso procura em Inserir para
 *               sempre;
 *   imagem    — a imagem entra "alinhada com o texto", empurrando o parágrafo
 *               para baixo, e é assim que ela entra no Word de verdade. Ajustar
 *               ao texto é escolher a quebra automática, e é essa a segunda
 *               metade do requisito;
 *   cabeçalho — não se escreve nele clicando no meio da página: é preciso abrir
 *               a área do cabeçalho, e ela tem uma guia própria que fecha com
 *               "Fechar Cabeçalho e Rodapé". Quem tenta digitar por cima do
 *               topo da folha não consegue, e conclui que está bloqueado;
 *   números   — numeração de página não é escrever "1" no rodapé. É um campo
 *               que se repete e se recalcula sozinho — e a diferença aparece
 *               na segunda página, que aqui existe justamente para mostrar
 *               isso.
 *
 * ── Por que há duas páginas ──────────────────────────────────────────────
 * Cabeçalho, rodapé e numeração são invisíveis num documento de uma página só:
 * tudo o que se vê é um texto no topo, igualzinho a um parágrafo comum. Com
 * duas, vê-se o que eles são — o mesmo cabeçalho repetido, e um número que
 * muda sozinho de 1 para 2. Um documento de uma página ensinaria que cabeçalho
 * é um jeito enfeitado de escrever a primeira linha.
 */

/* ── O laboratório ─────────────────────────────────────────────────────────── */

/*
  As guias que este laboratório desenha, e as medidas da folha.

  As três guias são as que o exercício usa; as outras oito do Word aparecem
  na fileira assim mesmo, apagadas, e respondem que existem e não fazem parte.
  Guia que sumisse ensinaria que o Word não a tem.

  A4 em pé, margem normal de 2,5 cm — o padrão de todo documento novo do Word
  em português, e o papel que sai da impressora do clube.
*/
const GUIAS_USAVEIS = ['Início', 'Inserir', 'Layout'];
const LARGURA_CM = 21;
const ALTURA_CM = 29.7;
const MARGEM_CM = 2.5;

export default function InsercaoTextoLab({
  specialtyCode, lessonCode, lessonTitle, requirementCodes, userId,
}: Props) {
  const [doc, setDoc] = useState<Doc>(DOC_INICIAL);
  /* A guia se identifica pelo nome que está escrito nela. As fixas vêm de
     `GUIAS_DO_WORD`, e as contextuais têm nome próprio — assim a lição pode
     dizer "Inserir › Tabela" e o código procurar exatamente isso. */
  const [guia, setGuia] = useState<string>('Inserir');
  const [menu, setMenu] = useState<string | null>(null);
  /* O zoom do rodapé. Com a folha em A4 de verdade, uma página não cabe na
     altura da janela — e é aqui que se reduz para ver as duas, que é o que a
     tarefa do cabeçalho pede para reparar. */
  const [zoom, setZoom] = useState(1);
  /** Onde está o cursor: é isso que faz as guias contextuais existirem. */
  const [foco, setFoco] = useState<{ tipo: 'texto' | 'tabela' | 'imagem'; linha?: number; coluna?: number }>({ tipo: 'texto' });
  const [editandoCabecalho, setEditandoCabecalho] = useState(false);
  const [aviso, setAviso] = useState('');
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState('');
  const [pronto, setPronto] = useState(false);

  const mudar = (f: (d: Doc) => Doc) => setDoc(d => f(d));
  const fecharMenu = () => setMenu(null);

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 6000);
  };

  /* ── Tabela ── */

  const inserirTabela = (colunas: number, linhas: number) => {
    const grade = Array.from({ length: linhas }, (_, l) =>
      Array.from({ length: colunas }, (_, c) => TABELA_INICIAL[l]?.[c] ?? ''));
    mudar(d => ({ ...d, tabela: { linhas: grade, estilo: 'nenhum' } }));
    setFoco({ tipo: 'tabela', linha: 0, coluna: 0 });
    setGuia('tabelaLayout');
    fecharMenu();
  };

  const inserirLinha = () => {
    if (!doc.tabela || foco.tipo !== 'tabela') return;
    const alvo = (foco.linha ?? 0) + 1;
    mudar(d => {
      if (!d.tabela) return d;
      const linhas = [...d.tabela.linhas];
      linhas.splice(alvo, 0, new Array(linhas[0].length).fill(''));
      return { ...d, tabela: { ...d.tabela, linhas } };
    });
    setFoco(f => ({ ...f, linha: alvo, coluna: 0 }));
  };

  const excluirLinha = () => {
    if (!doc.tabela || foco.tipo !== 'tabela') return;
    if (doc.tabela.linhas.length <= 1) { avisar('A tabela ficaria sem nenhuma linha.'); return; }
    const alvo = foco.linha ?? 0;
    mudar(d => {
      if (!d.tabela) return d;
      return { ...d, tabela: { ...d.tabela, linhas: d.tabela.linhas.filter((_, i) => i !== alvo) } };
    });
    setFoco(f => ({ ...f, linha: 0, coluna: 0 }));
  };

  const inserirColuna = () => {
    if (!doc.tabela || foco.tipo !== 'tabela') return;
    const alvo = (foco.coluna ?? 0) + 1;
    mudar(d => {
      if (!d.tabela) return d;
      return {
        ...d,
        tabela: {
          ...d.tabela,
          linhas: d.tabela.linhas.map(l => {
            const nova = [...l];
            nova.splice(alvo, 0, '');
            return nova;
          }),
        },
      };
    });
    setFoco(f => ({ ...f, coluna: alvo }));
  };

  const excluirColuna = () => {
    if (!doc.tabela || foco.tipo !== 'tabela') return;
    if (doc.tabela.linhas[0].length <= 1) { avisar('A tabela ficaria sem nenhuma coluna.'); return; }
    const alvo = foco.coluna ?? 0;
    mudar(d => {
      if (!d.tabela) return d;
      return {
        ...d,
        tabela: { ...d.tabela, linhas: d.tabela.linhas.map(l => l.filter((_, i) => i !== alvo)) },
      };
    });
    setFoco(f => ({ ...f, coluna: 0 }));
  };

  const escreverCelula = (linha: number, coluna: number, texto: string) => {
    mudar(d => {
      if (!d.tabela) return d;
      const linhas = d.tabela.linhas.map((l, i) =>
        i === linha ? l.map((c, j) => (j === coluna ? texto : c)) : l);
      return { ...d, tabela: { ...d.tabela, linhas } };
    });
  };

  /* ── Guias visíveis ── */

  const guiasContextuais = foco.tipo === 'tabela' && doc.tabela
    ? [{ id: 'tabelaLayout' as const, nome: 'Layout da Tabela' }, { id: 'tabelaDesign' as const, nome: 'Design da Tabela' }]
    : foco.tipo === 'imagem' && doc.imagem.presente
      ? [{ id: 'imagem' as const, nome: 'Formatar Imagem' }]
      : [];

  /* Guia contextual que some com o cursor não pode continuar selecionada: a
     faixa ficaria mostrando comandos de uma tabela que ninguém está editando. */
  const guiaValida = guiasContextuais.some(g => g.id === guia) || GUIAS_USAVEIS.includes(guia);
  const guiaAtual = guiaValida ? guia : 'Inserir';

  const recomecar = () => {
    setDoc(DOC_INICIAL);
    setFoco({ tipo: 'texto' });
    setGuia('Inserir');
    setEditandoCabecalho(false);
    setZoom(1);
    setAviso('');
  };

  const tarefas = METAS.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde, passos: m.passos,
    feita: m.feita(doc),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

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
      setErro('Você montou tudo, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'insercao_concluida', { specialtyCode, lessonCode, metas: METAS.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Documento entregue</h2>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Tabela, imagem, cabeçalho, rodapé e numeração — as quatro inserções do requisito 4.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">
          Voltar para a trilha
        </Link>
      </div>
    );
  }

  /* ── Peças da faixa ──
     Vêm de `word.tsx`, compartilhadas com o laboratório de formatação da
     AP042. Redesenhá-las aqui foi o que deixou este Word com três guias e
     nenhuma régua enquanto o outro tinha as onze. */

  const Bt = ({ dica, rotulo, ativo, aoClicar, children }: {
    dica: string; rotulo?: string; ativo?: boolean; aoClicar: () => void; children: React.ReactNode;
  }) => (
    <BotaoDaFaixa dica={dica} rotulo={rotulo} ativo={ativo} aoClicar={aoClicar} empilhado={!!rotulo}>
      {children}
    </BotaoDaFaixa>
  );

  const Enfeite = ({ dica, rotulo, children }: {
    dica: string; rotulo?: string; children: React.ReactNode;
  }) => (
    <EnfeiteDaFaixa dica={dica} rotulo={rotulo} aoAvisar={avisar} empilhado={!!rotulo}>
      {children}
    </EnfeiteDaFaixa>
  );

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

  const paginaConteudo = (numero: number) => (
    <div className="wd-pagina" key={numero}>
      {/* Cabeçalho — cinza quando fechado, editável quando aberto */}
      <div
        onClick={() => { setEditandoCabecalho(true); setFoco({ tipo: 'texto' }); }}
        className="ins-cabecalho"
        style={{ opacity: editandoCabecalho ? 1 : 0.55, cursor: 'text' }}>
        {editandoCabecalho && numero === 1 ? (
          <input className="ins-campo" value={doc.cabecalho} autoFocus
            placeholder="Escreva o cabeçalho"
            onChange={e => mudar(d => ({ ...d, cabecalho: e.target.value }))} />
        ) : (
          <span>{doc.cabecalho || (editandoCabecalho ? '' : 'Cabeçalho')}</span>
        )}
      </div>

      <div className="ins-corpo" style={{ opacity: editandoCabecalho ? 0.35 : 1 }}>
        {numero === 1 ? (
          <>
            <p className="ins-titulo">Relatório do acampamento de julho</p>

            {doc.imagem.presente && (
              <img
                onClick={() => { setFoco({ tipo: 'imagem' }); setGuia('imagem'); }}
                className={`ins-foto ins-foto-${doc.imagem.quebra}`}
                alt="Foto do acampamento"
                src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='280'><rect width='420' height='280' fill='%23CFE0D7'/><path d='M210,60L330,220L90,220Z' fill='%231B4D3E'/><circle cx='340' cy='70' r='26' fill='%23F2C14E'/><rect y='220' width='420' height='60' fill='%23A8C4B5'/></svg>"
              />
            )}

            <p className="ins-par">A unidade saiu na sexta-feira à tarde e voltou no domingo.
              Foram três dias de caminhada, fogo de conselho e classe bíblica ao ar livre.
              O tempo ajudou: choveu só na primeira noite, e mesmo assim ninguém desmontou barraca.</p>

            {doc.tabela ? (
              <table
                className={`ins-tabela ins-tabela-${doc.tabela.estilo}`}
                onClick={() => setGuia(g => (g === 'tabelaDesign' ? g : 'tabelaLayout'))}>
                <tbody>
                  {doc.tabela.linhas.map((linha, l) => (
                    <tr key={l}>
                      {linha.map((celula, c) => (
                        <td key={c}
                          style={{
                            outline: foco.tipo === 'tabela' && foco.linha === l && foco.coluna === c
                              ? '2px solid #2B579A' : undefined,
                          }}>
                          <input
                            className="ins-celula"
                            value={celula}
                            placeholder="…"
                            onFocus={() => setFoco({ tipo: 'tabela', linha: l, coluna: c })}
                            onChange={e => escreverCelula(l, c, e.target.value)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="ins-vazio">— aqui entra a tabela das unidades —</p>
            )}

            <p className="ins-par">As inscrições do próximo acampamento abrem na primeira
              reunião de setembro. Quem ficou devendo a diária deste pode acertar com a
              secretaria antes disso.</p>
          </>
        ) : (
          <>
            <p className="ins-par">No sábado à tarde a unidade fez a trilha até a cachoeira.
              O caminho leva quarenta minutos de subida, e o combinado era ninguém sair da
              fila — o que funcionou até a metade.</p>
            <p className="ins-par">No domingo, antes de desmontar, cada um recolheu o lixo da
              própria barraca. O campo ficou como estava quando chegamos, que é a regra.</p>
          </>
        )}
      </div>

      <div className="ins-rodape" style={{ opacity: editandoCabecalho ? 1 : 0.55 }}
        onClick={() => { setEditandoCabecalho(true); setFoco({ tipo: 'texto' }); }}>
        {editandoCabecalho && numero === 1 ? (
          <input className="ins-campo" value={doc.rodape}
            placeholder="Escreva o rodapé"
            onChange={e => mudar(d => ({ ...d, rodape: e.target.value }))} />
        ) : (
          <span>{doc.rodape || (editandoCabecalho ? '' : 'Rodapé')}</span>
        )}
        {doc.numeracao && <span className="ins-numero">{numero}</span>}
      </div>
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
      <style>{CSS_INSERCAO}</style>

      <div className="wd-janela" style={{ ['--zoom' as string]: zoom }}>
        <BarraDeTituloDoWord documento="Relatório do acampamento" aoAvisar={avisar} />

        {/* Guias — as fixas, as apagadas e, quando o cursor pede, as contextuais */}
        <GuiasDoWord
          atual={guiaAtual} usaveis={GUIAS_USAVEIS} contextuais={guiasContextuais}
          aoTrocar={id => { setGuia(id); fecharMenu(); }} aoAvisar={avisar} />

        {/* Faixa de opções.

            Com menu aberto ela deixa de recortar: `overflow-x: auto` cria um
            contexto de recorte, e seria ele a cortar a grade de tamanho da
            tabela pela metade. Enquanto o menu está aberto ninguém precisa
            rolar a faixa. */}
        <div className="wd-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}>
          {guiaAtual === 'Início' && (
            <>
              <GrupoDaFaixa nome="Área de Transferência">
                <Enfeite dica="Colar" rotulo="Colar"><ClipboardPaste className="w-5 h-5" /></Enfeite>
                <div className="wd-linhas">
                  <Enfeite dica="Recortar (Ctrl+X)"><Scissors className="w-3.5 h-3.5" /></Enfeite>
                  <Enfeite dica="Copiar (Ctrl+C)"><Copy className="w-3.5 h-3.5" /></Enfeite>
                  <Enfeite dica="Pincel de Formatação"><Paintbrush className="w-3.5 h-3.5" /></Enfeite>
                </div>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Fonte">
                <div className="wd-linhas">
                  <div className="flex items-center gap-1">
                    <span className="wd-combo flex items-center" style={{ width: 108 }}>Aptos</span>
                    <span className="wd-combo flex items-center" style={{ width: 40 }}>11</span>
                    <Enfeite dica="Aumentar Tamanho da Fonte"><span style={{ fontSize: 13, fontWeight: 600 }}>A</span></Enfeite>
                    <Enfeite dica="Diminuir Tamanho da Fonte"><span style={{ fontSize: 10 }}>A</span></Enfeite>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* N, I e S, e não B, I e U: é assim que o Word em português
                        desenha estes três. Quem aprendeu por vídeo em inglês
                        tropeça aqui. */}
                    <Enfeite dica="Negrito (Ctrl+N)"><span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 14 }}>N</span></Enfeite>
                    <Enfeite dica="Itálico (Ctrl+I)"><span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14 }}>I</span></Enfeite>
                    <Enfeite dica="Sublinhado (Ctrl+S)"><span style={{ fontFamily: 'Georgia, serif', textDecoration: 'underline', fontSize: 14 }}>S</span></Enfeite>
                    <Enfeite dica="Cor do Realce do Texto"><Highlighter className="w-3.5 h-3.5" /></Enfeite>
                    <Enfeite dica="Cor da Fonte"><Baseline className="w-3.5 h-3.5" /></Enfeite>
                  </div>
                </div>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Parágrafo">
                <div className="wd-linhas">
                  <div className="flex items-center gap-1">
                    <Enfeite dica="Marcadores"><List className="w-3.5 h-3.5" /></Enfeite>
                    <Enfeite dica="Numeração"><ListOrdered className="w-3.5 h-3.5" /></Enfeite>
                    <Enfeite dica="Diminuir Recuo"><IndentDecrease className="w-3.5 h-3.5" /></Enfeite>
                    <Enfeite dica="Aumentar Recuo"><IndentIncrease className="w-3.5 h-3.5" /></Enfeite>
                  </div>
                  <div className="flex items-center gap-1">
                    <Enfeite dica="Alinhar à Esquerda (Ctrl+Q)"><AlignLeft className="w-3.5 h-3.5" /></Enfeite>
                    <Enfeite dica="Centralizar (Ctrl+E)"><AlignCenter className="w-3.5 h-3.5" /></Enfeite>
                    <Enfeite dica="Alinhar à Direita (Ctrl+G)"><AlignRight className="w-3.5 h-3.5" /></Enfeite>
                    <Enfeite dica="Justificar (Ctrl+J)"><AlignJustify className="w-3.5 h-3.5" /></Enfeite>
                    <Enfeite dica="Mostrar Tudo (Ctrl+*)"><Pilcrow className="w-3.5 h-3.5" /></Enfeite>
                  </div>
                </div>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Estilos">
                <Enfeite dica="Estilo Normal" rotulo="Normal"><span style={{ fontSize: 13, fontWeight: 600 }}>AaBb</span></Enfeite>
                <Enfeite dica="Estilo Título 1" rotulo="Título 1"><span style={{ fontSize: 13, fontWeight: 600, color: '#2B579A' }}>AaBb</span></Enfeite>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Edição">
                <Enfeite dica="Localizar (Ctrl+L)"><Search className="w-3.5 h-3.5" /></Enfeite>
                <Enfeite dica="Substituir (Ctrl+U)"><Replace className="w-3.5 h-3.5" /></Enfeite>
              </GrupoDaFaixa>
            </>
          )}

          {guiaAtual === 'Inserir' && (
            <>
              <GrupoDaFaixa nome="Tabelas">
                <div style={{ position: 'relative' }}>
                  <Bt dica="Tabela" ativo={menu === 'tabela'}
                    aoClicar={() => setMenu(m => (m === 'tabela' ? null : 'tabela'))}>
                    <span className="flex flex-col items-center">
                      <Table className="w-4 h-4" />
                      <span style={{ fontSize: 9 }}>Tabela</span>
                    </span>
                  </Bt>
                  {menu === 'tabela' && (
                    <div className="wd-menu" role="menu" style={{ padding: 8 }}>
                      <p style={{ fontSize: 11, color: '#605E5C', marginBottom: 6 }}>
                        Escolha o tamanho da tabela
                      </p>
                      <div className="ins-grade">
                        {Array.from({ length: 4 }, (_, l) => (
                          <div key={l} className="ins-grade-linha">
                            {Array.from({ length: 5 }, (_, c) => (
                              <button key={c} type="button" className="ins-grade-celula"
                                title={`${c + 1} por ${l + 1}`}
                                onClick={() => inserirTabela(c + 1, l + 1)} />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GrupoDaFaixa>

              <GrupoDaFaixa nome="Ilustrações">
                <Bt dica="Imagens" aoClicar={() => {
                  if (doc.imagem.presente) { avisar('A foto já está no documento.'); return; }
                  mudar(d => ({ ...d, imagem: { presente: true, quebra: 'linha' } }));
                  setFoco({ tipo: 'imagem' });
                  setGuia('imagem');
                  avisar('A foto entrou alinhada com o texto, empurrando o parágrafo. É assim que ela entra no Word — ajustar ao texto é o passo seguinte.');
                }}>
                  <span className="flex flex-col items-center">
                    <ImageIcon className="w-4 h-4" />
                    <span style={{ fontSize: 9 }}>Imagens</span>
                  </span>
                </Bt>
                <Enfeite dica="Formas"><Shapes className="w-4 h-4" /></Enfeite>
              </GrupoDaFaixa>

              <GrupoDaFaixa nome="Links">
                <Enfeite dica="Link"><Link2 className="w-4 h-4" /></Enfeite>
              </GrupoDaFaixa>

              <GrupoDaFaixa nome="Cabeçalho e Rodapé">
                <Bt dica="Cabeçalho" aoClicar={() => { setEditandoCabecalho(true); fecharMenu(); }}>
                  <span className="flex flex-col items-center">
                    <Heading className="w-4 h-4" />
                    <span style={{ fontSize: 9 }}>Cabeçalho</span>
                  </span>
                </Bt>
                <Bt dica="Rodapé" aoClicar={() => { setEditandoCabecalho(true); fecharMenu(); }}>
                  <span className="flex flex-col items-center">
                    <PanelBottom className="w-4 h-4" />
                    <span style={{ fontSize: 9 }}>Rodapé</span>
                  </span>
                </Bt>
                <div style={{ position: 'relative' }}>
                  <Bt dica="Número de Página" ativo={menu === 'numero'}
                    aoClicar={() => setMenu(m => (m === 'numero' ? null : 'numero'))}>
                    <span className="flex flex-col items-center">
                      <Hash className="w-4 h-4" />
                      <span style={{ fontSize: 9 }}>Número</span>
                    </span>
                  </Bt>
                  {menu === 'numero' && (
                    <div className="wd-menu" role="menu">
                      <button type="button" role="menuitem" className="wd-menu-item"
                        onClick={() => { mudar(d => ({ ...d, numeracao: true })); fecharMenu(); }}>
                        Fim da Página
                      </button>
                      <button type="button" role="menuitem" className="wd-menu-item"
                        onClick={() => { mudar(d => ({ ...d, numeracao: false })); fecharMenu(); }}>
                        Remover Números de Página
                      </button>
                    </div>
                  )}
                </div>
              </GrupoDaFaixa>

              <GrupoDaFaixa nome="Símbolos">
                <Enfeite dica="Equação"><Sigma className="w-4 h-4" /></Enfeite>
              </GrupoDaFaixa>
            </>
          )}

          {guiaAtual === 'Layout' && (
            <>
              <GrupoDaFaixa nome="Configurar Página">
                <Enfeite dica="Margens" rotulo="Margens"><Square className="w-4 h-4" /></Enfeite>
                <Enfeite dica="Orientação" rotulo="Orientação"><RotateCcw className="w-4 h-4" /></Enfeite>
                <Enfeite dica="Tamanho" rotulo="Tamanho"><FileText className="w-4 h-4" /></Enfeite>
                <Enfeite dica="Colunas" rotulo="Colunas"><Columns3 className="w-4 h-4" /></Enfeite>
                <div className="wd-linhas">
                  <Enfeite dica="Quebras"><SeparatorHorizontal className="w-3.5 h-3.5" /></Enfeite>
                  <Enfeite dica="Hifenização"><Minus className="w-3.5 h-3.5" /></Enfeite>
                </div>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Parágrafo">
                <div className="wd-linhas">
                  <Enfeite dica="Recuo à Esquerda"><IndentIncrease className="w-3.5 h-3.5" /></Enfeite>
                  <Enfeite dica="Espaçamento Antes"><MoveVertical className="w-3.5 h-3.5" /></Enfeite>
                </div>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Organizar">
                <Enfeite dica="Posição" rotulo="Posição"><LayoutGrid className="w-4 h-4" /></Enfeite>
                <Enfeite dica="Quebra de Texto Automática" rotulo="Quebra"><WrapText className="w-4 h-4" /></Enfeite>
              </GrupoDaFaixa>
            </>
          )}

          {guiaAtual === 'tabelaLayout' && (
            <>
              <GrupoDaFaixa nome="Linhas e Colunas">
                <Bt dica="Inserir Abaixo" aoClicar={inserirLinha}>
                  <span className="flex flex-col items-center">
                    <Rows3 className="w-4 h-4" />
                    <span style={{ fontSize: 9 }}>Linha</span>
                  </span>
                </Bt>
                <Bt dica="Inserir à Direita" aoClicar={inserirColuna}>
                  <span className="flex flex-col items-center">
                    <Columns3 className="w-4 h-4" />
                    <span style={{ fontSize: 9 }}>Coluna</span>
                  </span>
                </Bt>
                <Bt dica="Excluir Linha" aoClicar={excluirLinha}>
                  <span className="flex flex-col items-center">
                    <Trash2 className="w-4 h-4" />
                    <span style={{ fontSize: 9 }}>Excl. linha</span>
                  </span>
                </Bt>
                <Bt dica="Excluir Coluna" aoClicar={excluirColuna}>
                  <span className="flex flex-col items-center">
                    <Trash2 className="w-4 h-4" />
                    <span style={{ fontSize: 9 }}>Excl. coluna</span>
                  </span>
                </Bt>
              </GrupoDaFaixa>
              <GrupoDaFaixa nome="Mesclar">
                <Enfeite dica="Mesclar Células"><Plus className="w-4 h-4" /></Enfeite>
              </GrupoDaFaixa>
            </>
          )}

          {guiaAtual === 'tabelaDesign' && (
            <GrupoDaFaixa nome="Estilos de Tabela">
              <Bt dica="Tabela com Grade" ativo={doc.tabela?.estilo === 'grade'}
                aoClicar={() => mudar(d => (d.tabela ? { ...d, tabela: { ...d.tabela, estilo: 'grade' } } : d))}>
                <span className="flex flex-col items-center">
                  <Grid2x2 className="w-4 h-4" />
                  <span style={{ fontSize: 9 }}>Com grade</span>
                </span>
              </Bt>
              <Bt dica="Tabela Listrada" ativo={doc.tabela?.estilo === 'listrada'}
                aoClicar={() => mudar(d => (d.tabela ? { ...d, tabela: { ...d.tabela, estilo: 'listrada' } } : d))}>
                <span className="flex flex-col items-center">
                  <Rows3 className="w-4 h-4" />
                  <span style={{ fontSize: 9 }}>Listrada</span>
                </span>
              </Bt>
              <Bt dica="Sem Estilo" ativo={doc.tabela?.estilo === 'nenhum'}
                aoClicar={() => mudar(d => (d.tabela ? { ...d, tabela: { ...d.tabela, estilo: 'nenhum' } } : d))}>
                <span className="flex flex-col items-center">
                  <Square className="w-4 h-4" />
                  <span style={{ fontSize: 9 }}>Sem estilo</span>
                </span>
              </Bt>
            </GrupoDaFaixa>
          )}

          {guiaAtual === 'imagem' && (
            <GrupoDaFaixa nome="Organizar">
              <Bt dica="Quebra de Texto: Alinhada com o Texto" ativo={doc.imagem.quebra === 'linha'}
                aoClicar={() => mudar(d => ({ ...d, imagem: { ...d.imagem, quebra: 'linha' } }))}>
                <span className="flex flex-col items-center">
                  <AlignLeft className="w-4 h-4" />
                  <span style={{ fontSize: 9 }}>Com o texto</span>
                </span>
              </Bt>
              <Bt dica="Quebra de Texto: Quadrada" ativo={doc.imagem.quebra === 'quadrada'}
                aoClicar={() => mudar(d => ({ ...d, imagem: { ...d.imagem, quebra: 'quadrada' } }))}>
                <span className="flex flex-col items-center">
                  <WrapText className="w-4 h-4" />
                  <span style={{ fontSize: 9 }}>Quadrada</span>
                </span>
              </Bt>
              <Bt dica="Quebra de Texto: Atrás do Texto" ativo={doc.imagem.quebra === 'atras'}
                aoClicar={() => mudar(d => ({ ...d, imagem: { ...d.imagem, quebra: 'atras' } }))}>
                <span className="flex flex-col items-center">
                  <Square className="w-4 h-4" />
                  <span style={{ fontSize: 9 }}>Atrás</span>
                </span>
              </Bt>
            </GrupoDaFaixa>
          )}

          {editandoCabecalho && (
            <div className="ml-auto self-center pr-3">
              <button type="button" className="ins-fechar-cabecalho"
                onClick={() => setEditandoCabecalho(false)}>
                Fechar Cabeçalho e Rodapé
              </button>
            </div>
          )}
        </div>

        <ReguaDoWord larguraCm={LARGURA_CM} margemCm={MARGEM_CM} />

        {/* O documento, com duas páginas.

            As medidas descem daqui para o CSS. Elas já foram esquecidas uma
            vez: sem `--largura-cm` e `--margem-cm`, o `calc()` da folha fica
            inválido, o navegador descarta largura e padding em silêncio, e as
            duas páginas viram uma faixa branca da largura da janela. Hoje o
            CSS tem valor de reserva e `word.test.ts` cobra que estas medidas
            cheguem — mas o lugar certo delas continua sendo aqui. */}
        <div className="wd-canvas" onClick={fecharMenu} style={{
          ['--largura-cm' as string]: LARGURA_CM,
          ['--altura-cm' as string]: ALTURA_CM,
          ['--margem-cm' as string]: MARGEM_CM,
        }}>
          {paginaConteudo(1)}
          {paginaConteudo(2)}
        </div>

        <div className="wd-status">
          <span>Página 1 de 2</span>
          <span className="hidden sm:inline">{doc.tabela ? `Tabela de ${doc.tabela.linhas.length} linhas` : 'Sem tabela'}</span>
          <span className="hidden md:inline">Português (Brasil)</span>
          <ZoomDoWord zoom={zoom} aoMudar={setZoom} />
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}

/*
  A folha e o que entra nela.

  Fica aqui, e não em `word.tsx`, porque nada disto é do Word em geral: é a
  tabela, a foto e as áreas de cabeçalho deste exercício. O que é da janela —
  guias, faixa, régua, status — continua vindo de lá, compartilhado.
*/
const CSS_INSERCAO = `
/* Cabeçalho e rodapé moram na margem da folha, e não dentro dela: é por isso
   que o Word os desenha acima e abaixo do texto, separados por um tracejado.
   O recuo negativo os leva de volta à borda do papel, porque o padding da
   folha é a margem — e cabeçalho impresso fica *na* margem. */
.ins-cabecalho, .ins-rodape {
  font-size: calc(9 * var(--px-cm) * 0.035277px); color: #605E5C;
  /* O recuo negativo põe os dois *dentro* da margem da folha, que é onde o
     Word os desenha — e é o que faz o desbravador entender que cabeçalho não
     é a primeira linha do texto: ele mora fora da área de escrita. */
  margin-left: calc(var(--margem-cm, 2.5) * var(--px-cm) * -0.5px);
  margin-right: calc(var(--margem-cm, 2.5) * var(--px-cm) * -0.5px);
}
.ins-cabecalho {
  border-bottom: 1px dashed #C8C6C4; padding-bottom: 3px;
  margin-top: calc(var(--margem-cm, 2.5) * var(--px-cm) * -0.5px);
  margin-bottom: calc(var(--margem-cm, 2.5) * var(--px-cm) * 0.3px);
}
.ins-rodape {
  border-top: 1px dashed #C8C6C4; padding-top: 3px;
  margin-top: auto; margin-bottom: calc(var(--margem-cm, 2.5) * var(--px-cm) * -0.5px);
  display: flex; align-items: center;
}
.ins-numero { margin-left: auto; font-weight: 600; color: #201F1E; }
.ins-campo { border: none; outline: none; background: transparent; width: 100%; font-size: 11px; }
.ins-campo:focus { outline: 1px solid #2B579A; }

/* O corpo não tem padding próprio: quem afasta o texto da borda é a margem da
   folha. Ter os dois somava margem em cima de margem, e o texto começava a
   quatro centímetros e meio da borda num papel de margem 2,5. */
.ins-corpo {
  flex: 1; font-size: calc(11 * var(--px-cm) * 0.035277px);
  line-height: 1.5; color: #201F1E;
}
.ins-titulo { font-size: calc(16 * var(--px-cm) * 0.035277px); font-weight: 700; margin-bottom: 8px; }
.ins-par { margin-bottom: 8px; text-align: justify; }
/* O lugar da tabela, dito dentro da folha. Era #A19F9D — o cinza de rótulo
   desligado do Fluent, 2.6:1 no papel branco —, e isto não é decoração: é a
   instrução que diz onde a tabela entra. Cinza secundário, e continua em
   itálico, que é o que o separa do texto do documento. */
.ins-vazio { color: #605E5C; font-style: italic; margin: 10px 0; }

/* A foto entra como uma letra gigante — que é como ela entra no Word — até que
   a quebra de texto mude isso. */
.ins-foto { width: 150px; border: 1px solid #E1DFDD; }
.ins-foto-linha { display: block; margin: 8px 0; }
.ins-foto-quadrada { float: right; margin: 0 0 8px 10px; }
.ins-foto-atras { position: relative; float: right; margin: 0 0 8px 10px; opacity: .35; }

.ins-tabela { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 12.5px; }
.ins-tabela td { padding: 0; border: 1px solid transparent; }
.ins-tabela-nenhum td { border-color: #E1DFDD; }
.ins-tabela-grade td { border-color: #605E5C; }
.ins-tabela-listrada td { border-color: #D6E8F7; }
.ins-tabela-listrada tr:nth-child(odd) td { background: #EFF6FC; }
.ins-celula {
  border: none; outline: none; background: transparent;
  width: 100%; padding: 3px 6px; font: inherit; color: inherit;
}

.ins-grade-linha { display: flex; }
.ins-grade-celula {
  width: 18px; height: 18px; margin: 1px; border: 1px solid #C8C6C4; background: #FFFFFF;
}
.ins-grade-celula:hover { background: #D6E8F7; border-color: #2B579A; }

.ins-fechar-cabecalho {
  background: #C43E1C; color: #FFFFFF; border: none; border-radius: 3px;
  padding: 5px 10px; font-size: 11.5px; font-weight: 600; white-space: nowrap;
}
`;
