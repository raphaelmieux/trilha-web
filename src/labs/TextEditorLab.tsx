import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  logActivity, upsertRequirementProgress, ensureEnrollment,
  updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import { normalizar } from '../lib/respostaTexto';
import { TEMAS } from './temasDeRedacao';
import { lerRascunho, descartarRascunho, rascunhoEhMaisNovo } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';
import { CheckCircle2, Save, FileText, AlertCircle, RotateCcw } from 'lucide-react';

/*
 * O laboratório de redação, agora servindo qualquer trilha.
 *
 * O tema vem de temasDeRedacao.ts. Antes estava escrito aqui dentro: o
 * laboratório exigia ARPANET e Tim Berners-Lee de todo mundo, o que impedia
 * reaproveitá-lo para o relatório de história dos computadores da AP041.
 *
 * A lista de critérios encolheu de propósito. A anterior tinha dez itens, e
 * três deles — plágio, ortografia, conclusão — eram verificados contando se o
 * texto tinha mais de zero palavras. Prometer avaliação que não existe é pior
 * do que assumir que aquilo não é avaliado aqui: quem lê a lista acredita nela.
 */

interface Props { specialtyCode: string; lessonCode: string; requirementCodes: string[]; userId: string; }

export default function TextEditorLab({ specialtyCode, lessonCode, requirementCodes, userId }: Props) {
  const tema = TEMAS[specialtyCode] ?? TEMAS.AP034;

  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  /* Avisa que o texto voltou do navegador, em vez de reaparecer sozinho. */
  const [recuperado, setRecuperado] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const plano = normalizar(text);

  const criteria = [
    {
      id: 'tamanho',
      label: `Pelo menos ${tema.minimoPalavras} palavras`,
      met: wordCount >= tema.minimoPalavras,
    },
    {
      id: 'teto',
      label: `No máximo ${tema.maximoPalavras} palavras`,
      met: wordCount > 0 && wordCount <= tema.maximoPalavras,
    },
    ...tema.exigencias.map(e => ({
      id: e.id,
      label: e.rotulo,
      met: e.termos.some(t => plano.includes(normalizar(t))),
    })),
  ];
  const metCount = criteria.filter(c => c.met).length;
  /* Tudo menos uma: sobra folga para quem escolheu um caminho diferente para
     contar a mesma história, sem abrir mão do essencial. */
  const minimoParaEnviar = criteria.length - 1;
  const podeEnviar = metCount >= minimoParaEnviar;

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('text_projects')
        .select('*')
        .eq('user_id', userId)
        .eq('specialty_code', specialtyCode)
        .maybeSingle();
      if (data) {
        setText(data.body || '');
        if (data.status === 'submitted') setSubmitted(true);
      }

      /*
        O que ficou no navegador e não chegou ao servidor. Aqui o texto só sobe
        ao clicar em salvar ou enviar, então o intervalo desprotegido é a redação
        inteira — foi assim que cem palavras se perderam numa atualização.
      */
      if (data?.status !== 'submitted') {
        const local = lerRascunho<string>(userId, lessonCode);
        if (rascunhoEhMaisNovo(local, data?.updated_at) && local!.conteudo) {
          setText(local!.conteudo);
          setRecuperado(true);
        }
      }
      setCarregando(false);
    })();
  }, [userId, specialtyCode, lessonCode]);

  /* A rede embaixo do salvamento: grava no navegador a cada pausa. */
  useRascunhoLocal(userId, lessonCode, text, !carregando && !submitted);

  /** Grava o rascunho e devolve o id, para o envio não depender do estado. */
  const gravar = async (status: 'draft' | 'submitted'): Promise<string | null> => {
    const campos = {
      user_id: userId,
      specialty_code: specialtyCode,
      title: tema.titulo,
      body: text,
      word_count: wordCount,
      status,
      criteria_met: criteria.filter(c => c.met).map(c => c.id),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('text_projects')
      .upsert(campos, { onConflict: 'user_id,specialty_code' })
      .select('id')
      .single();
    if (error) { setErro('Não foi possível guardar o texto agora. Tente de novo em instantes.'); return null; }
    return data.id;
  };

  const handleSave = async () => {
    setErro('');
    const id = await gravar('draft');
    if (!id) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await logActivity(userId, 'text_saved', { specialtyCode, wordCount });
  };

  const handleSubmit = async () => {
    setErro('');
    const id = await gravar('submitted');
    if (!id) return;

    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);

    let gravados = 0;
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (!reqId) continue;
      await upsertRequirementProgress(userId, reqId, {
        status: 'completed',
        mastery_score: Math.round((metCount / criteria.length) * 100),
        checkpoint_passed: true, attempts: 1,
        correct_count: metCount, total_questions: criteria.length,
      });
      gravados++;
    }
    if (gravados < requirementCodes.length) {
      setErro('O texto foi guardado, mas o progresso não pôde ser registrado agora. Avise a liderança do clube.');
      return;
    }

    setSubmitted(true);
    /* Enviado: o servidor tem a versão boa. */
    descartarRascunho(userId, lessonCode);
    await logActivity(userId, 'text_submitted', { specialtyCode, wordCount, criteriaMet: metCount });
  };

  if (submitted) {
    return (
      <div className="card p-6 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
        <h2 className="text-xl font-bold mb-2">Texto enviado!</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Você atendeu {metCount} de {criteria.length} critérios, com {wordCount} palavras.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary mt-4 inline-flex">
          Voltar para a Trilha
        </Link>
      </div>
    );
  }

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
            guardado aqui no navegador e ainda não havia chegado ao servidor. Confira e salve.
          </span>
        </div>
      )}

      <div className="card p-6">
        <h1 className="text-xl font-bold mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> {tema.titulo}
        </h1>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{tema.instrucoes}</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={12}
          className="input-field text-sm"
          placeholder={tema.placeholder}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm" style={{ color: wordCount >= tema.minimoPalavras ? 'var(--color-success)' : 'var(--color-text-dim)' }}>
            {wordCount} palavras
          </span>
          {saved && (
            <span className="text-sm flex items-center gap-1" style={{ color: 'var(--color-tertiary-light)' }}>
              <CheckCircle2 className="w-4 h-4" /> Salvo!
            </span>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold mb-3">O que o texto precisa ter ({metCount}/{criteria.length})</h2>
        <ul className="space-y-2">
          {criteria.map(c => (
            <li key={c.id} className="flex items-center gap-2 text-sm">
              {c.met
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
                : <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-border-hover)' }} />}
              <span style={{ color: c.met ? 'var(--color-text)' : 'var(--color-text-dim)' }}>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {erro && <p className="text-sm" style={{ color: 'var(--color-primary)' }}>{erro}</p>}

      <div className="flex gap-3">
        <button onClick={handleSave} className="btn-secondary">
          <Save className="w-4 h-4 mr-1" /> Salvar rascunho
        </button>
        <button onClick={handleSubmit} disabled={!podeEnviar} className="btn-primary">
          {podeEnviar ? 'Enviar texto' : `Faltam ${minimoParaEnviar - metCount} item(ns)`}
        </button>
      </div>
    </div>
  );
}
