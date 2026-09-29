import { describe, expect, it } from 'vitest';
import {
  ATIPICOS, CAMPO_ACAMPAMENTOS, CAMPO_ALTURA, CAMPO_CAMISETA, CAMPO_IDADE,
  CLASSIFICACAO, ELENCO, MEMBROS_DO_CLUBE, TAMANHOS_DE_CAMISETA, UNIDADES_DO_CLUBE,
  adesaoPorUnidade, baseDoAcampamento, camposDaBase, porSemana, unidadeCanonica,
} from './baseDoAcampamento';
import { atipicosDe, cercaDe, colunaDe, media, mediana } from './analiseDeDados';
import {
  CAMPO_DIARIAS, CAMPO_EMAIL, CAMPO_NOME, CAMPO_UNIDADE,
  camposComValidacao, formularioDeInscricao, numerosComPonto, recusas,
  respostasCompletas, respostasReais, valorDa,
} from './formulario';
import { numeroDoTexto } from './formulas';

const base = baseDoAcampamento();
const linhas = respostasReais(base);

describe('a base é o formulário da CC-ES008, fechado', () => {
  it('não aceita mais resposta', () => {
    /*
      Com o formulário aberto, toda conta desta vereda envelheceria no envio
      seguinte: a mediana da terça não seria a de quarta, e a conclusão escrita
      no requisito 8 passaria a falar de uma base que mudou embaixo dela.
    */
    expect(base.aceitandoRespostas).toBe(false);
  });

  it('traz os quinze da CC-ES008, com o mesmo nome e o mesmo e-mail', () => {
    /*
      Eles não são recopiados — `respostaHerdada` os lê de lá. A trava confere
      que a leitura de fato acontece: trocada por uma segunda lista, ela cai
      aqui antes de alguém encontrar dois Bruno Costa em duas veredas.
    */
    const daOutra = respostasReais(formularioDeInscricao());
    expect(daOutra.length).toBeGreaterThan(10);

    const daqui = new Map(linhas.map(r => [r.id, r]));
    for (const veio of daOutra) {
      const aqui = daqui.get(veio.id);
      expect(aqui, `a resposta ${veio.id} da CC-ES008 sumiu da base`).toBeDefined();
      expect(valorDa(aqui!, CAMPO_NOME)).toBe(valorDa(veio, CAMPO_NOME));

      /* Os dois e-mails em branco a CC-ES008 não tinha — o clube foi atrás.
         Onde havia um, ele é o mesmo. */
      const antes = valorDa(veio, CAMPO_EMAIL);
      if (antes.trim() !== '') expect(valorDa(aqui!, CAMPO_EMAIL)).toBe(antes);
    }
  });

  it('não perde nem inventa gente: quarenta e oito respostas, todas completas', () => {
    expect(linhas).toHaveLength(48);
    expect(base.respostas).toHaveLength(48);
    /* Sem duplicata e sem envio vazio: o módulo 5 da CC-ES008 os tirou, e uma
       base que os trouxesse de volta mediria de novo o que já foi medido. */
    expect(respostasCompletas(base)).toHaveLength(48);
  });

  it('chega arrumada: nenhuma resposta seria recusada pelo próprio formulário', () => {
    /*
      O formulário fechado tem obrigatório e validação, e o que já estava
      guardado não passa por eles — é a lição inteira do módulo 2 da CC-ES008.
      Aqui a base é o **depois** do conserto, então o que ela guarda tem de
      sobreviver às regras que ela própria declara. Sem isto, a vereda abriria
      com uma base que o formulário dela recusaria, e nada diria.
    */
    expect(camposComValidacao(base).length).toBeGreaterThan(0);
    for (const r of linhas) {
      expect(recusas(base, r.valores), `a resposta ${r.id} seria recusada`).toEqual([]);
    }
  });

  it('não traz nenhum número escrito com ponto', () => {
    /* `1.5` era o número que virava texto, e ele saía da soma sem reclamar.
       Uma base de análise com um deles dentro daria toda medida plausível e
       menor — que é o defeito que a CC-ES008 existe para nomear. */
    expect(numerosComPonto(base)).toEqual([]);
  });

  it('escreve toda unidade com a grafia da lista', () => {
    for (const r of linhas) {
      const u = valorDa(r, CAMPO_UNIDADE);
      expect(UNIDADES_DO_CLUBE, `a resposta ${r.id} diz "${u}"`).toContain(u);
    }
  });

  it('reconhece as quatro grafias do Falcão, e recusa o que não é unidade', () => {
    for (const grafia of ['Falcão', 'falcao', 'FALCÃO', 'Falcao ']) {
      expect(unidadeCanonica(grafia)).toBe('Falcão');
    }
    expect(unidadeCanonica('Gavião')).toBeNull();
    expect(unidadeCanonica('')).toBeNull();
  });
});

describe('o caso do requisito 4: o maior número e a melhor taxa', () => {
  const adesao = adesaoPorUnidade(base);

  it('confere com o elenco e com a base', () => {
    expect(adesao).toHaveLength(ELENCO.length);
    expect(adesao.reduce((s, a) => s + a.inscritos, 0)).toBe(linhas.length);
    expect(adesao.reduce((s, a) => s + a.membros, 0)).toBe(MEMBROS_DO_CLUBE);
    for (const a of adesao) expect(a.fora).toBe(a.membros - a.inscritos);
  });

  it('a unidade com mais ausentes é a que tem a melhor taxa — e as duas pontas são únicas', () => {
    /*
      É o requisito 4 inteiro. Sem isto, comparar número absoluto e taxa
      levaria à mesma conclusão, e "um caso em que a primeira comparação conduz
      a conclusão errada" não teria caso.

      As duas pontas precisam ser únicas: com empate, a lição teria duas
      respostas certas e a tarefa mediria ter escolhido a nossa.
    */
    const porAusentes = [...adesao].sort((a, b) => b.fora - a.fora);
    const porTaxa = [...adesao].sort((a, b) => (b.taxa ?? 0) - (a.taxa ?? 0));

    expect(porAusentes[0].unidade).toBe(porTaxa[0].unidade);
    expect(porAusentes[0].fora).toBeGreaterThan(porAusentes[1].fora);
    expect(porTaxa[0].taxa!).toBeGreaterThan(porTaxa[1].taxa!);
  });

  it('e é a unidade com mais membros, que é o que torna as duas contas diferentes', () => {
    const maior = [...adesao].sort((a, b) => b.membros - a.membros)[0];
    const comMaisFora = [...adesao].sort((a, b) => b.fora - a.fora)[0];
    expect(comMaisFora.unidade).toBe(maior.unidade);
  });

  it('nenhuma unidade fica sem membro, e nenhuma tem mais inscritos do que gente', () => {
    for (const a of adesao) {
      expect(a.membros, `${a.unidade} sem membro nenhum`).toBeGreaterThan(0);
      expect(a.fora, `${a.unidade} tem mais inscritos do que membros`).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('a classificação das colunas', () => {
  it('cobre cada campo da base, e nada além dele', () => {
    /* Campo novo sem classificação passaria pelo exercício do requisito 5.1
       sem ser perguntado, e a lição continuaria verde conferindo os antigos. */
    const campos = camposDaBase().map(c => c.id).sort();
    expect(Object.keys(CLASSIFICACAO).sort()).toEqual(campos);
  });

  it('não mistura as duas escalas', () => {
    for (const [campo, c] of Object.entries(CLASSIFICACAO)) {
      const cabe = c.natureza === 'qualitativa'
        ? ['nominal', 'ordinal']
        : ['discreta', 'continua'];
      expect(cabe, `${campo} é ${c.natureza} e ${c.escala}`).toContain(c.escala);
    }
  });

  it('toda quantitativa é lida como número pela planilha', () => {
    /*
      Uma coluna declarada quantitativa que a planilha lê como texto é o
      defeito do requisito 7 da CC-ES003 chegando por dentro: a `SOMA` a pula,
      a `MÉDIA` responde sobre menos gente, e o total sai plausível e menor.
    */
    for (const [campo, c] of Object.entries(CLASSIFICACAO)) {
      if (c.natureza !== 'quantitativa') continue;
      for (const v of colunaDe(base, campo)) {
        expect(numeroDoTexto(v), `${campo} guarda "${v}"`).not.toBeNull();
      }
    }
  });

  it('discreta é contagem e contínua é medida', () => {
    /*
      A diferença tem de existir **na base**, e não só na frase da teoria.
      Contagem só dá inteiro; medida dá o que couber entre dois inteiros. Sem
      uma coluna com casa decimal, "contínua" seria uma palavra que a base não
      exemplifica, e o requisito 5.1 teria uma classificação que nunca aparece.
    */
    const inteiro = (n: number) => Number.isInteger(n);
    let contínuas = 0;
    for (const [campo, c] of Object.entries(CLASSIFICACAO)) {
      if (c.natureza !== 'quantitativa') continue;
      const ns = colunaDe(base, campo).map(v => numeroDoTexto(v)!);
      if (c.escala === 'discreta') {
        expect(ns.every(inteiro), `${campo} é discreta e tem casa decimal`).toBe(true);
      } else {
        contínuas++;
        expect(ns.some(n => !inteiro(n)), `${campo} é contínua e só tem inteiro`).toBe(true);
      }
    }
    expect(contínuas, 'a base não tem nenhuma variável contínua').toBeGreaterThan(0);
  });

  it('a coluna que não agrupa não repete valor, e a que agrupa tem poucos', () => {
    /*
      A marca é o que separa a coluna que se agrupa da que não tem grupo
      nenhum. Marcada errada, ela não estoura: a unidade viraria "não agrupa" e
      sumiria de toda comparação, ou o nome deixaria de sê-lo e a primeira
      pizza da vida do desbravador teria quarenta e oito fatias iguais.

      A conta é sobre **quem respondeu**, e não sobre a coluna inteira. A
      observação tem trinta e nove em branco: medida contra as quarenta e oito
      linhas, ela pareceria uma categoria de nove níveis — e a décima
      observação seria a décima frase diferente.
    */
    for (const [campo, c] of Object.entries(CLASSIFICACAO)) {
      if (c.natureza !== 'qualitativa') continue;
      const preenchidas = colunaDe(base, campo).filter(v => v.trim() !== '');
      const distintos = new Set(preenchidas).size;
      if (c.naoAgrupa) {
        expect(preenchidas.length, `ninguém preencheu ${campo}`).toBeGreaterThan(0);
        expect(distintos, `${campo} está marcado naoAgrupa e repete valor`).toBe(preenchidas.length);
      } else {
        /*
          "Poucos valores distintos" não basta, e a observação prova: nove das
          quarenta e oito a preencheram, com nove frases diferentes. Contando
          só os distintos ela parece uma categoria de nove níveis, e tirar a
          marca dela não reprovava nada.

          O que separa os dois lados é o **tamanho do grupo**. Categoria tem
          gente dentro: aqui, pelo menos três pessoas por valor, em média.
          Menos que isso não é um grupo para comparar com outro — é uma lista
          de pessoas com outro nome.
        */
        expect(distintos, `${campo} não está marcado naoAgrupa e quase não repete valor`)
          .toBeLessThanOrEqual(preenchidas.length / 3);
      }
    }
  });

  it('a lista de camisetas não está em ordem alfabética', () => {
    /*
      É a única coisa que torna a camiseta **ordinal**. Alguém que "arrumasse"
      a lista em ordem de letra poria GG antes de M, e a variável passaria a
      ser nominal sem que nenhuma linha de código mudasse de significado e sem
      que nada estourasse.
    */
    const alfabetica = [...TAMANHOS_DE_CAMISETA].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    expect(TAMANHOS_DE_CAMISETA).not.toEqual(alfabetica);

    const ordinais = Object.entries(CLASSIFICACAO).filter(([, c]) => c.escala === 'ordinal');
    expect(ordinais.length, 'a base não tem nenhuma variável ordinal').toBeGreaterThan(0);
    expect(ordinais.map(([campo]) => campo)).toContain(CAMPO_CAMISETA);
  });
});

describe('a média que descreve mal, e os valores atípicos', () => {
  it('a média dos acampamentos fica bem acima da mediana', () => {
    /*
      É o requisito 3, e ele precisa acontecer **na base**: uma teoria que
      explicasse isso com um exemplo de fora e uma base simétrica ensinaria a
      frase sem o fato. A distância também não pode ser de arredondamento — com
      média 2,1 e mediana 2, a lição diria que a média mente sobre um décimo.
    */
    const vs = colunaDe(base, CAMPO_ACAMPAMENTOS);
    const m = media(vs)!;
    const md = mediana(vs)!;
    expect(m).toBeGreaterThan(md * 1.25);

    const abaixo = vs.map(v => numeroDoTexto(v)!).filter(n => n < m).length;
    expect(abaixo, 'a média não deixa a maioria do clube abaixo dela').toBeGreaterThan(vs.length / 2);
  });

  it('a idade e a altura não têm essa distância, e é o outro lado da lição', () => {
    /* Se toda coluna fosse assimétrica, "a média descreve mal" viraria "a
       média sempre descreve mal", que é a regra errada. */
    for (const campo of [CAMPO_IDADE, CAMPO_ALTURA]) {
      const vs = colunaDe(base, campo);
      expect(Math.abs(media(vs)! - mediana(vs)!) / mediana(vs)!).toBeLessThan(0.05);
    }
  });

  it('a cerca acusa exatamente os valores declarados', () => {
    /*
      `ATIPICOS` declara a **decisão**, que é o que o requisito 5.6 pede por
      escrito; quem acha os valores é a conta. As duas se conferem nos dois
      sentidos: valor declarado que a cerca não acusa é decisão sobre nada, e
      valor que a cerca acusa e ninguém declarou é um atípico novo que entrou
      na base sem que ninguém decidisse o que fazer com ele.
    */
    const porCampo = new Map<string, string[]>();
    for (const a of ATIPICOS) porCampo.set(a.campo, [...(porCampo.get(a.campo) ?? []), a.resposta]);

    /* A guarda do vazio de sempre, e aqui ela não é teórica: `cercaDe` devolve
       `null` quando a metade do meio é um valor só, e uma conta que passasse a
       devolver `null` para tudo deixaria esta trava verde sem ter conferido
       coluna nenhuma. */
    const comCerca = Object.keys(CLASSIFICACAO)
      .filter(c => CLASSIFICACAO[c].natureza === 'quantitativa')
      .filter(c => cercaDe(colunaDe(base, c)) !== null);
    expect(comCerca.length, 'nenhuma coluna quantitativa tem cerca').toBeGreaterThan(1);

    for (const campo of Object.keys(CLASSIFICACAO)) {
      if (CLASSIFICACAO[campo].natureza !== 'quantitativa') continue;
      const fora = atipicosDe(colunaDe(base, campo));
      const declarados = porCampo.get(campo) ?? [];
      expect(fora.length, `${campo}: a cerca acusa ${fora.length} e ${declarados.length} estão declarados`)
        .toBe(declarados.length);

      for (const id of declarados) {
        const r = linhas.find(x => x.id === id);
        expect(r, `a resposta ${id} não existe`).toBeDefined();
        expect(fora, `${campo} da resposta ${id} não está fora da cerca`)
          .toContain(numeroDoTexto(valorDa(r!, campo))!);
      }
    }
  });

  it('há atípico dos dois tipos: um que fica e um que sai', () => {
    /*
      Uma base em que todo atípico sai ensina "apague o que está longe", que é
      a regra errada e a mais fácil de aprender. Uma em que todo atípico fica
      ensina que a decisão não existe.
    */
    expect(ATIPICOS.some(a => a.mantem)).toBe(true);
    expect(ATIPICOS.some(a => !a.mantem)).toBe(true);
  });

  it('o que sai move a média pouco, que é por que ele não grita', () => {
    /*
      Um erro de digitação que jogasse a média para 5 metros seria achado por
      qualquer um, e a lição seria sobre olhar. O 1,05 move a média da turma em
      cerca de um centímetro: a coluna continua bonita, a média continua
      plausível, e é preciso ordenar para vê-lo.
    */
    const sai = ATIPICOS.find(a => !a.mantem)!;
    const todas = colunaDe(base, sai.campo);
    const sem = linhas.filter(r => r.id !== sai.resposta).map(r => valorDa(r, sai.campo));
    const diferenca = Math.abs(media(todas)! - media(sem)!);
    expect(diferenca).toBeGreaterThan(0);
    expect(diferenca).toBeLessThan(0.05);
  });
});

describe('a chegada das inscrições', () => {
  const semanas = porSemana(base);

  it('cobre toda a coleta e não perde nenhuma inscrição', () => {
    expect(semanas.length).toBeGreaterThan(2);
    expect(semanas.reduce((s, x) => s + x.inscricoes, 0)).toBe(linhas.length);
  });

  it('a linha sobe, desce e volta a subir', () => {
    /*
      É a pergunta de evolução do requisito 6, e ela só existe se houver o que
      evoluir. Chegada distribuída por igual desenha uma reta, e uma reta
      responde "nada aconteceu" — o gráfico que não valia a pena desenhar, numa
      lição cujo assunto é escolher o gráfico que responde à pergunta.
    */
    const n = semanas.map(s => s.inscricoes);
    const menor = Math.min(...n);
    expect(Math.max(...n)).toBeGreaterThan(menor * 2);
    expect(n[n.length - 1], 'a última semana não é a da correria do prazo')
      .toBeGreaterThan(n[n.length - 2]);
  });

  it('as respostas vêm em ordem de chegada', () => {
    /* O formulário entrega o que coletou na ordem em que coletou, e é dessa
       ordem que a pergunta de evolução depende. */
    const em = linhas.map(r => r.em);
    expect(em).toEqual([...em].sort());
  });
});

describe('o formulário fechado tem material para as contas', () => {
  it('as diárias variam, senão média, máximo e mínimo diriam a mesma coisa', () => {
    const ns = new Set(colunaDe(base, CAMPO_DIARIAS));
    expect(ns.size).toBeGreaterThan(1);
  });

  it('toda opção de escolha aparece pelo menos uma vez', () => {
    /*
      Opção declarada que ninguém escolheu vira categoria de frequência zero, e
      isso é legítimo — mas se **nenhuma** resposta tem "Sem glúten", a lição
      que manda comparar grupos teria um grupo vazio onde esperava um grupo.
    */
    for (const campo of camposDaBase()) {
      if (!campo.opcoes) continue;
      const vistos = new Set(colunaDe(base, campo.id));
      for (const o of campo.opcoes) {
        expect(vistos, `ninguém escolheu "${o}" em ${campo.id}`).toContain(o);
      }
    }
  });
});
