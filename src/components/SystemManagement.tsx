import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Shield, 
  Key, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  X,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { 
  PREDEFINED_USERS, 
  ROLE_PERMISSIONS, 
  getRoleDisplayName, 
  getRoleColor,
  type User,
  type UserRole,
  type Permission
} from '../lib/auth';

type TabType = 'users' | 'roles' | 'permissions';

export function SystemManagement() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<User[]>(PREDEFINED_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const tabs = [
    { id: 'users' as TabType, label: i18n.language === 'en' ? 'User Management' : '用户管理', icon: Users },
    { id: 'roles' as TabType, label: i18n.language === 'en' ? 'Role Management' : '角色管理', icon: Shield },
    { id: 'permissions' as TabType, label: i18n.language === 'en' ? 'Permission Management' : '权限管理', icon: Key },
  ];

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    const newUser: User = {
      id: `USR-${Date.now()}`,
      username: '',
      password: '',
      role: 'agent',
      fullName: '',
      email: '',
      department: '',
      permissions: ROLE_PERMISSIONS.agent,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    setEditingUser(newUser);
    setIsAddingUser(true);
  };

  const handleSaveUser = () => {
    if (!editingUser) return;

    if (isAddingUser) {
      setUsers([...users, editingUser]);
    } else {
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    }

    setEditingUser(null);
    setIsAddingUser(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    setShowDeleteConfirm(null);
  };

  const handleRoleChange = (role: UserRole) => {
    if (editingUser) {
      setEditingUser({
        ...editingUser,
        role,
        permissions: ROLE_PERMISSIONS[role],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {i18n.language === 'en' ? 'System Management' : '系统管理'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {i18n.language === 'en' 
              ? 'Manage users, roles, and permissions' 
              : '管理系统用户、角色和权限配置'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all",
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Search and Add */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={i18n.language === 'en' ? 'Search users...' : '搜索用户...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
              >
                <Plus size={16} />
                {i18n.language === 'en' ? 'Add User' : '添加用户'}
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {i18n.language === 'en' ? 'User' : '用户'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {i18n.language === 'en' ? 'Role' : '角色'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {i18n.language === 'en' ? 'Department' : '部门'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {i18n.language === 'en' ? 'Status' : '状态'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {i18n.language === 'en' ? 'Actions' : '操作'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                          <p className="text-xs text-slate-400 mt-0.5">@{user.username}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase",
                          getRoleColor(user.role)
                        )}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{user.department || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle size={12} />
                            {i18n.language === 'en' ? 'Active' : '活跃'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                            {i18n.language === 'en' ? 'Inactive' : '停用'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setIsAddingUser(false);
                            }}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title={i18n.language === 'en' ? 'Edit' : '编辑'}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title={i18n.language === 'en' ? 'Delete' : '删除'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="py-12 text-center">
                  <Users size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">
                    {i18n.language === 'en' ? 'No users found' : '未找到用户'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'roles' && (
          <motion.div
            key="roles"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => (
              <div key={role} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold uppercase",
                    getRoleColor(role as UserRole)
                  )}>
                    {getRoleDisplayName(role as UserRole)}
                  </span>
                  <Shield size={20} className="text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  {role === 'admin' && (i18n.language === 'en' ? 'Full system access' : '完全系统访问权限')}
                  {role === 'agent' && (i18n.language === 'en' ? 'Create and manage CAF' : '创建和管理CAF申请')}
                  {role === 'auditor' && (i18n.language === 'en' ? 'Review and approve CAF' : '审核和批准CAF申请')}
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    {i18n.language === 'en' ? 'Permissions' : '权限列表'}
                  </p>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {Object.entries(permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{key}</span>
                        {value ? (
                          <CheckCircle size={14} className="text-emerald-600" />
                        ) : (
                          <X size={14} className="text-slate-300" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'permissions' && (
          <motion.div
            key="permissions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <AlertCircle size={20} className="text-indigo-600 shrink-0" />
                <p className="text-sm text-indigo-700">
                  {i18n.language === 'en' 
                    ? 'Permission matrix showing all available permissions across different roles.' 
                    : '权限矩阵显示不同角色的所有可用权限。'}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                        {i18n.language === 'en' ? 'Permission' : '权限'}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-rose-600 uppercase">Admin</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-indigo-600 uppercase">Agent</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-emerald-600 uppercase">Auditor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {Object.keys(ROLE_PERMISSIONS.admin).map((permission) => (
                      <tr key={permission} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-700 font-medium">{permission}</td>
                        <td className="px-4 py-3 text-center">
                          {ROLE_PERMISSIONS.admin[permission as keyof Permission] ? (
                            <CheckCircle size={16} className="inline text-emerald-600" />
                          ) : (
                            <X size={16} className="inline text-slate-300" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {ROLE_PERMISSIONS.agent[permission as keyof Permission] ? (
                            <CheckCircle size={16} className="inline text-emerald-600" />
                          ) : (
                            <X size={16} className="inline text-slate-300" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {ROLE_PERMISSIONS.auditor[permission as keyof Permission] ? (
                            <CheckCircle size={16} className="inline text-emerald-600" />
                          ) : (
                            <X size={16} className="inline text-slate-300" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit/Add User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {isAddingUser 
                  ? (i18n.language === 'en' ? 'Add New User' : '添加新用户')
                  : (i18n.language === 'en' ? 'Edit User' : '编辑用户')}
              </h3>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setIsAddingUser(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    {i18n.language === 'en' ? 'Username' : '用户名'}
                  </label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    {i18n.language === 'en' ? 'Password' : '密码'}
                  </label>
                  <input
                    type="password"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  {i18n.language === 'en' ? 'Full Name' : '全名'}
                </label>
                <input
                  type="text"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  {i18n.language === 'en' ? 'Email' : '邮箱'}
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  {i18n.language === 'en' ? 'Department' : '部门'}
                </label>
                <input
                  type="text"
                  value={editingUser.department || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  {i18n.language === 'en' ? 'Role' : '角色'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['admin', 'agent', 'auditor'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={cn(
                        "px-4 py-3 rounded-lg text-sm font-bold uppercase transition-all border-2",
                        editingUser.role === role
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {getRoleDisplayName(role)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingUser.isActive}
                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {i18n.language === 'en' ? 'Active User' : '激活用户'}
                  </span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setIsAddingUser(false);
                }}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                {i18n.language === 'en' ? 'Cancel' : '取消'}
              </button>
              <button
                onClick={handleSaveUser}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
              >
                <Save size={16} />
                {i18n.language === 'en' ? 'Save' : '保存'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                <AlertCircle size={24} className="text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {i18n.language === 'en' ? 'Delete User' : '删除用户'}
                </h3>
                <p className="text-sm text-slate-500">
                  {i18n.language === 'en' ? 'This action cannot be undone' : '此操作无法撤销'}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              {i18n.language === 'en' 
                ? 'Are you sure you want to delete this user? All associated data will be permanently removed.' 
                : '确定要删除此用户吗？所有相关数据将被永久删除。'}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                {i18n.language === 'en' ? 'Cancel' : '取消'}
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-all"
              >
                {i18n.language === 'en' ? 'Delete' : '删除'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// AnimatePresence component for smooth transitions
function AnimatePresence({ children, mode }: { children: React.ReactNode; mode?: string }) {
  return <>{children}</>;
}
