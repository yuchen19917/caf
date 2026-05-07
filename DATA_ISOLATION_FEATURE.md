# 数据隔离功能实现

## 实施日期
2026年5月6日

---

## 功能概述

实现基于角色的数据隔离，确保 **Agent（代理人员）** 只能查看和管理自己创建的 CAF 申请和相关数据，而 **Admin（管理员）** 和 **Auditor（审批人员）** 可以查看所有数据。

---

## 数据隔离规则

### 角色权限对比

| 角色 | 可见数据范围 | 说明 |
|------|-------------|------|
| **Admin** | 所有数据 | 管理员可以查看和管理所有用户创建的 CAF 申请 |
| **Auditor** | 所有数据 | 审批人员需要查看所有待审核的 CAF 申请 |
| **Agent** | 仅自己创建的数据 | 代理人员只能查看和管理自己创建的 CAF 申请 |

---

## 技术实现

### 1. 数据结构更新

#### `src/types.ts` - CAF 数据结构
添加创建者信息字段：

```typescript
export interface CustomerApplicationForm {
  id: string;
  // ... 其他字段
  createdBy?: string;           // 创建者用户ID
  createdByUsername?: string;   // 创建者用户名
  // ...
}
```

**字段说明：**
- `createdBy`: 存储创建者的用户ID（如 "USR-AGENT-001"）
- `createdByUsername`: 存储创建者的用户名（如 "agent"）

---

### 2. Context 层更新

#### `src/context/ApplicationContext.tsx`

**新增功能：**

1. **更新函数签名** - 添加 user 参数
```typescript
addApplicationFromForm: (form: CAFFormShape, user: User) => CustomerApplicationForm;
resubmitCorrection: (cafId: string, form: CAFFormShape, user: User) => CustomerApplicationForm;
```

2. **自动记录创建者**
```typescript
const addApplicationFromForm = useCallback((form: CAFFormShape, user: User) => {
  created = buildCafFromForm(form, s.cafs);
  created = {
    ...created,
    createdBy: user.id,
    createdByUsername: user.username,
  };
  // ...
}, []);
```

3. **数据过滤函数**
```typescript
const getFilteredCAFs = useCallback((user: User): CustomerApplicationForm[] => {
  // Admin 和 Auditor 可以看到所有 CAF
  if (user.role === 'admin' || user.role === 'auditor') {
    return cafs;
  }
  
  // Agent 只能看到自己创建的 CAF
  if (user.role === 'agent') {
    return cafs.filter(caf => 
      caf.createdBy === user.id || 
      caf.createdByUsername === user.username
    );
  }
  
  return cafs;
}, [cafs]);
```

---

### 3. 组件层更新

#### A. `src/App.tsx`
传递用户信息到各个组件：

```typescript
case 'dashboard': return <Dashboard user={user} />;
case 'applications': return <CAFList user={user} />;
case 'new-caf': return <CAFForm user={user} />;
case 'documents': return <DocumentLibrary user={user} />;
```

#### B. `src/components/CAFForm.tsx`
接收用户信息并在提交时记录创建者：

```typescript
export default function CAFForm({ user, ... }) {
  const handleSubmit = () => {
    const record = initialData?.id
      ? resubmitCorrection(initialData.id, form, user)
      : addApplicationFromForm(form, user);
    // ...
  };
}
```

#### C. `src/components/CAFList.tsx`
使用过滤后的 CAF 列表：

```typescript
export default function CAFList({ user, ... }) {
  const { getFilteredCAFs } = useApplications();
  
  // 根据用户角色获取过滤后的 CAF
  const cafs = useMemo(() => getFilteredCAFs(user), [getFilteredCAFs, user]);
  
  // 后续使用 cafs 进行搜索和显示
}
```

#### D. `src/components/Dashboard.tsx`
统计数据基于过滤后的 CAF：

```typescript
export default function Dashboard({ user }) {
  const { getFilteredCAFs } = useApplications();
  
  // 获取过滤后的 CAF
  const cafs = useMemo(() => getFilteredCAFs(user), [getFilteredCAFs, user]);
  
  // 基于过滤后的数据计算统计
  const stats = useMemo(() => {
    const pending = cafs.filter(c => c.status === 'Pending').length;
    // ...
  }, [cafs]);
}
```

#### E. `src/components/DocumentLibrary.tsx`
文档列表基于过滤后的 CAF：

```typescript
export default function DocumentLibrary({ user }) {
  const { getFilteredCAFs } = useApplications();
  
  // 获取过滤后的 CAF
  const cafs = useMemo(() => getFilteredCAFs(user), [getFilteredCAFs, user]);
  
  // 从 CAF 中提取文档
  const documents = useMemo(() => {
    const docs = [];
    cafs.forEach(caf => {
      if (caf.documents) {
        caf.documents.forEach(doc => {
          docs.push({
            ...doc,
            cafId: caf.id,
            customerName: caf.fullName,
            uploadedBy: caf.createdByUsername,
            // ...
          });
        });
      }
    });
    return docs;
  }, [cafs]);
}
```

---

## 数据流图

### Admin/Auditor 数据流
```
User Login (admin/auditor)
    ↓
getFilteredCAFs(user)
    ↓
role === 'admin' || role === 'auditor'
    ↓
返回所有 CAF 数据
    ↓
显示在各个组件中
```

### Agent 数据流
```
User Login (agent)
    ↓
getFilteredCAFs(user)
    ↓
role === 'agent'
    ↓
过滤: caf.createdBy === user.id
    ↓
返回仅该 Agent 创建的 CAF
    ↓
显示在各个组件中
```

### 创建新 CAF 流程
```
Agent 填写 CAF 表单
    ↓
点击提交
    ↓
addApplicationFromForm(form, user)
    ↓
自动添加 createdBy 和 createdByUsername
    ↓
保存到 localStorage
    ↓
该 CAF 与创建者关联
```

---

## 影响的功能模块

### 1. Dashboard（仪表板）
- ✅ 统计数据基于过滤后的 CAF
- ✅ Agent 只看到自己的统计
- ✅ Admin/Auditor 看到全局统计

### 2. Applications（业务申请）
- ✅ CAF 列表基于过滤后的数据
- ✅ Agent 只看到自己创建的申请
- ✅ Admin/Auditor 看到所有申请

### 3. Documents（文档库）
- ✅ 文档列表基于过滤后的 CAF
- ✅ Agent 只看到自己 CAF 的文档
- ✅ Admin/Auditor 看到所有文档

### 4. New CAF（新建申请）
- ✅ 提交时自动记录创建者
- ✅ 创建者信息持久化到 localStorage

### 5. Audit Portal（审核门户）
- ⚠️ 暂未修改（Auditor 需要看到所有待审核的 CAF）
- 建议：保持现状，Auditor 可以看到所有数据

---

## 测试场景

### 测试用例 1: Agent 创建 CAF
1. 使用 agent/agent123 登录
2. 创建新的 CAF 申请
3. 提交申请
4. 验证 CAF 数据包含 `createdBy: "USR-AGENT-001"`
5. 验证 CAF 数据包含 `createdByUsername: "agent"`

### 测试用例 2: Agent 查看自己的数据
1. 使用 agent/agent123 登录
2. 进入 Dashboard
3. 验证统计数据只包含该 Agent 创建的 CAF
4. 进入 Applications
5. 验证列表只显示该 Agent 创建的 CAF
6. 进入 Documents
7. 验证文档只来自该 Agent 的 CAF

### 测试用例 3: Agent 无法看到其他人的数据
1. 使用 agent/agent123 登录
2. 记录当前可见的 CAF 数量
3. 退出登录
4. 使用 admin/admin123 登录
5. 创建新的 CAF 申请
6. 退出登录
7. 再次使用 agent/agent123 登录
8. 验证 CAF 数量未增加（看不到 admin 创建的）

### 测试用例 4: Admin 查看所有数据
1. 使用 admin/admin123 登录
2. 进入 Applications
3. 验证可以看到所有用户创建的 CAF
4. 验证列表中包含不同 createdByUsername 的 CAF

### 测试用例 5: Auditor 查看所有数据
1. 使用 auditor/auditor123 登录
2. 进入 Audit Portal
3. 验证可以看到所有待审核的 CAF
4. 验证可以审核任何用户创建的 CAF

### 测试用例 6: 多个 Agent 数据隔离
1. 创建第二个 Agent 账号（如果有用户管理功能）
2. Agent1 登录并创建 CAF-A
3. 退出，Agent2 登录并创建 CAF-B
4. 验证 Agent1 只能看到 CAF-A
5. 验证 Agent2 只能看到 CAF-B
6. 验证 Admin 可以看到 CAF-A 和 CAF-B

---

## 数据持久化

### localStorage 结构
```json
{
  "caf-app-registry-v1": {
    "cafs": [
      {
        "id": "CAF-2024-001",
        "fullName": "John Doe",
        "createdBy": "USR-AGENT-001",
        "createdByUsername": "agent",
        "status": "Pending",
        // ... 其他字段
      },
      {
        "id": "CAF-2024-002",
        "fullName": "Jane Smith",
        "createdBy": "USR-ADMIN-001",
        "createdByUsername": "admin",
        "status": "Approved",
        // ... 其他字段
      }
    ],
    "archiveEntries": [...]
  }
}
```

---

## 安全考虑

### 1. 前端过滤
- ✅ 数据在前端通过 `getFilteredCAFs` 过滤
- ⚠️ 注意：所有数据仍存储在 localStorage 中
- ⚠️ 技术上，用户可以通过浏览器开发工具查看所有数据

### 2. 生产环境建议
对于生产环境，建议：
1. **后端 API 过滤**: 在服务器端根据用户角色过滤数据
2. **JWT 令牌**: 使用 JWT 验证用户身份
3. **API 权限检查**: 每个 API 请求都验证用户权限
4. **数据加密**: 敏感数据加密存储
5. **审计日志**: 记录所有数据访问操作

### 3. 当前实现的局限性
- 数据存储在客户端 localStorage
- 没有服务器端验证
- 用户可以通过开发工具修改数据
- 适用于演示和开发环境

---

## 未来增强

### 短期改进
1. 在 CAF 列表中显示创建者信息
2. 添加"创建者"筛选器
3. 在文档详情中显示上传者信息
4. 添加数据访问日志

### 中期改进
1. 实现后端 API
2. 服务器端数据过滤
3. 基于令牌的认证
4. 细粒度权限控制

### 长期改进
1. 多租户支持
2. 数据加密
3. 审计追踪
4. 合规性报告

---

## 修改文件清单

### 核心文件
1. ✅ `src/types.ts` - 添加 createdBy 字段
2. ✅ `src/context/ApplicationContext.tsx` - 实现数据过滤逻辑
3. ✅ `src/components/CAFForm.tsx` - 记录创建者
4. ✅ `src/components/CAFList.tsx` - 使用过滤数据
5. ✅ `src/components/Dashboard.tsx` - 使用过滤数据
6. ✅ `src/components/DocumentLibrary.tsx` - 使用过滤数据
7. ✅ `src/App.tsx` - 传递用户信息

### 文档文件
- `DATA_ISOLATION_FEATURE.md` - 本文件（功能文档）

---

## 兼容性说明

### 现有数据
- 现有的 CAF 数据（没有 createdBy 字段）仍然可以正常显示
- Admin 和 Auditor 可以看到所有现有数据
- Agent 看不到没有 createdBy 字段的旧数据
- 建议：运行数据迁移脚本为旧数据添加默认创建者

### 数据迁移
如需迁移现有数据，可以在 ApplicationContext 中添加：

```typescript
// 数据迁移：为旧数据添加默认创建者
useEffect(() => {
  const needsMigration = cafs.some(caf => !caf.createdBy);
  if (needsMigration) {
    setState(s => ({
      ...s,
      cafs: s.cafs.map(caf => ({
        ...caf,
        createdBy: caf.createdBy || 'USR-ADMIN-001',
        createdByUsername: caf.createdByUsername || 'admin',
      })),
    }));
  }
}, []);
```

---

## 状态: ✅ 完成

数据隔离功能已完全实现并集成到应用中。

**关键特性：**
- ✅ Agent 只能看到自己创建的 CAF
- ✅ Admin 和 Auditor 可以看到所有 CAF
- ✅ 自动记录创建者信息
- ✅ 所有相关组件已更新
- ✅ 数据持久化到 localStorage
- ✅ 无编译错误

**开发服务器**: 正在运行
**准备测试**: 是

---

## 相关文档
- `RBAC_IMPLEMENTATION.md` - RBAC 系统详细文档
- `SYSTEM_MANAGEMENT_FEATURE.md` - 系统管理功能文档
- `src/lib/auth.ts` - 认证和授权核心代码
- `src/context/ApplicationContext.tsx` - 应用上下文和数据管理
