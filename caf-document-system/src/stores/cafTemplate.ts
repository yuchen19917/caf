import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  CafTemplate,
  CustomerTypeCode,
  BusinessTypeCode,
  ChannelCode,
  ProductCode,
  CafTemplateFormPayload,
} from '@/types/cafTemplate'

function nowIso() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export const useCafTemplateStore = defineStore('cafTemplate', () => {
  const templates = ref<CafTemplate[]>([
    {
      id: 'tpl-m1',
      code: 'CAF-PER-MOB-PAR-5G',
      name: '个人 · 移动业务 · Dealer · 5G 标准',
      customerType: 'personal',
      businessType: 'mobile',
      channel: 'partner',
      product: 'prd-mobile-5g-standard',
      version: '2026.2',
      enabled: true,
      remark: '个人首次办理移动业务（Dealer）',
      updatedAt: '2026-11-02 09:00:00',
      requiredDocuments: [
        { code: 'id_front', name: '证件正面（人像面）', mandatory: true },
        { code: 'id_back', name: '证件背面（国徽面）', mandatory: true },
        { code: 'face_photo', name: '现场人像照片', mandatory: true },
        { code: 'signature', name: '客户电子签名', mandatory: true },
        { code: 'sim_auth', name: '入网授权书（可选）', mandatory: false },
      ],
    },
    {
      id: 'tpl-b1',
      code: 'CAF-PER-BBD-PAR-H300',
      name: '个人 · 宽带业务 · Dealer · 家宽 300M',
      customerType: 'personal',
      businessType: 'broadband',
      channel: 'partner',
      product: 'prd-broadband-home-300m',
      version: '2026.2',
      enabled: true,
      updatedAt: '2026-11-02 09:00:00',
      requiredDocuments: [
        { code: 'id_front', name: '证件正面', mandatory: true },
        { code: 'id_back', name: '证件背面', mandatory: true },
        { code: 'install_address', name: '安装地址证明（房产 / 租赁）', mandatory: true },
        { code: 'signature', name: '业务受理签名', mandatory: true },
      ],
    },
    {
      id: 'tpl-e1',
      code: 'CAF-ENT-EBZ-PAR-BDL',
      name: '企业 · 企业业务 · Dealer · 融合套餐',
      customerType: 'enterprise',
      businessType: 'enterprise_biz',
      channel: 'partner',
      product: 'prd-enterprise-bundle-line',
      version: '2026.2',
      enabled: true,
      updatedAt: '2026-11-02 09:00:00',
      requiredDocuments: [
        { code: 'biz_license', name: '营业执照', mandatory: true },
        { code: 'legal_id_front', name: '法人证件正面', mandatory: true },
        { code: 'legal_id_back', name: '法人证件背面', mandatory: true },
        { code: 'auth_letter', name: '办理授权书', mandatory: true },
        { code: 'signature', name: '公章 / 电子签章扫描件', mandatory: true },
      ],
    },
    {
      id: 'tpl-001',
      code: 'CAF-ENT-LSD-PRT-DED',
      name: '大型企业 · 专线 · 门户 · 标准专线',
      customerType: 'enterprise',
      businessType: 'leased',
      channel: 'portal',
      product: 'prd-dedicated-standard',
      version: '2026.1',
      enabled: true,
      remark: '默认门户大型企业专线 CAF',
      updatedAt: '2026-11-01 10:20:00',
    },
    {
      id: 'tpl-002',
      code: 'CAF-SMB-CLO-PAR-CB',
      name: 'SMB · 云专网 · 渠道伙伴 · 云专网基础',
      customerType: 'smb',
      businessType: 'cloud',
      channel: 'partner',
      product: 'prd-cloud-basic',
      version: '2026.1',
      enabled: true,
      updatedAt: '2026-10-28 14:05:00',
    },
    {
      id: 'tpl-003',
      code: 'CAF-GOV-MPL-OPS-MS',
      name: '政务 · MPLS · 线下运营 · 标准 MPLS',
      customerType: 'government',
      businessType: 'mpls',
      channel: 'ops',
      product: 'prd-mpls-standard',
      version: '2025.4',
      enabled: false,
      remark: '旧版，待下线',
      updatedAt: '2026-09-15 09:00:00',
    },
  ])

  const customerTypeOptions: { value: CustomerTypeCode; label: string }[] = [
    { value: 'enterprise', label: '大型企业' },
    { value: 'smb', label: '中小企业' },
    { value: 'government', label: '政务机关' },
    { value: 'financial', label: '金融机构' },
    { value: 'personal', label: '个人 / 工作室' },
  ]

  const businessTypeOptions: { value: BusinessTypeCode; label: string }[] = [
    { value: 'mobile', label: '移动业务' },
    { value: 'broadband', label: '宽带业务' },
    { value: 'enterprise_biz', label: '企业业务' },
    { value: 'leased', label: '专线接入' },
    { value: 'cloud', label: '云专网' },
    { value: 'mpls', label: 'MPLS VPN' },
    { value: 'internet', label: '互联网接入' },
    { value: 'idc', label: 'IDC / 托管' },
    { value: 'sdwan', label: 'SD-WAN' },
  ]

  const channelOptions: { value: ChannelCode; label: string }[] = [
    { value: 'portal', label: '客户门户' },
    { value: 'partner', label: '渠道伙伴' },
    { value: 'sales', label: '客户经理' },
    { value: 'ops', label: '线下运营' },
    { value: 'api', label: '开放 API' },
  ]

  const productOptions: { value: ProductCode; label: string }[] = [
    { value: 'prd-mobile-5g-standard', label: '5G 套餐 · 标准版' },
    { value: 'prd-mobile-5g-premium', label: '5G 套餐 · 尊享版' },
    { value: 'prd-broadband-home-300m', label: '家宽 · 300M' },
    { value: 'prd-broadband-biz-500m', label: '企宽 · 500M' },
    { value: 'prd-enterprise-bundle-line', label: '企业融合 · 专线 + 移网' },
    { value: 'prd-dedicated-standard', label: '标准专线' },
    { value: 'prd-dedicated-premium', label: '尊享专线' },
    { value: 'prd-cloud-basic', label: '云专网 · 基础版' },
    { value: 'prd-cloud-enterprise', label: '云专网 · 企业版' },
    { value: 'prd-mpls-standard', label: 'MPLS · 标准' },
    { value: 'prd-internet-biz', label: '互联网 · 商务宽带' },
    { value: 'prd-sdwan-edge', label: 'SD-WAN · 边缘套件' },
  ]

  const labelMaps = computed(() => ({
    customerType: Object.fromEntries(customerTypeOptions.map((o) => [o.value, o.label])) as Record<
      CustomerTypeCode,
      string
    >,
    businessType: Object.fromEntries(businessTypeOptions.map((o) => [o.value, o.label])) as Record<
      BusinessTypeCode,
      string
    >,
    channel: Object.fromEntries(channelOptions.map((o) => [o.value, o.label])) as Record<ChannelCode, string>,
    product: Object.fromEntries(productOptions.map((o) => [o.value, o.label])) as Record<ProductCode, string>,
  }))

  function addTemplate(payload: CafTemplateFormPayload) {
    const id = `tpl-${Date.now()}`
    templates.value.unshift({
      id,
      ...payload,
      updatedAt: nowIso(),
    })
  }

  function updateTemplate(id: string, payload: CafTemplateFormPayload) {
    const i = templates.value.findIndex((t) => t.id === id)
    if (i === -1) return
    const prev = templates.value[i]!
    templates.value[i] = {
      ...prev,
      id: prev.id,
      ...payload,
      updatedAt: nowIso(),
    }
  }

  function removeTemplate(id: string) {
    templates.value = templates.value.filter((t) => t.id !== id)
  }

  function toggleEnabled(id: string, enabled: boolean) {
    const t = templates.value.find((x) => x.id === id)
    if (t) {
      t.enabled = enabled
      t.updatedAt = nowIso()
    }
  }

  /** 同一「客户类型 + 业务 + 渠道 + 产品」仅允许一条启用模板（可选校验） */
  function hasDuplicateScope(
    scope: Pick<CafTemplate, 'customerType' | 'businessType' | 'channel' | 'product'>,
    excludeId?: string,
  ) {
    return templates.value.some(
      (t) =>
        t.enabled &&
        t.id !== excludeId &&
        t.customerType === scope.customerType &&
        t.businessType === scope.businessType &&
        t.channel === scope.channel &&
        t.product === scope.product,
    )
  }

  /** 入网向导：按客户类型 + 业务类型 + 受理渠道筛选可用模板（如 Dealer=partner） */
  function listTemplatesForSelection(
    customerType: CustomerTypeCode,
    businessType: BusinessTypeCode,
    channel: ChannelCode,
  ) {
    return templates.value.filter(
      (t) => t.enabled && t.customerType === customerType && t.businessType === businessType && t.channel === channel,
    )
  }

  return {
    templates,
    customerTypeOptions,
    businessTypeOptions,
    channelOptions,
    productOptions,
    labelMaps,
    addTemplate,
    updateTemplate,
    removeTemplate,
    toggleEnabled,
    hasDuplicateScope,
    listTemplatesForSelection,
  }
})
