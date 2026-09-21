import { useState } from 'react';
import { Undo2, ShieldAlert, Flag, Check } from 'lucide-react';
import LaboratorioEmTelaCheia from './LaboratorioEmTelaCheia';
import {
  CSS_DO_COFRE, TopoDoCofre, ListaDoCofre, LinhaDoCofre, CampoDoCofre,
  MedidorDeForca, CaixaDeGerar, AcessoDaEntrada, PainelDeSeguranca, PainelSemEntrada,
} from '../labs/gerenciadorDeSenhas';
import {
  type Cofre, type ComoGerar,
  COMO_GERAR_PADRAO, gerarSenha, trocarSenha, darAcesso, tirarAcesso,
  passarParaOClube, senhasReutilizadas, cairiamJunto, forcaDaSenha, ehDasListas,
} from '../labs/cofreDeSenhas';
import {
  CSS_DA_CONTA, TopoDaConta, LateralDaConta, CartaoDaConta, TituloDaSecao,
  FaixaDaConta, EscolhaDeMetodo, CaixaDeCodigos, LinhaDeAplicativo,
  LinhaDeSessao, LinhaDeEncaminhamento, LinhaDeAjuste, CaixaDeVazamento,
  type SecaoDaConta,
} from '../labs/paginaDaConta';
import {
  type ContaOnline, type MetodoDeDuasEtapas,
  gerarCodigosDeReserva, ligarDuasEtapas, guardarCodigos, revogarAplicativo,
  ajustar, fecharTudo, trocarSenhaDaConta, encerrarOutrasSessoes,
  trocarRecuperacao, tirarEncaminhamento, vazamentosDe, portasAbertas,
  ENDERECO_DO_INTRUSO,
} from '../labs/contaOnline';
import {
  CSS_DO_CORREIO, TopoDoCorreio, LateralDoCorreio, ListaDoCorreio, LinhaDaLista,
  LeituraDaMensagem, DestinoDoLink,
} from '../labs/correio';
import {
  type AnaliseDaMensagem, type Indicio, type MensagemDoCorreio,
  INDICIOS, apontar, denunciar,
} from '../labs/golpesDoClube';
import {
  type Meta, type ContextoDoCofre, type ContextoDaConta, type ContextoDoCorreio,
  LICOES_DA_CC_ES005,
} from '../labs/metasDaCcEs005';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';
import { Inbox, Send, Archive, Trash2 } from 'lucide-react';

/*
 * CC-ES005 — as oito lições, numa tela só.
 *
 * ── Por que um componente, com três programas dentro ─────────────────────
 * As veredas anteriores abriam **um** programa nas sete lições, e por isso
 * tinham um componente: sete seriam sete Excel. Esta abre três — o cofre de
 * senhas, a página da conta e o correio —, e o que se repete entre as oito
 * lições não é a janela, é a moldura: a lista de tarefas, o Recomeçar, o
 * Concluir, o passo a passo de quem trava.
 *
 * Então o que mora aqui é o despacho e a moldura, e cada programa tem a
 * própria vista. O `switch` é exaustivo com `never` no `default`: a nona lição
 * não compila até alguém dizer em qual dos três ela acontece — a decisão do
 * `Record` de `PASTAS_DA_CC_ES004`, com um grau a mais.
 *
 * ── O que é do programa mora fora daqui ──────────────────────────────────
 * As janelas estão em `gerenciadorDeSenhas.tsx`, `paginaDaConta.tsx` e
 * `correio.tsx`; as contas, em `cofreDeSenhas.ts`, `contaOnline.ts` e
 * `golpesDoClube.ts`. Aqui fica o que é do **exercício**: que diálogo cada
 * comando abre, o que ele faz com o estado, e o que se cobra.
 *
 * ── E o aviso de tela pequena é por programa imitado ─────────────────────
 * A lição do correio diz `programa="correio"`, que é o mesmo que o
 * laboratório da AP044 usa: quem já dispensou o aviso lá não é avisado de
 * novo aqui. As outras duas são programas que a plataforma não tinha, e têm
 * chave própria.
 */

/* ── A moldura, que é o que as oito lições dividem ────────────────────────── */

function Moldura<C>({
  vereda, licao, metas, contexto, recomecar, programa, rodape, aoVencer, aoSair, children,
}: {
  vereda: Vereda;
  licao: { titulo: string; verificacoes: string[] };
  metas: Meta<C>[];
  contexto: C;
  recomecar: () => void;
  programa: string;
  rodape?: number;
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
      rodape={rodape}
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
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
};

/* ────────────────────────────────────────────────────────────────────────────
   O cofre de senhas — módulos 1 e 8
   ──────────────────────────────────────────────────────────────────────── */

function NoCofre({ inicial, metas, ...c }: Comum & {
  inicial: () => Cofre;
  metas: Meta<ContextoDoCofre>[];
}) {
  const [partida] = useState<Cofre>(inicial);
  const [cofre, setCofre] = useState<Cofre>(partida);
  const [aberta, setAberta] = useState(partida.entradas[0]?.id ?? '');
  const [vendo, setVendo] = useState(false);
  const [como, setComo] = useState<ComoGerar>(COMO_GERAR_PADRAO);
  const [gerada, setGerada] = useState(() => gerarSenha(COMO_GERAR_PADRAO));
  const [termo, setTermo] = useState('');

  const entrada = cofre.entradas.find(e => e.id === aberta);
  const lista = cofre.entradas.filter(e =>
    e.servico.toLowerCase().includes(termo.toLowerCase())
    || e.usuario.toLowerCase().includes(termo.toLowerCase()));
  const juntos = entrada ? cairiamJunto(cofre, entrada.id) : [];

  /*
    O sinal vermelho da linha diz **o que** há de errado com ela, e não só que
    há alguma coisa. Um sinal mudo faria a pessoa abrir as seis contas
    procurando; o relatório do cofre existe pelo mesmo motivo.
  */
  const alerta = (id: string) => {
    const e = cofre.entradas.find(x => x.id === id)!;
    const outras = cairiamJunto(cofre, id).length;
    if (outras > 0) return `Esta senha está em mais ${outras} conta${outras > 1 ? 's' : ''}`;
    if (ehDasListas(e.senha)) return 'Esta senha está em listas de senhas vazadas';
    if (forcaDaSenha(e.senha) === 'frágil') return 'Senha frágil';
    return undefined;
  };

  const problemas = [
    ...senhasReutilizadas(cofre).map(g => ({
      id: `reuso-${g[0].id}`,
      titulo: `A mesma senha em ${g.length} contas`,
      detalhe: `${g.map(x => x.servico).join(', ')}. `
        + 'Se qualquer uma delas vazar, as outras caem junto — e nenhuma delas foi atacada.',
    })),
    ...cofre.entradas.filter(e => ehDasListas(e.senha)).map(e => ({
      id: `lista-${e.id}`,
      titulo: `${e.servico}: senha de lista pública`,
      detalhe: 'Ela aparece nas listas de senhas vazadas. Ninguém a adivinha — alguém a tenta.',
    })),
    ...cofre.entradas
      .filter(e => !ehDasListas(e.senha) && forcaDaSenha(e.senha) === 'frágil')
      .map(e => ({
        id: `fraca-${e.id}`,
        titulo: `${e.servico}: senha curta`,
        detalhe: 'Poucos caracteres, e um computador tenta todos em pouco tempo.',
      })),
  ];

  return (
    <Moldura
      {...c} metas={metas} contexto={{ cofre, inicial: partida }}
      programa="cofre-de-senhas"
      recomecar={() => { setCofre(partida); setAberta(partida.entradas[0]?.id ?? ''); setVendo(false); }}
    >
      <style>{CSS_DO_COFRE}</style>
      <div className="cf-janela">
        <TopoDoCofre cofre="Clube Pioneiros" termo={termo} aoBuscar={setTermo} />
        <div className="cf-corpo">
          <ListaDoCofre quantas={lista.length}>
            {lista.map(e => (
              <LinhaDoCofre
                key={e.id} entrada={e} aberta={e.id === aberta}
                alerta={alerta(e.id)}
                aoAbrir={() => { setAberta(e.id); setVendo(false); }}
              />
            ))}
          </ListaDoCofre>

          <div className="cf-painel">
            {!entrada && <PainelSemEntrada />}
            {entrada && (
              <>
                <div className="cf-cartao">
                  <h3>{entrada.servico}</h3>
                  <CampoDoCofre rotulo="Usuário" valor={entrada.usuario} />
                  <CampoDoCofre
                    rotulo="Senha" valor={entrada.senha} segredo aberto={vendo}
                    aoAbrir={() => setVendo(v => !v)}
                    aoMudar={v => setCofre(x => trocarSenha(x, entrada.id, v))}
                  />
                  <MedidorDeForca senha={entrada.senha} />
                  {juntos.length > 0 && (
                    <p className="cf-aviso">
                      <ShieldAlert size={16} aria-hidden />
                      <span>
                        Esta mesma senha abre {juntos.map(x => x.servico).join(', ')}.
                        Se uma delas vazar, as outras caem junto.
                      </span>
                    </p>
                  )}
                </div>

                <CaixaDeGerar
                  como={como} senha={gerada}
                  aoMudar={x => { setComo(x); setGerada(gerarSenha(x)); }}
                  aoSortear={() => setGerada(gerarSenha(como))}
                  /*
                    Usar a senha **sorteia a próxima**, e isso não é enfeite.

                    Sem o sorteio, guardar a senha gerada em duas contas põe a
                    **mesma** senha nas duas — o cofre da plataforma cometendo
                    exatamente o erro que a lição existe para desfazer, e sem
                    nada estourar: o medidor diria "forte" nas duas. Um
                    gerenciador de verdade sorteia outra assim que a anterior é
                    usada, pelo mesmo motivo.
                  */
                  aoUsar={() => {
                    setCofre(x => trocarSenha(x, entrada.id, gerada));
                    setGerada(gerarSenha(como));
                    setVendo(true);
                  }}
                />

                <AcessoDaEntrada
                  entrada={entrada}
                  aoPassarParaOClube={() => setCofre(x =>
                    passarParaOClube(x, entrada.id, 'inscricoes@clubepioneiros.org'))}
                  aoDarAcesso={quem => setCofre(x => darAcesso(x, entrada.id, quem))}
                  aoTirarAcesso={quem => setCofre(x => tirarAcesso(x, entrada.id, quem))}
                />
              </>
            )}
            <PainelDeSeguranca problemas={problemas} />
          </div>
        </div>
      </div>
    </Moldura>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   A página da conta — módulos 2, 3, 4, 5 e 7
   ──────────────────────────────────────────────────────────────────────── */

type DialogoDaConta =
  | { tipo: 'senha'; nova: string }
  | { tipo: 'recuperacao'; email: string };

function NaConta({ inicial, metas, ...c }: Comum & {
  inicial: () => ContaOnline;
  metas: Meta<ContextoDaConta>[];
}) {
  const [partida] = useState<ContaOnline>(inicial);
  const [conta, setConta] = useState<ContaOnline>(partida);
  const [secao, setSecao] = useState<SecaoDaConta>('seguranca');
  const [metodo, setMetodo] = useState<MetodoDeDuasEtapas>();
  const [caixa, setCaixa] = useState(false);
  const [endereco, setEndereco] = useState(partida.endereco);
  const [consultado, setConsultado] = useState<string>();
  const [consultados, setConsultados] = useState<string[]>([]);
  const [dialogo, setDialogo] = useState<DialogoDaConta | null>(null);

  const portas = portasAbertas(conta, ENDERECO_DO_INTRUSO);

  const recomecar = () => {
    setConta(partida); setSecao('seguranca'); setMetodo(undefined); setCaixa(false);
    setEndereco(partida.endereco); setConsultado(undefined); setConsultados([]);
    setDialogo(null);
  };

  return (
    <Moldura
      {...c} metas={metas} contexto={{ conta, inicial: partida, consultados }}
      programa="conta-online" recomecar={recomecar}
    >
      <style>{CSS_DA_CONTA}</style>
      <div className="ct-janela">
        <TopoDaConta conta={conta} />
        <div className="ct-corpo">
          <LateralDaConta atual={secao} aoTrocar={setSecao} />
          <div className="ct-painel">
            {/* A faixa é do serviço, e relata o que ele detectou — nunca se a
                tarefa está cumprida. É a régua de status do Word. */}
            {portas.length > 0 && (
              <FaixaDaConta titulo="Atividade incomum na sua conta">
                Alguém entrou nesta conta de um aparelho que você não costuma usar.
              </FaixaDaConta>
            )}

            {secao === 'seguranca' && (
              <>
                <TituloDaSecao
                  titulo="Segurança"
                  diz="Os ajustes que decidem quem consegue entrar nesta conta."
                />

                <CartaoDaConta
                  titulo="Senha"
                  diz={`Trocada pela última vez em ${conta.senhaTrocadaEm}.`}
                >
                  <div className="ct-acoes">
                    <button
                      type="button" className="ct-bt" data-principal="sim"
                      onClick={() => setDialogo({ tipo: 'senha', nova: gerarSenha(COMO_GERAR_PADRAO) })}
                    >
                      Trocar a senha
                    </button>
                  </div>
                </CartaoDaConta>

                <CartaoDaConta
                  titulo="Verificação em duas etapas"
                  diz="Uma segunda prova de que é você, além da senha."
                >
                  <span className="ct-estado" data-bom={conta.duasEtapas.ativa ? 'sim' : 'não'}>
                    {conta.duasEtapas.ativa ? 'ativada' : 'desativada'}
                  </span>
                  <div style={{ marginTop: 13 }}>
                    <EscolhaDeMetodo escolhido={metodo} aoEscolher={setMetodo} />
                  </div>
                  <div className="ct-acoes">
                    <button
                      type="button" className="ct-bt" data-principal="sim" disabled={!metodo}
                      onClick={() => {
                        setConta(x => ligarDuasEtapas(x, metodo!, gerarCodigosDeReserva()));
                        setCaixa(true);
                      }}
                    >
                      {conta.duasEtapas.ativa ? 'Trocar o método' : 'Ativar'}
                    </button>
                  </div>
                </CartaoDaConta>

                {caixa && (
                  <CaixaDeCodigos
                    codigos={conta.duasEtapas.codigos}
                    guardados={conta.duasEtapas.codigosGuardados}
                    aoGuardar={() => setConta(guardarCodigos)}
                    aoFechar={() => setCaixa(false)}
                  />
                )}

                <CartaoDaConta
                  titulo="Formas de recuperar a conta"
                  diz="Para onde o serviço manda o código quando alguém diz ter esquecido a senha."
                >
                  <div className="ct-item">
                    <span className="ct-item-txt">
                      <span className="ct-item-nome">E-mail de recuperação</span>
                      <p className="ct-item-diz">{conta.recuperacao.email ?? 'nenhum'}</p>
                    </span>
                    <button
                      type="button" className="ct-bt"
                      onClick={() => setDialogo({ tipo: 'recuperacao', email: '' })}
                    >
                      Alterar
                    </button>
                  </div>
                  <div className="ct-item">
                    <span className="ct-item-txt">
                      <span className="ct-item-nome">Telefone de recuperação</span>
                      <p className="ct-item-diz">{conta.recuperacao.telefone ?? 'nenhum'}</p>
                    </span>
                  </div>
                </CartaoDaConta>

                <CaixaDeVazamento
                  endereco={endereco} aoMudar={setEndereco}
                  aoConsultar={() => {
                    const e = endereco.trim();
                    if (!e) return;
                    setConsultado(e);
                    setConsultados(x => (x.includes(e) ? x : [...x, e]));
                  }}
                  achados={consultado ? vazamentosDe(consultado) : []}
                  consultado={consultado}
                />
              </>
            )}

            {secao === 'aplicativos' && (
              <>
                <TituloDaSecao
                  titulo="Aplicativos conectados"
                  diz="Programas de outras empresas que você autorizou a usar esta conta."
                />
                <CartaoDaConta titulo={`${conta.aplicativos.length} com acesso à conta`}>
                  {conta.aplicativos.length === 0 && (
                    <p className="ct-item-diz">Nenhum aplicativo tem acesso a esta conta.</p>
                  )}
                  {conta.aplicativos.map(a => (
                    <LinhaDeAplicativo
                      key={a.id} app={a}
                      aoRevogar={() => setConta(x => revogarAplicativo(x, a.id))}
                    />
                  ))}
                </CartaoDaConta>
              </>
            )}

            {secao === 'privacidade' && (
              <>
                <TituloDaSecao
                  titulo="Privacidade"
                  diz="O que outras pessoas conseguem ver desta conta e de quem está nela."
                />
                <CartaoDaConta titulo="Quem vê o quê">
                  {conta.privacidade.map(a => (
                    <LinhaDeAjuste
                      key={a.id} ajuste={a}
                      aoMudar={v => setConta(x => ajustar(x, a.id, v))}
                    />
                  ))}
                  <div className="ct-acoes">
                    {/* O botão grosso existe porque um programa tem todos os
                        comandos — e é ele que mostra que privacidade não é um
                        interruptor. */}
                    <button type="button" className="ct-bt" onClick={() => setConta(fecharTudo)}>
                      Deixar tudo privado
                    </button>
                  </div>
                </CartaoDaConta>
              </>
            )}

            {secao === 'atividade' && (
              <>
                <TituloDaSecao
                  titulo="Atividade da conta"
                  diz="Onde esta conta está aberta agora, e o que ela faz sozinha."
                />
                <CartaoDaConta titulo="Aparelhos com sessão aberta">
                  {conta.sessoes.map(s => (
                    <LinhaDeSessao
                      key={s.id} sessao={s}
                      aoEncerrar={() => setConta(x => encerrarOutrasSessoes(x, partida.senha))}
                    />
                  ))}
                </CartaoDaConta>
                <CartaoDaConta
                  titulo="Encaminhamento de mensagens"
                  diz="Regras que copiam automaticamente o que chega nesta conta para outro endereço."
                >
                  {conta.encaminhamentos.length === 0 && (
                    <p className="ct-item-diz">Nenhuma regra de encaminhamento.</p>
                  )}
                  {conta.encaminhamentos.map(r => (
                    <LinhaDeEncaminhamento
                      key={r.id} regra={r}
                      aoTirar={() => setConta(x => tirarEncaminhamento(x, r.id))}
                    />
                  ))}
                </CartaoDaConta>
              </>
            )}
          </div>
        </div>

        {dialogo?.tipo === 'senha' && (
          <div className="ct-dialogo-fundo">
            <div className="ct-dialogo">
              <h3>Trocar a senha</h3>
              <p className="ct-item-diz">
                Trocar a senha encerra as outras sessões desta conta.
              </p>
              <input
                className="ct-campo-dialogo" aria-label="Nova senha"
                value={dialogo.nova}
                onChange={e => setDialogo({ tipo: 'senha', nova: e.target.value })}
              />
              <div className="ct-acoes">
                <button
                  type="button" className="ct-bt" data-principal="sim"
                  disabled={dialogo.nova.trim().length < 6 || dialogo.nova === conta.senha}
                  onClick={() => {
                    setConta(x => trocarSenhaDaConta(x, dialogo.nova, '2026-09'));
                    setDialogo(null);
                  }}
                >
                  <Check size={15} aria-hidden /> Salvar
                </button>
                <button type="button" className="ct-bt" onClick={() => setDialogo(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {dialogo?.tipo === 'recuperacao' && (
          <div className="ct-dialogo-fundo">
            <div className="ct-dialogo">
              <h3>E-mail de recuperação</h3>
              <p className="ct-item-diz">
                É para este endereço que o código de recuperação será enviado.
              </p>
              <input
                className="ct-campo-dialogo" aria-label="Novo e-mail de recuperação"
                placeholder="diretoria@clubepioneiros.org"
                value={dialogo.email}
                onChange={e => setDialogo({ tipo: 'recuperacao', email: e.target.value })}
              />
              <div className="ct-acoes">
                <button
                  type="button" className="ct-bt" data-principal="sim"
                  disabled={!dialogo.email.includes('@')}
                  onClick={() => {
                    setConta(x => trocarRecuperacao(x, { email: dialogo.email.trim() }));
                    setDialogo(null);
                  }}
                >
                  <Check size={15} aria-hidden /> Salvar
                </button>
                <button type="button" className="ct-bt" onClick={() => setDialogo(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Moldura>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   O correio — módulo 6
   ──────────────────────────────────────────────────────────────────────── */

const PASTAS_DO_CORREIO = [
  { id: 'entrada', nome: 'Caixa de entrada', icone: Inbox },
  { id: 'enviados', nome: 'Enviados', icone: Send },
  { id: 'arquivados', nome: 'Arquivados', icone: Archive },
  { id: 'lixeira', nome: 'Lixeira', icone: Trash2 },
];

const TODOS_OS_INDICIOS = Object.keys(INDICIOS) as Indicio[];

function NoCorreio({ caixa: montarCaixa, metas, ...c }: Comum & {
  caixa: () => MensagemDoCorreio[];
  metas: Meta<ContextoDoCorreio>[];
}) {
  const [caixa] = useState<MensagemDoCorreio[]>(montarCaixa);
  const [analises, setAnalises] = useState<AnaliseDaMensagem[]>([]);
  const [aberta, setAberta] = useState<string | null>(null);
  const [destino, setDestino] = useState<string>();
  const [pasta, setPasta] = useState('entrada');

  const msg = caixa.find(m => m.id === aberta);
  const analise = analises.find(a => a.id === aberta);
  const pastas = PASTAS_DO_CORREIO.map(p =>
    (p.id === 'entrada' ? { ...p, quantas: caixa.length } : p));

  return (
    <Moldura
      {...c} metas={metas} contexto={{ caixa, analises }}
      programa="correio"
      recomecar={() => { setAnalises([]); setAberta(null); setDestino(undefined); }}
    >
      <style>{CSS_DO_CORREIO}</style>
      <div className="co-janela">
        <TopoDoCorreio />
        <div className="co-corpo" style={{ position: 'relative' }}>
          <LateralDoCorreio pastas={pastas} atual={pasta} aoTrocar={setPasta} />

          {!msg && (
            <ListaDoCorreio vazia={pasta === 'entrada' ? undefined : 'Nada nesta pasta.'}>
              {pasta === 'entrada' && caixa.map(m => (
                <LinhaDaLista
                  key={m.id} de={m.deNome} assunto={m.assunto}
                  direita={<span style={{ fontSize: 11.5, color: '#5F6368' }}>{m.quando}</span>}
                  aoAbrir={() => { setAberta(m.id); setDestino(undefined); }}
                />
              ))}
            </ListaDoCorreio>
          )}

          {msg && (
            <LeituraDaMensagem
              assunto={msg.assunto} deNome={msg.deNome} de={msg.de} corpo={msg.corpo}
              links={msg.links} anexos={msg.anexos}
              aoApontarLink={setDestino}
              rodape={(
                /*
                  O painel de análise mora **dentro da mensagem**, e não num
                  formulário da plataforma logo abaixo. É a mesma decisão do
                  polegar do laboratório de IA e do painel de Problemas do de
                  Python: a leitura crítica acontece onde a mensagem está.
                */
                <div className="co-analise">
                  <h3>O que você encontrou nesta mensagem?</h3>
                  <p>
                    Marque só o que ela de fato tem. Mensagem verdadeira também
                    chega aqui — e marcar indício numa delas é errar do jeito que
                    mais custa.
                  </p>
                  <div className="co-indicios">
                    {TODOS_OS_INDICIOS.map(i => {
                      const marcado = analise?.apontados.includes(i) ?? false;
                      return (
                        <button
                          type="button" key={i} className="co-indicio"
                          aria-pressed={marcado}
                          onClick={() => setAnalises(a => apontar(a, msg.id, i))}
                        >
                          <span className="co-indicio-nome">
                            {marcado && <Check size={13} aria-hidden />} {INDICIOS[i].nome}
                          </span>
                          <span className="co-indicio-diz">{INDICIOS[i].explica}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/*
                    São **dois** botões, e não um que alterna.

                    A trava que clica achou isto: sem um gesto para "li e é
                    verdadeira", a mensagem honesta ficava sem análise nenhuma,
                    e não ter opinião era indistinguível de nunca ter aberto a
                    mensagem. Quem passasse direto pelas duas verdadeiras
                    teria feito exatamente o que a lição pede e não.

                    Com dois botões, toda mensagem pede um veredito — que é o
                    que se faz na caixa de entrada de verdade, todo dia, cinco
                    vezes por hora.
                  */}
                  <div className="co-analise-acoes">
                    <button
                      type="button" className="co-denunciar"
                      aria-pressed={analise?.denunciada === true}
                      onClick={() => setAnalises(a => denunciar(a, msg.id, true))}
                    >
                      <Flag size={14} aria-hidden />
                      {analise?.denunciada === true ? 'Marcada como golpe' : 'É golpe'}
                    </button>
                    <button
                      type="button" className="co-confiar"
                      aria-pressed={analise?.denunciada === false}
                      onClick={() => setAnalises(a => denunciar(a, msg.id, false))}
                    >
                      <Check size={14} aria-hidden />
                      {analise?.denunciada === false ? 'Marcada como verdadeira' : 'É verdadeira'}
                    </button>
                    <button
                      type="button" className="co-voltar-lista"
                      onClick={() => { setAberta(null); setDestino(undefined); }}
                    >
                      Voltar à caixa de entrada
                    </button>
                  </div>
                </div>
              )}
            />
          )}

          <DestinoDoLink para={destino} />
        </div>
      </div>
      <style>{CSS_DA_ANALISE}</style>
    </Moldura>
  );
}

/* O painel de análise é do exercício, e por isso a folha dele mora aqui — e
   não em `correio.tsx`, que é do programa. */
const CSS_DA_ANALISE = `
.co-analise {
  margin-top: 20px; padding-top: 16px; border-top: 1px solid #E0E0E0;
}
.co-analise h3 { font-size: 14px; font-weight: 600; color: #202124; margin: 0 0 4px; }
.co-analise > p { font-size: 12.5px; color: #5F6368; margin: 0 0 12px; max-width: 62ch; }
.co-indicios {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 8px;
}
.co-indicio {
  display: flex; flex-direction: column; gap: 3px; text-align: left;
  padding: 9px 11px; border: 1px solid #DADCE0; border-radius: 8px;
  background: #FFFFFF; color: #202124; cursor: pointer;
}
.co-indicio:hover { background: #F8F9FA; }
.co-indicio[aria-pressed="true"] { border-color: #1A73E8; background: #E8F0FE; }
.co-indicio:focus-visible { outline: 2px solid #1A73E8; outline-offset: 1px; }
.co-indicio-nome {
  font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 5px;
}
.co-indicio-diz { font-size: 11.5px; color: #5F6368; line-height: 1.45; }

.co-analise-acoes { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 14px; }
.co-denunciar, .co-confiar, .co-voltar-lista {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 500;
  border: 1px solid #DADCE0; background: #FFFFFF; color: #202124; cursor: pointer;
}
.co-denunciar:hover, .co-confiar:hover, .co-voltar-lista:hover { background: #F8F9FA; }
.co-denunciar:focus-visible, .co-confiar:focus-visible, .co-voltar-lista:focus-visible {
  outline: 2px solid #1A73E8; outline-offset: 1px;
}
/* Forma e cor: o veredito escolhido muda de **fundo e de palavra**, e não só
   de cor. É a razão de a insígnia ter forma e cor. */
.co-denunciar[aria-pressed="true"] {
  background: #FCE8E6; border-color: #F0B4AE; color: #8C1D18;
}
.co-confiar[aria-pressed="true"] {
  background: #E6F4EA; border-color: #A8D5B5; color: #0D652D;
}
`;

/* ── O despacho ───────────────────────────────────────────────────────────── */

export default function LaboratorioDeContas({ vereda, licao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'contas' }>;
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const l = LICOES_DA_CC_ES005[licao.licao];
  const comum = { vereda, licao, aoVencer, aoSair };

  switch (l.programa) {
    case 'cofre':
      return <NoCofre {...comum} inicial={l.inicial} metas={l.metas} />;
    case 'conta':
      return <NaConta {...comum} inicial={l.inicial} metas={l.metas} />;
    case 'correio':
      return <NoCorreio {...comum} caixa={l.caixa} metas={l.metas} />;
    default: {
      /* `never` no default: a nona lição não compila até dizer em qual dos
         três programas ela acontece. */
      const nunca: never = l;
      throw new Error(`lição sem programa: ${JSON.stringify(nunca)}`);
    }
  }
}
