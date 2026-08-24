import { ehListaDePares, ehListaDeTextos } from '../types';
import type { Question, RespostaDaQuestao } from '../types';
import { respostaConfere } from './respostaTexto';
import { sequenciaCorreta } from './questoes';

export function checkAnswer(question: Question, answer: RespostaDaQuestao | null | undefined): boolean {
  if (!answer) return false;
  switch (question.type) {
    case 'multiple_choice':
    case 'true_false': {
      const correctOption = question.data.options?.find(o => o.correct);
      return answer === correctOption?.id;
    }
    case 'scenario': {
      const correctScenario = question.data.scenarios?.find(s => s.correct);
      return answer === correctScenario?.id;
    }
    case 'matching': {
      const pairs = question.data.pairs || [];
      if (!ehListaDePares(answer) || answer.length !== pairs.length) return false;
      return answer.every((a, i) => a.left === pairs[i].left && a.right === pairs[i].right);
    }
    case 'ordering': {
      const items = question.data.items || [];
      if (!ehListaDeTextos(answer) || answer.length !== items.length) return false;
      /* Pelo campo `order`, e não pela posição no array: os itens chegam aqui
         embaralhados, e comparar com `items[i]` reprovaria a resposta certa.
         Ver questoes.ts — enquanto nada embaralhava, as duas leituras davam no
         mesmo, e era isso que entregava a resposta pronta na tela. */
      const correta = sequenciaCorreta(items);
      return answer.every((id, i) => correta[i] === id);
    }
    case 'fill_blank': {
      const blanks = question.data.blanks || [];
      if (!ehListaDeTextos(answer) || answer.length !== blanks.length) return false;
      /* Igualdade exata reprovava quem sabia a matéria e escrevia "roteadores"
         em vez de "roteador". Ver respostaTexto.ts para as três camadas. */
      return answer.every((a, i) =>
        respostaConfere(a, blanks[i].answer, blanks[i].aceitas)
      );
    }
    default:
      return false;
  }
}
