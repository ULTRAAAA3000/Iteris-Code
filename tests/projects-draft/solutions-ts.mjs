// Еталонні розв'язки чернеток проєктів TypeScript: повний код користувача (без harness).
const raw = String.raw;

export default {
  "ts-order-calc": raw`type Discount = "NONE" | "STUDENT" | "VIP";

type Item =
  | { kind: "product"; name: string; price: number; qty: number }
  | { kind: "service"; name: string; hours: number; rate: number };

function lineTotal(item: Item): number {
  if (item.kind === "product") {
    if (!Number.isInteger(item.qty) || item.qty <= 0 || item.price < 0) throw new RangeError("некоректний товар: " + item.name);
    return item.price * item.qty;
  }
  if (!(item.hours > 0) || item.rate < 0) throw new RangeError("некоректна послуга: " + item.name);
  return item.hours * item.rate;
}

function discountRate(d: Discount): number {
  switch (d) {
    case "NONE":
      return 0;
    case "STUDENT":
      return 0.1;
    case "VIP":
      return 0.2;
  }
}

function orderTotal(items: Item[], d: Discount): number {
  const sum = items.reduce((acc, it) => acc + lineTotal(it), 0);
  return Math.round(sum * (1 - discountRate(d)) * 100) / 100;
}

function describe(item: Item): string {
  const total = lineTotal(item).toFixed(2) + " грн";
  return item.kind === "product" ? item.name + " ×" + item.qty + " = " + total : item.name + ", " + item.hours + " год = " + total;
}

function mostExpensive(items: Item[]): Item | undefined {
  let best: Item | undefined;
  for (const it of items) {
    if (best === undefined || lineTotal(it) > lineTotal(best)) best = it;
  }
  return best;
}
`,

  "ts-repository": raw`interface Entity {
  id: number;
}

interface Task extends Entity {
  title: string;
  done: boolean;
  tags: string[];
}

class Repository<T extends Entity> {
  private items: T[] = [];
  private nextId = 1;

  add(item: Omit<T, "id">): T {
    const saved = { ...item, id: this.nextId++ } as unknown as T;
    this.items.push(saved);
    return saved;
  }

  get(id: number): T | undefined {
    return this.items.find((x) => x.id === id);
  }

  update(id: number, patch: Partial<Omit<T, "id">>): T {
    const i = this.items.findIndex((x) => x.id === id);
    if (i === -1) throw new Error("запис " + id + " не знайдено");
    const updated = { ...this.items[i], ...patch, id } as T;
    this.items[i] = updated;
    return updated;
  }

  remove(id: number): boolean {
    const i = this.items.findIndex((x) => x.id === id);
    if (i === -1) return false;
    this.items.splice(i, 1);
    return true;
  }

  find(pred: (item: T) => boolean): T[] {
    return this.items.filter(pred);
  }

  all(): readonly T[] {
    return [...this.items];
  }

  count(): number {
    return this.items.length;
  }
}
`,

  "ts-api-parser": raw`interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const ROLES = ["admin", "editor", "viewer"] as const;
const FIELDS = ["id", "name", "email", "role"];

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function validField(o: Record<string, unknown>, f: string): boolean {
  const v = o[f];
  switch (f) {
    case "id":
      return typeof v === "number" && Number.isInteger(v) && v > 0;
    case "name":
      return typeof v === "string" && v.trim() !== "";
    case "email":
      return typeof v === "string" && /^[^@\s]+@[^@\s]+$/.test(v);
    case "role":
      return typeof v === "string" && (ROLES as readonly string[]).includes(v);
    default:
      return false;
  }
}

function isUser(x: unknown): x is User {
  return isObject(x) && FIELDS.every((f) => validField(x, f));
}

function parseUser(x: unknown): Result<User> {
  if (!isObject(x)) return { ok: false, error: "не об'єкт" };
  for (const f of FIELDS) {
    if (!validField(x, f)) return { ok: false, error: "невірне поле: " + f };
  }
  return { ok: true, value: x as unknown as User };
}

function parseUsers(json: string): Result<User[]> {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return { ok: false, error: "некоректний JSON" };
  }
  if (!Array.isArray(data)) return { ok: false, error: "очікувався масив" };
  const users: User[] = [];
  for (let i = 0; i < data.length; i++) {
    const r = parseUser(data[i]);
    if (!r.ok) return { ok: false, error: "елемент " + i + ": " + r.error };
    users.push(r.value);
  }
  return { ok: true, value: users };
}

function groupByRole(users: User[]): Record<User["role"], User[]> {
  const g: Record<User["role"], User[]> = { admin: [], editor: [], viewer: [] };
  for (const u of users) g[u.role].push(u);
  return g;
}

function unwrapOr<T>(r: Result<T>, fallback: T): T {
  return r.ok ? r.value : fallback;
}
`,
};
