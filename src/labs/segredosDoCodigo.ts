/*
  Os dois segredos que se acham escrevendo código: o Zen do Python e a planta
  do banco.

  Os dois existem de verdade nos programas — `import this` escreve o Zen em
  qualquer Python, e `sqlite_master` é a tabela em que o SQLite guarda a
  definição de tudo o que há no banco. A plataforma não inventa nada: ela só
  repara que a pessoa achou.

  O que está em comentário ou dentro de texto não conta. Achar o nome escrito
  num comentário não é ter pedido nada ao programa — e o enunciado de uma
  lição poderia citá-lo, dando o segredo a todo mundo que a abrisse.
*/

/** O código Python sem comentários e sem texto entre aspas. */
function pythonSemTexto(fonte: string): string {
  return fonte
    .replace(/("""|''')[\s\S]*?\1/g, '')
    .replace(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g, '')
    .replace(/#.*$/gm, '');
}

/** O SQL sem comentários e sem texto entre aspas simples. */
function sqlSemTexto(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'(?:''|[^'])*'/g, '')
    .replace(/--.*$/gm, '');
}

/** O programa pede o Zen do Python. */
export function pedeOZen(fonte: string): boolean {
  return /^\s*import\s+this\s*(;|$)/m.test(pythonSemTexto(fonte));
}

/** A consulta lê a planta do banco — `sqlite_master`, ou o nome novo dela, `sqlite_schema`. */
export function leAPlantaDoBanco(fonte: string): boolean {
  return /\b(sqlite_master|sqlite_schema)\b/i.test(sqlSemTexto(fonte));
}
