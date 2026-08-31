import { useState } from 'react';
import { Award, CheckCircle2, Circle, Lock } from 'lucide-react';

/**
 * The specialty emblem, shown at the size it deserves.
 *
 * This is the insignia the Pathfinder sews onto their sash once the club
 * certifies the specialty — it is the point of the whole trilha. On the
 * dashboard it was a 32px image tucked inline beside the heading text, the same
 * size as the status tick next to it, so the thing being earned looked like
 * decoration and the checkbox looked like the subject.
 *
 * Here it leads the card: 88px, on its own tinted mount, with a ring that turns
 * amber once the Token.Web() is issued. The status moves to a small badge on the
 * emblem's corner, where it annotates the insignia instead of competing with it.
 */

export type EmblemStatus = 'certificado' | 'concluido' | 'em-andamento' | 'bloqueado';

const RING: Record<EmblemStatus, string> = {
  certificado: 'var(--color-secondary)',
  concluido: 'var(--color-success)',
  'em-andamento': 'var(--color-border-hover)',
  bloqueado: 'var(--color-border)',
};

/*
  A proporção que a arte usa enquanto o arquivo não chegou.

  1 é o quadrado, porque é o palpite que erra menos: uma arte que ainda não
  carregou ocupa o mesmo lugar que o círculo, e quando o PNG chega a moldura
  se ajusta a ele. Palpitar 1.27 faria o oposto — a trilha entraria certa e
  toda vereda daria um pulo de forma no meio da rolagem.
*/
const PROPORCAO_PADRAO = 1;

/*
  Onde o selo de status pousa, em fração do lado da medalha.

  É o ponto da elipse a 45°: metade mais meia vez o cosseno de 45°. Como sai em
  porcentagem do próprio contêiner, serve ao círculo e à elipse sem conta nova.
*/
const NO_ARO = 0.5 + 0.5 * Math.SQRT1_2;

export default function Emblema({
  code,
  status,
  size = 88,
}: {
  /*
    O código do percurso — trilha ou vereda —, e não um par fechado.

    Estava tipado como 'AP034' | 'AP035'. O componente só monta o caminho de
    uma imagem a partir dele, então a união literal não protegia nada — apenas
    impedia que a terceira trilha usasse o emblema. Hoje as veredas usam o
    mesmo emblema, da mesma pasta, e é por isso que o tipo é `string`.

    Um código sem arte cai no onError abaixo.
  */
  code: string;
  status: EmblemStatus;
  /** O lado do quadrado em que o emblema cabe. A arte ocupa o que a forma dela pedir. */
  size?: number;
}) {
  /*
    ── O emblema de trilha é oval, e oval ele fica ──────────────────────────

    A arte não tem uma forma só: o emblema de especialidade é o patch oval que
    se costura na faixa — 710×558, deitado —, e o da vereda é um disco de 592×592.
    A moldura aqui era `rounded-full` com largura e altura travadas em
    `size * 0.72`, o que espremia os 710 do oval para dentro de um quadrado:
    a trilha aparecia como um círculo achatado, com o texto do emblema
    estreitado junto. Ninguém desenhou aquele círculo — ele era o efeito de
    forçar as duas artes na mesma caixa.

    Agora a proporção sai da própria imagem, no `onLoad`, e a moldura toma a
    forma dela: `border-radius: 50%` de uma caixa 1.27:1 é uma elipse, e de uma
    caixa 1:1 é um círculo. Sem lista de códigos por forma — a arte diz a forma
    dela, e um emblema novo, em qualquer proporção, chega certo sem tocar aqui.

    O que não muda é o espaço reservado: o contêiner continua `size` × `size`,
    então as duas formas se alinham na mesma coluna do cartão e a linha do
    título não dança de uma família para a outra.
  */
  const [proporcao, setProporcao] = useState(PROPORCAO_PADRAO);
  const larguraDaMedalha = proporcao >= 1 ? size : size * proporcao;
  const alturaDaMedalha = proporcao >= 1 ? size / proporcao : size;

  const ring = RING[status];
  const bloqueado = status === 'bloqueado';
  const selo = size * 0.3;

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="relative flex items-center justify-center transition"
        style={{
          width: larguraDaMedalha,
          height: alturaDaMedalha,
          // Two rings: a solid edge in the status colour and a soft halo, so the
          // emblem reads as a medal rather than a cropped picture. `50%` on a
          // non-square box is an ellipse, which is what the oval patch needs.
          borderRadius: '50%',
          border: `2px solid ${ring}`,
          boxShadow: status === 'certificado'
            ? '0 0 0 6px rgba(245, 166, 35, 0.12), 0 4px 18px rgba(0, 0, 0, 0.35)'
            : '0 0 0 6px rgba(255, 255, 255, 0.04), 0 4px 14px rgba(0, 0, 0, 0.30)',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}assets/specialties/${code}.png`}
          alt={`Emblema de ${code}`}
          /* A arte é o próprio medalhão e vai até a borda da moldura; `contain`
             a mantém inteira mesmo se um arquivo novo vier fora de proporção. */
          onLoad={ev => {
            const img = ev.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setProporcao(img.naturalWidth / img.naturalHeight);
            }
          }}
          /* Sem arte, a moldura e o selo de status continuam de pé; o que não
             pode aparecer é o ícone de imagem quebrada dentro da medalha. */
          onError={ev => { (ev.currentTarget as HTMLImageElement).style.display = 'none'; }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            // A locked trilha shows the emblem it leads to, dimmed — the reward
            // stays visible, which is the reason to unlock it.
            opacity: bloqueado ? 0.35 : 1,
            filter: bloqueado ? 'grayscale(1)' : 'none',
          }}
        />

        <span
          className="absolute rounded-full flex items-center justify-center"
          /*
            Sobre a borda da medalha, a 45°, e não no canto da caixa.

            Ancorado em `right/bottom`, o selo pousava no canto inferior direito
            do retângulo — que num círculo quase encosta na borda, e numa elipse
            fica bem longe dela: o selo da trilha soltava no vazio, ligado a
            nada. Aqui ele vai para o ponto da própria curva a 45° (a·cos t,
            b·sen t), que encosta na borda seja qual for a proporção da arte.
          */
          style={{
            left: `${NO_ARO * 100}%`, top: `${NO_ARO * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: selo, height: selo,
            backgroundColor: 'var(--color-bg-card)',
            border: `2px solid ${ring}`,
          }}
          title={
            status === 'certificado' ? 'Token.Web() emitido'
              : status === 'concluido' ? 'Requisitos concluídos'
              : status === 'bloqueado' ? 'Percurso bloqueado'
              : 'Em andamento'
          }
        >
          {status === 'certificado' ? <Award style={{ width: '58%', height: '58%', color: 'var(--color-secondary)' }} />
            : status === 'concluido' ? <CheckCircle2 style={{ width: '58%', height: '58%', color: 'var(--color-success)' }} />
            : status === 'bloqueado' ? <Lock style={{ width: '52%', height: '52%', color: 'var(--color-text-faint)' }} />
            : <Circle style={{ width: '52%', height: '52%', color: 'var(--color-border-hover)' }} />}
        </span>
      </div>
    </div>
  );
}
