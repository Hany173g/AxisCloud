import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Language, LanguageContextType } from '../lib/language'

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from localStorage or default to 'ar'
    const saved = localStorage.getItem('language')
    return (saved as Language) || 'ar'
  })

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      ar: {
        // Navigation
        'nav.dashboard': 'لوحة التحكم',
        'nav.monitors': 'المراقبين',
        'nav.new_monitor': 'مراقب جديد',
        'nav.login': 'تسجيل الدخول',
        'nav.register': 'إنشاء حساب',
        'nav.logout': 'تسجيل الخروج',
        'nav.upgrade': 'ترقية الخطة',
        'nav.home': 'الرئيسية',
        'nav.all_monitors': 'كل المراقبين',
        
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
        
        // Auth Pages
        'auth.login_title': 'تسجيل الدخول',
        'auth.login_subtitle': 'أهلاً بعودتك',
        'auth.register_title': 'إنشاء حساب جديد',
        'auth.register_subtitle': 'ابدأ مراقبة خدماتك اليوم',
        'auth.email': 'البريد الإلكتروني',
        'auth.password': 'كلمة المرور',
        'auth.confirm_password': 'تأكيد كلمة المرور',
        'auth.remember_me': 'تذكرني',
        'auth.forgot_password': 'نسيت كلمة المرور؟',
        'auth.login_btn': 'تسجيل الدخول',
        'auth.register_btn': 'إنشاء حساب',
        'auth.no_account': 'ليس لديك حساب؟',
        'auth.have_account': 'لديك حساب بالفعل؟',
        'auth.sign_in_here': 'سجل دخولك هنا',
        'auth.sign_up_here': 'أنشئ حساب هنا',
        
        // Dashboard
        'dashboard.title': 'لوحة التحكم',
        'dashboard.overview': 'نظرة عامة',
        'dashboard.recent_checks': 'الفحوصات الأخيرة',
        'dashboard.status': 'الحالة',
        'dashboard.response_time': 'وقت الاستجابة',
        'dashboard.last_check': 'آخر فحص',
        'dashboard.no_monitors': 'لا يوجد مراقبين',
        'dashboard.create_first': 'إنشاء أول مراقب',
        
        // Monitors
        'monitors.title': 'المراقبين',
        'monitors.create_new': 'إنشاء مراقب جديد',
        'monitors.name': 'اسم المراقب',
        'monitors.url': 'الرابط',
        'monitors.method': 'الطريقة',
        'monitors.interval': 'الفاصل الزمني',
        'monitors.timeout': 'مهلة الانتظار',
        'monitors.headers': 'الرؤوس',
        'monitors.body': 'الجسم',
        'monitors.active': 'نشط',
        'monitors.inactive': 'غير نشط',
        'monitors.create_btn': 'إنشاء مراقب',
        'monitors.save_btn': 'حفظ',
        'monitors.cancel_btn': 'إلغاء',
        'monitors.delete_btn': 'حذف',
        'monitors.edit_btn': 'تعديل',
        'monitors.view_btn': 'عرض',
        'monitors.delete_confirm': 'هل أنت متأكد من حذف هذا المراقب؟',
        
        // Monitor Details
        'monitor_details.title': 'تفاصيل المراقب',
        'monitor_details.overview': 'نظرة عامة',
        'monitor_details.logs': 'السجلات',
        'monitor_details.settings': 'الإعدادات',
        'monitor_details.webhook_url': 'رابط الويب هوك',
        'monitor_details.copy_webhook': 'نسخ الرابط',
        'monitor_details.webhook_copied': 'تم نسخ الرابط',
        'monitor_details.no_logs': 'لا توجد سجلات',
        'monitor_details.loading_logs': 'جاري تحميل السجلات...',
        
        // Plans/Payment
        'plans.title': 'الخطط',
        'plans.current_plan': 'خطتك الحالية',
        'plans.upgrade': 'ترقية الخطط',
        'plans.free': 'مجاني',
        'plans.pro': 'احترافي',
        'plans.business': 'تجاري',
        'plans.monthly': 'شهرياً',
        'plans.yearly': 'سنوياً',
        'plans.features': 'المميزات',
        'plans.unlimited_monitors': 'مراقبون غير محدودين',
        'plans.unlimited_alerts': 'تنبيهات غير محدودة',
        'plans.webhook_support': 'دعم الويب هوك',
        'plans.priority_support': 'دعم أولوي',
        'plans.choose_plan': 'اختر خطتك',
        'plans.upgrade_btn': 'ترقية الآن',
        'plans.current': 'الخطة الحالية',
        
        // Payment
        'payment.success': 'تم الدفع بنجاح',
        'payment.cancelled': 'تم إلغاء الدفع',
        'payment.processing': 'جاري معالجة الدفع...',
        'payment.error': 'حدث خطأ في الدفع',
        
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
        'close': 'إغلاق',
        'submit': 'إرسال',
        'search': 'بحث',
        'filter': 'تصفية',
        'refresh': 'تحديث',
        'copy': 'نسخ',
        'copied': 'تم النسخ',
        'yes': 'نعم',
        'no': 'لا',
        'ok': 'موافق',
        'required': 'مطلوب',
        'optional': 'اختياري',
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
        'nav.home': 'Home',
        'nav.all_monitors': 'All Monitors',
        
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
        
        // Auth Pages
        'auth.login_title': 'Sign In',
        'auth.login_subtitle': 'Welcome back',
        'auth.register_title': 'Create Account',
        'auth.register_subtitle': 'Start monitoring your services today',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirm_password': 'Confirm Password',
        'auth.remember_me': 'Remember me',
        'auth.forgot_password': 'Forgot password?',
        'auth.login_btn': 'Sign In',
        'auth.register_btn': 'Create Account',
        'auth.no_account': "Don't have an account?",
        'auth.have_account': 'Already have an account?',
        'auth.sign_in_here': 'Sign in here',
        'auth.sign_up_here': 'Sign up here',
        
        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.overview': 'Overview',
        'dashboard.recent_checks': 'Recent Checks',
        'dashboard.status': 'Status',
        'dashboard.response_time': 'Response Time',
        'dashboard.last_check': 'Last Check',
        'dashboard.no_monitors': 'No monitors yet',
        'dashboard.create_first': 'Create your first monitor',
        
        // Monitors
        'monitors.title': 'Monitors',
        'monitors.create_new': 'Create New Monitor',
        'monitors.name': 'Monitor Name',
        'monitors.url': 'URL',
        'monitors.method': 'Method',
        'monitors.interval': 'Interval',
        'monitors.timeout': 'Timeout',
        'monitors.headers': 'Headers',
        'monitors.body': 'Body',
        'monitors.active': 'Active',
        'monitors.inactive': 'Inactive',
        'monitors.create_btn': 'Create Monitor',
        'monitors.save_btn': 'Save',
        'monitors.cancel_btn': 'Cancel',
        'monitors.delete_btn': 'Delete',
        'monitors.edit_btn': 'Edit',
        'monitors.view_btn': 'View',
        'monitors.delete_confirm': 'Are you sure you want to delete this monitor?',
        
        // Monitor Details
        'monitor_details.title': 'Monitor Details',
        'monitor_details.overview': 'Overview',
        'monitor_details.logs': 'Logs',
        'monitor_details.settings': 'Settings',
        'monitor_details.webhook_url': 'Webhook URL',
        'monitor_details.copy_webhook': 'Copy URL',
        'monitor_details.webhook_copied': 'URL copied',
        'monitor_details.no_logs': 'No logs available',
        'monitor_details.loading_logs': 'Loading logs...',
        
        // Plans/Payment
        'plans.title': 'Plans',
        'plans.current_plan': 'Your Current Plan',
        'plans.upgrade': 'Upgrade Plans',
        'plans.free': 'Free',
        'plans.pro': 'Pro',
        'plans.business': 'Business',
        'plans.monthly': 'Monthly',
        'plans.yearly': 'Yearly',
        'plans.features': 'Features',
        'plans.unlimited_monitors': 'Unlimited Monitors',
        'plans.unlimited_alerts': 'Unlimited Alerts',
        'plans.webhook_support': 'Webhook Support',
        'plans.priority_support': 'Priority Support',
        'plans.choose_plan': 'Choose Your Plan',
        'plans.upgrade_btn': 'Upgrade Now',
        'plans.current': 'Current',
        
        // Payment
        'payment.success': 'Payment Successful',
        'payment.cancelled': 'Payment Cancelled',
        'payment.processing': 'Processing payment...',
        'payment.error': 'Payment Error',
        
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
        'close': 'Close',
        'submit': 'Submit',
        'search': 'Search',
        'filter': 'Filter',
        'refresh': 'Refresh',
        'copy': 'Copy',
        'copied': 'Copied',
        'yes': 'Yes',
        'no': 'No',
        'ok': 'OK',
        'required': 'Required',
        'optional': 'Optional',
      }
    }
    
    return translations[language]?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
