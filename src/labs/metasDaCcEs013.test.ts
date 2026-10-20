import { describe, it, expect } from 'vitest';
import {
  type ContextoDoProjetoDeDados, type LicaoDaCcEs013,
  ABA_DE_CALCULOS, ABA_DE_DISTANCIAS, ABA_DE_GRUPOS, ABA_DE_UNIDADES,
  ARQUIVO_BRUTO, ARQUIVO_BRUTO_MEXIDO, ARQUIVO_DA_ANALISE, ARQUIVO_DO_RELATORIO,
  CONCLUSAO_FEITA, CORRELACAO_ESPERADA, ESTADO_DEPOIS, LICOES_DA_CC_ES013, MEDIDAS,
  PASTA_DA_ENTREGA, RECOMENDACAO_VAGA, SUBSTITUICOES_DA_GRAFIA,
  comCopiaTratada, comNumerosConsertados, contextoDe, esperadoDaMedida,
  esperadoDoGrupo, linhaDaMedida, metasDa,
} from './metasDaCcEs013';
import {
  COLUNAS, INDICE, MEMBROS, MODOS, NOME_DA_BRUTA, NOME_DA_TRATADA, linhasBrutas,
} from './chamadaDoClube';
import {
  type Caderno, type Planilha, escrever, limpar, moverOuCopiar, planilhaPorNome,
  removerDuplicatas, substituir, excluirLinha,
} from './planilha';
import { numeroDoTexto } from './formulas';
import { compartilhar, mover, mudarAcessoGeral } from './arquivoCompartilhado';
import { type ProjetoDeDados, cabeEmDuasPaginas } from './projetoDeDados';

/*
  A trava de motor da CC-ES013.

  Três perguntas para cada lição: nenhuma meta abre verde; o estado que a lição
  seguinte recebe fecha todas — que é a solução de referência, e que é derivado
  chamando os mesmos comandos que a tela oferece —; e o caminho errado que cada
  meta existe para recusar continua recusado.
*/

const LICOES = Object.keys(LICOES_DA_CC_ES013) as LicaoDaCcEs013[];
const ctx = (p: ProjetoDeDados, extra: Partial<ContextoDoProjetoDeDados> = {}) =>
  ({ ...contextoDe(p), ...extra });
const feita = (licao: LicaoDaCcEs013, id: string, c: ContextoDoProjetoDeDados) =>
  metasDa(licao).find(m => m.id === id)!.feita(c);
const partida = (l: LicaoDaCcEs013) => LICOES_DA_CC_ES013[l].projeto;
const naAba = (cad: Caderno, nome: string, f: (p: Planilha) => Planilha): Caderno =>
  ({ ...cad, planilhas: cad.planilhas.map(p => (p.nome === nome ? f(p) : p)) });

describe('as onze lições', () => {
  it('são onze, e nenhuma meta se repete', () => {
    expect(LICOES).toHaveLength(11);
    const ids = LICOES.flatMap(l => metasDa(l).map(m => m.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(LICOES)('%s: nenhuma meta abre verde', licao => {
    for (const m of metasDa(licao)) expect(m.feita(ctx(partida(licao))), m.id).toBe(false);
  });

  it.each(LICOES)('%s: o estado que a lição seguinte recebe fecha todas as metas', licao => {
    for (const m of metasDa(licao)) expect(m.feita(ctx(ESTADO_DEPOIS[licao])), m.id).toBe(true);
  });

  it('o trabalho de cada lição continua de pé nas seguintes', () => {
    LICOES.forEach((licao, i) => {
      for (const depois of LICOES.slice(i)) {
        for (const m of metasDa(licao)) {
          expect(m.feita(ctx(ESTADO_DEPOIS[depois])), `${m.id} em ${depois}`).toBe(true);
        }
      }
    });
  });
});

describe('a proposta', () => {
  it('abrir a base antes da aprovação deixa a meta da ordem vermelha para sempre', () => {
    expect(feita('proposta', 'proposta-aprovada-antes', ctx(ESTADO_DEPOIS.proposta, { comecouAntes: true }))).toBe(false);
  });

  it('um assunto não é pergunta', () => {
    const p = { ...ESTADO_DEPOIS.proposta, proposta: { ...ESTADO_DEPOIS.proposta.proposta, pergunta: 'A presença no clube' } };
    expect(feita('proposta', 'proposta-pergunta', ctx(p))).toBe(false);
  });
});

describe('a base', () => {
  const comFicha = (base: ProjetoDeDados['ficha']['base'], obtidaEm = '03/08/2026') =>
    ctx({ ...ESTADO_DEPOIS.base, ficha: { ...ESTADO_DEPOIS.base.ficha, base, obtidaEm } });

  it('as três bases erradas não servem, cada uma por um motivo', () => {
    for (const b of ['inscricoes', 'chamada-2025', 'deslocamento-df'] as const) {
      expect(feita('base', 'base-que-serve', comFicha(b)), b).toBe(false);
    }
  });

  it('a data do período não é a de obtenção', () => {
    for (const d of ['01/02/2026', '31/07/2026', '03/08/2025']) {
      expect(feita('base', 'data-de-obtencao', comFicha('chamada', d)), d).toBe(false);
    }
    expect(feita('base', 'data-de-obtencao', comFicha('chamada', '2026-08-03'))).toBe(true);
  });
});

describe('a grafia', () => {
  const inicio = partida('grafia');
  const comCaderno = (caderno: Caderno) => ctx({ ...ESTADO_DEPOIS.grafia, caderno });

  it('mover sem marcar a cópia deixa a lição sem bruta: limpar ali reprova tudo', () => {
    const movido = moverOuCopiar(inicio.caderno, 0, 1, false);
    const limpo = naAba(movido, NOME_DA_BRUTA, p => SUBSTITUICOES_DA_GRAFIA.reduce(
      (q, [col, de, para]) => substituir(q, de, para, { maiusculas: false, inteira: true },
        { l1: 1, c1: INDICE[col], l2: linhasBrutas().length, c2: INDICE[col] }).planilha, p));
    for (const id of ['copia-com-nome', 'unidades-padronizadas', 'transporte-padronizado']) {
      expect(feita('grafia', id, comCaderno(limpo)), id).toBe(false);
    }
  });

  it('a cópia que continua se chamando "Bruta (2)" não diz o que é', () => {
    const copia = moverOuCopiar(inicio.caderno, 0, 1, true);
    expect(feita('grafia', 'copia-com-nome', comCaderno(copia))).toBe(false);
  });

  it('substituir sem célula inteira e na planilha toda estraga o Pedro Aguiar', () => {
    const cad = naAba(ESTADO_DEPOIS.grafia.caderno, NOME_DA_TRATADA, p =>
      substituir(p, 'Aguiar', 'Águiar', { maiusculas: true, inteira: false }).planilha);
    expect(feita('grafia', 'unidades-padronizadas', comCaderno(cad))).toBe(false);
  });

  it('remover duplicatas olhando só o nome apaga a homônima', () => {
    const certo = comCopiaTratada(inicio.caderno);
    const padronizado = naAba(certo, NOME_DA_TRATADA, p => SUBSTITUICOES_DA_GRAFIA.reduce(
      (q, [col, de, para]) => substituir(q, de, para, { maiusculas: false, inteira: true },
        { l1: 1, c1: INDICE[col], l2: linhasBrutas().length, c2: INDICE[col] }).planilha, p));
    const soNome = naAba(padronizado, NOME_DA_TRATADA, p => removerDuplicatas(p, [0]).planilha);
    expect(feita('grafia', 'sem-repetida', comCaderno(soNome))).toBe(false);
    const antes = naAba(certo, NOME_DA_TRATADA, p => removerDuplicatas(p, COLUNAS.map((_, i) => i)).planilha);
    expect(feita('grafia', 'sem-repetida', comCaderno(antes))).toBe(false);
  });

  it('a tratada certa com a bruta também limpa reprova: não há mais bruta para entregar', () => {
    const certa = planilhaPorNome(ESTADO_DEPOIS.grafia.caderno, NOME_DA_TRATADA)!;
    const cad = naAba(ESTADO_DEPOIS.grafia.caderno, NOME_DA_BRUTA, () => ({ ...certa, nome: NOME_DA_BRUTA }));
    for (const id of ['copia-com-nome', 'unidades-padronizadas', 'transporte-padronizado', 'sem-repetida']) {
      expect(feita('grafia', id, comCaderno(cad)), id).toBe(false);
    }
  });

  it('decisão de duas palavras não é decisão escrita', () => {
    const p = { ...ESTADO_DEPOIS.grafia, diario: ESTADO_DEPOIS.grafia.diario.map(d => ({ ...d, texto: 'arrumei' })) };
    expect(feita('grafia', 'diario-da-grafia', ctx(p))).toBe(false);
  });
});

describe('os números e as ausências', () => {
  const certo = ESTADO_DEPOIS.numeros;
  const comMudanca = (f: (p: Planilha) => Planilha) =>
    ctx({ ...certo, caderno: naAba(certo.caderno, NOME_DA_TRATADA, f) });
  const linhaDe = (p: Planilha, nome: string, unidade: string) =>
    p.celulas.findIndex(l => l[INDICE.nome]?.texto === nome && l[INDICE.unidade]?.texto === unidade);

  it('o 1.250 puxa a média da distância da bruta para perto de trinta', () => {
    const lidas = linhasBrutas().flatMap(l => {
      const n = numeroDoTexto(l[INDICE.distancia]);
      return n === null ? [] : [n];
    });
    const m = lidas.reduce((s, x) => s + x, 0) / lidas.length;
    expect(Math.round(m)).toBe(30);
  });

  it('preencher a distância de quem não respondeu com a média reprova a ausência', () => {
    const c = comMudanca(p => MEMBROS.filter(m => m.distancia === null).reduce(
      (q, m) => escrever(q, linhaDe(q, m.nome, m.unidade), INDICE.distancia, '6,43'), p));
    expect(feita('numeros', 'ausencias-de-pe', c)).toBe(false);
  });

  it('excluir as linhas de quem não respondeu também reprova, e derruba a base abaixo de sessenta', () => {
    const c = comMudanca(p => MEMBROS.filter(m => m.modo === null).reduce(
      (q, m) => excluirLinha(q, linhaDe(q, m.nome, m.unidade)) ?? q, p));
    expect(feita('numeros', 'ausencias-de-pe', c)).toBe(false);
  });

  it('adivinhar a idade da Ana Clara não é tratar o impossível', () => {
    const c = comMudanca(p => escrever(p, linhaDe(p, 'Ana Clara Ribeiro', 'Tucano'), INDICE.idade, '14'));
    expect(feita('numeros', 'impossiveis-tratados', c)).toBe(false);
  });

  it('apagar a linha dela também não', () => {
    const c = comMudanca(p => excluirLinha(p, linhaDe(p, 'Ana Clara Ribeiro', 'Tucano')) ?? p);
    expect(feita('numeros', 'impossiveis-tratados', c)).toBe(false);
  });

  it('apagar alguém por engano, ou uma presença, reprova o conserto: o resto da base não era desta lição', () => {
    const semAlguem = comMudanca(p => excluirLinha(p, linhaDe(p, 'Lara Cunha', 'Águia')) ?? p);
    expect(feita('numeros', 'texto-virou-numero', semAlguem)).toBe(false);
    const semPresenca = comMudanca(p => escrever(p, linhaDe(p, 'Lara Cunha', 'Águia'), INDICE.presencas, ''));
    expect(feita('numeros', 'texto-virou-numero', semPresenca)).toBe(false);
  });

  it('tirar o "km" com a coluna inteira selecionada leva o do cabeçalho junto, e reprova', () => {
    const c = comMudanca(p => substituir(p, 'km', '', { maiusculas: false, inteira: false },
      { l1: 0, c1: INDICE.distancia, l2: p.celulas.length - 1, c2: INDICE.distancia }).planilha);
    expect(planilhaPorNome(c.p.caderno, NOME_DA_TRATADA)!.celulas[0][INDICE.distancia].texto).toBe('Distância ()');
    expect(feita('numeros', 'texto-virou-numero', c)).toBe(false);
    expect(feita('numeros', 'ausencias-de-pe', c)).toBe(true);
  });

  it('deixar o 1.250 de pé reprova o impossível e não o texto — ele já era número', () => {
    const c = comMudanca(p => escrever(p, linhaDe(p, 'Isabela Moreira', 'Onça'), INDICE.distancia, '1.250'));
    expect(feita('numeros', 'impossiveis-tratados', c)).toBe(false);
    expect(feita('numeros', 'texto-virou-numero', c)).toBe(true);
  });

  it('consertar a tratada e também a bruta reprova as três metas: a bruta deixou de existir', () => {
    const bruta = planilhaPorNome(certo.caderno, NOME_DA_BRUTA)!;
    const consertada = comNumerosConsertados({ planilhas: [{ ...bruta, nome: NOME_DA_TRATADA }], ativa: 0 }).planilhas[0];
    const c = ctx({ ...certo, caderno: naAba(certo.caderno, NOME_DA_BRUTA, () => ({ ...consertada, nome: NOME_DA_BRUTA })) });
    for (const id of ['texto-virou-numero', 'impossiveis-tratados', 'ausencias-de-pe']) {
      expect(feita('numeros', id, c), id).toBe(false);
    }
  });
});

describe('as medidas e as contas', () => {
  const certo = ESTADO_DEPOIS.descritivas;
  const comConta = (linha: number, formula: string) =>
    ctx({ ...certo, caderno: naAba(certo.caderno, ABA_DE_CALCULOS, p => escrever(p, linha, 1, formula)) });

  it('a mediana da presença sai igual na bruta, e mesmo assim a conta sobre ela reprova', () => {
    const naBruta = '=MED(Bruta!F2:F63)';
    const c = comConta(linhaDaMedida(1), naBruta);
    const p = planilhaPorNome(c.p.caderno, ABA_DE_CALCULOS)!;
    expect(p).toBeDefined();
    expect(esperadoDaMedida(MEDIDAS[1])).toBe(16);
    expect(feita('descritivas', 'medidas-da-presenca', c)).toBe(false);
  });

  it('o número digitado com um igual na frente reprova', () => {
    const c = comConta(linhaDaMedida(0), '=15,39344262295082');
    expect(feita('descritivas', 'medidas-da-presenca', c)).toBe(false);
  });

  it('a soma dividida por 61 dá a média e reprova: é um número digitado dentro da fórmula', () => {
    const c = comConta(linhaDaMedida(0), `=SOMA(${NOME_DA_TRATADA}!F2:F62)/61`);
    expect(feita('descritivas', 'medidas-da-presenca', c)).toBe(false);
  });

  it('a média sobre um intervalo que esqueceu as últimas linhas reprova', () => {
    const c = comConta(linhaDaMedida(3), `=MÉDIA(${NOME_DA_TRATADA}!E2:E50)`);
    expect(feita('descritivas', 'medidas-da-distancia', c)).toBe(false);
  });

  it('a média descreve mal a distância: ela passa da mediana', () => {
    expect(esperadoDaMedida(MEDIDAS[3])).toBeGreaterThan(esperadoDaMedida(MEDIDAS[4]) + 1);
  });

  it('a média geral escrita em cada grupo reprova', () => {
    const c = ctx({
      ...ESTADO_DEPOIS.grupos,
      caderno: naAba(ESTADO_DEPOIS.grupos.caderno, ABA_DE_GRUPOS,
        p => escrever(p, 1, 2, `=MÉDIA(${NOME_DA_TRATADA}!F2:F62)`)),
    });
    expect(feita('grupos', 'medias-por-grupo', c)).toBe(false);
  });

  it('carona e ônibus moram longe parecido, e a presença é muito diferente — é a premissa da recomendação', () => {
    const carona = esperadoDoGrupo('Carona');
    const onibus = esperadoDoGrupo('Ônibus');
    expect(Math.abs(carona.distancia - onibus.distancia)).toBeLessThan(1);
    expect(carona.presencas - onibus.presencas).toBeGreaterThan(5);
    expect(esperadoDoGrupo('Bicicleta').quantos).toBeLessThan(5);
    expect(MODOS.reduce((s, m) => s + esperadoDoGrupo(m).quantos, 0))
      .toBe(MEMBROS.filter(m => m.modo !== null).length);
  });

  it('a correlação é forte e negativa', () => {
    expect(CORRELACAO_ESPERADA()).toBeLessThan(-0.6);
    expect(CORRELACAO_ESPERADA()).toBeGreaterThan(-0.8);
  });
});

describe('a relação', () => {
  const certo = ESTADO_DEPOIS.relacao;
  const comGrafico = (f: (g: NonNullable<Planilha['grafico']>) => NonNullable<Planilha['grafico']>) =>
    ctx({ ...certo, caderno: naAba(certo.caderno, NOME_DA_TRATADA, p => ({ ...p, grafico: f(p.grafico!) })) });

  it('a dispersão sobre metade das linhas reprova', () => {
    const c = comGrafico(g => ({ ...g, faixa: { ...g.faixa, l2: 30 } }));
    expect(feita('relacao', 'dispersao-da-base', c)).toBe(false);
  });

  it('a dispersão de uma coluna contra ela mesma reprova, mesmo com os cinquenta e sete pontos', () => {
    const c = comGrafico(g => ({ ...g, faixa: { ...g.faixa, c1: INDICE.distancia, c2: INDICE.distancia } }));
    expect(feita('relacao', 'dispersao-da-base', c)).toBe(false);
  });

  it('a reta sem a equação reprova', () => {
    expect(feita('relacao', 'reta-e-equacao', comGrafico(g => ({ ...g, equacao: undefined })))).toBe(false);
  });

  it('a correlação sobre a bruta reprova', () => {
    const c = ctx({
      ...certo,
      caderno: naAba(certo.caderno, ABA_DE_CALCULOS, p => escrever(p, 8, 1, '=CORREL(Bruta!E2:E63;Bruta!F2:F63)')),
    });
    expect(feita('relacao', 'correlacao-calculada', c)).toBe(false);
  });
});

describe('o painel', () => {
  const certo = ESTADO_DEPOIS.painel;
  const comGrafico = (aba: string, f: (g: NonNullable<Planilha['grafico']>) => NonNullable<Planilha['grafico']>) =>
    ctx({ ...certo, caderno: naAba(certo.caderno, aba, p => ({ ...p, grafico: f(p.grafico!) })) });

  it('linha numa base sem tempo reprova', () => {
    expect(feita('painel', 'cada-tipo-responde', comGrafico(ABA_DE_UNIDADES, g => ({ ...g, tipo: 'linha' })))).toBe(false);
  });

  it('pizza das médias reprova; pizza da contagem passa', () => {
    expect(feita('painel', 'cada-tipo-responde', comGrafico(ABA_DE_GRUPOS, g => ({ ...g, tipo: 'pizza' })))).toBe(false);
    expect(feita('painel', 'cada-tipo-responde',
      comGrafico(ABA_DE_GRUPOS, g => ({ ...g, tipo: 'pizza', faixa: { ...g.faixa, c2: 1 } })))).toBe(true);
  });

  it('assunto no lugar de pergunta reprova, e duas perguntas iguais também', () => {
    expect(feita('painel', 'cada-um-uma-pergunta', comGrafico(ABA_DE_UNIDADES, g => ({ ...g, titulo: 'Presença por unidade' })))).toBe(false);
    const igual = planilhaPorNome(certo.caderno, ABA_DE_GRUPOS)!.grafico!.titulo;
    expect(feita('painel', 'cada-um-uma-pergunta', comGrafico(ABA_DE_UNIDADES, g => ({ ...g, titulo: igual })))).toBe(false);
  });

  it('gráfico sobre faixa vazia não conta', () => {
    const c = ctx({
      ...certo,
      caderno: naAba(certo.caderno, ABA_DE_DISTANCIAS, p => limpar(p, { l1: 1, c1: 1, l2: 4, c2: 1 })),
    });
    expect(feita('painel', 'quatro-graficos', c)).toBe(false);
  });

  it('gráfico de colunas sem eixo nomeado reprova', () => {
    expect(feita('painel', 'cada-tipo-responde', comGrafico(ABA_DE_UNIDADES, g => ({ ...g, eixoY: '' })))).toBe(false);
  });
});

describe('a conclusão', () => {
  it('o rascunho passa de duas páginas — é a premissa da lição, e a primeira meta depende dela', () => {
    const rascunho = partida('conclusao').conclusao;
    expect(cabeEmDuasPaginas({ ...rascunho, naoPermitem: CONCLUSAO_FEITA.naoPermitem })).toBe(false);
  });

  const comConclusao = (c: Partial<typeof CONCLUSAO_FEITA>) =>
    ctx({ ...ESTADO_DEPOIS.conclusao, conclusao: { ...CONCLUSAO_FEITA, ...c } });

  it('apagar tudo cabe em duas páginas e reprova', () => {
    expect(feita('conclusao', 'tres-partes-em-duas-paginas',
      comConclusao({ mostram: '', naoPermitem: '', recomendacao: '' }))).toBe(false);
  });

  it('a parte do que os dados mostram apagada reprova, com as outras duas no lugar', () => {
    expect(feita('conclusao', 'tres-partes-em-duas-paginas', comConclusao({ mostram: '' }))).toBe(false);
  });

  it('a recomendação sem dono reprova', () => {
    expect(feita('conclusao', 'recomendacao-pratica', comConclusao({ recomendacao: RECOMENDACAO_VAGA }))).toBe(false);
    expect(feita('conclusao', 'recomendacao-pratica',
      comConclusao({ recomendacao: 'Seria bom que mais gente viesse às reuniões de sábado, porque a presença ajuda todo mundo.' }))).toBe(false);
  });

  it('o que os dados mostram sem número reprova', () => {
    expect(feita('conclusao', 'mostram-com-numero',
      comConclusao({ mostram: 'Quem mora mais longe tende a faltar mais, e o jeito de chegar pesa muito na presença do sábado.' }))).toBe(false);
  });

  it('os números da conclusão de referência são os da base', () => {
    const t = CONCLUSAO_FEITA.mostram;
    const carona = esperadoDoGrupo('Carona');
    const onibus = esperadoDoGrupo('Ônibus');
    const duas = (n: number) => n.toFixed(2).replace('.', ',');
    for (const n of [carona.distancia, carona.presencas, onibus.distancia, onibus.presencas, CORRELACAO_ESPERADA()]) {
      expect(t, duas(n)).toContain(duas(n));
    }
  });
});

describe('a apresentação', () => {
  const certo = ESTADO_DEPOIS.apresentacao;
  const comRoteiro = (r: Partial<ProjetoDeDados['roteiro']>) => ctx({ ...certo, roteiro: { ...certo.roteiro, ...r } });

  it('a família em casa não é público do clube', () => {
    expect(feita('apresentacao', 'publico-que-decide', comRoteiro({ publico: 'familia' }))).toBe(false);
  });

  it('dez minutos sem nenhum para a recomendação reprova', () => {
    const blocos = certo.roteiro.blocos.map(b => (b.id === 'recomendacao' ? { ...b, minutos: 0 } : b));
    expect(feita('apresentacao', 'cabe-em-dez-minutos', comRoteiro({ blocos }))).toBe(false);
  });

  it('o registro datado de antes da aprovação reprova', () => {
    expect(feita('apresentacao', 'registro-da-decisao',
      comRoteiro({ registro: { ...certo.roteiro.registro, data: '15/06/2026' } }))).toBe(false);
  });
});

describe('a entrega', () => {
  const inicio = partida('entrega');
  const comNuvem = (n: ProjetoDeDados['nuvem']) => ctx({ ...inicio, nuvem: n });
  const tres = (n: ProjetoDeDados['nuvem'], bruta = ARQUIVO_BRUTO) =>
    [bruta, ARQUIVO_DA_ANALISE, ARQUIVO_DO_RELATORIO].reduce((m, id) => mover(m, id, PASTA_DA_ENTREGA), n);

  it('as duas cópias da bruta na pasta reprovam', () => {
    const n = mover(tres(inicio.nuvem), ARQUIVO_BRUTO_MEXIDO, PASTA_DA_ENTREGA);
    expect(feita('entrega', 'entregaveis-na-pasta', comNuvem(n))).toBe(false);
  });

  it('a cópia editada no lugar da bruta reprova a meta da bruta, e não a dos três', () => {
    const n = tres(inicio.nuvem, ARQUIVO_BRUTO_MEXIDO);
    expect(feita('entrega', 'entregaveis-na-pasta', comNuvem(n))).toBe(true);
    expect(feita('entrega', 'bruta-nunca-editada', comNuvem(n))).toBe(false);
  });

  it('o rascunho junto reprova', () => {
    const n = mover(tres(inicio.nuvem), 'a-rascunho', PASTA_DA_ENTREGA);
    expect(feita('entrega', 'entregaveis-na-pasta', comNuvem(n))).toBe(false);
  });

  it('compartilhar para editar, ou abrir o link, reprova', () => {
    const editor = compartilhar(tres(inicio.nuvem), PASTA_DA_ENTREGA, 'lideranca', 'editor');
    expect(feita('entrega', 'compartilhada-para-conferir', comNuvem(editor))).toBe(false);
    const leitor = compartilhar(tres(inicio.nuvem), PASTA_DA_ENTREGA, 'lideranca', 'leitor');
    expect(feita('entrega', 'compartilhada-para-conferir', comNuvem(leitor))).toBe(true);
    const aberto = mudarAcessoGeral(leitor, ARQUIVO_DA_ANALISE, 'leitor');
    expect(feita('entrega', 'compartilhada-para-conferir', comNuvem(aberto))).toBe(false);
  });
});

describe('a bruta continua a mesma do começo ao fim', () => {
  it.each(LICOES)('%s: a bruta do estado final é a que chegou', licao => {
    const b = planilhaPorNome(ESTADO_DEPOIS[licao].caderno, NOME_DA_BRUTA)!;
    expect(b.celulas.slice(1, linhasBrutas().length + 1).map(l => l.slice(0, 6).map(c => c.texto)))
      .toEqual(linhasBrutas());
  });
});
