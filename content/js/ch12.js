export const LESSONS_12 = [
  {
    t: "Проєкт: аналіз тексту",
    ch: "Проєкти",
    easy: "Перший проєкт: програма, яка читає шматок тексту й розповідає про нього все цікаве: скільки слів, речень, які слова трапляються найчастіше. Вона об'єднує рядки, регулярні вирази, словники й сортування в одну корисну функцію.",
    p: [
      "Проєкт відрізняється від окремої вправи тим, що вимоги описані словами, а розв'язок складається з кількох взаємопов'язаних кроків. Починайте не з коду, а з <b>постановки задачі</b>: що саме має повернути програма? Наша функція <code>analyzeText(text, { top })</code> повертає об'єкт зі статистикою: кількість слів і унікальних слів, кількість речень, кількість літер, середню довжину слова, найдовше слово, список найчастіших слів і орієнтовний час читання. Для кожного поля запишіть точне визначення, бо від нього залежить код.",
      "Перший крок — <b>розбір на слова</b>. Простий <code>split(\" \")</code> не годиться: у тексті є розділові знаки, дефіси, апострофи, числа. Надійний спосіб — регулярний вираз за літерами й цифрами: <code>/[\\p{L}\\p{N}'’-]+/gu</code>. Він сприймає слова з апострофом (<code>м'ята</code>) і з дефісом (<code>кафе-бар</code>) як одне слово. Перед розбором текст приводять до нижнього регістру, щоб «Кіт» і «кіт» були одним словом. Окремі токени з самих дефісів чи апострофів відкидаємо, залишаючи ті, що містять хоча б одну літеру чи цифру.",
      "Другий крок — <b>підрахунок частот</b> через <code>Map</code>. Для кожного слова збільшуємо лічильник. Кількість унікальних слів — це розмір множини. Для списку найчастіших слів сортуємо пари за кількістю за спаданням, а при рівній кількості за алфавітом (<code>localeCompare</code> з мовою <code>\"uk\"</code>), інакше порядок буде нестабільним і тести ламатимуться. Тоді беремо перші <code>top</code> записів і перетворюємо їх на об'єкти <code>{ word, count }</code>.",
      "Третій крок — <b>речення</b>. Ділимо текст за знаками <code>.</code>, <code>!</code>, <code>?</code> та <code>…</code> (послідовності таких знаків вважаємо одним роздільником) і рахуємо непорожні частини, що містять хоча б одну літеру чи цифру. Так «Привіт!!!» буде одним реченням, а крапка наприкінці не створить зайвого порожнього. Літери рахуємо через <code>\\p{L}</code>, а середню довжину слова обчислюємо як суму літер і цифр у словах, поділену на кількість слів, з округленням до двох знаків.",
      "Час читання — проста формула: за близько 200 слів на хвилину <code>Math.ceil(words / 200)</code>, а для порожнього тексту нуль. Продумайте <b>граничні випадки</b> до того, як писати код: порожній рядок, рядок із самих розділових знаків, текст з числами, регістр, слова з дефісом. Саме вони відрізняють надійну функцію від такої, що працює лише на прикладі з підручника. Кожен випадок має бути тестом, а помилкове значення входу (<code>null</code>, число) вирішіть свідомо: кинути <code>TypeError</code> чи привести до рядка.",
      "Структуру коду розкладіть на невеликі чисті функції: <code>tokenize</code>, <code>countWords</code>, <code>splitSentences</code>, <code>topWords</code>. Кожну можна перевірити окремо, а <code>analyzeText</code> лише збирає їх результати. Так виглядає звичайний підхід до проєктів: велика задача розбивається на маленькі, кожна з яких зрозуміла й має тест. Спершу зробіть версію для найпростішого тексту, переконайтесь, що тести проходять, і лише потім додавайте складніші випадки.",
      "Наприкінці проведіть мінірефакторинг: приберіть дублювання, дайте іменам зрозумілі назви, винесіть «магічні числа» (200 слів на хвилину) в константи. Подумайте, як розширити програму: аналіз кількох мов, ігнорування стоп-слів («і», «в», «на»), підрахунок біграм, потокова обробка великих файлів по рядках через асинхронні ітератори. Хороший проєкт залишає ваш код придатним до розвитку, а не одноразовим, і це відчуття ви винесете в наступні проєкти.",
    ],
    code: [
      String.raw`const tokenize = (text) =>
  (text.toLowerCase().match(/[\p{L}\p{N}'’-]+/gu) ?? []).filter((w) => /[\p{L}\p{N}]/u.test(w));
console.log(tokenize("Кіт і кіт! Кафе-бар, м'ята — 2024 -- ' - ."));
console.log(tokenize("").length, tokenize("... !!!").length);`,
      String.raw`function topWords(words, top) {
  const counts = new Map();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  return [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "uk"))
    .slice(0, top)
    .map(([word, count]) => ({ word, count }));
}
console.log(topWords(["пес", "кіт", "кіт", "пес", "миша"], 3));
console.log(topWords([], 3));`,
      String.raw`function countSentences(text) {
  return text.split(/[.!?…]+/).filter((part) => /[\p{L}\p{N}]/u.test(part)).length;
}
console.log(countSentences("Привіт! Як справи? Добре..."), countSentences("Без крапки"), countSentences(""), countSentences("!!!"));
const letters = (text) => (text.match(/\p{L}/gu) ?? []).length;
console.log(letters("Кіт, 2 пси!"));`,
      String.raw`const WORDS_PER_MINUTE = 200;
const readingMinutes = (words) => (words === 0 ? 0 : Math.ceil(words / WORDS_PER_MINUTE));
console.log(readingMinutes(0), readingMinutes(1), readingMinutes(200), readingMinutes(201), readingMinutes(1000));
const round2 = (x) => Math.round(x * 100) / 100;
console.log(round2(30 / 8), round2(2 / 3), round2(0));`,
      String.raw`// аварія: функція не перевіряє вхід, і на null виникає TypeError усередині регулярного виразу
function analyzeText(text) {
  const words = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return { words: words.length };
}
console.log(analyzeText("Привіт, світе"));
console.log(analyzeText(null));`,
    ],
    note: "Проєкт починають з точних визначень кожного поля результату, потім розбивають на малі чисті функції: розбір на слова (<code>\\p{L}</code> з прапорцем <code>u</code>), частоти в <code>Map</code>, сортування за кількістю та алфавітом, підрахунок речень. Граничні випадки перевіряйте тестами.",
    work: "Аналіз тексту лежить в основі пошуку, хмар слів, перевірки читабельності, антиспаму й підказок у редакторах. Навичка розбити нечітку задачу на чіткі кроки й гранично протестувати її важлива в будь-якому проєкті.",
    tasks: [
      "Чому розбір тексту на слова краще робити регулярним виразом із \\p{L}, а не split(\" \"), і навіщо потрібне вторинне сортування за алфавітом?",
      "Які граничні випадки варто перевірити в analyzeText і чому код розбивають на малі чисті функції?",
    ],
  },
  {
    t: "Проєкт: список справ зі сховищем",
    ch: "Проєкти",
    easy: "Другий проєкт — застосунок списку справ без інтерфейсу: усі правила й збереження в одному модулі. Він об'єднує шари, залежності параметрами, JSON і обробку несправних даних у браузерному сховищі.",
    p: [
      "Список справ — класичний навчальний проєкт, бо в ньому є все: дані, правила, збереження, пошук, статистика. Ми будуємо лише <b>ядро</b>: функцію <code>createTodoApp(storage, options)</code>, яка не залежить ні від DOM, ні від конкретного сховища. Усе, що потрібно ззовні, вона отримує параметрами: сховище з методами <code>getItem</code> та <code>setItem</code> (у браузері це <code>localStorage</code>, у тесті проста заглушка), годинник <code>now()</code> та генератор ідентифікаторів. Такий дизайн ми вивчали в главі про архітектуру, і тепер застосуємо його разом.",
      "Модель справи: <code>{ id, title, done, createdAt }</code>. Операції: <code>add(title)</code> (назва обрізається, порожня відхиляється помилкою), <code>toggle(id)</code>, <code>remove(id)</code>, <code>clearDone()</code>, <code>list({ status, search })</code> та <code>stats()</code>. Ідентифікатори мають бути унікальними: типове рішення — лічильник, що починається з найбільшого збереженого id плюс один, інакше після перезапуску нові справи отримали б ті самі номери, що й старі. Значення часу беремо з <code>now()</code>, а не з <code>Date.now()</code>, щоб тести були детермінованими.",
      "<b>Збереження</b>. Після кожної зміни список серіалізують у JSON і записують у сховище під одним ключем. При створенні застосунку список читають назад. Тут потрібна обережність, про яку ми говорили в уроці про збереження стану: запису ще може не бути (<code>getItem</code> повертає <code>null</code>), дані можуть бути зіпсованими (<code>JSON.parse</code> кидає помилку), а може виявитись, що збережено не масив. У всіх цих випадках програма має стартувати з порожнім списком, а не падати.",
      "Запис теж може не вдатися: сховище переповнене чи вимкнене (<code>QuotaExceededError</code>). Проєкт, яким приємно користуватись, не втрачає дані в пам'яті через проблему зі збереженням: помилку запису перехоплюють і, наприклад, лише повідомляють у консоль, а застосунок продовжує працювати зі станом у пам'яті. Прийміть чітке рішення, що саме робити, і перевірте його тестом із сховищем, чий <code>setItem</code> завжди кидає помилку.",
      "<b>Фільтрація</b>. Параметр <code>status</code> приймає <code>\"all\"</code>, <code>\"active\"</code> чи <code>\"done\"</code>; будь-яке інше значення — помилка програміста, і краще кинути <code>RangeError</code>, ніж мовчки повернути все. Пошук за підрядком робиться без урахування регістру. Повертайте з <code>list</code> <b>копії</b> об'єктів, щоб зовнішній код не міг змінити внутрішній стан, обминаючи правила (захисне копіювання з уроку про посилання). Статистика — звичайна згортка: загальна кількість, виконані, активні.",
      "Подумайте про порядок і атомарність. Операція має або виконатись повністю, або не змінювати нічого: якщо <code>toggle</code> викликали для неіснуючого id, стан і сховище лишаються без змін, а користувач отримує зрозумілу помилку. Збереження викликається лише після успішної зміни. Не плутайте ситуації: «справу не знайдено» — помилка, а видалення неіснуючої справи може бути просто поверненням <code>false</code>. Вибір документуйте й перевіряйте тестами.",
      "Коли ядро працює, інтерфейс стає тонким шаром: кнопка викликає <code>app.add(input.value)</code> й перемальовує <code>app.list()</code>. Розширення проєкту: підписка на зміни (як у Store), скасування останньої дії, пріоритети й терміни, синхронізація з сервером через клієнт API з наступного проєкту. Кожне з них додається, не змінюючи основних правил, а це і є ознака вдалої архітектури.",
    ],
    code: [
      String.raw`function loadTodos(storage) {
  const text = storage.getItem("todos");
  if (text === null) return [];
  try {
    const value = JSON.parse(text);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
const make = (value) => ({ getItem: () => value });
console.log(loadTodos(make(null)), loadTodos(make("{ зіпсовано")), loadTodos(make('{"a":1}')), loadTodos(make('[{"id":1}]')));`,
      String.raw`function saveTodos(storage, todos) {
  try {
    storage.setItem("todos", JSON.stringify(todos));
    return true;
  } catch (error) {
    console.warn("не вдалося зберегти:", error.name);
    return false;
  }
}
const full = { setItem() { throw new DOMException("Quota", "QuotaExceededError"); } };
console.log(saveTodos(full, [1]), saveTodos({ setItem() {} }, [1]));`,
      String.raw`const todos = [
  { id: 1, title: "Купити хліб", done: false },
  { id: 2, title: "Написати звіт", done: true },
  { id: 3, title: "Купити молоко", done: false },
];
function list(items, { status = "all", search = "" } = {}) {
  if (!["all", "active", "done"].includes(status)) throw new RangeError("Невідомий статус: " + status);
  const query = search.trim().toLowerCase();
  return items
    .filter((t) => status === "all" || (status === "done") === t.done)
    .filter((t) => t.title.toLowerCase().includes(query))
    .map((t) => ({ ...t }));
}
console.log(list(todos, { search: "КУПИТИ" }).map((t) => t.id), list(todos, { status: "done" }).map((t) => t.id));
const stats = (items) => ({ total: items.length, done: items.filter((t) => t.done).length, active: items.filter((t) => !t.done).length });
console.log(stats(todos));`,
      String.raw`const nextIdAfter = (items) => items.reduce((max, t) => Math.max(max, t.id), 0) + 1;
console.log(nextIdAfter([]), nextIdAfter([{ id: 3 }, { id: 7 }, { id: 5 }]));
const copy = [{ id: 1, title: "a" }].map((t) => ({ ...t }));
copy[0].title = "змінено ззовні";
console.log(copy[0].title);`,
      String.raw`// аварія: операція над неіснуючою справою має кидати зрозумілу помилку, а не падати на undefined
const todos = [{ id: 1, title: "Хліб", done: false }];
function toggle(id) {
  const todo = todos.find((t) => t.id === id);
  todo.done = !todo.done;
}
toggle(1);
console.log(todos[0].done);
toggle(99);`,
    ],
    note: "Ядро застосунку отримує сховище, годинник і генератор id параметрами. Читання зі сховища захищайте від <code>null</code>, зіпсованого JSON та не масиву, а помилку запису не дозволяйте валити програму. Повертайте копії й перевіряйте статус фільтра.",
    work: "Так будують нотатки, трекери завдань, кошики й форми з чернетками: логіка окремо, збереження через інтерфейс. Така структура дозволяє замінити localStorage на сервер чи IndexedDB, не чіпаючи правил і тестів, а перевірити всю логіку без браузера.",
    tasks: [
      "Що робити, коли зі сховища прочитано null, зіпсований JSON чи не масив, і чому помилку запису не варто «пропускати вгору»?",
      "Навіщо повертати копії справ із list і як гарантувати унікальність ідентифікаторів після перезапуску?",
    ],
  },
  {
    t: "Проєкт: API-клієнт із кешем і повторами",
    ch: "Проєкти",
    easy: "Третій проєкт збирає докупи все, чому ви навчились у мережевих главах: клієнт API з тайм-аутами, повторами, кешем і правильними помилками. Це справжній модуль, який можна вставити в робочий застосунок.",
    p: [
      "Ми будуємо <code>createApiClient(options)</code>: об'єкт із методами <code>get</code> та <code>post</code>, який приховує всю мережеву кухню. Усе недетерміноване він отримує ззовні: <code>fetchFn</code> (замість глобального <code>fetch</code>), <code>sleep(ms)</code> для пауз між повторами й <code>now()</code> для кешу. Завдяки цьому тести працюють без мережі й без реального очікування: затримки підроблені, відповіді підготовлені як <code>Response</code>. Налаштування: <code>baseUrl</code>, <code>retries</code> (скільки повторних спроб), <code>backoffMs</code> (базова пауза) та <code>ttlMs</code> (час життя кешу).",
      "<b>Побудова запиту</b>. Адресу складайте через <code>new URL(path, baseUrl)</code>, а параметри додавайте через <code>searchParams</code>, щоб кодування було правильним. Пропускайте <code>null</code> та <code>undefined</code> у параметрах. У <code>fetchFn</code> передавайте рядок адреси й об'єкт налаштувань із заголовками. Для <code>post</code> додайте <code>Content-Type: application/json</code> і тіло <code>JSON.stringify(body)</code>. Відповіді розбирайте через <code>text()</code> і <code>JSON.parse</code>: порожнє тіло (<code>204</code>) дає <code>null</code>, а не помилку розбору.",
      "<b>Помилки</b>. Клієнт має класифікувати збої. HTTP-відповідь не з діапазону 2xx перетворюється на <code>HttpError</code> з полем <code>status</code> і повідомленням <code>HTTP 404</code>, до якого, за наявності, додається текст помилки з тіла відповіді. Мережевий збій (<code>fetchFn</code> відхилився, зазвичай <code>TypeError</code>) — окремий випадок. Нечітка помилка «щось не так» марна для користувача й розробника, тому кожному виду потрібна своя ознака: <code>instanceof</code>, ім'я або статус.",
      "<b>Повтори</b>. Повторювати можна лише ті збої, які можуть бути тимчасовими: мережеві помилки, <code>429</code> і будь-які <code>5xx</code>. Клієнтські помилки (<code>400</code>, <code>404</code>, <code>422</code>) повтор не виправить, тож їх одразу передають далі. Паузи між спробами зростають експоненційно: <code>backoffMs * 2 ** attempt</code>, тобто 100, 200, 400 мс і так далі. Запит <code>post</code> за замовчуванням <b>не повторюють</b>, бо він не ідемпотентний: повтор міг би створити дублікат, якщо перший запит усе-таки дійшов до сервера. Після вичерпання спроб кидайте останню помилку.",
      "<b>Кеш і дедуплікація</b> для <code>get</code>. Успішні відповіді зберігають за повною адресою на <code>ttlMs</code> мілісекунд (час береться з <code>now()</code>). Одночасні запити на ту саму адресу діляться одним <code>fetchFn</code>-викликом, для цього зберігайте in-flight проміс. Помилки не кешуйте: інакше короткий збій «застрягне» на весь TTL. Після успішного <code>post</code> кеш очищується, бо дані на сервері могли змінитися, і подальші <code>get</code> мають отримати свіжі.",
      "<b>Тестування</b>. Підготуйте фальшивий <code>fetchFn</code>, який бере відповіді з черги: перша 503, друга 503, третя 200. Підроблений <code>sleep</code> записує викликані паузи в масив, і ви перевіряєте, що вони дорівнювали 100 та 200, а загальний час тесту — міліметри. Перевірте також: правильну адресу з параметрами; відсутність повторів для 404; вичерпання спроб; мережеву помилку з подальшим успіхом; кеш у межах TTL та після нього; дедуплікацію одночасних запитів; <code>post</code> без повторів і очищення кешу.",
      "Цей проєкт — міні-версія бібліотек на кшталт axios, ky чи TanStack Query. Написавши її власноруч, ви розумієте, що вони роблять, і зможете налаштувати їх чи замінити. Подальші покращення: скасування запитів через <code>AbortSignal</code>, джитер у паузах, заголовок <code>Retry-After</code>, ліміти розміру кешу, ключі кешу з урахуванням заголовків, інвалідація за тегами. Але навіть проста версія розв'язує більшість практичних задач і дуже наочно показує сенс усіх попередніх глав.",
    ],
    code: [
      String.raw`class HttpError extends Error {
  constructor(status, body) {
    super("HTTP " + status + (body?.error ? ": " + body.error : ""));
    this.name = "HttpError";
    this.status = status;
  }
}
const retryable = (error) => !(error instanceof HttpError) || error.status === 429 || error.status >= 500;
async function withRetries(fn, { retries, backoffMs, sleep }) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries || !retryable(error)) throw error;
      await sleep(backoffMs * 2 ** attempt);
    }
  }
}
const responses = [503, 503, 200];
const sleeps = [];
const result = await withRetries(
  async () => {
    const status = responses.shift();
    if (status !== 200) throw new HttpError(status);
    return "дані";
  },
  { retries: 3, backoffMs: 100, sleep: async (ms) => sleeps.push(ms) },
);
console.log(result, sleeps);`,
      String.raw`function buildUrl(baseUrl, path, params = {}) {
  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.href;
}
console.log(buildUrl("https://api.test", "/users", { page: 2, q: "кіт", skip: null }));
async function parseBody(response) {
  const text = await response.text();
  return text === "" ? null : JSON.parse(text);
}
console.log(await parseBody(new Response(null, { status: 204 })), await parseBody(new Response('{"id":1}')));`,
      String.raw`function createCache(ttlMs, now) {
  const store = new Map();
  const inflight = new Map();
  return {
    async get(key, load) {
      const hit = store.get(key);
      if (hit && now() - hit.at < ttlMs) return hit.value;
      if (inflight.has(key)) return inflight.get(key);
      const promise = load().then((value) => {
        store.set(key, { value, at: now() });
        return value;
      }).finally(() => inflight.delete(key));
      inflight.set(key, promise);
      return promise;
    },
    clear() { store.clear(); },
  };
}
let time = 0;
let calls = 0;
const cache = createCache(100, () => time);
const load = async () => ++calls;
console.log(await Promise.all([cache.get("k", load), cache.get("k", load)]), calls);
time = 50;
console.log(await cache.get("k", load), calls);
time = 100;
console.log(await cache.get("k", load), calls);`,
      String.raw`const queue = [new Response("збій", { status: 503 }), new Response('{"id":7}', { status: 200 })];
const fakeFetch = async (url, options) => {
  console.log(options?.method ?? "GET", url);
  return queue.shift();
};
const first = await fakeFetch("https://api.test/users/7");
console.log(first.ok, first.status);
const second = await fakeFetch("https://api.test/users/7");
console.log(second.ok, await second.json());`,
      String.raw`// аварія: після вичерпання спроб клієнт кидає останню помилку, яку викликач не обробив
class HttpError extends Error {
  constructor(status) {
    super("HTTP " + status);
    this.status = status;
  }
}
async function request() {
  throw new HttpError(503);
}
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    await request();
  } catch (error) {
    console.log("спроба", attempt + 1, error.message);
    if (attempt === 2) throw error;
  }
}`,
    ],
    note: "Клієнт отримує <code>fetchFn</code>, <code>sleep</code> та <code>now</code> ззовні. Повторюються мережеві збої, <code>429</code> і <code>5xx</code> з експоненційними паузами, а 4xx ні. <code>post</code> не повторюється й очищає кеш. Кеш має TTL, ділить in-flight запити й не зберігає помилок.",
    work: "Власний клієнт API з повторами, кешем і чіткими помилками є в кожному серйозному фронтенді чи сервісі. Він визначає, як продукт поводиться під час збоїв, а ці хвилини найкраще відрізняють якісний сервіс від посереднього.",
    tasks: [
      "Які помилки клієнт API має повторювати, а які ні, і чому post зазвичай не повторюють?",
      "Як кеш із TTL поєднується з дедуплікацією in-flight запитів і чому помилки не зберігають у кеші?",
    ],
  },
  {
    t: "Проєкт: черга задач із пріоритетами",
    ch: "Проєкти",
    adv: true,
    easy: "Четвертий проєкт — диспетчер задач: клієнти додають роботу з різною важливістю, а черга видає її «працівникам» у правильному порядку й не більше потрібної кількості одночасно. Так працюють фонові обробники, завантажувачі й планувальники.",
    p: [
      "Черга задач (task queue) — спільна інфраструктура багатьох систем: відправка листів, обробка зображень, синхронізація даних, фонові скрипти. Вона вирішує три питання. <b>Порядок</b>: термінові задачі виконуються раніше за звичайні. <b>Паралелізм</b>: одночасно виконується не більше <code>concurrency</code> задач, щоб не перевантажити систему. <b>Результат</b>: той, хто додав задачу, отримує проміс, який виконається її значенням або відхилиться її помилкою. Ми поєднуємо ідеї пулу задач, пріоритетних черг і промісів.",
      "Інтерфейс: <code>createTaskQueue({ concurrency })</code> повертає об'єкт з методами <code>add(fn, { priority })</code> (повертає проміс), <code>onIdle()</code> (проміс, що виконується, коли черга порожня й нічого не виконується), а також спостережувані властивості <code>size</code> (скільки задач чекає) та <code>running</code> (скільки виконується). Задача — це функція, що повертає значення чи проміс. Вона не запускається в момент <code>add</code>, а ставиться в чергу: початок виконання вирішує планувальник.",
      "<b>Порядок</b> визначають два правила: вища пріоритетність (<code>priority</code>) йде першою, а при рівній пріоритетності діє «першим прийшов, першим пішов» (FIFO). Найпростіша реалізація зберігає масив і вставляє нову задачу так, щоб він залишався впорядкованим: проходить від кінця, поки не знайде задачу з не меншим пріоритетом. Для тисяч задач ефективніша двійкова купа (<code>heap</code>), яка вставляє й дістає за логарифмічний час, але для навчального проєкту вставка в масив повністю достатня й набагато читабельніша. Пріоритет рівних задач стабільний, бо нову вставляють після всіх рівних.",
      "<b>Планувальник</b> — функція <code>pump</code>: поки є вільні слоти (<code>running &lt; concurrency</code>) і черга не порожня, вона бере наступну задачу, збільшує <code>running</code> і запускає її. Коли задача завершилась (успішно чи з помилкою), <code>running</code> зменшується й знову викликається <code>pump</code>, щоб зайняти звільнений слот. Помилка однієї задачі відхиляє лише її власний проміс і не зупиняє чергу: це ключова вимога надійності. Тому виклик задачі обгортають у <code>try/catch</code> або в ланцюжок <code>.then(resolve, reject)</code>.",
      "<b>Очікування простою</b>. Метод <code>onIdle()</code> повертає проміс, який виконується, коли в черзі немає ні очікуючих, ні виконуваних задач. Якщо черга вже простоює, проміс виконується одразу. Реалізація зберігає список «очікувачів» і сповіщає їх у момент, коли після завершення задачі <code>running</code> і <code>size</code> стали нульовими. Це зручно в тестах і при плавному завершенні програми: «дочекаємося, поки всю роботу виконано».",
      "Деталі, на яких спотикаються. Не запускайте задачі синхронно всередині <code>add</code>, якщо хочете, щоб порядок визначався пріоритетом: спершу додайте в чергу, а запуск виконуйте після, щоб одночасні виклики <code>add</code> могли впорядкуватись. Якщо задача кидає виняток синхронно (не повертаючи проміс), її теж слід перехопити. Некоректна конкурентність (<code>0</code>, дробове число) — помилка програміста: кидайте <code>RangeError</code> одразу. Нарешті, перевірте граничні випадки: нульові пріоритети, від'ємні, багато задач із однаковим пріоритетом, задачі, що додають нові задачі.",
      "Подальші покращення, які ви можете додати самостійно: скасування задач через <code>AbortSignal</code>, тайм-аут на задачу, повтори при помилках з відкладенням, пауза й відновлення черги, обмеження довжини черги з відмовою при переповненні, метрики часу очікування. Ці самі ідеї лежать в основі бібліотек p-queue, BullMQ та планувальників у браузері. Написавши ядро власноруч, ви матимете чітке уявлення, що відбувається під капотом, і зможете обирати готові рішення усвідомлено.",
    ],
    code: [
      String.raw`class PriorityList {
  #items = [];
  push(value, priority = 0) {
    let i = this.#items.length;
    while (i > 0 && this.#items[i - 1].priority < priority) i--;   // після всіх рівних або вищих
    this.#items.splice(i, 0, { value, priority });
  }
  shift() {
    return this.#items.shift()?.value;
  }
  get size() {
    return this.#items.length;
  }
}
const list = new PriorityList();
list.push("звичайна 1");
list.push("термінова", 10);
list.push("звичайна 2");
list.push("важлива", 5);
const order = [];
while (list.size > 0) order.push(list.shift());
console.log(order);`,
      String.raw`function createTaskQueue({ concurrency = 1 } = {}) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new RangeError("concurrency має бути цілим від 1");
  const waiting = [];
  const idleWaiters = [];
  let running = 0;
  function pump() {
    while (running < concurrency && waiting.length > 0) {
      const { fn, resolve, reject } = waiting.shift();
      running++;
      Promise.resolve()
        .then(fn)
        .then(resolve, reject)
        .finally(() => {
          running--;
          pump();
          if (running === 0 && waiting.length === 0) idleWaiters.splice(0).forEach((done) => done());
        });
    }
  }
  return {
    add(fn, { priority = 0 } = {}) {
      return new Promise((resolve, reject) => {
        let i = waiting.length;
        while (i > 0 && waiting[i - 1].priority < priority) i--;
        waiting.splice(i, 0, { fn, priority, resolve, reject });
        queueMicrotask(pump);
      });
    },
    onIdle: () => (running === 0 && waiting.length === 0 ? Promise.resolve() : new Promise((done) => idleWaiters.push(done))),
    get size() { return waiting.length; },
    get running() { return running; },
  };
}
const queue = createTaskQueue({ concurrency: 2 });
const log = [];
const job = (name, ms) => async () => { log.push("старт " + name); await new Promise((r) => setTimeout(r, ms)); log.push("кінець " + name); return name; };
const results = [
  queue.add(job("a", 20)),
  queue.add(job("b", 10)),
  queue.add(job("c", 5), { priority: 5 }),
  queue.add(job("d", 1)),
];
await queue.onIdle();
console.log(log);
console.log(await Promise.all(results), queue.size, queue.running);`,
      String.raw`const queue = createQueueForDemo();
function createQueueForDemo() {
  const jobs = [];
  return {
    add(fn) {
      return new Promise((resolve, reject) => jobs.push(() => Promise.resolve().then(fn).then(resolve, reject)));
    },
    async runAll() {
      for (const job of jobs) await job();
    },
  };
}
const ok = queue.add(async () => "успіх");
const bad = queue.add(async () => { throw new Error("збій задачі"); });
const after = queue.add(async () => "працює далі");
await queue.runAll();
console.log(await ok, await bad.catch((e) => e.message), await after);`,
      String.raw`// аварія: некоректна конкурентність виявляється одразу під час створення черги
function createTaskQueue({ concurrency = 1 } = {}) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new RangeError("concurrency має бути цілим від 1");
  return { concurrency };
}
console.log(createTaskQueue({ concurrency: 3 }));
console.log(createTaskQueue({ concurrency: 0 }));`,
    ],
    note: "Черга впорядковує задачі за пріоритетом (рівні за FIFO), запускає не більше <code>concurrency</code> одночасно й повертає кожній проміс. Помилка однієї задачі відхиляє лише її проміс. <code>onIdle()</code> виконується, коли нічого не чекає й не виконується.",
    work: "Обробка завантажених файлів, розсилки, синхронізація з API та фонові скрипти спираються на черги. У браузерах і Node бібліотеки на кшталт p-queue роблять те саме, а в серверах використовують брокери черг із збереженням на диску.",
    tasks: [
      "Як черга визначає порядок задач із різними пріоритетами й що робить планувальник pump після завершення задачі?",
      "Чому помилка однієї задачі не повинна зупиняти чергу і як працює onIdle?",
    ],
  },
  {
    t: "Проєкт: rate limiter і підсумок курсу",
    ch: "Проєкти",
    adv: true,
    easy: "Rate limiter — це турнікет для запитів: він пускає не більше заданої кількості за період і ввічливо каже, коли можна спробувати знову. Це завершальний проєкт, а разом із ним ми підіб'ємо підсумки всього курсу.",
    p: [
      "Обмеження частоти (rate limiting) захищає систему від перевантаження й зловживань: бот не повинен слати тисячі запитів за секунду, а один клієнт не має займати всі ресурси. Обмежувач відповідає на запитання «чи можна цьому ключу (користувачу, IP-адресі, API-токену) виконати дію зараз?». Відповідь містить кілька значень: <code>allowed</code> (дозволено чи ні), <code>remaining</code> (скільки ще залишилось у вікні) та <code>retryAfterMs</code> (через скільки мілісекунд можна повторити). Саме ці три поля допомагають клієнтові поводитись культурно: HTTP-сервери передають їх у заголовках <code>X-RateLimit-Remaining</code> та <code>Retry-After</code> разом зі статусом <code>429</code>.",
      "Є кілька алгоритмів. <b>Фіксоване вікно</b> рахує запити в інтервалі (наприклад, поточна хвилина) і скидає лічильник на межі: просто, але допускає сплески на стику вікон (100 запитів в кінці однієї хвилини й 100 на початку наступної). <b>Ковзне вікно (журнал)</b> зберігає мітки часу запитів і рахує ті, що потрапляють у останні <code>windowMs</code> мілісекунд: точніше, але потребує пам'яті. <b>Відро токенів</b> (token bucket) наповнюється з постійною швидкістю й дозволяє короткі сплески до розміру відра. Ми реалізуємо ковзне вікно як найнаочніше й найточніше.",
      "Реалізація ковзного вікна. Для кожного ключа зберігається масив міток часу дозволених запитів. На виклику <code>tryAcquire(key)</code> спершу видаляються мітки, що вийшли за межі вікна (старші або рівні <code>now - windowMs</code>). Якщо залишилось менше за <code>limit</code> міток, запит дозволяється: додається мітка <code>now</code>, <code>remaining = limit - кількість</code>, <code>retryAfterMs = 0</code>. Інакше запит відхиляється, <code>remaining = 0</code>, а <code>retryAfterMs</code> дорівнює часу до того, як вийде за межі вікна <b>найстаріша</b> мітка: <code>oldest + windowMs - now</code>. Відхилений запит мітки не додає, інакше клієнт сам себе заблокував би навічно.",
      "Годинник передається залежністю (<code>now</code>), як ми робили в кешах: тест просто змінює змінну <code>time</code> і перевіряє поведінку на межах (за мить до закінчення вікна й рівно в момент). Завдяки цьому обмежувач не потребує реальних пауз і детермінований. Також корисні <code>reset(key)</code> для скидання лічильника та очищення порожніх записів, щоб пам'ять не росла від кожного нового ключа. Неправильні параметри (<code>limit</code> не додатне ціле, <code>windowMs</code> не додатне число) — помилки конфігурації, їх треба виявляти одразу.",
      "Не забувайте про розподілені системи: якщо сервер працює в кількох копіях, лічильники в пам'яті однієї копії не бачать інших, тому в реальності їх зберігають у спільному сховищі (Redis) із атомарними операціями; логіка при цьому та сама. Також продумайте, що вважати ключем: IP легко змінити, обліковий запис надійніший, а для невідомих користувачів комбінують обидва. Обмеження має бути помітним: повертайте зрозуміле повідомлення й <code>Retry-After</code>, а не просто обривайте з'єднання.",
      "На цьому курс завершується. Ви пройшли шлях від першого <code>console.log</code> до власних черг, кешів, клієнтів API й архітектурних патернів. Основи мови (змінні, типи, функції, замикання), колекції та об'єкти, класи й прототипи, патерни абстракції, помилки, асинхронність, вбудовані можливості, тестування, мережа й браузер, архітектура та проєкти — це повний набір для роботи JavaScript-розробником. Далі корисно: вивчити TypeScript, один із фреймворків (React, Vue чи Svelte) та Node-бібліотеки сервера, регулярно читати чужий код і писати власні проєкти. Головне — практика: беріть реальні задачі, пишіть тести й не бійтеся помилок, адже саме так і вчаться програмувати.",
    ],
    code: [
      String.raw`function createRateLimiter({ limit, windowMs, now = () => Date.now() }) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError("limit має бути цілим від 1");
  if (!(windowMs > 0)) throw new RangeError("windowMs має бути додатним");
  const hits = new Map();
  return {
    tryAcquire(key = "default") {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((time) => time > t - windowMs);
      if (recent.length < limit) {
        recent.push(t);
        hits.set(key, recent);
        return { allowed: true, remaining: limit - recent.length, retryAfterMs: 0 };
      }
      hits.set(key, recent);
      return { allowed: false, remaining: 0, retryAfterMs: recent[0] + windowMs - t };
    },
    reset(key = "default") {
      hits.delete(key);
    },
  };
}
let time = 0;
const limiter = createRateLimiter({ limit: 3, windowMs: 1000, now: () => time });
for (const at of [0, 100, 200, 300]) {
  time = at;
  console.log(at, limiter.tryAcquire("user1"));
}`,
      String.raw`let time = 0;
const hitsFor = (hits, windowMs) => hits.filter((t) => t > time - windowMs).length;
const hits = [0, 500, 900];
for (const now of [999, 1000, 1001, 1500, 1900]) {
  time = now;
  console.log(now, "запитів у вікні 1000 мс:", hitsFor(hits, 1000));
}`,
      String.raw`// фіксоване вікно дозволяє сплеск на стику, ковзне ні
function fixedWindow(times, limit, windowMs) {
  const counts = new Map();
  return times.map((t) => {
    const slot = Math.floor(t / windowMs);
    const n = counts.get(slot) ?? 0;
    if (n >= limit) return false;
    counts.set(slot, n + 1);
    return true;
  });
}
function slidingWindow(times, limit, windowMs) {
  const accepted = [];
  return times.map((t) => {
    const recent = accepted.filter((a) => a > t - windowMs);
    if (recent.length >= limit) return false;
    accepted.push(t);
    return true;
  });
}
const burst = [900, 910, 920, 1000, 1010, 1020];
console.log(fixedWindow(burst, 3, 1000).filter(Boolean).length, slidingWindow(burst, 3, 1000).filter(Boolean).length);`,
      String.raw`function toHeaders({ allowed, remaining, retryAfterMs }, limit) {
  const headers = { "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(remaining) };
  if (!allowed) headers["Retry-After"] = String(Math.ceil(retryAfterMs / 1000));
  return { status: allowed ? 200 : 429, headers };
}
console.log(toHeaders({ allowed: true, remaining: 2, retryAfterMs: 0 }, 3));
console.log(toHeaders({ allowed: false, remaining: 0, retryAfterMs: 700 }, 3));`,
      String.raw`// аварія: некоректну конфігурацію обмежувача виявлено одразу, а не під час першого запиту
function createRateLimiter({ limit, windowMs }) {
  if (!Number.isInteger(limit) || limit < 1) throw new RangeError("limit має бути цілим від 1");
  if (!(windowMs > 0)) throw new RangeError("windowMs має бути додатним");
  return { limit, windowMs };
}
console.log(createRateLimiter({ limit: 5, windowMs: 1000 }));
console.log(createRateLimiter({ limit: 5, windowMs: 0 }));`,
    ],
    note: "Ковзне вікно зберігає мітки часу запитів на ключ і відсікає старі. Відхилений запит мітки не додає, а <code>retryAfterMs</code> рахується від найстарішої мітки. Годинник передається залежністю, а конфігурацію перевіряють одразу. Курс завершено: далі TypeScript, фреймворки й власні проєкти.",
    work: "Rate limiting стоїть перед кожним публічним API, формою входу й платіжним шлюзом, щоб захистити від перебору паролів, зловживань і перевантаження. Знання алгоритмів допомагає налаштувати готові рішення, наприклад в nginx чи API-шлюзі.",
    tasks: [
      "Чим ковзне вікно відрізняється від фіксованого й чому відхилені запити не додають мітку часу?",
      "Які поля має відповідь обмежувача і навіщо передавати годинник залежністю?",
    ],
  },
];
