import { describe, it, expect } from 'vitest';
import { CSS_EXCEL } from './excel';
import { CSS_POWERPOINT } from './powerpoint';
import { CSS_WINDOWS } from './windows';
import { CSS_DA_NUVEM } from './nuvem';
import { CAMADA_DA_PLATAFORMA } from './camadas';

/*
  O menu de contexto fica acima da plataforma.

  No celular a bolha de tarefas ocupa a metade de baixo da tela, e o menu da
  célula ou da linha do Explorador abria atrás dela: os itens de cima à
  vista, Excluir e Propriedades escondidos. Nada estoura — o menu abre, e
  quem procura o item que falta conclui que ele não existe.

  A conta se faz na folha de cada programa, e não na constante: é a folha que
  o navegador lê, e um número escrito à mão numa delas voltaria a esconder o
  menu sem mudar a constante.
*/

const CASOS: [string, string, string][] = [
  ['Excel', CSS_EXCEL, '.pl-contexto'],
  ['Excel', CSS_EXCEL, '.pl-veu'],
  ['PowerPoint', CSS_POWERPOINT, '.pp-contexto'],
  ['PowerPoint', CSS_POWERPOINT, '.pp-veu'],
  ['Windows', CSS_WINDOWS, '.win-menu'],
  ['nuvem', CSS_DA_NUVEM, '.nv-menu'],
];

function camadaDe(css: string, seletor: string): number | null {
  const i = css.search(new RegExp(`${seletor.replace('.', '\\.')}\\s*\\{`));
  if (i < 0) return null;
  const bloco = css.slice(i, css.indexOf('}', i));
  const m = /z-index:\s*(\d+)/.exec(bloco);
  return m ? Number(m[1]) : null;
}

describe('o menu que acabou de abrir não fica atrás da bolha de tarefas', () => {
  it.each(CASOS)('%s: %s', (_programa, css, seletor) => {
    const z = camadaDe(css, seletor);
    expect(z, `${seletor} sem z-index na folha`).not.toBeNull();
    expect(z!).toBeGreaterThan(CAMADA_DA_PLATAFORMA);
  });
});
