import { useRef, useState } from 'react';
import {
  Undo2, Share2, Download, Copy, Trash2, FolderInput, Mail, Users,
  MessageSquarePlus, Check, X, History, Link2,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_DA_NUVEM, TopoDaNuvem, LateralDaNuvem, CaminhoDaNuvem, CabecalhoDaLista,
  LinhaDaNuvem, MenuDoArquivo, ItemDoMenu, SeletorDePapel, AcessoPelaPasta,
  OQuePapelDeixa, CaixaDeCompartilhar, PessoaDaCaixa, SecaoDaCaixa,
  RodapeDaCaixa, BotaoDaNuvem, type LugarDaNuvem,
} from '../labs/nuvem';
import {
  CSS_DO_EDITOR_NA_NUVEM, TopoDoEditor, MenuDoEditor, ItemDaGaveta,
  PresencaNoEditor, BotaoCompartilharNoEditor, BarraDoEditor, FerramentaDoEditor,
  SeparadorDaBarra, SeletorDeModo, PalcoDoEditor, CursorDeOutro, PainelDeHistorico,
  AvisoDoEditor, BotaoDoEditor,
} from '../labs/editorNaNuvem';
import { CSS_FOLHA, FolhaDoWord, BalaoDeComentario } from '../labs/word';
import {
  type ArquivoDaNuvem, type ModoDeTrabalho, type Nuvem, type Papel, type Pessoa,
  PAPEIS, NOME_DO_PAPEL, compartilhar, conflitoDeSincronizacao, gravarVersao,
  mandarParaALixeira, mandarPorAnexo, mover, mudarAcessoGeral, papelDe, podeEditar,
  restaurarVersao, tirarAcessoDoArquivo, transferirPropriedade, versaoAtual,
} from '../labs/arquivoCompartilhado';
import {
  type Doc, type Paragrafo, NOME_DO_AUTOR, acrescentarComentario, aceitarRevisao,
  blocoDe, comentariosDoDoc, linhaDe, rejeitarRevisao, resolverComentario,
  responderComentario, revisoesPendentes, textoDoDoc, trechoDe,
} from '../labs/documento';
import { ESCALA, LINHA_DA_MARTA } from '../labs/documentosDaNuvem';
import {
  type ContextoDaNuvem, type LicaoDaCcEs006, type Meta,
  LICOES_DA_CC_ES006, contextoInicial,
} from '../labs/metasDaCcEs006';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * CC-ES006 — as nove lições, numa tela só.
 *
 * ── Um programa, duas telas ──────────────────────────────────────────────
 * A CC-ES005 abre três programas e despacha entre eles; aqui o programa é
 * **um** — o serviço de nuvem — e a lista de arquivos e o editor são duas
 * telas dele, do jeito que a tela inicial e o documento são duas telas do
 * leitor de PDF. Por isso não há `switch` por programa: há a nuvem, o editor,
 * e um `Record` que diz de que estado cada lição parte.
 *
 * ── O que é do programa mora fora daqui ──────────────────────────────────
 * As janelas estão em `nuvem.tsx` e `editorNaNuvem.tsx`, e o papel continua
 * sendo o `FolhaDoWord` de `word.tsx`. O motor está em
 * `arquivoCompartilhado.ts`. Aqui fica o que é do **exercício**: que diálogo
 * cada comando abre, o que ele faz com o estado, e o que se grava como
 * descoberta.
 *
 * ── Quando as outras pessoas escrevem ────────────────────────────────────
 * Elas escrevem **depois da sua primeira edição**, e não num relógio. Duas
 * razões: um temporizador faria a lição depender de esperar, e uma trava que
 * clicasse nunca saberia quanto; e o que o requisito 4.2 pede que se veja é
 * que as duas edições entram sem uma esperar a outra — o que só se vê quando
 * a sua já está lá.
 */

/* ── A moldura ────────────────────────────────────────────────────────────── */

function Moldura({
  vereda, licao, metas, contexto, recomecar, aoVencer, aoSair, children,
}: {
  vereda: Vereda;
  licao: { titulo: string; verificacoes: string[] };
  metas: Meta[];
  contexto: ContextoDaNuvem;
  recomecar: () => void;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
  children: React.ReactNode;
}) {
  const [salvando, setSalvando] = useState(false);
  const tarefas = metas
    .filter(m => licao.verificacoes.includes(m.id))
    .map(m => ({
      id: m.id, titulo: m.titulo, detalhe: m.detalhe,
      onde: m.onde, passos: m.passos, feita: m.feita(contexto),
    }));
  const faltam = tarefas.filter(t => !t.feita).length;

  return (
    <LaboratorioEmTelaCheia
      trilha={vereda.code}
      voltarPara={`/vereda/${vereda.code}`}
      titulo={licao.titulo}
      programa="nuvem"
      tarefas={tarefas}
      acoes={(
        <div className="flex flex-col gap-2">
          <button
            onClick={async () => { setSalvando(true); await aoVencer(); aoSair(); }}
            disabled={faltam > 0 || salvando}
            className="btn-primary text-sm w-full justify-center disabled:opacity-50"
          >
            {faltam === 0 ? 'Concluir a lição' : `Faltam ${faltam}`}
          </button>
          <button onClick={recomecar} className="btn-ghost text-sm w-full justify-center">
            <Undo2 className="w-4 h-4" /> Recomeçar
          </button>
        </div>
      )}
    >
      {children}
    </LaboratorioEmTelaCheia>
  );
}

/* ── Ferramentas de documento ─────────────────────────────────────────────── */

const docDoArquivo = (a: ArquivoDaNuvem | undefined): Doc<string> | undefined =>
  a && versaoAtual(a)?.doc;

/** Trocar o texto de um parágrafo simples. */
const escreverNoBloco = (d: Doc<string>, blocoId: string, texto: string): Doc<string> => ({
  ...d,
  blocos: d.blocos.map(b => (b.id === blocoId && b.tipo === 'paragrafo'
    ? { ...b, trechos: [trechoDe(`${b.id}-a`, texto)] } : b)),
});

/**
 * O mesmo gesto, com o controle de quem só comenta — ou com o modo de Sugestão.
 *
 * O texto **não entra** no parágrafo: ele vira um bloco novo com marca de
 * inserção, esperando alguém aceitar. É o que o editor de verdade faz, e é a
 * diferença inteira entre os requisitos 4.3 e 4.4.
 */
const sugerirDepoisDo = (d: Doc<string>, blocoId: string, texto: string): Doc<string> => {
  const onde = d.blocos.findIndex(b => b.id === blocoId);
  const novo: Paragrafo<string> = blocoDe(`sug-${d.blocos.length}`, 'corpo', [
    { ...trechoDe(`sug-${d.blocos.length}-a`, texto), revisao: { autor: 'voce', tipo: 'inserido' } },
  ]);
  return { ...d, blocos: [...d.blocos.slice(0, onde + 1), novo, ...d.blocos.slice(onde + 1)] };
};

/**
 * Enter no fim do parágrafo: nasce um vazio logo abaixo.
 *
 * Ela devolve **o id do novo**, e não só o documento, porque o cursor tem de
 * ir para lá — no editor de verdade Enter leva o cursor junto. Deixá-lo no
 * parágrafo de cima faz a tecla parecer que não funcionou: aparece uma linha
 * em branco e o que se digita continua entrando na linha anterior.
 */
const paragrafoDepoisDe = (d: Doc<string>, blocoId: string): { doc: Doc<string>; novo: string } => {
  const onde = d.blocos.findIndex(b => b.id === blocoId);
  const novo = linhaDe(`p-${d.blocos.length}-${onde}`, 'corpo', '');
  return {
    doc: { ...d, blocos: [...d.blocos.slice(0, onde + 1), novo, ...d.blocos.slice(onde + 1)] },
    novo: novo.id,
  };
};

/* ── O componente ─────────────────────────────────────────────────────────── */

export default function LaboratorioDaNuvem({ vereda, licao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'nuvem' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const qual: LicaoDaCcEs006 = licao.licao;
  const registro = LICOES_DA_CC_ES006[qual];

  const [ctx, setCtx] = useState<ContextoDaNuvem>(() => contextoInicial(qual));
  const [aberto, setAberto] = useState<string | null>(registro.abre ?? null);
  const [lugar, setLugar] = useState<LugarDaNuvem>('meu');
  const [pasta, setPasta] = useState<string | null>(null);
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [caixa, setCaixa] = useState<'compartilhar' | 'email' | 'mover' | null>(null);
  const [heranca, setHeranca] = useState(false);
  const [papelVisto, setPapelVisto] = useState<Papel>('leitor');
  /* Quais dos três limites já foram lidos. Num `ref` porque ele não muda nada
     na tela: marcar na caixa quais já se leu poria ali um placar da tarefa,
     que é coisa da plataforma dentro do programa imitado. */
  const lidos = useRef(new Set<Papel>());
  const [paraQuem, setParaQuem] = useState<Pessoa>('cleide');
  const [comoMandar, setComoMandar] = useState<'anexo' | 'vinculo'>('anexo');
  const [papelNovo, setPapelNovo] = useState<Papel>('leitor');
  const [gaveta, setGaveta] = useState<string | null>(null);
  const [bloco, setBloco] = useState<string | null>(null);
  const [historico, setHistorico] = useState(false);
  const [versao, setVersao] = useState<string | null>(null);
  const [rascunhos, setRascunhos] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const [outrosJaEscreveram, setOutrosJaEscreveram] = useState(0);

  const nuvem = ctx.nuvem;
  const arquivoAberto = aberto ? nuvem.arquivos.find(a => a.id === aberto) : undefined;
  const doc = docDoArquivo(arquivoAberto);
  const meuPapel = arquivoAberto ? papelDe(nuvem, arquivoAberto.id, 'voce') : undefined;
  const soComento = meuPapel === 'comentarista';
  const alvo = menu ? nuvem.arquivos.find(a => a.id === menu.id) : undefined;
  const daCaixa = escolhido ? nuvem.arquivos.find(a => a.id === escolhido) : undefined;

  const mexer = (f: (n: Nuvem) => Nuvem) => setCtx(c => ({ ...c, nuvem: f(c.nuvem) }));
  const descobrir = (o: string) => setCtx(c =>
    (c.descobertas.includes(o) ? c : { ...c, descobertas: [...c.descobertas, o] }));

  const recomecar = () => {
    setCtx(contextoInicial(qual));
    setAberto(registro.abre ?? null);
    setLugar('meu'); setPasta(null); setEscolhido(null); setMenu(null); setCaixa(null);
    setHeranca(false); lidos.current = new Set(); setGaveta(null); setBloco(null);
    setHistorico(false); setVersao(null); setRascunhos({}); setAviso(null);
    setOutrosJaEscreveram(0);
  };

  /* ── O que acontece quando você escreve ─────────────────────────────────── */

  const gravar = (id: string, quem: Pessoa[], novo: Doc<string>) =>
    mexer(n => gravarVersao(n, id, 'agora mesmo', quem, novo));

  /**
   * Depois da sua edição, quem está junto escreve também.
   *
   * Não é relógio: é a ordem que o requisito 4.2 pede que se veja. Cada lição
   * tem a sua consequência, e nenhuma acontece duas vezes — uma linha da
   * Marta chegando a cada tecla seria um documento que ninguém consegue ler.
   */
  const osOutrosRespondem = (depois: Doc<string>) => {
    if (qual === 'juntos' && outrosJaEscreveram === 0) {
      setOutrosJaEscreveram(1);
      gravar('escala', ['voce', 'marta'],
        { ...depois, blocos: [...depois.blocos, LINHA_DA_MARTA()] });
      setAviso('A Marta escreveu uma linha agora.');
      return;
    }
    if (qual === 'conflito' && outrosJaEscreveram === 0) {
      setOutrosJaEscreveram(1);
      /* A internet da Marta voltou, e o que ela escreveu sem rede subiu
         junto. A nuvem não escolhe: guarda as duas. */
      mexer(n => conflitoDeSincronizacao(n, 'escala', 'marta', {
        ...ESCALA(),
        blocos: [...ESCALA().blocos,
          linhaDe('es-8', 'corpo', 'A Águia troca com a Onça no almoço de sábado.')],
      }, 'agora mesmo'));
      setAviso('A Marta voltou a ter internet, e a versão dela subiu junto.');
      return;
    }
    if (qual === 'combinado') {
      const respondidas = depois.blocos.filter(b => b.tipo === 'paragrafo'
        && b.id.endsWith('-r') && b.trechos.map(x => x.texto).join('').trim().length > 0).length;
      if (respondidas >= 2 && outrosJaEscreveram === 0) {
        setOutrosJaEscreveram(1);
        gravar('acordo', ['marta'], depois);
        setAviso('A Marta leu e escreveu a parte dela.');
      } else if (respondidas >= 4 && outrosJaEscreveram === 1) {
        setOutrosJaEscreveram(2);
        gravar('acordo', ['ronaldo'], depois);
        setAviso('O Ronaldo leu e escreveu a parte dele.');
      }
    }
  };

  const escrever = (blocoId: string, texto: string) => {
    if (!arquivoAberto || !doc) return;
    /*
      Três caminhos, e é neles que a vereda acontece. Quem só comenta não muda
      o texto: propõe. Quem está em modo de Sugestão, idem, por escolha. Só no
      terceiro o texto entra mesmo.
    */
    if (soComento) {
      const novo = sugerirDepoisDo(doc, blocoId, texto);
      gravar(arquivoAberto.id, ['voce'], novo);
      descobrir('comentarista-so-sugere');
      setAviso('Você é comentarista aqui: o que escreveu virou sugestão.');
      return;
    }
    if (ctx.modo === 'sugestao') {
      const novo = sugerirDepoisDo(doc, blocoId, texto);
      gravar(arquivoAberto.id, ['voce'], novo);
      descobrir('escreveu-em-modo-sugestao');
      return;
    }
    const novo = escreverNoBloco(doc, blocoId, texto);
    gravar(arquivoAberto.id, ['voce'], novo);
    osOutrosRespondem(novo);
  };

  /* ── A nuvem ────────────────────────────────────────────────────────────── */

  const naPasta = nuvem.arquivos.filter(a => {
    if (lugar === 'lixeira') return a.naLixeira;
    if (a.naLixeira) return false;
    if (lugar === 'comigo') return a.dono !== 'voce' && !a.pasta;
    return (a.pasta ?? null) === pasta;
  });

  const trilhaDoCaminho = () => {
    const nomes: { id: string | null; nome: string }[] = [{ id: null, nome: 'Meu Drive' }];
    const cadeia: ArquivoDaNuvem[] = [];
    let atual = pasta ? nuvem.arquivos.find(a => a.id === pasta) : undefined;
    while (atual) {
      cadeia.unshift(atual);
      atual = atual.pasta ? nuvem.arquivos.find(a => a.id === atual!.pasta) : undefined;
    }
    return [...nomes, ...cadeia.map(p => ({ id: p.id as string | null, nome: p.nome }))];
  };

  const abrir = (a: ArquivoDaNuvem) => {
    if (a.tipo === 'pasta') { setPasta(a.id); setEscolhido(null); return; }
    setAberto(a.id);
    setBloco(null);
    if (a.copiaDe === 'materiais') descobrir('a-copia-nao-acompanha');
    if (a.nome.includes('cópia em conflito')) descobrir('abriu-a-copia-em-conflito');
  };

  const vistaDaNuvem = (
    <div className="nv-janela">
      <TopoDaNuvem quem="voce" />
      <div className="nv-corpo">
        <LateralDaNuvem lugar={lugar} usado={0.31}
          aoIr={l => { setLugar(l); setPasta(null); setEscolhido(null); }} />
        <div className="nv-painel">
          {lugar === 'meu' && <CaminhoDaNuvem trilha={trilhaDoCaminho()} aoIr={setPasta} />}
          <div className="nv-lista">
            <CabecalhoDaLista />
            {naPasta.map(a => (
              <LinhaDaNuvem key={a.id} arquivo={a} escolhido={escolhido === a.id}
                aoEscolher={() => setEscolhido(a.id)}
                aoAbrir={() => abrir(a)}
                aoMenu={e => {
                  e.preventDefault();
                  setMenu({ id: a.id, x: 40, y: 80 });
                }} />
            ))}
          </div>
        </div>
      </div>

      {menu && alvo && (
        <MenuDoArquivo onde={{ x: menu.x, y: menu.y }} aoFechar={() => setMenu(null)}>
          <ItemDoMenu icone={Share2} aoClicar={() => {
            setEscolhido(alvo.id); setCaixa('compartilhar'); setMenu(null); setHeranca(false);
            if (alvo.id === 'fichas') descobrir('a-pasta-alcanca');
          }}>Compartilhar</ItemDoMenu>
          <ItemDoMenu icone={Mail} aoClicar={() => {
            setEscolhido(alvo.id); setCaixa('email'); setMenu(null);
          }} desligado={alvo.tipo === 'pasta'}>Enviar por e-mail</ItemDoMenu>
          <ItemDoMenu icone={FolderInput} aoClicar={() => {
            setEscolhido(alvo.id); setCaixa('mover'); setMenu(null);
          }}>Mover para</ItemDoMenu>
          <div className="nv-risco" />
          <ItemDoMenu icone={Download} desligado>Baixar</ItemDoMenu>
          <ItemDoMenu icone={Copy} desligado>Fazer uma cópia</ItemDoMenu>
          {/* Quem tira da pasta é quem pode escrever nela: um leitor que
              mandasse o arquivo dos outros para a lixeira seria um leitor
              apagando coisa alheia. E a cópia em conflito é do dono do
              original, não de quem a provocou — gatear por propriedade
              trancaria a lição do requisito 6, que é ela que manda tirá-la
              da frente. */}
          <ItemDoMenu icone={Trash2} aoClicar={() => {
            mexer(n => mandarParaALixeira(n, alvo.id));
            setMenu(null); setEscolhido(null);
          }} desligado={!podeEditar(nuvem, alvo.id, 'voce')}>
            Mover para a lixeira
          </ItemDoMenu>
        </MenuDoArquivo>
      )}

      {caixa === 'compartilhar' && daCaixa && (
        <CaixaDeCompartilhar arquivo={daCaixa} aoFechar={() => setCaixa(null)}>
          <SecaoDaCaixa>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="nv-campo" aria-label="Pessoa"
                value={paraQuem} onChange={e => setParaQuem(e.target.value as Pessoa)}>
                {(['marta', 'ronaldo', 'cleide'] as Pessoa[])
                  .filter(q => q !== daCaixa.dono)
                  .map(q => <option key={q} value={q}>{NOME_DO_AUTOR[q]}</option>)}
              </select>
              <SeletorDePapel papel={papelNovo} aoMudar={setPapelNovo} />
              <BotaoDaNuvem principal aoClicar={() => {
                mexer(n => compartilhar(n, daCaixa.id, paraQuem, papelNovo));
              }}>Adicionar</BotaoDaNuvem>
            </div>
          </SecaoDaCaixa>

          <SecaoDaCaixa titulo="Pessoas com acesso">
            <PessoaDaCaixa quem={daCaixa.dono} dono />
            {daCaixa.acessos.map(x => (
              <PessoaDaCaixa key={x.quem} quem={x.quem}>
                <SeletorDePapel
                  papel={x.papel}
                  aoMudar={p => mexer(n => compartilhar(n, daCaixa.id, x.quem, p))}
                  aoTirar={() => mexer(n => tirarAcessoDoArquivo(n, daCaixa.id, x.quem))}
                  aoTransferir={daCaixa.dono === 'voce'
                    ? () => mexer(n => transferirPropriedade(n, daCaixa.id, x.quem))
                    : undefined}
                />
              </PessoaDaCaixa>
            ))}
            <AcessoPelaPasta nuvem={nuvem} arquivo={daCaixa} aberto={heranca}
              aoAbrir={() => { setHeranca(h => !h); descobrir('contou-quem-entrava'); }} />
          </SecaoDaCaixa>

          <SecaoDaCaixa titulo="Acesso geral">
            <div className="nv-acesso-geral">
              <Link2 size={17} aria-hidden />
              <span className="nv-quem">
                <b>{daCaixa.linkAberto ? 'Qualquer pessoa com o link' : 'Restrito'}</b>
                <span>
                  {daCaixa.linkAberto
                    ? `Quem tiver o endereço entra como ${NOME_DO_PAPEL[daCaixa.linkAberto]}.`
                    : 'Só quem está na lista acima abre este arquivo.'}
                </span>
              </span>
              <select className="nv-papel" aria-label="Acesso geral"
                value={daCaixa.linkAberto ?? 'restrito'}
                onChange={e => mexer(n => mudarAcessoGeral(n, daCaixa.id,
                  e.target.value === 'restrito' ? undefined : e.target.value as Papel))}>
                <option value="restrito">Restrito</option>
                {PAPEIS.map(p => (
                  <option key={p} value={p}>Qualquer pessoa — {NOME_DO_PAPEL[p]}</option>
                ))}
              </select>
            </div>
          </SecaoDaCaixa>

          <SecaoDaCaixa>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, color: '#5E5E5E' }}>O que cada nível pode:</span>
              <select className="nv-papel" aria-label="Ver o que um nível permite"
                value={papelVisto}
                onChange={e => {
                  const p = e.target.value as Papel;
                  setPapelVisto(p);
                  lidos.current.add(p);
                  if (lidos.current.size === PAPEIS.length) descobrir('leu-os-tres-limites');
                }}>
                {PAPEIS.map(p => <option key={p} value={p}>{NOME_DO_PAPEL[p]}</option>)}
              </select>
            </div>
            <OQuePapelDeixa papel={papelVisto} />
          </SecaoDaCaixa>

          <RodapeDaCaixa>
            <span />
            <BotaoDaNuvem principal aoClicar={() => setCaixa(null)}>Concluído</BotaoDaNuvem>
          </RodapeDaCaixa>
        </CaixaDeCompartilhar>
      )}

      {caixa === 'email' && daCaixa && (
        <CaixaDeCompartilhar arquivo={daCaixa} aoFechar={() => setCaixa(null)}>
          <SecaoDaCaixa titulo="Para quem">
            <select className="nv-campo" aria-label="Para quem"
              value={paraQuem} onChange={e => setParaQuem(e.target.value as Pessoa)}>
              {(['marta', 'ronaldo', 'cleide'] as Pessoa[])
                .map(q => <option key={q} value={q}>{NOME_DO_AUTOR[q]}</option>)}
            </select>
          </SecaoDaCaixa>
          <SecaoDaCaixa titulo="Como mandar">
            {/* As duas se parecem na hora de clicar, e a diferença aparece
                longe daqui. É o requisito 3 inteiro, e é por isso que as duas
                estão na mesma caixa, como no correio de verdade. */}
            {([
              ['anexo', 'Anexar uma cópia', 'Sai um arquivo novo, que passa a ser de quem recebeu.'],
              ['vinculo', 'Compartilhar o vínculo', 'Continua um arquivo só, e ele entra nele.'],
            ] as const).map(([id, nome, diz]) => (
              <label key={id} className="nv-pessoa" style={{ cursor: 'pointer' }}>
                <input type="radio" name="como" value={id} checked={comoMandar === id}
                  onChange={() => setComoMandar(id)} />
                <span className="nv-quem"><b>{nome}</b><span>{diz}</span></span>
              </label>
            ))}
          </SecaoDaCaixa>
          <RodapeDaCaixa>
            <BotaoDaNuvem aoClicar={() => setCaixa(null)}>Cancelar</BotaoDaNuvem>
            <BotaoDaNuvem principal aoClicar={() => {
              if (comoMandar === 'anexo') {
                mexer(n => mandarPorAnexo(n, daCaixa.id, paraQuem, 'agora mesmo'));
              } else {
                mexer(n => compartilhar(n, daCaixa.id, paraQuem, 'editor'));
              }
              setCaixa(null);
            }}>Enviar</BotaoDaNuvem>
          </RodapeDaCaixa>
        </CaixaDeCompartilhar>
      )}

      {caixa === 'mover' && daCaixa && (
        <CaixaDeCompartilhar arquivo={daCaixa} aoFechar={() => setCaixa(null)}>
          <SecaoDaCaixa titulo="Mover para">
            <select className="nv-campo" aria-label="Pasta de destino"
              value={daCaixa.pasta ?? 'raiz'}
              onChange={e => mexer(n => mover(n, daCaixa.id,
                e.target.value === 'raiz' ? undefined : e.target.value))}>
              <option value="raiz">Meu Drive</option>
              {nuvem.arquivos.filter(a => a.tipo === 'pasta' && a.id !== daCaixa.id)
                .map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </SecaoDaCaixa>
          <RodapeDaCaixa>
            <span />
            <BotaoDaNuvem principal aoClicar={() => setCaixa(null)}>Concluído</BotaoDaNuvem>
          </RodapeDaCaixa>
        </CaixaDeCompartilhar>
      )}
    </div>
  );

  /* ── O editor ───────────────────────────────────────────────────────────── */

  const comentados = new Set(doc ? comentariosDoDoc(doc).map(c => c.trecho) : []);
  const pendentes = doc ? revisoesPendentes(doc) : [];
  const versaoBoa = (v: string) => {
    const vs = arquivoAberto?.versoes.find(x => x.id === v);
    return !!vs?.doc && textoDoDoc(vs.doc).includes('a inscrição custa 45 reais');
  };

  const margem = doc ? (
    <div className="wd-margem">
      {comentariosDoDoc(doc).map(c => (
        <BalaoDeComentario key={c.id} comentario={c}
          rascunho={rascunhos[c.id] ?? ''}
          aoEscrever={v => setRascunhos(r => ({ ...r, [c.id]: v }))}
          aoResponder={() => {
            const texto = (rascunhos[c.id] ?? '').trim();
            if (!texto || !arquivoAberto) return;
            gravar(arquivoAberto.id, ['voce'], responderComentario(doc, c.id, {
              id: `r-${c.id}-${c.respostas.length}`, autor: 'voce', texto,
            }));
            setRascunhos(r => ({ ...r, [c.id]: '' }));
          }}
          aoResolver={() => arquivoAberto
            && gravar(arquivoAberto.id, ['voce'], resolverComentario(doc, c.id))}
        />
      ))}
      {pendentes.map(({ trecho }) => (
        <div key={trecho.id} className="wd-balao" data-sugestao={trecho.id}>
          <div className="wd-balao-autor">{NOME_DO_AUTOR[trecho.revisao.autor]} sugeriu</div>
          <div>{trecho.texto}</div>
          <div className="wd-balao-acoes">
            <button type="button" onClick={() => {
              if (!arquivoAberto) return;
              gravar(arquivoAberto.id, ['voce'], aceitarRevisao(doc, trecho.id));
              descobrir('aceitou-uma-sugestao');
            }}>Aceitar</button>
            <button type="button" onClick={() => {
              if (!arquivoAberto) return;
              gravar(arquivoAberto.id, ['voce'], rejeitarRevisao(doc, trecho.id));
              descobrir('rejeitou-uma-sugestao');
            }}>Rejeitar</button>
          </div>
        </div>
      ))}
    </div>
  ) : undefined;

  const vistaDoEditor = arquivoAberto && doc && (
    <div className="ed-janela">
      <TopoDoEditor
        nome={arquivoAberto.nome}
        menus={(
          <>
            <MenuDoEditor nome="Arquivo" aberto={gaveta === 'arquivo'}
              aoAbrir={() => setGaveta(g => (g === 'arquivo' ? null : 'arquivo'))}>
              <ItemDaGaveta icone={History} aoClicar={() => {
                setHistorico(true); setGaveta(null); descobrir('leu-quem-escreveu');
              }}>Histórico de versões</ItemDaGaveta>
              <ItemDaGaveta icone={Share2} aoClicar={() => {
                setEscolhido(arquivoAberto.id); setCaixa('compartilhar');
                setAberto(null); setGaveta(null);
              }}>Compartilhar</ItemDaGaveta>
              <ItemDaGaveta icone={Download} desligado>Fazer o download</ItemDaGaveta>
            </MenuDoEditor>
            <MenuDoEditor nome="Editar" aberto={gaveta === 'editar'}
              aoAbrir={() => setGaveta(g => (g === 'editar' ? null : 'editar'))}>
              <ItemDaGaveta desligado>Desfazer</ItemDaGaveta>
              <ItemDaGaveta desligado>Refazer</ItemDaGaveta>
            </MenuDoEditor>
            <MenuDoEditor nome="Inserir" aberto={gaveta === 'inserir'}
              aoAbrir={() => setGaveta(g => (g === 'inserir' ? null : 'inserir'))}>
              <ItemDaGaveta icone={MessageSquarePlus} desligado={!bloco} aoClicar={() => {
                if (!bloco) return;
                gravar(arquivoAberto.id, ['voce'], acrescentarComentario(doc, {
                  id: `c-voce-${comentariosDoDoc(doc).length}`,
                  trecho: `${bloco}-a`, autor: 'voce',
                  texto: 'Precisamos confirmar isto antes da reunião.',
                  respostas: [], resolvido: false,
                }));
                setGaveta(null);
              }}>Comentário</ItemDaGaveta>
            </MenuDoEditor>
            <MenuDoEditor nome="Formatar" aberto={false} aoAbrir={() => {}} />
            <MenuDoEditor nome="Ajuda" aberto={false} aoAbrir={() => {}} />
          </>
        )}
        direita={(
          <>
            <button type="button" className="ed-ferramenta" aria-label="Quem está no documento"
              onClick={() => descobrir('viu-as-bolhas')}>
              <Users size={17} aria-hidden />
            </button>
            <PresencaNoEditor quem={['voce', ...arquivoAberto.acessos
              .filter(a => a.papel === 'editor').map(a => a.quem)]} />
            <BotaoCompartilharNoEditor aoClicar={() => {
              setEscolhido(arquivoAberto.id); setCaixa('compartilhar'); setAberto(null);
            }} />
          </>
        )}
      />

      <BarraDoEditor>
        <FerramentaDoEditor icone={MessageSquarePlus} dica="Inserir comentário"
          desligada={!bloco}
          aoClicar={() => {
            if (!bloco) return;
            gravar(arquivoAberto.id, ['voce'], acrescentarComentario(doc, {
              id: `c-voce-${comentariosDoDoc(doc).length}`,
              trecho: `${bloco}-a`, autor: 'voce',
              texto: 'Precisamos confirmar isto antes da reunião.',
              respostas: [], resolvido: false,
            }));
          }} />
        <FerramentaDoEditor icone={History} dica="Histórico de versões"
          ativa={historico}
          aoClicar={() => { setHistorico(h => !h); descobrir('leu-quem-escreveu'); }} />
        <SeparadorDaBarra />
        <FerramentaDoEditor icone={Check} dica="Aceitar a sugestão escolhida"
          desligada={pendentes.length === 0}
          aoClicar={() => {
            const p = pendentes[0];
            if (!p) return;
            gravar(arquivoAberto.id, ['voce'], aceitarRevisao(doc, p.trecho.id));
            descobrir('aceitou-uma-sugestao');
          }} />
        <FerramentaDoEditor icone={X} dica="Rejeitar a sugestão escolhida"
          desligada={pendentes.length === 0}
          aoClicar={() => {
            const p = pendentes[0];
            if (!p) return;
            gravar(arquivoAberto.id, ['voce'], rejeitarRevisao(doc, p.trecho.id));
            descobrir('rejeitou-uma-sugestao');
          }} />
        <SeletorDeModo modo={ctx.modo}
          aoTrocar={(m: ModoDeTrabalho) => setCtx(c => ({ ...c, modo: m }))} />
      </BarraDoEditor>

      <PalcoDoEditor lado={historico ? (
        <PainelDeHistorico
          versoes={arquivoAberto.versoes}
          escolhida={versao}
          aoEscolher={v => { setVersao(v); if (versaoBoa(v)) descobrir('achou-a-versao-boa'); }}
          aoRestaurar={v => {
            mexer(n => restaurarVersao(n, arquivoAberto.id, v, 'voce', 'agora mesmo'));
            setVersao(null);
            setAviso('Versão restaurada. A de antes continua no histórico.');
          }}
          aoFechar={() => setHistorico(false)}
        />
      ) : undefined}>
        <FolhaDoWord
          doc={doc}
          selecionado={bloco}
          marcas
          comentado={comentados}
          aoEscolher={setBloco}
          aoClicarNoVazio={() => setBloco(null)}
          aoEscreverNoParagrafo={ctx.modo === 'visualizacao' ? undefined : escrever}
          aoNovoParagrafo={ctx.modo === 'edicao' && !soComento
            ? b => {
              const { doc: depois, novo } = paragrafoDepoisDe(doc, b);
              gravar(arquivoAberto.id, ['voce'], depois);
              setBloco(novo);
            }
            : undefined}
          margem={margem}
        />
        {qual === 'juntos' && outrosJaEscreveram > 0 && (
          <CursorDeOutro quem="marta" blocoId="es-6" />
        )}
      </PalcoDoEditor>

      {aviso && (
        <AvisoDoEditor acao="Fechar" aoAgir={() => setAviso(null)}>{aviso}</AvisoDoEditor>
      )}

      <div style={{ padding: '8px 14px', borderTop: '1px solid #E3E3E3' }}>
        <BotaoDoEditor aoClicar={() => { setAberto(null); setHistorico(false); }}>
          Voltar para a nuvem
        </BotaoDoEditor>
      </div>
    </div>
  );

  return (
    <Moldura
      vereda={vereda} licao={licao} metas={registro.metas} contexto={ctx}
      recomecar={recomecar} aoVencer={aoVencer} aoSair={aoSair}
    >
      <style>{CSS_DA_NUVEM}{CSS_DO_EDITOR_NA_NUVEM}{CSS_FOLHA}</style>
      {arquivoAberto && doc ? vistaDoEditor : vistaDaNuvem}
    </Moldura>
  );
}
