// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDaEstatistica from './LaboratorioDaEstatistica';
import {
  type LicaoDaCcEs010,
  CANDIDATAS_A_ESCONDIDA, CHAVE_ACASO, CHAVE_EFEITO, CHAVE_RAZOES, CHAVE_RISCO,
  IDADE_DENTRO, IDADE_FORA, LEITURAS_DE_R, LICOES_DA_CC_ES010,
  PARES, PAR_DO_MODULO_2, ROTULO_ESCOLHIDO, ROTULO_INCLINACAO, ROTULO_INCL_SEM,
  ROTULO_INTERCEPCAO, ROTULO_R2_SEM,
  formulaDaPrevisao, formulaDaReta, formulaDoAjuste, formulaDoR, formulaSemAtipico,
  leituraCerta, linhasAtipicasDoPar, parEspurio, piorAjusteDa, rotuloDaPrevisao,
  rotuloDoCampo,
} from '../labs/metasDaCcEs010';
import { ABA_CALCULOS, ABA_RESPOSTAS, colunaDoCampo, linhaDoRotulo } from '../labs/metasDaCcEs009';
import { COLETAS, NOME_DA_FORMA, populacaoCerta } from '../labs/amostraDoClube';
import { POPULACOES_DA_LICAO } from '../labs/metasDaCcEs010';
import {
  CAMPO_DA_MEDIDA, CAMPO_DO_GRUPO, GRUPO_A, GRUPO_B, LEITURAS_DO_ACASO,
  SORTEIOS_MINIMOS, SORTEIOS_POR_VEZ,
  leituraDoAcasoCerta, providenciasQueAumentam,
} from '../labs/acasoEntreGrupos';
import { ACHADOS, GRAUS, achadosQueLimitam } from '../labs/confiancaNaConclusao';
import { baseDoAcampamento } from '../labs/baseDoAcampamento';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As dez lições da CC-ES010, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  ── Por que esta trava existe ao lado da de motor ────────────────────────
  `metasDaCcEs010.test.ts` prova que cada meta **pode** ficar verde: ele monta
  o contexto que uma pessoa aplicada deixaria e chama `feita`. Isso não prova
  que a tela produz aquele contexto. Um botão sem `onClick`, uma caixa de
  Elementos do Gráfico que refaz o gráfico em vez de mexer nele, um filtro que
  não registra a descoberta — o motor continua correto e a lição fica
  impossível de vencer, que é pior do que uma que abre resolvida: uma deixa
  tarefa verde de graça, a outra deixa quem fez tudo certo olhando uma lista
  vermelha sem nada na tela que explique.

  "Trava de motor não é trava de tela" — e nesta vereda ela já cobrou o preço
  duas vezes do lado da CC-ES009: a mudança pela barra de fórmulas que não
  contava, e o Ctrl+Z que levava a descoberta junto.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-ES010' } as Vereda;
const BASE = baseDoAcampamento();

function montar(qual: LicaoDaCcEs010) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`,
    tipo: 'estatistica',
    titulo: 'Lição de teste',
    resumo: '',
    licao: qual,
    verificacoes: LICOES_DA_CC_ES010[qual].metas.map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'estatistica' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDaEstatistica vereda={VEREDA} licao={licao}
          aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Os gestos ─────────────────────────────────────────────────────────────── */

const clicar = (alvo: Element | null | undefined) => {
  act(() => { alvo?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

const apontar = (alvo: Element) => {
  act(() => {
    alvo.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
  });
};

/*
  Passar o ponteiro por cima é `pointerover`, e não `pointerenter`: o React não
  escuta o segundo — ele não borbulha — e implementa `onPointerEnter` a partir
  do primeiro. Um teste que despachasse `pointerenter` veria a janela não
  reagir e acusaria o componente de um defeito que é do teste.
*/
const passarPor = (alvo: Element) => {
  act(() => { alvo.dispatchEvent(new PointerEvent('pointerover', { bubbles: true })); });
};

const soltar = () => {
  act(() => {
    container.querySelector('.pl-grade-caixa')!
      .dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  });
};

const teclar = (alvo: Element, key: string, extra: KeyboardEventInit = {}) => {
  act(() => { alvo.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...extra })); });
};

/*
  `campo.value = x` não chega ao React: ele guarda o último valor que ele mesmo
  pôs e descarta o evento quando os dois batem. Quem desfaz isso é o setter
  nativo do protótipo — e é por protótipo, porque `input` e `textarea` são dois.
*/
const escreverEm = (campo: HTMLInputElement | HTMLTextAreaElement, texto: string) => {
  act(() => {
    const proto = campo instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(campo, texto);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const escolherEm = (campo: HTMLSelectElement, valor: string) => {
  act(() => {
    Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')!.set!
      .call(campo, valor);
    campo.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

const marcar = (rotulo: string) => {
  const caixa = container.querySelector<HTMLInputElement>(`input[aria-label="${rotulo}"]`);
  if (!caixa) throw new Error(`não achei a caixa "${rotulo}"`);
  act(() => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked')!.set!
      .call(caixa, true);
    caixa.dispatchEvent(new Event('click', { bubbles: true }));
    caixa.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

/* ── A planilha ────────────────────────────────────────────────────────────── */

const celula = (l: number, c: number) =>
  container.querySelectorAll('.pl-grade tbody tr')[l].querySelectorAll('td')[c];

const barra = () => container.querySelector<HTMLInputElement>('.pl-entrada')!;

/** Clica na célula e escreve pela barra de fórmulas, como quem monta a planilha. */
const escrever = (l: number, c: number, texto: string) => {
  apontar(celula(l, c));
  const campo = barra();
  act(() => { campo.focus(); campo.dispatchEvent(new FocusEvent('focus', { bubbles: true })); });
  escreverEm(barra(), texto);
  teclar(barra(), 'Enter');
};

const arrastarFaixa = (l1: number, c1: number, l2: number, c2: number) => {
  apontar(celula(l1, c1));
  passarPor(celula(l2, c2));
  soltar();
};

/** A alça de preenchimento, que é como se copia uma coluna numa planilha. */
const arrastarAlca = (l: number, c: number, ateL: number, ateC: number) => {
  apontar(celula(l, c));
  apontar(container.querySelector('.pl-alca-preencher')!);
  passarPor(celula(ateL, ateC));
  soltar();
};

const guia = (nome: string) => clicar(
  [...container.querySelectorAll('.pl-guia')].find(g => g.textContent?.trim() === nome));

const botao = (dica: string) =>
  container.querySelector<HTMLButtonElement>(`button[title="${dica}"]`);

const trocarAba = (nome: string) => clicar(
  [...container.querySelectorAll('.pl-aba')].find(a => a.textContent?.trim() === nome));

const abaDaVez = () =>
  container.querySelector('.pl-aba[aria-current="true"]')?.textContent?.trim();

/* ── A travessia e o caderno ───────────────────────────────────────────────── */

/*
  Os botões da moldura saem duas vezes: no painel lateral do computador e na
  bolha do celular. Os dois desenham o mesmo `acoes`, então achar pelo texto é
  o que a pessoa faz.
*/
const botaoDaMoldura = (texto: string) =>
  [...container.querySelectorAll('button')].find(b => b.textContent?.includes(texto));

const abrirOCaderno = () => clicar(botaoDaMoldura('Abrir o caderno da análise'));
const voltarAPlanilha = () => clicar(botaoDaMoldura('Voltar à planilha'));

/** Uma alternativa do caderno, pelo começo do texto dela. */
const alternativa = (comeco: string) => {
  const alvo = [...container.querySelectorAll('button[aria-pressed]')]
    .find(b => b.textContent?.startsWith(comeco));
  if (!alvo) throw new Error(`não achei a alternativa "${comeco}"`);
  return alvo;
};

const escolher = (comeco: string) => clicar(alternativa(comeco));

/** O cartão cujo título ou linha de contexto começa assim. */
const cartao = (contem: string) => {
  const alvo = [...container.querySelectorAll('section.card')]
    .find(s => (s.textContent ?? '').includes(contem));
  if (!alvo) throw new Error(`não achei o cartão com "${contem}"`);
  return alvo;
};

/** Uma alternativa de dentro de um cartão, pelo texto dela. */
const noCartao = (contem: string, texto: string) =>
  [...cartao(contem).querySelectorAll('button[aria-pressed]')]
    .find(b => b.textContent?.startsWith(texto));

/** O campo longo cujo rótulo começa assim. */
const campoLongo = (comeco: string) => {
  const rotulo = [...container.querySelectorAll('label')]
    .find(l => l.querySelector('span')?.textContent?.startsWith(comeco));
  if (!rotulo) throw new Error(`não achei o campo "${comeco}"`);
  return rotulo.querySelector('textarea')!;
};

const preencher = (comeco: string, texto: string) => escreverEm(campoLongo(comeco), texto);

/** Quantas tarefas continuam abertas, lido do painel da plataforma. */
const abertas = () => {
  const m = /(\d+) de (\d+) conclu/.exec(container.textContent ?? '');
  if (!m) throw new Error('o painel de tarefas não está na tela');
  return Number(m[2]) - Number(m[1]);
};

/* ── Frases compridas o bastante para as metas ─────────────────────────────── */

const FRASE = (oQue: string) =>
  `${oQue} — e escrevo isto com letras suficientes, citando o número 0,91, para valer como justificativa de verdade.`;

/* ── Os blocos da lição da vez ─────────────────────────────────────────────── */

/*
  Em que linha um rótulo caiu depende de que blocos a aba trouxe, e cada lição
  traz os dela. O teste pergunta isso ao mesmo registro que a tela lê, e não a
  um deslocamento escrito à mão: um número fixo mandaria a fórmula para a
  célula do lado e a tarefa ficaria vermelha com a conta certa na tela.
*/
let BLOCOS_DA_VEZ: ReturnType<typeof LICOES_DA_CC_ES010['correlacao']['inicial']>['blocos'] = [];

const comBlocosDe = (qual: LicaoDaCcEs010) => {
  BLOCOS_DA_VEZ = LICOES_DA_CC_ES010[qual].inicial().blocos;
};

const linhaDe = (rotulo: string) => linhaDoRotulo(BLOCOS_DA_VEZ, rotulo);

/** Escreve a fórmula na linha daquele rótulo, na aba de cálculos. */
const naLinha = (rotulo: string, formula: string) => escrever(linhaDe(rotulo), 1, formula);

/* ── As dez lições ─────────────────────────────────────────────────────────── */

describe('as lições da CC-ES010 se vencem clicando', () => {
  it('módulo 1 — a amostra: a população e as quatro coletas', () => {
    montar('amostra');
    expect(abertas()).toBe(3);

    /*
      A população certa é a do clube, e a tela oferece as três: a errada de
      baixo chama de população a própria amostra, e a de cima estica a base
      para além do que ela alcança. Clicar numa errada primeiro prova que a
      recusa é da meta, e não um botão desligado — um que não desse para marcar
      não ensinaria o que foi confundido.
    */
    const quais = POPULACOES_DA_LICAO;
    const errada = quais.find(q => !q.certa)!;
    clicar(noCartao('De quem esta base fala', errada.rotulo));
    expect(abertas(), 'a população errada fechou a meta').toBe(3);
    expect(cartao('De quem esta base fala').textContent,
      'o porquê da errada não aparece').toContain(errada.porque.slice(0, 30));

    const certa = quais.find(q => q.id === populacaoCerta())!;
    clicar(noCartao('De quem esta base fala', certa.rotulo));
    expect(abertas(), 'a população certa não fechou a meta').toBe(2);

    for (const coleta of COLETAS) {
      /*
        Quem fica de fora aparece **depois** da classificação, e nunca antes:
        dito antes, a classificação deixa de ser decisão e vira leitura. É a
        regra do aviso do digitalizador da CC-ES004, e a mutação que a quebra
        não derrubava nada até esta linha existir — a tela mostrava a resposta
        e o teste só conferia que ela aparecia depois.
      */
      expect(cartao(coleta.descricao.slice(0, 30)).textContent,
        `a coleta "${coleta.id}" entrega quem fica de fora antes da classificação`)
        .not.toContain(coleta.quemFicaDeFora.slice(0, 30));

      const rotulo = coleta.forma === null
        ? 'Não torceu a amostra'
        : NOME_DA_FORMA[coleta.forma];
      clicar(noCartao(coleta.descricao.slice(0, 30), rotulo));
      expect(cartao(coleta.descricao.slice(0, 30)).textContent)
        .toContain(coleta.quemFicaDeFora.slice(0, 30));
    }

    expect(abertas(), 'a lição da amostra não fecha clicando').toBe(0);
  });

  it('módulo 2 — a correlação: a dispersão, o r e a leitura dele', () => {
    comBlocosDe('correlacao');
    montar('correlacao');
    expect(abertas()).toBe(3);

    const cx = colunaDoCampo(PAR_DO_MODULO_2.x);
    const cy = colunaDoCampo(PAR_DO_MODULO_2.y);
    arrastarFaixa(1, Math.min(cx, cy), BASE.respostas.length, Math.max(cx, cy));
    guia('Inserir');
    clicar(botao('Inserir Gráfico'));
    const caixa = container.querySelector('.pl-dialogo')!;
    escolherEm(caixa.querySelector<HTMLSelectElement>('select')!, 'dispersao');
    const campos = caixa.querySelectorAll<HTMLInputElement>('input');
    escreverEm(campos[0], PAR_DO_MODULO_2.rotulo);
    escreverEm(campos[1], rotuloDoCampo(PAR_DO_MODULO_2.x));
    escreverEm(campos[2], rotuloDoCampo(PAR_DO_MODULO_2.y));
    clicar([...caixa.querySelectorAll('button')].find(b => b.textContent === 'OK'));

    trocarAba(ABA_CALCULOS);
    expect(abaDaVez()).toBe(ABA_CALCULOS);
    naLinha(PAR_DO_MODULO_2.rotulo, formulaDoR(BASE, PAR_DO_MODULO_2));

    abrirOCaderno();
    escolher(LEITURAS_DE_R.find(l => l.id === leituraCerta())!.frase.slice(0, 30));
    expect(abertas(), 'a lição da correlação não fecha clicando').toBe(0);
  });

  it('módulo 3 — a espúria: os três r, o par e a coluna escondida', () => {
    comBlocosDe('espuria');
    montar('espuria');
    expect(abertas()).toBe(3);

    trocarAba(ABA_CALCULOS);
    for (const par of PARES) naLinha(par.rotulo, formulaDoR(BASE, par));

    abrirOCaderno();
    const espurio = parEspurio();
    clicar(noCartao('não tem uma coisa mexendo na outra', espurio.rotulo));
    clicar(noCartao('explica os dois lados', rotuloDoCampo(espurio.escondida!)));
    expect(CANDIDATAS_A_ESCONDIDA).toContain(espurio.escondida);

    expect(abertas(), 'a lição da espúria não fecha clicando').toBe(0);
  });

  it('módulo 4 — a reta: a direção, a tendência e a equação', () => {
    comBlocosDe('reta');
    montar('reta');
    expect(abertas()).toBe(3);

    /*
      ── As duas caixas mexem no gráfico que já existe ────────────────────

      A lição chega com a dispersão desenhada, e as duas marcas moram em
      Elementos do Gráfico — que é onde o Excel as põe. Uma caixa que
      **refizesse** o gráfico apagaria o título e os eixos que a lição
      entregou, e a dispersão deixaria de ser a mesma.
    */
    const antes = container.querySelector('.pl-grafico-titulo')!.textContent;
    marcar('Linha de Tendência');
    marcar('Exibir Equação no gráfico');
    expect(container.querySelector('.pl-grafico-titulo')!.textContent,
      'marcar a tendência refez o gráfico e perdeu o título').toBe(antes);

    trocarAba(ABA_CALCULOS);
    naLinha(ROTULO_INCLINACAO, formulaDaReta(BASE, PAR_DO_MODULO_2, 'INCLINAÇÃO'));
    naLinha(ROTULO_INTERCEPCAO, formulaDaReta(BASE, PAR_DO_MODULO_2, 'INTERCEPÇÃO'));

    abrirOCaderno();
    clicar(noCartao('Qual das duas explica', rotuloDoCampo(PAR_DO_MODULO_2.x)));

    expect(abertas(), 'a lição da reta não fecha clicando').toBe(0);
  });

  it('módulo 5 — prever: dentro, muito fora, e o risco escrito', () => {
    comBlocosDe('prever');
    montar('prever');
    expect(abertas()).toBe(3);

    trocarAba(ABA_CALCULOS);
    for (const idade of [IDADE_DENTRO, IDADE_FORA]) {
      naLinha(rotuloDaPrevisao(idade), formulaDaPrevisao(BASE, PAR_DO_MODULO_2, idade));
    }

    abrirOCaderno();
    preencher('Por que a segunda previsão não vale',
      FRASE('A reta responde 2,58 m para 25 anos, e a base vai de dez a quinze'));
    expect(abertas(), 'a lição da previsão não fecha clicando').toBe(0);
    expect(CHAVE_RISCO).toBe('risco-da-extrapolacao');
  });

  it('módulo 6 — o ajuste: os três r² e onde a reta descreve pior', () => {
    comBlocosDe('ajuste');
    montar('ajuste');
    expect(abertas()).toBe(2);

    trocarAba(ABA_CALCULOS);
    for (const par of PARES) naLinha(par.rotulo, formulaDoAjuste(BASE, par));

    abrirOCaderno();
    clicar(noCartao('Onde a reta descreve pior', piorAjusteDa(BASE).rotulo));
    expect(abertas(), 'a lição do ajuste não fecha clicando').toBe(0);
  });

  it('módulo 7 — o par escolhido: a escolha, o r dela e os três campos', () => {
    comBlocosDe('escolhido');
    montar('escolhido');
    expect(abertas()).toBe(4);

    /*
      A escolha é de quem estuda, e a tela tem de deixar escolher **as duas**
      colunas: um par meio escolhido não é par, e a meta confere o r contra o
      par que a pessoa disse ter escolhido.
    */
    const par = { x: PAR_DO_MODULO_2.x, y: PARES[1].y };
    abrirOCaderno();
    /*
      Os dois eixos são duas fileiras das mesmas quatro colunas, e é por isso
      que cada uma é um grupo nomeado: sem isso são oito botões com quatro
      nomes repetidos, e nem o teste nem quem usa leitor de tela sabe qual é
      qual. Foi assim que esta trava achou a escolha do eixo vertical caindo no
      grupo errado — a lição ficava impossível de vencer com o motor correto.
    */
    const noEixo = (rotulo: string, campo: string) => clicar(
      [...container.querySelectorAll<HTMLElement>(`[role="group"][aria-label="${rotulo}"]`)[0]
        .querySelectorAll('button[aria-pressed]')]
        .find(b => b.textContent?.startsWith(rotuloDoCampo(campo))),
    );
    noEixo('No eixo horizontal', par.x);
    noEixo('No eixo vertical', par.y);

    preencher('O que esse número está sugerindo', FRASE('O r deu 0,72, que é forte'));
    preencher('Uma história que não seja', 'Pode ser que a idade puxe as duas coisas ao mesmo tempo, e que nenhuma delas mexa na outra por conta própria.');
    preencher('O número que faltaria', 'Precisaria da distância de casa de cada um, para olhar a relação dentro de quem mora igualmente longe.');

    voltarAPlanilha();
    trocarAba(ABA_CALCULOS);
    expect(abaDaVez()).toBe(ABA_CALCULOS);
    naLinha(ROTULO_ESCOLHIDO, formulaDoR(BASE, { ...PAR_DO_MODULO_2, ...par }));

    expect(abertas(), 'a lição do par escolhido não fecha clicando').toBe(0);
  });

  it('módulo 8 — a exclusão: o filtro que não exclui, a coluna auxiliar e o relato', () => {
    comBlocosDe('exclusao');
    montar('exclusao');
    expect(abertas()).toBe(4);

    /* ── O filtro, que é o primeiro jeito que todo mundo tenta ── */
    expect(abaDaVez()).toBe(ABA_RESPOSTAS);
    const colY = colunaDoCampo(PAR_DO_MODULO_2.y);
    apontar(celula(1, colY));
    guia('Dados');
    clicar(botao('Filtro'));
    clicar(container.querySelectorAll('.pl-cab-col')[colY].querySelector('button'));
    const lista = container.querySelector('.pl-filtro-lista')!;
    const valores = [...lista.querySelectorAll('.pl-filtro-item')];
    clicar(valores[1]);

    /* ── E a coluna auxiliar, que é como se exclui sem apagar dado ── */
    const fora = linhasAtipicasDoPar(BASE, PAR_DO_MODULO_2);
    expect(fora).toHaveLength(1);
    /* O filtro sai antes: com ele ligado, a grade esconde a linha do atípico e
       não haveria onde clicar para limpar a célula dela. */
    clicar(botao('Filtro'));
    const aux = 11;
    const letra = String.fromCharCode(65 + colY);
    escrever(1, aux, `=${letra}2`);
    arrastarAlca(1, aux, BASE.respostas.length, aux);
    apontar(celula(fora[0] + 1, aux));
    teclar(container.querySelector('.pl-grade-caixa')!, 'Delete');

    trocarAba(ABA_CALCULOS);
    naLinha(ROTULO_INCL_SEM, formulaSemAtipico(BASE, PAR_DO_MODULO_2, 'INCLINAÇÃO'));
    naLinha(ROTULO_R2_SEM, formulaSemAtipico(BASE, PAR_DO_MODULO_2, 'RQUAD'));

    abrirOCaderno();
    preencher('O que a exclusão fez',
      FRASE('A inclinação foi de 8,4 para 8,0 cm por ano e o r² subiu de 0,83 para 0,94'));

    expect(abertas(), 'a lição da exclusão não fecha clicando').toBe(0);
    expect(CHAVE_EFEITO).toBe('efeito-da-exclusao');
  });

  it('módulo 9 — o acaso: as levas, a leitura, o escrito e as três providências', () => {
    montar('acaso');
    expect(abertas()).toBe(4);

    /*
      Uma leva não fecha a meta, e a tela tem de deixar embaralhar de novo: o
      botão que só funcionasse uma vez deixaria a lição impossível de vencer
      com o motor inteiramente correto.
    */
    const embaralhar = () => clicar(botaoDaMoldura(`Embaralhar ${SORTEIOS_POR_VEZ} vezes`));
    embaralhar();
    expect(abertas(), 'uma leva só já fechou a meta').toBe(4);

    /*
      E o botão serve de novo. A meta pede `SORTEIOS_MINIMOS` embaralhos e que
      algum deles tenha chegado na diferença real, e o segundo não é garantia:
      o acaso alcança uma vez em sete. Então o laço continua até fechar, com
      teto — a tela de verdade deixa clicar quantas vezes a pessoa quiser, e um
      botão de uma vez só deixaria a lição impossível de vencer com o motor
      inteiramente correto.

      O teto é folgado de propósito: com a frequência desta base, quarenta levas
      sem nenhum acerto é um evento de uma vez em 10^68. Um teto apertado seria
      a trava virando flake, que é o que ensina a reexecutar em vez de ler.
    */
    const LEVAS_NECESSARIAS = Math.ceil(SORTEIOS_MINIMOS / SORTEIOS_POR_VEZ);
    let levas = 1;
    while (abertas() === 4 && levas < 40) { embaralhar(); levas += 1; }
    expect(levas, 'a lição fechou com menos levas do que a meta pede')
      .toBeGreaterThanOrEqual(LEVAS_NECESSARIAS);
    expect(abertas(), 'embaralhar de novo não fecha a meta').toBe(3);

    /* E o quadro relata o que saiu, com a diferença de verdade ao lado. */
    expect(container.textContent).toContain('Diferença de verdade');
    expect(container.textContent).toContain('chegaram a uma diferença');

    /* E o porquê de cada leitura também só aparece depois da escolha. */
    const certaDoAcaso = LEITURAS_DO_ACASO.find(l => l.id === leituraDoAcasoCerta())!;
    expect(cartao('O que esse resultado significa').textContent,
      'a leitura certa vem explicada antes da escolha')
      .not.toContain(certaDoAcaso.porque.slice(0, 30));
    escolher(certaDoAcaso.frase.slice(0, 30));
    expect(cartao('O que esse resultado significa').textContent)
      .toContain(certaDoAcaso.porque.slice(0, 30));

    preencher('A sua explicação',
      FRASE('A Arara tem 7 e a Águia 8 inscritos, e o embaralho chega na mesma diferença uma vez em sete'));
    for (const id of providenciasQueAumentam()) {
      const pr = cartao('Três providências');
      const alvo = [...pr.querySelectorAll('button[aria-pressed]')]
        .find(b => b.textContent?.startsWith(
          { 'mais-gente': 'Coletar de mais gente', 'repetir-a-coleta': 'Repetir a coleta', 'decidir-antes': 'Decidir qual comparação' }[id] ?? '',
        ));
      clicar(alvo);
    }

    expect(abertas(), 'a lição do acaso não fecha clicando').toBe(0);
    expect(CHAVE_ACASO).toBe('por-que-pode-ser-acaso');
    expect(CAMPO_DO_GRUPO && CAMPO_DA_MEDIDA && GRUPO_A && GRUPO_B).toBeTruthy();
  });

  it('módulo 10 — a confiança: os oito achados, o grau e as razões', () => {
    montar('confianca');
    expect(abertas()).toBe(4);

    const limitam = achadosQueLimitam();
    for (const achado of ACHADOS) {
      /* O porquê aparece **depois** da classificação, e nunca antes: na tela
         desde o começo, ele responde qual é o peso. */
      expect(cartao(achado.frase.slice(0, 30)).textContent,
        `o achado "${achado.id}" entrega o peso antes da classificação`)
        .not.toContain(achado.porque.slice(0, 30));

      const certo = limitam.includes(achado.id) ? 'Limita a conclusão' : 'Sustenta a conclusão';
      clicar(noCartao(achado.frase.slice(0, 30), certo));
      expect(cartao(achado.frase.slice(0, 30)).textContent)
        .toContain(achado.porque.slice(0, 30));
    }

    /* "Alta" não se sustenta, e a tela tem de deixar escolher — a recusa é da
       meta, e não um botão desligado: um grau que não dá para marcar não
       ensina a que ele compromete quem o declara. */
    clicar(noCartao('grau de confiança', 'Alta'));
    expect(abertas(), '"Alta" fechou a meta do grau').toBe(2);
    clicar(noCartao('grau de confiança', 'Média'));

    preencher('As suas razões',
      FRASE('O r é 0,91 e o r² é 0,83, mas a amostra não é o clube e a diferença entre unidades aparece por sorteio'));

    expect(abertas(), 'a lição da confiança não fecha clicando').toBe(0);
    expect(CHAVE_RAZOES).toBe('razoes-do-grau');
    expect(GRAUS).toHaveLength(4);
  });
});

/* ── O que a tela promete em toda lição ────────────────────────────────────── */

describe('a tela da CC-ES010', () => {
  /*
    A faixa é a mesma nas sete lições de planilha: todos os comandos, o tempo
    todo, porque é assim que um programa é. Uma que só mostrasse "Gráfico" na
    lição que o pede ensinaria a procurar o botão que a tarefa quer, e não a
    procurar no programa.
  */
  const DE_PLANILHA: LicaoDaCcEs010[] = [
    'correlacao', 'espuria', 'reta', 'prever', 'ajuste', 'escolhido', 'exclusao',
  ];

  it('oferece os mesmos comandos nas sete lições de planilha', () => {
    const faixas: string[][] = [];
    for (const qual of DE_PLANILHA) {
      montar(qual);
      const dicas: string[] = [];
      for (const nome of ['Página Inicial', 'Inserir', 'Dados']) {
        guia(nome);
        dicas.push(...[...container.querySelectorAll('.pl-faixa button[title]')]
          .map(b => b.getAttribute('title')!));
      }
      faixas.push(dicas.sort());
      act(() => root.unmount());
      container.remove();
      montar(qual);
    }
    for (const f of faixas) expect(f).toEqual(faixas[0]);
    expect(faixas[0]).toContain('Inserir Gráfico');
    expect(faixas[0]).toContain('Filtro');
  });

  /*
    E as três lições de plataforma não avisam sobre tela pequena.

    O aviso diz, com todas as letras, que o laboratório imita um programa de
    computador e que no celular os botões encolhem. Nestas três a frase é
    falsa, e ela mandaria a pessoa procurar um computador para uma tela que
    funciona perfeitamente no telefone dela. É a conta do módulo 8 da CC-ES008.
  */
  it('não imita programa nenhum nas três lições de plataforma', () => {
    for (const qual of ['amostra', 'acaso', 'confianca'] as LicaoDaCcEs010[]) {
      montar(qual);
      expect(LICOES_DA_CC_ES010[qual].programa).toBe('plataforma');
      expect(container.querySelector('.pl-janela'), `"${qual}" abriu janela de programa`)
        .toBeNull();
      /* E não avisam sobre tela pequena: o aviso fala de botões de programa
         que encolhem, e aqui são cartões e campos de texto. */
      expect(container.textContent, `"${qual}" avisou sobre tela pequena`)
        .not.toContain('Melhor numa tela maior');
      act(() => root.unmount());
      container.remove();
      montar(qual);
    }
  });

  it('a travessia existe nos dois sentidos nas lições de planilha', () => {
    montar('correlacao');
    expect(botaoDaMoldura('Abrir o caderno da análise')).toBeTruthy();
    abrirOCaderno();
    expect(botaoDaMoldura('Voltar à planilha')).toBeTruthy();
    /* E o caderno não avisa sobre tela pequena nem vindo de uma lição de
       planilha: quem imita programa é a janela do Excel, não ele. */
    expect(container.textContent).not.toContain('Melhor numa tela maior');
    voltarAPlanilha();
    expect(container.querySelector('.pl-janela')).toBeTruthy();
  });

  /*
    E ela **não** aparece nas de plataforma: um botão "Voltar à planilha" numa
    lição que não tem planilha prometeria caminho para um programa que a lição
    não usa. É a regra do `aoBuscar` do Explorador aplicada à travessia.
  */
  it('e não aparece nas de plataforma', () => {
    montar('acaso');
    expect(botaoDaMoldura('Voltar à planilha')).toBeFalsy();
  });

  it('mexer na base avisa, porque as contas são conferidas contra ela', () => {
    comBlocosDe('exclusao');
    montar('exclusao');
    escrever(1, colunaDoCampo(PAR_DO_MODULO_2.y), '9,99');
    expect(container.textContent).toContain('mexeu no dado da base');
  });

  /*
    O Ctrl+Z não leva a descoberta junto.

    É a conta que a CC-ES009 pagou para aprender: a descoberta do filtro é
    monotônica — o que se viu, viu-se —, e desfazer troca o presente inteiro
    pelo passado guardado, que é de antes de ela existir. Sem trazê-la adiante,
    o gesto seguinte da lição apagaria a única coisa que a primeira meta mede.
  */
  it('desfazer não apaga a descoberta do filtro', () => {
    comBlocosDe('exclusao');
    montar('exclusao');
    const colY = colunaDoCampo(PAR_DO_MODULO_2.y);
    apontar(celula(1, colY));
    guia('Dados');
    clicar(botao('Filtro'));
    clicar(container.querySelectorAll('.pl-cab-col')[colY].querySelector('button'));
    clicar([...container.querySelectorAll('.pl-filtro-lista .pl-filtro-item')][1]);
    const meta = LICOES_DA_CC_ES010.exclusao.metas[0];
    expect(meta.id).toBe('viu-que-esconder-nao-exclui');
    const faltavam = abertas();
    guia('Página Inicial');
    clicar(botao('Desfazer (Ctrl+Z)'));
    clicar(botao('Desfazer (Ctrl+Z)'));
    expect(abertas(), 'o Ctrl+Z levou a descoberta junto').toBeLessThanOrEqual(faltavam);
  });
});
