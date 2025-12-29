# Axis Cloud

## المقدمة
Axis Cloud هو مشروع أساسي لإدارة المستخدمين مع نظام مصادقة بسيط.

## المميزات المتوفرة

### نظام المستخدمين
- تسجيل مستخدم جديد
- تسجيل الدخول للمستخدمين المسجلين
- تشفير كلمات المرور باستخدام bcrypt
- إنشاء رموز وصول (JWT) للمصادقة

### الأمان
- حماية كلمات المرور باستخدام التشفير
- مصادقة باستخدام JWT
- تحقق من صحة البيانات المدخلة

## التقنيات المستخدمة
- Node.js
- TypeScript
- Express.js
- MongoDB مع Mongoose
- JWT للمصادقة
- bcrypt لتشفير كلمات المرور

## هيكل المشروع
```
src/
├── config/        # إعدادات التطبيق
├── contoller/     # المتحكمات
│   ├── User.ts    # متحكمات المستخدمين
│   └── ...
├── models/        # نماذج البيانات
│   └── User.ts    # نموذج المستخدم
├── routes/        # مسارات API
└── utils/         # أدوات مساعدة
```

## خطوات التشغيل

1. تأكد من تثبيت Node.js و MongoDB على جهازك
2. استنسخ المشروع
```bash
git clone https://github.com/Hany173g/AxisCloud.git
```

3. قم بتثبيت الحزم المطلوبة
```bash
npm install
```

4. قم بإنشاء ملف `.env` وأضف المتغيرات التالية:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
user_email=your_gmail_address
user_pass=your_gmail_app_password
```

5. قم بتشغيل خادم التطوير
```bash
npm run dev
```

## نقاط النهاية المتاحة

### POST /CreateUser
تسجيل مستخدم جديد

**المعطيات المطلوبة:**
- username: اسم المستخدم
- email: البريد الإلكتروني
- password: كلمة المرور

### POST /Login
تسجيل الدخول

**المعطيات المطلوبة:**
- email: البريد الإلكتروني
- password: كلمة المرور

### POST /CreateCode
Forget Password (طلب كود إعادة تعيين كلمة المرور وإرساله على الإيميل)

**المعطيات المطلوبة:**
- email: البريد الإلكتروني

### POST /CheckCode?token=...
Forget Password (التحقق من صلاحية الكود)

**Query Params:**
- token: كود/توكن إعادة التعيين

### POST /UpdatePassword?token=...
Forget Password (تغيير كلمة المرور)

**Query Params:**
- token: كود/توكن إعادة التعيين

**Body:**
- password: كلمة المرور الجديدة