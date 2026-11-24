// Еталони завдань курсу HTML, глава 02 (id завдання -> повний код). У сайт не потрапляють.
export const SOLUTIONS_02 = {
  "html-headings-paragraphs": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Подорож</title></head>
<body>
  <h1>Подорож до Карпат</h1>
  <h2>Підготовка</h2>
  <h3>Одяг</h3>
  <p>Візьміть непромокальну куртку.</p>
  <h3>Спорядження</h3>
  <p>Намет і спальник.</p>
  <h2>Маршрут</h2>
  <p>Перший день: від села до полонини.</p>
  <p>Другий день: підйом на хребет.</p>
</body>
</html>
`,
  "html-text-format": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Підказка</title></head>
<body>
  <p><strong>Важливо:</strong> <em>не забудьте</em> виконати команду <code>npm install</code> перед запуском.</p>
  <p><abbr title="HyperText Markup Language">HTML</abbr> описує структуру сторінки.</p>
  <p>Ціна: <del>1500 грн</del> <ins>1200 грн</ins>.</p>
</body>
</html>
`,
  "html-quotes-code": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Цитати і код</title></head>
<body>
  <blockquote cite="https://example.com/knuth">
    <p>Передчасна оптимізація — корінь усіх бід.</p>
    <footer>— <cite>Дональд Кнут</cite></footer>
  </blockquote>
  <p>Також він радив: <q>спершу правильно</q>.</p>
  <pre><code>&lt;ul&gt;
  &lt;li&gt;Один&lt;/li&gt;
&lt;/ul&gt;</code></pre>
  <p>Натисніть <kbd>Enter</kbd>.</p>
</body>
</html>
`,
  "html-headings-lists": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Рецепт</title></head>
<body>
  <h1>Налисники</h1>
  <ul>
    <li>Борошно</li>
    <li>Молоко</li>
    <li>Яйця</li>
  </ul>
  <ol>
    <li>Змішайте інгредієнти
      <ul>
        <li>борошно просіяти</li>
        <li>яйця збити</li>
      </ul>
    </li>
    <li>Дайте тісту постояти</li>
    <li>Смажте з двох боків</li>
  </ol>
  <dl>
    <dt>Час</dt>
    <dd>30 хвилин</dd>
  </dl>
</body>
</html>
`,
  "html-special-chars": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Контакти</title></head>
<body>
  <main>
    <h1>Контакти</h1>
  </main>
  <hr>
  <footer>
    <p>Вебстарт<br>вул. Хрещатик, 1<br>м.&nbsp;Київ</p>
    <p>&copy; 2026 Вебстарт</p>
    <p>Тег &lt;div&gt; і символ &amp; виводяться текстом</p>
  </footer>
</body>
</html>
`,
};
