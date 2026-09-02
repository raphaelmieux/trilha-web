import { describe, it, expect } from 'vitest';
import {
  validarPython, linhasDePrograma, mesmaSaida, IDS_DE_PYTHON,
  type ContextoDePython,
} from './pythonValidator';

const ctx = (p: Partial<ContextoDePython> = {}): ContextoDePython => ({
  codigo: '', achados: {}, erroDeAnalise: null, execucao: null, ...p,
});
const um = (c: ContextoDePython, id: string) => validarPython(c, [id])[0];

const rodou = (saida = '') => ({ saida, erro: null, semFim: false });

describe('rodar é uma verificação, e não um pressuposto', () => {
  it('não passa antes de o programa ter sido executado', () => {
    const r = um(ctx(), 'roda');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('ainda não foi executado');
  });

  it('não passa quando o programa parou com erro', () => {
    const r = um(ctx({ execucao: { saida: '', erro: 'NameError: ...', semFim: false } }), 'roda');
    expect(r.passed).toBe(false);
  });

  /* O laço sem fim tem explicação própria: o sintoma é o mesmo de um erro,
     e a causa é outra. */
  it('diz que foi o laço quando o programa não terminou', () => {
    const r = um(ctx({ execucao: { saida: '', erro: 'prazo', semFim: true } }), 'roda');
    expect(r.detail).toContain('while');
  });

  it('passa quando roda até o fim', () => {
    expect(um(ctx({ execucao: rodou('oi\n') }), 'roda').passed).toBe(true);
  });
});

describe('o que vem da árvore', () => {
  it('passa quando o ast encontrou, e reprova quando não', () => {
    expect(um(ctx({ achados: { lacoWhile: true } }), 'lacoWhile').passed).toBe(true);
    expect(um(ctx({ achados: { lacoWhile: false } }), 'lacoWhile').passed).toBe(false);
  });

  /*
    Sem árvore não há o que analisar, e a razão não é a estrutura faltando: é o
    código não compilar. Dizer "falta um while" a quem esqueceu os dois pontos
    manda procurar no lugar errado.
  */
  it('quando o código não compila, manda corrigir a sintaxe primeiro', () => {
    const r = um(ctx({ achados: {}, erroDeAnalise: "SyntaxError: expected ':'" }), 'lacoFor');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('erro de sintaxe');
  });
});

describe('as quarenta linhas', () => {
  it('não conta linha em branco nem linha só de comentário', () => {
    expect(linhasDePrograma('a = 1\n\n# comentário\nb = 2')).toBe(2);
    expect(linhasDePrograma('x = 1  # conta, tem código')).toBe(1);
    expect(linhasDePrograma('')).toBe(0);
  });

  it('quarenta comentários não fazem um programa de quarenta linhas', () => {
    const so = Array.from({ length: 60 }, (_, i) => `# linha ${i}`).join('\n');
    const r = um(ctx({ codigo: so }), 'quarentaLinhas');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('0 linhas');
  });

  it('passa com quarenta linhas de código', () => {
    const codigo = Array.from({ length: 40 }, (_, i) => `x${i} = ${i}`).join('\n');
    expect(um(ctx({ codigo }), 'quarentaLinhas').passed).toBe(true);
  });
});

describe('a saída esperada', () => {
  it('ignora espaço no fim da linha e linha em branco no fim', () => {
    expect(mesmaSaida('oi  \ntudo bem\n\n', 'oi\ntudo bem')).toBe(true);
    expect(mesmaSaida('oi\ntudo bem', 'oi\ntudo bom')).toBe(false);
  });

  it('não compara quando o laboratório não diz qual é', () => {
    const r = um(ctx({ execucao: rodou('oi\n') }), 'saidaEsperada');
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('não define');
  });

  it('reprova quando o programa parou com erro antes de escrever', () => {
    const r = um(ctx({
      saidaEsperada: 'oi',
      execucao: { saida: '', erro: 'ZeroDivisionError', semFim: false },
    }), 'saidaEsperada');
    expect(r.passed).toBe(false);
  });

  it('passa quando bate', () => {
    const c = ctx({ saidaEsperada: 'oi\n5', execucao: rodou('oi\n5\n') });
    expect(um(c, 'saidaEsperada').passed).toBe(true);
  });
});

describe('a lista de verificações', () => {
  it('id desconhecido reprova com o motivo escrito', () => {
    const r = validarPython(ctx(), ['naoExiste'])[0];
    expect(r.passed).toBe(false);
    expect(r.detail).toContain('desconhecida');
  });

  it('o programa vazio reprova em tudo', () => {
    const r = validarPython(ctx(), IDS_DE_PYTHON);
    expect(r.every(x => !x.passed)).toBe(true);
    expect(r).toHaveLength(IDS_DE_PYTHON.length);
  });

  it('toda verificação tem rótulo e dica', () => {
    for (const r of validarPython(ctx(), IDS_DE_PYTHON)) {
      expect(r.label.length, r.id).toBeGreaterThan(0);
      expect(r.hint.length, r.id).toBeGreaterThan(0);
    }
  });
});
