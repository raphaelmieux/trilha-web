import { EVENTOS_DAS_CURIOSIDADES, type CuriosidadeGravada } from './eventosDasCuriosidades';

/*
  O registro das curiosidades: a porta por onde as simulações dizem "isto
  aconteceu" sem saber quem está entrado nem como se grava.

  ── Por que um módulo, e não `logActivity` em cada tela ─────────────────────
  As curiosidades nascem em lugares que não sabem de conta nenhuma — a
  moldura dos laboratórios, o terminal, a grade do Excel, a página pública de
  verificação. Passar o id da pessoa até lá seria abrir uma prop em vinte
  componentes para gravar um evento que não muda nada na tela deles. Quem liga
  as duas pontas é o `AuthProvider`, pelo **id** da conta — a mesma decisão do
  dicionário pessoal.

  ── Uma vez, e não a cada clique ────────────────────────────────────────────
  Abrir o menu do botão direito é gesto de todo minuto, e cada um virando uma
  linha em `activity_events` encheria a tabela de coisa que a regra lê uma vez
  só. Cada evento, com o mesmo conteúdo, grava **uma vez por conta neste
  navegador**: a lista do que já se gravou fica numa chave com o id da conta,
  como a cópia do dicionário. Noutro aparelho ele grava de novo uma vez, e a
  regra fica com a primeira data — que é a que vale.

  Sem ninguém entrado não se grava nada: curiosidade é da conta, e o
  computador do clube é de todo mundo.

  ── E a insígnia cai na hora ────────────────────────────────────────────────
  Depois de gravar, quem conectou o registro avalia as insígnias — senão
  achar um segredo daria o prêmio só na próxima lição, e o segredo deixaria de
  parecer achado. A avaliação espera um instante e junta o que chegou junto:
  cinco atalhos em dois segundos são uma avaliação, e não cinco.
*/

/** Quem grava o evento e quem avalia depois. É uma porta para que as travas não precisem de banco. */
export interface GravadorDeCuriosidades {
  gravar: (eventType: string, metadata: Record<string, string>) => Promise<void>;
  avaliar: () => void;
}

const CHAVE = (dono: string) => `trilha-web:curiosidades-gravadas:${dono}`;
/* O mesmo evento com conteúdos diferentes é que se acumula — atalhos, lições
   consultadas. Um teto deixa a lista do aparelho pequena, e o que passar dele
   continua sendo gravado sem lembrança: perde-se só a economia. */
const TETO = 400;
const ESPERA_PARA_AVALIAR = 1500;

let dono: string | null = null;
let gravador: GravadorDeCuriosidades | null = null;
let gravados = new Set<string>();
let relogio: ReturnType<typeof setTimeout> | null = null;

function lerDoAparelho(de: string): Set<string> {
  try {
    const lido: unknown = JSON.parse(globalThis.localStorage?.getItem(CHAVE(de)) ?? '[]');
    return new Set(Array.isArray(lido) ? lido.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function guardarNoAparelho() {
  if (!dono) return;
  try {
    globalThis.localStorage?.setItem(CHAVE(dono), JSON.stringify([...gravados].slice(-TETO)));
  } catch { /* sem memória no aparelho: grava de novo da próxima vez, e a regra fica com a primeira data */ }
}

/** Liga o registro a uma conta, ou o desliga com `null`. */
export function conectarCuriosidades(id: string | null, g: GravadorDeCuriosidades | null): void {
  if (relogio) clearTimeout(relogio);
  relogio = null;
  dono = id;
  gravador = id ? g : null;
  gravados = id ? lerDoAparelho(id) : new Set();
}

/** A chave do que já foi gravado: o tipo e o conteúdo, em ordem fixa. */
function chaveDe(tipo: CuriosidadeGravada, metadata: Record<string, string>): string {
  return tipo + JSON.stringify(Object.keys(metadata).sort().map(k => [k, metadata[k]]));
}

/**
 * Diz que uma curiosidade aconteceu. Não espera nada e nunca estoura: a
 * simulação que chama não tem o que fazer com uma falha de gravação.
 */
export function registrarCuriosidade(tipo: CuriosidadeGravada, metadata: Record<string, string> = {}): void {
  if (!dono || !gravador) return;
  const chave = chaveDe(tipo, metadata);
  if (gravados.has(chave)) return;
  gravados.add(chave);
  guardarNoAparelho();
  const g = gravador;
  const de = dono;
  g.gravar(EVENTOS_DAS_CURIOSIDADES[tipo], metadata).then(() => {
    /* A conta pode ter saído enquanto gravava: avaliar seria avaliar outra. */
    if (dono !== de) return;
    if (relogio) clearTimeout(relogio);
    relogio = setTimeout(() => { relogio = null; g.avaliar(); }, ESPERA_PARA_AVALIAR);
  }).catch(() => {
    /* Não gravou: esquecer a lembrança deixa a próxima vez tentar de novo. */
    gravados.delete(chave);
    guardarNoAparelho();
  });
}

/** Um segredo achado. É um evento só, com o código do segredo dentro. */
export function acharSegredo(codigo: string): void {
  registrarCuriosidade('segredo', { segredo: codigo });
}
