// Вхід, реєстрація й відновлення пароля за поштою: #/login, #/register, #/forgot, #/reset/<токен>, #/verify/<токен>.
// Кожна форма захищена Cloudflare Turnstile; пароль на сервері хешується (PBKDF2), тут він лише передається по HTTPS.
import { completeSignIn, getAuthConfig, getUser, isReady, loginGoogle, post } from "./auth.ts";
import { toast } from "./ui.ts";
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
  `<label class="fld"><span>${label}</span><input name="${name}" type="${type}" ${attrs}>${hint ? `<small>${hint}</small>` : ""}</label>`;
const email = fld("email", "Пошта", "email", 'autocomplete="email" maxlength="254" required');
const pass = (auto: "current-password" | "new-password", label = "Пароль", hint = ""): string =>
  fld("password", label, "password", `autocomplete="${auto}" minlength="${auto === "new-password" ? 8 : 1}" maxlength="128" required`, hint);
const rule = "Щонайменше 8 символів";
const form = (fields: string, submit: string): string =>
  `<form id="af">${fields}${getAuthConfig().siteKey ? '<div class="ts-slot" id="af-ts"></div>' : ""}<button class="btn primary" type="submit">${submit}</button></form><p class="form-msg" id="af-msg" role="alert"></p>`;
const googleBtn = (): string =>
  getAuthConfig().clientId ? `<div class="auth-or"><span>або</span></div><button class="btn" type="button" data-act="google">Увійти через Google</button>` : "";

export function renderAuthPage(kind: Kind): string {
  const { mail } = getAuthConfig();
  if (!isReady()) return `<div class="card auth-card"><p class="dash-muted">Завантаження…</p></div>`;
  if (getUser()) return `<div class="card auth-card"><h1>Ви вже увійшли</h1><a class="btn primary" href="#/dashboard">Особистий кабінет</a></div>`;
  if (!mail && kind !== "login" && kind !== "register") return notFound();   // відновлення пароля й підтвердження пошти потребують листів
  const h = (t: string): string => `<h1>${t}</h1>`;
  const card = (inner: string): string => `<div class="card auth-card">${inner}</div>`;
  switch (kind) {
    case "login":
      return card(h("Вхід") + form(email + pass("current-password"), "Увійти") + googleBtn() +
        `<p class="auth-links">${mail ? '<a href="#/forgot">Забули пароль?</a>' : ""}<a href="#/register">Створити акаунт</a></p>`);
    case "register":
      return card(h("Реєстрація") + form(fld("name", "Ім'я (необов'язково)", "text", 'autocomplete="name" maxlength="60"') + email + pass("new-password", "Пароль", rule), "Створити акаунт") +
        googleBtn() + `<p class="auth-links"><a href="#/login">Вже є акаунт? Увійти</a></p>`);
    case "forgot":
      return card(h("Відновлення пароля") + `<p class="dash-muted">Вкажіть пошту, і ми надішлемо посилання для нового пароля.</p>` + form(email, "Надіслати посилання") +
        `<p class="auth-links"><a href="#/login">Назад до входу</a></p>`);
    case "reset":
      return card(h("Новий пароль") + form(pass("new-password", "Новий пароль", rule), "Зберегти пароль"));
    case "verify":
      return card(h("Підтвердження пошти") + `<p class="form-msg ok" id="af-msg" role="status">Перевіряємо посилання…</p>`);
  }
}

export function mountAuthPage(kind: Kind, token = ""): void {
  const { siteKey, mail } = getAuthConfig();
  if (!isReady() || getUser() || (!mail && kind !== "login" && kind !== "register")) return;
  const msg = document.getElementById("af-msg");
  const say = (t: string, ok = false): void => { if (msg) { msg.textContent = t; msg.className = "form-msg" + (ok ? " ok" : ""); } };

  if (kind === "verify") {
    void post("/api/auth/verify", { token }).then(async (r) => {
      if (r.ok) { toast("Пошту підтверджено"); await completeSignIn(); }
      else say(ERRORS.invalid_token + ". Зареєструйтеся ще раз, і ми надішлемо новий лист");
    });
    return;
  }

  const f = document.getElementById("af") as HTMLFormElement | null;
  const slot = document.getElementById("af-ts");     // є лише коли Turnstile налаштовано
  if (!f) return;
  const btn = f.querySelector<HTMLButtonElement>("button[type=submit]") as HTMLButtonElement;
  let wid: string | undefined, captcha = "";
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
    say("");
    const r = await post<{ error?: string; signedIn?: boolean }>("/api/auth/" + kind, body);
    if (!r.ok) {
      captcha = "";                       // токен Turnstile одноразовий
      if (slot) window.turnstile?.reset(wid);
      btn.disabled = false;
      const code = r.data?.error ?? "";
      return say(code === "invalid_token" && kind === "reset" ? ERRORS.invalid_token + ". Запросіть нове на сторінці відновлення пароля" : ERRORS[code] ?? GENERIC);
    }
    if (kind === "login" || r.data?.signedIn) return void (await completeSignIn());   // signedIn: реєстрація без листів одразу відкриває сесію
    if (kind === "reset") { toast("Пароль змінено. Тепер увійдіть"); location.hash = "#/login"; return; }
    f.hidden = true;
    say(kind === "register"
      ? `Ми надіслали лист на ${body.email}. Перейдіть за посиланням у ньому, щоб підтвердити пошту. Якщо листа немає, перевірте «Спам».`
      : "Якщо акаунт із такою поштою існує, ми надіслали лист із посиланням для відновлення пароля.", true);
  });
}
