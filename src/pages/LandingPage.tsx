import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Map, Award, ShieldCheck, BookOpen, Code2, Mail, Globe, ArrowRight, Star, AlertTriangle } from 'lucide-react';

export default function LandingPage() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen">
      <header style={{ backgroundColor: 'var(--color-bg-input)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
            <Compass className="w-7 h-7" />
            <span>Trilha.Web()</span>
          </div>
          <div className="flex gap-3">
            {session ? (
              <Link to="/" className="btn-primary">Ir para o Painel</Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Entrar</Link>
                <Link to="/cadastro" className="btn-primary">Criar Conta</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 pathfinder-gradient opacity-[0.07]" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--color-bg), var(--color-overlay-heavy), var(--color-bg))' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid var(--color-primary-a30)' }}>
            <Star className="w-4 h-4" style={{ color: 'var(--color-secondary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-secondary)' }}>Especialidades Oficiais AP034 e AP035</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Trilha<span style={{ color: 'var(--color-primary)' }}>.Web()</span>
          </h1>
          <p className="text-xl md:text-2xl mb-3" style={{ color: 'var(--color-text-soft)' }}>Aprenda Internet de forma autônoma</p>
          <p className="text-lg mb-10" style={{ color: 'var(--color-text-dim)' }}>
            Especialidades AP034 — Internet e AP035 — Internet, Avançado
          </p>
          {!session && (
            <Link to="/cadastro" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-lg transition"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'; e.currentTarget.style.boxShadow = '0 8px 24px var(--color-primary-a30)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = ''; }}>
              Começar Agora <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card p-6 transition group" style={{ transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-primary-a40)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition"
              style={{ backgroundColor: 'var(--color-primary-a10)' }}>
              <Map className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            </div>
            <h3 className="font-bold text-lg mb-2">Trilha Visual</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Mapa de módulos com lições curtas, laboratórios e checkpoints.</p>
          </div>

          <div className="card p-6 transition group"
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-secondary-a40)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition"
              style={{ backgroundColor: 'var(--color-secondary-a10)' }}>
              <Award className="w-6 h-6" style={{ color: 'var(--color-secondary)' }} />
            </div>
            <h3 className="font-bold text-lg mb-2">Token.Web()</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Certificação digital verificável emitida automaticamente após concluir cada trilha.</p>
          </div>

          <div className="card p-6 transition group"
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-tertiary-a50)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition"
              style={{ backgroundColor: 'var(--color-tertiary-a15)' }}>
              <ShieldCheck className="w-6 h-6" style={{ color: 'var(--color-success)' }} />
            </div>
            <h3 className="font-bold text-lg mb-2">100% Autônomo</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Sem avaliadores humanos obrigatórios. Estude no seu ritmo, com tentativas ilimitadas.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="card p-8" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--color-primary-a10)' }}>
              <BookOpen className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-2xl font-bold mb-3">AP034 — Internet</h2>
            <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Conceitos fundamentais, serviços, navegação, e-mail, segurança e Filipenses 4:8.
              Inclui WebLab (simulador de navegador) e MailLab (simulador de e-mail).
            </p>
            <ul className="text-sm space-y-1.5" style={{ color: 'var(--color-text-dim)' }}>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />Conceitos: internet, WWW, download, upload, vírus</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />Serviços: webmail, POP3, IMAP, streaming, busca</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />História da internet com editor de texto</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />Pacto de Uso Consciente</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />Laboratórios práticos</li>
            </ul>
          </div>

          <div className="card p-8" style={{ borderLeft: '4px solid var(--color-tertiary)' }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--color-tertiary-a15)' }}>
              <Code2 className="w-7 h-7" style={{ color: 'var(--color-success)' }} />
            </div>
            <h2 className="text-2xl font-bold mb-3">AP035 — Internet, Avançado</h2>
            <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
              HTTP, HTML, imagens para web, projetos de sites e inteligência artificial.
              Inclui CodeLab, ImageLab, SiteLab e AI Lab.
            </p>
            <ul className="text-sm space-y-1.5" style={{ color: 'var(--color-text-dim)' }}>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-tertiary-light)' }} />HTTP, HTTPS, hyperlinks, URLs, cores hexadecimais</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-tertiary-light)' }} />HTML com editor e preview isolado</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-tertiary-light)' }} />Otimização de imagens (JPEG, PNG, botões)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-tertiary-light)' }} />Projeto de site com quatro páginas</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-tertiary-light)' }} />Produção com IA (texto, imagem, logo)</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Globe, label: 'WebLab — Navegação simulada', color: 'var(--color-primary)' },
            { icon: Mail, label: 'MailLab — E-mail seguro', color: 'var(--color-primary)' },
            { icon: Code2, label: 'CodeLab — Editor HTML', color: 'var(--color-tertiary-light)' },
            { icon: Award, label: 'Token.Web() — Certificação', color: 'var(--color-secondary)' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="card p-4 text-center transition" style={{ transition: 'transform 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: item.color }} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="card p-6" style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-secondary-a25)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-secondary)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-secondary)' }}>Aviso:</strong> Token.Web() é uma certificação digital verificável de conclusão educacional.
              Não é uma criptomoeda, NFT ou ativo financeiro.
              A eventual aceitação por um clube ou instituição é decisão dessa instituição.
              O Token.Web() não concede insígnia oficial da Igreja Adventista ou do Clube de Desbravadores.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
