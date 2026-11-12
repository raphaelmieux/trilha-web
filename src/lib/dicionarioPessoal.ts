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

  ── A conta é a fonte; o aparelho é a cópia ─────────────────────────────────
  Com alguém entrado, a verdade é a tabela `dicionario_pessoal`: a palavra
  acrescentada no celular deixa de ser sublinhada no computador do clube. O
  navegador guarda uma cópia **por conta** — a chave leva o id —, para que o
  dicionário valha antes de a rede responder, e para que o computador do clube,
  que é de todo mundo, não dê as palavras de um ao próximo que entrar.

  O que se acrescentou sem rede fica **pendente** na cópia e sobe na próxima
  conexão. Pendente é uma lista à parte, e não "o que está na cópia e falta no
  banco": essa conta também acharia a palavra que a pessoa tirou no outro
  aparelho, e a ressuscitaria.

  Sem ninguém entrado, o dicionário fica só no navegador, numa chave própria —
  e nunca é juntado à conta de quem entrar depois, pela mesma razão do
  computador do clube.

  ── Por que é um módulo com ouvintes, e não estado de React ────────────────
  O corretor carrega uma vez por página e serve a todas as telas; uma palavra
  acrescentada num lugar, ou chegada da conta depois de a página abrir, tem de
  tirar o vermelho de todos os outros na hora. Quem desenha sublinhado ouve
  `ouvirDicionario` e se redesenha.
*/

/** A chave de quem não entrou. É a de antes da conta, e continua sendo lida. */
const CHAVE_SEM_CONTA = 'trilha-web:dicionario-do-usuario';
const chaveDe = (dono: string | null) => (dono ? `trilha-web:dicionario:${dono}` : CHAVE_SEM_CONTA);

/** O mesmo teto da coluna no banco: uma palavra, e não um texto. */
export const TAMANHO_MAXIMO_DA_PALAVRA = 64;

/** Onde a conta guarda as palavras. É uma porta para que as travas não precisem de banco. */
export interface FonteDaConta {
  ler: () => Promise<string[]>;
  gravar: (palavra: string) => Promise<void>;
  apagar: (palavra: string) => Promise<void>;
}

/** O que o navegador guarda de uma conta: as palavras e as que ainda não subiram. */
type Copia = { palavras: string[]; pendentes: string[] };

let dono: string | null = null;
let fonte: FonteDaConta | null = null;
/* Cada conexão leva um número; a resposta que chega depois de outra conexão
   começar é de uma conta que já saiu, e é descartada. */
let geracao = 0;
let palavras: Set<string> = new Set(lerDoAparelho(null).palavras);
let pendentes: Set<string> = new Set();
const ouvintes = new Set<(palavras: ReadonlySet<string>) => void>();

function lerDoAparelho(de: string | null): Copia {
  const lista = (x: unknown) => (Array.isArray(x) ? x.filter((p): p is string => typeof p === 'string' && palavraValida(p)) : []);
  try {
    const bruto = globalThis.localStorage?.getItem(chaveDe(de));
    const lido: unknown = bruto ? JSON.parse(bruto) : [];
    /* A chave sem conta nasceu guardando só a lista; a cópia de conta guarda
       as duas. As duas formas se leem. */
    if (Array.isArray(lido)) return { palavras: lista(lido), pendentes: [] };
    const c = lido as Partial<Copia> | null;
    return { palavras: lista(c?.palavras), pendentes: lista(c?.pendentes) };
  } catch {
    return { palavras: [], pendentes: [] };
  }
}

function guardarNoAparelho() {
  try {
    const valor = dono ? { palavras: [...palavras], pendentes: [...pendentes] } : [...palavras];
    globalThis.localStorage?.setItem(chaveDe(dono), JSON.stringify(valor));
  } catch {
    /* Sem armazenamento — janela anônima, armazenamento cheio —, a palavra vale
       até fechar a página, e sobe para a conta se houver rede. */
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

/** Sobe uma palavra pendente; se a rede falhar, ela continua pendente. */
function subir(palavra: string, f: FonteDaConta, g: number) {
  f.gravar(palavra).then(() => {
    if (g !== geracao || !pendentes.has(palavra)) return;
    pendentes = new Set(pendentes);
    pendentes.delete(palavra);
    guardarNoAparelho();
  }).catch(() => { /* fica pendente para a próxima conexão */ });
}

/** Adicionar ao Dicionário, de qualquer simulação. */
export function acrescentarAoDicionario(palavra: string): void {
  if (!palavraValida(palavra) || palavras.has(palavra)) return;
  palavras = new Set(palavras).add(palavra);
  if (dono && fonte) {
    pendentes = new Set(pendentes).add(palavra);
    subir(palavra, fonte, geracao);
  }
  guardarNoAparelho();
  avisar();
}

/** Tirar do dicionário: quem adicionou "acampamneto" por engano quer o vermelho de volta. */
export function tirarDoDicionario(palavra: string): void {
  if (!palavras.has(palavra)) return;
  palavras = new Set(palavras);
  palavras.delete(palavra);
  if (pendentes.has(palavra)) {
    /* Nunca chegou ao banco: basta não mandar. */
    pendentes = new Set(pendentes);
    pendentes.delete(palavra);
  } else if (dono && fonte) {
    fonte.apagar(palavra).catch(() => { /* volta na próxima leitura, que é o lado seguro */ });
  }
  guardarNoAparelho();
  avisar();
}

/** Ouve toda mudança; devolve a função que para de ouvir. */
export function ouvirDicionario(f: (palavras: ReadonlySet<string>) => void): () => void {
  ouvintes.add(f);
  return () => { ouvintes.delete(f); };
}

/**
 * Liga o dicionário à conta de quem entrou (`null`: ninguém entrou). Mostra
 * na hora a cópia do aparelho, lê a conta, junta o que estava pendente e o
 * sobe. Devolve quando a leitura termina — com ou sem rede.
 */
export async function conectarDicionario(novoDono: string | null, novaFonte: FonteDaConta | null): Promise<void> {
  const g = ++geracao;
  dono = novoDono;
  fonte = novoDono ? novaFonte : null;
  const copia = lerDoAparelho(dono);
  palavras = new Set(copia.palavras);
  pendentes = new Set(dono ? copia.pendentes : []);
  avisar();
  if (!dono || !fonte) return;
  let daConta: string[];
  try {
    daConta = await fonte.ler();
  } catch {
    return; /* sem rede: vale a cópia, e as pendentes esperam */
  }
  if (g !== geracao) return;
  /* A conta é a verdade, mais o que ainda não subiu. */
  palavras = new Set([...daConta.filter(palavraValida), ...pendentes]);
  guardarNoAparelho();
  avisar();
  for (const p of pendentes) subir(p, fonte, g);
}

/**
 * Apaga a cópia da conta neste navegador, ao sair. As palavras continuam na
 * conta; o que sai é o rastro delas no computador que é de todo mundo. O que
 * ainda estava pendente se perde — é o preço de sair sem rede, e é pequeno.
 */
export function esquecerDicionarioDoAparelho(): void {
  if (dono) {
    try { globalThis.localStorage?.removeItem(chaveDe(dono)); } catch { /* nada a apagar */ }
  }
  void conectarDicionario(null, null);
}

/** Para as travas: volta ao que o aparelho guarda, sem conta. */
export function recarregarDicionario(): void {
  geracao++;
  dono = null;
  fonte = null;
  pendentes = new Set();
  palavras = new Set(lerDoAparelho(null).palavras);
  avisar();
}
