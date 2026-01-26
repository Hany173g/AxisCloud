export type Language = 'ar' | 'en'

export interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

export const translations = {
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.monitors': 'المراقبين',
    'nav.new_monitor': 'مراقب جديد',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'nav.logout': 'تسجيل الخروج',
    'nav.upgrade': 'ترقية الخطة',
    
    // HomePage
    'home.title': 'راقب خدمتك من أي مكان في العالم',
    'home.subtitle': 'منصة مراقبة الأداء المتقدمة. احصل على تنبيهات فورية، تقارير مفصلة، وضمان استمرارية عمل خدماتك 24/7.',
    'home.start_free': 'ابدأ مجاناً',
    'home.login': 'تسجيل الدخول',
    'home.dashboard': 'لوحة التحكم',
    'home.add_monitor': 'إضافة مراقب جديد',
    'home.monitors': 'المراقبين',
    
    'home.feature_247': 'مراقبة 24/7',
    'home.feature_247_desc': 'فحص مستمر لخدماتك حول العالم',
    'home.feature_alerts': 'تنبيهات فورية',
    'home.feature_alerts_desc': 'إشعارات فورية عبر البريد والويب هوك',
    'home.feature_reports': 'تقارير مفصلة',
    'home.feature_reports_desc': 'تحليلات الأداء وتاريخ الأعطال',
    
    'home.total_checks': 'إجمالي الفحوصات',
    'home.total_checks_desc': 'فحوصات المراقبة المخزنة على المنصة',
    'home.total_monitors': 'إجمالي المراقبين',
    'home.total_monitors_desc': 'المراقبون النشطون وغير النشطين',
    
    'home.performance_checks': 'فحوصات الأداء',
    'home.performance_checks_desc': 'مراقبة مستمرة للنقاط الطرفية وتتبع وقت الاستجابة والتوفر',
    'home.alerts_notifications': 'تنبيهات وإشعارات',
    'home.alerts_notifications_desc': 'احصل على إشعارات فورية عند انقطاع الخدمة عبر البريد والويب هوك',
    'home.logs_reports': 'السجلات والتقارير',
    'home.logs_reports_desc': 'تصفح سجلات المراقبة وتاريخ الحالة لتشخيص المشاكل والتحقق من التعافي',
    
    'home.ready_to_start': 'هل أنت مستعد للبدء؟',
    'home.ready_to_start_logged': 'تابع من لوحة التحكم الخاصة بك',
    'home.ready_to_start_guest': 'سجل الدخول أو أنشئ حساب جديد',
    'home.new_monitor_btn': 'مراقب جديد',
    
    // Banner
    'banner.beta': 'BETA',
    'banner.beta_text': 'نسخة تجريبية - الحساب الحالي: Business Plan',
    'banner.need_help': 'تواجه مشكلة؟',
    'banner.join_community': 'انضم لمجتمعنا',
    
    // General
    'loading': 'جاري التحميل...',
    'error': 'خطأ',
    'success': 'نجح',
    'cancel': 'إلغاء',
    'save': 'حفظ',
    'delete': 'حذف',
    'edit': 'تعديل',
    'view': 'عرض',
    'back': 'رجوع',
    'next': 'التالي',
    'previous': 'السابق',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.monitors': 'Monitors',
    'nav.new_monitor': 'New Monitor',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.upgrade': 'Upgrade',
    
    // HomePage
    'home.title': 'Monitor your service from anywhere in the world',
    'home.subtitle': 'Advanced performance monitoring platform. Get instant alerts, detailed reports, and ensure 24/7 service continuity.',
    'home.start_free': 'Start Free',
    'home.login': 'Login',
    'home.dashboard': 'Dashboard',
    'home.add_monitor': 'Add New Monitor',
    'home.monitors': 'Monitors',
    
    'home.feature_247': '24/7 Monitoring',
    'home.feature_247_desc': 'Continuous monitoring of your services worldwide',
    'home.feature_alerts': 'Instant Alerts',
    'home.feature_alerts_desc': 'Instant notifications via email and webhooks',
    'home.feature_reports': 'Detailed Reports',
    'home.feature_reports_desc': 'Performance analytics and downtime history',
    
    'home.total_checks': 'Total Checks',
    'home.total_checks_desc': 'Monitor checks stored across the platform',
    'home.total_monitors': 'Total Monitors',
    'home.total_monitors_desc': 'Active and inactive monitors',
    
    'home.performance_checks': 'Performance Checks',
    'home.performance_checks_desc': 'Continuous endpoint monitoring and response time tracking',
    'home.alerts_notifications': 'Alerts & Notifications',
    'home.alerts_notifications_desc': 'Get instant notifications when service goes down via email and webhooks',
    'home.logs_reports': 'Logs & Reports',
    'home.logs_reports_desc': 'Browse monitor logs and status history to debug issues and verify recovery',
    
    'home.ready_to_start': 'Ready to get started?',
    'home.ready_to_start_logged': 'Continue from your dashboard',
    'home.ready_to_start_guest': 'Sign in or create a new account',
    'home.new_monitor_btn': 'New Monitor',
    
    // Banner
    'banner.beta': 'BETA',
    'banner.beta_text': 'Beta Version - Current Plan: Business Plan',
    'banner.need_help': 'Need help?',
    'banner.join_community': 'Join our community',
    
    // General
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'view': 'View',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
  }
}
