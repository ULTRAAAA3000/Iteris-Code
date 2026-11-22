// Вхід, реєстрація й відновлення пароля за поштою: /login, /register, /forgot, /reset/<токен>, /verify/<токен>.
// Кожна форма захищена Cloudflare Turnstile; пароль на сервері хешується (PBKDF2), тут він лише передається по HTTPS.
import { completeSignIn, getAuthConfig, getUser, isReady, post } from "./auth.ts";
import { l, tr } from "./i18n.ts";
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
const titles = (): Record<Kind, string> => ({ login: tr("Вхід", "Sign in"), register: tr("Реєстрація", "Sign up"), forgot: tr("Відновлення пароля", "Password recovery"), reset: tr("Новий пароль", "New password"), verify: tr("Підтвердження пошти", "Email confirmation") });
export const authTitle = (a: string): string => titles()[a as Kind] ?? tr("Акаунт", "Account");

const errors = (): Record<string, string> => ({
  invalid_credentials: tr("Невірна пошта або пароль", "Wrong email or password"),
  email_not_verified: tr("Спершу підтвердьте пошту: перейдіть за посиланням із листа", "Please confirm your email first: follow the link in the message"),
  captcha_failed: tr("Не вдалося пройти перевірку. Спробуйте ще раз", "The check failed. Please try again"),
  too_many_requests: tr("Забагато спроб. Спробуйте трохи пізніше", "Too many attempts. Please try again a bit later"),
  invalid_email: tr("Перевірте адресу пошти", "Check the email address"),
  weak_password: tr("Пароль має містити від 8 до 128 символів", "The password must be 8 to 128 characters long"),
  invalid_token: tr("Посилання недійсне або застаріле", "The link is invalid or has expired"),
  email_taken: tr("Акаунт із такою поштою вже є. Увійдіть", "An account with this email already exists. Sign in"),
  invalid_age: tr("Вкажіть свій вік числом", "Enter your age as a number"),
  too_young: tr("Вам ще немає 15 років, тому реєстрація поки недоступна. Приходьте, коли підростете", "You are not 15 yet, so registration is not available for now. Come back when you are older"),
});
const generic = (): string => tr("Не вдалося виконати запит. Спробуйте пізніше", "Could not complete the request. Please try again later");
// Збій самого сервера (5xx, відповідь без JSON) або відсутність зв'язку: показуємо код, щоб його можна було передати розробнику
const serverFailure = (status: number, code?: string): string =>
  status === 0 ? tr("Немає зв'язку із сервером. Перевірте інтернет і спробуйте ще раз", "No connection to the server. Check your internet and try again")
    : tr(`Помилка сервера (код ${status}${code ? ", " + code : ""}). Спробуйте ще раз трохи пізніше`, `Server error (code ${status}${code ? ", " + code : ""}). Please try again a little later`);

let tsLoad: Promise<TurnstileApi | null> | null = null;
export function loadTurnstile(): Promise<TurnstileApi | null> {
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
const email = (): string => fld("email", tr("Пошта", "Email"), "email", 'autocomplete="email" maxlength="254" required');
const pass = (auto: "current-password" | "new-password", label = tr("Пароль", "Password"), hint = ""): string => {
  const isNew = auto === "new-password";
  return `<label class="fld"><span class="lbl">${label}</span><span class="pw"><input name="password" type="password" autocomplete="${auto}" minlength="${isNew ? 8 : 1}" maxlength="128" required>`
    + `<button class="pw-toggle" type="button" aria-label="${tr("Показати пароль", "Show password")}" aria-pressed="false">${EYE}${EYE_OFF}</button></span>`
    + (hint ? `<small>${hint}</small>` : "")
    + (isNew ? `<span class="pw-meter" data-s="0" aria-hidden="true"><i></i><i></i><i></i><i></i></span><small class="pw-meter-t" aria-live="polite"></small>` : "")
    + `</label>`;
};
const strengthText = (): string[] => tr(["", "Слабкий пароль", "Непоганий пароль", "Добрий пароль", "Надійний пароль"], ["", "Weak password", "Fair password", "Good password", "Strong password"]);
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
  invalid_credentials: ["email", "password"], email_not_verified: ["email"], invalid_email: ["email"], weak_password: ["password"], email_taken: ["email"], invalid_age: ["age"], too_young: ["age"],
};
const rule = (): string => tr("Щонайменше 8 символів", "At least 8 characters");
const form = (fields: string, submit: string): string =>
  `<form id="af">${fields}${getAuthConfig().siteKey ? '<div class="ts-slot" id="af-ts"></div>' : ""}<button class="btn primary" type="submit">${submit}</button></form><p class="form-msg" id="af-msg" role="alert"></p>`;
const termsNote = (): string => tr(`<p class="auth-note">Продовжуючи, ви підтверджуєте, що вам є 15 років, і погоджуєтесь з <a href="${l("/terms")}">Умовами користування</a> та <a href="${l("/privacy")}">Політикою конфіденційності</a>.</p>`, `<p class="auth-note">By continuing, you confirm that you are at least 15 years old and agree to the <a href="${l("/terms")}">Terms of Use</a> and the <a href="${l("/privacy")}">Privacy Policy</a>.</p>`);
const GH_ICON = `<svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
/** Кнопки входу через зовнішні сервіси: лише ті, що налаштовані на сервері */
const googleBtn = (): string => {
  const { clientId, githubId } = getAuthConfig();
  if (!clientId && !githubId) return "";
  return `<div class="auth-or"><span>${tr("або", "or")}</span></div><div class="auth-oauth">`
    + (clientId ? `<button class="btn" type="button" data-act="google">${tr("Увійти через Google", "Sign in with Google")}</button>` : "")
    + (githubId ? `<button class="btn" type="button" data-act="github">${GH_ICON}${tr("Увійти через GitHub", "Sign in with GitHub")}</button>` : "")
    + `</div>`;
};

export function renderAuthPage(kind: Kind): string {
  const { mail } = getAuthConfig();
  if (!isReady()) return `<div class="card auth-card" aria-busy="true" aria-label="${tr("Завантаження", "Loading")}"><i class="sk h"></i><i class="sk"></i><i class="sk"></i><i class="sk s"></i></div>`;
  if (getUser()) return `<div class="card auth-card"><h1>${tr("Ви вже увійшли", "You are already signed in")}</h1><a class="btn primary" href="/dashboard">${tr("Особистий кабінет", "My account")}</a></div>`;
  if (!mail && kind !== "login" && kind !== "register") return notFound();   // відновлення пароля й підтвердження пошти потребують листів
  const h = (t: string): string => `<h1>${t}</h1>`;
  const card = (inner: string): string => `<div class="card auth-card">${inner}</div>`;
  switch (kind) {
    case "login":
      return card(h(tr("Вхід", "Sign in")) + form(email() + pass("current-password"), tr("Увійти", "Sign in")) + googleBtn() + termsNote() +
        `<p class="auth-links">${mail ? `<a href="/forgot">${tr("Забули пароль?", "Forgot your password?")}</a>` : ""}<a href="/register">${tr("Створити акаунт", "Create an account")}</a></p>`);
    case "register":
      return card(h(tr("Реєстрація", "Sign up")) + form(fld("name", tr("Ім'я (необов'язково)", "Name (optional)"), "text", 'autocomplete="name" maxlength="60"') + email() + fld("age", tr("Ваш вік", "Your age"), "number", 'inputmode="numeric" min="1" max="120" required', tr("Потрібно мати щонайменше 15 років", "You must be at least 15 years old")) + pass("new-password", tr("Пароль", "Password"), rule()), tr("Створити акаунт", "Create an account")) +
        termsNote() + googleBtn() + `<p class="auth-links"><a href="/login">${tr("Вже є акаунт? Увійти", "Already have an account? Sign in")}</a></p>`);
    case "forgot":
      return card(h(tr("Відновлення пароля", "Password recovery")) + `<p class="dash-muted">${tr("Вкажіть пошту, і ми надішлемо посилання для нового пароля.", "Enter your email and we will send a link to set a new password.")}</p>` + form(email(), tr("Надіслати посилання", "Send the link")) +
        `<p class="auth-links"><a href="/login">${tr("Назад до входу", "Back to sign in")}</a></p>`);
    case "reset":
      return card(h(tr("Новий пароль", "New password")) + form(pass("new-password", tr("Новий пароль", "New password"), rule()), tr("Зберегти пароль", "Save the password")));
    case "verify":
      return card(h(tr("Підтвердження пошти", "Email confirmation")) + `<p class="form-msg wait" id="af-msg" role="status">${tr("Перевіряємо посилання…", "Checking the link…")}</p>`);
  }
}

export function mountAuthPage(kind: Kind, token = ""): void {
  const { siteKey, mail } = getAuthConfig();
  if (!isReady() || getUser() || (!mail && kind !== "login" && kind !== "register")) return;
  const msg = document.getElementById("af-msg");
  const say = (t: string, ok = false): void => { if (msg) { msg.textContent = t; msg.className = "form-msg" + (ok ? " ok" : ""); } };

  if (kind === "verify") {
    void post<{ code?: string }>("/api/auth/verify", { token }).then(async (r) => {
      if (r.ok) { toast(tr("Пошту підтверджено", "Email confirmed")); await completeSignIn(); }
      else if (r.status === 0 || r.status >= 500) say(serverFailure(r.status, r.data?.code));
      else say(errors().invalid_token + tr(". Зареєструйтеся ще раз, і ми надішлемо новий лист", ". Sign up again and we will send you a new email"));
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
    b.setAttribute("aria-label", show ? tr("Сховати пароль", "Hide password") : tr("Показати пароль", "Show password"));
    input.focus();
  }));
  const meter = f.querySelector<HTMLElement>(".pw-meter"), meterText = f.querySelector<HTMLElement>(".pw-meter-t");
  if (meter) {
    f.querySelector<HTMLInputElement>("input[name=password]")?.addEventListener("input", (e) => {
      const s = strength((e.target as HTMLInputElement).value);
      meter.dataset.s = String(s);
      if (meterText) meterText.textContent = strengthText()[s];
    });
  }
  if (slot && siteKey) {
    void loadTurnstile().then((ts) => {
      if (!ts) return say(tr("Не вдалося завантажити перевірку від ботів. Вимкніть блокувальники реклами й оновіть сторінку", "Could not load the bot check. Turn off ad blockers and reload the page"));
      if (!slot.isConnected) return;
      wid = ts.render(slot, { sitekey: siteKey, callback: (t) => { captcha = t; }, "expired-callback": () => { captcha = ""; }, "error-callback": () => { captcha = ""; } });
    });
  }

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (slot && !captcha) return say(tr("Дочекайтеся завершення перевірки на бота", "Please wait for the bot check to finish"));
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
      return say(code === "invalid_token" && kind === "reset" ? errors().invalid_token + tr(". Запросіть нове на сторінці відновлення пароля", ". Request a new one on the password recovery page") : errors()[code] ?? generic());
    }
    if (kind === "login" || r.data?.signedIn) return void (await completeSignIn());   // signedIn: реєстрація без листів одразу відкриває сесію
    if (kind === "reset") { toast(tr("Пароль змінено. Тепер увійдіть", "Password changed. Now sign in")); navigate("/login"); return; }
    f.hidden = true;
    say(kind === "register"
      ? tr(`Ми надіслали лист на ${body.email}. Перейдіть за посиланням у ньому, щоб підтвердити пошту. Якщо листа немає, перевірте «Спам».`, `We sent an email to ${body.email}. Follow the link in it to confirm your email. If you do not see it, check “Spam”.`)
      : tr("Якщо акаунт із такою поштою існує, ми надіслали лист із посиланням для відновлення пароля.", "If an account with this email exists, we sent an email with a link to recover the password."), true);
  });
}
