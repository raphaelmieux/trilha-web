import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Pencil, Inbox, Send, Archive, Reply, Forward, Paperclip,
  Settings, Search, Users, X, Trash2, Star, ChevronLeft,
  FileCheck2, RotateCcw, AlertTriangle, Check,
} from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
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
      });
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
      <style>{`
        .co-janela {
          flex: 1; min-height: 0; display: flex; flex-direction: column;
          background: #FFFFFF; color: #202124;
          font-family: system-ui, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 13.5px;
        }
        .co-topo {
          display: flex; align-items: center; gap: 12px; padding: 8px 14px;
          border-bottom: 1px solid #E0E0E0; background: #F6F8FC;
        }
        .co-busca {
          flex: 1; max-width: 620px; background: #EAF1FB; border: none; border-radius: 8px;
          padding: 8px 12px; font-size: 13.5px; color: #202124; display: flex; gap: 8px; align-items: center;
        }
        .co-corpo { flex: 1; min-height: 0; display: flex; }
        .co-lado { width: 190px; flex: none; padding: 10px 6px; }
        .co-escrever {
          display: inline-flex; align-items: center; gap: 10px; padding: 12px 20px;
          border-radius: 999px; background: #C2E7FF; color: #001D35; border: none;
          font-size: 14px; cursor: pointer; margin: 0 8px 14px;
        }
        .co-escrever:hover { background: #A8DBFF; }
        .co-pasta {
          display: flex; align-items: center; gap: 12px; width: 100%; text-align: left;
          padding: 7px 14px; border: none; background: none; cursor: pointer;
          border-radius: 0 999px 999px 0; color: #202124; font-size: 13.5px;
        }
        .co-pasta:hover { background: #EAECEF; }
        .co-pasta[aria-current="true"] { background: #D3E3FD; font-weight: 700; }
        .co-lista { flex: 1; min-width: 0; overflow: auto; border-left: 1px solid #E0E0E0; }
        .co-linha {
          display: flex; gap: 12px; align-items: center; width: 100%; text-align: left;
          padding: 10px 14px; border-bottom: 1px solid #F1F1F1; background: none;
          border-left: none; border-right: none; border-top: none; cursor: pointer; color: #202124;
        }
        .co-linha:hover { box-shadow: inset 0 0 0 1px #E0E0E0; }
        .co-de { width: 168px; flex: none; font-weight: 700; }
        .co-msg { flex: 1; min-width: 0; overflow: auto; border-left: 1px solid #E0E0E0; padding: 14px 18px; }
        .co-acoes { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
        .co-bt {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px;
          border: 1px solid #DADCE0; border-radius: 999px; background: #FFFFFF;
          font-size: 12.5px; color: #202124; cursor: pointer;
        }
        .co-bt:hover { background: #F1F3F4; }
        .co-bt.primario { background: #0B57D0; border-color: #0B57D0; color: #FFFFFF; }
        .co-bt.primario:hover { background: #0A4BB5; }
        .co-janelinha {
          position: absolute; right: 16px; bottom: 0; width: min(520px, calc(100% - 32px));
          background: #FFFFFF; border-radius: 8px 8px 0 0;
          box-shadow: 0 -2px 16px rgba(0,0,0,.28); display: flex; flex-direction: column;
          max-height: 88%; z-index: 5;
        }
        .co-janelinha-topo {
          background: #F2F6FC; padding: 8px 14px; border-radius: 8px 8px 0 0;
          display: flex; align-items: center; font-size: 13px; font-weight: 600;
        }
        .co-campo {
          border: none; border-bottom: 1px solid #E0E0E0; padding: 8px 14px;
          font-size: 13px; width: 100%; color: #202124; background: transparent;
        }
        .co-campo:focus { outline: none; border-bottom-color: #0B57D0; }
        .co-linha-campo { display: flex; align-items: center; border-bottom: 1px solid #E0E0E0; }
        .co-linha-campo .co-campo { border-bottom: none; }
        .co-rotulo { padding: 0 6px 0 14px; color: #5F6368; font-size: 12.5px; flex: none; }
        .co-copias { padding: 0 14px; color: #5F6368; font-size: 12.5px; background: none; border: none; cursor: pointer; }
        .co-texto {
          flex: 1; min-height: 130px; border: none; padding: 12px 14px; resize: none;
          font: inherit; color: #202124; background: transparent;
        }
        .co-texto:focus { outline: none; }
        .co-assinatura { padding: 0 14px 8px; color: #5F6368; font-size: 12.5px; white-space: pre-wrap; }
        .co-historico {
          margin: 0 14px 10px; padding-left: 10px; border-left: 2px solid #DADCE0;
          color: #5F6368; font-size: 12px; white-space: pre-wrap; max-height: 96px; overflow: auto;
        }
        .co-pe {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          border-top: 1px solid #E0E0E0; flex-wrap: wrap;
        }
        .co-anexo {
          display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px;
          border: 1px solid #DADCE0; border-radius: 6px; font-size: 12px; color: #202124;
        }
        .co-previa {
          margin: 0 14px 10px; padding: 10px; border-radius: 6px;
          background: #FEF7E0; border: 1px solid #F1D68C; font-size: 12.5px; color: #202124;
        }
        .co-previa.perigo { background: #FCE8E6; border-color: #F0B4AE; }
        .co-config { padding: 18px; max-width: 620px; }
      `}</style>

      <div className="co-janela" style={{ position: 'relative' }}>
        <div className="co-topo">
          <Mail className="w-5 h-5" style={{ color: '#C5221F' }} />
          <span style={{ fontWeight: 600 }}>Correio</span>
          <div className="co-busca">
            <Search className="w-4 h-4" style={{ color: '#5F6368' }} />
            <span style={{ color: '#5F6368' }}>Pesquisar no correio</span>
          </div>
          <button type="button" className="co-bt" aria-label="Configurações"
            onClick={() => { setRascunhoDaAssinatura(correio.assinatura); setTela('configuracoes'); }}>
            <Settings className="w-4 h-4" /> Configurações
          </button>
        </div>

        {tela === 'configuracoes' ? (
          <div className="co-config">
            <button type="button" className="co-bt" aria-label="Voltar para o correio"
              onClick={() => setTela('lista')} style={{ marginBottom: 14 }}>
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4, color: '#202124' }}>Assinatura</h2>
            <p style={{ color: '#5F6368', fontSize: 12.5, marginBottom: 10 }}>
              Este texto entra sozinho no fim de toda mensagem que você escrever.
              Nome, função no clube e um contato costumam bastar.
            </p>
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
          </div>
        ) : (
          <div className="co-corpo">
            <div className="co-lado">
              <button type="button" className="co-escrever" aria-label="Escrever"
                onClick={() => escrever()}>
                <Pencil className="w-4 h-4" /> Escrever
              </button>
              <button type="button" className="co-pasta" aria-current={pasta === 'entrada'}
                onClick={() => { setPasta('entrada'); setTela('lista'); }}>
                <Inbox className="w-4 h-4" /> Caixa de entrada
                <span style={{ marginLeft: 'auto', fontSize: 12 }}>{naCaixaDeEntrada(correio).length}</span>
              </button>
              <button type="button" className="co-pasta" aria-current={pasta === 'enviados'}
                onClick={() => { setPasta('enviados'); setTela('lista'); }}>
                <Send className="w-4 h-4" /> Enviados
                <span style={{ marginLeft: 'auto', fontSize: 12 }}>{correio.enviadas.length}</span>
              </button>
              <button type="button" className="co-pasta" aria-current={pasta === 'arquivados'}
                onClick={() => { setPasta('arquivados'); setTela('lista'); }}>
                <Archive className="w-4 h-4" /> Arquivados
                <span style={{ marginLeft: 'auto', fontSize: 12 }}>
                  {correio.caixa.filter(m => m.arquivada).length}
                </span>
              </button>
              <button type="button" className="co-pasta"
                onClick={() => setAviso('A lixeira existe no correio de verdade, e está aqui para a lateral ficar igual — mas não faz parte deste exercício. Repare que arquivar não põe nada nela.')}>
                <Trash2 className="w-4 h-4" /> Lixeira
              </button>
            </div>

            {tela === 'mensagem' && mensagem ? (
              <div className="co-msg">
                <div className="co-acoes">
                  <button type="button" className="co-bt" aria-label="Voltar"
                    onClick={() => { setTela('lista'); setAberta(null); }}>
                    <ChevronLeft className="w-4 h-4" /> Voltar
                  </button>
                  <button type="button" className="co-bt" aria-label="Arquivar"
                    onClick={() => arquivar(mensagem)}>
                    <Archive className="w-4 h-4" /> Arquivar
                  </button>
                  <button type="button" className="co-bt" aria-label="Responder"
                    onClick={() => responder(mensagem)}>
                    <Reply className="w-4 h-4" /> Responder
                  </button>
                  <button type="button" className="co-bt" aria-label="Encaminhar"
                    onClick={() => encaminhar(mensagem)}>
                    <Forward className="w-4 h-4" /> Encaminhar
                  </button>
                  <button type="button" className="co-bt" aria-label="Marcar com estrela"
                    onClick={() => setAviso('A estrela existe no correio de verdade, e não faz parte deste exercício.')}>
                    <Star className="w-4 h-4" />
                  </button>
                </div>
                <h2 style={{ fontSize: 19, marginBottom: 6, color: '#202124' }}>{mensagem.assunto}</h2>
                <p style={{ color: '#5F6368', fontSize: 12.5, marginBottom: 12 }}>
                  <strong style={{ color: '#202124' }}>{mensagem.deNome}</strong> &lt;{mensagem.de}&gt;
                </p>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{mensagem.corpo}</p>
              </div>
            ) : (
              <div className="co-lista">
                {pasta === 'enviados' ? (
                  correio.enviadas.length === 0 ? (
                    <p style={{ padding: 20, color: '#5F6368' }}>Nada enviado ainda.</p>
                  ) : correio.enviadas.map((e, i) => (
                    <div key={i} className="co-linha" style={{ cursor: 'default' }}>
                      <span className="co-de">
                        Para: {e.para[0] ?? e.cc[0] ?? `${e.cco.length} em cópia oculta`}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <strong>{e.assunto || '(sem assunto)'}</strong>
                        <span style={{ color: '#5F6368' }}> — {e.corpo.slice(0, 48)}</span>
                      </span>
                      <span style={{ fontSize: 11.5, color: '#5F6368', whiteSpace: 'nowrap' }}>
                        {e.anexos.length > 0 && <Paperclip className="w-3 h-3 inline" />}
                        {' '}{e.cco.length > 0 ? `Cco: ${e.cco.length}` : ''}
                      </span>
                    </div>
                  ))
                ) : daPasta.length === 0 ? (
                  <p style={{ padding: 20, color: '#5F6368' }}>
                    {pasta === 'arquivados' ? 'Nada arquivado ainda.' : 'A caixa de entrada está vazia.'}
                  </p>
                ) : daPasta.map(m => (
                  <button key={m.id} type="button" className="co-linha"
                    aria-label={`Abrir: ${m.assunto}`}
                    onClick={() => { setAberta(m.id); setTela('mensagem'); }}>
                    <span className="co-de">{m.deNome}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <strong>{m.assunto}</strong>
                      <span style={{ color: '#5F6368' }}> — {m.corpo.slice(0, 52)}…</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* A janelinha de escrever, no canto — como no correio de verdade. */}
        {rascunhoAtual && (
          <div className="co-janelinha">
            <div className="co-janelinha-topo">
              Nova mensagem
              <button type="button" aria-label="Descartar a mensagem" className="ml-auto"
                onClick={() => { setRascunho(null); setConferindo(false); }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="co-linha-campo">
              <span className="co-rotulo">Para</span>
              <input className="co-campo" value={rascunhoAtual.para}
                aria-label="Para"
                onChange={e => setRascunho(r => r && ({ ...r, para: e.target.value }))} />
              {!rascunhoAtual.mostrarCopias && (
                <button type="button" className="co-copias" aria-label="Mostrar Cc e Cco"
                  onClick={() => setRascunho(r => r && ({ ...r, mostrarCopias: true }))}>
                  Cc Cco
                </button>
              )}
            </div>

            {rascunhoAtual.mostrarCopias && (
              <>
                <div className="co-linha-campo">
                  <span className="co-rotulo">Cc</span>
                  <input className="co-campo" value={rascunhoAtual.cc}
                    aria-label="Cc"
                    onChange={e => setRascunho(r => r && ({ ...r, cc: e.target.value }))} />
                </div>
                <div className="co-linha-campo">
                  <span className="co-rotulo">Cco</span>
                  <input className="co-campo" value={rascunhoAtual.cco}
                    aria-label="Cco"
                    onChange={e => setRascunho(r => r && ({ ...r, cco: e.target.value }))} />
                </div>
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
          </div>
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
