import type { RefSection } from "./types.ts";

const raw = String.raw;
const BT = "`";   // зворотний апостроф для шаблонних рядків (у String.raw його не можна екранувати)
const D = "$";    // знак долара для ${...}

export const js: RefSection[] = [
  { t: "Основи", items: [
    { t: "Вивід і коментарі", code: raw`console.log("Привіт, світе!");   // коментар
console.log(2 + 3, "текст", true);
/* багаторядковий
   коментар */`, note: "`console.log` виводить значення в консоль браузера (F12)." },
    { t: "Підключення до сторінки", code: raw`<script src="app.js" defer></script>`, note: "Скрипт із `defer` виконується після того, як сторінку розібрано." },
  ] },
  { t: "Змінні й типи", items: [
    { t: "let, const", code: raw`let count = 1;        // можна змінювати
const PI = 3.14;      // змінити не можна
count += 1;
console.log(typeof count, typeof "a", typeof true);`, note: "Використовуйте `const` за замовчуванням, `let` лише коли значення змінюється. Старий `var` краще не вживати." },
    { t: "Типи значень", code: raw`let n = 42;          // number
let s = "текст";     // string
let ok = true;       // boolean
let nothing = null;  // навмисно порожньо
let u;               // undefined
console.log(Number("12"), String(5), Boolean(0));`, note: "Усі числа в JavaScript мають тип `number`. Невизначена змінна має значення `undefined`." },
  ] },
  { t: "Оператори", items: [
    { t: "Порівняння", code: raw`console.log(5 === 5, 5 === "5", 5 == "5");   // true false true
console.log(5 !== 6, 3 < 4, "a" < "b");
console.log(true && false, true || false, !true);`, note: "Порівнюйте через `===` і `!==`: вони не перетворюють типи." },
    { t: "?? і ?.", code: raw`const city = user?.address?.city ?? "Невідомо";`, note: "`?.` безпечно читає вкладені поля, `??` підставляє запасне значення для `null` та `undefined`." },
  ] },
  { t: "Рядки", items: [
    { t: "Методи й шаблони", code: raw`const s = "JavaScript";
console.log(s.length, s[0], s.slice(0, 4), s.toUpperCase());
console.log(s.includes("Script"), s.split("a"));
const name = "Олена";
console.log(${BT}Привіт, ${D}{name}! ${D}{2 + 3}${BT});`, note: "Шаблонні рядки в зворотних апострофах підставляють значення через `${...}`." },
  ] },
  { t: "Умови", items: [
    { t: "if, switch, тернарний", code: raw`if (age < 12) {
  console.log("дитина");
} else if (age < 18) {
  console.log("підліток");
} else {
  console.log("дорослий");
}
const kind = age >= 18 ? "дорослий" : "неповнолітній";`, note: "Хибними вважаються `false`, `0`, `\"\"`, `null`, `undefined` і `NaN`, усе інше істинне." },
  ] },
  { t: "Цикли", items: [
    { t: "for, while, for...of", code: raw`for (let i = 0; i < 3; i++) {
  console.log(i);
}
let n = 0;
while (n < 3) n++;
for (const x of [10, 20, 30]) {
  console.log(x);
}`, note: "`for...of` перебирає значення масиву, `for...in` перебирає ключі об'єкта." },
  ] },
  { t: "Масиви", items: [
    { t: "Основні методи", code: raw`const a = [3, 1, 2];
a.push(5);
console.log(a.length, a[0], a.includes(2));
console.log(a.slice(1, 3), a.indexOf(2));
a.sort((x, y) => x - y);`, note: "Методи `push` та `pop` змінюють масив, а `slice` повертає копію частини." },
    { t: "map, filter, reduce", code: raw`const nums = [1, 2, 3, 4];
const doubled = nums.map((x) => x * 2);
const even = nums.filter((x) => x % 2 === 0);
const sum = nums.reduce((acc, x) => acc + x, 0);
const first = nums.find((x) => x > 2);`, note: "Ці методи не змінюють вихідний масив, а повертають новий результат." },
  ] },
  { t: "Об'єкти", items: [
    { t: "Створення й доступ", code: raw`const user = { name: "Олена", age: 16 };
user.city = "Дніпро";
console.log(user.name, user["age"]);
console.log(Object.keys(user), Object.entries(user));
const { name, age } = user;          // деструктуризація
const copy = { ...user, age: 17 };   // копія зі змінами`, note: "Оператор `...` розгортає масив або об'єкт, зручний для копіювання." },
  ] },
  { t: "Функції", items: [
    { t: "Три способи запису", code: raw`function add(a, b = 0) {
  return a + b;
}
const mul = function (a, b) { return a * b; };
const sq = (x) => x * x;
console.log(add(2, 3), mul(2, 3), sq(4));`, note: "Стрілкові функції зручні для коротких колбеків." },
    { t: "Замикання", code: raw`function counter() {
  let n = 0;
  return () => ++n;
}
const next = counter();
console.log(next(), next());   // 1 2`, note: "Внутрішня функція пам'ятає змінні, що були поруч під час її створення." },
  ] },
  { t: "DOM", items: [
    { t: "Пошук і зміна елементів", code: raw`const title = document.querySelector("h1");
title.textContent = "Новий заголовок";
title.classList.add("active");
const items = document.querySelectorAll(".item");
items.forEach((el) => el.setAttribute("hidden", ""));`, note: "`textContent` безпечніший за `innerHTML`, коли в тексті є дані від користувача." },
    { t: "Події", code: raw`const btn = document.querySelector("#btn");
btn.addEventListener("click", (e) => {
  console.log("Клік!", e.target);
});
form.addEventListener("submit", (e) => e.preventDefault());`, note: "`addEventListener` підписує функцію на подію. Типові події: `click`, `input`, `submit`, `keydown`." },
  ] },
  { t: "Асинхронність", items: [
    { t: "Promise і async/await", code: raw`async function load() {
  try {
    const res = await fetch("/api/items");
    if (!res.ok) throw new Error("Помилка " + res.status);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err.message);
  }
}
setTimeout(() => console.log("через секунду"), 1000);`, note: "`await` чекає на результат, не блокуючи сторінку. Помилки ловлять через `try/catch`." },
  ] },
  { t: "Модулі й JSON", items: [
    { t: "import / export", code: raw`// math.js
export const add = (a, b) => a + b;
export default function hello() {}

// app.js
import hello, { add } from "./math.js";`, note: "Скрипти з `import` підключають через `<script type=\"module\">`." },
    { t: "JSON і сховище", code: raw`const text = JSON.stringify({ a: 1 });
const obj = JSON.parse(text);
localStorage.setItem("theme", "dark");
console.log(localStorage.getItem("theme"));`, note: "`localStorage` зберігає лише рядки, тому об'єкти перетворюють через JSON." },
  ] },
];
