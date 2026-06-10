import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  BookOpen,
  FileSpreadsheet,
  LogOut,
  UserCircle,
  CreditCard,
  Bell,
  Globe,
  ShieldCheck,
  UserCheck,
  X,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  notifCount?: number;
}

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN:     { label: 'Super Admin',    color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  PRINCIPAL:       { label: 'Principal',      color: 'text-violet-400',  bg: 'bg-violet-500/10' },
  VICE_PRINCIPAL:  { label: 'Vice Principal', color: 'text-sky-400',     bg: 'bg-sky-500/10' },
  HEAD_TEACHER:    { label: 'Head Teacher',   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  TEACHER:         { label: 'Teacher',        color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  TAHFIZ_TEACHER:  { label: 'Tahfiz Teacher', color: 'text-teal-400',    bg: 'bg-teal-500/10' },
  ACCOUNTANT:      { label: 'Accountant',     color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  PARENT:          { label: 'Parent',         color: 'text-slate-400',   bg: 'bg-slate-500/10' },
};

export const Sidebar = ({ user, onLogout, isOpen, onClose, notifCount = 0 }: SidebarProps) => {
  const location = useLocation();

  const isTeacher      = user?.role === 'TEACHER';
  const isTahfizTeacher = user?.role === 'TAHFIZ_TEACHER';
  const isAdmin        = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER'].includes(user?.role);
  const isPrincipal    = ['SUPER_ADMIN', 'PRINCIPAL'].includes(user?.role);
  const isSchoolAdmin  = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'].includes(user?.role);
  const isParent       = user?.role === 'PARENT';
  const isAccountant   = ['ACCOUNTANT', 'SUPER_ADMIN'].includes(user?.role);
  const isSuperAdmin   = user?.role === 'SUPER_ADMIN';

  const menuGroups = [
    {
      group: 'Main',
      items: [
        { label: 'Dashboard',      icon: LayoutDashboard, path: '/dashboard',    show: true },
        { label: 'Attendance',     icon: CalendarCheck,   path: '/attendance',   show: isTeacher || isAdmin || isTahfizTeacher },
        { label: 'Exam Scores',    icon: Award,           path: '/results',      show: isTeacher || isAdmin },
        { label: 'Tahfiz Tracker', icon: BookOpen,        path: '/tahfiz',       show: isTahfizTeacher || isAdmin },
        { label: 'Admissions',     icon: UserCheck,       path: '/admissions',   show: isPrincipal },
        { label: 'School Setup',   icon: ShieldCheck,     path: '/school-setup', show: isSchoolAdmin },
        { label: 'Fees & Billing', icon: CreditCard,      path: '/finance',      show: isAccountant || isParent || isAdmin },
        { label: 'Report Cards',   icon: FileSpreadsheet, path: '/report-cards', show: true },
      ],
    },
    {
      group: 'System',
      items: [
        { label: 'Notifications',  icon: Bell,        path: '/notifications', show: true,              badge: notifCount },
        { label: 'School Website', icon: Globe,       path: '/',              show: isSuperAdmin || isAdmin },
        { label: 'User Mgmt',      icon: ShieldCheck, path: '/admin',         show: isSuperAdmin },
      ],
    },
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 1024) onClose();
  };

  const roleMeta = ROLE_META[user?.role] ?? { label: user?.role?.replace(/_/g, ' ') ?? 'Staff', color: 'text-slate-400', bg: 'bg-slate-500/10' };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 flex flex-col z-50
          bg-[hsl(222,47%,7%)] border-r border-white/[0.06]
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          lg:static lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06] flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-white font-black text-xs tracking-tight">DH</span>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[hsl(222,47%,7%)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm text-white leading-tight tracking-tight">Darul Hikmah</h1>
            <p className="text-[9px] text-emerald-500/70 font-semibold tracking-[0.15em] uppercase mt-0.5">Science & Tech Academy</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors shrink-0"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter(item => item.show);
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.group}>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 px-3 mb-1.5">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={handleNavClick}
                        className={`
                          relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                          transition-all duration-200 group
                          ${isActive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                          }
                        `}
                      >
                        {/* Active left bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-500 rounded-r-full" />
                        )}
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {typeof item.badge === 'number' && item.badge > 0 && !isActive && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                        {isActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-500/50 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/[0.06]">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600/30 to-emerald-400/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <UserCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate leading-tight">{user?.name || 'Staff Member'}</p>
              <span className={`inline-block text-[9px] font-bold uppercase tracking-wider mt-0.5 px-1.5 py-0.5 rounded-full ${roleMeta.bg} ${roleMeta.color}`}>
                {roleMeta.label}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
