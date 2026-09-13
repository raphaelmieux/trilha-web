import type { Badge } from '../../types';
/*
  O desenho do glifo vem de `badgeIcons.ts`, que é de onde o PDF também o tira.

  Aqui havia um mapa de componentes do lucide-react, e o PDF tinha os traçados
  crus — os mesmos desenhos escritos duas vezes, conferidos por uma trava que
  só sabia dizer se os dois lados tinham **alguma** coisa com aquele nome. E
  um componente do lucide renderiza um `<svg>` inteiro: aninhado dentro do
  `<g>` que escala o glifo, ele abriria viewport próprio e ignoraria a escala,
  jogando o ícone no canto em tamanho fixo. Uma fonte só resolve os dois.
*/
import { iconeCanonico, iconShape, RAIO_DA_TINTA } from '../../lib/badgeIcons';
import { CLASSES } from '../../lib/nivelDaInsignia';
import {
  ALTURA, LARGURA, CIRCULO_SEM_CLASSE, formaDaClasse, encaixeDoGlifo, corDoGlifo,
} from '../../lib/formaDaInsignia';
import { SEM_CLASSE } from '../../lib/insignias';

const MEDIDAS = { sm: 30, md: 44, lg: 64 } as const;

/**
 * A insígnia: o polígono da classe, preenchido, com o glifo por cima.
 *
 * Era um disco translúcido com o glifo traçado na cor do nível, e três níveis
 * — bronze, prata e ouro. Duas coisas estavam erradas nisso, e nenhuma delas
 * estourava.
 *
 * A cor sozinha não se lê: quem não distingue vermelho de verde via duas
 * insígnias idênticas, e numa estante impressa em preto e branco ninguém via
 * nenhuma. Agora o número de lados cresce com a classe, então a forma já diz
 * a ordem — é o mesmo motivo de `MarcaDaLicao` ter ícone **e** disco.
 *
 * E o glifo traçado na cor da classe some no escuro: medidas contra o cartão
 * da plataforma, cinco das sete cores ficavam entre 1,1:1 e 3,0:1. Com a cor
 * no preenchimento e o glifo em branco ou quase-preto — o que medir mais —,
 * nenhuma classe fica abaixo de 5,2:1.
 */
export default function BadgeIcon({ badge, size = 'md', rotulo }: {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  /*
    O nome acessível, quando o nome da insígnia não basta.

    Em quase toda tela só aparece o que foi conquistado, e aí o nome diz tudo.
    Na Estante não: lá o conquistado e o que falta ficam lado a lado, e "Primeiro
    Passo" sozinho não distingue os dois para quem navega por leitor de tela —
    a diferença está só no preenchimento, que é informação visual pura. O
    `title` continua sendo o nome, porque a dica de ferramenta é para quem vê.
  */
  rotulo?: string;
}) {
  const nomeDoIcone = iconeCanonico(badge.icon);
  const altura = MEDIDAS[size];

  /* As de horário não têm classe — círculo off-white, a forma que nenhuma
     classe usa. Elas medem quando se estuda, e não quanto. */
  const semClasse = SEM_CLASSE.has(badge.code);
  const forma = formaDaClasse(badge.tier);
  const fundo = semClasse ? CIRCULO_SEM_CLASSE : CLASSES[badge.tier].cor;
  /* Sem classe, o glifo se centra no meio da caixa, que é onde o círculo
     está; com classe, no centro do polígono — que no triângulo não é o meio
     da caixa, e centrar ali empurraria o glifo para fora pela ponta. */
  const centro = semClasse
    ? { pontos: '', centroX: LARGURA / 2, centroY: ALTURA / 2, raioInscrito: ALTURA / 2 }
    : forma;
  const encaixe = encaixeDoGlifo(centro, RAIO_DA_TINTA[nomeDoIcone] ?? 12);

  return (
    <svg
      viewBox={`0 0 ${LARGURA} ${ALTURA}`}
      width={(altura * LARGURA) / ALTURA}
      height={altura}
      className="flex-shrink-0"
      role="img"
      aria-label={rotulo ?? badge.name}
    >
      <title>{badge.name}</title>
      {semClasse
        ? <circle cx={LARGURA / 2} cy={ALTURA / 2} r={ALTURA / 2} fill={fundo} />
        : <polygon points={forma.pontos} fill={fundo} />}
      {/* O glifo é normalizado pelo raio da tinta que ele de fato ocupa: com
          um fator único a chama sai 28% menor que o troféu, e a fileira
          inteira parece desalinhada sem que nada esteja errado. O traço
          desfaz a escala para os catorze saírem com a mesma espessura. */}
      <g
        transform={encaixe.transform}
        fill="none"
        stroke={corDoGlifo(fundo)}
        strokeWidth={encaixe.traco}
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: iconShape(badge.icon) }}
      />
    </svg>
  );
}
