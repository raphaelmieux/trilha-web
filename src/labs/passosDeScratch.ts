/**
 * O passo a passo de cada verificação, escrito para o Scratch de verdade.
 *
 * ── Por que não serve o mesmo do editor reserva ──────────────────────────
 * As duas listas cobram os mesmos dez ids, e por um momento pareceu que
 * dividiriam também o passo a passo. Não dividem: o editor da plataforma era de
 * toque — escolher um bloco na paleta o encaixava sozinho —, e o Scratch é de
 * **arrastar**. Um passo que diz "toque no bloco" manda o desbravador fazer a
 * única coisa que ali não funciona: tocar num bloco da paleta o executa uma vez
 * e não põe nada no programa dele.
 *
 * E isto aparece justamente para quem já travou. Instrução errada nessa hora é
 * pior do que instrução nenhuma: ela ensina que a pessoa é que está errada.
 *
 * ── Os nomes são os que estão na tela ────────────────────────────────────
 * "próxima fantasia" e não "próximo traje"; "adicione 1 a placar" e não "mude
 * placar em 1"; "Criar uma Variável" com maiúsculas, que é como o botão está
 * escrito. Foram lidos da paleta em português, e não traduzidos de memória —
 * passo que nomeia um bloco que não existe manda procurar o que não há.
 */
export const PASSOS_DE_SCRATCH: Record<string, string[]> = {
  bandeira: [
    'Na paleta da esquerda, clique na categoria Eventos — a bolinha amarela.',
    'Arraste "quando ⚑ for clicado" para a área quadriculada do meio. É ali que o programa se monta.',
    'Arraste outro bloco e solte logo abaixo dele, encostando: quando aparecer uma sombra clara, solte. Os dois ficam grudados.',
    'Clique na bandeira verde, em cima do palco, para ver a pilha rodar.',
  ],
  moverPorTecla: [
    'Em Eventos, arraste "quando a tecla [espaço] for pressionada" para a área do meio.',
    'Clique na palavra "espaço" dentro do bloco e escolha "seta para direita" na lista.',
    'Em Movimento, arraste "adicione 10 a x" e encaixe embaixo do chapéu da tecla.',
    'Clique na bandeira verde e segure a seta. O personagem anda enquanto a tecla estiver pressionada.',
  ],
  laco: [
    'Em Controle, arraste "sempre" ou "repita 10 vezes" para a área do meio.',
    'Repare na boca do bloco: é o vão de dentro. Arraste outro bloco para **dentro** dele, e não para baixo.',
    'Um laço vazio repete o nada — é o que está dentro da boca que faz dele um laço.',
  ],
  condicional: [
    'Em Controle, arraste "se ... então" para a área do meio.',
    'O buraco de seis lados no alto é a pergunta. Arraste para lá um bloco de Sensores (azul-claro) ou de Operadores (verde).',
    'Dentro da boca do "se", ponha o que deve acontecer quando a resposta for sim.',
  ],
  variavel: [
    'Clique na categoria Variáveis, na paleta, e depois no botão "Criar uma Variável".',
    'Dê um nome que diga o que ela guarda: placar, vidas, tempo. Confirme.',
    'Os blocos laranja aparecem só depois disso. Arraste "adicione 1 a [placar]" para somar, ou "mude [placar] para 0" para acertar o valor.',
    'Encaixe o bloco numa pilha que comece por um chapéu — solto na área, ele nunca roda.',
    'Criar a variável não basta: o requisito pede que o valor mude enquanto o jogo acontece.',
  ],
  aparenciaOuSom: [
    'Em Aparência, "próxima fantasia" troca o desenho do personagem.',
    'Em Som, "toque o som ..." toca um som.',
    'Arraste um dos dois para dentro de uma pilha que um evento dispare — a bandeira, uma tecla, ou o clique no ator.',
  ],
  doisPersonagens: [
    'Embaixo do palco fica a lista de atores. Clique no segundo — a maçã.',
    'A área do meio troca junto: cada ator tem os blocos dele, e ela aparece vazia porque o programa da maçã ainda não existe.',
    'Monte ali pelo menos uma pilha começando por um chapéu de Eventos.',
    'Para voltar ao gato, clique nele na mesma lista.',
  ],
  interacao: [
    'Escolha o ator que vai perceber o encontro — o gato serve.',
    'Em Controle, ponha um "se ... então" dentro de um "sempre": sem o laço, a pergunta é feita uma vez só e nunca mais.',
    'Em Sensores, arraste "tocando em [ponteiro do mouse]?" para o buraco de seis lados do "se".',
    'Clique em "ponteiro do mouse" dentro do bloco e escolha o **outro ator** — e não a borda.',
    'Dentro da boca do "se", ponha o que acontece quando os dois se encontram.',
  ],
  placar: [
    'Primeiro o "se": é ele que decide quando o ponto vale.',
    'Em Variáveis, arraste "adicione 1 a [placar]" para **dentro** da boca do "se".',
    'Fora do "se" o placar sobe o tempo todo, e um placar que sobe sozinho não marca nada.',
  ],
  fimDeJogo: [
    'Em Operadores, arraste o bloco verde "[ ] > [50]" — ele pergunta se o primeiro é maior que o segundo.',
    'Em Variáveis, arraste a bolinha laranja com o nome da variável para o lado esquerdo do ">". No direito, escreva o número que encerra o jogo.',
    'Em Controle, ponha um "se ... então" e leve o bloco verde inteiro para o buraco de seis lados dele.',
    'Dentro da boca desse "se", ponha "pare [todos]", ou um "diga" anunciando a vitória.',
  ],
};
