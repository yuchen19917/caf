# CAF 管理系统完整流程测试指南

## 🎯 测试目标

验证从模板创建到文档归档的完整业务流程是否正常工作。

---

## 📋 测试前准备

### 1. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:3001/

### 2. 登录系统

- 用户名: 任意
- 密码: 任意
- 验证码: 输入显示的验证码

---

## 🔄 完整流程测试

### 第一步：创建模板

**目的**: 创建一个业务模板供后续使用

1. 点击侧边栏 **"Templates"** 菜单
2. 点击右上角 **"Create New Template"** 按钮
3. 填写表单：
   ```
   Template Name: 企业宽带业务
   Customer Type: Corporate
   Business Type: Broadband Service
   Channel: Direct
   Product: Enterprise Fiber 100M
   Description: 企业宽带接入业务模板
   ```
4. 在富文本编辑器中输入一些法律条款（可选）
5. 点击 **"Confirm & Initialize"**

**✅ 验证点**:
- [ ] 模板列表中出现新模板
- [ ] 状态显示为 "Active"（绿点）
- [ ] 可以点击"查看"按钮预览模板

---

### 第二步：创建 CAF 单

**目的**: 基于业务需求创建客户申请表

1. 点击侧边栏 **"New CAF"** 菜单
2. **Step 1: Type & Profile**
   ```
   Business Type: Enterprise
   Customer Type: Corporate
   Subscriber Name: 测试科技有限公司
   Address: 北京市朝阳区测试路123号
   Mobile: +86 138 0000 0000
   Email: test@example.com
   ```
   点击 **"Next"**

3. **Step 2: Service Details**
   ```
   Required Service: FTTX (FiberOne)
   Service Delivery: Optical Fiber
   Tariff Plan Name: Enterprise 100M
   Subscriber Type: Post Pay
   Billing Cycle: Monthly
   ```
   点击 **"Next"**

4. **Step 3: Documents**
   - 勾选几个必要文档（如 Address of Company, GST Details）
   - 点击 **"Next"**

5. **Step 4: Review & Submit**
   - 检查信息
   - 勾选确认框
   - 点击 **"Submit Application"**

**✅ 验证点**:
- [ ] 显示提交成功页面
- [ ] 显示 CAF 编号（如 CAF-2024-001）
- [ ] 显示提交摘要信息
- [ ] 有 "New Entry" 和 "Return to Registry" 按钮

---

### 第三步：查看待审核列表

**目的**: 确认 CAF 单已进入待审核队列

1. 点击 **"Return to Registry"** 或点击侧边栏 **"Applications"**
2. 在列表中找到刚创建的 CAF

**✅ 验证点**:
- [ ] 列表顶部显示新创建的 CAF
- [ ] 状态显示为 "Pending"（黄色标签）
- [ ] 显示正确的客户名称
- [ ] 显示正确的服务类型
- [ ] 显示提交时间

---

### 第四步：审批 CAF 单

**目的**: 模拟审核人员审批流程

1. 点击侧边栏 **"Audit Portal"** 菜单
2. 在左侧 **"Audit Queue"** 中找到待审核的 CAF
3. 点击该 CAF，右侧显示详细信息
4. 查看以下信息：
   - Identity Cross-reference（身份信息）
   - Biometric Verification（生物特征）
   - Evidence Inspector（证据材料）
5. 点击底部的 **"Approve"** 按钮
6. 观察同步过程：
   - 显示旋转加载动画
   - 显示同步步骤（CRM、BSS、资源激活）
   - 显示传输日志
7. 等待约 5 秒，显示 **"Mission Accomplished"** 页面

**✅ 验证点**:
- [ ] 左侧队列显示待审核 CAF
- [ ] 点击后右侧显示完整信息
- [ ] 审批按钮可点击
- [ ] 显示同步进度（3个步骤）
- [ ] 显示传输日志
- [ ] 最终显示成功页面
- [ ] 显示激活结果（Account ID、状态等）

---

### 第五步：验证 CAF 状态变更

**目的**: 确认 CAF 已被标记为已归档

1. 点击 **"Review next in queue"** 或点击侧边栏 **"Applications"**
2. 在列表中找到刚审批的 CAF

**✅ 验证点**:
- [ ] 状态显示为 "Archived"（灰色标签）
- [ ] 不再出现在审核队列中
- [ ] 仍然可以在列表中查看详情

---

### 第六步：查看归档文件

**目的**: 确认归档文件已生成并显示在文档库

1. 点击侧边栏 **"Documents"** 菜单
2. 在 **"Recent Evidence Filings"** 区域查看
3. 找到最新的归档文件

**✅ 验证点**:
- [ ] 显示新的 PDF 文件
- [ ] 文件名格式：`CAF-2024-XXX-approved-archive.pdf`
- [ ] 状态显示为 "Approved"（绿色勾选图标）
- [ ] 显示文件大小（约 650-1000 KB）
- [ ] 显示归档时间（刚刚）

---

## 🔍 数据验证（浏览器控制台）

### 打开浏览器控制台

按 `F12` 或右键 → 检查 → Console

### 运行测试脚本

1. 复制 `TEST_WORKFLOW.js` 的内容
2. 粘贴到控制台并回车
3. 运行测试命令：

```javascript
// 查看完整测试报告
CAFTest.testFullWorkflow()

// 查看所有数据
CAFTest.viewData()

// 查看待审核 CAF
CAFTest.viewPendingCAFs()

// 查看已归档 CAF
CAFTest.viewArchivedCAFs()

// 查看归档文件
CAFTest.viewArchiveFiles()

// 验证特定 CAF（替换为实际 ID）
CAFTest.verifyCafArchive('CAF-2024-001')
```

---

## 📊 预期结果总结

### 数据流转

```
创建 CAF
  ↓
状态: Pending
  ↓
审批通过
  ↓
状态: Archived + 生成归档文件
  ↓
文档库显示归档文件
```

### 数据结构

**localStorage 中的数据**:
```json
{
  "cafs": [
    {
      "id": "CAF-2024-001",
      "status": "Archived",
      "fullName": "测试科技有限公司",
      ...
    }
  ],
  "archiveEntries": [
    {
      "id": "arc-CAF-2024-001-...",
      "name": "CAF-2024-001-approved-archive.pdf",
      "cafId": "CAF-2024-001",
      "status": "approved",
      ...
    }
  ]
}
```

---

## ⚠️ 常见问题

### 问题 1: 审批后文档库没有显示归档文件

**原因**: 可能是数据没有正确保存

**解决**:
1. 打开控制台运行 `CAFTest.viewArchiveFiles()`
2. 检查是否有归档文件记录
3. 刷新页面重新查看

### 问题 2: CAF 状态没有变为 Archived

**原因**: 审批流程可能被中断

**解决**:
1. 检查控制台是否有错误
2. 重新进入审核门户审批
3. 确保等待完整的同步过程（约 5 秒）

### 问题 3: 数据刷新后丢失

**原因**: localStorage 可能被清除

**解决**:
1. 检查浏览器是否处于隐私模式
2. 检查浏览器设置是否允许 localStorage
3. 运行 `CAFTest.viewData()` 查看数据是否存在

---

## 🧹 清理测试数据

### 方法 1: 使用测试脚本

```javascript
CAFTest.clearData()
// 然后刷新页面
```

### 方法 2: 手动清除

```javascript
localStorage.removeItem('caf-app-registry-v1')
// 然后刷新页面
```

### 方法 3: 清除所有浏览器数据

浏览器设置 → 隐私和安全 → 清除浏览数据 → 选择 localhost

---

## ✅ 测试检查清单

完成以下所有检查项即表示流程测试通过：

- [ ] 1. 成功创建模板
- [ ] 2. 模板在列表中显示
- [ ] 3. 成功创建 CAF 单
- [ ] 4. CAF 显示在待审核列表（状态 Pending）
- [ ] 5. CAF 出现在审核队列
- [ ] 6. 成功审批 CAF（显示同步过程）
- [ ] 7. 显示审批成功页面
- [ ] 8. CAF 状态变为 Archived
- [ ] 9. 归档文件出现在文档库
- [ ] 10. 归档文件信息正确（名称、大小、状态）
- [ ] 11. 数据持久化（刷新后仍存在）
- [ ] 12. 控制台无错误信息

---

## 📝 测试报告模板

```
测试日期: ___________
测试人员: ___________
浏览器: ___________

测试结果:
□ 通过  □ 失败

失败原因（如有）:
_______________________
_______________________

备注:
_______________________
_______________________
```

---

## 🎉 测试完成

如果所有检查项都通过，恭喜！整个 CAF 管理流程已经完全打通！

如有问题，请查看控制台错误信息或联系开发团队。
