import { describe, it, expect } from 'vitest';
import { normalizar, distancia, respostaConfere } from './respostaTexto';

describe('normalizar', () => {
  it('tira acento, caixa e pontuação', () => {
    expect(normalizar('  Roteador. ')).toBe('roteador');
    expect(normalizar('ANTIVÍRUS')).toBe('antivirus');
    expect(normalizar('Tim  Berners-Lee')).toBe('tim berners-lee');
  });
});

describe('distancia', () => {
  it('conta trocas, inserções e remoções', () => {
    expect(distancia('roteador', 'roteador')).toBe(0);
    expect(distancia('rotedor', 'roteador')).toBe(1);
    expect(distancia('gato', 'rato')).toBe(1);
    expect(distancia('', 'abc')).toBe(3);
  });
});

describe('respostaConfere', () => {
  it('aceita a resposta exata', () => {
    expect(respostaConfere('roteador', 'roteador')).toBe(true);
  });

  it('aceita acento faltando e pontuação sobrando', () => {
    expect(respostaConfere('antivirus', 'antivírus')).toBe(true);
    expect(respostaConfere('Roteador.', 'roteador')).toBe(true);
    expect(respostaConfere('  ISP  ', 'ISP')).toBe(true);
  });

  it('aceita plural onde o gabarito está no singular, e vice-versa', () => {
    expect(respostaConfere('roteadores', 'roteador')).toBe(true);
    expect(respostaConfere('pacote', 'pacotes')).toBe(true);
  });

  it('perdoa um deslize de digitação em palavra longa', () => {
    expect(respostaConfere('rotedor', 'roteador')).toBe(true);
    expect(respostaConfere('phishng', 'phishing')).toBe(true);
  });

  /*
    A folga não pode existir em resposta curta: a questão sobre portas pergunta
    exatamente a diferença entre 80 e 443, e uma tolerância de um caractere
    transformaria a questão em sorteio.
  */
  it('não perdoa nada em resposta curta', () => {
    expect(respostaConfere('90', '80')).toBe(false);
    expect(respostaConfere('80', '80')).toBe(true);
    expect(respostaConfere('442', '443')).toBe(false);
    expect(respostaConfere('HTM', 'HTML')).toBe(false);
  });

  it('continua recusando outro conceito', () => {
    expect(respostaConfere('switch', 'roteador')).toBe(false);
    expect(respostaConfere('upload', 'download')).toBe(false);
    expect(respostaConfere('verde', 'vermelho')).toBe(false);
  });

  it('aceita os sinônimos declarados na questão', () => {
    expect(respostaConfere('provedor', 'ISP', ['provedor', 'provedor de acesso'])).toBe(true);
    expect(respostaConfere('provedor de acesso', 'ISP', ['provedor', 'provedor de acesso'])).toBe(true);
    expect(respostaConfere('operadora', 'ISP', ['provedor'])).toBe(false);
  });

  it('recusa resposta vazia', () => {
    expect(respostaConfere('', 'roteador')).toBe(false);
    expect(respostaConfere('   ', 'roteador')).toBe(false);
  });
});
