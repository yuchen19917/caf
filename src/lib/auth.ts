/**
 * 认证和授权系统
 * 定义用户角色、权限和账号
 */

export type UserRole = 'admin' | 'agent' | 'auditor';

export interface Permission {
  // Dashboard
  viewDashboard: boolean;
  
  // CAF Management
  createCAF: boolean;
  viewCAF: boolean;
  editCAF: boolean;
  deleteCAF: boolean;
  
  // Audit
  viewAuditQueue: boolean;
  approveCAF: boolean;
  rejectCAF: boolean;
  requestCorrection: boolean;
  
  // Documents
  viewDocuments: boolean;
  uploadDocuments: boolean;
  downloadDocuments: boolean;
  deleteDocuments: boolean;
  
  // Templates
  viewTemplates: boolean;
  createTemplates: boolean;
  editTemplates: boolean;
  deleteTemplates: boolean;
  
  // Global Rules
  viewGlobalRules: boolean;
  editGlobalRules: boolean;
  
  // Integrations
  viewIntegrations: boolean;

  // Compliance & Regulatory
  viewCompliance: boolean;

  // Site Registry
  viewSiteRegistry: boolean;

  // Contract Manager
  viewContracts: boolean;

  // System
  viewAllUsers: boolean;
  manageUsers: boolean;
  viewSystemLogs: boolean;
  exportData: boolean;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  email: string;
  department?: string;
  permissions: Permission;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

// 角色权限配置
export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  // 管理员 - 完全权限
  admin: {
    viewDashboard: true,
    createCAF: true,
    viewCAF: true,
    editCAF: true,
    deleteCAF: true,
    viewAuditQueue: true,
    approveCAF: true,
    rejectCAF: true,
    requestCorrection: true,
    viewDocuments: true,
    uploadDocuments: true,
    downloadDocuments: true,
    deleteDocuments: true,
    viewTemplates: true,
    createTemplates: true,
    editTemplates: true,
    deleteTemplates: true,
    viewGlobalRules: true,
    editGlobalRules: true,
    viewIntegrations: true,
    viewCompliance: true,
    viewSiteRegistry: true,
    viewContracts: true,
    viewAllUsers: true,
    manageUsers: true,
    viewSystemLogs: true,
    exportData: true,
  },

  // 代理人员 - CAF创建和查看权限
  agent: {
    viewDashboard: true,
    createCAF: true,
    viewCAF: true,
    editCAF: false,
    deleteCAF: false,
    viewAuditQueue: false,
    approveCAF: false,
    rejectCAF: false,
    requestCorrection: false,
    viewDocuments: true,
    uploadDocuments: true,
    downloadDocuments: true,
    deleteDocuments: false,
    viewTemplates: true,
    createTemplates: false,
    editTemplates: false,
    deleteTemplates: false,
    viewGlobalRules: true,
    editGlobalRules: false,
    viewIntegrations: false,
    viewCompliance: false,
    viewSiteRegistry: true,
    viewContracts: false,
    viewAllUsers: false,
    manageUsers: false,
    viewSystemLogs: false,
    exportData: false,
  },

  // 审批人员 - 审核权限
  auditor: {
    viewDashboard: true,
    createCAF: false,
    viewCAF: true,
    editCAF: false,
    deleteCAF: false,
    viewAuditQueue: true,
    approveCAF: true,
    rejectCAF: true,
    requestCorrection: true,
    viewDocuments: true,
    uploadDocuments: false,
    downloadDocuments: true,
    deleteDocuments: false,
    viewTemplates: true,
    createTemplates: false,
    editTemplates: false,
    deleteTemplates: false,
    viewGlobalRules: true,
    editGlobalRules: false,
    viewIntegrations: true,
    viewCompliance: true,
    viewSiteRegistry: true,
    viewContracts: true,
    viewAllUsers: false,
    manageUsers: false,
    viewSystemLogs: false,
    exportData: true,
  },
};

// 预定义账号
export const PREDEFINED_USERS: User[] = [
  {
    id: 'USR-ADMIN-001',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    fullName: 'Rahmatullah Karimi',
    email: 'r.karimi@atoma.af',
    department: 'IT & Systems',
    permissions: ROLE_PERMISSIONS.admin,
    createdAt: '2026-01-01T00:00:00Z',
    isActive: true,
  },
  {
    id: 'USR-AGENT-001',
    username: 'agent',
    password: 'agent123',
    role: 'agent',
    fullName: 'Mariam Noorzai',
    email: 'm.noorzai@atoma.af',
    department: 'Customer Services — Kabul',
    permissions: ROLE_PERMISSIONS.agent,
    createdAt: '2026-01-01T00:00:00Z',
    isActive: true,
  },
  {
    id: 'USR-AUDIT-001',
    username: 'auditor',
    password: 'auditor123',
    role: 'auditor',
    fullName: 'Sayed Yusuf Ahmadi',
    email: 's.ahmadi@atoma.af',
    department: 'Compliance & Regulatory Affairs',
    permissions: ROLE_PERMISSIONS.auditor,
    createdAt: '2026-01-01T00:00:00Z',
    isActive: true,
  },
];

// 认证函数
export function authenticateUser(username: string, password: string): User | null {
  const user = PREDEFINED_USERS.find(
    (u) => u.username === username && u.password === password && u.isActive
  );
  
  if (user) {
    // 更新最后登录时间
    return {
      ...user,
      lastLogin: new Date().toISOString(),
    };
  }
  
  return null;
}

// 权限检查函数
export function hasPermission(user: User | null, permission: keyof Permission): boolean {
  if (!user) return false;
  return user.permissions[permission] === true;
}

// 角色检查函数
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

// 获取角色显示名称
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'agent':
      return 'Agent';
    case 'auditor':
      return 'Auditor';
    default:
      return role;
  }
}

// 获取角色描述
export function getRoleDescription(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Full system access with all permissions';
    case 'agent':
      return 'Create and manage CAF applications';
    case 'auditor':
      return 'Review and approve CAF applications';
    default:
      return '';
  }
}

// 获取角色颜色
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'text-rose-600 bg-rose-50';
    case 'agent':
      return 'text-indigo-600 bg-indigo-50';
    case 'auditor':
      return 'text-emerald-600 bg-emerald-50';
    default:
      return 'text-slate-600 bg-slate-50';
  }
}
