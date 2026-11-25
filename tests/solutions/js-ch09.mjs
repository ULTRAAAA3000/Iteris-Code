const raw = String.raw;

export const SOLUTIONS_09 = {
  "js-find-cycle": raw`function findCycle(deps) {
  const state = new Map();
  const path = [];
  function visit(name) {
    if (state.get(name) === "done") return null;
    if (state.get(name) === "visiting") return [...path.slice(path.indexOf(name)), name];
    state.set(name, "visiting");
    path.push(name);
    for (const dep of deps[name] ?? []) {
      const cycle = visit(dep);
      if (cycle) return cycle;
    }
    path.pop();
    state.set(name, "done");
    return null;
  }
  for (const name of Object.keys(deps)) {
    const cycle = visit(name);
    if (cycle) return cycle;
  }
  return null;
}

function loadConfig(env) {
  const required = ["DATABASE_URL"];
  const missing = required.filter((name) => !env[name]);
  if (missing.length > 0) throw new Error("Не задано змінні середовища: " + missing.join(", "));
  return {
    databaseUrl: env.DATABASE_URL,
    port: Number(env.PORT ?? 3000),
    mode: env.NODE_ENV === "production" ? "production" : "development",
  };
}`,
  "js-mini-expect": raw`function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
}

function makeMatchers(actual, negate) {
  const check = (pass, message) => {
    if (pass === negate) throw new Error((negate ? "not " : "") + message);
  };
  return {
    toBe(expected) {
      check(Object.is(actual, expected), "toBe: очікували " + String(expected) + ", отримали " + String(actual));
    },
    toEqual(expected) {
      check(deepEqual(actual, expected), "toEqual: значення не збігаються");
    },
    toThrow(expected) {
      let thrown;
      let didThrow = false;
      try {
        actual();
      } catch (error) {
        didThrow = true;
        thrown = error;
      }
      let pass = didThrow;
      if (didThrow && typeof expected === "string") pass = String(thrown?.message ?? thrown).includes(expected);
      else if (didThrow && typeof expected === "function") pass = thrown instanceof expected;
      check(pass, "toThrow: функція не кинула очікуваної помилки");
    },
  };
}

function myExpect(actual) {
  return { ...makeMatchers(actual, false), not: makeMatchers(actual, true) };
}`,
  "js-spy": raw`function createSpy(impl = () => undefined) {
  let fixed;
  let hasFixed = false;
  const spy = function (...args) {
    spy.calls.push(args);
    const result = hasFixed ? fixed : impl.apply(this, args);
    spy.results.push(result);
    return result;
  };
  spy.calls = [];
  spy.results = [];
  spy.mockReturnValue = (value) => {
    fixed = value;
    hasFixed = true;
  };
  spy.reset = () => {
    spy.calls = [];
    spy.results = [];
  };
  return spy;
}

function spyOn(obj, method) {
  const original = obj[method];
  if (typeof original !== "function") throw new TypeError("Метод " + method + " не знайдено");
  const spy = createSpy(function (...args) {
    return original.apply(this, args);
  });
  spy.restore = () => {
    obj[method] = original;
  };
  obj[method] = spy;
  return spy;
}`,
  "js-string-calculator": raw`function add(text) {
  let delimiter = /[,\n]/;
  let body = text;
  if (text.startsWith("//")) {
    const end = text.indexOf("\n");
    const custom = text.slice(2, end);
    delimiter = new RegExp(custom.replace(/[.*+?^$()[\]{}|\\]/g, "\\$&"));
    body = text.slice(end + 1);
  }
  if (body === "") return 0;
  const numbers = body.split(delimiter).map(Number);
  const negatives = numbers.filter((n) => n < 0);
  if (negatives.length > 0) throw new Error("Від'ємні числа заборонені: " + negatives.join(", "));
  return numbers.filter((n) => n <= 1000).reduce((a, b) => a + b, 0);
}`,
  "js-fake-timers": raw`function createFakeClock() {
  let time = 0;
  let nextId = 1;
  const timers = new Map();
  return {
    now: () => time,
    setTimeout(fn, ms = 0) {
      const id = nextId++;
      timers.set(id, { id, fn, at: time + ms });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    tick(ms) {
      const end = time + ms;
      for (;;) {
        let next = null;
        for (const t of timers.values()) {
          if (t.at <= end && (!next || t.at < next.at || (t.at === next.at && t.id < next.id))) next = t;
        }
        if (!next) break;
        timers.delete(next.id);
        time = next.at;
        next.fn();
      }
      time = end;
    },
  };
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
