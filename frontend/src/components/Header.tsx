import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, HelpCircle, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  title: string;
  notifCount?: number;
  onMenuToggle: () => void;
}

export const Header = ({ title, notifCount = 3, onMenuToggle }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Session indicator — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide whitespace-nowrap">
            Term 1 · 2025/26
          </span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative"
          aria-label="Notifications"
        >
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[8px] font-black flex items-center justify-center">
              {notifCount}
            </span>
          )}
          <Bell className="w-5 h-5" />
        </button>

        {/* Help — hidden on xs */}
        <button className="hidden sm:block p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
