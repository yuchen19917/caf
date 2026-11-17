<template>
  <el-container class="app-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="logo-area">
        <img src="/logo.svg" alt="AsiaInfo" class="logo-img" />
        <span v-if="!isCollapsed" class="logo-text">AsiaInfo</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        background-color="#1a1a2e"
        text-color="#c0c4cc"
        active-text-color="#409eff"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>概览仪表盘</template>
        </el-menu-item>

        <el-sub-menu index="customer">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>客户入网</span>
          </template>
          <el-menu-item index="/customer/list">客户列表</el-menu-item>
          <el-menu-item index="/customer/onboard">新客入网</el-menu-item>
          <el-menu-item index="/caf/onboarding">CAF 入网（全流程）</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="application">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>业务申请</span>
          </template>
          <el-menu-item index="/application/list">申请列表</el-menu-item>
          <el-menu-item index="/application/create">发起申请</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="caf">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>CAF 模板</span>
          </template>
          <el-menu-item index="/caf/templates">模板配置</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="identity">
          <template #title>
            <el-icon><IdCard /></el-icon>
            <span>实名资料</span>
          </template>
          <el-menu-item index="/identity/list">资料列表</el-menu-item>
          <el-menu-item index="/identity/collect">资料采集</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="document">
          <template #title>
            <el-icon><FolderOpened /></el-icon>
            <span>文档归档</span>
          </template>
          <el-menu-item index="/document/list">文档列表</el-menu-item>
          <el-menu-item index="/document/upload">上传归档</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/audit">
          <el-icon><Checked /></el-icon>
          <template #title>合规审计</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="app-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapsed = !isCollapsed">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentTitle">{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-badge :value="3" class="notice-badge">
            <el-icon size="18" style="cursor:pointer"><Bell /></el-icon>
          </el-badge>
          <el-divider direction="vertical" />
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="28" style="background:#409eff">A</el-avatar>
              <span class="username">管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 页面内容 -->
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const isCollapsed = ref(false)
const route = useRoute()

const activeMenu = computed(() => route.path)

const titleMap: Record<string, string> = {
  '/dashboard': '概览仪表盘',
  '/customer/list': '客户列表',
  '/customer/onboard': '新客入网',
  '/caf/onboarding': 'CAF 入网（全流程）',
  '/application/list': '申请列表',
  '/application/create': '发起申请',
  '/caf/templates': 'CAF 模板配置',
  '/identity/list': '资料列表',
  '/identity/collect': '资料采集',
  '/document/list': '文档列表',
  '/document/upload': '上传归档',
  '/audit': '合规审计',
}

const currentTitle = computed(() => titleMap[route.path] || '')
</script>

<style scoped>
.app-layout {
  height: 100vh;
}

.sidebar {
  background-color: #1a1a2e;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.logo-img {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
}

.main-container {
  flex: 1;
  overflow: hidden;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #e8eaec;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.collapse-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notice-badge {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}

.username {
  font-size: 14px;
}

.app-main {
  background: #f0f2f5;
  overflow-y: auto;
  padding: 20px;
}
</style>
