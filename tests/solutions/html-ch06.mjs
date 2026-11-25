// Еталони завдань курсу HTML, глава 06 (id завдання -> повний код). У сайт не потрапляють.
export const SOLUTIONS_06 = {
  "html-table-form": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Форми</title></head>
<body>
  <h1>Вебстарт</h1>
  <form action="/search" method="get">
    <label for="q">Пошук</label>
    <input type="search" id="q" name="q">
    <button type="submit">Знайти</button>
  </form>
  <form action="/login" method="post">
    <p><label for="email">Пошта</label> <input type="email" id="email" name="email"></p>
    <p><label for="password">Пароль</label> <input type="password" id="password" name="password"></p>
    <button type="submit">Увійти</button>
  </form>
</body>
</html>
`,
  "html-form-fields": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Анкета</title></head>
<body>
  <form action="/survey" method="post">
    <p><label for="mail">Пошта</label> <input type="email" id="mail" name="mail"></p>
    <p><label for="phone">Телефон</label> <input type="tel" id="phone" name="phone"></p>
    <p><label for="site">Сайт</label> <input type="url" id="site" name="site"></p>
    <p><label for="qty">Кількість</label> <input type="number" id="qty" name="qty" min="1" max="10"></p>
    <p><label for="born">Дата народження</label> <input type="date" id="born" name="born"></p>
    <p><label for="vol">Гучність</label> <input type="range" id="vol" name="vol" min="0" max="100"></p>
    <p><label for="color">Колір теми</label> <input type="color" id="color" name="color"></p>
    <p><label for="photo">Фото</label> <input type="file" id="photo" name="photo" accept="image/*"></p>
  </form>
</body>
</html>
`,
  "html-select-radio": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Замовлення</title></head>
<body>
  <form action="/order" method="post">
    <p>
      <label for="city">Місто</label>
      <select id="city" name="city">
        <option value="">Оберіть місто</option>
        <option value="kyiv">Київ</option>
        <option value="lviv">Львів</option>
        <option value="odesa">Одеса</option>
      </select>
    </p>
    <fieldset>
      <legend>Спосіб доставки</legend>
      <label><input type="radio" name="delivery" value="courier" checked> Кур'єр</label>
      <label><input type="radio" name="delivery" value="pickup"> Самовивіз</label>
    </fieldset>
    <fieldset>
      <legend>Додатково</legend>
      <label><input type="checkbox" name="extras" value="gift"> Подарункове пакування</label>
      <label><input type="checkbox" name="extras" value="sms"> SMS про доставку</label>
    </fieldset>
    <p>
      <label for="comment">Коментар</label><br>
      <textarea id="comment" name="comment" rows="4" maxlength="500"></textarea>
    </p>
  </form>
</body>
</html>
`,
  "html-form-validation": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Реєстрація</title></head>
<body>
  <form action="/register" method="post">
    <p><label for="name">Ім'я</label>
       <input type="text" id="name" name="name" required minlength="2" maxlength="30" autocomplete="name"></p>
    <p><label for="email">Пошта</label>
       <input type="email" id="email" name="email" required autocomplete="email"></p>
    <p><label for="pw">Пароль</label>
       <input type="password" id="pw" name="password" required minlength="8" autocomplete="new-password"></p>
    <p><label for="age">Вік</label>
       <input type="number" id="age" name="age" min="14" max="120"></p>
    <p><label for="phone">Телефон</label>
       <input type="tel" id="phone" name="phone" pattern="[0-9]{10}" title="Введіть 10 цифр без пробілів"></p>
    <button type="submit">Зареєструватися</button>
  </form>
</body>
</html>
`,
  "html-form-a11y": `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Вхід</title></head>
<body>
  <form action="/login" method="post">
    <p>
      <label for="email">Пошта</label>
      <input type="email" id="email" name="email" aria-invalid="true" aria-describedby="email-error">
      <span id="email-error" role="alert">Введіть пошту у форматі name@example.com</span>
    </p>
    <p>
      <label for="pw">Пароль</label>
      <input type="password" id="pw" name="password" aria-describedby="pw-hint">
      <small id="pw-hint">Не менше 8 символів</small>
    </p>
    <button type="submit">Увійти</button>
  </form>
</body>
</html>
`,
};
