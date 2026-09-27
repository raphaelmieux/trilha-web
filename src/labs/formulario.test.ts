import { describe, expect, it } from 'vitest';
import { UTF8_BOM, fromCsv, toCsv } from '../lib/csv';
import {
  type Campo, type Formulario, type Validacao,
  CAMPO_DIARIAS, CAMPO_EMAIL, CAMPO_NOME, CAMPO_OBSERVACAO, CAMPO_UNIDADE,
  RESPOSTAS_COLETADAS, SEPARADOR_DE_ESCOLHAS, UNIDADES,
  cabecalhoDe, campoPorId, camposComBranco, camposComGrafiaDividida, comResposta,
  camposComValidacao, camposObrigatorios, comCampo, enviar, formularioDeInscricao,
  grafiasDe, inconsistencias, linhasDe, numerosComVirgula, paraComparar, recusas,
  preenchido, respostasCompletas, respostasReais, tiposUsados, validacaoVale, valorDa,
} from './formulario';

const base = () => formularioDeInscricao();

const comObrigatorio = (f: Formulario, id: string): Formulario =>
  comCampo(f, id, c => ({ ...c, obrigatorio: true }));

describe('a caixa de onde as lições partem', () => {
  it('chega com o que o requisito 4 manda acrescentar por fazer', () => {
    const f = base();
    // Guarda contra o vazio: uma caixa que esvaziasse deixaria toda conta
    // abaixo verdadeira por não ter conferido nada.
    expect(f.campos.length).toBeGreaterThanOrEqual(5);
    expect(RESPOSTAS_COLETADAS.length).toBeGreaterThanOrEqual(15);
    expect(UNIDADES.length).toBeGreaterThanOrEqual(6);

    expect(camposObrigatorios(f)).toEqual([]);
    expect(camposComValidacao(f)).toEqual([]);
    expect(tiposUsados(f).length).toBeLessThan(3);
  });

  it('dezoito linhas são dezesseis respostas', () => {
    const f = base();
    expect(f.respostas.length).toBe(18);
    expect(respostasReais(f).length).toBe(16);
    // E o requisito pede no mínimo quinze: a folga é de uma.
    expect(respostasReais(f).length).toBeGreaterThanOrEqual(15);
  });

  it('carrega as três inconsistências, e elas são de três naturezas', () => {
    const f = base();

    // A que não aparece na coluna: quatro grafias do Falcão e duas da Águia.
    const divididas = camposComGrafiaDividida(f);
    expect(divididas.map(d => d.campo.id)).toEqual([CAMPO_UNIDADE]);
    const tamanhos = divididas[0].grafias.map(g => g.length).sort();
    expect(tamanhos).toEqual([2, 4]);

    // A que aparece na coluna, depois que o campo vira obrigatório.
    expect(camposComBranco(f)).toEqual([]);
    expect(camposComBranco(comObrigatorio(f, CAMPO_EMAIL)).map(c => c.id)).toEqual([CAMPO_EMAIL]);

    // A que não aparece em lugar nenhum: o número com vírgula.
    const virgulas = numerosComVirgula(comCampo(f, CAMPO_DIARIAS, c => ({ ...c, tipo: 'numero' })));
    expect(virgulas.length).toBe(2);
    expect(virgulas.map(v => valorDa(v.resposta, CAMPO_DIARIAS)).sort()).toEqual(['1,5', '2,5']);
    // E ela olha só campo de número. Uma observação escrita com vírgula é
    // português, e não defeito: sem este caso, tirar a restrição de tipo não
    // derrubaria teste nenhum — a trava passaria por sorte.
    expect(respostasReais(f).some(r => valorDa(r, CAMPO_OBSERVACAO).includes(','))).toBe(true);
  });
});

describe('o requisito 4 conta tipos, e não campos', () => {
  it('cinco campos de resposta curta são um tipo', () => {
    const f: Formulario = {
      ...base(),
      campos: ['a', 'b', 'c', 'd', 'e'].map((id): Campo => ({
        id, rotulo: id, tipo: 'texto-curto', obrigatorio: false, pessoal: false,
      })),
    };
    expect(f.campos.length).toBe(5);
    expect(tiposUsados(f)).toEqual(['texto-curto']);
  });

  it('três tipos diferentes contam três', () => {
    let f = base();
    f = comCampo(f, CAMPO_UNIDADE, c => ({ ...c, tipo: 'lista', opcoes: UNIDADES }));
    f = comCampo(f, CAMPO_DIARIAS, c => ({ ...c, tipo: 'numero' }));
    expect(tiposUsados(f).sort()).toEqual(['lista', 'numero', 'paragrafo', 'texto-curto']);
  });
});

describe('validação sem parâmetro não vale', () => {
  const casos: [string, Validacao | undefined, boolean][] = [
    ['sem validação nenhuma', undefined, false],
    ['e-mail, que não tem parâmetro', { tipo: 'email' }, true],
    ['telefone, que também não tem', { tipo: 'telefone' }, true],
    ['tamanho máximo em branco', { tipo: 'tamanho-maximo' }, false],
    ['tamanho máximo zero', { tipo: 'tamanho-maximo', max: 0 }, false],
    ['tamanho máximo escrito', { tipo: 'tamanho-maximo', max: 120 }, true],
    ['número entre, os dois em branco', { tipo: 'numero-entre' }, false],
    ['número entre, só o mínimo', { tipo: 'numero-entre', min: 1 }, false],
    ['número entre, só o máximo', { tipo: 'numero-entre', max: 3 }, false],
    ['número entre, invertido', { tipo: 'numero-entre', min: 3, max: 1 }, false],
    ['número entre, escrito', { tipo: 'numero-entre', min: 1, max: 3 }, true],
  ];
  it.each(casos)('%s', (_, v, esperado) => {
    expect(validacaoVale(v)).toBe(esperado);
  });

  it('e o campo com ela não entra na conta do requisito 4', () => {
    // `Number('')` é zero, então "entre 0 e 0" é uma regra que a tela desenha
    // ao lado do campo e que não recusa o que a lição quer que ela recuse.
    const f = comCampo(base(), CAMPO_DIARIAS, c => ({ ...c, validacao: { tipo: 'numero-entre' } }));
    expect(campoPorId(f, CAMPO_DIARIAS)!.validacao).toBeDefined();
    expect(camposComValidacao(f)).toEqual([]);
    expect(recusas(f, { [CAMPO_DIARIAS]: 'sete mil' })).toEqual([]);
  });
});

describe('quinze respostas reais não são quinze linhas', () => {
  it('envio vazio não conta', () => {
    const f = base();
    const vazia = f.respostas.find(r => f.campos.every(c => !valorDa(r, c.id)));
    expect(vazia).toBeDefined();
    expect(respostasReais(f).map(r => r.id)).not.toContain(vazia!.id);
  });

  it('o mesmo envio duas vezes conta uma', () => {
    const f = base();
    const paulas = f.respostas.filter(r => valorDa(r, CAMPO_NOME) === 'Paula Nogueira');
    expect(paulas.length).toBe(2);
    expect(respostasReais(f).filter(r => valorDa(r, CAMPO_NOME) === 'Paula Nogueira').length).toBe(1);
  });

  it('quinze envios idênticos são uma resposta', () => {
    const f: Formulario = {
      ...base(),
      respostas: Array.from({ length: 15 }, (_, i) => ({
        id: `x${i}`, em: '2026-06-01T10:00',
        valores: { [CAMPO_NOME]: 'Igual', [CAMPO_UNIDADE]: 'Falcão' },
      })),
    };
    expect(f.respostas.length).toBe(15);
    expect(respostasReais(f).length).toBe(1);
  });
});

describe('marcar obrigatório não preenche o que já chegou em branco', () => {
  it('as duas contas não se substituem', () => {
    const f = comObrigatorio(base(), CAMPO_EMAIL);
    // O formulário passa a recusar envio novo sem e-mail...
    expect(recusas(f, { [CAMPO_NOME]: 'Zé' })).toContain('E-mail do responsável: é obrigatório');
    expect(enviar(f, { [CAMPO_NOME]: 'Zé' })).toBeNull();
    // ...e as respostas guardadas continuam exatamente como estavam.
    expect(respostasReais(f).length).toBe(16);
    expect(respostasCompletas(f).length).toBe(14);
  });

  it('e conferir só uma delas deixa metade do defeito de pé', () => {
    const f = comObrigatorio(base(), CAMPO_EMAIL);
    expect(respostasReais(f).length).toBeGreaterThan(respostasCompletas(f).length);
  });

  it('espaço não preenche campo obrigatório', () => {
    // É a decisão do campo preenchido com espaço que a CC-ES004 já cobra no
    // comentário da liderança: sem ela, a barra de espaço fecha a tarefa.
    //
    // E são **todos** os brancos que viram espaço, e não um: com um só, o campo
    // continuaria em `camposComBranco` pelo outro, e a guarda do espaço não
    // teria caso nenhum exercitando-a — a trava passaria por acaso.
    let f = comObrigatorio(base(), CAMPO_EMAIL);
    const brancos = respostasReais(f).filter(r => !preenchido(r, CAMPO_EMAIL));
    expect(brancos.length).toBeGreaterThan(1);
    for (const r of brancos) f = comResposta(f, r.id, CAMPO_EMAIL, '   ');

    expect(respostasReais(f).every(r => valorDa(r, CAMPO_EMAIL) !== '')).toBe(true);
    expect(camposComBranco(f).map(c => c.id)).toContain(CAMPO_EMAIL);
  });
});

describe('a mesma coisa escrita de dois jeitos', () => {
  it('cai no mesmo grupo', () => {
    const f = base();
    const grupos = grafiasDe(f, CAMPO_UNIDADE);
    expect(grupos.get('falcao')).toEqual(['Falcão', 'falcao', 'FALCÃO', 'Falcao ']);
    // A quarta grafia é a que só difere por um espaço atrás, e ela sobrevive
    // porque `valorDa` não apara: aparar apagaria a inconsistência no motor.
    // Seis unidades no clube e seis grupos — e dez grafias na coluna, que é o
    // número de linhas que o resumo relataria. O total de respostas continua
    // certo, que é o que faz ninguém desconfiar.
    expect(grupos.size).toBe(UNIDADES.length);
    const grafiasNaColuna = new Set(
      respostasReais(f).map(r => valorDa(r, CAMPO_UNIDADE)).filter(v => v.trim()));
    expect(grafiasNaColuna.size).toBe(10);
  });

  it('e o espaço nas pontas, a caixa e o acento são o que se apaga para comparar', () => {
    expect(paraComparar(' FALCÃO ')).toBe('falcao');
    expect(paraComparar('Falcao')).toBe('falcao');
    expect(paraComparar('Águia')).toBe(paraComparar('aguia'));
    // E não apaga o conteúdo: duas unidades diferentes continuam diferentes.
    expect(paraComparar('Falcão')).not.toBe(paraComparar('Águia'));
  });

  it('texto livre não tem grafia dividida', () => {
    // Duas observações parecidas são duas pessoas escrevendo, e não uma
    // unidade escrita de dois jeitos. Comparar parágrafo acusaria o
    // desbravador de uma inconsistência que não existe.
    const f: Formulario = {
      ...base(),
      respostas: [
        { id: 'a', em: '2026-06-01T10:00', valores: { [CAMPO_OBSERVACAO]: 'Vegetariana' } },
        { id: 'b', em: '2026-06-01T11:00', valores: { [CAMPO_OBSERVACAO]: 'vegetariana' } },
      ],
    };
    expect(camposComGrafiaDividida(f)).toEqual([]);
  });
});

describe('a recusa', () => {
  const comEmail = () => comCampo(comObrigatorio(base(), CAMPO_EMAIL), CAMPO_EMAIL,
    c => ({ ...c, validacao: { tipo: 'email' } }));

  it('recusa o endereço sem arroba e aceita o com', () => {
    const f = comEmail();
    expect(recusas(f, { [CAMPO_EMAIL]: 'joana.silva' }).length).toBe(1);
    expect(recusas(f, { [CAMPO_EMAIL]: 'joana@exemplo.com' })).toEqual([]);
  });

  it('recusa o telefone sem formato', () => {
    const f = comCampo(base(), CAMPO_NOME, c => ({ ...c, validacao: { tipo: 'telefone' } }));
    expect(recusas(f, { [CAMPO_NOME]: '61999990000' }).length).toBe(1);
    expect(recusas(f, { [CAMPO_NOME]: '(61) 99999-0000' })).toEqual([]);
  });

  it('recusa o número fora da faixa, e a vírgula não é o que o derruba', () => {
    const f = comCampo(base(), CAMPO_DIARIAS,
      c => ({ ...c, tipo: 'numero', validacao: { tipo: 'numero-entre', min: 1, max: 3 } }));
    expect(recusas(f, { [CAMPO_DIARIAS]: '4' }).length).toBe(1);
    expect(recusas(f, { [CAMPO_DIARIAS]: '2' })).toEqual([]);
    // "1,5" é um número escrito em português, e a regra não é o lugar de
    // reclamar dele: quem paga pela vírgula é a soma da planilha, que é a
    // lição. Recusar aqui apagaria a inconsistência antes de ela existir.
    expect(recusas(f, { [CAMPO_DIARIAS]: '1,5' })).toEqual([]);
  });

  it('campo em branco não é recusado pela validação, só pelo obrigatório', () => {
    // Sem isto, um campo opcional com validação recusaria quem não respondeu —
    // e "opcional" deixaria de querer dizer opcional.
    const f = comCampo(base(), CAMPO_EMAIL, c => ({ ...c, validacao: { tipo: 'email' } }));
    expect(recusas(f, { [CAMPO_EMAIL]: '' })).toEqual([]);
  });

  it('formulário fechado não aceita envio', () => {
    const f: Formulario = { ...base(), aceitandoRespostas: false };
    expect(enviar(f, { [CAMPO_NOME]: 'Zé' })).toBeNull();
  });

  it('e o envio que passa entra na base', () => {
    const f = base();
    const depois = enviar(f, { [CAMPO_NOME]: 'Sara Vieira', [CAMPO_UNIDADE]: 'Onça' });
    expect(depois).not.toBeNull();
    expect(respostasReais(depois!).length).toBe(17);
  });
});

describe('a base de dados que sai para a planilha', () => {
  it('abre pela chave, que é o instante do envio', () => {
    const f = base();
    expect(cabecalhoDe(f)[0]).toBe('Enviado em');
    // Duas pessoas podem ter o mesmo nome; dois envios não têm o mesmo
    // instante. É o requisito 2.3.
    const instantes = new Set(respostasReais(f).map(r => r.em));
    expect(instantes.size).toBe(respostasReais(f).length);
  });

  it('e leva uma linha por resposta real, com uma coluna por campo', () => {
    const f = base();
    const linhas = linhasDe(f);
    expect(linhas.length).toBe(16);
    for (const l of linhas) expect(l.length).toBe(cabecalhoDe(f).length);
  });
});

describe('o CSV do requisito 5.4', () => {
  it('vai e volta inteiro', () => {
    const f = base();
    const texto = toCsv(cabecalhoDe(f), linhasDe(f));
    expect(fromCsv(texto)).toEqual([cabecalhoDe(f), ...linhasDe(f)]);
  });

  it('a célula que contém o separador sobrevive, e o split ingênuo não', () => {
    const celula = ['Alimentação', 'Transporte'].join(SEPARADOR_DE_ESCOLHAS);
    const texto = toCsv(['Nome', 'O que leva'], [['Ana', celula]]);
    expect(texto).toContain('"Alimentação; Transporte"');
    expect(fromCsv(texto)[1]).toEqual(['Ana', celula]);
    // É por isso que o leitor existe: a linha partida no separador sai com
    // três colunas onde há duas, e todas plausíveis.
    expect(texto.split('\r\n')[1].split(';').length).toBe(3);
  });

  it('a aspa no meio de célula não citada é literal', () => {
    // `5" de chuva` não abre citação nenhuma. Um leitor que a tratasse como
    // abertura engoliria o resto da linha.
    //
    // E o caso se escreve cru, sem passar pelo `toCsv`: ele cita toda célula
    // que contém aspa, então o ida-e-volta nunca chega neste ramo — a trava
    // passaria por acaso. Quem chega nele é o arquivo escrito à mão e o que
    // veio de outro programa, que é justamente o que o requisito 5.4 manda
    // abrir no editor de texto.
    expect(fromCsv('Obs\r\nchoveu 5" na sexta')).toEqual([['Obs'], ['choveu 5" na sexta']]);
    expect(fromCsv('a;b\r\n12" de chuva;Falcão')).toEqual([['a', 'b'], ['12" de chuva', 'Falcão']]);
  });

  it('a aspa que o Excel duplica volta como uma', () => {
    const texto = toCsv(['Obs'], [['disse "vou levar"; e levou']]);
    expect(texto).toContain('""vou levar""');
    expect(fromCsv(texto)[1]).toEqual(['disse "vou levar"; e levou']);
  });

  it('a última linha não se perde por não ter quebra atrás dela', () => {
    const texto = toCsv(['a', 'b'], [['1', '2'], ['3', '4']]);
    expect(texto.endsWith('\n')).toBe(false);
    expect(fromCsv(texto).length).toBe(3);
  });

  it('e o BOM não vira a primeira letra do cabeçalho', () => {
    // Sem isto a primeira coluna se chamaria U+FEFF seguido de "Enviado em",
    // que casa com nada: a importação ficaria com uma coluna a menos e nada
    // acusaria. O BOM sai da constante que o escritor usa, e não colado como
    // caractere literal — `csv.ts` explica por que: literal é invisível num
    // diff, e um formatador o tira sem ninguém perceber que ele foi embora.
    const f = base();
    const texto = toCsv(cabecalhoDe(f), linhasDe(f));
    expect(fromCsv(UTF8_BOM + texto)[0][0]).toBe('Enviado em');
  });
});

describe('a conta das inconsistências', () => {
  it('cai a cada conserto, e chega a zero', () => {
    let f = comObrigatorio(base(), CAMPO_EMAIL);
    f = comCampo(f, CAMPO_DIARIAS, c => ({ ...c, tipo: 'numero' }));
    const antes = inconsistencias(f);
    expect(antes).toBe(2 + 1 + 2);

    // Arruma a grafia da unidade em toda resposta.
    const certa = (v: string) => UNIDADES.find(u => paraComparar(u) === paraComparar(v)) ?? v;
    f = {
      ...f,
      respostas: f.respostas.map(r => ({
        ...r,
        valores: { ...r.valores, [CAMPO_UNIDADE]: certa(valorDa(r, CAMPO_UNIDADE)) },
      })),
    };
    expect(inconsistencias(f)).toBe(antes - 2);

    // Preenche os dois e-mails que faltavam e troca a vírgula pelo ponto.
    f = {
      ...f,
      respostas: f.respostas.map(r => ({
        ...r,
        valores: {
          ...r.valores,
          [CAMPO_EMAIL]: valorDa(r, CAMPO_EMAIL) || (valorDa(r, CAMPO_NOME) ? 'contato@exemplo.com' : ''),
          [CAMPO_DIARIAS]: valorDa(r, CAMPO_DIARIAS).replace(',', '.'),
        },
      })),
    };
    expect(inconsistencias(f)).toBe(0);
    // E arrumar não apagou ninguém: as quinze respostas continuam lá. Sem esta
    // conta, apagar as linhas esquisitas zeraria a lista de inconsistências e
    // deixaria a tarefa verde com onze respostas.
    expect(respostasReais(f).length).toBe(16);
    expect(respostasCompletas(f).length).toBe(16);
  });
});

describe('o requisito 7 mora no modelo e não na tela', () => {
  it('todo campo diz se o que ele coleta é pessoal', () => {
    const f = base();
    for (const c of f.campos) expect(typeof c.pessoal).toBe('boolean');
    // Guarda contra o vazio nos dois sentidos: um formulário em que nada é
    // pessoal, ou em que tudo é, não tem o que o requisito manda identificar.
    const pessoais = f.campos.filter(c => c.pessoal);
    expect(pessoais.length).toBeGreaterThan(0);
    expect(pessoais.length).toBeLessThan(f.campos.length);
  });
});
