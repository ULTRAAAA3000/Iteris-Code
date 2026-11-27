// Еталонні рішення завдань. Використовуються лише в тестах і НЕ потрапляють у збірку сайту.
// Еталони віддалених завдань лежать окремо по мовах: tests/solutions/<мова>.mjs
import { BASH } from "./solutions/bash.mjs";
import { CPP } from "./solutions/cpp.mjs";
import { CSS } from "./solutions/css.mjs";
import { C_SOLUTIONS } from "./solutions/c.mjs";
import { GO_SOLUTIONS } from "./solutions/go.mjs";
import { HTML } from "./solutions/html.mjs";
import { JAVA } from "./solutions/java.mjs";
import { JS } from "./solutions/js.mjs";
import { PASCAL } from "./solutions/pascal.mjs";
import { PHP } from "./solutions/php.mjs";
import { PYTHON } from "./solutions/python.mjs";
import { SQL } from "./solutions/sql.mjs";
import { TS } from "./solutions/ts.mjs";

export const SOLUTIONS = { ...C_SOLUTIONS, ...GO_SOLUTIONS, ...PYTHON, ...JAVA, ...CPP, ...PHP, ...PASCAL, ...TS, ...JS, ...HTML, ...CSS, ...SQL, ...BASH };

// Еталонні рішення проєктів за ТЗ (HTML, CSS і JS в одному файлі)
export const PROJECT_SOLUTIONS = {
  "js-todo": `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8">
  <title>Список справ</title>
  <style>
    body { font-family: sans-serif; max-width: 420px; margin: 24px auto; padding: 0 16px; }
    ul { list-style: none; padding: 0; }
    li { display: flex; justify-content: space-between; gap: 8px; padding: 6px 0; cursor: pointer; }
    li.done span { text-decoration: line-through; color: #888; }
  </style>
</head>
<body>
  <h1>Список справ</h1>
  <input id="task-input" type="text" placeholder="Нова справа">
  <button id="add-btn">Додати</button>
  <ul id="task-list"></ul>
  <p id="counter">Залишилось: 0</p>
  <script>
    const input = document.getElementById("task-input");
    const list = document.getElementById("task-list");
    const counter = document.getElementById("counter");
    const update = () => { counter.textContent = "Залишилось: " + list.querySelectorAll("li:not(.done)").length; };
    document.getElementById("add-btn").addEventListener("click", () => {
      const value = input.value.trim();
      if (!value) return;
      const li = document.createElement("li");
      const span = document.createElement("span");
      const del = document.createElement("button");
      span.textContent = value;
      del.textContent = "×";
      del.className = "del";
      li.append(span, del);
      list.append(li);
      input.value = "";
      update();
    });
    list.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;
      if (e.target.closest(".del")) li.remove(); else li.classList.toggle("done");
      update();
    });
  </script>
</body>
</html>
`,
};
