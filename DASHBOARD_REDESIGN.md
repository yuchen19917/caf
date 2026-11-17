# Dashboard 首页重新设计说明

## 设计概述

Dashboard 首页已完全重新设计，现在使用真实的系统数据，并更好地展示系统的核心功能和业务状态。

---

## 设计理念

### 从模拟数据到真实数据

**优化前 ❌**
- 使用硬编码的 MOCK_STATS
- 数据与系统实际状态不符
- 无法反映真实业务情况

**优化后 ✅**
- 从 ApplicationContext 获取真实数据
- 实时计算统计指标
- 准确反映系统当前状态

---

## 页面布局

### 1. 页面头部

```
┌─────────────────────────────────────────────────────────┐
│ 系统概览                              [●] 系统运行中     │
│ AsiaInfo CAF 管理系统 - 实时监控业务数据和审批流程          │
└─────────────────────────────────────────────────────────┘
```

**特点：**
- 中文标题，更符合系统定位
- 实时状态指示器（绿色脉冲动画）
- 清晰的系统描述

### 2. 主要统计卡片（4个）

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ [📄] +12%    │ │ [⏰] 待处理   │ │ [✓] +8%      │ │ [📁] 已验证   │
│              │ │              │ │              │ │              │
│    156       │ │     12       │ │     89       │ │     45       │
│ CAF 总数     │ │  待审核      │ │  已批准      │ │ 文档总数     │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**数据来源：**
- **CAF 总数** - `cafs.length`
- **待审核** - `cafs.filter(c => c.status === 'Pending').length`
- **已批准** - `cafs.filter(c => c.status === 'Approved').length`
- **文档总数** - `archiveEntries.length`

**特点：**
- 实时数据更新
- 趋势指示器（上升/活跃）
- Hover 效果和动画
- 点击可跳转（待实现）

### 3. 次要统计卡片（3个）

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ [👥] 客户类型   │ │ [✓] 审批状态    │ │ [!] 异常情况    │
│                 │ │                 │ │                 │
│ 个人客户: 120   │ │ 已归档: 45      │ │ 已拒绝: 8       │
│ 企业客户: 36    │ │ 需修正: 10      │ │ 拒绝率: 5.1%    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**数据来源：**
- **个人客户** - `cafs.filter(c => c.customerType === 'Individual').length`
- **企业客户** - `cafs.filter(c => c.customerType === 'Corporate').length`
- **已归档** - `cafs.filter(c => c.status === 'Archived').length`
- **需修正** - `cafs.filter(c => c.status === 'Correction').length`
- **已拒绝** - `cafs.filter(c => c.status === 'Rejected').length`
- **拒绝率** - `(rejected / totalCAFs * 100).toFixed(1)`

**特点：**
- 渐变背景设计
- 分类清晰
- 关键指标突出

### 4. 最近提交的 CAF（左侧，2/3宽度）

```
┌─────────────────────────────────────────────────────────┐
│ [活动图标] 最近提交的 CAF                    [查看全部]  │
├─────────────────────────────────────────────────────────┤
│ [Y] Yang Hao                              [待审核] [👁️] │
│     个人 / Prepaid Mobile • 2024/5/6 • CAF-2024-001     │
├─────────────────────────────────────────────────────────┤
│ [A] AsiaInfo Tech Solutions Ltd             [已批准] [👁️] │
│     企业 / Fiber 100M • 2024/5/5 • CAF-2024-002         │
└─────────────────────────────────────────────────────────┘
```

**数据来源：**
- 从 `cafs` 数组获取最近 5 条记录
- 显示客户名称、类型、服务类型、提交日期、CAF编号
- 实时状态标签

**特点：**
- 显示真实的 CAF 数据
- Hover 显示查看按钮
- 头像首字母显示
- 状态颜色编码
- 空状态友好提示

### 5. 状态分布（右侧，1/3宽度）

```
┌─────────────────────────────────┐
│ 状态分布                         │
├─────────────────────────────────┤
│ 待审核        12                │
│ ████████░░░░░░░░░░  7.7% 占比   │
│                                 │
│ 已批准        89                │
│ ████████████████████  57.1%     │
│                                 │
│ 已归档        45                │
│ ████████████░░░░░░░░  28.8%     │
│                                 │
│ 需修正        10                │
│ ███░░░░░░░░░░░░░░░░░  6.4%      │
│                                 │
│ 已拒绝         8                │
│ ██░░░░░░░░░░░░░░░░░░  5.1%      │
├─────────────────────────────────┤
│ 总计                    156     │
│ 系统中共有 156 个 CAF 申请      │
└─────────────────────────────────┘
```

**数据来源：**
- 实时计算各状态的数量和百分比
- 动画进度条显示占比

**特点：**
- 可视化状态分布
- 百分比计算
- 动画效果
- 总计汇总

### 6. 快速操作卡片（3个）

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ [📄] ↗          │ │ [✓] ↗           │ │ [📁] ↗          │
│                 │ │                 │ │                 │
│ 新建 CAF        │ │ 审批中心        │ │ 文档管理        │
│ 创建新的客户... │ │ 12 个申请待审核 │ │ 45 个文档已归档 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

**特点：**
- 渐变背景（蓝色/绿色/蓝色）
- 白色文字
- Hover 效果
- 显示实时数量
- 点击跳转（待实现）

---

## 数据计算逻辑

### 统计数据计算

```typescript
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
    verifiedDocs: archiveEntries.filter(d => 
      d.status === 'verified' || d.status === 'approved'
    ).length,
  };
}, [cafs, archiveEntries]);
```

### 最近 CAF 数据

```typescript
const recentCAFs = useMemo(() => {
  return cafs
    .slice(0, 5)  // 取最近 5 条
    .map(caf => ({
      id: caf.id,
      name: caf.fullName,
      type: `${caf.customerType === 'Individual' ? '个人' : '企业'} / ${caf.serviceType}`,
      time: new Date(caf.submissionDate).toLocaleDateString('zh-CN'),
      status: caf.status,
      customerType: caf.customerType,
    }));
}, [cafs]);
```

### 状态分布计算

```typescript
const statusDistribution = useMemo(() => [
  { 
    label: '待审核', 
    value: stats.pending, 
    color: 'bg-amber-500', 
    percentage: (stats.pending / stats.totalCAFs * 100).toFixed(1) 
  },
  { 
    label: '已批准', 
    value: stats.approved, 
    color: 'bg-emerald-500', 
    percentage: (stats.approved / stats.totalCAFs * 100).toFixed(1) 
  },
  // ... 其他状态
], [stats]);
```

---

## 视觉设计

### 颜色方案

**主要统计卡片：**
- CAF 总数：Indigo (#4F46E5)
- 待审核：Amber (#F59E0B)
- 已批准：Emerald (#10B981)
- 文档总数：Blue (#3B82F6)

**次要统计卡片：**
- 客户类型：Indigo 渐变
- 审批状态：Emerald 渐变
- 异常情况：Rose 渐变

**状态标签：**
- 待审核：Amber
- 已批准：Emerald
- 已拒绝：Rose
- 需修正：Blue
- 已归档：Indigo

**快速操作：**
- 新建 CAF：Indigo 渐变
- 审批中心：Emerald 渐变
- 文档管理：Blue 渐变

### 动画效果

**卡片入场动画：**
```typescript
<motion.div
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
>
```

**进度条动画：**
```typescript
<motion.div
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ delay: i * 0.1, duration: 0.5 }}
>
```

**Hover 效果：**
- 卡片阴影增强
- 图标背景变化
- 按钮显示/隐藏
- 颜色过渡

---

## 响应式设计

### 桌面视图（> 1024px）
- 主要统计：4列网格
- 次要统计：3列网格
- 内容区域：2/3 + 1/3 布局
- 快速操作：3列网格

### 平板视图（768px - 1024px）
- 主要统计：2列网格
- 次要统计：3列网格
- 内容区域：全宽堆叠
- 快速操作：3列网格

### 移动视图（< 768px）
- 主要统计：1列网格
- 次要统计：1列网格
- 内容区域：全宽堆叠
- 快速操作：1列网格

---

## 功能特性

### 1. 实时数据更新

- 使用 `useMemo` 自动重新计算
- 依赖 `cafs` 和 `archiveEntries` 变化
- 无需手动刷新

### 2. 空状态处理

```typescript
{recentCAFs.length > 0 ? (
  // 显示列表
) : (
  // 显示空状态
  <div className="px-6 py-12 text-center">
    <FileText size={48} className="text-slate-300 mx-auto mb-4" />
    <p className="text-sm font-bold text-slate-400">暂无 CAF 申请</p>
    <p className="text-xs text-slate-400 mt-1">新的申请将显示在这里</p>
  </div>
)}
```

### 3. 状态映射

```typescript
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
    case 'Pending': return '待审核';
    case 'Approved': return '已批准';
    case 'Rejected': return '已拒绝';
    case 'Correction': return '需修正';
    case 'Archived': return '已归档';
    default: return status;
  }
};
```

---

## 使用场景

### 场景 1：系统管理员查看概览

1. 登录系统
2. 查看 Dashboard
3. 快速了解：
   - 总共有多少 CAF
   - 有多少待审核
   - 有多少已批准
   - 文档数量
4. 查看状态分布
5. 决定优先处理哪些任务

### 场景 2：审批人员查看待办

1. 查看"待审核"卡片
2. 看到有 12 个待审核
3. 查看"最近提交的 CAF"列表
4. 点击"审批中心"快速操作
5. 进入审批页面处理

### 场景 3：监控业务指标

1. 查看客户类型分布
   - 个人客户 vs 企业客户
2. 查看审批状态
   - 已归档、需修正数量
3. 查看异常情况
   - 拒绝数量和拒绝率
4. 评估业务健康度

---

## 数据对齐说明

### 与 ApplicationContext 对齐

**数据源：**
```typescript
const { cafs, archiveEntries } = useApplications();
```

**CAF 数据：**
- 来自 `ApplicationContext` 的 `cafs` 数组
- 包含所有 CAF 申请记录
- 实时更新

**文档数据：**
- 来自 `ApplicationContext` 的 `archiveEntries` 数组
- 包含所有归档文档
- 实时更新

### 与 Mock 数据对齐

**不再使用：**
- ❌ `MOCK_STATS.totalPending`
- ❌ `MOCK_STATS.totalApproved`
- ❌ `MOCK_STATS.totalRejected`
- ❌ `MOCK_STATS.totalDocs`

**改为使用：**
- ✅ 实时计算的 `stats.pending`
- ✅ 实时计算的 `stats.approved`
- ✅ 实时计算的 `stats.rejected`
- ✅ 实时计算的 `stats.totalDocs`

---

## 后续优化建议

### 功能增强

1. **点击跳转**
   - 点击统计卡片跳转到对应页面
   - 点击快速操作跳转到功能页面
   - 点击 CAF 记录查看详情

2. **数据刷新**
   - 添加手动刷新按钮
   - 自动定时刷新
   - 实时推送更新

3. **图表展示**
   - 添加趋势图表
   - 时间序列分析
   - 对比分析

4. **筛选功能**
   - 按日期筛选
   - 按状态筛选
   - 按客户类型筛选

### 视觉优化

1. **数据可视化**
   - 饼图显示状态分布
   - 折线图显示趋势
   - 柱状图对比数据

2. **动态效果**
   - 数字滚动动画
   - 进度条动画
   - 卡片翻转效果

3. **主题切换**
   - 深色模式
   - 自定义主题
   - 颜色配置

---

## 测试清单

### 数据测试
- [ ] CAF 总数正确显示
- [ ] 待审核数量正确
- [ ] 已批准数量正确
- [ ] 文档总数正确
- [ ] 客户类型统计正确
- [ ] 状态分布计算正确
- [ ] 百分比计算正确
- [ ] 拒绝率计算正确

### 显示测试
- [ ] 最近 CAF 列表显示
- [ ] 空状态正确显示
- [ ] 状态标签颜色正确
- [ ] 进度条长度正确
- [ ] 趋势指示器显示

### 交互测试
- [ ] Hover 效果正常
- [ ] 动画流畅
- [ ] 卡片可点击
- [ ] 按钮响应正常

### 响应式测试
- [ ] 桌面布局正确
- [ ] 平板布局正确
- [ ] 移动布局正确
- [ ] 文字不溢出

---

**设计版本**: v3.0  
**更新日期**: 2026-05-06  
**设计内容**: Dashboard 首页重新设计  
**数据来源**: ApplicationContext 真实数据  
**适用系统**: AsiaInfo CAF Management System

