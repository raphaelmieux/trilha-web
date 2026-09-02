import { ehContainer, type Bloco, type Personagem, type Pilha } from './blocos';

/**
 * As operações sobre a árvore de blocos.
 *
 * Ficam aqui, e não na tela, por dois motivos. Elas são as únicas partes do
 * editor que podem corromper o projeto — inserir dentro do bloco errado,
 * perder um ramo ao remover um container — e isso se testa sem montar tela
 * nenhuma. E são recursivas: um bloco pode estar dentro de um `se` dentro de um
 * `sempre`, e a mesma função precisa achá-lo em qualquer profundidade.
 *
 * Todas devolvem uma árvore nova. O React redesenha por identidade, e mutar a
 * de dentro faria a tela não repintar em algumas mudanças e repintar em outras
 * — o pior tipo de defeito, porque parece intermitente.
 */

/** Insere `novo` logo depois do bloco `depois`, em qualquer profundidade. */
export function inserirDepois(blocos: Bloco[], depois: string, novo: Bloco): Bloco[] {
  const saida: Bloco[] = [];
  for (const b of blocos) {
    const atual = ehContainer(b)
      ? { ...b, corpo: inserirDepois(b.corpo, depois, novo) }
      : b;
    saida.push(atual);
    if (b.id === depois) saida.push(novo);
  }
  return saida;
}

/** Insere `novo` no fim do corpo do container `dentro`. */
export function inserirDentro(blocos: Bloco[], dentro: string, novo: Bloco): Bloco[] {
  return blocos.map(b => {
    if (!ehContainer(b)) return b;
    if (b.id === dentro) return { ...b, corpo: [...b.corpo, novo] };
    return { ...b, corpo: inserirDentro(b.corpo, dentro, novo) };
  });
}

/**
 * Remove um bloco, e com ele o que estava dentro.
 *
 * O que está dentro vai junto de propósito: no Scratch, arrastar um `repita`
 * para o lixo leva o corpo. Preservar os filhos os despejaria soltos na pilha,
 * mudando o programa em vez de encolhê-lo.
 */
export function remover(blocos: Bloco[], id: string): Bloco[] {
  return blocos
    .filter(b => b.id !== id)
    .map(b => (ehContainer(b) ? { ...b, corpo: remover(b.corpo, id) } : b));
}

/**
 * Troca o bloco de lugar com o vizinho, dentro da lista em que ele está.
 *
 * Só entre irmãos: subir um bloco não o tira de dentro do laço. Fazer isso
 * pediria uma decisão sobre onde ele cai, e um movimento que às vezes muda o
 * aninhamento é um movimento que ninguém consegue prever.
 */
export function mover(blocos: Bloco[], id: string, direcao: -1 | 1, raiz = true): Bloco[] {
  const i = blocos.findIndex(b => b.id === id);
  if (i !== -1) {
    const j = i + direcao;
    if (j < 0 || j >= blocos.length) return blocos;
    /*
      O chapéu fica no topo, e só no topo da pilha.

      Trocá-lo de lugar deixaria a pilha sem gatilho e silenciosamente morta. A
      trava vale para a raiz e não para o corpo de um container: lá dentro a
      primeira posição é um bloco comum, e proibi-la de subir trancava o
      primeiro bloco de todo laço no lugar. Foi o teste que pegou.
    */
    if (raiz && (i === 0 || j === 0)) return blocos;
    const copia = [...blocos];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    return copia;
  }
  return blocos.map(b => (ehContainer(b) ? { ...b, corpo: mover(b.corpo, id, direcao, false) } : b));
}

/** Aplica uma mudança de campo a um bloco, onde quer que ele esteja. */
export function alterar(blocos: Bloco[], id: string, mudanca: Partial<Bloco>): Bloco[] {
  return blocos.map(b => {
    const atual = b.id === id ? ({ ...b, ...mudanca } as Bloco) : b;
    return ehContainer(atual) ? { ...atual, corpo: alterar(atual.corpo, id, mudanca) } : atual;
  });
}

/** Existe este bloco em algum lugar da pilha? */
export function contem(blocos: Bloco[], id: string): boolean {
  return blocos.some(b => b.id === id || (ehContainer(b) && contem(b.corpo, id)));
}

/* ────────────────────────────────────────────────────────────────────────
   Sobre o personagem inteiro
   ──────────────────────────────────────────────────────────────────────── */

/** A mesma operação, aplicada à pilha certa de um personagem. */
export function naPilha(
  p: Personagem,
  pilhaId: string,
  operacao: (blocos: Bloco[]) => Bloco[],
): Personagem {
  return {
    ...p,
    pilhas: p.pilhas.map(pl => (pl.id === pilhaId ? { ...pl, blocos: operacao(pl.blocos) } : pl)),
  };
}

/** Descarta as pilhas que ficaram sem nenhum bloco. */
export const semPilhasVazias = (pilhas: Pilha[]) => pilhas.filter(p => p.blocos.length > 0);
