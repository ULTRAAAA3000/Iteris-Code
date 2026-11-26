// Завдання глави 7 «Асинхронність» (уроки 59–73). Еталони: tests/solutions/ts-ch07.mjs
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_07: readonly RemoteTask[] = [
  {
    ...base, id: "ts-callbacks-order", lesson: "ts/59", xp: 20,
    title: "Колбек у стилі «помилка першою»",
    context: "Колбеки й порядок їх виклику лежать в основі таймерів і подій. Коли розумієш, що колбек спрацьовує після синхронного коду, зникають «загадкові» помилки з порядком виводу.",
    brief: [
      "Допишіть <code>loadName(id, callback)</code>. Вона має викликати колбек <b>асинхронно</b> через <code>setTimeout</code> з нулем: якщо <code>id &lt;= 0</code>, передайте помилку <code>new Error(\"Неправильний id\")</code>, інакше <code>null</code> і рядок <code>\"Користувач \" + id</code>.",
      "Подивіться на порядок виводу: «початок» і «кінець» з'являться раніше за результати, бо колбеки чекають завершення синхронного коду.",
    ],
    starter: raw`type Callback = (error: Error | null, name?: string) => void;

function loadName(id: number, callback: Callback): void {
  // TODO: через setTimeout(..., 0) викличте callback:
  // id <= 0 → callback(new Error("Неправильний id")), інакше callback(null, "Користувач " + id)
}

function show(error: Error | null, name?: string): void {
  if (error) {
    console.log("помилка: " + error.message);
    return;
  }
  console.log(name);
}

console.log("початок");
loadName(1, show);
loadName(-1, show);
console.log("кінець");
`,
    checks: [
      { on: "stdout", name: "Порядок і результати", equals: "початок\nкінець\nКористувач 1\nпомилка: Неправильний id", hint: "Колбеки мають спрацювати після рядка «кінець», тому викликайте їх усередині setTimeout." },
      { on: "stdout", name: "Помилка передається першим аргументом", has: "помилка: Неправильний id", hint: "Для id <= 0 викличте callback(new Error(\"Неправильний id\"))." },
      { on: "source", name: "Використано setTimeout", matches: "setTimeout\\s*\\(", hint: "Відкладіть виклик колбека через setTimeout(() => { ... }, 0)." },
    ],
  },
  {
    ...base, id: "ts-promise-chain", lesson: "ts/60", xp: 25,
    title: "Власний проміс і ланцюжок then",
    context: "Загортання старих API у проміси й складання ланцюжків це щоденна робота з бібліотеками. Один catch у кінці ловить збій будь-якого кроку.",
    brief: [
      "Допишіть <code>divide(a, b)</code>, що повертає <code>Promise&lt;number&gt;</code>. Створіть проміс через <code>new Promise</code>: якщо <code>b === 0</code>, відхиліть його з <code>new Error(\"Ділення на нуль\")</code>, інакше виконайте з <code>a / b</code>.",
      "Ланцюжок нижче вже готовий: сам по собі він покаже результат, обробить помилку й виконає <code>finally</code>.",
    ],
    starter: raw`function divide(a: number, b: number): Promise<number> {
  // TODO: new Promise<number>: при b === 0 reject(new Error("Ділення на нуль")), інакше resolve(a / b)
  return Promise.resolve(0);
}

divide(10, 2)
  .then((result) => {
    console.log("результат", result);
    return divide(1, 0);
  })
  .then((result) => {
    console.log("до цього рядка не дійдемо", result);
  })
  .catch((error: Error) => {
    console.log("помилка: " + error.message);
  })
  .finally(() => {
    console.log("готово");
  });
`,
    checks: [
      { on: "stdout", name: "Результат, помилка, finally", equals: "результат 5\nпомилка: Ділення на нуль\nготово", hint: "Другий виклик divide(1, 0) має відхилити проміс, тож then пропускається, а catch спрацьовує." },
      { on: "stdout", name: "Без зайвого виводу", has: "результат 5", hint: "divide(10, 2) має виконатися зі значенням 5." },
      { on: "source", name: "Проміс створено конструктором", matches: "new\\s+Promise", hint: "Використайте new Promise<number>((resolve, reject) => { ... })." },
    ],
  },
  {
    ...base, id: "ts-async-await-total", lesson: "ts/61", xp: 25,
    title: "Підсумок кошика через async/await",
    context: "Послідовні запити, де наступний залежить від попереднього, у реальних застосунках пишуть через async/await. А безпечна обгортка не дає одній помилці зламати весь розрахунок.",
    brief: [
      "Функція <code>getPrice</code> вже готова: вона повертає ціну або відхиляє проміс, якщо товару немає. Допишіть <code>totalPrice(items)</code>: по черзі отримайте ціну кожного товару через <code>await</code> і поверніть суму.",
      "Допишіть <code>safeTotal(items)</code>: поверніть результат <code>totalPrice</code>, а якщо сталася помилка, поверніть <code>-1</code>. Використайте <code>try/catch</code> і <code>return await</code>.",
    ],
    starter: raw`const prices: Record<string, number> = { хліб: 30, молоко: 45, сир: 120 };

function getPrice(item: string): Promise<number> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const price = prices[item];
      if (price === undefined) {
        reject(new Error("Немає товару: " + item));
      } else {
        resolve(price);
      }
    }, 0);
  });
}

async function totalPrice(items: string[]): Promise<number> {
  // TODO: у циклі for...of отримуйте ціни через await getPrice(item) і додавайте до суми
  return 0;
}

async function safeTotal(items: string[]): Promise<number> {
  // TODO: try { return await totalPrice(items); } catch { return -1; }
  return 0;
}

async function main(): Promise<void> {
  console.log(await totalPrice(["хліб", "молоко"]));
  console.log(await safeTotal(["хліб", "сир"]));
  console.log(await safeTotal(["хліб", "ікра"]));
}

main();
`,
    checks: [
      { on: "stdout", name: "Суми й запасне значення", equals: "75\n150\n-1", hint: "Для хліба й молока 30 + 45 = 75; для невідомого товару safeTotal має повернути -1." },
      { on: "source", name: "Використано await", matches: "await\\s+getPrice", hint: "Отримуйте кожну ціну як await getPrice(item)." },
      { on: "source", name: "Є try/catch", matches: "try\\s*\\{[\\s\\S]*\\}\\s*catch", hint: "Обгорніть виклик totalPrice у try/catch у safeTotal." },
    ],
  },
  {
    ...base, id: "ts-async-safe-call", lesson: "ts/62", xp: 30,
    title: "Обгортка safeCall: відмова як значення",
    context: "Перетворення асинхронної помилки на звичайний результат змушує перевірити успіх перед використанням значення. Такий прийом спрощує обробку збоїв у мережевому коді.",
    brief: [
      "Допишіть <code>safeCall</code>: вона приймає функцію, що повертає проміс, чекає на неї і повертає <code>{ ok: true, value }</code> при успіху або <code>{ ok: false, error }</code> з текстом помилки, якщо проміс відхилився.",
      "Для тексту помилки використайте <code>error instanceof Error ? error.message : String(error)</code>. Розбір чисел <code>parseNumber</code> уже написано.",
    ],
    starter: raw`type Outcome<T> = { ok: true; value: T } | { ok: false; error: string };

async function safeCall<T>(action: () => Promise<T>): Promise<Outcome<T>> {
  // TODO: try { ok: true, value: await action() } catch { ok: false, error: повідомлення }
  return { ok: false, error: "не реалізовано" };
}

async function parseNumber(text: string): Promise<number> {
  const n = Number(text);
  if (Number.isNaN(n)) {
    throw new Error("не число: " + text);
  }
  return n;
}

async function main(): Promise<void> {
  const first = await safeCall(() => parseNumber("42"));
  const second = await safeCall(() => parseNumber("abc"));
  for (const result of [first, second]) {
    if (result.ok) {
      console.log("значення", result.value);
    } else {
      console.log("помилка", result.error);
    }
  }
}

main();
`,
    checks: [
      { on: "stdout", name: "Успіх і помилка", equals: "значення 42\nпомилка не число: abc", hint: "Успішний виклик має дати { ok: true, value: 42 }, а відхилений { ok: false, error: \"не число: abc\" }." },
      { on: "source", name: "Є await і try/catch", matches: "try\\s*\\{[\\s\\S]*await[\\s\\S]*\\}\\s*catch", hint: "Усередині try чекайте на action() через await, а в catch повертайте ok: false." },
      { on: "source", name: "Перевірка instanceof Error", matches: "instanceof\\s+Error", hint: "Змінна в catch має тип unknown: перевірте її через instanceof Error." },
    ],
  },
  {
    ...base, id: "ts-promise-combinators", lesson: "ts/63", xp: 30,
    title: "Паралельне завантаження й звіт про збої",
    context: "Сторінки й сервіси постійно збирають дані з кількох джерел. Promise.all дає всі результати разом, а allSettled дозволяє скласти звіт, навіть якщо частина запитів не вдалася.",
    brief: [
      "Функція <code>loadItem</code> вже готова: для <code>id</code>, що ділиться на 3, вона відхиляє проміс. Допишіть <code>loadAll(ids)</code> через <code>Promise.all</code>: вона повертає масив рядків у порядку аргументів, а помилку пропускає далі.",
      "Допишіть <code>summary(ids)</code> через <code>Promise.allSettled</code>: вона повертає рядок виду <code>успішно: X, збоїв: Y</code>.",
    ],
    starter: raw`function loadItem(id: number): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id % 3 === 0) {
        reject(new Error("не вдалося: " + id));
      } else {
        resolve("елемент " + id);
      }
    }, 10 - id);
  });
}

async function loadAll(ids: number[]): Promise<string[]> {
  // TODO: поверніть await Promise.all(ids.map(loadItem))
  return [];
}

async function summary(ids: number[]): Promise<string> {
  // TODO: Promise.allSettled(ids.map(loadItem)), порахуйте fulfilled і rejected
  return "";
}

async function main(): Promise<void> {
  console.log((await loadAll([1, 2, 4])).join(", "));
  try {
    await loadAll([1, 3]);
  } catch (error) {
    console.log("all відхилився:", error instanceof Error ? error.message : error);
  }
  console.log(await summary([1, 2, 3, 4, 6]));
}

main();
`,
    checks: [
      { on: "stdout", name: "Результати й звіт", equals: "елемент 1, елемент 2, елемент 4\nall відхилився: не вдалося: 3\nуспішно: 3, збоїв: 2", hint: "all зберігає порядок аргументів і відхиляється від першої помилки; у звіті 3 успішні (1, 2, 4) і 2 збої (3, 6)." },
      { on: "source", name: "Використано Promise.all", matches: "Promise\\.all\\s*\\(", hint: "Для loadAll скористайтеся Promise.all(ids.map(loadItem))." },
      { on: "source", name: "Використано Promise.allSettled", matches: "Promise\\.allSettled\\s*\\(", hint: "Для звіту скористайтеся Promise.allSettled і перевіряйте поле status." },
    ],
  },
  {
    ...base, id: "ts-sequential-parallel", lesson: "ts/64", xp: 30,
    title: "Послідовно й паралельно",
    context: "Вибір між циклом з await і Promise.all визначає швидкість програми. Порівнявши порядок подій, видно різницю без вимірювання часу, який нестабільний.",
    brief: [
      "Функція <code>square</code> друкує «старт» і «готово» й повертає квадрат числа. Допишіть <code>runSequential</code>: числа обробляються <b>по черзі</b> в циклі <code>for...of</code> з <code>await</code>.",
      "Допишіть <code>runParallel</code>: усі операції запускаються <b>одразу</b> через <code>map</code>, а чекаєте ви на них через <code>Promise.all</code>. У виводі видно, що всі «старт» стоять перед усіма «готово».",
    ],
    starter: raw`function square(n: number): Promise<number> {
  return new Promise((resolve) => {
    console.log("старт " + n);
    setTimeout(() => {
      console.log("готово " + n);
      resolve(n * n);
    }, 5);
  });
}

async function runSequential(numbers: number[]): Promise<number[]> {
  // TODO: for...of з await square(n), результати збирайте в масив
  return [];
}

async function runParallel(numbers: number[]): Promise<number[]> {
  // TODO: Promise.all(numbers.map(square))
  return [];
}

async function main(): Promise<void> {
  console.log("послідовно");
  console.log((await runSequential([1, 2])).join(","));
  console.log("паралельно");
  console.log((await runParallel([3, 4])).join(","));
}

main();
`,
    checks: [
      { on: "stdout", name: "Порядок подій і результати", equals: "послідовно\nстарт 1\nготово 1\nстарт 2\nготово 2\n1,4\nпаралельно\nстарт 3\nстарт 4\nготово 3\nготово 4\n9,16", hint: "Послідовно: старт і готово чергуються. Паралельно: спершу всі старти, потім усі готово." },
      { on: "source", name: "Цикл for...of", matches: "for\\s*\\(\\s*const\\s+\\w+\\s+of", hint: "Для послідовного варіанта використайте for (const n of numbers) { ... await square(n) ... }." },
      { on: "source", name: "Promise.all у паралельному варіанті", matches: "Promise\\.all\\s*\\(", hint: "Запустіть усі операції через numbers.map(square) і дочекайтеся Promise.all." },
    ],
  },
  {
    ...base, id: "ts-sleep-delay", lesson: "ts/65", xp: 25,
    title: "sleep, delay і зворотний відлік",
    context: "Пауза між запитами, повторні спроби й імітація повільних операцій у тестах починаються з маленької функції sleep. Вона працює без блокування решти програми.",
    brief: [
      "Допишіть <code>sleep(ms)</code>: проміс, що виконується через <code>ms</code> мілісекунд (<code>setTimeout</code>), і узагальнену <code>delay(ms, value)</code>, що виконується переданим значенням.",
      "Допишіть <code>countdown(from)</code>: для <code>n</code> від <code>from</code> до 1 друкує <code>n</code> і чекає <code>sleep(5)</code>, а наприкінці друкує <code>старт!</code>.",
    ],
    starter: raw`function sleep(ms: number): Promise<void> {
  // TODO: new Promise(resolve => setTimeout(resolve, ms))
  return Promise.resolve();
}

function delay<T>(ms: number, value: T): Promise<T> {
  // TODO: як sleep, але проміс виконується значенням value
  return Promise.resolve(value);
}

async function countdown(from: number): Promise<void> {
  // TODO: для n від from до 1 друкуйте n і чекайте sleep(5); наприкінці друкуйте "старт!"
}

async function main(): Promise<void> {
  await countdown(3);
  const word = await delay(5, "готово");
  console.log(word.toUpperCase());
}

main();
`,
    checks: [
      { on: "stdout", name: "Відлік і слово", equals: "3\n2\n1\nстарт!\nГОТОВО", hint: "Спершу 3, 2, 1, потім «старт!», а в кінці слово з delay у верхньому регістрі." },
      { on: "source", name: "Таймер усередині проміса", matches: "setTimeout", hint: "Загорніть setTimeout у new Promise." },
      { on: "source", name: "Очікування паузи", matches: "await\\s+sleep\\s*\\(", hint: "У countdown після друку числа чекайте await sleep(5)." },
    ],
  },
  {
    ...base, id: "ts-abortable-delay", lesson: "ts/66", xp: 35,
    title: "Затримка, яку можна скасувати",
    context: "Скасування довгих операцій економить ресурси: застарілий запит чи таймер просто зупиняють. Звичка приймати AbortSignal робить функції придатними до тайм-аутів і скасування користувачем.",
    brief: [
      "Допишіть <code>delay(ms, signal)</code>: проміс, що виконується рядком <code>\"минув час\"</code> через <code>ms</code> мілісекунд. Якщо сигнал спрацьовує під час очікування, зупиніть таймер через <code>clearTimeout</code> і відхиліть проміс з <code>new Error(\"скасовано\")</code>. Якщо сигнал уже скасований, відхиліть одразу.",
      "Підпишіться на подію <code>abort</code> через <code>signal.addEventListener</code>. Функція <code>run</code> уже готова: вона скасовує сигнал за потреби й повертає або результат, або текст помилки.",
    ],
    starter: raw`function delay(ms: number, signal?: AbortSignal): Promise<string> {
  // TODO: проміс, що виконується рядком "минув час" через ms мс (setTimeout);
  // якщо сигнал уже скасований або спрацьовує під час очікування:
  // clearTimeout і reject(new Error("скасовано"))
  return Promise.resolve("минув час");
}

async function run(ms: number, abortAfter: number | null): Promise<string> {
  const controller = new AbortController();
  if (abortAfter !== null) {
    setTimeout(() => controller.abort(), abortAfter);
  }
  try {
    return await delay(ms, controller.signal);
  } catch (error) {
    return error instanceof Error ? error.message : "невідома помилка";
  }
}

async function main(): Promise<void> {
  console.log(await run(5, null));
  console.log(await run(1000, 5));
}

main();
`,
    checks: [
      { on: "stdout", name: "Звичайний і скасований виклики", equals: "минув час\nскасовано", hint: "Перший виклик відпрацьовує повністю, а другий переривається через 5 мс і дає «скасовано»." },
      { on: "source", name: "Підписка на abort", matches: "addEventListener\\s*\\(\\s*[\"']abort[\"']", hint: "Підпишіться: signal.addEventListener(\"abort\", ..., { once: true })." },
      { on: "source", name: "Таймер зупиняється", matches: "clearTimeout", hint: "Під час скасування викличте clearTimeout(timer), щоб не тримати програму живою." },
    ],
  },
  {
    ...base, id: "ts-async-iterator", lesson: "ts/67", xp: 35,
    title: "Асинхронний генератор take і збирання потоку",
    context: "Потоки даних, як-от сторінки API чи рядки файлу, обробляють лінивими генераторами. Уміння взяти перші N елементів і коректно закрити джерело оберігає від витоків ресурсів.",
    brief: [
      "Джерело <code>ticker</code> нескінченно віддає числа 1, 2, 3 і при закритті друкує повідомлення. Допишіть генератор <code>take(source, limit)</code>: він віддає перші <code>limit</code> елементів джерела й зупиняється.",
      "Допишіть <code>collect(source)</code>: зберіть усі елементи джерела в масив циклом <code>for await</code>. Зупинка в <code>take</code> має закрити <code>ticker</code>, тому повідомлення про закриття з'явиться до підсумкового виводу.",
    ],
    starter: raw`async function* ticker(): AsyncGenerator<number> {
  let n = 1;
  try {
    while (true) {
      await Promise.resolve();
      yield n++;
    }
  } finally {
    console.log("ticker закрито");
  }
}

async function* take(source: AsyncIterable<number>, limit: number): AsyncGenerator<number> {
  // TODO: for await (const item of source): віддайте item (yield),
  // а коли віддано limit елементів, завершіть генератор (return)
}

async function collect(source: AsyncIterable<number>): Promise<number[]> {
  // TODO: зберіть усі елементи for await у масив
  return [];
}

async function main(): Promise<void> {
  const firstFour = await collect(take(ticker(), 4));
  console.log(firstFour.join(","));
}

main();
`,
    checks: [
      { on: "stdout", name: "Закриття джерела й результат", equals: "ticker закрито\n1,2,3,4", hint: "Після четвертого елемента зупиніть take через return: так закриється ticker, а collect поверне 1,2,3,4." },
      { on: "source", name: "Використано for await", matches: "for\\s+await\\s*\\(", hint: "І в take, і в collect читайте джерело циклом for await (const item of source)." },
      { on: "source", name: "Є yield", matches: "yield\\s+item", hint: "У take віддавайте елемент через yield item." },
    ],
  },
  {
    ...base, id: "ts-generators", lesson: "ts/68", xp: 30,
    title: "Генератори chunk і ids",
    context: "Генератори дозволяють описати послідовність, не будуючи її повністю в пам'яті: порції списку для пакетної обробки або необмежений потік ідентифікаторів.",
    brief: [
      "Допишіть генератор <code>chunk(items, size)</code>: він віддає по черзі підмасиви довжиною <code>size</code> (останній може бути коротшим). Скористайтеся <code>slice</code>.",
      "Допишіть нескінченний генератор <code>ids(prefix)</code>, що віддає <code>prefix-1</code>, <code>prefix-2</code> і так далі. Функція <code>takeIds</code> бере з нього потрібну кількість значень.",
    ],
    starter: raw`function* chunk<T>(items: T[], size: number): Generator<T[]> {
  // TODO: для i = 0, size, 2 * size... віддавайте items.slice(i, i + size)
}

function* ids(prefix: string): Generator<string> {
  // TODO: нескінченно віддавайте prefix + "-1", prefix + "-2", ...
}

function takeIds(count: number): string[] {
  const generator = ids("user");
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(String(generator.next().value));
  }
  return result;
}

console.log(JSON.stringify([...chunk([1, 2, 3, 4, 5], 2)]));
console.log(takeIds(3).join(" "));
`,
    checks: [
      { on: "stdout", name: "Порції й ідентифікатори", equals: "[[1,2],[3,4],[5]]\nuser-1 user-2 user-3", hint: "chunk дає [[1,2],[3,4],[5]], а ids віддає user-1, user-2, user-3 по одному." },
      { on: "source", name: "Оголошено генератори", matches: "function\\s*\\*\\s*chunk", hint: "chunk має бути генератором: function* chunk(...)." },
      { on: "source", name: "Використано yield", matches: "yield", hint: "Значення віддають оператором yield." },
    ],
  },
  {
    ...base, id: "ts-event-bus", lesson: "ts/69", xp: 35,
    title: "Типізована подієва шина з відпискою",
    context: "Шина подій зв'язує модулі без жорстких залежностей. Мапа подій на типах не дозволяє надіслати подію з неправильними даними й підказує форму даних у кожному обробнику.",
    brief: [
      "Допишіть клас <code>EventBus</code>. Метод <code>on(name, handler)</code> додає обробник у список для цієї назви й повертає функцію, що його видаляє. Метод <code>emit(name, data)</code> викликає всі обробники цієї назви по <b>копії</b> списку.",
      "Типи вже підготовлені: мапа подій <code>ShopEvents</code> задає форму даних кожної події. Далі програма додає товари, відписується від події й очищає кошик.",
    ],
    starter: raw`type Handler<T> = (data: T) => void;

class EventBus<E extends object> {
  private handlers: { [K in keyof E]?: Handler<E[K]>[] } = {};

  on<K extends keyof E>(name: K, handler: Handler<E[K]>): () => void {
    // TODO: додайте handler до списку для name; поверніть функцію, що видаляє його зі списку
    return () => {};
  }

  emit<K extends keyof E>(name: K, data: E[K]): void {
    // TODO: викличте всі обробники для name (по копії списку)
  }
}

interface ShopEvents {
  added: { title: string; price: number };
  cleared: undefined;
}

const bus = new EventBus<ShopEvents>();
let total = 0;

const offAdded = bus.on("added", (item) => {
  total += item.price;
  console.log("додано " + item.title + ", разом " + total);
});
bus.on("cleared", () => {
  total = 0;
  console.log("кошик порожній");
});

bus.emit("added", { title: "хліб", price: 30 });
bus.emit("added", { title: "сир", price: 120 });
offAdded();
bus.emit("added", { title: "молоко", price: 45 });
bus.emit("cleared", undefined);
console.log("підсумок " + total);
`,
    checks: [
      { on: "stdout", name: "Події, відписка й підсумок", equals: "додано хліб, разом 30\nдодано сир, разом 150\nкошик порожній\nпідсумок 0", hint: "Після offAdded() подію «молоко» ніхто не обробляє, тому в журналі її немає." },
      { on: "source", name: "Обробник додається до списку", matches: "push\\s*\\(", hint: "Додайте обробник у масив методом push." },
      { on: "source", name: "Відписка видаляє обробник", matches: "filter\\s*\\(|splice\\s*\\(", hint: "У функції відписки приберіть обробник зі списку через filter або splice." },
    ],
  },
  {
    ...base, id: "ts-pool", lesson: "ts/70", xp: 45,
    title: "Пул задач з обмеженим паралелізмом",
    context: "Масові запити без ліміту перевантажують сервери й виснажують з'єднання. Пул задач тримає кількість одночасних операцій у межах і зберігає порядок результатів.",
    brief: [
      "Допишіть <code>runPool(items, limit, worker)</code>: запустіть не більше <code>limit</code> «робітників». Кожен у циклі <code>while</code> бере наступний індекс зі спільного лічильника, виконує <code>worker</code> і записує результат за цим індексом. Наприкінці дочекайтеся всіх робітників через <code>Promise.all</code>.",
      "Програма сама рахує, скільки задач виконується одночасно, і друкує максимум: він не має перевищити ліміт.",
    ],
    starter: raw`async function runPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  // TODO: results = new Array(items.length); let next = 0;
  // запустіть Math.min(limit, items.length) робітників: while (next < items.length) { const index = next++; results[index] = await worker(items[index]); }
  // наприкінці await Promise.all(робітники) і return results
  return [];
}

let active = 0;
let maxActive = 0;

async function main(): Promise<void> {
  const results = await runPool([1, 2, 3, 4, 5, 6, 7], 3, async (n) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise<void>((resolve) => setTimeout(resolve, 5));
    active -= 1;
    return n * n;
  });
  console.log("результат: " + results.join(","));
  console.log("максимум одночасно: " + maxActive);
}

main();
`,
    checks: [
      { on: "stdout", name: "Результати й ліміт", equals: "результат: 1,4,9,16,25,36,49\nмаксимум одночасно: 3", hint: "Результати стоять у порядку вхідних елементів, а одночасно має працювати рівно 3 задачі." },
      { on: "source", name: "Цикл робітника", matches: "while\\s*\\(", hint: "Кожен робітник працює в циклі while, доки є невзяті задачі." },
      { on: "source", name: "Очікування всіх робітників", matches: "Promise\\.all\\s*\\(", hint: "Наприкінці дочекайтеся всіх робітників через Promise.all." },
    ],
  },
  {
    ...base, id: "ts-task-queue", lesson: "ts/71", xp: 40,
    title: "Черга задач із захищеним хвостом",
    context: "Послідовні записи, повідомлення в правильному порядку й дії, що не терплять перекриття, потребують черги. Збій однієї задачі не повинен зупиняти всі наступні.",
    brief: [
      "Допишіть клас <code>TaskQueue</code>. Він зберігає <code>tail</code>, тобто проміс останньої задачі. Метод <code>add(task)</code> підчіплює задачу до хвоста через <code>then</code>, повертає її результат, а новим хвостом робить версію, що ніколи не відхиляється (<code>catch</code>).",
      "Задачі додаються як <b>функції</b>. У виводі видно, що задачі йдуть строго по черзі, а збій другої не заважає третій.",
    ],
    starter: raw`class TaskQueue {
  // TODO: private tail: Promise<unknown> = Promise.resolve();

  add<T>(task: () => Promise<T>): Promise<T> {
    // TODO: const result = this.tail.then(task); хвіст = result.catch(() => undefined); return result;
    return task();
  }
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function job(name: string, ms: number, fail = false): Promise<string> {
  console.log("початок " + name);
  await pause(ms);
  if (fail) {
    throw new Error("збій " + name);
  }
  console.log("кінець " + name);
  return name;
}

async function main(): Promise<void> {
  const queue = new TaskQueue();
  const results = await Promise.allSettled([
    queue.add(() => job("A", 15)),
    queue.add(() => job("B", 5, true)),
    queue.add(() => job("C", 1)),
  ]);
  console.log(results.map((r) => (r.status === "fulfilled" ? r.value : "помилка")).join(","));
}

main();
`,
    checks: [
      { on: "stdout", name: "Порядок задач і результат", equals: "початок A\nкінець A\nпочаток B\nпочаток C\nкінець C\nA,помилка,C", hint: "Кожна задача починається лише після завершення попередньої, а збій B не зупиняє C." },
      { on: "source", name: "Ланцюжок через then", matches: "\\.then\\s*\\(", hint: "Підчепіть задачу до хвоста: this.tail.then(task)." },
      { on: "source", name: "Хвіст захищено від відхилення", matches: "\\.catch\\s*\\(", hint: "Новий хвіст має бути result.catch(() => undefined), щоб збій не ламав чергу." },
    ],
  },
  {
    ...base, id: "ts-retry", lesson: "ts/72", xp: 45,
    title: "Повтори з експоненційною паузою",
    context: "Тимчасові збої мережі зазвичай минають за мить. Повтор із наростаючою паузою перетворює такі збої на успіх, а перевірка shouldRetry не дає повторювати безнадійні запити.",
    brief: [
      "Допишіть <code>retry(action, options)</code>: до <code>options.attempts</code> спроб. Після невдачі, якщо спроба не остання, чекайте <code>options.sleep(baseDelay * 2 ** attempt)</code>. Після останньої невдачі киньте <b>останню</b> помилку.",
      "Якщо задано <code>shouldRetry</code> і він повертає <code>false</code> для помилки, кидайте її одразу, без пауз. Паузи записує підставна функція <code>sleep</code>, тож програма не чекає по-справжньому.",
    ],
    starter: raw`interface RetryOptions {
  attempts: number;
  baseDelay: number;
  sleep: (ms: number) => Promise<void>;
  shouldRetry?: (error: unknown) => boolean;
}

async function retry<T>(action: () => Promise<T>, options: RetryOptions): Promise<T> {
  // TODO: цикл по спробах; у catch запам'ятайте помилку, перевірте shouldRetry,
  // чекайте options.sleep(options.baseDelay * 2 ** attempt) (крім останньої спроби); наприкінці throw останньої помилки
  return action();
}

const waits: number[] = [];
const sleep = async (ms: number): Promise<void> => {
  waits.push(ms);
};

function makeFlaky(failures: number): () => Promise<string> {
  let calls = 0;
  return async () => {
    calls += 1;
    if (calls <= failures) {
      throw new Error("тимчасовий збій " + calls);
    }
    return "готово після " + calls + " спроб";
  };
}

function report(): string {
  return "паузи: " + (waits.join(",") || "немає");
}

async function main(): Promise<void> {
  console.log(await retry(makeFlaky(2), { attempts: 4, baseDelay: 100, sleep }));
  console.log(report());

  waits.length = 0;
  try {
    await retry(makeFlaky(10), { attempts: 3, baseDelay: 50, sleep });
  } catch (error) {
    console.log("здались: " + (error instanceof Error ? error.message : error));
  }
  console.log(report());

  waits.length = 0;
  try {
    await retry(makeFlaky(10), { attempts: 3, baseDelay: 50, sleep, shouldRetry: () => false });
  } catch (error) {
    console.log("без повторів: " + (error instanceof Error ? error.message : error));
  }
  console.log(report());
}

main().catch((error) => console.log("аварія: " + (error instanceof Error ? error.message : error)));
`,
    checks: [
      { on: "stdout", name: "Успіх, вичерпання спроб і shouldRetry", equals: "готово після 3 спроб\nпаузи: 100,200\nздались: тимчасовий збій 3\nпаузи: 50,100\nбез повторів: тимчасовий збій 1\nпаузи: немає", hint: "Паузи 100 і 200 мають бути лише між спробами, а після останньої спроби pause немає. shouldRetry зі значенням false зупиняє повтори одразу." },
      { on: "source", name: "Експоненційна пауза", matches: "\\*\\*|Math\\.pow", hint: "Пауза зростає як baseDelay * 2 ** attempt." },
      { on: "source", name: "Викликано sleep з options", matches: "options\\.sleep\\s*\\(", hint: "Чекайте через await options.sleep(...), а не через справжній таймер." },
    ],
  },
  {
    ...base, id: "ts-awaited", lesson: "ts/73", xp: 40,
    title: "Тип результатів сервісів через Awaited",
    context: "Типи відповідей, виведені з самих функцій, не розходяться з реальним кодом. Після зміни функції компілятор одразу показує всі місця, де використання результату стало неправильним.",
    brief: [
      "Замініть заготовку <code>Results</code>: для кожного ключа <code>K</code> тип має бути <code>Awaited&lt;ReturnType&lt;T[K]&gt;&gt;</code>. Тоді <code>all.user.nick</code> стане рядком, а <code>all.count</code> числом без приведень.",
      "Допишіть <code>runAll</code>: викличте кожну функцію з об'єкта, дочекайтеся результату (<code>await</code>) і зберіть значення в об'єкт з тими самими ключами.",
    ],
    starter: raw`type Services = Record<string, (...args: never[]) => unknown>;

// TODO: опишіть тип точно: { [K in keyof T]: Awaited<ReturnType<T[K]>> }
type Results<T extends Services> = Record<keyof T, any>;

async function runAll<T extends Services>(source: T): Promise<Results<T>> {
  // TODO: Promise.all по Object.entries(source): [ключ, await функція()]; потім Object.fromEntries
  return {} as Results<T>;
}

const services = {
  user: async () => ({ nick: "olena" }),
  count: async () => 3,
  version: () => "1.0",
};

async function main(): Promise<void> {
  const all = await runAll(services);
  console.log(all.user.nick, all.count + 1, all.version.toUpperCase());
  console.log(Object.keys(all).join(","));
}

main().catch(() => console.log("не реалізовано"));
`,
    checks: [
      { on: "stdout", name: "Значення й ключі", equals: "olena 4 1.0\nuser,count,version", hint: "Усі функції мають бути викликані й дочекані; ключі зберігають порядок із об'єкта services." },
      { on: "source", name: "Використано Awaited", matches: "Awaited\\s*<", hint: "Опишіть Results через Awaited<ReturnType<T[K]>>." },
      { on: "source", name: "Є await і Promise.all", matches: "Promise\\.all[\\s\\S]*await|await[\\s\\S]*Promise\\.all", hint: "Зберіть результати через Promise.all, а кожну функцію викликайте з await." },
    ],
  },
];
