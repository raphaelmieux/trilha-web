import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import { validateHtml, validateSiteLinks, type CheckResult } from '../lib/htmlValidator';
import { CheckCircle2 } from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_IDE, CabecalhoDaIde, LateralDaIde, EditorDeCodigo, PreviaDaIde,
  StatusDaIde, AlternadorDaIde,
} from './ide';
import { contarLinhas } from './realce';
import type { PropsDeLaboratorio as Props } from './tipos';
import { lerRascunho, descartarRascunho } from '../lib/rascunho';
import { useRascunhoLocal } from '../hooks/useRascunhoLocal';

const PAGES = [
  { file: 'index.html', title: 'Início' },
  { file: 'sobre.html', title: 'Sobre o Clube' },
  { file: 'galeria.html', title: 'Galeria' },
  { file: 'contato.html', title: 'Contato' },
];

const NAV = PAGES.map(p => `    <a href="${p.file}">${p.title}</a>`).join('\n');

const starter = (title: string, body: string) => `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
</head>
<body>
  <nav>
${NAV}
  </nav>
  <h1>${title}</h1>
${body}
</body>
</html>`;

const STARTERS: Record<string, string> = {
  'index.html': starter('Início', '  <p>Bem-vindo ao site do nosso clube!</p>'),
  'sobre.html': starter('Sobre o Clube', '  <p>Conte aqui a história do clube.</p>'),
  'galeria.html': starter('Galeria', '  <!-- Adicione imagens com <img src="..." alt="..."> -->'),
  'contato.html': starter('Contato', '  <!-- Crie um formulário com um campo e um botão -->'),
};

const PROJETO = 'site-do-clube';

/*
  O caminho de cada verificação que ainda falta, para quem empacar. A chave é o
  `id` do validador — assim o passo a passo não fala de um requisito enquanto a
  lista fala de outro.
*/
const PASSOS: Record<string, string[]> = {
  html: ['A página inteira vai entre <html> e </html>.'],
  head: ['Depois de <html>, abra <head> e feche </head>.'],
  body: ['Depois do </head>, abra <body> e feche </body>.'],
  title: ['Dentro do <head>, escreva <title>Nome da página</title>.'],
  heading: ['Dentro do <body>, escreva <h1>Título da página</h1>.'],
  image: [
    'Abra galeria.html na lateral do editor.',
    'Escreva <img src="foto.jpg" alt="Descrição da foto">.',
    'O alt é o que a pessoa cega ouve no lugar da imagem — não deixe vazio.',
  ],
  form: [
    'Abra contato.html na lateral do editor.',
    'Abra <form> e feche </form>.',
    'Dentro dele ponha um <input> e um <button>Enviar</button>.',
  ],
  welcomeReason: [
    'Em index.html, diga num parágrafo por que o site existe.',
    'Uma frase basta: para que serve o site e para quem ele é.',
  ],
  welcomeImage: ['Em index.html, ponha uma imagem com <img src="…" alt="…">.'],
  linksAllPages: [
    'Cada página precisa de links para as outras três.',
    'O menu já está pronto no começo de cada arquivo — confira se os quatro <a href="…"> continuam lá.',
  ],
  linksValid: [
    'Um link aponta para um arquivo que não existe.',
    'Confira se cada href é exatamente index.html, sobre.html, galeria.html ou contato.html.',
  ],
  linksReciprocal: [
    'Alguma página não é apontada por ninguém.',
    'Abra cada arquivo e veja se o menu tem os quatro links, sem faltar nenhum.',
  ],
};

/** Per-page requirements. Every page must stand on its own as valid HTML. */
const PAGE_CHECKS = ['html', 'head', 'body', 'title', 'heading'];

export default function SiteLab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  /*
    As quatro páginas voltam como foram deixadas.

    Aqui são quatro arquivos, e não um: são horas de trabalho vivendo só na
    tela até a entrega. Uma recarga sem querer levava as quatro de uma vez, e
    quem perde isso não recomeça — desiste. `useRascunhoLocal` grava a cada
    pausa e na hora em que a página some.

    O que voltou é conferido arquivo por arquivo: o formato guardado é de uma
    versão anterior do laboratório, ou está pela metade, e o que falta volta
    a ser o modelo em vez de virar `undefined` dentro do editor.
  */
  const [pages, setPages] = useState<Record<string, string>>(() => {
    const guardado = lerRascunho<Record<string, string>>(userId, lessonCode)?.conteudo;
    const voltando: Record<string, string> = { ...STARTERS };
    for (const { file } of PAGES) {
      const texto = guardado?.[file];
      if (typeof texto === 'string') voltando[file] = texto;
    }
    return voltando;
  });
  const [voltou] = useState(() => PAGES.some(p => pages[p.file] !== STARTERS[p.file]));
  const [active, setActive] = useState('index.html');
  const [vendo, setVendo] = useState<'codigo' | 'previa'>('codigo');
  /* Avisa que o trabalho voltou do navegador, em vez de reaparecer sozinho. */
  const [aviso, setAviso] = useState(voltou ? 'Suas quatro páginas voltaram como você deixou.' : '');
  const [completed, setCompleted] = useState(false);

  useRascunhoLocal(userId, lessonCode, pages, !completed);
  const [saving, setSaving] = useState(false);

  const [previewCode, setPreviewCode] = useState(pages[active]);
  useEffect(() => {
    const t = setTimeout(() => setPreviewCode(pages[active]), 400);
    return () => clearTimeout(t);
  }, [pages, active]);

  /** Structural problems, page by page. */
  const perPage = useMemo(() => {
    const out: Record<string, CheckResult[]> = {};
    for (const { file } of PAGES) out[file] = validateHtml(pages[file], PAGE_CHECKS);
    return out;
  }, [pages]);

  /** Whole-site requirements: interlinking, gallery images, contact form. */
  const siteChecks = useMemo(() => {
    const list = PAGES.map(p => ({ filename: p.file, content: pages[p.file] }));
    const linkChecks = validateSiteLinks(list);
    // AP035-6.1 describes the welcome page in more detail than any other, and it
    // was the one page nothing looked at.
    const welcome = validateHtml(pages['index.html'], ['welcomeReason', 'welcomeImage']);
    const gallery = validateHtml(pages['galeria.html'], ['image'])[0];
    const contact = validateHtml(pages['contato.html'], ['form'])[0];
    return [
      ...linkChecks,
      ...welcome,
      { ...gallery, label: 'Imagem na Galeria', hint: 'A galeria precisa de ao menos uma imagem com src e alt' },
      { ...contact, label: 'Formulário no Contato', hint: 'A página de contato precisa de um formulário com campo e botão' },
    ];
  }, [pages]);

  const allChecks = useMemo(
    () => [...Object.values(perPage).flat(), ...siteChecks],
    [perPage, siteChecks]
  );
  const passedCount = allChecks.filter(c => c.passed).length;
  const allPassed = passedCount === allChecks.length;

  const handleComplete = async () => {
    setSaving(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: passedCount, total_questions: allChecks.length,
      });
    }
    await logActivity(userId, 'site_lab_completed', { specialtyCode, lessonCode, checksPassed: passedCount, total: allChecks.length });
    /* Entregue, o rascunho não protege mais nada — e o navegador do clube
       costuma ser de todo mundo. */
    descartarRascunho(userId, lessonCode);
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{lessonTitle} — concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Seu site de quatro páginas está estruturado, interligado e com formulário funcionando.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  const errosDe = (arquivo: string) => perPage[arquivo].filter(c => !c.passed).length;

  /*
    Toda verificação vira uma tarefa no painel da moldura — as de estrutura,
    página por página, e as do site inteiro. É o mesmo que o painel de
    Problemas de um editor mostra, e é o que se precisa saber enquanto se
    escreve, não no fim.
  */
  const tarefas = [
    ...PAGES.flatMap(p => perPage[p.file].map(r => ({
      id: `${p.file}:${r.id}`,
      titulo: `${p.file} — ${r.label}`,
      detalhe: r.passed ? undefined : (r.detail || r.hint),
      onde: `Abra ${p.file} na lateral do editor`,
      passos: PASSOS[r.id],
      feita: r.passed,
    }))),
    ...siteChecks.map(r => ({
      id: `site:${r.id}`,
      titulo: r.label,
      detalhe: r.passed ? undefined : (r.detail || r.hint),
      passos: PASSOS[r.id],
      feita: r.passed,
    })),
  ];

  const acoes = (
    <button onClick={handleComplete} disabled={!allPassed || saving}
      className="btn-primary text-sm w-full justify-center disabled:opacity-50">
      {saving ? 'Salvando…' : allPassed ? 'Concluir o laboratório' : `Faltam ${allChecks.length - passedCount}`}
    </button>
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
        <CabecalhoDaIde arquivo={active} projeto={PROJETO} aoAvisar={naoFazParte} />

        <div className="ide-corpo">
          <LateralDaIde
            projeto={PROJETO}
            arquivos={PAGES.map(p => ({ nome: p.file, problemas: errosDe(p.file) }))}
            atual={active}
            aoAbrir={setActive}
            aoAvisar={naoFazParte}
          />

          <div className="ide-painel">
            {/* Uma guia por arquivo, como num editor com quatro abertos. */}
            <div className="ide-guias">
              {PAGES.map(p => (
                <button key={p.file} className="ide-guia" aria-current={p.file === active}
                  onClick={() => setActive(p.file)}>
                  <span style={{ color: '#E37933' }}>◆</span> {p.file}
                  {errosDe(p.file) > 0 && (
                    <span style={{ fontSize: 10.5, color: '#F48771' }}>{errosDe(p.file)}</span>
                  )}
                </button>
              ))}
            </div>

            <AlternadorDaIde vendo={vendo} aoTrocar={setVendo} />

            <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
              <div className={vendo === 'codigo' ? 'ide-lado-codigo' : 'ide-lado-codigo escondido'}>
                <EditorDeCodigo
                  codigo={pages[active]}
                  aoMudar={c => setPages({ ...pages, [active]: c })}
                  rotulo={`Editor de ${active}`}
                />
              </div>
              <div className={vendo === 'previa' ? 'ide-lado-previa' : 'ide-lado-previa escondido'}>
                <PreviaDaIde html={previewCode} arquivo={active} aoAvisar={naoFazParte} />
              </div>
            </div>
          </div>
        </div>

        <StatusDaIde problemas={allChecks.length - passedCount}
          linhas={contarLinhas(pages[active])} aoAvisar={naoFazParte} />
      </div>
    </LaboratorioEmTelaCheia>
  );
}
