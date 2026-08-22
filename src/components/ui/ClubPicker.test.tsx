import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ClubPicker, { type ClubeEscolhido } from './ClubPicker';

/*
  O clube salvo sumia da tela de perfil.

  A cascata é estado → cidade → clube, e nada disso é reconstruível a partir do
  que o perfil guarda: o nome, o código, a cidade e a associação estão lá, mas a
  UF nunca foi gravada. As três caixas abriam vazias, e quem tinha clube via uma
  tela que dizia o contrário.

  E havia o estrago: mexer no primeiro select chamava onChange com o clube em
  branco, então bastava abrir o seletor de estado por curiosidade para perder o
  que estava salvo.

  Renderizado no servidor de propósito: os efeitos não rodam, o que prova que o
  resumo aparece sem depender de nenhuma consulta à lista oficial.
*/

const semNada: ClubeEscolhido = { nome: '', codigo: null, cidade: null, associacao: null };
const oficial: ClubeEscolhido = {
  nome: 'Olho de Tigre', codigo: '4321', cidade: 'Brasília', associacao: 'Associação Planalto Central',
};
const naMao: ClubeEscolhido = { nome: 'Clube Novo', codigo: null, cidade: null, associacao: null };

const desenhar = (valor: ClubeEscolhido) =>
  renderToStaticMarkup(<ClubPicker valor={valor} onChange={() => {}} />);

describe('com um clube já escolhido', () => {
  const html = desenhar(oficial);

  it('mostra o clube, e não caixas vazias', () => {
    expect(html).toContain('Olho de Tigre');
  });

  it('mostra a cidade e a associação', () => {
    expect(html).toContain('Brasília');
    expect(html).toContain('Associação Planalto Central');
  });

  it('diz que veio da lista oficial', () => {
    expect(html).toContain('Confirmado na lista oficial');
  });

  /* A trava contra o estrago: sem selects na tela, não há como zerar o clube
     por engano — a cascata só aparece depois de pedir para trocar. */
  it('não desenha a cascata antes de pedirem para trocar', () => {
    expect(html).not.toContain('<select');
  });

  it('oferece trocar', () => {
    expect(html).toContain('Trocar');
  });
});

describe('com um clube digitado à mão', () => {
  const html = desenhar(naMao);

  it('mostra o nome digitado', () => {
    expect(html).toContain('Clube Novo');
  });

  /* Quem digitou à mão precisa saber que o registro não foi validado: é isso
     que a tela do administrador usa para separar um clube conferido de um não. */
  it('avisa que não passou pela lista oficial', () => {
    expect(html).toContain('Digitado à mão');
    expect(html).not.toContain('Confirmado na lista oficial');
  });
});

describe('sem clube nenhum', () => {
  const html = desenhar(semNada);

  it('abre direto na escolha, que é o que falta fazer', () => {
    expect(html).toContain('<select');
  });

  it('não inventa um resumo vazio', () => {
    expect(html).not.toContain('Confirmado na lista oficial');
    expect(html).not.toContain('Digitado à mão');
  });
});
