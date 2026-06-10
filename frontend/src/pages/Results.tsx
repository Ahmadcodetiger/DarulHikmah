import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Award, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { RESULTS_ACCESS_ROLES, hasRole } from '../lib/permissions';
import { Unauthorized } from '../components/Unauthorized';

export const Results = ({ user }: { user: any }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('term-1');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const [students, setStudents] = useState<any[]>([]);
  const [scores, setScores] = useState<{ [studentId: string]: {
    firstTest: number;
    secondTest: number;
    assignment: number;
    project: number;
    exam: number;
  }}>({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const hasResultsAccess = hasRole(user?.role, RESULTS_ACCESS_ROLES);
  if (!hasResultsAccess) {
    return <Unauthorized pageName="Exam Scores" />;
  }

  useEffect(() => {
    const fetchInitial = async () => {
      const classList = await api.classes.list();
      setClasses(classList);
      if (classList.length > 0) {
        setSelectedClass(classList[0].id);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    
    const fetchClassDetails = async () => {
      setLoading(true);
      try {
        const subjectList = await api.classes.getSubjects(selectedClass);
        setSubjects(subjectList);
        if (subjectList.length > 0) {
          setSelectedSubject(subjectList[0].id);
        } else {
          setSelectedSubject('');
        }

        const studentList = await api.classes.getStudents(selectedClass);
        setStudents(studentList);

        // Pre-fill existing grades or default to 0
        const initialScores: typeof scores = {};
        studentList.forEach((s: any) => {
          initialScores[s.id] = {
            firstTest: 0,
            secondTest: 0,
            assignment: 0,
            project: 0,
            exam: 0,
          };
        });
        
        // Let's try to pull existing results if any in localStorage to populate
        const savedResults = JSON.parse(localStorage.getItem('dh_results') || '[]');
        studentList.forEach((s: any) => {
          const matched = savedResults.find((r: any) => r.studentId === s.id && r.termId === selectedTerm);
          if (matched) {
            initialScores[s.id] = {
              firstTest: matched.firstTest || 0,
              secondTest: matched.secondTest || 0,
              assignment: matched.assignment || 0,
              project: matched.project || 0,
              exam: matched.exam || 0,
            };
          }
        });

        setScores(initialScores);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [selectedClass, selectedTerm]);

  const handleScoreChange = (studentId: string, field: string, value: string) => {
    const numericValue = Math.min(
      field === 'exam' ? 60 : 10, // Max validation rules: Exam is 60, CAs are 10
      Math.max(0, parseFloat(value) || 0)
    );

    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numericValue,
      },
    }));
  };

  const getComputedTotalAndGrade = (studentId: string) => {
    const s = scores[studentId] || { firstTest: 0, secondTest: 0, assignment: 0, project: 0, exam: 0 };
    const total = s.firstTest + s.secondTest + s.assignment + s.project + s.exam;
    
    // Default to secondary WAEC grading
    let grade = 'F9';
    let color = 'text-rose-600 bg-rose-50';
    if (total >= 75) { grade = 'A1'; color = 'text-emerald-700 bg-emerald-50'; }
    else if (total >= 70) { grade = 'B2'; color = 'text-teal-700 bg-teal-50'; }
    else if (total >= 65) { grade = 'B3'; color = 'text-blue-700 bg-blue-50'; }
    else if (total >= 60) { grade = 'C4'; color = 'text-indigo-700 bg-indigo-50'; }
    else if (total >= 55) { grade = 'C5'; color = 'text-purple-700 bg-purple-50'; }
    else if (total >= 50) { grade = 'C6'; color = 'text-yellow-750 bg-yellow-50'; }
    else if (total >= 45) { grade = 'D7'; color = 'text-orange-700 bg-orange-50'; }
    else if (total >= 40) { grade = 'E8'; color = 'text-amber-700 bg-amber-50'; }

    return { total, grade, color };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;

    setSaving(true);
    setMessage('');

    const scoresPayload = Object.entries(scores).map(([studentId, data]) => ({
      studentId,
      ...data,
    }));

    try {
      await api.results.recordBatch({
        subjectId: selectedSubject,
        termId: selectedTerm,
        classId: selectedClass,
        scores: scoresPayload,
      });
      setMessage('Exam results successfully registered!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setMessage('Error updating grades. Please verify data.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Configuration header */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-5 sm:p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-500" /> Enter Termly Grades & Exam Scores
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Term</label>
              <select 
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 text-sm bg-slate-50 text-slate-700 font-medium"
              >
                <option value="term-1">First Term (2025/2026)</option>
                <option value="term-2">Second Term (2025/2026)</option>
                <option value="term-3">Third Term (2025/2026)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Class</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 text-sm bg-slate-50 text-slate-700 font-medium"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Subject</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 text-sm bg-slate-50 text-slate-700 font-medium"
                disabled={subjects.length === 0}
              >
                {subjects.length > 0 ? (
                  subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))
                ) : (
                  <option value="">No Subjects Configured</option>
                )}
              </select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl w-full">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>Max Marks: CA Components (10 each), Exam (60). Total: 100.</span>
              </div>
            </div>
          </div>

          {message && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm animate-fade-in">
              <Save className="w-5 h-5" />
              <span>{message}</span>
            </div>
          )}

          {/* Scores matrix list */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-xs font-semibold uppercase tracking-wider">Loading grade logs...</p>
            </div>
          ) : students.length > 0 && selectedSubject ? (
            <div className="space-y-6">
              <div className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-1/4">Student Name</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Test 1 (10)</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Test 2 (10)</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Assign. (10)</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Project (10)</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Exam (60)</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Total (100)</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {students.map((student) => {
                        const current = scores[student.id] || { firstTest: 0, secondTest: 0, assignment: 0, project: 0, exam: 0 };
                        const calc = getComputedTotalAndGrade(student.id);
                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-800 text-sm">
                              {student.lastName}, {student.firstName}
                              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{student.admissionNo}</span>
                            </td>
                            <td className="p-4 text-center">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={current.firstTest || ''}
                                onChange={(e) => handleScoreChange(student.id, 'firstTest', e.target.value)}
                                className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-200 text-center outline-none focus:border-indigo-500 text-sm font-semibold text-slate-700 bg-slate-50/30"
                              />
                            </td>
                            <td className="p-4 text-center">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={current.secondTest || ''}
                                onChange={(e) => handleScoreChange(student.id, 'secondTest', e.target.value)}
                                className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-200 text-center outline-none focus:border-indigo-500 text-sm font-semibold text-slate-700 bg-slate-50/30"
                              />
                            </td>
                            <td className="p-4 text-center">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={current.assignment || ''}
                                onChange={(e) => handleScoreChange(student.id, 'assignment', e.target.value)}
                                className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-200 text-center outline-none focus:border-indigo-500 text-sm font-semibold text-slate-700 bg-slate-50/30"
                              />
                            </td>
                            <td className="p-4 text-center">
                              <input
                                type="number"
                                min="0"
                                max="10"
                                value={current.project || ''}
                                onChange={(e) => handleScoreChange(student.id, 'project', e.target.value)}
                                className="w-16 px-2.5 py-1.5 rounded-xl border border-slate-200 text-center outline-none focus:border-indigo-500 text-sm font-semibold text-slate-700 bg-slate-50/30"
                              />
                            </td>
                            <td className="p-4 text-center">
                              <input
                                type="number"
                                min="0"
                                max="60"
                                value={current.exam || ''}
                                onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                                className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 text-center outline-none focus:border-indigo-500 text-sm font-bold text-slate-800 bg-slate-50/30"
                              />
                            </td>
                            <td className="p-4 text-center text-sm font-extrabold text-slate-800">
                              {calc.total}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${calc.color}`}>
                                {calc.grade}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm cursor-pointer"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Registering...' : 'Save Term Results'}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              Please configure class and subject above to display scoring logs.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
