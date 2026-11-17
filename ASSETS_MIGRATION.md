# 静态资源迁移

## 完成时间
2026年5月7日

---

## 迁移内容

将 `image` 目录迁移到标准的 Vite 项目结构中，确保 `npm run build` 时能正确打包。

---

## 迁移方案

### 方案选择

采用**双目录方案**：
1. **public/** - 用于公共静态资源（直接通过 `/` 访问）
2. **src/assets/** - 用于需要通过 import 导入的资源

### 为什么这样做？

**Vite 的资源处理规则**:
- `public/` 目录中的文件会被**原样复制**到构建输出目录
- `src/assets/` 中的文件会被 Vite **处理和优化**（hash、压缩等）

---

## 迁移步骤

### 1. 创建目录结构
```bash
mkdir public
mkdir src/assets
```

### 2. 复制 logo 文件
```bash
# 复制到 public（用于直接引用）
cp image/logo.svg public/logo.svg

# 复制到 src/assets（用于 import 引用）
cp image/logo.svg src/assets/logo.svg
```

### 3. 更新引用路径

#### A. 直接引用（HTML 中的 src 属性）

**文件**: `src/components/Sidebar.tsx`
```typescript
// 修改前
<img src="/image/logo.svg" alt="AsiaInfo Logo" />

// 修改后
<img src="/logo.svg" alt="AsiaInfo Logo" />
```

**文件**: `src/components/Login.tsx`
```typescript
// 修改前
<img src="/image/logo.svg" alt="AsiaInfo Logo" />

// 修改后
<img src="/logo.svg" alt="AsiaInfo Logo" />
```

#### B. Import 引用（通过 new URL）

**文件**: `src/lib/templateRepository.ts`
```typescript
// 修改前
const logoUrl = new URL('../image/logo.svg', import.meta.url).href;

// 修改后
const logoUrl = new URL('../assets/logo.svg', import.meta.url).href;
```

### 4. 删除旧目录
```bash
rm -rf image/
```

---

## 目录结构对比

### 修改前
```
caf/
├── image/
│   └── logo.svg
├── src/
│   ├── components/
│   └── lib/
└── index.html
```

### 修改后
```
caf/
├── public/
│   └── logo.svg          # 公共静态资源
├── src/
│   ├── assets/
│   │   └── logo.svg      # 需要 import 的资源
│   ├── components/
│   └── lib/
└── index.html
```

---

## 资源访问方式

### 1. 从 public/ 访问（推荐用于不变的资源）

**特点**:
- 直接通过 `/filename` 访问
- 不会被 Vite 处理
- 文件名不会添加 hash
- 适合：logo、favicon、robots.txt 等

**使用方式**:
```tsx
<img src="/logo.svg" alt="Logo" />
```

**构建后**:
```
dist/
└── logo.svg  # 原样复制
```

### 2. 从 src/assets/ 访问（推荐用于需要优化的资源）

**特点**:
- 通过 import 或 new URL 访问
- 会被 Vite 处理和优化
- 文件名会添加 hash（缓存优化）
- 适合：图片、字体、样式等

**使用方式**:
```typescript
// 方式 1: import
import logo from './assets/logo.svg';
<img src={logo} alt="Logo" />

// 方式 2: new URL
const logoUrl = new URL('./assets/logo.svg', import.meta.url).href;
```

**构建后**:
```
dist/
└── assets/
    └── logo-a1b2c3d4.svg  # 添加了 hash
```

---

## 构建验证

### 开发环境
```bash
npm run dev
# 访问 http://localhost:3001
# 检查 logo 是否正常显示
```

### 生产构建
```bash
npm run build
```

**预期输出**:
```
dist/
├── index.html
├── logo.svg                    # 从 public/ 复制
└── assets/
    ├── logo-[hash].svg         # 从 src/assets/ 处理
    ├── index-[hash].js
    └── index-[hash].css
```

### 预览构建结果
```bash
npm run preview
```

---

## 优势

### 1. 符合 Vite 标准
- 遵循 Vite 官方推荐的目录结构
- 更好的构建优化

### 2. 更好的缓存策略
- `public/` 中的文件适合不变的资源
- `src/assets/` 中的文件会添加 hash，利于缓存

### 3. 更清晰的组织
- 静态资源和源代码分离
- 易于维护和管理

### 4. 构建优化
- Vite 会自动优化 `src/assets/` 中的资源
- 压缩、转换、tree-shaking

---

## 注意事项

### 1. 路径引用
- `public/` 中的文件使用绝对路径：`/logo.svg`
- `src/assets/` 中的文件使用相对路径或 import

### 2. 构建后路径
- `public/` 中的文件路径不变
- `src/assets/` 中的文件会添加 hash

### 3. 大文件处理
- 小于 4KB 的文件会被内联为 base64
- 大于 4KB 的文件会被单独输出

---

## 相关文件

- ✅ `public/logo.svg` - 新增（公共静态资源）
- ✅ `src/assets/logo.svg` - 新增（需要 import 的资源）
- ✅ `src/components/Sidebar.tsx` - 更新路径
- ✅ `src/components/Login.tsx` - 更新路径
- ✅ `src/lib/templateRepository.ts` - 更新路径
- ❌ `image/` - 已删除

---

## 状态: ✅ 完成

**开发服务器**: http://localhost:3001  
**编译状态**: 成功  
**Logo 显示**: 正常

---

## 扩展建议

### 添加更多静态资源

**public/** 目录适合放置：
- `favicon.ico`
- `robots.txt`
- `manifest.json`
- 不需要处理的第三方库

**src/assets/** 目录适合放置：
- 图片（jpg, png, svg）
- 字体文件（woff, woff2, ttf）
- 样式文件（css, scss）
- 其他需要优化的资源

### 示例目录结构
```
public/
├── favicon.ico
├── logo.svg
└── robots.txt

src/
├── assets/
│   ├── images/
│   │   ├── logo.svg
│   │   ├── banner.jpg
│   │   └── icons/
│   ├── fonts/
│   │   └── custom-font.woff2
│   └── styles/
│       └── global.css
├── components/
└── lib/
```

---

## 参考文档

- [Vite 静态资源处理](https://vitejs.dev/guide/assets.html)
- [Vite public 目录](https://vitejs.dev/guide/assets.html#the-public-directory)
