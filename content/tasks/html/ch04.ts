// Завдання курсу HTML, глава 04 «Медіа» (уроки 14–17). Виконуються в браузері (runtime: "page"), еталони: tests/solutions/html-ch04.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "html", runtime: "page", edit: "html", file: "index.html", editorLang: "html", premium: false } as const;

export const TASKS_04: readonly PageTask[] = [
  {
    ...base, id: "html-media", lesson: "html/14", xp: 20,
    title: "Галерея зображень з alt, розмірами й лінню",
    context: "Зображення це половина ваги сторінки. Правильні alt, розміри й ліниве завантаження роблять її швидшою, доступнішою й зрозумілою пошуковикам.",
    brief: [
      "Створіть галерею з трьох зображень <code>photo1.jpg</code>, <code>photo2.jpg</code>, <code>photo3.jpg</code>. Усі три мають змістовний <code>alt</code>, <code>width=\"400\"</code> і <code>height=\"300\"</code>. Другому і третьому додайте <code>loading=\"lazy\"</code>.",
      "Між галереєю та підвалом поставте декоративну лінію-розділювач: <code>&lt;img src=\"divider.png\"&gt;</code> із порожнім <code>alt=\"\"</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Галерея</title></head>
<body>
  <h1>Галерея</h1>
  <img src="photo1.jpg">
  <img src="photo2.jpg">
  <img src="photo3.jpg">
  <p>Кінець галереї</p>
</body>
</html>
`,
    checks: [
      { name: "Три зображення photo1, photo2, photo3", selector: "img[src^=\"photo\"]", count: 3 },
      { name: "У всіх трьох фото непорожній alt", selector: "img[src^=\"photo\"]:not([alt]), img[src^=\"photo\"][alt=\"\"]", not: true },
      { name: "Розміри 400×300 у всіх фото", selector: "img[src^=\"photo\"][width=\"400\"][height=\"300\"]", count: 3 },
      { name: "Ліниве завантаження у двох останніх фото", selector: "img[src=\"photo2.jpg\"][loading=\"lazy\"], img[src=\"photo3.jpg\"][loading=\"lazy\"]", count: 2 },
      { name: "Декоративний розділювач із порожнім alt", selector: "img[src=\"divider.png\"][alt=\"\"]" },
    ],
  },
  {
    ...base, id: "html-figure-picture", lesson: "html/15", xp: 30,
    title: "Ілюстрація з підписом і адаптивними джерелами",
    context: "На різних екранах потрібні різні файли: телефону вузька картинка, комп'ютеру широка. Picture і srcset віддають кожному лише те, що йому треба, а figure додає підпис.",
    brief: [
      "Зробіть блок <code>&lt;figure&gt;</code> з підписом <code>&lt;figcaption&gt;</code> «Весняний розпродаж». Усередині <code>&lt;picture&gt;</code> із двома <code>&lt;source&gt;</code>: перший <code>media=\"(min-width: 800px)\"</code> із <code>srcset=\"banner-wide.webp\"</code> та <code>type=\"image/webp\"</code>, другий <code>srcset=\"banner-narrow.webp\"</code> і <code>type=\"image/webp\"</code>. Остання частина picture це <code>&lt;img src=\"banner-narrow.jpg\"&gt;</code> із <code>alt</code>.",
      "Нижче додайте другу картинку <code>lake-800.jpg</code> із <code>srcset</code> із трьох файлів (480w, 800w, 1600w) і атрибутом <code>sizes</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Банер</title></head>
<body>
  <img src="banner-narrow.jpg">
  <p>Весняний розпродаж</p>
  <img src="lake-800.jpg">
</body>
</html>
`,
    checks: [
      { name: "figure із підписом figcaption «Весняний розпродаж»", selector: "figure > figcaption", text: "Весняний розпродаж" },
      { name: "picture усередині figure з двома source", selector: "figure > picture > source", count: 2 },
      { name: "Перший source із media (min-width: 800px) і webp", selector: "picture > source[media=\"(min-width: 800px)\"][srcset=\"banner-wide.webp\"][type=\"image/webp\"]" },
      { name: "Другий source вужче зображення", selector: "picture > source[srcset=\"banner-narrow.webp\"][type=\"image/webp\"]" },
      { name: "Запасний img в picture з alt", selector: "picture > img[src=\"banner-narrow.jpg\"]", attr: { name: "alt", matches: ".+" } },
      { name: "Друге зображення має srcset із трьох файлів і sizes", selector: "img[src=\"lake-800.jpg\"][sizes]", attr: { name: "srcset", matches: "480w.*800w.*1600w" } },
    ],
  },
  {
    ...base, id: "html-audio-video", lesson: "html/16", xp: 25,
    title: "Відео з субтитрами та аудіо",
    context: "Власний програвач потребує кількох форматів, обкладинки й субтитрів: так відео працює в усіх браузерах і доступне людям без звуку.",
    brief: [
      "Додайте відео: <code>&lt;video controls poster=\"cover.jpg\"&gt;</code> з двома <code>&lt;source&gt;</code> (<code>clip.mp4</code> типу <code>video/mp4</code> і <code>clip.webm</code> типу <code>video/webm</code>), субтитрами <code>&lt;track kind=\"subtitles\" src=\"uk.vtt\" srclang=\"uk\" label=\"Українська\"&gt;</code> і запасним абзацом із посиланням на <code>clip.mp4</code>.",
      "Нижче додайте аудіо: <code>&lt;audio controls preload=\"none\"&gt;</code> із джерелом <code>song.mp3</code> (<code>audio/mpeg</code>).",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Медіа</title></head>
<body>
  <h1>Медіа</h1>
  <p>Тут буде відео.</p>
  <p>Тут буде аудіо.</p>
</body>
</html>
`,
    checks: [
      { name: "Відео з controls і poster cover.jpg", selector: "video[controls][poster=\"cover.jpg\"]" },
      { name: "Два джерела відео: mp4 і webm", selector: "video > source[type=\"video/mp4\"][src=\"clip.mp4\"], video > source[type=\"video/webm\"][src=\"clip.webm\"]", count: 2 },
      { name: "Субтитри: track kind=subtitles, srclang=uk", selector: "video > track[kind=\"subtitles\"][srclang=\"uk\"][src=\"uk.vtt\"]" },
      { name: "Запасне посилання на clip.mp4 всередині відео", selector: "video a[href=\"clip.mp4\"]" },
      { name: "Аудіо з controls і preload=none", selector: "audio[controls][preload=\"none\"]" },
      { name: "Джерело аудіо song.mp3", selector: "audio > source[src=\"song.mp3\"][type=\"audio/mpeg\"]" },
    ],
  },
  {
    ...base, id: "html-iframe", lesson: "html/17", xp: 25,
    title: "Безпечне вбудовування: карта й віджет",
    context: "Чужий вміст на вашій сторінці це ризик і для безпеки, і для швидкості. Title, sandbox і ліниве завантаження роблять вбудову доступною, безпечною й швидкою.",
    brief: [
      "Вбудуйте карту: <code>&lt;iframe src=\"https://maps.example.com/embed?place=kyiv\"&gt;</code> з <code>title=\"Карта проїзду до офісу\"</code>, <code>width=\"600\"</code>, <code>height=\"400\"</code> і <code>loading=\"lazy\"</code>.",
      "Нижче вбудуйте віджет чату <code>https://widgets.example.com/chat</code> з <code>title=\"Чат підтримки\"</code> у пісочниці <code>sandbox=\"allow-scripts allow-forms\"</code> (без <code>allow-same-origin</code>) і <code>referrerpolicy=\"no-referrer\"</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Контакти</title></head>
<body>
  <h1>Контакти</h1>
  <p>Карта проїзду</p>
  <p>Чат підтримки</p>
</body>
</html>
`,
    checks: [
      { name: "iframe із картою", selector: "iframe[src=\"https://maps.example.com/embed?place=kyiv\"]" },
      { name: "У карти є title", selector: "iframe[src*=\"maps.example.com\"][title=\"Карта проїзду до офісу\"]" },
      { name: "Карта: розміри 600×400 і loading=lazy", selector: "iframe[src*=\"maps.example.com\"][width=\"600\"][height=\"400\"][loading=\"lazy\"]" },
      { name: "iframe із чатом і title", selector: "iframe[src=\"https://widgets.example.com/chat\"][title=\"Чат підтримки\"]" },
      { name: "Чат у пісочниці з allow-scripts і allow-forms", selector: "iframe[src*=\"widgets.example.com\"]", attr: { name: "sandbox", matches: "(?=.*allow-scripts)(?=.*allow-forms)" } },
      { name: "У пісочниці немає allow-same-origin", selector: "iframe[sandbox~=\"allow-same-origin\"]", not: true },
      { name: "referrerpolicy=no-referrer у віджета", selector: "iframe[src*=\"widgets.example.com\"][referrerpolicy=\"no-referrer\"]" },
    ],
  },
];
