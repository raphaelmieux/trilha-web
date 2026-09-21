import { useState } from 'react';
import { Printer, Pencil, FileSignature, Undo2 } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_DO_LEITOR, BarraDeTitulo, FaixaDoLeitor, CaixaDeProcurar, AvisoDeDigitalizacao,
  PainelDeMiniaturas, Folha, CamposDaFolha, MargemDeComentarios, ReguaDoLeitor,
  SetasDePagina, TelaInicialDoLeitor, type AcoesDoLeitor,
} from '../labs/leitorDePdf';
import {
  CSS_DO_DIGITALIZADOR, TopoDoScanner, PapelNaMesa, CantosDeRecorte,
  FileiraDeFiltros, ReguasDaCaptura, AvisoDeQualidade, AcoesDoScanner,
} from '../labs/digitalizador';
import {
  type Captura, type DocumentoPdf, type NivelDeCompressao,
  juntar, extrair, dividir, comprimir, reconhecerTexto, preencher, anotar,
  assinarComImagem, assinarVerificavel, estadoDaAssinatura, proteger, copiarTexto,
  procurar, qualidadeDaCaptura,
} from '../labs/documentoPdf';
import {
  type PastaDoClube, COMO_A_FOTO_CAI, RECIBO,
  comPdf, comDescoberta, pdfDe, exportarDeOrigem, paginaDePapel,
} from '../labs/dossieDoClube';
import { PASTAS_DA_CC_ES004 } from '../labs/metasDaCcEs004';
import {
  type EtapaDoScanner, type FiltroDoScanner, contrasteDoFiltro,
} from '../labs/capturaDoScanner';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * CC-ES004 — os sete laboratórios de PDF, numa tela só.
 *
 * ── Por que um componente para as sete ───────────────────────────────────
 * As sete lições abrem a **mesma** pasta do clube e o **mesmo** leitor: o que
 * muda entre elas é de que estado da pasta se parte e o que se cobra. Sete
 * componentes seriam sete leitores de PDF, e a plataforma já teve dois "Word"
 * uma vez. É o arranjo do `LaboratorioDePlanilha` sobre `excel.tsx` e do
 * `LaboratorioDeExplorador` sobre `explorer.tsx`, do outro lado da mesma
 * ponte.
 *
 * ── E a faixa não muda conforme o exercício ──────────────────────────────
 * Todos os comandos o tempo todo, porque é assim que um programa é. Um leitor
 * que só mostrasse Combinar na lição de combinar ensinaria a procurar o botão
 * que a tarefa quer, e não a procurar no programa. Comando que não cabe no que
 * está aberto **avisa**, como o "selecione primeiro" do Explorador — não fica
 * escondido, e não age no primeiro item que encontrar.
 *
 * ── O que é do programa mora fora daqui ──────────────────────────────────
 * A janela e as peças dela estão em `leitorDePdf.tsx`; o aplicativo de
 * digitalizar, em `digitalizador.tsx`; as contas, em `documentoPdf.ts`. Aqui
 * fica o que é do **exercício**: que diálogo cada comando abre, o que ele faz
 * com a pasta, e as duas descobertas que não deixam marca em arquivo nenhum.
 */

/* ── Os diálogos ──────────────────────────────────────────────────────────── */

type Dialogo =
  | { tipo: 'imprimir'; arquivo: string }
  | { tipo: 'editarOrigem'; arquivo: string; linha: string }
  | { tipo: 'combinar'; marcados: string[]; nome: string }
  | { tipo: 'extrair'; nome: string }
  | { tipo: 'dividir'; em: number; nomes: [string, string] }
  | { tipo: 'comprimir'; nivel: NivelDeCompressao }
  | { tipo: 'assinar'; modo: 'imagem' | 'verificavel' }
  | { tipo: 'proteger'; senha: string; naoCopiar: boolean; naoImprimir: boolean }
  | { tipo: 'comentar'; texto: string }
  | { tipo: 'destacar'; trecho: string }
  | { tipo: 'copiado'; texto: string }
  | { tipo: 'renomear'; de: string; para: string };

/* O estado do aplicativo de digitalizar, enquanto ele está aberto. */
interface Scanner {
  etapa: EtapaDoScanner;
  captura: Captura;
  filtro: FiltroDoScanner;
}

export const CSS_DO_LABORATORIO = `
.pdf-dialogo-fundo {
  position: absolute; inset: 0; background: rgba(15, 20, 26, 0.45);
  display: flex; align-items: center; justify-content: center; padding: 16px;
  z-index: 40;
}
.pdf-dialogo {
  background: #FFFFFF; color: #1F2328; border-radius: 6px;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.3);
  width: min(430px, 100%); max-height: 86%; overflow: auto; padding: 16px 18px;
}
.pdf-dialogo h4 { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #1F2328; }
.pdf-dialogo p { margin: 0 0 12px; font-size: 12.5px; color: #57606A; }
.pdf-dialogo label { display: block; font-size: 12.5px; margin-bottom: 8px; color: #1F2328; }
.pdf-dialogo input[type="text"], .pdf-dialogo select, .pdf-dialogo textarea {
  width: 100%; border: 1px solid #8C959F; border-radius: 3px; padding: 5px 7px;
  font: inherit; font-size: 12.5px; background: #FFFFFF; color: #1F2328; margin-top: 3px;
}
.pdf-dialogo-lista { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
.pdf-dialogo-lista label { display: flex; align-items: center; gap: 7px; margin: 0; }
.pdf-dialogo-acoes { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.pdf-dialogo-bt {
  border: 1px solid #C4C9CF; background: #FFFFFF; border-radius: 3px;
  padding: 5px 13px; font-size: 12.5px; color: #1F2328; cursor: pointer;
}
.pdf-dialogo-bt[data-tom="principal"] {
  background: #2E6BBE; border-color: #2E6BBE; color: #FFFFFF; font-weight: 600;
}
.pdf-dialogo-bt:disabled { opacity: 0.5; cursor: default; }
.pdf-copiado {
  background: #F3F5F7; border: 1px solid #D7DBE0; border-radius: 4px;
  padding: 9px 11px; font-size: 12px; white-space: pre-wrap; color: #1F2328;
  max-height: 190px; overflow: auto; margin-bottom: 12px;
}

/*
  No celular o diálogo sobe, porque a cápsula de tarefas mora no canto de
  baixo: centrado, um diálogo alto põe Cancelar e Confirmar debaixo dela — vê-se
  o formulário inteiro e não se vê como confirmar. É o mesmo conserto do
  diálogo do sistema da CC-ES001, e a regra vem **depois** da que centra:
  as duas têm a mesma especificidade, e escrita antes ela não valeria nada,
  sem nada estourar. A trava de tela confere a ordem, e não só a existência.

  A margem de hoje é fina: o mais alto dos diálogos, o de Imprimir, termina a
  19px do aviso de tela pequena. Dezenove pixels não são uma decisão.

  (E este comentário não leva crase em nome nenhum de arquivo: crase dentro de
  um template de CSS fecha a string no meio, o tsc acusa e o servidor de
  desenvolvimento continua servindo o módulo antigo — então a tela parece certa
  e a medida que se faz nela é de um arquivo que não existe mais.)
*/
@media (max-width: 720px) {
  .pdf-dialogo-fundo { align-items: flex-start; padding-top: 10px; }
}
`;

/* ── O laboratório ─────────────────────────────────────────────────────────── */

export default function LaboratorioDePdf({ vereda, licao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'pdf' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const licaoDaPasta = PASTAS_DA_CC_ES004[licao.pasta];
  const [pasta, setPasta] = useState<PastaDoClube>(licaoDaPasta.inicial);
  const [aberto, setAberto] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [escolhidas, setEscolhidas] = useState<string[]>([]);
  const [termo, setTermo] = useState('');
  const [procurou, setProcurou] = useState(false);
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);
  const [scanner, setScanner] = useState<Scanner | null>(null);
  const [aviso, setAviso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const doc = aberto ? pdfDe(pasta, aberto) : undefined;

  const avisar = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(a => (a === texto ? '' : a)), 7000);
  };

  /**
   * Toda mudança na pasta passa por aqui, e é aqui que a assinatura é olhada.
   *
   * Ver o selo virar "não confere" é uma das duas descobertas do módulo 6, e
   * ela **não deixa marca**: quem vê conserta em seguida, e o documento volta
   * a ser o que era. Então ela se registra no instante em que acontece, que é
   * o único instante em que ela existe.
   */
  const mudar = (f: (p: PastaDoClube) => PastaDoClube) => setPasta(p => {
    const nova = f(p);
    return nova.pdfs.some(d => estadoDaAssinatura(d) === 'quebrada')
      ? comDescoberta(nova, 'assinatura-quebra')
      : nova;
  });

  /** Mexe no documento aberto. Sem um aberto, avisa em vez de escolher um. */
  const mudarDoc = (f: (d: DocumentoPdf) => DocumentoPdf, oQue: string) => {
    if (!doc) { avisar(`Abra um documento antes de ${oQue}.`); return; }
    mudar(p => comPdf(p, f(doc)));
  };

  /* ── A faixa ───────────────────────────────────────────────────────────── */

  /*
    Todos os comandos, sempre. O que muda é o que cada um responde quando não
    há como executá-lo: ele **avisa**, e não age no primeiro documento que
    encontrar — é a decisão do "selecione primeiro" do laboratório de Word e
    do Aceitar sem marca escolhida do de revisão.
  */
  const acoes: AcoesDoLeitor = {
    aoCombinar: () => {
      if (pasta.pdfs.length < 2) { avisar('É preciso ter pelo menos dois PDFs na pasta.'); return; }
      setDialogo({
        tipo: 'combinar',
        marcados: pasta.pdfs.map(d => d.nome),
        nome: 'acampamento-2026-07-12-v01.pdf',
      });
    },
    aoExtrair: () => {
      if (!doc) { avisar('Abra o documento de onde a página sai.'); return; }
      if (!escolhidas.length) {
        avisar('Marque no painel da esquerda a página que você quer extrair.');
        return;
      }
      setDialogo({ tipo: 'extrair', nome: 'orcamento-so-2026-07-12-v01.pdf' });
    },
    aoDividir: () => {
      if (!doc) { avisar('Abra o documento que você quer dividir.'); return; }
      if (doc.paginas.length < 2) { avisar('Um documento de uma página só não se divide.'); return; }
      setDialogo({
        tipo: 'dividir',
        em: 1,
        nomes: ['parte-1-2026-07-12-v01.pdf', 'parte-2-2026-07-12-v01.pdf'],
      });
    },
    aoComprimir: () => {
      if (!doc) { avisar('Abra o documento que você quer reduzir.'); return; }
      setDialogo({ tipo: 'comprimir', nivel: 'forte' });
    },
    aoReconhecer: () => mudarDoc(reconhecerTexto, 'reconhecer o texto'),
    aoComentar: () => {
      if (!doc) { avisar('Abra o documento em que você quer comentar.'); return; }
      setDialogo({ tipo: 'comentar', texto: '' });
    },
    aoDestacar: () => {
      if (!doc) { avisar('Abra o documento em que você quer destacar.'); return; }
      setDialogo({ tipo: 'destacar', trecho: doc.paginas[pagina]?.linhas[0] ?? '' });
    },
    aoAssinar: () => {
      if (!doc) { avisar('Abra o documento que você quer assinar.'); return; }
      setDialogo({ tipo: 'assinar', modo: 'verificavel' });
    },
    aoProteger: () => {
      if (!doc) { avisar('Abra o documento que você quer proteger.'); return; }
      setDialogo({ tipo: 'proteger', senha: '', naoCopiar: true, naoImprimir: false });
    },
    /*
      Copiar devolve o texto **apesar** de "não permitir copiar", que é a
      segunda descoberta do módulo 6. Fazer a simulação obedecer ensinaria que
      a restrição é uma trava — que é a crença que o requisito 7 existe para
      desfazer, e ensinaria pela via pior: a de quem confiou nela.
    */
    aoCopiarTexto: () => {
      if (!doc) { avisar('Abra o documento de onde você quer copiar.'); return; }
      const texto = copiarTexto(doc);
      if (!texto.trim()) {
        avisar('Não há texto para copiar: este documento é imagem.');
        return;
      }
      if (doc.protecao?.pedeAoLeitor.naoCopiar) {
        mudar(p => comDescoberta(p, 'senha-nao-protege'));
      }
      setDialogo({ tipo: 'copiado', texto });
    },
    aoExportar: () => {
      if (!doc) { avisar('Abra o documento que você quer salvar.'); return; }
      avisar(`${doc.nome} salvo na pasta da atividade.`);
    },
  };

  /* ── O aplicativo de digitalizar ───────────────────────────────────────── */

  const abrirScanner = () => setScanner({
    etapa: 'camera',
    captura: COMO_A_FOTO_CAI,
    filtro: 'original',
  });

  const salvarDigitalizacao = (s: Scanner) => {
    const captura: Captura = { ...s.captura, contraste: contrasteDoFiltro(s.filtro) };
    /* O nome que a câmera dá, com a data da foto — é por ele que o módulo 7
       cobra renomear. Ele não pode coincidir com o de nenhuma foto que já
       esteja na pasta: `comPdf` casa por nome, e dois iguais fariam a
       digitalização **substituir** o outro documento sem nada avisar. */
    const novo: DocumentoPdf = {
      nome: 'IMG_20260702_143512.pdf',
      paginas: [paginaDePapel('recibo-1', RECIBO, captura)],
      campos: [],
      anotacoes: [],
    };
    mudar(p => comPdf(p, reconhecerTexto(novo)));
    setScanner(null);
    setAberto(novo.nome);
    setPagina(0);
    avisar('Digitalização salva como PDF na pasta da atividade.');
  };

  /* ── As tarefas ────────────────────────────────────────────────────────── */

  const metas = licaoDaPasta.metas.filter(m => licao.verificacoes.includes(m.id));
  const tarefas = metas.map(m => ({
    id: m.id,
    titulo: m.titulo,
    detalhe: m.detalhe,
    onde: m.onde,
    passos: m.passos,
    feita: m.feita(pasta),
  }));
  const faltam = tarefas.filter(t => !t.feita).length;

  const concluir = async () => {
    setSalvando(true);
    await aoVencer();
    aoSair();
  };

  const acoesDoPainel = (
    <div className="flex flex-col gap-2">
      <button onClick={concluir} disabled={faltam > 0 || salvando}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50">
        {faltam === 0 ? 'Concluir a lição' : `Faltam ${faltam}`}
      </button>
      <button
        onClick={() => {
          setPasta(licaoDaPasta.inicial());
          setAberto(null);
          setPagina(0);
          setEscolhidas([]);
          setTermo('');
          setProcurou(false);
        }}
        className="btn-ghost text-sm w-full justify-center"
      >
        <Undo2 className="w-4 h-4" /> Recomeçar a pasta
      </button>
      {/* Herda a cor de quem o desenha: este parágrafo cai no painel branco do
          computador e na bolha escura do celular. */}
      <p style={{ fontSize: 11, opacity: 0.75 }}>
        Clique num arquivo da lista para abri-lo. As miniaturas da esquerda marcam
        páginas; a caixa de procurar fica no fim da barra.
      </p>
    </div>
  );

  /* ── A tela ────────────────────────────────────────────────────────────── */

  const achados = procurou && doc ? procurar(doc, termo).length : null;

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={licao.titulo}
      programa="leitor-de-pdf"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoesDoPainel}
      rodape={28}
    >
      <style>{CSS_DO_LEITOR}</style>
      <style>{CSS_DO_DIGITALIZADOR}</style>
      <style>{CSS_DO_LABORATORIO}</style>

      <div className="pdf-janela">
        <BarraDeTitulo
          doc={doc ?? { nome: 'Documentos da atividade', paginas: [], campos: [], anotacoes: [] }}
          extra={doc && (
            <button type="button" className="pdf-linha-acao"
              onClick={() => { setAberto(null); setEscolhidas([]); setProcurou(false); }}>
              Voltar à pasta
            </button>
          )}
        />

        <FaixaDoLeitor
          acoes={acoes}
          procura={(
            <CaixaDeProcurar
              termo={termo}
              achados={achados}
              aoMudar={t => { setTermo(t); setProcurou(t.trim().length > 0); }}
            />
          )}
        />

        {doc && <AvisoDeDigitalizacao doc={doc} aoReconhecer={acoes.aoReconhecer} />}

        {doc
          ? (
            <div className="pdf-corpo">
              <PainelDeMiniaturas
                doc={doc}
                escolhidas={escolhidas}
                aoEscolher={(id, e) => {
                  setPagina(doc.paginas.findIndex(p => p.id === id));
                  setEscolhidas(atual => (e.ctrlKey || e.metaKey
                    ? (atual.includes(id) ? atual.filter(x => x !== id) : [...atual, id])
                    : (atual.length === 1 && atual[0] === id ? [] : [id])));
                }}
              />
              <div className="pdf-papel">
                {doc.paginas[pagina] && (
                  <Folha
                    pagina={doc.paginas[pagina]}
                    rodape={<CamposDaFolha doc={doc} aoPreencher={(id, valor) =>
                      mudarDoc(d => preencher(d, id, valor), 'preencher')} />}
                  />
                )}
              </div>
              <MargemDeComentarios anotacoes={doc.anotacoes} aoComentar={acoes.aoComentar} />
            </div>
          )
          : (
            <TelaInicialDoLeitor
              origens={pasta.origens}
              pdfs={pasta.pdfs}
              aoAbrir={nome => { setAberto(nome); setPagina(0); setEscolhidas([]); setProcurou(false); }}
              aoAbrirOrigem={nome => setDialogo({ tipo: 'imprimir', arquivo: nome })}
              aoRenomear={nome => setDialogo({ tipo: 'renomear', de: nome, para: nome })}
              aoDigitalizar={abrirScanner}
            />
          )}

        <ReguaDoLeitor
          doc={doc ?? { nome: '', paginas: [], campos: [], anotacoes: [] }}
          paginaAtual={doc ? pagina + 1 : 0}
          extra={doc && (
            <SetasDePagina indice={pagina} total={doc.paginas.length} aoIr={setPagina} />
          )}
        />

        {scanner && (
          <TelaDoScanner
            scanner={scanner}
            aoMudar={setScanner}
            aoSalvar={() => salvarDigitalizacao(scanner)}
            aoFechar={() => setScanner(null)}
          />
        )}

        {dialogo && (
          <CaixaDeDialogo
            dialogo={dialogo}
            pasta={pasta}
            doc={doc}
            escolhidas={escolhidas}
            aoMudar={setDialogo}
            aoFechar={() => setDialogo(null)}
            aoAplicar={f => { mudar(f); setDialogo(null); }}
            aoAbrir={nome => { setAberto(nome); setPagina(0); setEscolhidas([]); }}
            aoAvisar={avisar}
          />
        )}
      </div>
    </LaboratorioEmTelaCheia>
  );
}

/* ── O aplicativo de digitalizar, por cima do leitor ──────────────────────── */

/*
  Ele chega **errado** de propósito: torto, com a mesa em volta e em Original.
  O requisito 5 manda corrigir enquadramento e contraste, e um aplicativo que
  detectasse a borda certa e escolhesse o filtro bom sozinho entregaria a lição
  resolvida — apagando justamente o gesto que o requisito nomeia.
*/
function TelaDoScanner({ scanner, aoMudar, aoSalvar, aoFechar }: {
  scanner: Scanner;
  aoMudar: (s: Scanner) => void;
  aoSalvar: () => void;
  aoFechar: () => void;
}) {
  const captura: Captura = {
    ...scanner.captura,
    contraste: contrasteDoFiltro(scanner.filtro),
  };
  const ETAPA: Record<EtapaDoScanner, string> = {
    camera: 'Enquadre o papel',
    recorte: 'Ajuste os cantos',
    filtro: 'Escolha o filtro',
    salvo: 'Pronto',
  };
  const ROTULO: Record<EtapaDoScanner, string> = {
    camera: 'Tirar a foto',
    recorte: 'Confirmar o recorte',
    filtro: 'Salvar como PDF',
    salvo: 'Salvar como PDF',
  };

  const avancar = () => {
    if (scanner.etapa === 'camera') aoMudar({ ...scanner, etapa: 'recorte' });
    else if (scanner.etapa === 'recorte') aoMudar({ ...scanner, etapa: 'filtro' });
    else aoSalvar();
  };

  return (
    <div className="scan-fundo">
      <div className="scan-app">
        <TopoDoScanner titulo="Digitalizar" etapa={ETAPA[scanner.etapa]} />

        <div className="scan-mesa">
          <PapelNaMesa linhas={RECIBO} captura={captura}>
            {scanner.etapa === 'recorte' && (
              <CantosDeRecorte
                margem={scanner.captura.margem}
                aoAjustar={m => aoMudar({ ...scanner, captura: { ...scanner.captura, margem: m } })}
              />
            )}
          </PapelNaMesa>
        </div>

        <AvisoDeQualidade qualidade={qualidadeDaCaptura(captura)} />

        {scanner.etapa !== 'camera' && (
          <ReguasDaCaptura
            captura={scanner.captura}
            aoMudar={c => aoMudar({ ...scanner, captura: c })}
          />
        )}

        {scanner.etapa === 'filtro' && (
          <FileiraDeFiltros
            escolhido={scanner.filtro}
            aoEscolher={f => aoMudar({ ...scanner, filtro: f })}
          />
        )}

        <AcoesDoScanner
          etapa={scanner.etapa}
          aoAvancar={avancar}
          aoRefazer={scanner.etapa === 'camera' ? undefined : aoFechar}
          rotuloPrincipal={ROTULO[scanner.etapa]}
        />
      </div>
    </div>
  );
}

/* ── As caixas de diálogo ─────────────────────────────────────────────────── */

function CaixaDeDialogo({
  dialogo, pasta, doc, escolhidas, aoMudar, aoFechar, aoAplicar, aoAbrir, aoAvisar,
}: {
  dialogo: Dialogo;
  pasta: PastaDoClube;
  doc?: DocumentoPdf;
  escolhidas: string[];
  aoMudar: (d: Dialogo) => void;
  aoFechar: () => void;
  aoAplicar: (f: (p: PastaDoClube) => PastaDoClube) => void;
  aoAbrir: (nome: string) => void;
  aoAvisar: (t: string) => void;
}) {
  const fecha = (
    <button type="button" className="pdf-dialogo-bt" onClick={aoFechar}>Cancelar</button>
  );

  const corpo = () => {
    switch (dialogo.tipo) {
      /*
        O caminho do requisito 4.1 é **Imprimir → Salvar como PDF**, e não três
        janelas de Office. É o caminho universal, é o que de fato se usa no
        clube, e a caixa de impressão é a mesma nos três programas —
        reconstruir Word, Excel e PowerPoint aqui seria reconstruir o que a
        AP043 e a AP044 já ensinam.
      */
      case 'imprimir': {
        const origem = pasta.origens.find(a => a.nome === dialogo.arquivo);
        if (!origem) return null;
        const jaTem = !!pasta.pdfs.find(d => d.geradoDe === origem.programa);
        return (
          <>
            <h4><Printer className="w-4 h-4 inline mr-1.5" />Imprimir — {origem.nome}</h4>
            <p>
              Impressora: <strong>Salvar como PDF</strong> · 1 página
            </p>
            <div className="pdf-copiado">{origem.linhas.join('\n')}</div>
            <div className="pdf-dialogo-acoes">
              {jaTem && (
                <button type="button" className="pdf-dialogo-bt"
                  onClick={() => aoMudar({
                    tipo: 'editarOrigem', arquivo: origem.nome, linha: '',
                  })}>
                  <Pencil className="w-3.5 h-3.5 inline mr-1" />Editar o arquivo
                </button>
              )}
              {fecha}
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                onClick={() => {
                  const novo = exportarDeOrigem(origem);
                  aoAplicar(p => comPdf(p, novo));
                  aoAbrir(novo.nome);
                }}>
                Salvar como PDF
              </button>
            </div>
          </>
        );
      }

      /*
        Mexer na origem depois de exportar é o que mostra o PDF ficando para
        trás. Ele guarda um retrato, e não um vínculo — é essa a razão de ser
        ótimo para distribuir e péssimo para escrever junto.
      */
      case 'editarOrigem': {
        const origem = pasta.origens.find(a => a.nome === dialogo.arquivo);
        if (!origem) return null;
        return (
          <>
            <h4>Editar — {origem.nome}</h4>
            <p>Acrescente uma linha ao arquivo e depois olhe o PDF que você gerou dele.</p>
            <label>
              Linha nova
              <input type="text" value={dialogo.linha} autoFocus
                onChange={e => aoMudar({ ...dialogo, linha: e.target.value })} />
            </label>
            <div className="pdf-dialogo-acoes">
              {fecha}
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                disabled={!dialogo.linha.trim()}
                onClick={() => {
                  aoAplicar(p => ({
                    ...p,
                    origens: p.origens.map(a => (a.nome === origem.nome
                      ? { ...a, linhas: [...a.linhas, dialogo.linha.trim()] }
                      : a)),
                  }));
                  aoAvisar('Arquivo salvo. O PDF que você gerou antes não acompanhou.');
                }}>
                Salvar o arquivo
              </button>
            </div>
          </>
        );
      }

      case 'combinar':
        return (
          <>
            <h4>Combinar arquivos</h4>
            <p>Os documentos entram na ordem em que aparecem aqui.</p>
            <div className="pdf-dialogo-lista">
              {pasta.pdfs.map(d => (
                <label key={d.nome}>
                  <input
                    type="checkbox"
                    checked={dialogo.marcados.includes(d.nome)}
                    onChange={e => aoMudar({
                      ...dialogo,
                      marcados: e.target.checked
                        ? [...dialogo.marcados, d.nome]
                        : dialogo.marcados.filter(n => n !== d.nome),
                    })}
                  />
                  {d.nome}
                </label>
              ))}
            </div>
            <label>
              Nome do arquivo combinado
              <input type="text" value={dialogo.nome}
                onChange={e => aoMudar({ ...dialogo, nome: e.target.value })} />
            </label>
            <div className="pdf-dialogo-acoes">
              {fecha}
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                disabled={dialogo.marcados.length < 2 || !dialogo.nome.trim()}
                onClick={() => {
                  const entram = pasta.pdfs.filter(d => dialogo.marcados.includes(d.nome));
                  const novo = juntar(entram, dialogo.nome.trim());
                  aoAplicar(p => comPdf(p, novo));
                  aoAbrir(novo.nome);
                }}>
                Combinar
              </button>
            </div>
          </>
        );

      case 'extrair':
        return (
          <>
            <h4>Extrair páginas</h4>
            <p>
              {escolhidas.length} {escolhidas.length === 1 ? 'página marcada' : 'páginas marcadas'}.
              O documento inteiro continua na pasta — extrair copia para fora, não recorta.
            </p>
            <label>
              Nome do arquivo novo
              <input type="text" value={dialogo.nome}
                onChange={e => aoMudar({ ...dialogo, nome: e.target.value })} />
            </label>
            <div className="pdf-dialogo-acoes">
              {fecha}
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                disabled={!dialogo.nome.trim()}
                onClick={() => {
                  if (!doc) return;
                  aoAplicar(p => comPdf(p, extrair(doc, escolhidas, dialogo.nome.trim())));
                }}>
                Extrair
              </button>
            </div>
          </>
        );

      case 'dividir':
        return (
          <>
            <h4>Dividir documento</h4>
            <p>O segundo arquivo começa na página escolhida. Nenhuma página some no caminho.</p>
            <label>
              O segundo arquivo começa em
              <select value={dialogo.em}
                onChange={e => aoMudar({ ...dialogo, em: Number(e.target.value) })}>
                {doc?.paginas.map((_, i) => (
                  i > 0 && <option key={i} value={i}>Página {i + 1}</option>
                ))}
              </select>
            </label>
            <label>
              Nome da primeira parte
              <input type="text" value={dialogo.nomes[0]}
                onChange={e => aoMudar({ ...dialogo, nomes: [e.target.value, dialogo.nomes[1]] })} />
            </label>
            <label>
              Nome da segunda parte
              <input type="text" value={dialogo.nomes[1]}
                onChange={e => aoMudar({ ...dialogo, nomes: [dialogo.nomes[0], e.target.value] })} />
            </label>
            <div className="pdf-dialogo-acoes">
              {fecha}
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                onClick={() => {
                  if (!doc) return;
                  const corte = doc.paginas[dialogo.em];
                  if (!corte) return;
                  const [um, dois] = dividir(doc, corte.id, dialogo.nomes);
                  aoAplicar(p => comPdf(comPdf(p, um), dois));
                }}>
                Dividir
              </button>
            </div>
          </>
        );

      case 'comprimir':
        return (
          <>
            <h4>Reduzir tamanho do arquivo</h4>
            <p>
              O que a redução joga fora é qualidade de imagem. Num documento digitado
              não há o que jogar fora, e o arquivo quase não muda de tamanho.
            </p>
            <div className="pdf-dialogo-lista">
              {(['leve', 'forte'] as NivelDeCompressao[]).map(n => (
                <label key={n}>
                  <input type="radio" name="nivel" checked={dialogo.nivel === n}
                    onChange={() => aoMudar({ ...dialogo, nivel: n })} />
                  {n === 'leve' ? 'Redução leve — guarda mais nitidez' : 'Redução forte — arquivo bem menor'}
                </label>
              ))}
            </div>
            <div className="pdf-dialogo-acoes">
              {fecha}
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                onClick={() => {
                  if (!doc) return;
                  aoAplicar(p => comPdf(p, comprimir(doc, dialogo.nivel)));
                }}>
                Reduzir
              </button>
            </div>
          </>
        );

      /*
        As duas assinaturas desenham o mesmo rabisco na mesma página, e é isso
        que faz o requisito 6 existir. A diferença aparece **depois**: a
        verificável guarda a impressão do documento e quebra se alguém mexer; a
        colada é um desenho, e por isso nunca acusa nada.
      */
      case 'assinar':
        return (
          <>
            <h4><FileSignature className="w-4 h-4 inline mr-1.5" />Assinar documento</h4>
            <p>As duas desenham a mesma assinatura na página.</p>
            <div className="pdf-dialogo-lista">
              <label>
                <input type="radio" name="modo" checked={dialogo.modo === 'imagem'}
                  onChange={() => aoMudar({ ...dialogo, modo: 'imagem' })} />
                Imagem da assinatura — uma figura colada na página
              </label>
              <label>
                <input type="radio" name="modo" checked={dialogo.modo === 'verificavel'}
                  onChange={() => aoMudar({ ...dialogo, modo: 'verificavel' })} />
                Assinatura verificável — guarda quem assinou, quando e o documento
              </label>
            </div>
            <div className="pdf-dialogo-acoes">
              {fecha}
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                onClick={() => {
                  if (!doc) return;
                  aoAplicar(p => comPdf(p, dialogo.modo === 'imagem'
                    ? assinarComImagem(doc)
                    : assinarVerificavel(doc, 'Marta Rocha', Date.now())));
                }}>
                Assinar
              </button>
            </div>
          </>
        );

      case 'proteger':
        return (
          <>
            <h4>Proteger com senha</h4>
            <p>A senha é pedida para abrir o documento. As duas caixas abaixo são pedidos.</p>
            <label>
              Senha
              <input type="text" value={dialogo.senha} autoFocus
                onChange={e => aoMudar({ ...dialogo, senha: e.target.value })} />
            </label>
            <div className="pdf-dialogo-lista">
              <label>
                <input type="checkbox" checked={dialogo.naoCopiar}
                  onChange={e => aoMudar({ ...dialogo, naoCopiar: e.target.checked })} />
                Não permitir copiar texto
              </label>
              <label>
                <input type="checkbox" checked={dialogo.naoImprimir}
                  onChange={e => aoMudar({ ...dialogo, naoImprimir: e.target.checked })} />
                Não permitir imprimir
              </label>
            </div>
            <div className="pdf-dialogo-acoes">
              {fecha}
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                disabled={!dialogo.senha.trim()}
                onClick={() => {
                  if (!doc) return;
                  aoAplicar(p => comPdf(p, proteger(doc, {
                    senha: dialogo.senha.trim(),
                    pedeAoLeitor: {
                      naoCopiar: dialogo.naoCopiar,
                      naoImprimir: dialogo.naoImprimir,
                    },
                  })));
                }}>
                Proteger
              </button>
            </div>
          </>
        );

      case 'comentar':
        return (
          <>
            <h4>Novo comentário</h4>
            <p>Ele fica na margem, fora do papel, e não sai na impressão.</p>
            <label>
              Comentário
              <textarea rows={3} value={dialogo.texto} autoFocus
                onChange={e => aoMudar({ ...dialogo, texto: e.target.value })} />
            </label>
            <div className="pdf-dialogo-acoes">
              {fecha}
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                disabled={!dialogo.texto.trim()}
                onClick={() => {
                  if (!doc) return;
                  aoAplicar(p => comPdf(p, anotar(doc, {
                    id: `c-${doc.anotacoes.length + 1}`,
                    paginaId: doc.paginas[0].id,
                    tipo: 'comentario',
                    por: 'Ana Beatriz Rocha',
                    texto: dialogo.texto.trim(),
                  })));
                }}>
                Comentar
              </button>
            </div>
          </>
        );

      case 'destacar':
        return (
          <>
            <h4>Destacar trecho</h4>
            <p>Marcação aponta onde; comentário diz o quê. Num documento que volta, os dois juntos poupam um telefonema.</p>
            <label>
              Trecho
              <select value={dialogo.trecho}
                onChange={e => aoMudar({ ...dialogo, trecho: e.target.value })}>
                {doc?.paginas[0]?.linhas.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <div className="pdf-dialogo-acoes">
              {fecha}
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                onClick={() => {
                  if (!doc) return;
                  aoAplicar(p => comPdf(p, anotar(doc, {
                    id: `h-${doc.anotacoes.length + 1}`,
                    paginaId: doc.paginas[0].id,
                    tipo: 'destaque',
                    por: 'Ana Beatriz Rocha',
                    texto: dialogo.trecho,
                  })));
                }}>
                Destacar
              </button>
            </div>
          </>
        );

      case 'copiado':
        return (
          <>
            <h4>Texto copiado</h4>
            <p>
              {doc?.protecao?.pedeAoLeitor.naoCopiar
                ? 'Este documento pede que o leitor não deixe copiar — e o texto veio assim mesmo.'
                : 'O texto do documento, como ele está gravado.'}
            </p>
            <div className="pdf-copiado">{dialogo.texto}</div>
            <div className="pdf-dialogo-acoes">
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                onClick={aoFechar}>Fechar</button>
            </div>
          </>
        );

      case 'renomear':
        return (
          <>
            <h4>Renomear</h4>
            <p>Um padrão com data e versão ordena a pasta sozinho — é o que você escolheu na CC-ES001.</p>
            <label>
              Nome do arquivo
              <input type="text" value={dialogo.para} autoFocus
                onChange={e => aoMudar({ ...dialogo, para: e.target.value })} />
            </label>
            <div className="pdf-dialogo-acoes">
              {fecha}
              <button type="button" className="pdf-dialogo-bt" data-tom="principal"
                disabled={!dialogo.para.trim() || dialogo.para === dialogo.de}
                onClick={() => aoAplicar(p => ({
                  ...p,
                  pdfs: p.pdfs.map(d => (d.nome === dialogo.de
                    ? { ...d, nome: dialogo.para.trim() } : d)),
                }))}>
                Renomear
              </button>
            </div>
          </>
        );

      default: {
        const naoTratado: never = dialogo;
        throw new Error(`diálogo sem tela: ${JSON.stringify(naoTratado)}`);
      }
    }
  };

  return (
    <div className="pdf-dialogo-fundo" role="dialog" aria-modal="true">
      <div className="pdf-dialogo">{corpo()}</div>
    </div>
  );
}
