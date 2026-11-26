export const LESSONS_11 = [
  {
    t: "Шари: інтерфейс, логіка, дані",
    ch: "Архітектура",
    easy: "Застосунок зручніше будувати як будинок з поверхів: нагорі інтерфейс, посередині правила бізнесу, внизу сховище даних. Кожен поверх знає лише про той, що під ним, і його можна змінити, не перебудовуючи решту.",
    p: [
      "Коли весь код перемішано в одному місці (обробник кліку одразу малює HTML, рахує знижку й пише в базу), будь-яка зміна зачіпає все, а тестувати нічого. Розв'язок — <b>розділення відповідальностей</b>: код поділяють на шари з чітким призначенням. Зазвичай виділяють три. <b>Інтерфейс</b> (presentation) показує дані й приймає дії користувача. <b>Логіка</b> (domain, сервіси) містить правила: що можна, що ні, як рахувати. <b>Дані</b> (repository) відповідають за збереження й читання: база, файл, мережа, пам'ять.",
      "Головне правило шарів — напрямок залежностей. Інтерфейс викликає сервіси, сервіси викликають сховище, але не навпаки. Логіка нічого не знає про DOM, <code>fetch</code> чи <code>localStorage</code>: вона працює зі звичайними об'єктами й функціями. Завдяки цьому її можна запустити в тесті, у консолі, на сервері й у браузері без змін. Якщо в сервісі замовлень з'являється <code>document.querySelector</code>, це сигнал порушення меж: логіка стала залежною від середовища й втратила переносність.",
      "Шар даних приховує спосіб зберігання за <b>інтерфейсом репозиторію</b>: набором методів на кшталт <code>all()</code>, <code>find(id)</code>, <code>save(item)</code>, <code>remove(id)</code>. Сервіс працює лише з цими методами. Реалізацій може бути кілька: у пам'яті для тестів, у <code>localStorage</code> для браузера, у базі для сервера. Підмінивши реалізацію, ви не чіпаєте жодного рядка бізнес-логіки. У JavaScript інтерфейс не оголошується формально, це просто домовленість про форму об'єкта, тож тут працює принцип «качиної типізації».",
      "Сервіс (шар логіки) вирішує завдання предметної області: <code>addTodo</code> відхиляє порожню назву й призначає ідентифікатор, <code>toggle</code> змінює стан, <code>list</code> фільтрує за статусом. Він повертає звичайні дані й кидає зрозумілі помилки. Інтерфейс перетворює ці дані на розмітку чи повідомлення й нічого не вирішує сам. Корисно, щоб сервіс був «чистим» наскільки можливо: усі джерела недетермінованості (час, випадковість, ідентифікатори, сховище) передаються йому ззовні, про що наступний урок.",
      "Переваги шарів очевидні під час тестування. Логіку перевіряють швидкими модульними тестами з репозиторієм у пам'яті, без браузера й мережі. Репозиторій перевіряють окремо, інтеграційними тестами. Інтерфейс перевіряють мінімально, бо в ньому майже немає правил. Тому зміна дизайну кнопки не ламає тестів бізнес-правил, а зміна правил не вимагає чіпати розмітку. Також зручно розподіляти роботу в команді: одні люди роблять екрани, інші правила, треті інтеграції.",
      "Не перегинайте. Для невеликого застосунку три шари можуть виглядати надмірно: достатньо двох функцій. Складайте шари тоді, коли відчуваєте біль: тестувати складно, зміни в одному місці ламають далекі частини, один і той самий код дублюється. Часта помилка — створити шар заради шару: «сервіс», що лише передає виклик у репозиторій і нічого не додає. Кожен шар має виправдовувати своє існування конкретним правилом, яке в ньому живе.",
      "Ці ідеї мають багато назв: чиста архітектура, гексагональна архітектура, MVC. Суть однакова: бізнес-логіка в центрі, подробиці (інтерфейс, сховище, мережа) на периферії й залежать від центру, а не навпаки. У практичному завданні ви напишете сервіс списку справ, який приймає репозиторій параметром, і побачите, як легко підмінити сховище, не змінивши жодного рядка логіки.",
    ],
    code: [
      String.raw`function createMemoryRepository() {
  const items = new Map();
  return {
    all: () => [...items.values()],
    find: (id) => items.get(id) ?? null,
    save: (item) => { items.set(item.id, item); return item; },
    remove: (id) => items.delete(id),
  };
}
const repo = createMemoryRepository();
repo.save({ id: 1, title: "Купити хліб", done: false });
console.log(repo.all(), repo.find(2));`,
      String.raw`function createMemoryRepository() {
  const items = new Map();
  return {
    all: () => [...items.values()],
    find: (id) => items.get(id) ?? null,
    save: (item) => { items.set(item.id, item); return item; },
  };
}
function createTodoService(repository, nextId = () => Date.now()) {
  return {
    add(title) {
      const clean = String(title).trim();
      if (clean === "") throw new RangeError("Назва не може бути порожньою");
      return repository.save({ id: nextId(), title: clean, done: false });
    },
    toggle(id) {
      const todo = repository.find(id);
      if (!todo) throw new Error("Справу не знайдено: " + id);
      return repository.save({ ...todo, done: !todo.done });
    },
    list(status = "all") {
      return repository.all().filter((t) => status === "all" || (status === "done") === t.done);
    },
  };
}
let id = 0;
const service = createTodoService(createMemoryRepository(), () => ++id);
service.add("Хліб");
service.add("  Молоко  ");
service.toggle(1);
console.log(service.list("done"), service.list("all").length);`,
      String.raw`// фрагмент: інтерфейс лише відображає дані, а правила лишаються в сервісі
button.addEventListener("click", () => {
  try {
    service.add(input.value);
    render(service.list());
  } catch (error) {
    errorBox.textContent = error.message;
  }
});`,
      String.raw`const calls = [];
const spyRepository = {
  all: () => [],
  find: () => null,
  save: (item) => { calls.push(item); return item; },
  remove: () => false,
};
const service = createTodoService(spyRepository, () => 7);
service.add("Тест");
console.log(calls);
function createTodoService(repository, nextId) {
  return { add: (title) => repository.save({ id: nextId(), title, done: false }) };
}`,
      String.raw`// аварія: логіка напряму звертається до DOM, тому поза браузером (у тесті чи на сервері) вона не працює
function addTodo(title) {
  const list = document.querySelector("#todos");
  list.append(title);
}
console.log("Додаємо справу");
addTodo("Хліб");`,
    ],
    note: "Розділяйте код на інтерфейс, логіку й дані, а залежності спрямовуйте донизу. Логіка не знає про DOM і сховища та працює з репозиторієм як з інтерфейсом. Так її легко тестувати й переносити. Шари вводьте тоді, коли від безладу вже болить.",
    work: "У командних проєктах шари дозволяють паралельну роботу й дешеві зміни: замінити базу чи редизайнити екран можна, не переписуючи бізнес-правила. Тестувати чисту логіку на порядки швидше й надійніше, ніж інтерфейс, тому команди цінують такий поділ.",
    tasks: [
      "Які три шари виділяють у застосунку й у якому напрямку мають спрямовуватися залежності?",
      "Що таке інтерфейс репозиторію і чому підміна сховища не потребує змін у бізнес-логіці?",
    ],
  },
  {
    t: "Залежності параметрами",
    ch: "Архітектура",
    easy: "Замість того щоб функція сама дістала собі базу, годинник чи логер із глобального простору, їх передають їй при створенні, як інструменти у валізі майстра. Тоді в тесті можна покласти інші інструменти.",
    p: [
      "Залежність — це все, без чого функція чи модуль не працює: база даних, мережа, годинник, генератор випадкових чисел, логер, інший сервіс. Є два способи їх отримати. Перший: звернутися до глобальної змінної чи імпортувати готовий екземпляр (<code>import db from \"./db.js\"</code>, <code>Date.now()</code>, <code>Math.random()</code>). Другий: отримати залежності <b>ззовні</b>, параметрами конструктора чи фабрики. Другий підхід називають впровадженням залежностей (dependency injection, DI), і він робить код передбачуваним та тестованим.",
      "Приклад. Функція <code>createUserService({ db, clock, logger })</code> повертає об'єкт із методами. Усередині вона використовує тільки отримані об'єкти: <code>clock.now()</code>, <code>logger.info(...)</code>, <code>db.save(...)</code>. У продакшені їй передають справжні реалізації, а в тесті фальшиві: годинник із фіксованим часом, логер, що записує повідомлення в масив, базу в пам'яті. Не потрібно жодних глобальних підмін, жодних «магічних» бібліотек: звичайні функції й об'єкти.",
      "Залежності можна передавати по-різному. Параметрами функції (для простих випадків), одним об'єктом із іменованими полями (читабельно при кількох залежностях, легко додавати нові), через конструктор класу. Для необов'язкових залежностей задають значення за замовчуванням: <code>function createService({ clock = { now: () =&gt; Date.now() } } = {})</code>. Тоді код працює «з коробки», а в тестах підмінюється. Але не робіть усі залежності необов'язковими без потреби: явна вимога краще, ніж тихий запасний варіант, що ховає неправильну конфігурацію.",
      "Потрібне й місце, де все збирають докупи, — <b>корінь композиції</b> (composition root). Це одна точка на вході програми (зазвичай <code>main.js</code>), де створюються реальні залежності та з'єднуються між собою: репозиторій передається сервісу, сервіс інтерфейсу. Решта коду про створення залежностей не знає. Так граф залежностей видно в одному файлі, а зміна реалізації (база на файловій системі замість пам'яті) — це правка одного рядка.",
      "Для великих застосунків роблять <b>контейнер залежностей</b>: об'єкт, у який реєструють фабрики за іменами, а він створює екземпляри на вимогу й кешує їх (singleton). Контейнер вирішує порядок створення (сервіс потребує репозиторій, репозиторій потребує підключення) і має виявляти <b>циклічні залежності</b>, коли <code>a</code> потребує <code>b</code>, а <code>b</code> потребує <code>a</code>, видаючи зрозумілу помилку замість нескінченної рекурсії. У JavaScript нескладний контейнер займає два десятки рядків.",
      "Антипатерни. <b>Service locator</b>: сервіс сам звертається до глобального реєстру («дай мені базу») і тим самим ховає свої залежності: за сигнатурою не видно, що йому потрібно. <b>Одинаки</b> (singletons), доступні глобально, ускладнюють тести: стан протікає між ними. <b>Надмірна кількість залежностей</b>: якщо конструктор приймає десять об'єктів, клас, імовірно, робить забагато й потребує розбиття. А ще не варто впроваджувати залежності для всього підряд: прості чисті утиліти (<code>Math.max</code>) підміняти не треба.",
      "Практична користь від DI відчувається одразу: тести пишуться без складного налаштування, код читається (залежності видно у сигнатурі), заміна реалізацій безболісна. Узагальнюючи: усе, що робить функцію недетермінованою чи залежною від середовища, передавайте їй ззовні. Саме так працюють серверні фреймворки, і саме такий невеликий контейнер із виявленням циклів ви напишете в практичному завданні.",
    ],
    code: [
      String.raw`function createUserService({ db, clock, logger }) {
  return {
    register(name) {
      const user = { id: db.size + 1, name, createdAt: clock.now() };
      db.set(user.id, user);
      logger.info("створено користувача " + name);
      return user;
    },
  };
}
const messages = [];
const service = createUserService({
  db: new Map(),
  clock: { now: () => "2024-01-01T00:00:00Z" },
  logger: { info: (m) => messages.push(m) },
});
console.log(service.register("Оля"), messages);`,
      String.raw`function createContainer() {
  const factories = new Map();
  const instances = new Map();
  const resolving = [];
  const container = {
    register(name, factory) {
      factories.set(name, factory);
    },
    resolve(name) {
      if (instances.has(name)) return instances.get(name);
      if (!factories.has(name)) throw new Error("Невідома залежність: " + name);
      if (resolving.includes(name)) throw new Error("Циклічна залежність: " + [...resolving, name].join(" -> "));
      resolving.push(name);
      try {
        const instance = factories.get(name)(container);
        instances.set(name, instance);
        return instance;
      } finally {
        resolving.pop();
      }
    },
  };
  return container;
}
const c = createContainer();
c.register("db", () => ({ name: "db" }));
c.register("repo", (c) => ({ db: c.resolve("db") }));
console.log(c.resolve("repo").db === c.resolve("db"));
c.register("a", (c) => c.resolve("b"));
c.register("b", (c) => c.resolve("a"));
try { c.resolve("a"); } catch (e) { console.log(e.message); }
try { c.resolve("nothing"); } catch (e) { console.log(e.message); }`,
      String.raw`// корінь композиції: єдине місце, де створюють і з'єднують реальні залежності
function main() {
  const repository = createMemoryRepository();
  const service = createTodoService(repository, () => 1);
  return { repository, service };
}
function createMemoryRepository() {
  const items = [];
  return { save: (x) => (items.push(x), x), all: () => items };
}
function createTodoService(repository, nextId) {
  return { add: (title) => repository.save({ id: nextId(), title }) };
}
const app = main();
app.service.add("Хліб");
console.log(app.repository.all());`,
      String.raw`// антипатерн: прихована залежність від глобального часу робить функцію недетермінованою
function isExpiredBad(token) {
  return Date.now() > token.expiresAt;
}
// краще: час передається ззовні
function isExpired(token, now) {
  return now > token.expiresAt;
}
const token = { expiresAt: 1000 };
console.log(isExpired(token, 999), isExpired(token, 1001));`,
      String.raw`// аварія: залежність не передали, і замість тихого запасного варіанту сервіс одразу пояснює, чого бракує
function createService(deps) {
  const missing = ["db", "logger"].filter((name) => !deps?.[name]);
  if (missing.length > 0) throw new Error("Не передано залежності: " + missing.join(", "));
  return { ok: true };
}
console.log(createService({ db: {}, logger: {} }));
console.log(createService({ db: {} }));`,
    ],
    note: "Залежності (час, база, логер, випадковість) передавайте ззовні, а збирайте в корені композиції. У тестах підставляйте фальшиві. Контейнер залежностей має виявляти цикли, а service locator і глобальні одинаки приховують залежності й ускладнюють тести.",
    work: "Серверні фреймворки (NestJS, плагіни Fastify) та тестові набори тримаються на впровадженні залежностей. Код, де кожну залежність видно в сигнатурі, швидко розуміється новачками, без зусиль тестується й легко переносить заміну реалізацій.",
    tasks: [
      "Що таке впровадження залежностей і чим корінь композиції відрізняється від service locator?",
      "Навіщо контейнеру виявляти циклічні залежності та як це робиться?",
    ],
  },
  {
    t: "Події: власний EventEmitter",
    ch: "Архітектура",
    easy: "Подієва модель дозволяє одним частинам програми сповіщати інші, не знаючи про них: один кричить «замовлення створено», а підписані слухачі самі вирішують, що робити. Це радіо, а не телефонний дзвінок конкретній людині.",
    p: [
      "Коли модуль має сповістити про щось інших (замовлення оплачено, файл завантажено, користувач вийшов), прямий виклик пов'язує його з усіма отримувачами: він мусить знати про кожного. Подієва модель розриває цей зв'язок. <b>Видавець</b> (emitter) просто оголошує подію з ім'ям і даними, а <b>слухачі</b> (listeners) підписуються на імена подій і реагують. Видавець нічого не знає про слухачів, їх можна додавати й прибирати без зміни його коду. Цей патерн називають «видавець-підписник» чи Observer.",
      "У Node.js є вбудований клас <code>EventEmitter</code> (<code>import { EventEmitter } from \"node:events\"</code>), а в браузерах <code>EventTarget</code>. Базові методи EventEmitter: <code>on(name, listener)</code> підписує, <code>off(name, listener)</code> (він же <code>removeListener</code>) відписує, <code>once(name, listener)</code> підписує на одне спрацювання, <code>emit(name, ...args)</code> викликає слухачів по порядку підписки з переданими аргументами й повертає <code>true</code>, якщо слухачі були. Слухачі викликаються <b>синхронно</b>, один за одним, у момент <code>emit</code>.",
      "Написати спрощений аналог нескладно: об'єкт зберігає <code>Map</code> «ім'я події → масив слухачів». Метод <code>on</code> додає функцію в масив, <code>emit</code> проходить по масиву й викликає кожну. Важлива тонкість: під час <code>emit</code> слухач може відписати себе чи інших (наприклад, <code>once</code> робиться саме так). Якщо змінювати масив, по якому йдете, частину слухачів буде пропущено. Тому <code>emit</code> працює із <b>копією</b> списку слухачів, зробленою до виклику.",
      "Подія <code>\"error\"</code> має особливий статус у Node.js: якщо її випущено, а слухачів немає, <code>emit</code> кидає саму помилку (ту, що передано аргументом), і процес може впасти. Це свідомий захист від мовчазних збоїв: помилку не можна проігнорувати випадково. Для власної реалізації варто повторити цю поведінку. Також корисно, щоб виняток в одному слухачі не заважав іншим: або перехоплювати його, або (як Node) дозволити йому перервати емісію, але чітко задокументувати вибір.",
      "Підводні камені. <b>Витоки пам'яті</b>: слухач, підписаний на довгоживучий об'єкт і не знятий, тримає у замиканні все, що використовує. Node попереджає, якщо на одну подію підписано понад десять слухачів (<code>MaxListenersExceededWarning</code>). Завжди знімайте підписки, коли вони не потрібні (при знищенні компонента), або використовуйте <code>once</code> й <code>AbortSignal</code>. <b>Порядок слухачів</b>: покладатися на нього не варто, якщо слухачі незалежні. <b>Синхронність</b>: довгий слухач блокує <code>emit</code>, а отже й видавця.",
      "Не плутайте події з колбеками й промісами. Колбек чи проміс описують <b>одну</b> відповідь на конкретний виклик. Подія може відбутися багато разів або жодного й має множину слухачів, які не залежать від того, хто її викликав. Тому для результату операції беріть проміс, а для потоку незалежних повідомлень (клік, повідомлення сокета, зміна стану) беріть події. Іноді їх поєднують: <code>events.once(emitter, \"ready\")</code> перетворює першу появу події на проміс.",
      "Подієві системи є всюди: DOM, Node-потоки, WebSocket, Redux (підписка на store), шини повідомлень між мікросервісами. Власний EventEmitter на п'ятдесят рядків дає глибоке розуміння всіх цих механізмів і буває корисним у невеликих проєктах без залежностей. Саме його ви реалізуєте в практичному завданні: з підпискою, відпискою, одноразовими слухачами, лічильником слухачів і поведінкою події <code>error</code>.",
    ],
    code: [
      String.raw`class Emitter {
  #listeners = new Map();
  on(name, listener) {
    if (typeof listener !== "function") throw new TypeError("Слухач має бути функцією");
    if (!this.#listeners.has(name)) this.#listeners.set(name, []);
    this.#listeners.get(name).push(listener);
    return this;
  }
  off(name, listener) {
    const list = this.#listeners.get(name);
    if (!list) return this;
    const i = list.findIndex((l) => l === listener || l.original === listener);
    if (i !== -1) list.splice(i, 1);
    return this;
  }
  once(name, listener) {
    const wrapper = (...args) => {
      this.off(name, wrapper);
      listener(...args);
    };
    wrapper.original = listener;
    return this.on(name, wrapper);
  }
  emit(name, ...args) {
    const list = this.#listeners.get(name);
    if (!list || list.length === 0) {
      if (name === "error") throw args[0] instanceof Error ? args[0] : new Error("Необроблена подія error");
      return false;
    }
    for (const listener of [...list]) listener(...args);
    return true;
  }
  listenerCount(name) {
    return this.#listeners.get(name)?.length ?? 0;
  }
}
const bus = new Emitter();
bus.on("order", (id, total) => console.log("лог:", id, total));
bus.once("order", (id) => console.log("одноразово для", id));
console.log(bus.emit("order", 1, 100), bus.emit("order", 2, 50), bus.emit("nothing"));
console.log(bus.listenerCount("order"));`,
      String.raw`import { EventEmitter, once } from "node:events";
const emitter = new EventEmitter();
emitter.on("ready", (name) => console.log("готовий:", name));
setTimeout(() => emitter.emit("ready", "сервер"), 5);
const [name] = await once(emitter, "ready");
console.log("проміс отримав:", name);
console.log(emitter.listenerCount("ready"), emitter.emit("unknown"));`,
      String.raw`import { EventEmitter } from "node:events";
const emitter = new EventEmitter();
function logOnce() {
  console.log("слухач");
  emitter.off("tick", logOnce);   // відписка під час емісії
}
emitter.on("tick", logOnce);
emitter.on("tick", () => console.log("другий слухач"));
emitter.emit("tick");
emitter.emit("tick");`,
      String.raw`// витік: слухач на довгоживучому об'єкті тримає замикання, тому його знімають явно
import { EventEmitter } from "node:events";
const bus = new EventEmitter();
function mount(name) {
  const handler = () => console.log(name, "отримав подію");
  bus.on("update", handler);
  return () => bus.off("update", handler);   // функція очищення
}
const unmountA = mount("A");
const unmountB = mount("B");
bus.emit("update");
unmountA();
bus.emit("update");
console.log(bus.listenerCount("update"));`,
      String.raw`// аварія: подію error випущено без жодного слухача, тому emit кидає саму помилку
import { EventEmitter } from "node:events";
const emitter = new EventEmitter();
emitter.on("data", () => {});
console.log("Випускаємо подію error без слухача");
emitter.emit("error", new Error("з'єднання розірвано"));`,
    ],
    note: "Видавець не знає слухачів: <code>on</code> підписує, <code>off</code> відписує, <code>once</code> дає одне спрацювання, <code>emit</code> викликає копію списку слухачів. Подія <code>error</code> без слухача кидає помилку. Слухачі, не зняті вчасно, спричиняють витоки.",
    work: "DOM, потоки Node, WebSocket-клієнти, шини повідомлень і стани застосунку використовують події. Вони послаблюють зв'язки між модулями, але потребують дисципліни: вчасних відписок, обробки помилок, обмеження кількості слухачів і чіткого порядку їх виклику.",
    tasks: [
      "Чим подієва модель відрізняється від прямого виклику функції та навіщо emit працює з копією списку слухачів?",
      "Що станеться, якщо випустити подію error без слухачів, і як уникнути витоку через забуті підписки?",
    ],
  },
  {
    t: "Патерн Store",
    ch: "Архітектура",
    adv: true,
    easy: "Store — це «сейф» зі станом застосунку: у нього одна дверцята (<code>dispatch</code>), одне вікно (<code>getState</code>) і дзвінок для тих, хто хоче знати про зміни (<code>subscribe</code>). Так стан не розповзається по програмі.",
    p: [
      "Коли стан застосунку (поточний користувач, кошик, відкрите вікно) розкидано по багатьох змінних і компонентах, важко зрозуміти, хто й коли його змінив, а частини інтерфейсу розходяться між собою. Патерн <b>Store</b> збирає стан в одному місці й вводить жорсткі правила зміни. Він лежить в основі Redux, Zustand, Vuex та подібних бібліотек і спирається на три ідеї: єдине джерело правди, стан лише для читання й зміни через чисті функції.",
      "Зміни описуються <b>діями</b> (actions): звичайними об'єктами з полем <code>type</code> та, за потреби, даними: <code>{ type: \"add\", title: \"Хліб\" }</code>. Дію відправляють методом <code>dispatch(action)</code>. Новий стан обчислює <b>редюсер</b> (reducer) — чиста функція <code>(state, action) =&gt; newState</code>. Вона не змінює старий стан, а повертає новий об'єкт (<code>{ ...state, items: [...state.items, item] }</code>), не робить запитів, не читає годинник. Через це зміни передбачувані, їх легко тестувати, а історію дій можна відтворити.",
      "Store надає три методи. <code>getState()</code> повертає поточний стан (його не можна змінювати напряму). <code>dispatch(action)</code> передає дію редюсеру, зберігає новий стан і сповіщає підписників. <code>subscribe(listener)</code> реєструє функцію, яку викликають після кожної зміни, і повертає функцію <code>unsubscribe</code>. Інтерфейс при цьому перемальовується з нового стану, а не змінюється вручну, і розбіжностей між даними та екраном не виникає.",
      "Прості правила надійності. Дія без поля <code>type</code> — помилка програміста, і store має кидати виняток одразу. Редюсер повинен повертати стан для будь-якої дії, зокрема невідомої (поверніть старий стан у гілці <code>default</code>); значення <code>undefined</code> означало б втрату стану. Підписникам повідомляють лише про справжню зміну: якщо редюсер повернув той самий об'єкт, нічого не змінилося, і перемальовувати не потрібно. Відписка підписника під час сповіщення не має ламати обхід, тому працюють із копією списку.",
      "Великий стан розбивають на частини: кожна має свій редюсер, а <code>combineReducers({ todos, filter })</code> збирає з них кореневий, що передає кожному його шматок стану. <b>Селектори</b> — маленькі функції <code>(state) =&gt; значення</code>, що витягують потрібне (<code>selectActiveTodos</code>); вони ховають структуру стану від інтерфейсу й дозволяють кешувати обчислення. <b>Мідлвари</b> (middleware) перехоплюють дії між <code>dispatch</code> і редюсером: логування, асинхронні запити, аналітика.",
      "Асинхронність не належить редюсерам. Запит до сервера виконують поза ними, а на його старті, успіху й невдачі відправляють прості дії (<code>fetchStarted</code>, <code>fetchSucceeded</code>, <code>fetchFailed</code>), які редюсер обробляє синхронно. Так стан завжди відображає, що відбувається: завантаження, дані чи помилка. Це чітка модель, у якій кожна зміна має причину в журналі дій.",
      "Коли Store потрібен? Для невеликого стану вистачає змінної й функції. Store виправданий, коли стан спільний для багатьох частин інтерфейсу, зміни складні, а історія дій і відтворюваність цінні (налагодження в часі, скасування). У практичному завданні ви напишете мінімальний <code>createStore</code> і <code>combineReducers</code> та побачите, що ядро такої бібліотеки займає менше сорока рядків. Усе інше (інструменти розробника, оптимізації) надбудови над цим ядром.",
    ],
    code: [
      String.raw`function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = new Set();
  return {
    getState: () => state,
    dispatch(action) {
      if (!action || typeof action.type !== "string") throw new TypeError("Дія має мати рядкове поле type");
      const next = reducer(state, action);
      if (next === undefined) throw new Error("Редюсер не повернув стан для " + action.type);
      if (next !== state) {
        state = next;
        for (const listener of [...listeners]) listener(state);
      }
      return action;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
function todos(state = [], action) {
  switch (action.type) {
    case "add": return [...state, { id: state.length + 1, title: action.title, done: false }];
    case "toggle": return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    default: return state;
  }
}
const store = createStore(todos, []);
const off = store.subscribe((s) => console.log("підписник: справ", s.length));
store.dispatch({ type: "add", title: "Хліб" });
store.dispatch({ type: "toggle", id: 1 });
store.dispatch({ type: "невідома" });      // стан той самий: підписник мовчить
off();
store.dispatch({ type: "add", title: "Молоко" });
console.log(store.getState());`,
      String.raw`const combineReducers = (reducers) => (state = {}, action) => {
  let changed = false;
  const next = {};
  for (const [key, reducer] of Object.entries(reducers)) {
    next[key] = reducer(state[key], action);
    if (next[key] !== state[key]) changed = true;
  }
  return changed ? next : state;
};
const counter = (state = 0, action) => (action.type === "inc" ? state + 1 : state);
const name = (state = "", action) => (action.type === "rename" ? action.value : state);
const root = combineReducers({ counter, name });
let state = root(undefined, { type: "@@init" });
state = root(state, { type: "inc" });
state = root(state, { type: "rename", value: "Оля" });
console.log(state, root(state, { type: "nothing" }) === state);`,
      String.raw`const selectActive = (state) => state.filter((t) => !t.done);
const selectCount = (state) => ({ total: state.length, active: selectActive(state).length });
const state = [{ id: 1, done: true }, { id: 2, done: false }, { id: 3, done: false }];
console.log(selectCount(state), selectActive(state).map((t) => t.id));
const logger = (store) => (next) => (action) => {
  console.log("дія:", action.type);
  return next(action);
};
const dispatch = logger({})((action) => action);
dispatch({ type: "test" });`,
      String.raw`const reducer = (state, action) => {
  const before = JSON.stringify(state);
  const next = action.type === "inc" ? { ...state, n: state.n + 1 } : state;
  console.log("старий стан не змінено:", JSON.stringify(state) === before, "новий об'єкт:", next !== state);
  return next;
};
reducer({ n: 0 }, { type: "inc" });
reducer({ n: 0 }, { type: "other" });
const frozen = Object.freeze({ n: 0 });
console.log(reducer(frozen, { type: "inc" }).n);`,
      String.raw`// аварія: дія без поля type порушує контракт store, і dispatch одразу кидає помилку
function createStore(reducer, state) {
  return {
    dispatch(action) {
      if (!action || typeof action.type !== "string") throw new TypeError("Дія має мати рядкове поле type");
      state = reducer(state, action);
    },
  };
}
const store = createStore((s) => s, {});
store.dispatch({ type: "ok" });
console.log("перша дія пройшла");
store.dispatch({ title: "забули type" });`,
    ],
    note: "Store тримає стан в одному місці й міняє його лише через <code>dispatch(action)</code> та чистий редюсер, який повертає новий об'єкт. Підписники викликаються тільки при справжній зміні, а <code>combineReducers</code> збирає редюсери частин. Асинхронну роботу виконують поза редюсером.",
    work: "Redux, Zustand, Pinia і NgRx вирішують цю ж задачу. Єдине джерело правди й журнал дій дають передбачуваний інтерфейс, прості тести й можливість налагоджувати «подорожжю в часі», повторюючи записані дії крок за кроком.",
    tasks: [
      "Із чого складається Store і чому редюсер має бути чистою функцією?",
      "Для чого потрібні combineReducers і селектори та чому асинхронні запити не виконують у редюсері?",
    ],
  },
  {
    t: "Патерни Observer і Strategy",
    ch: "Архітектура",
    adv: true,
    easy: "Observer — це «підписка на новини»: хтось повідомляє, інші слухають. Strategy — «змінний інструмент»: алгоритм вибирають за назвою, а не довгим <code>if</code>. Обидва прибирають жорсткі зв'язки між частинами коду.",
    p: [
      "Патерни проєктування — це перевірені розв'язки типових проблем із назвами, які допомагають командам швидко порозумітись. Не потрібно вивчати їх усі, але кілька трапляються постійно. Ми вже бачили <b>Observer</b> (спостерігач) у вигляді подій і <code>subscribe</code>, а тепер розглянемо його поруч зі <b>Strategy</b> (стратегія). Обидва засновані на одній ідеї: код працює з абстрактним інтерфейсом, а конкретну поведінку підставляють ззовні.",
      "<b>Observer</b>: об'єкт (суб'єкт) має список підписників і сповіщає їх при змінах. Він не знає, що вони роблять із повідомленням, а вони не втручаються в його роботу. Приклади: інтерфейс, що перемальовується при зміні даних; журнал, що записує події; метрики. Спостерігачів можна додавати без змін суб'єкта. Недолік — каскади: реакція одного спостерігача викликає зміну, що знову сповіщає інших, і складно прослідкувати порядок. Тому слухачі мають бути швидкими, а ланцюги повідомлень короткими.",
      "<b>Strategy</b>: коли існує кілька способів зробити одне й те саме (порахувати знижку, відсортувати, відформатувати, відправити повідомлення), кожен окремий спосіб оформлюють функцією з однаковою сигнатурою, а потрібний вибирають під час виконання. Замість <code>if (type === \"bulk\") ... else if (type === \"coupon\") ...</code> у коді з'являється таблиця <code>{ bulk: fn1, coupon: fn2 }</code> і виклик <code>strategies[type](order)</code>. Додати новий спосіб означає додати запис у таблицю, не чіпаючи решти коду: це принцип «відкритий для розширення, закритий для зміни».",
      "У JavaScript стратегіями природно слугують функції: вони є значеннями, їх можна зберігати в об'єкті чи <code>Map</code>, передавати параметром і повертати. Не потрібні класи й інтерфейси, як у Java. Якщо стратегії мають спільний стан чи кілька методів, використовують об'єкти. Також стратегії можна комбінувати: функція, що приймає іншу стратегію й обгортає її (наприклад, «застосувати знижку, потім ліміт знижки»), по суті є <b>декоратором</b>.",
      "Реєстр стратегій має поводитись обережно з невідомими ключами. Якщо користувач передав назву, якої немає, потрібно кинути зрозумілу помилку (<code>RangeError: Невідома стратегія: ...</code>), а не мовчки повернути <code>undefined</code> і впасти далі на «is not a function». Також використовуйте <code>Object.hasOwn</code> або <code>Map</code>, щоб назви на кшталт <code>\"constructor\"</code> чи <code>\"toString\"</code> не потрапляли на успадковані властивості. Валідація назви — частина контракту реєстру.",
      "Як вибирати між <code>switch</code> і стратегіями? Для двох-трьох простих варіантів, що не змінюються, <code>switch</code> цілком нормальний і прозоріший. Стратегії виграють, коли варіантів багато, вони додаються часто, їх треба підміняти в тестах або налаштовувати ззовні (з конфігурації, з плагінів). Зайва абстракція шкодить так само, як і її відсутність, тож вводьте її, коли побачили, що сьогоднішній <code>if</code> уже вчетверте змінюють у різних місцях.",
      "Разом ці патерни дають гнучку систему: події сповіщають про те, що сталося, а стратегії визначають, що робити. У практичному завданні ви напишете «калькулятор цін» із реєстром стратегій: звичайна ціна, оптова знижка, купон. Спробуйте відчути, як легко додати нову стратегію без жодної зміни в основному коді, і де вона перевіряється. Це і є практична користь патернів: не терміни для співбесіди, а менше болю під час змін.",
    ],
    code: [
      String.raw`const strategies = {
  regular: ({ price, qty }) => price * qty,
  bulk: ({ price, qty }) => (qty >= 10 ? price * qty * 0.9 : price * qty),
  coupon: ({ price, qty, percent }) => price * qty * (1 - percent / 100),
};
function calculate(name, order) {
  if (!Object.hasOwn(strategies, name)) throw new RangeError("Невідома стратегія: " + name);
  return strategies[name](order);
}
console.log(calculate("regular", { price: 100, qty: 2 }));
console.log(calculate("bulk", { price: 100, qty: 10 }));
console.log(calculate("coupon", { price: 100, qty: 1, percent: 25 }));`,
      String.raw`class Subject {
  #observers = new Set();
  subscribe(fn) {
    this.#observers.add(fn);
    return () => this.#observers.delete(fn);
  }
  notify(value) {
    for (const fn of [...this.#observers]) fn(value);
  }
}
const price = new Subject();
const unsubscribe = price.subscribe((v) => console.log("інтерфейс: ціна", v));
price.subscribe((v) => console.log("журнал: ціна змінилась на", v));
price.notify(100);
unsubscribe();
price.notify(120);`,
      String.raw`const withLimit = (strategy, maxDiscount) => (order) => {
  const full = order.price * order.qty;
  return Math.max(strategy(order), full - maxDiscount);
};
const coupon = ({ price, qty, percent }) => price * qty * (1 - percent / 100);
const limited = withLimit(coupon, 50);
console.log(coupon({ price: 1000, qty: 1, percent: 50 }), limited({ price: 1000, qty: 1, percent: 50 }));
const sorters = {
  byName: (a, b) => a.name.localeCompare(b.name, "uk"),
  byAge: (a, b) => a.age - b.age,
};
const people = [{ name: "Яр", age: 20 }, { name: "Арка", age: 30 }];
console.log(people.toSorted(sorters.byName).map((p) => p.name), people.toSorted(sorters.byAge).map((p) => p.name));`,
      String.raw`const registry = new Map();
const register = (name, fn) => registry.set(name, fn);
register("upper", (s) => s.toUpperCase());
register("trim", (s) => s.trim());
const run = (name, input) => {
  const fn = registry.get(name);
  if (!fn) throw new RangeError("Невідома стратегія: " + name);
  return fn(input);
};
console.log(run("upper", "кіт"), JSON.stringify(run("trim", "  а  ")));
const plain = {};
console.log(typeof plain["constructor"], Object.hasOwn(plain, "constructor"));`,
      String.raw`// аварія: стратегію з такою назвою не зареєстровано, і реєстр одразу пояснює проблему
const strategies = { regular: (o) => o.price * o.qty };
function calculate(name, order) {
  if (!Object.hasOwn(strategies, name)) throw new RangeError("Невідома стратегія: " + name);
  return strategies[name](order);
}
console.log(calculate("regular", { price: 5, qty: 2 }));
console.log(calculate("black-friday", { price: 5, qty: 2 }));`,
    ],
    note: "Observer сповіщає підписників, не знаючи їх, а Strategy замінює довгий <code>if</code> таблицею функцій з однаковою сигнатурою. Реєстр стратегій перевіряє назву й не плутає її з успадкованими властивостями. Вводьте патерни, коли варіантів багато або вони часто змінюються.",
    work: "Знижки й тарифи, формати експорту, способи оплати, правила сортування й перевірки у реальних системах зберігаються як набір стратегій. Нову стратегію можна додати конфігурацією або плагіном без переписування ядра системи та без ризику зламати наявні.",
    tasks: [
      "Чим Observer відрізняється від Strategy і яку проблему розв'язує кожен?",
      "Чому реєстр стратегій має перевіряти назву через Object.hasOwn або Map і що кидати для невідомої?",
    ],
  },
  {
    t: "Конфігурація і feature flags",
    ch: "Архітектура",
    adv: true,
    easy: "Конфігурація — це «налаштування на пульті», а feature flag — вимикач окремої можливості: нову функцію можна показати лише частині користувачів або вимкнути за секунду, якщо вона раптом зламалась, і не перевипускати програму.",
    p: [
      "Хороший застосунок поводиться по-різному в різних середовищах (розробка, тестування, продакшен) і для різних клієнтів, але код при цьому один. Різницю виносять у <b>конфігурацію</b>: значення, що читаються під час запуску. Налаштування зазвичай шарами: значення за замовчуванням у коді, потім файл налаштувань, потім змінні середовища, потім аргументи командного рядка. Пізніший шар перекриває попередній. Це вирішує функція глибокого злиття, у якій вкладені об'єкти об'єднуються по ключах, а прості значення й масиви замінюються цілком.",
      "Конфігурацію треба <b>перевіряти</b> на старті. Обов'язкові поля, типи, діапазони (порт від 1 до 65535), допустимі значення (режим тільки з переліку). Збирайте всі помилки й показуйте одним повідомленням, а не по одній: розробник виправить усе разом. Після перевірки конфігурацію заморожують (<code>Object.freeze</code>, глибоко), щоб жоден код не міг змінити її під час роботи. Секрети (ключі, паролі) беруть зі змінних середовища чи сховища секретів, ніколи не з репозиторію, і не друкують у журнали.",
      "<b>Feature flags</b> (прапорці функцій) — це перемикачі, які вмикають і вимикають можливості без нового релізу. Нова функція розробляється й випускається вимкненою, а вмикається, коли готова. Якщо після увімкнення щось пішло не так, прапорець вимикають за секунду без відкату коду (так званий kill switch). Так розвʼязують дві проблеми: відокремлюють розгортання коду від запуску можливості та знижують ризик великих релізів.",
      "Простий прапорець має стан «увімкнено/вимкнено», але частіше потрібне <b>поступове розгортання</b> (rollout): спершу для 5% користувачів, потім для 25%, 100%. Важливо, щоб один і той самий користувач завжди потрапляв у ту саму групу, інакше функція блимала б при кожному оновленні сторінки. Для цього беруть <b>детермінований хеш</b> від імені прапорця й ідентифікатора користувача, перетворюють на число від 0 до 99 («кошик») і порівнюють із відсотком розгортання. Додаючи ім'я прапорця до хешу, ви розподіляєте користувачів по-різному для різних прапорців.",
      "Поширені додаткові правила: список обраних користувачів, які бачать функцію завжди (команда розробки, бета-тестери), пріоритет списку над відсотком, окремі значення за середовищем. Прапорцями можуть бути й не булеві значення: варіанти експерименту для A/B-тестів. Прапорці зручно тримати в одній службі <code>flags</code>, яку передають залежністю, а не читати з глобального стану, тоді в тестах легко задати потрібні значення.",
      "Прапорцями легко зловживати. Забуті старі прапорці перетворюють код на лабіринт гілок: коли функція повністю розгорнута, прапорець і мертву гілку видаляють. Не залишайте у прапорців «тимчасові» значення роками. Тестуйте обидві гілки. Не використовуйте їх замість конфігурації безпеки: перевірка прав — це не прапорець. Названий прапорець має описувати функцію (<code>newCheckout</code>), а не стан (<code>flag1</code>), і мати відповідальну людину та дату перегляду.",
      "Підсумуємо. Конфігурація керує тим, <b>як</b> програма працює в середовищі; прапорці керують тим, <b>що</b> бачать користувачі. Обидва інструменти вимагають перевірки, документації й акуратного видалення відпрацьованого. У практичному завданні ви напишете злиття шарів конфігурації й службу прапорців із детермінованим відсотковим розгортанням: ці два прийоми трапляються в будь-якому серйозному продукті.",
    ],
    code: [
      String.raw`function mergeConfig(...layers) {
  const isPlain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const merge = (a, b) => {
    const out = { ...a };
    for (const [key, value] of Object.entries(b)) {
      out[key] = isPlain(value) && isPlain(a[key]) ? merge(a[key], value) : value;
    }
    return out;
  };
  return layers.reduce(merge, {});
}
const defaults = { port: 3000, db: { host: "localhost", pool: 5 }, tags: ["a"] };
const fromFile = { db: { host: "db.internal" }, tags: ["b", "c"] };
const fromEnv = { port: 8080 };
console.log(mergeConfig(defaults, fromFile, fromEnv));`,
      String.raw`function validateConfig(config) {
  const problems = [];
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) problems.push("port має бути цілим від 1 до 65535");
  if (!["development", "production"].includes(config.mode)) problems.push("mode має бути development або production");
  if (typeof config.db?.host !== "string" || config.db.host === "") problems.push("db.host обов'язковий");
  if (problems.length > 0) throw new Error("Некоректна конфігурація:\n- " + problems.join("\n- "));
  return config;
}
console.log(validateConfig({ port: 8080, mode: "production", db: { host: "x" } }));
try {
  validateConfig({ port: 0, mode: "test", db: {} });
} catch (error) {
  console.log(error.message);
}`,
      String.raw`function bucket(flag, userId) {
  let hash = 0;
  for (const ch of flag + ":" + userId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % 100;
}
function isEnabled(config, name, userId) {
  const flag = config[name];
  if (!flag || !flag.enabled) return false;
  if (flag.users?.includes(userId)) return true;
  if (flag.rollout === undefined) return true;
  return bucket(name, userId) < flag.rollout;
}
const config = { newCheckout: { enabled: true, rollout: 30, users: ["admin"] }, beta: { enabled: false } };
console.log(isEnabled(config, "newCheckout", "admin"), isEnabled(config, "beta", "admin"), isEnabled(config, "nothing", "x"));
console.log(isEnabled(config, "newCheckout", "u1") === isEnabled(config, "newCheckout", "u1"));
let count = 0;
for (let i = 0; i < 1000; i++) if (isEnabled(config, "newCheckout", "user" + i)) count++;
console.log(count > 200 && count < 400);`,
      String.raw`function deepFreeze(object) {
  for (const value of Object.values(object)) {
    if (value && typeof value === "object") deepFreeze(value);
  }
  return Object.freeze(object);
}
const config = deepFreeze({ port: 3000, db: { host: "x" } });
console.log(Object.isFrozen(config.db));
try {
  config.db.host = "y";
} catch (error) {
  console.log(error.name);
}
console.log(config.db.host);`,
      String.raw`// аварія: порт у конфігурації некоректний, і перевірка на старті зупиняє програму зі зрозумілим переліком проблем
function validateConfig(config) {
  const problems = [];
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) problems.push("port має бути цілим від 1 до 65535");
  if (problems.length > 0) throw new Error("Некоректна конфігурація: " + problems.join("; "));
  return config;
}
console.log(validateConfig({ port: 8080 }).port);
console.log(validateConfig({ port: "80x" }).port);`,
    ],
    note: "Конфігурацію збирають шарами (значення за замовчуванням, файл, середовище), перевіряють на старті й заморожують. Feature flag вмикає функцію без релізу; поступове розгортання використовує детермінований хеш від прапорця й користувача. Старі прапорці видаляйте.",
    work: "Компанії випускають зміни по кілька разів на день саме завдяки прапорцям: нова можливість спершу бачить мала частка користувачів, а при проблемі її вимикають без відкату. Конфігурація ж відрізняє розробку від продакшену без зміни коду.",
    tasks: [
      "Як шарами збирають конфігурацію й навіщо її перевіряють та заморожують після завантаження?",
      "Чому для поступового розгортання feature flag використовують детермінований хеш користувача і що таке kill switch?",
    ],
  },
];
