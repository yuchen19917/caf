<template>
  <div>
    <div class="page-header">
      <h2>合规审计</h2>
      <p>查看合规审计记录，生成审计报告</p>
    </div>

    <!-- 审计概览 -->
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="6" v-for="item in auditStats" :key="item.label">
        <el-card shadow="never">
          <div style="text-align:center">
            <div style="font-size:26px;font-weight:700;" :style="{ color: item.color }">{{ item.value }}</div>
            <div style="font-size:13px;color:#909399;margin-top:4px">{{ item.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:600">审计日志</span>
          <div style="display:flex;gap:8px">
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
              start-placeholder="开始日期" end-placeholder="结束日期" style="width:240px" size="small" />
            <el-select v-model="auditType" placeholder="操作类型" clearable style="width:130px" size="small">
              <el-option label="客户入网" value="onboard" />
              <el-option label="资料审核" value="review" />
              <el-option label="文档操作" value="document" />
              <el-option label="申请审批" value="approval" />
            </el-select>
            <el-button type="primary" size="small" :icon="Download">导出报告</el-button>
          </div>
        </div>
      </template>

      <el-table :data="auditLogs" border style="width:100%">
        <el-table-column prop="time" label="操作时间" width="160" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="action" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="actionType(row.action)" size="small">{{ row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="操作对象" min-width="180" />
        <el-table-column prop="detail" label="操作详情" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP 地址" width="130" />
        <el-table-column prop="result" label="结果" width="80">
          <template #default="{ row }">
            <el-tag :type="row.result === '成功' ? 'success' : 'danger'" size="small">{{ row.result }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top:16px;display:flex;justify-content:flex-end">
        <el-pagination v-model:current-page="page" :page-size="10" :total="320" layout="total, prev, pager, next" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from '@element-plus/icons-vue'

const page = ref(1)
const dateRange = ref(null)
const auditType = ref('')

const auditStats = [
  { label: '本月操作总数', value: '1,248', color: '#409eff' },
  { label: '合规通过', value: '1,201', color: '#67c23a' },
  { label: '合规警告', value: '38', color: '#e6a23c' },
  { label: '合规违规', value: '9', color: '#f56c6c' },
]

const auditLogs = [
  { time: '2026-11-01 10:32:15', operator: '张伟', action: '申请审批', target: 'APP-2026-0501', detail: '审核通过中信科技专线接入申请', ip: '192.168.1.101', result: '成功' },
  { time: '2026-11-01 09:45:22', operator: '李娜', action: '文档操作', target: 'DOC-2026-0498', detail: '上传华远数据集团合同文件', ip: '192.168.1.102', result: '成功' },
  { time: '2026-10-30 16:20:08', operator: '王磊', action: '资料审核', target: 'CUS-10003', detail: '审核新联通信股份实名资料', ip: '192.168.1.103', result: '成功' },
  { time: '2026-10-30 14:55:33', operator: '赵敏', action: '客户入网', target: 'CUS-10004', detail: '提交博远网络科技入网申请', ip: '192.168.1.104', result: '成功' },
  { time: '2026-10-29 11:10:45', operator: '系统', action: '申请审批', target: 'APP-2026-0487', detail: '自动拒绝鑫源电子商务申请（资料不完整）', ip: '127.0.0.1', result: '成功' },
]

const actionType = (action: string) => {
  const map: Record<string, string> = { '申请审批': 'primary', '文档操作': 'info', '资料审核': 'warning', '客户入网': 'success' }
  return map[action] || 'info'
}
</script>
