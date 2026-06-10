// backend/scripts/create-super-admin.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in .env');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with PostgreSQL adapter
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

const args = process.argv.slice(2);
const getArg = (name: string) => {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return undefined;
  return args[index + 1];
};

const email = getArg('email') ?? 'superadmin@darulhikmah.edu.ng';
const password = getArg('password') ?? 'DH@SuperAdmin2025!';
const role = (getArg('role') ?? 'SUPER_ADMIN') as string;
const firstName = getArg('firstName') ?? 'Dr. Ahmed';
const lastName = getArg('lastName') ?? 'Mahmoud';

const validRoles = [
  'SUPER_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'HEAD_TEACHER',
  'TEACHER',
  'TAHFIZ_TEACHER',
  'ACCOUNTANT',
  'PARENT',
  'STUDENT',
];

if (!validRoles.includes(role)) {
  throw new Error(`Invalid role: ${role}. Valid roles: ${validRoles.join(', ')}`);
}

async function createSuperAdmin() {
  console.log('Starting admin creation...');
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check if user already exists
    console.log(`Checking if user already exists for email ${email}...`);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log('⚠️ User already exists:');
      console.log('Email:', existingUser.email);
      console.log('Role:', existingUser.role);
      console.log('Status:', existingUser.isActive ? 'Active' : 'Inactive');
      return;
    }
    
    // Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the admin user
    console.log('Creating admin user...');
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as any,
        isActive: true,
      }
    });
    
    console.log('\n✅ Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', `${firstName} ${lastName}`);
    console.log('🎭 Role:', admin.role);
    console.log('🆔 ID:', admin.id);
    console.log('📅 Created:', admin.createdAt);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️ Please save these credentials securely!');
    
  } catch (error: any) {
    console.error('\n❌ Error creating Super Admin:');
    console.error('Error details:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n💡 Database connection failed. Please check:');
      console.error('   1. Is your database running?');
      console.error('   2. Is the DATABASE_URL correct in .env file?');
      console.error('   3. Do you have the required database permissions?');
    } else if (error.code === 'P1003') {
      console.error('\n💡 Database does not exist. Run: npx prisma migrate dev');
    } else if (error.code === 'P2002') {
      console.error('\n💡 A user with this email already exists');
    }
    
    console.error('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\nDatabase connection closed.');
  }
}

// Run the script with proper error handling
createSuperAdmin()
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });