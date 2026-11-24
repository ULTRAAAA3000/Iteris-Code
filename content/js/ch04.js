export const LESSONS_04 = [
  {
    t: "Методи об'єкта і this",
    ch: "Об'єкти й класи",
    easy: "Метод — це функція, що живе всередині об'єкта й працює з його даними. Слово <code>this</code> усередині методу означає «той об'єкт, у якого мене викликали», як слово «тут» залежить від того, де ви стоїте.",
    p: [
      "Коли функція записана в полі об'єкта, її називають методом. Скорочений запис у літералі: <code>const user = { name: \"Оля\", greet() { return \"Привіт, \" + this.name; } };</code>. Виклик <code>user.greet()</code> поверне <code>\"Привіт, Оля\"</code>. Слово <code>this</code> усередині методу вказує на об'єкт, через який метод викликали, тобто на той, що стоїть ліворуч від крапки. Це дозволяє одній функції працювати з даними різних об'єктів: той самий метод у <code>user1</code> і <code>user2</code> побачить різні <code>this.name</code>.",
      "Важливо розуміти: значення <code>this</code> визначається не тим, де функцію написано, а тим, <b>як її викликали</b>. Правил небагато. Виклик через крапку <code>obj.method()</code> дає <code>this === obj</code>. Звичайний виклик <code>fn()</code> у модулі чи строгому режимі дає <code>this === undefined</code>. Виклик через <code>new</code> створює новий об'єкт і робить його <code>this</code>. А явно задати <code>this</code> можна методами <code>call</code>, <code>apply</code> і <code>bind</code>. Стрілкові функції не мають власного <code>this</code> і беруть його із зовнішньої області.",
      "Головна пастка — «втрата <code>this</code>». Якщо витягти метод у змінну й викликати її без об'єкта (<code>const f = user.greet; f();</code>), зв'язок із <code>user</code> зникає, і <code>this</code> стає <code>undefined</code>. Читання <code>this.name</code> тоді падає з <code>TypeError</code>. Те саме відбувається, коли метод передають як колбек: <code>setTimeout(user.greet, 100)</code> чи обробник події втрачають об'єкт. Помилку легко розпізнати за повідомленням «Cannot read properties of undefined».",
      "Є три способи зберегти <code>this</code>. <code>fn.bind(obj)</code> повертає нову функцію, у якої <code>this</code> назавжди дорівнює <code>obj</code>. <code>fn.call(obj, a, b)</code> викликає функцію негайно з указаним <code>this</code> і аргументами через кому, а <code>fn.apply(obj, [a, b])</code> робить те саме, але приймає аргументи масивом. Найпростіший і найчитабельніший спосіб для колбеків — обгорнути виклик стрілкою: <code>setTimeout(() =&gt; user.greet(), 100)</code>, тоді виклик знову йде через крапку.",
      "Стрілкові функції як методи — окрема пастка. Якщо написати <code>{ name: \"Оля\", greet: () =&gt; this.name }</code>, то <code>this</code> усередині стрілки не вказує на об'єкт: літерал об'єкта не створює власної області для <code>this</code>, і стрілка бере його ззовні (у модулі це <code>undefined</code>). Тому методи об'єктів пишуть як звичайні функції або скороченим записом. Навпаки, стрілка всередині методу чудово підходить для колбеків, бо успадковує правильний <code>this</code> від методу.",
      "Методи можуть повертати <code>this</code>, щоб виклики можна було з'єднувати в ланцюжок: <code>calc.add(2).multiply(3).result()</code>. Такий «текучий» (fluent) інтерфейс зустрічається в бібліотеках запитів і будівниках. Метод, що змінює стан і повертає <code>this</code>, пишеться за шаблоном: змінити поле, <code>return this;</code>. Але не робіть так з кожним методом: якщо метод має повертати значення, ланцюжок на ньому завершується.",
      "Загалом, <code>this</code> варто використовувати там, де об'єкт справді має поведінку навколо власних даних. Для простих допоміжних функцій без стану він не потрібен: достатньо параметрів. А розуміючи правило «this залежить від виклику», ви легко розбираєте більшість помилок, пов'язаних з обробниками подій, таймерами та колбеками, які в справжніх застосунках трапляються постійно.",
    ],
    code: [
      String.raw`const user = {
  name: "Оля",
  greet() {
    return "Привіт, " + this.name;
  },
};
const other = { name: "Іван", greet: user.greet };
console.log(user.greet(), other.greet());`,
      String.raw`function describe(city, country) {
  return this.name + ": " + city + ", " + country;
}
const person = { name: "Оля" };
console.log(describe.call(person, "Дніпро", "Україна"));
console.log(describe.apply(person, ["Львів", "Україна"]));
const bound = describe.bind(person, "Київ");
console.log(bound("Україна"));`,
      String.raw`const counter = {
  count: 0,
  inc() {
    this.count++;
    return this;
  },
};
console.log(counter.inc().inc().inc().count);

const tricky = {
  label: "об'єкт",
  arrow: () => typeof this,
  regular() { return typeof this; },
};
console.log(tricky.arrow(), tricky.regular());`,
      String.raw`const timer = {
  seconds: 5,
  start() {
    [1, 2].forEach((step) => {
      console.log(this.seconds - step);   // стрілка бере this методу
    });
  },
};
timer.start();`,
      String.raw`// аварія: метод витягнуто з об'єкта, this став undefined, і читання name дає TypeError
const user = {
  name: "Оля",
  greet() {
    return "Привіт, " + this.name;
  },
};
const greet = user.greet;
console.log(greet());`,
    ],
    note: "<code>this</code> визначається способом виклику: через крапку це об'єкт ліворуч, а без неї <code>undefined</code>. Втрачений <code>this</code> повертають через <code>bind</code>, <code>call</code> чи стрілку-обгортку. Методи об'єкта не пишіть стрілками.",
    work: "Обробники подій і колбеки постійно «гублять» this, тому питання про нього — класика співбесід. Ланцюжкові методи на кшталт builder-ів і запитів до бази бачите щодня у бібліотеках і власних утилітах.",
    tasks: [
      "Від чого залежить значення this і чому після const f = obj.method; f() воно стає undefined?",
      "Чому стрілкова функція не підходить як метод об'єкта, а всередині методу вона зручна?",
    ],
  },
  {
    t: "Прототипи і ланцюжок прототипів",
    ch: "Об'єкти й класи",
    easy: "Прототип — це «запасний ящик» об'єкта: якщо потрібної властивості немає в самому об'єкті, мова шукає її в його прототипі, потім у прототипі прототипа, і так до кінця ланцюжка.",
    p: [
      "Кожен об'єкт у JavaScript має прихований зв'язок з іншим об'єктом, який називають його <b>прототипом</b>. Коли ви читаєте властивість <code>obj.x</code>, рушій шукає її спершу в самому <code>obj</code>. Якщо не знайшов, іде до прототипа, потім до прототипа прототипа, і так по ланцюжку, доки не знайде або не дійде до <code>null</code>: тоді результат <code>undefined</code>. Саме так прості об'єкти отримують методи на кшталт <code>toString</code>, хоч ви їх не писали.",
      "Створити об'єкт із заданим прототипом можна через <code>Object.create(proto)</code>. Прочитати прототип дає <code>Object.getPrototypeOf(obj)</code>. Власна властивість «затіняє» успадковану з тим самим іменем. Перевірити, чи властивість власна, можна через <code>Object.hasOwn(obj, \"x\")</code>, а оператор <code>\"x\" in obj</code> бачить і успадковані. Запис у властивість завжди створює її в самому об'єкті, не змінюючи прототип, тому прототип може бути спільним для багатьох об'єктів.",
      "Звідки беруться прототипи в звичайному коді? Літерал <code>{}</code> має прототип <code>Object.prototype</code>, у ньому живуть <code>toString</code>, <code>hasOwnProperty</code> і інші спільні методи. Масив має ланцюжок <code>масив → Array.prototype → Object.prototype → null</code>, тому в нього є <code>map</code> і <code>push</code>. Функція, у свою чергу, походить від <code>Function.prototype</code>. Ланцюжок прототипів — це і є механізм успадкування в JavaScript, а не копіювання властивостей.",
      "До появи класів об'єкти створювали функціями-конструкторами. Функцію викликають з <code>new</code>: <code>function User(name) { this.name = name; }</code>. Рушій створює порожній об'єкт, прив'язує його прототип до <code>User.prototype</code>, виконує функцію з <code>this</code> на новому об'єкті й повертає його. Спільні методи додають на прототип: <code>User.prototype.greet = function () { ... };</code>. Тоді всі екземпляри ділять одну функцію замість того, щоб мати кожен свою копію.",
      "Оператор <code>instanceof</code> перевіряє, чи є в ланцюжку прототипів об'єкта прототип конструктора: <code>[] instanceof Array</code> істинне, <code>[] instanceof Object</code> теж. Метод <code>proto.isPrototypeOf(obj)</code> робить схожу перевірку. Колись прототип читали через властивість <code>__proto__</code>; вона працює, але вважається застарілою, і краще користуватися <code>Object.getPrototypeOf</code> та <code>Object.setPrototypeOf</code>. Останній повільний і ламає оптимізації, тож у нових програмах його уникають.",
      "Змінювати вбудовані прототипи (наприклад, додавати <code>Array.prototype.last</code>) не варто: це чіпає весь код у програмі, включно з бібліотеками, може конфліктувати з майбутнім стандартом і з'являється у циклі <code>for...in</code>. Таке явище називають «заміною мавп» (monkey patching), і воно безпечне хіба що для поліфілів стандартних можливостей. Цікава протилежність — <code>Object.create(null)</code>: об'єкт без прототипу, у якому немає навіть <code>toString</code>. Його використовують як чистий словник без конфліктів ключів.",
      "Для чого знати це в епоху класів? Тому що <code>class</code> — лише зручний запис того самого механізму: методи класу лежать на прототипі, а <code>extends</code> з'єднує ланцюжки. Коли в консолі ви бачите <code>[[Prototype]]</code>, помилку «is not a function» чи дивну поведінку <code>instanceof</code>, розуміння ланцюжка дає змогу швидко знайти причину. У наступних уроках ми побудуємо класи поверх цієї основи.",
    ],
    code: [
      String.raw`const animal = {
  eats: true,
  describe() {
    return this.name + " їсть: " + this.eats;
  },
};
const dog = Object.create(animal);
dog.name = "Рекс";
console.log(dog.describe(), Object.getPrototypeOf(dog) === animal);
console.log(Object.hasOwn(dog, "name"), Object.hasOwn(dog, "eats"), "eats" in dog);
dog.eats = false;        // затіняє, прототип не змінюється
console.log(dog.eats, animal.eats);`,
      String.raw`function User(name) {
  this.name = name;
}
User.prototype.greet = function () {
  return "Привіт, " + this.name;
};
const a = new User("Оля");
const b = new User("Іван");
console.log(a.greet(), b.greet(), a.greet === b.greet);
console.log(a instanceof User, Object.getPrototypeOf(a) === User.prototype);`,
      String.raw`console.log(Object.getPrototypeOf([]) === Array.prototype);
console.log(Object.getPrototypeOf(Array.prototype) === Object.prototype);
console.log(Object.getPrototypeOf(Object.prototype));
console.log([] instanceof Array, [] instanceof Object, typeof [].map);`,
      String.raw`const dict = Object.create(null);
dict.constructor = "значення";
console.log(dict.constructor, typeof dict.toString);
const normal = {};
console.log(typeof normal.toString, typeof normal.constructor);`,
      String.raw`// аварія: у ланцюжку прототипів немає методу fly, тому виклик undefined дає TypeError
const animal = { eats: true };
const bird = Object.create(animal);
bird.name = "Горобець";
console.log(bird.eats);
bird.fly();`,
    ],
    note: "Пошук властивості йде по ланцюжку прототипів до <code>null</code>, а запис завжди створює власну властивість. <code>class</code> — зручний запис того самого механізму. Вбудовані прототипи не змінюйте.",
    work: "Розуміння прототипів потрібне, коли ви читаєте код старих бібліотек, налагоджуєте «is not a function» чи вивчаєте, чому instanceof дає неочікуваний результат. А об'єкти без прототипу використовують як безпечні словники.",
    tasks: [
      "Як рушій шукає властивість obj.x і чим \"x\" in obj відрізняється від Object.hasOwn(obj, \"x\")?",
      "Що робить new User(\"Оля\") з функцією-конструктором і навіщо методи кладуть на User.prototype?",
    ],
  },
  {
    t: "Класи: constructor і методи",
    ch: "Об'єкти й класи",
    easy: "Клас — це креслення, за яким можна виготовити багато однотипних об'єктів із однаковими даними та діями. Кожен новий предмет створюється командою <code>new</code>, а конструктор встановлює його початковий стан.",
    p: [
      "Клас описується ключовим словом <code>class</code>: <code>class Point { constructor(x, y) { this.x = x; this.y = y; } distance() { return Math.hypot(this.x, this.y); } }</code>. Спеціальний метод <code>constructor</code> викликається один раз під час <code>new Point(3, 4)</code> і наповнює новий об'єкт даними. Решта методів оголошується просто всередині тіла класу, без слова <code>function</code> і без ком між ними. Усе, що всередині класу, працює в строгому режимі автоматично.",
      "Під капотом клас — це надбудова над прототипами з минулого уроку: методи кладуться на <code>Point.prototype</code> і спільні для всіх екземплярів, а <code>typeof Point</code> дає <code>\"function\"</code>. Але правила в нього суворіші, ніж у старого конструктора. Викликати клас без <code>new</code> не можна: це <code>TypeError</code>. Оголошення класу, як і <code>let</code>, перебуває в мертвій зоні до свого рядка, тому створити екземпляр до оголошення не вийде. А методи класу не перелічуються в <code>for...in</code>.",
      "Дані екземпляра можна задавати прямо в тілі класу як <b>поля</b>: <code>class Counter { count = 0; inc() { this.count++; } }</code>. Поле ініціалізується для кожного нового об'єкта перед виконанням конструктора. Це лаконічніше, ніж писати <code>this.count = 0</code> у конструкторі, і добре видно, які дані має об'єкт. Нюанс: поле-стрілка (<code>handle = () =&gt; { ... }</code>) створюється на кожному екземплярі заново, зате не втрачає <code>this</code>, а звичайний метод спільний на прототипі, економить пам'ять, але потребує обережності з <code>this</code>.",
      "Конструктор — добре місце для перевірки вхідних даних: якщо об'єкт не може існувати з неправильними значеннями, кидайте помилку одразу. Наприклад, <code>if (capacity &lt;= 0) throw new RangeError(\"...\");</code>. Тоді решта методів може не сумніватися, що стан коректний. Це називають збереженням інваріантів: клас гарантує, що його об'єкти завжди «правильні». Методи, які змінюють стан, пишіть так, щоб він лишався коректним після будь-якого виклику.",
      "Корисно знати кілька властивостей екземплярів. <code>obj instanceof Point</code> перевіряє приналежність, <code>obj.constructor.name</code> дає ім'я класу, <code>JSON.stringify(obj)</code> виводить власні поля (не методи). Метод <code>toString()</code> керує текстовим поданням у шаблонних рядках, а <code>toJSON()</code> — вигляд у JSON. Є й клас-вираз: <code>const Box = class { ... };</code>. Класи можна повертати з функцій і передавати як значення, як і будь-які інші.",
      "Класичний навчальний приклад — структура даних «стек»: останній поклав, перший забрав. Клас <code>Stack</code> тримає масив у полі, а методи <code>push</code>, <code>pop</code>, <code>peek</code> та властивість <code>size</code> надають акуратний інтерфейс, ховаючи подробиці зберігання. Користувач класу не думає про масив, а лише про дії зі стеком. Так працює абстракція: інтерфейс стабільний, а реалізацію можна змінити, не зачіпаючи решти програми.",
      "Чи завжди потрібні класи? Ні. Якщо вам потрібна одна функція без стану, пишіть функцію. Якщо потрібна проста «картка» з даними, досить літерала об'єкта. Класи доречні, коли є кілька однотипних об'єктів із власним станом і поведінкою, які треба створювати багаторазово: акаунти, фігури, з'єднання, черги. Вибирайте найпростіший інструмент, який розв'язує задачу.",
    ],
    code: [
      String.raw`class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  distance() {
    return Math.hypot(this.x, this.y);
  }
  toString() {
    return "(" + this.x + ", " + this.y + ")";
  }
}
const p = new Point(3, 4);
console.log(p.distance(), String(p), p);`,
      String.raw`class Counter {
  count = 0;
  step = 1;
  inc() {
    this.count += this.step;
    return this;
  }
}
const c = new Counter();
console.log(c.inc().inc().count, Object.keys(c));
console.log(typeof Counter, c instanceof Counter, c.constructor.name);`,
      String.raw`class Stack {
  items = [];
  push(item) {
    this.items.push(item);
    return this;
  }
  pop() {
    return this.items.pop();
  }
  peek() {
    return this.items.at(-1);
  }
  get size() {
    return this.items.length;
  }
}
const s = new Stack().push(1).push(2);
console.log(s.pop(), s.peek(), s.size);`,
      String.raw`class Box {
  constructor(capacity) {
    if (!(capacity > 0)) throw new RangeError("Ємність має бути додатною");
    this.capacity = capacity;
  }
}
try {
  new Box(0);
} catch (error) {
  console.log(error.name, error.message);
}
console.log(JSON.stringify(new Box(5)));`,
      String.raw`// аварія: клас не можна викликати без new, і рушій кидає TypeError
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
const p = Point(1, 2);
console.log(p);`,
    ],
    note: "Клас викликають лише через <code>new</code>, конструктор наповнює новий об'єкт, а методи спільні на прототипі. Перевіряйте дані в конструкторі, щоб об'єкт завжди був коректним. Не робіть клас там, де вистачає функції чи літерала.",
    work: "Класи моделюють акаунти, замовлення, з'єднання з базою, ігрових персонажів і стани інтерфейсу. Структури на кшталт стеку, черги чи кешу майже завжди пишуть як класи, ховаючи внутрішній масив за простим інтерфейсом.",
    tasks: [
      "Що відбувається під час new Point(3, 4) і чому метод distance не копіюється в кожен екземпляр?",
      "Чому в конструкторі варто перевіряти вхідні значення й що станеться, якщо викликати клас без new?",
    ],
  },
  {
    t: "Приватні поля й статичні члени",
    ch: "Об'єкти й класи",
    easy: "Приватне поле — це шухляда, відкрити яку може лише сам об'єкт зсередини. Статичний член, навпаки, належить не окремому об'єкту, а всьому класу, як табличка з правилами на дверях фабрики.",
    p: [
      "Назва, що починається з <code>#</code>, оголошує <b>приватне</b> поле чи метод: <code>class Account { #balance = 0; deposit(n) { this.#balance += n; } }</code>. Доступ до <code>#balance</code> можливий лише в тілі класу. Спроба прочитати <code>account.#balance</code> ззовні — не просто <code>undefined</code>, а синтаксична помилка ще до запуску програми. Приватні поля не видно в <code>Object.keys</code>, у <code>JSON.stringify</code> і навіть у циклах, тому з-поза класу їх неможливо ні прочитати, ні підмінити.",
      "Навіщо ховати дані? Щоб захистити коректність стану. Якщо баланс — звичайне поле, будь-хто може записати в нього <code>-1000</code> чи рядок. Коли поле приватне, змінити його можна лише через методи класу, які перевіряють правила: <code>deposit</code> відмовить у від'ємній сумі, <code>withdraw</code> не дозволить піти в мінус. Раніше цього домагалися домовленістю (назви з підкресленням <code>_balance</code>), але вона нічого не гарантувала. Приватні поля — це гарантія на рівні мови.",
      "Приватними можуть бути й методи (<code>#validate() { ... }</code>), і навіть геттери та сеттери. Усередині класу перевірити, чи об'єкт створено цим класом, можна записом <code>#balance in obj</code>: він повертає <code>true</code>, якщо в <code>obj</code> є це приватне поле. Підклас <b>не</b> бачить приватних полів батька: вони належать саме тому класу, де оголошені. Це свідоме обмеження, яке запобігає залежності підкласів від внутрішніх подробиць.",
      "Статичні члени оголошують словом <code>static</code> і викликають через сам клас: <code>class Id { static next = 1; static create() { return Id.next++; } }</code>, далі <code>Id.create()</code>. На екземплярах їх немає. Статичні методи годяться для допоміжних функцій, пов'язаних із класом, і для «фабрик»: <code>User.fromJSON(text)</code> створює об'єкт зі строкового запису. Усередині статичного методу <code>this</code> вказує на сам клас. Статичні поля зручні для лічильників і спільних налаштувань.",
      "Є й статичні блоки <code>static { ... }</code>, які виконуються один раз під час створення класу і дають змогу складніше ініціалізувати статичні дані. Статичні члени успадковуються підкласами, тож <code>class Admin extends User</code> матиме й <code>Admin.fromJSON</code>. Проте будьте обережні зі спільним змінним станом у статичних полях: це по суті глобальна змінна, і тести можуть взаємно впливати одне на одне. Для даних кожного об'єкта статичні поля не підходять.",
      "Помилки з приватністю бувають двох видів. Звернення до необ'явленого приватного імені (<code>this.#missing</code>) — синтаксична помилка, яка не дає програмі навіть запуститись. Звернення до приватного поля об'єкта, у якого його немає (наприклад, чужий клас), дає <code>TypeError</code> під час виконання. Старішу приватність через замикання та <code>WeakMap</code> ви могли бачити в давньому коді, але нові проєкти використовують <code>#</code>.",
      "Підсумуйте для себе: усе, що не є частиною публічного інтерфейсу, робіть приватним. Публічними лишайте тільки методи, потрібні користувачам класу. Чим менший відкритий «обсяг» класу, тим легше змінювати його всередині, не ламаючи решту програми. Це основа інкапсуляції, однієї з ключових ідей об'єктно-орієнтованого програмування, і саме її ви застосуєте в практичному завданні з банківським рахунком.",
    ],
    code: [
      String.raw`class Account {
  #balance = 0;
  deposit(amount) {
    if (amount <= 0) throw new RangeError("Сума має бути додатною");
    this.#balance += amount;
    return this;
  }
  get balance() {
    return this.#balance;
  }
}
const acc = new Account().deposit(100).deposit(50);
console.log(acc.balance, Object.keys(acc), JSON.stringify(acc));`,
      String.raw`class Id {
  static next = 1;
  static create() {
    return "id-" + Id.next++;
  }
}
console.log(Id.create(), Id.create(), Id.next);
const instance = new Id();
console.log(instance.next, typeof instance.create);

class User {
  constructor(name) { this.name = name; }
  static fromJSON(text) {
    return new User(JSON.parse(text).name);
  }
}
console.log(User.fromJSON('{"name":"Оля"}'));`,
      String.raw`class Secret {
  #value = 42;
  #double() {
    return this.#value * 2;
  }
  reveal() {
    return this.#double();
  }
  static isSecret(obj) {
    return #value in obj;
  }
}
const s = new Secret();
console.log(s.reveal(), Secret.isSecret(s), Secret.isSecret({}));`,
      String.raw`class Config {
  static defaults;
  static {
    Config.defaults = { theme: "light", lang: "uk" };
  }
}
console.log(Config.defaults);
class A { #x = 1; static read(o) { return o.#x; } }
try {
  A.read({});
} catch (error) {
  console.log(error.name);
}`,
      String.raw`// не компілюється: приватне поле #secret не можна читати поза тілом класу, це помилка синтаксису
class Safe {
  #secret = 1;
}
const safe = new Safe();
console.log(safe.#secret);`,
    ],
    note: "Приватне поле <code>#name</code> видно лише всередині класу, а ззовні це помилка синтаксису. Підкласи не бачать приватних полів батька. <code>static</code>-члени належать класу, а не екземплярам, і викликаються через ім'я класу.",
    work: "Приховування внутрішнього стану захищає інваріанти: баланс не стане від'ємним, токен не витече в JSON. Статичні фабрики на кшталт <code>User.fromJSON</code> та лічильники ідентифікаторів зустрічаються в моделях даних і бібліотеках.",
    tasks: [
      "Що станеться, якщо спробувати прочитати приватне поле #x поза класом і чим це відрізняється від поля з підкресленням?",
      "Чим статичний метод відрізняється від звичайного і на що вказує this у статичному методі?",
    ],
  },
  {
    t: "Наслідування: extends і super",
    ch: "Об'єкти й класи",
    easy: "Наслідування дозволяє створити клас на основі іншого: новий успадковує все вміння батьківського й додає власне. Слово <code>super</code> звертається до батька, щоб скористатися його можливостями й не переписувати їх.",
    p: [
      "Ключове слово <code>extends</code> робить один клас нащадком іншого: <code>class Dog extends Animal { ... }</code>. Підклас отримує всі методи й поля батьківського класу, а також може додати нові чи змінити старі. Під капотом прототип <code>Dog.prototype</code> посилається на <code>Animal.prototype</code>, тож пошук методу піднімається по ланцюжку, як ви бачили в уроці про прототипи. Екземпляр <code>Dog</code> водночас є й <code>Animal</code>: <code>dog instanceof Animal</code> істинне.",
      "Конструктор нащадка зобов'язаний викликати <code>super(...)</code> перед першим використанням <code>this</code>. Саме <code>super</code> запускає конструктор батька й створює об'єкт. Якщо в підкласі зовсім немає конструктора, рушій додає його сам і передає всі аргументи батьківському. Але коли ви пишете власний конструктор і забули <code>super()</code>, звернення до <code>this</code> закінчиться <code>ReferenceError: Must call super constructor in derived class before accessing 'this'</code>.",
      "Метод у підкласі, що має те саме ім'я, <b>перевизначає</b> батьківський: викликається саме він. Щоб додати до батьківської поведінки своє, а не замінити її, у перевизначеному методі викликають <code>super.method()</code>. Приклад: батьківський <code>describe()</code> повертає загальний опис, а в нащадка пишуть <code>super.describe() + \" і гавкає\"</code>. Також <code>super</code> працює у статичних методах і в літералах об'єктів через властивість <code>__proto__</code>, але найчастіше його бачать саме в класах.",
      "Перевизначення дає <b>поліморфізм</b>: код працює з набором різних об'єктів через однаковий інтерфейс, не знаючи їхніх точних типів. Список фігур, кожна з яких має метод <code>area()</code>, можна пройти одним циклом: <code>for (const s of shapes) total += s.area();</code>. Кожна фігура порахує площу по-своєму. Додавши новий тип фігури, ви не змінюєте цикл: система розширюється без переписування.",
      "Іноді батьківський клас має бути лише основою, не придатною для створення об'єктів. У JavaScript немає ключового слова <code>abstract</code>, але абстрактність можна змоделювати: у конструкторі перевірити <code>new.target</code> (клас, який викликали через <code>new</code>) і кинути помилку, якщо це базовий клас. Також у базовому методі пишуть <code>throw new Error(\"не реалізовано\")</code>, щоб нащадок не забув його перевизначити.",
      "Розширювати можна і вбудовані класи: <code>class MyError extends Error</code> — основа власних типів помилок, про які ми ще поговоримо, а <code>class Stack extends Array</code> створює масив із додатковими методами. Підкласи вбудованих типів працюють коректно, але деякі методи (<code>map</code>, <code>filter</code>) повертатимуть екземпляри підкласу, що іноді несподівано. Використовуйте це обережно й перевіряйте поведінку на прикладі.",
      "Наслідування — потужний, але небезпечний інструмент. Глибокі ієрархії важко розуміти: зміна в корені несподівано ламає нащадків (проблема «крихкого базового класу»). Відносини «є різновидом» (is-a) відповідають наслідуванню, а «має» (has-a) краще виражати вкладенням об'єкта, про що йтиме мова в одному з наступних уроків. Тримайте ієрархії неглибокими, а загальну поведінку виносьте у прості функції та компоненти.",
    ],
    code: [
      String.raw`class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return this.name + " видає звук";
  }
}
class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  speak() {
    return super.speak() + ": гав!";
  }
}
const d = new Dog("Рекс", "вівчарка");
console.log(d.speak(), d instanceof Animal, d.breed);`,
      String.raw`class Shape {
  area() {
    throw new Error("не реалізовано");
  }
}
class Square extends Shape {
  constructor(side) { super(); this.side = side; }
  area() { return this.side ** 2; }
}
class Circle extends Shape {
  constructor(r) { super(); this.r = r; }
  area() { return Math.PI * this.r ** 2; }
}
const shapes = [new Square(2), new Circle(1)];
console.log(shapes.map((s) => s.area().toFixed(2)));`,
      String.raw`class Base {
  constructor() {
    if (new.target === Base) throw new TypeError("Base абстрактний");
  }
}
class Child extends Base {}
console.log(new Child() instanceof Base);
try {
  new Base();
} catch (error) {
  console.log(error.message);
}`,
      String.raw`class Stack extends Array {
  peek() {
    return this.at(-1);
  }
}
const s = new Stack();
s.push(1, 2, 3);
console.log(s.peek(), s.length, s instanceof Array, Array.isArray(s));`,
      String.raw`// аварія: у конструкторі нащадка забули super(), і звернення до this дає ReferenceError
class Animal {
  constructor(name) {
    this.name = name;
  }
}
class Cat extends Animal {
  constructor(name) {
    this.lives = 9;
    super(name);
  }
}
console.log(new Cat("Мурка"));`,
    ],
    note: "У конструкторі нащадка спершу викликайте <code>super(...)</code>, а вже потім звертайтеся до <code>this</code>. <code>super.method()</code> додає до батьківської поведінки свою. Наслідування передає «є різновидом», тож не будуйте глибоких ієрархій.",
    work: "Ієрархії виду «базова фігура → прямокутник, коло» чи «помилка → власні типи помилок» трапляються у всіх мовах. Поліморфізм дозволяє додавати нові типи (платіжні системи, формати експорту), не переписуючи код, який з ними працює.",
    tasks: [
      "Чому в конструкторі нащадка треба викликати super() до звернення до this і що буде, якщо забути?",
      "Як викликати перевизначений батьківський метод із підкласу і навіщо це потрібно?",
    ],
  },
  {
    t: "Геттери, сеттери і defineProperty",
    ch: "Об'єкти й класи",
    easy: "Геттер і сеттер — це функції, які прикидаються звичайним полем: ззовні ви пишете <code>obj.age</code>, а всередині виконується код, що може обчислити значення або перевірити його перед записом.",
    p: [
      "Геттер оголошують словом <code>get</code>, сеттер — <code>set</code>. У літералі: <code>{ firstName: \"Оля\", lastName: \"Коваль\", get fullName() { return this.firstName + \" \" + this.lastName; } }</code>. Тепер <code>user.fullName</code> читається як звичайна властивість, без дужок виклику, але значення щоразу обчислюється заново. Сеттер приймає присвоєне значення: <code>set fullName(value) { [this.firstName, this.lastName] = value.split(\" \"); }</code>, і запис <code>user.fullName = \"Іван Мельник\"</code> оновлює обидва поля.",
      "У класах геттери та сеттери записують так само, і вони живуть на прототипі. Типова схема: поле приватне (<code>#age</code>), а доступ відбувається через пару <code>get age()</code> та <code>set age(value)</code>. У сеттері перевіряють значення й кидають помилку на неправильному вході: <code>if (value &lt; 0) throw new RangeError(...)</code>. Так користувач класу працює зі звичайним на вигляд полем, а клас сам стежить за правильністю даних.",
      "Якщо в пари немає сеттера, присвоєння властивості в строгому режимі закінчується <code>TypeError: Cannot set property ... which has only a getter</code>. Це зручний спосіб зробити властивість «лише для читання». Відсутність геттера, навпаки, дає <code>undefined</code> під час читання. Усередині сеттера не записуйте значення у властивість з тим самим іменем: <code>set age(v) { this.age = v; }</code> викликає сам себе, доки не переповниться стек. Для зберігання беріть окреме поле (<code>#age</code> або <code>_age</code>).",
      "Геттери й сеттери — окремий випадок <b>дескрипторів властивостей</b>. Кожна властивість об'єкта має опис: <code>value</code>, <code>writable</code> (можна змінювати), <code>enumerable</code> (видно в перебірах і JSON), <code>configurable</code> (можна видалити чи переналаштувати), або пару <code>get</code> та <code>set</code>. Звичайна властивість має всі прапорці <code>true</code>. Прочитати дескриптор допомагає <code>Object.getOwnPropertyDescriptor(obj, \"x\")</code>, а задати — <code>Object.defineProperty</code>.",
      "<code>Object.defineProperty(obj, \"id\", { value: 7, writable: false, enumerable: false })</code> створює властивість, яку не можна змінити й не видно в <code>Object.keys</code>. Важливо: коли властивість створюють через <code>defineProperty</code>, усі прапорці за замовчуванням <code>false</code>, на відміну від звичайного присвоєння. Для кількох властивостей відразу є <code>Object.defineProperties</code>. На цій основі працюють <code>Object.freeze</code> (знімає <code>writable</code> і <code>configurable</code>) та приховані службові поля бібліотек.",
      "Не зловживайте геттерами. Вони виглядають як звичайне поле, тому читач очікує швидкого доступу, а якщо всередині важкі обчислення чи запит, це перетворюється на сюрприз. Для довгих дій краще явний метод (<code>calculateTotal()</code>), а геттер залишайте для легких похідних значень. Також пам'ятайте про JSON: геттери з прототипу класу в <code>JSON.stringify</code> не потрапляють, а власні accessor-властивості самого об'єкта потрапляють як звичайні значення.",
      "Практична користь від усього цього така. Похідні значення (повне ім'я, площа, форматована ціна) обчислюються на льоту і не розходяться з основними даними. Валідація працює однаково для будь-якого коду, що змінює об'єкт. А опис через дескриптори дозволяє тонко налаштувати, що видно назовні, а що ні. У завданні нижче ви напишете клас температури з двома взаємопов'язаними властивостями: градусами за Цельсієм і за Фаренгейтом.",
    ],
    code: [
      String.raw`const user = {
  firstName: "Оля",
  lastName: "Коваль",
  get fullName() {
    return this.firstName + " " + this.lastName;
  },
  set fullName(value) {
    [this.firstName, this.lastName] = value.split(" ");
  },
};
console.log(user.fullName);
user.fullName = "Іван Мельник";
console.log(user.firstName, user.lastName);`,
      String.raw`class Person {
  #age = 0;
  get age() {
    return this.#age;
  }
  set age(value) {
    if (!Number.isInteger(value) || value < 0) throw new RangeError("Некоректний вік");
    this.#age = value;
  }
}
const p = new Person();
p.age = 17;
console.log(p.age);
try { p.age = -5; } catch (e) { console.log(e.name, e.message); }`,
      String.raw`const obj = {};
Object.defineProperty(obj, "id", { value: 7, enumerable: false });
obj.name = "Оля";
console.log(obj.id, Object.keys(obj), JSON.stringify(obj));
console.log(Object.getOwnPropertyDescriptor(obj, "id"));
console.log(Object.getOwnPropertyDescriptor(obj, "name"));`,
      String.raw`const point = { x: 1 };
Object.defineProperty(point, "y", { get() { return this.x * 2; }, enumerable: true });
console.log(point.y, Object.keys(point));
class Rect {
  constructor(w, h) { this.w = w; this.h = h; }
  get area() { return this.w * this.h; }
}
console.log(new Rect(2, 3).area, JSON.stringify(new Rect(2, 3)));`,
      String.raw`// аварія: у властивості є лише геттер, а присвоєння в строгому режимі кидає TypeError
const circle = {
  radius: 2,
  get diameter() {
    return this.radius * 2;
  },
};
console.log(circle.diameter);
circle.diameter = 10;`,
    ],
    note: "Геттер читається як поле, сеттер перевіряє записуване значення. Властивість лише з геттером у строгому режимі не можна присвоїти. Через <code>defineProperty</code> прапорці за замовчуванням <code>false</code>, а в сеттері зберігайте дані в окремому полі.",
    work: "Похідні значення (повне ім'я, сума замовлення), валідація даних у моделях і приховані службові поля бібліотек працюють на геттерах, сеттерах і дескрипторах. Фреймворки реактивності теж часто відстежують зміни через них.",
    tasks: [
      "Навіщо в класі роблять поле приватним і відкривають його через пару get/set та що буде, якщо сеттер присвоює значення властивості з тим самим іменем?",
      "Чим defineProperty відрізняється від звичайного присвоєння щодо прапорців writable і enumerable?",
    ],
  },
  {
    t: "Посилання і копії: що бачить функція",
    ch: "Об'єкти й класи",
    easy: "Коли ви передаєте об'єкт у функцію, вона отримує не копію, а ключ від того самого сейфа. Тому вона може змінити вміст, але підмінити сам сейф у вас на столі вже не здатна.",
    p: [
      "Коли ви викликаєте функцію, аргументи копіюються у параметри. Для примітивів копіюється саме значення, тому зміна параметра ніяк не впливає на змінну ззовні. Для об'єктів, масивів і функцій копіюється <b>посилання</b>: параметр і зовнішня змінна вказують на один об'єкт. Цю схему іноді називають «передача за поширенням» (call by sharing): не за значенням і не за посиланням у класичному розумінні, а щось посередині.",
      "Звідси два різних наслідки. Якщо функція <b>змінює</b> об'єкт (<code>user.name = \"X\"</code>, <code>list.push(1)</code>), зміна видна ззовні, бо об'єкт один. Якщо ж функція <b>переприсвоює</b> параметр (<code>user = { name: \"X\" }</code>), вона лише перенаправляє свою локальну змінну на інший об'єкт, а зовнішня змінна лишається як була. Розрізняйте ці дві дії: змінити вміст і замінити саму змінну. Найчастіше неприємності виникають із першої, коли функція непомітно псує чужі дані.",
      "Функція, яка змінює вхідні дані або будь-що поза собою, має <b>побічні ефекти</b>. Іноді вони потрібні (сортування на місці, оновлення бази), але в загальному випадку краще писати чисті функції: брати значення, повертати нові, не чіпати аргументи. Тоді викликаючий код не дивується, а функцію легко тестувати. Якщо ви все ж мусите змінювати, добре це документувати й називати відповідно (<code>sortInPlace</code>, <code>mutateUser</code>).",
      "Захисне копіювання — прийом, коли клас або функція копіює дані на вході та виході. Приклад: клас <code>Team</code> зберігає масив гравців. Якщо метод <code>get players()</code> повертає внутрішній масив, зовнішній код може його змінити й порушити інваріанти. Правильно повертати копію: <code>return [...this.#players];</code>. Так само в конструкторі: <code>this.#players = [...players]</code>, щоб подальші зміни переданого масиву не зачіпали об'єкт.",
      "Рівність об'єктів — теж про посилання. Оператор <code>===</code> порівнює їх за ідентичністю, тож два окремо створені об'єкти з однаковим вмістом не рівні. Для порівняння за змістом пишуть функцію глибокого порівняння: примітиви порівнюють <code>Object.is</code>, масиви й об'єкти рекурсивно, поле за полем. Її ви напишете в практичному завданні. Порівняння через <code>JSON.stringify</code> ненадійне: воно залежить від порядку ключів і губить <code>undefined</code>, дати й <code>NaN</code>.",
      "Посилання проявляються й у неочевидних місцях. Масив, створений як <code>new Array(3).fill({})</code>, містить три посилання на один об'єкт. Об'єкт, збережений у <code>Map</code> як значення, лишається спільним з тими, хто його створив. Значення за замовчуванням <code>function f(opts = {})</code> створюється заново кожного разу, але якщо передати ззовні один спільний об'єкт, його змінить будь-яка функція. Для «шарів» у стані застосунку це означає: ніколи не змінюйте те, що вам не належить.",
      "Практичні правила. Не змінюйте аргументи без явної необхідності. Копіюйте на межах: що приймаєте й що віддаєте. Для підсилення гарантій заморожуйте дані через <code>Object.freeze</code>: спроба змінити їх у строгому режимі закінчиться помилкою, і баг стане видно одразу. А коли дані мають бути справді незмінними, використовуйте стиль оновлення «створити нову версію», який ми розглядали раніше.",
    ],
    code: [
      String.raw`function mutate(user) {
  user.name = "Змінено";     // змінює спільний об'єкт
}
function reassign(user) {
  user = { name: "Новий" };  // лише локальна змінна
}
const person = { name: "Оля" };
mutate(person);
console.log(person.name);
person.name = "Оля";
reassign(person);
console.log(person.name);`,
      String.raw`class Team {
  #players;
  constructor(players) {
    this.#players = [...players];     // захисна копія на вході
  }
  get players() {
    return [...this.#players];        // і на виході
  }
}
const source = ["Оля", "Іван"];
const team = new Team(source);
source.push("Хтось");
team.players.push("Інший");
console.log(team.players);`,
      String.raw`function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
}
console.log({ a: 1 } === { a: 1 }, deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] }));
console.log(deepEqual({ a: 1 }, { a: 2 }), deepEqual(NaN, NaN));`,
      String.raw`const shared = new Array(3).fill({ n: 0 });
shared[0].n = 5;
console.log(shared);
const separate = Array.from({ length: 3 }, () => ({ n: 0 }));
separate[0].n = 5;
console.log(separate);
console.log(JSON.stringify({ a: 1, b: 2 }) === JSON.stringify({ b: 2, a: 1 }));`,
      String.raw`// аварія: функція намагається змінити заморожений об'єкт, і в строгому режимі це TypeError
function rename(user) {
  user.name = "Інше";
}
const user = Object.freeze({ name: "Оля" });
rename(user);
console.log(user.name);`,
    ],
    note: "Функція отримує посилання на той самий об'єкт: змінити вміст можна, а підмінити зовнішню змінну ні. Копіюйте дані на вході та виході класу, не змінюйте чужі аргументи, а <code>===</code> для об'єктів порівнює ідентичність.",
    work: "Баги на кшталт «функція зіпсувала мої дані» чи «список у стані змінився сам» зводяться до спільних посилань. Захисні копії, чисті функції та глибоке порівняння — щоденні інструменти надійного коду.",
    tasks: [
      "Чому функція може змінити об'єкт, переданий у параметр, але не може замінити зовнішню змінну на інший об'єкт?",
      "Що таке захисне копіювання і чому геттер, який повертає внутрішній масив напряму, небезпечний?",
    ],
  },
  {
    t: "Фабрики й композиція замість наслідування",
    ch: "Об'єкти й класи",
    adv: true,
    easy: "Замість того щоб виводити новий об'єкт зі «спадку», його можна зібрати з готових умінь, як конструктор із деталей. Фабрика — це функція-майстерня, що випускає такі об'єкти без жодного <code>new</code>.",
    p: [
      "Фабрична функція створює й повертає об'єкт, не вимагаючи <code>new</code> і класів: <code>function createCounter(start = 0) { let value = start; return { inc() { return ++value; }, get() { return value; } }; }</code>. Стан <code>value</code> прихований у замиканні, і ззовні його не змінити: це справжня приватність без <code>#</code>. Кожен виклик фабрики створює новий незалежний об'єкт. Фабрики прості, не мають проблем із <code>this</code> і легко розширюються.",
      "Обмін на цю простоту — пам'ять і ідентичність. У фабриці кожен об'єкт тримає власні копії функцій, а в класі методи спільні на прототипі, тож для сотень тисяч екземплярів клас економніший. Також <code>instanceof</code> із фабричними об'єктами не працює: вони просто об'єкти. Для більшості застосунків ці відмінності несуттєві, і вибір диктує зручність: фабрики добре підходять для невеликих об'єктів із прихованим станом, класи — для великої кількості екземплярів із однаковою поведінкою.",
      "<b>Композиція</b> — це збирання об'єкта з незалежних уміщень. Кожне вміння реалізовано окремою функцією, що отримує спільний стан і повертає набір методів: <code>const canSpeak = (state) =&gt; ({ speak: () =&gt; state.name + \" говорить\" });</code>. Потім об'єднують: <code>Object.assign({}, canSpeak(state), canMove(state))</code>. Так створюють істот, які вміють говорити, ходити чи плавати в будь-якому поєднанні, не будуючи для кожного поєднання свого класу.",
      "Чому композицію радять замість наслідування? Ієрархії жорсткі. Якщо «качка» наслідує «птаха», а потім потрібна гумова качка, яка не літає, ієрархію доводиться ламати. Це відома проблема: ви хотіли банан, а отримали горилу, що тримає банан, і весь ліс довкола. Композиція будується за принципом «має», а не «є»: об'єкт <i>має</i> здатність, а не <i>є</i> нащадком. Поєднувати здатності можна вільно, а кожну тестувати окремо.",
      "Ще один різновид композиції — <b>делегування</b>: об'єкт тримає інший об'єкт і перекладає на нього роботу. Автомобіль не успадковує двигун, а має поле <code>engine</code> і викликає <code>this.engine.start()</code>. Якщо двигун потрібно замінити (електричний замість бензинового), достатньо передати інший об'єкт з таким самим інтерфейсом. Передавання залежностей зовні, а не створення їх всередині, дає гнучкість і легке тестування, про що ми ще поговоримо в главі про архітектуру.",
      "Для класів існує патерн <b>міксин</b>: функція, що приймає клас і повертає розширений: <code>const Serializable = (Base) =&gt; class extends Base { toJSON() { ... } };</code>. Тоді <code>class User extends Serializable(Person)</code> додає здатність у ланцюжок. Це гнучкіше, ніж єдине наслідування, але глибокі стопки міксинів теж стають заплутаними, тож не захоплюйтесь. Простіші умови: маленькі функції та об'єкти, які легко переглянути й поєднати.",
      "Практичні поради. Починайте з простого об'єкта чи функції, класи беріть, коли справді потрібні однотипні екземпляри. Для спільної поведінки віддавайте перевагу композиції та делегуванню. Тримайте ієрархії наслідування не глибшими за один-два рівні. Називайте здатності за дією (<code>canSave</code>, <code>withLogging</code>), а не за сутністю. Так ваш код лишатиметься гнучким, коли вимоги зміняться, а вони обов'язково зміняться.",
    ],
    code: [
      String.raw`function createCounter(start = 0) {
  let value = start;
  return {
    inc() { return ++value; },
    get() { return value; },
  };
}
const a = createCounter();
const b = createCounter(10);
a.inc();
console.log(a.get(), b.get(), a.value);`,
      String.raw`const canSpeak = (state) => ({ speak: () => state.name + " говорить" });
const canMove = (state) => ({ move: () => state.name + " рухається" });
function createRobot(name) {
  const state = { name };
  return Object.assign({}, canSpeak(state), canMove(state));
}
const robot = createRobot("Р2");
console.log(robot.speak(), robot.move(), Object.keys(robot));`,
      String.raw`class Engine {
  start() { return "двигун запущено"; }
}
class ElectricEngine {
  start() { return "тихо запущено"; }
}
class Car {
  constructor(engine) { this.engine = engine; }
  drive() { return this.engine.start() + ", їдемо"; }
}
console.log(new Car(new Engine()).drive());
console.log(new Car(new ElectricEngine()).drive());`,
      String.raw`const Serializable = (Base) =>
  class extends Base {
    toJSON() {
      return { type: this.constructor.name, ...this };
    }
  };
class Person {
  constructor(name) { this.name = name; }
}
class User extends Serializable(Person) {}
console.log(JSON.stringify(new User("Оля")));`,
      String.raw`// аварія: у складеного об'єкта немає здатності плавати, тож виклик swim дає TypeError
const canSpeak = (state) => ({ speak: () => state.name + " говорить" });
const state = { name: "Рибка" };
const fish = Object.assign({}, canSpeak(state));
console.log(fish.speak());
console.log(fish.swim());`,
    ],
    note: "Фабрика повертає об'єкт без <code>new</code>, а стан ховає в замиканні. Композиція збирає об'єкт зі здатностей («має»), а не з ієрархії («є»). Делегування замінює наслідування там, де достатньо передати залежність.",
    work: "У React і Vue замість глибоких ієрархій компонентів використовують композицію й хуки. Модулі в Node, плагіни та middleware також збираються з малих незалежних частин, які легко замінити та протестувати.",
    tasks: [
      "У чому різниця між фабричною функцією й класом щодо приватності, пам'яті та instanceof?",
      "Чому композицію («має») вважають гнучкішою за наслідування («є») і що таке делегування?",
    ],
  },
  {
    t: "Пам'ять: збирач сміття і витоки",
    ch: "Об'єкти й класи",
    adv: true,
    easy: "JavaScript сам прибирає невикористані речі, як робот-прибиральник у квартирі. Але він не чіпає те, до чого ще можна дотягнутись: якщо ви випадково залишили на підлозі шнурок, що веде до сміття, воно лежатиме вічно.",
    p: [
      "Програма створює об'єкти постійно: масиви, рядки, функції, об'єкти даних. Вручну вивільняти пам'ять у JavaScript не треба й не можна: цим займається <b>збирач сміття</b> (garbage collector). Основна ідея — досяжність. Є «корені»: глобальні змінні, змінні, що зараз використовуються в стеку викликів. Усе, до чого можна дійти від коренів через ланцюжок посилань, вважається живим. Решту рушій час від часу прибирає й повертає пам'ять системі.",
      "Сучасні рушії використовують алгоритм «позначити й вимести» (mark and sweep): спершу обходять усі досяжні об'єкти й позначають їх, а потім видаляють непозначені. Тому циклічні посилання (<code>a.b = b; b.a = a</code>) не заважають збору: якщо обидва об'єкти недосяжні від коренів, вони будуть прибрані разом. Момент збирання непередбачуваний, програмі нікуди ним керувати. Саме тому не можна покладатися на те, що об'єкт зникне «зараз».",
      "Витік пам'яті — це ситуація, коли об'єкт більше не потрібен програмі, але лишається досяжним, тож збирач його не чіпає. Пам'ять росте, застосунок повільнішає, а потім може впасти. Основні причини зводяться до кількох типових: <b>таймери</b> (<code>setInterval</code> без <code>clearInterval</code> тримає колбек і все, що той замкнув), <b>обробники подій</b> на елементах, які давно видалені зі сторінки, <b>кеші без обмеження</b> розміру, випадкові глобальні змінні та замикання, що тримають великі дані.",
      "Простий приклад витоку — кеш без меж: <code>const cache = new Map(); function load(id) { if (!cache.has(id)) cache.set(id, heavy(id)); return cache.get(id); }</code>. Кожен новий ключ додає запис, і Map ніколи не стискається. Лікування — обмежити розмір і викидати найстаріші чи найрідше вживані записи (так звана LRU-політика) або тримати значення слабко через <code>WeakMap</code>, якщо ключами є об'єкти. Саме такий кеш ви напишете в практичному завданні.",
      "Як знайти витік? У браузері вкладка <b>Memory</b> у DevTools дозволяє зробити «знімок купи» (heap snapshot), виконати дію кілька разів і порівняти знімки: що зростає, те й тече. У Node можна дивитись на <code>process.memoryUsage().heapUsed</code>. Для швидкої перевірки достатньо побачити, що після багаторазового виконання однієї дії пам'ять не повертається до початкового рівня, навіть після явного збору (у Node це <code>node --expose-gc</code> і <code>global.gc()</code>, лише для експериментів).",
      "Виправлення зазвичай прості. Зупиняти таймери (<code>clearInterval</code>, <code>clearTimeout</code>), знімати обробники (<code>removeEventListener</code> чи передавати <code>AbortController.signal</code>), обмежувати кеші, обнуляти посилання на великі структури, коли вони стали непотрібні, і не тримати зайвого у замиканнях. Дбайливе ставлення до життєвого циклу ресурсів — це професійна звичка: усе, що ви створили (підписку, таймер, з'єднання), відповідальність за закриття лежить на вас.",
      "Не варто й перегинати. Передчасна оптимізація пам'яті ускладнює код, а сучасні рушії дуже ефективні. Не створюйте великі тимчасові об'єкти в гарячих циклах, коли є простіший варіант, але й не перераховуйте кожен байт. Дивіться на пам'ять, коли застосунок працює довго (сервер, одно-сторінкова програма) або обробляє великі обсяги даних. Для коротких скриптів збирач сам усе приведе до ладу.",
    ],
    code: [
      String.raw`const cache = new Map();
function load(id) {
  if (!cache.has(id)) cache.set(id, "дані " + id);   // кеш без меж
  return cache.get(id);
}
for (let i = 0; i < 1000; i++) load(i);
console.log(cache.size);`,
      String.raw`class Lru {
  constructor(limit) {
    this.limit = limit;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);   // «свіжий» ключ іде в кінець
    return value;
  }
  set(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.limit) this.map.delete(this.map.keys().next().value);
  }
}
const lru = new Lru(2);
lru.set("a", 1); lru.set("b", 2); lru.get("a"); lru.set("c", 3);
console.log([...lru.map.keys()]);`,
      String.raw`let ticks = 0;
const timer = setInterval(() => {
  ticks++;
  if (ticks === 3) {
    clearInterval(timer);   // без цього таймер тримає колбек вічно
    console.log("таймер зупинено", ticks);
  }
}, 1);`,
      String.raw`const usage = process.memoryUsage();
console.log(typeof usage.heapUsed, usage.heapUsed > 0);
let big = new Array(1000).fill("x".repeat(100));
big = null;   // посилання знято, дані можна прибрати
console.log(big);`,
      String.raw`// аварія: масив не може мати довжину 2 у степені 32, і рушій кидає RangeError
const huge = new Array(2 ** 32);
console.log(huge.length);`,
    ],
    note: "Збирач сміття прибирає лише недосяжне. Витоки створюють забуті таймери, обробники подій, необмежені кеші та замикання з великими даними. Не покладайтесь на момент збирання, а обмежуйте кеші й закривайте ресурси.",
    work: "Довгоживучі застосунки (сервери, одно-сторінкові інтерфейси, дашборди, що працюють днями) вмирають від повільних витоків. Умілий пошук їх у DevTools і правильні кеші з обмеженням відрізняють стабільний продукт від такого, що «гальмує після обіду».",
    tasks: [
      "Що означає, що об'єкт досяжний, і чому циклічні посилання самі по собі не спричиняють витоку?",
      "Назвіть три типові причини витоків пам'яті в JavaScript і способи їх усунути.",
    ],
  },
];
