import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getPublicName, type UserProfile } from '../types';
import { Camera, Loader2, ArrowRight } from 'lucide-react';

/*
  A segunda etapa do cadastro.

  Foto e forma de exibição do nome ficam aqui, e não na primeira tela, por dois
  motivos. Um é de desistência: formulário longo espanta quem só quer entrar, e
  quem abandona no meio não vira desbravador cadastrado. O outro é técnico —
  enviar a foto exige estar autenticado, porque a regra do bucket confere que o
  arquivo pertence a quem o envia, e isso só existe depois que a conta é criada.

  Nada aqui é obrigatório. Pular leva direto ao painel, e tudo continua
  disponível em Perfil.
*/

const FORMAS: { valor: UserProfile['public_name_form']; rotulo: string; nota: string }[] = [
  { valor: 'full',      rotulo: 'Nome completo',   nota: 'Como você escreveu no cadastro.' },
  { valor: 'first',     rotulo: 'Primeiro nome',   nota: 'Mais reservado, e ainda reconhecível pelo clube.' },
  { valor: 'initials',  rotulo: 'Iniciais',        nota: 'Só as letras iniciais de cada nome.' },
  { valor: 'anonymous', rotulo: 'Anônimo',         nota: 'Seu nome não aparece em lugar nenhum público.' },
];

export default function CompletarPerfil({
  perfil,
  aoConcluir,
}: {
  perfil: Pick<UserProfile, 'id' | 'display_name'>;
  aoConcluir: () => void;
}) {
  const [forma, setForma] = useState<UserProfile['public_name_form']>('full');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const escolherFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setErro('A imagem deve ter no máximo 5 MB.'); return; }
    setArquivo(f);
    setPrevia(URL.createObjectURL(f));
    setErro('');
  };

  const salvar = async () => {
    setSalvando(true);
    setErro('');
    try {
      let avatar: string | null = null;
      if (arquivo) {
        const ext = arquivo.name.split('.').pop() || 'jpg';
        const nome = `${perfil.id}.${ext}`;
        const { error: envio } = await supabase.storage
          .from('avatars')
          .upload(nome, arquivo, { upsert: true });
        if (envio) throw envio;
        avatar = supabase.storage.from('avatars').getPublicUrl(nome).data.publicUrl;
      }

      const { error: atualizacao } = await supabase
        .from('user_profiles')
        .update({ public_name_form: forma, ...(avatar ? { avatar_url: avatar } : {}) })
        .eq('id', perfil.id);
      if (atualizacao) throw atualizacao;

      aoConcluir();
    } catch (e) {
      /* A conta já existe e está válida. Falhar aqui não pode prender ninguém
         na tela: o aviso explica, e o botão de pular continua ali. */
      setErro((e as Error).message || 'Não foi possível salvar. Você pode fazer isso depois, em Perfil.');
      setSalvando(false);
    }
  };

  const exemplo = getPublicName({ display_name: perfil.display_name, public_name_form: forma });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Conta criada!</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Falta pouco para deixar o perfil do seu jeito. Nada aqui é obrigatório —
          dá para fazer depois, em Perfil.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-soft)' }}>
          Foto (opcional)
        </label>
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--color-bg-hover)', border: '1px solid var(--color-border)' }}
          >
            {previa
              ? <img src={previa} alt="" className="w-full h-full object-cover" />
              : <Camera className="w-7 h-7" style={{ color: 'var(--color-text-faint)' }} />}
          </div>
          <label className="btn-secondary cursor-pointer">
            {previa ? 'Trocar foto' : 'Escolher foto'}
            <input type="file" accept="image/*" onChange={escolherFoto} className="hidden" />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>
          Como seu nome aparece para os outros
        </label>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-dim)' }}>
          Vale no ranking e na verificação de certificado feita por terceiros.
        </p>
        <div className="space-y-2">
          {FORMAS.map(f => (
            <label
              key={f.valor}
              className="flex items-start gap-2 p-2.5 rounded-lg cursor-pointer"
              style={{
                backgroundColor: forma === f.valor ? 'var(--color-primary-a08)' : 'var(--color-bg-input)',
                border: `1px solid ${forma === f.valor ? 'var(--color-primary-a30)' : 'var(--color-border)'}`,
              }}
            >
              <input
                type="radio"
                name="forma"
                checked={forma === f.valor}
                onChange={() => setForma(f.valor)}
                className="mt-0.5"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>{f.rotulo}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{f.nota}</p>
              </div>
            </label>
          ))}
        </div>
        {/* Ver o resultado vale mais que ler a descrição da opção. */}
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Vão ver você como: <span style={{ color: 'var(--color-secondary)' }}>{exemplo}</span>
        </p>
      </div>

      {erro && <p className="text-sm" style={{ color: 'var(--color-primary)' }}>{erro}</p>}

      <div className="flex gap-2">
        <button onClick={salvar} disabled={salvando} className="btn-primary flex-1">
          {salvando
            ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Salvando...</>
            : <>Salvar e começar <ArrowRight className="w-4 h-4 ml-1" /></>}
        </button>
        <button onClick={aoConcluir} disabled={salvando} className="btn-secondary">
          Pular por agora
        </button>
      </div>
    </div>
  );
}
