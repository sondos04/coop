import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "drone_project_v1";

const initialData = {
  members: [
    { id: 1, name: "سندس", role: "باحثة رئيسية / RF & Forensics", initials: "سن" },
    { id: 2, name: "العضو 2", role: "RF & Hardware", initials: "ع٢" },
    { id: 3, name: "العضو 3", role: "Signal Processing", initials: "ع٣" },
    { id: 4, name: "العضو 4", role: "Software", initials: "ع٤" },
    { id: 5, name: "العضو 5", role: "Research & Docs", initials: "ع٥" },
  ],
  tasks: [
    { id: 1, title: "تثبيت ArduPilot SITL", phase: "practical", status: "done", owner: "ع٤", desc: "إعداد بيئة المحاكاة" },
    { id: 2, title: "دراسة MAVLink بروتوكول", phase: "theory", status: "done", owner: "سن", desc: "فهم بنية الحزم والرسائل" },
    { id: 3, title: "إعداد GNU Radio", phase: "practical", status: "inprogress", owner: "ع٢", desc: "تجربة الكشف الطيفي" },
    { id: 4, title: "كتابة الفصل النظري", phase: "theory", status: "inprogress", owner: "ع٥", desc: "RF Fundamentals + Protocols" },
    { id: 5, title: "RF Fingerprinting خوارزمية", phase: "practical", status: "todo", owner: "ع٣", desc: "تمييز الدرون من بصمة إشارته" },
    { id: 6, title: "أداة تحليل Telemetry", phase: "practical", status: "todo", owner: "سن", desc: "استخراج وتحليل سجلات الرحلة" },
    { id: 7, title: "خوارزمية AoA / MUSIC", phase: "practical", status: "todo", owner: "ع٣", desc: "تحديد اتجاه الدرون" },
    { id: 8, title: "تصور المسار على خريطة", phase: "practical", status: "todo", owner: "ع٤", desc: "Python Folium لعرض GPS track" },
  ],
  notes: [
    { id: 1, memberId: 1, memberName: "سندس", text: "اجتمعنا اليوم وحددنا نطاق المشروع — ISAC + SDR للكشف والجنائيات", date: "2025-01-01T10:00:00" },
  ],
  messages: [
    { id: 1, memberId: 1, memberName: "سندس", text: "مرحباً يا فريق! هذا الموقع مساحتنا المشتركة لتوثيق المشروع 🚀", date: "2025-01-01T10:00:00" },
  ],
  phases: [
    {
      id: 1, name: "الفصل الأول — البناء النظري", period: "أشهر 1–4", status: "inprogress",
      desc: "مراجعة الأبحاث، دراسة البروتوكولات، إعداد البيئة",
      output: "الفصل النظري + بيئة SITL جاهزة",
      tasks: ["دراسة RF Fundamentals", "مراجعة MAVLink وبروتوكولات الدرونز", "إعداد SITL وGNU Radio", "كتابة الفصل النظري"]
    },
    {
      id: 2, name: "الفصل الثاني — التنفيذ العملي", period: "أشهر 5–9", status: "todo",
      desc: "بناء نظام الكشف والتتبع وأداة التحليل الجنائي",
      output: "نظام كشف عامل + أداة Forensics",
      tasks: ["بناء نظام الكشف بـ HackRF وGNU Radio", "خوارزمية RF Fingerprinting", "أداة تحليل Telemetry Logs", "تصور المسار على خريطة"]
    },
    {
      id: 3, name: "الفصل الثالث — الاختبار والإنهاء", period: "أشهر 10–12", status: "todo",
      desc: "دمج المكونين واختبار شامل وتقرير نهائي",
      output: "نظام متكامل + تقرير نهائي + عرض تقديمي",
      tasks: ["دمج نظامي الكشف والجنائيات", "اختبار على درون حقيقي", "كتابة التقرير النهائي", "تحضير العرض التقديمي"]
    },
  ],
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initialData;
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

const STATUS_LABEL = { done: "مكتملة", inprogress: "قيد العمل", todo: "لم تبدأ" };
const STATUS_COLOR = { done: "#22c55e", inprogress: "#f59e0b", todo: "#94a3b8" };
const STATUS_BG = { done: "#f0fdf4", inprogress: "#fffbeb", todo: "#f8fafc" };

const COLORS = {
  bg: "#f4f6fb",
  card: "#ffffff",
  primary: "#1e3a5f",
  accent: "#2563eb",
  accentLight: "#eff6ff",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  sidebar: "#1e3a5f",
  sidebarText: "#cbd5e1",
  sidebarActive: "#2563eb",
};

const NAV = [
  { id: "home", label: "الرئيسية", icon: "⌂" },
  { id: "tracks", label: "المسارات", icon: "◈" },
  { id: "plan", label: "خطة العمل", icon: "◷" },
  { id: "team", label: "الفريق", icon: "◎" },
  { id: "chat", label: "المحادثة", icon: "✉" },
  { id: "dashboard", label: "لوحة المتابعة", icon: "◉" },
];

function Avatar({ name, size = 36, color = COLORS.accent }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 500, flexShrink: 0,
    }}>{name}</div>
  );
}

function Badge({ status }) {
  return (
    <span style={{
      fontSize: 11, padding: "2px 10px", borderRadius: 20,
      background: STATUS_BG[status], color: STATUS_COLOR[status],
      border: `1px solid ${STATUS_COLOR[status]}33`, fontWeight: 500,
    }}>{STATUS_LABEL[status]}</span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: COLORS.card, borderRadius: 12,
      border: `1px solid ${COLORS.border}`,
      padding: "1.25rem", ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary, marginBottom: 16, marginTop: 0 }}>
      {children}
    </h2>
  );
}

function HomePage({ data }) {
  const done = data.tasks.filter(t => t.status === "done").length;
  const inprog = data.tasks.filter(t => t.status === "inprogress").length;
  const total = data.tasks.length;

  return (
    <div>
      <div style={{
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, #1e4d8c 100%)`,
        borderRadius: 16, padding: "2rem", marginBottom: 24, color: "#fff",
      }}>
        <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 8, letterSpacing: 1 }}>مشروع التخرج — نظام دفاعي ذكي</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.3 }}>
          كشف وتتبع الدرونز<br />بتقنية ISAC وSDR
        </h1>
        <p style={{ color: "#bfdbfe", fontSize: 14, margin: "0 0 20px", lineHeight: 1.7 }}>
          نظام ذكي يستخدم HackRF واحد كـ ISAC لأداء وظيفتي الاستشعار وتحليل الاتصال في آنٍ واحد،
          مع منظومة للتحليل الجنائي الرقمي بعد الهبوط.
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "مكتملة", val: done, color: "#4ade80" },
            { label: "قيد العمل", val: inprog, color: "#fbbf24" },
            { label: "إجمالي المهام", val: total, color: "#93c5fd" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#bfdbfe" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>الهدف من المشروع</div>
          <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.7 }}>
            بناء نظام دفاعي غير مدمر (Soft-kill) لكشف وتتبع الطائرات بدون طيار وتحليل بياناتها جنائياً لتحديد مصدرها ومسارها.
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>المشكلة التي نعالجها</div>
          <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.7 }}>
            الأنظمة التقليدية تحتاج أجهزة منفصلة للكشف والتحليل. نظامنا يوحّدهما في جهاز SDR واحد.
          </div>
        </Card>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>المرحلة الحالية</div>
        <div style={{ display: "flex", gap: 8 }}>
          {data.phases.map((p, i) => (
            <div key={p.id} style={{ flex: 1, padding: 12, borderRadius: 8, background: p.status === "inprogress" ? COLORS.accentLight : "#f8fafc", border: `1px solid ${p.status === "inprogress" ? COLORS.accent : COLORS.border}` }}>
              <div style={{ fontSize: 11, color: p.status === "inprogress" ? COLORS.accent : COLORS.muted, fontWeight: 600, marginBottom: 4 }}>{p.period}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{p.name}</div>
              <Badge status={p.status} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>آخر الأنشطة</div>
        {data.messages.slice(-3).reverse().map(m => (
          <div key={m.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <Avatar name={m.memberName[0]} size={32} />
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}>{m.memberName}</span>
              <span style={{ fontSize: 12, color: COLORS.muted, marginRight: 8 }}>{new Date(m.date).toLocaleDateString("ar-SA")}</span>
              <div style={{ fontSize: 13, color: COLORS.text }}>{m.text}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function TracksPage({ data, setData }) {
  const [activeTrack, setActiveTrack] = useState("theory");
  const [editTask, setEditTask] = useState(null);

  const trackTasks = data.tasks.filter(t => t.phase === activeTrack);

  const updateStatus = (id, status) => {
    const updated = { ...data, tasks: data.tasks.map(t => t.id === id ? { ...t, status } : t) };
    setData(updated); saveData(updated);
  };

  const refs = [
    { title: "Drone Detection and Defense Systems: Survey and SDR-Based Solution", authors: "Chiper et al.", journal: "MDPI Sensors, 2022", url: "#" },
    { title: "RF Based UAV Detection and Defense Systems: Survey", authors: "Martian et al.", journal: "IEEE BlackSeaCom, 2021", url: "#" },
    { title: "MAVLink Developer Guide", authors: "MAVLink Project", journal: "mavlink.io, 2024", url: "#" },
    { title: "Jamming of UAV Remote Control Systems Using SDR", authors: "Pärlin et al.", journal: "IEEE ICMCIS, 2018", url: "#" },
    { title: "WhisperFUSE: Unified Drone Communication Profiling", authors: "Sciancalepore et al.", journal: "IEEE Security Workshop, 2021", url: "#" },
    { title: "Wi-Fly? Detecting Privacy Invasion Attacks by Consumer Drones", authors: "Birnbach et al.", journal: "NDSS Symposium, 2017", url: "#" },
    { title: "Low-Complexity Portable Passive Drone Surveillance via SDR", authors: "Fu et al.", journal: "IEEE Comm. Magazine, 2018", url: "#" },
    { title: "PX4: A Node-Based Multithreaded Open Source Robotics Framework", authors: "Meier et al.", journal: "IEEE ICRA, 2015", url: "#" },
  ];

  const tools = [
    { name: "HackRF One", desc: "SDR رئيسي — إرسال واستقبال ISAC", cost: "~300$", status: "done" },
    { name: "GNU Radio", desc: "معالجة الإشارات والكشف الطيفي", cost: "مجاني", status: "done" },
    { name: "ArduPilot SITL", desc: "محاكاة الدرون بدون هاردوير", cost: "مجاني", status: "done" },
    { name: "Mission Planner", desc: "GCS وتحليل Telemetry", cost: "مجاني", status: "inprogress" },
    { name: "Python + pymavlink", desc: "تحليل MAVLink والجنائيات", cost: "مجاني", status: "inprogress" },
    { name: "Wireshark", desc: "تحليل الحزم مرئياً", cost: "مجاني", status: "todo" },
    { name: "Python Folium", desc: "تصور GPS track على خريطة", cost: "مجاني", status: "todo" },
    { name: "درون ArduPilot", desc: "اختبار ميداني حقيقي", cost: "~200$", status: "todo" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "theory", label: "المسار النظري / البحثي" },
          { id: "practical", label: "المسار العملي / التطبيقي" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTrack(t.id)} style={{
            padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
            background: activeTrack === t.id ? COLORS.accent : COLORS.border,
            color: activeTrack === t.id ? "#fff" : COLORS.muted,
          }}>{t.label}</button>
        ))}
      </div>

      {activeTrack === "theory" ? (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <SectionTitle>الأسئلة البحثية</SectionTitle>
            {[
              "كيف يمكن لجهاز SDR واحد أداء وظيفتي الكشف والتحليل في آنٍ واحد (ISAC)؟",
              "ما مدى دقة RF Fingerprinting في تمييز أنواع الدرونز المختلفة؟",
              "هل يمكن استخراج نقطة إقلاع الدرون بدقة كافية من Telemetry Logs فقط؟",
            ].map((q, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: COLORS.accentLight, color: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>{q}</div>
              </div>
            ))}
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <SectionTitle>المراجع والدراسات المعتمدة</SectionTitle>
            {refs.map((r, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary, marginBottom: 2 }}>[{i + 1}] {r.title}</div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>{r.authors} — <em>{r.journal}</em></div>
              </div>
            ))}
          </Card>

          <Card>
            <SectionTitle>المفاهيم النظرية الأساسية</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { term: "ISAC", def: "دمج الاستشعار والاتصال في جهاز ونطاق ترددي واحد" },
                { term: "RF Fingerprinting", def: "تمييز نوع الدرون من الخصائص الفيزيائية لإشارته" },
                { term: "MAVLink v2", def: "بروتوكول مفتوح لتبادل بيانات التحكم والـ Telemetry" },
                { term: "AoA / MUSIC", def: "خوارزمية لتحديد اتجاه الإشارة باستخدام مصفوفة هوائيات" },
                { term: "Energy Detection", def: "كشف وجود الدرون بقياس طاقة الإشارة في النطاق" },
                { term: "Drone Forensics", def: "استخراج وتحليل بيانات الرحلة لأغراض التحقيق" },
              ].map(c => (
                <div key={c.term} style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent, marginBottom: 3 }}>{c.term}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{c.def}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <SectionTitle>المهام التطبيقية</SectionTitle>
            {trackTasks.map(task => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{task.desc} — {task.owner}</div>
                </div>
                <Badge status={task.status} />
                <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                  style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${COLORS.border}`, fontSize: 12, background: "#fff", cursor: "pointer" }}>
                  <option value="todo">لم تبدأ</option>
                  <option value="inprogress">قيد العمل</option>
                  <option value="done">مكتملة</option>
                </select>
              </div>
            ))}
          </Card>

          <Card>
            <SectionTitle>الأدوات والتقنيات</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {tools.map(t => (
                <div key={t.name} style={{ background: COLORS.bg, borderRadius: 8, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{t.desc}</div>
                    <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 4 }}>{t.cost}</div>
                  </div>
                  <Badge status={t.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function PlanPage({ data }) {
  return (
    <div>
      <SectionTitle>خطة العمل — {data.phases.length} فصول دراسية</SectionTitle>
      {data.phases.map((phase, idx) => (
        <Card key={phase.id} style={{ marginBottom: 16, borderRight: `4px solid ${phase.status === "inprogress" ? COLORS.accent : phase.status === "done" ? "#22c55e" : COLORS.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>{phase.period}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.primary }}>{phase.name}</div>
            </div>
            <Badge status={phase.status} />
          </div>
          <div style={{ fontSize: 14, color: COLORS.text, marginBottom: 12, lineHeight: 1.6 }}>{phase.desc}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.muted, marginBottom: 8 }}>المهام</div>
              {phase.tasks.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, color: COLORS.text }}>{t}</div>
                </div>
              ))}
            </div>
            <div style={{ background: COLORS.accentLight, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 6 }}>المخرجات المتوقعة</div>
              <div style={{ fontSize: 13, color: COLORS.text, lineHeight: 1.6 }}>{phase.output}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function TeamPage({ data, setData, currentMember, setCurrentMember }) {
  const [noteText, setNoteText] = useState("");

  const addNote = () => {
    if (!noteText.trim() || !currentMember) return;
    const member = data.members.find(m => m.id === currentMember);
    const note = { id: Date.now(), memberId: currentMember, memberName: member.name, text: noteText, date: new Date().toISOString() };
    const updated = { ...data, notes: [note, ...data.notes] };
    setData(updated); saveData(updated); setNoteText("");
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {data.members.map(m => (
          <Card key={m.id} style={{ textAlign: "center", cursor: "pointer", border: currentMember === m.id ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}` }}
            onClick={() => setCurrentMember(m.id)}>
            <Avatar name={m.initials} size={44} style={{ margin: "0 auto 10px" }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.primary, marginBottom: 4 }}>{m.name}</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>{m.role}</div>
            {currentMember === m.id && <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 6 }}>✓ تسجيل دخولك</div>}
          </Card>
        ))}
      </div>

      {currentMember && (
        <Card style={{ marginBottom: 20 }}>
          <SectionTitle>إضافة ملاحظة</SectionTitle>
          <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
            placeholder="اكتب ملاحظتك أو تحديثك هنا..."
            style={{ width: "100%", minHeight: 80, padding: 10, borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 14, resize: "vertical", fontFamily: "inherit", direction: "rtl" }} />
          <button onClick={addNote} style={{ marginTop: 8, padding: "8px 20px", background: COLORS.accent, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
            إضافة الملاحظة
          </button>
        </Card>
      )}

      <Card>
        <SectionTitle>سجل الملاحظات</SectionTitle>
        {data.notes.length === 0 ? <div style={{ color: COLORS.muted, fontSize: 14 }}>لا توجد ملاحظات بعد.</div> : null}
        {data.notes.map(note => (
          <div key={note.id} style={{ display: "flex", gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${COLORS.border}` }}>
            <Avatar name={note.memberName[0]} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary }}>{note.memberName}</span>
                <span style={{ fontSize: 12, color: COLORS.muted }}>{new Date(note.date).toLocaleString("ar-SA")}</span>
              </div>
              <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>{note.text}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function ChatPage({ data, setData, currentMember }) {
  const [msgText, setMsgText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [data.messages]);

  const send = () => {
    if (!msgText.trim() || !currentMember) return;
    const member = data.members.find(m => m.id === currentMember);
    const msg = { id: Date.now(), memberId: currentMember, memberName: member.name, text: msgText, date: new Date().toISOString() };
    const updated = { ...data, messages: [...data.messages, msg] };
    setData(updated); saveData(updated); setMsgText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
      {!currentMember && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14, color: "#c2410c" }}>
          اختر عضوك من صفحة الفريق لتتمكن من إرسال رسائل
        </div>
      )}
      <Card style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
        {data.messages.map(m => {
          const isMe = m.memberId === currentMember;
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 10, marginBottom: 14, alignItems: "flex-end" }}>
              <Avatar name={m.memberName[0]} size={32} color={isMe ? "#7c3aed" : COLORS.accent} />
              <div style={{ maxWidth: "70%" }}>
                <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 3, textAlign: isMe ? "left" : "right" }}>
                  {m.memberName} · {new Date(m.date).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{
                  background: isMe ? COLORS.accent : COLORS.bg, color: isMe ? "#fff" : COLORS.text,
                  padding: "10px 14px", borderRadius: isMe ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                  fontSize: 14, lineHeight: 1.6,
                }}>{m.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </Card>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={msgText} onChange={e => setMsgText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={currentMember ? "اكتب رسالتك..." : "اختر عضوك أولاً"}
          disabled={!currentMember}
          style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${COLORS.border}`, fontSize: 14, direction: "rtl", fontFamily: "inherit" }} />
        <button onClick={send} disabled={!currentMember} style={{
          padding: "10px 20px", background: COLORS.accent, color: "#fff",
          border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500,
          opacity: currentMember ? 1 : 0.5,
        }}>إرسال</button>
      </div>
    </div>
  );
}

function DashboardPage({ data, setPage }) {
  const done = data.tasks.filter(t => t.status === "done").length;
  const inprog = data.tasks.filter(t => t.status === "inprogress").length;
  const todo = data.tasks.filter(t => t.status === "todo").length;
  const total = data.tasks.length;
  const pct = Math.round((done / total) * 100);
  const lastNote = data.notes[0];
  const lastMsg = data.messages[data.messages.length - 1];

  return (
    <div>
      <SectionTitle>لوحة المتابعة</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "مكتملة", val: done, color: "#22c55e", bg: "#f0fdf4" },
          { label: "قيد العمل", val: inprog, color: "#f59e0b", bg: "#fffbeb" },
          { label: "لم تبدأ", val: todo, color: "#94a3b8", bg: "#f8fafc" },
          { label: "إجمالي", val: total, color: COLORS.accent, bg: COLORS.accentLight },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 12, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>إجمالي التقدم</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.accent }}>{pct}%</div>
        </div>
        <div style={{ background: COLORS.border, borderRadius: 99, height: 10, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: COLORS.accent, borderRadius: 99, transition: "width 0.5s" }} />
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>آخر ملاحظة</div>
          {lastNote ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}>{lastNote.memberName}</div>
              <div style={{ fontSize: 13, color: COLORS.text, marginTop: 4 }}>{lastNote.text}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>{new Date(lastNote.date).toLocaleDateString("ar-SA")}</div>
            </div>
          ) : <div style={{ fontSize: 13, color: COLORS.muted }}>لا توجد ملاحظات بعد</div>}
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>آخر رسالة</div>
          {lastMsg ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}>{lastMsg.memberName}</div>
              <div style={{ fontSize: 13, color: COLORS.text, marginTop: 4 }}>{lastMsg.text}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>{new Date(lastMsg.date).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          ) : <div style={{ fontSize: 13, color: COLORS.muted }}>لا توجد رسائل بعد</div>}
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>روابط سريعة</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {NAV.slice(1).map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              padding: "10px 14px", background: COLORS.bg, border: `1px solid ${COLORS.border}`,
              borderRadius: 8, cursor: "pointer", fontSize: 13, color: COLORS.text, textAlign: "right",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span> {n.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("home");
  const [currentMember, setCurrentMember] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pages = {
    home: <HomePage data={data} />,
    tracks: <TracksPage data={data} setData={setData} />,
    plan: <PlanPage data={data} />,
    team: <TeamPage data={data} setData={setData} currentMember={currentMember} setCurrentMember={setCurrentMember} />,
    chat: <ChatPage data={data} setData={setData} currentMember={currentMember} />,
    dashboard: <DashboardPage data={data} setPage={setPage} />,
  };

  const currentNav = NAV.find(n => n.id === page);
  const member = data.members.find(m => m.id === currentMember);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg, direction: "rtl", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{
        width: sidebarOpen ? 220 : 60, background: COLORS.sidebar, flexShrink: 0,
        display: "flex", flexDirection: "column", transition: "width 0.2s",
        position: "sticky", top: 0, height: "100vh", overflowX: "hidden",
      }}>
        <div style={{ padding: "16px 14px", borderBottom: "1px solid #ffffff18", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>◈</div>
          {sidebarOpen && <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>نظام كشف<br />الدرونز</div>}
        </div>

        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: page === n.id ? COLORS.sidebarActive : "transparent",
              color: page === n.id ? "#fff" : COLORS.sidebarText,
              marginBottom: 2, fontSize: 14, textAlign: "right", transition: "all .15s",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{n.icon}</span>
              {sidebarOpen && n.label}
            </button>
          ))}
        </nav>

        {sidebarOpen && member && (
          <div style={{ padding: "12px 14px", borderTop: "1px solid #ffffff18" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={member.initials} size={30} color="#334155" />
              <div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{member.name}</div>
                <div style={{ color: "#64748b", fontSize: 11 }}>{member.role}</div>
              </div>
            </div>
          </div>
        )}

        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          padding: 12, background: "transparent", border: "none", cursor: "pointer",
          color: COLORS.sidebarText, fontSize: 18,
        }}>{sidebarOpen ? "◂" : "▸"}</button>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "16px 20px", background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>{currentNav?.label}</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>نظام كشف وتتبع الدرونز — مشروع التخرج</div>
          </div>
          {member ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 13, color: COLORS.muted }}>{member.name}</div>
              <Avatar name={member.initials} size={32} />
            </div>
          ) : (
            <button onClick={() => setPage("team")} style={{ padding: "6px 14px", borderRadius: 8, background: COLORS.accentLight, color: COLORS.accent, border: `1px solid ${COLORS.border}`, cursor: "pointer", fontSize: 13 }}>
              تسجيل الدخول
            </button>
          )}
        </div>

        <div style={{ padding: "20px", maxWidth: 900, margin: "0 auto" }}>
          {pages[page]}
        </div>
      </div>
    </div>
  );
}
