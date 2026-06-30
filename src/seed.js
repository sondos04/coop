import { migrate, get, run, insert } from './db.js';

migrate();

if ((get('SELECT COUNT(*) AS count FROM members')?.count || 0) === 0) {
  insert('members', { name: 'د. سارة المشرفة', role: 'مشرفة المشروع', email: 'admin@example.com', password: 'admin123', is_admin: 1, bio: 'متابعة الرؤية العامة وتحديث الخطة والمسارات.' });
  insert('members', { name: 'أحمد الباحث', role: 'المسار النظري', email: 'ahmad@example.com', password: '123456', is_admin: 0, bio: 'جمع الدراسات وتلخيص النماذج النظرية.' });
  insert('members', { name: 'ليان المطورة', role: 'المسار العملي', email: 'layan@example.com', password: '123456', is_admin: 0, bio: 'تنفيذ النموذج الأولي وتوثيق المهام التقنية.' });

  insert('project_sections', { section_key: 'idea', title: 'فكرة المشروع', body: 'منصة مركزية تساعد فريق المشروع البحثي/العملي على توثيق الفكرة، متابعة المسارات، حفظ الملاحظات، ومشاركة الرسائل والروابط في مكان واحد.' });
  insert('project_sections', { section_key: 'goal', title: 'الهدف والمشكلة', body: 'يعالج المشروع تشتت المعرفة بين ملفات منفصلة ومحادثات غير مرتبة، ويهدف إلى توفير مصدر واحد واضح لحالة العمل والقرارات والمخرجات.' });
  insert('project_sections', { section_key: 'research', title: 'المسار النظري / البحثي', body: 'يركز على مراجعة الأدبيات، صياغة الأسئلة البحثية، بناء الفرضيات، وتلخيص المفاهيم والنماذج التي يستند إليها المشروع.' });
  insert('project_sections', { section_key: 'practice', title: 'المسار العملي / التطبيقي', body: 'يركز على تصميم الحل، اختيار الأدوات، تنفيذ النموذج، توثيق المراحل التقنية، ومتابعة المهام حسب حالتها.' });

  insert('phases', { name: 'الاستكشاف والتحديد', description: 'تحديد المشكلة ونطاق العمل والأسئلة الأساسية.', starts_at: '2026-07-01', ends_at: '2026-07-14', status: 'in_progress', expected_outputs: 'وثيقة تعريف المشروع وقائمة أولية بالمراجع.' });
  insert('phases', { name: 'التصميم والتخطيط', description: 'تحويل المتطلبات إلى خطة تنفيذ ومسارات واضحة.', starts_at: '2026-07-15', ends_at: '2026-07-31', status: 'not_started', expected_outputs: 'خطة مراحل، قائمة مهام، ومعايير نجاح.' });
  insert('phases', { name: 'النموذج الأولي', description: 'بناء نسخة عملية قابلة للمراجعة والتطوير.', starts_at: '2026-08-01', ends_at: '2026-08-30', status: 'not_started', expected_outputs: 'نموذج أولي وتقرير تعلم.' });

  insert('tasks', { title: 'جمع 10 مراجع أساسية', description: 'اختيار الدراسات ذات الصلة وتلخيص كل مرجع.', owner_id: 2, status: 'in_progress', track: 'research', phase_id: 1, due_date: '2026-07-10', output: 'جدول مراجع مع ملخصات.' });
  insert('tasks', { title: 'صياغة الأسئلة البحثية', description: 'تحويل المشكلة إلى أسئلة قابلة للدراسة.', owner_id: 1, status: 'not_started', track: 'research', phase_id: 1, due_date: '2026-07-14', output: 'قائمة أسئلة وفرضيات.' });
  insert('tasks', { title: 'إعداد قاعدة البيانات', description: 'تعريف جداول الملاحظات والرسائل والمهام والأعضاء.', owner_id: 3, status: 'done', track: 'practice', phase_id: 1, due_date: '2026-07-06', output: 'مخطط قاعدة بيانات أولي.' });
  insert('tasks', { title: 'تصميم واجهة لوحة التقدم', description: 'عرض مؤشرات المهام وآخر التحديثات والروابط السريعة.', owner_id: 3, status: 'in_progress', track: 'practice', phase_id: 2, due_date: '2026-07-20', output: 'واجهة قابلة للاستخدام.' });
  insert('references_list', { title: 'منهجية إدارة المشاريع البحثية', url: 'https://example.com/research-projects', summary: 'مرجع إرشادي لتنظيم المسارات البحثية وربطها بالمخرجات العملية.' });
  insert('notes', { member_id: 2, content: 'نحتاج إلى تعريف أوضح لمعايير اختيار المراجع حتى تكون المراجعة قابلة للتكرار.', category: 'بحث' });
  insert('messages', { member_id: 1, content: 'يرجى تحديث حالة المهام قبل اجتماع نهاية الأسبوع.', attachment_url: '' });
}

console.log('Database is ready. Admin login: admin@example.com / admin123');
