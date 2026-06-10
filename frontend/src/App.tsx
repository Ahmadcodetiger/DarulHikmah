import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { api } from './lib/api';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Results } from './pages/Results';
import { ReportCard } from './pages/ReportCard';
import { Tahfiz } from './pages/Tahfiz';
import { Finance } from './pages/Finance';
import { Notifications } from './pages/Notifications';
import { Admissions } from './pages/Admissions';
import { SchoolSetup } from './pages/SchoolSetup';
import { Admin } from './pages/Admin';
import { CheckCircle2 } from 'lucide-react';

// ─── Page title map ───────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/dashboard':      'Dashboard Overview',
  '/attendance':     'Student Attendance',
  '/results':        'Academics & Grading',
  '/report-cards':   'Academic Report Cards',
  '/tahfiz':         'Tahfiz Progress Tracking',
  '/finance':        'Fees & Payments',
  '/notifications':  'Notification Centre',
  '/admissions':     'Admissions Review',
  '/school-setup':   'School Structure Management',
  '/admin':          'User Management',
};

// ─── Authenticated app shell ───────────────────────────────────────
const AppLayout = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const location = useLocation();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mock_payment') === 'success') {
      const invoiceId = params.get('invoiceId');
      if (invoiceId) {
        api.finance.simulatePaymentSuccess(invoiceId);
        setPaymentSuccess(true);
        window.history.replaceState({}, document.title, location.pathname);
        setTimeout(() => setPaymentSuccess(false), 5000);
      }
    }
    // Close sidebar on route change (mobile)
    setSidebarOpen(false);
  }, [location]);

  const title = PAGE_TITLES[location.pathname] ?? 'Darul Hikmah Academy';

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-200">
      {/* Sidebar — hidden on print */}
      <div className="print:hidden">
        <Sidebar
          user={user}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header — hidden on print */}
        <div className="print:hidden">
          <Header
            title={title}
            notifCount={3}
            user={user}
            onMenuToggle={() => setSidebarOpen(prev => !prev)}
          />
        </div>

        {/* Payment success toast */}
        {paymentSuccess && (
          <div className="bg-emerald-500 text-white text-sm font-bold px-4 sm:px-8 py-3.5 flex items-center gap-3 animate-slide-in sticky top-16 z-25 shadow-md print:hidden">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Thank you! Payment approved and ledger updated.</span>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/dashboard"     element={<Dashboard user={user} />} />
            <Route path="/attendance"    element={<Attendance user={user} />} />
            <Route path="/results"       element={<Results user={user} />} />
            <Route path="/report-cards"  element={<ReportCard user={user} />} />
            <Route path="/tahfiz"        element={<Tahfiz user={user} />} />
            <Route path="/finance"       element={<Finance user={user} />} />
            <Route path="/admissions"    element={<Admissions user={user} />} />
            <Route path="/school-setup"  element={<SchoolSetup user={user} />} />
            <Route path="/admin"         element={<Admin />} />
            <Route path="/notifications" element={<Notifications user={user} />} />
            {/* Catch-all → dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// ─── Root App ──────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const activeUser = api.auth.getCurrentUser();
    if (activeUser) setUser(activeUser);
    setChecking(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: any) => setUser(loggedInUser);

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-white">
        <span className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin"></span>
        <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500">Initializing Portal...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public landing page — always accessible */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth routes */}
          {user ? (
            <Route path="/*" element={<AppLayout user={user} onLogout={handleLogout} />} />
          ) : (
            <>
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/*"    element={<Navigate to="/login" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
