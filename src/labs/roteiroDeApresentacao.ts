import {
  ehContainer, textoDaCondicao,
  type Bloco, type Personagem, type Projeto,
} from './blocos';

/**
 * O roteiro da apresentação, escrito a partir do projeto que a pessoa montou.
 *
 * ── Por que isto existe ──────────────────────────────────────────────────
 * O requisito 6 da CC001 pede apresentar o jogo ao examinador explicando em voz
 * alta a função de cada grupo de blocos. É o requisito mais difícil e o mais
 * honesto: montar copiando é possível, explicar copiando não é.
 *
 * Ele acontece fora do aplicativo, e a plataforma não tem como conferi-lo. O
 * que ela pode fazer é preparar: ler a árvore que a pessoa montou e dizer, em
 * português, o que cada pilha faz — para ela treinar com o próprio jogo na
 * frente, e não com um exemplo de outra pessoa.
 *
 * ── Ele descreve, e não julga ────────────────────────────────────────────
 * Nada aqui diz se o programa está bom. Quem faz isso é a lista de tarefas do
 * laboratório, que já reprova o laço vazio e o placar que sobe sozinho. Se este
 * texto também opinasse, diria duas vezes a mesma coisa — e diria em voz de
 * professor no momento em que a pessoa acabou de vencer.
 *
 * ── E sai do mesmo `textoDoBloco` da tela ────────────────────────────────
 * O nome do bloco no roteiro é o nome que a pessoa leu na paleta. Dois textos
 * diferentes para o mesmo bloco mandariam procurar uma coisa que não existe —
 * é a mesma razão pela qual `textoDoBloco` mora em `blocos.ts` e não na tela.
 */

export interface TrechoDoRoteiro {
  /** O personagem de quem é a pilha. */
  personagem: string;
  /** Quando esta pilha roda, em português. */
  quando: string;
  /** O que ela faz, uma frase por ideia. */
  faz: string[];
}

/** Quando a pilha roda, lido do chapéu. */
function quando(chapeu: Bloco | undefined): string | null {
  if (!chapeu) return null;
  switch (chapeu.tipo) {
    case 'quandoBandeira': return 'quando eu clico na bandeira verde';
    case 'quandoTecla': return `quando eu aperto a tecla ${chapeu.tecla}`;
    case 'quandoClicado': return 'quando eu clico neste personagem';
    default: return null;
  }
}

/*
  O que cada bloco faz, na primeira pessoa.

  Primeira pessoa porque é o que a pessoa vai dizer em voz alta — "esta pilha
  zera o placar" se lê como legenda, "eu zero o placar" se fala. O roteiro é
  para ser falado, e não lido em silêncio.
*/
function frase(b: Bloco, nomes: Map<string, string>): string {
  const quem = (id: string) => (id === 'borda' ? 'a borda do palco' : nomes.get(id) ?? id);
  switch (b.tipo) {
    case 'mover':
      return b.passos >= 0
        ? `ando ${b.passos} passos para a frente`
        : `ando ${Math.abs(b.passos)} passos para trás`;
    case 'subir':
      return b.passos >= 0 ? `subo ${b.passos} passos` : `desço ${Math.abs(b.passos)} passos`;
    case 'irPara': return `vou para a posição x: ${b.x}, y: ${b.y}`;
    case 'proximoTraje': return 'troco o desenho do personagem, o que dá a impressão de movimento';
    case 'diga': return `mostro o balão dizendo "${b.texto}"`;
    case 'toqueSom': return 'toco um som';
    case 'espere': return `espero ${b.segundos} segundo${b.segundos === 1 ? '' : 's'} antes de seguir`;
    case 'repita': return `repito ${b.vezes} vezes o que está aqui dentro`;
    case 'sempre': return 'fico repetindo o que está aqui dentro, sem parar, para vigiar o tempo todo';
    case 'se':
      return b.condicao.tipo === 'tocando'
        ? `pergunto se estou encostando em ${quem(b.condicao.quem)}, e só faço o que está dentro quando a resposta é sim`
        : `pergunto se ${textoDaCondicao(b.condicao)}, e só faço o que está dentro quando a resposta é sim`;
    /* "zero placar em 0" sai torto, e vira mentira quando o valor não é zero:
       "zero vidas em 3" descreve o contrário do que o bloco faz. */
    case 'definaVariavel':
      return b.valor === 0
        ? `zero ${b.nome}, para a partida começar do começo`
        : `defino ${b.nome} como ${b.valor}`;
    case 'mudeVariavel':
      return b.por >= 0
        ? `somo ${b.por} em ${b.nome}`
        : `tiro ${Math.abs(b.por)} de ${b.nome}`;
    case 'pareTudo': return 'encerro o jogo';
    default: return '';
  }
}

/*
  Um nível de indentação por profundidade.

  O que está dentro de um laço é dito depois dele e recuado, porque é assim que
  se explica: "fico repetindo — e o que eu repito é isto". Sem o recuo, a pessoa
  leria a lista como uma sequência de passos iguais e diria em voz alta a coisa
  errada sobre o próprio programa.
*/
function descer(blocos: Bloco[], nomes: Map<string, string>, nivel = 0): string[] {
  const saida: string[] = [];
  for (const b of blocos) {
    const f = frase(b, nomes);
    if (f) saida.push('  '.repeat(nivel) + f);
    if (ehContainer(b)) {
      saida.push(...(b.corpo.length > 0
        ? descer(b.corpo, nomes, nivel + 1)
        : [`${'  '.repeat(nivel + 1)}(ainda não há nada aqui dentro)`]));
    }
  }
  return saida;
}

function doPersonagem(p: Personagem, nomes: Map<string, string>): TrechoDoRoteiro[] {
  return p.pilhas.flatMap(pilha => {
    const q = quando(pilha.blocos[0]);
    /* Pilha sem chapéu não roda nunca, e um roteiro que a explicasse mandaria
       a pessoa falar de um trecho que o examinador não verá acontecer. */
    if (!q) return [];
    return [{
      personagem: p.nome,
      quando: q,
      faz: descer(pilha.blocos.slice(1), nomes),
    }];
  });
}

/** O roteiro inteiro, na ordem dos personagens e das pilhas. */
export function roteiroDeApresentacao(projeto: Projeto): TrechoDoRoteiro[] {
  const nomes = new Map(projeto.personagens.map(p => [p.id, p.nome]));
  return projeto.personagens.flatMap(p => doPersonagem(p, nomes));
}

/** As pilhas que não rodam, para dizer à pessoa que elas existem. */
export function pilhasSemChapeu(projeto: Projeto): number {
  return projeto.personagens.reduce(
    (n, p) => n + p.pilhas.filter(pilha => !quando(pilha.blocos[0])).length, 0);
}
