// Login.tsx
import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ShieldAlert, Moon, Sun, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onLoginSuccess?: (user: any) => void;
}

interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  
  const { theme, toggleTheme } = useTheme();
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      const redirectMap: Record<string, string> = {
        'SUPER_ADMIN': '/admin/dashboard',
        'ADMIN': '/admin/dashboard',
        'PRINCIPAL': '/principal/dashboard',
        'VICE_PRINCIPAL': '/vp/dashboard',
        'HEAD_TEACHER': '/headteacher/dashboard',
        'TEACHER': '/teacher/dashboard',
        'ACCOUNTANT': '/accountant/dashboard',
        'LIBRARIAN': '/librarian/dashboard'
      };
      
      const redirectPath = redirectMap[user.role] || '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Check lockout status
  useEffect(() => {
    if (lockoutUntil && Date.now() > lockoutUntil) {
      setLockoutUntil(null);
      setError('');
    }
  }, [lockoutUntil]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Rate limiting check
  const checkRateLimit = (emailAddress: string): boolean => {
    const recentAttempts = attempts.filter(
      attempt => attempt.email === emailAddress && 
      !attempt.success &&
      Date.now() - attempt.timestamp < 15 * 60 * 1000 // 15 minutes window
    );
    
    if (recentAttempts.length >= 5) {
      const oldestAttempt = Math.min(...recentAttempts.map(a => a.timestamp));
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes
      setLockoutUntil(oldestAttempt + lockoutDuration);
      setError('Too many failed attempts. Please try again after 15 minutes.');
      return false;
    }
    return true;
  };

  // Validate email format
  const validateEmailOrPhone = (identifier: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
      setError('Please enter a valid email address or phone number');
      return false;
    }
    return true;
  };

  // Validate password
  const validatePassword = (pwd: string): boolean => {
    if (!pwd || pwd.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  // Sanitize input
  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
      setError(`Account temporarily locked. Please try again in ${remainingMinutes} minutes.`);
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    // Validate inputs
    if (!sanitizedEmail || !sanitizedPassword) {
      setError('Please enter both email and password');
      return;
    }

    if (!validateEmailOrPhone(sanitizedEmail)) return;
    if (!validatePassword(sanitizedPassword)) return;

    // Rate limiting
    if (!checkRateLimit(sanitizedEmail)) return;

    setLoading(true);

    try {
      // Attempt login through auth context
      const result = await login(sanitizedEmail, sanitizedPassword);
      
      // Log successful attempt
      setAttempts(prev => [...prev, {
        email: sanitizedEmail,
        timestamp: Date.now(),
        success: true
      }]);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('remembered_email', sanitizedEmail);
      } else {
        localStorage.removeItem('remembered_email');
      }

      // Call success callback if provided
      if (onLoginSuccess && result.user) {
        onLoginSuccess(result.user);
      }

      // Redirect based on role
      setTimeout(() => {
        const redirectMap: Record<string, string> = {
          'SUPER_ADMIN': '/admin/dashboard',
          'ADMIN': '/admin/dashboard',
          'PRINCIPAL': '/principal/dashboard',
          'VICE_PRINCIPAL': '/vp/dashboard',
          'HEAD_TEACHER': '/headteacher/dashboard',
          'TEACHER': '/teacher/dashboard',
          'ACCOUNTANT': '/accountant/dashboard',
          'LIBRARIAN': '/librarian/dashboard'
        };
        
        const redirectPath = redirectMap[result.user.role] || '/dashboard';
        navigate(redirectPath);
      }, 100);
      
    } catch (err: any) {
      // Log failed attempt
      setAttempts(prev => [...prev, {
        email: sanitizedEmail,
        timestamp: Date.now(),
        success: false
      }]);

      // Handle specific error cases
      const errorMessage = err.message || 'Invalid email or password';
      
      if (errorMessage.includes('Account locked')) {
        setError('Your account has been locked. Please contact the system administrator.');
      } else if (errorMessage.includes('expired') || errorMessage.includes('expired')) {
        setError('Your password has expired. Please reset your password.');
      } else if (errorMessage.includes('suspended')) {
        setError('This account has been suspended. Please contact the administration.');
      } else if (errorMessage.includes('not found')) {
        setError('No account found with this email address.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
      
      // Clear password field on error for security
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden ${
      theme === 'dark'
        ? 'bg-[hsl(222,47%,5%)]'
        : 'bg-slate-50'
    }`}>
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/[0.04] rounded-full blur-3xl pointer-events-none" />

      {/* Top navigation */}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2 z-50">
        <Link to="/"
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
            theme === 'dark' ? 'border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-white'
          }`}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Site
        </Link>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border transition-all ${
            theme === 'dark'
              ? 'border-white/10 text-amber-400 bg-white/5 hover:bg-white/10'
              : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
          }`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-md space-y-4 relative">
        {/* Main card */}
        <div className={`rounded-2xl border p-7 sm:p-8 relative overflow-hidden shadow-xl transition-all ${
          theme === 'dark'
            ? 'bg-[hsl(222,47%,9%)] border-white/[0.07]'
            : 'bg-white border-slate-200'
        }`}>

          {/* Logo and title */}
          <div className="flex flex-col items-center mb-7 relative">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/25 mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h2 className={`text-2xl font-black tracking-tight text-center ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              Darul Hikmah Academy
            </h2>
            <p className={`text-sm text-center font-medium mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Staff Portal Login
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1">
                <p className="text-rose-700 dark:text-rose-400 text-sm font-medium">{error}</p>
                {error.includes('failed attempts') && (
                  <p className="text-rose-600 dark:text-rose-500 text-xs mt-1">
                    Please contact support if you've forgotten your password.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Email or Phone
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@darulhikmah.edu.ng"
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                }`}
                disabled={loading}
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password Field */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm pr-11 ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
                  }`}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Remember me
                </span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-emerald-600 hover:text-emerald-500 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating…
                </span>
              ) : 'Sign In to Portal'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className={`mt-5 pt-4 border-t ${theme === 'dark' ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <details className="group">
              <summary className={`flex items-center gap-2 text-xs font-semibold cursor-pointer list-none select-none ${theme === 'dark' ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}>
                <ShieldAlert size={13} className="text-emerald-500" />
                Demo access credentials
                <span className="ml-auto text-[10px] group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className={`mt-3 p-3 rounded-xl space-y-1 font-mono text-[11px] ${theme === 'dark' ? 'bg-white/[0.03] text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                <p>superadmin@darulhikmah.edu.ng</p>
                <p>teacher@darulhikmah.edu.ng</p>
                <p className={`text-[10px] mt-2 pt-2 border-t ${theme === 'dark' ? 'border-white/[0.06] text-slate-600' : 'border-slate-100 text-slate-400'}`}>Contact IT for production credentials</p>
              </div>
            </details>
          </div>
        </div>

        {/* Security Notice */}
        <p className={`text-center text-[11px] ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
          🔒 256-bit encrypted · All activity is logged
        </p>
      </div>
    </div>
  );
};