import { useCallback, useEffect, useRef, useState } from 'react';
import { Award, Loader2, RotateCw, ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
 * ── Emite sozinho, e antes era um botão ──────────────────────────────────
 * A trilha emite sozinha: passar da prova final grava o certificado sem
 * ninguém pedir. A vereda pedia um clique, e a razão de então era que o pedido
 * atravessa a rede e pode falhar — falhar em silêncio no instante da vitória é
 * a pior hora.
 *
 * Só que silêncio não era a única saída. O que o botão produzia era uma vereda
 * concluída com o prêmio parado atrás de um clique que quem terminou não tinha
 * razão nenhuma para saber que existia — e dois percursos que rendem o mesmo
 * documento passaram a rendê-lo de dois jeitos.
 *
 * Agora emite ao aparecer, e o que a decisão antiga temia continua coberto: a
 * falha aparece escrita, com o botão de tentar de novo ao lado, e voltar à
 * vereda tenta outra vez sozinho. Erro visível e recuperável, e não pedido a
 * fazer.
 *
 * ── Uma tentativa por visita ─────────────────────────────────────────────
 * `pedido` guarda que já se tentou nesta montagem. Duas emissões ao mesmo
 * tempo passariam as duas pela conferência de "já existe?" do servidor — que é
 * uma leitura seguida de uma escrita, e não uma coisa só —, e a pessoa
 * acabaria com dois certificados ativos do mesmo percurso. O `StrictMode`
 * monta cada componente duas vezes de propósito, então isso não é hipótese.
 *
 * ── Revogado não se emite de novo ────────────────────────────────────────
 * Quem revoga um Token.Web() é a liderança, pelo painel administrativo, e a
 * conferência do servidor só enxerga os ativos. Emitir sozinho olhando apenas
 * para o ativo devolveria um certificado novo a cada visita à página — abrir a
 * vereda desfaria a revogação, e ninguém saberia. Por isso a decisão sai de
 * `tokens`, que traz os desta vereda em qualquer estado.
 */
export default function TokenDaVereda({ vereda, userId, tokens, aoEmitir }: {
  vereda: Vereda;
  userId: string;
  /** Os Token.Web() desta vereda que a pessoa já tem, de qualquer estado. */
  tokens: Certification[];
  aoEmitir: () => Promise<void> | void;
}) {
  const [erro, setErro] = useState('');
  const pedido = useRef(false);

  const ativo = tokens.find(c => c.status === 'active');
  /* Existe documento, e ele não vale: foi revogado. */
  const revogado = !ativo && tokens.length > 0;

  const emitir = useCallback(async () => {
    setErro('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setErro('Sessão expirada. Entre de novo para receber seu Token.Web().'); return; }

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
      /*
        O mural quem escreve é o servidor, na mesma transação da emissão.
        Escrever daqui também punha duas linhas iguais em "Atividade Recente"
        por certificado — e, agora que a emissão tenta de novo sozinha, uma
        linha a cada tentativa que encontrasse o documento já emitido.
      */
      await aoEmitir();
    } catch {
      setErro('Erro de conexão ao emitir o certificado. Verifique a internet.');
    }
  }, [userId, vereda.code, vereda.id, aoEmitir]);

  useEffect(() => {
    if (ativo || revogado || pedido.current) return;
    pedido.current = true;
    void emitir();
  }, [ativo, revogado, emitir]);

  if (ativo) {
    return (
      <div className="card p-4 flex items-center gap-3 flex-wrap"
        style={{ borderColor: 'var(--color-secondary-a30)', backgroundColor: 'var(--color-secondary-a03)' }}>
        <Award className="w-8 h-8 flex-none" style={{ color: 'var(--color-secondary)' }} />
        <div className="min-w-0 flex-1">
          <p className="font-bold" style={{ color: 'var(--color-secondary)' }}>Token.Web() emitido</p>
          <p className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>{ativo.code}</p>
        </div>
        <Link to={`/certificado/${ativo.code}`} className="btn-primary">Ver certificado</Link>
      </div>
    );
  }

  /* Revogar é decisão de gente, e desfazer também tem de ser. */
  if (revogado) {
    return (
      <div className="card p-4 flex items-center gap-3 flex-wrap" style={{ borderColor: 'var(--color-error-a20, var(--color-border))' }}>
        <ShieldOff className="w-8 h-8 flex-none" style={{ color: 'var(--color-error)' }} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">Vereda concluída</p>
          <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
            O Token.Web() desta vereda foi revogado. Fale com a liderança do seu
            clube — a plataforma não emite outro sozinha.
          </p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="card p-4 space-y-3" style={{ borderColor: 'var(--color-error-a20, var(--color-border))' }}>
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 flex-none" style={{ color: 'var(--color-text-dim)' }} />
          <div className="min-w-0">
            <p className="font-bold">Vereda concluída — o Token.Web() ainda não saiu</p>
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>{erro}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
              O que você fez está guardado. Abrir esta vereda de novo tenta
              outra vez sozinho.
            </p>
          </div>
        </div>
        <button onClick={() => void emitir()} className="btn-accent w-full">
          <RotateCw className="w-4 h-4 mr-2" /> Tentar de novo
        </button>
      </div>
    );
  }

  /*
    O estado de espera é o padrão, e não um caso à parte: este cartão só existe
    quando a vereda está vencida e o documento ainda não. Ele cobre o pedido em
    curso e o instante entre a resposta chegar e a lista de certificados se
    repintar.
  */
  return (
    <div className="card p-4 flex items-center gap-3" style={{ borderColor: 'var(--color-success-a20)' }}>
      <Loader2 className="w-8 h-8 flex-none animate-spin" style={{ color: 'var(--color-success)' }} />
      <div className="min-w-0">
        <p className="font-bold">Vereda concluída — emitindo seu Token.Web()…</p>
        <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
          Todas as lições vencidas. O Token.Web() desta vereda se verifica em
          público e sai em PDF, como o de uma trilha.
        </p>
      </div>
    </div>
  );
}
