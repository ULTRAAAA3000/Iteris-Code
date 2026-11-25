// Еталони завдань курсу HTML, глава 05 (id завдання -> повний код). У сайт не потрапляють.
export const SOLUTIONS_05 = {
  "html-table-basic": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Розклад</title></head>
<body>
  <h1>Розклад</h1>
  <table>
    <tr><th></th><th>Пн</th><th>Вт</th></tr>
    <tr><th>1 урок</th><td>Математика</td><td>Історія</td></tr>
    <tr><th>2 урок</th><td>Фізика</td><td></td></tr>
  </table>
</body>
</html>
`,
  "html-table-structure": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Прайс</title></head>
<body>
  <h1>Прайс</h1>
  <table>
    <caption>Ціни на товари</caption>
    <thead>
      <tr><th>Товар</th><th>Кількість</th><th>Ціна</th></tr>
    </thead>
    <tbody>
      <tr><td>Навушники</td><td>2</td><td>2400 грн</td></tr>
      <tr><td>Мишка</td><td>1</td><td>450 грн</td></tr>
    </tbody>
    <tfoot>
      <tr><td colspan="2">Разом</td><td>2850 грн</td></tr>
    </tfoot>
  </table>
</body>
</html>
`,
  "html-table-a11y": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Продажі</title></head>
<body>
  <div role="region" aria-label="Таблиця продажів" tabindex="0">
    <table>
      <caption>Продажі за кварталами</caption>
      <tr><th scope="col">Квартал</th><th scope="col">Виручка</th></tr>
      <tr><th scope="row">Q1</th><td>120 тис.</td></tr>
      <tr><th scope="row">Q2</th><td>150 тис.</td></tr>
      <tr><th scope="row">Q3</th><td>170 тис.</td></tr>
    </table>
  </div>
</body>
</html>
`,
};
