import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import BrandMark from './components/ui/BrandMark';
import AvisoDeVersao from './components/ui/AvisoDeVersao';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/AuthContext';
import { rotaDaTrilhaAtual } from './lib/navegacao';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SpecialtyPage from './pages/SpecialtyPage';
import LessonPage from './pages/LessonPage';
import ReportPage from './pages/ReportPage';
import MiniTrilhaPage from './pages/MiniTrilhaPage';
import VerifyPage from './pages/VerifyPage';
import CertificatePage from './pages/CertificatePage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import { useState } from 'react';
import { LogOut, Home, Map, FileText, Award, ShieldCheck, User, Podium, Menu, X } from 'lucide-react';

/* Enquanto a sessão guardada ainda está sendo lida, as duas guardas abaixo
   esperam com a mesma tela — decidir antes seria decidir sem saber. */
function Carregando() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p style={{ color: 'var(--color-text-dim)' }}>Carregando...</p>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <Carregando />;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/*
  O espelho de ProtectedRoute: a rota que só faz sentido para quem ainda não
  entrou.

  /login, /cadastro e /recuperar-senha não eram protegidas de nada, o que está
  certo para quem chega de fora e errado para quem já entrou. Com sessão aberta,
  quem caísse numa delas — atalho antigo, botão voltar do navegador, endereço
  digitado — via o formulário de login com a barra de menu do aplicativo em cima
  dele, e um botão "Sair" logo acima do campo que pedia a senha. A tela pedia
  para entrar a quem já estava dentro.

  Esperar o `loading` é parte do conserto, e não detalhe: sem isso o formulário
  aparece por um instante, antes de a sessão guardada terminar de ser lida, e
  some sozinho em seguida — um piscar que parece defeito.
*/
export function RotaDeVisitante({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <Carregando />;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: Home, exact: true },
  /* O destino real sai do endereço; "/especialidade" é só a marca do item, e
     ele some quando não há trilha aberta. Ver rotaDaTrilhaAtual. */
  { to: '/especialidade', label: 'Trilha Atual', icon: Map, exact: false },
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

  const trilhaAtual = rotaDaTrilhaAtual(location.pathname);
  const paraOnde = (to: string) => (to === '/especialidade' ? (trilhaAtual ?? '/') : to);
  /* Sem trilha aberta, o item sai do menu inteiro. */
  const itens = NAV_ITEMS.filter(i => i.to !== '/especialidade' || trilhaAtual);

  const linkColor = (active: boolean) => ({ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' });

  return (
    <nav className="no-print sticky top-0 z-50 app-nav">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold" style={{ color: 'var(--color-primary)' }}>
          <BrandMark tamanho="nav" />
        </Link>

        <div className="hidden md:flex items-center gap-5">
          {itens.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : isActive(to);
            return (
              <Link key={to} to={paraOnde(to)} className="text-sm flex items-center gap-1.5 transition-colors" style={linkColor(active)}>
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
          {itens.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : isActive(to);
            return (
              <Link key={to} to={paraOnde(to)} onClick={() => setMenuOpen(false)}
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
        <Route path="/login" element={<RotaDeVisitante><LoginPage /></RotaDeVisitante>} />
        <Route path="/cadastro" element={<RotaDeVisitante><RegisterPage /></RotaDeVisitante>} />
        <Route path="/recuperar-senha" element={<RotaDeVisitante><ForgotPasswordPage /></RotaDeVisitante>} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/especialidade/:code" element={<ProtectedRoute><SpecialtyPage /></ProtectedRoute>} />
        <Route path="/licao/:specialtyCode/:moduleCode/:lessonCode" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
        <Route path="/mini-trilha/:id" element={<ProtectedRoute><MiniTrilhaPage /></ProtectedRoute>} />
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
