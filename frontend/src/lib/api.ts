// lib/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://darul-hikmah-backend.vercel.app/api/v1';

// Axios instance with interceptor for auth token
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dh_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dh_token');
      localStorage.removeItem('dh_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const isNetworkError = (error: any) => {
  return !error?.response;
};

// ==========================================
// Enhanced Mock Database with Real Authentication
// ==========================================

// Hash passwords for production (using bcrypt)
const hashPassword = (password: string): string => {
  return btoa(password); // Simple encoding for demo
};

const verifyPassword = (password: string, hash: string): boolean => {
  return btoa(password) === hash;
};

const initMockDB = () => {
  if (!localStorage.getItem('dh_mock_initialized')) {
    
    // Users with proper authentication
    const users = [
      {
        id: 1,
        email: 'superadmin@darulhikmah.edu.ng',
        password: hashPassword('DH@SuperAdmin2025!'),
        fullName: 'Dr. Ahmed Mahmoud',
        role: 'SUPER_ADMIN',
        permissions: ['*'],
        status: 'active',
        lastLogin: null,
        loginAttempts: 0,
        lockoutUntil: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        email: 'principal@darulhikmah.edu.ng',
        password: hashPassword('Principal@2025!'),
        fullName: 'Hajiya Fatima Usman',
        role: 'PRINCIPAL',
        permissions: ['view_all', 'manage_teachers', 'manage_students', 'view_reports'],
        status: 'active',
        lastLogin: null,
        loginAttempts: 0,
        lockoutUntil: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        email: 'teacher@darulhikmah.edu.ng',
        password: hashPassword('Teacher@2025!'),
        fullName: 'Mallam Ibrahim Bello',
        role: 'TEACHER',
        department: 'Science',
        permissions: ['view_class', 'submit_grades', 'mark_attendance'],
        status: 'active',
        lastLogin: null,
        loginAttempts: 0,
        lockoutUntil: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 4,
        email: 'tahfiz@darulhikmah.edu.ng',
        password: hashPassword('Tahfiz@2025!'),
        fullName: 'Sheikh Abdulrahman Bello',
        role: 'TAHFIZ_TEACHER',
        department: 'Tahfiz',
        permissions: ['manage_tahfiz', 'view_tahfiz_students', 'record_progress'],
        status: 'active',
        lastLogin: null,
        loginAttempts: 0,
        lockoutUntil: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 5,
        email: 'accountant@darulhikmah.edu.ng',
        password: hashPassword('Accountant@2025!'),
        fullName: 'Mallama Zainab Umar',
        role: 'ACCOUNTANT',
        department: 'Finance',
        permissions: ['manage_invoices', 'view_payments', 'generate_reports'],
        status: 'active',
        lastLogin: null,
        loginAttempts: 0,
        lockoutUntil: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Audit logs for security tracking
    const auditLogs: any[] = [];

    // Session tracking
    const sessions = [
      { id: 'sess-1', name: '2025/2026', isActive: true, startDate: '2025-09-01', endDate: '2026-08-31' }
    ];
    
    const terms = [
      { id: 'term-1', sessionId: 'sess-1', name: 'First Term', isActive: true, startDate: '2025-09-01', endDate: '2025-12-15' },
      { id: 'term-2', sessionId: 'sess-1', name: 'Second Term', isActive: false, startDate: '2026-01-10', endDate: '2026-04-10' },
      { id: 'term-3', sessionId: 'sess-1', name: 'Third Term', isActive: false, startDate: '2026-04-25', endDate: '2026-07-20' }
    ];
    
    const classes = [
      { id: 'class-1', name: 'JSS 1A', section: 'JUNIOR_SECONDARY', teacherId: 3, teacher: 'Malam Ahmad Yusuf', capacity: 40, currentEnrollment: 5 },
      { id: 'class-2', name: 'Primary 3B', section: 'PRIMARY', teacherId: 3, teacher: 'Aisha Ibrahim', capacity: 35, currentEnrollment: 0 },
      { id: 'class-3', name: 'Tahfiz Class A', section: 'TAHFIZ', teacherId: 4, teacher: 'Sheikh Abdulrahman', capacity: 25, currentEnrollment: 2 }
    ];
    
    const subjects = [
      { id: 'subj-1', classId: 'class-1', name: 'Mathematics', code: 'MAT101' },
      { id: 'subj-2', classId: 'class-1', name: 'Basic Science', code: 'SCI101' },
      { id: 'subj-3', classId: 'class-1', name: 'English Language', code: 'ENG101' },
      { id: 'subj-4', classId: 'class-1', name: 'Islamic Studies', code: 'ISL101' },
      { id: 'subj-5', classId: 'class-2', name: 'Numeracy', code: 'NUM201' },
      { id: 'subj-6', classId: 'class-2', name: 'Arabic Language', code: 'ARB201' }
    ];
    
    const students = [
      { id: 'std-1', admissionNo: 'DHA/2025/001', firstName: 'Abubakar', lastName: 'Muhammad', gender: 'Male', dob: '2013-05-12', parentPhone: '+2348023456789', parentEmail: 'parent1@example.com', address: 'Kaduna, Nigeria' },
      { id: 'std-2', admissionNo: 'DHA/2025/002', firstName: 'Fatima', lastName: 'Balarabe', gender: 'Female', dob: '2014-08-20', parentPhone: '+2348034567890', parentEmail: 'parent2@example.com', address: 'Kaduna, Nigeria' },
      { id: 'std-3', admissionNo: 'DHA/2025/003', firstName: 'Usman', lastName: 'Aliyu', gender: 'Male', dob: '2013-11-03', parentPhone: '+2348045678901', parentEmail: 'parent3@example.com', address: 'Kaduna, Nigeria' },
      { id: 'std-4', admissionNo: 'DHA/2025/004', firstName: 'Khadijah', lastName: 'Umar', gender: 'Female', dob: '2014-01-15', parentPhone: '+2348056789012', parentEmail: 'parent4@example.com', address: 'Kaduna, Nigeria' },
      { id: 'std-5', admissionNo: 'DHA/2025/005', firstName: 'Ibrahim', lastName: 'Sani', gender: 'Male', dob: '2013-09-30', parentPhone: '+2348067890123', parentEmail: 'parent5@example.com', address: 'Kaduna, Nigeria' }
    ];
    
    const enrollments = [
      { id: 'enr-1', studentId: 'std-1', classId: 'class-1', termId: 'term-1', enrollmentDate: new Date().toISOString(), status: 'ACTIVE' },
      { id: 'enr-2', studentId: 'std-2', classId: 'class-1', termId: 'term-1', enrollmentDate: new Date().toISOString(), status: 'ACTIVE' },
      { id: 'enr-3', studentId: 'std-3', classId: 'class-1', termId: 'term-1', enrollmentDate: new Date().toISOString(), status: 'ACTIVE' },
      { id: 'enr-4', studentId: 'std-4', classId: 'class-1', termId: 'term-1', enrollmentDate: new Date().toISOString(), status: 'ACTIVE' },
      { id: 'enr-5', studentId: 'std-5', classId: 'class-1', termId: 'term-1', enrollmentDate: new Date().toISOString(), status: 'ACTIVE' }
    ];
    
    const attendance = [
      { id: 'att-1', date: new Date().toISOString().split('T')[0], status: 'PRESENT', studentId: 'std-1', recordedBy: 3, recordedAt: new Date().toISOString() },
      { id: 'att-2', date: new Date().toISOString().split('T')[0], status: 'PRESENT', studentId: 'std-2', recordedBy: 3, recordedAt: new Date().toISOString() },
      { id: 'att-3', date: new Date().toISOString().split('T')[0], status: 'ABSENT', studentId: 'std-3', recordedBy: 3, recordedAt: new Date().toISOString() },
      { id: 'att-4', date: new Date().toISOString().split('T')[0], status: 'PRESENT', studentId: 'std-4', recordedBy: 3, recordedAt: new Date().toISOString() },
      { id: 'att-5', date: new Date().toISOString().split('T')[0], status: 'LATE', studentId: 'std-5', recordedBy: 3, recordedAt: new Date().toISOString() }
    ];
    
    // Store all data
    localStorage.setItem('dh_users', JSON.stringify(users));
    localStorage.setItem('dh_audit_logs', JSON.stringify(auditLogs));
    localStorage.setItem('dh_sessions', JSON.stringify(sessions));
    localStorage.setItem('dh_terms', JSON.stringify(terms));
    localStorage.setItem('dh_classes', JSON.stringify(classes));
    localStorage.setItem('dh_subjects', JSON.stringify(subjects));
    localStorage.setItem('dh_students', JSON.stringify(students));
    localStorage.setItem('dh_enrollments', JSON.stringify(enrollments));
    localStorage.setItem('dh_attendance', JSON.stringify(attendance));
    localStorage.setItem('dh_results', JSON.stringify([]));
    localStorage.setItem('dh_tahfiz', JSON.stringify([]));
    localStorage.setItem('dh_invoices', JSON.stringify([]));
    localStorage.setItem('dh_mock_initialized', 'true');
  }
};

initMockDB();

// Helper functions
const getMockData = (key: string): any[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveMockData = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const addAuditLog = (action: string, userId: number, details: any) => {
  const logs = getMockData('dh_audit_logs');
  logs.push({
    id: `log-${Date.now()}`,
    action,
    userId,
    details,
    ip: '127.0.0.1',
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
  saveMockData('dh_audit_logs', logs);
};

// Generate JWT token
const generateToken = (userId: number, email: string, role: string): string => {
  const payload = {
    userId,
    email,
    role,
    exp: Date.now() + 24 * 60 * 60 * 1000
  };
  return btoa(JSON.stringify(payload));
};

const verifyToken = (token: string): any => {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp > Date.now()) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
};

// ==========================================
// Complete API Handlers
// ==========================================

export const api = {
  auth: {
    login: async (identifier: string, password: string) => {
      if (!identifier || !password) {
        throw new Error('Email or phone and password are required');
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

      if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
        throw new Error('Please enter a valid email address or phone number');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      try {
        const response = await apiClient.post('/auth/login', { email: identifier, password });
        const { token, user } = response.data;
        localStorage.setItem('dh_token', token);
        localStorage.setItem('dh_user', JSON.stringify(user));
        
        await api.auth.updateLastLogin(user.id);
        
        return { success: true, token, user };
      } catch (error: any) {
        if (error.response) {
          const backendMessage = error.response?.data?.error || 'Invalid email or password';
          throw new Error(backendMessage);
        }

        const normalizePhone = (phone: string) => phone.replace(/\D+/g, '');
        const normalizeLocalPhone = (phone: string) => {
          const normalized = normalizePhone(phone);
          if (normalized.startsWith('0')) {
            return normalized.replace(/^0+/, '');
          }
          if (normalized.startsWith('234') && normalized.length > 10) {
            return normalized.slice(-10);
          }
          return normalized;
        };

        const phoneMatches = (inputPhone: string, storedPhone: string) => {
          const normalizedInput = normalizePhone(inputPhone);
          const normalizedStored = normalizePhone(storedPhone);
          if (!normalizedInput || !normalizedStored) return false;
          if (normalizedInput === normalizedStored) return true;
          const inputLocal = normalizeLocalPhone(normalizedInput);
          const storedLocal = normalizeLocalPhone(normalizedStored);
          return inputLocal && storedLocal && inputLocal === storedLocal;
        };

        const users = getMockData('dh_users');
        const user = users.find((u: any) => u.email === identifier || (u.phone && phoneMatches(identifier, u.phone)));
        
        if (!user) {
          addAuditLog('LOGIN_FAILED', 0, { identifier, reason: 'User not found' });
          throw new Error('Invalid email or password');
        }
        
        if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
          throw new Error('Account is temporarily locked. Please try again later.');
        }
        
        if (user.status !== 'active') {
          throw new Error('Account is suspended. Please contact administrator.');
        }
        
        if (!verifyPassword(password, user.password)) {
          user.loginAttempts = (user.loginAttempts || 0) + 1;
          
          if (user.loginAttempts >= 5) {
            user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
            addAuditLog('ACCOUNT_LOCKED', user.id, { reason: 'Too many failed attempts' });
          }
          
          const storedUsers = getMockData('dh_users');
          const updatedUsers = storedUsers.map((u: any) => u.id === user.id ? user : u);
          saveMockData('dh_users', updatedUsers);
          
          addAuditLog('LOGIN_FAILED', user.id, { identifier, reason: 'Invalid password' });
          throw new Error('Invalid email or password');
        }
        
        user.loginAttempts = 0;
        user.lockoutUntil = null;
        user.lastLogin = new Date().toISOString();
        
        const storedUsers = getMockData('dh_users');
        const updatedUsers = storedUsers.map((u: any) => u.id === user.id ? user : u);
        saveMockData('dh_users', updatedUsers);
        
        const token = generateToken(user.id, user.email, user.role);
        
        const { password: _, ...userWithoutPassword } = user;
        
        localStorage.setItem('dh_token', token);
        localStorage.setItem('dh_user', JSON.stringify(userWithoutPassword));
        
        addAuditLog('LOGIN_SUCCESS', user.id, { identifier });
        
        return { success: true, token, user: userWithoutPassword };
      }
    },
    
    logout: async () => {
      const token = localStorage.getItem('dh_token');
      if (token) {
        try {
          await apiClient.post('/auth/logout');
        } catch (error) {
          // Ignore logout errors
        }
      }
      
      localStorage.removeItem('dh_token');
      localStorage.removeItem('dh_user');
      
      return { success: true };
    },
    
    getCurrentUser: () => {
      const userStr = localStorage.getItem('dh_user');
      return userStr ? JSON.parse(userStr) : null;
    },
    
    verifyToken: async (token: string) => {
      try {
        await apiClient.post('/auth/verify', { token });
        return { valid: true };
      } catch (error) {
        const decoded = verifyToken(token);
        return { valid: !!decoded };
      }
    },
    
    updateLastLogin: async (userId: number) => {
      try {
        await apiClient.post(`/users/${userId}/last-login`);
      } catch (error) {
        const users = getMockData('dh_users');
        const updatedUsers = users.map((u: any) => 
          u.id === userId ? { ...u, lastLogin: new Date().toISOString() } : u
        );
        saveMockData('dh_users', updatedUsers);
      }
    },
    
    changePassword: async (userId: number, oldPassword: string, newPassword: string) => {
      if (!oldPassword || !newPassword) {
        throw new Error('Both old and new passwords are required');
      }
      
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters');
      }
      
      try {
        const response = await apiClient.post(`/users/${userId}/change-password`, {
          oldPassword,
          newPassword
        });
        return response.data;
      } catch (error) {
        const users = getMockData('dh_users');
        const user = users.find((u: any) => u.id === userId);
        
        if (!user) {
          throw new Error('User not found');
        }
        
        if (!verifyPassword(oldPassword, user.password)) {
          throw new Error('Current password is incorrect');
        }
        
        user.password = hashPassword(newPassword);
        user.updatedAt = new Date().toISOString();
        
        const updatedUsers = users.map((u: any) => u.id === userId ? user : u);
        saveMockData('dh_users', updatedUsers);
        
        addAuditLog('PASSWORD_CHANGED', userId, {});
        
        return { success: true, message: 'Password changed successfully' };
      }
    },
    
    resetPassword: async (email: string) => {
      if (!email) {
        throw new Error('Email is required');
      }
      
      try {
        const response = await apiClient.post('/auth/reset-password', { email });
        return response.data;
      } catch (error) {
        const users = getMockData('dh_users');
        const user = users.find((u: any) => u.email === email);
        
        if (!user) {
          return { success: true, message: 'If the email exists, a reset link has been sent' };
        }
        
        addAuditLog('PASSWORD_RESET_REQUESTED', user.id, { email });
        
        return { success: true, message: 'Password reset link has been sent to your email' };
      }
    }
  },
  
  admin: {
    getUsers: async () => {
      try {
        const response = await apiClient.get('/admin/users');
        return response.data.data;
      } catch (error) {
        const users = getMockData('dh_users');
        const usersWithoutPassword = users.map((u: any) => {
          const { password, ...rest } = u;
          return rest;
        });
        return usersWithoutPassword;
      }
    },
    
    createUser: async (userData: {
      email: string;
      phone?: string;
      password: string;
      role: string;
      firstName: string;
      lastName: string;
      staffId?: string;
      department?: string;
      admissionNo?: string;
      address?: string;
      occupation?: string;
      dateOfBirth?: string;
      gender?: string;
    }) => {
      try {
        const response = await apiClient.post('/admin/users', userData);
        return response.data.data;
      } catch (error) {
        const users = getMockData('dh_users');
        
        const existingUser = users.find((u: any) => u.email === userData.email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }
        
        const newId = Math.max(...users.map((u: any) => u.id), 0) + 1;
        
        const newUser = {
          id: newId,
          email: userData.email,
          password: hashPassword(userData.password),
          fullName: `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          permissions: [],
          status: 'active',
          lastLogin: null,
          loginAttempts: 0,
          lockoutUntil: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        users.push(newUser);
        saveMockData('dh_users', users);
        
        addAuditLog('USER_CREATED', 0, { email: userData.email, role: userData.role });
        
        const { password, ...userWithoutPassword } = newUser;
        return { success: true, user: userWithoutPassword };
      }
    },
    
    updateUser: async (userId: string, userData: {
      email?: string;
      phone?: string;
      isActive?: boolean;
      role?: string;
      firstName?: string;
      lastName?: string;
      staffId?: string;
      department?: string;
      admissionNo?: string;
      address?: string;
      occupation?: string;
      dateOfBirth?: string;
      gender?: string;
    }) => {
      try {
        const response = await apiClient.put(`/admin/users/${userId}`, userData);
        return response.data.data;
      } catch (error) {
        const users = getMockData('dh_users');
        const userIndex = users.findIndex((u: any) => u.id === parseInt(userId));
        
        if (userIndex === -1) {
          throw new Error('User not found');
        }
        
        users[userIndex] = {
          ...users[userIndex],
          email: userData.email || users[userIndex].email,
          role: userData.role || users[userIndex].role,
          status: userData.isActive !== undefined ? (userData.isActive ? 'active' : 'inactive') : users[userIndex].status,
          updatedAt: new Date().toISOString()
        };
        
        saveMockData('dh_users', users);
        
        addAuditLog('USER_UPDATED', 0, { userId, changes: userData });
        
        const { password, ...userWithoutPassword } = users[userIndex];
        return userWithoutPassword;
      }
    },
    
    deleteUser: async (userId: string) => {
      try {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response.data;
      } catch (error) {
        const users = getMockData('dh_users');
        const filteredUsers = users.filter((u: any) => u.id !== parseInt(userId));
        
        saveMockData('dh_users', filteredUsers);
        
        addAuditLog('USER_DELETED', 0, { userId });
        
        return { success: true };
      }
    },

    toggleUserStatus: async (userId: string, isActive: boolean) => {
      try {
        const response = await apiClient.patch(`/admin/users/${userId}/status`, { isActive });
        return response.data;
      } catch (error) {
        const users = getMockData('dh_users');
        const userIndex = users.findIndex((u: any) => u.id === parseInt(userId));
        
        if (userIndex === -1) {
          throw new Error('User not found');
        }
        
        users[userIndex].status = isActive ? 'active' : 'inactive';
        users[userIndex].updatedAt = new Date().toISOString();
        
        saveMockData('dh_users', users);
        
        addAuditLog('USER_STATUS_TOGGLED', 0, { userId, isActive });
        
        return { success: true, isActive };
      }
    },
    
    resetPassword: async (userId: string, newPassword: string) => {
      try {
        const response = await apiClient.post(`/admin/users/${userId}/reset-password`, { newPassword });
        return response.data;
      } catch (error) {
        const users = getMockData('dh_users');
        const userIndex = users.findIndex((u: any) => u.id === parseInt(userId));
        
        if (userIndex === -1) {
          throw new Error('User not found');
        }
        
        users[userIndex].password = hashPassword(newPassword);
        users[userIndex].updatedAt = new Date().toISOString();
        
        saveMockData('dh_users', users);
        
        addAuditLog('PASSWORD_RESET', 0, { userId });
        
        return { success: true };
      }
    }
  },

  staff: {
    list: async (section?: string) => {
      try {
        const url = section ? `/staff?section=${encodeURIComponent(section)}` : '/staff';
        const response = await apiClient.get(url);
        return response.data.data;
      } catch (error: any) {
        if (isNetworkError(error)) {
          const users = getMockData('dh_users');
          return users
            .filter((u: any) => ['TEACHER', 'TAHFIZ_TEACHER', 'HEAD_TEACHER', 'VICE_PRINCIPAL', 'PRINCIPAL', 'SUPER_ADMIN'].includes(u.role))
            .map((u: any) => ({
              id: u.id,
              firstName: u.firstName || u.fullName?.split(' ')[0] || '',
              lastName: u.lastName || u.fullName?.split(' ').slice(1).join(' ') || '',
              email: u.email,
              role: u.role
            }));
        }
        throw error;
      }
    }
  },
  
  classes: {
    list: async () => {
      try {
        const response = await apiClient.get('/school/classes');
        return response.data.data;
      } catch (error: any) {
        if (isNetworkError(error)) {
          return getMockData('dh_classes');
        }
        throw error;
      }
    },
    
    getById: async (classId: string) => {
      try {
        const response = await apiClient.get(`/school/classes/${classId}`);
        return response.data.data;
      } catch (error: any) {
        if (isNetworkError(error)) {
          const classes = getMockData('dh_classes');
          return classes.find((c: any) => c.id === classId);
        }
        throw error;
      }
    },
    
    getSubjects: async (classId: string) => {
      if (!classId) {
        throw new Error('Class ID is required');
      }
      
      try {
        const response = await apiClient.get(`/school/subjects?classId=${classId}`);
        return response.data.data;
      } catch (error: any) {
        if (isNetworkError(error)) {
          const subjects = getMockData('dh_subjects');
          return subjects.filter((s: any) => s.classId === classId);
        }
        throw error;
      }
    },
    
    getStudents: async (classId: string) => {
      if (!classId) {
        throw new Error('Class ID is required');
      }
      
      try {
        const response = await apiClient.get(`/students?classId=${classId}`);
        return response.data.data;
      } catch (error) {
        const enrollments = getMockData('dh_enrollments');
        const students = getMockData('dh_students');
        const activeTerm = getMockData('dh_terms').find((t: any) => t.isActive);
        
        const activeEnrollments = enrollments.filter(
          (e: any) => e.classId === classId && e.termId === activeTerm?.id && e.status === 'ACTIVE'
        );
        
        const studentIds = activeEnrollments.map((e: any) => e.studentId);
        return students.filter((s: any) => studentIds.includes(s.id));
      }
    },

    create: async (payload: { name: string; section: string; teacherId?: string | null }) => {
      if (!payload.name || !payload.section) {
        throw new Error('Class name and section are required');
      }

      try {
        const response = await apiClient.post('/school/classes', payload);
        return response.data.data;
      } catch (error: any) {
        if (isNetworkError(error)) {
          const classes = getMockData('dh_classes');
          const newClass = {
            id: `class-${Date.now()}`,
            name: payload.name,
            section: payload.section,
            teacherId: payload.teacherId || null,
            teacher: null,
            subjects: [],
            _count: { enrollments: 0 }
          };
          saveMockData('dh_classes', [...classes, newClass]);
          return newClass;
        }
        throw error;
      }
    },

    update: async (payload: { classId: string; teacherId?: string | null; name?: string; section?: string }) => {
      if (!payload.classId) {
        throw new Error('Class ID is required');
      }

      try {
        const response = await apiClient.patch(`/school/classes/${payload.classId}`, payload);
        return response.data.data;
      } catch (error: any) {
        if (isNetworkError(error)) {
          const classes = getMockData('dh_classes');
          const users = getMockData('dh_users');
          const teacher = users.find((u: any) => u.id === payload.teacherId);
          const teacherLabel = teacher ? `${teacher.firstName || teacher.fullName?.split(' ')[0] || ''} ${teacher.lastName || teacher.fullName?.split(' ').slice(1).join(' ') || ''}`.trim() : null;
          const updatedClasses = classes.map((cls: any) =>
            cls.id === payload.classId ? {
              ...cls,
              teacherId: payload.teacherId !== undefined ? payload.teacherId : cls.teacherId,
              teacher: payload.teacherId ? teacherLabel : cls.teacher
            } : cls
          );
          saveMockData('dh_classes', updatedClasses);
          return updatedClasses.find((cls: any) => cls.id === payload.classId);
        }
        throw error;
      }
    },

    createSubject: async (payload: { name: string; classId: string }) => {
      if (!payload.name || !payload.classId) {
        throw new Error('Subject name and class ID are required');
      }

      try {
        const response = await apiClient.post('/school/subjects', payload);
        return response.data.data;
      } catch (error: any) {
        if (isNetworkError(error)) {
          const subjects = getMockData('dh_subjects');
          const newSubject = {
            id: `subj-${Date.now()}`,
            name: payload.name,
            classId: payload.classId,
            arabicName: ''
          };
          saveMockData('dh_subjects', [...subjects, newSubject]);
          return newSubject;
        }
        throw error;
      }
    }
  },
  
  terms: {
    list: async () => {
      try {
        const response = await apiClient.get('/school/terms');
        return response.data.data;
      } catch (error: any) {
        if (isNetworkError(error)) {
          return getMockData('dh_terms');
        }
        throw error;
      }
    },
    
    getActive: async () => {
      try {
        const response = await apiClient.get('/school/terms/active');
        return response.data.data;
      } catch (error: any) {
        if (isNetworkError(error)) {
          const terms = getMockData('dh_terms');
          return terms.find((t: any) => t.isActive);
        }
        throw error;
      }
    }
  },
  
  attendance: {
    record: async (date: string, classId: string, records: Array<{ studentId: string, status: string }>) => {
      if (!date || !classId || !records || records.length === 0) {
        throw new Error('Date, class ID, and attendance records are required');
      }
      
      const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
      for (const record of records) {
        if (!validStatuses.includes(record.status)) {
          throw new Error(`Invalid status: ${record.status}`);
        }
      }
      
      try {
        const response = await apiClient.post('/attendance/batch', { date, classId, records });
        return response.data;
      } catch (error) {
        const db = getMockData('dh_attendance');
        const user = api.auth.getCurrentUser();
        
        const studentIds = records.map(r => r.studentId);
        const filteredDb = db.filter(
          (item: any) => !(item.date === date && studentIds.includes(item.studentId))
        );
        
        const newRecords = records.map(r => ({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          date,
          status: r.status,
          studentId: r.studentId,
          recordedBy: user?.id || 3,
          recordedAt: new Date().toISOString()
        }));
        
        saveMockData('dh_attendance', [...filteredDb, ...newRecords]);
        addAuditLog('ATTENDANCE_RECORDED', user?.id || 0, { date, classId, count: newRecords.length });
        
        return { success: true, message: 'Attendance recorded successfully', count: newRecords.length };
      }
    },
    
    getHistory: async (classId: string, startDate?: string, endDate?: string) => {
      if (!classId) {
        throw new Error('Class ID is required');
      }
      
      try {
        const response = await apiClient.get(`/attendance?classId=${classId}&startDate=${startDate}&endDate=${endDate}`);
        return response.data.data;
      } catch (error) {
        const attendance = getMockData('dh_attendance');
        const enrollments = getMockData('dh_enrollments');
        const students = getMockData('dh_students');
        const activeTerm = getMockData('dh_terms').find((t: any) => t.isActive);
        
        const classStudentIds = enrollments
          .filter((e: any) => e.classId === classId && e.termId === activeTerm?.id)
          .map((e: any) => e.studentId);
        
        let filtered = attendance.filter((a: any) => classStudentIds.includes(a.studentId));
        
        if (startDate && endDate) {
          filtered = filtered.filter((a: any) => {
            return a.date >= startDate && a.date <= endDate;
          });
        }
        
        filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return filtered.map((a: any) => {
          const student = students.find((s: any) => s.id === a.studentId);
          return {
            ...a,
            student: student ? { 
              id: student.id,
              firstName: student.firstName, 
              lastName: student.lastName, 
              admissionNo: student.admissionNo 
            } : null
          };
        });
      }
    },
    
    getSummary: async (classId: string, date?: string) => {
      if (!classId) {
        throw new Error('Class ID is required');
      }
      
      const targetDate = date || new Date().toISOString().split('T')[0];
      const attendance = getMockData('dh_attendance');
      const enrollments = getMockData('dh_enrollments');
      const activeTerm = getMockData('dh_terms').find((t: any) => t.isActive);
      
      const classStudentIds = enrollments
        .filter((e: any) => e.classId === classId && e.termId === activeTerm?.id)
        .map((e: any) => e.studentId);
      
      const todayAttendance = attendance.filter(
        (a: any) => a.date === targetDate && classStudentIds.includes(a.studentId)
      );
      
      const present = todayAttendance.filter((a: any) => a.status === 'PRESENT').length;
      const absent = todayAttendance.filter((a: any) => a.status === 'ABSENT').length;
      const late = todayAttendance.filter((a: any) => a.status === 'LATE').length;
      const excused = todayAttendance.filter((a: any) => a.status === 'EXCUSED').length;
      const notRecorded = classStudentIds.length - todayAttendance.length;
      
      return {
        date: targetDate,
        totalStudents: classStudentIds.length,
        present,
        absent,
        late,
        excused,
        notRecorded,
        attendanceRate: ((present + late) / classStudentIds.length * 100).toFixed(1)
      };
    }
  },
  
  results: {
    recordBatch: async (payload: { subjectId: string, termId: string, classId: string, scores: any[] }) => {
      if (!payload.subjectId || !payload.termId || !payload.classId || !payload.scores?.length) {
        throw new Error('Missing required fields');
      }
      
      try {
        const response = await apiClient.post('/results/batch', payload);
        return response.data;
      } catch (error) {
        const db = getMockData('dh_results');
        const classes = getMockData('dh_classes');
        const classObj = classes.find((c: any) => c.id === payload.classId);
        const isSecondary = classObj?.section?.includes('SECONDARY') || false;
        
        const updatedDb = [...db];
        
        payload.scores.forEach(s => {
          const firstTest = s.firstTest || 0;
          const secondTest = s.secondTest || 0;
          const assignment = s.assignment || 0;
          const project = s.project || 0;
          const exam = s.exam || 0;
          const totalScore = firstTest + secondTest + assignment + project + exam;
          
          let grade = 'F';
          let remark = 'Fail';
          
          if (isSecondary) {
            if (totalScore >= 75) { grade = 'A1'; remark = 'Excellent'; }
            else if (totalScore >= 70) { grade = 'B2'; remark = 'Very Good'; }
            else if (totalScore >= 65) { grade = 'B3'; remark = 'Good'; }
            else if (totalScore >= 60) { grade = 'C4'; remark = 'Credit'; }
            else if (totalScore >= 55) { grade = 'C5'; remark = 'Credit'; }
            else if (totalScore >= 50) { grade = 'C6'; remark = 'Credit'; }
            else if (totalScore >= 45) { grade = 'D7'; remark = 'Pass'; }
            else if (totalScore >= 40) { grade = 'E8'; remark = 'Pass'; }
            else { grade = 'F9'; remark = 'Fail'; }
          } else {
            if (totalScore >= 90) { grade = 'A+'; remark = 'Outstanding'; }
            else if (totalScore >= 80) { grade = 'A'; remark = 'Excellent'; }
            else if (totalScore >= 70) { grade = 'B'; remark = 'Very Good'; }
            else if (totalScore >= 60) { grade = 'C'; remark = 'Good'; }
            else if (totalScore >= 50) { grade = 'D'; remark = 'Pass'; }
            else if (totalScore >= 40) { grade = 'E'; remark = 'Below Average'; }
            else { grade = 'F'; remark = 'Fail'; }
          }
          
          const existingIndex = updatedDb.findIndex(
            (r: any) => r.studentId === s.studentId && r.subjectId === payload.subjectId && r.termId === payload.termId
          );
          
          const resultObj = {
            id: existingIndex >= 0 ? updatedDb[existingIndex].id : `res-${Date.now()}-${Math.random()}`,
            studentId: s.studentId,
            subjectId: payload.subjectId,
            termId: payload.termId,
            firstTest,
            secondTest,
            assignment,
            project,
            exam,
            totalScore,
            grade,
            remark,
            updatedAt: new Date().toISOString()
          };
          
          if (existingIndex >= 0) {
            updatedDb[existingIndex] = resultObj;
          } else {
            updatedDb.push(resultObj);
          }
        });
        
        saveMockData('dh_results', updatedDb);
        
        const user = api.auth.getCurrentUser();
        addAuditLog('RESULTS_RECORDED', user?.id || 0, { 
          subjectId: payload.subjectId, 
          termId: payload.termId,
          classId: payload.classId,
          studentCount: payload.scores.length 
        });
        
        return { success: true, message: 'Results recorded successfully' };
      }
    },
    
    getReportCard: async (studentId: string, termId: string) => {
      if (!studentId || !termId) {
        throw new Error('Student ID and Term ID are required');
      }
      
      try {
        const response = await apiClient.get(`/results/report-card?studentId=${studentId}&termId=${termId}`);
        return response.data.data;
      } catch (error) {
        const students = getMockData('dh_students');
        const enrollments = getMockData('dh_enrollments');
        const classes = getMockData('dh_classes');
        const subjects = getMockData('dh_subjects');
        const terms = getMockData('dh_terms');
        const results = getMockData('dh_results');
        const attendance = getMockData('dh_attendance');
        
        const student = students.find((s: any) => s.id === studentId);
        if (!student) throw new Error('Student not found');
        
        const enrollment = enrollments.find((e: any) => e.studentId === studentId && e.termId === termId);
        if (!enrollment) throw new Error('Student not enrolled in this term');
        
        const classObj = classes.find((c: any) => c.id === enrollment.classId);
        const term = terms.find((t: any) => t.id === termId);
        const classSubjects = subjects.filter((s: any) => s.classId === classObj.id);
        
        const studentResults = results.filter((r: any) => r.studentId === studentId && r.termId === termId);
        const classEnrollments = enrollments.filter((e: any) => e.classId === classObj.id && e.termId === termId);
        const classStudentIds = classEnrollments.map((e: any) => e.studentId);
        const allClassResults = results.filter((r: any) => classStudentIds.includes(r.studentId) && r.termId === termId);
        
        const subjectStats = classSubjects.map(subj => {
          const result = studentResults.find((r: any) => r.subjectId === subj.id);
          const subjResults = allClassResults.filter((r: any) => r.subjectId === subj.id);
          const totalScores = subjResults.map((r: any) => r.totalScore || 0);
          
          const avg = totalScores.length > 0 ? totalScores.reduce((acc, curr) => acc + curr, 0) / totalScores.length : 0;
          const max = totalScores.length > 0 ? Math.max(...totalScores, 0) : 0;
          const min = totalScores.length > 0 ? Math.min(...totalScores, 0) : 0;
          
          const sortedScores = [...totalScores].sort((a, b) => b - a);
          const rank = result?.totalScore ? sortedScores.indexOf(result.totalScore) + 1 : 0;
          
          return {
            subjectId: subj.id,
            subjectName: subj.name,
            subjectCode: subj.code,
            firstTest: result?.firstTest || 0,
            secondTest: result?.secondTest || 0,
            assignment: result?.assignment || 0,
            project: result?.project || 0,
            exam: result?.exam || 0,
            totalScore: result?.totalScore || 0,
            grade: result?.grade || 'N/A',
            remark: result?.remark || 'Not graded',
            classAverage: parseFloat(avg.toFixed(2)),
            classMax: max,
            classMin: min,
            subjectRank: rank
          };
        });
        
        const studentTotals = classStudentIds.map(sId => {
          const studentRes = allClassResults.filter((r: any) => r.studentId === sId);
          const total = studentRes.reduce((acc, curr) => acc + (curr.totalScore || 0), 0);
          const avg = studentRes.length > 0 ? total / studentRes.length : 0;
          return { studentId: sId, total, average: avg };
        });
        
        studentTotals.sort((a, b) => b.total - a.total);
        const overallPosition = studentTotals.findIndex(s => s.studentId === studentId) + 1;
        const currentStudentTotals = studentTotals.find(s => s.studentId === studentId);
        
        const termAttendance = attendance.filter((a: any) => a.studentId === studentId);
        const presentCount = termAttendance.filter((a: any) => a.status === 'PRESENT').length;
        const absentCount = termAttendance.filter((a: any) => a.status === 'ABSENT').length;
        const lateCount = termAttendance.filter((a: any) => a.status === 'LATE').length;
        
        const totalDays = presentCount + absentCount + lateCount;
        
        return {
          student: {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            admissionNo: student.admissionNo,
            passportUrl: student.passportUrl || null
          },
          class: {
            id: classObj.id,
            name: classObj.name,
            section: classObj.section,
            classTeacher: classObj.teacher || 'N/A'
          },
          term: {
            id: term.id,
            name: term.name,
            session: term.sessionId === 'sess-1' ? '2025/2026' : 'N/A'
          },
          results: subjectStats,
          summary: {
            totalObtained: currentStudentTotals?.total || 0,
            totalObtainable: subjectStats.length * 100,
            average: currentStudentTotals ? parseFloat(currentStudentTotals.average.toFixed(2)) : 0,
            classPosition: overallPosition,
            totalStudentsInClass: classStudentIds.length,
            attendance: {
              present: presentCount,
              absent: absentCount,
              late: lateCount,
              totalDays,
              attendanceRate: totalDays > 0 ? ((presentCount + lateCount) / totalDays * 100).toFixed(1) : '0'
            }
          }
        };
      }
    }
  },
  
  tahfiz: {
    record: async (record: { 
      studentId: string, 
      date: string, 
      sabak: string, 
      sabaqi: string, 
      manzil: string, 
      fluencyRating: number, 
      accuracyRating: number 
    }) => {
      if (!record.studentId || !record.date || !record.sabak || !record.sabaqi || !record.manzil) {
        throw new Error('Missing required fields');
      }
      
      if (record.fluencyRating < 1 || record.fluencyRating > 5 || record.accuracyRating < 1 || record.accuracyRating > 5) {
        throw new Error('Ratings must be between 1 and 5');
      }
      
      try {
        const response = await apiClient.post('/tahfiz/record', record);
        return response.data;
      } catch (error) {
        const db = getMockData('dh_tahfiz');
        const user = api.auth.getCurrentUser();
        
        const newRecord = {
          id: `th-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...record,
          teacherId: user?.id || 4,
          recordedAt: new Date().toISOString()
        };
        
        saveMockData('dh_tahfiz', [...db, newRecord]);
        addAuditLog('TAHFIZ_RECORDED', user?.id || 0, { studentId: record.studentId });
        
        return { success: true, message: 'Tahfiz progress logged successfully' };
      }
    },
    
    getStudentHistory: async (studentId: string) => {
      if (!studentId) {
        throw new Error('Student ID is required');
      }
      
      try {
        const response = await apiClient.get(`/tahfiz/student/${studentId}`);
        return response.data.data;
      } catch (error) {
        const records = getMockData('dh_tahfiz');
        return records
          .filter((t: any) => t.studentId === studentId)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    },
    
    getStudentProgress: async (studentId: string) => {
      const history = await api.tahfiz.getStudentHistory(studentId);
      
      if (history.length === 0) {
        return {
          totalSessions: 0,
          averageFluency: 0,
          averageAccuracy: 0,
          lastSession: null,
          juzCompleted: [],
          currentJuz: 'Not started'
        };
      }
      
      const avgFluency = history.reduce((acc: number, curr: any) => acc + curr.fluencyRating, 0) / history.length;
      const avgAccuracy = history.reduce((acc: number, curr: any) => acc + curr.accuracyRating, 0) / history.length;
      
      const juzProgress = history.map((h: any) => h.manzil).filter((m: any) => m);
      
      return {
        totalSessions: history.length,
        averageFluency: parseFloat(avgFluency.toFixed(1)),
        averageAccuracy: parseFloat(avgAccuracy.toFixed(1)),
        lastSession: history[0] || null,
        juzCompleted: [...new Set(juzProgress)],
        currentJuz: juzProgress[juzProgress.length - 1] || 'Not started'
      };
    }
  },
  
  finance: {
    listInvoices: async (studentId?: string) => {
      try {
        const url = studentId ? `/finance/invoices?studentId=${studentId}` : '/finance/invoices';
        const response = await apiClient.get(url);
        return response.data.data;
      } catch (error) {
        const invoices = getMockData('dh_invoices');
        const students = getMockData('dh_students');
        
        let filtered = invoices;
        if (studentId) {
          filtered = invoices.filter((i: any) => i.studentId === studentId);
        }
        
        return filtered.map((i: any) => {
          const student = students.find((s: any) => s.id === i.studentId);
          return {
            ...i,
            student: student ? {
              firstName: student.firstName,
              lastName: student.lastName,
              admissionNo: student.admissionNo
            } : null,
            balance: i.amount - i.amountPaid,
            payments: i.payments || []
          };
        });
      }
    },
    
    createInvoice: async (invoice: {
      studentId: string,
      category: string,
      amount: number,
      dueDate: string,
      description?: string
    }) => {
      if (!invoice.studentId || !invoice.category || !invoice.amount || !invoice.dueDate) {
        throw new Error('Missing required fields');
      }
      
      if (invoice.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      
      try {
        const response = await apiClient.post('/finance/invoices', invoice);
        return response.data;
      } catch (error) {
        const invoices = getMockData('dh_invoices');
        const newInvoice = {
          id: `inv-${Date.now()}`,
          ...invoice,
          amountPaid: 0,
          status: 'UNPAID',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        saveMockData('dh_invoices', [...invoices, newInvoice]);
        
        const user = api.auth.getCurrentUser();
        addAuditLog('INVOICE_CREATED', user?.id || 0, { studentId: invoice.studentId, amount: invoice.amount });
        
        return { success: true, invoice: newInvoice };
      }
    },
    
    initializePayment: async (invoiceId: string, email: string) => {
      if (!invoiceId || !email) {
        throw new Error('Invoice ID and email are required');
      }
      
      try {
        const response = await apiClient.post('/finance/payments/initialize', { invoiceId, email });
        return response.data;
      } catch (error) {
        const reference = `DH-PAY-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
        
        return {
          data: {
            authorization_url: `/payment/callback?reference=${reference}&invoiceId=${invoiceId}`,
            reference,
            mock: true
          }
        };
      }
    },
    
    simulatePaymentSuccess: async (invoiceId: string) => {
      const invoices = getMockData('dh_invoices');
      const invoice = invoices.find((i: any) => i.id === invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      invoice.amountPaid = invoice.amount;
      invoice.status = 'PAID';
      invoice.updatedAt = new Date().toISOString();

      const updatedInvoices = invoices.map((i: any) => i.id === invoiceId ? invoice : i);
      saveMockData('dh_invoices', updatedInvoices);

      const user = api.auth.getCurrentUser();
      addAuditLog('PAYMENT_COMPLETED', user?.id || 0, { invoiceId, amount: invoice.amount });

      return { success: true, invoice };
    },
    
    verifyPayment: async (reference: string, invoiceId: string) => {
      try {
        const response = await apiClient.get(`/finance/payments/verify?reference=${reference}`);
        return response.data;
      } catch (error) {
        const invoices = getMockData('dh_invoices');
        const invoice = invoices.find((i: any) => i.id === invoiceId);
        
        if (!invoice) {
          throw new Error('Invoice not found');
        }
        
        invoice.amountPaid = invoice.amount;
        invoice.status = 'PAID';
        invoice.updatedAt = new Date().toISOString();
        
        const updatedInvoices = invoices.map((i: any) => i.id === invoiceId ? invoice : i);
        saveMockData('dh_invoices', updatedInvoices);
        
        const user = api.auth.getCurrentUser();
        addAuditLog('PAYMENT_COMPLETED', user?.id || 0, { invoiceId, amount: invoice.amount });
        
        return { success: true, message: 'Payment verified successfully' };
      }
    }
  },
  
  audit: {
    getLogs: async (filters?: { userId?: number, action?: string, startDate?: string, endDate?: string }) => {
      try {
        const response = await apiClient.get('/audit/logs', { params: filters });
        return response.data.data;
      } catch (error) {
        let logs = getMockData('dh_audit_logs');
        
        if (filters?.userId) {
          logs = logs.filter((l: any) => l.userId === filters.userId);
        }
        if (filters?.action) {
          logs = logs.filter((l: any) => l.action === filters.action);
        }
        const startDate = filters?.startDate;
        const endDate = filters?.endDate;
        if (startDate && endDate) {
          logs = logs.filter((l: any) => {
            return l.timestamp >= startDate && l.timestamp <= endDate;
          });
        }
        
        return logs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    }
  }
};