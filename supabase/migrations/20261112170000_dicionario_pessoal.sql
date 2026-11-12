-- O dicionário pessoal de cada pessoa: as palavras que ela mandou o corretor
-- aceitar com "Adicionar ao Dicionário", em qualquer simulação da plataforma.
--
-- É da pessoa e só dela, como o dicionário personalizado do Word é de quem o
-- usa: nada aqui é compartilhado entre contas. As palavras que todo mundo
-- precisa — as dos documentos que a plataforma entrega — continuam no código,
-- em PALAVRAS_DO_CLUBE, e não passam por esta tabela.
--
-- Mora no banco, e não só no navegador, porque o desbravador estuda metade no
-- celular e metade no computador do clube: a palavra acrescentada num aparelho
-- tem de deixar de ser sublinhada no outro. E o computador do clube é de todo
-- mundo — guardar só no navegador dele daria a palavra de um à próxima pessoa
-- que sentasse ali.
--
-- A tela que lê isto sai num push seguinte, que é a ordem que o CLAUDE.md pede:
-- o schema antes da tela.

CREATE TABLE IF NOT EXISTS dicionario_pessoal (
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES user_profiles(id) ON DELETE CASCADE,
  palavra text NOT NULL,
  criada_em timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, palavra),
  -- Uma palavra, e não um texto: o corretor só pergunta por palavras, e um
  -- campo sem teto seria um depósito de qualquer coisa numa tabela que todo
  -- carregamento do corretor lê inteira.
  CONSTRAINT dicionario_pessoal_palavra_curta CHECK (char_length(palavra) BETWEEN 1 AND 64),
  CONSTRAINT dicionario_pessoal_palavra_sem_espaco CHECK (palavra !~ '\s')
);

ALTER TABLE dicionario_pessoal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_dicionario" ON dicionario_pessoal;
CREATE POLICY "select_own_dicionario" ON dicionario_pessoal
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_dicionario" ON dicionario_pessoal;
CREATE POLICY "insert_own_dicionario" ON dicionario_pessoal
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Tirar uma palavra é o "Remover" da lista do dicionário personalizado do Word:
-- quem adicionou "acampamneto" por engano precisa de volta o sublinhado.
DROP POLICY IF EXISTS "delete_own_dicionario" ON dicionario_pessoal;
CREATE POLICY "delete_own_dicionario" ON dicionario_pessoal
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
