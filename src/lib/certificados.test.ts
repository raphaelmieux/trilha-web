import { describe, it, expect, vi, afterEach } from 'vitest';
import { existsSync } from 'node:fs';
import { getOpenSpecialties } from '../curriculum';
import { comoCertificadoVerificado, codigoDaArte, percursoDoCertificado } from './certificados';
import { VEREDAS } from '../curriculum/veredas';
import type { RetornoDe } from '../types';

type LinhaVerificada = RetornoDe<'verify_certificate'>[number];

const linha = (extra: Partial<LinhaVerificada> = {}): LinhaVerificada => ({
  code: 'TW-AP034-0001',
  hash: 'abc123',
  level: 'basico',
  curriculum_code: 'AP034',
  curriculum_version: '1.0',
  status: 'active',
  issued_at: '2026-08-24T00:00:00Z',
  full_name: 'Fulano de Tal',
  club: 'Clube Exemplo',
  ...extra,
});

afterEach(() => {
  vi.restoreAllMocks();
});

/*
  O certificado é o documento que o desbravador leva ao clube, e a tela pública
  de verificação é onde um estranho decide se ele vale. Estes testes travam para
  que lado a dúvida cai.
*/
describe('comoCertificadoVerificado', () => {
  it('deixa passar o que o banco garante pelo CHECK', () => {
    const c = comoCertificadoVerificado(linha({ level: 'avancado', status: 'active' }));
    expect(c.level).toBe('avancado');
    expect(c.status).toBe('active');
  });

  it('preserva o resto da linha sem mexer', () => {
    const c = comoCertificadoVerificado(linha());
    expect(c.code).toBe('TW-AP034-0001');
    expect(c.hash).toBe('abc123');
    expect(c.full_name).toBe('Fulano de Tal');
    expect(c.club).toBe('Clube Exemplo');
    expect(c.issued_at).toBe('2026-08-24T00:00:00Z');
  });

  /*
    A assimetria é o ponto. Exibir como válido um certificado cujo estado a
    plataforma não conseguiu ler é afirmar o que não se conferiu; exibir como
    revogado um que era válido é um erro que a pessoa reclama e alguém conserta.
  */
  it('status que a lista não conhece vira revogado, nunca ativo', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const desconhecido of ['pendente', 'ACTIVE', 'suspended', '']) {
      expect(comoCertificadoVerificado(linha({ status: desconhecido })).status).toBe('revoked');
    }
  });

  it('nível desconhecido cai no que reivindica menos', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(comoCertificadoVerificado(linha({ level: 'mestre' })).level).toBe('basico');
  });

  /* Sem aviso, um valor novo no banco entraria em produção sem ninguém notar. */
  it('avisa no console quando não reconhece o valor', () => {
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {});
    comoCertificadoVerificado(linha({ status: 'pendente' }));
    expect(aviso).toHaveBeenCalledOnce();
    expect(aviso.mock.calls[0][0]).toContain('pendente');
  });
});

describe('codigoDaArte', () => {
  it('usa a arte da própria trilha quando ela existe', () => {
    expect(codigoDaArte('AP041')).toBe('AP041');
  });

  /*
    A vereda também emite Token.Web(), e a arte dela mora na mesma pasta. Sem
    esta linha o certificado de uma vereda sairia vestido de Internet — o
    documento que a pessoa leva ao clube, com o fundo de outra coisa.
  */
  it('usa a arte da própria vereda', () => {
    for (const v of VEREDAS) expect(codigoDaArte(v.code)).toBe(v.code);
  });

  it('cai na AP034 para código que o currículo não conhece', () => {
    expect(codigoDaArte('AP099')).toBe('AP034');
  });
});

describe('percursoDoCertificado', () => {
  it('nomeia a trilha e diz que é trilha', () => {
    expect(percursoDoCertificado('AP041')).toEqual({
      nome: 'AP041 — Computação 1', tipo: 'trilha',
    });
  });

  /* A tela pública imprimia o código cru para uma vereda, e logo abaixo
     "Nível: Básico" — grau que vereda não tem. */
  it('nomeia a vereda e diz que é vereda', () => {
    expect(percursoDoCertificado('CC-FE001')).toEqual({
      nome: 'CC-FE001 — HTML', tipo: 'vereda',
    });
  });

  it('devolve o código cru para o que não reconhece, e assume nada', () => {
    expect(percursoDoCertificado('XX999')).toEqual({
      nome: 'XX999', tipo: 'desconhecido',
    });
  });
});

/*
  Toda trilha aberta tem a arte do certificado.

  `codigoDaArte` devolve o próprio código quando o currículo conhece a trilha, e
  é dele que a tela e o PDF montam o caminho do arquivo. Uma trilha aberta sem
  `public/assets/certificates/<CODE>.png` não quebra build, nem tipo, nem
  nenhum outro teste: ela produz um certificado com o fundo faltando, e quem
  descobre é a primeira pessoa que concluir a trilha inteira — no documento que
  ela leva ao clube.

  A AP042 chegou perto disso: a trilha ficou pronta antes da arte, e entre as
  duas houve uma janela em que só um teste como este teria avisado.

  A trilha em construção fica de fora de propósito: ela não emite certificado
  nenhum, e cobrar a arte antes de a trilha existir travaria o anúncio de uma
  especialidade que ainda não tem conteúdo.
*/
describe('a arte do certificado', () => {
  it('existe para toda trilha aberta', () => {
    const faltando = getOpenSpecialties()
      .map(e => codigoDaArte(e.code))
      .filter(codigo => !existsSync(`public/assets/certificates/${codigo}.png`));
    expect(faltando, `sem arte: ${faltando.join(', ')}`).toEqual([]);
  });
});
