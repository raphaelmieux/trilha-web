import { useState, useSyncExternalStore } from 'react';
import { SpellCheck, Plus, X } from 'lucide-react';
import {
  TAMANHO_MAXIMO_DA_PALAVRA, acrescentarAoDicionario, ouvirDicionario, palavraValida,
  palavrasDoDicionario, tirarDoDicionario,
} from '../lib/dicionarioPessoal';

/*
  O dicionário pessoal, à vista: o que a pessoa já mandou o corretor aceitar.

  "Adicionar ao Dicionário" é um clique no meio de um documento, e o clique
  errado acontece — em cima de "acampamneto", por pressa. Sem lugar para ver a
  lista, a palavra errada passava a ser aceita para sempre, em toda simulação,
  sem nada dizendo por quê. É a lista do dicionário personalizado do Word, em
  Opções › Revisão de Texto, e mora no perfil porque é da pessoa, e não de um
  programa.

  Ela lê e ouve o mesmo módulo que o corretor: tirar uma palavra aqui devolve o
  vermelho à folha que estiver aberta noutra guia da mesma página, e o que se
  acrescenta aqui vale no primeiro documento que abrir. Uma lista copiada para
  dentro do componente seria a segunda fonte de sempre, e o perfil mostraria
  palavras que o corretor já esqueceu.
*/

const lerPalavras = () => palavrasDoDicionario();

export default function MeuDicionario() {
  const palavras = useSyncExternalStore(ouvirDicionario, lerPalavras, lerPalavras);
  const [nova, setNova] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);

  const ordenadas = [...palavras].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const acrescentar = () => {
    const palavra = nova.trim();
    if (!palavra) return;
    if (!palavraValida(palavra)) {
      /* A regra é a da tabela no banco: aceitar aqui o que ela recusa faria a
         palavra valer neste aparelho e sumir no próximo, calada. */
      setAviso(`Uma palavra por vez, sem espaço, com até ${TAMANHO_MAXIMO_DA_PALAVRA} letras.`);
      return;
    }
    if (palavras.has(palavra)) {
      setAviso(`"${palavra}" já está no seu dicionário.`);
      return;
    }
    acrescentarAoDicionario(palavra);
    setNova('');
    setAviso(null);
  };

  return (
    <div className="card p-6">
      <h2 className="font-bold mb-2 flex items-center gap-2">
        <SpellCheck className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Meu Dicionário
      </h2>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
        As palavras que você mandou o corretor aceitar com <strong style={{ color: 'var(--color-text)' }}>Adicionar
        ao Dicionário</strong>. Elas deixam de ficar sublinhadas de vermelho em todos os programas da plataforma, e
        valem em qualquer aparelho em que você entrar.
      </p>

      {ordenadas.length === 0 ? (
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-dim)' }}>
          Nenhuma palavra ainda. Quando o corretor sublinhar um nome ou um termo do clube que está certo, clique com o
          botão direito em cima dele e escolha Adicionar ao Dicionário.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2 mb-4" aria-label="Palavras do seu dicionário">
          {ordenadas.map(p => (
            <li key={p} className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-sm"
              style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              {p}
              <button type="button" onClick={() => tirarDoDicionario(p)}
                className="w-6 h-6 rounded-full flex items-center justify-center transition hover:opacity-80"
                style={{ color: 'var(--color-text-dim)' }}
                aria-label={`Tirar "${p}" do dicionário`} title="Tirar do dicionário">
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="flex gap-2" onSubmit={ev => { ev.preventDefault(); acrescentar(); }}>
        <input value={nova} onChange={ev => { setNova(ev.target.value); setAviso(null); }}
          className="input-field flex-1" placeholder="Acrescentar uma palavra" aria-label="Palavra a acrescentar"
          maxLength={TAMANHO_MAXIMO_DA_PALAVRA + 10} />
        <button type="submit" className="btn-secondary" disabled={!nova.trim()}>
          <Plus className="w-4 h-4 mr-1" /> Acrescentar
        </button>
      </form>
      {aviso && <p className="text-sm mt-2" role="status" style={{ color: 'var(--color-secondary)' }}>{aviso}</p>}
    </div>
  );
}
