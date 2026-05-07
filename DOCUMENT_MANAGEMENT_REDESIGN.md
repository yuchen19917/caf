# 文档管理系统重新设计说明

## 概述

文档管理系统已完全重新设计，现在作为一个完整的文档管理中心，用于统一管理客户证件、照片、签名、地址证明、授权书、合同、企业证明、支付凭证等各类文件。

---

## 核心功能

### 1. **文档分类管理**

系统支持 8 大文档分类：

| 分类 | 说明 | 图标 | 颜色主题 |
|------|------|------|----------|
| 证件文档 | 身份证、护照、驾照等 | FileText | Indigo |
| 客户照片 | 客户本人照片 | Image | Pink |
| 签名文件 | 手写签名、数字签名 | FileSignature | Purple |
| 地址证明 | 水电费账单、租赁合同 | MapPin | Blue |
| 授权书 | 各类授权委托书 | FileCheck | Green |
| 合同文件 | 服务合同、协议 | FileText | Orange |
| 企业证明 | 营业执照、税务登记 | Building2 | Amber |
| 支付凭证 | 银行转账、收据 | CreditCard | Emerald |

### 2. **文档状态管理**

每个文档都有明确的状态标识：

- **已验证** (Verified) - 绿色标识，已通过审核
- **待审核** (Pending) - 黄色标识，等待审核
- **已拒绝** (Rejected) - 红色标识，审核未通过
- **已归档** (Archived) - 灰色标识，已归档存储

### 3. **统计概览**

首页显示 4 个关键指标：

- **总文档数** - 系统中所有文档总数
- **已验证** - 已通过审核的文档数
- **待审核** - 等待审核的文档数
- **已拒绝** - 审核未通过的文档数

---

## 界面设计

### 页面布局

```
┌─────────────────────────────────────────────────────────┐
│ 文档管理中心                          [上传文档]         │
│ 统一管理客户证件、照片、签名...                          │
├─────────────────────────────────────────────────────────┤
│ [总文档数] [已验证] [待审核] [已拒绝]                    │
├─────────────────────────────────────────────────────────┤
│ 文档分类                                                 │
│ [全部] [证件] [照片] [签名] [地址] [授权] [合同] [企业] [支付] │
├─────────────────────────────────────────────────────────┤
│ [搜索框]                    [状态筛选] [视图切换]        │
├─────────────────────────────────────────────────────────┤
│ 文档列表 / 网格视图                                      │
│ ┌─────────────────────────────────────────────────┐    │
│ │ [图标] 文件名.jpg                                │    │
│ │        客户名 | CAF-001 | 2.4MB | 2024-05-06   │    │
│ │                          [已验证] [查看][下载][删除] │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 视图模式

#### 列表视图（默认）
- 显示完整的文档信息
- 包含文件图标、名称、客户、CAF编号、大小、日期
- 状态标识和操作按钮
- 适合快速浏览和管理

#### 网格视图
- 卡片式布局
- 大图标展示
- 适合视觉化浏览
- 快速识别文件类型

---

## 功能特性

### 1. **智能搜索**

支持多维度搜索：
- 文档名称
- 客户姓名
- CAF 编号
- 实时过滤结果

### 2. **多重筛选**

- **按分类筛选** - 点击分类卡片快速筛选
- **按状态筛选** - 下拉菜单选择状态
- **组合筛选** - 分类 + 状态 + 搜索关键词

### 3. **文档详情查看**

点击"查看"按钮打开详情模态框，显示：

#### 基本信息
- 文件名
- 文件类型
- 文件大小
- 状态

#### 关联信息
- 客户姓名
- CAF 编号
- 上传日期
- 上传人

#### 标签系统
- 支持多标签
- 快速识别文档属性
- 便于分类和检索

#### 备注信息
- 审核意见
- 拒绝原因
- 特殊说明

### 4. **文档上传**

点击"上传文档"按钮打开上传模态框：

#### 上传区域
- 拖拽上传
- 点击选择文件
- 支持批量上传

#### 元数据填写
- **文档分类** - 必选，选择文档类型
- **关联 CAF** - 可选，输入 CAF 编号
- **备注说明** - 可选，添加文档说明

#### 文件限制
- 支持格式：JPG, PNG, PDF
- 单文件最大：10MB
- 批量上传：无数量限制

### 5. **文档操作**

每个文档支持以下操作：

- **查看详情** - 眼睛图标，查看完整信息
- **下载文档** - 下载图标，下载到本地
- **删除文档** - 垃圾桶图标，删除文档

---

## 数据结构

### DocumentFile 接口

```typescript
interface DocumentFile {
  id: string;                    // 文档ID
  name: string;                  // 文件名
  category: DocumentCategory;    // 文档分类
  type: FileType;                // 文件类型
  size: string;                  // 文件大小
  uploadDate: string;            // 上传日期
  uploadedBy: string;            // 上传人
  status: DocumentStatus;        // 文档状态
  cafId?: string;                // 关联CAF编号
  customerName?: string;         // 客户姓名
  tags?: string[];               // 标签
  notes?: string;                // 备注
}
```

### 文档分类枚举

```typescript
type DocumentCategory = 
  | 'id_document'      // 证件文档
  | 'photo'            // 客户照片
  | 'signature'        // 签名文件
  | 'address_proof'    // 地址证明
  | 'authorization'    // 授权书
  | 'contract'         // 合同文件
  | 'business_license' // 企业证明
  | 'payment_proof'    // 支付凭证
  | 'other';           // 其他
```

### 文档状态枚举

```typescript
type DocumentStatus = 
  | 'verified'   // 已验证
  | 'pending'    // 待审核
  | 'rejected'   // 已拒绝
  | 'archived';  // 已归档
```

---

## 交互设计

### 1. **分类选择**

- 点击分类卡片切换筛选
- 选中状态：蓝色边框 + 阴影
- 未选中状态：灰色边框
- Hover 效果：边框变深

### 2. **文档列表**

- Hover 行：背景变为淡灰色
- 图标区域：Hover 时边框变蓝
- 操作按钮：Hover 时显示对应颜色背景
  - 查看：蓝色
  - 下载：绿色
  - 删除：红色

### 3. **模态框**

- 打开动画：淡入 + 缩放
- 背景：毛玻璃效果
- 关闭方式：
  - 点击 X 按钮
  - 点击"关闭"按钮
  - ESC 键（待实现）

### 4. **状态标识**

颜色编码：
- **已验证** - 绿色 (emerald)
- **待审核** - 黄色 (amber)
- **已拒绝** - 红色 (rose)
- **已归档** - 灰色 (slate)

---

## 使用场景

### 场景 1：上传客户证件

1. 点击"上传文档"按钮
2. 选择"证件文档"分类
3. 输入关联的 CAF 编号
4. 拖拽或选择身份证照片
5. 添加备注："身份证正面"
6. 点击"开始上传"

### 场景 2：查看待审核文档

1. 点击状态筛选，选择"待审核"
2. 浏览待审核文档列表
3. 点击"查看"按钮查看详情
4. 确认文档信息
5. 下载文档进行审核

### 场景 3：搜索特定客户文档

1. 在搜索框输入客户姓名
2. 系统实时过滤显示结果
3. 点击分类进一步筛选
4. 查看或下载所需文档

### 场景 4：批量管理企业文档

1. 点击"企业证明"分类
2. 查看所有企业相关文档
3. 按状态筛选
4. 批量下载或归档

---

## 技术实现

### 状态管理

```typescript
const [view, setView] = useState<'grid' | 'list'>('list');
const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
const [searchTerm, setSearchTerm] = useState('');
const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');
const [viewingDocument, setViewingDocument] = useState<DocumentFile | null>(null);
const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
```

### 文档过滤

```typescript
const filteredDocuments = useMemo(() => {
  return mockDocuments.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.cafId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });
}, [selectedCategory, selectedStatus, searchTerm]);
```

### 动画效果

使用 Framer Motion 实现：
- 模态框淡入淡出
- 缩放动画
- 平滑过渡

---

## 样式设计

### 颜色方案

- **主色调** - Indigo (#4F46E5)
- **成功色** - Emerald (#10B981)
- **警告色** - Amber (#F59E0B)
- **错误色** - Rose (#F43F5E)
- **中性色** - Slate (#64748B)

### 圆角设计

- 卡片：`rounded-2xl` (16px)
- 模态框：`rounded-3xl` (24px)
- 按钮：`rounded-xl` (12px)
- 输入框：`rounded-xl` (12px)

### 阴影效果

- 卡片：`shadow-sm`
- 悬停：`shadow-xl`
- 模态框：`shadow-2xl`
- 按钮：`shadow-lg shadow-indigo-900/10`

---

## 响应式设计

### 断点

- **Mobile** - < 768px
- **Tablet** - 768px - 1024px
- **Desktop** - > 1024px

### 布局适配

- **统计卡片** - 1列 → 2列 → 4列
- **分类按钮** - 2列 → 4列 → 8列
- **文档网格** - 2列 → 3列 → 4列

---

## 后续优化建议

### 功能增强

1. **文档预览** - 在模态框中直接预览图片和 PDF
2. **批量操作** - 支持批量下载、删除、状态更新
3. **版本管理** - 文档版本历史和回滚
4. **权限控制** - 基于角色的文档访问权限
5. **审批流程** - 文档审批工作流
6. **OCR 识别** - 自动识别证件信息
7. **水印添加** - 自动添加安全水印
8. **加密存储** - 敏感文档加密存储

### 性能优化

1. **虚拟滚动** - 大量文档时使用虚拟列表
2. **懒加载** - 图片和文档按需加载
3. **缓存策略** - 本地缓存常用文档
4. **压缩上传** - 自动压缩大文件

### 用户体验

1. **拖拽排序** - 支持文档拖拽排序
2. **快捷键** - 键盘快捷键操作
3. **批量标签** - 批量添加/编辑标签
4. **智能分类** - AI 自动识别文档类型

---

## 测试建议

### 功能测试

- [ ] 文档上传功能
- [ ] 分类筛选功能
- [ ] 状态筛选功能
- [ ] 搜索功能
- [ ] 查看详情功能
- [ ] 下载功能
- [ ] 删除功能
- [ ] 视图切换功能

### 界面测试

- [ ] 响应式布局
- [ ] 动画效果
- [ ] 交互反馈
- [ ] 加载状态
- [ ] 错误提示

### 性能测试

- [ ] 大量文档加载
- [ ] 搜索响应速度
- [ ] 筛选性能
- [ ] 模态框打开速度

---

**设计版本**: v2.0  
**更新日期**: 2026-05-06  
**设计师**: Kiro AI  
**适用系统**: ATOMA CAF Management System

