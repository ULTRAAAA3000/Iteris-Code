const raw = String.raw;

export const SOLUTIONS_11 = {
  "js-layered-todo": raw`function createMemoryRepository() {
  const items = new Map();
  return {
    all: () => [...items.values()],
    find: (id) => items.get(id) ?? null,
    save(item) {
      items.set(item.id, item);
      return item;
    },
    remove: (id) => items.delete(id),
  };
}

function createTodoService(repository, nextId) {
  return {
    add(title) {
      const clean = String(title).trim();
      if (clean === "") throw new RangeError("Назва не може бути порожньою");
      return repository.save({ id: nextId(), title: clean, done: false });
    },
    toggle(id) {
      const todo = repository.find(id);
      if (!todo) throw new Error("Справу не знайдено: " + id);
      return repository.save({ ...todo, done: !todo.done });
    },
    remove(id) {
      return repository.remove(id);
    },
    list(status = "all") {
      if (!["all", "active", "done"].includes(status)) throw new RangeError("Невідомий статус: " + status);
      return repository.all().filter((t) => status === "all" || (status === "done") === t.done);
    },
  };
}`,
  "js-di-container": raw`function createContainer() {
  const factories = new Map();
  const instances = new Map();
  const resolving = [];
  const container = {
    register(name, factory) {
      factories.set(name, factory);
    },
    resolve(name) {
      if (instances.has(name)) return instances.get(name);
      if (!factories.has(name)) throw new Error("Невідома залежність: " + name);
      if (resolving.includes(name)) throw new Error("Циклічна залежність: " + [...resolving, name].join(" -> "));
      resolving.push(name);
      try {
        const instance = factories.get(name)(container);
        instances.set(name, instance);
        return instance;
      } finally {
        resolving.pop();
      }
    },
  };
  return container;
}`,
  "js-event-emitter": raw`class Emitter {
  #listeners = new Map();

  on(name, fn) {
    if (typeof fn !== "function") throw new TypeError("Слухач має бути функцією");
    if (!this.#listeners.has(name)) this.#listeners.set(name, []);
    this.#listeners.get(name).push(fn);
    return this;
  }

  off(name, fn) {
    const list = this.#listeners.get(name);
    if (!list) return this;
    const index = list.findIndex((l) => l === fn || l.original === fn);
    if (index !== -1) list.splice(index, 1);
    return this;
  }

  once(name, fn) {
    if (typeof fn !== "function") throw new TypeError("Слухач має бути функцією");
    const wrapper = (...args) => {
      this.off(name, wrapper);
      fn(...args);
    };
    wrapper.original = fn;
    return this.on(name, wrapper);
  }

  emit(name, ...args) {
    const list = this.#listeners.get(name);
    if (!list || list.length === 0) {
      if (name === "error") throw args[0] instanceof Error ? args[0] : new Error("Необроблена подія error");
      return false;
    }
    for (const listener of [...list]) listener(...args);
    return true;
  }

  listenerCount(name) {
    return this.#listeners.get(name)?.length ?? 0;
  }
}`,
  "js-store": raw`function createStore(reducer, initialState) {
  let state = initialState === undefined ? reducer(undefined, { type: "@@init" }) : initialState;
  const listeners = new Set();
  return {
    getState: () => state,
    dispatch(action) {
      if (!action || typeof action !== "object" || typeof action.type !== "string") {
        throw new TypeError("Дія має бути об'єктом з рядковим полем type");
      }
      const next = reducer(state, action);
      if (next === undefined) throw new Error("Редюсер не повернув стан для дії " + action.type);
      if (next !== state) {
        state = next;
        for (const listener of [...listeners]) listener(state);
      }
      return action;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function combineReducers(reducers) {
  return (state = {}, action) => {
    let changed = false;
    const next = {};
    for (const [key, reducer] of Object.entries(reducers)) {
      next[key] = reducer(state[key], action);
      if (next[key] !== state[key]) changed = true;
    }
    return changed ? next : state;
  };
}`,
  "js-pricing-strategies": raw`function createPricer() {
  const strategies = new Map();
  const round = (x) => Math.round(x * 100) / 100;
  const pricer = {
    register(name, fn) {
      if (strategies.has(name)) throw new Error("Стратегія вже зареєстрована: " + name);
      strategies.set(name, fn);
    },
    calculate(name, order) {
      const fn = strategies.get(name);
      if (!fn) throw new RangeError("Невідома стратегія: " + name);
      return round(fn(order));
    },
    names() {
      return [...strategies.keys()];
    },
  };
  pricer.register("regular", ({ price, qty }) => price * qty);
  pricer.register("bulk", ({ price, qty }) => (qty >= 10 ? price * qty * 0.9 : price * qty));
  pricer.register("coupon", ({ price, qty, percent }) => {
    if (!(percent >= 0 && percent <= 100)) throw new RangeError("Відсоток має бути від 0 до 100");
    return price * qty * (1 - percent / 100);
  });
  return pricer;
}`,
  "js-feature-flags": raw`function mergeConfig(...layers) {
  const isPlain = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const merge = (a, b) => {
    const out = { ...a };
    for (const [key, value] of Object.entries(b)) {
      out[key] = isPlain(value) ? merge(isPlain(a[key]) ? a[key] : {}, value) : value;
    }
    return out;
  };
  return layers.reduce(merge, {});
}

function createFlags(config) {
  const bucket = (name, userId) => {
    let hash = 0;
    for (const ch of name + ":" + userId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return hash % 100;
  };
  return {
    isEnabled(name, userId) {
      const flag = config[name];
      if (!flag || !flag.enabled) return false;
      if (flag.users?.includes(userId)) return true;
      if (flag.rollout === undefined) return true;
      return bucket(name, userId) < flag.rollout;
    },
  };
}`,
};
