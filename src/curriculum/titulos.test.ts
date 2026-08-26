import { describe, it, expect } from 'vitest';
import { getAllSpecialties } from './index';

/*
  As três trilhas falam a mesma língua.

  A AP034 e a AP035 nomeavam a matéria — "Conceitos Fundamentais",
  "HTML — CodeLab", "AI Lab — Produção com IA". A AP041 nasceu falando do ponto
  de vista de quem chega, e é essa voz que passou a valer nas três: teoria em
  frase simples, laboratório em gerúndio e do lado de quem faz.

  O que se vigia aqui é o que dá para verificar sem julgar estilo.
*/

const licoes = getAllSpecialties().flatMap(s =>
  s.modules.flatMap(m => m.lessons.map(l => ({ trilha: s.code, ...l }))));

describe('nenhum título expõe a ferramenta por trás', () => {
  /*
    "CodeLab", "WebLab", "MailLab" são nomes de componente. Dizem ao programador
    qual arquivo abre e ao desbravador não dizem nada sobre o que ele vai fazer
    ali — e um deles num título é sinal de que o nome foi escrito de dentro para
    fora. O laboratório continua tendo o seu `labType`; é lá que essa informação
    pertence.
  */
  const FERRAMENTAS = /WebLab|MailLab|CodeLab|SiteLab|ImageLab|AI ?Lab|FileManager|PactBuilder|Editor de Texto|Laboratório de/i;

  it('nem os das lições', () => {
    const sujos = licoes.filter(l => FERRAMENTAS.test(l.title)).map(l => `${l.code}: "${l.title}"`);
    expect(sujos, sujos.join(' | ')).toEqual([]);
  });

  it('nem os dos módulos', () => {
    const sujos = getAllSpecialties()
      .flatMap(s => s.modules)
      .filter(m => FERRAMENTAS.test(m.title) || FERRAMENTAS.test(m.description))
      .map(m => `${m.code}: "${m.title}"`);
    expect(sujos, sujos.join(' | ')).toEqual([]);
  });
});

describe('cada tipo de lição tem a sua forma', () => {
  /* Gerúndio: o título diz o que a pessoa vai FAZER, não o que a tela contém. */
  it('todo laboratório é nomeado por uma ação', () => {
    const foraDoPadrao = licoes
      .filter(l => l.type === 'lab')
      .filter(l => !/^\p{Lu}\p{L}*ndo\b/u.test(l.title))
      .map(l => `${l.code}: "${l.title}"`);
    expect(foraDoPadrao, foraDoPadrao.join(' | ')).toEqual([]);
  });

  it('toda avaliação final se anuncia como tal, com o nome da trilha', () => {
    const fora = licoes
      .filter(l => l.type === 'final')
      .filter(l => !l.title.startsWith('Avaliação Final de '))
      .map(l => `${l.code}: "${l.title}"`);
    expect(fora, fora.join(' | ')).toEqual([]);
  });
});

describe('os títulos são frases, não etiquetas de catálogo', () => {
  /*
    O que se procura é Caixa Alta Em Cada Palavra, que é a marca do rótulo de
    catálogo — e não uma palavra capitalizada, que quase sempre é nome próprio
    ("Filipenses", "Internet") ou termo técnico consagrado ("Download e Upload").
    Por isso o corte é em três: uma ou duas é vocabulário, três é estilo.

    Siglas não entram na conta: "HTTP, HTTPS e hyperlinks" e "HD, SSD, RAM e ROM"
    são o assunto da lição, não uma escolha de caixa.

    As avaliações finais ficam de fora — o formato delas é fixo e conferido pelo
    teste acima, e "Avaliação Final de Internet, Avançado" traz nome de trilha.
  */
  it('nenhum título usa Caixa Alta Em Cada Palavra', () => {
    const suspeitos: string[] = [];
    for (const l of licoes) {
      if (l.type === 'final') continue;
      const capitalizadas = l.title
        .split(/[\s—:,]+/).filter(Boolean).slice(1)
        .filter(p => /^\p{Lu}\p{Ll}{2,}$/u.test(p));
      if (capitalizadas.length >= 3) suspeitos.push(`${l.code}: ${capitalizadas.join(' ')}`);
    }
    expect(suspeitos, suspeitos.join(' | ')).toEqual([]);
  });
});

/* ── E a tela do laboratório diz o mesmo que a lição ───────────────────────── */

/*
  O título dentro do laboratório já divergiu do nome da lição: a lição
  "Montando um site de quatro páginas" abria um cartão escrito "SiteLab — Site
  com quatro páginas", e quem estudava via dois nomes para a mesma coisa. O
  nome agora desce do currículo por `lessonTitle`, e estes dois testes cobram
  que continue descendo.
*/
import { readFileSync, readdirSync } from 'node:fs';

const PASTA = new URL('../labs/', import.meta.url);

const arquivosDeLaboratorio = readdirSync(PASTA)
  .filter(n => n.endsWith('Lab.tsx'))
  .map(n => ({ nome: n, texto: readFileSync(new URL(n, PASTA), 'utf8') }));

/** O código sem comentários — é na tela que o nome errado faz estrago. */
const semComentarios = (texto: string) =>
  texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('o nome na tela do laboratório vem do currículo', () => {
  /* Laboratório que não põe título nenhum está certo — a migalha de pão já
     diz onde a pessoa está. O que não pode é pôr um título *diferente*. */
  it('quem põe título usa o da lição', () => {
    const sem = arquivosDeLaboratorio
      .filter(a => a.texto.includes('<h1') && !a.texto.includes('lessonTitle'))
      .map(a => a.nome);
    expect(sem, sem.join(' | ')).toEqual([]);
  });

  it('e nenhum escreve o próprio nome de componente na tela', () => {
    const APARECENDO = /(WebLab|MailLab|CodeLab|SiteLab|ImageLab|AI ?Lab)\s*(—|-|concluído)/i;
    const sujos = arquivosDeLaboratorio
      .filter(a => APARECENDO.test(semComentarios(a.texto)))
      .map(a => a.nome);
    expect(sujos, sujos.join(' | ')).toEqual([]);
  });
});
