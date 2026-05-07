import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  FileSearch,
  ScanFace,
  FileText,
  FolderOpen,
  TrendingUp,
  Activity,
  Building2,
  UserCheck,
  FileCheck,
  BarChart3,
  Calendar,
  Eye,
  Download,
  UserPlus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApplications } from '../context/ApplicationContext';
import { cn } from '../lib/utils';

export default function Dashboard({ user }: { user: any }) {
  const { t } = useTranslation();
  const { getFilteredCAFs, archiveEntries } = useApplications();

  // Get filtered CAFs based on user role
  const cafs = useMemo(() => {
    if (!user) return [];
    return getFilteredCAFs(user);
  }, [getFilteredCAFs, user]);

  // 计算真实统计数据
  const stats = useMemo(() => {
    const pending = cafs.filter(c => c.status === 'Pending').length;
    const approved = cafs.filter(c => c.status === 'Approved').length;
    const rejected = cafs.filter(c => c.status === 'Rejected').length;
    const correction = cafs.filter(c => c.status === 'Correction').length;
    const archived = cafs.filter(c => c.status === 'Archived').length;
    const individual = cafs.filter(c => c.customerType === 'Individual').length;
    const corporate = cafs.filter(c => c.customerType === 'Corporate').length;
    
    return {
      totalCAFs: cafs.length,
      pending,
      approved,
      rejected,
      correction,
      archived,
      individual,
      corporate,
      totalDocs: archiveEntries.length,
      verifiedDocs: archiveEntries.filter(d => d.status === 'verified' || d.status === 'approved').length,
    };
  }, [cafs, archiveEntries]);

  // 最近的 CAF 申请
  const recentCAFs = useMemo(() => {
    return cafs
      .slice(0, 5)
      .map(caf => ({
        id: caf.id,
        name: caf.fullName,
        type: `${caf.customerType === 'Individual' ? t('dashboard.individual') : t('dashboard.corporate')} / ${caf.serviceType}`,
        time: new Date(caf.submissionDate).toLocaleDateString('zh-CN'),
        status: caf.status,
        customerType: caf.customerType,
      }));
  }, [cafs, t]);

  // 状态分布数据
  const statusDistribution = useMemo(() => {
    const total = stats.totalCAFs || 1; // 避免除以0
    return [
      { label: t('dashboard.status_pending'), value: stats.pending, color: 'bg-amber-500', percentage: (stats.pending / total * 100).toFixed(1) },
      { label: t('dashboard.status_approved'), value: stats.approved, color: 'bg-emerald-500', percentage: (stats.approved / total * 100).toFixed(1) },
      { label: t('dashboard.status_archived'), value: stats.archived, color: 'bg-indigo-500', percentage: (stats.archived / total * 100).toFixed(1) },
      { label: t('dashboard.status_correction'), value: stats.correction, color: 'bg-blue-500', percentage: (stats.correction / total * 100).toFixed(1) },
      { label: t('dashboard.status_rejected'), value: stats.rejected, color: 'bg-rose-500', percentage: (stats.rejected / total * 100).toFixed(1) },
    ];
  }, [stats, t]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Approved': return 'bg-emerald-100 text-emerald-700';
      case 'Rejected': return 'bg-rose-100 text-rose-700';
      case 'Correction': return 'bg-blue-100 text-blue-700';
      case 'Archived': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending': return t('dashboard.status_pending');
      case 'Approved': return t('dashboard.status_approved');
      case 'Rejected': return t('dashboard.status_rejected');
      case 'Correction': return t('dashboard.status_correction');
      case 'Archived': return t('dashboard.status_archived');
      default: return status;
    }
  };
  
  // 如果是 Agent 且没有数据，显示友好提示
  const isEmptyAgent = user?.role === 'agent' && cafs.length === 0;
  
  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('dashboard.system_overview')}</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">{t('dashboard.system_running')}</span>
        </div>
      </div>

      {/* Empty State for Agent */}
      {isEmptyAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-dashed border-indigo-200 rounded-2xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            {user.role === 'agent' ? 'Welcome, Agent!' : '欢迎，代理人员！'}
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            {user.role === 'agent' 
              ? "You haven't created any CAF applications yet. Click 'New CAF Entry' to get started!" 
              : '您还没有创建任何 CAF 申请。点击"新业务受理"开始创建！'}
          </p>
          <button
            onClick={() => window.location.hash = '#new-caf'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20"
          >
            <UserPlus size={20} />
            {user.role === 'agent' ? 'Create Your First CAF' : '创建第一个 CAF'}
          </button>
        </motion.div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: t('dashboard.total_cafs'), 
            value: stats.totalCAFs, 
            icon: FileText, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50',
            trend: '+12%',
            trendUp: true
          },
          { 
            label: t('dashboard.pending_review'), 
            value: stats.pending, 
            icon: Clock, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50',
            trend: t('dashboard.trend_count', { count: stats.pending }),
            trendUp: false
          },
          { 
            label: t('dashboard.approved'), 
            value: stats.approved, 
            icon: CheckCircle2, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50',
            trend: '+8%',
            trendUp: true
          },
          { 
            label: t('dashboard.total_docs'), 
            value: stats.totalDocs, 
            icon: FolderOpen, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50',
            trend: `${stats.verifiedDocs} ${t('dashboard.verified')}`,
            trendUp: true
          },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl", card.bg)}>
                <card.icon size={20} className={card.color} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                {card.trendUp ? (
                  <TrendingUp size={12} className="text-emerald-500" />
                ) : (
                  <Activity size={12} className="text-amber-500" />
                )}
                <span>{card.trend}</span>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tighter">
                {card.value.toLocaleString()}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                {card.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users size={18} className="text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-indigo-600">{t('dashboard.customer_types')}</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{t('dashboard.individual_customers')}</span>
              <span className="text-lg font-bold text-slate-900">{stats.individual}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{t('dashboard.corporate_customers')}</span>
              <span className="text-lg font-bold text-slate-900">{stats.corporate}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileCheck size={18} className="text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-emerald-600">{t('dashboard.approval_status')}</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{t('dashboard.archived')}</span>
              <span className="text-lg font-bold text-slate-900">{stats.archived}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{t('dashboard.correction_needed')}</span>
              <span className="text-lg font-bold text-slate-900">{stats.correction}</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-rose-100 rounded-lg">
              <AlertCircle size={18} className="text-rose-600" />
            </div>
            <span className="text-xs font-bold text-rose-600">{t('dashboard.exceptions')}</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{t('dashboard.rejected')}</span>
              <span className="text-lg font-bold text-slate-900">{stats.rejected}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">{t('dashboard.rejection_rate')}</span>
              <span className="text-lg font-bold text-slate-900">
                {stats.totalCAFs > 0 ? ((stats.rejected / stats.totalCAFs) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent CAF Applications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-indigo-600" />
              {t('dashboard.recent_cafs')}
            </h3>
            <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">
              {t('dashboard.view_all')}
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {recentCAFs.length > 0 ? (
              recentCAFs.map((item, i) => (
                <div key={item.id} className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between border-b last:border-0 border-slate-100 group">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4>
                      <p className="text-xs text-slate-400 font-medium truncate">
                        {item.type} • {item.time} • {item.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wide",
                      getStatusColor(item.status)
                    )}>
                      {getStatusText(item.status)}
                    </span>
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <FileText size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400">{t('dashboard.no_cafs')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('dashboard.new_applications_here')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{t('dashboard.status_distribution')}</h3>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="space-y-4">
              {statusDistribution.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.value}</span>
                  </div>
                  <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className={cn("absolute inset-y-0 left-0 rounded-full", item.color)}
                    />
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    {t('dashboard.percentage', { percentage: item.percentage })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">{t('dashboard.total')}</span>
                <span className="text-lg font-bold text-slate-900">{stats.totalCAFs}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {t('dashboard.total_summary', { total: stats.totalCAFs, pending: stats.pending })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
              <FileText size={20} />
            </div>
            <ArrowUpRight size={20} className="opacity-50 group-hover:opacity-100 transition-all" />
          </div>
          <h4 className="text-lg font-bold mb-1">{t('dashboard.new_caf_card')}</h4>
          <p className="text-sm text-indigo-100">{t('dashboard.new_caf_desc')}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
              <UserCheck size={20} />
            </div>
            <ArrowUpRight size={20} className="opacity-50 group-hover:opacity-100 transition-all" />
          </div>
          <h4 className="text-lg font-bold mb-1">{t('dashboard.approval_center')}</h4>
          <p className="text-sm text-emerald-100">{t('dashboard.approval_center_desc', { pending: stats.pending })}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
              <FolderOpen size={20} />
            </div>
            <ArrowUpRight size={20} className="opacity-50 group-hover:opacity-100 transition-all" />
          </div>
          <h4 className="text-lg font-bold mb-1">{t('dashboard.document_management')}</h4>
          <p className="text-sm text-blue-100">{t('dashboard.document_management_desc', { total: stats.totalDocs })}</p>
        </div>
      </div>
    </div>
  );
}
