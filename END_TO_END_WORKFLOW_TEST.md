# 端到端工作流测试文档

## 测试日期
2026年5月6日

## 测试目标
确保从模板创建到申请单、审批、文档归档的完整流程能够正常工作，并且所有数据都能持久化到本地存储。

---

## 数据持久化机制

### 1. 模板数据存储
- **存储键**: `caf_templates_store_v2`
- **存储位置**: `localStorage`
- **数据结构**: `CAFTemplate[]`
- **初始化**: 从 `data/template_data.json` 加载种子数据
- **持久化**: 每次模板变更时自动保存
- **文件**: `src/lib/templateRepository.ts`

### 2. CAF申请单数据存储
- **存储键**: `caf-app-registry-v1`
- **存储位置**: `localStorage`
- **数据结构**: 
  ```typescript
  {
    cafs: CustomerApplicationForm[],
    archiveEntries: ArchivedLibraryFile[]
  }
  ```
- **初始化**: 从 `MOCK_CAFS` 加载初始数据
- **持久化**: 每次CAF或归档数据变更时自动保存
- **文件**: `src/context/ApplicationContext.tsx`

### 3. 全局规则数据存储
- **存储键**: `global_rules_v1`
- **存储位置**: `localStorage`
- **数据结构**: `GlobalRule[]`
- **初始化**: 从 `data/global_rules.json` 加载
- **持久化**: 每次规则变更时自动保存
- **文件**: `src/lib/globalRulesData.ts`

---

## 完整工作流程

### 阶段1: 模板管理
```
用户操作流程:
1. 登录系统
2. 进入"模板管理"页面
3. 点击"新建模板"按钮
4. 填写模板信息:
   - 模板名称: "Enterprise Broadband 2026"
   - 客户类型: Corporate
   - 业务类型: "Enterprise Broadband"
   - 渠道: Direct Sales
   - 产品: "Fiber 100M"
   - 描述: "2026年企业宽带服务模板"
   - 法律条款: (富文本编辑器)
5. 点击"确认并初始化"
6. 模板创建成功

数据流:
- TemplateManagement组件 → useTemplates hook
- useTemplates → templateRepository.saveTemplates()
- 数据保存到 localStorage['caf_templates_store_v2']

验证点:
✓ 模板列表中显示新模板
✓ 刷新页面后模板仍然存在
✓ localStorage中有对应数据
```

### 阶段2: 创建CAF申请单
```
用户操作流程:
1. 点击侧边栏"新业务受理"或"New CAF Entry"
2. 进入CAF表单页面

步骤1 - 类型与档案:
- 选择业务类型: Enterprise
- 选择客户类型: Corporate
- 填写公司名称: "Afghan Tech Solutions Ltd"
- 填写许可证详情: "ISP-2026-001"
- 填写董事姓名: "Mohammad Karimi"
- 选择申请人类型: "Pvt. Ltd. Company"
- 填写安装地址: "Kabul Business District, Afghanistan"
- 填写注册手机: "+93 700 123 456"
- 填写备用号码: "+93 700 123 457"
- 填写注册邮箱: "info@afghantech.af"
- 填写授权签字人信息
- 填写技术协调员信息
- 填写账单协调员信息

步骤2 - 服务详情:
- 选择所需服务: "FTTX (FiberOne)"
- 选择服务交付: "Optical Fiber"
- 填写激活费: "USD 100"
- 填写押金: "USD 200"
- 填写CPE成本: "USD 50"
- 填写CPE租金: "USD 10/mo"
- 选择用户类型: "Post Pay"
- 选择账单周期: "Monthly"
- 填写资费计划: "Enterprise Fiber 100M"
- 静态IP: Yes, 5个

步骤3 - 文档:
- 勾选所需文档:
  ✓ Address of Company
  ✓ GST Details
  ✓ Identity Proof
  ✓ Registration of Company
  ✓ PAN Card (Signatory)
  ✓ Aadhar Card (Signatory)

步骤4 - 审核与提交:
- 审核所有信息
- 勾选"I confirm all information is accurate"
- 点击"Submit Application"

数据流:
- CAFForm组件 → buildCafFromForm()
- ApplicationContext.addApplicationFromForm()
- 新CAF添加到 cafs 数组
- 自动保存到 localStorage['caf-app-registry-v1']

验证点:
✓ 显示提交成功页面
✓ 显示CAF编号 (例如: CAF-2026-001)
✓ 点击"Return to Registry"返回列表
✓ 列表中显示新创建的CAF
✓ 状态为"Pending"
✓ 刷新页面后CAF仍然存在
```

### 阶段3: 审核流程
```
用户操作流程:
1. 进入"审核门户"页面
2. 在审核队列中看到待审核的CAF
3. 点击CAF进入审核详情
4. 查看客户信息:
   - 姓名/公司名
   - 证件号码
   - 联系方式
   - 地址
5. 查看生物特征验证状态
6. 查看证据文档列表
7. 审核评分显示

审批操作选项:
A. 批准 (Approve):
   - 点击"Approve"按钮
   - 显示系统对接动画
   - 连接CRM核心
   - 开通BSS计费账户
   - 执行资源开通
   - 显示"Mission Accomplished"
   - CAF状态变为"Archived"
   - 生成归档文件

B. 退回修改 (Correct):
   - 点击"Correct"按钮
   - CAF状态变为"Correction"
   - 用户可以在CAFList中点击修改

C. 拒绝 (Reject):
   - 点击"Reject"按钮
   - CAF状态变为"Rejected"

数据流 (批准流程):
- AuditPortal组件 → ApplicationContext.approveAndArchive()
- CAF状态更新为"Archived"
- 创建归档文件记录
- 添加到 archiveEntries 数组
- 自动保存到 localStorage['caf-app-registry-v1']

验证点:
✓ 审核队列正确显示待审核CAF
✓ 审核详情页显示完整信息
✓ 批准后CAF状态变为"Archived"
✓ 归档文件出现在文档库
✓ 刷新页面后状态保持
```

### 阶段4: 文档管理
```
用户操作流程:
1. 进入"文档管理"页面
2. 查看统计概览:
   - 总文档数
   - 已验证
   - 待审核
   - 已拒绝
3. 查看文档分类:
   - 证件文档
   - 客户照片
   - 签名文件
   - 地址证明
   - 授权书
   - 合同文件
   - 企业证明
   - 支付凭证
4. 搜索和筛选文档
5. 查看文档列表:
   - 文档名称
   - 文档分类
   - 客户信息
   - 业务类型
   - CAF编号
   - 上传日期
6. 点击"查看详情"查看文档详情
7. 点击"下载文档"下载文件

上传新文档:
1. 点击"上传文档"按钮
2. 选择文档分类
3. 输入关联CAF编号
4. 添加备注
5. 上传文件
6. 点击"开始上传"

数据流:
- DocumentLibrary组件显示归档文件
- 从 ApplicationContext.archiveEntries 读取
- 数据来自 localStorage['caf-app-registry-v1']

验证点:
✓ 文档库显示所有归档文件
✓ 可以按分类筛选
✓ 可以搜索文档
✓ 文档详情显示完整信息
✓ 刷新页面后文档仍然存在
```

### 阶段5: 修正流程 (Correction)
```
用户操作流程:
1. 在审核门户中将CAF状态设为"Correction"
2. 返回"业务申请"列表
3. 找到状态为"Correction"的CAF
4. 点击修改按钮
5. 进入CAF表单编辑模式
6. 修改需要更正的信息
7. 重新提交
8. CAF状态变回"Pending"
9. 重新进入审核流程

数据流:
- CAFList → onCorrect → CAFForm (with initialData)
- CAFForm → ApplicationContext.resubmitCorrection()
- 更新现有CAF记录
- 状态重置为"Pending"
- 自动保存到 localStorage

验证点:
✓ 修改按钮只对"Correction"状态的CAF显示
✓ 表单预填充现有数据
✓ 提交后CAF状态变为"Pending"
✓ 保留原CAF编号
✓ 刷新页面后修改保持
```

---

## 数据持久化验证清单

### ✅ 模板数据
- [x] 创建新模板后刷新页面，模板仍存在
- [x] 编辑模板后刷新页面，修改保持
- [x] 删除模板后刷新页面，模板已删除
- [x] 关闭浏览器重新打开，模板数据完整

### ✅ CAF申请单数据
- [x] 创建新CAF后刷新页面，CAF仍存在
- [x] 审批CAF后刷新页面，状态保持
- [x] 修正CAF后刷新页面，修改保持
- [x] 关闭浏览器重新打开，CAF数据完整

### ✅ 归档文件数据
- [x] 批准CAF生成归档文件后刷新页面，文件仍存在
- [x] 文档库中的文件刷新后保持
- [x] 关闭浏览器重新打开，归档文件完整

### ✅ 全局规则数据
- [x] 创建新规则后刷新页面，规则仍存在
- [x] 编辑规则后刷新页面，修改保持
- [x] 删除规则后刷新页面，规则已删除
- [x] 关闭浏览器重新打开，规则数据完整

---

## 已知问题和解决方案

### ✅ 已解决的问题

1. **模板数据初始化**
   - 问题: 首次加载时没有模板数据
   - 解决: 从 `data/template_data.json` 加载种子数据
   - 状态: ✅ 已解决

2. **CAF数据持久化**
   - 问题: 刷新页面后CAF数据丢失
   - 解决: 使用 `useEffect` 监听数据变化并保存到 localStorage
   - 状态: ✅ 已解决

3. **归档文件关联**
   - 问题: 归档文件与CAF的关联关系
   - 解决: 在 `ArchivedLibraryFile` 中添加 `cafId` 字段
   - 状态: ✅ 已解决

### 🔄 需要验证的功能

1. **文档上传功能**
   - 当前状态: UI已实现，但实际上传逻辑未完成
   - 建议: 实现文件上传到本地存储或模拟上传

2. **文档下载功能**
   - 当前状态: 按钮已实现，但下载逻辑未完成
   - 建议: 实现文件下载或生成PDF

3. **导出功能**
   - 当前状态: "Export XLS" 按钮已实现，但导出逻辑未完成
   - 建议: 实现导出为Excel或CSV

---

## 测试步骤

### 完整端到端测试

1. **清空本地存储** (可选，用于测试初始化)
   ```javascript
   localStorage.clear();
   ```

2. **登录系统**
   - 用户名: admin
   - 密码: (任意)
   - 验证码: (输入显示的验证码)

3. **创建模板**
   - 进入"模板管理"
   - 创建新模板
   - 验证模板保存成功

4. **创建CAF申请**
   - 进入"新业务受理"
   - 填写完整表单
   - 提交申请
   - 验证CAF创建成功

5. **审核CAF**
   - 进入"审核门户"
   - 选择待审核CAF
   - 批准申请
   - 验证状态变为"Archived"

6. **查看文档**
   - 进入"文档管理"
   - 验证归档文件存在
   - 查看文档详情

7. **刷新页面**
   - 按F5刷新
   - 验证所有数据仍然存在

8. **关闭并重新打开浏览器**
   - 关闭浏览器
   - 重新打开并访问系统
   - 验证所有数据完整

---

## 数据结构示例

### localStorage 数据快照

```json
{
  "caf_templates_store_v2": [
    {
      "id": "TPL-001",
      "name": "Enterprise Broadband 2026",
      "customerType": "Corporate",
      "businessType": "Enterprise Broadband",
      "channel": "Direct Sales",
      "product": "Fiber 100M",
      "description": "2026年企业宽带服务模板",
      "termsAndConditions": "<html>...</html>",
      "status": "Active",
      "createdAt": "2026-05-06T10:00:00.000Z",
      "updatedAt": "2026-05-06T10:00:00.000Z"
    }
  ],
  
  "caf-app-registry-v1": {
    "cafs": [
      {
        "id": "CAF-2026-001",
        "customerType": "Corporate",
        "fullName": "Afghan Tech Solutions Ltd",
        "idNumber": "ISP-2026-001",
        "idType": "Pvt. Ltd. Company",
        "address": "Kabul Business District, Afghanistan",
        "contactNumber": "+93 700 123 456",
        "email": "info@afghantech.af",
        "serviceType": "Postpaid",
        "planName": "Enterprise Fiber 100M",
        "status": "Archived",
        "submissionDate": "2026-05-06T10:30:00.000Z",
        "documents": [...],
        "corporateDetails": {
          "companyRegNo": "ISP-2026-001",
          "taxId": "—",
          "authorizedSignatory": "Mohammad Karimi",
          "technicalContact": "—",
          "staticIpRequired": true
        }
      }
    ],
    "archiveEntries": [
      {
        "id": "arc-CAF-2026-001-1715000000000",
        "name": "CAF-2026-001-approved-archive.pdf",
        "size": "850 KB",
        "archivedAt": "2026-05-06T11:00:00.000Z",
        "type": "pdf",
        "status": "approved",
        "cafId": "CAF-2026-001"
      }
    ]
  },
  
  "global_rules_v1": [
    {
      "id": "GR-001",
      "name": "Mandatory ID Verification",
      "category": "kyc_security",
      "enforcement": "blocking",
      "description": "All customers must provide valid ID",
      "technicalRef": "KYC-001",
      "version": "1.0"
    }
  ]
}
```

---

## 性能和容量考虑

### 本地存储限制
- **浏览器限制**: 通常为 5-10MB
- **当前使用**: 
  - 模板数据: ~100KB (10个模板)
  - CAF数据: ~500KB (100个CAF)
  - 归档文件: ~50KB (50个文件记录)
  - 总计: ~650KB

### 建议
1. 定期清理已归档超过1年的CAF
2. 实现数据导出功能
3. 考虑实现数据压缩
4. 监控localStorage使用量

---

## 总结

✅ **数据持久化机制完善**
- 所有关键数据都保存到localStorage
- 刷新页面后数据不丢失
- 关闭浏览器后数据保持

✅ **端到端流程完整**
- 模板创建 → CAF申请 → 审核 → 归档 → 文档管理
- 每个环节数据流转正常
- 状态变更正确保存

✅ **用户体验良好**
- 无需担心数据丢失
- 可以随时中断和继续工作
- 数据在本地安全存储

🔄 **待完善功能**
- 实际文件上传和下载
- 数据导出功能
- 数据备份和恢复
