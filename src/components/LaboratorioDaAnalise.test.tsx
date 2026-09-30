// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDaAnalise from './LaboratorioDaAnalise';
import {
  type LicaoDaCcEs009,
  ABA_CALCULOS, ABA_RESPOSTAS, ABA_UNIDADES,
  COLUNAS_MEDIDAS, COL_FORA, COL_FREQUENCIA, COL_INSCRITOS, COL_MEDIA_ACAMPAMENTOS,
  COL_MEDIA_IDADE, COL_MEMBROS, COL_RELATIVA, COL_ACUMULADA, COL_TAXA, CONTESTACOES,
  LICOES_DA_CC_ES009, MEDIDAS, PERGUNTAS_DO_GRAFICO, ROTULO_CHEGAM, ROTULO_RAZAO,
  ROTULO_TOTAL, candidatosDasPontas, colunaDaMedida, colunaDoBloco, colunaDoCampo,
  faixaDoCampo, faixaDoGrafico, formulaDaMedida, julgamentoCerto, linhaDoRotulo,
  melhorTaxa, unidadeMaisExperiente,
} from '../labs/metasDaCcEs009';
import {
  CAMPO_ACAMPAMENTOS, CAMPO_ALTURA, CAMPO_IDADE, CLASSIFICACAO,
  baseDoAcampamento, camposDaBase,
} from '../labs/baseDoAcampamento';
import { colunaDe, repeticoesDaModa } from '../labs/analiseDeDados';
import { CAMPO_NOME as CAMPO_NOME_DA_BASE, CAMPO_UNIDADE } from '../labs/formulario';
import { nomeDaColuna } from '../labs/formulas';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As dez lições da CC-ES009, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  ── Por que esta trava existe ao lado das de motor ───────────────────────
  `metasDaCcEs009.test.ts` prova que cada meta **pode** ficar verde: ele monta
  o contexto que uma pessoa aplicada deixaria e chama `feita`. Isso não prova
  que a tela produz aquele contexto. Um botão sem `onClick`, um diálogo que não
  aplica, um filtro que não registra a descoberta — o motor continua correto e
  a lição fica impossível de vencer, que é pior do que uma que abre resolvida:
  uma deixa uma tarefa verde de graça, a outra deixa quem fez tudo certo
  olhando uma lista vermelha sem nada na tela que explique.

  É a diferença que `exploradorValidator.test.ts` documentou primeiro, e que a
  lição de assinar da CC-ES004 provou custar: a solução de referência de lá
  pulava o meio do caminho, a trava de motor passava, e a lista não fechava
  para ninguém. "Trava de motor não é trava de tela."
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-ES009' } as Vereda;
const BASE = baseDoAcampamento();

function montar(qual: LicaoDaCcEs009) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`,
    tipo: 'analise',
    titulo: 'Lição de teste',
    resumo: '',
    licao: qual,
    verificacoes: LICOES_DA_CC_ES009[qual].metas.map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'analise' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDaAnalise vereda={VEREDA} licao={licao}
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
  Passar o ponteiro por cima, que é `pointerover` e não `pointerenter`.

  O React não escuta `pointerenter` — ele não borbulha —, e implementa
  `onPointerEnter` a partir de `pointerover` na raiz. Um teste que despachasse
  `pointerenter` veria a janela não reagir e acusaria o componente de um
  defeito que é do teste. Está escrito em `LaboratorioDePlanilha.test.tsx`, que
  nasceu vermelho com o navegador verde por isso.
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
  Escrever num campo controlado.

  `campo.value = x` não chega ao React: ele guarda o último valor que ele mesmo
  pôs e descarta o evento quando os dois batem. Quem desfaz isso é o setter
  nativo do protótipo — e é por protótipo, porque `input` e `textarea` são
  dois.
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
  bolha do celular. Os dois desenham o mesmo `acoes`, então clicar no primeiro
  é clicar no botão — e procurar por texto é o que a pessoa faz.
*/
const botaoDaMoldura = (texto: string) =>
  [...container.querySelectorAll('button')].find(b => b.textContent?.includes(texto));

const abrirOCaderno = () => clicar(botaoDaMoldura('Abrir o caderno da análise'));
const verAPlanilha = () => clicar(botaoDaMoldura('Ver a planilha'));

/** O grupo de uma linha do caderno, achado pelo nome que ela anuncia. */
const grupo = (rotulo: string) =>
  container.querySelector<HTMLElement>(`[role="group"][aria-label="${rotulo}"]`)!;

/** Um botão de dentro de um grupo, pelo texto dele. */
const noGrupo = (rotulo: string, texto: string) =>
  [...grupo(rotulo).querySelectorAll('button')].find(b => b.textContent?.trim() === texto);

/** Uma alternativa da pergunta do caderno, pelo começo do texto dela. */
const alternativa = (comeco: string) =>
  [...container.querySelectorAll('button')].find(b => b.textContent?.startsWith(comeco));

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
  `${oQue} — e escrevo isto com letras suficientes para valer como justificativa de verdade.`;

/* ── Os blocos da lição da vez ─────────────────────────────────────────────── */

/*
  Em que linha um rótulo caiu depende de que blocos a aba trouxe, e cada lição
  traz os dela. O teste pergunta isso ao mesmo registro que a tela lê, e não a
  um deslocamento escrito à mão: um número fixo mandaria a fórmula para a
  célula do lado e a tarefa ficaria vermelha com a conta certa na tela.
*/
let BLOCOS_DA_VEZ: ReturnType<typeof LICOES_DA_CC_ES009['centro']['inicial']>['blocos'] = [];

const comBlocosDe = (qual: LicaoDaCcEs009) => {
  BLOCOS_DA_VEZ = LICOES_DA_CC_ES009[qual].inicial().blocos;
};

const faixaDe = (campo: string) => `${ABA_RESPOSTAS}!${faixaDoCampo(BASE, campo)}`;

const enderecoDe = (rotulo: string, campo: string) =>
  `${nomeDaColuna(colunaDaMedida(campo))}${linhaDoRotulo(BLOCOS_DA_VEZ, rotulo) + 1}`;

/* ── As dez lições ─────────────────────────────────────────────────────────── */

describe('as lições da CC-ES009 se vencem clicando', () => {
  it('módulo 1 — os tipos: dez colunas, natureza, escala e o que não agrupa', () => {
    montar('tipos');
    expect(abertas()).toBe(3);

    for (const campo of camposDaBase()) {
      const certo = CLASSIFICACAO[campo.id];
      clicar(noGrupo(campo.rotulo, certo.natureza === 'qualitativa' ? 'Qualitativa' : 'Quantitativa'));
      clicar(noGrupo(campo.rotulo, {
        nominal: 'Nominal', ordinal: 'Ordinal', discreta: 'Discreta', continua: 'Contínua',
      }[certo.escala]));
      if (certo.naoAgrupa) {
        clicar(grupo(campo.rotulo).querySelector('input[type="checkbox"]'));
      }
    }

    expect(abertas(), 'a lição dos tipos não fecha clicando').toBe(0);
  });

  it('módulo 2 — o centro: as cinco medidas, o filtro da moda e a conta que se refaz', () => {
    comBlocosDe('centro');
    montar('centro');
    expect(abertas()).toBe(4);

    trocarAba(ABA_CALCULOS);
    for (const medida of MEDIDAS) {
      for (const campo of COLUNAS_MEDIDAS) {
        escrever(linhaDoRotulo(BLOCOS_DA_VEZ, medida.rotulo), colunaDaMedida(campo),
          formulaDaMedida(medida, BASE, campo));
      }
    }
    expect(abertas(), 'só as duas descobertas deviam faltar').toBe(2);

    /*
      A moda da altura descreve **duas** pessoas em quarenta e oito, e quem
      conta isso é o filtro: liga-se na guia Dados, abre-se a setinha da coluna
      e escolhe-se o valor. A régua de baixo diz quantos registros sobraram.
    */
    trocarAba(ABA_RESPOSTAS);
    const alturas = colunaDe(BASE, CAMPO_ALTURA);
    const repete = repeticoesDaModa(alturas);
    const aModa = alturas.find(v => alturas.filter(o => o === v).length === repete)!;
    const colAltura = colunaDoCampo(CAMPO_ALTURA);

    apontar(celula(1, colAltura));
    guia('Dados');
    clicar(botao('Filtro'));
    clicar(container.querySelectorAll('.pl-cab-bt')[colAltura]);
    clicar([...container.querySelectorAll('.pl-filtro-item')]
      .find(i => i.textContent?.trim() === aModa));
    expect(container.textContent, 'a régua não conta o que o filtro deixou à vista')
      .toContain(`${repete} de ${alturas.length} registros encontrados`);

    /* E mexer num dado faz a conta andar. Depois o Ctrl+Z devolve a base, que
       é o que as contas conferidas nesta lição esperam. */
    clicar(container.querySelectorAll('.pl-cab-bt')[colAltura]);
    clicar([...container.querySelectorAll('.pl-filtro-item')]
      .find(i => i.textContent?.trim() === '(Todas)'));
    escrever(1, colAltura, '1,71');
    expect(abertas(), 'as duas descobertas caíram, e a base mexida derrubou as contas')
      .toBeGreaterThan(0);
    teclar(container.querySelector('.pl-grade-caixa')!, 'z', { ctrlKey: true });

    expect(abertas(), 'a lição do centro não fecha clicando').toBe(0);
  });

  it('módulo 3 — o engano: a razão, as duas contagens e a coluna que engana', () => {
    comBlocosDe('engano');
    montar('engano');
    expect(abertas()).toBe(3);

    trocarAba(ABA_CALCULOS);
    for (const campo of COLUNAS_MEDIDAS) {
      const col = colunaDaMedida(campo);
      escrever(linhaDoRotulo(BLOCOS_DA_VEZ, ROTULO_RAZAO), col,
        `=${enderecoDe('Média', campo)}/${enderecoDe('Mediana', campo)}`);
      escrever(linhaDoRotulo(BLOCOS_DA_VEZ, ROTULO_CHEGAM), col,
        `=CONT.SE(${faixaDe(campo)};">="&${enderecoDe('Média', campo)})`);
      escrever(linhaDoRotulo(BLOCOS_DA_VEZ, ROTULO_TOTAL), col, `=CONT.NÚM(${faixaDe(campo)})`);
    }
    expect(abertas(), 'só a pergunta do caderno devia faltar').toBe(1);

    abrirOCaderno();
    /* A errada primeiro, para ver que ela explica em vez de fechar a tarefa. */
    clicar(alternativa(camposDaBase().find(f => f.id === CAMPO_IDADE)!.rotulo));
    expect(abertas(), 'a alternativa errada fechou a tarefa').toBe(1);
    expect(container.textContent).toContain('uma da outra');

    clicar(alternativa(camposDaBase().find(f => f.id === CAMPO_ACAMPAMENTOS)!.rotulo));
    expect(abertas(), 'a lição do engano não fecha clicando').toBe(0);
  });

  it('módulo 4 — as frequências: as duas distribuições e a pergunta', () => {
    comBlocosDe('frequencias');
    montar('frequencias');
    expect(abertas()).toBe(3);

    trocarAba(ABA_CALCULOS);
    const total = colunaDe(BASE, CAMPO_UNIDADE).length;
    for (const bloco of BLOCOS_DA_VEZ) {
      const daUnidade = bloco.titulo.startsWith('Distribuição por unidade');
      const faixa = faixaDe(daUnidade ? CAMPO_UNIDADE : CAMPO_ALTURA);
      const cFreq = colunaDoBloco(bloco, COL_FREQUENCIA);
      const cAcum = colunaDoBloco(bloco, COL_ACUMULADA);
      bloco.rotulos.forEach((rotulo, i) => {
        const l = linhaDoRotulo(BLOCOS_DA_VEZ, rotulo);
        const [piso, teto] = rotulo.split(' a ');
        escrever(l, cFreq, daUnidade
          ? `=CONT.SE(${faixa};"${rotulo}")`
          : `=CONT.SE(${faixa};"<${teto}")-CONT.SE(${faixa};"<${piso}")`);
        escrever(l, colunaDoBloco(bloco, COL_RELATIVA), `=${nomeDaColuna(cFreq)}${l + 1}/${total}`);
        escrever(l, cAcum, i === 0
          ? `=${nomeDaColuna(cFreq)}${l + 1}`
          : `=${nomeDaColuna(cAcum)}${l}+${nomeDaColuna(cFreq)}${l + 1}`);
      });
    }
    expect(abertas(), 'só a pergunta do caderno devia faltar').toBe(1);

    abrirOCaderno();
    clicar(alternativa('Porque a altura tem números'));
    expect(abertas(), 'a alternativa errada fechou a tarefa').toBe(1);
    clicar(alternativa('Porque quase toda pessoa'));
    expect(abertas(), 'a lição das frequências não fecha clicando').toBe(0);
  });

  it('módulo 5 — a comparação: o bloco, a tabela dinâmica e a unidade mais experiente', () => {
    comBlocosDe('comparacao');
    montar('comparacao');
    expect(abertas()).toBe(3);

    const bloco = BLOCOS_DA_VEZ[0];
    const unidades = faixaDe(CAMPO_UNIDADE);
    const cInscritos = colunaDoBloco(bloco, COL_INSCRITOS);

    trocarAba(ABA_CALCULOS);
    for (const unidade of bloco.rotulos) {
      const l = linhaDoRotulo(BLOCOS_DA_VEZ, unidade);
      const quantos = `${nomeDaColuna(cInscritos)}${l + 1}`;
      escrever(l, cInscritos, `=CONT.SE(${unidades};"${unidade}")`);
      escrever(l, colunaDoBloco(bloco, COL_MEDIA_ACAMPAMENTOS),
        `=SOMASE(${unidades};"${unidade}";${faixaDe(CAMPO_ACAMPAMENTOS)})/${quantos}`);
      escrever(l, colunaDoBloco(bloco, COL_MEDIA_IDADE),
        `=SOMASE(${unidades};"${unidade}";${faixaDe(CAMPO_IDADE)})/${quantos}`);
    }

    /* O resumo é da aba de respostas, porque ele lê o dado e não a conta. */
    trocarAba(ABA_RESPOSTAS);
    guia('Inserir');
    clicar(botao('Tabela dinâmica'));
    const caixa = container.querySelector('.pl-dialogo')!;
    const selects = caixa.querySelectorAll<HTMLSelectElement>('select');
    escolherEm(selects[0], String(colunaDoCampo(CAMPO_UNIDADE)));
    escolherEm(selects[1], String(colunaDoCampo(CAMPO_ACAMPAMENTOS)));
    escolherEm(selects[2], 'media');
    clicar(container.querySelector('.pl-dialogo-bt-ok'));
    expect(abertas(), 'só a pergunta do caderno devia faltar').toBe(1);

    abrirOCaderno();
    clicar(alternativa(unidadeMaisExperiente(BASE)));
    expect(abertas(), 'a lição da comparação não fecha clicando').toBe(0);
  });

  it('módulo 6 — a adesão: o bloco, os dois maiores números e quem mobilizou melhor', () => {
    comBlocosDe('adesao');
    montar('adesao');
    expect(abertas()).toBe(3);

    const bloco = BLOCOS_DA_VEZ[0];
    const cMembros = colunaDoBloco(bloco, COL_MEMBROS);
    const cInscritos = colunaDoBloco(bloco, COL_INSCRITOS);
    const cFora = colunaDoBloco(bloco, COL_FORA);
    const cTaxa = colunaDoBloco(bloco, COL_TAXA);

    trocarAba(ABA_CALCULOS);
    bloco.rotulos.forEach((unidade, i) => {
      const l = linhaDoRotulo(BLOCOS_DA_VEZ, unidade);
      const membros = `${nomeDaColuna(cMembros)}${l + 1}`;
      const inscritos = `${nomeDaColuna(cInscritos)}${l + 1}`;
      escrever(l, cMembros, `=${ABA_UNIDADES}!B${i + 2}`);
      escrever(l, cInscritos, `=CONT.SE(${faixaDe(CAMPO_UNIDADE)};"${unidade}")`);
      escrever(l, cFora, `=${membros}-${inscritos}`);
      escrever(l, cTaxa, `=${inscritos}/${membros}`);
    });

    /* Os dois cliques: o maior de cada coluna, que é a mesma linha. */
    const linhaDoFalcao = linhaDoRotulo(BLOCOS_DA_VEZ, melhorTaxa(BASE));
    apontar(celula(linhaDoFalcao, cFora));
    apontar(celula(linhaDoFalcao, cTaxa));
    expect(abertas(), 'só a pergunta do caderno devia faltar').toBe(1);

    abrirOCaderno();
    clicar(alternativa(melhorTaxa(BASE)));
    expect(abertas(), 'a lição da adesão não fecha clicando').toBe(0);
  });

  it('módulo 7 — os atípicos: dezoito vereditos e as duas justificativas', () => {
    montar('atipicos');
    expect(abertas()).toBe(3);

    abrirOCaderno();
    for (const k of candidatosDasPontas(BASE)) {
      const rotulo = `${camposDaBase().find(f => f.id === k.campo)!.rotulo} ${k.valor}`;
      clicar(noGrupo(rotulo, {
        normal: 'Normal', mantem: 'Fica', exclui: 'Sai',
      }[julgamentoCerto(BASE, k.campo, k.valor)]));
    }
    preencher('Por que o valor que fica', FRASE('Dezoito acampamentos é muito e é possível'));
    preencher('Por que o valor que sai', FRASE('Ninguém com onze anos tem um metro e cinco'));

    expect(abertas(), 'a lição dos atípicos não fecha clicando').toBe(0);
  });

  it('módulo 8 — os gráficos: três abas, três tipos, os eixos e as três razões', () => {
    montar('graficos');
    expect(abertas()).toBe(3);

    for (const pergunta of PERGUNTAS_DO_GRAFICO) {
      trocarAba(pergunta.aba);
      expect(abaDaVez()).toBe(pergunta.aba);
      const f = faixaDoGrafico(pergunta, BASE);
      arrastarFaixa(f.l1, f.c1, f.l2, f.c2);
      guia('Inserir');
      clicar(botao('Inserir Gráfico'));
      const caixa = container.querySelector('.pl-dialogo')!;
      expect(caixa.textContent, 'a caixa não repete a pergunta da aba')
        .toContain(pergunta.pergunta);
      escolherEm(caixa.querySelector<HTMLSelectElement>('select')!, pergunta.tipo);
      const campos = caixa.querySelectorAll<HTMLInputElement>('input');
      escreverEm(campos[0], pergunta.pergunta);
      escreverEm(container.querySelectorAll<HTMLInputElement>('.pl-dialogo input')[1], 'Unidade');
      escreverEm(container.querySelectorAll<HTMLInputElement>('.pl-dialogo input')[2], 'Pessoas');
      clicar(container.querySelector('.pl-dialogo-bt-ok'));
      guia('Página Inicial');
    }
    expect(abertas(), 'só as três razões do caderno deviam faltar').toBe(1);

    abrirOCaderno();
    for (const pergunta of PERGUNTAS_DO_GRAFICO) {
      preencher(`Aba ${pergunta.aba}`, FRASE(`Este desenho responde "${pergunta.pergunta}"`));
    }
    expect(abertas(), 'a lição dos gráficos não fecha clicando').toBe(0);
  });

  it('módulo 10 — a conclusão: a pergunta, as colunas, a resposta e os limites', () => {
    montar('conclusao');
    expect(abertas()).toBe(4);

    preencher('A pergunta', 'Qual unidade tem mais experiência de acampamento por desbravador, e isso tem a ver com o tamanho dela?');
    for (const id of [CAMPO_UNIDADE, CAMPO_ACAMPAMENTOS]) {
      const rotulo = camposDaBase().find(f => f.id === id)!.rotulo;
      clicar([...container.querySelectorAll('label')]
        .find(l => l.textContent?.trim() === rotulo)
        ?.querySelector('input[type="checkbox"]'));
    }
    preencher('A resposta', 'A Arara, com média de 4,71 acampamentos por inscrito, contra 3,88 do Tucano e 2,31 do Falcão — e ela é a quarta em tamanho, com sete inscritos.');
    preencher('A conclusão', FRASE('A Arara é a unidade cuja gente já foi a mais acampamentos, com 4,71 por desbravador contra 2,31 do Falcão, e ela não é a maior').repeat(2));
    preencher('Os limites', 'A base não diz por que a Arara tem mais experiência, e não compara este clube com nenhum outro: não há outro clube dentro dela.');

    expect(abertas(), 'a lição da conclusão não fecha clicando').toBe(0);
  });

  it('módulo 11 — a defesa: quatro vereditos e quatro respostas', () => {
    montar('defesa');
    expect(abertas()).toBe(3);

    for (const o of CONTESTACOES) {
      const cartao = [...container.querySelectorAll('blockquote')]
        .find(b => b.textContent?.includes(o.texto.slice(0, 40)))!
        .closest('section')!;
      clicar([...cartao.querySelectorAll('button')]
        .find(b => b.textContent?.trim() === (o.defensavel ? 'Defendo com os dados' : 'Reconheço o limite')));
      escreverEm(cartao.querySelector('textarea')!, o.defensavel
        ? FRASE('Três de dezesseis é a melhor taxa das seis, 81,25%, contra 75% da Onça')
        : FRASE('Isto a base não responde, porque ela registra o que aconteceu e não tem coluna nenhuma sobre isso'));
    }

    expect(abertas(), 'a lição da defesa não fecha clicando').toBe(0);
  });
});

/* ── O que a janela promete, e o que ela não promete ───────────────────────── */

describe('a janela é a mesma das outras lições de planilha', () => {
  it('as abas da pasta estão no pé, e a lição abre na de respostas', () => {
    montar('centro');
    expect([...container.querySelectorAll('.pl-aba')].map(a => a.textContent?.trim()))
      .toEqual([ABA_RESPOSTAS, ABA_CALCULOS]);
    expect(abaDaVez()).toBe(ABA_RESPOSTAS);
  });

  /*
    Trocar de aba não perde o trabalho. Sem isso, quem fosse à aba de respostas
    conferir um número voltaria a Cálculos com a coluna vazia — e não teria como
    saber que foi o clique.
  */
  it('trocar de aba e voltar não perde o que foi escrito', () => {
    comBlocosDe('centro');
    montar('centro');
    trocarAba(ABA_CALCULOS);
    const l = linhaDoRotulo(BLOCOS_DA_VEZ, 'Média');
    escrever(l, colunaDaMedida(CAMPO_IDADE), formulaDaMedida(MEDIDAS[0], BASE, CAMPO_IDADE));
    const escrito = celula(l, colunaDaMedida(CAMPO_IDADE)).textContent?.trim();
    expect(escrito).not.toBe('');
    trocarAba(ABA_RESPOSTAS);
    trocarAba(ABA_CALCULOS);
    expect(celula(l, colunaDaMedida(CAMPO_IDADE)).textContent?.trim()).toBe(escrito);
  });

  /*
    A faixa tem todos os comandos o tempo todo, porque é assim que um programa
    é. Um Excel que só mostrasse "Tabela Dinâmica" na lição que a pede
    ensinaria a procurar o botão que a tarefa quer, e não a procurar no
    programa — é a regra do Explorador da CC-ES001.
  */
  it('a faixa não muda conforme o exercício', () => {
    montar('centro');
    expect(botao('AutoSoma')).not.toBeNull();
    guia('Inserir');
    expect(botao('Tabela dinâmica')).not.toBeNull();
    expect(botao('Inserir Gráfico')).not.toBeNull();
    guia('Dados');
    expect(botao('Filtro')).not.toBeNull();
    expect(botao('Atualizar Tudo')).not.toBeNull();
  });

  /*
    Escrever pela barra de fórmulas é como se escreve numa planilha, e foi por
    aí que a descoberta do módulo 2 não acontecia para ninguém.

    A primeira versão pendurava a detecção num `aoConfirmar` da grade, que só
    vê a edição feita **dentro da célula**: quem digitava onde se digita
    passava por fora, e a tarefa "ver a conta se refazer" nunca fechava. É o
    defeito que esta trava existe para achar — o motor estava certo, e a lição
    era impossível de vencer.
  */
  it('mexer num dado pela barra de fórmulas conta como ver a conta se refazer', () => {
    montar('centro');
    expect(abertas()).toBe(4);
    escrever(1, colunaDoCampo(CAMPO_ALTURA), '1,71');
    expect(abertas(), 'a barra de fórmulas não registrou a mudança do dado').toBe(3);
  });

  /*
    E o Ctrl+Z devolve o dado sem apagar o que a pessoa viu.

    O gesto é da própria lição: mexe-se num dado, olha-se a média andar, e
    devolve-se o dado ao que era. Levando a descoberta junto, o passo final do
    passo a passo apagaria a única coisa que a tarefa mede — a lista fecharia
    e abriria de novo no mesmo clique, sem nada na tela explicando.

    Gravar a descoberta fora do histórico não bastava: desfazer troca o
    presente inteiro pelo passado guardado, e o passado é de antes de ela
    existir.
  */
  it('o Ctrl+Z devolve o dado e não apaga o que a pessoa viu', () => {
    comBlocosDe('centro');
    montar('centro');
    trocarAba(ABA_CALCULOS);
    for (const medida of MEDIDAS) {
      for (const campo of COLUNAS_MEDIDAS) {
        escrever(linhaDoRotulo(BLOCOS_DA_VEZ, medida.rotulo), colunaDaMedida(campo),
          formulaDaMedida(medida, BASE, campo));
      }
    }
    /*
      Com as quinze fórmulas escritas sobram duas: a da moda, que espera o
      filtro, e a do dado que muda. Esta trava não filtra nada de propósito —
      ela é sobre o Ctrl+Z, e o número que ela lê precisa poder se mover por um
      motivo só.
    */
    expect(abertas(), 'as contas escritas deviam deixar só as duas descobertas').toBe(2);

    trocarAba(ABA_RESPOSTAS);
    escrever(1, colunaDoCampo(CAMPO_ALTURA), '1,71');
    /*
      Três: as três contas caíram, porque são conferidas contra a base como ela
      chegou, e a descoberta entrou. Fosse quatro, a mudança pela barra de
      fórmulas não teria sido vista.
    */
    expect(abertas(), 'a descoberta não entrou, ou a base mexida não derrubou as contas').toBe(3);

    teclar(container.querySelector('.pl-grade-caixa')!, 'z', { ctrlKey: true });
    /*
      Uma: as três contas voltaram **e** a descoberta ficou — sobra a da moda,
      que esta trava não foi buscar. Fossem duas, o Ctrl+Z teria levado a
      descoberta junto com o dado.
    */
    expect(abertas(), 'o Ctrl+Z levou a descoberta junto com o dado').toBe(1);
  });

  /*
    Classificar a base não é mexer nela, e por isso não conta como ver a conta
    se refazer: ordenar leva a linha inteira, nenhum registro muda, e duas
    lições mandam classificar a coluna para olhar as duas pontas. Uma
    ordenação que acendesse a descoberta a entregaria de graça.
  */
  it('classificar a base não conta como mexer no dado', () => {
    montar('centro');
    const coluna = colunaDoCampo(CAMPO_NOME_DA_BASE);
    const antes = celula(1, coluna).textContent?.trim();
    apontar(celula(1, colunaDoCampo(CAMPO_ACAMPAMENTOS)));
    guia('Dados');
    clicar(botao('Classificar de Z a A'));
    expect(celula(1, coluna).textContent?.trim(), 'a classificação não mexeu em nada')
      .not.toBe(antes);
    expect(abertas(), 'classificar acendeu a descoberta do dado que muda').toBe(4);
  });

  /*
    A travessia só existe onde há as duas telas. O módulo 2 não tem caderno —
    as duas coisas que ele manda ver acontecem na planilha —, e um botão que
    abrisse uma folha em branco prometeria trabalho que a lição não pede.
  */
  it('o caderno da análise não é oferecido na lição que não tem um', () => {
    montar('centro');
    expect(botaoDaMoldura('Abrir o caderno da análise')).toBeUndefined();
    act(() => root.unmount());
    container.remove();
    montar('engano');
    expect(botaoDaMoldura('Abrir o caderno da análise')).toBeDefined();
  });

  /*
    E a volta existe sempre: quem escreve no caderno cita números, e eles saem
    da aba Cálculos e não de memória.
  */
  it('do caderno se volta à planilha, inclusive nas lições que abrem nele', () => {
    montar('conclusao');
    expect(container.querySelector('.pl-janela')).toBeNull();
    verAPlanilha();
    expect(container.querySelector('.pl-janela')).not.toBeNull();
    expect(abaDaVez()).toBe(ABA_RESPOSTAS);
  });
});
