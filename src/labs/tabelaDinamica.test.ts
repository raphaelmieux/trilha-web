import { describe, expect, it } from 'vitest';
import { planilhaDe } from './cadernoDoClube';
import {
  type Caderno, type LinhaDoResumo, type TabelaDinamica,
  ROTULO_VAZIO, atualizarResumo, resumir, resumoEmDia,
} from './planilha';

/*
  A tabela dinâmica do requisito 5.3 da CC-ES008.

  Ela existe para mostrar o que o requisito 5.2 mandou consertar, e o que a
  torna uma lição em vez de um botão são duas coisas que erram calado:

  - ela **agrupa pelo que está escrito**, então as quatro grafias do Falcão
    saem como quatro linhas, com o total de respostas certo;
  - ela **guarda o que leu**, então consertar a origem não muda o resumo — e
    nada na tela avisa.

  A grade se declara aqui e a afirmação também, que é o contrário da divisão de
  `exemplosDePlanilha.test.ts`: lá a grade é do teste e a conta sai da lição,
  porque a lição é que precisava ser conferida. Aqui o que se confere é o motor.
*/

/** A aba de respostas, como ela chega do formulário. */
const respostas = () => planilhaDe('Respostas', [
  ['Enviado em', 'Nome', 'Unidade', 'Diárias'],
  ['2026-06-08T19:12', 'Ana Beatriz Lima', 'Falcão', '3'],
  ['2026-06-08T19:40', 'Bruno Costa', 'falcao', '3'],
  ['2026-06-08T20:05', 'Carla Menezes', 'Águia', '2'],
  ['2026-06-09T08:22', 'Daniel Rocha', 'FALCÃO', '3'],
  ['2026-06-09T09:01', 'Eduarda Pires', '', '3'],
  ['2026-06-09T12:47', 'Felipe Andrade', 'Arara', '1.5'],
  ['2026-06-10T14:20', 'João Pedro Alves', 'Falcao ', '3'],
]);

const COLUNA_DA_UNIDADE = 2;
const COLUNA_DAS_DIARIAS = 3;
const ULTIMA_LINHA = 7;

const resumoDe = (como: TabelaDinamica['valor']['como']): TabelaDinamica => ({
  em: { l: 0, c: 0 },
  origem: { planilha: 'Respostas', faixa: { l1: 0, c1: 0, l2: ULTIMA_LINHA, c2: 3 } },
  linha: COLUNA_DA_UNIDADE,
  valor: { coluna: COLUNA_DAS_DIARIAS, como },
  retrato: [],
});

const caderno = (p = respostas()): Caderno => ({ planilhas: [p], ativa: 0 });

const rotulos = (linhas: LinhaDoResumo[]) => linhas.map(l => l.rotulo);
const valor = (linhas: LinhaDoResumo[], rotulo: string) =>
  linhas.find(l => l.rotulo === rotulo)?.valor;

describe('o resumo agrupa pelo que está escrito', () => {
  it('as quatro grafias do Falcão saem como quatro linhas', () => {
    const linhas = resumir(respostas(), resumoDe('contagem'));
    expect(rotulos(linhas)).toEqual(
      ['Falcão', 'falcao', 'Águia', 'FALCÃO', ROTULO_VAZIO, 'Arara', 'Falcao ']);
    // Normalizar aqui consertaria o defeito por baixo, e o requisito 5.2
    // ficaria sem nada para consertar.
    expect(linhas.filter(l => l.rotulo.toLowerCase().startsWith('falc')).length).toBe(4);
  });

  it('e o total de respostas continua certo, que é o que engana', () => {
    const linhas = resumir(respostas(), resumoDe('contagem'));
    const total = linhas.reduce((s, l) => s + (l.valor ?? 0), 0);
    expect(total).toBe(ULTIMA_LINHA);
    expect(linhas.length).toBeGreaterThan(total / 2);
  });

  it('a célula em branco vira um grupo, e ele diz que está vazio', () => {
    // É o que o Excel escreve, e é o que denuncia o campo sem resposta a quem
    // olha o resumo. Pular a linha em branco a esconderia, e o total cairia
    // para seis sem nada explicando por quê.
    const linhas = resumir(respostas(), resumoDe('contagem'));
    expect(rotulos(linhas)).toContain(ROTULO_VAZIO);
    expect(valor(linhas, ROTULO_VAZIO)).toBe(1);
  });
});

describe('a soma pula o número guardado como texto', () => {
  it('como a SOMA pula, e o total sai plausível e menor', () => {
    const linhas = resumir(respostas(), resumoDe('soma'));
    // A Arara tem uma resposta, de 1.5 diária escrita com ponto: em planilha
    // pt-BR o separador é a vírgula, então aquilo é texto, a soma não o vê, e o
    // grupo aparece com zero. Zero diárias numa unidade que tem um inscrito é
    // exatamente o número que não estoura.
    expect(valor(linhas, 'Arara')).toBe(0);
    expect(valor(linhas, 'Falcão')).toBe(3);
    // E o total geral fica 1,5 menor do que a realidade.
    const total = linhas.reduce((s, l) => s + (l.valor ?? 0), 0);
    expect(total).toBe(17);
  });

  it('e a contagem conta a linha mesmo assim', () => {
    // As duas contas não se substituem: é o par CONT.NÚM / CONT.VALORES da
    // CC-ES003. A contagem diz que a Arara tem um inscrito e a soma diz que ele
    // não pediu diária nenhuma.
    const contagem = resumir(respostas(), resumoDe('contagem'));
    expect(valor(contagem, 'Arara')).toBe(1);
  });

  it('a média de um grupo sem número nenhum não é zero', () => {
    // Escrever zero afirmaria que a média é zero. É a decisão da contabilidade
    // do clube: contagem que falhou não pode parecer contagem zero.
    const linhas = resumir(respostas(), resumoDe('media'));
    expect(valor(linhas, 'Arara')).toBeNull();
    expect(valor(linhas, 'Falcão')).toBe(3);
  });
});

describe('o resumo guarda o que leu', () => {
  const comRetrato = (cad: Caderno, t: TabelaDinamica) =>
    ({ ...t, retrato: resumir(cad.planilhas[0], t) });

  /** Arruma a grafia da unidade em toda linha, que é o requisito 5.2. */
  const arrumada = () => {
    const p = respostas();
    const certo: Record<string, string> = {
      'falcao': 'Falcão', 'FALCÃO': 'Falcão', 'Falcao ': 'Falcão',
    };
    return planilhaDe('Respostas', p.celulas.map((linha, l) => linha.map((cel, c) => (
      l > 0 && c === COLUNA_DA_UNIDADE ? (certo[cel.texto] ?? cel.texto) : cel.texto
    ))));
  };

  it('consertar a origem não muda o resumo, e nada na tela avisa', () => {
    const antes = caderno();
    const t = comRetrato(antes, resumoDe('contagem'));
    expect(resumoEmDia(antes, t)).toBe(true);

    const depois = caderno(arrumada());
    // O retrato continua com sete linhas e quatro Falcões.
    expect(t.retrato.length).toBe(7);
    expect(resumoEmDia(depois, t)).toBe(false);
  });

  it('e Atualizar é o que o alcança', () => {
    const depois = caderno(arrumada());
    const t = atualizarResumo(depois, comRetrato(caderno(), resumoDe('contagem')));
    expect(resumoEmDia(depois, t)).toBe(true);
    expect(rotulos(t.retrato)).toEqual(['Falcão', 'Águia', ROTULO_VAZIO, 'Arara']);
    expect(valor(t.retrato, 'Falcão')).toBe(4);
  });

  it('conferir só a quantidade de linhas deixa o resumo velho passar por em dia', () => {
    // O caso que separa as duas contas: a coluna de número é corrigida, os
    // grupos continuam os mesmos, e só os totais mudam. Um `resumoEmDia` que
    // comparasse o tamanho diria que está em dia — com os números velhos na
    // tela, que é o defeito inteiro.
    const antes = caderno();
    const t = comRetrato(antes, resumoDe('soma'));

    const p = respostas();
    const semPonto = planilhaDe('Respostas', p.celulas.map((linha, l) => linha.map((cel, c) => (
      l > 0 && c === COLUNA_DAS_DIARIAS ? cel.texto.replace('.', ',') : cel.texto
    ))));
    const depois = caderno(semPonto);

    expect(resumir(semPonto, resumoDe('soma')).length).toBe(t.retrato.length);
    expect(rotulos(resumir(semPonto, resumoDe('soma')))).toEqual(rotulos(t.retrato));
    expect(resumoEmDia(depois, t)).toBe(false);
    expect(valor(atualizarResumo(depois, t).retrato, 'Arara')).toBe(1.5);
  });

  it('resumo cuja origem não existe nunca se diz em dia', () => {
    // Uma aba renomeada ou apagada deixaria o retrato de pé, com os números do
    // dia em que a planilha ainda se chamava daquilo.
    const t = comRetrato(caderno(), resumoDe('contagem'));
    const outro: Caderno = { planilhas: [planilhaDe('Conferir', [['a']])], ativa: 0 };
    expect(resumoEmDia(outro, t)).toBe(false);
    // E Atualizar não apaga o retrato do que não achou: apagar deixaria a tela
    // com um resumo vazio, que é indistinguível de um resumo de zero respostas.
    expect(atualizarResumo(outro, t).retrato).toEqual(t.retrato);
  });
});

describe('a faixa do resumo', () => {
  it('não conta o cabeçalho como resposta', () => {
    // Sem isto, "Unidade" viraria um grupo de uma linha e o total subiria um.
    const linhas = resumir(respostas(), resumoDe('contagem'));
    expect(rotulos(linhas)).not.toContain('Unidade');
  });

  it('aceita a faixa escrita de baixo para cima', () => {
    // A pessoa arrasta de baixo para cima e a faixa chega invertida. Sem
    // normalizar, o laço não roda nenhuma vez e o resumo abre vazio.
    const t: TabelaDinamica = {
      ...resumoDe('contagem'),
      origem: { planilha: 'Respostas', faixa: { l1: ULTIMA_LINHA, c1: 3, l2: 0, c2: 0 } },
    };
    expect(resumir(respostas(), t).length).toBe(7);
  });
});
