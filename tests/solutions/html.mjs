// Еталонні рішення завдань HTML (id завдання -> повний код). У сайт не потрапляють
export const HTML = {
  "html-skeleton": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Моя перша сторінка</title>
</head>
<body>
  <h1>Привіт, веб!</h1>
</body>
</html>
`,
  "html-headings-lists": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Блог</title></head>
<body>
  <h1>Мій блог</h1>
  <h2>Теми</h2>
  <ul>
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
  </ul>
  <ol>
    <li>Прочитати урок</li>
    <li>Виконати завдання</li>
  </ol>
  <a href="https://example.com">Читати далі</a>
</body>
</html>
`,
  "html-text-format": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Підказка</title></head>
<body>
  <p><strong>Важливо</strong>: <em>не забудьте</em> виконати команду <code>npm install</code> перед запуском.</p>
  <blockquote>Код пишуть для людей, а не для машин.</blockquote>
</body>
</html>
`,
  "html-media": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Медіа</title></head>
<body>
  <figure>
    <img src="photo.jpg" alt="Гори на світанку">
    <figcaption>Гори на світанку</figcaption>
  </figure>
  <audio controls>
    <source src="song.mp3" type="audio/mpeg">
  </audio>
  <video controls>
    <source src="clip.mp4" type="video/mp4">
  </video>
</body>
</html>
`,
  "html-table-form": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Каталог</title></head>
<body>
  <h1>Каталог</h1>
  <table>
    <thead>
      <tr><th>Товар</th><th>Ціна</th><th>Кількість</th></tr>
    </thead>
    <tbody>
      <tr><td>Хліб</td><td>25</td><td>10</td></tr>
      <tr><td>Молоко</td><td>42</td><td>3</td></tr>
    </tbody>
  </table>
  <form action="/search" method="get">
    <input type="text" name="q">
    <button type="submit">Шукати</button>
  </form>
</body>
</html>
`,
  "html-form-fields": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Реєстрація</title></head>
<body>
  <form>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
    <input type="number" name="age" min="18" max="99">
    <select name="city">
      <option>Київ</option>
      <option>Дніпро</option>
      <option>Львів</option>
    </select>
    <textarea name="note"></textarea>
    <label><input type="checkbox" name="agree"> Погоджуюсь</label>
    <button type="submit">Зареєструватись</button>
  </form>
</body>
</html>
`,
  "html-semantic": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Новини</title></head>
<body>
  <header><h1>Новини</h1></header>
  <nav><a href="/">Головна</a> <a href="/about">Про нас</a></nav>
  <main>
    <article><h2>Перша новина</h2><p>Текст новини.</p></article>
    <aside>Реклама</aside>
  </main>
  <footer>© 2026</footer>
</body>
</html>
`,
  "html-a11y": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Магазин</title></head>
<body>
  <h1>Магазин книг</h1>
  <img src="cover.jpg" alt="Обкладинка книги">
  <label for="q">Пошук</label>
  <input type="search" id="q">
  <button aria-label="Знайти"></button>
</body>
</html>
`,
  "html-seo-meta": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Курси програмування онлайн</title>
  <meta name="description" content="Курси програмування з нуля: HTML, CSS, JavaScript, Python. Короткі уроки та практичні завдання.">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="og:title" content="Курси програмування онлайн">
  <meta property="og:description" content="Короткі уроки та практичні завдання з нуля.">
  <meta property="og:image" content="https://example.com/cover.png">
  <link rel="canonical" href="https://example.com/">
</head>
<body>
  <h1>Курси програмування</h1>
</body>
</html>
`,
  "html-project-paths": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Мій сайт</title>
  <link rel="icon" href="favicon.ico">
  <link rel="stylesheet" href="css/style.css">
  <script src="js/app.js" defer></script>
</head>
<body>
  <img src="images/logo.png" alt="Логотип">
  <a href="pages/about.html">Про мене</a>
</body>
</html>
`,
  "html-portfolio": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Портфоліо Олени</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <header>
    <h1>Олена Коваль</h1>
    <nav>
      <a href="#about">Про мене</a>
      <a href="#projects">Проєкти</a>
      <a href="#contact">Контакти</a>
    </nav>
  </header>
  <main>
    <section id="about">
      <h2>Про мене</h2>
      <p>Вчуся веброзробці.</p>
      <img src="me.jpg" alt="Моє фото">
    </section>
    <section id="projects">
      <h2>Проєкти</h2>
      <article><h3>Лендінг</h3></article>
      <article><h3>Калькулятор</h3></article>
      <article><h3>Блог</h3></article>
    </section>
    <section id="contact">
      <h2>Контакти</h2>
      <form>
        <input type="email" name="email">
        <button type="submit">Написати</button>
      </form>
    </section>
  </main>
  <footer>© 2026</footer>
</body>
</html>
`,
};
