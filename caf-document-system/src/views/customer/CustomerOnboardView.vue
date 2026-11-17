<template>
  <div>
    <div class="page-header">
      <h2>新客入网</h2>
      <p>填写客户基本信息，完成入网申请</p>
    </div>

    <el-card shadow="never">
      <el-steps :active="step" finish-status="success" style="margin-bottom:32px">
        <el-step title="基本信息" />
        <el-step title="联系信息" />
        <el-step title="资质材料" />
        <el-step title="确认提交" />
      </el-steps>

      <!-- Step 1 -->
      <el-form v-if="step === 0" :model="form" label-width="120px" style="max-width:600px">
        <el-form-item label="客户名称" required>
          <el-input v-model="form.name" placeholder="请输入企业全称" />
        </el-form-item>
        <el-form-item label="统一社会信用代码" required>
          <el-input v-model="form.creditCode" placeholder="18位统一社会信用代码" />
        </el-form-item>
        <el-form-item label="客户类型" required>
          <el-select v-model="form.type" style="width:100%">
            <el-option label="企业客户" value="enterprise" />
            <el-option label="运营商" value="carrier" />
            <el-option label="政府机构" value="government" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属行业">
          <el-select v-model="form.industry" style="width:100%">
            <el-option label="金融" value="finance" />
            <el-option label="互联网" value="internet" />
            <el-option label="制造业" value="manufacturing" />
            <el-option label="政务" value="government" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- Step 2 -->
      <el-form v-if="step === 1" :model="form" label-width="120px" style="max-width:600px">
        <el-form-item label="联系人姓名" required>
          <el-input v-model="form.contact" />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="电子邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="通讯地址">
          <el-input v-model="form.address" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>

      <!-- Step 3 -->
      <div v-if="step === 2" style="max-width:600px">
        <el-alert title="请上传以下资质材料（支持 PDF、JPG、PNG，单文件不超过 10MB）" type="info" :closable="false" style="margin-bottom:20px" />
        <el-form label-width="160px">
          <el-form-item label="营业执照" required>
            <el-upload action="#" :auto-upload="false" accept=".pdf,.jpg,.png">
              <el-button :icon="Upload">点击上传</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item label="法人身份证（正面）" required>
            <el-upload action="#" :auto-upload="false" accept=".jpg,.png">
              <el-button :icon="Upload">点击上传</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item label="法人身份证（背面）" required>
            <el-upload action="#" :auto-upload="false" accept=".jpg,.png">
              <el-button :icon="Upload">点击上传</el-button>
            </el-upload>
          </el-form-item>
          <el-form-item label="授权委托书">
            <el-upload action="#" :auto-upload="false" accept=".pdf,.jpg,.png">
              <el-button :icon="Upload">点击上传</el-button>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 4 -->
      <div v-if="step === 3" style="max-width:600px">
        <el-descriptions title="入网信息确认" :column="2" border>
          <el-descriptions-item label="客户名称">{{ form.name || '—' }}</el-descriptions-item>
          <el-descriptions-item label="信用代码">{{ form.creditCode || '—' }}</el-descriptions-item>
          <el-descriptions-item label="客户类型">{{ form.type || '—' }}</el-descriptions-item>
          <el-descriptions-item label="所属行业">{{ form.industry || '—' }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ form.contact || '—' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ form.phone || '—' }}</el-descriptions-item>
          <el-descriptions-item label="电子邮箱" :span="2">{{ form.email || '—' }}</el-descriptions-item>
        </el-descriptions>
        <el-alert title="提交后将进入审核流程，请确认信息无误" type="warning" :closable="false" style="margin-top:16px" />
      </div>

      <!-- 操作按钮 -->
      <div style="margin-top:32px;display:flex;gap:12px">
        <el-button v-if="step > 0" @click="step--">上一步</el-button>
        <el-button v-if="step < 3" type="primary" @click="step++">下一步</el-button>
        <el-button v-if="step === 3" type="success" @click="handleSubmit">提交入网申请</el-button>
        <el-button @click="$router.push('/customer/list')">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const step = ref(0)
const form = reactive({
  name: '', creditCode: '', type: '', industry: '',
  contact: '', phone: '', email: '', address: '',
})

const handleSubmit = () => {
  ElMessage.success('入网申请已提交，请等待审核')
  router.push('/customer/list')
}
</script>
