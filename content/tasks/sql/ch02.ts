// Практичні завдання курсу SQL, глава 02 «Фільтрація й сортування» (уроки 4–8). Еталони: tests/solutions/sql-ch02.mjs.
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";
import { MENU, PRODUCTS, USERS } from "./data.ts";

export const TASKS_02: readonly RemoteTask[] = [
  {
    ...base, id: "sql-filter-sort", lesson: "sql/4", xp: 20,
    title: "Товари дорожчі за 30",
    context: "WHERE відсікає зайве ще на боці бази: програма отримує лише потрібні рядки, а не всю таблицю. Саме так працюють фільтри за ціною, статусом чи датою в будь-якому каталозі.",
    brief: [
      "Запит 1: виведіть назву й ціну товарів, <b>дорожчих за 30</b> (<code>WHERE price &gt; 30</code>), у порядку <code>id</code>. У заготовці запит поки повертає всі товари.",
      "Запит 2: виведіть назви товарів категорії «випічка» (<code>WHERE category = 'випічка'</code>), у порядку <code>id</code>.",
    ],
    starter: `${PRODUCTS}

SELECT name, price FROM products ORDER BY id;
-- TODO 2: назви товарів категорії 'випічка', ORDER BY id
`,
    checks: [
      { on: "stdout", name: "Дорожчі за 30: Молоко, Сир, Йогурт", has: "Молоко|42\nСир|180\nЙогурт|35", hint: "Додайте WHERE price > 30 перед ORDER BY id: умова йде після FROM." },
      { on: "stdout", name: "Дешеві товари у вибірку не потрапили", has: "Хліб|25", not: true, hint: "Хліб коштує 25, а умова price > 30 його відсікає. Перевірте оператор порівняння." },
      { on: "stdout", name: "Випічка: Хліб і Булочка", has: "Хліб\nБулочка", hint: "Другий запит: SELECT name FROM products WHERE category = 'випічка' ORDER BY id; Текст у одинарних лапках." },
      { on: "source", name: "Використано WHERE price > 30", matches: "WHERE\\s+price\\s*>\\s*30", hint: "Умова про ціну має містити оператор > і число 30." },
    ],
  },
  {
    ...base, id: "sql-and-or-brackets", lesson: "sql/5", xp: 25,
    title: "Дешеві супи й напої: дужки в умові",
    context: "Умови на кшталт «дешеве, але лише супи або напої» без дужок дають несподівані рядки, бо AND зв'язує сильніше за OR. Помилка в пріоритеті тихо псує звіти й фільтри.",
    brief: [
      "Виведіть назви страв, які коштують <b>менше 100</b> і водночас є <b>супом або напоєм</b>, у порядку <code>id</code>.",
      "У заготовці умова написана без дужок, тому в результат потрапило дороге вино. Розставте дужки, щоб <code>OR</code> обчислювався разом.",
    ],
    starter: `${MENU}

SELECT name FROM menu
WHERE price < 100 AND kind = 'суп' OR kind = 'напій'
ORDER BY id;
`,
    checks: [
      { on: "stdout", name: "Борщ, Окрошка, Чай, Кава", has: "Борщ\nОкрошка\nЧай\nКава", hint: "Результат має містити чотири страви в порядку id: два супи й два дешеві напої." },
      { on: "stdout", name: "Дороге вино не потрапило", has: "Вино", not: true, hint: "Вино коштує 180. Умова price < 100 має стосуватися і супів, і напоїв: візьміть OR у дужки." },
      { on: "source", name: "OR узято в дужки", matches: "\\(\\s*kind\\s*=\\s*'[^']+'\\s+OR\\s+kind\\s*=\\s*'[^']+'\\s*\\)", hint: "Напишіть: price < 100 AND (kind = 'суп' OR kind = 'напій')." },
    ],
  },
  {
    ...base, id: "sql-conditions", lesson: "sql/6", xp: 25,
    title: "IN, BETWEEN та LIKE",
    context: "Пошук за списком міст, діапазоном віку або початком імені — щоденні задачі. IN, BETWEEN і LIKE замінюють довгі ланцюжки OR і AND й роблять умову читабельною.",
    brief: [
      "Запит 1: імена користувачів (за алфавітом), що живуть у Києві або Дніпрі (<code>IN</code>) і мають вік від 20 до 40 включно (<code>BETWEEN</code>).",
      "Запит 2: імена, що починаються на «О» (<code>LIKE 'О%'</code>), за алфавітом. Запит 3: імена, що закінчуються на «ій» (<code>LIKE '%ій'</code>).",
    ],
    starter: `${USERS}

-- TODO 1: IN + BETWEEN, ORDER BY name
-- TODO 2: LIKE 'О%', ORDER BY name
-- TODO 3: LIKE '%ій'
`,
    checks: [
      { on: "stdout", name: "Запит 1: Іван, Марія, Оля", has: "Іван\nМарія\nОля", hint: "WHERE city IN ('Київ', 'Дніпро') AND age BETWEEN 20 AND 40 ORDER BY name." },
      { on: "stdout", name: "Запит 2: Олег і Оля", has: "Олег\nОля", hint: "Шаблон 'О%': велика літера О і будь-яке продовження. ORDER BY name." },
      { on: "stdout", name: "Запит 3: Андрій", has: "Андрій", hint: "Знак % ставте перед закінченням: LIKE '%ій'." },
      { on: "source", name: "Використано IN, BETWEEN і LIKE", matches: "\\bIN\\s*\\([\\s\\S]*BETWEEN[\\s\\S]*LIKE", hint: "У коді мають бути всі три оператори: IN, BETWEEN і LIKE." },
    ],
  },
  {
    ...base, id: "sql-null-hunt", lesson: "sql/7", xp: 25,
    title: "Порожні email і місто: NULL",
    context: "Порівняння з NULL через = не працює: умова дає «невідомо», і рядок губиться. IS NULL і явне врахування порожніх значень — обов'язкова звичка, щоб звіти не занижували результат.",
    brief: [
      "Запит 1: імена користувачів без email (<code>IS NULL</code>), за алфавітом.",
      "Запит 2: імена тих, хто живе <b>не в Києві</b>, включно з тими, у кого місто не вказано (<code>city &lt;&gt; 'Київ' OR city IS NULL</code>), за алфавітом.",
    ],
    starter: `${USERS}

-- TODO 1: email IS NULL, ORDER BY name
SELECT name FROM users WHERE city <> 'Київ' ORDER BY name;
`,
    checks: [
      { on: "stdout", name: "Без email: Іван і Марія", has: "Іван\nМарія", hint: "WHERE email IS NULL ORDER BY name; а не email = NULL." },
      { on: "stdout", name: "Не з Києва, включно з невідомим містом", has: "Іван\nАндрій\nОлег", hint: "Умова city <> 'Київ' не повертає рядок із NULL у місті. Додайте OR city IS NULL." },
      { on: "source", name: "Використано IS NULL", matches: "IS\\s+NULL", hint: "Порожнечу перевіряють лише через IS NULL." },
      { on: "source", name: "Немає порівняння = NULL", matches: "=\\s*NULL", not: true, hint: "= NULL ніколи не спрацьовує. Замініть на IS NULL." },
    ],
  },
  {
    ...base, id: "sql-page-two", lesson: "sql/8", xp: 25,
    title: "Друга сторінка каталогу",
    context: "Каталоги показують товари сторінками: за ціною від дорожчого, по кілька штук. ORDER BY задає порядок, LIMIT — розмір сторінки, OFFSET — скільки рядків пропустити.",
    brief: [
      "Запит 1: друга сторінка каталогу за ціною <b>від дорожчого до дешевшого</b>, по 2 товари на сторінці (<code>ORDER BY price DESC LIMIT 2 OFFSET 2</code>): назва й ціна.",
      "Запит 2: найдешевший товар (<code>ORDER BY price LIMIT 1</code>): назва й ціна.",
    ],
    starter: `${PRODUCTS}

SELECT name, price FROM products ORDER BY price DESC LIMIT 2;
-- TODO 2: найдешевший товар
`,
    checks: [
      { on: "stdout", name: "Друга сторінка: Йогурт і Хліб", has: "Йогурт|35\nХліб|25", hint: "Додайте OFFSET 2: пропустіть перші два рядки першої сторінки." },
      { on: "stdout", name: "Найдешевший: Булочка", has: "Булочка|18", hint: "ORDER BY price LIMIT 1: сортування за зростанням, один рядок." },
      { on: "stdout", name: "Перше місце (Сир) на другій сторінці не повторюється", has: "Сир|180", not: true, hint: "Сир на першій сторінці. Перевірте, що OFFSET дорівнює розміру сторінки." },
      { on: "source", name: "Використано LIMIT 2 OFFSET 2", matches: "LIMIT\\s+2\\s+OFFSET\\s+2", hint: "Сторінка 2 із розміром 2: LIMIT 2 OFFSET 2." },
    ],
  },
];
