import { describe, expect, it } from 'vitest';
import {
  type Ausencia, type Caixa, type Mensagem,
  ASSUNTOS_QUE_NAO_DIZEM_NADA, DIRETOR, FALCAO, FALCAO_HOJE, FALCAO_NA_LISTA,
  FAMILIAS, HOJE, LIMITE_DE_ANEXO, VOCE,
  arquivar, assuntoNomeiaAMateria, assuntoVago, buscar, cabeNoAnexo, caixaDoClube,
  contaDemais, criarLista, custoDoEnvio, dizComQuemFalar, enderecosQueCadaUmVe,
  enderecosVisiveis, enviar, expandir, mudarMembros, naPasta, paraALixeira,
  pedeAlgumaCoisa, pesoDosAnexos, quemRecebe, rascunhoVazio, responderiaA,
  temFim, temPrazo, temSaudacao,
} from './correspondencia';

const caixa = () => caixaDoClube();

const mensagemDe = (p: Partial<Mensagem>): Mensagem => ({
  id: 'x', de: VOCE, deNome: 'Secretaria do Clube',
  para: [], cc: [], cco: [], assunto: '', corpo: '',
  anexos: [], vinculos: [], assinada: false,
  quando: HOJE, pasta: 'enviadas', lida: true,
  ...p,
});

const ausencia = (p: Partial<Ausencia>): Ausencia => ({
  ligada: true, de: '2026-07-10', ate: '2026-07-25',
  texto: 'Estou fora até 25 de julho. Para o acampamento, fale com tesouraria@clubepioneiros.org.br.',
  soParaContatos: true,
  ...p,
});

describe('a caixa de onde as lições partem', () => {
  it('tem as cinquenta e duas famílias e a unidade com seis pessoas', () => {
    /* Guarda contra o vazio: uma lista que esvaziasse deixaria toda conta de
       vazamento abaixo verdadeira por não ter conferido nada. */
    expect(FAMILIAS.length).toBe(52);
    expect(FALCAO.length).toBeGreaterThanOrEqual(5);
    expect(naPasta(caixa(), 'entrada').length).toBeGreaterThanOrEqual(8);
  });

  it('a lista da unidade chega errada dos dois lados, porque são dois erros', () => {
    /*
      Esquecer de tirar quem saiu e esquecer de pôr quem entrou são erros
      diferentes: o primeiro manda a conversa interna da unidade para quem não
      está mais nela, o segundo deixa alguém de fora de tudo sem nada avisar.
      Uma lista errada de um jeito só deixaria metade do requisito 4.4 sem o
      que exercitar.
    */
    expect(FALCAO_NA_LISTA).toContain('daniel');
    expect(FALCAO_HOJE).not.toContain('daniel');
    expect(FALCAO_HOJE).toContain('helena');
    expect(FALCAO_NA_LISTA).not.toContain('helena');
  });
});

describe('a lista de distribuição não esconde ninguém', () => {
  it('abre nos endereços de quem está dentro dela na hora de entregar', () => {
    const c = caixa();
    const lista = c.listas[0];
    expect(expandir(c, [lista.endereco]).length).toBe(lista.membros.length);
  });

  it('a lista no campo Para mostra a todos os endereços de todos', () => {
    /*
      É a confusão inteira entre lista e Cco: as duas encurtam a digitação, e
      só uma protege. Escrever o endereço da lista num campo é escrever os
      endereços de todo mundo naquele campo — e quem acha que mandou "para a
      lista" acha que não mostrou nada.
    */
    const c = caixa();
    const m = mensagemDe({ para: [c.listas[0].endereco] });
    expect(enderecosVisiveis(c, m).length).toBe(c.listas[0].membros.length);
    expect(enderecosQueCadaUmVe(c, m)).toBeGreaterThan(0);
  });

  it('trocar os membros troca quem recebe, sem mexer no endereço da lista', () => {
    const c = mudarMembros(caixa(), 'falcao', [...FALCAO_HOJE]);
    const m = mensagemDe({ para: [c.listas[0].endereco] });
    const recebem = quemRecebe(c, m);
    expect(recebem).not.toContain('daniel.rocha@exemplo.com');
    expect(recebem).toContain('helena.prado@exemplo.com');
    expect(c.listas[0].endereco).toBe(caixa().listas[0].endereco);
  });

  it('criar uma lista nova não mexe nas que já existem', () => {
    const c = criarLista(caixa(), {
      id: 'aguia', nome: 'Unidade Águia', endereco: 'unidade.aguia@clubepioneiros.org.br',
      membros: ['bruno'],
    });
    expect(c.listas.length).toBe(2);
    expect(c.listas[0].membros).toEqual(caixa().listas[0].membros);
  });
});

describe('o vazamento se mede pelo que cada um vê', () => {
  it('as cinquenta e duas no Cco não mostram endereço nenhum', () => {
    const c = caixa();
    const m = mensagemDe({ cco: FAMILIAS.map(f => f.endereco) });
    expect(quemRecebe(c, m).length).toBe(52);
    expect(enderecosQueCadaUmVe(c, m)).toBe(0);
  });

  it('uma família no Cco e as outras no Para é o campo preenchido e tudo vazado', () => {
    /*
      A conta não pode ser "o Cco tem alguém". Se fosse, esta mensagem passaria
      — e ela entrega cinquenta e um endereços a cinquenta e uma pessoas.
    */
    const c = caixa();
    const [primeira, ...resto] = FAMILIAS;
    const m = mensagemDe({
      cco: [primeira.endereco], para: resto.map(f => f.endereco),
    });
    expect(m.cco.length).toBeGreaterThan(0);
    expect(enderecosQueCadaUmVe(c, m)).toBe(50);
  });

  it('entre quem trabalha junto, o Para é a escolha certa e todos se veem', () => {
    /*
      O outro lado do requisito 3, e o que faz dele uma decisão e não uma
      regra: pôr os quatro da direção em Cco tira deles a conversa — ninguém
      responde a ninguém, porque ninguém sabe quem mais está ali.
    */
    const c = caixa();
    const m = mensagemDe({ para: [DIRETOR, 'direcao.associada@clubepioneiros.org.br'] });
    expect(enderecosQueCadaUmVe(c, m)).toBe(1);
  });
});

describe('o peso do anexo e o custo do envio', () => {
  it('o anexo que passa do limite do provedor não cabe', () => {
    const pequeno = mensagemDe({ anexos: [{ nome: 'ficha.pdf', mb: 2 }] });
    const grande = mensagemDe({ anexos: [{ nome: 'fotos.zip', mb: 180 }] });
    expect(pesoDosAnexos(grande)).toBe(180);
    expect(cabeNoAnexo(pequeno)).toBe(true);
    expect(cabeNoAnexo(grande)).toBe(false);
    expect(LIMITE_DE_ANEXO).toBeLessThan(180);
  });

  it('o custo multiplica pelo número de caixas que recebem', () => {
    /*
      É o número que responde ao "justificando a escolha" do requisito 4.2, e
      ele não aparece em correio nenhum: o que aparece é o tamanho do arquivo,
      uma vez. Cento e oitenta MB parecem pouco até serem quarenta vezes.
    */
    const c = caixa();
    const m = mensagemDe({
      anexos: [{ nome: 'fotos.zip', mb: 180 }],
      cco: FAMILIAS.slice(0, 40).map(f => f.endereco),
    });
    expect(custoDoEnvio(c, m)).toBe(180 * 40);
  });

  it('o vínculo não pesa, por mais gente que receba', () => {
    const c = caixa();
    const m = mensagemDe({
      vinculos: [{ nome: 'fotos do acampamento', mb: 180, quemAbre: 'convidados' }],
      cco: FAMILIAS.map(f => f.endereco),
    });
    expect(custoDoEnvio(c, m)).toBe(0);
  });
});

describe('arquivar não é excluir', () => {
  it('arquivar tira da entrada e a mensagem continua existindo', () => {
    const c = arquivar(caixa(), 'mural');
    expect(naPasta(c, 'entrada').some(m => m.id === 'mural')).toBe(false);
    expect(naPasta(c, 'arquivadas').some(m => m.id === 'mural')).toBe(true);
    expect(c.mensagens.length).toBe(caixa().mensagens.length);
  });

  it('a busca acha o que foi arquivado e não acha o que foi excluído', () => {
    /*
      É a assimetria inteira do requisito 4.3. Sem ela, arquivar e excluir são
      a mesma coisa com dois nomes — e é por acreditar que tirar da entrada é
      perder que alguém passa três anos com quatro mil mensagens nela.
    */
    const arquivada = buscar(arquivar(caixa(), 'salao'), 'salão');
    expect(arquivada.map(m => m.id)).toContain('salao');

    const excluida = buscar(paraALixeira(caixa(), 'salao'), 'salão');
    expect(excluida.map(m => m.id)).not.toContain('salao');
  });

  it('a busca vazia não devolve a caixa inteira', () => {
    /* Busca que devolve tudo quando não se procurou nada é a trava do "zero
       link não é zero link quebrado" aplicada à própria busca. */
    expect(buscar(caixa(), '   ')).toEqual([]);
  });
});

describe('a resposta de ausência', () => {
  const daFamilia = mensagemDe({ id: 'r', de: FALCAO[0].endereco, pasta: 'entrada' });
  const deQuemNinguemConhece = mensagemDe({
    id: 'r', de: 'promocao@naoconheco.example', pasta: 'entrada',
  });

  it('responde dentro do período e não responde fora dele', () => {
    const c: Caixa = { ...caixa(), ausencia: ausencia({}) };
    expect(responderiaA(c, daFamilia, '2026-07-12')).toBe(true);
    expect(responderiaA(c, daFamilia, '2026-07-01')).toBe(false);
    expect(responderiaA(c, daFamilia, '2026-08-01')).toBe(false);
  });

  it('sem fim declarado, ela responde em março que você está de férias', () => {
    const semFim = ausencia({ ate: '' });
    const c: Caixa = { ...caixa(), ausencia: semFim };
    expect(temFim(semFim)).toBe(false);
    expect(responderiaA(c, daFamilia, '2027-03-15')).toBe(true);
    expect(temFim(ausencia({}))).toBe(true);
  });

  it('só para contatos é o que impede confirmar o endereço a quem atirou no escuro', () => {
    const fechada: Caixa = { ...caixa(), ausencia: ausencia({ soParaContatos: true }) };
    const aberta: Caixa = { ...caixa(), ausencia: ausencia({ soParaContatos: false }) };
    expect(responderiaA(fechada, deQuemNinguemConhece, '2026-07-12')).toBe(false);
    expect(responderiaA(aberta, deQuemNinguemConhece, '2026-07-12')).toBe(true);
    /* E a guarda não pode fechar a porta de quem o clube conhece. */
    expect(responderiaA(fechada, daFamilia, '2026-07-12')).toBe(true);
  });

  it('desligada, não responde a ninguém', () => {
    const c: Caixa = { ...caixa(), ausencia: ausencia({ ligada: false }) };
    expect(responderiaA(c, daFamilia, '2026-07-12')).toBe(false);
  });

  it('o texto que diz que a casa está vazia é reconhecido', () => {
    expect(contaDemais(ausencia({
      texto: 'Estou viajando com a família de 10 a 25 de julho.',
    }))).toBe(true);
    expect(contaDemais(ausencia({}))).toBe(false);
  });

  it('e o texto sem a quem recorrer informa que não vai ter resposta e nada mais', () => {
    expect(dizComQuemFalar(ausencia({ texto: 'Estou fora até dia 25. Volto depois.' }))).toBe(false);
    expect(dizComQuemFalar(ausencia({}))).toBe(true);
  });
});

describe('o assunto e o pedido são duas contas cada, e não uma', () => {
  const PALAVRAS = ['ônibus', 'transporte'];

  it('nomear a matéria e não ser vago não se substituem', () => {
    /*
      "Reunião do ônibus" nomeia a matéria e continua começando por um assunto
      que num clube que se reúne toda semana não distingue nada; "Confirmação
      para quarta" não é vago e não diz do que trata. Uma conta só aprovaria
      um dos dois. É a decisão do molde e da data da CC-ES001.
    */
    expect(assuntoNomeiaAMateria('Reunião do ônibus', PALAVRAS)).toBe(true);
    expect(assuntoVago('Reunião')).toBe(true);
    expect(assuntoNomeiaAMateria('Confirmação para quarta', PALAVRAS)).toBe(false);
    expect(assuntoVago('Confirmação para quarta')).toBe(false);

    const bom = 'Confirmação do ônibus do acampamento — resposta até quarta';
    expect(assuntoNomeiaAMateria(bom, PALAVRAS)).toBe(true);
    expect(assuntoVago(bom)).toBe(false);
  });

  it('a lista de assuntos vagos não está vazia e tem os que o clube escreve', () => {
    expect(ASSUNTOS_QUE_NAO_DIZEM_NADA.length).toBeGreaterThanOrEqual(10);
    expect(assuntoVago('  AVISO  ')).toBe(true);
    expect(assuntoVago('Sem assunto')).toBe(true);
  });

  it('pedir e dizer até quando são erros diferentes', () => {
    /*
      "Seria bom se alguém pudesse levar o som" é uma frase simpática que não
      pede nada a ninguém. E um pedido claro sem prazo é lido por todo mundo e
      atendido por ninguém hoje — quem pediu descobre na véspera.
    */
    const desejo = 'Seria bom se alguém pudesse levar o som na sexta.';
    const semPrazo = 'Peço que confirmem a presença da unidade de vocês.';
    const pedido = 'Peço que confirmem a presença da unidade até quarta.';

    expect(pedeAlgumaCoisa(desejo)).toBe(false);
    expect(temPrazo(desejo)).toBe(true);

    expect(pedeAlgumaCoisa(semPrazo)).toBe(true);
    expect(temPrazo(semPrazo)).toBe(false);

    expect(pedeAlgumaCoisa(pedido)).toBe(true);
    expect(temPrazo(pedido)).toBe(true);
  });

  it('o prazo vale escrito como dia da semana, como data e como "até dia"', () => {
    expect(temPrazo('Confirme até domingo.')).toBe(true);
    expect(temPrazo('Confirme até 30/06.')).toBe(true);
    expect(temPrazo('Confirme até dia 30.')).toBe(true);
    expect(temPrazo('Confirme assim que puder.')).toBe(false);
  });

  it('a saudação é no começo, que é onde ela é saudação', () => {
    expect(temSaudacao('Prezados conselheiros,\n\nPeço que confirmem.')).toBe(true);
    expect(temSaudacao('Tio Nelson,\nBom dia.\n\nPeço que confirme.')).toBe(true);
    expect(temSaudacao('Peço que confirmem até quarta.\n\nObrigada e bom dia.')).toBe(false);
  });
});

describe('enviar', () => {
  it('põe a mensagem em Enviados e cola a assinatura configurada', () => {
    const c: Caixa = { ...caixa(), assinatura: 'Marina Duarte — Secretaria do Clube Pioneiros' };
    const depois = enviar(c, { ...rascunhoVazio(), para: [DIRETOR], corpo: 'Segue o total.' }, HOJE);
    const saiu = naPasta(depois, 'enviadas')[0];
    expect(saiu.assinada).toBe(true);
    expect(saiu.corpo).toContain('Marina Duarte');
  });

  it('sem assinatura configurada, a mensagem sai sem ela', () => {
    const depois = enviar(caixa(), { ...rascunhoVazio(), para: [DIRETOR] }, HOJE);
    expect(naPasta(depois, 'enviadas')[0].assinada).toBe(false);
  });

  it('não bloqueia o anexo que passa do limite — quem responde é a tela', () => {
    /*
      Simulação que vira muro no primeiro desvio ensina a andar no trilho. O
      requisito 4.2 pede que se **descubra** por que o anexo não serve, e para
      descobrir é preciso tentar.
    */
    const depois = enviar(caixa(), {
      ...rascunhoVazio(), para: [DIRETOR], anexos: [{ nome: 'fotos.zip', mb: 180 }],
    }, HOJE);
    expect(naPasta(depois, 'enviadas').length).toBe(1);
    expect(cabeNoAnexo(naPasta(depois, 'enviadas')[0])).toBe(false);
  });
});
