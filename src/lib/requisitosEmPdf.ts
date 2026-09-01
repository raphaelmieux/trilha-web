/**
 * O documento de requisitos de um percurso, para baixar.
 *
 * O desbravador percorre a trilha lendo as lições, e o que ele será cobrado
 * está num PDF que até agora só o clube tinha. Sem ele, a pessoa estuda no
 * escuro: aprende o que a plataforma resolveu ensinar sem saber o que o
 * documento oficial pede. Estar à mão, na própria trilha, é a diferença entre
 * cumprir requisito e descobrir depois que faltou um.
 *
 * ── O nome do arquivo é o nome do percurso ───────────────────────────────
 * `<CÓDIGO> <Nome>.pdf`, como os arquivos chegaram. Não há tabela de-para: o
 * caminho sai de `code` e `name`, e é `requisitosEmPdf.test.ts` que confere,
 * um por um, que o arquivo existe. Isso amarra duas coisas que precisam
 * concordar — o nome que a tela mostra e o nome do documento —, e foi assim
 * que se descobriu que a AP049 estava registrada como "Desenvolvimento de
 * Sistemas" enquanto a folha oficial diz "Desenvolvimento de Software".
 *
 * A pasta tem espaço no nome, e os arquivos têm espaço, vírgula e acento.
 * `encodeURI` cuida disso — e só dele: `encodeURIComponent` comeria as barras.
 */

/** A pasta, como ela existe no repositório. */
const PASTA = 'curriculum files';

/** O que basta para achar o documento: o código e o nome, que trilha e vereda têm. */
export interface PercursoComRequisitos {
  code: string;
  name: string;
}

/** O caminho do arquivo dentro de `public/`, sem codificar — é o que o teste confere. */
export function caminhoDosRequisitos(p: PercursoComRequisitos): string {
  return `${PASTA}/${p.code} ${p.name}.pdf`;
}

/** O endereço que o navegador abre, já sob a base do site. */
export function urlDosRequisitos(p: PercursoComRequisitos): string {
  return encodeURI(`${import.meta.env.BASE_URL}${caminhoDosRequisitos(p)}`);
}
