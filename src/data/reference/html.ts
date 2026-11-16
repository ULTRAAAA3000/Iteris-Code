import type { RefSection } from "./types.ts";

const raw = String.raw;

export const html: RefSection[] = [
  { t: "Структура сторінки", items: [
    { t: "Шаблон документа", code: raw`<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Назва сторінки</title>
</head>
<body>
  <h1>Привіт, світе!</h1>
</body>
</html>`, note: "Усе, що бачить користувач, лежить у `body`. У `head` зберігається службова інформація." },
    { t: "Коментарі", code: raw`<!-- цей текст не відображається -->`, note: "Елементи записують як теги: відкривальний `<p>` і закривальний `</p>`." },
  ] },
  { t: "Текст", items: [
    { t: "Заголовки й абзаци", code: raw`<h1>Головний заголовок</h1>
<h2>Підзаголовок</h2>
<p>Абзац тексту з <strong>важливим</strong> і <em>виділеним</em> словом.</p>
<br>
<hr>`, note: "На сторінці має бути один `h1`. Теги `br` (перенесення) і `hr` (лінія) не мають закривального тегу." },
    { t: "Інші текстові теги", code: raw`<blockquote>Цитата</blockquote>
<pre>Текст
  зі збереженням пробілів</pre>
<code>console.log(1)</code>
<mark>позначено</mark> <small>дрібно</small>`, note: "Обирайте тег за змістом, а не за зовнішнім виглядом: оформленням займається CSS." },
  ] },
  { t: "Посилання й зображення", items: [
    { t: "Посилання", code: raw`<a href="https://example.com">Зовнішнє</a>
<a href="about.html">Інша сторінка</a>
<a href="#contacts">До розділу на сторінці</a>
<a href="https://example.com" target="_blank" rel="noopener">У новій вкладці</a>`, note: "Для `target=\"_blank\"` додавайте `rel=\"noopener\"`." },
    { t: "Зображення", code: raw`<img src="photo.jpg" alt="Опис зображення" width="300">`, note: "Атрибут `alt` обов'язковий: його читають скрінрідери й бачать, коли картинка не завантажилась." },
  ] },
  { t: "Списки", items: [
    { t: "Марковані й нумеровані", code: raw`<ul>
  <li>Хліб</li>
  <li>Молоко</li>
</ul>
<ol>
  <li>Перший крок</li>
  <li>Другий крок</li>
</ol>`, note: "`ul` це список із маркерами, `ol` нумерований. Елементи завжди в `li`." },
  ] },
  { t: "Таблиці", items: [
    { t: "Проста таблиця", code: raw`<table>
  <thead>
    <tr><th>Ім'я</th><th>Вік</th></tr>
  </thead>
  <tbody>
    <tr><td>Олена</td><td>16</td></tr>
    <tr><td>Іван</td><td>17</td></tr>
  </tbody>
</table>`, note: "`tr` це рядок, `th` заголовкова клітинка, `td` звичайна клітинка. Не використовуйте таблиці для верстки сторінки." },
  ] },
  { t: "Форми", items: [
    { t: "Поля вводу", code: raw`<form action="/send" method="post">
  <label for="name">Ім'я</label>
  <input type="text" id="name" name="name" required>

  <label for="email">Пошта</label>
  <input type="email" id="email" name="email">

  <textarea name="msg" rows="3"></textarea>
  <button type="submit">Надіслати</button>
</form>`, note: "Кожне поле має `label`, зв'язаний через `for` та `id`. Атрибут `required` робить поле обов'язковим." },
    { t: "Вибір і прапорці", code: raw`<select name="city">
  <option value="dnipro">Дніпро</option>
  <option value="kyiv">Київ</option>
</select>
<input type="checkbox" name="agree" id="agree">
<input type="radio" name="level" value="1"> Новачок
<input type="radio" name="level" value="2"> Середній`, note: "Радіокнопки з однаковим `name` утворюють групу, у якій обирається один варіант." },
  ] },
  { t: "Семантична розмітка", items: [
    { t: "Структурні теги", code: raw`<header>Шапка сайту</header>
<nav><a href="/">Головна</a></nav>
<main>
  <article>Стаття</article>
  <aside>Бічна панель</aside>
</main>
<footer>Підвал</footer>`, note: "Семантичні теги допомагають пошуковикам і людям зрозуміти структуру сторінки." },
    { t: "div і span", code: raw`<div class="card">Блоковий контейнер</div>
<p>Текст із <span class="accent">виділенням</span>.</p>`, note: "`div` займає весь рядок, `span` вбудований у текст. Обидва не мають власного змісту." },
  ] },
  { t: "Мультимедіа й підключення", items: [
    { t: "Аудіо, відео", code: raw`<video src="clip.mp4" controls width="400"></video>
<audio src="song.mp3" controls></audio>`, note: "Атрибут `controls` показує кнопки керування." },
    { t: "CSS і скрипти", code: raw`<link rel="stylesheet" href="style.css">
<script src="app.js" defer></script>`, note: "Стилі підключають у `head`, а скрипт із `defer` виконується після розбору сторінки." },
  ] },
];
