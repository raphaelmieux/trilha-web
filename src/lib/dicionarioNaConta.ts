import { supabase } from './supabase';
import type { FonteDaConta } from './dicionarioPessoal';

/*
  A tabela `dicionario_pessoal` como fonte do dicionário pessoal.

  Não pede `user_id` em lugar nenhum, e é de propósito: a coluna nasce de
  `auth.uid()` e a RLS só deixa ler, gravar e apagar as linhas de quem pergunta.
  Mandar o id daqui seria confiar no navegador para dizer de quem é a palavra.
*/

/** Chave primária repetida: a palavra já estava lá, que é o resultado pedido. */
const JA_EXISTE = '23505';

export const fonteDaConta: FonteDaConta = {
  async ler() {
    const { data, error } = await supabase.from('dicionario_pessoal').select('palavra');
    if (error) throw error;
    return data.map(l => l.palavra);
  },
  async gravar(palavra) {
    const { error } = await supabase.from('dicionario_pessoal').insert({ palavra });
    if (error && error.code !== JA_EXISTE) throw error;
  },
  async apagar(palavra) {
    const { error } = await supabase.from('dicionario_pessoal').delete().eq('palavra', palavra);
    if (error) throw error;
  },
};
