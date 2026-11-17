// Публічний профіль (Етап 4): сторінка /u/<нік> для всіх і сторінка налаштувань /profile для власника.
// Публічно видно лише нікнейм, героя-аватарку, біо, рівень, серію й навчальний прогрес; ім'я, пошта й фото з входу не показуються.
import { api, getUser, isReady, patchUser, post } from "./auth.ts";
import { C } from "./data.ts";
import { defaultIdol, IDOLS, idolById, idolSrc } from "./data/idols.ts";
import type { ProfileSettings, PublicProfile } from "./types.ts";
import { toast, ui } from "./ui.ts";
import { escA, pl } from "./util.ts";
import { avatarRing } from "./dashviz.ts";
import { ACHIEVEMENTS, achIcon } from "./data/achievements.ts";
import { levelInfo } from "./xp.ts";

export const BIO_MAX = 160;
const MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];

// ---------- аватарки-герої ----------

/** Картинка героя; для невідомого id повертає порожній рядок */
export function idolImg(id: string | null | undefined, cls = ""): string {
  const i = idolById(id);
  return i ? `<img class="avatar idol${cls ? " " + cls : ""}" src="${idolSrc(i.id)}" alt="${escA(i.name)}" width="72" height="72" loading="lazy" decoding="async" style="background:${i.color}">` : "";
}

// ---------- теплова карта ----------

const utcKey = (d: Date): string => d.toISOString().slice(0, 10);

/** Карта активності за 26 тижнів (UTC), стовпчик = тиждень з понеділка; рівень клітинки 0–4 за кількістю дій у день */
export function heatmap(activity: Record<string, number>, now = new Date()): string {
  const WEEKS = 26;
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7) - (WEEKS - 1) * 7);
  let total = 0, days = 0;
  const cells: string[] = [];
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      const x = new Date(monday);
      x.setUTCDate(monday.getUTCDate() + w * 7 + d);
      if (x > today) { cells.push(`<i class="pad"></i>`); continue; }
      const key = utcKey(x), n = activity[key] || 0, lvl = n === 0 ? 0 : n < 2 ? 1 : n < 4 ? 2 : n < 7 ? 3 : 4;
      total += n; if (n) days++;
      cells.push(`<i class="l${lvl}" title="${key}: ${n}"></i>`);
    }
  }
  return `<div class="pf-heat" role="img" aria-label="Активність за пів року: ${total} ${pl(total, "дія", "дії", "дій")} у ${days} ${pl(days, "день", "дні", "днів")}">${cells.join("")}</div>
    <div class="pf-heat-foot"><span>${total} ${pl(total, "дія", "дії", "дій")} за 26 тижнів</span><span class="pf-legend" aria-hidden="true">менше <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i> більше</span></div>`;
}

// ---------- сторінка профілю ----------

const sinceText = (s: string | null): string => {
  const m = s && /^(\d{4})-(\d{2})$/.exec(s);
  return m ? `З нами з ${MONTHS[+m[2] - 1]} ${m[1]}` : "";
};

/** Мови: що пройдено повністю, що вчиться зараз */
function languages(p: PublicProfile): string {
  const rows = p.courses.filter((c) => C[c.key]).map((c) => {
    const pct = Math.round((c.done / c.total) * 100), full = c.done >= c.total;
    return `<li class="pf-lang${full ? " done" : ""}"><b class="onb-badge" style="background:${escA(C[c.key].color)}" aria-hidden="true">${escA(C[c.key].badge)}</b>
      <span class="pf-lang-name"><span>${escA(C[c.key].name)}</span><em>${full ? "Пройдено ✓" : "Вчить"}</em></span>
      <span class="pf-lang-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${c.total}" aria-valuenow="${c.done}" aria-label="${escA(C[c.key].name)}: ${c.done} з ${c.total} уроків"><i style="width:${pct}%"></i></span>
      <span class="pf-lang-n">${c.done}/${c.total}</span></li>`;
  });
  return rows.length ? `<ul class="pf-langs">${rows.join("")}</ul>` : `<p class="dash-muted">Поки що жодного пройденого уроку. Усе попереду.</p>`;
}

/** Готовий вигляд профілю (без запитів): шапка, цифри, мови, карта активності */
/** Значки: власник бачить усі (неотримані сірі), інші лише отримані */
function badges(p: PublicProfile, own: boolean): string {
  const got = new Set(p.badges ?? []);
  const list = ACHIEVEMENTS.filter((a) => own || got.has(a.id));
  if (!list.length) return "";
  return `<section class="card"><h2>Досягнення${own ? ` <small class="dash-muted">${got.size} з ${ACHIEVEMENTS.length}</small>` : ""}</h2><ul class="pf-badges">${list.map((a) => {
    const on = got.has(a.id);
    return `<li class="pf-badge${on ? " got" : ""}" title="${escA(a.desc)}">${achIcon(a.icon)}<b>${escA(a.title)}</b><span class="sr-only">${on ? "Отримано" : "Ще не отримано"}: ${escA(a.desc)}</span></li>`;
  }).join("")}</ul></section>`;
}

export function profileView(p: PublicProfile, note = "", own = false): string {
  const idol = idolById(p.avatarId) ?? defaultIdol(p.nick), i = levelInfo(p.xp);
  const stats: [string, string][] = [
    [`${p.xp}`, "XP"], [`${p.streak}`, pl(p.streak, "день серії", "дні серії", "днів серії")],
    [`${p.lessons}`, pl(p.lessons, "урок", "уроки", "уроків")], [`${p.tasks}`, pl(p.tasks, "завдання", "завдання", "завдань")],
  ];
  return `<div class="pf">
    ${note}
    <section class="card pf-head">
      ${avatarRing(idolImg(idol.id, "big"), p.xp)}
      <div class="pf-who">
        <h1>@${escA(p.nick)}</h1>
        <p class="pf-meta"><span class="pf-lvl">Рівень ${i.level}</span>${p.since ? `<span>${escA(sinceText(p.since))}</span>` : ""}<span>Аватар: ${escA(idol.name)}</span></p>
        ${p.bio ? `<p class="pf-bio">${escA(p.bio)}</p>` : ""}
      </div>
    </section>
    <ul class="pf-stats">${stats.map(([n, t]) => `<li><b>${escA(n)}</b><span>${escA(t)}</span></li>`).join("")}</ul>
    <section class="card"><h2>Мови та знання</h2>${languages(p)}</section>
    ${badges(p, own)}
    <section class="card"><h2>Активність</h2>${heatmap(p.activity)}</section>
  </div>`;
}

type PubState = { nick: string; s: "loading" | "ok" | "nf" | "err"; p?: PublicProfile; own?: boolean; open?: boolean };
let pub: PubState | null = null;

async function loadPublic(nick: string): Promise<void> {
  const r = await api<{ profile: PublicProfile; own: boolean; public: boolean }>("/api/u?nick=" + encodeURIComponent(nick));
  pub = r.ok && r.data?.profile ? { nick, s: "ok", p: r.data.profile, own: r.data.own, open: r.data.public } : { nick, s: r.status === 404 ? "nf" : "err" };
  ui.render();
}

/** Сторінка /u/<нік>. Повертає також заголовок і ознаку «індексувати» для мета-тегів */
export function renderPublic(nick: string): { html: string; title: string; index: boolean } {
  const n = nick.toLowerCase();
  if (!pub || pub.nick !== n) { pub = { nick: n, s: "loading" }; void loadPublic(n); }
  const back = `<div class="crumbs"><a href="/">Головна</a> / Профіль</div>`;
  if (pub.s === "loading") return { html: `${back}<div class="card pf-skel" aria-busy="true"><div class="sk-line"></div><div class="sk-line short"></div></div>`, title: "Профіль", index: false };
  if (pub.s === "err") return { html: `${back}<div class="card"><h1>Не вдалося завантажити профіль</h1><p class="dash-muted">Перевірте з'єднання й спробуйте ще раз.</p><button class="btn primary" data-act="retry-profile">Спробувати ще раз</button></div>`, title: "Профіль", index: false };
  if (pub.s === "nf" || !pub.p) return { html: `${back}<div class="card"><h1>Профіль не знайдено</h1><p class="dash-muted">Такого користувача немає, або він закрив свій профіль.</p><a class="btn primary" href="/courses">До курсів</a></div>`, title: "Профіль не знайдено", index: false };
  const note = pub.own && !pub.open ? `<p class="pf-note">Профіль закритий: його бачите тільки ви. <a href="/profile">Відкрити в налаштуваннях</a></p>` : pub.own ? `<p class="pf-note ok">Так вас бачать інші. <a href="/profile">Налаштувати профіль</a></p>` : "";
  const report = !pub.own && getUser() ? `<details class="pf-report card"><summary>Поскаржитись на профіль</summary>
    <label class="sr-only" for="pf-rep-reason">Причина скарги</label>
    <select id="pf-rep-reason"><option value="spam">Спам або реклама</option><option value="abuse">Образи</option><option value="personal">Особисті дані</option><option value="other">Інше</option></select>
    <button class="btn small" type="button" data-act="report-profile" data-nick="${escA(pub.p.nick)}">Надіслати</button>
    <p class="form-msg" id="pf-rep-msg" role="status"></p></details>` : "";
  return { html: `${back}${profileView(pub.p, note, !!pub.own)}${report}`, title: `@${pub.p.nick}: профіль`, index: !!pub.open };
}

// ---------- налаштування ----------

let mine: ProfileSettings | null | undefined;   // undefined = ще не завантажено
let loadingMine = false;

async function loadMine(): Promise<void> {
  if (loadingMine) return;
  loadingMine = true;
  const r = await api<ProfileSettings>("/api/profile");
  loadingMine = false;
  mine = r.ok && r.data ? r.data : null;
  ui.render();
}

const ERRORS: Record<string, string> = {
  nick_invalid: "Нікнейм: від 3 до 20 символів, малі латинські літери, цифри й _, починається з літери",
  nick_reserved: "Цей нікнейм зарезервовано. Оберіть інший",
  nick_taken: "Цей нікнейм уже зайнятий. Спробуйте інший",
  nick_locked: "Нікнейм уже задано, змінити його не можна",
  nick_required: "Спочатку оберіть нікнейм",
  bio_too_long: `Біо має бути не довшим за ${BIO_MAX} символів`,
  bio_links: "У біо поки не можна вставляти посилання",
  avatar_invalid: "Такого героя немає",
};

export function renderSettings(): string {
  const u = getUser();
  if (!isReady() || !u) return "";
  if (mine === undefined) { void loadMine(); return `<div class="card pf-skel" aria-busy="true"><div class="sk-line"></div><div class="sk-line short"></div></div>`; }
  if (mine === null) return `<div class="card"><h1>Не вдалося завантажити налаштування</h1><button class="btn primary" data-act="retry-settings">Спробувати ще раз</button></div>`;
  const s = mine, cur = s.avatarId ?? "", site = location.origin;
  const hasPhoto = /^https:\/\//.test(u.avatarUrl ?? "");
  const choice = (id: string, name: string, inner: string, color: string): string =>
    `<label class="pf-idol"><input type="radio" name="avatar" value="${escA(id)}"${cur === id ? " checked" : ""}><span class="pf-ava" style="--c:${escA(color)}">${inner}</span><b>${escA(name)}</b></label>`;
  const idols = IDOLS.map((i) => choice(i.id, i.name, idolImg(i.id), i.color)).join("");
  const photo = hasPhoto ? choice("", "Фото входу", `<img class="avatar" src="${escA(u.avatarUrl)}" alt="" referrerpolicy="no-referrer" width="72" height="72">`, "#C8D3EA") : "";
  const nickBlock = s.nick
    ? `<p class="pf-nick-on"><b>@${escA(s.nick)}</b> <span class="dash-muted">Нікнейм не змінюється</span></p>
       <p class="pf-link"><a href="/u/${escA(s.nick)}">${escA(site)}/u/${escA(s.nick)}</a> <button class="btn small" type="button" data-act="copy-profile" data-url="${escA(site)}/u/${escA(s.nick)}">Скопіювати</button></p>`
    : `<form id="pf-nick" class="pf-nick" novalidate>
         <label class="sr-only" for="pf-nick-in">Нікнейм</label>
         <div class="pf-nick-row"><span aria-hidden="true">@</span><input id="pf-nick-in" name="nick" type="text" maxlength="20" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="наприклад, olena_dev" aria-describedby="pf-nick-hint"><button class="btn primary" type="submit">Зайняти</button></div>
         <p class="dash-muted" id="pf-nick-hint">3–20 символів: малі латинські літери, цифри й _. <b>Змінити нікнейм пізніше не можна.</b></p>
         <p class="form-msg" id="pf-nick-msg" role="alert"></p>
       </form>`;
  return `<div class="pf pf-settings">
    <div class="crumbs"><a href="/dashboard">Кабінет</a> / Мій профіль</div>
    <h1>Мій профіль</h1>
    <section class="card"><h2>Нікнейм</h2>${nickBlock}</section>
    <form id="pf-form" class="card" novalidate>
      <h2>Аватарка</h2>
      <p class="dash-muted">Оберіть героя платформи. Свої картинки завантажувати не можна.</p>
      <div class="pf-grid" role="radiogroup" aria-label="Аватарка">${idols}${photo}</div>
      <h2>Про себе</h2>
      <label class="sr-only" for="pf-bio">Про себе</label>
      <textarea id="pf-bio" name="bio" rows="3" maxlength="${BIO_MAX}" placeholder="Коротко про себе: що вчите і навіщо">${escA(s.bio)}</textarea>
      <p class="pf-count dash-muted"><span id="pf-bio-n">${[...s.bio].length}</span>/${BIO_MAX} · без посилань</p>
      <h2>Видимість</h2>
      <label class="pf-switch"><input type="checkbox" name="public"${s.public ? " checked" : ""}${s.nick ? "" : " disabled"}><span>Показувати мій профіль усім за посиланням</span></label>
      <p class="dash-muted">${s.nick ? "Видно: нікнейм, герой, біо, рівень, серія, мови й активність. Ім'я, пошта й фото з входу не показуються." : "Спочатку оберіть нікнейм."}</p>
      <p class="form-msg" id="pf-msg" role="alert"></p>
      <button class="btn primary" type="submit">Зберегти</button>
    </form>
    <section class="card pf-data">
      <h2>Мої дані й акаунт</h2>
      <p class="dash-muted">Ви можете завантажити всі свої дані файлом або видалити акаунт. Докладніше: <a href="/privacy">Політика конфіденційності</a>.</p>
      <p class="pf-data-btns"><a class="btn" href="/api/account" download>Завантажити мої дані</a> <button class="btn danger" type="button" data-act="delete-account">Видалити акаунт</button></p>
      <p class="form-msg" id="pf-del-msg" role="alert"></p>
    </section>
  </div>`;
}

const msgOf = (code: unknown): string => ERRORS[String(code)] ?? "Не вдалося зберегти. Спробуйте ще раз";

export function mountSettings(): void {
  const form = document.getElementById("pf-form") as HTMLFormElement | null;
  const nickForm = document.getElementById("pf-nick") as HTMLFormElement | null;
  const bio = document.getElementById("pf-bio") as HTMLTextAreaElement | null;
  if (bio) bio.addEventListener("input", () => { const n = document.getElementById("pf-bio-n"); if (n) n.textContent = String([...bio.value].length); });

  nickForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("pf-nick-msg") as HTMLElement, btn = nickForm.querySelector("button") as HTMLButtonElement;
    const nick = (nickForm.elements.namedItem("nick") as HTMLInputElement).value.trim().toLowerCase();
    msg.textContent = "";
    if (!/^[a-z][a-z0-9_]{2,19}$/.test(nick)) { msg.textContent = ERRORS.nick_invalid; return; }
    btn.disabled = true;
    const r = await post<{ profile?: ProfileSettings; error?: string }>("/api/profile", { nick });
    btn.disabled = false;
    if (!r.ok || !r.data?.profile) { msg.textContent = msgOf(r.data?.error); return; }
    mine = r.data.profile;
    patchUser({ nick: mine.nick });
    ui.render();
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("pf-msg") as HTMLElement, btn = form.querySelector("button[type=submit]") as HTMLButtonElement;
    const picked = form.querySelector<HTMLInputElement>("input[name=avatar]:checked");
    const body: Record<string, unknown> = { bio: (bio?.value ?? "").trim(), public: !!(form.elements.namedItem("public") as HTMLInputElement | null)?.checked };
    if (picked) body.avatarId = picked.value || null;
    msg.textContent = "";
    btn.disabled = true;
    const r = await post<{ profile?: ProfileSettings; error?: string }>("/api/profile", body);
    btn.disabled = false;
    if (!r.ok || !r.data?.profile) { msg.textContent = msgOf(r.data?.error); return; }
    mine = r.data.profile;
    pub = null;   // сторінка профілю при наступному відкритті завантажиться заново
    patchUser({ avatarId: mine.avatarId });
    toast("Профіль збережено");
  });
}

document.addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLElement>("[data-act]");
  if (!b) return;
  if (b.dataset.act === "retry-profile") { pub = null; ui.render(); }
  else if (b.dataset.act === "retry-settings") { mine = undefined; ui.render(); }
  else if (b.dataset.act === "delete-account") {
    // Подвійне підтвердження: видалення незворотне (прогрес, XP, профіль)
    if (!confirm("Видалити акаунт назавжди? Прогрес, XP і профіль буде стерто, відновити їх не можна.")) return;
    if (prompt("Щоб підтвердити, введіть слово ВИДАЛИТИ") !== "ВИДАЛИТИ") return;
    b.setAttribute("disabled", "");
    void post<{ error?: string }>("/api/account", { confirm: "delete" }).then((r) => {
      if (r.ok) { location.assign("/"); return; }
      b.removeAttribute("disabled");
      const m = document.getElementById("pf-del-msg");
      if (m) m.textContent = "Не вдалося видалити акаунт. Спробуйте ще раз або напишіть нам.";
    });
  }
  else if (b.dataset.act === "copy-profile") {
    const url = b.dataset.url ?? "";
    void navigator.clipboard?.writeText(url).then(() => toast("Посилання скопійовано"), () => toast(url));
  }
});

// При виході з акаунта (і вході під іншим) кешовані налаштування й сторінка профілю скидаються
ui.authListeners.add(() => { mine = undefined; pub = null; });
