// Завдання курсу HTML, глава 07 «Семантика й доступність» (уроки 26–29). Виконуються в браузері (runtime: "page"), еталони: tests/solutions/html-ch07.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "html", runtime: "page", edit: "html", file: "index.html", editorLang: "html", premium: false } as const;

export const TASKS_07: readonly PageTask[] = [
  {
    ...base, id: "html-semantic", lesson: "html/26", xp: 30,
    title: "Семантична розмітка сторінки новин",
    context: "Сторінка з одних div нічого не каже про свій устрій. Семантичні елементи підписують ролі блоків: їх розуміють пошукові системи, а програми читання дозволяють переходити між ними.",
    brief: [
      "Замініть універсальні div на семантичні теги: шапка це <code>header</code>, меню <code>nav</code> (зі списком посилань), основний вміст <code>main</code>, стаття <code>article</code>, бічна колонка <code>aside</code>, підвал <code>footer</code>.",
      "У результаті <code>div</code> не лишається. На сторінці має бути рівно один <code>main</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Новини</title></head>
<body>
  <div class="header"><h1>Новини</h1></div>
  <div class="menu"><a href="/">Головна</a> <a href="/about">Про нас</a></div>
  <div class="main">
    <div class="post"><h2>Перша новина</h2><p>Текст новини.</p></div>
    <div class="side">Реклама</div>
  </div>
  <div class="footer">© 2026</div>
</body>
</html>
`,
    checks: [
      { name: "Шапка в <header>", selector: "header", text: "Новини" },
      { name: "Меню в <nav> із посиланнями", selector: "nav a", count: { min: 2 } },
      { name: "Рівно один <main>", selector: "main", count: 1 },
      { name: "Новина в <article>", selector: "article", text: "Перша новина" },
      { name: "Бічна колонка в <aside>", selector: "aside" },
      { name: "Підвал у <footer>", selector: "footer", text: "2026" },
      { name: "Універсальних <div> не лишилось", selector: "div", not: true },
    ],
  },
  {
    ...base, id: "html-a11y", lesson: "html/27", xp: 30,
    title: "Виправте проблеми доступності",
    context: "Більшість проблем доступності це відсутні атрибути й невдалі елементи, які легко виправити. Вони важливі для людей із програмами читання й для пошукових систем.",
    brief: [
      "У сторінці п'ять проблем доступності. Виправте їх: вкажіть мову документа (<code>lang</code>), додайте <code>alt</code> зображенню, зв'яжіть поле пошуку з міткою <code>label</code>, дайте кнопці текст або <code>aria-label</code>, а головний заголовок зробіть <code>h1</code>, а не <code>h3</code>.",
    ],
    starter: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Магазин</title></head>
<body>
  <h3>Магазин книг</h3>
  <img src="cover.jpg">
  <input type="search" id="q">
  <button></button>
</body>
</html>
`,
    checks: [
      { name: "Мова документа вказана", selector: "html", attr: { name: "lang", matches: ".+" } },
      { name: "Головний заголовок це h1", selector: "h1", text: "Магазин книг" },
      { name: "Усі зображення мають непорожній alt", selector: "img:not([alt]), img[alt=\"\"]", not: true },
      { name: "Поле пошуку має мітку", selector: "label[for=\"q\"]" },
      { name: "Кнопка має доступну назву", selector: "button", count: 1, source: { matches: "<button[^>]*aria-label=\"[^\"]+\"|<button[^>]*>\\s*[^<\\s][^<]*</button>" } },
    ],
  },
  {
    ...base, id: "html-seo-meta", lesson: "html/28", xp: 35,
    title: "Мета-теги й Open Graph",
    context: "Пошуковики й месенджери читають метадані з head: за ними вони формують заголовок, опис і картку посилання. Без них ваша сторінка виглядає випадково.",
    brief: [
      "У <code>&lt;head&gt;</code> додайте: <code>&lt;title&gt;</code>, <code>meta name=\"description\"</code> (від 50 до 160 символів), <code>meta name=\"viewport\"</code>, Open Graph теги <code>og:title</code>, <code>og:description</code> і <code>og:image</code> (через <code>property</code>) та канонічне посилання <code>&lt;link rel=\"canonical\" href=\"https://example.com/\"&gt;</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
</head>
<body>
  <h1>Курси програмування</h1>
</body>
</html>
`,
    checks: [
      { name: "Є заголовок сторінки", selector: "head > title", text: "" },
      { name: "Опис сторінки від 50 до 160 символів", selector: "meta[name=\"description\"]", attr: { name: "content", matches: "^.{50,160}$" } },
      { name: "Мета-тег viewport", selector: "meta[name=\"viewport\"][content*=\"width=device-width\"]" },
      { name: "Open Graph: og:title", selector: "meta[property=\"og:title\"][content]" },
      { name: "Open Graph: og:description", selector: "meta[property=\"og:description\"][content]" },
      { name: "Open Graph: og:image", selector: "meta[property=\"og:image\"][content]" },
      { name: "Канонічне посилання", selector: "link[rel=\"canonical\"][href=\"https://example.com/\"]" },
    ],
  },
  {
    ...base, id: "html-modern-elements", lesson: "html/29", xp: 30,
    title: "Запитання й відповіді, прогрес, діалог і підказки",
    context: "Рідні елементи роблять без жодного скрипта те, що раніше вимагало бібліотек: згортання блоків, індикатори, діалоги та підказки при введенні.",
    brief: [
      "Створіть блок запитань: три <code>&lt;details&gt;</code> із <code>&lt;summary&gt;</code>, перший розкритий (<code>open</code>). Додайте <code>&lt;progress value=\"70\" max=\"100\"&gt;</code> та <code>&lt;meter&gt;</code> з атрибутами <code>min</code>, <code>max</code>, <code>low</code>, <code>high</code>, <code>optimum</code> і <code>value</code>.",
      "Додайте <code>&lt;dialog open&gt;</code> із формою <code>method=\"dialog\"</code> і двома кнопками. Також поле міста <code>list=\"cities\"</code> із <code>&lt;datalist id=\"cities\"&gt;</code> із трьома варіантами <code>option</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Довідка</title></head>
<body>
  <h1>Довідка</h1>
  <p>Як оплатити?</p>
  <p>Скільки триває доставка?</p>
  <p>Як повернути товар?</p>
  <p>Місто: <input type="text" id="city"></p>
</body>
</html>
`,
    checks: [
      { name: "Три блоки details із summary", selector: "details > summary", count: 3 },
      { name: "Лише перший блок розкритий", selector: "details[open]", count: 1 },
      { name: "Індикатор progress із value і max", selector: "progress[value=\"70\"][max=\"100\"]" },
      { name: "meter із діапазоном і зонами", selector: "meter[min][max][low][high][optimum][value]" },
      { name: "Діалог із формою method=dialog", selector: "dialog form[method=\"dialog\"]" },
      { name: "У діалозі дві кнопки", selector: "dialog form button", count: 2 },
      { name: "Поле міста пов'язане з datalist", selector: "input[list=\"cities\"]" },
      { name: "datalist cities із трьома варіантами", selector: "datalist#cities > option", count: 3 },
    ],
  },
];
