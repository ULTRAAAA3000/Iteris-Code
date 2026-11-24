// Еталони завдань курсу HTML, глава 08 (id завдання -> повний код). У сайт не потрапляють.
export const SOLUTIONS_08 = {
  "html-portfolio": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Олена Коваль: портфоліо</title>
</head>
<body>
  <header>
    <h1>Олена Коваль</h1>
    <nav aria-label="Головне меню">
      <ul>
        <li><a href="#about">Про мене</a></li>
        <li><a href="#projects">Проєкти</a></li>
        <li><a href="#contact">Контакти</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section id="about">
      <h2>Про мене</h2>
      <p>Я вчу веброзробку й люблю робити зрозумілі сторінки.</p>
      <img src="me.jpg" alt="Олена за робочим столом" width="300" height="300">
    </section>
    <section id="projects">
      <h2>Проєкти</h2>
      <article><h3>Калькулятор</h3><p>Сторінка з розрахунком відсотків.</p></article>
      <article><h3>Блог про подорожі</h3><p>Статті з фото й підписами.</p></article>
      <article><h3>Лендинг кав'ярні</h3><p>Меню, адреса й форма бронювання.</p></article>
    </section>
    <section id="contact">
      <h2>Контакти</h2>
      <form action="/contact" method="post">
        <p><label for="email">Пошта</label> <input type="email" id="email" name="email" required></p>
        <button type="submit">Надіслати</button>
      </form>
    </section>
  </main>
  <footer>© 2026 Олена Коваль</footer>
</body>
</html>
`,
};
