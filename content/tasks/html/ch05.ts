// Завдання курсу HTML, глава 05 «Таблиці» (уроки 18–20). Виконуються в браузері (runtime: "page"), еталони: tests/solutions/html-ch05.mjs.
import type { PageTask } from "../../../src/tasks/types.ts";

const base = { course: "html", runtime: "page", edit: "html", file: "index.html", editorLang: "html", premium: false } as const;

export const TASKS_05: readonly PageTask[] = [
  {
    ...base, id: "html-table-basic", lesson: "html/18", xp: 20,
    title: "Розклад занять у таблиці",
    context: "Розклад це класичні табличні дані: за двома осями (день і урок) лежать значення. Заголовки в th зроблять таблицю зрозумілою й програмам читання.",
    brief: [
      "Побудуйте таблицю розкладу з трьох стовпців і трьох рядків. Перший рядок містить заголовки <code>&lt;th&gt;</code>: порожній кут, «Пн», «Вт». Два наступні рядки починаються з заголовка рядка <code>&lt;th&gt;</code> («1 урок», «2 урок»), далі клітинки <code>&lt;td&gt;</code>: Математика, Історія, Фізика й порожня клітинка в кінці.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Розклад</title></head>
<body>
  <h1>Розклад</h1>
  Пн Вт
  1 урок Математика Історія
  2 урок Фізика
</body>
</html>
`,
    checks: [
      { name: "Таблиця з трьох рядків", selector: "table tr", count: 3 },
      { name: "Заголовки стовпців: «Пн» і «Вт»", selector: "tr:first-child th", text: "Пн" },
      { name: "Заголовки рядків «1 урок» і «2 урок»", selector: "tbody th, tr th", text: "2 урок" },
      { name: "Усього п'ять заголовків th (кут, Пн, Вт, 1 урок, 2 урок)", selector: "th", count: 5 },
      { name: "Клітинки з даними td: четири штуки", selector: "td", count: 4 },
      { name: "Клітинка «Фізика» в таблиці", selector: "td", text: "Фізика" },
    ],
  },
  {
    ...base, id: "html-table-structure", lesson: "html/19", xp: 30,
    title: "Прайс із підписом, секціями й підсумком",
    context: "Рахунок або прайс має підпис, шапку, тіло та підсумок. Саме така структура дозволяє друкувати шапку на кожній сторінці й оформляти секції окремо.",
    brief: [
      "Зберіть таблицю: <code>&lt;caption&gt;</code> «Ціни на товари», <code>&lt;thead&gt;</code> із заголовками «Товар», «Кількість», «Ціна», <code>&lt;tbody&gt;</code> із двома рядками товарів і <code>&lt;tfoot&gt;</code> з рядком «Разом» (клітинка на два стовпці через <code>colspan=\"2\"</code>) та сумою «2850 грн».",
      "Рядки шапки й тіла перебудуйте так, щоб у шапці були саме клітинки <code>&lt;th&gt;</code>.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Прайс</title></head>
<body>
  <h1>Прайс</h1>
  <table>
    <tr><td>Товар</td><td>Кількість</td><td>Ціна</td></tr>
    <tr><td>Навушники</td><td>2</td><td>2400 грн</td></tr>
    <tr><td>Мишка</td><td>1</td><td>450 грн</td></tr>
    <tr><td>Разом</td><td>2850 грн</td></tr>
  </table>
</body>
</html>
`,
    checks: [
      { name: "Підпис таблиці caption «Ціни на товари»", selector: "table > caption", text: "Ціни на товари" },
      { name: "Шапка thead із трьома заголовками th", selector: "table > thead th", count: 3 },
      { name: "Тіло tbody із двома рядками товарів", selector: "table > tbody > tr", count: 2 },
      { name: "Підсумок tfoot із написом «Разом»", selector: "table > tfoot td", text: "Разом" },
      { name: "Клітинка «Разом» об'єднана на два стовпці (colspan=2)", selector: "tfoot td[colspan=\"2\"]" },
      { name: "Підсумкова сума 2850 грн у tfoot", selector: "tfoot", text: "2850 грн" },
    ],
  },
  {
    ...base, id: "html-table-a11y", lesson: "html/20", xp: 30,
    title: "Доступна таблиця продажів",
    context: "Програма читання озвучує клітинку разом зі своїми заголовками лише тоді, коли зв'язки задано в розмітці: через th, scope і caption.",
    brief: [
      "Перероблена таблиця має мати <code>&lt;caption&gt;</code> «Продажі за кварталами». Заголовки стовпців «Квартал» і «Виручка» зробіть через <code>&lt;th scope=\"col\"&gt;</code>, а назви кварталів Q1, Q2, Q3 у перших клітинках рядків через <code>&lt;th scope=\"row\"&gt;</code>. Дані виручки залиште в <code>&lt;td&gt;</code>.",
      "Огорніть таблицю в контейнер <code>&lt;div role=\"region\" aria-label=\"Таблиця продажів\" tabindex=\"0\"&gt;</code>, щоб широку таблицю можна було прокручувати з клавіатури.",
    ],
    starter: `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>Продажі</title></head>
<body>
  <table>
    <tr><td><b>Квартал</b></td><td><b>Виручка</b></td></tr>
    <tr><td>Q1</td><td>120 тис.</td></tr>
    <tr><td>Q2</td><td>150 тис.</td></tr>
    <tr><td>Q3</td><td>170 тис.</td></tr>
  </table>
</body>
</html>
`,
    checks: [
      { name: "Підпис caption «Продажі за кварталами»", selector: "table > caption", text: "Продажі за кварталами" },
      { name: "Два заголовки стовпців із scope=\"col\"", selector: "th[scope=\"col\"]", count: 2 },
      { name: "Три заголовки рядків із scope=\"row\" (Q1, Q2, Q3)", selector: "th[scope=\"row\"]", count: 3 },
      { name: "Клітинки виручки лишились td", selector: "td", count: 3 },
      { name: "Контейнер role=region з aria-label", selector: "div[role=\"region\"][aria-label=\"Таблиця продажів\"]" },
      { name: "Контейнер доступний із клавіатури (tabindex=0)", selector: "div[role=\"region\"][tabindex=\"0\"] > table" },
    ],
  },
];
