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
  /**
   * Só para o pacote compactado: o que ele leva dentro.
   *
   * O zip aparece na lista como arquivo, com um tamanho só, e é assim que ele
   * é no Explorador — abrir é outra ação. Guardar os nós empacotados aqui, e
   * não como filhos, é o que faz `filhosDe` continuar contando o que está na
   * pasta, e não o que está dentro do pacote.
   */
  empacotado?: No[];
  /**
   * Só para arquivo: o que há dentro dele, numa linha.
   *
   * A lista de versões precisa dizer o que cada uma tinha, senão ela é uma
   * coluna de datas e escolher uma vira sorteio. Como não há conteúdo de
   * verdade nesta simulação, o rótulo é ele — e ele acompanha o arquivo quando
   * uma versão vira histórico.
   */
  rotulo?: string;
  /**
   * Só para arquivo: as versões anteriores, da mais nova para a mais antiga.
   *
   * O requisito 8 pede recuperar versão anterior, e isso não é restaurar de
   * cópia de segurança: o arquivo está lá e está errado. Sem guardar o que ele
   * era, não há de onde voltar — e é essa a diferença que o módulo 7 ensina.
   */
  versoes?: VersaoAnterior[];
}

/** Um retrato de um arquivo antes de alguém salvar por cima. */
export interface VersaoAnterior {
  /** Quando aquela versão foi gravada. */
  em: number;
  /** O que ela tinha, em uma linha, para a lista de versões poder dizer. */
  rotulo: string;
  tamanhoKb: number;
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

/* ── Busca (requisito 4.3) ────────────────────────────────────────────────── */

/** Sem acento e em minúsculas, para "autorização" achar "autorizacao". */
const achatar = (t: string) =>
  t.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu, '');

export interface FiltroDaBusca {
  /** Um pedaço do nome. Vazio não filtra nada — quem filtra são os outros. */
  termo?: string;
  /** A família do arquivo, de `tiposDeArquivo`, ou a palavra pasta. */
  tipo?: string;
  /** Modificado a partir de, e até. Em milissegundos. */
  de?: number;
  ate?: number;
}

/**
 * Procura na pasta e em tudo o que está abaixo dela.
 *
 * ── Por que os filtros e não só o nome ───────────────────────────────────
 * A busca por nome só serve a quem lembra o nome, e o requisito 4.3 pede
 * justamente o contrário: achar filtrando por tipo e por data. É o caso de
 * quem lembra que era um documento, do começo do ano, e mais nada.
 *
 * Os critérios se somam, e não se alternam: cada um que se acrescenta reduz a
 * lista. Um filtro que alargasse o resultado não filtraria coisa nenhuma.
 *
 * A Lixeira fica de fora quando a busca começa de uma raiz: o que foi excluído
 * não é resultado de busca em nenhum gerenciador de arquivos, e mostrá-lo faria
 * a pessoa abrir um arquivo que ela acabou de mandar embora.
 */
export function buscar(
  arvore: No[],
  raizId: string,
  filtro: FiltroDaBusca,
  familiaDe: (nome: string) => string | null,
): No[] {
  const dentro: No[] = [];
  const descer = (paiId: string) => {
    for (const f of filhosDe(arvore, paiId)) {
      if (f.id === LIXEIRA) continue;
      dentro.push(f);
      if (f.tipo === 'pasta') descer(f.id);
    }
  };
  descer(raizId);

  const termo = achatar(filtro.termo ?? '').trim();
  return dentro.filter(n => {
    if (termo && !achatar(n.nome).includes(termo)) return false;
    if (filtro.tipo) {
      const familia = n.tipo === 'pasta' ? 'pasta' : familiaDe(n.nome);
      if (familia !== filtro.tipo) return false;
    }
    if (filtro.de !== undefined && n.modificadoEm < filtro.de) return false;
    if (filtro.ate !== undefined && n.modificadoEm > filtro.ate) return false;
    return true;
  });
}

/* ── Compactar e descompactar (requisitos 1.6 e 4.5) ──────────────────────── */

/**
 * O quanto um pacote encolhe o que ele leva.
 *
 * Um número só, e é honesto que seja: o que decide a taxa de verdade é o
 * conteúdo — texto encolhe muito, foto já compactada não encolhe quase nada.
 * Fingir uma taxa por tipo daria a impressão de precisão que a simulação não
 * tem. O que a lição precisa mostrar é que encolhe, e que o original continua
 * lá.
 */
export const TAXA_DO_PACOTE = 0.6;

/** Todos os nós de um ramo, o próprio incluído. */
function ramo(arvore: No[], id: string): No[] {
  const no = acharNo(arvore, id);
  if (!no) return [];
  return [no, ...filhosDe(arvore, id).flatMap(f => ramo(arvore, f.id))];
}

/**
 * Faz um pacote com os itens dados, na pasta em que eles estão.
 *
 * O pacote é uma **cópia**: os originais continuam onde estavam. É a armadilha
 * que a lição nomeia — quem compacta para liberar espaço e não apaga o original
 * acabou de ocupar mais espaço do que antes —, e ela só existe porque aqui o
 * comportamento é o do Windows, e não o que seria conveniente.
 */
export function compactar(
  arvore: No[],
  ids: string[],
  nomeDoPacote: string,
  novoId: () => string,
  agora: number,
): { arvore: No[]; pacoteId: string | null } {
  const alvos = ids.map(id => acharNo(arvore, id)).filter((n): n is No => !!n);
  if (!alvos.length) return { arvore, pacoteId: null };

  const paiId = alvos[0].paiId;
  if (!paiId) return { arvore, pacoteId: null };

  const dentro = alvos.flatMap(a => ramo(arvore, a.id));
  const bruto = dentro.reduce((s, n) => s + n.tamanhoKb, 0);
  const pacoteId = novoId();

  const pacote: No = {
    id: pacoteId,
    nome: nomeDisponivel(arvore, paiId, nomeDoPacote),
    tipo: 'arquivo',
    paiId,
    tamanhoKb: Math.max(1, Math.round(bruto * TAXA_DO_PACOTE)),
    modificadoEm: agora,
    /* Os nós vão com o pai original: é o que permite descompactar recriando a
       mesma estrutura, e não uma pilha achatada de arquivos soltos. */
    empacotado: dentro.map(n => ({ ...n })),
  };
  return { arvore: [...arvore, pacote], pacoteId };
}

/**
 * Tira o conteúdo do pacote e o põe na pasta em que o pacote está.
 *
 * O que sai é igual ao que entrou, e é o ponto da lição: zip é compactação sem
 * perda. Os ids são novos porque os antigos podem ainda estar em uso — quem
 * compactou e não apagou tem os dois.
 */
export function descompactar(
  arvore: No[],
  pacoteId: string,
  novoId: () => string,
  agora: number,
): No[] {
  const pacote = acharNo(arvore, pacoteId);
  if (!pacote?.empacotado?.length || !pacote.paiId) return arvore;

  /* De id antigo para id novo, para os pais de dentro do pacote continuarem
     apontando uns para os outros depois de recriados. */
  const traduzir = new Map<string, string>();
  for (const n of pacote.empacotado) traduzir.set(n.id, novoId());

  const raizes = new Set(
    pacote.empacotado.filter(n => !traduzir.has(n.paiId ?? '')).map(n => n.id),
  );

  const novos = pacote.empacotado.map(n => ({
    ...n,
    id: traduzir.get(n.id)!,
    /* O que estava no topo do pacote cai na pasta; o resto mantém o pai. */
    paiId: raizes.has(n.id) ? pacote.paiId! : traduzir.get(n.paiId ?? '')!,
    nome: raizes.has(n.id) ? nomeDisponivel(arvore, pacote.paiId!, n.nome) : n.nome,
    modificadoEm: agora,
    empacotado: undefined,
  }));

  return [...arvore, ...novos];
}

/* ── Versão anterior (requisito 8) ────────────────────────────────────────── */

/**
 * Grava por cima, guardando o que havia antes.
 *
 * É o que acontece quando alguém salva: o arquivo continua lá, com outro
 * conteúdo. A versão de antes só existe depois porque alguém a guardou — e é
 * essa a diferença entre um arquivo que dá para voltar e um que não dá.
 */
export function salvarPorCima(
  arvore: No[], id: string, conteudoNovo: { rotulo: string; tamanhoKb: number }, agora: number,
): No[] {
  const no = acharNo(arvore, id);
  if (!no || no.tipo !== 'arquivo') return arvore;
  /* O que sai vira histórico com o rótulo que ele tinha — e não com o que
     está entrando. Copiar o rótulo novo para a versão antiga faria a lista de
     versões descrever todas elas como a de agora, que é a única que não
     interessa recuperar. */
  const anterior: VersaoAnterior = {
    em: no.modificadoEm,
    rotulo: no.rotulo ?? no.nome,
    tamanhoKb: no.tamanhoKb,
  };
  return arvore.map(n => (n.id === id
    ? {
      ...n,
      rotulo: conteudoNovo.rotulo,
      tamanhoKb: conteudoNovo.tamanhoKb,
      modificadoEm: agora,
      versoes: [anterior, ...(n.versoes ?? [])],
    }
    : n));
}

/**
 * Volta o arquivo para uma das versões guardadas.
 *
 * A versão atual entra no histórico antes, e não depois: restaurar sem guardar
 * o de agora trocaria uma perda por outra, e quem restaurou a versão errada
 * ficaria sem as duas.
 */
export function restaurarVersao(arvore: No[], id: string, indice: number, agora: number): No[] {
  const no = acharNo(arvore, id);
  const alvo = no?.versoes?.[indice];
  if (!no || !alvo) return arvore;

  const atual: VersaoAnterior = {
    em: no.modificadoEm, rotulo: no.rotulo ?? no.nome, tamanhoKb: no.tamanhoKb,
  };
  const resto = (no.versoes ?? []).filter((_, i) => i !== indice);
  return arvore.map(n => (n.id === id
    ? {
      ...n,
      rotulo: alvo.rotulo,
      tamanhoKb: alvo.tamanhoKb,
      modificadoEm: agora,
      versoes: [atual, ...resto],
    }
    : n));
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
