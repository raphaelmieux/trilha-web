/*
  O dicionário pessoal: as palavras que esta pessoa mandou o corretor aceitar.

  ── Um só, para a plataforma inteira ────────────────────────────────────────
  Toda simulação que sublinha ortografia — a folha do Word, o corpo do slide,
  o editor da nuvem e a que vier — lê daqui, e o "Adicionar ao Dicionário" de
  qualquer uma delas escreve aqui. Um dicionário por programa seria o defeito
  de sempre: a palavra acrescentada no Word continuaria vermelha no
  PowerPoint, e a pessoa concluiria que adicionar não funciona. No Office é
  igual — o dicionário personalizado é um arquivo só para todos os programas.

  Ele é da **pessoa**, e não do programa nem do clube. As palavras que todo
  mundo precisa ver aceitas, porque os documentos da plataforma as escrevem,
  moram em `PALAVRAS_DO_CLUBE`, no código, e não passam por aqui.

  ── Onde ele fica guardado ──────────────────────────────────────────────────
  No navegador, por uma chave própria. A conta é a fonte que vem por cima disto
  (`dicionario_pessoal`, no banco): a palavra acrescentada no celular precisa
  deixar de ser sublinhada no computador do clube.

  ── Por que é um módulo com ouvintes, e não estado de React ────────────────
  O corretor carrega uma vez por página e serve a todas as telas; uma palavra
  acrescentada num lugar tem de tirar o vermelho de todos os outros na hora,
  inclusive de uma folha que já está desenhada. Quem desenha sublinhado ouve
  `ouvirDicionario` e se redesenha.
*/

const CHAVE_NO_APARELHO = 'trilha-web:dicionario-do-usuario';

/** O mesmo teto da coluna no banco: uma palavra, e não um texto. */
export const TAMANHO_MAXIMO_DA_PALAVRA = 64;

let palavras: Set<string> = new Set(lerDoAparelho());
const ouvintes = new Set<(palavras: ReadonlySet<string>) => void>();

function lerDoAparelho(): string[] {
  try {
    const bruto = globalThis.localStorage?.getItem(CHAVE_NO_APARELHO);
    const lista: unknown = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista.filter((x): x is string => typeof x === 'string' && palavraValida(x)) : [];
  } catch {
    return [];
  }
}

function guardarNoAparelho() {
  try {
    globalThis.localStorage?.setItem(CHAVE_NO_APARELHO, JSON.stringify([...palavras]));
  } catch {
    /* Sem armazenamento — janela anônima, armazenamento cheio —, a palavra vale
       até fechar a página, que é o que dá para fazer. */
  }
}

function avisar() {
  for (const f of ouvintes) f(palavras);
}

/**
 * Se o texto pode entrar no dicionário: uma palavra, sem espaço, e do tamanho
 * que o banco aceita. A guarda é a mesma da tabela para que nada que se
 * acrescente aqui seja recusado lá em silêncio.
 */
export function palavraValida(p: string): boolean {
  return p.length > 0 && p.length <= TAMANHO_MAXIMO_DA_PALAVRA && !/\s/u.test(p);
}

/** As palavras de agora. */
export function palavrasDoDicionario(): ReadonlySet<string> {
  return palavras;
}

/** Adicionar ao Dicionário, de qualquer simulação. */
export function acrescentarAoDicionario(palavra: string): void {
  if (!palavraValida(palavra) || palavras.has(palavra)) return;
  palavras = new Set(palavras).add(palavra);
  guardarNoAparelho();
  avisar();
}

/** Tirar do dicionário: quem adicionou "acampamneto" por engano quer o vermelho de volta. */
export function tirarDoDicionario(palavra: string): void {
  if (!palavras.has(palavra)) return;
  const nova = new Set(palavras);
  nova.delete(palavra);
  palavras = nova;
  guardarNoAparelho();
  avisar();
}

/** Ouve toda mudança; devolve a função que para de ouvir. */
export function ouvirDicionario(f: (palavras: ReadonlySet<string>) => void): () => void {
  ouvintes.add(f);
  return () => { ouvintes.delete(f); };
}

/** Para as travas: volta ao que o aparelho guarda. */
export function recarregarDicionario(): void {
  palavras = new Set(lerDoAparelho());
  avisar();
}
