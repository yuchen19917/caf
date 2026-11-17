<template>
  <div>
    <div class="page-header">
      <h2>发起业务申请</h2>
      <p>填写业务需求，提交 CAF 申请</p>
    </div>
    <el-card shadow="never" style="max-width:800px">
      <el-form :model="form" label-width="140px">
        <el-divider content-position="left">客户信息</el-divider>
        <el-form-item label="选择客户" required>
          <el-select v-model="form.customerId" placeholder="请选择客户" filterable style="width:100%">
            <el-option label="中信科技有限公司" value="CUS-10001" />
            <el-option label="华远数据集团" value="CUS-10002" />
            <el-option label="新联通信股份" value="CUS-10003" />
          </el-select>
        </el-form-item>
        <el-divider content-position="left">业务信息</el-divider>
        <el-form-item label="业务类型" required>
          <el-radio-group v-model="form.serviceType">
            <el-radio value="leased">专线接入</el-radio>
            <el-radio value="cloud">云专网</el-radio>
            <el-radio value="mpls">MPLS VPN</el-radio>
            <el-radio value="internet">互联网接入</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="带宽需求" required>
          <el-select v-model="form.bandwidth" style="width:200px">
            <el-option label="10M" value="10M" />
            <el-option label="100M" value="100M" />
            <el-option label="500M" value="500M" />
            <el-option label="1G" value="1G" />
          </el-select>
        </el-form-item>
        <el-form-item label="接入地址" required>
          <el-input v-model="form.address" placeholder="请输入业务接入地址" />
        </el-form-item>
        <el-form-item label="期望开通日期">
          <el-date-picker v-model="form.expectedDate" type="date" placeholder="选择日期" style="width:200px" />
        </el-form-item>
        <el-form-item label="业务说明">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
        <el-divider content-position="left">附件材料</el-divider>
        <el-form-item label="CAF 表单">
          <el-upload action="#" :auto-upload="false" accept=".pdf,.doc,.docx">
            <el-button>上传 CAF 表单</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交申请</el-button>
          <el-button @click="handleSaveDraft">保存草稿</el-button>
          <el-button @click="router.push('/application/list')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({
  customerId: '', serviceType: 'leased', bandwidth: '100M',
  address: '', expectedDate: '', remark: '',
})

const handleSubmit = () => {
  ElMessage.success('申请已提交，进入审核流程')
  router.push('/application/list')
}

const handleSaveDraft = () => {
  ElMessage.info('草稿已保存')
}
</script>