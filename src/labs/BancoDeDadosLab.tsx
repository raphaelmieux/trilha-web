import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table2, FileSpreadsheet, FileText, Database, Import, ArrowDownAZ, ArrowUpZA,
  Filter, Save, Plus, Trash2, Search, Ruler, Sigma, Minus, Square as SquareIcon, X,
  FileCheck2, RotateCcw, AlertTriangle, ChevronDown,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import { CSS_WINDOWS, DialogoDoWindows } from './windows';
import {
  AGENDA_INICIAL, METAS_DA_AGENDA, LISTA_DO_CLUBE, COLUNAS_DA_LISTA,
  CAMPO_DA_COLUNA, CAMPOS_PEDIDOS, REGRA_DE_EMAIL,
  bairroDe, registrosNaTela, temArroba,
  type Agenda, type Campo, type Registro, type TipoDeCampo,
} from './metasDaAp044';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP044 requisito 6 — a agenda de vinte e cinco pessoas, num Access.
 *
 * ── Por que Access, e não uma tela da plataforma ─────────────────────────
 * "Montar um banco de dados" é onde quase toda execução desanda: monta-se uma
 * lista no editor de texto, com vinte e cinco nomes digitados um embaixo do
 * outro. A diferença entre aquilo e um banco de dados é a **estrutura**, e
 * estrutura não se vê numa tela inventada por nós: vê-se no modo de estrutura
 * do programa, onde cada campo tem um nome e um tipo escritos numa linha.
 *
 * O Access é o programa que o desbravador tem chance de encontrar na escola, e
 * a lição de teoria já o nomeia junto do LibreOffice Base. A janela imita a
 * dele: painel de navegação à esquerda, guias de objeto, os dois modos de
 * exibição e o navegador de registros no pé.
 *
 * ── Ninguém digita cem campos aqui ───────────────────────────────────────
 * Digitar vinte e cinco fichas numa tela simulada ensina a digitar. O jeito de
 * verdade de pôr vinte e cinco pessoas num banco é **importar** — e o
 * assistente de importação é a teoria inteira virando gesto: ele pergunta,
 * coluna por coluna, a que campo ela corresponde.
 *
 * E ele erra, porque as colunas do clube se chamam "Zap" e "Onde mora". Sem
 * nome para casar, ele cai no palpite por posição e troca duas. Corrigir o
 * mapeamento é a tarefa; o assistente que já chegasse certo seria uma tarefa
 * que abre resolvida.
 *
 * ── O telefone ──────────────────────────────────────────────────────────
 * Parece número e é texto. Escolher Número no modo de estrutura não estoura:
 * a coluna aceita, e o que se perde são os parênteses, o traço e o zero da
 * frente. Aqui o programa diz isso em vez de deixar acontecer calado — é a
 * mesma decisão do "selecione primeiro" do laboratório de Word.
 */

const NOMES_DOS_TIPOS: Record<TipoDeCampo, string> = {
  texto: 'Texto Curto',
  numero: 'Número',
  data: 'Data/Hora',
};

const GUIAS = [
  'Arquivo', 'Página Inicial', 'Criar', 'Dados Externos',
  'Ferramentas de Banco de Dados', 'Ajuda',
] as const;

const USAVEIS = ['Página Inicial', 'Criar', 'Dados Externos'];

/** Os bairros que a lista do clube tem, para a caixa do filtro. */
const BAIRROS = [...new Set(LISTA_DO_CLUBE.map(l => bairroDe(l[2])))].sort();

type Modo = 'nada' | 'estrutura' | 'folha' | 'relatorio';

/** O que o assistente de importação sugere: casa por posição, e erra duas. */
const palpiteDoAssistente = (campos: Campo[]): Record<string, string> =>
  Object.fromEntries(COLUNAS_DA_LISTA.map((c, i) => [c, campos[i]?.nome ?? '']));

export default function BancoDeDadosLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [agenda, setAgenda] = useState<Agenda>(AGENDA_INICIAL);
  const [guia, setGuia] = useState('Criar');
  const [modo, setModo] = useState<Modo>('nada');
  const [campoAtivo, setCampoAtivo] = useState<string | null>(null);
  const [assistente, setAssistente] = useState<Record<string, string> | null>(null);
  /** As fichas que a regra recusou na importação, à espera de conserto. */
  const [recusadas, setRecusadas] = useState<{ linha: string[]; email: string }[]>([]);
  const [camposDoRelatorio, setCamposDoRelatorio] = useState<string[]>([]);
  const [montandoRelatorio, setMontandoRelatorio] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  const naTela = registrosNaTela(agenda);
  const tarefas = METAS_DA_AGENDA.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde,
    passos: m.passos, feita: m.feita(agenda),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  const fecharMenu = () => setMenu(null);
  const avisar = (recado: string) => { fecharMenu(); setAviso(recado); };
  const naoFazParte = (nome: string) =>
    avisar(`${nome} existe no Access de verdade, e está aqui para a faixa ficar igual — mas não faz parte deste exercício.`);

  const abrir = (id: string) => setMenu(m => (m === id ? null : id));

  // ── Modo estrutura ─────────────────────────────────────────────────────

  const criarTabela = () => {
    fecharMenu();
    if (agenda.campos.length) { setModo('estrutura'); setAviso(''); return; }
    /* Quatro linhas em branco, que é como o modo de estrutura do Access abre:
       a grade existe, e o que falta é escrever nela. */
    setAgenda(a => ({
      ...a,
      campos: [0, 1, 2, 3].map(i => ({ id: `c${i}`, nome: '', tipo: 'texto' as TipoDeCampo })),
    }));
    setModo('estrutura');
    setCampoAtivo('c0');
    setAviso('A tabela abriu no modo de estrutura. Cada linha é um campo: escreva o nome e escolha o tipo ao lado.');
  };

  const mudarCampo = (id: string, mudanca: Partial<Campo>) =>
    setAgenda(a => ({ ...a, campos: a.campos.map(c => (c.id === id ? { ...c, ...mudanca } : c)) }));

  const escolherTipo = (id: string, tipo: TipoDeCampo) => {
    const c = agenda.campos.find(x => x.id === id);
    mudarCampo(id, { tipo });
    fecharMenu();
    if (tipo === 'numero' && /telefone|zap|celular/i.test(c?.nome ?? '')) {
      setAviso('Telefone como Número aceita — e perde os parênteses, o traço e o zero da frente. Número é o que se soma, e ninguém soma dois telefones.');
    } else {
      setAviso('');
    }
  };

  // ── Importação ─────────────────────────────────────────────────────────

  const abrirAssistente = () => {
    fecharMenu();
    if (agenda.campos.filter(c => c.nome.trim()).length < 4) {
      setAviso('Não há para onde importar ainda: crie a tabela e nomeie os quatro campos primeiro.');
      return;
    }
    setAssistente(palpiteDoAssistente(agenda.campos));
    setAviso('');
  };

  const importar = () => {
    const mapa = assistente!;
    const aceitos: Registro[] = [];
    const barradas: { linha: string[]; email: string }[] = [];
    const regraDoEmail = agenda.campos.find(c => c.nome === 'E-mail')?.regra;

    LISTA_DO_CLUBE.forEach((linha, i) => {
      const valores: Record<string, string> = {};
      COLUNAS_DA_LISTA.forEach((coluna, j) => {
        const destino = mapa[coluna];
        if (destino) valores[destino] = linha[j];
      });
      if (regraDoEmail && !temArroba(valores['E-mail'] ?? '')) {
        barradas.push({ linha, email: valores['E-mail'] ?? '' });
        return;
      }
      aceitos.push({ id: `r${i}`, valores });
    });

    setAgenda(a => ({ ...a, registros: aceitos }));
    setRecusadas(barradas);
    setAssistente(null);
    setModo('folha');
    setGuia('Página Inicial');

    const trocado = COLUNAS_DA_LISTA.some(c => mapa[c] !== CAMPO_DA_COLUNA[c]);
    setAviso(trocado
      ? `${aceitos.length} fichas entraram — mas repare no que está em cada coluna. Alguma coluna foi para o campo errado, e nada estourou: o programa guarda o que foi escrito onde foi mandado.`
      : barradas.length
        ? `${aceitos.length} fichas entraram. ${barradas.length} foi recusada pela regra de validação, e está na caixa abaixo da tabela.`
        : `${aceitos.length} fichas entraram.`);
  };

  const consertarRecusada = (i: number, email: string) =>
    setRecusadas(r => r.map((x, j) => (j === i ? { ...x, email } : x)));

  const incluirRecusada = (i: number) => {
    const alvo = recusadas[i];
    if (!temArroba(alvo.email)) {
      setAviso('A regra continua recusando: falta arroba, falta ponto depois dela, ou sobrou espaço.');
      return;
    }
    const valores: Record<string, string> = {};
    COLUNAS_DA_LISTA.forEach((coluna, j) => { valores[CAMPO_DA_COLUNA[coluna]] = alvo.linha[j]; });
    valores['E-mail'] = alvo.email;
    setAgenda(a => ({ ...a, registros: [...a.registros, { id: `rc${i}`, valores }] }));
    setRecusadas(r => r.filter((_, j) => j !== i));
    setAviso('Ficha incluída. A regra deixou passar porque agora o endereço tem a forma de um endereço.');
  };

  // ── Folha de dados ─────────────────────────────────────────────────────

  const ordenar = (crescente: boolean) => {
    fecharMenu();
    if (!agenda.registros.length) { setAviso('Não há fichas para ordenar ainda.'); return; }
    setAgenda(a => ({ ...a, ordem: { campo: campoAtivo ? nomeDoCampo(campoAtivo) : 'Nome', crescente } }));
    setAviso('Ordenado. Nada foi redigitado: a ordem é uma leitura do que já estava guardado.');
  };

  const nomeDoCampo = (id: string) => agenda.campos.find(c => c.id === id)?.nome ?? 'Nome';

  const filtrar = (bairro: string) => {
    fecharMenu();
    setAgenda(a => ({ ...a, filtroDeBairro: bairro }));
    setAviso(bairro
      ? 'Filtrado. Como na planilha, o filtro esconde e não apaga: o rodapé continua contando as fichas que existem.'
      : 'Filtro retirado.');
  };

  // ── Relatório ──────────────────────────────────────────────────────────

  const gerarRelatorio = () => {
    setAgenda(a => ({ ...a, relatorio: [...camposDoRelatorio] }));
    setMontandoRelatorio(false);
    setModo('relatorio');
    setAviso(camposDoRelatorio.length < CAMPOS_PEDIDOS.length
      ? 'O relatório saiu — com menos campos do que a agenda pede. Um relatório sem endereço, telefone ou e-mail não serve para o que a agenda existe.'
      : 'Relatório montado a partir da tabela. Nada foi redigitado.');
  };

  const recomecar = () => {
    setAgenda(AGENDA_INICIAL);
    setModo('nada');
    setGuia('Criar');
    setCampoAtivo(null);
    setAssistente(null);
    setRecusadas([]);
    setCamposDoRelatorio([]);
    setMontandoRelatorio(false);
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
        attempts: 1, correct_count: METAS_DA_AGENDA.length, total_questions: METAS_DA_AGENDA.length,
      });
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você montou a agenda, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'agenda_concluida', { specialtyCode, lessonCode, metas: METAS_DA_AGENDA.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Agenda do clube pronta!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Vinte e cinco pessoas, quatro campos declarados, uma regra que recusa
          o que não é endereço — e ordenar, procurar e imprimir sem redigitar
          nada. É isso que uma lista de nomes num caderno não faz.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  const acoes = (
    <div className="flex flex-col gap-2">
      {tudoFeito && (
        <>
          {erro && <p style={{ fontSize: 11.5, color: 'var(--color-error)' }}>{erro}</p>}
          <button onClick={registrar} disabled={gravando} className="btn-primary text-sm w-full justify-center">
            {gravando ? 'Guardando…' : 'Entregar a agenda'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar a agenda
      </button>
    </div>
  );

  const Bt = ({ dica, rotulo, aoClicar, children, empilhado, ativo }: {
    dica: string; rotulo?: string; aoClicar: () => void;
    children: React.ReactNode; empilhado?: boolean; ativo?: boolean;
  }) => (
    <button type="button" title={dica} aria-label={dica} aria-pressed={ativo}
      onClick={aoClicar} className="ac-bt"
      style={{
        background: ativo ? '#F2DEDE' : 'transparent',
        border: ativo ? '1px solid #D9B3B3' : '1px solid transparent',
        ...(empilhado ? { flexDirection: 'column' as const, height: 'auto', padding: '3px 8px', gap: 2 } : {}),
      }}>
      {children}
      {rotulo && <span style={{ fontSize: 10.5 }}>{rotulo}</span>}
    </button>
  );

  const Grupo = ({ nome, children }: { nome: string; children: React.ReactNode }) => (
    <div className="ac-grupo">
      <div className="ac-grupo-corpo">{children}</div>
      <div className="ac-grupo-nome">{nome}</div>
    </div>
  );

  const Menu = ({ id, children }: { id: string; children: React.ReactNode }) => (
    menu === id ? <div className="ac-menu" role="menu">{children}</div> : null
  );

  const ItemMenu = ({ aoClicar, ativo, children }: {
    aoClicar: () => void; ativo?: boolean; children: React.ReactNode;
  }) => (
    <button type="button" role="menuitem" onClick={aoClicar} className="ac-menu-item"
      style={{ background: ativo ? '#F2DEDE' : 'transparent' }}>{children}</button>
  );

  const campoEmFoco = agenda.campos.find(c => c.id === campoAtivo) ?? null;

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="access"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_WINDOWS}</style>
      <style>{`
        /* O vermelho é o do Access, como o azul é o do Word e o verde o do
           Excel: é por ele que o desbravador reconhece qual dos três abriu. */
        .ac-janela {
          background: #F3F2F1; color: #201F1E; flex: 1;
          display: flex; flex-direction: column; min-height: 0;
          font-family: system-ui, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px;
        }
        .ac-titulo {
          background: #A4373A; color: #FFFFFF; display: flex; align-items: center;
          gap: 10px; padding: 6px 10px; font-size: 12px;
        }
        .ac-guias {
          display: flex; gap: 2px; padding: 0 8px; background: #F9F8F7;
          border-bottom: 1px solid #E1DFDD; overflow-x: auto;
        }
        .ac-guia {
          padding: 6px 10px 7px; font-size: 12.5px; white-space: nowrap;
          border: none; background: none; color: #201F1E; cursor: pointer;
          border-bottom: 2px solid transparent;
        }
        .ac-guia:hover { background: #EDEBE9; }
        .ac-guia[aria-selected="true"] { color: #A4373A; border-bottom-color: #A4373A; font-weight: 600; }
        .ac-faixa {
          display: flex; align-items: stretch; padding: 4px 6px 2px;
          background: #F3F2F1; border-bottom: 1px solid #E1DFDD; overflow-x: auto;
        }
        .ac-grupo {
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 0 8px; border-right: 1px solid #E1DFDD; min-width: max-content;
        }
        .ac-grupo-corpo { display: flex; align-items: flex-start; gap: 3px; padding: 2px 0 4px; }
        .ac-grupo-nome { font-size: 10px; color: #605E5C; text-align: center; padding-bottom: 3px; }
        .ac-bt {
          height: 26px; padding: 0 6px; border-radius: 3px; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 4px;
          color: #201F1E; font-size: 12px;
        }
        .ac-bt:hover { background: #EDEBE9 !important; }
        .ac-menu {
          position: absolute; z-index: 30; top: 100%; left: 0; margin-top: 2px;
          background: #FFFFFF; border: 1px solid #C8C6C4; border-radius: 3px;
          box-shadow: 0 6px 18px rgba(0,0,0,.22); min-width: 200px; padding: 4px; text-align: left;
        }
        .ac-menu-item {
          display: block; width: 100%; text-align: left; padding: 6px 10px;
          font-size: 12.5px; border: none; border-radius: 2px; cursor: pointer; color: #201F1E;
        }
        .ac-menu-item:hover { background: #EDEBE9 !important; }
        .ac-corpo { flex: 1; min-height: 0; display: flex; background: #FFFFFF; }
        .ac-nav {
          width: 180px; flex: none; background: #E9E7E6; border-right: 1px solid #C8C6C4;
          padding: 6px 0; overflow-y: auto;
        }
        .ac-nav h3 {
          font-size: 11.5px; font-weight: 700; color: #201F1E; padding: 4px 10px 6px;
          border-bottom: 1px solid #C8C6C4; margin-bottom: 4px;
        }
        .ac-nav-grupo { font-size: 11px; color: #605E5C; padding: 6px 10px 2px; }
        .ac-nav-item {
          display: flex; align-items: center; gap: 6px; width: 100%; text-align: left;
          padding: 4px 10px 4px 20px; font-size: 12px; color: #201F1E;
          background: none; border: none; cursor: pointer;
        }
        .ac-nav-item:hover { background: #DAD8D6; }
        .ac-nav-item[aria-current="true"] { background: #CFE4F5; font-weight: 600; }
        .ac-obj { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .ac-obj-guias { display: flex; background: #F3F2F1; border-bottom: 1px solid #C8C6C4; }
        .ac-obj-guia {
          padding: 5px 14px; font-size: 12px; background: #FFFFFF; color: #201F1E;
          border: 1px solid #C8C6C4; border-bottom: none; border-radius: 3px 3px 0 0;
          margin: 3px 2px -1px 3px; cursor: pointer;
        }
        .ac-painel { flex: 1; min-height: 0; overflow: auto; padding: 10px; }
        .ac-grade { border-collapse: collapse; width: 100%; font-size: 12.5px; }
        .ac-grade th {
          background: #E9E7E6; border: 1px solid #C8C6C4; padding: 4px 8px;
          text-align: left; font-weight: 600; color: #201F1E; white-space: nowrap;
        }
        .ac-grade td { border: 1px solid #E1DFDD; padding: 3px 8px; color: #201F1E; }
        .ac-grade tr:nth-child(even) td { background: #F7F6F5; }
        .ac-campo {
          border: 1px solid transparent; background: transparent; width: 100%;
          font-size: 12.5px; color: #201F1E; padding: 2px 4px;
        }
        .ac-campo:focus { outline: none; border-color: #A4373A; background: #FFFFFF; }
        .ac-props {
          border-top: 2px solid #C8C6C4; background: #E9E7E6; padding: 8px 10px;
        }
        .ac-props h4 { font-size: 11.5px; font-weight: 700; color: #201F1E; margin-bottom: 6px; }
        .ac-prop-linha { display: flex; gap: 8px; align-items: center; font-size: 12px; margin-bottom: 4px; }
        .ac-prop-linha > span:first-child { width: 150px; color: #201F1E; }
        .ac-recusadas {
          margin-top: 12px; border: 1px solid #D9B3B3; background: #FDF6F6;
          border-radius: 4px; padding: 8px 10px; color: #201F1E;
        }
        .ac-status {
          background: #A4373A; color: #FFFFFF; font-size: 11.5px;
          padding: 4px 10px; display: flex; gap: 14px; align-items: center;
        }
        .ac-papel {
          background: #FFFFFF; border: 1px solid #C8C6C4; padding: 18px;
          max-width: 720px; margin: 0 auto; color: #201F1E;
        }
      `}</style>

      <div className="ac-janela" onClick={fecharMenu}>
        <div className="ac-titulo">
          <Database className="w-4 h-4" />
          <span style={{ fontWeight: 600 }}>Agenda do Clube</span>
          <span style={{ opacity: .85 }}>: Banco de Dados</span>
          <span className="ml-auto flex items-center gap-3" style={{ opacity: .9 }}>
            <button type="button" aria-label="Minimizar" onClick={() => naoFazParte('Minimizar')}>
              <Minus className="w-3 h-3" />
            </button>
            <button type="button" aria-label="Maximizar" onClick={() => avisar('O Access já está ocupando a tela inteira.')}>
              <SquareIcon className="w-2.5 h-2.5" />
            </button>
            <button type="button" aria-label="Fechar" onClick={() => naoFazParte('Fechar o Access')}>
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>

        <div className="ac-guias" role="tablist">
          {GUIAS.map(nome => (
            USAVEIS.includes(nome) ? (
              <button key={nome} type="button" role="tab" aria-selected={guia === nome}
                className="ac-guia" onClick={ev => { ev.stopPropagation(); setGuia(nome); fecharMenu(); }}>
                {nome}
              </button>
            ) : (
              <button key={nome} type="button" className="ac-guia" style={{ color: '#8A8886' }}
                onClick={ev => { ev.stopPropagation(); naoFazParte(`A guia ${nome}`); }}>
                {nome}
              </button>
            )
          ))}
        </div>

        <div className="ac-faixa" style={{ overflowX: menu ? 'visible' : 'auto' }}
          onClick={ev => ev.stopPropagation()}>
          {guia === 'Criar' && (
            <>
              <Grupo nome="Tabelas">
                <Bt dica="Tabela" rotulo="Tabela" empilhado aoClicar={criarTabela}>
                  <Table2 className="w-5 h-5" />
                </Bt>
                <Bt dica="Modo Estrutura" rotulo="Modo Estrutura" empilhado
                  aoClicar={() => { fecharMenu(); if (agenda.campos.length) setModo('estrutura'); else criarTabela(); }}>
                  <Ruler className="w-5 h-5" />
                </Bt>
              </Grupo>
              <Grupo nome="Consultas">
                <Bt dica="Assistente de Consulta" rotulo="Consulta" empilhado
                  aoClicar={() => naoFazParte('O Assistente de Consulta')}>
                  <Sigma className="w-5 h-5" />
                </Bt>
              </Grupo>
              <Grupo nome="Relatórios">
                <Bt dica="Relatório" rotulo="Relatório" empilhado aoClicar={() => {
                  fecharMenu();
                  if (!agenda.registros.length) { setAviso('Um relatório é a leitura do que está guardado — e não há nada guardado ainda.'); return; }
                  setCamposDoRelatorio(agenda.campos.filter(c => c.nome).map(c => c.nome));
                  setMontandoRelatorio(true);
                }}>
                  <FileText className="w-5 h-5" />
                </Bt>
              </Grupo>
            </>
          )}

          {guia === 'Dados Externos' && (
            <Grupo nome="Importar e Vincular">
              <Bt dica="Importar Lista" rotulo="Importar Lista" empilhado aoClicar={abrirAssistente}>
                <Import className="w-5 h-5" />
              </Bt>
              <Bt dica="Exportar para Excel" rotulo="Excel" empilhado
                aoClicar={() => naoFazParte('Exportar para o Excel')}>
                <FileSpreadsheet className="w-5 h-5" />
              </Bt>
            </Grupo>
          )}

          {guia === 'Página Inicial' && (
            <>
              <Grupo nome="Modos de Exibição">
                <Bt dica="Modo Folha de Dados" rotulo="Folha de Dados" empilhado
                  ativo={modo === 'folha'}
                  aoClicar={() => { fecharMenu(); if (agenda.campos.length) setModo('folha'); else setAviso('Não há tabela para abrir ainda.'); }}>
                  <Table2 className="w-5 h-5" />
                </Bt>
                <Bt dica="Modo Estrutura" rotulo="Estrutura" empilhado
                  ativo={modo === 'estrutura'}
                  aoClicar={() => { fecharMenu(); if (agenda.campos.length) setModo('estrutura'); else setAviso('Não há tabela para abrir ainda.'); }}>
                  <Ruler className="w-5 h-5" />
                </Bt>
              </Grupo>
              <Grupo nome="Classificar e Filtrar">
                <Bt dica="Crescente" aoClicar={() => ordenar(true)} ativo={agenda.ordem?.crescente === true}>
                  <ArrowDownAZ className="w-4 h-4" />
                </Bt>
                <Bt dica="Decrescente" aoClicar={() => ordenar(false)} ativo={agenda.ordem?.crescente === false}>
                  <ArrowUpZA className="w-4 h-4" />
                </Bt>
                <div style={{ position: 'relative' }}>
                  <Bt dica="Filtro" aoClicar={() => abrir('filtro')} ativo={!!agenda.filtroDeBairro}>
                    <Filter className="w-4 h-4" /> <ChevronDown className="w-2.5 h-2.5" />
                  </Bt>
                  <Menu id="filtro">
                    <ItemMenu aoClicar={() => filtrar('')} ativo={!agenda.filtroDeBairro}>(Todos)</ItemMenu>
                    {BAIRROS.map(b => (
                      <ItemMenu key={b} aoClicar={() => filtrar(b)} ativo={agenda.filtroDeBairro === b}>{b}</ItemMenu>
                    ))}
                  </Menu>
                </div>
              </Grupo>
              <Grupo nome="Registros">
                <Bt dica="Novo" aoClicar={() => naoFazParte('Novo registro em branco')}><Plus className="w-4 h-4" /></Bt>
                <Bt dica="Salvar" aoClicar={() => avisar('O Access grava a ficha ao sair dela: não há botão de salvar a digitação, e é uma das primeiras surpresas de quem vem da planilha.')}><Save className="w-4 h-4" /></Bt>
                <Bt dica="Excluir" aoClicar={() => naoFazParte('Excluir registro')}><Trash2 className="w-4 h-4" /></Bt>
                <Bt dica="Localizar" aoClicar={() => naoFazParte('Localizar')}><Search className="w-4 h-4" /></Bt>
              </Grupo>
            </>
          )}
        </div>

        <div className="ac-corpo">
          <div className="ac-nav">
            <h3>Todos os Objetos do Access</h3>
            <div className="ac-nav-grupo">Tabelas</div>
            {agenda.campos.length ? (
              <button type="button" className="ac-nav-item" aria-current={modo === 'folha' || modo === 'estrutura'}
                onClick={ev => { ev.stopPropagation(); setModo('folha'); }}>
                <Table2 className="w-3.5 h-3.5" style={{ color: '#A4373A' }} /> Agenda
              </button>
            ) : (
              <p style={{ fontSize: 11, color: '#605E5C', padding: '2px 10px 2px 20px' }}>
                (nenhuma)
              </p>
            )}
            <div className="ac-nav-grupo">Relatórios</div>
            {agenda.relatorio ? (
              <button type="button" className="ac-nav-item" aria-current={modo === 'relatorio'}
                onClick={ev => { ev.stopPropagation(); setModo('relatorio'); }}>
                <FileText className="w-3.5 h-3.5" style={{ color: '#A4373A' }} /> Agenda do Clube
              </button>
            ) : (
              <p style={{ fontSize: 11, color: '#605E5C', padding: '2px 10px 2px 20px' }}>
                (nenhum)
              </p>
            )}
          </div>

          <div className="ac-obj">
            {modo !== 'nada' && (
              <div className="ac-obj-guias">
                <span className="ac-obj-guia">
                  {modo === 'relatorio' ? 'Agenda do Clube' : 'Agenda'}
                </span>
              </div>
            )}

            <div className="ac-painel">
              {modo === 'nada' && (
                <div style={{ maxWidth: 460, margin: '40px auto', textAlign: 'center', color: '#605E5C' }}>
                  <Database className="w-10 h-10 mx-auto mb-3" style={{ color: '#A4373A' }} />
                  <p style={{ fontSize: 13 }}>
                    O banco está criado e vazio. Comece por <strong>Criar › Tabela</strong>:
                    é lá que se declara o que a agenda guarda.
                  </p>
                </div>
              )}

              {modo === 'estrutura' && (
                <>
                  <table className="ac-grade">
                    <thead>
                      <tr><th style={{ width: '45%' }}>Nome do Campo</th><th style={{ width: '55%' }}>Tipo de Dados</th></tr>
                    </thead>
                    <tbody>
                      {agenda.campos.map(c => (
                        <tr key={c.id} onClick={ev => { ev.stopPropagation(); setCampoAtivo(c.id); }}
                          style={{ outline: campoAtivo === c.id ? '2px solid #A4373A' : undefined }}>
                          <td>
                            <input className="ac-campo" value={c.nome} placeholder="(escreva o nome)"
                              aria-label={`Nome do campo ${agenda.campos.indexOf(c) + 1}`}
                              onFocus={() => setCampoAtivo(c.id)}
                              onChange={e => mudarCampo(c.id, { nome: e.target.value })} />
                          </td>
                          <td style={{ position: 'relative' }}>
                            <button type="button" className="ac-campo" style={{ textAlign: 'left' }}
                              aria-label={`Tipo do campo ${c.nome || agenda.campos.indexOf(c) + 1}`}
                              onClick={ev => { ev.stopPropagation(); setCampoAtivo(c.id); abrir(`tipo-${c.id}`); }}>
                              {NOMES_DOS_TIPOS[c.tipo]} <ChevronDown className="w-3 h-3 inline" />
                            </button>
                            <Menu id={`tipo-${c.id}`}>
                              {(Object.keys(NOMES_DOS_TIPOS) as TipoDeCampo[]).map(t => (
                                <ItemMenu key={t} ativo={c.tipo === t}
                                  aoClicar={() => escolherTipo(c.id, t)}>{NOMES_DOS_TIPOS[t]}</ItemMenu>
                              ))}
                            </Menu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="ac-props">
                    <h4>Propriedades do Campo{campoEmFoco?.nome ? ` — ${campoEmFoco.nome}` : ''}</h4>
                    {campoEmFoco ? (
                      <>
                        <div className="ac-prop-linha">
                          <span>Tamanho do Campo</span>
                          <span style={{ color: '#605E5C' }}>255</span>
                        </div>
                        <div className="ac-prop-linha">
                          <span>Regra de Validação</span>
                          <span style={{ position: 'relative' }}>
                            <button type="button" className="win-campo" style={{ minWidth: 200, textAlign: 'left' }}
                              aria-label="Regra de Validação"
                              onClick={ev => { ev.stopPropagation(); abrir('regra'); }}>
                              {campoEmFoco.regra ?? '(nenhuma)'}
                            </button>
                            <Menu id="regra">
                              <ItemMenu aoClicar={() => { mudarCampo(campoEmFoco.id, { regra: undefined }); fecharMenu(); }}>
                                (nenhuma)
                              </ItemMenu>
                              <ItemMenu aoClicar={() => {
                                mudarCampo(campoEmFoco.id, { regra: REGRA_DE_EMAIL });
                                fecharMenu();
                                setAviso('Regra escrita. Daqui em diante, o que não tiver arroba e ponto é recusado na entrada — inclusive na importação.');
                              }}>
                                {REGRA_DE_EMAIL}
                              </ItemMenu>
                              <ItemMenu aoClicar={() => { mudarCampo(campoEmFoco.id, { regra: '> 0' }); fecharMenu(); }}>
                                &gt; 0
                              </ItemMenu>
                            </Menu>
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: '#605E5C', marginTop: 6 }}>
                          O tipo diz o que cabe no campo. A regra diz o que vale — e é conferida
                          antes de a ficha ser aceita.
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: 11.5, color: '#605E5C' }}>
                        Clique numa linha acima para ver as propriedades daquele campo.
                      </p>
                    )}
                  </div>
                </>
              )}

              {modo === 'folha' && (
                <>
                  {agenda.registros.length === 0 ? (
                    <p style={{ color: '#605E5C', fontSize: 12.5 }}>
                      A tabela existe e está vazia. Traga as pessoas por
                      <strong> Dados Externos › Importar Lista</strong>.
                    </p>
                  ) : (
                    <table className="ac-grade">
                      <thead>
                        <tr>
                          {agenda.campos.filter(c => c.nome).map(c => (
                            <th key={c.id}>
                              <button type="button" style={{ font: 'inherit', color: 'inherit' }}
                                aria-label={`Coluna ${c.nome}`}
                                onClick={ev => { ev.stopPropagation(); setCampoAtivo(c.id); }}>
                                {c.nome}{agenda.ordem?.campo === c.nome ? (agenda.ordem.crescente ? ' ▲' : ' ▼') : ''}
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {naTela.map(r => (
                          <tr key={r.id}>
                            {agenda.campos.filter(c => c.nome).map(c => (
                              <td key={c.id}>{r.valores[c.nome] ?? ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {recusadas.length > 0 && (
                    <div className="ac-recusadas">
                      <p style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <AlertTriangle className="w-4 h-4" style={{ color: '#A4373A' }} />
                        {recusadas.length === 1 ? 'Uma ficha foi recusada' : `${recusadas.length} fichas foram recusadas`}
                      </p>
                      <p style={{ fontSize: 11.5, color: '#605E5C', marginBottom: 8 }}>
                        A regra de validação do campo E-mail reprovou a entrada. Corrija e inclua.
                      </p>
                      {recusadas.map((x, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2" style={{ marginBottom: 6 }}>
                          <span style={{ minWidth: 150, fontSize: 12 }}>{x.linha[0]}</span>
                          <input className="win-campo" value={x.email} style={{ minWidth: 200 }}
                            aria-label={`E-mail de ${x.linha[0]}`}
                            onChange={e => consertarRecusada(i, e.target.value)} />
                          <button type="button" className="win-bt primario" onClick={() => incluirRecusada(i)}>
                            Incluir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {modo === 'relatorio' && agenda.relatorio && (
                <div className="ac-papel">
                  <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 2, color: '#A4373A' }}>Agenda do Clube</h2>
                  <p style={{ fontSize: 11, color: '#605E5C', marginBottom: 10 }}>
                    {agenda.registros.length} pessoas cadastradas
                  </p>
                  <table className="ac-grade">
                    <thead>
                      <tr>{agenda.relatorio.map(n => <th key={n}>{n}</th>)}</tr>
                    </thead>
                    <tbody>
                      {agenda.registros.map(r => (
                        <tr key={r.id}>{agenda.relatorio!.map(n => <td key={n}>{r.valores[n] ?? ''}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ac-status">
          <span>
            {modo === 'estrutura' ? 'Modo Estrutura'
              : modo === 'relatorio' ? 'Modo Relatório'
                : modo === 'folha' ? 'Modo Folha de Dados' : 'Pronto'}
          </span>
          {modo === 'folha' && agenda.registros.length > 0 && (
            <span>
              Registro: 1 de {naTela.length}
              {agenda.filtroDeBairro && ` (filtrado de ${agenda.registros.length})`}
            </span>
          )}
        </div>
      </div>

      {/* O assistente de importação, que é a teoria virando gesto. */}
      {assistente && (
        <DialogoDoWindows
          titulo="Assistente de Importação — Lista do clube"
          acoes={
            <>
              <button type="button" className="win-bt" onClick={() => setAssistente(null)}>Cancelar</button>
              <button type="button" className="win-bt primario" onClick={importar}>Concluir</button>
            </>
          }>
          <p style={{ fontSize: 12.5, marginBottom: 4 }}>
            A lista tem {LISTA_DO_CLUBE.length} linhas. Diga a que campo da tabela cada coluna corresponde.
          </p>
          <p style={{ fontSize: 11.5, color: '#616161', marginBottom: 10 }}>
            As colunas da lista não têm os nomes dos seus campos, então o palpite abaixo
            foi feito pela posição delas.
          </p>
          <table className="ac-grade">
            <thead>
              <tr><th>Coluna da lista</th><th>Primeiro valor</th><th>Vai para o campo</th></tr>
            </thead>
            <tbody>
              {COLUNAS_DA_LISTA.map((coluna, i) => (
                <tr key={coluna}>
                  <td style={{ fontWeight: 600 }}>{coluna}</td>
                  <td style={{ color: '#605E5C' }}>{LISTA_DO_CLUBE[0][i]}</td>
                  <td>
                    <select className="win-campo" value={assistente[coluna] ?? ''}
                      aria-label={`Campo de destino da coluna ${coluna}`}
                      onChange={e => setAssistente(a => ({ ...a!, [coluna]: e.target.value }))}>
                      <option value="">(não importar)</option>
                      {agenda.campos.filter(c => c.nome).map(c => (
                        <option key={c.id} value={c.nome}>{c.nome}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogoDoWindows>
      )}

      {/* O assistente de relatório: escolher o que sai impresso. */}
      {montandoRelatorio && (
        <DialogoDoWindows
          titulo="Assistente de Relatório"
          acoes={
            <>
              <button type="button" className="win-bt" onClick={() => setMontandoRelatorio(false)}>Cancelar</button>
              <button type="button" className="win-bt primario" onClick={gerarRelatorio}>Concluir</button>
            </>
          }>
          <p style={{ fontSize: 12.5, marginBottom: 8 }}>Que campos devem sair impressos?</p>
          {agenda.campos.filter(c => c.nome).map(c => (
            <label key={c.id} className="flex items-center gap-2" style={{ fontSize: 12.5, marginBottom: 4 }}>
              <input type="checkbox" checked={camposDoRelatorio.includes(c.nome)}
                onChange={e => setCamposDoRelatorio(v =>
                  e.target.checked ? [...v, c.nome] : v.filter(n => n !== c.nome))} />
              {c.nome}
            </label>
          ))}
        </DialogoDoWindows>
      )}
    </LaboratorioEmTelaCheia>
  );
}
