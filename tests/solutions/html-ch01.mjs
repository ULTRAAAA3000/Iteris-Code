// Еталони завдань курсу HTML, глава 01 (id завдання -> повний код). У сайт не потрапляють.
export const SOLUTIONS_01 = {
  "html-first-page": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Візитка</title>
</head>
<body>
  <h1>Візитка</h1>
  <p>Мене звати Олена.</p>
  <p>Я вчу HTML.</p>
</body>
</html>
`,
  "html-skeleton": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Моя перша сторінка</title>
</head>
<body>
  <h1>Привіт, веб!</h1>
</body>
</html>
`,
  "html-elements-attrs": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Товар</title></head>
<body>
  <div id="product" class="card">
    <h2>Навушники</h2>
    <p>Ціна: <span class="price">1200 грн</span></p>
    <button disabled>Немає в наявності</button>
  </div>
</body>
</html>
`,
  "html-fix-errors": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Каталог</title>
</head>
<body>
  <h1 id="top">Каталог</h1>
  <p>Тут <b>важливе <i>слово</i></b> у тексті.</p>
  <img src="logo.png" alt="Логотип каталогу">
  <h2 id="new">Нове</h2>
</body>
</html>
`,
};
