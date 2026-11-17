export const systemPages = {
  overview: 'system_overview',
  business: 'system_business',
  access: 'system_access',
  infrastructure: 'system_infrastructure',
} as const;

export type SystemPage = keyof typeof systemPages;
