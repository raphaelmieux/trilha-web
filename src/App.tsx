import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import BrandMark from './components/ui/BrandMark';
import AvisoDeVersao from './components/ui/AvisoDeVersao';
import CodigoFonte from './components/ui/CodigoFonte';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/AuthContext';
import { percursoAtual } from './lib/navegacao';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SpecialtyPage from './pages/SpecialtyPage';
import LessonPage from './pages/LessonPage';
import ReportPage from './pages/ReportPage';
import VeredaPage from './pages/VeredaPage';
import VerifyPage from './pages/VerifyPage';
import CertificatePage from './pages/CertificatePage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import { useEffect, useRef, useState } from 'react';
import { LogOut, Home, Map, FileText, Award, ShieldCheck, User, Podium, Menu, X, ChevronDown } from 'lucide-react';

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

/* A marca do item de percurso. O destino e o rótulo saem do endereço, e ele
   some quando não há percurso aberto. Ver `percursoAtual`. */
const PERCURSO = '@percurso';

const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: Home, exact: true },
  { to: PERCURSO, label: 'Trilha Atual', icon: Map, exact: false },
  { to: '/relatorio', label: 'Relatório', icon: FileText, exact: false },
  { to: '/ranking', label: 'Ranking', icon: Podium, exact: false },
  { to: '/verificar', label: 'Verificar', icon: Award, exact: false },
];

/*
  O que mora atrás do nome da pessoa, e não na barra.

  Perfil e Admin eram dois itens da barra para duas telas que a mesma pessoa
  abre pelo mesmo motivo — cuidar da própria conta —, e a de Admin só existia
  para uma pessoa no clube inteiro, ocupando largura na barra de todo mundo.
  Clicar no próprio nome para achar a própria conta é o gesto que a pessoa já
  traz de qualquer outro aplicativo.

  Administração aparece aqui além de ser guia dentro do perfil: quem administra
  chega em dois cliques, e a barra continua livre para o que é de todos.
*/
const ITENS_DO_NOME = [
  { to: '/perfil', label: 'Meu Perfil', icon: User, soAdmin: false },
  { to: '/perfil/admin', label: 'Administração', icon: ShieldCheck, soAdmin: true },
];

export function NavBar() {
  const { session, profile, signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuDoNome, setMenuDoNome] = useState(false);
  const caixaDoNome = useRef<HTMLDivElement>(null);
  /* Fecha o menu do nome a cada mudança de endereço. Sem isso ele fica aberto
     por cima da tela nova, porque clicar num item do menu navega mas não
     desmonta a barra — ela é fixa e sobrevive à troca de página. */
  useEffect(() => setMenuDoNome(false), [location.pathname]);
  /*
    E fecha ao clicar fora, ou com Esc.

    Menu que só fecha no próprio botão fica aberto por cima do conteúdo
    enquanto a pessoa tenta usar a tela atrás dele — e, como a barra é fixa,
    ele acompanha a rolagem. O `mousedown` vem antes do `click` do que estiver
    embaixo, então o menu sai antes de o clique chegar ao destino.
  */
  useEffect(() => {
    if (!menuDoNome) return;
    const foraDaCaixa = (ev: MouseEvent) => {
      if (!caixaDoNome.current?.contains(ev.target as Node)) setMenuDoNome(false);
    };
    const comEsc = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setMenuDoNome(false); };
    document.addEventListener('mousedown', foraDaCaixa);
    document.addEventListener('keydown', comEsc);
    return () => {
      document.removeEventListener('mousedown', foraDaCaixa);
      document.removeEventListener('keydown', comEsc);
    };
  }, [menuDoNome]);
  if (!session) return null;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const percurso = percursoAtual(location.pathname);
  const paraOnde = (to: string) => (to === PERCURSO ? (percurso?.rota ?? '/') : to);
  /* O rótulo é do percurso aberto: numa vereda ele diz "Vereda Atual", porque
     chamá-la de trilha desfaria a distinção que o resto da plataforma
     sustenta. */
  const rotuloDe = (to: string, padrao: string) =>
    (to === PERCURSO ? (percurso?.rotulo ?? padrao) : padrao);
  /* Sem percurso aberto, o item sai do menu inteiro. */
  const itens = NAV_ITEMS.filter(i => i.to !== PERCURSO || percurso);

  const linkColor = (active: boolean) => ({ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' });

  /* Administração só entra para quem administra. A guia dentro do perfil segue
     a mesma regra, e nenhuma das duas é o que protege: quem protege é a RLS. */
  const itensDoNome = ITENS_DO_NOME.filter(i => !i.soAdmin || profile?.is_admin);
  const primeiroNome = profile?.display_name?.split(' ')[0];

  return (
    <nav className="no-print sticky top-0 z-50 app-nav">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold" style={{ color: 'var(--color-primary)' }}>
          <BrandMark tamanho="nav" />
        </Link>

        <div className="hidden md:flex items-center gap-5">
          {itens.map(({ to, label, icon: Icon, exact }) => {
            const active = to === PERCURSO ? true
              : exact ? location.pathname === to : isActive(to);
            return (
              <Link key={to} to={paraOnde(to)} className="text-sm flex items-center gap-1.5 transition-colors" style={linkColor(active)}>
                <Icon className="w-4 h-4" />
                <span>{rotuloDe(to, label)}</span>
              </Link>
            );
          })}

          {/* Ligado à sessão, e não ao perfil: se o perfil não carregar, o menu
              ainda abre e sair continua possível, que é justamente o que a
              pessoa precisa nessa hora. Só o nome depende do perfil ter vindo. */}
          {session && (
            <div ref={caixaDoNome} className="relative pl-4" style={{ borderLeft: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setMenuDoNome(a => !a)}
                aria-expanded={menuDoNome}
                aria-haspopup="menu"
                className="text-sm flex items-center gap-1.5 transition-colors"
                style={linkColor(menuDoNome || isActive('/perfil'))}
              >
                <User className="w-4 h-4" />
                <span>{primeiroNome ?? 'Minha conta'}</span>
                <ChevronDown className="w-3.5 h-3.5" style={{ transform: menuDoNome ? 'rotate(180deg)' : undefined }} />
              </button>

              {menuDoNome && (
                <div role="menu" className="absolute right-0 mt-2 py-1 rounded-lg"
                  style={{
                    minWidth: '11rem',
                    backgroundColor: 'var(--color-bg-solid)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                  }}>
                  {itensDoNome.map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} role="menuitem" onClick={() => setMenuDoNome(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                      style={linkColor(location.pathname === to)}>
                      <Icon className="w-4 h-4" /> {label}
                    </Link>
                  ))}
                  <button
                    role="menuitem"
                    onClick={() => { setMenuDoNome(false); signOut(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors"
                    style={{ color: 'var(--color-text-dim)', borderTop: '1px solid var(--color-border)', marginTop: '0.25rem', paddingTop: '0.5rem' }}
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </div>
              )}
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
            const active = to === PERCURSO ? true
              : exact ? location.pathname === to : isActive(to);
            return (
              <Link key={to} to={paraOnde(to)} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium"
                style={{ ...linkColor(active), backgroundColor: active ? 'var(--color-primary-a10)' : 'transparent' }}>
                <Icon className="w-4 h-4" /> {rotuloDe(to, label)}
              </Link>
            );
          })}
          {/* No celular não há menu dentro de menu: a gaveta já é vertical e
              tem altura de sobra. O que os itens da conta ganham é um bloco
              próprio no pé, separado por linha e encabeçado pelo nome — o
              mesmo agrupamento que o menu do computador faz, sem o clique a
              mais. */}
          {session && (
            <div className="flex flex-col gap-1"
              style={{ borderTop: '1px solid var(--color-border)', marginTop: '0.25rem', paddingTop: '0.5rem' }}>
              <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-faint)' }}>
                {primeiroNome ?? 'Minha conta'}
              </p>
              {itensDoNome.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium"
                  style={{
                    ...linkColor(location.pathname === to),
                    backgroundColor: location.pathname === to ? 'var(--color-primary-a10)' : 'transparent',
                  }}>
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              ))}
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium text-left"
                style={{ color: 'var(--color-text-dim)' }}
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
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
        <Route path="/vereda/:code" element={<ProtectedRoute><VeredaPage /></ProtectedRoute>} />
        <Route path="/relatorio" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        {/* A administração virou guia dentro do perfil. `/admin` continua
            respondendo porque ela esteve na barra por meses: link guardado,
            favorito e botão voltar do navegador apontam para lá, e endereço
            que some sem redirecionar é a pessoa achando que perdeu o acesso. */}
        <Route path="/admin" element={<Navigate to="/perfil/admin" replace />} />
        <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/perfil/admin" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
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
          {/* Fora das rotas, e por obrigação: a AGPL §13 pede que quem usa o
              programa pela rede tenha como obter a fonte. Uma tela sem o link
              seria uma tela servida sem cumprir a licença. */}
          <CodigoFonte />
          {/* Fora das rotas: um deploy novo interessa em qualquer tela. */}
          <AvisoDeVersao />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}
