import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Certification } from '../types';

// A user has at most two active certifications (fundamental, advanced), so fetching
// all of them once and filtering client-side (via getByLevel) is simpler than a
// second "single cert by level" query — replaces that duplicated query in
// SpecialtyPage and FinalExam as well as the "all certs" query in Dashboard/Report.
export function useCertifications(userId: string | undefined) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase.from('certifications').select('*').eq('user_id', userId);
    setCertifications((data as Certification[]) || []);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [userId, refresh]);

  /*
    Pelo código da especialidade, e não pelo grau.

    Enquanto havia duas trilhas, "fundamental" e "advanced" funcionavam como
    identificadores por acidente: uma de cada. Com uma terceira, dois
    certificados passariam a dividir o mesmo grau, e quem tivesse os dois veria
    o primeiro que a busca encontrasse — o certificado de uma trilha exibido
    como se fosse de outra, sem erro visível em lugar nenhum.

    curriculum_code já existe na tabela e é único por trilha. `level` volta a
    ser o que o nome diz: a descrição do grau, não a chave.
  */
  const getByCurriculum = useCallback(
    (curriculumCode: string) =>
      certifications.find(c => c.curriculum_code === curriculumCode && c.status === 'active'),
    [certifications]
  );

  return { certifications, loading, refresh, getByCurriculum };
}
