import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import BrandMark from './components/ui/BrandMark';
import AvisoDeVersao from './components/ui/AvisoDeVersao';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SpecialtyPage from './pages/SpecialtyPage';
import LessonPage from './pages/LessonPage';
import ReportPage from './pages/ReportPage';
import VerifyPage from './pages/VerifyPage';
import CertificatePage from './pages/CertificatePage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import { useState } from 'react';
import { LogOut, Home, Map, FileText, Award, ShieldCheck, User, Podium, Menu, X } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p style={{ color: 'var(--color-text-dim)' }}>Carregando...</p>
    </div>
  );
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: Home, exact: true },
  { to: '/especialidade/AP034', label: 'Trilhas', icon: Map, exact: false },
  { to: '/relatorio', label: 'Relatório', icon: FileText, exact: false },
  { to: '/ranking', label: 'Ranking', icon: Podium, exact: false },
  { to: '/verificar', label: 'Verificar', icon: Award, exact: false },
  { to: '/perfil', label: 'Perfil', icon: User, exact: false },
];

function NavBar() {
  const { session, profile, signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  if (!session) return null;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const linkColor = (active: boolean) => ({ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' });

  return (
    <nav className="no-print sticky top-0 z-50 app-nav">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold" style={{ color: 'var(--color-primary)' }}>
          <BrandMark tamanho="nav" />
        </Link>

        <div className="hidden md:flex items-center gap-5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : isActive(to);
            return (
              <Link key={to} to={to} className="text-sm flex items-center gap-1.5 transition-colors" style={linkColor(active)}>
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}

          {profile?.is_admin && (
            <Link to="/admin" className="text-sm flex items-center gap-1.5 transition-colors" style={linkColor(isActive('/admin'))}>
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          )}

          {/* Ligado à sessão, e não ao perfil: se o perfil não carregar, sair é
              justamente o que a pessoa precisa poder fazer. Só o nome depende
              do perfil ter vindo. */}
          {session && (
            <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid var(--color-border)' }}>
              {profile && (
                <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{profile.display_name?.split(' ')[0]}</span>
              )}
              <button
                onClick={signOut}
                className="text-sm flex items-center gap-1 transition-colors"
                style={{ color: 'var(--color-text-dim)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-dim)')}
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: 'var(--color-text-muted)' }}
          onClick={() => setMenuOpen(open => !open)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 pb-3 flex flex-col gap-1" style={{ borderTop: '1px solid var(--color-border)' }}>
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : isActive(to);
            return (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium"
                style={{ ...linkColor(active), backgroundColor: active ? 'var(--color-primary-a10)' : 'transparent' }}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            );
          })}
          {profile?.is_admin && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium"
              style={{ ...linkColor(isActive('/admin')), backgroundColor: isActive('/admin') ? 'var(--color-primary-a10)' : 'transparent' }}>
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          )}
          {session && (
            <button
              onClick={() => { setMenuOpen(false); signOut(); }}
              className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium text-left"
              style={{ color: 'var(--color-text-dim)', borderTop: '1px solid var(--color-border)', marginTop: '0.25rem', paddingTop: '0.75rem' }}
            >
              <LogOut className="w-4 h-4" /> Sair{profile ? ` (${profile.display_name?.split(' ')[0]})` : ''}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

function AppRoutes() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/especialidade/:code" element={<ProtectedRoute><SpecialtyPage /></ProtectedRoute>} />
        <Route path="/licao/:specialtyCode/:moduleCode/:lessonCode" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
        <Route path="/relatorio" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/verificar" element={<VerifyPage />} />
        <Route path="/certificado/:code" element={<CertificatePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        {/* No background colour here: body already paints it, and an opaque layer
            at this level would hide the ambient globe texture behind the app. */}
        <div className="min-h-screen">
          <NavBar />
          <AppRoutes />
          {/* Fora das rotas: um deploy novo interessa em qualquer tela. */}
          <AvisoDeVersao />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}
