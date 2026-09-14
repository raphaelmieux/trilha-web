import { describe, it, expect } from 'vitest';
import {
  validarExplorador, gestosVazios, moldeDoNome, nomeTemDataEVersao,
  IDS_DO_EXPLORADOR, type ContextoDoExplorador,
} from './exploradorValidator';
import {
  discoDoClube, BACKUP, RELATORIO, SUMIU, VERSAO_PERDIDA, DEZ_MAL_NOMEADOS,
} from '../labs/discoDoClube';
import {
  AREA, DOCUMENTOS, acharNo, criarGerador, copiarPara, moverPara,
  mandarParaLixeira, restaurar, compactar, descompactar, salvarPorCima,
  restaurarVersao, type No,
} from '../labs/arquivos';
import {
  PENDRIVE, dispositivoInicial, conectar, copiadoParaODispositivo,
  removerComSeguranca, puxarSemRemover,
} from '../labs/dispositivoExterno';
import { PASSOS_DO_EXPLORADOR } from '../labs/passosDeExplorador';

/*
  O Explorador da CC-ES001, conferido sem montar tela.

  ── As duas perguntas que este arquivo faz ──────────────────────────────
  A primeira é a de sempre: **nenhuma verificação pode nascer verde**. Um
  laboratório que abre resolvido já aconteceu duas vezes nesta plataforma, e
  das duas o erro é invisível de dentro — o painel mostra tarefa concluída,
  que é exatamente o que se espera de um laboratório funcionando. Aqui há sete
  lições sobre o mesmo disco, então basta uma sobra no `discoDoClube` para
  alguma delas abrir com meia lista verde.

  A segunda é a irmã dela, e custa mais caro: **toda verificação precisa ter
  como ficar verde**. Laboratório impossível de vencer é pior do que um que
  abre resolvido — um dá tarefa de graça, o outro deixa quem fez tudo certo
  olhando uma lista vermelha sem nada na tela que explique. Por isso cada
  trava daqui tem o caminho inteiro escrito com as funções de `arquivos.ts`,
  que são as mesmas que a tela chama.
*/

const AGORA = Date.UTC(2026, 8, 14, 12, 0, 0);

const contexto = (arvore: No[], extra: Partial<ContextoDoExplorador> = {}): ContextoDoExplorador => ({
  arvore,
  inicial: discoDoClube(AGORA),
  dispositivo: dispositivoInicial(),
  gestos: gestosVazios(),
  ...extra,
});

const passa = (c: ContextoDoExplorador, id: string) => {
  const r = validarExplorador(c, [id])[0];
  return { ok: r.passed, detalhe: r.detail };
};

describe('o disco do clube abre sem nada feito', () => {
  it('nenhuma das verificações nasce verde', () => {
    const c = contexto(discoDoClube(AGORA));
    const verdes = validarExplorador(c, IDS_DO_EXPLORADOR)
      .filter(r => r.passed).map(r => r.id);
    expect(verdes).toEqual([]);
  });

  it('a lista de ids não está vazia', () => {
    /* A guarda contra o vazio, de novo: uma lista que esvaziasse deixaria a
       trava acima verde por não ter conferido nada. */
    expect(IDS_DO_EXPLORADOR.length).toBeGreaterThan(10);
  });

  it('toda verificação tem passo a passo para quem travar', () => {
    const sem = IDS_DO_EXPLORADOR.filter(id => !PASSOS_DO_EXPLORADOR[id]?.length);
    expect(sem).toEqual([]);
  });

  it('não há passo a passo escrito para verificação que ninguém cobra', () => {
    const sobrando = Object.keys(PASSOS_DO_EXPLORADOR)
      .filter(id => !IDS_DO_EXPLORADOR.includes(id));
    expect(sobrando).toEqual([]);
  });
});

describe('a hierarquia de três níveis (requisito 4.1)', () => {
  const novoId = criarGerador('u');

  /** Monta projeto › assunto › detalhe dentro de Documentos. */
  const montar = (arvore: No[], nomes = ['Acampamento 2026', 'Secretaria', 'Autorizações']) => {
    let a = arvore;
    let pai: string = DOCUMENTOS;
    const ids: string[] = [];
    for (const nome of nomes) {
      const id = novoId();
      a = [...a, { id, nome, tipo: 'pasta', paiId: pai, tamanhoKb: 0, modificadoEm: AGORA }];
      ids.push(id);
      pai = id;
    }
    return { arvore: a, ids };
  };

  it('duas pastas encaixadas ainda não bastam', () => {
    const { arvore } = montar(discoDoClube(AGORA), ['Acampamento 2026', 'Secretaria']);
    const r = passa(contexto(arvore), 'tresNiveis');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('2');
  });

  it('três encaixadas bastam', () => {
    const { arvore } = montar(discoDoClube(AGORA));
    expect(passa(contexto(arvore), 'tresNiveis').ok).toBe(true);
  });

  it('três pastas soltas não são hierarquia', () => {
    /* Irmãs, e não encaixadas: a conta é de profundidade, e contar pastas
       criadas aprovaria três gavetas lado a lado. */
    let a = discoDoClube(AGORA);
    for (const nome of ['Uma', 'Outra', 'Mais']) {
      a = [...a, { id: novoId(), nome, tipo: 'pasta', paiId: DOCUMENTOS, tamanhoKb: 0, modificadoEm: AGORA }];
    }
    expect(passa(contexto(a), 'tresNiveis').ok).toBe(false);
  });

  it('pasta que ficou com o nome de fábrica não conta', () => {
    const { arvore } = montar(discoDoClube(AGORA), ['Nova pasta', 'Nova pasta (2)', 'Nova pasta (3)']);
    expect(passa(contexto(arvore), 'tresNiveis').ok).toBe(false);
  });

  it('a estrutura vazia não guarda projeto nenhum', () => {
    const { arvore } = montar(discoDoClube(AGORA));
    expect(passa(contexto(arvore), 'guardouOProjeto').ok).toBe(false);
  });

  it('quatro arquivos numa pasta só ainda não bastam', () => {
    const { arvore, ids } = montar(discoDoClube(AGORA));
    let a = arvore;
    for (const nome of DEZ_MAL_NOMEADOS.slice(0, 4)) {
      const n = a.find(x => x.nome === nome)!;
      a = moverPara(a, n.id, ids[2], AGORA);
    }
    const r = passa(contexto(a), 'guardouOProjeto');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('mesma pasta');
  });

  it('quatro arquivos em duas pastas bastam', () => {
    const { arvore, ids } = montar(discoDoClube(AGORA));
    let a = arvore;
    DEZ_MAL_NOMEADOS.slice(0, 4).forEach((nome, i) => {
      const n = a.find(x => x.nome === nome)!;
      a = moverPara(a, n.id, i < 2 ? ids[1] : ids[2], AGORA);
    });
    expect(passa(contexto(a), 'guardouOProjeto').ok).toBe(true);
  });
});

describe('compactar e descompactar (requisito 4.5)', () => {
  const novoId = criarGerador('z');

  it('um arquivo sozinho não é pacote', () => {
    const { arvore } = compactar(discoDoClube(AGORA), ['hino'], 'hino.zip', novoId, AGORA);
    const r = passa(contexto(arvore), 'compactou');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('três itens');
  });

  it('a pasta de fotos vira um pacote', () => {
    const { arvore } = compactar(discoDoClube(AGORA), ['fotos'], 'Fotos.zip', novoId, AGORA);
    expect(passa(contexto(arvore), 'compactou').ok).toBe(true);
  });

  it('o original continua lá depois de compactar', () => {
    /* É a armadilha que a teoria nomeia, e ela precisa ser verdade no motor:
       quem compacta para liberar espaço e não apaga o original ocupou mais. */
    const { arvore } = compactar(discoDoClube(AGORA), ['fotos'], 'Fotos.zip', novoId, AGORA);
    expect(acharNo(arvore, 'fotos')).toBeTruthy();
    expect(arvore.filter(n => n.paiId === 'fotos')).toHaveLength(4);
  });

  it('extrair devolve o que entrou', () => {
    const feito = compactar(discoDoClube(AGORA), ['fotos'], 'Fotos.zip', novoId, AGORA);
    const depois = descompactar(feito.arvore, feito.pacoteId!, novoId, AGORA);
    expect(depois.length).toBeGreaterThan(feito.arvore.length);
    const c = contexto(depois, { gestos: { ...gestosVazios(), extraiu: true } });
    expect(passa(c, 'extraiu').ok).toBe(true);
  });
});

describe('salvar, salvar como, excluir e restaurar (requisitos 2 e 3)', () => {
  it('salvar por cima guarda a versão de antes', () => {
    const a = salvarPorCima(discoDoClube(AGORA), 'bagunca6',
      { rotulo: 'a lista revisada', tamanhoKb: 5 }, AGORA);
    expect(passa(contexto(a), 'salvou').ok).toBe(true);
  });

  it('o relatório, que já nasce com histórico, não conta como salvo', () => {
    /* Sem a comparação com o disco de partida, esta lição abriria com a
       primeira tarefa verde — e o painel diria que a pessoa salvou um arquivo
       que ela nem abriu. */
    expect(passa(contexto(discoDoClube(AGORA)), 'salvou').ok).toBe(false);
  });

  it('salvar como sem mudar o texto faz duas cópias iguais', () => {
    const disco = discoDoClube(AGORA);
    const origem = acharNo(disco, 'bagunca6')!;
    const a = [...disco, { ...origem, id: 'copia', nome: 'outro nome.txt' }];
    const c = contexto(a, {
      gestos: { ...gestosVazios(), salvouComo: [{ origem: 'bagunca6', novo: 'copia' }] },
    });
    const r = passa(c, 'salvouComo');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('igual');
  });

  it('salvar como depois de mudar deixa o original intacto', () => {
    const disco = discoDoClube(AGORA);
    const origem = acharNo(disco, 'bagunca6')!;
    const a = [...disco, {
      ...origem, id: 'copia', nome: 'o que levar - revisado.txt',
      rotulo: 'agora com o saco de dormir',
    }];
    const c = contexto(a, {
      gestos: { ...gestosVazios(), salvouComo: [{ origem: 'bagunca6', novo: 'copia' }] },
    });
    expect(passa(c, 'salvouComo').ok).toBe(true);
  });

  it('restaurar da Lixeira devolve o arquivo à pasta de origem', () => {
    let a = mandarParaLixeira(discoDoClube(AGORA), 'bagunca3');
    a = restaurar(a, 'bagunca3');
    expect(acharNo(a, 'bagunca3')!.paiId).toBe(AREA);
    const c = contexto(a, { gestos: { ...gestosVazios(), restaurados: ['bagunca3'] } });
    expect(passa(c, 'restaurouDaLixeira').ok).toBe(true);
  });

  it('o que ainda está na Lixeira não conta como restaurado', () => {
    const a = mandarParaLixeira(discoDoClube(AGORA), 'bagunca3');
    const c = contexto(a, { gestos: { ...gestosVazios(), restaurados: ['bagunca3'] } });
    expect(passa(c, 'restaurouDaLixeira').ok).toBe(false);
  });
});

describe('ordenar, buscar e reconhecer (requisitos 4.2, 4.3 e 4.4)', () => {
  it('duas colunas não fecham as três que o requisito pede', () => {
    const c = contexto(discoDoClube(AGORA), {
      gestos: { ...gestosVazios(), ordenacoes: ['nome', 'tamanho'] },
    });
    const r = passa(c, 'ordenou');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('2 de 3');
  });

  it('nome, data e tamanho fecham', () => {
    const c = contexto(discoDoClube(AGORA), {
      gestos: { ...gestosVazios(), ordenacoes: ['nome', 'modificado', 'tamanho', 'tipo'] },
    });
    expect(passa(c, 'ordenou').ok).toBe(true);
  });

  it('busca que não acha nada não localizou arquivo nenhum', () => {
    const c = contexto(discoDoClube(AGORA), {
      gestos: {
        ...gestosVazios(),
        buscas: [{ filtro: { tipo: 'imagem', de: AGORA - 1000 }, achados: 0 }],
      },
    });
    expect(passa(c, 'buscouComFiltro').ok).toBe(false);
  });

  it('busca com um filtro só não fecha', () => {
    const c = contexto(discoDoClube(AGORA), {
      gestos: { ...gestosVazios(), buscas: [{ filtro: { tipo: 'imagem' }, achados: 7 }] },
    });
    const r = passa(c, 'buscouComFiltro');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('dois filtros');
  });

  it('tipo e data juntos, com resultado, fecham', () => {
    const c = contexto(discoDoClube(AGORA), {
      gestos: {
        ...gestosVazios(),
        buscas: [{ filtro: { tipo: 'imagem', de: AGORA - 40 * 86_400_000 }, achados: 3 }],
      },
    });
    expect(passa(c, 'buscouComFiltro').ok).toBe(true);
  });

  it('três extensões não fecham as quatro do requisito', () => {
    const c = contexto(discoDoClube(AGORA), {
      gestos: { ...gestosVazios(), associacoes: ['jpg', 'txt', 'pdf'] },
    });
    expect(passa(c, 'programas').ok).toBe(false);
  });

  it('a mesma extensão quatro vezes continua sendo uma', () => {
    const c = contexto(discoDoClube(AGORA), {
      gestos: { ...gestosVazios(), associacoes: ['jpg', 'jpg', 'jpg', 'jpg'] },
    });
    const r = passa(c, 'programas');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('1 de 4');
  });

  it('quatro extensões diferentes fecham', () => {
    const c = contexto(discoDoClube(AGORA), {
      gestos: { ...gestosVazios(), associacoes: ['jpg', 'txt', 'pdf', 'docx'] },
    });
    expect(passa(c, 'programas').ok).toBe(true);
  });
});

describe('o padrão de nomeação (requisito 5)', () => {
  /** Renomeia os `quantos` primeiros da Área de Trabalho no padrão dado. */
  const renomear = (quantos: number, padrao: (i: number, ext: string) => string) => {
    let a = discoDoClube(AGORA);
    DEZ_MAL_NOMEADOS.slice(0, quantos).forEach((nome, i) => {
      const n = a.find(x => x.nome === nome)!;
      const ext = nome.slice(nome.lastIndexOf('.'));
      a = a.map(x => (x.id === n.id ? { ...x, nome: padrao(i, ext) } : x));
    });
    return a;
  };

  const comData = (i: number, ext: string) =>
    `ata-2026-02-${String(i + 10).padStart(2, '0')}-v01${ext}`;

  it('nove no padrão não fecham os dez', () => {
    const r = passa(contexto(renomear(9, comData)), 'padrao');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('9 de 10');
  });

  it('dez no mesmo padrão fecham', () => {
    expect(passa(contexto(renomear(10, comData)), 'padrao').ok).toBe(true);
  });

  it('dez nomes bons sem data nem versão não fecham', () => {
    const r = passa(contexto(renomear(10, (i, ext) => `ata da reunião ${i + 1}${ext}`)), 'padrao');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('nenhum com data e versão');
  });

  it('cinco de um jeito e cinco de outro não são um padrão', () => {
    const a = renomear(10, (i, ext) => (i < 5
      ? `ata-2026-02-${String(i + 10).padStart(2, '0')}-v01${ext}`
      : `v01_2026_02_${String(i + 10).padStart(2, '0')}_ata${ext}`));
    const r = passa(contexto(a), 'padrao');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('molde diferente');
  });

  it('o padrão pode ser outro, contanto que seja um só', () => {
    /* O documento oficial pede padrão **próprio**: uma trava que exigisse
       `assunto-AAAA-MM-DD-vNN` estaria escolhendo por quem estuda. */
    const a = renomear(10, (i, ext) => `20260210_v02_relatório_${i}${ext}`);
    expect(passa(contexto(a), 'padrao').ok).toBe(true);
  });

  it('o molde ignora o acento e a extensão', () => {
    expect(moldeDoNome('relatório-2026-03-14-v01.docx'))
      .toBe(moldeDoNome('ata-2026-04-01-v02.pdf'));
  });

  it('a data e a versão se procuram no nome, e não no molde', () => {
    expect(nomeTemDataEVersao('ata-2026-03-14-v01.docx')).toBe(true);
    /* Sem separador é a mesma data, e é padrão legítimo. */
    expect(nomeTemDataEVersao('20260314_v01_ata.docx')).toBe(true);
    expect(nomeTemDataEVersao('ata-2026-03-14.docx')).toBe(false);
    /* Só o ano não é data: dois arquivos de 2026 voltam a ordenar pelo acaso
       do nome. E `a-#-#-#-v#` é o molde tanto de "ata-2026-03-14-v01" quanto
       de "ata-1-2-v03" — é por isso que esta conta não pode ser feita no
       molde. */
    expect(nomeTemDataEVersao('ata-2026-v01.docx')).toBe(false);
    expect(nomeTemDataEVersao('ata-1-2-3-v03.docx')).toBe(false);
    expect(moldeDoNome('ata-2026-03-14-v01.docx')).toBe(moldeDoNome('ata-1-2-3-v03.docx'));
  });
});

describe('o pen drive (requisito 4.6)', () => {
  const novoId = criarGerador('p');

  /** Espeta o pen drive e copia três arquivos para ele. */
  const copiarTres = () => {
    let a: No[] = [...discoDoClube(AGORA), {
      id: PENDRIVE, nome: 'Pen drive (E:)', tipo: 'pasta' as const,
      paiId: null, tamanhoKb: 0, modificadoEm: AGORA,
    }];
    let d = conectar(dispositivoInicial());
    const novos: string[] = [];
    for (const origem of ['f1', 'f2', 'f3']) {
      const antes = a.length;
      a = copiarPara(a, origem, PENDRIVE, novoId, AGORA);
      novos.push(...a.slice(antes).map(n => n.id));
    }
    d = copiadoParaODispositivo(d, novos.filter(id => a.find(n => n.id === id)?.paiId === PENDRIVE));
    return { arvore: a, dispositivo: d };
  };

  it('dois arquivos não fecham os três', () => {
    const { arvore, dispositivo } = copiarTres();
    const menos = arvore.filter(n => n.id !== arvore.find(x => x.paiId === PENDRIVE)!.id);
    expect(passa(contexto(menos, { dispositivo }), 'copiouParaOPendrive').ok).toBe(false);
  });

  it('três fecham a cópia', () => {
    const { arvore, dispositivo } = copiarTres();
    expect(passa(contexto(arvore, { dispositivo }), 'copiouParaOPendrive').ok).toBe(true);
  });

  it('ejetar antes de copiar nada não demonstra remoção nenhuma', () => {
    const d = removerComSeguranca(conectar(dispositivoInicial()));
    expect(passa(contexto(discoDoClube(AGORA), { dispositivo: d }), 'removeuComSeguranca').ok).toBe(false);
  });

  it('com o pen drive ainda espetado a tarefa não fecha', () => {
    const { arvore, dispositivo } = copiarTres();
    const r = passa(contexto(arvore, { dispositivo }), 'removeuComSeguranca');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('ainda está conectado');
  });

  it('ejetar com segurança fecha', () => {
    const { arvore, dispositivo } = copiarTres();
    const d = removerComSeguranca(dispositivo);
    expect(passa(contexto(arvore, { dispositivo: d }), 'removeuComSeguranca').ok).toBe(true);
  });

  it('puxar sem ejetar deixa os arquivos pela metade, e a tarefa vermelha', () => {
    const { arvore, dispositivo } = copiarTres();
    const d = puxarSemRemover(dispositivo);
    const r = passa(contexto(arvore, { dispositivo: d }), 'removeuComSeguranca');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('pela metade');
  });
});

describe('restaurar e voltar no tempo (requisito 8)', () => {
  const novoId = criarGerador('r');

  it('copiar da cópia de segurança traz o arquivo de volta', () => {
    const disco = discoDoClube(AGORA);
    const a = copiarPara(disco, 'bk_sumiu', DOCUMENTOS, novoId, AGORA);
    expect(passa(contexto(a), 'restaurouDoBackup').ok).toBe(true);
  });

  it('mover em vez de copiar deixa a pessoa sem cópia de segurança', () => {
    const a = moverPara(discoDoClube(AGORA), 'bk_sumiu', DOCUMENTOS, AGORA);
    const r = passa(contexto(a), 'restaurouDoBackup');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('moveu em vez de copiar');
    /* E a árvore confirma o estrago, para a mensagem não estar inventando. */
    expect(a.some(n => n.nome === SUMIU && n.paiId === BACKUP)).toBe(false);
  });

  it('voltar à versão certa fecha o requisito 8', () => {
    const a = restaurarVersao(discoDoClube(AGORA), 'relatorio', 0, AGORA);
    expect(acharNo(a, 'relatorio')!.rotulo).toBe(VERSAO_PERDIDA);
    expect(passa(contexto(a), 'voltouAVersao').ok).toBe(true);
  });

  it('voltar à versão errada não fecha, e a mensagem diz isso', () => {
    const a = restaurarVersao(discoDoClube(AGORA), 'relatorio', 1, AGORA);
    const r = passa(contexto(a), 'voltouAVersao');
    expect(r.ok).toBe(false);
    expect(r.detalhe).toContain('não é a versão');
  });

  it('o relatório do disco abre na versão vazia, e não na boa', () => {
    /* A trava do "abre resolvido" para este requisito: se o disco nascesse
       com o relatório inteiro, a tarefa já estaria cumprida e a lição toda
       seria um clique em Concluir. */
    const n = acharNo(discoDoClube(AGORA), 'relatorio')!;
    expect(n.rotulo).not.toBe(VERSAO_PERDIDA);
    expect(n.nome).toBe(RELATORIO);
  });
});
