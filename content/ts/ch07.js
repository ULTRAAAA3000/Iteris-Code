// Глава 7 «Асинхронність» (уроки 59–73). Тексти українською; у p, easy, note, work, tasks дозволені лише теги code, b, i, а < > & екрануємо.
const raw = String.raw;

export const LESSONS_07 = [
  {
    t: "Колбеки й цикл подій",
    ch: "Асинхронність",
    easy: "Колбек це записка «зроби це, коли закінчиш»: ви залишаєте функцію й ідете далі, а система викличе її пізніше. Цикл подій це черговий, який по одному викликає ці записки, коли головна справа вільна.",
    p: [
      "JavaScript виконує код в <b>одному потоці</b>: поки одна функція працює, інші чекають. Тому довгі операції, такі як таймер, запит у мережу чи читання файлу, не блокують програму: їх віддають системі, а до функції додають <b>колбек</b>, тобто функцію, яку викличуть, коли результат буде готовий. Колбек це звичайна функція, передана іншій функції як аргумент, і з функціональними типами ви вже працювали.",
      "За порядок викликів відповідає <b>цикл подій</b> (event loop). Він виконує код, що працює прямо зараз, і доки той не завершиться, нічого іншого не запускає. Коли поточний код закінчився, цикл бере з черги наступний колбек і виконує його до кінця. Звідси головне правило: колбек <b>ніколи не перебиває</b> код, що зараз працює, і виконається лише після того, як синхронний код завершиться.",
      "Подивіться на <code>setTimeout(f, 0)</code>. Нуль мілісекунд не означає «негайно»: колбек потрапляє в чергу й чекає, доки весь поточний синхронний код завершиться. Тому рядок, написаний після <code>setTimeout</code>, виконається раніше за колбек. Це найчастіше джерело здивувань для початківців, і саме його варто зрозуміти першим.",
      "У Node.js давно прийнято колбеки в стилі <b>«помилка першою»</b>: <code>(error: Error | null, value?: T) =&gt; void</code>. Якщо операція вдалася, перший аргумент дорівнює <code>null</code>, а результат лежить у другому. Якщо ні, у першому лежить помилка. Для TypeScript це зручний контракт: тип колбека описує обидва випадки, а всередині колбека ви спершу перевіряєте <code>error</code>.",
      "Є ще одна черга, <b>мікрозадач</b>, куди потрапляють колбеки з <code>queueMicrotask</code> і, як побачимо в наступному уроці, з промісів. Мікрозадачі виконуються <i>одразу після</i> поточного коду і <i>до</i> наступного таймера. Тому мікрозадача, створена пізніше, все одно випередить <code>setTimeout(f, 0)</code>.",
      "Колбеки мають неприємну властивість: помилку, кинуту всередині колбека, не зловить <code>try/catch</code>, що стоїть навколо виклику <code>setTimeout</code>. Коли колбек виконується, того <code>try</code> давно немає на стеку. Тому помилки в колбеках або обробляють усередині самого колбека, або передають першим аргументом, як у стилі «помилка першою». Якщо цього не зробити, програма аварійно завершиться.",
      "Другий недолік це «піраміда колбеків»: коли наступний крок залежить від попереднього, кожен колбек вкладають у попередній, і код з'їжджає вправо. Помилки доводиться обробляти на кожному рівні. Саме від цього й придумали проміси та <code>async/await</code>, яким присвячено наступні уроки. Але розуміти колбеки потрібно: на них стоять таймери, події, а ще купа старих бібліотек.",
    ],
    code: [
      raw`console.log("1. початок");

setTimeout(() => {
  console.log("3. колбек таймера");
}, 0);

console.log("2. кінець синхронного коду");
`,
      raw`type Done<T> = (error: Error | null, value?: T) => void;

function loadTitle(id: number, done: Done<string>): void {
  setTimeout(() => {
    if (id <= 0) {
      done(new Error("Неправильний id: " + id));
      return;
    }
    done(null, "Стаття №" + id);
  }, 0);
}

function show(error: Error | null, title?: string): void {
  if (error) {
    console.log("помилка:", error.message);
    return;
  }
  console.log("отримано:", title);
}

loadTitle(7, show);
loadTitle(0, show);
`,
      raw`setTimeout(() => console.log("таймер"), 0);
queueMicrotask(() => console.log("мікрозадача"));
console.log("синхронний код");
`,
      raw`// аварія: помилка в колбеку не потрапляє в try/catch навколо setTimeout
try {
  setTimeout(() => {
    throw new Error("збій у колбеку");
  }, 0);
  console.log("try завершено без помилок");
} catch (error) {
  console.log("сюди ми не потрапимо");
}
`,
    ],
    note: "Синхронний код завершується завжди першим, а колбеки чекають у черзі. Помилку з колбека не зловить <code>try/catch</code> навколо <code>setTimeout</code>: обробляйте її всередині колбека або передавайте першим аргументом.",
    work: "Колбеки лежать в основі таймерів, обробників подій у браузері, потоків і багатьох бібліотек Node.js. Розуміння порядку виконання допомагає шукати помилки, коли дані «з'являються пізніше», ніж очікувалося, і писати передбачуваний код.",
    tasks: [
      "Чому <code>setTimeout(f, 0)</code> виконає <code>f</code> після рядка, який стоїть далі в коді?",
      "Чому <code>try/catch</code> навколо виклику <code>setTimeout</code> не ловить помилку, кинуту в колбеку?",
    ],
  },
  {
    t: "Promise<T>: створення й then",
    ch: "Асинхронність",
    easy: "Проміс це розписка: «результат буде пізніше». Спершу вона «очікує», потім або виконується зі значенням, або відхиляється з помилкою. Тип <code>Promise&lt;number&gt;</code> каже, що колись у розписці з'явиться число.",
    p: [
      "<b>Проміс</b> (<code>Promise</code>) це об'єкт, який представляє результат операції, що ще не завершилась. Він має три стани: <i>очікує</i> (pending), <i>виконаний</i> (fulfilled) зі значенням і <i>відхилений</i> (rejected) із причиною. Перейти зі стану очікування можна лише один раз, і після цього результат не змінюється. Це дає передбачуваність, якої бракує колбекам.",
      "У TypeScript проміс <b>узагальнений</b>: <code>Promise&lt;T&gt;</code>, де <code>T</code> це тип майбутнього значення. <code>Promise&lt;string&gt;</code> колись дасть рядок, <code>Promise&lt;void&gt;</code> лише повідомить, що операція завершилась. Завдяки цьому компілятор перевіряє, що ви робите з результатом, так само як із будь-яким іншим значенням.",
      "Створюють проміс конструктором <code>new Promise&lt;T&gt;((resolve, reject) =&gt; { ... })</code>. Функція всередині (виконавець) запускається одразу. Коли робота закінчилась успішно, викликають <code>resolve(значення)</code>, коли ні, то <code>reject(помилка)</code>. Тип значення в <code>resolve</code> має збігатися з <code>T</code>, і компілятор це перевіряє. Зазвичай так «загортають» старі API з колбеками, наприклад таймери.",
      "Результат читають методом <code>.then(onFulfilled)</code>. Він приймає функцію, яку викличуть зі значенням, коли проміс виконається. Помилки ловить <code>.catch(onRejected)</code>, а <code>.finally(f)</code> спрацьовує в обох випадках і не отримує аргументів. Важливо: колбеки <code>then</code> завжди виконуються <i>асинхронно</i>, навіть коли проміс уже виконаний, тож порядок виконання передбачуваний.",
      "Найцікавіше: <code>.then</code> повертає <b>новий проміс</b>, тому методи складаються в ланцюжок. Те, що повертає колбек, стає значенням наступного кроку. Якщо повернути звичайне значення, наступний проміс виконається з ним. Якщо повернути інший проміс, ланцюжок дочекається його. Тип змінюється разом із ланцюжком: <code>Promise&lt;number&gt;</code> після <code>.then(n =&gt; String(n))</code> стає <code>Promise&lt;string&gt;</code>, і компілятор це відстежує.",
      "Помилка в ланцюжку «проскакує» повз усі <code>then</code> аж до найближчого <code>catch</code>. Якщо колбек у <code>then</code> кине помилку, ланцюжок теж перейде в стан відхилення. Тому один <code>catch</code> у кінці зазвичай обробляє збої всіх попередніх кроків. А ще <code>catch</code> повертає виконаний проміс, тож після нього ланцюжок спокійно продовжується.",
      "Остерігайтеся відхиленого промісу, який ніхто не обробив. Node.js вважає це серйозною помилкою й завершує програму з ненульовим кодом. Також не плутайте: <code>resolve</code> і <code>reject</code> завершують проміс, але <i>не зупиняють</i> функцію-виконавця, тож після них додавайте <code>return</code>, якщо далі є код. У наступному уроці побачимо, як <code>async/await</code> робить такі ланцюжки схожими на звичайний послідовний код.",
    ],
    code: [
      raw`function delay(ms: number): Promise<string> {
  return new Promise<string>((resolve) => {
    setTimeout(() => resolve("минуло " + ms + " мс"), ms);
  });
}

delay(10).then((text) => console.log(text));
console.log("проміс створено, чекаємо");
`,
      raw`Promise.resolve(21)
  .then((n) => n * 2)
  .then((n) => "відповідь: " + n)
  .then((text) => console.log(text, text.length));
`,
      raw`function parsePositive(text: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const n = Number(text);
    if (Number.isNaN(n) || n <= 0) {
      reject(new Error("Очікувалось додатне число, отримано: " + text));
      return;
    }
    resolve(n);
  });
}

parsePositive("5")
  .then((n) => {
    console.log("перше:", n);
    return parsePositive("-3");
  })
  .then((n) => console.log("друге:", n))
  .catch((error: Error) => console.log("помилка:", error.message))
  .finally(() => console.log("кінець ланцюжка"));
`,
      raw`// не компілюється: resolve має приймати значення типу number
const answer = new Promise<number>((resolve) => {
  resolve("сорок два");
});
`,
      raw`// аварія: відхилений проміс, який ніхто не обробив, завершує програму
Promise.reject(new Error("ніхто не зловив"));
console.log("цей рядок виконається, але програма все одно впаде");
`,
    ],
    note: "Проміс переходить зі стану очікування лише раз: у виконаний або відхилений. <code>then</code> повертає новий проміс, тож ланцюжок змінює тип. Відхилений проміс без <code>catch</code> зупиняє програму.",
    work: "Проміси повертають майже всі сучасні API: запити <code>fetch</code>, робота з файлами, бази даних. Уміння читати й складати ланцюжки потрібне, щоб розуміти чужий код і спокійно переходити до <code>async/await</code>, який стоїть на промісах.",
    tasks: [
      "Які три стани має проміс і скільки разів він може змінити стан?",
      "Який тип матиме проміс після <code>.then((n) =&gt; String(n))</code>, якщо початковий проміс був <code>Promise&lt;number&gt;</code>?",
    ],
  },
  {
    t: "async/await і типи",
    ch: "Асинхронність",
    easy: "<code>async/await</code> дозволяє писати асинхронний код так, ніби він іде рядок за рядком. Слово <code>await</code> каже: «зачекай тут на результат, а решта програми тим часом живе далі».",
    p: [
      "Ключове слово <code>async</code> перед функцією робить її <b>асинхронною</b>: вона завжди повертає проміс. Якщо всередині ви пишете <code>return 5</code>, зовні отримаєте <code>Promise&lt;number&gt;</code>. Якщо кидаєте помилку, проміс відхиляється. Тип результату пишуть явно: <code>async function load(): Promise&lt;string&gt;</code>, тобто в анотації вказують проміс, а не голе значення.",
      "Усередині асинхронної функції діє оператор <code>await</code>. Він «розпаковує» проміс: вираз <code>await promise</code> дає значення типу <code>T</code>, а не <code>Promise&lt;T&gt;</code>. Виконання функції призупиняється до готовності промісу, але програма не зависає: цикл подій тим часом обробляє інші задачі. Після завершення функція прокидається з наступного рядка. Саме тому <code>await</code> називають «точкою очікування»: у цьому місці функція віддає керування циклу подій, а потім отримує його назад уже з готовим результатом.",
      "Головна перевага це читабельність. Ланцюжок <code>.then(...).then(...)</code> перетворюється на послідовність рядків: <code>const user = await getUser(); const posts = await getPosts(user.id);</code>. Змінні видно в усій функції, тож не треба тягти проміжні значення крізь колбеки, а звичайні <code>if</code>, цикли й <code>try/catch</code> знову працюють так, як ви звикли.",
      "Типи тут допомагають найбільше. Якщо забути <code>await</code>, змінна матиме тип <code>Promise&lt;T&gt;</code>, а не <code>T</code>, і спроба використати її як число чи рядок не скомпілюється. Це одна з найчастіших помилок, і TypeScript ловить її миттєво. Але умова <code>if (promise)</code> завжди істинна, бо об'єкт промісу є «правдивим», тож тут компілятор мовчить, і доводиться бути уважним.",
      "Помилки в <code>async</code>-функціях обробляють звичайним <code>try/catch</code>: відхилений проміс після <code>await</code> перетворюється на виняток. Змінна в <code>catch</code> має тип <code>unknown</code>, і перевіряти її треба так само, як у розділі про помилки. Це набагато зручніше, ніж окремий <code>.catch</code> у кінці ланцюжка.",
      "У модулях CommonJS, які використовує запуск завдань, <code>await</code> на верхньому рівні файлу не працює: він дозволений лише в <code>async</code>-функціях. Звичайний прийом: написати <code>async function main()</code>, а в кінці викликати <code>main()</code>. У сучасних ES-модулях верхньорівневий <code>await</code> є, але ми тримаємося універсального варіанту, який працює всюди.",
      "Остерігайтеся двох пасток. По-перше, <code>await</code> у звичайному колбеку (наприклад, у <code>forEach</code>) не зупиняє зовнішню функцію: <code>forEach</code> не чекає на проміси. Для цього є цикл <code>for...of</code>. По-друге, <code>async</code> перетворює навіть синхронне значення на проміс, тож не позначайте функцію <code>async</code> без потреби: це ускладнює виклик і додає зайву асинхронність.",
    ],
    code: [
      raw`async function getGreeting(userName: string): Promise<string> {
  return "Привіт, " + userName + "!";
}

async function main(): Promise<void> {
  const text = await getGreeting("Олена");
  console.log(text, text.length);
}

main();
`,
      raw`interface User {
  id: number;
  nick: string;
}

function findUser(id: number): Promise<User> {
  return new Promise((resolve) => setTimeout(() => resolve({ id, nick: "user" + id }), 0));
}

function countPosts(user: User): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(user.id * 10), 0));
}

async function main(): Promise<void> {
  const user = await findUser(3);
  const posts = await countPosts(user);
  console.log(user.nick, posts);
}

main();
`,
      raw`async function failing(): Promise<number> {
  throw new Error("сервер недоступний");
}

async function main(): Promise<void> {
  try {
    const value = await failing();
    console.log("значення", value);
  } catch (error) {
    console.log("перехоплено:", error instanceof Error ? error.message : error);
  } finally {
    console.log("завершення");
  }
}

main();
`,
      raw`// не компілюється: без await змінна має тип Promise<number>, а не number
async function getCount(): Promise<number> {
  return 5;
}

async function main(): Promise<void> {
  const count: number = getCount();
  console.log(count + 1);
}

main();
`,
      raw`function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  [1, 2].forEach(async (n) => {
    await pause(5);
    console.log("forEach: елемент", n);
  });
  console.log("після forEach (він не чекав)");

  for (const n of [1, 2]) {
    await pause(20);
    console.log("for...of: елемент", n);
  }
}

main();
`,
    ],
    note: "Асинхронна функція завжди повертає <code>Promise&lt;T&gt;</code>, а <code>await</code> розпаковує його до <code>T</code>. Забутий <code>await</code> компілятор ловить за типом. <code>await</code> працює лише всередині <code>async</code>-функцій, тож точку входу оформлюйте як <code>main()</code>.",
    work: "Майже кожен запит до сервера чи бази даних у сучасних застосунках пишуть через <code>async/await</code>. Такий код легко читати, перевіряти типами й супроводжувати, тому він витіснив довгі ланцюжки <code>.then</code> у нових проєктах.",
    tasks: [
      "Який тип матиме змінна, якщо викликати <code>async</code>-функцію й забути <code>await</code>?",
      "Чому <code>forEach</code> з <code>await</code> усередині не чекає на проміси і чим його замінити?",
    ],
  },
  {
    t: "Помилки в асинхронному коді",
    ch: "Асинхронність",
    easy: "В асинхронному коді помилка не «пролітає» вгору по стеку, як звичайна: вона ховається всередині промісу. Якщо її не дочекатись і не зловити, програма може впасти тоді, коли ви вже думаєте про інше.",
    p: [
      "Відхилений проміс це асинхронний аналог кинутого винятку. Але шлях у нього інший: помилка не піднімається стеком викликів, а чекає всередині промісу, поки хтось її забере через <code>await</code> чи <code>.catch</code>. Тому <code>try/catch</code>, що стоїть навколо виклику <i>без</i> <code>await</code>, нічого не зловить: на момент відхилення цей <code>try</code> уже закінчився.",
      "Класична пастка: <code>async</code>-функція повертає проміс без <code>await</code> усередині <code>try</code>. Проміс повертається ще не виконаним, функція виходить із <code>try</code>, і якщо потім він відхиляється, <code>catch</code> цього не бачить. Виправлення: <code>return await fetchData()</code> усередині <code>try</code>. Поза <code>try</code> зайвий <code>await</code> не потрібен, а всередині він змінює поведінку: функція чекає на результат у межах блока, тож відмова потрапляє саме в <code>catch</code>. Це той рідкісний випадок, коли «зайвий» <code>await</code> насправді робить код правильним.",
      "Відхилений проміс, який ніхто не обробив, у Node.js завершує програму: це <b>необроблена відмова</b> (unhandled rejection). Вона виникає, коли ви викликали асинхронну функцію й не написали ні <code>await</code>, ні <code>.catch</code>. Такий виклик іноді називають «плаваючим промісом». Хороша звичка: кожен виклик асинхронної функції або чекають, або явно обробляють помилку.",
      "Точка входу асинхронної програми зазвичай виглядає так: <code>main().catch((error) =&gt; console.log(error))</code>. Це «парасолька» для всього, що нагорі не обробили. Усередині <code>main</code> помилки ловлять там, де є що з ними робити: повторити спробу, показати повідомлення, повернути значення за замовчуванням. Не ловіть помилку лише для того, щоб промовчати: «порожній» <code>catch</code> в асинхронному коді ховає збої так само надійно, як і в синхронному.",
      "Блок <code>finally</code> в <code>async</code>-функціях працює так само, як у звичайних: виконується завжди, навіть якщо була помилка або <code>return</code>. Його використовують, щоб скинути індикатор завантаження чи закрити з'єднання. Якщо в <code>finally</code> теж кинути помилку, вона замінить попередню, тому код у <code>finally</code> робіть простим і безпечним.",
      "Корисний прийом, відомий із розділу про помилки, це <b>перетворити відмову на значення</b>. Обгортка виконує асинхронну дію й повертає не проміс, що може відхилитись, а звичайний об'єкт <code>{ ok: true, value }</code> чи <code>{ ok: false, error }</code>. Тип такого результату дискримінантний, тож компілятор змусить вас перевірити <code>ok</code> перед читанням значення.",
      "Нарешті, пам'ятайте про помилки в колбеках, що виконуються поза вашим <code>await</code>: обробники подій, таймери. Їх теж треба обгортати власним <code>try/catch</code> або передавати результат через проміс. Правило просте: помилка має мати власника, який точно її побачить. Без власника вона стає необробленою відмовою, і програма зупиняється.",
    ],
    code: [
      raw`function fail(message: string): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), 0));
}

async function main(): Promise<void> {
  try {
    await fail("диск переповнений");
    console.log("цей рядок пропущено");
  } catch (error) {
    console.log("зловили:", error instanceof Error ? error.message : "невідомо");
  }
}

main();
`,
      raw`async function riskyLoad(): Promise<string> {
  throw new Error("збій завантаження");
}

async function noAwait(): Promise<string> {
  try {
    return riskyLoad();
  } catch {
    return "запасне значення (ми його ніколи не побачимо)";
  }
}

async function withAwait(): Promise<string> {
  try {
    return await riskyLoad();
  } catch {
    return "запасне значення";
  }
}

async function main(): Promise<void> {
  console.log("з await:", await withAwait());
  try {
    await noAwait();
  } catch (error) {
    console.log("без await помилка проскочила:", error instanceof Error ? error.message : error);
  }
}

main();
`,
      raw`type Outcome<T> = { ok: true; value: T } | { ok: false; error: string };

async function attempt<T>(action: () => Promise<T>): Promise<Outcome<T>> {
  try {
    return { ok: true, value: await action() };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function main(): Promise<void> {
  const good = await attempt(async () => 42);
  const bad = await attempt(async () => {
    throw new Error("не вдалося");
  });
  for (const result of [good, bad]) {
    if (result.ok) {
      console.log("значення:", result.value);
    } else {
      console.log("помилка:", result.error);
    }
  }
}

main();
`,
      raw`// аварія: виклик без await і без catch залишає відхилення без власника
async function save(): Promise<void> {
  throw new Error("не вдалося зберегти");
}

async function main(): Promise<void> {
  save();
  console.log("main пішов далі, ніби все добре");
}

main();
`,
    ],
    note: "Відхилений проміс без власника завалює програму. <code>try/catch</code> ловить помилку лише від <code>await</code> усередині блока, тому в <code>try</code> пишіть <code>return await</code>. Кожен асинхронний виклик або чекайте, або обробляйте.",
    work: "У серверах і застосунках збої мережі трапляються щодня. Чітка обробка відхилень не дає окремому запиту зупинити весь процес і дозволяє показати користувачеві зрозуміле повідомлення замість загадкового падіння програми.",
    tasks: [
      "Чому <code>try { return fetchData(); } catch {}</code> без <code>await</code> не ловить відмову промісу?",
      "Що станеться в Node.js із відхиленим промісом, на який немає ні <code>await</code>, ні <code>.catch</code>?",
    ],
  },
  {
    t: "Promise.all, allSettled, race і any",
    ch: "Асинхронність",
    easy: "Коли треба дочекатися кількох справ, їх запускають разом, як кількох кур'єрів. <code>Promise.all</code> чекає на всіх, <code>race</code> бере найшвидшого, <code>any</code> першого успішного, а <code>allSettled</code> збирає звіт навіть про невдачі.",
    p: [
      "Якщо кілька асинхронних операцій не залежать одна від одної, їх вигідно запускати <b>паралельно</b>: загальний час дорівнює часу найдовшої, а не сумі всіх. Для цього є чотири статичні методи <code>Promise</code>. Кожен приймає масив промісів і повертає новий проміс, а компілятор акуратно виводить тип результату.",
      "<code>Promise.all</code> чекає, поки виконаються <i>всі</i> проміси, і повертає масив значень <b>у тому самому порядку</b>, у якому вони стояли в аргументі, а не в порядку завершення. Для кортежу аргументів TypeScript виводить кортеж результатів: <code>Promise.all([getNumber(), getText()])</code> дасть <code>[number, string]</code>. Якщо хоча б один проміс відхилиться, <code>all</code> одразу відхиляється з тією самою помилкою.",
      "Важливо розуміти, що <code>all</code> не скасовує решту промісів після першої помилки: вони продовжують працювати, просто їхні результати ніхто не отримає. Якщо потрібні результати <i>всіх</i> операцій, навіть невдалих, використовуйте <code>Promise.allSettled</code>. Він ніколи не відхиляється й повертає масив об'єктів: <code>{ status: 'fulfilled', value }</code> або <code>{ status: 'rejected', reason }</code>.",
      "Об'єкти <code>allSettled</code> утворюють дискримінантне об'єднання за полем <code>status</code>, тож звуження працює звично: після перевірки <code>result.status === 'fulfilled'</code> доступне поле <code>value</code>, а для <code>'rejected'</code> поле <code>reason</code> (його тип <code>any</code>, тож його варто звузити). Це зручний спосіб зібрати звіт: скільки операцій вдалося, а скільки ні.",
      "<code>Promise.race</code> повертає результат <b>найшвидшого</b> проміса, виконаного чи відхиленого. Класичне застосування це тайм-аут: гонка між реальною операцією та промісом, який відхиляється через заданий час. А <code>Promise.any</code> чекає на <i>першого успішного</i>, ігноруючи відмови, і відхиляється лише тоді, коли відхилилися всі: тоді помилка має тип <code>AggregateError</code> з полем <code>errors</code>.",
      "Як вибрати метод? Усі результати потрібні, і одна помилка робить решту безглуздою: <code>all</code>. Потрібні всі результати разом зі збоями: <code>allSettled</code>. Потрібен перший відповідач, наприклад із кількох дзеркал сервера: <code>any</code>. Потрібен перший, що завершився будь-як, наприклад для тайм-ауту: <code>race</code>. Порожній масив <code>all</code> виконує порожнім масивом, <code>any</code> відхиляє, а <code>race</code> лишається в очікуванні назавжди, тож не передавайте їм порожні набори.",
      "Нарешті, пам'ятайте: проміси починають працювати в момент створення, а не в момент передачі в <code>all</code>. Тому <code>Promise.all(items.map(load))</code> запускає всі <code>load</code> одразу. Для великих списків це може перевантажити сервер, і тоді потрібне обмеження паралелізму, яке ми розглянемо далі в цій главі. А наступний урок докладніше про вибір між послідовним і паралельним виконанням.",
    ],
    code: [
      raw`function after<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function main(): Promise<void> {
  const [slow, fast, text] = await Promise.all([after(30, 1), after(5, 2), after(10, "три")]);
  console.log(slow, fast, text);
  console.log(slow + fast, text.toUpperCase());
}

main();
`,
      raw`function job(id: number): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id % 2 === 0) {
        reject(new Error("збій у задачі " + id));
      } else {
        resolve("задача " + id + " готова");
      }
    }, id);
  });
}

async function main(): Promise<void> {
  const results = await Promise.allSettled([job(1), job(2), job(3)]);
  for (const result of results) {
    if (result.status === "fulfilled") {
      console.log("ок:", result.value);
    } else {
      console.log("збій:", (result.reason as Error).message);
    }
  }
}

main();
`,
      raw`function after<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("перевищено час: " + ms + " мс")), ms);
  });
  return Promise.race([work, timeout]);
}

async function main(): Promise<void> {
  console.log(await withTimeout(after(5, "встигли"), 50));
  try {
    await withTimeout(after(60, "запізно"), 10);
  } catch (error) {
    console.log(error instanceof Error ? error.message : error);
  }
}

main();
`,
      raw`function after<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function failAfter(ms: number): Promise<string> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("збій")), ms));
}

async function main(): Promise<void> {
  const first = await Promise.any([failAfter(5), after(20, "дзеркало B"), after(10, "дзеркало C")]);
  console.log("перший успішний:", first);

  try {
    await Promise.any([failAfter(1), failAfter(2)]);
  } catch (error) {
    if (error instanceof AggregateError) {
      console.log("усі відхилені:", error.errors.length);
    }
  }
}

main();
`,
      raw`// не компілюється: Promise.all повертає кортеж значень, а не один рядок
async function main(): Promise<void> {
  const text: string = await Promise.all([Promise.resolve("a"), Promise.resolve("b")]);
  console.log(text);
}

main();
`,
    ],
    note: "<code>all</code> зберігає порядок аргументів і падає від першої помилки, <code>allSettled</code> збирає всі результати, <code>race</code> бере найшвидшого, <code>any</code> першого успішного. Проміси стартують у момент створення, а не в <code>all</code>.",
    work: "Коли сторінці потрібні дані з кількох джерел, їх запитують паралельно через <code>Promise.all</code>. Тайм-аут запиту будують через <code>race</code>, а звіт про пакетну обробку списку, де частина записів може не пройти, через <code>allSettled</code>.",
    tasks: [
      "У якому порядку <code>Promise.all</code> повертає результати: у порядку аргументів чи в порядку завершення?",
      "Чим <code>Promise.allSettled</code> відрізняється від <code>Promise.all</code> при відхиленні одного з промісів?",
    ],
  },
  {
    t: "Послідовно чи паралельно: await у циклах",
    ch: "Асинхронність",
    easy: "Якщо чекати кожного кур'єра по черзі, дорога займе стільки, скільки всі маршрути разом. Якщо відправити всіх одразу й чекати на останнього, піде стільки, скільки найдовший маршрут.",
    p: [
      "Одна з найчастіших причин повільного асинхронного коду це <code>await</code> у циклі там, де операції незалежні. Цикл <code>for (const id of ids) { results.push(await load(id)); }</code> запускає кожну наступну операцію лише після завершення попередньої. Якщо кожна триває 100 мс, то десять операцій займуть 1000 мс. Такий підхід називають <b>послідовним</b>.",
      "<b>Паралельний</b> варіант спочатку запускає всі операції, а вже потім чекає на них: <code>const results = await Promise.all(ids.map(load));</code>. Метод <code>map</code> викликає <code>load</code> для кожного елемента й одразу повертає масив промісів, а <code>Promise.all</code> збирає їх в один. Ті самі десять операцій займуть приблизно 100 мс. Різниця для користувача величезна.",
      "Але паралельність не завжди правильна. Послідовність потрібна, коли наступний крок <b>залежить</b> від попереднього (потрібен <code>id</code>, який дала перша операція), коли важливий порядок побічних дій, таких як записи в журнал чи транзакції, або коли треба зупинитися на першій невдачі й не запускати решту. У таких випадках цикл із <code>await</code> це не помилка, а свідомий вибір.",
      "Також паралельність має ціну: сервер, база чи зовнішній API можуть обмежувати кількість одночасних запитів. Сто паралельних запитів до слабкого сервера він може відхилити. Тому для великих списків вибирають середній шлях: обробляють пачками або обмежують кількість одночасних задач. Саме таку техніку, пул задач, ми побачимо в одному з просунутих уроків цієї глави.",
      "Корисна властивість: <code>Promise.all</code> повертає результати в порядку аргументів, а не завершення. Навіть коли друга операція завершилась раніше за першу, у масиві результатів вона все одно стоїть другою. Тож не потрібно додатково сортувати відповіді, щоб зіставити їх із вхідними даними: індекс результату збігається з індексом вхідного елемента.",
      "Пам'ятайте про <code>forEach</code>: він не чекає на асинхронні колбеки, тому для послідовного виконання використовуйте <code>for...of</code>, а для паралельного <code>map</code> разом із <code>Promise.all</code>. Також уважно ставтеся до помилок: у <code>Promise.all</code> перша відмова відхиляє весь результат, а решта операцій усе одно триває, тож побічні ефекти, як-от запис чи відправка, можуть статися попри помилку.",
      "Як перевірити, що код дійсно паралельний, не покладаючись на годинник? Порівняйте <i>порядок</i> подій. У послідовному варіанті повідомлення про початок і кінець операцій чергуються: початок 1, кінець 1, початок 2. У паралельному спершу друкуються всі «початки», а потім усі «кінці». Саме так ми перевірятимемо це в прикладах і в завданні, без вимірювання часу, який нестабільний.",
    ],
    code: [
      raw`function work(id: number, ms: number): Promise<number> {
  return new Promise((resolve) => {
    console.log("початок", id);
    setTimeout(() => {
      console.log("кінець", id);
      resolve(id * 10);
    }, ms);
  });
}

async function main(): Promise<void> {
  const results: number[] = [];
  for (const id of [1, 2, 3]) {
    results.push(await work(id, 5));
  }
  console.log(results);
}

main();
`,
      raw`function work(id: number, ms: number): Promise<number> {
  return new Promise((resolve) => {
    console.log("початок", id);
    setTimeout(() => {
      console.log("кінець", id);
      resolve(id * 10);
    }, ms);
  });
}

async function main(): Promise<void> {
  const results = await Promise.all([1, 2, 3].map((id) => work(id, 5)));
  console.log(results);
}

main();
`,
      raw`function work(id: number, ms: number): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("кінець", id);
      resolve(id * 10);
    }, ms);
  });
}

async function main(): Promise<void> {
  const results = await Promise.all([work(1, 30), work(2, 5), work(3, 15)]);
  console.log("порядок результатів збігається з порядком аргументів:", results);
}

main();
`,
      raw`function work(id: number, ms: number): Promise<number> {
  return new Promise((resolve) => {
    console.log("початок", id);
    setTimeout(() => {
      console.log("кінець", id);
      resolve(id * 10);
    }, ms);
  });
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const results: number[] = [];
  [1, 2, 3].forEach(async (id) => {
    results.push(await work(id, 5));
  });
  console.log("після forEach:", results.length);
  await pause(30);
  console.log("після очікування:", results.length);
}

main();
`,
      raw`// не компілюється: map з async-функцією повертає масив промісів, а не чисел
async function load(id: number): Promise<number> {
  return id * 2;
}

async function main(): Promise<void> {
  const results: number[] = [1, 2, 3].map(async (id) => await load(id));
  console.log(results);
}

main();
`,
    ],
    note: "Незалежні операції запускайте паралельно через <code>map</code> і <code>Promise.all</code>, залежні виконуйте послідовно. <code>forEach</code> не чекає на проміси. Велику кількість паралельних запитів обмежуйте, щоб не перевантажити сервер.",
    work: "У застосунках швидкість часто залежить саме від цього вибору. Завантаження десяти незалежних карток паралельно відчувається миттєвим, а послідовно змушує користувача чекати. А записи, що залежать один від одного, мають іти по черзі.",
    tasks: [
      "Чим відрізняється час виконання десяти незалежних операцій у циклі з <code>await</code> і через <code>Promise.all</code>?",
      "Коли послідовне виконання з <code>await</code> у циклі правильніше за паралельне?",
    ],
  },
  {
    t: "Таймери й затримки: sleep через Promise",
    ch: "Асинхронність",
    easy: "Функція <code>sleep</code> це будильник, який дзвонить через вказаний час і дозволяє написати «зачекай трохи» всередині <code>async</code>-функції. Усередині це звичайний таймер, загорнутий у проміс.",
    p: [
      "У JavaScript немає вбудованої функції «заснути»: блокувати єдиний потік не можна, бо зависла б уся програма. Замість цього є таймери <code>setTimeout</code> і <code>setInterval</code>, що працюють із колбеками. Щоб користуватися ними разом з <code>async/await</code>, таймер загортають у проміс і отримують знайому функцію <code>sleep(ms)</code>.",
      "Реалізація коротка: <code>function sleep(ms: number): Promise&lt;void&gt; { return new Promise((resolve) =&gt; setTimeout(resolve, ms)); }</code>. Проміс виконується без значення, тож тип <code>Promise&lt;void&gt;</code>. Після цього <code>await sleep(100)</code> призупиняє лише поточну асинхронну функцію, а решта програми продовжує працювати, на відміну від справжнього «блокуючого» сну.",
      "Щоб затримка могла повертати значення, зробіть її узагальненою: <code>function delay&lt;T&gt;(ms: number, value: T): Promise&lt;T&gt;</code>. Тоді <code>await delay(50, 42)</code> дає число, а компілятор виводить <code>T</code> із другого аргумента. Такі заглушки дуже зручні в прикладах і тестах, де потрібно імітувати повільну операцію без справжньої мережі чи бази даних.",
      "Для повторюваних дій є <code>setInterval(f, ms)</code>, який викликає <code>f</code> знову й знову, доки його не зупинять через <code>clearInterval(id)</code>. Забути зупинити інтервал це класична помилка: програма ніколи не завершується, а колбек працює вічно. Тому інтервали завжди зберігають ідентифікатор і зупиняють у потрібний момент. Те саме стосується <code>clearTimeout</code> для таймерів, що ще не спрацювали.",
      "Дуже важливо: час у таймерах <b>не гарантований</b>. <code>setTimeout(f, 100)</code> означає «не раніше ніж через 100 мс», а коли саме, залежить від навантаження циклу подій. Тому не будуйте точну логіку на вимірюванні часу, а в тестах перевіряйте <i>порядок</i> подій, а не мілісекунди. Саме тому в завданнях цього курсу немає перевірок на кшталт «виконалось рівно за 100 мс».",
      "Затримки застосовують у справжніх програмах для <b>повторних спроб</b> (почекати перед новою спробою), <b>обмеження частоти</b> запитів, <b>debounce</b> (запускати дію лише після паузи в діях користувача) і <b>тайм-аутів</b>. У прикладах ми часто використовуємо <code>sleep</code> для імітації повільної операції, і така імітація не потребує мережі.",
      "Остерігайтеся двох помилок. Перша: <code>await sleep(ms)</code> у циклі робить цикл послідовним, що часто потрібно (пауза між запитами), але іноді дивує. Друга: <code>setTimeout</code> повертає в Node.js об'єкт, а в браузері число, тому не робіть арифметику з ідентифікатором таймера й не розраховуйте на його конкретний тип: передавайте його лише в <code>clearTimeout</code> чи <code>clearInterval</code>.",
    ],
    code: [
      raw`function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  console.log("перед сном");
  await sleep(10);
  console.log("після сну");
}

main();
console.log("main не блокує решту програми");
`,
      raw`function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function main(): Promise<void> {
  const n = await delay(5, 42);
  const s = await delay(5, "готово");
  console.log(n + 1, s.toUpperCase());
}

main();
`,
      raw`let ticks = 0;
const timer = setInterval(() => {
  ticks += 1;
  console.log("тік", ticks);
  if (ticks === 3) {
    clearInterval(timer);
    console.log("інтервал зупинено");
  }
}, 5);
`,
      raw`function debounce<A extends unknown[]>(action: (...args: A) => void, ms: number): (...args: A) => void {
  let timer: number | undefined;
  return (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => action(...args), ms);
  };
}

const save = debounce((text: string) => console.log("збережено:", text), 10);
save("п");
save("пр");
save("при");
`,
      raw`// не компілюється: sleep повертає Promise<void>, значення в ньому немає
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const result: string = await sleep(10);
  console.log(result);
}

main();
`,
    ],
    note: "Блокувати потік не можна, тому «сон» це таймер, загорнутий у проміс. Час у таймерах не гарантований: перевіряйте порядок подій, а не мілісекунди. Інтервали завжди зупиняйте через <code>clearInterval</code>.",
    work: "Паузи між повторними спробами, обмеження частоти запитів, відкладене збереження чернетки після того, як користувач перестав друкувати, і тайм-аути в мережевому коді реалізують саме через таймери та <code>sleep</code>, не блокуючи решту програми.",
    tasks: [
      "Чому в JavaScript «заснути» не можна просто зупинивши потік, і що роблять замість цього?",
      "Що станеться, якщо створити <code>setInterval</code> і ніколи не викликати <code>clearInterval</code>?",
    ],
  },
  {
    t: "Скасування: AbortController",
    ch: "Асинхронність",
    easy: "Скасування це кнопка «стоп» для довгої справи. <code>AbortController</code> видає пульт, а <code>AbortSignal</code> це лампочка, за якою операція дізнається, що її вже ніхто не чекає.",
    p: [
      "Проміс сам по собі скасувати не можна: щойно операція почалась, вона дійде до кінця. Але багато справ втрачають сенс, поки тривають: користувач закрив сторінку, ввів новий запит у полі пошуку, минув час очікування. Для таких випадків у платформі є стандартний механізм скасування: <b>AbortController</b> і <b>AbortSignal</b>. Вони є і в браузері, і в Node.js, і в типах <code>lib.dom</code>.",
      "Схема проста. Ви створюєте <code>const controller = new AbortController()</code> і передаєте <code>controller.signal</code> в операцію, яку можна скасувати. Коли треба зупинити, викликаєте <code>controller.abort()</code>. Сигнал переходить у стан «скасовано»: поле <code>signal.aborted</code> стає <code>true</code>, а всім підписникам надсилається подія <code>abort</code>. Скасувати можна лише один раз, повторні виклики нічого не змінюють.",
      "Сама по собі скасовувана операція мусить <b>співпрацювати</b>: перевіряти <code>signal.aborted</code> або підписатися на подію <code>abort</code> і зупинитися. Вбудовані API, як-от <code>fetch</code>, уже вміють це робити, а для власних функцій перевірку пишете ви. Зазвичай функція приймає необов'язковий параметр <code>signal?: AbortSignal</code> і на кожному кроці його перевіряє. Є зручний метод <code>signal.throwIfAborted()</code>: він кидає причину, якщо сигнал уже спрацював.",
      "Коли сигнал спрацював, операція зазвичай відхиляє свій проміс. Стандартна причина це <code>signal.reason</code>, що за замовчуванням є винятком з ім'ям <code>AbortError</code>. Скасування, таким чином, виглядає як звичайна помилка, яку ловлять через <code>try/catch</code>. Корисно відрізняти її від справжніх збоїв: перевіряйте <code>error.name</code> і не показуйте користувачеві аварійне повідомлення про те, що він сам запросив.",
      "Підписку на сигнал додають через <code>signal.addEventListener('abort', handler, { once: true })</code>. Це потрібно, коли операція чекає, наприклад у таймері, і має зупинитися негайно, а не лише на наступній перевірці. Не забувайте прибирати таймери й обробники, коли операція завершилась: інакше вони «течуть» і тримають пам'ять та програму живою довше, ніж треба.",
      "Є ще дві зручні готові функції. <code>AbortSignal.timeout(ms)</code> створює сигнал, що спрацює сам через заданий час, а <code>AbortSignal.any([a, b])</code> об'єднує кілька сигналів в один. Так робиться тайм-аут для запиту без ручних таймерів. Ці методи новіші, тож перевіряйте підтримку у своєму середовищі, а в навчальних прикладах ми лишаємося при <code>AbortController</code>, який є всюди.",
      "Скасування стосується не лише мережі. Ним зупиняють довгі обчислення по частинах, повторні спроби, паралельні задачі в пулі, читання потоків. Хороший API довгої операції завжди приймає <code>AbortSignal</code> у параметрах: тоді її можна зупинити, не чекаючи кінця. У завданні ви самі зробите скасовувану затримку, і на ній видно всю схему цілком.",
    ],
    code: [
      raw`const controller = new AbortController();
console.log("до abort:", controller.signal.aborted);
controller.abort();
console.log("після abort:", controller.signal.aborted);
controller.abort();
console.log("повторний abort нічого не змінює:", controller.signal.aborted);
`,
      raw`function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("скасовано до початку"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new Error("скасовано"));
      },
      { once: true },
    );
  });
}

async function main(): Promise<void> {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 5);
  try {
    await sleep(1000, controller.signal);
    console.log("відпрацював повністю");
  } catch (error) {
    console.log("зупинено:", error instanceof Error ? error.message : error);
  }
}

main();
`,
      raw`const controller = new AbortController();

async function processAll(items: number[], signal: AbortSignal): Promise<number[]> {
  const done: number[] = [];
  for (const item of items) {
    signal.throwIfAborted();
    await Promise.resolve();
    done.push(item * 10);
    if (item === 2) {
      controller.abort();
    }
  }
  return done;
}

async function main(): Promise<void> {
  try {
    await processAll([1, 2, 3, 4], controller.signal);
  } catch (error) {
    console.log("перервано, ім'я помилки:", error instanceof Error ? error.name : error);
  }
}

main();
`,
      raw`// не компілюється: функція чекає AbortSignal, а передали сам контролер
function run(signal: AbortSignal): void {
  console.log(signal.aborted);
}

const controller = new AbortController();
run(controller);
`,
      raw`const controller = new AbortController();

controller.signal.addEventListener("abort", () => {
  console.log("подія abort, причина:", controller.signal.reason);
});

controller.abort("користувач натиснув «Скасувати»");
`,
    ],
    note: "Скасування це співпраця: ви передаєте <code>signal</code>, а операція перевіряє його або слухає подію <code>abort</code>. Передавайте <code>controller.signal</code>, а не сам контролер, і прибирайте таймери після скасування.",
    work: "У пошуку з підказками старий запит скасовують, коли користувач друкує далі. Те саме роблять при закритті сторінки, зміні маршруту й тайм-ауті мережевого запиту, щоб не витрачати ресурси на непотрібну роботу.",
    tasks: [
      "Яка різниця між <code>AbortController</code> і <code>AbortSignal</code> і що саме передають у функцію?",
      "Чому недостатньо просто викликати <code>abort()</code>, якщо сама операція не перевіряє сигнал?",
    ],
  },
  {
    t: "Асинхронні ітератори й for await",
    ch: "Асинхронність",
    easy: "Звичайний цикл бере елементи зі списку, що вже лежить на столі. Асинхронний ітератор схожий на стрічку конвеєра: елементи приїжджають по одному, і цикл <code>for await</code> чекає на кожен із них.",
    p: [
      "Іноді дані не лежать у масиві, а надходять поступово: сторінки відповіді сервера, рядки великого файлу, повідомлення з каналу. Завантажувати все одразу дорого або взагалі неможливо. Для таких випадків є <b>асинхронні ітератори</b>: джерело, з якого значення добуваються по одному, і кожне добування може бути асинхронним.",
      "Протокол схожий на звичайний ітератор, але з промісами. Об'єкт, що має метод <code>[Symbol.asyncIterator]()</code>, повертає ітератор, чий метод <code>next()</code> повертає <code>Promise&lt;{ value, done }&gt;</code>. Ознакою кінця є <code>done: true</code>. У типах це <code>AsyncIterable&lt;T&gt;</code> (джерело) і <code>AsyncIterator&lt;T&gt;</code> (сам ітератор). Вручну такі об'єкти пишуть рідко.",
      "Читати такі джерела зручно циклом <code>for await (const item of source) { ... }</code>. На кожному кроці цикл чекає, поки наступне значення буде готове, і лише тоді виконує тіло. Цикл <code>for await</code> можна використовувати тільки всередині <code>async</code>-функції. Він працює і зі звичайними ітерованими наборами, але тоді кожен елемент розпаковується через <code>await</code>.",
      "Найпростіший спосіб створити асинхронний ітератор це <b>асинхронний генератор</b>: <code>async function* name()</code>. Усередині можна й чекати (<code>await</code>), й віддавати значення оператором <code>yield</code>. Тип його результату <code>AsyncGenerator&lt;T&gt;</code>, а в типі параметра зазвичай пишуть ширший <code>AsyncIterable&lt;T&gt;</code>, щоб функція приймала будь-яке асинхронне джерело.",
      "Приклад із життя: пагінація. API віддає дані сторінками, кожна наступна запитується за допомогою курсора. Асинхронний генератор ховає це за простим інтерфейсом: споживач бачить лише потік записів і не знає про сторінки. Він пише <code>for await (const record of allRecords())</code>, а вся логіка запитів лишається всередині генератора. Сторінки завантажуються <i>лінніво</i>, лише коли цикл просить наступний елемент.",
      "Лінивість дає ще одну перевагу: можна зупинитися раніше. Якщо у <code>for await</code> виконати <code>break</code>, цикл викличе в ітератора метод <code>return()</code>, і генератор виконає свій блок <code>finally</code>, закривши ресурси. Тому в генераторах, що тримають з'єднання чи файли, прибирання зручно розміщувати саме у <code>finally</code>: воно спрацює і при нормальному завершенні, і при <code>break</code>, і при помилці.",
      "Остерігайтеся помилок. Помилка, кинута в генераторі, потрапляє в цикл <code>for await</code> і ловиться звичайним <code>try/catch</code> навколо циклу. Не плутайте <code>for await</code> із паралельністю: елементи обробляються <i>по черзі</i>, а наступний не починає надходити, доки не завершилось тіло циклу. Для паралельної обробки є <code>Promise.all</code> та пули задач, про які йтиметься далі.",
    ],
    code: [
      raw`function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function* countTo(limit: number): AsyncGenerator<number> {
  for (let n = 1; n <= limit; n++) {
    await pause(5);
    yield n;
  }
}

async function main(): Promise<void> {
  for await (const n of countTo(3)) {
    console.log("отримано", n);
  }
  console.log("потік завершено");
}

main();
`,
      raw`interface Page {
  items: string[];
  next: number | null;
}

const pages: Page[] = [
  { items: ["a", "b"], next: 1 },
  { items: ["c"], next: 2 },
  { items: ["d", "e"], next: null },
];

function fetchPage(index: number): Promise<Page> {
  return new Promise((resolve) => setTimeout(() => resolve(pages[index]), 1));
}

async function* allItems(): AsyncGenerator<string> {
  let cursor: number | null = 0;
  while (cursor !== null) {
    const page: Page = await fetchPage(cursor);
    console.log("завантажено сторінку", cursor);
    yield* page.items;
    cursor = page.next;
  }
}

async function main(): Promise<void> {
  for await (const item of allItems()) {
    console.log("елемент", item);
  }
}

main();
`,
      raw`async function* resource(): AsyncGenerator<number> {
  try {
    for (let n = 1; n <= 5; n++) {
      yield n;
    }
  } finally {
    console.log("ресурс закрито");
  }
}

async function main(): Promise<void> {
  for await (const n of resource()) {
    console.log("елемент", n);
    if (n === 2) {
      break;
    }
  }
  console.log("вийшли з циклу");
}

main();
`,
      raw`async function* risky(): AsyncGenerator<number> {
  yield 1;
  throw new Error("джерело зламалось");
}

async function main(): Promise<void> {
  try {
    for await (const n of risky()) {
      console.log("значення", n);
    }
  } catch (error) {
    console.log("зловили:", error instanceof Error ? error.message : error);
  }
}

main();
`,
      raw`// не компілюється: for await дозволений лише всередині async-функцій
async function* numbers(): AsyncGenerator<number> {
  yield 1;
}

function main(): void {
  for await (const n of numbers()) {
    console.log(n);
  }
}

main();
`,
    ],
    note: "<code>for await</code> чекає на кожен елемент і працює лише в <code>async</code>-функціях. Асинхронний генератор <code>async function*</code> віддає значення через <code>yield</code> і лінивий: наступний елемент готується, коли цикл його просить.",
    work: "Потоки записів із бази, сторінки відповіді API, рядки великих файлів і повідомлення з каналів читають саме асинхронними ітераторами: програма обробляє дані по мірі надходження й не тримає весь набір у пам'яті.",
    tasks: [
      "Чим <code>for await...of</code> відрізняється від звичайного <code>for...of</code> і де його можна використовувати?",
      "Що станеться з блоком <code>finally</code> в асинхронному генераторі, якщо цикл <code>for await</code> перервати через <code>break</code>?",
    ],
  },
  {
    t: "Генератори: function* і їхні типи",
    ch: "Асинхронність",
    easy: "Генератор це функція з паузами: вона віддає значення по одному й засинає до наступного запиту. Тому нескінченний список чисел, який не займає пам'яті, цілком можливий.",
    p: [
      "<b>Генератор</b> це функція, яка може призупинятися й відновлюватися. Оголошується <code>function* name()</code>, а замість <code>return</code> для проміжних значень використовує <code>yield</code>. При виклику вона не виконується, а повертає об'єкт-генератор. Тіло починає працювати, коли ви просите наступне значення, і зупиняється на найближчому <code>yield</code>.",
      "Тип результату <code>Generator&lt;T, TReturn, TNext&gt;</code> має три параметри: що віддає <code>yield</code> (<code>T</code>), що повертає остаточний <code>return</code> (<code>TReturn</code>) і що можна передати в генератор назад методом <code>next(value)</code> (<code>TNext</code>). У більшості випадків достатньо першого: <code>Generator&lt;number&gt;</code>. Для параметрів функцій частіше пишуть <code>Iterable&lt;number&gt;</code>, бо генератор сумісний із циклом <code>for...of</code>.",
      "Генератор є <b>ітератором</b> і ітерованим водночас, тож його споживають усіма звичними способами: <code>for...of</code>, оператором розгортання <code>[...gen()]</code>, <code>Array.from</code>, деструктуризацією. Але генератор <b>одноразовий</b>: після вичерпання його не можна пройти вдруге, треба викликати функцію ще раз і отримати новий генератор.",
      "Головна перевага це <b>лінь</b>. Значення обчислюються лише тоді, коли їх просять, тому генератор може описувати навіть нескінченну послідовність: числа Фібоначчі, ідентифікатори, необмежений потік подій. Споживач сам вирішує, скільки взяти: цикл можна перервати через <code>break</code>. Пам'ять при цьому не росте, бо в кожен момент існує лише поточний стан генератора. Порівняйте з масивом: щоб отримати «перші десять чисел Фібоначчі», вам довелося б заздалегідь вирішити, скільки їх обчислювати, а генератор це рішення відкладає до споживача.",
      "Оператор <code>yield*</code> делегує роботу іншому ітерованому: <code>yield* other()</code> віддає всі його значення по черзі. Завдяки цьому складні послідовності будують із простих і рекурсивно обходять дерева. Результат <code>return</code> вкладеного генератора стає значенням самого виразу <code>yield*</code>, тож його можна зберегти в змінну й використати далі.",
      "Метод <code>next(value)</code> дозволяє передавати дані й <i>всередину</i>: значення з'являється як результат виразу <code>yield</code> у генераторі. Так будують двосторонні протоколи, наприклад накопичувач, що додає прийняті числа. Метод <code>return()</code> достроково завершує генератор (виконуючи <code>finally</code>), а <code>throw()</code> кидає помилку всередині. У щоденному коді їх використовують рідко, але вони пояснюють, як працюють <code>break</code> і обробка помилок у циклах.",
      "Практичні поради. Не робіть генератор там, де вистачить масиву: для кількох елементів він надлишковий. Не забувайте, що генератор не починає працювати, доки його не запитали: помилка в тілі проявиться лише при першому <code>next()</code>. І пам'ятайте про одноразовість: якщо дані потрібно пройти двічі, збережіть їх у масив або створіть генератор заново.",
    ],
    code: [
      raw`function* range(from: number, to: number): Generator<number> {
  for (let n = from; n <= to; n++) {
    console.log("віддаю", n);
    yield n;
  }
}

const numbers = range(1, 3);
console.log("генератор створено, нічого ще не виконано");
for (const n of numbers) {
  console.log("отримано", n);
}
console.log("повторний прохід:", [...numbers].length);
`,
      raw`function* fibonacci(): Generator<number> {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function* take<T>(source: Iterable<T>, limit: number): Generator<T> {
  let count = 0;
  for (const item of source) {
    if (count >= limit) {
      return;
    }
    yield item;
    count++;
  }
}

console.log([...take(fibonacci(), 10)].join(" "));
`,
      raw`function* inner(): Generator<string, number> {
  yield "a";
  yield "b";
  return 2;
}

function* outer(): Generator<string> {
  const count = yield* inner();
  yield "елементів у inner: " + count;
}

console.log([...outer()]);
`,
      raw`function* accumulator(): Generator<number, void, number> {
  let total = 0;
  while (true) {
    const value: number = yield total;
    total += value;
  }
}

const acc = accumulator();
acc.next(0);
console.log(acc.next(5).value);
console.log(acc.next(10).value);
`,
      raw`// не компілюється: генератор оголошено як Generator<number>, а віддає рядок
function* words(): Generator<number> {
  yield "привіт";
}

console.log([...words()]);
`,
    ],
    note: "Генератор віддає значення через <code>yield</code> і виконується ліниво, лише коли його просять. Він одноразовий: вдруге його не пройти. <code>yield*</code> делегує роботу іншому ітерованому, а <code>Generator&lt;T&gt;</code> описує тип значень.",
    work: "Генератори використовують для необмежених послідовностей, лінивої обробки великих наборів, обходу дерев і побудови власних ітерованих колекцій. Вони ж лежать в основі асинхронних генераторів і потокової обробки даних, тому вміти читати <code>function*</code> корисно навіть тоді, коли власні генератори ви пишете нечасто.",
    tasks: [
      "Чому генератор можна використати лише один раз і що робити, якщо дані потрібні двічі?",
      "Що означає значення виразу <code>yield*</code> і звідки воно береться?",
    ],
  },
  {
    t: "Типізована подієва шина",
    ch: "Асинхронність",
    easy: "Подієва шина це дошка оголошень: хтось вішає повідомлення з назвою події, а ті, хто підписався на цю назву, його отримують. Типи гарантують, що до кожної назви прикріплено правильні дані.",
    p: [
      "<b>Подієва шина</b> (event bus) це спосіб зв'язати частини програми, які не знають одна про одну. Одна частина <i>публікує</i> подію, наприклад «користувача створено», а інші <i>підписані</i> на неї й реагують. Видавець не знає, скільки підписників і що вони зроблять. Це послаблює зв'язки між модулями й полегшує розширення програми.",
      "У простій реалізації шина зберігає відображення «назва події → список обробників». Метод <code>on(name, handler)</code> додає обробник, <code>emit(name, data)</code> викликає всі обробники цієї назви, а відписка його видаляє. Без типів тут є небезпека: можна випадково опублікувати подію з неправильними даними або підписатися з обробником, що очікує інші поля.",
      "Типізація розв'язує це одним словником: <b>мапою подій</b>. Ви описуєте інтерфейс, де ключ це назва події, а значення це тип даних: <code>{ login: { userName: string }; logout: undefined }</code>. Шина стає узагальненою: <code>class EventBus&lt;E extends object&gt;</code>, а методи приймають <code>K extends keyof E</code>. Тоді <code>emit('login', ...)</code> вимагає саме <code>{ userName: string }</code>, а неіснуючу назву компілятор відхилить.",
      "Тип обробника записують як <code>(data: E[K]) =&gt; void</code>. Це індексований доступ, який ви знаєте з розділу про generics, тож параметр обробника автоматично отримує правильний тип для обраної події, а підказки редактора працюють без жодних приведень. Для події без даних зручно ставити <code>undefined</code> як тип даних.",
      "Не забувайте про відписку. Метод <code>on</code> зручно змушувати повертати функцію відписки: <code>const off = bus.on('login', handler); off();</code>. Без відписки обробники накопичуються, об'єкти не збираються збирачем сміття, а подія викликає застарілі обробники. Це відомий витік пам'яті, особливо в довгоживучих застосунках, де підписники з'являються й зникають.",
      "Подумайте й про порядок та помилки. Обробники викликаються в порядку підписки. Якщо один кине помилку, решта не виконається, тож шина часто обгортає виклик у <code>try/catch</code>. Ще корисно робити <b>копію</b> списку обробників перед викликом: якщо обробник відпишеться під час виклику, цикл по живому масиву пропустить сусіда, і ви отримаєте дуже підступну помилку.",
      "Шина зручна, але не панацея: у великій системі складно відстежити, хто реагує на подію, бо зв'язок неявний. Використовуйте її для справді незалежних сповіщень (журнал, аналітика, оновлення інтерфейсу), а для основної логіки віддавайте перевагу явним викликам функцій. Типізована мапа подій принаймні зберігає документацію про всі можливі події в одному місці, і новий розробник бачить повний перелік сигналів, які можуть виникнути в програмі.",
    ],
    code: [
      raw`type Handler<T> = (data: T) => void;

class EventBus<E extends object> {
  private handlers: { [K in keyof E]?: Handler<E[K]>[] } = {};

  on<K extends keyof E>(name: K, handler: Handler<E[K]>): () => void {
    const list = this.handlers[name] ?? [];
    list.push(handler);
    this.handlers[name] = list;
    return () => {
      this.handlers[name] = (this.handlers[name] ?? []).filter((h) => h !== handler);
    };
  }

  emit<K extends keyof E>(name: K, data: E[K]): void {
    for (const handler of [...(this.handlers[name] ?? [])]) {
      handler(data);
    }
  }
}

interface AppEvents {
  login: { userName: string };
  logout: undefined;
}

const bus = new EventBus<AppEvents>();
const off = bus.on("login", (data) => console.log("вхід:", data.userName));
bus.on("logout", () => console.log("вихід"));

bus.emit("login", { userName: "Олена" });
bus.emit("logout", undefined);
off();
bus.emit("login", { userName: "Ігор" });
console.log("після відписки Ігоря не видно");
`,
      raw`// не компілюється: неправильна форма даних і неіснуюча назва події
declare class EventBus<E extends object> {
  on<K extends keyof E>(name: K, handler: (data: E[K]) => void): () => void;
  emit<K extends keyof E>(name: K, data: E[K]): void;
}

interface AppEvents {
  login: { userName: string };
  logout: undefined;
}

declare const bus: EventBus<AppEvents>;
bus.emit("login", { name: "Олена" });
bus.emit("logn", { userName: "Олена" });
`,
      raw`type Listener = (payload: string) => void;

const listeners: Listener[] = [];

function publish(payload: string): void {
  for (const listener of [...listeners]) {
    try {
      listener(payload);
    } catch (error) {
      console.log("обробник зламався:", error instanceof Error ? error.message : error);
    }
  }
}

listeners.push(() => {
  throw new Error("перший обробник");
});
listeners.push((text) => console.log("другий отримав:", text));

publish("привіт");
`,
      raw`const handlers: Array<() => void> = [];

function once(): void {
  console.log("одноразовий");
  handlers.splice(handlers.indexOf(once), 1);
}

function fill(): void {
  handlers.length = 0;
  handlers.push(once, () => console.log("другий"), () => console.log("третій"));
}

fill();
console.log("виклик по живому масиву (другий пропущено!):");
for (const handler of handlers) {
  handler();
}

fill();
console.log("виклик по копії:");
for (const handler of [...handlers]) {
  handler();
}
`,
    ],
    note: "Мапа подій <code>{ назва: тип даних }</code> разом із <code>K extends keyof E</code> і <code>E[K]</code> робить публікацію й підписку типобезпечними. Повертайте з <code>on</code> функцію відписки й викликайте обробники по копії списку.",
    work: "Подієві шини зустрічаються в інтерфейсах, системах плагінів, журналах та аналітиці. Типізована мапа подій перетворює їх на надійні контракти: компілятор перевіряє і назви, і форму даних на обох сторонах, у видавця та в підписника.",
    tasks: [
      "Яку роль у типізованій шині відіграють <code>keyof E</code> та <code>E[K]</code>?",
      "Чому обробники подій краще викликати по копії списку, а не по живому масиву?",
    ],
  },
  {
    t: "Обмеження паралелізму: пул задач",
    ch: "Асинхронність",
    adv: true,
    easy: "Уявіть касу з трьох віконець і чергу зі ста людей: усіх одразу не обслужити, тож віконця працюють паралельно, а черга чекає. Пул задач робить те саме з асинхронними справами.",
    p: [
      "Вираз <code>Promise.all(items.map(load))</code> запускає <i>всі</i> задачі одночасно. Для десяти елементів це добре, для десяти тисяч це сотні відкритих з'єднань, вичерпані ліміти, відмови сервера. Потрібен спосіб запускати не більше N задач водночас, а решту тримати в черзі. Це називають <b>обмеженням паралелізму</b>, а компонент, що його забезпечує, пулом задач.",
      "Ідея пулу проста: запускаємо N «робітників». Кожен у циклі бере наступну задачу зі спільного списку, виконує її й береться за наступну, доки задачі не закінчаться. Коли всі робітники завершились, робота зроблена. Паралелізм не перевищує N, і при цьому ніхто не простоює, поки є задачі, бо звільнений робітник одразу бере нову.",
      "Реалізація вміщується в кілька рядків. Спільний лічильник <code>next</code> вказує на наступну задачу. Робітник це асинхронна функція з циклом <code>while</code>: вона бере індекс, збільшує лічильник, виконує задачу й записує результат за цим же індексом. Оскільки JavaScript виконується в одному потоці, між читанням і збільшенням лічильника ніхто не втрутиться, тож гонки тут немає.",
      "Результати зберігають <b>за індексом задачі</b>, а не за порядком завершення, щоб масив результатів відповідав вхідному порядку, як у <code>Promise.all</code>. Типи при цьому природно узагальнюються: <code>runPool&lt;T, R&gt;(items: T[], limit: number, worker: (item: T) =&gt; Promise&lt;R&gt;): Promise&lt;R[]&gt;</code>. Компілятор виводить <code>R</code> із функції-робітника, і результат має точний тип.",
      "Що робити з помилками? Найпростіше: перша помилка відхиляє результат усього пулу (поведінка, схожа на <code>Promise.all</code>), а решта робітників доробляють поточні задачі. Якщо потрібен звіт про всі задачі, обробляйте помилку всередині робітника й записуйте її як частину результату. Тоді одна невдача не зупиняє інших, і ви отримуєте повну картину.",
      "Як вибрати розмір пулу? Він залежить від ресурсу: для мережевих запитів зазвичай 4–10, для операцій із диском менше, для обчислень залежить від кількості ядер. Починайте з малого й вимірюйте. Не передавайте <code>limit</code>, що дорівнює нулю: жоден робітник не стартує, і результат лишиться порожнім, тож таку помилку краще ловити перевіркою на вході.",
      "Перевіряти пул у тестах можна без часу: рахуйте, скільки задач виконується <i>одночасно</i>. Збільшуйте лічильник на старті задачі, зменшуйте на завершенні й запам'ятовуйте максимум. Якщо максимум не перевищив ліміт, пул працює правильно. Це надійніше, ніж міряти мілісекунди, і саме так перевірятиметься завдання до цього уроку.",
    ],
    code: [
      raw`async function runPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function runner(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index]);
    }
  }

  const runners: Promise<void>[] = [];
  for (let i = 0; i < Math.min(limit, items.length); i++) {
    runners.push(runner());
  }
  await Promise.all(runners);
  return results;
}

let active = 0;
let maxActive = 0;

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const squares = await runPool([1, 2, 3, 4, 5, 6], 2, async (n) => {
    active++;
    maxActive = Math.max(maxActive, active);
    await pause(5);
    active--;
    return n * n;
  });
  console.log(squares.join(","), "максимум одночасно:", maxActive);
}

main();
`,
      raw`let active = 0;
let maxActive = 0;

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function task(n: number): Promise<number> {
  active++;
  maxActive = Math.max(maxActive, active);
  await pause(5);
  active--;
  return n;
}

async function main(): Promise<void> {
  await Promise.all([1, 2, 3, 4, 5, 6].map(task));
  console.log("без обмеження одночасно працювало:", maxActive);
}

main();
`,
      raw`async function runPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function runner(): Promise<void> {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index]);
    }
  }
  const runners: Promise<void>[] = [];
  for (let i = 0; i < Math.min(limit, items.length); i++) {
    runners.push(runner());
  }
  await Promise.all(runners);
  return results;
}

async function main(): Promise<void> {
  const outcomes = await runPool([1, 2, 3, 4], 2, async (n) => {
    try {
      if (n % 2 === 0) {
        throw new Error("збій " + n);
      }
      return "ok " + n;
    } catch (error) {
      return error instanceof Error ? error.message : "невідомо";
    }
  });
  console.log(outcomes);
}

main();
`,
      raw`// не компілюється: worker очікує число, а елементи списку рядки
declare function runPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]>;

runPool(["a", "b"], 2, async (n: number) => n * 2);
`,
    ],
    note: "Пул запускає не більше N робітників, і кожен бере наступну задачу з черги. Результати пишіть за індексом задачі, помилки обробляйте в робітнику, а ліміт перевіряйте лічильником одночасних задач, а не годинником.",
    work: "Масове завантаження файлів, обробка тисяч записів, обхід сайту й імпорт даних без пулу швидко впираються в ліміти серверів. Обмежений паралелізм дає швидкість без перевантаження чужих сервісів і без відмов через перевищення лімітів, які встановлює провайдер.",
    tasks: [
      "Чому <code>Promise.all(items.map(load))</code> не підходить для списку з десяти тисяч елементів?",
      "Як у пулі зберегти порядок результатів, коли задачі завершуються в довільному порядку?",
    ],
  },
  {
    t: "Черга задач і порядок виконання",
    ch: "Асинхронність",
    adv: true,
    easy: "Черга задач це черга в поліклініці: приймає по одному, у порядку надходження, і не плутає порядок, навіть якщо нові відвідувачі приходять, поки лікар зайнятий.",
    p: [
      "Іноді потрібно гарантувати, що асинхронні дії виконуються <b>строго по черзі</b>, навіть коли їх запускають із різних місць програми: записи у файл, послідовні оновлення стану, виклики API, що не терплять перекриття. Без черги дві одночасні операції можуть перемішатися й зіпсувати дані. Для цього будують <b>чергу задач</b> (task queue): кожна нова задача чекає завершення попередньої.",
      "Найкоротша реалізація використовує ланцюжок промісів. Черга зберігає «хвіст»: проміс останньої доданої задачі. Нова задача підчіплюється до хвоста через <code>tail.then(task)</code>, а її результат стає новим хвостом. Тож задачі автоматично виконуються одна за одною. Метод <code>add&lt;T&gt;(task: () =&gt; Promise&lt;T&gt;): Promise&lt;T&gt;</code> повертає проміс із результатом саме цієї задачі.",
      "Тут є тонкий момент: якщо задача відхилилась, ланцюжок теж «зламається» і наступні задачі не запустяться. Тому хвіст треба <b>захистити</b>: нова задача підчіплюється до версії хвоста, що ніколи не відхиляється (<code>result.catch(() =&gt; undefined)</code>), а помилку віддають лише тому, хто додав задачу. Так збій однієї задачі не зупиняє всю чергу.",
      "Зверніть увагу, що в чергу додають <i>функції</i>, а не проміси: <code>() =&gt; Promise&lt;T&gt;</code>. Проміс починає працювати в момент створення, тож якщо передати вже створений проміс, він стартує негайно, і ні про яку чергу мова не йде. Функція ж викликається лише тоді, коли настала її черга. Це ключова ідея, яку легко пропустити, і компілятор допомагає, відхиляючи готовий проміс там, де чекають функцію.",
      "Чергу можна розширити: лічильник задач (<code>pending</code>), метод <code>idle()</code>, що чекає, поки черга спорожніє, пріоритети або ліміт довжини. Пул із попереднього уроку це по суті черга з кількома робітниками: коли ліміт дорівнює одиниці, він працює як послідовна черга, а коли більше, дозволяє часткову паралельність. Вибір залежить від того, чи допускає ваша дія перекриття.",
      "Порядок виконання в асинхронному коді підпорядковується правилам циклу подій. Задачі в черзі виконуються в порядку додавання, але <i>між</i> ними можуть виконатись інші мікрозадачі та колбеки таймерів. Тому не покладайтеся на те, що між двома задачами черги «нічого не станеться»: гарантується лише відносний порядок самих задач, а не відсутність чужої роботи між ними.",
      "Для перевірки черги не потрібен годинник: дозвольте задачам мати різну тривалість (перша довга, друга коротка) і переконайтеся, що вони все одно завершуються в порядку додавання. Якщо порядок збігається з порядком додавання попри різні затримки, черга працює правильно. Саме таку перевірку ми використовуємо в прикладах і в завданні до цього уроку.",
    ],
    code: [
      raw`class TaskQueue {
  private tail: Promise<unknown> = Promise.resolve();

  add<T>(task: () => Promise<T>): Promise<T> {
    const result = this.tail.then(task);
    this.tail = result.catch(() => undefined);
    return result;
  }
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function job(name: string, ms: number): Promise<string> {
  console.log("початок", name);
  await pause(ms);
  console.log("кінець", name);
  return name;
}

async function main(): Promise<void> {
  const queue = new TaskQueue();
  const all = await Promise.all([
    queue.add(() => job("A", 20)),
    queue.add(() => job("B", 5)),
    queue.add(() => job("C", 10)),
  ]);
  console.log(all.join(""));
}

main();
`,
      raw`class TaskQueue {
  private tail: Promise<unknown> = Promise.resolve();

  add<T>(task: () => Promise<T>): Promise<T> {
    const result = this.tail.then(task);
    this.tail = result.catch(() => undefined);
    return result;
  }
}

async function main(): Promise<void> {
  const queue = new TaskQueue();
  const first = queue.add(async () => {
    throw new Error("перша зламалась");
  });
  const second = queue.add(async () => "друга працює");

  try {
    await first;
  } catch (error) {
    console.log("перша:", error instanceof Error ? error.message : error);
  }
  console.log("друга:", await second);
}

main();
`,
      raw`function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function job(name: string, ms: number): Promise<string> {
  console.log("початок", name);
  await pause(ms);
  console.log("кінець", name);
  return name;
}

async function main(): Promise<void> {
  // проміси створено одразу, тому обидві задачі вже стартували: черги тут немає
  const promises = [job("A", 20), job("B", 5)];
  await Promise.all(promises);
}

main();
`,
      raw`// не компілюється: add чекає функцію, що створює проміс, а не готовий проміс
declare class TaskQueue {
  add<T>(task: () => Promise<T>): Promise<T>;
}

declare const queue: TaskQueue;
queue.add(Promise.resolve(1));
`,
    ],
    note: "Черга ланцюжить задачі через <code>then</code>, а її хвіст захищають від відхилення, щоб збій однієї задачі не зупиняв решту. У чергу додають функції, що створюють проміс, а не готові проміси, бо проміс стартує одразу.",
    work: "Чергу задач використовують для послідовних записів у файл чи базу, відправки повідомлень у правильному порядку й обробки подій, що не повинні перекриватися. Вона робить порядок виконання явним і передбачуваним.",
    tasks: [
      "Чому в чергу задач передають функцію <code>() =&gt; Promise&lt;T&gt;</code>, а не готовий проміс?",
      "Навіщо хвіст черги підчіплюють через <code>catch</code>, і що було б без цього?",
    ],
  },
  {
    t: "Повтори й backoff: retry",
    ch: "Асинхронність",
    adv: true,
    easy: "Якщо двері зачинені, не варто стукати щосекунди: краще постукати, зачекати трохи, постукати знову й чекати довше. Повтор із наростаючою паузою дає тимчасовим збоям час минути.",
    p: [
      "Багато збоїв у мережі <b>тимчасові</b>: сервер перевантажений, з'єднання обірвалось, ліміт запитів вичерпано на мить. Повторна спроба через кілька мілісекунд часто проходить. Тому в надійних клієнтах є механізм <b>повторів</b> (retry): виконати дію, а в разі помилки спробувати знову кілька разів, перш ніж здатися.",
      "Але повторювати треба обережно. По-перше, повторюють лише <i>тимчасові</i> помилки (мережа, коди 503 і 429), а не логічні (неправильний запит, 404). Повтор запиту, який ніколи не вдасться, лише марнує ресурси й час користувача, який чекає на відповідь. По-друге, повторювана дія має бути <b>ідемпотентною</b>: повторний виклик не повинен давати побічних ефектів двічі, як-от подвійне списання коштів.",
      "Третє правило: не повторювати негайно. Якщо тисяча клієнтів одночасно повторюють запит до сервера, що тільки-но впав, вони добивають його. Тому між спробами роблять паузу, що зростає: <b>експоненційний backoff</b>. Затримка подвоюється: 100, 200, 400, 800 мс за формулою <code>base * 2 ** attempt</code>. Так сервер отримує час відновитись, а клієнт не тисне надмірно.",
      "Щоб клієнти не синхронізувались і не вдаряли хвилею в один момент, до паузи додають <b>джитер</b>, тобто випадковий розкид: наприклад, множать затримку на число між 0,5 і 1. У навчальному коді ми обходимося без випадковості, щоб вивід був передбачуваним, і передаємо функцію паузи параметром, а справжню випадковість підставляємо лише в реальному застосунку.",
      "Сигнатура функції повтору така: <code>retry&lt;T&gt;(action: () =&gt; Promise&lt;T&gt;, options): Promise&lt;T&gt;</code>. Вона викликає <code>action</code>, і якщо той відхиляється, чекає й викликає знову, до ліміту спроб. Після останньої невдачі кидає останню помилку, щоб той, хто викликав, міг її обробити, а не отримав мовчазний провал. Як і в черзі задач, <code>action</code> це <i>функція</i>, а не проміс, інакше повторювати було б нічого: проміс уже виконався або відхилився.",
      "Корисні параметри: <code>attempts</code> (скільки спроб), <code>baseDelay</code>, <code>shouldRetry(error)</code> (чи варто повторювати цю помилку) та <code>sleep</code> для підміни паузи в тестах. Хороший дизайн дозволяє тестувати повтори без реального очікування: підставляєте «швидкий» <code>sleep</code>, що лише записує, скільки чекали, і перевіряєте послідовність пауз.",
      "Не забувайте про скасування й загальний тайм-аут: повторювати вічно не можна. Додайте <code>AbortSignal</code>, щоб користувач міг зупинити спроби, і максимальну сумарну тривалість. У бібліотеках, таких як HTTP-клієнти й SDK хмарних сервісів, повтори зазвичай уже вбудовані, тож перед тим, як писати власні, перевірте, чи вони там є й як налаштовані.",
    ],
    code: [
      raw`interface RetryOptions {
  attempts: number;
  baseDelay: number;
  sleep: (ms: number) => Promise<void>;
}

async function retry<T>(action: () => Promise<T>, options: RetryOptions): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < options.attempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (attempt < options.attempts - 1) {
        await options.sleep(options.baseDelay * 2 ** attempt);
      }
    }
  }
  throw lastError;
}

const waited: number[] = [];
let calls = 0;

async function flaky(): Promise<string> {
  calls++;
  if (calls < 3) {
    throw new Error("збій " + calls);
  }
  return "успіх на спробі " + calls;
}

async function main(): Promise<void> {
  const result = await retry(flaky, {
    attempts: 5,
    baseDelay: 100,
    sleep: async (ms) => {
      waited.push(ms);
    },
  });
  console.log(result);
  console.log("паузи:", waited.join(", "));
}

main();
`,
      raw`interface RetryOptions {
  attempts: number;
  baseDelay: number;
  sleep: (ms: number) => Promise<void>;
  shouldRetry?: (error: unknown) => boolean;
}

async function retry<T>(action: () => Promise<T>, options: RetryOptions): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < options.attempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (options.shouldRetry && !options.shouldRetry(error)) {
        throw error;
      }
      if (attempt < options.attempts - 1) {
        await options.sleep(options.baseDelay * 2 ** attempt);
      }
    }
  }
  throw lastError;
}

const waited: number[] = [];
const sleep = async (ms: number): Promise<void> => {
  waited.push(ms);
};

async function main(): Promise<void> {
  try {
    await retry(async () => Promise.reject(new Error("мережа лежить")), { attempts: 3, baseDelay: 10, sleep });
  } catch (error) {
    console.log("здались:", error instanceof Error ? error.message : error, "| паузи:", waited.join(","));
  }

  waited.length = 0;
  try {
    await retry(async () => Promise.reject(new Error("неправильний запит")), {
      attempts: 3,
      baseDelay: 10,
      sleep,
      shouldRetry: () => false,
    });
  } catch (error) {
    console.log("без повторів:", error instanceof Error ? error.message : error, "| пауз:", waited.length);
  }
}

main();
`,
      raw`function backoff(attempt: number, base: number, max: number): number {
  return Math.min(max, base * 2 ** attempt);
}

const delays = [0, 1, 2, 3, 4, 5].map((attempt) => backoff(attempt, 100, 1000));
console.log(delays.join(" "));
`,
      raw`// не компілюється: retry чекає функцію, що створює проміс, а не готовий проміс
declare function retry<T>(action: () => Promise<T>, attempts: number): Promise<T>;

retry(Promise.resolve("дані"), 3);
`,
    ],
    note: "Повторюйте лише тимчасові помилки й лише ідемпотентні дії. Паузу між спробами збільшуйте (<code>base * 2 ** attempt</code>), а паузу передавайте параметром, щоб тестувати без очікування. Дію передавайте функцією, не готовим промісом.",
    work: "Клієнти API, SDK хмарних сервісів і черги повідомлень повторюють невдалі запити з експоненційною паузою. Так система переживає короткі збої мережі й не добиває перевантажений сервер хвилею одночасних повторів.",
    tasks: [
      "Які помилки варто повторювати, а які ні, і чому дія має бути ідемпотентною?",
      "Навіщо між спробами збільшувати паузу експоненційно, а не повторювати негайно?",
    ],
  },
  {
    t: "Awaited і типи асинхронних функцій",
    ch: "Асинхронність",
    adv: true,
    easy: "<code>Awaited&lt;T&gt;</code> розгортає обгортку з промісів: зі «скриньки в скриньці» дістає те, що лежить на самому дні. Разом із <code>ReturnType</code> це дозволяє вивести тип результату будь-якої асинхронної функції.",
    p: [
      "Ми вже знаємо, що <code>async</code>-функція повертає <code>Promise&lt;T&gt;</code>. Але що робити, коли потрібен тип самого результату, <code>T</code>, без ручного дублювання? Наприклад, функція <code>loadUser</code> повертає <code>Promise&lt;User&gt;</code>, і ви хочете оголосити змінну типу <code>User</code>, не повторюючи опис. Тут допомагає вбудований утилітарний тип <b>Awaited</b>.",
      "<code>Awaited&lt;T&gt;</code> моделює те, що робить <code>await</code>: <code>Awaited&lt;Promise&lt;string&gt;&gt;</code> це <code>string</code>. Він розгортає <i>рекурсивно</i>: <code>Awaited&lt;Promise&lt;Promise&lt;number&gt;&gt;&gt;</code> теж дає <code>number</code>, бо <code>await</code> у JavaScript розкриває вкладені проміси до кінця. Для звичайного значення без промісу <code>Awaited&lt;number&gt;</code> просто <code>number</code>.",
      "Щоб отримати тип результату асинхронної функції, поєднують його з <code>ReturnType</code>: <code>type UserResult = Awaited&lt;ReturnType&lt;typeof loadUser&gt;&gt;</code>. Спершу <code>typeof loadUser</code> дає тип функції, <code>ReturnType</code> дістає її результат <code>Promise&lt;User&gt;</code>, а <code>Awaited</code> знімає обгортку. Так тип автоматично слідує за функцією: змінили повернення, і всі залежні типи оновилися самі.",
      "Особливо корисно це в узагальнених функціях. Тип <code>Promise&lt;Awaited&lt;ReturnType&lt;F&gt;&gt;&gt;</code> описує результат обгортки, що працює з будь-якою асинхронною функцією <code>F</code> і повертає її справжній результат без приведень. Саме так типізується й сам <code>Promise.all</code>: його результат це кортеж, що складається з <code>Awaited</code> кожного елемента.",
      "Зверніть увагу на різницю між «повертає проміс» і «повертає значення». <code>Awaited</code> безпечний для обох випадків: якщо функція синхронна, її результат не зміниться. Це дозволяє писати універсальні утиліти, що однаково працюють із синхронними й асинхронними функціями. До версії TypeScript 4.5, коли <code>Awaited</code> з'явився, доводилося писати власні умовні типи з <code>infer</code>, і результат був менш точним.",
      "Корисне застосування це карта результатів: з об'єкта, де значення це функції (синхронні чи асинхронні), зробити об'єкт їхніх результатів. Відображений тип <code>{ [K in keyof T]: Awaited&lt;ReturnType&lt;T[K]&gt;&gt; }</code> описує такий результат точно. Це спрощує типізацію шару сервісів, API-клієнтів і тестів, де потрібно зібрати відповіді з кількох джерел у один об'єкт.",
      "Обмеження: <code>Awaited</code> розгортає і справжні проміси, і будь-які об'єкти з методом <code>then</code>, але він працює лише з типами й нічого не робить під час виконання. Не зловживайте вкладеними утилітами: якщо тип потрібен у багатьох місцях, дайте йому ім'я через <code>type</code>, щоб підказки редактора й повідомлення про помилки лишалися читабельними.",
    ],
    code: [
      raw`async function loadUser(id: number): Promise<{ id: number; nick: string }> {
  return { id, nick: "user" + id };
}

type UserResult = Awaited<ReturnType<typeof loadUser>>;

async function main(): Promise<void> {
  const user: UserResult = await loadUser(5);
  console.log(user.nick, user.id);
}

main();
`,
      raw`type A = Awaited<Promise<string>>;
type B = Awaited<Promise<Promise<number>>>;
type C = Awaited<boolean>;

const a: A = "рядок";
const b: B = 42;
const c: C = true;

console.log(typeof a, typeof b, typeof c);
`,
      raw`type Services = Record<string, (...args: never[]) => unknown>;
type Results<T extends Services> = { [K in keyof T]: Awaited<ReturnType<T[K]>> };

const services = {
  user: async () => ({ nick: "olena" }),
  count: async () => 3,
  version: () => "1.0",
};

async function runAll<T extends Services>(source: T): Promise<Results<T>> {
  const entries = await Promise.all(
    Object.entries(source).map(async ([key, fn]) => [key, await fn()] as const),
  );
  return Object.fromEntries(entries) as Results<T>;
}

async function main(): Promise<void> {
  const all = await runAll(services);
  console.log(all.user.nick, all.count + 1, all.version.toUpperCase());
}

main();
`,
      raw`// не компілюється: ReturnType дає Promise<number>, а не number
async function getCount(): Promise<number> {
  return 3;
}

type Count = ReturnType<typeof getCount>;

const total: Count = 3;
console.log(total);
`,
    ],
    note: "<code>Awaited&lt;T&gt;</code> робить те, що <code>await</code>: розгортає проміси до кінця. Поєднання <code>Awaited&lt;ReturnType&lt;typeof f&gt;&gt;</code> дає тип результату асинхронної функції без дублювання. Саме <code>ReturnType</code> без <code>Awaited</code> лишає проміс.",
    work: "Типи відповідей сервісів і API-клієнтів виводять із самих функцій, щоб не підтримувати їх вручну двічі. Після зміни повернення функції залежні типи оновлюються автоматично, а компілятор показує всі місця, які треба виправити.",
    tasks: [
      "Який тип дасть <code>Awaited&lt;Promise&lt;Promise&lt;number&gt;&gt;&gt;</code> і чому?",
      "Як отримати тип результату асинхронної функції <code>load</code> без ручного дублювання опису?",
    ],
  },
];
