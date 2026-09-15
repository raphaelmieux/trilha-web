import { describe, it, expect } from 'vitest';
import {
  DIA_DO_DESBRAVADOR_INICIAL, METAS_DA_REVISAO, TEXTO_ORIGINAL,
  TROCAS_ESPERADAS, PALAVRA_ESTRAGADA, PARAGRAFO_DA_DATA, COMENTARIO_DA_LIDERANCA,
  comentarioDaLideranca, trechosDoParagrafo, metaDaVez,
  textoDoDoc, textoVisivel,
  type Doc,
} from './diaDoDesbravador';
import {
  aceitarRevisao, rejeitarRevisao, aceitarTodasAsRevisoes, rejeitarTodasAsRevisoes,
  revisoesPendentes, revisoesDe, substituirTudo, BUSCA_CRUA,
  acrescentarComentario, responderComentario, resolverComentario,
  comentariosDoDoc, paragrafos,
} from './documento';

/*
  O relato revisado do módulo 5, e as quatro maneiras de o exercício não
  ensinar nada.

  1. **Abrir com meta verde** — a de sempre.
  2. **Ser impossível de vencer** — a irmã dela, e pior: quem fez tudo certo
     fica olhando lista vermelha sem nada na tela que explique.
  3. **Aceitar tudo funcionar.** Se os dois botões grossos da guia Revisão
     fechassem a tarefa, ela mediria ter clicado num deles, e o recurso que a
     lição existe para ensinar — percorrer marca a marca — nunca aconteceria.
  4. **A substituição não poder errar.** É o que a teoria diz com todas as
     letras: o programa não protege, ele oferece as caixas. Um documento sem
     palavra que contenha o trecho procurado apagaria a armadilha inteira, e a
     tarefa passaria a medir ter clicado em Substituir Tudo.
*/

const doc = () => DIA_DO_DESBRAVADOR_INICIAL;
const meta = (id: string) => {
  const m = METAS_DA_REVISAO.find(x => x.id === id);
  if (!m) throw new Error(`meta ${id} não existe`);
  return m;
};

/* ── A solução de referência ──────────────────────────────────────────────── */

const marcaComTexto = (d: Doc, texto: string) => {
  const r = revisoesPendentes(d).find(x => x.trecho.texto === texto);
  if (!r) throw new Error(`não há marca com o texto "${texto}"`);
  return r.trecho.id;
};

/** Ligar o controle, resolver as marcas, responder, comentar e substituir. */
const resolverTudo = (partida: Doc = doc()): Doc => {
  let d: Doc = { ...partida, controlarAlteracoes: true };

  d = aceitarRevisao(d, marcaComTexto(d, 'Pioneros'));
  d = aceitarRevisao(d, marcaComTexto(d, 'Pioneiros'));
  d = rejeitarRevisao(d, marcaComTexto(d, 'domingo'));
  d = rejeitarRevisao(d, marcaComTexto(d, 'sábado'));

  d = responderComentario(d, COMENTARIO_DA_LIDERANCA,
    { id: 'r1', autor: 'voce', texto: 'A lista está certa: foram nove.' });
  d = resolverComentario(d, COMENTARIO_DA_LIDERANCA);

  d = acrescentarComentario(d, {
    id: 'meu', trecho: trechosDoParagrafo(d, PARAGRAFO_DA_DATA)[0],
    autor: 'voce', texto: 'Foi domingo mesmo — o título e o fecho dizem o mesmo.',
    respostas: [], resolvido: false,
  });

  /* O plural primeiro, que é o caminho que funciona sem marcar caixa nenhuma. */
  d = substituirTudo(d, 'crianças', 'desbravadores', BUSCA_CRUA).doc;
  d = substituirTudo(d, 'criança', 'desbravador', BUSCA_CRUA).doc;
  return d;
};

/* ── As travas ────────────────────────────────────────────────────────────── */

describe('o relato volta revisado, e nada chega pronto', () => {
  it('nenhuma meta abre verde', () => {
    const verdes = METAS_DA_REVISAO.filter(m => m.feita(doc())).map(m => m.id);
    expect(verdes, 'o laboratório abre com tarefa já concluída').toEqual([]);
  });

  it('o controle de alterações chega desligado, com o documento já marcado', () => {
    /* É o que acontece de verdade, e é a lição da primeira meta: a marca é do
       arquivo e o controle é do estado dele. Chegar ligado faria a tarefa
       abrir verde; chegar sem marca nenhuma tiraria o que há para resolver. */
    expect(doc().controlarAlteracoes).toBe(false);
    expect(revisoesDe(doc(), 'lideranca').length,
      'o documento voltou sem marca nenhuma da liderança').toBeGreaterThan(0);
  });

  it('a pergunta da liderança chega sem resposta e sem resolver', () => {
    const c = comentarioDaLideranca(doc());
    expect(c, 'o comentário da liderança sumiu do documento').toBeTruthy();
    expect(c!.respostas).toEqual([]);
    expect(c!.resolvido).toBe(false);
  });

  it('todas as metas podem ficar verdes', () => {
    const d = resolverTudo();
    const vermelhas = METAS_DA_REVISAO.filter(m => !m.feita(d)).map(m => m.id);
    expect(vermelhas, 'o laboratório é impossível de vencer').toEqual([]);
    expect(metaDaVez(d)).toBe(null);
  });
});

describe('as duas marcas da liderança pedem escolhas diferentes', () => {
  it('Aceitar Todas não fecha a tarefa', () => {
    /* Aceitar tudo troca a data por uma que o próprio documento desmente em
       outros dois lugares. Se o botão grosso bastasse, a tarefa mediria tê-lo
       clicado — e o recurso que ela ensina é percorrer marca a marca. */
    const d = aceitarTodasAsRevisoes(doc());
    expect(revisoesDe(d, 'lideranca').length, 'sobrou marca depois de aceitar todas').toBe(0);
    expect(textoVisivel(d)).toContain('Tudo aconteceu no sábado');
    expect(meta('resolver').feita(d), 'aceitar todas fechou a tarefa').toBe(false);
  });

  it('Rejeitar Todas também não', () => {
    const d = rejeitarTodasAsRevisoes(doc());
    expect(textoVisivel(d), 'o erro de digitação do nome do clube voltou sem ser notado')
      .toContain('Pioneros');
    expect(meta('resolver').feita(d), 'rejeitar todas fechou a tarefa').toBe(false);
  });

  it('a data que o documento desmente está escrita em outros dois lugares', () => {
    /* Sem isso a rejeição seria adivinhação: a única evidência de que a marca
       da liderança está errada é o próprio documento. */
    const fora = paragrafos(doc())
      .filter(b => b.id !== PARAGRAFO_DA_DATA)
      .map(b => b.trechos.map(x => x.texto).join(''))
      .filter(t => t.includes('domingo'));
    expect(fora.length,
      'o documento não diz a data em outro lugar, e a rejeição vira adivinhação')
      .toBeGreaterThanOrEqual(2);
  });
});

describe('a conversa da margem', () => {
  it('resolver sem responder não conta', () => {
    /* Resolver é um clique. Sem exigir a resposta, a tarefa premiaria fechar o
       assunto sem dizer nada a quem perguntou. */
    const d = resolverComentario(doc(), COMENTARIO_DA_LIDERANCA);
    expect(meta('responder').feita(d), 'um clique em Resolver fechou a tarefa').toBe(false);
  });

  it('responder sem resolver também não', () => {
    const d = responderComentario(doc(), COMENTARIO_DA_LIDERANCA,
      { id: 'r', autor: 'voce', texto: 'Foram nove.' });
    expect(meta('responder').feita(d)).toBe(false);
  });

  it('resposta em branco não é resposta', () => {
    let d = responderComentario(doc(), COMENTARIO_DA_LIDERANCA,
      { id: 'r', autor: 'voce', texto: '   ' });
    d = resolverComentario(d, COMENTARIO_DA_LIDERANCA);
    expect(meta('responder').feita(d), 'uma resposta vazia contou como resposta').toBe(false);
  });

  it('o comentário próprio vale no parágrafo da data, e não em qualquer um', () => {
    const noLugarErrado = acrescentarComentario(doc(), {
      id: 'x', trecho: trechosDoParagrafo(doc(), 'fe-1')[0], autor: 'voce',
      texto: 'Achei bonito.', respostas: [], resolvido: false,
    });
    expect(meta('comentar').feita(noLugarErrado),
      'um comentário em qualquer parágrafo fechou a tarefa da data').toBe(false);

    const vazio = acrescentarComentario(doc(), {
      id: 'y', trecho: trechosDoParagrafo(doc(), PARAGRAFO_DA_DATA)[0], autor: 'voce',
      texto: '  ', respostas: [], resolvido: false,
    });
    expect(meta('comentar').feita(vazio), 'um comentário em branco contou').toBe(false);
  });
});

describe('a substituição precisa poder errar', () => {
  it('o documento tem a palavra no singular e no plural', () => {
    /* Sem as duas formas, um Substituir Tudo desatento não teria o que
       destruir, e a lição inteira do requisito 5 sumiria sem nada acusar. */
    const t = textoDoDoc(doc());
    expect((t.match(/crianças/g) ?? []).length,
      'o documento não tem plural, e sem ele a armadilha não existe').toBeGreaterThanOrEqual(2);
    expect((t.match(/criança(?!s)/g) ?? []).length,
      'o documento não tem singular').toBeGreaterThanOrEqual(2);
  });

  it('o Substituir Tudo desatento estraga o plural, e a meta recusa', () => {
    const d = substituirTudo(doc(), 'criança', 'desbravador', BUSCA_CRUA).doc;
    const t = textoVisivel(d);
    expect(t, 'o erro que a lição existe para mostrar não acontece')
      .toContain(PALAVRA_ESTRAGADA);
    expect(meta('substituir').feita(d), 'o documento estragado passou na tarefa').toBe(false);
  });

  it('com "palavras inteiras" o singular não alcança o plural', () => {
    const inteiras = { diferenciarMaiusculas: false, palavrasInteiras: true };
    const so = substituirTudo(doc(), 'criança', 'desbravador', inteiras).doc;
    expect(textoVisivel(so), 'a caixa marcada não protegeu o plural')
      .not.toContain(PALAVRA_ESTRAGADA);
    expect(meta('substituir').feita(so),
      'trocar só o singular fechou a tarefa, e o plural ficou para trás').toBe(false);

    const tudo = substituirTudo(so, 'crianças', 'desbravadores', inteiras).doc;
    expect(meta('substituir').feita(tudo)).toBe(true);
  });

  it('trocar o plural primeiro funciona sem marcar caixa nenhuma', () => {
    /* É o segundo caminho certo, e quem o descobre aprendeu mais do que quem
       marcou a caixa: depois da primeira passagem não sobra plural para o
       singular alcançar. */
    let d = substituirTudo(doc(), 'crianças', 'desbravadores', BUSCA_CRUA).doc;
    d = substituirTudo(d, 'criança', 'desbravador', BUSCA_CRUA).doc;
    expect(meta('substituir').feita(d)).toBe(true);
    for (const frase of TROCAS_ESPERADAS) expect(textoVisivel(d)).toContain(frase);
  });

  it('com o controle ligado, a troca sai marcada', () => {
    /* No Word ela sai. Fazê-la em silêncio pareceria mais limpo e ensinaria o
       contrário do que a lição diz — que o controle marca toda edição,
       inclusive a que se fez de uma vez em quatro lugares. */
    const ligado: Doc = { ...doc(), controlarAlteracoes: true };
    const d = substituirTudo(ligado, 'crianças', 'desbravadores', BUSCA_CRUA).doc;
    const minhas = revisoesDe(d, 'voce');
    expect(minhas.length, 'a substituição com o controle ligado não deixou marca nenhuma')
      .toBeGreaterThanOrEqual(4);
    expect(minhas.some(r => r.trecho.texto === 'desbravadores')).toBe(true);
    expect(minhas.some(r => r.trecho.texto === 'crianças')).toBe(true);
  });

  it('o comentário preso ao trecho trocado não fica órfão', () => {
    /* O comentário da liderança está no parágrafo que tem a palavra trocada.
       Renumerar todos os pedaços faria a margem esvaziar sozinha na primeira
       substituição, sem erro nenhum e sem nada explicando para onde foi a
       pergunta. */
    const preso = comentarioDaLideranca(doc())!.trecho;
    expect(paragrafos(doc()).some(b => b.trechos.some(x =>
      x.id === preso && x.texto.includes('crianças'))),
    'a trava parou de medir: o comentário não está mais no trecho que se troca').toBe(true);

    const d = substituirTudo(doc(), 'crianças', 'desbravadores', BUSCA_CRUA).doc;
    const ids = paragrafos(d).flatMap(b => b.trechos.map(x => x.id));
    expect(ids, 'o trecho comentado sumiu, e o comentário ficou pendurado em nada')
      .toContain(preso);
    expect(comentariosDoDoc(d).find(c => c.id === COMENTARIO_DA_LIDERANCA)?.trecho)
      .toBe(preso);
  });

  it('o que está riscado não se substitui', () => {
    /* Ele já saiu do texto. Trocar palavra dentro dele mudaria o texto que
       voltaria se alguém rejeitasse a marca — e "domingo" voltaria diferente
       do que a liderança riscou. */
    const d = substituirTudo(doc(), 'domingo', 'sábado', BUSCA_CRUA).doc;
    const riscado = revisoesDe(d, 'lideranca').find(r => r.trecho.revisao.tipo === 'excluido'
      && r.bloco === PARAGRAFO_DA_DATA);
    expect(riscado?.trecho.texto, 'a substituição mexeu no texto riscado').toBe('domingo');
  });
});

describe('o texto do documento', () => {
  it('as quatro frases que a troca precisa produzir estão no texto de partida', () => {
    /* Elas viajam no arquivo da lição, e a meta as procura letra por letra: um
       ajuste de redação que mexesse numa delas deixaria a tarefa impossível de
       vencer, calado. */
    const t = TEXTO_ORIGINAL;
    for (const frase of TROCAS_ESPERADAS) {
      const comCrianca = frase
        .replace('desbravadores', 'crianças')
        .replace('desbravador ', 'criança ')
        .replace('desbravador que', 'criança que');
      expect(t, `a frase "${frase}" não tem par no documento`).toContain(comCrianca);
    }
  });

  it('toda meta traz passo a passo', () => {
    for (const m of METAS_DA_REVISAO) {
      expect(m.passos.length, `a meta ${m.id} não tem passo a passo`).toBeGreaterThan(1);
      expect(m.onde.trim(), `a meta ${m.id} não diz onde`).not.toBe('');
    }
  });

  it('nenhum trecho de revisão é campo, e nenhum campo é revisão', () => {
    /* Campo não se risca: ele não guarda texto, e riscar um deixaria na tela
       um número calculado com traço por cima, que não quer dizer nada. */
    for (const b of paragrafos(doc())) {
      for (const x of b.trechos) {
        expect(!(x.campo && x.revisao), `o trecho ${x.id} é campo e marca ao mesmo tempo`).toBe(true);
      }
    }
  });
});
