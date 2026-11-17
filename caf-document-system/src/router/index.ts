import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'customer/list',
          component: () => import('@/views/customer/CustomerListView.vue'),
        },
        {
          path: 'customer/onboard',
          component: () => import('@/views/customer/CustomerOnboardView.vue'),
        },
        {
          path: 'application/list',
          component: () => import('@/views/application/ApplicationListView.vue'),
        },
        {
          path: 'application/create',
          component: () => import('@/views/application/ApplicationCreateView.vue'),
        },
        {
          path: 'caf/templates',
          component: () => import('@/views/caf/CafTemplateManageView.vue'),
        },
        {
          path: 'caf/onboarding',
          component: () => import('@/views/caf/CafOnboardingWizardView.vue'),
        },
        {
          path: 'identity/list',
          component: () => import('@/views/identity/IdentityListView.vue'),
        },
        {
          path: 'identity/collect',
          component: () => import('@/views/identity/IdentityCollectView.vue'),
        },
        {
          path: 'document/list',
          component: () => import('@/views/document/DocumentListView.vue'),
        },
        {
          path: 'document/upload',
          component: () => import('@/views/document/DocumentUploadView.vue'),
        },
        {
          path: 'audit',
          component: () => import('@/views/AuditView.vue'),
        },
      ],
    },
  ],
})

export default router
