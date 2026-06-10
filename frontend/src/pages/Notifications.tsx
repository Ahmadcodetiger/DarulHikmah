import { useState } from 'react';
import {
  Bell, BellOff, CheckCheck, Trash2, Filter,
  AlertCircle, Info, CheckCircle2, CreditCard, BookOpen,
  UserCheck, GraduationCap, Plus, X, Send, Clock
} from 'lucide-react';

type NotifType = 'info' | 'success' | 'warning' | 'payment' | 'academic' | 'attendance' | 'tahfiz';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  recipient: string;
  timestamp: string;
  read: boolean;
  pinned?: boolean;
}

const TYPE_CONFIG: Record<NotifType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  info: { label: 'Info', icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  success: { label: 'Success', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  warning: { label: 'Alert', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  payment: { label: 'Payment', icon: CreditCard, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  academic: { label: 'Academic', icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  attendance: { label: 'Attendance', icon: UserCheck, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  tahfiz: { label: 'Tahfiz', icon: BookOpen, color: 'text-teal-500', bg: 'bg-teal-500/10' },
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', type: 'payment', title: 'Fee Payment Received',
    message: 'First term school fees of ₦45,000 received for Amina Abdullahi (JSS 2B). Receipt No: RCP-20245-1023.',
    recipient: 'Admin', timestamp: '2025-06-08T09:30:00', read: false, pinned: true,
  },
  {
    id: 'n2', type: 'attendance', title: 'Low Attendance Alert',
    message: 'Ibrahim Musa (SS 1C) has been absent for 5 consecutive days. Parent contact recommended.',
    recipient: 'Class Teacher', timestamp: '2025-06-08T08:15:00', read: false,
  },
  {
    id: 'n3', type: 'academic', title: 'First Term Results Published',
    message: 'End-of-term results for all JSS & SS students have been published. Parents can now view report cards.',
    recipient: 'All Students', timestamp: '2025-06-07T14:00:00', read: true,
  },
  {
    id: 'n4', type: 'tahfiz', title: 'Tahfiz Milestone Achieved',
    message: 'Fatima Yusuf has successfully completed Juz 20 memorization and passed evaluation by Sheikh Abdulrahman.',
    recipient: 'Tahfiz Admin', timestamp: '2025-06-07T11:45:00', read: true,
  },
  {
    id: 'n5', type: 'warning', title: 'Outstanding Fees Reminder',
    message: '47 students have outstanding second-term fees. Total balance: ₦2,115,000. Deadline: June 20th.',
    recipient: 'Bursary', timestamp: '2025-06-06T10:00:00', read: false,
  },
  {
    id: 'n6', type: 'success', title: 'New Admission Approved',
    message: 'Abubakar Sani has been successfully admitted into Primary 3 (2025/2026 session) pending payment.',
    recipient: 'Admissions', timestamp: '2025-06-06T09:00:00', read: true,
  },
  {
    id: 'n7', type: 'info', title: 'System Maintenance Scheduled',
    message: 'The SMS portal will be offline for maintenance on Sunday, June 15th from 2:00 AM to 5:00 AM.',
    recipient: 'All Staff', timestamp: '2025-06-05T16:00:00', read: true,
  },
  {
    id: 'n8', type: 'academic', title: 'Exam Timetable Uploaded',
    message: 'Second Term examination timetable for all classes has been uploaded. Duration: June 23 – July 4.',
    recipient: 'All Students', timestamp: '2025-06-04T12:00:00', read: true,
  },
];

const formatTimeAgo = (ts: string) => {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const Notifications = ({ user }: { user?: any }) => {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | NotifType>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  // Compose form
  const [composeForm, setComposeForm] = useState({ title: '', message: '', type: 'info' as NotifType, recipient: 'All Staff' });

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const toggleRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selected.includes(n.id)));
    setSelected([]);
  };

  const filtered = notifications.filter(n => {
    if (showUnreadOnly && n.read) return false;
    if (filter !== 'all' && n.type !== filter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const sendNotification = () => {
    if (!composeForm.title.trim() || !composeForm.message.trim()) return;
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      type: composeForm.type,
      title: composeForm.title,
      message: composeForm.message,
      recipient: composeForm.recipient,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    setComposeForm({ title: '', message: '', type: 'info', recipient: 'All Staff' });
    setShowCompose(false);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <Bell className="w-6 h-6 text-emerald-500" />
            Notification Centre
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {unreadCount > 0 ? (
              <span className="text-emerald-600 font-bold">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</span>
            ) : (
              'All caught up! No unread notifications.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl hover:border-emerald-200 transition-all">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          {selected.length > 0 && (
            <button onClick={deleteSelected}
              className="flex items-center gap-2 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-4 py-2.5 rounded-xl hover:bg-rose-100 transition-all">
              <Trash2 className="w-4 h-4" /> Delete ({selected.length})
            </button>
          )}
          {isSuperAdmin && (
            <button onClick={() => setShowCompose(true)}
              className="flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4" /> Compose
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="flex flex-wrap gap-2">
          {['all', ...Object.keys(TYPE_CONFIG)].map((key) => {
            const cfg = key === 'all' ? null : TYPE_CONFIG[key as NotifType];
            return (
              <button key={key} onClick={() => setFilter(key as any)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  filter === key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
                {cfg && <cfg.icon className="w-3 h-3" />}
                {key === 'all' ? 'All' : cfg!.label}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              showUnreadOnly ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
            <BellOff className="w-3 h-3" />
            Unread only
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-semibold text-sm">No notifications found</p>
            <p className="text-slate-400 text-xs mt-1">Try changing your filter settings</p>
          </div>
        ) : (
          filtered.map((notif, idx) => {
            const cfg = TYPE_CONFIG[notif.type];
            const Icon = cfg.icon;
            const isSelected = selected.includes(notif.id);

            return (
              <div key={notif.id}
                className={`flex items-start gap-4 p-5 transition-colors group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 animate-fade-in ${
                  !notif.read ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                }`}
                style={{ animationDelay: `${idx * 0.03}s` }}>

                {/* Checkbox */}
                <input type="checkbox" checked={isSelected}
                  onChange={(e) => setSelected(prev => e.target.checked ? [...prev, notif.id] : prev.filter(id => id !== notif.id))}
                  className="mt-1.5 w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0" />

                {/* Type Icon */}
                <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-black text-sm ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
                          {notif.title}
                        </h3>
                        {notif.pinned && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                            📌 Pinned
                          </span>
                        )}
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed mt-1 ${notif.read ? 'text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(notif.timestamp)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">→ {notif.recipient}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => toggleRead(notif.id)} title={notif.read ? 'Mark unread' : 'Mark read'}
                        className="p-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 transition-all">
                        <CheckCheck className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteNotif(notif.id)} title="Delete"
                        className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: notifications.length, color: 'text-slate-700 dark:text-slate-200', bg: 'bg-white dark:bg-slate-900' },
          { label: 'Unread', value: unreadCount, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Payments', value: notifications.filter(n => n.type === 'payment').length, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Alerts', value: notifications.filter(n => n.type === 'warning').length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center`}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-lg shadow-2xl animate-bounce-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <Bell className="w-5 h-5 text-emerald-500" />
                Compose Notification
              </h3>
              <button onClick={() => setShowCompose(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Type</label>
                <select value={composeForm.type} onChange={e => setComposeForm(p => ({ ...p, type: e.target.value as NotifType }))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium outline-none focus:border-emerald-500">
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Recipient</label>
                <select value={composeForm.recipient} onChange={e => setComposeForm(p => ({ ...p, recipient: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium outline-none focus:border-emerald-500">
                  {['All Staff', 'All Students', 'All Parents', 'Teachers Only', 'Bursary', 'Admissions', 'Tahfiz Admin', 'Class Teacher', 'Admin'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Title</label>
                <input value={composeForm.title} onChange={e => setComposeForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Notification title..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium outline-none focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Message</label>
                <textarea value={composeForm.message} onChange={e => setComposeForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Write your notification message here..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium outline-none resize-none focus:border-emerald-500" />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowCompose(false)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button onClick={sendNotification}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
