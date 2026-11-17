<template>
  <div>
    <div class="page-header">
      <h2>业务申请列表</h2>
      <p>查看和管理所有业务申请记录</p>
    </div>

    <el-card shadow="never">
      <el-form :inline="true" :model="query" style="margin-bottom:16px">
        <el-form-item label="申请编号">
          <el-input v-model="query.id" placeholder="APP-XXXX" clearable style="width:160px" />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="query.type" placeholder="全部" clearable style="width:140px">
            <el-option label="专线接入" value="leased" />
            <el-option label="云专网" value="cloud" />
            <el-option label="MPLS VPN" value="mpls" />
            <el-option label="互联网接入" value="internet" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width:120px">
            <el-option label="待提交" value="draft" />
            <el-option label="审核中" value="reviewing" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button type="primary" :icon="Plus" @click="$router.push('/application/create')">发起申请</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="applications" border style="width:100%">
        <el-table-column prop="id" label="申请编号" width="150" />
        <el-table-column prop="customer" label="客户名称" min-width="160" />
        <el-table-column prop="type" label="业务类型" width="120" />
        <el-table-column prop="bandwidth" label="带宽" width="90" />
        <el-table-column prop="applicant" label="申请人" width="90" />
        <el-table-column prop="date" label="申请日期" width="110" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small">详情</el-button>
            <el-button v-if="row.status === '待提交'" type="warning" link size="small">编辑</el-button>
            <el-button v-if="row.status === '审核中'" type="success" link size="small">审核</el-button>
            <el-button type="danger" link size="small">撤销</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top:16px;display:flex;justify-content:flex-end">
        <el-pagination v-model:current-page="page" :page-size="10" :total="86" layout="total, prev, pager, next" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'

const page = ref(1)
const query = reactive({ id: '', type: '', status: '' })
const resetQuery = () => { query.id = ''; query.type = ''; query.status = '' }

const applications = [
  { id: 'APP-2026-0501', customer: '中信科技有限公司', type: '专线接入', bandwidth: '100M', applicant: '张伟', date: '2026-11-01', status: '审核中' },
  { id: 'APP-2026-0498', customer: '华远数据集团', type: '云专网', bandwidth: '1G', applicant: '李娜', date: '2026-10-30', status: '已通过' },
  { id: 'APP-2026-0495', customer: '新联通信股份', type: 'MPLS VPN', bandwidth: '500M', applicant: '王磊', date: '2026-10-29', status: '已通过' },
  { id: 'APP-2026-0490', customer: '博远网络科技', type: '互联网接入', bandwidth: '200M', applicant: '赵敏', date: '2026-10-28', status: '待提交' },
  { id: 'APP-2026-0487', customer: '鑫源电子商务', type: '专线接入', bandwidth: '50M', applicant: '陈刚', date: '2026-10-27', status: '已拒绝' },
]

const statusType = (status: string) => {
  const map: Record<string, string> = { '审核中': 'warning', '已通过': 'success', '待提交': 'info', '已拒绝': 'danger' }
  return map[status] || 'info'
}
</script>
