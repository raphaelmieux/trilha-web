import type { PecaDaFaixa } from './catalogoDaFaixa';
import type { Certification } from '../../types';

/*
  O estado de cada peça da Faixa, a partir do que a pessoa tem.

  Uma pergunta só para a Faixa inteira — "a pessoa tem a insígnia desta
  peça?" —, e uma exceção: a peça que é um Token.Web() (patch de trilha,
  button de vereda, patch do ME006) fica **apagada** quando todo certificado
  dela foi revogado. A insígnia não se perde, e a peça continua no lugar; o
  documento é que não vale mais, e a Faixa não pode mostrá-lo como se valesse.
  É a decisão D6 do planejamento.
*/

export type EstadoDaPeca = 'cheia' | 'vazia' | 'revogada';

export function estadoDaPeca(
  p: Pick<PecaDaFaixa, 'insignia' | 'token'>,
  conquistadas: ReadonlySet<string>,
  certificados: readonly Pick<Certification, 'curriculum_code' | 'status'>[],
): EstadoDaPeca {
  if (!p.insignia || !conquistadas.has(p.insignia)) return 'vazia';
  if (!p.token) return 'cheia';
  const doPercurso = certificados.filter(c => c.curriculum_code === p.token);
  if (doPercurso.length > 0 && !doPercurso.some(c => c.status === 'active')) return 'revogada';
  return 'cheia';
}

/** O certificado que o clique abre: o ativo, ou o revogado mais recente. */
export function certificadoDaPeca<C extends Pick<Certification, 'curriculum_code' | 'status' | 'issued_at'>>(
  p: Pick<PecaDaFaixa, 'token'>,
  certificados: readonly C[],
): C | undefined {
  if (!p.token) return undefined;
  const doPercurso = certificados.filter(c => c.curriculum_code === p.token);
  return doPercurso.find(c => c.status === 'active')
    ?? [...doPercurso].sort((a, b) => b.issued_at.localeCompare(a.issued_at))[0];
}
