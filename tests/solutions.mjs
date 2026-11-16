// Еталонні рішення завдань. Використовуються лише в тестах і НЕ потрапляють у збірку сайту.
export const SOLUTIONS = {
  "js-safe-city": `function getCity(user) {
  return user?.address?.city || "Невідомо";
}`,
  "js-counter-bug": `function makeCounter() {
  let count = 0;
  return {
    inc() { count++; return count; },
    get() { return count; },
    reset() { count = 0; },
  };
}`,
  "js-cart-total": `function calculateTotal(items) {
  const sum = items
    .filter((i) => i.inStock !== false)
    .reduce((s, i) => s + i.price * (i.qty ?? 1), 0);
  return Math.round(sum * 100) / 100;
}`,
  "js-group-by": `function groupBy(list, key) {
  const out = {};
  for (const item of list) {
    if (!(key in item)) continue;
    (out[item[key]] ??= []).push(item);
  }
  return out;
}`,
  "js-retry": `async function retry(fn, attempts) {
  if (!Number.isInteger(attempts) || attempts < 1) throw new RangeError("attempts має бути цілим числом ≥ 1");
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(i); } catch (e) { lastError = e; }
  }
  throw lastError;
}`,
};

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
