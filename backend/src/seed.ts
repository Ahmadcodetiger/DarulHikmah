import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });



async function main() {
  console.log('Clearing database tables...');
  
  // Delete in dependency order
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.tahfizRecord.deleteMany();
  await prisma.result.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicSession.deleteMany();
  await prisma.resultApproval.deleteMany();
  await prisma.schoolSetting.deleteMany();
  
  // Delete user profiles and authentication accounts
  await prisma.student.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding default School Settings...');
  await prisma.schoolSetting.create({
    data: {
      name: 'Darul Hikmah Science & Tech Academy',
      shortName: 'Darul Hikmah',
      logoText: 'DH',
      address: 'Sokoto Road, Sokoto State, Nigeria',
      phone: '+234 803 123 4567',
      email: 'info@darulhikmah.edu.ng',
      session: '2025/2026',
    },
  });

  console.log('Seeding Super Admin account...');
  const hashedPassword = await bcrypt.hash('DH@SuperAdmin2025!', 10);
  await prisma.user.create({
    data: {
      email: 'superadmin@darulhikmah.edu.ng',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log('Seeding default Academic Session and Terms...');
  const session = await prisma.academicSession.create({
    data: {
      name: '2025/2026',
      isActive: true,
    },
  });

  const term1 = await prisma.term.create({
    data: {
      sessionId: session.id,
      name: 'First Term',
      isActive: true,
    },
  });
  
  await prisma.term.create({
    data: {
      sessionId: session.id,
      name: 'Second Term',
      isActive: false,
    },
  });
  
  await prisma.term.create({
    data: {
      sessionId: session.id,
      name: 'Third Term',
      isActive: false,
    },
  });

  console.log('Seeding default Class Structures...');
  const classJss = await prisma.class.create({
    data: {
      name: 'JSS 1A',
      section: 'JUNIOR_SECONDARY',
    },
  });

  const classPri = await prisma.class.create({
    data: {
      name: 'Primary 3B',
      section: 'PRIMARY',
    },
  });

  const classTahfiz = await prisma.class.create({
    data: {
      name: 'Tahfiz Class A',
      section: 'TAHFIZ',
    },
  });

  console.log('Seeding bilingual Subject Structures...');
  // JSS 1A Subjects
  await prisma.subject.createMany({
    data: [
      { name: 'Mathematics', arabicName: 'الرياضيات', classId: classJss.id },
      { name: 'Basic Science', arabicName: 'العلوم الأساسية', classId: classJss.id },
      { name: 'English Language', arabicName: 'اللغة الإنجليزية', classId: classJss.id },
      { name: 'Islamic Studies', arabicName: 'الدراسات الإسلامية', classId: classJss.id },
    ],
  });

  // Primary 3B Subjects
  await prisma.subject.createMany({
    data: [
      { name: 'Numeracy', arabicName: 'الحساب', classId: classPri.id },
      { name: 'Arabic Language', arabicName: 'اللغة العربية', classId: classPri.id },
    ],
  });

  // Tahfiz Class A Subjects
  await prisma.subject.createMany({
    data: [
      { name: 'Al-Qur\'an Karem (Hifz)', arabicName: 'القرآن الكريم ( حفظ )', classId: classTahfiz.id },
      { name: 'Al-Qur\'an (Writing)', arabicName: 'القرآن كتابة', classId: classTahfiz.id },
      { name: 'Arabic', arabicName: 'العربية', classId: classTahfiz.id },
      { name: 'Grammar VERBAL', arabicName: 'القواعد', classId: classTahfiz.id },
      { name: 'Islamic Subjects', arabicName: 'المواد الإسلامية', classId: classTahfiz.id },
    ],
  });

  console.log('Prisma Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
