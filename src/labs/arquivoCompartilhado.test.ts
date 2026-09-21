import { describe, it, expect } from 'vitest';
import {
  type Nuvem,
  PAPEIS, O_QUE_O_PAPEL_DEIXA, maisPermissivo,
  nuvemDoClube, arquivoDe,
  papelDe, podeVer, podeComentar, podeEditar, abertosPelaPasta, pastasAcima,
  compartilhar, tirarAcessoDoArquivo, transferirPropriedade, arquivosQueVaoJunto,
  mandarPorAnexo, copiasQueDivergiram,
  gravarVersao, restaurarVersao, versaoAtual, quemEscreveu,
  conflitoDeSincronizacao, copiasEmConflito, resolverConflito,
} from './arquivoCompartilhado';
import { type Doc, linhaDe } from './documento';

/*
  A nuvem de arquivos da CC-ES006.

  ── O que este motor tem de carregar ─────────────────────────────────────
  Cinco definições do requisito 2 e seis demonstrações do requisito 4, e todas
  viram enunciado vazio se compartilhar for pôr um nome numa lista:

  — a permissão de uma pasta alcança o que está dentro, e **vence** a do
    arquivo quando é mais permissiva. Sem isso o requisito 5 é uma frase;
  — dar permissão de editar não é dar a conta. Sem isso o 2.5 e o 4.6 são a
    mesma coisa com dois nomes;
  — restaurar uma versão não apaga as mais novas. Sem isso o 4.5 ensina o medo
    que faz ninguém usar o recurso;
  — a cópia por anexo não volta a se ligar ao original. Sem isso os dois
    problemas do requisito 3 não existem;
  — e o conflito guarda as duas versões, num arquivo ao lado. Sem isso o
    requisito 6 não tem o que resolver.
*/

/* O documento mais curto que o `Doc` da CC-ES002 aceita. Ele existe para o
   histórico ter o que guardar, e não para ser lido: o que se compara aqui é
   se a versão restaurada é a versão restaurada. */
const doc = (texto: string): Doc<string> =>
  ({ blocos: [linhaDe('b1', 'corpo', texto)], colunas: { corpo: 1 }, sumario: null });

/* ── Os três papéis ────────────────────────────────────────────────────────── */

describe('os três níveis de permissão são três coisas, e não três palavras', () => {
  it('cada um diz o que deixa fazer e o que não deixa', () => {
    /*
      O `naoPode` é o que os separa. Quem tem permissão de comentar e digita no
      documento não muda o texto: ele propõe. Quem não sabe disso acha que
      editou, e é o caso que o requisito 4.4 existe para mostrar.
    */
    expect(PAPEIS).toEqual(['leitor', 'comentarista', 'editor']);
    for (const p of PAPEIS) {
      expect(O_QUE_O_PAPEL_DEIXA[p].pode.length, p).toBeGreaterThan(20);
      expect(O_QUE_O_PAPEL_DEIXA[p].naoPode.length, p).toBeGreaterThan(20);
    }
  });

  it('e o comentarista é quem não muda o texto direto', () => {
    expect(O_QUE_O_PAPEL_DEIXA.comentarista.naoPode).toMatch(/sugest/i);
  });

  it('o mais permissivo de dois é o que deixa mais, e não o que vem depois', () => {
    expect(maisPermissivo('leitor', 'editor')).toBe('editor');
    expect(maisPermissivo('editor', 'leitor')).toBe('editor');
    expect(maisPermissivo('comentarista', 'leitor')).toBe('comentarista');
    expect(maisPermissivo('leitor', 'leitor')).toBe('leitor');
  });
});

/* ── A permissão que de fato vale: o requisito 5 ───────────────────────────── */

describe('a permissão da pasta alcança o que está dentro, e vence a do arquivo', () => {
  const n = nuvemDoClube();

  it('a ficha médica não tem acesso próprio nenhum', () => {
    expect(n.arquivos.find(a => a.id === 'fichas')!.acessos).toEqual([]);
  });

  it('e mesmo assim quatro pessoas a abrem, pela pasta', () => {
    /*
      É o requisito 5 inteiro, e o arquivo em que ele mais custa: nome completo
      e dado de saúde de criança, com a caixa dele dizendo que só a dona vê.
      Nada estoura, nada avisa, e o arquivo está aberto porque alguém o
      arrastou para a pasta errada.
    */
    for (const quem of ['voce', 'ronaldo', 'cleide'] as const) {
      expect(podeVer(n, 'fichas', quem), quem).toBe(true);
    }
    expect(papelDe(n, 'fichas', 'marta')).toBe('editor');
  });

  it('a herança vem da pasta de cima e da pasta acima dela', () => {
    /* A ficha está em "Acampamento de julho", que está em "Clube Pioneiros".
       É a pasta de cima da de cima que compartilha. */
    expect(pastasAcima(n, 'fichas').map(p => p.id))
      .toEqual(['pasta-acampamento', 'pasta-clube']);
  });

  it('e o papel herdado vence o próprio quando é mais permissivo', () => {
    /*
      A decisão da nuvem, e a que espanta: marcar o arquivo como mais fechado
      **não o fecha**. A caixa dele passa a dizer "leitor" e a pessoa continua
      editando pela pasta.
    */
    const d = compartilhar(n, 'fichas', 'ronaldo', 'leitor');
    expect(papelDe(d, 'fichas', 'ronaldo'), 'o acesso próprio mais fechado ganhou')
      .toBe('editor');
  });

  it('mas o próprio vence quando é ele o mais permissivo', () => {
    /* A Cleide é leitora da pasta. Dar a ela edição no arquivo funciona: o que
       a regra diz é "o mais permissivo", e não "a pasta sempre". */
    const d = compartilhar(n, 'fichas', 'cleide', 'editor');
    expect(papelDe(d, 'fichas', 'cleide')).toBe('editor');
  });

  it('quem não alcança o arquivo não recebe papel nenhum', () => {
    /* A guarda contra o vazio: um `papelDe` que devolvesse 'leitor' para todo
       mundo deixaria toda asserção de acesso passar sem conferir nada. */
    const solto: Nuvem = { arquivos: [arquivoDe('x', 'Solto', 'documento', 'marta')] };
    expect(papelDe(solto, 'x', 'voce')).toBeUndefined();
    expect(podeVer(solto, 'x', 'voce')).toBe(false);
  });

  it('e o relatório nomeia os arquivos abertos pela pasta', () => {
    const abertos = abertosPelaPasta(n).map(x => x.arquivo.id);
    expect(abertos).toContain('fichas');
    expect(abertos).toContain('ata');
  });

  it('o dono sempre alcança o próprio arquivo, sem linha de acesso', () => {
    expect(podeEditar(n, 'escala', 'ronaldo')).toBe(true);
    expect(n.arquivos.find(a => a.id === 'escala')!.acessos.map(x => x.quem))
      .not.toContain('ronaldo');
  });

  it('e o comentarista comenta e não edita', () => {
    expect(podeComentar(n, 'combinado', 'voce')).toBe(true);
    expect(podeEditar(n, 'combinado', 'voce')).toBe(false);
  });
});

/* ── Dono não é editor: o requisito 2.5 e o 4.6 ────────────────────────────── */

describe('dar permissão de editar não é dar a conta', () => {
  const n = nuvemDoClube();

  it('quase tudo é da secretária, e o acesso dos outros não muda isso', () => {
    expect(arquivosQueVaoJunto(n, 'marta').map(a => a.id))
      .toEqual(['pasta-clube', 'pasta-acampamento', 'fichas', 'combinado', 'ata']);
  });

  it('dar edição a três pessoas não tira um arquivo da conta dela', () => {
    /*
      É a lição da CC-ES005 um nível acima: o cofre dizia que a pessoa não
      tinha acesso e ela continuava entrando; aqui todo mundo tem acesso e o
      arquivo some junto com a conta dela.
    */
    let d = compartilhar(n, 'ata', 'voce', 'editor');
    d = compartilhar(d, 'ata', 'ronaldo', 'editor');
    d = compartilhar(d, 'ata', 'cleide', 'editor');
    expect(arquivosQueVaoJunto(d, 'marta').map(a => a.id)).toContain('ata');
  });

  it('transferir a propriedade tira, e é outro gesto', () => {
    const d = transferirPropriedade(n, 'ata', 'voce');
    expect(arquivosQueVaoJunto(d, 'marta').map(a => a.id)).not.toContain('ata');
    expect(d.arquivos.find(a => a.id === 'ata')!.dono).toBe('voce');
  });

  it('e quem entregou a propriedade continua com acesso, como editor', () => {
    /* Numa nuvem de verdade o dono anterior não some da lista, e fingir o
       contrário ensinaria que transferir é perder. */
    const d = transferirPropriedade(n, 'ata', 'voce');
    expect(podeEditar(d, 'ata', 'marta')).toBe(true);
  });

  it('transferir para quem já é dono não duplica nada', () => {
    const d = transferirPropriedade(n, 'ata', 'marta');
    expect(d.arquivos.find(a => a.id === 'ata')!.acessos).toEqual([]);
  });

  it('e compartilhar duas vezes com a mesma pessoa troca o papel, não repete a linha', () => {
    let d = compartilhar(n, 'ata', 'cleide', 'leitor');
    d = compartilhar(d, 'ata', 'cleide', 'editor');
    const acessos = d.arquivos.find(a => a.id === 'ata')!.acessos;
    expect(acessos.filter(x => x.quem === 'cleide')).toHaveLength(1);
    expect(acessos.find(x => x.quem === 'cleide')!.papel).toBe('editor');
  });
});

/* ── Anexo ou vínculo: o requisito 3 ───────────────────────────────────────── */

describe('a cópia por anexo não volta a se ligar ao original', () => {
  const n = gravarVersao(nuvemDoClube(), 'combinado', 'hoje', ['marta'], doc('primeira redação'));

  it('recém-mandada, ela ainda diz a mesma coisa', () => {
    /* É por isso que ela parece inofensiva no dia em que se manda: a
       divergência não existe ainda. */
    const d = mandarPorAnexo(n, 'combinado', 'cleide', 'hoje');
    expect(copiasQueDivergiram(d, 'combinado')).toEqual([]);
  });

  it('e escrever de um dos lados não alcança o outro', () => {
    let d = mandarPorAnexo(n, 'combinado', 'cleide', 'hoje');
    d = gravarVersao(d, 'combinado', 'amanhã', ['marta'], doc('segunda redação'));
    expect(copiasQueDivergiram(d, 'combinado').map(a => a.dono)).toEqual(['cleide']);
  });

  it('a cópia é de quem recebeu, e tirar o acesso ao original não a alcança', () => {
    /*
      O segundo problema do requisito 3, e é a lição de "tirar o acesso não
      apaga a senha da memória de quem saiu" da CC-ES005, com outro objeto:
      quem recebeu o anexo fica com ele para sempre.
    */
    let d = compartilhar(n, 'combinado', 'cleide', 'leitor');
    d = mandarPorAnexo(d, 'combinado', 'cleide', 'hoje');
    d = tirarAcessoDoArquivo(d, 'combinado', 'cleide');

    expect(podeVer(d, 'combinado', 'cleide'), 'ela ainda alcança o original').toBe(false);
    const copia = d.arquivos.find(a => a.copiaDe === 'combinado')!;
    expect(copia.dono).toBe('cleide');
    expect(podeVer(d, copia.id, 'cleide'), 'a cópia saiu do alcance dela').toBe(true);
  });
});

/* ── O histórico: o requisito 4.5 e o 8 ────────────────────────────────────── */

describe('o histórico de versões guarda quem escreveu', () => {
  it('quem só leu não entra, e é de propósito', () => {
    /*
      Um histórico que contasse leitura deixaria "produzimos juntos"
      verdadeiro para quem só abriu — e para o caso que de fato acontece, o de
      uma pessoa colar o texto das outras e o histórico dizer um nome só.
    */
    let n = nuvemDoClube();
    n = gravarVersao(n, 'escala', 'segunda', ['voce'], doc('a'));
    n = gravarVersao(n, 'escala', 'terça', ['marta'], doc('ab'));
    expect(quemEscreveu(n.arquivos.find(a => a.id === 'escala')!).sort())
      .toEqual(['marta', 'ronaldo', 'voce']);
  });

  it('restaurar uma versão antiga não apaga as mais novas', () => {
    /*
      É a metade da lição que decide se alguém usa o recurso: quem acha que
      restaurar destrói o que veio depois nunca restaura, e prefere refazer o
      trabalho à mão.
    */
    let n = nuvemDoClube();
    n = gravarVersao(n, 'escala', 'segunda', ['voce'], doc('primeira'));
    n = gravarVersao(n, 'escala', 'terça', ['marta'], doc('segunda'));
    const antes = n.arquivos.find(a => a.id === 'escala')!.versoes.length;

    const alvo = n.arquivos.find(a => a.id === 'escala')!.versoes[1].id;
    n = restaurarVersao(n, 'escala', alvo, 'voce', 'quarta');

    const arq = n.arquivos.find(a => a.id === 'escala')!;
    expect(arq.versoes.length, 'restaurar apagou versões').toBe(antes + 1);
    expect(versaoAtual(arq)!.doc).toEqual(doc('primeira'));
  });

  it('e quem restaura entra no histórico, porque restaurar é uma edição', () => {
    let n = nuvemDoClube();
    n = gravarVersao(n, 'ata', 'segunda', ['marta'], doc('x'));
    const alvo = n.arquivos.find(a => a.id === 'ata')!.versoes[0].id;
    n = restaurarVersao(n, 'ata', alvo, 'voce', 'terça');
    expect(quemEscreveu(n.arquivos.find(a => a.id === 'ata')!)).toContain('voce');
  });

  it('restaurar uma versão que não existe não mexe em nada', () => {
    const n = nuvemDoClube();
    expect(restaurarVersao(n, 'ata', 'nao-existe', 'voce', 'hoje')).toEqual(n);
  });
});

/* ── O conflito: o requisito 6 ─────────────────────────────────────────────── */

describe('o conflito guarda as duas versões, e é aí que o trabalho se perde', () => {
  it('a segunda edição vira um arquivo ao lado, com nome parecido', () => {
    /*
      A nuvem não escolhe entre as duas. O trabalho não se perde por ser
      sobrescrito: se perde por ficar num arquivo que ninguém abre, na mesma
      pasta, com nome quase igual.
    */
    const n = conflitoDeSincronizacao(nuvemDoClube(), 'escala', 'marta', doc('o que ela escreveu'), 'hoje');
    const copias = copiasEmConflito(n);
    expect(copias).toHaveLength(1);
    expect(copias[0].nome).toContain('Escala das unidades');
    expect(copias[0].pasta, 'a cópia caiu fora da pasta').toBe('pasta-clube');
  });

  it('e o que ela escreveu está lá dentro, inteiro', () => {
    const n = conflitoDeSincronizacao(nuvemDoClube(), 'escala', 'marta', doc('o que ela escreveu'), 'hoje');
    expect(versaoAtual(copiasEmConflito(n)[0])!.doc).toEqual(doc('o que ela escreveu'));
  });

  it('resolver precisa das duas metades: juntar e tirar a cópia da pasta', () => {
    /*
      Juntar sem apagar a cópia deixa na pasta um arquivo quase igual, que
      alguém vai abrir por engano no mês que vem. Apagar sem juntar joga fora o
      que a outra pessoa escreveu — que é o que o conflito existia para não
      deixar acontecer.
    */
    let n = conflitoDeSincronizacao(nuvemDoClube(), 'escala', 'marta', doc('dela'), 'hoje');
    const conflito = copiasEmConflito(n)[0].id;
    n = resolverConflito(n, 'escala', conflito, doc('dela e minha'), 'voce', 'hoje');

    expect(copiasEmConflito(n), 'a cópia continuou na pasta').toEqual([]);
    expect(versaoAtual(n.arquivos.find(a => a.id === 'escala')!)!.doc)
      .toEqual(doc('dela e minha'));
  });
});

/* ── A nuvem do clube abre com os quatro defeitos ──────────────────────────── */

describe('a nuvem do clube chega errada, e nada nela dá erro', () => {
  const n = nuvemDoClube();

  it('não chega vazia, que aprovaria tudo calado', () => {
    expect(n.arquivos.length).toBeGreaterThanOrEqual(6);
  });

  it('a ficha médica está aberta pela pasta', () => {
    expect(abertosPelaPasta(n).map(x => x.arquivo.id)).toContain('fichas');
  });

  it('e quase tudo é de uma pessoa só', () => {
    const dela = arquivosQueVaoJunto(n, 'marta').length;
    expect(dela).toBeGreaterThan(n.arquivos.length / 2);
  });

  it('e nenhum arquivo abre já com dois donos, que não existe', () => {
    /* `dono` é um só de propósito: uma lista de donos seria a mesma coisa que
       a lista de editores, e a distinção do requisito 2.5 sumiria. */
    for (const a of n.arquivos) expect(typeof a.dono, a.nome).toBe('string');
  });

  it('e a árvore de pastas não tem laço', () => {
    /* `pastasAcima` para num laço, e a trava confere que ele não existe: uma
       pasta dentro dela mesma travaria a tela sem nada explicando. */
    for (const a of n.arquivos) {
      const acima = pastasAcima(n, a.id).map(p => p.id);
      expect(new Set(acima).size, `${a.nome} está num laço de pastas`).toBe(acima.length);
    }
  });
});

/* ── O papel de quem não está na lista ─────────────────────────────────────── */

describe('tirar o acesso tira mesmo, e só daquele arquivo', () => {
  it('tirar do arquivo não tira o que a pasta dá', () => {
    /*
      É o outro lado do requisito 5, e o gesto que mais engana: tirar a pessoa
      da lista do arquivo e achar que ela saiu. Ela continua entrando pela
      pasta, e a caixa do arquivo agora não tem nem o nome dela para explicar.
    */
    const n = compartilhar(nuvemDoClube(), 'fichas', 'ronaldo', 'editor');
    const d = tirarAcessoDoArquivo(n, 'fichas', 'ronaldo');
    expect(d.arquivos.find(a => a.id === 'fichas')!.acessos).toEqual([]);
    expect(podeVer(d, 'fichas', 'ronaldo'), 'ele saiu de verdade').toBe(true);
  });

  it('e tirá-lo da pasta é o que fecha', () => {
    const d = tirarAcessoDoArquivo(nuvemDoClube(), 'pasta-clube', 'ronaldo');
    expect(podeVer(d, 'fichas', 'ronaldo')).toBe(false);
  });
});
