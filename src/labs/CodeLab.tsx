import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import { validateHtml, type CheckResult } from '../lib/htmlValidator';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import LeitorDeVereda from '../components/LeitorDeVereda';
import { getVereda } from '../curriculum/veredas';
import {
  CSS_IDE, CabecalhoDaIde, LateralDaIde, EditorDeCodigo, PreviaDaIde,
  StatusDaIde, AlternadorDaIde,
} from './ide';
import { contarLinhas } from './realce';
import type { PropsDeLaboratorio } from './tipos';
/*
  De onde a página parte, o que é cobrado dela e o caminho de cada cobrança —
  tudo em `desafioDeHtml`, fora daqui, porque é o que um teste precisa alcançar:
  o desafio da tabela já abriu com oito das doze verificações verdes, e isso não
  aparece em tela nenhuma.
*/
import {
  STARTERS, CHECK_IDS, PROJETO, PASSOS, type CodeLabVariant,
} from './desafioDeHtml';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';

export type { CodeLabVariant };

type Props = PropsDeLaboratorio & { variant?: CodeLabVariant };

const ARQUIVO = 'index.html';

/* A vereda que este editor abre pelo ícone de livro. Não-nula por
   construção: `html` é entrada fixa do registro. */
const VEREDA_HTML = getVereda('html')!;

export default function CodeLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId, variant = 'elementos' }: Props) {
  const starter = STARTERS[variant];
  /*
    O código volta como foi deixado.

    Escrever uma página inteira leva bastante tempo, e o texto só existia na
    tela: recarregar sem querer, o aplicativo se atualizar por baixo, ou
    simplesmente sair para conferir outra coisa apagava tudo — e quem perde
    meia hora de trabalho não recomeça, desiste. `useRascunhoLocal` grava a
    cada pausa e também na hora em que a página some, que é o momento em que
    um temporizador de meio segundo nunca chega a disparar no celular.

    A leitura é preguiçosa, no primeiro estado: restaurar por efeito faria a
    tela piscar o modelo antes do trabalho da pessoa.
  */
  const [code, setCode] = useState(() => {
    const guardado = lerRascunho<string>(userId, lessonCode);
    return typeof guardado?.conteudo === 'string' ? guardado.conteudo : starter;
  });
  const [voltou] = useState(() => {
    const guardado = lerRascunho<string>(userId, lessonCode);
    return typeof guardado?.conteudo === 'string' && guardado.conteudo !== starter;
  });
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  /* Em tela estreita o editor e a prévia não cabem lado a lado, e a escolha
     entre os dois é de quem está usando. */
  const [vendo, setVendo] = useState<'codigo' | 'previa'>('codigo');
  /* Avisa que o código voltou do navegador, em vez de reaparecer sozinho:
     encontrar a tela diferente do que se lembra sem explicação assusta mais
     do que ajuda. */
  const [consultando, setConsultando] = useState(false);
  const [aviso, setAviso] = useState(voltou ? 'Seu código voltou como você deixou.' : '');

  useRascunhoLocal(userId, lessonCode, code, !completed);

  // Live validation: the student sees a requirement tick the moment the markup
  // becomes correct, which is the feedback loop that teaches the element. The
  // previous version only told them anything after pressing "Executar Testes".
  const results: CheckResult[] = useMemo(() => validateHtml(code, CHECK_IDS[variant]), [code, variant]);
  const passedCount = results.filter(r => r.passed).length;
  const allPassed = passedCount === results.length;

  // Debounced so the iframe is not rebuilt on every keystroke.
  const [previewCode, setPreviewCode] = useState(code);
  useEffect(() => {
    const t = setTimeout(() => setPreviewCode(code), 400);
    return () => clearTimeout(t);
  }, [code]);

  const handleComplete = async () => {
    setSaving(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: passedCount, total_questions: results.length,
      });
    }
    await logActivity(userId, 'code_lab_completed', { specialtyCode, lessonCode, variant, checksPassed: passedCount, total: results.length });
    /* Entregue, o rascunho não protege mais nada — e deixá-lo no navegador
       de um clube, que costuma ser compartilhado, é lixo com o texto de
       alguém dentro. */
    descartarRascunho(userId, lessonCode);
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{lessonTitle} — concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Sua página passou nas {results.length} verificações.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  /*
    O que falta, tarefa a tarefa, para o painel da moldura. Uma verificação é
    uma tarefa: é o mesmo que o painel de Problemas de um editor mostra, e é
    disso que o desbravador precisa — não de uma nota no fim.
  */
  const tarefas = results.map(r => ({
    id: r.id,
    titulo: r.label,
    detalhe: r.passed ? undefined : (r.detail || r.hint),
    passos: PASSOS[r.id],
    feita: r.passed,
  }));

  const acoes = (
    <div className="flex flex-col gap-2">
      <button onClick={handleComplete} disabled={!allPassed || saving}
        className="btn-primary text-sm w-full justify-center disabled:opacity-50">
        {saving ? 'Salvando…' : allPassed ? 'Concluir o laboratório' : `Faltam ${results.length - passedCount}`}
      </button>
      <button onClick={() => setCode(starter)} className="btn-secondary text-xs w-full justify-center">
        <RotateCcw className="w-3 h-3 mr-1" /> Recomeçar do zero
      </button>
    </div>
  );

  const naoFazParte = (o: string) =>
    setAviso(`${o} existe num editor de verdade, e está aqui para a tela ficar igual — mas não faz parte deste exercício.`);

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      titulo={lessonTitle}
      programa="editor-de-codigo"
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_IDE}</style>

      <div className="ide">
        <CabecalhoDaIde arquivo={ARQUIVO} projeto={PROJETO[variant]} aoAvisar={naoFazParte} />

        <div className="ide-corpo">
          {/* Por cima do editor, com o arquivo aberto atrás: sair da referência
              devolve o que já estava escrito, sem passar pela rota da lição. */}
          {consultando && (
            <div className="ide-referencia">
              <LeitorDeVereda vereda={VEREDA_HTML} aoFechar={() => setConsultando(false)} />
            </div>
          )}

          <LateralDaIde
            projeto={PROJETO[variant]}
            arquivos={[{ nome: ARQUIVO, problemas: results.length - passedCount }]}
            atual={ARQUIVO}
            aoAbrir={() => {}}
            aoAvisar={naoFazParte}
            aoConsultar={() => setConsultando(true)}
          />

          <div className="ide-painel">
            <div className="ide-guias">
              <button className="ide-guia" aria-current="true">
                <span style={{ color: '#E37933' }}>◆</span> {ARQUIVO}
              </button>
            </div>

            <AlternadorDaIde vendo={vendo} aoTrocar={setVendo} />

            <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
              <div className={vendo === 'codigo' ? 'ide-lado-codigo' : 'ide-lado-codigo escondido'}>
                <EditorDeCodigo codigo={code} aoMudar={setCode} rotulo="Editor de código HTML" />
              </div>
              <div className={vendo === 'previa' ? 'ide-lado-previa' : 'ide-lado-previa escondido'}>
                <PreviaDaIde html={previewCode} arquivo={ARQUIVO} aoAvisar={naoFazParte} />
              </div>
            </div>
          </div>
        </div>

        <StatusDaIde problemas={results.length - passedCount} linhas={contarLinhas(code)} aoAvisar={naoFazParte} />
      </div>
    </LaboratorioEmTelaCheia>
  );
}
