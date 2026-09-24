// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LaboratorioDeComunicacao from './LaboratorioDeComunicacao';
import { LICOES_DA_CC_ES007, type LicaoDaCcEs007 } from '../labs/metasDaCcEs007';
import { MARCIO_SO_DEPOIS_DE } from '../labs/agenda';
import type { LicaoDeVereda, Vereda } from '../curriculum/veredas';

/*
  As doze lições da CC-ES007, levadas até o fim pelos mesmos cliques que o
  desbravador daria.

  ── Por que esta trava existe ao lado da de motor ────────────────────────
  `metasDaCcEs007.test.ts` prova que cada meta **pode** ficar verde chamando o
  motor. Isso não prova que a janela chama alguma delas: um botão sem
  `onClick`, um diálogo cujo Enviar não envia, um campo que não escreve — o
  motor continua correto e o laboratório fica impossível de vencer, que é pior
  do que um que abre resolvido, porque quem fez tudo certo fica olhando uma
  lista vermelha sem nada na tela que explique.

  É a razão escrita em `LaboratorioDeExplorador.test.tsx`, em
  `LaboratorioDePdf.test.tsx`, em `LaboratorioDeContas.test.tsx` e em
  `LaboratorioDaNuvem.test.tsx`: trava de motor não é trava de tela. Na
  CC-ES004 foi ela que achou a lição de assinar que ninguém conseguia fechar,
  na CC-ES005 o gerador que entregava a mesma senha duas vezes, e na CC-ES006
  o Enter que deixava o cursor no parágrafo de cima.
*/

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const VEREDA = { code: 'CC-ES007' } as Vereda;

function montar(licaoId: LicaoDaCcEs007) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const licao = {
    id: `lab-${licaoId}`,
    tipo: 'comunicacao',
    titulo: 'Lição de teste',
    resumo: '',
    licao: licaoId,
    verificacoes: LICOES_DA_CC_ES007[licaoId].metas.map(m => m.id),
  } as Extract<LicaoDeVereda, { tipo: 'comunicacao' }>;
  act(() => {
    root.render(
      <MemoryRouter>
        <LaboratorioDeComunicacao vereda={VEREDA} licao={licao}
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
function escrever(campo: HTMLElement | null | undefined, valor: string) {
  expect(campo, 'o campo não está na tela').toBeTruthy();
  const c = campo as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  const proto = c instanceof HTMLSelectElement ? HTMLSelectElement.prototype
    : c instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
  act(() => {
    setter.call(c, valor);
    c.dispatchEvent(new Event('input', { bubbles: true }));
    c.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

const campo = (rotulo: string) => porRotulo(rotulo) as HTMLElement | undefined;

/**
 * Marcar uma caixa é clicar nela, e não escrever no `.checked`.
 *
 * O React ouve o **clique** numa caixa de marcação, e derruba o evento quando
 * o valor que ele guarda já bate com o que está no campo. Escrever no
 * `.checked` antes faria a trava ver a caixa não reagir e acusar o componente
 * de um defeito que é do teste — é a mesma família do `input.value = x` e do
 * `pointerenter` que o React não escuta.
 */
const marcar = (rotulo: string, ligado = true) => {
  /* A caixa é nomeada pelo `aria-label` ou pelo `<label>` que a embrulha — e
     as duas formas existem nas três janelas, porque as duas nomeiam. */
  const c = (porRotulo(rotulo)
    ?? todos<HTMLLabelElement>('label')
      .find(l => (l.textContent ?? '').includes(rotulo))
      ?.querySelector('input[type="checkbox"]')) as HTMLInputElement | undefined;
  expect(c, `a caixa "${rotulo}" não está na tela`).toBeTruthy();
  if (c!.checked === ligado) return;
  act(() => { c!.click(); });
};

/**
 * Quantas tarefas ainda faltam, lido da cápsula da moldura.
 *
 * É o número que o desbravador vê — e é ele que precisa chegar a zero, e não
 * uma conta refeita aqui. Refazê-la seria conferir o motor de novo, que já tem
 * trava própria.
 */
const faltam = () => {
  /*
    O casamento é **exato**, e não por conter.
    
    Uma das mensagens da caixa se chama "Faltam duas diárias para fechar", e a
    linha dela é um botão: procurar por conter achava a linha antes da cápsula,
    a expressão não casava, e a trava lia zero tarefas restantes numa lição que
    abria com duas. Trava que lê o número errado é pior do que trava nenhuma.
  */
  const bt = todos<HTMLButtonElement>('button')
    .find(b => /^Faltam \d+$/.test((b.textContent ?? '').trim())
      || (b.textContent ?? '').trim() === 'Concluir a lição');
  expect(bt, 'a cápsula da moldura não está na tela').toBeTruthy();
  const m = /^Faltam (\d+)$/.exec((bt!.textContent ?? '').trim());
  return m ? Number(m[1]) : 0;
};

const abrirMensagem = (assunto: string) =>
  clicar(todos<HTMLElement>('[aria-label]')
    .find(b => (b.getAttribute('aria-label') ?? '').startsWith(`Abrir: ${assunto}`)));

const escrever_mensagem = (o: {
  grupo?: string; para?: string[]; assunto: string; corpo: string; comCopia?: boolean;
}) => {
  clicar(porRotulo('Escrever'));
  if (o.comCopia) clicar(porTexto('Cc'));
  if (o.grupo) clicar(porRotulo(o.grupo));
  for (const p of o.para ?? []) {
    const c = campo('Para') as HTMLInputElement;
    escrever(c, p);
    act(() => {
      c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
  }
  escrever(campo('Assunto'), o.assunto);
  escrever(campo('Mensagem'), o.corpo);
};

const enviar = () => clicar(porTexto('Enviar'));

const abrirConfiguracoes = (aba: string) => {
  clicar(porRotulo('Configurações'));
  clicar(porTexto(aba));
};

/* ────────────────────────────────────────────────────────────────────────────
   O correio
   ──────────────────────────────────────────────────────────────────────── */

describe('as lições de correio se fecham clicando', () => {
  it('a cópia oculta', () => {
    montar('cco');
    expect(faltam()).toBe(3);

    abrirMensagem('Datas do campori regional');
    clicar(porTexto('Voltar'));

    escrever_mensagem({
      comCopia: true, grupo: 'No Cco, trazer as 52 famílias',
      assunto: 'Acampamento de Inverno — o que levar',
      corpo: 'Saída dia 3 de julho às 6h.',
    });
    enviar();

    escrever_mensagem({
      grupo: 'No Para, trazer a direção',
      assunto: 'Ônibus do acampamento',
      corpo: 'Podemos fechar com a Viação Planalto?',
    });
    enviar();

    expect(faltam(), 'a lição da cópia oculta não fecha clicando').toBe(0);
  });

  it('a mensagem que se entende', () => {
    montar('mensagem');
    expect(faltam()).toBe(4);

    abrirConfiguracoes('Geral');
    escrever(campo('Assinatura'), 'Marina Duarte — Secretaria do Clube Pioneiros');
    clicar(porRotulo('Voltar para o correio'));

    /* O rascunho já está aberto: o que a lição pede é arrumá-lo, e não
       escrever outro. */
    escrever(campo('Assunto'), 'Confirmação do ônibus do acampamento');
    escrever(campo('Mensagem'),
      'Prezados conselheiros,\n\n'
      + 'A gente precisa fechar o número de quem vai no ônibus do acampamento. '
      + 'A saída é dia 3 de julho às 6h da Igreja Central.\n\n'
      + 'Peço que me confirmem o número da unidade de vocês até quarta.');
    enviar();

    expect(faltam(), 'a lição da mensagem não fecha clicando').toBe(0);
  });

  it('o arquivo pesado', () => {
    montar('pesado');
    expect(faltam()).toBe(3);

    escrever_mensagem({
      comCopia: true, grupo: 'No Cco, trazer as 52 famílias',
      assunto: 'Fotos do acampamento', corpo: 'Estão aqui.',
    });
    clicar(porRotulo('Anexar arquivo'));
    enviar();
    expect(container.textContent, 'o correio não recusou o anexo de 180 MB')
      .toContain('não foi enviada');

    clicar(porRotulo('Inserir vínculo de arquivo'));
    clicar(porTexto('Mudar quem abre'));
    enviar();

    expect(faltam(), 'a lição do arquivo pesado não fecha clicando').toBe(0);
  });

  it('a caixa que se usa', () => {
    montar('caixa');
    expect(faltam()).toBe(2);

    for (const assunto of [
      'Escala das unidades já está no mural',
      'Confirmado: salão reservado',
      'Boletim de junho',
      'Re: Lista do que levar',
      'Sua senha foi alterada',
      'Datas do campori regional',
    ]) {
      abrirMensagem(assunto);
      clicar(porTexto('Arquivar'));
      clicar(porTexto('Voltar'));
    }

    escrever(campo('Pesquisar no correio'), 'salão');

    expect(faltam(), 'a lição da caixa não fecha clicando').toBe(0);
  });

  it('a lista da unidade', () => {
    montar('lista');
    expect(faltam()).toBe(4);

    abrirConfiguracoes('Listas');
    marcar('Daniel Rocha na Unidade Falcão', false);
    marcar('Helena Prado na Unidade Falcão', true);

    escrever(campo('Nome da lista nova'), 'Unidade Águia');
    clicar(porTexto('Criar lista'));
    for (const nome of ['Ana Beatriz Rocha', 'Gabriela Nunes', 'Rafael Brito', 'Vitória Sales']) {
      marcar(`${nome} na Unidade Águia`, true);
    }
    clicar(porRotulo('Voltar para o correio'));

    escrever_mensagem({
      para: ['unidade.falcao@clubepioneiros.org.br'],
      assunto: 'Escala de cozinha da Falcão',
      corpo: 'A Falcão cozinha no sábado de manhã.',
    });
    enviar();

    expect(faltam(), 'a lição da lista não fecha clicando').toBe(0);
  });

  it('a resposta de ausência', () => {
    montar('ausencia');
    expect(faltam()).toBe(3);

    abrirConfiguracoes('Resposta automática');
    marcar('Ligar a resposta automática');
    escrever(campo('Primeiro dia'), '2026-07-10');
    escrever(campo('Último dia'), '2026-07-25');
    escrever(campo('Texto da resposta automática'),
      'Estou fora da secretaria até 25 de julho. Para o acampamento, fale com a '
      + 'tesouraria: tesouraria@clubepioneiros.org.br.');
    marcar('Responder só a quem está nos contatos');

    expect(faltam(), 'a lição da ausência não fecha clicando').toBe(0);
  });

  it('a pauta e a ata', () => {
    montar('pauta');
    expect(faltam()).toBe(2);

    abrirMensagem('Confirmação da reserva do ônibus');
    clicar(porTexto('Arquivar'));
    clicar(porTexto('Voltar'));

    escrever_mensagem({
      grupo: 'No Para, trazer a direção',
      assunto: 'Pauta da reunião do conselho de 28 de julho',
      corpo: 'Prezados,\n\nSegue a pauta:\n'
        + '1. Prestação de contas do acampamento\n'
        + '2. Escala do segundo semestre\n'
        + '3. Compra do material da ordem unida\n',
    });
    enviar();

    escrever_mensagem({
      grupo: 'No Para, trazer a direção',
      assunto: 'Ata da reunião do conselho de 28 de julho',
      corpo: 'Decisões:\n'
        + '- Nelson fecha a prestação de contas até dia 5\n'
        + '- Cláudia monta a escala do semestre até sexta\n',
    });
    enviar();

    expect(faltam(), 'a lição da pauta não fecha clicando').toBe(0);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   O calendário
   ──────────────────────────────────────────────────────────────────────── */

const criarEvento = (o: {
  titulo: string; dia: string; inicio: string; fim: string;
  local?: string; descricao?: string; fuso?: string;
}) => {
  clicar(porTexto('Criar'));
  escrever(campo('Título'), o.titulo);
  escrever(campo('Dia'), o.dia);
  escrever(campo('Começa às'), o.inicio);
  escrever(campo('Termina às'), o.fim);
  if (o.local !== undefined) escrever(campo('Local'), o.local);
  if (o.descricao !== undefined) escrever(campo('Descrição'), o.descricao);
  if (o.fuso) escrever(campo('Fuso horário'), o.fuso);
  clicar(porTexto('Salvar'));
};

describe('as lições de calendário se fecham clicando', () => {
  it('o evento que as pessoas acham', () => {
    montar('evento');
    expect(faltam()).toBe(3);

    criarEvento({
      titulo: 'Reunião regional dos clubes',
      dia: '2026-07-08', inicio: '15:00', fim: '16:30',
      local: 'Sede da região — sala 2',
      descricao: 'Fechamento do semestre com os clubes da região. Levar o relatório '
        + 'das especialidades e o número de inscritos do acampamento.',
      fuso: 'America/Rio_Branco',
    });

    expect(faltam(), 'a lição do evento não fecha clicando').toBe(0);
  });

  it('o convite e a resposta', () => {
    montar('convites');
    expect(faltam()).toBe(3);

    /* O evento já existe: a lição é acompanhar as respostas dele. */
    clicar(porRotulo('Abrir: Reunião do conselho — julho'));
    clicar(porTexto('Ver as respostas uma a uma'));
    clicar(porRotulo('Corrigir o endereço de tio.samuel@exmplo.com'));
    clicar(porRotulo('Escrever a quem não respondeu'));
    enviar();

    expect(faltam(), 'a lição dos convites não fecha clicando').toBe(0);
  });

  it('e o calendário acrescenta a sala a distância sozinho, sem passar pela sala', () => {
    /*
      Um programa tem todos os comandos o tempo todo: o calendário de verdade
      acrescenta a videoconferência ao evento, e é o caminho que a maioria das
      pessoas usa. A lição do módulo 11 chega pelo outro lado — o botão
      "Agendar" da sala —, então este comando não é exercitado por meta
      nenhuma. Foi a mutação que apontou: apagar o `onClick` dele não derrubava
      nada, e um botão sem efeito é o que ensina a desconfiar do programa.
    */
    montar('convites');
    clicar(porRotulo('Abrir: Reunião do conselho — julho'));
    expect(container.textContent).toContain('Sem sala a distância');
    clicar(porTexto('Adicionar reunião a distância'));
    expect(container.textContent, 'o comando não pôs vínculo nenhum no evento')
      .toContain('https://reuniao.exemplo.com');
  });

  it('o que se repete', () => {
    montar('recorrente');
    expect(faltam()).toBe(3);

    clicar(porTexto('Criar'));
    escrever(campo('Título'), 'Reunião do clube');
    escrever(campo('Dia'), '2026-06-27');
    escrever(campo('Começa às'), '14:00');
    escrever(campo('Termina às'), '17:00');
    escrever(campo('Local'), 'Igreja Central — salão');
    escrever(campo('Descrição'),
      'Reunião semanal: unidades, especialidades e ordem unida. Levar o lenço.');
    marcar('Repetir toda semana');
    escrever(campo('Repetir até'), '2026-12-19');
    clicar(porTexto('Salvar'));
    clicar(porTexto('Excluir'));
    clicar(porTexto('Este evento'));
    /*
      A caixa confirma com **OK**, e não com "Excluir".

      Dois botões com o mesmo nome — o da caixa e o do evento atrás dela —
      deixavam ambíguo qual estava sendo clicado, e foi assim que esta trava
      viu a lição não fechar: ela reabria a caixa em vez de confirmar. Quem
      navega por teclado ou por leitor de tela tem o mesmo problema, e o
      calendário de verdade confirma com OK.
    */
    clicar(porTexto('OK'));

    criarEvento({
      titulo: 'Volta do acampamento', dia: '2026-07-05', inicio: '17:00', fim: '18:00',
      local: 'Igreja Central — estacionamento',
      descricao: 'Chegada prevista para as 17h. As famílias buscam no estacionamento.',
    });
    criarEvento({
      titulo: 'Reunião do conselho — julho', dia: '2026-07-28', inicio: '19:30', fim: '21:00',
      local: 'Sala da secretaria',
      descricao: 'Fechamento do acampamento e escala do segundo semestre.',
    });

    expect(faltam(), 'a lição da recorrência não fecha clicando').toBe(0);
  });

  it('o calendário do clube', () => {
    montar('calendario');
    expect(faltam()).toBe(4);

    clicar(porRotulo('Opções de Clube Pioneiros'));
    for (const [quem, nivel] of [
      ['diretor@clubepioneiros.org.br', 'alterar'],
      ['direcao.associada@clubepioneiros.org.br', 'alterar'],
      ['falcao@clubepioneiros.org.br', 'ver-detalhes'],
      ['aguia@clubepioneiros.org.br', 'ver-detalhes'],
      ['tucano@clubepioneiros.org.br', 'ver-detalhes'],
      ['arara@clubepioneiros.org.br', 'ver-detalhes'],
      ['jaguar@clubepioneiros.org.br', 'ver-detalhes'],
      ['onca@clubepioneiros.org.br', 'ver-detalhes'],
    ] as const) {
      escrever(campo('A quem dar acesso'), quem);
      escrever(campo('Com que nível'), nivel);
      clicar(porTexto('Dar acesso'));
    }
    clicar(porRotulo('Voltar para o calendário'));

    criarEvento({
      titulo: 'Reunião dos conselheiros',
      dia: '2026-06-26', inicio: '18:00', fim: '19:30',
      local: 'Sala da secretaria',
      descricao: 'Escala de cozinha do acampamento e divisão das unidades por barraca.',
    });
    clicar(porTexto('Ver a disponibilidade dos convidados'));
    clicar(porRotulo('Perguntar a Tio Márcio (Arara)'));
    expect(container.textContent, 'quem não compartilha a agenda não respondeu nada')
      .toContain(MARCIO_SO_DEPOIS_DE);

    expect(faltam(), 'a lição do calendário do clube não fecha clicando').toBe(0);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
   A sala de reunião
   ──────────────────────────────────────────────────────────────────────── */

describe('a lição da sala se fecha clicando', () => {
  it('a reunião a distância', () => {
    montar('reuniao');
    expect(faltam()).toBe(5);

    clicar(porTexto('Agendar no calendário'));
    clicar(porTexto('Entrar agora'));

    clicar(porRotulo('Falar'));
    clicar(porRotulo('Abrir o microfone'));
    clicar(porTexto('Admitir'));

    clicar(porTexto('Apresentar agora'));
    clicar(porTexto('Uma janela'));
    clicar(todos('.re-alvo')[0]);
    clicar(porTexto('Compartilhar'));

    clicar(porTexto('Parar de apresentar'));
    clicar(porTexto('Apresentar agora'));
    clicar(porTexto('Uma guia'));
    clicar(todos('.re-alvo')[0]);
    marcar('Compartilhar também o áudio');
    clicar(porTexto('Compartilhar'));

    expect(faltam(), 'a lição da reunião não fecha clicando').toBe(0);
  });

  it('e falar com o microfone fechado aparece escrito na tela', () => {
    /* O aviso está na tela o tempo todo e todo mundo fala assim mesmo. Um
       laboratório que não contasse o que aconteceu deixaria a descoberta sem
       nada que a confirme. */
    montar('reuniao');
    clicar(porTexto('Entrar agora'));
    clicar(porRotulo('Falar'));
    expect(container.textContent).toContain('microfone fechado');
  });
});

/* ── O que a moldura precisa ter em toda lição ─────────────────────────────── */

describe('toda lição abre com a lista inteira por fazer', () => {
  const TODAS = Object.keys(LICOES_DA_CC_ES007) as LicaoDaCcEs007[];

  it.each(TODAS)('%s abre com o número de tarefas da lição', l => {
    montar(l);
    expect(faltam()).toBe(LICOES_DA_CC_ES007[l].metas.length);
    expect(porTexto('Recomeçar'), 'a saída de quem estragou o exercício sumiu').toBeTruthy();
  });
});
