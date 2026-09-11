import { describe, it, expect } from 'vitest';
import {
  APRESENTACAO_INICIAL, METAS_DA_APRESENTACAO, SLIDE_DAS_FOTOS, SLIDE_DO_LAYOUT,
  NOMES_DOS_LAYOUTS, NOMES_DOS_MODELOS, umSlide, vazio,
  type Apresentacao, type Slide,
} from './apresentacaoDoClube';

/*
  O laboratório de apresentações abre com tudo por fazer.

  A mesma trava dos outros, e aqui ela precisa de um cuidado a mais: a
  apresentação **chega escrita**, com seis slides, títulos e tópicos. Na tira
  lateral isso passa por apresentação começada, e é fácil escrever a meta
  olhando para o texto em vez de olhar para as decisões — o modelo que ninguém
  escolheu, o layout errado, o slide vazio, a ordem trocada.
*/

describe('nenhuma tarefa do laboratório de apresentações nasce verde', () => {
  it('a apresentação abre com as sete por fazer', () => {
    const verdes = METAS_DA_APRESENTACAO.filter(m => m.feita(APRESENTACAO_INICIAL)).map(m => m.id);
    expect(verdes, `${verdes.join(', ')} já estão cumpridas na apresentação inicial`).toEqual([]);
  });

  it('toda meta tem passo a passo', () => {
    const sem = METAS_DA_APRESENTACAO.filter(m => m.passos.length < 2).map(m => m.id);
    expect(sem, `${sem.join(', ')} não oferecem caminho a quem travar`).toEqual([]);
  });

  it('há uma tarefa para cada um dos sete itens do requisito 9', () => {
    expect(METAS_DA_APRESENTACAO).toHaveLength(7);
    expect(new Set(METAS_DA_APRESENTACAO.map(m => m.id)).size).toBe(7);
  });
});

/*
  E o que ela abre errado precisa estar errado de verdade.

  Cada uma destas quatro é a razão de existir de uma tarefa. Se a apresentação
  inicial deixasse de ter o slide vazio, ou já viesse na ordem certa, a tarefa
  correspondente passaria a ser vencida por um gesto que ninguém precisou fazer
  — e o painel fecharia verde do mesmo jeito.
*/
describe('a apresentação inicial tem os defeitos que as tarefas consertam', () => {
  it('está em branco, sem modelo escolhido', () => {
    expect(APRESENTACAO_INICIAL.modelo).toBe('branco');
  });

  it('tem um slide de tópicos no layout de título', () => {
    const s = umSlide(APRESENTACAO_INICIAL, SLIDE_DO_LAYOUT)!;
    expect(s.layout).toBe('titulo');
    expect(s.topicos.length, 'sem tópicos, o layout errado não teria consequência').toBeGreaterThan(1);
  });

  it('tem exatamente um slide vazio sobrando', () => {
    expect(APRESENTACAO_INICIAL.slides.filter(vazio)).toHaveLength(1);
  });

  it('e o slide de encerramento não está no fim', () => {
    const slides = APRESENTACAO_INICIAL.slides;
    expect(slides[slides.length - 1].titulo).not.toBe('Até lá!');
    expect(slides.some(s => s.titulo === 'Até lá!'), 'não há encerramento para mover').toBe(true);
  });

  it('o slide das fotos existe e está sem foto nenhuma', () => {
    const s = umSlide(APRESENTACAO_INICIAL, SLIDE_DAS_FOTOS)!;
    expect(s.imagens).toEqual([]);
  });

  it('e nenhum slide traz vídeo ou áudio', () => {
    expect(APRESENTACAO_INICIAL.slides.every(s => s.video === 'nenhuma' && s.audio === 'nenhuma')).toBe(true);
  });
});

/* ── A apresentação pronta ─────────────────────────────────────────────────── */

const mudar = (a: Apresentacao, id: string, m: Partial<Slide>): Apresentacao =>
  ({ ...a, slides: a.slides.map(s => (s.id === id ? { ...s, ...m } : s)) });

function apresentacaoPronta(): Apresentacao {
  let a: Apresentacao = { ...APRESENTACAO_INICIAL, modelo: 'facetas' };
  a = mudar(a, SLIDE_DO_LAYOUT, { layout: 'titulo-conteudo' });
  a = mudar(a, SLIDE_DAS_FOTOS, {
    imagens: [
      { id: 'i1', legenda: 'fogueira.jpg', largura: 40 },
      { id: 'i2', legenda: 'barracas.jpg', largura: 40 },
    ],
    imagensAlinhadas: true,
  });
  a = mudar(a, 's3', { video: 'incorporada' });
  a = mudar(a, 's1', { audio: 'incorporada' });

  /* Os quatro gestos de slide: excluir o vazio, duplicar o das fotos, criar o
     do versículo e mover o encerramento para o fim. */
  const semVazio = a.slides.filter(s => !vazio(s));
  const fotos = semVazio.find(s => s.id === SLIDE_DAS_FOTOS)!;
  const comCopia = [...semVazio, { ...fotos, id: 'copia' }];
  const comNovo = [...comCopia, {
    id: 'novo', titulo: 'O versículo do acampamento', topicos: [],
    layout: 'titulo-conteudo' as const, imagens: [], imagensAlinhadas: false,
    video: 'nenhuma' as const, audio: 'nenhuma' as const,
  }];
  const encerramento = comNovo.find(s => s.titulo === 'Até lá!')!;
  const slides = [...comNovo.filter(s => s !== encerramento), encerramento];

  a = { ...a, slides };
  return { ...a, pdf: a.slides.map(s => s.id) };
}

describe('toda tarefa do laboratório de apresentações tem como ser vencida', () => {
  it('a apresentação pronta fecha as sete', () => {
    const abertas = METAS_DA_APRESENTACAO.filter(m => !m.feita(apresentacaoPronta())).map(m => m.id);
    expect(abertas, `${abertas.join(', ')} continuam abertas numa apresentação pronta`).toEqual([]);
  });
});

/*
  Os quatro gestos do item c) são quatro, e não um número de slides.

  Contar slides deixaria passar quem excluiu dois e criou dois: o total fecha e
  nada foi aprendido. Cada gesto tem a marca dele, e tirar qualquer uma reabre a
  tarefa.
*/
describe('criar, duplicar, reorganizar e excluir são cobrados um a um', () => {
  const meta = METAS_DA_APRESENTACAO.find(m => m.id === 'slides')!;

  it('deixar o slide vazio reabre a tarefa', () => {
    const a = apresentacaoPronta();
    const comVazio: Apresentacao = {
      ...a,
      slides: [...a.slides, {
        id: 'v', titulo: '', topicos: [], layout: 'em-branco',
        imagens: [], imagensAlinhadas: false, video: 'nenhuma', audio: 'nenhuma',
      }],
    };
    expect(meta.feita(comVazio)).toBe(false);
  });

  it('deixar o encerramento fora do fim reabre a tarefa', () => {
    const a = apresentacaoPronta();
    const fim = a.slides[a.slides.length - 1];
    const trocado: Apresentacao = { ...a, slides: [fim, ...a.slides.slice(0, -1)] };
    expect(meta.feita(trocado)).toBe(false);
  });

  it('não duplicar reabre a tarefa', () => {
    const a = apresentacaoPronta();
    const semCopia: Apresentacao = { ...a, slides: a.slides.filter(s => s.id !== 'copia') };
    expect(meta.feita(semCopia)).toBe(false);
  });

  it('não criar nada novo reabre a tarefa', () => {
    const a = apresentacaoPronta();
    const semNovo: Apresentacao = { ...a, slides: a.slides.filter(s => s.id !== 'novo') };
    expect(meta.feita(semNovo)).toBe(false);
  });

  /* Excluir dois e criar dois fecha a conta de slides e não faz nenhum dos
     quatro gestos que o item nomeia. */
  it('e mexer no número de slides sem fazer os gestos não fecha nada', () => {
    const a = APRESENTACAO_INICIAL;
    const trocaSeca: Apresentacao = {
      ...a,
      slides: [...a.slides.slice(0, 4), {
        id: 'x', titulo: 'Slide qualquer', topicos: [], layout: 'so-titulo',
        imagens: [], imagensAlinhadas: false, video: 'nenhuma', audio: 'nenhuma',
      }, a.slides[5]],
    };
    expect(trocaSeca.slides).toHaveLength(a.slides.length);
    expect(meta.feita(trocaSeca)).toBe(false);
  });
});

/*
  Vídeo vinculado não conta, e é a lição inteira do item e).

  Os dois caminhos se chamam "inserir", e a diferença só aparece longe de casa.
  Se a meta aceitasse qualquer um dos dois, o desbravador entregaria uma
  apresentação que abre com o quadro preto no computador do clube — e a
  plataforma daria por boa.
*/
describe('o que não viaja dentro do arquivo não conta', () => {
  it('vídeo vinculado deixa a tarefa aberta', () => {
    const a = mudar(apresentacaoPronta(), 's3', { video: 'vinculada' });
    expect(METAS_DA_APRESENTACAO.find(m => m.id === 'video')!.feita(a)).toBe(false);
  });

  it('áudio vinculado deixa a tarefa aberta', () => {
    const a = mudar(apresentacaoPronta(), 's1', { audio: 'vinculada' });
    expect(METAS_DA_APRESENTACAO.find(m => m.id === 'audio')!.feita(a)).toBe(false);
  });
});

/*
  Fotos arrastadas pelo olho não contam.

  "Organizá-las adequadamente" é o que o requisito escreve, e quatro fotos
  arrastadas ficam *quase* alinhadas — que é o que se vê projetado na parede.
  Alinhar é um comando.
*/
describe('as fotos precisam de duas e do comando de alinhar', () => {
  const meta = METAS_DA_APRESENTACAO.find(m => m.id === 'imagens')!;

  it('uma foto só não fecha', () => {
    const a = apresentacaoPronta();
    const uma = mudar(a, SLIDE_DAS_FOTOS, { imagens: [umSlide(a, SLIDE_DAS_FOTOS)!.imagens[0]] });
    expect(meta.feita(uma)).toBe(false);
  });

  it('duas fotos sem alinhar não fecham', () => {
    const a = mudar(apresentacaoPronta(), SLIDE_DAS_FOTOS, { imagensAlinhadas: false });
    expect(meta.feita(a)).toBe(false);
  });
});

/*
  O PDF congela o que existir na hora.

  Exportar cedo e continuar mexendo é o que se faz sem pensar, e o PDF entregue
  fica sem os slides que vieram depois — sem nada na tela dizendo isso. É a
  mesma armadilha do sumário do Word, que guarda o que leu.
*/
describe('o PDF envelhece quando a apresentação continua', () => {
  it('exportar e depois criar um slide deixa o PDF incompleto', () => {
    const a = apresentacaoPronta();
    const meta = METAS_DA_APRESENTACAO.find(m => m.id === 'pdf')!;
    expect(meta.feita(a)).toBe(true);

    const depois: Apresentacao = {
      ...a,
      slides: [...a.slides, {
        id: 'tardio', titulo: 'Um aviso a mais', topicos: [], layout: 'so-titulo',
        imagens: [], imagensAlinhadas: false, video: 'nenhuma', audio: 'nenhuma',
      }],
    };
    expect(meta.feita(depois)).toBe(false);
    expect(meta.feita({ ...depois, pdf: depois.slides.map(s => s.id) })).toBe(true);
  });
});

/* Os nomes que aparecem na tela são os que o PowerPoint usa: quem lê a lição
   vai procurar na galeria por eles. */
describe('os nomes vêm do programa', () => {
  it('todo layout e todo modelo tem nome escrito', () => {
    for (const nome of Object.values(NOMES_DOS_LAYOUTS)) expect(nome.length).toBeGreaterThan(2);
    for (const nome of Object.values(NOMES_DOS_MODELOS)) expect(nome.length).toBeGreaterThan(2);
  });

  it('e todo layout usado nos slides iniciais tem nome', () => {
    for (const s of APRESENTACAO_INICIAL.slides) {
      expect(NOMES_DOS_LAYOUTS[s.layout], `layout ${s.layout} sem nome`).toBeTruthy();
    }
  });
});
