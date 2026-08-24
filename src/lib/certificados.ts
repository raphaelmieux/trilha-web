import { getSpecialty } from '../curriculum';
import { umDe, ORDEM_DOS_NIVEIS, STATUS_DO_CERTIFICADO } from '../types';
import type { CertificadoVerificado, RetornoDe } from '../types';

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

/**
 * O que `verify_certificate()` devolve, virando certificado do domínio.
 *
 * `level` e `status` são `text` com CHECK no banco, então chegam como string, e
 * as duas telas que verificam um código — a pública e a do próprio dono —
 * faziam a mesma afirmação com `as CertificadoVerificado[]`. Duas cópias da
 * mesma promessa não conferida, e a segunda delas é a que um estranho usa para
 * decidir se um Token.Web() vale.
 *
 * `status` desconhecido vira 'revoked', e não 'active'. A escolha não é
 * simétrica: exibir como válido um certificado cujo estado a plataforma não
 * conseguiu ler é afirmar o que não se verificou; exibir como revogado um que
 * era válido é um erro visível, que a pessoa reclama e alguém conserta.
 *
 * `level` desconhecido vira 'basico' pela mesma razão — é o grau que reivindica
 * menos. Ele só decide o rótulo impresso, mas o princípio é o mesmo.
 *
 * `umDe` reclama no console nos dois casos, então o desvio não passa mudo.
 */
export function comoCertificadoVerificado(
  linha: RetornoDe<'verify_certificate'>[number],
): CertificadoVerificado {
  return {
    ...linha,
    level: umDe(ORDEM_DOS_NIVEIS, linha.level, 'basico'),
    status: umDe(STATUS_DO_CERTIFICADO, linha.status, 'revoked'),
  };
}
