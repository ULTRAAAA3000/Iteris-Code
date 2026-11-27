export const LESSONS_10 = [
  {
    t: "HTTP: методи, статуси й заголовки",
    ch: "Мережа й браузер",
    easy: "HTTP — це мова, якою браузер розмовляє із сервером: клієнт надсилає запит («дай сторінку», «збережи замовлення»), а сервер відповідає кодом і даними. Розуміти її потрібно, щоб читати помилки мережі та правильно писати клієнти.",
    p: [
      "Обмін даними в вебі працює за схемою «запит-відповідь». <b>Запит</b> складається з методу, адреси, заголовків і необов'язкового тіла. <b>Відповідь</b> — з коду статусу, заголовків і тіла. Протокол текстовий: перший рядок запиту виглядає як <code>GET /users/42 HTTP/1.1</code>, далі йдуть заголовки у форматі <code>Ім'я: значення</code>, порожній рядок і тіло. Відповідь починається з рядка <code>HTTP/1.1 200 OK</code>. Версії HTTP/2 і HTTP/3 передають ті самі поняття в двійковому вигляді, але для програміста вони виглядають однаково.",
      "<b>Метод</b> описує намір. <code>GET</code> читає дані й не змінює стан сервера. <code>POST</code> створює ресурс або запускає дію. <code>PUT</code> повністю замінює ресурс, <code>PATCH</code> змінює частину, <code>DELETE</code> видаляє. <code>HEAD</code> повертає лише заголовки, <code>OPTIONS</code> з'ясовує можливості (його використовує браузер для перевірки CORS). Важлива властивість — <b>ідемпотентність</b>: повторення запиту дає той самий стан. <code>GET</code>, <code>PUT</code>, <code>DELETE</code> ідемпотентні, а <code>POST</code> ні: подвійний <code>POST</code> може створити два замовлення. Це впливає на те, чи безпечно повторювати запит при збої.",
      "<b>Статус</b> — тризначне число, перша цифра якого вказує клас. <code>1xx</code> інформаційні. <code>2xx</code> успіх: <code>200 OK</code>, <code>201 Created</code>, <code>204 No Content</code> (успіх без тіла). <code>3xx</code> перенаправлення: <code>301</code>, <code>302</code>, <code>304 Not Modified</code> (беріть кеш). <code>4xx</code> помилка клієнта: <code>400 Bad Request</code>, <code>401 Unauthorized</code> (немає автентифікації), <code>403 Forbidden</code> (немає прав), <code>404 Not Found</code>, <code>409 Conflict</code>, <code>422</code> (дані не пройшли перевірку), <code>429 Too Many Requests</code>. <code>5xx</code> помилка сервера: <code>500</code>, <code>502</code>, <code>503</code>, <code>504</code>. Вміння розрізняти «вина клієнта» й «вина сервера» визначає, чи є сенс повторювати запит.",
      "<b>Заголовки</b> — це метадані. Поширені: <code>Content-Type</code> (формат тіла: <code>application/json</code>, <code>text/html; charset=utf-8</code>), <code>Accept</code> (які формати клієнт приймає), <code>Authorization</code> (облікові дані, наприклад <code>Bearer токен</code>), <code>Cache-Control</code> (правила кешування), <code>ETag</code> та <code>If-None-Match</code> (перевірка змін), <code>Location</code> (куди перенаправляти), <code>Set-Cookie</code> й <code>Cookie</code>, <code>User-Agent</code>, <code>Content-Length</code>. Назви заголовків нечутливі до регістру, тому в коді їх зручно приводити до нижнього.",
      "Браузери застосовують <b>політику одного походження</b> (same-origin policy): скрипт зі сторінки на <code>a.com</code> за замовчуванням не може читати відповіді від <code>b.com</code>. Щоб сервер дозволив, він надсилає заголовки <b>CORS</b>, головний із яких <code>Access-Control-Allow-Origin</code>. Для «небезпечних» запитів браузер спершу відправляє пробний запит <code>OPTIONS</code> (preflight). Помилки CORS видно лише в консолі браузера, і виправляти їх треба на сервері: на стороні клієнтського коду їх обійти неможливо й не варто.",
      "Безпека. Звичайний HTTP передає все відкритим текстом, тому для реальних застосунків використовують <b>HTTPS</b> (HTTP поверх шифрування TLS). Секрети не кладуть в адресу запиту (адреси потрапляють у журнали й історію), їх передають заголовком чи тілом. Cookie із прапорцями <code>HttpOnly</code>, <code>Secure</code> та <code>SameSite</code> захищають від крадіжки й підробки запитів. Ці знання знадобляться в наступних уроках, де ми писатимемо клієнт API на <code>fetch</code>.",
    ],
    code: [
      String.raw`import http from "node:http";
import { once } from "node:events";
const server = http.createServer((req, res) => {
  if (req.method !== "GET") {
    res.writeHead(405, { Allow: "GET" });
    res.end();
  } else if (req.url === "/ok") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "X-Demo": "yes" });
    res.end("Привіт");
  } else {
    res.writeHead(404);
    res.end("не знайдено");
  }
});
server.listen(0);
await once(server, "listening");
const base = "http://127.0.0.1:" + server.address().port;
let r = await fetch(base + "/ok");
console.log(r.status, r.statusText, r.ok, r.headers.get("content-type"), r.headers.get("X-DEMO"), await r.text());
r = await fetch(base + "/nope");
console.log(r.status, r.ok, await r.text());
r = await fetch(base + "/ok", { method: "POST" });
console.log(r.status, r.headers.get("allow"));
server.close();
server.closeAllConnections();`,
      String.raw`const raw = "HTTP/1.1 201 Created\r\nContent-Type: application/json\r\nLocation: /users/7\r\n\r\n{\"id\":7}";
const [head, body] = raw.split("\r\n\r\n");
const [statusLine, ...headerLines] = head.split("\r\n");
const [, code, ...text] = statusLine.split(" ");
const headers = Object.fromEntries(headerLines.map((l) => {
  const i = l.indexOf(":");
  return [l.slice(0, i).toLowerCase(), l.slice(i + 1).trim()];
}));
console.log(Number(code), text.join(" "), headers, JSON.parse(body));`,
      String.raw`const statusClass = (code) =>
  code >= 500 ? "server-error" : code >= 400 ? "client-error" : code >= 300 ? "redirect" : code >= 200 ? "success" : code >= 100 ? "info" : "unknown";
for (const code of [100, 200, 204, 301, 304, 404, 429, 503, 99]) console.log(code, statusClass(code));
const retryable = (code) => code === 429 || code >= 500;
console.log([400, 404, 429, 500, 503].map(retryable));`,
      String.raw`const headers = new Headers({ "Content-Type": "application/json" });
headers.append("X-Id", "1");
headers.append("x-id", "2");
console.log(headers.get("CONTENT-TYPE"), headers.get("x-id"), headers.has("accept"));
console.log([...headers]);
const res = new Response(JSON.stringify({ ok: true }), { status: 201, headers: { "Content-Type": "application/json" } });
console.log(res.status, res.ok, await res.json());`,
      String.raw`// аварія: порт 1 ніхто не слухає, тому з'єднання відхиляється, і fetch відхиляється з TypeError: fetch failed
console.log("Робимо запит на недоступну адресу");
const response = await fetch("http://127.0.0.1:1/");
console.log(response.status);`,
    ],
    note: "Метод описує намір (<code>GET</code> читає, <code>POST</code> створює, <code>PUT</code>/<code>PATCH</code> змінюють, <code>DELETE</code> видаляє), а клас статусу вказує на причину: <code>4xx</code> вина клієнта, <code>5xx</code> сервера. Повторювати безпечно ідемпотентні запити, а секрети передають не в адресі.",
    work: "Усе, що браузер і мобільний застосунок роблять із сервером, ґрунтується на HTTP. Розуміння статусів і заголовків допомагає швидко діагностувати помилки в мережевій вкладці DevTools і проєктувати надійні API.",
    tasks: [
      "У чому різниця між класами статусів 4xx та 5xx і які методи HTTP вважаються ідемпотентними?",
      "Для чого потрібні заголовки Content-Type, Authorization та Cache-Control і що таке CORS?",
    ],
  },
  {
    t: "fetch: GET і Response",
    ch: "Мережа й браузер",
    easy: "<code>fetch</code> — вбудований спосіб звернутися до сервера: ви даєте адресу, а отримуєте обіцянку відповіді. Важливо знати, що «сервер відповів помилкою» й «мережа впала» для <code>fetch</code> — дві зовсім різні ситуації.",
    p: [
      "Функція <code>fetch(url, options)</code> доступна в усіх сучасних браузерах і в Node.js (від версії 18). Вона повертає <b>проміс</b> з об'єктом <code>Response</code>. Найпростіший виклик — <code>const response = await fetch(\"/api/users\");</code>. Метод за замовчуванням <code>GET</code>. Проміс виконується, щойно прийшли <b>заголовки</b> відповіді, а тіло ще може завантажуватись. Адресу варто будувати через <code>URL</code> і <code>URLSearchParams</code>, щоб параметри були закодовані правильно.",
      "Найважливіша особливість: <code>fetch</code> відхиляє проміс лише при <b>мережевих збоях</b> (немає з'єднання, DNS, порушення CORS, скасування). Відповідь із статусом <code>404</code> чи <code>500</code> — це успішна доставка відповіді, тож проміс <b>виконується</b>. Тому після кожного <code>fetch</code> потрібно перевіряти <code>response.ok</code> (істинне для статусів 200–299) або <code>response.status</code>, і самостійно кидати помилку, якщо відповідь неуспішна. Забута перевірка — класична причина того, що застосунок «мовчки» показує порожню сторінку замість повідомлення про помилку.",
      "Об'єкт <code>Response</code> має властивості <code>status</code>, <code>statusText</code>, <code>ok</code>, <code>headers</code> (об'єкт <code>Headers</code> з методами <code>get</code>, <code>has</code>, перебором), <code>url</code>, <code>redirected</code>. Тіло читають одним із методів, що повертають проміси: <code>.json()</code> (розбирає JSON), <code>.text()</code>, <code>.blob()</code>, <code>.arrayBuffer()</code>, <code>.formData()</code>. Метод <code>.json()</code> відхиляється з <code>SyntaxError</code>, якщо тіло не є коректним JSON, тому відповідь, яка прийшла з помилкою (наприклад, HTML-сторінка помилки), потребує обережності.",
      "Тіло можна прочитати <b>лише раз</b>. Спроба викликати <code>.json()</code> після <code>.text()</code> дає <code>TypeError: Body is unusable</code>. Якщо потрібно прочитати двічі (наприклад, залогувати й обробити), створіть копію до читання: <code>response.clone()</code>. Для великих відповідей тіло доступне як потік <code>response.body</code>, який можна читати по частинах, не чекаючи завершення, наприклад через <code>for await</code>, про що ми говорили в уроці про асинхронні ітератори.",
      "Тайм-аутів у <code>fetch</code> за замовчуванням немає: запит може висіти скільки завгодно. Для обмеження використовують сигнал: <code>fetch(url, { signal: AbortSignal.timeout(5000) })</code>. При спрацюванні проміс відхиляється помилкою з іменем <code>TimeoutError</code>, а при ручному скасуванні — <code>AbortError</code>. Тому в обробнику помилок розрізняють: мережева недоступність, тайм-аут, скасування користувачем, HTTP-помилка й помилка розбору. Кожна має своє повідомлення й свою реакцію (повтор, показ помилки, тиха ігнорація).",
      "У Node.js, як і у вебворкерах, <code>fetch</code> працює без DOM, а клас <code>Response</code> можна створювати вручну: <code>new Response(body, { status, headers })</code>. Це дуже зручно для тестів, коли справжня мережа не потрібна: фальшивий <code>fetch</code> повертає заздалегідь підготовлений <code>Response</code>. Саме так ви протестуєте власного клієнта API: функція приймає <code>fetchFn</code> параметром, і в тесті підставляється заглушка.",
      "Додаткові можливості. Параметр <code>cache</code> керує поведінкою кешу браузера, <code>redirect</code> — перенаправленнями, <code>credentials</code> вирішує, чи надсилати cookie на інші домени, <code>mode</code> визначає режим CORS. Заголовки задаються через <code>headers</code>. Для тривалих завантажень зі звітом прогресу використовують читання потоку. А в старих середовищах без <code>fetch</code> потрібен поліфіл; сьогодні це рідкість, і для більшості нових проєктів вбудованого <code>fetch</code> достатньо.",
    ],
    code: [
      String.raw`import http from "node:http";
import { once } from "node:events";
const server = http.createServer((req, res) => {
  if (req.url.startsWith("/users")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([{ id: 1, name: "Оля" }, { id: 2, name: "Іван" }]));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Не знайдено");
  }
});
server.listen(0);
await once(server, "listening");
const base = "http://127.0.0.1:" + server.address().port;
const ok = await fetch(base + "/users");
console.log(ok.ok, ok.status, ok.headers.get("content-type"));
console.log(await ok.json());
const missing = await fetch(base + "/nothing");
console.log("проміс виконано попри помилку:", missing.ok, missing.status, await missing.text());
server.close();
server.closeAllConnections();`,
      String.raw`async function getJson(fetchFn, url) {
  const response = await fetchFn(url);
  if (!response.ok) {
    const error = new Error("HTTP " + response.status);
    error.status = response.status;
    throw error;
  }
  return response.json();
}
const fake = async (url) =>
  url.endsWith("/ok")
    ? new Response(JSON.stringify({ id: 1 }), { status: 200, headers: { "Content-Type": "application/json" } })
    : new Response("збій", { status: 503 });
console.log(await getJson(fake, "/ok"));
try {
  await getJson(fake, "/bad");
} catch (error) {
  console.log(error.message, error.status);
}`,
      String.raw`const original = new Response("текст відповіді");
const copy = original.clone();
console.log(original.bodyUsed);
console.log(await original.text());
console.log(original.bodyUsed, await copy.text());
const bad = new Response("це не JSON");
try {
  await bad.json();
} catch (error) {
  console.log(error.name);
}`,
      String.raw`const url = new URL("https://api.example.com/search");
url.searchParams.set("q", "кіт і пес");
url.searchParams.set("page", 2);
console.log(url.href);
const keepAlive = setTimeout(() => {}, 200);          // сигнал-таймер не тримає процес живим сам
const signal = AbortSignal.timeout(20);
const slow = new Promise((resolve, reject) => {
  signal.addEventListener("abort", () => reject(signal.reason));
});
try {
  await slow;
} catch (error) {
  console.log(error.name);
}
clearTimeout(keepAlive);`,
      String.raw`// аварія: тіло відповіді можна прочитати лише раз, і другий виклик кидає TypeError
const response = new Response(JSON.stringify({ id: 1 }));
console.log(await response.json());
console.log(await response.text());`,
    ],
    note: "<code>fetch</code> відхиляється лише при мережевих збоях, а відповідь <code>404</code> чи <code>500</code> виконується, тому перевіряйте <code>response.ok</code>. Тіло читається один раз (<code>json()</code>, <code>text()</code>), а копію дає <code>clone()</code>. Тайм-аут додається через <code>AbortSignal.timeout</code>.",
    work: "Кожен інтерфейс, що показує дані з сервера, починається з fetch. Правильна перевірка ok і тайм-аути відділяють застосунок, який чесно повідомляє про збій, від того, що показує порожній екран.",
    tasks: [
      "Чому fetch не відхиляється при статусі 404 чи 500 і як правильно обробити таку відповідь?",
      "Чому тіло відповіді можна прочитати лише раз і як додати тайм-аут до запиту?",
    ],
  },
  {
    t: "fetch: POST, JSON і заголовки",
    ch: "Мережа й браузер",
    easy: "Щоб надіслати дані серверу, потрібно сказати, що це за метод, у якому форматі йде тіло й хто ви. Усе це описують у другому аргументі <code>fetch</code>: метод, заголовки та тіло запиту.",
    p: [
      "Другий аргумент <code>fetch</code> — об'єкт параметрів. Найважливіші поля: <code>method</code> (<code>\"POST\"</code>, <code>\"PUT\"</code>, <code>\"PATCH\"</code>, <code>\"DELETE\"</code>), <code>headers</code> (об'єкт або <code>Headers</code>), <code>body</code> (тіло), <code>signal</code> (скасування). Для надсилання JSON тіло перетворюють на рядок і вказують формат у заголовку: <code>fetch(url, { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify(data) })</code>. Без <code>Content-Type</code> сервер не зрозуміє, що отримав JSON, і може відхилити запит (<code>415</code>) або інтерпретувати тіло як звичайний текст.",
      "Тіло може мати різні типи. Рядок (зокрема JSON) надсилається як є. Об'єкт <code>URLSearchParams</code> кодується як <code>application/x-www-form-urlencoded</code> (формат HTML-форм). Об'єкт <code>FormData</code> надсилається як <code>multipart/form-data</code>, що потрібне для завантаження файлів; у цьому випадку <b>не задавайте</b> заголовок <code>Content-Type</code> вручну: браузер сам додасть його з правильною межею (boundary). Для двійкових даних підходять <code>Blob</code>, <code>ArrayBuffer</code> і потоки.",
      "Заголовок <code>Authorization</code> передає облікові дані: <code>\"Bearer \" + token</code> для токенів доступу. Токен беруть із безпечного місця, а не вписують у код. Додаткові заголовки на зразок <code>Accept: application/json</code> повідомляють про бажаний формат відповіді, а <code>Idempotency-Key</code> дозволяє безпечно повторювати <code>POST</code>: сервер за ключем впізнає дублікат. Користувацькі заголовки (наприклад, <code>X-Request-Id</code>) зручні для трасування запитів у журналах.",
      "Запит <code>GET</code> і <code>HEAD</code> не можуть мати тіла: спроба передати <code>body</code> у <code>fetch</code> із цими методами дає <code>TypeError</code>. Параметри для <code>GET</code> передають в адресі. Об'єкт <code>Request</code> дозволяє зібрати запит окремо від виклику: <code>new Request(url, options)</code>, а потім передати його в <code>fetch</code> чи тест. Також корисно пам'ятати про <code>method</code> у верхньому регістрі: <code>\"post\"</code> у нижньому регістрі частина методів нормалізує, а <code>\"patch\"</code> ні, що призводило до багів, тож пишіть великими літерами.",
      "CORS і <code>credentials</code>. За замовчуванням <code>fetch</code> для запитів на інші домени не надсилає cookie. Опція <code>credentials: \"include\"</code> дозволяє, але сервер має явно її підтримати відповідними заголовками. Запити з нестандартними заголовками чи методами (<code>PUT</code>, <code>DELETE</code>, <code>Authorization</code>, <code>Content-Type: application/json</code>) викликають пробний запит <code>OPTIONS</code> (preflight). Якщо сервер не відповів потрібними заголовками <code>Access-Control-Allow-*</code>, браузер заблокує запит, і ви побачите помилку мережі без подробиць у коді.",
      "Обробка відповіді така ж, як і для <code>GET</code>, але з акцентом на помилки. Сервер часто повертає у тілі JSON з описом проблеми (<code>{ \"error\": \"Некоректний email\" }</code>) при статусі <code>4xx</code>. Гарний клієнт читає це тіло й кидає помилку з осмисленим повідомленням, а не просто «HTTP 422». Але тіло може бути й не JSON (наприклад, сторінка помилки від проксі), тому розбір обгортають у <code>try/catch</code> і мають запасний текст.",
      "Найкраща практика — не розкидати виклики <code>fetch</code> по всьому коду, а зібрати їх у невеликі функції: <code>getJson</code>, <code>postJson</code>. Вони приймають <code>fetchFn</code> параметром (для тестів), додають потрібні заголовки, перевіряють <code>ok</code>, перетворюють помилки й розбирають відповідь. Так логіка мережі живе в одному місці й легко тестується. Саме таку функцію <code>postJson</code> ви реалізуєте в практичному завданні та використаєте для клієнта API в наступному уроці.",
    ],
    code: [
      String.raw`import http from "node:http";
import { once } from "node:events";
const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ method: req.method, type: req.headers["content-type"], auth: req.headers.authorization, received: body }));
});
server.listen(0);
await once(server, "listening");
const url = "http://127.0.0.1:" + server.address().port + "/users";
const response = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: "Bearer secret" },
  body: JSON.stringify({ name: "Оля" }),
});
console.log(response.status, await response.json());
server.close();
server.closeAllConnections();`,
      String.raw`const form = new URLSearchParams({ login: "olia", password: "123" });
const request = new Request("https://api.example.com/login", { method: "POST", body: form });
console.log(request.method, request.headers.get("content-type"));
console.log(await request.text());
const data = new FormData();
data.append("title", "Звіт");
data.append("file", new Blob(["вміст"], { type: "text/plain" }), "report.txt");
const upload = new Request("https://api.example.com/upload", { method: "POST", body: data });
console.log(upload.headers.get("content-type").startsWith("multipart/form-data; boundary="));`,
      String.raw`async function postJson(fetchFn, url, data, extraHeaders = {}) {
  const response = await fetchFn(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(data),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? "HTTP " + response.status);
  return payload;
}
const fake = async (url, options) =>
  options.body.includes("bad")
    ? new Response(JSON.stringify({ error: "Некоректний email" }), { status: 422 })
    : new Response(JSON.stringify({ id: 1, echo: JSON.parse(options.body) }), { status: 201 });
console.log(await postJson(fake, "/users", { name: "Оля" }));
try {
  await postJson(fake, "/users", { name: "bad" });
} catch (error) {
  console.log(error.message);
}`,
      String.raw`const idempotent = (method) => ["GET", "HEAD", "PUT", "DELETE", "OPTIONS"].includes(method.toUpperCase());
console.log(idempotent("put"), idempotent("POST"));
const headers = new Headers();
headers.set("Authorization", "Bearer " + "abc");
headers.set("Idempotency-Key", crypto.randomUUID());
console.log(headers.get("authorization"), headers.get("idempotency-key").length);`,
      String.raw`// аварія: запит GET не може мати тіла, і створення запиту кидає TypeError
const request = new Request("https://api.example.com/users", { method: "GET", body: JSON.stringify({ a: 1 }) });
console.log(request.method);`,
    ],
    note: "Для JSON ставте <code>method</code>, <code>Content-Type: application/json</code> і <code>body: JSON.stringify(...)</code>. Для <code>FormData</code> заголовок <code>Content-Type</code> не задавайте, а <code>GET</code> не має тіла. Збирайте мережеві виклики в функції з <code>fetchFn</code> параметром, а помилки сервера розбирайте з тіла.",
    work: "Форми реєстрації, оформлення замовлень, завантаження файлів і виклики API з авторизацією виконуються POST-запитами. Єдина функція для надсилання JSON зменшує дублювання, додає потрібні заголовки автоматично й робить обробку помилок однаковою в усьому застосунку.",
    tasks: [
      "Які поля потрібні fetch для надсилання JSON і чому для FormData не слід вручну задавати Content-Type?",
      "Чому GET-запит не може мати тіла і що таке preflight-запит OPTIONS?",
    ],
  },
  {
    t: "Клієнт API: помилки і тайм-аути",
    ch: "Мережа й браузер",
    easy: "Клієнт API — це маленька обгортка над <code>fetch</code>, яка збирає в одному місці адреси, заголовки, тайм-аути й обробку помилок. Решта програми викликає прості методи й отримує або дані, або зрозумілу помилку.",
    p: [
      "Коли виклики <code>fetch</code> розкидані по коду, кожен розв'язує одні й ті самі питання по-своєму: базова адреса, токен, тайм-аут, обробка статусів. Результат — дублювання й розбіжності. Кращий підхід — <b>клієнт API</b>: модуль чи клас, що ховає всю мережеву кухню за методами <code>get</code>, <code>post</code> тощо. Решта застосунку каже «дай користувача 42» і не думає про заголовки й коди статусів. Зміна способу автентифікації тоді стає правкою в одному місці.",
      "Конструктор клієнта приймає налаштування: <code>baseUrl</code>, <code>fetchFn</code> (для тестів, за замовчуванням глобальний <code>fetch</code>), <code>timeoutMs</code>, заголовки за замовчуванням, функцію отримання токена. Метод <code>request(method, path, { params, body, signal })</code> складає повну адресу через <code>URL</code>, додає параметри запиту, ставить заголовки, об'єднує сигнали (зовнішній і тайм-аут через <code>AbortSignal.any</code>), викликає <code>fetchFn</code> і розбирає відповідь. Зручні методи <code>get</code>/<code>post</code> викликають <code>request</code> із потрібним методом.",
      "Найцінніше в клієнті — <b>розрізнення помилок</b>. Їх кілька видів із різною реакцією. Мережева (немає з'єднання): <code>fetch</code> відхилився <code>TypeError</code>; можна повторити. Тайм-аут: <code>TimeoutError</code>; можна повторити, показавши «повільний сервер». Скасування: <code>AbortError</code>; зазвичай ігнорують. HTTP-помилка клієнта (4xx): повторювати марно, потрібно показати причину. HTTP-помилка сервера (5xx, 429): іноді варто повторити. Помилка розбору (відповідь не JSON): баг сервера чи проксі. Власні класи (<code>NetworkError</code>, <code>HttpError</code> із полем <code>status</code>) дозволяють коду вище перевіряти <code>instanceof</code>, а не розбирати текст повідомлення.",
      "<b>HttpError</b> варто наповнювати корисними даними: статус, адреса, метод і розібране тіло відповіді (наприклад, повідомлення сервера з поля <code>error</code> чи <code>message</code>). Тіло читають обережно: спершу як текст, потім пробують розібрати JSON, а якщо не вдалося, залишають текст. Це дозволяє показати користувачу осмислене повідомлення замість «HTTP 422», а розробнику дає повну картину збою в журналі.",
      "Тайм-аути. Без обмеження запит може висіти хвилинами. Клієнт додає <code>AbortSignal.timeout(timeoutMs)</code> до кожного запиту й об'єднує його з сигналом викликача через <code>AbortSignal.any</code>. Тоді користувач може скасувати запит (перехід на іншу сторінку), і тайм-аут працює одночасно. Різні операції можуть мати різні тайм-аути: швидкий пошук і важке завантаження файлу вимагають неоднакових обмежень, тому метод приймає перевизначення в опціях.",
      "Повтори. Клієнт може автоматично повторювати <b>ідемпотентні</b> запити при мережевих збоях і відповідях 429/5xx з експоненційним відкладанням і джитером, як ми розглядали раніше. Для небезпечних операцій (<code>POST</code>) повтор вмикають лише явно, із ключем ідемпотентності. Корисні також хуки (перехоплювачі): функція, що додає токен до кожного запиту, і функція, що при відповіді <code>401</code> оновлює токен і повторює запит один раз.",
      "Нарешті, тестування. Завдяки тому, що клієнт приймає <code>fetchFn</code>, в тестах підставляється фальшивий, що повертає підготовлені <code>Response</code> чи кидає помилки. Перевіряють: правильно складену адресу, заголовки, класифікацію помилок, тайм-аут (з підробленим годинником). Саме такого клієнта ви напишете в практичному завданні: з розрізненням HTTP-помилок, розбором тіла й можливістю повторного запиту. Це основа для проєкту «API-клієнт із кешем і повторами» наприкінці курсу.",
    ],
    code: [
      String.raw`class HttpError extends Error {
  constructor(status, body) {
    super("HTTP " + status + (body?.error ? ": " + body.error : ""));
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}
class NetworkError extends Error {
  constructor(cause) {
    super("Мережева помилка", { cause });
    this.name = "NetworkError";
  }
}
function createClient({ baseUrl, fetchFn = fetch, timeoutMs = 5000, headers = {} }) {
  async function request(method, path, { params, body, signal } = {}) {
    const url = new URL(path, baseUrl);
    for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
    const signals = [AbortSignal.timeout(timeoutMs), ...(signal ? [signal] : [])];
    let response;
    try {
      response = await fetchFn(url, {
        method,
        headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.any(signals),
      });
    } catch (error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") throw error;
      throw new NetworkError(error);
    }
    const text = await response.text();
    let data = text;
    try { data = text ? JSON.parse(text) : null; } catch { /* залишаємо текст */ }
    if (!response.ok) throw new HttpError(response.status, data);
    return data;
  }
  return { get: (path, options) => request("GET", path, options), post: (path, body, options) => request("POST", path, { ...options, body }) };
}
const fake = async (url, options) =>
  url.pathname === "/users/1" ? new Response(JSON.stringify({ id: 1, name: "Оля" }), { status: 200 })
  : url.pathname === "/fail" ? new Response(JSON.stringify({ error: "Некоректні дані" }), { status: 422 })
  : (() => { throw new TypeError("fetch failed"); })();
const api = createClient({ baseUrl: "https://api.example.com", fetchFn: fake });
console.log(await api.get("/users/1"));
for (const path of ["/fail", "/offline"]) {
  try { await api.get(path); } catch (e) { console.log(e.name, e.message, e.status); }
}`,
      String.raw`const slow = (url, { signal }) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(new Response("ok")), 200);
    signal.addEventListener("abort", () => { clearTimeout(timer); reject(signal.reason); });
  });
try {
  await slow("/x", { signal: AbortSignal.timeout(15) });
} catch (error) {
  console.log(error.name);
}
const manual = new AbortController();
const both = AbortSignal.any([AbortSignal.timeout(500), manual.signal]);
setTimeout(() => manual.abort(), 5);
try {
  await slow("/x", { signal: both });
} catch (error) {
  console.log(error.name);
}`,
      String.raw`const classify = (error) =>
  error.name === "TimeoutError" ? "тайм-аут: повторити"
  : error.name === "AbortError" ? "скасовано: ігнорувати"
  : error.status >= 500 || error.status === 429 ? "сервер: повторити з паузою"
  : error.status >= 400 ? "клієнт: показати причину"
  : error instanceof TypeError ? "мережа: повторити"
  : "невідомо";
const cases = [
  { name: "TimeoutError" }, { name: "AbortError" }, { status: 503 }, { status: 429 }, { status: 404 }, new TypeError("fetch failed"), new Error("інше"),
];
for (const c of cases) console.log(c.status ?? c.name ?? c.constructor.name, "→", classify(c));`,
      String.raw`async function parseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;       // не JSON: повертаємо як є
  }
}
console.log(await parseBody(new Response("")));
console.log(await parseBody(new Response('{"a":1}')));
console.log(await parseBody(new Response("<html>502 Bad Gateway</html>")));`,
      String.raw`// аварія: сервер не відповів за відведений час, і необроблений TimeoutError завершує програму
const response = new Promise((resolve) => setTimeout(resolve, 1000));
const timeout = new Promise((_, reject) => {
  AbortSignal.timeout(20).addEventListener("abort", function () { reject(this.reason); });
});
console.log("Чекаємо на відповідь сервера");
await Promise.race([response, timeout]);`,
    ],
    note: "Клієнт API збирає адреси, заголовки, тайм-аути й помилки в одному місці та приймає <code>fetchFn</code> параметром. Розрізняйте мережеві помилки, тайм-аут (<code>TimeoutError</code>), скасування (<code>AbortError</code>) і HTTP-статуси, а тіло помилки читайте обережно.",
    work: "Кожен продукт з API має клієнтський шар: у ньому токени, повтори, логування й перетворення помилок на зрозумілі повідомлення. Саме він визначає, наскільки приємно користувач переживає збої мережі та повільне з'єднання.",
    tasks: [
      "Які види помилок розрізняє клієнт API і яка реакція доречна для кожного?",
      "Як поєднати тайм-аут і ручне скасування запиту та навіщо клієнту приймати fetchFn параметром?",
    ],
  },
  {
    t: "DOM: дерево, пошук і зміна елементів",
    ch: "Мережа й браузер",
    easy: "Браузер перетворює HTML-сторінку на дерево об'єктів — DOM. Кожен тег стає вузлом, і JavaScript може знаходити, створювати, змінювати та видаляти вузли, а отже й оживляти сторінку.",
    p: [
      "<b>DOM</b> (Document Object Model) — це подання сторінки у вигляді дерева. Корінь — об'єкт <code>document</code>, нижче йде <code>document.documentElement</code> (тег <code>&lt;html&gt;</code>), далі <code>head</code> та <code>body</code>, а за ними всі інші елементи. Кожен вузол має типові властивості: <code>tagName</code>, <code>children</code>, <code>parentElement</code>, <code>nextElementSibling</code>. Зміна дерева негайно відбивається на екрані. DOM існує лише в браузері: у Node.js чи вебворкері об'єкта <code>document</code> немає, і звернення до нього дає <code>ReferenceError</code>.",
      "Знайти елемент допомагають методи пошуку за CSS-селектором. <code>document.querySelector(\"#id\")</code> повертає перший збіг або <code>null</code>, а <code>document.querySelectorAll(\".item\")</code> повертає статичний список усіх (його можна перебирати через <code>for...of</code> чи <code>Array.from</code>). Той самий метод є на будь-якому елементі й шукає всередині нього. Старіші <code>getElementById</code> і <code>getElementsByClassName</code> теж працюють, але <code>querySelector</code> універсальніший. Результат пошуку завжди перевіряйте на <code>null</code>: якщо елемента немає, звернення до його властивостей закінчиться <code>TypeError</code>.",
      "Вміст змінюють властивостями. <code>textContent</code> встановлює чи читає <b>звичайний текст</b> і безпечний: усе, що ви в нього запишете, буде показано буквально. <code>innerHTML</code> розбирає рядок як <b>HTML-розмітку</b>, і це дає змогу вставити теги, але якщо в рядок потрапили дані користувача, зловмисник може підкинути скрипт (атака XSS). Тому правило: для тексту використовуйте <code>textContent</code>, а <code>innerHTML</code> лише для довірених рядків або після екранування. Для відображення списків і карток зручно складати розмітку функціями, які екранують усі значення.",
      "Створення елементів: <code>document.createElement(\"li\")</code> створює вузол, <code>li.textContent = \"текст\"</code> наповнює його, а <code>parent.append(li)</code> (або <code>appendChild</code>, <code>prepend</code>, <code>before</code>, <code>after</code>, <code>replaceWith</code>) вставляє в дерево. Метод <code>remove()</code> видаляє вузол. Для вставки багатьох елементів без зайвих перемальовувань збирають їх у <code>DocumentFragment</code> або в одному рядку HTML і вставляють за один раз: кожна окрема зміна живого дерева може запускати дорогий перерахунок розмітки.",
      "Атрибути й класи. <code>element.getAttribute(\"href\")</code>, <code>setAttribute</code>, <code>removeAttribute</code> працюють із атрибутами; багато з них доступні як властивості (<code>input.value</code>, <code>a.href</code>, <code>checkbox.checked</code>). Класи оформлення зручно змінювати через <code>element.classList</code>: <code>add</code>, <code>remove</code>, <code>toggle</code>, <code>contains</code>. Власні дані зберігають в атрибутах <code>data-*</code>, які читаються через <code>element.dataset</code> (<code>data-user-id</code> стає <code>dataset.userId</code>). Стилі краще задавати класами CSS, а не напряму через <code>element.style</code>.",
      "Продуктивність і підводні камені. Звернення до розмірів (<code>offsetHeight</code>, <code>getBoundingClientRect</code>) змушує браузер перерахувати розмітку, тому чергування читання й запису в циклі сильно уповільнює сторінку. Збирайте зміни пакетами. Не зберігайте посилання на видалені елементи довше, ніж потрібно (витоки пам'яті). Перед пошуком переконайтесь, що DOM уже завантажено: скрипт, підключений із атрибутом <code>defer</code> або з типом <code>module</code>, виконується після розбору документа.",
      "У великих застосунках пряму роботу з DOM зазвичай беруть на себе фреймворки (React, Vue, Svelte), які оновлюють дерево за описом стану. Але знання базового DOM API необхідне: воно лежить під усіма абстракціями й потрібне для малих скриптів, розширень і налагодження. А головний навик, який переноситься куди завгодно, — формувати розмітку з даних безпечно, з екрануванням, що ви й потренуєте в практичному завданні функцією <code>renderList</code>.",
    ],
    code: [
      String.raw`// фрагмент: пошук, зміна й створення елементів у браузері
const title = document.querySelector("#title");
if (title) title.textContent = "Новий заголовок";
for (const item of document.querySelectorAll(".item")) {
  item.classList.add("active");
  item.dataset.checked = "true";      // data-checked="true"
}
const li = document.createElement("li");
li.textContent = "<b>не тег, а текст</b>";   // безпечно
document.querySelector("ul").append(li);`,
      String.raw`const escapeHtml = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function renderList(items) {
  const rows = items.map(({ text, done }) => "<li" + (done ? ' class="done"' : "") + ">" + escapeHtml(text) + "</li>");
  return "<ul>" + rows.join("") + "</ul>";
}
console.log(renderList([{ text: "Купити хліб", done: true }, { text: "<script>alert(1)</script>", done: false }]));
console.log(renderList([]));`,
      String.raw`// фрагмент: пакетна вставка й небезпечний innerHTML
const fragment = document.createDocumentFragment();
for (const name of ["Оля", "Іван", "Марія"]) {
  const li = document.createElement("li");
  li.textContent = name;
  fragment.append(li);
}
document.querySelector("ul").append(fragment);        // одна вставка в живе дерево

const userInput = '<img src=x onerror="alert(1)">';
document.querySelector("#out").innerHTML = userInput;  // НЕБЕЗПЕЧНО: виконається скрипт
document.querySelector("#out").textContent = userInput; // безпечно: показано як текст`,
      String.raw`// фрагмент: атрибути, класи й data-*
const button = document.querySelector("button");
button.setAttribute("aria-pressed", "true");
button.classList.toggle("on");
console.log(button.classList.contains("on"), button.dataset.userId, button.getAttribute("type"));
const link = document.createElement("a");
link.href = "/profile";
link.textContent = "Профіль";
document.body.append(link);
link.remove();`,
      String.raw`// аварія: у Node.js немає DOM, тому звернення до document дає ReferenceError
console.log("Шукаємо елемент на сторінці");
const element = document.querySelector("#app");
console.log(element);`,
    ],
    note: "DOM існує лише в браузері. Шукайте через <code>querySelector</code> (і перевіряйте на <code>null</code>), текст ставте через <code>textContent</code>, а <code>innerHTML</code> лише для довірених чи екранованих рядків. Класи змінюйте через <code>classList</code>, дані тримайте в <code>data-*</code>.",
    work: "Кожен інтерфейс, від форми підписки до складної панелі керування, зрештою є зміною DOM. Безпечна побудова розмітки з даних захищає від XSS, однієї з найпоширеніших та найнебезпечніших вразливостей у вебі.",
    tasks: [
      "Чим textContent відрізняється від innerHTML і чому innerHTML з даними користувача небезпечний?",
      "Що поверне querySelector, якщо елемента немає, і як ефективно вставити багато нових елементів?",
    ],
  },
  {
    t: "DOM: події, форми й делегування",
    ch: "Мережа й браузер",
    easy: "Подія — це сигнал від сторінки: клік, натискання клавіші, відправка форми. Ви підписуєтесь на сигнал функцією-обробником, а браузер викликає її в потрібний момент і передає опис того, що сталося.",
    p: [
      "Підписку створює <code>element.addEventListener(type, handler, options)</code>. Обробник отримує <b>об'єкт події</b> з корисними властивостями: <code>type</code>, <code>target</code> (елемент, на якому подія сталась), <code>currentTarget</code> (елемент, до якого прикріплено обробник), <code>timeStamp</code>, а для клавіатури <code>key</code> і <code>code</code>, для миші <code>clientX</code>, <code>clientY</code>. Кілька обробників на одну подію не заважають один одному й викликаються в порядку додавання. Видалити обробник можна через <code>removeEventListener</code> з тією ж функцією, тому анонімні стрілки для знімних підписок не підходять.",
      "Параметри підписки: <code>{ once: true }</code> викличе обробник лише раз, <code>{ passive: true }</code> обіцяє браузеру, що обробник не викличе <code>preventDefault</code> (прискорює прокручування), <code>{ signal }</code> дозволяє зняти всі підписки одним <code>controller.abort()</code>, що дуже зручно при знищенні компонента. Скасувати стандартну дію браузера (перехід за посиланням, відправку форми) можна методом <code>event.preventDefault()</code>, а зупинити подальше поширення події — <code>event.stopPropagation()</code>, хоча його варто вживати рідко.",
      "Подія в DOM проходить три фази. Спершу «занурення» (capture) від кореня вниз до цілі, потім сама ціль, далі «спливання» (bubbling) знизу вгору через усіх предків. За замовчуванням обробники спрацьовують на фазі спливання, тож подію кліку на кнопці може побачити й її батьківський <code>div</code>, і <code>body</code>. Деякі події (наприклад, <code>focus</code>, <code>blur</code>) не спливають, а для них існують спливаючі двійники (<code>focusin</code>, <code>focusout</code>).",
      "Спливання дає потужний прийом — <b>делегування подій</b>. Замість того щоб вішати обробник на кожен із сотні пунктів списку, його вішають один раз на спільного предка й усередині перевіряють, куди клацнули: <code>const item = event.target.closest(\".item\"); if (!item || !list.contains(item)) return;</code>. Переваги: менше обробників і пам'яті, працює для елементів, доданих пізніше, простіше знімати. Використовуйте <code>closest</code>, а не лише <code>target</code>, бо клік може потрапити на вкладений елемент усередині пункту.",
      "Форми. Подія <code>submit</code> спрацьовує на самому елементі <code>&lt;form&gt;</code>, і в її обробнику зазвичай викликають <code>event.preventDefault()</code>, щоб не перезавантажувати сторінку, а дані надсилати через <code>fetch</code>. Значення збирає <code>new FormData(form)</code> (його можна перетворити на об'єкт через <code>Object.fromEntries</code>), або читають <code>input.value</code>. Подія <code>input</code> спрацьовує під час кожної зміни значення (для живої перевірки й пошуку), а <code>change</code> після завершення редагування. Вбудована валідація HTML (<code>required</code>, <code>pattern</code>, <code>minlength</code>) працює разом із <code>form.checkValidity()</code>.",
      "Власні події створюють через <code>new CustomEvent(\"name\", { detail: data, bubbles: true })</code> і запускають методом <code>element.dispatchEvent(event)</code>. Вони дозволяють компонентам спілкуватися без прямих посилань один на одного. Подібний механізм (<code>EventTarget</code>, <code>Event</code>, <code>CustomEvent</code>) працює і в Node.js, тож логіку подій можна випробувати без браузера, що ми зробимо в прикладах. Не плутайте його з <code>EventEmitter</code> із Node, який ми розглянемо в окремому уроці.",
      "Типові помилки: обробники, які не знімають при знищенні компонента (витоки), виклик <code>handler()</code> замість передачі <code>handler</code>, втрата <code>this</code> у методах класів, відсутність <code>preventDefault</code> у формах, надмірне використання <code>stopPropagation</code>, що ламає делегування. А валідація форми має відбуватись і на клієнті (для зручності), і на сервері (для безпеки): клієнтську перевірку завжди можна обійти. У практичному завданні ви напишете чисту функцію перевірки полів форми за правилами.",
    ],
    code: [
      String.raw`const target = new EventTarget();
const log = [];
target.addEventListener("ping", (event) => log.push("перший " + event.type));
target.addEventListener("ping", (event) => log.push("другий " + event.detail));
target.dispatchEvent(new CustomEvent("ping", { detail: 42 }));
console.log(log);
let once = 0;
target.addEventListener("once", () => once++, { once: true });
target.dispatchEvent(new Event("once"));
target.dispatchEvent(new Event("once"));
console.log(once);`,
      String.raw`const target = new EventTarget();
const handler = () => console.log("спрацював");
target.addEventListener("go", handler);
target.dispatchEvent(new Event("go"));
target.removeEventListener("go", handler);
target.dispatchEvent(new Event("go"));
const controller = new AbortController();
target.addEventListener("a", () => console.log("a"), { signal: controller.signal });
target.addEventListener("b", () => console.log("b"), { signal: controller.signal });
controller.abort();                                  // знімає обидві підписки одразу
target.dispatchEvent(new Event("a"));
const cancelable = new Event("submit", { cancelable: true });
target.addEventListener("submit", (e) => e.preventDefault());
console.log(target.dispatchEvent(cancelable), cancelable.defaultPrevented);`,
      String.raw`// фрагмент: делегування подій на списку в браузері
const list = document.querySelector("#todo");
list.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item || !list.contains(item)) return;
  item.classList.toggle("done");
});
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  console.log(data);
});`,
      String.raw`function validateForm(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const value = values[field];
    const empty = value === undefined || value === null || String(value).trim() === "";
    if (rule.required && empty) errors[field] = "Поле обов'язкове";
    else if (!empty && rule.min !== undefined && Number(value) < rule.min) errors[field] = "Мінімум " + rule.min;
    else if (!empty && rule.pattern && !rule.pattern.test(String(value))) errors[field] = "Некоректний формат";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
const rules = { name: { required: true }, email: { required: true, pattern: /^\S+@\S+\.\S+$/ }, age: { min: 18 } };
console.log(validateForm({ name: "Оля", email: "o@x.ua", age: 20 }, rules));
console.log(validateForm({ name: " ", email: "oops", age: 15 }, rules));`,
      String.raw`// аварія: обробником має бути функція або об'єкт із handleEvent, а число викликає TypeError
const target = new EventTarget();
target.addEventListener("click", () => console.log("нормальний обробник"));
target.addEventListener("click", 5);`,
    ],
    note: "Подія спливає від цілі до предків, тому один обробник на спільному предку (<code>closest</code>) обслуговує багато елементів. <code>preventDefault</code> скасовує стандартну дію, <code>{ once }</code> і <code>{ signal }</code> спрощують зняття підписок. Клієнтська валідація зручна, але справжня захищена лише на сервері.",
    work: "Усі інтерактивні сторінки складаються з обробників подій: кліки, введення, відправка форм, клавіатурні скорочення, прокручування. Делегування й вчасне зняття підписок роблять інтерфейс швидким і без витоків пам'яті, а надійна валідація форм зберігає нерви користувачів.",
    tasks: [
      "Що таке спливання подій і як на ньому будується делегування?",
      "Навіщо в обробнику submit викликають preventDefault і чому валідація лише на клієнті недостатня?",
    ],
  },
  {
    t: "Кешування відповідей і дедуплікація запитів",
    ch: "Мережа й браузер",
    adv: true,
    easy: "Кеш запам'ятовує вже отримані відповіді, щоб не питати сервер двічі. Дедуплікація не дає одночасно відправити десять однакових запитів: усі десять чекають на одну відповідь.",
    p: [
      "Мережа повільна й дорога, тому найшвидший запит — той, якого не було. Кешування зберігає відповіді й віддає їх повторно. Воно діє на кількох рівнях. Браузерний HTTP-кеш керується заголовками відповіді: <code>Cache-Control: max-age=3600</code> дозволяє використовувати відповідь годину без запиту, <code>no-store</code> забороняє зберігання, <code>no-cache</code> вимагає перевірки перед використанням. Заголовок <code>ETag</code> дає «відбиток» версії ресурсу: браузер надсилає його як <code>If-None-Match</code>, і якщо ресурс не змінився, сервер відповідає <code>304 Not Modified</code> без тіла, заощаджуючи трафік.",
      "Крім браузерного, ви можете тримати власний <b>кеш у пам'яті</b> застосунку, зазвичай у <code>Map</code>. Ключ — ідентифікатор запиту (адреса й параметри), значення — відповідь разом із міткою часу. Для кожного запису задають <b>час життя</b> (TTL, time to live): якщо запис старший за TTL, він вважається застарілим і запит йде в мережу. Читання часу краще робити через залежність <code>now()</code>, а не прямо через <code>Date.now()</code>, щоб кеш можна було тестувати з підробленим годинником.",
      "Складність кешування — у <b>інвалідації</b>: коли дані змінилися, кеш потрібно оновити, а передбачити це не завжди можливо. Є класичний жарт про те, що в програмуванні лише дві складні речі: інвалідація кешу й іменування. Прості стратегії: короткий TTL для часто мінливих даних, довгий для довідників, очищення кешу після відповідних змін (після <code>POST</code> скинути записи, які він міг зачепити), ручна кнопка «оновити». Кеш без обмеження розміру перетворюється на витік пам'яті, тому додають ліміт і видалення найстаріших записів, як ми робили в LRU-кеші.",
      "<b>Дедуплікація запитів</b> розв'язує іншу проблему: кілька компонентів одночасно просять ті самі дані. Без захисту піде кілька однакових запитів. Рішення — зберігати не готовий результат, а <b>проміс, що виконується</b> (in-flight): перший запит створює проміс і кладе його в таблицю за ключем, а всі наступні запити з тим самим ключем отримують <b>той самий проміс</b>. Коли він завершиться, усі отримають відповідь одночасно. Після завершення запис або видаляють, або перетворюють на кеш із TTL.",
      "Помилки не кешують. Якщо запит упав, збережений відхилений проміс закріпив би збій на весь час життя запису: наступні спроби отримали б ту саму помилку без звернення до мережі. Тому при відхиленні проміс видаляють із таблиці, щоб наступний виклик спробував знову. Також не кешують відповіді, залежні від користувача, без включення користувача в ключ, інакше один користувач побачить дані іншого: це серйозна вразливість.",
      "Популярна стратегія — <b>stale-while-revalidate</b> («віддай застаріле, поки оновлюєш»): якщо запис застарів, але ще не надто, його одразу повертають користувачу (швидко), а в фоні надсилають запит на оновлення, результат якого з'явиться наступного разу. Це дає й швидкість, і свіжість. Бібліотеки (TanStack Query, SWR) реалізують усе це «з коробки», але розуміння механізму допомагає їх налаштовувати й писати прості власні кеші.",
      "У практичному завданні ви напишете фабрику <code>createCachedFetcher</code>, яка поєднує кеш із TTL, дедуплікацію одночасних запитів і відмову від кешування помилок. Час передається як залежність, тож тести можуть керувати ним без очікування. Це чудовий приклад того, як кілька простих ідей (<code>Map</code>, проміс як значення, часова мітка) об'єднуються в корисний інструмент, який можна вмонтувати в будь-який клієнт API.",
    ],
    code: [
      String.raw`function createCache(ttlMs, now = () => Date.now()) {
  const store = new Map();
  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (now() - entry.savedAt >= ttlMs) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key, value) {
      store.set(key, { value, savedAt: now() });
    },
  };
}
let time = 0;
const cache = createCache(100, () => time);
cache.set("user:1", { name: "Оля" });
console.log(cache.get("user:1"));
time = 99;
console.log(cache.get("user:1"));
time = 100;
console.log(cache.get("user:1"));`,
      String.raw`const inflight = new Map();
let networkCalls = 0;
function fetchOnce(key, load) {
  if (inflight.has(key)) return inflight.get(key);
  const promise = load()
    .finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}
const load = async () => {
  networkCalls++;
  await new Promise((resolve) => setTimeout(resolve, 10));
  return "дані";
};
const results = await Promise.all([fetchOnce("k", load), fetchOnce("k", load), fetchOnce("k", load)]);
console.log(results, "мережевих викликів:", networkCalls);
await fetchOnce("k", load);
console.log("після завершення новий запит:", networkCalls);`,
      String.raw`async function swr(key, load, store, { ttlMs, staleMs, now }) {
  const entry = store.get(key);
  const age = entry ? now() - entry.at : Infinity;
  if (entry && age < ttlMs) return { data: entry.data, source: "fresh" };
  const refresh = load().then((data) => { store.set(key, { data, at: now() }); return data; });
  if (entry && age < ttlMs + staleMs) {
    refresh.catch(() => {});
    return { data: entry.data, source: "stale" };
  }
  return { data: await refresh, source: "network" };
}
const store = new Map();
let time = 0;
let n = 0;
const load = async () => "версія " + ++n;
const opts = { ttlMs: 100, staleMs: 200, now: () => time };
console.log(await swr("k", load, store, opts));
time = 50;
console.log(await swr("k", load, store, opts));
time = 150;
console.log(await swr("k", load, store, opts));
await Promise.resolve();
console.log(store.get("k").data);`,
      String.raw`const headers = new Headers({ "Cache-Control": "public, max-age=3600", ETag: '"v42"' });
const maxAge = Number(/max-age=(\d+)/.exec(headers.get("cache-control"))?.[1] ?? 0);
console.log(maxAge, headers.get("etag"));
const conditional = new Headers({ "If-None-Match": headers.get("etag") });
console.log(conditional.get("if-none-match"), new Response(null, { status: 304 }).status);`,
      String.raw`// аварія: відхилений проміс закріпили в кеші, тому кожен наступний запит одразу отримує ту саму помилку без звернення до мережі
const cache = new Map();
function cachedFetch(key, load) {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key);
}
let calls = 0;
const flaky = async () => {
  calls++;
  if (calls === 1) throw new Error("тимчасовий збій");
  return "дані";
};
await cachedFetch("k", flaky).catch((error) => console.log("перший:", error.message));
console.log("мережевих викликів:", calls);
console.log(await cachedFetch("k", flaky));`,
    ],
    note: "Кеш із TTL віддає збережені відповіді, а дедуплікація ділить один <code>in-flight</code> проміс між одночасними запитами. Помилки не кешують, час беруть через залежність <code>now()</code>, а кеш обмежують за розміром. Stale-while-revalidate дає швидкість і свіжість.",
    work: "Кеші й дедуплікація зменшують навантаження на сервер, економлять трафік і прискорюють інтерфейс. Бібліотеки на кшталт TanStack Query роблять це за вас, але самі принципи потрібні, щоб правильно їх налаштувати й не віддати чужі дані.",
    tasks: [
      "Що таке TTL і навіщо кешувати in-flight проміс замість готового результату?",
      "Чому не можна кешувати відхилені проміси та в чому суть stale-while-revalidate?",
    ],
  },
  {
    t: "Серверний Node: http, fs і process",
    ch: "Мережа й браузер",
    adv: true,
    easy: "Node.js — це не лише запуск скриптів: у ньому є вбудований вебсервер, робота з файлами й доступ до самого процесу. Цього набору достатньо, щоб без жодних бібліотек написати маленький робочий сервіс.",
    p: [
      "Модуль <code>node:http</code> дає змогу створити сервер: <code>http.createServer((req, res) =&gt; { ... })</code>. Обробник отримує об'єкт запиту (<code>req.method</code>, <code>req.url</code>, <code>req.headers</code>) і відповіді (<code>res.writeHead(status, headers)</code>, <code>res.end(body)</code>). Запуск — <code>server.listen(port)</code>; порт <code>0</code> означає «виберіть вільний», і справжнє значення дає <code>server.address().port</code>. На базі цього працюють усі веб-фреймворки (Express, Fastify, Koa): вони додають маршрутизацію, проміжні обробники й зручні помічники.",
      "Тіло запиту приходить <b>потоком</b> частинами. Його збирають, перебираючи запит через <code>for await (const chunk of req)</code> і з'єднуючи кусні через <code>Buffer.concat</code>, а потім розбирають (наприклад, <code>JSON.parse</code>). Обмежуйте розмір тіла, інакше сервер можна завалити надлишковим навантаженням. Відповіді завжди надсилайте з коректним <code>Content-Type</code> і статусом: <code>200</code> для успіху, <code>404</code> для відсутнього ресурсу, <code>405</code> для недозволеного методу, <code>400</code> для поганого запиту, <code>500</code> для внутрішньої помилки.",
      "<b>Маршрутизація</b> — вибір обробника за методом і шляхом. Простий роутер зберігає список правил: метод, шаблон шляху (<code>/users/:id</code>) і функцію. Шаблон перетворюють на регулярний вираз, і при збігу витягують параметри (<code>params.id</code>). Адреса приходить разом із запитом (<code>/users/5?x=1</code>), тому параметри запиту розбирають окремо через <code>new URL(req.url, base)</code>. Якщо шлях знайдено, а метод не підходить, правильна відповідь — <code>405</code> із заголовком <code>Allow</code>, а не <code>404</code>.",
      "Файлова система: модуль <code>node:fs/promises</code> надає асинхронні функції <code>readFile</code>, <code>writeFile</code>, <code>appendFile</code>, <code>readdir</code>, <code>mkdir</code>, <code>rm</code>, <code>stat</code>. Використовуйте саме версію з промісами та <code>await</code>, а не синхронні (<code>readFileSync</code>) всередині сервера: вони блокують потік, і всі інші запити чекають. Шляхи складайте через <code>node:path</code> (<code>path.join</code>, <code>path.resolve</code>), а не конкатенацією, і ніколи не будуйте шлях прямо з даних користувача без перевірки: так виникає вразливість «обхід каталогів» (<code>../../etc/passwd</code>). Для великих файлів читайте потоками (<code>createReadStream</code>) та передавайте їх відповіді через <code>pipeline</code>.",
      "Об'єкт <code>process</code> описує поточний процес: <code>process.argv</code> (аргументи командного рядка, перші два — шлях до Node і до скрипта), <code>process.env</code> (змінні середовища), <code>process.cwd()</code>, <code>process.platform</code>, <code>process.exitCode</code> та <code>process.exit(code)</code> для завершення. Ненульовий код виходу повідомляє системі й CI про помилку. Подія <code>process.on(\"SIGTERM\", ...)</code> дозволяє виконати <b>плавне завершення</b>: перестати приймати нові запити (<code>server.close()</code>), дочекатись активних і лише потім вийти. Саме так поводяться сервіси в контейнерах.",
      "Помилки на сервері теж потрібно обробляти. Необроблена помилка в асинхронному обробнику може завершити процес, тож обгортайте обробник у <code>try/catch</code> і відповідайте <code>500</code> без розкриття деталей (стек і внутрішні повідомлення користувачу не показують, їх пишуть у журнал). Помилка читання файлу <code>ENOENT</code> (немає файлу) та <code>EACCES</code> (немає прав) мають код у властивості <code>error.code</code>, за яким відрізняють ситуації й відповідають по-різному (<code>404</code> замість <code>500</code>).",
      "Цей урок завершує мережеву главу: ви знаєте, як клієнт говорить із сервером і як сервер виглядає зсередини. У практичному завданні ви напишете чистий роутер: функцію, яка за методом і адресою знаходить обробник, витягує параметри й повертає відповідь із правильним статусом. Він не потребує мережі й легко тестується, а до справжнього <code>http.createServer</code> підключається одним рядком: це і є розумна архітектура, де логіка відділена від транспорту.",
    ],
    code: [
      String.raw`import http from "node:http";
import { once } from "node:events";
const users = new Map([[1, { id: 1, name: "Оля" }]]);
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const send = (status, data) => {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
  };
  const match = /^\/users\/(\d+)$/.exec(url.pathname);
  if (match && req.method === "GET") {
    const user = users.get(Number(match[1]));
    return user ? send(200, user) : send(404, { error: "Не знайдено" });
  }
  if (url.pathname === "/users" && req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const id = users.size + 1;
    users.set(id, { id, ...body });
    return send(201, users.get(id));
  }
  send(404, { error: "Невідомий шлях" });
});
server.listen(0);
await once(server, "listening");
const base = "http://127.0.0.1:" + server.address().port;
console.log(await (await fetch(base + "/users/1")).json());
const created = await fetch(base + "/users", { method: "POST", body: JSON.stringify({ name: "Іван" }) });
console.log(created.status, await created.json());
console.log((await fetch(base + "/users/9")).status);
server.close();
server.closeAllConnections();`,
      String.raw`import { mkdtemp, readFile, writeFile, appendFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = await mkdtemp(path.join(tmpdir(), "demo-"));
const file = path.join(dir, "notes.txt");
await writeFile(file, "рядок 1\n", "utf8");
await appendFile(file, "рядок 2\n");
console.log(JSON.stringify(await readFile(file, "utf8")));
console.log(await readdir(dir));
console.log(path.basename(file), path.extname(file), path.dirname(file) === dir);
await rm(dir, { recursive: true });`,
      String.raw`console.log(typeof process.argv[0], process.argv.length >= 2);
console.log(typeof process.env.PATH, process.platform.length > 0, typeof process.cwd());
console.log(process.version.startsWith("v"), typeof process.pid, typeof process.uptime());
process.exitCode = 0;`,
      String.raw`// фрагмент: плавне завершення сервера
const server = http.createServer(handler).listen(3000);
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    console.log("Отримано " + signal + ", завершуємо");
    server.close(() => process.exit(0));          // дочекатись активних запитів
    setTimeout(() => process.exit(1), 10_000).unref();   // але не довше за 10 секунд
  });
}`,
      String.raw`// аварія: файлу не існує, readFile відхиляється з кодом ENOENT, і ніхто цього не обробляє
import { readFile } from "node:fs/promises";
console.log("Читаємо конфігурацію");
const text = await readFile("/definitely/not/here/config.json", "utf8");
console.log(text);`,
    ],
    note: "<code>http.createServer</code> дає запит і відповідь, тіло запиту збирають із потоку. Використовуйте <code>fs/promises</code>, <code>path.join</code>, статуси <code>404</code>/<code>405</code>/<code>500</code> і плавне завершення за сигналами. Логіку роутингу тримайте окремо від транспорту.",
    work: "Мікросервіси, вебхуки, скрипти обробки файлів і внутрішні інструменти пишуть на Node без важких фреймворків. Розуміння основ http, fs і process допомагає налагоджувати будь-який серверний код на JavaScript, навіть якщо ви користуєтесь Express чи Fastify.",
    tasks: [
      "Як отримати тіло запиту в http-сервері Node і чому синхронні функції fs небезпечні всередині сервера?",
      "Чим 404 відрізняється від 405 і навіщо потрібне плавне завершення за сигналом SIGTERM?",
    ],
  },
];
