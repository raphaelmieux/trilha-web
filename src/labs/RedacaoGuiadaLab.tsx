import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  logActivity, upsertRequirementProgress, ensureEnrollment,
  updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import {
  ROTEIROS, contarPalavras, totalDePalavras, etapaPronta, respostasParaUniao,
  podeUnir, unirLocalmente,
  type RespostasRedacao, type ConferenciaEtapa, type EtapaRedacao,
} from './redacaoGuiada';
import { lerRascunho, descartarRascunho, rascunhoEhMaisNovo } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import {
  CheckCircle2, AlertTriangle, XCircle, Search, Sparkles,
  Save, ChevronLeft, ChevronRight, FileText, Loader2, RotateCcw,
} from 'lucide-react';
import type { PropsDeLaboratorio as Props } from './tipos';

/*
 * A redação guiada: o relatório de 250 palavras construído por etapas.
 *
 * O desbravador pesquisa e responde oito perguntas curtas. Cada resposta é
 * conferida contra os fatos que a Edge Function guarda, e só entra no texto
 * final o que passou. No fim, as respostas são unidas num texto único.
 *
 * Duas decisões merecem nota.
 *
 * A primeira: o texto final é montado a partir das respostas, e o modelo é
 * instruído a não acrescentar fato nenhum. O relatório vale como cumprimento do
 * requisito porque é do desbravador — um parágrafo bonito com uma data que ele
 * nunca pesquisou seria o contrário disso.
 *
 * A segunda: sem IA configurada, o laboratório continua funcionando. As
 * respostas passam sem conferência e a união é feita aqui mesmo, emendando os
 * parágrafos. O texto sai mais seco, e a tela diz exatamente isso — prometer uma
 * conferência que não aconteceu seria pior do que admitir que ela faltou.
 */

type EstadoIA = 'ok' | 'indisponivel';

/** O que o rascunho local guarda: o laboratório inteiro, menos o que veio do servidor. */
interface RascunhoRedacao { respostas: RespostasRedacao; textoFinal: string }

export default function RedacaoGuiadaLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId, aoVencer }: Props) {
  const roteiro = ROTEIROS[specialtyCode];

  const [respostas, setRespostas] = useState<RespostasRedacao>({});
  const [indice, setIndice] = useState(0);
  const [conferindo, setConferindo] = useState(false);
  const [montando, setMontando] = useState(false);
  const [textoFinal, setTextoFinal] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState('');
  const [ia, setIa] = useState<EstadoIA>('ok');
  const [carregando, setCarregando] = useState(true);
  /* Avisa que algo foi trazido de volta do navegador, em vez de o texto
     simplesmente reaparecer. */
  const [recuperado, setRecuperado] = useState(false);

  /* Memorizado porque `gravar` depende dele: um array novo a cada render
     recriaria a função toda vez, e o useCallback não guardaria nada. */
  const etapas = useMemo(() => roteiro?.etapas ?? [], [roteiro]);
  const etapa: EtapaRedacao | undefined = etapas[indice];
  const resposta = etapa ? respostas[etapa.id] : undefined;
  const texto = resposta?.texto ?? '';
  const palavrasDaEtapa = contarPalavras(texto);
  const total = totalDePalavras(respostas);
  const prontas = roteiro ? etapas.filter(e => etapaPronta(e, respostas[e.id])).length : 0;
  const tudoPronto = roteiro ? podeUnir(roteiro, respostas) : false;

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('text_projects')
        .select('body, etapas, status, updated_at')
        .eq('user_id', userId)
        .eq('specialty_code', specialtyCode)
        .maybeSingle();

      /*
        Ignorar este erro sai caro. Sem a migration da coluna `etapas` aplicada,
        o select falha, a tela abre limpa e o desbravador recomeça um trabalho
        que estava salvo — sem nada dizendo que houve falha. Melhor mostrar.
      */
      if (error) {
        setErro('Não foi possível carregar o que você já tinha escrito. Avise a liderança do clube antes de continuar, para não perder o trabalho.');
      } else if (data) {
        if (data.etapas) setRespostas(data.etapas as RespostasRedacao);
        if (data.body) setTextoFinal(data.body);
        if (data.status === 'submitted') setEnviado(true);
      }

      /*
        O que ficou no navegador e não chegou ao servidor.

        Entre uma gravação e a seguinte cabe um parágrafo inteiro, e foi
        exatamente isso que uma atualização do aplicativo levou embora uma vez.
        Só restaura quando o rascunho é mais novo que o registro do servidor —
        caso contrário, reviveria uma versão já superada — e sempre avisa, porque
        texto que reaparece sozinho assusta mais do que ajuda.
      */
      if (data?.status !== 'submitted') {
        const local = lerRascunho<RascunhoRedacao>(userId, lessonCode);
        if (rascunhoEhMaisNovo(local, data?.updated_at)) {
          if (local!.conteudo.respostas) setRespostas(local!.conteudo.respostas);
          if (local!.conteudo.textoFinal) setTextoFinal(local!.conteudo.textoFinal);
          setRecuperado(true);
        }
      }

      setCarregando(false);
    })();
  }, [userId, specialtyCode, lessonCode]);

  /* A rede embaixo do salvamento: grava no navegador a cada pausa. */
  useRascunhoLocal(
    userId, lessonCode,
    useMemo(() => ({ respostas, textoFinal }), [respostas, textoFinal]),
    !carregando && !enviado,
  );

  const gravar = useCallback(async (
    status: 'draft' | 'submitted',
    dados: { respostas: RespostasRedacao; corpo: string },
  ) => {
    const prontasIds = roteiro
      ? etapas.filter(e => etapaPronta(e, dados.respostas[e.id])).map(e => e.id)
      : [];
    const { error } = await supabase.from('text_projects').upsert({
      user_id: userId,
      specialty_code: specialtyCode,
      title: roteiro?.titulo ?? '',
      body: dados.corpo,
      word_count: dados.corpo ? contarPalavras(dados.corpo) : totalDePalavras(dados.respostas),
      status,
      criteria_met: prontasIds,
      etapas: dados.respostas,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,specialty_code' });
    if (error) { setErro('Não foi possível guardar agora. Tente de novo em instantes.'); return false; }
    return true;
  }, [userId, specialtyCode, roteiro, etapas]);

  /** Uma chamada ao gateway, com a sessão do próprio desbravador. */
  const chamarGateway = async (corpo: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { erro: 'Sessão expirada. Entre novamente.' };
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-gateway`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...corpo, userId }),
    });
    const data = await res.json();
    if (data.notConfigured) { setIa('indisponivel'); return { erro: '', semIA: true }; }
    if (!res.ok || data.error) return { erro: data.error || 'Não foi possível falar com a IA agora.' };
    return { data };
  };

  const guardarConferencia = (id: string, textoConferido: string, conferencia: ConferenciaEtapa) => {
    setRespostas(prev => {
      const proximas = { ...prev, [id]: { ...prev[id], texto: textoConferido, conferencia, conferidoEm: textoConferido } };
      void gravar('draft', { respostas: proximas, corpo: textoFinal });
      return proximas;
    });
  };

  const conferir = async () => {
    if (!etapa) return;
    setErro(''); setConferindo(true);
    const alvo = texto.trim();

    const resultado = await chamarGateway({
      type: 'redacao_validar',
      especialidade: specialtyCode,
      etapaId: etapa.id,
      resposta: alvo,
    });

    if (resultado.semIA) {
      guardarConferencia(etapa.id, alvo, {
        veredito: 'ok',
        observacao: 'A conferência automática está indisponível. Sua resposta foi guardada sem ela — confira você mesmo os nomes e as datas.',
      });
    } else if (resultado.erro) {
      setErro(resultado.erro);
    } else if (resultado.data?.blocked) {
      setErro('A conferência não pôde ser feita nesta resposta. Reescreva com outras palavras.');
    } else if (resultado.data?.conferencia) {
      guardarConferencia(etapa.id, alvo, resultado.data.conferencia as ConferenciaEtapa);
    } else {
      setErro('A conferência não voltou como esperado. Tente de novo.');
    }
    setConferindo(false);
  };

  const montarTexto = async () => {
    if (!roteiro) return;
    setErro(''); setMontando(true);

    const partes = respostasParaUniao(roteiro, respostas);
    const resultado = await chamarGateway({
      type: 'redacao_unir',
      especialidade: specialtyCode,
      respostas: partes,
    });

    let corpo: string;
    if (resultado.semIA || resultado.erro) {
      corpo = unirLocalmente(roteiro, respostas);
      if (resultado.erro) setErro(`${resultado.erro} Seu texto foi montado juntando as respostas.`);
    } else {
      corpo = String(resultado.data?.result ?? '').trim() || unirLocalmente(roteiro, respostas);
    }

    setTextoFinal(corpo);
    await gravar('draft', { respostas, corpo });
    await logActivity(userId, 'redacao_montada', { specialtyCode, palavras: contarPalavras(corpo) });
    setMontando(false);
  };

  const enviar = async () => {
    setErro('');
    if (!await gravar('submitted', { respostas, corpo: textoFinal })) return;

    /* A vereda grava o próprio evento e não tem requisito, matrícula nem linha
       em `lessons`. Tentar escrever nessas tabelas com o código dela não daria
       erro — daria nada, que é pior. */
    if (aoVencer) {
      await aoVencer();
    } else {
      const specId = await getSpecialtyId(specialtyCode);
      if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
      await registrarConclusaoDeLicao(userId, lessonCode);

      let gravados = 0;
      for (const reqCode of requirementCodes) {
        const reqId = await getRequirementId(reqCode);
        if (!reqId) continue;
        await upsertRequirementProgress(userId, reqId, {
          status: 'completed',
          mastery_score: Math.round((prontas / etapas.length) * 100),
          checkpoint_passed: true, attempts: 1,
          correct_count: prontas, total_questions: etapas.length,
        });
        gravados++;
      }
      if (gravados < requirementCodes.length) {
        setErro('O texto foi guardado, mas o progresso não pôde ser registrado agora. Avise a liderança do clube.');
        return;
      }
    }
    setEnviado(true);
    /* Enviado: o servidor tem a versão boa, e o rascunho local só atrapalharia. */
    descartarRascunho(userId, lessonCode);
    await logActivity(userId, 'text_submitted', { specialtyCode, lessonCode,
      wordCount: contarPalavras(textoFinal), etapas: prontas,
    });
  };

  const salvarRascunho = async () => {
    setErro('');
    if (await gravar('draft', { respostas, corpo: textoFinal })) {
      setSalvo(true); setTimeout(() => setSalvo(false), 2000);
    }
  };

  /* ── Telas ─────────────────────────────────────────────────────────────── */

  if (!roteiro) {
    return (
      <div className="card p-6">
        <p style={{ color: 'var(--color-text-muted)' }}>
          Esta trilha ainda não tem um roteiro de redação.
        </p>
      </div>
    );
  }

  if (carregando) {
    return (
      <div className="card p-6 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando seu texto...
      </div>
    );
  }

  if (enviado) {
    /*
      Quem entregou pela caixa de texto antiga não passou por etapa nenhuma.

      A frase dizia "construídas a partir das suas 8 respostas" para todo mundo,
      inclusive para quem escreveu o texto de uma vez só, antes de este
      laboratório existir. O trabalho dessas pessoas continua valendo — o que
      não pode é a tela contar uma história que não foi a delas.
    */
    const porEtapas = Object.keys(respostas).length > 0;
    return (
      <div className="card p-6">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
          <h2 className="text-xl font-bold mb-2">Relatório enviado!</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {contarPalavras(textoFinal)} palavras
            {porEtapas && `, construídas a partir das suas ${etapas.length} respostas`}.
          </p>
        </div>

        {/* O texto fica à vista: é o trabalho da pessoa, e antes a tela o
            guardava sem oferecer nenhum jeito de reler. */}
        {textoFinal && (
          <div
            className="mt-4 p-4 rounded-lg text-sm whitespace-pre-wrap"
            style={{ backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-soft)' }}
          >
            {textoFinal}
          </div>
        )}

        <div className="text-center">
          <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
            Voltar para a Trilha
          </Link>
        </div>
      </div>
    );
  }

  const faltaTexto = palavrasDaEtapa < (etapa?.minPalavras ?? 0);
  const conferenciaAtual = resposta?.conferidoEm === texto ? resposta?.conferencia : undefined;

  return (
    <div className="space-y-4">
      {recuperado && (
        <div
          className="p-3 rounded-lg text-sm flex items-start gap-2"
          style={{ backgroundColor: 'var(--color-tertiary-dim)', border: '1px solid var(--color-tertiary-light)' }}
        >
          <RotateCcw className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-tertiary-light)' }} />
          <span>
            <strong>Recuperamos o que você estava escrevendo.</strong> O texto tinha ficado
            guardado aqui no navegador e ainda não havia chegado ao servidor. Confira se está
            como você deixou e salve.
          </span>
        </div>
      )}

      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> {lessonTitle}
        </h1>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{roteiro.introducao}</p>

        <div className="flex items-center justify-between text-sm mb-2">
          <span style={{ color: 'var(--color-text-dim)' }}>
            {prontas} de {etapas.length} etapas prontas
          </span>
          <span style={{ color: total >= roteiro.minPalavrasTotal ? 'var(--color-success)' : 'var(--color-text-dim)' }}>
            {total} / {roteiro.minPalavrasTotal} palavras
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {etapas.map((e, i) => {
            const r = respostas[e.id];
            const ok = etapaPronta(e, r);
            const alerta = r?.conferencia?.veredito === 'impreciso';
            return (
              <button
                key={e.id}
                onClick={() => setIndice(i)}
                className="text-xs px-2 py-1 rounded-md transition-colors"
                style={{
                  backgroundColor: i === indice ? 'var(--color-primary-dim)' : 'var(--color-bg-hover)',
                  color: ok ? 'var(--color-success)' : alerta ? 'var(--color-secondary)' : 'var(--color-text-dim)',
                  border: `1px solid ${i === indice ? 'var(--color-primary)' : 'transparent'}`,
                }}
              >
                {i + 1}. {e.titulo}
              </button>
            );
          })}
        </div>
      </div>

      {etapa && (
        <div className="card p-6">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-dim)' }}>
            Etapa {indice + 1} de {etapas.length}
          </p>
          <h2 className="font-bold mb-3">{etapa.pergunta}</h2>

          <div
            className="p-3 rounded-lg mb-3 text-sm flex gap-2"
            style={{ backgroundColor: 'var(--color-tertiary-dim)', border: '1px solid var(--color-tertiary-light)' }}
          >
            <Search className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-tertiary-light)' }} />
            <span><strong>Para pesquisar:</strong> {etapa.paraPesquisar}</span>
          </div>

          <textarea
            value={texto}
            onChange={ev => {
              const novo = ev.target.value;
              setRespostas(prev => ({ ...prev, [etapa.id]: { ...prev[etapa.id], texto: novo } }));
            }}
            onBlur={salvarRascunho}
            rows={6}
            className="input-field text-sm"
            placeholder={etapa.exemplo}
          />

          <div className="flex items-center justify-between mt-2 mb-3">
            <span className="text-sm" style={{ color: faltaTexto ? 'var(--color-text-dim)' : 'var(--color-success)' }}>
              {palavrasDaEtapa} palavras {faltaTexto && `(mínimo ${etapa.minPalavras})`}
            </span>
            {salvo && (
              <span className="text-sm flex items-center gap-1" style={{ color: 'var(--color-tertiary-light)' }}>
                <CheckCircle2 className="w-4 h-4" /> Salvo!
              </span>
            )}
          </div>

          {conferenciaAtual && <Conferencia c={conferenciaAtual} />}

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={conferir}
              disabled={faltaTexto || conferindo}
              className="btn-primary"
            >
              {conferindo
                ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Conferindo...</>
                : <><Sparkles className="w-4 h-4 mr-1" /> Conferir resposta</>}
            </button>
            <button onClick={salvarRascunho} className="btn-secondary">
              <Save className="w-4 h-4 mr-1" /> Salvar
            </button>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setIndice(i => Math.max(0, i - 1))}
                disabled={indice === 0}
                className="btn-secondary"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIndice(i => Math.min(etapas.length - 1, i + 1))}
                disabled={indice === etapas.length - 1}
                className="btn-secondary"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {ia === 'indisponivel' && (
        <p className="text-sm px-1" style={{ color: 'var(--color-secondary)' }}>
          A conferência automática está desligada neste clube. Você continua escrevendo normalmente,
          mas confira você mesmo os nomes e as datas antes de enviar.
        </p>
      )}

      <div className="card p-6">
        <h2 className="font-bold mb-2">Seu texto final</h2>
        {!textoFinal && (
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {tudoPronto
              ? 'Tudo pronto. Junte suas respostas num texto só.'
              : `Responda e confira as ${etapas.length} etapas, com ${roteiro.minPalavrasTotal} palavras no total, para montar o texto.`}
          </p>
        )}

        {textoFinal && (
          <>
            <textarea
              value={textoFinal}
              onChange={ev => setTextoFinal(ev.target.value)}
              onBlur={salvarRascunho}
              rows={14}
              className="input-field text-sm"
            />
            <p className="text-sm mt-2" style={{ color: contarPalavras(textoFinal) >= roteiro.minPalavrasTotal ? 'var(--color-success)' : 'var(--color-primary)' }}>
              {contarPalavras(textoFinal)} palavras — você pode ajustar o texto antes de enviar.
            </p>
          </>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={montarTexto} disabled={!tudoPronto || montando} className="btn-secondary">
            {montando
              ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Montando...</>
              : <><Sparkles className="w-4 h-4 mr-1" /> {textoFinal ? 'Montar de novo' : 'Montar meu texto'}</>}
          </button>
          <button
            onClick={enviar}
            disabled={!textoFinal || contarPalavras(textoFinal) < roteiro.minPalavrasTotal}
            className="btn-primary"
          >
            Enviar relatório
          </button>
        </div>
      </div>

      {erro && <p className="text-sm px-1" style={{ color: 'var(--color-primary)' }}>{erro}</p>}
    </div>
  );
}

/** O retorno de uma conferência, com a cor dizendo o mesmo que o texto. */
function Conferencia({ c }: { c: ConferenciaEtapa }) {
  const estilo = {
    ok: { cor: 'var(--color-success)', Icone: CheckCircle2, titulo: 'Resposta conferida' },
    impreciso: { cor: 'var(--color-secondary)', Icone: AlertTriangle, titulo: 'Confira este ponto' },
    fora_do_tema: { cor: 'var(--color-primary)', Icone: XCircle, titulo: 'Isso não responde à pergunta' },
  }[c.veredito];

  return (
    <div
      className="p-3 rounded-lg text-sm"
      style={{ backgroundColor: 'var(--color-bg-hover)', border: `1px solid ${estilo.cor}` }}
    >
      <p className="flex items-center gap-2 font-bold mb-1" style={{ color: estilo.cor }}>
        <estilo.Icone className="w-4 h-4" /> {estilo.titulo}
      </p>
      {c.observacao && <p>{c.observacao}</p>}
      {c.correcao && (
        <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
          <strong>O certo é:</strong> {c.correcao}
        </p>
      )}
    </div>
  );
}
