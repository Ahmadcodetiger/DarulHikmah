import { Request, Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../middlewares/auth';
import { Section } from '@prisma/client';

// Helper to determine Grade and Remark based on Score and Class Section
const getGradeAndRemark = (score: number, section: Section) => {
  if (section === 'NURSERY' || section === 'PRIMARY') {
    if (score >= 90) return { grade: 'A+', remark: 'Outstanding' };
    if (score >= 80) return { grade: 'A', remark: 'Excellent' };
    if (score >= 70) return { grade: 'B', remark: 'Very Good' };
    if (score >= 60) return { grade: 'C', remark: 'Good' };
    if (score >= 50) return { grade: 'D', remark: 'Pass' };
    return { grade: 'F', remark: 'Fail' };
  } else {
    // Secondary WAEC system
    if (score >= 75) return { grade: 'A1', remark: 'Excellent' };
    if (score >= 70) return { grade: 'B2', remark: 'Very Good' };
    if (score >= 65) return { grade: 'B3', remark: 'Good' };
    if (score >= 60) return { grade: 'C4', remark: 'Credit' };
    if (score >= 55) return { grade: 'C5', remark: 'Credit' };
    if (score >= 50) return { grade: 'C6', remark: 'Credit' };
    if (score >= 45) return { grade: 'D7', remark: 'Pass' };
    if (score >= 40) return { grade: 'E8', remark: 'Pass' };
    return { grade: 'F9', remark: 'Fail' };
  }
};

// Record/Update batch results for a subject
export const recordBatchResults = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, termId, classId, scores } = req.body;
    // scores: Array<{ studentId: string, firstTest?: number, secondTest?: number, assignment?: number, project?: number, exam?: number }>

    if (!subjectId || !termId || !classId || !scores || !Array.isArray(scores)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get subject and class section
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: { class: true },
    });

    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    
    const section = subject.class.section;

    const upsertPromises = scores.map(async (scoreData: any) => {
      const firstTest = scoreData.firstTest || 0;
      const secondTest = scoreData.secondTest || 0;
      const assignment = scoreData.assignment || 0;
      const project = scoreData.project || 0;
      const exam = scoreData.exam || 0;

      const totalScore = firstTest + secondTest + assignment + project + exam;
      const { grade, remark } = getGradeAndRemark(totalScore, section);

      return prisma.result.upsert({
        where: {
          studentId_subjectId_termId: {
            studentId: scoreData.studentId,
            subjectId,
            termId,
          },
        },
        update: {
          firstTest,
          secondTest,
          assignment,
          project,
          exam,
          totalScore,
          grade,
          remark,
        },
        create: {
          studentId: scoreData.studentId,
          subjectId,
          termId,
          firstTest,
          secondTest,
          assignment,
          project,
          exam,
          totalScore,
          grade,
          remark,
        },
      });
    });

    await Promise.all(upsertPromises);

    res.status(200).json({ message: 'Results updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record results' });
  }
};

// Fetch results for a class, subject, and term
export const getSubjectResults = async (req: Request, res: Response) => {
  try {
    const { subjectId, termId } = req.query;

    if (!subjectId || !termId) {
      return res.status(400).json({ error: 'subjectId and termId are required' });
    }

    const results = await prisma.result.findMany({
      where: {
        subjectId: subjectId as string,
        termId: termId as string,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNo: true,
          },
        },
      },
    });

    res.status(200).json({ data: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch subject results' });
  }
};

// Generate Compiled Report Card Data for a student
export const getStudentReportCard = async (req: Request, res: Response) => {
  try {
    const { studentId, termId } = req.query;

    if (!studentId || !termId) {
      return res.status(400).json({ error: 'studentId and termId are required' });
    }

    // 1. Fetch Student, Active Enrollment & Class
    const student = await prisma.student.findUnique({
      where: { id: studentId as string },
      include: {
        parent: {
          select: { firstName: true, lastName: true, user: { select: { phone: true, email: true } } },
        },
      },
    });

    if (!student) return res.status(404).json({ error: 'Student not found' });

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: studentId as string,
        termId: termId as string,
      },
      include: {
        class: {
          include: {
            subjects: true,
            teacher: true,
          },
        },
        term: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!enrollment) return res.status(404).json({ error: 'No active enrollment for this term' });

    const activeClass = enrollment.class;
    const term = enrollment.term;

    // 2. Fetch all student results for this term
    const studentResults = await prisma.result.findMany({
      where: {
        studentId: studentId as string,
        termId: termId as string,
      },
      include: {
        subject: true,
      },
    });

    // 3. Get all students enrolled in this class to calculate rank and average
    const classEnrollments = await prisma.enrollment.findMany({
      where: {
        classId: activeClass.id,
        termId: termId as string,
      },
      select: {
        studentId: true,
      },
    });

    const classStudentIds = classEnrollments.map((e) => e.studentId);

    // Fetch all results for all students in this class for calculations
    const allClassResults = await prisma.result.findMany({
      where: {
        studentId: { in: classStudentIds },
        termId: termId as string,
      },
    });

    // Calculate subject-level stats (averages and positions)
    const subjectStats = studentResults.map((resObj) => {
      const subjectResults = allClassResults.filter((r) => r.subjectId === resObj.subjectId);
      const totalScores = subjectResults.map((r) => r.totalScore || 0);
      
      const average = totalScores.reduce((acc, curr) => acc + curr, 0) / (totalScores.length || 1);
      const max = Math.max(...totalScores, 0);
      const min = Math.min(...totalScores, 0);

      // Subject Rank: Sort scores descending and find position
      const sortedScores = [...totalScores].sort((a, b) => b - a);
      const rank = sortedScores.indexOf(resObj.totalScore || 0) + 1;

      return {
        subjectId: resObj.subjectId,
        subjectName: resObj.subject.name,
        firstTest: resObj.firstTest,
        secondTest: resObj.secondTest,
        assignment: resObj.assignment,
        project: resObj.project,
        exam: resObj.exam,
        totalScore: resObj.totalScore,
        grade: resObj.grade,
        remark: resObj.remark,
        classAverage: parseFloat(average.toFixed(2)),
        classMax: max,
        classMin: min,
        subjectRank: rank,
      };
    });

    // 4. Calculate overall class position
    const studentTotals = classStudentIds.map((sId) => {
      const studentRes = allClassResults.filter((r) => r.studentId === sId);
      const total = studentRes.reduce((acc, curr) => acc + (curr.totalScore || 0), 0);
      const avg = total / (studentRes.length || 1);
      return { studentId: sId, total, average: avg };
    });

    // Sort students by total score to find overall rank
    studentTotals.sort((a, b) => b.total - a.total);
    const overallPosition = studentTotals.findIndex((s) => s.studentId === studentId) + 1;
    const currentStudentTotals = studentTotals.find((s) => s.studentId === studentId);

    // 5. Fetch attendance summaries
    const presentCount = await prisma.attendance.count({
      where: {
        studentId: studentId as string,
        status: 'PRESENT',
      },
    });

    const absentCount = await prisma.attendance.count({
      where: {
        studentId: studentId as string,
        status: 'ABSENT',
      },
    });

    res.status(200).json({
      data: {
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          admissionNo: student.admissionNo,
          passportUrl: student.passportUrl,
        },
        class: {
          id: activeClass.id,
          name: activeClass.name,
          section: activeClass.section,
          classTeacher: activeClass.teacher ? `${activeClass.teacher.firstName} ${activeClass.teacher.lastName}` : 'N/A',
        },
        term: {
          id: term.id,
          name: term.name,
          session: term.session.name,
        },
        results: subjectStats,
        summary: {
          totalObtained: currentStudentTotals?.total || 0,
          totalObtainable: studentResults.length * 100,
          average: currentStudentTotals ? parseFloat(currentStudentTotals.average.toFixed(2)) : 0,
          classPosition: overallPosition,
          totalStudentsInClass: classStudentIds.length,
          attendance: {
            present: presentCount,
            absent: absentCount,
            totalDays: presentCount + absentCount,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report card data' });
  }
};
