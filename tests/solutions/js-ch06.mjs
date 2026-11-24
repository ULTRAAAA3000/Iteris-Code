const raw = String.raw;

export const SOLUTIONS_06 = {
  "js-parse-quantity": raw`function parseQuantity(value) {
  if (typeof value !== "number") {
    throw new TypeError("Кількість має бути числом, отримано: " + String(value));
  }
  if (!Number.isInteger(value) || value < 1 || value > 100) {
    throw new RangeError("Кількість має бути цілим від 1 до 100, отримано: " + value);
  }
  return value;
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
  "js-custom-errors": raw`class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(resource) {
    super(resource + " не знайдено");
    this.name = "NotFoundError";
    this.resource = resource;
  }
}

function describeError(error) {
  if (error instanceof ValidationError) return "Поле " + error.field + ": " + error.message;
  if (error instanceof NotFoundError) return "Не знайдено: " + error.resource;
  if (error instanceof Error) return "Помилка: " + error.message;
  return "Невідома помилка";
}

function withContext(message, cause) {
  return new Error(message, { cause });
}`,
  "js-first-success": raw`async function firstSuccess(tasks) {
  const errors = [];
  for (const task of tasks) {
    try {
      return await task();
    } catch (error) {
      errors.push(error);
    }
  }
  throw new AggregateError(errors, "Усі джерела недоступні");
}`,
  "js-safe-async": raw`async function attempt(fn) {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    return { ok: false, error };
  }
}

async function collectResults(items, asyncFn) {
  const values = [];
  const errors = [];
  for (const item of items) {
    const result = await attempt(() => asyncFn(item));
    if (result.ok) values.push(result.value);
    else errors.push({ item, error: result.error });
  }
  return { values, errors };
}`,
  "js-serialize-error": raw`function serializeError(value) {
  if (!(value instanceof Error)) return { name: "NonError", message: String(value) };
  const result = { name: value.name, message: value.message, stack: value.stack };
  if (value.cause !== undefined) result.cause = serializeError(value.cause);
  if (value instanceof AggregateError) result.errors = value.errors.map(serializeError);
  return result;
}`,
  "js-result-type": raw`const ok = (value) => ({ ok: true, value });
const err = (error) => ({ ok: false, error });

function mapResult(result, fn) {
  return result.ok ? ok(fn(result.value)) : result;
}

function unwrapOr(result, fallback) {
  return result.ok ? result.value : fallback;
}

function parseJsonResult(text) {
  try {
    return ok(JSON.parse(text));
  } catch (error) {
    return err(error.message);
  }
}`,
};
