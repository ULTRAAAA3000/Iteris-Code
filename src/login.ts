// Вхід, реєстрація й відновлення пароля за поштою: /login, /register, /forgot, /reset/<токен>, /verify/<токен>.
// Кожна форма захищена Cloudflare Turnstile; пароль на сервері хешується (PBKDF2), тут він лише передається по HTTPS.
import { completeSignIn, getAuthConfig, getUser, isReady, loginGoogle, post } from "./auth.ts";
import { toast } from "./ui.ts";
import { navigate } from "./router.ts";
import { notFound } from "./views.ts";

interface TurnstileApi {
  render(el: HTMLElement, o: { sitekey: string; callback?: (t: string) => void; "expired-callback"?: () => void; "error-callback"?: () => void }): string;
  reset(id?: string): void;
}
declare global { interface Window { turnstile?: TurnstileApi } }

const ROUTES = ["login", "register", "forgot", "reset", "verify"] as const;
type Kind = (typeof ROUTES)[number];
export const isAuthRoute = (a: string | undefined): a is Kind => ROUTES.includes(a as Kind);
const TITLES: Record<Kind, string> = { login: "Вхід", register: "Реєстрація", forgot: "Відновлення пароля", reset: "Новий пароль", verify: "Підтвердження пошти" };
export const authTitle = (a: string): string => TITLES[a as Kind] ?? "Акаунт";

const ERRORS: Record<string, string> = {
  invalid_credentials: "Невірна пошта або пароль",
  email_not_verified: "Спершу підтвердьте пошту: перейдіть за посиланням із листа",
  captcha_failed: "Не вдалося пройти перевірку. Спробуйте ще раз",
  too_many_requests: "Забагато спроб. Спробуйте трохи пізніше",
  invalid_email: "Перевірте адресу пошти",
  weak_password: "Пароль має містити від 8 до 128 символів",
  invalid_token: "Посилання недійсне або застаріле",
  email_taken: "Акаунт із такою поштою вже є. Увійдіть",
};
const GENERIC = "Не вдалося виконати запит. Спробуйте пізніше";
// Збій самого сервера (5xx, відповідь без JSON) або відсутність зв'язку: показуємо код, щоб його можна було передати розробнику
const serverFailure = (status: number, code?: string): string =>
  status === 0 ? "Немає зв'язку із сервером. Перевірте інтернет і спробуйте ще раз"
    : `Помилка сервера (код ${status}${code ? ", " + code : ""}). Спробуйте ще раз трохи пізніше`;

let tsLoad: Promise<TurnstileApi | null> | null = null;
function loadTurnstile(): Promise<TurnstileApi | null> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  return (tsLoad ??= new Promise((res) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => res(window.turnstile ?? null);
    s.onerror = () => { tsLoad = null; res(null); };
    document.head.appendChild(s);
  }));
}

const fld = (name: string, label: string, type: string, attrs: string, hint = ""): string =>
  `<label class="fld"><span class="lbl">${label}</span><input name="${name}" type="${type}" ${attrs}>${hint ? `<small>${hint}</small>` : ""}</label>`;
const SVG = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const EYE = `<svg class="on" ${SVG}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF = `<svg class="off" ${SVG}><path d="M3 3l18 18M10.6 6.1A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.8 8.3 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>`;
const email = fld("email", "Пошта", "email", 'autocomplete="email" maxlength="254" required');
const pass = (auto: "current-password" | "new-password", label = "Пароль", hint = ""): string => {
  const isNew = auto === "new-password";
  return `<label class="fld"><span class="lbl">${label}</span><span class="pw"><input name="password" type="password" autocomplete="${auto}" minlength="${isNew ? 8 : 1}" maxlength="128" required>`
    + `<button class="pw-toggle" type="button" aria-label="Показати пароль" aria-pressed="false">${EYE}${EYE_OFF}</button></span>`
    + (hint ? `<small>${hint}</small>` : "")
    + (isNew ? `<span class="pw-meter" data-s="0" aria-hidden="true"><i></i><i></i><i></i><i></i></span><small class="pw-meter-t" aria-live="polite"></small>` : "")
    + `</label>`;
};
const STRENGTH = ["", "Слабкий пароль", "Непоганий пароль", "Добрий пароль", "Надійний пароль"];
// Орієнтовна оцінка надійності лише для підказки; справжня перевірка (довжина) робиться на сервері
export function strength(p: string): number {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if ((/\p{L}/u.test(p) && /\d/.test(p)) || (/\p{Lu}/u.test(p) && /\p{Ll}/u.test(p))) s++;
  if (/[^\p{L}\d]/u.test(p)) s++;
  return Math.max(1, s);
}
// Які поля підсвічувати червоним для кожної помилки
const BAD_FIELDS: Record<string, string[]> = {
  invalid_credentials: ["email", "password"], email_not_verified: ["email"], invalid_email: ["email"], weak_password: ["password"], email_taken: ["email"],
};
const rule = "Щонайменше 8 символів";
const form = (fields: string, submit: string): string =>
  `<form id="af">${fields}${getAuthConfig().siteKey ? '<div class="ts-slot" id="af-ts"></div>' : ""}<button class="btn primary" type="submit">${submit}</button></form><p class="form-msg" id="af-msg" role="alert"></p>`;
const googleBtn = (): string =>
  getAuthConfig().clientId ? `<div class="auth-or"><span>або</span></div><button class="btn" type="button" data-act="google">Увійти через Google</button>` : "";

export function renderAuthPage(kind: Kind): string {
  const { mail } = getAuthConfig();
  if (!isReady()) return `<div class="card auth-card" aria-busy="true" aria-label="Завантаження"><i class="sk h"></i><i class="sk"></i><i class="sk"></i><i class="sk s"></i></div>`;
  if (getUser()) return `<div class="card auth-card"><h1>Ви вже увійшли</h1><a class="btn primary" href="/dashboard">Особистий кабінет</a></div>`;
  if (!mail && kind !== "login" && kind !== "register") return notFound();   // відновлення пароля й підтвердження пошти потребують листів
  const h = (t: string): string => `<h1>${t}</h1>`;
  const card = (inner: string): string => `<div class="card auth-card">${inner}</div>`;
  switch (kind) {
    case "login":
      return card(h("Вхід") + form(email + pass("current-password"), "Увійти") + googleBtn() +
        `<p class="auth-links">${mail ? '<a href="/forgot">Забули пароль?</a>' : ""}<a href="/register">Створити акаунт</a></p>`);
    case "register":
      return card(h("Реєстрація") + form(fld("name", "Ім'я (необов'язково)", "text", 'autocomplete="name" maxlength="60"') + email + pass("new-password", "Пароль", rule), "Створити акаунт") +
        googleBtn() + `<p class="auth-links"><a href="/login">Вже є акаунт? Увійти</a></p>`);
    case "forgot":
      return card(h("Відновлення пароля") + `<p class="dash-muted">Вкажіть пошту, і ми надішлемо посилання для нового пароля.</p>` + form(email, "Надіслати посилання") +
        `<p class="auth-links"><a href="/login">Назад до входу</a></p>`);
    case "reset":
      return card(h("Новий пароль") + form(pass("new-password", "Новий пароль", rule), "Зберегти пароль"));
    case "verify":
      return card(h("Підтвердження пошти") + `<p class="form-msg wait" id="af-msg" role="status">Перевіряємо посилання…</p>`);
  }
}

export function mountAuthPage(kind: Kind, token = ""): void {
  const { siteKey, mail } = getAuthConfig();
  if (!isReady() || getUser() || (!mail && kind !== "login" && kind !== "register")) return;
  const msg = document.getElementById("af-msg");
  const say = (t: string, ok = false): void => { if (msg) { msg.textContent = t; msg.className = "form-msg" + (ok ? " ok" : ""); } };

  if (kind === "verify") {
    void post<{ code?: string }>("/api/auth/verify", { token }).then(async (r) => {
      if (r.ok) { toast("Пошту підтверджено"); await completeSignIn(); }
      else if (r.status === 0 || r.status >= 500) say(serverFailure(r.status, r.data?.code));
      else say(ERRORS.invalid_token + ". Зареєструйтеся ще раз, і ми надішлемо новий лист");
    });
    return;
  }

  const f = document.getElementById("af") as HTMLFormElement | null;
  const slot = document.getElementById("af-ts");     // є лише коли Turnstile налаштовано
  if (!f) return;
  const btn = f.querySelector<HTMLButtonElement>("button[type=submit]") as HTMLButtonElement;
  let wid: string | undefined, captcha = "";
  const bad = (names: string[]): void => f.querySelectorAll<HTMLInputElement>("input").forEach((i) => { if (names.includes(i.name)) i.setAttribute("aria-invalid", "true"); });
  f.addEventListener("input", (e) => (e.target as HTMLElement).removeAttribute("aria-invalid"));
  f.addEventListener("animationend", (e) => { if (e.target === f) f.classList.remove("shake"); });
  f.querySelectorAll<HTMLButtonElement>(".pw-toggle").forEach((b) => b.addEventListener("click", () => {
    const input = b.parentElement?.querySelector("input");
    if (!input) return;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    b.setAttribute("aria-pressed", String(show));
    b.setAttribute("aria-label", show ? "Сховати пароль" : "Показати пароль");
    input.focus();
  }));
  const meter = f.querySelector<HTMLElement>(".pw-meter"), meterText = f.querySelector<HTMLElement>(".pw-meter-t");
  if (meter) {
    f.querySelector<HTMLInputElement>("input[name=password]")?.addEventListener("input", (e) => {
      const s = strength((e.target as HTMLInputElement).value);
      meter.dataset.s = String(s);
      if (meterText) meterText.textContent = STRENGTH[s];
    });
  }
  if (slot && siteKey) {
    void loadTurnstile().then((ts) => {
      if (!ts) return say("Не вдалося завантажити перевірку від ботів. Вимкніть блокувальники реклами й оновіть сторінку");
      if (!slot.isConnected) return;
      wid = ts.render(slot, { sitekey: siteKey, callback: (t) => { captcha = t; }, "expired-callback": () => { captcha = ""; }, "error-callback": () => { captcha = ""; } });
    });
  }

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (slot && !captcha) return say("Дочекайтеся завершення перевірки на бота");
    const body: Record<string, string> = Object.fromEntries(Array.from(new FormData(f), ([k, v]) => [k, String(v)]));
    if (slot) body.turnstile = captcha;
    if (kind === "reset") body.token = token;
    btn.disabled = true;
    btn.classList.add("is-loading");
    btn.setAttribute("aria-busy", "true");
    say("");
    const r = await post<{ error?: string; code?: string; signedIn?: boolean }>("/api/auth/" + kind, body);
    if (!r.ok) {
      captcha = "";                       // токен Turnstile одноразовий
      if (slot) window.turnstile?.reset(wid);
      btn.disabled = false;
      btn.classList.remove("is-loading");
      btn.removeAttribute("aria-busy");
      const code = r.data?.error ?? "";
      bad(BAD_FIELDS[code] ?? []);
      f.classList.remove("shake");
      void f.offsetWidth;                 // перезапуск анімації, якщо помилка повторилась
      f.classList.add("shake");
      if (r.status === 0 || r.status >= 500 || !r.data) return say(serverFailure(r.status, r.data?.code));
      return say(code === "invalid_token" && kind === "reset" ? ERRORS.invalid_token + ". Запросіть нове на сторінці відновлення пароля" : ERRORS[code] ?? GENERIC);
    }
    if (kind === "login" || r.data?.signedIn) return void (await completeSignIn());   // signedIn: реєстрація без листів одразу відкриває сесію
    if (kind === "reset") { toast("Пароль змінено. Тепер увійдіть"); navigate("/login"); return; }
    f.hidden = true;
    say(kind === "register"
      ? `Ми надіслали лист на ${body.email}. Перейдіть за посиланням у ньому, щоб підтвердити пошту. Якщо листа немає, перевірте «Спам».`
      : "Якщо акаунт із такою поштою існує, ми надіслали лист із посиланням для відновлення пароля.", true);
  });
}
