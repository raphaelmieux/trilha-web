import { ArrowLeft, Printer, Save, FileType2, FolderOpen, Cloud, Clock, HardDrive, Plus, Info, Share2, X } from 'lucide-react';

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

export const CSS_WORD = `
/* A janela não tem mais moldura: ela é a tela. */
.wd-janela {
  background: #F3F2F1; color: #201F1E;
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  /* Pixels por centímetro, e portanto o zoom da folha. 34 é 90% do
     tamanho real numa tela de 96 dpi; num celular de 390 px isso
     deixaria metade do documento fora da tela, e o Word também reduz.
     Mora na janela, e não no canvas, porque a régua precisa da mesma
     medida — foi o que a deixou sem largura na primeira tentativa. */
  --px-cm: 34;
}
@media (max-width: 640px)  { .wd-janela { --px-cm: 17; } }
@media (min-width: 641px) and (max-width: 1023px) { .wd-janela { --px-cm: 26; } }
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
.wd-pagina {
  background: #FFFFFF; margin: 0 auto; min-height: 260px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.28);
  width: calc(var(--largura-cm) * var(--px-cm) * 1px);
  padding: calc(var(--margem-cm) * var(--px-cm) * 1px);
}
/* 1 pt = (96/72)/37,795 cm de pixel — a letra acompanha o zoom da folha. */
.wd-par { font-size: calc(var(--pt) * var(--px-cm) * 0.035277px); }
.wd-regua-barra {
  width: calc(var(--largura-cm) * var(--px-cm) * 1px);
  height: 16px; position: relative; background: #C8C6C4; border-radius: 1px;
}
.wd-status {
  background: #F3F2F1; border-top: 1px solid #E1DFDD; color: #605E5C;
  font-size: 11.5px; padding: 4px 10px; display: flex; gap: 14px; align-items: center;
}
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
  imp, aoMudarImpressao, aoImprimir, aoAvisar,
}: {
  nomeDoArquivo: string;
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
                <input className="wd-campo" readOnly aria-label="Nome do arquivo"
                  value={nomeDoArquivo.replace(/\.[^.]+$/, '')} />
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
          <div className="wd-previa">
            <div className="wd-previa-folha">
              <p style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
                Relatório da Unidade Falcão
              </p>
              <p style={{ marginBottom: 5 }}>
                No primeiro semestre a unidade participou de quatro programações
                do clube e de um acampamento de três dias no Parque das Águas.
              </p>
              <p style={{ marginBottom: 5 }}>
                Oito desbravadores começaram especialidades novas, e cinco delas
                foram concluídas antes do acampamento.
              </p>
              <p>
                A unidade pede à diretoria duas barracas para a próxima saída, já
                que uma das atuais teve a vareta quebrada na última chuva.
              </p>
            </div>
            <p style={{ fontSize: 11.5, color: '#605E5C' }}>1 de 4 páginas</p>
          </div>
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
