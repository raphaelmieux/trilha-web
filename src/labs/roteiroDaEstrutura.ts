import { acharNo, filhosDe, caminhoDe, type No } from './arquivos';

/*
 * O roteiro da apresentação da estrutura de pastas (requisito 9).
 *
 * ── O que a plataforma faz, e o que ela não faz ──────────────────────────
 * O requisito 9 pede apresentar ao examinador a estrutura criada, explicando
 * a lógica adotada. Isso acontece fora daqui — é conversa com uma pessoa — e a
 * plataforma não confere nada dela, como já vale para o requisito 7 da CC002 e
 * o 8 da CC003.
 *
 * O que ela faz é **preparar**: lê a árvore que a pessoa montou e escreve, em
 * português, o que cada pedaço dela é, para treinar com a própria estrutura na
 * frente. Escrever copiando é possível; explicar copiando não é, e é por isso
 * que a metade difícil do requisito é a segunda.
 *
 * ── Primeira pessoa, porque é para falar ─────────────────────────────────
 * Vale o que está escrito em `roteiroDePython.ts`: "esta pasta guarda as
 * fotos" se lê, "aqui eu guardo as fotos" se fala. O roteiro é texto de boca,
 * e não legenda de figura.
 *
 * ── E ele descreve, não julga ────────────────────────────────────────────
 * Também como o roteiro de Python: nada aqui diz que a estrutura está boa ou
 * ruim. Quem avalia é o examinador, e uma plataforma que desse nota à
 * organização alheia estaria inventando um critério que o documento oficial
 * não tem — cada clube organiza como precisa.
 */

/** Uma linha do roteiro: o recuo diz o nível, e o texto é o que se fala. */
export interface FalaDoRoteiro {
  nivel: number;
  texto: string;
}

const plural = (n: number, um: string, muitos: string) =>
  `${n} ${n === 1 ? um : muitos}`;

/**
 * Como se chama o que está dentro de uma pasta, para a frase sair natural.
 *
 * "3 arquivos e 2 pastas" é o que a pessoa vai dizer; "5 itens" é o que o
 * computador diria. A diferença importa porque o roteiro é para falar.
 */
function conteudoEmPalavras(arvore: No[], id: string): string {
  const filhos = filhosDe(arvore, id);
  const pastas = filhos.filter(f => f.tipo === 'pasta').length;
  const arquivos = filhos.length - pastas;

  if (!filhos.length) return 'ainda está vazia';
  const partes: string[] = [];
  if (pastas) partes.push(plural(pastas, 'pasta', 'pastas'));
  if (arquivos) partes.push(plural(arquivos, 'arquivo', 'arquivos'));
  return `guarda ${partes.join(' e ')}`;
}

/**
 * O roteiro do ramo que começa na pasta dada.
 *
 * Só pastas descem: o que se apresenta é a **estrutura**, e ler um por um os
 * nomes dos arquivos viraria um inventário — que é justamente o que a
 * organização em pastas existe para não precisar.
 */
export function roteiroDaEstrutura(arvore: No[], raizId: string): FalaDoRoteiro[] {
  const raiz = acharNo(arvore, raizId);
  if (!raiz) return [];

  const falas: FalaDoRoteiro[] = [];
  const caminho = caminhoDe(arvore, raizId).map(n => n.nome).join(' › ');

  falas.push({
    nivel: 0,
    texto: `Comecei em ${caminho}. A pasta ${raiz.nome} é a raiz do projeto: `
      + `${conteudoEmPalavras(arvore, raizId)}.`,
  });

  const descer = (paiId: string, nivel: number) => {
    for (const f of filhosDe(arvore, paiId).filter(n => n.tipo === 'pasta')) {
      const dentro = filhosDe(arvore, f.id);
      const subpastas = dentro.filter(d => d.tipo === 'pasta');

      /*
        A frase muda com o que a pasta tem dentro, e é de propósito: uma pasta
        que só tem subpastas é divisão, e uma que só tem arquivo é onde o
        trabalho mora. Dizer "guarda 2 itens" nos dois casos faria a pessoa
        falar a mesma frase sobre coisas diferentes.
      */
      const papel = subpastas.length && subpastas.length === dentro.length
        ? `divide o que está abaixo em ${plural(subpastas.length, 'parte', 'partes')}`
        : conteudoEmPalavras(arvore, f.id);

      falas.push({ nivel: nivel + 1, texto: `Dentro dela, ${f.nome} ${papel}.` });
      descer(f.id, nivel + 1);
    }
  };
  descer(raizId, 0);

  /*
    A última fala é a pergunta que o examinador vai fazer, e ela fica sem
    resposta escrita de propósito: a lógica é de quem organizou. Escrever uma
    resposta plausível aqui entregaria o gabarito da metade do requisito que
    não é de clicar.
  */
  falas.push({
    nivel: 0,
    texto: 'Agora explique por que dividiu assim: o que você procuraria primeiro '
      + 'daqui a seis meses, e em que pasta isso estaria.',
  });
  return falas;
}

/**
 * A profundidade do ramo, contando a própria pasta como nível 1.
 *
 * É a conta do requisito 4.1 — "hierarquia com, no mínimo, três níveis" —, e
 * ela mora aqui, junto do roteiro, porque as duas leem a mesma árvore do mesmo
 * jeito. Duas leituras parecidas discordam um dia, e aí a tarefa ficaria verde
 * numa estrutura que o roteiro descreve com dois níveis.
 */
export function profundidade(arvore: No[], id: string): number {
  const filhas = filhosDe(arvore, id).filter(n => n.tipo === 'pasta');
  if (!filhas.length) return 1;
  return 1 + Math.max(...filhas.map(f => profundidade(arvore, f.id)));
}
