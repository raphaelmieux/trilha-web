import { getSpecialty } from '../curriculum';

/**
 * Qual arte desenhar para um certificado.
 *
 * Era `curriculum_code === 'AP035' ? 'AP035' : 'AP034'`, escrito duas vezes — no
 * canvas da tela e no PDF. Toda trilha que não fosse a avançada recebia a arte
 * da AP034. Enquanto existiam duas trilhas o ternário acertava sempre; com a
 * AP041 aberta ele passa a errar, e o certificado dela sairia vestido de
 * Internet nos dois lugares. É o documento que a pessoa leva ao clube.
 *
 * `getSpecialty` responde apenas "esta trilha existe". Toda trilha do currículo
 * tem a sua arte em public/assets/certificates, e um código que o currículo não
 * conhece não deveria ter gerado certificado — se apareceu, desenhar a arte
 * antiga é melhor do que não desenhar nada.
 *
 * Mora aqui, e não junto do canvas, porque o PDF precisa da mesma resposta: as
 * duas saídas têm de mostrar o mesmo certificado.
 */
export function codigoDaArte(curriculumCode: string): string {
  return getSpecialty(curriculumCode) ? curriculumCode : 'AP034';
}
