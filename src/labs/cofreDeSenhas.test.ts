import { describe, it, expect } from 'vitest';
import {
  type Cofre,
  forcaDaSenha, ordemDeGrandeza, ehDasListas, senhasReutilizadas, cairiamJunto,
  gerarSenha, COMO_GERAR_PADRAO, cofreDoClube, trocarSenha,
  contasNoNomeDeAlguem, contasQueSoUmAbre, contasSemSegundaPessoa,
  passarParaOClube, darAcesso, tirarAcesso,
} from './cofreDeSenhas';

/*
  O cofre de senhas da CC-ES005.

  ── O que este motor tem de carregar ─────────────────────────────────────
  O requisito 3 manda explicar por que reutilizar a mesma senha em serviços
  diferentes é falha mais grave do que usar uma senha curta num serviço só.
  Isso é enunciado vazio se o cofre não souber responder as duas contas — e
  se ele não as responder, o laboratório vira um formulário em que se digita
  a resposta que a lição já deu.
*/

const cofre = (...pares: [string, string][]): Cofre => ({
  entradas: pares.map(([id, senha]) => ({
    id, servico: id, usuario: `${id}@x.com`, senha, dono: 'clube', acesso: ['Marta', 'Ronaldo'],
  })),
});

/* ── A força não é contagem de classe de caractere ─────────────────────────── */

describe('a força de uma senha não se mede contando símbolos', () => {
  it('senha de lista é frágil por mais classes que tenha', () => {
    /*
      É a diferença entre este medidor e o de quase todo formulário da
      internet. `Senha@123` tem maiúscula, minúscula, número e símbolo, doze
      caracteres, e passa em qualquer cadastro — e está em toda lista de
      senhas vazadas há vinte anos. Ninguém a adivinha: alguém a tenta.
    */
    expect(forcaDaSenha('Senha@123')).toBe('frágil');
    expect(forcaDaSenha('P@ssw0rd')).toBe('frágil');
    expect(forcaDaSenha('Mudar123')).toBe('frágil');
  });

  it('e o disfarce de caractere não a tira da lista', () => {
    /* Trocar `a` por `@` e `o` por `0` é a primeira coisa que um ataque de
       dicionário desfaz, antes de tentar qualquer outra. */
    expect(ehDasListas('s3nh@')).toBe(true);
    expect(ehDasListas('p@ssw0rd')).toBe(true);
    expect(ehDasListas('fl@m3ng0')).toBe(true);
  });

  it('comprimento vence classe de caractere, e por muito', () => {
    /*
      `Tr@lh4!` tem as quatro classes e sete caracteres; a frase não tem
      nenhuma além de minúscula e espaço, e tem vinte e nove. A conta é o
      alfabeto elevado ao comprimento, e quem manda é o expoente — é esta a
      frase que a lição de teoria escreve, e é esta a conta que a sustenta.
    */
    const curta = ordemDeGrandeza('Tr@lh4!');
    const frase = ordemDeGrandeza('cavalo bateria grampo correto');
    expect(frase).toBeGreaterThan(curta * 2);
    expect(forcaDaSenha('cavalo bateria grampo correto')).toBe('forte');
  });

  it('e a senha vazia não é "forte por não ter o que adivinhar"', () => {
    /* A guarda contra o vazio: um alfabeto de tamanho zero elevado a zero
       daria conta nenhuma, e um cofre vazio se diria seguro. */
    expect(ordemDeGrandeza('')).toBe(0);
    expect(forcaDaSenha('')).toBe('frágil');
  });
});

/* ── A reutilização, que é o requisito 3 ───────────────────────────────────── */

describe('o que a reutilização faz, e que nenhuma entrada sozinha mostra', () => {
  it('uma senha usada uma vez não é reutilizada', () => {
    /* Chamar isso de "reutilizada em 1 serviço" ensinaria errado sobre a
       palavra, e encheria a tela de aviso que não é aviso. */
    expect(senhasReutilizadas(cofre(['a', 'abc'], ['b', 'def']))).toEqual([]);
  });

  it('e a senha repetida junta as entradas num grupo só', () => {
    const g = senhasReutilizadas(cofre(['a', 'igual'], ['b', 'igual'], ['c', 'outra']));
    expect(g).toHaveLength(1);
    expect(g[0].map(e => e.id).sort()).toEqual(['a', 'b']);
  });

  it('o vazamento de um serviço derruba os outros que repetem a senha', () => {
    /*
      É a conta inteira do requisito 3. Quem vazou foi **um** serviço; quem
      perde a conta são todos os que repetem aquela senha — e os outros não
      foram atacados, não têm defeito nenhum, e caem do mesmo jeito.
    */
    const c = cofre(['email', 'igual'], ['drive', 'igual'], ['insta', 'igual'], ['banco', 'única']);
    expect(cairiamJunto(c, 'email').map(e => e.id).sort()).toEqual(['drive', 'insta']);
  });

  it('e a que vazou não entra na própria conta', () => {
    /* Ela já se sabe. Somá-la daria um número um a mais que ninguém confere,
       e a lição diz "mais três contas", não "mais quatro". */
    const c = cofre(['a', 'igual'], ['b', 'igual']);
    expect(cairiamJunto(c, 'a').map(e => e.id)).toEqual(['b']);
  });

  it('a senha curta e única derruba uma conta só', () => {
    /*
      É o outro lado da comparação que o requisito 3 pede, e sem ele a lição
      seria "senha curta é ruim" em vez de "reutilizar é pior". A curta é
      fraca **e** cai sozinha; a reutilizada pode ser forte e leva três junto.
    */
    const c = cofreDoClube();
    expect(forcaDaSenha('club26')).toBe('frágil');
    expect(cairiamJunto(c, 'loja')).toEqual([]);
    expect(cairiamJunto(c, 'email')).toHaveLength(3);
  });
});

/* ── O cofre do clube chega errado, e de três jeitos ───────────────────────── */

describe('o cofre do clube abre com os três defeitos que as lições consertam', () => {
  const c = cofreDoClube();

  it('a mesma senha em quatro serviços', () => {
    const g = senhasReutilizadas(c);
    expect(g).toHaveLength(1);
    expect(g[0]).toHaveLength(4);
  });

  it('uma senha que passa em qualquer cadastro e está em toda lista', () => {
    const t = c.entradas.find(e => e.id === 'tesouraria')!;
    expect(ehDasListas(t.senha)).toBe(true);
    expect(forcaDaSenha(t.senha)).toBe('frágil');
  });

  it('e nenhuma entrada abre já forte', () => {
    /*
      Lista com item verde no segundo zero ensina a não ler a lista. Se
      alguma senha já chegasse forte, a tarefa de gerar uma nova nasceria
      cumprida para aquele serviço.
    */
    const fortes = c.entradas.filter(e => forcaDaSenha(e.senha) === 'forte');
    expect(fortes.map(e => e.id)).toEqual([]);
  });

  it('e o cofre não chega vazio, que aprovaria tudo calado', () => {
    expect(c.entradas.length).toBeGreaterThanOrEqual(5);
  });
});

/* ── Gerar ─────────────────────────────────────────────────────────────────── */

describe('a senha gerada', () => {
  /* O sorteio entra por fora: um gerador que sorteasse sozinho daria uma
     senha diferente a cada execução, e a trava não teria o que afirmar. */
  const fixo = () => 0.5;

  it('tem o tamanho pedido', () => {
    expect(gerarSenha({ ...COMO_GERAR_PADRAO, tamanho: 20 }, fixo)).toHaveLength(20);
    expect(gerarSenha({ ...COMO_GERAR_PADRAO, tamanho: 8 }, fixo)).toHaveLength(8);
  });

  it('e sai forte no tamanho padrão', () => {
    /*
      O padrão do gerador é o que a maioria vai aceitar sem mexer. Se ele
      saísse fraco, o laboratório entregaria uma senha ruim com cara de
      recomendação da plataforma.
    */
    let i = 0;
    const variado = () => { i += 1; return (i * 0.37) % 1; };
    expect(forcaDaSenha(gerarSenha(COMO_GERAR_PADRAO, variado))).toBe('forte');
  });

  it('e não usa os caracteres que se confundem lendo', () => {
    /* Senha que ninguém consegue ditar ao telefone é senha que alguém vai
       anotar num papel — que é o contrário do que o cofre serve para fazer. */
    let i = 0;
    const todos = () => { i += 1; return (i * 0.017) % 1; };
    const s = gerarSenha({ ...COMO_GERAR_PADRAO, tamanho: 400 }, todos);
    for (const c of ['l', 'I', '1', 'O', '0']) {
      expect(s.includes(c), `a senha gerada usa "${c}"`).toBe(false);
    }
  });
});

/* ── Trocar ────────────────────────────────────────────────────────────────── */

describe('trocar a senha de um serviço', () => {
  it('desfaz a reutilização só daquele, e deixa os outros como estavam', () => {
    /*
      É o que o desbravador faz no laboratório, um serviço por vez — e é onde
      ele vê que trocar uma não resolve as outras três. Uma troca que
      arrumasse o grupo inteiro esconderia o trabalho que a reutilização
      custa para desfazer.
    */
    const c = trocarSenha(cofreDoClube(), 'email', 'frase longa e única de verdade');
    const g = senhasReutilizadas(c);
    expect(g).toHaveLength(1);
    expect(g[0].map(e => e.id).sort()).toEqual(['drive', 'formulario', 'insta']);
  });
});

/* ── De quem é a conta: os requisitos 7 e 8 ────────────────────────────────── */

describe('as duas contas do requisito 7 são duas, e nenhuma cobre a outra', () => {
  /*
    A pergunta do requisito 7 é por que as contas do clube não podem estar
    penduradas no endereço pessoal de um membro. A resposta tem duas metades, e
    elas falham em dias diferentes:

    — a conta no nome de uma pessoa morre com o endereço dela, ainda que duas
      pessoas saibam a senha, porque a recuperação vai para lá;
    — a conta no nome do clube que só uma pessoa abre se perde no dia em que
      essa pessoa some, ainda que a conta seja do clube.

    Corrigir uma e declarar o cofre resolvido é o que este par existe para não
    deixar acontecer.
  */
  const c = cofreDoClube();

  it('o cofre chega com uma conta do clube no nome da secretária', () => {
    const suas = contasNoNomeDeAlguem(c);
    expect(suas.map(e => e.id)).toEqual(['formulario']);
    expect(suas[0].usuario).toContain('marta');
  });

  it('e com cinco das seis dependendo de uma pessoa só', () => {
    expect(contasSemSegundaPessoa(c).map(e => e.id))
      .toEqual(['email', 'drive', 'insta', 'formulario', 'tesouraria']);
  });

  it('passar para o clube não dá segunda pessoa a ninguém', () => {
    /* Esta é a trava do par. Corrigir o dono deixa a conta do clube — e ela
       continua sendo aberta por uma pessoa só, que é o outro defeito, intacto
       e agora com cara de resolvido. */
    const d = passarParaOClube(c, 'formulario', 'inscricoes@clubepioneiros.org');
    expect(contasNoNomeDeAlguem(d)).toEqual([]);
    expect(contasSemSegundaPessoa(d).map(e => e.id)).toContain('formulario');
  });

  it('e dar segunda pessoa não tira a conta do nome de ninguém', () => {
    /* O espelho do de cima, e ele é necessário: uma trava só pegaria metade. */
    const d = darAcesso(c, 'formulario', 'Ronaldo');
    expect(contasSemSegundaPessoa(d).map(e => e.id)).not.toContain('formulario');
    expect(contasNoNomeDeAlguem(d).map(e => e.id)).toEqual(['formulario']);
  });

  it('o que o clube perde se a Marta sair hoje', () => {
    /* Quatro contas — e nenhuma delas por má-fé de ninguém: basta ela perder o
       telefone. É o número que a lição escreve. */
    expect(contasQueSoUmAbre(c, 'Marta').map(e => e.id))
      .toEqual(['email', 'drive', 'insta', 'formulario']);
    expect(contasQueSoUmAbre(c, 'Ronaldo').map(e => e.id)).toEqual(['tesouraria']);
  });

  it('e dar acesso duas vezes não inventa uma terceira pessoa', () => {
    const d = darAcesso(darAcesso(c, 'insta', 'Ronaldo'), 'insta', 'Ronaldo');
    expect(d.entradas.find(e => e.id === 'insta')!.acesso).toEqual(['Marta', 'Ronaldo']);
  });

  it('e tirar o acesso de quem sai deixa a conta pendurada em quem fica', () => {
    const d = tirarAcesso(cofreDoClube(), 'loja', 'Marta');
    expect(d.entradas.find(e => e.id === 'loja')!.acesso).toEqual(['Ronaldo']);
    expect(contasSemSegundaPessoa(d).map(e => e.id)).toContain('loja');
  });
});
