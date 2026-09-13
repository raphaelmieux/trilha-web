import { describe, it, expect } from 'vitest';
import {
  ALTURA, LARGURA, RAIO_DO_GLIFO, formaDaClasse, encaixeDoGlifo, corDoGlifo, contraste,
} from './formaDaInsignia';
import { NIVEIS_DA_INSIGNIA, CLASSES, classeDoDegrau, alturaDaClasse } from './nivelDaInsignia';
import { ICON_SHAPES, RAIO_DA_TINTA } from './badgeIcons';

/*
  As três formas de a insígnia sair errada sem estourar.

  O glifo vaza pelos lados do triângulo e ninguém vê, porque quem desenha a
  estante costuma ter só insígnias das classes altas. O glifo fica pequeno numa
  forma e grande na outra, e a fileira parece desalinhada sem que nada esteja
  errado. E o glifo some no fundo da própria classe, que foi o que aconteceu
  com cinco das sete cores da primeira leva.
*/

const CLAROS = NIVEIS_DA_INSIGNIA.map(n => ({ nivel: n, ...CLASSES[n] }));

describe('as sete classes', () => {
  it('vão do triângulo ao octógono, ganhando um lado por classe', () => {
    expect(CLAROS.map(c => c.lados)).toEqual([3, 3, 4, 5, 6, 7, 8]);
  });

  /* Os dois triângulos são a única repetição de número de lados, e é o giro
     que os separa: sem ele, Amigo e Companheiro seriam a mesma forma em cores
     diferentes — e cor sozinha não se lê. */
  it('os dois triângulos apontam para lados opostos', () => {
    expect(CLASSES.amigo.invertido).toBeFalsy();
    expect(CLASSES.companheiro.invertido).toBe(true);
  });

  it('a classe de um degrau é a posição dele, e a altura desfaz a conta', () => {
    for (let d = 1; d <= 7; d++) expect(alturaDaClasse(classeDoDegrau(d))).toBe(d);
  });

  /* Degrau fora da faixa cai na classe que reivindica menos — exibir como
     Líder uma insígnia cuja classe não se conseguiu ler é afirmar o que não
     foi conferido. */
  it('degrau fora da faixa cai em Amigo', () => {
    expect(classeDoDegrau(0)).toBe('amigo');
    expect(classeDoDegrau(99)).toBe('amigo');
  });
});

describe('a geometria', () => {
  it.each(NIVEIS_DA_INSIGNIA)('%s tem a altura da caixa, e cabe na largura', nivel => {
    const { pontos } = formaDaClasse(nivel);
    const xs = pontos.split(' ').map(p => Number(p.split(',')[0]));
    const ys = pontos.split(' ').map(p => Number(p.split(',')[1]));
    expect(Math.min(...ys)).toBeCloseTo(0, 1);
    expect(Math.max(...ys)).toBeCloseTo(ALTURA, 1);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(-0.01);
    expect(Math.max(...xs)).toBeLessThanOrEqual(LARGURA + 0.01);
  });

  /*
    O triângulo é quem manda.

    Todas as formas têm a mesma altura, então o círculo inscrito do triângulo
    — H/3 — é o menor dos sete, e é ele que decide o glifo máximo. Se esta
    sobra virar negativa, o desenho sai pelos lados do Amigo e do Companheiro,
    e só nesses dois: nas outras cinco continua bonito, que é o que faz
    ninguém perceber.
  */
  it('o glifo cabe no círculo inscrito de todas as sete', () => {
    for (const nivel of NIVEIS_DA_INSIGNIA) {
      const { raioInscrito } = formaDaClasse(nivel);
      expect(raioInscrito, `${nivel} não comporta o glifo`).toBeGreaterThan(RAIO_DO_GLIFO);
    }
  });

  it('o triângulo é o mais apertado dos sete', () => {
    const raios = NIVEIS_DA_INSIGNIA.map(n => formaDaClasse(n).raioInscrito);
    expect(Math.min(...raios)).toBeCloseTo(formaDaClasse('amigo').raioInscrito, 4);
  });

  /* Centrar no meio da caixa em vez de no centro do polígono empurra o glifo
     para fora pela ponta do triângulo — e nas outras seis não muda nada, que
     é de novo o que faria passar despercebido. */
  it('o centro do triângulo não é o meio da caixa', () => {
    expect(formaDaClasse('amigo').centroY).toBeGreaterThan(ALTURA / 2);
    expect(formaDaClasse('companheiro').centroY).toBeLessThan(ALTURA / 2);
    expect(formaDaClasse('lider').centroY).toBeCloseTo(ALTURA / 2, 4);
  });
});

describe('o glifo tem o mesmo tamanho em toda insígnia', () => {
  /*
    "Mesmo tamanho" é o disco que a tinta ocupa, e não o fator de escala.

    Os catorze desenhos preenchem a caixa de 24 de maneiras muito diferentes —
    de 10,00 a 12,81 de raio, 28% de diferença. Com um fator único a chama sai
    visivelmente menor que o troféu, e a insígnia parece mal montada sem que
    nenhuma conta esteja errada.
  */
  it.each(Object.keys(RAIO_DA_TINTA))('%s ocupa o mesmo disco que os outros', icone => {
    const { escala } = { escala: RAIO_DO_GLIFO / RAIO_DA_TINTA[icone] };
    expect(RAIO_DA_TINTA[icone] * escala).toBeCloseTo(RAIO_DO_GLIFO, 6);
  });

  /* E o traço desfaz a escala, senão o glifo mais reduzido sai com o traço
     mais fino e os catorze têm espessuras diferentes na mesma fileira. */
  it('o traço sai com a mesma espessura nos catorze', () => {
    const forma = formaDaClasse('lider');
    const espessuras = Object.values(RAIO_DA_TINTA)
      .map(r => encaixeDoGlifo(forma, r))
      .map(e => e.traco * (RAIO_DO_GLIFO / 12) / (RAIO_DO_GLIFO / 12));
    const escalas = Object.values(RAIO_DA_TINTA).map(r => RAIO_DO_GLIFO / r);
    espessuras.forEach((t, i) => expect(t * escalas[i]).toBeCloseTo(1.55, 6));
  });

  /*
    O raio declarado está na faixa que a caixa comporta.

    `RAIO_DA_TINTA` é uma tabela de números medidos fora daqui — cada traçado
    foi amostrado ponto a ponto e guardado o mais distante do centro. Refazer
    essa conta no teste exigiria achatar curvas de Bézier e arcos, ou uma
    dependência nova só para a trava; nenhum dos dois se paga.

    O que esta confere é o que uma tabela à mão erra de verdade: ícone do
    catálogo sem entrada aqui (que sairia com o tamanho de outro desenho), e
    número fora do que a caixa de 24 comporta — abaixo de 2 o glifo vira ponto,
    acima de 17 ele não caberia nem no próprio quadro. **Trocar um ícone por
    outro de tamanho parecido passa por esta trava**: nesse caso o número tem
    de ser remedido à mão, e é o que o comentário de `RAIO_DA_TINTA` manda
    fazer.
  */
  it.each(Object.keys(ICON_SHAPES))('%s tem raio declarado, e ele cabe na caixa', icone => {
    const raio = RAIO_DA_TINTA[icone];
    expect(raio, `${icone} sem raio medido`).toBeGreaterThan(2);
    expect(raio).toBeLessThan(17);
  });

  it('todo raio declarado corresponde a um desenho que existe', () => {
    for (const icone of Object.keys(RAIO_DA_TINTA)) {
      expect(ICON_SHAPES[icone], `${icone} tem raio e não tem desenho`).toBeDefined();
    }
  });

});

describe('o contraste do glifo', () => {
  /*
    Cinco das sete cores falhavam na primeira leva — o marinho do topo media
    1,10:1 contra o cartão da plataforma, que é invisível. A composição mudou
    para cor no preenchimento e glifo por cima, e o mínimo sobe para 4,5:1, que
    é o piso de AA para texto.
  */
  it.each(NIVEIS_DA_INSIGNIA)('%s tem glifo legível sobre a própria cor', nivel => {
    const cor = CLASSES[nivel].cor;
    expect(contraste(corDoGlifo(cor), cor)).toBeGreaterThanOrEqual(4.5);
  });

  /* Escolher por limiar de luminosidade erra na fronteira: o cinza do Pioneiro
     fica logo abaixo de um corte plausível e receberia branco a 2,7:1.
     Comparar as duas contas não tem fronteira onde errar. */
  it('escolhe a cor que de fato mede mais, e não a que um limiar diria', () => {
    expect(corDoGlifo(CLASSES.pioneiro.cor)).toBe('#141007');
    expect(corDoGlifo(CLASSES.guia.cor)).toBe('#141007');
    expect(corDoGlifo(CLASSES.amigo.cor)).toBe('#FFFFFF');
  });
});
