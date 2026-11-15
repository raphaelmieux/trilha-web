import { getSpecialty } from '../curriculum';
import { getVereda } from '../curriculum/veredas';
import { nomeCompleto, umDe, ORDEM_DOS_NIVEIS, STATUS_DO_CERTIFICADO } from '../types';
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
  const conhecido = getSpecialty(curriculumCode) || getVereda(curriculumCode)
    || CERTIFICADOS_FORA_DO_CURRICULO.has(curriculumCode);
  return conhecido ? curriculumCode : 'AP034';
}

/*
  O Mestrado oficial também emite Token.Web(), e não é trilha nem vereda: o
  currículo não o conhece, e sem ele aqui o certificado do ME006 sairia
  vestido de Internet.
*/
const CERTIFICADOS_FORA_DO_CURRICULO: ReadonlySet<string> = new Set(['ME006']);

/*
  A cor do que a plataforma escreve por cima da arte: o nome, o código e a
  data.

  Toda arte de trilha e de vereda é clara, e o texto sai quase preto. A do
  ME006 é escura — circuito e fitas sobre fundo preto —, e o mesmo quase preto
  sumiria nela. A cor é da arte, e não do tipo de percurso: por isso é uma
  lista de códigos, e a tela e o PDF perguntam aqui, para os dois mostrarem o
  mesmo certificado.
*/
const ARTE_ESCURA: ReadonlySet<string> = new Set(['ME006']);

type Rgb = [number, number, number];
export interface CoresDoCertificado { nome: Rgb; rodape: Rgb }

export function coresDoCertificado(codigoDaArteDesenhada: string): CoresDoCertificado {
  return ARTE_ESCURA.has(codigoDaArteDesenhada)
    ? { nome: [255, 255, 255], rodape: [255, 255, 255] }
    : { nome: [10, 10, 10], rodape: [26, 26, 26] };
}

/** A cor em `rgb()`, para o SVG da tela. */
export const emCss = ([r, g, b]: Rgb) => `rgb(${r}, ${g}, ${b})`;

/**
 * O nome do percurso que um certificado atesta, e o que ele é.
 *
 * A tela pública tinha `getSpecialty(code) ?? code`, e para uma vereda isso
 * imprimiria o código cru — "CC-FE001" — no único lugar que dá validade ao
 * documento fora do aplicativo. E a linha de baixo dizia "Nível: Básico", que
 * ninguém decidiu: vereda não tem nível, tem tamanho.
 *
 * O painel de certificações tinha a mesma falta, e por muito mais tempo: ele
 * chamava `getSpecialty` direto, então a linha de uma vereda concluída saía
 * escrita "CC001", só o código, ao lado de "AP034 Internet". Quem passa por
 * aqui responde pelos dois currículos, e é por isso que existe.
 *
 * O par sai de `nomeCompleto`, e não montado à mão: era `${code} — ${name}`,
 * com travessão, e nenhuma outra tela escreve assim. Isso deixava o painel com
 * dois formatos na mesma grade quando a vereda finalmente ganhasse nome.
 */
export function percursoDoCertificado(curriculumCode: string):
  { nome: string; tipo: 'trilha' } | { nome: string; tipo: 'vereda' } | { nome: string; tipo: 'desconhecido' } {
  const trilha = getSpecialty(curriculumCode);
  if (trilha) return { nome: nomeCompleto(trilha), tipo: 'trilha' };
  const vereda = getVereda(curriculumCode);
  if (vereda) return { nome: nomeCompleto(vereda), tipo: 'vereda' };
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
