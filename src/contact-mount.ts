// Поведінка форми підтримки: підстановка даних акаунта, лічильник, перевірка, Turnstile, відправка й ефекти.
import { tr } from "./i18n.ts";
import { getAuthConfig, getUser, isReady, post } from "./auth.ts";
import { loadTurnstile } from "./login.ts";
import { DEFAULT_TOPIC, isTopic, MSG_MAX, MSG_MIN } from "./support.ts";
import type { PublicUser } from "./types.ts";

const ERR = (): Record<string, string> => ({
  invalid_email: tr("Перевірте адресу пошти", "Check the email address"),
  invalid_message: tr(`Напишіть від ${MSG_MIN} до ${MSG_MAX} символів`, `Write between ${MSG_MIN} and ${MSG_MAX} characters`),
  invalid_topic: tr("Оберіть тему", "Choose a topic"),
  captcha_failed: tr("Не вдалося пройти перевірку. Спробуйте ще раз", "The check failed. Please try again"),
  too_many_requests: tr("Забагато звернень. Спробуйте трохи пізніше", "Too many messages. Please try again a bit later"),
});
const BAD: Record<string, string[]> = { invalid_email: ["email"], invalid_message: ["message"] };
const serverFailure = (status: number, code?: string): string =>
  status === 0 ? tr("Немає зв'язку із сервером. Перевірте інтернет і спробуйте ще раз", "No connection to the server. Check your internet and try again")
    : tr(`Помилка сервера (код ${status}${code ? ", " + code : ""}). Спробуйте ще раз трохи пізніше`, `Server error (code ${status}${code ? ", " + code : ""}). Please try again a little later`);

const cameFrom = (q: URLSearchParams): string => {
  const f = q.get("from");
  if (f && f.startsWith("/")) return f.slice(0, 200);
  try { const u = new URL(document.referrer); return u.origin === location.origin ? u.pathname : ""; } catch { return ""; }
};

export function mountContact(user: PublicUser | null): void {
  const f = document.getElementById("ct-form") as HTMLFormElement | null;
  if (!f) return;
  const msg = document.getElementById("ct-msg") as HTMLElement, ok = document.getElementById("ct-ok") as HTMLElement, count = document.getElementById("ct-count") as HTMLElement;
  const field = (n: string): HTMLInputElement | HTMLTextAreaElement => f.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement;
  const ta = field("message") as HTMLTextAreaElement, btn = f.querySelector("button[type=submit]") as HTMLButtonElement;
  const q = new URLSearchParams(location.search);
  const say = (t: string): void => { msg.textContent = t; };

  const topic = q.get("topic");
  (f.querySelector(`input[name=topic][value=${isTopic(topic) ? topic : DEFAULT_TOPIC}]`) as HTMLInputElement).checked = true;

  // Дані акаунта підставляємо, коли відомо, хто це; те, що користувач уже встиг ввести, не чіпаємо
  const prefill = (u: PublicUser | null): void => {
    if (!u) return;
    if (!field("email").value) field("email").value = u.email;
    if (!field("name").value && u.name) field("name").value = u.name;
  };
  prefill(user);
  // Хто ввійшов і чи ввімкнено Turnstile, стає відомо після запуску сайту: чекаємо цього, не перемальовуючи форму
  const whenReady = (fn: () => void): void => {
    if (isReady()) return fn();
    let tries = 0;
    const iv = setInterval(() => {
      if (!f.isConnected) return clearInterval(iv);
      if (isReady() || ++tries > 60) { clearInterval(iv); fn(); }
    }, 80);
  };

  const refreshCount = (): void => {
    const n = ta.value.length;
    count.textContent = `${n} / ${MSG_MAX}`;
    count.classList.toggle("warn", n > MSG_MAX * 0.9);
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 360) + "px";
  };
  ta.addEventListener("input", refreshCount);
  f.addEventListener("input", (e) => (e.target as HTMLElement).removeAttribute("aria-invalid"));
  f.addEventListener("animationend", (e) => { if (e.target === f) f.classList.remove("shake"); });

  let wid: string | undefined, captcha = "", slot: HTMLElement | null = null;
  whenReady(() => {
    prefill(getUser());
    const key = getAuthConfig().siteKey;
    if (!key || !f.isConnected) return;
    slot = Object.assign(document.createElement("div"), { className: "ts-slot", id: "ct-ts" });
    btn.before(slot);
    void loadTurnstile().then((ts) => {
      if (!ts) return say(tr("Не вдалося завантажити перевірку від ботів. Вимкніть блокувальники реклами й оновіть сторінку", "Could not load the bot check. Turn off ad blockers and reload the page"));
      if (!slot?.isConnected) return;
      wid = ts.render(slot, { sitekey: key, callback: (t) => { captcha = t; }, "expired-callback": () => { captcha = ""; }, "error-callback": () => { captcha = ""; } });
    });
  });
  const resetCaptcha = (): void => { captcha = ""; if (slot) window.turnstile?.reset(wid); };

  const fail = (text: string, bad: string[] = []): void => {
    bad.forEach((n) => field(n).setAttribute("aria-invalid", "true"));
    say(text);
    f.classList.remove("shake");
    void f.offsetWidth;                  // перезапуск анімації, якщо помилка повторилась
    f.classList.add("shake");
  };

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = field("email").value.trim(), message = ta.value.trim();
    say("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(ERR().invalid_email, ["email"]);
    if (message.length < MSG_MIN) return fail(ERR().invalid_message, ["message"]);
    if (!isReady()) return fail(tr("Зачекайте мить і спробуйте ще раз", "Wait a moment and try again"));
    if (slot && !captcha) return fail(tr("Дочекайтеся завершення перевірки на бота", "Please wait for the bot check to finish"));
    btn.disabled = true;
    btn.classList.add("is-loading");
    btn.setAttribute("aria-busy", "true");
    const r = await post<{ error?: string; code?: string }>("/api/contact", {
      topic: (f.querySelector("input[name=topic]:checked") as HTMLInputElement).value, name: field("name").value.trim(), email, message,
      website: field("website").value, turnstile: slot ? captcha : undefined, page: cameFrom(q), vp: `${innerWidth}x${innerHeight}`,
      ua: navigator.userAgent.slice(0, 300), motion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "reduce" : "full",
    });
    btn.disabled = false;
    btn.classList.remove("is-loading");
    btn.removeAttribute("aria-busy");
    if (!r.ok) {
      resetCaptcha();
      const code = r.data?.error ?? "";
      return fail(r.status === 0 || r.status >= 500 || !r.data ? serverFailure(r.status, r.data?.code) : ERR()[code] ?? tr("Не вдалося надіслати. Спробуйте пізніше", "Could not send. Please try again later"), BAD[code]);
    }
    (document.getElementById("ct-ok-text") as HTMLElement).textContent = tr(`Ми отримали ваше повідомлення й відповімо на ${email}.`, `We received your message and will reply to ${email}.`);
    f.hidden = true;
    ok.hidden = false;
    (document.getElementById("ct-ok-h") as HTMLElement).focus();
  });

  document.getElementById("ct-again")?.addEventListener("click", () => {
    ta.value = "";
    refreshCount();
    resetCaptcha();
    ok.hidden = true;
    f.hidden = false;
    ta.focus();
  });
}
