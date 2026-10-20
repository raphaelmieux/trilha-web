// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDoProjetoDeDados from './LaboratorioDoProjetoDeDados';
import { metasDa, CONCLUSAO_FEITA, type LicaoDaCcEs013 } from '../labs/metasDaCcEs013';
import { INDICE } from '../labs/chamadaDoClube';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As onze lições da CC-ES013, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  `metasDaCcEs013.test.ts` prova que cada meta **pode** ficar verde, chamando o
  motor. Isso não prova que a tela chama alguma delas: um botão sem `onClick`,
  uma caixa que não abre, um campo que não existe — o motor continua correto e
  a lição fica impossível de vencer. "Trava de motor não é trava de tela."

  E aqui ela confere uma coisa que a do motor não alcança: os caminhos errados
  existirem **na tela**. A caixa "Criar uma cópia" nasce desmarcada, o
  Substituir com a planilha inteira alcança o Pedro Aguiar, e Remover
  Duplicatas antes de padronizar não acha nada — se a tela os tornasse
  impossíveis, a lição deixaria de ensinar o que eles custam.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-ES013' } as Vereda;

function montar(qual: LicaoDaCcEs013) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`,
    tipo: 'projeto-de-dados',
    titulo: 'Lição de teste',
    resumo: '',
    licao: qual,
    verificacoes: metasDa(qual).map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'projeto-de-dados' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDoProjetoDeDados vereda={VEREDA} licao={licao}
          aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Os gestos ────────────────────────────────────────────────────────────── */

const clicar = (alvo: Element | null | undefined, nome = '') => {
  expect(alvo, `não achei ${nome || 'o alvo'} na tela`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
};

/* O setter nativo do protótipo, pelo motivo escrito na trava da CC-ES012. */
const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement | HTMLTextAreaElement;
    const proto = el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

const escolher = (campo: Element | null | undefined, valor: string, nome: string) => {
  expect(campo, `não achei a lista "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLSelectElement;
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, valor);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

/* A grade seleciona no pointerdown, e estende com o Shift — como no Excel. */
const apontar = (alvo: Element | null | undefined, nome: string, shiftKey = false) => {
  expect(alvo, `não achei ${nome} na tela`).toBeTruthy();
  act(() => {
    alvo!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, shiftKey }));
  });
};

const porRotulo = (rotulo: string) => container.querySelector(`[aria-label="${rotulo}"]`);
const porTexto = (seletor: string, comeco: string) =>
  [...container.querySelectorAll(seletor)].find(e => e.textContent?.trim().startsWith(comeco));
const botao = (comeco: string) => porTexto('button', comeco);
const campoPorRotulo = (rotulo: string) =>
  [...container.querySelectorAll('label')]
    .find(l => l.textContent?.includes(rotulo))
    ?.querySelector('textarea, input');
const marcar = (rotulo: string) => {
  const caixa = [...container.querySelectorAll('label')]
    .find(l => l.textContent?.trim() === rotulo)?.querySelector('input');
  clicar(caixa, `a caixa "${rotulo}"`);
};

const faltam = (): number => {
  const casa = (container.textContent ?? '').match(/(\d+) de (\d+) concluídas/);
  if (!casa) return -1;
  return Number(casa[2]) - Number(casa[1]);
};
const quantas = (licao: LicaoDaCcEs013) => metasDa(licao).length;

/* ── A planilha ───────────────────────────────────────────────────────────── */

const celula = (l: number, c: number) =>
  container.querySelectorAll('.pl-grade tbody tr')[l]?.querySelectorAll('td')[c];

const selecionar = (l1: number, c1: number, l2: number, c2: number) => {
  apontar(celula(l1, c1), `a célula ${l1},${c1}`);
  apontar(celula(l2, c2), `a célula ${l2},${c2}`, true);
};

const naCelula = (l: number, c: number, texto: string) => {
  apontar(celula(l, c), `a célula ${l},${c}`);
  escrever(porRotulo('Barra de fórmulas'), texto, 'barra de fórmulas');
  act(() => {
    porRotulo('Barra de fórmulas')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
};

const irParaAba = (nome: string) => clicar(porTexto('.pl-aba', nome), `a aba ${nome}`);
const irParaGuia = (nome: string) => clicar(porTexto('.pl-guia', nome), `a guia ${nome}`);

/** A linha da grade em que esta pessoa está, procurando pelo nome e pela unidade. */
const linhaDe = (nome: string, unidade: string) =>
  [...container.querySelectorAll('.pl-grade tbody tr')].findIndex(tr => {
    const tds = tr.querySelectorAll('td');
    return tds[INDICE.nome]?.textContent === nome && tds[INDICE.unidade]?.textContent === unidade;
  });

/** Localizar e Substituir, com a seleção que estiver de pé e as caixas como estiverem. */
const substituirTudo = (de: string, para: string) => {
  escrever(porRotulo('Localizar'), de, 'localizar');
  escrever(porRotulo('Substituir por'), para, 'substituir por');
  clicar(botao('Substituir tudo'), 'substituir tudo');
};

const abrirSubstituir = () => {
  irParaGuia('Página Inicial');
  clicar(porRotulo('Localizar e Selecionar: Substituir'), 'substituir');
};

const copiarABruta = (comCopia = true) => {
  irParaGuia('Página Inicial');
  clicar(porRotulo('Formatar: Mover ou Copiar Planilha'), 'mover ou copiar');
  escolher(porRotulo('Antes da planilha'), '1', 'antes da planilha');
  if (comCopia) marcar('Criar uma cópia');
  clicar(botao('OK'), 'OK');
  clicar(porRotulo('Formatar: Renomear Planilha'), 'renomear');
  escrever(porRotulo('Nome da planilha'), 'Tratada', 'nome da planilha');
  clicar(botao('OK'), 'OK');
};

const ULTIMA = 62;

const padronizarAGrafia = () => {
  selecionar(1, INDICE.unidade, ULTIMA, INDICE.unidade);
  abrirSubstituir();
  marcar('Coincidir conteúdo da célula inteira');
  for (const [de, para] of [['aguia', 'Águia'], ['onça', 'Onça'], ['onca', 'Onça'], ['tucano', 'Tucano']]) {
    substituirTudo(de, para);
  }
  clicar(botao('Fechar'), 'fechar');
  selecionar(1, INDICE.modo, ULTIMA, INDICE.modo);
  abrirSubstituir();
  marcar('Coincidir conteúdo da célula inteira');
  for (const [de, para] of [['onibus', 'Ônibus'], ['ônibus', 'Ônibus'], ['a pé', 'A pé'], ['a pe', 'A pé'], ['carona', 'Carona']]) {
    substituirTudo(de, para);
  }
  clicar(botao('Fechar'), 'fechar');
};

const removerRepetidas = () => {
  irParaGuia('Dados');
  clicar(porRotulo('Remover Duplicatas'), 'remover duplicatas');
  clicar(botao('OK'), 'OK');
};

/* ── O diário ─────────────────────────────────────────────────────────────── */

const abrirOCaderno = (nome: string) => clicar(botao(`Abrir ${nome}`), `abrir ${nome}`);

const decidir = (problema: string, coluna: string, texto: string) => {
  clicar(botao('Acrescentar decisão'), 'acrescentar decisão');
  const n = container.querySelectorAll('[aria-label^="Problema da decisão"]').length;
  escolher(porRotulo(`Problema da decisão ${n}`), problema, 'problema');
  escolher(porRotulo(`Coluna da decisão ${n}`), coluna, 'coluna');
  const textos = container.querySelectorAll('textarea');
  escrever(textos[textos.length - 1], texto, 'decisão');
};

const PORQUE = ' Fiz assim para a conta por grupo não separar a mesma coisa em dois, e anotei para quem vier depois.';

/* ── Módulo 1 ─────────────────────────────────────────────────────────────── */

const escreverAProposta = () => {
  escrever(campoPorRotulo('A pergunta'), 'Quem mora mais longe do clube falta mais às reuniões?', 'pergunta');
  escrever(campoPorRotulo('De onde vem o dado'), 'Da chamada da secretaria, cruzada com um questionário de transporte.', 'origem');
  escrever(campoPorRotulo('Quem vai decidir'), 'A diretoria', 'quem decide');
  escrever(campoPorRotulo('Que decisão'), 'Se monta uma lista de carona no segundo semestre.', 'decisão');
};

describe('o módulo 1: a proposta', () => {
  it('fecha as três escrevendo e enviando', () => {
    montar('proposta');
    expect(faltam(), 'a lição não abriu com todas por fazer').toBe(quantas('proposta'));
    escreverAProposta();
    clicar(botao('Enviar para aprovação'), 'enviar');
    expect(faltam()).toBe(0);
  });

  it('quem abre a base antes da aprovação não fecha', () => {
    montar('proposta');
    clicar(botao('Abrir a base'), 'abrir a base');
    escreverAProposta();
    clicar(botao('Enviar para aprovação'), 'enviar');
    expect(faltam()).toBe(1);
  });
});

/* ── Módulo 2 ─────────────────────────────────────────────────────────────── */

describe('o módulo 2: a base', () => {
  it('fecha as três escolhendo a chamada e declarando origem e data', () => {
    montar('base');
    expect(faltam()).toBe(quantas('base'));
    clicar(botao('chamada_1sem_2026.xlsx'), 'a chamada');
    escrever(campoPorRotulo('Origem'), 'Exportação do sistema de chamada da secretaria, cruzada com o questionário de transporte das famílias.', 'origem');
    escrever(porRotulo('Obtida em'), '03/08/2026', 'obtida em');
    expect(faltam()).toBe(0);
  });

  it('a data do período não fecha a da obtenção', () => {
    montar('base');
    clicar(botao('chamada_1sem_2026.xlsx'), 'a chamada');
    escrever(campoPorRotulo('Origem'), 'Exportação do sistema de chamada da secretaria, cruzada com o questionário de transporte das famílias.', 'origem');
    escrever(porRotulo('Obtida em'), '31/07/2026', 'obtida em');
    expect(faltam()).toBe(1);
  });
});

/* ── Módulo 3 ─────────────────────────────────────────────────────────────── */

describe('o módulo 3: a grafia', () => {
  it('fecha as cinco: cópia, substituições na coluna, duplicatas e diário', () => {
    montar('grafia');
    expect(faltam()).toBe(quantas('grafia'));
    copiarABruta();
    padronizarAGrafia();
    removerRepetidas();
    abrirOCaderno('o diário de limpeza');
    decidir('grafia', 'unidade', `Troquei aguia, AGUIA e Aguia por Águia, e o mesmo nas outras unidades.${PORQUE}`);
    decidir('grafia', 'modo', `Troquei onibus e ônibus por Ônibus, e a pé e carona pela grafia do questionário.${PORQUE}`);
    decidir('duplicata', 'linha', `A Carla Menezes veio duas vezes; depois de padronizar, tirei a de baixo.${PORQUE}`);
    expect(faltam(), 'a limpeza inteira não fechou a lição').toBe(0);
  });

  it('sem marcar "Criar uma cópia", a aba só muda de lugar e nada fecha', () => {
    montar('grafia');
    copiarABruta(false);
    padronizarAGrafia();
    removerRepetidas();
    expect(faltam()).toBe(quantas('grafia'));
  });

  it('substituir com a planilha inteira no alcance estraga o Pedro Aguiar', () => {
    montar('grafia');
    copiarABruta();
    apontar(celula(0, 0), 'A1');
    abrirSubstituir();
    substituirTudo('aguia', 'Águia');
    clicar(botao('Fechar'), 'fechar');
    expect(linhaDe('Pedro Águiar', 'Falcão')).toBeGreaterThan(0);
  });

  it('remover duplicatas antes de padronizar não acha a linha repetida', () => {
    montar('grafia');
    copiarABruta();
    removerRepetidas();
    expect(container.textContent).toContain('Nenhum valor duplicado encontrado');
  });
});

/* ── Módulo 4 ─────────────────────────────────────────────────────────────── */

describe('o módulo 4: os números e as ausências', () => {
  it('fecha as quatro', () => {
    montar('numeros');
    expect(faltam()).toBe(quantas('numeros'));
    const ultima = 61;
    selecionar(1, INDICE.distancia, ultima, INDICE.distancia);
    abrirSubstituir();
    substituirTudo('.', ',');
    substituirTudo(' km', '');
    substituirTudo('km', '');
    clicar(botao('Fechar'), 'fechar');
    selecionar(1, INDICE.idade, ultima, INDICE.idade);
    abrirSubstituir();
    substituirTudo(' anos', '');
    clicar(botao('Fechar'), 'fechar');
    apontar(celula(linhaDe('Ana Clara Ribeiro', 'Tucano'), INDICE.idade), 'a idade da Ana Clara');
    clicar(porRotulo('Limpar o conteúdo da seleção'), 'limpar');

    abrirOCaderno('o diário de limpeza');
    decidir('numero-como-texto', 'distancia', `Troquei o ponto pela vírgula e tirei o km da distância.${PORQUE}`);
    decidir('numero-como-texto', 'idade', `Tirei a palavra anos das duas idades escritas com ela.${PORQUE}`);
    decidir('valor-impossivel', 'distancia', `A Isabela estava a 1.250 km e vem a pé: corrigi para 1,25.${PORQUE}`);
    decidir('valor-impossivel', 'idade', `A idade 41 é impossível e pode ser 11 ou 14: deixei em branco.${PORQUE}`);
    decidir('ausencia', 'distancia', `Quatro famílias não responderam: mantive as linhas e deixei em branco.${PORQUE}`);
    expect(faltam(), 'os consertos e o diário não fecharam a lição').toBe(0);
  });

  it('tirar o km com a coluna inteira selecionada leva o do cabeçalho junto', () => {
    montar('numeros');
    apontar(container.querySelectorAll('.pl-cab-col')[INDICE.distancia], 'o cabeçalho da coluna E');
    abrirSubstituir();
    substituirTudo('km', '');
    clicar(botao('Fechar'), 'fechar');
    expect(celula(0, INDICE.distancia)?.textContent).toBe('Distância ()');
  });
});

/* ── Módulos 5 a 7 ────────────────────────────────────────────────────────── */

describe('o módulo 5: as medidas', () => {
  it('fecha as três com as fórmulas na aba Cálculos e o caderno', () => {
    montar('descritivas');
    expect(faltam()).toBe(quantas('descritivas'));
    irParaAba('Cálculos');
    const formulas = [
      '=MÉDIA(Tratada!F2:F62)', '=MED(Tratada!F2:F62)', '=DESVPADP(Tratada!F2:F62)',
      '=MÉDIA(Tratada!E2:E62)', '=MED(Tratada!E2:E62)', '=DESVPADP(Tratada!E2:E62)',
    ];
    formulas.forEach((f, i) => naCelula(i + 1, 1, f));
    abrirOCaderno('o caderno da análise');
    clicar(botao('A mediana descreve melhor'), 'a mediana');
    escrever(campoPorRotulo('Por quê, com os dois números'),
      'A média dá 6,43 km e a mediana dá 5 km: os poucos que moram muito longe puxam a média.', 'por quê');
    expect(faltam()).toBe(0);
  });

  it('as medidas sobre a bruta não fecham', () => {
    montar('descritivas');
    irParaAba('Cálculos');
    naCelula(2, 1, '=MED(Bruta!F2:F63)');
    expect(faltam()).toBe(quantas('descritivas'));
  });
});

describe('o módulo 6: os grupos', () => {
  it('fecha as três com as contas por grupo e o caderno', () => {
    montar('grupos');
    expect(faltam()).toBe(quantas('grupos'));
    irParaAba('Grupos');
    for (let l = 1; l <= 4; l++) {
      naCelula(l, 1, `=CONT.SE(Tratada!$D$2:$D$62;A${l + 1})`);
      naCelula(l, 2, `=SOMASE(Tratada!$D$2:$D$62;A${l + 1};Tratada!$F$2:$F$62)/B${l + 1}`);
      naCelula(l, 3, `=SOMASE(Tratada!$D$2:$D$62;A${l + 1};Tratada!$E$2:$E$62)/B${l + 1}`);
    }
    abrirOCaderno('o caderno da análise');
    escrever(campoPorRotulo('Compare dois grupos'),
      'Carona e ônibus moram longe parecido, 8,37 e 9,05 km, mas a carona vai a 17,37 reuniões e o ônibus a 11,35.', 'comparação');
    clicar(botao('Pouco: são poucas pessoas'), 'pouco');
    expect(faltam()).toBe(0);
  });
});

describe('o módulo 7: a relação', () => {
  it('fecha as quatro com a dispersão, a reta, o r e o caderno', () => {
    montar('relacao');
    expect(faltam()).toBe(quantas('relacao'));
    selecionar(0, INDICE.distancia, 61, INDICE.presencas);
    irParaGuia('Inserir');
    clicar(porRotulo('Inserir Gráfico com os dados selecionados'), 'inserir gráfico');
    escolher(porRotulo('Tipo'), 'dispersao', 'tipo');
    escrever(porRotulo('Título'), 'Distância e presença', 'título');
    escrever(porRotulo('Eixo horizontal'), 'Distância (km)', 'eixo x');
    escrever(porRotulo('Eixo vertical'), 'Presenças', 'eixo y');
    clicar(botao('OK'), 'OK');
    clicar(porRotulo('Linha de Tendência'), 'tendência');
    clicar(porRotulo('Exibir Equação no gráfico'), 'equação');
    irParaAba('Cálculos');
    naCelula(8, 1, '=CORREL(Tratada!E2:E62;Tratada!F2:F62)');
    abrirOCaderno('o caderno da análise');
    escrever(campoPorRotulo('O que a relação sugere'),
      'O r é de -0,70: quem mora mais longe tende a ir a menos reuniões de sábado.', 'sugere');
    escrever(campoPorRotulo('O que ela não prova'),
      'Não prova que a distância causa a falta: quem mora longe também pega ônibus, e a carona falta pouco.', 'não prova');
    expect(faltam()).toBe(0);
  });
});

/* ── Módulo 8 ─────────────────────────────────────────────────────────────── */

describe('o módulo 8: o painel', () => {
  const grafico = (tipo: string, titulo: string, x: string, y: string) => {
    irParaGuia('Inserir');
    clicar(porRotulo('Inserir Gráfico com os dados selecionados'), 'inserir gráfico');
    escolher(porRotulo('Tipo'), tipo, 'tipo');
    escrever(porRotulo('Título'), titulo, 'título');
    if (x) escrever(porRotulo('Eixo horizontal'), x, 'eixo x');
    if (y) escrever(porRotulo('Eixo vertical'), y, 'eixo y');
    clicar(botao('OK'), 'OK');
  };

  it('fecha as três com quatro gráficos, quatro perguntas e quatro tipos certos', () => {
    montar('painel');
    expect(faltam()).toBe(quantas('painel'));
    irParaAba('Tratada');
    escrever(porRotulo('Título do gráfico'), 'Quem mora mais longe vai a menos reuniões?', 'título');
    irParaAba('Grupos');
    selecionar(1, 0, 4, 2);
    grafico('colunas', 'Quem vem de carona falta menos que quem vem de ônibus?', 'Como chega', 'Média de presenças');
    irParaAba('Unidades');
    selecionar(1, 0, 6, 2);
    grafico('colunas', 'Alguma unidade falta mais que as outras?', 'Unidade', 'Média de presenças');
    irParaAba('Distâncias');
    selecionar(1, 0, 4, 1);
    grafico('pizza', 'Quantos desbravadores moram longe do clube?', '', '');
    expect(faltam()).toBe(0);
  });
});

/* ── Módulos 9 a 11 ───────────────────────────────────────────────────────── */

describe('o módulo 9: a conclusão', () => {
  it('fecha as quatro reescrevendo as três partes', () => {
    montar('conclusao');
    expect(faltam()).toBe(quantas('conclusao'));
    escrever(campoPorRotulo('O que os dados mostram'), CONCLUSAO_FEITA.mostram, 'mostram');
    escrever(campoPorRotulo('O que os dados não permitem afirmar'), CONCLUSAO_FEITA.naoPermitem, 'não permitem');
    escrever(campoPorRotulo('Recomendação ao clube'), CONCLUSAO_FEITA.recomendacao, 'recomendação');
    expect(faltam()).toBe(0);
  });

  it('o rascunho diz quantas páginas ocupa, e passa de duas', () => {
    montar('conclusao');
    expect(container.textContent).toMatch(/palavras · cerca de [3-9] páginas/);
  });
});

describe('o módulo 10: a apresentação', () => {
  it('fecha as três com o público, os minutos e o registro', () => {
    montar('apresentacao');
    expect(faltam()).toBe(quantas('apresentacao'));
    clicar(botao('A diretoria do clube'), 'diretoria');
    for (const [rotulo, m] of [
      ['Tudo o que eu limpei, passo a passo', '1'], ['As medidas de cada coluna', '0'],
      ['Os quatro gráficos', '3'], ['A recomendação ao clube', '1'], ['Perguntas de quem decide', '1'],
    ]) escrever(porRotulo(`Minutos: ${rotulo}`), m, rotulo);
    escrever(porRotulo('Quando apresentou'), '29/08/2026', 'data');
    escrever(porRotulo('Quem estava'), 'A diretoria do clube', 'quem');
    escrever(campoPorRotulo('A decisão tomada'),
      'A diretoria aprovou a lista de carona e pediu a presença de dezembro para comparar.', 'decisão');
    expect(faltam()).toBe(0);
  });
});

describe('o módulo 11: a entrega', () => {
  const moverParaAPasta = (nome: string) => {
    clicar(porRotulo(`Mais ações de ${nome}`), `menu de ${nome}`);
    clicar(porTexto('[role="menuitem"]', 'Mover para'), 'mover para');
    escolher(porRotulo('Pasta de destino'), 'f-projeto', 'pasta de destino');
    clicar(botao('Concluído'), 'concluído');
  };

  it('fecha as três movendo os três entregáveis e compartilhando para ler', () => {
    montar('entrega');
    expect(faltam()).toBe(quantas('entrega'));
    clicar(porRotulo('Mais ações de chamada_1sem_2026 (1)'), 'menu da cópia');
    clicar(porTexto('[role="menuitem"]', 'Histórico de versões'), 'histórico');
    expect(container.textContent).toContain('Você');
    clicar(botao('Fechar'), 'fechar');
    for (const nome of ['chamada_1sem_2026', 'Análise da presença — bruta, tratada e contas', 'Relatório final — presença']) {
      moverParaAPasta(nome);
    }
    clicar(porRotulo('Mais ações de Projeto de dados — presença'), 'menu da pasta');
    clicar(porTexto('[role="menuitem"]', 'Compartilhar'), 'compartilhar');
    clicar(botao('Adicionar'), 'adicionar');
    clicar(botao('Concluído'), 'concluído');
    expect(faltam()).toBe(0);
  });
});
