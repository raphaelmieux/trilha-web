import { getSpecialty } from '../curriculum';
import { getVereda } from '../curriculum/veredas';
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
 *
 * A vereda também emite Token.Web(), e a arte dela está na mesma pasta, sob o
 * código dela — `getVereda` entra aqui pela mesma razão que `getSpecialty`:
 * sem ela, o certificado de uma vereda sairia vestido de Internet.
 */
export function codigoDaArte(curriculumCode: string): string {
  const conhecido = getSpecialty(curriculumCode) || getVereda(curriculumCode);
  return conhecido ? curriculumCode : 'AP034';
}

/**
 * O nome do percurso que um certificado atesta, e o que ele é.
 *
 * A tela pública tinha `getSpecialty(code) ?? code`, e para uma vereda isso
 * imprimiria o código cru — "CC-FE001" — no único lugar que dá validade ao
 * documento fora do aplicativo. E a linha de baixo dizia "Nível: Básico", que
 * ninguém decidiu: vereda não tem nível, tem tamanho.
 */
export function percursoDoCertificado(curriculumCode: string):
  { nome: string; tipo: 'trilha' } | { nome: string; tipo: 'vereda' } | { nome: string; tipo: 'desconhecido' } {
  const trilha = getSpecialty(curriculumCode);
  if (trilha) return { nome: `${trilha.code} — ${trilha.name}`, tipo: 'trilha' };
  const vereda = getVereda(curriculumCode);
  if (vereda) return { nome: `${vereda.code} — ${vereda.name}`, tipo: 'vereda' };
  return { nome: curriculumCode, tipo: 'desconhecido' };
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
