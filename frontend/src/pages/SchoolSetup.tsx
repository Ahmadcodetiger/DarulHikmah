import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { SCHOOL_SETUP_ROLES, hasRole } from '../lib/permissions';
import { Unauthorized } from '../components/Unauthorized';
import { BookOpen, Plus, Users, Layers, Pencil } from 'lucide-react';

export const SchoolSetup = ({ user }: { user?: any }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSection, setNewClassSection] = useState('PRIMARY');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const canManageStructure = hasRole(user?.role, SCHOOL_SETUP_ROLES);

  const selectedClass = classes.find((cls) => cls.id === selectedClassId);

  useEffect(() => {
    const loadClasses = async () => {
      const list = await api.classes.list();
      setClasses(list);
      if (list.length > 0) setSelectedClassId(list[0].id);
    };
    loadClasses();
  }, []);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const section = selectedClass?.section || newClassSection;
        const staffList = await api.staff.list(section);
        setTeachers(staffList);
      } catch (error) {
        console.error('Failed to load teachers', error);
      }
    };
    loadTeachers();
  }, [selectedClass?.section, newClassSection]);

  useEffect(() => {
    if (!selectedClassId) return;
    const loadSubjects = async () => {
      const list = await api.classes.getSubjects(selectedClassId);
      setSubjects(list);
    };
    loadSubjects();
  }, [selectedClassId]);

  if (!canManageStructure) {
    return <Unauthorized pageName="School Setup" />;
  }

  const getTeacherLabel = (teacher: any) => {
    if (!teacher) return 'Unassigned';
    if (typeof teacher === 'object') {
      return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Unassigned';
    }
    return teacher;
  };

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;
    setLoading(true);

    try {
      const teacher = teachers.find((t) => t.id === selectedTeacherId);
      const createdClass = await api.classes.create({
        name: newClassName.trim(),
        section: newClassSection,
        teacherId: selectedTeacherId || null
      });

      const classWithTeacher = {
        ...createdClass,
        teacher: createdClass.teacher || (teacher ? teacher : (teacherName.trim() || 'Unassigned')),
        subjects: createdClass.subjects ?? []
      };

      setClasses((prev) => [...prev, classWithTeacher]);
      setNewClassName('');
      setTeacherName('');
      setSelectedTeacherId('');
      setSelectedClassId(createdClass.id);
    } catch (error) {
      console.error('Could not create class', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !selectedClassId) return;
    setLoading(true);

    try {
      const createdSubject = await api.classes.createSubject({
        name: newSubjectName.trim(),
        classId: selectedClassId
      });

      setSubjects((prev) => [...prev, createdSubject]);
      setNewSubjectName('');
    } catch (error) {
      console.error('Could not create subject', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedClassId) return;

    if (!selectedTeacherId && !teacherName.trim()) {
      return;
    }

    setLoading(true);
    try {
      if (selectedTeacherId) {
        const updatedClass = await api.classes.update({
          classId: selectedClassId,
          teacherId: selectedTeacherId
        });

        setClasses((prev) => prev.map((cls) => (
          cls.id === selectedClassId ? updatedClass : cls
        )));
      } else {
        setClasses((prev) => prev.map((cls) => (
          cls.id === selectedClassId ? { ...cls, teacher: teacherName.trim() } : cls
        )));
      }
    } catch (error) {
      console.error('Could not assign teacher', error);
    } finally {
      setLoading(false);
      setTeacherName('');
      setSelectedTeacherId('');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Layers className="w-6 h-6 text-emerald-500" /> School Structure Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create classes, assign subjects and teachers, and maintain school setup data from one central page.</p>
        </div>
        <div className="rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">
          Classes managed: {classes.length}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Classes & Teachers</h2>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="New class name"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                />
                <select
                  value={newClassSection}
                  onChange={(e) => setNewClassSection(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                >
                  <option value="NURSERY">Nursery</option>
                  <option value="PRIMARY">Primary</option>
                  <option value="JUNIOR_SECONDARY">Junior Secondary</option>
                  <option value="SENIOR_SECONDARY">Senior Secondary</option>
                  <option value="ISLAMIC">Islamic</option>
                  <option value="TAHFIZ">Tahfiz</option>
                </select>
                <div className="space-y-2">
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setSelectedTeacherId(selectedId);
                      const teacher = teachers.find((t) => t.id === selectedId);
                      setTeacherName(teacher ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() : '');
                    }}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName ? `${teacher.firstName} ${teacher.lastName}`.trim() : teacher.fullName || teacher.email}
                      </option>
                    ))}
                  </select>
                  <input
                    value={teacherName}
                    onChange={(e) => {
                      setTeacherName(e.target.value);
                      if (selectedTeacherId) {
                        setSelectedTeacherId('');
                      }
                    }}
                    placeholder="Or enter teacher name manually"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAddClass}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <Plus className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Add class'}
                </button>
                <button
                  onClick={handleAssignTeacher}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  <Pencil className="w-4 h-4" /> Assign teacher
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-cyan-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Class list</h2>
            </div>
            <div className="space-y-3">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 transition ${cls.id === selectedClassId ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-slate-400'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{cls.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Section: {cls.section || 'Not set'}</p>
                    </div>
                    <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">{getTeacherLabel(cls.teacher)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Class subjects</h2>
            </div>
            {selectedClass ? (
              <>
                <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">Subjects assigned to <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedClass.name}</span>.</div>
                <div className="space-y-3">
                  {subjects.length > 0 ? subjects.map((subject) => (
                    <div key={subject.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-slate-700 dark:text-slate-200">
                      {subject.name}
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 px-4 py-3 text-slate-500">No subjects assigned yet.</div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <input
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="New subject name"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                  />
                  <button
                  onClick={handleAddSubject}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-3 text-sm font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                    <Plus className="w-4 h-4" /> {loading ? 'Saving...' : 'Add subject'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400">Select a class to see assigned subjects and add new ones.</div>
            )}
          </div>

          <div className="rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-sm text-slate-500">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Setup notes</p>
            <p className="mt-2">Principal and school leaders can use this page to build class groups, assign teachers, and configure subjects for each cohort.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
