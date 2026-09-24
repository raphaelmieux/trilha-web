import { useState } from 'react';
import type React from 'react';
import {
  Archive, Inbox, Mic, Send, Trash2, Undo2, Users, Video,
} from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  AbasDasConfiguracoes, AvisoDoCorreio, BotaoDoCorreio, CaixaDeConfiguracoes,
  CampoDeDestinatarios, CampoDeEndereco, CSS_DO_CORREIO, JanelinhaDeEscrever,
  LateralDoCorreio, LeituraDaMensagem, LinhaDaLista, ListaDoCorreio, PeDeEscrever,
  TopoDoCorreio, VinculoDaMensagem,
} from '../labs/correio';
import {
  type Caixa, type Lista, type Rascunho,
  AGUIA, CONSELHEIROS_DO_CLUBE, DIRECAO, DOMINIO, FALCAO, FAMILIAS, HOJE, LIMITE_DE_ANEXO,
  arquivar, buscar, cabeNoAnexo, criarLista, enviar, mudarMembros, naPasta, nomeDe,
  paraAEntrada, paraALixeira, rascunhoVazio,
} from '../labs/correspondencia';
import {
  AcessoAoCalendario, AvisoDoCalendario, BotaoDoCalendario, CaixaDeEvento,
  ChipDeEvento, CSS_DO_CALENDARIO, DialogoDoCalendario, GradeDeDisponibilidade,
  GradeDoMes, LateralDoCalendario, LinhaDaCaixa, OpcaoDoDialogo, SeletorDeFuso,
  TopoDoCalendario,
} from '../labs/calendario';
import {
  type Evento, type NivelNoCalendario, type Recorrencia,
  CALENDARIO_DO_CLUBE, CONVIDADOS_DA_REUNIAO, DIA_DA_REUNIAO, FUSO_DE_BRASILIA,
  FUSO_DO_ACRE, GRADE, MARCIO_SO_DEPOIS_DE, MINHA_AGENDA, NIVEIS, NOMES_DOS_MESES,
  NOME_DO_NIVEL, OQUE_O_NIVEL_NAO_DEIXA, PASSO_DA_GRADE,
  apagarEvento, cancelarOcorrencia, compartilharCalendario, criarEvento, diasDoMes,
  estadoEm, horaPara, mudarEvento, ocorrencias, publicarCalendario, semAgendaCompartilhada,
  tirarDoCalendario, trocarConvidado,
} from '../labs/agenda';
import {
  type AbaDeApresentar, type LadrilhoDaSala,
  BarraDaSala, BotaoDaSala, CaixaDeApresentar, CSS_DA_SALA, FaixaDaSala, PalcoDaSala,
  PedidoDeEntrar,
} from '../labs/salaDeReuniao';
import {
  type OQueCompartilhar, type Reuniao,
  CONVERSA, LINK_DA_REUNIAO, NOME_DO_COMPARTILHAMENTO, OQUE_A_ESCOLHA_LEVA_JUNTO,
  PLANILHA, VIDEO,
  abrirCamera, abrirMicrofone, admitir, compartilhar, entrar, falar, focar, naEspera,
  naSala, notificacoesQueVazaram, oQueASalaVe, pararDeCompartilhar,
} from '../labs/reuniaoRemota';
import {
  type ContextoDaComunicacao, type Meta,
  ACHOU_NA_BUSCA, CONSELHO_DE_JULHO, FOTOS, LICOES_DA_CC_ES007, OLHOU_A_GRADE,
  PERGUNTOU_A_QUEM_NAO_COMPARTILHA, VIU_O_ANEXO_VOLTAR, VIU_O_MICROFONE_FECHADO,
  VIU_O_VAZAMENTO, VIU_QUE_AGUARDANDO_NAO_E_SIM,
} from '../labs/metasDaCcEs007';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
 * CC-ES007 — as doze lições, numa tela só.
 *
 * ── Por que um componente, com três programas dentro ─────────────────────
 * É o arranjo do `LaboratorioDeContas` da CC-ES005, pelo motivo escrito lá: o
 * que se repete entre as lições não é a janela, é a **moldura** — a lista de
 * tarefas, o Recomeçar, o Concluir, o passo a passo de quem trava. O `switch`
 * é exaustivo com `never` no `default`: a décima terceira lição não compila
 * até alguém dizer em qual dos três programas ela acontece.
 *
 * ── O contexto é um só, e é de propósito ─────────────────────────────────
 * A CC-ES005 tinha um contexto por programa. Aqui a caixa, a agenda e a sala
 * viajam juntas, porque o clube é um só e as lições se atravessam: a reunião
 * se agenda no calendário, e quem não respondeu ao convite se cobra por
 * mensagem. Três contextos separados obrigariam cada lição a escolher um
 * programa e ficar nele, que não é como um clube trabalha.
 *
 * ── E os gestos que atravessam moram onde o programa de verdade os põe ───
 * O calendário manda mensagem aos convidados, porque todo calendário tem esse
 * envelope ao lado da lista de convidados. A sala agenda no calendário, porque
 * é o que o botão "Agendar" de toda sala faz. Nenhum dos dois é a plataforma
 * costurando dois programas: é o que cada um deles já faz sozinho.
 */

/* ── A moldura ────────────────────────────────────────────────────────────── */

function Moldura({
  vereda, licao, metas, contexto, recomecar, programa, aoVencer, aoSair, children,
}: {
  vereda: Vereda;
  licao: { titulo: string; verificacoes: string[] };
  metas: Meta[];
  contexto: ContextoDaComunicacao;
  recomecar: () => void;
  programa: string;
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
      programa={programa}
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

type Comum = {
  vereda: Vereda;
  licao: { titulo: string; verificacoes: string[] };
  metas: Meta[];
  contexto: ContextoDaComunicacao;
  mudar: (f: (c: ContextoDaComunicacao) => ContextoDaComunicacao) => void;
  recomecar: () => void;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
};

const anotar = (c: ContextoDaComunicacao, o: string): ContextoDaComunicacao =>
  (c.descobertas.includes(o) ? c : { ...c, descobertas: [...c.descobertas, o] });

/* ────────────────────────────────────────────────────────────────────────────
   O correio — módulos 1 a 6 e 12
   ──────────────────────────────────────────────────────────────────────── */

const PASTAS = [
  { id: 'entrada', nome: 'Caixa de entrada', icone: Inbox },
  { id: 'arquivadas', nome: 'Arquivadas', icone: Archive },
  { id: 'enviadas', nome: 'Enviados', icone: Send },
  { id: 'lixeira', nome: 'Lixeira', icone: Trash2 },
] as const;

const ABAS_DAS_CONFIGURACOES = [
  { id: 'geral', nome: 'Geral' },
  { id: 'listas', nome: 'Listas' },
  { id: 'ausencia', nome: 'Resposta automática' },
];

const GRUPOS = [
  { nome: 'as 52 famílias', enderecos: FAMILIAS.map(f => f.endereco) },
  { nome: 'a direção', enderecos: DIRECAO.map(d => d.endereco) },
  { nome: 'os conselheiros', enderecos: CONSELHEIROS_DO_CLUBE.map(c => c.endereco) },
];

function NoCorreio({ contexto, mudar, rascunhoInicial, ...c }: Comum & {
  rascunhoInicial?: Rascunho;
}) {
  const [pasta, setPasta] = useState<string>('entrada');
  const [aberta, setAberta] = useState<string>('');
  const [termo, setTermo] = useState('');
  const [config, setConfig] = useState<string>('');
  const [rascunho, setRascunho] = useState<Rascunho | undefined>(rascunhoInicial);
  const [comCopia, setComCopia] = useState(false);
  const [recusa, setRecusa] = useState('');
  const [novaLista, setNovaLista] = useState('');

  const caixa = contexto.caixa;
  const mensagem = caixa.mensagens.find(m => m.id === aberta);
  const lista = termo.trim() ? buscar(caixa, termo) : naPasta(caixa, pasta as never);

  const mexer = (f: (x: Caixa) => Caixa) => mudar(ctx => ({ ...ctx, caixa: f(ctx.caixa) }));

  const abrir = (id: string) => {
    setAberta(id);
    mexer(x => ({ ...x, mensagens: x.mensagens.map(m => (m.id === id ? { ...m, lida: true } : m)) }));
    /* O vazamento do requisito 3 não é uma hipótese: é a mensagem de terça, e
       vê-lo é abrir a mensagem e contar a linha do Cc. */
    if (id === 'regional') mudar(ctx => anotar(ctx, VIU_O_VAZAMENTO));
  };

  const buscarNa = (t: string) => {
    setTermo(t);
    /* Achar na busca o que foi arquivado é a diferença entre arquivar e
       excluir — e é o gesto, e não a existência da caixa, que a mede. */
    if (t.trim() && buscar(caixa, t).some(m => m.pasta === 'arquivadas')) {
      mudar(ctx => anotar(ctx, ACHOU_NA_BUSCA));
    }
  };

  const mandar = () => {
    if (!rascunho) return;
    if (!cabeNoAnexo(rascunho)) {
      /*
        O provedor recusa antes de enviar, que é o que um provedor faz. E é
        assim que o requisito 4.2 vira descoberta: tentar é o único jeito de
        saber por que o anexo não serve.
      */
      setRecusa(`O anexo tem ${rascunho.anexos.reduce((s, a) => s + a.mb, 0)} MB `
        + `e o limite é ${LIMITE_DE_ANEXO} MB. A mensagem não foi enviada.`);
      mudar(ctx => anotar(ctx, VIU_O_ANEXO_VOLTAR));
      return;
    }
    mexer(x => enviar(x, rascunho, HOJE));
    setRascunho(undefined);
    setRecusa('');
    setPasta('enviadas');
  };

  const campo = (k: 'para' | 'cc' | 'cco', rotulo: string) => (
    <CampoDeDestinatarios
      key={k} rotulo={rotulo} enderecos={rascunho?.[k] ?? []}
      aoTirar={e => setRascunho(r => (r ? { ...r, [k]: r[k].filter(x => x !== e) } : r))}
      aoAcrescentar={e => setRascunho(r => (r ? { ...r, [k]: [...r[k], e] } : r))}
      extra={(
        <span className="co-fila-grupos">
          {GRUPOS.map(g => (
            <button key={g.nome} type="button" className="co-copias"
              aria-label={`No ${rotulo}, trazer ${g.nome}`}
              onClick={() => setRascunho(r => (r
                ? { ...r, [k]: [...new Set([...r[k], ...g.enderecos])] } : r))}>
              + {g.nome}
            </button>
          ))}
        </span>
      )}
    />
  );

  return (
    <Moldura
      {...c} contexto={contexto} programa="correio"
      recomecar={() => { c.recomecar(); setRascunho(rascunhoInicial); setPasta('entrada'); setAberta(''); setTermo(''); setConfig(''); setRecusa(''); }}
    >
      <style>{CSS_DO_CORREIO}</style>
      <style>{CSS_DO_LABORATORIO}</style>
      <div className="co-janela">
        <TopoDoCorreio busca={termo} aoBuscar={buscarNa}
          aoAbrirConfiguracoes={() => { setConfig('geral'); setAberta(''); }} />
        {config
          ? (
            <CaixaDeConfiguracoes titulo="Configurações" aoVoltar={() => setConfig('')}>
              <AbasDasConfiguracoes abas={ABAS_DAS_CONFIGURACOES} atual={config}
                aoTrocar={setConfig} />
              {config === 'geral' && (
                <label className="co-bloco">
                  <span>Assinatura — o que entra sozinho no fim de toda mensagem</span>
                  <textarea className="co-campo co-area" value={caixa.assinatura}
                    aria-label="Assinatura"
                    placeholder="Nome e função no clube"
                    onChange={e => mexer(x => ({ ...x, assinatura: e.target.value }))} />
                </label>
              )}
              {config === 'listas' && (
                <div className="co-bloco">
                  {caixa.listas.map(l => (
                    <div key={l.id} className="co-bloco-lista">
                      <strong>{l.nome}</strong>
                      <span className="co-dica">{l.endereco}</span>
                      {[...FALCAO, ...AGUIA].map(p => (
                        <label key={p.id} className="co-membro">
                          <input type="checkbox" checked={l.membros.includes(p.id)}
                            aria-label={`${p.nome} na ${l.nome}`}
                            onChange={e => mexer(x => mudarMembros(x, l.id, e.target.checked
                              ? [...l.membros, p.id]
                              : l.membros.filter(m => m !== p.id)))} />
                          {p.nome}
                        </label>
                      ))}
                    </div>
                  ))}
                  <div className="co-bloco-lista">
                    <input className="co-campo" value={novaLista} aria-label="Nome da lista nova"
                      placeholder="Nome da lista nova"
                      onChange={e => setNovaLista(e.target.value)} />
                    <BotaoDoCorreio primario disabled={!novaLista.trim()}
                      onClick={() => {
                        const nova: Lista = {
                          id: novaLista.trim().toLowerCase().replace(/\s+/g, '-'),
                          nome: novaLista.trim(),
                          endereco: `${novaLista.trim().toLowerCase().replace(/\s+/g, '.')}@${DOMINIO}`,
                          membros: [],
                        };
                        mexer(x => criarLista(x, nova));
                        setNovaLista('');
                      }}>
                      Criar lista
                    </BotaoDoCorreio>
                  </div>
                </div>
              )}
              {config === 'ausencia' && (
                <div className="co-bloco">
                  <label className="co-membro">
                    <input type="checkbox" checked={caixa.ausencia.ligada}
                      aria-label="Ligar a resposta automática"
                      onChange={e => mexer(x => ({
                        ...x, ausencia: { ...x.ausencia, ligada: e.target.checked } }))} />
                    Responder automaticamente enquanto eu estiver fora
                  </label>
                  <label className="co-bloco">
                    <span>Primeiro dia</span>
                    <input className="co-campo" type="date" value={caixa.ausencia.de}
                      aria-label="Primeiro dia"
                      onChange={e => mexer(x => ({
                        ...x, ausencia: { ...x.ausencia, de: e.target.value } }))} />
                  </label>
                  <label className="co-bloco">
                    <span>Último dia</span>
                    <input className="co-campo" type="date" value={caixa.ausencia.ate}
                      aria-label="Último dia"
                      onChange={e => mexer(x => ({
                        ...x, ausencia: { ...x.ausencia, ate: e.target.value } }))} />
                  </label>
                  <label className="co-bloco">
                    <span>O que quem escrever vai receber</span>
                    <textarea className="co-campo co-area" value={caixa.ausencia.texto}
                      aria-label="Texto da resposta automática"
                      onChange={e => mexer(x => ({
                        ...x, ausencia: { ...x.ausencia, texto: e.target.value } }))} />
                  </label>
                  <label className="co-membro">
                    <input type="checkbox" checked={caixa.ausencia.soParaContatos}
                      aria-label="Responder só a quem está nos contatos"
                      onChange={e => mexer(x => ({
                        ...x, ausencia: { ...x.ausencia, soParaContatos: e.target.checked } }))} />
                    Responder só a quem está nos meus contatos
                  </label>
                </div>
              )}
            </CaixaDeConfiguracoes>
          )
          : (
            <div className="co-corpo">
              <LateralDoCorreio
                pastas={PASTAS.map(p => ({ ...p, quantas: naPasta(caixa, p.id).length }))}
                atual={termo.trim() ? '' : pasta}
                aoTrocar={id => { setPasta(id); setTermo(''); setAberta(''); }}
                aoEscrever={() => { setRascunho(rascunhoVazio()); setAberta(''); }}
              />
              {mensagem
                ? (
                  <LeituraDaMensagem
                    assunto={mensagem.assunto} deNome={mensagem.deNome} de={mensagem.de}
                    corpo={mensagem.corpo}
                    anexos={mensagem.anexos.map(a => `${a.nome} (${a.mb} MB)`)}
                    rodape={(
                      <div className="co-acoes" style={{ marginTop: 16 }}>
                        <BotaoDoCorreio onClick={() => setAberta('')}>Voltar</BotaoDoCorreio>
                        {mensagem.pasta === 'entrada' && (
                          <BotaoDoCorreio onClick={() => mexer(x => arquivar(x, mensagem.id))}>
                            Arquivar
                          </BotaoDoCorreio>
                        )}
                        {mensagem.pasta === 'arquivadas' && (
                          <BotaoDoCorreio onClick={() => mexer(x => paraAEntrada(x, mensagem.id))}>
                            Voltar para a entrada
                          </BotaoDoCorreio>
                        )}
                        {mensagem.pasta !== 'lixeira' && (
                          <BotaoDoCorreio onClick={() => mexer(x => paraALixeira(x, mensagem.id))}>
                            Excluir
                          </BotaoDoCorreio>
                        )}
                      </div>
                    )}
                  >
                    <p className="co-cabecalho-enderecos">
                      <strong>Para:</strong> {mensagem.para.map(e => nomeDe(caixa, e)).join(', ') || '—'}
                      {mensagem.cc.length > 0 && (
                        <>
                          <br /><strong>Cc:</strong> {mensagem.cc.join(', ')}
                        </>
                      )}
                      {mensagem.cco.length > 0 && (
                        <>
                          <br /><strong>Cco:</strong> {mensagem.cco.length} destinatário
                          {mensagem.cco.length > 1 ? 's' : ''} em cópia oculta
                        </>
                      )}
                    </p>
                  </LeituraDaMensagem>
                )
                : (
                  <ListaDoCorreio vazia={lista.length === 0 ? 'Nada aqui.' : undefined}>
                    {lista.map(m => (
                      <LinhaDaLista key={m.id} de={m.deNome} assunto={m.assunto}
                        previa={m.corpo.slice(0, 60)}
                        direita={m.quando}
                        aoAbrir={() => abrir(m.id)} />
                    ))}
                  </ListaDoCorreio>
                )}
            </div>
          )}
        {rascunho && (
          <JanelinhaDeEscrever titulo="Nova mensagem" aoDescartar={() => setRascunho(undefined)}>
            {campo('para', 'Para')}
            {comCopia
              ? (<>{campo('cc', 'Cc')}{campo('cco', 'Cco')}</>)
              : (
                <div className="co-linha-campo">
                  <button type="button" className="co-copias" onClick={() => setComCopia(true)}>
                    Cc  Cco
                  </button>
                </div>
              )}
            <CampoDeEndereco rotulo="Assunto" valor={rascunho.assunto}
              aoMudar={v => setRascunho(r => (r ? { ...r, assunto: v } : r))} />
            <textarea className="co-texto" value={rascunho.corpo} aria-label="Mensagem"
              onChange={e => setRascunho(r => (r ? { ...r, corpo: e.target.value } : r))} />
            {caixa.assinatura && <div className="co-assinatura">{caixa.assinatura}</div>}
            {rascunho.anexos.map(a => (
              <div key={a.nome} className="co-vinculo">
                <span style={{ flex: 1 }}>{a.nome} — {a.mb} MB</span>
                <BotaoDoCorreio aria-label={`Tirar o anexo ${a.nome}`}
                  onClick={() => setRascunho(r => (r ? { ...r, anexos: [] } : r))}>
                  Tirar
                </BotaoDoCorreio>
              </div>
            ))}
            {rascunho.vinculos.map(v => (
              <VinculoDaMensagem key={v.nome} nome={v.nome}
                quemAbre={v.quemAbre === 'so-voce'
                  ? 'Só você consegue abrir'
                  : 'Qualquer pessoa com o vínculo consegue abrir'}
                aoTrocarAcesso={() => setRascunho(r => (r
                  ? { ...r, vinculos: r.vinculos.map(x => ({
                    ...x,
                    quemAbre: x.quemAbre === 'so-voce' ? 'qualquer-um-com-o-link' : 'so-voce',
                  })) }
                  : r))}
                aoTirar={() => setRascunho(r => (r ? { ...r, vinculos: [] } : r))} />
            ))}
            {recusa && <AvisoDoCorreio tom="ruim">{recusa}</AvisoDoCorreio>}
            <PeDeEscrever
              aoEnviar={mandar}
              aoAnexar={() => setRascunho(r => (r ? { ...r, anexos: [{ ...FOTOS }] } : r))}
              aoInserirVinculo={() => setRascunho(r => (r
                ? { ...r, vinculos: [{ ...FOTOS, quemAbre: 'so-voce' }], anexos: [] } : r))}
            />
          </JanelinhaDeEscrever>
        )}
      </div>
    </Moldura>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   O calendário — módulos 7 a 10
   ──────────────────────────────────────────────────────────────────────── */

const FUSOS = [
  { id: FUSO_DE_BRASILIA, nome: 'Brasília (São Paulo)' },
  { id: FUSO_DO_ACRE, nome: 'Rio Branco (Acre)' },
];

const COLUNAS_DA_GRADE = (() => {
  const passo = PASSO_DA_GRADE;
  const min = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
  const hora = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const fora: { de: string; ate: string }[] = [];
  for (let t = min(GRADE.de); t + GRADE.duracao <= min(GRADE.ate); t += passo) {
    fora.push({ de: hora(t), ate: hora(t + GRADE.duracao) });
  }
  return fora;
})();

const EVENTO_NOVO = (dia: string): Evento => ({
  id: `novo-${Date.now().toString(36)}`,
  titulo: '', local: '', descricao: '',
  dia, inicio: '19:00', fim: '20:30',
  fuso: FUSO_DE_BRASILIA, calendario: CALENDARIO_DO_CLUBE, convidados: [],
});

function NoCalendario({ contexto, mudar, ...c }: Comum) {
  const [mes, setMes] = useState({ ano: 2026, mes: 6 });
  const [abertoId, setAbertoId] = useState('');
  const [rascunho, setRascunho] = useState<Evento | undefined>();
  const [ligados, setLigados] = useState<string[]>([CALENDARIO_DO_CLUBE, MINHA_AGENDA]);
  const [compartilhando, setCompartilhando] = useState('');
  const [aQuemDar, setAQuemDar] = useState('');
  const [nivelNovo, setNivelNovo] = useState<NivelNoCalendario>('ver-detalhes');
  const [excluindo, setExcluindo] = useState<{ id: string; dia: string } | undefined>();
  const [escolha, setEscolha] = useState<'este' | 'todos'>('este');
  const [vendoGrade, setVendoGrade] = useState(false);
  const [resposta, setResposta] = useState('');
  const [recado, setRecado] = useState<{ para: string[]; texto: string } | undefined>();

  const agenda = contexto.agenda;
  const aberto = rascunho ?? agenda.eventos.find(e => e.id === abertoId);
  const cal = agenda.calendarios.find(x => x.id === compartilhando);

  const mexer = (f: (a: typeof agenda) => typeof agenda) =>
    mudar(ctx => ({ ...ctx, agenda: f(ctx.agenda) }));

  const celulas = diasDoMes(mes.ano, mes.mes, HOJE);
  const daGrade = celulas[0] ? celulas[0].dia : HOJE;
  const ultimo = celulas[celulas.length - 1]?.dia ?? HOJE;

  const chipsDoDia = (dia: string) => agenda.eventos
    .filter(e => ligados.includes(e.calendario))
    .filter(e => ocorrencias(e, daGrade, ultimo).includes(dia))
    .map(e => (
      <ChipDeEvento key={`${e.id}-${dia}`} titulo={e.titulo || '(sem título)'}
        hora={horaPara(e, agenda.fuso, dia)}
        tom={e.calendario === MINHA_AGENDA ? 'claro' : undefined}
        aoAbrir={() => { setAbertoId(e.id); setRascunho(undefined); }} />
    ));

  const guardar = () => {
    if (!rascunho) return;
    mexer(a => criarEvento(a, rascunho));
    setAbertoId(rascunho.id);
    setRascunho(undefined);
  };

  const mudarAberto = (m: Partial<Evento>) => {
    if (rascunho) setRascunho({ ...rascunho, ...m });
    else if (aberto) mexer(a => mudarEvento(a, aberto.id, m));
  };

  const aguardando = aberto?.convidados.filter(x => x.resposta === 'aguardando') ?? [];

  return (
    <Moldura
      {...c} contexto={contexto} programa="calendario"
      recomecar={() => { c.recomecar(); setAbertoId(''); setRascunho(undefined); setVendoGrade(false); setResposta(''); }}
    >
      <style>{CSS_DO_CALENDARIO}</style>
      <style>{CSS_DO_LABORATORIO}</style>
      <div className="ca-janela">
        <TopoDoCalendario
          titulo={`${NOMES_DOS_MESES[mes.mes]} de ${mes.ano}`}
          aoAnterior={() => setMes(m => (m.mes === 0
            ? { ano: m.ano - 1, mes: 11 } : { ...m, mes: m.mes - 1 }))}
          aoProximo={() => setMes(m => (m.mes === 11
            ? { ano: m.ano + 1, mes: 0 } : { ...m, mes: m.mes + 1 }))}
          aoHoje={() => setMes({ ano: 2026, mes: 5 })}
        />
        <div className="ca-corpo">
          <LateralDoCalendario
            aoCriar={() => { setRascunho(EVENTO_NOVO(HOJE)); setAbertoId(''); }}
            itens={agenda.calendarios.map(x => ({
              id: x.id, nome: x.nome,
              cor: x.id === CALENDARIO_DO_CLUBE ? '#1A73E8' : '#0B8043',
              ligado: ligados.includes(x.id),
            }))}
            aoLigar={(id, on) => setLigados(l => (on ? [...l, id] : l.filter(x => x !== id)))}
            aoCompartilhar={id => { setCompartilhando(id); setAbertoId(''); setRascunho(undefined); }}
          />
          {cal
            ? (
              <CaixaDeEvento titulo={`Compartilhar ${cal.nome}`}
                aoFechar={() => setCompartilhando('')}>
                <AcessoAoCalendario
                  linhas={cal.acessos.map(a => ({
                    quem: a.quem, nome: nomeDe(contexto.caixa, a.quem), nivel: a.nivel,
                  }))}
                  niveis={NIVEIS.map(n => ({
                    id: n, nome: NOME_DO_NIVEL[n], naoDeixa: OQUE_O_NIVEL_NAO_DEIXA[n],
                  }))}
                  aoMudar={(quem, nivel) => mexer(a =>
                    compartilharCalendario(a, cal.id, quem, nivel as NivelNoCalendario))}
                  aoTirar={quem => mexer(a => tirarDoCalendario(a, cal.id, quem))}
                  rodape={(
                    <div className="ca-fila">
                      <select className="ca-campo" style={{ width: 'auto' }} value={aQuemDar}
                        aria-label="A quem dar acesso"
                        onChange={e => setAQuemDar(e.target.value)}>
                        <option value="">Escolha uma pessoa</option>
                        {[...DIRECAO, ...CONSELHEIROS_DO_CLUBE, ...FAMILIAS.slice(0, 3)]
                          .map(p => <option key={p.id} value={p.endereco}>{p.nome}</option>)}
                      </select>
                      <select className="ca-campo" style={{ width: 'auto' }} value={nivelNovo}
                        aria-label="Com que nível"
                        onChange={e => setNivelNovo(e.target.value as NivelNoCalendario)}>
                        {NIVEIS.map(n => <option key={n} value={n}>{NOME_DO_NIVEL[n]}</option>)}
                      </select>
                      <BotaoDoCalendario principal disabled={!aQuemDar}
                        onClick={() => { mexer(a => compartilharCalendario(a, cal.id, aQuemDar, nivelNovo)); setAQuemDar(''); }}>
                        Dar acesso
                      </BotaoDoCalendario>
                      <label className="ca-fila">
                        <input type="checkbox" checked={cal.publico}
                          aria-label="Tornar público na web"
                          onChange={e => mexer(a => publicarCalendario(a, cal.id, e.target.checked))} />
                        Tornar público na web
                      </label>
                      {cal.publico && (
                        <AvisoDoCalendario tom="ruim">
                          Público quer dizer que qualquer pessoa lê os horários **e a descrição
                          de cada evento**, e que os buscadores acham.
                        </AvisoDoCalendario>
                      )}
                    </div>
                  )}
                />
              </CaixaDeEvento>
            )
            : aberto
              ? (
                <CaixaDeEvento
                  titulo={rascunho ? 'Novo evento' : aberto.titulo || '(sem título)'}
                  aoFechar={() => { setAbertoId(''); setRascunho(undefined); setVendoGrade(false); }}
                  acoes={(
                    <>
                      {rascunho && (
                        <BotaoDoCalendario principal disabled={!rascunho.titulo.trim()}
                          onClick={guardar}>
                          Salvar
                        </BotaoDoCalendario>
                      )}
                      {!rascunho && (
                        <BotaoDoCalendario
                          onClick={() => setExcluindo({ id: aberto.id, dia: aberto.dia })}>
                          Excluir
                        </BotaoDoCalendario>
                      )}
                    </>
                  )}
                >
                  <LinhaDaCaixa>
                    <input className="ca-campo ca-campo-titulo" value={aberto.titulo}
                      aria-label="Título" placeholder="Acrescentar título"
                      onChange={e => mudarAberto({ titulo: e.target.value })} />
                  </LinhaDaCaixa>
                  <LinhaDaCaixa icone="dia">
                    <div className="ca-fila">
                      <input className="ca-campo" style={{ width: 'auto' }} type="date"
                        value={aberto.dia} aria-label="Dia"
                        onChange={e => mudarAberto({ dia: e.target.value })} />
                      <input className="ca-campo" style={{ width: 'auto' }} type="time"
                        value={aberto.inicio} aria-label="Começa às"
                        onChange={e => mudarAberto({ inicio: e.target.value })} />
                      <input className="ca-campo" style={{ width: 'auto' }} type="time"
                        value={aberto.fim} aria-label="Termina às"
                        onChange={e => mudarAberto({ fim: e.target.value })} />
                    </div>
                  </LinhaDaCaixa>
                  <LinhaDaCaixa icone="fuso">
                    <SeletorDeFuso valor={aberto.fuso} opcoes={FUSOS}
                      aoMudar={v => mudarAberto({ fuso: v })} />
                    <p className="ca-dica">
                      Quem está em {FUSOS.find(f => f.id !== aberto.fuso)?.nome} lê{' '}
                      {horaPara(aberto, FUSOS.find(f => f.id !== aberto.fuso)?.id ?? aberto.fuso)}
                      {' '}na agenda dele.
                    </p>
                  </LinhaDaCaixa>
                  <LinhaDaCaixa icone="local">
                    <input className="ca-campo" value={aberto.local} aria-label="Local"
                      placeholder="Acrescentar local" onChange={e => mudarAberto({ local: e.target.value })} />
                  </LinhaDaCaixa>
                  <LinhaDaCaixa icone="descricao">
                    <textarea className="ca-campo ca-area" value={aberto.descricao}
                      aria-label="Descrição" placeholder="Acrescentar descrição"
                      onChange={e => mudarAberto({ descricao: e.target.value })} />
                  </LinhaDaCaixa>
                  <LinhaDaCaixa icone="repete">
                    <div className="ca-fila">
                      <label className="ca-fila">
                        <input type="checkbox" checked={!!aberto.repete}
                          aria-label="Repetir toda semana"
                          onChange={e => mudarAberto({
                            repete: e.target.checked
                              ? { cada: 'semana', ate: '', pulados: [] } as Recorrencia
                              : undefined,
                          })} />
                        Repetir toda semana
                      </label>
                      {aberto.repete && (
                        <label className="ca-fila">
                          até
                          <input className="ca-campo" style={{ width: 'auto' }} type="date"
                            value={aberto.repete.ate} aria-label="Repetir até"
                            onChange={e => mudarAberto({
                              repete: { ...aberto.repete as Recorrencia, ate: e.target.value },
                            })} />
                        </label>
                      )}
                      {aberto.repete && !aberto.repete.ate && (
                        <AvisoDoCalendario>
                          Sem data de fim, esta reunião se repete para sempre.
                        </AvisoDoCalendario>
                      )}
                    </div>
                  </LinhaDaCaixa>
                  <LinhaDaCaixa icone="convidados">
                    {aberto.convidados.length === 0 && (
                      <p className="ca-dica">Ninguém convidado ainda.</p>
                    )}
                    {aberto.convidados.map(g => (
                      <div key={g.endereco} className="ca-fila">
                        <span style={{ flex: 1, minWidth: 0 }}>{g.endereco}</span>
                        <span className="ca-dica">{g.resposta}</span>
                        <BotaoDoCalendario aria-label={`Corrigir o endereço de ${g.endereco}`}
                          onClick={() => mexer(a => trocarConvidado(a, aberto.id, g.endereco,
                            `falcao@${DOMINIO}`))}>
                          Corrigir
                        </BotaoDoCalendario>
                      </div>
                    ))}
                    <div className="ca-fila">
                      <BotaoDoCalendario onClick={() => {
                        mudar(ctx => anotar(ctx, VIU_QUE_AGUARDANDO_NAO_E_SIM));
                      }}>
                        Ver as respostas uma a uma
                      </BotaoDoCalendario>
                      {aguardando.length > 0 && (
                        <BotaoDoCalendario aria-label="Escrever a quem não respondeu"
                          onClick={() => setRecado({
                            para: aguardando.map(x => x.endereco),
                            texto: 'Você consegue vir à reunião?',
                          })}>
                          Escrever a quem não respondeu
                        </BotaoDoCalendario>
                      )}
                    </div>
                  </LinhaDaCaixa>
                  <LinhaDaCaixa icone="reuniao">
                    <div className="ca-fila">
                      <span style={{ flex: 1, minWidth: 0 }}>
                        {aberto.linkDaReuniao ?? 'Sem sala a distância.'}
                      </span>
                      <BotaoDoCalendario
                        onClick={() => mudarAberto({ linkDaReuniao: LINK_DA_REUNIAO })}>
                        Adicionar reunião a distância
                      </BotaoDoCalendario>
                    </div>
                  </LinhaDaCaixa>
                  <LinhaDaCaixa icone="hora">
                    <BotaoDoCalendario onClick={() => {
                      setVendoGrade(true);
                      mudar(ctx => anotar(ctx, OLHOU_A_GRADE));
                    }}>
                      Ver a disponibilidade dos convidados
                    </BotaoDoCalendario>
                    {vendoGrade && (
                      <>
                        <GradeDeDisponibilidade
                          colunas={COLUNAS_DA_GRADE}
                          pessoas={CONVIDADOS_DA_REUNIAO.map(p => ({
                            id: p.endereco, nome: p.nome,
                            nota: p.compartilha ? undefined : 'não compartilha a agenda',
                          }))}
                          estadoDe={(id, col) => {
                            const p = CONVIDADOS_DA_REUNIAO.find(x => x.endereco === id);
                            return p ? estadoEm(p, DIA_DA_REUNIAO, col.de, col.ate) : 'sem-acesso';
                          }}
                          escolhida={{ de: aberto.inicio, ate: aberto.fim }}
                          aoEscolher={col => mudarAberto({
                            dia: DIA_DA_REUNIAO, inicio: col.de, fim: col.ate,
                          })}
                        />
                        {semAgendaCompartilhada(CONVIDADOS_DA_REUNIAO).map(p => (
                          <BotaoDoCalendario key={p.endereco}
                            aria-label={`Perguntar a ${p.nome}`}
                            onClick={() => {
                              mudar(ctx => anotar(ctx, PERGUNTOU_A_QUEM_NAO_COMPARTILHA));
                              setResposta(`${p.nome} respondeu: só consigo depois das `
                                + `${MARCIO_SO_DEPOIS_DE}.`);
                            }}>
                            Perguntar a {p.nome}
                          </BotaoDoCalendario>
                        ))}
                        {resposta && <AvisoDoCalendario tom="bom">{resposta}</AvisoDoCalendario>}
                      </>
                    )}
                  </LinhaDaCaixa>
                </CaixaDeEvento>
              )
              : <GradeDoMes celulas={celulas} chipsDoDia={chipsDoDia}
                aoClicarNoDia={dia => { setRascunho(EVENTO_NOVO(dia)); setAbertoId(''); }} />}
        </div>
        {excluindo && (
          <DialogoDoCalendario
            titulo="Este evento se repete"
            explica="Escolha o que excluir. Nenhuma das opções pergunta de novo."
            aoFechar={() => setExcluindo(undefined)}
            acoes={(
              <BotaoDoCalendario principal onClick={() => {
                const alvo = excluindo;
                setExcluindo(undefined);
                if (escolha === 'este') {
                  mexer(a => {
                    const e = a.eventos.find(x => x.id === alvo.id);
                    return e?.repete
                      ? cancelarOcorrencia(a, alvo.id, SABADO_A_PULAR(a, alvo.id))
                      : apagarEvento(a, alvo.id);
                  });
                } else {
                  mexer(a => apagarEvento(a, alvo.id));
                }
                setAbertoId('');
              }}>
                OK
              </BotaoDoCalendario>
            )}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <OpcaoDoDialogo rotulo="Este evento" escolhida={escolha === 'este'}
                detalhe="Tira só esta ocorrência. A série continua."
                aoEscolher={() => setEscolha('este')} />
              <OpcaoDoDialogo rotulo="Todos os eventos" escolhida={escolha === 'todos'}
                detalhe="Tira a série inteira, de agora e de antes."
                aoEscolher={() => setEscolha('todos')} />
            </div>
          </DialogoDoCalendario>
        )}
        {recado && (
          <DialogoDoCalendario titulo="Escrever aos convidados"
            aoFechar={() => setRecado(undefined)}
            acoes={(
              <BotaoDoCalendario principal onClick={() => {
                mudar(ctx => ({
                  ...ctx,
                  caixa: enviar(ctx.caixa, {
                    ...rascunhoVazio(), para: recado.para,
                    assunto: 'Reunião do conselho', corpo: recado.texto,
                  }, HOJE),
                }));
                setRecado(undefined);
              }}>
                Enviar
              </BotaoDoCalendario>
            )}
          >
            <p className="ca-dica">Para: {recado.para.join(', ')}</p>
            <textarea className="ca-campo ca-area" value={recado.texto}
              aria-label="Mensagem aos convidados"
              onChange={e => setRecado(r => (r ? { ...r, texto: e.target.value } : r))} />
          </DialogoDoCalendario>
        )}
      </div>
    </Moldura>
  );
}

/**
 * Que dia da série a caixa de excluir está tirando.
 *
 * O laboratório abre a ocorrência pelo dia em que se clicou; o `Evento` guarda
 * o dia da **primeira**. Tirar `e.dia` apagaria o primeiro sábado em vez do
 * que a pessoa abriu — e a série continuaria de pé, com o sábado errado fora.
 * Aqui a lição só desmarca o sábado do acampamento, então é ele que a caixa
 * tira; uma lição que desmarcasse outro dia precisaria carregar o dia clicado.
 */
const SABADO_A_PULAR = (a: { eventos: Evento[] }, id: string): string => {
  const e = a.eventos.find(x => x.id === id);
  if (!e?.repete) return '';
  const dias = ocorrencias(e, '2026-07-01', '2026-07-31');
  return dias[0] ?? e.dia;
};

/* ────────────────────────────────────────────────────────────────────────────
   A sala de reunião — módulo 11
   ──────────────────────────────────────────────────────────────────────── */

const ABAS_DE_APRESENTAR: AbaDeApresentar[] = (['tela-inteira', 'janela', 'guia'] as const)
  .map(id => ({
    id,
    nome: NOME_DO_COMPARTILHAMENTO[id],
    leva: OQUE_A_ESCOLHA_LEVA_JUNTO[id],
    alvos: id === 'tela-inteira' ? [] : id === 'janela' ? [PLANILHA, CONVERSA] : [VIDEO],
  }));

function NaSala({ contexto, mudar, ...c }: Comum) {
  const [escolhendo, setEscolhendo] = useState(false);
  const [aba, setAba] = useState<OQueCompartilhar>('tela-inteira');
  const [alvo, setAlvo] = useState<string>('');
  const [comSom, setComSom] = useState(false);

  const sala = contexto.reuniao;
  const evento = contexto.agenda.eventos.find(e => e.id === CONSELHO_DE_JULHO);

  const mexerSala = (f: (r: Reuniao) => Reuniao) =>
    mudar(ctx => ({ ...ctx, reuniao: f(ctx.reuniao) }));

  const ladrilhos: LadrilhoDaSala[] = [
    { id: 'voce', nome: 'Você', microfone: sala.seuMicrofone, voce: true },
    ...naSala(sala).map(p => ({ id: p.endereco, nome: p.nome, microfone: p.microfone })),
  ];

  return (
    <Moldura
      {...c} contexto={contexto} programa="sala-de-reuniao"
      recomecar={() => { c.recomecar(); setEscolhendo(false); setAlvo(''); setComSom(false); }}
    >
      <style>{CSS_DA_SALA}</style>
      <style>{CSS_DO_LABORATORIO}</style>
      <div className="re-janela">
        {!sala.naSala
          ? (
            <div className="re-palco">
              <div className="re-tela" data-vazia="sim">
                <span>
                  <Video className="w-5 h-5" style={{ display: 'inline', marginRight: 8 }} />
                  Sala do conselho — {sala.link}
                </span>
              </div>
              <div className="re-ladrilhos">
                <BotaoDaSala
                  onClick={() => mudar(ctx => ({
                    ...ctx,
                    agenda: evento
                      ? mudarEvento(ctx.agenda, CONSELHO_DE_JULHO, { linkDaReuniao: sala.link })
                      : ctx.agenda,
                  }))}>
                  Agendar no calendário
                </BotaoDaSala>
                <BotaoDaSala principal onClick={() => mexerSala(entrar)}>Entrar agora</BotaoDaSala>
              </div>
              {evento?.linkDaReuniao && (
                <FaixaDaSala>
                  O vínculo já está no evento de {evento.dia}: ele viaja com o convite.
                </FaixaDaSala>
              )}
            </div>
          )
          : (
            <>
              {sala.compartilhando && (
                <FaixaDaSala tom="apresentando">
                  Você está apresentando: {NOME_DO_COMPARTILHAMENTO[sala.compartilhando.oQue]}
                </FaixaDaSala>
              )}
              {notificacoesQueVazaram(sala).map(n => (
                <FaixaDaSala key={n.de}>
                  A sala leu a notificação de {n.de}: “{n.texto}”
                </FaixaDaSala>
              ))}
              {naEspera(sala).map(p => (
                <PedidoDeEntrar key={p.endereco} quem={p.nome}
                  aoAdmitir={() => mexerSala(r => admitir(r, p.endereco))} />
              ))}
              <PalcoDaSala
                mostrando={oQueASalaVe(sala)}
                ladrilhos={ladrilhos}
                rodape={(
                  <div className="re-ladrilhos">
                    <BotaoDaSala aria-label="Falar"
                      onClick={() => {
                        mexerSala(r => falar(r, 'Bom dia a todos, vamos começar.'));
                        mudar(ctx => (ctx.reuniao.seuMicrofone
                          ? ctx : anotar(ctx, VIU_O_MICROFONE_FECHADO)));
                      }}>
                      <Mic className="w-4 h-4" /> Falar
                    </BotaoDaSala>
                    {[PLANILHA, CONVERSA].map(j => (
                      <BotaoDaSala key={j} aria-label={`Ir para ${j}`}
                        onClick={() => mexerSala(r => focar(r, j))}>
                        {j === sala.emFoco ? '● ' : ''}{j}
                      </BotaoDaSala>
                    ))}
                  </div>
                )}
              />
              {sala.falas.some(f => !f.ouviram) && (
                <FaixaDaSala>
                  Você falou {sala.falas.filter(f => !f.ouviram).length} vez
                  {sala.falas.filter(f => !f.ouviram).length > 1 ? 'es' : ''} com o
                  microfone fechado. Ninguém ouviu.
                </FaixaDaSala>
              )}
              <BarraDaSala
                microfone={sala.seuMicrofone}
                aoTrocarMicrofone={v => mexerSala(r => abrirMicrofone(r, v))}
                camera={sala.suaCamera}
                aoTrocarCamera={v => mexerSala(r => abrirCamera(r, v))}
                apresentando={!!sala.compartilhando}
                aoApresentar={() => setEscolhendo(true)}
                aoPararDeApresentar={() => mexerSala(pararDeCompartilhar)}
                quantos={naSala(sala).length + 1}
                aoVerPessoas={() => {}}
                extra={(
                  <span className="re-nota" style={{ color: '#BDC1C6' }}>
                    <Users className="w-3 h-3" style={{ display: 'inline' }} />{' '}
                    {naEspera(sala).length} esperando
                  </span>
                )}
              />
            </>
          )}
        {escolhendo && (
          <CaixaDeApresentar
            abas={ABAS_DE_APRESENTAR} aba={aba}
            aoTrocarAba={id => { setAba(id); setAlvo(''); }}
            alvo={alvo} aoEscolherAlvo={setAlvo}
            comSom={comSom} aoTrocarSom={aba === 'guia' ? setComSom : undefined}
            aoCancelar={() => setEscolhendo(false)}
            aoCompartilhar={aba === 'tela-inteira' || alvo
              ? () => {
                mexerSala(r => compartilhar(r, { oQue: aba, alvo, comSom }));
                setEscolhendo(false);
              }
              : undefined}
          />
        )}
      </div>
    </Moldura>
  );
}

/* ── O que a plataforma veste por cima das três janelas ───────────────────── */

const CSS_DO_LABORATORIO = `
.co-bloco { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.co-bloco-lista {
  display: flex; flex-direction: column; gap: 5px; padding: 10px 12px;
  border: 1px solid #DADCE0; border-radius: 8px; margin-bottom: 10px;
}
.co-membro { display: flex; align-items: center; gap: 7px; font-size: 12.5px; }
.co-dica, .ca-dica { font-size: 11.5px; color: #5F6368; }
.co-area, .ca-area { min-height: 76px; resize: vertical; font-family: inherit; }
.co-fila-grupos { display: flex; flex-wrap: wrap; gap: 2px; }
.co-cabecalho-enderecos {
  font-size: 11.5px; color: #5F6368; margin-bottom: 10px; line-height: 1.6;
  word-break: break-word;
}
`;

/* ── O despacho ───────────────────────────────────────────────────────────── */

export default function LaboratorioDeComunicacao({ vereda, licao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'comunicacao' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const l = LICOES_DA_CC_ES007[licao.licao];
  const [partida] = useState<ContextoDaComunicacao>(l.inicial);
  const [contexto, setContexto] = useState<ContextoDaComunicacao>(partida);

  const comum: Comum = {
    vereda, licao, metas: l.metas, contexto,
    mudar: f => setContexto(f),
    recomecar: () => setContexto(partida),
    aoVencer, aoSair,
  };

  switch (l.programa) {
    case 'correio':
      return <NoCorreio {...comum} rascunhoInicial={l.rascunho} />;
    case 'calendario':
      return <NoCalendario {...comum} />;
    case 'sala':
      return <NaSala {...comum} />;
    default: {
      /* `never` no default: a décima terceira lição não compila até dizer em
         qual dos três programas ela acontece. */
      const nunca: never = l.programa;
      throw new Error(`lição sem programa: ${String(nunca)}`);
    }
  }
}
