// Публічне демо-завдання на лендингу («Спробуй одразу, без входу»), пункт А3 з Documentation/mvp.md.
// Це окрема вправа, а не завдання курсу: її немає в content/ і ніде не нараховується XP, тому закритий зміст уроків (D17) не страждає.
// Модуль чистий (без DOM і мережі): розмітку використовує і браузер, і збірка для пошуковиків; поведінка в demo-mount.ts.
import type { JsTask, PageTask } from "./tasks/types.ts";

export type DemoLang = "js" | "html";
export const DEMO_LANGS: readonly DemoLang[] = ["js", "html"];
export const DEMO_LABEL: Record<DemoLang, string> = { js: "JavaScript", html: "HTML" };

const base = { lesson: "demo", course: "demo", premium: false, xp: 0 } as const;

export const DEMO_JS: JsTask = {
  ...base, id: "demo-js", title: "Подвоїти число",
  context: "Функція, що приймає значення й повертає результат, це основа будь-якої програми.",
  brief: ["Напишіть функцію <code>double(n)</code>, що повертає число <code>n</code>, помножене на 2.", "Наприклад, <code>double(4)</code> має дати <code>8</code>."],
  starter: "function double(n) {\n  // поверніть n, помножене на 2\n}\n",
  tests: `describe("double", () => {
  it("подвоює додатне число", () => { expect(double(4)).toBe(8); });
  it("нуль лишається нулем", () => { expect(double(0)).toBe(0); });
  it("працює з від'ємними числами", () => { expect(double(-3)).toBe(-6); });
});`,
};

export const DEMO_HTML: PageTask = {
  ...base, id: "demo-html", title: "Заголовок і кнопка",
  context: "Будь-яка сторінка в інтернеті складається з тегів: заголовків, текстів, кнопок.",
  brief: ["Додайте на сторінку заголовок <code>&lt;h1&gt;</code> з текстом «Привіт» і кнопку <code>&lt;button&gt;</code>.", "Результат одразу з'явиться в попередньому перегляді."],
  runtime: "page", edit: "html", file: "index.html", editorLang: "html",
  starter: '<!doctype html>\n<html lang="uk">\n<head>\n  <meta charset="utf-8">\n  <title>Демо</title>\n</head>\n<body>\n  <!-- додайте заголовок h1 з текстом Привіт і кнопку button -->\n</body>\n</html>\n',
  checks: [
    { name: "На сторінці є заголовок <h1>", selector: "h1", hint: "Додайте <h1>Привіт</h1> між тегами <body> і </body>" },
    { name: "Заголовок містить слово «Привіт»", selector: "h1", text: "Привіт", hint: "Текст заголовка має бути «Привіт»" },
    { name: "На сторінці є кнопка <button>", selector: "button", hint: "Додайте <button>Натисни</button>" },
  ],
};

export const demoTask = (l: DemoLang): JsTask | PageTask => (l === "js" ? DEMO_JS : DEMO_HTML);

/** Розмітка секції на лендингу; текст завдання для JavaScript вже всередині, щоб його бачили й пошуковики, і браузер без скриптів */
export function demoHtml(): string {
  const t = DEMO_JS;
  return `<section id="try" class="demo" aria-labelledby="try-h">
    <h2 class="section-title" id="try-h">Спробуй одразу, без входу</h2>
    <p class="section-sub">Обери мову, виконай маленьке завдання й одразу побачиш автоматичну перевірку. Це окрема демо-вправа: основні уроки й завдання відкриваються після реєстрації.</p>
    <div class="card dm-card">
      <div class="dm-tabs" role="tablist" aria-label="Мова завдання">
        ${DEMO_LANGS.map((l, i) => `<button type="button" role="tab" id="dm-tab-${l}" class="dm-tab" data-dm="${l}" aria-selected="${i === 0}" aria-controls="dm-panel" tabindex="${i === 0 ? 0 : -1}">${DEMO_LABEL[l]}</button>`).join("")}
      </div>
      <div class="dm-panel" id="dm-panel" role="tabpanel" aria-labelledby="dm-tab-js">
        <h3 class="dm-title" id="dm-title">${t.title}</h3>
        <div class="dm-brief" id="dm-brief">${t.brief.map((p) => `<p>${p}</p>`).join("")}</div>
        <label class="dm-label" for="dm-code">Ваш код</label>
        <textarea id="dm-code" class="dm-editor" rows="7" spellcheck="false" autocomplete="off" autocapitalize="off" aria-describedby="dm-hint">${t.starter.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</textarea>
        <p class="dm-hint" id="dm-hint">Ctrl+Enter, щоб перевірити</p>
        <div class="dm-actions"><button type="button" class="btn primary" id="dm-run">Перевірити</button><button type="button" class="btn" id="dm-reset">Почати спочатку</button></div>
        <div class="dm-preview" id="dm-preview-wrap" hidden><div class="dm-preview-label">Попередній перегляд</div><iframe id="dm-preview" class="dm-preview-frame" sandbox="allow-same-origin" title="Попередній перегляд сторінки"></iframe></div>
        <ul class="dm-results" id="dm-results" aria-live="polite"></ul>
        <div class="dm-win" id="dm-win" hidden>
          <div class="dm-confetti" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</div>
          <svg class="dm-check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l8 8 15-17"/></svg>
          <h3 tabindex="-1" id="dm-win-h">Готово, усе працює!</h3>
          <p>Саме так виглядає навчання на платформі: коротке завдання й миттєва перевірка. Уроків і завдань у курсах значно більше.</p>
          <div class="dm-win-actions"><a class="btn primary" href="/register">Створити акаунт безкоштовно</a><a class="btn" href="/courses">Дивитись курси</a></div>
        </div>
      </div>
    </div>
  </section>`;
}
