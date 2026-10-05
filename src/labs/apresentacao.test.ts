import { describe, it, expect } from 'vitest';
import {
  CORES_DO_MODELO, LIMITE_DO_EXCESSO, PROJECAO,
  aparenciaDoSlide, aplicarLayout, compactarImagem, desalinhoDasCaixas,
  esticamentoDaImagem, imagemInserida, limparFormatacaoDireta,
  maisPalavrasNumSlide, mestreDoModelo, palavrasDoSlide, palavrasQueProjetam,
  pesoEmMegabytes, pixelsQueAProjecaoPede, resolucaoDaImagem, slideNovo,
  slidesComFormatacaoDireta, temFormatacaoDireta, textoDaApresentacao,
  type Apresentacao, type CaixaAMao, type Slide,
} from './apresentacao';

/*
  O modelo de uma apresentação, conferido fora de qualquer tela.

  Quase tudo aqui erra **calado** se escrito ao contrário, e é por isso que são
  funções e não `if` dentro de um `onClick`: formatação direta que perdesse do
  mestre faria o requisito 4.1 parecer cumprido no primeiro clique, nota contada
  no telão faria o orçamento de vinte palavras medir a fala, e imagem que se
  deixasse ampliar na compactação devolveria pixel que não existe.
*/

const umSlideComTexto = (id: string): Slide => ({
  ...slideNovo(id, 'titulo-conteudo'),
  titulo: 'O acampamento de inverno',
  topicos: ['Saco de dormir', 'Lanterna com pilha'],
});

const umaApresentacao = (slides: Slide[]): Apresentacao =>
  ({ modelo: 'branco', mestre: mestreDoModelo('branco'), slides, pdf: null });

const caixa = (id: string, y: number, papel: CaixaAMao['papel'] = 'titulo'): CaixaAMao =>
  ({ id, texto: `texto ${id}`, x: 8, y, largura: 80, tamanho: 40, papel });

describe('o mestre manda, e a formatação direta vence ele', () => {
  it('o mestre carrega as cores do modelo escolhido', () => {
    for (const m of ['branco', 'madison', 'facetas', 'berlim'] as const) {
      const mestre = mestreDoModelo(m);
      expect(mestre.corDoFundo, m).toBe(CORES_DO_MODELO[m].fundo);
      expect(mestre.corDoTitulo, m).toBe(CORES_DO_MODELO[m].titulo);
      expect(mestre.corDoCorpo, m).toBe(CORES_DO_MODELO[m].texto);
      expect(mestre.corDaFaixa, m).toBe(CORES_DO_MODELO[m].faixa);
    }
  });

  it('sem formatação direta, a aparência é a do mestre', () => {
    const mestre = mestreDoModelo('facetas');
    const t = aparenciaDoSlide(mestre, 'titulo');
    expect(t.cor).toBe(mestre.corDoTitulo);
    expect(t.tamanho).toBe(mestre.tamanhoDoTitulo);
    const c = aparenciaDoSlide(mestre, 'corpo');
    expect(c.cor).toBe(mestre.corDoCorpo);
    expect(c.tamanho).toBe(mestre.tamanhoDoCorpo);
  });

  /*
    A precedência é a do PowerPoint, e é ela que faz a lição existir.

    Invertida, mexer no mestre mudaria a tela na hora — e o requisito 4.1
    passaria a ser um clique que funciona, quando o que ele ensina é que não
    funciona enquanto a direta estiver lá.
  */
  it('com formatação direta, é ela que aparece — e não o mestre', () => {
    const mestre = mestreDoModelo('berlim');
    const direta = aparenciaDoSlide(mestre, 'titulo', { cor: '#C00000', tamanho: 54 });
    expect(direta.cor, 'o mestre venceu a formatação direta').toBe('#C00000');
    expect(direta.tamanho).toBe(54);
  });

  it('a direta cobre só o que ela diz; o resto continua do mestre', () => {
    const mestre = mestreDoModelo('madison');
    const parcial = aparenciaDoSlide(mestre, 'corpo', { negrito: true });
    expect(parcial.negrito).toBe(true);
    expect(parcial.cor, 'uma direta só de negrito levou a cor junto').toBe(mestre.corDoCorpo);
    expect(parcial.tamanho).toBe(mestre.tamanhoDoCorpo);
  });

  it('título nasce em negrito e corpo não, sem ninguém pedir', () => {
    const mestre = mestreDoModelo('branco');
    expect(aparenciaDoSlide(mestre, 'titulo').negrito).toBe(true);
    expect(aparenciaDoSlide(mestre, 'corpo').negrito).toBe(false);
  });

  /* `direto.negrito === false` é uma escolha, e não ausência de escolha. */
  it('negrito desligado à mão desliga o negrito do título', () => {
    const mestre = mestreDoModelo('branco');
    expect(aparenciaDoSlide(mestre, 'titulo', { negrito: false }).negrito).toBe(false);
  });

  it('nomeia os slides que ainda têm formatação direta', () => {
    const limpo = umSlideComTexto('a');
    const sujo = { ...umSlideComTexto('b'), diretoNoTitulo: { tamanho: 44 } };
    const soCorpo = { ...umSlideComTexto('c'), diretoNoCorpo: { cor: '#333333' } };
    expect(temFormatacaoDireta(limpo)).toBe(false);
    expect(temFormatacaoDireta(sujo)).toBe(true);
    expect(temFormatacaoDireta(soCorpo), 'a direta do corpo passou por limpa').toBe(true);
    expect(slidesComFormatacaoDireta(umaApresentacao([limpo, sujo, soCorpo]))).toEqual(['b', 'c']);
  });

  /*
    Limpar formatação não encosta no texto.

    É a condição de "sem alterar uma palavra" da CC-ES002, e sem ela o caminho
    mais rápido e mais errado — apagar o slide feio e redigitá-lo — ficaria
    valendo.
  */
  it('limpar a formatação direta não mexe numa palavra do texto', () => {
    const sujo: Slide = {
      ...umSlideComTexto('b'),
      diretoNoTitulo: { tamanho: 44, cor: '#C00000' },
      diretoNoCorpo: { fonte: 'Comic Sans MS' },
    };
    const limpo = limparFormatacaoDireta(sujo);
    expect(temFormatacaoDireta(limpo)).toBe(false);
    expect(limpo.titulo).toBe(sujo.titulo);
    expect(limpo.topicos).toEqual(sujo.topicos);
    expect(textoDaApresentacao(umaApresentacao([limpo])))
      .toBe(textoDaApresentacao(umaApresentacao([sujo])));
  });
});

describe('o que projeta, e o que não projeta', () => {
  /*
    A nota é o que se fala, e o telão não a mostra.

    Contá-la faria o orçamento de vinte palavras do requisito 6 medir a fala
    em vez do slide — e aí o jeito de caber seria falar menos, que é o
    contrário do que a lição ensina.
  */
  it('as notas do apresentador nunca entram na conta', () => {
    const s = { ...umSlideComTexto('a'), notas: 'Aqui eu conto a história da fogueira de domingo' };
    expect(palavrasDoSlide(s)).toBe(palavrasDoSlide({ ...s, notas: '' }));
    expect(palavrasQueProjetam(s).join(' ')).not.toContain('fogueira');
  });

  it('conta o título, os tópicos e as caixas à mão', () => {
    const s: Slide = {
      ...slideNovo('a', 'em-branco'),
      caixas: [{ ...caixa('c1', 10), texto: 'Duas palavras' }],
    };
    expect(palavrasDoSlide(s), 'a caixa à mão não foi contada').toBe(2);
    expect(palavrasDoSlide({ ...s, titulo: 'Um título qualquer' })).toBe(5);
  });

  /* Marca de lista e espaço a mais não são palavra. */
  it('não conta pontuação solta nem espaço repetido', () => {
    const s = { ...slideNovo('a', 'titulo-conteudo'), titulo: 'Inverno  2026', topicos: ['—', '•'] };
    expect(palavrasDoSlide(s)).toBe(2);
  });

  it('o pior slide é o que estoura o orçamento, e é ele que responde', () => {
    const magro = { ...slideNovo('a', 'so-titulo'), titulo: 'Inverno' };
    const gordo = { ...slideNovo('b', 'titulo-conteudo'), topicos: ['uma palavra por vez aqui vai longe demais'] };
    expect(maisPalavrasNumSlide(umaApresentacao([magro, gordo]))).toBe(palavrasDoSlide(gordo));
  });
});

describe('o desalinho só existe entre slides', () => {
  /*
    O defeito do requisito 4.2 não está em nenhum slide: está na diferença.

    Medir a posição de um deles aprovaria uma apresentação inteira desalinhada
    desde que o primeiro estivesse bonito — que é exatamente como ela chega.
  */
  it('mede a diferença entre a caixa mais alta e a mais baixa', () => {
    const a = umaApresentacao([
      { ...umSlideComTexto('1'), caixas: [caixa('c1', 7)] },
      { ...umSlideComTexto('2'), caixas: [caixa('c2', 11.5)] },
      { ...umSlideComTexto('3'), caixas: [caixa('c3', 9)] },
    ]);
    expect(desalinhoDasCaixas(a, 'titulo')).toBeCloseTo(4.5, 6);
  });

  it('sem caixa à mão nenhuma, não há desalinho — o layout cuida disso', () => {
    const a = umaApresentacao([umSlideComTexto('1'), umSlideComTexto('2')]);
    expect(desalinhoDasCaixas(a, 'titulo')).toBe(0);
  });

  it('uma caixa só não desalinha de nada', () => {
    const a = umaApresentacao([{ ...umSlideComTexto('1'), caixas: [caixa('c1', 7)] }]);
    expect(desalinhoDasCaixas(a, 'titulo')).toBe(0);
  });

  it('título e corpo se medem separados', () => {
    const a = umaApresentacao([
      { ...umSlideComTexto('1'), caixas: [caixa('t1', 7), caixa('b1', 40, 'corpo')] },
      { ...umSlideComTexto('2'), caixas: [caixa('t2', 7), caixa('b2', 46, 'corpo')] },
    ]);
    expect(desalinhoDasCaixas(a, 'titulo')).toBe(0);
    expect(desalinhoDasCaixas(a, 'corpo')).toBe(6);
  });

  /*
    Aplicar o layout **move** o texto; ele não o duplica.

    Sem tirar a caixa, o texto apareceria duas vezes — uma no espaço reservado
    e outra na caixa solta por cima dele —, e o slide ficaria pior do que
    estava.
  */
  it('aplicar o layout leva o texto da caixa e apaga a caixa', () => {
    const s: Slide = {
      ...slideNovo('1', 'em-branco'),
      caixas: [
        { ...caixa('t', 7), texto: 'O que levar' },
        { ...caixa('b1', 30, 'corpo'), texto: 'Saco de dormir' },
        { ...caixa('b2', 40, 'corpo'), texto: 'Lanterna' },
      ],
    };
    const posto = aplicarLayout(s, 'titulo-conteudo');
    expect(posto.layout).toBe('titulo-conteudo');
    expect(posto.titulo).toBe('O que levar');
    expect(posto.topicos).toEqual(['Saco de dormir', 'Lanterna']);
    expect(posto.caixas, 'a caixa à mão ficou por cima do espaço reservado').toEqual([]);
    expect(palavrasDoSlide(posto), 'o texto foi contado duas vezes').toBe(palavrasDoSlide(s));
  });

  it('aplicar o layout num slide que já tem texto não sobrescreve nada', () => {
    const s = umSlideComTexto('1');
    const posto = aplicarLayout(s, 'so-titulo');
    expect(posto.titulo).toBe(s.titulo);
    expect(posto.topicos).toEqual(s.topicos);
  });
});

describe('a imagem, e o que a projeção pede dela', () => {
  const pedido = (porCento: number) => pixelsQueAProjecaoPede(porCento);

  it('o que a projeção pede sai da largura dela, e não de um número solto', () => {
    expect(pedido(100)).toBe(PROJECAO.largura);
    expect(pedido(50)).toBe(PROJECAO.largura / 2);
  });

  it('separa a foto pequena, a adequada e a grande demais', () => {
    const p = pedido(40);
    expect(resolucaoDaImagem(imagemInserida('a', 'pequena.png', p - 1, 200))).toBe('baixa');
    expect(resolucaoDaImagem(imagemInserida('b', 'certa.jpg', p, 400))).toBe('adequada');
    expect(resolucaoDaImagem(imagemInserida('c', 'limite.jpg', p * LIMITE_DO_EXCESSO, 800)))
      .toBe('adequada');
    expect(resolucaoDaImagem(imagemInserida('d', 'celular.jpg', 4032, 3024))).toBe('excessiva');
  });

  /*
    A mesma foto muda de veredito quando muda de tamanho no slide.

    É o que torna o requisito 4.3 sobre **resolução** e não sobre o arquivo:
    uma foto de 800 pixels serve num quarto do slide e não serve na tela
    inteira, e nada no arquivo mudou.
  */
  it('o veredito depende do tamanho em que ela entra', () => {
    const pequena = { ...imagemInserida('a', 'foto.jpg', 800, 600), largura: 100 };
    expect(resolucaoDaImagem(pequena)).toBe('baixa');
    expect(resolucaoDaImagem({ ...pequena, largura: 40 })).toBe('adequada');
  });

  it('o esticamento diz quantas vezes cada pixel é ampliado', () => {
    const img = imagemInserida('a', 'foto.jpg', pedido(40) / 2, 300);
    expect(esticamentoDaImagem(img)).toBeCloseTo(2, 6);
    expect(esticamentoDaImagem(imagemInserida('b', 'ok.jpg', pedido(40), 400))).toBeCloseTo(1, 6);
  });

  it('o peso do arquivo sai dos pixels das fotos', () => {
    const vazia = umaApresentacao([umSlideComTexto('1')]);
    expect(pesoEmMegabytes(vazia)).toBe(0);
    const comFotos = umaApresentacao([{
      ...umSlideComTexto('1'),
      imagens: [imagemInserida('a', 'f.jpg', 4032, 3024), imagemInserida('b', 'g.jpg', 4032, 3024)],
    }]);
    /* Duas fotos de doze megapixels passam de cinco megabytes — que é por que
       a apresentação do clube não cabe num anexo de e-mail. */
    expect(pesoEmMegabytes(comFotos)).toBeGreaterThan(5);
  });

  /*
    Compactar reduz, e nunca aumenta.

    Uma compactação que ampliasse devolveria pixel que não existe no arquivo:
    o veredito passaria a "adequada" e a projeção continuaria serrilhada, que é
    a trava passando sem ter conferido nada.
  */
  it('compactar diminui a foto grande e não encosta na pequena', () => {
    const grande = imagemInserida('a', 'celular.jpg', 4032, 3024);
    const menor = compactarImagem(grande, 220);
    expect(menor.pixelsLargura).toBeLessThan(grande.pixelsLargura);
    expect(menor.pixelsAltura).toBeLessThan(grande.pixelsAltura);
    /* A proporção é a mesma: compactar não corta a foto. */
    expect(menor.pixelsLargura / menor.pixelsAltura)
      .toBeCloseTo(grande.pixelsLargura / grande.pixelsAltura, 2);

    const pequena = imagemInserida('b', 'pequena.png', 300, 200);
    expect(compactarImagem(pequena, 220)).toEqual(pequena);
  });

  it('compactar não tira a foto do tamanho que a projeção pede', () => {
    const grande = imagemInserida('a', 'celular.jpg', 4032, 3024);
    expect(resolucaoDaImagem(compactarImagem(grande, 220))).toBe('adequada');
  });
});

describe('um slide novo abre com tudo por fazer', () => {
  it('nasce sem título, sem tópico, sem nota e sem caixa', () => {
    const s = slideNovo('x', 'titulo-conteudo');
    expect(s.titulo).toBe('');
    expect(s.topicos).toEqual([]);
    expect(s.notas).toBe('');
    expect(s.caixas).toEqual([]);
    expect(s.imagens).toEqual([]);
    expect(temFormatacaoDireta(s)).toBe(false);
    expect(palavrasDoSlide(s)).toBe(0);
  });
});

/*
  A caixa Compactar Imagens fala em pontos por polegada, e o telão em pixels.

  Os três valores que o PowerPoint oferece custam coisas diferentes, e é essa
  a escolha do requisito 4.3: 96 ppi é o que ele chama de "e-mail" e serrilha
  na projeção; 150 serve; 220 é mais do que o telão mostra. Igualados, a caixa
  viraria um número que não muda nada.
*/
describe('os três valores de compactar não dão no mesmo', () => {
  const noSlide = (ppi: number) =>
    resolucaoDaImagem(compactarImagem(imagemInserida('a', 'celular.jpg', 4032, 3024), ppi));

  it('96 ppi deixa a foto pequena demais para o telão', () => {
    expect(noSlide(96)).toBe('baixa');
  });

  it('150 e 220 ppi servem', () => {
    expect(noSlide(150)).toBe('adequada');
    expect(noSlide(220)).toBe('adequada');
  });

  it('e 220 deixa mais pixel do que 150, que é por que ele pesa mais', () => {
    const grande = imagemInserida('a', 'celular.jpg', 4032, 3024);
    expect(compactarImagem(grande, 220).pixelsLargura)
      .toBeGreaterThan(compactarImagem(grande, 150).pixelsLargura);
  });
});
