# Welcome to GitHub Desktop!
# مساحة مشروع بحثي/عملي للفريق

This is your README. READMEs are where you can communicate what your project is and how to use it.
موقع ويب عربي باتجاه RTL يعمل كمساحة مركزية لتوثيق فكرة المشروع، متابعة المسارين النظري والعملي، تنظيم الخطة، حفظ ملاحظات الفريق، ومشاركة الرسائل والروابط.

Write your name on line 6, save it, and then head back to GitHub Desktop.
## التشغيل

```bash
npm run seed
npm start
```

ثم افتح: `http://localhost:3000`

حساب تجريبي للمشرف:

- البريد: `admin@example.com`
- كلمة المرور: `admin123`

## الصفحات

- الرئيسية: نبذة المشروع، الهدف، والحالة الحالية.
- لوحة التقدم: مؤشرات المهام وآخر رسالة وملاحظة وروابط سريعة.
- المسارات: المسار البحثي والمراجع، والمسار العملي والأدوات والمهام.
- الخطة: مراحل زمنية مع المهام والمسؤولين والحالة والمخرجات.
- الفريق: أعضاء الفريق وملاحظات محفوظة حسب التاريخ والعضو.
- المحادثة: تشات داخلي بسيط للرسائل والروابط.

## قاعدة البيانات

يستخدم المشروع SQLite عبر أداة `sqlite3` المحلية، ويتم حفظ البيانات في:

```text
data/project-hub.sqlite
```

الجداول الأساسية: `members`, `project_sections`, `phases`, `tasks`, `references_list`, `notes`, `messages`.
