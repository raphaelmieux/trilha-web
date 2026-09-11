import type { ReactNode } from 'react';
import { MarcaEmTexto } from './BrandMark';
import { NOME } from '../../lib/marca';

/**
 * Veste a marca dentro de uma frase já montada.
 *
 * O relatório e os avisos montam o texto por interpolação, com o nome no meio
 * de uma frase que muda com o conteúdo. Reescrever cada uma dessas frases em
 * JSX espalharia a regra da marca por toda tela que cita o nome; esta função
 * deixa a frase como está e veste só as ocorrências.
 *
 * Devolve a frase intacta quando o nome não aparece nela, então é seguro
 * aplicá-la a qualquer texto.
 *
 * Em arquivo próprio porque não é componente: o `react-refresh` só consegue
 * recarregar um módulo que exporte componentes e mais nada, e misturar as duas
 * coisas custa o recarregamento a quente de toda tela que importa daqui.
 */
export function comMarca(texto: string): ReactNode[] {
  return texto.split(NOME).flatMap((pedaco, i) =>
    i === 0 ? [pedaco] : [<MarcaEmTexto key={`marca-${i}`} />, pedaco],
  );
}
