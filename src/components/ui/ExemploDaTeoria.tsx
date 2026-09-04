import { realcarLinhas, realcarLinhasCss } from '../../labs/realce';
import { lerExemploDeBlocos, COR_DA_CATEGORIA } from '../../labs/blocosDoScratch';
import type { TopicoDeVereda } from '../../curriculum/veredas';

/**
 * O exemplo de um tópico de teoria, desenhado do jeito que o assunto pede.
 *
 * ── O que estava errado ──────────────────────────────────────────────────
 * Havia um desenho só, e ele era o do W3Schools: "você escreve" à esquerda, "o
 * navegador mostra" à direita. Serve ao HTML, que foi onde a vereda nasceu, e
 * não serve a mais nada — e mesmo assim era aplicado a tudo.
 *
 * Na CC001 nenhum exemplo é HTML: uns são algoritmos em português, outros são
 * pilhas de blocos do Scratch. O realce de HTML não achava tag nenhuma e não
 * pintava nada, e o quadro do navegador exibia o texto do algoritmo como
 * parágrafo. Na CC-FE002 os exemplos são regras de CSS, e o quadro do navegador
 * mostrava a regra escrita na tela, porque uma folha de estilo posta dentro do
 * `<body>` é só texto.
 *
 * ── O que decide o desenho ───────────────────────────────────────────────
 * O tópico diz. Não se adivinha pelo conteúdo: adivinhar erraria justamente nos
 * casos mistos — um exemplo da CC-FE002 que mostra o `<link>` do HTML, um da
 * CC001 que compara texto e blocos na mesma caixa. Quem escreveu a lição sabe o
 * que está mostrando, e `exemploComo` é onde isso fica dito.
 */

const CSS_EXEMPLO = `
  .ex-dupla { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
  .ex-caixa { border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; }
  .ex-caixa-topo {
    padding: 5px 10px; background: var(--color-bg-hover); font-size: 11px;
    letter-spacing: .06em; text-transform: uppercase; color: var(--color-text-dim);
  }
  /* O bloco de código guarda a paleta do editor mesmo aqui, na tela clara da
     plataforma: o exemplo tem de ter as cores que a pessoa vai ver ao digitar
     a mesma coisa lá. */
  .ex-codigo {
    margin: 0; padding: 10px 12px; overflow-x: auto; background: #1E1E1E; color: #D4D4D4;
    font-family: 'Cascadia Code', Consolas, 'Courier New', monospace;
    font-size: 12.5px; line-height: 19px; white-space: pre;
  }
  .ex-caixa iframe { display: block; width: 100%; height: 180px; border: none; background: #FFFFFF; }

  /* ── Os blocos do Scratch ──────────────────────────────────────────────
     Fundo claro e cinza, como a área de scripts do Scratch: os blocos são
     coloridos e saturados, e sobre fundo escuro eles perdem justamente o que
     os distingue uns dos outros. */
  /* Cor dita à mão, e não pelo tema: a plataforma é escura e pinta o texto de
     quase branco, o que some sobre este fundo claro. É a regra que já valeu
     para os painéis brancos dos laboratórios. */
  .ex-palco { padding: 12px 14px; background: #F9F9F9; display: flex; flex-direction: column; gap: 3px; }
  .ex-bloco {
    display: inline-flex; align-items: center; align-self: flex-start;
    padding: 6px 12px; border-radius: 4px; color: #FFFFFF;
    font-family: 'Segoe UI', system-ui, Roboto, sans-serif;
    font-size: 12.5px; font-weight: 600; line-height: 1.3;
    box-shadow: 0 1px 0 rgba(0,0,0,.18); max-width: 100%;
  }
  /* O chapéu do Scratch é redondo em cima e reto embaixo — é a forma que diz
     "aqui começa", e é por ela que se reconhece o topo de uma pilha. */
  .ex-bloco.chapeu { border-radius: 14px 14px 4px 4px; padding-top: 9px; }
  .ex-texto {
    font-family: 'Segoe UI', system-ui, Roboto, sans-serif; font-size: 12.5px;
    color: #5A5A5A; padding: 2px 0;
  }
  /* O exemplo em texto puro: papel claro, tinta escura, e nada de tema. */
  .ex-codigo.claro { background: #F9F9F9; color: #1B1B1B; }
  .ex-vazia { height: 8px; }

  @media (max-width: 720px) { .ex-dupla { grid-template-columns: 1fr; } }
`;

/** A pilha de blocos, com a cor da categoria e o recuo do aninhamento. */
function Blocos({ exemplo }: { exemplo: string }) {
  return (
    <div className="ex-palco">
      {lerExemploDeBlocos(exemplo).map((linha, i) => {
        if (linha.tipo === 'vazia') return <div key={i} className="ex-vazia" />;
        if (linha.tipo === 'texto') return <p key={i} className="ex-texto">{linha.texto}</p>;
        return (
          <span key={i}
            className={`ex-bloco${linha.chapeu ? ' chapeu' : ''}`}
            style={{
              background: COR_DA_CATEGORIA[linha.categoria],
              /* O recuo é o aninhamento: no Scratch o que está dentro da boca
                 de um laço aparece deslocado para a direita. */
              marginLeft: linha.recuo * 18,
            }}>
            {linha.texto}
          </span>
        );
      })}
    </div>
  );
}

const Codigo = ({ linhas }: { linhas: string[] }) => (
  <pre className="ex-codigo">
    {linhas.map((l, i) => <div key={i} dangerouslySetInnerHTML={{ __html: l || '&nbsp;' }} />)}
  </pre>
);

const ESTILO_DA_PAGINA = `
  body { font: 15px/1.5 system-ui, 'Segoe UI', Roboto, sans-serif; color: #201F1E;
    margin: 12px; background: #FFFFFF; }
  table { border-collapse: collapse; }
  th, td { border: 1px solid #B9B9B9; padding: 4px 9px; text-align: left; }
  caption { text-align: left; padding-bottom: 5px; font-weight: 600; }
  img { max-width: 130px; border-radius: 4px; background: #EDEDED; }
  nav a { margin-right: 10px; }
  input, button { font: inherit; padding: 3px 7px; }
`;

/*
  Marcação que só tem `<head>` não desenha nada.

  O exemplo do `<link rel="stylesheet">` é assim, e o quadro do navegador saía
  branco e vazio ao lado dele — a mesma promessa não cumprida que este arquivo
  veio desfazer, só que em branco em vez de errada. Sem nada a mostrar, não há
  quadro.
*/
const SO_DE_CABECALHO = /^(?:\s|<\/?(?:head|link|meta|title|style|script|base)\b[^>]*>|<!--[\s\S]*?-->)*$/i;

/* Local: um módulo que exporta qualquer coisa além de componente perde o
   Fast Refresh inteiro. */
const mostraAlgo = (html: string) => !SO_DE_CABECALHO.test(html.trim());

const paginaDeHtml = (html: string) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${ESTILO_DA_PAGINA}</style></head><body>${html}</body></html>`;

/* A folha de estilo vai no `<style>`, e não no corpo — foi essa a inversão que
   fazia o quadro "mostrar" a regra escrita em vez do efeito dela. */
const paginaDeCss = (css: string, marcacao: string) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${ESTILO_DA_PAGINA}${css}</style></head><body>${marcacao}</body></html>`;

export function ExemploDaTeoria({ topico, mostraResultado }: {
  topico: TopicoDeVereda;
  /** A vereda mostra o resultado? Blocos e texto nunca mostram: não há um. */
  mostraResultado: boolean;
}) {
  const como = topico.exemploComo ?? 'html';

  if (como === 'blocos') {
    return (
      <>
        <style>{CSS_EXEMPLO}</style>
        <div className="ex-caixa">
          <p className="ex-caixa-topo">No Scratch, fica assim</p>
          <Blocos exemplo={topico.exemplo} />
        </div>
      </>
    );
  }

  if (como === 'texto') {
    return (
      <>
        <style>{CSS_EXEMPLO}</style>
        <div className="ex-caixa">
          <p className="ex-caixa-topo">Exemplo</p>
          <pre className="ex-codigo claro">{topico.exemplo}</pre>
        </div>
      </>
    );
  }

  if (como === 'css') {
    /* Sem marcação, não há resultado a mostrar — e um quadro vazio rotulado
       "o navegador mostra" seria a mesma promessa não cumprida de antes. */
    const comResultado = mostraResultado && !!topico.exemploMarcacao;
    return (
      <>
        <style>{CSS_EXEMPLO}</style>
        <div className={comResultado ? 'ex-dupla' : ''}>
          <div className="ex-caixa">
            <p className="ex-caixa-topo">Você escreve, no .css</p>
            <Codigo linhas={realcarLinhasCss(topico.exemplo)} />
          </div>
          {comResultado && (
            <div className="ex-caixa">
              <p className="ex-caixa-topo">E a página fica assim</p>
              <iframe srcDoc={paginaDeCss(topico.exemplo, topico.exemploMarcacao ?? '')}
                sandbox="" title={`Resultado: ${topico.titulo}`} />
            </div>
          )}
        </div>
      </>
    );
  }

  const temResultado = mostraResultado && mostraAlgo(topico.exemplo);
  return (
    <>
      <style>{CSS_EXEMPLO}</style>
      <div className={temResultado ? 'ex-dupla' : ''}>
        <div className="ex-caixa">
          <p className="ex-caixa-topo">Você escreve</p>
          <Codigo linhas={realcarLinhas(topico.exemplo)} />
        </div>
        {temResultado && (
          <div className="ex-caixa">
            <p className="ex-caixa-topo">O navegador mostra</p>
            <iframe srcDoc={paginaDeHtml(topico.exemplo)}
              sandbox="" title={`Resultado: ${topico.titulo}`} />
          </div>
        )}
      </div>
    </>
  );
}
