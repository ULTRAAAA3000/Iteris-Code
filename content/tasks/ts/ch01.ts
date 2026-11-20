// Завдання глави 1 «Початок» (уроки 1–4). Еталони: tests/solutions/ts-ch01.mjs
import type { RemoteTask } from "../../../src/tasks/types.ts";
import { base } from "./base.ts";

const raw = String.raw;

export const TASKS_01: readonly RemoteTask[] = [
  {
    ...base, id: "ts-hello-types", lesson: "ts/1", xp: 15,
    title: "Перший запуск і перша помилка типу",
    context: "Головна відмінність TypeScript: помилку типу видно ще до запуску програми. Компілятор не дасть записати число в змінну, оголошену як рядок, а повідомлення в терміналі підкаже, де саме помилка.",
    brief: [
      "У заготовці змінна <code>greeting</code> оголошена як <code>string</code>, але їй присвоєно число, тому код не компілюється. Запустіть, прочитайте помилку в терміналі й виправте її.",
      "Запишіть у змінну рядок <code>Привіт, TypeScript!</code>, тип змінної лишіть <code>string</code>. Програма має вивести цей рядок.",
    ],
    starter: raw`const greeting: string = 42;

console.log(greeting);
`,
    checks: [
      { on: "stdout", name: "Виводить «Привіт, TypeScript!»", has: "Привіт, TypeScript!", hint: "Рядок записується в лапках: \"Привіт, TypeScript!\"." },
      { on: "stdout", name: "Нічого зайвого у виводі", equals: "Привіт, TypeScript!", hint: "Виводьте лише змінну greeting, без додаткових рядків." },
      { on: "source", name: "Змінна лишилась типу string", matches: "greeting\\s*:\\s*string", hint: "Змінюйте значення, а не тип: greeting має бути оголошена як string." },
    ],
  },
  {
    ...base, id: "ts-annotate-js", lesson: "ts/2", xp: 15,
    title: "Із JavaScript у TypeScript: додайте типи",
    context: "Перехід на TypeScript починається з анотацій типів параметрів і результату функцій. Після цього компілятор ловить виклики з неправильними аргументами ще до того, як код потрапить до користувачів.",
    brief: [
      "Функції <code>add</code> і <code>shout</code> написані як звичайний JavaScript, і в суворому режимі вони не компілюються. Додайте типи: <code>add(a: number, b: number): number</code> та <code>shout(text: string): string</code>.",
      "Програма має вивести <code>5</code> і <code>HELLO!</code>, кожне з нового рядка.",
    ],
    starter: raw`function add(a, b) {
  return a + b;
}

function shout(text) {
  return text.toUpperCase() + "!";
}

console.log(add(2, 3));
console.log(shout("hello"));
`,
    checks: [
      { on: "stdout", name: "Виводить 5 і HELLO!", equals: "5\nHELLO!", hint: "Спершу має бути 5, а на другому рядку HELLO!." },
      { on: "source", name: "Параметри add мають тип number, результат теж", matches: "add\\s*\\(\\s*a\\s*:\\s*number\\s*,\\s*b\\s*:\\s*number\\s*\\)\\s*:\\s*number", hint: "Запишіть так: function add(a: number, b: number): number." },
      { on: "source", name: "Параметр shout має тип string, результат теж", matches: "shout\\s*\\(\\s*text\\s*:\\s*string\\s*\\)\\s*:\\s*string", hint: "Запишіть так: function shout(text: string): string." },
    ],
  },
  {
    ...base, id: "ts-runtime-check", lesson: "ts/3", xp: 20,
    title: "Перевірка типу під час виконання",
    context: "Типи стираються під час компіляції, тому дані ззовні (з мережі, з файлу, від користувача) перевіряють у коді. Функція-перевірка це перший захисний рубіж, який ловить сміття до того, як воно зіпсує обчислення.",
    brief: [
      "Допишіть <code>isPositiveNumber(value: unknown): boolean</code>: вона повертає <code>true</code> лише для чисел, що більші за нуль. Рядки, <code>null</code>, від'ємні числа, нуль і <code>NaN</code> дають <code>false</code>.",
      "Скористайтеся <code>typeof</code> для перевірки типу значення, адже саме так перевіряють під час виконання. Програма друкує результат для шести значень.",
    ],
    starter: raw`function isPositiveNumber(value: unknown): boolean {
  // TODO: true лише для чисел більших за нуль
  return false;
}

const samples: unknown[] = [5, -1, "7", NaN, null, 0.5];
for (const value of samples) {
  console.log(isPositiveNumber(value));
}
`,
    checks: [
      { on: "stdout", name: "Для 5 і 0.5 повертається true, для решти false", equals: "true\nfalse\nfalse\nfalse\nfalse\ntrue", hint: "Рядок \"7\" і NaN не повинні проходити, а 5 і 0.5 повинні." },
      { on: "source", name: "Використано typeof", matches: "typeof\\s+value\\s*===\\s*[\"']number[\"']", hint: "Перевірте тип: typeof value === \"number\"." },
      { on: "source", name: "NaN відсіюється", matches: "Number\\.isNaN|isNaN|value\\s*>\\s*0", hint: "NaN > 0 дає false, тож умова value > 0 його вже відсіє." },
    ],
  },
  {
    ...base, id: "ts-strict-fix", lesson: "ts/4", xp: 20,
    title: "Виправте помилки суворого режиму",
    context: "У суворому режимі компілятор не дозволяє неявний any і не пускає null у змінні для рядків. Саме ці дві помилки найчастіше зустрічаються під час переходу старого коду на TypeScript.",
    brief: [
      "У заготовці дві помилки суворого режиму: параметр <code>x</code> без типу та змінна <code>title</code> типу <code>string</code>, яка отримує <code>null</code>.",
      "Опишіть <code>x</code> як <code>number</code>, а тип <code>title</code> зробіть <code>string | null</code>. Результат: <code>42</code> і <code>Готово</code>.",
    ],
    starter: raw`function double(x) {
  return x * 2;
}

let title: string = null;

console.log(double(21));
title = "Готово";
console.log(title);
`,
    checks: [
      { on: "stdout", name: "Виводить 42 і Готово", equals: "42\nГотово", hint: "Спершу double(21), потім значення title." },
      { on: "source", name: "Параметр x має тип number", matches: "double\\s*\\(\\s*x\\s*:\\s*number", hint: "Запишіть function double(x: number)." },
      { on: "source", name: "title може бути рядком або null", matches: "title\\s*:\\s*string\\s*\\|\\s*null", hint: "Запишіть тип як string | null." },
    ],
  },
];
