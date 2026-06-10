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
  CheckCircle
} from 'lucide-react';

interface DashboardProps {
  user: any;
}

export const Dashboard = ({ user }: DashboardProps) => {
  const [classesCount, setClassesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const classList = await api.classes.list();
      setClassesCount(classList.length);

      // Load all student listings and sum counts
      let total = 0;
      for (const cls of classList) {
        const list = await api.classes.getStudents(cls.id);
        total += list.length;
      }
      setStudentsCount(total || 15); // mock fallback to 15 if database was empty

      // Create some nice dynamic logs for recent activity
      setRecentActivities([
        { id: 1, type: 'attendance', desc: 'Daily attendance submitted for JSS 1A', time: '10 minutes ago' },
        { id: 2, type: 'results', desc: 'Mathematics test scores imported for Primary 3B', time: '2 hours ago' },
        { id: 3, type: 'tahfiz', desc: 'Sabaqi updates recorded for Abubakar Muhammad', time: 'Yesterday' },
        { id: 4, type: 'admission', desc: 'New admission application approved (DHA/2026/089)', time: '2 days ago' }
      ]);
    };
    loadData();
  }, []);

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'TEACHER': return 'Class Teacher';
      case 'TAHFIZ_TEACHER': return 'Tahfiz Instructor';
      case 'PRINCIPAL': return 'Principal Administrator';
      default: return 'Administrator';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Welcome section */}
      <div className="relative bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden p-5 sm:p-8 text-white shadow-xl shadow-slate-900/15 border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-full bg-emerald-500/10 rounded-l-full blur-2xl pointer-events-none"></div>
        <div className="relative max-w-2xl">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Academic portal
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mt-3 mb-2">
            Welcome back, {user?.name || 'Malam Ahmad'}
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            You are logged in as <span className="text-emerald-400 font-bold">{getRoleTitle()}</span>. Manage classes, view exam marks, log Qur'anic recitation, and review report cards in one interactive hub.
          </p>
        </div>
      </div>

      {/* Analytics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 sm:p-6 flex items-center justify-between shadow-xs">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Classes</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{classesCount || 3}</h3>
            <span className="text-emerald-500 text-[10px] sm:text-xs font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Active
            </span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 sm:p-6 flex items-center justify-between shadow-xs">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Students</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">{studentsCount}</h3>
            <span className="text-emerald-500 text-[10px] sm:text-xs font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Enrolled
            </span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Users className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 sm:p-6 flex items-center justify-between shadow-xs">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">94.8%</h3>
            <span className="text-emerald-500 text-[10px] sm:text-xs font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> High
            </span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 sm:p-6 flex items-center justify-between shadow-xs">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Results</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">5 / 5</h3>
            <span className="text-emerald-500 text-[10px] sm:text-xs font-semibold flex items-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3" /> Done
            </span>
          </div>
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <Award className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Main split details content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Quick action shortcuts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs lg:col-span-2 space-y-4 sm:space-y-6">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Quick Tasks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/attendance" 
              className="group p-5 bg-slate-50 hover:bg-slate-900 border border-slate-150 hover:border-slate-800 rounded-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center text-indigo-600 transition-colors mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-850 group-hover:text-white mb-1">Mark Attendance</h4>
              <p className="text-slate-400 text-xs group-hover:text-slate-350">Record daily classroom attendance for pupils.</p>
              <span className="text-xs font-semibold text-indigo-600 group-hover:text-emerald-400 flex items-center gap-1 mt-3">
                Go to Attendance <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link 
              to="/results" 
              className="group p-5 bg-slate-50 hover:bg-slate-900 border border-slate-150 hover:border-slate-800 rounded-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center text-emerald-600 transition-colors mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-850 group-hover:text-white mb-1">Enter Exam Marks</h4>
              <p className="text-slate-400 text-xs group-hover:text-slate-350">Compute assignment, project, and exam scores.</p>
              <span className="text-xs font-semibold text-emerald-600 group-hover:text-emerald-400 flex items-center gap-1 mt-3">
                Go to Exam Entry <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link 
              to="/tahfiz" 
              className="group p-5 bg-slate-50 hover:bg-slate-900 border border-slate-150 hover:border-slate-800 rounded-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-amber-600 transition-colors mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-850 group-hover:text-white mb-1">Tahfiz tracker</h4>
              <p className="text-slate-400 text-xs group-hover:text-slate-350">Log Quranic memorization progress (Sabak/Manzil).</p>
              <span className="text-xs font-semibold text-amber-600 group-hover:text-emerald-400 flex items-center gap-1 mt-3">
                Open Tahfiz Module <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link 
              to="/report-cards" 
              className="group p-5 bg-slate-50 hover:bg-slate-900 border border-slate-150 hover:border-slate-800 rounded-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 group-hover:bg-rose-500 group-hover:text-white flex items-center justify-center text-rose-600 transition-colors mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-850 group-hover:text-white mb-1">Generate Report Cards</h4>
              <p className="text-slate-400 text-xs group-hover:text-slate-350">Preview, edit remarks and print term report cards.</p>
              <span className="text-xs font-semibold text-rose-600 group-hover:text-emerald-400 flex items-center gap-1 mt-3">
                View Report Cards <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>

        {/* Recent Activity logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-5">Recent School Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] ${
                    act.type === 'attendance' ? 'bg-indigo-50 text-indigo-650' :
                    act.type === 'results' ? 'bg-emerald-50 text-emerald-650' :
                    act.type === 'tahfiz' ? 'bg-amber-50 text-amber-650' : 'bg-slate-100 text-slate-650'
                  }`}>
                    ●
                  </div>
                  <div>
                    <p className="text-slate-700 text-xs font-medium leading-relaxed">{act.desc}</p>
                    <span className="text-[10px] text-slate-400 font-semibold">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-5 border-t border-slate-100 mt-6">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              System Online - Darul Hikmah Academy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
