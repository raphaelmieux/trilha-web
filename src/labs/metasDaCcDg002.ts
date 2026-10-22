/**
 * O que cada lição da CC-DG002 cobra, e de que estado do arquivo ela parte.
 *
 * Mora fora do componente e fora da trava, pelo motivo escrito em
 * `metasDaCcDg001.ts`: quem lê é a tela **e** a trava.
 *
 * ── Conferir a forma, e não o gesto ──────────────────────────────────────
 * A lição de booleanas não pergunta se a pessoa clicou em Subtrair: pergunta
 * se apareceu, na prancha, um caminho com a forma da barraca menos a porta.
 * E a de reproduzir o logotipo não conta nós: compara a área que o desenho
 * pinta com a área que o logotipo pinta, depois de levar os dois para o
 * mesmo tamanho — `coincidencia` sobre `normalizar`. Contar o gesto aprovaria
 * quem clicou certo na ordem errada; comparar a forma aprova quem chegou na
 * forma por qualquer caminho, que é o que o examinador olha.
 *
 * Normalizar é escala **uniforme**: a reprodução em outro tamanho passa, e a
 * esticada não. É isso que "mantendo proporções" quer dizer.
 */

import {
  achatarObjetos, agrupar, alinhar, combinar, comCaixaRefeita, distribuir, duplicarPrancha,
  mudarObjetos, mudarPrancha, silhueta, textos, umObjeto, umaPrancha, uniaoDe,
  type Arte, type Caminho, type Objeto, type Prancha,
} from './design';
import {
  booleana, caixaDosContornos, coincidencia, contornoDaElipse, contornoDoPoligono, contornoDoRetangulo,
  contornosDoD, escalar, normalizar, transladar,
  type Contorno,
} from './vetor';
import {
  ARTE_VETORIAL, ASSINATURA, ASSINATURA_DO_CLUBE, BANDEIRA_ONDULADA, CURVAS, EMBLEMA, FOLHA_GUIA, ICONE, ICONES,
  ICONES_SOLTOS, LADO_DO_ICONE, LOGOTIPO, LOGOTIPO_PEDIDO, NOME_DO_CLUBE, PECAS, PLACA, TRES_ICONES, caminho,
} from './arteVetorial';
import { D_DO_NOME_DO_CLUBE } from './nomeDoClubeEmCurvas';
import { pranchaDoSvg, svgDaPrancha } from './svg';
import type { ArquivoExportado } from './editorDeDesign';

/* ── A lição, e o que viaja com ela ───────────────────────────────────────── */

export type LicaoDaCcDg002 =
  | 'vetor-e-pontos' | 'booleanas' | 'curvas' | 'traco' | 'camadas'
  | 'texto-em-curvas' | 'logotipo' | 'icone' | 'svg';

/** O editor sozinho, ou o editor e o editor de texto, com a barra de tarefas. */
export type ProgramaDaLicao = 'design' | 'design-e-texto';

/** Um arquivo na pasta: o que se exportou, e o que ele tem agora. */
export interface ArquivoNaPasta extends ArquivoExportado {
  /** O conteúdo como saiu da exportação — o que o editor de texto mudou se mede contra ele. */
  exportado: string;
}

export type Uso = 'logotipo' | 'foto-acampamento' | 'icone-app' | 'ficha-escaneada' | 'camiseta' | 'foto-perfil';
export type Tipo = 'vetor' | 'pontos';

export const USOS: { id: Uso; texto: string; certo: Tipo }[] = [
  { id: 'logotipo', texto: 'O logotipo do clube, que vai no papel timbrado e na faixa de três metros', certo: 'vetor' },
  { id: 'foto-acampamento', texto: 'A foto da fogueira no último acampamento', certo: 'pontos' },
  { id: 'icone-app', texto: 'O ícone do aplicativo do clube, do celular ao telão', certo: 'vetor' },
  { id: 'ficha-escaneada', texto: 'A ficha de inscrição assinada, passada no digitalizador', certo: 'pontos' },
  { id: 'camiseta', texto: 'O desenho da camiseta do campori, que vai para a estamparia', certo: 'vetor' },
  { id: 'foto-perfil', texto: 'A foto de perfil do conselheiro na página do clube', certo: 'pontos' },
];

export interface CadernoVetorial {
  usos: Record<Uso, Tipo | null>;
  diferenca: string;
  porQueConverter: string;
}

export const CADERNO_VAZIO: CadernoVetorial = {
  usos: { 'logotipo': null, 'foto-acampamento': null, 'icone-app': null, 'ficha-escaneada': null, 'camiseta': null, 'foto-perfil': null },
  diferenca: '',
  porQueConverter: '',
};

export interface ContextoVetorial {
  arte: Arte;
  arquivos: ArquivoNaPasta[];
  /** O que a pessoa viu: a decisão de `descobertas` da CC-ES004. */
  descobertas: string[];
  caderno: CadernoVetorial;
}

export const chaveDoZoom = (prancha: string) => `zoom:8:${prancha}`;
export const chaveDosTamanhos = (prancha: string) => `tamanhos:${prancha}`;
export const chaveDoReabrir = (arquivo: string, prancha: string) => `reabriu:${arquivo}:${prancha}`;

/* ── Contas de apoio ─────────────────────────────────────────────────────── */

const palavrasDe = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const sem = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const prancha = (c: ContextoVetorial, id: string) => umaPrancha(c.arte, id);
const caminhosDe = (p: Prancha) => achatarObjetos(p.objetos).filter((o): o is Caminho => o.tipo === 'caminho');

/** A forma pedida aparece na prancha — em qualquer lugar e em qualquer tamanho. */
export const COINCIDENCIA_DA_FORMA = 0.97;
const temAForma = (p: Prancha, esperado: Contorno[]) => {
  const alvo = normalizar(esperado);
  return caminhosDe(p).some(c => c.preenchimento && coincidencia(normalizar(silhueta(c)), alvo) >= COINCIDENCIA_DA_FORMA);
};

const nosSuaves = (c: Caminho) => c.contornos.reduce((s, k) => s + k.nos.filter(n => n.tipo === 'suave').length, 0);

/* ── As metas ────────────────────────────────────────────────────────────── */

export interface MetaVetorial {
  id: string;
  titulo: string;
  detalhe: string;
  onde: string;
  passos: string[];
  feita: (c: ContextoVetorial) => boolean;
}

/* Módulo 1 — vetor e pontos */

export const PALAVRAS_DA_DIFERENCA = 15;

const METAS_DO_VETOR: MetaVetorial[] = [
  {
    id: 'ampliou-os-dois',
    titulo: 'Ampliar o emblema e a foto a 800%',
    detalhe: 'Os dois na mesma tela, bem de perto. Um continua liso; o outro vira escada.',
    onde: 'Exibir → Zoom → 800%',
    passos: [
      'Abra a prancha Emblema e foto.',
      'Em Exibir, escolha o zoom de 800%.',
      'Role a mesa e compare a borda do círculo com a borda da serra na foto.',
    ],
    feita: c => c.descobertas.includes(chaveDoZoom(EMBLEMA)),
  },
  {
    id: 'classificou-os-usos',
    titulo: 'Dizer qual tipo de imagem serve a cada uso',
    detalhe: 'Seis usos do clube: em cada um, vetor ou imagem de pontos. Três são de cada.',
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: [
      'Abra o caderno pelo painel de tarefas.',
      'Para cada uso, pergunte: isto vai precisar crescer? Isto é uma fotografia?',
      'Marque vetor ou pontos em cada um.',
    ],
    feita: c => USOS.every(u => c.caderno.usos[u.id] === u.certo),
  },
  {
    id: 'explicou-a-diferenca',
    titulo: 'Explicar a diferença com as suas palavras',
    detalhe: `Pelo menos ${PALAVRAS_DA_DIFERENCA} palavras: por que ampliar a foto estraga e ampliar o vetor não.`,
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: [
      'No caderno, escreva o que você viu a 800%.',
      'Diga o que o vetor guarda e o que a foto guarda.',
    ],
    feita: c => palavrasDe(c.caderno.diferenca).length >= PALAVRAS_DA_DIFERENCA,
  },
];

/* Módulo 2 — booleanas */

const ladoADado = (p: Prancha, ids: string[]) => ids.map(id => umObjeto(p, id)).filter((o): o is Objeto => !!o);
const silhuetaDe = (p: Prancha, id: string) => silhueta(umObjeto(p, id)!);

/** As formas que cada combinação tem de produzir, a partir das peças soltas. */
export const FORMAS_ESPERADAS = (() => {
  const p = ICONES_SOLTOS;
  return {
    barraca: booleana(silhuetaDe(p, 'lona'), silhuetaDe(p, 'porta'), 'subtracao'),
    lua: booleana(silhuetaDe(p, 'lua-a'), silhuetaDe(p, 'lua-b'), 'subtracao'),
    folha: booleana(silhuetaDe(p, 'folha-a'), silhuetaDe(p, 'folha-b'), 'intersecao'),
    nuvem: uniaoDe(ladoADado(p, ['nuvem-a', 'nuvem-b', 'nuvem-c']).map(silhueta)),
  };
})();

const metaDaBooleana = (id: keyof typeof FORMAS_ESPERADAS, titulo: string, detalhe: string, passos: string[]): MetaVetorial => ({
  id: `${id}-combinada`, titulo, detalhe, onde: 'Objeto → Unir, Subtrair ou Intersectar', passos,
  feita: c => {
    const p = prancha(c, ICONES);
    return !!p && temAForma(p, FORMAS_ESPERADAS[id]);
  },
});

const METAS_DAS_BOOLEANAS: MetaVetorial[] = [
  metaDaBooleana('barraca', 'Abrir a porta da barraca', 'A lona menos a porta: a porta vira um buraco na lona, e não um retângulo cinza por cima.', [
    'Selecione a lona e, com Shift, a porta.',
    'Clique em Subtrair. Quem perde o pedaço é o de baixo, a lona.',
  ]),
  metaDaBooleana('lua', 'Recortar a lua', 'Um círculo menos outro, deslocado: sobra a lua minguante.', [
    'Selecione os dois círculos amarelos e cinzas da lua.',
    'Clique em Subtrair.',
  ]),
  metaDaBooleana('folha', 'Fazer a folha da interseção', 'Dois círculos que se cruzam: a folha é só o que é dos dois.', [
    'Selecione os dois círculos da folha.',
    'Clique em Intersectar.',
  ]),
  metaDaBooleana('nuvem', 'Juntar a nuvem', 'Três círculos viram uma forma só, sem as costuras por dentro.', [
    'Selecione os três círculos azuis.',
    'Clique em Unir.',
  ]),
];

/* Módulo 3 — curvas e nós */

export const COINCIDENCIA_DA_BANDEIRA = 0.95;
export const COINCIDENCIA_DA_FOLHA = 0.85;

const METAS_DAS_CURVAS: MetaVetorial[] = [
  {
    id: 'bandeira-ondulada',
    titulo: 'Fazer a bandeira ondular editando os nós',
    detalhe: 'Os dois nós do meio viram suaves e sobem até o guia. Nenhum nó novo: só os que já estão lá.',
    onde: 'Ferramenta Editar nós (A)',
    passos: [
      'Escolha a ferramenta Editar nós e clique na bandeira.',
      'Clique no nó do meio de cima e, no painel, marque Suave.',
      'Arraste esse nó até o guia (ou escreva o Y dele no painel).',
      'Faça o mesmo com o nó do meio de baixo.',
    ],
    feita: c => {
      const p = prancha(c, CURVAS);
      const b = p && umObjeto(p, 'bandeira');
      return !!b && b.tipo === 'caminho' && nosSuaves(b) >= 2
        && coincidencia(b.contornos, [BANDEIRA_ONDULADA]) >= COINCIDENCIA_DA_BANDEIRA;
    },
  },
  {
    id: 'folha-com-a-caneta',
    titulo: 'Desenhar a folha com a caneta',
    detalhe: 'Por cima do guia: quatro nós bastam — as duas pontas de canto e os dois lados suaves.',
    onde: 'Ferramenta Caneta (P)',
    passos: [
      'Escolha a Caneta.',
      'Clique na ponta esquerda da folha.',
      'Na borda de cima, aperte e arraste para a direita: o nó nasce suave.',
      'Clique na ponta direita.',
      'Na borda de baixo, aperte e arraste para a esquerda.',
      'Clique de novo no primeiro nó para fechar.',
    ],
    feita: c => {
      const p = prancha(c, CURVAS);
      /* Contorno aberto não pinta área, e a coincidência já o reprova: não se
         confere o fechamento à parte. */
      return !!p && caminhosDe(p).some(k => k.id !== 'bandeira'
        && nosSuaves(k) >= 2 && coincidencia(k.contornos, FOLHA_GUIA) >= COINCIDENCIA_DA_FOLHA);
    },
  },
];

/* Módulo 4 — traço e preenchimento */

export const TRACO_DA_TRILHA = 10;
export const TRACO_DA_PLACA = 6;

const METAS_DO_TRACO: MetaVetorial[] = [
  {
    id: 'trilha-grossa-e-redonda',
    titulo: 'Engrossar a trilha e arredondar as pontas',
    detalhe: `Traço de pelo menos ${TRACO_DA_TRILHA} e extremidade redonda: de longe, a ponta reta parece cortada.`,
    onde: 'Propriedades → Traço',
    passos: [
      'Selecione a trilha.',
      `No painel, ponha a espessura do traço em ${TRACO_DA_TRILHA} ou mais.`,
      'Em Extremidade, escolha Redonda.',
    ],
    feita: c => {
      const t = prancha(c, PLACA) && umObjeto(prancha(c, PLACA)!, 'trilha');
      return !!t && t.tipo === 'caminho' && !!t.traco && t.traco.espessura >= TRACO_DA_TRILHA && t.traco.extremidade === 'redonda';
    },
  },
  {
    id: 'seta-sem-preenchimento',
    titulo: 'Tirar o preenchimento da seta',
    detalhe: 'Ela é uma linha aberta: preenchida, ganha um triângulo que ninguém desenhou. E o traço igual ao da trilha.',
    onde: 'Propriedades → Sem preenchimento',
    passos: [
      'Selecione a seta.',
      'Marque Sem preenchimento.',
      'Dê a ela a mesma espessura e a mesma extremidade da trilha.',
    ],
    feita: c => {
      const p = prancha(c, PLACA);
      const s = p && umObjeto(p, 'seta');
      const t = p && umObjeto(p, 'trilha');
      return !!s && !!t && s.tipo === 'caminho' && t.tipo === 'caminho' && s.preenchimento === null
        && !!s.traco && !!t.traco && s.traco.espessura === t.traco.espessura && s.traco.extremidade === t.traco.extremidade
        && s.traco.espessura >= TRACO_DA_TRILHA;
    },
  },
  {
    id: 'placa-com-contorno',
    titulo: 'Dar à placa um contorno de outra cor',
    detalhe: `Preenchimento e traço são duas cores: o traço de pelo menos ${TRACO_DA_PLACA}, numa cor diferente do miolo.`,
    onde: 'Propriedades → Traço',
    passos: [
      'Selecione a placa.',
      'Ligue o Traço.',
      `Escolha uma cor diferente da do preenchimento e espessura ${TRACO_DA_PLACA} ou mais.`,
    ],
    feita: c => {
      const pl = prancha(c, PLACA) && umObjeto(prancha(c, PLACA)!, 'placa');
      return !!pl && (pl.tipo === 'elipse' || pl.tipo === 'caminho') && !!pl.traco && !!pl.preenchimento
        && pl.traco.espessura >= TRACO_DA_PLACA && pl.traco.cor.toUpperCase() !== pl.preenchimento.toUpperCase();
    },
  },
];

/* Módulo 5 — camadas, grupos, alinhar e distribuir */

const gruposDosIcones = (p: Prancha) => {
  const grupos = p.objetos.filter(o => o.tipo === 'grupo');
  return (Object.keys(PECAS) as (keyof typeof PECAS)[]).map(icone => grupos.find(g => g.tipo === 'grupo'
    && g.filhos.length === PECAS[icone].length && PECAS[icone].every(id => g.filhos.some(f => f.id === id))));
};

const METAS_DAS_CAMADAS: MetaVetorial[] = [
  {
    id: 'tres-grupos',
    titulo: 'Agrupar cada ícone com as peças dele, e dar um nome ao grupo',
    detalhe: 'Três grupos: a barraca, a fogueira e a árvore. Cada peça no grupo do ícone dela, e nenhum grupo chamado só "Grupo".',
    onde: 'Objeto → Agrupar, e Propriedades → Nome da camada',
    passos: [
      'Selecione as peças da barraca pela lista de camadas (Shift + clique).',
      'Clique em Agrupar (Ctrl+G).',
      'No painel, escreva o nome do grupo.',
      'Faça o mesmo com a fogueira e com a árvore.',
    ],
    feita: c => {
      const p = prancha(c, TRES_ICONES);
      return !!p && gruposDosIcones(p).every(g => !!g && !/^grupo\b/i.test(g.nome.trim()));
    },
  },
  {
    id: 'mesma-base',
    titulo: 'Alinhar os três ícones pela base',
    detalhe: 'O pé dos três na mesma linha, como se estivessem no mesmo chão.',
    onde: 'Barra de alinhar → Alinhar à base',
    passos: ['Selecione os três grupos.', 'Clique em Alinhar à base.'],
    feita: c => {
      const p = prancha(c, TRES_ICONES);
      const gs = p ? gruposDosIcones(p) : [];
      if (gs.some(g => !g)) return false;
      const bases = gs.map(g => g!.y + g!.altura);
      return Math.max(...bases) - Math.min(...bases) <= 1;
    },
  },
  {
    id: 'mesmo-vao',
    titulo: 'Distribuir os três com o mesmo vão',
    detalhe: 'O vão entre a primeira e a segunda igual ao vão entre a segunda e a terceira, e nenhum ícone encostado no outro.',
    onde: 'Barra de alinhar → Distribuir horizontalmente',
    passos: ['Selecione os três grupos.', 'Clique em Distribuir horizontalmente.'],
    feita: c => {
      const p = prancha(c, TRES_ICONES);
      const gs = p ? gruposDosIcones(p) : [];
      if (gs.some(g => !g)) return false;
      const ordem = gs.map(g => g!).sort((a, b) => a.x - b.x);
      const vaos = ordem.slice(1).map((g, i) => g.x - (ordem[i].x + ordem[i].largura));
      return vaos.every(v => v > 0) && Math.abs(vaos[0] - vaos[1]) <= 1;
    },
  },
];

/* Módulo 6 — texto em curvas */

export const PALAVRAS_DO_PORQUE = 15;
const TEXTO_ORIGINAL = textos(ASSINATURA_DO_CLUBE)[0];

const METAS_DO_TEXTO: MetaVetorial[] = [
  {
    id: 'guardou-o-editavel',
    titulo: 'Guardar uma versão em que o nome ainda é texto',
    detalhe: 'Converter não tem volta: depois, corrigir uma letra é redesenhá-la. A cópia guarda o texto que ainda se edita.',
    onde: 'Pranchas → Duplicar prancha',
    passos: [
      'Com a Assinatura do clube aberta, clique em Duplicar prancha.',
      'Volte para a original: é nela que se converte.',
    ],
    feita: c => c.arte.pranchas.some(p => p.id !== ASSINATURA
      && textos(p).some(t => t.texto === NOME_DO_CLUBE && t.familia === TEXTO_ORIGINAL.familia)),
  },
  {
    id: 'nome-em-curvas',
    titulo: 'Converter o nome do clube em curvas',
    detalhe: 'O nome deixa de ser texto e vira desenho: a gráfica abre o arquivo e vê a letra certa, tenha ela a fonte ou não.',
    onde: 'Objeto → Converter em curvas',
    passos: [
      'Na Assinatura do clube original, selecione o nome.',
      'Em Objeto, clique em Converter em curvas.',
      'Na lista de camadas ele continua com o mesmo nome, mas agora é um caminho.',
    ],
    feita: c => {
      const p = prancha(c, ASSINATURA);
      if (!p || textos(p).some(t => t.texto === NOME_DO_CLUBE)) return false;
      const t = TEXTO_ORIGINAL;
      return caminhosDe(p).some(k => k.nome === t.nome && k.preenchimento?.toUpperCase() === t.cor.toUpperCase()
        && k.x >= t.x - 2 && k.x + k.largura <= t.x + t.largura + 2 && k.largura >= t.largura * 0.5);
    },
  },
  {
    id: 'porque-converter',
    titulo: 'Explicar quando é preciso converter',
    detalhe: `Pelo menos ${PALAVRAS_DO_PORQUE} palavras, falando da fonte.`,
    onde: 'Painel de tarefas → Abrir o caderno',
    passos: [
      'Abra o caderno.',
      'Escreva para quem vai o arquivo, e o que acontece se a fonte não estiver no computador de lá.',
    ],
    feita: c => palavrasDe(c.caderno.porQueConverter).length >= PALAVRAS_DO_PORQUE && sem(c.caderno.porQueConverter).includes('fonte'),
  },
];

/* Módulo 7 — reproduzir o logotipo */

export const COINCIDENCIA_DO_LOGOTIPO = 0.8;
export const FOLGA_DA_PROPORCAO = 0.02;

/** O que a pessoa desenhou na prancha do logotipo: a área que pinta, sem a referência. */
export const desenhoDoLogotipo = (p: Prancha) => uniaoDe(p.objetos.filter(o => o.tipo !== 'referencia').map(silhueta));

const proporcao = (cs: Contorno[]) => {
  const c = caixaDosContornos(cs);
  return c.altura === 0 ? 0 : c.largura / c.altura;
};

const METAS_DO_LOGOTIPO: MetaVetorial[] = [
  {
    id: 'reproduziu-o-logotipo',
    titulo: 'Reproduzir o logotipo com formas vetoriais',
    detalhe: 'O anel, a barraca e o chão, com as suas formas. Pode ser em outro tamanho — o que se compara é a forma.',
    onde: 'Ferramentas Elipse, Triângulo e Retângulo, e Objeto → Subtrair',
    passos: [
      'Desenhe um círculo e outro menor por cima, centralizados, e subtraia: sai o anel.',
      'Desenhe o triângulo da barraca dentro do anel.',
      'Desenhe o chão embaixo.',
      'Ajuste posições e tamanhos pelo painel até o desenho bater com o modelo.',
    ],
    feita: c => {
      const p = prancha(c, LOGOTIPO);
      if (!p) return false;
      const d = desenhoDoLogotipo(p);
      return d.length > 0 && coincidencia(normalizar(d), normalizar(LOGOTIPO_PEDIDO)) >= COINCIDENCIA_DO_LOGOTIPO;
    },
  },
  {
    id: 'mesma-proporcao',
    titulo: 'Manter a proporção do logotipo',
    detalhe: 'Largura sobre altura igual à do modelo, com menos de 2% de diferença. Esticado, é outro logotipo.',
    onde: 'Propriedades → L e A',
    passos: [
      'Se mudar o tamanho, mude largura e altura na mesma proporção.',
      'Compare a caixa do seu desenho com a do modelo: a razão entre L e A tem de ser a mesma.',
    ],
    feita: c => {
      const p = prancha(c, LOGOTIPO);
      if (!p) return false;
      const d = desenhoDoLogotipo(p);
      const alvo = proporcao(LOGOTIPO_PEDIDO);
      return d.length > 0 && Math.abs(proporcao(d) - alvo) / alvo <= FOLGA_DA_PROPORCAO;
    },
  },
];

/* Módulo 8 — o ícone em três tamanhos */

/** Um pixel do ícone de 16: a menor medida que ainda aparece. */
export const UM_PIXEL_EM_16 = LADO_DO_ICONE / 16;

const vetoriais = (p: Prancha) => achatarObjetos(p.objetos)
  .filter(o => o.tipo === 'retangulo' || o.tipo === 'elipse' || o.tipo === 'caminho');

/**
 * O que some no ícone de 16 pixels: traço mais fino que um pixel, e forma
 * preenchida com algum lado menor que um pixel.
 */
export function detalhesQueSomem(p: Prancha): string[] {
  return vetoriais(p).filter(o => {
    const traco = o.tipo === 'caminho' || o.tipo === 'retangulo' || o.tipo === 'elipse' ? o.traco : null;
    if (traco && traco.espessura < UM_PIXEL_EM_16) return true;
    const preenche = o.tipo === 'caminho' ? !!o.preenchimento : true;
    return preenche && Math.min(o.largura, o.tipo === 'caminho' || o.tipo === 'retangulo' || o.tipo === 'elipse' ? o.altura : 0) < UM_PIXEL_EM_16;
  }).map(o => o.id);
}

export const OBJETOS_DO_ICONE = 3;

const METAS_DO_ICONE: MetaVetorial[] = [
  {
    id: 'desenhou-o-icone',
    titulo: 'Desenhar um ícone seu',
    detalhe: `Pelo menos ${OBJETOS_DO_ICONE} formas, dentro da prancha de ${LADO_DO_ICONE} por ${LADO_DO_ICONE}.`,
    onde: 'Todas as ferramentas',
    passos: [
      'Pense numa coisa do clube que caiba num quadrado: uma bússola, um nó, uma barraca.',
      'Desenhe com as formas e a caneta.',
      'Use a prancha inteira: o ícone pequeno começa grande.',
    ],
    feita: c => {
      const p = prancha(c, ICONE);
      if (!p) return false;
      const os = vetoriais(p);
      return os.length >= OBJETOS_DO_ICONE
        && os.every(o => o.x >= 0 && o.y >= 0 && o.x + o.largura <= p.largura && o.y + (o.tipo === 'caminho' || o.tipo === 'retangulo' || o.tipo === 'elipse' ? o.altura : 0) <= p.altura);
    },
  },
  {
    id: 'viu-em-tres-tamanhos',
    titulo: 'Ver o ícone em 64, 32 e 16 pixels',
    detalhe: 'O mesmo desenho, lado a lado, nos três tamanhos em que um ícone aparece.',
    onde: 'Exibir → Ver em 64, 32 e 16 px',
    passos: ['Em Exibir, clique em Ver em 64, 32 e 16 px.', 'Olhe o de 16: o que sumiu?'],
    feita: c => c.descobertas.includes(chaveDosTamanhos(ICONE)),
  },
  {
    id: 'legivel-em-16',
    titulo: 'Deixar o ícone legível no menor tamanho',
    detalhe: `Nada mais fino que um pixel do ícone de 16, que aqui são ${UM_PIXEL_EM_16} unidades: nem traço, nem lado de forma.`,
    onde: 'Propriedades → Espessura do traço, L e A',
    passos: [
      `Engrosse todo traço para ${UM_PIXEL_EM_16} ou mais.`,
      `Tire ou aumente o detalhe com algum lado menor que ${UM_PIXEL_EM_16}.`,
      'Confira de novo no de 16.',
    ],
    feita: c => {
      const p = prancha(c, ICONE);
      return !!p && vetoriais(p).length > 0 && detalhesQueSomem(p).length === 0;
    },
  },
];

/* Módulo 9 — o SVG por dentro */

const lerSvg = (conteudo: string, base: Prancha) => {
  const r = pranchaDoSvg(conteudo, base);
  return 'prancha' in r ? r.prancha : null;
};

/** O SVG mexido à mão: lê, e desenha diferente do que saiu da exportação. */
export function svgMexido(c: ContextoVetorial): ArquivoNaPasta | undefined {
  const base = prancha(c, ICONE);
  if (!base) return undefined;
  return c.arquivos.find(a => {
    if (a.tipo !== 'svg' || a.prancha !== ICONE || a.conteudo === a.exportado) return false;
    const [agora, antes] = [lerSvg(a.conteudo, base), lerSvg(a.exportado, base)];
    return !!agora && !!antes && svgDaPrancha(agora) !== svgDaPrancha(antes);
  });
}

const METAS_DO_SVG: MetaVetorial[] = [
  {
    id: 'exportou-svg-e-png',
    titulo: 'Exportar o ícone em SVG e em PNG',
    detalhe: 'Os dois arquivos, do mesmo ícone: o SVG guarda as formas, o PNG guarda os pontos.',
    onde: 'Arquivo → Exportar',
    passos: ['Abra o seu ícone.', 'Em Arquivo, clique em Exportar como SVG.', 'Depois em Exportar como PNG.'],
    feita: c => ['svg', 'png'].every(t => c.arquivos.some(a => a.tipo === t && a.prancha === ICONE)),
  },
  {
    id: 'mexeu-numa-coordenada',
    titulo: 'Mudar à mão uma coordenada dentro do SVG',
    detalhe: 'No editor de texto, ache uma forma pelo id, mude um número dela, e salve.',
    onde: 'Barra de tarefas → Editor de texto',
    passos: [
      'Na barra de tarefas, abra o Editor de texto e o arquivo .svg.',
      'Ache a linha de uma forma — o id é o nome dela na lista de camadas.',
      'Mude um número: o x de um retângulo, o cx de uma elipse, um par de números depois do M.',
      'Salve.',
    ],
    feita: c => !!svgMexido(c),
  },
  {
    id: 'reabriu-e-viu',
    titulo: 'Reabrir o SVG no editor de desenho e ver o efeito',
    detalhe: 'O desenho muda do jeito que o número mandou. É a prova de que o arquivo é feito de coordenadas.',
    onde: 'Arquivo → Abrir SVG',
    passos: ['Volte ao editor de desenho.', 'Em Arquivo, abra o .svg que você mexeu.', 'Compare com o que era antes.'],
    feita: c => {
      const a = svgMexido(c);
      const p = prancha(c, ICONE);
      if (!a || !p || !c.descobertas.includes(chaveDoReabrir(a.nome, ICONE))) return false;
      const lida = lerSvg(a.conteudo, p);
      return !!lida && svgDaPrancha(lida) === svgDaPrancha(p);
    },
  },
];

/* ── As soluções de referência, que são a partida da lição seguinte ────────── */

const CORRETOS = Object.fromEntries(USOS.map(u => [u.id, u.certo])) as Record<Uso, Tipo>;

export const DIFERENCA_ESCRITA =
  'A 800% o círculo continuou liso, porque o vetor guarda a forma e o computador redesenha. A foto virou quadradinhos, porque ela guarda pontos e ampliar só aumenta cada ponto.';

const comIconesCombinados = (a: Arte): Arte => mudarPrancha(a, ICONES, p => {
  let q = combinar(p, ['lona', 'porta'], 'subtracao');
  q = combinar(q, ['lua-a', 'lua-b'], 'subtracao');
  q = combinar(q, ['folha-a', 'folha-b'], 'intersecao');
  return combinar(q, ['nuvem-a', 'nuvem-b', 'nuvem-c'], 'uniao');
});

/** A folha como a caneta a desenha: duas pontas de canto e dois lados suaves. */
export const FOLHA_DA_CANETA: Contorno = {
  fechado: true,
  nos: [
    { x: 113, y: 290, entrada: null, saida: null, tipo: 'canto' },
    { x: 200, y: 240, entrada: { x: 145, y: 240 }, saida: { x: 255, y: 240 }, tipo: 'suave' },
    { x: 287, y: 290, entrada: null, saida: null, tipo: 'canto' },
    { x: 200, y: 340, entrada: { x: 255, y: 340 }, saida: { x: 145, y: 340 }, tipo: 'suave' },
  ],
};

const comCurvas = (a: Arte): Arte => mudarPrancha(a, CURVAS, p => {
  const q = mudarObjetos(p, ['bandeira'], o => (o.tipo === 'caminho' ? comCaixaRefeita({ ...o, contornos: [BANDEIRA_ONDULADA] }) : o));
  return { ...q, objetos: [...q.objetos, caminho('caminho-1', 'Folha', [FOLHA_DA_CANETA], '#3F8F3F', { cor: '#1F2A24', espessura: 2, extremidade: 'reta' })] };
});

const comTracos = (a: Arte): Arte => mudarPrancha(a, PLACA, p => mudarObjetos(p, ['trilha', 'seta', 'placa'], o => {
  if (o.id === 'placa' && o.tipo === 'elipse') return { ...o, traco: { cor: '#7A4B12', espessura: 8, extremidade: 'reta' } };
  if (o.tipo === 'caminho') return { ...o, preenchimento: null, traco: { cor: '#1F2A24', espessura: 12, extremidade: 'redonda' } };
  return o;
}));

const NOMES_DOS_GRUPOS = { barraca: 'Barraca', fogueira: 'Fogueira', arvore: 'Árvore' } as const;

const comGrupos = (a: Arte): Arte => mudarPrancha(a, TRES_ICONES, p => {
  let q = p;
  for (const icone of Object.keys(PECAS) as (keyof typeof PECAS)[]) {
    q = agrupar(q, PECAS[icone], `grupo-${icone}`, NOMES_DOS_GRUPOS[icone]);
  }
  const ids = Object.keys(PECAS).map(i => `grupo-${i}`);
  return distribuir(alinhar(q, ids, 'base'), ids, 'horizontal');
});

const comNomeConvertido = (a: Arte): Arte => {
  const comCopia = duplicarPrancha(a, ASSINATURA);
  return mudarPrancha(comCopia, ASSINATURA, p => mudarObjetos(p, ['nome'], o => (o.tipo !== 'texto' ? o
    : caminho(o.id, o.nome, contornosDoD(D_DO_NOME_DO_CLUBE)!, o.cor))));
};

export const PORQUE_ESCRITO =
  'Converte-se quando o arquivo vai para a gráfica ou para outro computador que pode não ter a fonte instalada: sem ela, o nome sairia em outra letra.';

/** O logotipo reproduzido a 80%, num canto vazio, com as três formas que o compõem. */
const comLogotipo = (a: Arte): Arte => mudarPrancha(a, LOGOTIPO, p => {
  const k = 0.8;
  const pos = (cs: Contorno[]) => transladar(escalar(cs, { x: 0, y: 0 }, k, k), 220, 200);
  const anel = booleana([contornoDaElipse(20, 20, 160, 160)], [contornoDaElipse(45, 45, 110, 110)], 'subtracao');
  return {
    ...p,
    objetos: [
      ...p.objetos,
      caminho('caminho-1', 'Anel', pos(anel), '#1B4D3E'),
      caminho('caminho-2', 'Barraca', pos([contornoDoPoligono([{ x: 100, y: 60 }, { x: 145, y: 140 }, { x: 55, y: 140 }])]), '#1B4D3E'),
      caminho('caminho-3', 'Chão', pos([contornoDoRetangulo(10, 165, 180, 18)]), '#1B4D3E'),
    ],
  };
});

const comIcone = (a: Arte): Arte => mudarPrancha(a, ICONE, p => ({
  ...p,
  objetos: [
    { id: 'forma-1', nome: 'Fundo', tipo: 'elipse', x: 24, y: 24, largura: 208, altura: 208, preenchimento: '#1B4D3E' },
    caminho('caminho-1', 'Barraca', [contornoDoPoligono([{ x: 128, y: 64 }, { x: 196, y: 180 }, { x: 60, y: 180 }])], '#F2C14E'),
    { id: 'forma-2', nome: 'Chão', tipo: 'retangulo', x: 48, y: 180, largura: 160, altura: 20, preenchimento: '#F2C14E' },
  ],
}));

const SVG_DO_ICONE = (a: Arte) => svgDaPrancha(umaPrancha(a, ICONE)!);

/** O mesmo arquivo, com o chão vinte unidades mais para baixo — mexido à mão. */
const SVG_MEXIDO = (a: Arte) => SVG_DO_ICONE(a).replace(
  '<rect id="forma-2" data-nome="Chão" x="48" y="180"', '<rect id="forma-2" data-nome="Chão" x="48" y="200"');

/* ── O registro ──────────────────────────────────────────────────────────── */

export interface LicaoVetorial {
  contexto: ContextoVetorial;
  programa: ProgramaDaLicao;
  prancha: string;
  caderno: boolean;
  metas: MetaVetorial[];
}

const PARTIDA: ContextoVetorial = { arte: ARTE_VETORIAL, arquivos: [], descobertas: [], caderno: CADERNO_VAZIO };

/** O contexto da lição seguinte: o arquivo, a pasta e o caderno seguem; as descobertas, não. */
const seguinte = (c: ContextoVetorial, mudar: Partial<ContextoVetorial>): ContextoVetorial =>
  ({ ...c, ...mudar, descobertas: [] });

const DEPOIS_DO_VETOR = seguinte(PARTIDA, { caderno: { ...CADERNO_VAZIO, usos: CORRETOS, diferenca: DIFERENCA_ESCRITA } });
const DEPOIS_DAS_BOOLEANAS = seguinte(DEPOIS_DO_VETOR, { arte: comIconesCombinados(DEPOIS_DO_VETOR.arte) });
const DEPOIS_DAS_CURVAS = seguinte(DEPOIS_DAS_BOOLEANAS, { arte: comCurvas(DEPOIS_DAS_BOOLEANAS.arte) });
const DEPOIS_DO_TRACO = seguinte(DEPOIS_DAS_CURVAS, { arte: comTracos(DEPOIS_DAS_CURVAS.arte) });
const DEPOIS_DAS_CAMADAS = seguinte(DEPOIS_DO_TRACO, { arte: comGrupos(DEPOIS_DO_TRACO.arte) });
const DEPOIS_DO_TEXTO = seguinte(DEPOIS_DAS_CAMADAS, {
  arte: comNomeConvertido(DEPOIS_DAS_CAMADAS.arte),
  caderno: { ...DEPOIS_DAS_CAMADAS.caderno, porQueConverter: PORQUE_ESCRITO },
});
const DEPOIS_DO_LOGOTIPO = seguinte(DEPOIS_DO_TEXTO, { arte: comLogotipo(DEPOIS_DO_TEXTO.arte) });
const DEPOIS_DO_ICONE = seguinte(DEPOIS_DO_LOGOTIPO, { arte: comIcone(DEPOIS_DO_LOGOTIPO.arte) });

/**
 * O fim da última lição: exportado, mexido e reaberto.
 *
 * Lê o SVG pelo `DOMParser`, que só existe no navegador; por isso é função, e
 * não constante — montar o registro no servidor de testes sem navegador não
 * pode estourar por causa da última lição.
 */
export function depoisDoSvg(): ContextoVetorial {
  const c = DEPOIS_DO_ICONE;
  const p = umaPrancha(c.arte, ICONE)!;
  const exportado = SVG_DO_ICONE(c.arte);
  const mexido = SVG_MEXIDO(c.arte);
  const base = { prancha: ICONE, largura: p.largura, altura: p.altura };
  const lida = lerSvg(mexido, p)!;
  return {
    ...c,
    arte: mudarPrancha(c.arte, ICONE, () => lida),
    arquivos: [
      { ...base, nome: 'meu-icone.svg', tipo: 'svg', conteudo: mexido, exportado },
      { ...base, nome: 'meu-icone.png', tipo: 'png', conteudo: '', exportado: '' },
    ],
    descobertas: [chaveDoReabrir('meu-icone.svg', ICONE)],
  };
}

export const LICOES_DA_CC_DG002: Record<LicaoDaCcDg002, LicaoVetorial> = {
  'vetor-e-pontos': { contexto: PARTIDA, programa: 'design', prancha: EMBLEMA, caderno: true, metas: METAS_DO_VETOR },
  'booleanas': { contexto: DEPOIS_DO_VETOR, programa: 'design', prancha: ICONES, caderno: false, metas: METAS_DAS_BOOLEANAS },
  'curvas': { contexto: DEPOIS_DAS_BOOLEANAS, programa: 'design', prancha: CURVAS, caderno: false, metas: METAS_DAS_CURVAS },
  'traco': { contexto: DEPOIS_DAS_CURVAS, programa: 'design', prancha: PLACA, caderno: false, metas: METAS_DO_TRACO },
  'camadas': { contexto: DEPOIS_DO_TRACO, programa: 'design', prancha: TRES_ICONES, caderno: false, metas: METAS_DAS_CAMADAS },
  'texto-em-curvas': { contexto: DEPOIS_DAS_CAMADAS, programa: 'design', prancha: ASSINATURA, caderno: true, metas: METAS_DO_TEXTO },
  'logotipo': { contexto: DEPOIS_DO_TEXTO, programa: 'design', prancha: LOGOTIPO, caderno: false, metas: METAS_DO_LOGOTIPO },
  'icone': { contexto: DEPOIS_DO_LOGOTIPO, programa: 'design', prancha: ICONE, caderno: false, metas: METAS_DO_ICONE },
  'svg': { contexto: DEPOIS_DO_ICONE, programa: 'design-e-texto', prancha: ICONE, caderno: false, metas: METAS_DO_SVG },
};

export const metasDa = (licao: LicaoDaCcDg002) => LICOES_DA_CC_DG002[licao].metas;

/** O estado depois de cada lição — a solução de referência que a trava usa. */
export const estadoDepois = (licao: LicaoDaCcDg002): ContextoVetorial => {
  switch (licao) {
    case 'vetor-e-pontos': return { ...DEPOIS_DO_VETOR, descobertas: [chaveDoZoom(EMBLEMA)] };
    case 'booleanas': return DEPOIS_DAS_BOOLEANAS;
    case 'curvas': return DEPOIS_DAS_CURVAS;
    case 'traco': return DEPOIS_DO_TRACO;
    case 'camadas': return DEPOIS_DAS_CAMADAS;
    case 'texto-em-curvas': return DEPOIS_DO_TEXTO;
    case 'logotipo': return DEPOIS_DO_LOGOTIPO;
    case 'icone': return { ...DEPOIS_DO_ICONE, descobertas: [chaveDosTamanhos(ICONE)] };
    case 'svg': return depoisDoSvg();
  }
};

