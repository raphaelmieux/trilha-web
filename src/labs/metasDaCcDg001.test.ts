import { describe, expect, it } from 'vitest';
import {
  alinhar, colarEstilo, copiarEstilo, duplicarPrancha, excluir, mudarObjetos, mudarPrancha,
  textos, umObjeto, umaPrancha,
  type Arte, type Objeto, type Prancha, type Texto,
} from './design';
import {
  AVISO, BATISMO, CAMPORI, CARTAZ, ESCALA, FOLHETO, PROGRAMACAO,
} from './arteDoClube';
import {
  CHAVE_DA_PROVA, CHAVE_SEM_COR, ESTADO_DEPOIS, LICOES_DA_CC_DG001, chaveDaMedida,
  culpados, metasDa, versoesDoBatismo,
  type ContextoDoDesign, type LicaoDaCcDg001,
} from './metasDaCcDg001';

const LICOES = Object.keys(LICOES_DA_CC_DG001) as LicaoDaCcDg001[];

const meta = (licao: LicaoDaCcDg001, id: string) => {
  const m = metasDa(licao).find(x => x.id === id);
  if (!m) throw new Error(`meta ${id} não existe em ${licao}`);
  return m;
};

const naPrancha = (c: ContextoDoDesign, id: string, f: (p: Prancha) => Prancha): ContextoDoDesign =>
  ({ ...c, arte: mudarPrancha(c.arte, id, f) });

const mexer = (c: ContextoDoDesign, prancha: string, ids: string[], muda: Partial<Texto> & Partial<Objeto>) =>
  naPrancha(c, prancha, p => mudarObjetos(p, ids, o => ({ ...o, ...muda }) as Objeto));

describe('cada lição', () => {
  it('existe para as oito, e cada uma tem metas', () => {
    expect(LICOES).toHaveLength(8);
    for (const l of LICOES) expect(metasDa(l).length).toBeGreaterThanOrEqual(2);
  });

  for (const l of LICOES) {
    it(`${l}: nenhuma meta abre verde`, () => {
      const c = LICOES_DA_CC_DG001[l].contexto;
      expect(metasDa(l).filter(m => m.feita(c)).map(m => m.id)).toEqual([]);
    });

    it(`${l}: a solução de referência fecha todas`, () => {
      expect(metasDa(l).filter(m => !m.feita(ESTADO_DEPOIS[l])).map(m => m.id)).toEqual([]);
    });

    it(`${l}: toda meta tem passo a passo`, () => {
      for (const m of metasDa(l)) expect(m.passos.length).toBeGreaterThan(0);
    });
  }

  it('cada lição parte de onde a anterior acabou', () => {
    for (let i = 1; i < LICOES.length; i++) {
      const anterior = ESTADO_DEPOIS[LICOES[i - 1]];
      const partida = LICOES_DA_CC_DG001[LICOES[i]].contexto;
      expect(partida.arte).toEqual(anterior.arte);
      expect(partida.caderno).toEqual(anterior.caderno);
      expect(partida.descobertas).toEqual([]);
    }
  });

  it('a prancha em que a lição abre existe', () => {
    for (const l of LICOES) {
      const { contexto, prancha } = LICOES_DA_CC_DG001[l];
      expect(umaPrancha(contexto.arte, prancha)).toBeDefined();
    }
  });
});

describe('módulo 1 — hierarquia', () => {
  const inicio = LICOES_DA_CC_DG001.hierarquia.contexto;

  it('título enorme encavalado na data não fecha', () => {
    const c = mexer(inicio, CARTAZ, ['titulo'], { corpo: 40, peso: 700 });
    expect(meta('hierarquia', 'titulo-se-destaca').feita(c)).toBe(false);
  });

  it('título e data no mesmo tamanho grande são dois títulos', () => {
    const fim = ESTADO_DEPOIS.hierarquia;
    const c = mexer(fim, CARTAZ, ['data'], { corpo: 40, peso: 700, entrelinha: 1.15, y: 150 });
    expect(meta('hierarquia', 'titulo-se-destaca').feita(c)).toBe(false);
  });

  it('data maior que o título não está no segundo degrau', () => {
    const c = mexer(ESTADO_DEPOIS.hierarquia, CARTAZ, ['data'], { corpo: 28, peso: 700 });
    const d = mexer(c, CARTAZ, ['titulo'], { corpo: 22, peso: 700 });
    expect(meta('hierarquia', 'data-no-segundo-degrau').feita(d)).toBe(false);
  });

  it('mudar uma palavra do cartaz desfaz as três', () => {
    const c = mexer(ESTADO_DEPOIS.hierarquia, CARTAZ, ['local'], { texto: 'Chácara Recanto Verde' });
    expect(metasDa('hierarquia').filter(m => m.feita(c))).toEqual([]);
  });
});

describe('módulo 2 — alinhamento e proximidade', () => {
  const inicio = LICOES_DA_CC_DG001.alinhamento.contexto;

  it('alinhar à esquerda resolve a borda e não resolve os grupos', () => {
    const c = naPrancha(inicio, AVISO, p => alinhar(p, textos(p).map(t => t.id), 'esquerda'));
    expect(meta('alinhamento', 'uma-borda-so').feita(c)).toBe(true);
    expect(meta('alinhamento', 'grupos-separados').feita(c)).toBe(false);
  });

  it('metade numa borda e metade em outra são duas bordas', () => {
    const c = naPrancha(inicio, AVISO, p => {
      const ids = textos(p).map(t => t.id);
      const q = alinhar(p, ids.slice(0, 4), 'esquerda');
      return mudarObjetos(alinhar(q, ids.slice(4), 'esquerda'), ids.slice(4), o => ({ ...o, x: 60 }));
    });
    expect(meta('alinhamento', 'uma-borda-so').feita(c)).toBe(false);
  });

  it('todos centrados no mesmo centro também é uma borda só', () => {
    const c = naPrancha(ESTADO_DEPOIS.alinhamento, AVISO, p =>
      mudarObjetos(p, textos(p).map(t => t.id), o => ({ ...o, x: 40, largura: 400, alinhamento: 'centro' }) as Objeto));
    expect(meta('alinhamento', 'uma-borda-so').feita(c)).toBe(true);
  });
});

describe('módulo 3 — repetição e espaço negativo', () => {
  const fim = ESTADO_DEPOIS.repeticao;

  it('um cartão com a cor um tom diferente quebra a repetição', () => {
    const c = mexer(fim, PROGRAMACAO, ['cartao-2'], { preenchimento: '#E8F0E9' });
    expect(meta('repeticao', 'cartoes-iguais').feita(c)).toBe(false);
  });

  it('colar estilo nos três nomes resolve os nomes, e não os horários', () => {
    const inicio = LICOES_DA_CC_DG001.repeticao.contexto;
    const c = naPrancha(inicio, PROGRAMACAO, p =>
      colarEstilo(p, ['cartao-2-titulo', 'cartao-3-titulo'], copiarEstilo(umObjeto(p, 'cartao-1-titulo')!)));
    expect(meta('repeticao', 'textos-dos-cartoes-iguais').feita(c)).toBe(false);
    const d = naPrancha(c, PROGRAMACAO, p =>
      colarEstilo(p, ['cartao-2-hora', 'cartao-3-hora'], copiarEstilo(umObjeto(p, 'cartao-1-hora')!)));
    expect(meta('repeticao', 'textos-dos-cartoes-iguais').feita(d)).toBe(true);
  });

  it('cartões colados um no outro não respiram', () => {
    const c = naPrancha(fim, PROGRAMACAO, p => mudarObjetos(p, ['cartao-2', 'cartao-2-titulo', 'cartao-2-hora'],
      o => ({ ...o, x: o.x - 10 })));
    expect(meta('repeticao', 'respiro-entre-cartoes').feita(c)).toBe(false);
  });

  it('o texto encostado na borda do próprio cartão não respira', () => {
    const c = mexer(fim, PROGRAMACAO, ['cartao-1-titulo'], { x: 32 });
    expect(meta('repeticao', 'respiro-entre-cartoes').feita(c)).toBe(false);
  });

  it('o rodapé colado no pé da folha não respira', () => {
    const c = mexer(fim, PROGRAMACAO, ['rodape'], { y: 662 });
    expect(meta('repeticao', 'respiro-na-borda').feita(c)).toBe(false);
  });
});

describe('módulo 4 — cor', () => {
  const fim = ESTADO_DEPOIS.cor;
  const comPaleta = (c: ContextoDoDesign, muda: Partial<Arte['paleta']>): ContextoDoDesign =>
    ({ ...c, arte: { ...c.arte, paleta: { ...c.arte.paleta, ...muda } } });

  it('trocar a cor fora da gama sem ter visto a prova não fecha', () => {
    expect(meta('cor', 'imprime-como-aparece').feita({ ...fim, descobertas: [] })).toBe(false);
  });

  it('ter visto a prova e deixar o verde-limão não fecha', () => {
    expect(meta('cor', 'imprime-como-aparece').feita(comPaleta(fim, { destaque: '#39FF14' }))).toBe(false);
  });

  it('duas cores iguais na paleta não são cinco cores', () => {
    expect(meta('cor', 'imprime-como-aparece').feita(comPaleta(fim, { neutro: fim.arte.paleta.texto }))).toBe(false);
  });

  it('o apoio de outro matiz não é apoio do destaque', () => {
    expect(meta('cor', 'apoio-do-destaque').feita(comPaleta(fim, { apoio: '#5A7FA8' }))).toBe(false);
  });

  it('o apoio tão saturado quanto o destaque disputa com ele', () => {
    expect(meta('cor', 'apoio-do-destaque').feita(comPaleta(fim, { apoio: fim.arte.paleta.destaque }))).toBe(false);
  });

  it('cinco justificativas iguais não justificam nada', () => {
    const frase = 'Escolhi porque combina com o clube.';
    const c = { ...fim, caderno: { ...fim.caderno, porQueDaCor: { fundo: frase, texto: frase, destaque: frase, apoio: frase, neutro: frase } } };
    expect(meta('cor', 'cada-cor-justificada').feita(c)).toBe(false);
  });
});

describe('módulo 5 — tipografia', () => {
  const fim = ESTADO_DEPOIS.tipografia;

  it('duas serifadas não contrastam', () => {
    const c = mexer(fim, FOLHETO, ['titulo'], { familia: 'Times New Roman' });
    const d = mexer(c, FOLHETO, ['subtitulo', 'paragrafo-1', 'paragrafo-2'], { familia: 'Georgia' });
    expect(meta('tipografia', 'duas-familias-que-contrastam').feita(d)).toBe(false);
  });

  it('três famílias são uma a mais', () => {
    const c = mexer(fim, FOLHETO, ['subtitulo'], { familia: 'Verdana' });
    expect(meta('tipografia', 'duas-familias-que-contrastam').feita(c)).toBe(false);
  });

  it('parágrafo em monoespaçada não é texto de leitura', () => {
    /* O segundo parágrafo desce: a monoespaçada é mais larga, e encavalar
       reprovaria pelo motivo errado. */
    const c = mexer(fim, FOLHETO, ['subtitulo', 'paragrafo-1', 'paragrafo-2'], { familia: 'Courier New' });
    const d = mexer(c, FOLHETO, ['paragrafo-2'], { y: 290 });
    expect(meta('tipografia', 'duas-familias-que-contrastam').feita(d)).toBe(true);
    expect(meta('tipografia', 'corpo-de-leitura').feita(d)).toBe(false);
  });

  it('entrelinha de 100% aperta, e de 200% desmancha o parágrafo', () => {
    /* No último parágrafo, para crescer sem encavalar em ninguém. */
    for (const entrelinha of [1, 2]) {
      const c = mexer(fim, FOLHETO, ['paragrafo-2'], { entrelinha });
      expect(meta('tipografia', 'duas-familias-que-contrastam').feita(c)).toBe(true);
      expect(meta('tipografia', 'corpo-de-leitura').feita(c)).toBe(false);
    }
  });

  it('a explicação precisa dizer o nome das duas famílias que ficaram', () => {
    const c = { ...fim, caderno: { ...fim.caderno, parTipografico: 'Escolhi uma fonte para o título e outra para o texto porque elas ficam bonitas juntas e combinam bem com o folheto do clube.' } };
    expect(meta('tipografia', 'par-explicado').feita(c)).toBe(false);
  });

  it('subtítulo em outra família, mesmo em negrito, não é peso', () => {
    const c = mexer(fim, FOLHETO, ['subtitulo'], { familia: 'Georgia' });
    expect(meta('tipografia', 'subtitulo-pelo-peso').feita(c)).toBe(false);
  });
});

describe('módulo 6 — análise', () => {
  const fim = ESTADO_DEPOIS.analise;
  const nota = (c: ContextoDoDesign, peca: 'campori' | 'batismo' | 'gincana', principio: 'contraste' | 'hierarquia' | 'alinhamento', muda: object): ContextoDoDesign => ({
    ...c,
    analise: {
      ...c.analise,
      [peca]: { ...c.analise[peca], notas: { ...c.analise[peca].notas, [principio]: { ...c.analise[peca].notas[principio], ...muda } } },
    },
  });

  it('veredito certo apontando o lugar errado não fecha', () => {
    const c = nota(fim, CAMPORI, 'contraste', { elemento: 'rodape' });
    expect(meta('analise', 'analise-de-contraste').feita(c)).toBe(false);
  });

  it('o lugar certo para a falha do campori é o título sobre a foto', () => {
    const p = umaPrancha(fim.arte, CAMPORI)!;
    expect(culpados(p, 'contraste')).toEqual(['titulo']);
  });

  it('dizer "falha" em tudo não fecha', () => {
    let c = fim;
    for (const peca of [CAMPORI, BATISMO, 'gincana'] as const) {
      const p = umaPrancha(fim.arte, peca)!;
      c = nota(c, peca, 'alinhamento', { veredito: 'falha', elemento: textos(p)[0].id });
    }
    expect(meta('analise', 'analise-de-alinhamento').feita(c)).toBe(false);
  });

  it('frase de três palavras não é análise', () => {
    const c = nota(fim, BATISMO, 'hierarquia', { texto: 'Está muito ruim.' });
    expect(meta('analise', 'analise-de-hierarquia').feita(c)).toBe(false);
  });

  it('trocar a bem resolvida pela discutível não fecha', () => {
    const c = {
      ...fim,
      analise: {
        ...fim.analise,
        gincana: { ...fim.analise.gincana, classe: 'discutivel' as const },
        campori: { ...fim.analise.campori, classe: 'bem' as const },
      },
    };
    expect(meta('analise', 'classificou-as-tres').feita(c)).toBe(false);
  });
});

describe('módulo 7 — refazer', () => {
  const inicio = LICOES_DA_CC_DG001.refazer.contexto;
  const fim = ESTADO_DEPOIS.refazer;

  it('refazer a original sem duplicar perde a versão anterior', () => {
    const { depois } = versoesDoBatismo(fim.arte);
    const semAntes: ContextoDoDesign = {
      ...fim,
      arte: { ...fim.arte, pranchas: fim.arte.pranchas.filter(p => p.id !== BATISMO) },
    };
    expect(depois).toBeDefined();
    expect(meta('refazer', 'versao-anterior-guardada').feita(semAntes)).toBe(false);
    expect(meta('refazer', 'hierarquia-refeita').feita(semAntes)).toBe(true);
  });

  it('duplicar e não mexer não é refazer', () => {
    const c = { ...inicio, arte: duplicarPrancha(inicio.arte, BATISMO) };
    expect(meta('refazer', 'versao-anterior-guardada').feita(c)).toBe(false);
  });

  it('apagar uma linha do convite não é refazer: a informação some', () => {
    const { depois } = versoesDoBatismo(fim.arte);
    const c = naPrancha(fim, depois!.id, p => excluir(p, [textos(p).find(t => t.texto.startsWith('Às 9h'))!.id]));
    expect(metasDa('refazer').filter(m => m.feita(c))).toEqual([]);
  });

  it('o nome do clube colado no topo da cópia não respira', () => {
    const { depois } = versoesDoBatismo(fim.arte);
    const rodape = textos(depois!).find(t => t.texto === 'Clube Pioneiros')!;
    const c = mexer(fim, depois!.id, [rodape.id], { y: 8 });
    expect(meta('refazer', 'respiro-refeito').feita(c)).toBe(false);
  });

  it('mexer na original e na cópia ao mesmo tempo perde a de antes', () => {
    const { depois } = versoesDoBatismo(fim.arte);
    const c = mexer(fim, BATISMO, ['titulo'], { cor: '#333333' });
    expect(depois).toBeDefined();
    expect(meta('refazer', 'versao-anterior-guardada').feita(c)).toBe(false);
  });
});

describe('módulo 8 — contraste e cor', () => {
  const fim = ESTADO_DEPOIS.contraste;

  it('medir só alguns textos não é medir a peça', () => {
    const c = { ...fim, descobertas: fim.descobertas.filter((d, i) => !d.startsWith('mediu:') || i % 2 === 0) };
    expect(meta('contraste', 'mediu-a-sua-peca').feita(c)).toBe(false);
  });

  it('medir a peça de outra pessoa não conta', () => {
    const outra = umaPrancha(fim.arte, CAMPORI)!;
    const c = { ...fim, descobertas: [CHAVE_SEM_COR, ...textos(outra).map(t => chaveDaMedida(outra.id, t.id))] };
    expect(meta('contraste', 'mediu-a-sua-peca').feita(c)).toBe(false);
  });

  it('medir e deixar um texto abaixo do mínimo não fecha', () => {
    const { depois } = versoesDoBatismo(fim.arte);
    const id = textos(depois!)[0].id;
    const c = mexer(fim, depois!.id, [id], { cor: '#BBBBBB' });
    expect(meta('contraste', 'mediu-a-sua-peca').feita(c)).toBe(false);
  });

  it('a palavra na linha errada não vale', () => {
    const c = mexer(fim, ESCALA, ['nome-2'], { texto: 'Davi Moreira — confirmado' });
    expect(meta('contraste', 'situacao-tambem-por-palavra').feita(c)).toBe(false);
  });

  it('escrever as três palavras em toda linha não diz nada', () => {
    const c = naPrancha(fim, ESCALA, p => mudarObjetos(p, textos(p).filter(t => t.id.startsWith('nome-')).map(t => t.id),
      o => ({ ...o, texto: `${(o as Texto).texto.split(' — ')[0]} — confirmado, pendente ou cancelado` }) as Objeto));
    expect(meta('contraste', 'situacao-tambem-por-palavra').feita(c)).toBe(false);
  });

  it('a palavra num texto novo, ao lado do nome, também vale', () => {
    const inicio = LICOES_DA_CC_DG001.contraste.contexto;
    const c = naPrancha(inicio, ESCALA, p => ({
      ...p,
      objetos: [...p.objetos, ...['confirmado', 'cancelado', 'confirmado', 'pendente', 'cancelado', 'confirmado']
        .map((s, i): Texto => ({
          ...(umObjeto(p, `nome-${i + 1}`) as Texto), id: `situacao-${i + 1}`, nome: 'Situação', texto: s, x: 340, largura: 100,
        }))],
    }));
    expect(meta('contraste', 'situacao-tambem-por-palavra').feita(c)).toBe(true);
  });

  it('a prova de impressão não é a simulação de daltonismo', () => {
    const c = { ...fim, descobertas: fim.descobertas.filter(d => d !== CHAVE_SEM_COR).concat(CHAVE_DA_PROVA) };
    expect(meta('contraste', 'viu-a-escala-sem-cor').feita(c)).toBe(false);
  });
});

describe('o arquivo continua um só', () => {
  it('as lições não somem com pranchas que vieram antes', () => {
    const ids = (a: Arte) => a.pranchas.map(p => p.id);
    for (const l of LICOES) {
      for (const id of [CARTAZ, AVISO, PROGRAMACAO, FOLHETO, BATISMO, ESCALA]) {
        expect(ids(ESTADO_DEPOIS[l].arte)).toContain(id);
      }
    }
  });
});
