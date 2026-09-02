import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validarScratch, IDS_DE_SCRATCH, type ProjetoSb3 } from './scratchValidator';
import { PROJETO_INICIAL } from '../labs/scratch/projetoInicial';

/*
  Este arquivo cobra as duas pontas de uma verificação, e as duas já falharam.

  A primeira é a regra da casa: laboratório que abre resolvido não ensina nada.
  A segunda é a que ninguém escreve, e foi a que pegou o defeito de verdade:
  **a verificação precisa poder passar**. Uma verificação impossível é invisível
  de dentro — o desbravador monta o jogo certo, a tarefa continua vermelha, e a
  mensagem manda fazer exatamente o que ele já fez.

  Por isso o segundo projeto não é escrito à mão aqui: é o sb3 que o editor do
  Scratch de verdade produziu, capturado depois de montar o jogo inteiro pelo
  VM. Fixture escrita à mão diria só o que eu acho que o formato é — e o defeito
  era justamente uma coisa que eu achava.
*/

const inicial = JSON.parse(PROJETO_INICIAL) as ProjetoSb3;
const jogoPronto = JSON.parse(
  readFileSync(join(__dirname, 'fixtures/jogoDoClube.sb3.json'), 'utf8')) as ProjetoSb3;

describe('o projeto de partida abre com tudo por fazer', () => {
  it('nenhuma das verificações vem verde', () => {
    for (const r of validarScratch(inicial, IDS_DE_SCRATCH)) {
      expect(r.passed, `"${r.label}" já vem satisfeita no modelo`).toBe(false);
    }
  });

  it('e o elenco está montado, que é o que se dá de graça', () => {
    expect(inicial.targets.map(t => t.name)).toEqual(['Stage', 'Gato', 'Maca']);
    /* Nenhum bloco em lugar nenhum: a lógica é o que se cobra. */
    for (const alvo of inicial.targets) {
      expect(Object.keys(alvo.blocks)).toHaveLength(0);
    }
  });
});

describe('um jogo montado no Scratch de verdade passa em todas', () => {
  it('as dez ficam verdes', () => {
    const reprovadas = validarScratch(jogoPronto, IDS_DE_SCRATCH)
      .filter(r => !r.passed)
      .map(r => `${r.id}: ${r.detail ?? ''}`);
    expect(reprovadas, 'verificação que não passa nem no jogo completo').toEqual([]);
  });

  /*
    O caso que custou a tarde: uma variável arrastada para dentro de um `>`
    aparece como bloco no editor e **some** ao serializar — o sb3 a comprime
    dentro do próprio input, como `[12, nome, id]`. Procurar o opcode
    `data_variable` reprovava todo projeto certo.
  */
  it('reconhece a variável comprimida dentro do operando', () => {
    const gato = jogoPronto.targets.find(t => t.name === 'Gato');
    const maior = Object.values(gato?.blocks ?? {})
      .find(b => !Array.isArray(b) && b.opcode === 'operator_gt');
    expect(maior, 'a fixture precisa ter a comparação').toBeTruthy();
    expect(JSON.stringify(maior)).toContain('[12,"placar"');

    const fim = validarScratch(jogoPronto, ['fimDeJogo'])[0];
    expect(fim.passed).toBe(true);
  });
});
