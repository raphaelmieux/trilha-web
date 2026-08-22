/*
 * A árvore de pastas e arquivos do laboratório.
 *
 * A versão anterior tinha três "lugares" planos — Área de Trabalho, Documentos
 * e Lixeira — e nada dentro deles. Dava para praticar as seis operações, mas não
 * se parecia com nenhum computador: pasta que não se abre não é pasta, é
 * categoria. E "copiar uma pasta de um local para outro", que é o requisito
 * 5.2, fica sem sentido quando só existem três locais fixos.
 *
 * Aqui existe hierarquia de verdade, e com ela aparecem as regras que todo
 * gerenciador de arquivos tem e que a versão plana nunca precisou ter: copiar
 * uma pasta leva junto o que está dentro dela; mover uma pasta para dentro de si
 * mesma é recusado; dois irmãos não podem ter o mesmo nome.
 *
 * Tudo aqui é função pura sobre uma lista de nós. O componente cuida da tela; as
 * regras ficam neste arquivo, onde dá para testá-las.
 */

export type TipoNo = 'pasta' | 'arquivo' | 'atalho';

export interface No {
  id: string;
  nome: string;
  tipo: TipoNo;
  /** `null` só nas raízes. */
  paiId: string | null;
  tamanhoKb: number;
  /** Em milissegundos, como `Date.now()`. */
  modificadoEm: number;
  /** De onde veio, para a Lixeira saber restaurar. */
  voltaPara?: string | null;
  /** O alvo de um atalho — é o que o faz ocupar quase nada. */
  apontaPara?: string;
}

export const AREA = 'area';
export const DOCUMENTOS = 'documentos';
export const LIXEIRA = 'lixeira';

/** As três raízes, que não podem ser movidas, renomeadas nem excluídas. */
export const RAIZES = [AREA, DOCUMENTOS, LIXEIRA];

export const ehRaiz = (id: string) => RAIZES.includes(id);

/* ── Consultas ────────────────────────────────────────────────────────────── */

export const acharNo = (arvore: No[], id: string | null): No | undefined =>
  id ? arvore.find(n => n.id === id) : undefined;

export const filhosDe = (arvore: No[], paiId: string): No[] =>
  arvore.filter(n => n.paiId === paiId);

/**
 * O caminho da raiz até o nó, para a barra de endereço.
 *
 * Sobe pelos pais em vez de descer pela árvore: é uma volta por nível, e não
 * uma varredura por item.
 */
export function caminhoDe(arvore: No[], id: string): No[] {
  const caminho: No[] = [];
  let atual = acharNo(arvore, id);
  /* O limite existe para o caso de uma árvore corrompida com um ciclo: sem ele,
     um pai que aponta para um descendente travaria a tela. */
  let voltas = 0;
  while (atual && voltas++ < 100) {
    caminho.unshift(atual);
    atual = acharNo(arvore, atual.paiId);
  }
  return caminho;
}

/** `alvo` está dentro de `possivelAncestral`, em qualquer profundidade? */
export function ehDescendente(arvore: No[], alvo: string, possivelAncestral: string): boolean {
  let atual = acharNo(arvore, alvo);
  let voltas = 0;
  while (atual?.paiId && voltas++ < 100) {
    if (atual.paiId === possivelAncestral) return true;
    atual = acharNo(arvore, atual.paiId);
  }
  return false;
}

/**
 * Dá para soltar `id` dentro de `destino`?
 *
 * Três recusas, todas do Explorer: pasta não entra em si mesma, pasta não entra
 * num descendente dela (o que a apagaria da árvore), e nada é solto onde já
 * está. Só pasta recebe.
 */
export function podeSoltarEm(arvore: No[], id: string, destino: string): boolean {
  if (id === destino) return false;
  const alvo = acharNo(arvore, id);
  const pasta = acharNo(arvore, destino);
  if (!alvo || !pasta || pasta.tipo !== 'pasta') return false;
  if (alvo.paiId === destino) return false;
  if (ehDescendente(arvore, destino, id)) return false;
  return true;
}

/* ── Nomes ────────────────────────────────────────────────────────────────── */

/**
 * Um nome livre dentro da pasta, no formato do Windows: "Nova pasta (2)".
 *
 * Dois irmãos com o mesmo nome deixariam a tela ambígua e a cópia sem sentido —
 * copiar para o mesmo lugar precisa produzir alguma coisa distinguível.
 */
export function nomeDisponivel(arvore: No[], paiId: string, desejado: string, ignorarId?: string): string {
  const usados = new Set(
    filhosDe(arvore, paiId)
      .filter(n => n.id !== ignorarId)
      .map(n => n.nome.toLocaleLowerCase('pt-BR')),
  );
  if (!usados.has(desejado.toLocaleLowerCase('pt-BR'))) return desejado;

  const ponto = desejado.lastIndexOf('.');
  const base = ponto > 0 ? desejado.slice(0, ponto) : desejado;
  const ext = ponto > 0 ? desejado.slice(ponto) : '';
  for (let n = 2; n < 1000; n++) {
    const tentativa = `${base} (${n})${ext}`;
    if (!usados.has(tentativa.toLocaleLowerCase('pt-BR'))) return tentativa;
  }
  return `${base} (${Date.now()})${ext}`;
}

/* ── Ordenação ────────────────────────────────────────────────────────────── */

export type Coluna = 'nome' | 'modificado' | 'tipo' | 'tamanho';

const ROTULO_TIPO: Record<TipoNo, string> = {
  pasta: 'Pasta de arquivos',
  arquivo: 'Arquivo',
  atalho: 'Atalho',
};

export const rotuloDoTipo = (n: No): string =>
  n.tipo === 'arquivo' ? tipoPelaExtensao(n.nome) : ROTULO_TIPO[n.tipo];

function tipoPelaExtensao(nome: string): string {
  const ext = nome.slice(nome.lastIndexOf('.') + 1).toLowerCase();
  const conhecidos: Record<string, string> = {
    jpg: 'Imagem JPEG', jpeg: 'Imagem JPEG', png: 'Imagem PNG',
    txt: 'Documento de texto', pdf: 'Documento PDF', doc: 'Documento', docx: 'Documento',
    mp3: 'Áudio MP3', mp4: 'Vídeo MP4',
  };
  return conhecidos[ext] ?? 'Arquivo';
}

/**
 * Ordena como o Explorer: pastas primeiro, sempre, e só depois o critério.
 *
 * Manter as pastas em cima mesmo na ordem decrescente é o que todo gerenciador
 * faz, e é o que deixa a lista navegável — inverter tudo jogaria as pastas para
 * o fim e obrigaria a rolar até embaixo para entrar em qualquer uma.
 */
export function ordenar(itens: No[], coluna: Coluna, crescente: boolean): No[] {
  const peso = (n: No) => (n.tipo === 'pasta' ? 0 : 1);
  const sentido = crescente ? 1 : -1;

  return [...itens].sort((a, b) => {
    if (peso(a) !== peso(b)) return peso(a) - peso(b);
    let d = 0;
    switch (coluna) {
      case 'nome': d = a.nome.localeCompare(b.nome, 'pt-BR'); break;
      case 'modificado': d = a.modificadoEm - b.modificadoEm; break;
      case 'tipo': d = rotuloDoTipo(a).localeCompare(rotuloDoTipo(b), 'pt-BR'); break;
      case 'tamanho': d = a.tamanhoKb - b.tamanhoKb; break;
    }
    /* Empate desfeito pelo nome: sem isso, duas linhas de mesmo tamanho trocam
       de lugar a cada reordenação, e a lista parece instável. */
    return (d || a.nome.localeCompare(b.nome, 'pt-BR')) * sentido;
  });
}

/* ── Operações ────────────────────────────────────────────────────────────── */

/** Gera ids únicos dentro de uma sessão do laboratório. */
export function criarGerador(prefixo = 'n') {
  let n = 0;
  return () => `${prefixo}${++n}`;
}

/**
 * Copia um nó e, sendo pasta, tudo o que está dentro.
 *
 * A cópia rasa é o erro clássico aqui: a pasta aparece no destino vazia, e o
 * desbravador conclui que copiar perde o conteúdo — exatamente o contrário do
 * que o requisito quer ensinar.
 */
export function copiarPara(
  arvore: No[],
  id: string,
  destinoId: string,
  novoId: () => string,
  agora: number,
): No[] {
  const original = acharNo(arvore, id);
  if (!original) return arvore;

  const novos: No[] = [];
  const copiarRamo = (deId: string, paiDestino: string, nomeForcado?: string) => {
    const no = acharNo(arvore, deId)!;
    const meuId = novoId();
    novos.push({
      ...no,
      id: meuId,
      paiId: paiDestino,
      nome: nomeForcado ?? no.nome,
      modificadoEm: agora,
      voltaPara: undefined,
    });
    for (const filho of filhosDe(arvore, deId)) copiarRamo(filho.id, meuId);
  };

  copiarRamo(id, destinoId, nomeDisponivel(arvore, destinoId, original.nome));
  return [...arvore, ...novos];
}

export function moverPara(arvore: No[], id: string, destinoId: string, agora: number): No[] {
  if (!podeSoltarEm(arvore, id, destinoId)) return arvore;
  const no = acharNo(arvore, id)!;
  const nome = nomeDisponivel(arvore, destinoId, no.nome, id);
  return arvore.map(n =>
    n.id === id ? { ...n, paiId: destinoId, nome, modificadoEm: agora, voltaPara: undefined } : n);
}

/** Para a Lixeira, lembrando de onde veio. */
export function mandarParaLixeira(arvore: No[], id: string): No[] {
  const no = acharNo(arvore, id);
  if (!no || ehRaiz(id)) return arvore;
  const nome = nomeDisponivel(arvore, LIXEIRA, no.nome, id);
  return arvore.map(n =>
    n.id === id ? { ...n, paiId: LIXEIRA, nome, voltaPara: no.paiId } : n);
}

export function restaurar(arvore: No[], id: string): No[] {
  const no = acharNo(arvore, id);
  if (!no) return arvore;
  const destino = no.voltaPara && acharNo(arvore, no.voltaPara) ? no.voltaPara : AREA;
  const nome = nomeDisponivel(arvore, destino, no.nome, id);
  return arvore.map(n => (n.id === id ? { ...n, paiId: destino, nome, voltaPara: undefined } : n));
}

/** Apaga a Lixeira inteira, inclusive o que estiver dentro de pastas lá. */
export function esvaziarLixeira(arvore: No[]): No[] {
  const condenados = new Set<string>();
  const marcar = (paiId: string) => {
    for (const f of filhosDe(arvore, paiId)) { condenados.add(f.id); marcar(f.id); }
  };
  marcar(LIXEIRA);
  return arvore.filter(n => !condenados.has(n.id));
}

/* ── Apresentação ─────────────────────────────────────────────────────────── */

export function formatarTamanho(n: No): string {
  if (n.tipo === 'pasta') return '';
  if (n.tamanhoKb >= 1024) return `${(n.tamanhoKb / 1024).toFixed(1).replace('.', ',')} MB`;
  return `${n.tamanhoKb} KB`;
}

export function formatarData(ms: number): string {
  const d = new Date(ms);
  const dois = (v: number) => String(v).padStart(2, '0');
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}
