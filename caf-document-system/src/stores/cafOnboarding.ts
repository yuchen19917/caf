import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCafTemplateStore } from '@/stores/cafTemplate'
import type { CafTemplate, ChannelCode, CustomerTypeCode, BusinessTypeCode, ProductCode } from '@/types/cafTemplate'

/** 向导内固定为 Dealer 受理，对应渠道 partner */
export const ONBOARDING_CHANNEL: ChannelCode = 'partner'

export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5

export type CafWorkflowStatus =
  | 'editing'
  | 'pending_review'
  | 'approved'
  | 'crm_synced'
  | 'provision_done'
  | 'archived'

export interface OnboardingCustomerForm {
  /** 个人姓名 / 企业经办人 */
  holderName: string
  phone: string
  email: string
  /** 装机 / 邮寄 / 账单地址 */
  address: string
  idType: 'id_card' | 'passport' | 'hk_mo_pass'
  idNumber: string
  /** 企业客户 */
  companyName: string
  creditCode: string
}

export interface OnboardingProductForm {
  /** 与模板产品一致，可换同模板下展示用 */
  productCode: ProductCode | ''
  packageName: string
  valueAdded: string[]
  contractMonths: number
}

const DUPLICATE_PHONE = '13800138000'
const DUPLICATE_ID = '110101199001011234'

function genCafId() {
  const d = new Date()
  const p = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const r = Math.floor(1000 + Math.random() * 9000)
  return `CAF-${p}-${r}`
}

function isPhoneCn(v: string) {
  return /^1[3-9]\d{9}$/.test(v.trim())
}

function isIdCard18(v: string) {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(v.trim())
}

export const useCafOnboardingStore = defineStore('cafOnboarding', () => {
  const templateStore = useCafTemplateStore()

  const activeStep = ref<OnboardingStep>(0)
  const customerType = ref<CustomerTypeCode | ''>('')
  const businessType = ref<BusinessTypeCode | ''>('')
  const selectedTemplateId = ref('')

  const customer = ref<OnboardingCustomerForm>({
    holderName: '',
    phone: '',
    email: '',
    address: '',
    idType: 'id_card',
    idNumber: '',
    companyName: '',
    creditCode: '',
  })

  const product = ref<OnboardingProductForm>({
    productCode: '',
    packageName: '',
    valueAdded: [],
    contractMonths: 24,
  })

  /** 资料项 code -> 已选文件名 */
  const uploads = ref<Record<string, string>>({})

  const cafId = ref<string | null>(null)
  const workflowStatus = ref<CafWorkflowStatus>('editing')
  const lastValidationErrors = ref<string[]>([])

  const postPhases = ref({
    crm: false,
    provision: false,
    archive: false,
  })

  const matchingTemplates = computed(() => {
    if (!customerType.value || !businessType.value) return [] as CafTemplate[]
    return templateStore.listTemplatesForSelection(customerType.value, businessType.value, ONBOARDING_CHANNEL)
  })

  const selectedTemplate = computed(() =>
    templateStore.templates.find((t) => t.id === selectedTemplateId.value),
  )

  const requiredDocs = computed(() => selectedTemplate.value?.requiredDocuments ?? [])

  function resetWizard() {
    activeStep.value = 0
    customerType.value = ''
    businessType.value = ''
    selectedTemplateId.value = ''
    customer.value = {
      holderName: '',
      phone: '',
      email: '',
      address: '',
      idType: 'id_card',
      idNumber: '',
      companyName: '',
      creditCode: '',
    }
    product.value = {
      productCode: '',
      packageName: '',
      valueAdded: [],
      contractMonths: 24,
    }
    uploads.value = {}
    cafId.value = null
    workflowStatus.value = 'editing'
    lastValidationErrors.value = []
    postPhases.value = { crm: false, provision: false, archive: false }
  }

  function selectTemplate(id: string) {
    selectedTemplateId.value = id
    const tpl = templateStore.templates.find((t) => t.id === id)
    if (tpl) {
      product.value.productCode = tpl.product
      const maps = templateStore.labelMaps
      product.value.packageName = maps.product[tpl.product] ?? tpl.name
    }
    uploads.value = {}
  }

  function setUpload(docCode: string, fileName: string | null) {
    if (!fileName) {
      const next = { ...uploads.value }
      delete next[docCode]
      uploads.value = next
    } else {
      uploads.value = { ...uploads.value, [docCode]: fileName }
    }
  }

  function validateFields(): string[] {
    const err: string[] = []
    const c = customer.value
    if (!c.holderName?.trim()) err.push('请填写客户 / 经办人姓名')
    if (!isPhoneCn(c.phone)) err.push('请输入有效的 11 位手机号码')
    if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) err.push('邮箱格式不正确')
    if (!c.address?.trim()) err.push('请填写地址（装机或通讯地址）')
    if (!c.idNumber?.trim()) err.push('请填写证件号码')
    if (c.idType === 'id_card' && !isIdCard18(c.idNumber)) err.push('身份证号码格式不正确（18 位）')

    if (customerType.value === 'enterprise') {
      if (!c.companyName?.trim()) err.push('请填写企业名称')
      const cc = (c.creditCode || '').trim().toUpperCase()
      if (!/^[0-9A-HJ-NPQRTUWXY]{18}$/.test(cc)) err.push('统一社会信用代码须为 18 位合法字符')
    }

    if (c.phone.trim() === DUPLICATE_PHONE) err.push('重复客户校验：该手机号已在网，请勿重复开户')
    if (c.idNumber.trim() === DUPLICATE_ID) err.push('重复客户校验：该证件号已存在客户记录')

    return err
  }

  function validateDocuments(): string[] {
    const err: string[] = []
    for (const d of requiredDocs.value) {
      if (d.mandatory && !uploads.value[d.code]) err.push(`必传资料未上传：${d.name}`)
    }
    return err
  }

  function validateProduct(): string[] {
    const err: string[] = []
    if (!product.value.productCode) err.push('请选择或确认产品与套餐')
    if (!product.value.contractMonths || product.value.contractMonths < 1) err.push('请选择合约期限')
    return err
  }

  /** 步骤 6：字段 + 资料完整性 + 重复客户 */
  function runAllValidations(): boolean {
    const a = validateFields()
    const b = validateProduct()
    const c = validateDocuments()
    lastValidationErrors.value = [...a, ...b, ...c]
    return lastValidationErrors.value.length === 0
  }

  function submitToReview() {
    if (!selectedTemplate.value) {
      lastValidationErrors.value = ['未选择 CAF 模板']
      return false
    }
    if (!runAllValidations()) return false
    cafId.value = genCafId()
    workflowStatus.value = 'pending_review'
    return true
  }

  async function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
  }

  /** 步骤 8–10：审核通过后 CRM/BSS、开通回写、归档（前端模拟） */
  async function simulateApproveProvisionArchive() {
    if (workflowStatus.value !== 'pending_review') return
    workflowStatus.value = 'approved'
    await delay(900)
    postPhases.value.crm = true
    workflowStatus.value = 'crm_synced'
    await delay(1100)
    postPhases.value.provision = true
    workflowStatus.value = 'provision_done'
    await delay(900)
    postPhases.value.archive = true
    workflowStatus.value = 'archived'
  }

  return {
    ONBOARDING_CHANNEL,
    activeStep,
    customerType,
    businessType,
    selectedTemplateId,
    customer,
    product,
    uploads,
    cafId,
    workflowStatus,
    lastValidationErrors,
    postPhases,
    matchingTemplates,
    selectedTemplate,
    requiredDocs,
    resetWizard,
    selectTemplate,
    setUpload,
    validateFields,
    validateDocuments,
    validateProduct,
    runAllValidations,
    submitToReview,
    simulateApproveProvisionArchive,
    DUPLICATE_PHONE,
    DUPLICATE_ID,
  }
})
