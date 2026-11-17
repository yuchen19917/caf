<template>
  <div>
    <div class="page-header">
      <h2>实名资料采集</h2>
      <p>采集并录入客户实名认证信息</p>
    </div>

    <el-card shadow="never" style="max-width:800px">
      <el-form :model="form" label-width="160px">
        <el-divider content-position="left">关联客户</el-divider>
        <el-form-item label="选择客户" required>
          <el-select v-model="form.customerId" placeholder="请选择客户" filterable style="width:100%">
            <el-option label="中信科技有限公司" value="CUS-10001" />
            <el-option label="华远数据集团" value="CUS-10002" />
            <el-option label="新联通信股份" value="CUS-10003" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">法人信息</el-divider>
        <el-form-item label="法人姓名" required>
          <el-input v-model="form.legalPerson" />
        </el-form-item>
        <el-form-item label="证件类型" required>
          <el-select v-model="form.idType" style="width:200px">
            <el-option label="居民身份证" value="id_card" />
            <el-option label="护照" value="passport" />
            <el-option label="港澳居民来往内地通行证" value="hk_pass" />
          </el-select>
        </el-form-item>
        <el-form-item label="证件号码" required>
          <el-input v-model="form.idNumber" placeholder="请输入证件号码" />
        </el-form-item>
        <el-form-item label="证件有效期" required>
          <el-date-picker v-model="form.expireDate" type="date" placeholder="选择有效期" style="width:200px" />
          <el-checkbox v-model="form.longTerm" style="margin-left:12px">长期有效</el-checkbox>
        </el-form-item>

        <el-divider content-position="left">证件图片</el-divider>
        <el-form-item label="身份证正面" required>
          <el-upload
            action="#"
            :auto-upload="false"
            list-type="picture-card"
            :limit="1"
            accept=".jpg,.jpeg,.png"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="身份证背面" required>
          <el-upload
            action="#"
            :auto-upload="false"
            list-type="picture-card"
            :limit="1"
            accept=".jpg,.jpeg,.png"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-divider content-position="left">采集说明</el-divider>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">提交采集</el-button>
          <el-button @click="$router.push('/identity/list')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({
  customerId: '', legalPerson: '', idType: 'id_card',
  idNumber: '', expireDate: '', longTerm: false, remark: '',
})

const handleSubmit = () => {
  ElMessage.success('实名资料已提交，等待审核')
  router.push('/identity/list')
}
</script>
