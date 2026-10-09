/* ============================================================
   Archai — core.js v9 FINAL
   ============================================================ */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL as U, SUPABASE_KEY as K } from "./config.js";

/* ---------- Supabase ---------- */
export const sb = createClient(U, K);

/* ---------- DOM ---------- */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Escape HTML ---------- */
export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => "&#" + c.charCodeAt(0) + ";");

/* ---------- Safe URL ---------- */
export const url = (u) => (/^https?:\/\//i.test(u || "") ? u : "#");

/* ============================================================
   CACHE HELPERS
   ============================================================ */
export const clearCache = () => {
  try {
    sessionStorage.removeItem("hm");
  } catch {}
  try {
    sessionStorage.removeItem("archai:cache");
  } catch {}
};

/* ============================================================
   i18n DICTIONARY
   ============================================================ */
const D = {
  ar: {
    heroT: "اكتشف مشاريعنا الرقمية",
    heroT_en: "Explore Our Digital Projects",
    heroDesc: "حلول برمجية ومدمجة وموبايل من هندسة أرشاي.",
    explore: "استعرض المشاريع",
    featT: "المشاريع المميزة",
    feat: "مميز",
    search: "ابحث عن مشروع…",
    all: "كل الأقسام",
    allT: "كل التقنيات",
    visit: "زيارة المشروع",
    details: "التفاصيل",
    none: "لا توجد مشاريع بعد.",
    related: "مشاريع مشابهة",
    tech: "التقنيات",
    ind: "المجالات",
    info: "معلومات المشروع",
    home: "الرئيسية",
    projects: "المشاريع",
    load: "جاري التحميل…",
    err: "حدث خطأ في التحميل.",
    retry: "إعادة المحاولة",
    nf: "المشروع غير موجود.",
    other: "أخرى",
    status: "الحالة",
    cat: "القسم",
    tryT: "جرّب المشروع بنفسك",
    tryD: "افتح المشروع الفعلي في تبويب جديد واستكشفه.",
    scroll: "اسحب للأسفل",
    engineered: "مشروع هندسي",
    ctaExplore: "استعرض المشاريع",
    ctaFeatured: "المشاريع المميزة",
    metaEmbedded: "إمبيدد",
    metaWeb: "ويب",
    metaMobile: "موبايل",
    heroEyebrow: "أرشاي — الأنظمة المتكاملة",
    footerAbout:
      "هندسة حلول برمجية ومدمجة وموبايل بمعايير عالية. نبني أنظمة موثوقة لأعمال حقيقية.",
    footerLinks: "الموقع",
    footerContact: "تواصل",
    footerRights: "© {year} أرشاي للأنظمة المتكاملة",
    footerLocation: "القاهرة · مصر",
    login: "تسجيل الدخول",
    email: "البريد الإلكتروني",
    pass: "كلمة المرور",
    logout: "تسجيل الخروج",
    loginError: "هذا الحساب ليس مسؤولاً.",
    loginBtn: "دخول",
    overview: "نظرة عامة",
    categories: "الأقسام",
    analytics: "الإحصائيات",
    settings: "الإعدادات",
    save: "حفظ",
    cancel: "إلغاء",
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    duplicate: "تكرار",
    publish: "نشر",
    unpublish: "إلغاء النشر",
    stats: "إحصائيات",
    view: "معاينة",
    newProject: "مشروع جديد",
    editProject: "تعديل المشروع",
    newCategory: "قسم جديد",
    editCategory: "تعديل القسم",
    general: "عام",
    content: "المحتوى",
    publishing: "النشر",
    techInd: "التقنيات والمجالات",
    titleEn: "العنوان (إنجليزي)",
    titleAr: "العنوان (عربي)",
    slug: "الرابط المختصر",
    category: "القسم",
    sortOrder: "ترتيب",
    summaryEn: "ملخص (إنجليزي)",
    summaryAr: "ملخص (عربي)",
    descriptionEn: "وصف (إنجليزي)",
    descriptionAr: "وصف (عربي)",
    liveUrl: "رابط المشروع",
    featuredChk: "عرض في السلايدر",
    featuredOrder: "ترتيب المميزة",
    nameEn: "الاسم (إنجليزي)",
    nameAr: "الاسم (عربي)",
    icon: "الأيقونة",
    active: "نشط",
    inactive: "معطل",
    activeHint: "نشط (ظاهر في الموقع)",
    saved: "تم الحفظ ✓",
    deleted: "تم الحذف ✓",
    duplicated: "تم التكرار ✓",
    orderSaved: "تم حفظ الترتيب ✓",
    published: "تم النشر ✓",
    unpublished: "تم إلغاء النشر ✓",
    activated: "تم التفعيل ✓",
    deactivated: "تم التعطيل ✓",
    uploaded: "تم الرفع ✓",
    uploading: "جاري الرفع…",
    confirmDelete: "هل أنت متأكد من الحذف؟",
    confirmDeleteProject: "حذف هذا المشروع وكل صوره؟ لا يمكن التراجع.",
    confirmDeleteCategory: "حذف هذا القسم؟ ستُصبح مشاريعه بدون قسم.",
    media: "الصور",
    mediaCount: "{n} صورة",
    dropImages: "اسحب الصور هنا أو اضغط للرفع",
    dropHint: "WebP · JPEG · PNG · GIF — حتى 5MB",
    noImages: "لا توجد صور بعد — اسحب الصور للأعلى",
    noValidImages: "لا توجد صور صالحة",
    saveFirst: "احفظ المشروع أولاً ثم أعد فتحه لرفع الصور.",
    saveFirstTitle: "احفظ المشروع أولاً",
    saveFirstDesc: "بعد الحفظ، أعد فتح المشروع لرفع الصور.",
    cover: "غلاف",
    featuredImg: "مميزة",
    heroImg: "رئيسية",
    totalProjects: "المشاريع الكلية",
    publishedCount: "منشورة",
    featuredCount: "مميزة",
    sessions: "الجلسات",
    projectViews: "فتحات المشاريع",
    recentProjects: "أحدث المشاريع",
    topViewed: "الأكثر مشاهدة",
    noProjects: "لا توجد مشاريع بعد",
    noViews: "لا توجد بيانات مشاهدة بعد",
    noCategories: "لا توجد أقسام بعد",
    loading: "جاري التحميل…",
    today: "اليوم",
    yesterday: "أمس",
    last7: "آخر 7 أيام",
    last30: "آخر 30 يوم",
    last90: "آخر 90 يوم",
    thisYear: "هذه السنة",
    allTime: "كل الوقت",
    custom: "مخصص",
    apply: "تحديث",
    pickDates: "اختر التاريخين",
    dateRange: "الفترة المعروضة",
    mainNumbers: "الأرقام الرئيسية",
    uniqueVisitors: "زوار فريدون",
    uniqueVisitorsHint: "أجهزة مختلفة زارت الموقع",
    pageViews: "مشاهدات الصفحات",
    pageViewsHint: "إجمالي فتحات الصفحات",
    projectOpens: "فتحات المشاريع",
    projectOpensHint: "مرات فتح صفحات المشاريع",
    uniqueProjectVisitors: "زوار المشاريع",
    uniqueProjectVisitorsHint: "أجهزة مختلفة فتحت مشاريع",
    charts: "الرسوم البيانية",
    visitorsOverTime: "الزوار مع مرور الوقت",
    projectOpensChart: "فتحات المشاريع",
    devicesChart: "نوع الأجهزة",
    sourcesChart: "مصادر الزيارات",
    topProjectsTitle: "المشاريع الأكثر مشاهدة",
    topProjectsHint: "النسبة = حصة المشروع من إجمالي الفتحات. المجموع = 100%.",
    topCategoriesTitle: "الأقسام الأكثر تفاعلاً",
    views: "الفتحات",
    visitors: "زوار",
    percentage: "النسبة",
    noData: "لا توجد بيانات في هذه الفترة",
    noDataHint: "التتبع يعمل تلقائياً. لتختبره:",
    noDataStep1: "افتح نافذة Incognito وتصفح الموقع",
    noDataStep2: "ارجع هنا واضغط تحديث",
    failedLoad: "فشل تحميل الإحصائيات",
    noProjectOpens: "لم يفتح أحد أي مشروع في هذه الفترة",
    noCategoryData: "لا توجد بيانات أقسام",
    desktop: "كمبيوتر",
    mobile: "موبايل",
    tablet: "تابلت",
    direct: "مباشر",
    searchSource: "بحث",
    referral: "إحالة",
    otherSource: "أخرى",
    pages: "صفحات",
    projectsColon: "مشاريع",
    siteSettings: "إعدادات الموقع",
    companyName: "اسم الشركة",
    logoUrl: "رابط الشعار",
    siteTitle: "عنوان الموقع",
    homeTitleEn: "عنوان الرئيسية (إنجليزي)",
    homeTitleAr: "عنوان الرئيسية (عربي)",
    homeDescEn: "وصف الرئيسية (إنجليزي)",
    homeDescAr: "وصف الرئيسية (عربي)",
    footerEn: "الفوتر (إنجليزي)",
    footerAr: "الفوتر (عربي)",
    defaultSeo: "صورة SEO الافتراضية",
    featuredLimit: "أقصى عدد للمميزة في السلايدر",
    editSettings: "تعديل الإعدادات",
    menu: "القائمة",
    theme: "تبديل الوضع",
    lang: "تبديل اللغة",
    backTop: "للأعلى",
  },
  en: {
    heroT: "Explore Our Digital Projects",
    heroT_en: "Explore Our Digital Projects",
    heroDesc: "Software, embedded and mobile solutions engineered by Archai.",
    explore: "Explore Projects",
    featT: "Featured Projects",
    feat: "Featured",
    search: "Search projects…",
    all: "All categories",
    allT: "All technologies",
    visit: "Visit Live Project",
    details: "View Details",
    none: "No projects available yet.",
    related: "Related Projects",
    tech: "Technologies",
    ind: "Industries",
    info: "Project Information",
    home: "Home",
    projects: "Projects",
    load: "Loading…",
    err: "Failed to load.",
    retry: "Retry",
    nf: "Project not found.",
    other: "Other",
    status: "Status",
    cat: "Category",
    tryT: "Try it yourself",
    tryD: "Open the live project in a new tab and explore it.",
    scroll: "Scroll down",
    engineered: "Engineered projects",
    ctaExplore: "Explore Projects",
    ctaFeatured: "Featured Projects",
    metaEmbedded: "Embedded",
    metaWeb: "Web",
    metaMobile: "Mobile",
    heroEyebrow: "Archai — Integrated Systems",
    footerAbout:
      "Engineering software, embedded, and mobile solutions to the highest standards. We build reliable systems for real businesses.",
    footerLinks: "Site",
    footerContact: "Contact",
    footerRights: "© {year} Archai Integrated Systems",
    footerLocation: "Cairo · Egypt",
    login: "Sign in",
    email: "Email",
    pass: "Password",
    logout: "Logout",
    loginError: "This account is not an admin.",
    loginBtn: "Sign in",
    overview: "Overview",
    categories: "Categories",
    analytics: "Analytics",
    settings: "Settings",
    save: "Save",
    cancel: "Cancel",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    duplicate: "Duplicate",
    publish: "Publish",
    unpublish: "Unpublish",
    stats: "Stats",
    view: "View",
    newProject: "New project",
    editProject: "Edit project",
    newCategory: "New category",
    editCategory: "Edit category",
    general: "General",
    content: "Content",
    publishing: "Publishing",
    techInd: "Technologies & Industries",
    titleEn: "Title EN",
    titleAr: "Title AR",
    slug: "Slug",
    category: "Category",
    sortOrder: "Sort order",
    summaryEn: "Summary EN",
    summaryAr: "Summary AR",
    descriptionEn: "Description EN",
    descriptionAr: "Description AR",
    liveUrl: "Live URL",
    featuredChk: "Show on homepage featured slider",
    featuredOrder: "Featured order",
    nameEn: "Name EN",
    nameAr: "Name AR",
    icon: "Icon",
    active: "Active",
    inactive: "Inactive",
    activeHint: "Active (visible on site)",
    saved: "Saved ✓",
    deleted: "Deleted ✓",
    duplicated: "Duplicated ✓",
    orderSaved: "Order saved ✓",
    published: "Published ✓",
    unpublished: "Unpublished ✓",
    activated: "Activated ✓",
    deactivated: "Deactivated ✓",
    uploaded: "Uploaded ✓",
    uploading: "Uploading…",
    confirmDelete: "Are you sure?",
    confirmDeleteProject:
      "Delete this project and all its images? This cannot be undone.",
    confirmDeleteCategory:
      "Delete this category? Its projects will become uncategorized.",
    media: "Media",
    mediaCount: "{n} images",
    dropImages: "Drop images here or click to upload",
    dropHint: "WebP · JPEG · PNG · GIF — up to 5MB",
    noImages: "No images yet — drop images above",
    noValidImages: "No valid images",
    saveFirst: "Save the project first, then reopen it to upload images.",
    saveFirstTitle: "Save the project first",
    saveFirstDesc: "After saving, reopen the project to upload images.",
    cover: "Cover",
    featuredImg: "Featured",
    heroImg: "Hero",
    totalProjects: "Total projects",
    publishedCount: "Published",
    featuredCount: "Featured",
    sessions: "Sessions",
    projectViews: "Project views",
    recentProjects: "Recent projects",
    topViewed: "Most viewed",
    noProjects: "No projects yet",
    noViews: "No view data yet",
    noCategories: "No categories yet",
    loading: "Loading…",
    today: "Today",
    yesterday: "Yesterday",
    last7: "Last 7 days",
    last30: "Last 30 days",
    last90: "Last 90 days",
    thisYear: "This year",
    allTime: "All time",
    custom: "Custom",
    apply: "Apply",
    pickDates: "Pick both dates",
    dateRange: "Date range",
    mainNumbers: "Key numbers",
    uniqueVisitors: "Unique visitors",
    uniqueVisitorsHint: "Distinct devices that visited the site",
    pageViews: "Page views",
    pageViewsHint: "Total page opens",
    projectOpens: "Project opens",
    projectOpensHint: "Times project pages were opened",
    uniqueProjectVisitors: "Unique project visitors",
    uniqueProjectVisitorsHint: "Distinct devices that opened projects",
    charts: "Charts",
    visitorsOverTime: "Visitors over time",
    projectOpensChart: "Project opens",
    devicesChart: "Device types",
    sourcesChart: "Traffic sources",
    topProjectsTitle: "Most viewed projects",
    topProjectsHint: "Percentage = project's share of total opens. Sum = 100%.",
    topCategoriesTitle: "Most active categories",
    views: "Views",
    visitors: "Visitors",
    percentage: "Share",
    noData: "No data for this period",
    noDataHint: "Tracking is automatic. To test it:",
    noDataStep1: "Open an Incognito window and browse the site",
    noDataStep2: "Come back here and press refresh",
    failedLoad: "Failed to load analytics",
    noProjectOpens: "No project was opened in this period",
    noCategoryData: "No category data",
    desktop: "Desktop",
    mobile: "Mobile",
    tablet: "Tablet",
    direct: "Direct",
    searchSource: "Search",
    referral: "Referral",
    otherSource: "Other",
    pages: "Pages",
    projectsColon: "Projects",
    siteSettings: "Site settings",
    companyName: "Company name",
    logoUrl: "Logo URL",
    siteTitle: "Website title",
    homeTitleEn: "Homepage title EN",
    homeTitleAr: "Homepage title AR",
    homeDescEn: "Homepage description EN",
    homeDescAr: "Homepage description AR",
    footerEn: "Footer EN",
    footerAr: "Footer AR",
    defaultSeo: "Default SEO image URL",
    featuredLimit: "Slider: max featured projects",
    editSettings: "Edit settings",
    menu: "Menu",
    theme: "Toggle theme",
    lang: "Switch language",
    backTop: "Back to top",
  },
};

/* ---------- Language ---------- */
export let lang = localStorage.lang === "en" ? "en" : "ar";
export const t = (k) => D[lang]?.[k] ?? k;
export const L = (o, f) => o?.[f + "_" + lang] || o?.[f + "_en"] || "";
export const tt = (k, vars = {}) =>
  String(t(k)).replace(/\{(\w+)\}/g, (_, n) => vars[n] ?? "");

/* ---------- Apply translations ---------- */
export function applyI18n(root = document) {
  $$("[data-i]", root).forEach((e) => {
    const k = e.dataset.i;
    const v = t(k);
    if (v !== k) e.textContent = v.replace("{year}", new Date().getFullYear());
  });
  $$("[data-ph]", root).forEach((e) => {
    const k = e.dataset.ph;
    const v = t(k);
    if (v !== k) e.placeholder = v;
  });
  $$("[data-aria]", root).forEach((e) => {
    const k = e.dataset.aria;
    const v = t(k);
    if (v !== k) e.setAttribute("aria-label", v);
  });
  $$("[data-title]", root).forEach((e) => {
    const k = e.dataset.title;
    const v = t(k);
    if (v !== k) e.title = v;
  });
}

/* ============================================================
   SCROLL HELPERS — minimal, no auto-adjustment
   ============================================================ */
export function withNoSmooth(fn) {
  const html = document.documentElement;
  html.classList.add("no-smooth");
  try {
    fn();
  } finally {
    requestAnimationFrame(() => {
      html.classList.remove("no-smooth");
    });
  }
}

function initScrollRestoration() {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
}

export function initSmoothAnchors() {
  document.addEventListener(
    "click",
    (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const headerH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--header-h"
          )
        ) || 72;
      const top =
        target.getBoundingClientRect().top + window.scrollY - headerH - 20;

      withNoSmooth(() => {
        window.scrollTo({ top, behavior: "smooth" });
      });
    },
    { passive: false }
  );
}

/* ============================================================
   AMBIENT / EFFECTS
   ============================================================ */
function initAmbient() {
  if (document.querySelector(".ambient-layer")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layer = document.createElement("div");
  layer.className = "ambient-layer";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `
    <div class="ambient-shape ambient-shape-1"></div>
    <div class="ambient-shape ambient-shape-2"></div>
    <div class="ambient-shape ambient-shape-3"></div>
    <div class="ambient-shape ambient-shape-4"></div>
    <div class="ambient-shape ambient-shape-5"></div>
    <div class="ambient-shape ambient-shape-6"></div>
    <div class="ambient-shape ambient-shape-7"></div>
  `;
  document.body.prepend(layer);
}

function initScrollProgress() {
  if (document.querySelector(".scroll-progress")) return;

  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  let ticking = false;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = pct + "%";
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  update();
}

function initCursorGlow() {
  if (window.matchMedia("(max-width: 960px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (document.querySelector(".cursor-glow")) return;

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.appendChild(glow);

  let raf;
  let tx = 0, ty = 0, cx = 0, cy = 0;

  document.addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX;
      ty = e.clientY;
      glow.classList.add("active");
      if (!raf) raf = requestAnimationFrame(loop);
    },
    { passive: true }
  );

  document.addEventListener("pointerleave", () => {
    glow.classList.remove("active");
  });

  function loop() {
    cx += (tx - cx) * 0.15;
    cy += (ty - cy) * 0.15;
    glow.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
    if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = null;
    }
  }
}

function initMagneticButtons() {
  if (window.matchMedia("(max-width: 960px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.addEventListener(
    "pointermove",
    (e) => {
      const btn = e.target.closest(".btn.p, .hero-cta, .hero-cta-ghost");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px) translateY(-2px)`;
    },
    { passive: true }
  );
}

function initRipple() {
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target.closest(".ripple, .btn.p");
      if (!target) return;
      const r = target.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const ink = document.createElement("span");
      ink.className = "ripple-ink";
      ink.style.width = ink.style.height = size + "px";
      ink.style.left = e.clientX - r.left - size / 2 + "px";
      ink.style.top = e.clientY - r.top - size / 2 + "px";
      target.appendChild(ink);
      setTimeout(() => ink.remove(), 700);
    },
    { passive: true }
  );
}

function initFab() {
  const existing = document.querySelector(".fab");
  if (existing) return;
  if (document.body.dataset.noFab === "1") return;

  const fab = document.createElement("button");
  fab.className = "fab";
  fab.setAttribute("aria-label", t("backTop"));
  fab.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  `;
  fab.style.display = "none";
  fab.onclick = () => {
    withNoSmooth(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };
  document.body.appendChild(fab);

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          fab.style.display = window.scrollY > 400 ? "grid" : "none";
          ticking = false;
        });
      }
    },
    { passive: true }
  );
}

function initDialogScrollLock() {
  const mo = new MutationObserver(() => {
    const anyOpen = document.querySelector("dialog[open]");
    document.body.classList.toggle("dialog-open", !!anyOpen);
  });
  mo.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["open"],
  });
}

/* ============================================================
   BOOT
   ============================================================ */
let __booted = false;

export function boot() {
  const h = document.documentElement;

  h.lang = lang;
  h.dir = lang === "ar" ? "rtl" : "ltr";
  h.dataset.theme = localStorage.theme || "dark";

  applyI18n();

  $$("[data-yr]").forEach((e) => {
    e.textContent = new Date().getFullYear();
  });

  const l = $("#lang");
  if (l) {
    l.textContent = lang === "ar" ? "EN" : "ع";
    l.onclick = () => {
      localStorage.lang = lang === "ar" ? "en" : "ar";
      clearCache();
      location.reload();
    };
  }

  const m = $("#theme");
  if (m) {
    m.onclick = () => {
      const next = h.dataset.theme === "dark" ? "light" : "dark";
      localStorage.theme = next;
      h.dataset.theme = next;
    };
  }

  if (!__booted) {
    __booted = true;
    initScrollRestoration();
    initSmoothAnchors();
    initAmbient();
    initScrollProgress();
    initCursorGlow();
    initMagneticButtons();
    initRipple();
    initFab();
    initDialogScrollLock();
  }
}

/* ============================================================
   ANALYTICS TRACKER
   ============================================================ */
export async function track(projectId) {
  const DEBUG = localStorage.DEBUG_TRACK === "1";

  try {
    if (/bot|crawl|spider|headless|lighthouse|preview/i.test(navigator.userAgent)) {
      return;
    }

    if (!DEBUG) {
      const key = "t:" + (projectId || location.pathname);
      const now = Date.now();
      const ttl = projectId ? 18e5 : 3e4;
      if (now - (+sessionStorage[key] || 0) < ttl) return;
      sessionStorage[key] = now;
    }

    if (!DEBUG) {
      const { data: { session } } = await sb.auth.getSession();
      if (session) return;
    }

    let s = sessionStorage.sid;
    if (!s) s = sessionStorage.sid = crypto.randomUUID().replace(/-/g, "");

    const ua = navigator.userAgent;
    const dev = /ipad|tablet/i.test(ua) ? "tablet"
      : /mobi|android|iphone/i.test(ua) ? "mobile" : "desktop";
    const br = /edg\//i.test(ua) ? "Edge"
      : /firefox/i.test(ua) ? "Firefox"
      : /chrome/i.test(ua) ? "Chrome"
      : /safari/i.test(ua) ? "Safari" : "Other";
    const os = /android/i.test(ua) ? "Android"
      : /iphone|ipad/i.test(ua) ? "iOS"
      : /windows/i.test(ua) ? "Windows"
      : /mac/i.test(ua) ? "macOS"
      : /linux/i.test(ua) ? "Linux" : "Other";

    let ref = document.referrer;
    let rt = "direct";
    if (ref) {
      try {
        const host = new URL(ref).hostname;
        rt = host === location.hostname ? "direct"
          : /google|bing|yahoo|duckduckgo|yandex|baidu/i.test(host) ? "search"
          : "referral";
      } catch { rt = "other"; }
    }

    const payload = {
      p_session: s,
      p_page: projectId ? "/project" : location.pathname,
      p_device: dev,
      p_browser: br,
      p_os: os,
      p_referrer: ref || null,
      p_referrer_type: rt,
      p_project: projectId || null,
    };

    const { error } = await sb.rpc("track_visit", payload);
    if (error) console.error("[track] RPC error:", error);
  } catch (e) {
    console.error("[track] exception:", e);
  }
}