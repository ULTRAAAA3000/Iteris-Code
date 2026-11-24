// Завдання курсу HTML, глава 06 «Форми» (уроки 21–25). Виконуються в браузері (runtime: "page"), еталони: tests/solutions/html-ch06.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "html", runtime: "page", edit: "html", file: "index.html", editorLang: "html", premium: false } as const;

export const TASKS_06: readonly PageTask[] = [
  {
    ...base, id: "html-table-form", lesson: "html/21", xp: 25,
    title: "Форми пошуку й входу",
    context: "Пошук і вхід це дві найпоширеніші форми. Пошук відправляють методом get, щоб результат можна було зберегти в закладках, а пароль тільки post. Кожне поле має name і зв'язану мітку.",
    brief: [
      "Створіть форму пошуку: <code>&lt;form action=\"/search\" method=\"get\"&gt;</code> із міткою <code>label for=\"q\"</code> («Пошук»), полем <code>&lt;input type=\"search\" id=\"q\" name=\"q\"&gt;</code> і кнопкою <code>&lt;button type=\"submit\"&gt;Знайти&lt;/button&gt;</code>.",
      "Створіть форму входу: <code>&lt;form action=\"/login\" method=\"post\"&gt;</code> з двома полями: пошта (<code>type=\"email\"</code>, <code>id</code> і <code>name</code> <code>email</code>) і пароль (<code>type=\"password\"</code>, <code>id</code> і <code>name</code> <code>password</code>), кожне з міткою, та кнопка <code>type=\"submit\"</code> «Увійти».",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Форми</title></head>
<body>
  <h1>Вебстарт</h1>
  Пошук
  Пошта
  Пароль
</body>
</html>
`,
    checks: [
      { name: "Форма пошуку: action=/search, method=get", selector: "form[action=\"/search\"][method=\"get\"]" },
      { name: "Поле пошуку type=search з name=q і id=q", selector: "form[action=\"/search\"] input[type=\"search\"][name=\"q\"]#q" },
      { name: "Мітка для поля q (for=q)", selector: "label[for=\"q\"]", text: "Пошук" },
      { name: "Форма входу: action=/login, method=post", selector: "form[action=\"/login\"][method=\"post\"]" },
      { name: "Поле пошти type=email з name=email і id=email", selector: "form[action=\"/login\"] input[type=\"email\"][name=\"email\"]#email" },
      { name: "Поле пароля type=password з name=password", selector: "form[action=\"/login\"] input[type=\"password\"][name=\"password\"]#password" },
      { name: "Мітки для пошти й пароля", selector: "label[for=\"email\"], label[for=\"password\"]", count: 2 },
      { name: "Дві кнопки відправки", selector: "button[type=\"submit\"]", count: 2 },
    ],
  },
  {
    ...base, id: "html-form-fields", lesson: "html/22", xp: 30,
    title: "Анкета з різними типами полів",
    context: "Правильний тип поля вмикає зручну клавіатуру й перевірку: пошта, телефон, число, дата, колір і файл потребують різних типів, а не одного text.",
    brief: [
      "Зробіть форму анкети. Кожне поле має мітку <code>label</code> (зв'язану через <code>for</code> й <code>id</code>) і <code>name</code>. Поля й типи: пошта <code>email</code>, телефон <code>tel</code>, сайт <code>url</code>, кількість <code>number</code> з <code>min=\"1\"</code> і <code>max=\"10\"</code>, дата народження <code>date</code>, гучність <code>range</code> з <code>min=\"0\"</code> та <code>max=\"100\"</code>, колір теми <code>color</code>, фото <code>file</code> з <code>accept=\"image/*\"</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Анкета</title></head>
<body>
  <form action="/survey" method="post">
    <input type="text">
  </form>
</body>
</html>
`,
    checks: [
      { name: "Пошта: type=email з міткою", selector: "input[type=\"email\"][id][name]" },
      { name: "Телефон: type=tel", selector: "input[type=\"tel\"][name]" },
      { name: "Сайт: type=url", selector: "input[type=\"url\"][name]" },
      { name: "Кількість: number від 1 до 10", selector: "input[type=\"number\"][min=\"1\"][max=\"10\"]" },
      { name: "Дата народження: type=date", selector: "input[type=\"date\"]" },
      { name: "Гучність: range від 0 до 100", selector: "input[type=\"range\"][min=\"0\"][max=\"100\"]" },
      { name: "Колір теми: type=color", selector: "input[type=\"color\"]" },
      { name: "Фото: file з accept=image/*", selector: "input[type=\"file\"][accept=\"image/*\"]" },
      { name: "У кожного поля є мітка (не менше 8 label)", selector: "label[for]", count: { min: 8 } },
    ],
  },
  {
    ...base, id: "html-select-radio", lesson: "html/23", xp: 30,
    title: "Замовлення: список, перемикачі, прапорці й текст",
    context: "Вибір зі списку, перемикач, прапорець і поле для коментаря використовують у більшості форм замовлення. Групи варіантів треба огортати fieldset із legend, щоб їх зрозуміли й програми читання.",
    brief: [
      "Зберіть форму замовлення. <code>&lt;select name=\"city\"&gt;</code> із міткою і щонайменше трьома <code>&lt;option&gt;</code> (перший з <code>value=\"\"</code> і текстом «Оберіть місто»). <code>&lt;fieldset&gt;</code> з <code>&lt;legend&gt;Спосіб доставки&lt;/legend&gt;</code> і двома радіокнопками <code>name=\"delivery\"</code> (<code>value=\"courier\"</code> обрана за замовчуванням і <code>value=\"pickup\"</code>).",
      "Ще один <code>fieldset</code> «Додатково» з двома прапорцями <code>name=\"extras\"</code>, а потім <code>&lt;textarea name=\"comment\"&gt;</code> з міткою, <code>rows=\"4\"</code> і <code>maxlength=\"500\"</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Замовлення</title></head>
<body>
  <form action="/order" method="post">
    Місто
    Спосіб доставки: Кур'єр, Самовивіз
    Додатково: Подарункове пакування, SMS про доставку
    Коментар
  </form>
</body>
</html>
`,
    checks: [
      { name: "select name=city із щонайменше трьома варіантами", selector: "select[name=\"city\"] option", count: { min: 3 } },
      { name: "Перший варіант це підказка з порожнім value", selector: "select[name=\"city\"] option[value=\"\"]", text: "Оберіть місто" },
      { name: "fieldset «Спосіб доставки» з legend", selector: "fieldset > legend", text: "Спосіб доставки" },
      { name: "Дві радіокнопки однієї групи delivery", selector: "input[type=\"radio\"][name=\"delivery\"]", count: 2 },
      { name: "Кур'єр обраний за замовчуванням", selector: "input[type=\"radio\"][value=\"courier\"][checked]" },
      { name: "Другий fieldset «Додатково» з двома прапорцями extras", selector: "input[type=\"checkbox\"][name=\"extras\"]", count: 2 },
      { name: "Два елементи fieldset", selector: "fieldset", count: 2 },
      { name: "textarea comment з rows=4 і maxlength=500", selector: "textarea[name=\"comment\"][rows=\"4\"][maxlength=\"500\"]" },
    ],
  },
  {
    ...base, id: "html-form-validation", lesson: "html/24", xp: 35,
    title: "Реєстрація з перевіркою в браузері",
    context: "Кілька атрибутів вмикають перевірку без жодного рядка коду: браузер сам зупинить відправку неправильної форми й підкаже, що виправити.",
    brief: [
      "Побудуйте форму реєстрації <code>action=\"/register\" method=\"post\"</code> із полями (кожне з міткою). Ім'я: <code>text</code>, обов'язкове, від 2 до 30 символів, <code>autocomplete=\"name\"</code>. Пошта: <code>email</code>, обов'язкова, <code>autocomplete=\"email\"</code>. Пароль: обов'язковий, щонайменше 8 символів, <code>autocomplete=\"new-password\"</code>. Вік: <code>number</code> від 14 до 120. Телефон: <code>tel</code> з <code>pattern=\"[0-9]{10}\"</code> і поясненням у <code>title</code>.",
      "Додайте кнопку <code>type=\"submit\"</code> «Зареєструватися».",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Реєстрація</title></head>
<body>
  <form action="/register" method="post">
    <input type="text" name="name">
    <input type="text" name="email">
    <input type="text" name="password">
    <input type="text" name="age">
    <input type="text" name="phone">
  </form>
</body>
</html>
`,
    checks: [
      { name: "Ім'я: required, minlength=2, maxlength=30", selector: "input[name=\"name\"][required][minlength=\"2\"][maxlength=\"30\"]" },
      { name: "Ім'я: autocomplete=name", selector: "input[name=\"name\"][autocomplete=\"name\"]" },
      { name: "Пошта: type=email, required, autocomplete=email", selector: "input[type=\"email\"][name=\"email\"][required][autocomplete=\"email\"]" },
      { name: "Пароль: type=password, required, minlength=8", selector: "input[type=\"password\"][name=\"password\"][required][minlength=\"8\"]" },
      { name: "Пароль: autocomplete=new-password", selector: "input[name=\"password\"][autocomplete=\"new-password\"]" },
      { name: "Вік: number від 14 до 120", selector: "input[type=\"number\"][name=\"age\"][min=\"14\"][max=\"120\"]" },
      { name: "Телефон: pattern з десяти цифр і title", selector: "input[type=\"tel\"][name=\"phone\"][pattern=\"[0-9]{10}\"][title]" },
      { name: "Кожне поле має мітку", selector: "label[for]", count: { min: 5 } },
      { name: "Кнопка відправки", selector: "button[type=\"submit\"]", text: "Зареєструватися" },
    ],
  },
  {
    ...base, id: "html-form-a11y", lesson: "html/25", xp: 35,
    title: "Доступна форма з підказками й помилками",
    context: "Підказка й повідомлення про помилку мають бути пов'язані з полем у розмітці, інакше програма читання озвучить лише назву поля й користувач не дізнається, що не так.",
    brief: [
      "Є форма з двома полями. Для поля пароля додайте видиму підказку <code>&lt;small id=\"pw-hint\"&gt;Не менше 8 символів&lt;/small&gt;</code> і зв'яжіть її з полем через <code>aria-describedby=\"pw-hint\"</code>.",
      "Поле пошти зараз з помилкою: позначте його <code>aria-invalid=\"true\"</code>, зв'яжіть з повідомленням <code>&lt;span id=\"email-error\" role=\"alert\"&gt;Введіть пошту у форматі name@example.com&lt;/span&gt;</code> через <code>aria-describedby=\"email-error\"</code>. Обидва поля мають зв'язані мітки, а замість placeholder використовуйте <code>label</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Вхід</title></head>
<body>
  <form action="/login" method="post">
    <input type="email" id="email" name="email" placeholder="Пошта">
    <input type="password" id="pw" name="password" placeholder="Пароль">
    <button type="submit">Увійти</button>
  </form>
</body>
</html>
`,
    checks: [
      { name: "Мітки label для пошти й пароля", selector: "label[for=\"email\"], label[for=\"pw\"]", count: 2 },
      { name: "Підказка #pw-hint з текстом", selector: "#pw-hint", text: "Не менше 8 символів" },
      { name: "Пароль пов'язаний із підказкою через aria-describedby", selector: "input#pw[aria-describedby=\"pw-hint\"]" },
      { name: "Пошта позначена aria-invalid=true", selector: "input#email[aria-invalid=\"true\"]" },
      { name: "Повідомлення про помилку role=alert", selector: "#email-error[role=\"alert\"]", text: "name@example.com" },
      { name: "Пошта пов'язана з повідомленням через aria-describedby", selector: "input#email[aria-describedby=\"email-error\"]" },
      { name: "Немає placeholder замість підпису", selector: "input[placeholder]", not: true },
    ],
  },
];
