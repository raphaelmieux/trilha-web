import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { parse } from 'opentype.js';
import { ARQUIVO_DA_FONTE, textoEmCaminho } from './textoEmCurvas';
import { ASSINATURA_DO_CLUBE } from './arteVetorial';
import { dDosContornos } from './vetor';
import { textos } from './design';
import { D_DO_NOME_DO_CLUBE } from './nomeDoClubeEmCurvas';

describe('o nome do clube gravado em curvas', () => {
  it('é o que a fonte de verdade desenha para o texto da prancha', () => {
    const b = readFileSync(`public/${ARQUIVO_DA_FONTE}`);
    const fonte = parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
    const nome = textos(ASSINATURA_DO_CLUBE)[0];
    expect(dDosContornos(textoEmCaminho(fonte, nome).contornos)).toBe(D_DO_NOME_DO_CLUBE);
  });
});
