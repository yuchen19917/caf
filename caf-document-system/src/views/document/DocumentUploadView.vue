<template>
  <div>
    <div class="page-header">
      <h2>上传归档</h2>
      <p>上传文档并完成归档分类</p>
    </div>

    <el-card shadow="never" style="max-width:800px">
      <el-form :model="form" label-width="140px">
        <el-form-item label="关联客户">
          <el-select v-model="form.customerId" placeholder="请选择关联客户（可选）" filterable clearable style="width:100%">
            <el-option label="中信科技有限公司" value="CUS-10001" />
            <el-option label="华远数据集团" value="CUS-10002" />
            <el-option label="新联通信股份" value="CUS-10003" />
          </el-select>
        </el-form-item>
        <el-form-item label="文档分类" required>
          <el-select v-model="form.category" style="width:200px">
            <el-option label="CAF 表单" value="caf" />
            <el-option label="合同协议" value="contract" />
            <el-option label="身份证明" value="identity" />
            <el-option label="技术方案" value="technical" />
            <el-option label="审计报告" value="audit" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="文档描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入文档描述（可选）" />
        </el-form-item>
        <el-form-item label="上传文件" required>
          <el-upload
            v-model:file-list="fileList"
            action="#"
            :auto-upload="false"
            multiple
            drag
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
            style="width:100%"
          >
            <el-icon :size="40" style="color:#c0c4cc"><UploadFilled /></el-icon>
            <div style="margin-top:8px;color:#606266">拖拽文件到此处，或 <em style="color:#409eff">点击上传</em></div>
            <template #tip>
              <div style="color:#909399;font-size:12px;margin-top:8px">
                支持 PDF、Word、Excel、图片格式，单文件不超过 50MB，最多同时上传 10 个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleUpload">确认归档</el-button>
          <el-button @click="$router.push('/document/list')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileList = ref([])
const form = reactive({ customerId: '', category: 'caf', description: '' })

const handleUpload = () => {
  if (!fileList.value.length) {
    ElMessage.warning('请先选择要上传的文件')
    return
  }
  ElMessage.success(`${fileList.value.length} 个文件已成功归档`)
  router.push('/document/list')
}
</script>
