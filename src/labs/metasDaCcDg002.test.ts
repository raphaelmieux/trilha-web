// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  combinar, desagrupar, duplicarPrancha, mudarObjetos, mudarPrancha, moverObjeto, redimensionar, textos, umObjeto, umaPrancha,
  type Arte, type Caminho, type Objeto, type Prancha,
} from './design';
import { achatar, coincidencia, contornoDoPoligono, escalar, moverNo, trocarTipo, contornoDoRetangulo, type Contorno } from './vetor';
import {
  ASSINATURA, BANDEIRA_ONDULADA, CURVAS, FOLHA_GUIA, ICONE, ICONES, LOGOTIPO, LOGOTIPO_PEDIDO, PLACA, TRES_ICONES,
} from './arteVetorial';
import {
  FOLHA_DA_CANETA, LICOES_DA_CC_DG002, UM_PIXEL_EM_16, USOS, chaveDoReabrir, chaveDosTamanhos, chaveDoZoom,
  detalhesQueSomem, estadoDepois, metasDa,
  type ContextoVetorial, type LicaoDaCcDg002,
} from './metasDaCcDg002';
import { caminho } from './arteVetorial';
import { svgDaPrancha } from './svg';

const LICOES = Object.keys(LICOES_DA_CC_DG002) as LicaoDaCcDg002[];

const meta = (licao: LicaoDaCcDg002, id: string) => {
  const m = metasDa(licao).find(x => x.id === id);
  if (!m) throw new Error(`meta ${id} não existe em ${licao}`);
  return m;
};

const naPrancha = (c: ContextoVetorial, id: string, f: (p: Prancha) => Prancha): ContextoVetorial =>
  ({ ...c, arte: mudarPrancha(c.arte, id, f) });
const mexer = (c: ContextoVetorial, prancha: string, ids: string[], f: (o: Objeto) => Objeto) =>
  naPrancha(c, prancha, p => mudarObjetos(p, ids, f));

describe('cada lição', () => {
  it('existe para as nove, e cada uma tem metas', () => {
    expect(LICOES).toHaveLength(9);
    for (const l of LICOES) expect(metasDa(l).length).toBeGreaterThanOrEqual(2);
  });

  for (const l of LICOES) {
    it(`${l}: nenhuma meta abre verde`, () => {
      const c = LICOES_DA_CC_DG002[l].contexto;
      expect(metasDa(l).filter(m => m.feita(c)).map(m => m.id)).toEqual([]);
    });
    it(`${l}: a solução de referência fecha todas`, () => {
      expect(metasDa(l).filter(m => !m.feita(estadoDepois(l))).map(m => m.id)).toEqual([]);
    });
  }

  it('cada lição parte de onde a anterior acabou', () => {
    for (let i = 1; i < LICOES.length; i++) {
      const anterior = estadoDepois(LICOES[i - 1]);
      const partida = LICOES_DA_CC_DG002[LICOES[i]].contexto;
      expect(partida.arte).toEqual(anterior.arte);
      expect(partida.caderno).toEqual(anterior.caderno);
      expect(partida.arquivos).toEqual(anterior.arquivos);
      expect(partida.descobertas).toEqual([]);
    }
  });
});

describe('módulo 1 — vetor e pontos', () => {
  const fim = estadoDepois('vetor-e-pontos');

  it('ampliar a 200% não é ver a foto virar escada', () => {
    expect(meta('vetor-e-pontos', 'ampliou-os-dois').feita({ ...fim, descobertas: ['zoom:2:emblema'] })).toBe(false);
  });

  it('marcar tudo como vetor não fecha', () => {
    const usos = Object.fromEntries(USOS.map(u => [u.id, 'vetor'])) as ContextoVetorial['caderno']['usos'];
    expect(meta('vetor-e-pontos', 'classificou-os-usos').feita({ ...fim, caderno: { ...fim.caderno, usos } })).toBe(false);
  });

  it('três de cada, sem nenhum trocado', () => {
    expect(USOS.filter(u => u.certo === 'vetor')).toHaveLength(3);
    expect(USOS.filter(u => u.certo === 'pontos')).toHaveLength(3);
  });
});

describe('módulo 2 — booleanas', () => {
  const inicio = LICOES_DA_CC_DG002.booleanas.contexto;

  it('subtrair na ordem errada não dá a lua', () => {
    const c = naPrancha(inicio, ICONES, p => {
      const q = mudarObjetos(p, ['lua-a', 'lua-b'], o => o);
      /* A de baixo vira a de cima: agora quem perde o pedaço é a outra. */
      const [a, b] = [q.objetos.findIndex(o => o.id === 'lua-a'), q.objetos.findIndex(o => o.id === 'lua-b')];
      const objetos = [...q.objetos];
      [objetos[a], objetos[b]] = [objetos[b], objetos[a]];
      return combinar({ ...q, objetos }, ['lua-a', 'lua-b'], 'subtracao');
    });
    expect(meta('booleanas', 'lua-combinada').feita(c)).toBe(false);
  });

  it('unir onde era para intersectar não dá a folha', () => {
    const c = naPrancha(inicio, ICONES, p => combinar(p, ['folha-a', 'folha-b'], 'uniao'));
    expect(meta('booleanas', 'folha-combinada').feita(c)).toBe(false);
  });

  it('a forma certa em outro lugar e outro tamanho vale', () => {
    const fim = estadoDepois('booleanas');
    const c = mexer(fim, ICONES, ['lona'], o => redimensionar(moverObjeto(o, 30, 10), o.largura * 0.5, (o as Caminho).altura * 0.5));
    expect(meta('booleanas', 'barraca-combinada').feita(c)).toBe(true);
  });

  it('a barraca esticada só na largura não vale', () => {
    const fim = estadoDepois('booleanas');
    const c = mexer(fim, ICONES, ['lona'], o => redimensionar(o, o.largura * 1.3, undefined));
    expect(meta('booleanas', 'barraca-combinada').feita(c)).toBe(false);
  });

  it('juntar só duas das três nuvens não é a nuvem', () => {
    const c = naPrancha(inicio, ICONES, p => combinar(p, ['nuvem-a', 'nuvem-b'], 'uniao'));
    expect(meta('booleanas', 'nuvem-combinada').feita(c)).toBe(false);
  });
});

describe('módulo 3 — curvas', () => {
  const inicio = LICOES_DA_CC_DG002.curvas.contexto;
  const fim = estadoDepois('curvas');
  const bandeira = (c: ContextoVetorial) => umObjeto(umaPrancha(c.arte, CURVAS)!, 'bandeira') as Caminho;
  const comBandeira = (c: ContextoVetorial, f: (k: Contorno) => Contorno) =>
    mexer(c, CURVAS, ['bandeira'], o => ({ ...(o as Caminho), contornos: [f((o as Caminho).contornos[0])] }));

  it('só mover os nós, sem trocar o tipo, faz quina e não onda', () => {
    const c = comBandeira(inicio, k => moverNo(moverNo(k, 1, 130, 30), 4, 130, 130));
    expect(meta('curvas', 'bandeira-ondulada').feita(c)).toBe(false);
  });

  it('só trocar o tipo, sem mover, fica longe do guia', () => {
    const c = comBandeira(inicio, k => trocarTipo(trocarTipo(k, 1, 'suave'), 4, 'suave'));
    expect(meta('curvas', 'bandeira-ondulada').feita(c)).toBe(false);
  });

  it('mover primeiro e trocar o tipo depois também chega', () => {
    const c = comBandeira(inicio, k => trocarTipo(trocarTipo(moverNo(moverNo(k, 1, 130, 30), 4, 130, 130), 1, 'suave'), 4, 'suave'));
    expect(meta('curvas', 'bandeira-ondulada').feita(c)).toBe(true);
  });

  it('a folha de quinas, sem nó suave, não vale', () => {
    const quinas: Contorno = { ...FOLHA_DA_CANETA, nos: FOLHA_DA_CANETA.nos.map(n => ({ ...n, tipo: 'canto' as const, entrada: null, saida: null })) };
    const c = naPrancha(inicio, CURVAS, p => ({ ...p, objetos: [...p.objetos, caminho('c', 'Folha', [quinas], '#3F8F3F')] }));
    expect(meta('curvas', 'folha-com-a-caneta').feita(c)).toBe(false);
  });

  /* Clicar dezesseis vezes em volta do guia, sem arrastar nenhuma, chega na
     forma — e não é desenhar com curvas. */
  it('a folha de dezesseis quinas, que bate com o guia, não vale', () => {
    const pts = achatar(FOLHA_GUIA[0]).filter((_, i) => i % 2 === 0);
    const c = naPrancha(inicio, CURVAS, p => ({ ...p, objetos: [...p.objetos, caminho('c', 'Folha', [contornoDoPoligono(pts)], '#3F8F3F')] }));
    const folha = umObjeto(umaPrancha(c.arte, CURVAS)!, 'c') as Caminho;
    expect(coincidencia(folha.contornos, FOLHA_GUIA)).toBeGreaterThan(0.95);
    expect(meta('curvas', 'folha-com-a-caneta').feita(c)).toBe(false);
  });

  it('a folha aberta não vale', () => {
    const c = naPrancha(inicio, CURVAS, p => ({ ...p, objetos: [...p.objetos, caminho('c', 'Folha', [{ ...FOLHA_DA_CANETA, fechado: false }], '#3F8F3F')] }));
    expect(meta('curvas', 'folha-com-a-caneta').feita(c)).toBe(false);
  });

  it('a bandeira ondulada não conta como folha', () => {
    expect(bandeira(fim).contornos[0]).toEqual(BANDEIRA_ONDULADA);
    const semFolha = naPrancha(fim, CURVAS, p => ({ ...p, objetos: p.objetos.filter(o => o.id !== 'caminho-1') }));
    expect(meta('curvas', 'folha-com-a-caneta').feita(semFolha)).toBe(false);
  });
});

describe('módulo 4 — traço', () => {
  const fim = estadoDepois('traco');
  const traco = (c: ContextoVetorial, id: string, muda: object) =>
    mexer(c, PLACA, [id], o => ({ ...o, traco: { ...(o as Caminho).traco!, ...muda } }) as Objeto);

  it('grossa com a ponta reta não fecha', () => {
    expect(meta('traco', 'trilha-grossa-e-redonda').feita(traco(fim, 'trilha', { extremidade: 'reta' }))).toBe(false);
  });

  it('seta sem preenchimento mas com traço diferente da trilha não fecha', () => {
    expect(meta('traco', 'seta-sem-preenchimento').feita(traco(fim, 'seta', { espessura: 14 }))).toBe(false);
  });

  it('seta igual à trilha, porém fina, não fecha', () => {
    const c = traco(traco(fim, 'seta', { espessura: 4 }), 'trilha', { espessura: 4 });
    expect(meta('traco', 'seta-sem-preenchimento').feita(c)).toBe(false);
  });

  it('seta ainda preenchida não fecha', () => {
    const c = mexer(fim, PLACA, ['seta'], o => ({ ...(o as Caminho), preenchimento: '#1F2A24' }));
    expect(meta('traco', 'seta-sem-preenchimento').feita(c)).toBe(false);
  });

  it('traço da cor do miolo não é contorno', () => {
    expect(meta('traco', 'placa-com-contorno').feita(traco(fim, 'placa', { cor: '#F2C14E' }))).toBe(false);
  });
});

describe('módulo 5 — camadas', () => {
  const fim = estadoDepois('camadas');

  it('grupo chamado só "Grupo" não está nomeado', () => {
    const c = mexer(fim, TRES_ICONES, ['grupo-fogueira'], o => ({ ...o, nome: 'Grupo 2' }));
    expect(meta('camadas', 'tres-grupos').feita(c)).toBe(false);
  });

  it('a porta no grupo da árvore não é a barraca agrupada', () => {
    const c = naPrancha(fim, TRES_ICONES, p => desagrupar(p, 'grupo-barraca'));
    expect(meta('camadas', 'tres-grupos').feita(c)).toBe(false);
  });

  it('um ícone um pixel acima da base dos outros ainda passa, e cinco não', () => {
    const um = mexer(fim, TRES_ICONES, ['grupo-arvore'], o => moverObjeto(o, 0, -1));
    expect(meta('camadas', 'mesma-base').feita(um)).toBe(true);
    const cinco = mexer(fim, TRES_ICONES, ['grupo-arvore'], o => moverObjeto(o, 0, -5));
    expect(meta('camadas', 'mesma-base').feita(cinco)).toBe(false);
  });

  it('vãos diferentes não estão distribuídos', () => {
    const c = mexer(fim, TRES_ICONES, ['grupo-arvore'], o => moverObjeto(o, 12, 0));
    expect(meta('camadas', 'mesmo-vao').feita(c)).toBe(false);
  });
});

describe('módulo 6 — texto em curvas', () => {
  const inicio = LICOES_DA_CC_DG002['texto-em-curvas'].contexto;
  const fim = estadoDepois('texto-em-curvas');

  it('duplicar depois de converter guarda as curvas, e não o texto', () => {
    const convertido = { ...fim, arte: { ...fim.arte, pranchas: fim.arte.pranchas.filter(p => p.id === ASSINATURA || !p.id.startsWith(`${ASSINATURA}-copia`)) } };
    const depois: ContextoVetorial = { ...convertido, arte: duplicarPrancha(convertido.arte, ASSINATURA) };
    expect(meta('texto-em-curvas', 'guardou-o-editavel').feita(depois)).toBe(false);
  });

  it('só duplicar não converte', () => {
    const c = { ...inicio, arte: duplicarPrancha(inicio.arte, ASSINATURA) };
    expect(meta('texto-em-curvas', 'guardou-o-editavel').feita(c)).toBe(true);
    expect(meta('texto-em-curvas', 'nome-em-curvas').feita(c)).toBe(false);
  });

  it('apagar o nome não é convertê-lo', () => {
    const c = naPrancha(inicio, ASSINATURA, p => ({ ...p, objetos: p.objetos.filter(o => o.tipo !== 'texto') }));
    expect(meta('texto-em-curvas', 'nome-em-curvas').feita(c)).toBe(false);
  });

  it('a curva por cima do texto, com o texto ainda lá, não é converter', () => {
    const original = textos(umaPrancha(inicio.arte, ASSINATURA)!)[0];
    const c = naPrancha(fim, ASSINATURA, p => ({ ...p, objetos: [...p.objetos, original] }));
    expect(meta('texto-em-curvas', 'nome-em-curvas').feita(c)).toBe(false);
  });

  it('a curva em outra cor, ou fora do lugar, não é o nome convertido', () => {
    const outraCor = mexer(fim, ASSINATURA, ['nome'], o => ({ ...(o as Caminho), preenchimento: '#C13516' }));
    expect(meta('texto-em-curvas', 'nome-em-curvas').feita(outraCor)).toBe(false);
    const foraDoLugar = mexer(fim, ASSINATURA, ['nome'], o => moverObjeto(o, 120, 0));
    expect(meta('texto-em-curvas', 'nome-em-curvas').feita(foraDoLugar)).toBe(false);
  });

  it('o porquê sem falar da fonte não fecha', () => {
    const c = { ...fim, caderno: { ...fim.caderno, porQueConverter: 'Converti porque o professor pediu e porque fica mais bonito assim no arquivo final do clube.' } };
    expect(meta('texto-em-curvas', 'porque-converter').feita(c)).toBe(false);
  });

  it('o texto da cópia continua sendo texto', () => {
    const copia = fim.arte.pranchas.find(p => p.id !== ASSINATURA && p.id.startsWith(ASSINATURA))!;
    expect(textos(copia)).toHaveLength(1);
  });
});

describe('módulo 7 — logotipo', () => {
  const fim = estadoDepois('logotipo');
  const desenho = (c: ContextoVetorial) => umaPrancha(c.arte, LOGOTIPO)!.objetos.filter(o => o.tipo !== 'referencia').map(o => o.id);

  it('esticado 10% na largura não mantém a proporção', () => {
    const c = mexer(fim, LOGOTIPO, desenho(fim), o => ({ ...(o as Caminho), contornos: escalar((o as Caminho).contornos, { x: 220, y: 200 }, 1.1, 1) }));
    expect(meta('logotipo', 'mesma-proporcao').feita(c)).toBe(false);
  });

  /* A conta da forma tolera o erro de quem desenha a olho — dois ou três
     pixels em cada peça —, e por isso deixa passar um esticão pequeno. É a
     conta da proporção que o pega. */
  it('esticado 3% ainda se parece, mas a proporção denuncia', () => {
    const c = mexer(fim, LOGOTIPO, desenho(fim), o => ({ ...(o as Caminho), contornos: escalar((o as Caminho).contornos, { x: 220, y: 200 }, 1.03, 1) }));
    expect(meta('logotipo', 'reproduziu-o-logotipo').feita(c)).toBe(true);
    expect(meta('logotipo', 'mesma-proporcao').feita(c)).toBe(false);
  });

  it('o disco cheio no lugar do anel não é o logotipo', () => {
    const c = naPrancha(LICOES_DA_CC_DG002.logotipo.contexto, LOGOTIPO, p => ({
      ...p, objetos: [...p.objetos,
        { id: 'disco', nome: 'Disco', tipo: 'elipse', x: 20, y: 20, largura: 160, altura: 160, preenchimento: '#1B4D3E' },
        { id: 'chao', nome: 'Chão', tipo: 'retangulo', x: 10, y: 165, largura: 180, altura: 18, preenchimento: '#1B4D3E' }],
    }));
    expect(meta('logotipo', 'reproduziu-o-logotipo').feita(c)).toBe(false);
  });

  it('a referência sozinha não conta como reprodução', () => {
    expect(LOGOTIPO_PEDIDO.length).toBeGreaterThan(0);
    expect(meta('logotipo', 'reproduziu-o-logotipo').feita(LICOES_DA_CC_DG002.logotipo.contexto)).toBe(false);
  });
});

describe('módulo 8 — ícone', () => {
  const fim = estadoDepois('icone');

  it('traço fino some no de 16', () => {
    const c = mexer(fim, ICONE, ['caminho-1'], o => ({ ...(o as Caminho), traco: { cor: '#000000', espessura: 4, extremidade: 'reta' } }));
    expect(detalhesQueSomem(umaPrancha(c.arte, ICONE)!)).toEqual(['caminho-1']);
    expect(meta('icone', 'legivel-em-16').feita(c)).toBe(false);
  });

  it('forma mais baixa que um pixel some no de 16', () => {
    const c = mexer(fim, ICONE, ['forma-2'], o => redimensionar(o, undefined, UM_PIXEL_EM_16 - 1));
    expect(meta('icone', 'legivel-em-16').feita(c)).toBe(false);
  });

  it('a forma que sai da prancha não conta como ícone', () => {
    const c = mexer(fim, ICONE, ['forma-1'], o => moverObjeto(o, 100, 0));
    expect(meta('icone', 'desenhou-o-icone').feita(c)).toBe(false);
  });

  it('dois objetos não são um ícone', () => {
    const c = naPrancha(fim, ICONE, p => ({ ...p, objetos: p.objetos.slice(0, 2) }));
    expect(meta('icone', 'desenhou-o-icone').feita(c)).toBe(false);
  });

  it('ver os tamanhos de outra prancha não vale', () => {
    expect(meta('icone', 'viu-em-tres-tamanhos').feita({ ...fim, descobertas: [chaveDosTamanhos(LOGOTIPO)] })).toBe(false);
  });
});

describe('módulo 9 — o SVG', () => {
  const inicio = LICOES_DA_CC_DG002.svg.contexto;
  const fim = estadoDepois('svg');
  const svg = fim.arquivos.find(a => a.tipo === 'svg')!;

  it('só o SVG, sem o PNG, não fecha', () => {
    expect(meta('svg', 'exportou-svg-e-png').feita({ ...fim, arquivos: [svg] })).toBe(false);
  });

  it('mudar um espaço no arquivo não é mudar uma coordenada', () => {
    const comEspaco = { ...svg, conteudo: svg.exportado.replace('<svg ', '<svg  ') };
    expect(meta('svg', 'mexeu-numa-coordenada').feita({ ...fim, arquivos: [comEspaco] })).toBe(false);
  });

  it('salvar o arquivo quebrado não conta', () => {
    const quebrado = { ...svg, conteudo: svg.exportado.replace('</svg>', '') };
    expect(meta('svg', 'mexeu-numa-coordenada').feita({ ...fim, arquivos: [quebrado] })).toBe(false);
  });

  it('mexer e não reabrir: o desenho não mudou', () => {
    const naoReabriu: ContextoVetorial = { ...fim, arte: inicio.arte, descobertas: [] };
    expect(meta('svg', 'mexeu-numa-coordenada').feita(naoReabriu)).toBe(true);
    expect(meta('svg', 'reabriu-e-viu').feita(naoReabriu)).toBe(false);
  });

  it('reabrir e depois mexer no desenho de novo desfaz a prova', () => {
    const c = mexer(fim, ICONE, ['forma-1'], o => moverObjeto(o, 4, 0));
    expect(meta('svg', 'reabriu-e-viu').feita(c)).toBe(false);
  });

  it('a chave do reabrir é do arquivo mexido, e não de outro', () => {
    expect(fim.descobertas).toEqual([chaveDoReabrir(svg.nome, ICONE)]);
    expect(meta('svg', 'reabriu-e-viu').feita({ ...fim, descobertas: [chaveDoReabrir('outro.svg', ICONE)] })).toBe(false);
  });

  it('o arquivo mexido muda um número só', () => {
    const linhas = (s: string) => s.split('\n');
    const diferentes = linhas(svg.conteudo).filter((l, i) => l !== linhas(svg.exportado)[i]);
    expect(diferentes).toHaveLength(1);
    expect(svgDaPrancha(umaPrancha(fim.arte, ICONE)!)).toBe(svg.conteudo);
  });
});

describe('o arquivo é um só', () => {
  it('as lições não somem com pranchas', () => {
    const ids = (a: Arte) => a.pranchas.map(p => p.id);
    for (const l of LICOES) {
      for (const id of [ICONES, CURVAS, PLACA, TRES_ICONES, ASSINATURA, LOGOTIPO, ICONE]) {
        expect(ids(estadoDepois(l).arte)).toContain(id);
      }
    }
  });

  it('a zoom do módulo 1 é a do emblema', () => {
    expect(chaveDoZoom('emblema')).toBe('zoom:8:emblema');
    expect(contornoDoRetangulo(0, 0, 1, 1).nos).toHaveLength(4);
  });
});
