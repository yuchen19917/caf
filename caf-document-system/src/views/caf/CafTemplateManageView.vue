<template>
  <div>
    <div class="page-header">
      <h2>CAF 模板管理</h2>
      <p>
        按客户类型、业务类型、渠道与产品维度配置 CAF 模板；同一维度组合建议仅启用一套模板，用于入网与业务申请时的表单与归档规则。
      </p>
    </div>

    <el-card shadow="never">
      <el-form :inline="true" :model="query" class="filter-form">
        <el-form-item label="客户类型">
          <el-select v-model="query.customerType" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="o in store.customerTypeOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="query.businessType" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="o in store.businessTypeOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道">
          <el-select v-model="query.channel" placeholder="全部" clearable style="width: 130px">
            <el-option v-for="o in store.channelOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品">
          <el-select v-model="query.product" placeholder="全部" clearable style="width: 180px">
            <el-option v-for="o in store.productOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="编码 / 名称" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.enabled" placeholder="全部" clearable style="width: 100px">
            <el-option label="启用" :value="true" />
            <el-option label="停用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="page = 1">筛选</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
        <el-form-item class="toolbar-right">
          <el-button type="primary" :icon="Plus" @click="openCreate">新建模板</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="pagedList" border style="width: 100%">
        <el-table-column prop="code" label="模板编码" width="200" show-overflow-tooltip />
        <el-table-column prop="name" label="模板名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="客户类型" width="110">
          <template #default="{ row }">{{ labelCustomerType(row.customerType) }}</template>
        </el-table-column>
        <el-table-column label="业务类型" width="110">
          <template #default="{ row }">{{ labelBusinessType(row.businessType) }}</template>
        </el-table-column>
        <el-table-column label="渠道" width="100">
          <template #default="{ row }">{{ labelChannel(row.channel) }}</template>
        </el-table-column>
        <el-table-column label="产品" min-width="140">
          <template #default="{ row }">{{ labelProduct(row.product) }}</template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="88" />
        <el-table-column label="状态" width="86">
          <template #default="{ row }">
            <el-switch
              :model-value="row.enabled"
              inline-prompt
              active-text="启"
              inactive-text="停"
              @change="(v: boolean) => onToggle(row, v)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="confirmRemove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="filteredList.length"
          layout="total, prev, pager, next"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑 CAF 模板' : '新建 CAF 模板'"
      width="560px"
      destroy-on-close
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模板编码" prop="code">
          <el-input v-model="form.code" placeholder="如 CAF-ENT-LSD-PRT-DED" :disabled="!!editingId" />
        </el-form-item>
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="便于识别的名称" />
        </el-form-item>
        <el-form-item label="客户类型" prop="customerType">
          <el-select v-model="form.customerType" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="o in store.customerTypeOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型" prop="businessType">
          <el-select v-model="form.businessType" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="o in store.businessTypeOptions"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道" prop="channel">
          <el-select v-model="form.channel" placeholder="请选择" style="width: 100%">
            <el-option v-for="o in store.channelOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品" prop="product">
          <el-select v-model="form.product" placeholder="请选择" style="width: 100%">
            <el-option v-for="o in store.productOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="form.version" placeholder="如 2026.1" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCafTemplateStore } from '@/stores/cafTemplate'
import type {
  CafTemplate,
  CafTemplateFormPayload,
  CustomerTypeCode,
  BusinessTypeCode,
  ChannelCode,
  ProductCode,
} from '@/types/cafTemplate'

const store = useCafTemplateStore()
const maps = computed(() => store.labelMaps)

function labelCustomerType(c: CustomerTypeCode) {
  return maps.value.customerType[c]
}
function labelBusinessType(c: BusinessTypeCode) {
  return maps.value.businessType[c]
}
function labelChannel(c: ChannelCode) {
  return maps.value.channel[c]
}
function labelProduct(c: ProductCode) {
  return maps.value.product[c]
}

const query = reactive({
  customerType: '' as '' | CafTemplate['customerType'],
  businessType: '' as '' | CafTemplate['businessType'],
  channel: '' as '' | CafTemplate['channel'],
  product: '' as '' | CafTemplate['product'],
  keyword: '',
  enabled: undefined as boolean | undefined,
})

const page = ref(1)
const pageSize = 10

const filteredList = computed(() => {
  const kw = query.keyword.trim().toLowerCase()
  return store.templates.filter((t) => {
    if (query.customerType && t.customerType !== query.customerType) return false
    if (query.businessType && t.businessType !== query.businessType) return false
    if (query.channel && t.channel !== query.channel) return false
    if (query.product && t.product !== query.product) return false
    if (query.enabled !== undefined && t.enabled !== query.enabled) return false
    if (kw && !t.code.toLowerCase().includes(kw) && !t.name.toLowerCase().includes(kw)) return false
    return true
  })
})

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

function resetQuery() {
  query.customerType = ''
  query.businessType = ''
  query.channel = ''
  query.product = ''
  query.keyword = ''
  query.enabled = undefined
  page.value = 1
}

const dialogVisible = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<FormInstance>()

const defaultForm = (): CafTemplateFormPayload => ({
  code: '',
  name: '',
  customerType: 'enterprise',
  businessType: 'leased',
  channel: 'portal',
  product: 'prd-dedicated-standard',
  version: '2026.1',
  enabled: true,
  remark: '',
})

const form = reactive<CafTemplateFormPayload>(defaultForm())

const rules: FormRules = {
  code: [{ required: true, message: '请输入模板编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  customerType: [{ required: true, message: '请选择客户类型', trigger: 'change' }],
  businessType: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
  channel: [{ required: true, message: '请选择渠道', trigger: 'change' }],
  product: [{ required: true, message: '请选择产品', trigger: 'change' }],
  version: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
}

function openCreate() {
  editingId.value = null
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

function openEdit(row: CafTemplate) {
  editingId.value = row.id
  Object.assign(form, {
    code: row.code,
    name: row.name,
    customerType: row.customerType,
    businessType: row.businessType,
    channel: row.channel,
    product: row.product,
    version: row.version,
    enabled: row.enabled,
    remark: row.remark ?? '',
  })
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  Object.assign(form, defaultForm())
  editingId.value = null
}

function submitForm() {
  formRef.value?.validate((valid) => {
    if (!valid) return
    const payload: CafTemplateFormPayload = {
      code: form.code.trim(),
      name: form.name.trim(),
      customerType: form.customerType,
      businessType: form.businessType,
      channel: form.channel,
      product: form.product,
      version: form.version.trim(),
      enabled: form.enabled,
      remark: form.remark?.trim() || undefined,
    }
    if (payload.enabled && store.hasDuplicateScope(payload, editingId.value ?? undefined)) {
      ElMessage.warning('该客户类型、业务、渠道、产品组合下已有启用模板，请先停用其它模板或取消启用。')
      return
    }
    if (editingId.value) {
      store.updateTemplate(editingId.value, payload)
      ElMessage.success('已保存修改')
    } else {
      const dupCode = store.templates.some((t) => t.code === payload.code)
      if (dupCode) {
        ElMessage.error('模板编码已存在')
        return
      }
      store.addTemplate(payload)
      ElMessage.success('已创建模板')
    }
    dialogVisible.value = false
  })
}

function onToggle(row: CafTemplate, enabled: boolean) {
  if (enabled && store.hasDuplicateScope(row, row.id)) {
    row.enabled = false
    ElMessage.warning('该维度组合已有其它启用模板，无法重复启用。')
    return
  }
  store.toggleEnabled(row.id, enabled)
  ElMessage.success(enabled ? '已启用' : '已停用')
}

function confirmRemove(row: CafTemplate) {
  ElMessageBox.confirm(`确定删除模板「${row.name}」？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
    .then(() => {
      store.removeTemplate(row.id)
      ElMessage.success('已删除')
      const maxPage = Math.max(1, Math.ceil(filteredList.value.length / pageSize))
      if (page.value > maxPage) page.value = maxPage
    })
    .catch(() => {})
}
</script>

<style scoped>
.filter-form {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0 8px;
}

.toolbar-right {
  margin-left: auto;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
