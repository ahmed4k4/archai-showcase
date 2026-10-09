import {
  sb, $, $$, esc, url, t, tt, L, lang,
  boot, track, applyI18n, clearCache, withNoSmooth,
  readCache,
  writeCache,
} from "./core.js";

/* ---------- Helpers ---------- */
const img = (s, a) =>
  s ? `<img loading="lazy" decoding="async" src="${esc(s)}" alt="${esc(a)}">` : "";

const SEL =
  "*,categories(id,name_en,name_ar,active),project_technologies(technology),project_industries(industry)";
const LIST =
  "id,slug,category_id,sort_order,title_en,title_ar,summary_en,summary_ar,live_url,cover_image,cover_thumb,featured_image,featured,featured_sort_order,categories(id,name_en,name_ar,active),project_technologies(technology),project_industries(industry)";

const PV = lang === "ar" ? "›" : "‹";
const NX = lang === "ar" ? "‹" : "›";

const live = (p) =>
  p.live_url
    ? `<a class="btn p" target="_blank" rel="noopener noreferrer" href="${esc(url(p.live_url))}" aria-label="${t("visit")}">
        ${t("visit")} <span aria-hidden="true">↗</span>
      </a>`
    : "";

/* ============================================================
   STRICT ACTIVE FILTER HELPERS
   ============================================================ */
const onlyActiveCats = (arr) =>
  Array.isArray(arr) ? arr.filter((c) => c && c.id && c.active === true) : [];

const onlyActiveProjects = (arr, activeCatIds) =>
  Array.isArray(arr)
    ? arr.filter((x) => {
        if (!x || !x.id) return false;
        if (x.category_id && !activeCatIds.has(String(x.category_id))) return false;
        if (x.categories && x.categories.active === false) return false;
        if (!Array.isArray(x.project_technologies)) x.project_technologies = [];
        if (!Array.isArray(x.project_industries)) x.project_industries = [];
        return true;
      })
    : [];

/* ============================================================
   HERO ANIMATIONS
   ============================================================ */
function initHeroParticles() {
  const canvas = document.getElementById("heroParticles");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let raf;
  let particles = [];
  const COUNT = window.innerWidth < 720 ? 20 : 45;
  const COLORS = ["#ff8c42", "#2dd4bf", "#a78bfa", "#fb7185"];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    particles = [];
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6,
        color: COLORS[i % COLORS.length],
        alpha: Math.random() * 0.5 + 0.2,
      });
    }
  }

  function tick() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 140, 66, ${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > rect.width) p.vx *= -1;
      if (p.y < 0 || p.y > rect.height) p.vy *= -1;

      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    raf = requestAnimationFrame(tick);
  }

  resize();
  spawn();
  tick();

  window.addEventListener("resize", () => { resize(); spawn(); });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else tick();
  });
}

function initHeroCounters() {
  const el = document.getElementById("heroCount");
  if (!el) return;

  const target = parseInt(el.dataset.count || "0", 10) || 12;
  const duration = 1600;
  const start = performance.now();

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = String(Math.round(eased * target)).padStart(2, "0");
    if (progress < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/* ---------- Hero effects — only once ---------- */
function initHeroEffects() {
  // ✅ لا تعمل إلا مرة واحدة فقط
  if (document.body.dataset.heroInited === "1") return;
  document.body.dataset.heroInited = "1";

  initHeroParticles();
  initHeroCounters();

  const ghost = document.querySelector(".hero-cta-ghost");
  if (ghost) {
    ghost.addEventListener(
      "pointermove",
      (e) => {
        const r = ghost.getBoundingClientRect();
        ghost.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        ghost.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      },
      { passive: true }
    );
  }

  // ❌ REMOVED: hero-orb parallax on scroll
  // كان بيغير transform على 3 عناصر كبيرة مع كل scroll
  // وكان بيسبب تغييرات layout تسبب jump
}

/* ---------- Scroll reveal ---------- */
let revealObs = null;
function initScrollReveal() {
  if (revealObs) revealObs.disconnect();
  revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
  );
  $$(".reveal:not(.visible), .stagger:not(.visible)").forEach((el) =>
    revealObs.observe(el)
  );
}

/* ---------- Button cursor tracking ---------- */
function initButtonEffects() {
  if (window.__btnFxBound) return;
  window.__btnFxBound = true;
  document.addEventListener(
    "pointermove",
    (e) => {
      const btn = e.target.closest?.(".btn");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    },
    { passive: true }
  );
}

/* ---------- Stagger ---------- */
function staggerCards() {
  $$(".card").forEach((c, i) => c.style.setProperty("--i", i));
}

/* ---------- Card template ---------- */
export const card = (p) => {
  const title = L(p, "title");
  return `
  <article class="card">
    <a class="im" href="project.html?id=${p.id}" data-hint="${t("details")}"
       aria-label="${t("details")} — ${esc(title)}">
      ${img(p.cover_thumb || p.cover_image, title)}
    </a>
    <div class="b">
      <div>
        <span class="badge c">${esc(L(p.categories, "name") || t("other"))}</span>
        ${p.featured ? `<span class="badge">★ ${t("feat")}</span>` : ""}
      </div>
      <h3>${esc(title)}</h3>
      <p>${esc(L(p, "summary"))}</p>
      <div class="tags">
        ${(p.project_technologies || [])
          .slice(0, 3)
          .map((x) => `<span>${esc(x.technology)}</span>`)
          .join("")}
      </div>
      <div class="row">
        ${live(p)}
        <a class="btn" href="project.html?id=${p.id}">${t("details")}</a>
      </div>
    </div>
  </article>`;
};

/* ---------- Error ---------- */
const fail = (el, e) => {
  console.error(e);
  el.innerHTML = `<div class="empty">${t("err")} <button class="btn" onclick="location.reload()">${t("retry")}</button></div>`;
};

/* ---------- SEO ---------- */
const seo = (title, desc, image) => {
  document.title = title;
  [
    ["description", desc],
    ["og:title", title],
    ["og:description", desc],
    ["og:image", image],
    ["twitter:card", "summary_large_image"],
  ].forEach(([n, c]) => {
    if (!c) return;
    const k = n.startsWith("og") ? "property" : "name";
    let m = document.head.querySelector(`meta[${k}="${n}"]`);
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute(k, n);
      document.head.append(m);
    }
    m.content = c;
  });
  let l = document.head.querySelector("link[rel=canonical]");
  if (!l) {
    l = document.createElement("link");
    l.rel = "canonical";
    document.head.append(l);
  }
  l.href = location.href;
};

/* ============================================================
   HOME
   ============================================================ */
let homeAbort = null;
let homeInitDone = false;

export async function home() {
  boot();
  track();

  const root = $("#app");
  if (!root) return;

  if (homeAbort) homeAbort.abort();
  homeAbort = new AbortController();

  /* ✅ إذا كانت الصفحة محملة بالفعل، لا نعيد الرسم */
  if (homeInitDone) {
    return;
  }

  root.innerHTML = `<div class="empty">${t("load")}</div>`;

  try {
    let H = readCache("hm", 300000);
    if (!H) {
      const [rCats, rProjs, rSettings] = await Promise.all([
        sb
          .from("categories")
          .select("id,slug,icon,name_en,name_ar,active")
          .eq("active", true)
          .order("sort_order"),
        sb.from("projects").select(LIST).order("sort_order"),
        sb.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      ]);
      H = {
        cats: Array.isArray(rCats.data) ? rCats.data : [],
        projs: Array.isArray(rProjs.data) ? rProjs.data : [],
        st: rSettings.data || {},
      };
      if (!rCats.error && !rProjs.error && !rSettings.error) writeCache("hm", H);
    }
    const catsRaw = H.cats;
    const projsRaw = H.projs;
    const st = H.st;

    const cats = onlyActiveCats(catsRaw);
    const activeCatIds = new Set(cats.map((c) => String(c.id)));
    const ps = onlyActiveProjects(projsRaw, activeCatIds);

    const vis = st.section_visibility || {};

    /* Hero setup */
    const hero = document.getElementById("hero");
    if (vis.hero === false) {
      if (hero) hero.hidden = true;
    } else {
      const h1Ar = document.getElementById("heroTitleAr");
      const h1En = document.getElementById("heroTitleEn");
      const heroDesc = document.getElementById("heroDesc");
      const countEl = document.getElementById("heroCount");

      if (h1Ar) h1Ar.textContent = L(st, "home_title") || t("heroT");
      if (h1En)
        h1En.textContent =
          st.home_title_en || st.home_title_ar
            ? st.home_title_en || ""
            : t("heroT_en");
      if (heroDesc) heroDesc.textContent = L(st, "home_desc") || t("heroDesc");
      if (countEl) countEl.dataset.count = String(ps.length);

      applyI18n(hero);
      initHeroEffects();
    }

    seo(st.site_title || "Archai", L(st, "home_desc"), st.default_seo_image);

    const fts = ps
      .filter((x) => x.featured)
      .sort(
        (a, b) =>
          a.featured_sort_order - b.featured_sort_order ||
          a.sort_order - b.sort_order
      )
      .slice(0, st.featured_limit || 6);

    const techs = [
      ...new Set(
        ps.flatMap((x) =>
          Array.isArray(x.project_technologies)
            ? x.project_technologies.map((y) => y.technology)
            : []
        )
      ),
    ].sort();

    root.innerHTML = `
      ${
        fts.length && vis.featured !== false
          ? `<section id="sl" class="slider reveal" aria-label="${t("featT")}">
              <div class="track">
                ${fts
                  .map(
                    (x) => `
                  <article class="slide">
                    ${img(x.featured_image || x.cover_image, L(x, "title"))}
                    <div class="tx">
                      <span class="badge">★ ${t("feat")}</span>
                      <h3>${esc(L(x, "title"))}</h3>
                      <p>${esc(L(x, "summary"))}</p>
                      <div class="row">
                        ${live(x)}
                        <a class="btn" href="project.html?id=${x.id}">${t(
                      "details"
                    )}</a>
                      </div>
                    </div>
                  </article>`
                  )
                  .join("")}
              </div>
              <button class="nv pv" aria-label="Previous">${PV}</button>
              <button class="nv nx" aria-label="Next">${NX}</button>
              <div class="dots" role="tablist"></div>
            </section>`
          : ""
      }
      <div class="bar reveal" id="list">
        <input id="q" type="search" data-ph="search" aria-label="${t(
          "search"
        )}">
        <select id="cf" aria-label="${t("cat")}">
          <option value="">${t("all")}</option>
          ${cats
            .map((x) => `<option value="${x.id}">${esc(L(x, "name"))}</option>`)
            .join("")}
        </select>
        <select id="tf" aria-label="${t("allT")}">
          <option value="">${t("allT")}</option>
          ${techs.map((x) => `<option>${esc(x)}</option>`).join("")}
        </select>
      </div>
      <div id="out"></div>
    `;

    root.dataset.loaded = "1";
    document.body.classList.add("loaded");
    homeInitDone = true;

    boot();

    const draw = () => {
      const q = ($("#q")?.value || "").toLowerCase().trim();
      const cf = $("#cf")?.value || "";
      const tf = $("#tf")?.value || "";

      const f = ps.filter((x) => {
        if (x.category_id && !activeCatIds.has(String(x.category_id)))
          return false;
        if (x.categories && x.categories.active === false) return false;

        return (
          (!cf || x.category_id === cf) &&
          (!tf ||
            (Array.isArray(x.project_technologies) &&
              x.project_technologies.some((y) => y.technology === tf))) &&
          (!q ||
            [
              x.title_en,
              x.title_ar,
              x.summary_en,
              x.summary_ar,
              x.categories?.name_en,
              x.categories?.name_ar,
              ...(Array.isArray(x.project_technologies)
                ? x.project_technologies.map((y) => y.technology)
                : []),
              ...(Array.isArray(x.project_industries)
                ? x.project_industries.map((y) => y.industry)
                : []),
            ]
              .join(" ")
              .toLowerCase()
              .includes(q))
        );
      });

      const sec = (h, a) =>
        a.length
          ? `<h2 class="st reveal">${h}</h2>
             <div class="grid stagger">${a.map(card).join("")}</div>`
          : "";

      const out = $("#out");
      if (!out) return;
      out.innerHTML = f.length
        ? cats
            .map((x) =>
              sec(
                `${esc(x.icon || "")} ${esc(L(x, "name"))}`,
                f.filter((y) => y.category_id === x.id)
              )
            )
            .join("") +
          sec(
            t("other"),
            f.filter((y) => !y.category_id)
          )
        : `<div class="empty">${t("none")}</div>`;

      staggerCards();
      initScrollReveal();
    };

    ["q", "cf", "tf"].forEach((id) => {
      const el = $("#" + id);
      if (el) {
        el.addEventListener("input", draw);
        el.addEventListener("change", draw);
      }
    });
    draw();

    /* ============================================================
       ✅ SLIDER — بدون scrollIntoView
       نستخدم track.scrollLeft مباشرة → لا يؤثر على scroll الصفحة
       ============================================================ */
    const tr = $(".track");
    if (tr) {
      const sl = [...tr.children];
      const dots = $(".dots");
      let i = 0;
      let hold = 0;

      if (dots) {
        dots.innerHTML = sl
          .map(
            (_, j) =>
              `<i role="tab" tabindex="0" aria-label="Slide ${j + 1}"></i>`
          )
          .join("");

        const mark = () =>
          [...dots.children].forEach((d, j) =>
            d.classList.toggle("on", j === i)
          );

        /* ✅ استخدم scrollLeft مباشرة — لا يحرك الصفحة */
        const go = (n) => {
          i = (n + sl.length) % sl.length;
          const target = sl[i];
          if (!target) return;
          const left = target.offsetLeft;
          tr.scrollTo({
            left,
            behavior: "smooth",
          });
        };

        tr.addEventListener(
          "scroll",
          () => {
            const trackW = tr.clientWidth;
            if (trackW > 0) {
              const newI = Math.round(Math.abs(tr.scrollLeft) / trackW);
              if (newI !== i && newI >= 0 && newI < sl.length) {
                i = newI;
                mark();
              }
            }
          },
          { passive: true }
        );
        mark();

        const pv = $(".pv");
        const nx = $(".nx");
        const slEl = $("#sl");
        if (pv) pv.addEventListener("click", () => go(i - 1));
        if (nx) nx.addEventListener("click", () => go(i + 1));
        [...dots.children].forEach((d, j) => {
          d.addEventListener("click", () => go(j));
          d.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              go(j);
            }
          });
        });
        if (slEl) {
          slEl.addEventListener("pointerenter", () => (hold = 1));
          slEl.addEventListener("pointerleave", () => (hold = 0));
        }
        tr.addEventListener("touchstart", () => (hold = 1), { passive: true });

        if (sl.length > 1) {
          setInterval(() => {
            if (!hold && !document.hidden) go(i + 1);
          }, 6500);
        }
      }
    }

    initScrollReveal();
    initButtonEffects();
  } catch (e) {
    if (e.name === "AbortError") return;
    fail(root, e);
  }
}
/* ============================================================
   PROJECT PAGE
   ============================================================ */
export async function project() {
  boot();
  const root = $("#app");
  if (!root) return;

  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    root.innerHTML = `<div class="empty">${t("nf")} <a class="btn" href="index.html">${t("home")}</a></div>`;
    return;
  }

  root.innerHTML = `<div class="empty">${t("load")}</div>`;

  const { data: p, error: pErr } = await sb
    .from("projects")
    .select(SEL + ",project_images(id,public_url,alt_en,alt_ar,sort_order,is_hero)")
    .eq("id", id)
    .maybeSingle();

  if (pErr || !p) {
    root.innerHTML = `<div class="empty">${t("nf")} <a class="btn" href="index.html">${t("home")}</a></div>`;
    return;
  }

  if (!Array.isArray(p.project_images)) p.project_images = [];
  if (!Array.isArray(p.project_technologies)) p.project_technologies = [];
  if (!Array.isArray(p.project_industries)) p.project_industries = [];

  track(p.id);

  let im = p.project_images.sort((a, b) => b.is_hero - a.is_hero || a.sort_order - b.sort_order);
  if (!im.length && p.cover_image) im = [{ public_url: p.cover_image }];

  const ti = L(p, "title");
  const tg = p.project_technologies.map((x) => x.technology);
  const ins = p.project_industries.map((x) => x.industry);

  seo(ti + " — Archai", L(p, "summary"), p.cover_image);

  const chips = (a) => a.map((x) => `<span class="badge">${esc(x)}</span>`).join("") || "—";

  root.innerHTML = `
    <nav class="crumb reveal" aria-label="Breadcrumb">
      <a href="index.html">${t("home")}</a> <span aria-hidden="true">›</span>
      ${p.categories ? esc(L(p.categories, "name")) + ' <span aria-hidden="true">›</span> ' : ""}
      <span>${esc(ti)}</span>
    </nav>
    <header class="reveal">
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem">
        <span class="badge c">${esc(L(p.categories, "name") || t("other"))}</span>
        ${p.featured ? `<span class="badge">★ ${t("feat")}</span>` : ""}
      </div>
      <h1 style="font-family:var(--font-display);font-size:var(--fs-3xl);font-weight:600;font-style:italic;letter-spacing:-.03em;line-height:1.08;margin:.4rem 0 1rem;max-width:24ch;text-wrap:balance">${esc(ti)}</h1>
      <p style="color:var(--ink-2);font-size:var(--fs-lg);max-width:60ch;line-height:1.7">${esc(L(p, "summary"))}</p>
      <div class="row">${live(p)}</div>
    </header>
    ${
      im.length
        ? `<section class="gal reveal" style="margin-top:var(--sp-6)">
            <div class="main" role="button" tabindex="0" aria-label="${t("details")}">
              <img id="mi" alt="${esc(ti)}">
              <button class="nv pv" aria-label="Previous" type="button">${PV}</button>
              <button class="nv nx" aria-label="Next" type="button">${NX}</button>
            </div>
            <div class="thumbs" role="tablist">
              ${im.map((x, j) => `<img loading="lazy" src="${esc(x.public_url)}" alt="${esc(L(x, "alt") || ti)}" tabindex="0" role="tab" data-j="${j}">`).join("")}
            </div>
          </section>`
        : ""
    }
    <div class="pg">
      <section class="box reveal">
        <h2 style="margin-top:0;font-family:var(--font-display);font-size:var(--fs-xl);font-weight:600;font-style:italic">${t("details")}</h2>
        <p class="pre">${esc(L(p, "description") || L(p, "summary"))}</p>
        <h3 style="font-family:var(--font-display);font-style:italic">${t("tech")}</h3>
        <div>${chips(tg)}</div>
        <h3 style="font-family:var(--font-display);font-style:italic">${t("ind")}</h3>
        <div>${chips(ins)}</div>
      </section>
      <aside class="reveal">
        <div class="box">
          <h3 style="margin-top:0;font-family:var(--font-display);font-style:italic">${t("info")}</h3>
          <p>${t("cat")}: <b>${esc(L(p.categories, "name") || "—")}</b><br>${t("status")}: <b>${esc(p.status)}</b></p>
        </div>
        ${
          p.live_url
            ? `<div class="box" style="margin-top:var(--sp-4)">
                <h3 style="margin-top:0;font-family:var(--font-display);font-style:italic">${t("tryT")}</h3>
                <p>${t("tryD")}</p>
                ${live(p)}
              </div>`
            : ""
        }
      </aside>
    </div>
    <h2 class="st reveal">${t("related")}</h2>
    <div class="grid stagger" id="rel"></div>
    <dialog id="lb" aria-label="Image viewer">
      <img id="li" alt="">
      <div class="row" style="justify-content:center;padding:14px">
        <button class="btn" id="lp" type="button" aria-label="Previous">${PV}</button>
        <button class="btn" id="ln" type="button" aria-label="Next">${NX}</button>
        <button class="btn" id="lf" type="button" aria-label="Fullscreen">⛶</button>
        <button class="btn" id="lc" type="button" aria-label="Close">✕</button>
      </div>
    </dialog>
  `;

  if (im.length) {
    let k = 0;
    let x0 = 0;
    const show = (n) => {
      k = (n + im.length) % im.length;
      const mi = $("#mi");
      const li = $("#li");
      if (mi) mi.src = im[k].public_url;
      if (li) li.src = im[k].public_url;
      $$(".thumbs img").forEach((e, j) => e.classList.toggle("on", j === k));
    };
    show(0);

    $$(".thumbs img").forEach((e) => {
      e.addEventListener("click", () => show(+e.dataset.j));
      e.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          show(+ev.dataset.j);
        }
      });
    });

    const bind = (sel, fn) => {
      const el = $(sel);
      if (el) el.addEventListener("click", fn);
    };
    bind(".gal .pv", () => show(k - 1));
    bind(".gal .nx", () => show(k + 1));
    bind("#lp", () => show(k - 1));
    bind("#ln", () => show(k + 1));
    bind("#lc", () => $("#lb").close());
    bind("#lf", () => $("#lb").requestFullscreen?.());
    bind("#mi", () => $("#lb").showModal());

    const main = $(".gal .main");
    if (main) {
      main.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          $("#lb").showModal();
        }
      });
      main.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
      main.addEventListener("touchend", (e) => {
        const d = e.changedTouches[0].clientX - x0;
        if (Math.abs(d) > 40) show(k + (d < 0 ? 1 : -1) * (lang === "ar" ? -1 : 1));
      });
    }
  }

  /* Related — filter by active category */
  const H = readCache("hm", 300000);
  let o;
  if (H) {
    o = H.projs.filter((x) => x && x.id !== p.id);
  } else {
    const r = await sb.from("projects").select(LIST).neq("id", p.id).limit(12);
    o = r.data;
  }
  const activeCatIds = new Set(
    (Array.isArray(o) ? o : [])
      .filter((x) => x.categories && x.categories.active !== false)
      .map((x) => String(x.category_id))
  );

  const sc = (x) =>
    (x.category_id && x.category_id === p.category_id ? 2 : 0) +
    (Array.isArray(x.project_technologies) ? x.project_technologies.filter((y) => tg.includes(y.technology)).length : 0) +
    (Array.isArray(x.project_industries) ? x.project_industries.filter((y) => ins.includes(y.industry)).length : 0);

  const related = (Array.isArray(o) ? o : [])
    .filter((x) => {
      if (!x || !x.id) return false;
      if (x.category_id && !activeCatIds.has(String(x.category_id))) return false;
      if (x.categories && x.categories.active === false) return false;
      return true;
    })
    .map((x) => [sc(x), x])
    .filter((a) => a[0] > 0)
    .sort((a, b) => b[0] - a[0])
    .slice(0, 3)
    .map((a) => a[1]);

  $("#rel").innerHTML = related.length
    ? related.map(card).join("")
    : `<div class="empty" style="grid-column:1/-1">${t("none")}</div>`;

  initScrollReveal();
  initButtonEffects();
}