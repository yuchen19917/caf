# 数据隔离功能 - 快速参考

## ✅ 已完成

Agent 角色现在只能查看和管理自己创建的 CAF 申请和相关数据。

---

## 数据可见性规则

| 角色 | 可见数据 | 说明 |
|------|---------|------|
| **Admin** | 所有数据 | 管理员可以查看所有用户的 CAF |
| **Auditor** | 所有数据 | 审批人员可以查看所有待审核的 CAF |
| **Agent** | 仅自己创建的 | 代理人员只能看到自己创建的 CAF |

---

## 影响的功能

### 1. Dashboard（仪表板）
- Agent 看到的统计数据只包含自己创建的 CAF
- Admin/Auditor 看到全局统计

### 2. Applications（业务申请）
- Agent 的列表只显示自己创建的申请
- Admin/Auditor 看到所有申请

### 3. Documents（文档库）
- Agent 只看到自己 CAF 的文档
- Admin/Auditor 看到所有文档

### 4. New CAF（新建申请）
- 提交时自动记录创建者信息
- 包含用户ID和用户名

---

## 技术实现

### 数据结构
```typescript
interface CustomerApplicationForm {
  // ... 其他字段
  createdBy?: string;           // 创建者用户ID
  createdByUsername?: string;   // 创建者用户名
}
```

### 过滤逻辑
```typescript
// 在 ApplicationContext 中
const getFilteredCAFs = (user: User) => {
  if (user.role === 'admin' || user.role === 'auditor') {
    return cafs; // 返回所有数据
  }
  
  if (user.role === 'agent') {
    return cafs.filter(caf => 
      caf.createdBy === user.id || 
      caf.createdByUsername === user.username
    ); // 只返回自己创建的
  }
  
  return cafs;
};
```

---

## 测试步骤

### 测试 Agent 数据隔离
1. 使用 `agent/agent123` 登录
2. 创建一个新的 CAF 申请
3. 查看 Dashboard - 应该只显示自己的统计
4. 查看 Applications - 应该只显示自己创建的申请
5. 退出登录

### 测试 Admin 查看所有数据
1. 使用 `admin/admin123` 登录
2. 查看 Applications - 应该看到所有用户创建的申请
3. 包括 agent 创建的申请

### 测试多个 Agent 隔离
1. Agent1 登录并创建 CAF-A
2. 退出，Agent2 登录并创建 CAF-B
3. Agent1 再次登录 - 只能看到 CAF-A
4. Agent2 再次登录 - 只能看到 CAF-B
5. Admin 登录 - 可以看到 CAF-A 和 CAF-B

---

## 修改的文件

1. ✅ `src/types.ts` - 添加 createdBy 字段
2. ✅ `src/context/ApplicationContext.tsx` - 实现过滤逻辑
3. ✅ `src/components/CAFForm.tsx` - 记录创建者
4. ✅ `src/components/CAFList.tsx` - 使用过滤数据
5. ✅ `src/components/Dashboard.tsx` - 使用过滤数据
6. ✅ `src/components/DocumentLibrary.tsx` - 使用过滤数据
7. ✅ `src/App.tsx` - 传递用户信息

---

## 数据示例

### Agent 创建的 CAF
```json
{
  "id": "CAF-2024-001",
  "fullName": "John Doe",
  "createdBy": "USR-AGENT-001",
  "createdByUsername": "agent",
  "status": "Pending"
}
```

### Admin 创建的 CAF
```json
{
  "id": "CAF-2024-002",
  "fullName": "Jane Smith",
  "createdBy": "USR-ADMIN-001",
  "createdByUsername": "admin",
  "status": "Approved"
}
```

---

## 注意事项

### 现有数据
- 旧的 CAF 数据（没有 createdBy 字段）
- Agent 看不到这些旧数据
- Admin 和 Auditor 可以看到

### 数据迁移建议
为旧数据添加默认创建者：
```typescript
// 在 ApplicationContext 中添加
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

## 状态: ✅ 完成并可测试

**开发服务器**: http://localhost:3000  
**编译状态**: 成功  
**热重载**: 已完成

立即测试：
1. 打开浏览器访问 http://localhost:3000
2. 使用 agent/agent123 登录
3. 创建新的 CAF 申请
4. 验证只能看到自己创建的数据
5. 退出并使用 admin/admin123 登录
6. 验证可以看到所有数据

---

## 相关文档
- `DATA_ISOLATION_FEATURE.md` - 详细技术文档
- `RBAC_IMPLEMENTATION.md` - RBAC 系统文档
- `SYSTEM_MANAGEMENT_FEATURE.md` - 系统管理功能文档
