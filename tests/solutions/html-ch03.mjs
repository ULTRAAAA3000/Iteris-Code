// Еталони завдань курсу HTML, глава 03 (id завдання -> повний код). У сайт не потрапляють.
export const SOLUTIONS_03 = {
  "html-links": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Посилання</title></head>
<body>
  <h1>Вебстарт</h1>
  <p><a href="about.html">Про нас</a></p>
  <p><a href="https://example.com" target="_blank" rel="noopener noreferrer">Приклад на іншому сайті</a></p>
  <p><a href="price.pdf" download>Завантажити прайс-лист</a></p>
</body>
</html>
`,
  "html-project-paths": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Мій сайт</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" href="favicon.ico">
  <script src="js/app.js" defer></script>
</head>
<body>
  <img src="images/logo.png" alt="Логотип">
  <a href="pages/about.html">Про мене</a>
</body>
</html>
`,
  "html-anchors": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Довідка</title></head>
<body>
  <h1 id="top">Довідка</h1>
  <nav>
    <a href="#intro">Вступ</a> |
    <a href="#usage">Використання</a> |
    <a href="#faq">Запитання</a>
  </nav>
  <h2 id="intro">Вступ</h2>
  <p>Текст вступу.</p>
  <h2 id="usage">Використання</h2>
  <p>Текст про використання.</p>
  <h2 id="faq">Запитання</h2>
  <p>Текст запитань.</p>
  <p><a href="#top">Нагору</a></p>
  <footer>
    <a href="mailto:info@example.com?subject=Запит">info@example.com</a>,
    <a href="tel:+380441234567">044 123 45 67</a>
  </footer>
</body>
</html>
`,
  "html-nav-menu": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Каталог</title></head>
<body>
  <nav aria-label="Головне меню">
    <ul>
      <li><a href="index.html">Головна</a></li>
      <li><a href="catalog.html" aria-current="page">Каталог</a></li>
      <li><a href="about.html">Про нас</a></li>
      <li><a href="contacts.html">Контакти</a></li>
    </ul>
  </nav>
  <nav aria-label="Хлібні крихти">
    <ol>
      <li><a href="index.html">Головна</a></li>
      <li><a href="catalog.html">Каталог</a></li>
      <li>Навушники</li>
    </ol>
  </nav>
</body>
</html>
`,
};
