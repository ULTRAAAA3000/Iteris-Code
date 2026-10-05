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
