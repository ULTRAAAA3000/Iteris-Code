// Глава 5 «Абстракція: generics і система типів» (уроки 40–51). Тексти українською; у p, easy, note, work, tasks дозволені лише теги code, b, i, а < > & екрануємо.
const raw = String.raw;
const BT = "`";   // зворотний апостроф для прикладів: у String.raw його вставляють як ${BT}
const D = "$";    // знак долара: інтерполяцію в прикладах пишемо як ${D}{вираз}

export const LESSONS_05 = [
  {
    t: "Узагальнені функції",
    ch: "Абстракція: generics і система типів",
    easy: "Узагальнення це шаблон типу: функція не знає наперед, з чим працюватиме, але обіцяє повернути той самий тип, який отримала. Як конверт з невідомим вмістом, що повертається відправнику в тому самому вигляді.",
    p: [
      "Припустимо, ви пишете функцію, яка повертає свій аргумент без змін. Якщо вказати тип <code>any</code>, функція працюватиме з усім, але компілятор «забуде», що саме в неї передали: результат теж стане <code>any</code>. Можна написати перевантаження для кожного типу, але це нескінченно. Для таких задач існують <b>узагальнення</b> (generics): тип записується як змінна, що її компілятор заповнює сам.",
      "Синтаксис такий: <code>function identity&lt;T&gt;(value: T): T</code>. У кутових дужках оголошено <b>параметр типу</b> <code>T</code>. Далі <code>T</code> використовується як звичайний тип у параметрах і в результаті. Запис означає: «яким би не був тип аргументу, такий самий тип я поверну». Букву <code>T</code> обирають за традицією (від слова Type), але назва може бути будь-якою.",
      "Зазвичай писати тип у кутових дужках під час виклику не потрібно: компілятор <b>виводить</b> його з аргументів. Виклик <code>identity(\"привіт\")</code> робить <code>T</code> рядком, і результат має тип <code>string</code>, тож на ньому можна викликати <code>toUpperCase</code>. Для <code>identity(42)</code> результат число. Якщо виведення вас не влаштовує або аргументів немає, тип можна вказати явно: <code>identity&lt;number&gt;(5)</code>.",
      "Узагальнення особливо корисні для колекцій. Функція <code>firstItem&lt;T&gt;(items: T[]): T | undefined</code> повертає перший елемент масиву, і тип результату залежить від масиву: для <code>string[]</code> це <code>string | undefined</code>, для <code>number[]</code> число або <code>undefined</code>. Те саме з функцією <code>repeat&lt;T&gt;(value: T, times: number): T[]</code>, що створює масив повторів будь-якого значення.",
      "Чим узагальнення краще за <code>any</code> і за union? З <code>any</code> зв'язок між входом і виходом втрачається. З union <code>string | number</code> функція не каже, що для рядка повернеться рядок. Узагальнення зберігає цей <b>зв'язок</b>: тип виходу прив'язаний до типу входу. Тому майже всі стандартні методи масивів, <code>Map</code>, <code>Promise</code> записані як узагальнені, і ви користуєтеся ними щодня.",
      "Однак усередині узагальненої функції про <code>T</code> нічого не відомо. Спроба звернутися до <code>value.length</code> дає помилку: компілятор не знає, що в довільного типу є такі поля. Це правильно: функція має працювати з будь-яким типом, тож не може покладатися на конкретні можливості. Якщо потрібні певні властивості, тип обмежують, і про це наступний урок.",
      "Стрілкові функції теж бувають узагальненими: <code>const wrap = &lt;T&gt;(value: T): T[] =&gt; [value]</code>. Зверніть увагу, що у файлах <code>.tsx</code> така форма плутається з розміткою, і тоді пишуть <code>&lt;T,&gt;</code>. У звичайних <code>.ts</code> файлах проблеми немає. Дотримуйтеся простого правила: параметр типу це змінна, яку підставляє компілятор, і її має бути видно в типах параметрів чи результату, інакше вона зайва.",
    ],
    code: [
      raw`function identity<T>(value: T): T {
  return value;
}

function firstItem<T>(items: T[]): T | undefined {
  return items[0];
}

function repeat<T>(value: T, times: number): T[] {
  return Array.from({ length: times }, () => value);
}

const text = identity("привіт");
const num = identity(42);
const firstName = firstItem(["Оля", "Іван"]);

console.log(text.toUpperCase(), num.toFixed(1), firstName, repeat(0, 3));
`,
      raw`// не компілюється: про довільний тип T невідомо, чи є в нього length
function size<T>(value: T): number {
  return value.length;
}

console.log(size("абв"));
`,
      raw`function identity<T>(value: T): T {
  return value;
}

function repeat<T>(value: T, times: number): T[] {
  return Array.from({ length: times }, () => value);
}

const explicit = identity<number>(5);
const inferred = identity(5);
const empty = repeat<string>("", 2);

console.log(explicit, inferred, empty);
`,
      raw`// не компілюється: тип T вказано як number, а передано масив рядків
function firstItem<T>(items: T[]): T | undefined {
  return items[0];
}

console.log(firstItem<number>(["a", "b"]));
`,
    ],
    note: "<code>function f&lt;T&gt;(x: T): T</code> зберігає зв'язок між типом входу й виходу. Компілятор зазвичай сам виводить <code>T</code> з аргументів. Усередині функції про <code>T</code> нічого не відомо, поки його не обмежено.",
    work: "Узагальнені функції лежать в основі бібліотек: методи масивів, робота з відповідями API, кеші, утиліти. Власні узагальнення потрібні, коли одна й та сама логіка має працювати з різними типами без втрати точності.",
    tasks: [
      "Чим узагальнена функція <code>identity&lt;T&gt;(x: T): T</code> краща за функцію з типом <code>any</code>?",
      "Чому всередині функції <code>size&lt;T&gt;(value: T)</code> не можна звернутися до <code>value.length</code>?",
    ],
  },
  {
    t: "Обмеження generics: extends",
    ch: "Абстракція: generics і система типів",
    easy: "Обмеження каже, що саме має вміти тип, який підставляють замість T: як вимога до кандидата «лише з правами водія». Тоді всередині функції можна безпечно користуватися цими можливостями.",
    p: [
      "Неоднозначний параметр типу <code>T</code> можна обмежити словом <code>extends</code>: <code>function longest&lt;T extends { length: number }&gt;(a: T, b: T): T</code>. Запис означає: «<code>T</code> може бути будь-яким типом, який має числове поле <code>length</code>». Тепер усередині функції звернення до <code>a.length</code> дозволене, а виклик з типом без цього поля (наприклад, із числом) не скомпілюється.",
      "Особливість обмеження: функція <b>зберігає точний тип</b>. Для <code>longest(\"abc\", \"de\")</code> результат має тип рядок, а для двох масивів чисел масив чисел. Якщо ж записати параметри просто як <code>{ length: number }</code>, результат стане узагальненим «будь-що з length», і ви втратите методи рядка чи масиву. Саме для цього й потрібні узагальнення разом з обмеженнями.",
      "Обмеженням може бути що завгодно: інтерфейс, об'єктний тип, union, інший параметр типу. Запис <code>T extends string | number</code> обмежує типи рядками й числами, <code>T extends object</code> лише об'єктами. А <code>T extends { id: number }</code> вимагає поле <code>id</code>, що дозволяє написати універсальну функцію пошуку за ідентифікатором для будь-яких записів: користувачів, товарів, замовлень.",
      "Приклад такої функції: <code>findById&lt;T extends { id: number }&gt;(items: T[], id: number): T | undefined</code>. Вона приймає масив будь-яких об'єктів із полем <code>id</code> і повертає знайдений елемент <b>того самого типу</b>. Тому для масиву <code>User[]</code> результат <code>User | undefined</code>, і поля користувача доступні без приведень. Саме так пишуть узагальнені репозиторії й допоміжні функції.",
      "Якщо аргументи несумісні, компілятор повідомить про це. Для <code>longest(\"abc\", [1, 2])</code> тип <code>T</code> не може бути одночасно рядком і масивом чисел, тож з'явиться помилка. Іноді така суворість заважає, і тоді потрібні два окремі параметри типу, про що наступні уроки. Але часто саме вона й рятує від випадкового змішування несумісних значень.",
      "Нагадаємо: без обмеження тип <code>T</code> усередині функції поводиться як <code>unknown</code>, тобто про нього нічого не відомо. Додаючи <code>extends</code>, ви надаєте компілятору мінімальний набір гарантій. Хорошим стилем вважається обмеження мінімальне: описуйте лише ті поля, якими функція справді користується. Тоді вона лишається максимально універсальною й підходить для найширшого кола типів, які ви навіть не передбачали під час написання.",
      "Ще кілька корисних прийомів: обмеження може посилатися на інший параметр, <code>K extends keyof T</code> (про це далі), а також мати значення за замовчуванням. Намагайтеся не робити обмеження надто складними: якщо опис займає цілий рядок, винесіть його в окремий псевдонім типу з назвою, що пояснює зміст, наприклад <code>HasId</code> чи <code>Lengthy</code>.",
    ],
    code: [
      raw`function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

console.log(longest("abc", "de"));
console.log(longest([1, 2], [1, 2, 3]));
`,
      raw`// не компілюється: у числа немає поля length
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

console.log(longest(10, 20));
`,
      raw`// не компілюється: T не може бути одночасно рядком і масивом чисел
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}

console.log(longest("abc", [1, 2]));
`,
      raw`interface User {
  id: number;
  name: string;
}

function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

const users: User[] = [
  { id: 1, name: "Оля" },
  { id: 2, name: "Іван" },
];

const found = findById(users, 2);
console.log(found?.name);
`,
    ],
    note: "<code>T extends Умова</code> обмежує підставлювані типи й дозволяє користуватися відповідними полями всередині функції. Точний тип аргументу зберігається в результаті. Обмеження робіть мінімальними.",
    work: "Обмеження дозволяють писати універсальні функції для всіх записів із полем <code>id</code>, усіх колекцій із <code>length</code>, усіх об'єктів із заданим методом. Так з'являються спільні утиліти без дублювання коду, а типи результатів лишаються точними для кожного виклику окремо.",
    tasks: [
      "Для чого в записі <code>T extends { length: number }</code> потрібне слово <code>extends</code>?",
      "Чому функція з обмеженим <code>T</code> повертає точніший тип, ніж функція з параметрами типу <code>{ length: number }</code>?",
    ],
  },
  {
    t: "Узагальнені інтерфейси й класи",
    ch: "Абстракція: generics і система типів",
    easy: "Узагальнення можуть жити не лише у функціях: контейнери на кшталт стека, черги чи відповіді сервера описують раз, а потім наповнюють будь-якими типами, не втрачаючи точності.",
    p: [
      "Параметри типу можна додавати до <b>інтерфейсів</b>, <b>псевдонімів</b> і <b>класів</b>. Інтерфейс <code>interface ApiResponse&lt;T&gt; { data: T; status: number }</code> описує відповідь сервера, у якій тип даних залежить від запиту. Для списку користувачів буде <code>ApiResponse&lt;User[]&gt;</code>, для одного замовлення <code>ApiResponse&lt;Order&gt;</code>. Структура одна, а вміст різний.",
      "Ви вже давно користуєтеся узагальненими типами: <code>Array&lt;number&gt;</code>, <code>Map&lt;string, number&gt;</code>, <code>Set&lt;string&gt;</code>. Усе, що пишуть у кутових дужках після назви, це <b>аргументи типу</b>. Вони так само підставляються замість параметрів типу, як звичайні аргументи замість параметрів функції. Тепер ви бачите, що за цим записом нічого магічного немає.",
      "Клас теж може бути узагальненим: <code>class Stack&lt;T&gt;</code> зберігає приватний масив <code>T[]</code>, метод <code>push(item: T)</code> додає елемент, а <code>pop(): T | undefined</code> повертає його. Екземпляр створюють із конкретним типом: <code>new Stack&lt;number&gt;()</code>. Тоді <code>push(\"x\")</code> стає помилкою, а <code>pop()</code> повертає число або <code>undefined</code>.",
      "Аргумент типу для класу часто виводиться сам, коли його можна визначити з аргументів конструктора. А ось для інтерфейсів і псевдонімів його майже завжди треба вказувати: запис <code>ApiResponse</code> без дужок це помилка, адже компілятор вимагає всі аргументи типу. Кількість аргументів теж перевіряється: «Generic type requires 1 type argument(s)».",
      "Є важливе обмеження класів: параметр типу <code>T</code> доступний лише членам <b>екземпляра</b>. Статичні члени його не бачать, бо вони належать самому класу, а не конкретному екземпляру з певним <code>T</code>. Якщо статичному методу потрібна узагальненість, він має оголосити власний параметр типу окремо, незалежно від параметрів класу.",
      "Узагальнені типи природно комбінуються: <code>Stack&lt;User&gt;</code>, <code>ApiResponse&lt;Stack&lt;number&gt;&gt;</code>, <code>Map&lt;string, ApiResponse&lt;User&gt;&gt;</code>. Кожен рівень вкладеності зберігає точність. Головне не нагромаджувати: якщо запис займає півекрана, винесіть частини в псевдоніми з говірними назвами, які розкажуть, що відбувається, і зроблять складний тип зрозумілим.",
      "Узагальнений тип чудово документує намір: читач одразу бачить, що структура однакова для різного вмісту. Так пишуть стеки, черги, кеші, сховища, обгортки відповідей і стани завантаження. Якщо ви помічаєте, що пишете той самий клас кілька разів, змінюючи лише тип вмісту, це сигнал, що потрібне узагальнення. Таке рішення зменшує обсяг коду й кількість місць, де можна припуститися помилки під час змін.",
    ],
    code: [
      raw`class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  get size(): number {
    return this.items.length;
  }
}

const numbers = new Stack<number>();
numbers.push(1);
numbers.push(2);
const words = new Stack<string>();
words.push("а");

console.log(numbers.pop(), words.pop(), numbers.size);
`,
      raw`// не компілюється: у стек чисел не можна покласти рядок
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }
}

const numbers = new Stack<number>();
numbers.push("x");
`,
      raw`interface User {
  id: number;
  name: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
}

const one: ApiResponse<User> = { data: { id: 1, name: "Оля" }, status: 200 };
const many: ApiResponse<string[]> = { data: ["а", "б"], status: 200 };

console.log(one.data.name, many.data.length);
`,
      raw`// не компілюється: узагальнений інтерфейс вимагає аргумент типу
interface ApiResponse<T> {
  data: T;
  status: number;
}

const response: ApiResponse = { data: 1, status: 200 };
console.log(response);
`,
    ],
    note: "Параметри типу є в інтерфейсів, псевдонімів і класів: <code>Stack&lt;T&gt;</code>, <code>ApiResponse&lt;T&gt;</code>. Аргумент типу для інтерфейсу треба вказувати завжди. Статичні члени класу параметра <code>T</code> не бачать.",
    work: "Стани завантаження, відповіді API, кеші, черги, сховища й обробники зручно описувати узагальненими типами один раз і використовувати з різними даними, не втрачаючи точності, не копіюючи код і не пишучи окремі версії для кожного випадку.",
    tasks: [
      "Що означає запис <code>new Stack&lt;number&gt;()</code> і що станеться при виклику <code>push(\"x\")</code>?",
      "Чому статичний метод узагальненого класу не може використовувати параметр типу <code>T</code> класу?",
    ],
  },
  {
    t: "Параметри типу за замовчуванням і кілька параметрів",
    ch: "Абстракція: generics і система типів",
    easy: "Параметрів типу може бути кілька, як окремих гнізд у розетці. А якщо більшість людей вставляють у гніздо одне й те саме, його можна зробити типовим, щоб кожного разу не вказувати.",
    p: [
      "Параметрів типу може бути скільки завгодно: <code>function mapArray&lt;T, U&gt;(items: T[], fn: (item: T) =&gt; U): U[]</code>. Тут <code>T</code> це тип елементів вхідного масиву, <code>U</code> тип результату перетворення. Обидва виводяться з аргументів: для <code>mapArray([1, 2], (n) =&gt; \"№\" + n)</code> тип <code>T</code> це число, а <code>U</code> рядок. Саме так записаний стандартний метод <code>map</code>.",
      "Інший приклад: <code>function pair&lt;A, B&gt;(a: A, b: B): [A, B]</code> створює пару значень різних типів. Функція <code>zip&lt;A, B&gt;(first: A[], second: B[]): [A, B][]</code> поєднує два масиви в масив пар. Літери вибирають за змістом: <code>K</code> і <code>V</code> для ключа й значення, <code>T</code> для основного типу, <code>E</code> для елемента, <code>R</code> для результату.",
      "Параметрам типу можна дати <b>значення за замовчуванням</b>: <code>interface Result&lt;T = string&gt; { value: T }</code>. Тепер запис <code>Result</code> без аргументів означає <code>Result&lt;string&gt;</code>, а <code>Result&lt;number&gt;</code> задає число. Це зручно, коли один варіант трапляється найчастіше, і ви не хочете змушувати користувачів вказувати його щоразу.",
      "Типові значення мають бути <b>після</b> обов'язкових параметрів, так само як необов'язкові параметри функцій. Приклад: <code>class Registry&lt;K = string, V = unknown&gt;</code> має обидва параметри з типовими значеннями, тож <code>new Registry()</code> створить кеш зі строковими ключами. Типове значення можна поєднувати з обмеженням: <code>T extends object = {}</code>, де тип має бути об'єктом і за замовчуванням порожнім.",
      "Важлива особливість: TypeScript не вміє <b>часткового виведення</b> аргументів типу. Якщо ви вказуєте частину аргументів явно, решту треба теж вказати або взагалі нічого не вказувати. Запис <code>pair&lt;string&gt;(\"a\", 1)</code> для функції з двома параметрами типу це помилка «Expected 2 type arguments, but got 1». Єдиний вихід: або всі аргументи, або жодного.",
      "Обережно з кількістю параметрів. Кожен додатковий параметр типу ускладнює підписи, повідомлення про помилки та вибір аргументів. Якщо їх більше трьох, замислитесь, чи не варто об'єднати частину в один об'єктний тип. Простота інтерфейсу функції важливіша за гнучкість, якою ніхто не користується. Хороший узагальнений код читається як звичайний, а типові параметри лишаються непомітними для того, хто просто користується функцією, і не змушують його вивчати теорію типів.",
      "Типові значення особливо корисні в публічних інтерфейсах. Наприклад, тип подій <code>Handler&lt;E = Event&gt;</code> вимагає від користувача нічого, якщо він працює зі стандартними подіями, і дозволяє уточнити лише для особливих. Так узагальнення працюють як налаштування: за замовчуванням усе просто, а за потреби гнучко. Це хороший шлях зробити бібліотеку зручною.",
    ],
    code: [
      raw`function mapArray<T, U>(items: T[], fn: (item: T) => U): U[] {
  const result: U[] = [];
  for (const item of items) {
    result.push(fn(item));
  }
  return result;
}

function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

console.log(mapArray([1, 2, 3], (n) => "№" + n), pair("а", 1));
`,
      raw`interface Result<T = string> {
  value: T;
}

class Registry<K = string, V = unknown> {
  private data = new Map<K, V>();

  set(key: K, value: V): void {
    this.data.set(key, value);
  }

  get(key: K): V | undefined {
    return this.data.get(key);
  }
}

const a: Result = { value: "текст" };
const b: Result<number> = { value: 42 };
const registry = new Registry<string, number>();
registry.set("a", 1);

console.log(a.value, b.value, registry.get("a"));
`,
      raw`// не компілюється: часткове виведення неможливе, треба вказати обидва аргументи типу
function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

console.log(pair<string>("а", 1));
`,
      raw`function zip<A, B>(first: A[], second: B[]): [A, B][] {
  return first.map((item, index) => [item, second[index]]);
}

console.log(zip(["а", "б"], [1, 2]));
`,
    ],
    note: "Параметрів типу може бути кілька: <code>&lt;T, U&gt;</code>. Значення за замовчуванням <code>&lt;T = string&gt;</code> ставлять після обов'язкових. Часткового виведення немає: вказуйте або всі аргументи типу, або жодного.",
    work: "Методи перетворення на кшталт <code>map</code>, типи відповідей, кеші та обробники подій використовують кілька параметрів типу. Типові значення роблять бібліотеку зручною: звичайний випадок не потребує зайвих символів, а складний лишається доступним тим, кому він справді потрібен.",
    tasks: [
      "Для чого в функції <code>mapArray&lt;T, U&gt;</code> два параметри типу?",
      "Чому запис <code>pair&lt;string&gt;(\"а\", 1)</code> для функції з двома параметрами типу не компілюється?",
    ],
  },
  {
    t: "keyof і typeof",
    ch: "Абстракція: generics і система типів",
    easy: "keyof повертає список назв полів типу як набір рядків, а typeof у типах бере форму вже існуючого значення. Разом вони не дозволяють дублювати описи й помилятися в назвах ключів.",
    p: [
      "Оператор <code>keyof</code> застосовується до типу й повертає <b>union назв його полів</b>. Для <code>interface User { id: number; name: string }</code> вираз <code>keyof User</code> дорівнює <code>\"id\" | \"name\"</code>. Значення такого типу може бути лише однією з цих назв, тож друкарська помилка в імені поля виявиться відразу. Це основа безпечної роботи з ключами.",
      "Пригадайте проблему з <code>Object.keys</code>, яка повертає <code>string[]</code>. З <code>keyof</code> її можна розв'язати: <code>function keysOf&lt;T extends object&gt;(obj: T): (keyof T)[] { return Object.keys(obj) as (keyof T)[]; }</code>. Приведення тут ваша обіцянка, що в об'єкті немає зайвих полів, але тепер результат точно типізований, і <code>obj[key]</code> компілюється без помилок.",
      "Окремо існує <code>typeof</code> у <b>позиції типу</b>. У виразах <code>typeof</code> повертає рядок під час виконання, а в анотаціях він бере тип існуючої змінної: <code>type Config = typeof defaultConfig</code>. Так тип описується одним місцем, значенням, і не доводиться дублювати його вручну. Якщо значення змінюється, тип оновлюється разом із ним автоматично.",
      "Ці два оператори чудово комбінуються. Запис <code>keyof typeof defaultConfig</code> дає union назв полів конкретного об'єкта-значення. Для <code>{ host: \"localhost\", port: 3000, debug: false }</code> це <code>\"host\" | \"port\" | \"debug\"</code>. Тоді параметр функції <code>key: keyof typeof defaultConfig</code> приймає лише ці назви, а доступ <code>defaultConfig[key]</code> безпечний.",
      "Для константного об'єкта з <code>as const</code>, як <code>{ Idle: \"idle\", Done: \"done\" } as const</code>, вираз <code>keyof typeof Status</code> дає <code>\"Idle\" | \"Done\"</code>. Це поширений прийом для заміни <code>enum</code>: одне оголошення значення породжує і об'єкт, і потрібні типи. У наступному уроці ми дістанемо з такого об'єкта ще й union значень.",
      "Зауважте відмінність: <code>keyof</code> працює з типами (він отримує тип і повертає тип), а <code>typeof</code> у позиції типу перетворює значення на тип. Тому для змінної <code>user</code> пишуть <code>keyof typeof user</code>, а не <code>keyof user</code>. Якщо забути <code>typeof</code>, компілятор повідомить, що <code>user</code> це значення, а не тип, і підкаже, що треба зробити.",
      "Практична користь очевидна: функції доступу, перебору полів, налаштувань та ключів подій перестають приймати довільні рядки. Замість <code>string</code> вони приймають точний набір ключів, і редактор підказує варіанти. Це приклад головного принципу TypeScript: зробити так, щоб неправильні значення було неможливо навіть записати, а не ловити їх пізніше під час виконання, коли виправляти помилки набагато дорожче й важче для всієї команди.",
    ],
    code: [
      raw`function keysOf<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

const user = { id: 1, name: "Оля" };
for (const key of keysOf(user)) {
  console.log(key, user[key]);
}
`,
      raw`// не компілюється: "age" не є ключем типу User
type User = { id: number; name: string };
const key: keyof User = "age";
console.log(key);
`,
      raw`const defaultConfig = { host: "localhost", port: 3000, debug: false };

type Config = typeof defaultConfig;
type ConfigKey = keyof typeof defaultConfig;

function readOption(key: ConfigKey): string {
  return String(defaultConfig[key]);
}

const copy: Config = { ...defaultConfig, port: 8080 };
console.log(readOption("host"), readOption("port"), copy.port);
`,
      raw`const Status = { Idle: "idle", Done: "done" } as const;
type StatusName = keyof typeof Status;

const chosen: StatusName = "Done";
console.log(chosen, Status[chosen]);
`,
    ],
    note: "<code>keyof T</code> дає union назв полів типу <code>T</code>, а <code>typeof значення</code> у позиції типу бере тип існуючого значення. Разом: <code>keyof typeof obj</code> це назви полів конкретного об'єкта.",
    work: "Функції, що працюють із ключами (налаштування, фільтри, сортування за полем, права доступу), перестають приймати довільні рядки. Редактор підказує допустимі ключі, а помилку в назві видно відразу, без запуску програми.",
    tasks: [
      "Що повертає <code>keyof User</code> для інтерфейсу з полями <code>id</code> і <code>name</code>?",
      "Чим <code>typeof</code> у позиції типу відрізняється від <code>typeof</code> у виразі?",
    ],
  },
  {
    t: "Індексований доступ: T[K]",
    ch: "Абстракція: generics і система типів",
    easy: "Запис T[K] означає «тип значення, що лежить під ключем K у типі T». Так функція може повертати саме той тип, який має поле, а не загальне «щось».",
    p: [
      "Тип можна «індексувати», як значення: <code>User[\"name\"]</code> дає тип поля <code>name</code> інтерфейсу <code>User</code>, тобто <code>string</code>. Це називається <b>індексованим доступом</b> (indexed access type). Він дозволяє запозичити тип поля, не дублюючи його: якщо змінити поле в інтерфейсі, всі місця, де використано <code>User[\"name\"]</code>, оновляться автоматично.",
      "Ключем може бути union: <code>User[\"id\" | \"name\"]</code> дає union типів цих полів, тобто <code>number | string</code>. А для вкладених структур можна ланцюжком: <code>Order[\"customer\"][\"name\"]</code>. Для масивів індекс <code>[number]</code> дає тип елементів: <code>Order[\"items\"][number]</code> це тип одного рядка замовлення. Так зручно витягувати вкладені типи з великих структур.",
      "Головне застосування разом із <code>keyof</code> це безпечна функція доступу: <code>function getProp&lt;T, K extends keyof T&gt;(obj: T, key: K): T[K]</code>. Параметр <code>K</code> може бути лише ключем <code>T</code>, а результат має тип саме цього поля. Для <code>getProp(user, \"name\")</code> результат рядок, для <code>\"id\"</code> число. Помилковий ключ, як <code>\"age\"</code>, не пройде перевірку.",
      "Вираз <code>T[keyof T]</code> дає union <b>усіх значень</b> типу: для об'єкта з числовими полями це просто <code>number</code>, для змішаних ще й інші типи. Разом із <code>typeof</code> зручно діставати типи значень із констант: <code>(typeof prices)[keyof typeof prices]</code>. Дужки тут потрібні, щоб компілятор правильно зрозумів порядок застосування операторів.",
      "Індексований доступ працює і з кортежами: <code>[string, number][0]</code> дає <code>string</code>, а <code>[string, number][number]</code> union <code>string | number</code>. Цей прийом часто зустрічається в бібліотеках, де типи елементів виводяться з масивів констант. А з <code>as const</code> можна отримати union літералів: <code>(typeof levels)[number]</code> для масиву <code>levels</code>.",
      "Якщо ключ не існує, компілятор це покаже. Спроба взяти <code>User[\"age\"]</code> дає помилку «Property age does not exist on type User». Так індексований доступ додатково перевіряє коректність посилань на поля. Це особливо цінно при рефакторингу: перейменували поле, і всі місця, що на нього посилалися, одразу підсвічуються помилками, тож жодне посилання не лишиться застарілим непоміченим, навіть у рідко запусканому коді чи великому застосунку.",
      "Підсумок: <code>keyof</code> відповідає на питання «які бувають ключі?», а <code>T[K]</code> на питання «що лежить за цим ключем?». Разом вони дозволяють писати універсальні, але точні функції доступу, не покладаючись на <code>any</code>. Це основа багатьох утилітарних типів, які ми розглянемо в наступному уроці, і добре розуміти її краще вже зараз, поки приклади прості й короткі.",
    ],
    code: [
      raw`function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Оля", active: true };
const userName = getProp(user, "name");
const id = getProp(user, "id");

console.log(userName.toUpperCase(), id + 1);
`,
      raw`// не компілюється: "age" не є ключем об'єкта user
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 1, name: "Оля" };
console.log(getProp(user, "age"));
`,
      raw`interface Item {
  sku: string;
  qty: number;
}

interface Order {
  id: number;
  customer: { name: string };
  items: Item[];
}

type OrderItem = Order["items"][number];
type CustomerName = Order["customer"]["name"];

const item: OrderItem = { sku: "A1", qty: 2 };
const customer: CustomerName = "Оля";
console.log(item.qty, customer);
`,
      raw`const prices = { хліб: 30, молоко: 45 };
type PriceValue = (typeof prices)[keyof typeof prices];

function total(...values: PriceValue[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

console.log(total(prices.хліб, prices.молоко));
`,
    ],
    note: "<code>T[K]</code> це тип значення за ключем <code>K</code>. Класичний шаблон: <code>getProp&lt;T, K extends keyof T&gt;(obj: T, key: K): T[K]</code>. Для масиву <code>X[number]</code> дає тип елемента.",
    work: "Типізований доступ до полів потрібен у функціях сортування за полем, виборки стовпців, роботи з налаштуваннями. Він гарантує, що ключ існує, а результат має правильний тип без жодних приведень.",
    tasks: [
      "Що означає запис <code>Order[\"items\"][number]</code>?",
      "Навіщо в сигнатурі <code>getProp</code> потрібне обмеження <code>K extends keyof T</code>?",
    ],
  },
  {
    t: "Утилітарні типи: Partial, Pick, Omit, Readonly",
    ch: "Абстракція: generics і система типів",
    easy: "Утилітарні типи це готові перетворювачі: з одного типу вони роблять інший, наприклад усі поля необов'язковими чи без секретного поля. Не треба переписувати інтерфейс вручну, достатньо назвати потрібне перетворення.",
    p: [
      "TypeScript має набір вбудованих узагальнених типів, які перетворюють інші типи. Їх називають <b>утилітарними</b> (utility types), і імпортувати їх не потрібно: вони доступні скрізь. Замість того щоб копіювати інтерфейс і вручну змінювати поля, ви застосовуєте перетворення до існуючого типу, і воно автоматично слідує за всіма змінами в оригіналі.",
      "<code>Partial&lt;T&gt;</code> робить усі поля необов'язковими. Це ідеальний тип для оновлень: функція <code>updateUser(user: User, changes: Partial&lt;User&gt;)</code> приймає лише ті поля, що змінюються. Протилежність, <code>Required&lt;T&gt;</code>, робить усі поля обов'язковими. А <code>Readonly&lt;T&gt;</code> позначає всі поля як доступні лише для читання, що корисно для даних, які не мають змінюватися.",
      "<code>Pick&lt;T, K&gt;</code> створює тип лише з вибраних полів: <code>Pick&lt;User, \"id\" | \"name\"&gt;</code> містить тільки <code>id</code> та <code>name</code>. <code>Omit&lt;T, K&gt;</code> робить навпаки, залишає все, крім указаних: <code>Omit&lt;User, \"password\"&gt;</code> описує користувача без пароля. Саме так створюють «публічні» версії типів, які безпечно віддавати назовні, не показуючи службові поля.",
      "Є тонка різниця. <code>Pick</code> перевіряє, що вибрані ключі існують: <code>Pick&lt;User, \"age\"&gt;</code> без поля <code>age</code> дає помилку. А от <code>Omit</code> такої перевірки <b>не робить</b>: <code>Omit&lt;User, \"pasword\"&gt;</code> з друкарською помилкою компілюється, і нічого не виключає, залишаючи пароль у типі. Тому після використання <code>Omit</code> корисно перевірити результат у підказці редактора.",
      "Інші корисні утиліти: <code>Record&lt;K, T&gt;</code> (словник), <code>NonNullable&lt;T&gt;</code> (прибирає <code>null</code> і <code>undefined</code>), <code>Exclude&lt;T, U&gt;</code> та <code>Extract&lt;T, U&gt;</code> (відкидають чи залишають члени union), <code>ReturnType&lt;F&gt;</code> і <code>Parameters&lt;F&gt;</code> (тип результату й параметрів функції). Останні групи побудовані на умовних типах, які ми розглянемо трохи згодом.",
      "Утиліти можна комбінувати: <code>Partial&lt;Pick&lt;User, \"name\" | \"email\"&gt;&gt;</code> це необов'язкові ім'я й пошта. Але не нагромаджуйте: складний ланцюжок краще вмістити в псевдонім із зрозумілою назвою, наприклад <code>type UserUpdate = Partial&lt;Pick&lt;User, \"name\" | \"email\"&gt;&gt;</code>. Тоді місця використання лишаються читабельними, а складність прихована в одному оголошенні.",
      "Усі ці типи побудовані на механізмі <b>відображених типів</b> (mapped types), які ми вивчимо в одному з наступних уроків. Тоді ви зможете написати власні утиліти й побачите, що в них немає магії. А поки що користуйтеся ними як готовими інструментами: вони економлять час, зменшують дублювання й гарантують узгодженість між пов'язаними типами в усьому проєкті.",
    ],
    code: [
      raw`interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

function updateUser(user: User, changes: Partial<User>): User {
  return { ...user, ...changes };
}

const user: User = { id: 1, name: "Оля", email: "olya@example.com", password: "секрет" };
const updated = updateUser(user, { name: "Олена" });
console.log(updated.name, updated.email);
`,
      raw`interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type PublicUser = Omit<User, "password">;
type UserSummary = Pick<User, "id" | "name">;

function toPublic(user: User): PublicUser {
  const { password, ...rest } = user;
  return rest;
}

const user: User = { id: 1, name: "Оля", email: "olya@example.com", password: "секрет" };
const summary: UserSummary = { id: user.id, name: user.name };
console.log(toPublic(user), summary);
`,
      raw`// не компілюється: Pick перевіряє, що вибраний ключ існує в типі
interface User {
  id: number;
  name: string;
}

type Broken = Pick<User, "age">;
const value: Broken = { age: 1 };
console.log(value);
`,
      raw`// не компілюється: усі поля Readonly доступні лише для читання
interface User {
  id: number;
  name: string;
}

const frozen: Readonly<User> = { id: 1, name: "Оля" };
frozen.name = "Олена";
console.log(frozen);
`,
      raw`interface User {
  id: number;
  password: string;
}

type Almost = Omit<User, "pasword">;
const user: Almost = { id: 1, password: "секрет" };

console.log(Object.keys(user).length);
`,
    ],
    note: "<code>Partial</code> робить поля необов'язковими, <code>Required</code> обов'язковими, <code>Readonly</code> незмінними, <code>Pick</code> вибирає поля, <code>Omit</code> виключає. <code>Omit</code>, на відміну від <code>Pick</code>, не перевіряє назви ключів.",
    work: "Публічні версії моделей без службових полів, типи оновлень, незмінні конфігурації: усе це робиться утилітарними типами. Вони тримають пов'язані типи в узгодженому стані без копіювання, ручної синхронізації та нескінченних правок у кількох місцях.",
    tasks: [
      "Який утилітарний тип підходить для параметра функції оновлення, де можна передати лише частину полів?",
      "Чому <code>Omit&lt;User, \"pasword\"&gt;</code> із друкарською помилкою не викликає помилки компіляції?",
    ],
  },
  {
    t: "Оператор satisfies",
    ch: "Абстракція: generics і система типів",
    easy: "satisfies перевіряє, що значення відповідає типу, але не стирає його точну форму. Це як звірити посилку зі списком замовлення, не перепаковуючи її: перевірка є, а вміст лишається видимим.",
    p: [
      "Часто потрібно переконатися, що об'єкт має певну форму, але зберегти його точні типи. Якщо записати анотацію, наприклад <code>const palette: Record&lt;string, string | number[]&gt; = ...</code>, компілятор перевірить форму, але тип змінної стане саме цим широким описом. Тоді <code>palette.red</code> матиме тип <code>string | number[]</code>, і викликати на ньому <code>toUpperCase</code> не вийде, хоча ви знаєте, що там рядок.",
      "Оператор <code>satisfies</code> (з'явився в TypeScript 4.9) розв'язує цю проблему: <code>const palette = { red: \"#ff0000\", green: [0, 255, 0] } satisfies Record&lt;string, string | number[]&gt;</code>. Компілятор перевіряє, що значення підходить під тип, але <b>зберігає виведений точний тип</b>. Тепер <code>palette.red</code> це рядок, а <code>palette.green</code> масив (чи кортеж) чисел, і працюють методи кожного з них.",
      "Другий бонус це перевірка помилок. З анотацією <code>Record&lt;string, ...&gt;</code> друкарська помилка в ключі при зверненні, <code>themes.ligth</code>, проходить компіляцію й падає лише під час виконання. З <code>satisfies</code> типом змінної лишається точний набір ключів, тож неіснуючий ключ підсвічується помилкою. Крім того, <code>satisfies</code> ловить пропущені чи зайві поля в самому об'єкті.",
      "Типовий прийом поєднує <code>as const</code> із <code>satisfies</code>: <code>const routes = { home: \"/\", about: \"/about\" } as const satisfies Record&lt;string, string&gt;</code>. Тоді значення літеральні й незмінні, а водночас перевірено, що всі вони рядки. З такого об'єкта легко виводяться типи: <code>keyof typeof routes</code> дає імена маршрутів, і жодних ручних дублювань.",
      "Коли використовувати <code>satisfies</code>, а коли анотацію? Анотацією користуйтеся, коли хочете, щоб змінна мала саме цей широкий тип, наприклад параметр функції чи поле класу. <code>satisfies</code> підходить для констант-конфігурацій, таблиць маршрутів, тем оформлення, словників, де форма відома, а точні типи значень потрібні далі в коді. Це основне місце, де він сильніший.",
      "Важливо: <code>satisfies</code> не змінює JavaScript, що вийде з компіляції, і не виконує жодних перетворень значення. Це лише додаткова перевірка під час компіляції. Тому, на відміну від приведення <code>as</code>, воно безпечне: компілятор не повірить вам на слово, а справді звірить значення з типом і викличе помилку, якщо форма не збігається.",
      "Порівняння з <code>as</code> корисне для розуміння. Приведення <code>as</code> каже «повір мені» й може приховати невідповідність. Анотація перевіряє, але звужує тип до описаного. <code>satisfies</code> перевіряє й зберігає точність одночасно. Тому в нових проєктах його часто віддають перевагу в місцях, де раніше використовували приведення або анотацію з широким типом, і код стає безпечнішим без зайвих зусиль.",
    ],
    code: [
      raw`type Color = string | [number, number, number];

const palette = {
  red: "#ff0000",
  green: [0, 255, 0],
  blue: "#0000ff",
} satisfies Record<string, Color>;

console.log(palette.red.toUpperCase(), palette.green.map((c) => c / 255));
`,
      raw`// не компілюється: після анотації red має широкий тип string | number[]
const palette: Record<string, string | number[]> = {
  red: "#ff0000",
  green: [0, 255, 0],
};

console.log(palette.red.toUpperCase());
`,
      raw`// не компілюється: satisfies помічає, що в об'єкті бракує ключа high
type Level = "low" | "high";

const limits = { low: 1 } satisfies Record<Level, number>;
console.log(limits);
`,
      raw`const routes = { home: "/", about: "/about" } as const satisfies Record<string, string>;
type RouteName = keyof typeof routes;

const target: RouteName = "about";
console.log(routes[target], routes.home);
`,
    ],
    note: "<code>значення satisfies Тип</code> перевіряє відповідність типу, але зберігає точний виведений тип, на відміну від анотації. Воно не змінює JavaScript і безпечніше за <code>as</code>. Часто його поєднують з <code>as const</code>.",
    work: "Таблиці маршрутів, теми, словники налаштувань і конфігурації добре описувати через <code>satisfies</code>: форму перевірено, а точні типи значень і ключів лишаються доступними для автодоповнення та перевірки в усьому проєкті.",
    tasks: [
      "У чому різниця між анотацією <code>const x: Тип = ...</code> та <code>const x = ... satisfies Тип</code>?",
      "Чому <code>satisfies</code> безпечніше за приведення типу через <code>as</code>?",
    ],
  },
  {
    t: "Mapped types: власні відображення",
    ch: "Абстракція: generics і система типів",
    adv: true,
    easy: "Відображений тип будує новий тип із існуючого, проходячи по всіх його полях і змінюючи кожне за правилом, як штамп, що проставляє позначку на кожному аркуші стопки.",
    p: [
      "Тип <code>Partial&lt;T&gt;</code> і його родичі працюють завдяки <b>відображеним типам</b> (mapped types). Загальна форма така: <code>{ [K in keyof T]: ... }</code>. Тут <code>K</code> по черзі набуває назви кожного поля типу <code>T</code>, а після двокрапки записано, яким має бути тип поля в новому типі. Це цикл по ключах, але на рівні типів, а не значень.",
      "Простий приклад: <code>type Nullable&lt;T&gt; = { [K in keyof T]: T[K] | null }</code> створює тип, де кожне поле може бути також <code>null</code>. А <code>type Getters&lt;T&gt; = { [K in keyof T]: () =&gt; T[K] }</code> перетворює кожне поле на функцію-геттер із відповідним результатом. Для <code>{ id: number; name: string }</code> вийде <code>{ id: () =&gt; number; name: () =&gt; string }</code>.",
      "Відображення можуть додавати чи прибирати модифікатори. Слово <code>readonly</code> перед квадратними дужками робить поля незмінними, а знак питання після дужок необов'язковими. Знак мінус вимикає модифікатор: <code>-readonly</code> прибирає незмінність, <code>-?</code> робить поле обов'язковим. Так записані <code>Readonly</code>, <code>Partial</code> і <code>Required</code>, і тепер ви можете створювати власні варіанти.",
      "Перебирати можна не лише ключі існуючого типу, а й довільний union літералів: <code>{ [K in \"low\" | \"high\"]: number }</code> створює об'єкт із двома числовими полями. Так працює й <code>Record&lt;K, T&gt;</code>. Це зручний спосіб створити тип за списком імен без ручного дублювання: додали ім'я в union, і поле з'явилося всюди.",
      "Відображені типи, що використовують <code>keyof T</code>, називають <b>гомоморфними</b>: вони зберігають модифікатори (необов'язковість, readonly) початкових полів. Це дуже зручно, бо ви не губите інформацію про структуру. Негомоморфні, що перебирають довільний union, створюють нові поля з нуля, без модифікаторів, якщо їх не додати явно.",
      "Типи самі по собі нічого не роблять під час виконання. Щоб скористатися відображеним типом, потрібна функція, яка справді створює такий об'єкт. Наприклад, <code>makeGetters</code> проходить по ключах об'єкта й для кожного створює функцію-геттер. Під час реалізації часто доводиться використовувати приведення типів, бо компілятору важко довести відповідність узагальненого відображення тому, що ви будуєте в циклі.",
      "Не зловживайте складністю. Відображені типи потужні, але важкі для читання: якщо опис займає кілька рядків, дайте йому зрозумілу назву й короткий коментар. Часто достатньо готових утиліт, а власні відображення потрібні, коли в проєкті повторюється схема перетворення типів, яку жодна вбудована утиліта не покриває.",
    ],
    code: [
      raw`type Nullable<T> = { [K in keyof T]: T[K] | null };
type Getters<T> = { [K in keyof T]: () => T[K] };

interface User {
  id: number;
  name: string;
}

function makeGetters<T extends object>(obj: T): Getters<T> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[key] = () => (obj as Record<string, unknown>)[key];
  }
  return result as Getters<T>;
}

const draft: Nullable<User> = { id: 1, name: null };
const getters = makeGetters({ id: 1, name: "Оля" });
console.log(draft.name, getters.id(), getters.name());
`,
      raw`type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Complete<T> = { [K in keyof T]-?: T[K] };

interface Config {
  readonly host: string;
  port?: number;
}

const editable: Mutable<Config> = { host: "a" };
editable.host = "b";
const full: Complete<Config> = { host: "c", port: 80 };
console.log(editable.host, full.port);
`,
      raw`// не компілюється: у Nullable<User> поле name потрібне, хоч і може бути null
type Nullable<T> = { [K in keyof T]: T[K] | null };

interface User {
  id: number;
  name: string;
}

const draft: Nullable<User> = { id: 1 };
console.log(draft);
`,
      raw`type Level = "low" | "high";
type Limits = { [K in Level]: number };

const limits: Limits = { low: 1, high: 10 };
console.log(limits.low + limits.high);
`,
    ],
    note: "<code>{ [K in keyof T]: ... }</code> це цикл по ключах типу. Модифікатори <code>readonly</code> і <code>?</code> можна додавати чи знімати знаком мінус. Відображений тип існує лише під час компіляції, а об'єкт створює звичайний код.",
    work: "Власні відображення потрібні, коли в проєкті повторюється перетворення форми: усі поля стають функціями, усі отримують помітку «брудне», усі стають необов'язковими. Один тип замінює десятки ручних копій і не відстає від змін моделей.",
    tasks: [
      "Що означає запис <code>{ [K in keyof T]-?: T[K] }</code>?",
      "Чому відображений тип сам по собі не створює об'єкт під час виконання?",
    ],
  },
  {
    t: "Умовні типи",
    ch: "Абстракція: generics і система типів",
    adv: true,
    easy: "Умовний тип це «якщо» на рівні типів: якщо тип такий-то, результат один, інакше інший. Компілятор сам розгалужується під час перевірки, як вибір гілки в звичайній програмі.",
    p: [
      "Умовний тип має вигляд <code>T extends U ? X : Y</code>. Він читається так: «якщо <code>T</code> підходить під <code>U</code>, то результат <code>X</code>, інакше <code>Y</code>». Це схоже на тернарний оператор, але працює з типами. Наприклад, <code>type IsString&lt;T&gt; = T extends string ? \"так\" : \"ні\"</code> дасть <code>\"так\"</code> для рядка й <code>\"ні\"</code> для будь-чого іншого.",
      "Особливість, яку треба знати: умовні типи <b>розподіляються</b> по union. Якщо передати <code>string | number</code> у <code>type ToArray&lt;T&gt; = T extends unknown ? T[] : never</code>, умова перевіряється окремо для кожного члена, і результат <code>string[] | number[]</code>, а не <code>(string | number)[]</code>. Це робить умовні типи дуже зручними для фільтрації union, і саме на цьому побудовано деякі утиліти.",
      "Утиліти <code>Exclude</code>, <code>Extract</code> та <code>NonNullable</code> є умовними типами. <code>Exclude&lt;T, U&gt;</code> прибирає з union ті члени, що підходять під <code>U</code>, <code>Extract&lt;T, U&gt;</code> залишає лише їх, а <code>NonNullable&lt;T&gt;</code> прибирає <code>null</code> та <code>undefined</code>. Ключова ідея: тип <code>never</code> у union зникає, тож якщо умова не підійшла, цей член просто вилучається з результату.",
      "Умовні типи можна використовувати в сигнатурах функцій, коли тип результату залежить від типу аргументу: функція повертає число для рядка й рядок для числа. Це потужна альтернатива перевантаженням, але має ціну: усередині такої функції компілятору важко довести, що ваше значення відповідає умовному типу, тож доводиться використовувати приведення. Тому користуйтеся цим там, де розв'язок справді виправдовує складність.",
      "Умовні типи можна вкладати й комбінувати з відображеними: наприклад, відібрати з об'єкта лише ті поля, що мають значення певного типу. Такі рішення швидко стають складними. Правило здорового глузду: якщо ви не можете пояснити тип одним реченням, спрощуйте. Бібліотеки з надскладними типами часто мають страшні повідомлення про помилки, а ваш код має лишатися зрозумілим.",
      "Пам'ятайте, що умовні типи обчислюються на етапі компіляції, і лише для відомих типів. Для необмеженого параметра <code>T</code> усередині узагальненої функції результат ще не визначений («відкладений»), поки не підставлено конкретний тип. Це пояснює, чому всередині функції з умовним типом результату часто потрібне приведення: компілятор ще не знає, яка гілка спрацює.",
      "Тож умовні типи це інструмент для авторів бібліотек і для складних узагальнень, а не для щоденного коду. Але розуміти їх корисно: вони пояснюють, як працюють <code>ReturnType</code>, <code>Awaited</code> та інші вбудовані типи, які ви використовуєте. У наступному уроці побачимо ще один компонент умовних типів, <code>infer</code>, що дозволяє «витягувати» частини типів.",
    ],
    code: [
      raw`type IsString<T> = T extends string ? "так" : "ні";
type A = IsString<string>;
type B = IsString<number>;

type OnlyStrings = Extract<string | number | boolean, string>;
type NotNull = NonNullable<string | null | undefined>;

const a: A = "так";
const b: B = "ні";
const s: OnlyStrings = "текст";
const n: NotNull = "значення";
console.log(a, b, s, n);
`,
      raw`type ToArray<T> = T extends unknown ? T[] : never;
type Result = ToArray<string | number>;

const strings: Result = ["а", "б"];
const numbers: Result = [1, 2];
console.log(strings.length, numbers.length);
`,
      raw`// не компілюється: IsString<number> має тип "ні", а не "так"
type IsString<T> = T extends string ? "так" : "ні";
const wrong: IsString<number> = "так";
console.log(wrong);
`,
      raw`function parseValue<T extends string | number>(value: T): T extends string ? number : string {
  return (typeof value === "string" ? Number(value) : String(value)) as T extends string ? number : string;
}

const x = parseValue("42");
const y = parseValue(7);
console.log(x + 1, y.length);
`,
    ],
    note: "<code>T extends U ? X : Y</code> це розгалуження в типах. Для union умова перевіряється по кожному члену окремо. <code>Exclude</code>, <code>Extract</code>, <code>NonNullable</code> побудовані саме так. Усередині функції результат часто доводиться приводити.",
    work: "Умовні типи лежать в основі вбудованих утиліт і бібліотек з точними сигнатурами. У прикладному коді їх використовують рідко й зважено, лише коли тип результату справді залежить від типу вхідних даних.",
    tasks: [
      "Що повертає <code>IsString&lt;number&gt;</code> для типу <code>type IsString&lt;T&gt; = T extends string ? \"так\" : \"ні\"</code>?",
      "Що означає, що умовний тип «розподіляється» по union?",
    ],
  },
  {
    t: "infer: розбір типів",
    ch: "Абстракція: generics і система типів",
    adv: true,
    easy: "infer це «запитай компілятор»: ви описуєте шаблон типу з порожнім місцем, а компілятор сам підставляє туди знайдену частину, наприклад тип елемента масиву чи результат функції.",
    p: [
      "Усередині умовного типу можна оголосити нову змінну типу ключовим словом <code>infer</code>. Вона працює як «дірка» в шаблоні: компілятор порівнює тип зі шаблоном і те, що потрапило в «дірку», дає вам під назвою, яку ви вказали. Приклад: <code>type ElementOf&lt;T&gt; = T extends (infer U)[] ? U : never</code> повертає тип елементів масиву: для <code>string[]</code> результат <code>string</code>.",
      "Найвідоміший приклад це вбудований <code>ReturnType</code>. Його можна записати самому: <code>type ReturnOf&lt;T&gt; = T extends (...args: never[]) =&gt; infer R ? R : never</code>. Шаблон описує будь-яку функцію, а <code>infer R</code> захоплює її тип результату. Параметри позначено як <code>never[]</code>, щоб підійшла функція з будь-якими аргументами. Так само влаштований <code>Parameters&lt;F&gt;</code>, що витягує кортеж типів аргументів.",
      "Можна витягувати частини з кортежів: <code>type Head&lt;T extends unknown[]&gt; = T extends [infer H, ...unknown[]] ? H : never</code> повертає тип першого елемента. Аналогічно <code>Tail</code> повертає решту. Це дозволяє працювати з типами кортежів так, як ви працюєте зі значеннями: брати голову, хвіст, розгортати. Складні типи для бібліотек часто будуються рекурсивно саме з таких шматків.",
      "Ще один популярний варіант: <b>розпакування</b> обгорток. <code>type Unwrap&lt;T&gt; = T extends Promise&lt;infer U&gt; ? U : T</code> дає тип значення всередині <code>Promise</code>, а для звичайного типу повертає його самого. Вбудований <code>Awaited</code> робить це ще ґрунтовніше, враховуючи вкладені обіцянки, і ми скористаємося ним у главі про асинхронність.",
      "Одну змінну <code>infer</code> можна оголошувати кілька разів у різних позиціях шаблону, і тоді компілятор визначає її за всіма входженнями. Також можна оголошувати кілька різних змінних в одному шаблоні: <code>T extends (a: infer A, b: infer B) =&gt; unknown</code>. Якщо шаблон не збігся, умовний тип обирає другу гілку, зазвичай <code>never</code>, тож нерозпізнані типи просто відкидаються.",
      "Практичні поради. Давайте змінним <code>infer</code> короткі змістовні імена. Не будуйте величезних шаблонів: якщо опис не вміщається в кілька рядків, його складно перевірити. Перевіряйте результат на простих прикладах прямо в редакторі, наводячи курсор на тип. А головне, пам'ятайте, що <code>infer</code> стосується лише типів; жодних значень він не витягує під час виконання.",
      "Для звичайного прикладного коду вам рідко потрібно писати власний <code>infer</code>: готових <code>ReturnType</code>, <code>Parameters</code>, <code>Awaited</code> і <code>NonNullable</code> зазвичай вистачає. Але знання принципу допомагає читати типи бібліотек і розуміти повідомлення про помилки. До того ж, це гарний приклад того, наскільки виразною є система типів TypeScript: вона вміє міркувати про самі типи.",
    ],
    code: [
      raw`type ElementOf<T> = T extends (infer U)[] ? U : never;
type ReturnOf<T> = T extends (...args: never[]) => infer R ? R : never;
type FirstArg<T> = T extends (first: infer A, ...rest: never[]) => unknown ? A : never;

function makeUser(id: number, name: string) {
  return { id, name };
}

const letter: ElementOf<string[]> = "а";
const user: ReturnOf<typeof makeUser> = { id: 1, name: "Оля" };
const arg: FirstArg<typeof makeUser> = 5;
console.log(letter, user.name, arg);
`,
      raw`function makeUser(id: number, name: string) {
  return { id, name };
}

type Params = Parameters<typeof makeUser>;
const args: Params = [1, "Оля"];
const created: ReturnType<typeof makeUser> = makeUser(...args);
console.log(args.length, created.name);
`,
      raw`// не компілюється: ElementOf<string[]> це string, число сюди не підходить
type ElementOf<T> = T extends (infer U)[] ? U : never;
const wrong: ElementOf<string[]> = 5;
console.log(wrong);
`,
      raw`type Head<T extends unknown[]> = T extends [infer H, ...unknown[]] ? H : never;
type Tail<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : never;

const head: Head<[string, number, boolean]> = "перший";
const tail: Tail<[string, number, boolean]> = [1, true];
console.log(head, tail);
`,
    ],
    note: "<code>infer U</code> усередині умовного типу «захоплює» частину типу, що збіглася зі шаблоном. Так записані <code>ReturnType</code>, <code>Parameters</code>, <code>Awaited</code>. Якщо шаблон не збігся, умовний тип обирає другу гілку.",
    work: "Розбір типів потрібен авторам бібліотек і складних узагальнень. У прикладному коді вистачає готових <code>ReturnType</code>, <code>Parameters</code> та <code>Awaited</code>, а знання <code>infer</code> допомагає читати чужі типи й повідомлення про помилки.",
    tasks: [
      "Що робить <code>infer R</code> у записі <code>T extends (...args: never[]) =&gt; infer R ? R : never</code>?",
      "Як за допомогою <code>infer</code> витягнути тип першого елемента кортежу?",
    ],
  },
  {
    t: "Шаблонні літеральні типи",
    ch: "Абстракція: generics і система типів",
    adv: true,
    easy: "Шаблонний літеральний тип складає нові рядкові типи з частин, як конструктор слів із готових шматків: з «on» і «Click» виходить «onClick», і компілятор знає всі допустимі комбінації.",
    p: [
      "У рядкових літеральних типах можна використовувати той самий синтаксис, що й у шаблонних рядків: <code>type Greeting = `Привіт, ${string}`</code> описує будь-який рядок, що починається зі «Привіт, ». Усередині <code>${}</code> стоїть тип: <code>string</code>, <code>number</code> або union літералів. Це дозволяє точно описувати формат рядків, які раніше доводилося позначати просто як <code>string</code>.",
      "Якщо в шаблоні стоять union, результатом буде union усіх комбінацій: <code>type Corner = `${Side}-${\"left\" | \"right\"}`</code> для <code>Side = \"top\" | \"bottom\"</code> дає чотири значення: <code>\"top-left\"</code>, <code>\"top-right\"</code>, <code>\"bottom-left\"</code>, <code>\"bottom-right\"</code>. Компілятор сам складає декартів добуток, і ви не пишете всі варіанти вручну. Значення поза списком, як <code>\"middle-left\"</code>, відхиляється.",
      "Є вбудовані перетворювачі регістру: <code>Uppercase&lt;T&gt;</code>, <code>Lowercase&lt;T&gt;</code>, <code>Capitalize&lt;T&gt;</code> (перша літера велика) та <code>Uncapitalize&lt;T&gt;</code>. Разом із шаблонами вони дозволяють будувати імена подій і методів: <code>type EventName&lt;T extends string&gt; = `on${Capitalize&lt;T&gt;}`</code> для <code>\"click\"</code> дає <code>\"onClick\"</code>. Це популярний прийом у бібліотеках для типізації обробників.",
      "Найпотужніше застосування це <b>перейменування ключів</b> у відображених типах за допомогою <code>as</code>: <code>{ [K in keyof T as `get${Capitalize&lt;K &amp; string&gt;}`]: () =&gt; T[K] }</code>. Для <code>{ name: string; age: number }</code> вийде тип з методами <code>getName</code> та <code>getAge</code>. Конструкція <code>K &amp; string</code> потрібна, бо ключі можуть бути й не рядками, а <code>Capitalize</code> приймає тільки рядки.",
      "З умовними типами та <code>infer</code> шаблони дозволяють навіть розбирати рядки на рівні типів: <code>type Parts&lt;T extends string&gt; = T extends `${infer Head}-${infer Tail}` ? [Head, Tail] : [T]</code> розбиває <code>\"uk-UA\"</code> на кортеж <code>[\"uk\", \"UA\"]</code>. Це цікава можливість, яку використовують для типобезпечних маршрутів і форматів, але у щоденному коді вона зустрічається не часто.",
      "Обмеження. Шаблонні типи працюють лише під час компіляції й нічого не перевіряють у реальних рядках, що приходять під час виконання. Рядок із мережі все одно треба перевірити кодом, а тип лише описує очікування. Також надто великі union комбінацій можуть сповільнити компілятор, тож стежте, щоб добуток не став величезним, і розбивайте складні шаблони на частини.",
      "Підсумок: шаблонні літеральні типи роблять рядки «розумними». Імена подій, шляхи, ключі, назви методів перестають бути довільним <code>string</code> і стають перевіреними форматами. Це завершує нашу подорож системою типів: від простих анотацій до типів, що складаються й розбираються самі. Далі ми застосуємо весь цей арсенал, коли говоритимемо про помилки, асинхронність і реальні сервіси.",
    ],
    code: [
      raw`type Side = "top" | "bottom";
type Corner = ${BT}${D}{Side}-${D}{"left" | "right"}${BT};
type EventName<T extends string> = ${BT}on${D}{Capitalize<T>}${BT};

const corner: Corner = "top-left";
const handler: EventName<"click"> = "onClick";
console.log(corner, handler);
`,
      raw`// не компілюється: "middle-left" не входить до допустимих комбінацій
type Side = "top" | "bottom";
type Corner = ${BT}${D}{Side}-${D}{"left" | "right"}${BT};

const corner: Corner = "middle-left";
console.log(corner);
`,
      raw`type Getters<T> = {
  [K in keyof T as ${BT}get${D}{Capitalize<K & string>}${BT}]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

const person: Getters<Person> = { getName: () => "Оля", getAge: () => 29 };
console.log(person.getName(), person.getAge());
`,
      raw`type Parts<T extends string> = T extends ${BT}${D}{infer Head}-${D}{infer Tail}${BT} ? [Head, Tail] : [T];

const parts: Parts<"uk-UA"> = ["uk", "UA"];
const single: Parts<"uk"> = ["uk"];
console.log(parts, single);
`,
    ],
    note: "Шаблонний літеральний тип складає рядкові типи з частин, а union у шаблоні дає усі комбінації. Разом із <code>Capitalize</code> та <code>as</code> у відображеному типі він перейменовує ключі. Типи перевіряють лише код, а не рядки під час виконання.",
    work: "Імена подій, шляхи маршрутів і ключі локалізації мають чітку структуру. Шаблонні типи роблять такі рядки перевіреними й підказують усі допустимі значення в редакторі замість «будь-якого рядка», що зручно для всієї команди.",
    tasks: [
      "Скільки значень має тип <code>`${Side}-${\"left\" | \"right\"}`</code>, якщо <code>Side</code> має два варіанти?",
      "Для чого в перейменуванні ключів потрібен запис <code>K &amp; string</code>?",
    ],
  },
];
