import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, LayoutDashboard, FileText, User, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Painel', icon: LayoutDashboard },
    { to: '/relatorio', label: 'Relatório', icon: FileText },
    { to: '/perfil', label: 'Perfil', icon: User },
  ];
  if (profile?.is_admin) navItems.push({ to: '/admin', label: 'Admin', icon: Shield });

  const handleSignOut = async () => { await signOut(); navigate('/'); };
  const linkStyle = (active: boolean) => ({
    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
    backgroundColor: active ? 'var(--color-primary-a10)' : 'transparent',
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="no-print sticky top-0 z-50" style={{ backgroundColor: 'var(--color-bg-input)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
            <Compass className="w-7 h-7" /><span>Trilha.Web()</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to} className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition" style={linkStyle(active)}>
                  <Icon className="w-4 h-4" />{item.label}
                </Link>
              );
            })}
            <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition" style={linkStyle(false)}>
              <LogOut className="w-4 h-4" />Sair
            </button>
          </nav>
          <button className="md:hidden p-2 rounded-lg" style={{ color: 'var(--color-text-muted)' }} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 py-2" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-input)' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium" style={linkStyle(location.pathname.startsWith(item.to))}><Icon className="w-4 h-4" />{item.label}</Link>;
            })}
            <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium" style={linkStyle(false)}><LogOut className="w-4 h-4" />Sair</button>
          </div>
        )}
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
      <footer className="no-print py-4 px-4 text-center text-sm" style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text-dim)' }}>
        <p>Trilha.Web() — Plataforma de Aprendizagem Autônoma</p>
        <p className="mt-1 text-xs">Token.Web() não é criptomoeda, NFT ou ativo financeiro.</p>
      </footer>
    </div>
  );
}
