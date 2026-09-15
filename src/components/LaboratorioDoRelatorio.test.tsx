// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDoRelatorio from './LaboratorioDoRelatorio';
import LaboratorioDeWord from './LaboratorioDeWord';
import LaboratorioDaCircular from './LaboratorioDaCircular';
import { VEREDAS, licoesDaVereda } from '../curriculum/veredas';
import { INSCRITA_QUE_FALTA, FOTO_DA_FOGUEIRA } from '../labs/relatorioDoAcampamento';
import { CSS_FOLHA } from '../labs/word';

/*
  O relatório do módulo 3, percorrido clicando.

  `relatorioDoAcampamento.test.ts` prova que as seis metas podem ficar verdes.
  Isto pergunta a outra metade: **a janela chama alguma delas?** Um botão sem
  onClick, um menu que não abre, uma célula em que não se digita — as metas
  continuam certas e o laboratório fica impossível de vencer, que é pior do que
  um que abre resolvido. É a mesma trava que os dois Exploradores têm.

  E há duas perguntas que só este módulo faz:

  - **a guia contextual some quando o cursor sai?** A teoria diz que sim e diz
    que isso não é defeito. Desenhá-la sempre contradiria a lição na tela.
  - **a legenda de campo se vê como campo?** O número dela muda sozinho, e se a
    folha desenhasse o texto cru as duas legendas ficariam idênticas — a
    diferença inteira do requisito 4.3 seria invisível.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const VEREDA = VEREDAS.find(v => v.code === 'CC-ES002')!;
const licaoDeWord = (id: string) => {
  const l = licoesDaVereda(VEREDA).find(x => x.id === id);
  if (!l || l.tipo !== 'word') throw new Error(`${id} não é uma lição de Word`);
  return l;
};

let container: HTMLDivElement;
let root: Root;
let venceu = false;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  venceu = false;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const montar = () => {
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDoRelatorio
          vereda={VEREDA} licao={licaoDeWord('m3-lab')}
          aoVencer={() => { venceu = true; }}
          aoSair={() => {}}
        />
      </MemoryRouter>,
    );
  });
};

/* ── Ajudas de clique ──────────────────────────────────────────────────────── */

const clicar = (e: Element | null | undefined, nome: string) => {
  expect(e, `não achei "${nome}" na tela`).toBeTruthy();
  act(() => { (e as HTMLElement).click(); });
};

const bloco = (id: string) => container.querySelector(`[data-bloco="${id}"]`);

const comando = (dica: string) =>
  [...container.querySelectorAll('button')].find(b => b.getAttribute('title') === dica);

const guia = (nome: string) =>
  [...container.querySelectorAll('.wd-guia')].find(b => b.textContent?.trim() === nome);

const guias = () => [...container.querySelectorAll('.wd-guia')].map(b => b.textContent?.trim());

const itemDeMenu = (texto: string) =>
  [...container.querySelectorAll('.wd-menu-item')].find(b => b.textContent?.trim() === texto);

const tabela = () => container.querySelector('table.wd-tabela');

const celula = (linha: number, coluna: number) =>
  container.querySelector(`[data-celula="${linha}-${coluna}"]`);

const campoDaCelula = (linha: number, coluna: number) =>
  celula(linha, coluna)?.querySelector('input') as HTMLInputElement | undefined;

/** Escreve numa célula como o desbravador escreveria. */
const escreverNaCelula = (linha: number, coluna: number, texto: string) => {
  const campo = campoDaCelula(linha, coluna);
  expect(campo, `não achei a célula ${linha}-${coluna}`).toBeTruthy();
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(campo, texto);
    campo!.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const legendas = () => [...container.querySelectorAll('[data-estilo="Legenda"]')];

/** O que cada legenda mostra na folha, com o campo já resolvido. */
const textoDasLegendas = () => legendas().map(p => p.textContent?.trim());

const campos = () => [...container.querySelectorAll('[data-campo="figura"]')];

const botaoDeConcluir = () =>
  [...container.querySelectorAll('button')]
    .find(b => /Concluir a lição|Faltam/.test(b.textContent ?? ''));

const podeConcluir = () => {
  const b = botaoDeConcluir();
  expect(b, 'o botão de concluir sumiu da cápsula').toBeTruthy();
  return !(b as HTMLButtonElement).disabled;
};

const oQueFalta = () =>
  [...container.querySelectorAll('aside p')].map(p => p.textContent?.trim()).join(' | ');

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('o relatório abre por completar', () => {
  it('o botão de concluir nasce desabilitado', () => {
    montar();
    expect(podeConcluir(), 'a lição abriu resolvida').toBe(false);
  });

  it('a lista chega alinhada com tabulação, e não como tabela', () => {
    montar();
    expect(tabela(), 'a lista já chegou convertida').toBeNull();
    const naFolha = [...container.querySelectorAll('[data-bloco^="lista-"]')]
      .map(p => p.textContent ?? '');
    expect(naFolha.length).toBeGreaterThan(1);
    expect(naFolha.every(t => t.includes('\t')),
      'a lista não está alinhada com tabulação — não haveria defeito a ver').toBe(true);
  });

  it('a lista sai com a tabulação preservada, e não colapsada num espaço', () => {
    /*
      Esta trava existe porque o navegador disse uma coisa que o jsdom não
      sabe dizer. O `\t` continua no `textContent` de qualquer jeito — a trava
      de cima passava — e mesmo assim a lista saía **reta** na folha, porque o
      HTML colapsa tabulação em espaço quando o `white-space` é `normal`. O
      defeito visível do documento simplesmente não aparecia, e a lição virava
      "converta porque a tarefa mandou".

      Então são duas metades: a classe chega ao parágrafo, e a regra que a
      classe invoca preserva a tabulação. Uma sem a outra não vale nada.
    */
    montar();
    const comTab = [...container.querySelectorAll('[data-bloco^="lista-"] span[data-trecho]')];
    expect(comTab.length).toBeGreaterThan(1);
    expect(comTab.every(e => e.classList.contains('wd-tab')),
      'a linha alinhada com Tab saiu sem a classe que preserva a tabulação').toBe(true);

    const regra = CSS_FOLHA.match(/\.wd-tab\s*\{([^}]*)\}/);
    expect(regra, 'a regra .wd-tab sumiu da folha').toBeTruthy();
    expect(regra![1], 'o white-space da regra não preserva a tabulação')
      .toMatch(/white-space:\s*(pre|pre-wrap|break-spaces)\s*;/);
    expect(regra![1], 'sem tab-size a parada vira a do navegador, e o defeito muda de lugar')
      .toMatch(/tab-size:\s*\d+/);
  });

  it('a única legenda que existe foi digitada, e não é campo', () => {
    montar();
    expect(legendas()).toHaveLength(1);
    expect(campos(), 'a legenda chegou como campo — a lição não teria o que mostrar')
      .toHaveLength(0);
    expect(textoDasLegendas()[0]).toContain('Figura 1');
  });
});

describe('as guias contextuais existem enquanto o cursor as convoca', () => {
  it('sem seleção, nem tabela nem imagem aparecem na fileira', () => {
    montar();
    expect(guias()).not.toContain('Layout da Tabela');
    expect(guias()).not.toContain('Formato da Imagem');
  });

  it('clicar na tabela traz as duas guias dela, e sair leva as duas embora', () => {
    /*
      A teoria escreve: "se a guia de Layout sumiu, o cursor saiu da tabela —
      não é um defeito do programa, é a guia contextual fazendo o que ela faz".
      Uma janela que as desenhasse sempre desmentiria a lição na própria tela.
    */
    montar();
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Tabela'), 'Tabela');
    clicar(itemDeMenu('Converter Texto em Tabela…'), 'Converter Texto em Tabela');

    expect(guias()).toContain('Layout da Tabela');
    expect(guias()).toContain('Design da Tabela');

    clicar(bloco('titulo'), 'o título do relatório');
    expect(guias(), 'as guias da tabela continuaram na fileira com o cursor fora dela')
      .not.toContain('Layout da Tabela');
  });
});

describe('o relatório pode ser vencido clicando', () => {
  it('converter, formatar, mexer nas linhas, inserir, dispor e legendar', () => {
    montar();

    /* 1. Converter a lista alinhada com Tab numa tabela. */
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Tabela'), 'Tabela');
    clicar(itemDeMenu('Converter Texto em Tabela…'), 'Converter Texto em Tabela');
    expect(tabela(), 'a conversão não produziu tabela nenhuma').toBeTruthy();

    /* 2. Formatar: cabeçalho marcado e um estilo da galeria. */
    clicar(guia('Layout da Tabela'), 'a guia Layout da Tabela');
    clicar(comando('Linha de Cabeçalho'), 'Linha de Cabeçalho');
    expect(tabela()?.getAttribute('data-cabecalho')).toBe('sim');

    clicar(guia('Design da Tabela'), 'a guia Design da Tabela');
    clicar([...container.querySelectorAll('.wt-estilo')]
      .find(b => b.textContent?.includes('Grade 4')), 'o estilo Grade 4');

    /* 3. Acrescentar a linha que faltava e tirar a coluna do pagamento. */
    clicar(guia('Layout da Tabela'), 'a guia Layout da Tabela');
    const antes = tabela()!.querySelectorAll('tr').length;
    clicar(comando('Inserir Abaixo'), 'Inserir Abaixo');
    expect(tabela()!.querySelectorAll('tr').length,
      'Inserir Abaixo não acrescentou linha').toBe(antes + 1);

    escreverNaCelula(antes, 0, INSCRITA_QUE_FALTA[0]);
    escreverNaCelula(antes, 1, INSCRITA_QUE_FALTA[1]);

    /* O cursor precisa estar na coluna a tirar: o comando age onde ele está. */
    clicar(celula(0, 2), 'a célula do cabeçalho do pagamento');
    clicar(comando('Excluir'), 'Excluir');
    clicar(itemDeMenu('Excluir Colunas'), 'Excluir Colunas');
    expect(tabela()!.querySelectorAll('tr')[0].querySelectorAll('td').length,
      'a coluna não saiu').toBe(2);

    /* 4. Inserir a foto onde o texto fala dela. */
    clicar(bloco('noite-1'), 'o parágrafo da fogueira');
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Imagem'), 'Imagem');
    const foto = bloco('img-fogueira');
    expect(foto, 'a foto não entrou no documento').toBeTruthy();
    expect(foto!.getAttribute('data-disposicao'),
      'a foto nasceu já disposta — a tarefa seguinte abriria verde').toBe('alinhada');

    /* 5. Ajustá-la ao texto. */
    clicar(guia('Formato da Imagem'), 'a guia Formato da Imagem');
    clicar(comando('Dispor Texto'), 'Dispor Texto');
    clicar(itemDeMenu('Quadrada'), 'Quadrada');
    expect(bloco('img-fogueira')!.getAttribute('data-disposicao')).toBe('quadrada');

    /* 6. Legendar as duas por campo. */
    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Inserir Legenda'), 'Inserir Legenda');

    clicar(bloco('leg-mastro'), 'a legenda digitada');
    clicar(guia('Início'), 'a guia Início');
    clicar(comando('Excluir Parágrafo'), 'Excluir Parágrafo');

    clicar(bloco('img-mastro'), 'a foto do mastro');
    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Inserir Legenda'), 'Inserir Legenda');

    expect(podeConcluir(), oQueFalta()).toBe(true);
    clicar(botaoDeConcluir(), 'Concluir a lição');
    expect(venceu, 'o botão de concluir não registrou a lição').toBe(true);
  });

  it('uma grade vazia não resolve a conversão, e o aviso diz por quê', () => {
    /*
      O Word tem os dois comandos, e o laboratório também — esconder um porque
      a lição não o usa ensinaria a procurar o botão que a tarefa quer. Então
      ele precisa poder ser usado e não bastar.
    */
    montar();
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Tabela'), 'Tabela');
    clicar(itemDeMenu('Inserir Tabela…'), 'Inserir Tabela');

    expect(tabela(), 'a grade vazia não foi desenhada').toBeTruthy();
    expect(container.querySelectorAll('[data-bloco^="lista-"]').length,
      'a lista alinhada com Tab sumiu sem ninguém converter').toBeGreaterThan(1);
    expect(podeConcluir(), 'uma grade vazia valeu por lista convertida').toBe(false);
  });

  it('excluir coluna sem o cursor numa célula não apaga nada', () => {
    montar();
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Tabela'), 'Tabela');
    clicar(itemDeMenu('Converter Texto em Tabela…'), 'Converter Texto em Tabela');

    clicar(guia('Layout da Tabela'), 'a guia Layout da Tabela');
    clicar(comando('Excluir'), 'Excluir');
    clicar(itemDeMenu('Excluir Colunas'), 'Excluir Colunas');

    expect(tabela()!.querySelectorAll('tr')[0].querySelectorAll('td').length,
      'uma coluna foi apagada sem ninguém dizer qual').toBe(3);
    expect(container.textContent).toContain('Clique numa célula da coluna');
  });

  it('inserir legenda sem clicar numa figura não cria legenda', () => {
    montar();
    clicar(bloco('titulo'), 'o título do relatório');
    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Inserir Legenda'), 'Inserir Legenda');

    expect(legendas(), 'entrou legenda pendurada num parágrafo comum').toHaveLength(1);
    expect(container.textContent).toContain('Clique antes na figura');
  });
});

describe('a folha deixa o texto contornar a figura', () => {
  /*
    Duas promessas que só o navegador sabe medir — jsdom não calcula layout
    nenhum. O que dá para testar é a estrutura de que elas dependem, que é a
    mesma decisão de `ExplicacaoDaInsignia`: testa-se a promessa, e o
    navegador confirma o sintoma uma vez.
  */
  it('os blocos ficam num bloco comum, e não soltos dentro da folha', () => {
    /*
      A folha é `display: flex`, e **float não vale em item de flex**: com os
      blocos soltos ali dentro, Quadrada e Próxima paravam de contornar e
      faziam a mesma coisa que Acima e Abaixo. Três das seis disposições
      idênticas, sem erro nenhum. Medido no Chromium: com o corpo, o parágrafo
      seguinte sobe 31 px ao lado da imagem; sem ele, zero.
    */
    montar();
    const corpo = container.querySelector('.wd-pagina > .wd-corpo');
    expect(corpo, 'a folha perdeu o corpo em que o float funciona').toBeTruthy();
    const soltos = [...container.querySelectorAll('.wd-pagina > [data-bloco]')];
    expect(soltos.map(e => e.getAttribute('data-bloco')),
      'há bloco pendurado direto na folha, onde o float é ignorado').toEqual([]);
    expect(corpo!.querySelectorAll('[data-bloco]').length).toBeGreaterThan(5);
  });

  it('a legenda de uma figura que flutua flutua com ela', () => {
    /*
      Sem isto ela é um parágrafo comum depois do float, e o "Figura 1 — ..."
      sai **ao lado** da foto em vez de embaixo. Não estoura, e fica com cara
      de documento mal montado pelo desbravador.
    */
    montar();
    clicar(bloco('noite-1'), 'o parágrafo da fogueira');
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Imagem'), 'Imagem');
    clicar(guia('Formato da Imagem'), 'a guia Formato da Imagem');
    clicar(comando('Dispor Texto'), 'Dispor Texto');
    clicar(itemDeMenu('Quadrada'), 'Quadrada');
    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Inserir Legenda'), 'Inserir Legenda');

    const daFogueira = bloco('leg-img-fogueira');
    expect(daFogueira, 'a legenda não entrou').toBeTruthy();
    expect(daFogueira!.classList.contains('wd-legenda-flutua'),
      'a legenda da figura que flutua não flutuou com ela').toBe(true);

    /* E a que não flutua não recebe a classe: a do mastro está disposta em
       quadrada também, então a prova é trocar a da fogueira para uma que não
       flutua e ver a classe sair. */
    clicar(bloco('img-fogueira'), 'a foto da fogueira');
    clicar(guia('Formato da Imagem'), 'a guia Formato da Imagem');
    clicar(comando('Dispor Texto'), 'Dispor Texto');
    clicar(itemDeMenu('Acima e Abaixo'), 'Acima e Abaixo');
    expect(bloco('leg-img-fogueira')!.classList.contains('wd-legenda-flutua'),
      'a legenda continuou flutuando com a figura que parou de flutuar').toBe(false);
  });
});

describe('a legenda de campo se vê, e o número anda sozinho', () => {
  it('o campo sai com o sombreado do Word, e a digitada não', () => {
    /*
      Sem o sombreado as duas legendas ficam idênticas na tela, e a diferença
      inteira do requisito 4.3 passa a só existir dentro do modelo. É o Word
      que marca campo assim; um aviso da plataforma poria a resposta na nossa
      tela em vez de na dele.
    */
    montar();
    clicar(bloco('img-mastro'), 'a foto do mastro');
    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Inserir Legenda'), 'Inserir Legenda');

    const comFundo = container.querySelectorAll('.wd-campo');
    expect(comFundo.length, 'a legenda de campo saiu sem o sombreado').toBe(1);
    expect(campos()).toHaveLength(1);
  });

  it('entrar uma figura antes renumera a de baixo na tela, sem ninguém tocá-la', () => {
    montar();

    /* Primeiro a do mastro, sozinha: ela é a Figura 1. */
    clicar(bloco('leg-mastro'), 'a legenda digitada');
    clicar(guia('Início'), 'a guia Início');
    clicar(comando('Excluir Parágrafo'), 'Excluir Parágrafo');
    clicar(bloco('img-mastro'), 'a foto do mastro');
    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Inserir Legenda'), 'Inserir Legenda');
    expect(textoDasLegendas()[0]).toContain('Figura 1');

    /* Agora a fogueira entra antes dela, com a legenda dela. */
    clicar(bloco('noite-1'), 'o parágrafo da fogueira');
    clicar(guia('Inserir'), 'a guia Inserir');
    clicar(comando('Imagem'), 'Imagem');
    clicar(guia('Referências'), 'a guia Referências');
    clicar(comando('Inserir Legenda'), 'Inserir Legenda');

    const [primeira, segunda] = textoDasLegendas();
    expect(primeira).toContain('Figura 1');
    expect(primeira).toContain(FOTO_DA_FOGUEIRA.descricao);
    expect(segunda,
      'a legenda do mastro não andou na tela — é ela que, digitada, mentiria')
      .toContain('Figura 2');
  });
});

describe('os três laboratórios de Word da vereda mostram a mesma janela', () => {
  /*
    Foi por este trio que a tabela e a imagem desceram para `word.tsx`. Ajustar
    um lado e não os outros daria três Word para o mesmo programa — o defeito
    que a plataforma já teve uma vez, e que `PlanilhaAvancadaLab.test.tsx`
    vigia nos dois Excel.
  */
  const janela = () => ({
    barraDeTitulo: !!container.querySelector('.wd-titulo'),
    guias: [...container.querySelectorAll('.wd-guia')]
      .map(b => b.textContent?.trim())
      /* As contextuais entram e saem com o cursor: comparar a fileira inteira
         faria esta trava reprovar por uma diferença de exercício, e não de
         janela. */
      .filter(n => !n?.includes('da Tabela') && !n?.includes('da Imagem')),
    regua: !!container.querySelector('.wd-regua'),
    folha: !!container.querySelector('.wd-pagina'),
    status: !!container.querySelector('.wd-status'),
  });

  const montarOutro = (Tela: typeof LaboratorioDeWord, licao: string) => {
    act(() => root.unmount());
    root = createRoot(container);
    act(() => {
      root.render(
        <MemoryRouter>
          <Tela vereda={VEREDA} licao={licaoDeWord(licao)}
            aoVencer={() => {}} aoSair={() => {}} />
        </MemoryRouter>,
      );
    });
    return janela();
  };

  it('a mesma barra de título, a mesma régua, a mesma folha e a mesma régua de status', () => {
    montar();
    const doRelatorio = janela();
    const doOficio = montarOutro(LaboratorioDeWord, 'm1-lab');
    const daCircular = montarOutro(LaboratorioDaCircular, 'm2-lab');

    for (const [nome, outro] of [['ofício', doOficio], ['circular', daCircular]] as const) {
      expect(doRelatorio.barraDeTitulo, nome).toBe(outro.barraDeTitulo);
      expect(doRelatorio.regua, nome).toBe(outro.regua);
      expect(doRelatorio.folha, nome).toBe(outro.folha);
      expect(doRelatorio.status, nome).toBe(outro.status);
      expect(doRelatorio.guias, nome).toEqual(outro.guias);
    }

    /* A guarda contra o vazio: três janelas ausentes também são iguais. */
    expect(doRelatorio.barraDeTitulo).toBe(true);
    expect(doRelatorio.guias.length).toBeGreaterThanOrEqual(5);
  });

  it('os três partem de documentos diferentes', () => {
    montar();
    const texto = container.textContent ?? '';
    expect(texto).toContain('Relatório do Acampamento de Inverno');
    expect(texto).not.toContain('Circular às famílias');
    expect(texto).not.toContain('Relatório de Atividades — Primeiro Semestre');
  });
});
