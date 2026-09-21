import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox, Send, Archive, Paperclip, Users, Trash2,
  FileCheck2, RotateCcw, AlertTriangle, Check,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_DO_CORREIO, TopoDoCorreio, LateralDoCorreio, ListaDoCorreio, LinhaDaLista,
  BarraDaMensagem, LeituraDaMensagem, JanelinhaDeEscrever, CampoDeEndereco,
  CaixaDeConfiguracoes,
} from './correio';
import {
  CORREIO_INICIAL, METAS_DO_CORREIO, FAMILIAS, DIRETOR, SECRETARIA,
  ANEXOS_DISPONIVEIS, naCaixaDeEntrada, enderecosVisiveis,
  type Correio, type Enviada, type Mensagem,
} from './correioDoClube';
import {
  upsertRequirementProgress, getRequirementId, getSpecialtyId,
  ensureEnrollment, updateEnrollmentActivity, logActivity,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * AP044 requisito 11 — os nove itens, num correio de navegador.
 *
 * ── A janela mora em `correio.tsx` ──────────────────────────────────────
 * Ela saiu daqui **antes** de a cópia existir, no dia em que a CC-ES005
 * precisou de uma segunda caixa de correio para o requisito 5. É a decisão de
 * `word.tsx`, de `excel.tsx`, de `explorer.tsx` e de `leitorDePdf.tsx`, e o
 * que ficou aqui é o que é do **exercício**: que mensagens existem, que
 * tarefas se cobram, e o que cada botão faz com elas.
 *
 * ── Por que outro laboratório de correio ─────────────────────────────────
 * A AP034 tem um, e ele ensina a **receber**: reconhecer golpe, conferir
 * remetente, desconfiar de anexo. Este ensina a **enviar** — o lado em que o
 * desbravador de doze anos faz estrago sozinho, sem nenhum golpista envolvido.
 *
 * ── Cco não é o terceiro campo ───────────────────────────────────────────
 * Sessenta endereços no Para entregam o e-mail de sessenta famílias a sessenta
 * pessoas, e não há como desfazer. A tarefa não é "usar o campo Cco": é a lista
 * grande **estar** nele. Uma mensagem com uma família no Cco e cinquenta e nove
 * no Para tem o campo preenchido e vazou tudo.
 *
 * ── E enviar errado não é bloqueado ──────────────────────────────────────
 * A prévia mostra, antes do clique, o que cada família vai ver. Depois do
 * clique, a mensagem está enviada — a tarefa continua vermelha e o jeito de
 * consertar é escrever de novo, que é o que a vida cobra, tirando a parte de
 * deixar refazer. Simulação que vira muro no primeiro desvio ensina a andar no
 * trilho.
 */

type Pasta = 'entrada' | 'enviados' | 'arquivados';
type Tela = 'lista' | 'mensagem' | 'configuracoes';

interface Rascunho {
  para: string;
  cc: string;
  cco: string;
  assunto: string;
  corpo: string;
  anexos: string[];
  mostrarCopias: boolean;
  origem: Enviada['origem'];
  historico?: string;
}

const RASCUNHO_VAZIO: Rascunho = {
  para: '', cc: '', cco: '', assunto: '', corpo: '',
  anexos: [], mostrarCopias: false, origem: 'novo',
};

/** Uma caixa de endereços é uma lista separada por vírgula, como em todo correio. */
const lista = (texto: string) =>
  texto.split(',').map(x => x.trim()).filter(x => x.includes('@'));

export default function CorreioLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [correio, setCorreio] = useState<Correio>(CORREIO_INICIAL);
  const [pasta, setPasta] = useState<Pasta>('entrada');
  const [tela, setTela] = useState<Tela>('lista');
  const [aberta, setAberta] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [conferindo, setConferindo] = useState(false);
  const [rascunhoDaAssinatura, setRascunhoDaAssinatura] = useState('');
  const [aviso, setAviso] = useState('');
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');
  const [gravando, setGravando] = useState(false);

  const tarefas = METAS_DO_CORREIO.map(m => ({
    id: m.id, titulo: m.titulo, detalhe: m.detalhe, onde: m.onde,
    passos: m.passos, feita: m.feita(correio),
  }));
  const tudoFeito = tarefas.every(t => t.feita);

  const mensagem = correio.caixa.find(m => m.id === aberta) ?? null;

  const escrever = (base?: Partial<Rascunho>) => {
    setRascunho({ ...RASCUNHO_VAZIO, ...base });
    setConferindo(false);
    setAviso(correio.assinatura
      ? 'A assinatura configurada entra sozinha no fim — você não precisa digitá-la.'
      : '');
  };

  const responder = (m: Mensagem) => {
    escrever({
      para: m.de, assunto: `Re: ${m.assunto}`, origem: 'resposta',
    });
    setAviso('Responder volta só para quem escreveu — repare que o Para já veio preenchido, e só com ele.');
  };

  const encaminhar = (m: Mensagem) => {
    escrever({
      assunto: `Enc: ${m.assunto}`, origem: 'encaminhamento',
      historico: `--- Mensagem encaminhada ---\nDe: ${m.deNome} <${m.de}>\nAssunto: ${m.assunto}\n\n${m.corpo}`,
    });
    setAviso('Encaminhar leva tudo o que está embaixo. Releia antes de escolher para quem vai.');
  };

  const arquivar = (m: Mensagem) => {
    setCorreio(c => ({ ...c, caixa: c.caixa.map(x => (x.id === m.id ? { ...x, arquivada: true } : x)) }));
    setAberta(null);
    setTela('lista');
    setAviso('Arquivada. Ela saiu da caixa de entrada e continua guardada — não foi para a lixeira, e a busca continua achando.');
  };

  const trazerFamilias = () => {
    setRascunho(r => r && ({ ...r, cco: FAMILIAS.join(', '), mostrarCopias: true }));
    setAviso(`As ${FAMILIAS.length} famílias entraram no Cco. Cada uma vai receber sem ver as outras.`);
  };

  const enviar = () => {
    const r = rascunho!;
    const enviada: Enviada = {
      para: lista(r.para), cc: lista(r.cc), cco: lista(r.cco),
      assunto: r.assunto, corpo: r.corpo, anexos: r.anexos,
      comAssinatura: correio.assinatura.trim().length > 0,
      origem: r.origem, historico: r.historico,
    };
    if (!enviada.para.length && !enviada.cc.length && !enviada.cco.length) {
      setAviso('Não há para quem enviar: preencha ao menos um destinatário.');
      return;
    }
    setCorreio(c => ({ ...c, enviadas: [...c.enviadas, enviada] }));
    setRascunho(null);
    setConferindo(false);
    const vazados = enderecosVisiveis(enviada);
    setAviso(vazados.length >= 3
      ? `Enviada — e com ${vazados.length} endereços à vista. Cada pessoa que recebeu está vendo a lista inteira, e não há como desfazer. Escreva de novo, agora com a lista no Cco.`
      : 'Enviada. Ela está em Enviados, e de lá não sai.');
  };

  const salvarAssinatura = () => {
    setCorreio(c => ({ ...c, assinatura: rascunhoDaAssinatura }));
    setTela('lista');
    setAviso(rascunhoDaAssinatura.trim().length >= 10
      ? 'Assinatura guardada. Ela vai entrar sozinha no fim da próxima mensagem que você escrever.'
      : 'Guardada — mas uma assinatura de uma palavra não diz a quem recebe quem é você.');
  };

  const recomecar = () => {
    setCorreio(CORREIO_INICIAL);
    setPasta('entrada');
    setTela('lista');
    setAberta(null);
    setRascunho(null);
    setConferindo(false);
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
        attempts: 1, correct_count: METAS_DO_CORREIO.length, total_questions: METAS_DO_CORREIO.length,
      }, specialtyCode);
      gravados++;
    }
    setGravando(false);
    if (gravados < requirementCodes.length) {
      setErro('Você fez tudo, mas o progresso não pôde ser guardado agora. Avise a liderança do clube.');
      return;
    }
    await logActivity(userId, 'correio_concluido', { specialtyCode, lessonCode, metas: METAS_DO_CORREIO.length });
    setPronto(true);
  };

  if (pronto) {
    return (
      <div className="card p-6 text-center">
        <FileCheck2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Aviso enviado!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Cada campo diz um papel, e errar o campo é dizer a coisa errada sobre
          quem está ali. Da próxima vez que precisar avisar muita gente, você já
          sabe onde os endereços dos outros não podem aparecer.
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
            {gravando ? 'Guardando…' : 'Entregar o exercício'}
          </button>
        </>
      )}
      <button onClick={recomecar} className="btn-secondary text-xs py-2 w-full justify-center inline-flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Recomeçar a caixa de entrada
      </button>
    </div>
  );

  const daPasta = pasta === 'entrada' ? naCaixaDeEntrada(correio)
    : pasta === 'arquivados' ? correio.caixa.filter(m => m.arquivada)
      : [];

  const rascunhoAtual = rascunho;
  const vazamento = rascunhoAtual
    ? [...lista(rascunhoAtual.para), ...lista(rascunhoAtual.cc)].length
    : 0;

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="correio"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
    >
      <style>{CSS_DO_CORREIO}</style>

      <div className="co-janela" style={{ position: 'relative' }}>
        <TopoDoCorreio aoAbrirConfiguracoes={() => {
          setRascunhoDaAssinatura(correio.assinatura);
          setTela('configuracoes');
        }} />

        {tela === 'configuracoes' ? (
          <CaixaDeConfiguracoes
            titulo="Assinatura"
            explica={'Este texto entra sozinho no fim de toda mensagem que você escrever. '
              + 'Nome, função no clube e um contato costumam bastar.'}
            aoVoltar={() => setTela('lista')}
          >
            <textarea className="co-campo" rows={4}
              style={{ border: '1px solid #DADCE0', borderRadius: 6 }}
              aria-label="Texto da assinatura"
              placeholder={'Ana Beatriz Rocha\nSecretária — Clube de Desbravadores Pioneiros\n(61) 99612-4410'}
              value={rascunhoDaAssinatura}
              onChange={e => setRascunhoDaAssinatura(e.target.value)} />
            <button type="button" className="co-bt primario" style={{ marginTop: 12 }}
              onClick={salvarAssinatura}>
              Salvar alterações
            </button>
          </CaixaDeConfiguracoes>
        ) : (
          <div className="co-corpo">
            <LateralDoCorreio
              atual={pasta}
              aoEscrever={() => escrever()}
              aoTrocar={id => {
                if (id === 'lixeira') {
                  setAviso('A lixeira existe no correio de verdade, e está aqui para a lateral ficar igual — mas não faz parte deste exercício. Repare que arquivar não põe nada nela.');
                  return;
                }
                setPasta(id as Pasta);
                setTela('lista');
              }}
              pastas={[
                { id: 'entrada', nome: 'Caixa de entrada', icone: Inbox, quantas: naCaixaDeEntrada(correio).length },
                { id: 'enviados', nome: 'Enviados', icone: Send, quantas: correio.enviadas.length },
                { id: 'arquivados', nome: 'Arquivados', icone: Archive, quantas: correio.caixa.filter(m => m.arquivada).length },
                /* A lixeira entra sem contagem: ela existe em todo correio, e
                   uma lateral sem ela seria outra lateral. Clicar avisa. */
                { id: 'lixeira', nome: 'Lixeira', icone: Trash2 },
              ]}
            />

            {tela === 'mensagem' && mensagem ? (
              <LeituraDaMensagem
                assunto={mensagem.assunto}
                deNome={mensagem.deNome}
                de={mensagem.de}
                corpo={mensagem.corpo}
              >
                <BarraDaMensagem acoes={{
                  aoVoltar: () => { setTela('lista'); setAberta(null); },
                  aoArquivar: () => arquivar(mensagem),
                  aoResponder: () => responder(mensagem),
                  aoEncaminhar: () => encaminhar(mensagem),
                  aoMarcarEstrela: () => setAviso('A estrela existe no correio de verdade, e não faz parte deste exercício.'),
                }} />
              </LeituraDaMensagem>
            ) : (
              <ListaDoCorreio vazia={
                pasta === 'enviados' && correio.enviadas.length === 0 ? 'Nada enviado ainda.'
                  : pasta !== 'enviados' && daPasta.length === 0
                    ? (pasta === 'arquivados' ? 'Nada arquivado ainda.' : 'A caixa de entrada está vazia.')
                    : undefined
              }>
                {pasta === 'enviados'
                  ? correio.enviadas.map((e, i) => (
                    /* Sem `aoAbrir`: enviada não se abre, e uma linha que
                       parecesse clicável prometeria um gesto que não existe. */
                    <LinhaDaLista
                      key={i}
                      de={`Para: ${e.para[0] ?? e.cc[0] ?? `${e.cco.length} em cópia oculta`}`}
                      assunto={e.assunto}
                      previa={e.corpo.slice(0, 48)}
                      direita={<>
                        {e.anexos.length > 0 && <Paperclip className="w-3 h-3 inline" />}
                        {' '}{e.cco.length > 0 ? `Cco: ${e.cco.length}` : ''}
                      </>}
                    />
                  ))
                  : daPasta.map(m => (
                    <LinhaDaLista
                      key={m.id}
                      de={m.deNome}
                      assunto={m.assunto}
                      previa={`${m.corpo.slice(0, 52)}…`}
                      aoAbrir={() => { setAberta(m.id); setTela('mensagem'); }}
                    />
                  ))}
              </ListaDoCorreio>
            )}
          </div>
        )}

        {/* A janelinha de escrever, no canto — como no correio de verdade. */}
        {rascunhoAtual && (
          <JanelinhaDeEscrever aoDescartar={() => { setRascunho(null); setConferindo(false); }}>
            <CampoDeEndereco rotulo="Para" valor={rascunhoAtual.para}
              aoMudar={v => setRascunho(r => r && ({ ...r, para: v }))}
              extra={!rascunhoAtual.mostrarCopias && (
                <button type="button" className="co-copias" aria-label="Mostrar Cc e Cco"
                  onClick={() => setRascunho(r => r && ({ ...r, mostrarCopias: true }))}>
                  Cc Cco
                </button>
              )} />

            {rascunhoAtual.mostrarCopias && (
              <>
                <CampoDeEndereco rotulo="Cc" valor={rascunhoAtual.cc}
                  aoMudar={v => setRascunho(r => r && ({ ...r, cc: v }))} />
                <CampoDeEndereco rotulo="Cco" valor={rascunhoAtual.cco}
                  aoMudar={v => setRascunho(r => r && ({ ...r, cco: v }))} />
              </>
            )}

            <input className="co-campo" placeholder="Assunto" value={rascunhoAtual.assunto}
              aria-label="Assunto"
              onChange={e => setRascunho(r => r && ({ ...r, assunto: e.target.value }))} />

            <textarea className="co-texto" placeholder="Escreva a mensagem…"
              aria-label="Corpo da mensagem" value={rascunhoAtual.corpo}
              onChange={e => setRascunho(r => r && ({ ...r, corpo: e.target.value }))} />

            {correio.assinatura && <div className="co-assinatura">{correio.assinatura}</div>}
            {rascunhoAtual.historico && <div className="co-historico">{rascunhoAtual.historico}</div>}

            {conferindo && (
              <div className={`co-previa ${vazamento >= 3 ? 'perigo' : ''}`}>
                <p style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {vazamento >= 3
                    ? <><AlertTriangle className="w-4 h-4" /> Cada pessoa vai ver {vazamento} endereços</>
                    : <><Check className="w-4 h-4" /> Cada pessoa vai ver {vazamento} endereço{vazamento === 1 ? '' : 's'}</>}
                </p>
                <p style={{ color: '#5F6368' }}>
                  {vazamento >= 3
                    ? 'Quem está no Para e no Cc aparece para todo mundo. Endereço dos outros não é seu para mostrar — a lista grande vai no Cco.'
                    : `${lista(rascunhoAtual.cco).length} pessoa(s) recebem sem que ninguém saiba, pelo Cco.`}
                </p>
              </div>
            )}

            <div className="co-pe">
              <button type="button" className="co-bt primario" aria-label="Enviar" onClick={enviar}>
                <Send className="w-4 h-4" /> Enviar
              </button>
              <button type="button" className="co-bt" aria-label="Anexar arquivo"
                onClick={() => setRascunho(r => r && ({
                  ...r,
                  anexos: r.anexos.includes(ANEXOS_DISPONIVEIS[0]) ? r.anexos : [...r.anexos, ANEXOS_DISPONIVEIS[0]],
                }))}>
                <Paperclip className="w-4 h-4" />
              </button>
              <button type="button" className="co-bt" aria-label="Trazer a lista do clube"
                onClick={trazerFamilias}>
                <Users className="w-4 h-4" /> Lista do clube ({FAMILIAS.length})
              </button>
              <button type="button" className="co-bt" aria-label="Conferir antes de enviar"
                onClick={() => setConferindo(true)}>
                Conferir
              </button>
              {rascunhoAtual.anexos.map(a => (
                <span key={a} className="co-anexo"><Paperclip className="w-3 h-3" /> {a}</span>
              ))}
            </div>
          </JanelinhaDeEscrever>
        )}

        {/* Os endereços que o exercício usa, à mão — como um papel ao lado do
            computador. Sem eles, a tarefa viraria adivinhar endereço. */}
        {tela === 'lista' && pasta === 'entrada' && !rascunho && (
          <div style={{
            position: 'absolute', left: 200, bottom: 8, fontSize: 11.5, color: '#5F6368',
            background: '#FFFDE7', border: '1px solid #F0E6A6', borderRadius: 6, padding: '6px 10px',
          }}>
            Anotado no papel ao lado: secretaria <strong>{SECRETARIA}</strong> · direção <strong>{DIRETOR}</strong>
          </div>
        )}
      </div>
    </LaboratorioEmTelaCheia>
  );
}
