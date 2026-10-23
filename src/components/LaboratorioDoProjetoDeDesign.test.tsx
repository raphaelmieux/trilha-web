// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDoProjetoDeDesign from './LaboratorioDoProjetoDeDesign';
import {
  ALTERACAO_DE_REFERENCIA, ORIGENS_DE_REFERENCIA, PROPOSTA_DE_REFERENCIA, RASCUNHOS_DE_REFERENCIA,
  ROTEIRO_DE_REFERENCIA, VERSOES_DE_REFERENCIA, metasDa, type LicaoDaCcDg006,
} from '../labs/metasDaCcDg006';
import {
  CREDITO_DA_FOGUEIRA, IMAGENS_DO_PROJETO, MAPA_DA_ENTREGA, MARROM, NOMES_DOS_FINAIS, ONDE_NO_CONVITE,
  RESPONDENTES, VERDE, pastaComoChegou,
} from '../labs/acampamentoDasFamilias';
import { PARTES_DA_FALA, PECAS_DO_PROJETO } from '../labs/projetoDeDesign';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As nove lições da CC-DG006, levadas até o fim pelos cliques que o
  desbravador daria — a proposta mandada ao examinador, o símbolo desenhado
  no lugar do clipart, a foto endireitada e exportada com outro nome, o
  convite com a foto sangrando e o PDF da gráfica, o post refeito na
  proporção do feed, as versões explicadas, a pasta separada em editáveis e
  finais, a mudança que o público pediu e o roteiro de quinze minutos.

  `metasDaCcDg006.test.ts` prova que cada meta pode ficar verde chamando o
  motor; esta prova que as cinco telas chamam.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

function montar(qual: LicaoDaCcDg006) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${qual}`, tipo: 'projeto-de-design', titulo: 'Lição de teste', resumo: '', licao: qual,
    verificacoes: metasDa(qual).map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'projeto-de-design' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDoProjetoDeDesign vereda={{ code: 'CC-DG006' } as Vereda} licao={licao} aoVencer={async () => {}} aoSair={() => {}} />
      </MemoryRouter>,
    );
  });
}

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

/* ── Os gestos ────────────────────────────────────────────────────────────── */

const clicar = (alvo: Element | null | undefined, nome = '', shiftKey = false) => {
  expect(alvo, `não achei ${nome || 'o alvo'} na tela`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey })); });
};
const duploClique = (alvo: Element | null | undefined, nome = '') => {
  expect(alvo, `não achei ${nome || 'o alvo'} na tela`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); });
};
const escrever = (campo: Element | null | undefined, texto: string, nome: string) => {
  expect(campo, `não achei o campo "${nome}"`).toBeTruthy();
  act(() => {
    const el = campo as HTMLInputElement;
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, texto);
    el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
  });
};
const tecla = (alvo: Element | null | undefined, key: string) => {
  expect(alvo, `não achei onde apertar ${key}`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })); });
};
const sair = (alvo: Element | null | undefined) => act(() => { alvo!.dispatchEvent(new FocusEvent('focusout', { bubbles: true })); });
const ponteiro = (alvo: Element | null | undefined, tipo: string, x = 0, y = 0) => {
  expect(alvo, `não achei onde fazer ${tipo}`).toBeTruthy();
  act(() => { alvo!.dispatchEvent(new PointerEvent(tipo, { bubbles: true, button: 0, clientX: x, clientY: y })); });
};

const porRotulo = (r: string) => container.querySelector(`[aria-label="${r}"]`);
const porTexto = (seletor: string, comeco: string, raiz: ParentNode = container) =>
  [...raiz.querySelectorAll(seletor)].find(e => e.textContent?.trim().startsWith(comeco));
const botao = (comeco: string) => porTexto('button', comeco);
const rotuloComTexto = (texto: string) =>
  [...container.querySelectorAll('label')].find(l => l.textContent?.trim().startsWith(texto))?.querySelector('input');
const faltam = (): number => {
  const casa = (container.textContent ?? '').match(/(\d+) de (\d+) concluídas/);
  return casa ? Number(casa[2]) - Number(casa[1]) : -1;
};
const abrirOCaderno = () => clicar(botao('Abrir o caderno'), 'abrir o caderno');
const voltarAoPrograma = () => clicar(botao('Voltar ao programa'), 'voltar ao programa');

/* O editor de design. */
const secoes = () => container.querySelectorAll('.dz-esquerda .dz-secao');
const prancha = (nome: string) => clicar(
  [...secoes()[0].querySelectorAll('.dz-lista-item')].find(b => b.textContent?.trim() === nome), `a prancha ${nome}`);
const camada = (nome: string, somar = false) => clicar(
  [...secoes()[1].querySelectorAll('.dz-lista-item')].find(b => b.textContent?.trim() === nome), `a camada ${nome}`, somar);
const campoDz = (rotulo: string, valor: string | number) => {
  escrever(porRotulo(rotulo), String(valor), rotulo);
  tecla(porRotulo(rotulo), 'Enter');
};
const menuDz = (qual: string, comeco: string) => {
  clicar(porTexto('.dz-menu-botao', qual), `o menu ${qual}`);
  clicar(porTexto('.dz-menu-item', comeco), `o item ${comeco}`);
};
const forma = (ferramenta: string, x: number, y: number, l: number, a: number, cor: string) => {
  clicar(porRotulo(ferramenta), ferramenta);
  ponteiro(container.querySelector('.dz-prancha'), 'pointerdown', x, y);
  campoDz('L', l); campoDz('A', a); campoDz('X', x); campoDz('Y', y);
  campoDz('Preenchimento', cor);
};
const mudarTexto = (nome: string, conteudo: string, corpo?: number, y?: number) => {
  camada(nome);
  escrever(porRotulo('Conteúdo do texto'), conteudo, 'conteúdo');
  sair(porRotulo('Conteúdo do texto'));
  if (corpo !== undefined) campoDz('Corpo', corpo);
  if (y !== undefined) campoDz('Y', y);
};
const excluirCamada = (nome: string) => { camada(nome); menuDz('Editar', 'Excluir'); };

/* O editor de foto. */
const campoFt = (rotulo: string, valor: string | number) => escrever(porRotulo(rotulo), String(valor), rotulo);
const menuFt = (qual: string, comeco: string) => {
  clicar(porTexto('.ft-menu-botao', qual), `o menu ${qual}`);
  clicar(porTexto('.ft-menu-item', comeco), `o item ${comeco}`);
};

/* O diagramador. */
const campoDg = (rotulo: string, valor: string | number) => {
  escrever(porRotulo(rotulo), String(valor), rotulo);
  tecla(porRotulo(rotulo), 'Enter');
};
const menuDg = (qual: string, comeco: string) => {
  clicar(porTexto('.dg-menu-botao', qual), `o menu ${qual}`);
  clicar(porTexto('.dg-menu-item', comeco), `o item ${comeco}`);
};
const posicionar = (x: number, y: number, l: number, a: number) => {
  campoDg('X (mm)', x); campoDg('Y (mm)', y); campoDg('Largura (mm)', l); campoDg('Altura (mm)', a);
};
const porImagem = (imagem: string, x: number, y: number, l: number, a: number) => {
  clicar(porRotulo('Quadro de imagem (F)'), 'quadro de imagem');
  escrever(porRotulo('Imagem a pôr'), imagem, 'imagem a pôr');
  ponteiro(porRotulo('Página 1'), 'pointerdown', x, y);
  posicionar(x, y, l, a);
};

/* A nuvem. */
const acoesDe = (nome: string) => clicar(porRotulo(`Mais ações de ${nome}`), `as ações de ${nome}`);
const itemDoMenu = (comeco: string) => clicar(porTexto('[role="menu"] button', comeco), comeco);
const novaPasta = (nome: string) => {
  clicar(botao('Nova pasta'), 'nova pasta');
  escrever(porRotulo('Nome da pasta nova'), nome, 'nome da pasta');
  clicar(botao('Criar'), 'criar');
};
const moverPara = (arquivo: string, pasta: string) => {
  acoesDe(arquivo);
  itemDoMenu('Mover para');
  const destino = porRotulo('Pasta de destino') as HTMLSelectElement;
  const opcao = [...destino.options].find(o => o.textContent === pasta);
  escrever(destino, opcao!.value, `destino ${pasta}`);
  clicar(botao('Concluído'), 'concluído');
};

/* ── As lições ────────────────────────────────────────────────────────────── */

describe('as nove lições da CC-DG006, pela tela', () => {
  it('módulo 1: a proposta, aprovada antes de começar', () => {
    montar('proposta');
    escrever(container.querySelector('#demanda'), PROPOSTA_DE_REFERENCIA.demanda, 'demanda');
    escrever(porRotulo('O público'), PROPOSTA_DE_REFERENCIA.publico, 'público');
    expect(faltam()).toBe(2);
    escrever(porRotulo('Onde a peça digital vai circular'), PROPOSTA_DE_REFERENCIA.meio, 'meio');
    for (const p of PECAS_DO_PROJETO) clicar(rotuloComTexto(p.nome), p.nome);
    expect(faltam()).toBe(1);
    clicar(botao('Enviar para aprovação'), 'enviar');
    expect(container.textContent).toContain('Proposta aprovada');
    clicar(botao('Começar a produzir'), 'começar');
    expect(faltam()).toBe(0);
  });

  it('módulo 2: o símbolo no lugar do clipart', () => {
    montar('simbolo');
    excluirCamada('barraca-clipart.png');
    forma('Retângulo (R)', 60, 300, 280, 24, MARROM);
    forma('Elipse (E)', 110, 110, 180, 180, VERDE);
    camada('Retângulo'); camada('Elipse', true);
    clicar(porRotulo('Agrupar (Ctrl+G)'), 'agrupar');
    expect(faltam()).toBe(1);
    menuDz('Exibir', 'Ver em 64, 32 e 16 px');
    expect(faltam()).toBe(0);
  });

  it('módulo 3: a foto tratada com outro nome, e a origem de cada imagem', () => {
    montar('imagens');
    clicar(porRotulo('Recortar (C)'), 'recortar');
    campoFt('Endireitar (graus)', -3.5);
    campoFt('X do recorte', 80); campoFt('Y do recorte', 60);
    campoFt('Largura do recorte', 1640); campoFt('Altura do recorte', 1080);
    clicar(botao('Aplicar recorte'), 'aplicar recorte');
    campoFt('Exposição', 0.7); campoFt('Contraste', 30); campoFt('Temperatura', 40);
    clicar(botao('Aplicar ajustes'), 'aplicar ajustes');
    menuFt('Arquivo', 'Exportar como');
    campoFt('Nome do arquivo', 'acampamento-tratada');
    clicar([...container.querySelectorAll('[role="dialog"] button')].find(b => /^(Exportar|Substituir)$/.test(b.textContent ?? '')), 'exportar');
    expect(faltam()).toBe(2);

    abrirOCaderno();
    for (const i of IMAGENS_DO_PROJETO) {
      escrever(porRotulo(`Licença de ${i.nome}`), ORIGENS_DE_REFERENCIA[i.id].licenca!, `licença de ${i.nome}`);
      escrever(porRotulo(`Autor de ${i.nome}`), ORIGENS_DE_REFERENCIA[i.id].autor, `autor de ${i.nome}`);
    }
    escrever(container.querySelector('#credito'), CREDITO_DA_FOGUEIRA, 'crédito');
    expect(faltam()).toBe(0);
  }, 90000);

  it('módulo 4: o convite com a foto tratada sangrando, o símbolo, o lugar, o crédito e o PDF', () => {
    montar('impressa');
    ponteiro(porRotulo('Imagem barraca-clipart.png'), 'pointerdown');
    menuDg('Editar', 'Excluir');
    ponteiro(porRotulo('Imagem IMG_0412.jpg'), 'pointerdown');
    menuDg('Editar', 'Excluir');
    porImagem('tratada', -3, -3, 154, 95);
    porImagem('simbolo', 118, 176, 20, 16.7);
    expect(faltam()).toBe(3);

    menuDg('Texto', 'Editar matéria');
    escrever(porRotulo('Texto do parágrafo novo'), ONDE_NO_CONVITE, 'onde');
    clicar(botao('Acrescentar'), 'acrescentar');
    escrever(porRotulo('Texto do parágrafo novo'), CREDITO_DA_FOGUEIRA, 'crédito');
    escrever(porRotulo('Estilo do parágrafo novo'), 'legenda', 'estilo');
    clicar(botao('Acrescentar'), 'acrescentar o crédito');
    clicar(botao('Fechar'), 'fechar');
    expect(faltam()).toBe(1);

    menuDg('Arquivo', 'Exportar PDF');
    campoDg('Sangria no PDF (mm)', 3);
    clicar(porRotulo('Marcas de corte'), 'marcas de corte');
    escrever(porRotulo('Cor'), 'cmyk', 'cor');
    clicar([...container.querySelectorAll('[role="dialog"] button')].find(b => b.textContent?.trim() === 'Exportar'), 'exportar');
    expect(faltam()).toBe(0);
  });

  it('módulo 5: o post refeito na proporção do feed, com a versão encolhida guardada', () => {
    montar('digital');
    clicar(botao('Duplicar prancha'), 'duplicar');
    expect(faltam()).toBe(4);
    prancha('Post');
    clicar(container.querySelector('.dz-prancha'), 'o vazio da prancha');
    escrever(porRotulo('Tamanho da prancha'), '1080x1350', 'tamanho');
    excluirCamada('Convite');
    excluirCamada('Crédito');
    excluirCamada('barraca-clipart.png');
    mudarTexto('Título', 'Acampamento das Famílias', 92, 680);
    mudarTexto('Data', 'Sábado, 14 de setembro', 56, 920);
    mudarTexto('Lugar', 'Chácara Recanto Verde', 48, 1000);
    expect(faltam()).toBe(1);

    prancha('Símbolo');
    camada('Símbolo');
    menuDz('Editar', 'Copiar');
    prancha('Post');
    menuDz('Editar', 'Colar');
    campoDz('L', 140); campoDz('X', 880); campoDz('Y', 1150);
    expect(faltam()).toBe(0);
  });

  it('módulo 6: os rascunhos e as versões descartadas', () => {
    montar('processo');
    for (const r of RASCUNHOS_DE_REFERENCIA) {
      escrever(porRotulo('Ideia do rascunho'), r.ideia, 'ideia');
      clicar(botao('Registrar'), 'registrar');
    }
    expect(faltam()).toBe(1);
    expect(container.querySelectorAll('[aria-label^="Versão "]').length).toBe(2);
    for (const [id, d] of Object.entries(VERSOES_DE_REFERENCIA)) {
      const nome = container.querySelector(`#motivo-${id}`)!.closest('.card')!.querySelector('p')!.textContent!;
      clicar(porRotulo(`Descartada: ${nome}`), `descartada ${nome}`);
      escrever(container.querySelector(`#motivo-${id}`), d.motivo, `motivo de ${id}`);
    }
    expect(faltam()).toBe(0);
  });

  it('módulo 7: a pasta separada em editáveis, finais e originais', () => {
    montar('arquivos');
    novaPasta('Editáveis');
    novaPasta('Finais');
    novaPasta('Originais e versões');
    const n = pastaComoChegou();
    const nomeDe = (id: string) => n.arquivos.find(a => a.id === id)!.nome;
    for (const [id, x] of Object.entries(MAPA_DA_ENTREGA)) {
      if (x.papel === 'clipart') { acoesDe(nomeDe(id)); itemDoMenu('Mover para a lixeira'); continue; }
      moverPara(nomeDe(id), x.papel === 'editavel' ? 'Editáveis' : x.papel === 'final' ? 'Finais' : 'Originais e versões');
    }
    expect(faltam()).toBe(1);

    duploClique(porTexto('[role="row"]', 'Finais'), 'a pasta Finais');
    for (const [id, novo] of Object.entries(NOMES_DOS_FINAIS)) {
      acoesDe(nomeDe(id));
      itemDoMenu('Renomear');
      escrever(porRotulo(`Novo nome de ${nomeDe(id)}`), novo, 'novo nome');
      tecla(porRotulo(`Novo nome de ${nomeDe(id)}`), 'Enter');
    }
    expect(faltam()).toBe(0);
  });

  it('módulo 8: os cinco do público, e a mudança que a Lúcia pediu', () => {
    montar('retorno');
    for (const r of RESPONDENTES.filter(x => x.doPublico)) {
      clicar(porRotulo(`Do público: ${r.nome}`), r.nome);
      escrever(porRotulo(`Leitura de ${r.nome}`), r.leitura, `leitura de ${r.nome}`);
    }
    expect(faltam()).toBe(1);
    escrever(porRotulo('Retorno que motivou a mudança'), ALTERACAO_DE_REFERENCIA.respondente, 'quem');
    escrever(container.querySelector('#o-que-mudou'), ALTERACAO_DE_REFERENCIA.oQueMudou, 'o que mudou');
    expect(faltam()).toBe(1);
    voltarAoPrograma();
    mudarTexto('Data', 'Sábado, 14 de setembro, 8h às 17h');
    expect(faltam()).toBe(0);
  });

  it('módulo 9: quinze minutos, com a peça impressa', () => {
    montar('apresentacao');
    for (const p of PARTES_DA_FALA) escrever(porRotulo(`Minutos: ${p.nome}`), String(ROTEIRO_DE_REFERENCIA[p.id] ?? 0), p.nome);
    expect(faltam()).toBe(1);
    clicar(rotuloComTexto('Levo a peça impressa'), 'levo a peça');
    expect(faltam()).toBe(0);
  });
});

describe('o que as telas não podem deixar fácil', () => {
  it('começar a produzir antes da aprovação fica registrado, e a lição não fecha', () => {
    montar('proposta');
    clicar(botao('Começar a produzir'), 'começar');
    escrever(container.querySelector('#demanda'), PROPOSTA_DE_REFERENCIA.demanda, 'demanda');
    escrever(porRotulo('O público'), PROPOSTA_DE_REFERENCIA.publico, 'público');
    escrever(porRotulo('Onde a peça digital vai circular'), PROPOSTA_DE_REFERENCIA.meio, 'meio');
    for (const p of PECAS_DO_PROJETO) clicar(rotuloComTexto(p.nome), p.nome);
    clicar(botao('Enviar para aprovação'), 'enviar');
    expect(faltam()).toBe(1);
  });

  it('a proposta sem público volta do examinador dizendo o que falta', () => {
    montar('proposta');
    escrever(container.querySelector('#demanda'), PROPOSTA_DE_REFERENCIA.demanda, 'demanda');
    escrever(porRotulo('O público'), 'todo mundo', 'público');
    clicar(botao('Enviar para aprovação'), 'enviar');
    expect(container.textContent).toContain('devolveu');
    expect(container.textContent).toContain('"todo mundo"');
  });

  it('a nuvem não oferece mover a pasta para dentro dela mesma', () => {
    montar('arquivos');
    novaPasta('Finais');
    acoesDe('Finais');
    itemDoMenu('Mover para');
    const opcoes = [...(porRotulo('Pasta de destino') as HTMLSelectElement).options].map(o => o.textContent);
    expect(opcoes).not.toContain('Finais');
    expect(opcoes).toContain('Acampamento das Famílias');
  });

  it('o retorno abre no caderno, porque mudar antes de ler é mudar no escuro', () => {
    montar('retorno');
    expect(porRotulo(`Do público: ${RESPONDENTES[0].nome}`)).toBeTruthy();
  });
});
