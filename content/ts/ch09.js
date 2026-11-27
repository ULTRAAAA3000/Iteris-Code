// Глава 9 «Тестування й якість» (уроки 86–91). Тексти українською; у p, easy, note, work, tasks дозволені лише теги code, b, i, а < > & екрануємо.
const raw = String.raw;

export const LESSONS_09 = [
  {
    t: "Тести вручну: assert і табличні тести",
    ch: "Тестування й якість",
    easy: "Тест це маленька програма, яка запускає ваш код із відомими даними й перевіряє, що результат такий, як ви очікували. Табличний тест робить це для цілого набору прикладів, записаних як рядки таблиці.",
    p: [
      "Автоматичний тест відповідає на запитання «чи працює код так, як ми задумали?» і робить це за секунди, а не за хвилини ручних перевірок. Він дає впевненість при змінах: якщо щось зламалось, тест покаже де. У великих проєктах використовують готові каркаси, як-от Vitest чи Jest, але ідея проста, і її легко відтворити кількома функціями. Саме так ми й зробимо, щоб побачити механізм зсередини.",
      "Основа тесту це <b>твердження</b> (assertion): умова, яка має бути істинною. Якщо вона хибна, тест падає з повідомленням. Мінімальна версія записується як функція <code>assert(condition, message)</code>, що кидає помилку, коли умова хибна. Тип результату <code>asserts condition</code> повідомляє компілятору: після виклику умова істинна, тож звуження типів працює і далі за кодом.",
      "Для порівняння значень зручна функція <code>assertEqual(actual, expected)</code>. Для чисел і рядків вистачає <code>===</code>, а для масивів і об'єктів потрібне порівняння за вмістом, наприклад через <code>JSON.stringify</code> (з обмеженнями) або власний глибокий порівняльник. Повідомлення про помилку має містити <i>обидва</i> значення: «очікувалось 5, отримано 4» набагато корисніше за просте «тест не пройшов».",
      "<b>Табличний тест</b> це масив випадків: кожен має вхід і очікуваний результат. Один цикл перебирає всі рядки таблиці й перевіряє їх. Це компактно, легко доповнювати новим випадком і добре читається як специфікація. Вхід у повідомленні про помилку допомагає швидко знайти, який саме рядок таблиці упав. Для типізації кортежів зручно давати елементам імена прямо в типі.",
      "Що тестувати? <b>Типові випадки</b> (нормальні дані), <b>крайні</b> (порожній рядок, нуль, один елемент, максимум) і <b>помилкові</b> (некоректний вхід, який має відхилятися). Помилки зазвичай живуть саме на краях. Для функції діапазону це «від дорівнює до», «від більше за до», від'ємні числа. Тест, що перевіряє лише приклад із документації, мало що доводить.",
      "Перевірка винятків теж потрібна: функція <code>assertThrows(fn)</code> викликає <code>fn</code> у <code>try/catch</code> і падає, якщо виняток не виник. Не перевіряйте повідомлення дослівно, якщо воно не є частиною контракту: перевіряйте тип помилки або ключову частину тексту. Тоді дрібна зміна формулювання не ламатиме десятки тестів, а справжні збої все одно будуть помічені.",
      "Добрі тести <b>незалежні</b> (порядок виконання не важливий), <b>детерміновані</b> (без випадковості та поточного часу), <b>швидкі</b> і <b>зрозумілі</b>: з назви ясно, що перевіряється. Тестуйте поведінку, а не реалізацію: якщо ви перепишете функцію зсередини, тести мають лишитися зеленими. Це й відрізняє корисні тести від крихких. У цьому розділі ми зберемо власний мініатюрний каркас і далі користуватимемося ним.",
    ],
    code: [
      raw`function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function firstWord(text: string | null): string {
  assert(text !== null, "текст не може бути null");
  return text.trim().split(" ")[0];
}

console.log(firstWord("  привіт світе"));
try {
  firstWord(null);
} catch (error) {
  console.log("помилка:", error instanceof Error ? error.message : error);
}
`,
      raw`function assertEqual<T>(actual: T, expected: T, label: string): void {
  const same = JSON.stringify(actual) === JSON.stringify(expected);
  const details = same ? "" : ": очікувалось " + JSON.stringify(expected) + ", отримано " + JSON.stringify(actual);
  console.log((same ? "ok  " : "FAIL") + " " + label + details);
}

function double(n: number): number {
  return n * 2;
}

assertEqual(double(2), 4, "double(2)");
assertEqual(double(0), 0, "double(0)");
assertEqual([1, 2].map(double), [2, 4], "map double");
assertEqual(double(3), 7, "double(3), навмисна помилка");
`,
      raw`function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

const cases: Array<[input: string, expected: number]> = [
  ["", 0],
  ["   ", 0],
  ["привіт", 1],
  ["  два   слова ", 2],
  ["a b c d", 4],
];

let failed = 0;
for (const [input, expected] of cases) {
  const actual = countWords(input);
  if (actual !== expected) {
    failed++;
    console.log("FAIL", JSON.stringify(input), expected, actual);
  }
}
console.log("випадків:", cases.length, "помилок:", failed);
`,
      raw`function assertThrows(action: () => unknown, label: string): void {
  try {
    action();
  } catch {
    console.log("ok  ", label);
    return;
  }
  console.log("FAIL", label, "виняток не виник");
}

function parsePositive(text: string): number {
  const n = Number(text);
  if (!(n > 0)) {
    throw new RangeError("не додатне: " + text);
  }
  return n;
}

assertThrows(() => parsePositive("-1"), "від'ємне число");
assertThrows(() => parsePositive("abc"), "не число");
assertThrows(() => parsePositive("5"), "коректне число (виняток не очікувався)");
`,
      raw`// не компілюється: звичайна функція не звужує тип, потрібен тип asserts
function check(condition: boolean): void {
  if (!condition) {
    throw new Error("перевірка не пройшла");
  }
}

function length(text: string | null): number {
  check(text !== null);
  return text.length;
}

console.log(length("abc"));
`,
    ],
    note: "Твердження з типом <code>asserts condition</code> звужує типи. Табличний тест перебирає масив випадків, а перевіряти варто типові, крайні й помилкові входи. Повідомлення має містити очікуване й отримане значення.",
    work: "Тести дають змогу змінювати код без страху: за хвилину видно, що саме зламалось. Навіть простий власний каркас на двох функціях закриває більшість потреб навчальних проєктів і показує, як влаштовані великі інструменти.",
    tasks: [
      "Що означає тип результату <code>asserts condition</code> і чим він відрізняється від звичайного <code>void</code>?",
      "Чому в табличний тест варто включати крайні випадки, як-от порожній рядок і нуль?",
    ],
  },
  {
    t: "Тестові дублі: заглушки й шпигуни через інтерфейси",
    ch: "Тестування й якість",
    easy: "Тестовий дубль це підставний актор: він грає роль справжньої залежності (пошти, годинника, бази), але повністю контролюється тестом. Інтерфейс це «опис ролі», завдяки якому підміна проходить непомітно для коду.",
    p: [
      "Функції рідко працюють самі: вони надсилають листи, читають час, звертаються до бази чи мережі. У тесті такі залежності заважають: вони повільні, недетерміновані й мають побічні ефекти. Рішення: підставити замість справжньої залежності <b>тестовий дубль</b> (test double) з тим самим інтерфейсом, але керованою поведінкою.",
      "Підміна працює, бо код залежить від <b>інтерфейсу</b>, а не від конкретного класу. Якщо функція приймає <code>Mailer</code> з методом <code>send(to, text)</code>, то справжній SMTP-клієнт і підставний об'єкт для неї однакові. Структурна типізація TypeScript спрощує підміну: підійде будь-який об'єкт потрібної форми, наслідування не потрібне.",
      "Види дублів. <b>Заглушка</b> (stub) повертає заздалегідь заготовлені відповіді, як-от «годинник, що завжди показує 12:00». <b>Шпигун</b> (spy) запам'ятовує, як його викликали: скільки разів і з якими аргументами. <b>Імітація</b> (fake) має спрощену робочу реалізацію, як «база в пам'яті». <b>Мок</b> (mock) це шпигун із заздалегідь заданими очікуваннями, що сам перевіряє, чи були виклики.",
      "Шпигуна легко написати вручну: об'єкт зі списком <code>calls</code>, куди метод дописує аргументи. Тоді тест перевіряє кількість викликів і вміст кожного. Узагальнена функція <code>spy</code>, що приймає будь-яку функцію <code>(...args: A) =&gt; R</code>, обгортає її й зберігає виклики з типами аргументів, виведеними з оригіналу. Так компілятор не дасть порівняти виклики з неправильною формою.",
      "Що перевіряти шпигуном? Факт і параметри <i>важливих</i> взаємодій: «лист надіслано на правильну адресу». Не перевіряйте кожен внутрішній виклик: тест, що копіює реалізацію рядок у рядок, ламається при кожному рефакторингу. Якщо можна перевірити результат (стан, значення, що повернулось), перевіряйте його, а шпигуна лишайте для побічних ефектів, що не мають видимого результату.",
      "Заглушки допомагають моделювати негативні сценарії: мережа впала, база повернула помилку, відповідь порожня. Такі випадки складно відтворити зі справжньою залежністю, а з дублем це один рядок, у якому метод кидає помилку. Тест тоді перевіряє, що ваш код правильно реагує на збій, не втрачає інші листи й повідомляє про проблему. Саме такі сценарії зазвичай і не покриті, бо вручну їх майже неможливо викликати, а в реальному житті вони трапляються найчастіше й коштують найдорожче.",
      "Дуже важливо, щоб дубль відповідав інтерфейсу: тип <code>Mailer</code> перевірить це на етапі компіляції. Тому описуйте залежності інтерфейсами та передавайте їх параметрами чи через конструктор (про це далі в розділі про архітектуру). Остерігайтеся дублів, що розходяться з реальністю: якщо справжній сервіс змінив поведінку, а заглушка ні, тести зеленіють, а програма ламається.",
    ],
    code: [
      raw`interface Mailer {
  send(to: string, text: string): void;
}

class SpyMailer implements Mailer {
  calls: Array<{ to: string; text: string }> = [];

  send(to: string, text: string): void {
    this.calls.push({ to, text });
  }
}

function welcome(mailer: Mailer, userName: string, email: string): void {
  mailer.send(email, "Вітаємо, " + userName + "!");
}

const mailer = new SpyMailer();
welcome(mailer, "Олена", "o@x.ua");
console.log(mailer.calls.length, mailer.calls[0]);
`,
      raw`interface Clock {
  now(): Date;
}

function greeting(clock: Clock): string {
  return clock.now().getUTCHours() < 12 ? "Доброго ранку" : "Доброго дня";
}

const morning: Clock = { now: () => new Date("2024-03-15T08:00:00Z") };
const afternoon: Clock = { now: () => new Date("2024-03-15T15:00:00Z") };

console.log(greeting(morning), "|", greeting(afternoon));
`,
      raw`function spy<A extends unknown[], R>(fn: (...args: A) => R) {
  const calls: A[] = [];
  const wrapped = (...args: A): R => {
    calls.push(args);
    return fn(...args);
  };
  return { wrapped, calls };
}

const { wrapped, calls } = spy((a: number, b: number) => a + b);
console.log(wrapped(1, 2), wrapped(5, 5));
console.log(calls);
`,
      raw`interface Mailer {
  send(to: string, text: string): void;
}

function notify(mailer: Mailer, email: string): string {
  try {
    mailer.send(email, "Привіт");
    return "надіслано";
  } catch (error) {
    return "збій: " + (error instanceof Error ? error.message : "невідомо");
  }
}

const broken: Mailer = {
  send: () => {
    throw new Error("SMTP недоступний");
  },
};

console.log(notify(broken, "o@x.ua"));
`,
      raw`// не компілюється: підставний об'єкт не відповідає інтерфейсу Mailer
interface Mailer {
  send(to: string, text: string): void;
}

const fake: Mailer = { sendMail: () => {} };
console.log(fake);
`,
    ],
    note: "Підміняйте залежності об'єктами з тим самим інтерфейсом. Заглушка повертає готові відповіді, шпигун запам'ятовує виклики, імітація має спрощену реалізацію. Перевіряйте насамперед результат, а шпигуна лишайте для побічних ефектів.",
    work: "Код, що надсилає листи, читає час чи звертається до зовнішніх сервісів, тестують без реальних листів і мережі. Дублі роблять тести швидкими, детермінованими й дозволяють перевірити поведінку при збоях, яку важко викликати зі справжніми залежностями.",
    tasks: [
      "Чим шпигун відрізняється від заглушки і що саме він запам'ятовує?",
      "Чому залежності зручніше описувати інтерфейсом, а не конкретним класом?",
    ],
  },
  {
    t: "Тестування типів: Equal, Expect і @ts-expect-error",
    ch: "Тестування й якість",
    easy: "Типи теж можна тестувати: перевірити, що складний тип вийшов саме таким, як ви задумали. Тест типів провалюється не під час виконання, а під час компіляції: червоне підкреслення замість червоного тесту.",
    p: [
      "Бібліотеки з потужними типами (узагальнення, умовні типи, утиліти) потребують власних тестів: якщо хтось змінить тип і він «тихо» стане ширшим чи вужчим, помилку ніхто не помітить, доки не зламається код користувача. <b>Тест типів</b> фіксує очікувану поведінку типу, а компілятор перевіряє її при кожній збірці. Помилка компіляції означає «тест не пройдено».",
      "Найпростіший інструмент це директива <code>// @ts-expect-error</code>. Вона ставиться над рядком, який <i>має</i> не компілюватися. Якщо рядок справді містить помилку, компілятор мовчить; якщо помилки нема (тип став надто широким), компілятор скаржиться на «невикористану директиву». Так тестують негативні випадки: що неправильне використання заборонено.",
      "Для позитивних перевірок потрібне порівняння типів на <b>точну рівність</b>. Знаменитий прийом описує тип <code>Equal&lt;A, B&gt;</code> через порівняння двох допоміжних функціональних типів. Він справді відрізняє типи, навіть <code>any</code> від <code>unknown</code>, на відміну від наївного <code>A extends B</code>, що перевіряє лише сумісність в один бік. Ви користуєтеся ним як готовим інструментом, не вдаючись до його внутрішнього устрою.",
      "Допоміжний тип <code>Expect&lt;T extends true&gt; = T</code> разом з <code>Equal</code> складає перевірку: оголошення типу, чий аргумент має бути <code>Equal</code> двох типів. Якщо типи рівні, <code>Equal</code> дає <code>true</code>, і все компілюється. Якщо ні, <code>Equal</code> дає <code>false</code>, що не відповідає обмеженню <code>extends true</code>, і з'являється помилка саме в цьому рядку. Імена типів із підкресленням позначають, що вони існують лише для перевірки.",
      "Що тестувати типами? Результати <b>утилітарних типів</b> (<code>Pick</code>, <code>Omit</code>, власні відображені типи), <b>виведення</b> узагальнених функцій (чи дасть виклик з числом тип <code>number</code>) і поведінку <b>умовних типів</b> на різних вхідних даних. Також негативні випадки: «не можна передати рядок», «поле лише для читання». Саме на них найчастіше ламаються зміни у типах.",
      "Перевірка під час виконання теж корисна для підтвердження: у прикладах ми поєднуємо тест типів із простим запуском, щоб було видно результат. Але справжня цінність у тому, що тест типів працює навіть коли код не виконується: достатньо запустити <code>tsc --noEmit</code>. Така перевірка швидка й добре вписується в безперервну інтеграцію поруч зі звичайними тестами.",
      "Остерігайтеся хибнопозитивних тестів: <code>@ts-expect-error</code> над рядком, де помилка виникає з <i>іншої</i> причини, ніж ви думали, теж «пройде». Тому тримайте негативні випадки маленькими й однозначними та пишіть коментар, чому рядок має падати. Не покладайтеся на <code>any</code>: типи з <code>any</code> «проходять» майже будь-яку наївну перевірку. Саме тому <code>Equal</code> розрізняє <code>any</code> і решту.",
    ],
    code: [
      raw`type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

type User = { id: number; nick: string; email?: string };
type PublicUser = Pick<User, "id" | "nick">;

type _t1 = Expect<Equal<PublicUser, { id: number; nick: string }>>;
type _t2 = Expect<Equal<Partial<User>["id"], number | undefined>>;
type _t3 = Expect<Equal<Awaited<Promise<string>>, string>>;
type _t4 = Expect<Equal<keyof PublicUser, "id" | "nick">>;

console.log("усі перевірки типів пройшли компіляцію");
`,
      raw`function double(n: number): number {
  return n * 2;
}

// @ts-expect-error рядок не можна передати у функцію для чисел
double("5");

// @ts-expect-error зайвий аргумент
double(5, 6);

const point: Readonly<{ x: number }> = { x: 1 };
// @ts-expect-error поле лише для читання не можна змінювати
point.x = 2;

console.log(double(4));
`,
      raw`type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

function first<T>(items: T[]): T | undefined {
  return items[0];
}

const c = pair(1, "a");
const d = first([1, 2, 3]);

type _t1 = Expect<Equal<typeof c, [number, string]>>;
type _t2 = Expect<Equal<typeof d, number | undefined>>;

console.log(c, d);
`,
      raw`// не компілюється: Equal помічає, що тип не такий, як очікували
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;

function parse(text: string): number | null {
  const n = Number(text);
  return Number.isNaN(n) ? null : n;
}

type _wrong = Expect<Equal<ReturnType<typeof parse>, number>>;
`,
      raw`// не компілюється: директива @ts-expect-error над коректним рядком сама стає помилкою
function double(n: number): number {
  return n * 2;
}

// @ts-expect-error цей рядок насправді коректний
console.log(double(2));
`,
    ],
    note: "<code>@ts-expect-error</code> перевіряє, що рядок не компілюється, а пара <code>Equal</code> і <code>Expect</code> перевіряє точну рівність типів. Помилка компіляції означає невдалий тест. Тримайте негативні випадки маленькими й однозначними.",
    work: "Бібліотеки утиліт, API-клієнти й загальні компоненти зберігають тести типів, щоб зміна складного типу не поламала вивід типів у користувачів. Ці перевірки виконуються командою <code>tsc --noEmit</code> без запуску коду.",
    tasks: [
      "Що станеться, якщо поставити <code>@ts-expect-error</code> над рядком, який насправді компілюється?",
      "Чому <code>Equal</code> надійніший за перевірку <code>A extends B</code>?",
    ],
  },
  {
    t: "Тестування асинхронного коду",
    ch: "Тестування й якість",
    easy: "Асинхронний тест має дочекатися результату, перш ніж щось перевіряти. Якщо тест закінчиться раніше за операцію, він «пройде», нічого не перевіривши, а це найгірший вид тесту.",
    p: [
      "Асинхронні функції повертають проміси, і тест мусить їх <b>дочекатися</b>. Якщо написати <code>const result = loadUser(1);</code> і одразу перевіряти <code>result.name</code>, ви перевіряєте проміс, а не користувача. Простий закон: у тесті на кожен виклик асинхронної функції стоїть <code>await</code>, а сам тест є <code>async</code>-функцією. Компілятор допомагає, відхиляючи звернення до полів проміса.",
      "Найпідступніша помилка: <b>тест, що закінчується до завершення операції</b>. Якщо ви забули <code>await</code> або не повернули проміс, тест «проходить» миттєво, а твердження виконуються пізніше, коли про тест уже забули, і їхня помилка стає необробленою відмовою. Тому каркаси тестів вимагають повертати проміс чи використовувати <code>async</code>, і ми у власному запускачі робимо те саме.",
      "Для перевірки помилок асинхронних функцій потрібна окрема функція <code>assertRejects(promise)</code>: вона чекає на проміс у <code>try/catch</code>, а якщо проміс виконався, кидає помилку «очікувалась відмова». Не плутайте це зі звичайним <code>assertThrows</code>: синхронний <code>try/catch</code> без <code>await</code> відхилення не зловить, ми це бачили в розділі про помилки в асинхронному коді.",
      "Таймери в тестах. Реальні затримки роблять тести повільними й нестабільними. Замість очікування справжніх секунд використовуйте короткі затримки (1–5 мс) або <b>підставний годинник</b>: функція отримує <code>sleep</code> параметром, а тест передає версію, що виконується одразу. Так ми тестували повтори в розділі про асинхронність: затримки записувалися, але ніхто нічого не чекав.",
      "Тестування порядку подій без часу: відстежуйте послідовність викликів у масиві й порівнюйте його в кінці, записуючи, наприклад, «початок A» і «кінець A». Так видно, чи задачі виконувались по черзі чи паралельно, без вимірювання мілісекунд. Подібно, лічильник одночасних задач дозволяє перевірити ліміт паралелізму, а вони обидві не залежать від швидкості машини.",
      "Тайм-аут самого тесту. Якщо проміс ніколи не виконається, наприклад через забутий <code>resolve</code>, тест зависне. Хороший запускач обгортає кожен тест у <code>Promise.race</code> із тайм-аутом і повідомляє «тест не завершився за N мс». Це відрізняє «повільний» від «завислого» й не дає одному поганому тесту заблокувати весь набір та приховати результати решти.",
      "Ізоляція: кожен асинхронний тест має починати з чистого стану й не залишати фонових задач. Таймер, що спрацює після завершення тесту, може зіпсувати наступний. Скасовуйте або очищайте такі задачі в кінці (<code>clearTimeout</code>, <code>AbortController</code>). Збирайте всі результати перед твердженнями, а не вставляйте твердження в колбеки: колбек може не виконатися взагалі, і ніхто цього не помітить.",
    ],
    code: [
      raw`type TestFn = () => Promise<void> | void;

async function runTests(tests: Record<string, TestFn>): Promise<void> {
  let passed = 0;
  for (const [testName, test] of Object.entries(tests)) {
    try {
      await test();
      passed++;
      console.log("ok  ", testName);
    } catch (error) {
      console.log("FAIL", testName, "-", error instanceof Error ? error.message : error);
    }
  }
  console.log("пройдено:", passed, "з", Object.keys(tests).length);
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadUser(id: number): Promise<{ id: number; nick: string }> {
  await pause(1);
  return { id, nick: "user" + id };
}

runTests({
  "завантаження користувача": async () => {
    const user = await loadUser(2);
    if (user.nick !== "user2") {
      throw new Error("неправильний нік " + user.nick);
    }
  },
  "навмисна помилка": async () => {
    const user = await loadUser(3);
    if (user.id !== 4) {
      throw new Error("очікувалось 4, отримано " + user.id);
    }
  },
});
`,
      raw`async function assertRejects(promise: Promise<unknown>, label: string): Promise<void> {
  try {
    await promise;
  } catch {
    console.log("ok  ", label);
    return;
  }
  console.log("FAIL", label, "проміс виконався, а мав відхилитись");
}

async function fetchPrice(item: string): Promise<number> {
  if (item === "") {
    throw new Error("порожня назва");
  }
  return item.length;
}

async function main(): Promise<void> {
  await assertRejects(fetchPrice(""), "порожня назва відхиляється");
  await assertRejects(fetchPrice("хліб"), "коректна назва (відхилення не очікувалось)");
}

main();
`,
      raw`const log: string[] = [];

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function check(): Promise<void> {
  await pause(5);
  log.push("перевірка виконана");
}

async function badTest(): Promise<void> {
  check();
  log.push("тест завершився");
}

async function goodTest(): Promise<void> {
  await check();
  log.push("тест завершився");
}

async function main(): Promise<void> {
  await badTest();
  console.log("одразу:", log.join(" -> "));
  await pause(20);
  console.log("пізніше:", log.join(" -> "));

  log.length = 0;
  await goodTest();
  console.log("з await:", log.join(" -> "));
}

main();
`,
      raw`function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("тест не завершився за " + ms + " мс")), ms);
  });
  return Promise.race([promise, timeout]);
}

async function main(): Promise<void> {
  const never = new Promise<void>(() => {});
  try {
    await withTimeout(never, 10);
  } catch (error) {
    console.log(error instanceof Error ? error.message : error);
  }
}

main();
`,
      raw`// не компілюється: без await перевіряємо поле проміса, а не користувача
async function loadUser(id: number): Promise<{ nick: string }> {
  return { nick: "user" + id };
}

async function test(): Promise<void> {
  const user = loadUser(1);
  if (user.nick !== "user1") {
    throw new Error("неправильний нік");
  }
}

test();
`,
    ],
    note: "У тесті на кожен виклик асинхронної функції ставте <code>await</code>, а сам тест робіть <code>async</code>. Забутий <code>await</code> закінчує тест раніше за операцію. Тайм-аут через <code>Promise.race</code> відрізняє завислі тести від повільних.",
    work: "Мережеві запити, бази даних і черги повертають проміси, тож майже кожен реальний тест асинхронний. Правильний запускач чекає на всі проміси, обмежує час очікування й не дозволяє одному завислому тесту зупинити весь набір.",
    tasks: [
      "Чому тест без <code>await</code> перед асинхронним викликом може «пройти», нічого не перевіривши?",
      "Для чого запускач тестів обгортає кожен тест у <code>Promise.race</code> із тайм-аутом?",
    ],
  },
  {
    t: "Типобезпечні фабрики тестових даних",
    ch: "Тестування й якість",
    adv: true,
    easy: "Фабрика тестових даних це «верстат»: ви кажете, що в цьому тесті важливо, а решту полів верстат заповнює розумними значеннями за замовчуванням. Тест лишається коротким і показує тільки суть.",
    p: [
      "У тестах постійно потрібні об'єкти: користувачі, замовлення, платежі. Якщо в кожному тесті писати їх повністю, з десятка полів, тести стають довгими й крихкими: додали нове обов'язкове поле, і доводиться правити сотню місць. Рішення: <b>фабрика</b> (test data builder), тобто функція, що створює повний коректний об'єкт зі значеннями за замовчуванням і дозволяє перевизначити лише потрібне.",
      "Базова форма фабрики приймає параметр <code>overrides: Partial&lt;User&gt; = {}</code> і повертає об'єкт, у якому спершу йдуть значення за замовчуванням, а потім розгортання <code>...overrides</code>. Тип <code>Partial&lt;User&gt;</code> дозволяє передати будь-яку підмножину полів, а розгортання накладає їх поверх. Результат повний і типобезпечний: компілятор гарантує, що фабрика не забуває обов'язкових полів.",
      "Перевага для читабельності: тест називає лише те, що <i>важливо для цього тесту</i>. Виклик <code>makeUser({ age: 17 })</code> одразу показує: тест про неповнолітніх. Решта полів не відволікають. Коли в типі з'являється нове обов'язкове поле, компілятор змусить оновити лише фабрику, а не всі тести. Це головна економія часу при підтримці великого набору тестів.",
      "Унікальні значення. Деякі поля мають бути різними в різних об'єктах, наприклад <code>id</code> чи <code>email</code>. Використовуйте лічильник у замиканні або на рівні модуля: щоразу <code>nextId++</code>. Не беріть випадкові числа чи поточний час: тест має бути <b>детермінованим</b>. Лічильник дає передбачувані ідентифікатори, і порядок створення визначає значення, а отже, повторний запуск дає той самий результат.",
      "Вкладені об'єкти потребують обережності: поверхневий <code>Partial</code> не дозволяє перевизначити одне вкладене поле, не передаючи весь вкладений об'єкт. Рішення: рекурсивний відображений тип <code>DeepPartial&lt;T&gt;</code> і злиття вкладених частин окремо, або окремі фабрики для вкладених об'єктів, що викликають одна одну. Масиви в такому типі краще залишати цілими, щоб не отримати незручні «часткові елементи».",
      "Варіанти (traits). Часто повторюються осмислені набори значень: «адміністратор», «заблокований користувач». Робіть їх іменованими функціями поверх базової фабрики: <code>makeAdmin</code> просто викликає <code>makeUser</code> з перевизначеною роллю. Назва розповідає про намір краще, ніж набір полів, а зміна визначення «адміністратора» відбувається в одному місці й одразу діє у всіх тестах.",
      "Остерігайтеся двох крайнощів. Занадто «розумна» фабрика зі складною логікою стає власним джерелом помилок. А значення за замовчуванням, що випадково впливають на результат тесту, приховують залежності: якщо тест залежить від поля, явно перевизначайте його в тесті, навіть коли воно збігається зі значенням за замовчуванням. Тоді тест самодокументований. І копіюйте масиви та вкладені об'єкти, щоб тести не ділили змінний стан.",
    ],
    code: [
      raw`interface User {
  id: number;
  nick: string;
  email: string;
  age: number;
  role: "user" | "admin";
}

let nextId = 1;

function makeUser(overrides: Partial<User> = {}): User {
  const id = nextId++;
  return { id, nick: "user" + id, email: "user" + id + "@x.ua", age: 30, role: "user", ...overrides };
}

console.log(makeUser());
console.log(makeUser({ age: 17, role: "admin" }));
console.log(makeUser().id);
`,
      raw`type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface Order {
  id: number;
  customer: { name: string; age: number };
  items: string[];
}

function makeOrder(overrides: DeepPartial<Order> = {}): Order {
  const base: Order = { id: 1, customer: { name: "Олена", age: 30 }, items: ["хліб"] };
  return {
    ...base,
    ...overrides,
    customer: { ...base.customer, ...overrides.customer },
    items: [...(overrides.items ?? base.items)],
  };
}

console.log(makeOrder({ customer: { age: 17 } }));
console.log(makeOrder({ items: ["молоко", "сир"] }).items.length);
`,
      raw`interface User {
  id: number;
  nick: string;
  age: number;
  role: "user" | "admin";
}

let nextId = 1;

function makeUser(overrides: Partial<User> = {}): User {
  const id = nextId++;
  return { id, nick: "user" + id, age: 30, role: "user", ...overrides };
}

const makeAdmin = (overrides: Partial<User> = {}): User => makeUser({ role: "admin", ...overrides });
const makeMinor = (overrides: Partial<User> = {}): User => makeUser({ age: 15, ...overrides });

console.log(makeAdmin().role, makeMinor().age, makeAdmin({ age: 40 }).age);
`,
      raw`// не компілюється: Partial<User> не дозволяє передати поле, якого немає в типі
interface User {
  id: number;
  nick: string;
}

declare function makeUser(overrides?: Partial<User>): User;

makeUser({ nickname: "x" });
`,
      raw`const defaults = { tags: ["a"] };

function badFactory() {
  return { ...defaults };
}

const first = badFactory();
const second = badFactory();
first.tags.push("b");

console.log("другий об'єкт:", second.tags);
console.log("значення за замовчуванням зіпсовано:", defaults.tags);

function goodFactory() {
  return { tags: [...defaults.tags] };
}

const safe = goodFactory();
safe.tags.push("c");
console.log("копія незалежна:", safe.tags, defaults.tags);
`,
    ],
    note: "Фабрика створює повний об'єкт зі значеннями за замовчуванням і приймає <code>Partial</code> для перевизначення. Лічильник дає унікальні детерміновані id, а вкладені об'єкти й масиви потрібно копіювати, щоб тести не ділили змінний стан.",
    work: "У великих проєктах сотні тестів потребують схожих об'єктів. Фабрики скорочують їх до одного-двох рядків, а нове обов'язкове поле у типі оновлюється в одному місці, і сотні тестів лишаються зеленими без жодних правок.",
    tasks: [
      "Яку проблему розв'язує фабрика тестових даних і чому вона робить тести витривалішими до змін у типі?",
      "Чому значення за замовчуванням не повинні випадково впливати на результат тесту?",
    ],
  },
  {
    t: "Генератори тестових даних і інваріанти",
    ch: "Тестування й якість",
    adv: true,
    easy: "Замість того щоб вигадувати приклади вручну, можна згенерувати сотні вхідних даних і перевірити, що певна властивість виконується завжди. Така властивість називається інваріантом.",
    p: [
      "Прикладні тести перевіряють конкретні випадки, які придумав автор. Але помилки часто ховаються в тих випадках, про які ніхто не подумав. <b>Тестування властивостей</b> (property-based testing) іде іншим шляхом: ви описуєте <i>закон</i>, який має виконуватися для будь-яких вхідних даних, а система генерує багато входів і шукає такий, що закон порушує.",
      "<b>Інваріант</b> це твердження, яке завжди істинне. Для сортування: результат упорядкований, містить ті самі елементи, що й вхід, і має ту саму довжину. Для <code>reverse</code>: двічі розвернутий масив дорівнює початковому. Для пари «форматувати й розібрати»: розбір результату форматування повертає початкове значення (круговий прохід). Знайти такі закони складніше за приклади, але вони перевіряють значно більше. Хороше запитання для пошуку інваріанта: «що має лишатися незмінним, скільки б разів і з якими даними я не запускав цю функцію?».",
      "Для генерації потрібен <b>генератор псевдовипадкових чисел із зерном</b> (seed). Звичайний <code>Math.random</code> не підходить: він щоразу інший, і впалий тест неможливо відтворити. Простий детермінований генератор, як-от <code>mulberry32</code>, за однакового зерна дає однакову послідовність, а за сусідніх зерен послідовності різні. Тест падає з повідомленням «зерно 7», і ви повторюєте падіння точно так само.",
      "Поверх випадкових чисел будують <b>генератори значень</b>: ціле в діапазоні, масив заданої довжини, рядок. Кожен приймає джерело випадковості параметром, тож залишається детермінованим. Типи допомагають: <code>type Gen&lt;T&gt; = (random: () =&gt; number) =&gt; T</code> описує будь-який генератор, а комбінатори на кшталт <code>arrayOf(gen)</code> складають складні значення з простих.",
      "Цикл перевірки такий: для зерен 1…N згенерувати вхід, виконати функцію, перевірити інваріант. При першій помилці зупинитися й повідомити зерно та вхід. Так знайдені випадки допомагають шукати баги в крайніх ситуаціях: порожній масив, дублікати, від'ємні числа, дуже довгі рядки, які автор прикладів зазвичай не пробує, бо вони «нереалістичні».",
      "Просунуті бібліотеки, наприклад fast-check, додають <b>зменшення</b> (shrinking): коли знайдено падаючий вхід, система спрощує його до мінімального, який усе ще падає. Замість масиву з сорока елементів ви бачите два. Повне зменшення складне, але найпростіший варіант легко написати: пробувати відкидати по одному елементу й залишати спрощену версію, поки тест усе ще падає.",
      "Обмеження. Інваріанти мають бути справді загальними, інакше ви отримаєте хибні тривоги. Тести властивостей не замінюють приклади: поєднуйте їх, бо приклади документують очікувану поведінку, а властивості шукають несподівані збої. І завжди друкуйте зерно: це перетворює випадкове падіння на відтворюваний звіт про помилку, який можна передати колезі.",
    ],
    code: [
      raw`function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const a = makeRandom(42);
const b = makeRandom(42);
console.log(a() === b(), a() === b(), makeRandom(43)() === makeRandom(42)());

const random = makeRandom(7);
console.log([random(), random(), random()].every((x) => x >= 0 && x < 1));
`,
      raw`function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Gen<T> = (random: () => number) => T;

const int =
  (min: number, max: number): Gen<number> =>
  (random) =>
    min + Math.floor(random() * (max - min + 1));

const arrayOf =
  <T>(gen: Gen<T>, maxLength: number): Gen<T[]> =>
  (random) => {
    const length = Math.floor(random() * (maxLength + 1));
    return Array.from({ length }, () => gen(random));
  };

const digits = arrayOf(int(0, 9), 5);
console.log(digits(makeRandom(1)), digits(makeRandom(2)));
console.log(digits(makeRandom(1)));
`,
      raw`function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Gen<T> = (random: () => number) => T;
const int = (min: number, max: number): Gen<number> => (random) => min + Math.floor(random() * (max - min + 1));
const arrayOf = <T>(gen: Gen<T>, maxLength: number): Gen<T[]> => (random) =>
  Array.from({ length: Math.floor(random() * (maxLength + 1)) }, () => gen(random));

function checkProperty<T>(label: string, gen: Gen<T>, property: (value: T) => boolean, runs = 100): void {
  for (let seed = 1; seed <= runs; seed++) {
    const value = gen(makeRandom(seed));
    if (!property(value)) {
      console.log("FAIL", label, "зерно", seed, JSON.stringify(value));
      return;
    }
  }
  console.log("ok  ", label, "(" + runs + " запусків)");
}

const numbers = arrayOf(int(-5, 5), 8);
const sorted = (items: number[]) => [...items].sort((x, y) => x - y);

checkProperty("сортування впорядковує", numbers, (items) => {
  const s = sorted(items);
  return s.every((x, i) => i === 0 || s[i - 1] <= x);
});
checkProperty("сортування зберігає довжину", numbers, (items) => sorted(items).length === items.length);
checkProperty("reverse двічі дає те саме", numbers, (items) => JSON.stringify([...items].reverse().reverse()) === JSON.stringify(items));
checkProperty("помилкове твердження: масиви непорожні", numbers, (items) => items.length > 0);
`,
      raw`// не компілюється: генератор чисел не підходить там, де очікується генератор рядків
type Gen<T> = (random: () => number) => T;

const numberGen: Gen<number> = (random) => Math.floor(random() * 10);
const stringGen: Gen<string> = numberGen;
console.log(stringGen);
`,
      raw`function shrink(items: number[], fails: (items: number[]) => boolean): number[] {
  let current = items;
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < current.length; i++) {
      const candidate = [...current.slice(0, i), ...current.slice(i + 1)];
      if (fails(candidate)) {
        current = candidate;
        improved = true;
        break;
      }
    }
  }
  return current;
}

const hasTwoBig = (items: number[]) => items.filter((x) => x >= 8).length >= 2;
console.log(shrink([1, 9, 3, 8, 2, 7, 9], hasTwoBig));
`,
    ],
    note: "Інваріант це закон, що виконується для будь-яких входів. Генератор із зерном робить випадкові тести відтворюваними, а повідомлення «зерно N» дозволяє повторити падіння. Зменшення спрощує падаючий вхід до мінімального.",
    work: "Тести властивостей знаходять помилки, які автор прикладів не передбачив: порожні масиви, дублікати, межові числа. Вони широко застосовуються для парсерів, сортувань, серіалізації та інших місць, де закони легко сформулювати.",
    tasks: [
      "Чому для тестів властивостей потрібен генератор із зерном, а не <code>Math.random</code>?",
      "Що таке інваріант і наведіть два інваріанти для сортування масиву чисел.",
    ],
  },
];
