import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { TextoDaLicao } from './TextoDaLicao';
import type { TelaDoExemplo } from '../../curriculum/veredas';

/**
 * Uma operação mostrada no programa, tela por tela.
 *
 * ── Por que telas, e não um quadro de texto ──────────────────────────────
 * O exemplo das veredas que não escrevem código era um bloco de texto puro em
 * fonte de máquina de escrever: uma tabela desenhada com traços, uma seta
 * entre duas palavras, "Inserir › Tabela" escrito como se fosse a tela. Ele
 * imitava o arranjo do W3Schools — explicação em cima, exemplo embaixo — sem
 * ter o que aquele arranjo tem de bom, que é o exemplo **rodar**. Repetia o
 * parágrafo de cima em outro formato, e quem o lia não via o programa.
 *
 * O que ensina uma operação de programa é ver o programa fazendo: o menu
 * aberto, o botão onde ele está, o documento antes e depois. Cada imagem aqui
 * é a janela do laboratório que vem logo em seguida, então o que a pessoa vê
 * na lição é o que ela encontra quando abre o exercício.
 *
 * ── Uma tela por vez ─────────────────────────────────────────────────────
 * Empilhadas, quatro capturas de janela inteira dariam três mil pixels de
 * rolagem no meio de um tópico, e a explicação de baixo sumiria atrás delas.
 * Uma por vez, com o número do passo e as setas, é como todo tutorial de
 * programa se lê. As imagens ficam todas montadas, sobrepostas na mesma célula
 * da grade: trocar de passo não espera download, e a caixa não muda de altura
 * a cada clique, o que faria a página pular embaixo do dedo de quem está
 * lendo no celular.
 */
export function PassoAPasso({ telas, titulo }: { telas: TelaDoExemplo[]; titulo: string }) {
  const [atual, setAtual] = useState(0);
  const total = telas.length;
  const caminho = (t: TelaDoExemplo) => `${import.meta.env.BASE_URL}assets/exemplos/${t.imagem}`;

  return (
    <figure className="pp-caixa" aria-label={`${titulo}: ${total === 1 ? 'tela do programa' : `${total} telas do programa`}`}>
      <style>{CSS_PASSO_A_PASSO}</style>
      <div className="pp-topo">
        <span>{total === 1 ? 'No programa' : 'No programa, passo a passo'}</span>
        {total > 1 && <span aria-live="polite">Passo {atual + 1} de {total}</span>}
      </div>

      <div className="pp-pilha">
        {telas.map((t, i) => (
          /* A imagem abre inteira noutra guia: no celular a janela encolhe até
             a letra da faixa ficar pequena, e é ali que alguém vai querer ler
             o nome do botão. */
          <a key={t.imagem} href={caminho(t)} target="_blank" rel="noopener noreferrer"
            className={i === atual ? 'pp-tela pp-ativa' : 'pp-tela'}
            aria-hidden={i !== atual} tabIndex={i === atual ? 0 : -1}
            title="Abrir a imagem inteira">
            <img src={caminho(t)} alt={t.descricao} loading="lazy" decoding="async" />
            {/* No celular a janela inteira cabe em 360 px e o nome do botão
                fica pequeno; o ícone diz que tocar abre a imagem inteira. */}
            <span className="pp-ampliar" aria-hidden="true"><Maximize2 className="w-4 h-4" /></span>
          </a>
        ))}
      </div>

      <figcaption className="pp-legenda">
        {total > 1 && <span className="pp-numero" aria-hidden="true">{atual + 1}</span>}
        <TextoDaLicao texto={telas[atual].legenda} />
      </figcaption>

      {total > 1 && (
        <div className="pp-navegacao">
          <button type="button" onClick={() => setAtual(a => a - 1)} disabled={atual === 0}>
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <div className="pp-pontos">
            {telas.map((t, i) => (
              <button key={t.imagem} type="button" onClick={() => setAtual(i)}
                aria-label={`Ir para o passo ${i + 1}`} aria-current={i === atual ? 'step' : undefined}
                className={i === atual ? 'pp-ponto pp-ponto-atual' : 'pp-ponto'} />
            ))}
          </div>
          <button type="button" onClick={() => setAtual(a => a + 1)} disabled={atual === total - 1}>
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </figure>
  );
}

const CSS_PASSO_A_PASSO = `
  .pp-caixa { margin: 14px 0 4px; border: 1px solid var(--color-border); border-radius: 10px; overflow: hidden; }
  .pp-topo {
    display: flex; justify-content: space-between; gap: 10px; padding: 6px 12px;
    background: var(--color-bg-hover); font-size: 11px; letter-spacing: .06em;
    text-transform: uppercase; color: var(--color-text-dim);
  }
  /* Todas na mesma célula: a mais alta dá a altura, e trocar de passo não
     empurra o texto de baixo. */
  .pp-pilha { display: grid; background: #1D1D1D; }
  .pp-tela { grid-area: 1 / 1; visibility: hidden; display: block; position: relative; }
  .pp-ampliar {
    position: absolute; right: 8px; bottom: 8px; display: grid; place-items: center;
    width: 30px; height: 30px; border-radius: 6px; background: rgba(0,0,0,.6); color: #FFFFFF;
  }
  .pp-tela.pp-ativa { visibility: visible; }
  .pp-tela img { display: block; width: 100%; height: auto; }
  .pp-legenda {
    display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px 8px;
    font-size: 14px; line-height: 1.5; color: var(--color-text);
  }
  .pp-numero {
    flex: none; width: 22px; height: 22px; border-radius: 50%; margin-top: 1px;
    display: grid; place-items: center; font-size: 12px; font-weight: 700;
    background: var(--color-primary); color: #FFFFFF;
  }
  .pp-navegacao {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 4px 8px 10px;
  }
  .pp-navegacao > button {
    display: flex; align-items: center; gap: 4px; padding: 6px 10px; border-radius: 6px;
    font-size: 13px; color: var(--color-text-muted); background: var(--color-bg-hover);
  }
  .pp-navegacao > button:disabled { opacity: .35; cursor: default; }
  .pp-pontos { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
  .pp-ponto { width: 9px; height: 9px; border-radius: 50%; background: var(--color-border); }
  .pp-ponto-atual { background: var(--color-primary); }
`;
