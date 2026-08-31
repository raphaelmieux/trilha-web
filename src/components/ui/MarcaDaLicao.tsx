import { Check } from 'lucide-react';
import { ICONE_DA_LICAO } from './iconesDeLicao';
import type { LessonType } from '../../types';

/*
 * A marca de uma lição: um disco com o ícone do que ela é.
 *
 * Nasceu na vereda e virou padrão. A trilha mostrava quatro ícones soltos —
 * um visto verde, uma estrela, uma medalha, um triângulo de play — sem disco
 * em volta e sem relação entre eles: play não diz "teoria", estrela não diz
 * "laboratório", e o mesmo triângulo servia para tudo o que ainda não tinha
 * sido feito. O tipo da lição some, e o que sobra é "feito / não feito".
 *
 * Aqui o ícone diz o **tipo** e o disco diz o **estado**: verde e com visto
 * quando está vencida, apagado quando não. É a mesma leitura na trilha e na
 * vereda, e uma lição de teoria tem a mesma cara nos dois lugares.
 */

export default function MarcaDaLicao({ tipo, feita, size = 32 }: {
  tipo: LessonType;
  feita?: boolean;
  size?: number;
}) {
  const Ico = ICONE_DA_LICAO[tipo];
  return (
    <span
      aria-hidden="true"
      className="flex-none rounded-full flex items-center justify-center"
      style={{
        width: size, height: size,
        backgroundColor: feita ? 'var(--color-success)' : 'var(--color-bg-hover)',
        /* A avaliação final continua tendo a cor dela quando ainda não foi
           feita: é o fim do percurso, e a tela deve deixar isso à vista. */
        color: feita ? '#fff'
          : tipo === 'final' ? 'var(--color-secondary)'
            : 'var(--color-text-muted)',
      }}>
      {feita
        ? <Check style={{ width: size * 0.5, height: size * 0.5 }} />
        : <Ico style={{ width: size * 0.5, height: size * 0.5 }} />}
    </span>
  );
}
