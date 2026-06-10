// pages/Admin.tsx - Complete Admin Panel with Database Integration
import { useState, useEffect } from 'react';
import {
  ShieldCheck, UserPlus, Users, BookOpen,
  GraduationCap, AlertCircle, CheckCircle, XCircle,
  Search, Trash2, Edit, Lock, LogOut, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  staffProfile?: {
    firstName: string;
    lastName: string;
    staffId: string;
    department: string | null;
  };
  studentProfile?: {
    firstName: string;
    lastName: string;
    admissionNo: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string | null;
  };
  parentProfile?: {
    firstName: string;
    lastName: string;
    address?: string | null;
    occupation?: string | null;
  };
}

export const Admin = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  
  const [newUser, setNewUser] = useState({
    email: '',
    phone: '',
    password: '',
    role: 'TEACHER',
    firstName: '',
    lastName: '',
    staffId: '',
    department: '',
    admissionNo: '',
    address: '',
    occupation: '',
    dateOfBirth: '',
    gender: ''
  });

  // Fetch users from database
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.admin.getUsers();
      setUsers(response);
    } catch (error) {
      showNotification('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetchUsers();
    }
  }, [user]);

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateUser = async () => {
    // Validation
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      showNotification('error', 'Invalid email format');
      return;
    }

    if (newUser.password.length < 8) {
      showNotification('error', 'Password must be at least 8 characters');
      return;
    }

    try {
      const result = await api.admin.createUser({
        email: newUser.email,
        phone: newUser.phone || undefined,
        password: newUser.password,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        staffId: newUser.staffId || undefined,
        department: newUser.department || undefined,
        admissionNo: newUser.admissionNo || undefined,
        address: newUser.address || undefined,
        occupation: newUser.occupation || undefined,
        dateOfBirth: newUser.dateOfBirth || undefined,
        gender: newUser.gender || undefined,
      });

      showNotification('success', `User ${result.email} created successfully`);
      setShowCreateModal(false);
      setNewUser({
        email: '',
        phone: '',
        password: '',
        role: 'TEACHER',
        firstName: '',
        lastName: '',
        staffId: '',
        department: '',
        admissionNo: '',
        address: '',
        occupation: '',
        dateOfBirth: '',
        gender: ''
      });
      fetchUsers();
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await api.admin.updateUser(selectedUser.id, {
        email: selectedUser.email,
        phone: selectedUser.phone || undefined,
        isActive: selectedUser.isActive,
        role: selectedUser.role,
        firstName: selectedUser.staffProfile?.firstName || selectedUser.parentProfile?.firstName || selectedUser.studentProfile?.firstName || '',
        lastName: selectedUser.staffProfile?.lastName || selectedUser.parentProfile?.lastName || selectedUser.studentProfile?.lastName || '',
        staffId: selectedUser.staffProfile?.staffId || undefined,
        department: selectedUser.staffProfile?.department || undefined,
        admissionNo: selectedUser.studentProfile?.admissionNo || undefined,
        address: selectedUser.parentProfile?.address || selectedUser.studentProfile?.address || undefined,
        occupation: selectedUser.parentProfile?.occupation || undefined,
        dateOfBirth: selectedUser.studentProfile?.dateOfBirth ? new Date(selectedUser.studentProfile.dateOfBirth).toISOString().split('T')[0] : undefined,
        gender: selectedUser.studentProfile?.gender || undefined,
      });
      
      showNotification('success', `User ${selectedUser.email} updated successfully`);
      setShowEditModal(false);
      fetchUsers();
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.admin.deleteUser(userId);
      showNotification('success', 'User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.admin.toggleUserStatus(userId, !currentStatus);
      showNotification('success', `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to update user status');
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password (minimum 8 characters):');
    if (!newPassword) return;
    
    if (newPassword.length < 8) {
      showNotification('error', 'Password must be at least 8 characters');
      return;
    }

    try {
      await api.admin.resetPassword(userId, newPassword);
      showNotification('success', 'Password reset successfully');
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to reset password');
    }
  };

  // Only SUPER_ADMIN can access this panel
  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className={`max-w-md w-full p-8 rounded-2xl text-center ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        } shadow-xl`}>
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">
            Only Super Administrators can access the admin panel.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const nameMatch = user.staffProfile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     user.staffProfile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     user.parentProfile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     user.studentProfile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = emailMatch || nameMatch;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      PRINCIPAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      VICE_PRINCIPAL: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      HEAD_TEACHER: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
      TEACHER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      TAHFIZ_TEACHER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      ACCOUNTANT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      PARENT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      STUDENT: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getUserDisplayName = (user: User) => {
    if (user.staffProfile) {
      return `${user.staffProfile.firstName} ${user.staffProfile.lastName}`;
    }
    if (user.parentProfile) {
      return `${user.parentProfile.firstName} ${user.parentProfile.lastName}`;
    }
    if (user.studentProfile) {
      return `${user.studentProfile.firstName} ${user.studentProfile.lastName}`;
    }
    return user.email || 'Unknown';
  };

  const getUserIdentifier = (user: User) => {
    if (user.staffProfile) {
      return `Staff ID: ${user.staffProfile.staffId}`;
    }
    if (user.studentProfile) {
      return `Admission: ${user.studentProfile.admissionNo}`;
    }
    if (user.parentProfile) {
      return user.parentProfile.address || 'Parent';
    }
    return user.email || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`p-4 rounded-lg shadow-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              Admin Control Panel
            </h1>
            <p className="text-slate-500 mt-1">
              Manage users, roles, and system settings
            </p>
          </div>
          
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          } shadow-sm border border-slate-200 dark:border-slate-700`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{user?.email}</p>
                <p className="text-xs text-slate-500">Super Administrator</p>
              </div>
              <button
                onClick={logout}
                className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold mt-1">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-emerald-500 opacity-50" />
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Active Staff</p>
                <p className="text-2xl font-bold mt-1">
                  {users.filter(u => u.isActive && ['TEACHER', 'TAHFIZ_TEACHER', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'ACCOUNTANT'].includes(u.role)).length}
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total Students</p>
                <p className="text-2xl font-bold mt-1">{users.filter(u => u.role === 'STUDENT').length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
          <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Parents</p>
                <p className="text-2xl font-bold mt-1">{users.filter(u => u.role === 'PARENT').length}</p>
              </div>
              <Users className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="all">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="PRINCIPAL">Principal</option>
              <option value="VICE_PRINCIPAL">Vice Principal</option>
              <option value="HEAD_TEACHER">Head Teacher</option>
              <option value="TEACHER">Teacher</option>
              <option value="TAHFIZ_TEACHER">Tahfiz Teacher</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="PARENT">Parent</option>
              <option value="STUDENT">Student</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <UserPlus size={18} /> Add User
            </button>
            <button
              onClick={fetchUsers}
              className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left p-4 text-sm font-semibold">User</th>
                  <th className="text-left p-4 text-sm font-semibold">Email</th>
                  <th className="text-left p-4 text-sm font-semibold">Role</th>
                  <th className="text-left p-4 text-sm font-semibold">Status</th>
                  <th className="text-left p-4 text-sm font-semibold">Created</th>
                  <th className="text-left p-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.map((appUser) => (
                  <tr key={appUser.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{getUserDisplayName(appUser)}</p>
                        <p className="text-xs text-slate-500">{getUserIdentifier(appUser)}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{appUser.email}</p>
                      {appUser.phone && <p className="text-xs text-slate-500">{appUser.phone}</p>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(appUser.role)}`}>
                        {appUser.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        appUser.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {appUser.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {appUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{formatDate(appUser.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(appUser);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleResetPassword(appUser.id)}
                          className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <Lock size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(appUser.id, appUser.isActive)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            appUser.isActive
                              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                              : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30'
                          }`}
                          title={appUser.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {appUser.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        {appUser.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(appUser.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl p-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="user@darulhikmah.edu.ng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="PRINCIPAL">Principal</option>
                  <option value="VICE_PRINCIPAL">Vice Principal</option>
                  <option value="HEAD_TEACHER">Head Teacher</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="TAHFIZ_TEACHER">Tahfiz Teacher</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="PARENT">Parent</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>

              {/* Staff-specific fields */}
              {(newUser.role === 'TEACHER' || newUser.role === 'TAHFIZ_TEACHER' || 
                newUser.role === 'PRINCIPAL' || newUser.role === 'VICE_PRINCIPAL' || 
                newUser.role === 'HEAD_TEACHER' || newUser.role === 'ACCOUNTANT') && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Staff ID</label>
                    <input
                      type="text"
                      value={newUser.staffId}
                      onChange={(e) => setNewUser({ ...newUser, staffId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      placeholder="e.g., STAFF/2025/001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <input
                      type="text"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      placeholder="e.g., Science, Arts, Tahfiz"
                    />
                  </div>
                </>
              )}

              {/* Student-specific fields */}
              {newUser.role === 'STUDENT' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Admission Number</label>
                  <input
                    type="text"
                    value={newUser.admissionNo}
                    onChange={(e) => setNewUser({ ...newUser, admissionNo: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="e.g., DHA/2025/001"
                  />
                </div>
              )}

              {/* Parent-specific fields */}
              {newUser.role === 'PARENT' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="Home address"
                    rows={2}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateUser}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500"
              >
                Create User
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-slate-200 dark:border-slate-700 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className={`max-w-md w-full rounded-xl p-6 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  disabled={selectedUser.role === 'SUPER_ADMIN'}
                >
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="PRINCIPAL">Principal</option>
                  <option value="VICE_PRINCIPAL">Vice Principal</option>
                  <option value="HEAD_TEACHER">Head Teacher</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="TAHFIZ_TEACHER">Tahfiz Teacher</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="PARENT">Parent</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={selectedUser.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.value === 'active' })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateUser}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 border border-slate-200 dark:border-slate-700 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};