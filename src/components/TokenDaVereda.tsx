import { useState } from 'react';
import { Award, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logActivity } from '../lib/progress';
import type { Vereda } from '../curriculum/veredas';
import type { Certification } from '../types';

/*
 * O Token.Web() de uma vereda.
 *
 * A vereda rende certificado como a trilha rende: mesmo documento, mesma
 * verificação pública, mesmo PDF. O clube não tem por que aprender dois
 * documentos — o que muda é o percurso que ele atesta, e é isso que a página
 * pública escreve.
 *
 * A emissão é um botão, e não automática ao vencer a última lição: o pedido
 * atravessa a rede e pode falhar, e uma falha silenciosa no instante da vitória
 * é a pior hora para acontecer. Aqui a pessoa vê o pedido, o erro e o código.
 */
export default function TokenDaVereda({ vereda, userId, certificado, aoEmitir }: {
  vereda: Vereda;
  userId: string;
  /** O que já existe, quando existe — e então não há o que emitir. */
  certificado?: Certification;
  aoEmitir: () => Promise<void> | void;
}) {
  const [emitindo, setEmitindo] = useState(false);
  const [erro, setErro] = useState('');

  if (certificado) {
    return (
      <div className="card p-4 flex items-center gap-3 flex-wrap"
        style={{ borderColor: 'var(--color-secondary-a30)', backgroundColor: 'var(--color-secondary-a03)' }}>
        <Award className="w-8 h-8 flex-none" style={{ color: 'var(--color-secondary)' }} />
        <div className="min-w-0 flex-1">
          <p className="font-bold" style={{ color: 'var(--color-secondary)' }}>Token.Web() emitido</p>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>{certificado.code}</p>
        </div>
        <Link to={`/certificado/${certificado.code}`} className="btn-primary">Ver certificado</Link>
      </div>
    );
  }

  const emitir = async () => {
    setEmitindo(true);
    setErro('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setErro('Sessão expirada. Entre de novo.'); setEmitindo(false); return; }

    try {
      const resposta = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/issue-certification`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            specialtyCode: vereda.code,
            /* Vereda não tem grau: 'basico' é o lado que reivindica menos, e a
               tela pública não imprime nível nenhum para ela. */
            level: 'basico',
            tipo: 'vereda',
            /* A chave interna vai junto por causa de quem concluiu antes da
               renomeação: o evento antigo guarda o código de então. */
            veredaId: vereda.id,
          }),
        },
      );
      const dados = await resposta.json();
      if (!resposta.ok) { setErro(dados.error ?? 'Não foi possível emitir agora.'); return; }
      await logActivity(userId, 'certification_issued',
        { certCode: dados.code, specialtyCode: vereda.code, tipo: 'vereda' },
        undefined, 'certification');
      await aoEmitir();
    } catch {
      setErro('Erro de conexão ao emitir o certificado.');
    } finally {
      setEmitindo(false);
    }
  };

  return (
    <div className="card p-4 space-y-3"
      style={{ borderColor: 'var(--color-success-a20)' }}>
      <div className="flex items-center gap-3">
        <Award className="w-8 h-8 flex-none" style={{ color: 'var(--color-success)' }} />
        <div className="min-w-0">
          <p className="font-bold">Vereda concluída</p>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
            Todas as lições vencidas. O Token.Web() desta vereda se verifica em
            público e sai em PDF, como o de uma trilha.
          </p>
        </div>
      </div>
      {erro && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{erro}</p>}
      <button onClick={emitir} disabled={emitindo} className="btn-accent w-full">
        {emitindo
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Emitindo…</>
          : 'Emitir meu Token.Web()'}
      </button>
    </div>
  );
}
