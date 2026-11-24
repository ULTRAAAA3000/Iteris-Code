// Завдання курсу HTML, глава 02 «Текст» (уроки 5–9). Виконуються в браузері (runtime: "page"), еталони: tests/solutions/html-ch02.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "html", runtime: "page", edit: "html", file: "index.html", editorLang: "html", premium: false } as const;

export const TASKS_02: readonly PageTask[] = [
  {
    ...base, id: "html-headings-paragraphs", lesson: "html/5", xp: 15,
    title: "Стаття з правильною ієрархією заголовків",
    context: "Структура заголовків це змістовний план сторінки: за нею орієнтуються читачі з програмами читання, а пошукові системи розуміють головну тему. Один h1, далі рівні йдуть підряд.",
    brief: [
      "Розмітьте статтю. Заголовок статті «Подорож до Карпат» зробіть <code>&lt;h1&gt;</code>; розділи «Підготовка» і «Маршрут» <code>&lt;h2&gt;</code>; підрозділи «Одяг» і «Спорядження» під розділом «Підготовка» <code>&lt;h3&gt;</code>. Текст під заголовками розбийте на абзаци <code>&lt;p&gt;</code> (щонайменше чотири). Рівні не пропускайте.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Подорож</title></head>
<body>
  Подорож до Карпат
  Підготовка
  Одяг
  Візьміть непромокальну куртку.
  Спорядження
  Намет і спальник.
  Маршрут
  Перший день: від села до полонини.
  Другий день: підйом на хребет.
</body>
</html>
`,
    checks: [
      { name: "Рівно один h1 «Подорож до Карпат»", selector: "h1", text: "Подорож до Карпат", count: 1 },
      { name: "Два заголовки h2: «Підготовка» і «Маршрут»", selector: "h2", count: 2 },
      { name: "h2 «Підготовка»", selector: "h2", text: "Підготовка" },
      { name: "Два підрозділи h3: «Одяг» і «Спорядження»", selector: "h3", count: 2 },
      { name: "Рівні не пропущено: немає h4, h5 і h6", selector: "h4, h5, h6", not: true },
      { name: "Щонайменше чотири абзаци p", selector: "p", count: { min: 4 }, hint: "Кожне речення під заголовком оберніть у <p>…</p>." },
    ],
  },
  {
    ...base, id: "html-text-format", lesson: "html/6", xp: 20,
    title: "Смислове форматування тексту",
    context: "Теги форматування несуть сенс, а не лише вигляд: strong це важливе, em це наголос, code це код. Їх розуміють і програми для читання з екрана, і пошукові системи.",
    brief: [
      "Розмітьте речення: слово «Важливо» зробіть <code>&lt;strong&gt;</code>, фразу «не забудьте» <code>&lt;em&gt;</code>, команду «npm install» <code>&lt;code&gt;</code>.",
      "Скорочення «HTML» оберніть у <code>&lt;abbr title=\"HyperText Markup Language\"&gt;</code>, стару ціну «1500 грн» зробіть <code>&lt;del&gt;</code>, а нову «1200 грн» <code>&lt;ins&gt;</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Підказка</title></head>
<body>
  <p>Важливо: не забудьте виконати команду npm install перед запуском.</p>
  <p>HTML описує структуру сторінки.</p>
  <p>Ціна: 1500 грн 1200 грн.</p>
</body>
</html>
`,
    checks: [
      { name: "«Важливо» у <strong>", selector: "strong", text: "Важливо" },
      { name: "«не забудьте» у <em>", selector: "em", text: "не забудьте" },
      { name: "«npm install» у <code>", selector: "code", text: "npm install" },
      { name: "«HTML» у <abbr> із розшифровкою в title", selector: "abbr[title]", text: "HTML" },
      { name: "Стара ціна «1500 грн» у <del>", selector: "del", text: "1500 грн" },
      { name: "Нова ціна «1200 грн» у <ins>", selector: "ins", text: "1200 грн" },
    ],
  },
  {
    ...base, id: "html-quotes-code", lesson: "html/7", xp: 25,
    title: "Цитата й блок коду",
    context: "У документації й блогах постійно показують чужі слова й код. Цитата має вказувати джерело, а код у pre зберігає відступи, інакше структура зникає.",
    brief: [
      "Створіть цитату: <code>&lt;blockquote cite=\"https://example.com/knuth\"&gt;</code> з абзацом «Передчасна оптимізація — корінь усіх бід.» і підписом <code>&lt;cite&gt;Дональд Кнут&lt;/cite&gt;</code>. У наступному абзаці додайте коротку цитату <code>&lt;q&gt;</code> «спершу правильно».",
      "Покажіть блок коду: <code>&lt;pre&gt;&lt;code&gt;</code> із рядками <code>&lt;ul&gt;</code>, <code>&lt;li&gt;Один&lt;/li&gt;</code>, <code>&lt;/ul&gt;</code> (символи &lt; і &gt; екрануйте як <code>&amp;lt;</code> і <code>&amp;gt;</code>). Клавішу «Enter» позначте <code>&lt;kbd&gt;</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Цитати і код</title></head>
<body>
  <p>Передчасна оптимізація — корінь усіх бід. Дональд Кнут</p>
  <p>Також він радив: спершу правильно.</p>
  <p>Код: <ul> <li>Один</li> </ul>. Натисніть Enter.</p>
</body>
</html>
`,
    checks: [
      { name: "Цитата blockquote з адресою джерела в cite", selector: "blockquote[cite=\"https://example.com/knuth\"]", text: "Передчасна оптимізація" },
      { name: "Автор цитати в елементі cite", selector: "cite", text: "Дональд Кнут" },
      { name: "Коротка цитата в q", selector: "q", text: "спершу правильно" },
      { name: "Блок коду: code всередині pre", selector: "pre > code", text: "<li>Один</li>", hint: "Символи < і > у коді запишіть як &lt; і &gt;: тоді сторінка покаже їх текстом." },
      { name: "Символи коду показано текстом, а не створено справжній список", selector: "pre ul, pre li", not: true },
      { name: "Клавіша Enter в елементі kbd", selector: "kbd", text: "Enter" },
    ],
  },
  {
    ...base, id: "html-headings-lists", lesson: "html/8", xp: 20,
    title: "Рецепт зі списками",
    context: "Перелік інгредієнтів, послідовність кроків і словник термінів це три різні списки. Правильний вибір між ul, ol та dl видно в коді за змістом, а не за маркерами.",
    brief: [
      "Розмітьте сторінку рецепта. Заголовок <code>&lt;h1&gt;</code> «Налисники». Інгредієнти (борошно, молоко, яйця) зробіть маркованим списком <code>ul</code>. Три кроки приготування нумерованим <code>ol</code>. У першому кроці зробіть вкладений маркований список із двох пунктів (борошно просіяти, яйця збити).",
      "Наприкінці додайте список визначень <code>dl</code> з одним терміном <code>dt</code> «Час» і описом <code>dd</code> «30 хвилин».",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Рецепт</title></head>
<body>
  Налисники
  Борошно
  Молоко
  Яйця
  Змішайте інгредієнти
  Дайте тісту постояти
  Смажте з двох боків
  Час: 30 хвилин
</body>
</html>
`,
    checks: [
      { name: "Заголовок h1 «Налисники»", selector: "h1", text: "Налисники" },
      { name: "Маркований список інгредієнтів із трьох пунктів", selector: "body > ul > li", count: 3 },
      { name: "Нумерований список із трьох кроків", selector: "ol > li", count: 3 },
      { name: "Вкладений список усередині пункту нумерованого списку", selector: "ol > li > ul > li", count: 2, hint: "Вкладений ul кладіть всередину li, а не поряд із ним." },
      { name: "У списку визначень є термін «Час»", selector: "dl > dt", text: "Час" },
      { name: "Опис «30 хвилин» у dd", selector: "dl > dd", text: "30 хвилин" },
    ],
  },
  {
    ...base, id: "html-special-chars", lesson: "html/9", xp: 20,
    title: "Символи, переноси й пробіли",
    context: "Адреса, ціна й підпис потребують точної типографіки: рядок не повинен розривати число й одиницю, а кутові дужки й амперсанд мають показуватися як текст, а не ламати розмітку.",
    brief: [
      "Збудуйте підвал сторінки. Адресу <code>Вебстарт, вул. Хрещатик, 1, м. Київ</code> розбийте на три рядки одним абзацем через <code>&lt;br&gt;</code>. Між «м.» і «Київ» поставте нерозривний пробіл <code>&amp;nbsp;</code>. Додайте горизонтальну лінію <code>&lt;hr&gt;</code> перед підвалом.",
      "У підвалі покажіть текст «© 2026 Вебстарт» (через <code>&amp;copy;</code>) та рядок «Тег &lt;div&gt; і символ &amp; виводяться текстом» (екрануйте символи).",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Контакти</title></head>
<body>
  <main>
    <h1>Контакти</h1>
  </main>
  <footer>
    Вебстарт, вул. Хрещатик, 1, м. Київ
    © 2026 Вебстарт
    Тег <div> і символ & виводяться текстом
  </footer>
</body>
</html>
`,
    checks: [
      { name: "Адреса в одному абзаці з щонайменше двома <br>", selector: "footer p br", count: { min: 2 } },
      { name: "Нерозривний пробіл між «м.» і «Київ» (&nbsp;)", source: { matches: "м\\.(?:&nbsp;|&#160;|&#xA0;)Київ" } },
      { name: "Горизонтальна лінія hr", selector: "hr" },
      { name: "Знак авторського права © у підвалі", selector: "footer", text: "©" },
      { name: "Тег <div> показано як текст", selector: "footer", text: "<div>" },
      { name: "Символ & показано як текст", selector: "footer", text: "&" },
      { name: "У підвалі немає справжнього елемента div", selector: "footer div", not: true },
    ],
  },
];
