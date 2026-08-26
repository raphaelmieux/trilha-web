import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import { validateHtml, type CheckResult } from '../lib/htmlValidator';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_IDE, CabecalhoDaIde, LateralDaIde, EditorDeCodigo, PreviaDaIde,
  StatusDaIde, AlternadorDaIde,
} from './ide';
import { contarLinhas } from './realce';
import type { PropsDeLaboratorio } from './tipos';

/**
 * Two variants, one editor.
 *
 * `elementos` is the guided run through requirements AP035-3.1 … 3.13: sixteen
 * checks, one per element. `tabela` is requirement AP035-3.14, "criar página
 * completa" — and it exists as a separate variant because the curriculum used to
 * point that lesson at this very component with the very same sixteen checks, so
 * the student met the identical screen twice and the second visit proved
 * nothing. The table challenge judges a finished artefact instead: a header row,
 * a shape worth tabulating, no empty cells, and data that is the student's own.
 */
export type CodeLabVariant = 'elementos' | 'tabela';

type Props = PropsDeLaboratorio & { variant?: CodeLabVariant };

const STARTERS: Record<CodeLabVariant, string> = {
  elementos: `<!DOCTYPE html>
<html>
<head>
  <title>Meu Clube de Desbravadores</title>
</head>
<body>

  <!-- Escreva seu HTML aqui. A prévia ao lado atualiza sozinha. -->

</body>
</html>`,
  tabela: `<!DOCTYPE html>
<html>
<head>
  <title>Escala da Unidade</title>
</head>
<body>

  <h1>Escala da Unidade Falcão</h1>

  <p>Escreva aqui o texto do documento, explicando do que trata esta tabela.</p>

  <hr>

  <table>
    <caption>Trocar por uma descrição da sua tabela</caption>
    <tr>
      <th>Coluna 1</th>
      <th>Coluna 2</th>
      <th>Coluna 3</th>
    </tr>
    <tr>
      <td>Dado 1</td>
      <td>Dado 2</td>
      <td>Dado 3</td>
    </tr>
  </table>

  <p><a href="https://adventistas.org">Site oficial</a></p>

</body>
</html>`,
};

const CHECK_IDS: Record<CodeLabVariant, string[]> = {
  // Mirrors requirements AP035-3.1 … 3.13.
  elementos: [
    'html', 'head', 'body', 'title', 'heading', 'paragraph', 'bold', 'italic',
    'listItem', 'link', 'lineBreak', 'image', 'horizontalRule',
    'table', 'tableRow', 'tableCell',
  ],
  // Requirement AP035-4.1, which names every one of these.
  tabela: [
    'pageComplete', 'tableHeadingSize', 'tableStructure', 'tableHeader', 'tableSize',
    'tableFilled', 'tableGraphic', 'tableRule', 'tableLink', 'tableHexColour',
    'tableCaption', 'tableOwnContent',
  ],
};

const ARQUIVO = 'index.html';

/** O nome da pasta do projeto, na lateral do editor. */
const PROJETO: Record<CodeLabVariant, string> = {
  elementos: 'meu-clube',
  tabela: 'escala-da-unidade',
};

/*
  O caminho de cada verificação que ainda falta, para quem empacar. A moldura
  só oferece isto depois de um tempo sem ninguém concluir nada.

  A chave é o `id` da verificação, o mesmo do validador — assim o passo a passo
  não tem como falar de um requisito e a lista falar de outro.
*/
const PASSOS: Record<string, string[]> = {
  doctype: ['Na primeira linha do arquivo, escreva <!DOCTYPE html>.'],
  html: ['Envolva a página inteira: <html> na segunda linha e </html> na última.'],
  head: ['Depois de <html>, abra <head> e feche </head>. É onde vão as informações da página.'],
  body: ['Depois do </head>, abra <body> e feche </body>. É o que aparece na tela.'],
  title: ['Dentro do <head>, escreva <title>Nome da página</title>.'],
  heading: ['Dentro do <body>, escreva <h1>Um título</h1>.'],
  paragraph: ['Dentro do <body>, escreva <p>Um parágrafo de texto.</p>.'],
  list: [
    'Abra uma lista com <ul> e feche com </ul>.',
    'Dentro dela, cada item é <li>texto do item</li>.',
    'Ponha pelo menos dois itens.',
  ],
  link: ['Escreva <a href="https://adventistas.org">Site oficial</a>.'],
  image: [
    'Escreva <img src="foto.jpg" alt="Descrição da foto">.',
    'O alt não é enfeite: é o que a pessoa cega ouve no lugar da imagem.',
  ],
  table: [
    'Abra <table> e feche </table>.',
    'Cada linha é <tr>…</tr>, e cada célula, <td>…</td>.',
  ],
  bold: ['Ponha <strong>alguma palavra</strong> no meio de um parágrafo.'],
  italic: ['Ponha <em>alguma palavra</em> no meio de um parágrafo.'],
  comment: ['Escreva um comentário: <!-- isto não aparece na página -->.'],
  form: [
    'Abra <form> e feche </form>.',
    'Dentro, ponha um <input> e um <button>Enviar</button>.',
  ],
};

export default function CodeLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId, variant = 'elementos' }: Props) {
  const starter = STARTERS[variant];
  const [code, setCode] = useState(starter);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  /* Em tela estreita o editor e a prévia não cabem lado a lado, e a escolha
     entre os dois é de quem está usando. */
  const [vendo, setVendo] = useState<'codigo' | 'previa'>('codigo');
  const [aviso, setAviso] = useState('');

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
      tarefas={tarefas}
      aviso={aviso}
      acoes={acoes}
      rodape={26}
    >
      <style>{CSS_IDE}</style>

      <div className="ide">
        <CabecalhoDaIde arquivo={ARQUIVO} projeto={PROJETO[variant]} aoAvisar={naoFazParte} />

        <div className="ide-corpo">
          <LateralDaIde
            projeto={PROJETO[variant]}
            arquivos={[{ nome: ARQUIVO, problemas: results.length - passedCount }]}
            atual={ARQUIVO}
            aoAbrir={() => {}}
            aoAvisar={naoFazParte}
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
