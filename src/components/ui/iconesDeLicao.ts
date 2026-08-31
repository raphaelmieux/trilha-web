import { BookOpen, FlaskConical, Award, HelpCircle, Flag, type LucideIcon } from 'lucide-react';
import type { LessonType } from '../../types';

/*
 * O desenho de cada tipo de lição, num lugar só.
 *
 * Duas telas precisam dele: `MarcaDaLicao`, que marca a lição na trilha e na
 * vereda, e `BadgeIcon`, que desenha a insígnia que aquela lição rendeu. Eram
 * dois mapas, e divergiram: o módulo de laboratório saía com o erlenmeyer e a
 * insígnia do mesmo laboratório saía com a proveta reta, dois objetos de vidro
 * diferentes para a mesma coisa. Quem concluía o laboratório via um desenho no
 * caminho e ganhava outro na estante, sem nada ligando os dois.
 *
 * Um mapa não diverge. É por isso que ele mora aqui, e não dentro de um dos
 * dois componentes — de dentro de um, o outro teria de copiar, e copiar é como
 * os dois vidros apareceram.
 *
 * Fica em `components/ui/` e não em `lib/`: são componentes React, e `lib/` é
 * das regras puras.
 */
export const ICONE_DA_LICAO: Record<LessonType, LucideIcon> = {
  theory: BookOpen,
  quiz: HelpCircle,
  lab: FlaskConical,
  checkpoint: Flag,
  final: Award,
};
