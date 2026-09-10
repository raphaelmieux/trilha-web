import { MARCAS, NOME, MIOLO, PARENTESES, type QualMarca } from '../../lib/marca';

/**
 * A marca, escrita do jeito que ela é: uma chamada de função.
 *
 * O nome é `Trilha.Web()` — e os parênteses são vermelhos, na cor da marca.
 * Não é enfeite: são eles que dizem que o nome é uma chamada de função, e não
 * uma frase com pontuação sobrando. É uma decisão de marca, e vale **em toda
 * parte** — na animação, na barra fixa e no meio de um parágrafo.
 *
 * Por isso nenhuma tela escreve `Trilha.Web()` à mão: o nome vem partido de
 * `lib/marca`, nos dois pedaços que a regra distingue. Duas cópias divergem no
 * primeiro ajuste, e aí a plataforma passa a mostrar duas marcas diferentes —
 * `marca.test.tsx` cobra.
 *
 * ── A digitação ──────────────────────────────────────────────────────────
 * Ver o nome aparecer caractere a caractere atrás de um cursor diz o que a
 * plataforma é antes de qualquer texto dizer.
 *
 * Feita inteira em CSS, e não com um timer em React. Um typewriter em JS
 * re-renderizaria este componente uma dezena de vezes por segundo em toda tela
 * em que ele aparece, inclusive a barra de navegação, que fica montada a sessão
 * toda; a animação abaixo roda no compositor e não custa nada depois da
 * primeira pintura. Também quer dizer que o efeito não pode dessincronizar do
 * ciclo de render do React, e que `prefers-reduced-motion` a desliga com uma
 * regra em vez de um desvio no componente.
 *
 * A largura é dada em `ch`. Numa fonte monoespaçada um caractere mede
 * exatamente 1ch, então `steps(12)` cai sempre no limite de um caractere — sem
 * glifo pela metade, e sem medir nada em JavaScript.
 */

/* Os nomes e os seus pedaços moram em `lib/marca`, sem React, porque o PDF
   também precisa deles — lá quem desenha é o jsPDF, que não lê folha de
   estilo. Reexportados aqui para quem já importava daqui. */
export { MARCAS, NOME, MIOLO, PARENTESES };

/**
 * Uma das duas marcas dentro de texto corrido — mesma fonte e mesmos parênteses
 * vermelhos, sem a digitação. Parágrafo não é lugar de animação: o nome citado
 * no meio de uma frase que se está lendo não deveria se mexer.
 *
 * `marca` escolhe entre a plataforma e o certificado. O padrão é a plataforma
 * porque é a que aparece em mais lugares; `<MarcaEmTexto marca="token" />` é o
 * Token.Web().
 */
export function MarcaEmTexto({
  marca = 'plataforma',
  className = '',
}: {
  marca?: QualMarca;
  className?: string;
}) {
  return (
    <span className={`marca-inline ${className}`}>
      {MARCAS[marca].miolo}<span className="marca-parenteses">{PARENTESES}</span>
    </span>
  );
}

export default function BrandMark({
  tamanho = 'nav',
  className = '',
}: {
  tamanho?: 'nav' | 'hero' | 'entrada';
  className?: string;
}) {
  return (
    <span
      className={`marca marca-${tamanho} ${className}`}
      role="img"
      aria-label={NOME}
    >
      {/*
        Reserva a largura final para que nada em volta do logotipo se mexa
        enquanto ele digita. Sem isto os itens de navegação deslizariam para a
        esquerda e assentariam, que é o sinal de sempre de um typewriter
        malfeito.
      */}
      <span className="marca-espaco" aria-hidden="true">{NOME}</span>
      {/*
        Os parênteses são um elemento à parte só para receberem a cor. O recorte
        que produz a digitação é do contêiner, e não deste texto, então partir o
        nome em dois não muda em nada o que aparece a cada passo.
      */}
      <span className="marca-texto" aria-hidden="true">
        {MIOLO}<span className="marca-parenteses">{PARENTESES}</span>
      </span>
    </span>
  );
}
