// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  CSS_DO_DIGITALIZADOR, PapelNaMesa, FileiraDeFiltros, ReguasDaCaptura,
  CantosDeRecorte, AvisoDeQualidade, AcoesDoScanner, TopoDoScanner,
} from './digitalizador';
import { FILTROS, contrasteDoFiltro, filtroPorId } from './capturaDoScanner';
import {
  type Captura, CAPTURA_BOA, qualidadeDaCaptura, reconhecerTexto, procurar,
  type DocumentoPdf,
} from './documentoPdf';

/*
  O aplicativo de digitalizar.

  A trava que carrega este arquivo não é de peça que some: é a que liga o
  **filtro** ao **reconhecimento**. O requisito 5 manda corrigir contraste, e
  no celular quem corrige contraste é o filtro — se escolher um ou outro desse
  na mesma qualidade de leitura, a fileira de filtros viraria enfeite e a
  metade do requisito que fala de contraste deixaria de existir.
*/

let raiz: Root | null = null;
let caixa: HTMLDivElement | null = null;

/*
  Mexer numa régua controlada por React.

  Escrever `.value` direto e despachar o evento não funciona: o React guarda
  o último valor que ele mesmo pôs e descarta o evento quando os dois batem.
  Quem desfaz isso é o setter nativo do protótipo, que escreve sem passar pelo
  rastreador — é a mesma família do `pointerenter` que o React não escuta, e
  de novo o defeito seria do teste, não do componente.
*/
const arrastarRegua = (input: HTMLInputElement, valor: number) => {
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value',
  )!.set!;
  setter.call(input, String(valor));
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

const montar = (no: React.ReactNode) => {
  caixa = document.createElement('div');
  document.body.appendChild(caixa);
  raiz = createRoot(caixa);
  act(() => { raiz!.render(no); });
  return caixa;
};

afterEach(() => {
  act(() => { raiz?.unmount(); });
  caixa?.remove();
  raiz = null; caixa = null;
});

const ATA = ['Ata da reunião do clube', 'O acampamento foi aprovado pela diretoria.'];

/* ── O filtro é o contraste, e o contraste é a leitura ────────────────────── */

describe('o filtro muda o que o reconhecimento consegue ler', () => {
  /* A foto de celular cai reta e enquadrada nesta trava de propósito: o que
     se está medindo é o **filtro**, sozinho. */
  const comFiltro = (id: Parameters<typeof contrasteDoFiltro>[0]): Captura =>
    ({ ...CAPTURA_BOA, contraste: contrasteDoFiltro(id) });

  const lendo = (c: Captura): DocumentoPdf => reconhecerTexto({
    nome: 'foto.pdf',
    paginas: [{ id: 'p1', linhas: ATA, captura: c, origem: 'papel' }],
    campos: [], anotacoes: [],
  });

  it('Original deixa a foto acinzentada, e o texto sai errado', () => {
    expect(qualidadeDaCaptura(comFiltro('original'))).toBeLessThan(1);
    expect(procurar(lendo(comFiltro('original')), 'acampamento')).toHaveLength(0);
  });

  it('Preto e branco lê o texto inteiro', () => {
    expect(qualidadeDaCaptura(comFiltro('pretoEBranco'))).toBe(1);
    expect(procurar(lendo(comFiltro('pretoEBranco')), 'acampamento')).toHaveLength(1);
  });

  it('e os quatro sobem em contraste, na ordem em que aparecem', () => {
    /*
      A ordem da fileira é a dos aplicativos: do que menos mexe ao que mais
      mexe. Embaralhá-la faria a pessoa passar do melhor para o pior andando
      para a direita, que é o contrário do que a tela promete.
    */
    const contrastes = FILTROS.map(f => f.contraste);
    expect([...contrastes].sort((a, b) => a - b)).toEqual(contrastes);
  });

  it('e o primeiro da fila é o pior para ler, que é onde a foto cai sozinha', () => {
    /* Se o padrão já fosse o bom, a lição abriria com o contraste corrigido —
       e o requisito 5 manda **corrigir**. */
    expect(FILTROS[0].id).toBe('original');
    expect(qualidadeDaCaptura(comFiltro(FILTROS[0].id))).toBeLessThan(1);
  });
});

/* ── O papel na mesa ──────────────────────────────────────────────────────── */

describe('o papel mostra a captura que tem', () => {
  it('a foto torta e escura desenha torta e escura', () => {
    const torta: Captura = { inclinacao: 11, margem: 26, contraste: 38, nitidez: 100 };
    const el = montar(<PapelNaMesa linhas={ATA} captura={torta} />);
    const papel = el.querySelector<HTMLElement>('.scan-papel')!;

    expect(papel.style.transform).toContain('rotate(11deg)');
    expect(papel.style.filter).toContain('contrast(0.38)');
    expect(papel.style.margin).toBe('26px');
  });

  it('e a foto corrigida desenha reta', () => {
    const el = montar(<PapelNaMesa linhas={ATA} captura={CAPTURA_BOA} />);
    const papel = el.querySelector<HTMLElement>('.scan-papel')!;
    expect(papel.style.transform).toContain('rotate(0deg)');
    expect(papel.style.margin).toBe('0px');
  });

  it('o texto do papel é o mesmo, torto ou reto', () => {
    /* A tinta não muda: o que muda é como a foto a pegou. */
    const torta: Captura = { inclinacao: 11, margem: 26, contraste: 38, nitidez: 100 };
    const a = montar(<PapelNaMesa linhas={ATA} captura={torta} />).textContent;
    act(() => { raiz!.unmount(); }); caixa!.remove();
    const b = montar(<PapelNaMesa linhas={ATA} captura={CAPTURA_BOA} />).textContent;
    expect(a).toBe(b);
  });
});

/* ── A fileira de filtros ─────────────────────────────────────────────────── */

describe('a fileira de filtros', () => {
  it('mostra os quatro, sempre', () => {
    const el = montar(<FileiraDeFiltros escolhido="original" aoEscolher={() => {}} />);
    expect(el.querySelectorAll('.scan-filtro')).toHaveLength(FILTROS.length);
  });

  it('marca o escolhido e diz o que ele custa', () => {
    const el = montar(<FileiraDeFiltros escolhido="pretoEBranco" aoEscolher={() => {}} />);
    const marcados = [...el.querySelectorAll('.scan-filtro[aria-pressed="true"]')];
    expect(marcados).toHaveLength(1);
    expect(marcados[0].textContent).toContain('Preto e branco');
    expect(el.querySelector('.scan-dica')!.textContent)
      .toBe(filtroPorId('pretoEBranco').dica);
  });

  it('e escolher um chama quem o laboratório entregou', () => {
    const escolhidos: string[] = [];
    const el = montar(<FileiraDeFiltros escolhido="original" aoEscolher={f => escolhidos.push(f)} />);
    act(() => {
      [...el.querySelectorAll<HTMLButtonElement>('.scan-filtro')]
        .find(b => b.textContent?.includes('Tons de cinza'))!.click();
    });
    expect(escolhidos).toEqual(['cinza']);
  });
});

/* ── As réguas ────────────────────────────────────────────────────────────── */

describe('as réguas de endireitar e enquadrar', () => {
  it('mexem no número que dizem mexer, e só nele', () => {
    const vistos: Captura[] = [];
    const partida: Captura = { inclinacao: 9, margem: 20, contraste: 38, nitidez: 100 };
    const el = montar(<ReguasDaCaptura captura={partida} aoMudar={c => vistos.push(c)} />);

    const girar = el.querySelector<HTMLInputElement>('#scan-girar')!;
    act(() => { arrastarRegua(girar, 0); });

    expect(vistos).toHaveLength(1);
    expect(vistos[0]).toEqual({ ...partida, inclinacao: 0 });
  });

  it('e mostram o número, senão "está reto o bastante?" vira adivinhação', () => {
    const el = montar(
      <ReguasDaCaptura captura={{ inclinacao: 7, margem: 13, contraste: 38, nitidez: 100 }}
        aoMudar={() => {}} />);
    const saidas = [...el.querySelectorAll('output')].map(o => o.textContent);
    expect(saidas).toEqual(['7°', '13']);
  });
});

/* ── Os cantos ────────────────────────────────────────────────────────────── */

describe('os cantos de recorte', () => {
  it('são quatro, e cada um se alcança sem arrastar', () => {
    /*
      No celular arrastar um alvo de 26px é difícil, e quem navega por teclado
      não arrasta nada. Cada canto é botão com nome, e apertá-lo encaixa —
      "reduzir a tela nunca reduz o que dá para fazer nela", e o teclado vale
      a mesma regra.
    */
    const el = montar(<CantosDeRecorte margem={30} aoAjustar={() => {}} />);
    const cantos = [...el.querySelectorAll<HTMLButtonElement>('.scan-canto')];
    expect(cantos).toHaveLength(4);
    for (const c of cantos) expect(c.getAttribute('aria-label')).toMatch(/^Canto /);
  });

  it('e apertar um aproxima a borda da folha', () => {
    const vistos: number[] = [];
    const el = montar(<CantosDeRecorte margem={30} aoAjustar={m => vistos.push(m)} />);
    act(() => { el.querySelector<HTMLButtonElement>('.scan-canto')!.click(); });
    expect(vistos[0]).toBeLessThan(30);
  });

  it('e nunca passa do zero', () => {
    const vistos: number[] = [];
    const el = montar(<CantosDeRecorte margem={4} aoAjustar={m => vistos.push(m)} />);
    act(() => { el.querySelector<HTMLButtonElement>('.scan-canto')!.click(); });
    expect(vistos[0]).toBe(0);
  });
});

/* ── O aviso de qualidade ─────────────────────────────────────────────────── */

describe('o aviso de qualidade diz o que o aplicativo mediu', () => {
  const nivelDe = (q: number) =>
    montar(<AvisoDeQualidade qualidade={q} />)
      .querySelector<HTMLElement>('.scan-qualidade')!.dataset.nivel;

  it('acusa a foto ruim', () => {
    expect(nivelDe(0.2)).toBe('ruim');
  });

  it('e aprova a boa', () => {
    expect(nivelDe(1)).toBe('bom');
  });

  it('mas não diz se a tarefa está cumprida', () => {
    /*
      Aplicativo de digitalizar de verdade avisa "imagem escura" e "endireite
      a página"; nenhum diz "seu exercício está errado". Escrever isso poria
      na nossa tela a resposta que o requisito 5 manda comprovar procurando a
      palavra — é a regra da régua de status do Word e do painel de Problemas
      do Python.
    */
    for (const q of [0, 0.5, 1]) {
      const texto = montar(<AvisoDeQualidade qualidade={q} />).textContent!.toLowerCase();
      /*
        As palavras são as do **exercício**, e não as da imagem. "O texto pode
        sair errado" é o aplicativo relatando o que ele mediu, que é o que um
        digitalizador de verdade diz; proibir "errado" em geral reprovaria uma
        frase honesta e deixaria a trava medindo vocabulário em vez de papel.
      */
      for (const veredito of ['tarefa', 'exercício', 'lição', 'concluí', 'cumprid']) {
        expect(texto).not.toContain(veredito);
      }
      act(() => { raiz!.unmount(); }); caixa!.remove();
      raiz = null; caixa = null;
    }
  });
});

/* ── Ações e moldura ──────────────────────────────────────────────────────── */

describe('as ações do aplicativo', () => {
  it('o botão principal fica desligado quando não há para onde ir', () => {
    const el = montar(<AcoesDoScanner etapa="camera" rotuloPrincipal="Tirar a foto" />);
    expect(el.querySelector<HTMLButtonElement>('.scan-bt[data-tom="principal"]')!.disabled).toBe(true);
  });

  it('e "Refazer a foto" só existe quando dá para refazer', () => {
    const semRefazer = montar(<AcoesDoScanner etapa="camera" rotuloPrincipal="Tirar a foto" />);
    expect(semRefazer.querySelectorAll('.scan-bt')).toHaveLength(1);
    act(() => { raiz!.unmount(); }); caixa!.remove();

    const comRefazer = montar(
      <AcoesDoScanner etapa="filtro" rotuloPrincipal="Salvar" aoRefazer={() => {}} />);
    expect(comRefazer.textContent).toContain('Refazer a foto');
  });

  it('o topo diz em que etapa se está', () => {
    const el = montar(<TopoDoScanner titulo="Digitalizar" etapa="2 de 3 — recortar" />);
    expect(el.textContent).toContain('2 de 3 — recortar');
  });
});

/* ── A folha de estilo ────────────────────────────────────────────────────── */

describe('a folha de estilo do digitalizador', () => {
  it('desenha a mesa em volta do papel', () => {
    /* Sem mesa não há o que tirar da foto, e "enquadrar" deixaria de querer
       dizer alguma coisa. */
    expect(CSS_DO_DIGITALIZADOR).toMatch(/\.scan-palco[^}]*background:/);
  });

  it('veste a superfície escura, que senão herdaria a da plataforma', () => {
    expect(CSS_DO_DIGITALIZADOR).toMatch(/\.scan-celular h1[^}]*color:/);
  });

  it('e o canto tem alvo grande o bastante para o dedo', () => {
    /* 26px mais a borda: abaixo disso o gesto do celular vira sorte. */
    const canto = CSS_DO_DIGITALIZADOR.slice(CSS_DO_DIGITALIZADOR.indexOf('.scan-canto {'));
    const largura = /width:\s*(\d+)px/.exec(canto);
    expect(Number(largura![1])).toBeGreaterThanOrEqual(24);
  });
});
