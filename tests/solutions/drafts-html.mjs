// Еталони чернеток проєктів HTML і мутації для перевірки вимог. У сайт не потрапляє.
const raw = String.raw;

export const HTML_SOLUTIONS = {
  "html-signup-form": raw`<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Запис на курс</title>
</head>
<body>
  <main>
    <h1>Запис на курс</h1>
    <form action="/enroll" method="post">
      <fieldset>
        <legend>Особисті дані</legend>
        <p>
          <label for="fullname">Ім'я та прізвище</label>
          <input id="fullname" name="fullname" type="text" required minlength="2" autocomplete="name">
        </p>
        <p>
          <label for="email">Електронна пошта</label>
          <input id="email" name="email" type="email" required autocomplete="email">
        </p>
        <p>
          <label for="phone">Телефон</label>
          <input id="phone" name="phone" type="tel" pattern="\+380\d{9}" title="Формат: +380XXXXXXXXX" autocomplete="tel">
        </p>
        <p>
          <label for="birth">Дата народження</label>
          <input id="birth" name="birth" type="date">
        </p>
      </fieldset>
      <p>
        <label for="level">Рівень підготовки</label>
        <select id="level" name="level" required>
          <option value="" disabled selected>Оберіть рівень</option>
          <option value="beginner">Початківець</option>
          <option value="middle">Середній</option>
          <option value="advanced">Просунутий</option>
        </select>
      </p>
      <fieldset>
        <legend>Формат навчання</legend>
        <label><input type="radio" name="format" value="online" checked> Онлайн</label>
        <label><input type="radio" name="format" value="offline"> Офлайн</label>
      </fieldset>
      <p>
        <label for="hours">Годин на тиждень</label>
        <input id="hours" name="hours" type="number" min="1" max="20" step="1" value="5">
      </p>
      <p>
        <label for="comment">Побажання</label><br>
        <textarea id="comment" name="comment" rows="4" maxlength="500"></textarea>
      </p>
      <p>
        <input id="agree" name="agree" type="checkbox" required>
        <label for="agree">Погоджуюсь з правилами курсу</label>
      </p>
      <button type="submit">Записатися</button>
    </form>
  </main>
</body>
</html>
`,

  "html-cafe-menu": raw`<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Меню кафе «Лаванда»</title>
</head>
<body>
  <header>
    <h1>Кафе «Лаванда»</h1>
    <nav aria-label="Розділи меню">
      <ul>
        <li><a href="#coffee">Кава</a></li>
        <li><a href="#desserts">Десерти</a></li>
        <li><a href="#contacts">Контакти</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section id="coffee">
      <h2>Кава</h2>
      <table>
        <caption>Ціни на каву</caption>
        <thead>
          <tr><th scope="col">Напій</th><th scope="col">Об'єм</th><th scope="col">Ціна</th></tr>
        </thead>
        <tbody>
          <tr><td>Еспресо</td><td>30 мл</td><td>45 грн</td></tr>
          <tr><td>Американо</td><td>200 мл</td><td>55 грн</td></tr>
          <tr><td>Капучино</td><td>250 мл</td><td>75 грн</td></tr>
          <tr><td>Лавандовий раф</td><td>300 мл</td><td>95 грн</td></tr>
        </tbody>
      </table>
    </section>
    <section id="desserts">
      <h2>Десерти</h2>
      <ul>
        <li><strong>Чизкейк</strong> — ніжний, з ягідним соусом</li>
        <li><strong>Тірамісу</strong> — з кавою та маскарпоне</li>
        <li><strong>Медовик</strong> — класичний, з вершковим кремом</li>
        <li><strong>Лавандова панна-кота</strong> — фірмовий десерт кафе</li>
      </ul>
      <figure>
        <img src="cake.jpg" alt="Шматок чизкейка з ягідним соусом на білій тарілці" width="480" height="320">
        <figcaption>Чизкейк із ягідним соусом</figcaption>
      </figure>
    </section>
    <section id="contacts">
      <h2>Контакти</h2>
      <address>
        вул. Лавандова, 5, Дніпро<br>
        <a href="tel:+380561234567">+38 056 123 45 67</a><br>
        <a href="mailto:hello@lavanda.example">hello@lavanda.example</a>
      </address>
      <p><a href="https://example.com/map" target="_blank" rel="noopener noreferrer">Відкрити на карті</a></p>
    </section>
  </main>
  <footer>
    <p>© 2026 Кафе «Лаванда»</p>
  </footer>
</body>
</html>
`,

  "html-article-page": raw`<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Як вивчити HTML за місяць: план для початківців</title>
  <meta name="description" content="Покроковий план на чотири тижні: від першого тегу до власної сторінки з формою, таблицею та семантичною розміткою.">
  <link rel="canonical" href="https://webstart.example/articles/html-za-misyac">
  <meta property="og:title" content="Як вивчити HTML за місяць">
  <meta property="og:description" content="Покроковий план на чотири тижні для початківців: від першого тегу до власної сторінки.">
  <meta property="og:image" content="https://webstart.example/img/html-month.jpg">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Як вивчити HTML за місяць",
    "datePublished": "2026-11-12",
    "author": { "@type": "Person", "name": "Олена Коваль" }
  }
  </script>
</head>
<body>
  <a href="#content">Перейти до змісту</a>
  <header>
    <p>Сайт «Вебстарт»</p>
    <nav aria-label="Основна навігація">
      <ul>
        <li><a href="/">Головна</a></li>
        <li><a href="/articles">Статті</a></li>
        <li><a href="/about">Про нас</a></li>
      </ul>
    </nav>
  </header>
  <main id="content">
    <article>
      <header>
        <h1>Як вивчити HTML за місяць</h1>
        <p>Автор: <a href="/authors/olena" rel="author">Олена Коваль</a> · <time datetime="2026-11-12">12 листопада 2026</time></p>
      </header>
      <figure>
        <img src="html-month.jpg" alt="Ноутбук із відкритим редактором коду та сторінкою HTML" width="800" height="450" loading="lazy">
        <figcaption>Перший місяць із HTML: від тегів до готової сторінки</figcaption>
      </figure>
      <h2>Тиждень 1: основи</h2>
      <p>Налаштуйте редактор, створіть перший файл і навчіться відкривати його в браузері.</p>
      <h2>Тиждень 2: текст і посилання</h2>
      <p>Заголовки, абзаци, списки й посилання: з них складається більшість сторінок.</p>
      <h2>Тиждень 3: форми й таблиці</h2>
      <p>Збирайте дані та показуйте їх у таблицях, не чіпаючи JavaScript.</p>
      <h2>Тиждень 4: семантика й доступність</h2>
      <p>Орієнтири, підписи й alt-тексти: щоб сторінкою могли користуватися всі.</p>
    </article>
    <aside>
      <h2>Читайте також</h2>
      <ul>
        <li><a href="/articles/css-basics">CSS для початківців</a></li>
        <li><a href="/articles/forms">Форми без болю</a></li>
        <li><a href="/articles/a11y">Доступність за годину</a></li>
      </ul>
    </aside>
  </main>
  <footer>
    <p>© 2026 Вебстарт</p>
    <p><a href="/privacy">Політика</a> · <a href="/contact">Контакти</a></p>
  </footer>
</body>
</html>
`,
};

export const HTML_MUTATIONS = {
  "html-signup-form": [
    { fails: ["R1"], replace: [['method="post"', 'method="get"']] },
    { fails: ["R2"], replace: [["<legend>Особисті дані</legend>", "<legend>Дані</legend>"]] },
    { fails: ["R3"], replace: [['type="text" required minlength="2"', 'type="text" minlength="2"']] },
    { fails: ["R4"], replace: [['pattern="\\+380\\d{9}" ', ""]] },
    { fails: ["R5"], replace: [['max="20"', 'max="40"']] },
    { fails: ["R6"], replace: [['<label for="comment">Побажання</label>', "<span>Побажання</span>"]] },
    { fails: ["R7"], replace: [['<option value="" disabled selected>', '<option value="">']] },
    { fails: ["R8"], replace: [['name="format" value="offline"', 'name="format2" value="offline"']] },
    { fails: ["R9"], replace: [['type="checkbox" required>', 'type="checkbox">']] },
    { fails: ["R10"], replace: [['<button type="submit">Записатися</button>', '<button type="submit">Надіслати</button>']] },
  ],
  "html-cafe-menu": [
    { fails: ["R1"], replace: [['<html lang="uk">', "<html>"]] },
    { fails: ["R2"], replace: [['        <li><a href="#contacts">Контакти</a></li>\n', ""]] },
    { fails: ["R3"], replace: [['<section id="desserts">', '<section id="sweets">']] },
    { fails: ["R4"], replace: [["<caption>Ціни на каву</caption>", ""]] },
    { fails: ["R5"], replace: [["<li><strong>Чизкейк</strong>", "<li>Чизкейк"]] },
    { fails: ["R6"], replace: [['alt="Шматок чизкейка з ягідним соусом на білій тарілці"', 'alt="торт"']] },
    { fails: ["R7"], replace: [[' rel="noopener noreferrer"', ""]] },
    { fails: ["R8"], replace: [["<main>", "<main><font>Смачного!</font>"]] },
    { fails: ["R9"], replace: [["<p>© 2026 Кафе «Лаванда»</p>", "<p>2026 Кафе «Лаванда»</p>"]] },
  ],
  "html-article-page": [
    { fails: ["R1"], replace: [['content="Покроковий план на чотири тижні: від першого тегу до власної сторінки з формою, таблицею та семантичною розміткою."', 'content="Короткий опис"']] },
    { fails: ["R2"], replace: [['content="https://webstart.example/img/html-month.jpg"', 'content="/img/html-month.jpg"']] },
    { fails: ["R3"], replace: [['<main id="content">', "<main>"]] },
    { fails: ["R4"], replace: [["Перейти до змісту</a>", "Пропустити</a>"]] },
    { fails: ["R5"], replace: [['datetime="2026-11-12"', 'datetime="12.11.2026"']] },
    { fails: ["R6"], replace: [[' loading="lazy"', ""]] },
    { fails: ["R7"], replace: [["<h2>Читайте також</h2>", "<h2>Ще</h2>"]] },
    { fails: ["R8"], replace: [['"@type": "Article"', '"@type": "Thing"']] },
    { fails: ["R9"], replace: [['<a href="/privacy">Політика</a>', '<a href="#">Політика</a>']] },
    { fails: ["R10"], replace: [["<p>© 2026 Вебстарт</p>", "<p>2026 Вебстарт</p>"]] },
  ],
};
