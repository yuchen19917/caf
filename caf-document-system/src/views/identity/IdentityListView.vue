<template>
  <div>
    <div class="page-header">
      <h2>实名资料列表</h2>
      <p>管理客户实名认证资料</p>
    </div>

    <el-card shadow="never">
      <el-form :inline="true" :model="query" style="margin-bottom:16px">
        <el-form-item label="客户名称">
          <el-input v-model="query.name" placeholder="请输入客户名称" clearable style="width:200px" />
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width:130px">
            <el-option label="已认证" value="verified" />
            <el-option label="待审核" value="pending" />
            <el-option label="已过期" value="expired" />
            <el-option label="审核失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
        </el-form-item>
        <el-form-item style="float:right">
          <el-button type="primary" :icon="Plus" @click="$router.push('/identity/collect')">采集资料</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="identities" border style="width:100%">
        <el-table-column prop="customerId" label="客户编号" width="130" />
        <el-table-column prop="customerName" label="客户名称" min-width="160" />
        <el-table-column prop="legalPerson" label="法人姓名" width="100" />
        <el-table-column prop="idType" label="证件类型" width="110" />
        <el-table-column prop="idNumber" label="证件号码" width="180" />
        <el-table-column prop="collectDate" label="采集日期" width="110" />
        <el-table-column prop="expireDate" label="有效期至" width="110" />
        <el-table-column prop="status" label="认证状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default>
            <el-button type="primary" link size="small">查看</el-button>
            <el-button type="warning" link size="small">更新</el-button>
            <el-button type="success" link size="small">审核</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top:16px;display:flex;justify-content:flex-end">
        <el-pagination v-model:current-page="page" :page-size="10" :total="50" layout="total, prev, pager, next" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'

const page = ref(1)
const query = reactive({ name: '', status: '' })

const identities = [
  { customerId: 'CUS-10001', customerName: '中信科技有限公司', legalPerson: '张伟', idType: '居民身份证', idNumber: '110101****0011', collectDate: '2026-09-18', expireDate: '2036-09-17', status: '已认证' },
  { customerId: 'CUS-10002', customerName: '华远数据集团', legalPerson: '李娜', idType: '居民身份证', idNumber: '310101****0022', collectDate: '2026-09-24', expireDate: '2031-09-24', status: '已认证' },
  { customerId: 'CUS-10003', customerName: '新联通信股份', legalPerson: '王磊', idType: '居民身份证', idNumber: '440101****0033', collectDate: '2026-10-08', expireDate: '2029-10-07', status: '待审核' },
  { customerId: 'CUS-10004', customerName: '博远网络科技', legalPerson: '赵敏', idType: '居民身份证', idNumber: '330101****0044', collectDate: '2026-10-28', expireDate: '2026-10-27', status: '已过期' },
]

const statusType = (s: string) => ({ '已认证': 'success', '待审核': 'warning', '已过期': 'danger', '审核失败': 'danger' }[s] || 'info')
</script>
