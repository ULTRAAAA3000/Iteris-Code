const raw = String.raw;

export const SOLUTIONS_05 = {
  "js-range-iterable": raw`function range(start, end, step = 1) {
  if (step === 0) throw new RangeError("Крок не може дорівнювати нулю");
  return {
    *[Symbol.iterator]() {
      for (let n = start; step > 0 ? n < end : n > end; n += step) yield n;
    },
  };
}`,
  "js-generators-kit": raw`function* fibonacci() {
  let a = 0;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function* take(iterable, n) {
  if (n <= 0) return;
  let count = 0;
  for (const value of iterable) {
    yield value;
    if (++count >= n) return;
  }
}`,
  "js-money-primitive": raw`class Money {
  constructor(amount) {
    this.amount = amount;
  }
  [Symbol.toPrimitive](hint) {
    return hint === "string" ? this.amount.toFixed(2) + " грн" : this.amount;
  }
  get [Symbol.toStringTag]() {
    return "Money";
  }
}`,
  "js-pipe-curry": raw`function pipe(...fns) {
  return (x) => fns.reduce((acc, fn) => fn(acc), x);
}

function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
}`,
  "js-memoize-once": raw`function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}`,
  "js-lazy-loader": raw`function createLazy(loader) {
  let promise = null;
  return () => {
    if (!promise) {
      promise = Promise.resolve()
        .then(loader)
        .catch((error) => {
          promise = null;
          throw error;
        });
    }
    return promise;
  };
}`,
  "js-proxy-kit": raw`function withDefault(obj, fallback) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      return key in target ? Reflect.get(target, key, receiver) : fallback;
    },
  });
}

function readOnly(obj) {
  return new Proxy(obj, {
    set() {
      throw new TypeError("Об'єкт лише для читання");
    },
    deleteProperty() {
      throw new TypeError("Об'єкт лише для читання");
    },
  });
}`,
  "js-reflect-log": raw`function logged(target, log) {
  return new Proxy(target, {
    get(t, key, receiver) {
      log.push("get " + String(key));
      return Reflect.get(t, key, receiver);
    },
    set(t, key, value, receiver) {
      log.push("set " + String(key));
      return Reflect.set(t, key, value, receiver);
    },
    has(t, key) {
      log.push("has " + String(key));
      return Reflect.has(t, key);
    },
    deleteProperty(t, key) {
      log.push("delete " + String(key));
      return Reflect.deleteProperty(t, key);
    },
  });
}`,
  "js-shape-check": raw`function matchesType(value, type) {
  if (type === "any") return true;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return typeof value === "object" && value !== null && !Array.isArray(value);
  return typeof value === type;
}

function matchesShape(value, shape) {
  if (typeof value !== "object" || value === null) return false;
  return Object.entries(shape).every(([key, expected]) =>
    typeof expected === "string" ? matchesType(value[key], expected) : matchesShape(value[key], expected),
  );
}`,
  "js-parse-jsdoc": raw`function parseJsDoc(text) {
  const params = [];
  for (const m of text.matchAll(/@param\s+\{([^}]*)\}\s+\[?([\w$.]+)/g)) {
    params.push({ type: m[1].trim(), name: m[2] });
  }
  const ret = /@returns?\s+\{([^}]*)\}/.exec(text);
  return { params, returns: ret ? ret[1].trim() : null };
}`,
  "js-html-tag": raw`function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

function html(strings, ...values) {
  return strings.reduce(
    (out, part, i) => out + part + (i < values.length ? escapeHtml(values[i]) : ""),
    "",
  );
}`,
  "js-lazy-pipeline": raw`function firstEvenSquares(iterable, n) {
  const result = [];
  if (n <= 0) return result;
  for (const value of iterable) {
    if (value % 2 === 0) {
      result.push(value * value);
      if (result.length === n) break;
    }
  }
  return result;
}`,
};
