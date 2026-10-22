/**
 * Converter texto em curvas: trocar as letras pelo desenho delas.
 *
 * ── Por que só a Space Mono ──────────────────────────────────────────────
 * O desenho de cada letra mora no **arquivo da fonte**. Quem converte texto em
 * curvas abre esse arquivo, lê o contorno de cada letra e escreve um caminho
 * com ele — e é exatamente por isso que se converte: a gráfica que recebe o
 * arquivo pode não ter a fonte instalada, e aí o texto sai em outra letra.
 * Convertido, ele deixa de precisar da fonte.
 *
 * A plataforma carrega um arquivo de fonte só, o da Space Mono que o PDF já
 * usa, e é a única que este editor converte. O editor diz isso em vez de
 * fingir: "o arquivo desta fonte não está neste computador" é a mesma frase
 * que um editor de verdade daria, e é a lição do requisito 4.6 contada do
 * outro lado.
 *
 * ── O arquivo vem quando se pede ─────────────────────────────────────────
 * Como em `marcaEmPdf.ts`: o TTF fica em `public/assets/fonts/`, e só baixa
 * quem converte alguma coisa. O leitor de fontes também — o `import` é
 * dinâmico, e o pacote de quem nunca abre a CC-DG002 não leva nada disso.
 */

import type { Font } from 'opentype.js';
import { alturaDaLinha, linhasDoTexto, type Caminho, type Texto } from './design';
import { caixaDosContornos, type Contorno, type No, type Ponto } from './vetor';

export const FAMILIA_CONVERTIVEL = 'Space Mono' as const;
export const ARQUIVO_DA_FONTE = 'assets/fonts/space-mono-700.ttf';

export const podeConverter = (t: Texto) => t.familia === FAMILIA_CONVERTIVEL;

/** Baixa e lê o arquivo da fonte. */
export async function carregarFonte(): Promise<Font> {
  const [{ parse }, resposta] = await Promise.all([
    import('opentype.js'),
    fetch(`${import.meta.env.BASE_URL}${ARQUIVO_DA_FONTE}`),
  ]);
  if (!resposta.ok) throw new Error(`A fonte não chegou (${resposta.status}).`);
  return parse(await resposta.arrayBuffer());
}

const canto = (p: Ponto): No => ({ x: p.x, y: p.y, entrada: null, saida: null, tipo: 'canto' });

/**
 * Os contornos de um texto, linha por linha, no lugar em que o editor o
 * desenha.
 *
 * A linha de base sai da mesma conta da caixa do texto: o meio da faixa de
 * cada linha, mais a altura das maiúsculas acima dela. As curvas quadráticas
 * da fonte viram cúbicas — o caminho do editor só tem cúbicas, e a conversão
 * é exata.
 */
export function contornosDoTexto(fonte: Font, t: Texto): Contorno[] {
  const escala = t.corpo / fonte.unitsPerEm;
  const ascendente = fonte.ascender * escala;
  const descendente = -fonte.descender * escala;
  const faixa = alturaDaLinha(t);
  /* Letra por letra, e não a linha de uma vez: o leitor de fontes ainda não
     entende todas as substituições que a Space Mono declara, e pedir a linha
     inteira estoura numa delas. Monoespaçada não tem par de letras que se
     aproxime, então somar o avanço de cada uma dá a mesma linha. */
  const glifos = (linha: string) => [...linha].map(ch => fonte.charToGlyph(ch));
  const avanco = (g: ReturnType<Font['charToGlyph']>) => (g.advanceWidth ?? fonte.unitsPerEm * 0.6) * escala;
  return linhasDoTexto(t).flatMap((linha, i) => {
    const largura = glifos(linha).reduce((s, g) => s + avanco(g), 0);
    const x = t.alinhamento === 'esquerda' ? t.x
      : t.alinhamento === 'direita' ? t.x + t.largura - largura
        : t.x + (t.largura - largura) / 2;
    const base = t.y + i * faixa + (faixa - (ascendente + descendente)) / 2 + ascendente;
    const cs: Contorno[] = [];
    let atual: Contorno | null = null;
    let p: Ponto = { x: 0, y: 0 };
    /* Contorno de letra é sempre fechado, com Z escrito ou não: o leitor
       devolve os da TrueType sem Z, emendando o M seguinte. Fechar no M e no
       fim é o que impede a letra de virar uma linha sem área. */
    const fechar = () => {
      if (!atual) return;
      const [primeiro, ultimo] = [atual.nos[0], atual.nos[atual.nos.length - 1]];
      if (atual.nos.length > 1 && Math.abs(primeiro.x - ultimo.x) < 1e-6 && Math.abs(primeiro.y - ultimo.y) < 1e-6) {
        primeiro.entrada = ultimo.entrada;
        atual.nos.pop();
      }
      atual.fechado = true;
      atual = null;
    };
    let cursor = x;
    const comandos = glifos(linha).flatMap(g => {
      const cs = g.getPath(cursor, base, t.corpo).commands;
      cursor += avanco(g);
      return cs;
    });
    for (const c of comandos) {
      if (c.type === 'M') {
        fechar();
        p = { x: c.x!, y: c.y! };
        atual = { nos: [canto(p)], fechado: false };
        cs.push(atual);
      } else if (c.type === 'L' && atual) {
        p = { x: c.x!, y: c.y! };
        atual.nos.push(canto(p));
      } else if ((c.type === 'C' || c.type === 'Q') && atual) {
        const fim = { x: c.x!, y: c.y! };
        const [c1, c2] = c.type === 'C'
          ? [{ x: c.x1!, y: c.y1! }, { x: c.x2!, y: c.y2! }]
          : [
            { x: p.x + (2 / 3) * (c.x1! - p.x), y: p.y + (2 / 3) * (c.y1! - p.y) },
            { x: fim.x + (2 / 3) * (c.x1! - fim.x), y: fim.y + (2 / 3) * (c.y1! - fim.y) },
          ];
        atual.nos[atual.nos.length - 1].saida = c1;
        atual.nos.push({ ...canto(fim), entrada: c2 });
        p = fim;
      } else if (c.type === 'Z') {
        fechar();
      }
    }
    fechar();
    return cs.filter(cc => cc.nos.length > 1);
  });
}

/** O texto como caminho, com a cor dele no preenchimento e o mesmo nome na lista de camadas. */
export function textoEmCaminho(fonte: Font, t: Texto): Caminho {
  const contornos = contornosDoTexto(fonte, t);
  const c = caixaDosContornos(contornos);
  return {
    id: t.id, nome: t.nome, tipo: 'caminho', x: c.x, y: c.y, largura: c.largura, altura: c.altura,
    contornos, preenchimento: t.cor, traco: null,
  };
}
