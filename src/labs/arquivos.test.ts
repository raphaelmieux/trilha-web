import { describe, it, expect } from 'vitest';
import {
  AREA, DOCUMENTOS, LIXEIRA, type No,
  filhosDe, caminhoDe, ehDescendente, podeSoltarEm, nomeDisponivel,
  ordenar, copiarPara, moverPara, mandarParaLixeira, restaurar, esvaziarLixeira,
  criarGerador, formatarTamanho, rotuloDoTipo,
} from './arquivos';

const T = 1_700_000_000_000;   // um instante fixo, para as datas não dependerem do relógio

/*
  Com hierarquia aparecem regras que a versão plana nunca precisou ter: copiar
  uma pasta leva o conteúdo junto, mover uma pasta para dentro de si mesma se
  recusa, e dois irmãos não podem repetir o nome.
*/
const arvore = (): No[] => [
  { id: AREA, nome: 'Área de Trabalho', tipo: 'pasta', paiId: null, tamanhoKb: 0, modificadoEm: T },
  { id: DOCUMENTOS, nome: 'Documentos', tipo: 'pasta', paiId: null, tamanhoKb: 0, modificadoEm: T },
  { id: LIXEIRA, nome: 'Lixeira', tipo: 'pasta', paiId: null, tamanhoKb: 0, modificadoEm: T },

  { id: 'p1', nome: 'Acampamento', tipo: 'pasta', paiId: AREA, tamanhoKb: 0, modificadoEm: T - 2e8 },
  { id: 'f1', nome: 'foto.jpg', tipo: 'arquivo', paiId: 'p1', tamanhoKb: 2400, modificadoEm: T - 1e8 },
  { id: 'p2', nome: 'Fotos', tipo: 'pasta', paiId: 'p1', tamanhoKb: 0, modificadoEm: T - 3e8 },
  { id: 'f2', nome: 'lista.txt', tipo: 'arquivo', paiId: 'p2', tamanhoKb: 3, modificadoEm: T - 5e8 },
  { id: 'f3', nome: 'cantina.pdf', tipo: 'arquivo', paiId: DOCUMENTOS, tamanhoKb: 850, modificadoEm: T },
];

const nomes = (l: No[]) => l.map(n => n.nome);

describe('andar pela árvore', () => {
  it('lista só os filhos diretos', () => {
    expect(nomes(filhosDe(arvore(), 'p1')).sort()).toEqual(['Fotos', 'foto.jpg']);
  });

  it('monta o caminho da raiz até o item', () => {
    expect(nomes(caminhoDe(arvore(), 'f2'))).toEqual(['Área de Trabalho', 'Acampamento', 'Fotos', 'lista.txt']);
  });

  it('reconhece descendente em qualquer profundidade', () => {
    expect(ehDescendente(arvore(), 'f2', AREA)).toBe(true);
    expect(ehDescendente(arvore(), 'f3', AREA)).toBe(false);
  });
});

describe('onde se pode soltar', () => {
  it('aceita pasta que não é a origem', () => {
    expect(podeSoltarEm(arvore(), 'f3', 'p1')).toBe(true);
  });

  /* A recusa que protege a árvore: sem ela, a pasta e tudo dentro dela sairiam
     do alcance da raiz e sumiriam da tela sem terem sido excluídas. */
  it('recusa mover uma pasta para dentro dela mesma', () => {
    expect(podeSoltarEm(arvore(), 'p1', 'p2')).toBe(false);
    expect(podeSoltarEm(arvore(), 'p1', 'p1')).toBe(false);
  });

  it('recusa soltar onde o item já está', () => {
    expect(podeSoltarEm(arvore(), 'f1', 'p1')).toBe(false);
  });

  it('recusa soltar dentro de um arquivo', () => {
    expect(podeSoltarEm(arvore(), 'p1', 'f3')).toBe(false);
  });
});

describe('nomes repetidos', () => {
  it('devolve o nome pedido quando está livre', () => {
    expect(nomeDisponivel(arvore(), AREA, 'Nova pasta')).toBe('Nova pasta');
  });

  it('numera o repetido, como o Windows', () => {
    expect(nomeDisponivel(arvore(), 'p1', 'Fotos')).toBe('Fotos (2)');
  });

  it('numera antes da extensão, não depois', () => {
    expect(nomeDisponivel(arvore(), 'p1', 'foto.jpg')).toBe('foto (2).jpg');
  });

  it('ignora o próprio item ao renomear', () => {
    expect(nomeDisponivel(arvore(), 'p1', 'Fotos', 'p2')).toBe('Fotos');
  });
});

describe('ordenação', () => {
  const daArea = () => filhosDe([...arvore(), { id: 'x', nome: 'zzz.txt', tipo: 'arquivo' as const, paiId: AREA, tamanhoKb: 9, modificadoEm: T }], AREA);

  /* Pastas em cima sempre — inclusive na ordem decrescente. Inverter tudo as
     jogaria para o fim, e entrar numa pasta viraria uma rolagem. */
  it('mantém as pastas no topo nos dois sentidos', () => {
    for (const crescente of [true, false]) {
      const r = ordenar(daArea(), 'nome', crescente);
      expect(r[0].tipo, `crescente=${crescente}`).toBe('pasta');
    }
  });

  it('ordena por nome', () => {
    const r = ordenar(filhosDe(arvore(), 'p1'), 'nome', true);
    expect(nomes(r)).toEqual(['Fotos', 'foto.jpg']);
  });

  it('ordena por tamanho, e inverte', () => {
    const itens = filhosDe(arvore(), 'p1').filter(n => n.tipo === 'arquivo');
    const mais = [...itens, { id: 'y', nome: 'a.txt', tipo: 'arquivo' as const, paiId: 'p1', tamanhoKb: 1, modificadoEm: T }];
    expect(ordenar(mais, 'tamanho', true)[0].nome).toBe('a.txt');
    expect(ordenar(mais, 'tamanho', false)[0].nome).toBe('foto.jpg');
  });

  it('ordena por data de modificação', () => {
    const r = ordenar(filhosDe(arvore(), 'p1'), 'modificado', true);
    expect(r[r.length - 1].nome).toBe('foto.jpg');
  });

  it('não altera a lista recebida', () => {
    const itens = filhosDe(arvore(), 'p1');
    const antes = nomes(itens);
    ordenar(itens, 'tamanho', false);
    expect(nomes(itens)).toEqual(antes);
  });
});

describe('copiar', () => {
  /*
    A cópia rasa é o erro clássico: a pasta chega vazia ao destino, e o
    desbravador conclui que copiar perde o conteúdo — o oposto do que o
    requisito 5.2 quer ensinar.
  */
  it('leva junto o que está dentro da pasta', () => {
    const r = copiarPara(arvore(), 'p1', DOCUMENTOS, criarGerador('c'), T);
    const copia = filhosDe(r, DOCUMENTOS).find(n => n.nome === 'Acampamento')!;
    expect(copia).toBeDefined();
    expect(nomes(filhosDe(r, copia.id)).sort()).toEqual(['Fotos', 'foto.jpg']);
    const netos = filhosDe(r, filhosDe(r, copia.id).find(n => n.nome === 'Fotos')!.id);
    expect(nomes(netos)).toEqual(['lista.txt']);
  });

  it('deixa o original onde estava', () => {
    const r = copiarPara(arvore(), 'p1', DOCUMENTOS, criarGerador('c'), T);
    expect(filhosDe(r, AREA).some(n => n.id === 'p1')).toBe(true);
  });

  it('numera ao copiar para o mesmo lugar', () => {
    const r = copiarPara(arvore(), 'p2', 'p1', criarGerador('c'), T);
    expect(nomes(filhosDe(r, 'p1')).sort()).toEqual(['Fotos', 'Fotos (2)', 'foto.jpg']);
  });
});

describe('mover', () => {
  it('tira do lugar antigo e põe no novo', () => {
    const r = moverPara(arvore(), 'f3', 'p1', T);
    expect(filhosDe(r, DOCUMENTOS).some(n => n.id === 'f3')).toBe(false);
    expect(filhosDe(r, 'p1').some(n => n.id === 'f3')).toBe(true);
  });

  it('não faz nada quando o destino é inválido', () => {
    const antes = arvore();
    expect(moverPara(antes, 'p1', 'p2', T)).toEqual(antes);
  });
});

describe('lixeira', () => {
  it('excluir manda para a lixeira, e não apaga', () => {
    const r = mandarParaLixeira(arvore(), 'f3');
    expect(filhosDe(r, LIXEIRA).map(n => n.id)).toEqual(['f3']);
  });

  it('restaurar devolve ao lugar de origem', () => {
    const r = restaurar(mandarParaLixeira(arvore(), 'f3'), 'f3');
    expect(filhosDe(r, DOCUMENTOS).some(n => n.id === 'f3')).toBe(true);
  });

  /* Esvaziar precisa levar o que está dentro de pastas na lixeira; senão
     sobram órfãos invisíveis, que continuam ocupando a árvore. */
  it('esvaziar apaga também o que está dentro de pastas', () => {
    const r = esvaziarLixeira(mandarParaLixeira(arvore(), 'p1'));
    expect(filhosDe(r, LIXEIRA)).toEqual([]);
    for (const id of ['p1', 'f1', 'p2', 'f2']) {
      expect(r.some(n => n.id === id), id).toBe(false);
    }
  });

  it('não deixa excluir uma raiz', () => {
    const antes = arvore();
    expect(mandarParaLixeira(antes, AREA)).toEqual(antes);
  });
});

describe('como aparece na tela', () => {
  it('mostra o tamanho em KB e em MB', () => {
    expect(formatarTamanho({ ...arvore()[4], tamanhoKb: 3 })).toBe('3 KB');
    expect(formatarTamanho({ ...arvore()[4], tamanhoKb: 2400 })).toBe('2,3 MB');
  });

  it('não mostra tamanho de pasta, como o Explorer', () => {
    expect(formatarTamanho(arvore()[3])).toBe('');
  });

  it('nomeia o tipo pela extensão', () => {
    expect(rotuloDoTipo(arvore()[4])).toBe('Imagem JPEG');
    expect(rotuloDoTipo(arvore()[3])).toBe('Pasta de arquivos');
  });
});
