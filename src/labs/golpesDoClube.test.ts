import { describe, it, expect } from 'vitest';
import {
  type Indicio,
  INDICIOS, CAIXA_DO_CLUBE, analiseCerta, apontar, denunciar,
  golpesDaCaixa, verdadeirasDaCaixa,
} from './golpesDoClube';

/*
  As mensagens do requisito 5.

  ── O que esta trava existe para pegar ───────────────────────────────────
  Uma caixa de entrada de mentira é fácil de escrever errado de três jeitos, e
  nenhum deles estoura: as três fraudulentas com o mesmo conjunto de indícios
  (e aí marcar tudo em todas passa), nenhuma mensagem verdadeira (e aí
  "denuncie tudo" é a resposta certa), e indícios que não aparecem na tela (e
  aí o requisito manda apontar o que não está à vista).
*/

const TODOS = Object.keys(INDICIOS) as Indicio[];
const acha = (id: string) => CAIXA_DO_CLUBE.find(m => m.id === id)!;

/* ── A caixa tem o que o requisito pede ────────────────────────────────────── */

describe('a caixa traz três golpes e mensagem verdadeira junto', () => {
  it('três fraudulentas, que é o número do requisito 5', () => {
    expect(golpesDaCaixa()).toHaveLength(3);
  });

  it('e duas verdadeiras, sem as quais "denuncie tudo" seria a resposta', () => {
    /*
      É a família do Aceitar Todas que não fecha a tarefa. E o que a lição
      ensinaria sem elas é desconfiar de toda mensagem — que é inútil, porque
      ninguém vive assim e todo mundo volta a clicar em tudo na semana seguinte.
    */
    expect(verdadeirasDaCaixa()).toHaveLength(2);
  });

  it('e nenhum conjunto de indícios se repete entre os três golpes', () => {
    /* Com dois conjuntos iguais, marcar os mesmos botões nas duas mensagens
       passa, e a lição mede ter clicado. */
    const conjuntos = golpesDaCaixa().map(m => [...m.indicios].sort().join('+'));
    expect(new Set(conjuntos).size).toBe(conjuntos.length);
  });

  it('e nenhum golpe tem todos os indícios, que tornaria "marque tudo" certo nele', () => {
    for (const m of golpesDaCaixa()) {
      expect(m.indicios.length, m.assunto).toBeLessThan(TODOS.length);
    }
  });
});

/* ── Cada indício aparece na mensagem ──────────────────────────────────────── */

describe('o que denuncia cada mensagem está na tela dela', () => {
  /*
    Nenhum indício desta lista se conhece de fora da mensagem — senão o
    requisito 5 pediria para apontar o que não está à vista. É a mesma premissa
    que fez `correio.test.tsx` cobrar que o remetente mostre o endereço inteiro.
  */

  it('o domínio: o endereço de quem mandou não é o da empresa que ela diz ser', () => {
    for (const m of golpesDaCaixa().filter(x => x.indicios.includes('dominio'))) {
      expect(m.de, m.assunto).toContain('@');
      const dominio = m.de.split('@')[1];
      /* O nome de exibição não aparece no domínio: é o que faz o indício ser
         um indício. */
      const primeira = m.deNome.toLowerCase().split(' ')[0];
      expect(dominio.toLowerCase(), `${m.assunto}: o domínio confirma o nome`)
        .not.toBe(`${primeira}.com.br`);
    }
  });

  it('o link disfarçado: o texto diz um endereço e o destino é outro', () => {
    const m = acha('banco');
    const l = m.links![0];
    expect(l.para).not.toContain(l.texto);
  });

  it('e a mensagem verdadeira que tem link tem o texto batendo com o destino', () => {
    /* Sem ela, "link é indício" seria a regra que alguém aprenderia aqui — e
       quase toda mensagem verdadeira do mundo tem link. */
    const m = acha('provedor');
    const l = m.links![0];
    expect(l.para).toContain(l.texto);
    expect(m.indicios).toEqual([]);
  });

  it('o anexo inesperado: ele existe, e tem duas extensões no nome', () => {
    const m = acha('boleto');
    expect(m.anexos).toBeTruthy();
    expect(m.anexos![0]).toMatch(/\.\w+\.\w+$/);
  });

  it('a saudação genérica: a mensagem não sabe o nome de quem lê', () => {
    expect(acha('banco').corpo.toLowerCase()).toContain('prezado cliente');
  });

  it('pede senha: está escrito, com todas as letras', () => {
    expect(acha('associacao').corpo.toLowerCase()).toContain('senha');
  });

  it('o erro de escrita: falta acento em palavra que leva', () => {
    const m = acha('boleto');
    expect(m.corpo).toContain('duvida');
    expect(m.corpo).toContain('disposicao');
  });

  it('e a mensagem verdadeira da Marta tem prazo, e não é golpe', () => {
    /*
      Prazo não é o indício: o indício é a **ameaça** junto do prazo. Quem
      marcar urgência aqui aprendeu a regra errada, e é para isso que ela está
      na caixa.
    */
    const m = acha('marta');
    expect(m.corpo).toContain('antes de sexta');
    expect(m.indicios).toEqual([]);
  });
});

/* ── A explicação de cada indício não entrega o gabarito ───────────────────── */

describe('o painel de indícios diz o que procurar, e não onde está', () => {
  it('os sete têm nome e explicação', () => {
    for (const i of TODOS) {
      expect(INDICIOS[i].nome.length, i).toBeGreaterThan(5);
      expect(INDICIOS[i].explica.length, i).toBeGreaterThan(40);
    }
  });

  it('e nenhuma explicação nomeia um remetente da caixa', () => {
    /* "O Banco do Brasil não manda de bb-atendimento" poria o gabarito no
       painel, e a análise passaria a ser leitura de legenda. */
    const nomes = CAIXA_DO_CLUBE.flatMap(m => [m.deNome, m.de.split('@')[1]]);
    for (const i of TODOS) {
      for (const n of nomes) {
        expect(INDICIOS[i].explica, `${i} cita "${n}"`).not.toContain(n);
      }
    }
  });
});

/* ── A análise ─────────────────────────────────────────────────────────────── */

describe('a análise exige o conjunto certo, e não um conjunto que contenha', () => {
  const certa = (id: string) => ({
    id, apontados: acha(id).indicios, denunciada: acha(id).indicios.length > 0,
  });

  it('apontar exatamente os indícios da mensagem, e denunciá-la, acerta', () => {
    for (const m of golpesDaCaixa()) {
      expect(analiseCerta(m, certa(m.id)), m.assunto).toBe(true);
    }
  });

  it('marcar todos os sete em todas reprova em todas', () => {
    /*
      A decisão inteira desta lição. Exigir só que os verdadeiros estivessem
      marcados deixaria "marque tudo" passar com louvor, e o que se mediria
      seria ter clicado em todos os botões.
    */
    for (const m of CAIXA_DO_CLUBE) {
      const tudo = { id: m.id, apontados: TODOS, denunciada: true };
      expect(analiseCerta(m, tudo), m.assunto).toBe(false);
    }
  });

  it('e faltar um indício também reprova', () => {
    const m = acha('banco');
    const falta = { id: m.id, apontados: m.indicios.slice(1), denunciada: true };
    expect(analiseCerta(m, falta)).toBe(false);
  });

  it('a mensagem verdadeira acerta com zero indícios e sem denúncia', () => {
    for (const m of verdadeirasDaCaixa()) {
      expect(analiseCerta(m, { id: m.id, apontados: [], denunciada: false }), m.assunto).toBe(true);
    }
  });

  it('e denunciar a verdadeira reprova, mesmo sem apontar indício nenhum', () => {
    /* Errar do jeito que mais custa na vida: desconfiar de quem não deu
       motivo. A Marta manda a escala e ninguém lê. */
    const m = acha('marta');
    expect(analiseCerta(m, { id: m.id, apontados: [], denunciada: true })).toBe(false);
  });

  it('e não denunciar um golpe reprova, por mais certos que sejam os indícios', () => {
    const m = acha('banco');
    expect(analiseCerta(m, { id: m.id, apontados: m.indicios, denunciada: false })).toBe(false);
  });

  it('mensagem que ninguém analisou não conta como certa', () => {
    /* A guarda contra o vazio: sem ela, uma caixa que ninguém abriu teria
       cinco análises certas. */
    expect(analiseCerta(acha('marta'), undefined)).toBe(false);
  });
});

/* ── As operações ──────────────────────────────────────────────────────────── */

describe('apontar e denunciar', () => {
  it('apontar duas vezes o mesmo indício o desmarca', () => {
    /* Sem isso, um clique errado não teria volta, e a única saída seria
       Recomeçar — que joga fora as outras quatro mensagens já analisadas. */
    let a = apontar([], 'banco', 'dominio');
    expect(a[0].apontados).toEqual(['dominio']);
    a = apontar(a, 'banco', 'dominio');
    expect(a[0].apontados).toEqual([]);
  });

  it('e apontar numa mensagem não mexe na análise da outra', () => {
    let a = apontar([], 'banco', 'dominio');
    a = apontar(a, 'boleto', 'anexo-inesperado');
    expect(a.find(x => x.id === 'banco')!.apontados).toEqual(['dominio']);
    expect(a.find(x => x.id === 'boleto')!.apontados).toEqual(['anexo-inesperado']);
  });

  it('denunciar preserva os indícios já apontados', () => {
    /* Elas são duas leituras da mesma mensagem, e uma não desfaz a outra. */
    let a = apontar([], 'banco', 'dominio');
    a = denunciar(a, 'banco', true);
    expect(a[0].apontados).toEqual(['dominio']);
    expect(a[0].denunciada).toBe(true);
  });
});
