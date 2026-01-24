# AxisCloud

واجهة + API بسيطة لإدارة المستخدمين (JWT) مع نظام Uptime Monitors حسب الخطة (Free/Pro/Business).

## الجديد (آخر إضافات)
- **Frontend (React + TS + Vite + Tailwind)**
  - صفحات: Home / Login / Register / Forgot Password / Reset Password / Dashboard / Create Monitor.
  - ربط API جاهز عبر `VITE_API_URL`.
  - تخزين التوكن واليوزر والـplan في `localStorage`.
  - تحذيرات داخل صفحة إنشاء المونيتور بناءً على حدود الخطة (methods/interval/timeout/headers).
  - إدارة Webhooks:
    - تظهر فقط للمستخدمين بخطة `pro` أو `business`.
    - في صفحة التفاصيل: عرض الـ webhooks في وضع العرض (read-only).
    - في وضع التعديل (Edit): إضافة/تحديث field واحد، وحذف field من خلال زر سلة بجانب كل field، وحذف الكل.
  - حذف Monitor:
    - زر حذف داخل صفحة التفاصيل مع نافذة تأكيد داخل التصميم (Modal) وتحذير أن البيانات/الـlogs لن تُسترجع.
- **Backend (Node + TypeScript + Express + MongoDB)**
  - نظام مستخدمين: إنشاء حساب، تسجيل دخول، JWT.
  - Forgot Password: إنشاء كود/توكن وإرساله بالإيميل، التحقق منه، تحديث كلمة المرور.
  - Uptime Monitors: إنشاء Monitor مع التحقق من صلاحيات/حدود الخطة + التحقق من الهيدرز.
  - Endpoint لاختبار Uptime (`/testUpTime`).
  - Webhooks (pro/business فقط): إنشاء/تحديث field واحد عبر UpdateMontior + حذف field/حذف الكل عبر endpoints مخصصة.
  - Delete Monitor: endpoint لحذف المونيتور بعد التحقق من الملكية.

## هيكل المشروع
- `Backend/` : السيرفر والـAPI
- `Frontend/` : واجهة المستخدم

## التشغيل (Development)

### 1) Backend
1. ادخل على مجلد `Backend` وثبّت الحزم:
   ```bash
   npm install
   ```
2. جهّز ملف البيئة `Backend/.env` (مثال موجود عندك بالفعل) وتأكد من القيم الأساسية:
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `user_email` / `user_pass` (لإرسال رسائل إعادة تعيين كلمة المرور)
3. شغّل السيرفر:
   ```bash
   npm run dev
   ```
   الافتراضي حسب الإعدادات هو `http://localhost:3000`.

> ملاحظة: Backend dev يستخدم `tsx` لتشغيل TypeScript (متوافق مع Node 22).

### 2) Frontend
1. ادخل على `Frontend` وثبّت الحزم:
   ```bash
   npm install
   ```
2. تأكد من `Frontend/.env`:
   - `VITE_API_URL=http://localhost:3000`
3. شغّل الواجهة:
   ```bash
   npm run dev
   ```

## API Endpoints (Backend)
> ملاحظة: الـroutes متسجلة بدون prefix (يعني مباشرة على `/...`).

### Auth / Users
- `POST /CreateUser`
  - Body: `{ "username": string, "email": string, "password": string }`
- `POST /Login`
  - Body: `{ "email": string, "password": string }`
- `POST /CreateCode` (Forgot Password: إرسال كود/توكن)
  - Body: `{ "email": string }`
- `POST /CheckCode?token=...` (التحقق من صلاحية التوكن)
- `POST /UpdatePassword?token=...`
  - Body: `{ "password": string }`

### Uptime / Monitors
- `POST /CreateMontior`
  - Auth: `Authorization: Bearer <token>`
  - Body:
    ```json
    {
      "url": "https://example.com/health",
      "method": "GET",
      "requestTime": 5,
      "checkInterval": 10,
      "headers": {"Accept": "application/json"},
      "hooks": {"down": "https://hooks.slack.com/..."}
    }
    ```
- `GET /GetMontiors`
  - Auth: `Authorization: Bearer <token>`
  - Query (اختياري): `skip`, `sort`
- `GET /montior/:slug`
  - Auth: `Authorization: Bearer <token>`
  - Query (اختياري): `skip`, `sort`
  - Response يرجع:
    - `montior`
    - `logs`
    - `webHook` (اختياري) بالشكل: `{ hooks: Record<string, string> }`
- `PATCH /UpdateMontior/:montiorId`
  - Auth: `Authorization: Bearer <token>`
  - لتحديث webhook field واحد فقط: ارسل `hooks` كـ object يحتوي field واحد:
    ```json
    {
      "hooks": {"down": "https://hooks.slack.com/..."}
    }
    ```
- `DELETE /DeleteMontior/:montiorId`
  - Auth: `Authorization: Bearer <token>`
  - يحذف المونيتور بعد التحقق من الملكية.

### Webhooks (حذف Fields)
- `DELETE /deleteFeildWebHook/:serivceId`
  - Auth: `Authorization: Bearer <token>`
  - Body:
    ```json
    {"hookName": "down"}
    ```
- `DELETE /deleteAllFeildsWebHook/:serivceId`
  - Auth: `Authorization: Bearer <token>`

- `POST /testUpTime`
  - (موجود كـroute للاختبار)

## Notes
- الـFrontend بيقرأ الـplan من `localStorage` أو من payload بتاع الـJWT (لو موجود `plan`).
- صفحة إنشاء المونيتور بتعرض تحذيرات إذا إعداداتك خارج حدود الخطة، والـBackend بيعمل Validation نهائي قبل الإنشاء.
