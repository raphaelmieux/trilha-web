import { describe, expect, it } from 'vitest';
import {
  CONVERSA, MENSAGEM_QUE_CHEGA, NOME_DO_COMPARTILHAMENTO, OQUE_A_ESCOLHA_LEVA_JUNTO,
  PLANILHA, VIDEO,
  aSalaOuveOSom, abrirMicrofone, admitir, compartilhar, entrar, falar, focar,
  mostrandoOutraCoisa, naEspera, naSala, naoOuviram, notificacoesQueVazaram,
  oQueASalaVe, pararDeCompartilhar, reuniaoDoConselho,
} from './reuniaoRemota';

const sala = () => entrar(reuniaoDoConselho());

describe('o microfone desligado', () => {
  it('a sala entra com o microfone fechado, como todo programa faz', () => {
    expect(reuniaoDoConselho().seuMicrofone).toBe(false);
  });

  it('falar com o microfone fechado não chega em ninguém', () => {
    /*
      O aviso está na tela o tempo todo e todo mundo fala assim mesmo. Uma
      simulação que impedisse a fala ensinaria que o programa avisa a tempo,
      que é o contrário do que acontece.
    */
    const r = falar(sala(), 'Bom dia a todos, vamos começar pela tesouraria.');
    expect(naoOuviram(r)).toHaveLength(1);
  });

  it('e abrir o microfone depois não faz ninguém ouvir o que já foi dito', () => {
    const r = abrirMicrofone(falar(sala(), 'Bom dia a todos.'), true);
    expect(naoOuviram(r)).toHaveLength(1);
    const depois = falar(r, 'Agora sim.');
    expect(naoOuviram(depois)).toHaveLength(1);
    expect(depois.falas[1].ouviram).toBe(true);
  });
});

describe('a tela inteira e a janela não são a mesma escolha', () => {
  it('cada escolha tem escrito o que ela leva junto', () => {
    /* Sem isso a fileira seria três botões iguais, e a decisão do requisito 6
       viraria "clicar no primeiro". */
    for (const k of ['tela-inteira', 'janela', 'guia'] as const) {
      expect(NOME_DO_COMPARTILHAMENTO[k].length).toBeGreaterThan(5);
      expect(OQUE_A_ESCOLHA_LEVA_JUNTO[k].length).toBeGreaterThan(40);
    }
  });

  it('ninguém compartilhando é ninguém vendo nada', () => {
    expect(oQueASalaVe(sala())).toBeUndefined();
    expect(notificacoesQueVazaram(sala())).toEqual([]);
  });

  it('a tela inteira entrega a notificação que chega por cima', () => {
    /*
      É a metade que não se descobre olhando a própria tela: na sua máquina a
      notificação aparece no canto e some, e você não tem como saber que
      catorze pessoas leram o que a tesouraria acabou de mandar.
    */
    const r = compartilhar(sala(), { oQue: 'tela-inteira', alvo: '', comSom: false });
    expect(notificacoesQueVazaram(r)).toContainEqual(MENSAGEM_QUE_CHEGA);
    expect(oQueASalaVe(r)).toBe(PLANILHA);
  });

  it('e a janela não entrega notificação nenhuma', () => {
    const r = compartilhar(sala(), { oQue: 'janela', alvo: PLANILHA, comSom: false });
    expect(notificacoesQueVazaram(r)).toEqual([]);
  });

  it('a tela inteira acompanha o que você olha; a janela, não', () => {
    const inteira = focar(
      compartilhar(sala(), { oQue: 'tela-inteira', alvo: '', comSom: false }), CONVERSA);
    expect(oQueASalaVe(inteira)).toBe(CONVERSA);
    expect(mostrandoOutraCoisa(inteira)).toBe(false);

    const janela = focar(
      compartilhar(sala(), { oQue: 'janela', alvo: PLANILHA, comSom: false }), CONVERSA);
    expect(oQueASalaVe(janela)).toBe(PLANILHA);
    expect(mostrandoOutraCoisa(janela)).toBe(true);
  });

  it('parar de compartilhar devolve a sala a ninguém vendo nada', () => {
    const r = pararDeCompartilhar(
      compartilhar(sala(), { oQue: 'janela', alvo: PLANILHA, comSom: false }));
    expect(oQueASalaVe(r)).toBeUndefined();
    expect(mostrandoOutraCoisa(r)).toBe(false);
  });
});

describe('o som da guia não vai junto sozinho', () => {
  it('a janela do navegador entrega a imagem e o silêncio', () => {
    const r = compartilhar(sala(), { oQue: 'janela', alvo: VIDEO, comSom: true });
    expect(aSalaOuveOSom(r)).toBe(false);
  });

  it('a guia sem a caixa marcada também', () => {
    const r = compartilhar(sala(), { oQue: 'guia', alvo: VIDEO, comSom: false });
    expect(aSalaOuveOSom(r)).toBe(false);
  });

  it('só a guia com a caixa marcada leva o som', () => {
    const r = compartilhar(sala(), { oQue: 'guia', alvo: VIDEO, comSom: true });
    expect(aSalaOuveOSom(r)).toBe(true);
  });
});

describe('a sala de espera', () => {
  it('quem não tem conta no clube fica do lado de fora', () => {
    expect(naEspera(sala()).map(p => p.nome)).toEqual(['Tia Joana (Tucano)']);
    expect(naSala(sala())).toHaveLength(3);
  });

  it('admitir põe a pessoa na sala', () => {
    const r = admitir(sala(), 'tucano@clubepioneiros.org.br');
    expect(naEspera(r)).toEqual([]);
    expect(naSala(r)).toHaveLength(4);
  });

  it('e admitir não traz para dentro quem nem está esperando', () => {
    /*
      O Tio Márcio foi convidado e não veio. Admitir alcança a sala de espera —
      alcançar quem está fora faria a sala ganhar uma pessoa que não pediu para
      entrar, e a lista de presença da ata sairia com um nome a mais.
    */
    const r = admitir(sala(), 'arara@clubepioneiros.org.br');
    expect(naSala(r)).toHaveLength(3);
    expect(naSala(r).map(p => p.nome)).not.toContain('Tio Márcio (Arara)');

    const jaDentro = admitir(sala(), 'diretor@clubepioneiros.org.br');
    expect(naSala(jaDentro)).toHaveLength(3);
    expect(naEspera(jaDentro)).toHaveLength(1);
  });
});
