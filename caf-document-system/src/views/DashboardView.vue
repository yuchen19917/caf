<template>
  <div>
    <div class="page-header">
      <h2>概览仪表盘</h2>
      <p>CAF & Document 管理系统 — AsiaInfo 客户入网与合规支撑平台</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card class="stat-card" shadow="never">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
            <el-icon :size="40" :style="{ color: stat.color, opacity: 0.2 }">
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div style="margin-top:12px;font-size:12px;color:#909399">
            <el-icon><Top /></el-icon>
            较上月 <span :style="{ color: stat.color }">+{{ stat.growth }}%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- 最近申请 -->
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:600">最近业务申请</span>
              <el-button type="primary" link @click="$router.push('/application/list')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentApplications" size="small" style="width:100%">
            <el-table-column prop="id" label="申请编号" width="130" />
            <el-table-column prop="customer" label="客户名称" />
            <el-table-column prop="type" label="业务类型" />
            <el-table-column prop="date" label="申请日期" width="110" />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 待办事项 -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <span style="font-weight:600">待办事项</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="item in todos"
              :key="item.id"
              :type="item.type"
              :timestamp="item.time"
              placement="top"
            >
              {{ item.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
const stats = [
  { label: '客户总数', value: '1,284', growth: 12, color: '#409eff', icon: 'UserFilled' },
  { label: '本月申请', value: '86', growth: 8, color: '#67c23a', icon: 'Document' },
  { label: '待审资料', value: '23', growth: 5, color: '#e6a23c', icon: 'IdCard' },
  { label: '归档文档', value: '5,672', growth: 15, color: '#9b59b6', icon: 'FolderOpened' },
]

const recentApplications = [
  { id: 'APP-2026-0501', customer: '中信科技有限公司', type: '专线接入', date: '2026-11-01', status: '审核中' },
  { id: 'APP-2026-0498', customer: '华远数据集团', type: '云专网', date: '2026-10-30', status: '已通过' },
  { id: 'APP-2026-0495', customer: '新联通信股份', type: 'MPLS VPN', date: '2026-10-29', status: '已通过' },
  { id: 'APP-2026-0490', customer: '博远网络科技', type: '互联网接入', date: '2026-10-28', status: '待提交' },
  { id: 'APP-2026-0487', customer: '鑫源电子商务', type: '专线接入', date: '2026-10-27', status: '已拒绝' },
]

const todos = [
  { id: 1, content: '中信科技 CAF 资料待审核', type: 'warning', time: '今天 10:30' },
  { id: 2, content: '3份文档归档待确认', type: 'primary', time: '今天 09:15' },
  { id: 3, content: '博远网络申请待补充材料', type: 'danger', time: '昨天 16:40' },
  { id: 4, content: '季度合规审计报告生成', type: 'success', time: '昨天 14:00' },
]

const statusType = (status: string) => {
  const map: Record<string, string> = {
    '审核中': 'warning',
    '已通过': 'success',
    '待提交': 'info',
    '已拒绝': 'danger',
  }
  return map[status] || 'info'
}
</script>
