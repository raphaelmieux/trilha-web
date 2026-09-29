import { describe, it, expect } from 'vitest';
import {
  ETAPAS, FICHAS_INICIAIS, PAGINAS, VERIFICACOES, buscar, descartar,
  fichasSemFonteConfiavel, guardar, paginaPorId, tudoFeito,
  type Etapa, type Ficha,
} from './pesquisaDoMilenio';
import { ROTEIROS as ROTEIROS_DO_SERVIDOR } from '../../supabase/functions/ai-gateway/redacao';

/*
  A pesquisa do requisito 6 da AP045.

  A trava que carrega este arquivo é a de cima: **o relatório só pode cobrar o
  que a pesquisa podia ter achado**. Os fatos que a Edge Function guarda para
  conferir o texto da lição seguinte são os mesmos que as páginas confiáveis
  deste buscador trazem — e se as duas listas divergirem, o desbravador que
  pesquisou direito escreve um relatório que a conferência reprova, sem nada na
  tela explicando por quê.

  É a mesma forma de `ofensiva.test.ts`, que lê a lista do banco e compara com a
  do navegador nome por nome, pelo mesmo motivo: duas cópias da mesma lista
  divergem no primeiro ajuste.
*/

const ROTEIRO = ROTEIROS_DO_SERVIDOR['AP045-bug-do-milenio'];

/** Toda frase que alguma página oferece, venha ela de fonte boa ou ruim. */
const todasAsFrases = () => PAGINAS.flatMap(p => p.frases.map(f => f.texto));

/** As frases que só as páginas especializadas oferecem. */
const frasesConfiaveis = () =>
  PAGINAS.filter(p => p.especializada).flatMap(p => p.frases.map(f => f.texto));

describe('o relatório só cobra o que a pesquisa podia ter achado', () => {
  it('o roteiro do servidor existe, e tem as quatro etapas de fato mais a de opinião', () => {
    /* A guarda contra o vazio: um roteiro que sumisse deixaria as comparações
       abaixo passando por não terem conferido nada. */
    expect(ROTEIRO, 'o roteiro AP045-bug-do-milenio sumiu do servidor').toBeTruthy();
    for (const e of ETAPAS) {
      expect(ROTEIRO.etapas[e.id], `a etapa ${e.id} não existe no servidor`).toBeTruthy();
    }
    const deOpiniao = Object.values(ROTEIRO.etapas).filter(e => e.opiniao);
    expect(deOpiniao.length, 'a etapa de opinião sumiu').toBe(1);
  });

  it('todo fato que o servidor confere está em alguma página especializada', () => {
    const naBusca = new Set(frasesConfiaveis());
    for (const [id, etapa] of Object.entries(ROTEIRO.etapas)) {
      if (etapa.opiniao) continue;
      for (const fato of etapa.fatos) {
        expect(naBusca.has(fato), `o fato de "${id}" não está em página nenhuma: ${fato}`).toBe(true);
      }
    }
  });

  it('e toda frase de página especializada é um fato que o servidor confere', () => {
    /* O outro sentido. Uma frase que a pesquisa oferece e o relatório não
       reconhece faz o desbravador escrever o que achou e ser corrigido por
       isso — que é pior do que não ter achado. */
    const doServidor = new Set(
      Object.values(ROTEIRO.etapas).flatMap(e => e.fatos),
    );
    for (const frase of frasesConfiaveis()) {
      expect(doServidor.has(frase), `nenhuma etapa do servidor conhece: ${frase}`).toBe(true);
    }
  });

  it('e a etapa de cada frase é a mesma dos dois lados', () => {
    /* Guardar a ficha certa na gaveta errada faria o painel do relatório
       oferecer, na pergunta do que aconteceu, um fato sobre por que o problema
       existia — e a conferência reprovaria a resposta. */
    for (const p of PAGINAS.filter(x => x.especializada)) {
      for (const f of p.frases) {
        const doServidor = ROTEIRO.etapas[f.etapa]?.fatos ?? [];
        expect(doServidor, `${p.id}: "${f.texto}" está em ${f.etapa} aqui`).toContain(f.texto);
      }
    }
  });
});

describe('o buscador mistura as três espécies de página', () => {
  it('há páginas especializadas e páginas que não são', () => {
    /* Sem as ruins, "clique em tudo" é a resposta certa e o requisito deixa de
       medir escolha nenhuma. É a mesma razão de haver mensagem verdadeira na
       caixa da CC-ES005. */
    expect(PAGINAS.filter(p => p.especializada).length).toBeGreaterThanOrEqual(4);
    expect(PAGINAS.filter(p => !p.especializada).length).toBeGreaterThanOrEqual(2);
  });

  it('a lista de resultados não diz qual é qual', () => {
    /* Um selo de "confiável" resolveria o requisito num olhar, e resolveria só
       aqui dentro. O que separa as páginas está escrito **nelas**. */
    for (const p of PAGINAS) {
      expect(`${p.titulo} ${p.resumo}`).not.toMatch(/confiáve|duvidos|falso|não confiável/i);
    }
  });

  it('toda página não especializada deixa de dizer autor, data ou de onde tirou', () => {
    for (const p of PAGINAS.filter(x => !x.especializada)) {
      const semSinal = p.autor === '' || p.publicado === '' || p.referencias === '';
      expect(semSinal, `${p.id} parece especializada e não está marcada como tal`).toBe(true);
      expect(p.porQueNaoServe, `${p.id} sem explicação`).toBeTruthy();
    }
  });

  it('e toda página especializada diz as três coisas', () => {
    for (const p of PAGINAS.filter(x => x.especializada)) {
      expect(p.autor, `${p.id} sem autor`).not.toBe('');
      expect(p.publicado, `${p.id} sem data`).not.toBe('');
      expect(p.referencias, `${p.id} sem referências`).not.toBe('');
    }
  });

  it('a página não confiável afirma o que as outras desmentem', () => {
    /* Ela não pode ser só "fraquinha": uma página ruim que diga a verdade
       ensinaria que a origem não importa. As duas afirmam coisas que nenhuma
       página com referência sustenta. */
    const boas = new Set(frasesConfiaveis());
    const ruins = PAGINAS.filter(p => !p.especializada && p.porQueNaoServe)
      .flatMap(p => p.frases.map(f => f.texto));
    const contradizem = ruins.filter(f => !boas.has(f));
    expect(contradizem.length, 'nenhuma página ruim afirma nada de próprio').toBeGreaterThanOrEqual(2);
  });

  it('há uma página confiável que não tem como responder o que aconteceu', () => {
    /* A notícia de dezembro de 1999. Fonte boa não é fonte boa para qualquer
       pergunta, e é por ela que a lista cobra as quatro etapas em vez de um
       número de fichas. */
    const antesDaVirada = PAGINAS.find(p => p.id === 'jornal-1999')!;
    expect(antesDaVirada.especializada).toBe(true);
    expect(antesDaVirada.frases.some(f => f.etapa === 'resultado')).toBe(false);
  });
});

describe('a busca', () => {
  it('acha pelo termo do assunto', () => {
    expect(buscar('bug do milênio').length).toBeGreaterThan(0);
    expect(buscar('y2k').map(p => p.id)).toContain('museu');
  });

  it('não devolve o índice inteiro para uma busca vazia', () => {
    /* Um buscador que entrega tudo sem se perguntar nada não é um buscador — e
       o requisito é pesquisar, não rolar uma lista. */
    expect(buscar('')).toEqual([]);
    expect(buscar('  ')).toEqual([]);
  });

  it('e não põe as especializadas primeiro', () => {
    /* Uma lista ordenada por confiabilidade faz o requisito ser cumprido
       clicando de cima para baixo. */
    const r = buscar('ano 2000 y2k bug milênio virada');
    expect(r.length).toBeGreaterThanOrEqual(4);
    const posicoes = r.map(p => p.especializada);
    expect(posicoes.slice(0, 4).every(Boolean) && !posicoes.slice(4).some(Boolean)).toBe(false);
  });
});

describe('as fichas', () => {
  const ficha = (pagina: string, i = 0): Ficha => {
    const p = paginaPorId(pagina)!;
    return { fato: p.frases[i].texto, etapa: p.frases[i].etapa, pagina };
  };

  /** A pesquisa que um desbravador atento faz: as quatro etapas, quatro fontes. */
  const BOA: Ficha[] = [
    ficha('museu', 0), ficha('museu', 1), ficha('museu', 3),
    ficha('revista', 0), ficha('revista', 1), ficha('revista', 2),
    ficha('enciclopedia', 0), ficha('governo', 0), ficha('governo', 2),
  ];

  it('abrem vazias, e nada nasce verde', () => {
    for (const v of VERIFICACOES) {
      expect(v.feita(FICHAS_INICIAIS), `${v.id} abre verde`).toBe(false);
    }
    expect(VERIFICACOES.length).toBeGreaterThanOrEqual(4);
  });

  it('a pesquisa de referência fecha a lista', () => {
    for (const v of VERIFICACOES) {
      expect(v.feita(BOA), `${v.id} não fecha`).toBe(true);
    }
    expect(tudoFeito(BOA)).toBe(true);
  });

  it('uma ficha do fórum derruba a lista, e as outras continuam verdes', () => {
    const comLixo = guardar(BOA, ficha('forum'));
    const so = VERIFICACOES.find(v => v.id === 'so-especializadas')!;
    expect(so.feita(comLixo)).toBe(false);
    expect(fichasSemFonteConfiavel(comLixo)).toHaveLength(1);
    /* As outras continuam passando: a lista aponta **qual** é o problema, em
       vez de ficar toda vermelha e não dizer nada. */
    expect(VERIFICACOES.filter(v => v.feita(comLixo))).toHaveLength(VERIFICACOES.length - 1);
    expect(tudoFeito(descartar(comLixo, ficha('forum').fato, 'forum'))).toBe(true);
  });

  it('nove fichas de uma página só não fecham', () => {
    /* "Sites especializados", no plural. Uma página só não se confere contra
       nada — e é o caminho mais rápido para oito fichas. */
    const so = PAGINAS.find(p => p.id === 'museu')!;
    const muitas = so.frases.map(f => ({ fato: f.texto, etapa: f.etapa, pagina: 'museu' }));
    expect(VERIFICACOES.find(v => v.id === 'tres-fontes')!.feita(muitas)).toBe(false);
  });

  it('e a mesma frase guardada duas vezes não conta duas', () => {
    const uma = guardar(FICHAS_INICIAIS, ficha('museu'));
    expect(guardar(uma, ficha('museu'))).toHaveLength(1);
  });

  it('nenhuma etapa fica sem página especializada que a responda', () => {
    /* Se uma das quatro perguntas só tivesse resposta em página ruim, a lista
       seria impossível de fechar — pior do que abrir resolvida. */
    for (const e of ETAPAS) {
      const tem = PAGINAS.some(p => p.especializada && p.frases.some(f => f.etapa === e.id));
      expect(tem, `nenhuma página boa responde ${e.id}`).toBe(true);
    }
  });

  it('e há oito frases confiáveis para guardar', () => {
    const confiaveis = frasesConfiaveis();
    expect(new Set(confiaveis).size).toBeGreaterThanOrEqual(8);
    expect(todasAsFrases().length).toBeGreaterThan(confiaveis.length);
  });
});

describe('toda verificação tem dica, e nenhuma entrega a resposta', () => {
  it('a dica nomeia o critério, e não a página', () => {
    const ids = PAGINAS.map(p => p.id);
    for (const v of VERIFICACOES) {
      expect(v.dica.length, `${v.id}`).toBeGreaterThan(30);
      for (const id of ids) {
        expect(v.dica.toLowerCase(), `${v.id} nomeia a página ${id}`).not.toContain(id);
      }
    }
  });
});

/** Só para o TypeScript não reclamar do tipo importado e não usado diretamente. */
export type _Etapa = Etapa;
