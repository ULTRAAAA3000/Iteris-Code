// Курс SQL, глава 06 «Зв'язки й JOIN» (уроки 20–24). Діалект SQLite. Приклади самодостатні.
const SHOP = String.raw`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customers(id), total INTEGER);
INSERT INTO customers VALUES (1, 'Оля'), (2, 'Іван'), (3, 'Марія');
INSERT INTO orders VALUES (1, 1, 100), (2, 1, 50), (3, 2, 70);`;
const SHOP_FULL = String.raw`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER);
CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, qty INTEGER);
INSERT INTO customers VALUES (1, 'Оля'), (2, 'Іван'), (3, 'Марія');
INSERT INTO orders VALUES (1, 1), (2, 1), (3, 2);
INSERT INTO products VALUES (1, 'Хліб', 25), (2, 'Молоко', 42), (3, 'Сир', 180);
INSERT INTO order_items VALUES (1, 1, 2), (1, 2, 1), (2, 3, 1), (3, 1, 3);`;

export const LESSONS_06 = [
  {
    t: "Зв'язки між таблицями й FOREIGN KEY",
    ch: "Зв'язки й JOIN",
    easy: "Зовнішній ключ — це посилання «дивись картку №5 в іншій шухляді». Замість повторювати ім'я клієнта в кожному замовленні, ми зберігаємо лише його номер.",
    p: [
      "Уявіть, що всі замовлення лежать в одній таблиці, і в кожному рядку повторюються ім'я клієнта, його місто й пошта. Якщо клієнт змінить пошту, доведеться виправляти десятки рядків, а якщо хоч один пропустити, дані суперечитимуть самі собі. Реляційний підхід розв'язує це розділенням: клієнтів зберігають в одній таблиці, замовлення в іншій, а зв'язок між ними задають <b>номером</b>. У рядку замовлення пишуть не ім'я, а <code>customer_id</code> — значення, яке збігається з <code>id</code> клієнта.",
      "Стовпець, що посилається на первинний ключ іншої таблиці, називають <b>зовнішнім ключем</b> (foreign key). Його оголошують у <code>CREATE TABLE</code>: <code>customer_id INTEGER REFERENCES customers(id)</code> або окремим рядком <code>FOREIGN KEY (customer_id) REFERENCES customers(id)</code>. Таблицю, на яку посилаються, називають <i>батьківською</i> (клієнти), а ту, що містить посилання, <i>дочірньою</i> (замовлення). Один клієнт може мати багато замовлень, а кожне замовлення належить одному клієнту: це зв'язок «один до багатьох», найпоширеніший у базах даних.",
      "Головна користь зовнішнього ключа — <b>цілісність</b>. База не дасть створити замовлення для неіснуючого клієнта й не дасть видалити клієнта, у якого є замовлення, бо вони стали б «сиротами» без батька. Але є важлива особливість SQLite: <b>перевірка зовнішніх ключів за замовчуванням вимкнена</b>. Поки ви не виконаєте <code>PRAGMA foreign_keys = ON;</code>, база приймає сирітські рядки без жодної помилки. Цей перемикач діє лише для поточного з'єднання, тому застосунки вмикають його одразу після підключення. У PostgreSQL чи MySQL перевірка працює завжди.",
      "Після <code>PRAGMA foreign_keys = ON</code> спроба вставити замовлення з неіснуючим <code>customer_id</code> завершується помилкою <code>FOREIGN KEY constraint failed</code>. Те саме станеться при видаленні клієнта, на якого посилаються замовлення. Поведінку можна змінити вказівками <code>ON DELETE CASCADE</code> (видалити й дочірні рядки) чи <code>ON DELETE SET NULL</code> (обнулити посилання), але за замовчуванням база просто відмовляє. Така суворість — захист: краще отримати помилку, ніж тихо втратити зв'язки.",
      "Зв'язок «<b>багато до багатьох</b>» не виразити одним стовпцем: студент ходить на багато курсів, а на курс записано багато студентів. Для цього створюють <b>проміжну таблицю</b>, у кожному рядку якої стоїть пара посилань: <code>enrollments(student_id, course_id)</code>. Первинним ключем роблять пару разом: <code>PRIMARY KEY (student_id, course_id)</code>, тоді студента не вдасться записати на той самий курс двічі. Цей прийом буде зустрічатись у кожній реальній схемі.",
      "Є ще зв'язок «один до одного» (профіль користувача й сам користувач), який розв'язується звичайним унікальним зовнішнім ключем. Усі три види зв'язків об'єднує одна ідея: дані зберігаються один раз, а посилання вказують на них. Ця ідея називається <b>нормалізацією</b>, і до неї ми повернемося в главі про проєктування схеми. Наразі просто пам'ятайте, що розбиття на таблиці — не складність, а спосіб уникнути дублювання й суперечностей.",
      "Зовнішній ключ — це лише обіцянка зв'язку, а не готова вибірка. Щоб побачити ім'я клієнта поруч із його замовленням, потрібно <i>з'єднати</i> таблиці в запиті. Це робить оператор <code>JOIN</code>, і йому присвячено решту глави. З наступного уроку ми почнемо збирати дані з кількох таблиць в один результат.",
    ],
    code: [
      String.raw`CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  total INTEGER,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
INSERT INTO customers VALUES (1, 'Оля'), (2, 'Іван');
INSERT INTO orders VALUES (1, 1, 100), (2, 1, 50), (3, 2, 70);

SELECT id, customer_id, total FROM orders ORDER BY id;`,
      String.raw`${SHOP}

-- за замовчуванням SQLite НЕ перевіряє зовнішні ключі: сирота 99 пройшов
INSERT INTO orders VALUES (4, 99, 10);
SELECT COUNT(*) FROM orders;

PRAGMA foreign_keys = ON;
PRAGMA foreign_keys;`,
      String.raw`-- помилка: після PRAGMA foreign_keys = ON клієнта 99 не існує (FOREIGN KEY constraint failed)
${SHOP}

PRAGMA foreign_keys = ON;
INSERT INTO orders VALUES (4, 99, 10);`,
      String.raw`-- помилка: клієнта з замовленнями не можна видалити (FOREIGN KEY constraint failed)
${SHOP}

PRAGMA foreign_keys = ON;
DELETE FROM customers WHERE id = 1;`,
      String.raw`-- «багато до багатьох»: проміжна таблиця з парою ключів
CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE courses (id INTEGER PRIMARY KEY, title TEXT);
CREATE TABLE enrollments (
  student_id INTEGER REFERENCES students(id),
  course_id  INTEGER REFERENCES courses(id),
  PRIMARY KEY (student_id, course_id)
);
INSERT INTO students VALUES (1, 'Оля'), (2, 'Іван');
INSERT INTO courses VALUES (1, 'SQL'), (2, 'Python');
INSERT INTO enrollments VALUES (1, 1), (1, 2), (2, 1);

SELECT student_id, course_id FROM enrollments ORDER BY student_id, course_id;`,
    ],
    note: "У SQLite перевірка зовнішніх ключів вимкнена за замовчуванням: вмикайте її командою PRAGMA foreign_keys = ON на кожному з'єднанні. Зв'язок «багато до багатьох» розв'язується проміжною таблицею з парою ключів.",
    work: "Схема з коректними зовнішніми ключами документує зв'язки й не дає накопичуватись «сиротам». У застосунках PRAGMA foreign_keys = ON вмикають одразу після підключення до SQLite, інакше цілісність у тестах і на роботі відрізнятиметься.",
    tasks: [
      "Чим батьківська таблиця відрізняється від дочірньої? Наведіть приклад для клієнтів і замовлень.",
      "Чому в SQLite без PRAGMA foreign_keys = ON можна вставити замовлення неіснуючого клієнта?",
    ],
  },
  {
    t: "INNER JOIN",
    ch: "Зв'язки й JOIN",
    easy: "JOIN складає дві таблиці в одну, зіставляючи рядки за спільним значенням: номер клієнта в замовленні з номером у таблиці клієнтів. INNER JOIN лишає лише ті рядки, у яких знайшлась пара.",
    p: [
      "Дані розкладені по таблицях, а відповідь на запитання зазвичай потребує кількох: «покажи замовлення з іменами клієнтів». Об'єднує їх оператор <code>JOIN</code>. Найпоширеніший його різновид — <code>INNER JOIN</code> (слово <code>INNER</code> можна опустити, просто <code>JOIN</code>): він бере рядки двох таблиць і залишає ті пари, які задовольняють умову, вказану в <code>ON</code>. Рядки, для яких пари не знайшлося, у результат не потрапляють.",
      "Запит має такий вигляд: <code>SELECT o.id, c.name, o.total FROM orders o JOIN customers c ON c.id = o.customer_id</code>. Розберімо: <code>FROM orders o</code> — перша таблиця з коротким <b>псевдонімом</b> <code>o</code>; <code>JOIN customers c</code> — друга таблиця з псевдонімом <code>c</code>; <code>ON c.id = o.customer_id</code> — умова зіставлення: рядок клієнта підходить рядку замовлення, коли їхні номери збігаються. Умову в <code>ON</code> зазвичай пишуть саме як рівність зовнішнього ключа з первинним.",
      "Уявіть процес так: база бере кожне замовлення й шукає клієнта з відповідним номером; знайшла — склеїла обидва рядки в один; не знайшла — пропустила. Результат містить стовпці <i>обох</i> таблиць, з яких <code>SELECT</code> обирає потрібні. Якщо в клієнта три замовлення, його ім'я з'явиться в результаті три рази, по разу на кожне замовлення. Це нормально: рядок результату відповідає парі, а не клієнту.",
      "Коли в обох таблицях є стовпець з однаковою назвою (майже завжди <code>id</code>), без уточнення виникає <b>неоднозначність</b>: <code>SELECT id FROM customers JOIN orders …</code> завершується помилкою <code>ambiguous column name: id</code>. Тому кожен стовпець у запиті з <code>JOIN</code> прийнято писати з префіксом таблиці чи її псевдоніма: <code>c.id</code>, <code>o.id</code>. Псевдоніми таблиць коротші за повні назви й роблять запит читабельним; задавати їх можна з <code>AS</code> або без нього.",
      "<code>JOIN</code> чудово поєднується з уже вивченими розділами. <code>WHERE</code> відбирає пари після з'єднання: <code>WHERE c.name = 'Оля'</code> залишить лише замовлення Олі. <code>ORDER BY</code> сортує результат, <code>LIMIT</code> обмежує його. Умови можна ставити на стовпці будь-якої з таблиць: <code>WHERE o.total &gt; 60 AND c.name &lt;&gt; 'Іван'</code>. Загальний порядок розділів лишається звичним: <code>SELECT</code>, <code>FROM … JOIN … ON</code>, <code>WHERE</code>, <code>GROUP BY</code>, <code>ORDER BY</code>, <code>LIMIT</code>.",
      "Помилка початківця — забути умову з'єднання. Запит <code>FROM orders JOIN customers</code> без <code>ON</code> у SQLite допустимий, але він зіставляє <b>кожен рядок з кожним</b> (декартів добуток): три замовлення й три клієнти дадуть дев'ять рядків, більшість із яких безглузді. На великих таблицях це «вбиває» базу. Тож завжди перевіряйте, що в кожного <code>JOIN</code> є правильний <code>ON</code>, і дивіться на кількість рядків результату: вона має відповідати очікуванню.",
      "Чи можна з'єднувати за стовпцями, що не є ключами? Так, <code>ON</code> приймає будь-яку умову, але за ключами це швидше й зрозуміліше, бо на ключах є індекси. У наступному уроці розглянемо, що робити, коли потрібні й ті рядки, для яких пари немає: клієнтів без замовлень. Для цього є <code>LEFT JOIN</code>.",
    ],
    code: [
      String.raw`${SHOP}

-- кожне замовлення разом з ім'ям клієнта
SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;`,
      String.raw`${SHOP}

-- Марія без замовлень у результат не потрапила; ім'я Олі повторюється двічі
SELECT c.name, o.total
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id
ORDER BY c.id, o.id;`,
      String.raw`${SHOP}

-- умови WHERE можуть стосуватися обох таблиць
SELECT c.name, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.total > 60 AND c.name <> 'Іван'
ORDER BY o.id;`,
      String.raw`${SHOP}

-- без ON кожен рядок зіставляється з кожним: 3 замовлення × 3 клієнти = 9 рядків
SELECT COUNT(*) FROM orders JOIN customers;`,
      String.raw`-- помилка: id є в обох таблицях, тому треба писати c.id або o.id (ambiguous column name)
${SHOP}

SELECT id FROM customers c JOIN orders o ON c.id = o.customer_id;`,
    ],
    note: "INNER JOIN залишає лише пари, для яких виконується умова ON. Стовпці з однаковими назвами уточнюють префіксом (c.id, o.id). JOIN без правильного ON дає декартів добуток: кожен рядок з кожним.",
    work: "Майже жодна цікава вибірка в реальному проєкті не обходиться без двох-трьох таблиць: замовлення з клієнтами, коментарі з авторами, платежі з рахунками. JOIN — одна з найпоширеніших тем технічних співбесід і найчастіше джерело повільних запитів.",
    tasks: [
      "Що робить умова ON у JOIN і чому її не можна забувати?",
      "Скільки рядків дасть INNER JOIN, якщо в одного клієнта три замовлення, а в іншого жодного?",
    ],
  },
  {
    t: "LEFT JOIN і пошук відсутніх даних",
    ch: "Зв'язки й JOIN",
    easy: "LEFT JOIN — це «усі з лівого списку, а пара є не в кожного». Клієнти без замовлень не зникають зі звіту: поруч із ними просто стоїть порожнє місце.",
    p: [
      "<code>INNER JOIN</code> відкидає рядки, для яких не знайшлося пари. Часто це якраз те, що потрібно, але інколи важливо побачити й «самотні» рядки: які клієнти ще нічого не замовляли, які товари жодного разу не купили. Для цього є <code>LEFT JOIN</code>: він залишає <b>всі рядки лівої таблиці</b> (тієї, що стоїть перед <code>JOIN</code>), а де пари у правій немає, підставляє <code>NULL</code> замість її стовпців.",
      "Порівняйте: <code>FROM customers c LEFT JOIN orders o ON o.customer_id = c.id</code>. Оля має два замовлення, тому з'явиться два рядки; Іван має одне; Марія жодного, але її рядок <b>є</b>: <code>Марія|NULL</code>, де порожнє місце це відсутні дані замовлення. Із <code>INNER JOIN</code> Марії б не було. Запам'ятайте просте правило вибору: потрібні тільки збіги — <code>INNER JOIN</code>; потрібні всі з однієї таблиці незалежно від наявності пари — <code>LEFT JOIN</code>, де лівою ставлять ту таблицю, чиї рядки мають лишитись усі.",
      "Побічний ефект <code>NULL</code> у правих стовпцях дає один із найкорисніших прийомів SQL — <b>пошук відсутніх даних</b>. Якщо до <code>LEFT JOIN</code> додати <code>WHERE o.id IS NULL</code>, залишаться лише ті клієнти, для яких замовлення не знайшлося. Так відповідають на запитання «хто нічого не купував», «яких студентів не записано на курс», «які товари без відгуків». Умову <code>IS NULL</code> перевіряють на стовпці правої таблиці, який ніколи не буває порожнім у справжніх рядках, найчастіше на її первинному ключі.",
      "<code>LEFT JOIN</code> з агрегатами дає звіти без «дір». <code>SELECT c.name, COALESCE(SUM(o.total), 0) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id</code> покаже суму для кожного клієнта, і для тих, хто нічого не замовляв,  4<code>5  замість зникнення рядка. Зверніть увагу на <code>COUNT</code>: <code>COUNT(*)</code> порахує й порожній рядок як один, а <code>COUNT(o.id)</code> пропустить <code>NULL</code> і правильно покаже нуль замовлень. Тому в таких звітах рахують за стовпцем правої таблиці.",
      "Тут чекає підступна пастка: <b>місце умови</b>. Умова в <code>ON</code> діє під час з'єднання й лишає лівий рядок, навіть якщо пари не знайшлося: <code>LEFT JOIN orders o ON o.customer_id = c.id AND o.total &gt; 60</code> покаже всіх клієнтів, а замовлення лише великі. Та сама умова у <code>WHERE</code> діє <i>після</i> з'єднання й відкидає рядки з <code>NULL</code>, тож <code>LEFT JOIN</code> непомітно перетворюється на <code>INNER JOIN</code>: Марія зникне. Правило: умови на праву таблицю, які не мають відкидати лівих рядків, ставте в <code>ON</code>.",
      "Існують також <code>RIGHT JOIN</code> (усі з правої таблиці) і <code>FULL JOIN</code> (усі з обох). У SQLite вони з'явилися лише у версії 3.39, тому в старіших збірках їх немає. Практично <code>RIGHT JOIN</code> завжди можна записати як <code>LEFT JOIN</code>, помінявши таблиці місцями, і саме так роблять у переносних запитах. Тож у цьому курсі ми обходимося <code>INNER JOIN</code> та <code>LEFT JOIN</code>: цього достатньо для переважної більшості задач.",
    ],
    code: [
      String.raw`${SHOP}

-- LEFT JOIN: Марія без замовлень лишилась, замість суми порожньо (NULL)
SELECT c.name, o.total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
ORDER BY c.id, o.id;`,
      String.raw`${SHOP}

-- пошук відсутніх даних: клієнти, у яких немає жодного замовлення
SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;`,
      String.raw`${SHOP}

-- звіт без «дір»: сума для кожного клієнта, нуль для тих, хто нічого не замовляв
SELECT c.name, COUNT(o.id) AS orders_count, COALESCE(SUM(o.total), 0) AS total
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY c.id;`,
      String.raw`${SHOP}

-- умова в ON лишає всіх клієнтів: Оля й Марія без «великих» замовлень теж на місці
SELECT c.name, o.id FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.total > 60
ORDER BY c.id;

-- та сама умова у WHERE відкидає рядки з NULL: Марія зникла (це вже INNER JOIN)
SELECT c.name, o.id FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.total > 60
ORDER BY c.id;`,
      String.raw`-- помилка: у таблиці orders немає стовпця customer (no such column)
${SHOP}

SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer = c.id;`,
    ],
    note: "LEFT JOIN лишає всі рядки лівої таблиці, а відсутню пару заповнює NULL. WHERE o.id IS NULL знаходить рядки без пари. Умова на праву таблицю у WHERE перетворює LEFT JOIN на INNER JOIN, тому її ставлять в ON.",
    work: "Клієнти без замовлень, товари без продажів, користувачі без активності: питання «кого немає» ставлять постійно, а відповідає на них LEFT JOIN з IS NULL. Пастка з умовою у WHERE замість ON — поширена причина «зниклих» рядків у звітах.",
    tasks: [
      "Як за допомогою LEFT JOIN знайти клієнтів, які не зробили жодного замовлення?",
      "Чим відрізняється умова в ON від такої самої умови у WHERE для LEFT JOIN?",
    ],
  },
  {
    t: "Кілька JOIN і з'єднання таблиці із собою",
    ch: "Зв'язки й JOIN",
    easy: "Кілька JOIN — це ланцюжок: клієнт → замовлення → позиції → товар. Кожне нове з'єднання додає ще одну ланку. А self join — коли таблиця дивиться сама на себе, як співробітник на свого керівника.",
    p: [
      "Реальні схеми рідко складаються з двох таблиць. Щоб показати, що замовила Оля, треба пройти ланцюжок: клієнти → замовлення → позиції замовлення → товари. У запиті це кілька <code>JOIN</code> поспіль, і кожен має власну умову <code>ON</code>: <code>FROM customers c JOIN orders o ON o.customer_id = c.id JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id</code>. Кожне наступне з'єднання бере результат попередніх і приєднує ще одну таблицю.",
      "Щоб не заплутатись, читайте такий запит як історію зліва направо: «беремо клієнтів; до кожного приєднуємо його замовлення; до кожного замовлення — позиції; до кожної позиції — товар». Кожна таблиця має свій короткий псевдонім, а кожен стовпець — префікс. Умови <code>ON</code> зазвичай з'єднують сусідні ланки через зовнішній і первинний ключі. Якщо результат містить дивно багато рядків, перевірте, чи правильно написано <code>ON</code> у кожному з'єднанні: одна помилка множить рядки.",
      "Кілька <code>JOIN</code> чудово поєднуються з агрегатами. Вартість позиції — це <code>p.price * i.qty</code>, а сума замовлення — <code>SUM(p.price * i.qty)</code> з групуванням за номером замовлення. Так за кілька рядків отримуємо чеки для всіх замовлень. Пам'ятайте правило групування: у <code>SELECT</code> лише стовпці з <code>GROUP BY</code> й агрегати. Також варто знати, що порядок з'єднань не змінює результат для <code>INNER JOIN</code>, а для <code>LEFT JOIN</code> він має значення.",
      "Інколи таблиця має зв'язок <i>сама із собою</i>. Класичний приклад — співробітники: у кожного є керівник, який теж співробітник, тому в таблиці <code>employees</code> є стовпець <code>manager_id</code>, що посилається на <code>employees(id)</code>. Щоб показати ім'я працівника поруч з ім'ям керівника, таблицю з'єднують <b>із собою</b>: <code>FROM employees e JOIN employees m ON m.id = e.manager_id</code>. Це називається <b>self join</b>. Тут псевдоніми не просто зручні, а обов'язкові: без них неможливо розрізнити «працівника» й «керівника».",
      "У self join одна й та сама таблиця виступає в двох ролях, і псевдоніми задають ці ролі: <code>e</code> — працівник, <code>m</code> — менеджер. Якщо у керівника верхнього рівня <code>manager_id</code> порожній, <code>INNER JOIN</code> його відкине; щоб побачити й директора (з порожнім керівником), беруть <code>LEFT JOIN</code>. Те саме працює для дерев категорій, коментарів з відповідями, друзів, рекомендацій: усюди, де об'єкт посилається на об'єкт того самого типу.",
      "Одна помилка зустрічається часто: двічі використати таблицю без псевдоніма або з однаковими псевдонімами. Тоді база повідомить <code>ambiguous column name</code> або взагалі не зрозуміє, про яку копію йдеться. Правило просте: кожна таблиця в <code>FROM</code> і <code>JOIN</code> має унікальний псевдонім. Тепер, коли ви вмієте з'єднувати довільну кількість таблиць, залишилося навчитися працювати не з'єднанням, а об'єднанням самих результатів запитів, і це тема наступного уроку.",
    ],
    code: [
      String.raw`${SHOP_FULL}

-- ланцюжок з чотирьох таблиць: хто що замовив і в якій кількості
SELECT c.name, p.name AS product, i.qty
FROM customers c
JOIN orders o ON o.customer_id = c.id
JOIN order_items i ON i.order_id = o.id
JOIN products p ON p.id = i.product_id
ORDER BY o.id, p.id;`,
      String.raw`${SHOP_FULL}

-- чек кожного замовлення: сума цін на кількості
SELECT o.id AS order_id, c.name, SUM(p.price * i.qty) AS total
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items i ON i.order_id = o.id
JOIN products p ON p.id = i.product_id
GROUP BY o.id
ORDER BY o.id;`,
      String.raw`CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER REFERENCES employees(id));
INSERT INTO employees VALUES (1, 'Директор', NULL), (2, 'Оля', 1), (3, 'Іван', 1), (4, 'Марія', 2);

-- self join: та сама таблиця в двох ролях (e — працівник, m — керівник)
SELECT e.name AS employee, m.name AS manager
FROM employees e
JOIN employees m ON m.id = e.manager_id
ORDER BY e.id;`,
      String.raw`CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER REFERENCES employees(id));
INSERT INTO employees VALUES (1, 'Директор', NULL), (2, 'Оля', 1), (3, 'Іван', 1), (4, 'Марія', 2);

-- LEFT JOIN, щоб директор без керівника теж лишився у списку
SELECT e.name AS employee, COALESCE(m.name, '—') AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY e.id;`,
      String.raw`-- помилка: таблицю employees використано двічі без псевдонімів (ambiguous column name)
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);
INSERT INTO employees VALUES (1, 'Директор', NULL), (2, 'Оля', 1);

SELECT name FROM employees JOIN employees ON id = manager_id;`,
    ],
    note: "Кілька JOIN читайте як ланцюжок зліва направо, кожне з власним ON. У self join таблиця з'єднується сама із собою, тому псевдоніми обов'язкові; щоб не втратити рядок без пари (наприклад, директора), беріть LEFT JOIN.",
    work: "Чеки з позиціями, структура підпорядкування, дерева категорій і коментарів — усе це кілька JOIN або self join. Помилка в одному з ON множить рядки, тож перед підсумками завжди звіряйте кількість рядків з очікуваною.",
    tasks: [
      "У якому порядку читати запит із чотирма JOIN, і що перевіряти, якщо рядків у результаті забагато?",
      "Навіщо в self join потрібні псевдоніми й чому для директора без керівника беруть LEFT JOIN?",
    ],
  },
  {
    t: "UNION, INTERSECT і EXCEPT",
    ch: "Зв'язки й JOIN",
    adv: true,
    easy: "JOIN з'єднує таблиці вшир, а UNION складає результати вдовж: два списки зливаються в один. INTERSECT залишає лише спільне, EXCEPT — те, що є в першому, але немає в другому.",
    p: [
      "<code>JOIN</code> збирає дані з різних таблиць <i>в один рядок</i>, розширюючи результат убік. Але буває потрібне інше: <b>скласти два результати запитів один під одним</b>. Наприклад, у вас є клієнти магазину та передплатники розсилки, і потрібен єдиний список електронних адрес. Для цього є <b>операції над множинами</b>: <code>UNION</code>, <code>INTERSECT</code> і <code>EXCEPT</code>. Вони працюють з готовими результатами запитів, а не з таблицями напряму.",
      "<code>UNION</code> об'єднує результати двох запитів і <b>прибирає дублікати</b>: рядок, що є в обох, з'явиться один раз. Якщо дублікати потрібні (або ви впевнені, що їх немає, і хочете швидшого виконання), пишуть <code>UNION ALL</code>: він просто дописує другий результат до першого без перевірки. Різниця суттєва для підрахунків: <code>UNION ALL</code> збереже повтори, а <code>UNION</code> їх склеїть. Тому для підсумків і лічильників зазвичай потрібен саме <code>UNION ALL</code>.",
      "<code>INTERSECT</code> повертає лише ті рядки, які є <b>в обох</b> результатах, тобто перетин множин: клієнти, які водночас є й передплатниками. <code>EXCEPT</code> повертає рядки <b>першого</b> результату, яких <b>немає в другому</b>, тобто різницю: клієнти, що не підписані на розсилку. На відміну від <code>UNION</code> та <code>INTERSECT</code>, порядок запитів у <code>EXCEPT</code> має значення: «A без B» і «B без A» — різні списки. Ці операції також прибирають повтори.",
      "Є суворі правила. Обидва запити повинні повертати <b>однакову кількість стовпців</b>, і стовпці на однакових позиціях мають бути сумісних типів. Назви стовпців у результаті беруться з <i>першого</i> запиту, тож псевдоніми дають саме йому. Якщо кількість стовпців різна, SQLite повідомить, що запити зліва й справа від <code>UNION</code> мають різну кількість стовпців. Усі ці операції зіставляють рядки за значеннями <i>всіх</i> стовпців одразу, причому два <code>NULL</code> тут вважаються рівними (на відміну від звичайних порівнянь).",
      "<code>ORDER BY</code> у таких запитах пишуть <b>один раз у самому кінці</b>, і він стосується всього об'єднаного результату: <code>SELECT … UNION SELECT … ORDER BY 1</code>. Усередині окремих частин сортувати немає сенсу. У <code>ORDER BY</code> після операції над множинами зазвичай використовують номер стовпця чи його ім'я з першого запиту. Умови <code>WHERE</code>, навпаки, пишуть у кожній частині окремо, бо кожна є самостійним запитом.",
      "Типове застосування <code>UNION ALL</code> — зведення однотипних таблиць (<code>orders_2025</code> і <code>orders_2026</code>) у одну вибірку, а також додавання підсумкового рядка до списку. <code>EXCEPT</code> корисний, коли потрібно знайти «розбіжності»: що є в одній таблиці та відсутнє в іншій. Багато завдань, розв'язуваних через <code>LEFT JOIN … IS NULL</code>, можна записати й через <code>EXCEPT</code>; вибір залежить від того, наскільки читабельнішим вам здається запис.",
      "Нагадаємо: все це належить до просунутого рівня, бо потребує стежити за стовпцями та їхнім порядком. Наступна глава піде далі: ми навчимося вкладати запити один в одного й давати проміжним результатам імена за допомогою підзапитів та CTE.",
    ],
    code: [
      String.raw`CREATE TABLE customers (email TEXT);
CREATE TABLE subscribers (email TEXT);
INSERT INTO customers VALUES ('olya@x.com'), ('ivan@x.com'), ('maria@x.com');
INSERT INTO subscribers VALUES ('ivan@x.com'), ('petro@x.com');

-- UNION прибирає дублікати: ivan@x.com лише один раз
SELECT email FROM customers
UNION
SELECT email FROM subscribers
ORDER BY email;`,
      String.raw`CREATE TABLE customers (email TEXT);
CREATE TABLE subscribers (email TEXT);
INSERT INTO customers VALUES ('olya@x.com'), ('ivan@x.com'), ('maria@x.com');
INSERT INTO subscribers VALUES ('ivan@x.com'), ('petro@x.com');

-- UNION ALL лишає повтори, тому для лічильників потрібен саме він
SELECT COUNT(*) FROM (SELECT email FROM customers UNION ALL SELECT email FROM subscribers);
SELECT COUNT(*) FROM (SELECT email FROM customers UNION SELECT email FROM subscribers);`,
      String.raw`CREATE TABLE customers (email TEXT);
CREATE TABLE subscribers (email TEXT);
INSERT INTO customers VALUES ('olya@x.com'), ('ivan@x.com'), ('maria@x.com');
INSERT INTO subscribers VALUES ('ivan@x.com'), ('petro@x.com');

-- INTERSECT — спільне, EXCEPT — перше без другого
SELECT email FROM customers INTERSECT SELECT email FROM subscribers;
SELECT email FROM customers EXCEPT SELECT email FROM subscribers ORDER BY email;`,
      String.raw`CREATE TABLE orders_2025 (id INTEGER, total INTEGER);
CREATE TABLE orders_2026 (id INTEGER, total INTEGER);
INSERT INTO orders_2025 VALUES (1, 100), (2, 50);
INSERT INTO orders_2026 VALUES (3, 70);

-- зведення однотипних таблиць; ORDER BY один, у самому кінці
SELECT id, total, 2025 AS year FROM orders_2025
UNION ALL
SELECT id, total, 2026 FROM orders_2026
ORDER BY id;`,
      String.raw`-- помилка: у запитів різна кількість стовпців
CREATE TABLE customers (id INTEGER, email TEXT);
CREATE TABLE subscribers (email TEXT);

SELECT id, email FROM customers
UNION
SELECT email FROM subscribers;`,
    ],
    note: "UNION прибирає дублікати, UNION ALL їх лишає (для підрахунків потрібен він). EXCEPT чутливий до порядку запитів. Обидва запити мають повертати однакову кількість стовпців, а ORDER BY пишуть один раз у кінці.",
    work: "Зведення кількох однотипних таблиць, об'єднання списків із різних джерел, пошук розбіжностей між двома вигрузками: усе це UNION, INTERSECT і EXCEPT. Обережність із UNION замість UNION ALL у підрахунках уникне «тихо» заниженої кількості.",
    tasks: [
      "Чим UNION відрізняється від UNION ALL і коли потрібен другий?",
      "Що поверне A EXCEPT B і чому A EXCEPT B та B EXCEPT A — різні запити?",
    ],
  },
];
