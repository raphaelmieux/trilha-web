import { describe, it, expect } from 'vitest';
import {
  buscar, compactar, descompactar, salvarPorCima, restaurarVersao,
  acharNo, filhosDe, criarGerador, TAXA_DO_PACOTE,
  AREA, DOCUMENTOS, LIXEIRA, type No,
} from './arquivos';
import {
  PENDRIVE, dispositivoInicial, conectar, copiadoParaODispositivo,
  removerComSeguranca, puxarSemRemover, chegouInteiro, gravadosDeVerdade,
} from './dispositivoExterno';
import { familiaDe } from './tiposDeArquivo';

/*
  As quatro peças que a CC-ES001 precisa e o disco da AP043 não tinha.

  ── Por que elas nascem aqui, e não dentro do laboratório ────────────────
  São regras puras sobre uma lista de nós, como todo o resto de `arquivos.ts`.
  Escritas dentro do componente, cada uma só poderia ser conferida montando
  tela — e são justamente as quatro em que o defeito é invisível de dentro:

  1. Busca que não filtra devolve a pasta inteira, e a tela mostra uma lista
     grande que parece resultado de busca.
  2. Pacote que apaga o original faz o espaço livre aumentar, que é o que a
     pessoa queria — e ensina o contrário do que a lição diz.
  3. Restaurar versão sem guardar a de agora troca uma perda por outra, e quem
     restaurou a errada fica sem as duas.
  4. Remoção segura que não faz nada é um botão que só existe para ser clicado:
     a tarefa fica verde e a lição some.
*/

const T = Date.UTC(2026, 2, 14, 12, 0);
const dia = 86400000;

const pasta = (id: string, nome: string, paiId: string | null): No =>
  ({ id, nome, tipo: 'pasta', paiId, tamanhoKb: 0, modificadoEm: T });

const arq = (id: string, nome: string, paiId: string, kb: number, diasAtras = 0): No =>
  ({ id, nome, tipo: 'arquivo', paiId, tamanhoKb: kb, modificadoEm: T - diasAtras * dia });

/*
  Um disco pequeno e deliberado: dois níveis, dois tipos de arquivo, e datas
  espalhadas — o suficiente para cada filtro ter o que descartar. Uma árvore em
  que todo arquivo casa com todo filtro não conferiria filtro nenhum.
*/
const disco = (): No[] => [
  pasta(AREA, 'Área de Trabalho', null),
  pasta(DOCUMENTOS, 'Documentos', null),
  pasta(LIXEIRA, 'Lixeira', null),
  pasta('clube', 'Clube', DOCUMENTOS),
  pasta('ano', '2026', 'clube'),
  arq('ata', 'ata-reuniao.docx', 'ano', 31, 0),
  arq('insc', 'inscritos.xlsx', 'ano', 94, 2),
  arq('foto', 'foto-da-turma.jpg', 'ano', 2400, 40),
  arq('autoriza', 'autorizacao.pdf', 'clube', 180, 1),
  arq('velho', 'ata-antiga.docx', 'clube', 22, 400),
  arq('lixo', 'rascunho.docx', LIXEIRA, 8, 3),
];

describe('a busca com filtro', () => {
  it('acha pelo pedaço do nome, em qualquer profundidade', () => {
    const achados = buscar(disco(), DOCUMENTOS, { termo: 'ata' }, familiaDe);
    expect(achados.map(n => n.id).sort()).toEqual(['ata', 'velho']);
  });

  /* "autorização" digitado com acento tem de achar "autorizacao" sem, e o
     contrário também: quem procura não sabe como quem nomeou escreveu. */
  it('ignora acento e caixa dos dois lados', () => {
    const achados = buscar(disco(), DOCUMENTOS, { termo: 'AUTORIZAÇÃO' }, familiaDe);
    expect(achados.map(n => n.id)).toEqual(['autoriza']);
  });

  it('filtra por tipo', () => {
    const achados = buscar(disco(), DOCUMENTOS, { tipo: 'imagem' }, familiaDe);
    expect(achados.map(n => n.id)).toEqual(['foto']);
  });

  /*
    Pasta também tem data de modificação, e o Explorador a inclui num filtro de
    data — quem procura "o que mexi esta semana" quer ver a pasta em que mexeu.
    Quem só quer arquivo acrescenta o tipo, que é o segundo filtro.
  */
  it('filtra por data, e pasta tem data como qualquer item', () => {
    const recentes = buscar(disco(), DOCUMENTOS, { de: T - 5 * dia }, familiaDe);
    expect(recentes.map(n => n.id).sort()).toEqual(['ano', 'ata', 'autoriza', 'clube', 'insc']);

    const soDocumentos = buscar(
      disco(), DOCUMENTOS, { de: T - 5 * dia, tipo: 'documento' }, familiaDe);
    expect(soDocumentos.map(n => n.id)).toEqual(['ata']);
  });

  it('acha pasta pelo tipo', () => {
    const pastas = buscar(disco(), DOCUMENTOS, { tipo: 'pasta' }, familiaDe);
    expect(pastas.map(n => n.id).sort()).toEqual(['ano', 'clube']);
  });

  /*
    Os critérios se somam. Se um filtro alargasse o resultado, ele não estaria
    filtrando — e a tela mostraria mais coisa a cada condição acrescentada, que
    é o contrário do que a pessoa está tentando fazer.
  */
  it('soma os critérios em vez de alternar entre eles', () => {
    const tudo = buscar(disco(), DOCUMENTOS, { termo: 'ata' }, familiaDe);
    const comTipo = buscar(disco(), DOCUMENTOS, { termo: 'ata', tipo: 'documento' }, familiaDe);
    const comData = buscar(
      disco(), DOCUMENTOS, { termo: 'ata', tipo: 'documento', de: T - 5 * dia }, familiaDe);

    expect(tudo.length).toBe(2);
    expect(comTipo.length).toBe(2);
    expect(comData.map(n => n.id)).toEqual(['ata']);
  });

  /* O que foi excluído não é resultado de busca em gerenciador nenhum: mostrá-lo
     faria a pessoa abrir um arquivo que ela acabou de mandar embora. */
  it('não devolve o que está na Lixeira', () => {
    const achados = buscar(disco(), DOCUMENTOS, { termo: 'rascunho' }, familiaDe);
    expect(achados).toEqual([]);
  });
});

describe('compactar e descompactar', () => {
  it('cria o pacote na mesma pasta, menor que a soma do que leva', () => {
    const { arvore, pacoteId } = compactar(
      disco(), ['ata', 'insc'], 'Acampamento.zip', criarGerador('z'), T);
    const pacote = acharNo(arvore, pacoteId!)!;

    expect(pacote.paiId).toBe('ano');
    expect(pacote.tamanhoKb).toBe(Math.round((31 + 94) * TAXA_DO_PACOTE));
  });

  /*
    A armadilha que a lição nomeia: o pacote é uma cópia. Quem compacta para
    liberar espaço e não apaga o original acabou de ocupar mais espaço.
  */
  it('deixa os originais onde estavam', () => {
    const { arvore } = compactar(disco(), ['ata', 'insc'], 'p.zip', criarGerador('z'), T);
    expect(acharNo(arvore, 'ata')).toBeDefined();
    expect(acharNo(arvore, 'insc')).toBeDefined();
    expect(filhosDe(arvore, 'ano')).toHaveLength(4);
  });

  it('leva junto o que está dentro da pasta compactada', () => {
    const { arvore, pacoteId } = compactar(disco(), ['ano'], 'ano.zip', criarGerador('z'), T);
    const dentro = acharNo(arvore, pacoteId!)!.empacotado!;
    expect(dentro.map(n => n.id).sort()).toEqual(['ano', 'ata', 'foto', 'insc']);
  });

  /* Zip é sem perda, e é o ponto do tópico: o que sai é o que entrou. */
  it('devolve a mesma estrutura ao descompactar', () => {
    const g = criarGerador('z');
    const { arvore, pacoteId } = compactar(disco(), ['ano'], 'ano.zip', g, T);
    const depois = descompactar(arvore, pacoteId!, g, T);

    /* A pasta recriada cai ao lado do pacote, com nome livre, e traz os três
       arquivos dentro. */
    const copia = filhosDe(depois, 'clube').find(n => n.nome === '2026 (2)')!;
    expect(copia).toBeDefined();
    expect(filhosDe(depois, copia.id).map(n => n.nome).sort())
      .toEqual(['ata-reuniao.docx', 'foto-da-turma.jpg', 'inscritos.xlsx']);
  });

  it('não faz pacote de lista vazia', () => {
    const { arvore, pacoteId } = compactar(disco(), [], 'p.zip', criarGerador('z'), T);
    expect(pacoteId).toBeNull();
    expect(arvore).toHaveLength(disco().length);
  });
});

describe('o histórico de versões', () => {
  it('guarda o que havia antes ao salvar por cima', () => {
    const inicial = disco().map(n =>
      (n.id === 'insc' ? { ...n, rotulo: 'com os lançamentos de março' } : n));
    const depois = salvarPorCima(
      inicial, 'insc', { rotulo: 'sem os lançamentos de março', tamanhoKb: 40 }, T + dia);
    const arquivo = acharNo(depois, 'insc')!;

    expect(arquivo.tamanhoKb).toBe(40);
    expect(arquivo.versoes).toHaveLength(1);
    expect(arquivo.versoes![0].rotulo).toBe('com os lançamentos de março');
  });

  /*
    O rótulo que vai para o histórico é o do que SAI, e não o do que entra.
    Copiar o novo faria a lista descrever todas as versões como a de agora —
    que é a única que ninguém quer recuperar.
  */
  it('descreve cada versão pelo que ela tinha', () => {
    let a = disco().map(n => (n.id === 'ata' ? { ...n, rotulo: 'primeira redação' } : n));
    a = salvarPorCima(a, 'ata', { rotulo: 'com as correções', tamanhoKb: 35 }, T + dia);
    a = salvarPorCima(a, 'ata', { rotulo: 'versão aprovada', tamanhoKb: 38 }, T + 2 * dia);

    expect(acharNo(a, 'ata')!.versoes!.map(v => v.rotulo))
      .toEqual(['com as correções', 'primeira redação']);
  });

  /* Restaurar sem guardar o de agora troca uma perda por outra. */
  it('põe a versão atual no histórico ao restaurar', () => {
    let a = disco().map(n => (n.id === 'insc' ? { ...n, rotulo: 'completa' } : n));
    a = salvarPorCima(a, 'insc', { rotulo: 'faltando três meses', tamanhoKb: 40 }, T + dia);
    a = restaurarVersao(a, 'insc', 0, T + 2 * dia);

    const arquivo = acharNo(a, 'insc')!;
    expect(arquivo.rotulo).toBe('completa');
    expect(arquivo.tamanhoKb).toBe(94);
    expect(arquivo.versoes!.map(v => v.rotulo)).toEqual(['faltando três meses']);
  });

  it('não mexe em índice que não existe', () => {
    const a = restaurarVersao(disco(), 'ata', 3, T + dia);
    expect(acharNo(a, 'ata')!.tamanhoKb).toBe(31);
  });
});

describe('o dispositivo externo', () => {
  it('começa desconectado e sem nada pendente', () => {
    const d = dispositivoInicial();
    expect(d.conectado).toBe(false);
    expect(d.porGravar).toEqual([]);
  });

  it('a remoção segura termina de gravar o que estava pendente', () => {
    const d = removerComSeguranca(
      copiadoParaODispositivo(conectar(dispositivoInicial()), ['ata', 'insc']));

    expect(d.conectado).toBe(false);
    expect(d.porGravar).toEqual([]);
    expect(d.corrompidos).toEqual([]);
    expect(chegouInteiro(d, 'ata')).toBe(true);
  });

  /*
    O de sempre nesta vereda: puxar cedo não dá erro nenhum. O arquivo aparece
    do outro lado com o nome certo e um tamanho plausível, e não abre.
  */
  it('puxar sem remover quebra o que ainda não tinha sido gravado', () => {
    const d = puxarSemRemover(
      copiadoParaODispositivo(conectar(dispositivoInicial()), ['ata', 'insc']));

    expect(d.conectado).toBe(false);
    expect(d.corrompidos.sort()).toEqual(['ata', 'insc']);
    expect(chegouInteiro(d, 'ata')).toBe(false);
  });

  /* O que já tinha sido gravado numa remoção anterior continua bom, e é essa
     mistura que torna o defeito difícil de ler na vida real. */
  it('não quebra o que já tinha sido gravado antes', () => {
    let d = removerComSeguranca(
      copiadoParaODispositivo(conectar(dispositivoInicial()), ['ata']));
    d = puxarSemRemover(copiadoParaODispositivo(conectar(d), ['insc']));

    expect(chegouInteiro(d, 'ata')).toBe(true);
    expect(chegouInteiro(d, 'insc')).toBe(false);
  });

  /* Pedir a remoção de um pen drive já puxado não conserta nada — e fingir que
     conserta seria pior do que recusar. */
  it('não desfaz o estrago se a remoção vier depois', () => {
    let d = puxarSemRemover(
      copiadoParaODispositivo(conectar(dispositivoInicial()), ['ata']));
    d = removerComSeguranca(d);
    expect(chegouInteiro(d, 'ata')).toBe(false);
  });

  it('separa o que está no dispositivo do que chegou inteiro', () => {
    const arvore: No[] = [
      ...disco(),
      pasta(PENDRIVE, 'Pen drive (E:)', null),
      arq('copia1', 'ata-reuniao.docx', PENDRIVE, 31),
      arq('copia2', 'inscritos.xlsx', PENDRIVE, 94),
    ];
    const d = puxarSemRemover(
      copiadoParaODispositivo(conectar(dispositivoInicial()), ['copia2']));

    expect(arvore.filter(n => n.paiId === PENDRIVE)).toHaveLength(2);
    expect(gravadosDeVerdade(arvore, d).map(n => n.id)).toEqual(['copia1']);
  });
});
