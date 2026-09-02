import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logActivity, upsertRequirementProgress, ensureEnrollment, updateEnrollmentActivity, getSpecialtyId, getRequirementId,
  registrarConclusaoDeLicao,
} from '../lib/progress';
import { CheckCircle2, ThumbsUp, ThumbsDown, RotateCw, Share2, MoreVertical } from 'lucide-react';
import LaboratorioEmTelaCheia from '../components/LaboratorioEmTelaCheia';
import {
  CSS_GEMINI, LateralDoGemini, TopoDoGemini, PerguntaDoGemini, RespostaDoGemini,
  CaixaDoGemini, ChipDoGemini,
} from './gemini';
import type { PropsDeLaboratorio as Props } from './tipos';

type Stage = 'text' | 'image' | 'logo' | 'review';

/**
 * Prompts are assembled from fixed options plus one short free field rather than
 * typed freely. Two reasons, in order of importance: the students are minors, and
 * a closed vocabulary means there is no open channel to a generative model; and
 * building a prompt from named parts (subject, audience, tone, length) is what
 * actually teaches prompt writing — a blank box teaches nothing.
 */
const TEXT_OPTIONS = {
  subject: [
    // First on the list because AP035-8.1 asks for this one by name; the others
    // are there so the student still chooses rather than obeys.
    { id: 'importancia', label: 'A importância do Clube de Desbravadores' },
    { id: 'historia', label: 'A história do nosso clube' },
    { id: 'acampamento', label: 'Um acampamento de fim de semana' },
    { id: 'especialidade', label: 'Por que estudar a especialidade de Internet' },
    { id: 'servico', label: 'Um projeto de serviço à comunidade' },
  ],
  audience: [
    { id: 'pais', label: 'para os pais dos desbravadores' },
    { id: 'novos', label: 'para quem quer entrar no clube' },
    { id: 'igreja', label: 'para ser lido na igreja' },
  ],
  tone: [
    { id: 'convite', label: 'em tom de convite' },
    { id: 'informativo', label: 'em tom informativo' },
    { id: 'entusiasmado', label: 'em tom entusiasmado' },
  ],
  length: [
    { id: 'curto', label: 'em 1 parágrafo curto' },
    { id: 'medio', label: 'em 2 parágrafos' },
  ],
};

const IMAGE_OPTIONS = {
  scene: [
    { id: 'barraca', label: 'barracas montadas em um acampamento' },
    { id: 'fogueira', label: 'uma roda de conversa ao redor da fogueira' },
    { id: 'trilha', label: 'um grupo caminhando por uma trilha na mata' },
    { id: 'bandeira', label: 'o mastro com a bandeira do clube' },
  ],
  time: [
    { id: 'manha', label: 'de manhã cedo' },
    { id: 'tarde', label: 'ao fim da tarde' },
    { id: 'noite', label: 'à noite' },
  ],
  style: [
    { id: 'ilustracao', label: 'em estilo de ilustração colorida' },
    { id: 'aquarela', label: 'em estilo aquarela' },
    { id: 'cartoon', label: 'em estilo cartoon' },
  ],
};

const LOGO_OPTIONS = {
  shape: [
    { id: 'escudo', label: 'em formato de escudo' },
    { id: 'circulo', label: 'em formato circular' },
    { id: 'triangulo', label: 'em formato triangular' },
  ],
  symbol: [
    { id: 'arvore', label: 'com uma árvore' },
    { id: 'montanha', label: 'com uma montanha' },
    { id: 'bussola', label: 'com uma bússola' },
    { id: 'chama', label: 'com uma chama' },
  ],
  colors: [
    { id: 'verde', label: 'nas cores verde e dourado' },
    { id: 'azul', label: 'nas cores azul e branco' },
    { id: 'vermelho', label: 'nas cores vermelho e preto' },
  ],
};

const MAX_FREE_TEXT = 60;



export default function AILab({ specialtyCode, lessonCode, lessonTitle, requirementCodes, userId }: Props) {
  const [completed, setCompleted] = useState(false);

  const [textSel, setTextSel] = useState({ subject: 'importancia', audience: 'pais', tone: 'convite', length: 'curto' });
  const [imageSel, setImageSel] = useState({ scene: 'barraca', time: 'tarde', style: 'ilustracao' });
  const [logoSel, setLogoSel] = useState({ shape: 'escudo', symbol: 'arvore', colors: 'verde' });
  const [clubName, setClubName] = useState('');
  const [extra, setExtra] = useState('');

  const [textOut, setTextOut] = useState('');
  const [imageOut, setImageOut] = useState('');
  const [logoOut, setLogoOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notConfigured, setNotConfigured] = useState(false);

  const [critique, setCritique] = useState({ good: '', improve: '' });
  /* O painel que o polegar abre. É nele que a avaliação crítica acontece —
     no botão que o aplicativo já tem, e não num formulário à parte. */
  const [retornoAberto, setRetornoAberto] = useState(false);
  const [polegar, setPolegar] = useState<'cima' | 'baixo' | null>(null);
  const [aviso, setAviso] = useState('');

  const pick = (opts: { id: string; label: string }[], id: string) =>
    opts.find(o => o.id === id)?.label ?? '';

  const textPrompt = useMemo(() => {
    const base = `Escreva um texto ${pick(TEXT_OPTIONS.tone, textSel.tone)} sobre ${pick(TEXT_OPTIONS.subject, textSel.subject).toLowerCase()}, ${pick(TEXT_OPTIONS.audience, textSel.audience)}, ${pick(TEXT_OPTIONS.length, textSel.length)}. Escreva em português do Brasil, com linguagem adequada a adolescentes.`;
    return extra.trim() ? `${base} Inclua também: ${extra.trim()}.` : base;
  }, [textSel, extra]);

  const imagePrompt = useMemo(
    () => `Uma imagem mostrando ${pick(IMAGE_OPTIONS.scene, imageSel.scene)}, ${pick(IMAGE_OPTIONS.time, imageSel.time)}, ${pick(IMAGE_OPTIONS.style, imageSel.style)}. Ambiente de acampamento juvenil, seguro e alegre, sem rostos reconhecíveis.`,
    [imageSel]
  );

  /**
   * The one free field that reaches an image model.
   *
   * Text goes to Gemini, whose safety filters are set to their strictest usable
   * level. Images go to Cloudflare's FLUX, which has no equivalent — so the
   * safety has to come from the input instead. Reducing the name to letters,
   * digits and spaces makes the set of prompts this lab can produce finite and
   * inspectable, rather than trusting a model to refuse something.
   */
  const safeClubName = useMemo(
    () => clubName.normalize('NFC').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 40),
    [clubName]
  );

  const logoPrompt = useMemo(
    () => `Um logotipo simples e limpo para um clube de desbravadores${safeClubName ? ` chamado "${safeClubName}"` : ''}, ${pick(LOGO_OPTIONS.shape, logoSel.shape)}, ${pick(LOGO_OPTIONS.symbol, logoSel.symbol)}, ${pick(LOGO_OPTIONS.colors, logoSel.colors)}. Design vetorial, fundo liso, sem texto.`,
    [logoSel, safeClubName]
  );

  const callAI = async (type: 'text' | 'image', prompt: string): Promise<{ result?: string; error?: string }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: 'Sessão expirada. Entre novamente.' };
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-gateway`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, prompt, userId }),
    });
    const data = await res.json();
    if (data.notConfigured) { setNotConfigured(true); return { error: data.error }; }
    if (!res.ok || data.error) return { error: data.error || 'Erro ao gerar.' };
    return { result: data.result };
  };

  const generate = async (kind: Stage) => {
    setBusy(true); setError('');
    const spec = kind === 'text'
      ? { type: 'text' as const, prompt: textPrompt, set: setTextOut }
      : kind === 'image'
        ? { type: 'image' as const, prompt: imagePrompt, set: setImageOut }
        : { type: 'image' as const, prompt: logoPrompt, set: setLogoOut };

    const { result, error: err } = await callAI(spec.type, spec.prompt);
    if (err) setError(err); else if (result) spec.set(result);
    setBusy(false);
  };

  const canFinish = !!textOut && !!imageOut && !!logoOut
    && critique.good.trim().length >= 15 && critique.improve.trim().length >= 15;

  const handleComplete = async () => {
    setBusy(true);
    const specId = await getSpecialtyId(specialtyCode);
    if (specId) { await ensureEnrollment(userId, specId); await updateEnrollmentActivity(userId, specId); }
    await registrarConclusaoDeLicao(userId, lessonCode);
    for (const reqCode of requirementCodes) {
      const reqId = await getRequirementId(reqCode);
      if (reqId) await upsertRequirementProgress(userId, reqId, {
        status: 'completed', mastery_score: 100, checkpoint_passed: true,
        attempts: 1, correct_count: 3, total_questions: 3,
      });
    }
    await logActivity(userId, 'ai_lab_completed', { specialtyCode, lessonCode,
      critiquePositive: critique.good.slice(0, 200),
      critiqueImprovement: critique.improve.slice(0, 200),
    });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-success)' }} />
        <h1 className="text-2xl font-bold mb-2">{lessonTitle} — concluído!</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Você produziu texto, imagem e logotipo com inteligência artificial — e, mais
          importante, avaliou criticamente o que a ferramenta entregou.
        </p>
        <Link to={`/especialidade/${specialtyCode}`} className="btn-primary">Voltar para a Trilha</Link>
      </div>
    );
  }

  const naoFazParte = (o: string) =>
    setAviso(`${o} existe no Gemini de verdade, e está aqui para a tela ficar igual — mas não faz parte deste exercício.`);

  /*
    A conversa: cada pedido é uma pergunta e uma resposta, na ordem em que
    foram feitos. É esta lista que a tela desenha, e é dela que sai a etapa
    de agora — a primeira que ainda não tem resposta.
  */
  const trocas = [
    { id: 'text' as Stage, prompt: textPrompt, saida: textOut, tipo: 'texto' as const },
    { id: 'image' as Stage, prompt: imagePrompt, saida: imageOut, tipo: 'imagem' as const },
    { id: 'logo' as Stage, prompt: logoPrompt, saida: logoOut, tipo: 'imagem' as const },
  ];
  const daVez = trocas.find(t => !t.saida);

  const tarefas = [
    {
      id: 't1', titulo: 'Pedir um texto sobre o clube', feita: !!textOut,
      onde: 'Monte o pedido nos chips e envie',
      passos: [
        'Na barra de baixo, escolha o assunto, para quem é, o tom e o tamanho.',
        'Repare que o pedido vai sendo escrito ali em cima, frase por frase: é isso que um prompt é.',
        'Se quiser, acrescente um detalhe no campo ao lado.',
        'Clique na setinha azul para enviar.',
      ],
    },
    {
      id: 't2', titulo: 'Pedir uma imagem do clube acampando', feita: !!imageOut,
      onde: 'Os chips mudam para cena, hora e estilo',
      passos: [
        'Depois do texto, os chips passam a pedir a cena, a hora do dia e o estilo.',
        'Escolha os três e envie.',
        'A imagem demora mais que o texto — é normal.',
      ],
    },
    {
      id: 't3', titulo: 'Pedir um logotipo com o nome do clube', feita: !!logoOut,
      onde: 'Escreva o nome do clube no campo do meio',
      passos: [
        'Escreva o nome do seu clube no campo de texto da barra.',
        'Escolha a forma, o símbolo e as cores.',
        'Envie e espere o logotipo chegar.',
      ],
    },
    {
      id: 't4', titulo: 'Dizer o que ficou bom e o que você mudaria', feita: canFinish,
      onde: 'Nos polegares embaixo de qualquer resposta',
      passos: [
        'Embaixo de qualquer resposta há um polegar para cima e um para baixo.',
        'Clique num deles: o Gemini abre um painel perguntando o que você achou.',
        'Escreva o que ficou bom e o que você mudaria — pelo menos uma frase em cada.',
      ],
    },
  ];

  const acoes = (
    <button onClick={handleComplete} disabled={!canFinish || busy}
      className="btn-primary text-sm w-full justify-center disabled:opacity-50">
      {busy ? 'Salvando…' : canFinish ? 'Concluir o laboratório' : `Faltam ${4 - tarefas.filter(t => t.feita).length}`}
    </button>
  );

  const chips = () => {
    if (!daVez) return null;
    if (daVez.id === 'text') return (
      <>
        <ChipDoGemini rotulo="Assunto" opcoes={TEXT_OPTIONS.subject} valor={textSel.subject}
          aoMudar={v => setTextSel({ ...textSel, subject: v })} />
        <ChipDoGemini rotulo="Para quem" opcoes={TEXT_OPTIONS.audience} valor={textSel.audience}
          aoMudar={v => setTextSel({ ...textSel, audience: v })} />
        <ChipDoGemini rotulo="Tom" opcoes={TEXT_OPTIONS.tone} valor={textSel.tone}
          aoMudar={v => setTextSel({ ...textSel, tone: v })} />
        <ChipDoGemini rotulo="Tamanho" opcoes={TEXT_OPTIONS.length} valor={textSel.length}
          aoMudar={v => setTextSel({ ...textSel, length: v })} />
        <input className="gem-detalhe" value={extra} maxLength={MAX_FREE_TEXT}
          onChange={e => setExtra(e.target.value)} aria-label="Detalhe extra"
          placeholder="detalhe (opcional)" />
      </>
    );
    if (daVez.id === 'image') return (
      <>
        <ChipDoGemini rotulo="Cena" opcoes={IMAGE_OPTIONS.scene} valor={imageSel.scene}
          aoMudar={v => setImageSel({ ...imageSel, scene: v })} />
        <ChipDoGemini rotulo="Hora" opcoes={IMAGE_OPTIONS.time} valor={imageSel.time}
          aoMudar={v => setImageSel({ ...imageSel, time: v })} />
        <ChipDoGemini rotulo="Estilo" opcoes={IMAGE_OPTIONS.style} valor={imageSel.style}
          aoMudar={v => setImageSel({ ...imageSel, style: v })} />
      </>
    );
    return (
      <>
        <input className="gem-detalhe" value={clubName} maxLength={40}
          onChange={e => setClubName(e.target.value)} aria-label="Nome do clube"
          placeholder="nome do clube" />
        <ChipDoGemini rotulo="Forma" opcoes={LOGO_OPTIONS.shape} valor={logoSel.shape}
          aoMudar={v => setLogoSel({ ...logoSel, shape: v })} />
        <ChipDoGemini rotulo="Símbolo" opcoes={LOGO_OPTIONS.symbol} valor={logoSel.symbol}
          aoMudar={v => setLogoSel({ ...logoSel, symbol: v })} />
        <ChipDoGemini rotulo="Cores" opcoes={LOGO_OPTIONS.colors} valor={logoSel.colors}
          aoMudar={v => setLogoSel({ ...logoSel, colors: v })} />
      </>
    );
  };

  const polegares = (
    <>
      <button aria-label="Boa resposta" aria-pressed={polegar === 'cima'}
        onClick={() => { setPolegar('cima'); setRetornoAberto(true); }}>
        <ThumbsUp className="w-4 h-4" />
      </button>
      <button aria-label="Resposta ruim" aria-pressed={polegar === 'baixo'}
        onClick={() => { setPolegar('baixo'); setRetornoAberto(true); }}>
        <ThumbsDown className="w-4 h-4" />
      </button>
      <button aria-label="Compartilhar" onClick={() => naoFazParte('Compartilhar')}>
        <Share2 className="w-4 h-4" />
      </button>
      <button aria-label="Gerar de novo" onClick={() => naoFazParte('Gerar a resposta de novo')}>
        <RotateCw className="w-4 h-4" />
      </button>
      <button aria-label="Mais opções" onClick={() => naoFazParte('O menu de opções da resposta')}>
        <MoreVertical className="w-4 h-4" />
      </button>
    </>
  );

  return (
    <LaboratorioEmTelaCheia
      trilha={specialtyCode}
      voltarPara={`/especialidade/${specialtyCode}`}
      titulo={lessonTitle}
      programa="gemini"
      tarefas={tarefas}
      aviso={aviso || error}
      acoes={acoes}
      /* A cápsula sobe para não tapar Ajuda e Configurações, que no Gemini
         ficam no pé da barra lateral — no mesmo canto que ela ocupa. */
      rodape={72}
    >
      <style>{CSS_GEMINI}</style>

      <div className="gem">
        <LateralDoGemini
          conversas={['Imagens para o site do clube', 'Ideias de programação', 'Versos para o culto']}
          atual={0}
          aoAvisar={naoFazParte}
        />

        <div className="gem-palco">
          <TopoDoGemini inicial="D" aoAvisar={naoFazParte} />

          <div className="gem-fluxo">
            <div className="gem-centro">
              {!textOut && !busy && (
                <>
                  <p className="gem-saudacao">Olá, desbravador</p>
                  <p className="gem-subsaudacao">
                    Monte o pedido nos botões abaixo. Um pedido bem feito é o que
                    separa uma resposta útil de uma resposta qualquer.
                  </p>
                </>
              )}

              {notConfigured && (
                <div className="gem-retorno" style={{ marginTop: 20 }}>
                  <h4>A integração com IA ainda não foi ativada</h4>
                  <p style={{ fontSize: 13.5, color: '#444746', margin: 0 }}>
                    Falta cadastrar a chave no servidor. Enquanto isso dá para montar
                    os pedidos e ver como um prompt é construído, parte por parte.
                  </p>
                </div>
              )}

              {trocas.filter(t => t.saida).map(t => (
                <div key={t.id}>
                  <PerguntaDoGemini texto={t.prompt} />
                  <RespostaDoGemini acoes={polegares}>
                    {t.tipo === 'texto'
                      ? t.saida.split('\n').filter(Boolean).map((par, i) => <p key={i}>{par}</p>)
                      : <img src={t.saida} alt={t.id === 'image' ? 'Imagem gerada do clube acampando' : 'Logotipo gerado para o clube'} />}
                  </RespostaDoGemini>
                </div>
              ))}

              {busy && daVez && (
                <div>
                  <PerguntaDoGemini texto={daVez.prompt} />
                  <RespostaDoGemini carregando />
                </div>
              )}

              {/* O painel de retorno do próprio Gemini, onde mora a avaliação. */}
              {retornoAberto && (
                <div className="gem-retorno">
                  <h4>
                    {polegar === 'cima' ? 'Que bom que ajudou. ' : 'Obrigado pelo retorno. '}
                    Conte um pouco mais:
                  </h4>
                  <label className="gem-rotulo" htmlFor="gem-bom">O que ficou bom no que a IA entregou?</label>
                  <textarea id="gem-bom" className="gem-campo" value={critique.good}
                    onChange={e => setCritique({ ...critique, good: e.target.value })}
                    placeholder="ex.: o texto explicou o que o clube faz sem enrolar" />
                  <label className="gem-rotulo" htmlFor="gem-mudar" style={{ marginTop: 12 }}>
                    O que você mudaria antes de usar de verdade?
                  </label>
                  <textarea id="gem-mudar" className="gem-campo" value={critique.improve}
                    onChange={e => setCritique({ ...critique, improve: e.target.value })}
                    placeholder="ex.: trocaria o final, que ficou parecendo propaganda" />
                  <p style={{ fontSize: 12, color: '#6B7075', marginTop: 10 }}>
                    Pelo menos uma frase em cada. É esta parte que o requisito chama de
                    avaliação crítica — e é ela que separa usar a IA de obedecer a ela.
                  </p>
                </div>
              )}
            </div>
          </div>

          <CaixaDoGemini
            prompt={daVez ? daVez.prompt : 'Os três pedidos foram feitos. Avalie as respostas nos polegares acima.'}
            podeEnviar={!!daVez}
            enviando={busy}
            aoEnviar={() => daVez && generate(daVez.id)}
            aoAvisar={naoFazParte}
          >
            {chips()}
          </CaixaDoGemini>
        </div>
      </div>
    </LaboratorioEmTelaCheia>
  );
}
