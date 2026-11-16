import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { montarSecaoDoMe006, notaDeAnexo, ESPECIALIDADES_DO_ME006 } from './relatorioDoMestrado';
import { TRILHAS_DO_ME006 } from './mestrados';
import { getSpecialty } from '../curriculum';
import type { Certification } from '../types';

/*
  O certificado do ME006 era emitido e ficava fora do relatório entregue ao
  clube — e é o Mestrado que a liderança precisa registrar. Anexá-lo sem dizer
  com base em quê levantaria a pergunta que a seção existe para responder.
*/

let seq = 0;
const cert = (curriculum_code: string, issued_at: string, status = 'active'): Certification => ({
  id: `c${++seq}`, code: `TW-${curriculum_code}`, hash: 'h', level: 'basico',
  curriculum_code, curriculum_version: '1.0',
  status, issued_at, user_id: 'u1',
} as unknown as Certification);

const setes = ['AP034', 'AP035', 'AP041', 'AP042', 'AP043', 'AP044', 'AP045']
  .map((c, i) => cert(c, `2026-0${i + 1}-10T12:00:00Z`));
const me006 = cert('ME006', '2026-09-01T12:00:00Z');

describe('a seção do ME006', () => {
  it('só existe com certificado ativo do Mestrado', () => {
    expect(montarSecaoDoMe006(setes, 'Ana')).toBeNull();
    expect(montarSecaoDoMe006([...setes, cert('ME006', '2026-09-01T12:00:00Z', 'revoked')], 'Ana')).toBeNull();
    expect(montarSecaoDoMe006([...setes, me006], 'Ana')?.certificado).toBe(me006);
  });

  it('diz o que o documento oficial pede, por que foi emitido e o que não confere', () => {
    const s = montarSecaoDoMe006([...setes, me006], 'Ana')!;
    const texto = s.paragrafos.join(' ');
    expect(s.titulo).toBe('ME006 Mestrado em Ciência e Tecnologia');
    expect(texto).toContain('sete das 20 especialidades');
    expect(texto).toContain('TW-ME006');
    // As sete que sustentam, pelo nome completo e pelo código do Token.Web() de cada uma.
    for (const c of setes) {
      expect(texto).toContain(getSpecialty(c.curriculum_code)!.name);
      expect(texto).toContain(c.code);
    }
    // As que a plataforma não tem são nomeadas como fora da conta.
    expect(texto).toMatch(/Física/);
    expect(texto).toMatch(/Química/);
    expect(texto).toContain('liderança do clube');
  });

  /* Certificado revogado de trilha não sustenta o Mestrado: o servidor só
     aceitou ativos, e citar o revogado afirmaria o que ele não aceitou. */
  it('não cita trilha com certificado revogado, e não se contradiz ficando abaixo do mínimo', () => {
    const comRevogado = setes.map((c, i) => i === 0 ? { ...c, status: 'revoked' } as Certification : c);
    const texto = montarSecaoDoMe006([...comRevogado, me006], 'Ana')!.paragrafos.join(' ');
    expect(texto).not.toContain('TW-AP034');
    expect(texto).toContain('na data da emissão');
    expect(texto).not.toMatch(/concluiu nesta plataforma seis/);
  });

  it('não chama de "da lista" uma trilha que não está nela', () => {
    const texto = montarSecaoDoMe006([...setes, cert('HM079', '2026-08-01T12:00:00Z'), me006], 'Ana')!.paragrafos.join(' ');
    expect(texto).not.toContain('TW-HM079');
  });
});

describe('a lista oficial', () => {
  /* A lista do texto e a do aplicativo se conferem pelo nome: uma trilha
     renomeada no registro passaria a contar como "não oferecida aqui". */
  it('contém toda trilha que conta para o ME006, pelo nome do registro', () => {
    for (const code of TRILHAS_DO_ME006) {
      expect(ESPECIALIDADES_DO_ME006, code).toContain(getSpecialty(code)?.name);
    }
  });

  it('é a do documento oficial', () => {
    const pdf = resolve(__dirname, '../../public/curriculum files/ME006 Mestrado em Ciência e Tecnologia.pdf');
    let texto: string;
    try {
      texto = execFileSync('pdftotext', [pdf, '-'], { encoding: 'utf8' });
    } catch {
      // Sem pdftotext na máquina, confere ao menos que o arquivo existe.
      expect(readFileSync(pdf).length).toBeGreaterThan(0);
      return;
    }
    const doDocumento = [...texto.matchAll(/^1\.\d+ (.+?);?\.?$/gm)].map(m => m[1].replace(/[;.]$/, ''));
    expect(doDocumento).toEqual([...ESPECIALIDADES_DO_ME006]);
  });
});

describe('a nota de anexo', () => {
  it('conta o Mestrado junto das trilhas, em frase curta para a capa', () => {
    expect(notaDeAnexo(0, false)).toBeUndefined();
    expect(notaDeAnexo(1, false)).toBe('Segue anexo o certificado Token.Web() referente à trilha concluída.');
    expect(notaDeAnexo(0, true)).toContain('ME006');
    expect(notaDeAnexo(7, true)).toBe('Seguem anexos 8 certificados Token.Web(): 7 de trilhas e o do ME006.');
    expect(notaDeAnexo(1, true)).toBe('Seguem anexos 2 certificados Token.Web(): o da trilha concluída e o do ME006.');
  });
});
