// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  CSS_DO_LEITOR, FaixaDoLeitor, Folha, PainelDeMiniaturas, CaixaDeProcurar,
  AvisoDeDigitalizacao, MargemDeComentarios, ReguaDoLeitor, BarraDeTitulo,
  type AcoesDoLeitor,
} from './leitorDePdf';
import {
  type DocumentoPdf, type Pagina, type Captura,
  CAPTURA_BOA, reconhecerTexto, assinarComImagem, assinarVerificavel, proteger,
} from './documentoPdf';

/*
  A janela do leitor de PDF, compartilhada.

  A trava é a mesma de `explorer.test.tsx` e de `excel.test.tsx`: peça que some
  no recorte não estoura nada — a janela continua desenhando, só que sem o
  comando, sem a margem, ou sem o que quer que tenha ficado para trás.

  E tem duas que são desta janela, porque é nela que a vereda inteira se apoia:
  a folha desenha **igual** com texto dentro ou sem, e o aviso de digitalização
  some assim que existir qualquer texto — inclusive o que um reconhecimento
  malfeito produziu.
*/

let raiz: Root | null = null;
let caixa: HTMLDivElement | null = null;

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

const digital = (id: string): Pagina =>
  ({ id, linhas: ATA, texto: ATA.join('\n'), origem: 'programa' });

const digitalizada = (id: string, captura: Captura = CAPTURA_BOA): Pagina =>
  ({ id, linhas: ATA, captura, origem: 'papel' });

const doc = (paginas: Pagina[], extras: Partial<DocumentoPdf> = {}): DocumentoPdf =>
  ({ nome: 'ata.pdf', paginas, campos: [], anotacoes: [], ...extras });

/* ── A faixa ──────────────────────────────────────────────────────────────── */

describe('a faixa traz todos os comandos o tempo todo', () => {
  /*
    Um programa tem todos os botões. Um leitor que só mostrasse "Combinar" na
    lição de combinar ensinaria a procurar o botão que a tarefa quer, e não a
    procurar no programa — a regra que o Explorador da CC-ES001 e o Excel da
    CC-ES003 já seguem.
  */
  const COMANDOS = [
    'Combinar', 'Extrair páginas', 'Dividir', 'Reduzir tamanho',
    'Reconhecer texto', 'Comentário', 'Destacar', 'Assinar', 'Proteger',
    'Copiar texto', 'Salvar',
  ];

  /* Os **rótulos**, que são o que a pessoa lê. Ler o `title` deixaria passar
     um botão cujo nome na tela discordasse da dica — que é exatamente o que
     esta trava pegou quando foi escrita. */
  const nomesNaFaixa = (el: HTMLElement) =>
    [...el.querySelectorAll('.pdf-bt .pdf-rotulo')].map(b => b.textContent);

  it('aparecem mesmo quando o laboratório não entrega nenhuma função', () => {
    const el = montar(<FaixaDoLeitor acoes={{}} />);
    for (const c of COMANDOS) expect(nomesNaFaixa(el)).toContain(c);
  });

  it('e o que a lição não faz fica desligado, e não escondido', () => {
    const el = montar(<FaixaDoLeitor acoes={{ aoCombinar: () => {} }} />);
    const bt = (t: string) => el.querySelector<HTMLButtonElement>(`.pdf-bt[title="${t}"]`)!;
    expect(bt('Combinar').disabled).toBe(false);
    expect(bt('Assinar').disabled).toBe(true);
  });

  it('cada comando chama quem o laboratório entregou', () => {
    const chamados: string[] = [];
    const acoes: AcoesDoLeitor = {
      aoComprimir: () => chamados.push('comprimir'),
      aoReconhecer: () => chamados.push('reconhecer'),
    };
    const el = montar(<FaixaDoLeitor acoes={acoes} />);
    act(() => {
      el.querySelector<HTMLButtonElement>('.pdf-bt[title="Reduzir tamanho"]')!.click();
      el.querySelector<HTMLButtonElement>('.pdf-bt[title="Reconhecer texto"]')!.click();
    });
    expect(chamados).toEqual(['comprimir', 'reconhecer']);
  });
});

/* ── A folha ──────────────────────────────────────────────────────────────── */

describe('a folha desenha igual, com texto dentro ou sem', () => {
  it('as duas espécies de página mostram as mesmas linhas', () => {
    /*
      É a premissa da vereda inteira. Se a folha marcasse na tela qual é qual,
      o requisito 5 não teria o que comprovar: bastaria olhar.
    */
    const comTexto = montar(<Folha pagina={digital('p1')} />).textContent;
    act(() => { raiz!.unmount(); });
    caixa!.remove();

    const semTexto = montar(<Folha pagina={digitalizada('p1')} />).textContent;
    expect(semTexto).toBe(comTexto);
  });

  it('mas a captura ruim aparece, senão corrigir não mudaria nada', () => {
    /*
      O requisito 5 manda corrigir enquadramento e contraste. Uma folha que
      desenhasse igual torta e reta faria disso um clique que não muda nada na
      tela — e a tarefa passaria a medir obediência.
    */
    const torta: Captura = { inclinacao: 12, margem: 30, contraste: 35, nitidez: 40 };
    const el = montar(<Folha pagina={digitalizada('p1', torta)} />);
    const folha = el.querySelector<HTMLElement>('.pdf-folha')!;

    expect(folha.style.transform).toContain('rotate(12deg)');
    expect(folha.style.filter).toContain('contrast');
    expect(folha.style.padding).not.toBe('');
  });

  it('a página de programa não finge ser foto', () => {
    const el = montar(<Folha pagina={digital('p1')} />);
    const folha = el.querySelector<HTMLElement>('.pdf-folha')!;
    expect(folha.dataset.papel).toBe('nao');
    expect(folha.style.transform).toBe('');
  });
});

/* ── O aviso ──────────────────────────────────────────────────────────────── */

describe('o aviso de digitalização é o do programa, não nosso', () => {
  it('aparece quando não há texto por baixo', () => {
    const el = montar(<AvisoDeDigitalizacao doc={doc([digitalizada('p1')])} />);
    expect(el.querySelector('.pdf-aviso-scan')).not.toBeNull();
  });

  it('conta quantas páginas são imagem quando só algumas são', () => {
    const el = montar(<AvisoDeDigitalizacao doc={doc([digital('p1'), digitalizada('p2')])} />);
    expect(el.textContent).toContain('1 de 2');
  });

  it('some assim que existir qualquer texto — inclusive o mal reconhecido', () => {
    /*
      Esta é a trava que preserva a lição do requisito 5.

      O leitor de verdade para de avisar assim que há camada de texto, boa ou
      ruim. Um aviso que continuasse enquanto o reconhecimento estivesse ruim
      poria na nossa tela a resposta que a lição existe para o desbravador
      achar sozinho — e faria a procura virar enfeite.
    */
    const torta: Captura = { inclinacao: 14, margem: 30, contraste: 34, nitidez: 100 };
    const malLido = reconhecerTexto(doc([digitalizada('p1', torta)]));

    expect(malLido.paginas[0].texto).toBeTruthy();
    const el = montar(<AvisoDeDigitalizacao doc={malLido} />);
    expect(el.querySelector('.pdf-aviso-scan')).toBeNull();
  });

  it('o botão de reconhecer só existe quando o laboratório o entrega', () => {
    const el = montar(<AvisoDeDigitalizacao doc={doc([digitalizada('p1')])} />);
    expect(el.querySelector('.pdf-aviso-scan button')).toBeNull();
  });
});

/* ── Procurar ─────────────────────────────────────────────────────────────── */

describe('o contador de procura', () => {
  it('não diz nada antes de alguém procurar', () => {
    const el = montar(<CaixaDeProcurar termo="" achados={null} aoMudar={() => {}} />);
    expect(el.querySelector('.pdf-achados')).toBeNull();
  });

  it('diz "nenhum resultado" quando é zero, e diz em cor de alarme', () => {
    /*
      É a peça que faz o requisito 5 ter como se comprovar: ela diz zero num
      documento que está desenhando a palavra na tela, e é essa contradição
      que ensina o que é camada de texto.
    */
    const el = montar(<CaixaDeProcurar termo="acampamento" achados={0} aoMudar={() => {}} />);
    const achados = el.querySelector<HTMLElement>('.pdf-achados')!;
    expect(achados.textContent).toBe('nenhum resultado');
    expect(achados.dataset.vazio).toBe('sim');
  });

  it('e conta as páginas quando acha', () => {
    const el = montar(<CaixaDeProcurar termo="ata" achados={3} aoMudar={() => {}} />);
    expect(el.querySelector('.pdf-achados')!.textContent).toBe('3 páginas');
  });
});

/* ── Miniaturas ───────────────────────────────────────────────────────────── */

describe('o painel de miniaturas', () => {
  it('desenha uma por página, numeradas a partir de 1', () => {
    const el = montar(
      <PainelDeMiniaturas doc={doc([digital('p1'), digital('p2')])}
        escolhidas={[]} aoEscolher={() => {}} />);
    expect(el.querySelectorAll('.pdf-mini')).toHaveLength(2);
    expect([...el.querySelectorAll('.pdf-mini-n')].map(n => n.textContent)).toEqual(['1', '2']);
  });

  it('marca a escolhida, que é como se sabe o que vai ser extraído', () => {
    const el = montar(
      <PainelDeMiniaturas doc={doc([digital('p1'), digital('p2')])}
        escolhidas={['p2']} aoEscolher={() => {}} />);
    const marcadas = [...el.querySelectorAll('.pdf-mini[aria-selected="true"]')];
    expect(marcadas).toHaveLength(1);
    expect(marcadas[0].textContent).toContain('2');
  });

  it('e diz qual página é imagem, como o painel de verdade diz', () => {
    const el = montar(
      <PainelDeMiniaturas doc={doc([digital('p1'), digitalizada('p2')])}
        escolhidas={[]} aoEscolher={() => {}} />);
    expect(el.querySelectorAll('.pdf-mini-marca')).toHaveLength(1);
  });
});

/* ── Margem ───────────────────────────────────────────────────────────────── */

describe('a margem de comentários aparece pela presença do setter', () => {
  /*
    A regra do `aoBuscar` do Explorador. Uma coluna vazia em toda lição
    prometeria um gesto que aquela lição não faz, e gesto sem efeito é o que
    ensina a desconfiar do programa.
  */
  it('não existe na lição que não comenta e não tem comentário', () => {
    const el = montar(<MargemDeComentarios anotacoes={[]} />);
    expect(el.querySelector('.pdf-margem')).toBeNull();
  });

  it('existe quando o laboratório entrega o comando', () => {
    const el = montar(<MargemDeComentarios anotacoes={[]} aoComentar={() => {}} />);
    expect(el.querySelector('.pdf-margem')).not.toBeNull();
  });

  it('e existe quando já chegaram comentários, mesmo sem o comando', () => {
    /* O documento recebido do requisito 4.6 chega com o comentário de outra
       pessoa dentro: escondê-lo por falta de `aoComentar` apagaria o que a
       lição manda ler. */
    const el = montar(<MargemDeComentarios anotacoes={[
      { id: 'n1', paginaId: 'p1', tipo: 'comentario', texto: 'rever a data', por: 'Tia Rute' },
    ]} />);
    expect(el.textContent).toContain('rever a data');
    expect(el.textContent).toContain('Tia Rute');
  });
});

/* ── Régua ────────────────────────────────────────────────────────────────── */

describe('a régua conta o que está no documento, e não julga', () => {
  it('diz página, total e peso', () => {
    const el = montar(<ReguaDoLeitor doc={doc([digital('p1'), digital('p2')])} paginaAtual={2} />);
    expect(el.textContent).toContain('Página 2 de 2');
    expect(el.textContent).toMatch(/KB|MB/);
  });

  it('mostra o selo da assinatura, que é a resposta do programa', () => {
    const carta = doc([digital('p1')]);
    const valida = montar(<ReguaDoLeitor doc={assinarVerificavel(carta, 'Tio Samuel', 1)} paginaAtual={1} />);
    expect(valida.querySelector('.pdf-selo')!.getAttribute('data-estado')).toBe('valida');
  });

  it('e o selo da colada não diz "válida"', () => {
    /*
      O requisito 6 inteiro está nesta linha. Se o selo escrevesse "assinada"
      para as duas, a tela estaria afirmando o que ela não conferiu — que é a
      mesma assimetria do certificado ilegível que cai para `'revoked'`.
    */
    const el = montar(<ReguaDoLeitor doc={assinarComImagem(doc([digital('p1')]))} paginaAtual={1} />);
    const selo = el.querySelector<HTMLElement>('.pdf-selo')!;
    expect(selo.dataset.estado).toBe('imagem');
    expect(selo.textContent).not.toContain('válida');
  });

  it('e não escreve veredito nenhum sobre o documento', () => {
    /* A régua do Word da CC-ES002 conta o que está na pasta e não escreve
       "PDF desatualizado". Aqui é a mesma regra. */
    const el = montar(<ReguaDoLeitor doc={doc([digitalizada('p1')])} paginaAtual={1} />);
    const texto = el.textContent!.toLowerCase();
    for (const veredito of ['não serve', 'ruim', 'errado', 'inválido', 'corrija']) {
      expect(texto).not.toContain(veredito);
    }
  });

  it('o cadeado aparece quando há senha', () => {
    const protegido = proteger(doc([digital('p1')]), {
      senha: 'x', pedeAoLeitor: { naoCopiar: true, naoImprimir: false },
    });
    const el = montar(<ReguaDoLeitor doc={protegido} paginaAtual={1} />);
    expect(el.textContent).toContain('Protegido por senha');
  });
});

/* ── Barra de título ──────────────────────────────────────────────────────── */

describe('a barra de título', () => {
  it('diz o nome, a contagem de páginas e o peso', () => {
    const el = montar(<BarraDeTitulo doc={doc([digital('p1'), digital('p2')])} />);
    expect(el.textContent).toContain('ata.pdf');
    expect(el.textContent).toContain('2 páginas');
  });

  it('e escreve "página" no singular quando é uma só', () => {
    const el = montar(<BarraDeTitulo doc={doc([digital('p1')])} />);
    expect(el.textContent).toContain('1 página');
    expect(el.textContent).not.toContain('1 páginas');
  });
});

/* ── A folha de estilo ────────────────────────────────────────────────────── */

describe('a folha de estilo do leitor', () => {
  it('veste a superfície clara, que senão herdaria o quase-branco da plataforma', () => {
    /* A plataforma pinta h1..h4 de quase branco, o que está certo num
       aplicativo escuro e some em cima de papel. */
    expect(CSS_DO_LEITOR).toMatch(/\.pdf-janela h1[^}]*color:/);
  });

  it('encolhe os comandos para o ícone na tela estreita, sem tirá-los', () => {
    /* Reduzir a tela nunca reduz o que dá para fazer nela: o que some é o
       rótulo, e o botão continua clicável. */
    expect(CSS_DO_LEITOR).toMatch(/@media \(max-width: 900px\)[\s\S]*?\.pdf-rotulo\s*\{\s*display:\s*none/);
    expect(CSS_DO_LEITOR).not.toMatch(/@media[^{]*\{[^}]*\.pdf-bt\s*\{\s*display:\s*none/);
  });

  it('a tira do celular encolhe a prévia, e não prende a altura do painel', () => {
    /*
      O que se testa é a promessa, porque o sintoma é de navegador: o jsdom não
      calcula altura nenhuma. A tira já teve `max-height`, e a conta não
      fechava — prévia de 62px mais o número mais a marca passavam do teto, e
      o que ficava de fora era a última linha, que é a marca dizendo "imagem".
      Medido no Chromium, ela saía com altura visível **zero**, escondendo a
      pista do requisito 2.2 sem nada estourar.
    */
    const celular = CSS_DO_LEITOR.slice(CSS_DO_LEITOR.indexOf('@media (max-width: 720px)'));
    const ateOFim = celular.slice(0, celular.indexOf('\n}\n') + 3);
    expect(ateOFim).toContain('.pdf-mini-folha');
    expect(ateOFim).not.toContain('max-height');
  });

  it('e a regra do celular vem depois da do computador', () => {
    /*
      As duas têm a mesma especificidade sobre `.pdf-miniaturas`. Escrita
      antes, a do celular não valeria nada — e sem nada estourar, que é o
      defeito que o diálogo do Explorador já teve.
    */
    const daColuna = CSS_DO_LEITOR.indexOf('.pdf-miniaturas {');
    const daFileira = CSS_DO_LEITOR.indexOf('@media (max-width: 720px)');
    expect(daColuna).toBeGreaterThan(-1);
    expect(daFileira).toBeGreaterThan(daColuna);
  });
});
