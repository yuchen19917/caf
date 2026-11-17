<template>
  <div>
    <div class="page-header">
      <h2>文档归档列表</h2>
      <p>管理所有归档文档，支持分类检索</p>
    </div>

    <el-card shadow="never">
      <el-form :inline="true" :model="query" style="margin-bottom:16px">
        <el-form-item label="文档名称">
          <el-input v-model="query.name" placeholder="请输入文档名称" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="文档分类">
          <el-select v-model="query.category" placeholder="全部" clearable style="width:140px">
            <el-option label="CAF 表单" value="caf" />
            <el-option label="合同协议" value="contract" />
            <el-option label="身份证明" value="identity" />
            <el-option label="技术方案" value="technical" />
            <el-option label="审计报告" value="audit" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传时间">
          <el-date-picker v-model="query.dateRange" type="daterange" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" style="width:240px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button type="primary" :icon="Upload" @click="$router.push('/document/upload')">上传归档</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="documents" border style="width:100%">
        <el-table-column prop="id" label="文档编号" width="150" />
        <el-table-column prop="name" label="文档名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="110">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="customer" label="关联客户" width="160" />
        <el-table-column prop="size" label="文件大小" width="90" />
        <el-table-column prop="uploader" label="上传人" width="90" />
        <el-table-column prop="uploadDate" label="上传日期" width="110" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default>
            <el-button type="primary" link size="small">预览</el-button>
            <el-button type="success" link size="small">下载</el-button>
            <el-button type="danger" link size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top:16px;display:flex;justify-content:flex-end">
        <el-pagination v-model:current-page="page" :page-size="10" :total="5672" layout="total, prev, pager, next" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Upload } from '@element-plus/icons-vue'

const page = ref(1)
const query = reactive({ name: '', category: '', dateRange: null })

const documents = [
  { id: 'DOC-2026-0501', name: '中信科技有限公司_CAF表单_20261101.pdf', category: 'CAF 表单', customer: '中信科技有限公司', size: '2.3MB', uploader: '张伟', uploadDate: '2026-11-01' },
  { id: 'DOC-2026-0498', name: '华远数据集团_云专网合同_20261030.pdf', category: '合同协议', customer: '华远数据集团', size: '1.8MB', uploader: '李娜', uploadDate: '2026-10-30' },
  { id: 'DOC-2026-0495', name: '新联通信股份_法人身份证_20261029.jpg', category: '身份证明', customer: '新联通信股份', size: '0.5MB', uploader: '王磊', uploadDate: '2026-10-29' },
  { id: 'DOC-2026-0490', name: '博远网络科技_技术方案书_20261028.docx', category: '技术方案', customer: '博远网络科技', size: '3.1MB', uploader: '赵敏', uploadDate: '2026-10-28' },
  { id: 'DOC-2026-0487', name: 'Q3合规审计报告_20261027.pdf', category: '审计报告', customer: '—', size: '5.6MB', uploader: '系统', uploadDate: '2026-10-27' },
]
</script>
