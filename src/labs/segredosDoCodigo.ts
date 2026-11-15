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

/*
  O Gato Pintado: repintar a fantasia de um ator no editor de pintura do
  Scratch.

  O editor de pintura grava a fantasia editada como um arquivo novo, e o sb3
  passa a apontar para outro `assetId` sob o **mesmo nome** de fantasia. É
  isso que se procura: trocar de fantasia (próxima fantasia) muda só qual
  delas aparece, e acrescentar um ator da biblioteca traz nomes novos — nenhum
  dos dois é ter pintado nada. O palco fica de fora, porque o segredo é do ator.
*/
type Fantasias = Map<string, Map<string, string>>;

function fantasiasDosAtores(sb3: string): Fantasias | null {
  try {
    const p = JSON.parse(sb3) as { targets?: { isStage?: boolean; name?: string; costumes?: { name?: string; assetId?: string }[] }[] };
    const atores: Fantasias = new Map();
    for (const t of p.targets ?? []) {
      if (t.isStage || !t.name) continue;
      atores.set(t.name, new Map((t.costumes ?? []).filter(c => c.name && c.assetId).map(c => [c.name as string, c.assetId as string])));
    }
    return atores;
  } catch {
    return null;
  }
}

/** Alguma fantasia que já existia num ator ganhou outro desenho. */
export function fantasiaRepintada(antes: string, agora: string): boolean {
  const a = fantasiasDosAtores(antes), b = fantasiasDosAtores(agora);
  if (!a || !b) return false;
  for (const [ator, fantasias] of b) {
    const eram = a.get(ator);
    if (!eram) continue;
    for (const [nome, asset] of fantasias) {
      const era = eram.get(nome);
      if (era && era !== asset) return true;
    }
  }
  return false;
}
