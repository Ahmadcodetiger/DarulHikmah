import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Activity,
  Clock,
} from 'lucide-react';

interface DashboardProps {
  user: any;
}

const ACTIVITY_DOTS: Record<string, string> = {
  attendance: 'bg-indigo-500',
  results:    'bg-emerald-500',
  tahfiz:     'bg-amber-500',
  admission:  'bg-violet-500',
};

export const Dashboard = ({ user }: DashboardProps) => {
  const [classesCount, setClassesCount]   = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const classList = await api.classes.list();
      setClassesCount(classList.length);

      let total = 0;
      for (const cls of classList) {
        const list = await api.classes.getStudents(cls.id);
        total += list.length;
      }
      setStudentsCount(total || 15);

      setRecentActivities([
        { id: 1, type: 'attendance', desc: 'Daily attendance submitted for JSS 1A',             time: '10 min ago' },
        { id: 2, type: 'results',    desc: 'Mathematics test scores imported for Primary 3B',   time: '2 hrs ago' },
        { id: 3, type: 'tahfiz',     desc: 'Sabaqi updates recorded — Abubakar Muhammad',       time: 'Yesterday' },
        { id: 4, type: 'admission',  desc: 'New admission approved (DHA/2026/089)',              time: '2 days ago' },
      ]);
    };
    loadData();
  }, []);

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'TEACHER':        return 'Class Teacher';
      case 'TAHFIZ_TEACHER': return 'Tahfiz Instructor';
      case 'PRINCIPAL':      return 'Principal Administrator';
      default:               return 'Administrator';
    }
  };

  const stats = [
    { label: 'Classes',    value: classesCount || 3,  icon: BookOpen,  color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-500/10',  top: 'border-t-indigo-500',  badge: 'Active'   },
    { label: 'Students',   value: studentsCount,       icon: Users,     color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', top: 'border-t-emerald-500', badge: 'Enrolled' },
    { label: 'Attendance', value: '94.8%',             icon: Calendar,  color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-500/10',     top: 'border-t-amber-500',   badge: 'High'     },
    { label: 'Results',    value: '5 / 5',             icon: Award,     color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-500/10',       top: 'border-t-rose-500',    badge: 'Complete' },
  ];

  const quickTasks = [
    { to: '/attendance',  icon: Calendar,  color: 'indigo',   title: 'Mark Attendance',     desc: 'Record daily classroom attendance for pupils.',           cta: 'Go to Attendance' },
    { to: '/results',     icon: Award,     color: 'emerald',  title: 'Enter Exam Marks',    desc: 'Compute assignment, project, and exam scores.',           cta: 'Go to Exam Entry' },
    { to: '/tahfiz',      icon: BookOpen,  color: 'amber',    title: 'Tahfiz Tracker',      desc: 'Log Quranic memorization progress (Sabak/Manzil).',       cta: 'Open Tahfiz Module' },
    { to: '/report-cards',icon: Users,     color: 'rose',     title: 'Generate Report Cards', desc: 'Preview, edit remarks and print term report cards.', cta: 'View Report Cards' },
  ];

  const colorMap: Record<string, string> = {
    indigo:  'bg-indigo-100  dark:bg-indigo-500/10  text-indigo-600  dark:text-indigo-400  group-hover:bg-indigo-500',
    emerald: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500',
    amber:   'bg-amber-100   dark:bg-amber-500/10   text-amber-600   dark:text-amber-400   group-hover:bg-amber-500',
    rose:    'bg-rose-100    dark:bg-rose-500/10    text-rose-600    dark:text-rose-400    group-hover:bg-rose-500',
  };
  const ctaColorMap: Record<string, string> = {
    indigo:  'text-indigo-600  dark:text-indigo-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber:   'text-amber-600   dark:text-amber-400',
    rose:    'text-rose-600    dark:text-rose-400',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Welcome Banner */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden p-6 sm:p-8 text-white shadow-xl border border-white/5">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            <span className="w-1 h-1 bg-emerald-400 rounded-full" />
            Academic Portal · Active
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome back, <span className="text-emerald-400">{user?.name?.split(' ')[0] || 'Malam'}</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
            Logged in as <span className="text-emerald-400 font-semibold">{getRoleTitle()}</span>. Manage classes, log grades, track Quranic recitation, and generate report cards — all in one place.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`bg-white dark:bg-slate-900 rounded-2xl border-t-2 ${stat.top} border-x border-b border-slate-200/60 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 tabular-nums">{stat.value}</h3>
                <span className={`${stat.color} text-[10px] sm:text-xs font-semibold flex items-center gap-1 mt-1`}>
                  <TrendingUp className="w-3 h-3" /> {stat.badge}
                </span>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} shrink-0`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Quick Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm lg:col-span-2">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2 mb-5">
            <Activity className="w-4.5 h-4.5 text-indigo-500" />
            Quick Tasks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickTasks.map((task) => {
              const Icon = task.icon;
              return (
                <Link
                  key={task.to}
                  to={task.to}
                  className="group flex flex-col gap-3 p-4 sm:p-5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-600 hover:bg-slate-900 dark:hover:bg-slate-800 transition-all duration-250"
                >
                  <div className={`w-9 h-9 rounded-xl ${colorMap[task.color]} flex items-center justify-center group-hover:text-white transition-colors`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-white mb-0.5">{task.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-400">{task.desc}</p>
                  </div>
                  <span className={`text-xs font-semibold ${ctaColorMap[task.color]} group-hover:text-emerald-400 flex items-center gap-1`}>
                    {task.cta} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-slate-400" />
            Recent Activity
          </h2>

          <div className="flex-1 space-y-1">
            {recentActivities.map((act, i) => (
              <div
                key={act.id}
                className={`flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors ${i !== recentActivities.length - 1 ? 'border-b border-slate-50 dark:border-white/[0.04]' : ''}`}
              >
                {/* Dot */}
                <div className="flex flex-col items-center pt-1.5 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${ACTIVITY_DOTS[act.type]}`} />
                  {i !== recentActivities.length - 1 && (
                    <span className="w-px flex-1 bg-slate-100 dark:bg-white/5 mt-1" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-3 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{act.desc}</p>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.05] mt-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
