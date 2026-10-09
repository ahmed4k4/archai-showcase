/* ============================================================
   Archai — admin.js v11 FINAL
   Full i18n + Bulletproof + Active filter + Media + Clean scroll
   ============================================================ */

import {
  sb,
  $,
  $$,
  esc,
  t,
  tt,
  boot,
  applyI18n,
  clearCache,
  withNoSmooth,
} from "./core.js";
import { BUCKET } from "./config.js";

boot();

/* ============================================================
   AUTH GUARD
   ============================================================ */
const bye = (q = "") => {
  location.replace("login.html" + q);
  throw 0;
};

const {
  data: { session },
} = await sb.auth.getSession();
if (!session) bye();

{
  const { data } = await sb
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();
  if (data?.role !== "admin") {
    await sb.auth.signOut();
    bye("?denied=1");
  }
}

/* ============================================================
   STATE & HELPERS
   ============================================================ */
let charts = [];
let cur = "overview";

const toast = (m, e) => {
  const d = document.createElement("div");
  d.id = "toast";
  d.textContent = m;
  if (e) d.style.borderColor = "var(--danger)";
  document.body.append(d);
  setTimeout(() => d.remove(), 3500);
};

const run = async (f) => {
  try {
    return await f();
  } catch (e) {
    console.error(e);
    toast(e.message || String(e), 1);
  }
};

const ok = (r) => {
  if (r.error) throw r.error;
  return r.data;
};

const fmt = (n) => (n ?? 0).toLocaleString();
const day = 864e5;

/* ---------- Slug helpers ---------- */
const slug = (s) => {
  const clean = String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || "item-" + Math.random().toString(36).slice(2, 8);
};

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const empty = (m) => `<div class="empty">${m}</div>`;

const safeStr = (v, fallback = "") =>
  v === null || v === undefined ? fallback : String(v);

const safeNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/* ============================================================
   FRESH VIEW
   ============================================================ */
function getView() {
  const old = document.getElementById("view");
  if (!old) {
    const fresh = document.createElement("div");
    fresh.id = "view";
    const mn = document.querySelector(".mn");
    if (mn) mn.appendChild(fresh);
    return fresh;
  }
  const fresh = old.cloneNode(false);
  old.replaceWith(fresh);
  return fresh;
}

/* ============================================================
   FORM BUILDER
   ============================================================ */
const form = (title, fields, v = {}, extra) => {
  const safe = (obj) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
    const out = {};
    try {
      for (const k in obj) {
        const val = obj[k];
        if (val === null || val === undefined) out[k] = val;
        else if (
          typeof val === "string" ||
          typeof val === "number" ||
          typeof val === "boolean"
        )
          out[k] = val;
      }
    } catch (e) {
      console.warn("[form] normalize failed:", e);
    }
    return out;
  };

  const V = safe(v);
  const safeFields = Array.isArray(fields) ? fields : [];

  const wantedKeys = new Set(
    safeFields.filter((f) => f && f.n).map((f) => f.n)
  );

  const cleanName = (n) => String(n || "").replace(/[^a-z0-9_-]/gi, "_");

  return new Promise((res) => {
    const d = document.createElement("dialog");
    d.className = "dlg";

    const inp = (f) => {
      if (!f || typeof f !== "object") return "";
      if (f.sec) {
        const secKey = f.sec;
        const secLabel = t(secKey) !== secKey ? t(secKey) : f.sec;
        return `<h4 class="sec">${esc(secLabel)}</h4>`;
      }
      if (f.x) return "";

      const cls = `${f.t === "checkbox" ? "ck " : ""}${f.w || ""}`.trim();
      const name = cleanName(f.n);
      const labelText = f.i18n
        ? t(f.i18n)
        : t(f.l) !== f.l
        ? t(f.l)
        : f.l || "";

      if (f.t === "checkbox") {
        return `<label class="${cls}">
          <input type="checkbox" name="${name}">
          <span>${esc(labelText)}</span>
        </label>`;
      }

      const attrs = `${f.r ? "required" : ""} ${
        f.ph ? `placeholder="${esc(f.ph)}"` : ""
      }`;

      if (f.t === "textarea") {
        return `<label class="${cls}">
          ${esc(labelText)}
          <textarea name="${name}" rows="4" ${attrs}></textarea>
        </label>`;
      }

      if (f.t === "select") {
        const opts = Array.isArray(f.o) ? f.o : [];
        return `<label class="${cls}">
          ${esc(labelText)}
          <select name="${name}">
            ${opts
              .map((o) => {
                const val = Array.isArray(o) ? o[0] : "";
                let lbl = Array.isArray(o) ? o[1] : o;
                if (typeof lbl === "string") {
                  const tr = t(lbl.toLowerCase());
                  if (tr !== lbl.toLowerCase()) lbl = tr;
                }
                return `<option value="${esc(val)}">${esc(lbl)}</option>`;
              })
              .join("")}
          </select>
        </label>`;
      }

      return `<label class="${cls}">
        ${esc(labelText)}
        <input name="${name}" type="${f.t || "text"}" ${attrs}>
      </label>`;
    };

    const hasExtra = typeof extra === "function";

    d.innerHTML = `
      <form id="dlgForm">
        <h3>${esc(title || "")}</h3>
        <div class="fg">${safeFields.map(inp).join("")}</div>
        ${
          hasExtra
            ? '<div id="xt"><div class="xt-loading"><span class="spinner"></span> ' +
              (t("loading") || "Loading…") +
              "</div></div>"
            : ""
        }
        <div class="fa">
          <button type="button" class="btn" id="cx">${t("cancel")}</button>
          <button class="btn p" type="submit">${t("save")}</button>
        </div>
      </form>`;

    document.body.append(d);
    const F = d.querySelector("#dlgForm");
    if (!F) {
      console.warn("[form] form element not found");
      res(null);
      return;
    }

    /* ---------- FILL INITIAL VALUES ---------- */
    safeFields.forEach((f) => {
      if (!f || !f.n) return;
      const name = cleanName(f.n);

      let el = null;
      try {
        el = F.elements[name];
      } catch {
        return;
      }

      if (
        el &&
        typeof el === "object" &&
        typeof el.length === "number" &&
        !("value" in el)
      ) {
        el = el[0] || null;
      }

      if (!el || typeof el !== "object") return;

      const val = V[f.n] !== undefined ? V[f.n] : V[name];

      try {
        if (f.t === "checkbox") {
          el.checked = !!val;
        } else if ("value" in el) {
          el.value =
            val === null || val === undefined
              ? ""
              : typeof val === "string"
              ? val
              : String(val);
        }
      } catch (e) {
        console.warn("[form] set failed:", name, e);
      }
    });

    const close = (r) => {
      try {
        res(r);
        if (d.open) d.close();
        d.remove();
      } catch (e) {
        console.warn("[form] close failed:", e);
      }
    };

    d.onclose = () => res(null);

    const cx = d.querySelector("#cx");
    if (cx) cx.onclick = () => close(null);

    d.addEventListener("click", (e) => {
      const r = d.getBoundingClientRect();
      const inDialog =
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom;
      if (!inDialog) close(null);
    });

    /* ---------- SUBMIT ---------- */
    F.onsubmit = (e) => {
      e.preventDefault();
      const o = {};
      safeFields.forEach((f) => {
        if (!f || !f.n) return;
        if (!wantedKeys.has(f.n)) return;

        const name = cleanName(f.n);
        let el = null;
        try {
          el = F.elements[name];
        } catch {
          return;
        }
        if (
          el &&
          typeof el === "object" &&
          typeof el.length === "number" &&
          !("value" in el)
        ) {
          el = el[0] || null;
        }
        if (!el) {
          if (f.t === "checkbox") o[f.n] = false;
          else if (f.t === "number") o[f.n] = 0;
          else o[f.n] = f.nul ? null : "";
          return;
        }
        try {
          if (f.t === "checkbox") o[f.n] = !!el.checked;
          else if (f.t === "number") o[f.n] = Number(el.value || 0);
          else {
            const v = String(el.value ?? "").trim();
            o[f.n] = v || (f.nul ? null : "");
          }
        } catch {
          o[f.n] = f.nul ? null : "";
        }
      });

      if (wantedKeys.has("tech") && typeof o.tech !== "string") o.tech = "";
      if (wantedKeys.has("ind") && typeof o.ind !== "string") o.ind = "";

      close(o);
    };

    d.showModal();

    requestAnimationFrame(() => {
      try {
        const first = F.querySelector(
          "input:not([type=checkbox]),select,textarea"
        );
        if (first) first.focus({ preventScroll: true });
      } catch {}
    });

    if (hasExtra) {
      const xt = d.querySelector("#xt");
      try {
        extra(xt, V);
      } catch (e) {
        console.warn("[form] extra failed:", e);
        if (xt) xt.innerHTML = `<div class="empty">${e.message}</div>`;
      }
    }
  });
};

/* ============================================================
   IMAGE PACK
   ============================================================ */
async function pack(f, max = 1400, q = 0.8) {
  const b = await createImageBitmap(f);
  const s = Math.min(1, max / Math.max(b.width, b.height));
  const c = document.createElement("canvas");
  c.width = Math.round(b.width * s);
  c.height = Math.round(b.height * s);
  c.getContext("2d").drawImage(b, 0, 0, c.width, c.height);
  return new Promise((r) => c.toBlob(r, "image/webp", q));
}

/* ============================================================
   MEDIA MANAGER
   ============================================================ */
const ROLE = {
  cover: ["is_cover", "cover_image"],
  featured: ["is_featured", "featured_image"],
  hero: ["is_hero", "hero_image"],
};

async function media(box, pid) {
  if (!box) return;

  let im = [];

  const setRole = async (img, key) => {
    const [col, projectCol] = ROLE[key];
    ok(
      await sb
        .from("project_images")
        .update({ [col]: false })
        .eq("project_id", pid)
    );
    ok(
      await sb.from("project_images").update({ [col]: true }).eq("id", img.id)
    );
    ok(
      await sb
        .from("projects")
        .update({ [projectCol]: img.public_url })
        .eq("id", pid)
    );
    /* card thumbnail (ignored silently if the migration hasn't been run yet) */
    if (key === "cover") {
      await sb.from("projects").update({ cover_thumb: img.thumb_url || null }).eq("id", pid);
    }
    clearCache();
  };

  const draw = async () => {
    try {
      const raw = ok(
        await sb
          .from("project_images")
          .select("*")
          .eq("project_id", pid)
          .order("sort_order")
      );
      im = Array.isArray(raw) ? raw.filter((x) => x && x.id) : [];
    } catch (e) {
      console.warn("[media] fetch failed:", e);
      im = [];
    }

    box.innerHTML = `
      <div class="xt-header">
        <div class="xt-title">
          <span style="font-size:1.2rem">📸</span>
          <h4>${t("media")}</h4>
        </div>
        <span class="xt-count">${tt("mediaCount", { n: im.length })}</span>
      </div>

      <label class="drop" id="dz">
        <input type="file" id="fi" accept="image/*" multiple hidden>
        <div class="drop-icon">☁</div>
        <div class="drop-title">${t("dropImages")}</div>
        <div class="drop-hint">${t("dropHint")}</div>
      </label>

      ${
        im.length
          ? `<div class="imgs" style="margin-top:16px">
              ${im
                .map(
                  (i) => `
                <figure data-id="${esc(i.id)}" class="${
                    i.is_cover || i.is_hero || i.is_featured
                      ? "has-role"
                      : ""
                  }">
                  <img src="${esc(i.public_url || "")}" alt="" loading="lazy">
                  ${
                    i.is_cover || i.is_hero || i.is_featured
                      ? `<div class="img-badges">
                          ${
                            i.is_cover
                              ? `<span class="img-badge">C</span>`
                              : ""
                          }
                          ${
                            i.is_hero
                              ? `<span class="img-badge h">H</span>`
                              : ""
                          }
                          ${
                            i.is_featured
                              ? `<span class="img-badge f">F</span>`
                              : ""
                          }
                        </div>`
                      : ""
                  }
                  <div class="img-actions">
                    ${Object.keys(ROLE)
                      .map(
                        (k) =>
                          `<button type="button" class="btn s ${
                            i[ROLE[k][0]] ? "on" : ""
                          }" data-r="${k}" title="${t(k)}">${t(k)[0].toUpperCase()}</button>`
                      )
                      .join("")}
                    <button type="button" class="btn s d" data-x="1" title="${t(
                      "delete"
                    )}">✕</button>
                  </div>
                </figure>`
                )
                .join("")}
            </div>`
          : `<div class="xt-empty">${
              t("noImages") || "لا توجد صور بعد — اسحب الصور للأعلى"
            }</div>`
      }
    `;

    const up = async (files) => {
      await run(async () => {
        const arr = [...files].filter((f) => f.type.startsWith("image/"));
        if (!arr.length) {
          toast(t("noValidImages") || "لا توجد صور صالحة", 1);
          return;
        }
        let n = 0;
        for (const f of arr) {
          toast(`${t("uploading")} ${++n}/${arr.length}`);
          const [b, tb] = await Promise.all([pack(f), pack(f, 480, 0.72)]);
          const uid = crypto.randomUUID();
          const path = `${pid}/${uid}.webp`;
          const tpath = `${pid}/t_${uid}.webp`;
          const opt = { contentType: "image/webp", cacheControl: "31536000" };
          const [s, ts] = await Promise.all([
            sb.storage.from(BUCKET).upload(path, b, opt),
            sb.storage.from(BUCKET).upload(tpath, tb, opt),
          ]);
          if (s.error) throw s.error;
          if (ts.error) throw ts.error;
          const pu = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
          const tu = sb.storage.from(BUCKET).getPublicUrl(tpath).data.publicUrl;
          const base = {
            project_id: pid,
            storage_path: path,
            public_url: pu,
            sort_order: im.length + n,
          };
          let ins = await sb
            .from("project_images")
            .insert({ ...base, thumb_path: tpath, thumb_url: tu })
            .select()
            .single();
          /* migration not run yet -> fall back to the old columns */
          if (ins.error && /thumb_/.test(ins.error.message || "")) {
            ins = await sb.from("project_images").insert(base).select().single();
          }
          const row = ok(ins);
          if (!im.length && n === 1) {
            for (const k in ROLE) await setRole(row, k);
          }
        }
        toast(t("uploaded"));
        clearCache();
        await draw();
      });
    };

    const fi = box.querySelector("#fi");
    if (fi) fi.onchange = (e) => up(e.target.files);

    const dz = box.querySelector("#dz");
    if (dz) {
      dz.ondragover = (e) => {
        e.preventDefault();
        dz.classList.add("dragover");
      };
      dz.ondragleave = () => dz.classList.remove("dragover");
      dz.ondrop = (e) => {
        e.preventDefault();
        dz.classList.remove("dragover");
        up(e.dataTransfer.files);
      };
    }

    box.onclick = (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const fig = b.closest("figure");
      if (!fig) return;
      const i = im.find((x) => String(x.id) === String(fig.dataset.id));
      if (!i) return;
      run(async () => {
        if (b.dataset.r) {
          await setRole(i, b.dataset.r);
          clearCache();
        } else if (b.dataset.x && confirm(t("confirmDelete"))) {
          await sb.storage.from(BUCKET).remove([i.storage_path, i.thumb_path].filter(Boolean));
          ok(await sb.from("project_images").delete().eq("id", i.id));
          const u = {};
          for (const k in ROLE) {
            if (i[ROLE[k][0]]) u[ROLE[k][1]] = null;
          }
          if (Object.keys(u).length) {
            ok(await sb.from("projects").update(u).eq("id", pid));
          }
          if (i.is_cover) await sb.from("projects").update({ cover_thumb: null }).eq("id", pid);
          clearCache();
        }
        await draw();
      });
    };
  };

  await run(draw);
}

/* ============================================================
   PROJECT EDITOR
   ============================================================ */
async function editProject(id) {
  let cats = [];
  try {
    const raw = ok(
      await sb
        .from("categories")
        .select("id,name_en,name_ar")
        .order("sort_order")
    );
    cats = Array.isArray(raw)
      ? raw.filter((c) => c && typeof c === "object" && c.id)
      : [];
  } catch (e) {
    console.warn("[editProject] categories failed:", e);
    cats = [];
  }

  const BASE = {
    id: id || crypto.randomUUID(),
    title_en: "",
    title_ar: "",
    slug: "",
    category_id: "",
    status: "draft",
    sort_order: 0,
    summary_en: "",
    summary_ar: "",
    description_en: "",
    description_ar: "",
    live_url: "",
    featured: false,
    featured_sort_order: 0,
    cover_image: null,
    hero_image: null,
    featured_image: null,
    tech: "",
    ind: "",
  };

  let v = { ...BASE };
  const exists = !!id;

  if (id) {
    try {
      const row = ok(
        await sb
          .from("projects")
          .select(
            "*,project_technologies(technology),project_industries(industry)"
          )
          .eq("id", id)
          .single()
      );

      if (row && typeof row === "object") {
        Object.keys(BASE).forEach((k) => {
          if (k === "tech" || k === "ind") return;
          const val = row[k];
          if (val === null || val === undefined) return;
          if (
            typeof val === "string" ||
            typeof val === "number" ||
            typeof val === "boolean"
          ) {
            v[k] = val;
          }
        });

        v.tech = Array.isArray(row.project_technologies)
          ? row.project_technologies
              .filter((x) => x && x.technology)
              .map((x) => String(x.technology))
              .join(", ")
          : "";

        v.ind = Array.isArray(row.project_industries)
          ? row.project_industries
              .filter((x) => x && x.industry)
              .map((x) => String(x.industry))
              .join(", ")
          : "";
      }
    } catch (e) {
      console.error("[editProject] fetch failed:", e);
      toast(t("err") || "Error", 1);
      return;
    }
  }

  const pid = v.id;

  const catOptions = [["", "—"]];
  cats.forEach((c) => {
    if (!c || !c.id) return;
    const label =
      c.name_en || c.name_ar || "Category-" + String(c.id).slice(0, 6);
    catOptions.push([c.id, label]);
  });

  const F = [
    { sec: "general" },
    { n: "title_en", l: "titleEn", i18n: "titleEn", r: 1 },
    { n: "title_ar", l: "titleAr", i18n: "titleAr", r: 1 },
    { n: "slug", l: "slug", i18n: "slug", ph: "smart-home-controller" },
    {
      n: "category_id",
      l: "category",
      i18n: "category",
      t: "select",
      nul: 1,
      o: catOptions,
    },
    {
      n: "status",
      l: "status",
      i18n: "status",
      t: "select",
      o: [
        ["draft", "Draft"],
        ["published", "Published"],
        ["archived", "Archived"],
      ],
    },
    { n: "sort_order", l: "sortOrder", i18n: "sortOrder", t: "number" },

    { sec: "content" },
    {
      n: "summary_en",
      l: "summaryEn",
      i18n: "summaryEn",
      t: "textarea",
      w: "full",
      r: 1,
    },
    {
      n: "summary_ar",
      l: "summaryAr",
      i18n: "summaryAr",
      t: "textarea",
      w: "full",
      r: 1,
    },
    {
      n: "description_en",
      l: "descriptionEn",
      i18n: "descriptionEn",
      t: "textarea",
      w: "full",
    },
    {
      n: "description_ar",
      l: "descriptionAr",
      i18n: "descriptionAr",
      t: "textarea",
      w: "full",
    },

    { sec: "techInd" },
    {
      n: "tech",
      l: "tech",
      i18n: "tech",
      w: "full",
      ph: "React, Node.js, PostgreSQL",
    },
    {
      n: "ind",
      l: "ind",
      i18n: "ind",
      w: "full",
      ph: "E-commerce, Healthcare, Fintech",
    },

    { sec: "publishing" },
    {
      n: "live_url",
      l: "liveUrl",
      i18n: "liveUrl",
      t: "url",
      nul: 1,
      w: "full",
    },
    {
      n: "featured",
      l: "featuredChk",
      i18n: "featuredChk",
      t: "checkbox",
      w: "full",
    },
    {
      n: "featured_sort_order",
      l: "featuredOrder",
      i18n: "featuredOrder",
      t: "number",
    },
    { x: 1 },
  ];

  const validate = (o) => {
    if (!o.slug || !String(o.slug).trim()) {
      o.slug = slug(o.title_en || o.title_ar || "");
    }
    if (!SLUG.test(o.slug)) {
      o.slug = slug(o.slug || o.title_en || o.title_ar || "");
      if (!SLUG.test(o.slug)) {
        return "Invalid slug — use a-z, 0-9 and hyphens";
      }
    }
    if (o.live_url) {
      try {
        if (!/^https?:$/.test(new URL(o.live_url).protocol)) throw 0;
      } catch {
        return "Live URL must start with http:// or https://";
      }
    }
  };

  const syncTagsSafe = async (tb, col, str) => {
    try {
      await sb.from(tb).delete().eq("project_id", pid);
    } catch (e) {
      console.warn(`[syncTags] delete failed for ${tb}:`, e);
    }

    const safe = String(str ?? "");
    const seen = new Set();
    const cleaned = [];

    for (const raw of safe.split(",")) {
      let item = raw.trim();
      if (!item) continue;
      if (item.length > 60) item = item.slice(0, 60).trim();
      if (!item) continue;
      const key = item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cleaned.push(item);
    }

    if (!cleaned.length) return;

    const rows = cleaned.map((x) => ({ project_id: pid, [col]: x }));
    const res = await sb.from(tb).insert(rows);
    if (res.error) {
      console.error(`[syncTags] ${tb} bulk insert failed:`, res.error);
      for (const row of rows) {
        const single = await sb.from(tb).insert(row);
        if (single.error) {
          console.warn(`[syncTags] skip "${row[col]}":`, single.error.message);
        }
      }
    }
  };

  for (;;) {
    const o = await form(
      exists ? t("editProject") : t("newProject"),
      F,
      v,
      exists
        ? (box, values) => media(box, pid, values)
        : (box) => {
            box.innerHTML = `
              <div class="xt-header">
                <div class="xt-title">
                  <span style="font-size:1.2rem">📸</span>
                  <h4>${t("media")}</h4>
                </div>
              </div>
              <div class="xt-empty" style="padding:var(--sp-6);text-align:center;color:var(--ink-3);border:1px dashed var(--line-2);border-radius:var(--r-lg);background:rgba(255,140,66,0.03)">
                <div style="font-size:2rem;opacity:0.5;margin-bottom:8px">🖼</div>
                <div style="font-weight:600;color:var(--ink-1)">${
                  t("saveFirstTitle") || "احفظ المشروع أولاً"
                }</div>
                <div style="font-size:var(--fs-sm);margin-top:6px">${
                  t("saveFirstDesc") || "بعد الحفظ، أعد فتح المشروع لرفع الصور."
                }</div>
              </div>`;
          }
    );

    if (!o) return;

    if (typeof o.tech !== "string") o.tech = "";
    if (typeof o.ind !== "string") o.ind = "";

    let err = validate(o);

    if (!err) {
      try {
        const { tech, ind, ...rec } = o;
        rec.id = pid;

        const ALLOWED = [
          "id",
          "slug",
          "title_en",
          "title_ar",
          "summary_en",
          "summary_ar",
          "description_en",
          "description_ar",
          "live_url",
          "category_id",
          "status",
          "sort_order",
          "featured",
          "featured_sort_order",
          "cover_image",
          "hero_image",
          "featured_image",
        ];
        const cleanRec = {};
        ALLOWED.forEach((k) => {
          if (k in rec) cleanRec[k] = rec[k];
        });

        if (!cleanRec.slug)
          cleanRec.slug = slug(cleanRec.title_en || cleanRec.title_ar || "");
        if (!cleanRec.title_en)
          cleanRec.title_en = cleanRec.title_ar || "Untitled";
        if (!cleanRec.title_ar)
          cleanRec.title_ar = cleanRec.title_en || "بدون عنوان";
        if (!cleanRec.summary_en) cleanRec.summary_en = "";
        if (!cleanRec.summary_ar) cleanRec.summary_ar = "";

        const upsertRes = await sb.from("projects").upsert(cleanRec).select();
        if (upsertRes.error) throw upsertRes.error;

        await syncTagsSafe("project_technologies", "technology", tech);
        await syncTagsSafe("project_industries", "industry", ind);

        clearCache();
        toast(t("saved"));

        if (!exists) {
          await editProject(pid);
          return;
        }
        break;
      } catch (e) {
        console.error("[editProject] save failed:", e);
        err = e.message || String(e);
      }
    }

    toast(err, 1);
    v = { ...v, ...o };
  }

  await tabs[cur]();
}

/* ============================================================
   PROJECTS TAB
   ============================================================ */
async function projects() {
  const V = getView();

  let ps = [];
  let vc = [];

  try {
    const [r1, r2] = await Promise.all([
      sb
        .from("projects")
        .select(
          "id,slug,status,sort_order,title_en,featured,updated_at,categories(name_en)"
        )
        .order("sort_order"),
      sb.from("project_view_counts").select("*"),
    ]);

    if (r1 && !r1.error && Array.isArray(r1.data)) {
      ps = r1.data.filter((p) => p && p.id);
    }
    if (r2 && !r2.error && Array.isArray(r2.data)) {
      vc = r2.data.filter((x) => x && x.project_id);
    }
  } catch (e) {
    console.warn("[projects] fetch failed:", e);
  }

  if (!Array.isArray(ps)) ps = [];
  if (!Array.isArray(vc)) vc = [];

  const vm = Object.fromEntries(vc.map((x) => [x.project_id, x]));

  V.innerHTML = `
    <div class="bar">
      <button class="btn p" data-a="new" style="flex:0;white-space:nowrap">+ ${t(
        "newProject"
      )}</button>
    </div>
    ${
      ps.length
        ? `<div class="tw"><table>
            <thead><tr>
              <th>#</th><th>${t("projects")}</th><th>${t(
            "category"
          )}</th><th>${t("status")}</th>
              <th>${t("views")}</th><th>${t(
            "featuredCount"
          )}</th><th>${t("sortOrder")}</th><th>${t("edit")}</th>
            </tr></thead>
            <tbody>
              ${ps
                .map((p) => {
                  const pid = p?.id || "";
                  const title = p?.title_en || "—";
                  const pSlug = p?.slug || "";
                  const catName = p?.categories?.name_en || "—";
                  const status = p?.status || "draft";
                  const views = vm[pid]?.views;
                  const uniq = vm[pid]?.unique_visitors;
                  const featured = p?.featured ? "★" : "—";
                  const updated = p?.updated_at
                    ? new Date(p.updated_at).toLocaleDateString()
                    : "—";
                  const order = p?.sort_order ?? 0;

                  return `
                <tr data-id="${esc(pid)}">
                  <td><input class="so" type="number" value="${order}" aria-label="Sort"></td>
                  <td><b>${esc(title)}</b><br><small>${esc(pSlug)}</small></td>
                  <td>${esc(catName)}</td>
                  <td><span class="badge ${
                    status == "published" ? "" : "c"
                  }">${esc(status)}</span></td>
                  <td>${fmt(views)} <small>(${fmt(uniq)})</small></td>
                  <td>${featured}</td>
                  <td>${updated}</td>
                  <td>
                    <div class="row" style="margin:0">
                      <button class="btn s" data-a="edit" data-id="${esc(
                        pid
                      )}">${t("edit")}</button>
                      <button class="btn s" data-a="view" data-id="${esc(
                        pid
                      )}">${t("view")}</button>
                      <button class="btn s" data-a="stats" data-id="${esc(
                        pid
                      )}">${t("stats")}</button>
                      <button class="btn s" data-a="dup" data-id="${esc(
                        pid
                      )}">${t("duplicate")}</button>
                      <button class="btn s" data-a="pub" data-id="${esc(pid)}">${
                    status == "published" ? t("unpublish") : t("publish")
                  }</button>
                      <button class="btn s d" data-a="del" data-id="${esc(
                        pid
                      )}">${t("delete")}</button>
                    </div>
                  </td>
                </tr>`;
                })
                .join("")}
            </tbody>
          </table></div>`
        : empty(t("noProjects"))
    }`;

  V.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;

    const action = b.dataset.a;

    if (action === "new") {
      run(() => editProject());
      return;
    }

    const id = b.dataset.id;
    if (!id) return;

    const p = ps.find((x) => String(x.id) === String(id));
    if (!p) {
      console.warn("[projects] not found:", id);
      toast("Project not found", 1);
      return;
    }

    run(async () => {
      switch (action) {
        case "edit":
          return editProject(id);

        case "view":
          return window.open("project.html?id=" + id, "_blank");

        case "pub":
          ok(
            await sb
              .from("projects")
              .update({
                status: p.status == "published" ? "draft" : "published",
              })
              .eq("id", id)
          );
          clearCache();
          toast(p.status == "published" ? t("unpublished") : t("published"));
          break;

        case "dup": {
          const f = ok(
            await sb
              .from("projects")
              .select(
                "*,project_technologies(technology),project_industries(industry)"
              )
              .eq("id", id)
              .single()
          );
          const n = {
            ...f,
            id: crypto.randomUUID(),
            slug:
              (f.slug || "project") +
              "-copy-" +
              Math.random().toString(36).slice(2, 6),
            status: "draft",
            featured: false,
            cover_image: null,
            hero_image: null,
            featured_image: null,
          };
          [
            "project_technologies",
            "project_industries",
            "created_at",
            "updated_at",
          ].forEach((k) => delete n[k]);
          ok(await sb.from("projects").insert(n));
          const tch = (f.project_technologies || []).map((x) => ({
            project_id: n.id,
            technology: x.technology,
          }));
          const ind = (f.project_industries || []).map((x) => ({
            project_id: n.id,
            industry: x.industry,
          }));
          if (tch.length)
            ok(await sb.from("project_technologies").insert(tch));
          if (ind.length) ok(await sb.from("project_industries").insert(ind));
          clearCache();
          toast(t("duplicated"));
          break;
        }

        case "del": {
          if (!confirm(t("confirmDeleteProject"))) return;
          const im = ok(
            await sb
              .from("project_images")
              .select("*")
              .eq("project_id", id)
          );
          if (Array.isArray(im) && im.length)
            await sb.storage.from(BUCKET).remove(im.flatMap((x) => [x.storage_path, x.thumb_path]).filter(Boolean));
          ok(await sb.from("projects").delete().eq("id", id));
          clearCache();
          toast(t("deleted"));
          break;
        }

        case "stats": {
          const r = ok(
            await sb.rpc("project_analytics", {
              p_project: id,
              p_from: "2000-01-01",
              p_to: new Date().toISOString(),
            })
          );
          alert(
            `${p.title_en || "Project"}\n${t("views")}: ${r.views}\n${t(
              "uniqueVisitors"
            )}: ${r.unique_visitors}`
          );
          return;
        }
      }

      await projects();
    });
  });

  V.addEventListener("change", (e) => {
    if (!e.target.classList.contains("so")) return;
    const id = e.target.closest("tr")?.dataset.id;
    if (!id) return;
    run(async () => {
      ok(
        await sb
          .from("projects")
          .update({ sort_order: Number(e.target.value) || 0 })
          .eq("id", id)
      );
      clearCache();
      toast(t("orderSaved"));
    });
  });
}

/* ============================================================
   CATEGORIES TAB
   ============================================================ */
async function categories() {
  const V = getView();

  let cs = [];

  try {
    const { data, error } = await sb
      .from("categories")
      .select("id,name_en,name_ar,slug,icon,sort_order,active")
      .order("sort_order");

    if (!error && Array.isArray(data)) {
      cs = data
        .filter((c) => c && typeof c === "object" && c.id)
        .map((c) => ({
          id: String(c.id),
          name_en:
            safeStr(c.name_en).trim() ||
            `Category-${String(c.id).slice(0, 6)}`,
          name_ar:
            safeStr(c.name_ar).trim() || safeStr(c.name_en).trim() || "—",
          slug: safeStr(c.slug).trim() || slug(c.name_en || "category"),
          icon: safeStr(c.icon).trim(),
          sort_order: safeNum(c.sort_order, 0),
          active: Boolean(c.active),
        }));
    }
  } catch (e) {
    console.warn("[categories] fetch failed:", e);
  }

  if (!Array.isArray(cs)) cs = [];

  V.innerHTML = `
    <div class="bar">
      <button class="btn p" data-a="new" style="flex:0;white-space:nowrap">+ ${t(
        "newCategory"
      )}</button>
    </div>
    ${
      cs.length
        ? `<div class="tw"><table>
            <thead><tr>
              <th>#</th><th>${t("nameEn")}</th><th>${t("nameAr")}</th>
              <th>${t("slug")}</th><th>${t("active")}</th><th>${t("edit")}</th>
            </tr></thead>
            <tbody>
              ${cs
                .map(
                  (c) => `
                <tr data-id="${esc(c.id)}" data-active="${
                    c.active
                  }" class="${c.active ? "" : "row-inactive"}">
                  <td><input class="so" type="number" value="${
                    c.sort_order
                  }" aria-label="Sort"></td>
                  <td>${esc(c.icon)} ${esc(c.name_en)}</td>
                  <td>${esc(c.name_ar)}</td>
                  <td>${esc(c.slug)}</td>
                  <td>
                    <label class="switch" title="${t("activeHint")}">
                      <input type="checkbox" class="ac" ${
                        c.active ? "checked" : ""
                      } aria-label="Active">
                      <span class="switch-track"><span class="switch-thumb"></span></span>
                      <span class="switch-label">${
                        c.active ? t("active") : t("inactive") || "معطل"
                      }</span>
                    </label>
                  </td>
                  <td>
                    <div class="row" style="margin:0">
                      <button class="btn s" data-a="edit" data-id="${esc(
                        c.id
                      )}">${t("edit")}</button>
                      <button class="btn s d" data-a="del" data-id="${esc(
                        c.id
                      )}">${t("delete")}</button>
                    </div>
                  </td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table></div>`
        : empty(t("noCategories"))
    }`;

  const edit = async (c) => {
    const BASE = {
      id: c?.id || null,
      name_en: "",
      name_ar: "",
      slug: "",
      icon: "",
      description_en: "",
      description_ar: "",
      sort_order: cs.length + 1,
      active: true,
    };

    const v0 = { ...BASE };
    if (c && typeof c === "object") {
      Object.keys(BASE).forEach((k) => {
        if (k === "id") return;
        const val = c[k];
        if (val === null || val === undefined) return;
        if (
          typeof val === "string" ||
          typeof val === "number" ||
          typeof val === "boolean"
        ) {
          v0[k] = val;
        }
      });
    }

    let v = v0;

    for (;;) {
      const o = await form(
        c ? t("editCategory") : t("newCategory"),
        [
          { n: "name_en", l: "nameEn", i18n: "nameEn", r: 1 },
          { n: "name_ar", l: "nameAr", i18n: "nameAr", r: 1 },
          { n: "slug", l: "slug", i18n: "slug", ph: "web-projects" },
          { n: "icon", l: "icon", i18n: "icon", nul: 1 },
          {
            n: "description_en",
            l: "descriptionEn",
            i18n: "descriptionEn",
            nul: 1,
            w: "full",
          },
          {
            n: "description_ar",
            l: "descriptionAr",
            i18n: "descriptionAr",
            nul: 1,
            w: "full",
          },
          { n: "sort_order", l: "sortOrder", i18n: "sortOrder", t: "number" },
          { n: "active", l: "activeHint", i18n: "activeHint", t: "checkbox" },
        ],
        v
      );

      if (!o) return;

      const ALLOWED = [
        "name_en",
        "name_ar",
        "slug",
        "icon",
        "description_en",
        "description_ar",
        "sort_order",
        "active",
      ];
      const clean = {};
      ALLOWED.forEach((k) => {
        if (k in o) clean[k] = o[k];
      });

      if (!clean.slug || !String(clean.slug).trim()) {
        clean.slug = slug(clean.name_en || clean.name_ar || "");
      }

      if (!SLUG.test(clean.slug)) {
        clean.slug = slug(clean.slug || clean.name_en || clean.name_ar || "");
        if (!SLUG.test(clean.slug)) {
          toast("Invalid slug — use a-z, 0-9 and hyphens", 1);
          v = { ...v, ...o };
          continue;
        }
      }

      if (!clean.name_en) clean.name_en = clean.name_ar || "Category";
      if (!clean.name_ar) clean.name_ar = clean.name_en || "قسم";

      try {
        if (c && c.id) {
          const res = await sb
            .from("categories")
            .update(clean)
            .eq("id", c.id);
          if (res.error) throw res.error;
        } else {
          const res = await sb.from("categories").insert(clean);
          if (res.error) throw res.error;
        }
        clearCache();
        toast(t("saved"));
        return;
      } catch (e) {
        console.error("[categories] save failed:", e);
        toast(e.message || String(e), 1);
        v = { ...v, ...o };
      }
    }
  };

  V.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;

    const action = b.dataset.a;

    if (action === "new") {
      run(() => edit());
      return;
    }

    const id = b.dataset.id;
    if (!id) return;

    const c = cs.find((x) => String(x.id) === String(id));
    if (!c) {
      console.warn("[categories] not found:", id);
      toast("Category not found", 1);
      return;
    }

    run(async () => {
      if (action === "edit") {
        await edit(c);
      } else if (action === "del") {
        if (!confirm(t("confirmDeleteCategory"))) return;
        const res = await sb.from("categories").delete().eq("id", id);
        if (res.error) throw res.error;
        clearCache();
        toast(t("deleted"));
      } else {
        return;
      }
      await categories();
    });
  });

  V.addEventListener("change", async (e) => {
    const k = e.target;
    const tr = k.closest("tr");
    if (!tr) return;
    const id = tr.dataset.id;
    if (!id) return;

    const isSort = k.classList.contains("so");
    const isActive = k.classList.contains("ac");
    if (!isSort && !isActive) return;

    if (isActive) {
      const label = tr.querySelector(".switch-label");
      const newVal = k.checked;

      tr.dataset.active = newVal ? "true" : "false";
      tr.classList.toggle("row-inactive", !newVal);
      if (label)
        label.textContent = newVal ? t("active") : t("inactive") || "معطل";

      run(async () => {
        const res = await sb
          .from("categories")
          .update({ active: newVal })
          .eq("id", id)
          .select("id");
        /* RLS can reject an update silently (0 rows, no error) - surface it */
        if (!res.error && (!res.data || res.data.length === 0)) {
          res.error = new Error("لم يتم الحفظ — سجّل الدخول كأدمن / Not saved: admin login required");
        }
        if (res.error) {
          k.checked = !newVal;
          tr.dataset.active = !newVal ? "true" : "false";
          tr.classList.toggle("row-inactive", newVal);
          if (label)
            label.textContent = !newVal
              ? t("active")
              : t("inactive") || "معطل";
          throw res.error;
        }

        const item = cs.find((x) => String(x.id) === String(id));
        if (item) item.active = newVal;

        clearCache();

        toast(
          newVal
            ? t("activated") || "تم التفعيل ✓"
            : t("deactivated") || "تم التعطيل ✓"
        );
      });
      return;
    }

    if (isSort) {
      run(async () => {
        const res = await sb
          .from("categories")
          .update({ sort_order: Number(k.value) || 0 })
          .eq("id", id);
        if (res.error) throw res.error;
        clearCache();
        toast(t("orderSaved"));
      });
    }
  });
}

/* ============================================================
   ANALYTICS TAB
   ============================================================ */
const rng = (k) => {
  const n = new Date();
  const s = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  return {
    today: [s, n],
    yesterday: [new Date(+s - day), s],
    7: [new Date(+s - 6 * day), n],
    30: [new Date(+s - 29 * day), n],
    90: [new Date(+s - 89 * day), n],
    year: [new Date(n.getFullYear(), 0, 1), n],
  }[k];
};

async function analytics() {
  const V = getView();

  V.innerHTML = `
    <div class="bar">
      <select id="rk">
        <option value="today">${t("today")}</option>
        <option value="yesterday">${t("yesterday")}</option>
        <option value="7">${t("last7")}</option>
        <option value="30" selected>${t("last30")}</option>
        <option value="90">${t("last90")}</option>
        <option value="year">${t("thisYear")}</option>
        <option value="all">${t("allTime")}</option>
        <option value="custom">${t("custom")}</option>
      </select>
      <input type="date" id="f1" hidden>
      <input type="date" id="f2" hidden>
      <button class="btn p" id="ap" style="flex:0">${t("apply")}</button>
    </div>
    <div id="ao"></div>`;

  const rk = $("#rk");
  if (rk) {
    rk.onchange = (e) => {
      $$("#f1,#f2").forEach((x) => (x.hidden = e.target.value !== "custom"));
    };
  }

  if (window.Chart) {
    const cs = getComputedStyle(document.documentElement);
    Chart.defaults.font.family =
      cs.getPropertyValue("--font-sans").trim() || "sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = cs.getPropertyValue("--ink-2").trim() || "#c4bdb0";
    Chart.defaults.borderColor = "rgba(247,243,235,0.06)";
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.animation.duration = 700;
    Chart.defaults.animation.easing = "easeOutQuart";
  }

  const load = () =>
    run(async () => {
      let a, b;
      const k = $("#rk").value;

      if (k === "all") {
        a = new Date("2000-01-01");
        b = new Date();
      } else if (k === "custom") {
        if (!$("#f1").value || !$("#f2").value) {
          return toast(t("pickDates"), 1);
        }
        a = new Date($("#f1").value);
        b = new Date($("#f2").value + "T23:59:59");
      } else {
        [a, b] = rng(k);
      }

      $("#ao").innerHTML = empty(t("loading"));
      charts.forEach((c) => c.destroy());
      charts = [];

      let d;
      try {
        d = ok(
          await sb.rpc("analytics_dashboard", {
            p_from: a.toISOString(),
            p_to: b.toISOString(),
            p_bucket: (b - a) / day > 92 ? "month" : "day",
          })
        );
      } catch (e) {
        console.error("[analytics]", e);
        $("#ao").innerHTML = `
          <div class="empty" style="text-align:start;padding:var(--sp-6);border-color:var(--danger)">
            <h3 style="margin-top:0;color:var(--danger);font-family:var(--font-display)">
              ${t("failedLoad")}
            </h3>
            <p style="color:var(--ink-2);margin:.5rem 0">${esc(
              e.message || String(e)
            )}</p>
          </div>`;
        return;
      }

      const T = d?.totals || {};
      const isEmpty = !T.page_views && !T.project_views;

      if (isEmpty) {
        $("#ao").innerHTML = `
          <div class="empty" style="text-align:start;padding:var(--sp-6)">
            <h3 style="margin-top:0;color:var(--amber-molten);font-family:var(--font-display);font-style:italic">
              ${t("noData")}
            </h3>
            <p style="color:var(--ink-1);margin:.75rem 0">${t("noDataHint")}</p>
            <ol style="color:var(--ink-2);line-height:2.2;padding-inline-start:1.5rem;font-size:var(--fs-sm)">
              <li>${t("noDataStep1")}</li>
              <li>${t("noDataStep2")}</li>
            </ol>
          </div>`;
        return;
      }

      const statCard = (value, labelAr, hintAr) => `
        <div class="stat" title="${hintAr}" style="cursor:help">
          <b>${fmt(value)}</b>
          <span style="display:block;color:var(--ink-1);font-weight:600;margin-top:2px">${labelAr}</span>
        </div>`;

      $("#ao").innerHTML = `
        <div style="padding:var(--sp-5);background:linear-gradient(135deg,rgba(255,140,66,0.06),rgba(45,212,191,0.06));border:1px solid var(--line-amber);border-radius:var(--r-lg);margin-bottom:var(--sp-5);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--sp-4)">
          <div>
            <div style="font-family:var(--font-display);font-style:italic;font-size:var(--fs-xl);color:var(--ink-0);font-weight:600">${t(
              "dateRange"
            )}</div>
            <div style="color:var(--ink-2);font-size:var(--fs-sm);margin-top:6px">${a.toLocaleDateString()} → ${b.toLocaleDateString()}</div>
          </div>
          <div style="color:var(--ink-2);font-size:var(--fs-xs);text-align:end;line-height:1.8">
            <div>${t("pages")}: <b style="color:var(--amber-molten)">${fmt(
        T.page_views
      )}</b></div>
            <div>${t("projectsColon")}: <b style="color:var(--teal-signal)">${fmt(
        T.project_views
      )}</b></div>
          </div>
        </div>

        <h3 style="font-family:var(--font-display);font-style:italic;margin:var(--sp-5) 0 var(--sp-4);font-size:var(--fs-xl)">${t(
          "mainNumbers"
        )}</h3>
        <div class="stats">
          ${statCard(
            T.unique_sessions,
            t("uniqueVisitors"),
            t("uniqueVisitorsHint")
          )}
          ${statCard(T.page_views, t("pageViews"), t("pageViewsHint"))}
          ${statCard(T.project_views, t("projectOpens"), t("projectOpensHint"))}
          ${statCard(
            T.unique_project_visitors,
            t("uniqueProjectVisitors"),
            t("uniqueProjectVisitorsHint")
          )}
        </div>

        <h3 style="font-family:var(--font-display);font-style:italic;margin:var(--sp-6) 0 var(--sp-4);font-size:var(--fs-xl)">${t(
          "charts"
        )}</h3>
        <div class="two">
          <div class="box"><h4 style="margin-top:0">${t(
            "visitorsOverTime"
          )}</h4><div class="cv"><canvas id="c1"></canvas></div></div>
          <div class="box"><h4 style="margin-top:0">${t(
            "projectOpensChart"
          )}</h4><div class="cv"><canvas id="c2"></canvas></div></div>
        </div>
        <div class="two">
          <div class="box"><h4 style="margin-top:0">${t(
            "devicesChart"
          )}</h4><div class="cv"><canvas id="c3"></canvas></div></div>
          <div class="box"><h4 style="margin-top:0">${t(
            "sourcesChart"
          )}</h4><div class="cv"><canvas id="c4"></canvas></div></div>
        </div>

        <h3 style="font-family:var(--font-display);font-style:italic;margin:var(--sp-6) 0 var(--sp-4);font-size:var(--fs-xl)">${t(
          "topProjectsTitle"
        )}</h3>
        <p style="color:var(--ink-3);font-size:var(--fs-sm);margin:-12px 0 16px 0">${t(
          "topProjectsHint"
        )}</p>
        ${
          Array.isArray(d?.top_projects) && d.top_projects.length
            ? `<div class="tw"><table>
                <thead><tr><th style="width:50px">#</th><th>${t(
                  "projects"
                )}</th><th style="text-align:center">${t(
                "views"
              )}</th><th style="text-align:center">${t(
                "visitors"
              )}</th><th style="min-width:180px">${t(
                "percentage"
              )}</th></tr></thead>
                <tbody>
                  ${d.top_projects
                    .map(
                      (p, i) => `
                    <tr>
                      <td style="color:var(--ink-3);font-weight:700;font-family:var(--font-display);font-style:italic">${String(
                        i + 1
                      ).padStart(2, "0")}</td>
                      <td><b>${esc(p.title_ar || p.title_en || "—")}</b></td>
                      <td style="text-align:center"><span style="color:var(--amber-molten);font-weight:700;font-size:var(--fs-lg)">${fmt(
                        p.views
                      )}</span></td>
                      <td style="text-align:center;color:var(--ink-2)">${fmt(
                        p.uniq
                      )}</td>
                      <td>
                        <div style="display:flex;align-items:center;gap:10px">
                          <div style="flex:1;height:6px;background:var(--bg-3);border-radius:var(--r-full);overflow:hidden">
                            <div style="width:${Math.min(
                              100,
                              (p.pct || 0) * 3
                            )}%;height:100%;background:linear-gradient(90deg,var(--amber-molten),var(--amber-deep));border-radius:inherit"></div>
                          </div>
                          <span style="color:var(--amber-molten);font-size:11px;min-width:42px;font-weight:700">${p.pct}%</span>
                        </div>
                      </td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table></div>`
            : empty(t("noProjectOpens"))
        }

        <h3 style="font-family:var(--font-display);font-style:italic;margin:var(--sp-6) 0 var(--sp-4);font-size:var(--fs-xl)">${t(
          "topCategoriesTitle"
        )}</h3>
        ${
          Array.isArray(d?.top_categories) && d.top_categories.length
            ? `<div class="tw"><table>
                <thead><tr><th style="width:50px">#</th><th>${t(
                  "category"
                )}</th><th style="text-align:center">${t(
                "views"
              )}</th></tr></thead>
                <tbody>
                  ${d.top_categories
                    .map(
                      (c, i) => `
                    <tr>
                      <td style="color:var(--ink-3);font-weight:700;font-family:var(--font-display);font-style:italic">${String(
                        i + 1
                      ).padStart(2, "0")}</td>
                      <td><b>${esc(c.name_ar || c.name_en || "—")}</b></td>
                      <td style="text-align:center"><span style="color:var(--teal-signal);font-weight:700;font-size:var(--fs-lg)">${fmt(
                        c.views
                      )}</span></td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table></div>`
            : empty(t("noCategoryData"))
        }
      `;

      const dt = (s) =>
        s.map((x) =>
          new Date(x.t).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        );
      const P = ["#ff8c42", "#2dd4bf", "#a78bfa", "#fb7185", "#60a5fa"];

      const mk = (id, type, labels, sets) => {
        const cv = document.getElementById(id);
        if (!cv) return;
        charts.push(
          new Chart(cv, {
            type,
            data: { labels, datasets: sets },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: { intersect: false, mode: "index" },
              plugins: {
                legend: {
                  display: sets.length > 1 || type === "doughnut",
                  position: "bottom",
                  labels: { padding: 14 },
                },
                tooltip: {
                  backgroundColor: "rgba(12,10,20,0.96)",
                  borderColor: "rgba(255,140,66,0.4)",
                  borderWidth: 1,
                  padding: 14,
                  cornerRadius: 10,
                },
              },
              scales:
                type === "doughnut"
                  ? {}
                  : {
                      x: { grid: { color: "rgba(247,243,235,0.04)" } },
                      y: {
                        beginAtZero: true,
                        grid: { color: "rgba(247,243,235,0.06)" },
                        ticks: { precision: 0 },
                      },
                    },
            },
          })
        );
      };

      const vs = Array.isArray(d?.visitors_series) ? d.visitors_series : [];
      const pvs = Array.isArray(d?.project_views_series)
        ? d.project_views_series
        : [];
      const devices = Array.isArray(d?.devices) ? d.devices : [];
      const sources = Array.isArray(d?.sources) ? d.sources : [];

      mk("c1", "line", dt(vs), [
        {
          label: t("uniqueVisitors"),
          data: vs.map((x) => x.visitors),
          borderColor: P[0],
          backgroundColor: P[0] + "22",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
        },
        {
          label: t("pageViews"),
          data: vs.map((x) => x.page_views),
          borderColor: P[1],
          backgroundColor: P[1] + "22",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
        },
      ]);

      mk("c2", "bar", dt(pvs), [
        {
          label: t("views"),
          data: pvs.map((x) => x.views),
          backgroundColor: P[0],
          borderRadius: 8,
        },
        {
          label: t("visitors"),
          data: pvs.map((x) => x.uniq),
          backgroundColor: P[1],
          borderRadius: 8,
        },
      ]);

      const deviceLabel = (x) =>
        ({ desktop: t("desktop"), mobile: t("mobile"), tablet: t("tablet") }[
          x
        ] || x);
      const sourceLabel = (x) =>
        ({
          direct: t("direct"),
          search: t("searchSource"),
          referral: t("referral"),
          other: t("otherSource"),
        }[x] || x);

      mk("c3", "doughnut", devices.map((x) => deviceLabel(x.device_type)), [
        {
          data: devices.map((x) => x.sessions),
          backgroundColor: P,
          borderWidth: 0,
          hoverOffset: 8,
        },
      ]);

      mk("c4", "doughnut", sources.map((x) => sourceLabel(x.referrer_type)), [
        {
          data: sources.map((x) => x.sessions),
          backgroundColor: P,
          borderWidth: 0,
          hoverOffset: 8,
        },
      ]);
    });

  const ap = $("#ap");
  if (ap) ap.onclick = load;
  load();
}

/* ============================================================
   OVERVIEW TAB
   ============================================================ */
async function overview() {
  const V = getView();

  let o = {
    total_projects: 0,
    published_projects: 0,
    featured_projects: 0,
    sessions: 0,
    project_views: 0,
  };
  let recent = [];
  let topProjects = [];

  try {
    const [r1, r2, r3] = await Promise.all([
      sb.rpc("admin_overview"),
      sb
        .from("projects")
        .select("id,title_en,title_ar,status,updated_at,cover_image")
        .order("updated_at", { ascending: false })
        .limit(5),
      sb
        .from("project_view_counts")
        .select("project_id,views,unique_visitors")
        .order("views", { ascending: false })
        .limit(5),
    ]);

    if (r1 && !r1.error && r1.data) {
      o = { ...o, ...r1.data };
    }
    if (r2 && !r2.error && Array.isArray(r2.data)) {
      recent = r2.data;
    }
    if (r3 && !r3.error && Array.isArray(r3.data)) {
      topProjects = r3.data;
    }
  } catch (e) {
    console.warn("[overview] fetch failed:", e);
  }

  if (!Array.isArray(recent)) recent = [];
  if (!Array.isArray(topProjects)) topProjects = [];

  const ids = topProjects.map((x) => x && x.project_id).filter(Boolean);

  let titles = [];
  if (ids.length > 0) {
    try {
      const { data } = await sb
        .from("projects")
        .select("id,title_en,title_ar")
        .in("id", ids);
      if (Array.isArray(data)) titles = data;
    } catch (e) {
      console.warn("[overview] titles fetch failed:", e);
    }
  }
  const titleMap = Object.fromEntries(
    titles.filter((x) => x && x.id).map((x) => [x.id, x])
  );

  V.innerHTML = `
    <div class="stats">
      ${[
        [t("totalProjects"), o.total_projects || 0],
        [t("publishedCount"), o.published_projects || 0],
        [t("featuredCount"), o.featured_projects || 0],
        [t("sessions"), o.sessions || 0],
        [t("projectViews"), o.project_views || 0],
      ]
        .map(
          ([label, val]) => `
        <div class="stat">
          <b>${fmt(val)}</b>
          <span>${label}</span>
        </div>`
        )
        .join("")}
    </div>

    <div class="two">
      <div class="box">
        <h4 style="margin-top:0;font-family:var(--font-display);font-style:italic">${t(
          "recentProjects"
        )}</h4>
        ${
          recent.length
            ? `<div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">
                ${recent
                  .map(
                    (p) => `
                  <div style="display:flex;align-items:center;gap:12px;padding:8px;border-radius:var(--r-md);background:var(--bg-3)">
                    ${
                      p && p.cover_image
                        ? `<img src="${esc(
                            p.cover_image
                          )}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:var(--r-sm)">`
                        : `<div style="width:40px;height:40px;background:var(--bg-2);border-radius:var(--r-sm);display:grid;place-items:center">📁</div>`
                    }
                    <div style="flex:1;min-width:0">
                      <div style="font-weight:600;color:var(--ink-0);font-size:var(--fs-sm);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(
                        (p && (p.title_ar || p.title_en)) || "—"
                      )}</div>
                      <div style="color:var(--ink-3);font-size:11px;margin-top:2px">${
                        p && p.updated_at
                          ? new Date(p.updated_at).toLocaleDateString()
                          : "—"
                      }</div>
                    </div>
                    <span class="badge ${
                      p && p.status == "published" ? "" : "c"
                    }">${esc((p && p.status) || "")}</span>
                  </div>`
                  )
                  .join("")}
              </div>`
            : empty(t("noProjects"))
        }
      </div>

      <div class="box">
        <h4 style="margin-top:0;font-family:var(--font-display);font-style:italic">${t(
          "topViewed"
        )}</h4>
        ${
          topProjects.length
            ? `<div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">
                ${topProjects
                  .map((p, i) => {
                    const pid = p && p.project_id;
                    const row = pid ? titleMap[pid] : null;
                    const max = (topProjects[0] && topProjects[0].views) || 1;
                    const pct = Math.round(
                      (((p && p.views) || 0) / max) * 100
                    );
                    return `
                    <div>
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                        <span style="font-size:var(--fs-sm);color:var(--ink-0);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%">
                          ${i + 1}. ${esc(
                      (row && (row.title_ar || row.title_en)) || "—"
                    )}
                        </span>
                        <span style="color:var(--amber-molten);font-weight:700;font-size:var(--fs-sm)">${fmt(
                          (p && p.views) || 0
                        )}</span>
                      </div>
                      <div style="height:4px;background:var(--bg-3);border-radius:var(--r-full);overflow:hidden">
                        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--amber-molten),var(--teal-signal));border-radius:inherit"></div>
                      </div>
                    </div>`;
                  })
                  .join("")}
              </div>`
            : empty(t("noViews"))
        }
      </div>
    </div>
  `;
}

/* ============================================================
   SETTINGS TAB
   ============================================================ */
async function settings() {
  const V = getView();
  let s = {};
  try {
    s =
      ok(await sb.from("site_settings").select("*").eq("id", 1).single()) || {};
  } catch (e) {
    console.warn("[settings] fetch failed:", e);
    s = {};
  }

  V.innerHTML = `
    <div class="box">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        ${
          s.logo_url
            ? `<img src="${esc(
                s.logo_url
              )}" alt="Logo" style="width:64px;height:64px;object-fit:contain;border-radius:var(--r-md);background:var(--bg-3);padding:8px">`
            : `<div style="width:64px;height:64px;background:var(--bg-3);border-radius:var(--r-md);display:grid;place-items:center;font-size:24px">🏢</div>`
        }
        <div style="flex:1;min-width:200px">
          <div style="font-family:var(--font-display);font-style:italic;font-size:var(--fs-xl);color:var(--ink-0)">
            ${esc(s.company_name || "Archai Integrated Systems")}
          </div>
          <div style="color:var(--ink-3);font-size:var(--fs-sm);margin-top:4px">
            ${esc(s.site_title || "—")}
          </div>
        </div>
        <button class="btn p" id="es">✎ ${t("editSettings")}</button>
      </div>
    </div>`;

  const es = $("#es");
  if (es) {
    es.onclick = () =>
      run(async () => {
        const safeS = {};
        Object.keys(s || {}).forEach((k) => {
          const val = s[k];
          if (val === null || val === undefined) return;
          if (
            typeof val === "string" ||
            typeof val === "number" ||
            typeof val === "boolean"
          ) {
            safeS[k] = val;
          }
        });

        const o = await form(
          t("siteSettings"),
          [
            {
              n: "company_name",
              l: "companyName",
              i18n: "companyName",
              nul: 1,
            },
            { n: "logo_url", l: "logoUrl", i18n: "logoUrl", nul: 1 },
            {
              n: "site_title",
              l: "siteTitle",
              i18n: "siteTitle",
              nul: 1,
              w: "full",
            },
            {
              n: "home_title_en",
              l: "homeTitleEn",
              i18n: "homeTitleEn",
              nul: 1,
            },
            {
              n: "home_title_ar",
              l: "homeTitleAr",
              i18n: "homeTitleAr",
              nul: 1,
            },
            {
              n: "home_desc_en",
              l: "homeDescEn",
              i18n: "homeDescEn",
              t: "textarea",
              w: "full",
            },
            {
              n: "home_desc_ar",
              l: "homeDescAr",
              i18n: "homeDescAr",
              t: "textarea",
              w: "full",
            },
            {
              n: "footer_text_en",
              l: "footerEn",
              i18n: "footerEn",
              nul: 1,
            },
            {
              n: "footer_text_ar",
              l: "footerAr",
              i18n: "footerAr",
              nul: 1,
            },
            {
              n: "default_seo_image",
              l: "defaultSeo",
              i18n: "defaultSeo",
              nul: 1,
              w: "full",
            },
            {
              n: "featured_limit",
              l: "featuredLimit",
              i18n: "featuredLimit",
              t: "number",
            },
          ],
          safeS
        );

        if (o) {
          ok(await sb.from("site_settings").update(o).eq("id", 1));
          clearCache();
          toast(t("saved"));
          await settings();
        }
      });
  }
}

/* ============================================================
   ROUTER
   ============================================================ */
const tabs = { overview, projects, categories, analytics, settings };

const go = (k) => {
  cur = k;
  document.body.classList.remove("open");

  $$("aside [data-tab]").forEach((b) =>
    b.classList.toggle("on", b.dataset.tab === k)
  );

  const ttl = $("#ttl");
  if (ttl) {
    const key = k;
    ttl.textContent =
      t(key) !== key ? t(key) : k[0].toUpperCase() + k.slice(1);
  }

  window.scrollTo({ top: 0, behavior: "instant" });

  const V = getView();
  V.innerHTML = empty(t("loading"));
  run(tabs[k]);
};

$$("aside [data-tab]").forEach((b) => {
  b.onclick = () => go(b.dataset.tab);
});

const menu = $("#menu");
if (menu) {
  menu.onclick = () => document.body.classList.toggle("open");
}

const out = $("#out");
if (out) {
  out.onclick = async () => {
    await sb.auth.signOut();
    location.replace("login.html");
  };
}

go("overview");