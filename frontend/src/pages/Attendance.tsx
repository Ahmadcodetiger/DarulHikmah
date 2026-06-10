import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { ATTENDANCE_ACCESS_ROLES, hasRole } from '../lib/permissions';
import { Unauthorized } from '../components/Unauthorized';
import { Calendar, Check, Save, User, CheckSquare } from 'lucide-react';

export const Attendance = ({ user }: { user: any }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('term-1'); // default to term-1
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [studentId: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const hasAttendanceAccess = hasRole(user?.role, ATTENDANCE_ACCESS_ROLES);
  if (!hasAttendanceAccess) {
    return <Unauthorized pageName="Attendance" />;
  }

  useEffect(() => {
    const fetchClasses = async () => {
      const list = await api.classes.list();
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
        
        // Initialize all as PRESENT by default
        const initialRecords: { [studentId: string]: string } = {};
        studentList.forEach((student: any) => {
          initialRecords[student.id] = 'PRESENT';
        });
        setAttendanceRecords(initialRecords);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const setAllStatus = (status: string) => {
    const updated = { ...attendanceRecords };
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceRecords(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const recordsPayload = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    try {
      await api.attendance.record(date, selectedClass, recordsPayload);
      setMessage('Attendance successfully logged for the class!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setMessage('Error submitting attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const statuses = [
    { value: 'PRESENT', label: 'Present', color: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
    { value: 'ABSENT', label: 'Absent', color: 'bg-rose-500 hover:bg-rose-600 text-white' },
    { value: 'LATE', label: 'Late', color: 'bg-amber-500 hover:bg-amber-600 text-white' },
    { value: 'EXCUSED', label: 'Excused', color: 'bg-blue-500 hover:bg-blue-600 text-white' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Control panel card */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-5 sm:p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" /> Mark Classroom Attendance
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Academic Term</label>
              <select 
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50 text-slate-700 font-medium"
              >
                <option value="term-1">First Term (2025/2026)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Class / Section</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50 text-slate-700 font-medium animate-pulse-once"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.section.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Attendance Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-emerald-500 text-sm bg-slate-50 text-slate-700 font-medium"
              />
            </div>
          </div>

          {message && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm animate-fade-in">
              <Check className="w-5 h-5" />
              <span>{message}</span>
            </div>
          )}

          {/* Student attendance matrix list */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin"></span>
              <p className="text-xs font-semibold uppercase tracking-wider">Loading student list...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="space-y-6">
              {/* Batch shortcuts */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-150">
                <span className="text-xs text-slate-500 font-semibold">
                  Class Size: <strong className="text-slate-800">{students.length} students</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAllStatus('PRESENT')}
                    className="px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-emerald-150"
                  >
                    <CheckSquare className="w-4 h-4" /> All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllStatus('ABSENT')}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-rose-150"
                  >
                    All Absent
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student Profile</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Admission No</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Gender</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Status Selection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {students.map((student) => {
                        const currentStatus = attendanceRecords[student.id] || 'PRESENT';
                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                <User className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-800 text-sm">
                                {student.lastName}, {student.firstName}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 font-semibold text-xs">{student.admissionNo}</td>
                            <td className="p-4 text-slate-500 font-medium text-xs">{student.gender}</td>
                            <td className="p-4 text-right">
                              <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
                                {statuses.map((st) => {
                                  const active = currentStatus === st.value;
                                  return (
                                    <button
                                      key={st.value}
                                      type="button"
                                      onClick={() => handleStatusChange(student.id, st.value)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                                        active 
                                          ? st.color + ' shadow-xs' 
                                          : 'text-slate-400 hover:text-slate-700'
                                      }`}
                                    >
                                      {st.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit section */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm cursor-pointer"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Submit Attendance'}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              No students enrolled in this class yet.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
