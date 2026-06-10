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
  X
} from 'lucide-react';

interface SidebarProps {
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}


export const Sidebar = ({ user, onLogout, isOpen, onClose }: SidebarProps) => {
  const location = useLocation();

  const isTeacher = user?.role === 'TEACHER';
  const isTahfizTeacher = user?.role === 'TAHFIZ_TEACHER';
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'PRINCIPAL' || user?.role === 'VICE_PRINCIPAL' || user?.role === 'HEAD_TEACHER';
  const isPrincipal = user?.role === 'SUPER_ADMIN' || user?.role === 'PRINCIPAL';
  const isSchoolAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'PRINCIPAL' || user?.role === 'VICE_PRINCIPAL';
  const isParent = user?.role === 'PARENT';
  const isAccountant = user?.role === 'ACCOUNTANT' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const menuGroups = [
    {
      group: 'Main',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', show: true },
        { label: 'Attendance', icon: CalendarCheck, path: '/attendance', show: isTeacher || isAdmin || isTahfizTeacher },
        { label: 'Exam Scores', icon: Award, path: '/results', show: isTeacher || isAdmin },
        { label: 'Tahfiz Tracking', icon: BookOpen, path: '/tahfiz', show: isTahfizTeacher || isAdmin },
        { label: 'Admissions', icon: UserCheck, path: '/admissions', show: isPrincipal },
        { label: 'School Setup', icon: ShieldCheck, path: '/school-setup', show: isSchoolAdmin },
        { label: 'Fees & Billing', icon: CreditCard, path: '/finance', show: isAccountant || isParent || isAdmin },
        { label: 'Report Cards', icon: FileSpreadsheet, path: '/report-cards', show: true },
      ],
    },
    {
      group: 'System',
      items: [
        { label: 'Notifications', icon: Bell, path: '/notifications', show: true, badge: 3 },
        { label: 'School Website', icon: Globe, path: '/', show: isSuperAdmin || isAdmin },
        { label: 'User Management', icon: ShieldCheck, path: '/admin', show: isSuperAdmin },
      ],
    },
  ];

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 text-slate-100 flex flex-col
          border-r border-slate-800 z-50 transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo + mobile close button */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 shrink-0">
            DH
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm tracking-wide text-white leading-tight">Darul Hikmah</h1>
            <p className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase">Science & Tech</p>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter(item => item.show);
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.group}>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-3 mb-2">
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
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {typeof item.badge === 'number' && item.badge > 0 && !isActive && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center shrink-0">
              <UserCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <h4 className="font-semibold text-xs text-slate-200 truncate">{user?.name || 'User'}</h4>
              <p className={`text-[10px] font-bold uppercase truncate ${
                user?.role === 'SUPER_ADMIN' ? 'text-amber-400' : 'text-slate-500'
              }`}>
                {user?.role === 'SUPER_ADMIN' ? '⭐ ' : ''}{user?.role?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
