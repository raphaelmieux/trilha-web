import { describe, expect, it } from 'vitest';
import {
  CREDITO_DA_FOGUEIRA, IMAGENS_DO_PROJETO, MAPA_DA_ENTREGA, NOMES_DOS_FINAIS, PASTA_DO_PROJETO, RESPONDENTES,
  arteComPost, arteComSimbolo, arteDePartida, conviteArrumado, conviteComoChegou, imagemDoProjeto,
  pastaComoChegou, postAdaptado, postEncolhido, simboloDeReferencia,
} from './acampamentoDasFamilias';
import {
  CORPO_MINIMO_NO_CELULAR, PALAVRAS_DO_POST, PECAS_DO_PROJETO, PRANCHA_DO_SIMBOLO, conviteImprimivel, creditaA,
  detalhesQueSomemEm, essenciaisQueFaltam, finaisNoPadrao, imagensNa, letraDoCelular, levaOSimbolo, palavrasDoPost,
  pecasNosDois, postSeLe, proporcaoDoMeio, simboloDa, soltosNaRaiz, textoDoConvite, textoDoPost, versoesDoArquivo,
} from './projetoDeDesign';
import { arquivoDe, mover, type Nuvem } from './arquivoCompartilhado';
import { umaPrancha } from './design';

/*
  As premissas do projeto da CC-DG006: cada peça chega com o defeito que a
  lição dela manda consertar, e a referência de cada lição conserta.

  Uma premissa que se perdesse apagaria a lição daquele módulo sem reprovar
  nada — o post que chegasse já na proporção do feed faria a tarefa da
  proporção abrir verde, e a trava de "nenhuma meta abre verde" pegaria; mas
  o post de referência que já trouxesse a hora apagaria o retorno do público,
  e isso nenhuma meta pegaria. É a decisão de `projetoDaFeira.test.ts`.
*/

describe('o símbolo', () => {
  it('o de referência é só vetor e nada dele some com 32 pixels', () => {
    const s = simboloDeReferencia();
    expect(detalhesQueSomemEm(s)).toEqual([]);
  });

  it('a primeira ideia some inteira com 32 pixels, que é por que ela foi descartada', () => {
    const tentativa = umaPrancha(arteDePartida(), 'simbolo-tentativa')!.objetos[0];
    expect(tentativa.tipo).toBe('grupo');
    if (tentativa.tipo === 'grupo') expect(detalhesQueSomemEm(tentativa).length).toBe(4);
  });

  it('a prancha do símbolo chega com o clipart, e sem símbolo nenhum', () => {
    const p = umaPrancha(arteDePartida(), PRANCHA_DO_SIMBOLO);
    expect(imagensNa(p).length).toBe(1);
    expect(simboloDa(p)).toBeNull();
    expect(simboloDa(umaPrancha(arteComSimbolo(), PRANCHA_DO_SIMBOLO))).not.toBeNull();
  });
});

describe('o post', () => {
  it('chega encolhido: proporção da folha, letra de convite, texto demais e o clipart', () => {
    const p = postEncolhido();
    expect(proporcaoDoMeio(p)).toBe(false);
    expect(letraDoCelular(p)).toBe(false);
    expect(Math.min(...p.objetos.filter(o => o.tipo === 'texto').map(o => (o.tipo === 'texto' ? o.corpo : 0)))).toBeLessThan(CORPO_MINIMO_NO_CELULAR / 2);
    expect(palavrasDoPost(p)).toBeGreaterThan(PALAVRAS_DO_POST * 2);
    expect(imagensNa(p).some(o => o.nome.includes('clipart'))).toBe(true);
  });

  it('o adaptado se lê e leva o símbolo, por qualquer cópia escalada', () => {
    const p = postAdaptado();
    expect(postSeLe(p)).toBe(true);
    const simbolo = simboloDa(umaPrancha(arteComSimbolo(), PRANCHA_DO_SIMBOLO));
    expect(levaOSimbolo(p, simbolo)).toBe(true);
    expect(levaOSimbolo(postEncolhido(), simbolo)).toBe(false);
  });

  it('o adaptado perdeu a hora e não fala das crianças: é o que o público vai apontar', () => {
    const mudar = RESPONDENTES.filter(r => r.leitura === 'mudar');
    expect(mudar.length).toBe(2);
    for (const r of mudar) {
      expect(r.doPublico).toBe(true);
      expect(r.atendido!(postAdaptado()), r.id).toBe(false);
    }
    /* O encolhido tinha a hora e as crianças: elas se perderam no corte. */
    for (const r of mudar) expect(r.atendido!(postEncolhido()), r.id).toBe(true);
  });

  it('o arquivo depois do post guarda a versão encolhida', () => {
    expect(versoesDoArquivo(arteComPost()).map(p => p.id).sort()).toEqual(['post-encolhido', 'simbolo-tentativa']);
  });
});

describe('o convite', () => {
  it('chega com a foto crua parando na borda, sem dizer onde, sem crédito, com o clipart', () => {
    const c = conviteComoChegou();
    expect(conviteImprimivel(c)).toBe(false);
    expect(essenciaisQueFaltam(textoDoConvite(c)).map(e => e.id)).toEqual(['onde']);
    expect(creditaA(textoDoConvite(c), imagemDoProjeto('fogueira'))).toBe(false);
    expect(c.imagens.some(q => q.imagem === 'clipart')).toBe(true);
  });

  it('o arrumado vai para a gráfica, diz tudo e credita a fogueira', () => {
    const c = conviteArrumado();
    expect(conviteImprimivel(c)).toBe(true);
    expect(essenciaisQueFaltam(textoDoConvite(c))).toEqual([]);
    expect(creditaA(CREDITO_DA_FOGUEIRA, imagemDoProjeto('fogueira'))).toBe(true);
    expect(c.imagens.some(q => q.imagem === 'clipart' || q.imagem === 'acampamento')).toBe(false);
  });

  it('o post adaptado diz o essencial do convite', () => {
    expect(essenciaisQueFaltam(textoDoPost(postAdaptado()))).toEqual([]);
  });
});

describe('as imagens e o retorno', () => {
  it('as três imagens são de três licenças, e a livre tem autor', () => {
    expect(IMAGENS_DO_PROJETO.map(i => i.licenca).sort()).toEqual(['livre', 'propria', 'protegida']);
    expect(imagemDoProjeto('fogueira').autor).not.toBe('');
  });

  it('cinco do público e dois de fora', () => {
    expect(RESPONDENTES.filter(r => r.doPublico).length).toBe(5);
    expect(RESPONDENTES.filter(r => !r.doPublico).length).toBe(2);
  });
});

describe('a pasta da entrega', () => {
  it('chega tudo solto, sem pasta de editáveis nem de finais', () => {
    const n = pastaComoChegou();
    expect(pecasNosDois(n, PASTA_DO_PROJETO, MAPA_DA_ENTREGA)).toEqual([]);
    expect(soltosNaRaiz(n, PASTA_DO_PROJETO).length).toBe(Object.keys(MAPA_DA_ENTREGA).length);
  });

  it('separada e renomeada, ela fecha as quatro peças no padrão', () => {
    let n: Nuvem = pastaComoChegou();
    n = { arquivos: [...n.arquivos,
      arquivoDe('ed', 'Editáveis', 'pasta', 'voce', { pasta: PASTA_DO_PROJETO }),
      arquivoDe('fi', 'Finais', 'pasta', 'voce', { pasta: PASTA_DO_PROJETO }),
    ] };
    for (const [id, x] of Object.entries(MAPA_DA_ENTREGA)) {
      if (x.papel === 'editavel') n = mover(n, id, 'ed');
      if (x.papel === 'final') n = mover(n, id, 'fi');
    }
    expect(pecasNosDois(n, PASTA_DO_PROJETO, MAPA_DA_ENTREGA)).toEqual(PECAS_DO_PROJETO.map(p => p.id));
    expect(finaisNoPadrao(n, PASTA_DO_PROJETO, MAPA_DA_ENTREGA)).toBe(false);
    n = { arquivos: n.arquivos.map(a => (NOMES_DOS_FINAIS[a.id] ? { ...a, nome: NOMES_DOS_FINAIS[a.id] } : a)) };
    expect(finaisNoPadrao(n, PASTA_DO_PROJETO, MAPA_DA_ENTREGA)).toBe(true);
  });
});
