import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
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
import { LogOut, Home, BookOpen, FileText, Trophy, ShieldCheck, User } from 'lucide-react';

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

function NavBar() {
  const { session, profile, signOut } = useAuth();
  const location = useLocation();
  if (!session) return null;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="no-print sticky top-0 z-50" style={{ backgroundColor: 'var(--color-bg-input)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold" style={{ color: 'var(--color-primary)' }}>
          <span className="text-lg tracking-tight">Trilha.Web()</span>
        </Link>

        <div className="flex items-center gap-5">
          {[
            { to: '/', label: 'Início', icon: Home, exact: true },
            { to: '/especialidade/AP034', label: 'Trilhas', icon: BookOpen, exact: false },
            { to: '/relatorio', label: 'Relatório', icon: FileText, exact: false },
            { to: '/verificar', label: 'Verificar', icon: Trophy, exact: false },
            { to: '/perfil', label: 'Perfil', icon: User, exact: false },
          ].map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className="text-sm flex items-center gap-1.5 transition-colors"
                style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}

          {profile?.is_admin && (
            <Link to="/admin" className="text-sm flex items-center gap-1.5 transition-colors"
              style={{ color: isActive('/admin') ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          )}

          {profile && (
            <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid var(--color-border)' }}>
              <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{profile.display_name?.split(' ')[0]}</span>
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
      </div>
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
      <BrowserRouter>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
          <NavBar />
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
