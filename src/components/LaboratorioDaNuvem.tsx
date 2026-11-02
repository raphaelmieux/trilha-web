import { useEffect, useRef, useState } from 'react';
import {
  Undo2, Share2, Download, Copy, Trash2, FolderInput, Mail, Users,
  MessageSquarePlus, Check, X, History, Link2,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_DA_NUVEM, TopoDaNuvem, LateralDaNuvem, CaminhoDaNuvem, CabecalhoDaLista,
  LinhaDaNuvem, MenuDoArquivo, ItemDoMenu, SeletorDePapel, AcessoPelaPasta,
  OQuePapelDeixa, CaixaDeCompartilhar, PessoaDaCaixa, SecaoDaCaixa,
  RodapeDaCaixa, BotaoDaNuvem, BarraDaSelecao, AcaoDaSelecao, type LugarDaNuvem,
} from '../labs/nuvem';
import {
  CSS_DO_EDITOR_NA_NUVEM, TopoDoEditor, MenuDoEditor, ItemDaGaveta,
  PresencaNoEditor, BotaoCompartilharNoEditor, BarraDoEditor, FerramentaDoEditor,
  SeparadorDaBarra, SeletorDeModo, PalcoDoEditor, CursorDeOutro, PainelDeHistorico,
  AvisoDoEditor, BotaoDoEditor, GavetaPadraoDoEditor, FerramentasPadraoDoEditor,
  AcoesDoTopoDoEditor,
} from '../labs/editorNaNuvem';
import { CSS_FOLHA, FolhaDoWord, BalaoDeComentario } from '../labs/word';
import { useEdicaoDoWord, type ComandoDeTexto } from '../labs/useEdicaoDoWord';
import {
  isolarSelecao, palavraEmVolta, recolhida, sugestaoDoTrecho, tamanhoDoParagrafo, trechosEmVolta,
} from '../labs/edicao';
import {
  type ArquivoDaNuvem, type ModoDeTrabalho, type Nuvem, type Papel, type Pessoa,
  PAPEIS, NOME_DO_PAPEL, compartilhar, conflitoDeSincronizacao, gravarVersao, gravarNaSessao,
  mandarParaALixeira, mandarPorAnexo, mover, mudarAcessoGeral, papelDe, podeEditar,
  restaurarVersao, tirarAcessoDoArquivo, transferirPropriedade, versaoAtual, emOrdemDaLista,
} from '../labs/arquivoCompartilhado';
import {
  type Doc, NOME_DO_AUTOR, acrescentarComentario, aceitarRevisao,
  comentariosDoDoc, linhaDe, rejeitarRevisao, resolverComentario,
  responderComentario, revisoesPendentes, textoDoDoc,
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

/** O documento do gancho enquanto nenhum arquivo está aberto. */
const DOC_VAZIO: Doc<string> = { blocos: [], colunas: {}, sumario: null };

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
  const [crescente, setCrescente] = useState(true);
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
  const [historico, setHistorico] = useState(false);
  const [versao, setVersao] = useState<string | null>(null);
  const [rascunhos, setRascunhos] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  /* O que existe no editor de verdade e não faz parte da lição responde com o
     aviso preto do programa, como os enfeites da faixa do Word. */
  const fora = (comando: string) => {
    setGaveta(null);
    setAviso(`${comando} existe no editor de verdade, e não faz parte desta lição.`);
  };
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
    setHeranca(false); lidos.current = new Set(); setGaveta(null);
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

  /*
    O que se digita passa pelo mesmo motor do Word, e são três caminhos — é
    neles que a vereda acontece. Quem só comenta não muda o texto: propõe.
    Quem está em modo de Sugestão, idem, por escolha. Só no terceiro o texto
    entra mesmo. Propor é o controle de alterações com o seu nome: o que se
    digita sai sublinhado, e o que se apaga sai riscado, esperando alguém
    aceitar.
  */
  const propondo = soComento || ctx.modo === 'sugestao';
  const mudaTexto = (c: ComandoDeTexto) => !['desfazer', 'refazer', 'selecionar-tudo'].includes(c.tipo);
  const edicao = useEdicaoDoWord(doc ?? DOC_VAZIO, (novo) => {
    if (!arquivoAberto) return;
    mexer(n => gravarNaSessao(n, arquivoAberto.id, 'agora mesmo', ['voce'], novo));
    if (!propondo) osOutrosRespondem(novo);
  }, {
    quem: { autor: 'voce', marcar: propondo },
    atalhos: 'navegador',
    permitir: (c) => {
      if (!mudaTexto(c)) return true;
      if (ctx.modo === 'visualizacao') {
        setAviso('Você está em modo de Visualização: aqui só se lê. Troque o modo no canto da barra para escrever.');
        return false;
      }
      if (c.tipo === 'inserir' || c.tipo === 'apagar' || c.tipo === 'paragrafo') {
        if (soComento) {
          descobrir('comentarista-so-sugere');
          setAviso('Você é comentarista aqui: o que escreveu virou sugestão.');
        } else if (ctx.modo === 'sugestao') {
          descobrir('escreveu-em-modo-sugestao');
        }
      }
      return true;
    },
  });
  const { esquecer } = edicao;
  /* Outro arquivo na mesma janela: o Ctrl+Z e o cursor eram do anterior. */
  useEffect(() => { esquecer(); }, [aberto, esquecer]);
  const bloco = edicao.paragrafo?.id ?? null;

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
    if (a.copiaDe === 'materiais') descobrir('a-copia-nao-acompanha');
    if (a.nome.includes('cópia em conflito')) descobrir('abriu-a-copia-em-conflito');
  };

  /* Os gestos sobre um arquivo saem de um lugar só: o menu de três pontos e a
     barra da seleção fazem a mesma coisa, e escritos duas vezes divergiriam —
     a descoberta da ficha médica valeria por um caminho e não pelo outro. */
  const compartilharArquivo = (id: string) => {
    setEscolhido(id); setCaixa('compartilhar'); setMenu(null); setHeranca(false);
    if (id === 'fichas') descobrir('a-pasta-alcanca');
  };
  const moverArquivo = (id: string) => { setEscolhido(id); setCaixa('mover'); setMenu(null); };
  const paraALixeira = (id: string) => {
    mexer(n => mandarParaALixeira(n, id));
    setMenu(null); setEscolhido(null);
  };
  const daSelecao = escolhido ? nuvem.arquivos.find(a => a.id === escolhido && naPasta.includes(a)) : undefined;
  const NOME_DO_LUGAR: Record<LugarDaNuvem, string> = {
    meu: 'Meu Drive', comigo: 'Compartilhados comigo', lixeira: 'Lixeira',
  };

  const vistaDaNuvem = (
    <div className="nv-janela">
      <TopoDaNuvem quem="voce" />
      <div className="nv-corpo">
        <LateralDaNuvem lugar={lugar} usado={0.31}
          aoNovo={() => setAviso('Criar pasta e arquivo existe na nuvem de verdade, e está aqui para a lateral ficar igual — mas não faz parte deste exercício.')}
          aoIr={l => { setLugar(l); setPasta(null); setEscolhido(null); }} />
        <div className="nv-painel">
          <CaminhoDaNuvem trilha={lugar === 'meu' ? trilhaDoCaminho() : [{ id: null, nome: NOME_DO_LUGAR[lugar] }]}
            aoIr={setPasta} />
          <BarraDaSelecao quantos={daSelecao ? 1 : 0} aoLimpar={() => setEscolhido(null)}>
            {daSelecao && (
              <>
                <AcaoDaSelecao icone={Share2} nome="Compartilhar" aoClicar={() => compartilharArquivo(daSelecao.id)} />
                <AcaoDaSelecao icone={FolderInput} nome="Mover para" aoClicar={() => moverArquivo(daSelecao.id)} />
                <AcaoDaSelecao icone={Trash2} nome="Mover para a lixeira" aoClicar={() => paraALixeira(daSelecao.id)}
                  desligado={lugar === 'lixeira' || !podeEditar(nuvem, daSelecao.id, 'voce')} />
              </>
            )}
          </BarraDaSelecao>
          <div className="nv-lista">
            <CabecalhoDaLista crescente={crescente} aoOrdenar={() => setCrescente(c => !c)} />
            {emOrdemDaLista(naPasta, crescente).map(a => (
              <LinhaDaNuvem key={a.id} arquivo={a} escolhido={escolhido === a.id}
                aoEscolher={() => setEscolhido(a.id)}
                aoAbrir={() => abrir(a)}
                aoMenu={(_, onde) => setMenu({ id: a.id, ...onde })} />
            ))}
          </div>
        </div>
      </div>

      {menu && alvo && (
        <MenuDoArquivo onde={{ x: menu.x, y: menu.y }} aoFechar={() => setMenu(null)}>
          <ItemDoMenu icone={Share2} aoClicar={() => compartilharArquivo(alvo.id)}>Compartilhar</ItemDoMenu>
          <ItemDoMenu icone={Mail} aoClicar={() => {
            setEscolhido(alvo.id); setCaixa('email'); setMenu(null);
          }} desligado={alvo.tipo === 'pasta'}>Enviar por e-mail</ItemDoMenu>
          <ItemDoMenu icone={FolderInput} aoClicar={() => moverArquivo(alvo.id)}>Mover para</ItemDoMenu>
          <div className="nv-risco" />
          <ItemDoMenu icone={Download} desligado>Baixar</ItemDoMenu>
          <ItemDoMenu icone={Copy} desligado>Fazer uma cópia</ItemDoMenu>
          {/* Quem tira da pasta é quem pode escrever nela: um leitor que
              mandasse o arquivo dos outros para a lixeira seria um leitor
              apagando coisa alheia. E a cópia em conflito é do dono do
              original, não de quem a provocou — gatear por propriedade
              trancaria a lição do requisito 6, que é ela que manda tirá-la
              da frente. */}
          <ItemDoMenu icone={Trash2} aoClicar={() => paraALixeira(alvo.id)}
            desligado={!podeEditar(nuvem, alvo.id, 'voce')}>
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
  /* Um balão por sugestão, e não por marca: trocar uma palavra deixa a velha
     riscada e a nova sublinhada, e o editor mostra as duas num balão só. */
  const sugestoesAgrupadas = (() => {
    if (!doc) return [];
    const vistos = new Set<string>();
    return pendentes.flatMap(({ trecho }) => {
      if (vistos.has(trecho.id)) return [];
      const ids = sugestaoDoTrecho(doc, trecho.id);
      ids.forEach(id => vistos.add(id));
      const marcados = pendentes.filter(p => ids.includes(p.trecho.id)).map(p => p.trecho);
      return [{
        ids,
        autor: trecho.revisao.autor,
        tirar: marcados.filter(x => x.revisao.tipo === 'excluido').map(x => x.texto).join(''),
        por: marcados.filter(x => x.revisao.tipo === 'inserido').map(x => x.texto).join(''),
      }];
    });
  })();
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
      {sugestoesAgrupadas.map(g => (
        <div key={g.ids[0]} className="wd-balao" data-sugestao={g.ids[0]}>
          <div className="wd-balao-autor">{NOME_DO_AUTOR[g.autor]} sugeriu</div>
          {g.tirar && <div>Excluir: <s>{g.tirar}</s></div>}
          {g.por && <div>{g.tirar ? 'Adicionar: ' : ''}{g.por}</div>}
          <div className="wd-balao-acoes">
            <button type="button" onClick={() => resolverSugestao(true, g.ids[0])}>Aceitar</button>
            <button type="button" onClick={() => resolverSugestao(false, g.ids[0])}>Rejeitar</button>
          </div>
        </div>
      ))}
    </div>
  ) : undefined;

  /**
   * Comentar vale para o que está selecionado, como no editor de verdade; com
   * o cursor parado, para a palavra em que ele está, e num espaço para o
   * parágrafo inteiro.
   */
  const comentarNaSelecao = () => {
    const s = edicao.selecao;
    if (!arquivoAberto || !doc || !s) {
      setAviso('Selecione primeiro o texto que você quer comentar.');
      return;
    }
    const p = edicao.paragrafo;
    const alcance = !recolhida(s) ? s
      : palavraEmVolta(doc, s.foco)
        ?? (p ? { ancora: { bloco: p.id, offset: 0 }, foco: { bloco: p.id, offset: tamanhoDoParagrafo(p) } } : null);
    if (!alcance || recolhida(alcance)) return;
    const isolado = isolarSelecao(doc, alcance);
    if (!isolado.trecho) return;
    gravar(arquivoAberto.id, ['voce'], acrescentarComentario(isolado.doc, {
      id: `c-voce-${comentariosDoDoc(doc).length}`,
      trecho: isolado.trecho, autor: 'voce',
      texto: 'Precisamos confirmar isto antes da reunião.',
      respostas: [], resolvido: false,
    }));
  };

  /**
   * Aceitar ou rejeitar a sugestão escolhida — a do balão clicado, ou a que
   * está debaixo do cursor, ou, sem nenhuma das duas, a primeira da página.
   * A sugestão é o grupo inteiro: trocar uma palavra deixa duas marcas, e as
   * duas se resolvem juntas.
   */
  const resolverSugestao = (aceitar: boolean, trechoId?: string) => {
    if (!arquivoAberto || !doc) return;
    const emVolta = edicao.selecao ? trechosEmVolta(doc, edicao.selecao.foco) : null;
    const debaixo = (emVolta?.depois?.revisao ? emVolta.depois.id : null)
      ?? (emVolta?.antes?.revisao ? emVolta.antes.id : null);
    const alvoId = trechoId ?? debaixo ?? pendentes[0]?.trecho.id;
    if (!alvoId) return;
    const grupo = sugestaoDoTrecho(doc, alvoId);
    const novo = grupo.reduce((d, id) => (aceitar ? aceitarRevisao(d, id) : rejeitarRevisao(d, id)), doc);
    gravar(arquivoAberto.id, ['voce'], novo);
    descobrir(aceitar ? 'aceitou-uma-sugestao' : 'rejeitou-uma-sugestao');
  };

  const vistaDoEditor = arquivoAberto && doc && (
    <div className="ed-janela">
      <TopoDoEditor
        nome={arquivoAberto.nome}
        aoNaoFazParte={fora}
        aoIrParaInicio={() => { setAberto(null); setHistorico(false); }}
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
              <GavetaPadraoDoEditor menu="Editar" aoNaoFazParte={fora} />
            </MenuDoEditor>
            <MenuDoEditor nome="Ver" aberto={gaveta === 'Ver'}
              aoAbrir={() => setGaveta(g => (g === 'Ver' ? null : 'Ver'))}>
              <GavetaPadraoDoEditor menu="Ver" aoNaoFazParte={fora} />
            </MenuDoEditor>
            <MenuDoEditor nome="Inserir" aberto={gaveta === 'inserir'}
              aoAbrir={() => setGaveta(g => (g === 'inserir' ? null : 'inserir'))}>
              <ItemDaGaveta icone={MessageSquarePlus} desligado={!bloco} aoClicar={() => {
                comentarNaSelecao();
                setGaveta(null);
              }}>Comentário</ItemDaGaveta>
            </MenuDoEditor>
            {(['Formatar', 'Ferramentas', 'Extensões', 'Ajuda'] as const).map(m => (
              <MenuDoEditor key={m} nome={m} aberto={gaveta === m}
                aoAbrir={() => setGaveta(g => (g === m ? null : m))}>
                <GavetaPadraoDoEditor menu={m} aoNaoFazParte={fora} />
              </MenuDoEditor>
            ))}
          </>
        )}
        direita={(
          <>
            <AcoesDoTopoDoEditor aoNaoFazParte={fora} />
            <button type="button" className="ed-ferramenta" aria-label="Quem está no documento"
              onClick={() => descobrir('viu-as-bolhas')}>
              <Users size={17} aria-hidden />
            </button>
            {/* Sem repetir ninguém: você costuma estar na lista de acesso do
                arquivo **e** ser quem o abriu, e as duas bolhas iguais dizem
                que há duas pessoas com o seu nome dentro do documento. */}
            <PresencaNoEditor quem={[...new Set<Pessoa>(['voce', ...arquivoAberto.acessos
              .filter(a => a.papel === 'editor').map(a => a.quem)])]} />
            <BotaoCompartilharNoEditor aoClicar={() => {
              setEscolhido(arquivoAberto.id); setCaixa('compartilhar'); setAberto(null);
            }} />
          </>
        )}
      />

      <BarraDoEditor direita={(
        <SeletorDeModo modo={ctx.modo}
          aoTrocar={(m: ModoDeTrabalho) => setCtx(c => ({ ...c, modo: m }))} />
      )}>
        <FerramentasPadraoDoEditor parte="antes" aoNaoFazParte={fora} controle={edicao} />
        <FerramentaDoEditor icone={MessageSquarePlus} dica="Inserir comentário"
          desligada={!bloco}
          aoClicar={comentarNaSelecao} />
        <FerramentasPadraoDoEditor parte="depois" aoNaoFazParte={fora} controle={edicao} />
        <SeparadorDaBarra />
        <FerramentaDoEditor icone={History} dica="Histórico de versões"
          ativa={historico}
          aoClicar={() => { setHistorico(h => !h); descobrir('leu-quem-escreveu'); }} />
        <SeparadorDaBarra />
        <FerramentaDoEditor icone={Check} dica="Aceitar a sugestão escolhida"
          desligada={pendentes.length === 0}
          aoClicar={() => resolverSugestao(true)} />
        <FerramentaDoEditor icone={X} dica="Rejeitar a sugestão escolhida"
          desligada={pendentes.length === 0}
          aoClicar={() => resolverSugestao(false)} />
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
          marcas
          comentado={comentados}
          edicao={edicao.folha}
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
