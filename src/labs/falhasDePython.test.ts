import { describe, it, expect } from 'vitest';
import {
  CATEGORIAS, ORDEM_DAS_CATEGORIAS, classificacaoInicial, conferirClassificacao,
  resumoDaClassificacao, type FalhaPlantada,
} from './falhasDePython';

/*
  O que se cobra aqui é que a classificação não seja um jogo de três botões.

  Quem chuta até acertar tem a tarefa verde sem ter entendido nada, e a tarefa
  passa a medir paciência. As duas travas contra isso são o painel abrir vazio e
  o recado do erro não dizer a resposta — as duas se conferem abaixo.
*/

const FALHAS: FalhaPlantada[] = [
  { id: 'a', sintoma: 'O Python aponta a linha 3 e nada roda.', categoria: 'sintaxe' },
  { id: 'b', sintoma: 'O programa escreve o cabeçalho e para no meio.', categoria: 'execucao' },
  { id: 'c', sintoma: 'O programa vai até o fim, e a média sai sempre zero.', categoria: 'logica' },
];

describe('o painel abre com tudo por responder', () => {
  it('nenhuma falha vem marcada', () => {
    const inicial = classificacaoInicial(FALHAS);
    expect(Object.values(inicial)).toEqual([null, null, null]);
  });

  it('e por isso a tarefa abre vermelha', () => {
    expect(resumoDaClassificacao(FALHAS, classificacaoInicial(FALHAS)).completa).toBe(false);
  });
});

describe('a conferência', () => {
  it('aceita quando cada falha está na família dela', () => {
    const r = resumoDaClassificacao(FALHAS, { a: 'sintaxe', b: 'execucao', c: 'logica' });
    expect(r.completa).toBe(true);
    expect(r.detalhe).toBeUndefined();
  });

  it('diz quantas faltam enquanto há falha sem resposta', () => {
    const r = resumoDaClassificacao(FALHAS, { a: 'sintaxe', b: null, c: null });
    expect(r.completa).toBe(false);
    expect(r.detalhe).toContain('2 de 3');
  });

  it('conta as erradas sem nomear nenhuma', () => {
    const r = resumoDaClassificacao(FALHAS, { a: 'logica', b: 'logica', c: 'logica' });
    expect(r.completa).toBe(false);
    expect(r.detalhe).toContain('2 ');
    /* O sintoma está no painel. Repeti-lo aqui faria a lista de tarefas e o
       painel dizerem metade cada um. */
    for (const f of FALHAS) expect(r.detalhe).not.toContain(f.sintoma);
  });
});

/*
  O recado do erro é o que separa "entender" de "tentar as três".

  Ele descreve o que a pessoa **teria visto** se a família marcada fosse a
  certa, e manda comparar com o que aconteceu de verdade. Quem lê isso e olha a
  tela chega sozinho à resposta; quem só quer o verde não ganha nada.
*/
describe('o recado de quem errou', () => {
  it('só aparece para quem marcou, e só quando erra', () => {
    const [a, b] = conferirClassificacao(FALHAS.slice(0, 2), { a: null, b: 'execucao' });
    expect(a.recado).toBeUndefined();
    expect(b.certa).toBe(true);
    expect(b.recado).toBeUndefined();
  });

  it('fala da família marcada, e não da certa', () => {
    const [c] = conferirClassificacao([FALHAS[2]], { c: 'sintaxe' });
    expect(c.certa).toBe(false);
    expect(c.recado).toBe(CATEGORIAS.sintaxe.desmentido);
  });

  it('nenhum desmentido entrega o nome de outra família', () => {
    for (const chave of ORDEM_DAS_CATEGORIAS) {
      const texto = CATEGORIAS[chave].desmentido.toLowerCase();
      const outras = ORDEM_DAS_CATEGORIAS.filter(o => o !== chave);
      for (const outra of outras) {
        expect(texto, `${chave} entrega ${outra}`).not.toContain(CATEGORIAS[outra].nome.toLowerCase());
      }
    }
  });
});

/*
  Zero de zero não é tudo — a armadilha que já apareceu no "sem links
  quebrados" e nas veredas sem lição. Sem falha escrita não há o que
  classificar, e aprovar aí seria dar uma tarefa verde de graça.
*/
describe('lição sem falha nenhuma', () => {
  it('não fica completa por vacuidade, e diz por quê', () => {
    const r = resumoDaClassificacao([], {});
    expect(r.completa).toBe(false);
    expect(r.detalhe).toContain('falha nenhuma');
  });
});

describe('as três famílias', () => {
  it('cada uma diz quando aparece e o que se vê', () => {
    for (const chave of ORDEM_DAS_CATEGORIAS) {
      const c = CATEGORIAS[chave];
      expect(c.nome.length).toBeGreaterThan(0);
      expect(c.quando.length).toBeGreaterThan(0);
      expect(c.comoSeVe.length).toBeGreaterThan(0);
      expect(c.desmentido.length).toBeGreaterThan(0);
    }
  });
});
