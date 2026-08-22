import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { haVersaoNova } from '../../lib/versao';

/* De quanto em quanto tempo perguntar, com a aba à vista. Quinze minutos é
   barato — a pergunta é um HTML de dois quilobytes — e não deixa ninguém preso
   numa versão velha por uma tarde inteira. */
const INTERVALO_MS = 15 * 60 * 1000;

/**
 * Avisa que saiu uma versão nova, e recarrega quando a pessoa mandar.
 *
 * Sem isso, uma aba aberta roda para sempre o pacote que baixou. Quem trabalha
 * com o aplicativo aberto o dia todo — que é justamente quem mais o usa — só
 * via mudanças por acaso, ao abrir de novo em outro dia.
 *
 * Recarregar sozinho não: a pessoa pode estar no meio de um laboratório, e uma
 * página que se recarrega sem aviso é a experiência que a gente já corrigiu uma
 * vez, quando um deploy apagou um texto de cem palavras. O rascunho local
 * protege o conteúdo (ver useRascunhoLocal), mas o susto continua sendo dela.
 * Aqui a decisão é de quem está usando, e é um clique.
 */
export default function AvisoDeVersao() {
  const [temNova, setTemNova] = useState(false);

  useEffect(() => {
    /* Em desenvolvimento o pacote não tem hash e o servidor recarrega sozinho:
       o aviso só apareceria para dizer bobagem. */
    if (!import.meta.env.PROD) return;

    let vivo = true;
    const conferir = async () => {
      if (!vivo || document.visibilityState !== 'visible') return;
      if (await haVersaoNova()) setTemNova(true);
    };

    conferir();
    const id = setInterval(conferir, INTERVALO_MS);
    /* Voltar para a aba é o momento mais provável de haver algo novo, e o mais
       barato de conferir. */
    document.addEventListener('visibilitychange', conferir);

    return () => {
      vivo = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', conferir);
    };
  }, []);

  if (!temNova) return null;

  return (
    <div
      className="no-print fixed left-1/2 -translate-x-1/2 z-50 card px-4 py-2 flex items-center gap-3 shadow-lg"
      style={{ bottom: '1rem', borderColor: 'var(--color-primary-a40)' }}
      role="status"
    >
      <span className="text-sm" style={{ color: 'var(--color-text-soft)' }}>
        Há uma versão nova do Trilha.Web().
      </span>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary text-sm py-1 px-3 flex items-center gap-1.5 whitespace-nowrap"
      >
        <RefreshCw className="w-4 h-4" /> Atualizar
      </button>
    </div>
  );
}
