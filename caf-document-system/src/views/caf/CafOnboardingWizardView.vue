<template>
  <div class="caf-onboarding">
    <div class="page-header">
      <h2>CAF 入网办理（移动 / 宽带 / 企业）</h2>
      <p>
        适用于个人客户或企业客户首次办理 AsiaInfo 移动业务、宽带业务或企业业务。业务人员或 Dealer
        按步骤完成类型选择、模板加载、资料录入、产品与归档资料上传、校验与提交；审核通过后将联动 CRM/BSS
        与开通归档（以下为端到端演示流程）。
      </p>
    </div>

    <el-alert type="info" :closable="false" show-icon class="scenario-legend">
      <template #title>
        <span class="legend-title">流程说明（10 步）</span>
      </template>
      <ol class="legend-ol">
        <li>选择客户类型与业务类型</li>
        <li>加载 CAF 模板与必传资料清单</li>
        <li>录入客户、联系、地址、证件信息</li>
        <li>选择产品、套餐、增值、合约</li>
        <li>上传证件、照片、签名、授权等</li>
        <li>字段 / 资料完整性 / 重复客户校验</li>
        <li>提交 CAF 进入审核</li>
        <li>审核通过后创建 CRM/BSS 客户与订购</li>
        <li>业务开通结果回写</li>
        <li>CAF 与文档正式归档</li>
      </ol>
    </el-alert>

    <el-card shadow="never" class="step-card">
      <el-steps :active="stepActive" finish-status="success" align-center>
        <el-step title="类型选择" description="步骤 1" />
        <el-step title="模板与清单" description="步骤 2" />
        <el-step title="客户与证件" description="步骤 3" />
        <el-step title="产品与合约" description="步骤 4" />
        <el-step title="资料上传" description="步骤 5" />
        <el-step title="校验与提交" description="步骤 6–7" />
      </el-steps>

      <div class="channel-tag">
        <el-tag type="warning" effect="plain">受理渠道：Dealer（{{ channelLabel }}）</el-tag>
      </div>

      <!-- Step 0 -->
      <div v-show="store.activeStep === 0" class="step-panel">
        <h3 class="panel-title">1. 选择客户类型与业务类型</h3>
        <el-form label-width="120px" class="max-form">
          <el-form-item label="客户类型" required>
            <el-radio-group v-model="store.customerType">
              <el-radio value="personal">个人客户</el-radio>
              <el-radio value="enterprise">企业客户</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="业务类型" required>
            <el-select
              v-model="store.businessType"
              placeholder="请选择移动 / 宽带 / 企业业务"
              clearable
              style="width: 100%; max-width: 400px"
            >
              <el-option
                v-for="o in scenarioBusinessOptions"
                :key="o.value"
                :label="o.label"
                :value="o.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <el-alert
          v-if="store.customerType && store.businessType && store.matchingTemplates.length === 0"
          title="未找到可用 CAF 模板"
          type="error"
          :closable="false"
          style="margin-top: 8px"
          description="请在「CAF 模板 → 模板配置」中为该客户类型、业务类型、Dealer 渠道维护启用模板。"
        />
      </div>

      <!-- Step 1 -->
      <div v-show="store.activeStep === 1" class="step-panel">
        <h3 class="panel-title">2. 系统加载 CAF 模板与必传资料清单</h3>
        <p v-if="selectedTpl" class="hint">
          已匹配模板：<strong>{{ selectedTpl.code }}</strong> · {{ selectedTpl.name }}（v{{ selectedTpl.version }}）
        </p>
        <el-radio-group v-model="store.selectedTemplateId" class="template-grid">
          <el-card
            v-for="tpl in store.matchingTemplates"
            :key="tpl.id"
            shadow="hover"
            :class="['tpl-card', { 'is-active': store.selectedTemplateId === tpl.id }]"
            @click="store.selectTemplate(tpl.id)"
          >
            <el-radio :value="tpl.id" class="tpl-radio">
              <span class="tpl-name">{{ tpl.name }}</span>
              <span class="tpl-meta">{{ tpl.code }} · {{ productLabel(tpl.product) }}</span>
            </el-radio>
          </el-card>
        </el-radio-group>

        <div v-if="store.requiredDocs.length" class="doc-section">
          <h4>必传资料清单</h4>
          <el-table :data="store.requiredDocs" border size="small" style="width: 100%">
            <el-table-column prop="name" label="资料名称" />
            <el-table-column label="是否必传" width="100">
              <template #default="{ row }">
                <el-tag :type="row.mandatory ? 'danger' : 'info'" size="small">
                  {{ row.mandatory ? '必传' : '选传' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="资料编码" width="140" />
          </el-table>
        </div>
      </div>

      <!-- Step 2 -->
      <div v-show="store.activeStep === 2" class="step-panel">
        <h3 class="panel-title">3. 录入客户基本信息、联系方式、地址与证件</h3>
        <el-form :model="store.customer" label-width="140px" class="max-form">
          <template v-if="store.customerType === 'enterprise'">
            <el-form-item label="企业名称" required>
              <el-input v-model="store.customer.companyName" placeholder="营业执照全称" />
            </el-form-item>
            <el-form-item label="统一社会信用代码" required>
              <el-input v-model="store.customer.creditCode" placeholder="18 位" maxlength="18" show-word-limit />
            </el-form-item>
          </template>
          <el-form-item :label="store.customerType === 'enterprise' ? '经办人姓名' : '客户姓名'" required>
            <el-input v-model="store.customer.holderName" placeholder="与证件一致" />
          </el-form-item>
          <el-form-item label="证件类型" required>
            <el-select v-model="store.customer.idType" style="width: 100%; max-width: 400px">
              <el-option label="居民身份证" value="id_card" />
              <el-option label="护照" value="passport" />
              <el-option label="港澳通行证" value="hk_mo_pass" />
            </el-select>
          </el-form-item>
          <el-form-item label="证件号码" required>
            <el-input v-model="store.customer.idNumber" placeholder="个人默认校验 18 位身份证" />
          </el-form-item>
          <el-form-item label="联系电话" required>
            <el-input v-model="store.customer.phone" placeholder="11 位手机号" maxlength="11" />
          </el-form-item>
          <el-form-item label="电子邮箱">
            <el-input v-model="store.customer.email" placeholder="选填" />
          </el-form-item>
          <el-form-item label="地址" required>
            <el-input v-model="store.customer.address" type="textarea" :rows="2" placeholder="装机或通讯地址" />
          </el-form-item>
        </el-form>
        <el-alert type="warning" :closable="false" show-icon title="重复客户演示" style="margin-top: 8px">
          手机号填 {{ store.DUPLICATE_PHONE }} 或证件号填 {{ store.DUPLICATE_ID }} 将触发重复客户校验失败。
        </el-alert>
      </div>

      <!-- Step 3 -->
      <div v-show="store.activeStep === 3" class="step-panel">
        <h3 class="panel-title">4. 选择产品、套餐、增值服务与合约期限</h3>
        <el-form label-width="140px" class="max-form">
          <el-form-item label="主产品" required>
            <el-select v-model="store.product.productCode" placeholder="与模板绑定，可确认" style="width: 100%; max-width: 420px">
              <el-option
                v-for="p in productOptionsForTemplate"
                :key="p.value"
                :label="p.label"
                :value="p.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="套餐名称">
            <el-input v-model="store.product.packageName" placeholder="如：5G 融合 129 档" />
          </el-form-item>
          <el-form-item label="增值服务">
            <el-checkbox-group v-model="store.product.valueAdded">
              <el-checkbox v-for="x in valueAddedOptions" :key="x.value" :label="x.value">
                {{ x.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="合约期限（月）" required>
            <el-input-number v-model="store.product.contractMonths" :min="1" :max="60" />
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 4 -->
      <div v-show="store.activeStep === 4" class="step-panel">
        <h3 class="panel-title">5. 上传证件、照片、签名、授权等文件</h3>
        <p class="hint">单文件演示：选择本地文件后记录文件名（不落服务器）。必传项全部上传后方可进入下一步。</p>
        <div v-for="doc in store.requiredDocs" :key="doc.code" class="upload-row">
          <div class="upload-label">
            <span>{{ doc.name }}</span>
            <el-tag v-if="doc.mandatory" type="danger" size="small">必传</el-tag>
            <el-tag v-else type="info" size="small">选传</el-tag>
          </div>
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept=".pdf,.jpg,.jpeg,.png"
            @change="(_f: UploadFile, fileList: UploadFiles) => onFilePick(doc.code, fileList)"
          >
            <el-button type="primary" plain>选择文件</el-button>
          </el-upload>
          <span v-if="store.uploads[doc.code]" class="file-name">{{ store.uploads[doc.code] }}</span>
          <el-button v-if="store.uploads[doc.code]" link type="danger" @click="store.setUpload(doc.code, null)">
            清除
          </el-button>
        </div>
      </div>

      <!-- Step 5 -->
      <div v-show="store.activeStep === 5" class="step-panel">
        <h3 class="panel-title">6–7. 校验并提交 CAF</h3>
        <el-space direction="vertical" alignment="stretch" style="width: 100%">
          <el-button type="primary" :icon="CircleCheck" @click="runCheck">执行校验（步骤 6）</el-button>
          <el-alert
            v-if="checkRun && store.lastValidationErrors.length === 0"
            type="success"
            :closable="false"
            title="校验通过：字段、资料完整性、重复客户均未发现问题。"
          />
          <el-alert v-if="checkRun && store.lastValidationErrors.length" type="error" :closable="false">
            <template #title>校验未通过</template>
            <ul class="err-ul">
              <li v-for="(e, i) in store.lastValidationErrors" :key="i">{{ e }}</li>
            </ul>
          </el-alert>
          <el-button
            type="success"
            :disabled="!checkRun || store.lastValidationErrors.length > 0"
            :icon="Upload"
            @click="onSubmitCaf"
          >
            提交 CAF 进入审核（步骤 7）
          </el-button>
        </el-space>
      </div>

      <!-- 提交后：审核与开通归档（步骤 8–10） -->
      <el-card v-if="store.cafId" shadow="never" class="outcome-card">
        <template #header>
          <span>CAF 编号：{{ store.cafId }}</span>
          <el-tag :type="statusTagType" style="margin-left: 12px">{{ statusText }}</el-tag>
        </template>
        <el-timeline v-if="store.workflowStatus !== 'editing'">
          <el-timeline-item
            :type="store.workflowStatus === 'pending_review' ? 'warning' : 'success'"
            timestamp="步骤 7"
            placement="top"
          >
            已提交审核队列（模拟）
          </el-timeline-item>
          <el-timeline-item :type="timelineType('approved')" timestamp="步骤 8" placement="top">
            <p>CRM / BSS：创建客户、账户与订购</p>
            <p v-if="store.postPhases.crm" class="ok-line">已完成（演示）：客户 ID SIM-{{ crmId }}，订单 ORD-{{ crmId }}</p>
          </el-timeline-item>
          <el-timeline-item :type="timelineType('provision')" timestamp="步骤 9" placement="top">
            <p>开通结果回写 CAF</p>
            <p v-if="store.postPhases.provision" class="ok-line">开通成功，外线施工单已派发（模拟）</p>
          </el-timeline-item>
          <el-timeline-item :type="timelineType('archive')" timestamp="步骤 10" placement="top">
            <p>CAF 与文档正式归档</p>
            <p v-if="store.postPhases.archive" class="ok-line">电子档案已封存，审计索引已生成（模拟）</p>
          </el-timeline-item>
        </el-timeline>

        <div v-if="store.workflowStatus === 'pending_review'" class="approve-actions">
          <el-button type="primary" :loading="runningFlow" @click="onApproveFlow">
            模拟审核通过并执行开通与归档（步骤 8–10）
          </el-button>
        </div>
        <div v-if="store.workflowStatus === 'archived'" class="approve-actions">
          <el-button @click="store.resetWizard(); checkRun = false">新建一单</el-button>
        </div>
      </el-card>

      <div class="step-actions">
        <el-button v-if="store.activeStep > 0 && !store.cafId" @click="prevStep">上一步</el-button>
        <el-button
          v-if="store.activeStep < 5 && !store.cafId"
          type="primary"
          @click="nextStep"
        >
          下一步
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CircleCheck, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadFiles } from 'element-plus'
import { useCafOnboardingStore } from '@/stores/cafOnboarding'
import { useCafTemplateStore } from '@/stores/cafTemplate'
import type { ProductCode } from '@/types/cafTemplate'

const store = useCafOnboardingStore()
const tplStore = useCafTemplateStore()

const checkRun = ref(false)
const runningFlow = ref(false)
const crmId = ref('')

const scenarioBusinessOptions = [
  { value: 'mobile' as const, label: '移动业务' },
  { value: 'broadband' as const, label: '宽带业务' },
  { value: 'enterprise_biz' as const, label: '企业业务' },
]

const channelLabel = computed(() => tplStore.channelOptions.find((c) => c.value === store.ONBOARDING_CHANNEL)?.label ?? '渠道伙伴')

const selectedTpl = computed(() => store.selectedTemplate)

/** 提交后仍停在第 6 步，进度条显示已全部走完 */
const stepActive = computed(() => (store.cafId ? 5 : store.activeStep))

const productLabel = (code: ProductCode) => tplStore.labelMaps.product[code] ?? code

const productOptionsForTemplate = computed(() => {
  const t = store.selectedTemplate
  if (!t) return [] as { value: ProductCode; label: string }[]
  return tplStore.productOptions.filter((p) => p.value === t.product)
})

const valueAddedOptions = computed(() => {
  const bt = store.businessType
  if (bt === 'mobile') {
    return [
      { value: 'vas_roaming', label: '国际漫游包' },
      { value: 'vas_cloud', label: '云盘 / 安全管家' },
    ]
  }
  if (bt === 'broadband') {
    return [
      { value: 'vas_static_ip', label: '静态 IP' },
      { value: 'vas_fttr', label: 'FTTR 全光组网' },
    ]
  }
  return [
    { value: 'vas_sla', label: 'SLA 保障' },
    { value: 'vas_soc', label: '安全运营服务' },
  ]
})

watch(
  () => store.businessType,
  () => {
    store.product.valueAdded = []
  },
)

watch([() => store.customerType, () => store.businessType], () => {
  const list = store.matchingTemplates
  if (list.length === 1) store.selectTemplate(list[0]!.id)
  else if (!list.some((t) => t.id === store.selectedTemplateId)) store.selectedTemplateId = ''
})

function onFilePick(code: string, fileList: UploadFiles) {
  const f = fileList[fileList.length - 1] as UploadFile | undefined
  const name = f?.name
  if (name) store.setUpload(code, name)
}

function runCheck() {
  store.runAllValidations()
  checkRun.value = true
  if (store.lastValidationErrors.length === 0) ElMessage.success('校验通过')
  else ElMessage.error('请先修正校验问题')
}

function onSubmitCaf() {
  if (!store.submitToReview()) {
    ElMessage.error(store.lastValidationErrors[0] ?? '提交失败')
    return
  }
  checkRun.value = true
  crmId.value = String(Math.floor(100000 + Math.random() * 900000))
  ElMessage.success('已提交审核（模拟）')
}

async function onApproveFlow() {
  runningFlow.value = true
  try {
    await store.simulateApproveProvisionArchive()
    ElMessage.success('开通与归档流程已完成（模拟）')
  } finally {
    runningFlow.value = false
  }
}

const statusText = computed(() => {
  const m: Record<string, string> = {
    editing: '编辑中',
    pending_review: '待审核',
    approved: '审核通过',
    crm_synced: 'CRM 已同步',
    provision_done: '已开通',
    archived: '已归档',
  }
  return m[store.workflowStatus] ?? store.workflowStatus
})

const statusTagType = computed(() => {
  if (store.workflowStatus === 'pending_review') return 'warning'
  if (store.workflowStatus === 'archived') return 'success'
  return 'info'
})

function timelineType(phase: 'approved' | 'provision' | 'archive') {
  if (phase === 'approved' && ['approved', 'crm_synced', 'provision_done', 'archived'].includes(store.workflowStatus))
    return 'success'
  if (phase === 'provision' && ['provision_done', 'archived'].includes(store.workflowStatus)) return 'success'
  if (phase === 'archive' && store.workflowStatus === 'archived') return 'success'
  return 'info'
}

function prevStep() {
  if (store.activeStep > 0) store.activeStep = (store.activeStep - 1) as 0 | 1 | 2 | 3 | 4 | 5
}

function nextStep() {
  if (store.activeStep === 0) {
    if (!store.customerType || !store.businessType) {
      ElMessage.warning('请选择客户类型与业务类型')
      return
    }
    if (store.matchingTemplates.length === 0) {
      ElMessage.error('无可用模板，请先在模板配置中维护')
      return
    }
  }
  if (store.activeStep === 1) {
    if (!store.selectedTemplateId) {
      ElMessage.warning('请选择一个 CAF 模板')
      return
    }
  }
  if (store.activeStep === 2) {
    const e = store.validateFields()
    if (e.length) {
      ElMessage.error(e[0]!)
      return
    }
  }
  if (store.activeStep === 3) {
    const e = store.validateProduct()
    if (e.length) {
      ElMessage.error(e[0]!)
      return
    }
  }
  if (store.activeStep === 4) {
    const e = store.validateDocuments()
    if (e.length) {
      ElMessage.error(e[0]!)
      return
    }
  }
  if (store.activeStep < 5) store.activeStep = (store.activeStep + 1) as 0 | 1 | 2 | 3 | 4 | 5
}
</script>

<style scoped>
.caf-onboarding {
  max-width: 960px;
}

.scenario-legend {
  margin-bottom: 16px;
}

.legend-title {
  font-weight: 600;
}

.legend-ol {
  margin: 8px 0 0 18px;
  padding: 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.step-card {
  margin-top: 8px;
}

.step-card :deep(.el-steps) {
  margin-bottom: 24px;
}

.channel-tag {
  margin-bottom: 16px;
}

.step-panel {
  min-height: 200px;
  padding-bottom: 8px;
}

.panel-title {
  font-size: 16px;
  margin-bottom: 16px;
  color: #303133;
}

.max-form {
  max-width: 640px;
}

.hint {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}

.template-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.tpl-card {
  cursor: pointer;
  transition: border-color 0.2s;
}

.tpl-card.is-active {
  border-color: #409eff;
}

.tpl-radio {
  width: 100%;
  align-items: flex-start;
  height: auto;
  white-space: normal;
}

.tpl-name {
  display: block;
  font-weight: 500;
}

.tpl-meta {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.doc-section {
  margin-top: 20px;
}

.doc-section h4 {
  font-size: 14px;
  margin-bottom: 8px;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.upload-label {
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-size: 13px;
  color: #67c23a;
}

.err-ul {
  margin: 8px 0 0 18px;
  padding: 0;
}

.step-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.outcome-card {
  margin-top: 20px;
  border: 1px solid #e4e7ed;
}

.ok-line {
  color: #67c23a;
  font-size: 13px;
  margin-top: 4px;
}

.approve-actions {
  margin-top: 12px;
}
</style>
