# CAF数据存储说明

## 📋 概述

CAF（Customer Application Form）申请单的数据保存在浏览器的 **localStorage** 中，实现了客户端持久化存储。

## 💾 存储位置

### 主要存储位置

**localStorage Key:** `caf-app-registry-v1`

**存储内容:**
```json
{
  "cafs": [
    {
      "id": "CAF-2026-001",
      "customerType": "Individual",
      "fullName": "Zhang San",
      "status": "Pending",
      "documents": [...],
      ...
    }
  ],
  "archiveEntries": [
    {
      "id": "arc-CAF-2026-001-1234567890",
      "name": "CAF-2026-001-approved-archive.pdf",
      "cafId": "CAF-2026-001",
      ...
    }
  ]
}
```

### 文件存储位置

**IndexedDB Database:** `CAF_FILE_STORAGE`

**存储内容:**
- 上传的文件数据（Base64编码）
- 文件元数据（文件名、大小、类型等）

## 🔄 数据流程

### 1. 创建CAF申请

```
用户填写表单
    ↓
点击提交
    ↓
CAFForm.handleSubmit()
    ↓
addApplicationFromForm(form)
    ↓
buildCafFromForm(form, cafs)
    ↓
生成新的CAF对象
    ↓
添加到cafs数组
    ↓
触发useEffect
    ↓
保存到localStorage
```

**代码流程:**

```typescript
// 1. CAFForm.tsx - 提交表单
const handleSubmit = () => {
  setIsVerifying(true);
  setTimeout(() => {
    const record = addApplicationFromForm(form);
    setSubmittedRecord(record);
    setIsSubmitted(true);
  }, 2500);
};

// 2. ApplicationContext.tsx - 添加CAF
const addApplicationFromForm = useCallback((form: CAFFormShape): CustomerApplicationForm => {
  let created!: CustomerApplicationForm;
  setState((s) => {
    created = buildCafFromForm(form, s.cafs);
    return { ...s, cafs: [created, ...s.cafs] };
  });
  return created;
}, []);

// 3. cafFromForm.ts - 构建CAF对象
export function buildCafFromForm(form: CAFFormShape, cafs: CustomerApplicationForm[]): CustomerApplicationForm {
  const id = nextCafId(cafs);  // 生成CAF ID
  const submissionDate = new Date().toISOString();
  
  return {
    id,
    customerType: form.customerType,
    fullName: form.fullName,
    status: 'Pending',
    submissionDate,
    documents: [...],
    // ... 其他字段
  };
}

// 4. ApplicationContext.tsx - 自动保存
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ cafs, archiveEntries }));
}, [cafs, archiveEntries]);
```

### 2. 查看CAF列表

```
打开Customer Registry
    ↓
ApplicationContext加载
    ↓
从localStorage读取数据
    ↓
显示CAF列表
```

**代码流程:**

```typescript
// ApplicationContext.tsx - 加载数据
function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cafs: MOCK_CAFS, archiveEntries: [] };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      cafs: Array.isArray(parsed.cafs) && parsed.cafs.length > 0 ? parsed.cafs : MOCK_CAFS,
      archiveEntries: Array.isArray(parsed.archiveEntries) ? parsed.archiveEntries : [],
    };
  } catch {
    return { cafs: MOCK_CAFS, archiveEntries: [] };
  }
}

// 初始化状态
const [{ cafs, archiveEntries }, setState] = useState<PersistedState>(loadPersisted);
```

### 3. 审核和归档

```
审核人员批准CAF
    ↓
approveAndArchive(cafId)
    ↓
更新CAF状态为'Archived'
    ↓
创建归档记录
    ↓
保存到localStorage
```

**代码流程:**

```typescript
const approveAndArchive = useCallback((cafId: string) => {
  const archivedAt = new Date().toISOString();
  const bundleName = `${cafId}-approved-archive.pdf`;
  const entry: ArchivedLibraryFile = {
    id: `arc-${cafId}-${Date.now()}`,
    name: bundleName,
    cafId,
    archivedAt,
    // ...
  };

  setState((s) => ({
    cafs: s.cafs.map((c) => (c.id === cafId ? { ...c, status: 'Archived' } : c)),
    archiveEntries: [entry, ...s.archiveEntries],
  }));
}, []);
```

## 📊 数据结构

### CAF对象结构

```typescript
interface CustomerApplicationForm {
  id: string;                    // CAF-2026-001
  customerType: CustomerType;    // 'Individual' | 'Corporate'
  fullName: string;              // 客户姓名
  idNumber: string;              // 身份证号
  idType: string;                // 证件类型
  address: string;               // 地址
  contactNumber: string;         // 联系电话
  email?: string;                // 邮箱
  serviceType: ServiceType;      // 'Prepaid' | 'Postpaid' | 'Data Only'
  planName: string;              // 套餐名称
  status: CAFStatus;             // 'Pending' | 'Approved' | 'Rejected' | 'Correction' | 'Archived'
  submissionDate: string;        // 提交日期 (ISO格式)
  documents: Document[];         // 文档列表
  corporateDetails?: {           // 企业详情（仅Corporate类型）
    companyRegNo: string;
    taxId: string;
    authorizedSignatory: string;
    technicalContact: string;
    staticIpRequired: boolean;
  };
}
```

### Document对象结构

```typescript
interface Document {
  id: string;                    // DOC-CAF-2026-001-0
  type: string;                  // 'Attachment' | 'Summary'
  name: string;                  // 文件名
  uploadDate: string;            // 上传日期
  status: 'Verified' | 'Unverified' | 'Rejected';
  url?: string;
  fileId?: string;               // IndexedDB文件ID引用
}
```

### 归档记录结构

```typescript
interface ArchivedLibraryFile {
  id: string;                    // arc-CAF-2026-001-1234567890
  name: string;                  // CAF-2026-001-approved-archive.pdf
  size: string;                  // "650 KB"
  archivedAt: string;            // ISO日期
  type: 'pdf' | 'image';
  status: 'verified' | 'pending' | 'approved' | 'rejected';
  cafId: string;                 // 关联的CAF ID
}
```

## 🔍 查看存储的数据

### 方法1: 浏览器开发者工具

1. **打开开发者工具**
   - 按 F12 或右键 → 检查

2. **查看localStorage**
   - 切换到 "Application" 标签（Chrome）或 "Storage" 标签（Firefox）
   - 左侧选择 "Local Storage"
   - 选择当前域名
   - 找到 `caf-app-registry-v1` 键
   - 查看值（JSON格式）

3. **查看IndexedDB**
   - 在 "Application" 标签中
   - 左侧选择 "IndexedDB"
   - 展开 "CAF_FILE_STORAGE"
   - 查看 "uploaded_files" 对象存储

### 方法2: 浏览器控制台

```javascript
// 查看所有CAF数据
const data = JSON.parse(localStorage.getItem('caf-app-registry-v1'));
console.log('CAFs:', data.cafs);
console.log('Archive Entries:', data.archiveEntries);

// 查看CAF数量
console.log('Total CAFs:', data.cafs.length);

// 查看最新的CAF
console.log('Latest CAF:', data.cafs[0]);

// 按状态统计
const stats = {
  pending: data.cafs.filter(c => c.status === 'Pending').length,
  approved: data.cafs.filter(c => c.status === 'Approved').length,
  rejected: data.cafs.filter(c => c.status === 'Rejected').length,
  archived: data.cafs.filter(c => c.status === 'Archived').length,
};
console.log('Statistics:', stats);
```

### 方法3: 使用测试脚本

运行 `TEST_FILE_UPLOAD_WORKFLOW.js` 中的测试函数：

```javascript
// 在浏览器控制台运行
testFileUpload.testLocalStorage();
testFileUpload.testListFiles();
testFileUpload.testFileCafLinkage();
```

## 💡 数据持久化特点

### 优点

1. **客户端存储**
   - 无需服务器
   - 快速访问
   - 离线可用

2. **自动保存**
   - 每次状态变化自动保存
   - 无需手动保存
   - 实时同步

3. **数据持久化**
   - 刷新页面数据不丢失
   - 关闭浏览器数据保留
   - 长期存储

4. **容量充足**
   - localStorage: 5-10MB
   - IndexedDB: 50MB+
   - 足够存储大量CAF

### 限制

1. **浏览器限制**
   - 数据存储在特定浏览器
   - 不同浏览器数据不共享
   - 清除浏览器数据会丢失

2. **容量限制**
   - localStorage有大小限制
   - 大量数据可能影响性能
   - 需要定期清理

3. **安全性**
   - 数据存储在客户端
   - 用户可以查看和修改
   - 不适合敏感数据

## 🔧 数据管理

### 清除所有数据

```javascript
// 清除localStorage
localStorage.removeItem('caf-app-registry-v1');

// 清除IndexedDB
const request = indexedDB.deleteDatabase('CAF_FILE_STORAGE');
request.onsuccess = () => console.log('Database deleted');
```

### 导出数据

```javascript
// 导出CAF数据
const data = JSON.parse(localStorage.getItem('caf-app-registry-v1'));
const json = JSON.stringify(data, null, 2);
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'caf-data-backup.json';
a.click();
```

### 导入数据

```javascript
// 导入CAF数据
const input = document.createElement('input');
input.type = 'file';
input.accept = 'application/json';
input.onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const data = JSON.parse(event.target.result);
    localStorage.setItem('caf-app-registry-v1', JSON.stringify(data));
    location.reload();
  };
  reader.readAsText(file);
};
input.click();
```

### 重置为初始数据

```javascript
// 重置为MOCK数据
localStorage.removeItem('caf-app-registry-v1');
location.reload();
```

## 📈 存储容量监控

### 检查localStorage使用情况

```javascript
function getLocalStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return (total / 1024).toFixed(2) + ' KB';
}

console.log('localStorage size:', getLocalStorageSize());
```

### 检查IndexedDB使用情况

```javascript
if (navigator.storage && navigator.storage.estimate) {
  navigator.storage.estimate().then(estimate => {
    const usage = (estimate.usage / 1024 / 1024).toFixed(2);
    const quota = (estimate.quota / 1024 / 1024).toFixed(2);
    const percent = ((estimate.usage / estimate.quota) * 100).toFixed(2);
    console.log(`Storage: ${usage} MB / ${quota} MB (${percent}%)`);
  });
}
```

## 🚀 未来增强

### 服务器同步

```typescript
// 将来可以添加服务器同步
const syncToServer = async (caf: CustomerApplicationForm) => {
  const response = await fetch('/api/cafs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caf),
  });
  return response.json();
};
```

### 云端备份

```typescript
// 定期备份到云端
const backupToCloud = async () => {
  const data = localStorage.getItem('caf-app-registry-v1');
  await fetch('/api/backup', {
    method: 'POST',
    body: data,
  });
};
```

### 数据压缩

```typescript
// 压缩存储数据
import pako from 'pako';

const compressData = (data: any) => {
  const json = JSON.stringify(data);
  const compressed = pako.deflate(json);
  return btoa(String.fromCharCode(...compressed));
};

const decompressData = (compressed: string) => {
  const binary = atob(compressed);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decompressed = pako.inflate(bytes, { to: 'string' });
  return JSON.parse(decompressed);
};
```

## 📚 相关文件

- `src/context/ApplicationContext.tsx` - 数据管理上下文
- `src/lib/cafFromForm.ts` - CAF数据构建器
- `src/lib/fileStorage.ts` - 文件存储管理器
- `src/types.ts` - 类型定义
- `DATA_PERSISTENCE_SUMMARY.md` - 数据持久化总结

## ❓ 常见问题

### Q: 数据会丢失吗？

A: 只要不清除浏览器数据，localStorage和IndexedDB中的数据会永久保存。但以下情况会导致数据丢失：
- 手动清除浏览器数据
- 使用隐私模式/无痕模式
- 浏览器存储空间不足
- 用户手动删除

### Q: 可以在不同设备访问吗？

A: 不可以。localStorage和IndexedDB是浏览器本地存储，数据只存在于当前浏览器中。如需跨设备访问，需要实现服务器同步功能。

### Q: 数据安全吗？

A: localStorage中的数据是明文存储，任何能访问浏览器的人都可以查看和修改。不建议存储敏感信息。如需安全存储，应该：
- 加密敏感数据
- 使用服务器端存储
- 实现访问控制

### Q: 如何备份数据？

A: 可以通过以下方式备份：
1. 使用浏览器开发者工具导出localStorage数据
2. 使用上面提供的导出脚本
3. 定期同步到服务器（需要实现）

### Q: 存储容量够用吗？

A: 对于大多数使用场景是够用的：
- localStorage: 5-10MB（存储CAF元数据）
- IndexedDB: 50MB+（存储文件数据）
- 可以存储约50-100个CAF（包含文件）

如果需要存储更多数据，建议：
- 定期归档旧数据
- 压缩文件
- 使用服务器存储

---

**文档版本:** 1.0  
**最后更新:** 2026年5月6日  

**© 2026 ATOMA Telecom. All Rights Reserved.**
