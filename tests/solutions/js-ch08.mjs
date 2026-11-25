const raw = String.raw;

export const SOLUTIONS_08 = {
  "js-dates": raw`function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

function isWeekend(dateStr) {
  const d = new Date(dateStr).getUTCDay();
  return d === 0 || d === 6;
}`,
  "js-format-in-zone": raw`function formatInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  return get("year") + "-" + get("month") + "-" + get("day") + " " + get("hour") + ":" + get("minute");
}`,
  "js-stringify-sorted": raw`function stringifySorted(value, space) {
  return JSON.stringify(
    value,
    (key, val) =>
      val && typeof val === "object" && !Array.isArray(val)
        ? Object.fromEntries(Object.entries(val).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
        : val,
    space,
  );
}`,
  "js-seeded-random": raw`function createRng(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function shuffle(items, rng) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}`,
  "js-regex-basics": raw`function extractHashtags(text) {
  const tags = [];
  for (const m of text.matchAll(/#([\p{L}\p{N}_]+)/gu)) {
    const tag = m[1].toLowerCase();
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
}

function isHexColor(str) {
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(str);
}`,
  "js-regex-advanced": raw`function reorderDates(text) {
  return text.replace(
    /(?<![\d-])(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})(?![\d-])/g,
    "$<d>.$<m>.$<y>",
  );
}

function addThousands(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function repeatedWords(text) {
  const found = [];
  for (const m of text.matchAll(/(?<!\p{L})(\p{L}+)\s+\1(?!\p{L})/giu)) {
    found.push(m[1].toLowerCase());
  }
  return found;
}`,
  "js-build-url": raw`function buildUrl(base, path, params = {}) {
  const baseWithSlash = base.endsWith("/") ? base : base + "/";
  const url = new URL(path.replace(/^\/+/, ""), baseWithSlash);
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else {
      url.searchParams.append(key, String(value));
    }
  }
  return url.href;
}

function parseQuery(url) {
  const result = {};
  for (const [key, value] of new URL(url).searchParams) {
    if (!(key in result)) result[key] = value;
    else if (Array.isArray(result[key])) result[key].push(value);
    else result[key] = [result[key], value];
  }
  return result;
}`,
  "js-unicode-kit": raw`function countGraphemes(str) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  let count = 0;
  for (const _ of segmenter.segment(str)) count++;
  return count;
}

function byteLength(str) {
  return new TextEncoder().encode(str).length;
}

function sameText(a, b) {
  return a.normalize("NFC") === b.normalize("NFC");
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
  "js-pluralize-uk": raw`const pluralRules = new Intl.PluralRules("uk");
const relativeFormat = new Intl.RelativeTimeFormat("uk", { numeric: "auto" });

function pluralize(n, forms) {
  switch (pluralRules.select(n)) {
    case "one":
      return forms[0];
    case "few":
      return forms[1];
    case "many":
      return forms[2];
    default:
      return forms[3] ?? forms[1];
  }
}

function relativeDays(n) {
  return relativeFormat.format(n, "day");
}`,
  "js-date-math": raw`function addDays(iso, n) {
  const date = new Date(iso + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
}

function startOfWeek(iso) {
  const day = new Date(iso + "T00:00:00Z").getUTCDay();
  const offset = (day + 6) % 7;
  return addDays(iso, -offset);
}`,
  "js-month-days": raw`function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year, month) {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError("Місяць має бути від 1 до 12");
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function isRealDate(year, month, day) {
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  return Number.isInteger(day) && day >= 1 && day <= daysInMonth(year, month);
}`,
};
