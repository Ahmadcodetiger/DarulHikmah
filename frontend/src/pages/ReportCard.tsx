import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Printer, RefreshCw, FileText, ChevronRight } from 'lucide-react';

export const ReportCard = (_props: { user?: any }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('term-1');
  const [reportCardData, setReportCardData] = useState<any>(null);
  
  const [fetchingReport, setFetchingReport] = useState(false);

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
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const handleFetchReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedTerm) return;
    setFetchingReport(true);
    try {
      const data = await api.results.getReportCard(selectedStudent, selectedTerm);
      setReportCardData(data);
    } catch (err) {
      console.error(err);
      alert('Could not compile report card. Ensure grade scores are registered.');
    } finally {
      setFetchingReport(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper for rendering position suffix (e.g. 1st, 2nd, 3rd)
  const getOrdinalSuffix = (num: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 print:p-0 print:m-0 print:bg-white">
      {/* Configuration controls - hidden on print */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-5 sm:p-6 shadow-xs print:hidden">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-rose-500" /> Compile Termly Report Card
        </h2>

        <form onSubmit={handleFetchReport} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-end">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-rose-500 text-sm bg-slate-50 text-slate-700 font-medium"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-rose-500 text-sm bg-slate-50 text-slate-700 font-medium"
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none focus:border-rose-500 text-sm bg-slate-50 text-slate-700 font-medium"
            >
              <option value="term-1">First Term (2025/2026)</option>
              <option value="term-2">Second Term (2025/2026)</option>
              <option value="term-3">Third Term (2025/2026)</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={fetchingReport || !selectedStudent}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              {fetchingReport ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Compile Report'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Report Card Sheet Render */}
      {reportCardData ? (
        <div className="space-y-6">
          {/* Print button container - hidden on print */}
          <div className="flex justify-end print:hidden">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              Print Report Sheet
            </button>
          </div>

          {/* Academic Sheet */}
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-4 sm:p-8 md:p-12 shadow-md max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-6 mb-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-3xl font-extrabold shadow-md mb-3">
                DH
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">DARUL HIKMAH SCIENCE & TECH ACADEMY</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Motto: Knowledge, Science and Taqwa</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Sokoto Road, Sokoto State, Nigeria | contact@darulhikmah.edu.ng</p>
              <div className="mt-4 bg-slate-900 text-white text-xs font-black tracking-widest uppercase px-5 py-1.5 rounded-full">
                ACADEMIC REPORT SHEET
              </div>
            </div>

            {/* Profile fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6 text-sm mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200/60 print:bg-white print:border-slate-300">
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Student Name:</span>
                <span className="font-extrabold text-slate-800 text-base">{reportCardData.student.lastName}, {reportCardData.student.firstName}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admission Number:</span>
                <span className="font-bold text-slate-700">{reportCardData.student.admissionNo}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Class / Arm:</span>
                <span className="font-bold text-slate-700">{reportCardData.class.name}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Period:</span>
                <span className="font-bold text-slate-700">{reportCardData.term.name} ({reportCardData.term.session})</span>
              </div>

              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Class Position:</span>
                <span className="font-extrabold text-indigo-700 text-base">
                  {getOrdinalSuffix(reportCardData.summary.classPosition)} out of {reportCardData.summary.totalStudentsInClass}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Average:</span>
                <span className="font-extrabold text-slate-800 text-base">{reportCardData.summary.average}%</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Marks Obtained:</span>
                <span className="font-bold text-slate-700">{reportCardData.summary.totalObtained} / {reportCardData.summary.totalObtainable}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attendance:</span>
                <span className="font-bold text-slate-700">
                  {reportCardData.summary.attendance.present} Present / {reportCardData.summary.attendance.totalDays} Days
                </span>
              </div>
            </div>

            {/* Academic subject table */}
            <div className="border border-slate-900 rounded-2xl overflow-hidden mb-8 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[700px] md:min-w-0">
                  <thead>
                    <tr className="bg-slate-950 text-white font-bold uppercase border-b border-slate-900">
                      <th className="p-3">Subject Title</th>
                      <th className="p-3 text-center border-l border-slate-850">T1 (10)</th>
                      <th className="p-3 text-center border-l border-slate-850">T2 (10)</th>
                      <th className="p-3 text-center border-l border-slate-850">AS (10)</th>
                      <th className="p-3 text-center border-l border-slate-850">PR (10)</th>
                      <th className="p-3 text-center border-l border-slate-850">EX (60)</th>
                      <th className="p-3 text-center border-l border-slate-850 bg-slate-900">TOT (100)</th>
                      <th className="p-3 text-center border-l border-slate-850 bg-slate-900">GRD</th>
                      <th className="p-3 text-center border-l border-slate-850">Class Avg</th>
                      <th className="p-3 text-center border-l border-slate-850">Rank</th>
                      <th className="p-3 border-l border-slate-850">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {reportCardData.results.map((r: any) => (
                      <tr key={r.subjectId} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{r.subjectName}</td>
                        <td className="p-3 text-center border-l border-slate-200">{r.firstTest}</td>
                        <td className="p-3 text-center border-l border-slate-200">{r.secondTest}</td>
                        <td className="p-3 text-center border-l border-slate-200">{r.assignment}</td>
                        <td className="p-3 text-center border-l border-slate-200">{r.project}</td>
                        <td className="p-3 text-center border-l border-slate-200">{r.exam}</td>
                        <td className="p-3 text-center border-l border-slate-300 font-extrabold text-slate-900 bg-slate-50/50">{r.totalScore}</td>
                        <td className="p-3 text-center border-l border-slate-300 font-extrabold text-slate-900 bg-slate-50/50">{r.grade}</td>
                        <td className="p-3 text-center border-l border-slate-200 font-medium text-slate-500">{r.classAverage}</td>
                        <td className="p-3 text-center border-l border-slate-200 font-bold text-slate-700">{getOrdinalSuffix(r.subjectRank)}</td>
                        <td className="p-3 border-l border-slate-200 text-slate-600 font-medium">{r.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cognitive, remarks & signatories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-xs">
              <div className="border border-slate-300 p-5 rounded-2xl">
                <h3 className="font-extrabold uppercase tracking-wide text-slate-800 mb-3 border-b pb-1.5">Cognitive & Behavior Rating</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Punctuality & Attendance:</span>
                    <span className="font-bold text-slate-800">5 / 5 (Excellent)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Neatness & Uniform:</span>
                    <span className="font-bold text-slate-800">4 / 5 (Good)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Arabic Penmanship:</span>
                    <span className="font-bold text-slate-800">4 / 5 (Good)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Qur'an Recitation / Fluency:</span>
                    <span className="font-bold text-emerald-700">5 / 5 (Excellent)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Honesty & Manners:</span>
                    <span className="font-bold text-slate-800">5 / 5 (Excellent)</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-300 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold uppercase tracking-wide text-slate-800 mb-3 border-b pb-1.5">Official Remarks</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="block font-bold text-slate-400 text-[10px] uppercase">Class Teacher Remark:</span>
                      <p className="text-slate-700 italic font-medium">"A very intelligent and well-behaved student. Abubakar has shown excellent leadership qualities in both science subjects and Tahfiz."</p>
                    </div>
                    <div>
                      <span className="block font-bold text-slate-400 text-[10px] uppercase">Principal Signature Comment:</span>
                      <p className="text-slate-700 italic font-medium">"An exemplary term result. Promoted to JSS 2."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-dashed border-slate-300 mt-12">
              <div className="text-center">
                <div className="h-8 flex items-end justify-center font-serif text-slate-400 italic">M. Yusuf</div>
                <div className="border-t border-slate-500 pt-1 text-[10px] font-bold uppercase text-slate-500">Class Teacher</div>
              </div>
              <div className="text-center">
                <div className="h-8 flex items-end justify-center text-emerald-600 font-serif italic">Approved Stamp</div>
                <div className="border-t border-slate-500 pt-1 text-[10px] font-bold uppercase text-slate-500">School Seal</div>
              </div>
              <div className="text-center">
                <div className="h-8 flex items-end justify-center font-serif text-slate-400 italic">Kabir Aliyu</div>
                <div className="border-t border-slate-500 pt-1 text-[10px] font-bold uppercase text-slate-500">Principal</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <FileText className="w-12 h-12 text-slate-300" />
          <p className="font-semibold text-slate-600">No Report compiled yet.</p>
          <p className="text-xs max-w-sm">Use the selectors above to compile the academic performance sheet for a specific pupil.</p>
        </div>
      )}
    </div>
  );
};
