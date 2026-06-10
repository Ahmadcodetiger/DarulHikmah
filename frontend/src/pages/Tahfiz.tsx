import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { BookOpen, Calendar, Star, Plus, Check } from 'lucide-react';
import { TAHFIZ_RECORD_ROLES, TAHFIZ_VIEW_ROLES, hasRole } from '../lib/permissions';
import { Unauthorized } from '../components/Unauthorized';

export const Tahfiz = ({ user }: { user: any }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sabak, setSabak] = useState('');
  const [sabaqi, setSabaqi] = useState('');
  const [manzil, setManzil] = useState('');
  const [fluency, setFluency] = useState(5);
  const [accuracy, setAccuracy] = useState(5);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const canViewTahfiz = hasRole(user?.role, TAHFIZ_VIEW_ROLES);
  const canRecordTahfiz = hasRole(user?.role, TAHFIZ_RECORD_ROLES);

  if (!canViewTahfiz) {
    return <Unauthorized pageName="Tahfiz Tracking" />;
  }

  useEffect(() => {
    const fetchClasses = async () => {
      const list = await api.classes.list();
      // filter to classes that have tahfiz section, or just use all for the MVP demo
      setClasses(list);
      if (list.length > 0) {
        setSelectedClass(list[0].id);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const studentList = await api.classes.getStudents(selectedClass);
        setStudents(studentList);
        if (studentList.length > 0) {
          setSelectedStudent(studentList[0].id);
        } else {
          setSelectedStudent('');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const loadHistory = async () => {
    if (!selectedStudent) return;
    try {
      const records = await api.tahfiz.getStudentHistory(selectedStudent);
      // Sort records by date descending
      records.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(records);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedStudent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !canRecordTahfiz) return;
    setSaving(true);
    setMessage('');

    try {
      await api.tahfiz.record({
        studentId: selectedStudent,
        date,
        sabak,
        sabaqi,
        manzil,
        fluencyRating: fluency,
        accuracyRating: accuracy,
      });

      setMessage('Memorization record logged successfully!');
      setSabak('');
      setSabaqi('');
      setManzil('');
      loadHistory();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setMessage('Error logging recitation progress.');
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating: number, onSelect?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onSelect && onSelect(star)}
            className={`transition-colors p-0.5 ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <Star className={`w-4.5 h-4.5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Selector Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-5 sm:p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" /> Tahfiz / Hifz Progress Board
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50 text-slate-700 font-medium"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50 text-slate-700 font-medium"
              disabled={students.length === 0}
            >
              {students.length > 0 ? (
                students.map((s) => (
                  <option key={s.id} value={s.id}>{s.lastName}, {s.firstName} ({s.admissionNo})</option>
                ))
              ) : (
                <option value="">No Students</option>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-850 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" /> Record Daily Recitation
          </h3>

          {message && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold">
              <Check className="w-4 h-4" />
              <span>{message}</span>
            </div>
          )}

{canRecordTahfiz ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recitation Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50 text-slate-700 font-medium"
                    />
                  </div>
                </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sabak (New Memorization)</label>
              <input
                type="text"
                placeholder="e.g. Surah An-Naba v.1-15"
                value={sabak}
                onChange={(e) => setSabak(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm text-slate-850"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sabaqi (Recent Chapters Revision)</label>
              <input
                type="text"
                placeholder="e.g. Surah Al-Mursalat"
                value={sabaqi}
                onChange={(e) => setSabaqi(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm text-slate-850"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Manzil (Overall Revision)</label>
              <input
                type="text"
                placeholder="e.g. Juz 29"
                value={manzil}
                onChange={(e) => setManzil(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm text-slate-850"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Fluency Rating</label>
                {renderStars(fluency, setFluency)}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Accuracy / Tajweed</label>
                {renderStars(accuracy, setAccuracy)}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !selectedStudent}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm cursor-pointer mt-4"
            >
              {saving ? 'Logging...' : 'Log Progress'}
            </button>
          </form>
        ) : (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 text-sm font-semibold">
            Only Tahfiz teachers and school administrators may record memorization progress here. You can still view existing student history below.
          </div>
        )}
        </div>

        {/* Progress Timeline */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-6 flex flex-col">
          <h3 className="text-base font-bold text-slate-850">Memorization Progress Log</h3>
          
          {loading ? (
            <div className="flex-1 py-12 flex flex-col items-center justify-center gap-2.5 text-slate-400">
              <span className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin"></span>
              <p className="text-xs font-bold">Syncing tracker history...</p>
            </div>
          ) : history.length > 0 ? (
            <div className="flex-1 overflow-y-auto max-h-[460px] pr-2 space-y-6">
              {history.map((record) => (
                <div key={record.id} className="relative pl-6 border-l-2 border-slate-100 last:border-0 pb-1">
                  {/* Timeline dot */}
                  <div className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></div>
                  
                  <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl space-y-3 hover:bg-slate-100/35 transition-colors">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {record.date}
                      </span>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Fluency:</span>
                          {renderStars(record.fluencyRating)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Accuracy:</span>
                          {renderStars(record.accuracyRating)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium border-t border-slate-200 pt-3">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sabak:</span>
                        <span className="text-slate-800 font-bold">{record.sabak || 'None'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sabaqi:</span>
                        <span className="text-slate-800 font-semibold">{record.sabaqi || 'None'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Manzil:</span>
                        <span className="text-slate-800 font-semibold">{record.manzil || 'None'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <BookOpen className="w-10 h-10 text-slate-355" />
              <p className="font-semibold text-slate-500">No logs for this student yet.</p>
              <p className="text-xs max-w-xs">Memorization timelines will appear here once you log their daily recitation logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
