/**
 * A ajuda que o Excel dá enquanto se escreve uma fórmula.
 *
 * São duas, e as duas são do programa e não da plataforma:
 *
 *   · a **lista de funções**: digitar `=SO` abre embaixo da célula SOMA,
 *     SOMASE e SUBTOTAL não, porque não começa por SO — e o Tab escreve a
 *     escolhida com o parêntese aberto. É assim que quem não lembra se é
 *     MÉDIA ou MEDIA descobre, e é assim que a fórmula sai escrita certo;
 *   · a **dica de sintaxe**: com o parêntese aberto, aparece o molde da
 *     função, `SOMA(núm1; [núm2]; ...)`, com o argumento da vez em negrito.
 *     O ponto e vírgula entre os argumentos está escrito ali, e é por ela que
 *     ninguém precisa decorar que no Brasil o separador não é a vírgula.
 *
 * O catálogo é o das funções que `formulas.ts` calcula, e só delas: oferecer
 * na lista uma função que o motor responde com `#NOME?` seria a plataforma
 * sugerindo a fórmula errada. `ajudaDeFormulas.test.ts` confere que cada nome
 * daqui é entendido pelo motor.
 *
 * Os nomes são os do Excel em português, com acento e ponto — `MÉDIA`,
 * `CONT.NÚM` —, porque é o que a lista dele mostra. O motor aceita com ou
 * sem acento, como o Excel aceita.
 */

export interface FuncaoDoCatalogo {
  nome: string;
  /** Os argumentos, separados por ponto e vírgula; opcionais entre colchetes. */
  argumentos: string[];
  /** O que a função faz, na frase curta que o Excel mostra ao lado da lista. */
  descricao: string;
}

export const FUNCOES_DO_EXCEL: FuncaoDoCatalogo[] = [
  { nome: 'ARRED', argumentos: ['núm', 'núm_dígitos'], descricao: 'Arredonda um número até uma quantidade de casas.' },
  { nome: 'CONT.NÚM', argumentos: ['valor1', '[valor2]', '...'], descricao: 'Conta quantas células contêm números.' },
  { nome: 'CONT.SE', argumentos: ['intervalo', 'critérios'], descricao: 'Conta as células que atendem a uma condição.' },
  { nome: 'CONT.VALORES', argumentos: ['valor1', '[valor2]', '...'], descricao: 'Conta quantas células não estão vazias.' },
  { nome: 'CORREL', argumentos: ['matriz1', 'matriz2'], descricao: 'Coeficiente de correlação entre duas faixas.' },
  { nome: 'DESVPAD', argumentos: ['núm1', '[núm2]', '...'], descricao: 'Desvio padrão de uma amostra.' },
  { nome: 'DESVPADA', argumentos: ['valor1', '[valor2]', '...'], descricao: 'Desvio padrão de uma amostra, contando textos e lógicos.' },
  { nome: 'DESVPADP', argumentos: ['núm1', '[núm2]', '...'], descricao: 'Desvio padrão da população inteira.' },
  { nome: 'E', argumentos: ['lógico1', '[lógico2]', '...'], descricao: 'VERDADEIRO se todos os argumentos forem verdadeiros.' },
  { nome: 'INCLINAÇÃO', argumentos: ['val_conhecidos_y', 'val_conhecidos_x'], descricao: 'Inclinação da reta de regressão.' },
  { nome: 'INTERCEPÇÃO', argumentos: ['val_conhecidos_y', 'val_conhecidos_x'], descricao: 'Ponto em que a reta de regressão corta o eixo y.' },
  { nome: 'MÁXIMO', argumentos: ['núm1', '[núm2]', '...'], descricao: 'O maior valor de um conjunto.' },
  { nome: 'MED', argumentos: ['núm1', '[núm2]', '...'], descricao: 'A mediana: o valor do meio.' },
  { nome: 'MÉDIA', argumentos: ['núm1', '[núm2]', '...'], descricao: 'A média aritmética.' },
  { nome: 'MÍNIMO', argumentos: ['núm1', '[núm2]', '...'], descricao: 'O menor valor de um conjunto.' },
  { nome: 'MODO', argumentos: ['núm1', '[núm2]', '...'], descricao: 'O valor que mais se repete.' },
  { nome: 'MODO.ÚNICO', argumentos: ['núm1', '[núm2]', '...'], descricao: 'O valor que mais se repete.' },
  { nome: 'NÃO', argumentos: ['lógico'], descricao: 'Inverte o valor lógico.' },
  { nome: 'OU', argumentos: ['lógico1', '[lógico2]', '...'], descricao: 'VERDADEIRO se algum argumento for verdadeiro.' },
  { nome: 'PEARSON', argumentos: ['matriz1', 'matriz2'], descricao: 'Coeficiente de correlação de Pearson.' },
  { nome: 'PREVISÃO', argumentos: ['x', 'val_conhecidos_y', 'val_conhecidos_x'], descricao: 'Prevê um valor pela reta de regressão.' },
  { nome: 'PREVISÃO.LINEAR', argumentos: ['x', 'val_conhecidos_y', 'val_conhecidos_x'], descricao: 'Prevê um valor pela reta de regressão.' },
  { nome: 'PROCV', argumentos: ['valor_procurado', 'matriz_tabela', 'núm_índice_coluna', '[procurar_intervalo]'], descricao: 'Procura na primeira coluna e devolve a da mesma linha.' },
  { nome: 'RQUAD', argumentos: ['val_conhecidos_y', 'val_conhecidos_x'], descricao: 'O quadrado da correlação.' },
  { nome: 'SE', argumentos: ['teste_lógico', '[valor_se_verdadeiro]', '[valor_se_falso]'], descricao: 'Um valor se a condição for verdadeira, e outro se não.' },
  { nome: 'SOMA', argumentos: ['núm1', '[núm2]', '...'], descricao: 'Soma os números.' },
  { nome: 'SOMASE', argumentos: ['intervalo', 'critérios', '[intervalo_soma]'], descricao: 'Soma as células que atendem a uma condição.' },
  { nome: 'SUBTOTAL', argumentos: ['núm_função', 'ref1', '...'], descricao: 'Soma, conta ou faz a média só do que está à vista.' },
];

/** Compara sem acento, sem ponto e sem caixa, como o motor compara. */
export const chaveDaFuncao = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\./g, '').toUpperCase();

/**
 * As funções que começam pelo que se está digitando, se é que se está
 * digitando um nome de função.
 *
 * Só depois de um lugar onde uma função pode começar — o `=`, um operador, o
 * parêntese ou o ponto e vírgula. `=A1` não abre lista nenhuma: `A1` começa
 * por letra e é referência, e a lista no meio de uma referência seria o Tab
 * trocando `A1` por `ARRED(`.
 */
export function sugestoesDeFuncao(texto: string): { prefixo: string; nomes: FuncaoDoCatalogo[] } | null {
  if (!texto.startsWith('=')) return null;
  const m = /(?:^=|[=+\-*/^(;:,<>&\s])([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.]*)$/.exec(texto);
  if (!m) return null;
  const prefixo = m[1];
  /* Letras seguidas de número já são referência: A1, AB12. */
  if (/^[A-Za-z]{1,3}\d/.test(prefixo)) return null;
  const chave = chaveDaFuncao(prefixo);
  const nomes = FUNCOES_DO_EXCEL.filter(f => chaveDaFuncao(f.nome).startsWith(chave));
  /* Nome já escrito por inteiro e sozinho na lista não precisa de lista. */
  if (nomes.length === 0 || (nomes.length === 1 && chaveDaFuncao(nomes[0].nome) === chave)) return null;
  return { prefixo, nomes };
}

/** Troca o prefixo do fim pelo nome escolhido com o parêntese aberto. */
export function completarFuncao(texto: string, prefixo: string, f: FuncaoDoCatalogo): string {
  return `${texto.slice(0, texto.length - prefixo.length)}${f.nome}(`;
}

/**
 * A função cujo parêntese está aberto no fim do texto, e em qual argumento
 * dela se está — é o que a dica de sintaxe mostra, com aquele em negrito.
 *
 * Conta os parênteses de dentro para fora e pula o que está entre aspas: um
 * `";"` dentro de um critério de CONT.SE não é separador de argumento.
 */
export function funcaoAberta(texto: string): { funcao: FuncaoDoCatalogo; argumento: number } | null {
  if (!texto.startsWith('=')) return null;
  const pilha: { nome: string; argumento: number }[] = [];
  let aspas = false;
  for (let i = 1; i < texto.length; i++) {
    const ch = texto[i];
    if (ch === '"') { aspas = !aspas; continue; }
    if (aspas) continue;
    if (ch === '(') {
      const m = /([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ.]*)$/.exec(texto.slice(0, i));
      pilha.push({ nome: m ? m[1] : '', argumento: 0 });
    } else if (ch === ')') {
      pilha.pop();
    } else if (ch === ';' && pilha.length) {
      pilha[pilha.length - 1].argumento += 1;
    }
  }
  for (let k = pilha.length - 1; k >= 0; k--) {
    const f = FUNCOES_DO_EXCEL.find(x => chaveDaFuncao(x.nome) === chaveDaFuncao(pilha[k].nome));
    if (f) return { funcao: f, argumento: pilha[k].argumento };
    if (pilha[k].nome) return null;
  }
  return null;
}

/**
 * O argumento da dica em negrito: o da vez, ou — passado do último, nas
 * funções de lista como SOMA — o `...`, que é onde os seguintes caem.
 */
export function argumentoEmDestaque(f: FuncaoDoCatalogo, argumento: number): number {
  if (argumento < f.argumentos.length) return argumento;
  return f.argumentos[f.argumentos.length - 1] === '...' ? f.argumentos.length - 1 : -1;
}
