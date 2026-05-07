# CAF 模板导入功能说明

## 功能概述

在 CAF 模板管理的新建/编辑模板界面中，为富文本编辑器添加了"根据模板导入"功能，允许用户从现有模板中快速导入富文本内容。

## 实现的功能

### 1. 导入按钮
- 位置：富文本编辑器标题栏右侧
- 样式：绿色按钮，带有文件图标
- 文本：`Import from Template`

### 2. 导入模态框
当点击"Import from Template"按钮时，会弹出一个模态框，显示：

#### 模态框特性：
- **渐变标题栏**：使用绿色到青色的渐变背景
- **模板列表**：显示所有包含富文本内容的模板
- **过滤逻辑**：只显示有 `termsAndConditions` 内容的模板

#### 每个模板卡片显示：
- 模板名称和 ID
- 客户类型标签（Individual/Corporate）
- 业务类型和产品信息
- 模板描述
- **内容预览**：显示富文本内容的前 200 字符
- 导入按钮（悬停时显示）

### 3. 导入操作
- 点击模板卡片或"Import"按钮即可导入
- 导入后自动关闭模态框
- 导入的内容会替换当前富文本编辑器中的内容

### 4. 空状态处理
如果没有可用的模板内容，显示友好的空状态提示。

## 技术实现

### 新增状态
```typescript
const [isImportModalOpen, setIsImportModalOpen] = useState(false);
```

### 新增函数
```typescript
const handleImportTemplate = (templateId: string) => {
  const sourceTemplate = templates.find(t => t.id === templateId);
  if (sourceTemplate && sourceTemplate.termsAndConditions) {
    setNewTemplate({
      ...newTemplate,
      termsAndConditions: sourceTemplate.termsAndConditions
    });
    setIsImportModalOpen(false);
  }
};
```

## 用户体验

1. **快速复用**：用户可以快速从现有模板复制富文本内容，避免重复编写
2. **内容预览**：在导入前可以预览模板内容，确保选择正确
3. **视觉反馈**：悬停效果和动画提供良好的交互反馈
4. **智能过滤**：只显示有内容的模板，避免无效选项

## 使用场景

1. **创建相似模板**：基于现有模板创建新的变体
2. **标准化内容**：确保不同模板使用一致的法律条款
3. **快速原型**：快速创建测试模板
4. **内容迁移**：将成熟模板的内容应用到新模板

## 界面截图说明

### 导入按钮位置
```
Legal Terms & Blueprint Content (Rich Text)
                    [Import from Template] [Focus Edit]
```

### 模态框布局
```
┌─────────────────────────────────────────┐
│ 🗂️ Import from Existing Template       │ (绿色渐变标题)
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 📋 Individual Prepaid Basic         │ │
│ │ TPL-IND-PRE-001                     │ │
│ │ SIM Registration | Prepaid Standard │ │
│ │ Content Preview: ...                │ │
│ │                        [Import] ──→ │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 📋 Corporate Postpaid Enterprise    │ │
│ │ ...                                 │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│                          [Cancel]       │
└─────────────────────────────────────────┘
```

## 后续优化建议

1. **搜索功能**：添加模板搜索框，方便在大量模板中查找
2. **分类筛选**：按客户类型、业务类型等筛选模板
3. **预览增强**：提供完整的富文本预览弹窗
4. **版本控制**：记录导入来源，便于追溯
5. **批量操作**：支持同时导入多个模板的不同部分
