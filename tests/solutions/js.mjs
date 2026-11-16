// Еталонні рішення завдань JavaScript (id завдання -> код). У сайт не потрапляють
const raw = String.raw;

export const JS = {
  "js-hello-default": raw`function hello(name = "світе") {
  return "Привіт, " + name + "!";
}`,
  "js-type-of": raw`function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
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
  "js-function-tools": raw`function makeAdder(n) {
  return function (x) {
    return x + n;
  };
}

function applyTwice(fn, x) {
  return fn(fn(x));
}`,
  "js-format-price": raw`function formatPrice(n) {
  const [whole, frac] = n.toFixed(2).split(".");
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return spaced + "," + frac + " грн";
}`,
  "js-chunk-unique": raw`function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function unique(arr) {
  return [...new Set(arr)];
}`,
  "js-word-map": raw`function wordFrequency(text) {
  const map = new Map();
  for (const word of text.toLowerCase().split(/\s+/).filter(Boolean)) {
    map.set(word, (map.get(word) || 0) + 1);
  }
  return map;
}`,
  "js-dates": raw`function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

function isWeekend(dateStr) {
  const d = new Date(dateStr).getUTCDay();
  return d === 0 || d === 6;
}`,
  "js-stack-class": raw`class Stack {
  #items = [];

  push(x) {
    this.#items.push(x);
    return this.#items.length;
  }

  pop() {
    return this.#items.pop();
  }

  peek() {
    return this.#items[this.#items.length - 1];
  }

  get size() {
    return this.#items.length;
  }
}`,
  "js-validate-age": raw`class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateAge(age) {
  if (!Number.isInteger(age) || age < 0 || age > 150) throw new ValidationError("Некоректний вік");
  return age;
}

function parseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, error: "Некоректний JSON" };
  }
}`,
  "js-settings-storage": raw`function saveSettings(storage, settings) {
  storage.setItem("settings", JSON.stringify(settings));
}

function loadSettings(storage) {
  const fallback = { theme: "light", lang: "uk" };
  const text = storage.getItem("settings");
  if (text === null) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}`,
  "js-delay-timeout": raw`function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function withTimeout(promise, ms) {
  const timer = new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
  return Promise.race([promise, timer]);
}`,
  "js-api-client": raw`async function getUser(fetchFn, id) {
  const res = await fetchFn("/api/users/" + id);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

async function createUser(fetchFn, data) {
  const res = await fetchFn("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}`,
  "js-fix-average": raw`function average(nums) {
  if (nums.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  return sum / nums.length;
}`,
};
