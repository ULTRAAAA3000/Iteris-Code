const raw = String.raw;

export const SOLUTIONS_03 = {
  "js-array-rotate": raw`function rotate(arr, k) {
  if (arr.length === 0) return [];
  const shift = ((k % arr.length) + arr.length) % arr.length;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
}`,
  "js-chunk-unique": raw`function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function unique(arr) {
  return [...new Set(arr)];
}`,
  "js-adult-names": raw`function adultNames(users) {
  return users.filter((u) => u.age >= 18).map((u) => u.name);
}

function findById(users, id) {
  return users.find((u) => u.id === id) ?? null;
}`,
  "js-order-stats": raw`function orderStats(items) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const hasFree = items.some((i) => i.price === 0);
  return { total, count, hasFree };
}`,
  "js-pick-omit": raw`function pick(obj, keys) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));
}

function omit(obj, keys) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));
}`,
  "js-immutable-update": raw`function updateCity(user, city) {
  return { ...user, address: { ...user.address, city } };
}

function addItem(list, item) {
  return [...list, item];
}`,
  "js-word-map": raw`function wordFrequency(text) {
  const map = new Map();
  for (const word of text.toLowerCase().split(/\s+/).filter(Boolean)) {
    map.set(word, (map.get(word) || 0) + 1);
  }
  return map;
}`,
  "js-sort-people": raw`function sortPeople(people) {
  return [...people].sort((a, b) => b.age - a.age || a.name.localeCompare(b.name, "uk"));
}`,
  "js-modern-arrays": raw`function replaceAt(arr, index, value) {
  return arr.with(index, value);
}

function topScores(scores, n) {
  return scores.toSorted((a, b) => b - a).slice(0, n);
}`,
  "js-count-nodes": raw`function countNodes(start) {
  const seen = new Set();
  const stack = [start];
  while (stack.length > 0) {
    const node = stack.pop();
    if (seen.has(node)) continue;
    seen.add(node);
    for (const next of node.links) stack.push(next);
  }
  return seen.size;
}`,
  "js-hex-bytes": raw`function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(text) {
  const bytes = new Uint8Array(text.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(text.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}`,
  "js-group-by": raw`function groupBy(list, key) {
  const out = {};
  for (const item of list) {
    if (!(key in item)) continue;
    (out[item[key]] ??= []).push(item);
  }
  return out;
}`,
};
