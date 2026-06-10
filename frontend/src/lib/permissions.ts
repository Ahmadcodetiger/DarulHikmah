export const ROLES = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER', 'TAHFIZ_TEACHER', 'ACCOUNTANT', 'PARENT', 'STUDENT'] as const;

export const ATTENDANCE_ACCESS_ROLES = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER', 'TAHFIZ_TEACHER'] as const;
export const RESULTS_ACCESS_ROLES = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER'] as const;
export const TAHFIZ_RECORD_ROLES = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TAHFIZ_TEACHER'] as const;
export const TAHFIZ_VIEW_ROLES = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TAHFIZ_TEACHER', 'PARENT', 'STUDENT'] as const;
export const FINANCE_VIEW_ROLES = ['SUPER_ADMIN', 'ACCOUNTANT', 'PRINCIPAL', 'PARENT', 'STUDENT'] as const;
export const FINANCE_CREATE_ROLES = ['SUPER_ADMIN', 'ACCOUNTANT'] as const;
export const ADMISSIONS_ROLES = ['SUPER_ADMIN', 'PRINCIPAL'] as const;
export const SCHOOL_SETUP_ROLES = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL'] as const;
export const MANAGE_USERS_ROLES = ['SUPER_ADMIN'] as const;
export const REPORT_CARD_ROLES = ['SUPER_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HEAD_TEACHER', 'TEACHER', 'PARENT', 'STUDENT'] as const;

export const hasRole = <T extends readonly string[]>(role: string | undefined, allowedRoles: T): role is T[number] => {
  return !!role && allowedRoles.includes(role as T[number]);
};
