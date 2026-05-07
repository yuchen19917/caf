# 企业CAF模板 - 英文版

## 📄 文件信息
- **文件名**: `create-enterprise-template-en.html`
- **语言**: English (英文)
- **用途**: 创建英文版企业宽带服务申请表模板

## 🎯 模板特点

### 1. 完全英文化
- 所有标题、标签、说明文字均为英文
- 适用于国际客户和英语环境
- 专业的商务英语表达

### 2. 内容结构

#### I. APPLICANT INFORMATION (申请人信息)
- Company Name (企业名称)
- Business Registration Number (营业执照号)
- Company Type (企业类型)
- Registered Address (注册地址)
- Contact Number (联系电话)
- Email Address (电子邮箱)

#### II. SERVICE INFORMATION (服务信息)
- Service Type (服务类型)
- Plan Name (套餐名称)
- Service Delivery Method (服务交付方式)
- Billing Cycle (账单周期)
- Activation Fee (开通费用)
- Monthly Fee (月租费用)

#### III. TERMS OF SERVICE & COMMITMENTS (服务条款与承诺)

**3.1 Service Agreement (服务协议)**
- 5项客户承诺
- 真实性声明
- 合规承诺

**3.2 Service Level Agreement (SLA) (服务等级承诺)**
- Network Availability: ≥99.5% (网络可用性)
- Fault Response Time: 2 hours (故障响应时间)
- Technical Support: 7×24 (技术支持)
- Bandwidth Guarantee: ≥95% (带宽保障)

**3.3 Fee Description (费用说明)**
- Activation Fee (开通费)
- Monthly Fee (月租)
- Billing Cycle (账单周期)
- Payment Methods (付款方式)
- Deposit Policy (押金政策)

**3.4 Breach of Contract Liability (违约责任)**
- 违约后果说明
- 服务终止条款

**3.5 Privacy Protection (隐私保护)**
- 信息安全承诺
- 数据保护政策

#### IV. APPLICANT DECLARATION (申请人声明)
- 重要声明
- 法律责任确认

### 3. 签名区域
- Authorized Representative Signature (授权代表签字)
  - Name (姓名)
  - Position (职位)
  - Date (日期)
- Company Seal (企业公章)

### 4. 页脚信息
- ATOMA TELECOM Enterprise Service Center
- Customer Service Hotline: +93 (0) 700-XXX-XXXX
- Enterprise Email: enterprise@atoma.af
- Address: Kabul Business District, Afghanistan
- Postal Code: 1001

## 🔧 使用方法

### 步骤1: 打开工具页面
1. 在浏览器中打开 `create-enterprise-template-en.html`
2. 阅读页面说明

### 步骤2: 创建模板
1. 点击 "Create Enterprise CAF Template" 按钮
2. 等待创建完成
3. 看到成功提示

### 步骤3: 查看模板
1. 点击确认刷新页面
2. 进入系统的"模板管理"页面
3. 找到 "Enterprise Broadband Service Application (English)" 模板

### 步骤4: 使用模板
1. 在模板列表中点击"查看蓝图"
2. 预览英文版模板内容
3. 可以编辑或使用该模板创建CAF

## 📋 模板字段

模板包含21个字段：

| 字段ID | 字段名称 | 类型 | 必填 |
|--------|---------|------|------|
| f1 | Company Name | text | ✓ |
| f2 | Business Registration Number | text | ✓ |
| f3 | Company Type | select | ✓ |
| f4 | Registered Address | textarea | ✓ |
| f5 | Contact Number | text | ✓ |
| f6 | Email Address | text | ✓ |
| f7 | Legal Representative Name | text | ✓ |
| f8 | Legal Representative ID Number | text | ✓ |
| f9 | Authorized Representative Name | text | ✓ |
| f10 | Authorized Representative Phone | text | ✓ |
| f11 | Service Type | select | ✓ |
| f12 | Plan Name | text | ✓ |
| f13 | Bandwidth Requirement | select | ✓ |
| f14 | Installation Address | textarea | ✓ |
| f15 | Static IP Required | checkbox | - |
| f16 | Number of IP Addresses | number | - |
| f17 | Technical Contact Person | text | - |
| f18 | Technical Contact Phone | text | - |
| f19 | Finance Contact Person | text | - |
| f20 | Finance Contact Phone | text | - |
| f21 | Special Requirements | textarea | - |

## 🎨 设计特点

### 1. 专业外观
- ATOMA品牌色 (#1229B3)
- 清晰的章节划分
- 专业的表格布局

### 2. 易读性
- 合理的行间距 (line-height: 1.8)
- 清晰的字体大小
- 良好的对比度

### 3. 打印友好
- 适合A4纸打印
- 避免分页断裂 (page-break-inside: avoid)
- 清晰的签名区域

### 4. 响应式设计
- 适配不同屏幕尺寸
- 表格自适应布局

## 🔄 与中文版的区别

| 特性 | 中文版 | 英文版 |
|------|--------|--------|
| 语言 | 简体中文 | English |
| 模板名称 | 企业宽带接入业务申请表 | Enterprise Broadband Service Application |
| 文件名 | create-enterprise-template.html | create-enterprise-template-en.html |
| 模板ID前缀 | TPL-ENT- | TPL-ENT-EN- |
| 联系方式 | 中国地址和电话 | 阿富汗地址和电话 |
| 法律条款 | 中文表述 | 英文表述 |

## 💾 数据持久化

### 存储位置
- localStorage key: `caf_templates_store_v2`
- 与其他模板一起存储

### 模板对象结构
```javascript
{
  id: "TPL-ENT-EN-XXXXXXXXX",
  name: "Enterprise Broadband Service Application (English)",
  description: "For enterprise customers applying for fixed broadband...",
  customerType: "Corporate",
  businessType: "Enterprise Broadband Service",
  channel: "Direct",
  product: "Enterprise Fiber / Leased Line",
  status: "Active",
  createdAt: "2026-05-06T...",
  updatedAt: "2026-05-06T...",
  termsAndConditions: "<html>...</html>",
  fields: [...]
}
```

## ✅ 验证清单

创建模板后，请验证：

- [ ] 模板出现在模板管理列表中
- [ ] 模板名称为 "Enterprise Broadband Service Application (English)"
- [ ] 客户类型为 "Corporate"
- [ ] 业务类型为 "Enterprise Broadband Service"
- [ ] 状态为 "Active"
- [ ] 预览显示完整的英文内容
- [ ] 所有章节标题为英文
- [ ] 所有字段标签为英文
- [ ] 刷新页面后模板仍然存在

## 🌍 适用场景

### 1. 国际客户
- 外资企业
- 国际组织
- 外籍人士开办的企业

### 2. 英语环境
- 英语为工作语言的企业
- 需要英文文档的场合
- 国际业务往来

### 3. 双语支持
- 与中文版配合使用
- 提供双语服务选项
- 满足不同客户需求

## 📝 使用建议

### 1. 模板选择
- 中文客户使用中文版
- 英文客户使用英文版
- 可以同时保留两个版本

### 2. 内容定制
- 可以根据实际情况修改联系方式
- 可以调整费用说明
- 可以添加特定条款

### 3. 打印输出
- 建议使用A4纸打印
- 彩色打印效果更佳
- 保持页面边距

## 🔧 技术细节

### 变量占位符
模板支持以下变量：
- `{{fullName}}` - 企业名称
- `{{idNumber}}` - 营业执照号
- `{{idType}}` - 企业类型
- `{{address}}` - 注册地址
- `{{contactNumber}}` - 联系电话
- `{{email}}` - 电子邮箱
- `{{serviceType}}` - 服务类型
- `{{planName}}` - 套餐名称
- `{{serviceDelivery}}` - 服务交付方式
- `{{billingCycle}}` - 账单周期
- `{{activationFee}}` - 开通费用
- `{{monthlyFee}}` - 月租费用
- `{{submissionDate}}` - 申请日期

### HTML结构
- 使用内联样式
- 表格布局
- 响应式设计
- 打印优化

## 📞 技术支持

如有问题，请联系：
- 邮箱: support@atoma.af
- 电话: +93 (0) 700 123 456

---

**创建日期**: 2026年5月6日
**版本**: 1.0
**状态**: ✅ 已完成

---

**© 2026 ATOMA Telecom. All Rights Reserved.**
