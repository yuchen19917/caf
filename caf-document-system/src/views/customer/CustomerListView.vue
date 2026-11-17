<template>
  <div>
    <div class="page-header">
      <h2>客户列表</h2>
      <p>管理所有已入网客户信息</p>
    </div>

    <el-card shadow="never">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="query" style="margin-bottom:16px">
        <el-form-item label="客户名称">
          <el-input v-model="query.name" placeholder="请输入客户名称" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="入网状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width:140px">
            <el-option label="已激活" value="active" />
            <el-option label="待审核" value="pending" />
            <el-option label="已停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button type="primary" :icon="Plus" @click="$router.push('/customer/onboard')">新客入网</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="customers" border style="width:100%">
        <el-table-column prop="id" label="客户编号" width="130" />
        <el-table-column prop="name" label="客户名称" min-width="160" />
        <el-table-column prop="contact" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="type" label="客户类型" width="100" />
        <el-table-column prop="onboardDate" label="入网日期" width="110" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === '已激活' ? 'success' : row.status === '待审核' ? 'warning' : 'danger'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default>
            <el-button type="primary" link size="small">查看</el-button>
            <el-button type="primary" link size="small">编辑</el-button>
            <el-button type="danger" link size="small">停用</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top:16px;display:flex;justify-content:flex-end">
        <el-pagination
          v-model:current-page="page"
          :page-size="10"
          :total="100"
          layout="total, prev, pager, next"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'

const page = ref(1)
const query = reactive({ name: '', status: '' })

const resetQuery = () => {
  query.name = ''
  query.status = ''
}

const customers = [
  { id: 'CUS-10001', name: '中信科技有限公司', contact: '张伟', phone: '138****8001', type: '企业', onboardDate: '2026-09-18', status: '已激活' },
  { id: 'CUS-10002', name: '华远数据集团', contact: '李娜', phone: '139****9002', type: '企业', onboardDate: '2026-09-24', status: '已激活' },
  { id: 'CUS-10003', name: '新联通信股份', contact: '王磊', phone: '137****7003', type: '运营商', onboardDate: '2026-10-08', status: '已激活' },
  { id: 'CUS-10004', name: '博远网络科技', contact: '赵敏', phone: '136****6004', type: '企业', onboardDate: '2026-10-28', status: '待审核' },
  { id: 'CUS-10005', name: '鑫源电子商务', contact: '陈刚', phone: '135****5005', type: '企业', onboardDate: '2026-09-12', status: '已停用' },
]
</script>
