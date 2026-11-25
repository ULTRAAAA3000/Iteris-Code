export const LESSONS_08 = [
  {
    t: "Date: дати й інтервали",
    ch: "Вбудовані можливості",
    easy: "Об'єкт <code>Date</code> — це годинник, що рахує мілісекунди від початку 1970 року. Усе інше (рік, місяць, день) він лише обчислює з цього числа, і тут чекає кілька підступних дрібниць.",
    p: [
      "Об'єкт <code>Date</code> зберігає одне число: кількість мілісекунд, що минули з опівночі 1 січня 1970 року за UTC (так звана «епоха Unix»). Поточний момент дає <code>new Date()</code> чи <code>Date.now()</code> (останній повертає просто число). Інші способи створення: з числа (<code>new Date(0)</code>), з рядка (<code>new Date(\"2024-03-15T10:30:00Z\")</code>) і з компонентів (<code>new Date(2024, 2, 15, 10, 30)</code>). Рядок найнадійніше писати у форматі ISO 8601, який розуміють усі рушії однаково.",
      "Перша пастка: у конструкторі з компонентами <b>місяці нумеруються з нуля</b>. Тому <code>new Date(2024, 2, 15)</code> — це 15 <i>березня</i>, а січень має номер 0. Дні місяця, навпаки, починаються з одиниці. Зайві значення «переливаються»: 32 січня стає 1 лютого. Це зручно для додавання днів (<code>d.setDate(d.getDate() + 10)</code>), але перетворює помилку в даних на мовчазний зсув дати.",
      "Для читання складових є методи <code>getFullYear()</code>, <code>getMonth()</code>, <code>getDate()</code>, <code>getDay()</code> (день тижня, 0 це неділя), <code>getHours()</code> та інші, а для запису відповідні <code>set...</code>. Кожен має двійник із <code>UTC</code> (<code>getUTCHours()</code>), що працює в часі за Гринвічем. Звичайні версії повертають значення в <b>локальному часовому поясі</b> машини, тож той самий момент на двох комп'ютерах дає різні години. Для логіки, яка не повинна залежати від пояса, використовуйте UTC-методи.",
      "Для порівняння й арифметики дату можна перетворити на число: <code>date.getTime()</code> або просто <code>+date</code>. Різниця двох дат (<code>b - a</code>) дає мілісекунди, які ділять на <code>1000 * 60 * 60 * 24</code>, щоб отримати дні. Порівнювати дати оператором <code>===</code> не можна, бо це об'єкти: порівнюйте <code>a.getTime() === b.getTime()</code>. Оператори <code>&lt;</code> та <code>&gt;</code> працюють правильно, бо дати перетворюються на числа. Не забувайте, що кількість мілісекунд у добі не завжди стала через перехід на літній час.",
      "Недійсну дату створює невдалий розбір: <code>new Date(\"abc\")</code> повертає <code>Invalid Date</code>, і <code>getTime()</code> дає <code>NaN</code>. Помилки при цьому немає, вона з'являється пізніше, наприклад <code>toISOString()</code> кидає <code>RangeError: Invalid time value</code>. Тому дані ззовні перевіряйте: <code>Number.isNaN(date.getTime())</code>. Також розбір рядків, відмінних від ISO, залежить від рушія: <code>\"03/04/2024\"</code> може означати і 3 квітня, і 4 березня.",
      "Для виводу є кілька готових форм. <code>toISOString()</code> повертає стандартний рядок в UTC (<code>2024-03-15T10:30:00.000Z</code>) і зручний для обміну даними. <code>toJSON()</code> робить те саме, тому дати в <code>JSON.stringify</code> стають такими рядками. <code>toLocaleDateString(\"uk-UA\")</code> та <code>toLocaleString</code> форматують під мову користувача, а детальніше про це в наступному уроці про <code>Intl</code>. Метод <code>toString()</code> залежить від локалі системи й для обміну даними не годиться.",
      "Правило практики: зберігайте й передавайте моменти як UTC (ISO-рядок чи мілісекунди), перетворюйте на локальний час лише для показу. Дати без часу («день народження») зручно тримати як рядок <code>YYYY-MM-DD</code>, а не як <code>Date</code>, щоб пояс не зрушив день. А від складної календарної арифметики (робочі дні, місяці, пояси) краще відмовитись на користь перевіреної бібліотеки чи нового <code>Temporal</code>, до якого ми ще дійдемо.",
    ],
    code: [
      String.raw`const d = new Date("2024-03-15T10:30:00Z");
console.log(d.toISOString(), d.getTime());
console.log(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCDay());
console.log(new Date(0).toISOString(), typeof Date.now());
console.log(Date.UTC(2024, 2, 15) === new Date("2024-03-15T00:00:00Z").getTime());`,
      String.raw`const march = new Date(Date.UTC(2024, 2, 15));   // місяць 2 — це березень
console.log(march.toISOString().slice(0, 10));
const overflow = new Date(Date.UTC(2024, 0, 32));    // 32 січня
console.log(overflow.toISOString().slice(0, 10));
const next = new Date(Date.UTC(2024, 0, 31));
next.setUTCDate(next.getUTCDate() + 30);
console.log(next.toISOString().slice(0, 10));`,
      String.raw`const a = new Date("2024-03-01T00:00:00Z");
const b = new Date("2024-03-15T12:00:00Z");
const msPerDay = 1000 * 60 * 60 * 24;
console.log((b - a) / msPerDay, Math.floor((b - a) / msPerDay));
console.log(a < b, a === new Date(a), a.getTime() === new Date(a).getTime());
console.log([b, a].sort((x, y) => x - y).map((d) => d.toISOString().slice(0, 10)));`,
      String.raw`const bad = new Date("не дата");
console.log(String(bad), bad.getTime(), Number.isNaN(bad.getTime()));
console.log(JSON.stringify({ when: new Date(0) }));
console.log(new Date(0).toJSON() === new Date(0).toISOString());`,
      String.raw`// аварія: недійсна дата не кидає помилки одразу, але toISOString на ній викликає RangeError
const parsed = new Date("2024-13-45");
console.log("Дата створена:", String(parsed));
console.log(parsed.toISOString());`,
    ],
    note: "Місяці в <code>Date</code> нумеруються з нуля, а зайві значення переливаються в наступний період. Зберігайте моменти як UTC, порівнюйте через <code>getTime()</code>. Недійсна дата дає <code>NaN</code>, а <code>toISOString</code> на ній кидає <code>RangeError</code>.",
    work: "Дедлайни, терміни дії, вік користувача, розклади й журнали подій працюють із датами. Типові помилки — зсув місяця на одиницю та різниця в годину через часовий пояс — відловлюються лише знанням цих нюансів.",
    tasks: [
      "Чому new Date(2024, 2, 15) означає березень і що станеться, якщо передати 32 як день січня?",
      "Як порівняти дві дати та чому не можна використовувати === для об'єктів Date?",
    ],
  },
  {
    t: "Intl: числа, дати й мови",
    ch: "Вбудовані можливості",
    easy: "<code>Intl</code> — вбудований перекладач форматів: він знає, що в Україні кома відділяє копійки, а в США крапка, і вміє показати дату, валюту чи список слів так, як звикли читачі конкретної мови.",
    p: [
      "Різні країни по-різному пишуть числа й дати: <code>1 234,50</code> чи <code>1,234.50</code>, <code>15.03.2024</code> чи <code>03/15/2024</code>. Писати ці правила вручну марно, адже їх тисячі, і вони змінюються. Для цього в мові є вбудований об'єкт <code>Intl</code> з даними бази CLDR. Він працює в усіх сучасних браузерах і в Node.js, а мову задає код на кшталт <code>\"uk-UA\"</code>, <code>\"en-US\"</code>, <code>\"de-DE\"</code>.",
      "<code>Intl.NumberFormat(locale, options)</code> форматує числа. Параметр <code>style</code> задає вид: <code>\"decimal\"</code>, <code>\"percent\"</code>, <code>\"currency\"</code> (разом з <code>currency: \"UAH\"</code>), <code>\"unit\"</code>. Опції <code>minimumFractionDigits</code> та <code>maximumFractionDigits</code> керують дробовою частиною, а <code>notation: \"compact\"</code> дає скорочення на кшталт «1,2 тис.». Створений форматер викликають методом <code>.format(number)</code>. Той самий результат дає <code>number.toLocaleString(locale, options)</code>, але форматер зручніше створити один раз і перевикористовувати.",
      "<code>Intl.DateTimeFormat(locale, options)</code> форматує дати. Опції <code>dateStyle</code> та <code>timeStyle</code> (<code>\"short\"</code>, <code>\"medium\"</code>, <code>\"long\"</code>, <code>\"full\"</code>) задають стиль, а окремі поля (<code>year</code>, <code>month</code>, <code>day</code>, <code>hour</code>, <code>weekday</code>) дозволяють зібрати формат вручну. Важлива опція <code>timeZone</code> (<code>\"UTC\"</code>, <code>\"Europe/Kyiv\"</code>): вона показує момент часу в потрібному поясі незалежно від налаштувань комп'ютера. Це єдиний надійний спосіб показати час в інших поясах без ручних зсувів.",
      "Метод <code>formatToParts(value)</code> повертає не готовий рядок, а масив частин <code>{ type, value }</code> (<code>\"year\"</code>, <code>\"month\"</code>, <code>\"literal\"</code> тощо). З нього можна зібрати власний формат, не залежачи від порядку та роздільників локалі. Наприклад, щоб отримати рядок <code>YYYY-MM-DD HH:mm</code> у заданому часовому поясі, форматують дату з англійською локаллю та числовими опціями й складають частини за типами. Така техніка працює однаково в усіх середовищах.",
      "Роздільники й пробіл між числом та символом валюти в різних локалях — це <b>нерозривні пробіли</b> та інші спецсимволи (U+00A0, U+202F). Тому, порівнюючи вивід форматера з літералом у тестах, легко отримати хибну невідповідність: рядки виглядають однаково, але відрізняються символами. Також точний текст може трохи змінюватися між версіями ICU. Не залежіть від точних рядків локалізації в бізнес-логіці й тестах, а перевіряйте частини через <code>formatToParts</code> або нормалізуйте пробіли.",
      "Помилки трапляються тоді, коли вказано недійсний код мови чи валюти: <code>new Intl.NumberFormat(\"не_мова!!\")</code> кидає <code>RangeError</code>. Якщо потрібної локалі в середовищі немає, <code>Intl</code> тихо відкотиться до запасної; перевірити можна через <code>Intl.NumberFormat.supportedLocalesOf([...])</code>. Мову користувача в браузері дає <code>navigator.language</code>. А ось що не варто робити, так це форматувати числа вручну через <code>toFixed</code> і заміну крапки комою: це працює для одного випадку й ламається для всіх інших.",
    ],
    code: [
      String.raw`const n = 1234567.891;
console.log(new Intl.NumberFormat("en-US").format(n));
console.log(new Intl.NumberFormat("de-DE").format(n));
console.log(new Intl.NumberFormat("en-US", { style: "percent" }).format(0.256));
console.log(new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(1234.5));
console.log(new Intl.NumberFormat("en-US", { notation: "compact" }).format(1234567));
console.log(new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(2.5));`,
      String.raw`const date = new Date("2024-03-15T10:30:00Z");
console.log(new Intl.DateTimeFormat("en-US", { timeZone: "UTC", dateStyle: "long" }).format(date));
console.log(new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", dateStyle: "short", timeStyle: "short" }).format(date));
console.log(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date));`,
      String.raw`function formatInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  return get("year") + "-" + get("month") + "-" + get("day") + " " + get("hour") + ":" + get("minute");
}
const moment = new Date("2024-03-15T23:30:00Z");
console.log(formatInZone(moment, "UTC"), formatInZone(moment, "Asia/Tokyo"), formatInZone(moment, "America/New_York"));`,
      String.raw`const price = new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH" }).format(1234.5);
console.log(price, price.length);
console.log(JSON.stringify(price.replace(/\s/g, "_")));
console.log(Intl.NumberFormat.supportedLocalesOf(["uk-UA", "xx-YY"]));`,
      String.raw`// аварія: некоректний код мови викликає RangeError
const formatter = new Intl.NumberFormat("це_не_мова!!");
console.log(formatter.format(1));`,
    ],
    note: "<code>Intl.NumberFormat</code> і <code>Intl.DateTimeFormat</code> форматують за правилами мови, а опція <code>timeZone</code> показує час у потрібному поясі. Для власних форматів беріть <code>formatToParts</code>. У виводі трапляються нерозривні пробіли, тому порівнювати рядки в тестах небезпечно.",
    work: "Ціни, дати, відсотки й компактні числа в інтерфейсі показують через Intl, щоб користувач бачив звичний для його країни формат. Інтернаціоналізація починається з відмови від ручного форматування чисел і дат та від жорстко вписаних роздільників.",
    tasks: [
      "Навіщо використовувати Intl замість ручного форматування чисел і дат і що робить опція timeZone?",
      "Для чого потрібен formatToParts і чому порівняння рядків із виводом Intl може бути ненадійним?",
    ],
  },
  {
    t: "JSON: stringify і parse",
    ch: "Вбудовані можливості",
    easy: "JSON — текстовий формат для обміну даними, схожий на запис об'єктів у JavaScript. <code>JSON.stringify</code> перетворює значення на рядок, а <code>JSON.parse</code> відновлює його з рядка, і обидва мають свої правила та винятки.",
    p: [
      "JSON (JavaScript Object Notation) — найпоширеніший формат обміну даними в вебі. Він підтримує об'єкти, масиви, рядки, числа, <code>true</code>, <code>false</code> та <code>null</code>. Ключі та рядки обов'язково беруться в <b>подвійні</b> лапки, коментарів і кінцевих ком немає. Тому не кожен літерал JavaScript є коректним JSON: <code>{ a: 1 }</code> чи <code>{'a': 1}</code> розпарсити не вдасться. Формат мовно-незалежний, його розуміють усі сучасні мови.",
      "<code>JSON.stringify(value)</code> повертає рядок. Не всі значення мають аналог у JSON, тому діють правила перетворення. Властивості зі значенням <code>undefined</code>, функції та символи в об'єктах пропускаються, а в масивах стають <code>null</code>. <code>NaN</code> та <code>Infinity</code> стають <code>null</code>. <code>Date</code> перетворюється на ISO-рядок через метод <code>toJSON</code>. <code>Map</code> та <code>Set</code> перетворюються на порожній об'єкт <code>{}</code>. Значення <code>BigInt</code> викликає <code>TypeError</code>, а циклічні посилання теж <code>TypeError</code>.",
      "Другий аргумент <code>stringify</code> — <b>replacer</b>: масив дозволених ключів або функція <code>(key, value) =&gt; ...</code>, яка змінює чи відкидає значення (повернене <code>undefined</code> прибирає поле). Третій аргумент задає відступи для читабельного виводу: число (кількість пробілів) чи рядок. Якщо в об'єкта є метод <code>toJSON()</code>, <code>stringify</code> викличе його й серіалізує результат. Так власні класи самі вирішують, як виглядатимуть у JSON, наприклад приховати службові поля чи перетворити внутрішні структури.",
      "<code>JSON.parse(text)</code> розбирає рядок у значення. На некоректному вході кидає <code>SyntaxError</code>, тому розбір даних із зовнішніх джерел майже завжди обгортають у <code>try/catch</code>. Другий аргумент <b>reviver</b>, функція <code>(key, value) =&gt; ...</code>, викликається для кожного значення знизу вгору й дозволяє відновити типи, які JSON не знає: наприклад, перетворити рядки в дати за назвою поля. Важливо: <code>JSON.parse(undefined)</code> теж падає, бо <code>undefined</code> перетворюється на рядок <code>\"undefined\"</code>, який не є валідним JSON.",
      "Серіалізація «туди й назад» не завжди повертає той самий об'єкт. Дати стають рядками, <code>undefined</code> зникає, <code>NaN</code> стає <code>null</code>, прототипи й методи губляться. Через це <code>JSON.parse(JSON.stringify(x))</code> як спосіб глибокого копіювання має обмеження, і в сучасному коді краще брати <code>structuredClone</code>. Також парсер <code>JSON.parse</code> створює звичайні об'єкти, тому ключ <code>\"__proto__\"</code> з JSON стає власною властивістю, а не змінює прототип, і це безпечно, але передавати такі об'єкти в небезпечні функції злиття варто з обережністю.",
      "Числа в JSON мають обмеження: це 64-бітні числа з рухомою комою, тож великі цілі (ідентифікатори понад 2^53) втрачають точність при розборі. Тому сервери часто передають такі ідентифікатори рядками. Порядок ключів об'єкта після розбору збігається з порядком у тексті, а от для цілих невід'ємних ключів діє правило впорядкування властивостей JavaScript. Для стабільного виводу (наприклад, для підписів чи порівняння) ключі сортують окремо через replacer.",
      "Практичні поради. Не довіряйте даним: перевіряйте структуру після <code>parse</code>. Не зберігайте у JSON секрети без потреби: <code>stringify</code> випадково віддасть усе, що є в об'єкті. Для великих файлів JSON парсять потоково спеціальними бібліотеками. А для зручного виводу в консоль чи журнал використовуйте третій аргумент <code>stringify</code>. Знання цих кількох правил запобігає цілій купі несподіванок під час роботи з API.",
    ],
    code: [
      String.raw`const data = { name: "Оля", age: 17, tags: ["a", "b"], active: true, nothing: null };
const text = JSON.stringify(data);
console.log(text);
console.log(JSON.stringify(data, null, 2));
console.log(JSON.parse(text).tags[1]);`,
      String.raw`const tricky = { u: undefined, f() {}, s: Symbol("x"), n: NaN, inf: Infinity, d: new Date(0), m: new Map([[1, 2]]), arr: [undefined, () => 1] };
console.log(JSON.stringify(tricky));
console.log(JSON.stringify({ a: 1, b: 2, c: 3 }, ["a", "c"]));
console.log(JSON.stringify({ price: 5, secret: "x" }, (k, v) => (k === "secret" ? undefined : v)));`,
      String.raw`class User {
  constructor(name, password) { this.name = name; this.password = password; }
  toJSON() { return { name: this.name }; }
}
console.log(JSON.stringify([new User("Оля", "123")]));
const revived = JSON.parse('{"title":"Зустріч","when":"2024-03-15T10:00:00.000Z"}', (key, value) =>
  key === "when" ? new Date(value) : value);
console.log(revived.when instanceof Date, revived.when.getUTCHours());`,
      String.raw`const check = ["{\"a\":1}", "{a:1}", "{'a':1}", "[1,2,]", "", "undefined", "null"];
for (const text of check) {
  try {
    console.log(JSON.stringify(text), "→", JSON.stringify(JSON.parse(text)));
  } catch (error) {
    console.log(JSON.stringify(text), "→", error.name);
  }
}
console.log(JSON.parse("12345678901234567890"));`,
      String.raw`// аварія: BigInt не має JSON-подання, і stringify кидає TypeError
const order = { id: 9007199254740993n, total: 100 };
console.log(JSON.stringify({ total: order.total }));
console.log(JSON.stringify(order));`,
    ],
    note: "<code>JSON.stringify</code> губить <code>undefined</code>, функції та символи, перетворює <code>NaN</code> на <code>null</code>, а <code>BigInt</code> і цикли кидають <code>TypeError</code>. <code>JSON.parse</code> кидає <code>SyntaxError</code> на некоректному тексті, тому його обгортають у try/catch. Для власних типів є <code>toJSON</code> і reviver.",
    work: "Усі API, файли налаштувань і локальне сховище говорять JSON. Розуміння, що саме губиться під час серіалізації, запобігає зникненню полів, зсуву дат і падінню на даних, які прийшли в несподіваному вигляді.",
    tasks: [
      "Які значення JSON.stringify пропускає або перетворює та коли він кидає TypeError?",
      "Для чого потрібні replacer і reviver та як зробити так, щоб власний клас сам визначав свій вигляд у JSON?",
    ],
  },
  {
    t: "Math і псевдовипадкові числа",
    ch: "Вбудовані можливості",
    easy: "Об'єкт <code>Math</code> містить математичні функції й константи, а <code>Math.random()</code> видає «випадкові» числа, насправді обчислені за формулою. Для тестів їх можна зробити відтворюваними, а для безпеки потрібні справжні криптографічні.",
    p: [
      "Об'єкт <code>Math</code> — набір функцій і констант без конструктора. Константи: <code>Math.PI</code>, <code>Math.E</code>. Округлення: <code>round</code>, <code>floor</code>, <code>ceil</code>, <code>trunc</code>. Степені й корені: <code>Math.pow</code> (або <code>**</code>), <code>Math.sqrt</code>, <code>Math.cbrt</code>, <code>Math.hypot(3, 4)</code> дає довжину гіпотенузи. Логарифми й тригонометрія: <code>log</code>, <code>log2</code>, <code>log10</code>, <code>sin</code>, <code>cos</code>, <code>atan2</code> (кути в радіанах, не в градусах). Також <code>Math.sign</code>, <code>Math.abs</code>, <code>Math.min</code> та <code>Math.max</code>.",
      "У <code>min</code> й <code>max</code> є особливості. Вони приймають довільну кількість аргументів, а масив треба розгорнути: <code>Math.max(...numbers)</code>. Для порожнього набору <code>Math.max()</code> дає <code>-Infinity</code>, а <code>Math.min()</code> дає <code>Infinity</code>, що логічно, але несподівано. Якщо хоч один аргумент не число (<code>NaN</code>), результат теж <code>NaN</code>. Для дуже великих масивів розгортання може переповнити стек викликів, тоді беруть <code>reduce</code> або цикл.",
      "<code>Math.random()</code> повертає число від 0 включно до 1 виключно. Щоб отримати ціле у діапазоні, використовують формулу <code>Math.floor(Math.random() * (max - min + 1)) + min</code> для чисел від <code>min</code> до <code>max</code> включно. Типові помилки: забути <code>+ 1</code> (тоді <code>max</code> ніколи не випаде), використати <code>Math.round</code> (крайні значення випадатимуть удвічі рідше) чи плутати верхню межу. Вибір випадкового елемента масиву: <code>arr[Math.floor(Math.random() * arr.length)]</code>.",
      "<b>Перемішування</b> масиву треба робити правильним алгоритмом Фішера-Єйтса: йдемо з кінця, для кожного <code>i</code> вибираємо випадковий <code>j</code> від 0 до <code>i</code> і міняємо елементи місцями. Поширений трюк <code>arr.sort(() =&gt; Math.random() - 0.5)</code> дає нерівномірний розподіл і залежить від реалізації сортування, тож його використовувати не можна. Алгоритм Фішера-Єйтса проходить масив один раз і дає всі перестановки з однаковою ймовірністю.",
      "<code>Math.random()</code> — це <b>псевдо</b>випадковий генератор: послідовність обчислюється детермінованою формулою, а початкове значення (seed) рушій вибирає сам. Тому його не можна відтворити і не можна використовувати для безпеки (паролі, токени, ключі): послідовність можна передбачити. Для криптографії є <code>crypto.getRandomValues(typedArray)</code> та <code>crypto.randomUUID()</code>, які дають справді непередбачувані значення й доступні в браузерах і Node.js.",
      "Для тестів і ігор часто потрібна якраз відтворюваність: однаковий seed — однакова послідовність. Вбудованого генератора з seed у JavaScript немає, тому пишуть невеликий власний, наприклад <code>mulberry32</code>: функція, яка зберігає число-стан і з кожним викликом дає наступне значення в діапазоні від 0 до 1. Завдяки йому можна писати детерміновані тести для коду з випадковістю: передавати генератор як параметр (<code>rng</code>), а не звертатись до <code>Math.random</code> усередині функції.",
      "Це й є головна порада: робіть випадковість залежністю. Функція <code>shuffle(arr, rng = Math.random)</code> у продакшені використовує звичайний генератор, а в тестах отримує підроблений, що повертає відомі числа, і результат стає передбачуваним. Так само з часом (<code>now = () =&gt; Date.now()</code>) та ідентифікаторами. У практичному завданні ви напишете якраз такі функції, а тест перевірить їх на відомих послідовностях.",
    ],
    code: [
      String.raw`console.log(Math.round(2.5), Math.round(-2.5), Math.floor(-2.5), Math.trunc(-2.5), Math.ceil(2.1));
console.log(Math.hypot(3, 4), Math.sqrt(16), 2 ** 10, Math.sign(-7), Math.abs(-3));
console.log(Math.max(1, 5, 3), Math.max(...[4, 9, 2]), Math.max(), Math.min(), Math.max(1, NaN));
console.log(Math.sin(Math.PI / 2), Math.log10(1000), Math.log2(8), Math.atan2(1, 1) * 180 / Math.PI);`,
      String.raw`function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = mulberry32(42);
const r2 = mulberry32(42);
const first = [r1(), r1(), r1()];
console.log(first.every((x) => x >= 0 && x < 1), first.join() === [r2(), r2(), r2()].join());
console.log(mulberry32(1)() === mulberry32(2)());`,
      String.raw`const randomInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;
function shuffle(items, rng = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
console.log(randomInt(() => 0, 1, 6), randomInt(() => 0.999999, 1, 6));
console.log(shuffle([1, 2, 3, 4], () => 0));
const source = [1, 2, 3];
shuffle(source);
console.log(source);`,
      String.raw`const bytes = crypto.getRandomValues(new Uint8Array(4));
console.log(bytes.length, bytes.every((b) => b >= 0 && b <= 255));
const id = crypto.randomUUID();
console.log(id.length, /^[0-9a-f-]{36}$/.test(id));
const counts = [0, 0, 0];
const fixed = [0.1, 0.5, 0.9, 0.34, 0.67];
for (const x of fixed) counts[Math.floor(x * 3)]++;
console.log(counts);`,
      String.raw`// аварія: getRandomValues працює лише з цілочисельними типізованими масивами, а Float64Array не підходить
const ok = crypto.getRandomValues(new Uint8Array(2));
console.log(ok.length);
crypto.getRandomValues(new Float64Array(2));`,
    ],
    note: "<code>Math.random()</code> передбачуваний і не годиться для безпеки, тоді беріть <code>crypto.getRandomValues</code> чи <code>crypto.randomUUID</code>. Для цілих у діапазоні використовуйте <code>floor(random * (max - min + 1)) + min</code>, а перемішування робіть алгоритмом Фішера-Єйтса. Передавайте генератор параметром, щоб тести були відтворюваними.",
    work: "Ігри, A/B-тести, випадкові вибірки, перемішування списків і тестові дані потребують випадковості, а токени й ідентифікатори сесій потребують криптографічної. Відтворюваний генератор із фіксованим seed робить тести стабільними та помилки відтворюваними.",
    tasks: [
      "Чим Math.random відрізняється від crypto.getRandomValues і чому sort(() =&gt; Math.random() - 0.5) не годиться для перемішування?",
      "Навіщо передавати генератор випадкових чисел параметром функції та як отримати ціле число від min до max включно?",
    ],
  },
  {
    t: "RegExp: основи",
    ch: "Вбудовані можливості",
    easy: "Регулярний вираз — це «шаблон пошуку» для тексту: ви описуєте форму рядка (наприклад, «три цифри, дефіс, чотири цифри»), а рушій знаходить усі місця, де текст цій формі відповідає.",
    p: [
      "Регулярний вираз (RegExp) пишуть літералом між скісними рисками, <code>/шаблон/прапорці</code>, або конструктором <code>new RegExp(\"шаблон\", \"прапорці\")</code>. Літерал зручніший для постійних шаблонів, конструктор потрібен, коли шаблон будується з рядка. У конструкторі скісні риски потрібно подвоювати (<code>\"\\\\d+\"</code>), бо рядок сам інтерпретує зворотну скісну риску. Некоректний шаблон у конструкторі кидає <code>SyntaxError</code> під час виконання.",
      "Складові шаблону. Звичайні символи збігаються самі з собою. Класи символів: <code>\\d</code> (цифра), <code>\\w</code> (літера, цифра чи підкреслення, лише латиниця), <code>\\s</code> (пробільний), <code>.</code> (будь-який, крім нового рядка), а також власні набори <code>[abc]</code>, діапазони <code>[a-z]</code> й заперечення <code>[^0-9]</code>. Якорі: <code>^</code> початок, <code>$</code> кінець, <code>\\b</code> межа слова. Спецсимволи <code>. * + ? ( ) [ ] { } | \\ ^ $</code> треба екранувати зворотною скісною рискою, якщо потрібен сам символ.",
      "Квантифікатори задають кількість повторів: <code>*</code> (нуль чи більше), <code>+</code> (один чи більше), <code>?</code> (нуль або один), <code>{3}</code>, <code>{2,5}</code>. За замовчуванням вони «жадібні»: беруть якомога більше. Додавши <code>?</code> після квантифікатора (<code>.+?</code>), ви робите його «лінивим», тобто мінімальним. Класична помилка: <code>/&lt;.+&gt;/</code> на рядку <code>&lt;a&gt;&lt;b&gt;</code> збігається з усім рядком, а <code>/&lt;.+?&gt;/</code> — лише з <code>&lt;a&gt;</code>. Дужки <code>( )</code> створюють групу, а <code>|</code> означає «або».",
      "Прапорці змінюють поведінку: <code>g</code> (глобальний, шукати всі збіги), <code>i</code> (ігнорувати регістр), <code>m</code> (<code>^</code> і <code>$</code> працюють для кожного рядка), <code>s</code> (крапка охоплює й новий рядок), <code>u</code> (повна підтримка Unicode, потрібна для <code>\\p{L}</code> і емодзі), <code>y</code> (липкий пошук з поточної позиції), <code>d</code> (повертати індекси груп). Для українського тексту вираз <code>\\w</code> не бачить кирилиці, тому слова шукають через <code>/[\\p{L}\\p{N}']+/gu</code>.",
      "Методи. <code>regex.test(str)</code> повертає булеве значення. <code>str.match(regex)</code> повертає збіг або (з прапорцем <code>g</code>) масив усіх збігів. <code>str.matchAll(regex)</code> повертає ітератор збігів із групами (потребує <code>g</code>). <code>regex.exec(str)</code> дає детальний збіг за один раз. <code>str.replace(regex, замінник)</code> замінює, а <code>replaceAll</code> вимагає прапорця <code>g</code>. <code>str.split(regex)</code> ділить рядок за шаблоном. <code>str.search(regex)</code> повертає позицію збігу або <code>-1</code>.",
      "Підступна деталь: у регулярного виразу з прапорцем <code>g</code> чи <code>y</code> є стан <code>lastIndex</code>. Метод <code>test</code> і <code>exec</code> продовжують пошук з цієї позиції, тож повторний виклик на іншому рядку може несподівано повернути <code>false</code>. Тому не використовуйте <code>test</code> зі спільним виразом із прапорцем <code>g</code> і не зберігайте такі вирази як глобальні константи для перевірок. Для перевірок краще вирази без <code>g</code>.",
      "Регулярні вирази потужні, але легко стають нечитабельними. Розбивайте їх на частини, коментуйте, давайте іменовані групи (про них у наступному уроці) й не намагайтеся розбирати ними складні формати (HTML, повні email-адреси за стандартом): для цього є парсери. І завжди перевіряйте шаблон на хороших, поганих та граничних прикладах. Саме це ви зробите в практичному завданні: витягнете хештеги й перевірите колір.",
    ],
    code: [
      String.raw`const text = "Телефони: 044-123-4567 та 050-765-4321.";
const phone = /\d{3}-\d{3}-\d{4}/g;
console.log(phone.test("тест 044-123-4567"));
console.log(text.match(phone));
console.log(text.search(/\d/), "abc".match(/\d/));
console.log("a1b22c333".split(/\d+/), "2024-03-15".replace(/-/g, "."));`,
      String.raw`const html = "<b>жирний</b> і <i>курсив</i>";
console.log(html.match(/<.+>/)[0]);       // жадібно: майже весь рядок
console.log(html.match(/<.+?>/)[0]);      // лінивo: лише перший тег
console.log("Кіт".match(/кіт/i)?.[0], /^\d+$/.test("123"), /^\d+$/.test("12a"));
console.log("ціна: 5 грн, 10 грн".match(/\d+(?= грн)/g));`,
      String.raw`const words = "Привіт, світе! It's JS — 2024.";
console.log(words.match(/\w+/g));                      // кирилицю \w не бачить
console.log(words.match(/[\p{L}\p{N}']+/gu));
for (const m of "a1 b22 c333".matchAll(/([a-z])(\d+)/g)) {
  console.log(m[0], m[1], m[2], m.index);
}`,
      String.raw`const re = /a/g;
console.log(re.test("a"), re.lastIndex);
console.log(re.test("a"), re.lastIndex);   // false: пошук іде з позиції 1
const safe = /a/;
console.log(safe.test("a"), safe.test("a"));
const escaped = "1+1=2".replace(/[.*+?^$()[\]{}|\\]/g, "\\$&");
console.log(escaped, new RegExp(escaped).test("1+1=2"));`,
      String.raw`// аварія: незакрита дужка робить шаблон некоректним, і конструктор кидає SyntaxError під час виконання
const pattern = "(abc";
console.log("Створюємо вираз із рядка");
const re = new RegExp(pattern);
console.log(re.test("abc"));`,
    ],
    note: "Для кирилиці беріть <code>\\p{L}</code> з прапорцем <code>u</code>, а не <code>\\w</code>. Жадібні квантифікатори беруть максимум, лінивим (<code>+?</code>) потрібен мінімум. Вираз із прапорцем <code>g</code> має стан <code>lastIndex</code>, тому <code>test</code> на ньому дає хибні результати.",
    work: "Регулярні вирази перевіряють формат введення, витягують дані з логів і тексту, чистять рядки й розбивають їх на частини. Без базових знань регексів кожна така задача перетворюється на купу умов та циклів.",
    tasks: [
      "Чим жадібний квантифікатор .+ відрізняється від лінивого .+? і що робить прапорець u?",
      "Чому повторний виклик test на виразі з прапорцем g може повернути false і як цього уникнути?",
    ],
  },
  {
    t: "RegExp: групи, lookahead і replace",
    ch: "Вбудовані можливості",
    adv: true,
    easy: "Групи дозволяють «вирізати» частини збігу й дати їм імена, lookahead — перевірити, що йде попереду, не з'їдаючи його, а замінник у <code>replace</code> може бути функцією, що переписує текст як завгодно.",
    p: [
      "Круглі дужки створюють <b>групу захоплення</b>: рушій запам'ятовує підрядок, що збігся з частиною шаблону в дужках. Результат <code>exec</code> чи <code>match</code> (без <code>g</code>) містить масив із повним збігом на позиції 0 та групами на позиціях 1, 2 і так далі. Групи можна називати: <code>(?&lt;year&gt;\\d{4})-(?&lt;month&gt;\\d{2})</code>, і тоді значення доступні як <code>match.groups.year</code>. Іменовані групи роблять шаблон самодокументованим і стійким до зміни порядку.",
      "Якщо група потрібна лише для групування (наприклад, для <code>|</code> чи квантифікатора), але її значення не потрібне, використовують <b>незахоплювальну</b> форму <code>(?:...)</code>. Вона не створює запису в результаті й працює трохи швидше. Групу можна згадати в самому шаблоні: <code>\\1</code> чи <code>\\k&lt;name&gt;</code> шукає той самий текст ще раз. Так знаходять повтори слів: <code>/(?&lt;!\\p{L})(\\p{L}+)\\s+\\1(?!\\p{L})/giu</code> збігається з «кіт кіт» (звичайний <code>\\b</code> розуміє лише латиницю, тож для кирилиці межі слова задають через lookaround).",
      "<b>Lookahead</b> («дивитись уперед») перевіряє умову за поточною позицією, але не включає її в збіг. Позитивний: <code>X(?=Y)</code> — «X, за яким іде Y». Негативний: <code>X(?!Y)</code> — «X, за яким не йде Y». Є й дзеркальний <b>lookbehind</b> («дивитись назад»): <code>(?&lt;=Y)X</code> та <code>(?&lt;!Y)X</code>. Ці конструкції нульової довжини дозволяють формулювати складні умови. Приклад: вираз <code>\\d+(?= грн)</code> знаходить число перед словом «грн», не захоплюючи саме слово.",
      "Класичне застосування lookahead — розбиття числа на розряди: <code>/\\B(?=(\\d{3})+(?!\\d))/g</code> знаходить позиції, після яких ідуть групи рівно по три цифри до кінця. Заміна цих позицій на пробіл перетворює <code>1234567</code> на <code>1 234 567</code>. Така заміна не споживає символів, а лише вставляє роздільники у знайдені «щілини». Для виводу користувачам краще брати <code>Intl.NumberFormat</code>, але приклад чудово показує механізм.",
      "Другий аргумент <code>replace</code> може бути рядком зі спеціальними шаблонами: <code>$1</code>, <code>$2</code> — групи за номером, <code>$&lt;name&gt;</code> — іменовані, <code>$&amp;</code> — весь збіг, <code>$$</code> — знак долара. Приклад зміни формату дати: <code>date.replace(/(?&lt;y&gt;\\d{4})-(?&lt;m&gt;\\d{2})-(?&lt;d&gt;\\d{2})/g, \"$&lt;d&gt;.$&lt;m&gt;.$&lt;y&gt;\")</code> перетворює <code>2024-03-15</code> на <code>15.03.2024</code>. А якщо передати <b>функцію</b>, вона отримує збіг, групи й позицію та повертає замінник: це дозволяє виконувати обчислення під час заміни.",
      "Окремі прапорці й можливості. Прапорець <code>y</code> (липкий) вимагає збігу рівно з <code>lastIndex</code>, що зручно для лексерів. Прапорець <code>d</code> додає в результат масив <code>indices</code> з позиціями груп. Функція <code>matchAll</code> повертає всі збіги з групами, тоді як <code>match</code> із <code>g</code> віддає лише тексти. Для екранування користувацького рядка перед вставкою в шаблон потрібно замінити всі спецсимволи, інакше користувач зможе змінити сам шаблон.",
      "Остання застереження — продуктивність. Погано складені вирази зі вкладеними квантифікаторами на кшталт <code>(a+)+$</code> можуть вимагати експоненційного часу на певних рядках («катастрофічний бектрекінг»), і зловмисник здатен «підвісити» сервер, надіславши спеціальний текст (атака ReDoS). Уникайте вкладених повторів над однаковими символами, обмежуйте довжину вхідних рядків і не запускайте користувацькі шаблони без потреби. Простіший шаблон — і швидший, і безпечніший.",
    ],
    code: [
      String.raw`const m = "Дата: 2024-03-15".match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
console.log(m.groups.year, m.groups.month, m.groups.day, m.index);
console.log(m[1], m[0]);
const [, y, mo] = /(\d{4})-(\d{2})/.exec("2024-03");
console.log(y, mo);
console.log("кіт кіт спить спить дуже".match(/(?<!\p{L})(\p{L}+)\s+\1(?!\p{L})/giu));`,
      String.raw`const price = "5 грн, 10 USD, 20 грн";
console.log(price.match(/\d+(?= грн)/g));       // lookahead
console.log(price.match(/\d+(?! грн)\b/g));     // негативний lookahead
console.log("ціна: $5, €7".match(/(?<=\$)\d+/g));   // lookbehind
console.log("a1 b2 c3".replace(/[a-z](?=2)/, "X"));`,
      String.raw`const addThousands = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
console.log(addThousands("1234567"), addThousands("999"), addThousands("1000"), addThousands("12345678"));
const dmy = "2024-03-15 і 2023-12-31".replace(
  /(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/g,
  "$<d>.$<m>.$<y>",
);
console.log(dmy);`,
      String.raw`const withCalc = "ціни: 10, 20, 30".replace(/\d+/g, (num) => String(Number(num) * 2));
console.log(withCalc);
const titled = "hello big world".replace(/\b(\w)(\w*)/g, (match, first, rest) => first.toUpperCase() + rest);
console.log(titled);
console.log("cost $5".replace(/\$(\d)/, "[$$$1]"), "ab".replace(/(a)(b)/, "$2$1"));`,
      String.raw`// аварія: вкладений квантифікатор на невдалому рядку працює експоненційно довго, тому ми обмежили вхід і програма завершується з помилкою
function safeTest(re, text) {
  if (text.length > 20) throw new RangeError("Рядок надто довгий для перевірки (захист від ReDoS)");
  return re.test(text);
}
console.log(safeTest(/^(a+)+$/, "aaaa"));
console.log(safeTest(/^(a+)+$/, "a".repeat(40) + "!"));`,
    ],
    note: "Іменовані групи <code>(?&lt;name&gt;...)</code> доступні як <code>match.groups.name</code>, а в <code>replace</code> як <code>$&lt;name&gt;</code>. Lookahead й lookbehind перевіряють контекст, не включаючи його в збіг. Замінником у <code>replace</code> може бути функція. Остерігайтеся вкладених повторів (ReDoS).",
    work: "Перетворення форматів дат і чисел, розбір логів, шаблонізатори й лексери використовують групи та замінники з функціями. Знання ReDoS важливе для безпеки: поганий регекс на сервері може завалити сервіс.",
    tasks: [
      "Чим іменована група відрізняється від нумерованої та як використати групи у рядку-замінникові replace?",
      "Що означає lookahead (?=...), чим він відрізняється від звичайного збігу і чому вкладені квантифікатори небезпечні?",
    ],
  },
  {
    t: "URL і URLSearchParams",
    ch: "Вбудовані можливості",
    easy: "Адреса в інтернеті — це не просто рядок, а набір частин: протокол, сайт, шлях, параметри. Клас <code>URL</code> розбирає адресу на частини й збирає назад, а <code>URLSearchParams</code> дбає про коректне кодування параметрів.",
    p: [
      "Адреса складається з частин: <code>https://user:pass@example.com:8080/a/b?x=1&amp;y=2#top</code>. Клас <code>URL</code> розбирає її на властивості: <code>protocol</code> (<code>\"https:\"</code>), <code>hostname</code>, <code>port</code>, <code>host</code> (разом із портом), <code>origin</code>, <code>pathname</code>, <code>search</code>, <code>hash</code>, <code>username</code>, <code>password</code>, а також <code>href</code> — повний рядок. Властивості, окрім <code>origin</code>, можна змінювати: <code>url.pathname = \"/new\"</code>, і рядок <code>href</code> оновиться. Клас є і в браузерах, і в Node.js без імпорту.",
      "Конструктор <code>new URL(input, base)</code> приймає абсолютну адресу або відносну разом із базою. Відносні шляхи обчислюються за правилами браузера: <code>new URL(\"../c\", \"https://example.com/a/b/\")</code> дає <code>https://example.com/a/c</code>. Якщо адресу неможливо розібрати, конструктор кидає <code>TypeError: Invalid URL</code>. Наприклад, рядок <code>\"/path\"</code> без бази не є повною адресою. Безпечна перевірка без винятку: <code>URL.canParse(input, base)</code> повертає булеве значення (у сучасних середовищах).",
      "Параметри запиту (те, що після <code>?</code>) зручно обробляти через <code>url.searchParams</code>, об'єкт <code>URLSearchParams</code>. Його методи: <code>get(name)</code> (перше значення або <code>null</code>), <code>getAll(name)</code> (усі), <code>has</code>, <code>set</code> (замінює), <code>append</code> (додає ще одне значення), <code>delete</code>, <code>sort</code>, а також перебір через <code>for...of</code> по парах <code>[ключ, значення]</code>. Усі значення — рядки, числа треба перетворювати самостійно. Зміни в <code>searchParams</code> автоматично оновлюють <code>url.search</code> та <code>href</code>.",
      "Головна користь у <b>кодуванні</b>. Склеювання адреси вручну (<code>\"?q=\" + text</code>) ламається на пробілах, амперсандах, кирилиці та знаках <code>#</code>, які мають спеціальне значення. <code>URLSearchParams</code> кодує все правильно: пробіл стає <code>+</code>, кирилиця перетворюється на відсотковий запис (<code>%D0%BF</code>). Для окремих фрагментів є <code>encodeURIComponent(text)</code> (кодує майже все, використовується для значень) і <code>encodeURI(url)</code> (залишає символи, потрібні для структури адреси). Зворотні функції <code>decodeURIComponent</code> і <code>decodeURI</code> кидають <code>URIError</code> на некоректному записі.",
      "Параметр із кількома значеннями (<code>?tag=a&amp;tag=b</code>) відрізняється від звичайного: <code>get</code> поверне лише перше, а <code>getAll</code> — масив. Щоб передати масив, потрібно викликати <code>append</code> для кожного елемента. Об'єкт <code>URLSearchParams</code> можна створити з рядка (<code>new URLSearchParams(\"a=1&amp;b=2\")</code>), з масиву пар чи з об'єкта (<code>Object.fromEntries</code> дозволяє перетворити його назад на звичайний, але повторювані ключі при цьому втрачаються).",
      "Безпека адрес. Ніколи не будуйте шлях чи запит із даних користувача простим склеюванням: це шлях до вразливостей (підміна параметрів, обхід каталогів). Використовуйте <code>URL</code> та <code>URLSearchParams</code>, а для переадресацій перевіряйте <code>origin</code> результату, щоб не відправити користувача на чужий сайт. Властивості <code>username</code> і <code>password</code> в адресах застаріли й небезпечні; не передавайте секрети в запиті, бо адреси потрапляють у журнали, історію й заголовок Referer.",
      "Корисні дрібниці. Заголовок якоря <code>hash</code> не надсилається на сервер. Для відносного посилання на поточну сторінку в браузері базою служить <code>location.href</code>. У Node для шляхів файлової системи є окремі функції <code>fileURLToPath</code> та <code>pathToFileURL</code> із модуля <code>node:url</code>. А функцію побудови адреси з бази, шляху й параметрів ви напишете в практичному завданні, і вона замінить десятки ручних склейок у вашому коді.",
    ],
    code: [
      String.raw`const url = new URL("https://user:pw@example.com:8080/a/b?x=1&y=2#top");
console.log(url.protocol, url.hostname, url.port, url.host);
console.log(url.origin, url.pathname, url.search, url.hash);
console.log(url.searchParams.get("x"), url.searchParams.get("zzz"));
url.pathname = "/new path";
console.log(url.href);`,
      String.raw`console.log(new URL("../c", "https://example.com/a/b/").href);
console.log(new URL("/root", "https://example.com/a/b/").href);
console.log(new URL("?page=2", "https://example.com/list").href);
console.log(URL.canParse("https://example.com"), URL.canParse("/path"), URL.canParse("/path", "https://x.ua"));`,
      String.raw`const params = new URLSearchParams();
params.set("q", "кіт і пес");
params.append("tag", "a");
params.append("tag", "b");
params.set("page", String(2));
console.log(params.toString());
console.log(params.get("tag"), params.getAll("tag"), params.has("q"));
for (const [key, value] of params) console.log(key, "=", value);
const parsed = new URLSearchParams("a=1&b=2&a=3");
console.log(parsed.getAll("a"), Object.fromEntries(parsed));`,
      String.raw`console.log(encodeURIComponent("a&b=c d/ü"), encodeURI("https://x.ua/a b?q=ж"));
console.log(decodeURIComponent("%D0%BF%D1%80%D0%B8%D0%B2%D1%96%D1%82"));
const naive = "https://x.ua/search?q=" + "a&b#c";
console.log(new URL(naive).searchParams.get("q"));
const safe = new URL("https://x.ua/search");
safe.searchParams.set("q", "a&b#c");
console.log(safe.href, safe.searchParams.get("q"));`,
      String.raw`// аварія: відносна адреса без бази не є повною адресою, і конструктор кидає TypeError
console.log(new URL("https://example.com/ok").pathname);
console.log(new URL("/relative/path"));`,
    ],
    note: "<code>new URL(input, base)</code> розбирає адресу на частини, а неможливий розбір дає <code>TypeError</code> (<code>URL.canParse</code> перевіряє без винятку). Параметри запиту будуйте через <code>URLSearchParams</code>, щоб кодування було правильним, а повторювані ключі читайте через <code>getAll</code>.",
    work: "Клієнти API, роутери, посилання «поділитися» й обробка параметрів фільтрів в адресі потребують надійного розбору та побудови URL. Ручне склеювання адрес — це джерело багів з кодуванням кирилиці й справжніх вразливостей.",
    tasks: [
      "Що повертає searchParams.get для ключа з кількома значеннями і як отримати їх усі?",
      "Чому ручне склеювання адреси з даними користувача небезпечне та як це робить URLSearchParams?",
    ],
  },
  {
    t: "Unicode і TextEncoder",
    ch: "Вбудовані можливості",
    easy: "Символ на екрані — не завжди один «символ» для комп'ютера. Емодзі, літери з акцентом і прапори складаються з кількох частин, а в байтах кирилиця займає по два. Про це треба знати, коли рахуєте довжину тексту.",
    p: [
      "Комп'ютер зберігає текст як числа. Стандарт Unicode присвоює кожному символу число, яке називають <b>кодовою точкою</b> (code point): <code>А</code> — 1040, <code>😀</code> — 128512. Але JavaScript зберігає рядки в кодуванні UTF-16, де одна кодова одиниця має 16 біт, тож символи з великими номерами (емодзі, рідкісні ієрогліфи) займають <b>дві</b> одиниці (сурогатну пару). Властивість <code>length</code> та індексація <code>str[i]</code> працюють саме з кодовими одиницями, тому <code>\"😀\".length</code> дорівнює <code>2</code>.",
      "Щоб працювати з кодовими точками, є <code>str.codePointAt(i)</code> та <code>String.fromCodePoint(n)</code>, а також ітерація: <code>for...of</code>, розгортання <code>[...str]</code> і <code>Array.from(str)</code> проходять по точках, а не по одиницях. Тому <code>[...\"😀\"].length</code> дорівнює <code>1</code>. Функція <code>String.fromCodePoint(-1)</code> кидає <code>RangeError</code>. Запис <code>\\u{1F600}</code> у рядкових літералах задає символ за кодовою точкою.",
      "Та кодові точки теж не дорівнюють тому, що користувач бачить як один символ. <b>Графема</b> (grapheme cluster) — це те, що людина вважає одним символом, і вона може складатися з багатьох точок: літера <code>é</code> може бути однією точкою або парою «e + акцент», емодзі-сім'я <code>👨‍👩‍👧</code> складається з п'яти точок, склеєних невидимим з'єднувачем, а прапор — з двох. Правильно рахувати графеми допомагає <code>Intl.Segmenter</code> з опцією <code>granularity: \"grapheme\"</code>. Саме його треба використовувати для лімітів на «кількість символів» у полі вводу.",
      "Нормалізація. Той самий видимий текст може мати різний склад точок: «é» як <code>\\u00e9</code> (композитна форма) чи як <code>e\\u0301</code> (розкладена). Оператор <code>===</code> вважає такі рядки різними. Метод <code>str.normalize(\"NFC\")</code> приводить текст до однієї форми, і лише після цього можна порівнювати. Нормалізацію застосовують під час пошуку, порівняння імен користувачів, обробки файлових шляхів. Для порівняння без урахування регістру й акцентів підходить <code>localeCompare</code> з опцією <code>sensitivity: \"base\"</code>.",
      "Тепер про байти. Для мережі й файлів текст перетворюють у байти кодуванням <b>UTF-8</b>, де символи займають від одного до чотирьох байтів: латиниця — один, кирилиця — два, більшість ієрогліфів — три, емодзі — чотири. У JavaScript для цього є <code>new TextEncoder().encode(str)</code> (повертає <code>Uint8Array</code>) і <code>new TextDecoder().decode(bytes)</code>. Довжина в байтах <code>encode(str).length</code> відрізняється від <code>str.length</code>, і саме вона має значення для лімітів розміру запитів та полів бази даних.",
      "Помилки в байтах. Якщо декодувати байти, що не є коректним UTF-8, <code>TextDecoder</code> за замовчуванням підставляє символ заміни <code>�</code> (U+FFFD), а з опцією <code>{ fatal: true }</code> кидає <code>TypeError</code>. Це класичний симптом «кракозябрів», коли текст прочитали не в тому кодуванні. Інші кодування (<code>windows-1251</code>, <code>koi8-u</code>) підтримує <code>TextDecoder</code> із відповідною назвою, але <code>TextEncoder</code> завжди працює лише в UTF-8.",
      "Підсумок. Для довжини «на око» рахуйте графеми, для обмеження розміру — байти, для переборів — кодові точки, для порівняння — нормалізуйте. Не розрізайте рядок через <code>slice</code> посеред сурогатної пари чи графеми: можна отримати «половину» емодзі. Для інтерфейсу з емодзі й різними мовами ці знання відрізняють акуратний продукт від такого, у якому «жарт про смайлик» зламав поле вводу.",
    ],
    code: [
      String.raw`const smile = "😀";
console.log(smile.length, [...smile].length, smile.codePointAt(0), smile.charCodeAt(0));
console.log(String.fromCodePoint(128512), "\u{1F600}" === smile, "Дім".length);
console.log([..."a😀б"], "a😀б".slice(0, 2));`,
      String.raw`const composed = "\u00e9";
const decomposed = "e\u0301";
console.log(composed === decomposed, composed.length, decomposed.length);
console.log(composed.normalize("NFC") === decomposed.normalize("NFC"));
console.log("Éa".localeCompare("eA", "uk", { sensitivity: "base" }));`,
      String.raw`const segmenter = new Intl.Segmenter("uk", { granularity: "grapheme" });
const count = (s) => [...segmenter.segment(s)].length;
const family = "👨‍👩‍👧";
console.log(family.length, [...family].length, count(family));
console.log(count("привіт"), count("e\u0301"), count("🇺🇦"), count("a😀"));`,
      String.raw`const bytes = new TextEncoder().encode("Привіт");
console.log(bytes.length, "Привіт".length);
console.log(new TextEncoder().encode("a").length, new TextEncoder().encode("😀").length);
console.log(new TextDecoder().decode(bytes));
console.log(JSON.stringify(new TextDecoder().decode(new Uint8Array([0xff, 0x41]))));
try {
  new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array([0xff]));
} catch (error) {
  console.log(error.name);
}`,
      String.raw`// аварія: кодова точка не може бути від'ємною, і fromCodePoint кидає RangeError
console.log(String.fromCodePoint(1040));
console.log(String.fromCodePoint(-1));`,
    ],
    note: "<code>length</code> рахує кодові одиниці UTF-16, тому емодзі має довжину 2. Для видимих символів беріть <code>Intl.Segmenter</code>, для порівняння <code>normalize(\"NFC\")</code>, для розміру в байтах <code>TextEncoder</code>. Кирилиця в UTF-8 займає по два байти.",
    work: "Ліміти довжини полів, обрізання тексту з емодзі, пошук без урахування акцентів і розрахунок розміру запиту залежать від правильного розуміння Unicode. Неправильна обробка ламає текст і створює баги з «розрізаними» смайликами.",
    tasks: [
      "Чому \"😀\".length дорівнює 2 і чим кодова точка відрізняється від графеми?",
      "Навіщо потрібна нормалізація NFC та чим довжина в байтах відрізняється від length?",
    ],
  },
  {
    t: "Збереження стану: JSON і сховище",
    ch: "Вбудовані можливості",
    easy: "Налаштування, чернетки й вибрані фільтри не повинні зникати після перезавантаження сторінки. Браузерне сховище зберігає їх як рядки, а JSON допомагає перетворити об'єкти на текст і назад, не впавши на порожньому чи зіпсованому записі.",
    p: [
      "Браузер пропонує кілька місць для збереження даних на пристрої користувача. <code>localStorage</code> зберігає пари «ключ-рядок» без обмеження в часі, доки їх не видалять. <code>sessionStorage</code> живе лише до закриття вкладки. Обидва мають однаковий простий інтерфейс: <code>setItem(key, value)</code>, <code>getItem(key)</code> (повертає <code>null</code>, якщо запису немає), <code>removeItem(key)</code>, <code>clear()</code>, а також <code>key(i)</code> і <code>length</code>. Операції синхронні, а обсяг обмежений приблизно п'ятьма мегабайтами на сайт.",
      "Сховище приймає лише <b>рядки</b>: <code>setItem(\"count\", 5)</code> збереже <code>\"5\"</code>, а об'єкт стане <code>\"[object Object]\"</code>. Тому складні дані перед записом перетворюють через <code>JSON.stringify</code>, а після читання розбирають через <code>JSON.parse</code>. Пара функцій <code>saveSettings</code> і <code>loadSettings</code> — найтиповіша обгортка. Усередині варто тримати єдиний ключ із усіма налаштуваннями, а не десяток окремих записів.",
      "Читання потребує захисту. Запису ще може не бути (перший візит), і <code>getItem</code> поверне <code>null</code>. Значення може бути зіпсованим (користувач відредагував дані в DevTools, інша версія програми записала інший формат), тоді <code>JSON.parse</code> кине <code>SyntaxError</code>. Тому читання обгортають у <code>try/catch</code> і повертають <b>значення за замовчуванням</b>. Важливий нюанс: <code>JSON.parse(null)</code> повертає <code>null</code>, а <code>JSON.parse(undefined)</code> кидає помилку, тож явна перевірка на <code>null</code> перед розбором читається чесніше.",
      "Запис теж може зазнати невдачі. Коли обсяг вичерпано, <code>setItem</code> кидає <code>QuotaExceededError</code>, а в режимах приватного перегляду або з вимкненими cookie звернення до сховища інколи кидає <code>SecurityError</code>. Серйозний код обгортає запис у <code>try/catch</code> і мовчки працює без збереження, показуючи користувачу попередження лише за потреби. Не зберігайте в <code>localStorage</code> секрети й токени доступу: будь-який скрипт на сторінці (зокрема з уразливості XSS) може їх прочитати.",
      "Дані мають <b>версії</b>. Коли формат налаштувань змінюється (додали поле, перейменували), старі записи в користувачів лишаються в старому вигляді. Тому до об'єкта додають поле <code>version</code> і при читанні виконують міграцію: якщо версія старіша, перетворюють об'єкт у новий формат. Так нова версія програми не падає на даних, записаних учора. Також варто об'єднувати прочитане зі значеннями за замовчуванням: <code>{ ...defaults, ...saved }</code>, щоб нові поля завжди мали значення.",
      "Для тестів і серверного коду зручно передавати сховище <b>параметром</b>: функція приймає об'єкт з методами <code>getItem</code> і <code>setItem</code>, а в тесті підставляється проста реалізація на <code>Map</code>. Так код не залежить від глобального <code>localStorage</code>, якого немає ні в Node.js, ні у Web Worker. Цей прийом ми застосуємо в практичному завданні, і він працює так само для будь-яких залежностей, про що йтиметься в главі про архітектуру.",
      "Інші сховища: <code>IndexedDB</code> (асинхронна база для великих обсягів і складних структур), Cache API (відповіді мережі), cookies (малі дані, що надсилаються на сервер із кожним запитом), а також події <code>storage</code>, які сповіщають інші вкладки про зміну <code>localStorage</code>. Для невеликих налаштувань достатньо <code>localStorage</code> з JSON, а для офлайн-застосунків із великими даними вже потрібна IndexedDB або бібліотека поверх неї.",
    ],
    code: [
      String.raw`class MemoryStorage {
  #data = new Map();
  getItem(key) { return this.#data.has(key) ? this.#data.get(key) : null; }
  setItem(key, value) { this.#data.set(key, String(value)); }
  removeItem(key) { this.#data.delete(key); }
}
const storage = new MemoryStorage();
storage.setItem("count", 5);
storage.setItem("obj", { a: 1 });
console.log(storage.getItem("count"), typeof storage.getItem("count"), storage.getItem("obj"), storage.getItem("none"));`,
      String.raw`const DEFAULTS = { theme: "light", lang: "uk" };
function saveSettings(storage, settings) {
  storage.setItem("settings", JSON.stringify(settings));
}
function loadSettings(storage) {
  const text = storage.getItem("settings");
  if (text === null) return { ...DEFAULTS };
  try {
    const value = JSON.parse(text);
    return typeof value === "object" && value !== null ? { ...DEFAULTS, ...value } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}
const data = {};
const storage = { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); } };
console.log(loadSettings(storage));
saveSettings(storage, { theme: "dark" });
console.log(loadSettings(storage));
data.settings = "{ зіпсовано";
console.log(loadSettings(storage));`,
      String.raw`function migrate(saved) {
  let state = { version: 1, theme: "light", ...saved };
  if (state.version === 1) {
    state = { ...state, version: 2, fontSize: 14 };      // нове поле у версії 2
  }
  return state;
}
console.log(migrate({ version: 1, theme: "dark" }));
console.log(migrate({ version: 2, theme: "dark", fontSize: 18 }));`,
      String.raw`// фрагмент: справжнє сховище браузера (немає в Node без налаштування)
localStorage.setItem("settings", JSON.stringify({ theme: "dark" }));
const saved = JSON.parse(localStorage.getItem("settings") ?? "{}");
try {
  localStorage.setItem("big", "x".repeat(10_000_000));
} catch (error) {
  console.warn(error.name);   // QuotaExceededError
}
window.addEventListener("storage", (event) => console.log(event.key, event.newValue));`,
      String.raw`// аварія: undefined перетворюється на рядок "undefined", який не є коректним JSON, і parse кидає SyntaxError
const stored = {};
console.log(JSON.parse(null));
const text = stored.settings;
console.log(JSON.parse(text));`,
    ],
    note: "Сховище приймає лише рядки, тому об'єкти пишуть через <code>JSON.stringify</code> і читають через <code>JSON.parse</code> у <code>try/catch</code> із запасними значеннями. Передавайте сховище параметром, зберігайте версію формату й не кладіть туди секрети.",
    work: "Теми оформлення, чернетки, вибрані фільтри та інші дрібні налаштування зберігаються на пристрої користувача. Надійне читання зі значеннями за замовчуванням і міграціями дозволяє оновлювати застосунок, не ламаючи даних, збережених його попередніми версіями.",
    tasks: [
      "Чому об'єкт перед записом у localStorage треба перетворювати на JSON і що поверне getItem для відсутнього ключа?",
      "Навіщо в читанні налаштувань потрібні try/catch, значення за замовчуванням і версія формату?",
    ],
  },
  {
    t: "Intl: PluralRules, ListFormat і RelativeTimeFormat",
    ch: "Вбудовані можливості",
    adv: true,
    easy: "Ще три помічники з <code>Intl</code> розв'язують «тонкі» мовні задачі: правильна форма слова після числа («1 день, 2 дні, 5 днів»), перелік із «і» та відносні дати («завтра», «5 днів тому»).",
    p: [
      "Українська мова має складні правила узгодження числівників: «1 день», «2 дні», «5 днів», «21 день», «22 дні», «11 днів». Спроба закласти їх у <code>if</code> «на око» ламається на винятках. Клас <code>Intl.PluralRules</code> знає ці правила для будь-якої мови: <code>new Intl.PluralRules(\"uk\").select(n)</code> повертає категорію множини: <code>\"one\"</code>, <code>\"few\"</code>, <code>\"many\"</code>, <code>\"other\"</code> (а в деяких мов ще <code>\"zero\"</code>, <code>\"two\"</code>). Для української <code>1</code> та <code>21</code> дають <code>one</code>, <code>2–4</code> та <code>22–24</code> — <code>few</code>, <code>0</code>, <code>5–20</code> — <code>many</code>, а дробові числа — <code>other</code>.",
      "Щоб підібрати слово, зберіть словник форм і виберіть за категорією: <code>{ one: \"день\", few: \"дні\", many: \"днів\", other: \"дня\" }[category]</code>. Так само працюють форми «файл, файли, файлів» чи «повідомлення». У англійській категорій лише дві (<code>one</code> та <code>other</code>), тому правила для різних мов принципово різні, і саме для цього існує <code>PluralRules</code>. Опція <code>type: \"ordinal\"</code> працює з порядковими числівниками (1-й, 2-й, 3-й), що важливо для англійської.",
      "<code>Intl.ListFormat</code> з'єднує перелік у природну фразу: <code>new Intl.ListFormat(\"uk\", { style: \"long\", type: \"conjunction\" }).format([\"яблука\", \"груші\", \"сливи\"])</code> дає «яблука, груші і сливи». Параметр <code>type</code> вибирає «і» (<code>conjunction</code>), «або» (<code>disjunction</code>) чи просте перерахування без сполучника (<code>unit</code>). Для англійської цей клас сам додасть оксфордську кому та слово «and». Це вирішує задачу, яку складно розв'язати вручну без помилок у чужій мові.",
      "<code>Intl.RelativeTimeFormat</code> видає відносний час: <code>new Intl.RelativeTimeFormat(\"uk\", { numeric: \"auto\" }).format(-1, \"day\")</code> дає «учора», а <code>format(3, \"day\")</code> дає «через 3 дні». Перший аргумент — число (від'ємне означає минуле), другий — одиниця: <code>second</code>, <code>minute</code>, <code>hour</code>, <code>day</code>, <code>week</code>, <code>month</code>, <code>year</code>. Опція <code>numeric: \"always\"</code> завжди використовує число («1 день тому»), а <code>\"auto\"</code> там, де мова має особливе слово (учора, сьогодні, завтра), підставляє його.",
      "Типове використання — підписи на кшталт «5 хвилин тому». Спершу обчислюють різницю в секундах, вибирають найбільшу підходящу одиницю (секунди, хвилини, години, дні) і передають її форматеру. Для цього потрібні власні порогові значення, бо <code>Intl</code> лише форматує, а не вибирає одиницю. Також пам'ятайте, що текст залежить від ICU: невеликі розбіжності між середовищами можливі, тому в тестах порівнюйте не з літералами, а з результатом того ж <code>Intl</code> або нормалізуйте.",
      "Загальні поради. Створюйте форматери один раз і зберігайте (їх створення дорожче за виклик). Мову беріть із налаштувань користувача, а не вшивайте. Перевіряйте код мови: неправильний параметр <code>type</code> чи недійсний тег кидає <code>RangeError</code>. А якщо хочете описати назву країни, мови чи валюти кодом, існує ще <code>Intl.DisplayNames</code>. Усі ці класи — це вбудований словник правил, який економить сотні рядків коду й тисячі помилок.",
    ],
    code: [
      String.raw`const rules = new Intl.PluralRules("uk");
const forms = { one: "день", few: "дні", many: "днів", other: "дня" };
for (const n of [0, 1, 2, 4, 5, 11, 21, 22, 25, 101, 1.5]) {
  console.log(n, rules.select(n), forms[rules.select(n)]);
}
console.log(new Intl.PluralRules("en").select(1), new Intl.PluralRules("en").select(2));`,
      String.raw`const ordinal = new Intl.PluralRules("en", { type: "ordinal" });
const suffix = { one: "st", two: "nd", few: "rd", other: "th" };
console.log([1, 2, 3, 4, 11, 21, 22, 103].map((n) => n + suffix[ordinal.select(n)]).join(" "));`,
      String.raw`const list = ["яблука", "груші", "сливи"];
console.log(new Intl.ListFormat("uk", { style: "long", type: "conjunction" }).format(list));
console.log(new Intl.ListFormat("uk", { type: "disjunction" }).format(list));
console.log(new Intl.ListFormat("en", { type: "conjunction" }).format(["a", "b", "c"]));
console.log(new Intl.ListFormat("en").format(["a"]), JSON.stringify(new Intl.ListFormat("en").format([])));`,
      String.raw`const rtf = new Intl.RelativeTimeFormat("uk", { numeric: "auto" });
console.log(rtf.format(-1, "day"), rtf.format(0, "day"), rtf.format(1, "day"));
console.log(rtf.format(3, "day"), rtf.format(-5, "day"), rtf.format(2, "month"));
const always = new Intl.RelativeTimeFormat("uk", { numeric: "always" });
console.log(always.format(-1, "day"), always.format(1, "hour"));`,
      String.raw`// аварія: тип правил множини може бути лише cardinal або ordinal, і недійсне значення викликає RangeError
const ok = new Intl.PluralRules("uk", { type: "cardinal" });
console.log(ok.select(3));
const bad = new Intl.PluralRules("uk", { type: "рядок" });
console.log(bad.select(3));`,
    ],
    note: "<code>Intl.PluralRules(\"uk\").select(n)</code> повертає категорію (<code>one</code>, <code>few</code>, <code>many</code>, <code>other</code>), з якої обирають форму слова. <code>ListFormat</code> з'єднує перелік, <code>RelativeTimeFormat</code> дає «учора» й «через 3 дні». Створюйте форматери один раз.",
    work: "«5 повідомлень», «1 файл», «додано 3 хвилини тому» та переліки в інтерфейсі виглядають природно лише з правильною мовною граматикою. Для українського ринку правильні форми слів — ознака якісного продукту.",
    tasks: [
      "Які категорії множини повертає PluralRules для української та як з них отримати правильну форму слова?",
      "Чим numeric: \"auto\" відрізняється від \"always\" у RelativeTimeFormat і навіщо ListFormat?",
    ],
  },
  {
    t: "Temporal: майбутнє роботи з датами",
    ch: "Вбудовані можливості",
    adv: true,
    easy: "<code>Temporal</code> — новий вбудований API дат, створений, щоб виправити болючі місця <code>Date</code>: нумерацію місяців з нуля, мутацію об'єктів, нечіткі часові пояси. Його підтримка ще розповсюджується, тож варто знати ідею й вміти перевірити наявність.",
    p: [
      "Об'єкт <code>Date</code> створено 1995 року за зразком Java, і його проблеми відомі: місяці з нуля, об'єкти змінні (методи <code>set...</code> міняють дату на місці), єдиний часовий пояс «локальний або UTC», слабка підтримка календарів, неочевидний розбір рядків. Щоб виправити це, у стандарт додається новий простір імен <code>Temporal</code>. Він складається з кількох типів, кожен для свого сценарію, замість «універсального» <code>Date</code>.",
      "Основні типи. <code>Temporal.Instant</code> — точний момент часу без поясів. <code>Temporal.ZonedDateTime</code> — момент разом із часовим поясом і календарем, готовий до роботи з літнім часом. <code>Temporal.PlainDate</code> — дата без часу й поясу («15 березня 2024»), ідеальна для днів народження. <code>Temporal.PlainTime</code>, <code>PlainDateTime</code>, <code>PlainYearMonth</code> та <code>PlainMonthDay</code> — частини дати. <code>Temporal.Duration</code> — тривалість («2 дні 3 години»). Розподіл змушує вас думати, що саме ви зберігаєте.",
      "Усі об'єкти <b>незмінні</b>: методи на кшталт <code>add</code>, <code>subtract</code>, <code>with</code> повертають нові об'єкти, а старі не чіпають. Місяці нумеруються з <b>одиниці</b>, тож <code>Temporal.PlainDate.from(\"2024-03-15\").month</code> дорівнює <code>3</code>. Арифметика проста й безпечна: <code>date.add({ days: 30 })</code>, <code>date.until(other)</code> повертає <code>Duration</code>, а порівняння виконує статичний <code>Temporal.PlainDate.compare(a, b)</code>. Недійсні дати відхиляються явно (<code>RangeError</code>) замість мовчазного «переливання».",
      "Часові пояси опрацьовано явно: <code>Temporal.Now.zonedDateTimeISO(\"Europe/Kyiv\")</code> дає зараз у потрібному поясі, а <code>zdt.withTimeZone(\"Asia/Tokyo\")</code> переносить той самий момент в інший пояс. Додавання «1 день» до <code>ZonedDateTime</code> через перехід на літній час зберігає той самий час на годиннику, а не «24 години», що часто є бажаною поведінкою. Для різних календарів (єврейський, японський) є властивість <code>calendar</code>, чого <code>Date</code> не вміє зовсім.",
      "Стан на сьогодні: Temporal входить у стандарт ECMAScript, і підтримка поступово з'являється в рушіях (Firefox і нові версії Chrome вже реалізують його, у Node.js та Safari наявність залежить від версії). Тому перш ніж користуватися, перевіряйте <code>typeof Temporal !== \"undefined\"</code> або беріть поліфіл (<code>@js-temporal/polyfill</code>). Для нових проєктів з обмеженим набором браузерів він уже придатний, а для широкої аудиторії поки використовують поліфіл або перевірені бібліотеки (date-fns, Luxon, Day.js).",
      "Що робити сьогодні? Пишіть код так, щоб його легко було мігрувати: тримайте дати як ISO-рядки чи мілісекунди, ховайте роботу з датами за кількома функціями (<code>addDays</code>, <code>diffInDays</code>, <code>startOfMonth</code>), не розкидайте <code>new Date(...)</code> по всьому коду. Тоді заміна реалізації на Temporal стане локальною зміною в одному модулі. А розуміння цих понять (момент, цивільна дата, тривалість, пояс) корисне вже зараз: воно допомагає правильно користуватися й старим <code>Date</code>.",
    ],
    code: [
      String.raw`const has = typeof Temporal !== "undefined";
console.log(has ? "Temporal доступний у цьому середовищі" : "Temporal недоступний: потрібен поліфіл або запасний код");
const now = has ? Temporal.Now.instant().toString() : new Date().toISOString();
console.log(typeof now);`,
      String.raw`// фрагмент: Temporal (потрібне середовище з підтримкою або поліфіл)
const date = Temporal.PlainDate.from("2024-03-15");
console.log(date.month);                              // 3, місяці з одиниці
console.log(date.add({ days: 30 }).toString());       // 2024-04-14, оригінал не змінено
console.log(date.until(Temporal.PlainDate.from("2024-12-31")).days);
console.log(Temporal.PlainDate.compare(date, Temporal.PlainDate.from("2025-01-01")));`,
      String.raw`// фрагмент: пояси й тривалості в Temporal
const kyiv = Temporal.ZonedDateTime.from("2024-03-30T12:00:00[Europe/Kyiv]");
console.log(kyiv.add({ days: 1 }).toString());        // той самий час на годиннику після переходу на літній
console.log(kyiv.withTimeZone("Asia/Tokyo").toString());
const d = Temporal.Duration.from({ hours: 26 });
console.log(d.round({ largestUnit: "day" }).toString());`,
      String.raw`// запасний код: ті самі операції на Date в UTC, схований за невеликими функціями
const addDays = (iso, n) => {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const diffInDays = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
console.log(addDays("2024-03-15", 30), addDays("2024-02-28", 2));
console.log(diffInDays("2024-03-15", "2024-12-31"));`,
      String.raw`// аварія: недійсна дата в Date не відхиляється одразу, але форматування такого значення кидає RangeError
const broken = new Date("не дата");
console.log(Number.isNaN(broken.getTime()));
console.log(new Intl.DateTimeFormat("uk").format(broken));`,
    ],
    note: "<code>Temporal</code> виправляє <code>Date</code>: типи <code>PlainDate</code>, <code>ZonedDateTime</code>, <code>Duration</code>, незмінні об'єкти й місяці з одиниці. Підтримка ще розповсюджується, тому перевіряйте <code>typeof Temporal</code> або беріть поліфіл і ховайте роботу з датами за функціями.",
    work: "Календарі, бронювання, розклади й планувальники страждають від багів Date із поясами й літнім часом. Temporal і перевірені бібліотеки (Luxon, date-fns) роблять такі системи надійнішими, а міграція простіша, якщо логіку дат ізольовано.",
    tasks: [
      "Які головні вади Date виправляє Temporal і чим PlainDate відрізняється від ZonedDateTime?",
      "Як безпечно користуватися Temporal, поки він підтримується не всюди?",
    ],
  },
  {
    t: "Часові пояси й підводні камені Date",
    ch: "Вбудовані можливості",
    adv: true,
    easy: "Найковарніші помилки з датами виникають не в коді, а на межі: той самий рядок у різних країнах означає різні моменти, а двічі на рік година «зникає» або повторюється. Знання кількох правил рятує від цього.",
    p: [
      "Рядок дати розбирається по-різному залежно від формату. Дата <b>без часу</b> у форматі ISO (<code>\"2024-03-15\"</code>) інтерпретується як <b>UTC</b> опівночі. А дата <b>з часом без пояса</b> (<code>\"2024-03-15T00:00\"</code>) — як <b>локальний</b> час комп'ютера. Через це два на вигляд схожі рядки дають моменти, що відрізняються на величину зсуву пояса. У західних поясах <code>new Date(\"2024-03-15\")</code> у локальному відображенні показує 14 березня, і саме так з'являються баги «день народження зсунувся на добу».",
      "Другий класичний підводний камінь — відмінність UTC- та локальних методів. <code>getDate()</code> і <code>getHours()</code> повертають локальні значення, а <code>getUTCDate()</code> та <code>getUTCHours()</code> — за Гринвічем. Змішування цих методів у одному коді призводить до помилок на межі доби. Правило: обирайте одну систему для кожного сценарію. Розрахунки й збереження ведіть в UTC (<code>toISOString</code>, <code>getUTC...</code>), а перетворення на локальний час залишайте лише для показу.",
      "<b>Літній час</b> (DST) ламає припущення про тривалість доби. У день переходу вперед година пропускається (о 02:00 стає 03:00), а в день переходу назад година повторюється. Тому доба не завжди дорівнює 24 годинам, а додавання <code>24 * 60 * 60 * 1000</code> мілісекунд не завжди дає «ту саму годину завтра». Якщо вам потрібен «наступний день о тій самій годині», додавайте один день через календарні методи (<code>setDate(getDate() + 1)</code>), а не через мілісекунди. Для чистої цивільної арифметики працюйте в UTC, де DST немає.",
      "Різниця між локальним часом і UTC дає <code>date.getTimezoneOffset()</code>: кількість хвилин, <b>на які UTC відрізняється від локального</b> (для Києва взимку це <code>-120</code>, бо UTC відстає на дві години). Знак може збивати з пантелику. Для показу часу в довільному поясі не множте зсуви вручну, а використовуйте <code>Intl.DateTimeFormat</code> з опцією <code>timeZone</code>, яка знає історію правил переходів. Назви поясів беруть із бази IANA: <code>\"Europe/Kyiv\"</code>, <code>\"America/New_York\"</code>; недійсна назва викликає <code>RangeError</code>.",
      "Переливання дат. Присвоєння неіснуючих значень не відхиляється, а «переливається»: <code>new Date(2024, 0, 31)</code> з наступним <code>setMonth(1)</code> дає не 31 лютого, а 2 березня. Рядки на кшталт <code>\"2024-02-30\"</code> ведуть себе по-різному: V8 (Chrome, Node.js) перекладає їх у березень, а інші рушії повертають <code>Invalid Date</code>. Тому якщо вам важлива коректність, перевіряйте дату після створення, порівнюючи компоненти з вихідними, або використовуйте строгі бібліотеки й Temporal.",
      "Кількість днів у місяці зручно визначати хитрістю: нульовий день наступного місяця — це останній день поточного. <code>new Date(Date.UTC(year, month, 0)).getUTCDate()</code> дає кількість днів у місяці, де <code>month</code> нумерується з одиниці (бо нульовий день береться в наступного нуль-базованого місяця). Високосні роки обробляються автоматично. Саме цю техніку ви використаєте в практичному завданні, як і перевірку правильності місяця.",
      "Підсумкова пам'ятка. Зберігайте час в UTC. Для дат без часу беріть рядок <code>YYYY-MM-DD</code>. Не додавайте мілісекунди замість днів у локальному часі. Показуйте час через <code>Intl</code> із явним поясом. Не покладайтеся на розбір нестандартних рядків. Тестуйте код у різних поясах (змінна середовища <code>TZ</code> у Node.js дозволяє запустити тести, наприклад, як у Токіо чи Лос-Анджелесі) і на межах переходу літнього часу: більшість багів з'являється саме там.",
    ],
    code: [
      String.raw`const dateOnly = new Date("2024-03-15");
const dateTime = new Date("2024-03-15T00:00");
console.log(dateOnly.toISOString());                        // завжди UTC опівночі
console.log(dateTime.getTime() - dateOnly.getTime() === dateTime.getTimezoneOffset() * 60_000);
console.log(Date.UTC(2024, 2, 15) === dateOnly.getTime());`,
      String.raw`const fmt = (date, timeZone) =>
  new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23", month: "short", day: "numeric" }).format(date);
// перехід на літній час у Нью-Йорку 10 березня 2024: 02:00 стає 03:00
console.log(fmt(new Date("2024-03-10T06:59:00Z"), "America/New_York"));
console.log(fmt(new Date("2024-03-10T07:00:00Z"), "America/New_York"));
console.log(fmt(new Date("2024-03-10T07:00:00Z"), "Asia/Tokyo"));`,
      String.raw`const d = new Date(Date.UTC(2024, 0, 31));
d.setUTCMonth(1);                       // лютий не має 31 дня
console.log(d.toISOString().slice(0, 10));
const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();
console.log(daysInMonth(2024, 2), daysInMonth(2023, 2), daysInMonth(2024, 4), daysInMonth(2024, 12));
console.log(new Date(Date.UTC(2024, 1, 29)).getUTCDate() === 29, new Date(Date.UTC(2023, 1, 29)).getUTCMonth());`,
      String.raw`function isRealDate(y, m, d) {
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}
console.log(isRealDate(2024, 2, 29), isRealDate(2023, 2, 29), isRealDate(2024, 4, 31), isRealDate(2024, 12, 31));
console.log(["2024-02-30"].map((s) => (Number.isNaN(Date.parse(s)) ? "Invalid Date" : "інтерпретовано як " + new Date(s).toISOString().slice(0, 10))));`,
      String.raw`// аварія: такої назви часового поясу в базі IANA немає, і форматер кидає RangeError
const known = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Kyiv" });
console.log(known.resolvedOptions().timeZone);
const unknown = new Intl.DateTimeFormat("en-US", { timeZone: "Mars/Phobos" });
console.log(unknown.format(new Date()));`,
    ],
    note: "ISO-дата без часу це UTC, а з часом без поясу локальний час. Тримайте розрахунки в UTC, показ робіть через <code>Intl</code> з <code>timeZone</code>, а день переходу на літній час не має 24 години. Зайві значення «переливаються», тому перевіряйте дату після створення.",
    work: "Календарі, нагадування, звіти за період і розклади з міжнародною аудиторією ламаються саме на межах поясів і літнього часу. Тестування в різних поясах і перехід на UTC-логіку знімає більшість таких багів.",
    tasks: [
      "Чому new Date(\"2024-03-15\") і new Date(\"2024-03-15T00:00\") можуть означати різні моменти?",
      "Як отримати кількість днів у місяці через нульовий день і чому додавання 24 годин у мілісекундах не завжди дає «завтра о тій самій годині»?",
    ],
  },
];
