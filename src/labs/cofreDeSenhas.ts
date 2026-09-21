/**
 * O cofre de senhas, sem tela nenhuma.
 *
 * Ele mora separado de `gerenciadorDeSenhas.tsx` pela razão de sempre: o
 * modelo se testa sem subir React, e a janela é só quem o desenha. É a divisão
 * de `capturaDoScanner.ts` e `documentoPdf.ts`.
 *
 * ── O que esta vereda cobra deste motor ──────────────────────────────────
 * O requisito 3 manda explicar por que **reutilizar** a mesma senha em
 * serviços diferentes é falha mais grave do que usar uma senha curta num
 * serviço só. Isso é um enunciado vazio se o cofre não souber responder duas
 * coisas: quanto uma senha resiste, e o que acontece com as outras contas
 * quando uma delas vaza.
 *
 * Então o motor faz as duas contas de verdade. Uma senha reutilizada em quatro
 * serviços não é "quatro vezes pior": é uma senha cuja queda em **qualquer
 * um** dos quatro derruba os outros três, inclusive os que nunca foram
 * atacados.
 */

/* ── O que uma entrada é ──────────────────────────────────────────────────── */

export interface EntradaDoCofre {
  id: string;
  servico: string;
  /** O endereço ou nome de usuário daquela conta. */
  usuario: string;
  senha: string;
  /**
   * De quem é a conta: do clube, ou de uma pessoa.
   *
   * **Declarado, e não adivinhado pelo endereço.** Adivinhar exigiria uma
   * lista de nomes de gente, e erraria nos dois sentidos — é a mesma decisão
   * da `tabela` da planilha, e pelo mesmo motivo escrito lá.
   */
  dono: 'clube' | 'pessoa';
  /**
   * Quem consegue entrar hoje. É a resposta do requisito 8, entrada por
   * entrada, e é o que a troca de diretoria move.
   */
  acesso: string[];
}

export interface Cofre {
  entradas: EntradaDoCofre[];
}

/* ── Quanto uma senha resiste ─────────────────────────────────────────────── */

/**
 * As classes de caractere que a senha usa.
 *
 * Elas não são a resposta — são metade dela, e a metade que todo medidor de
 * senha da internet mostra. A outra metade é o comprimento, e é ela que
 * manda.
 */
const CLASSES: [RegExp, number][] = [
  [/[a-z]/, 26],
  [/[A-Z]/, 26],
  [/[0-9]/, 10],
  [/[^a-zA-Z0-9]/, 33],
];

/**
 * As senhas que aparecem em toda lista de senhas vazadas.
 *
 * Elas não são adivinhadas caractere a caractere: são **tentadas primeiro**.
 * Uma senha desta lista cai no primeiro segundo por mais classes de caractere
 * que tenha, que é por que `Senha@123` não é senha.
 *
 * A lista é curta de propósito — ela não precisa ser completa para ensinar o
 * que ensina, e uma lista longa dentro do repositório seria uma lista de
 * senhas dentro do repositório.
 */
const DAS_LISTAS = [
  '123456', '123456789', 'senha', 'password', 'qwerty', 'abc123',
  'senha123', 'password123', '12345678', 'iloveyou', 'admin',
  'senha@123', 'p@ssw0rd', 'mudar123', 'brasil', 'flamengo',
];

/** Trocas que um ataque de dicionário desfaz antes de tentar qualquer coisa. */
const DISFARCES: [RegExp, string][] = [
  [/@/g, 'a'], [/4/g, 'a'], [/3/g, 'e'], [/1/g, 'i'],
  [/0/g, 'o'], [/\$/g, 's'], [/5/g, 's'], [/!/g, 'i'],
];

/** A senha, com os disfarces desfeitos e sem o que costuma ir no fim. */
const semDisfarce = (senha: string) => {
  let s = senha.toLowerCase();
  for (const [de, para] of DISFARCES) s = s.replace(de, para);
  return s;
};

/**
 * A senha é uma da lista, disfarçada ou não?
 *
 * `P@ssw0rd!` e `Senha@123` são as duas mais escolhidas por quem está
 * atendendo a um formulário que exige maiúscula, número e símbolo — e as duas
 * estão nas listas há vinte anos. É por isso que o medidor da plataforma não
 * pode ser um contador de classes de caractere.
 */
export function ehDasListas(senha: string): boolean {
  const limpa = semDisfarce(senha).replace(/[^a-z]+$/, '');
  return DAS_LISTAS.some(x => semDisfarce(x) === limpa || semDisfarce(x) === semDisfarce(senha));
}

export type ForcaDaSenha = 'frágil' | 'fraca' | 'razoável' | 'forte';

/**
 * Quanto tempo a senha aguenta, em ordem de grandeza.
 *
 * A conta é o tamanho do alfabeto elevado ao comprimento — que é o que um
 * ataque por força bruta percorre — e o que decide é o **expoente**. Trocar
 * `a` por `@` acrescenta uma classe e não muda o comprimento; acrescentar
 * quatro letras multiplica o trabalho por vinte e seis à quarta.
 *
 * Devolve o log na base 10 do número de tentativas, porque o número em si
 * passa de qualquer inteiro que caiba numa tela.
 */
export function ordemDeGrandeza(senha: string): number {
  if (!senha) return 0;
  const alfabeto = CLASSES.reduce((t, [re, n]) => t + (re.test(senha) ? n : 0), 0);
  if (alfabeto === 0) return 0;
  return senha.length * Math.log10(alfabeto);
}

/**
 * A força de uma senha, como esta vereda a mede.
 *
 * **Senha das listas é frágil, e ponto** — antes de qualquer conta. É a
 * diferença entre este medidor e o de quase todo formulário da internet:
 * `Senha@123` tem as quatro classes, doze caracteres e uma ordem de grandeza
 * respeitável, e cai no primeiro segundo porque ninguém a adivinha, alguém a
 * tenta.
 *
 * E o comprimento manda no resto: `cavalo bateria grampo correto` não tem
 * maiúscula, número nem símbolo, e aguenta mais do que `Tr@lh4!` por uma
 * margem que não cabe na tela.
 */
export function forcaDaSenha(senha: string): ForcaDaSenha {
  if (ehDasListas(senha)) return 'frágil';
  const g = ordemDeGrandeza(senha);
  if (g < 12) return 'frágil';
  if (g < 18) return 'fraca';
  if (g < 25) return 'razoável';
  return 'forte';
}

/* ── O que a reutilização faz ─────────────────────────────────────────────── */

/**
 * Os grupos de entradas que dividem a mesma senha.
 *
 * Só grupos de dois para cima: uma senha usada uma vez não é reutilizada, e
 * listá-la como "reutilizada em 1 serviço" ensinaria errado sobre a palavra.
 */
export function senhasReutilizadas(c: Cofre): EntradaDoCofre[][] {
  const por = new Map<string, EntradaDoCofre[]>();
  for (const e of c.entradas) {
    if (!e.senha) continue;
    por.set(e.senha, [...(por.get(e.senha) ?? []), e]);
  }
  return [...por.values()].filter(g => g.length >= 2);
}

/**
 * O que cai junto quando **este** serviço vaza.
 *
 * É a conta do requisito 3, e ela é a razão de o cofre existir. Quem vazou foi
 * um serviço; quem perde a conta são todos os que repetem aquela senha — e os
 * outros não foram atacados, não têm defeito nenhum, e caem do mesmo jeito.
 *
 * Devolve as **outras** entradas, e não o grupo inteiro: a que vazou já se
 * sabe, e misturá-la no total daria um número um a mais que ninguém confere.
 */
export function cairiamJunto(c: Cofre, idQueVazou: string): EntradaDoCofre[] {
  const vazou = c.entradas.find(e => e.id === idQueVazou);
  if (!vazou || !vazou.senha) return [];
  return c.entradas.filter(e => e.id !== vazou.id && e.senha === vazou.senha);
}

/* ── Gerar ────────────────────────────────────────────────────────────────── */

const LETRAS = 'abcdefghijkmnopqrstuvwxyz';
const MAIUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const NUMEROS = '23456789';
const SIMBOLOS = '!@#$%&*-_=+?';

export interface ComoGerar {
  tamanho: number;
  maiusculas: boolean;
  numeros: boolean;
  simbolos: boolean;
}

export const COMO_GERAR_PADRAO: ComoGerar = {
  tamanho: 20, maiusculas: true, numeros: true, simbolos: true,
};

/**
 * Uma senha nova.
 *
 * `sorteio` entra por fora para o teste poder fixar o resultado — um gerador
 * que sorteasse por conta própria daria uma senha diferente a cada execução, e
 * a trava não teria o que afirmar. É a mesma decisão do reconhecimento de
 * texto do leitor de PDF, que é determinístico pelo mesmo motivo.
 *
 * Os caracteres que se confundem lendo ficam de fora — `l`, `I`, `1`, `O`,
 * `0` —, que é o que todo gerador de verdade faz: senha que ninguém consegue
 * ditar ao telefone é senha que alguém vai anotar num papel.
 */
export function gerarSenha(como: ComoGerar, sorteio: () => number = Math.random): string {
  const alfabeto = LETRAS
    + (como.maiusculas ? MAIUSCULAS : '')
    + (como.numeros ? NUMEROS : '')
    + (como.simbolos ? SIMBOLOS : '');
  let s = '';
  for (let i = 0; i < como.tamanho; i++) {
    s += alfabeto[Math.floor(sorteio() * alfabeto.length)];
  }
  return s;
}

/* ── As operações do cofre ────────────────────────────────────────────────── */

export const comEntrada = (c: Cofre, e: EntradaDoCofre): Cofre => ({
  entradas: c.entradas.some(x => x.id === e.id)
    ? c.entradas.map(x => (x.id === e.id ? e : x))
    : [...c.entradas, e],
});

export const trocarSenha = (c: Cofre, id: string, senha: string): Cofre =>
  ({ entradas: c.entradas.map(e => (e.id === id ? { ...e, senha } : e)) });

/* ── De quem é a conta, e quem consegue entrar nela ───────────────────────── */

/**
 * Passar uma entrada para a conta do clube.
 *
 * É o gesto do requisito 7: a conta que está pendurada no endereço pessoal de
 * alguém passa a estar no endereço do clube. Trocar o `usuario` sem trocar o
 * `dono` deixaria o cofre dizendo que a conta continua sendo de uma pessoa —
 * e é o `dono` que responde à pergunta.
 */
export const passarParaOClube = (c: Cofre, id: string, endereco: string): Cofre =>
  ({ entradas: c.entradas.map(e => (e.id === id ? { ...e, dono: 'clube', usuario: endereco } : e)) });

/** Quem mais passa a poder entrar. Duplicar um nome não acrescenta pessoa. */
export const darAcesso = (c: Cofre, id: string, quem: string): Cofre => ({
  entradas: c.entradas.map(e =>
    (e.id === id && !e.acesso.includes(quem) ? { ...e, acesso: [...e.acesso, quem] } : e)),
});

export const tirarAcesso = (c: Cofre, id: string, quem: string): Cofre =>
  ({ entradas: c.entradas.map(e => (e.id === id ? { ...e, acesso: e.acesso.filter(q => q !== quem) } : e)) });

/**
 * As contas que estão no nome de uma pessoa, e não no do clube.
 *
 * Primeira das duas contas do requisito 7 — e ela não se responde olhando o
 * endereço. Adivinhar pelo texto exigiria uma lista de nomes de gente, e
 * erraria nos dois sentidos: `tesouraria.pioneiros` parece nome de pessoa e é
 * do clube, e `contato2026` parece do clube e pode ser de qualquer um. Quem
 * monta o cofre sabe de quem é a conta, então `dono` é **declarado** — é a
 * mesma decisão da `tabela` da planilha, que se declara em vez de sair do que
 * está preenchido.
 */
export const contasNoNomeDeAlguem = (c: Cofre): EntradaDoCofre[] =>
  c.entradas.filter(e => e.dono === 'pessoa');

/**
 * As contas que uma pessoa só levaria embora, porque mais ninguém entra.
 *
 * Segunda conta do requisito 7, e ela **não substitui** a primeira. São dois
 * defeitos diferentes, e cada um sobrevive à correção do outro:
 *
 * — conta no nome de uma pessoa que duas pessoas abrem continua morrendo com o
 *   endereço dela, porque é para lá que vai a recuperação;
 * — conta no nome do clube que só uma pessoa abre continua se perdendo no dia
 *   em que essa pessoa some.
 *
 * Corrigir uma e declarar o cofre resolvido é o que este par existe para não
 * deixar acontecer.
 */
export const contasQueSoUmAbre = (c: Cofre, quem: string): EntradaDoCofre[] =>
  c.entradas.filter(e => e.acesso.length === 1 && e.acesso[0] === quem);

/** Toda conta que depende de uma pessoa só, por qualquer um dos dois motivos. */
export const contasSemSegundaPessoa = (c: Cofre): EntradaDoCofre[] =>
  c.entradas.filter(e => e.acesso.length < 2);

/* ── O cofre do clube, como ele chega ─────────────────────────────────────── */

/**
 * O cofre como a secretaria do clube o deixou.
 *
 * Ele chega **errado**, e de cinco jeitos, porque cada um é uma lição — e
 * nenhum dos cinco dá erro em lugar nenhum: o cofre abre, as senhas entram, e
 * tudo funciona até o dia em que não funciona.
 *
 * Os três de senha:
 *
 * — a mesma senha em quatro serviços, que é o requisito 3 inteiro e o único
 *   dos cinco que não se vê olhando uma entrada por vez;
 * — `Senha@123`, que tem as quatro classes de caractere e está em toda lista
 *   de senhas vazadas desde sempre;
 * — uma senha curta e única, que é justamente o caso com que o requisito 3
 *   manda comparar a reutilizada: ela é fraca, e derruba **uma** conta.
 *
 * E os dois de dono, que são o requisito 7:
 *
 * — os formulários de inscrição do clube estão na conta pessoal da Marta, que
 *   é a secretária — o dia em que ela mudar de clube, as respostas de todos os
 *   acampamentos vão com ela;
 * — quatro das seis só a Marta abre, e uma só o Ronaldo abre. Não é preciso
 *   ninguém sair de má-fé: basta perder o telefone.
 */
export const cofreDoClube = (): Cofre => ({
  entradas: [
    {
      id: 'email', servico: 'E-mail do clube', dono: 'clube',
      usuario: 'clubepioneiros@gmail.com', senha: 'Pioneiros2026', acesso: ['Marta'],
    },
    {
      id: 'drive', servico: 'Nuvem de arquivos', dono: 'clube',
      usuario: 'clubepioneiros@gmail.com', senha: 'Pioneiros2026', acesso: ['Marta'],
    },
    {
      id: 'insta', servico: 'Rede social do clube', dono: 'clube',
      usuario: '@clubepioneiros', senha: 'Pioneiros2026', acesso: ['Marta'],
    },
    {
      id: 'formulario', servico: 'Formulários de inscrição', dono: 'pessoa',
      usuario: 'marta.oliveira@gmail.com', senha: 'Pioneiros2026', acesso: ['Marta'],
    },
    {
      id: 'tesouraria', servico: 'Sistema da tesouraria', dono: 'clube',
      usuario: 'tesouraria.pioneiros', senha: 'Senha@123', acesso: ['Ronaldo'],
    },
    {
      id: 'loja', servico: 'Loja de uniformes', dono: 'clube',
      usuario: 'clubepioneiros@gmail.com', senha: 'club26', acesso: ['Marta', 'Ronaldo'],
    },
  ],
});
