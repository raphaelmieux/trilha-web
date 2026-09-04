import { useMemo, useState } from 'react';
import {
  CheckCircle2, CircleX, ArrowLeft, RefreshCw, AlertTriangle, BookOpen,
} from 'lucide-react';
import { embaralharQuestao } from '../lib/questoes';
import { checkAnswer } from '../lib/checkAnswer';
import { porqueDaEscolha } from '../lib/porque';
import { LIMIAR_DOMINIO } from '../lib/progress';
import QuestionRenderer from './questions/QuestionRenderer';
import { realcarLinhas } from '../labs/realce';
import type { RespostaDaQuestao } from '../types';
import { nomeCompleto } from '../types';
import type { Vereda, LicaoDeVereda } from '../curriculum/veredas';

/*
 * Uma lição de teoria da vereda.
 *
 * ── Por que deixou de ser o leitor ───────────────────────────────────────
 * A teoria abria o leitor de referência em tela cheia, escuro, com sumário e
 * setas: a pessoa entrava numa coisa que não se parecia com nenhuma lição da
 * plataforma e saía por um X. E vencia a lição rolando até o fim, o que mede
 * rolagem, e não entendimento.
 *
 * Aqui ela é uma lição como as das trilhas: o conteúdo primeiro, as questões
 * depois, o botão de concluir no fim, e o mesmo `QuestionRenderer` que a
 * trilha usa. O leitor continua existindo — como referência, por cima do
 * editor, que é o papel dele.
 *
 * ── O exemplo continua rodando ───────────────────────────────────────────
 * Cada tópico traz o código com o realce do editor e o resultado num iframe
 * sem `allow-scripts`. Ler marcação sem ver o que ela faz é decorar.
 */

const CSS_TEORIA = `
  .teo-topico + .teo-topico { margin-top: 22px; padding-top: 22px; border-top: 1px solid var(--color-border); }
  .teo-topico h3 { font-size: 17px; font-weight: 700; color: var(--color-text); margin-bottom: 8px; }
  /* Sem limite de largura: o texto ocupa o bloco inteiro, como nas lições das
     trilhas. Com um limite em ch, ele parava mais ou menos onde acaba a
     primeira caixa do exemplo, e a página parecia ter uma coluna invisível que
     nada explicava — pior justamente nos tópicos com exemplo, que é onde a
     borda da caixa dá ao acaso a aparência de regra. */
  .teo-topico p { font-size: 14.5px; line-height: 1.65; color: var(--color-text-muted); margin-bottom: 9px; }
  .teo-marcas { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
  .teo-marca {
    font-family: 'Cascadia Code', Consolas, monospace; font-size: 11.5px;
    padding: 1px 8px; border-radius: 10px;
    background: var(--color-bg-hover); color: var(--color-secondary);
  }
  .teo-atencao {
    display: flex; gap: 9px; padding: 10px 12px; border-radius: 8px;
    background: var(--color-warning-a10); color: var(--color-secondary);
    font-size: 13.5px; line-height: 1.55; margin: 4px 0 14px;
  }
  .teo-dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
  .teo-caixa { border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
  .teo-caixa-topo {
    padding: 5px 10px; background: var(--color-bg-hover); font-size: 11px;
    letter-spacing: .06em; text-transform: uppercase; color: var(--color-text-dim);
  }
  /* O bloco de código guarda a paleta do editor mesmo aqui, na tela clara da
     plataforma: o exemplo tem de ter as cores que a pessoa vai ver ao digitar
     a mesma coisa lá. */
  .teo-codigo {
    margin: 0; padding: 10px 12px; overflow-x: auto; background: #1E1E1E; color: #D4D4D4;
    font-family: 'Cascadia Code', Consolas, 'Courier New', monospace;
    font-size: 12.5px; line-height: 19px; white-space: pre;
  }
  .teo-caixa iframe { display: block; width: 100%; height: 180px; border: none; background: #FFFFFF; }
  @media (max-width: 720px) { .teo-dupla { grid-template-columns: 1fr; } }
`;

function Exemplo({ html, titulo, roda }: { html: string; titulo: string; roda: boolean }) {
  const pagina = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body { font: 15px/1.5 system-ui, 'Segoe UI', Roboto, sans-serif; color: #201F1E;
      margin: 12px; background: #FFFFFF; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #B9B9B9; padding: 4px 9px; text-align: left; }
    caption { text-align: left; padding-bottom: 5px; font-weight: 600; }
    img { max-width: 130px; border-radius: 4px; background: #EDEDED; }
    nav a { margin-right: 10px; }
    input, button { font: inherit; padding: 3px 7px; }
  </style></head><body>${html}</body></html>`;

  return (
    <div className={roda ? 'teo-dupla' : ''}>
      <div className="teo-caixa">
        <p className="teo-caixa-topo">Você escreve</p>
        <pre className="teo-codigo">
          {realcarLinhas(html).map((l, i) => (
            <div key={i} dangerouslySetInnerHTML={{ __html: l || '&nbsp;' }} />
          ))}
        </pre>
      </div>
      {roda && (
        <div className="teo-caixa">
          <p className="teo-caixa-topo">O navegador mostra</p>
          <iframe srcDoc={pagina} sandbox="" title={`Resultado: ${titulo}`} />
        </div>
      )}
    </div>
  );
}

export default function TeoriaDaVereda({ vereda, licao, aoVencer, aoSair }: {
  vereda: Vereda;
  licao: Extract<LicaoDeVereda, { tipo: 'teoria' }>;
  /** Chamado uma vez, quando a lição é concluída com nota suficiente. */
  aoVencer: () => Promise<void> | void;
  aoSair: () => void;
}) {
  const questoes = useMemo(() => licao.questoes.map(embaralharQuestao), [licao]);
  const [respostas, setRespostas] = useState<Record<string, RespostaDaQuestao>>({});
  const [mostrando, setMostrando] = useState<Record<string, boolean>>({});
  const [nota, setNota] = useState<{ certas: number; total: number } | null>(null);
  const [gravando, setGravando] = useState(false);

  const responder = (id: string, resposta: RespostaDaQuestao) => {
    setRespostas(a => ({ ...a, [id]: resposta }));
    setMostrando(f => ({ ...f, [id]: true }));
  };

  const tudoRespondido = questoes.length > 0 && questoes.every(q => respostas[q.id] !== undefined);
  const certas = questoes.filter(q => checkAnswer(q, respostas[q.id])).length;
  const percentual = questoes.length ? Math.round((certas / questoes.length) * 100) : 0;

  const concluir = async () => {
    setGravando(true);
    /* A lição só é vencida a partir do limiar de domínio, o mesmo das trilhas.
       Abaixo dele a pessoa refaz — e o que ela já respondeu certo continua
       valendo como aprendizado, mas não como conclusão. */
    if (percentual >= LIMIAR_DOMINIO) await aoVencer();
    setGravando(false);
    setNota({ certas, total: questoes.length });
  };

  const refazer = () => {
    setRespostas({});
    setMostrando({});
    setNota(null);
  };

  const passou = nota !== null && Math.round((nota.certas / nota.total) * 100) >= LIMIAR_DOMINIO;

  return (
    <div className="space-y-4">
      <style>{CSS_TEORIA}</style>

      <button onClick={aoSair} className="flex items-center gap-1.5 text-sm"
        style={{ color: 'var(--color-text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> {nomeCompleto(vereda)}
      </button>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
          <h1 className="text-2xl font-bold">{licao.titulo}</h1>
        </div>
        <p style={{ color: 'var(--color-text-muted)' }}>{licao.resumo}</p>
      </div>

      <div className="card p-6">
        {licao.topicos.map(t => (
          <div className="teo-topico" key={t.id}>
            <h3>{t.titulo}</h3>
            <div className="teo-marcas">
              {t.marcas.map(m => <span className="teo-marca" key={m}>{m}</span>)}
            </div>
            {t.explicacao.map((paragrafo, i) => <p key={i}>{paragrafo}</p>)}
            {t.atencao && (
              <p className="teo-atencao">
                <AlertTriangle className="w-4 h-4 flex-none" style={{ marginTop: 1 }} />
                {t.atencao}
              </p>
            )}
            <Exemplo html={t.exemplo} titulo={t.titulo} roda={vereda.mostraResultado} />
          </div>
        ))}
      </div>

      {questoes.map((q, i) => (
        <div key={q.id} className="card p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary-a20)', color: 'var(--color-primary)' }}>
              {i + 1}
            </span>
            <p className="font-medium pt-0.5" style={{ color: 'var(--color-text)' }}>{q.prompt}</p>
          </div>
          <QuestionRenderer
            question={q}
            answer={respostas[q.id]}
            showFeedback={mostrando[q.id]}
            onAnswer={resposta => responder(q.id, resposta)}
          />
          {mostrando[q.id] && q.explanation && (
            <div className="mt-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: checkAnswer(q, respostas[q.id]) ? 'var(--color-success-a10)' : 'var(--color-error-a10)',
                color: checkAnswer(q, respostas[q.id]) ? 'var(--color-success)' : 'var(--color-error)',
              }}>
              <div className="flex items-start gap-2">
                {checkAnswer(q, respostas[q.id])
                  ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  : <CircleX className="w-5 h-5 flex-shrink-0" />}
                <div>
                  {/* Primeiro o que houve com a escolha, depois a explicação:
                      quem errou precisa saber o que confundiu antes de ler a
                      definição correta. */}
                  {porqueDaEscolha(q, respostas[q.id]) && (
                    <p className="mb-1.5 font-medium">{porqueDaEscolha(q, respostas[q.id])}</p>
                  )}
                  <p>{q.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {nota === null && questoes.length > 0 && (
        <button onClick={concluir} disabled={!tudoRespondido || gravando}
          className="btn-primary w-full">
          {gravando ? 'Registrando…' : tudoRespondido ? 'Concluir a lição' : 'Responda todas as questões'}
        </button>
      )}

      {nota !== null && (
        <div className="card p-6 text-center">
          {passou
            ? <CheckCircle2 className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-success)' }} />
            : <RefreshCw className="w-16 h-16 mx-auto mb-3" style={{ color: 'var(--color-secondary)' }} />}
          <h2 className="text-xl font-bold mb-2">
            {passou ? 'Lição vencida!' : 'Ainda falta pouco'}
          </h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Você acertou {nota.certas} de {nota.total} {nota.total === 1 ? 'questão' : 'questões'} ({Math.round((nota.certas / nota.total) * 100)}%).
          </p>
          {!passou && (
            <p className="mt-2 text-sm" style={{ color: 'var(--color-secondary)' }}>
              São necessários {LIMIAR_DOMINIO}% para vencer a lição. Releia o que ficou
              confuso — as explicações acima ficaram à mostra — e refaça.
            </p>
          )}
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {!passou && (
              <button onClick={refazer} className="btn-primary">
                <RefreshCw className="w-4 h-4 mr-1" /> Refazer a lição
              </button>
            )}
            <button onClick={aoSair} className={passou ? 'btn-primary' : 'btn-secondary'}>
              Voltar para a vereda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
