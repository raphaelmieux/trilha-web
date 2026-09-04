/**
 * O passo a passo de cada verificação de blocos.
 *
 * A moldura oferece isto depois de um tempo sem ninguém concluir nada. É
 * convite, não despejo — e aqui ele importa mais do que nos outros
 * laboratórios, porque em blocos a pessoa costuma travar não por não saber o
 * que quer, mas por não achar onde o bloco está. Por isso todo passo nomeia a
 * categoria da paleta.
 */
export const PASSOS_DE_BLOCOS: Record<string, string[]> = {
  bandeira: [
    'Na paleta, escolha a categoria Eventos.',
    'Toque em "quando ⚑ for clicado" — o da bandeira verde. Ele abre uma pilha nova.',
    'Escolha outra categoria e toque num bloco: ele entra embaixo do chapéu.',
    'Clique na bandeira verde para ver a pilha rodar.',
  ],
  moverPorTecla: [
    'Em Eventos, toque em "quando a tecla ... for pressionada".',
    'No próprio bloco, escolha a tecla — direita, por exemplo.',
    'Em Movimento, toque em "mova ... passos". Ele entra embaixo do chapéu de tecla.',
    'Clique na bandeira verde e segure a seta. O ator anda enquanto a tecla estiver pressionada.',
  ],
  laco: [
    'Em Controle, toque em "repita ... vezes" ou em "sempre".',
    'O bloco aparece com um espaço vazio dentro. Toque nesse espaço: o cursor entra ali.',
    'Agora escolha o bloco que deve se repetir. Ele cai dentro do laço, e não embaixo dele.',
    'Um laço vazio repete o nada — é o espaço de dentro que faz dele um laço.',
  ],
  condicional: [
    'Em Controle, toque em "se ..., então".',
    'No próprio bloco, escolha a pergunta: tocando em alguém, tecla pressionada, ou uma variável maior que um número.',
    'Toque no espaço vazio de dentro e escolha o que deve acontecer quando a resposta for sim.',
  ],
  variavel: [
    'Abra Variáveis, na paleta, escreva um nome e toque em "Nova variável". Dê a ela um nome que diga o que guarda: placar, vidas, tempo.',
    'Os blocos de variável só aparecem depois que existe uma. Toque em "mude ... em ..." para somar ao valor, ou em "defina ... para ..." para trocá-lo.',
    'Ponha o bloco dentro de uma pilha que comece por um chapéu; solto, ele nunca executa.',
    'Criar a variável não basta: o requisito pede que o valor mude enquanto o programa roda.',
  ],
  aparenciaOuSom: [
    'Em Aparência, "próxima fantasia" troca o desenho do ator.',
    'Em Som, "toque um som" conta um som tocado.',
    'Encaixe um dos dois numa pilha que um evento dispare — a bandeira, uma tecla, ou o clique no ator.',
  ],
  doisPersonagens: [
    'Embaixo do palco há a lista de atores. Toque no segundo para editá-lo.',
    'A área de scripts troca junto: cada ator tem as pilhas dele.',
    'Dê ao segundo pelo menos uma pilha começando por um chapéu.',
  ],
  interacao: [
    'Escolha o ator que vai perceber o encontro.',
    'Em Controle, ponha um "se ..., então" numa pilha que rode sempre.',
    'Na pergunta do "se", escolha "tocando em" e depois o **outro ator** — e não a borda.',
    'Dentro do "se", ponha o que acontece quando eles se encontram.',
  ],
  placar: [
    'Primeiro o "se": é ele que decide quando o ponto vale.',
    'Toque no espaço de dentro do "se" para o cursor entrar ali.',
    'Em Variáveis, toque em "mude ... em 1".',
    'Fora do "se", o placar subiria a cada quadro — marcaria ponto por existir, e não por acontecer alguma coisa.',
  ],
  fimDeJogo: [
    'Em Controle, ponha outro "se ..., então".',
    'Na pergunta dele, escolha "variável maior que" e o número que encerra o jogo.',
    'Dentro, ponha o que anuncia o fim: um "diga" e um "pare tudo".',
  ],
};
