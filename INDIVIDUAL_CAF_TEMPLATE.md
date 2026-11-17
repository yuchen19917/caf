# 个人预付费 CAF 模板设计方案

## 模板概述

**模板名称**: Individual Prepaid Basic  
**适用对象**: 个人客户  
**业务类型**: 预付费移动通信服务  
**渠道**: 直销/代理商/在线  

---

## 一、基本信息

### 模板元数据

```
Template Name: Individual Prepaid Basic
Customer Type: Individual
Business Type: SIM Registration
Channel: Direct / Agent / Online
Product: Prepaid Standard
Description: 个人预付费标准业务申请表，适用于个人客户申请预付费移动通信服务
```

---

## 二、优化内容对比

### 2.1 优化前（旧版本）
- ❌ 简单的表格布局，缺乏视觉层次
- ❌ 中英文混排不够清晰
- ❌ 缺少完整的服务条款说明
- ❌ 没有明确的权利义务说明
- ❌ 页眉页脚信息不完整

### 2.2 优化后（新版本）
- ✅ 专业的 AsiaInfo 品牌页眉设计
- ✅ 清晰的分节结构（七大部分）
- ✅ 统一的表格样式和配色方案
- ✅ 完整的服务条款和隐私保护说明
- ✅ 明确的用户权利和义务
- ✅ 专业的签字区域和页脚信息

---

## 三、模板结构（富文本内容）

### 3.1 页眉部分

```html
<div style="text-align: center; border-bottom: 3px solid #1229B3; padding-bottom: 20px; margin-bottom: 30px;">
  <h1 style="color: #1229B3; font-size: 24px; font-weight: bold; margin: 0;">AsiaInfo TELECOM</h1>
  <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">个人预付费业务申请表</p>
  <p style="color: #999; font-size: 10px; margin: 5px 0 0 0;">INDIVIDUAL PREPAID SERVICE APPLICATION FORM</p>
</div>
```

### 3.2 客户基本信息

```html
<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">一、客户基本信息</h2>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; width: 30%; font-weight: bold;">姓名 / Full Name</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{fullName}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">证件类型 / ID Type</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{idType}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">证件号码 / ID Number</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{idNumber}}</td>
  </tr>
</table>
```

### 3.3 联系方式

```html
<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">二、联系方式</h2>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; width: 30%; font-weight: bold;">手机号码 / Mobile</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{contactNumber}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">电子邮箱 / Email</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{email}}</td>
  </tr>
</table>
```

### 3.4 地址信息

```html
<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">三、地址信息</h2>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; width: 30%; font-weight: bold; vertical-align: top;">居住地址 / Residential Address</td>
    <td style="padding: 10px; border: 1px solid #ddd; vertical-align: top;">{{address}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold; vertical-align: top;">账单地址 / Billing Address</td>
    <td style="padding: 10px; border: 1px solid #ddd; vertical-align: top;">{{billingAddress}}</td>
  </tr>
</table>
```

### 3.5 服务详情

```html
<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">四、服务详情</h2>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; width: 30%; font-weight: bold;">资费计划 / Plan Name</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{planName}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">业务类型 / Service Type</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{serviceType}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">交付方式 / Service Delivery</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{serviceDelivery}}</td>
  </tr>
</table>
```

### 3.6 费用信息

```html
<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">五、费用信息</h2>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; width: 30%; font-weight: bold;">开户费用 / Activation Fee</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{activationFee}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">周期资费 / Monthly Fee</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{monthlyFee}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">账单周期 / Billing Cycle</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{billingCycle}}</td>
  </tr>
</table>
```

### 3.7 服务条款

```html
<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">六、服务条款</h2>

<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #333; font-size: 14px; margin-top: 0;">6.1 用户权利</h3>
  <ul style="line-height: 1.8; color: #666; font-size: 13px;">
    <li>享受 AsiaInfo TELECOM 提供的优质通信服务</li>
    <li>获得清晰透明的资费说明和账单明细</li>
    <li>享有个人信息保护和隐私安全保障</li>
    <li>获得7×24小时客户服务支持</li>
  </ul>

  <h3 style="color: #333; font-size: 14px; margin-top: 20px;">6.2 用户义务</h3>
  <ol style="line-height: 1.8; color: #666; font-size: 13px;">
    <li>提供真实、准确、完整的个人信息和证件资料</li>
    <li>遵守国家法律法规和 AsiaInfo TELECOM 服务协议</li>
    <li>不得利用通信服务从事违法违规活动</li>
    <li>按时充值或缴纳服务费用</li>
    <li>妥善保管 SIM 卡和账户信息，防止丢失或被盗用</li>
  </ol>

  <h3 style="color: #333; font-size: 14px; margin-top: 20px;">6.3 服务说明</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    <strong>预付费服务特点</strong>：先充值后使用，余额不足时服务自动暂停，充值后立即恢复。<br>
    <strong>有效期</strong>：根据所选套餐确定，到期前可续费延长。<br>
    <strong>退费政策</strong>：开户费不予退还；余额可按规定申请退还（需扣除手续费）。<br>
    <strong>服务暂停</strong>：余额不足或违反服务协议时，运营商有权暂停或终止服务。
  </p>

  <h3 style="color: #333; font-size: 14px; margin-top: 20px;">6.4 隐私保护</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    AsiaInfo TELECOM 承诺严格保护用户个人信息，不向第三方泄露或出售用户资料。
    用户信息仅用于提供通信服务、账单管理和客户支持，法律法规要求或监管机构要求的除外。
  </p>
</div>
```

### 3.8 客户声明

```html
<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">七、客户声明</h2>

<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
  <p style="line-height: 1.8; color: #856404; font-size: 13px; margin: 0;">
    <strong>重要声明：</strong>本人 <strong>{{fullName}}</strong>（证件号码：<strong>{{idNumber}}</strong>）
    已仔细阅读并完全理解上述所有条款，同意接受 AsiaInfo TELECOM 的服务协议及相关规定。
    本人确认所提供的所有信息真实、准确、完整，并愿意承担因信息不实而产生的一切法律责任。
  </p>
</div>

<div style="margin-top: 40px;">
  <p style="color: #666; font-size: 13px; line-height: 1.8;">
    <strong>申请日期</strong>：{{submissionDate}}<br>
    <strong>申请编号</strong>：系统自动生成<br>
    <strong>受理网点</strong>：AsiaInfo TELECOM 客户服务中心
  </p>
</div>
```

### 3.9 签名区域

```html
<div style="margin-top: 50px; page-break-inside: avoid;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 50%; padding: 20px; vertical-align: top;">
        <p style="font-weight: bold; color: #333; margin-bottom: 10px;">客户签字 / Customer Signature：</p>
        <div style="border-bottom: 2px solid #333; height: 60px; margin-bottom: 10px;"></div>
        <p style="color: #666; font-size: 12px;">签字日期：___________________</p>
      </td>
      <td style="width: 50%; padding: 20px; vertical-align: top;">
        <p style="font-weight: bold; color: #333; margin-bottom: 10px;">受理人签字 / Agent Signature：</p>
        <div style="border-bottom: 2px solid #333; height: 60px; margin-bottom: 10px;"></div>
        <p style="color: #666; font-size: 12px;">工号：___________________</p>
      </td>
    </tr>
  </table>
</div>
```

### 3.10 页脚

```html
<div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #1229B3; text-align: center;">
  <p style="color: #999; font-size: 11px; line-height: 1.6;">
    AsiaInfo TELECOM 客户服务中心<br>
    客户服务热线：400-XXX-XXXX | 服务邮箱：service@asiainfo.com<br>
    官方网站：www.asiainfo.com | 微信公众号：AsiaInfo通信<br>
    <br>
    <em style="font-size: 10px;">本申请表一式两份，客户与运营商各执一份。感谢您选择 AsiaInfo TELECOM！</em>
  </p>
</div>
```

---

## 四、表单字段定义

### 4.1 基本信息字段

| 字段ID | 字段名称 | 字段类型 | 是否必填 | 说明 |
|--------|----------|----------|----------|------|
| f1 | 姓名 | text | ✅ | 客户真实姓名 |
| f2 | 证件类型 | select | ✅ | 身份证/护照/Tazkira/其他 |
| f3 | 证件号码 | text | ✅ | 有效证件号码 |

### 4.2 联系方式字段

| 字段ID | 字段名称 | 字段类型 | 是否必填 | 说明 |
|--------|----------|----------|----------|------|
| f4 | 手机号码 | text | ✅ | 联系电话 |
| f5 | 电子邮箱 | text | ❌ | 可选 |

### 4.3 地址字段

| 字段ID | 字段名称 | 字段类型 | 是否必填 | 说明 |
|--------|----------|----------|----------|------|
| f6 | 居住地址 | textarea | ✅ | 详细地址 |
| f7 | 账单地址 | textarea | ❌ | 可与居住地址不同 |

### 4.4 服务相关字段

| 字段ID | 字段名称 | 字段类型 | 是否必填 | 说明 |
|--------|----------|----------|----------|------|
| f8 | 资费计划 | text | ✅ | 套餐名称 |
| f9 | 业务类型 | select | ✅ | 预付费语音/数据/语音+数据 |
| f10 | 交付方式 | select | ✅ | 实体SIM/eSIM/邮寄配送 |

### 4.5 费用字段

| 字段ID | 字段名称 | 字段类型 | 是否必填 | 说明 |
|--------|----------|----------|----------|------|
| f11 | 开户费用 | text | ❌ | 一次性费用 |
| f12 | 周期资费 | text | ❌ | 月租或套餐费 |
| f13 | 账单周期 | select | ❌ | 按次/月度/季度/年度 |

---

## 五、变量说明

模板中使用的变量会在 CAF 提交时自动替换：

- `{{fullName}}` → 客户姓名
- `{{idType}}` → 证件类型
- `{{idNumber}}` → 证件号码
- `{{contactNumber}}` → 手机号码
- `{{email}}` → 电子邮箱
- `{{address}}` → 居住地址
- `{{billingAddress}}` → 账单地址
- `{{planName}}` → 资费计划
- `{{serviceType}}` → 业务类型
- `{{serviceDelivery}}` → 交付方式
- `{{activationFee}}` → 开户费用
- `{{monthlyFee}}` → 周期资费
- `{{billingCycle}}` → 账单周期
- `{{submissionDate}}` → 申请日期

---

## 六、设计特点

### 6.1 视觉设计
- 采用 AsiaInfo 品牌色（#1229B3）作为主色调
- 统一的表格样式和间距
- 清晰的分节标题（左侧蓝色边框）
- 专业的页眉和页脚设计

### 6.2 内容完整性
- 完整的客户信息采集
- 详细的服务条款说明
- 明确的用户权利和义务
- 清晰的费用说明
- 隐私保护承诺

### 6.3 用户体验
- 中英文双语标注
- 逻辑清晰的信息分组
- 重要声明突出显示（黄色背景）
- 专业的签字区域设计

### 6.4 合规性
- 符合电信行业监管要求
- 包含必要的客户声明和承诺
- 完整的隐私保护说明
- 明确的服务条款

---

## 七、使用说明

### 7.1 优化步骤

1. 启动开发服务器：`npm run dev`
2. 在浏览器中打开：`http://localhost:5173/update-individual-template.html`
3. 点击"优化个人预付费模板"按钮
4. 等待成功提示
5. 刷新主页面，进入"模板管理"查看

### 7.2 应用场景

- 个人客户申请预付费移动服务
- SIM 卡注册和激活
- 预付费套餐变更
- 客户信息更新

---

## 八、与企业模板的一致性

### 8.1 共同设计元素
- ✅ 相同的页眉设计风格
- ✅ 统一的表格样式和配色
- ✅ 一致的分节标题格式
- ✅ 相同的签名区域布局
- ✅ 统一的页脚信息格式

### 8.2 差异化内容
- 个人模板：侧重个人信息和预付费服务特点
- 企业模板：侧重企业资质和 SLA 承诺

---

**文档版本**: v1.0  
**创建日期**: 2026-05-06  
**适用系统**: AsiaInfo CAF Management System

