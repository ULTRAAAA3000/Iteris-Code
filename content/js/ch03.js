export const LESSONS_03 = [
  {
    t: "Масиви: основи",
    ch: "Колекції",
    easy: "Масив — це нумерована полиця, на якій предмети стоять у певному порядку. Номер місця починається з нуля, а довжина полиці завжди відома й може змінюватися, коли ви додаєте або забираєте речі.",
    p: [
      "Масив створюють літералом у квадратних дужках: <code>const colors = [\"червоний\", \"зелений\"];</code>. Елементи можуть бути будь-яких типів, навіть змішаних, хоча на практиці в одному масиві зазвичай лежать однотипні значення. До елемента звертаються за індексом: <code>colors[0]</code> — перший, <code>colors[1]</code> — другий. Нумерація починається з нуля, тож останній елемент має індекс <code>length - 1</code>. Зручніше брати його методом <code>at(-1)</code>, який приймає від'ємні індекси й рахує з кінця. Звернення за неіснуючим індексом не дає помилки, а повертає <code>undefined</code>.",
      "Властивість <code>length</code> показує кількість елементів, і її можна змінювати: присвоєння <code>arr.length = 0</code> швидко очищає масив. Важливо пам'ятати, що масив у JavaScript — це різновид об'єкта: <code>typeof []</code> дає <code>\"object\"</code>, тому для перевірки використовують <code>Array.isArray(x)</code>. Масиви порівнюються за посиланням, тож <code>[1] === [1]</code> хибне. Навіть оголошений через <code>const</code> масив можна змінювати: <code>const</code> забороняє лише переприсвоїти саму змінну.",
      "Найчастіші операції — додавання й видалення на кінцях. <code>push(x)</code> додає в кінець і повертає нову довжину, <code>pop()</code> забирає останній елемент і повертає його. Для початку масиву є <code>unshift(x)</code> і <code>shift()</code>. Вони працюють повільніше, бо змушують зсувати всі інші елементи, тому чергу з мільйонів елементів на <code>shift</code> краще не будувати. Усі чотири методи <b>змінюють</b> сам масив, а не повертають новий; про це розмова піде в наступному уроці.",
      "Для пошуку є <code>includes(x)</code> (чи є значення, повертає булеве), <code>indexOf(x)</code> (позиція першого збігу або <code>-1</code>) і <code>lastIndexOf(x)</code>. Вони порівнюють суворо, тому для об'єктів знайдуть лише той самий екземпляр, а не «схожий». Для пошуку за умовою служать методи <code>find</code> і <code>findIndex</code>, їх розберемо трохи далі. Об'єднати масив в одну строку можна через <code>join(\", \")</code>, а склеїти кілька масивів — через <code>concat</code> або розгортання <code>[...a, ...b]</code>.",
      "Створити масив можна й іншими способами. <code>Array.of(1, 2, 3)</code> і літерал дають однакове. <code>Array.from(\"abc\")</code> перетворює будь-яке ітероване значення на масив, а з другим аргументом працює як <code>map</code>: <code>Array.from({ length: 3 }, (_, i) =&gt; i * 2)</code> дає <code>[0, 2, 4]</code>. Конструктор <code>new Array(3)</code> створює масив із трьох порожніх «дірок», а не з трьох <code>undefined</code>, і методи <code>map</code> чи <code>forEach</code> їх пропускають; щоб заповнити, є <code>fill(0)</code>. Негативна або дробова довжина в конструкторі викликає <code>RangeError</code>.",
      "Масиви можуть містити інші масиви: <code>grid[1][2]</code> — третій елемент другого рядка. Так записують таблиці, ігрові поля й матриці. Створюючи таку «сітку», не пишіть <code>new Array(3).fill([])</code>: усі рядки виявляться одним і тим самим масивом. Правильно будувати кожен рядок окремо: <code>Array.from({ length: 3 }, () =&gt; [])</code>. Перебирають масив через <code>for...of</code>, а якщо потрібен індекс, через <code>entries()</code>.",
      "Видалення через <code>delete arr[1]</code> залишає в масиві «діру» й не змінює довжину, тому його не використовують: для вилучення елементів є <code>splice</code> і <code>filter</code>. Дірки в масиві взагалі краще не створювати: вони роблять обхід непередбачуваним, а рушій зберігає такий «розріджений» масив гірше за щільний. Тримайте масиви щільними, однотипними й починайте нумерацію з нуля: це те, що рушій оптимізує найкраще.",
    ],
    code: [
      String.raw`const colors = ["червоний", "зелений", "синій"];
console.log(colors[0], colors.length, colors.at(-1), colors[10]);
console.log(Array.isArray(colors), typeof colors);
console.log([1] === [1]);`,
      String.raw`const queue = [1, 2];
queue.push(3);            // [1, 2, 3]
console.log(queue.pop());  // 3
queue.unshift(0);          // [0, 1, 2]
console.log(queue.shift(), queue);
console.log(queue.includes(2), queue.indexOf(9), ["a", "b"].join("-"));`,
      String.raw`console.log(Array.from("abc"));
console.log(Array.from({ length: 3 }, (_, i) => i * 2));
console.log(new Array(3));
console.log(new Array(3).fill(0));
const grid = Array.from({ length: 2 }, () => []);
grid[0].push("x");
console.log(grid);
const bad = new Array(2).fill([]);
bad[0].push("x");
console.log(bad);`,
      String.raw`const items = [1, 2, 3];
delete items[1];
console.log(items, items.length);
const list = [1, 2, 3];
list.length = 1;
console.log(list);`,
      String.raw`// аварія: довжина масиву не може бути від'ємною, і конструктор кидає RangeError
const size = -1;
const arr = new Array(size);
console.log(arr);`,
    ],
    note: "Нумерація починається з нуля, а останній елемент зручно брати через <code>at(-1)</code>. <code>push</code>, <code>pop</code>, <code>shift</code>, <code>unshift</code> змінюють масив на місці. <code>new Array(n).fill([])</code> створює один спільний вкладений масив.",
    work: "Масиви зберігають усе: товари в кошику, рядки таблиці, відповіді API, повідомлення чату. Уміння додавати, шукати, видаляти й перебирати елементи лежить в основі практично кожного екрана застосунку та кожного обробника даних на сервері.",
    tasks: [
      "Чому const-масив можна змінювати і як перевірити, що значення справді масив?",
      "Чим new Array(3) відрізняється від [undefined, undefined, undefined] і чому new Array(3).fill([]) небезпечний для сітки?",
    ],
  },
  {
    t: "Масиви: зміна, splice і зрізи",
    ch: "Колекції",
    easy: "Деякі методи масивів міняють його на місці, як олівець, що стирає запис у зошиті, а інші повертають новий, оновлений аркуш. Знати, до якого сімейства належить метод, потрібно, щоб не зіпсувати дані випадково.",
    p: [
      "Методи масивів поділяються на два табори. <b>Змінні</b> міняють сам масив: <code>push</code>, <code>pop</code>, <code>shift</code>, <code>unshift</code>, <code>splice</code>, <code>sort</code>, <code>reverse</code>, <code>fill</code>. <b>Чисті</b> повертають новий масив чи значення й не чіпають оригінал: <code>slice</code>, <code>concat</code>, <code>map</code>, <code>filter</code>, <code>flat</code>, <code>join</code>. Змішувати їх без розуміння небезпечно: функція, що отримала масив і викликала <code>sort</code>, непомітно змінює дані в того, хто її викликав.",
      "Метод <code>slice(from, to)</code> повертає копію шматка: від індексу <code>from</code> включно до <code>to</code> виключно. Обидва аргументи необов'язкові й можуть бути від'ємними: <code>arr.slice(-2)</code> дає два останні елементи, а <code>arr.slice()</code> без аргументів робить копію всього масиву. Оригінал при цьому не змінюється. Копія поверхнева: вкладені об'єкти лишаються спільними, про що ми поговоримо в уроці про копії.",
      "Універсальний змінний інструмент — <code>splice(start, deleteCount, ...items)</code>. Він видаляє <code>deleteCount</code> елементів, починаючи з позиції <code>start</code>, і вставляє на їхнє місце <code>items</code>. Повертає масив видалених елементів. Приклади: <code>arr.splice(1, 1)</code> прибирає один елемент на позиції 1, <code>arr.splice(2, 0, \"x\")</code> вставляє елемент без видалення, <code>arr.splice(0, 2, \"a\")</code> замінює два перші на один. Назви <code>slice</code> й <code>splice</code> схожі, а працюють по-різному, тому їх легко сплутати.",
      "Часто потрібно видалити значення, а не позицію. Тоді шукають індекс: <code>const i = arr.indexOf(x); if (i !== -1) arr.splice(i, 1);</code>. Якщо оригінал змінювати не можна, використовують <code>filter</code>: <code>arr.filter(item =&gt; item !== x)</code>. Видалення елемента за індексом без змін оригіналу виглядає як <code>[...arr.slice(0, i), ...arr.slice(i + 1)]</code>. Перший підхід швидший, другий безпечніший, і в сучасному коді, особливо у фронтенді, зазвичай обирають другий.",
      "Обережно з видаленням під час перебору. Якщо ви проходите по масиву зліва направо й викликаєте <code>splice</code>, наступні елементи зсуваються, і цикл пропускає сусіда видаленого. Надійних шляхів два: пройти масив з кінця або (краще) побудувати новий масив через <code>filter</code>. Те саме стосується <code>forEach</code>: змінювати масив, який перебираєте, — завжди погана ідея.",
      "Цикли зі <code>slice</code> дозволяють ділити масив на частини. Типова задача — розбити довгий список на «сторінки» по N елементів: у циклі <code>for (let i = 0; i &lt; arr.length; i += size) pages.push(arr.slice(i, i + size));</code>. Для унікальних значень використовують множину: <code>[...new Set(arr)]</code> залишає перше входження кожного. Обидва прийоми ви застосуєте в практичному завданні, а множини вивчимо трохи пізніше.",
      "Коли оригінал не можна змінювати зовсім, його можна «заморозити» методом <code>Object.freeze(arr)</code>. Після цього будь-яка спроба додати чи видалити елемент у строгому режимі викликає <code>TypeError</code>. Заморожування поверхневе, тобто вкладені об'єкти лишаються змінними. Але як страховка від випадкових змін воно корисне, особливо в спільних налаштуваннях і константах, які не повинні змінюватися за жодних умов.",
    ],
    code: [
      String.raw`const letters = ["a", "b", "c", "d", "e"];
console.log(letters.slice(1, 3), letters.slice(-2), letters.slice());
console.log(letters);   // не змінився`,
      String.raw`const list = ["a", "b", "c", "d"];
console.log(list.splice(1, 2), list);      // видалили b, c
list.splice(1, 0, "X", "Y");               // вставили
console.log(list);
list.splice(0, 1, "Z");                    // замінили
console.log(list);`,
      String.raw`const original = [3, 1, 2];
const sorted = original.sort();
console.log(sorted === original, original);   // sort змінює на місці
const copy = [...original].reverse();
console.log(copy, original);
const without = original.filter((n) => n !== 2);
console.log(without, original);`,
      String.raw`function chunk(arr, size) {
  const pages = [];
  for (let i = 0; i < arr.length; i += size) pages.push(arr.slice(i, i + size));
  return pages;
}
console.log(chunk([1, 2, 3, 4, 5], 2));
console.log([...new Set([1, 2, 2, 3, 1])]);
const nums = [1, 2, 2, 3];
for (let i = 0; i < nums.length; i++) if (nums[i] === 2) nums.splice(i, 1);
console.log(nums);   // другу двійку пропущено`,
      String.raw`// аварія: заморожений масив не можна змінювати, і push кидає TypeError
const config = Object.freeze(["dev", "prod"]);
console.log(config.length);
config.push("test");`,
    ],
    note: "<code>slice</code> копіює шматок і не чіпає оригінал, а <code>splice</code> видаляє чи вставляє на місці. <code>sort</code> і <code>reverse</code> теж змінюють масив. Не видаляйте елементи під час перебору: краще побудуйте новий масив через <code>filter</code>.",
    work: "Пагінація списків, видалення елемента з кошика, вставка запису посередині таблиці, копіювання стану перед змінами: усе це зрізи й splice. У фронтенді стан зазвичай не змінюють на місці, а створюють нову версію масиву.",
    tasks: [
      "Чим slice відрізняється від splice і який із них змінює початковий масив?",
      "Чому видалення елементів через splice всередині циклу зліва направо може пропустити елемент і як це обійти?",
    ],
  },
  {
    t: "map, filter і find",
    ch: "Колекції",
    easy: "<code>map</code> перетворює кожен елемент за правилом, <code>filter</code> залишає лише потрібні, а <code>find</code> шукає перший підходящий. Це три найпоширеніші «верстати» для роботи зі списками замість ручних циклів.",
    p: [
      "Методи <code>map</code>, <code>filter</code> та <code>find</code> належать до так званих функціональних методів масивів. Кожен приймає колбек, який викликається для кожного елемента з трьома аргументами: сам елемент, його індекс і весь масив. Вони не змінюють оригінал і повертають результат, тому легко комбінуються в ланцюжки. Перевага перед циклом — виразність: ви описуєте <b>що</b> хочете отримати, а не <b>як</b> проходити масив.",
      "<code>map</code> створює новий масив тієї ж довжини, у якому кожен елемент — результат колбека для відповідного елемента вихідного. <code>[1, 2, 3].map(n =&gt; n * 2)</code> дає <code>[2, 4, 6]</code>. Типові застосування: взяти з масиву об'єктів одне поле (<code>users.map(u =&gt; u.name)</code>), перетворити дані для показу, підготувати список для відправлення. Колбек <b>обов'язково</b> має щось повертати, інакше в результаті буде масив із <code>undefined</code>. Для дій без результату існує <code>forEach</code>, який нічого не повертає.",
      "<code>filter</code> повертає новий масив лише з тих елементів, для яких колбек дав істинне значення. Довжина результату може бути від нуля до довжини оригіналу. Класична ідіома <code>list.filter(Boolean)</code> відкидає всі хибні значення (<code>0</code>, порожні рядки, <code>null</code>, <code>undefined</code>): корисно, коли треба очистити дані від порожнечі, але небезпечно, якщо нуль для вас допустимий. Колбек не повинен змінювати елементи: це метод для відбору, а не для редагування.",
      "<code>find</code> повертає перший елемент, для якого колбек істинний, або <code>undefined</code>, якщо такого немає. <code>findIndex</code> робить те саме, але повертає індекс (або <code>-1</code>), а <code>findLast</code> і <code>findLastIndex</code> шукають з кінця. Вони зупиняються на першому збігу, тому для пошуку одного елемента ефективніші, ніж <code>filter(...)[0]</code>. Пам'ятайте про результат <code>undefined</code>: прямо звертатися до полів знайденого елемента без перевірки небезпечно, краще <code>found?.name</code>.",
      "Методи легко з'єднуються: <code>users.filter(u =&gt; u.active).map(u =&gt; u.email)</code> спершу відбирає активних, а потім бере їхні адреси. Такі ланцюжки читаються зверху вниз як опис конвеєра. Якщо ланцюжок розростається, розбийте його на змінні з промовистими іменами або винесіть колбеки в іменовані функції. Також є <code>flatMap</code>, який поєднує <code>map</code> і розгортання одного рівня вкладеності й зручний, коли кожен елемент дає кілька результатів.",
      "Є кілька типових помилок. Використання <code>map</code> лише заради побічних дій (наприклад, друку) створює зайвий масив і збиває читача з пантелику: беріть <code>forEach</code> або цикл. Асинхронний колбек у <code>map</code> повертає масив промісів, а не значень, тож без <code>Promise.all</code> результат не годиться. Методи пропускають «дірки» в розріджених масивах. А передача вбудованої функції, як-от <code>parseInt</code>, навіть без дужок, може дати неочікуваний результат через додаткові аргументи.",
      "Звісно, ці методи не заміняють цикли повністю. Якщо потрібно вийти раніше за умовою, застосовують <code>for...of</code> з <code>break</code> або <code>find</code> / <code>some</code>. Якщо потрібно накопичити складний результат, використовують <code>reduce</code> чи цикл. Але для відбору, перетворення й пошуку <code>filter</code>, <code>map</code> та <code>find</code> — це стандарт, який читається значно швидше за ручні цикли й зводить до мінімуму помилки з індексами.",
    ],
    code: [
      String.raw`const nums = [1, 2, 3, 4];
console.log(nums.map((n) => n * 2));
console.log(nums.map((n, i) => n + i));
console.log(["a", "b"].map((s) => s.toUpperCase()));
console.log(nums.map((n) => { n * 2; }));   // забули return`,
      String.raw`const raw = [3, 0, "", "текст", null, 7, undefined];
console.log(raw.filter(Boolean));
console.log(raw.filter((x) => x !== null && x !== undefined));
console.log([1, 2, 3, 4, 5, 6].filter((n) => n % 2 === 0));`,
      String.raw`const users = [
  { id: 1, name: "Оля", active: true },
  { id: 2, name: "Іван", active: false },
  { id: 3, name: "Марія", active: true },
];
console.log(users.find((u) => u.id === 2));
console.log(users.find((u) => u.id === 9));
console.log(users.findIndex((u) => u.name === "Марія"));
console.log(users.find((u) => u.id === 9)?.name ?? "не знайдено");`,
      String.raw`const users = [
  { name: "Оля", age: 17, tags: ["a", "b"] },
  { name: "Іван", age: 22, tags: ["c"] },
  { name: "Марія", age: 31, tags: [] },
];
const names = users.filter((u) => u.age >= 18).map((u) => u.name);
console.log(names);
console.log(users.flatMap((u) => u.tags));`,
      String.raw`// аварія: map є лише в масивів, а у звичайного об'єкта його немає
const scores = { math: 5, art: 4 };
console.log(scores.map((v) => v * 2));`,
    ],
    note: "<code>map</code> повертає масив тієї ж довжини й потребує <code>return</code>, <code>filter</code> залишає лише істинні, <code>find</code> дає перший збіг або <code>undefined</code>. Усі три не змінюють оригінал. Для побічних дій беріть <code>forEach</code>.",
    work: "Із відповіді сервера беруть потрібні поля через map, відфільтровують неактивних користувачів, шукають товар за id. Ланцюжок filter → map — найпоширеніший шаблон у коді інтерфейсів, звітів, експорту таблиць і будь-якої обробки даних.",
    tasks: [
      "Чим map відрізняється від forEach і що буде в результаті, якщо в колбеку map забути return?",
      "Коли find повертає undefined і як безпечно прочитати поле знайденого елемента?",
    ],
  },
  {
    t: "reduce, some, every і ланцюжки методів",
    ch: "Колекції",
    easy: "<code>reduce</code> згортає весь список в одне значення, як коли ви складаєте чеки в одну суму. <code>some</code> і <code>every</code> відповідають на питання «чи є хоча б один?» та «чи всі підходять?».",
    p: [
      "<code>reduce(callback, initial)</code> проходить масив і накопичує результат. Колбек отримує акумулятор (те, що накопичилось), поточний елемент, індекс і масив, а повертає нове значення акумулятора. Перший виклик починається з <code>initial</code>. Сума чисел: <code>[1, 2, 3].reduce((sum, n) =&gt; sum + n, 0)</code> дає <code>6</code>. Результатом може бути не лише число: рядок, об'єкт, інший масив. Тому <code>reduce</code> — універсальний метод, з якого за бажання можна виразити <code>map</code> і <code>filter</code>.",
      "Початкове значення необов'язкове, але завжди краще його вказувати. Без нього акумулятором стає перший елемент, а перебір починається з другого, що ламається на порожньому масиві: <code>[].reduce(fn)</code> кидає <code>TypeError: Reduce of empty array with no initial value</code>. З початковим значенням порожній масив просто повертає його. Також початкове значення задає тип результату: <code>0</code> для суми, <code>{}</code> для об'єкта-словника, <code>[]</code> для збору масиву.",
      "Дуже поширений приклад — підрахунок: <code>words.reduce((counts, w) =&gt; { counts[w] = (counts[w] ?? 0) + 1; return counts; }, {})</code> повертає об'єкт, у якому кожне слово має кількість входжень. Забути <code>return acc</code> у кінці колбека — найчастіша помилка: тоді на наступному кроці акумулятор буде <code>undefined</code>. Не зловживайте <code>reduce</code>: якщо вона робить щось, що прозоріше виглядає як <code>map</code> чи цикл, віддайте перевагу простішому варіанту.",
      "<code>some(callback)</code> повертає <code>true</code>, якщо хоча б для одного елемента колбек істинний, і зупиняється на першому такому. <code>every(callback)</code> повертає <code>true</code>, лише якщо колбек істинний для всіх елементів, і зупиняється на першому хибному. Для порожнього масиву <code>some</code> завжди дає <code>false</code>, а <code>every</code> — <code>true</code> (у порожній множині немає елементів, що порушують правило). Це не помилка, а логічна конвенція, яку треба пам'ятати, перевіряючи «чи всі поля заповнені».",
      "Методи легко з'єднуються у ланцюжки: відібрати, перетворити, звести. <code>cart.filter(i =&gt; i.inStock).map(i =&gt; i.price * i.qty).reduce((a, b) =&gt; a + b, 0)</code> рахує суму наявних товарів. Читається такий код як рецепт, але довгі ланцюжки варто розбивати на змінні з іменами (<code>available</code>, <code>lineTotals</code>) і так пояснювати кожен крок. Кожен метод проходить масив окремо, тож для величезних даних один цикл може бути швидшим, проте на звичайних обсягах різниця непомітна, а читабельність важливіша.",
      "Існують і споріднені методи: <code>reduceRight</code> іде з кінця, <code>flat(depth)</code> розгортає вкладені масиви, <code>flatMap</code> поєднує <code>map</code> та <code>flat(1)</code>. Для перевірки наявності простого значення краще <code>includes</code>, а <code>some</code> потрібен, коли перевірка складніша за рівність: <code>users.some(u =&gt; u.age &lt; 18)</code>. Усі ці методи не змінюють вихідний масив, тому їх безпечно застосовувати до даних, якими ви ділитеся.",
      "Остання порада — про швидкодію. Використання розгортання <code>{ ...acc, [key]: value }</code> усередині <code>reduce</code> створює новий об'єкт на кожному кроці й дає квадратичну складність на великих списках. Якщо накопичувач створено всередині <code>reduce</code> (початкове значення <code>{}</code>), його безпечно змінювати прямо, адже ззовні його ніхто не бачить. Тож пишіть <code>acc[key] = value; return acc;</code> і лишайте розгортання для поодиноких копіювань.",
    ],
    code: [
      String.raw`const nums = [1, 2, 3, 4];
console.log(nums.reduce((sum, n) => sum + n, 0));
console.log(nums.reduce((max, n) => (n > max ? n : max), -Infinity));
console.log([].reduce((sum, n) => sum + n, 0));`,
      String.raw`const words = ["кіт", "пес", "кіт", "миша", "кіт"];
const counts = words.reduce((acc, w) => {
  acc[w] = (acc[w] ?? 0) + 1;
  return acc;
}, {});
console.log(counts);`,
      String.raw`const ages = [17, 20, 31];
console.log(ages.some((a) => a < 18), ages.every((a) => a >= 18));
console.log([].some((a) => a > 0), [].every((a) => a > 0));
console.log(ages.includes(20));`,
      String.raw`const cart = [
  { name: "хліб", price: 30, qty: 2, inStock: true },
  { name: "сир", price: 120, qty: 1, inStock: false },
  { name: "молоко", price: 45, qty: 3, inStock: true },
];
const total = cart
  .filter((item) => item.inStock)
  .map((item) => item.price * item.qty)
  .reduce((a, b) => a + b, 0);
console.log(total);`,
      String.raw`// аварія: reduce без початкового значення не працює на порожньому масиві
const prices = [];
const total = prices.reduce((sum, p) => sum + p);
console.log(total);`,
    ],
    note: "Завжди вказуйте початкове значення <code>reduce</code>, а в колбеку повертайте акумулятор. <code>every</code> на порожньому масиві дає <code>true</code>, <code>some</code> дає <code>false</code>. Довгі ланцюжки розбивайте на змінні з назвами.",
    work: "Підсумок замовлення, середній бал, кількість непрочитаних повідомлень, перевірка «усі поля форми заповнені»: усе це згортки й логічні запити до списків. Ланцюжки filter → map → reduce лежать в основі звітів і дашбордів.",
    tasks: [
      "Для чого потрібне початкове значення reduce і що станеться з порожнім масивом, якщо його не вказати?",
      "Що поверне every для порожнього масиву і чому така відповідь вважається логічною?",
    ],
  },
  {
    t: "Об'єкти і деструктуризація",
    ch: "Колекції",
    easy: "Об'єкт — це картка з підписаними полями: ім'я, вік, місто. Деструктуризація дозволяє одним рядком «зняти» з картки потрібні поля у змінні, замість того щоб тричі писати <code>user.</code> і крапку.",
    p: [
      "Об'єкт — набір пар «ключ: значення». Літерал виглядає як <code>const user = { name: \"Оля\", age: 17 };</code>. Доступ до поля через крапку (<code>user.name</code>) або через квадратні дужки (<code>user[\"name\"]</code>); друга форма потрібна, коли ключ зберігається у змінній або містить пробіл. Поля додають і змінюють присвоєнням, видаляють оператором <code>delete</code>. Якщо змінна називається так само, як ключ, можна писати скорочено: <code>{ name, age }</code>. Обчислюваний ключ записують у дужках: <code>{ [key]: value }</code>.",
      "Перелічити вміст об'єкта допомагають три функції: <code>Object.keys(obj)</code> дає масив ключів, <code>Object.values(obj)</code> — значень, <code>Object.entries(obj)</code> — пар <code>[ключ, значення]</code>. Усі повертають лише власні поля. Перевірити наявність ключа можна через <code>\"name\" in obj</code> (враховує й успадковані) або <code>Object.hasOwn(obj, \"name\")</code> (лише власні). Порядок полів передбачуваний: спершу цілі невід'ємні числа за зростанням, потім рядкові ключі в порядку створення.",
      "Зворотну дію виконує <code>Object.fromEntries(пари)</code>: з масиву пар будує об'єкт. Разом з <code>entries</code> вона дає зручний шаблон: перетворити значення об'єкта, не чіпаючи ключі. Наприклад, <code>Object.fromEntries(Object.entries(prices).map(([k, v]) =&gt; [k, v * 2]))</code> подвоює всі ціни. Для об'єднання об'єктів використовують розгортання <code>{ ...a, ...b }</code>, де пізніші поля перемагають.",
      "<b>Деструктуризація</b> — запис, що розкладає об'єкт або масив на змінні. Для об'єкта: <code>const { name, age } = user;</code> створює дві змінні з відповідними значеннями. Можна перейменувати: <code>const { name: userName } = user;</code>. Можна задати значення за замовчуванням: <code>const { role = \"user\" } = user;</code>, яке спрацьовує лише для <code>undefined</code>. Можна заглиблюватись: <code>const { address: { city } } = user;</code>. А залишок збирає <code>...rest</code>: <code>const { id, ...others } = user;</code>.",
      "Для масивів деструктуризація йде за позицією: <code>const [first, second] = list;</code>. Непотрібні позиції пропускають комою: <code>const [, second] = list;</code>. Решту збирає <code>...rest</code>. Класичний прийом — обмін значень без допоміжної змінної: <code>[a, b] = [b, a];</code>. Функції, які повертають кілька значень, зручно повертати масивом чи об'єктом і одразу розкладати. Деструктурувати можна й параметри функції, що ми бачили в уроці про параметри: це чудовий спосіб описати очікувані поля.",
      "Є й підводні камені. Якщо справа від деструктуризації стоїть <code>null</code> чи <code>undefined</code>, виникає <code>TypeError</code>: <code>const { name } = null;</code> падає. Тому для необов'язкових значень пишуть <code>= {}</code> як запасний варіант: <code>const { name } = maybeUser ?? {};</code>. Відсутнє поле просто дає <code>undefined</code>. Значення за замовчуванням не замінює <code>null</code>, лише <code>undefined</code>. А ключі завжди є рядками (або символами), навіть якщо ви написали число.",
      "Об'єкти зручні для фіксованих записів із відомими полями (користувач, товар, налаштування) і як словники з рядковими ключами. Коли ключі динамічні, змінюються часто або не є рядками, краще підходить <code>Map</code>, про який ми поговоримо за кілька уроків. А стежте за тим, щоб не плутати копіювання з присвоєнням: <code>const b = a;</code> не створює копію об'єкта, обидві змінні вказують на один і той самий об'єкт.",
    ],
    code: [
      String.raw`const key = "city";
const user = { name: "Оля", age: 17, [key]: "Дніпро" };
user.age = 18;
user.email = "olia@example.com";
delete user.email;
console.log(user, user.name, user["city"]);
const name = "Іван";
console.log({ name });`,
      String.raw`const prices = { хліб: 30, молоко: 45 };
console.log(Object.keys(prices), Object.values(prices));
console.log(Object.entries(prices));
const doubled = Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v * 2]));
console.log(doubled);
console.log("хліб" in prices, Object.hasOwn(prices, "сир"));`,
      String.raw`const user = { id: 7, name: "Оля", address: { city: "Дніпро" } };
const { name, role = "user", address: { city } } = user;
console.log(name, role, city);
const { id: userId, ...others } = user;
console.log(userId, others);`,
      String.raw`const [first, , third, ...rest] = [1, 2, 3, 4, 5];
console.log(first, third, rest);
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b);
function minMax(list) {
  return [Math.min(...list), Math.max(...list)];
}
const [lo, hi] = minMax([4, 9, 2]);
console.log(lo, hi);`,
      String.raw`// аварія: деструктурувати null не можна, і рушій кидає TypeError
const response = null;
const { data } = response;
console.log(data);`,
    ],
    note: "<code>Object.entries</code> і <code>Object.fromEntries</code> перетворюють об'єкт у масив пар і назад. Деструктуризація падає на <code>null</code> і <code>undefined</code>, тож для необов'язкових даних додавайте <code>?? {}</code>. Значення за замовчуванням діє лише для <code>undefined</code>.",
    work: "Відповіді API це об'єкти, і з них щодня «знімають» потрібні поля. Деструктуризація в параметрах функцій і в імпортах робить код коротшим, а <code>entries</code> та <code>fromEntries</code> — основа перетворень словників.",
    tasks: [
      "Чим відрізняється доступ до поля через крапку й через квадратні дужки і коли потрібна друга форма?",
      "Що станеться при const { name } = null і як записати деструктуризацію безпечно?",
    ],
  },
  {
    t: "Копії: spread, structuredClone і Object.freeze",
    ch: "Колекції",
    easy: "Присвоєння об'єкта іншій змінній не робить копію: ви лише даєте другий ярлик на ту саму річ. Справжню копію створюють окремо, а для захисту від змін предмет можна «заморозити».",
    p: [
      "Об'єкти й масиви в JavaScript передаються за посиланням. Коли ви пишете <code>const b = a;</code>, змінні <code>a</code> та <code>b</code> вказують на один і той самий об'єкт у пам'яті, тому зміна через одну видима через іншу. Те саме відбувається, коли ви передаєте об'єкт у функцію: вона отримує посилання й може змінити ваші дані. Це не дефект, а властивість мови, і з нею треба вміти поводитися. Примітиви (числа, рядки) натомість копіюються за значенням.",
      "Найпростіша копія — <b>поверхнева</b>. Для об'єктів її робить розгортання <code>{ ...obj }</code> або <code>Object.assign({}, obj)</code>, для масивів <code>[...arr]</code>, <code>arr.slice()</code> чи <code>Array.from(arr)</code>. Створюється новий контейнер, у який переносяться значення першого рівня. Але якщо серед значень є об'єкти, у копії лежить посилання на ті самі вкладені об'єкти. Тож зміна <code>copy.address.city</code> змінює й оригінал, і це одна з найпоширеніших причин «таємничих» змін даних.",
      "Для повної, <b>глибокої</b> копії у сучасних середовищах є вбудована функція <code>structuredClone(value)</code>. Вона рекурсивно копіює об'єкти, масиви, <code>Date</code>, <code>Map</code>, <code>Set</code> і навіть коректно обробляє циклічні посилання. Не вміє вона лише копіювати функції (кидає <code>DataCloneError</code>) і не зберігає прототипи: екземпляр власного класу стане звичайним об'єктом. Старий трюк <code>JSON.parse(JSON.stringify(x))</code> гірший: <code>Date</code> перетворюється на рядок, <code>undefined</code> і функції зникають, <code>NaN</code> стає <code>null</code>, а <code>Map</code> і <code>Set</code> перетворюються на порожні об'єкти.",
      "У фронтенді й не лише поширений стиль <b>незмінності</b> (immutability): дані не змінюють на місці, а створюють нову версію. Оновити поле: <code>{ ...user, age: 18 }</code>. Додати елемент: <code>[...list, item]</code>. Замінити один елемент: <code>list.map(x =&gt; x.id === id ? { ...x, done: true } : x)</code>. Для вкладених даних копіюють кожен рівень на шляху до зміненого: <code>{ ...user, address: { ...user.address, city: \"Львів\" } }</code>. Невідчіплені частини лишаються спільними, і це економить пам'ять та спрощує порівняння: якщо посилання не змінилось, змін не було.",
      "<code>Object.freeze(obj)</code> робить об'єкт «замороженим»: не можна додавати, видаляти чи змінювати його власні поля. У строгому режимі (а модулі завжди строгі) така спроба кидає <code>TypeError</code>, у нестрогому мовчки ігнорується. Заморожування <b>поверхневе</b>: вкладений об'єкт лишається змінним, поки його не заморозити окремо. Для повного захисту пишуть рекурсивну <code>deepFreeze</code>, що проходить по вкладених значеннях. Перевірити стан можна через <code>Object.isFrozen</code>. Споріднені <code>Object.seal</code> і <code>Object.preventExtensions</code> дають слабші обмеження.",
      "Не плутайте <code>const</code> та <code>freeze</code>. <code>const</code> забороняє переприсвоїти змінну, а <code>freeze</code> забороняє змінювати вміст об'єкта. Їх часто використовують разом для констант: <code>const DEFAULTS = Object.freeze({ theme: \"light\" });</code>. Зверніть увагу й на порівняння: два однакових за вмістом об'єкти не рівні за <code>===</code>. Для порівняння вмісту пишуть власну функцію глибокого порівняння або використовують бібліотеку; порівняння через <code>JSON.stringify</code> ненадійне, бо залежить від порядку ключів.",
      "Коли копіювати? Перед тим як змінювати те, що вам передали, якщо змінювати оригінал не можна. Перед збереженням «знімка» стану для скасування дій. Коли віддаєте внутрішні дані назовні й не хочете, щоб їх змінили. Але не копіюйте без потреби: глибоке копіювання великих структур дороге, а надмірна обережність створює зайву роботу. Достатньо розуміти, де проходять межі спільного володіння даними, і міняти спільне тільки свідомо.",
    ],
    code: [
      String.raw`const a = { n: 1 };
const b = a;
b.n = 2;
console.log(a.n, a === b);

function addTag(list) {
  list.push("новий");   // змінює переданий масив
}
const tags = ["a"];
addTag(tags);
console.log(tags);`,
      String.raw`const user = { name: "Оля", address: { city: "Дніпро" } };
const shallow = { ...user };
shallow.name = "Іра";
shallow.address.city = "Львів";   // вкладений об'єкт спільний
console.log(user.name, user.address.city);

const deep = structuredClone(user);
deep.address.city = "Київ";
console.log(user.address.city, deep.address.city);`,
      String.raw`const data = { when: new Date(0), tags: new Set(["a"]), missing: undefined, nan: NaN };
const viaJson = JSON.parse(JSON.stringify(data));
const viaClone = structuredClone(data);
console.log(typeof viaJson.when, viaJson.tags, "missing" in viaJson, viaJson.nan);
console.log(viaClone.when instanceof Date, viaClone.tags, "missing" in viaClone, viaClone.nan);`,
      String.raw`const state = { user: { name: "Оля", age: 17 }, items: [1, 2] };
const next = {
  ...state,
  user: { ...state.user, age: 18 },
  items: [...state.items, 3],
};
console.log(state.user.age, next.user.age, state.items, next.items);
console.log(next.user !== state.user);`,
      String.raw`// аварія: функції не можна клонувати, і structuredClone кидає DataCloneError
const settings = { theme: "dark", onSave() { return 1; } };
const copy = structuredClone(settings);
console.log(copy);`,
    ],
    note: "Присвоєння об'єкта копіює лише посилання. Spread і <code>slice</code> роблять поверхневу копію, а <code>structuredClone</code> глибоку (без функцій). <code>Object.freeze</code> поверхневий і відрізняється від <code>const</code>.",
    work: "Баги на кшталт «у списку змінилося те, чого я не чіпав» майже завжди про спільні посилання. Незмінні оновлення стану лежать в основі React, Redux і більшості сучасних інтерфейсів, а structuredClone корисний для знімків і скасування дій.",
    tasks: [
      "Чому зміна вкладеного об'єкта в поверхневій копії змінює й оригінал і чим це лікується?",
      "Чим structuredClone кращий за JSON.parse(JSON.stringify(x)) і які в нього обмеження?",
    ],
  },
  {
    t: "Map і Set",
    ch: "Колекції",
    easy: "<code>Map</code> — це словник, де ключем може бути що завгодно, а <code>Set</code> — мішок унікальних значень, у якому кожне лежить лише раз. Обидва пам'ятають порядок, у якому ви їх додавали.",
    p: [
      "<code>Map</code> зберігає пари «ключ → значення». На відміну від звичайного об'єкта, ключем може бути будь-яке значення: число, об'єкт, функція. Створюють його через <code>new Map()</code>, а наповнюють методами: <code>set(key, value)</code>, <code>get(key)</code>, <code>has(key)</code>, <code>delete(key)</code>, <code>clear()</code>. Кількість пар дає властивість <code>size</code> (не <code>length</code>). Порядок обходу збігається з порядком додавання, а повторний <code>set</code> з тим самим ключем лише оновлює значення. Методи <code>set</code> повертають сам <code>Map</code>, тому їх можна з'єднувати в ланцюжок.",
      "Map ітерований: <code>for (const [key, value] of map)</code> проходить по парах. Окремо є <code>map.keys()</code>, <code>map.values()</code> і <code>map.entries()</code>, а також <code>forEach</code>. Щоб отримати звичайний масив, його розгортають: <code>[...map]</code> дає масив пар, <code>[...map.keys()]</code> — масив ключів. Створити Map можна з масиву пар: <code>new Map([[\"a\", 1], [\"b\", 2]])</code>, а перетворити назад на об'єкт — через <code>Object.fromEntries(map)</code>. Саме цей зв'язок з масивами пар робить Map зручним у конвеєрах обробки.",
      "Типовий приклад застосування — підрахунок частот: <code>counts.set(word, (counts.get(word) ?? 0) + 1)</code>. Кожен ключ порівнюється за правилом «SameValueZero»: подібно до <code>===</code>, але <code>NaN</code> вважається рівним <code>NaN</code>. Ключі-об'єкти порівнюються за посиланням, тому два різні, але однакові за вмістом об'єкти — це два різні ключі. Звичайний об'єкт у цьому не може змагатися: його ключі завжди перетворюються на рядки, і числа <code>1</code> та <code>\"1\"</code> там збігаються.",
      "<code>Set</code> — колекція унікальних значень. Методи: <code>add(x)</code>, <code>has(x)</code>, <code>delete(x)</code>, <code>clear()</code>, властивість <code>size</code>. Повторне додавання вже наявного значення нічого не змінює. Це найкоротший спосіб прибрати дублікати з масиву: <code>[...new Set(arr)]</code>. Перевірка <code>set.has(x)</code> працює швидко навіть на великих обсягах, тому множину вибирають, коли треба часто питати «чи є вже таке?», на відміну від <code>array.includes</code>, який переглядає елементи один за одним.",
      "У нових середовищах Set отримав методи для роботи з множинами в математичному сенсі: <code>union</code>, <code>intersection</code>, <code>difference</code>, <code>symmetricDifference</code>, <code>isSubsetOf</code> та інші. Вони працюють у Node.js 22 і сучасних браузерах, але в старіших середовищах їх немає, тож у навчальних і бібліотечних проєктах їх лишають «на потім» або імітують через <code>filter</code>: <code>new Set([...a].filter(x =&gt; b.has(x)))</code> дає перетин. Якщо ваш код має працювати скрізь, перевіряйте підтримку.",
      "Коли брати Map, а коли об'єкт? Об'єкт добрий для записів із фіксованим набором відомих полів (<code>{ name, age }</code>) і для даних, що пересилаються у форматі JSON. Map виграє, якщо ключі невідомі наперед, часто додаються й видаляються, мають не рядковий тип або вам важливий розмір і порядок. У об'єкта є пастка: ключі на кшталт <code>\"constructor\"</code> чи <code>\"toString\"</code> перетинаються з успадкованими властивостями, а Map такої проблеми не має.",
      "Є й неприємні несподіванки. <code>JSON.stringify(new Map([[1, 2]]))</code> повертає <code>{}</code>: Map і Set самі не серіалізуються, їх спершу перетворюють на масиви чи об'єкти. Виклик <code>Map()</code> без <code>new</code> завершується <code>TypeError</code>. А зберігання об'єктів у Map як ключів тримає їх у пам'яті, доки живий Map; для випадків, коли цього не хочеться, існує <code>WeakMap</code>, про який поговоримо пізніше в цій главі.",
    ],
    code: [
      String.raw`const ages = new Map();
ages.set("Оля", 17).set("Іван", 19);
ages.set("Оля", 18);               // оновлення
console.log(ages.get("Оля"), ages.has("Марія"), ages.size);
ages.delete("Іван");
console.log([...ages]);
const m = new Map([[1, "число"], ["1", "рядок"]]);
console.log(m.get(1), m.get("1"), m.size);`,
      String.raw`const text = "кіт пес кіт миша кіт пес";
const counts = new Map();
for (const word of text.split(" ")) {
  counts.set(word, (counts.get(word) ?? 0) + 1);
}
for (const [word, n] of counts) console.log(word, n);
console.log(Object.fromEntries(counts));`,
      String.raw`const set = new Set([1, 2, 2, 3, 3, 3]);
set.add(4).add(1);
console.log(set, set.size, set.has(2));
console.log([...new Set("мама")].join(""));
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
console.log([...a].filter((x) => b.has(x)));
console.log(a.union(b), a.intersection(b), a.difference(b));`,
      String.raw`const map = new Map([["a", 1]]);
console.log(JSON.stringify(map));
console.log(JSON.stringify(Object.fromEntries(map)));
console.log(JSON.stringify([...new Set([1, 2])]));
const key1 = { id: 1 };
const byObject = new Map([[key1, "перший"]]);
console.log(byObject.get(key1), byObject.get({ id: 1 }));`,
      String.raw`// аварія: Map треба створювати через new, без нього конструктор кидає TypeError
const dictionary = Map([["a", 1]]);
console.log(dictionary);`,
    ],
    note: "<code>Map</code> приймає ключі будь-якого типу й зберігає порядок, розмір береться з <code>size</code>. <code>Set</code> тримає унікальні значення: <code>[...new Set(arr)]</code> прибирає дублікати. Самі Map і Set не серіалізуються в JSON.",
    work: "Map рахує частоти слів і подій, кешує результати за ключем-об'єктом, будує індекси за id. Set відстежує вже оброблені елементи, унікальні теги й вибрані пункти меню, а перевірка в ньому не залежить від розміру списку.",
    tasks: [
      "Чим Map відрізняється від звичайного об'єкта щодо типів ключів і чому різні об'єкти-ключі з однаковим вмістом не збігаються?",
      "Як прибрати дублікати з масиву й чому JSON.stringify(new Map(...)) повертає порожній об'єкт?",
    ],
  },
  {
    t: "Сортування: sort і localeCompare",
    ch: "Колекції",
    easy: "Сортування розставляє елементи за правилом порівняння. Якщо не пояснити комп'ютеру правило, він порівнює все як рядки: тоді число 10 опиняється перед 9, а українські літери стають не в алфавітному порядку.",
    p: [
      "Метод <code>sort</code> сортує масив <b>на місці</b> і повертає той самий масив. Без аргументів він перетворює елементи на рядки й порівнює їх за кодами символів. Через це числа сортуються «по-словниковому»: <code>[10, 9, 1].sort()</code> дає <code>[1, 10, 9]</code>, бо рядок \"10\" менший за \"9\". Це одна з найвідоміших пасток мови. Також стандартне сортування ставить великі літери перед малими, а <code>undefined</code> завжди в кінець, і не знає нічого про українські правила алфавіту.",
      "Щоб задати власне правило, у <code>sort</code> передають функцію порівняння <code>(a, b) =&gt; число</code>. Вона має повернути від'ємне число, якщо <code>a</code> має стояти перед <code>b</code>, додатне, якщо після, і нуль, якщо порядок неважливий. Для чисел за зростанням: <code>(a, b) =&gt; a - b</code>, за спаданням: <code>(a, b) =&gt; b - a</code>. Передавати замість функції щось інше (наприклад, рядок <code>\"asc\"</code>) не можна: це <code>TypeError</code>. Порівняння має бути послідовним: якщо воно суперечливе, результат не визначений.",
      "Від 2019 року сортування в JavaScript <b>стабільне</b>: елементи, які за правилом рівні, зберігають взаємний порядок. Це дає змогу сортувати у кілька проходів і комбінувати критерії. Для об'єктів порівнюють потрібні поля: <code>users.sort((a, b) =&gt; a.age - b.age)</code>. Для кількох критеріїв з'єднують порівняння через <code>||</code>: <code>(a, b) =&gt; b.score - a.score || a.name.localeCompare(b.name)</code>. Якщо перше порівняння дає нуль (однакові бали), спрацьовує друге.",
      "Рядки правильно порівнювати методом <code>a.localeCompare(b, locale, options)</code>. Він враховує правила мови: <code>\"a\".localeCompare(\"b\", \"uk\")</code> дає від'ємне число. Для української <code>localeCompare(b, \"uk\")</code> розставляє літери так, як у словнику: «ґ» після «г», «і» й «ї» після «и». Опції дозволяють не зважати на регістр (<code>{ sensitivity: \"base\" }</code>) або порівнювати числа в рядках як числа (<code>{ numeric: true }</code>), щоб \"файл2\" ішов перед \"файл10\".",
      "Якщо сортувати потрібно часто або великі списки, створіть один об'єкт <code>Intl.Collator</code>: <code>const collator = new Intl.Collator(\"uk\"); names.sort(collator.compare);</code>. Він дає ті самі результати, що й <code>localeCompare</code>, але швидший, бо правила мови розбираються один раз. Докладніше про <code>Intl</code> ми поговоримо в главі про вбудовані можливості. Пам'ятайте також, що результат залежить від налаштувань середовища, тож у критичних місцях мову задають явно.",
      "Оскільки <code>sort</code> змінює масив, перед сортуванням чужих даних зробіть копію: <code>[...list].sort(...)</code>. У сучасних середовищах є нечисте-безпечний варіант <code>toSorted</code>, що повертає новий масив; його розглянемо в одному з наступних уроків. Не пишіть «перемішування» як <code>arr.sort(() =&gt; Math.random() - 0.5)</code>: такий компаратор несумісний і дає перекошений розподіл, для чесного перемішування потрібен алгоритм Фішера-Єйтса.",
      "Практичні задачі на сортування: рейтинг гравців за балами з однаковими за іменем; список файлів за назвою «людською» мовою; три найдорожчі товари (відсортували за спаданням і взяли <code>slice(0, 3)</code>). У всіх випадках спершу чітко сформулюйте правило порівняння, потім перевірте на двох-трьох прикладах, включно з рівними значеннями. Так ви уникнете помилок, які дуже складно побачити на великому обсязі даних.",
    ],
    code: [
      String.raw`console.log([10, 9, 1, 100].sort());
console.log([10, 9, 1, 100].sort((a, b) => a - b));
console.log([10, 9, 1, 100].sort((a, b) => b - a));
console.log(["б", "Б", "а", "А"].sort());`,
      String.raw`const fruits = ["яблуко", "Банан", "ґанок", "вишня", "їжак", "іній"];
console.log([...fruits].sort());
console.log([...fruits].sort((a, b) => a.localeCompare(b, "uk")));
console.log(["файл10", "файл2", "файл1"].sort((a, b) => a.localeCompare(b, "uk", { numeric: true })));`,
      String.raw`const players = [
  { name: "Олег", score: 90 },
  { name: "Анна", score: 90 },
  { name: "Ігор", score: 75 },
  { name: "Віра", score: 100 },
];
players.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "uk"));
console.log(players.map((p) => p.name + ":" + p.score).join(", "));`,
      String.raw`const collator = new Intl.Collator("uk");
console.log(["Яр", "Арка", "Єнот"].sort(collator.compare));
const original = [3, 1, 2];
const copy = [...original].sort((a, b) => a - b);
console.log(original, copy);
console.log([3, undefined, 1].sort());`,
      String.raw`// аварія: порівняння в sort має бути функцією, а рядок "asc" викликає TypeError
const nums = [3, 1, 2];
nums.sort("asc");
console.log(nums);`,
    ],
    note: "Без компаратора <code>sort</code> порівнює елементи як рядки: <code>[10, 9, 1].sort()</code> дає <code>[1, 10, 9]</code>. Для чисел пишіть <code>(a, b) =&gt; a - b</code>, для рядків <code>localeCompare</code> з мовою, а перед сортуванням чужих даних робіть копію.",
    work: "Таблиці з сортуванням за клітинкою, рейтинги, списки контактів за алфавітом, «найновіші спершу»: це щоденні задачі. Правильне порівняння українських рядків і стабільність сортування відрізняють охайний інтерфейс від «плаваючого» порядку.",
    tasks: [
      "Чому [10, 9, 1].sort() повертає [1, 10, 9] і як відсортувати числа правильно?",
      "Для чого в порівнянні рядків українською використовують localeCompare з мовою \"uk\" замість оператора порівняння?",
    ],
  },
  {
    t: "Сучасні методи: toSorted, with, Object.groupBy",
    ch: "Колекції",
    adv: true,
    easy: "Нові методи масивів дозволяють сортувати, розвертати й міняти елементи, не псуючи оригінал: замість «стерти й переписати» вони повертають акуратну нову копію. А <code>Object.groupBy</code> сам розкладає список по «коробках».",
    p: [
      "Роками найзручніші методи сортування й розвороту (<code>sort</code>, <code>reverse</code>, <code>splice</code>) змінювали масив на місці, тому розробники змушені були вручну копіювати його перед викликом. Стандарт ES2023 додав «безпечні» двійники: <code>toSorted(compare)</code>, <code>toReversed()</code>, <code>toSpliced(start, count, ...items)</code> та <code>with(index, value)</code>. Усі вони повертають <b>новий</b> масив і не чіпають оригінал, тож ідеально вписуються в стиль незмінних оновлень. Вони працюють у Node.js від 20-ї версії та у сучасних браузерах із 2023 року.",
      "<code>arr.toSorted((a, b) =&gt; a - b)</code> робить те саме, що <code>[...arr].sort((a, b) =&gt; a - b)</code>, але компактніше й виразніше. <code>arr.toReversed()</code> замінює <code>[...arr].reverse()</code>. Метод <code>with</code> замінює один елемент: <code>arr.with(1, \"X\")</code> повертає копію, де на позиції 1 стоїть \"X\", а замість <code>arr.map((x, i) =&gt; i === 1 ? \"X\" : x)</code>. Якщо індекс поза межами, <code>with</code> кидає <code>RangeError</code>, чого не робить звичайне присвоєння за індексом.",
      "Ще кілька корисних новинок. <code>at(index)</code> приймає від'ємні індекси. <code>findLast</code> і <code>findLastIndex</code> шукають з кінця. <code>Array.fromAsync</code> збирає масив з асинхронного джерела. Методи <code>flat</code> та <code>flatMap</code> розгортають вкладені масиви. Усі вони зменшують потребу в ручних циклах і допоміжних бібліотеках. Проте за новизною стоїть обмеження: у старих браузерах і застарілих середовищах (наприклад, давніх версіях Node) цих методів просто немає, і виклик закінчиться <code>TypeError: ... is not a function</code>.",
      "<code>Object.groupBy(items, callback)</code> розкладає елементи по групах: колбек повертає ключ, і результат — об'єкт, де кожному ключу відповідає масив елементів. <code>Object.groupBy(users, u =&gt; u.age &gt;= 18 ? \"adult\" : \"minor\")</code> дає <code>{ adult: [...], minor: [...] }</code>. Є двійник <code>Map.groupBy</code>, у якому ключами можуть бути довільні значення. Раніше це писали вручну через <code>reduce</code>, а тепер це одна рядок. Прибульці ES2024 вже працюють у Node 21+ та сучасних браузерах.",
      "Нюанс <code>Object.groupBy</code>: повернений об'єкт створено без прототипу (<code>null</code>-прототип). Це захищає від конфліктів ключів на кшталт <code>\"constructor\"</code>, але означає, що на ньому немає методів <code>hasOwnProperty</code> чи <code>toString</code>. Для перевірки ключа використовуйте <code>Object.hasOwn(groups, key)</code> або оператор <code>in</code>. Звичайним об'єктом його можна зробити розгортанням: <code>{ ...groups }</code>. Порядок ключів — за першою появою в списку.",
      "Як писати код, що має працювати і в старих середовищах? Є три підходи. Перевіряти підтримку: <code>typeof Array.prototype.toSorted === \"function\"</code> і вибирати запасний шлях. Підключити поліфіл (бібліотеку, що додає відсутні методи). Або користуватися збирачем, який перетворює новий синтаксис, проте поліфіли методів збирачі додають лише на вимогу. У цьому курсі, коли ми використовуємо нові методи, вони позначені як «у сучасних браузерах», а завдання перевіряються в середовищі, де вони є.",
      "Підсумок для практики. Для нових проєктів віддавайте перевагу «безпечним» методам: вони зменшують кількість випадкових змін спільних даних. Для сумісності з давнішими системами тримайте під рукою класичний запис через копію. А <code>groupBy</code> використовуйте, коли треба швидко побудувати зріз даних за категорією: за статусом замовлення, за місяцем, за ролью користувача. Цього вистачає, щоб відмовитись від десятків допоміжних функцій у вашому коді.",
    ],
    code: [
      String.raw`const nums = [3, 1, 2];
console.log(nums.toSorted((a, b) => a - b), nums);
console.log(nums.toReversed(), nums);
console.log(nums.with(1, 99), nums);
console.log(nums.toSpliced(0, 1, "a", "b"), nums);`,
      String.raw`const list = [10, 20, 30, 40];
console.log(list.at(-1), list.findLast((n) => n < 35), list.findLastIndex((n) => n < 35));
console.log([[1, 2], [3, [4]]].flat(), [[1, 2], [3, [4]]].flat(Infinity));`,
      String.raw`const users = [
  { name: "Оля", age: 17 },
  { name: "Іван", age: 22 },
  { name: "Марія", age: 31 },
];
const groups = Object.groupBy(users, (u) => (u.age >= 18 ? "adult" : "minor"));
console.log(groups.adult.map((u) => u.name), groups.minor.length);
const byDecade = Map.groupBy(users, (u) => Math.floor(u.age / 10) * 10);
console.log([...byDecade.keys()]);`,
      String.raw`const sortCopy = typeof Array.prototype.toSorted === "function"
  ? (arr, cmp) => arr.toSorted(cmp)
  : (arr, cmp) => [...arr].sort(cmp);
console.log(sortCopy([3, 1, 2], (a, b) => a - b));
console.log(Object.hasOwn(Object.groupBy([1, 2, 3], (n) => (n % 2 ? "odd" : "even")), "odd"));`,
      String.raw`// аварія: результат groupBy не має прототипу, тому методу hasOwnProperty на ньому немає
const groups = Object.groupBy([1, 2, 3], (n) => (n % 2 ? "odd" : "even"));
console.log(Object.keys(groups));
console.log(groups.hasOwnProperty("odd"));`,
    ],
    note: "<code>toSorted</code>, <code>toReversed</code>, <code>toSpliced</code> і <code>with</code> повертають копію й не змінюють оригінал. Вони й <code>Object.groupBy</code> є у сучасних середовищах, у старих їх немає. Результат <code>groupBy</code> не має прототипу.",
    work: "У стані React-застосунків і Redux масиви не можна змінювати на місці, тому безпечні методи тут справжній порятунок. А groupBy швидко будує зведення за категоріями для звітів і фільтрів.",
    tasks: [
      "Чим toSorted відрізняється від sort і чому це зручно для незмінних оновлень?",
      "Що повертає Object.groupBy і чому на цьому об'єкті не спрацює hasOwnProperty?",
    ],
  },
  {
    t: "WeakMap, WeakSet і WeakRef",
    ch: "Колекції",
    adv: true,
    easy: "Звичайна колекція тримає свої об'єкти міцно, як рука. «Слабка» колекція лише спирається на них: якщо більше ніхто об'єкт не використовує, збирач сміття має право його прибрати, і запис зникне разом з ним.",
    p: [
      "JavaScript автоматично звільняє пам'ять: об'єкт, до якого більше немає жодних посилань, збирач сміття видаляє. Проте звичайні <code>Map</code> і <code>Set</code> <b>міцно</b> тримають свої ключі: поки колекція жива, жоден з її об'єктів-ключів не буде видалений, навіть якщо в програмі на нього вже ніхто не посилається. Це джерело витоків пам'яті, коли ви зберігаєте допоміжні дані «про об'єкт» у глобальному словнику й забуваєте їх прибрати.",
      "<code>WeakMap</code> розв'язує цю проблему. Його ключами можуть бути лише об'єкти (або незареєстровані символи), і посилання на ключ <b>слабке</b>: воно не заважає збирачу сміття. Коли на об'єкт-ключ більше ніхто не посилається, запис зникає з <code>WeakMap</code> автоматично разом зі значенням. Інтерфейс скромний: <code>set</code>, <code>get</code>, <code>has</code>, <code>delete</code>. Не можна дізнатись розмір чи перебрати вміст, бо вміст може змінитись у будь-який момент, коли відбудеться збирання сміття.",
      "Типові застосування <code>WeakMap</code>: прикріпити метадані до об'єкта, яким ви не володієте (елемент сторінки, об'єкт з чужої бібліотеки), не змінюючи його; зберігати «приватні» дані екземплярів (зараз для цього є приватні поля класів, але у старому коді <code>WeakMap</code> був стандартним способом); кешувати результати обчислень для об'єктів так, щоб кеш не тримав їх у пам'яті. У всіх цих випадках життя допоміжних даних має збігатися з життям самого об'єкта.",
      "<code>WeakSet</code> — це множина слабких посилань на об'єкти. Має лише <code>add</code>, <code>has</code> і <code>delete</code>. Класичний приклад — позначати об'єкти як «вже відвідані» під час обходу структури з циклічними посиланнями: <code>if (seen.has(node)) return; seen.add(node);</code>. Після завершення обходу набір не заважає звільненню вузлів. Для маленьких структур і короткоживучого коду звичайний <code>Set</code> теж підійде, проте слабкий варіант гарантує, що ви не створите витік.",
      "<code>WeakRef</code> дає слабке посилання на окремий об'єкт: <code>const ref = new WeakRef(obj);</code>, а дістати об'єкт можна через <code>ref.deref()</code>, який поверне сам об'єкт або <code>undefined</code>, якщо його вже зібрано. Поряд існує <code>FinalizationRegistry</code>, що викликає колбек після видалення об'єкта. Стандарт чесно попереджає: момент збирання сміття непередбачуваний, тому ці інструменти не можна використовувати для логіки, що має працювати однаково завжди. Вони лише оптимізують пам'ять, наприклад у кешах.",
      "Через недетермінованість ці колекції важко показувати наочно: ви не можете змусити рушій зібрати сміття у навчальному прикладі. Тому в уроці ми перевіряємо лише поведінку інтерфейсу: ключами можуть бути лише об'єкти, значення зберігаються, перебору немає. Спроба покласти примітив у <code>WeakMap</code> кидає <code>TypeError</code>. Запам'ятайте правило вибору: потрібно знати розмір чи перебрати вміст — звичайні <code>Map</code> та <code>Set</code>; потрібно прикріпити дані до об'єкта без втручання у його життя — слабкі колекції.",
      "Із слабкими колекціями пов'язаний і правильний стиль роботи з пам'яттю загалом: не тримайте у глобальних кешах і словниках більше, ніж потрібно; прибирайте записи, коли об'єкт більше не потрібен; не накопичуйте обробників подій на знищених елементах. Про збирач сміття й типові витоки ми докладніше поговоримо в главі про об'єкти та класи. А тут вам досить знати, що така можливість є і для чого вона потрібна.",
    ],
    code: [
      String.raw`const meta = new WeakMap();
const element = { tag: "button" };
meta.set(element, { clicks: 0 });
meta.get(element).clicks++;
console.log(meta.get(element), meta.has(element), meta.has({ tag: "button" }));`,
      String.raw`const privateData = new WeakMap();
class Account {
  constructor(owner, balance) {
    this.owner = owner;
    privateData.set(this, { balance });
  }
  get balance() {
    return privateData.get(this).balance;
  }
}
const acc = new Account("Оля", 100);
console.log(acc.owner, acc.balance, Object.keys(acc));`,
      String.raw`function countNodes(node, seen = new WeakSet()) {
  if (seen.has(node)) return 0;
  seen.add(node);
  let total = 1;
  for (const next of node.links) total += countNodes(next, seen);
  return total;
}
const a = { links: [] };
const b = { links: [a] };
a.links.push(b);      // цикл a -> b -> a
console.log(countNodes(a));`,
      String.raw`const target = { name: "обʼєкт" };
const ref = new WeakRef(target);
console.log(ref.deref() === target, ref.deref().name);
console.log(typeof FinalizationRegistry);`,
      String.raw`// аварія: ключем WeakMap може бути лише об'єкт, а рядок викликає TypeError
const cache = new WeakMap();
cache.set("key", 1);
console.log(cache.has("key"));`,
    ],
    note: "<code>WeakMap</code> і <code>WeakSet</code> приймають лише об'єкти, не мають розміру й перебору та не заважають збирачу сміття. Їх беруть для метаданих і позначок «відвідано». Поведінку <code>WeakRef</code> не можна використовувати для логіки програми.",
    work: "Бібліотеки зберігають дані про DOM-елементи у WeakMap, щоб не провокувати витоків, а кеші результатів для об'єктів-ключів роблять слабкими. Правильне поводження з пам'яттю відрізняє застосунок, що працює днями, від того, що повільнішає через годину.",
    tasks: [
      "Чим WeakMap відрізняється від Map щодо ключів, розміру й впливу на збирач сміття?",
      "У яких випадках варто брати WeakSet і чому на WeakRef не можна будувати логіку, що має працювати однаково завжди?",
    ],
  },
  {
    t: "Типізовані масиви й ArrayBuffer",
    ch: "Колекції",
    adv: true,
    easy: "Типізований масив — це масив чисел одного виду, що лежать у пам'яті щільно, як яйця в картонній коробці. Ним зручно читати файли, пікселі й мережеві пакети, де важливий кожен байт.",
    p: [
      "Звичайний масив JavaScript гнучкий: у ньому можуть лежати числа, рядки й об'єкти, а розмір змінюється. За цю гнучкість доводиться платити пам'яттю та швидкістю. Коли треба працювати з «сирими» даними (вміст файлу, звук, зображення, повідомлення мережевого протоколу), використовують <b>типізовані масиви</b>: <code>Uint8Array</code>, <code>Int16Array</code>, <code>Float32Array</code> та інші. Кожен елемент займає фіксований розмір, а довжина не змінюється після створення.",
      "Дані типізованого масиву живуть в об'єкті <code>ArrayBuffer</code>, який є просто шматком сирої пам'яті у байтах: <code>new ArrayBuffer(8)</code> — вісім байтів. Сам буфер не вміє читати чи писати, для цього потрібен «погляд» (view): <code>new Uint8Array(buffer)</code> бачить ті самі байти як беззнакові однобайтові числа, а <code>new Int32Array(buffer)</code> — як 32-бітні цілі. Різні погляди на один буфер ділять пам'ять: змінивши байт через один, ви побачите зміну в іншому.",
      "Найчастіше вживані типи: <code>Uint8Array</code> (0…255), <code>Int8Array</code> (−128…127), <code>Uint16Array</code>, <code>Int32Array</code>, <code>Float32Array</code>, <code>Float64Array</code>, а ще <code>BigInt64Array</code>. Є й <code>Uint8ClampedArray</code>, який замість «переповнення» обрізає значення до меж; його використовує Canvas для пікселів. Створити масив можна за довжиною (<code>new Uint8Array(4)</code> — чотири нулі), зі звичайного масиву (<code>Uint8Array.from([1, 2, 3])</code>) чи з буфера.",
      "Важлива відмінність від звичайних чисел — <b>обгортання</b> значень. Запис <code>300</code> у <code>Uint8Array</code> збереже <code>44</code> (300 mod 256), а <code>-1</code> стане <code>255</code>. Помилки при цьому немає, переповнення мовчки відсікає зайві біти. Дробові числа відсікаються до цілих. Тому вибір типу — це вибір діапазону: чи вмістяться ваші значення. Масив <code>Float32Array</code> зберігає дроби з меншою точністю, ніж звичайні числа JavaScript, що теж вартує пам'ятати.",
      "Методи в типізованих масивів знайомі: <code>map</code>, <code>filter</code>, <code>slice</code>, <code>sort</code>, <code>indexOf</code>, <code>join</code> працюють так само. Але <code>push</code> і <code>pop</code> відсутні, бо довжина фіксована. Особливо корисне розрізнення: <code>slice</code> створює <b>копію</b> шматка, а <code>subarray</code> — новий погляд на ту саму пам'ять, тому зміни видно в обох. Створити, наприклад, «перші чотири байти» заголовка без копіювання можна саме через <code>subarray</code>.",
      "Для читання змішаних даних із певним порядком байтів є <code>DataView</code>. Він дозволяє явно вказати, як читати: <code>view.getUint16(0, true)</code> читає два байти як число в порядку «молодший байт першим» (little-endian), а з <code>false</code> — «старший першим» (big-endian). Порядок байтів різниться між протоколами й форматами файлів, тому у двійкових форматах його завжди прописують явно. Рядки в байти й назад перетворюють <code>TextEncoder</code> та <code>TextDecoder</code>.",
      "Де це знадобиться? У роботі з файлами та потоками (<code>fetch</code> повертає <code>arrayBuffer()</code>), у Canvas і WebGL, у криптографії (<code>crypto.getRandomValues</code> заповнює типізований масив), у відео й аудіо, у бібліотеках стиснення. У звичайних вебзастосунках з ними стикаються рідше, проте розуміння, що за «масивами байтів» стоять просто числа у пам'яті, допомагає орієнтуватися в багатьох API. Дуже великі обсяги даних такі масиви обробляють значно швидше за звичайні.",
    ],
    code: [
      String.raw`const bytes = new Uint8Array(4);
bytes[0] = 255;
bytes[1] = 256;      // обгортається: 256 mod 256 = 0
bytes[2] = -1;       // стає 255
bytes[3] = 3.9;      // дріб відсікається
console.log(bytes, bytes.length, Uint8Array.from([1, 2, 3]).map((n) => n * 2));`,
      String.raw`const buffer = new ArrayBuffer(4);
const asBytes = new Uint8Array(buffer);
const asInt = new Int32Array(buffer);
asInt[0] = 0x01020304;
console.log(buffer.byteLength, Array.from(asBytes));
const part = asBytes.subarray(0, 2);
part[0] = 99;
console.log(asBytes[0], asBytes.slice(0, 2)[0]);`,
      String.raw`const view = new DataView(new ArrayBuffer(2));
view.setUint16(0, 0x0102, false);   // big-endian
console.log(view.getUint8(0), view.getUint8(1));
console.log(view.getUint16(0, true));   // ті самі байти як little-endian`,
      String.raw`const encoded = new TextEncoder().encode("Привіт");
console.log(encoded.length, encoded.slice(0, 4));
console.log(new TextDecoder().decode(encoded));
console.log(new Uint8ClampedArray([300, -5, 7.5]));`,
      String.raw`// аварія: довжина типізованого масиву не може бути від'ємною, RangeError
const size = -4;
const data = new Uint8Array(size);
console.log(data.length);`,
    ],
    note: "Типізований масив бачить пам'ять <code>ArrayBuffer</code> під певним кутом, а значення поза діапазоном мовчки обгортаються: <code>300</code> у <code>Uint8Array</code> стає <code>44</code>. <code>subarray</code> ділить пам'ять з оригіналом, а <code>slice</code> копіює.",
    work: "Типізовані масиви потрібні для розбору файлів і мережевих повідомлень, обробки зображень і звуку на Canvas та в WebAudio, шифрування й стиснення. Бібліотеки для відео, ігор і 3D працюють на них щодня.",
    tasks: [
      "Чим ArrayBuffer відрізняється від Uint8Array і що станеться, коли кілька поглядів дивляться на один буфер?",
      "Що збережеться в Uint8Array, якщо записати число 300, і чим subarray відрізняється від slice?",
    ],
  },
  {
    t: "Практика: групування і частотний словник",
    ch: "Колекції",
    easy: "Практика: з'єднуємо все вивчене. Розбити текст на слова, порахувати кожне, розкласти елементи по групах: такі «конвеєри» обробки даних складаються з уже знайомих методів, потрібно лише правильно їх розставити.",
    p: [
      "Задачі на групування та підрахунок трапляються постійно: порахувати, скільки разів зустрічається кожне слово, розкласти замовлення за статусом, зібрати користувачів за містом. Розв'язувати їх зручно за єдиною схемою з чотирьох кроків. Спершу <b>підготувати</b> дані (очистити, привести до нижнього регістру). Далі <b>розкласти</b> їх у словник чи групи. Потім <b>перетворити</b> результат у зручний вигляд (масив пар, відсортований список). Нарешті <b>обрізати</b> до потрібного обсягу (топ-N). Кожен крок — окрема проста операція.",
      "Розбір тексту на слова — перший крок. Простий <code>text.split(\" \")</code> не впорається з розділовими знаками й кількома пробілами. Надійніше застосувати регулярний вираз, що ділить за всім, що не є літерою чи цифрою: <code>text.toLowerCase().split(/[^\\p{L}\\p{N}']+/u)</code>. Позначка <code>\\p{L}</code> означає «будь-яка літера будь-якої мови», тому українські слова обробляються правильно, а прапорець <code>u</code> вмикає підтримку Unicode. Порожні рядки, які можуть з'явитись на краях, відкидаємо через <code>filter(Boolean)</code>.",
      "Другий крок — підрахунок частот. Найнадійніше робити це через <code>Map</code>: <code>counts.set(w, (counts.get(w) ?? 0) + 1)</code>. Звичайний об'єкт теж годиться, але ключі <code>\"constructor\"</code> чи <code>\"toString\"</code> збігаються з успадкованими властивостями, і підрахунок для таких слів «ламається». Тому для невідомих слів надійніший Map або об'єкт без прототипу (<code>Object.create(null)</code>). Якщо ж використовуєте об'єкт і <code>reduce</code>, не забувайте початкове значення та повернення акумулятора.",
      "Третій крок — упорядкувати. Результат <code>Map</code> перетворюють на масив пар <code>[...counts]</code> і сортують: спершу за кількістю за спаданням, потім за словом за алфавітом, щоб порядок рівних значень був стабільним: <code>(a, b) =&gt; b[1] - a[1] || a[0].localeCompare(b[0], \"uk\")</code>. Топ-N беруть через <code>slice(0, n)</code>. Така комбінація — «підрахувати, відсортувати, обрізати» — одна з найпоширеніших у програмуванні.",
      "Групування робиться схоже: для кожного елемента обчислюємо ключ групи й кладемо елемент у відповідний масив. Короткий запис дає оператор присвоєння <code>??=</code>: <code>(groups[key] ??= []).push(item)</code> створює масив лише за потреби. У сучасних середовищах те саме робить <code>Object.groupBy</code>, але ручний варіант корисно знати, бо він працює всюди й дозволяє, наприклад, одразу рахувати підсумки. Зверніть увагу на вхідні дані без потрібного поля: їх треба або пропускати, або класти в окрему групу.",
      "Корисно відразу писати тести для кордонних випадків. Порожній вхід. Один елемент. Однакові значення з різним регістром. Дані з пропущеними полями. Рівні частоти слів. Якщо функція проходить цей мінімальний набір, вона надійна для більшості реальних даних. Другий добрий прийом — розбивати рішення на малі функції (<code>tokenize</code>, <code>countWords</code>, <code>topWords</code>): кожну з них легко перевірити окремо й повторно використати.",
      "І наостанок про помилки на вході. Якщо в <code>countWords</code> прийде <code>null</code> чи число замість рядка, перший же виклик <code>toLowerCase</code> впаде з <code>TypeError</code>. Вирішіть, як ваша функція має реагувати: кинути зрозумілу помилку, повернути порожній результат чи привести значення до рядка. Головне, щоб рішення було свідомим і задокументованим. Практичне завдання нижче якраз про групування: застосуйте цю схему, щоб воно вийшло чистим і коротким.",
    ],
    code: [
      String.raw`const text = "Кіт і пес. Кіт, мов кіт! Пес — це пес.";
const words = text.toLowerCase().split(/[^\p{L}\p{N}']+/u).filter(Boolean);
console.log(words);`,
      String.raw`const words = ["кіт", "пес", "кіт", "миша", "пес", "кіт", "лис"];
const counts = new Map();
for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
const top = [...counts]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "uk"))
  .slice(0, 3);
console.log(top);`,
      String.raw`const orders = [
  { id: 1, status: "new", sum: 100 },
  { id: 2, status: "paid", sum: 250 },
  { id: 3, status: "new", sum: 40 },
  { id: 4, sum: 10 },
];
const groups = {};
for (const order of orders) {
  if (!("status" in order)) continue;
  (groups[order.status] ??= []).push(order.id);
}
console.log(groups);`,
      String.raw`const people = [
  { name: "Оля", city: "Дніпро" },
  { name: "Іван", city: "Львів" },
  { name: "Марія", city: "Дніпро" },
];
const byCity = people.reduce((acc, p) => {
  (acc[p.city] ??= []).push(p.name);
  return acc;
}, {});
const summary = Object.entries(byCity).map(([city, names]) => city + ": " + names.length);
console.log(byCity, summary);
const bad = {};
bad["constructor"] = (bad["constructor"] || 0) + 1;
console.log(typeof bad["constructor"]);`,
      String.raw`// аварія: на вході null, а toLowerCase є лише у рядків, тому функція падає з TypeError
function countWords(text) {
  return text.toLowerCase().split(" ").length;
}
console.log(countWords("один два"));
console.log(countWords(null));`,
    ],
    note: "Схема «підготувати, розкласти, перетворити, обрізати» годиться для більшості задач на підрахунок і групи. Для слів беріть <code>Map</code> (ключ <code>\"constructor\"</code> ламає звичайний об'єкт), а розбір тексту робіть регулярним виразом з <code>\\p{L}</code> і прапорцем <code>u</code>.",
    work: "Частотний словник лежить в основі пошуку й аналітики: хмари слів, популярні запити, підрахунок подій. Групування за категорією, датою чи статусом будує звіти, зведені таблиці й фільтри в кожній адмінці.",
    tasks: [
      "Чому для частотного словника безпечніше брати Map, ніж звичайний об'єкт, і що не так із ключем \"constructor\"?",
      "Як за один прохід розкласти елементи по групах за допомогою оператора ??= і що робити з елементами без потрібного поля?",
    ],
  },
];
