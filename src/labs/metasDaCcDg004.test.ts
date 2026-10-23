import { describe, expect, it } from 'vitest';
import {
  CADERNO_VAZIO, LICOES_DA_CC_DG004, MINIMO_DECLARADO, assinaturaEm, chaveDosTamanhos, defeitosNoManual, estadoDepois,
  metasDa, type ContextoDaIdentidade, type LicaoDaCcDg004,
} from './metasDaCcDg004';
import {
  ASSINATURA, CAMISETA, CRACHA, MANUAL, NOME_DA_MARCA, POST, SIMBOLO, TAMANHO_MINIMO, TIPOGRAFIA, assinaturaDaIpe,
} from './identidadeDoClube';
import { duplicarPrancha, mudarPrancha, recolorir, type Grupo, type Objeto, type Prancha } from './design';
import { larguraMinimaMedida } from './identidade';

/*
  A trava de motor da CC-DG004: nenhuma meta abre verde, a solução de
  referência fecha todas, e os caminhos errados — os que alguém tomaria com
  pressa — continuam vermelhos.
*/

const LICOES = Object.keys(LICOES_DA_CC_DG004) as LicaoDaCcDg004[];
const feita = (licao: LicaoDaCcDg004, id: string, c: ContextoDaIdentidade) => {
  const m = metasDa(licao).find(x => x.id === id);
  if (!m) throw new Error(`A meta ${id} sumiu da lição ${licao}.`);
  return m.feita(c);
};
const naPrancha = (c: ContextoDaIdentidade, id: string, f: (p: Prancha) => Prancha): ContextoDaIdentidade =>
  ({ ...c, arte: mudarPrancha(c.arte, id, f) });
const comObjetos = (c: ContextoDaIdentidade, id: string, os: Objeto[]) => naPrancha(c, id, p => ({ ...p, objetos: os }));

describe('as nove lições da CC-DG004', () => {
  it.each(LICOES)('%s abre sem nenhuma meta cumprida', licao => {
    const c = LICOES_DA_CC_DG004[licao].contexto();
    expect(metasDa(licao).filter(m => m.feita(c)).map(m => m.id)).toEqual([]);
  });

  it.each(LICOES)('%s fecha com a solução de referência', licao => {
    const c = estadoDepois(licao);
    expect(metasDa(licao).filter(m => !m.feita(c)).map(m => m.id)).toEqual([]);
  });

  it.each(LICOES)('%s: toda meta tem passo a passo', licao => {
    for (const m of metasDa(licao)) expect(m.passos.length, m.id).toBeGreaterThan(0);
  });

  it('a lição seguinte parte de onde a anterior chegou', () => {
    expect(LICOES_DA_CC_DG004.rascunhos.contexto().caderno.palavras).toEqual(estadoDepois('conceito').caderno.palavras);
    expect(LICOES_DA_CC_DG004.simbolo.contexto().caderno.rascunhos).toEqual(estadoDepois('rascunhos').caderno.rascunhos);
    expect(LICOES_DA_CC_DG004.aplicacoes.contexto().arte.paleta).toEqual(estadoDepois('paleta').arte.paleta);
  });
});

describe('conceito e rascunhos', () => {
  const pronto = estadoDepois('conceito');

  it('"todo mundo" não é público', () => {
    const c = { ...pronto, caderno: { ...pronto.caderno, aQuem: 'Para todo mundo' } };
    expect(feita('conceito', 'disse-a-quem', c)).toBe(false);
    const c2 = { ...pronto, caderno: { ...pronto.caderno, aQuem: 'todo mundo que gosta de acampar' } };
    expect(feita('conceito', 'disse-a-quem', c2)).toBe(false);
  });

  it('a mesma palavra duas vezes não são três palavras', () => {
    const c = { ...pronto, caderno: { ...pronto.caderno, palavras: ['firme', 'Firme', 'alegre'] as [string, string, string] } };
    expect(feita('conceito', 'tres-palavras', c)).toBe(false);
  });

  const rascunhos = estadoDepois('rascunhos');

  it('o mesmo motivo nove vezes não justifica os descartes', () => {
    const c = {
      ...rascunhos,
      caderno: { ...rascunhos.caderno, rascunhos: rascunhos.caderno.rascunhos.map((r, i) => (i === 0 ? r : { ...r, porQueNao: 'Não ficou tão bom quanto o escolhido.' })) },
    };
    expect(feita('rascunhos', 'justificou-os-descartes', c)).toBe(false);
  });

  it('dez rascunhos com duas ideias repetidas são nove ideias', () => {
    const rs = rascunhos.caderno.rascunhos.map((r, i) => (i === 9 ? { ...r, ideia: rascunhos.caderno.rascunhos[0].ideia } : r));
    expect(feita('rascunhos', 'dez-rascunhos', { ...rascunhos, caderno: { ...rascunhos.caderno, rascunhos: rs } })).toBe(false);
  });

  it('sem escolher, não há o que justificar — nem com os dez motivos escritos', () => {
    const rs = rascunhos.caderno.rascunhos.map((r, i) => (i === 0 ? { ...r, porQueNao: 'Este também ficou para trás porque era redondo demais.' } : r));
    const c = { ...rascunhos, caderno: { ...rascunhos.caderno, rascunhos: rs, escolhido: null } };
    expect(feita('rascunhos', 'justificou-os-descartes', c)).toBe(false);
  });
});

describe('símbolo e versões', () => {
  const partida = LICOES_DA_CC_DG004.simbolo.contexto();

  it('duas formas no cinza do editor ainda não são símbolo', () => {
    const cinza: Objeto[] = [
      { id: 'a', nome: 'A', tipo: 'elipse', x: 40, y: 40, largura: 100, altura: 100, preenchimento: '#D9D9D9' },
      { id: 'b', nome: 'B', tipo: 'retangulo', x: 80, y: 130, largura: 20, altura: 60, preenchimento: '#D9D9D9' },
    ];
    expect(feita('simbolo', 'desenhou-o-simbolo', comObjetos(partida, SIMBOLO, cinza))).toBe(false);
  });

  it('símbolo e texto soltos, sem agrupar, não são assinatura', () => {
    const solto = assinaturaDaIpe('s').filhos;
    expect(feita('simbolo', 'montou-a-assinatura', comObjetos(partida, SIMBOLO, solto))).toBe(false);
  });

  const versoes = LICOES_DA_CC_DG004.versoes.contexto();

  it('pintar a original de preto apaga a colorida, e não conta como versão', () => {
    const c = naPrancha(versoes, ASSINATURA, p => ({ ...p, objetos: p.objetos.map(o => recolorir(o, '#000000')) }));
    expect(feita('versoes', 'versao-monocromatica', c)).toBe(false);
  });

  it('a versão de uma cor certa não vale se a original também perdeu a cor', () => {
    const certo = estadoDepois('versoes');
    const c = naPrancha(certo, ASSINATURA, p => ({ ...p, objetos: p.objetos.map(o => recolorir(o, '#000000')) }));
    expect(feita('versoes', 'versao-monocromatica', c)).toBe(false);
    expect(feita('versoes', 'versao-negativa', c)).toBe(false);
  });

  it('explicar só a cor, sem falar de tamanho, é meia explicação', () => {
    const certo = estadoDepois('versoes');
    const c = { ...certo, caderno: { ...certo.caderno, porQueUmaCor: 'A marca precisa funcionar numa cor só porque nem toda impressora do clube tem tinta colorida e o carimbo é de uma cor.' } };
    expect(feita('versoes', 'porque-uma-cor', c)).toBe(false);
  });

  it('branco sobre branco não é negativa', () => {
    const a = duplicarPrancha(versoes.arte, ASSINATURA);
    const copia = a.pranchas[1].id;
    const c = naPrancha({ ...versoes, arte: a }, copia, p => ({ ...p, objetos: p.objetos.map(o => recolorir(o, '#FFFFFF')) }));
    expect(feita('versoes', 'versao-negativa', c)).toBe(false);
  });

  it('uma versão com a copa esticada é outra marca', () => {
    const a = duplicarPrancha(versoes.arte, ASSINATURA);
    const copia = a.pranchas[1].id;
    const c = naPrancha({ ...versoes, arte: a }, copia, p => ({
      ...p,
      objetos: p.objetos.map(o => {
        const g = recolorir(o, '#000000') as Grupo;
        return { ...g, filhos: g.filhos.map(f => (f.tipo === 'elipse' ? { ...f, largura: f.largura * 1.5 } : f)) };
      }),
    }));
    expect(feita('versoes', 'versao-monocromatica', c)).toBe(false);
  });
});

describe('paleta, proteção e mínimo', () => {
  const paleta = estadoDepois('paleta');

  it('paleta sem o roxo da copa não é a paleta da marca', () => {
    const c = { ...paleta, arte: { ...paleta.arte, paleta: { ...paleta.arte.paleta, destaque: '#E67E22' } } };
    expect(feita('paleta', 'definiu-a-paleta', c)).toBe(false);
  });

  it('texto cinza-claro sobre o creme não se lê', () => {
    const c = { ...paleta, arte: { ...paleta.arte, paleta: { ...paleta.arte.paleta, texto: '#A0A0A0' } } };
    expect(feita('paleta', 'paleta-legivel', c)).toBe(false);
  });

  it('três famílias na prancha de tipografia é tipografia demais', () => {
    const c = naPrancha(paleta, TIPOGRAFIA, p => ({
      ...p,
      objetos: [...p.objetos, { ...p.objetos[0], id: 'outra', familia: 'Comic Sans MS' } as Objeto],
    }));
    expect(feita('paleta', 'definiu-a-tipografia', c)).toBe(false);
  });

  const protecao = estadoDepois('protecao');
  const medido = larguraMinimaMedida(assinaturaDaIpe(), NOME_DA_MARCA);

  it('área de proteção maior que a própria marca não é proteção, é exílio', () => {
    expect(feita('protecao', 'declarou-a-protecao', { ...protecao, caderno: { ...protecao.caderno, protecao: 2 } })).toBe(false);
    expect(feita('protecao', 'declarou-a-protecao', { ...protecao, caderno: { ...protecao.caderno, protecao: 0.1 } })).toBe(false);
  });

  it('o mínimo declarado abaixo do que se lê, ou folgado demais, não vale', () => {
    expect(medido).toBeLessThanOrEqual(MINIMO_DECLARADO);
    for (const minimo of [medido - 10, medido * 3]) {
      expect(feita('protecao', 'declarou-o-minimo', { ...protecao, caderno: { ...protecao.caderno, minimo } }), String(minimo)).toBe(false);
    }
  });

  it('a assinatura do tamanho errado, ou com vizinho encostado, não prova o mínimo', () => {
    const grande = comObjetos(protecao, TAMANHO_MINIMO, [assinaturaEm('x', 80, 150, 150)]);
    expect(feita('protecao', 'provou-o-minimo', grande)).toBe(false);
    const encostado = comObjetos(protecao, TAMANHO_MINIMO, [
      assinaturaEm('x', MINIMO_DECLARADO, 180, 180),
      { id: 'viz', nome: 'Vizinho', tipo: 'retangulo', x: 222, y: 180, largura: 20, altura: 20, preenchimento: '#1F2A24' },
    ]);
    expect(feita('protecao', 'provou-o-minimo', encostado)).toBe(false);
  });
});

describe('aplicações', () => {
  const ref = estadoDepois('aplicacoes');
  const trocar = (c: ContextoDaIdentidade, id: string, marca: Grupo) =>
    naPrancha(c, id, p => ({ ...p, objetos: [...p.objetos.filter(o => o.tipo !== 'grupo'), marca] }));

  it('a colorida na camiseta verde não se lê', () => {
    expect(feita('aplicacoes', 'na-camiseta', trocar(ref, CAMISETA, assinaturaEm('c', 150, 80, 120)))).toBe(false);
  });

  it('no crachá, abaixo do mínimo não vale, e encostada na foto também não', () => {
    expect(feita('aplicacoes', 'no-cracha', trocar(ref, CRACHA, assinaturaEm('c', 30, 105, 40)))).toBe(false);
    expect(feita('aplicacoes', 'no-cracha', trocar(ref, CRACHA, assinaturaEm('c', 105, 67, 60)))).toBe(false);
  });

  it('no post, encostada na chamada não vale', () => {
    expect(feita('aplicacoes', 'no-post', trocar(ref, POST, assinaturaEm('p', 180, 60, 300, '#FFFFFF')))).toBe(false);
  });
});

describe('o manual', () => {
  const ref = estadoDepois('manual');
  const semPagina = (c: ContextoDaIdentidade, id: string): ContextoDaIdentidade =>
    ({ ...c, arte: { ...c.arte, pranchas: c.arte.pranchas.filter(p => p.id !== id) } });

  it('três páginas não são quatro, nem com uma quarta em branco', () => {
    expect(feita('manual', 'quatro-paginas', semPagina(ref, 'manual-protecao'))).toBe(false);
    expect(feita('manual', 'quatro-paginas', comObjetos(ref, 'manual-protecao', []))).toBe(false);
  });

  it('a página de versões sem a negativa não mostra os usos corretos', () => {
    const c = naPrancha(ref, MANUAL, p => ({ ...p, objetos: p.objetos.filter(o => !o.id.startsWith('m-negativa')) }));
    expect(feita('manual', 'usos-corretos', c)).toBe(false);
  });

  it('três marcas estragadas do mesmo jeito ilustram um uso incorreto, e não três', () => {
    const c = naPrancha(ref, 'manual-incorretos', p => ({
      ...p,
      objetos: [0, 1, 2].map(i => assinaturaEm(`r${i}`, 120, 40 + i * 5, 60 + i * 150, '#B03A2E')),
    }));
    expect(defeitosNoManual(c).filter(d => d.defeitos.length > 0)).toHaveLength(3);
    expect(feita('manual', 'tres-incorretos', c)).toBe(false);
  });

  it('as marcas lado a lado não ganham de graça o defeito da proteção', () => {
    const c = naPrancha(ref, 'manual-incorretos', p => ({
      ...p, objetos: [0, 1, 2].map(i => assinaturaEm(`ok${i}`, 120, 40, 60 + i * 70)),
    }));
    expect(defeitosNoManual(c).filter(d => d.defeitos.length > 0)).toEqual([]);
  });

  it('paleta no manual com uma cor faltando não é a paleta', () => {
    const c = naPrancha(ref, 'manual-paleta', p => ({ ...p, objetos: p.objetos.filter(o => o.id !== 'mp-amostra-0') }));
    expect(feita('manual', 'paleta-no-manual', c)).toBe(false);
  });
});

describe('a defesa', () => {
  const ref = estadoDepois('defesa');

  it('uma defesa que não usa as palavras do conceito não defende o conceito', () => {
    const defesa = 'Eu desenhei uma árvore porque achei bonita e porque a unidade tem nome de árvore, e assim todo mundo vai entender rápido o que é a marca quando olhar para ela no crachá, na camiseta, no post do clube e no carimbo que vai nos documentos da unidade.';
    expect(defesa.split(/\s+/).length).toBeGreaterThanOrEqual(40);
    const c = { ...ref, caderno: { ...ref.caderno, defesa } };
    expect(feita('defesa', 'defendeu-o-conceito', c)).toBe(false);
  });

  it('contar o rascunho que seguiu não é contar um descarte', () => {
    const c = { ...ref, caderno: { ...ref.caderno, descarteContado: ref.caderno.escolhido } };
    expect(feita('defesa', 'contou-um-descarte', c)).toBe(false);
  });

  it('copiar o motivo do descarte não é dizer o que ele ensinou', () => {
    const i = ref.caderno.descarteContado!;
    const longo = 'As cinco pétalas pequenas somem no tamanho de um carimbo e no crachá viram uma mancha roxa só, sem desenho.';
    const rs = ref.caderno.rascunhos.map((r, j) => (j === i ? { ...r, porQueNao: longo } : r));
    const c = { ...ref, caderno: { ...ref.caderno, rascunhos: rs, oQueODescarteEnsinou: longo } };
    expect(feita('defesa', 'contou-um-descarte', c)).toBe(false);
  });
});

describe('o caderno vazio', () => {
  it('tem os dez rascunhos em branco', () => {
    expect(CADERNO_VAZIO.rascunhos).toHaveLength(10);
    expect(chaveDosTamanhos(SIMBOLO)).toBe('tamanhos:simbolo');
  });
});

