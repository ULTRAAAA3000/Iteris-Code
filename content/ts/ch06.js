// Глава 6 «Помилки й безпека типів» (уроки 52–58). Тексти українською; у p, easy, note, work, tasks дозволені лише теги code, b, i, а < > & екрануємо.
const raw = String.raw;
const BT = "`";   // зворотний апостроф для прикладів: у String.raw його вставляють як ${BT}
const D = "$";    // знак долара: інтерполяцію в прикладах пишемо як ${D}{вираз}

export const LESSONS_06 = [
  {
    t: "Помилки: throw, try/catch і unknown у catch",
    ch: "Помилки й безпека типів",
    easy: "Помилка в програмі це аварійний сигнал: функція кидає його, а хтось вище по стеку ловить і вирішує, що робити. У TypeScript спійману помилку треба спершу розпізнати, бо вона може бути чим завгодно.",
    p: [
      "Коли функція не може виконати свою роботу, вона може <b>кинути помилку</b> оператором <code>throw</code>. Виконання зупиняється, а керування передається найближчому блоку <code>try/catch</code> вище по ланцюжку викликів. Якщо ніхто не спіймав, програма завершується з повідомленням. Так працюють неправильні вхідні дані, відсутні файли, збої мережі та багато інших ситуацій, які неможливо обробити на місці.",
      "Помилку ловлять блоком <code>try { ... } catch (error) { ... }</code>. Код у <code>try</code> виконується як зазвичай, а якщо в ньому щось кинуло помилку, керування переходить у <code>catch</code>. Необов'язковий блок <code>finally</code> виконується <b>завжди</b>, і з помилкою, і без неї. Його використовують для прибирання: закрити з'єднання, зняти позначку «завантажується».",
      "Тепер найважливіше для TypeScript. Кинути в JavaScript можна <b>будь-що</b>: не лише об'єкт <code>Error</code>, а й рядок, число, <code>null</code>. Тому в суворому режимі змінна в <code>catch</code> має тип <code>unknown</code> (так працює прапорець <code>useUnknownInCatchVariables</code>). Спроба написати <code>error.message</code> відразу не скомпілюється: компілятор вимагає спочатку перевірити, що це справді об'єкт помилки.",
      "Стандартна перевірка це <code>error instanceof Error</code>. Усередині умови тип звужується до <code>Error</code>, і можна читати <code>message</code>, <code>name</code> та <code>stack</code>. Для решти випадків залишається запасний шлях: перетворити значення на рядок через <code>String(error)</code>. Зручно написати одну допоміжну функцію <code>messageOf(error: unknown): string</code> і користуватися нею скрізь, щоб не повторювати перевірку.",
      "Хороша практика: кидайте саме <b>об'єкти Error</b>, а не рядки. Тільки вони мають стек викликів, який показує, де сталася помилка, і підтримують додаткові відомості. Кинутий рядок <code>throw \"щось пішло не так\"</code> працює, але ускладнює налагодження й порушує очікування тих, хто ловить, бо вони звикли читати <code>error.message</code>.",
      "Багато вбудованих функцій кидають помилки: <code>JSON.parse</code> на некоректному тексті кидає <code>SyntaxError</code>, виклик методу в <code>undefined</code> дає <code>TypeError</code>. Їх можна ловити тим самим <code>catch</code>. Але не обгортайте в <code>try</code> зайвий код: чим менший блок, тим точніше видно, де саме може виникнути помилка, і тим менше ризик «проковтнути» несподівану проблему.",
      "Не лови те, що не можеш обробити. Порожній <code>catch</code>, який мовчки ігнорує помилку, найгірший варіант: збій лишається непоміченим, а програма продовжує працювати в неправильному стані. Якщо ви не знаєте, що робити, залогуйте й кидайте помилку далі оператором <code>throw error</code>. Хай це вирішить той, хто має більше контексту. У наступних уроках побачимо ще й альтернативу виключенням: помилки як значення.",
    ],
    code: [
      raw`function risky(value: number): number {
  if (value < 0) {
    throw new Error("Від'ємне число");
  }
  return Math.sqrt(value);
}

try {
  console.log(risky(16));
  console.log(risky(-1));
} catch (error) {
  console.log("помилка перехоплена");
} finally {
  console.log("завжди виконується");
}
`,
      raw`// не компілюється: у catch змінна має тип unknown, тому message читати не можна
try {
  JSON.parse("не json");
} catch (error) {
  console.log(error.message);
}
`,
      raw`function messageOf(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

try {
  JSON.parse("{ зламано");
} catch (error) {
  console.log(error instanceof SyntaxError, messageOf(error).length > 0);
}

try {
  throw "рядок замість помилки";
} catch (error) {
  console.log(messageOf(error));
}
`,
      raw`// аварія: помилку кинули, але ніхто не ловить, тому програма завершується
function load(id: number): string {
  if (id <= 0) {
    throw new Error("Неправильний id: " + id);
  }
  return "запис " + id;
}

console.log(load(1));
console.log(load(0));
`,
    ],
    note: "У суворому режимі змінна в <code>catch</code> має тип <code>unknown</code>: спершу перевірте її через <code>instanceof Error</code>. Кидайте об'єкти <code>Error</code>, а не рядки. Порожній <code>catch</code> ховає збої, тому не ловіть те, чого не вмієте обробити.",
    work: "У застосунках помилки спливають постійно: мережа недоступна, файл пошкоджений, дані некоректні. Акуратна обробка не дає одному збою зламати всю програму й показує користувачеві зрозуміле повідомлення замість білого екрана.",
    tasks: [
      "Чому в суворому режимі не можна написати <code>error.message</code> у блоці <code>catch</code> без перевірки?",
      "Коли виконується блок <code>finally</code> і для чого його використовують?",
    ],
  },
  {
    t: "Класи помилок: Error, cause і власні винятки",
    ch: "Помилки й безпека типів",
    easy: "Свій клас помилки дає збою ім'я й додаткові відомості: код статусу, назву поля. За цим можна розрізнити «не знайдено» і «неправильні дані» й відреагувати на кожну ситуацію по-своєму.",
    p: [
      "Стандартний <code>Error</code> містить лише текст і стек. Для складніших програм цього мало: треба відрізняти помилки валідації від помилок мережі, знати код відповіді чи назву поля з помилкою. Для цього створюють <b>власні класи помилок</b>, що успадковують <code>Error</code>: <code>class HttpError extends Error</code>. Вони мають усе стандартне й додають потрібні поля.",
      "Типовий шаблон такий: конструктор приймає додаткові дані й текст, викликає <code>super(message)</code> і задає ім'я: <code>this.name = \"HttpError\"</code>. Параметр-властивість <code>constructor(public status: number, message: string)</code> скорочує код. Ім'я допомагає в журналах і повідомленнях, бо без нього помилка виглядає просто як «Error», і розрізнити їх неможливо.",
      "Власні помилки ловлять і розрізняють через <code>instanceof</code>: <code>if (error instanceof NotFoundError) { ... } else if (error instanceof HttpError) { ... }</code>. Всередині гілки тип звужується до відповідного класу, тож доступні його поля. Порядок перевірок важливий: спершу вужчі класи, а потім ширші, бо спадкоємець теж проходить перевірку <code>instanceof</code> для базового класу.",
      "Корисно будувати <b>ієрархію</b>: базова помилка програми <code>AppError</code>, від неї <code>ValidationError</code>, <code>NotFoundError</code>. Тоді одним <code>instanceof AppError</code> ловляться всі «свої» помилки, а решта (справжні збої) пролітають далі. Але не робіть ієрархію надто глибокою: двох-трьох рівнів зазвичай достатньо.",
      "Починаючи з ES2022, у <code>Error</code> є поле <b><code>cause</code></b> (причина): <code>new Error(\"Не вдалося завантажити\", { cause: originalError })</code>. Воно дозволяє загорнути низькорівневу помилку у зрозуміліше повідомлення, не втрачаючи оригіналу. Тип <code>cause</code> це <code>unknown</code>, тож його теж треба перевіряти. Ланцюжок причин дуже корисний при налагодженні.",
      "Обгортання помилок це гарна практика на межах шарів. Функція доступу до бази кидає технічну помилку, а шар вище перетворює її на зрозумілу для бізнес-логіки, зберігаючи оригінал у <code>cause</code>. Користувач бачить лише дружнє повідомлення, а розробник у журналі повний ланцюжок. Так вирішується проблема «текст для людини проти деталей для розробника».",
      "Не створюйте власні класи без потреби. Якщо вам достатньо розрізнити лише «є помилка чи нема», вистачить звичайного <code>Error</code>. Класи варті зусиль, коли різні помилки потребують різної реакції або несуть додаткові дані. Тоді вони стають частиною контракту функцій і роблять код виразнішим, а обробку точнішою.",
      "Окремо про серіалізацію. Помилки, які передаються мережею чи записуються в журнал, не зберігають свій клас: після <code>JSON.stringify</code> лишаються лише власні перелічувані поля. Тому для API зазвичай визначають окремий простий формат помилки з кодом і повідомленням, а клас помилки використовують всередині програми. Не покладайтеся на <code>instanceof</code> для даних, які прийшли ззовні: перевіряйте їх форму окремо.",
    ],
    code: [
      raw`class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

class NotFoundError extends HttpError {
  constructor(what: string) {
    super(404, what + " не знайдено");
    this.name = "NotFoundError";
  }
}

try {
  throw new NotFoundError("Користувача");
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log("404:", error.message);
  } else if (error instanceof HttpError) {
    console.log("HTTP", error.status);
  }
}
`,
      raw`function loadUser(id: number): string {
  try {
    if (id < 0) {
      throw new Error("поганий id");
    }
    return "користувач " + id;
  } catch (error) {
    throw new Error("Не вдалося завантажити користувача", { cause: error });
  }
}

try {
  loadUser(-1);
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message);
    console.log(error.cause instanceof Error ? error.cause.message : "без причини");
  }
}
`,
      raw`// не компілюється: конструктор вимагає два аргументи, а передано нуль
class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

throw new HttpError();
`,
      raw`class AppError extends Error {}
class ValidationError extends AppError {}
class NotFoundError extends AppError {}

function check(kind: string): void {
  if (kind === "bad") {
    throw new ValidationError("неправильні дані");
  }
  if (kind === "none") {
    throw new NotFoundError("не знайдено");
  }
}

for (const kind of ["bad", "none"]) {
  try {
    check(kind);
  } catch (error) {
    console.log(error instanceof AppError, error instanceof ValidationError);
  }
}
`,
    ],
    note: "Власний клас помилки успадковує <code>Error</code>, викликає <code>super(message)</code> і задає <code>name</code>. Розрізняють їх через <code>instanceof</code>, спершу вужчі класи. Поле <code>cause</code> зберігає оригінальну помилку.",
    work: "У сервісах помилки валідації, авторизації й відсутності даних обробляють по-різному: показують підказку, перенаправляють на вхід, повертають код 404. Власні класи роблять таку обробку точною, читабельною й однаковою в усьому застосунку, незалежно від того, хто саме її пише.",
    tasks: [
      "Для чого власному класу помилки потрібні виклик <code>super(message)</code> і задана властивість <code>name</code>?",
      "Яку проблему розв'язує поле <code>cause</code> в об'єкта <code>Error</code>?",
    ],
  },
  {
    t: "Дискримінантні об'єднання",
    ch: "Помилки й безпека типів",
    easy: "Дискримінантне об'єднання це набір варіантів, кожен із яких має спільне поле-мітку: «коло», «прямокутник». За міткою компілятор точно знає, які ще поля є в конкретному варіанті.",
    p: [
      "Union-типи зручні, але з ними ми обмежені спільними полями. Є елегантний спосіб розрізняти варіанти: у кожного додають спільне поле з <b>літеральним</b> типом, так звану мітку (tag), зазвичай <code>kind</code> або <code>type</code>. Такий union називають <b>дискримінантним</b> (tagged union): за значенням мітки компілятор розуміє, який саме варіант перед ним.",
      "Приклад: <code>type Shape = { kind: \"circle\"; radius: number } | { kind: \"rect\"; width: number; height: number }</code>. Усередині <code>if (shape.kind === \"circle\")</code> тип звужується до першого варіанта, тож доступне поле <code>radius</code>. В іншій гілці перед нами прямокутник, і доступні <code>width</code> та <code>height</code>. Перевірка однієї мітки відкриває потрібні поля.",
      "Чому це краще за один тип із купою необов'язкових полів? Тому що неможливі стани стають неможливими в типі. Структура <code>{ radius?: number; width?: number; height?: number }</code> дозволяє коло з шириною чи об'єкт без жодного розміру. У дискримінантному union кожен варіант має рівно ті поля, які для нього мають сенс, і не більше.",
      "Особливо корисні такі типи для станів. <code>type LoadState = { status: \"idle\" } | { status: \"loading\" } | { status: \"done\"; data: string } | { status: \"error\"; message: string }</code> гарантує, що дані є лише у стані <code>done</code>, а повідомлення про помилку лише в <code>error</code>. Усе, що ви колись робили через набір прапорців <code>isLoading</code>, <code>hasError</code>, виражається чесно й без суперечностей, бо суперечливі комбінації прапорців просто неможливо записати, і тому не доведеться перевіряти їх тестами.",
      "Мітка має бути літеральним типом (<code>\"circle\"</code>, а не просто <code>string</code>), інакше компілятор не зможе звужувати. Для перевірки підходять <code>if</code>, <code>switch</code> і навіть деструктуризація параметрів. Спільною міткою може бути й число чи булеве значення, але рядки найчитабельніші. Дайте міткам однакові назви в усіх варіантах і дотримуйтеся єдиного стилю в проєкті.",
      "Дискримінантні об'єднання чудово поєднуються з <code>switch</code>: кожна гілка <code>case</code> відповідає варіанту, а компілятор вже знає його тип. А наступний урок покаже, як змусити компілятор перевіряти, що ви розглянули <b>всі</b> варіанти. Це одна з найкорисніших практик у TypeScript, і саме з неї починається безпечна робота з розгалуженими даними.",
      "Також корисно: створення значень теж перевіряється. Об'єкт <code>{ kind: \"circle\", width: 5 }</code> не скомпілюється, бо в колі немає ширини. Тож тип працює в обидва боки: і під час створення даних, і під час їхнього читання. Тому дискримінантні об'єднання вважають одним із найкращих способів моделювати предметну область із різними видами сутностей.",
    ],
    code: [
      raw`type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function area(shape: Shape): number {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
  }
  return shape.width * shape.height;
}

console.log(area({ kind: "circle", radius: 1 }).toFixed(2));
console.log(area({ kind: "rect", width: 2, height: 3 }));
`,
      raw`// не компілюється: поле radius є лише в варіанта circle, а тип ще не звужено
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function radiusOf(shape: Shape): number {
  return shape.radius;
}

console.log(radiusOf({ kind: "circle", radius: 1 }));
`,
      raw`type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; data: string }
  | { status: "error"; message: string };

function describe(state: LoadState): string {
  switch (state.status) {
    case "idle":
      return "очікування";
    case "loading":
      return "завантаження";
    case "done":
      return "готово: " + state.data;
    case "error":
      return "помилка: " + state.message;
  }
}

console.log(describe({ status: "loading" }));
console.log(describe({ status: "done", data: "дані" }));
`,
      raw`// не компілюється: у варіанта circle немає поля width
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

const wrong: Shape = { kind: "circle", width: 5 };
console.log(wrong);
`,
    ],
    note: "Дискримінантне об'єднання це union об'єктів зі спільним полем-міткою літерального типу (<code>kind</code>, <code>status</code>). Перевірка мітки звужує тип до конкретного варіанта. Так неможливі комбінації полів стають неможливими в типі.",
    work: "Стани завантаження, події, відповіді API з успіхом чи помилкою й різні види фігур чи платежів зручно моделювати саме так. Код розгалужується за міткою, а компілятор слідкує, щоб у кожній гілці були правильні поля.",
    tasks: [
      "Чому дискримінантний union краще за один тип із багатьма необов'язковими полями?",
      "Що відбувається з типом змінної після перевірки <code>shape.kind === \"circle\"</code>?",
    ],
  },
  {
    t: "Вичерпні перевірки: never і switch",
    ch: "Помилки й безпека типів",
    easy: "Вичерпна перевірка змушує компілятор нагадати вам про забутий варіант. Додали новий вид фігури, і кожне місце, яке його не розглядає, одразу підсвічується помилкою, ще до запуску.",
    p: [
      "Уявіть, що ви додали до <code>Shape</code> новий варіант, трикутник, а десять функцій, які розгалужуються за <code>kind</code>, про нього не знають. Помилки з'являться під час виконання, і не одразу. Хочеться, щоб компілятор нагадав про всі місця, які треба оновити. Саме для цього існують <b>вичерпні перевірки</b> (exhaustiveness checks), і основа в них тип <code>never</code>.",
      "Принцип такий. Коли в <code>switch</code> розглянуто всі варіанти union, у гілці <code>default</code> змінна має тип <code>never</code>: значень, які сюди потраплять, не існує. Якщо ж ви забули один варіант, у <code>default</code> лишиться саме він, і тип стане не <code>never</code>. Тоді передача цієї змінної в параметр типу <code>never</code> зламає компіляцію, а повідомлення вкаже, чого бракує.",
      "Зручна допоміжна функція: <code>function assertNever(value: never): never { throw new Error(\"Необроблений варіант: \" + JSON.stringify(value)); }</code>. У <code>default</code> пишуть <code>return assertNever(shape)</code>. Поки всі варіанти розглянуто, код компілюється, а якщо хтось додасть новий і забуде гілку, виникне помилка саме в цьому місці. Під час виконання функція теж страхує від некоректних даних.",
      "Інший спосіб перевірки повноти: словник за мітками. <code>const labels: Record&lt;Shape[\"kind\"], string&gt; = { circle: \"Коло\", rect: \"Прямокутник\" }</code> вимагає ключ для кожного варіанта. Додайте новий <code>kind</code>, і словник не скомпілюється, поки не з'явиться відповідний запис. Це зручно, коли потрібне просте відображення варіантів на значення, без розгалужень.",
      "Вичерпні перевірки роблять рефакторинг безпечним. Ви змінюєте тип в одному місці, а компілятор показує всі функції, що потребують оновлення. У великих проєктах це економить години пошуків і запобігає баґам, які інакше виявилися б лише в рідкісних сценаріях у продакшені. Тож заведіть звичку завершувати кожен <code>switch</code> за мітками перевіркою <code>assertNever</code>.",
      "Деякі розробники вмикають у <code>tsconfig</code> опцію <code>noImplicitReturns</code> чи правила лінтера, що вимагають оброблення всіх гілок. Але надійніший шлях це власне <code>never</code>, бо він працює завжди й не залежить від налаштувань. Також він добре поєднується з сучасною практикою моделювати стани як union: кожен новий стан потребує оновлення всіх обробників.",
      "Нюанс: вичерпність працює лише для union з відомим набором варіантів і для звужуваних значень. Якщо в <code>switch</code> розглядається просто <code>string</code>, а не union літералів, жодного <code>never</code> не буде, бо всіх рядків не перелічити. Тому літеральні типи й дискримінантні об'єднання так важливі: вони перетворюють «будь-що» на скінченний набір варіантів, який компілятор вміє перевіряти.",
    ],
    code: [
      raw`type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

function assertNever(value: never): never {
  throw new Error("Необроблений варіант: " + JSON.stringify(value));
}

function describe(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      return "коло радіусом " + shape.radius;
    case "rect":
      return "прямокутник " + shape.width + "x" + shape.height;
    default:
      return assertNever(shape);
  }
}

console.log(describe({ kind: "circle", radius: 2 }));
console.log(describe({ kind: "rect", width: 3, height: 4 }));
`,
      raw`// не компілюється: варіант triangle не розглянуто, і в default лишився не never
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function assertNever(value: never): never {
  throw new Error("Необроблений варіант");
}

function name(shape: Shape): string {
  switch (shape.kind) {
    case "circle":
      return "коло";
    case "rect":
      return "прямокутник";
    default:
      return assertNever(shape);
  }
}

console.log(name({ kind: "circle", radius: 1 }));
`,
      raw`type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

const labels: Record<Shape["kind"], string> = {
  circle: "Коло",
  rect: "Прямокутник",
};

console.log(labels.circle, labels.rect);
`,
      raw`// не компілюється: у словнику бракує ключа rect
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number };

const labels: Record<Shape["kind"], string> = {
  circle: "Коло",
};
console.log(labels);
`,
    ],
    note: "У <code>default</code> після розгляду всіх варіантів змінна має тип <code>never</code>. Функція <code>assertNever(value: never)</code> робить пропущений варіант помилкою компіляції. Те саме дає <code>Record&lt;Shape[\"kind\"], T&gt;</code>.",
    work: "Коли в проєкті з'являється новий вид замовлення, платежу чи події, компілятор сам показує всі місця, які його не розглядають. Це дешевший і надійніший спосіб, ніж шукати їх очима.",
    tasks: [
      "Який тип має змінна в гілці <code>default</code>, якщо розглянуто всі варіанти union?",
      "Як <code>Record&lt;Shape[\"kind\"], string&gt;</code> допомагає не забути новий варіант?",
    ],
  },
  {
    t: "Тип Result: помилки як значення",
    ch: "Помилки й безпека типів",
    easy: "Result це конверт з двома можливими вмістами: «успіх із даними» або «помилка з причиною». Викликач мусить розкрити конверт і перевірити, що всередині, тому збій неможливо забути обробити.",
    p: [
      "Виключення мають недолік: сигнатура функції не показує, що вона може кинути помилку. Викликач легко забуває про <code>try/catch</code>, і збій спливає там, де його не чекали. Альтернатива це повертати помилку як <b>звичайне значення</b>. Для цього створюють тип <code>Result</code>, у якому результат або успішний, або містить помилку.",
      "Найпростіше реалізувати Result як дискримінантне об'єднання: <code>type Result&lt;T, E = string&gt; = { ok: true; value: T } | { ok: false; error: E }</code>. Мітка <code>ok</code> каже, який саме варіант, і після перевірки <code>if (result.ok)</code> компілятор знає, що доступне поле <code>value</code>. В іншій гілці доступне поле <code>error</code>.",
      "Тепер функція чесно описує можливі збої в типі результату. <code>function parseAge(text: string): Result&lt;number&gt;</code> каже: «я можу повернути число або повідомлення про помилку». Викликач не може просто взяти <code>.value</code>: компілятор вимагає спершу перевірити <code>ok</code>. Так забути обробку помилки стає значно складніше, ніж у випадку виключень.",
      "Для зручності створюють допоміжні функції <code>ok(value)</code> та <code>err(error)</code>, що повертають відповідні варіанти. А також функції-перетворювачі на кшталт <code>mapResult</code>, яка застосовує функцію до значення, якщо воно є, і пропускає помилку без змін. Це дозволяє будувати ланцюжки обробки й не перевіряти <code>ok</code> на кожному кроці вручну.",
      "Тип помилки теж можна уточнити: замість рядка використати union літералів, <code>Result&lt;number, \"empty\" | \"not_number\"&gt;</code>. Тоді викликач може розгалужуватися за конкретною причиною, а <code>switch</code> з перевіркою на вичерпність гарантує, що жодної причини не пропущено. Це дає найточніший контракт для функцій, що можуть не вдатися передбачуваним чином.",
      "Коли використовувати виключення, а коли Result? Result для <b>очікуваних</b> збоїв, які є частиною нормального сценарію: некоректне введення користувача, відсутність запису, помилка розбору. Виключення для <b>непередбачених</b> проблем: помилки програмування, збої інфраструктури, порушення інваріантів. Таке розділення робить код чесним: очікуване видно в типах, а виняткове не засмічує основну логіку.",
      "Є й ціна: Result додає трохи шаблонного коду, а ланцюжки перевірок можуть бути багатослівними. У екосистемі TypeScript нема одного стандарту, і команди використовують різні бібліотеки чи власні типи. Тому вибирайте підхід, спільний для всього проєкту, і не змішуйте стилі без потреби. Головне зрозуміти ідею: помилка це теж значення, яке можна описати типом, передати як аргумент і повернути з функції, як і будь-яке інше значення програми.",
    ],
    code: [
      raw`type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function err<T = never>(error: string): Result<T> {
  return { ok: false, error };
}

function parseAge(text: string): Result<number> {
  const age = Number(text);
  if (text.trim() === "" || Number.isNaN(age)) {
    return err("Вік має бути числом");
  }
  return age < 0 ? err("Вік не може бути від'ємним") : ok(age);
}

for (const input of ["29", "abc", "-5"]) {
  const result = parseAge(input);
  console.log(result.ok ? "вік " + result.value : "помилка: " + result.error);
}
`,
      raw`// не компілюється: поле value є лише в успішного варіанта, а перевірку ok пропущено
type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

function parse(text: string): Result<number> {
  return { ok: true, value: Number(text) };
}

console.log(parse("5").value);
`,
      raw`type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };

function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? { ok: true, value: fn(result.value) } : result;
}

const results: Result<number>[] = [
  { ok: true, value: 21 },
  { ok: false, error: "немає даних" },
];

for (const result of results) {
  console.log(mapResult(result, (n) => n * 2));
}
`,
      raw`type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
type ParseError = "empty" | "not_number";

function parse(text: string): Result<number, ParseError> {
  if (text === "") {
    return { ok: false, error: "empty" };
  }
  const n = Number(text);
  return Number.isNaN(n) ? { ok: false, error: "not_number" } : { ok: true, value: n };
}

const labels: Record<ParseError, string> = { empty: "порожньо", not_number: "не число" };
for (const input of ["7", "", "x"]) {
  const result = parse(input);
  console.log(result.ok ? result.value : labels[result.error]);
}
`,
    ],
    note: "<code>Result&lt;T, E&gt;</code> це дискримінантний union <code>{ ok: true; value: T } | { ok: false; error: E }</code>. Викликач мусить перевірити <code>ok</code>. Result для очікуваних збоїв, виключення для непередбачених.",
    work: "Розбір введення користувача, валідація форм, читання налаштувань і запити, що можуть не знайти запис, зручно описувати через Result. Тип функції одразу говорить, що можливий збій, і його неможливо мовчки проігнорувати.",
    tasks: [
      "Чому з типу <code>Result</code> не можна одразу прочитати поле <code>value</code>?",
      "У яких випадках краще повертати Result, а в яких кидати виключення?",
    ],
  },
  {
    t: "Type guards: предикати x is T",
    ch: "Помилки й безпека типів",
    adv: true,
    easy: "Type guard це власна функція-перевірка, яка не лише каже «так чи ні», а й навчає компілятора: якщо повернулося true, значення має такий-то тип. Як контролер із печаткою, що дозволяє пройти далі.",
    p: [
      "Стандартні перевірки <code>typeof</code>, <code>instanceof</code>, <code>in</code> знайомі, але вони не завжди підходять. Як перевірити, що невідоме значення з JSON має форму <code>User</code>? Для цього пишуть власну функцію з особливим типом результату: <code>function isUser(value: unknown): value is User</code>. Це <b>предикат типу</b> (type predicate), і функцію називають type guard.",
      "Запис <code>value is User</code> замість звичайного <code>boolean</code> каже компілятору: «якщо ця функція повернула <code>true</code>, то <code>value</code> має тип <code>User</code>». Після виклику <code>if (isUser(data))</code> усередині умови <code>data</code> вже <code>User</code>. Так ви переносите свою перевірку в систему типів і можете безпечно працювати із значеннями, що прийшли зовні.",
      "Типовий guard перевіряє форму об'єкта: чи це об'єкт, чи не <code>null</code>, чи є потрібні поля й чи правильні їхні типи. Приклад: <code>typeof value === \"object\" &amp;&amp; value !== null &amp;&amp; \"id\" in value</code>, а далі перевірка типу кожного поля. Бувають і короткі: <code>isString(value: unknown): value is string</code>. Головне, щоб перевірка була <b>повною</b>: усе, що ви обіцяєте типом, має справді перевірятися.",
      "Уважно: компілятор <b>довіряє</b> вашому предикату й не перевіряє його правильність. Якщо написати <code>function isNumber(value: unknown): value is number { return true; }</code>, TypeScript повірить, що будь-що є числом, і помилка вилізе лише під час виконання. Неправильний guard гірший, ніж його відсутність, бо створює хибну впевненість, тому пишіть їх ретельно.",
      "Type guards розв'язують і давню проблему з методом <code>filter</code>. Звичайний <code>filter(Boolean)</code> не звужує тип масиву, але <code>items.filter(isString)</code> з предикатом повертає <code>string[]</code>. Це зручний і безпечний прийом очищення масивів від <code>null</code> та <code>undefined</code>: напишіть guard <code>isDefined</code> і застосовуйте його скрізь, де потрібна відфільтрована колекція.",
      "Guards корисні на межі даних: відповідь API, вміст файлу, повідомлення з черги. Спершу значення має тип <code>unknown</code>, потім guard його перевіряє, і далі в коді ви працюєте з точним типом. Така модель надійніша за приведення <code>as User</code>, яке лише обіцяє, що все гаразд, але нічого не перевіряє, а при неправильних даних програма впаде пізніше.",
      "Для складних структур люди часто використовують бібліотеки валідації, які генерують guards зі схем. Але розуміти механіку корисно: це звичайні функції з особливим типом результату. Тримайте їх невеликими, повторно використовуйте менші guards у більших і покривайте тестами, адже вони визначають, наскільки можна довіряти типам у решті програми.",
    ],
    code: [
      raw`interface User {
  id: number;
  name: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    "name" in value &&
    typeof value.name === "string"
  );
}

const data: unknown = JSON.parse('{"id": 1, "name": "Оля"}');
if (isUser(data)) {
  console.log(data.name.toUpperCase(), data.id + 1);
}
`,
      raw`function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

const mixed: unknown[] = ["а", 1, "б", null];
const texts: string[] = mixed.filter(isString);
const numbers = [1, null, 2, undefined].filter(isDefined);
console.log(texts.join(""), numbers.map((n) => n * 2));
`,
      raw`// аварія: неправильний guard обіцяє число, а там рядок
function isNumber(value: unknown): value is number {
  return true;
}

const value: unknown = "не число";
if (isNumber(value)) {
  console.log(value.toFixed(2));
}
`,
      raw`// не компілюється: результат type guard має бути булевим виразом
function isString(value: unknown): value is string {
  return "так";
}
console.log(isString("а"));
`,
    ],
    note: "Тип результату <code>value is T</code> каже компілятору: якщо функція повернула <code>true</code>, значення має тип <code>T</code>. Компілятор довіряє предикату, тож перевіряйте повністю. <code>filter(isString)</code> звужує тип масиву.",
    work: "Дані з мережі, файлів і форм спочатку мають тип <code>unknown</code>. Type guards перетворюють їх на точні типи після реальної перевірки, на відміну від приведення, яке лише обіцяє відповідність.",
    tasks: [
      "Що означає тип результату <code>value is User</code> порівняно зі звичайним <code>boolean</code>?",
      "Чому неправильно написаний type guard небезпечніший за його відсутність?",
    ],
  },
  {
    t: "Assertion functions: asserts",
    ch: "Помилки й безпека типів",
    adv: true,
    easy: "Assertion function це перевірка, що або мовчки пропускає далі, або кидає помилку. Після її виклику компілятор знає, що умова виконана, і дозволяє працювати зі значенням без додаткових if.",
    p: [
      "Type guard повертає <code>true</code> чи <code>false</code>, а що, якщо невиконану умову треба вважати помилкою й зупинити програму? Для цього є <b>функції-твердження</b> (assertion functions). Їх сигнатура містить <code>asserts</code>: <code>function assertIsString(value: unknown): asserts value is string</code>. Функція нічого не повертає, а при невідповідності кидає помилку.",
      "Магія в тому, що після виклику <code>assertIsString(x)</code> компілятор вважає, що <code>x</code> має тип <code>string</code> у <b>всьому подальшому коді</b> того ж блоку. Якщо перевірка не пройшла, виконання не дійде до наступного рядка, бо функція кине виняток. Тому не потрібні ні <code>if</code>, ні гілки <code>else</code>, і код виглядає лінійно й чисто.",
      "Є й проста форма: <code>function assert(condition: unknown, message: string): asserts condition</code>. Вона каже, що після виклику умова істинна. Тож <code>assert(user !== undefined, \"Немає користувача\")</code> звужує тип <code>user</code> до визначеного. Це зручний спосіб виразити «тут це не може бути порожнім» без оператора <code>!</code> і з зрозумілим повідомленням.",
      "Порівняйте з type guard. Guard вмикається всередині <code>if</code> і дозволяє обробити обидві гілки. Твердження застосовуються, коли «неправильно» означає «зупиняємося». Зазвичай guard підходить для логіки вибору, а твердження для валідації вхідних даних на початку функції, коли далі працювати з недійсними даними немає сенсу.",
      "Технічна вимога: щоб виклик функції-твердження звужував тип, функція має бути оголошена з <b>явною анотацією типу</b>. Звичайна оголошена через <code>function</code> працює без проблем. А от стрілкову, присвоєну змінній, треба позначити явним типом змінної, інакше компілятор не розпізнає її як твердження і повідомить про це помилкою.",
      "Як і type guard, твердження довіряється вам: компілятор не перевіряє, що тіло функції справді кидає помилку за невиконаної умови. Якщо ви забудете кинути, програма працюватиме з неправильним значенням. Тому тіла таких функцій мають бути простими й надійними, а перевірки в них повними. Додавайте зрозумілі повідомлення про помилку: вони допоможуть швидко знайти причину, особливо коли перевірка спрацює вже в реальній роботі застосунку, а не на вашому комп'ютері.",
      "Типове застосування: функція, що читає налаштування з <code>unknown</code> й перевіряє по черзі: це об'єкт, є поле <code>port</code>, воно число. Кожне твердження звужує тип, і наприкінці в руках точно типізований об'єкт. Так валідація читається як послідовність перевірок, а не як лабіринт вкладених умов, що робить код значно простішим для читання та підтримки.",
    ],
    code: [
      raw`function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number") {
    throw new Error("Очікувалось число, а отримали " + typeof value);
  }
}

function double(input: unknown): number {
  assertIsNumber(input);
  return input * 2;
}

console.log(double(21));
`,
      raw`function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function firstWord(text: string | undefined): string {
  assert(text !== undefined, "Немає тексту");
  return text.split(" ")[0];
}

console.log(firstWord("привіт світе"));
`,
      raw`// не компілюється: до виклику твердження тип input ще unknown
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("не рядок");
  }
}

function upper(input: unknown): string {
  const result = input.toUpperCase();
  assertIsString(input);
  return result;
}
console.log(upper("а"));
`,
      raw`// аварія: твердження не виконалось, і помилка зупиняє програму
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Очікувався рядок");
  }
}

const data: unknown = 42;
assertIsString(data);
console.log(data.toUpperCase());
`,
    ],
    note: "<code>asserts value is T</code> означає: після виклику функції значення має тип <code>T</code>, інакше кидається помилка. Проста форма <code>asserts condition</code> звужує за умовою. Тіло функції має справді кидати помилку: компілятор не перевіряє.",
    work: "Валідацію даних на початку функції зручно писати як послідовність тверджень: після кожного тип стає точнішим, а код лишається плоским без вкладених умов. Помилка має зрозуміле повідомлення про те, що саме не так.",
    tasks: [
      "Чим функція-твердження з <code>asserts</code> відрізняється від type guard із <code>value is T</code>?",
      "Що має робити тіло функції <code>assert(condition, message)</code>, щоб її сигнатура була чесною?",
    ],
  },
];
