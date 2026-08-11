import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, ShieldCheck, MessageCircleQuestion } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Compass className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>Trilha.Web()</h1>
          </div>
          <p style={{ color: 'var(--color-text-dim)' }}>Recuperação de senha</p>
        </div>

        <div className="card">
          <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-secondary)' }} />
          <h2 className="text-xl font-bold mb-2 text-center">Esqueceu sua senha?</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Por segurança, a redefinição de senha não é mais feita apenas com o e-mail — isso permitia
            que qualquer pessoa assumisse a conta de outra. Agora, peça para o administrador do seu
            clube redefinir sua senha por você.
          </p>
          <div className="flex items-start gap-2 p-3 rounded-lg mb-4 text-sm" style={{ backgroundColor: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
            <MessageCircleQuestion className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-secondary)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>
              Fale com o administrador do clube (na aba <strong style={{ color: 'var(--color-text)' }}>Admin</strong>,
              ele pode gerar uma nova senha para o seu e-mail) e peça a nova senha por um canal confiável.
            </p>
          </div>
          <Link to="/login" className="text-sm flex items-center gap-1 justify-center" style={{ color: 'var(--color-text-dim)' }}>
            <ArrowLeft className="w-4 h-4" /> Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
