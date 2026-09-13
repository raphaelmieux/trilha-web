import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import TokenNoCartao from './TokenNoCartao';
import { MARCAS } from '../../lib/marca';
import type { Certification } from '../../types';

/*
  O cartão que anuncia "Token.Web() emitido!" leva ao Token.Web().

  Não levava. O bloco era um `<div>` dentro do `<Link>` do cartão, então ele
  tinha cara de botão e fazia o que todo o resto do cartão faz: abrir a trilha.
  Quem via o aviso clicava nele esperando o documento, chegava na trilha, e só
  ali encontrava o botão de verdade, no cabeçalho. Dois cliques para o
  certificado, e o primeiro deles parecendo o certo — que é pior do que não ter
  botão nenhum, porque ensina que aquele caminho não funciona.

  Nada disso estoura: o clique navega, a tela troca, e só quem procurava o
  certificado percebe que chegou no lugar errado.
*/

const CERT: Certification = {
  id: 'c1',
  code: 'TW-9N9R-ZVIC-H4IM-3AKT',
  hash: 'h',
  level: 'basico',
  curriculum_code: 'AP034',
  curriculum_version: '1',
  status: 'active',
  issued_at: '2026-09-01T00:00:00Z',
  user_id: 'u1',
};

const desenhar = (cert: Certification) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <TokenNoCartao cert={cert} />
    </MemoryRouter>,
  );

describe('o Token.Web() no cartão', () => {
  const html = desenhar(CERT);

  it('leva ao certificado, e não ao percurso', () => {
    expect(html).toContain(`href="/certificado/${CERT.code}"`);
    expect(html, 'o cartão do percurso é o outro link; este é o do documento')
      .not.toContain('/especialidade/');
    expect(html).not.toContain('/vereda/');
  });

  /* Um `<a>` dentro de outro `<a>` é HTML inválido: o navegador desmancha o
     encaixe e decide sozinho o que o clique de dentro faz. É o mesmo defeito
     do `<button>` dentro de `<button>` que o laboratório de Configurações já
     teve, e a razão de o cartão ter deixado de ser um `<Link>` só. */
  it('é um link só, sem nada aninhado dentro dele', () => {
    expect(html.match(/<a\b/g)).toHaveLength(1);
  });

  it('escreve a marca do certificado, com os parênteses pintados', () => {
    expect(html).toContain(MARCAS.token.miolo);
    expect(html).toContain('marca-parenteses');
  });

  /* O código inteiro, e não os dezesseis primeiros caracteres com reticências:
     ele é o que a pessoa confere contra o papel, e meio código não confere
     nada. Quem não couber na linha é cortado pelo CSS, que devolve o resto ao
     passar o mouse. */
  it('mostra o código inteiro do documento', () => {
    expect(html).toContain(CERT.code);
    expect(html).not.toContain('...');
  });
});

/*
  E os cartões que o usam deixaram de ser um `<Link>` só.

  É a metade da correção que não cabe num teste de componente: o bloco pode
  estar certo e continuar sem funcionar se alguém voltar a embrulhar o cartão
  inteiro numa âncora. Aí o `<a>` de dentro fica aninhado, o HTML vira
  inválido, e o navegador decide sozinho o que o clique faz — de volta ao
  defeito, sem nada estourando.

  A trava lê os dois arquivos porque a trilha e a vereda têm o mesmo cartão, e
  a vereda ganhou o dela depois: um cartão consertado e o outro não é
  exatamente o estado que passou despercebido antes.
*/
const CARTOES = [
  'src/pages/DashboardPage.tsx',
  'src/components/SecaoDeVeredas.tsx',
];

describe('os cartões que mostram o Token.Web()', () => {
  const RAIZ = resolve(__dirname, '../../..');
  const fonte = (caminho: string) => readFileSync(resolve(RAIZ, caminho), 'utf8');

  it.each(CARTOES)('%s desenha o bloco do certificado', caminho => {
    expect(fonte(caminho)).toContain('<TokenNoCartao cert={cert} />');
  });

  /* `card ... block` era a assinatura do cartão-âncora: um `<Link>` com a
     classe do cartão, cobrindo tudo. O bloco do certificado dentro dele é o
     `<a>` aninhado que não pode existir. */
  it.each(CARTOES)('%s não volta a ser uma âncora em volta de tudo', caminho => {
    expect(fonte(caminho),
      'o cartão voltou a ser um `<Link>` inteiro — o bloco do certificado fica '
      + 'aninhado dentro dele, e o clique volta a abrir o percurso.',
    ).not.toMatch(/<Link[^>]*className="card[^"]*\bblock\b/);
  });
});
