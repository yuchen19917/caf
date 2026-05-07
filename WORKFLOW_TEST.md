# CAF 管理系统完整流程测试

## 流程概述

```
模板管理 → 新业务受理 → 审核门户 → 文档库
   ↓           ↓            ↓          ↓
创建模板   创建CAF单    审批通过    查看归档
```

## 详细测试步骤

### 1. 创建模板（模板管理）

**路径**: 模板管理 → 创建新模板

**操作步骤**:
1. 点击侧边栏 "Templates" 菜单
2. 点击 "Create New Template" 按钮
3. 填写模板信息：
   - Template Name: "企业宽带业务"
   - Customer Type: Corporate
   - Business Type: "Broadband Service"
   - Channel: Direct
   - Product: "Enterprise Fiber 100M"
   - Description: "企业宽带接入业务模板"
4. 在富文本编辑器中编辑法律条款
5. 点击 "Confirm & Initialize" 保存

**预期结果**: 
- ✅ 模板列表中显示新创建的模板
- ✅ 状态显示为 "Active"

---

### 2. 创建 CAF 单（新业务受理）

**路径**: 新业务受理 → 填写表单

**操作步骤**:
1. 点击侧边栏 "New CAF" 菜单
2. **Step 1: Type & Profile**
   - Business Type: 选择 "Enterprise"
   - Customer Type: 选择 "Corporate"
   - Subscriber Name: "测试科技有限公司"
   - Address: "北京市朝阳区测试路123号"
   - Mobile: "+86 138 0000 0000"
   - Email: "test@example.com"
3. **Step 2: Service Details**
   - Required Service: "FTTX (FiberOne)"
   - Service Delivery: "Optical Fiber"
   - Tariff Plan Name: "Enterprise 100M"
   - Subscriber Type: "Post Pay"
   - Billing Cycle: "Monthly"
4. **Step 3: Documents**
   - 勾选必要的文档（如营业执照、法人身份证等）
5. **Step 4: Review & Submit**
   - 确认信息无误
   - 勾选确认框
   - 点击 "Submit Application" 提交

**预期结果**:
- ✅ 显示提交成功页面
- ✅ 生成 CAF 编号（如 CAF-2024-001）
- ✅ 状态为 "Pending"

---

### 3. 查看待审核列表（业务申请）

**路径**: 业务申请 → 查看列表

**操作步骤**:
1. 点击侧边栏 "Applications" 菜单
2. 在列表中找到刚创建的 CAF 单

**预期结果**:
- ✅ 列表中显示新创建的 CAF
- ✅ 状态显示为 "Pending"（黄色标签）
- ✅ 显示客户名称、服务类型等信息

---

### 4. 审批 CAF 单（审核门户）

**路径**: 审核门户 → 审批

**操作步骤**:
1. 点击侧边栏 "Audit Portal" 菜单
2. 在左侧队列中找到待审核的 CAF
3. 点击该 CAF，右侧显示详细信息
4. 查看客户信息、生物特征、证据材料
5. 点击 "Approve" 按钮
6. 等待系统同步（显示进度条）
7. 同步完成后显示 "Mission Accomplished"

**预期结果**:
- ✅ 显示同步进度（CRM、BSS 等）
- ✅ 显示 "Mission Accomplished" 成功页面
- ✅ CAF 状态变更为 "Archived"
- ✅ 生成归档文件

---

### 5. 查看归档文件（文档库）

**路径**: 文档库 → 最近文件

**操作步骤**:
1. 点击侧边栏 "Documents" 菜单
2. 在 "Recent Evidence Filings" 区域查看
3. 找到刚归档的 PDF 文件

**预期结果**:
- ✅ 显示归档的 PDF 文件
- ✅ 文件名格式：`CAF-2024-XXX-approved-archive.pdf`
- ✅ 状态显示为 "Approved"（绿色）
- ✅ 显示文件大小和归档时间

---

### 6. 验证完整流程

**返回业务申请列表验证**:
1. 点击侧边栏 "Applications" 菜单
2. 找到之前审批的 CAF

**预期结果**:
- ✅ 状态显示为 "Archived"（灰色标签）
- ✅ 不再出现在审核队列中

---

## 数据流说明

### ApplicationContext 状态管理

```typescript
{
  cafs: CustomerApplicationForm[],        // CAF 单列表
  archiveEntries: ArchivedLibraryFile[]   // 归档文件列表
}
```

### 关键方法

1. **addApplicationFromForm(form)**: 创建新 CAF
   - 生成唯一 ID（CAF-YYYY-XXX）
   - 状态设为 "Pending"
   - 添加到 cafs 数组

2. **approveAndArchive(cafId)**: 审批并归档
   - 更新 CAF 状态为 "Archived"
   - 生成归档文件记录
   - 添加到 archiveEntries 数组

3. **数据持久化**: 使用 localStorage
   - Key: `caf-app-registry-v1`
   - 自动保存 cafs 和 archiveEntries

---

## 测试检查清单

- [ ] 1. 能否成功创建模板
- [ ] 2. 能否成功创建 CAF 单
- [ ] 3. CAF 单是否出现在待审核列表
- [ ] 4. 能否在审核门户看到待审核 CAF
- [ ] 5. 审批流程是否正常（显示同步进度）
- [ ] 6. 审批后 CAF 状态是否变为 "Archived"
- [ ] 7. 归档文件是否出现在文档库
- [ ] 8. 归档文件信息是否正确（名称、大小、状态）
- [ ] 9. 数据是否持久化（刷新页面后仍存在）

---

## 已知问题和改进建议

### 当前实现状态
✅ CAF 创建流程完整
✅ 审批流程完整
✅ 归档流程完整
✅ 文档库显示归档文件
✅ 数据持久化

### 可选改进
- [ ] CAF 表单可以选择模板（当前模板和 CAF 是独立的）
- [ ] 归档文件可以下载或预览
- [ ] 文档库可以按 CAF ID 搜索
- [ ] 审核时可以查看关联的模板

---

## 测试环境

- 浏览器: Chrome/Edge/Firefox
- URL: http://localhost:3001/
- 数据存储: localStorage (caf-app-registry-v1)

---

## 快速测试命令

```bash
# 清除本地数据（重新开始测试）
localStorage.removeItem('caf-app-registry-v1')

# 查看当前数据
console.log(JSON.parse(localStorage.getItem('caf-app-registry-v1')))
```
