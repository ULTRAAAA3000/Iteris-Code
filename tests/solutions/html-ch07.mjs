// Еталони завдань курсу HTML, глава 07 (id завдання -> повний код). У сайт не потрапляють.
export const SOLUTIONS_07 = {
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
  <button>Знайти</button>
</body>
</html>
`,
  "html-seo-meta": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Курси програмування онлайн</title>
  <meta name="description" content="Навчіться програмувати з нуля: короткі уроки з практикою й перевіркою в браузері.">
  <meta property="og:title" content="Курси програмування онлайн">
  <meta property="og:description" content="Короткі уроки з практикою.">
  <meta property="og:image" content="https://example.com/cover.jpg">
  <link rel="canonical" href="https://example.com/">
</head>
<body>
  <h1>Курси програмування</h1>
</body>
</html>
`,
  "html-modern-elements": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Довідка</title></head>
<body>
  <h1>Довідка</h1>
  <details open>
    <summary>Як оплатити?</summary>
    <p>Карткою онлайн.</p>
  </details>
  <details>
    <summary>Скільки триває доставка?</summary>
    <p>1–3 дні.</p>
  </details>
  <details>
    <summary>Як повернути товар?</summary>
    <p>Протягом 14 днів.</p>
  </details>
  <p>Завантаження: <progress value="70" max="100">70%</progress></p>
  <p>Диск: <meter min="0" max="100" low="30" high="80" optimum="20" value="85">85%</meter></p>
  <dialog open>
    <p>Видалити файл?</p>
    <form method="dialog">
      <button value="yes">Так</button>
      <button value="no">Ні</button>
    </form>
  </dialog>
  <p>
    <label for="city">Місто</label>
    <input type="text" id="city" name="city" list="cities">
    <datalist id="cities">
      <option value="Київ">
      <option value="Львів">
      <option value="Одеса">
    </datalist>
  </p>
</body>
</html>
`,
};
