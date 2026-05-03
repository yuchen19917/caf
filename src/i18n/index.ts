import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "common": {
        "dashboard": "Dashboard",
        "applications": "Applications",
        "new_caf": "New CAF",
        "documents": "Documents",
        "templates": "Templates",
        "audit": "Audit Portal",
        "logout": "Terminate Session",
        "search": "Search...",
        "notifications": "Notifications",
        "language": "Language"
      },
      "dashboard": {
        "title": "Control Center",
        "welcome": "Welcome back, {{name}}",
        "pending": "Pending CAFs",
        "active": "Active Services",
        "revenue": "MTD Revenue",
        "security": "Security Score"
      },
      "login": {
        "title": "System Authentication",
        "subtitle": "Please enter your specialized credentials to access the central repository.",
        "identifier": "Access Identifier",
        "secret": "Secret Protocol",
        "authorize": "Authorize Portal",
        "reset": "Reset Token?"
      }
    }
  },
  zh: {
    translation: {
      "common": {
        "dashboard": "仪表板",
        "applications": "业务申请",
        "new_caf": "新业务受理",
        "documents": "文档库",
        "templates": "模板管理",
        "audit": "审核门户",
        "logout": "终止会话",
        "search": "搜索...",
        "notifications": "通知",
        "language": "语言切换"
      },
      "dashboard": {
        "title": "控制中心",
        "welcome": "欢迎回来，{{name}}",
        "pending": "待审核 CAF",
        "active": "活跃业务",
        "revenue": "本月收入",
        "security": "安全评分"
      },
      "login": {
        "title": "系统身份认证",
        "subtitle": "请输入您的专用凭据以访问中央存储库。",
        "identifier": "访问标识符",
        "secret": "安全协议",
        "authorize": "授权进入",
        "reset": "重置令牌？"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
