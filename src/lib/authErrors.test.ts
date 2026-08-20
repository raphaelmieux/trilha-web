import { describe, it, expect } from 'vitest';
import { traduzirErroDeAuth } from './authErrors';

describe('traduzirErroDeAuth', () => {
  it('explica o limite de e-mails sem culpar quem se cadastra', () => {
    const t = traduzirErroDeAuth('email rate limit exceeded');
    expect(t).toContain('limite');
    expect(t).toContain('Não é erro seu');
    expect(t).not.toMatch(/rate limit/i);
  });

  it('manda entrar, e não recadastrar, quando o e-mail já existe', () => {
    const t = traduzirErroDeAuth('User already registered');
    expect(t).toContain('Já existe uma conta');
    expect(t).toContain('Esqueceu a senha');
  });

  it('cita o tamanho mínimo que o servidor exigiu', () => {
    expect(traduzirErroDeAuth('Password should be at least 8 characters'))
      .toContain('8 caracteres');
  });

  it('não deixa nenhum caso conhecido escapar em inglês', () => {
    const conhecidos = [
      'email rate limit exceeded',
      'User already registered',
      'Invalid login credentials',
      'Email not confirmed',
      'Weak password',
      'Unable to validate email address: invalid format',
      'Signups not allowed for this instance',
      'Failed to fetch',
    ];
    for (const m of conhecidos) {
      expect(traduzirErroDeAuth(m), m).not.toContain(m);
    }
  });

  it('preserva o texto original quando não conhece o erro', () => {
    const t = traduzirErroDeAuth('some brand new gotrue failure');
    expect(t).toContain('some brand new gotrue failure');
  });

  it('aguenta mensagem vazia ou ausente', () => {
    expect(traduzirErroDeAuth(undefined)).toBeTruthy();
    expect(traduzirErroDeAuth('')).toBeTruthy();
    expect(traduzirErroDeAuth(null)).toBeTruthy();
  });
});
