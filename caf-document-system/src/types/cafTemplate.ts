/** 客户类型 */
export type CustomerTypeCode = 'enterprise' | 'smb' | 'government' | 'financial' | 'personal'

/** 业务类型（与业务申请维度对齐；含移动 / 宽带 / 企业类公众与企业业务） */
export type BusinessTypeCode =
  | 'leased'
  | 'cloud'
  | 'mpls'
  | 'internet'
  | 'idc'
  | 'sdwan'
  | 'mobile'
  | 'broadband'
  | 'enterprise_biz'

/** 受理渠道 */
export type ChannelCode = 'portal' | 'partner' | 'sales' | 'ops' | 'api'

/** 产品线 / 套餐标识 */
export type ProductCode =
  | 'prd-dedicated-standard'
  | 'prd-dedicated-premium'
  | 'prd-cloud-basic'
  | 'prd-cloud-enterprise'
  | 'prd-mpls-standard'
  | 'prd-internet-biz'
  | 'prd-sdwan-edge'
  | 'prd-mobile-5g-standard'
  | 'prd-mobile-5g-premium'
  | 'prd-broadband-home-300m'
  | 'prd-broadband-biz-500m'
  | 'prd-enterprise-bundle-line'

/** 必传资料项（由模板驱动清单） */
export interface CafRequiredDocument {
  code: string
  name: string
  mandatory: boolean
}

export interface CafTemplate {
  id: string
  /** 模板编码，唯一 */
  code: string
  /** 展示名称 */
  name: string
  customerType: CustomerTypeCode
  businessType: BusinessTypeCode
  channel: ChannelCode
  product: ProductCode
  version: string
  /** 是否启用：命中该维度组合时使用 */
  enabled: boolean
  remark?: string
  updatedAt: string
  /** 该模板要求的归档资料（证件、照片、签名、授权等） */
  requiredDocuments?: CafRequiredDocument[]
}

export interface CafTemplateFormPayload {
  code: string
  name: string
  customerType: CustomerTypeCode
  businessType: BusinessTypeCode
  channel: ChannelCode
  product: ProductCode
  version: string
  enabled: boolean
  remark?: string
}
