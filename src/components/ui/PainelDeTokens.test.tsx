// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import PainelDeTokens from './PainelDeTokens';
import { getOpenSpecialties } from '../../curriculum';
import { veredasAbertas } from '../../curriculum/veredas';
import { nomeCompleto, type Certification } from '../../types';

/*
  O painel dos Token.Web(), que agora é um só.

  Eram dois — um no painel inicial e outro na estante —, e cada um tinha metade
  da razão: o de lá dava espaço a cada documento, o de cá dizia o nome certo e
  desenhava o emblema do percurso. Quem passava de uma tela para a outra
  encontrava o mesmo prêmio com duas caras, e a diferença não era decisão de
  ninguém: era o resultado de terem sido escritos em dias diferentes.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const trilha = getOpenSpecialties()[0];
const vereda = veredasAbertas()[0];

const token = (id: string, curriculum: string, status: Certification['status'] = 'active'): Certification => ({
  id,
  code: `TW-${id}`,
  hash: `hash-${id}`,
  level: 'basico',
  curriculum_code: curriculum,
  curriculum_version: '1',
  status,
  issued_at: '2026-03-14T12:00:00Z',
  user_id: 'u1',
});

let container: HTMLDivElement;
let root: Root;

const desenhar = (props: Parameters<typeof PainelDeTokens>[0]) => {
  act(() => {
    root.render(<MemoryRouter><PainelDeTokens {...props} /></MemoryRouter>);
  });
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('o painel dos Token.Web()', () => {
  /*
    O emblema do percurso, e não um troféu igual para todos.

    O painel inicial desenhava o mesmo ícone de medalha em toda linha: duas
    certificações lado a lado ficavam idênticas, e a única diferença entre
    elas era o texto. O emblema é a medalha que a pessoa clicou no cartão do
    percurso, e é por ele que ela reencontra o que conquistou.
  */
  it('mostra o emblema, o nome completo e o código de cada documento', () => {
    desenhar({ certifications: [token('a', trilha.code)] });

    const emblema = container.querySelector('img');
    expect(emblema?.getAttribute('alt'), 'a linha não traz o emblema do percurso')
      .toBe(`Emblema de ${trilha.code}`);
    expect(container.textContent).toContain(nomeCompleto(trilha));
    expect(container.textContent).toContain('TW-a');
  });

  /* Vereda emite o mesmo documento, e `percursoDoCertificado` responde pelos
     dois currículos: era `getSpecialty`, que só conhece trilha, e a linha de
     uma vereda saía escrita só com o código ao lado de "AP034 Internet". */
  it('nomeia a vereda como nomeia a trilha', () => {
    desenhar({ certifications: [token('b', vereda.code)] });

    expect(container.textContent).toContain(nomeCompleto(vereda));
    expect(container.textContent).not.toBe(vereda.code);
  });

  /* Cada documento é um link para ele — é o espaço que o painel inicial dava,
     e a razão de o cartão ser a fileira inteira e não só o nome. */
  it('leva ao documento, pela fileira inteira', () => {
    desenhar({ certifications: [token('c', trilha.code)] });

    const link = container.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/certificado/TW-c');
    expect(link?.textContent).toContain(nomeCompleto(trilha));
  });

  /*
    Revogado não aparece.

    A estante já filtrava e o painel inicial não: um Token.Web() revogado era
    listado ali como conquista, o que desfaz na tela a decisão que a liderança
    tomou — sem erro nenhum, e sem ninguém saber. Quem quer ver o revogado abre
    o documento, que é onde a revogação está escrita.
  */
  it('não exibe como conquista o documento revogado', () => {
    desenhar({ certifications: [token('d', trilha.code, 'revoked')] });

    expect(container.querySelector('a'), 'o revogado virou linha no painel').toBeNull();
    expect(container.textContent).toContain('O primeiro sai sozinho');
  });

  /* O convite vale nas duas telas: quem não tem nenhum é justamente quem
     precisa saber que o prêmio existe e de onde ele vem. */
  it('convida quem ainda não tem nenhum', () => {
    desenhar({ certifications: [] });

    expect(container.textContent).toContain('concluir uma trilha ou uma vereda inteira');
  });

  /*
    Carregando não é vazio.

    São duas respostas diferentes — "ainda não sei" e "não há nenhum" —, e
    dar a segunda no lugar da primeira diz a quem tem certificado que ele não
    tem, por um instante, toda vez que a tela abre.
  */
  it('diz que está procurando, em vez de dizer que não há nenhum', () => {
    desenhar({ certifications: [], carregando: true });

    expect(container.textContent).toContain('Procurando');
    expect(container.textContent).not.toContain('O primeiro sai sozinho');
  });
});

/*
  E as duas telas mostram este painel, e não cada uma o seu.

  A redundância é o ponto: o Token.Web() é o prêmio maior, e obrigar alguém a
  lembrar em qual das duas telas ele mora é cobrar esforço para achar o que já
  foi conquistado. O que essa trava impede é o desvio que já aconteceu uma vez
  — alguém escrever de novo a lista numa das telas, e as duas voltarem a
  divergir no primeiro ajuste.
*/
describe('as duas telas usam o mesmo painel', () => {
  const PAGINAS = ['DashboardPage.tsx', 'EstantePage.tsx'];

  it.each(PAGINAS)('%s desenha o painel compartilhado', pagina => {
    const fonte = readFileSync(resolve(__dirname, '../../pages', pagina), 'utf8');
    expect(fonte, `${pagina} não importa PainelDeTokens`).toContain("from '../components/ui/PainelDeTokens'");
    expect(fonte, `${pagina} não desenha PainelDeTokens`).toContain('<PainelDeTokens');
  });

  it.each(PAGINAS)('%s não monta uma segunda lista de certificados', pagina => {
    const fonte = readFileSync(resolve(__dirname, '../../pages', pagina), 'utf8');
    /* `certifications.map` e `tokens.map` eram como as duas listas nasciam.
       Quem precisar contar continua podendo — o que não pode é desenhar. */
    expect(fonte.match(/\b(certifications|tokens)\.map\(/), `${pagina} voltou a desenhar a própria lista`)
      .toBeNull();
  });
});
