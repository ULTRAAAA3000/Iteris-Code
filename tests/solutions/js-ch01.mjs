const raw = String.raw;

export const SOLUTIONS_01 = {
  "js-hello-default": raw`function hello(name = "світе") {
  return "Привіт, " + name + "!";
}`,
  "js-join-log": raw`function joinLog(...parts) {
  return parts.map(String).join(" ");
}`,
  "js-parse-import": raw`function parseImport(line) {
  const m = /^\s*import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']\s*;?\s*$/.exec(line);
  if (!m) return null;
  const names = m[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean);
  return { source: m[2], names };
}`,
  "js-parse-stack": raw`function parseStackLine(line) {
  const m = /^\s*at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?\s*$/.exec(line);
  if (!m) return null;
  return { fn: m[1] ?? null, file: m[2], line: Number(m[3]), col: Number(m[4]) };
}`,
};
