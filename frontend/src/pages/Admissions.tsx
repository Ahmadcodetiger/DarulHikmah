import { useMemo, useState } from 'react';
import { ADMISSIONS_ROLES, hasRole } from '../lib/permissions';
import { Unauthorized } from '../components/Unauthorized';
import { Check, X, ClipboardList } from 'lucide-react';

const initialApplications = [
  {
    id: 'app-1',
    fullName: 'Abubakar Sani',
    classChoice: 'Primary 3B',
    age: 11,
    status: 'Pending',
    requestedBy: 'Mother',
    submittedAt: '2026-06-01',
  },
  {
    id: 'app-2',
    fullName: 'Halima Yusuf',
    classChoice: 'JSS 1A',
    age: 12,
    status: 'Pending',
    requestedBy: 'Father',
    submittedAt: '2026-06-02',
  },
  {
    id: 'app-3',
    fullName: 'Musa Ibrahim',
    classChoice: 'Tahfiz Class A',
    age: 10,
    status: 'Approved',
    requestedBy: 'Guardian',
    submittedAt: '2026-05-30',
  },
];

export const Admissions = ({ user }: { user?: any }) => {
  const canManageAdmissions = hasRole(user?.role, ADMISSIONS_ROLES);
  const [applications, setApplications] = useState(initialApplications);
  const pendingCount = useMemo(
    () => applications.filter((application) => application.status === 'Pending').length,
    [applications]
  );

  if (!canManageAdmissions) {
    return <Unauthorized pageName="Admissions" />;
  }

  const handleChangeStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setApplications((prev) => prev.map((application) => (
      application.id === id ? { ...application, status } : application
    )));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-emerald-500" /> Admissions Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Review new student applications, approve admissions and assign classes.</p>
        </div>
        <div className="rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-200">
          Pending applications: {pendingCount}
        </div>
      </div>

      <div className="grid gap-4">
        {applications.map((application) => (
          <div key={application.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{application.fullName}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Applied for: <span className="font-semibold text-slate-700 dark:text-slate-200">{application.classChoice}</span></p>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                application.status === 'Pending' ? 'bg-amber-100 text-amber-700' : application.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {application.status}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              <div><span className="font-semibold text-slate-700 dark:text-slate-200">Age:</span> {application.age}</div>
              <div><span className="font-semibold text-slate-700 dark:text-slate-200">Requested by:</span> {application.requestedBy}</div>
              <div><span className="font-semibold text-slate-700 dark:text-slate-200">Submitted:</span> {application.submittedAt}</div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleChangeStatus(application.id, 'Approved')}
                disabled={application.status !== 'Pending'}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                <Check className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => handleChangeStatus(application.id, 'Rejected')}
                disabled={application.status !== 'Pending'}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 text-white px-4 py-2 text-sm font-semibold hover:bg-rose-400 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-sm text-slate-500">
        <div className="font-semibold text-slate-800 dark:text-slate-100">Admissions workflow</div>
        <p className="mt-2">As principal or super admin, you can approve pending applications, see which class was requested, and reject any application that needs revision.</p>
      </div>
    </div>
  );
};
