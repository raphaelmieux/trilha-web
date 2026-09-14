import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  EVENTOS_DA_OFENSIVA, diasDeAtividade, ofensivaCorrente, melhorOfensiva,
} from '../lib/ofensiva';

/*
  Até onde olhar para trás.

  A ofensiva corrente nunca precisa de mais do que o tamanho dela, e ninguém
  sabe esse tamanho antes de contar — então se busca uma janela. Um ano e pouco
  é mais do que a plataforma inteira tem de vida, e mantém a consulta pequena
  num aparelho de clube.

  Ofensiva mais longa do que a janela sairia **menor** do que é, e nunca maior:
  é o lado que reivindica menos, que é para onde tudo aqui erra de propósito.
*/
const DIAS_DE_JANELA = 400;

/*
  E um teto de linhas, pelo mesmo motivo e na mesma direção.

  Uma lição de três requisitos grava três eventos, então dias cheios rendem
  muitas linhas — mas são só carimbos de tempo. Com a ordem decrescente, o
  corte cai no passado distante, que é de novo o lado que encolhe a conta em
  vez de inflá-la.
*/
const TETO_DE_EVENTOS = 5000;

/**
 * A ofensiva de quem está olhando a tela.
 *
 * Ela é **calculada na leitura**, e não lida de uma coluna. `streak_days`
 * vivia em `enrollments`, era escrita na hora da atividade, e número guardado
 * só muda quando alguém o muda: quem parava de estudar continuava vendo a
 * ofensiva do último dia em que estudou, indefinidamente. Era esse o "2 dias"
 * que não saía do lugar.
 *
 * Calculando aqui, parar de estudar zera sozinho — sem job noturno, que não
 * teria onde rodar: o frontend é estático e não há agendador neste Supabase.
 */
export function useOfensiva(userId: string | undefined) {
  const [ofensiva, setOfensiva] = useState(0);
  const [melhor, setMelhor] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    /* A consulta pode voltar depois de a tela sair. Escrever estado em
       componente desmontado é desperdício no navegador e erro num ambiente já
       desmontado — ver `useMontado`, que conta a história inteira. */
    let vivo = true;
    (async () => {
      const desde = new Date(Date.now() - DIAS_DE_JANELA * 86_400_000).toISOString();
      /* Só `created_at` e `event_type`: o que a conta precisa é a data, e o
         resto da linha — metadata inclusive — seria peso de rede à toa. */
      const { data } = await supabase
        .from('activity_events')
        .select('event_type, created_at')
        .eq('user_id', userId)
        .in('event_type', [...EVENTOS_DA_OFENSIVA])
        .gte('created_at', desde)
        .order('created_at', { ascending: false })
        .limit(TETO_DE_EVENTOS);
      if (!vivo) return;

      const dias = diasDeAtividade(data ?? []);
      setOfensiva(ofensivaCorrente(dias));
      setMelhor(melhorOfensiva(dias));
      setLoading(false);
    })();
    return () => { vivo = false; };
  }, [userId]);

  return { ofensiva, melhor, loading };
}
