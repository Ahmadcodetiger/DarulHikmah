import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  title: string;
  notifCount?: number;
  onMenuToggle: () => void;
  user?: any;
}

export const Header = ({ title, notifCount = 0, onMenuToggle, user }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'DH';

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <header className="bg-white dark:bg-[hsl(222,47%,8%)] border-b border-slate-200/80 dark:border-white/[0.06] h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-200">

      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate leading-tight">
            {title}
          </h2>
          <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
            {dateStr} · Darul Hikmah Academy
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

        {/* Session indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/30 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest whitespace-nowrap">
            Term 1 · 2025/26
          </span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark'
            ? <Sun className="w-4.5 h-4.5 text-amber-400" />
            : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all relative"
          aria-label="Notifications"
        >
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-amber-500 text-white text-[8px] font-black flex items-center justify-center">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
          <Bell className="w-5 h-5" />
        </button>

        {/* User avatar */}
        <button
          className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all"
          aria-label="User profile"
          title={user?.name || 'Staff'}
        >
          {initials}
        </button>
      </div>
    </header>
  );
};
