import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { getAllSpecialties } from '../curriculum';
import { VEREDAS } from '../curriculum/veredas';
import { caminhoDosRequisitos, urlDosRequisitos } from './requisitosEmPdf';

/*
  Todo percurso tem o documento dele no repositório, com o nome que a tela usa.

  O caminho sai de `code` + `name`, sem tabela de-para, então esta trava amarra
  duas coisas que precisam concordar: o nome que o cartão mostra e o nome do
  arquivo oficial. Foi ela que pegou "AP049 Desenvolvimento de Sistemas" — a
  folha diz "de Software" —, "AP064 Web Designer Avançado" sem a vírgula que o
  documento usa, e "CC004 Python Avançado" pelo mesmo motivo.

  Sem a trava, nada disso quebra: o botão vira um 404 que só aparece para quem
  clica, e o nome errado segue impresso no certificado.
*/
describe('o documento de requisitos de cada percurso', () => {
  for (const s of getAllSpecialties()) {
    it(`${s.code} tem o PDF com o nome que a tela mostra`, () => {
      expect(existsSync(`public/${caminhoDosRequisitos(s)}`)).toBe(true);
    });
  }
  for (const v of VEREDAS) {
    it(`${v.code} tem o PDF com o nome que a tela mostra`, () => {
      expect(existsSync(`public/${caminhoDosRequisitos(v)}`)).toBe(true);
    });
  }
});

describe('urlDosRequisitos', () => {
  /* Espaço, vírgula e acento vão para o endereço; a barra da pasta, não. */
  it('codifica o que precisa e preserva as barras', () => {
    const url = urlDosRequisitos({ code: 'AP035', name: 'Internet, Avançado' });
    expect(url).toContain('curriculum%20files/');
    expect(url).toContain('AP035%20Internet,%20Avan%C3%A7ado.pdf');
  });
});
