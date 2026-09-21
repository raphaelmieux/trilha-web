import {
  ArrowLeft, Printer, Save, FileType2, FolderOpen, Cloud, Clock, HardDrive,
  Plus, Info, Share2, X, Search, Minus, Square as SquareIcon,
  Image as ImageIcon,
} from 'lucide-react';

/*
 * A moldura do Word 365, compartilhada.
 *
 * Dois laboratórios abrem um editor de texto — o de formatar um documento
 * inteiro, na AP041, e o de exportar em pdf e imprimir, na AP042 — e os dois
 * precisam da mesma janela. Duas cópias divergem no primeiro ajuste, e a
 * trilha passa a mostrar dois "Words" diferentes.
 *
 * ── Por que os bastidores importam tanto ─────────────────────────────────
 * No Word, Salvar como e Imprimir não são caixinhas: são telas inteiras que
 * cobrem o documento, com a faixa azul de opções à esquerda. É essa tela que
 * o desbravador precisa reconhecer, porque é nela que ele vai procurar o
 * campo "Tipo" para trocar de .docx para .pdf, e é nela que estão as listas
 * de agrupamento e páginas por folha que decidem quanto papel sai.
 *
 * Trocá-las por um diálogo genérico do Windows praticaria a decisão certa e
 * ensinaria a procurar no lugar errado.
 */

import { Fragment, type ReactNode } from 'react';

import {
  aparenciaDe, aparenciaDoTrecho, textoDoTrecho, larguraDaTabela,
  paginasDoDoc, blocoAntesDoSumario, NOME_DO_AUTOR, COR_DO_AUTOR,
  type Doc, type Bloco, type Paragrafo, type TabelaDoDoc, type ImagemDoDoc,
  type Disposicao, type ItemDeSumario, type FaixaDaPagina,
  type Comentario, type OpcoesDeBusca,
} from './documento';

export const CSS_WORD = `
/* A janela não tem mais moldura: ela é a tela. */
.wd-janela {
  background: #F3F2F1; color: #201F1E;
  /* O diálogo de Localizar e Substituir se posiciona nela, e não na tela: no
     Word ele é uma janela dentro da janela, e ancorá-lo no viewport o faria
     boiar por cima da cápsula de tarefas da plataforma. */
  position: relative;
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  /* Pixels por centímetro, e portanto o zoom da folha. 34 é 90% do
     tamanho real numa tela de 96 dpi; num celular de 390 px isso
     deixaria metade do documento fora da tela, e o Word também reduz.
     Mora na janela, e não no canvas, porque a régua precisa da mesma
     medida — foi o que a deixou sem largura na primeira tentativa.

     A escala da tela é uma coisa e o zoom que a pessoa escolhe é outra:
     separá-las deixa o controle do rodapé mexer só no segundo, sem
     desfazer a redução que o celular precisa. */
  --px-cm-tela: 34;
  --px-cm: calc(var(--px-cm-tela) * var(--zoom, 1));
}
@media (max-width: 640px)  { .wd-janela { --px-cm-tela: 17; } }
@media (min-width: 641px) and (max-width: 1023px) { .wd-janela { --px-cm-tela: 26; } }
.wd-titulo {
  background: #F9F8F7; border-bottom: 1px solid #E1DFDD;
  display: flex; align-items: center; gap: 10px; padding: 6px 10px; font-size: 12px;
}
.wd-guias {
  display: flex; gap: 2px; padding: 0 8px; background: #F9F8F7;
  border-bottom: 1px solid #E1DFDD; overflow-x: auto;
}
.wd-guia {
  padding: 6px 10px 7px; font-size: 12.5px; white-space: nowrap;
  border: none; background: none; color: #201F1E; cursor: pointer;
  border-bottom: 2px solid transparent;
}
.wd-guia:hover { background: #EDEBE9; }
.wd-guia[aria-selected="true"] { color: #2B579A; border-bottom-color: #2B579A; font-weight: 600; }
/* A guia contextual — a que só existe enquanto o cursor está na tabela ou na
   imagem — é laranja no Word, e não azul. A cor é o aviso de que ela vai
   embora: quem a confunde com uma guia fixa procura por ela depois e não
   acha. */
.wd-guia-contextual { color: #C43E1C; }
.wd-guia-contextual[aria-selected="true"] { color: #C43E1C; border-bottom-color: #C43E1C; }
.wd-faixa {
  display: flex; align-items: stretch; gap: 0; padding: 4px 6px 2px;
  background: #F3F2F1; border-bottom: 1px solid #E1DFDD; overflow-x: auto;
}
.wd-grupo {
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 0 8px; border-right: 1px solid #E1DFDD; min-width: max-content;
}
.wd-grupo-corpo { display: flex; align-items: flex-start; gap: 3px; padding: 2px 0 4px; }
.wd-grupo-nome { font-size: 10px; color: #605E5C; text-align: center; padding-bottom: 3px; }
.wd-bt {
  height: 24px; padding: 0 4px; border-radius: 3px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 3px;
  color: #201F1E; font-size: 12px;
}
.wd-bt:hover { background: #EDEBE9 !important; }
.wd-bt:focus-visible { outline: 2px solid #2B579A; outline-offset: 1px; }
.wd-combo {
  height: 24px; border: 1px solid #C8C6C4; background: #FFFFFF; color: #201F1E;
  border-radius: 2px; font-size: 12px; padding: 0 4px;
}
.wd-linhas { display: flex; flex-direction: column; gap: 3px; }
.wd-menu {
  position: absolute; z-index: 30; top: 100%; left: 0; margin-top: 2px;
  background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 3px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.22); min-width: 210px; padding: 4px;
  text-align: left;
}
.wd-menu-item {
  display: block; width: 100%; text-align: left; padding: 6px 10px;
  font-size: 12.5px; border: none; border-radius: 2px; cursor: pointer; color: #201F1E;
}
.wd-menu-item:hover { background: #EDEBE9 !important; }
.wd-regua {
  background: #FFFFFF; border-bottom: 1px solid #E1DFDD; padding: 3px 0;
  display: flex; justify-content: center;
}
.wd-canvas {
  background: #E6E6E6; padding: 18px 12px 40px; flex: 1; min-height: 0; overflow: auto;
}
/* A folha.

   As três medidas têm valor de reserva, e isso não é zelo: sem ele, uma folha
   desenhada por um laboratório que esqueça de passar as medidas vira
   um calc() sobre variável vazia — que é inválido, e o
   navegador descarta a declaração inteira sem dizer nada. A largura cai em
   auto, o padding em zero, e o que aparece na tela é uma faixa branca da
   largura da janela, sem margem: exatamente o defeito que a folha da AP043
   mostrou. É a mesma armadilha de escrever colr no lugar de color: o CSS erra calado.

   A4 em pé é o padrão porque é o papel que sai de toda impressora de clube. */
/* O position relative com z-index zero faz da folha um contexto de
   empilhamento, e é só por causa disso que a imagem "atrás do texto" pode
   existir: ela é desenhada com z-index -1, que a põe acima do fundo branco da
   folha e abaixo do texto dela. Sem o contexto aqui, o -1 a jogaria atrás do
   fundo de quem quer que seja o contexto mais próximo, e a imagem sumiria
   inteira — sem erro nenhum, que é como este defeito se apresentaria. */
.wd-pagina {
  background: #FFFFFF; margin: 0 auto; position: relative; z-index: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.28);
  width: calc(var(--largura-cm, 21) * var(--px-cm) * 1px);
  min-height: calc(var(--altura-cm, 29.7) * var(--px-cm) * 1px);
  padding: calc(var(--margem-cm, 2.5) * var(--px-cm) * 1px);
  display: flex; flex-direction: column;
}
/* O intervalo cinza entre uma folha e a seguinte. Sem ele as duas encostam e
   viram um papel só comprido — e o exercício que existe para mostrar que o
   cabeçalho se repete na página seguinte não tem página seguinte visível. */
.wd-pagina + .wd-pagina { margin-top: 16px; }
/* 1 pt = (96/72)/37,795 cm de pixel — a letra acompanha o zoom da folha. */
.wd-par { font-size: calc(var(--pt) * var(--px-cm) * 0.035277px); }
.wd-regua-barra {
  width: calc(var(--largura-cm, 21) * var(--px-cm) * 1px);
  height: 16px; position: relative; background: #C8C6C4; border-radius: 1px;
}
.wd-status {
  background: #F3F2F1; border-top: 1px solid #E1DFDD; color: #605E5C;
  font-size: 11.5px; padding: 4px 10px; display: flex; gap: 14px; align-items: center;
}
.wd-zoom { width: 74px; accent-color: #2B579A; cursor: pointer; }
.wd-zoom-bt { color: #605E5C; padding: 2px; border-radius: 2px; cursor: pointer; }
.wd-zoom-bt:hover { background: #EDEBE9; }
.wd-par { cursor: text; padding: 0 2px; }
.wd-par:hover { background: #F2F7FC; }

  /* ── Bastidores: a tela que o menu Arquivo abre por cima do documento ── */
  .wd-bastidores { flex: 1; min-height: 0; display: flex; background: #FFFFFF; }
  .wd-rail {
    width: 196px; flex: none; background: #2B579A; color: #FFFFFF;
    padding: 12px 0; overflow-y: auto;
  }
  .wd-rail button {
    display: block; width: 100%; text-align: left; padding: 8px 18px;
    font-size: 13px; color: #FFFFFF; background: none; border: none; cursor: pointer;
  }
  .wd-rail button:hover { background: rgba(255,255,255,.14); }
  .wd-rail button[aria-current="true"] { background: rgba(255,255,255,.22); font-weight: 600; }
  .wd-rail .wd-rail-sep { height: 1px; background: rgba(255,255,255,.22); margin: 8px 18px; }
  /* Escrito com o pai junto: .wd-rail button é mais específico e imporia
     largura total, e a seta de voltar do Word é um círculo. */
  .wd-rail .wd-voltar {
    width: 34px; height: 34px; border-radius: 50%; margin: 0 0 12px 14px;
    display: grid; place-items: center; background: rgba(255,255,255,.16);
    color: #FFFFFF; border: none; cursor: pointer;
  }
  .wd-rail .wd-voltar:hover { background: rgba(255,255,255,.28); }
  .wd-bast-corpo {
    flex: 1; min-width: 0; overflow: auto; padding: 20px 26px;
    background: #FFFFFF; color: #201F1E;
  }
  .wd-bast-titulo { font-size: 26px; font-weight: 300; color: #201F1E; margin-bottom: 16px; }
  .wd-bast-sub { font-size: 14px; font-weight: 600; color: #201F1E; margin: 14px 0 6px; }
  .wd-lugar {
    display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
    padding: 9px 10px; border-radius: 3px; font-size: 13px; color: #201F1E;
    background: none; border: none; cursor: pointer;
  }
  .wd-lugar:hover { background: #F3F2F1; }
  .wd-lugar[aria-current="true"] { background: #EDEBE9; font-weight: 600; }
  .wd-campo {
    height: 30px; padding: 0 8px; font-size: 13px; color: #201F1E;
    background: #FFFFFF; border: 1px solid #8A8886; border-radius: 2px; width: 100%;
  }
  .wd-campo:focus { outline: 2px solid #2B579A; outline-offset: -1px; }
  .wd-ajuste {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    width: 100%; height: 30px; padding: 0 8px; font-size: 12.5px; color: #201F1E;
    background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 2px;
  }
  .wd-imprimir-bt {
    display: inline-flex; align-items: center; gap: 8px; padding: 9px 20px;
    background: #2B579A; color: #FFFFFF; border: none; border-radius: 2px;
    font-size: 14px; cursor: pointer;
  }
  .wd-imprimir-bt:hover { background: #204072; }
  .wd-previa {
    flex: 1; min-width: 0; background: #E6E6E6; padding: 16px;
    display: flex; flex-direction: column; align-items: center; gap: 10px; overflow: auto;
  }
  .wd-previa-folha {
    background: #FFFFFF; width: 100%; max-width: 300px; aspect-ratio: 1 / 1.414;
    box-shadow: 0 1px 6px rgba(0,0,0,.3); padding: 18px; font-size: 8.5px;
    color: #201F1E; line-height: 1.6; overflow: hidden;
  }
  @media (max-width: 900px) { .wd-bast-lado { flex-direction: column; } }
`;

/* ── As telas dos bastidores ──────────────────────────────────────────────── */

export type PainelDosBastidores = 'inicio' | 'novo' | 'abrir' | 'informacoes'
  | 'salvar' | 'salvar-como' | 'imprimir' | 'compartilhar' | 'exportar';

/** As opções de impressão, do jeito que o Word as apresenta. */
export interface AjustesDeImpressao {
  copias: number;
  agrupado: boolean;
  qualidade: 'rascunho' | 'normal' | 'alta';
  ajuste: 'real' | 'pagina';
  porFolha: 1 | 2 | 4;
}

/** Uma lista de ajuste da coluna Configurações: nome em cima, escolha embaixo. */
function Ajuste({ rotulo, detalhe, valor, opcoes, aoMudar }: {
  rotulo: string; detalhe: string; valor: string;
  opcoes: [string, string][]; aoMudar: (v: string) => void;
}) {
  return (
    <label style={{ display: 'block', marginBottom: 10 }}>
      <span style={{ display: 'block', fontSize: 12, color: '#605E5C', marginBottom: 3 }}>{rotulo}</span>
      <select className="wd-ajuste" value={valor} aria-label={rotulo}
        onChange={e => aoMudar(e.target.value)}>
        {opcoes.map(([v, texto]) => <option key={v} value={v}>{texto}</option>)}
      </select>
      <span style={{ display: 'block', fontSize: 11, color: '#605E5C', marginTop: 2 }}>{detalhe}</span>
    </label>
  );
}

/**
 * Os bastidores do Word — a tela que o menu Arquivo abre por cima do
 * documento, com a faixa azul à esquerda.
 *
 * Recebe o que mostrar e devolve o que a pessoa escolheu; nenhuma decisão de
 * laboratório mora aqui.
 */
export function BastidoresDoWord({
  nomeDoArquivo, painel, aoTrocarPainel, aoVoltar,
  formato, aoMudarFormato, aoSalvarComo, aoSalvar, aoExportarPdf,
  imp, aoMudarImpressao, aoImprimir, aoAvisar, aoMudarNome, previaDaImpressao,
}: {
  nomeDoArquivo: string;
  /**
   * Quando o laboratório o entrega, o nome vira campo de digitar.
   *
   * A presença do setter é quem decide, como o `aoBuscar` do Explorador: na
   * AP042 o nome é enfeite, e um campo editável ali prometeria um gesto que
   * não muda nada; na CC-ES002 o nome **é** o requisito, e um campo de leitura
   * tiraria o único caminho até a tarefa.
   */
  aoMudarNome?: (v: string) => void;
  /**
   * O que a prévia de impressão mostra.
   *
   * Ela era o texto do documento da AP042, escrito dentro da janela
   * compartilhada: o segundo laboratório a abrir Imprimir mostraria a prévia do
   * relatório do outro exercício — prévia que diverge do documento é pior do
   * que prévia nenhuma, e é o mesmo defeito do `LeitorDeVereda` que discorda do
   * laboratório.
   */
  previaDaImpressao?: ReactNode;
  painel: PainelDosBastidores;
  aoTrocarPainel: (p: PainelDosBastidores) => void;
  aoVoltar: () => void;
  formato: string;
  aoMudarFormato: (f: string) => void;
  aoSalvarComo: () => void;
  aoSalvar: () => void;
  aoExportarPdf: () => void;
  imp: AjustesDeImpressao;
  aoMudarImpressao: (i: AjustesDeImpressao) => void;
  aoImprimir: () => void;
  aoAvisar: (o: string) => void;
}) {
  const folhas = Math.ceil(4 / imp.porFolha) * imp.copias;

  const itens: [PainelDosBastidores, string, typeof Save][] = [
    ['inicio', 'Início', Clock],
    ['novo', 'Novo', Plus],
    ['abrir', 'Abrir', FolderOpen],
    ['informacoes', 'Informações', Info],
    ['salvar', 'Salvar', Save],
    ['salvar-como', 'Salvar como', Save],
    ['imprimir', 'Imprimir', Printer],
    ['compartilhar', 'Compartilhar', Share2],
    ['exportar', 'Exportar', FileType2],
  ];

  return (
    <div className="wd-bastidores">
      <div className="wd-rail">
        <button className="wd-voltar" onClick={aoVoltar} aria-label="Voltar ao documento">
          <ArrowLeft className="w-4 h-4" />
        </button>
        {itens.map(([id, rotulo], i) => (
          <span key={id}>
            {i === 4 && <span className="wd-rail-sep" />}
            <button aria-current={painel === id}
              onClick={() => (id === 'salvar' ? aoSalvar() : aoTrocarPainel(id))}>
              {rotulo}
            </button>
          </span>
        ))}
        <span className="wd-rail-sep" />
        <button onClick={aoVoltar}>Fechar</button>
      </div>

      {/* ── Salvar como ── */}
      {painel === 'salvar-como' && (
        <div className="wd-bast-corpo">
          <p className="wd-bast-titulo">Salvar como</p>
          <div className="flex gap-6 wd-bast-lado">
            <div style={{ width: 210, flex: 'none' }}>
              {([
                ['Recente', Clock, false],
                ['OneDrive', Cloud, false],
                ['Este Computador', HardDrive, true],
              ] as const).map(([nome, Ico, aqui]) => (
                <button key={nome} className="wd-lugar" aria-current={aqui}
                  onClick={() => !aqui && aoAvisar(nome)}>
                  <Ico className="w-4 h-4" style={{ color: '#2B579A' }} /> {nome}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, minWidth: 0, maxWidth: 420 }}>
              <p style={{ fontSize: 12.5, color: '#605E5C', marginBottom: 10 }}>
                Documentos › Clube
              </p>
              <label style={{ display: 'block', marginBottom: 10 }}>
                <span style={{ display: 'block', fontSize: 12, color: '#605E5C', marginBottom: 3 }}>
                  Nome do arquivo
                </span>
                <input className="wd-campo" aria-label="Nome do arquivo"
                  readOnly={!aoMudarNome}
                  value={nomeDoArquivo.replace(/\.[^.]+$/, '')}
                  onChange={aoMudarNome ? e => aoMudarNome(e.target.value) : undefined} />
              </label>
              {/* É esta lista que o desbravador precisa achar depois: trocar o
                  tipo aqui é o que transforma o documento em pdf. */}
              <label style={{ display: 'block', marginBottom: 16 }}>
                <span style={{ display: 'block', fontSize: 12, color: '#605E5C', marginBottom: 3 }}>Tipo</span>
                <select className="wd-ajuste" value={formato} aria-label="Tipo"
                  onChange={e => aoMudarFormato(e.target.value)}>
                  <option value="docx">Documento do Word (*.docx)</option>
                  <option value="odt">Texto ODF (*.odt)</option>
                  <option value="txt">Texto sem Formatação (*.txt)</option>
                  <option value="pdf">PDF (*.pdf)</option>
                </select>
              </label>
              <button className="wd-imprimir-bt" onClick={aoSalvarComo}>
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Imprimir ── */}
      {painel === 'imprimir' && (
        <div className="wd-bast-corpo" style={{ display: 'flex', gap: 22, padding: '20px 22px' }}>
          <div style={{ width: 268, flex: 'none' }}>
            <p className="wd-bast-titulo" style={{ marginBottom: 12 }}>Imprimir</p>

            <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
              <button className="wd-imprimir-bt" onClick={aoImprimir}>
                <Printer className="w-4 h-4" /> Imprimir
              </button>
              <label className="flex items-center gap-2" style={{ fontSize: 12.5 }}>
                Cópias
                <select className="wd-ajuste" style={{ width: 68 }} value={imp.copias} aria-label="Cópias"
                  onChange={e => aoMudarImpressao({ ...imp, copias: Number(e.target.value) })}>
                  {[1, 2, 3, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </div>

            <p className="wd-bast-sub">Impressora</p>
            <div className="wd-ajuste" style={{ marginBottom: 12 }}>
              <span className="truncate">Impressora do clube (HP LaserJet)</span>
              <span style={{ fontSize: 11, color: '#107C41' }}>Pronta</span>
            </div>

            <p className="wd-bast-sub">Configurações</p>
            <Ajuste
              rotulo="Páginas" detalhe="O documento inteiro"
              valor="todas" opcoes={[['todas', 'Imprimir Todas as Páginas']]}
              aoMudar={() => aoAvisar('Escolher um intervalo de páginas')}
            />
            {/* Agrupar é a lista que ninguém repara e que decide se as cópias
                saem inteiras ou em ordem de página. */}
            <Ajuste
              rotulo="Agrupamento"
              detalhe={imp.agrupado
                ? '1, 2, 3   1, 2, 3   1, 2, 3'
                : '1, 1, 1   2, 2, 2   3, 3, 3'}
              valor={imp.agrupado ? 'sim' : 'nao'}
              opcoes={[['sim', 'Agrupado'], ['nao', 'Não Agrupado']]}
              aoMudar={v => aoMudarImpressao({ ...imp, agrupado: v === 'sim' })}
            />
            <Ajuste
              rotulo="Qualidade de impressão" detalhe="Quanto de tinta a impressora usa"
              valor={imp.qualidade}
              opcoes={[['rascunho', 'Rascunho'], ['normal', 'Normal'], ['alta', 'Alta']]}
              aoMudar={v => aoMudarImpressao({ ...imp, qualidade: v as AjustesDeImpressao['qualidade'] })}
            />
            <Ajuste
              rotulo="Tamanho" detalhe="A4 — 21 cm × 29,7 cm"
              valor={imp.ajuste}
              opcoes={[['real', 'Tamanho Real'], ['pagina', 'Ajustar à Página']]}
              aoMudar={v => aoMudarImpressao({ ...imp, ajuste: v as AjustesDeImpressao['ajuste'] })}
            />
            <Ajuste
              rotulo="Páginas por folha" detalhe={`${folhas} ${folhas === 1 ? 'folha' : 'folhas'} de papel no total`}
              valor={String(imp.porFolha)}
              opcoes={[['1', '1 Página por Folha'], ['2', '2 Páginas por Folha'], ['4', '4 Páginas por Folha']]}
              aoMudar={v => aoMudarImpressao({ ...imp, porFolha: Number(v) as AjustesDeImpressao['porFolha'] })}
            />
          </div>

          {/* A prévia, que no Word ocupa metade da tela e é o que faz a pessoa
              perceber o que vai sair antes de gastar papel. */}
          <div className="wd-previa">{previaDaImpressao}</div>
        </div>
      )}

      {/* ── Exportar ── */}
      {painel === 'exportar' && (
        <div className="wd-bast-corpo">
          <p className="wd-bast-titulo">Exportar</p>
          <div className="flex gap-6 wd-bast-lado">
            <div style={{ width: 230, flex: 'none' }}>
              <button className="wd-lugar" aria-current>
                <FileType2 className="w-4 h-4" style={{ color: '#B71C1C' }} /> Criar Documento PDF/XPS
              </button>
              <button className="wd-lugar" onClick={() => aoAvisar('Alterar o Tipo de Arquivo')}>
                <Save className="w-4 h-4" style={{ color: '#2B579A' }} /> Alterar o Tipo de Arquivo
              </button>
            </div>
            <div style={{ flex: 1, minWidth: 0, maxWidth: 440 }}>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Criar Documento PDF/XPS</p>
              <ul style={{ fontSize: 12.5, color: '#605E5C', marginBottom: 16, paddingLeft: 16, listStyle: 'disc' }}>
                <li>Mantém o layout, as fontes e as imagens</li>
                <li>O conteúdo não pode ser alterado facilmente</li>
                <li>Leitores gratuitos estão disponíveis na web</li>
              </ul>
              <button className="wd-imprimir-bt" onClick={aoExportarPdf}>
                <FileType2 className="w-4 h-4" /> Criar PDF/XPS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── As abas que existem e não fazem parte do exercício ── */}
      {!['salvar-como', 'imprimir', 'exportar'].includes(painel) && (
        <div className="wd-bast-corpo">
          <p className="wd-bast-titulo">
            {itens.find(([id]) => id === painel)?.[1] ?? 'Início'}
          </p>
          <p style={{ fontSize: 13, color: '#605E5C', maxWidth: 420 }}>
            Esta aba existe no Word de verdade, e está aqui para a tela ficar
            igual — mas não faz parte deste exercício. O que este laboratório
            pede está em <strong>Salvar como</strong>, <strong>Exportar</strong> e
            <strong> Imprimir</strong>.
          </p>
          <button className="wd-imprimir-bt" style={{ marginTop: 16 }} onClick={aoVoltar}>
            <X className="w-4 h-4" /> Voltar ao documento
          </button>
        </div>
      )}
    </div>
  );
}

/* ── A moldura da janela ───────────────────────────────────────────────────
 *
 * Barra de título, guias, faixa, régua, folha e barra de status moram aqui
 * pela razão que `windows.tsx` já registrou sobre o Explorador: duas cópias
 * divergem no primeiro ajuste, e a trilha passa a mostrar dois "Words"
 * diferentes.
 *
 * E foi o que aconteceu. O laboratório de formatação da AP042 tinha as onze
 * guias, a régua e o rodapé com zoom; o de inserção da AP043 redesenhou tudo
 * à mão e ficou com três guias, nenhuma régua e uma folha sem medida. Quem
 * chega na AP043 depois da AP042 vê um programa que não é mais o mesmo — e o
 * que a trilha estava ensinando a reconhecer era justamente esta janela.
 */

/** As guias do Word em português, na ordem em que ele as põe. */
export const GUIAS_DO_WORD = [
  'Início', 'Inserir', 'Desenhar', 'Design', 'Layout',
  'Referências', 'Correspondências', 'Revisão', 'Exibir', 'Ajuda',
] as const;

export function BarraDeTituloDoWord({ documento, estado = 'Salvo', aoAvisar }: {
  documento: string;
  estado?: string;
  aoAvisar: (recado: string) => void;
}) {
  return (
    <div className="wd-titulo">
      <span style={{ color: '#2B579A', fontWeight: 700, fontSize: 13 }}>W</span>
      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
        style={{ background: '#E6EEF7', color: '#2B579A', fontSize: 10.5, fontWeight: 600 }}>
        AutoSalvamento
      </span>
      <span style={{ fontWeight: 600 }}>{documento}</span>
      <span style={{ color: '#605E5C' }}>— {estado}</span>
      <button type="button"
        className="hidden sm:flex items-center gap-1 mx-auto px-3 py-1 rounded"
        style={{ background: '#EFEDEB', color: '#605E5C', fontSize: 11.5 }}
        onClick={() => aoAvisar('A caixa de pesquisa existe no Word de verdade, e está aqui para a barra ficar igual — mas não faz parte deste exercício.')}>
        <Search className="w-3 h-3" /> Pesquisar
      </button>
      <span className="ml-auto sm:ml-0 flex items-center gap-3" style={{ color: '#605E5C' }}>
        <button type="button" aria-label="Minimizar"
          onClick={() => aoAvisar('Minimizar não faz parte deste exercício.')}>
          <Minus className="w-3 h-3" />
        </button>
        <button type="button" aria-label="Maximizar"
          onClick={() => aoAvisar('O Word já está ocupando a tela inteira.')}>
          <SquareIcon className="w-2.5 h-2.5" />
        </button>
        <button type="button" aria-label="Fechar"
          onClick={() => aoAvisar('Fechar o Word não faz parte deste exercício.')}>
          <X className="w-3 h-3" />
        </button>
      </span>
    </div>
  );
}

/**
 * A fileira de guias.
 *
 * `usaveis` são as que este laboratório desenha; toda outra guia do Word
 * aparece assim mesmo, apagada, e responde que existe e não faz parte. Guia
 * que sumisse da fileira ensinaria que o Word não a tem — é a mesma regra do
 * comando de terminal que está fora do exercício.
 *
 * As contextuais entram no fim, na cor delas, porque é onde o Word as põe:
 * depois de todas as fixas, e só enquanto o cursor está no que as convoca.
 */
export function GuiasDoWord({
  atual, usaveis, contextuais = [], aoTrocar, aoAvisar, aoAbrirArquivo,
}: {
  atual: string;
  usaveis: readonly string[];
  contextuais?: readonly { id: string; nome: string }[];
  aoTrocar: (id: string) => void;
  aoAvisar: (recado: string) => void;
  /**
   * Quando o laboratório o entrega, Arquivo abre os bastidores — que é o que
   * ela faz no Word: ela não é guia, é a porta para Salvar como, Exportar e
   * Imprimir.
   *
   * A presença do setter é quem decide, como o `aoBuscar` do Explorador. Sem
   * ele a guia continua avisando que não faz parte do exercício, que é o certo
   * nas lições que não entregam arquivo nenhum; com ele, o laboratório não
   * precisa redesenhar a fileira de guias para ter a porta — que foi o que o
   * de operações fez, e é como a plataforma ficou com dois "Words" uma vez.
   */
  aoAbrirArquivo?: () => void;
}) {
  return (
    <div className="wd-guias" role="tablist">
      <button type="button" className="wd-guia"
        style={{ background: '#2B579A', color: '#FFFFFF', borderRadius: '3px 3px 0 0' }}
        onClick={aoAbrirArquivo
          ? aoAbrirArquivo
          : () => aoAvisar('A guia Arquivo existe no Word de verdade, e está aqui para a faixa ficar igual — mas não faz parte deste exercício.')}>
        Arquivo
      </button>
      {GUIAS_DO_WORD.map(nome => (
        usaveis.includes(nome) ? (
          <button key={nome} type="button" role="tab" aria-selected={atual === nome}
            className="wd-guia" onClick={() => aoTrocar(nome)}>{nome}</button>
        ) : (
          <button key={nome} type="button" className="wd-guia" style={{ color: '#8A8886' }}
            onClick={() => aoAvisar(`A guia ${nome} existe no Word de verdade, e está aqui para a faixa ficar igual — mas não faz parte deste exercício.`)}>
            {nome}
          </button>
        )
      ))}
      {contextuais.map(g => (
        <button key={g.id} type="button" role="tab" aria-selected={atual === g.id}
          className="wd-guia wd-guia-contextual" onClick={() => aoTrocar(g.id)}>
          {g.nome}
        </button>
      ))}
    </div>
  );
}

/** Grupo da faixa: os botões e, embaixo, o nome — como no Word. */
export function GrupoDaFaixa({ nome, children }: { nome: string; children: React.ReactNode }) {
  return (
    <div className="wd-grupo">
      <div className="wd-grupo-corpo">{children}</div>
      <div className="wd-grupo-nome">{nome}</div>
    </div>
  );
}

/**
 * Botão da faixa. `empilhado` é o botão grande do Word — ícone em cima,
 * palavra embaixo —, que é como Colar, Tabela e Imagens aparecem lá.
 */
export function BotaoDaFaixa({ dica, rotulo, ativo, aoClicar, children, empilhado }: {
  dica: string;
  rotulo?: string;
  ativo?: boolean;
  aoClicar: () => void;
  children: React.ReactNode;
  empilhado?: boolean;
}) {
  return (
    <button
      type="button" title={dica} aria-label={dica} aria-pressed={ativo}
      onClick={aoClicar}
      className="wd-bt"
      style={{
        backgroundColor: ativo ? '#D6E8F7' : 'transparent',
        border: ativo ? '1px solid #9EC5E8' : '1px solid transparent',
        minWidth: 24,
        ...(empilhado
          ? { flexDirection: 'column' as const, height: 'auto', padding: '2px 6px', gap: 1 }
          : {}),
      }}
    >
      {children}
      {rotulo && <span style={{ fontSize: 10.5 }}>{rotulo}</span>}
    </button>
  );
}

/** Botão que está na faixa para ela ficar igual, e diz isso quando clicado. */
export function EnfeiteDaFaixa({ dica, rotulo, children, aoAvisar, empilhado }: {
  dica: string;
  rotulo?: string;
  children: React.ReactNode;
  aoAvisar: (recado: string) => void;
  empilhado?: boolean;
}) {
  return (
    <BotaoDaFaixa dica={dica} rotulo={rotulo} empilhado={empilhado}
      aoClicar={() => aoAvisar(`${dica} existe no Word de verdade, e está aqui para a faixa ficar igual — mas não faz parte deste exercício.`)}>
      {children}
    </BotaoDaFaixa>
  );
}

/**
 * A régua.
 *
 * O cinza é a margem, o branco é onde o texto cabe, e os números contam a
 * partir da margem esquerda — como no Word. Ela existe em toda janela em
 * Layout de Impressão: é por ela que se lê onde a folha começa e acaba, e uma
 * janela sem régua não é a que o desbravador vai reencontrar.
 */
export function ReguaDoWord({ larguraCm, margemCm }: { larguraCm: number; margemCm: number }) {
  const medidas = {
    '--largura-cm': larguraCm,
    '--margem-cm': margemCm,
  } as React.CSSProperties;
  return (
    <div className="wd-regua" style={medidas} aria-hidden="true">
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
  );
}

/**
 * O controle de zoom do rodapé, e ele funciona.
 *
 * Estava desenhado e morto nos dois laboratórios. Com a folha em A4 de
 * verdade ele deixou de ser enfeite: uma página inteira não cabe na altura da
 * janela, e reduzir para ver a folha toda — ou para comparar duas — é o que
 * se faz no Word nessa hora. Botão desenhado que não faz nada ensina que o
 * programa também não faz.
 */
export function ZoomDoWord({ zoom, aoMudar }: { zoom: number; aoMudar: (z: number) => void }) {
  const passo = (d: number) => aoMudar(Math.min(1.5, Math.max(0.4, Number((zoom + d).toFixed(2)))));
  return (
    <span className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
      <button type="button" aria-label="Reduzir o zoom" onClick={() => passo(-0.1)} className="wd-zoom-bt">
        <Minus className="w-3 h-3" />
      </button>
      <input
        type="range" min={40} max={150} step={10} value={Math.round(zoom * 100)}
        aria-label="Zoom" className="wd-zoom"
        onChange={e => aoMudar(Number(e.target.value) / 100)} />
      <button type="button" aria-label="Aumentar o zoom" onClick={() => passo(0.1)} className="wd-zoom-bt">
        <Plus className="w-3 h-3" />
      </button>
      <span style={{ minWidth: 34, textAlign: 'right' }}>{Math.round(zoom * 100)}%</span>
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   A FOLHA
   ══════════════════════════════════════════════════════════════════════════
   O que estas peças desenham é do **documento**, e não do exercício: como um
   parágrafo se pinta, o que uma quebra de linha faz na tela, o que o sumário
   mostra quando não achou nada.

   Elas saíram do primeiro laboratório de Word da vereda no dia em que o
   segundo foi escrito — **antes** de a cópia existir, e não depois. É a mesma
   decisão que fez `word.tsx`, `excel.tsx` e `explorer.tsx` existirem, um nível
   abaixo, e o motivo está escrito nos três: duas cópias divergem no primeiro
   ajuste, e a plataforma passa a mostrar dois Word diferentes para o mesmo
   programa.

   Nenhuma guarda estado. Quem sabe qual parágrafo está escolhido é o
   laboratório, porque é ele que sabe o que fazer com o clique.
   ══════════════════════════════════════════════════════════════════════════ */

export const CSS_FOLHA = `
  .wd-bloco { cursor: text; }
  .wd-bloco.escolhido { outline: 1px solid #2B579A; outline-offset: 2px; }
  /* As marcas de parágrafo. Cinza claro, como no Word: elas são auxílio de
     edição e não podem competir com o texto que a pessoa está lendo. */
  .wd-marca { color: #9AA0A6; user-select: none; }
  /* O sombreado de campo, que é do Word e não nosso.

     É por ele que se vê, sem clicar em nada, qual legenda se numera sozinha e
     qual foi digitada. Trocá-lo por um aviso da plataforma poria na nossa tela
     a resposta que o programa imitado já dá na dele — e tirá-lo deixaria as
     duas legendas idênticas, com a diferença inteira do requisito 4.3
     invisível até alguém inserir uma figura no meio. */
  .wd-campo { background: #E1E1E1; }
  /* Tabulação.

     Sem isto o HTML colapsa o \t num espaço só, e a lista alinhada com Tab
     sai **reta** na folha — o defeito visível do relatório do módulo 3
     simplesmente não apareceria, e a lição viraria "converta porque a tarefa
     mandou". O jsdom não denuncia: lá o texto continua tendo o \t, e só o
     navegador decide que ele não vale nada.

     A parada de tabulação conta larguras de espaço, e espaço em fonte
     proporcional é estreito. 32 foi medido no Chromium: de 28 a 38 os quatro
     nomes curtos param na mesma coluna e só o comprido salta para a parada
     seguinte, que é exatamente o que a tabulação faz num documento de verdade.
     Abaixo de 28 o próprio cabeçalho sai fora de esquadro e a lista parece
     torta por outro motivo; de 40 em diante cabe tudo na mesma parada e o
     defeito some. 32 fica no meio da faixa de propósito: o número depende da
     métrica da fonte, e um valor na beirada viraria "alinhado" noutra máquina
     sem nada acusar. */
  .wd-tab { white-space: pre-wrap; tab-size: 32; }
  /* ── Revisão ─────────────────────────────────────────────────────────────
     Sublinhado no que entrou, riscado no que saiu, e a cor dizendo de quem é.
     Cor sozinha não basta — é a mesma razão de a insígnia ter forma e cor:
     quem não distingue as duas cores continua vendo o traço e o sublinhado. */
  .wd-rev-inserido { text-decoration: underline; }
  .wd-rev-excluido { text-decoration: line-through; }
  /* O realce do comentário é o do Word: fundo amarelo claro debaixo do texto
     a que ele está preso, e não um ícone na margem que não diz de onde é. */
  .wd-comentado { background: #FFF4CE; cursor: pointer; }

  /* A margem de revisão fica **fora** do papel: comentário não sai na
     impressão e não empurra o texto, e desenhá-lo dentro diria o contrário. */
  .wd-folha-com-margem { display: flex; align-items: flex-start; gap: 10px; }
  .wd-margem { width: 210px; flex: none; display: flex; flex-direction: column; gap: 8px; }
  .wd-balao {
    background: #FFFFFF; border: 1px solid #D1D1D1; border-left: 3px solid ${COR_DO_AUTOR.lideranca};
    border-radius: 3px; padding: 8px 10px; font-size: 11px; color: #201F1E;
  }
  .wd-balao.meu { border-left-color: ${COR_DO_AUTOR.voce}; }
  .wd-balao.resolvido { opacity: .55; border-left-color: #8A8886; }
  .wd-balao-autor { font-weight: 600; font-size: 10.5px; margin-bottom: 2px; }
  .wd-balao-resposta {
    margin-top: 6px; padding-left: 8px; border-left: 2px solid #E1DFDD;
  }
  .wd-balao textarea {
    width: 100%; margin-top: 6px; font: inherit; color: inherit;
    border: 1px solid #D1D1D1; border-radius: 2px; padding: 4px 6px; resize: vertical;
    background: #FFFFFF;
  }
  .wd-balao-acoes { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; }
  .wd-balao-acoes button {
    font: inherit; font-size: 10.5px; padding: 3px 8px; border-radius: 2px;
    border: 1px solid #D1D1D1; background: #FFFFFF; color: #201F1E; cursor: pointer;
  }
  .wd-balao-acoes button:hover { background: #F3F2F1; }

  /* No celular não há 210 px de sobra ao lado do papel: a margem desce para
     baixo dele, inteira. Esconder os balões tiraria o único caminho até duas
     das cinco tarefas — reduzir a tela nunca reduz o que dá para fazer nela. */
  @media (max-width: 900px) {
    .wd-folha-com-margem { flex-direction: column; align-items: stretch; }
    .wd-margem { width: auto; }
  }

  /* ── Localizar e Substituir ───────────────────────────────────────────── */
  .wd-dialogo {
    position: absolute; top: 12px; right: 12px; z-index: 5;
    background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 4px;
    box-shadow: 0 6px 20px rgba(0,0,0,.25); padding: 12px; width: 300px;
    font-size: 12px; color: #201F1E;
  }
  .wd-dialogo h4 { margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #201F1E; }
  .wd-dialogo label { display: block; margin-bottom: 6px; }
  .wd-dialogo input[type="text"] {
    width: 100%; font: inherit; padding: 4px 6px; margin-top: 2px;
    border: 1px solid #8A8886; border-radius: 2px; background: #FFFFFF; color: #201F1E;
  }
  .wd-dialogo .wd-caixa { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .wd-dialogo .wd-caixa input { margin: 0; }
  .wd-dialogo-acoes { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
  .wd-dialogo-acoes button {
    font: inherit; padding: 4px 10px; border-radius: 2px; cursor: pointer;
    border: 1px solid #D1D1D1; background: #FFFFFF; color: #201F1E;
  }
  .wd-dialogo-acoes button.principal { background: #2B579A; border-color: #2B579A; color: #FFFFFF; }

  /* Margem dos dois lados: ele deixou de abrir a folha e passou a ficar entre
     blocos, embaixo do título. Só embaixo o encostaria no que vem antes. */
  .wd-sumario {
    border: 1px solid #D1D1D1; padding: 8px 10px; margin: 12px 0;
    font-size: 10.5px; color: #201F1E;
  }
  .wd-sumario-linha { display: flex; gap: 6px; align-items: baseline; }
  .wd-sumario-pontos { flex: 1; border-bottom: 1px dotted #8A8886; }
  .wd-quebra-pagina {
    border-top: 1px dashed #8A8886; margin: 14px 0 10px;
    font-size: 9.5px; color: #767676; text-align: center; letter-spacing: .04em;
  }

  /* ── A tabela ─────────────────────────────────────────────────────────── */
  .wd-tabela { border-collapse: collapse; width: 100%; margin: 6px 0 10px; font-size: 10.5px; }
  .wd-tabela.escolhido { outline: 1px solid #2B579A; outline-offset: 2px; }
  .wd-tabela td { border: 1px solid #000000; padding: 3px 6px; color: #201F1E; }
  .wd-tabela caption { caption-side: top; }
  /* A célula editável. Ela é um campo de verdade, e desenhada para não
     parecer um: no Word a célula é texto, e uma caixinha com borda dentro de
     cada uma ensinaria uma tabela que não existe. */
  .wd-celula {
    border: none; background: transparent; padding: 0; margin: 0;
    font: inherit; color: inherit; width: 100%; min-width: 48px;
    outline: none;
  }
  .wd-celula:focus { box-shadow: inset 0 0 0 2px #2B579A; }
  .wd-tabela td.cursor { box-shadow: inset 0 0 0 2px #2B579A; }
  /* A linha de cabeçalho. Ela é negrito em toda a galeria do Word, e é o que
     se repetiria no alto da folha seguinte. */
  .wd-tabela .wd-th { font-weight: 700; }
  /* "Tabela de Lista 3": sem grade vertical, régua embaixo do cabeçalho. */
  .wd-tabela.est-lista td { border: none; border-bottom: 1px solid #BFBFBF; }
  .wd-tabela.est-lista .wd-th { border-bottom: 2px solid #4472C4; }
  /* "Tabela de Grade 4 — Ênfase 1": faixa azul no cabeçalho e linhas listradas. */
  .wd-tabela.est-grade4 td { border: 1px solid #FFFFFF; }
  .wd-tabela.est-grade4 .wd-th { background: #4472C4; color: #FFFFFF; }
  .wd-tabela.est-grade4 tr:nth-child(even) td { background: #D9E2F3; }
  .wd-tabela.est-grade4 tr:nth-child(odd) td { background: #EDF2FA; }
  .wd-tabela.est-grade4 .wd-th { background: #4472C4; }

  /* ── A imagem ─────────────────────────────────────────────────────────── */
  .wd-imagem {
    border: 1px solid #A6A6A6; background: #F2F2F2; color: #595959;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px; text-align: center; padding: 8px; box-sizing: border-box;
    width: 46%; aspect-ratio: 4 / 3; font-size: 9px; cursor: pointer;
  }
  .wd-imagem.escolhido { outline: 2px solid #2B579A; outline-offset: 1px; }
  .wd-imagem-nome { font-family: Consolas, "Courier New", monospace; font-size: 8px; color: #7F7F7F; }
  /* Alinhada com o texto: ela entra na linha como uma letra gigante, e é por
     isso que ela empurra o parágrafo inteiro para baixo dela. */
  .wd-disp-alinhada { display: inline-flex; vertical-align: text-bottom; margin: 0 2px 2px 0; }
  .wd-disp-quadrada, .wd-disp-proxima { float: left; margin: 2px 10px 6px 0; }
  /* Próxima contorna o desenho, e não a caixa. Sem foto de verdade o que dá
     para mostrar honestamente é o recorte da caixa. */
  .wd-disp-proxima { border-radius: 50% / 22%; }
  .wd-disp-acima-e-abaixo { display: flex; margin: 8px auto; clear: both; }
  /* A legenda de uma figura que flutua flutua com ela, e na largura dela.

     Sem isto a legenda é um parágrafo comum logo depois do float: as linhas
     dela se desviam da imagem e o texto "Figura 1 — ..." aparece **ao lado**
     da foto, na altura do topo. Não estoura nada e fica com cara de defeito de
     quem escreveu o documento, e não da plataforma. No Word a legenda inserida
     entra no grupo da figura e fica embaixo dela. */
  .wd-legenda-flutua { float: left; clear: left; width: 46%; margin-top: 0; }
  /* O corpo da folha, e ele existe por uma razão só.

     A folha é display flex por causa da altura mínima dela, e float **não
     vale em item de flex** — o navegador simplesmente ignora. As
     disposições Quadrada e Próxima prometiam que o texto contorna a imagem e
     não contornavam nada: a foto ficava numa linha e o parágrafo na de baixo,
     igualzinho a Acima e Abaixo. Nada estoura, e três das seis disposições
     passam a fazer a mesma coisa.

     Os blocos vão num bloco comum dentro do flex, e aí o float volta a valer
     entre irmãos. O flex 1 mantém a folha esticando como antes. */
  .wd-corpo { flex: 1; min-height: 0; }
  /* As faixas de cima e de baixo.

     Elas são desenhadas em cinza e separadas por uma régua tracejada, que é
     como o Word mostra a área de cabeçalho quando ela não está sendo editada:
     ela pertence à página e não ao texto, e pintá-la igual ao corpo faria o
     desbravador achar que dá para escrever nela digitando. */
  .wd-faixa-pagina {
    color: #767676; font-size: 9.5px; display: flex; justify-content: space-between;
    gap: 8px; min-height: 14px;
  }
  .wd-faixa-cabecalho { border-bottom: 1px dashed #C8C6C4; padding-bottom: 3px; margin-bottom: 8px; }
  .wd-faixa-rodape { border-top: 1px dashed #C8C6C4; padding-top: 3px; margin-top: 8px; }
  /* O número da folha, fora da faixa: ele existe mesmo sem rodapé, porque a
     folha é uma folha. É o cinza do papel, e não texto do documento. */
  .wd-folha-numero { color: #A19F9D; font-size: 9px; text-align: center; margin-top: 2px; }
  /* O campo onde se escreve a faixa. Sem borda, como a célula da tabela: no
     Word a área de cabeçalho é texto, e uma caixinha dentro dela ensinaria um
     programa que não existe. */
  .wd-faixa-escrita {
    border: none; background: transparent; padding: 0; margin: 0;
    font: inherit; color: inherit; flex: 1; min-width: 40px; outline: none;
  }
  .wd-faixa-escrita:focus { box-shadow: inset 0 0 0 2px #2B579A; }
  .wd-faixa-escrita::placeholder { color: #B9B9B9; font-style: italic; }
  /* Atrás e à frente saem da linha e **cobrem** o texto — é isto que faz delas
     a resposta errada para uma foto num relatório, e é preciso vê-lo. O
     invólucro tem altura zero para que a imagem não empurre nada: fora da
     linha quer dizer fora da linha. */
  .wd-fora-da-linha { position: relative; height: 0; }
  .wd-fora-da-linha > .wd-imagem { position: absolute; top: 0; left: 18%; opacity: .9; }
  .wd-disp-atras { z-index: -1; }
  .wd-disp-frente { z-index: 2; }
.wd-escrevendo {
  display: block; width: 100%; border: none; background: transparent;
  font: inherit; color: inherit; resize: none; overflow: hidden;
  padding: 0; margin: 0 0 .35em; outline: none;
}
.wd-escrevendo:focus { background: rgba(43,120,228,.07); }

`;

/**
 * Um parágrafo da folha.
 *
 * `marcas` liga o ¶ do fim e o ↵ das quebras de linha. Não é enfeite: enquanto
 * elas estão desligadas, o Enter e a quebra de linha são **invisíveis**, e um
 * documento errado por causa deles passa por certo. É o que a teoria da
 * CC-ES002 diz, e é por isso que um laboratório sobre essa diferença precisa
 * saber desenhá-las.
 */
/**
 * Dá para digitar por cima deste parágrafo?
 *
 * Só quando ele é texto simples: um trecho só, sem campo e sem marca de
 * revisão. Deixar digitar por cima de um parágrafo com campo apagaria a
 * distinção entre o número calculado e o digitado, que é a lição do
 * requisito 4.4 da CC-ES002; por cima de uma marca, retypar desfaria em
 * silêncio a proposta de outra pessoa.
 */
const daParaDigitar = (b: Paragrafo<string>) =>
  b.trechos.length <= 1 && !b.trechos.some(x => x.campo || x.revisao);

export function ParagrafoDaFolha({
  doc, bloco, escolhido, marcas, aoEscolher, classe, comentado, aoEscolherTrecho,
  aoEscrever, aoNovoParagrafo,
}: {
  doc: Doc<string>;
  bloco: Paragrafo<string>;
  escolhido?: boolean;
  marcas?: boolean;
  aoEscolher?: () => void;
  /** Classe extra da folha — hoje só a legenda que flutua com a figura. */
  classe?: string;
  /** Os ids de trecho que têm comentário na margem, para o realce amarelo. */
  comentado?: Set<string>;
  /** Clicar num trecho — é assim que se escolhe uma marca de revisão. */
  aoEscolherTrecho?: (trechoId: string) => void;
  /**
   * Digitar dentro deste parágrafo.
   *
   * Sem ele a folha é de leitura, que é como os laboratórios da CC-ES002 a
   * usam — lá o que se exercita é formatar, e não escrever. A CC-ES006
   * precisa escrever, e por isso a peça entra **aqui**, na janela
   * compartilhada, e não numa segunda folha ao lado: duas folhas divergiriam
   * no primeiro ajuste, que é a razão de `word.tsx` existir.
   *
   * Quem decide o que o texto vira — texto mesmo, ou marca de sugestão — é o
   * laboratório, que é quem sabe em que modo a pessoa está.
   */
  aoEscrever?: (texto: string) => void;
  /** Enter no fim do parágrafo. Sem ele, Enter não faz nada. */
  aoNovoParagrafo?: () => void;
}) {
  if (aoEscrever && escolhido && daParaDigitar(bloco)) {
    return (
      <textarea
        className={`wd-bloco wd-escrevendo${classe ? ` ${classe}` : ''}`}
        style={aparenciaDe(doc, bloco.estilo)}
        data-bloco={bloco.id}
        data-estilo={bloco.estilo}
        aria-label={`Parágrafo: ${bloco.trechos.map(x => x.texto).join('')}`}
        value={bloco.trechos.map(x => x.texto).join('')}
        autoFocus
        rows={1}
        onClick={ev => ev.stopPropagation()}
        onChange={ev => aoEscrever(ev.target.value)}
        onKeyDown={ev => {
          if (ev.key === 'Enter' && !ev.shiftKey && aoNovoParagrafo) {
            ev.preventDefault();
            aoNovoParagrafo();
          }
          /* Esc sai do campo, senão quem navega por teclado fica preso nele.
             É a mesma decisão do editor de código da vereda de HTML. */
          if (ev.key === 'Escape') ev.currentTarget.blur();
        }}
      />
    );
  }
  return (
    <>
      {bloco.quebraDePagina && (
        <div className="wd-quebra-pagina">Quebra de Página</div>
      )}
      <p
        className={`wd-bloco${escolhido ? ' escolhido' : ''}${classe ? ` ${classe}` : ''}`}
        style={aparenciaDe(doc, bloco.estilo)}
        onClick={aoEscolher ? ev => { ev.stopPropagation(); aoEscolher(); } : undefined}
        data-bloco={bloco.id}
        data-estilo={bloco.estilo}
      >
        {bloco.trechos.map((x, i) => (
          <span key={x.id}>
            {x.quebra && (
              <>
                {marcas && <span className="wd-marca" data-marca="quebra">↵</span>}
                <br />
              </>
            )}
            {/* O que se lê sai de `textoDoTrecho`, e não de `x.texto`: num
                campo o número é calculado na hora, da posição dele entre os
                campos do documento. Ler o texto cru aqui deixaria toda legenda
                inserida como campo aparecendo vazia na folha. */}
            <span
              className={[
                x.campo ? 'wd-campo' : '',
                x.texto.includes('\t') ? 'wd-tab' : '',
                /* A marca é do autor: o Word dá uma cor a cada revisor, e sem
                   isso duas pessoas revisando o mesmo documento produzem um
                   texto colorido que não diz de quem é nada. */
                x.revisao ? `wd-rev wd-rev-${x.revisao.tipo} wd-autor-${x.revisao.autor}` : '',
                comentado?.has(x.id) ? 'wd-comentado' : '',
              ].filter(Boolean).join(' ') || undefined}
              style={x.revisao
                ? { ...aparenciaDoTrecho(doc, bloco, x), color: COR_DO_AUTOR[x.revisao.autor] }
                : aparenciaDoTrecho(doc, bloco, x)}
              title={x.revisao ? `${NOME_DO_AUTOR[x.revisao.autor]}: ${x.revisao.tipo}` : undefined}
              onClick={aoEscolherTrecho
                ? ev => { ev.stopPropagation(); aoEscolherTrecho(x.id); } : undefined}
              data-trecho={x.id}
              data-revisao={x.revisao?.tipo}
              data-autor={x.revisao?.autor}
              data-campo={x.campo}
            >
              {textoDoTrecho(doc, x)}
            </span>
            {/* O ¶ vai depois do último trecho: ele marca o fim do parágrafo, e
                não o fim de cada pedaço dele. */}
            {marcas && i === bloco.trechos.length - 1 && (
              <span className="wd-marca" data-marca="paragrafo">¶</span>
            )}
          </span>
        ))}
      </p>
    </>
  );
}

/**
 * A tabela na folha.
 *
 * Ela desenha `linhas` como estão, com a largura medida pela linha mais larga:
 * uma linha curta receberia célula vazia em vez de deixar buraco na borda, que
 * é um defeito que não estoura e some no meio de uma tabela de seis linhas.
 *
 * O cabeçalho sai em `<td class="wd-th">` e não em `<th>` de propósito: aqui
 * ele é um **estado da tabela** que o desbravador liga e desliga, e trocar a
 * tag mudaria a semântica do documento junto com a aparência — o que faria a
 * mesma célula ser lida de dois jeitos por quem usa leitor de tela conforme a
 * tarefa estivesse cumprida ou não.
 */
export function TabelaDaFolha({
  tabela, escolhido, aoEscolher, celula, aoCursorNaCelula, aoEditarCelula,
}: {
  tabela: TabelaDoDoc<string>;
  escolhido?: boolean;
  aoEscolher?: () => void;
  /**
   * Onde está o cursor dentro da tabela.
   *
   * Comando de tabela age onde o cursor está — "Excluir › Colunas" tira a
   * coluna da célula em que se clicou, e não uma coluna qualquer. Sem esta
   * posição o laboratório teria de perguntar qual, num diálogo que o Word não
   * tem.
   */
  celula?: { linha: number; coluna: number } | null;
  aoCursorNaCelula?: (linha: number, coluna: number) => void;
  aoEditarCelula?: (linha: number, coluna: number, valor: string) => void;
}) {
  const largura = larguraDaTabela(tabela);
  const classeDoEstilo = tabela.estilo === 'Tabela de Lista 3' ? ' est-lista'
    : tabela.estilo === 'Tabela de Grade 4 — Ênfase 1' ? ' est-grade4'
      : '';
  return (
    <>
      {tabela.quebraDePagina && <div className="wd-quebra-pagina">Quebra de Página</div>}
      <table
        className={`wd-tabela${classeDoEstilo}${escolhido ? ' escolhido' : ''}`}
        onClick={aoEscolher ? ev => { ev.stopPropagation(); aoEscolher(); } : undefined}
        data-bloco={tabela.id}
        data-tabela-estilo={tabela.estilo}
        data-cabecalho={tabela.cabecalho ? 'sim' : 'nao'}
      >
        <tbody>
          {tabela.linhas.map((linha, i) => (
            <tr key={i}>
              {Array.from({ length: largura }, (_, j) => {
                const classes = [
                  tabela.cabecalho && i === 0 ? 'wd-th' : '',
                  celula?.linha === i && celula?.coluna === j ? 'cursor' : '',
                ].filter(Boolean).join(' ');
                return (
                  <td key={j} className={classes || undefined}
                    data-celula={`${i}-${j}`}
                    /*
                      O clique para aqui. Acima está a própria tabela, e o
                      `aoEscolher` dela zera o cursor que a célula acabou de
                      pôr — e aí "Excluir › Colunas" nunca sabe qual coluna.
                      Quem seleciona a tabela é `aoCursorNaCelula`, que faz as
                      duas coisas de uma vez, como o cursor do Word faz.
                    */
                    onClick={aoCursorNaCelula
                      ? (ev) => { ev.stopPropagation(); aoCursorNaCelula(i, j); }
                      : undefined}>
                    {aoEditarCelula ? (
                      <input
                        className="wd-celula"
                        value={linha[j] ?? ''}
                        aria-label={`Linha ${i + 1}, coluna ${j + 1}`}
                        onFocus={() => aoCursorNaCelula?.(i, j)}
                        onChange={ev => aoEditarCelula(i, j, ev.target.value)}
                      />
                    ) : (linha[j] ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/** As disposições que saem da linha e cobrem o texto, em vez de arrumá-lo. */
const FORA_DA_LINHA: readonly Disposicao[] = ['atras', 'frente'];

/** As que flutuam, e em volta das quais o texto contorna. */
const DISPOSICOES_QUE_FLUTUAM: readonly Disposicao[] = ['quadrada', 'proxima'];

/**
 * A imagem na folha.
 *
 * Não há foto: o que se desenha é a moldura com a descrição e o nome do
 * arquivo, que é o bastante para o que esta lição mede — **onde** a imagem
 * fica e como o texto se arruma em volta dela. Pôr uma arte do repositório no
 * lugar seria dizer que a foto da fogueira é um emblema de especialidade.
 *
 * A disposição vira classe, e o desenho de cada uma é o que ela de fato faz:
 * quadrada e próxima flutuam e o texto contorna; acima e abaixo toma a largura
 * sozinha; alinhada entra na linha; atrás e à frente saem dela e cobrem o
 * texto. Desenhar as seis iguais faria a recusa das duas últimas parecer
 * capricho da plataforma, quando ela é a diferença que o requisito nomeia.
 */
export function ImagemDaFolha({ imagem, escolhido, aoEscolher }: {
  imagem: ImagemDoDoc<string>;
  escolhido?: boolean;
  aoEscolher?: () => void;
}) {
  const caixa = (
    <div
      className={`wd-imagem wd-disp-${imagem.disposicao}${escolhido ? ' escolhido' : ''}`}
      onClick={aoEscolher ? ev => { ev.stopPropagation(); aoEscolher(); } : undefined}
      data-bloco={imagem.id}
      data-disposicao={imagem.disposicao}
      role="img"
      aria-label={imagem.descricao}
    >
      <ImageIcon className="w-6 h-6" aria-hidden="true" />
      <span>{imagem.descricao}</span>
      <span className="wd-imagem-nome">{imagem.arquivo}</span>
    </div>
  );
  return (
    <>
      {imagem.quebraDePagina && <div className="wd-quebra-pagina">Quebra de Página</div>}
      {FORA_DA_LINHA.includes(imagem.disposicao)
        ? <div className="wd-fora-da-linha">{caixa}</div>
        : caixa}
    </>
  );
}

/**
 * O sumário, com a mensagem do Word quando ele não achou nada.
 *
 * "Nenhuma entrada de sumário foi encontrada" é o texto do programa, e é o
 * único sinal de que um documento formatado à mão está quebrado — o sumário lê
 * estilo, e negrito não é estilo. Trocá-lo por um aviso da plataforma tiraria a
 * lição da tela do programa imitado e a poria na nossa.
 */
export function SumarioDaFolha({ itens }: { itens: ItemDeSumario[] }) {
  return (
    <div className="wd-sumario">
      <p style={{ fontWeight: 700, color: '#2F5496', marginBottom: 4 }}>Sumário</p>
      {itens.length === 0 ? (
        <p style={{ color: '#A19F9D', fontStyle: 'italic' }}>
          Nenhuma entrada de sumário foi encontrada.
        </p>
      ) : itens.map((it, i) => (
        <div key={i} className="wd-sumario-linha" style={{ paddingLeft: (it.nivel - 1) * 14 }}>
          <span>{it.texto}</span>
          <span className="wd-sumario-pontos" />
          {/* A folha que ele leu, e não a posição da linha. Era o índice, o que
              dava um sumário cujos números só por acaso batiam com o papel. */}
          <span data-sumario-pagina={it.pagina}>{it.pagina}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Um bloco qualquer da folha.
 *
 * O `switch` é exaustivo com `never` no `default`, e não uma escada de `if`:
 * um quarto tipo de bloco — uma caixa de texto, um gráfico — não compila até
 * alguém dizer como ele se desenha. A escada devolveria `null` calado, e o
 * bloco simplesmente não apareceria na folha, que é o defeito que já escapou
 * de três travas nesta vereda quando o tipo `'word'` entrou no currículo.
 */
export function BlocoDaFolha({
  doc, bloco, escolhido, marcas, aoEscolher, celula, aoCursorNaCelula, aoEditarCelula, classe,
  comentado, aoEscolherTrecho, aoEscrever, aoNovoParagrafo,
}: {
  doc: Doc<string>;
  bloco: Bloco<string>;
  escolhido?: boolean;
  marcas?: boolean;
  aoEscolher?: () => void;
  classe?: string;
  celula?: { linha: number; coluna: number } | null;
  aoCursorNaCelula?: (linha: number, coluna: number) => void;
  aoEditarCelula?: (linha: number, coluna: number, valor: string) => void;
  comentado?: Set<string>;
  aoEscolherTrecho?: (trechoId: string) => void;
  /** Digitar no parágrafo. Só o parágrafo a recebe: tabela e imagem não têm texto. */
  aoEscrever?: (texto: string) => void;
  aoNovoParagrafo?: () => void;
}) {
  switch (bloco.tipo) {
    case 'paragrafo':
      return (
        <ParagrafoDaFolha doc={doc} bloco={bloco} escolhido={escolhido}
          marcas={marcas} aoEscolher={aoEscolher} classe={classe}
          comentado={comentado} aoEscolherTrecho={aoEscolherTrecho}
          aoEscrever={aoEscrever} aoNovoParagrafo={aoNovoParagrafo} />
      );
    case 'tabela':
      return (
        <TabelaDaFolha tabela={bloco} escolhido={escolhido} aoEscolher={aoEscolher}
          celula={celula} aoCursorNaCelula={aoCursorNaCelula} aoEditarCelula={aoEditarCelula} />
      );
    case 'imagem':
      return <ImagemDaFolha imagem={bloco} escolhido={escolhido} aoEscolher={aoEscolher} />;
    default: {
      const naoTratado: never = bloco;
      throw new Error(`bloco de tipo não tratado na folha: ${JSON.stringify(naoTratado)}`);
    }
  }
}

/**
 * A faixa que se repete: cabeçalho ou rodapé.
 *
 * O campo de página se resolve **aqui**, com o número da folha em que ela está
 * sendo desenhada — é a diferença inteira entre o número calculado e o
 * digitado, e ela só aparece quando há mais de uma folha para comparar.
 */
export function FaixaDaFolha({ doc, faixa, pagina, onde, aoEscrever }: {
  doc: Doc<string>;
  faixa: FaixaDaPagina;
  pagina: number;
  onde: 'cabecalho' | 'rodape';
  /** Quando dado, o que é texto vira campo de digitar; o campo nunca vira. */
  aoEscrever?: (trechoId: string, valor: string) => void;
}) {
  return (
    <div className={`wd-faixa-pagina wd-faixa-${onde}`} data-faixa={onde}>
      <span style={{ display: 'flex', gap: 2, alignItems: 'baseline', flex: 1 }}>
        {faixa.trechos.map(x => (x.campo ? (
          /*
            O número não se digita por cima: ele é calculado, e o sombreado é o
            Word dizendo isso. Deixá-lo editável ensinaria que dá para
            consertar o número errado escrevendo o certo, que é exatamente o
            gesto que esta lição existe para desfazer.
          */
          <span key={x.id} className="wd-campo" data-campo={x.campo}>
            {textoDoTrecho(doc, x, pagina)}
          </span>
        ) : aoEscrever ? (
          <input
            key={x.id} className="wd-faixa-escrita" value={x.texto}
            aria-label={onde === 'cabecalho' ? 'Cabeçalho' : 'Rodapé'}
            placeholder={onde === 'cabecalho' ? 'Escreva o cabeçalho…' : 'Escreva o rodapé…'}
            onChange={ev => aoEscrever(x.id, ev.target.value)}
          />
        ) : (
          <span key={x.id}>{x.texto}</span>
        )))}
      </span>
    </div>
  );
}

/**
 * A folha inteira: quantas páginas o documento tiver, cada uma com as faixas
 * que se repetem.
 *
 * ── Por que ela reparte de verdade ───────────────────────────────────────
 * Antes havia uma folha só, e a quebra de página era uma régua tracejada
 * escrita no meio dela. Servia enquanto nenhuma lição falava do que se repete
 * **por página** — e a partir do requisito 4.4 não serve mais: cabeçalho que
 * se repete numa folha só não se repete, e número de página que nunca muda não
 * mostra a diferença entre o campo e o número digitado, que é a lição.
 *
 * A régua tracejada saiu junto: uma quebra que abre folha nova e ainda desenha
 * um aviso de quebra diz duas vezes a mesma coisa.
 */
export function FolhaDoWord({
  doc, selecionado, marcas, aoEscolher, aoClicarNoVazio,
  celula, aoCursorNaCelula, aoEditarCelula, aoEscreverNaFaixa,
  comentado, aoEscolherTrecho, margem, aoEscreverNoParagrafo, aoNovoParagrafo,
}: {
  doc: Doc<string>;
  selecionado?: string | null;
  marcas?: boolean;
  aoEscolher?: (id: string) => void;
  aoClicarNoVazio?: () => void;
  celula?: { linha: number; coluna: number } | null;
  aoCursorNaCelula?: (blocoId: string, linha: number, coluna: number) => void;
  aoEditarCelula?: (blocoId: string, linha: number, coluna: number, valor: string) => void;
  aoEscreverNaFaixa?: (onde: 'cabecalho' | 'rodape', trechoId: string, valor: string) => void;
  /** Os trechos com comentário, para o realce que o Word põe embaixo deles. */
  comentado?: Set<string>;
  aoEscolherTrecho?: (trechoId: string) => void;
  /**
   * A margem de revisão, à direita do papel.
   *
   * Ela é **irmã** da folha e não filha, porque no Word os balões ficam fora
   * do papel: desenhá-los dentro faria o comentário sair na impressão e
   * empurrar o texto, que é justamente o que a lição diz que ele não faz.
   */
  margem?: ReactNode;
  /** Digitar no parágrafo escolhido. Sem ele a folha é de leitura. */
  aoEscreverNoParagrafo?: (blocoId: string, texto: string) => void;
  /** Enter no fim de um parágrafo. */
  aoNovoParagrafo?: (blocoId: string) => void;
}) {
  const paginas = paginasDoDoc(doc);
  /* Embaixo do título, e não acima dele: quem fecha a abertura é quem carrega
     o sumário logo depois. `null` só acontece em folha sem bloco nenhum. */
  const fechaAAbertura = doc.sumario ? blocoAntesDoSumario(doc) : null;
  return (
    <div className="wd-canvas" onClick={aoClicarNoVazio}>
      {paginas.map((blocos, i) => {
        const numero = i + 1;
        /* A caixa "Primeira página diferente" do Word: a capa não leva faixa.
           É o que evita a gambiarra de pôr a capa noutro arquivo. */
        const comFaixas = !(doc.primeiraPaginaDiferente && numero === 1);
        return (
          <div key={numero} className={margem ? 'wd-folha-com-margem' : undefined}>
            <div className="wd-pagina" onClick={ev => ev.stopPropagation()}
              data-pagina={numero}>
              {comFaixas && doc.cabecalho && (
                <FaixaDaFolha doc={doc} faixa={doc.cabecalho} pagina={numero} onde="cabecalho"
                  aoEscrever={aoEscreverNaFaixa
                    ? (id, valor) => aoEscreverNaFaixa('cabecalho', id, valor) : undefined} />
              )}
              <div className="wd-corpo">
                {/* Folha sem bloco nenhum: não há abertura para fechar. */}
                {numero === 1 && doc.sumario && fechaAAbertura === null && (
                  <SumarioDaFolha itens={doc.sumario} />
                )}
                {blocos.map((b) => {
                  const dentro = doc.blocos.indexOf(b);
                  const anterior = doc.blocos[dentro - 1];
                  const flutuaComAFigura = b.tipo === 'paragrafo' && b.estilo === 'Legenda'
                    && anterior?.tipo === 'imagem'
                    && DISPOSICOES_QUE_FLUTUAM.includes(anterior.disposicao);
                  return (
                    <Fragment key={b.id}>
                      <BlocoDaFolha
                        doc={doc} bloco={b}
                        escolhido={selecionado === b.id}
                        marcas={marcas}
                        comentado={comentado}
                        aoEscolherTrecho={aoEscolherTrecho}
                        aoEscolher={aoEscolher ? () => aoEscolher(b.id) : undefined}
                        aoEscrever={aoEscreverNoParagrafo
                          ? (texto: string) => aoEscreverNoParagrafo(b.id, texto) : undefined}
                        aoNovoParagrafo={aoNovoParagrafo
                          ? () => aoNovoParagrafo(b.id) : undefined}
                        celula={selecionado === b.id ? celula : null}
                        aoCursorNaCelula={aoCursorNaCelula
                          ? (linha, coluna) => aoCursorNaCelula(b.id, linha, coluna) : undefined}
                        aoEditarCelula={aoEditarCelula
                          ? (linha, coluna, valor) => aoEditarCelula(b.id, linha, coluna, valor) : undefined}
                        classe={flutuaComAFigura ? 'wd-legenda-flutua' : undefined}
                      />
                      {numero === 1 && doc.sumario && b.id === fechaAAbertura && (
                        <SumarioDaFolha itens={doc.sumario} />
                      )}
                    </Fragment>
                  );
                })}
              </div>
              {comFaixas && doc.rodape && (
                <FaixaDaFolha doc={doc} faixa={doc.rodape} pagina={numero} onde="rodape"
                  aoEscrever={aoEscreverNaFaixa
                    ? (id, valor) => aoEscreverNaFaixa('rodape', id, valor) : undefined} />
              )}
            </div>
            {/* Fora do papel: a contagem de folhas que a régua de status do
                Word também mostra. Ela não é do documento, e por isso não some
                com "Primeira página diferente". */}
            <div className="wd-folha-numero">Folha {numero} de {paginas.length}</div>
            {margem && numero === 1 && <div className="wd-margem">{margem}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Revisão: os balões da margem ─────────────────────────────────────────── */

/**
 * Um comentário na margem, com a conversa encadeada dentro dele.
 *
 * Responder e resolver são **dois** gestos, e é essa a lição: resolver é um
 * clique, e quem resolve sem responder fecha o assunto sem dizer nada a quem
 * perguntou. Um botão só — "Resolver", que gravasse o texto junto — apagaria a
 * diferença e faria a tarefa premiar o clique.
 */
export function BalaoDeComentario({
  comentario, rascunho, aoEscrever, aoResponder, aoResolver, aoExcluir,
}: {
  comentario: Comentario;
  rascunho: string;
  aoEscrever: (valor: string) => void;
  aoResponder: () => void;
  aoResolver: () => void;
  aoExcluir?: () => void;
}) {
  const meu = comentario.autor === 'voce';
  return (
    <div
      className={`wd-balao${meu ? ' meu' : ''}${comentario.resolvido ? ' resolvido' : ''}`}
      data-comentario={comentario.id}
      data-resolvido={comentario.resolvido}
    >
      <div className="wd-balao-autor">{NOME_DO_AUTOR[comentario.autor]}</div>
      <div>{comentario.texto}</div>

      {comentario.respostas.map(r => (
        <div key={r.id} className="wd-balao-resposta" data-resposta={r.id}>
          <div className="wd-balao-autor">{NOME_DO_AUTOR[r.autor]}</div>
          <div>{r.texto}</div>
        </div>
      ))}

      {!comentario.resolvido && (
        <>
          <textarea
            rows={2}
            value={rascunho}
            placeholder="Responder…"
            aria-label={`Responder o comentário de ${NOME_DO_AUTOR[comentario.autor]}`}
            onChange={ev => aoEscrever(ev.target.value)}
          />
          <div className="wd-balao-acoes">
            <button type="button" onClick={aoResponder}>Responder</button>
            <button type="button" onClick={aoResolver}>Resolver</button>
            {aoExcluir && <button type="button" onClick={aoExcluir}>Excluir</button>}
          </div>
        </>
      )}
      {comentario.resolvido && <div className="wd-balao-acoes"><span>Resolvido</span></div>}
    </div>
  );
}

/* ── Localizar e Substituir ───────────────────────────────────────────────── */

/**
 * A caixa do Ctrl+H, com as duas opções que quase ninguém marca.
 *
 * Elas ficam **desmarcadas** ao abrir, que é como o Word abre, e é o que faz o
 * requisito 5 existir: a caixa protege, e quem não a vê perde o documento em
 * dois segundos. Abrir com elas marcadas tornaria a armadilha inalcançável e a
 * tarefa passaria a medir ter clicado em Substituir Tudo.
 *
 * "Substituir" um a um existe ao lado de "Substituir Tudo" porque é o caminho
 * que a teoria recomenda — mais lento, e o único que mostra cada ocorrência
 * antes de trocar. Só o botão grosso ensinaria que o jeito de fazer é o de
 * uma vez.
 */
export function DialogoDeSubstituir({
  procurar, por, opcoes, achados, aoMudarProcurar, aoMudarPor, aoMudarOpcoes,
  aoSubstituirTudo, aoFechar,
}: {
  procurar: string;
  por: string;
  opcoes: OpcoesDeBusca;
  achados: number;
  aoMudarProcurar: (v: string) => void;
  aoMudarPor: (v: string) => void;
  aoMudarOpcoes: (o: OpcoesDeBusca) => void;
  aoSubstituirTudo: () => void;
  aoFechar: () => void;
}) {
  return (
    <div className="wd-dialogo" role="dialog" aria-label="Localizar e Substituir">
      <h4>Localizar e Substituir</h4>
      <label>
        Localizar:
        <input type="text" value={procurar} aria-label="Localizar"
          onChange={ev => aoMudarProcurar(ev.target.value)} />
      </label>
      <label>
        Substituir por:
        <input type="text" value={por} aria-label="Substituir por"
          onChange={ev => aoMudarPor(ev.target.value)} />
      </label>

      <div className="wd-caixa">
        <input type="checkbox" id="wd-op-maiusculas" checked={opcoes.diferenciarMaiusculas}
          onChange={ev => aoMudarOpcoes({ ...opcoes, diferenciarMaiusculas: ev.target.checked })} />
        <label htmlFor="wd-op-maiusculas" style={{ margin: 0 }}>
          Diferenciar maiúsculas de minúsculas
        </label>
      </div>
      <div className="wd-caixa">
        <input type="checkbox" id="wd-op-inteiras" checked={opcoes.palavrasInteiras}
          onChange={ev => aoMudarOpcoes({ ...opcoes, palavrasInteiras: ev.target.checked })} />
        <label htmlFor="wd-op-inteiras" style={{ margin: 0 }}>Localizar palavras inteiras</label>
      </div>

      <div data-achados={achados} style={{ marginTop: 6, color: '#605E5C' }}>
        {procurar === ''
          ? 'Escreva o que procurar.'
          : `${achados} ${achados === 1 ? 'ocorrência' : 'ocorrências'} no documento.`}
      </div>

      <div className="wd-dialogo-acoes">
        <button type="button" className="principal" onClick={aoSubstituirTudo}>
          Substituir Tudo
        </button>
        <button type="button" onClick={aoFechar}>Fechar</button>
      </div>
    </div>
  );
}
