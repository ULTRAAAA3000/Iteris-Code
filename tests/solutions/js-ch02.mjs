const raw = String.raw;

export const SOLUTIONS_02 = {
  "js-fib-let": raw`function fib(n) {
  let previous = 0;
  let current = 1;
  for (let i = 0; i < n; i++) {
    [previous, current] = [current, previous + current];
  }
  return previous;
}`,
  "js-type-of": raw`function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}`,
  "js-cart-total": raw`function calculateTotal(items) {
  const sum = items
    .filter((i) => i.inStock !== false)
    .reduce((s, i) => s + i.price * (i.qty ?? 1), 0);
  return Math.round(sum * 100) / 100;
}`,
  "js-format-price": raw`function formatPrice(n) {
  const [whole, frac] = n.toFixed(2).split(".");
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return spaced + "," + frac + " грн";
}`,
  "js-to-number": raw`function toNumberStrict(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value !== "string") return NaN;
  const text = value.trim();
  if (text === "") return NaN;
  const n = Number(text);
  return Number.isFinite(n) ? n : NaN;
}`,
  "js-safe-city": raw`function getCity(user) {
  return user?.address?.city || "Невідомо";
}`,
  "js-fizzbuzz": raw`function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(i);
  }
  return result;
}`,
  "js-find-cell": raw`function findCell(matrix, value) {
  let result = null;
  search: for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] === value) {
        result = [row, col];
        break search;
      }
    }
  }
  return result;
}`,
  "js-function-tools": raw`function makeAdder(n) {
  return function (x) {
    return x + n;
  };
}

function applyTwice(fn, x) {
  return fn(fn(x));
}`,
  "js-params-kit": raw`function sumAll(...numbers) {
  let total = 0;
  for (const n of numbers) total += n;
  return total;
}

function createUser({ name, role = "user", active = true } = {}) {
  return { name, role, active };
}`,
  "js-callbacks-kit": raw`function times(n, fn) {
  const results = [];
  for (let i = 0; i < n; i++) results.push(fn(i));
  return results;
}

function makeMultiplier(k) {
  return (x) => x * k;
}`,
  "js-counter-bug": raw`function makeCounter() {
  let count = 0;
  return {
    inc() { count++; return count; },
    get() { return count; },
    reset() { count = 0; },
  };
}`,
  "js-tdz-fix": raw`function describeTotal(prices) {
  const total = prices.reduce((sum, price) => sum + price, 0);
  const message = "Разом: " + total;
  return message;
}`,
  "js-tree-kit": raw`function treeDepth(node) {
  let deepest = 0;
  for (const child of node.children) deepest = Math.max(deepest, treeDepth(child));
  return deepest + 1;
}

function countLeaves(node) {
  if (node.children.length === 0) return 1;
  let total = 0;
  for (const child of node.children) total += countLeaves(child);
  return total;
}`,
};
