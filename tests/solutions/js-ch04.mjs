const raw = String.raw;

export const SOLUTIONS_04 = {
  "js-calculator": raw`function createCalculator(start = 0) {
  return {
    value: start,
    add(n) {
      this.value += n;
      return this;
    },
    subtract(n) {
      this.value -= n;
      return this;
    },
    multiply(n) {
      this.value *= n;
      return this;
    },
    result() {
      return this.value;
    },
  };
}`,
  "js-proto-chain": raw`function chainLength(obj) {
  let length = 0;
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    length++;
    proto = Object.getPrototypeOf(proto);
  }
  return length;
}

function hasInherited(obj, key) {
  return key in obj && !Object.hasOwn(obj, key);
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
  "js-bank-account": raw`class Account {
  static count = 0;
  #balance = 0;

  constructor() {
    Account.count++;
  }

  deposit(n) {
    if (typeof n !== "number" || !(n > 0)) throw new RangeError("Сума має бути додатною");
    this.#balance += n;
    return this;
  }

  withdraw(n) {
    if (typeof n !== "number" || !(n > 0)) throw new RangeError("Сума має бути додатною");
    if (n > this.#balance) throw new Error("Недостатньо коштів");
    this.#balance -= n;
    return this;
  }

  getBalance() {
    return this.#balance;
  }
}`,
  "js-shapes": raw`class Shape {
  constructor(name) {
    this.name = name;
  }
  area() {
    throw new Error("не реалізовано");
  }
  describe() {
    return this.name + ": " + this.area().toFixed(2);
  }
}

class Rectangle extends Shape {
  constructor(w, h) {
    super("прямокутник");
    this.w = w;
    this.h = h;
  }
  area() {
    return this.w * this.h;
  }
}

class Circle extends Shape {
  constructor(r) {
    super("коло");
    this.r = r;
  }
  area() {
    return Math.PI * this.r ** 2;
  }
}

function totalArea(shapes) {
  return shapes.reduce((sum, shape) => sum + shape.area(), 0);
}`,
  "js-temperature": raw`class Temperature {
  #celsius = 0;

  constructor(celsius) {
    this.celsius = celsius;
  }

  get celsius() {
    return this.#celsius;
  }
  set celsius(value) {
    if (typeof value !== "number" || value < -273.15) throw new RangeError("Нижче абсолютного нуля");
    this.#celsius = value;
  }

  get fahrenheit() {
    return (this.#celsius * 9) / 5 + 32;
  }
  set fahrenheit(value) {
    this.celsius = ((value - 32) * 5) / 9;
  }
}`,
  "js-deep-equal": raw`function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
}`,
  "js-counter-factory": raw`function createCounter(start = 0) {
  let current = start;
  const log = [];
  const change = (delta) => {
    current += delta;
    log.push(current);
    return current;
  };
  return {
    inc: () => change(1),
    dec: () => change(-1),
    value: () => current,
    history: () => [...log],
  };
}`,
  "js-lru-cache": raw`class LRUCache {
  constructor(limit) {
    this.limit = limit;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
  set(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.limit) {
      this.map.delete(this.map.keys().next().value);
    }
  }
  get size() {
    return this.map.size;
  }
}`,
};
