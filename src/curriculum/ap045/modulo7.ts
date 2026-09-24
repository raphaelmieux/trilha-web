import type { Module } from '../../types';

/*
 * AP045 módulo 7 — o requisito 10: ensinar Computação 1 ou Computação 2 a um
 * grupo de desbravadores.
 *
 * É o requisito mais diferente da trilha: não pede saber um fato, pede
 * transmitir um fato que se já sabe. A plataforma não tem como avaliar a aula
 * em si — quem avalia é quem assiste, ao vivo, fora daqui —, então esta lição
 * segue o mesmo caminho da AP041.4 ("apresentar ao examinador"): dá o que se
 * precisa saber para ensinar bem, e deixa o ensino de verdade acontecer fora
 * da plataforma.
 */

const conteudo_L1 = `
<h2 class="text-xl font-bold mb-3">Saber a matéria e saber ensiná-la são coisas diferentes</h2>
<p class="mb-3">Você já concluiu Computação 4 para chegar até aqui, e
provavelmente lembra bem de Computação 1 e 2. Mas saber uma matéria e conseguir
explicá-la para quem nunca a viu são habilidades diferentes — muita gente que
domina um assunto trava na hora de ensiná-lo. Esta lição é sobre a segunda
parte.</p>

<h3 class="font-bold mt-4 mb-2">Escolha o que ensinar, não tudo</h3>
<p class="mb-3">Computação 1 e Computação 2 têm, juntas, dezenas de
requisitos. Tentar ensinar tudo numa única aula garante que nada fica —
quantidade demais numa aula só é a forma mais comum de perder quem está
ouvindo. Escolha <strong>dois ou três pontos</strong> que você considera mais
importantes ou mais interessantes, e aprofunde neles.</p>

<h3 class="font-bold mt-4 mb-2">Comece pelo exemplo, não pela definição</h3>
<p class="mb-3">Definir "hardware" antes de mostrar um hardware de verdade é
pedir que quem ouve imagine algo abstrato. Funciona melhor ao contrário: mostre
o teclado, pergunte "o que vocês acham que isso faz?", e só depois amarre a
palavra ao que já foi mostrado e discutido. A definição gruda melhor quando
já existe uma imagem concreta para ela pousar.</p>

<h3 class="font-bold mt-4 mb-2">Faça perguntas, não só afirmações</h3>
<p class="mb-3">Uma aula em que só uma pessoa fala, do início ao fim, é fácil
de desligar. Perguntar "por que vocês acham que o computador trava quando fica
cheio de poeira?" antes de explicar faz quem ouve pensar no problema antes de
receber a resposta — e quem pensou no problema lembra melhor da resposta.</p>

<h3 class="font-bold mt-4 mb-2">Confira se entenderam, não se prestaram atenção</h3>
<p class="mb-3">Perguntar "entenderam?" costuma render um "sim" educado, mesmo
quando não entenderam nada — ninguém gosta de admitir, na frente do grupo, que
ficou perdido. Uma forma melhor é pedir que <strong>expliquem de volta</strong>
com as próprias palavras, ou resolvam um exemplo pequeno na hora. Quem consegue
explicar de volta, entendeu de verdade.</p>

<h3 class="font-bold mt-4 mb-2">Prepare o material antes</h3>
<p class="mb-3">Separe com antecedência o que vai mostrar — um computador
aberto, imagens das peças, exemplos do dia a dia do clube. Improvisar na hora,
sem nada em mãos, deixa a explicação mais confusa do que precisa ser.</p>

<div class="p-3 rounded-lg mt-4" style="background: rgba(59,130,246,.12)">
<p class="text-sm"><strong>Cinco passos, numa frase:</strong> escolha pouco,
comece pelo concreto, pergunte antes de responder, confira pedindo para
explicarem de volta, e leve o material pronto.</p>
</div>
`;

export const modulo7: Module = {
  code: 'AP045.7',
  title: 'Ensinar o que você sabe',
  description: 'Cinco ideias simples para uma aula que gruda, na hora de ensinar Computação 1 ou 2 a um grupo de desbravadores.',
  lessons: [
    {
      code: 'AP045.7-L1',
      title: 'Saber a matéria e saber ensiná-la são coisas diferentes',
      type: 'theory',
      content: conteudo_L1,
      requirementCodes: ['AP045-10.1'],
      questions: [
        {
          id: 'AP045.7-L1-Q1', type: 'multiple_choice',
          prompt: 'Por que tentar ensinar todos os requisitos de Computação 1 e 2 numa única aula costuma dar errado?',
          data: { options: [
            { id: 'a', text: 'Porque quantidade demais numa aula só é a forma mais comum de fazer o grupo não reter nada.', correct: true },
            { id: 'b', text: 'Porque o documento oficial proíbe explicitamente ensinar mais de um requisito por vez.',
              porque: 'Não há essa proibição no documento — o problema é pedagógico: tentar cobrir tudo de uma vez costuma fazer nada ficar.' },
            { id: 'c', text: 'Porque Computação 1 e 2 têm conteúdo secreto que não pode ser ensinado por outro desbravador.',
              porque: 'Não há conteúdo secreto — qualquer desbravador que domine a matéria pode ensiná-la a outro.' },
            { id: 'd', text: 'Porque cada requisito precisa de uma aula inteira separada, por lei do clube.',
              porque: 'Não existe essa regra; a recomendação é sobre foco pedagógico, não sobre uma exigência formal por requisito.' },
          ]},
          explanation: 'Escolher dois ou três pontos e aprofundar neles costuma render mais aprendizado do que tentar cobrir tudo superficialmente.',
        },
        {
          id: 'AP045.7-L1-Q2', type: 'multiple_choice',
          prompt: 'Por que é melhor mostrar um teclado de verdade antes de definir a palavra "hardware", em vez do contrário?',
          data: { options: [
            { id: 'a', text: 'Porque a definição gruda melhor quando já existe algo concreto para ela se referir.', correct: true },
            { id: 'b', text: 'Porque a definição formal de "hardware" está errada e precisa ser corrigida antes de ensinar.',
              porque: 'A definição não está errada — a questão é a ordem em que se apresenta o exemplo e a definição, não o conteúdo da definição.' },
            { id: 'c', text: 'Porque mostrar objetos é obrigatório em qualquer aula, segundo o requisito oficial.',
              porque: 'Não há essa obrigação no documento oficial — é uma boa prática de ensino, não uma exigência formal.' },
            { id: 'd', text: 'Porque definições só podem ser ensinadas depois de toda a trilha ter sido concluída.',
              porque: 'Isso não tem relação com a ordem de exemplo e definição dentro de uma única aula.' },
          ]},
          explanation: 'Uma imagem concreta na cabeça de quem ouve dá onde a definição abstrata pode se apoiar depois.',
        },
        {
          id: 'AP045.7-L1-Q3', type: 'multiple_choice',
          prompt: 'Por que perguntar "entenderam?" costuma não revelar se o grupo entendeu de verdade?',
          data: { options: [
            { id: 'a', text: 'Porque muita gente responde "sim" por educação, mesmo sem ter entendido, para não admitir isso na frente dos outros.', correct: true },
            { id: 'b', text: 'Porque essa pergunta é proibida durante as aulas dos Desbravadores.',
              porque: 'Não há proibição — o problema é que a resposta a essa pergunta costuma não refletir o entendimento real.' },
            { id: 'c', text: 'Porque somente quem já concluiu a especialidade de Computação 4 consegue responder essa pergunta com total sinceridade.',
              porque: 'Isso não tem relação com o problema descrito: o problema é a tendência de responder "sim" por educação, independente de quem responde.' },
            { id: 'd', text: 'Porque essa pergunta só funciona bem em grupos com mais de dez pessoas ao mesmo tempo.',
              porque: 'O tamanho do grupo não é o que está em jogo — é o constrangimento de admitir que não entendeu, na frente de qualquer grupo.' },
          ]},
          explanation: 'Pedir que expliquem de volta com as próprias palavras revela o entendimento de verdade, sem depender de um "sim" educado.',
        },
        {
          id: 'AP045.7-L1-Q4', type: 'true_false',
          prompt: 'Fazer uma pergunta antes de explicar um conceito ajuda o grupo a lembrar melhor da resposta depois.',
          data: { options: [
            { id: 'a', text: 'Verdadeiro', correct: true },
            { id: 'b', text: 'Falso', porque: 'É verdadeiro: quem pensa no problema antes de ouvir a resposta costuma lembrar melhor dela do que quem só recebe a explicação pronta.' },
          ]},
          explanation: 'Perguntar antes de responder engaja quem ouve com o problema, e não só com a solução pronta.',
        },
        {
          id: 'AP045.7-L1-Q5', type: 'ordering',
          prompt: 'Ordene os cinco passos sugeridos para uma aula que gruda.',
          data: { items: [
            { id: 'a', text: 'Escolher dois ou três pontos, em vez de tentar ensinar tudo', order: 1 },
            { id: 'b', text: 'Mostrar um exemplo concreto antes de dar a definição', order: 2 },
            { id: 'c', text: 'Fazer uma pergunta ao grupo antes de responder', order: 3 },
            { id: 'd', text: 'Pedir que expliquem de volta, para conferir se entenderam de verdade', order: 4 },
          ]},
          explanation: 'Escolher, mostrar, perguntar, conferir — nessa ordem, cada passo prepara o seguinte.',
        },
        {
          id: 'AP045.7-L1-Q6', type: 'scenario',
          prompt: 'Um desbravador vai ensinar Computação 2 ao grupo, e tem só trinta minutos. Qual é a melhor forma de usar esse tempo, segundo o que a lição ensina?',
          data: { scenarios: [
            { id: 'a', text: 'Escolher dois ou três pontos mais importantes de Computação 2 e aprofundar neles, com exemplos e perguntas.', correct: true },
            { id: 'b', text: 'Tentar passar por todos os requisitos de Computação 2 rapidamente, um após o outro.',
              porque: 'Tentar cobrir tudo numa aula curta é justamente o que a lição desaconselha — o resultado costuma ser nada ficar de verdade.' },
            { id: 'c', text: 'Ler em voz alta todas as definições oficiais dos termos de Computação 2, sem mostrar nenhum exemplo concreto.',
              porque: 'Definição sem exemplo concreto é mais difícil de reter — a lição recomenda o caminho contrário: exemplo primeiro.' },
            { id: 'd', text: 'Cancelar a aula, porque trinta minutos são poucos para ensinar qualquer coisa.',
              porque: 'Trinta minutos são suficientes para ensinar bem dois ou três pontos escolhidos — o problema seria tentar ensinar tudo nesse tempo.' },
          ]},
          explanation: 'Pouco tempo pede foco, não pressa: dois ou três pontos bem explicados valem mais do que dez pontos apressados.',
        },
      ],
    },
  ],
};
