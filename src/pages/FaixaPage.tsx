import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBadges } from '../hooks/useBadges';
import { useCertifications } from '../hooks/useCertifications';
import { useMontado } from '../hooks/useMontado';
import Faixa from '../components/faixa/Faixa';
import CertificadoNaParede from '../components/faixa/CertificadoNaParede';
import ExplicacaoDaInsignia from '../components/ui/ExplicacaoDaInsignia';
import { LoadingState } from '../components/ui/PageState';
import { gruposDaFaixa } from '../lib/faixa/catalogoDaFaixa';
import { empacotarFaixa, type PecaPosta } from '../lib/faixa/empacotarFaixa';
import { certificadoDaPeca, estadoDaPeca } from '../lib/faixa/estadoDaFaixa';
import { EDICAO_ANTIGA } from '../lib/escadasDeInsignia';
import { supabase } from '../lib/supabase';

/*
  A Faixa: a página das conquistas e dos Token.Web().

  A Estante listava as insígnias em fileiras; a Faixa as prende num tecido,
  como a faixa de especialidades dos Desbravadores — patches das trilhas,
  buttons das veredas, pins das escadas e das curiosidades. Todo lugar existe
  desde o primeiro dia, as anunciadas inclusive, e vai se enchendo: a largura
  é o que há para fazer.
*/

const ME006 = 'ME006';
const INSIGNIA_DO_ME006 = 'mestrado_me006';

export default function FaixaPage() {
  const { profile } = useAuth();
  const { badges, loading } = useBadges(profile?.id);
  const { certifications, loading: carregandoCerts, refresh } = useCertifications(profile?.id);
  const [aberta, setAberta] = useState<PecaPosta | null>(null);

  const conquistadas = useMemo(() => new Set(badges.map(b => b.code)), [badges]);
  const comEdicaoAntiga = EDICAO_ANTIGA.some(x => conquistadas.has(x.code));
  /* O empacotamento não depende de quem olha — só da edição antiga, que vai
     no fim —, então ele se refaz apenas quando ela aparece. */
  const faixa = useMemo(() => empacotarFaixa(gruposDaFaixa({ comEdicaoAntiga })), [comEdicaoAntiga]);
  const estado = useCallback((p: PecaPosta) => estadoDaPeca(p, conquistadas, certifications), [conquistadas, certifications]);

  const total = faixa.pecas.filter(p => p.zona !== 'antiga').length;
  const acesas = faixa.pecas.filter(p => p.zona !== 'antiga' && estado(p) !== 'vazia').length;

  useEmissaoDoMe006(profile?.id, conquistadas.has(INSIGNIA_DO_ME006), certifications.filter(c => c.curriculum_code === ME006).length > 0,
    carregandoCerts, refresh);

  if (loading) return <LoadingState label="Abrindo a faixa..." />;

  const cert = aberta ? certificadoDaPeca(aberta, certifications) : undefined;
  const insignia = aberta && !cert ? badges.find(b => b.code === aberta.insignia) : undefined;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Minha Faixa</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-dim)' }}>
          <span className="font-bold" style={{ color: 'var(--color-text)' }}>{acesas}</span> de {total} peças.
          {' '}Cada trilha, vereda e conquista já tem o seu lugar; toque numa peça acesa para ver o que ela rendeu.
        </p>
      </div>

      <Faixa faixa={faixa} estado={estado} aoAbrir={setAberta} />

      {aberta && cert && (
        <CertificadoNaParede
          cert={cert}
          nome={profile?.display_name ?? ''}
          titulo={aberta.nome}
          legenda={aberta.material === 'button' ? 'Vereda percorrida até o fim'
            : aberta.token === ME006 ? 'Sete trilhas da lista oficial concluídas aqui' : 'Trilha concluída'}
          aoFechar={() => setAberta(null)}
        />
      )}
      {aberta && insignia && <ExplicacaoDaInsignia insignia={insignia} aoFechar={() => setAberta(null)} />}
    </div>
  );
}

/*
  O Token.Web() do ME006 sai sozinho, como o da vereda.

  O Mestrado se alcança sem tela própria — é a sétima trilha da lista que o
  fecha —, então quem o pede é a Faixa, no instante em que a insígnia dele
  aparece e o documento ainda não existe. As duas guardas de `TokenDaVereda`
  valem aqui pelo mesmo motivo: uma tentativa por montagem, porque duas ao
  mesmo tempo passariam as duas pela conferência do servidor; e documento de
  qualquer estado conta como existente, porque emitir de novo por cima de um
  revogado desfaria a revogação da liderança.
*/
function useEmissaoDoMe006(
  userId: string | undefined,
  alcancou: boolean,
  temDocumento: boolean,
  carregando: boolean,
  aoEmitir: () => Promise<void>,
) {
  const pedido = useRef(false);
  const montado = useMontado();
  useEffect(() => {
    if (!userId || !alcancou || temDocumento || carregando || pedido.current) return;
    pedido.current = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !montado.current) return;
      try {
        const resposta = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/issue-certification`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          /* O Mestrado não tem grau: 'basico' é o lado que reivindica menos, e
             a página pública escreve "Mestrado" no lugar do nível. */
          body: JSON.stringify({ userId, specialtyCode: ME006, level: 'basico', tipo: 'mestrado' }),
        });
        if (resposta.ok && montado.current) await aoEmitir();
      } catch {
        /* Sem rede, a próxima visita à Faixa tenta de novo: a peça já está
           acesa pela insígnia, e o documento chega quando a conexão voltar. */
      }
    })();
  }, [userId, alcancou, temDocumento, carregando, aoEmitir, montado]);
}
