/**
 * As peças do caderno da análise.
 *
 * O caderno é a folha ao lado da planilha: a tela em que a análise de verdade
 * acontece, e que nenhum programa imitado tem. Ele nasceu dentro de
 * `LaboratorioDaAnalise.tsx`, privado à CC-ES009, e saiu daqui no dia em que a
 * CC-ES010 precisou do mesmo cartão, do mesmo campo longo e da mesma escolha —
 * **antes** de a cópia existir, que é a decisão de `word.tsx`, `excel.tsx`,
 * `explorer.tsx`, `leitorDePdf.tsx` e `correio.tsx`.
 *
 * A regra de extrair antes é das janelas, porque duas cópias divergem à vista.
 * Vale aqui pelo mesmo motivo e com mais força: a CC-ES009 e a CC-ES010 são
 * veredas vizinhas, e quem acabou de percorrer uma entra na outra. Dois
 * cadernos ligeiramente diferentes seriam a plataforma dizendo que são dois
 * lugares.
 *
 * ── O que fica aqui, e o que fica no laboratório ─────────────────────────
 * Aqui mora o que é do **caderno**: como um cartão se desenha, como um campo
 * longo relata o que falta, como uma escolha mostra qual está marcada. No
 * laboratório fica o que é do **exercício**: que perguntas o caderno faz e o
 * que se cobra das respostas. Nenhuma peça guarda estado — uma escolha com
 * estado próprio obrigaria os dois lados a concordar sobre a mesma marcação,
 * que é a forma mais rápida de mostrarem coisas diferentes.
 */

import type React from 'react';

/** Um bloco do caderno, com título e uma linha de contexto. */
export function Cartao({ titulo, abaixo, children }: {
  titulo: string; abaixo?: string; children: React.ReactNode;
}) {
  return (
    <section className="card p-4">
      <h2 className="text-base font-bold mb-1">{titulo}</h2>
      {abaixo && (
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>{abaixo}</p>
      )}
      {children}
    </section>
  );
}

/**
 * O campo longo diz quanto já tem escrito, e quanto falta.
 *
 * Ele não é enfeite: as metas que leem estes campos medem tamanho — quarenta
 * letras para uma justificativa, uma página para a conclusão —, e uma tarefa
 * que fica vermelha sem dizer por que mede paciência. O contador relata o
 * número; quem decide o que escrever é quem escreve.
 */
export function CampoLongo({ rotulo, ajuda, valor, minimo, maximo, aoEscrever }: {
  rotulo: string;
  ajuda?: string;
  valor: string;
  minimo: number;
  maximo?: number;
  aoEscrever: (t: string) => void;
}) {
  const quantas = valor.trim().length;
  const curto = quantas < minimo;
  const comprido = maximo !== undefined && quantas > maximo;
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">{rotulo}</span>
      {ajuda && (
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{ajuda}</span>
      )}
      <textarea
        className="input-field text-sm" rows={maximo === undefined ? 3 : 8}
        value={valor} onChange={e => aoEscrever(e.target.value)}
      />
      <span className="text-xs" style={{
        color: curto || comprido ? 'var(--color-warning)' : 'var(--color-text-dim)',
      }}>
        {quantas} {maximo === undefined ? `de ${minimo} letras no mínimo` : `de ${maximo} letras no máximo`}
      </span>
    </label>
  );
}

export interface Opcao<T extends string> {
  id: T;
  rotulo: string;
  abaixo?: string;
}

/** Uma escolha entre alternativas, com o porquê de cada errada. */
export function Escolha<T extends string>({ opcoes, escolhida, aoEscolher, porque }: {
  opcoes: Opcao<T>[];
  escolhida: T | undefined;
  aoEscolher: (id: T) => void;
  porque?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {opcoes.map(o => (
        <button
          key={o.id} type="button"
          onClick={() => aoEscolher(o.id)}
          aria-pressed={escolhida === o.id}
          className="text-left text-sm rounded-lg px-3 py-2"
          style={{
            border: `1px solid ${escolhida === o.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: escolhida === o.id ? 'var(--color-bg-hover)' : 'transparent',
          }}
        >
          <span className="font-semibold">{o.rotulo}</span>
          {o.abaixo && (
            <span className="block text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {o.abaixo}
            </span>
          )}
        </button>
      ))}
      {porque && (
        <p className="text-sm mt-1" style={{ color: 'var(--color-warning)' }}>{porque}</p>
      )}
    </div>
  );
}

/**
 * A mesma escolha, com mais de uma marcada.
 *
 * Ela existe porque há pergunta de caderno cuja resposta é um **conjunto** —
 * as três providências do requisito 8 da CC-ES010 —, e porque a resposta
 * errada mais comum ali é marcar todas. Desenhada com `Escolha`, cada clique
 * desmarcaria a anterior e o conjunto seria impossível de montar; desenhada
 * com caixas de marcar nativas, ela deixaria de parecer a escolha de cima, e
 * a pessoa teria de aprender duas gramáticas de resposta no mesmo caderno.
 *
 * O clique alterna, e é o que uma lista de marcar faz: desmarcar o que se
 * marcou por engano não pode exigir recomeçar a lista.
 */
export function EscolhaMultipla<T extends string>({ opcoes, marcadas, aoAlternar, porque }: {
  opcoes: Opcao<T>[];
  marcadas: readonly T[];
  aoAlternar: (id: T) => void;
  porque?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {opcoes.map((o) => {
        const marcada = marcadas.includes(o.id);
        return (
          <button
            key={o.id} type="button"
            onClick={() => aoAlternar(o.id)}
            aria-pressed={marcada}
            className="text-left text-sm rounded-lg px-3 py-2 flex gap-2 items-start"
            style={{
              border: `1px solid ${marcada ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: marcada ? 'var(--color-bg-hover)' : 'transparent',
            }}
          >
            {/*
              O quadradinho é o que diz que esta lista aceita mais de uma. Sem
              ele, a fileira é idêntica à de escolha única e quem a olha supõe
              que o segundo clique desfaz o primeiro — e aí marca uma, lê a
              lista e vai embora com uma só.
            */}
            <span
              aria-hidden="true"
              className="mt-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center text-xs font-bold"
              style={{
                border: `1px solid ${marcada ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: marcada ? 'var(--color-primary)' : 'transparent',
                color: 'var(--color-bg)',
              }}
            >
              {marcada ? '✓' : ''}
            </span>
            <span>
              <span className="font-semibold">{o.rotulo}</span>
              {o.abaixo && (
                <span className="block text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {o.abaixo}
                </span>
              )}
            </span>
          </button>
        );
      })}
      {porque && (
        <p className="text-sm mt-1" style={{ color: 'var(--color-warning)' }}>{porque}</p>
      )}
    </div>
  );
}
