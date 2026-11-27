const raw = String.raw;

export const SOLUTIONS_10 = {
  "js-parse-http": raw`function parseResponse(raw) {
  const split = raw.indexOf("\r\n\r\n");
  const head = split === -1 ? raw : raw.slice(0, split);
  const body = split === -1 ? "" : raw.slice(split + 4);
  const [statusLine, ...headerLines] = head.split("\r\n");
  const [, code, ...text] = statusLine.split(" ");
  const headers = {};
  for (const line of headerLines) {
    if (!line) continue;
    const i = line.indexOf(":");
    headers[line.slice(0, i).toLowerCase()] = line.slice(i + 1).trim();
  }
  return { status: Number(code), statusText: text.join(" "), headers, body };
}

function statusClass(code) {
  if (code >= 100 && code < 200) return "info";
  if (code >= 200 && code < 300) return "success";
  if (code >= 300 && code < 400) return "redirect";
  if (code >= 400 && code < 500) return "client-error";
  if (code >= 500 && code < 600) return "server-error";
  return "unknown";
}`,
  "js-fetch-json": raw`async function getJson(fetchFn, url) {
  const response = await fetchFn(url);
  if (!response.ok) {
    const error = new Error("HTTP " + response.status);
    error.status = response.status;
    throw error;
  }
  try {
    return await response.json();
  } catch {
    throw new Error("Некоректний JSON у відповіді");
  }
}`,
  "js-post-json": raw`async function postJson(fetchFn, url, data, headers = {}) {
  const response = await fetchFn(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let message = "HTTP " + response.status;
    try {
      const payload = await response.json();
      if (payload && typeof payload.error === "string") message = payload.error;
    } catch {
      // тіло не є JSON: лишаємо повідомлення зі статусом
    }
    throw new Error(message);
  }
  return response.json();
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
  "js-render-list": raw`function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

function renderList(items) {
  const rows = items.map(({ text, done }) => "<li" + (done ? ' class="done"' : "") + ">" + escapeHtml(text) + "</li>");
  return "<ul>" + rows.join("") + "</ul>";
}`,
  "js-validate-form": raw`function validateForm(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const value = values[field];
    const empty = value === undefined || value === null || String(value).trim() === "";
    if (empty) {
      if (rule.required) errors[field] = "Поле обов'язкове";
      continue;
    }
    if (rule.min !== undefined && Number(value) < rule.min) errors[field] = "Мінімум " + rule.min;
    else if (rule.pattern && !rule.pattern.test(String(value))) errors[field] = "Некоректний формат";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}`,
  "js-request-cache": raw`function createCachedFetcher(load, { ttlMs, now = () => Date.now() } = {}) {
  const cache = new Map();
  const inflight = new Map();
  return {
    get(key) {
      const entry = cache.get(key);
      if (entry && now() - entry.savedAt < ttlMs) return Promise.resolve(entry.value);
      if (inflight.has(key)) return inflight.get(key);
      const promise = Promise.resolve()
        .then(() => load(key))
        .then((value) => {
          cache.set(key, { value, savedAt: now() });
          return value;
        })
        .finally(() => inflight.delete(key));
      inflight.set(key, promise);
      return promise;
    },
    clear() {
      cache.clear();
      inflight.clear();
    },
  };
}`,
  "js-router": raw`function createRouter() {
  const routes = [];
  const compile = (pattern) => {
    const names = [];
    const source = pattern
      .split("/")
      .map((part) => {
        if (part.startsWith(":")) {
          names.push(part.slice(1));
          return "([^/]+)";
        }
        return part.replace(/[.*+?^$()[\]{}|\\]/g, "\\$&");
      })
      .join("/");
    return { regex: new RegExp("^" + source + "$"), names };
  };
  return {
    add(method, pattern, handler) {
      routes.push({ method: method.toUpperCase(), handler, ...compile(pattern) });
    },
    handle(method, url) {
      const parsed = new URL(url, "http://localhost");
      const wanted = method.toUpperCase();
      const allow = [];
      for (const route of routes) {
        const match = route.regex.exec(parsed.pathname);
        if (!match) continue;
        if (route.method !== wanted) {
          allow.push(route.method);
          continue;
        }
        const params = Object.fromEntries(route.names.map((name, i) => [name, match[i + 1]]));
        const query = Object.fromEntries(parsed.searchParams);
        return { status: 200, body: route.handler({ params, query }) };
      }
      return allow.length > 0 ? { status: 405, allow: [...new Set(allow)] } : { status: 404 };
    },
  };
}`,
};
