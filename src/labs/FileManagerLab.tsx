import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Folder, FolderOpen, File as FileIcon, Link2, Trash2,
  FolderPlus, Pencil, Copy, Scissors, ClipboardPaste, X,
  CheckCircle2, RotateCcw,
  ArrowUpDown, LayoutGrid, Music, FileType2, Image as IconeImagem,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import { CSS_WINDOWS, BarraDeTitulo } from './windows';
import {
  PainelDeNavegacao, BarraDeEndereco, CabecalhosDaLista, LinhaDeArquivo,
  MenuFlutuante, MenuClassificar, BarraDeTarefasDoWindows,
} from './explorer';
import { VisualizadorDe } from './visualizadores';
import { familiaDe, PROGRAMA_DA_FAMILIA } from './tiposDeArquivo';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import {
  AREA, DOCUMENTOS, LIXEIRA, ehRaiz, type No, type Coluna,
  acharNo, filhosDe, caminhoDe, podeSoltarEm, nomeDisponivel, ordenar,
  copiarPara, moverPara, mandarParaLixeira, restaurar, esvaziarLixeira,
  criarGerador,
} from './arquivos';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP041 requisito 5 — as seis operações de pasta e arquivo.
 *
 * O requisito pede demonstração no computador, que um navegador não alcança: a
 * página não cria pasta na área de trabalho de ninguém. A alternativa seria a
 * pessoa marcar "fiz" numa lista, e autodeclaração é o que o resto da
 * plataforma evita. Então o computador é simulado aqui, e o laboratório observa
 * cada operação acontecer em vez de perguntar se aconteceu.
 *
 * A versão anterior era uma lista com três botões de "lugar". Praticava as seis
 * operações, mas não se parecia com computador nenhum — e o desbravador vai
 * repetir isto num Windows de verdade, onde o que ele precisa reconhecer é a
 * janela: a árvore à esquerda, o caminho em cima, as colunas que ordenam quando
 * clicadas, o menu que abre com o botão direito.
 *
 * Daí a forma daqui. As cores são as da plataforma, não as do Windows: imitar o
 * cinza do sistema deixaria uma ilha clara dentro de um aplicativo escuro, e o
 * que precisa ser reconhecido é o arranjo, não a paleta.
 *
 * Dois caminhos para cada operação, sempre. Arrastar é o gesto do Explorer e
 * está aqui; no celular ele é impreciso, e lá valem a barra de ferramentas e o
 * menu de contexto por toque longo. Nenhum requisito depende de arrastar.
 */

const DIA = 86_400_000;

function arvoreInicial(agora: number): No[] {
  const pasta = (id: string, nome: string, paiId: string | null, dias: number): No =>
    ({ id, nome, tipo: 'pasta', paiId, tamanhoKb: 0, modificadoEm: agora - dias * DIA });
  const arq = (id: string, nome: string, paiId: string, kb: number, dias: number): No =>
    ({ id, nome, tipo: 'arquivo', paiId, tamanhoKb: kb, modificadoEm: agora - dias * DIA });

  return [
    pasta(AREA, 'Área de Trabalho', null, 0),
    pasta(DOCUMENTOS, 'Documentos', null, 0),
    pasta(LIXEIRA, 'Lixeira', null, 0),

    pasta('p_acamp', 'Acampamento 2026', AREA, 12),
    arq('a_foto', 'fogueira.jpg', 'p_acamp', 2400, 12),
    arq('a_lista', 'o que levar.txt', 'p_acamp', 3, 20),
    arq('a_hino', 'hino.mp3', AREA, 4100, 45),

    pasta('p_unidade', 'Unidade Falcão', DOCUMENTOS, 30),
    arq('d_ata', 'ata da reunião.pdf', 'p_unidade', 180, 5),
    arq('d_cantina', 'cantina.pdf', DOCUMENTOS, 850, 7),
    arq('d_especial', 'especialidades.docx', DOCUMENTOS, 64, 60),
  ];
}

/** As seis operações do requisito, na ordem do documento oficial. */
const TAREFAS = [
  { id: 't1', rotulo: 'Criar uma pasta e dar um nome a ela' },
  { id: 't2', rotulo: 'Copiar uma pasta para outro lugar' },
  { id: 't3', rotulo: 'Mover uma pasta para outro lugar' },
  { id: 't4', rotulo: 'Criar um atalho' },
  { id: 't5', rotulo: 'Excluir um arquivo e esvaziar a lixeira' },
  { id: 't6', rotulo: 'Organizar por nome, por data e por tamanho' },
] as const;
type TarefaId = (typeof TAREFAS)[number]['id'];

/** As três ordens que o requisito 5.6 nomeia. */
const ORDENS_EXIGIDAS: Coluna[] = ['nome', 'modificado', 'tamanho'];

/** Um botão da barra de comandos do Explorer. */
function Cmd({ onClick, desabilitado, Ico, dica, children }: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  desabilitado?: boolean; Ico: typeof Folder;
  dica: string; children?: React.ReactNode;
}) {
  return (
    <button className="win-cmd" onClick={onClick} disabled={desabilitado} title={dica} aria-label={dica}>
      <Ico className="w-4 h-4" />
      {children && <span className="win-rotulo">{children}</span>}
    </button>
  );
}

export default function FileManagerLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const agora = useRef(Date.now()).current;
  const novoId = useRef(criarGerador('n')).current;

  const [arvore, setArvore] = useState<No[]>(() => arvoreInicial(agora));
  const [historico, setHistorico] = useState<string[]>([AREA]);
  const [posicao, setPosicao] = useState(0);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set([AREA]));
  const [coluna, setColuna] = useState<Coluna>('nome');
  const [crescente, setCrescente] = useState(true);
  const [ordensUsadas, setOrdensUsadas] = useState<Set<Coluna>>(new Set(['nome']));
  const [transferencia, setTransferencia] = useState<{ id: string; recortar: boolean } | null>(null);
  const [renomeando, setRenomeando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState('');
  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  /* O menu Classificar da barra. Existe porque em tela estreita as colunas do
     meio somem, e sem ele a tarefa de ordenar por data ficaria impossível no
     celular — que é onde boa parte dos desbravadores estuda. O Explorer de
     verdade tem esse menu pelo mesmo motivo. */
  const [menuOrdem, setMenuOrdem] = useState<{ x: number; y: number } | null>(null);
  /* Os arquivos abertos, na ordem em que foram usados. Todo arquivo abre —
     não porque cada visualizador ensine algo, mas porque não abrir quebraria a
     única coisa que a janela toda constrói, que é estar num computador. */
  const [abertos, setAbertos] = useState<{ id: string; nome: string }[]>([]);
  const [minimizados, setMinimizados] = useState<Set<string>>(new Set());
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvoSolto, setAlvoSolto] = useState<string | null>(null);
  const [feitas, setFeitas] = useState<Set<TarefaId>>(new Set());
  const [aviso, setAviso] = useState('');
  const [salvo, setSalvo] = useState(false);

  const pastaAtual = historico[posicao];
  const noAtual = acharNo(arvore, pastaAtual);
  const item = acharNo(arvore, selecionado) ?? null;
  const naLixeira = pastaAtual === LIXEIRA || (selecionado ? caminhoDe(arvore, selecionado).some(n => n.id === LIXEIRA) : false);

  const visiveis = useMemo(
    () => ordenar(filhosDe(arvore, pastaAtual), coluna, crescente),
    [arvore, pastaAtual, coluna, crescente],
  );

  const concluir = useCallback((t: TarefaId) => setFeitas(f => (f.has(t) ? f : new Set(f).add(t))), []);

  /* Fecha o menu de contexto ao clicar em qualquer lugar — é o que todo menu de
     sistema faz, e sem isso ele fica preso na tela. */
  useEffect(() => {
    if (!menu && !menuOrdem) return;
    const fechar = () => { setMenu(null); setMenuOrdem(null); };
    window.addEventListener('click', fechar);
    window.addEventListener('scroll', fechar, true);
    return () => { window.removeEventListener('click', fechar); window.removeEventListener('scroll', fechar, true); };
  }, [menu, menuOrdem]);

  /* ── Navegação ─────────────────────────────────────────────────────────── */

  const irPara = (id: string) => {
    if (id === pastaAtual) return;
    setHistorico(h => [...h.slice(0, posicao + 1), id]);
    setPosicao(p => p + 1);
    setSelecionado(null);
    setAviso('');
    setExpandidas(e => new Set([...e, ...caminhoDe(arvore, id).map(n => n.id)]));
  };

  const abrir = (n: No) => {
    if (n.tipo === 'pasta') return irPara(n.id);

    if (n.tipo === 'atalho') {
      setAviso(`"${n.nome}" é um atalho: ele aponta para outro arquivo, e abrir o atalho abre o arquivo. Apagar o atalho não apaga o arquivo.`);
      return;
    }

    /* O Windows recusa abrir de dentro da Lixeira, e diz para restaurar antes.
       É recusa de verdade, e por isso está aqui. */
    if (caminhoDe(arvore, n.id).some(p => p.id === LIXEIRA)) {
      setAviso('Não dá para abrir um arquivo de dentro da Lixeira. Restaure antes, e ele volta para a pasta de onde saiu.');
      return;
    }

    const familia = familiaDe(n.nome);
    if (!familia) {
      setAviso(`O Windows não sabe com que programa abrir "${n.nome}" — é o que ele diz quando a extensão não está associada a nada.`);
      return;
    }
    setAviso('');
    setAbertos(a => [...a.filter(x => x.id !== n.id), { id: n.id, nome: n.nome }]);
    setMinimizados(m => { const c = new Set(m); c.delete(n.id); return c; });
  };

  const fecharJanela = (id: string) => {
    setAbertos(a => a.filter(x => x.id !== id));
    setMinimizados(m => { const c = new Set(m); c.delete(id); return c; });
  };

  /* ── Operações ─────────────────────────────────────────────────────────── */

  const criarPasta = () => {
    const nome = nomeDisponivel(arvore, pastaAtual, 'Nova pasta');
    const id = novoId();
    setArvore(a => [...a, { id, nome, tipo: 'pasta', paiId: pastaAtual, tamanhoKb: 0, modificadoEm: Date.now() }]);
    setSelecionado(id);
    setRenomeando(id);
    setRascunho(nome);
    setAviso('Pasta criada. Agora dê um nome a ela.');
  };

  const confirmarNome = () => {
    const desejado = rascunho.trim();
    if (!renomeando) return;
    if (!desejado) { setAviso('O nome não pode ficar vazio.'); return; }
    const alvo = acharNo(arvore, renomeando)!;
    const nome = nomeDisponivel(arvore, alvo.paiId!, desejado, renomeando);
    setArvore(a => a.map(n => (n.id === renomeando ? { ...n, nome, modificadoEm: Date.now() } : n)));
    /* Só conta como cumprida quando o nome deixou de ser o padrão: criar e
       aceitar "Nova pasta" não é dar nome a nada. */
    if (alvo.tipo === 'pasta' && !nome.startsWith('Nova pasta')) concluir('t1');
    setRenomeando(null);
    setAviso(nome !== desejado ? `Já havia algo com esse nome aqui, então virou "${nome}".` : '');
  };

  const colar = (destino: string) => {
    if (!transferencia) return;
    const origem = acharNo(arvore, transferencia.id);
    if (!origem) return;

    if (transferencia.recortar) {
      if (!podeSoltarEm(arvore, transferencia.id, destino)) {
        setAviso('Não dá para mover uma pasta para dentro dela mesma.');
        return;
      }
      setArvore(a => moverPara(a, transferencia.id, destino, Date.now()));
      if (origem.tipo === 'pasta') concluir('t3');
      setAviso('Movido. No lugar de origem não ficou nenhuma cópia.');
      setTransferencia(null);
    } else {
      setArvore(a => copiarPara(a, transferencia.id, destino, novoId, Date.now()));
      if (origem.tipo === 'pasta' && origem.paiId !== destino) concluir('t2');
      setAviso('Copiado. O original continua onde estava.');
    }
  };

  const criarAtalho = () => {
    if (!item) return;
    const nome = nomeDisponivel(arvore, pastaAtual, `${item.nome} — Atalho`);
    setArvore(a => [...a, {
      id: novoId(), nome, tipo: 'atalho', paiId: pastaAtual,
      tamanhoKb: 1, modificadoEm: Date.now(), apontaPara: item.id,
    }]);
    concluir('t4');
    setAviso('Atalho criado. Ele só aponta para o original — por isso ocupa quase nada.');
  };

  const excluir = () => {
    if (!item || ehRaiz(arvore, item.id)) return;
    setArvore(a => mandarParaLixeira(a, item.id));
    setSelecionado(null);
    setAviso('Foi para a Lixeira. Enquanto estiver lá, ainda dá para recuperar.');
  };

  const devolver = () => {
    if (!item) return;
    setArvore(a => restaurar(a, item.id));
    setSelecionado(null);
    setAviso('Restaurado para o lugar de onde saiu.');
  };

  const esvaziar = () => {
    /* A tarefa é "excluir um arquivo E esvaziar a lixeira": esvaziar uma lixeira
       que nunca recebeu arquivo não demonstra a primeira metade. */
    const tinhaArquivo = arvore.some(n => n.tipo === 'arquivo' && caminhoDe(arvore, n.id).some(p => p.id === LIXEIRA));
    setArvore(a => esvaziarLixeira(a));
    setSelecionado(null);
    if (tinhaArquivo) concluir('t5');
    setAviso(tinhaArquivo
      ? 'Lixeira esvaziada. Agora sim: o que estava lá não volta mais.'
      : 'A Lixeira já estava sem arquivos.');
  };

  const ordenarPor = (c: Coluna) => {
    setCrescente(c === coluna ? !crescente : true);
    setColuna(c);
    setOrdensUsadas(u => {
      const nova = new Set(u).add(c);
      if (ORDENS_EXIGIDAS.every(o => nova.has(o))) concluir('t6');
      return nova;
    });
  };

  /* ── Arrastar e soltar ─────────────────────────────────────────────────── */

  const soltarEm = (destino: string, copiando: boolean) => {
    const id = arrastando;
    setArrastando(null);
    setAlvoSolto(null);
    if (!id) return;
    const origem = acharNo(arvore, id);
    if (!origem) return;

    if (!podeSoltarEm(arvore, id, destino)) {
      setAviso(destino === id || !acharNo(arvore, destino)
        ? ''
        : 'Não dá para soltar aí: uma pasta não entra dentro dela mesma.');
      return;
    }
    if (copiando) {
      setArvore(a => copiarPara(a, id, destino, novoId, Date.now()));
      if (origem.tipo === 'pasta') concluir('t2');
      setAviso('Copiado — segurar Ctrl enquanto arrasta copia em vez de mover.');
    } else {
      setArvore(a => moverPara(a, id, destino, Date.now()));
      if (origem.tipo === 'pasta') concluir('t3');
      setAviso('Movido para a pasta de destino.');
    }
  };

  /* ── Conclusão ─────────────────────────────────────────────────────────── */

  const tudoFeito = TAREFAS.every(t => feitas.has(t.id));

  const finalizar = async () => {
    setAviso('');
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);

    /*
      Conferir quantos requisitos foram gravados, e não só disparar a gravação:
      comemorar sem ter registrado é a falha que mais custa a aparecer, porque
      parece sucesso.
    */
    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: TAREFAS.length, total_questions: TAREFAS.length,
      }, specialtyCode);
      gravados++;
    }
    if (gravados < requirementCodes.length) {
      setAviso('As operações foram todas feitas, mas o progresso não pôde ser guardado agora. '
        + 'Nada do que você fez se perdeu — avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'file_manager_completed', { specialtyCode, lessonCode, operacoes: TAREFAS.length });
    setSalvo(true);
  };

  if (salvo) {
    return (
      <div className="card p-6 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Você domina as seis operações!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Criar, copiar, mover, atalho, excluir e organizar. É assim em qualquer
          computador — muda a aparência, não o que cada uma faz.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

  const caminho = caminhoDe(arvore, pastaAtual);

  /* A janela de cima é a última usada que não esteja minimizada. */
  const emFoco = [...abertos].reverse().find(a => !minimizados.has(a.id)) ?? null;

  const naoFazParte = (nome: string) =>
    setAviso(`${nome} existe no Explorador de verdade, e está aqui para a janela ficar igual — mas não faz parte deste exercício.`);

  /*
    O caminho de cada operação, clique a clique. A moldura só oferece isso
    depois de um tempo sem ninguém concluir nada: quem está achando sozinho
    não é interrompido, e quem empacou não fica sem saída.
  */
  const PASSOS: Record<TarefaId, string[]> = {
    t1: [
      'Clique em "Novo", no começo da barra de comandos.',
      'A pasta nasce com o nome já selecionado para trocar.',
      'Digite o nome que quiser e aperte Enter.',
    ],
    t2: [
      'Clique uma vez na pasta que você criou, para selecioná-la.',
      'Na barra de comandos, clique no ícone de duas folhas (Copiar).',
      'No painel da esquerda, clique em Documentos.',
      'Clique no ícone da prancheta (Colar).',
    ],
    t3: [
      'Volte à Área de Trabalho pelo painel da esquerda.',
      'Clique uma vez em "Acampamento 2026".',
      'Clique na tesoura (Recortar) — recortar é o que move.',
      'Vá até Documentos e clique em Colar.',
      'No computador dá para arrastar a pasta até o destino; com Ctrl apertado, copia em vez de mover.',
    ],
    t4: [
      'Clique uma vez num arquivo, por exemplo hino.mp3.',
      'Na barra de comandos, clique em "Criar atalho".',
      'Aparece um item novo com "Atalho" no nome: ele é só o caminho até o arquivo, não uma cópia.',
    ],
    t5: [
      'Clique uma vez no arquivo que vai sair.',
      'Clique na lixeirinha (Excluir). Ele vai para a Lixeira, e ainda dá para voltar.',
      'No painel da esquerda, clique em Lixeira.',
      'Clique em "Esvaziar Lixeira". Agora sim ele não volta mais.',
    ],
    t6: [
      'Clique no título da coluna Nome. Clicar de novo inverte a ordem.',
      'Clique em "Data de modificação" e depois em "Tamanho".',
      'Em tela estreita as colunas do meio somem: use o menu Classificar, na barra de comandos.',
    ],
  };

  const tarefas = TAREFAS.map(x => ({
    id: x.id,
    titulo: x.rotulo,
    detalhe: x.id === 't6' && !feitas.has('t6')
      ? `Clique nos títulos das colunas, ou use Classificar. ${ordensUsadas.size} de 3 até agora.`
      : undefined,
    onde: x.id === 't6' ? 'Cabeçalhos da lista ou menu Classificar' : 'Barra de comandos ou botão direito',
    passos: PASSOS[x.id],
    feita: feitas.has(x.id),
  }));

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={finalizar} disabled={!tudoFeito}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50">
        {tudoFeito ? 'Concluir o laboratório' : `Faltam ${TAREFAS.length - feitas.size}`}
      </button>
      {/* Herda a cor da superfície, em vez de fixar uma: este mesmo parágrafo é
          desenhado no painel branco do computador e na bolha escura do celular,
          e `--color-text-dim` só podia acertar num dos dois — no branco saía a
          2.4:1. */}
      <p style={{ fontSize: 11, opacity: 0.75 }}>
        Dois toques abrem uma pasta. Arraste até uma pasta para mover; com Ctrl, copia.
        No celular, use a barra de cima ou segure o item.
      </p>
    </div>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="explorador"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={46}
    >
      <style>{CSS_WINDOWS}</style>

      <div className="win-mesa">
      <div className="win-area">
      <div className="win-janela cheia win">
        <BarraDeTitulo
          icone={<Folder className="w-4 h-4" style={{ color: '#E6B14C' }} />}
          nome={noAtual?.nome ?? 'Explorador de Arquivos'}
          aoAvisar={naoFazParte}
        />

        {/* ── Barra de comandos ──
            No Windows 11 os comandos do meio são só ícone, e é assim que a
            pessoa vai encontrá-los: reconhecer a tesoura importa mais do que
            ler "Recortar". Os que ficam com texto são os que o Explorer também
            escreve por extenso. */}
        <div className="win-barra">
          <Cmd onClick={criarPasta} Ico={FolderPlus} dica="Nova pasta" desabilitado={pastaAtual === LIXEIRA}>
            Novo
          </Cmd>
          <div className="win-sep" />
          <Cmd dica="Recortar (Ctrl+X)" Ico={Scissors} desabilitado={!item || ehRaiz(arvore, item.id)}
            onClick={() => { setTransferencia({ id: item!.id, recortar: true }); setAviso('Recortado. Vá até o destino e cole.'); }} />
          <Cmd dica="Copiar (Ctrl+C)" Ico={Copy} desabilitado={!item || ehRaiz(arvore, item.id)}
            onClick={() => { setTransferencia({ id: item!.id, recortar: false }); setAviso('Copiado. Vá até o destino e cole.'); }} />
          <Cmd dica="Colar (Ctrl+V)" Ico={ClipboardPaste} desabilitado={!transferencia}
            onClick={() => colar(pastaAtual)} />
          <Cmd dica="Renomear (F2)" Ico={Pencil} desabilitado={!item || ehRaiz(arvore, item.id)}
            onClick={() => { setRenomeando(item!.id); setRascunho(item!.nome); }} />
          {naLixeira
            ? <Cmd dica="Restaurar" Ico={RotateCcw} desabilitado={!item} onClick={devolver} />
            : <Cmd dica="Excluir (Del)" Ico={Trash2} desabilitado={!item || ehRaiz(arvore, item.id)} onClick={excluir} />}
          <div className="win-sep" />
          <Cmd onClick={criarAtalho} Ico={Link2} dica="Criar atalho"
            desabilitado={!item || ehRaiz(arvore, item.id) || naLixeira}>
            Criar atalho
          </Cmd>
          {pastaAtual === LIXEIRA && (
            <Cmd onClick={esvaziar} Ico={X} dica="Esvaziar a Lixeira"
              desabilitado={filhosDe(arvore, LIXEIRA).length === 0}>
              Esvaziar Lixeira
            </Cmd>
          )}
          <div className="win-sep" />
          <Cmd Ico={ArrowUpDown} dica="Classificar"
            onClick={e => {
              /* Sem parar aqui, o mesmo clique que abre o menu sobe até o
                 window e cai no ouvinte que fecha menu — o menu abriria e
                 sumiria no mesmo gesto. */
              e.stopPropagation();
              const r = e.currentTarget.getBoundingClientRect();
              setMenuOrdem({ x: r.left, y: r.bottom + 4 });
            }}>
            Classificar
          </Cmd>
          <Cmd onClick={() => naoFazParte('O menu Exibir')} Ico={LayoutGrid} dica="Exibir">
            Exibir
          </Cmd>
        </div>

        <BarraDeEndereco
          caminho={caminho}
          podeVoltar={posicao > 0}
          podeAvancar={posicao < historico.length - 1}
          paiId={noAtual?.paiId}
          aoVoltar={() => { setPosicao(p => Math.max(0, p - 1)); setSelecionado(null); }}
          aoAvancar={() => { setPosicao(p => Math.min(historico.length - 1, p + 1)); setSelecionado(null); }}
          aoIr={irPara}
          aoAvisar={naoFazParte}
        />

        <div className="win-corpo">
          <PainelDeNavegacao
            arvore={arvore} expandidas={expandidas} pastaAtual={pastaAtual}
            alvoSolto={alvoSolto} arrastando={arrastando}
            aoIr={irPara}
            aoAlternar={id => setExpandidas(x => {
              const c = new Set(x);
              if (c.has(id)) c.delete(id); else c.add(id);
              return c;
            })}
            aoPassarArrastando={setAlvoSolto}
            aoSoltar={soltarEm}
          />

          <div className="win-lista">
            <CabecalhosDaLista coluna={coluna} crescente={crescente} aoOrdenar={ordenarPor} />

            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              {visiveis.length === 0 && (
                <p style={{ padding: 16, fontSize: 12.5, color: '#767676' }}>Esta pasta está vazia.</p>
              )}

              {visiveis.map(n => (
                <LinhaDeArquivo
                  key={n.id} n={n} arvore={arvore}
                  escolhido={selecionado === n.id}
                  recebendo={alvoSolto === n.id}
                  arrastando={arrastando}
                  renomeando={renomeando === n.id ? {
                    rascunho,
                    aoMudar: setRascunho,
                    aoConfirmar: confirmarNome,
                    aoDesistir: () => setRenomeando(null),
                  } : undefined}
                  aoSelecionar={() => { setSelecionado(n.id); setAviso(''); }}
                  aoAbrir={() => abrir(n)}
                  aoMenu={e => { e.preventDefault(); setSelecionado(n.id); setMenu({ x: e.clientX, y: e.clientY, id: n.id }); }}
                  aoArrastar={setArrastando}
                  aoPassarArrastando={setAlvoSolto}
                  aoSoltar={soltarEm}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="win-status">
          <span>{visiveis.length} {visiveis.length === 1 ? 'item' : 'itens'}</span>
          {item && <span>1 item selecionado</span>}
          {transferencia && (
            <span style={{ marginLeft: 'auto' }}>
              {transferencia.recortar ? 'Recortado' : 'Copiado'}: {acharNo(arvore, transferencia.id)?.nome}
            </span>
          )}
        </div>
      </div>

      {/* ── Os arquivos abertos, um por cima do outro ── */}
      {emFoco && (() => {
        const familia = familiaDe(emFoco.nome);
        if (!familia) return null;
        return (
          <VisualizadorDe
            key={emFoco.id}
            nome={emFoco.nome}
            familia={familia}
            aoAvisar={naoFazParte}
            aoMinimizar={() => setMinimizados(m => new Set(m).add(emFoco.id))}
            aoFechar={() => fecharJanela(emFoco.id)}
          />
        );
      })()}

      </div>

      <BarraDeTarefasDoWindows
        aoAvisar={naoFazParte}
        aoMinimizarTudo={() => setMinimizados(new Set(abertos.map(a => a.id)))}
      >
        {abertos.map(a => {
          const familia = familiaDe(a.nome);
          if (!familia) return null;
          const Ico = { imagem: IconeImagem, texto: FileIcon, audio: Music, pdf: FileType2, documento: FileIcon }[familia];
          const cor = { imagem: '#2E7D32', texto: '#5B5B5B', audio: '#6B2E8F', pdf: '#B71C1C', documento: '#1F6FB2' }[familia];
          return (
            <button key={a.id} className="aberta" title={`${a.nome} — ${PROGRAMA_DA_FAMILIA[familia]}`}
              aria-label={`${a.nome} — ${PROGRAMA_DA_FAMILIA[familia]}`}
              onClick={() => {
                if (emFoco?.id === a.id) { setMinimizados(m => new Set(m).add(a.id)); return; }
                setAbertos(x => [...x.filter(y => y.id !== a.id), a]);
                setMinimizados(m => { const c = new Set(m); c.delete(a.id); return c; });
              }}>
              <Ico className="w-5 h-5" style={{ color: cor }} />
            </button>
          );
        })}
      </BarraDeTarefasDoWindows>
      </div>

      {menuOrdem && (
        <MenuClassificar
          x={menuOrdem.x} y={menuOrdem.y} coluna={coluna} crescente={crescente}
          aoOrdenar={ordenarPor} aoSentido={setCrescente} aoFechar={() => setMenuOrdem(null)}
        />
      )}

      {/* ── Menu de contexto ── */}
      {menu && (() => {
        const n = acharNo(arvore, menu.id);
        if (!n) return null;
        const naoRaiz = !ehRaiz(arvore, n.id);
        const opcoes: [string, typeof Folder, () => void, boolean][] = [
          ['Abrir', FolderOpen, () => abrir(n), true],
          ['Recortar', Scissors, () => setTransferencia({ id: n.id, recortar: true }), naoRaiz],
          ['Copiar', Copy, () => setTransferencia({ id: n.id, recortar: false }), naoRaiz],
          ['Colar', ClipboardPaste, () => colar(n.tipo === 'pasta' ? n.id : pastaAtual), !!transferencia],
          ['Criar atalho', Link2, criarAtalho, naoRaiz && !naLixeira],
          ['Renomear', Pencil, () => { setRenomeando(n.id); setRascunho(n.nome); }, naoRaiz],
          [naLixeira ? 'Restaurar' : 'Excluir', naLixeira ? RotateCcw : Trash2, naLixeira ? devolver : excluir, naoRaiz],
        ];
        return (
          <MenuFlutuante x={menu.x} y={menu.y}>
            {opcoes.filter(([, , , mostrar]) => mostrar).map(([rotulo, Ico, acao]) => (
              <button key={rotulo} onClick={() => { acao(); setMenu(null); }}>
                <Ico className="w-3.5 h-3.5" /> {rotulo}
              </button>
            ))}
          </MenuFlutuante>
        );
      })()}
    </LaboratorioEmTelaCheia>
  );
}
