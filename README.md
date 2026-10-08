# Archai Showcase
موقع استعراض مشاريع + لوحة تحكم + إحصائيات — HTML/CSS/JS (ES Modules) + Supabase، بدون Build.

## أين أضع بيانات Supabase؟
في ملف **`js/config.js`** فقط:
- `SUPABASE_URL` ← Project Settings → API → Project URL
- `SUPABASE_KEY` ← مفتاح **anon / publishable** فقط (لا تضع `service_role` أبدًا)

## خطوات التشغيل
1. أنشئ مشروعًا على supabase.com.
2. Authentication → Providers → Email: **أوقف Sign ups**.
3. (لا حاجة لإضافة مستخدم يدويًا — يُنشأ تلقائيًا من الـ SQL)
4. SQL Editor: شغّل `supabase/schema.sql` كاملًا.
5. الـ SQL بينشئ حساب الأدمن تلقائيًا: `admin@gmail.com` / `12345678` — **غيّر الباسورد فور أول دخول**.
6. عدّل `js/config.js`.
7. `npx serve .` ثم افتح `/login.html` (لا يعمل من file://).
8. للنشر: ارفع المجلد على Firebase Hosting / Vercel / Netlify.

## الصفحات
`index.html` الموقع العام · `project.html?id=` التفاصيل · `login.html` · `dashboard.html`
