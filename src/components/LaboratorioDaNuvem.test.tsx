// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDaNuvem from './LaboratorioDaNuvem';
import { LICOES_DA_CC_ES006, type LicaoDaCcEs006 } from '../labs/metasDaCcEs006';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As nove lições da CC-ES006, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  ── Por que esta trava existe ao lado da de motor ────────────────────────
  `metasDaCcEs006.test.ts` prova que cada meta **pode** ficar verde chamando o
  motor. Isso não prova que a janela chama alguma delas: um botão sem
  `onClick`, um diálogo cujo OK não aplica, um menu que não abre — o motor
  continua correto e o laboratório fica impossível de vencer, que é pior do
  que um que abre resolvido, porque quem fez tudo certo fica olhando uma lista
  vermelha sem nada na tela que explique.

  É a razão escrita em `LaboratorioDeExplorador.test.tsx`, em
  `LaboratorioDePlanilha.test.tsx`, em `LaboratorioDePdf.test.tsx` e em
  `LaboratorioDeContas.test.tsx`: trava de motor não é trava de tela. Na
  CC-ES004 foi ela que achou a lição de assinar que ninguém conseguia fechar,
  e na CC-ES005 o gerador que entregava a mesma senha duas vezes.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-ES006' } as Vereda;

function montar(licaoId: LicaoDaCcEs006) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${licaoId}`,
    tipo: 'nuvem',
    titulo: 'Lição de teste',
    resumo: '',
    licao: licaoId,
    verificacoes: LICOES_DA_CC_ES006[licaoId].metas.map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'nuvem' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDaNuvem vereda={VEREDA} licao={licao}
          aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Os cliques ────────────────────────────────────────────────────────────── */

const todos = <T extends Element>(s: string) => [...container.querySelectorAll<T>(s)];
const clicar = (e?: Element | null) => {
  expect(e, 'o alvo do clique não existe na tela').toBeTruthy();
  act(() => { e!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};
const porTexto = (t: string) =>
  todos<HTMLButtonElement>('button').find(b => (b.textContent ?? '').includes(t));
const porRotulo = (r: string) =>
  todos<HTMLElement>('[aria-label]').find(b => (b.getAttribute('aria-label') ?? '') === r);

/** `value = x` não chega ao React: ele descarta o evento quando o valor bate. */
function escrever(campo: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, valor: string) {
  const proto = campo instanceof HTMLSelectElement ? HTMLSelectElement.prototype
    : campo instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
  act(() => {
    setter.call(campo, valor);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    campo.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

const seletor = (rotulo: string) =>
  container.querySelector<HTMLSelectElement>(`select[aria-label="${rotulo}"]`);

const linha = (nome: string) =>
  todos<HTMLElement>('.nv-linha').find(l => (l.textContent ?? '').includes(nome));

const abrirMenuDe = (nome: string) => {
  const l = linha(nome);
  expect(l, `a linha de "${nome}" não está na lista`).toBeTruthy();
  clicar([...l!.querySelectorAll('[aria-label]')]
    .find(b => (b.getAttribute('aria-label') ?? '').startsWith('Mais ações de')));
};

const abrirArquivo = (nome: string) => {
  const l = linha(nome);
  expect(l, `a linha de "${nome}" não está na lista`).toBeTruthy();
  act(() => { l!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); });
};

const paragrafo = (texto: string) =>
  todos<HTMLElement>('[data-bloco]').find(p => (p.textContent ?? '').includes(texto));

/** Escolher um parágrafo e digitar por cima dele, que é o que se faz no editor. */
function digitar(acheiPor: string, novo: string) {
  clicar(paragrafo(acheiPor));
  const campo = container.querySelector<HTMLTextAreaElement>('textarea.wd-escrevendo');
  expect(campo, 'o parágrafo escolhido não virou campo de digitar').toBeTruthy();
  escrever(campo!, novo);
}

/**
 * Quantas tarefas ainda faltam, lido da cápsula da moldura.
 *
 * É o número que o desbravador vê — e é ele que precisa chegar a zero, e não
 * uma conta refeita aqui. Refazê-la seria conferir o motor de novo, que já tem
 * trava própria.
 */
const faltam = () => {
  const bt = porTexto('Faltam') ?? porTexto('Concluir a lição');
  const m = /Faltam (\d+)/.exec(bt?.textContent ?? '');
  return m ? Number(m[1]) : 0;
};

const voltar = () => clicar(porTexto('Voltar para a nuvem'));

/** Enter no fim de um parágrafo abre outro embaixo, e o cursor vai junto. */
function novaLinhaDepoisDe(acheiPor: string, conteudo: string) {
  clicar(paragrafo(acheiPor));
  const campo = container.querySelector<HTMLTextAreaElement>('textarea.wd-escrevendo');
  expect(campo, 'o parágrafo escolhido não virou campo de digitar').toBeTruthy();
  act(() => {
    campo!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
  const vazio = container.querySelector<HTMLTextAreaElement>('textarea.wd-escrevendo');
  expect(vazio, 'Enter não levou o cursor para o parágrafo novo').toBeTruthy();
  expect(vazio!.value, 'Enter deixou o cursor no parágrafo de cima').toBe('');
  escrever(vazio!, conteudo);
}

/* ── Módulo 1: anexo ou vínculo ────────────────────────────────────────────── */

describe('a lição do anexo fecha clicando', () => {
  it('mandar a cópia, ver as duas discordarem, e então mandar o vínculo', () => {
    montar('anexo');
    voltar();

    /* Primeiro a cópia sai — é o gesto de todo mundo, e o que ela tem de
       inofensivo é justamente dizer o mesmo no dia em que se manda. */
    abrirMenuDe('Lista de materiais');
    clicar(porTexto('Enviar por e-mail'));
    escrever(seletor('Para quem')!, 'cleide');
    clicar(porTexto('Enviar'));

    /* Só então se escreve na sua, que é quando as duas passam a discordar. */
    abrirArquivo('Lista de materiais');
    digitar('Barracas', 'Barracas: 6 de quatro lugares, 2 de seis e 1 de apoio.');
    voltar();

    abrirArquivo('cópia de Cleide');
    voltar();

    abrirMenuDe('Lista de materiais');
    clicar(porTexto('Enviar por e-mail'));
    escrever(seletor('Para quem')!, 'ronaldo');
    clicar(container.querySelector<HTMLInputElement>('input[value="vinculo"]'));
    clicar(porTexto('Enviar'));

    expect(faltam(), 'a lição do anexo não fecha clicando').toBe(0);
  });
});

/* ── Módulo 2: os três níveis ──────────────────────────────────────────────── */

describe('a lição dos três níveis fecha clicando', () => {
  it('cada pessoa com o nível do trabalho dela, e os três limites lidos', () => {
    montar('niveis');
    voltar();
    abrirMenuDe('Lista de materiais');
    clicar(porTexto('Compartilhar'));

    for (const [quem, papel] of [
      ['marta', 'editor'], ['ronaldo', 'comentarista'], ['cleide', 'leitor'],
    ] as const) {
      escrever(seletor('Pessoa')!, quem);
      escrever(container.querySelectorAll<HTMLSelectElement>('select[aria-label="Permissão"]')[0], papel);
      clicar(porTexto('Adicionar'));
    }

    for (const p of ['leitor', 'comentarista', 'editor']) {
      escrever(seletor('Ver o que um nível permite')!, p);
    }

    expect(faltam(), 'a lição dos três níveis não fecha clicando').toBe(0);
  });
});

/* ── Módulo 3: a pasta ─────────────────────────────────────────────────────── */

describe('a lição da pasta fecha clicando', () => {
  it('compartilhar a pasta, ver quem entra pela ficha, e tirar a ficha de lá', () => {
    montar('pasta');
    abrirArquivo('Clube Pioneiros');
    abrirMenuDe('Acampamento de julho');
    clicar(porTexto('Compartilhar'));
    escrever(seletor('Pessoa')!, 'cleide');
    clicar(porTexto('Adicionar'));
    clicar(porTexto('Concluído'));

    /* Entrar na pasta e abrir a caixa da ficha: é lá que a herança se conta. */
    abrirArquivo('Acampamento de julho');
    abrirMenuDe('Fichas médicas 2026');
    clicar(porTexto('Compartilhar'));
    clicar(porTexto('pela pasta'));
    clicar(porTexto('Concluído'));

    abrirMenuDe('Fichas médicas 2026');
    clicar(porTexto('Mover para'));
    escrever(seletor('Pasta de destino')!, 'raiz');
    clicar(porTexto('Concluído'));

    expect(faltam(), 'a lição da pasta não fecha clicando').toBe(0);
  });
});

/* ── Módulo 4: escrever ao mesmo tempo ─────────────────────────────────────── */

describe('a lição de escrever junto fecha clicando', () => {
  it('a sua linha entra, a da Marta chega, e o histórico nomeia os dois', () => {
    montar('juntos');
    clicar(porRotulo('Quem está no documento'));
    digitar('Desmontagem', 'Sábado, 16h — Lanche da tarde: unidade Águia.');

    expect(faltam(), 'a lição de escrever junto não fecha clicando').toBe(0);
  });

  it('e a linha da Marta chega uma vez só, e não a cada tecla', () => {
    /* Uma linha por tecla daria um documento que ninguém consegue ler — e a
       lição passaria a medir quantas vezes alguém digitou. */
    montar('juntos');
    digitar('Desmontagem', 'Sábado, 16h — Lanche: Águia.');
    digitar('Lanche', 'Sábado, 16h — Lanche da tarde: unidade Águia.');
    const quantas = todos('[data-bloco]')
      .filter(p => (p.textContent ?? '').includes('Café da manhã: unidade Falcão')).length;
    expect(quantas, 'a Marta escreveu a mesma linha mais de uma vez').toBe(1);
  });
});

/* ── Módulo 5: comentar e resolver ─────────────────────────────────────────── */

describe('a lição dos comentários fecha clicando', () => {
  it('responder a Marta, resolver o dela, e deixar um seu', () => {
    montar('comentarios');
    const responder = container.querySelector<HTMLTextAreaElement>(
      'textarea[aria-label^="Responder o comentário"]');
    expect(responder, 'o balão da Marta não trouxe campo de resposta').toBeTruthy();
    escrever(responder!, 'Dá sim: a Falcão ajuda a servir.');
    clicar(porTexto('Responder'));
    clicar(porTexto('Resolver'));

    clicar(paragrafo('Desmontagem'));
    clicar(porRotulo('Inserir comentário'));

    expect(faltam(), 'a lição dos comentários não fecha clicando').toBe(0);
  });

  it('e Resolver sozinho não fecha a tarefa da pergunta', () => {
    montar('comentarios');
    clicar(porTexto('Resolver'));
    expect(faltam(), 'resolver em silêncio fechou tudo').toBeGreaterThan(0);
  });
});

/* ── Módulo 6: sugerir, aceitar e rejeitar ─────────────────────────────────── */

describe('a lição da sugestão fecha clicando', () => {
  it('ver o comentarista só sugerir, propor, aceitar uma e rejeitar a outra', () => {
    montar('sugestao');
    voltar();
    /* No combinado da Marta você é comentarista: digitar ali vira sugestão. */
    abrirArquivo('Combinado do acampamento');
    digitar('A saída é no dia 17', 'A saída é no dia 17 de julho, às 18h30.');
    voltar();

    abrirArquivo('Lista de materiais');
    escrever(seletor('Modo de edição')!, 'sugestao');
    digitar('Barracas', 'Barracas: 6 de quatro lugares e 3 de seis lugares.');
    digitar('Lampiões', 'Lampiões: 10, com pilha reserva para cada um.');
    escrever(seletor('Modo de edição')!, 'edicao');

    clicar(porRotulo('Aceitar a sugestão escolhida'));
    clicar(porRotulo('Rejeitar a sugestão escolhida'));

    expect(faltam(), 'a lição da sugestão não fecha clicando').toBe(0);
  });

  it('e no documento da Marta o que se digita não entra como texto', () => {
    /*
      É o requisito 4.4 visto do lado de quem só comenta: quem não sabe disso
      acha que editou. O parágrafo continua dizendo o que dizia, e o que foi
      escrito aparece como proposta na margem.
    */
    montar('sugestao');
    voltar();
    abrirArquivo('Combinado do acampamento');
    digitar('A saída é no dia 17', 'A saída é no dia 20 de julho.');
    expect(paragrafo('A saída é no dia 17'), 'a escrita do comentarista mudou o texto')
      .toBeTruthy();
    expect(container.querySelector('[data-sugestao]'), 'não virou sugestão nenhuma')
      .toBeTruthy();
  });
});

/* ── Módulo 7: o histórico ─────────────────────────────────────────────────── */

describe('a lição do histórico fecha clicando', () => {
  it('achar a versão com as decisões e restaurá-la', () => {
    montar('historico');
    clicar(porRotulo('Histórico de versões'));
    const versoes = todos<HTMLButtonElement>('.ed-versao');
    expect(versoes.length, 'o painel não listou as versões').toBeGreaterThan(2);
    /* De baixo para cima: a de 3 de julho é a que ainda tinha as decisões. */
    clicar(versoes.find(v => (v.textContent ?? '').includes('3 de julho')));
    clicar(porTexto('Restaurar esta versão'));

    expect(faltam(), 'a lição do histórico não fecha clicando').toBe(0);
  });

  it('e restaurar não apaga a versão de cima', () => {
    montar('historico');
    clicar(porRotulo('Histórico de versões'));
    const antes = todos('.ed-versao').length;
    clicar(todos<HTMLButtonElement>('.ed-versao').find(v => (v.textContent ?? '').includes('3 de julho')));
    clicar(porTexto('Restaurar esta versão'));
    expect(todos('.ed-versao').length, 'restaurar apagou versões').toBe(antes + 1);
    expect(container.textContent).toContain('8 de julho');
  });
});

/* ── Módulo 8: o conflito ──────────────────────────────────────────────────── */

describe('a lição do conflito fecha clicando', () => {
  it('provocar, achar a cópia, juntar e mandar a cópia para a lixeira', () => {
    montar('conflito');
    novaLinhaDepoisDe('Fogueira e culto', 'Sábado, 16h — Lanche da tarde: unidade Águia.');
    voltar();

    /* A cópia em conflito nasce na mesma pasta do original. */
    abrirArquivo('Clube Pioneiros');
    abrirArquivo('cópia em conflito');
    voltar();

    abrirArquivo('Escala das unidades');
    novaLinhaDepoisDe('Desmontagem', 'A Águia troca com a Onça no almoço de sábado.');
    voltar();

    abrirMenuDe('cópia em conflito');
    clicar(porTexto('Mover para a lixeira'));

    expect(faltam(), 'a lição do conflito não fecha clicando').toBe(0);
  });
});

/* ── Módulo 9: o combinado da equipe ───────────────────────────────────────── */

describe('a lição do combinado fecha clicando', () => {
  it('responder as quatro, os três escreverem, guardar e transferir', () => {
    montar('combinado');
    const respostas: [string, string][] = [
      ['Onde ficam os arquivos', 'Na pasta Clube Pioneiros, dentro da pasta do ano.'],
      ['Como os arquivos são nomeados', 'ano-mes-dia-assunto-versao, com a data na frente.'],
      ['Quem detém cada permissão', 'A diretoria edita, os conselheiros comentam, as famílias leem.'],
      ['O que acontece quando alguém deixa', 'A propriedade passa para quem fica, antes de a conta sair.'],
    ];
    for (const [pergunta, resposta] of respostas) {
      const titulo = paragrafo(pergunta);
      expect(titulo, `a pergunta "${pergunta}" não está no documento`).toBeTruthy();
      /* A resposta é o parágrafo logo depois do título da pergunta. */
      const campo = titulo!.nextElementSibling as HTMLElement | null;
      clicar(campo);
      const caixa = container.querySelector<HTMLTextAreaElement>('textarea.wd-escrevendo');
      expect(caixa, `a resposta de "${pergunta}" não virou campo`).toBeTruthy();
      escrever(caixa!, resposta);
    }
    voltar();

    abrirMenuDe('Combinado de trabalho');
    clicar(porTexto('Mover para'));
    escrever(seletor('Pasta de destino')!, 'pasta-clube');
    clicar(porTexto('Concluído'));

    abrirArquivo('Clube Pioneiros');
    abrirMenuDe('Combinado de trabalho');
    clicar(porTexto('Compartilhar'));
    const papeis = todos<HTMLSelectElement>('select[aria-label="Permissão"]');
    const doRonaldo = papeis[papeis.length - 1];
    escrever(doRonaldo, 'transferir');
    clicar(porTexto('Concluído'));

    expect(faltam(), 'a lição do combinado não fecha clicando').toBe(0);
  });
});

/* ── O que a janela não pode prometer ──────────────────────────────────────── */

describe('a nuvem tem os mesmos comandos em toda lição', () => {
  it('o menu de três pontos traz Compartilhar em qualquer uma delas', () => {
    /*
      Um programa tem todos os comandos o tempo todo. Uma nuvem que só
      mostrasse Compartilhar na lição de compartilhar ensinaria a procurar o
      botão que a tarefa quer, e não a procurar no programa.
    */
    for (const id of Object.keys(LICOES_DA_CC_ES006) as LicaoDaCcEs006[]) {
      montar(id);
      if (porTexto('Voltar para a nuvem')) voltar();
      const alguma = todos<HTMLElement>('.nv-linha')[0];
      expect(alguma, `${id} abriu a nuvem sem arquivo nenhum`).toBeTruthy();
      const nome = alguma.querySelector('.nv-nome span')!.textContent!;
      abrirMenuDe(nome);
      for (const comando of ['Compartilhar', 'Mover para', 'Baixar', 'Fazer uma cópia']) {
        expect(porTexto(comando), `${id} › o menu não tem "${comando}"`).toBeTruthy();
      }
      act(() => root.unmount());
      container.remove();
      montar(id); /* remontar para o afterEach ter o que desmontar */
    }
  });
});
