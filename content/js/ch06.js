export const LESSONS_06 = [
  {
    t: "Error і throw",
    ch: "Помилки",
    easy: "Помилка в JavaScript — це особливий об'єкт, який описує, що пішло не так. Оператор <code>throw</code> «кидає» його, і програма негайно припиняє звичайну роботу та шукає того, хто готовий помилку обробити.",
    p: [
      "Коли код не може виконати завдання (на вході сміття, файла немає, мережа впала), він має повідомити про це, а не мовчки повертати дивний результат. Для цього створюють об'єкт помилки й «кидають» його: <code>throw new Error(\"Не вдалося прочитати файл\");</code>. Виконання поточної функції зупиняється, помилка піднімається по ланцюжку викликів вгору до першого блока <code>catch</code>. Якщо жодного не знайдено, програма зупиняється з повідомленням у консолі або, у Node.js, із ненульовим кодом завершення.",
      "Об'єкт <code>Error</code> має три важливі властивості. <code>message</code> — текст, який ви передали конструктору. <code>name</code> — назва виду помилки (<code>\"Error\"</code>, <code>\"TypeError\"</code> тощо). <code>stack</code> — рядок зі <b>стеком викликів</b>: перелік функцій, через які програма дійшла до місця помилки. Саме стек дозволяє швидко знайти рядок із проблемою, про що ми говорили в першій главі. Тому важливо кидати саме об'єкти <code>Error</code>, а не рядки: <code>throw \"щось не так\"</code> технічно можливий, але лишає вас без стека й без типу.",
      "Мова має кілька вбудованих видів помилок, і їх варто обирати за змістом. <code>TypeError</code> означає, що значення має не той тип (виклик не функції, читання поля в <code>undefined</code>). <code>RangeError</code> означає, що значення виходить за допустимі межі (від'ємна довжина масиву, надто глибока рекурсія). <code>ReferenceError</code> каже, що змінної не існує. <code>SyntaxError</code> виникає при синтаксичній помилці в коді чи в <code>JSON.parse</code>. Для власної перевірки вхідних даних зазвичай використовують <code>TypeError</code> (не той тип) і <code>RangeError</code> (не той діапазон) або власні класи, про які ми поговоримо далі.",
      "Якість повідомлення важлива. Добре повідомлення відповідає на питання «що сталося, з яким значенням і чого очікували»: <code>\"Вік має бути цілим числом від 0 до 150, отримано: -5\"</code>. Погане повідомлення на кшталт <code>\"Помилка\"</code> змушує шукати причину годинами. Не вставляйте у повідомлення секрети (паролі, токени): вони потраплять у журнали. Текст пишіть для розробника, а інтерфейс користувача показує окремі, дружні повідомлення.",
      "Помилки — це про <b>виняткові</b> ситуації, а не про звичайний хід програми. Не використовуйте <code>throw</code> для керування потоком, наприклад щоб вийти з вкладених циклів: це повільніше й заплутує читача. Якщо відсутність результату — нормальна ситуація (пошук, який міг нічого не знайти), краще повернути <code>null</code> чи <code>undefined</code>. А коли функція не може виконати свій контракт (неправильні аргументи, зламаний стан), кидайте помилку: так баг стає помітним одразу, а не десь далі у вигляді таємничого <code>NaN</code>.",
      "Корисний прийом — «охоронні перевірки» на початку функції (guard clauses): спершу перевіряємо вхідні дані й кидаємо помилку, якщо вони неправильні, а потім спокійно виконуємо основну логіку. Це зменшує вкладеність і робить контракт функції очевидним: читач бачить усі умови одразу. Не перевіряйте все підряд: на межах системи (дані користувача, API, файли) перевірки обов'язкові, а в середині коду, де ви довіряєте власним функціям, вони можуть лише заважати.",
      "Нарешті, пам'ятайте, що <code>throw</code> перериває функцію негайно: наступні рядки не виконаються, а <code>return</code> після <code>throw</code> не потрібен. Помилки можна створювати, не кидаючи: <code>const error = new Error(\"...\");</code> просто створює об'єкт зі стеком у цьому місці. Це стане в нагоді, коли ви збираєте помилки в масив чи передаєте далі. А кинути можна що завгодно, навіть число чи об'єкт, але стандартна й безпечна практика — завжди кидати екземпляри <code>Error</code> або його нащадків.",
    ],
    code: [
      String.raw`const error = new Error("Щось пішло не так");
console.log(error.name, error.message);
console.log(error instanceof Error, typeof error.stack);
console.log(String(error));
console.log(error.stack.split("\n")[0]);`,
      String.raw`const attempts = [
  () => null.field,
  () => new Array(-1),
  () => undefinedVariable,
  () => JSON.parse("{ погано }"),
  () => (5)(),
];
for (const attempt of attempts) {
  try {
    attempt();
  } catch (e) {
    console.log(e.name);
  }
}`,
      String.raw`function setAge(age) {
  if (typeof age !== "number") throw new TypeError("Вік має бути числом, отримано: " + typeof age);
  if (!Number.isInteger(age) || age < 0 || age > 150) {
    throw new RangeError("Вік має бути цілим від 0 до 150, отримано: " + age);
  }
  return age;
}
for (const input of [17, "17", -5]) {
  try {
    console.log("ок:", setAge(input));
  } catch (e) {
    console.log(e.name + ": " + e.message);
  }
}`,
      String.raw`try {
  throw "просто рядок";
} catch (e) {
  console.log(typeof e, e instanceof Error, e.stack);
}
const lazy = new Error("створено, але не кинуто");
console.log("програма працює далі", lazy.message);`,
      String.raw`// аварія: помилку кинуто, але ніхто її не перехопив, тож програма завершується з повідомленням і стеком
function checkout(cart) {
  if (cart.length === 0) throw new Error("Кошик порожній");
  return cart.length;
}
console.log(checkout(["хліб"]));
console.log(checkout([]));
console.log("Сюди програма не дійде");`,
    ],
    note: "Кидайте екземпляри <code>Error</code>, а не рядки: так ви отримаєте <code>stack</code> і тип. Обирайте вид помилки за змістом (<code>TypeError</code>, <code>RangeError</code>), а повідомлення пишіть так, щоб було видно значення й очікування. Не керуйте потоком через throw.",
    work: "Валідація аргументів і чіткі помилки на межах системи перетворюють «чомусь не працює» на «поле age має бути від 0 до 150». Це заощаджує години налагодження вам і колегам та полегшує підтримку.",
    tasks: [
      "Чому краще кидати new Error(...), а не рядок, і що міститься у властивості stack?",
      "Коли доречно кинути TypeError, а коли RangeError, і чому throw не слід використовувати для керування потоком?",
    ],
  },
  {
    t: "try, catch, finally",
    ch: "Помилки",
    easy: "<code>try</code> — це «спробуй», <code>catch</code> — «якщо не вийшло, зроби ось що», а <code>finally</code> — «а це виконай у будь-якому разі». Разом вони дозволяють програмі пережити помилку й акуратно прибрати за собою.",
    p: [
      "Конструкція <code>try { ... } catch (error) { ... }</code> виконує код у блоці <code>try</code>. Якщо там виникла помилка (або виконано <code>throw</code>), виконання негайно переходить у <code>catch</code>, а помилка стає змінною <code>error</code>. Рядки <code>try</code> після місця помилки не виконуються. Якщо помилки не було, блок <code>catch</code> пропускається. Змінну можна опустити, якщо вона не потрібна: <code>catch { ... }</code> (необов'язкова прив'язка, доступна в сучасних середовищах).",
      "Блок <code>finally</code> виконується <b>завжди</b>: і після успішного <code>try</code>, і після <code>catch</code>, і навіть коли в <code>try</code> спрацював <code>return</code>, <code>break</code> чи <code>throw</code>. Його призначення — прибирання: закрити файл, розблокувати ресурс, вимкнути індикатор завантаження. Важливий підступ: якщо у <code>finally</code> стоїть власний <code>return</code>, він <b>перекриває</b> результат <code>try</code> та приховує помилку. Тому в <code>finally</code> не повертають значень і не кидають нових помилок без потреби.",
      "Найголовніше правило обробки: перехоплюйте помилку лише там, де знаєте, що з нею робити. Порожній <code>catch {}</code>, який «ковтає» помилку мовчки, — одна з найгірших практик: програма продовжує працювати зі зламаним станом, і причину потім неможливо знайти. Якщо ви не можете виправити ситуацію, залиште помилку летіти вгору або запишіть її в журнал і <b>перекиньте</b> далі: <code>catch (e) { log(e); throw e; }</code>.",
      "Помилки бувають різних типів, а реагувати на них треба по-різному. Усередині <code>catch</code> перевіряйте вид через <code>instanceof</code> або <code>error.name</code>: <code>if (error instanceof SyntaxError) { ... } else { throw error; }</code>. Так ви обробляєте тільки очікувані проблеми (наприклад, некоректний JSON), а все несподіване, як-от <code>TypeError</code> від власної помилки в коді, пропускаєте далі, щоб його помітили. Це називають вибірковим перехопленням.",
      "Блок <code>try</code> має охоплювати якомога менше коду: лише ті рядки, які справді можуть кинути очікувану помилку. Якщо обгорнути цілу функцію, ви можете випадково перехопити баги, які не стосуються вашої обробки. Типовий приклад — розбір JSON: <code>try { data = JSON.parse(text); } catch { data = defaults; }</code>. Тут доречно перехопити будь-який збій розбору й підставити значення за замовчуванням.",
      "Змінні, оголошені всередині <code>try</code> через <code>let</code> чи <code>const</code>, живуть лише в цьому блоці, тому, щоб скористатися результатом пізніше, змінну оголошують перед <code>try</code>: <code>let data; try { data = ...; } catch { ... }</code>. Блоки можуть бути вкладеними, а <code>catch</code> може сам кинути помилку (наприклад, обгорнути її в іншу з додатковим контекстом). У строгому режимі й у модулях вся ця поведінка однакова.",
      "Не плутайте <code>try/catch</code> із перевіркою умов. Якщо ви можете легко перевірити заздалегідь (<code>if (index &lt; arr.length)</code>), перевірка зрозуміліша й швидша. <code>try/catch</code> створений для ситуацій, які ви не можете передбачити повністю: невалідні дані з мережі, помилки файлової системи, сторонні бібліотеки. І пам'ятайте, що він ловить лише <b>синхронні</b> помилки в межах свого блока, а про асинхронні ми поговоримо окремо.",
    ],
    code: [
      String.raw`function parse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log("не вдалося розібрати:", error.name);
    return null;
  }
}
console.log(parse('{"a":1}'), parse("{ a: }"));`,
      String.raw`function demo() {
  try {
    console.log("try");
    return "значення з try";
  } finally {
    console.log("finally виконається завжди");
  }
}
console.log(demo());
function override() {
  try {
    return "з try";
  } finally {
    return "finally перекриває";
  }
}
console.log(override());`,
      String.raw`function load(text) {
  try {
    return JSON.parse(text).user.name;
  } catch (error) {
    if (error instanceof SyntaxError) return "некоректний JSON";
    throw error;                       // несподівану помилку пропускаємо
  }
}
console.log(load('{"user":{"name":"Оля"}}'));
console.log(load("{ погано"));
try {
  load('{"x":1}');
} catch (error) {
  console.log("пропущено вище:", error.name);
}`,
      String.raw`let loading = true;
let data;
try {
  data = JSON.parse("[1, 2, 3]");
} catch {
  data = [];
} finally {
  loading = false;
}
console.log(data, loading);`,
      String.raw`// аварія: catch лише записує повідомлення й знову кидає помилку, а зовні її ніхто не обробляє
function readConfig(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.log("лог:", error.name);
    throw error;
  }
}
console.log(readConfig('{"ok":true}'));
console.log(readConfig("не json"));`,
    ],
    note: "<code>finally</code> виконується завжди, але <code>return</code> у ньому перекриває результат <code>try</code>. Не залишайте порожній <code>catch</code>: обробіть, залогуйте й перекиньте. Перехоплюйте лише очікувані види помилок через <code>instanceof</code>.",
    work: "Розбір JSON, читання файлів, звернення до мережі й сторонні бібліотеки можуть падати, тож try/catch оточує такі місця. Блок finally гарантує, що спінер завантаження вимкнеться, а з'єднання з базою закриється навіть після збою.",
    tasks: [
      "Коли виконується finally і що станеться, якщо в ньому стоїть return?",
      "Чому порожній catch вважається поганою практикою і як перехопити лише очікуваний вид помилки?",
    ],
  },
  {
    t: "Власні помилки і cause",
    ch: "Помилки",
    easy: "Власний клас помилки дає їй точну назву й додаткові поля: який саме рядок формі не пройшов перевірку чи якого ресурсу не знайдено. Поле <code>cause</code> зберігає початкову причину, щоб нічого не загубилося при обгортанні.",
    p: [
      "Вбудованих видів помилок мало для реальних застосунків: «некоректний email» і «недостатньо коштів» обидва були б просто <code>Error</code>, і розрізнити їх можна було б лише за текстом. Тому створюють власні класи, які успадковують від <code>Error</code>: <code>class ValidationError extends Error { constructor(field, message) { super(message); this.name = \"ValidationError\"; this.field = field; } }</code>. Тепер у блоці <code>catch</code> зручно перевіряти <code>error instanceof ValidationError</code> і читати <code>error.field</code> для показу під потрібним полем.",
      "У конструкторі треба викликати <code>super(message)</code> першим, інакше <code>this</code> недоступний (як і в усіх похідних класах). Ім'я <code>this.name</code> задають, щоб у стеку й повідомленнях було видно реальну назву замість «Error». Можна також задати <code>this.name = new.target.name</code> або <code>this.constructor.name</code>, щоб підкласи мали правильне ім'я автоматично. Власні поля помилки (код, поле форми, HTTP-статус) роблять її інформативною для обробника.",
      "Корисно будувати невелику ієрархію: базова помилка застосунку, від неї нащадки за категоріями (<code>ValidationError</code>, <code>NotFoundError</code>, <code>PermissionError</code>). Тоді код верхнього рівня може перехопити лише <code>AppError</code>, а решту (справжні баги) пропустити. Не створюйте надто багато класів: достатньо тих, на які ви реально по-різному реагуєте. Для частини випадків вистачає поля <code>code</code> зі строковою константою (<code>\"E_NOT_FOUND\"</code>).",
      "Коли помилка виникає глибоко (наприклад, збій читання файлу) й піднімається через кілька рівнів, на кожному рівні додається контекст: «не вдалося завантажити профіль», «не вдалося відкрити налаштування». Якщо створювати нову помилку й просто втратити стару, пропаде найцінніше: справжня причина. Для цього існує параметр <code>cause</code>: <code>new Error(\"Не вдалося завантажити профіль\", { cause: original })</code>. Початкова помилка доступна як <code>error.cause</code>, зі своїм стеком, і ланцюжок причин можна розмотувати.",
      "Сучасні середовища друкують <code>cause</code> разом із помилкою в консолі, тож при необробленій помилці ви бачите весь ланцюжок. Для власних класів передавайте <code>cause</code> у <code>super(message, { cause })</code>. Це важливо в журналах: «Помилка збереження замовлення, причина: помилка з'єднання з базою, причина: тайм-аут» набагато інформативніше за одну фразу без історії.",
      "Є нюанс із серіалізацією. Властивості <code>message</code> і <code>stack</code> у помилки неперелічувані, тому <code>JSON.stringify(error)</code> повертає <code>{}</code>, а власні поля (<code>field</code>) потраплять у результат. Щоб логувати чи відправляти помилку на сервер, потрібна окрема функція, що збирає <code>name</code>, <code>message</code>, <code>stack</code>, <code>cause</code> та власні поля, або метод <code>toJSON()</code> у класі. Саме її ви напишете в одному з наступних завдань.",
      "Практичні поради. Давайте помилкам осмислені імена й поля, але не перетворюйте їх на контейнери для всього. Не передавайте помилки як звичайні результати без потреби. Не змінюйте оригінальну помилку, коли обгортаєте: створюйте нову й вказуйте <code>cause</code>. А в кінці цього ланцюжка, на верхньому рівні, одне місце має вирішувати: показати користувачу повідомлення, записати журнал чи перезапустити операцію.",
    ],
    code: [
      String.raw`class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}
try {
  throw new ValidationError("email", "Некоректна адреса");
} catch (error) {
  console.log(error instanceof ValidationError, error instanceof Error);
  console.log(error.name, error.field, error.message);
  console.log(String(error));
}`,
      String.raw`class AppError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = new.target.name;
  }
}
class NotFoundError extends AppError {}
class PermissionError extends AppError {}
for (const E of [NotFoundError, PermissionError]) {
  try {
    throw new E("тест");
  } catch (error) {
    console.log(error.name, error instanceof AppError);
  }
}`,
      String.raw`function readFile() {
  throw new Error("ENOENT: файл не знайдено");
}
function loadProfile() {
  try {
    return readFile();
  } catch (original) {
    throw new Error("Не вдалося завантажити профіль", { cause: original });
  }
}
try {
  loadProfile();
} catch (error) {
  console.log(error.message);
  console.log(error.cause.message, error.cause instanceof Error);
}`,
      String.raw`const plain = new Error("текст");
plain.code = "E_FAIL";
console.log(JSON.stringify(plain));
console.log(JSON.stringify({ name: plain.name, message: plain.message, code: plain.code }));
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
  toJSON() {
    return { name: this.name, message: this.message, status: this.status };
  }
}
console.log(JSON.stringify(new HttpError(404, "Не знайдено")));`,
      String.raw`// аварія: обгортка зберігає початкову причину, і Node друкує всю ланцюжок помилок разом із cause
function connect() {
  throw new Error("тайм-аут з'єднання");
}
try {
  connect();
} catch (error) {
  throw new Error("Не вдалося зберегти замовлення", { cause: error });
}`,
    ],
    note: "Власний клас помилки успадковує від <code>Error</code>, викликає <code>super</code> і ставить <code>name</code>. Обгортаючи помилку, передавайте початкову в <code>{ cause }</code>. <code>JSON.stringify(error)</code> не бачить <code>message</code>, тому потрібен <code>toJSON</code> чи окрема функція.",
    work: "Міжшарові помилки (база → сервіс → API) інформативні лише з ланцюжком причин, а типи помилок дозволяють відповідати 404, 403 чи 422 за класом, а не за текстом повідомлення. Системи моніторингу групують баги за name і cause.",
    tasks: [
      "Навіщо створювати власні класи помилок і що обов'язково треба зробити в їхньому конструкторі?",
      "Для чого параметр cause у конструкторі Error і чому JSON.stringify(error) повертає порожній об'єкт?",
    ],
  },
  {
    t: "AggregateError і Promise.any",
    ch: "Помилки",
    adv: true,
    easy: "Іноді помилка не одна: усі три джерела даних відмовили або форма містить п'ять помилок одночасно. <code>AggregateError</code> збирає їх в один об'єкт, а <code>Promise.any</code> чекає першого успіху й здається лише тоді, коли не вдалося нічому.",
    p: [
      "Звичайна помилка описує одну причину збою, але реальні ситуації бувають складнішими. Валідація форми може знайти кілька проблем одночасно. Запит до трьох дзеркал сервера може не вдатися в усіх трьох. Для такого випадку існує вбудований клас <code>AggregateError</code>: <code>new AggregateError([err1, err2], \"Усі спроби невдалі\")</code>. Перший аргумент — ітероване значення з помилками, другий — загальне повідомлення. Помилки доступні як масив <code>error.errors</code>, а сам об'єкт є нащадком <code>Error</code>, тож має <code>message</code> і <code>stack</code>.",
      "Головне місце, де рушій сам створює <code>AggregateError</code>, — <code>Promise.any</code>. Цей метод приймає ітерований набір промісів і повертає проміс, який виконується значенням <b>першого успішного</b>, ігноруючи невдачі. Якщо ж відхилилися всі проміси (або набір порожній), результат відхиляється з <code>AggregateError</code>, у якому <code>errors</code> містить усі причини в порядку вхідних промісів. Це відрізняє <code>any</code> від <code>race</code>, який повертає перший завершений проміс (навіть із помилкою), та від <code>all</code>, який відхиляється за першою ж помилкою.",
      "Типове застосування <code>Promise.any</code> — «перегони» між кількома джерелами однієї відповіді: кілька дзеркал CDN, основний і запасний сервери, кеш і мережа. Перша успішна відповідь перемагає, а повільні й збійні вже не мають значення. Якщо всі впали, ви отримуєте один об'єкт із повним переліком причин, який можна записати в журнал чи показати розробнику: це набагато корисніше, ніж «остання помилка».",
      "Не менш корисний <code>AggregateError</code> для збору помилок власної логіки. Валідація, яка зупиняється на першій помилці, змушує користувача виправляти поля по одному. Краще зібрати всі помилки в масив і, якщо він не порожній, кинути <code>new AggregateError(errors, \"Форма містить помилки\")</code>. Обробник отримує повний список і може підсвітити всі поля одразу. Власний підклас з додатковими властивостями теж можливий: <code>class FormError extends AggregateError { ... }</code>.",
      "Коли <code>Promise.any</code> відхиляється, його помилка має тип <code>AggregateError</code>, а повідомлення за замовчуванням — «All promises were rejected». Обробляти її слід у <code>catch</code> чи <code>try/catch</code> з <code>await</code>. Якщо помилку ніхто не перехопить, це буде необроблене відхилення, яке в Node.js завершує програму. Тому завжди додавайте обробник, коли використовуєте <code>any</code> або <code>all</code>.",
      "Сумісність: <code>AggregateError</code> та <code>Promise.any</code> є в Node.js від 15-ї версії та в усіх сучасних браузерах із 2020 року. У старіших середовищах їх потрібно замінити поліфілом або власною реалізацією на <code>Promise.allSettled</code>. Для розуміння механіки корисно один раз написати «ручний <code>any</code>»: пройти по промісах, зібрати помилки й відхилити, коли їх накопичиться стільки ж, скільки промісів.",
      "Підсумок. Одна помилка — звичайний <code>Error</code>. Багато помилок одним об'єктом — <code>AggregateError</code>. Перший успіх із багатьох — <code>Promise.any</code>. Перший завершений — <code>Promise.race</code>. Усі успішні або перша помилка — <code>Promise.all</code>. Звіт про кожен результат — <code>Promise.allSettled</code>. У главі про асинхронність ми зведемо ці п'ять інструментів в одну картину.",
    ],
    code: [
      String.raw`const error = new AggregateError([new Error("перша"), new TypeError("друга")], "Кілька проблем");
console.log(error.name, error.message);
console.log(error.errors.map((e) => e.name + ": " + e.message));
console.log(error instanceof Error, Array.isArray(error.errors));`,
      String.raw`const delay = (ms, value, fail) =>
  new Promise((resolve, reject) => setTimeout(() => (fail ? reject(new Error(value)) : resolve(value)), ms));
const winner = await Promise.any([
  delay(5, "швидкий збій", true),
  delay(30, "повільний успіх"),
  delay(50, "ще повільніший успіх"),
]);
console.log(winner);`,
      String.raw`try {
  await Promise.any([
    Promise.reject(new Error("дзеркало 1 недоступне")),
    Promise.reject(new Error("дзеркало 2 недоступне")),
  ]);
} catch (error) {
  console.log(error instanceof AggregateError, error.message);
  console.log(error.errors.map((e) => e.message));
}`,
      String.raw`function validate(form) {
  const errors = [];
  if (!form.name) errors.push(new Error("Ім'я обов'язкове"));
  if (!/^\S+@\S+$/.test(form.email ?? "")) errors.push(new Error("Некоректний email"));
  if (!(form.age >= 18)) errors.push(new RangeError("Потрібно 18 років"));
  if (errors.length) throw new AggregateError(errors, "Форма містить помилки");
  return form;
}
try {
  validate({ name: "", email: "x", age: 15 });
} catch (error) {
  console.log(error.errors.length, error.errors.map((e) => e.message));
}`,
      String.raw`// аварія: усі проміси відхилилися, Promise.any кидає AggregateError, і ніхто його не перехоплює
console.log("Запитуємо дзеркала");
const result = await Promise.any([
  Promise.reject(new Error("перше")),
  Promise.reject(new Error("друге")),
]);
console.log(result);`,
    ],
    note: "<code>AggregateError(errors, message)</code> тримає масив помилок у <code>errors</code>. <code>Promise.any</code> повертає перший успіх, а якщо впали всі, відхиляється з <code>AggregateError</code>. Для збору кількох помилок валідації теж зручно кидати один агрегат.",
    work: "Запити до кількох дзеркал, резервних сервісів чи джерел кешу з вибором найшвидшого успішного, а також форми, що показують усі помилки відразу, тримаються на цих інструментах. Повний перелік причин спрощує діагностику збоїв.",
    tasks: [
      "Коли Promise.any виконується, а коли відхиляється, і яку помилку він тоді повертає?",
      "Чим Promise.any відрізняється від Promise.race і Promise.all та як зібрати кілька помилок валідації в один об'єкт?",
    ],
  },
  {
    t: "Помилки в асинхронному коді: відхилені проміси",
    ch: "Помилки",
    easy: "У асинхронному коді помилка не «злітає» вгору стеком, а перетворює проміс на відхилений. Якщо вчасно не підставити <code>catch</code> або <code>try/catch</code> з <code>await</code>, про неї ніхто не дізнається, а програма може впасти.",
    p: [
      "Асинхронні операції завершуються пізніше, коли початковий стек викликів уже давно зник. Тому звичайний <code>try/catch</code> навколо виклику асинхронної функції без <code>await</code> нічого не перехопить: функція повертає проміс миттєво, а помилка відбудеться потім. Помилку в асинхронному світі подають як <b>відхилення проміса</b> (rejection): проміс переходить у стан «rejected» зі значенням-причиною. Саме цей стан треба обробляти.",
      "Є два основних способи. Метод <code>.catch(handler)</code> підписується на відхилення: <code>fetchUser().then(show).catch(handleError)</code>. А в <code>async</code>-функції можна використовувати звичний <code>try/catch</code> разом із <code>await</code>: <code>try { const user = await fetchUser(); } catch (error) { ... }</code>. Другий запис читається як синхронний код і зазвичай кращий. Усередині <code>async</code>-функції будь-який <code>throw</code> автоматично перетворюється на відхилення повернутого проміса.",
      "Обробка в ланцюжку працює так: помилка, що виникла в будь-якому <code>then</code>, пропускає наступні <code>then</code> і потрапляє в найближчий <code>catch</code>. Після <code>catch</code> ланцюжок «одужує»: наступні <code>then</code> знову виконуються зі значенням, яке повернув <code>catch</code>. Метод <code>.finally(fn)</code> спрацьовує в будь-якому разі й не змінює результату (якщо сам не кине помилку), тож він підходить для прибирання, наприклад вимкнення спінера.",
      "Типові помилки. По-перше, забутий <code>await</code>: <code>try { saveUser(user); } catch { ... }</code> без <code>await</code> не перехопить відхилення, бо <code>saveUser</code> повертає проміс. По-друге, <code>return promise</code> усередині <code>try</code> без <code>await</code>: проміс повертається назовні, і помилка з нього проминає ваш <code>catch</code>; потрібно <code>return await promise</code>. По-третє, помилки в колбеках таймерів чи подій: <code>try/catch</code> навколо <code>setTimeout(fn)</code> не ловить помилку всередині <code>fn</code>, бо вона виникає в іншому стеку.",
      "Особливі правила мають комбінатори. <code>Promise.all</code> відхиляється за першою ж помилкою, але інші проміси продовжують працювати, а їхні результати ігноруються. <code>Promise.allSettled</code> ніколи не відхиляється й повертає масив описів <code>{ status, value | reason }</code>, тому підходить для «виконай усе й дай звіт». У циклі <code>for...of</code> з <code>await</code> перша помилка зупиняє весь цикл, якщо її не перехопити всередині ітерації.",
      "Відхилений проміс, до якого ніхто не підключив обробник, називають <b>необробленим відхиленням</b> (unhandled rejection). У сучасному Node.js це призводить до аварійного завершення процесу, а в браузері — до повідомлення в консолі та події <code>unhandledrejection</code>. Саме тому кожен проміс має мати «кінцевого споживача» помилки, а на верхньому рівні програми потрібен хоча б один загальний обробник, про який ми поговоримо в наступному уроці.",
      "Практичні правила. Завжди чекайте проміси (<code>await</code>) або повертайте їх далі, не залишайте «висіти». Обгортайте <code>await</code> у <code>try/catch</code> там, де вмієте відновитися, а в інших місцях дозвольте помилці дійти до верхнього рівня. Не змішуйте стилі без потреби (<code>await</code> усередині <code>.then</code>). І не перетворюйте помилки на тихий <code>null</code>: у програмі мають лишатися сліди збою.",
    ],
    code: [
      String.raw`async function fail() {
  throw new Error("збій");
}
const promise = fail();
console.log(promise instanceof Promise);
try {
  await promise;
} catch (error) {
  console.log("перехоплено:", error.message);
}`,
      String.raw`const steps = [];
await Promise.resolve(1)
  .then((n) => {
    steps.push("then 1");
    throw new Error("помилка в then");
  })
  .then(() => steps.push("пропущено"))
  .catch((e) => {
    steps.push("catch: " + e.message);
    return "відновлено";
  })
  .then((v) => steps.push("then після catch: " + v))
  .finally(() => steps.push("finally"));
console.log(steps);`,
      String.raw`async function save() {
  throw new Error("збій збереження");
}
async function noAwait() {
  try {
    save();               // забули await: помилка не перехоплена тут
    return "здалося, що все добре";
  } catch {
    return "catch";
  }
}
process.on("unhandledRejection", (reason) => console.log("необроблене відхилення:", reason.message));
console.log(await noAwait());
await new Promise((r) => setTimeout(r, 10));`,
      String.raw`async function inner() {
  throw new Error("всередині");
}
async function withoutAwait() {
  try {
    return inner();          // повертаємо проміс, catch не спрацює
  } catch {
    return "перехоплено";
  }
}
async function withAwait() {
  try {
    return await inner();
  } catch {
    return "перехоплено";
  }
}
console.log(await withAwait());
await withoutAwait().catch((e) => console.log("помилка пройшла повз catch:", e.message));`,
      String.raw`// аварія: відхилений проміс ніхто не обробив, тож Node завершує програму з помилкою
async function loadUser() {
  throw new Error("користувача не знайдено");
}
loadUser();
console.log("Рядок після виклику виконується");
await new Promise((resolve) => setTimeout(resolve, 20));
console.log("Сюди програма не дійде");`,
    ],
    note: "Асинхронна помилка це відхилений проміс: обробляйте її через <code>.catch</code> або <code>try/catch</code> з <code>await</code>. Без <code>await</code> звичайний <code>try/catch</code> нічого не перехоплює, а <code>return await</code> усередині <code>try</code> потрібен для обробки. Необроблене відхилення валить Node.",
    work: "Мережеві запити, робота з файлами й базами завжди асинхронні, тому правильна обробка відхилень відділяє сервер, що працює місяцями, від сервера, що падає від першого тайм-ауту. У інтерфейсі вона відповідає за повідомлення про помилку замість нескінченного спінера.",
    tasks: [
      "Чому try/catch без await не перехоплює помилку асинхронної функції і що таке відхилений проміс?",
      "Що відбувається в ланцюжку промісів після catch і чим відрізняється return promise від return await promise усередині try?",
    ],
  },
  {
    t: "Необроблені помилки: unhandledrejection і onerror",
    ch: "Помилки",
    easy: "Навіть найакуратніший код пропускає несподівані збої. Глобальні обробники — це остання сітка під акробатом: вони не рятують операцію, але фіксують, що сталося, щоб ви дізналися про помилку раніше за користувачів.",
    p: [
      "Помилка, яку ніхто не перехопив, виходить на верхній рівень середовища. У браузері для синхронних збоїв спрацьовує подія <code>error</code> на <code>window</code>: <code>window.onerror = (message, source, line, col, error) =&gt; { ... }</code> або <code>window.addEventListener(\"error\", handler)</code>. Для відхилених промісів без обробника є окрема подія <code>unhandledrejection</code>, в об'єкті якої <code>event.reason</code> містить причину, а <code>event.preventDefault()</code> прибирає стандартне повідомлення в консолі.",
      "У Node.js аналогів два. <code>process.on(\"uncaughtException\", (error) =&gt; { ... })</code> ловить синхронні необроблені винятки, а <code>process.on(\"unhandledRejection\", (reason, promise) =&gt; { ... })</code> — необроблені відхилення. Без таких обробників Node за замовчуванням завершує процес із ненульовим кодом: це свідома поведінка, бо програма після неочікуваної помилки може бути в непередбачуваному стані.",
      "Головне правило: глобальний обробник призначений для <b>записування звіту</b>, а не для «продовження як ні в чому не бувало». Після <code>uncaughtException</code> стан процесу може бути пошкоджений: наполовину виконані операції, відкриті ресурси. Рекомендована практика на сервері — записати помилку, спробувати охайно завершити роботу (закрити з'єднання, дописати журнал) і вийти, дозволивши менеджеру процесів (systemd, PM2, Kubernetes) перезапустити застосунок.",
      "У браузері користувач бачить застосунок із помилкою, але програма живе далі, тому обробники можуть показати дружнє повідомлення («Щось пішло не так, спробуйте оновити сторінку») і відправити звіт у систему моніторингу, як-от Sentry. У звіт варто включити текст і стек помилки, адресу сторінки, версію застосунку, браузер і по можливості дії користувача перед збоєм. Але не відправляйте особисті дані й секрети, а також обмежуйте частоту звітів, щоб лавина однакових збоїв не знищила ваш сервер моніторингу.",
      "Існує ще одна пастка: помилки завантаження ресурсів (<code>&lt;img&gt;</code>, <code>&lt;script&gt;</code>) генеруються на самому елементі й не спливають вгору, тому їх потрібно ловити в фазі «занурення» (<code>addEventListener(\"error\", handler, true)</code>). Помилки з іншого домену без CORS-заголовків приходять у <code>window.onerror</code> як безлике «Script error.» без стека, і причину видно лише після налаштування заголовків.",
      "Для звітів потрібна універсальна функція, яка приймає що завгодно: <code>Error</code>, рядок, <code>AggregateError</code> чи об'єкт без стека. Вона приводить значення до єдиного формату (<code>name</code>, <code>message</code>, <code>stack</code>, ланцюжок <code>cause</code>), бо кинути в JavaScript можна будь-що. Саме такий серіалізатор помилок ви напишете в практичному завданні, і він згодиться у будь-якому проєкті для логів.",
      "Не покладайтеся на глобальні обробники замість нормальної обробки. Вони не знають контексту й не можуть виправити збій, а лише повідомляють про нього. Нормальна схема така: помилки обробляються поруч із джерелом, очікувані перетворюються на повідомлення користувачу, несподівані піднімаються до глобального обробника, який пише звіт. Так жодна помилка не зникає непомітно, і ви дізнаєтеся про неї першими.",
    ],
    code: [
      String.raw`process.on("unhandledRejection", (reason) => {
  console.log("глобально: відхилення без обробника:", reason.message);
});
Promise.reject(new Error("ніхто не чекає на цей проміс"));
await new Promise((resolve) => setTimeout(resolve, 10));
console.log("процес живий, бо обробник є");`,
      String.raw`process.on("uncaughtException", (error, origin) => {
  console.log("глобально: необроблений виняток:", error.message, "(" + origin + ")");
});
setTimeout(() => {
  throw new Error("збій у таймері");
}, 0);
await new Promise((resolve) => setTimeout(resolve, 20));
console.log("продовжили роботу після звіту");`,
      String.raw`// фрагмент: код для браузера (немає в Node)
window.addEventListener("error", (event) => {
  report({ type: "error", message: event.message, file: event.filename, line: event.lineno });
});
window.addEventListener("unhandledrejection", (event) => {
  report({ type: "rejection", reason: String(event.reason) });
  event.preventDefault();   // прибрати стандартне повідомлення в консолі
});`,
      String.raw`function toReport(value) {
  if (!(value instanceof Error)) return { name: "NonError", message: String(value) };
  const report = { name: value.name, message: value.message, stack: value.stack?.split("\n")[1]?.trim() };
  if (value.cause) report.cause = toReport(value.cause);
  if (value instanceof AggregateError) report.errors = value.errors.map(toReport);
  return report;
}
const e = new Error("збій оплати", { cause: new TypeError("немає токена") });
console.log(JSON.stringify(toReport(e)).slice(0, 80));
console.log(toReport("просто текст"), toReport(404));`,
      String.raw`// аварія: глобального обробника немає, тому необроблений виняток у таймері завершує процес
setTimeout(() => {
  throw new Error("збій у таймері без обробника");
}, 0);
await new Promise((resolve) => setTimeout(resolve, 20));
console.log("Сюди програма не дійде");`,
    ],
    note: "У браузері: <code>window.onerror</code> та подія <code>unhandledrejection</code>, у Node: <code>uncaughtException</code> й <code>unhandledRejection</code>. Глобальні обробники пишуть звіт, а не «лагодять» стан; на сервері після них краще завершити процес. Звіт має працювати з будь-яким кинутим значенням.",
    work: "Системи моніторингу (Sentry, Datadog) під'єднуються саме через глобальні обробники, і вони відлавлюють баги, які не знайшли ваші тести. На сервері хороший перезапуск після збою часто врятовує від каскаду проблем.",
    tasks: [
      "Яка різниця між uncaughtException та unhandledRejection у Node.js і чому після них часто завершують процес?",
      "Що має містити звіт про помилку і чому серіалізатор має працювати з будь-яким кинутим значенням?",
    ],
  },
  {
    t: "Стратегії обробки помилок: результат замість винятку",
    ch: "Помилки",
    adv: true,
    easy: "Виняток — не єдиний спосіб повідомити про невдачу. Функція може повернути «коробочку» зі статусом: або успіх зі значенням, або збій із причиною. Тоді виклик вимагає перевірити стан, і про помилку неможливо забути.",
    p: [
      "Винятки зручні для несподіваних ситуацій, але мають недоліки: сигнатура функції не показує, що вона може кинути; обробка помилки відірвана від місця виклику; забути <code>try/catch</code> легко. Для <b>очікуваних</b> невдач (некоректний ввід користувача, відсутній запис, відмова мережі) часто краще повертати результат, у якому успіх і помилка рівноправні. Такий підхід поширений в інших мовах: <code>Result</code> у Rust, <code>Either</code> у функціональних мовах, пара <code>(value, err)</code> у Go.",
      "Найпростіша форма — об'єкт <code>{ ok: true, value }</code> або <code>{ ok: false, error }</code>. Допоміжні функції <code>ok(value)</code> та <code>err(error)</code> створюють такі об'єкти, а споживач перевіряє поле <code>ok</code> перед використанням значення. Код стає явним: <code>const result = parseAge(text); if (!result.ok) return showError(result.error); use(result.value);</code>. Тип результату видно з виклику, помилки не вилітають несподівано, а тестування простіше, бо не потрібні <code>try/catch</code>.",
      "Різницю між категоріями помилок варто тримати в голові. <b>Очікувані</b> (операційні) помилки: введення не пройшло перевірку, файл не знайдено, сервер відповів 404. Їх природно моделювати результатом. <b>Неочікувані</b> (програмні) помилки: <code>TypeError</code> через баг, зламаний інваріант. Їх краще кидати як винятки й дозволяти спливати до глобального обробника, бо код не знає, як із ними впоратися. Змішування цих двох категорій призводить до коду, що або ковтає баги, або кидає виняток на звичайну недійсну форму.",
      "Результати легко комбінувати. Функція <code>mapResult(result, fn)</code> застосовує <code>fn</code> до значення успішного результату й пропускає збійний без змін. Це дозволяє будувати ланцюжки обробки без нескінченних <code>if</code>: парсинг, потім перевірка, потім перетворення, і перший збій «протікає» до кінця. Функція <code>unwrapOr(result, fallback)</code> витягує значення або підставляє запасне. Так само працює патерн <code>Option</code> (значення чи його відсутність), який у JavaScript часто замінюють <code>null</code> з операторами <code>?.</code> та <code>??</code>.",
      "Часто потрібно зібрати <b>всі</b> помилки, а не зупинитися на першій. Валідація форми повертає не один збій, а список. Результат у цьому разі містить масив помилок: <code>{ ok: false, errors: [...] }</code>. Функції перевірки полів повертають результати, а загальна функція збирає їх і вирішує, чи успішна форма загалом. Для асинхронного коду схожу роль виконує <code>Promise.allSettled</code>, який повертає статус кожної операції замість єдиного відхилення.",
      "Підхід має й ціну. Результати треба передавати й перевіряти на кожному рівні, а це додає шаблонного коду. Бібліотеки (neverthrow, ts-results) полегшують це, але в невеликих проєктах вистачає простого об'єкта. Важливо бути послідовним: у межах одного шару використовуйте один стиль. Типова схема — на межах (парсинг, валідація) повертати результати, а далі в програмі використовувати вже коректні дані, не перевіряючи їх щоразу.",
      "Коротке правило вибору. Помилка нормальна й очікувана, і виклик має відреагувати на неї за місцем — результат. Помилка означає, що щось зламано, і на місці нічого не виправиш — виняток. Функція парсингу введення, пошуку, перевірки правил — зазвичай результат. Функція з порушеним контрактом, відсутній обов'язковий аргумент, недоступна система — виняток. Така дисципліна робить код передбачуваним і для читачів, і для тестів.",
    ],
    code: [
      String.raw`const ok = (value) => ({ ok: true, value });
const err = (error) => ({ ok: false, error });
function parseAge(text) {
  const n = Number(text);
  if (text.trim() === "" || !Number.isInteger(n)) return err("Вік має бути цілим числом");
  if (n < 0 || n > 150) return err("Вік поза межами 0–150");
  return ok(n);
}
for (const input of ["17", "abc", "-5"]) {
  const result = parseAge(input);
  console.log(input, "→", result.ok ? "вік " + result.value : "помилка: " + result.error);
}`,
      String.raw`const ok = (value) => ({ ok: true, value });
const err = (error) => ({ ok: false, error });
const mapResult = (r, fn) => (r.ok ? ok(fn(r.value)) : r);
const unwrapOr = (r, fallback) => (r.ok ? r.value : fallback);
const parseJson = (text) => {
  try {
    return ok(JSON.parse(text));
  } catch (error) {
    return err(error.message);
  }
};
const name = mapResult(parseJson('{"user":"Оля"}'), (data) => data.user.toUpperCase());
console.log(name, unwrapOr(parseJson("{ погано"), "за замовчуванням"));`,
      String.raw`function validate(form) {
  const errors = [];
  if (!form.name) errors.push("Ім'я обов'язкове");
  if (!form.email?.includes("@")) errors.push("Некоректний email");
  if (!(form.age >= 18)) errors.push("Потрібно 18 років");
  return errors.length ? { ok: false, errors } : { ok: true, value: form };
}
console.log(validate({ name: "Оля", email: "o@x.ua", age: 20 }).ok);
console.log(validate({ name: "", email: "x", age: 10 }).errors);`,
      String.raw`const results = await Promise.allSettled([
  Promise.resolve("ок"),
  Promise.reject(new Error("збій")),
  Promise.resolve(42),
]);
console.log(results.map((r) => (r.status === "fulfilled" ? r.value : "помилка: " + r.reason.message)));`,
      String.raw`// аварія: результат невдалий, але значення читають без перевірки поля ok, тож value дорівнює undefined
const ok = (value) => ({ ok: true, value });
const err = (error) => ({ ok: false, error });
function findUser(id) {
  return id === 1 ? ok("Оля") : err("не знайдено");
}
console.log(findUser(1).value.toUpperCase());
console.log(findUser(2).value.toUpperCase());`,
    ],
    note: "Очікувані помилки зручно повертати як <code>{ ok, value | error }</code>, а неочікувані кидати винятком. Результати комбінують через <code>mapResult</code>, а список помилок валідації збирають у масив. Перевіряйте <code>ok</code> перед читанням значення.",
    work: "Валідація форм, парсинг даних, розбір відповідей API та перевірка бізнес-правил найчастіше повертають результат, а не кидають виняток. У Rust, Go та сучасному TypeScript такий стиль уже став стандартом.",
    tasks: [
      "Коли для помилки краще повернути результат { ok: false, error }, а коли кинути виняток?",
      "Як mapResult дозволяє будувати ланцюжки без вкладених if і чим allSettled нагадує цей підхід для промісів?",
    ],
  },
];
