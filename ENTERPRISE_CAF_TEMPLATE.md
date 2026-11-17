# 企业 CAF 模板设计方案

## 模板概述

**模板名称**: 企业宽带接入业务申请表  
**适用对象**: 企业/公司客户  
**业务类型**: 宽带/专线接入服务  
**渠道**: 直销/代理商  

---

## 一、基本信息

### 模板元数据

```
Template Name: 企业宽带接入业务申请表
Customer Type: Corporate
Business Type: Enterprise Broadband Service
Channel: Direct / Agent
Product: Enterprise Fiber / Leased Line
Description: 适用于企业客户申请固定宽带、光纤接入、专线等业务
```

---

## 二、法律条款与声明（富文本内容）

### 2.1 页眉部分

```html
<div style="text-align: center; border-bottom: 3px solid #1229B3; padding-bottom: 20px; margin-bottom: 30px;">
  <h1 style="color: #1229B3; font-size: 24px; font-weight: bold; margin: 0;">AsiaInfo TELECOM</h1>
  <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">企业宽带接入业务申请表</p>
  <p style="color: #999; font-size: 10px; margin: 5px 0 0 0;">ENTERPRISE BROADBAND SERVICE APPLICATION FORM</p>
</div>
```

### 2.2 申请人信息确认

```html
<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">一、申请人信息</h2>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; width: 30%; font-weight: bold;">企业名称</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{fullName}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">统一社会信用代码</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{idNumber}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">企业类型</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{idType}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">注册地址</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{address}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">联系电话</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{contactNumber}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">电子邮箱</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{email}}</td>
  </tr>
</table>
```

### 2.3 服务信息

```html
<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">二、申请服务信息</h2>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; width: 30%; font-weight: bold;">服务类型</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{serviceType}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">套餐名称</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{planName}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">接入方式</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{serviceDelivery}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">账单周期</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{billingCycle}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">开通费用</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{activationFee}}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">月租费用</td>
    <td style="padding: 10px; border: 1px solid #ddd;">{{monthlyFee}}</td>
  </tr>
</table>
```

### 2.4 服务条款

```html
<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">三、服务条款与承诺</h2>

<div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #333; font-size: 14px; margin-top: 0;">3.1 服务协议</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    本人代表 <strong>{{fullName}}</strong> 申请 AsiaInfo TELECOM 提供的企业宽带接入服务，并承诺：
  </p>
  <ol style="line-height: 1.8; color: #666; font-size: 13px;">
    <li>所提供的企业信息及相关证件真实有效，如有虚假，愿承担相应法律责任；</li>
    <li>已充分了解所申请服务的资费标准、服务内容及相关条款；</li>
    <li>同意遵守 AsiaInfo TELECOM 的服务协议及相关管理规定；</li>
    <li>保证不利用所申请的网络服务从事违法违规活动；</li>
    <li>按时缴纳服务费用，如逾期未缴，同意运营商采取停机等措施。</li>
  </ol>

  <h3 style="color: #333; font-size: 14px; margin-top: 20px;">3.2 服务等级承诺（SLA）</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    AsiaInfo TELECOM 承诺为企业客户提供以下服务保障：
  </p>
  <ul style="line-height: 1.8; color: #666; font-size: 13px;">
    <li><strong>网络可用性</strong>：≥99.5%（专线业务 ≥99.9%）</li>
    <li><strong>故障响应时间</strong>：2小时内响应，24小时内修复</li>
    <li><strong>技术支持</strong>：7×24小时客户服务热线</li>
    <li><strong>带宽保障</strong>：承诺带宽不低于套餐标准的95%</li>
  </ul>

  <h3 style="color: #333; font-size: 14px; margin-top: 20px;">3.3 费用说明</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    <strong>开通费用</strong>：{{activationFee}}（一次性收取，不予退还）<br>
    <strong>月租费用</strong>：{{monthlyFee}}<br>
    <strong>账单周期</strong>：{{billingCycle}}<br>
    <strong>付款方式</strong>：支持银行转账、支票、在线支付等方式<br>
    <strong>押金政策</strong>：根据信用评估，可能需要缴纳相当于2-3个月月租的押金
  </p>

  <h3 style="color: #333; font-size: 14px; margin-top: 20px;">3.4 违约责任</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    如客户违反服务协议或从事违法活动，AsiaInfo TELECOM 有权立即停止服务，并保留追究法律责任的权利。
    已缴纳的费用不予退还。
  </p>

  <h3 style="color: #333; font-size: 14px; margin-top: 20px;">3.5 隐私保护</h3>
  <p style="line-height: 1.8; color: #666; font-size: 13px;">
    AsiaInfo TELECOM 承诺严格保护客户信息安全，不向第三方泄露客户资料，但法律法规要求或监管机构要求的除外。
  </p>
</div>
```

### 2.5 申请人声明

```html
<h2 style="color: #1229B3; font-size: 18px; border-left: 4px solid #1229B3; padding-left: 10px; margin-top: 30px;">四、申请人声明</h2>

<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
  <p style="line-height: 1.8; color: #856404; font-size: 13px; margin: 0;">
    <strong>重要声明：</strong>本人作为 <strong>{{fullName}}</strong> 的授权代表，
    已仔细阅读并完全理解上述所有条款，同意接受 AsiaInfo TELECOM 的服务协议及相关规定。
    本人确认所提供的所有信息真实、准确、完整，并愿意承担因信息不实而产生的一切法律责任。
  </p>
</div>

<div style="margin-top: 40px;">
  <p style="color: #666; font-size: 13px; line-height: 1.8;">
    <strong>申请日期</strong>：{{submissionDate}}<br>
    <strong>申请编号</strong>：系统自动生成<br>
    <strong>受理网点</strong>：AsiaInfo TELECOM 企业服务中心
  </p>
</div>
```

### 2.6 签名区域

```html
<div style="margin-top: 50px; page-break-inside: avoid;">
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="width: 50%; padding: 20px; vertical-align: top;">
        <p style="font-weight: bold; color: #333; margin-bottom: 10px;">企业授权代表签字：</p>
        <div style="border-bottom: 2px solid #333; height: 60px; margin-bottom: 10px;"></div>
        <p style="color: #666; font-size: 12px;">签字人姓名：___________________</p>
        <p style="color: #666; font-size: 12px;">职务：___________________</p>
        <p style="color: #666; font-size: 12px;">日期：___________________</p>
      </td>
      <td style="width: 50%; padding: 20px; vertical-align: top;">
        <p style="font-weight: bold; color: #333; margin-bottom: 10px;">企业公章：</p>
        <div style="border: 2px dashed #ccc; height: 100px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">
          （加盖企业公章）
        </div>
      </td>
    </tr>
  </table>
</div>
```

### 2.7 页脚

```html
<div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #1229B3; text-align: center;">
  <p style="color: #999; font-size: 11px; line-height: 1.6;">
    AsiaInfo TELECOM 企业服务中心<br>
    客户服务热线：400-XXX-XXXX | 企业服务邮箱：enterprise@asiainfo.com<br>
    地址：北京市朝阳区XX路XX号 | 邮编：100000<br>
    <br>
    <em style="font-size: 10px;">本申请表一式两份，客户与运营商各执一份。</em>
  </p>
</div>
```

---

## 三、表单字段定义

### 3.1 必填字段

| 字段ID | 字段名称 | 字段类型 | 是否必填 | 说明 |
|--------|----------|----------|----------|------|
| f1 | 企业名称 | text | ✅ | 营业执照上的完整名称 |
| f2 | 统一社会信用代码 | text | ✅ | 18位代码 |
| f3 | 企业类型 | select | ✅ | 有限公司/股份公司/个体工商户等 |
| f4 | 注册地址 | textarea | ✅ | 营业执照注册地址 |
| f5 | 联系电话 | text | ✅ | 企业联系电话 |
| f6 | 电子邮箱 | text | ✅ | 企业邮箱 |
| f7 | 法定代表人姓名 | text | ✅ | 法人姓名 |
| f8 | 法定代表人身份证号 | text | ✅ | 18位身份证号 |
| f9 | 授权代表姓名 | text | ✅ | 办理人姓名 |
| f10 | 授权代表电话 | text | ✅ | 办理人手机号 |

### 3.2 服务相关字段

| 字段ID | 字段名称 | 字段类型 | 是否必填 | 说明 |
|--------|----------|----------|----------|------|
| f11 | 服务类型 | select | ✅ | 企业宽带/专线/混合接入 |
| f12 | 套餐名称 | text | ✅ | 具体套餐 |
| f13 | 带宽需求 | select | ✅ | 10M/50M/100M/200M/1000M |
| f14 | 接入地址 | textarea | ✅ | 实际安装地址 |
| f15 | 是否需要固定IP | checkbox | ❌ | 是否需要 |
| f16 | IP地址数量 | number | ❌ | 需要的IP数量 |

### 3.3 可选字段

| 字段ID | 字段名称 | 字段类型 | 是否必填 | 说明 |
|--------|----------|----------|----------|------|
| f17 | 技术联系人 | text | ❌ | 技术对接人 |
| f18 | 技术联系电话 | text | ❌ | 技术对接电话 |
| f19 | 财务联系人 | text | ❌ | 财务对接人 |
| f20 | 财务联系电话 | text | ❌ | 财务对接电话 |
| f21 | 特殊需求说明 | textarea | ❌ | 其他需求 |

---

## 四、所需证件清单

### 4.1 企业资质证件

- ✅ 营业执照副本（复印件加盖公章）
- ✅ 统一社会信用代码证明
- ✅ 法定代表人身份证（正反面复印件）
- ✅ 授权委托书（如非法人办理）
- ✅ 授权代表身份证（正反面复印件）

### 4.2 地址证明

- ✅ 安装地址产权证明或租赁合同
- ✅ 物业同意施工证明（如需）

### 4.3 其他材料

- ❌ 开户许可证（对公账户）
- ❌ 税务登记证（三证合一前的企业）
- ❌ 组织机构代码证（三证合一前的企业）

---

## 五、使用说明

### 5.1 创建模板步骤

1. 登录系统，进入"模板管理"
2. 点击"创建新模板"
3. 填写基本信息：
   - 模板名称：企业宽带接入业务申请表
   - 客户类型：Corporate
   - 业务类型：Enterprise Broadband Service
   - 渠道：Direct
   - 产品：Enterprise Fiber
4. 将上述 HTML 内容复制到富文本编辑器
5. 保存模板

### 5.2 变量说明

模板中使用的变量会在 CAF 提交时自动替换：

- `{{fullName}}` → 企业名称
- `{{idNumber}}` → 统一社会信用代码
- `{{idType}}` → 企业类型
- `{{address}}` → 注册地址
- `{{contactNumber}}` → 联系电话
- `{{email}}` → 电子邮箱
- `{{serviceType}}` → 服务类型
- `{{planName}}` → 套餐名称
- `{{serviceDelivery}}` → 接入方式
- `{{billingCycle}}` → 账单周期
- `{{activationFee}}` → 开通费用
- `{{monthlyFee}}` → 月租费用
- `{{submissionDate}}` → 申请日期

---

## 六、设计特点

### 6.1 专业性
- 采用正式的商务文档格式
- 包含完整的法律条款和服务协议
- 明确的权利义务说明

### 6.2 规范性
- 符合电信行业监管要求
- 包含必要的客户声明和承诺
- 完整的签字盖章流程

### 6.3 实用性
- 信息展示清晰，易于阅读
- 表格化呈现关键信息
- 支持变量动态替换

### 6.4 美观性
- 使用企业品牌色（AsiaInfo 蓝色）
- 合理的排版和间距
- 专业的视觉呈现

---

## 七、后续优化建议

1. **电子签名集成**：支持在线电子签名
2. **附件上传**：支持证件扫描件在线上传
3. **审批流程**：多级审批机制
4. **合同生成**：自动生成正式服务合同
5. **归档管理**：自动归档到文档管理系统

---

**文档版本**: v1.0  
**创建日期**: 2024-05-06  
**适用系统**: AsiaInfo CAF Management System
