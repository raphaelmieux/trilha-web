import { useState } from 'react';
import { GripVertical } from 'lucide-react';
import type { Question } from '../../types';
import { sequenciaCorreta } from '../../lib/questoes';
import { shuffleArray } from '../../lib/progress';

interface QuestionProps {
  question: Question;
  answer: any;
  showFeedback: boolean;
  onAnswer: (answer: any) => void;
}

export default function QuestionRenderer({ question, answer, showFeedback, onAnswer }: QuestionProps) {
  switch (question.type) {
    case 'multiple_choice':
    case 'true_false':
    case 'scenario':
      return <OptionsQuestion question={question} answer={answer} showFeedback={showFeedback} onAnswer={onAnswer} />;
    case 'ordering':
      return <OrderingQuestion question={question} answer={answer} showFeedback={showFeedback} onAnswer={onAnswer} />;
    case 'fill_blank':
      return <FillBlankQuestion question={question} answer={answer} showFeedback={showFeedback} onAnswer={onAnswer} />;
    case 'matching':
      return <MatchingQuestion question={question} answer={answer} showFeedback={showFeedback} onAnswer={onAnswer} />;
    default:
      return null;
  }
}

function ConfirmButton({ onConfirm, disabled, showFeedback }: { onConfirm: () => void; disabled: boolean; showFeedback: boolean }) {
  if (showFeedback) return null;
  return (
    <button onClick={onConfirm} disabled={disabled} className="btn-primary mt-4 text-sm">
      {disabled ? 'Preencha todos os campos' : 'Confirmar Resposta'}
    </button>
  );
}

function OptionsQuestion({ question, answer, showFeedback, onAnswer }: QuestionProps) {
  const opts = question.data.options || question.data.scenarios || [];
  return (
    <div>
      {opts.map((opt: { id: string; text: string; correct?: boolean }) => {
        const selected = answer === opt.id;
        const isCorrect = opt.correct;
        const showCorrect = showFeedback && isCorrect;
        const showWrong = showFeedback && selected && !isCorrect;
        return (
          <button
            key={opt.id}
            onClick={() => !showFeedback && onAnswer(opt.id)}
            disabled={showFeedback}
            className={`w-full text-left p-3 rounded-lg border-2 transition mb-2 ${
              showCorrect ? 'border-[var(--color-success)] bg-[var(--color-success-a10)]' :
              showWrong ? 'border-[var(--color-primary)] bg-[var(--color-primary-a10)]' :
              selected ? 'border-[var(--color-primary)] bg-[var(--color-primary-a10)]' :
              'border-[var(--color-border)] hover:border-[var(--color-primary-a40)]'
            } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {opt.text}
          </button>
        );
      })}
    </div>
  );
}

/*
 * A questão de ordenar: arrastar para o lugar, ou as setas.
 *
 * Toda questão do tipo `ordering` passa por aqui, em lição e em prova — não há
 * uma segunda tela desenhando esse tipo. Quem escrever uma questão de ordenar
 * nova só precisa dos itens e do campo `order`; a forma de mexer neles é esta, e
 * é a mesma em toda a plataforma.
 *
 * Arrastar é o gesto que a pessoa já conhece de outras listas, e é o caminho
 * principal no computador. As setas continuam porque arrastar não funciona em
 * tela de toque — o evento de arrastar do HTML não existe no celular — e boa
 * parte dos desbravadores abre isto pelo telefone. Nenhuma questão pode depender
 * de um dos dois.
 */
function OrderingQuestion({ question, answer, showFeedback, onAnswer }: QuestionProps) {
  const items = question.data.items || [];
  const certa = sequenciaCorreta(items);
  /* `items` já vem embaralhado de embaralharQuestao, então começar por ele é
     começar por uma ordem qualquer — que é o ponto de partida da tarefa. */
  const [ordered, setOrdered] = useState<string[]>(() => Array.isArray(answer) && answer.length === items.length ? answer : items.map(i => i.id));
  const [confirmed, setConfirmed] = useState(false);
  const [arrastando, setArrastando] = useState<string | null>(null);

  const isLocked = showFeedback || confirmed;

  const move = (id: string, dir: 'up' | 'down') => {
    if (isLocked) return;
    const arr = [...ordered];
    const idx = arr.indexOf(id);
    if (dir === 'up' && idx > 0) { [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]; }
    if (dir === 'down' && idx < arr.length - 1) { [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]; }
    setOrdered(arr);
    setConfirmed(false);
  };

  /*
    Reordena enquanto o item passa por cima, e não só ao soltar.
    A lista acompanha o dedo, então dá para ver onde a peça vai cair antes de
    largá-la — soltar às cegas e conferir depois é o que torna arrastar ruim.
  */
  const passarSobre = (idAlvo: string) => {
    if (isLocked || !arrastando || arrastando === idAlvo) return;
    setOrdered(atual => {
      const arr = [...atual];
      const de = arr.indexOf(arrastando);
      const para = arr.indexOf(idAlvo);
      if (de < 0 || para < 0) return atual;
      arr.splice(para, 0, ...arr.splice(de, 1));
      return arr;
    });
    setConfirmed(false);
  };

  const confirm = () => {
    onAnswer(ordered);
    setConfirmed(true);
  };

  return (
    <div>
      <div className="space-y-2">
        {ordered.map((id, idx) => {
          const item = items.find(i => i.id === id)!;
          /* Pelo `order` do item, não pela posição dele no array: os itens
             chegam embaralhados, e a leitura antiga marcaria de vermelho
             justamente quem acertou. */
          const correctIdx = certa[idx] === id;
          const sendoArrastado = arrastando === id;
          return (
            <div
              key={id}
              draggable={!isLocked}
              onDragStart={() => setArrastando(id)}
              onDragEnd={() => setArrastando(null)}
              onDragOver={e => { e.preventDefault(); passarSobre(id); }}
              onDrop={e => { e.preventDefault(); setArrastando(null); }}
              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition ${
                showFeedback ? (correctIdx ? 'border-[var(--color-success)] bg-[var(--color-success-a10)]' : 'border-[var(--color-primary)] bg-[var(--color-primary-a10)]') : 'border-[var(--color-border)]'
              }`}
              style={{
                opacity: sendoArrastado ? 0.5 : 1,
                cursor: isLocked ? 'default' : 'grab',
              }}
            >
              {!isLocked && (
                <GripVertical
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: 'var(--color-text-faint)' }}
                  aria-hidden="true"
                />
              )}
              <span className="font-bold" style={{ color: 'var(--color-text-muted)' }}>{idx + 1}.</span>
              <span className="flex-1">{item.text}</span>
              <button onClick={() => move(id, 'up')} disabled={idx === 0 || isLocked}
                className="btn-secondary px-2 py-1 text-sm" aria-label="Subir um lugar">↑</button>
              <button onClick={() => move(id, 'down')} disabled={idx === ordered.length - 1 || isLocked}
                className="btn-secondary px-2 py-1 text-sm" aria-label="Descer um lugar">↓</button>
            </div>
          );
        })}
      </div>
      {!isLocked && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-faint)' }}>
          Arraste para trocar de lugar, ou use as setas.
        </p>
      )}
      <ConfirmButton onConfirm={confirm} disabled={false} showFeedback={isLocked} />
    </div>
  );
}

function FillBlankQuestion({ question, answer, showFeedback, onAnswer }: QuestionProps) {
  const blanks = question.data.blanks || [];
  const [values, setValues] = useState<string[]>(answer || blanks.map(() => ''));
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (idx: number, val: string) => {
    const newVals = [...values];
    newVals[idx] = val;
    setValues(newVals);
    setConfirmed(false);
  };

  const confirm = () => {
    onAnswer(values);
    setConfirmed(true);
  };

  const isLocked = showFeedback || confirmed;
  const allFilled = values.every(v => v.trim() !== '');

  return (
    <div>
      <div className="space-y-3">
        {blanks.map((blank: any, idx: number) => {
          const isCorrect = showFeedback && (values[idx] || '').trim().toLowerCase() === blank.answer.trim().toLowerCase();
          const isWrong = showFeedback && !isCorrect;
          return (
            <div key={blank.id}>
              <label className="text-sm mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
                Lacuna {idx + 1}: <span className="italic" style={{ color: 'var(--color-text-dim)' }}>{blank.hint}</span>
              </label>
              <input
                type="text"
                value={values[idx] || ''}
                onChange={e => handleChange(idx, e.target.value)}
                disabled={isLocked}
                className={`input-field ${isCorrect ? 'border-[var(--color-success)] bg-[var(--color-success-a10)]' : isWrong ? 'border-[var(--color-primary)] bg-[var(--color-primary-a10)]' : ''}`}
              />
              {showFeedback && isWrong && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-success)' }}>Resposta correta: {blank.answer}</p>
              )}
            </div>
          );
        })}
      </div>
      <ConfirmButton onConfirm={confirm} disabled={!allFilled} showFeedback={isLocked} />
    </div>
  );
}

function MatchingQuestion({ question, answer, showFeedback, onAnswer }: QuestionProps) {
  const pairs = question.data.pairs || [];
  /* `sort(() => Math.random() - 0.5)` não embaralha por igual: o comparador é
     incoerente, e a ordem resultante fica presa perto da original em boa parte
     dos sorteios. Numa questão de ligar, isso é a resposta parcialmente
     entregue. shuffleArray é Fisher-Yates, e já existia ao lado. */
  const [shuffledRights] = useState(() => shuffleArray(pairs.map(p => p.right)));
  const [matches, setMatches] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (Array.isArray(answer)) answer.forEach((a: any) => { if (a.right) init[a.left] = a.right; });
    return init;
  });
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (left: string, right: string) => {
    const newMatches = { ...matches, [left]: right };
    setMatches(newMatches);
    setConfirmed(false);
  };

  const confirm = () => {
    onAnswer(pairs.map(p => ({ left: p.left, right: matches[p.left] || '' })));
    setConfirmed(true);
  };

  const isLocked = showFeedback || confirmed;
  const allSelected = pairs.every(p => matches[p.left]);

  return (
    <div>
      <div className="space-y-3">
        {pairs.map((pair: any) => {
          const correctRight = pair.right;
          const selectedRight = matches[pair.left];
          const isCorrect = showFeedback && selectedRight === correctRight;
          const isWrong = showFeedback && selectedRight !== correctRight;
          return (
            <div key={pair.left} className="flex items-center gap-2">
              <span className="flex-1 p-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text)' }}>{pair.left}</span>
              <span style={{ color: 'var(--color-text-dim)' }}>→</span>
              <select
                value={selectedRight || ''}
                onChange={e => handleChange(pair.left, e.target.value)}
                disabled={isLocked}
                className={`input-field flex-1 ${isCorrect ? 'border-[var(--color-success)] bg-[var(--color-success-a10)]' : isWrong ? 'border-[var(--color-primary)] bg-[var(--color-primary-a10)]' : ''}`}
              >
                <option value="">Selecione...</option>
                {shuffledRights.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {showFeedback && isWrong && (
                <span className="text-xs whitespace-nowrap" style={{ color: 'var(--color-success)' }}>→ {correctRight}</span>
              )}
            </div>
          );
        })}
      </div>
      <ConfirmButton onConfirm={confirm} disabled={!allSelected} showFeedback={isLocked} />
    </div>
  );
}
