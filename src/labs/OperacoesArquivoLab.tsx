import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileArchive, FileText, Download, Printer, CheckCircle2, Circle,
  PackageOpen, Trash2, Settings, PartyPopper,
} from 'lucide-react';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';

/*
 * AP042 requisito 6 — as quatro tarefas que o documento manda demonstrar.
 *
 * Comprimir, exportar em pdf, instalar e imprimir. Nenhuma delas o navegador
 * pode fazer no computador de quem estuda: a página não instala programa nem
 * manda para a impressora da casa de ninguém. A alternativa seria a pessoa
 * marcar "fiz" numa lista, e autodeclaração é o que o resto da plataforma
 * evita — então as quatro acontecem aqui dentro, e o laboratório vê cada uma.
 *
 * ── Onde mora a lição de cada estação ────────────────────────────────────
 * Não é no acerto, é no erro que se escolhe. Três das quatro estações têm um
 * caminho errado que parece certo, e é ele que o desbravador vai encontrar na
 * vida:
 *
 *   compactar   — "compactar" não é "apagar": o original continua lá, e é por
 *                 isso que o espaço no disco não some sozinho depois;
 *   pdf         — apertar Salvar não vira pdf. Vira pdf quem troca o formato,
 *                 em Salvar como ou Exportar;
 *   desinstalar — arrastar o atalho para a lixeira não desinstala nada, e
 *                 apagar a pasta deixa sobra espalhada pelo sistema. Este é o
 *                 engano mais comum dos quatro, e o que mais entope máquina de
 *                 clube;
 *   imprimir    — três cópias não agrupadas saem em ordem de página, e não em
 *                 ordem de documento. Quem descobre isso com o papel na mão já
 *                 gastou a tinta.
 *
 * Errar não reprova: explica e devolve a vez, como no laboratório de cuidados.
 */

interface Arquivo { id: string; nome: string; tamanho: number }

const PASTA: Arquivo[] = [
  { id: 'f1', nome: 'acampamento-01.jpg', tamanho: 3.4 },
  { id: 'f2', nome: 'acampamento-02.jpg', tamanho: 2.9 },
  { id: 'f3', nome: 'lista-de-presenca.odt', tamanho: 0.2 },
  { id: 'f4', nome: 'relatorio-da-unidade.odt', tamanho: 0.3 },
];

const TOTAL = PASTA.reduce((s, a) => s + a.tamanho, 0);
/* Foto já vem comprimida de fábrica: o zip encolhe pouco aqui, e é isso que a
   estação diz em voz alta em vez de prometer milagre. */
const TOTAL_ZIP = 5.1;

const brasileiro = (n: number) => n.toFixed(1).replace('.', ',');

type Etapa = 'compactar' | 'pdf' | 'programa' | 'imprimir';

interface Impressao {
  copias: number;
  agrupado: boolean;
  qualidade: 'rascunho' | 'normal' | 'alta';
  ajuste: 'real' | 'pagina';
  porFolha: 1 | 2 | 4;
}

const PEDIDO: Impressao = {
  copias: 3, agrupado: true, qualidade: 'alta', ajuste: 'pagina', porFolha: 2,
};

interface Props { specialtyCode: string; lessonCode: string; requirementCodes: string[]; userId: string; }

export default function OperacoesArquivoLab({ specialtyCode, lessonCode, requirementCodes, userId }: Props) {
  // ── 1. Compactar e descompactar ──
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [zipCriado, setZipCriado] = useState(false);
  const [extraido, setExtraido] = useState(false);

  // ── 2. Salvar em pdf ──
  const [menuAberto, setMenuAberto] = useState(false);
  const [salvarComo, setSalvarComo] = useState(false);
  const [formato, setFormato] = useState('odt');
  const [pdfPronto, setPdfPronto] = useState(false);

  // ── 3. Instalar e desinstalar ──
  const [instalado, setInstalado] = useState(false);
  const [desinstalado, setDesinstalado] = useState(false);

  // ── 4. Imprimir ──
  const [imp, setImp] = useState<Impressao>({
    copias: 1, agrupado: false, qualidade: 'normal', ajuste: 'real', porFolha: 1,
  });
  const [impresso, setImpresso] = useState(false);

  const [correcao, setCorrecao] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  const feito: Record<Etapa, boolean> = {
    compactar: zipCriado && extraido,
    pdf: pdfPronto,
    programa: instalado && desinstalado,
    imprimir: impresso,
  };
  const tudoFeito = Object.values(feito).every(Boolean);

  const todosMarcados = PASTA.every(a => marcados[a.id]);

  const compactar = () => {
    if (!todosMarcados) {
      setCorrecao('Marque os quatro arquivos antes. Compactar age sobre o que está selecionado — o que ficar de fora não entra no zip.');
      return;
    }
    setCorrecao('');
    setZipCriado(true);
  };

  const imprimirIgual = imp.copias === PEDIDO.copias
    && imp.agrupado === PEDIDO.agrupado
    && imp.qualidade === PEDIDO.qualidade
    && imp.ajuste === PEDIDO.ajuste
    && imp.porFolha === PEDIDO.porFolha;

  const imprimir = () => {
    if (imprimirIgual) { setCorrecao(''); setImpresso(true); return; }
    const faltas: string[] = [];
    if (imp.copias !== PEDIDO.copias) faltas.push('a quantidade de cópias');
    if (imp.agrupado !== PEDIDO.agrupado) faltas.push('o agrupamento — sem ele saem todas as páginas 1, depois todas as 2');
    if (imp.qualidade !== PEDIDO.qualidade) faltas.push('a qualidade');
    if (imp.ajuste !== PEDIDO.ajuste) faltas.push('o ajuste de tamanho');
    if (imp.porFolha !== PEDIDO.porFolha) faltas.push('as páginas por folha');
    setCorrecao(`Ainda falta acertar ${faltas.join('; ')}.`);
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
        attempts: 1, correct_count: 4, total_questions: 4,
      });
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você concluiu as quatro tarefas, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'operacoes_concluidas', { specialtyCode, lessonCode, etapas: 4 });
    setPronto(true);
  };

  if (pronto) {
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

  const Cabecalho = ({ n, titulo, ok }: { n: number; titulo: string; ok: boolean }) => (
    <div className="flex items-center gap-2 mb-3">
      {ok
        ? <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
        : <Circle className="w-5 h-5" style={{ color: 'var(--color-text-faint)' }} />}
      <h2 className="font-bold">{n}. {titulo}</h2>
    </div>
  );

  const escolha = (rotulo: string, ativo: boolean, aoClicar: () => void) => (
    <button key={rotulo} onClick={aoClicar} className="btn-secondary text-xs py-1"
      style={ativo ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' } : undefined}>
      {rotulo}
    </button>
  );

  return (
    <div className="space-y-4">
      {correcao && (
        <p className="text-sm p-3 rounded-lg"
          style={{ backgroundColor: 'var(--color-warning-a10)', color: 'var(--color-text)' }}>
          {correcao}
        </p>
      )}

      {/* ── 1. Compactar ── */}
      <div className="card p-4">
        <Cabecalho n={1} titulo="Comprimir e descomprimir" ok={feito.compactar} />
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Você vai mandar estes quatro arquivos para a secretaria do clube. Mandar
          quatro anexos separados dá trabalho de organizar do outro lado — junte
          tudo num arquivo só. Marque os quatro e compacte.
        </p>

        <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--color-bg-input)' }}>
          {PASTA.map(a => (
            <label key={a.id} className="flex items-center gap-2 py-1 text-sm cursor-pointer">
              <input type="checkbox" checked={!!marcados[a.id]}
                onChange={e => setMarcados(m => ({ ...m, [a.id]: e.target.checked }))} />
              <FileText className="w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
              <span className="flex-1">{a.nome}</span>
              <span style={{ color: 'var(--color-text-dim)' }}>{brasileiro(a.tamanho)} MB</span>
            </label>
          ))}
          <p className="text-xs mt-2 pt-2" style={{ color: 'var(--color-text-dim)', borderTop: '1px solid var(--color-border)' }}>
            Total na pasta: {brasileiro(TOTAL)} MB
          </p>
        </div>

        {!zipCriado ? (
          <button onClick={compactar} className="btn-primary text-sm inline-flex items-center gap-2">
            <FileArchive className="w-4 h-4" /> Compactar em .zip
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--color-success-a10)' }}>
              <FileArchive className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
              <span className="flex-1">acampamento.zip</span>
              <span style={{ color: 'var(--color-text-dim)' }}>{brasileiro(TOTAL_ZIP)} MB</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              De {brasileiro(TOTAL)} MB para {brasileiro(TOTAL_ZIP)} MB. Encolheu pouco
              porque foto já vem comprimida de fábrica — o ganho aqui foi virar
              <strong> um anexo só</strong>, e não o tamanho. Repare também que os
              quatro originais continuam na pasta: compactar copia, não move.
            </p>
            {!extraido ? (
              <>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  A secretaria recebeu o zip e precisa abrir. Descompacte para ver
                  os arquivos de volta.
                </p>
                <button onClick={() => setExtraido(true)} className="btn-secondary text-sm inline-flex items-center gap-2">
                  <PackageOpen className="w-4 h-4" /> Extrair aqui
                </button>
              </>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-success)' }}>
                ✓ Os quatro arquivos voltaram inteiros, com o mesmo nome e o mesmo
                conteúdo. Compactar não estraga nada no caminho.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Salvar em pdf ── */}
      {feito.compactar && (
        <div className="card p-4">
          <Cabecalho n={2} titulo="Salvar um documento em pdf" ok={feito.pdf} />
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
            O relatório vai para a coordenação, que abre em outro computador. Em
            pdf ele chega com as margens, as fontes e as quebras de página do
            jeito que você deixou — e ninguém muda o texto sem querer.
          </p>

          <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-bg-input)' }}>
            <div className="flex items-center gap-2 text-sm mb-3">
              <FileText className="w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
              <span>relatorio-da-unidade.odt</span>
            </div>

            {!pdfPronto && (
              <>
                <button onClick={() => setMenuAberto(a => !a)} className="btn-secondary text-xs py-1">
                  Arquivo
                </button>
                {menuAberto && !salvarComo && (
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => setCorrecao('Salvar apenas grava por cima do mesmo .odt. Para virar pdf é preciso trocar o formato, e isso está em "Salvar como" ou em "Exportar".')}
                      className="block w-full text-left text-sm px-2 py-1 rounded"
                      style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                      Salvar
                    </button>
                    <button onClick={() => { setSalvarComo(true); setCorrecao(''); }}
                      className="block w-full text-left text-sm px-2 py-1 rounded"
                      style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                      Salvar como…
                    </button>
                    <button
                      onClick={() => setCorrecao('Imprimir manda para o papel. O que você quer é gerar um arquivo — continue por "Salvar como".')}
                      className="block w-full text-left text-sm px-2 py-1 rounded"
                      style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                      Imprimir…
                    </button>
                  </div>
                )}
                {salvarComo && (
                  <div className="mt-3 space-y-2">
                    <label className="block text-sm">
                      <span className="block text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>Tipo de arquivo</span>
                      <select value={formato} onChange={e => setFormato(e.target.value)} className="input-field text-sm">
                        <option value="odt">Documento de texto (.odt)</option>
                        <option value="docx">Documento do Word (.docx)</option>
                        <option value="txt">Texto sem formatação (.txt)</option>
                        <option value="pdf">PDF (.pdf)</option>
                      </select>
                    </label>
                    <button
                      onClick={() => {
                        if (formato === 'pdf') { setPdfPronto(true); setCorrecao(''); return; }
                        setCorrecao(formato === 'txt'
                          ? 'O .txt guarda só as letras: perde negrito, margem e imagem. Não serve para entregar um relatório formatado.'
                          : 'Esse formato continua sendo documento editável, e vai abrir diferente em cada computador. Escolha PDF.');
                      }}
                      className="btn-primary text-sm">
                      Salvar
                    </button>
                  </div>
                )}
              </>
            )}

            {pdfPronto && (
              <div className="flex items-center gap-2 p-2 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--color-success-a10)' }}>
                <Download className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                <span>relatorio-da-unidade.pdf — pronto para enviar</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. Instalar e desinstalar ── */}
      {feito.pdf && (
        <div className="card p-4">
          <Cabecalho n={3} titulo="Instalar e desinstalar um programa" ok={feito.programa} />

          {!instalado ? (
            <>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                O clube quer um programa de desenhar nos computadores da sala. De
                onde você baixa?
              </p>
              <div className="space-y-2">
                <button onClick={() => { setInstalado(true); setCorrecao(''); }}
                  className="block w-full text-left text-sm p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}>
                  Do site oficial do programa, ou da loja de aplicativos do sistema
                </button>
                <button
                  onClick={() => setCorrecao('Sites que juntam "programas grátis" costumam empacotar o instalador com outras coisas junto — barra de navegador, anúncio, às vezes pior. O programa até instala, e vem acompanhado.')}
                  className="block w-full text-left text-sm p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}>
                  De um site que reúne muitos programas grátis para baixar
                </button>
                <button
                  onClick={() => setCorrecao('Programa pago que aparece de graça num link de mensagem é isca. É assim que entra a maior parte dos vírus em computador de casa.')}
                  className="block w-full text-left text-sm p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}>
                  De um link que chegou no grupo, com a versão paga liberada
                </button>
              </div>
            </>
          ) : !desinstalado ? (
            <>
              <p className="text-sm mb-2" style={{ color: 'var(--color-success)' }}>
                ✓ Instalado a partir do site oficial.
              </p>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Passou um mês e ninguém usou o programa. A diretoria pediu para
                tirar da máquina. Como se tira um programa de verdade?
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setCorrecao('Arrastar o atalho para a lixeira apaga o atalho, e só. O programa continua instalado, ocupando o mesmo espaço — some só o caminho até ele.')}
                  className="flex items-center gap-2 w-full text-left text-sm p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}>
                  <Trash2 className="w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
                  Arrastar o atalho da área de trabalho para a lixeira
                </button>
                <button
                  onClick={() => setCorrecao('Apagar a pasta tira os arquivos principais e deixa o resto: registros do sistema, atalhos e configurações espalhadas. O sistema continua achando que o programa existe.')}
                  className="flex items-center gap-2 w-full text-left text-sm p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}>
                  <Trash2 className="w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
                  Apagar a pasta do programa dentro de Arquivos de Programas
                </button>
                <button onClick={() => { setDesinstalado(true); setCorrecao(''); }}
                  className="flex items-center gap-2 w-full text-left text-sm p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg-input)' }}>
                  <Settings className="w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
                  Abrir Configurações, ir em Aplicativos e mandar desinstalar
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-success)' }}>
              ✓ Desinstalado pelo caminho certo. O desinstalador desfaz o que a
              instalação fez — arquivos, atalhos e registros — em vez de deixar
              sobra pelo sistema.
            </p>
          )}
        </div>
      )}

      {/* ── 4. Imprimir ── */}
      {feito.programa && (
        <div className="card p-4">
          <Cabecalho n={4} titulo="Imprimir do jeito certo" ok={feito.imprimir} />
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
            O relatório tem 4 páginas e a diretoria pediu:
            <strong> 3 cópias agrupadas, em qualidade alta, ajustadas à página e
            com 2 páginas por folha</strong>. Acerte a janela de impressão antes
            de mandar.
          </p>

          <div className="rounded-lg p-3 space-y-3" style={{ backgroundColor: 'var(--color-bg-input)' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs w-32" style={{ color: 'var(--color-text-dim)' }}>Cópias</span>
              {[1, 2, 3, 5].map(n => escolha(String(n), imp.copias === n, () => setImp(i => ({ ...i, copias: n }))))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs w-32" style={{ color: 'var(--color-text-dim)' }}>Agrupamento</span>
              {escolha('Agrupado', imp.agrupado, () => setImp(i => ({ ...i, agrupado: true })))}
              {escolha('Não agrupado', !imp.agrupado, () => setImp(i => ({ ...i, agrupado: false })))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs w-32" style={{ color: 'var(--color-text-dim)' }}>Qualidade</span>
              {escolha('Rascunho', imp.qualidade === 'rascunho', () => setImp(i => ({ ...i, qualidade: 'rascunho' })))}
              {escolha('Normal', imp.qualidade === 'normal', () => setImp(i => ({ ...i, qualidade: 'normal' })))}
              {escolha('Alta', imp.qualidade === 'alta', () => setImp(i => ({ ...i, qualidade: 'alta' })))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs w-32" style={{ color: 'var(--color-text-dim)' }}>Tamanho</span>
              {escolha('Tamanho real', imp.ajuste === 'real', () => setImp(i => ({ ...i, ajuste: 'real' })))}
              {escolha('Ajustar à página', imp.ajuste === 'pagina', () => setImp(i => ({ ...i, ajuste: 'pagina' })))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs w-32" style={{ color: 'var(--color-text-dim)' }}>Páginas por folha</span>
              {([1, 2, 4] as const).map(n => escolha(String(n), imp.porFolha === n, () => setImp(i => ({ ...i, porFolha: n }))))}
            </div>

            <p className="text-xs pt-2" style={{ color: 'var(--color-text-dim)', borderTop: '1px solid var(--color-border)' }}>
              Vai sair: {imp.copias} {imp.copias === 1 ? 'cópia' : 'cópias'} de 4 páginas,
              {imp.agrupado ? ' cada cópia inteira de uma vez' : ' todas as páginas 1, depois todas as 2'},
              {imp.porFolha === 1 ? ' uma página por folha' : ` ${imp.porFolha} páginas por folha`} —
              {' '}{Math.ceil(4 / imp.porFolha) * imp.copias} folhas de papel.
            </p>
          </div>

          {!impresso ? (
            <button onClick={imprimir} className="btn-primary text-sm mt-3 inline-flex items-center gap-2">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          ) : (
            <p className="text-sm mt-3" style={{ color: 'var(--color-success)' }}>
              ✓ Saíram 3 cópias completas, uma depois da outra, em 6 folhas. Sem
              agrupar seriam as mesmas folhas fora de ordem, para separar à mão.
            </p>
          )}
        </div>
      )}

      {/* ── Entregar ── */}
      {tudoFeito && (
        <div className="card p-4 text-center">
          {erro && <p className="mb-3 text-sm" style={{ color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary inline-flex">
            {gravando ? 'Guardando…' : 'Concluir o laboratório'}
          </button>
        </div>
      )}
    </div>
  );
}
